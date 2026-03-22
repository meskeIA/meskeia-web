/**
 * Calculadora de Inflación / Poder Adquisitivo — lógica pura sin React ni DOM
 * Usada por: MCP server (calcular_inflacion)
 *
 * Calcula el equivalente actual de una cantidad histórica (o viceversa)
 * usando el IPC histórico de España (base 2021 = 100).
 *
 * Fuente: INE — Índice de Precios de Consumo (IPC) España
 */

// ─── IPC España por año (base 2021 = 100) ─────────────────────────────────────
// Fuente: INE. 2025 estimado.

const IPC_ESPANA: Record<number, number> = {
  1961: 2.91,  1962: 3.08,  1963: 3.33,  1964: 3.55,  1965: 3.84,
  1966: 4.04,  1967: 4.33,  1968: 4.55,  1969: 4.65,  1970: 4.89,
  1971: 5.31,  1972: 5.79,  1973: 6.53,  1974: 7.77,  1975: 9.08,
  1976: 10.77, 1977: 13.28, 1978: 15.47, 1979: 17.65, 1980: 20.70,
  1981: 23.76, 1982: 26.70, 1983: 29.44, 1984: 32.16, 1985: 34.38,
  1986: 37.06, 1987: 38.85, 1988: 40.86, 1989: 43.60, 1990: 46.30,
  1991: 49.02, 1992: 51.44, 1993: 53.72, 1994: 56.03, 1995: 58.37,
  1996: 60.10, 1997: 61.32, 1998: 62.35, 1999: 63.87, 2000: 66.06,
  2001: 68.50, 2002: 70.35, 2003: 72.37, 2004: 74.35, 2005: 76.75,
  2006: 79.07, 2007: 81.63, 2008: 84.87, 2009: 83.98, 2010: 85.62,
  2011: 88.29, 2012: 90.54, 2013: 91.82, 2014: 91.30, 2015: 91.07,
  2016: 91.10, 2017: 92.95, 2018: 95.11, 2019: 95.89, 2020: 95.14,
  2021: 100.00, 2022: 110.80, 2023: 116.40, 2024: 120.30, 2025: 123.20,
};

// ─── Tipos públicos ────────────────────────────────────────────────────────────

export interface ParametrosInflacion {
  /** Cantidad en euros */
  cantidad: number;
  /** Año de origen */
  anoOrigen: number;
  /** Año destino (puede ser igual o mayor/menor al origen) */
  anoDestino: number;
}

export interface ResultadoInflacion {
  /** Cantidad en el año origen */
  cantidadOrigen: number;
  /** Año origen */
  anoOrigen: number;
  /** IPC del año origen */
  ipcOrigen: number;
  /** Año destino */
  anoDestino: number;
  /** IPC del año destino */
  ipcDestino: number;
  /** Valor equivalente en el año destino */
  valorEquivalente: number;
  /** Diferencia respecto al origen */
  diferencia: number;
  /** Inflación acumulada en el período (%) */
  inflacionAcumulada: number;
  /** Inflación media anual (CAGR, %) */
  inflacionMediaAnual: number;
  /** Número de años del período */
  anos: number;
  /** ¿El poder adquisitivo aumentó o disminuyó? */
  poderadquisitivoAumento: boolean;
  /** Fuente de datos */
  fuenteDatos: string;
}

// ─── Función principal ─────────────────────────────────────────────────────────

export function calcularInflacion(p: ParametrosInflacion): ResultadoInflacion {
  if (p.cantidad <= 0) throw new Error('La cantidad debe ser mayor que cero.');

  const anosDisponibles = Object.keys(IPC_ESPANA).map(Number);
  const minAno = Math.min(...anosDisponibles);
  const maxAno = Math.max(...anosDisponibles);

  if (!IPC_ESPANA[p.anoOrigen]) {
    throw new Error(`Año origen ${p.anoOrigen} no disponible. Rango disponible: ${minAno}-${maxAno}.`);
  }
  if (!IPC_ESPANA[p.anoDestino]) {
    throw new Error(`Año destino ${p.anoDestino} no disponible. Rango disponible: ${minAno}-${maxAno}.`);
  }

  const r = (n: number) => Math.round(n * 100) / 100;

  const ipcOrigen = IPC_ESPANA[p.anoOrigen];
  const ipcDestino = IPC_ESPANA[p.anoDestino];

  const valorEquivalente = r(p.cantidad * ipcDestino / ipcOrigen);
  const diferencia = r(valorEquivalente - p.cantidad);
  const inflacionAcumulada = r(((ipcDestino - ipcOrigen) / ipcOrigen) * 100);
  const anos = Math.abs(p.anoDestino - p.anoOrigen);

  let inflacionMediaAnual = 0;
  if (anos > 0) {
    inflacionMediaAnual = r(((ipcDestino / ipcOrigen) ** (1 / anos) - 1) * 100);
  }

  // ¿El poder adquisitivo del receptor en el año destino mejoró?
  // Si el año destino > origen: el valor equivalente > cantidad = perdida poder adquisitivo
  // Si el año destino < origen: calculamos hacia atrás
  const poderadquisitivoAumento = p.anoDestino > p.anoOrigen ? false : valorEquivalente > p.cantidad;

  return {
    cantidadOrigen: p.cantidad,
    anoOrigen: p.anoOrigen,
    ipcOrigen,
    anoDestino: p.anoDestino,
    ipcDestino,
    valorEquivalente,
    diferencia,
    inflacionAcumulada,
    inflacionMediaAnual,
    anos,
    poderadquisitivoAumento,
    fuenteDatos: 'INE — Índice de Precios de Consumo (IPC) España (base 2021=100). 2025 estimado.',
  };
}
