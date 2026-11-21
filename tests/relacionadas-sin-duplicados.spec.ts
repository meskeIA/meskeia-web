/**
 * Relacionadas sin duplicados (cabo C0859, 20/11/2026).
 *
 * Cinco apps repetían una URL en sus relacionadas: React avisaba «Encountered two children
 * with the same key» (RelatedApps usa la URL como key) y la tarjeta salía dos veces, así que
 * una de las cuatro plazas del bloque se perdía. visualizador-deuda-publica y
 * visualizador-mercados-financieros llevaban /estimador-inversiones/ dos veces,
 * visualizador-alzheimer-parkinson /visualizador-sistema-nervioso/ tres,
 * visualizador-historia-redes-sociales repetía la cronología de la IA y
 * visualizador-falacias-logicas se enlazaba dos veces a sí misma.
 *
 * Lo comprueba sobre el mapa entero, no solo en esas cinco: ninguna app repite una URL en su
 * bloque ni se enlaza a sí misma. No necesita servidor: lee data/app-relations.ts. Al pasarlo
 * por el mapa entero salieron dos más que el recorrido del cabo no vio, porque se arman con
 * arrays compartidos: generador-schema-markup se mostraba a sí misma en la tercera tarjeta
 * (seoExtraApps.slice(2, 4)) y contador-palabras repetía Contador Sílabas en la quinta.
 */
import { test, expect } from '@playwright/test';
import { appRelationsMap } from '@/data/app-relations';

/** La URL propia de una clave del mapa (las cronologías viven bajo /visualizador-historia/). */
function urlPropia(slug: string): string {
  if (slug.startsWith('visualizador-historia-')) {
    return `/visualizador-historia/${slug.slice('visualizador-historia-'.length)}/`;
  }
  return `/${slug}/`;
}

test('ninguna app repite una URL en sus relacionadas', () => {
  const repetidas: string[] = [];
  for (const [slug, apps] of Object.entries(appRelationsMap)) {
    const vistas = new Map<string, number>();
    for (const app of apps) vistas.set(app.url, (vistas.get(app.url) ?? 0) + 1);
    for (const [url, n] of vistas) if (n > 1) repetidas.push(`${slug}: ${url} ×${n}`);
  }
  expect(repetidas).toEqual([]);
});

test('ninguna app se enlaza a sí misma en sus relacionadas', () => {
  const propias: string[] = [];
  for (const [slug, apps] of Object.entries(appRelationsMap)) {
    const propia = urlPropia(slug);
    if (apps.some((app) => app.url === propia)) propias.push(slug);
  }
  expect(propias).toEqual([]);
});

test('las cinco apps del caso conservan cuatro relacionadas distintas o las que tenían', () => {
  // El registro no debe encoger (lo vigila el Cuadre): cada duplicado se sustituyó por una
  // relación real, no se borró.
  const esperadas: Record<string, number> = {
    'visualizador-deuda-publica': 3,
    'visualizador-mercados-financieros': 4,
    'visualizador-alzheimer-parkinson': 4,
    'visualizador-historia-redes-sociales': 4,
    'visualizador-falacias-logicas': 4,
  };
  for (const [slug, n] of Object.entries(esperadas)) {
    const urls = new Set((appRelationsMap[slug] ?? []).map((a) => a.url));
    expect(urls.size, slug).toBe(n);
  }
});
