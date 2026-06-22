import { PUERTAS } from '@/data/cronicum/puertas';
import { getHistoria } from '@/data/historias/index';

// llms.txt de Cronicum (cronicum.com/llms.txt).
//
// Mapa curado del portal para LLMs (ChatGPT, Perplexity, Claude, Gemini…):
// resumen del sitio + las 12 puertas en doble eje + las 142 cronologías con
// enlaces y descripción. Generado desde data/cronicum/puertas + data/historias.
// Servido por un Route Handler (un .txt estático en public/ sería el de meskeIA);
// el proxy reescribe cronicum.com/llms.txt → /cronicum/llms-txt.
export const dynamic = 'force-static';

const BASE = 'https://cronicum.com';

const EJES: { id: 'mundo' | 'cosas' | 'acontecimientos'; titulo: string }[] = [
  { id: 'mundo', titulo: 'El mundo — civilizaciones, países y regiones' },
  { id: 'cosas', titulo: 'La historia de las cosas — por materias' },
  { id: 'acontecimientos', titulo: 'Grandes acontecimientos' },
];

function construir(): string {
  const l: string[] = [];

  l.push('# Cronicum — Historia interactiva de la humanidad');
  l.push('');
  l.push(
    '> 142 cronologías interactivas en español sobre la historia de la humanidad: ' +
      'civilizaciones, países y regiones del mundo, y la historia de la ciencia, la ' +
      'tecnología, el arte, la economía y la vida cotidiana. Gratis, sin registro, ' +
      'con exploración visual por períodos, hitos y fechas.',
  );
  l.push('');
  l.push(
    'Cronicum es el portal de historia de meskeIA. Cada cronología es una línea del ' +
      'tiempo navegable con sus períodos, hitos, obras icónicas y contexto histórico. ' +
      'El contenido se organiza en dos ejes complementarios —"El mundo" (por ' +
      'civilizaciones, países y regiones) y "La historia de las cosas" (por materias)— ' +
      'más una sección de grandes acontecimientos.',
  );
  l.push('');
  l.push('- URL base: https://cronicum.com');
  l.push('- Idioma: Español (España y Latinoamérica)');
  l.push('- Patrón de URLs: https://cronicum.com/{slug}/');
  l.push('- Sitemap: https://cronicum.com/sitemap.xml');
  l.push('- Parte de: meskeIA (https://meskeia.com)');
  l.push('');

  for (const eje of EJES) {
    l.push(`## ${eje.titulo}`);
    l.push('');
    const puertas = PUERTAS.filter((p) => p.grupo === eje.id);
    const ejeDeUnaPuerta = puertas.length === 1;
    for (const p of puertas) {
      if (!ejeDeUnaPuerta) l.push(`### ${p.titulo}`);
      l.push(`${p.descripcion} (sección: ${BASE}/${p.slug}/)`);
      l.push('');
      for (const slug of p.slugs) {
        const d = getHistoria(slug);
        if (!d) continue;
        l.push(`- [${d.titulo}](${BASE}/${slug}/): ${d.subtitulo}`);
      }
      l.push('');
    }
  }

  return l.join('\n');
}

const BODY = construir();

export function GET() {
  return new Response(BODY, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
