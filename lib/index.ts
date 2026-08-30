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

export {
  getDailyApps,
  getDailyAppsForDate,
  getRotationCycleDays,
} from './dailyApps';

export { withFrom } from './trackingFrom';
export { URL_PRIVACIDAD, URL_TERMINOS } from './urls-legales';
