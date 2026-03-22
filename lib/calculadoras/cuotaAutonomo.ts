/**
 * Calculadora de Cuota Autónomo (RETA) — lógica pura sin React ni DOM
 * Usada por: MCP server (calcular_cuota_autonomo)
 *
 * Calcula la cuota mensual de la Seguridad Social para autónomos
 * según el sistema de cotización por ingresos reales (RDL 13/2022).
 *
 * Fuente: Real Decreto-ley 13/2022 + RDL 16/2025 (tabla 2026 congelada)
 */

import {
  TRAMOS_RETA_2025,
  TIPO_COTIZACION_RETA,
  TARIFA_PLANA_2025,
  FISCAL_AUTONOMOS_META,
} from '@/data/fiscal';

// ─── Tipos públicos ────────────────────────────────────────────────────────────

export interface ParametrosCuotaAutonomo {
  /** Rendimiento neto mensual estimado (ingresos - gastos, SIN descontar cuota SS) */
  rendimientoNetoMensual: number;
  /** ¿Es nuevo autónomo (≤12 meses de alta)? Para tarifa plana */
  esNuevoAutonomo?: boolean;
  /** Base de cotización elegida dentro del tramo (si no se indica, se usa la mínima) */
  baseElegida?: 'minima' | 'maxima' | number;
}

export interface ResultadoCuotaAutonomo {
  /** Rendimiento neto mensual */
  rendimientoNetoMensual: number;
  /** Tramo correspondiente (1-15) */
  tramo: number;
  /** Base de cotización mínima del tramo */
  baseMinima: number;
  /** Base de cotización máxima del tramo */
  baseMaxima: number;
  /** Base de cotización efectiva */
  baseCotizacion: number;
  /** Cuota mensual general (sin tarifa plana) */
  cuotaMensualGeneral: number;
  /** Cuota mensual con tarifa plana (si aplica) */
  cuotaConTarifaPlana: number | null;
  /** ¿Aplica tarifa plana? */
  aplicaTarifaPlana: boolean;
  /** Cuota efectiva mensual */
  cuotaEfectiva: number;
  /** Cuota anual (× 12) */
  cuotaAnual: number;
  /** Tipo de cotización total (%) */
  tipoCotizacion: number;
  /** Fuente normativa */
  fuenteDatos: string;
}

// ─── Función principal ─────────────────────────────────────────────────────────

export function calcularCuotaAutonomo(p: ParametrosCuotaAutonomo): ResultadoCuotaAutonomo {
  if (p.rendimientoNetoMensual < 0) throw new Error('El rendimiento neto mensual no puede ser negativo.');

  const r = (n: number) => Math.round(n * 100) / 100;

  // Buscar tramo
  const tramo = TRAMOS_RETA_2025.find(t =>
    p.rendimientoNetoMensual >= t.rendimientoMin &&
    (t.rendimientoMax === null || p.rendimientoNetoMensual < t.rendimientoMax)
  ) ?? TRAMOS_RETA_2025[TRAMOS_RETA_2025.length - 1];

  // Base de cotización
  let baseCotizacion: number;
  if (p.baseElegida === 'maxima') {
    baseCotizacion = tramo.baseMaxima;
  } else if (typeof p.baseElegida === 'number') {
    baseCotizacion = Math.min(Math.max(p.baseElegida, tramo.baseMinima), tramo.baseMaxima);
  } else {
    baseCotizacion = tramo.baseMinima; // por defecto la mínima
  }

  const cuotaMensualGeneral = r(baseCotizacion * TIPO_COTIZACION_RETA);
  const aplicaTarifaPlana = p.esNuevoAutonomo === true;
  const cuotaConTarifaPlana = aplicaTarifaPlana ? TARIFA_PLANA_2025.cuota : null;
  const cuotaEfectiva = aplicaTarifaPlana ? TARIFA_PLANA_2025.cuota : cuotaMensualGeneral;

  return {
    rendimientoNetoMensual: r(p.rendimientoNetoMensual),
    tramo: tramo.id,
    baseMinima: tramo.baseMinima,
    baseMaxima: tramo.baseMaxima,
    baseCotizacion: r(baseCotizacion),
    cuotaMensualGeneral,
    cuotaConTarifaPlana,
    aplicaTarifaPlana,
    cuotaEfectiva: r(cuotaEfectiva),
    cuotaAnual: r(cuotaEfectiva * 12),
    tipoCotizacion: TIPO_COTIZACION_RETA * 100,
    fuenteDatos: `${FISCAL_AUTONOMOS_META.fuente} — verificado ${FISCAL_AUTONOMOS_META.verificado}`,
  };
}
