// robots.txt de Coquinum (coquinum.com).
//
// Next.js solo genera robots.txt desde la raíz (app/robots.ts), no anidado, así
// que servimos el de Coquinum con un Route Handler. El proxy reescribe
// coquinum.com/robots.txt → /coquinum/robots-txt (la URL del navegador se
// mantiene como /robots.txt).
export const dynamic = 'force-static';

const BODY = `User-agent: *
Allow: /
Disallow: /api/

Sitemap: https://coquinum.com/sitemap.xml
Host: https://coquinum.com
`;

export function GET() {
  return new Response(BODY, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
