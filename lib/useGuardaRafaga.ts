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
 * `marcarCambioPantalla({ soloMismoPunto: true })` es para el clic que NO cambia de pantalla
 * pero mueve la página: contestar, cuando el foco va a «Siguiente» y el navegador sube la vista
 * para enseñarlo, de modo que el botón queda bajo el dedo y el 2.º toque sobre la opción se
 * saltaba la explicación (hallazgos 3679, 3701 y 3751). Entonces solo se ignora el 2.º toque que
 * cae donde cayó el 1.º (a menos de `RADIO_MISMO_PUNTO` px): el dedo no se ha movido, así que no
 * es una intención nueva. El «Siguiente» rápido de quien SÍ ha ido a por él pasa.
 *
 * Uso: `const marcarCambioPantalla = useGuardaRafaga();` y llamarla en cada manejador que cambia
 * de pantalla. Es la receta que llevaban copiada once selectores y quiz-geografia-espana (cabo
 * C0317); nace con los quizzes del cabo C0082 (26/10/2026), testigo tests/familias/quizzes.spec.ts.
 */
const RADIO_MISMO_PUNTO = 24;

type Marca = false | 'pantalla' | 'punto';

export function useGuardaRafaga(): (opciones?: { soloMismoPunto?: boolean }) => void {
  const cambioPantallaRef = useRef<Marca>(false);
  const puntoRef = useRef({ x: 0, y: 0 });
  useEffect(() => {
    function filtrar(e: MouseEvent) {
      const marca = cambioPantallaRef.current;
      if (e.detail > 1 && marca) {
        const { x, y } = puntoRef.current;
        if (marca === 'punto' && Math.hypot(e.clientX - x, e.clientY - y) > RADIO_MISMO_PUNTO) {
          cambioPantallaRef.current = false;
          return;
        }
        e.preventDefault();
        e.stopPropagation();
      } else if (e.detail <= 1) {
        cambioPantallaRef.current = false;
        puntoRef.current = { x: e.clientX, y: e.clientY };
      }
    }
    /**
     * ⚠️ 29/10/2026 (hallazgo 3768) — ignorar el CLIC no basta: el mousedown del 2.º toque llega
     * antes y mueve el foco a lo que haya debajo. En quiz-verbos-irregulares, modo «Escribir», el
     * foco salía de la casilla «Past Simple» hacia «Comprobar» o «Ver guía educativa», y el Enter
     * siguiente corregía con las casillas vacías. El mousedown que cumple lo mismo que el clic
     * ignorado no hace su acción por defecto (mover el foco, seleccionar texto). No cambia la marca:
     * de eso se encarga el clic.
     */
    function frenarFoco(e: MouseEvent) {
      const marca = cambioPantallaRef.current;
      if (e.detail <= 1 || !marca) return;
      const { x, y } = puntoRef.current;
      if (marca === 'punto' && Math.hypot(e.clientX - x, e.clientY - y) > RADIO_MISMO_PUNTO) return;
      e.preventDefault();
    }
    window.addEventListener('click', filtrar, true);
    window.addEventListener('mousedown', frenarFoco, true);
    return () => {
      window.removeEventListener('click', filtrar, true);
      window.removeEventListener('mousedown', frenarFoco, true);
    };
  }, []);
  return useCallback((opciones?: { soloMismoPunto?: boolean }) => {
    cambioPantallaRef.current = opciones?.soloMismoPunto ? 'punto' : 'pantalla';
  }, []);
}
