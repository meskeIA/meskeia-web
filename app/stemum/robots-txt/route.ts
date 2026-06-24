// robots.txt de Stemum (stemum.com).
//
// Next.js solo genera robots.txt desde la raíz (app/robots.ts), no anidado, así
// que servimos el de Stemum con un Route Handler. El proxy reescribe
// stemum.com/robots.txt → /stemum/robots-txt (la URL del navegador se
// mantiene como /robots.txt).
export const dynamic = 'force-static';

const BODY = `User-agent: *
Allow: /
Disallow: /api/

Sitemap: https://stemum.com/sitemap.xml
Host: https://stemum.com
`;

export function GET() {
  return new Response(BODY, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
