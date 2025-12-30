/**
 * Configuración del modo mantenimiento de meskeIA
 *
 * Para activar/desactivar el modo mantenimiento:
 * - Usar los scripts en /scripts/activar-mantenimiento.bat o desactivar-mantenimiento.bat
 * - O cambiar manualmente MAINTENANCE_MODE a true/false
 *
 * Cuando está activado:
 * - Todas las rutas redirigen a /mantenimiento
 * - Solo /mantenimiento es accesible
 */

export const MAINTENANCE_MODE = false;

// Rutas que NO se redirigen (siempre accesibles)
export const MAINTENANCE_EXCLUDED_PATHS = [
  '/mantenimiento',
  '/api/',           // APIs internas
  '/_next/',         // Assets de Next.js
  '/favicon.ico',
  '/icon_meskeia.png',
];
