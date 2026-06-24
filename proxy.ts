import { NextResponse, type NextRequest } from 'next/server';

/**
 * Proxy de enrutado por host para las marcas verticales (antes "middleware",
 * renombrado a la convención `proxy` de Next.js 16).
 *
 * Cada dominio propio sirve una subweb que físicamente vive en /<marca> dentro de
 * este mismo proyecto. En lugar de exponer URLs con prefijo (delegum.com/delegum/...),
 * reescribimos internamente la ruta limpia → /<marca>/... manteniendo la URL del
 * navegador limpia (delegum.com/datos-fiscales, cronicum.com/roma, etc.).
 *
 * El `matcher` captura todas las rutas de página (excluye API, _next y ficheros con
 * extensión). Para hosts que NO son de marca, la función hace `next()` de inmediato
 * (coste despreciable), de modo que meskeIA se comporta exactamente igual que antes.
 * Esta captura amplia es necesaria porque las cronologías de Cronicum viven en URLs
 * limpias de primer nivel (cronicum.com/<slug>) con slugs arbitrarios.
 */
const DELEGUM_HOSTS = new Set(['delegum.com', 'www.delegum.com']);
const CRONICUM_HOSTS = new Set(['cronicum.com', 'www.cronicum.com']);
const STEMUM_HOSTS = new Set(['stemum.com', 'www.stemum.com']);

export function proxy(req: NextRequest) {
  const host = (req.headers.get('host') ?? '').split(':')[0].toLowerCase();
  if (DELEGUM_HOSTS.has(host)) return handleDelegum(req);
  if (CRONICUM_HOSTS.has(host)) return handleCronicum(req);
  if (STEMUM_HOSTS.has(host)) return handleStemum(req);
  return NextResponse.next();
}

function handleDelegum(req: NextRequest) {
  const { pathname } = req.nextUrl;
  // Si ya apunta al árbol real o es API, no tocar (evita doble reescritura).
  if (pathname === '/delegum' || pathname.startsWith('/delegum/') || pathname.startsWith('/api')) {
    return NextResponse.next();
  }
  // sitemap.xml, robots.txt y llms.txt: comportamiento previo intacto (los sirve
  // meskeIA; delegum.com no tiene versiones propias).
  if (pathname === '/sitemap.xml' || pathname === '/robots.txt' || pathname === '/llms.txt') {
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

  // sitemap.xml y robots.txt propios de Cronicum. El sitemap se genera en
  // /cronicum/sitemap.xml (app/cronicum/sitemap.ts); el robots lo sirve un
  // Route Handler en /cronicum/robots-txt (robots.ts no se puede anidar).
  if (pathname === '/sitemap.xml') {
    const url = req.nextUrl.clone();
    url.pathname = '/cronicum/sitemap.xml';
    return NextResponse.rewrite(url);
  }
  if (pathname === '/robots.txt') {
    const url = req.nextUrl.clone();
    url.pathname = '/cronicum/robots-txt';
    return NextResponse.rewrite(url);
  }
  if (pathname === '/llms.txt') {
    const url = req.nextUrl.clone();
    url.pathname = '/cronicum/llms-txt';
    return NextResponse.rewrite(url);
  }

  // Rutas limpias → reescritura interna a /cronicum/*. La home, las 12 puertas y
  // las 142 cronologías viven todas bajo /cronicum (la ruta /cronicum/[slug]
  // distingue puerta vs cronología), así que basta con reescribir todo el host.
  const clean = pathname.endsWith('/') ? pathname : `${pathname}/`;
  const url = req.nextUrl.clone();
  url.pathname = clean === '/' ? '/cronicum/' : `/cronicum${clean}`;
  return NextResponse.rewrite(url);
}

function handleStemum(req: NextRequest) {
  const { pathname } = req.nextUrl;
  // Passthrough del árbol real y de la API (mismo criterio que Delegum/Cronicum).
  if (pathname === '/stemum' || pathname.startsWith('/stemum/') || pathname.startsWith('/api')) {
    return NextResponse.next();
  }
  // sitemap.xml, robots.txt y llms.txt: por ahora los sirve meskeIA (Stemum aún no
  // tiene versiones propias; se añadirán cuando crezca el portal).
  if (pathname === '/sitemap.xml' || pathname === '/robots.txt' || pathname === '/llms.txt') {
    return NextResponse.next();
  }

  // Rutas limpias → reescritura interna a /stemum/*. Normalizamos a barra final
  // (trailingSlash: true) para que el destino coincida con la página estática.
  const clean = pathname.endsWith('/') ? pathname : `${pathname}/`;
  const url = req.nextUrl.clone();
  url.pathname = clean === '/' ? '/stemum/' : `/stemum${clean}`;
  return NextResponse.rewrite(url);
}

export const config = {
  // Todas las rutas de página, excepto API, internos de Next y ficheros con
  // extensión (assets, favicon, og-image…). sitemap.xml y robots.txt se añaden
  // explícitamente para poder enrutarlos por marca (Cronicum tiene los suyos).
  matcher: ['/((?!api|_next|.*\\..*).*)', '/sitemap.xml', '/robots.txt', '/llms.txt'],
};
