'use client';

import { useCallback, useEffect, useRef } from 'react';

/**
 * Guarda de doble toque para las apps por pantallas (quizzes, selectores, tests por fases).
 *
 * «Empezar», «Siguiente» o «Ver resultado» cambian la pantalla en el primer clic, y el segundo
 * de un doble clic —o de dos toques seguidos en el móvil— caía en el mismo punto sobre lo que
 * hubiera debajo en la pantalla nueva: contestaba la pregunta siguiente sin que nadie la
 * eligiera, sacaba de la app por una relacionada o se llevaba la nota antes de verla (46 de 56
 * «Siguiente» a 360 px en quiz-literatura-universal, hallazgo 2507; 3214 en quiz-geografia-espana).
 *
 * Un clic se ignora cuando cumple las dos cosas:
 *   · es el 2.º (o 3.º…) de una ráfaga: `detail` > 1. Lo cuenta el navegador (clics seguidos en
 *     el mismo sitio), no un temporizador; con teclado o lector de pantalla es 0;
 *   · y el clic anterior cambió de pantalla (la app llamó a `marcarCambioPantalla`). Sin esto,
 *     contestar y pulsar «Siguiente» deprisa —dos toques cercanos que Chrome también cuenta como
 *     ráfaga— se comería el «Siguiente», que sí era una intención nueva.
 * Va en captura sobre `window` para alcanzar también lo que no es de la app (las relacionadas,
 * el pie). Un clic suelto cierra la ráfaga.
 *
 * Uso: `const marcarCambioPantalla = useGuardaRafaga();` y llamarla en cada manejador que cambia
 * de pantalla. Es la receta que llevaban copiada once selectores y quiz-geografia-espana (cabo
 * C0317); nace con los quizzes del cabo C0082 (26/10/2026), testigo tests/familias/quizzes.spec.ts.
 */
export function useGuardaRafaga(): () => void {
  const cambioPantallaRef = useRef(false);
  useEffect(() => {
    function filtrar(e: MouseEvent) {
      if (e.detail > 1 && cambioPantallaRef.current) {
        e.preventDefault();
        e.stopPropagation();
      } else if (e.detail <= 1) {
        cambioPantallaRef.current = false;
      }
    }
    window.addEventListener('click', filtrar, true);
    return () => window.removeEventListener('click', filtrar, true);
  }, []);
  return useCallback(() => {
    cambioPantallaRef.current = true;
  }, []);
}
