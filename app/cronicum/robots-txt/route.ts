// robots.txt de Cronicum (cronicum.com).
//
// Next.js solo genera robots.txt desde la raíz (app/robots.ts), no anidado, así
// que servimos el de Cronicum con un Route Handler. El proxy reescribe
// cronicum.com/robots.txt → /cronicum/robots-txt (la URL del navegador se
// mantiene como /robots.txt).
export const dynamic = 'force-static';

const BODY = `User-agent: *
Allow: /
Disallow: /api/

Sitemap: https://cronicum.com/sitemap.xml
Host: https://cronicum.com
`;

export function GET() {
  return new Response(BODY, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
