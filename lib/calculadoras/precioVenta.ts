/**
 * Calculadora de Precio de Venta y Margen Comercial — lógica pura sin React ni DOM
 * Usada por: MCP server (calcular_precio_venta)
 *
 * Calcula el precio de venta óptimo dado el coste y el margen deseado,
 * o bien el margen dado precio y coste. También calcula el PVP con IVA
 * y métricas clave de pricing (markup, margen neto, precio de equilibrio).
 *
 * Distingue entre:
 * - Margen (margin): beneficio / precio_venta × 100
 * - Markup: beneficio / coste × 100
 * → ¡Son diferentes! Margen 33% ≠ Markup 33%
 *
 * Modos:
 * A) 'calcular_precio': dado coste + margen objetivo → precio venta
 * B) 'calcular_margen': dado precio venta + coste → margen y markup
 * C) 'calcular_coste': dado precio venta + margen → coste máximo admisible
 *
 * Encadenable con: calcular_iva, calcular_break_even, calcular_roi_marketing
 */

// ─── Tipos públicos ────────────────────────────────────────────────────────────

export type ModoPrecioVenta = 'calcular_precio' | 'calcular_margen' | 'calcular_coste';

export interface ParametrosPrecioVenta {
  /** Modo de cálculo */
  modo: ModoPrecioVenta;
  /** Coste unitario del producto/servicio (€). Requerido en modos 'calcular_precio' y 'calcular_margen'. */
  costeUnitario?: number;
  /** Precio de venta sin IVA (€). Requerido en modos 'calcular_margen' y 'calcular_coste'. */
  precioVentaSinIVA?: number;
  /**
   * Margen objetivo sobre el precio de venta (%).
   * Requerido en modos 'calcular_precio' y 'calcular_coste'.
   * Ej: 40 → beneficio = 40% del precio de venta
   */
  margenObjetivoPct?: number;
  /** Tipo de IVA a aplicar (%). Por defecto 21. */
  tipoIVA?: number;
  /** Número de unidades vendidas (para calcular beneficio total). Por defecto 1. */
  unidades?: number;
  /**
   * Costes fijos mensuales (€). Si se indica, calcula el punto de equilibrio
   * (unidades mínimas para cubrir costes fijos con este precio).
   */
  costosFijosMensuales?: number;
}

export interface ResultadoPrecioVenta {
  /** Modo usado */
  modo: ModoPrecioVenta;
  /** Coste unitario (€) */
  costeUnitario: number;
  /** Precio de venta sin IVA (€) */
  precioVentaSinIVA: number;
  /** Precio de venta con IVA (PVP) (€) */
  precioVentaConIVA: number;
  /** Beneficio unitario (€) */
  beneficioUnitario: number;
  /** Margen sobre precio de venta (%) — margen comercial */
  margenPct: number;
  /** Markup sobre el coste (%) */
  markupPct: number;
  /** Tipo de IVA aplicado (%) */
  tipoIVA: number;
  /** Cuota de IVA (€) */
  cuotaIVA: number;
  /** Beneficio total para las unidades indicadas (€) */
  beneficioTotal: number;
  /** Ingresos totales para las unidades indicadas (€) */
  ingresosTotales: number;
  /** Punto de equilibrio en unidades (si se dieron costes fijos) */
  puntoEquilibrioUnidades?: number;
  /** Precio psicológico sugerido (redondeo a .99 o .95) (€) */
  precioPsicologico: number;
  /** Interpretación del margen según sector */
  interpretacion: string;
}

// ─── Función principal ─────────────────────────────────────────────────────────

export function calcularPrecioVenta(p: ParametrosPrecioVenta): ResultadoPrecioVenta {
  const r = (n: number) => Math.round(n * 100) / 100;
  const tipoIVA = p.tipoIVA ?? 21;
  const unidades = p.unidades ?? 1;
  if (unidades <= 0) throw new Error('El número de unidades debe ser mayor que cero.');
  if (tipoIVA < 0 || tipoIVA > 100) throw new Error('El tipo de IVA debe estar entre 0 y 100.');

  let costeUnitario: number;
  let precioVentaSinIVA: number;

  switch (p.modo) {
    case 'calcular_precio': {
      if (p.costeUnitario === undefined) throw new Error('Se requiere el coste unitario para calcular el precio.');
      if (p.margenObjetivoPct === undefined) throw new Error('Se requiere el margen objetivo para calcular el precio.');
      if (p.margenObjetivoPct >= 100) throw new Error('El margen no puede ser ≥ 100%.');
      costeUnitario = p.costeUnitario;
      // precio = coste / (1 - margen/100)
      precioVentaSinIVA = r(costeUnitario / (1 - p.margenObjetivoPct / 100));
      break;
    }

    case 'calcular_margen': {
      if (p.costeUnitario === undefined) throw new Error('Se requiere el coste unitario para calcular el margen.');
      if (p.precioVentaSinIVA === undefined) throw new Error('Se requiere el precio de venta para calcular el margen.');
      costeUnitario = p.costeUnitario;
      precioVentaSinIVA = p.precioVentaSinIVA;
      if (precioVentaSinIVA <= 0) throw new Error('El precio de venta debe ser mayor que cero.');
      break;
    }

    case 'calcular_coste': {
      if (p.precioVentaSinIVA === undefined) throw new Error('Se requiere el precio de venta para calcular el coste.');
      if (p.margenObjetivoPct === undefined) throw new Error('Se requiere el margen objetivo para calcular el coste.');
      precioVentaSinIVA = p.precioVentaSinIVA;
      // coste = precio × (1 - margen/100)
      costeUnitario = r(precioVentaSinIVA * (1 - p.margenObjetivoPct / 100));
      break;
    }

    default:
      throw new Error('Modo no reconocido. Usa: calcular_precio, calcular_margen o calcular_coste.');
  }

  if (costeUnitario < 0) throw new Error('El coste unitario no puede ser negativo.');

  const beneficioUnitario = r(precioVentaSinIVA - costeUnitario);
  const margenPct = precioVentaSinIVA > 0 ? r(beneficioUnitario / precioVentaSinIVA * 100) : 0;
  const markupPct = costeUnitario > 0 ? r(beneficioUnitario / costeUnitario * 100) : 0;
  const cuotaIVA = r(precioVentaSinIVA * tipoIVA / 100);
  const precioVentaConIVA = r(precioVentaSinIVA + cuotaIVA);
  const ingresosTotales = r(precioVentaSinIVA * unidades);
  const beneficioTotal = r(beneficioUnitario * unidades);

  // Punto de equilibrio
  let puntoEquilibrioUnidades: number | undefined;
  if (p.costosFijosMensuales !== undefined && p.costosFijosMensuales > 0 && beneficioUnitario > 0) {
    puntoEquilibrioUnidades = Math.ceil(p.costosFijosMensuales / beneficioUnitario);
  }

  // Precio psicológico: inmediatamente por debajo de la siguiente decena/centena
  const precioPsicologico = r(Math.floor(precioVentaConIVA) - 0.01);

  // Interpretación
  let interpretacion: string;
  if (margenPct < 0) {
    interpretacion = 'Precio por debajo del coste: venta con pérdidas.';
  } else if (margenPct < 10) {
    interpretacion = 'Margen muy bajo (<10%). Habitual en distribución y gran consumo.';
  } else if (margenPct < 30) {
    interpretacion = 'Margen moderado (10-30%). Típico en retail y producto físico.';
  } else if (margenPct < 60) {
    interpretacion = 'Margen sano (30-60%). Habitual en servicios y productos de valor añadido.';
  } else {
    interpretacion = 'Margen alto (>60%). Típico en software, formación y servicios digitales.';
  }

  return {
    modo: p.modo,
    costeUnitario: r(costeUnitario),
    precioVentaSinIVA: r(precioVentaSinIVA),
    precioVentaConIVA,
    beneficioUnitario,
    margenPct,
    markupPct,
    tipoIVA,
    cuotaIVA,
    beneficioTotal,
    ingresosTotales,
    puntoEquilibrioUnidades,
    precioPsicologico,
    interpretacion,
  };
}
