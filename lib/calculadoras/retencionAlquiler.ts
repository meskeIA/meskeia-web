/**
 * Calculadora de Retención e IRPF del Alquiler — lógica pura sin React ni DOM
 * Usada por: MCP server (calcular_retencion_alquiler)
 *
 * Calcula el rendimiento neto del capital inmobiliario, los gastos deducibles
 * y el impacto en el IRPF del arrendador de un inmueble residencial.
 *
 * Fuente: Ley 35/2006 IRPF art. 22-24 — Rendimientos del capital inmobiliario
 * Retención 19%: art. 101.4 LIRPF (solo si el arrendatario es empresa/profesional)
 */

import {
  TRAMOS_IRPF_2025,
  FISCAL_IRPF_META,
} from '@/data/fiscal';

// ─── Tipos públicos ────────────────────────────────────────────────────────────

export interface ParametrosRetencionAlquiler {
  /** Alquiler mensual bruto (€) */
  alquilerMensual: number;
  /** Número de meses alquilados al año. Por defecto 12 */
  mesesAlquilados?: number;
  /** Precio de compra del inmueble (€). Para calcular amortización. Por defecto 0 */
  precioCompra?: number;
  /** Valor catastral del inmueble (€). Para calcular amortización alternativa. */
  valorCatastral?: number;
  /** IBI anual (€). Por defecto 0 */
  ibi?: number;
  /** Gastos de comunidad anuales (€). Por defecto 0 */
  comunidad?: number;
  /** Seguro de hogar anual (€). Por defecto 0 */
  seguro?: number;
  /** Gastos de reparación y conservación anuales (€). Por defecto 0 */
  reparaciones?: number;
  /** Intereses de hipoteca pagados en el año (€). Por defecto 0 */
  interesesHipoteca?: number;
  /** Honorarios de gestoría, publicidad, otros gastos (€). Por defecto 0 */
  otrosGastos?: number;
  /** ¿El arrendatario es empresa o profesional? (determina obligación de retener 19%) */
  arrendatarioEmpresa?: boolean;
  /** Otros ingresos anuales del contribuyente (para calcular tipo marginal aproximado) (€). Por defecto 0 */
  otrosIngresos?: number;
}

export interface ResultadoRetencionAlquiler {
  /** Ingresos íntegros anuales (alquiler bruto × meses) (€) */
  ingresosIntegros: number;
  /** Desglose de gastos deducibles (€) */
  gastos: {
    ibi: number;
    comunidad: number;
    seguro: number;
    reparaciones: number;
    interesesHipoteca: number;
    amortizacion: number;
    otrosGastos: number;
    total: number;
  };
  /** Rendimiento neto (ingresos - gastos) (€) */
  rendimientoNeto: number;
  /** ¿Se aplica reducción del 60% por arrendamiento vivienda habitual? */
  reduccionViviendaHabitual: boolean;
  /** Importe de la reducción del 60% (€) */
  reduccion60pct: number;
  /** Rendimiento neto reducido (base IRPF) (€) */
  rendimientoNetoReducido: number;
  /** Cuota IRPF estimada sobre el rendimiento del alquiler (€) */
  cuotaIRPFEstimada: number;
  /** Tipo marginal aproximado aplicado (%) */
  tipoMarginal: number;
  /** Retención 19% si el arrendatario es empresa/profesional (€/año) */
  retencionAnual: number;
  /** Retención mensual (€) */
  retencionMensual: number;
  /** Cuota diferencial (cuota IRPF - retenciones) (€) */
  cuotaDiferencial: number;
  /** ¿A pagar (positivo) o a devolver (negativo)? */
  aDevolver: boolean;
  /** Fuente normativa */
  fuenteDatos: string;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function calcularCuotaIRPF(base: number, otrosIngresos: number): { cuota: number; tipoMarginal: number } {
  // Solo el rendimiento del alquiler en el contexto de los otros ingresos
  let cuotaSobreTotal = 0;
  let cuotaSobreOtros = 0;
  let tipoMarginal = 0;

  for (const tramo of TRAMOS_IRPF_2025) {
    // Cuota sobre (otrosIngresos + base)
    if (otrosIngresos + base > 0) {
      const baseEnTramo = Math.min(otrosIngresos + base, tramo.hasta) - Math.min(otrosIngresos, tramo.hasta);
      if (baseEnTramo > 0) {
        cuotaSobreTotal += baseEnTramo * (tramo.tipo / 100);
        tipoMarginal = tramo.tipo;
      }
    }
    // Cuota solo sobre otrosIngresos
    if (otrosIngresos > 0) {
      const baseEnTramoOtros = Math.min(otrosIngresos, tramo.hasta) - Math.min(0, tramo.hasta);
      cuotaSobreOtros += Math.max(0, baseEnTramoOtros) * (tramo.tipo / 100);
    }
  }

  return {
    cuota: Math.round((cuotaSobreTotal - cuotaSobreOtros) * 100) / 100,
    tipoMarginal,
  };
}

// ─── Función principal ─────────────────────────────────────────────────────────

export function calcularRetencionAlquiler(p: ParametrosRetencionAlquiler): ResultadoRetencionAlquiler {
  if (p.alquilerMensual <= 0) throw new Error('El alquiler mensual debe ser mayor que cero.');

  const r = (n: number) => Math.round(n * 100) / 100;

  const mesesAlquilados = Math.min(12, Math.max(1, p.mesesAlquilados ?? 12));
  const precioCompra = p.precioCompra ?? 0;
  const valorCatastral = p.valorCatastral ?? 0;
  const ibi = p.ibi ?? 0;
  const comunidad = p.comunidad ?? 0;
  const seguro = p.seguro ?? 0;
  const reparaciones = p.reparaciones ?? 0;
  const interesesHipoteca = p.interesesHipoteca ?? 0;
  const otrosGastos = p.otrosGastos ?? 0;
  const arrendatarioEmpresa = p.arrendatarioEmpresa ?? false;
  const otrosIngresos = p.otrosIngresos ?? 0;

  // Ingresos íntegros
  const ingresosIntegros = r(p.alquilerMensual * mesesAlquilados);

  // Amortización del inmueble (art. 23.1.b LIRPF)
  // 3% sobre el mayor de: precio de adquisición o valor catastral del inmueble
  // Aplicamos que la construcción representa el 70% del valor total (estimación estándar)
  let baseAmortizacion = 0;
  if (precioCompra > 0) baseAmortizacion = precioCompra * 0.7;
  if (valorCatastral > 0) baseAmortizacion = Math.max(baseAmortizacion, valorCatastral * 0.7);
  const amortizacion = r(baseAmortizacion * 0.03);

  // Total gastos deducibles
  const totalGastos = r(ibi + comunidad + seguro + reparaciones + interesesHipoteca + amortizacion + otrosGastos);

  // Rendimiento neto
  const rendimientoNeto = r(ingresosIntegros - totalGastos);

  // Reducción del 60% por arrendamiento de vivienda habitual (art. 23.2 LIRPF)
  // Solo aplicable si el rendimiento es positivo
  const reduccionViviendaHabitual = rendimientoNeto > 0;
  const reduccion60pct = reduccionViviendaHabitual ? r(rendimientoNeto * 0.6) : 0;
  const rendimientoNetoReducido = r(Math.max(0, rendimientoNeto - reduccion60pct));

  // IRPF estimado sobre el rendimiento reducido
  const { cuota: cuotaIRPFEstimada, tipoMarginal } = calcularCuotaIRPF(
    rendimientoNetoReducido,
    otrosIngresos
  );

  // Retención 19% (solo si arrendatario es empresa o profesional)
  const retencionAnual = arrendatarioEmpresa ? r(ingresosIntegros * 0.19) : 0;
  const retencionMensual = arrendatarioEmpresa ? r(p.alquilerMensual * 0.19) : 0;

  // Cuota diferencial
  const cuotaDiferencial = r(cuotaIRPFEstimada - retencionAnual);

  return {
    ingresosIntegros,
    gastos: {
      ibi: r(ibi),
      comunidad: r(comunidad),
      seguro: r(seguro),
      reparaciones: r(reparaciones),
      interesesHipoteca: r(interesesHipoteca),
      amortizacion,
      otrosGastos: r(otrosGastos),
      total: totalGastos,
    },
    rendimientoNeto,
    reduccionViviendaHabitual,
    reduccion60pct,
    rendimientoNetoReducido,
    cuotaIRPFEstimada,
    tipoMarginal,
    retencionAnual,
    retencionMensual,
    cuotaDiferencial,
    aDevolver: cuotaDiferencial < 0,
    fuenteDatos: `${FISCAL_IRPF_META.fuente} art. 22-24 y 101.4 — verificado ${FISCAL_IRPF_META.verificado}`,
  };
}
