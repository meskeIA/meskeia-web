/**
 * Calculadora de Rendimiento de Bonos de Renta Fija — lógica pura sin React ni DOM
 * Usada por: MCP server (calcular_rendimiento_bono)
 *
 * Calcula el precio y la TIR (Tasa Interna de Rendimiento / yield to maturity)
 * de un bono de renta fija con cupones periódicos.
 *
 * Modos:
 * A) 'calcular_tir': dado precio de mercado → calcula la TIR (yield)
 * B) 'calcular_precio': dada la TIR objetivo → calcula el precio del bono
 * C) 'calcular_cupón_corrido': calcula el cupón corrido acumulado
 *
 * Conceptos clave:
 * - Precio limpio: precio sin cupón corrido (cotización habitual en mercado)
 * - Precio sucio: precio que paga el comprador = precio limpio + cupón corrido
 * - TIR (yield to maturity): rentabilidad anual si se mantiene hasta vencimiento
 * - Relación inversa: si precio sube → TIR baja; si precio baja → TIR sube
 *
 * Encadenable con: calcular_tir_van, calcular_valor_presente, calcular_interes_compuesto
 */

// ─── Tipos públicos ────────────────────────────────────────────────────────────

export type ModoBono = 'calcular_tir' | 'calcular_precio';
export type FrecuenciaCupon = 'anual' | 'semestral' | 'trimestral';

export interface ParametrosRendimientoBono {
  /** Modo de cálculo */
  modo: ModoBono;
  /** Valor nominal del bono (€). Por defecto 1.000. */
  valorNominal?: number;
  /** Tasa de cupón anual (%). Ej: 4 para un bono al 4%. */
  tasaCuponAnual: number;
  /** Años hasta el vencimiento */
  anosVencimiento: number;
  /** Frecuencia de pago del cupón. Por defecto 'anual'. */
  frecuenciaCupon?: FrecuenciaCupon;
  /**
   * Para modo 'calcular_tir': precio de mercado del bono (€).
   * Para modo 'calcular_precio': TIR / yield deseado (%).
   */
  valorEntrada: number;
}

export interface ResultadoRendimientoBono {
  /** Modo usado */
  modo: ModoBono;
  /** Valor nominal (€) */
  valorNominal: number;
  /** Tasa de cupón anual (%) */
  tasaCuponAnual: number;
  /** Años al vencimiento */
  anosVencimiento: number;
  /** Frecuencia del cupón */
  frecuenciaCupon: FrecuenciaCupon;
  /** Importe del cupón por período (€) */
  cuponPorPeriodo: number;
  /** Número total de períodos */
  numPeriodos: number;
  /** Precio limpio del bono (€) */
  precioLimpio: number;
  /** TIR (yield to maturity) anual (%) */
  tirAnual: number;
  /** Relación precio/TIR */
  relacionPrecioTIR: string;
  /** Prima/descuento respecto al valor nominal (€ y %) */
  primaDescuento: number;
  /** ¿Cotiza sobre par (precio > nominal), a la par o bajo par? */
  posicionPar: 'sobre_par' | 'a_la_par' | 'bajo_par';
  /** Duración de Macaulay (años) — sensibilidad del precio a cambios en tipos */
  duracionMacaulay: number;
  /** Duración modificada — variación precio por cada 1% de cambio en TIR */
  duracionModificada: number;
  /** Interpretación del resultado */
  interpretacion: string;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

const PERIODOS_POR_ANO: Record<FrecuenciaCupon, number> = {
  anual: 1,
  semestral: 2,
  trimestral: 4,
};

function calcularPrecioBono(nominal: number, cuponPeriodo: number, n: number, tirPeriodo: number): number {
  // Precio = VA cupones + VA nominal
  // VA cupones = C × (1 - (1+r)^-n) / r
  // VA nominal = N / (1+r)^n
  const vaCupones = tirPeriodo === 0
    ? cuponPeriodo * n
    : cuponPeriodo * (1 - Math.pow(1 + tirPeriodo, -n)) / tirPeriodo;
  const vaNominal = nominal / Math.pow(1 + tirPeriodo, n);
  return vaCupones + vaNominal;
}

function calcularTIRBono(nominal: number, cuponPeriodo: number, n: number, precio: number): number {
  // Bisección para encontrar TIR
  let lo = 0.0001;
  let hi = 5.0; // máx 500% por período
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    const p = calcularPrecioBono(nominal, cuponPeriodo, n, mid);
    if (Math.abs(p - precio) < 0.001) return mid;
    if (p > precio) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

function calcularDuracionMacaulay(nominal: number, cuponPeriodo: number, n: number, tirPeriodo: number, precio: number): number {
  let dur = 0;
  for (let t = 1; t <= n; t++) {
    const flujo = t < n ? cuponPeriodo : cuponPeriodo + nominal;
    dur += t * flujo / Math.pow(1 + tirPeriodo, t);
  }
  return dur / precio;
}

// ─── Función principal ─────────────────────────────────────────────────────────

export function calcularRendimientoBono(p: ParametrosRendimientoBono): ResultadoRendimientoBono {
  if (p.tasaCuponAnual < 0) throw new Error('La tasa de cupón no puede ser negativa.');
  if (p.anosVencimiento <= 0) throw new Error('Los años al vencimiento deben ser mayores que cero.');
  if (p.valorEntrada <= 0) throw new Error('El valor de entrada debe ser mayor que cero.');

  const r = (n: number) => Math.round(n * 10000) / 10000; // 4 decimales para TIR
  const r2 = (n: number) => Math.round(n * 100) / 100;

  const nominal = p.valorNominal ?? 1000;
  const frecuencia = p.frecuenciaCupon ?? 'anual';
  const nPerAno = PERIODOS_POR_ANO[frecuencia];
  const numPeriodos = Math.round(p.anosVencimiento * nPerAno);
  const cuponPorPeriodo = r2(nominal * p.tasaCuponAnual / 100 / nPerAno);

  let precioLimpio: number;
  let tirAnual: number;

  if (p.modo === 'calcular_precio') {
    // TIR conocida → calcular precio
    const tirPeriodo = p.valorEntrada / 100 / nPerAno;
    precioLimpio = r2(calcularPrecioBono(nominal, cuponPorPeriodo, numPeriodos, tirPeriodo));
    tirAnual = p.valorEntrada;
  } else {
    // Precio conocido → calcular TIR
    precioLimpio = p.valorEntrada;
    const tirPeriodo = calcularTIRBono(nominal, cuponPorPeriodo, numPeriodos, precioLimpio);
    tirAnual = r(tirPeriodo * nPerAno * 100);
  }

  const tirPeriodoFinal = tirAnual / 100 / nPerAno;
  const primaDescuento = r2(precioLimpio - nominal);
  const posicionPar: 'sobre_par' | 'a_la_par' | 'bajo_par' =
    Math.abs(primaDescuento) < 0.5 ? 'a_la_par' :
    primaDescuento > 0 ? 'sobre_par' : 'bajo_par';

  // Duración de Macaulay
  const durMacaulay = r(calcularDuracionMacaulay(nominal, cuponPorPeriodo, numPeriodos, tirPeriodoFinal, precioLimpio) / nPerAno);
  const durModificada = r(durMacaulay / (1 + tirPeriodoFinal));

  const pctPrimaDesc = r(primaDescuento / nominal * 100);
  const relacionPrecioTIR = tirAnual > p.tasaCuponAnual
    ? 'Bono bajo par: el mercado exige más rentabilidad que el cupón → precio < nominal'
    : tirAnual < p.tasaCuponAnual
      ? 'Bono sobre par: el mercado acepta menos rentabilidad que el cupón → precio > nominal'
      : 'Bono a la par: TIR = cupón → precio = nominal';

  let interpretacion = `Bono ${p.tasaCuponAnual}% a ${p.anosVencimiento} años. `;
  interpretacion += posicionPar === 'sobre_par'
    ? `Cotiza con prima de ${r2(Math.abs(primaDescuento)).toLocaleString('es-ES')} € (+${r2(Math.abs(pctPrimaDesc)).toFixed(2).replace('.', ',')}%). La TIR (${tirAnual.toFixed(2).replace('.', ',')}%) es inferior al cupón. `
    : posicionPar === 'bajo_par'
      ? `Cotiza con descuento de ${r2(Math.abs(primaDescuento)).toLocaleString('es-ES')} € (-${r2(Math.abs(pctPrimaDesc)).toFixed(2).replace('.', ',')}%). La TIR (${tirAnual.toFixed(2).replace('.', ',')}%) supera el cupón. `
      : `Cotiza a la par. TIR ≈ cupón (${tirAnual.toFixed(2).replace('.', ',')}%). `;
  interpretacion += `Duración: ${durMacaulay.toFixed(2).replace('.', ',')} años (por cada +1% en tipos, el precio cae ~${durModificada.toFixed(2).replace('.', ',')}%).`;

  return {
    modo: p.modo,
    valorNominal: nominal,
    tasaCuponAnual: p.tasaCuponAnual,
    anosVencimiento: p.anosVencimiento,
    frecuenciaCupon: frecuencia,
    cuponPorPeriodo,
    numPeriodos,
    precioLimpio,
    tirAnual,
    relacionPrecioTIR,
    primaDescuento,
    posicionPar,
    duracionMacaulay: durMacaulay,
    duracionModificada: durModificada,
    interpretacion,
  };
}
