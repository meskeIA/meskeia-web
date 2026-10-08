'use client';

/**
 * Contexto que lleva al cliente SOLO las tarjetas de relacionadas de una app.
 *
 * Lo rellena `ConRelacionadas` (componente de servidor) desde el `layout.tsx` de cada app,
 * y lo lee `<RelatedApps />` cuando no recibe `apps` por prop. Así el mapa entero de
 * `data/app-relations.ts` se queda en el servidor y al navegador llegan 4 tarjetas, ya
 * pintadas en el HTML del SSR (los enlaces internos no dependen de que cargue el JS).
 *
 * Por qué existe (08/10/2026): con `getRelatedApps('slug')` dentro de las páginas
 * `'use client'`, 1.005 páginas descargaban un chunk de 733.730 B (158.392 B en brotli)
 * para pintar 4 tarjetas. Lo vigila `npm run check:catalogo-cliente`.
 */

import { createContext, useContext } from 'react';
import type { RelatedApp } from './RelatedApps';

const RelacionadasContexto = createContext<RelatedApp[]>([]);

interface Props {
  apps: RelatedApp[];
  children: React.ReactNode;
}

export function RelacionadasProvider({ apps, children }: Props) {
  return <RelacionadasContexto.Provider value={apps}>{children}</RelacionadasContexto.Provider>;
}

export function useRelacionadas(): RelatedApp[] {
  return useContext(RelacionadasContexto);
}
