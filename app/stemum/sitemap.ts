import { MetadataRoute } from 'next';

// Configuración para static export
export const dynamic = 'force-static';

/**
 * Sitemap de Stemum (stemum.com).
 *
 * Generado en /stemum/sitemap.xml; el proxy lo sirve en stemum.com/sitemap.xml.
 * Incluye SOLO las páginas con canonical propio a stemum.com: la home, las 6
 * páginas de disciplina y el material de apoyo. Las apps NO se incluyen (ni las
 * tablas del material de apoyo): su canonical apunta a
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

  // Contenedor de piezas de consulta: página de portal con canonical propio.
  const materialApoyo: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/material-apoyo/`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ];

  return [...home, ...paginasDisciplina, ...materialApoyo];
}
