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
 *
 * DESARROLLO LOCAL:
 * - La variable NEXT_PUBLIC_MAINTENANCE_OVERRIDE en .env.local permite
 *   desactivar el mantenimiento solo en localhost sin afectar producción
 */

// Valor base del archivo (controlado por scripts activar/desactivar)
const FILE_MAINTENANCE_MODE = true;

// Override local: si existe NEXT_PUBLIC_MAINTENANCE_OVERRIDE, usar ese valor
// En producción (Vercel) esta variable no existe, así que usa FILE_MAINTENANCE_MODE
const localOverride = process.env.NEXT_PUBLIC_MAINTENANCE_OVERRIDE;
export const MAINTENANCE_MODE = localOverride !== undefined
  ? localOverride === 'true'
  : FILE_MAINTENANCE_MODE;

// Rutas que NO se redirigen (siempre accesibles)
export const MAINTENANCE_EXCLUDED_PATHS = [
  '/mantenimiento',
  '/api/',           // APIs internas
  '/_next/',         // Assets de Next.js
  '/favicon.ico',
  '/icon_meskeia.png',
];
