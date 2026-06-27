import { STEMUM_DISCIPLINAS, STEMUM_APP_DISCIPLINA, STEMUM_TOTAL_APPS } from '@/data/stemum';
import { applicationsDatabase } from '@/data/applications';

// llms.txt de Stemum (stemum.com/llms.txt).
//
// Mapa curado del portal para LLMs (ChatGPT, Perplexity, Claude, Gemini…):
// resumen del sitio + las disciplinas STEM con sus apps (nombre, enlace y
// descripción). Generado desde data/stemum.ts + data/applications.ts. El proxy
// reescribe stemum.com/llms.txt → /stemum/llms-txt.
export const dynamic = 'force-static';

const BASE = 'https://stemum.com';

const APP_POR_URL = new Map(applicationsDatabase.map((a) => [a.url, a]));

function corta(desc: string): string {
  const fin = desc.indexOf('. ');
  return fin > 0 ? desc.slice(0, fin + 1) : desc;
}

function construir(): string {
  const l: string[] = [];

  l.push('# Stemum — Aprende STEM visualizando');
  l.push('');
  l.push(
    `> Portal STEM de meskeIA con ${STEMUM_TOTAL_APPS} visualizadores y simuladores interactivos en ` +
      'español de computación, física, matemáticas, química, biología y ciencias de la Tierra y el ' +
      'espacio. Gratis, sin registro y sin publicidad, con simulación local en el navegador.',
  );
  l.push('');
  l.push(
    'Stemum reúne los visualizadores y simuladores interactivos de meskeIA: herramientas que ' +
      'explican conceptos de ciencia, tecnología, ingeniería y matemáticas de forma visual, para ' +
      'entender en lugar de memorizar. Pensado para estudiantes, docentes y curiosos ' +
      'hispanohablantes.',
  );
  l.push('');
  l.push('- URL base: https://stemum.com');
  l.push('- Idioma: Español (España y Latinoamérica)');
  l.push('- Patrón de URLs: https://stemum.com/{slug}/');
  l.push('- Sitemap: https://stemum.com/sitemap.xml');
  l.push('- Parte de: meskeIA (https://meskeia.com)');
  l.push('');

  for (const [discSlug, discLabel] of Object.entries(STEMUM_DISCIPLINAS)) {
    l.push(`## ${discLabel}`);
    l.push(`Disciplina: ${BASE}/${discSlug}/`);
    l.push('');
    const slugs = Object.keys(STEMUM_APP_DISCIPLINA).filter(
      (s) => STEMUM_APP_DISCIPLINA[s] === discSlug,
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
