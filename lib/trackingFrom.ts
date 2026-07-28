/**
 * Helper para añadir la marca `#from=` a un href INTERNO.
 *
 * El AnalyticsTracker lee `from` desde la URL y lo guarda en
 * `datos_adicionales.from`, lo que permite reconstruir el embudo
 * de descubrimiento entre apps en el dashboard de Navegación.
 *
 * POR QUÉ FRAGMENTO (#) Y NO PARÁMETRO (?)  — cambio 2026-07-28
 * ------------------------------------------------------------
 * Con `?from=` cada enlace interno generaba una URL distinta de la misma
 * página. Para evitar duplicados en el índice se prohibió `/*?from=` en
 * robots.txt (26/05/2026), y eso dejó ~3.900 enlaces internos que Googlebot
 * veía pero no podía seguir: las apps quedaron sin ninguna recomendación
 * interna que las respaldase, solo con el sitemap.
 *
 * El fragmento es la única parte de la URL que el navegador NO envía al
 * servidor: para Google `/app/#from=x` ES `/app/` (enlace limpio, sin
 * duplicado que bloquear), y para el cliente el dato sigue disponible en
 * `window.location.hash`. Además sobrevive a webviews in-app y a las
 * aperturas en pestaña nueva, que es lo que descartó usar sessionStorage.
 *
 * ⚠️ Los saltos CROSS-DOMINIO (`?from=meskeia`, `?from=delegum`) siguen usando
 * parámetro a propósito: ningún robots.txt de los verticales los bloquea y
 * funcionan bien. El AnalyticsTracker lee AMBAS formas de manera permanente.
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
  // Solo se marcan URLs internas
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  // Si el href ya lleva ancla propia (p.ej. /#disciplinas), no la pisamos:
  // el destino de esa ancla manda sobre la medición.
  if (url.includes('#')) return url;
  // Sanitizar el origin para evitar caracteres extraños
  const safe = origin.replace(/[^a-z0-9-]/gi, '').slice(0, 80);
  return `${url}#from=${safe}`;
}
