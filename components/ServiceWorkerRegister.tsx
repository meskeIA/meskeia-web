'use client';

import { useEffect } from 'react';

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('[PWA] Service Worker registrado correctamente:', registration.scope);

            // Comprobar actualizaciones cada hora
            setInterval(() => {
              registration.update();
            }, 60 * 60 * 1000);
          })
          .catch((error) => {
            console.error('[PWA] Error al registrar Service Worker:', error);
          });
      });

      // Detectar actualizaciones del Service Worker
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('[PWA] Nueva versión del Service Worker activa');
      });
    }
  }, []);

  return null; // No renderiza nada
}
