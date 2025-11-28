import { MetadataRoute } from 'next';

// Configuración para static export
export const dynamic = 'force-static';

/**
 * robots.txt para PRODUCCIÓN (meskeia.com)
 *
 * PERMITE rastreo completo de buscadores.
 * Incluye referencia al sitemap para indexación.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
      },
    ],
    sitemap: 'https://meskeia.com/sitemap.xml',
  };
}
