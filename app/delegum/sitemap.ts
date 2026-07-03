import { MetadataRoute } from 'next';
import { FICHAS } from './datos-fiscales/fichas';
import { POSTS, estaPublicado } from './blog/posts';

/**
 * Sitemap de Delegum (delegum.com).
 *
 * Generado en /delegum/sitemap.xml; el proxy lo sirve en delegum.com/sitemap.xml.
 * Antes delegum.com servía el sitemap de meskeIA (que solo lista URLs de
 * meskeia.com), así que las páginas de portal de Delegum no figuraban en ningún
 * sitemap bajo su propio dominio. Este las cubre.
 *
 * Incluye SOLO las páginas con canonical propio a delegum.com: home, el hub de
 * Datos Fiscales + sus fichas, Soluciones, Guías, Glosario, Asistente IA, Aviso
 * Legal, el índice del Blog y los posts YA publicados. Las apps de meskeIA
 * enlazadas desde Soluciones NO se incluyen: su canonical apunta a meskeia.com y
 * su SEO se consolida allí (mismo criterio que Stemum/Coquinum).
 *
 * URLs con barra final (trailingSlash: true), coincidiendo con cada canonical.
 *
 * ISR en lugar de force-static: los posts con fecha futura pasan de 404 a 200 al
 * llegar su día vía ISR (ver blog/[slug]/page.tsx). Con `revalidate` el sitemap
 * los incorpora automáticamente al publicarse, sin esperar a un nuevo despliegue.
 */
export const revalidate = 3600;

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://delegum.com';
  const now = new Date();

  // Home + páginas fijas del portal.
  const estaticas: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, lastModified: now, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${baseUrl}/datos-fiscales/`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/soluciones/`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/guias/`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/blog/`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${baseUrl}/glosario/`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/asistente-ia/`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/aviso-legal/`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  ];

  // Fichas de Datos Fiscales (fuente única: datos-fiscales/fichas.ts).
  const fichas: MetadataRoute.Sitemap = FICHAS.map((f) => ({
    url: `${baseUrl}/datos-fiscales/${f.slug}/`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  // Posts del blog YA publicados (fecha <= hoy). Los de fecha futura devuelven 404
  // hasta su día, así que se excluyen para no anunciar URLs no accesibles.
  const posts: MetadataRoute.Sitemap = POSTS.filter((p) => estaPublicado(p)).map((p) => ({
    url: `${baseUrl}/blog/${p.slug}/`,
    lastModified: new Date(p.fecha),
    changeFrequency: 'yearly',
    priority: 0.5,
  }));

  return [...estaticas, ...fichas, ...posts];
}
