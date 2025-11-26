import { MetadataRoute } from 'next';

// Configuración para static export
export const dynamic = 'force-static';

/**
 * robots.txt para subdominio de DESARROLLO (next.meskeia.com)
 *
 * BLOQUEA todo rastreo de buscadores.
 * Cuando se migre a producción (meskeia.com), cambiar Disallow a Allow.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        disallow: '/', // BLOQUEA todo el sitio para buscadores
      },
    ],
    // No incluir sitemap en desarrollo
  };
}
