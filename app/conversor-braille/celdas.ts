/**
 * Aritmética de las celdas braille de Unicode (U+2800-U+28FF), sin React ni dependencias.
 *
 * El bloque codifica los puntos en bits: U+2800 + bit (n − 1) de cada punto n. `⠙` es U+2819 =
 * 0b00011001 → puntos 1-4-5. De aquí salen los puntos de TODA celda que la app dibuja, en la vista
 * de celdas y en la hoja a escala real.
 *
 * ⚠️ 24/10/2026 (hallazgo 3456) — Vive en un .ts aparte para que `check:braille` pueda IMPORTARLO
 * y ejecutarlo. Antes la vista y la hoja sacaban los puntos de una tabla de las 50 celdas que la
 * app escribe (`brailleDots`), y desde que una celda pegada pasa tal cual al resultado (3434), las
 * otras 14 de seis puntos se dibujaban en blanco: en la hoja, una separación de palabra.
 */

/** Celda Unicode de un conjunto de puntos: U+2800 + bit (n − 1) de cada punto n. */
export function celdaDePuntos(puntos: Iterable<number>): string {
  let bits = 0;
  for (const p of puntos) bits |= 1 << (p - 1);
  return String.fromCodePoint(0x2800 + bits);
}

/** ¿Es una celda del bloque braille de Unicode (U+2800-U+28FF)? */
export function esCeldaBraille(caracter: string): boolean {
  const codigo = caracter.codePointAt(0) ?? 0;
  return codigo >= 0x2800 && codigo <= 0x28ff;
}

/**
 * Puntos de una celda Unicode, en orden (⠇ → [1, 2, 3]). Cuenta también los puntos 7 y 8 de las
 * celdas de ocho puntos (⡀ → [7]), que antes salían como «Espacio».
 *
 * ⚠️ 23/10/2026 (hallazgo 3437) — restaba U+2800 a CUALQUIER carácter y leía los bits de un
 * número negativo: la «a» en tinta (0x61 − 0x2800 = −10143) daba los puntos 1-6. Lo que no es
 * celda braille devuelve [].
 */
export function puntosDeCelda(celda: string): number[] {
  if (!esCeldaBraille(celda)) return [];
  const bits = (celda.codePointAt(0) ?? 0x2800) - 0x2800;
  return [1, 2, 3, 4, 5, 6, 7, 8].filter((p) => bits & (1 << (p - 1)));
}
