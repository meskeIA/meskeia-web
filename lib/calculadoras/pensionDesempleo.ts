/**
 * Calculadora de Prestación por Desempleo — lógica pura sin React ni DOM
 * Usada por: MCP server (calcular_pension_desempleo)
 *
 * Calcula la cuantía y duración de la prestación contributiva por desempleo
 * según la LGSS (arts. 266-279) y la LPGE 2025.
 *
 * Fuente: Ley General de la Seguridad Social (LGSS) + IPREM 2025
 */

// ─── Constantes 2025 ───────────────────────────────────────────────────────────

// IPREM 2025 (Real Decreto 145/2024 o RDL equivalente)
const IPREM_2025 = {
  diario: 20,          // €/día (7.200€/año ÷ 360 días)
  mensual: 600,        // €/mes (12 pagas)
  anual14: 8400,       // €/año (con 14 pagas = referencia para cálculo de topes)
  // La SS usa año de 360 días (30 días × 12 meses) para el cálculo de topes:
  // 8.400 / 360 = 23,33 €/día. Verificado contra simulador SEPE 2026-06-09.
  diario14: 8400 / 360,
};

// Tabla días cotizados → días de prestación (LGSS art. 269)
const TABLA_DURACION = [
  { cotizadosMin: 360,  cotizadosMax: 539,  diasPrestacion: 120 },
  { cotizadosMin: 540,  cotizadosMax: 719,  diasPrestacion: 180 },
  { cotizadosMin: 720,  cotizadosMax: 899,  diasPrestacion: 240 },
  { cotizadosMin: 900,  cotizadosMax: 1079, diasPrestacion: 300 },
  { cotizadosMin: 1080, cotizadosMax: 1259, diasPrestacion: 360 },
  { cotizadosMin: 1260, cotizadosMax: 1439, diasPrestacion: 480 },
  { cotizadosMin: 1440, cotizadosMax: 1619, diasPrestacion: 600 },
  { cotizadosMin: 1620, cotizadosMax: Infinity, diasPrestacion: 720 },
];

// Topes mensuales (30 días × IPREM diario 14 pagas × porcentaje)
// = 30 × 23,33 × factor. Verificado contra simulador SEPE 2026-06-09.
const TOPES_2025 = {
  maximo: {
    sinHijos: Math.round(30 * IPREM_2025.diario14 * 1.75),   // 175% = 1.225 €
    con1Hijo: Math.round(30 * IPREM_2025.diario14 * 2.00),   // 200% = 1.400 €
    con2Hijos: Math.round(30 * IPREM_2025.diario14 * 2.25),  // 225% = 1.575 €
  },
  minimo: {
    sinHijos: Math.round(30 * IPREM_2025.diario14 * 0.80),   // 80%  = 560 €
    con1Hijo: Math.round(30 * IPREM_2025.diario14 * 1.07),   // 107% = 749 €
    con2Hijos: Math.round(30 * IPREM_2025.diario14 * 1.20),  // 120% = 840 €
  },
};

// ─── Tipos públicos ────────────────────────────────────────────────────────────

export interface ParametrosPensionDesempleo {
  /**
   * Días cotizados a desempleo en los 6 años anteriores al desempleo.
   * Mínimo para acceder a la prestación: 360 días.
   */
  diasCotizados: number;
  /**
   * Base reguladora mensual = promedio de las bases de cotización
   * por contingencias de desempleo de los 180 días anteriores al desempleo.
   * Si no se sabe, se puede aproximar con el salario bruto mensual.
   */
  baseReguladoraMensual: number;
  /** Número de hijos a cargo (para topes y mínimos) */
  numHijos?: number;
}

export interface ResultadoPensionDesempleo {
  /** ¿Tiene derecho a la prestación? */
  tieneDerechoPrestacion: boolean;
  /** Motivo si no tiene derecho */
  motivoSinDerecho?: string;
  /** Días cotizados */
  diasCotizados: number;
  /** Días de prestación reconocidos */
  diasPrestacion: number;
  /** Meses equivalentes */
  mesesPrestacion: number;
  /** Base reguladora mensual */
  baseReguladora: number;
  /** Cuantía mensual bruta — primeros 6 meses (70% BR) */
  cuantiaPrimeros6Meses: number;
  /** Cuantía mensual bruta — resto de prestación (50% BR) */
  cuantiaResto: number;
  /** Tope máximo mensual aplicado */
  topeMaximo: number;
  /** Tope mínimo mensual aplicado */
  topeMinimo: number;
  /** Cuantía efectiva primeros 6 meses (tras aplicar topes) */
  cuantiaEfectivaPrimeros6: number;
  /** Cuantía efectiva resto */
  cuantiaEfectivaResto: number;
  /** Total prestación bruta estimada */
  totalPrestacionBruta: number;
  /** ¿Se aplica tope máximo? */
  aplicaTopeMaximo: boolean;
  /** ¿Se aplica tope mínimo en algún tramo? */
  aplicaTopeMinimo: boolean;
  /** Fuente normativa */
  fuenteDatos: string;
}

// ─── Función principal ─────────────────────────────────────────────────────────

export function calcularPensionDesempleo(p: ParametrosPensionDesempleo): ResultadoPensionDesempleo {
  if (p.baseReguladoraMensual <= 0) throw new Error('La base reguladora debe ser mayor que cero.');
  if (p.diasCotizados < 0) throw new Error('Los días cotizados no pueden ser negativos.');

  const r = (n: number) => Math.round(n * 100) / 100;
  const numHijos = p.numHijos ?? 0;

  // ─── Derecho a prestación ──────────────────────────────────────────────────

  if (p.diasCotizados < 360) {
    return {
      tieneDerechoPrestacion: false,
      motivoSinDerecho: `No alcanza el mínimo de 360 días cotizados en los últimos 6 años (tienes ${p.diasCotizados} días). Puede acceder al subsidio por desempleo si cumple otros requisitos.`,
      diasCotizados: p.diasCotizados,
      diasPrestacion: 0,
      mesesPrestacion: 0,
      baseReguladora: r(p.baseReguladoraMensual),
      cuantiaPrimeros6Meses: 0,
      cuantiaResto: 0,
      topeMaximo: 0,
      topeMinimo: 0,
      cuantiaEfectivaPrimeros6: 0,
      cuantiaEfectivaResto: 0,
      totalPrestacionBruta: 0,
      aplicaTopeMaximo: false,
      aplicaTopeMinimo: false,
      fuenteDatos: 'LGSS arts. 266-279 + IPREM 2025',
    };
  }

  // ─── Duración ────────────────────────────────────────────────────────────────

  const tramo = TABLA_DURACION.find(
    t => p.diasCotizados >= t.cotizadosMin && p.diasCotizados <= t.cotizadosMax
  ) ?? TABLA_DURACION[TABLA_DURACION.length - 1];
  const diasPrestacion = tramo.diasPrestacion;
  const mesesPrestacion = Math.round(diasPrestacion / 30);

  // ─── Cuantías ────────────────────────────────────────────────────────────────

  const cuantiaPrimeros6 = r(p.baseReguladoraMensual * 0.70);
  // Art. 270.1 LGSS: 60 % a partir del día 181 (reformado; antes 50 %).
  // Verificado contra simulador SEPE 2026-06-09.
  const cuantiaResto = r(p.baseReguladoraMensual * 0.60);

  // Topes según número de hijos
  let topeMaximo: number;
  let topeMinimo: number;
  if (numHijos === 0) {
    topeMaximo = TOPES_2025.maximo.sinHijos;
    topeMinimo = TOPES_2025.minimo.sinHijos;
  } else if (numHijos === 1) {
    topeMaximo = TOPES_2025.maximo.con1Hijo;
    topeMinimo = TOPES_2025.minimo.con1Hijo;
  } else {
    topeMaximo = TOPES_2025.maximo.con2Hijos;
    topeMinimo = TOPES_2025.minimo.con2Hijos;
  }

  const aplicaTopeMaximo = cuantiaPrimeros6 > topeMaximo || cuantiaResto > topeMaximo;
  const aplicaTopeMinimoPrimeros = cuantiaPrimeros6 < topeMinimo;
  const aplicaTopeMinimo = aplicaTopeMinimoPrimeros || cuantiaResto < topeMinimo;

  const cuantiaEfectivaPrimeros6 = r(Math.min(Math.max(cuantiaPrimeros6, topeMinimo), topeMaximo));
  const cuantiaEfectivaResto = r(Math.min(Math.max(cuantiaResto, topeMinimo), topeMaximo));

  // Total bruto: primeros 180 días a la cuantía alta, resto a la baja
  const diasPrimerosTramo = Math.min(diasPrestacion, 180);
  const diasSegundoTramo = Math.max(0, diasPrestacion - 180);

  const totalPrestacionBruta = r(
    cuantiaEfectivaPrimeros6 * (diasPrimerosTramo / 30) +
    cuantiaEfectivaResto * (diasSegundoTramo / 30)
  );

  return {
    tieneDerechoPrestacion: true,
    diasCotizados: p.diasCotizados,
    diasPrestacion,
    mesesPrestacion,
    baseReguladora: r(p.baseReguladoraMensual),
    cuantiaPrimeros6Meses: cuantiaPrimeros6,
    cuantiaResto,
    topeMaximo,
    topeMinimo,
    cuantiaEfectivaPrimeros6,
    cuantiaEfectivaResto,
    totalPrestacionBruta,
    aplicaTopeMaximo,
    aplicaTopeMinimo,
    fuenteDatos: 'LGSS arts. 266-279 + IPREM 2025 (600€/mes). Cuantías orientativas — el SEPE calcula la prestación exacta.',
  };
}
