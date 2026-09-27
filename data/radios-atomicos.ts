/**
 * Radio covalente de enlace sencillo de los 118 elementos, en picómetros (pm).
 *
 * ── Fuente ──
 * P. Pyykkö y M. Atsumi, «Molecular Single-Bond Covalent Radii for Elements 1–118»,
 * Chem. Eur. J. 15, 186-197 (2009). Es la única serie AUTOCONSISTENTE que cubre los 118
 * elementos: la mitad de la distancia entre dos núcleos unidos por un enlace sencillo,
 * ajustada con longitudes de enlace medidas y calculadas. Tabla cotejada el 26/09/2026 con
 * «Covalent radius» y «Atomic radii of the elements (data page)» (hallazgo 1953 del
 * Inspector, en simulador-tabla-periodica-tendencias).
 *
 * ── Por qué UNA sola serie y en un módulo común ──
 * «Radio atómico» no es una magnitud: hay varias escalas (calculada de Clementi 1967,
 * empírica de Slater 1964, van der Waals, covalente, metálica…) y sus cifras no coinciden.
 * Dos apps mezclaban tres de ellas sin rotularlas, y la mezcla fabricaba tendencias falsas:
 *
 * · simulador-tabla-periodica-tendencias (hallazgo 1953, 26/09/2026): Clementi para Z 1-86,
 *   van der Waals para Fr, Ra y actínidos y covalente desde el 104, así que el período 7
 *   salía más pequeño que el 4.
 * · tabla-periodica (hallazgo 2281, 27/09/2026): Clementi para Z 1-56 y 59-86, Slater para
 *   La y Ce, van der Waals para Z 87-99. La guía comparaba el Fr (348 pm, vdW) con el Cs
 *   (298 pm, Clementi) — 50 pm de artefacto: en van der Waals se llevan 5 pm, y en esta
 *   serie el Fr (223) es incluso MENOR que el Cs (232), por la contracción relativista 7s.
 *
 * Las dos apps leen de aquí (tendencias desde el 27/09/2026, cuando borró su copia en línea),
 * así que ya no pueden volver a divergir. Un test de tests/apps/tabla-periodica.spec.ts coteja
 * las dos con este módulo por si alguien vuelve a teclear una serie propia.
 *
 * ── Desde el fermio (Z ≥ 100) ──
 * No se ha medido ninguna longitud de enlace: los valores de la serie son solo teóricos.
 * `RADIO_SOLO_TEORICO_DESDE_Z` lo declara para que cada vista decida cómo mostrarlo.
 *
 * ⚠️ Es una lista posicional (índice = Z − 1). Al tocarla, comprobar que sigue midiendo
 * 118: `radioCovalente` devuelve null fuera de rango en vez de leer el vecino.
 */

export const RADIOS_ATOMICOS_META = {
  magnitud: 'Radio covalente de enlace sencillo',
  fuente: 'Pyykkö y Atsumi, Chem. Eur. J. 15, 186-197 (2009)',
  fuenteCorta: 'Pyykkö y Atsumi, 2009',
  unidad: 'pm',
  verificado: '26/09/2026',
} as const;

/** Primer Z para el que la serie no tiene ninguna longitud de enlace medida detrás. */
export const RADIO_SOLO_TEORICO_DESDE_Z = 100;

/** Radio covalente en pm, en orden de número atómico: posición 0 = H (Z = 1). */
export const RADIO_COVALENTE_PM: readonly number[] = [
  32,  46,  133, 102, 85,  75,  71,  63,  64,  67,  // H–Ne (Z 1–10)
  155, 139, 126, 116, 111, 103, 99,  96,  196, 171, // Na–Ca (Z 11–20)
  148, 136, 134, 122, 119, 116, 111, 110, 112, 118, // Sc–Zn (Z 21–30)
  124, 121, 121, 116, 114, 117, 210, 185, 163, 154, // Ga–Zr (Z 31–40)
  147, 138, 128, 125, 125, 120, 128, 136, 142, 140, // Nb–Sn (Z 41–50)
  140, 136, 133, 131, 232, 196, 180, 163, 176, 174, // Sb–Nd (Z 51–60)
  173, 172, 168, 169, 168, 167, 166, 165, 164, 170, // Pm–Yb (Z 61–70)
  162, 152, 146, 137, 131, 129, 122, 123, 124, 133, // Lu–Hg (Z 71–80)
  144, 144, 151, 145, 147, 142, 223, 201, 186, 175, // Tl–Th (Z 81–90)
  169, 170, 171, 172, 166, 166, 168, 168, 165, 167, // Pa–Fm (Z 91–100)
  173, 176, 161, 157, 149, 143, 141, 134, 129, 128, // Md–Ds (Z 101–110)
  121, 122, 136, 143, 162, 175, 165, 157,           // Rg–Og (Z 111–118)
];

/** Radio covalente del elemento de número atómico `z`, o null si `z` no está entre 1 y 118. */
export function radioCovalente(z: number): number | null {
  if (!Number.isInteger(z) || z < 1 || z > RADIO_COVALENTE_PM.length) return null;
  return RADIO_COVALENTE_PM[z - 1];
}
