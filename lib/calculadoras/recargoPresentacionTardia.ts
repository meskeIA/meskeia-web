/**
 * Calculadora de Recargo por Presentación Fuera de Plazo — lógica pura
 * Usada por: MCP server (calcular_recargo_presentacion_tardia)
 *
 * Calcula el recargo extemporáneo por presentación de declaraciones tributarias
 * fuera del plazo legal sin requerimiento previo de la Administración (LGT art. 27).
 *
 * Escala de recargos (LGT art. 27.2, reforma Ley 11/2021) — TEXTO LITERAL:
 *   «El recargo será un porcentaje igual al 1 por ciento MÁS otro 1 por ciento
 *    adicional por cada mes completo de retraso»
 *   - Antes de 12 meses: 1% base + 1% por cada mes completo
 *     * < 1 mes: 1% | 1 mes: 2% | 2 meses: 3% | … | 11 meses: 12%
 *   - Transcurridos 12 meses: 15% + intereses de demora (desde el día 366)
 *
 * ⚠️ CORREGIDO EL 07/09/2026 — faltaba el 1% base. El motor calculaba
 * `meses × 1%`, un punto porcentual POR DEBAJO de la ley en toda la escala, y
 * devolvía 0% —«no hay recargo»— para un retraso de menos de un mes, donde el
 * art. 27.2 exige 1%. Se coló el 27/08/2026 al reparar los hallazgos 436 y 454
 * del Inspector: se sustituyó la escala derogada (5/10/15/20%) por la de la Ley
 * 11/2021 y en el mismo movimiento se dejó fuera el 1% base. Lo delató que
 * `app/calendario-fiscal-emprendedor/metadata.ts` sí lo decía bien.
 *
 * Reducción del 25% si se paga en período voluntario (LGT art. 27.5):
 *   «El importe de LOS RECARGOS a que se refiere el apartado 2 anterior se
 *    reducirá en el 25 por ciento»
 *   ⚠️ CORREGIDO EL 07/09/2026 — se aplicaba también sobre los intereses de
 *   demora. La reducción es del RECARGO: los intereses del art. 27.2 se exigen
 *   aparte y no se reducen. Solo afectaba al tramo de más de 12 meses.
 *
 * Interés de demora tributario: NO se escribe aquí. Se importa de
 * `data/fiscal/intereses.ts` (LGT art. 26: interés legal + 25%), que es el que
 * vigila el ciclo fiscal mensual. Hasta el 07/09/2026 vivía a mano como
 * `4.0625` con sello de enero de 2025: el valor era correcto, pero el día que
 * cambie el interés legal este motor se habría quedado atrás en silencio.
 *   Solo aplica si el retraso supera 12 meses (sobre la cuota desde el día 366)
 *
 * DIFERENCIA CON SANCIONES:
 *   El recargo extemporáneo NO es una sanción. Es compatible con él, pero
 *   si la presentación se realiza voluntariamente antes de requerimiento,
 *   NO se pueden aplicar sanciones (LGT art. 27.1).
 *
 * Fuente: art. 27 LGT (Ley 58/2003), redacción del art. 13.3 de la Ley 11/2021
 *   — BOE-A-2021-11473, vigente desde el 11/07/2021. Texto consolidado leído en
 *   sesión el 07/09/2026 vía la API de legislación consolidada del BOE.
 * Verificado: 2026-09-07
 *
 * Encadenable con: calcular_sancion_tributaria, calcular_pago_aplazado_aeat, calcular_interes_demora
 */

import { INTERES_DEMORA_TRIBUTARIO_2025 } from '@/data/fiscal';

// ─── Constantes (art. 27 LGT) ──────────────────────────────────────────────────

const PCT_RECARGO_BASE = 1;              // % fijo de partida (art. 27.2, primer inciso)
const PCT_RECARGO_POR_MES = 1;           // % adicional por cada mes completo
const MESES_ESCALA_PROPORCIONAL = 12;    // transcurridos estos meses, se va al recargo fijo
const PCT_RECARGO_MAS_12_MESES = 15;     // % fijo una vez transcurridos 12 meses
const PCT_REDUCCION_PRONTO_PAGO = 25;    // % de reducción si paga en voluntario (art. 27.5)

/** Interés de demora tributario vigente (%). Fuente única: data/fiscal/intereses.ts */
const TIPO_INTERES_DEMORA_ANUAL = INTERES_DEMORA_TRIBUTARIO_2025.tipo;

/**
 * La escala, expuesta para que ninguna app la vuelva a escribir a mano.
 *
 * ── Por qué (27/08/2026) ──────────────────────────────────────────────────────
 * Los hallazgos 436 y 454 del Inspector encontraron «recargos del 5% al 20%» en el
 * bloque educativo de dos apps del clúster de compraventa: la escala ANTERIOR a la
 * Ley 11/2021, que sobre un ITP de 1.500 € hace temer 75 € donde el art. 27.2 LGT
 * cobra 15 €. Aquel número no salía de ningún módulo, así que nada podía avisar de
 * que había envejecido. Quien necesite el TEXTO de la escala lo compone desde aquí.
 *
 * ⚠️ 07/09/2026 — esta constante nació aquel día CON EL 1% BASE FUERA. Al componer
 * un texto desde aquí, usar `porcentajeBase` + `porcentajePorMes`: el recargo NO es
 * «1% por mes», es «1% más 1% por cada mes completo».
 */
export const ESCALA_RECARGO_EXTEMPORANEO = {
  /** % fijo de partida, se debe desde el primer día de retraso (art. 27.2 LGT) */
  porcentajeBase: PCT_RECARGO_BASE,
  /** % adicional por cada mes completo de retraso (art. 27.2 LGT) */
  porcentajePorMes: PCT_RECARGO_POR_MES,
  /** Meses transcurridos a partir de los cuales se aplica el recargo fijo */
  mesesEscalaProporcional: MESES_ESCALA_PROPORCIONAL,
  /** % fijo una vez transcurridos 12 meses, más intereses de demora */
  porcentajeMas12Meses: PCT_RECARGO_MAS_12_MESES,
  /** % de reducción si el recargo se paga en período voluntario (art. 27.5 LGT) */
  reduccionProntoPago: PCT_REDUCCION_PRONTO_PAGO,
  /** Interés de demora tributario anual (%) — de data/fiscal, no escrito aquí */
  interesDemoraAnual: TIPO_INTERES_DEMORA_ANUAL,
  baseNormativa: 'Art. 27.2 LGT (Ley 58/2003), redacción de la Ley 11/2021 (BOE-A-2021-11473)',
} as const;

/**
 * % de recargo para un número de meses completos de retraso, según el art. 27.2.
 * Se expone para que las apps no vuelvan a reconstruir la escala a mano.
 */
export function porcentajeRecargoExtemporaneo(mesesRetraso: number): number {
  if (mesesRetraso >= MESES_ESCALA_PROPORCIONAL) return PCT_RECARGO_MAS_12_MESES;
  return PCT_RECARGO_BASE + mesesRetraso * PCT_RECARGO_POR_MES;
}

// ─── Tipos públicos ────────────────────────────────────────────────────────────

export interface ParametrosRecargoPresentacionTardia {
  /** Cuota a ingresar fuera de plazo (€) */
  cuotaAIngresar: number;
  /** Meses completos de retraso desde el fin del plazo voluntario */
  mesesRetraso: number;
  /** ¿Va a pagar en el período voluntario abierto (reducción 25%)? */
  pagoEnVoluntario?: boolean;
  /** Días de retraso exactos (alternativa a meses, para cálculo preciso de intereses) */
  diasRetraso?: number;
}

export interface ResultadoRecargoPresentacionTardia {
  /** Cuota a ingresar (€) */
  cuotaAIngresar: number;
  /** Meses completos de retraso */
  mesesRetraso: number;
  /** ¿Aplica recargo proporcional (≤ 12 meses) o fijo + intereses (> 12 meses)? */
  tipoRecargo: 'proporcional' | 'fijo_con_intereses';
  /** Porcentaje de recargo antes de reducción (%) */
  porcentajeRecargo: number;
  /** Importe bruto del recargo antes de reducción (€) */
  recargoBruto: number;
  /** Intereses de demora desde el mes 13 (€) — solo si > 12 meses */
  interesesDemora: number;
  /** Total antes de reducción por pronto pago (€) */
  totalAntesReduccion: number;
  /** Reducción por pronto pago (25%) (€) */
  reduccionProntoPago: number;
  /** **Total a pagar (recargo + intereses - reducción) (€)** */
  totalAPagar: number;
  /** Deuda total (cuota + recargo + intereses - reducción) (€) */
  deudaTotalAPagar: number;
  /** Tipo de interés de demora aplicado (%) */
  tipoInteresDemora: number;
  /** Advertencias */
  advertencias: string[];
  /** Fuente normativa */
  fuenteDatos: string;
}

// ─── Función principal ─────────────────────────────────────────────────────────

export function calcularRecargoPresentacionTardia(p: ParametrosRecargoPresentacionTardia): ResultadoRecargoPresentacionTardia {
  if (p.cuotaAIngresar < 0) throw new Error('La cuota a ingresar no puede ser negativa.');
  if (p.mesesRetraso < 0) throw new Error('Los meses de retraso no pueden ser negativos.');

  const r = (n: number) => Math.round(n * 100) / 100;
  const advertencias: string[] = [];
  const pagoEnVoluntario = p.pagoEnVoluntario ?? true;

  // Determinar tipo de recargo y porcentaje
  let porcentajeRecargo: number;
  let tipoRecargo: 'proporcional' | 'fijo_con_intereses';
  let interesesDemora = 0;

  if (p.mesesRetraso < MESES_ESCALA_PROPORCIONAL) {
    // Art. 27.2: «1 por ciento MÁS otro 1 por ciento adicional por cada mes completo».
    // Con menos de un mes de retraso el recargo NO es cero: es el 1% base.
    tipoRecargo = 'proporcional';
    porcentajeRecargo = PCT_RECARGO_BASE + p.mesesRetraso * PCT_RECARGO_POR_MES;
  } else {
    // «Si la presentación se efectúa una vez TRANSCURRIDOS 12 meses […] el recargo
    // será del 15 por ciento». A los 12 meses cumplidos ya han transcurrido, así que
    // el corte es >= 12 y no > 12: con 11 meses completos la escala llega al 12%, y
    // de ahí salta al 15%.
    tipoRecargo = 'fijo_con_intereses';
    porcentajeRecargo = PCT_RECARGO_MAS_12_MESES;

    // Intereses de demora desde el día siguiente a los 12 meses hasta la presentación
    const mesesConIntereses = p.mesesRetraso - MESES_ESCALA_PROPORCIONAL;
    const diasConIntereses = p.diasRetraso ? Math.max(0, p.diasRetraso - 365) : mesesConIntereses * 30;
    interesesDemora = r(p.cuotaAIngresar * TIPO_INTERES_DEMORA_ANUAL / 100 * diasConIntereses / 365);
  }

  const recargoBruto = r(p.cuotaAIngresar * porcentajeRecargo / 100);
  const totalAntesReduccion = r(recargoBruto + interesesDemora);

  // Art. 27.5: se reduce «el importe de LOS RECARGOS a que se refiere el apartado 2».
  // Los intereses de demora NO son recargo y quedan fuera de la reducción.
  const reduccionProntoPago = pagoEnVoluntario ? r(recargoBruto * PCT_REDUCCION_PRONTO_PAGO / 100) : 0;
  const totalAPagar = r(totalAntesReduccion - reduccionProntoPago);
  const deudaTotalAPagar = r(p.cuotaAIngresar + totalAPagar);

  advertencias.push('Este recargo aplica cuando la presentación extemporánea se hace VOLUNTARIAMENTE, sin requerimiento previo de la Administración. Si hay requerimiento previo, se aplican sanciones (art. 191 LGT) en lugar del recargo.');
  advertencias.push(`Reducción del ${PCT_REDUCCION_PRONTO_PAGO}%: aplica si el importe del recargo se paga simultáneamente con la presentación o dentro del plazo abierto para ello (art. 27.5 LGT). No aplica si se aplaza el pago. La reducción recae sobre el recargo, no sobre los intereses de demora.`);
  if (tipoRecargo === 'fijo_con_intereses') {
    advertencias.push(`Transcurridos 12 meses: recargo fijo del ${PCT_RECARGO_MAS_12_MESES}% + intereses de demora al ${TIPO_INTERES_DEMORA_ANUAL}% anual desde el día 366 hasta la presentación.`);
  } else if (p.mesesRetraso === 0) {
    advertencias.push(`Aunque el retraso sea de pocos días, el recargo mínimo es del ${PCT_RECARGO_BASE}%: el art. 27.2 LGT fija un 1% de partida y añade otro 1% por cada mes completo cumplido.`);
  }
  advertencias.push('El recargo extemporáneo es independiente de la cuota principal, que debe ingresarse íntegramente. La cuota más el recargo son la deuda total a pagar.');
  advertencias.push('Desde la Ley 11/2021 el recargo es progresivo: 1% de partida más 1% por cada mes completo de retraso. Antes de esa reforma era escalonado (5%/10%/15%/20%). Las declaraciones presentadas desde 13/07/2021 aplican siempre el nuevo sistema, incluso para períodos anteriores si beneficia al contribuyente.');

  return {
    cuotaAIngresar: r(p.cuotaAIngresar),
    mesesRetraso: p.mesesRetraso,
    tipoRecargo,
    porcentajeRecargo,
    recargoBruto,
    interesesDemora,
    totalAntesReduccion,
    reduccionProntoPago,
    totalAPagar,
    deudaTotalAPagar,
    tipoInteresDemora: TIPO_INTERES_DEMORA_ANUAL,
    advertencias,
    fuenteDatos: 'Art. 27 LGT (Ley 58/2003), redacción de la Ley 11/2021 — BOE-A-2021-11473',
  };
}
