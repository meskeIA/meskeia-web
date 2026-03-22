/**
 * Calculadora de Coste Aplazado (compra a plazos) — lógica pura sin React ni DOM
 * Usada por: MCP server (calcular_coste_aplazado)
 *
 * Calcula el coste real de financiar una compra a plazos:
 * cuánto pagas de más respecto al precio al contado y la TAE implícita.
 */

// ─── Tipos públicos ────────────────────────────────────────────────────────────

export interface ParametrosCosteAplazado {
  /** Precio al contado (€) */
  precioContado: number;
  /** Cuota mensual (€) */
  cuotaMensual: number;
  /** Número de cuotas */
  numeroCuotas: number;
  /** Entrada inicial (€, puede ser 0) */
  entradaInicial?: number;
}

export interface ResultadoCosteAplazado {
  /** Precio al contado */
  precioContado: number;
  /** Total pagado a plazos (entrada + cuotas) */
  totalPlazos: number;
  /** Coste de la financiación (total plazos - precio contado) */
  costeFinanciacion: number;
  /** Porcentaje extra pagado respecto al precio contado */
  porcentajeExtra: number;
  /** TAE aproximada (%) */
  taeAproximada: number;
  /** Cuota mensual */
  cuotaMensual: number;
  /** Entrada inicial */
  entradaInicial: number;
  /** Importe financiado (precio - entrada) */
  importeFinanciado: number;
}

// ─── TAE por Newton-Raphson ────────────────────────────────────────────────────

function calcularTAE(principal: number, cuota: number, meses: number): number {
  if (principal <= 0 || cuota <= 0 || meses <= 0) return 0;
  if (cuota * meses <= principal) return 0;

  let tasa = 0.01;
  for (let i = 0; i < 100; i++) {
    const factor = Math.pow(1 + tasa, meses);
    const vp = cuota * (factor - 1) / (tasa * factor);
    const dvp = cuota * (
      (meses * Math.pow(1 + tasa, meses - 1) * tasa * factor -
        (factor - 1) * (factor + meses * tasa * Math.pow(1 + tasa, meses - 1))) /
      Math.pow(tasa * factor, 2)
    );
    const error = vp - principal;
    if (Math.abs(error) < 0.01) break;
    tasa = tasa - error / dvp;
    if (tasa <= 0) tasa = 0.001;
  }
  return Math.max(0, Math.round((Math.pow(1 + tasa, 12) - 1) * 10000) / 100);
}

// ─── Función principal ─────────────────────────────────────────────────────────

export function calcularCosteAplazado(p: ParametrosCosteAplazado): ResultadoCosteAplazado {
  if (p.precioContado <= 0) throw new Error('El precio al contado debe ser mayor que cero.');
  if (p.cuotaMensual <= 0) throw new Error('La cuota mensual debe ser mayor que cero.');
  if (p.numeroCuotas <= 0 || p.numeroCuotas > 600) throw new Error('El número de cuotas debe estar entre 1 y 600.');

  const r = (n: number) => Math.round(n * 100) / 100;
  const entrada = p.entradaInicial ?? 0;

  const totalPlazos = r(entrada + p.cuotaMensual * p.numeroCuotas);
  const costeFinanciacion = r(totalPlazos - p.precioContado);
  const porcentajeExtra = r((costeFinanciacion / p.precioContado) * 100);
  const importeFinanciado = r(p.precioContado - entrada);
  const tae = importeFinanciado > 0 ? calcularTAE(importeFinanciado, p.cuotaMensual, p.numeroCuotas) : 0;

  return {
    precioContado: p.precioContado,
    totalPlazos,
    costeFinanciacion,
    porcentajeExtra,
    taeAproximada: tae,
    cuotaMensual: p.cuotaMensual,
    entradaInicial: entrada,
    importeFinanciado,
  };
}
