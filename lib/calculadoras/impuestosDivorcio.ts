/**
 * Impacto en el IRPF de un divorcio o separación (modelo estatal orientativo).
 *
 * Réplica server-side de la lógica inline de app/impuestos-divorcio/page.tsx.
 * La fuente única de tramos, mínimos y reducciones es data/fiscal/irpf.ts.
 *
 * Usada por: MCP server (calcular_impuestos_divorcio).
 * TODO: unificar — la app aún mantiene su propia versión inline del mismo cálculo.
 *
 * Alcance: SOLO IRPF (pensión compensatoria art. 55, mínimo por descendientes,
 * imputación de rentas inmobiliarias art. 85, deducción transitoria vivienda D.T. 18ª).
 * NO calcula ITP/AJD, plusvalía municipal ni ganancia patrimonial. La liquidación de
 * gananciales se considera no sujeta. Sin variaciones por CCAA ni regímenes forales.
 */
import {
  TRAMOS_IRPF_2025,
  MINIMOS_IRPF_2025,
  GASTOS_DEDUCIBLES_TRABAJO_2025,
  REDUCCION_RENDIMIENTOS_TRABAJO_2025,
} from '@/data/fiscal/irpf';

export type RegimenDivorcio = 'gananciales' | 'separacion' | 'participacion';
export type CustodiaDivorcio = 'exclusiva-tengo' | 'exclusiva-otro' | 'compartida';
export type PosViviendaDivorcio = 'me-quedo' | 'salgo' | 'vendemos';
export type RolPensionDivorcio = 'pago' | 'cobro';
export type PosHipotecaDivorcio = 'me-quedo' | 'otro-paga';

export interface ParametrosImpuestosDivorcio {
  regimen: RegimenDivorcio;
  /** Ingresos brutos anuales del trabajo (€). */
  ingresos: number;
  tieneHijos?: boolean;
  /** 1-4 (4 = "4 o más", como en la app). */
  numHijos?: number;
  custodia?: CustodiaDivorcio;
  tieneVivienda?: boolean;
  posVivienda?: PosViviendaDivorcio;
  valorCatastral?: number;
  /** % de propiedad del contribuyente. Por defecto 50. */
  porcPropiedad?: number;
  /** true → tipo 1,1 %; false → 2 %. */
  catastroRevisado?: boolean;
  viviendaAsignadaHijos?: boolean;
  tienePensionConyuge?: boolean;
  rolPension?: RolPensionDivorcio;
  /** €/mes. */
  pensionMensual?: number;
  tieneHipotecaAntigua?: boolean;
  posHipoteca?: PosHipotecaDivorcio;
  /** Cuota anual de hipoteca que paga el contribuyente (€). */
  cuotaHipoteca?: number;
}

export interface ResultadoImpuestosDivorcio {
  gananciales: boolean;
  pensionConyuge?: { pensionAnual: number; tipo: 'ahorro' | 'coste'; importe: number };
  hijos?: {
    minimoTotal: number;
    minimoAplicable: number;
    porcentaje: number;
    ahorroEstimado: number;
    custodia: CustodiaDivorcio;
  };
  vivienda?: { imputacionAnual: number; costeFiscal: number; exenta: boolean };
  hipoteca?: { deduccionAnual: number; tipo: 'mantiene' | 'pierde' };
}

/** Base máxima anual de la deducción por vivienda habitual (régimen transitorio). */
const TOPE_DEDUCCION_HIPOTECA = 9040;

/** Cuota íntegra de IRPF por tramos progresivos (escala general). */
function calcularCuotaIRPF(base: number): number {
  let cuota = 0;
  let limiteAnterior = 0;
  for (const tramo of TRAMOS_IRPF_2025) {
    if (base <= limiteAnterior) break;
    const tramoBase = Math.min(base, tramo.hasta) - limiteAnterior;
    cuota += tramoBase * (tramo.tipo / 100);
    limiteAnterior = tramo.hasta;
  }
  return cuota;
}

/**
 * Base liquidable simplificada a partir de ingresos brutos del trabajo.
 * Aproximación de la app: NO descuenta cotizaciones SS ni mínimo personal.
 */
function calcularBaseSimplificada(ingresosBrutos: number): number {
  const rnt = Math.max(0, ingresosBrutos - GASTOS_DEDUCIBLES_TRABAJO_2025.importeGeneral);
  const rd = REDUCCION_RENDIMIENTOS_TRABAJO_2025;
  let reduccion: number;
  if (rnt <= rd.limite1) {
    reduccion = rd.reduccion1;
  } else if (rnt >= rd.limite2) {
    reduccion = rd.reduccion2;
  } else {
    reduccion = rd.reduccion1 - rd.factorInterpolacion * (rnt - rd.limite1);
  }
  return Math.max(0, rnt - reduccion);
}

/** Suma del mínimo por descendientes (cumulativo por número de hijos). */
function calcularMinimoHijos(numHijos: number): number {
  const m = MINIMOS_IRPF_2025;
  let total = 0;
  for (let i = 1; i <= numHijos; i++) {
    if (i === 1) total += m.hijo_1;
    else if (i === 2) total += m.hijo_2;
    else if (i === 3) total += m.hijo_3;
    else total += m.hijo_4_mas;
  }
  return total;
}

export function calcularImpuestosDivorcio(
  p: ParametrosImpuestosDivorcio
): ResultadoImpuestosDivorcio {
  const base = calcularBaseSimplificada(p.ingresos);
  const resultado: ResultadoImpuestosDivorcio = {
    gananciales: p.regimen === 'gananciales',
  };

  // Pensión compensatoria al cónyuge
  const pensionMensual = p.pensionMensual ?? 0;
  if (p.tienePensionConyuge && p.rolPension && pensionMensual > 0) {
    const pensionAnual = pensionMensual * 12;
    if (p.rolPension === 'pago') {
      // Reduce la base del pagador → ahorro
      const importe = Math.max(
        0,
        calcularCuotaIRPF(base) - calcularCuotaIRPF(Math.max(0, base - pensionAnual))
      );
      resultado.pensionConyuge = { pensionAnual, tipo: 'ahorro', importe };
    } else {
      // Tributa como renta del que la cobra → coste
      const baseCon = calcularBaseSimplificada(p.ingresos + pensionAnual);
      const importe = Math.max(0, calcularCuotaIRPF(baseCon) - calcularCuotaIRPF(base));
      resultado.pensionConyuge = { pensionAnual, tipo: 'coste', importe };
    }
  }

  // Mínimo por descendientes según custodia
  const numHijos = p.numHijos ?? 0;
  if (p.tieneHijos && p.custodia && numHijos > 0) {
    const minimoTotal = calcularMinimoHijos(numHijos);
    const porcentaje =
      p.custodia === 'exclusiva-otro' ? 0 : p.custodia === 'compartida' ? 50 : 100;
    const minimoAplicable = minimoTotal * (porcentaje / 100);
    const ahorroEstimado = minimoAplicable * 0.19; // marginal orientativo (app)
    resultado.hijos = { minimoTotal, minimoAplicable, porcentaje, ahorroEstimado, custodia: p.custodia };
  }

  // Vivienda: solo el que sale genera imputación de renta inmobiliaria
  if (p.tieneVivienda && p.posVivienda === 'salgo') {
    if (p.viviendaAsignadaHijos === true) {
      resultado.vivienda = { imputacionAnual: 0, costeFiscal: 0, exenta: true };
    } else if ((p.valorCatastral ?? 0) > 0) {
      const tipo = p.catastroRevisado ? 0.011 : 0.02;
      const porc = (p.porcPropiedad ?? 50) / 100;
      const imputacionAnual = (p.valorCatastral ?? 0) * porc * tipo;
      const costeFiscal = calcularCuotaIRPF(base + imputacionAnual) - calcularCuotaIRPF(base);
      resultado.vivienda = { imputacionAnual, costeFiscal, exenta: false };
    }
  }

  // Hipoteca anterior a 2013 (deducción transitoria)
  if (p.tieneHipotecaAntigua) {
    if (p.posHipoteca === 'me-quedo') {
      const deduccionAnual = Math.min(p.cuotaHipoteca ?? 0, TOPE_DEDUCCION_HIPOTECA) * 0.15;
      resultado.hipoteca = { deduccionAnual, tipo: 'mantiene' };
    } else {
      resultado.hipoteca = { deduccionAnual: 0, tipo: 'pierde' };
    }
  }

  return resultado;
}
