import { PUERTAS } from '@/data/delegum/soluciones';
import { applicationsDatabase } from '@/data/applications';

// llms.txt de Delegum (delegum.com/llms.txt).
//
// Mapa curado del portal para LLMs (ChatGPT, Perplexity, Claude, Gemini…):
// resumen del sitio + las 6 puertas (situaciones) con sus herramientas fiscales,
// laborales y patrimoniales. Generado desde data/delegum/soluciones.ts +
// data/applications.ts. El proxy reescribe delegum.com/llms.txt → /delegum/llms-txt.
export const dynamic = 'force-static';

const BASE = 'https://delegum.com';

const APP_POR_URL = new Map(applicationsDatabase.map((a) => [a.url, a]));

function corta(desc: string): string {
  const fin = desc.indexOf('. ');
  return fin > 0 ? desc.slice(0, fin + 1) : desc;
}

// Nº de herramientas únicas en el portal (una app puede estar en varias puertas).
const TOTAL = new Set(PUERTAS.flatMap((p) => p.apps.map((a) => a.url))).size;

function construir(): string {
  const l: string[] = [];

  l.push('# Delegum — Fiscalidad, derecho laboral y finanzas en España');
  l.push('');
  l.push(
    `> Portal de meskeIA con ${TOTAL} calculadoras y orientadores en español sobre fiscalidad, ` +
      'derecho laboral, vivienda, autónomos, jubilación, herencias y finanzas personales en ' +
      'España. Orientativo (no es asesoramiento profesional), gratis, sin registro y con cálculo ' +
      'local en el navegador.',
  );
  l.push('');
  l.push(
    'Delegum organiza las herramientas por "puertas": situaciones de la vida (trabajar, comprar ' +
      'vivienda, ser autónomo, jubilarse, una herencia…) con las calculadoras que las resuelven. ' +
      'Los datos normativos son del ejercicio fiscal vigente en España. Los resultados son ' +
      'orientativos; para decisiones reales conviene un profesional colegiado o el organismo ' +
      'oficial (AEAT, SEPE, Seguridad Social).',
  );
  l.push('');
  l.push('- URL base: https://delegum.com');
  l.push('- Idioma: Español (España)');
  l.push('- Patrón de URLs: https://delegum.com/{slug}/');
  l.push('- Índice de soluciones: https://delegum.com/soluciones/');
  l.push('- Sitemap: https://delegum.com/sitemap.xml');
  l.push('- Parte de: meskeIA (https://meskeia.com)');
  l.push('');

  for (const p of PUERTAS) {
    l.push(`## ${p.titulo}`);
    if (p.voz) l.push(`${p.voz}`);
    l.push('');
    for (const a of p.apps) {
      const app = APP_POR_URL.get(a.url);
      const nombre = app ? app.name : a.url.replace(/\//g, '');
      const desc = a.desc ?? (app ? corta(app.description) : '');
      l.push(`- [${nombre}](${BASE}${a.url})${desc ? `: ${desc}` : ''}`);
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
