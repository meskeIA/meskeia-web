/**
 * Calculadora de Pensión de Viudedad — lógica pura sin React ni DOM
 * Usada por: MCP server (calcular_pension_viudedad)
 *
 * Orientativa según LGSS arts. 219-231 (RDL 8/2015).
 * Fuente normativa: PENSION_VIUDEDAD_2026 de data/fiscal/pensiones.ts
 */

import { PENSION_VIUDEDAD_2026, FISCAL_PENSIONES_META } from '@/data/fiscal';

// ─── Tipos públicos ────────────────────────────────────────────────────────────

export type SituacionCausante = 'activo' | 'jubilado' | 'no-alta';

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
   * Ingresos del beneficiario por trabajo o pensión propios (€/mes).
   * Determina si puede acceder a porcentajes del 60% o 70%.
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
  /** Pensión mínima garantizada (€/mes) */
  pensionMinima: number;
  /** Pensión final (respetando mínimos y máximos) */
  pensionFinal: number;
  /** Estimación neta aproximada tras retención IRPF */
  pensionNetaAprox: number;
  /** Notas sobre requisitos y condiciones */
  notas: string[];
  /** Fuente y fecha de los datos normativos */
  fuenteDatos: string;
}

// ─── Función principal ─────────────────────────────────────────────────────────

export function calcularPensionViudedad(p: ParametrosPensionViudedad): ResultadoPensionViudedad {
  if (p.edadBeneficiario < 0 || p.edadBeneficiario > 120) throw new Error('La edad del beneficiario no es válida.');

  const r = (n: number) => Math.round(n * 100) / 100;
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
  const ingresos = p.ingresosMensualesPropios ?? 0;
  const tieneCargas = p.tieneCargas ?? false;

  let porcentajeAplicable: number;
  let razonPorcentaje: string;

  if (tieneCargas && ingresos < pv.limiteIngresos70) {
    porcentajeAplicable = pv.porcentaje70;
    razonPorcentaje = `70%: tiene cargas familiares e ingresos (${ingresos.toLocaleString('es-ES')} €/mes) inferiores al 75% del SMI (${pv.limiteIngresos70} €/mes)`;
  } else if (edad >= 65 && ingresos < pv.smiMensual) {
    porcentajeAplicable = pv.porcentaje60;
    razonPorcentaje = `60%: tiene ≥ 65 años e ingresos (${ingresos.toLocaleString('es-ES')} €/mes) inferiores al SMI (${pv.smiMensual} €/mes)`;
  } else {
    porcentajeAplicable = pv.porcentajeGeneral;
    razonPorcentaje = `52%: porcentaje general (no cumple condiciones para 60% ni 70%)`;
  }

  const pensionBruta = r(baseReguladora * porcentajeAplicable / 100);

  // Pensión mínima garantizada
  let pensionMinima: number;
  if (edad >= 65) {
    pensionMinima = pv.minimo65SinDiscap;
  } else if (edad >= 60) {
    pensionMinima = pv.minimo60a64;
  } else if (tieneCargas) {
    pensionMinima = pv.minimoMenor60ConCargas;
  } else {
    pensionMinima = pv.minimoMenor60SinCargas;
  }

  const pensionFinal = r(Math.min(Math.max(pensionBruta, pensionMinima), pv.pensionMaxima));

  // Estimación retención IRPF (orientativa)
  const pensionAnual = pensionFinal * 14;
  const retencion = pensionAnual < 15000 ? 0 : pensionAnual < 22000 ? 0.08 : 0.12;
  const pensionNetaAprox = r(pensionFinal * (1 - retencion));

  const notas: string[] = [
    'Cálculo orientativo. La SS calculará la pensión real a partir del historial completo de cotización del causante.',
    p.situacionCausante === 'no-alta' ? 'Para causantes no en alta: se requieren ≥ 15 años cotizados o al menos 500 días en los últimos 5 años.' : '',
    pensionFinal === pensionMinima ? `Se aplica el mínimo garantizado (${pensionMinima.toLocaleString('es-ES')} €/mes) porque la pensión calculada era inferior.` : '',
    `Pensión máxima SS 2026: ${pv.pensionMaxima.toLocaleString('es-ES')} €/mes.`,
  ].filter(Boolean);

  return {
    baseReguladora,
    porcentajeAplicable,
    razonPorcentaje,
    pensionBruta,
    pensionMinima,
    pensionFinal,
    pensionNetaAprox,
    notas,
    fuenteDatos: `${FISCAL_PENSIONES_META.fuente} — verificado ${FISCAL_PENSIONES_META.verificado}`,
  };
}
