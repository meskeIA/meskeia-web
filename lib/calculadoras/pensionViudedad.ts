/**
 * Calculadora de Pensión de Viudedad — lógica pura sin React ni DOM
 * Usada por: app/estimador-pension-viudedad y MCP server (calcular_pension_viudedad)
 *
 * Orientativa según LGSS arts. 219-231 (RDL 8/2015).
 * Fuente normativa: PENSION_VIUDEDAD_2026, MINIMOS_VIUDEDAD_2026, COMPLEMENTO_MINIMOS_LIMITES_2026
 * y TOPE_COMPLEMENTO_MINIMOS_2026 de data/fiscal/pensiones.ts; IRPF de data/fiscal/irpf.ts.
 *
 * ⚠️ 2026-10-04 (hallazgos 2811, 2812 y 2815 del Inspector): la app y este motor tenían cada uno
 *    su copia del cálculo, con los mismos tres defectos: completaban SIEMPRE hasta la cuantía
 *    mínima (sin prueba de rentas ni tope de la PNC), aplicaban una retención inventada
 *    (0 / 8 / 12 % con escalón en 15.000 €) y, aquí, el mínimo miraba la edad antes que las
 *    cargas familiares. Ahora la app llama a este motor y solo hay una copia.
 *
 * ⚠️ 2026-10-22 (cabo C0368): el 70 % se daba con «cargas» e ingresos propios < 75 % del SMI.
 *    El art. 31.2 del Decreto 3158/1966 (BOE-A-1966-21116), releído en el BOE ese día, pide tres
 *    cosas a la vez, y el 31.3 recorta:
 *    (a) cargas familiares: convivir con hijos menores de 26 o mayores incapacitados, o menores
 *        acogidos, y que la renta de la unidad familiar, «incluido el pensionista», «dividida
 *        entre el número de miembros», no pase del 75 % del SMI sin la parte proporcional de dos
 *        pagas extra (en cómputo anual: 75 % × SMI mensual × 12);
 *    (b) que la pensión «constituya la principal o única fuente de ingresos»: al menos el 50 % de
 *        los ingresos totales del pensionista (pensión ≥ resto de sus rendimientos);
 *    (c) que sus rendimientos anuales («del trabajo como del capital, así como los de naturaleza
 *        prestacional», del ejercicio anterior) no pasen del límite del complemento a mínimos más
 *        la pensión mínima de viudedad «en función de la edad del pensionista»;
 *    31.3: si pensión al 70 % + rendimientos excede ese límite, la pensión se reduce hasta no
 *    superarlo. Dos lecturas que la norma no fija, DECIDIDAS por el usuario el 22/10/2026: la
 *    renta de la unidad familiar va SIN la propia pensión de viudedad, y el recorte del 31.3
 *    nunca deja la pensión por debajo de la del 52 % (solo limita la aplicación del 70 %).
 *    Lecturas propias, a la letra: (b) se mide con la pensión al 70 % antes del recorte, y el
 *    mínimo «en función de la edad» es el del tramo de edad (no la fila «con cargas»).
 */

import {
  PENSION_VIUDEDAD_2026, FISCAL_PENSIONES_META, minimoViudedad2026,
  COMPLEMENTO_MINIMOS_LIMITES_2026, TOPE_COMPLEMENTO_MINIMOS_2026,
  MINIMOS_IRPF_2025, calcularRendimientoNetoTrabajo, calcularCuotaIntegraGeneral,
} from '@/data/fiscal';

// ─── Tipos públicos ────────────────────────────────────────────────────────────

export type SituacionCausante = 'activo' | 'jubilado' | 'no-alta';

/**
 * Qué ha pasado con el complemento a mínimos:
 * - 'noHaceFalta': la pensión ya llega a la cuantía mínima
 * - 'integro': se completa hasta la mínima (rentas bajo el límite)
 * - 'diferencial': rentas sobre el límite, solo la diferencia del art. 9.2 RD 241/2026
 * - 'tope': el complemento se queda en la PNC (art. 59.4 LGSS) y no llega a la mínima
 * - 'rentas': rentas tan por encima del límite que no queda complemento
 */
export type EstadoComplemento = 'noHaceFalta' | 'integro' | 'diferencial' | 'tope' | 'rentas';

export interface ParametrosPensionViudedad {
  /**
   * Situación del causante (fallecido) en el momento del fallecimiento:
   * - 'activo': en activo / de alta en SS
   * - 'jubilado': ya percibía pensión de jubilación
   * - 'no-alta': no estaba de alta (requiere períodos mínimos cotizados)
   */
  situacionCausante: SituacionCausante;
  /**
   * Base de cotización media mensual del causante en los últimos 2 años (€).
   * Solo para 'activo' y 'no-alta'.
   */
  baseCotizacionMedia?: number;
  /**
   * Pensión de jubilación del causante (€/mes).
   * Solo para 'jubilado'.
   */
  pensionCausante?: number;
  /** Edad del beneficiario (viudo/a) en años */
  edadBeneficiario: number;
  /**
   * Si el beneficiario convive con hijos menores de 26 años o mayores incapacitados, o con
   * menores acogidos. Para el 70 % hace falta además la prueba de renta de la unidad familiar.
   */
  tieneCargas?: boolean;
  /**
   * Ingresos propios del beneficiario sin la pensión de viudedad: trabajo, capital y otras
   * prestaciones (€/mes, con las pagas extra prorrateadas: se anualizan × 12).
   * Determinan el acceso a los porcentajes del 60 % y 70 % y al complemento a mínimos.
   */
  ingresosMensualesPropios?: number;
  /**
   * Renta anual de toda la unidad familiar, incluidos los ingresos del beneficiario y SIN la
   * pensión de viudedad (€/año). Solo cuenta con `tieneCargas`: sin ella no se puede comprobar
   * el 70 %. Si es menor que los ingresos propios anualizados, se toman estos.
   */
  rentaAnualUnidadFamiliar?: number;
  /** Personas de la unidad familiar, incluido el beneficiario (mínimo 2 con cargas). */
  miembrosUnidadFamiliar?: number;
}

export interface ResultadoPensionViudedad {
  /** Base reguladora calculada (€/mes) */
  baseReguladora: number;
  /** Porcentaje aplicado sobre la base reguladora (52, 60 o 70) */
  porcentajeAplicable: number;
  /** Explicación del porcentaje aplicado */
  razonPorcentaje: string;
  /** Pensión bruta calculada (€/mes), ya con el recorte del art. 31.3 si lo hay */
  pensionBruta: number;
  /** Lo que el art. 31.3 recorta de la pensión al 70 % (€/mes); 0 si no hay recorte */
  recorte70: number;
  /** Cuantía mínima de viudedad de la situación (€/mes). NO está garantizada: ver el complemento. */
  pensionMinima: number;
  /** Complemento a mínimos reconocido (€/mes), con prueba de rentas y tope de la PNC */
  complemento: number;
  estadoComplemento: EstadoComplemento;
  /** Pensión final: la calculada (con la máxima) más el complemento (€/mes) */
  pensionFinal: number;
  /** Neto aproximado: la pensión menos el IRPF de la pensión sola (escala general) */
  pensionNetaAprox: number;
  /** Notas sobre requisitos y condiciones */
  notas: string[];
  /** Fuente y fecha de los datos normativos */
  fuenteDatos: string;
}

/** La pensión se cobra en 14 pagas: el Anexo I del RD 241/2026 da los mínimos en €/año. */
const PAGAS = 14;
/** Los ingresos propios llegan por mes con las extras prorrateadas: 12 al año. */
const MESES = 12;

const r = (n: number): number => Math.round(n * 100) / 100;

/** Formato español sin depender de lib/ (el motor no tiene dependencias de presentación). */
const eur = (n: number): string =>
  `${n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;
const pct = (n: number): string => `${n} %`;

/**
 * IRPF anual de la pensión sola (rendimiento del trabajo, art. 17.2.a LIRPF): reducción del
 * art. 20, 2.000 € de otros gastos y mínimo personal por edad, con la escala general.
 */
export function irpfAnualPensionViudedad(pensionAnual: number, edad: number): number {
  const rnt = calcularRendimientoNetoTrabajo({ integros: pensionAnual, gastosAaE: 0 });
  const minimo = edad >= 65 ? MINIMOS_IRPF_2025.personal_65 : MINIMOS_IRPF_2025.personal;
  return calcularCuotaIntegraGeneral(rnt.rendimientoNetoReducido, minimo);
}

// ─── Función principal ─────────────────────────────────────────────────────────

export function calcularPensionViudedad(p: ParametrosPensionViudedad): ResultadoPensionViudedad {
  if (p.edadBeneficiario < 0 || p.edadBeneficiario > 120) throw new Error('La edad del beneficiario no es válida.');

  const pv = PENSION_VIUDEDAD_2026;

  // Base reguladora
  let baseReguladora: number;
  if (p.situacionCausante === 'jubilado') {
    if (!p.pensionCausante || p.pensionCausante <= 0) throw new Error('La pensión del causante es obligatoria para situación "jubilado".');
    baseReguladora = p.pensionCausante;
  } else {
    if (!p.baseCotizacionMedia || p.baseCotizacionMedia <= 0) throw new Error('La base de cotización media es obligatoria para situación "activo" o "no-alta".');
    // BR = (24 × base media) / 28
    baseReguladora = r((24 * p.baseCotizacionMedia) / pv.divisorBaseReguladora);
  }

  // Porcentaje aplicable
  const edad = p.edadBeneficiario;
  const ingresos = Math.max(0, p.ingresosMensualesPropios ?? 0);
  const tieneCargas = p.tieneCargas ?? false;

  // Sin el 70 %: el 60 % si se cumple, si no el 52 % general.
  let porcentajeAplicable: number;
  let razonPorcentaje: string;
  if (edad >= 65 && ingresos < pv.smiMensual) {
    porcentajeAplicable = pv.porcentaje60;
    razonPorcentaje = `${pct(pv.porcentaje60)}: tiene 65 años o más e ingresos del trabajo inferiores al SMI (${eur(pv.smiMensual)}/mes)`;
  } else {
    porcentajeAplicable = pv.porcentajeGeneral;
    razonPorcentaje = `Porcentaje general (${pct(pv.porcentajeGeneral)})`;
  }
  let pensionBruta = r(baseReguladora * porcentajeAplicable / 100);
  let recorte70 = 0;

  // ── 70 % (art. 31.2 y 31.3 del Decreto 3158/1966; cabecera) ──
  const rentasAnuales = ingresos * MESES;
  const anualTopada = (mensual: number): number => Math.min(mensual, pv.pensionMaxima) * PAGAS;
  const pension70Anual = anualTopada(r(baseReguladora * pv.porcentaje70 / 100));
  const alternativaAnual = anualTopada(pensionBruta);
  // 75 % del SMI sin la parte proporcional de dos pagas extra, en cómputo anual (× 12).
  const limiteRentaPorMiembro = r(pv.limiteIngresos70 * MESES);
  // Límite del complemento a mínimos + mínima de viudedad del TRAMO DE EDAD («en función de la edad»).
  const limite70 = r(COMPLEMENTO_MINIMOS_LIMITES_2026.sinConyuge + minimoViudedad2026(edad, false) * PAGAS);
  const miembros = Math.floor(p.miembrosUnidadFamiliar ?? 0);
  const sinDatosFamilia = p.rentaAnualUnidadFamiliar === undefined || miembros < 2;
  const rentaPorMiembro = sinDatosFamilia ? 0 : r(Math.max(p.rentaAnualUnidadFamiliar ?? 0, rentasAnuales, 0) / miembros);

  if (tieneCargas) {
    let motivoSin70 = '';
    if (sinDatosFamilia) motivoSin70 = `para el ${pct(70)} hacen falta la renta anual de la unidad familiar y cuántas personas la forman (al menos 2)`;
    else if (rentaPorMiembro > limiteRentaPorMiembro) motivoSin70 = `la renta de la unidad familiar por miembro (${eur(rentaPorMiembro)}/año) pasa del ${pct(75)} del SMI (${eur(limiteRentaPorMiembro)}/año), así que no hay cargas familiares a efectos del ${pct(70)}`;
    else if (pension70Anual < rentasAnuales) motivoSin70 = `la pensión al ${pct(70)} (${eur(pension70Anual)}/año) no llega a la mitad de tus ingresos totales: no sería tu fuente principal de ingresos`;
    else if (rentasAnuales > limite70) motivoSin70 = `tus ingresos propios (${eur(rentasAnuales)}/año) pasan de ${eur(limite70)}/año (límite del complemento a mínimos más la mínima de viudedad de tu edad)`;

    // 31.3: pensión al 70 % + rendimientos no pueden exceder el límite. El recorte nunca deja la
    // pensión por debajo de la que correspondería sin el 70 % (decisión del usuario, 22/10/2026).
    const recortadaAnual = Math.min(pension70Anual, limite70 - rentasAnuales);
    if (!motivoSin70 && recortadaAnual <= alternativaAnual) {
      motivoSin70 = `con el recorte del art. 31.3 (pensión más ingresos no pueden exceder ${eur(limite70)}/año) quedaría por debajo del ${pct(porcentajeAplicable)}`;
    }

    if (motivoSin70) {
      razonPorcentaje += `. Sin el ${pct(70)}: ${motivoSin70}`;
    } else {
      porcentajeAplicable = pv.porcentaje70;
      pensionBruta = r(recortadaAnual / PAGAS);
      recorte70 = r((pension70Anual - recortadaAnual) / PAGAS);
      razonPorcentaje = `${pct(pv.porcentaje70)}: hay cargas familiares (renta de la unidad familiar de ${eur(rentaPorMiembro)}/año por miembro, sin pasar del ${pct(75)} del SMI), la pensión es tu fuente principal de ingresos y tus ingresos no pasan de ${eur(limite70)}/año (art. 31.2 del Decreto 3158/1966)`
        + (recorte70 > 0 ? `. Se recorta en ${eur(recorte70)}/mes para que pensión más ingresos no excedan ese límite (art. 31.3)` : '');
    }
  }

  // Cuantía mínima: las cargas familiares mandan sobre la edad (Anexo I del RD 241/2026).
  const pensionMinima = minimoViudedad2026(edad, tieneCargas);

  // Complemento a mínimos (mismas reglas que app/estimador-complemento-minimos):
  //  · prueba de rentas (art. 59.1 LGSS): por encima de COMPLEMENTO_MINIMOS_LIMITES_2026, solo la
  //    regla diferencial del art. 9.2 RD 241/2026, (límite + mínimo) − (rentas + pensión);
  //  · tope de la PNC (art. 59.4 LGSS, art. 9.5 RD 241/2026) para las pensiones causadas desde el
  //    01/01/2013, es decir, toda viudedad que se estime hoy.
  //  La viudedad no admite cónyuge a cargo: el límite y el tope son los de «sin cónyuge».
  const minimaAnual = pensionMinima * PAGAS;
  const brutaAnual = Math.min(pensionBruta, pv.pensionMaxima) * PAGAS;
  const limiteRentas = COMPLEMENTO_MINIMOS_LIMITES_2026.sinConyuge;
  const topeAnual = TOPE_COMPLEMENTO_MINIMOS_2026.pncAnual;

  const integroAnual = Math.max(0, minimaAnual - brutaAnual);
  const sinTopeAnual = rentasAnuales > limiteRentas
    ? Math.min(integroAnual, Math.max(0, (limiteRentas + minimaAnual) - (rentasAnuales + brutaAnual)))
    : integroAnual;
  const complementoAnual = Math.min(sinTopeAnual, topeAnual);
  const complemento = r(complementoAnual / PAGAS);

  const estadoComplemento: EstadoComplemento =
    integroAnual <= 0 ? 'noHaceFalta'
      : complementoAnual <= 0 ? 'rentas'
        : sinTopeAnual > topeAnual ? 'tope'
          : sinTopeAnual < integroAnual ? 'diferencial'
            : 'integro';

  const pensionFinal = r(Math.min(pensionBruta, pv.pensionMaxima) + complemento);
  const pensionNetaAprox = r(pensionFinal - irpfAnualPensionViudedad(pensionFinal * PAGAS, edad) / PAGAS);

  const notas: string[] = [
    'Cálculo orientativo. La SS calculará la pensión real a partir del historial completo de cotización del causante.',
    p.situacionCausante === 'no-alta' ? 'Causante no en alta: se requieren 15 años cotizados en toda su vida laboral (art. 219.1 LGSS).' : '',
    porcentajeAplicable === pv.porcentaje70 ? `El ${pct(70)} se mide con los ingresos del ejercicio anterior y exige cumplir los requisitos mientras se cobra: si se deja de cumplir alguno, se pasa al ${pct(52)} (art. 31 del Decreto 3158/1966).` : '',
    p.situacionCausante === 'activo' ? 'Causante en alta: se requieren 500 días cotizados dentro de los 5 años anteriores al fallecimiento; ninguno si la muerte se debió a un accidente o a una enfermedad profesional (art. 219.1 LGSS).' : '',
    estadoComplemento === 'integro' ? `Se completa hasta la cuantía mínima (${eur(pensionMinima)}/mes): las rentas propias no pasan de ${eur(limiteRentas)}/año.` : '',
    estadoComplemento === 'diferencial' ? `Complemento reducido a ${eur(complemento)}/mes: las rentas propias pasan de ${eur(limiteRentas)}/año (regla diferencial del art. 9.2 RD 241/2026).` : '',
    estadoComplemento === 'tope' ? `El complemento a mínimos no puede superar la pensión no contributiva (${eur(TOPE_COMPLEMENTO_MINIMOS_2026.sinConyugeMensual)}/mes, art. 59.4 LGSS): no se llega a la cuantía mínima de ${eur(pensionMinima)}/mes.` : '',
    estadoComplemento === 'rentas' ? `Sin complemento a mínimos: las rentas propias superan el límite de ${eur(limiteRentas)}/año en más de lo que faltaba para llegar a la cuantía mínima (art. 59.1 LGSS).` : '',
    `Neto estimado con el IRPF de la pensión sola (escala general y mínimo personal); otras rentas lo elevarían.`,
    `Pensión máxima SS 2026: ${eur(pv.pensionMaxima)}/mes.`,
  ].filter(Boolean);

  return {
    baseReguladora,
    porcentajeAplicable,
    razonPorcentaje,
    pensionBruta,
    recorte70,
    pensionMinima,
    complemento,
    estadoComplemento,
    pensionFinal,
    pensionNetaAprox,
    notas,
    fuenteDatos: `${FISCAL_PENSIONES_META.fuente} — verificado ${FISCAL_PENSIONES_META.verificado}`,
  };
}
