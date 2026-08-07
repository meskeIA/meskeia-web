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
/**
 * RUTAS MIGRADAS A UN DOMINIO VERTICAL
 * ------------------------------------
 * Familias de apps que siguen en el catálogo de meskeIA (`data/applications.ts`)
 * pero cuyo hogar canónico ya es otro dominio: `next.config.ts` responde 308 a
 * esas rutas desde meskeia.com.
 *
 * POR QUÉ NO BASTA CON EL 308 (defecto detectado 2026-08-07)
 * ---------------------------------------------------------
 * Un `next/link` hacia una ruta interna pide primero su payload RSC. Ese fetch
 * sigue el 308 hasta el dominio vertical, y ahí lo corta la propia CSP de meskeIA
 * (`connect-src` no incluye los verticales). Next cae entonces a navegación dura,
 * pero como el href lleva `#from=…` el resultado neto es solo un cambio de
 * fragmento: el usuario se queda donde estaba. Medido en producción: de los clics
 * de "Apps del día", el 17 % iba a una cronología antes del 301 del 22/07/2026 y
 * el 0 % después.
 *
 * La cura es no emitir nunca el enlace interno: se resuelve aquí al dominio final,
 * con lo que `next/link` renderiza un `<a>` externo normal (navegación del
 * navegador, sin RSC, sin CSP y sin salto intermedio).
 *
 * SE RESUELVE EN EL RENDER, NO EN EL DATO, a propósito: dejar `applications.ts`
 * con la URL interna mantiene intactos el filtro del sitemap, `check-verticales`,
 * `generate-app-dates`, `isAppImplemented`, `recentApps` y los índices para IA,
 * todos los cuales razonan sobre el slug de la carpeta en `app/`.
 *
 * Añadir una familia migrada = una entrada aquí.
 */
const RUTAS_MIGRADAS: { prefijo: string; dominio: string }[] = [
  // Cronologías del sistema dinámico → cronicum.com/<slug>/
  // El prefijo lleva barra final a propósito: NO debe capturar las apps hifenadas
  // (/visualizador-historia-reloj|dinero|escritura/), que son apps propias de
  // meskeIA con formato distinto y no existen en Cronicum.
  { prefijo: '/visualizador-historia/', dominio: 'https://cronicum.com/' },
];

/**
 * Resuelve una URL del catálogo a la URL pública que debe verse en el href.
 * Devuelve `null` si la URL no pertenece a ninguna familia migrada (el caso
 * normal: la inmensa mayoría del catálogo se sirve en meskeia.com).
 */
function resolverMigrada(url: string): string | null {
  for (const { prefijo, dominio } of RUTAS_MIGRADAS) {
    if (url.startsWith(prefijo)) {
      return dominio + url.slice(prefijo.length);
    }
  }
  return null;
}

/**
 * URL pública de una app del catálogo, sin marca de medición.
 * Para enlaces que no participan en el embudo (p.ej. el asistente) o cuando la
 * navegación se hace por código. Si además hay que medir, usar `withFrom`.
 */
export function urlPublica(url: string): string {
  if (!url) return url;
  return resolverMigrada(url) ?? url;
}

export function withFrom(url: string, origin: string): string {
  if (!url) return url;
  // Sanitizar el origin para evitar caracteres extraños
  const safe = origin.replace(/[^a-z0-9-]/gi, '').slice(0, 80);

  // Familia migrada a un dominio vertical → salto CROSS-DOMINIO, luego la marca
  // va en PARÁMETRO (?from=), no en fragmento: es la convención de estos saltos
  // (ver data/verticales.ts) y ningún robots.txt de los verticales la bloquea.
  // El prefijo `meskeia-` conserva la doctrina de atribución cross-dominio
  // (`from=meskeia`) y añade de qué módulo salió el clic.
  const migrada = resolverMigrada(url);
  if (migrada) return `${migrada}?from=meskeia-${safe}`;

  // Solo se marcan URLs internas
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  // Si el href ya lleva ancla propia (p.ej. /#disciplinas), no la pisamos:
  // el destino de esa ancla manda sobre la medición.
  if (url.includes('#')) return url;
  return `${url}#from=${safe}`;
}
