'use client';

import { useEffect } from 'react';

/**
 * Registra /sw.js en cada carga.
 *
 * Hasta el 13/10/2026 el registro colgaba de `window.addEventListener('load')` dentro del efecto:
 * si la hidratación terminaba DESPUÉS de que saltara `load`, el listener no se disparaba nunca y
 * esa carga se quedaba sin service worker (cabo C0237: 0 registros en / y /lupa-digital/, 1 en
 * /conversor-braille/). Ahora, si `load` ya pasó, se registra en el acto; si no, se espera a él.
 * Testigo: tests/service-worker.spec.ts.
 */
export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    let intervalo: ReturnType<typeof setInterval> | undefined;
    let desmontado = false;

    const registrar = () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registro) => {
          if (desmontado) return;
          // Comprobar actualizaciones cada hora
          intervalo = setInterval(() => {
            registro.update().catch(() => undefined);
          }, 60 * 60 * 1000);
        })
        .catch((error: unknown) => {
          console.error('[PWA] Error al registrar el service worker:', error);
        });
    };

    if (document.readyState === 'complete') {
      registrar();
    } else {
      window.addEventListener('load', registrar, { once: true });
    }

    return () => {
      desmontado = true;
      window.removeEventListener('load', registrar);
      if (intervalo) clearInterval(intervalo);
    };
  }, []);

  return null; // No renderiza nada
}
