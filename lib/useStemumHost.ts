'use client';

import { useEffect, useState } from 'react';

/**
 * Detecta si la página se está sirviendo bajo el dominio de la marca Stemum.
 *
 * Las apps STEM viven físicamente en meskeIA pero se sirven también bajo
 * stemum.com (host-rewrite en proxy.ts). Este hook permite que el "chrome"
 * compartido (MeskeiaLogo) muestre la marca Stemum cuando corresponde.
 *
 * Devuelve `false` en el primer render (SSR + hidratación) para coincidir con
 * el HTML prerenderizado de meskeIA y evitar errores de hidratación; tras el
 * montaje pasa a `true` solo si el host es stemum.com. En meskeia.com siempre
 * devuelve `false`, por lo que el comportamiento allí es idéntico al actual.
 */
export function useStemumHost(): boolean {
  const [isStemum, setIsStemum] = useState(false);

  useEffect(() => {
    const host = window.location.hostname.toLowerCase();
    if (host === 'stemum.com' || host === 'www.stemum.com') {
      setIsStemum(true);
    }
  }, []);

  return isStemum;
}
