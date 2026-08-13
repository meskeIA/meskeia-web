import { MetadataRoute } from 'next';
import { applicationsDatabase } from '@/data/applications';
import { guidesJourney } from '@/data/guides-journey';
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
 *
 * Se prueba primero la clave de DOS segmentos (`guia/comprar-casa`) y luego la de
 * uno (`guia`): las 14 guías-journey viven bajo la misma carpeta de primer nivel, y
 * con la clave corta las 14 declararían la fecha de la última que se tocase — el
 * mismo lastmod mentiroso que este mecanismo vino a eliminar.
 */
const fechas = appDates as Record<string, string>;
function ultimaModificacion(ruta: string): Date {
  const segmentos = ruta.replace(/^\/|\/$/g, '').split('/');
  const fecha = fechas[segmentos.slice(0, 2).join('/')] ?? fechas[segmentos[0]];
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
    // Páginas de sitio con contenido propio e `index, follow` que hasta el
    // 13/08/2026 no se anunciaban en ningún sitio (auditoría del aviso de Bing
    // "Faltan páginas importantes en los mapas del sitio"). No entran aquí
    // /contacto/ (noindex) ni /dashboard-analytics/ (panel privado).
    {
      url: `${baseUrl}/apps/`,
      lastModified: ultimaModificacion('apps'),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/mcp/`,
      lastModified: ultimaModificacion('mcp'),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/developers/terminos/`,
      lastModified: ultimaModificacion('developers/terminos'),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    // Índice de las guías-journey (las guías en sí, más abajo).
    {
      url: `${baseUrl}/guia/`,
      lastModified: ultimaModificacion('guia'),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ];

  // Guías-journey (/guia/[id]/): landings que agrupan varias apps alrededor de una
  // decisión concreta. Viven en data/guides-journey.ts, NO en applicationsDatabase,
  // así que el sitemap —que se derivaba solo del catálogo de apps— nunca las anunció.
  // Las 14 responden 200 con `index, follow` y canonical propia: eran 14 landings
  // publicadas e invisibles para los buscadores (detectado el 13/08/2026).
  const guidePages: MetadataRoute.Sitemap = guidesJourney
    .filter((guia) => guia.available)
    .map((guia) => ({
      url: `${baseUrl}${guia.url}`,
      lastModified: ultimaModificacion(guia.url),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }));

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

  // Combinar: páginas principales + aplicaciones + guías-journey.
  // Se deduplica por URL porque /guia/herencias/ figura a la vez en
  // applicationsDatabase y en guidesJourney; anunciarla dos veces en el mismo
  // sitemap es un error de formato que Bing y GSC señalan.
  const porUrl = new Map<string, MetadataRoute.Sitemap[number]>();
  for (const entrada of [...mainPages, ...appPages, ...guidePages]) {
    if (!porUrl.has(entrada.url)) porUrl.set(entrada.url, entrada);
  }
  return [...porUrl.values()];
}
