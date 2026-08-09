import { COQUINUM_CATEGORIAS, COQUINUM_APP_CATEGORIA, COQUINUM_TOTAL_APPS } from '@/data/coquinum';
import { applicationsDatabase } from '@/data/applications';

// llms.txt de Coquinum (coquinum.com/llms.txt).
//
// Mapa curado del portal para LLMs (ChatGPT, Perplexity, Claude, Gemini…):
// resumen del sitio + las categorías con sus apps (nombre, enlace y descripción).
// Generado desde data/coquinum.ts + data/applications.ts. Servido por un Route
// Handler (un .txt estático en public/ sería el de meskeIA); el proxy reescribe
// coquinum.com/llms.txt → /coquinum/llms-txt.
export const dynamic = 'force-static';

const BASE = 'https://coquinum.com';

// Mapa url → app para resolver nombre y descripción de cada slug del portal.
const APP_POR_URL = new Map(applicationsDatabase.map((a) => [a.url, a]));

// Primera frase de la descripción, para un mapa legible.
function corta(desc: string): string {
  const fin = desc.indexOf('. ');
  return fin > 0 ? desc.slice(0, fin + 1) : desc;
}

function construir(): string {
  const l: string[] = [];

  l.push('# Coquinum — Cocina y gastronomía con precisión');
  l.push('');
  // Las secciones se enumeran DESDE el catálogo: escritas a mano se quedaron
  // nombrando las nueve categorías anteriores a la consolidación del 09/08/2026
  // mientras la lista de abajo, esa sí derivada, ya solo servía seis.
  const secciones = Object.values(COQUINUM_CATEGORIAS)
    .map((c) => c.toLowerCase())
    .join(', ');
  l.push(
    `> Portal de cocina técnica de meskeIA con ${COQUINUM_TOTAL_APPS} calculadoras y guías en ` +
      `español sobre ${secciones}. Gratis, sin registro y sin publicidad, con cálculo local ` +
      'en el navegador.',
  );
  l.push('');
  l.push(
    'Coquinum reúne las herramientas de cocina técnica de meskeIA: calculadoras de precisión ' +
      '(porcentaje del panadero, hidratación, conversor de tazas a gramos por ingrediente, ajuste ' +
      'por altitud, escandallo y food cost…) y guías de ingredientes y bebidas. No son recetas: ' +
      'son las cuentas exactas para que la receta salga. Pensado para público hispanohablante ' +
      '(España y Latinoamérica).',
  );
  l.push('');
  l.push('- URL base: https://coquinum.com');
  l.push('- Idioma: Español (España y Latinoamérica)');
  l.push('- Patrón de URLs: https://coquinum.com/{slug}/');
  l.push('- Sitemap: https://coquinum.com/sitemap.xml');
  l.push('- Parte de: meskeIA (https://meskeia.com)');
  l.push('');

  for (const [catSlug, catLabel] of Object.entries(COQUINUM_CATEGORIAS)) {
    l.push(`## ${catLabel}`);
    l.push(`Categoría: ${BASE}/${catSlug}/`);
    l.push('');
    const slugs = Object.keys(COQUINUM_APP_CATEGORIA).filter(
      (s) => COQUINUM_APP_CATEGORIA[s] === catSlug,
    );
    for (const slug of slugs) {
      const app = APP_POR_URL.get(`/${slug}/`);
      if (!app) continue;
      l.push(`- [${app.name}](${BASE}/${slug}/): ${corta(app.description)}`);
    }
    l.push('');
  }

  return l.join('\n');
}

const BODY = construir();

export function GET() {
  return new Response(BODY, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
