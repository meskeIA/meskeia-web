/**
 * Calculadora de Recargo por Presentación Fuera de Plazo — lógica pura
 * Usada por: MCP server (calcular_recargo_presentacion_tardia)
 *
 * Calcula el recargo extemporáneo por presentación de declaraciones tributarias
 * fuera del plazo legal sin requerimiento previo de la Administración (LGT art. 27).
 *
 * Escala de recargos (LGT art. 27.2, reforma Ley 11/2021):
 *   - Hasta 12 meses: 1% por mes completo de retraso (lineal)
 *     * 1 mes: 1% | 2 meses: 2% | ... | 12 meses: 12%
 *   - Más de 12 meses: 15% + intereses de demora (desde el mes 13)
 *
 * Reducción del 25% si se paga en período voluntario (LGT art. 27.5):
 *   Aplica si la liquidación se ingresa junto con la declaración extemporánea
 *   o si se paga en el plazo abierto para ello.
 *
 * Interés de demora 2025: 4,0625% anual (RD aprobación presupuestos)
 *   Tipo de demora tributaria = tipo legal + 25% = 3,25% + 25% = 4,0625%
 *   Solo aplica si el retraso supera 12 meses (sobre la cuota desde el mes 13)
 *
 * DIFERENCIA CON SANCIONES:
 *   El recargo extemporáneo NO es una sanción. Es compatible con él, pero
 *   si la presentación se realiza voluntariamente antes de requerimiento,
 *   NO se pueden aplicar sanciones (LGT art. 27.1).
 *
 * Fuente: LGT art. 27 (Ley 58/2003, redacción Ley 11/2021) — vigente 2025
 * Verificado: 2025-01-15
 *
 * Encadenable con: calcular_sancion_tributaria, calcular_pago_aplazado_aeat, calcular_interes_demora
 */

// ─── Constantes 2025 ────────────────────────────────────────────────────────────

const PCT_RECARGO_POR_MES = 1;           // % por cada mes completo (hasta 12 meses)
const PCT_RECARGO_MAS_12_MESES = 15;     // % fijo si pasa de 12 meses
const TIPO_INTERES_DEMORA_ANUAL = 4.0625; // % (2025)
const PCT_REDUCCION_PRONTO_PAGO = 25;    // % de reducción si paga en voluntario

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

  if (p.mesesRetraso <= 12) {
    tipoRecargo = 'proporcional';
    porcentajeRecargo = p.mesesRetraso * PCT_RECARGO_POR_MES;
  } else {
    tipoRecargo = 'fijo_con_intereses';
    porcentajeRecargo = PCT_RECARGO_MAS_12_MESES;

    // Intereses de demora desde el mes 13 hasta la presentación
    const mesesConIntereses = p.mesesRetraso - 12;
    const diasConIntereses = p.diasRetraso ? Math.max(0, p.diasRetraso - 365) : mesesConIntereses * 30;
    interesesDemora = r(p.cuotaAIngresar * TIPO_INTERES_DEMORA_ANUAL / 100 * diasConIntereses / 365);
  }

  const recargoBruto = r(p.cuotaAIngresar * porcentajeRecargo / 100);
  const totalAntesReduccion = r(recargoBruto + interesesDemora);

  const reduccionProntoPago = pagoEnVoluntario ? r(totalAntesReduccion * PCT_REDUCCION_PRONTO_PAGO / 100) : 0;
  const totalAPagar = r(totalAntesReduccion - reduccionProntoPago);
  const deudaTotalAPagar = r(p.cuotaAIngresar + totalAPagar);

  advertencias.push('Este recargo aplica cuando la presentación extemporánea se hace VOLUNTARIAMENTE, sin requerimiento previo de la Administración. Si hay requerimiento previo, se aplican sanciones (art. 191 LGT) en lugar del recargo.');
  advertencias.push(`Reducción del ${PCT_REDUCCION_PRONTO_PAGO}%: aplica si el importe del recargo se paga simultáneamente con la presentación o dentro del plazo abierto para ello (art. 27.5 LGT). No aplica si se aplaza el pago.`);
  if (tipoRecargo === 'fijo_con_intereses') {
    advertencias.push(`Retraso superior a 12 meses: recargo fijo del ${PCT_RECARGO_MAS_12_MESES}% + intereses de demora al ${TIPO_INTERES_DEMORA_ANUAL}% anual desde el día 366 hasta la presentación.`);
  }
  advertencias.push('El recargo extemporáneo es independiente de la cuota principal, que debe ingresarse íntegramente. La cuota más el recargo son la deuda total a pagar.');
  advertencias.push('Desde la Ley 11/2021, el recargo es lineal (1%/mes). Antes de esa reforma era escalonado (5%/10%/15%/20%). Las declaraciones presentadas desde 13/07/2021 aplican siempre el nuevo sistema, incluso para períodos anteriores si beneficia al contribuyente.');

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
    fuenteDatos: 'LGT art. 27 (Ley 58/2003, redacción Ley 11/2021) — vigente 2025',
  };
}
