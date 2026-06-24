import { MetadataRoute } from 'next';

// Configuración para static export
export const dynamic = 'force-static';

/**
 * Sitemap de Stemum (stemum.com).
 *
 * Generado en /stemum/sitemap.xml; el proxy lo sirve en stemum.com/sitemap.xml.
 * Incluye SOLO las páginas con canonical propio a stemum.com: la home y las 6
 * páginas de disciplina. Las apps NO se incluyen: su canonical apunta a
 * meskeia.com (se sirven aquí en passthrough), así que su SEO se consolida allí.
 * URLs con barra final (trailingSlash: true), coincidiendo con cada canonical.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://stemum.com';
  const now = new Date();

  const disciplinas = [
    'computacion',
    'fisica',
    'matematicas',
    'quimica',
    'biologia',
    'tierra-espacio',
  ];

  const home: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
  ];

  const paginasDisciplina: MetadataRoute.Sitemap = disciplinas.map((slug) => ({
    url: `${baseUrl}/${slug}/`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [...home, ...paginasDisciplina];
}
