import { MetadataRoute } from 'next';
import { getAllHistoriaSlugs } from '@/data/historias/index';
import { getAllPuertaSlugs } from '@/data/cronicum/puertas';

// Configuración para static export
export const dynamic = 'force-static';

/**
 * Sitemap de Cronicum (cronicum.com).
 *
 * Generado en /cronicum/sitemap.xml; el proxy lo sirve en cronicum.com/sitemap.xml.
 * Incluye: home + las 12 puertas + las 142 cronologías. URLs con barra final
 * (trailingSlash: true), coincidiendo con el canonical de cada página.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://cronicum.com';
  const now = new Date();

  const home: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
  ];

  const puertas: MetadataRoute.Sitemap = getAllPuertaSlugs().map((slug) => ({
    url: `${baseUrl}/${slug}/`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  const cronologias: MetadataRoute.Sitemap = getAllHistoriaSlugs().map((slug) => ({
    url: `${baseUrl}/${slug}/`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  return [...home, ...puertas, ...cronologias];
}
