/**
 * Calculadora de Estadísticas Básicas — lógica pura sin React ni DOM
 * Usada por: MCP server (calcular_estadisticas)
 *
 * Calcula los principales descriptores estadísticos de un conjunto de datos:
 * media, mediana, moda, varianza, desviación típica, percentiles y más.
 *
 * Muy útil para analizar series de datos financieros, rendimientos, precios, etc.
 * Encadenable con: cualquier tool que devuelva series de valores.
 */

// ─── Tipos públicos ────────────────────────────────────────────────────────────

export interface ParametrosEstadisticas {
  /** Lista de valores numéricos a analizar (mínimo 2 valores) */
  valores: number[];
  /** Nombre descriptivo del conjunto de datos (ej: "Rendimientos mensuales 2024") */
  nombre?: string;
  /** Número de decimales para los resultados. Por defecto 4 */
  decimales?: number;
}

export interface ResultadoEstadisticas {
  /** Número de elementos */
  n: number;
  /** Suma de todos los valores */
  suma: number;
  /** Media aritmética */
  media: number;
  /** Mediana (valor central) */
  mediana: number;
  /** Moda (valor más frecuente). Puede ser null si todos son únicos. */
  moda: number[] | null;
  /** Mínimo */
  minimo: number;
  /** Máximo */
  maximo: number;
  /** Rango (máximo - mínimo) */
  rango: number;
  /** Varianza poblacional (dividida entre n) */
  varianzaPoblacional: number;
  /** Varianza muestral (dividida entre n-1) */
  varianzaMuestral: number;
  /** Desviación típica poblacional */
  desviacionTipicaPoblacional: number;
  /** Desviación típica muestral */
  desviacionTipicaMuestral: number;
  /** Coeficiente de variación (%) — dispersión relativa */
  coeficienteVariacion: number;
  /** Percentil 25 (Q1) */
  q1: number;
  /** Percentil 50 = mediana */
  q2: number;
  /** Percentil 75 (Q3) */
  q3: number;
  /** Rango intercuartílico (Q3 - Q1) */
  ric: number;
  /** Asimetría de Fisher (skewness) */
  asimetria: number;
  /** Valores ordenados de menor a mayor */
  ordenados: number[];
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function percentil(ordenados: number[], p: number): number {
  const n = ordenados.length;
  const pos = (p / 100) * (n - 1);
  const inferior = Math.floor(pos);
  const superior = Math.ceil(pos);
  if (inferior === superior) return ordenados[inferior];
  return ordenados[inferior] + (pos - inferior) * (ordenados[superior] - ordenados[inferior]);
}

// ─── Función principal ─────────────────────────────────────────────────────────

export function calcularEstadisticas(p: ParametrosEstadisticas): ResultadoEstadisticas {
  if (!p.valores || p.valores.length < 2) {
    throw new Error('Se necesitan al menos 2 valores para calcular estadísticas.');
  }
  if (p.valores.length > 1000) {
    throw new Error('Máximo 1.000 valores por cálculo.');
  }
  for (const v of p.valores) {
    if (!isFinite(v)) throw new Error('Todos los valores deben ser números finitos.');
  }

  const dec = p.decimales ?? 4;
  const round = (n: number) => Math.round(n * Math.pow(10, dec)) / Math.pow(10, dec);

  const n = p.valores.length;
  const ordenados = [...p.valores].sort((a, b) => a - b);
  const suma = round(p.valores.reduce((s, v) => s + v, 0));
  const media = round(suma / n);

  // Mediana
  const mediana = round(percentil(ordenados, 50));

  // Moda
  const frecuencias = new Map<number, number>();
  for (const v of p.valores) {
    frecuencias.set(v, (frecuencias.get(v) ?? 0) + 1);
  }
  const maxFrecuencia = Math.max(...frecuencias.values());
  let moda: number[] | null = null;
  if (maxFrecuencia > 1) {
    moda = [...frecuencias.entries()]
      .filter(([, f]) => f === maxFrecuencia)
      .map(([v]) => v)
      .sort((a, b) => a - b);
  }

  // Mínimo y máximo
  const minimo = ordenados[0];
  const maximo = ordenados[n - 1];
  const rango = round(maximo - minimo);

  // Varianzas
  const sumaCuadrados = p.valores.reduce((s, v) => s + Math.pow(v - media, 2), 0);
  const varianzaPoblacional = round(sumaCuadrados / n);
  const varianzaMuestral = round(sumaCuadrados / (n - 1));
  const desviacionTipicaPoblacional = round(Math.sqrt(varianzaPoblacional));
  const desviacionTipicaMuestral = round(Math.sqrt(varianzaMuestral));
  const coeficienteVariacion = media !== 0
    ? round(Math.abs(desviacionTipicaMuestral / media) * 100)
    : 0;

  // Percentiles
  const q1 = round(percentil(ordenados, 25));
  const q2 = mediana;
  const q3 = round(percentil(ordenados, 75));
  const ric = round(q3 - q1);

  // Asimetría de Fisher (skewness muestral)
  let asimetria = 0;
  if (n >= 3 && desviacionTipicaMuestral > 0) {
    const sumaCubos = p.valores.reduce((s, v) => s + Math.pow(v - media, 3), 0);
    asimetria = round((n * sumaCubos) / ((n - 1) * (n - 2) * Math.pow(desviacionTipicaMuestral, 3)));
  }

  return {
    n,
    suma,
    media,
    mediana,
    moda,
    minimo,
    maximo,
    rango,
    varianzaPoblacional,
    varianzaMuestral,
    desviacionTipicaPoblacional,
    desviacionTipicaMuestral,
    coeficienteVariacion,
    q1,
    q2,
    q3,
    ric,
    asimetria,
    ordenados,
  };
}
