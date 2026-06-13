/**
 * Calculadora de Impacto de Subida Salarial — lógica pura sin React ni DOM
 * Usada por: MCP server (calcular_subida_salarial)
 *
 * Calcula cuánto sube el salario neto ante una subida de salario bruto,
 * teniendo en cuenta la progresividad del IRPF y las cotizaciones a la SS.
 *
 * Encadenable con: calcular_sueldo_neto, calcular_irpf
 * Fuente: Ley 35/2006 IRPF + Real Decreto 2064/1995 SS
 */

import {
  TRAMOS_IRPF_2025,
  MINIMOS_IRPF_2025,
  COTIZACIONES_SS_2026,
  BASES_SS_2026,
  GASTOS_DEDUCIBLES_TRABAJO_2025,
  REDUCCION_RENDIMIENTOS_TRABAJO_2025,
} from '@/data/fiscal';

// ─── Tipos públicos ────────────────────────────────────────────────────────────

export interface ParametrosSubidaSalarial {
  /** Salario bruto anual actual (€) */
  salarioBrutoActual: number;
  /** Salario bruto anual nuevo (€). Indica este o subirBruto, no ambos. */
  salarioBrutoNuevo?: number;
  /** Incremento del salario bruto (€). Indica este o salarioBrutoNuevo, no ambos. */
  subirBruto?: number;
  /**
   * Número de pagas al año (12 o 14). Afecta al cálculo mensual.
   * Por defecto 14 (12 ordinarias + 2 extras).
   */
  pagas?: number;
}

export interface SnapshotSalarial {
  /** Salario bruto anual (€) */
  brutoAnual: number;
  /** Cuota SS trabajador anual (€) */
  cuotaSSAnual: number;
  /** Reducción RNT (€) */
  reduccionRNT: number;
  /** Base imponible (€) */
  baseImponible: number;
  /** Base liquidable (€) */
  baseLiquidable: number;
  /** Cuota IRPF anual (€) */
  cuotaIRPF: number;
  /** Tipo efectivo IRPF (%) */
  tipoEfectivoIRPF: number;
  /** Salario neto anual (€) */
  netoAnual: number;
  /** Salario neto mensual (€) */
  netoMensual: number;
}

export interface ResultadoSubidaSalarial {
  /** Situación salarial actual */
  actual: SnapshotSalarial;
  /** Situación salarial nueva */
  nuevo: SnapshotSalarial;
  /** Incremento bruto (€) */
  incrementoBruto: number;
  /** Incremento neto anual (€) */
  incrementoNetoAnual: number;
  /** Incremento neto mensual (€) */
  incrementoNetoMensual: number;
  /** % de la subida bruta que llega al neto */
  pctSubidaEfectiva: number;
  /** % de la subida bruta que se queda en IRPF + SS */
  pctRetenidoFisco: number;
  /** Desglose de retención adicional: SS + IRPF extra (€) */
  retenciones: { ssAdicional: number; irpfAdicional: number; total: number };
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function calcularCuotaSS(salarioBruto: number): number {
  const salarioMensual = salarioBruto / 12;
  const base = Math.min(Math.max(salarioMensual, BASES_SS_2026.minima), BASES_SS_2026.maxima);
  const tipo = (
    COTIZACIONES_SS_2026.contingenciasComunes +
    COTIZACIONES_SS_2026.desempleo +
    COTIZACIONES_SS_2026.formacionProfesional +
    COTIZACIONES_SS_2026.mef
  ) / 100;
  return Math.round(base * tipo * 12 * 100) / 100;
}

function calcularReduccionRNT(rnt: number): number {
  const red = REDUCCION_RENDIMIENTOS_TRABAJO_2025;
  if (rnt <= red.limite1) return red.reduccion1;
  if (rnt >= red.limite2) return red.reduccion2;
  return red.reduccion1 - red.factorInterpolacion * (rnt - red.limite1);
}

function calcularCuotaIRPF(baseLiquidable: number): number {
  let cuota = 0;
  let anterior = 0;
  for (const tramo of TRAMOS_IRPF_2025) {
    if (baseLiquidable <= anterior) break;
    const enTramo = Math.min(baseLiquidable, tramo.hasta) - anterior;
    cuota += enTramo * (tramo.tipo / 100);
    anterior = tramo.hasta;
  }
  return Math.round(cuota * 100) / 100;
}

function calcularSnapshot(brutoAnual: number, pagas: number): SnapshotSalarial {
  const r = (n: number) => Math.round(n * 100) / 100;

  const cuotaSSAnual = calcularCuotaSS(brutoAnual);
  const gastosD = brutoAnual > 0 ? GASTOS_DEDUCIBLES_TRABAJO_2025.importeGeneral : 0;
  const rnt = Math.max(0, brutoAnual - cuotaSSAnual - gastosD);
  const reduccionRNT = r(calcularReduccionRNT(rnt));
  const baseImponible = r(Math.max(0, rnt - reduccionRNT));
  const baseLiquidable = r(Math.max(0, baseImponible - MINIMOS_IRPF_2025.personal));
  const cuotaIRPF = calcularCuotaIRPF(baseLiquidable);
  const tipoEfectivoIRPF = baseImponible > 0 ? r((cuotaIRPF / baseImponible) * 100) : 0;
  const netoAnual = r(brutoAnual - cuotaSSAnual - cuotaIRPF);
  const netoMensual = r(netoAnual / pagas);

  return { brutoAnual: r(brutoAnual), cuotaSSAnual, reduccionRNT, baseImponible, baseLiquidable, cuotaIRPF, tipoEfectivoIRPF, netoAnual, netoMensual };
}

// ─── Función principal ─────────────────────────────────────────────────────────

export function calcularSubidaSalarial(p: ParametrosSubidaSalarial): ResultadoSubidaSalarial {
  if (p.salarioBrutoActual <= 0) throw new Error('El salario bruto actual debe ser mayor que cero.');
  if (p.salarioBrutoNuevo === undefined && p.subirBruto === undefined) {
    throw new Error('Indica el salario bruto nuevo o el importe de la subida.');
  }

  const pagas = p.pagas ?? 14;
  const brutoNuevo = p.salarioBrutoNuevo ?? (p.salarioBrutoActual + (p.subirBruto ?? 0));
  if (brutoNuevo <= p.salarioBrutoActual) throw new Error('El salario nuevo debe ser mayor que el actual.');

  const r = (n: number) => Math.round(n * 100) / 100;

  const actual = calcularSnapshot(p.salarioBrutoActual, pagas);
  const nuevo = calcularSnapshot(brutoNuevo, pagas);

  const incrementoBruto = r(brutoNuevo - p.salarioBrutoActual);
  const incrementoNetoAnual = r(nuevo.netoAnual - actual.netoAnual);
  const incrementoNetoMensual = r(nuevo.netoMensual - actual.netoMensual);
  const pctSubidaEfectiva = incrementoBruto > 0 ? r((incrementoNetoAnual / incrementoBruto) * 100) : 0;
  const pctRetenidoFisco = r(100 - pctSubidaEfectiva);

  const ssAdicional = r(nuevo.cuotaSSAnual - actual.cuotaSSAnual);
  const irpfAdicional = r(nuevo.cuotaIRPF - actual.cuotaIRPF);

  return {
    actual,
    nuevo,
    incrementoBruto,
    incrementoNetoAnual,
    incrementoNetoMensual,
    pctSubidaEfectiva,
    pctRetenidoFisco,
    retenciones: { ssAdicional, irpfAdicional, total: r(ssAdicional + irpfAdicional) },
  };
}
