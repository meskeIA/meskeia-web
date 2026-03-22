/**
 * Calculadora de Sueldo Neto — lógica pura sin React ni DOM
 * Usada por: MCP server (calcular_sueldo_neto)
 *
 * Calcula la retención IRPF estimada y el sueldo neto mensual/anual
 * a partir del salario bruto anual (o a la inversa).
 *
 * Fuente: IRPF 2025 + SS cuenta ajena 2025
 */

import {
  TRAMOS_IRPF_2025,
  MINIMOS_IRPF_2025,
  COTIZACIONES_SS_2025,
  BASES_SS_2025,
  GASTOS_DEDUCIBLES_TRABAJO_2025,
  REDUCCION_RENDIMIENTOS_TRABAJO_2025,
  FISCAL_IRPF_META,
} from '@/data/fiscal';

// ─── Tipos públicos ────────────────────────────────────────────────────────────

export type SituacionFamiliar = 'soltero' | 'casado_sin_ingresos' | 'casado_con_ingresos';

export interface ParametrosSueldoNeto {
  /** Salario bruto anual (€) */
  brutoAnual: number;
  /** Situación familiar del contribuyente */
  situacion?: SituacionFamiliar;
  /** Número total de hijos */
  numHijos?: number;
  /** Número de hijos menores de 3 años */
  hijosMenores3?: number;
  /** Número de pagas (12 o 14) */
  pagas?: 12 | 14;
}

export interface ResultadoSueldoNeto {
  /** Bruto anual */
  brutoAnual: number;
  /** Cotización SS empleado anual */
  cuotaSSAnual: number;
  /** Base imponible (bruto - SS) */
  baseImponible: number;
  /** Reducción por rendimientos del trabajo */
  reduccionRNT: number;
  /** Mínimo personal y familiar */
  minimoPersonalFamiliar: number;
  /** Base liquidable */
  baseLiquidable: number;
  /** Cuota íntegra IRPF */
  cuotaIRPF: number;
  /** Tipo de retención efectivo (%) */
  tipoRetencion: number;
  /** Neto anual */
  netoAnual: number;
  /** Neto mensual (según número de pagas) */
  netoMensual: number;
  /** Número de pagas */
  pagas: number;
  /** Fuente normativa */
  fuenteDatos: string;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

const r = (n: number) => Math.round(n * 100) / 100;

/** Calcula la cuota IRPF sobre una base liquidable */
function calcularCuotaIRPF(baseLiquidable: number): number {
  let cuota = 0;
  let baseAnterior = 0;
  for (const tramo of TRAMOS_IRPF_2025) {
    if (baseLiquidable <= baseAnterior) break;
    const baseEnTramo = Math.min(baseLiquidable, tramo.hasta) - baseAnterior;
    cuota += baseEnTramo * (tramo.tipo / 100);
    baseAnterior = tramo.hasta;
  }
  return Math.max(0, cuota);
}

/** Calcula la reducción por rendimientos netos del trabajo */
function calcularReduccionRNT(rnt: number): number {
  const red = REDUCCION_RENDIMIENTOS_TRABAJO_2025;
  if (rnt <= red.limite1) return red.reduccion1;
  if (rnt >= red.limite2) return red.reduccion2;
  return red.reduccion1 - red.factorInterpolacion * (rnt - red.limite1);
}

/** Calcula el mínimo personal y familiar */
function calcularMinimo(situacion: SituacionFamiliar, numHijos: number, hijosMenores3: number): number {
  let minimo = MINIMOS_IRPF_2025.personal;
  // Hijos
  const ordenHijos = [
    MINIMOS_IRPF_2025.hijo_1,
    MINIMOS_IRPF_2025.hijo_2,
    MINIMOS_IRPF_2025.hijo_3,
  ];
  for (let i = 0; i < numHijos; i++) {
    minimo += i < 3 ? ordenHijos[i] : MINIMOS_IRPF_2025.hijo_4_mas;
  }
  minimo += hijosMenores3 * MINIMOS_IRPF_2025.hijo_menor_3;
  // Cónyuge sin ingresos (deducción art. 84): no aplica aquí directamente,
  // pero el tipo de retención puede variar. Se simplifica con el mínimo personal.
  return minimo;
}

// ─── Función principal ─────────────────────────────────────────────────────────

export function calcularSueldoNeto(p: ParametrosSueldoNeto): ResultadoSueldoNeto {
  if (p.brutoAnual <= 0) throw new Error('El salario bruto anual debe ser mayor que cero.');

  const situacion = p.situacion ?? 'soltero';
  const numHijos = p.numHijos ?? 0;
  const hijosMenores3 = p.hijosMenores3 ?? 0;
  const pagas = p.pagas ?? 14;

  // Cotización SS: base = clamp(salario mensual, mínima, máxima)
  const salarioMensual = p.brutoAnual / 12;
  const baseSS = Math.min(Math.max(salarioMensual, BASES_SS_2025.minima), BASES_SS_2025.maxima);
  const tipoSS = (
    COTIZACIONES_SS_2025.contingenciasComunes +
    COTIZACIONES_SS_2025.desempleo +
    COTIZACIONES_SS_2025.formacionProfesional +
    COTIZACIONES_SS_2025.mef
  ) / 100;
  const cuotaSSMensual = baseSS * tipoSS;
  const cuotaSSAnual = r(cuotaSSMensual * 12);

  // Base imponible
  const baseImponible = Math.max(0, p.brutoAnual - cuotaSSAnual - GASTOS_DEDUCIBLES_TRABAJO_2025.importeGeneral);

  // Reducción RNT
  const reduccionRNT = r(calcularReduccionRNT(baseImponible));

  // Base liquidable general
  const minimoPersonalFamiliar = calcularMinimo(situacion, numHijos, hijosMenores3);
  const baseLiquidableGeneral = Math.max(0, baseImponible - reduccionRNT);
  const baseLiquidable = Math.max(0, baseLiquidableGeneral - minimoPersonalFamiliar);

  // Cuota íntegra
  const cuotaIRPF = r(calcularCuotaIRPF(baseLiquidable));

  // Tipo de retención
  const tipoRetencion = r((cuotaIRPF / p.brutoAnual) * 100);

  // Neto
  const netoAnual = r(p.brutoAnual - cuotaSSAnual - cuotaIRPF);
  const netoMensual = r(netoAnual / pagas);

  return {
    brutoAnual: r(p.brutoAnual),
    cuotaSSAnual,
    baseImponible: r(baseImponible),
    reduccionRNT,
    minimoPersonalFamiliar,
    baseLiquidable: r(baseLiquidable),
    cuotaIRPF,
    tipoRetencion,
    netoAnual,
    netoMensual,
    pagas,
    fuenteDatos: `${FISCAL_IRPF_META.fuente} — verificado ${FISCAL_IRPF_META.verificado}`,
  };
}
