/**
 * Tinta legible para un texto pintado sobre un relleno de color, sobre todo en un <canvas>,
 * donde ningún candado de CSS llega (cabo C0297, 06/11/2026).
 *
 * El censo de tests/contraste-lienzo.spec.ts dio el texto blanco sobre rellenos de la marca y de
 * la paleta de datos (ruleta-aleatoria, simulador-teorema-bayes…) a 2,3-4,1:1. Con un relleno
 * de datos elegido por su tono, lo legible no es cambiar el relleno sino la tinta: blanca sobre
 * lo oscuro, casi negra sobre lo claro.
 *
 * Ojo: el azul de la marca (#2E86AB) queda a 4,11:1 con blanco y 4,24:1 con #1A1A1A: con
 * NINGUNA tinta llega a 4,5. Ahí hay que oscurecer el relleno (--primary-boton, #26718F).
 */

/** Tinta oscura: la del fondo del tema oscuro, para que no sea un negro puro. */
export const TINTA_OSCURA = '#1A1A1A';
export const TINTA_CLARA = '#FFFFFF';

/** `#rgb` o `#rrggbb` → [r, g, b]; `null` si no es un hexadecimal. */
export function rgbDeHex(hex: string): [number, number, number] | null {
  const h = hex.trim().replace(/^#/, '');
  const largo = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  if (!/^[0-9a-f]{6}$/i.test(largo)) return null;
  return [0, 2, 4].map((i) => parseInt(largo.slice(i, i + 2), 16)) as [number, number, number];
}

/** Luminancia relativa WCAG 2.x de un color hexadecimal. */
export function luminancia(hex: string): number {
  const rgb = rgbDeHex(hex);
  if (!rgb) return NaN;
  const [r, g, b] = rgb.map((c) => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Razón de contraste WCAG entre dos colores hexadecimales (1 a 21). */
export function contraste(a: string, b: string): number {
  const [l1, l2] = [luminancia(a), luminancia(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}

/** La tinta, blanca o casi negra, que más contrasta con el relleno. */
export function tintaSobre(relleno: string): typeof TINTA_CLARA | typeof TINTA_OSCURA {
  return contraste(TINTA_CLARA, relleno) >= contraste(TINTA_OSCURA, relleno) ? TINTA_CLARA : TINTA_OSCURA;
}

const hexDeRgb = (rgb: number[]): string =>
  '#' + rgb.map((c) => Math.round(c).toString(16).padStart(2, '0')).join('').toUpperCase();

/**
 * Relleno y tinta para un texto sobre un color de datos, con la garantía de que el texto llega a
 * `minimo` (4,5:1 por defecto, texto pequeño). Si con el relleno tal cual alguna tinta llega, se
 * devuelve el relleno sin tocar y esa tinta; si no (los tonos medios como #2E86AB, #DAA520), se
 * oscurece el relleno hacia el negro hasta que el blanco llega, o se aclara hacia el blanco hasta
 * que llega la tinta oscura, lo que pida MENOS cambio, en pasos del 5 %. Nace de las cronologías
 * de movimientos (cabo C0297, 08/11/2026): rótulos blancos sobre barras de cada color, 1,9-4,5:1.
 * Un relleno que no es hexadecimal se devuelve tal cual con tinta blanca.
 */
export function rellenoConTinta(relleno: string, minimo = 4.5): { relleno: string; tinta: string } {
  const rgb = rgbDeHex(relleno);
  if (!rgb) return { relleno, tinta: TINTA_CLARA };
  const tinta = tintaSobre(relleno);
  if (contraste(tinta, relleno) >= minimo) return { relleno, tinta };
  for (let k = 0.05; k <= 1.0001; k += 0.05) {
    const oscuro = hexDeRgb(rgb.map((c) => c * (1 - k)));
    if (contraste(TINTA_CLARA, oscuro) >= minimo) return { relleno: oscuro, tinta: TINTA_CLARA };
    const claro = hexDeRgb(rgb.map((c) => c + (255 - c) * k));
    if (contraste(TINTA_OSCURA, claro) >= minimo) return { relleno: claro, tinta: TINTA_OSCURA };
  }
  return { relleno: '#000000', tinta: TINTA_CLARA };
}
