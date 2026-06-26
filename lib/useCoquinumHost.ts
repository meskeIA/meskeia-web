'use client';

import { useEffect, useState } from 'react';

/**
 * Detecta si la página se está sirviendo bajo el dominio de la marca Coquinum.
 *
 * Las apps gastro viven físicamente en meskeIA pero se sirven también bajo
 * coquinum.com (host-rewrite en proxy.ts). Este hook permite que el "chrome"
 * compartido (MeskeiaLogo) muestre la marca Coquinum cuando corresponde, y que
 * DescubreVertical no se muestre allí (ya estás en el portal).
 *
 * Devuelve `false` en el primer render (SSR + hidratación) para coincidir con
 * el HTML prerenderizado de meskeIA y evitar errores de hidratación; tras el
 * montaje pasa a `true` solo si el host es coquinum.com. En meskeia.com siempre
 * devuelve `false`, por lo que el comportamiento allí es idéntico al actual.
 */
export function useCoquinumHost(): boolean {
  const [isCoquinum, setIsCoquinum] = useState(false);

  useEffect(() => {
    const host = window.location.hostname.toLowerCase();
    if (host === 'coquinum.com' || host === 'www.coquinum.com') {
      setIsCoquinum(true);
    }
  }, []);

  return isCoquinum;
}
