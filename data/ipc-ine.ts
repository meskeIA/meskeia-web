/**
 * Serie histórica del IPC de España (INE) — Base 2021 = 100
 * Fuente: Instituto Nacional de Estadística (INE)
 *
 * Compartida por estimador-inflacion (euros de un año -> euros de otro) y
 * conversor-pesetas-euros (pesetas históricas -> valor real hoy), que necesita
 * la misma serie para los años anteriores a la adopción del euro.
 */

export const IPC_DATA: Record<number, number> = {
  1961: 3.42, 1962: 3.62, 1963: 3.94, 1964: 4.22, 1965: 4.78,
  1966: 5.07, 1967: 5.40, 1968: 5.66, 1969: 5.78, 1970: 6.11,
  1971: 6.61, 1972: 7.16, 1973: 7.98, 1974: 9.24, 1975: 10.80,
  1976: 12.71, 1977: 15.83, 1978: 18.96, 1979: 21.93, 1980: 25.30,
  1981: 28.96, 1982: 33.13, 1983: 37.17, 1984: 41.36, 1985: 44.99,
  1986: 48.96, 1987: 51.53, 1988: 54.02, 1989: 57.69, 1990: 61.57,
  1991: 65.21, 1992: 69.06, 1993: 72.21, 1994: 75.61, 1995: 79.14,
  1996: 81.94, 1997: 83.56, 1998: 85.03, 1999: 87.00, 2000: 90.00,
  2001: 92.52, 2002: 95.77, 2003: 98.58, 2004: 101.55, 2005: 104.99,
  2006: 108.66, 2007: 111.71, 2008: 116.28, 2009: 116.05, 2010: 117.93,
  2011: 121.57, 2012: 124.52, 2013: 124.72, 2014: 124.50, 2015: 123.87,
  2016: 123.47, 2017: 125.94, 2018: 128.11, 2019: 129.02, 2020: 128.61,
  2021: 132.63, 2022: 143.55, 2023: 148.40, 2024: 152.50,
  2025: 155.00, // Valor estimado — actualizar cuando el INE publique el IPC real de 2025
};

export const IPC_YEARS = Object.keys(IPC_DATA).map(Number).sort((a, b) => a - b);
export const IPC_MIN_YEAR = IPC_YEARS[0];
export const IPC_MAX_YEAR = IPC_YEARS[IPC_YEARS.length - 1];

/**
 * Tipo de cambio fijo peseta/euro — Reglamento (CE) 2866/98, en vigor desde el
 * 01/01/1999. La peseta circuló como efectivo hasta el 28/02/2002. Es un tipo
 * de conversión legal exacto, no una estimación.
 */
export const TASA_FIJA_PESETA_EURO = 166.386;
