/**
 * La posición de la sonda como TEXTO: leerla de lo que se teclea, escribirla en el campo y
 * redondearla al paso del teclado. Sin React: lo usan los dos campos de «Posición exacta de la
 * sonda» y las flechas del lienzo, y lo prueba el spec sin abrir el navegador.
 *
 * ── De dónde sale (Inspector, 28/09/2026, hallazgos 2383, 2384 y 2385) ──
 * Los campos eran `<input type="number">` controlados que pasaban `e.target.value` por
 * `parseSpanishNumberOr`. Ese `value` llega VACÍO en los estados intermedios de lo que se
 * teclea («-», «1.»), el parser lo convertía en 0 y React reescribía el campo bajo el cursor:
 * «-1» acababa en 1,00 m y «2.75» en el borde, 4,00 m. Y llega SIEMPRE con punto decimal, así
 * que «1,234» tecleado en es-ES se leía como mil doscientos treinta y cuatro. Ahora el campo es
 * de texto, conserva lo tecleado mientras tiene el foco y solo mueve la sonda cuando lo escrito
 * ya es un número: el navegador y su configuración regional dejan de intervenir.
 */

import { formatNumber, parseSpanishNumber } from '@/lib';

/**
 * Lo que el campo deja escribir: signo (también el menos tipográfico «−» y la raya «–», que
 * pegan algunos teclados), cifras y separadores. Todo lo demás se rechaza en la pulsación,
 * como hacía el `type="number"`.
 */
export const CARACTERES_COORDENADA = /^\s*[+\-−–]?[\d.,]*\s*$/;

/**
 * Lee una coordenada escrita. `NaN` si todavía no es un número («», «-», «,»): el campo lo
 * conserva tal cual y la sonda se queda donde estaba hasta que lo sea.
 *
 * El punto solo es SIEMPRE decimal. `parseSpanishNumber` resuelve la ambigüedad de «1.234» a
 * favor del millar español, regla que salió de los IMPORTES —donde «1.500» son mil quinientos
 * y tres decimales no se escriben nunca—. Aquí el campo está acotado a ±4 m y ningún millar
 * cabe en él, así que la única lectura posible de «1.234» es la de quien escribe con punto
 * decimal (México, Estados Unidos…): 1,234 m, no 1.234 m acotados al borde (hallazgo 2384).
 * Con coma, o con los dos separadores, manda el parser del proyecto sin cambios.
 */
export function leerCoordenada(texto: string): number {
  const limpio = texto.trim().replace(/[−–]/g, '-');
  if (/^[+-]?\d*\.\d+$/.test(limpio)) return parseSpanishNumber(limpio.replace('.', ','));
  return parseSpanishNumber(limpio);
}

/**
 * La coordenada tal como se enseña en el campo: formato español y solo los decimales que de
 * verdad tiene, hasta el milímetro («0», «1,5», «-0,44», «1,234»). Nunca «-1.942890293094024e-16»
 * ni «1.7000000000000002», que es lo que el `type="number"` volcaba del estado (hallazgo 2385).
 */
export function textoCoordenada(v: number): string {
  // En milímetros ENTEROS, para contar los decimales sin arrastrar el error de la coma
  // flotante (0,29 · 100 = 28,999999999999996).
  const mm = Math.round(v * 1000);
  if (mm === 0) return '0'; // también el −0 y el ruido de 10⁻¹⁶ que deja sumar pasos
  const decimales = mm % 1000 === 0 ? 0 : mm % 100 === 0 ? 1 : mm % 10 === 0 ? 2 : 3;
  return formatNumber(mm / 1000, decimales);
}

/**
 * Redondea al centímetro, que es el paso más fino del teclado (Mayús + flecha).
 *
 * Sumar pasos de 0,1 m acumula el error de la coma flotante: 1,5 − 15 × 0,1 = −1,94·10⁻¹⁶. Ese
 * residuo no se ve en la fila de posición («≈0 m»), pero las filas de física lo publicaban como
 * cifra —V = 2,84 × 10⁻¹⁴ V en la mediatriz del dipolo y |E| = 8,53 × 10⁻¹⁴ N/C en el centro
 * del cuadrupolo, donde el valor correcto es 0 y arrastrando sale 0 (hallazgo 2385).
 */
export function alCentimetro(v: number): number {
  return Math.round(v * 100) / 100 + 0; // `+ 0` convierte el −0 del redondeo en 0
}
