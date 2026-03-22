/**
 * Comparador Autónomo vs Sociedad Limitada — lógica pura sin React ni DOM
 * Usada por: MCP server (comparar_autonomo_vs_sl)
 *
 * Compara la carga fiscal total (SS + IRPF/IS + dividendos) de operar
 * como autónomo persona física frente a constituir una SL.
 *
 * Fuente: IRPF 2025 + RETA 2026 + IS 2025 (Ley 27/2014)
 */

import {
  TRAMOS_IRPF_2025,
  TRAMOS_RETA_2025,
  TIPO_COTIZACION_RETA,
  MINIMOS_IRPF_2025,
  TIPOS_IS_2025,
  TRAMOS_GANANCIAS_PATRIMONIALES_2025,
  AUTONOMO_SOCIETARIO_2025,
  FISCAL_AUTONOMOS_META,
  FISCAL_SOCIEDADES_META,
} from '@/data/fiscal';

// ─── Tipos públicos ────────────────────────────────────────────────────────────

export type TipoIS = 'general' | 'micropyme' | 'nueva_creacion';

export interface ParametrosAutonomoVsSL {
  /** Beneficio bruto anual de la actividad (ingresos totales antes de gastos) (€) */
  beneficioAnual: number;
  /** Gastos deducibles anuales (€) */
  gastosDeducibles?: number;
  /** Tipo de IS para la SL */
  tipoIS?: TipoIS;
  /** ¿La SL repartirá dividendos al socio? */
  repartirDividendos?: boolean;
}

export interface ResultadoFiscal {
  beneficioBruto: number;
  gastosDeducibles: number;
  rendimientoNeto: number;
  cuotaSSAnual: number;
  baseImponible: number;
  cuotaImpuesto: number;          // IRPF (autónomo) o IS (SL)
  irpfDividendos: number;         // Solo SL si reparte
  totalCargas: number;
  netoAnual: number;
  tipoEfectivoTotal: number;      // % sobre beneficio bruto
}

export interface ResultadoComparacion {
  autonomo: ResultadoFiscal;
  sl: ResultadoFiscal;
  /** Diferencia de cargas: positivo = SL ahorra respecto a autónomo */
  ahorroCargasSL: number;
  /** ¿Conviene la SL fiscalmente? */
  convieneSL: boolean;
  /** Umbral de beneficio a partir del cual conviene la SL (aproximado) */
  umbralSL: number;
  /** Tipo IS aplicado (%) */
  tipoISAplicado: number;
  /** Fuente normativa */
  fuenteDatos: string;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function calcularCuotaIRPF(baseLiquidable: number): number {
  let cuota = 0;
  let baseAnterior = 0;
  for (const tramo of TRAMOS_IRPF_2025) {
    if (baseLiquidable <= baseAnterior) break;
    const baseEnTramo = Math.min(baseLiquidable, tramo.hasta) - baseAnterior;
    cuota += baseEnTramo * (tramo.tipo / 100);
    baseAnterior = tramo.hasta;
  }
  return cuota;
}

function calcularCuotaAhorro(base: number): number {
  let cuota = 0;
  let baseAnterior = 0;
  for (const tramo of TRAMOS_GANANCIAS_PATRIMONIALES_2025) {
    if (base <= baseAnterior) break;
    const baseEnTramo = Math.min(base, tramo.hasta) - baseAnterior;
    cuota += baseEnTramo * (tramo.tipo / 100);
    baseAnterior = tramo.hasta;
  }
  return cuota;
}

function calcularCuotaRetaAnual(rendimientoMensual: number): number {
  const tramo = TRAMOS_RETA_2025.find(t =>
    rendimientoMensual >= t.rendimientoMin &&
    (t.rendimientoMax === null || rendimientoMensual < t.rendimientoMax)
  ) ?? TRAMOS_RETA_2025[TRAMOS_RETA_2025.length - 1];
  return tramo.baseMinima * TIPO_COTIZACION_RETA * 12;
}

// ─── Función principal ─────────────────────────────────────────────────────────

export function compararAutonomoVsSL(p: ParametrosAutonomoVsSL): ResultadoComparacion {
  if (p.beneficioAnual <= 0) throw new Error('El beneficio anual debe ser mayor que cero.');

  const r = (n: number) => Math.round(n * 100) / 100;

  const gastosDeducibles = p.gastosDeducibles ?? 0;
  const repartirDividendos = p.repartirDividendos !== false; // por defecto sí

  const tipoISPct = p.tipoIS === 'nueva_creacion'
    ? TIPOS_IS_2025.nuevaCreacion
    : p.tipoIS === 'micropyme'
      ? TIPOS_IS_2025.micropymes
      : TIPOS_IS_2025.general;

  // ─── AUTÓNOMO ───────────────────────────────────────────────────────────────

  const rendimientoNetoAutonomo = Math.max(0, p.beneficioAnual - gastosDeducibles);
  const rendimientoMensualAutonomo = rendimientoNetoAutonomo / 12;
  const cuotaRetaAnual = r(calcularCuotaRetaAnual(rendimientoMensualAutonomo));

  // Rendimiento neto tras SS (base IRPF autónomo)
  const baseIRPFAutonomo = Math.max(0, rendimientoNetoAutonomo - cuotaRetaAnual);

  // IRPF: se reduce el mínimo personal básico
  const baseLiquidableAutonomo = Math.max(0, baseIRPFAutonomo - MINIMOS_IRPF_2025.personal);
  const cuotaIRPFAutonomo = r(calcularCuotaIRPF(baseLiquidableAutonomo));

  const totalCargasAutonomo = r(cuotaRetaAnual + cuotaIRPFAutonomo);
  const netoAutonomo = r(Math.max(0, p.beneficioAnual - gastosDeducibles - totalCargasAutonomo));

  const autonomo: ResultadoFiscal = {
    beneficioBruto: r(p.beneficioAnual),
    gastosDeducibles: r(gastosDeducibles),
    rendimientoNeto: r(rendimientoNetoAutonomo),
    cuotaSSAnual: cuotaRetaAnual,
    baseImponible: r(baseIRPFAutonomo),
    cuotaImpuesto: cuotaIRPFAutonomo,
    irpfDividendos: 0,
    totalCargas: totalCargasAutonomo,
    netoAnual: netoAutonomo,
    tipoEfectivoTotal: r((totalCargasAutonomo / p.beneficioAnual) * 100),
  };

  // ─── SOCIEDAD LIMITADA ──────────────────────────────────────────────────────

  const beneficioSL = Math.max(0, p.beneficioAnual - gastosDeducibles);
  const cuotaIS = r(beneficioSL * (tipoISPct / 100));
  const beneficioNetoSL = r(beneficioSL - cuotaIS);

  // Autónomo societario (administrador con participación ≥ 25%)
  const cuotaAutoSocietarioAnual = r(AUTONOMO_SOCIETARIO_2025.cuotaMinimaMensual * 12);

  // IRPF sobre dividendos si se reparten (base del ahorro)
  let irpfDividendos = 0;
  if (repartirDividendos) {
    irpfDividendos = r(calcularCuotaAhorro(beneficioNetoSL));
  }

  const totalCargasSL = r(cuotaIS + cuotaAutoSocietarioAnual + irpfDividendos);
  const netoSL = r(Math.max(0,
    repartirDividendos
      ? beneficioNetoSL - irpfDividendos - cuotaAutoSocietarioAnual
      : beneficioNetoSL - cuotaAutoSocietarioAnual
  ));

  const sl: ResultadoFiscal = {
    beneficioBruto: r(p.beneficioAnual),
    gastosDeducibles: r(gastosDeducibles),
    rendimientoNeto: r(beneficioSL),
    cuotaSSAnual: cuotaAutoSocietarioAnual,
    baseImponible: r(beneficioSL),
    cuotaImpuesto: cuotaIS,
    irpfDividendos,
    totalCargas: totalCargasSL,
    netoAnual: netoSL,
    tipoEfectivoTotal: r((totalCargasSL / p.beneficioAnual) * 100),
  };

  // ─── Comparación ────────────────────────────────────────────────────────────

  const ahorroCargasSL = r(totalCargasAutonomo - totalCargasSL);
  const convieneSL = ahorroCargasSL > 0;

  // Umbral aproximado donde la SL empieza a ser mejor (búsqueda iterativa simple)
  let umbralSL = 0;
  for (let b = 30000; b <= 200000; b += 1000) {
    const gd = gastosDeducibles;
    const rnA = Math.max(0, b - gd);
    const cuotaR = calcularCuotaRetaAnual(rnA / 12);
    const cargaA = cuotaR + calcularCuotaIRPF(Math.max(0, rnA - cuotaR - MINIMOS_IRPF_2025.personal));
    const benefS = Math.max(0, b - gd);
    const cuotaISU = benefS * (tipoISPct / 100);
    const cuotaAS = AUTONOMO_SOCIETARIO_2025.cuotaMinimaMensual * 12;
    const irpfD = repartirDividendos ? calcularCuotaAhorro(benefS - cuotaISU) : 0;
    const cargaS = cuotaISU + cuotaAS + irpfD;
    if (cargaS < cargaA) {
      umbralSL = b;
      break;
    }
  }

  return {
    autonomo,
    sl,
    ahorroCargasSL,
    convieneSL,
    umbralSL,
    tipoISAplicado: tipoISPct,
    fuenteDatos: `${FISCAL_AUTONOMOS_META.fuente} | ${FISCAL_SOCIEDADES_META.fuente}`,
  };
}
