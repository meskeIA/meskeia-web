// robots.txt de Delegum (delegum.com).
//
// Next.js solo genera robots.txt desde la raíz (app/robots.ts), no anidado, así
// que servimos el de Delegum con un Route Handler. El proxy reescribe
// delegum.com/robots.txt → /delegum/robots-txt (la URL del navegador se mantiene
// como /robots.txt). Antes delegum.com servía el robots.txt de meskeIA (con el
// Sitemap apuntando a meskeia.com); ahora referencia su propio sitemap.
export const dynamic = 'force-static';

const BODY = `User-agent: *
Allow: /
Disallow: /api/

Sitemap: https://delegum.com/sitemap.xml
Host: https://delegum.com
`;

export function GET() {
  return new Response(BODY, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
