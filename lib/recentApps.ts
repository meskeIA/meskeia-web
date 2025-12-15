/**
 * Gestión de apps recientes en localStorage
 *
 * Guarda las últimas apps visitadas por el usuario para mostrar en el sidebar.
 * Máximo 10 apps, ordenadas por última visita (más reciente primero).
 */

const STORAGE_KEY = 'meskeia_recent_apps';
const MAX_RECENT_APPS = 10;

export interface RecentApp {
  url: string;
  timestamp: number;
}

/**
 * Obtiene la lista de apps recientes desde localStorage
 */
export function getRecentApps(): RecentApp[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const apps = JSON.parse(stored) as RecentApp[];
    // Ordenar por timestamp descendente (más reciente primero)
    return apps.sort((a, b) => b.timestamp - a.timestamp);
  } catch {
    return [];
  }
}

/**
 * Añade o actualiza una app en la lista de recientes
 * Si la app ya existe, actualiza su timestamp
 * Si no existe, la añade al principio
 * Mantiene máximo MAX_RECENT_APPS apps
 */
export function addRecentApp(url: string): void {
  if (typeof window === 'undefined') return;

  // No guardar la homepage ni páginas especiales
  const excludedPaths = ['/', '/apps', '/acerca', '/privacidad', '/terminos'];
  if (excludedPaths.includes(url)) return;

  try {
    const apps = getRecentApps();
    const now = Date.now();

    // Buscar si la app ya existe
    const existingIndex = apps.findIndex(app => app.url === url);

    if (existingIndex !== -1) {
      // Actualizar timestamp de app existente
      apps[existingIndex].timestamp = now;
    } else {
      // Añadir nueva app al principio
      apps.unshift({ url, timestamp: now });
    }

    // Ordenar por timestamp y limitar a MAX_RECENT_APPS
    const sortedApps = apps
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, MAX_RECENT_APPS);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(sortedApps));
  } catch {
    // Silenciar errores de localStorage (puede estar lleno o deshabilitado)
  }
}

/**
 * Limpia todas las apps recientes
 */
export function clearRecentApps(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Silenciar errores
  }
}

/**
 * Obtiene el número de apps recientes guardadas
 */
export function getRecentAppsCount(): number {
  return getRecentApps().length;
}
