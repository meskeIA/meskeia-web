/**
 * Serie histórica del IPC de España (INE) — Base 2025 = 100
 *
 * Índice general nacional, medias anuales. Compartida por estimador-inflacion (euros de un año
 * -> euros de otro) y conversor-pesetas-euros (pesetas históricas -> valor real hoy), que
 * necesita la misma serie para los años anteriores a la adopción del euro.
 *
 * DE DÓNDE SALE CADA TRAMO (regenerado el 19/09/2026 contra la fuente):
 *
 *   · 2002-2025 — media aritmética de los 12 índices mensuales publicados por el INE en la
 *     tabla 24077 (`Índice general nacional. Series desde enero de 1961`), que es la serie viva
 *     y la única que seguirá creciendo. Dato duro, sin transformar.
 *
 *   · 1961-2001 — el INE ya no sirve índices anteriores a 2002: de ese tramo solo publica las
 *     TASAS de variación (tabla 76134). La serie se reconstruye hacia atrás mes a mes desde los
 *     índices de 2002, dividiendo cada mes por su tasa de variación anual, y promediando después
 *     los 12 meses de cada año.
 *
 * POR QUÉ HAY QUE VALIDARLO Y CÓMO SE HIZO: las tasas publicadas vienen redondeadas a una
 * décima, así que encadenar cuarenta años podría arrastrar una deriva invisible. El árbitro es
 * el Actualizador de Rentas del INE (https://www.ine.es/varipc/), que da la variación acumulada
 * entre dos meses SIN encadenar y por tanto sin ese arrastre. Se cotejaron los 12 meses de
 * 1961, 1975, 1985, 1995 y 2000: la desviación máxima es del 0,055 %.
 *
 * El 2025 figura como 100 exacto porque así lo define la base; promediar los doce índices
 * mensuales tal como el INE los publica, redondeados a tres decimales, devuelve 100,0001.
 *
 * ⚠️ LA BASE ES 2025 = 100, NO 2021. El IPC base 2021 terminó en diciembre de 2025 y desde enero
 * de 2026 el INE publica en base 2025, que es la que se adopta aquí para que la actualización
 * anual sea copiar un número de la tabla viva y no enlazar dos bases a mano.
 *
 * CÓMO SE ACTUALIZA (cada enero, cuando el INE cierra el año anterior): media de los 12 índices
 * mensuales de ese año en la tabla 24077. La serie se puede descargar entera con
 *   curl "https://servicios.ine.es/wstempus/js/ES/DATOS_TABLA/24077?nult=800"
 * Es contenido YMYL: el dato se sustituye con la fuente consultada, nunca con una tasa citada
 * de segunda mano.
 *
 * DE QUÉ SE VIENE: hasta el 19/09/2026 esta serie estaba en una escala que no correspondía a
 * ninguna base publicada por el INE y tenía tres eslabones mal empalmados —2001, 2013 y un 2025
 * que nació estimado—, que se acumulaban y dejaban cualquier peseta anterior a 2001 un 3,73 %
 * por debajo de su valor real de hoy. El 2025 estimado lo encontró el Inspector (hallazgo 916,
 * 18/09/2026); los otros dos aparecieron al cotejar la serie entera con la fuente.
 */

export const IPC_DATA: Record<number, number> = {
  1961: 2.1228, 1962: 2.2442, 1963: 2.4403, 1964: 2.6106, 1965: 2.9557,
  1966: 3.1401, 1967: 3.341, 1968: 3.5061, 1969: 3.5819, 1970: 3.7873,
  1971: 4.0998, 1972: 4.4388, 1973: 4.9461, 1974: 5.7216, 1975: 6.6913,
  1976: 7.8718, 1977: 9.803, 1978: 11.7418, 1979: 13.5814, 1980: 15.6954,
  1981: 17.9779, 1982: 20.569, 1983: 23.0722, 1984: 25.6747, 1985: 27.9389,
  1986: 30.3965, 1987: 31.9939, 1988: 33.5476, 1989: 35.8273, 1990: 38.2389,
  1991: 40.5088, 1992: 42.912, 1993: 44.8721, 1994: 46.9907, 1995: 49.1865,
  1996: 50.9399, 1997: 51.9449, 1998: 52.9006, 1999: 54.1139, 2000: 55.9782,
  2001: 57.9905, 2002: 60.0363, 2003: 61.8608, 2004: 63.7411, 2005: 65.8881,
  2006: 68.2046, 2007: 70.1052, 2008: 72.9624, 2009: 72.7523, 2010: 74.0618,
  2011: 76.4288, 2012: 78.2983, 2013: 79.4012, 2014: 79.2814, 2015: 78.8847,
  2016: 78.7248, 2017: 80.2645, 2018: 81.6093, 2019: 82.1799, 2020: 81.9148,
  2021: 84.4485, 2022: 91.5341, 2023: 94.7675, 2024: 97.3964, 2025: 100,
};

export const IPC_META = {
  fuente: 'INE · Índice de Precios de Consumo, índice general nacional (base 2025), medias anuales',
  verificado: '2026-09-19',
  urlOficial: 'https://www.ine.es/jaxiT3/Tabla.htm?t=24077',
  nota: 'Medias anuales del índice general del INE. Los años 2002-2025 son el dato publicado; los anteriores a 2002, que el INE ya solo publica como tasas de variación, se reconstruyen desde ellas y se han cotejado con el Actualizador de Rentas del INE (desviación máxima del 0,055 %). La conversión peseta-euro (166,386) no depende de esta serie: es un tipo legal exacto del Reglamento (CE) 2866/98.',
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
