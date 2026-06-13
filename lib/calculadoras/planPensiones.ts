/**
 * Calculadora de Plan de Pensiones — lógica pura sin React ni DOM
 * Usada por: MCP server (calcular_plan_pensiones)
 *
 * Calcula el ahorro fiscal por aportaciones a plan de pensiones privado
 * y estima el capital acumulado al momento de la jubilación.
 *
 * Límites 2025:
 * - Aportación individual máxima deducible: 1.500 €/año
 * - Aportación empresarial adicional máxima: 8.500 €/año
 * - Límite conjunto: 10.000 €/año
 * - Límite porcentual: 30% de la suma de rendimientos netos del trabajo y actividades
 *
 * Fuente: LIRPF art. 51 + DT 12ª — Ley 12/2022 (reforma pensiones)
 */

import {
  FISCAL_IRPF_META,
  LIMITES_PLAN_PENSIONES_2025,
  tipoMarginalDesdeRendimientosBrutos,
} from '@/data/fiscal';

// ─── Constantes ────────────────────────────────────────────────────────────────

const LIMITE_PORCENTUAL_2025 = 0.30;   // 30% rendimientos trabajo + actividades (límite legal fijo, no revalorizable)

// ─── Tipos públicos ────────────────────────────────────────────────────────────

export interface ParametrosPlanPensiones {
  /** Rendimientos netos del trabajo y actividades económicas (€/año) */
  rendimientosNetos: number;
  /** Aportación individual anual al plan de pensiones (€) */
  aportacionIndividual: number;
  /** Aportación de la empresa al plan de pensiones del trabajador (€). Por defecto 0. */
  aportacionEmpresarial?: number;
  /** Edad actual del partícipe */
  edadActual: number;
  /** Edad prevista de jubilación. Por defecto 67. */
  edadJubilacion?: number;
  /** Rentabilidad anual esperada del plan (%). Por defecto 4%. */
  rentabilidadAnual?: number;
  /** Capital ya acumulado en el plan (€). Por defecto 0. */
  capitalActual?: number;
}

export interface ResultadoPlanPensiones {
  /** Aportación individual solicitada (€) */
  aportacionIndividual: number;
  /** Aportación empresarial (€) */
  aportacionEmpresarial: number;
  /** Aportación total (€) */
  aportacionTotal: number;
  /** Límite de deducción aplicable (el menor de: 1.500€ individual + 8.500€ empresa vs 30% rendimientos) (€) */
  limiteDeducible: number;
  /** Importe efectivamente deducible en la base imponible (€) */
  baseReducible: number;
  /** Tipo marginal IRPF sobre el que opera la deducción (%) */
  tipoMarginal: number;
  /** Ahorro fiscal anual en IRPF (€) */
  ahorroFiscalAnual: number;
  /** Coste neto real de la aportación tras el ahorro fiscal (€) */
  costeNetoAnual: number;
  /** ¿Se supera el límite? */
  superaLimite: boolean;
  /** Exceso no deducible (€) */
  excesoNoDeducible: number;
  /** Años de ahorro hasta jubilación */
  anosAhorro: number;
  /** Capital estimado en la jubilación (€) */
  capitalEstimadoJubilacion: number;
  /** Renta mensual estimada que generaría el capital al 4% perpetuo (€) */
  rentaMensualEstimada: number;
  /** Advertencia sobre tributación en el rescate */
  advertenciaRescate: string;
  /** Fuente normativa */
  fuenteDatos: string;
}

// ─── Función principal ─────────────────────────────────────────────────────────

export function calcularPlanPensiones(p: ParametrosPlanPensiones): ResultadoPlanPensiones {
  if (p.rendimientosNetos <= 0) throw new Error('Los rendimientos netos deben ser mayores que cero.');
  if (p.aportacionIndividual < 0) throw new Error('La aportación individual no puede ser negativa.');
  if (p.edadActual < 18 || p.edadActual > 70) throw new Error('La edad debe estar entre 18 y 70 años.');

  const r = (n: number) => Math.round(n * 100) / 100;

  const aportacionEmpresarial = p.aportacionEmpresarial ?? 0;
  const edadJubilacion = p.edadJubilacion ?? 67;
  const rentabilidadAnual = p.rentabilidadAnual ?? 4;
  const capitalActual = p.capitalActual ?? 0;
  const aportacionTotal = r(p.aportacionIndividual + aportacionEmpresarial);

  // Límite deducible = min(individual_max + empresa_max, 30% rendimientos)
  const limiteAbsoluto = r(Math.min(p.aportacionIndividual, LIMITES_PLAN_PENSIONES_2025.limiteIndividualAnual) + Math.min(aportacionEmpresarial, LIMITES_PLAN_PENSIONES_2025.limiteEmpresaAnual));
  const limitePorcentual = r(p.rendimientosNetos * LIMITE_PORCENTUAL_2025);
  const limiteDeducible = r(Math.min(limiteAbsoluto, limitePorcentual));

  const baseReducible = r(Math.min(aportacionTotal, limiteDeducible));
  const excesoNoDeducible = r(Math.max(0, aportacionTotal - baseReducible));
  const superaLimite = excesoNoDeducible > 0;

  // Ahorro fiscal — tipo marginal estimado desde sueldo bruto (SS + art.19 + art.20)
  const tipo = tipoMarginalDesdeRendimientosBrutos(p.rendimientosNetos);
  const ahorroFiscalAnual = r(baseReducible * (tipo / 100));
  const costeNetoAnual = r(aportacionTotal - ahorroFiscalAnual);

  // Proyección capital
  const anosAhorro = Math.max(0, edadJubilacion - p.edadActual);
  const rAnual = rentabilidadAnual / 100;
  let capitalEstimadoJubilacion: number;

  if (rAnual === 0) {
    capitalEstimadoJubilacion = r(capitalActual + aportacionTotal * anosAhorro);
  } else {
    // VF capital actual + VF renta anual
    const vfCapital = r(capitalActual * Math.pow(1 + rAnual, anosAhorro));
    const vfRenta = r(aportacionTotal * (Math.pow(1 + rAnual, anosAhorro) - 1) / rAnual);
    capitalEstimadoJubilacion = r(vfCapital + vfRenta);
  }

  // Renta mensual estimada (4% perpetua)
  const rentaMensualEstimada = r(capitalEstimadoJubilacion * 0.04 / 12);

  return {
    aportacionIndividual: r(p.aportacionIndividual),
    aportacionEmpresarial: r(aportacionEmpresarial),
    aportacionTotal,
    limiteDeducible,
    baseReducible,
    tipoMarginal: tipo,
    ahorroFiscalAnual,
    costeNetoAnual,
    superaLimite,
    excesoNoDeducible,
    anosAhorro,
    capitalEstimadoJubilacion,
    rentaMensualEstimada,
    advertenciaRescate: 'El rescate del plan tributa como rendimiento del trabajo en el IRPF. Si se rescata en forma de capital (único pago), puede suponer un importante salto de tramo. Valora el rescate en forma de renta para minimizar el impacto fiscal.',
    fuenteDatos: `${FISCAL_IRPF_META.fuente} art. 51 — Límites 2025: 1.500€ individual + 8.500€ empresa — verificado ${FISCAL_IRPF_META.verificado}`,
  };
}
