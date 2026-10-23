'use client';

import { useEffect } from 'react';

/**
 * Baja hasta el ancla de la URL cuando el navegador no lo ha hecho al cargar la página.
 *
 * `app/loading.tsx` envuelve cada página en un Suspense y, como el contenido supera el trozo de
 * React, el HTML llega con el fallback y la página de verdad en `<div hidden id="S:0">`, que el
 * script `$RC` revela en el siguiente frame (React 19.2 agrupa las revelaciones con
 * requestAnimationFrame). Chrome busca el ancla hasta el evento `load`: si el documento sale de
 * la caché, `load` llega antes que ese frame (12 ms frente a 18 ms) y la página se queda arriba
 * del todo. Hasta 1f1b59f1 lo tapaba la precarga de tres fuentes, que retrasaba `load` (cabo
 * C0370, 23/10/2026: Cronicum y Stemum fallaban también con un `<a href>` normal tras una visita
 * previa; testigo: el ancla #generador-lototurf de tests/apps/generador-loteria.spec.ts).
 *
 * Solo actúa en una navegación nueva (al recargar o con Atrás el navegador restaura su posición)
 * y con la página en scrollY 0: si el navegador ya bajó, o la persona se ha movido, no toca nada.
 * scrollIntoView respeta el scroll-padding del documento, que deja el título bajo la barra.
 */
export default function AnclaInicial() {
  useEffect(() => {
    if (location.hash.length < 2) return;
    const navegacion = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
    if (navegacion && navegacion.type !== 'navigate') return;

    let id: string;
    try {
      id = decodeURIComponent(location.hash.slice(1));
    } catch {
      return;
    }

    // El layout raíz puede hidratar antes de que React revele la página: se espera a que el
    // destino salga del contenedor oculto, con un tope de ~1,5 s
    let fotogramas = 0;
    let peticion = 0;
    const intentar = () => {
      if (window.scrollY !== 0) return;
      const destino = document.getElementById(id);
      if (destino && !destino.closest('[hidden]')) {
        if (destino.getBoundingClientRect().top > 0) destino.scrollIntoView({ block: 'start' });
        return;
      }
      if (++fotogramas < 90) peticion = requestAnimationFrame(intentar);
    };
    intentar();

    return () => cancelAnimationFrame(peticion);
  }, []);

  return null;
}
