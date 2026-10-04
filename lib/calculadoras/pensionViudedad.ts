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
  /** Si el beneficiario tiene cargas familiares (hijos < 26 o con discapacidad a cargo) */
  tieneCargas?: boolean;
  /**
   * Ingresos propios del beneficiario (€/mes, con las pagas extra prorrateadas: se anualizan × 12).
   * Determinan el acceso a los porcentajes del 60 % y 70 % y al complemento a mínimos.
   */
  ingresosMensualesPropios?: number;
}

export interface ResultadoPensionViudedad {
  /** Base reguladora calculada (€/mes) */
  baseReguladora: number;
  /** Porcentaje aplicado sobre la base reguladora (52, 60 o 70) */
  porcentajeAplicable: number;
  /** Explicación del porcentaje aplicado */
  razonPorcentaje: string;
  /** Pensión bruta calculada (€/mes) */
  pensionBruta: number;
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

  let porcentajeAplicable: number;
  let razonPorcentaje: string;

  if (tieneCargas && ingresos < pv.limiteIngresos70) {
    porcentajeAplicable = pv.porcentaje70;
    razonPorcentaje = `${pct(pv.porcentaje70)}: tiene cargas familiares e ingresos del trabajo inferiores al ${pct(75)} del SMI (${eur(pv.limiteIngresos70)}/mes)`;
  } else if (edad >= 65 && ingresos < pv.smiMensual) {
    porcentajeAplicable = pv.porcentaje60;
    razonPorcentaje = `${pct(pv.porcentaje60)}: tiene 65 años o más e ingresos del trabajo inferiores al SMI (${eur(pv.smiMensual)}/mes)`;
  } else {
    porcentajeAplicable = pv.porcentajeGeneral;
    razonPorcentaje = `Porcentaje general (${pct(pv.porcentajeGeneral)})`;
  }

  const pensionBruta = r(baseReguladora * porcentajeAplicable / 100);

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
  const rentasAnuales = ingresos * MESES;
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
    pensionMinima,
    complemento,
    estadoComplemento,
    pensionFinal,
    pensionNetaAprox,
    notas,
    fuenteDatos: `${FISCAL_PENSIONES_META.fuente} — verificado ${FISCAL_PENSIONES_META.verificado}`,
  };
}
