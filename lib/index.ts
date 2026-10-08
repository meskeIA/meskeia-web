/**
 * Barrel export para utilidades meskeIA
 *
 * Permite importar funciones desde:
 * import { formatNumber, formatCurrency } from '@/lib';
 */

export {
  formatNumber,
  formatTipoNominal,
  formatCurrency,
  formatDate,
  formatDateTime,
  formatFechaLarga,
  parseISODateLocal,
  formatPercentage,
  formatCompactNumber,
  formatDuration,
  parseSpanishNumber,
  parseSpanishNumberOr,
  partesNumericas,
  lecturaAmbiguaAlternativa,
  type PartesNumericas,
  isValidNumber,
} from './formatters';

export {
  getRecentApps,
  addRecentApp,
  clearRecentApps,
  getRecentAppsCount,
  type RecentApp,
} from './recentApps';

// `./dailyApps` NO se reexporta aquí: importa el catálogo entero (`data/applications.ts`) y
// este barrel lo usan casi todas las apps. Se importa por su ruta (check:catalogo-cliente).

export {
  parsearSerieNumerica,
  describirLectura,
  type SerieNumerica,
  type ModoLectura,
  type PapelComa,
} from './parsearSerieNumerica';

export { withFrom } from './trackingFrom';
export { registrarEventoInteraccion } from './trackingEvento';
export { URL_PRIVACIDAD, URL_TERMINOS } from './urls-legales';
