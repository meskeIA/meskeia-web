/**
 * Componente de SERVIDOR: resuelve en el servidor las relacionadas de una app y pasa al
 * cliente solo sus tarjetas. Se monta en el `layout.tsx` de cada app envolviendo `{children}`:
 *
 *   <ConRelacionadas slug="mi-app">{children}</ConRelacionadas>
 *
 * y la página pinta `<RelatedApps />` sin prop.
 *
 * ⚠️ NO añadirlo al barrel `@/components` ni importarlo desde un fichero `'use client'`:
 * arrastraría `data/app-relations.ts` entero al navegador, que es justo lo que evita
 * (`npm run check:catalogo-cliente` rompe el build si pasa). Ver `RelacionadasContexto.tsx`.
 */

import { getRelatedApps } from '@/data/app-relations';
import { RelacionadasProvider } from './RelacionadasContexto';

interface Props {
  slug: string;
  children: React.ReactNode;
}

export default function ConRelacionadas({ slug, children }: Props) {
  return <RelacionadasProvider apps={getRelatedApps(slug)}>{children}</RelacionadasProvider>;
}
