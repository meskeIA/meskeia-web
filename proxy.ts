import { NextResponse, type NextRequest } from 'next/server';

/**
 * Proxy de enrutado por host para la marca Delegum (antes "middleware",
 * renombrado a la convención `proxy` de Next.js 16).
 *
 * delegum.com sirve la subweb que físicamente vive en /delegum dentro de este
 * mismo proyecto. En lugar de exponer URLs con prefijo (delegum.com/delegum/...),
 * reescribimos internamente la ruta limpia → /delegum/... manteniendo la URL del
 * navegador limpia (delegum.com/datos-fiscales, /asistente-ia, etc.).
 *
 * Es el patrón estándar de Vercel para mapear un dominio propio a un subpath y,
 * a diferencia de los rewrites por host de next.config, funciona también en la
 * navegación client-side (las peticiones RSC pasan por el proxy).
 *
 * El `matcher` está deliberadamente acotado a las rutas de Delegum (+ la "/" que
 * comparten ambos dominios), de modo que el resto de páginas de meskeIA no lo
 * invocan. En hosts que no son delegum.com no hace nada.
 */
const DELEGUM_HOSTS = new Set(['delegum.com', 'www.delegum.com']);

export function proxy(req: NextRequest) {
  const host = (req.headers.get('host') ?? '').split(':')[0].toLowerCase();
  if (!DELEGUM_HOSTS.has(host)) {
    return NextResponse.next();
  }

  const { pathname } = req.nextUrl;
  // Si ya apunta al árbol real o es API, no tocar (evita doble reescritura).
  // Los endpoints JSON viven en /api/datos/* (passthrough). Las URLs con prefijo
  // (delegum.com/delegum/...) se sirven tal cual; no se redirigen porque ningún
  // enlace interno las produce y el canonical de cada página ya apunta a la limpia.
  if (pathname === '/delegum' || pathname.startsWith('/delegum/') || pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  // Rutas limpias → reescritura interna a /delegum/*. Normalizamos a barra final
  // (el proyecto usa trailingSlash: true) para que el destino coincida con la
  // página estática y no dispare un redirect interno.
  const clean = pathname.endsWith('/') ? pathname : `${pathname}/`;
  const url = req.nextUrl.clone();
  url.pathname = clean === '/' ? '/delegum/' : `/delegum${clean}`;
  return NextResponse.rewrite(url);
}

export const config = {
  // Solo las rutas de Delegum (+ la "/" raíz, compartida con la home de meskeIA).
  // Ampliar aquí si se añaden nuevas secciones de primer nivel en Delegum.
  matcher: [
    '/',
    '/datos-fiscales',
    '/datos-fiscales/:path*',
    '/asistente-ia',
    '/asistente-ia/',
    '/calculadoras',
    '/calculadoras/',
    '/guias',
    '/guias/',
    '/glosario',
    '/glosario/',
    '/blog',
    '/blog/:path*',
    '/aviso-legal',
    '/aviso-legal/',
  ],
};
