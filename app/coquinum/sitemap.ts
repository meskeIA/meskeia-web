import { MetadataRoute } from 'next';
import { COQUINUM_CATEGORIAS } from '@/data/coquinum';

// Configuración para static export
export const dynamic = 'force-static';

/**
 * Sitemap de Coquinum (coquinum.com).
 *
 * Generado en /coquinum/sitemap.xml; el proxy lo sirve en coquinum.com/sitemap.xml.
 * Incluye SOLO las páginas con canonical propio a coquinum.com: la home y las 5
 * páginas de categoría. Las apps NO se incluyen: su canonical apunta a meskeia.com
 * (se sirven aquí en passthrough), así que su SEO se consolida allí.
 * URLs con barra final (trailingSlash: true), coincidiendo con cada canonical.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://coquinum.com';
  const now = new Date();

  const home: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
  ];

  const paginasCategoria: MetadataRoute.Sitemap = Object.keys(COQUINUM_CATEGORIAS).map(
    (slug) => ({
      url: `${baseUrl}/${slug}/`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    }),
  );

  return [...home, ...paginasCategoria];
}
