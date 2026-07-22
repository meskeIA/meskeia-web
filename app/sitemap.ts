import { MetadataRoute } from 'next';
import { applicationsDatabase } from '@/data/applications';

// Configuración para static export
export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://meskeia.com';

  // Páginas principales
  const mainPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/acerca`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacidad`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terminos`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  // Generar entradas para todas las aplicaciones (automático).
  // Excluimos las cronologías del sistema dinámico (/visualizador-historia/[slug]/):
  // desde el 301 de migración esas URLs redirigen a cronicum.com/[slug], y un sitemap
  // no debe anunciar URLs que redirigen (GSC las marcaría como "Página con redirección").
  // El filtro casa solo con la barra final del prefijo, así que NO excluye las 3 apps
  // custom hifenadas (/visualizador-historia-reloj|dinero|escritura/), que siguen siendo
  // apps propias de meskeIA y deben permanecer indexadas.
  const appPages: MetadataRoute.Sitemap = applicationsDatabase
    .filter((app) => !app.url.startsWith('/visualizador-historia/'))
    .map((app) => ({
      url: `${baseUrl}${app.url}`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    }));

  // Combinar: páginas principales + aplicaciones
  return [...mainPages, ...appPages];
}
