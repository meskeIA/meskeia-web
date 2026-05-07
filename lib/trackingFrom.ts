/**
 * Helper para añadir el parámetro ?from= a un href interno.
 *
 * El AnalyticsTracker lee `from` desde la URL y lo guarda en
 * `datos_adicionales.from`, lo que permite reconstruir el embudo
 * de descubrimiento entre apps en el dashboard de Navegación.
 *
 * Uso:
 *   <Link href={withFrom(app.url, 'home-daily')}>...
 *
 * Origen sugeridos (no exhaustivo):
 *   - related-{slug}     → componente RelatedApps (ya añadido en RelatedApps.tsx)
 *   - home-daily         → cards "Apps del día" en /
 *   - home-related-suite → cards de la suite destacada en /
 *   - search             → resultados del SearchBar
 *   - catalog            → /apps catálogo principal
 *   - catalog-guides     → /apps pestaña Guías
 *   - sidebar-recent     → "Apps visitadas" del sidebar
 */
export function withFrom(url: string, origin: string): string {
  if (!url) return url;
  // Solo se añade el parámetro a URLs internas
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const separator = url.includes('?') ? '&' : '?';
  // Sanitizar el origin para evitar caracteres extraños
  const safe = origin.replace(/[^a-z0-9-]/gi, '').slice(0, 80);
  return `${url}${separator}from=${safe}`;
}
