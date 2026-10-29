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

/**
 * Lleva el foco a `destino` —el enunciado de una pregunta o el título de una pantalla, con
 * tabindex="-1"— y, solo si no se ve entero bajo la barra fija, lo trae a la vista (el
 * `scrollIntoView` deja el hueco de la barra solo: es el `scroll-padding-top` de arriba).
 *
 * Para el botón que se desmonta al pulsarlo («Siguiente», «Empezar»): sin esto el foco cae a
 * <body> y quien navega con teclado o lector de pantalla vuelve al principio de la página sin oír
 * la pregunta nueva. Sale de la familia de los quizzes (cabo C0018, tests/familias/quizzes.spec.ts),
 * donde cada app copiaba su propio `traerALaVista`; las que se reparan desde el 23/10/2026 lo
 * importan de aquí.
 */
export function enfocarALaVista(destino: HTMLElement | null): void {
  if (!destino) return;
  const r = destino.getBoundingClientRect();
  if (r.top < margenBarraLogo() || r.bottom > window.innerHeight) {
    destino.scrollIntoView({ block: 'start', behavior: 'auto' });
  }
  destino.focus({ preventScroll: true });
}

/**
 * Lleva el foco a un botón que aparece DEBAJO de lo que hay que leer («Siguiente» tras contestar)
 * sin centrarlo: si no se ve entero, la página se mueve lo justo para que asome por abajo
 * (`block: 'nearest'`) y lo de encima —el veredicto, la explicación— sigue a la vista.
 *
 * ⚠️ 29/10/2026 (hallazgo 3770) — `focus()` a secas deja que Chrome CENTRE el botón entre los
 * `scroll-padding` de arriba y de abajo: con una explicación larga, a 360 × 740 la página bajaba de
 * golpe 564 px y el veredicto quedaba bajo la píldora del logo o fuera de la pantalla. Lo llevaban
 * trece quizzes; historia y geografía usaban `preventScroll` y el botón podía quedarse fuera.
 */
export function enfocarSinCentrar(boton: HTMLElement | null): void {
  if (!boton) return;
  boton.focus({ preventScroll: true });
  const asomar = () => {
    const r = boton.getBoundingClientRect();
    if (r.top < margenBarraLogo() || r.bottom > window.innerHeight) {
      boton.scrollIntoView({ block: 'nearest', behavior: 'auto' });
    }
  };
  asomar();
  // La página puede crecer justo después (medido en quiz-conceptos-financieros: 16 px entre este
  // efecto y el siguiente fotograma) y dejar el botón por debajo del borde. Se vuelve a mirar una
  // vez asentada, solo si el foco sigue en él: es lo justo para que asome, nunca un salto.
  window.setTimeout(() => {
    if (document.activeElement === boton) asomar();
  }, 120);
}
