/**
 * Calculadora de Capacidad Hipotecaria — lógica pura sin React ni DOM
 * Usada por: MCP server (calcular_capacidad_hipoteca)
 *
 * Estima el máximo préstamo hipotecario que un hogar puede asumir de forma
 * sostenible, aplicando la regla de esfuerzo hipotecario del Banco de España
 * (cuota ≤ 30-35% ingresos netos del hogar).
 *
 * Fuente: Banco de España — Guía de acceso al crédito hipotecario
 */

// ─── Tipos públicos ────────────────────────────────────────────────────────────

export interface ParametrosCapacidadHipoteca {
  /** Ingresos netos mensuales del hogar (todos los miembros) (€) */
  ingresosMensualesNetos: number;
  /** Ahorros disponibles para la entrada (€) */
  ahorrosDisponibles: number;
  /** Otras deudas mensuales ya existentes (cuotas préstamos, etc.) (€). Por defecto 0 */
  otrasDeudasMensuales?: number;
  /** Tipo de interés a aplicar en la simulación (%). Por defecto 3.5% */
  tasaInteres?: number;
  /** Plazo de la hipoteca (años). Por defecto 30 */
  plazo?: number;
  /**
   * Umbral de esfuerzo hipotecario máximo (%).
   * Banco de España recomienda ≤30%, umbral máximo ≤35%.
   * Por defecto 30%.
   */
  umbralEsfuerzo?: number;
  /**
   * % de ahorros reservado para gastos de compra (notaría, impuestos, etc.).
   * Por defecto 10%.
   */
  porcentajeGastosCompra?: number;
}

export interface ResultadoCapacidadHipoteca {
  /** Cuota máxima mensual sostenible (€) */
  cuotaMaximaMensual: number;
  /** Cuota disponible tras otras deudas (€) */
  cuotaDisponible: number;
  /** Capital máximo financiable (€) */
  capitalMaximo: number;
  /** Ahorros disponibles para entrada (tras reservar gastos de compra) (€) */
  entradaDisponible: number;
  /** Gastos de compra estimados reservados (€) */
  gastosCompraReservados: number;
  /** Precio máximo de vivienda que puede comprar (capital + entrada) (€) */
  precioMaximoVivienda: number;
  /** Porcentaje de financiación sobre el precio total (%) */
  porcentajeFinanciacion: number;
  /** Relación cuota/ingresos netos con la cuota calculada (%) */
  esfuerzoHipotecario: number;
  /** ¿Cumple la recomendación del Banco de España (≤30%)? */
  cumpleRecomendacionBDE: boolean;
  /** Advertencias sobre la viabilidad */
  advertencias: string[];
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Calcula el capital máximo dado una cuota mensual máxima, tasa y plazo.
 * Despejando de la fórmula francesa: C = cuota × ((1+r)^n - 1) / (r × (1+r)^n)
 */
function capitalMaximoDesdeCuota(cuotaMax: number, tasaAnual: number, anios: number): number {
  if (cuotaMax <= 0 || anios <= 0) return 0;
  const r = tasaAnual / 100 / 12;
  const n = anios * 12;
  if (r === 0) return cuotaMax * n;
  return cuotaMax * (Math.pow(1 + r, n) - 1) / (r * Math.pow(1 + r, n));
}

// ─── Función principal ─────────────────────────────────────────────────────────

export function calcularCapacidadHipoteca(p: ParametrosCapacidadHipoteca): ResultadoCapacidadHipoteca {
  if (p.ingresosMensualesNetos <= 0) throw new Error('Los ingresos netos deben ser mayores que cero.');
  if (p.ahorrosDisponibles < 0) throw new Error('Los ahorros no pueden ser negativos.');

  const r = (n: number) => Math.round(n * 100) / 100;

  const otrasDeudasMensuales = p.otrasDeudasMensuales ?? 0;
  const tasaInteres = p.tasaInteres ?? 3.5;
  const plazo = p.plazo ?? 30;
  const umbralEsfuerzo = p.umbralEsfuerzo ?? 30;
  const pctGastosCompra = p.porcentajeGastosCompra ?? 10;

  // Cuota máxima según umbral de esfuerzo
  const cuotaMaximaMensual = r(p.ingresosMensualesNetos * (umbralEsfuerzo / 100));
  const cuotaDisponible = r(Math.max(0, cuotaMaximaMensual - otrasDeudasMensuales));

  // Capital máximo financiable
  const capitalMaximo = r(capitalMaximoDesdeCuota(cuotaDisponible, tasaInteres, plazo));

  // Entrada disponible (ahorros - reserva para gastos de compra)
  // Los gastos de compra se calculan sobre el precio total = capital + entrada
  // Si precio = capital + entrada y gastos = precio × pct
  // ahorros = entrada + gastos = entrada + (capital + entrada) × pct
  // ahorros = entrada(1 + pct) + capital × pct
  // entrada = (ahorros - capital × pct) / (1 + pct)
  const entradaDisponible = r(Math.max(0,
    (p.ahorrosDisponibles - capitalMaximo * (pctGastosCompra / 100)) / (1 + pctGastosCompra / 100)
  ));
  const gastosCompraReservados = r(p.ahorrosDisponibles - entradaDisponible);

  const precioMaximoVivienda = r(capitalMaximo + entradaDisponible);
  const porcentajeFinanciacion = precioMaximoVivienda > 0
    ? r((capitalMaximo / precioMaximoVivienda) * 100)
    : 0;
  const esfuerzoHipotecario = r((cuotaDisponible / p.ingresosMensualesNetos) * 100);

  // Advertencias
  const advertencias: string[] = [];
  if (esfuerzoHipotecario > 35) {
    advertencias.push('El esfuerzo hipotecario supera el 35%: zona de riesgo de sobreendeudamiento.');
  } else if (esfuerzoHipotecario > 30) {
    advertencias.push('El esfuerzo hipotecario supera el 30%: por encima de la recomendación del Banco de España.');
  }
  if (porcentajeFinanciacion > 80) {
    advertencias.push('La financiación supera el 80% del precio: algunos bancos exigen mayor entrada.');
  }
  if (entradaDisponible < precioMaximoVivienda * 0.1) {
    advertencias.push('La entrada es menor del 10% del precio: puede ser difícil conseguir financiación.');
  }
  if (otrasDeudasMensuales > cuotaMaximaMensual * 0.5) {
    advertencias.push('Las otras deudas consumen más del 50% de la capacidad hipotecaria disponible.');
  }

  return {
    cuotaMaximaMensual,
    cuotaDisponible,
    capitalMaximo,
    entradaDisponible,
    gastosCompraReservados,
    precioMaximoVivienda,
    porcentajeFinanciacion,
    esfuerzoHipotecario,
    cumpleRecomendacionBDE: esfuerzoHipotecario <= 30,
    advertencias,
  };
}
