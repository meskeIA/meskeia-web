/**
 * Hueco que deja arriba el cromo fijo (la barra de MeskeiaLogo) en la página actual, en px.
 *
 * Es el `scroll-padding-top` del documento, que globals.css calcula con la altura MEDIDA de la
 * barra y MeskeiaLogo afina en vivo (cabo C0090, 13/10/2026): 62 px en móvil, 92 en escritorio y
 * 88 bajo coquinum.com en móvil, donde la píldora va en dos líneas. Sustituye a las constantes
 * `MARGEN_LOGO = 80 / 88` que cada app copiaba de su `scroll-margin-top`: un `scrollIntoView` ya
 * deja ese hueco solo, y una app que decide SI llevar algo a la vista tiene que medir el mismo.
 * Sin barra (o sin :has()), 0.
 */
export function margenBarraLogo(): number {
  if (typeof document === 'undefined') return 0;
  return parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
}
