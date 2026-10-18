/**
 * Calculadora de Cuota Autónomo (RETA) — lógica pura sin React ni DOM
 * Usada por: MCP server (calcular_cuota_autonomo)
 *
 * Calcula la cuota mensual de la Seguridad Social para autónomos
 * según el sistema de cotización por ingresos reales (RDL 13/2022).
 *
 * Fuente: Real Decreto-ley 13/2022 + RDL 16/2025 (tabla 2026 congelada)
 *
 * El tramo se busca con el rendimiento COMPUTABLE del art. 308.1.c LGSS. Hasta el 18/10/2026
 * (cabo C0105) se buscaba con `rendimientoNetoMensual` tal cual, sin la deducción del 7 % por
 * gastos genéricos: 2.125 €/mes caían en el tramo 9 (401,47 €) en vez del 8 (380,88 €).
 */

import {
  tramoRETA,
  rendimientoComputableDesdeActividad,
  TIPO_COTIZACION_RETA,
  TARIFA_PLANA_2025,
  FISCAL_AUTONOMOS_META,
} from '@/data/fiscal';

// ─── Tipos públicos ────────────────────────────────────────────────────────────

export interface ParametrosCuotaAutonomo {
  /**
   * Rendimiento neto mensual estimado (ingresos - gastos, SIN descontar cuota SS). El tramo se
   * busca con él menos el 7 % de gastos genéricos (`rendimientoComputableDesdeActividad`).
   */
  rendimientoNetoMensual?: number;
  /**
   * Rendimiento computable mensual ya calculado (art. 308.1.c LGSS, con su deducción): si se da,
   * manda sobre `rendimientoNetoMensual` y se usa tal cual. Lo pasa simulador-modulos-vs-directa,
   * que lo calcula con `rendimientoComputableMensualRETA`.
   */
  rendimientoComputableMensual?: number;
  /** ¿Es nuevo autónomo (≤12 meses de alta)? Para tarifa plana */
  esNuevoAutonomo?: boolean;
  /** Base de cotización elegida dentro del tramo (si no se indica, se usa la mínima) */
  baseElegida?: 'minima' | 'maxima' | number;
}

export interface ResultadoCuotaAutonomo {
  /** Rendimiento neto mensual (null si solo se dio el computable) */
  rendimientoNetoMensual: number | null;
  /** Rendimiento computable mensual, el que decide el tramo */
  rendimientoComputableMensual: number;
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
  const neto = p.rendimientoNetoMensual ?? null;
  if (neto === null && p.rendimientoComputableMensual === undefined) {
    throw new Error('Falta el rendimiento: neto mensual o computable mensual.');
  }
  if (neto !== null && neto < 0) throw new Error('El rendimiento neto mensual no puede ser negativo.');

  const r = (n: number) => Math.round(n * 100) / 100;

  // Buscar tramo con el rendimiento computable (art. 308.1.c LGSS)
  const computable = p.rendimientoComputableMensual ?? rendimientoComputableDesdeActividad((neto ?? 0) * 12);
  const tramo = tramoRETA(computable);

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
    rendimientoNetoMensual: neto === null ? null : r(neto),
    rendimientoComputableMensual: r(computable),
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
