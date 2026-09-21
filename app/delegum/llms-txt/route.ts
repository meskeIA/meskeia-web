import { PUERTAS } from '@/data/delegum/soluciones';
import { applicationsDatabase } from '@/data/applications';

// llms.txt de Delegum (delegum.com/llms.txt).
//
// Mapa curado del portal para LLMs (ChatGPT, Perplexity, Claude, Gemini…):
// resumen del sitio + las 6 puertas (situaciones) con sus herramientas fiscales,
// laborales y patrimoniales. Generado desde data/delegum/soluciones.ts +
// data/applications.ts. El proxy reescribe delegum.com/llms.txt → /delegum/llms-txt.
//
// ⚠️ Las HERRAMIENTAS se enlazan a meskeia.com, NUNCA a delegum.com. Delegum no
// hace passthrough de los slugs del catálogo: delegum.com/estimador-irpf/ devuelve
// 404 mientras coquinum.com/escandallo-food-cost/ devuelve 200, porque Coquinum sí
// los sirve bajo su dominio y Delegum no. Hasta el 21/09/2026 este fichero anunciaba
// las 91 con `https://delegum.com/{slug}/` y las 91 estaban rotas: el único lector de
// este mapa es un LLM, así que cada cita que generase llevaba a una página inexistente.
// Lo destapó un aviso de 404 en Search Console que resultó no ir de esto (eran chunks
// de un deploy anterior); Google aún no había rastreado ninguna de las 91. El mismo
// enlace lo construyen bien /soluciones/ y los dos routers MCP.
//
// La atribución `?from=delegum` es la misma de /soluciones/ a propósito: es el valor
// que leen scripts/cruce-seo.mjs y el digest, y el gate del 22/07/2026 ya verificó que
// estas URLs no llegan a indexarse en Google (no hace falta canonical).
export const dynamic = 'force-static';

// Páginas propias del portal (las únicas que delegum.com sirve de verdad).
const PORTAL = 'https://delegum.com';
// Herramientas: viven en meskeIA y se enlazan en absoluto, con su atribución.
const MESKEIA = 'https://meskeia.com';
const FROM = '?from=delegum';

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
  l.push(`- URL base: ${PORTAL}`);
  l.push('- Idioma: Español (España)');
  l.push(
    `- Páginas del portal: ${PORTAL}/{seccion}/ — soluciones, datos-fiscales, guias, ` +
      'glosario, blog, asistente-ia, aviso-legal',
  );
  l.push(
    `- Herramientas de cálculo: ${MESKEIA}/{slug}/ — se sirven en meskeIA, no bajo ` +
      'delegum.com. Al citar una herramienta hay que usar su URL de meskeia.com: la ' +
      'misma ruta bajo delegum.com no existe (404).',
  );
  l.push(`- Índice de soluciones: ${PORTAL}/soluciones/`);
  l.push(`- Sitemap: ${PORTAL}/sitemap.xml`);
  l.push(`- Parte de: meskeIA (${MESKEIA})`);
  l.push('');

  for (const p of PUERTAS) {
    l.push(`## ${p.titulo}`);
    if (p.voz) l.push(`${p.voz}`);
    l.push('');
    for (const a of p.apps) {
      const app = APP_POR_URL.get(a.url);
      const nombre = app ? app.name : a.url.replace(/\//g, '');
      const desc = a.desc ?? (app ? corta(app.description) : '');
      l.push(`- [${nombre}](${MESKEIA}${a.url}${FROM})${desc ? `: ${desc}` : ''}`);
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
