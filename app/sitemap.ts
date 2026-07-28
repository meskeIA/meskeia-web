import { MetadataRoute } from 'next';
import { applicationsDatabase } from '@/data/applications';
import appDates from '@/data/app-dates.json';

// Configuración para static export
export const dynamic = 'force-static';

/**
 * Fecha real de última modificación de una ruta, tomada del historial de git
 * (data/app-dates.json, generado por scripts/generate-app-dates.mjs).
 *
 * Antes se emitía `new Date()` en las 983 URLs: el sitemap le decía a Google en
 * CADA deploy que el catálogo entero había cambiado. Un lastmod que siempre miente
 * acaba ignorándose, y con él se pierde la única vía de señalar lo que sí cambió.
 * Si una ruta no está en el JSON, se cae a la fecha del build (comportamiento previo).
 */
const fechas = appDates as Record<string, string>;
function ultimaModificacion(ruta: string): Date {
  const slug = ruta.replace(/^\/|\/$/g, '').split('/')[0];
  const fecha = fechas[slug];
  return fecha ? new Date(`${fecha}T00:00:00Z`) : new Date();
}

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://meskeia.com';

  // Páginas principales.
  // OJO con la barra final: el sitio es `trailingSlash: true`, así que /acerca
  // devuelve un 308 hacia /acerca/. Anunciarlas sin barra hacía que GSC las
  // marcase como "Página con redirección" (aviso del 28/07/2026).
  const mainPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/acerca/`,
      lastModified: ultimaModificacion('acerca'),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacidad/`,
      lastModified: ultimaModificacion('privacidad'),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terminos/`,
      lastModified: ultimaModificacion('terminos'),
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
      lastModified: ultimaModificacion(app.url),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    }));

  // Combinar: páginas principales + aplicaciones
  return [...mainPages, ...appPages];
}
