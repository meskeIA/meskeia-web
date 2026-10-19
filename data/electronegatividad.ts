/**
 * Electronegatividad de los 118 elementos, en la escala de Pauling (adimensional).
 *
 * ── Fuente ──
 * Escala de Pauling revisada por Allred (J. Inorg. Nucl. Chem. 17, 215, 1961), según la
 * tabulan el CRC Handbook, WebElements y el Lange. Serie cotejada el 26/09/2026 para
 * simulador-tabla-periodica-tendencias (hallazgos 1953, 1958 y 1959 del Inspector) y otra
 * vez el 19/10/2026 contra «Electronegativities of the elements (data page)» (hallazgo 3361).
 * Sin dato donde ninguna de las tres da valor: gases nobles salvo Kr y Xe, Lr y Z ≥ 104.
 *
 * ── Por qué UNA sola serie y en un módulo común ──
 * Lo mismo que con el radio (data/radios-atomicos.ts, hallazgo 2281): tabla-periodica y
 * tendencias llevaban cada una su copia, y el 16/10/2026 el Inspector encontró cinco
 * diferencias (hallazgo 3361, cabo C0056). tabla-periodica no citaba fuente y daba:
 *
 * · Rn 2,20 y Lr 1,30, que ninguna de las tres fuentes da. El 1,3 del Lr sale de otra
 *   compilación (Brown, 2012), fuera de la serie: mezclarla es justo lo que deshizo el radio.
 * · Pm 1,13, Eu 1,20 y Tb 1,20. El CRC y WebElements dan 1,1 para el Tb y un intervalo de 1,1
 *   a 1,2 para el Pm y el Eu; la serie toma el 1,1 que dan las dos fuentes, el mismo criterio
 *   que ya seguía tendencias.
 *
 * Las dos apps leen de aquí desde el 19/10/2026, así que ya no pueden volver a divergir. Un test
 * de tests/apps/tabla-periodica.spec.ts coteja las dos con este módulo.
 *
 * ⚠️ Es una lista posicional (índice = Z − 1). Al tocarla, comprobar que sigue midiendo 118:
 * `electronegatividadPauling` devuelve null fuera de rango en vez de leer el vecino.
 */

export const ELECTRONEGATIVIDAD_META = {
  magnitud: 'Electronegatividad en la escala de Pauling',
  fuente: 'Pauling revisada por Allred (1961), según el CRC Handbook, WebElements y el Lange',
  verificado: '19/10/2026',
} as const;

/** Electronegatividad de Pauling en orden de número atómico: posición 0 = H (Z = 1). */
export const ELECTRONEGATIVIDAD_PAULING: readonly (number | null)[] = [
  2.2,  null, 0.98, 1.57, 2.04, 2.55, 3.04, 3.44, 3.98, null, // H–Ne (Z 1–10)
  0.93, 1.31, 1.61, 1.9,  2.19, 2.58, 3.16, null, 0.82, 1,    // Na–Ca (Z 11–20)
  1.36, 1.54, 1.63, 1.66, 1.55, 1.83, 1.88, 1.91, 1.9,  1.65, // Sc–Zn (Z 21–30)
  1.81, 2.01, 2.18, 2.55, 2.96, 3,    0.82, 0.95, 1.22, 1.33, // Ga–Zr (Z 31–40)
  1.6,  2.16, 1.9,  2.2,  2.28, 2.2,  1.93, 1.69, 1.78, 1.96, // Nb–Sn (Z 41–50)
  2.05, 2.1,  2.66, 2.6,  0.79, 0.89, 1.1,  1.12, 1.13, 1.14, // Sb–Nd (Z 51–60)
  1.1,  1.17, 1.1,  1.2,  1.1,  1.22, 1.23, 1.24, 1.25, 1.1,  // Pm–Yb (Z 61–70)
  1.27, 1.3,  1.5,  2.36, 1.9,  2.2,  2.2,  2.28, 2.54, 2,    // Lu–Hg (Z 71–80)
  1.62, 2.33, 2.02, 2,    2.2,  null, 0.7,  0.9,  1.1,  1.3,  // Tl–Th (Z 81–90)
  1.5,  1.38, 1.36, 1.28, 1.3,  1.3,  1.3,  1.3,  1.3,  1.3,  // Pa–Fm (Z 91–100)
  1.3,  1.3,  null, null, null, null, null, null, null, null, // Md–Ds (Z 101–110)
  null, null, null, null, null, null, null, null,             // Rg–Og (Z 111–118)
];

/** Electronegatividad de Pauling del elemento Z, o null si la serie no le da valor. */
export function electronegatividadPauling(z: number): number | null {
  if (!Number.isInteger(z) || z < 1 || z > ELECTRONEGATIVIDAD_PAULING.length) return null;
  return ELECTRONEGATIVIDAD_PAULING[z - 1];
}
