import { NextResponse, type NextRequest } from 'next/server';

/**
 * Proxy de enrutado por host para las marcas verticales (antes "middleware",
 * renombrado a la convención `proxy` de Next.js 16).
 *
 * Cada dominio propio sirve una subweb que físicamente vive en /<marca> dentro de
 * este mismo proyecto. En lugar de exponer URLs con prefijo (delegum.com/delegum/...),
 * reescribimos internamente la ruta limpia → /<marca>/... manteniendo la URL del
 * navegador limpia (delegum.com/datos-fiscales, cronicum.com/europa, etc.).
 *
 * Es el patrón estándar de Vercel para mapear un dominio propio a un subpath y,
 * a diferencia de los rewrites por host de next.config, funciona también en la
 * navegación client-side (las peticiones RSC pasan por el proxy).
 *
 * El `matcher` está deliberadamente acotado a las rutas de las marcas (+ la "/" que
 * comparten todos los dominios), de modo que el resto de páginas de meskeIA no lo
 * invocan. En hosts que no son de marca no hace nada.
 */
const DELEGUM_HOSTS = new Set(['delegum.com', 'www.delegum.com']);
const CRONICUM_HOSTS = new Set(['cronicum.com', 'www.cronicum.com']);

export function proxy(req: NextRequest) {
  const host = (req.headers.get('host') ?? '').split(':')[0].toLowerCase();
  if (DELEGUM_HOSTS.has(host)) return handleDelegum(req);
  if (CRONICUM_HOSTS.has(host)) return handleCronicum(req);
  return NextResponse.next();
}

function handleDelegum(req: NextRequest) {
  const { pathname } = req.nextUrl;
  // Si ya apunta al árbol real o es API, no tocar (evita doble reescritura).
  // Los endpoints JSON viven en /api/datos/* (passthrough). Las URLs con prefijo
  // (delegum.com/delegum/...) se sirven tal cual; no se redirigen porque ningún
  // enlace interno las produce y el canonical de cada página ya apunta a la limpia.
  if (pathname === '/delegum' || pathname.startsWith('/delegum/') || pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  // Renombrado 2026-06-21: "Calculadoras" → "Soluciones". Redirect permanente de
  // la ruta antigua (preserva enlaces externos y la URL ya indexada).
  if (pathname === '/calculadoras' || pathname === '/calculadoras/') {
    const url = req.nextUrl.clone();
    url.pathname = '/soluciones/';
    return NextResponse.redirect(url, 301);
  }

  // Rutas limpias → reescritura interna a /delegum/*. Normalizamos a barra final
  // (el proyecto usa trailingSlash: true) para que el destino coincida con la
  // página estática y no dispare un redirect interno.
  const clean = pathname.endsWith('/') ? pathname : `${pathname}/`;
  const url = req.nextUrl.clone();
  url.pathname = clean === '/' ? '/delegum/' : `/delegum${clean}`;
  return NextResponse.rewrite(url);
}

function handleCronicum(req: NextRequest) {
  const { pathname } = req.nextUrl;
  // Passthrough del árbol real y de la API (mismo criterio que Delegum).
  if (pathname === '/cronicum' || pathname.startsWith('/cronicum/') || pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  // Rutas limpias → reescritura interna a /cronicum/*. (El mapeo de las cronologías
  // individuales —cronicum.com/[slug] → /visualizador-historia/[slug]— se añadirá
  // cuando se construyan las páginas de puerta, junto con su entrada en el matcher.)
  const clean = pathname.endsWith('/') ? pathname : `${pathname}/`;
  const url = req.nextUrl.clone();
  url.pathname = clean === '/' ? '/cronicum/' : `/cronicum${clean}`;
  return NextResponse.rewrite(url);
}

export const config = {
  // Rutas de las marcas verticales (+ la "/" raíz, compartida con la home de meskeIA).
  // Ampliar aquí al añadir nuevas secciones de primer nivel en cualquiera de las marcas.
  matcher: [
    '/',
    // ── Delegum ──
    '/datos-fiscales',
    '/datos-fiscales/:path*',
    '/asistente-ia',
    '/asistente-ia/',
    '/soluciones',
    '/soluciones/',
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
    // ── Cronicum (puertas del doble eje + banda transversal) ──
    '/mundo-antiguo',
    '/mundo-antiguo/',
    '/asia',
    '/asia/',
    '/europa',
    '/europa/',
    '/america',
    '/america/',
    '/precolombinas',
    '/precolombinas/',
    '/africa-oceania',
    '/africa-oceania/',
    '/ciencia-tecnologia',
    '/ciencia-tecnologia/',
    '/comunicacion-digital',
    '/comunicacion-digital/',
    '/arte-cultura',
    '/arte-cultura/',
    '/economia-ideas',
    '/economia-ideas/',
    '/vida-cotidiana',
    '/vida-cotidiana/',
    '/grandes-acontecimientos',
    '/grandes-acontecimientos/',
  ],
};
