/**
 * Barrel export para utilidades meskeIA
 *
 * Permite importar funciones desde:
 * import { formatNumber, formatCurrency } from '@/lib';
 */

export {
  formatNumber,
  formatCurrency,
  formatDate,
  formatDateTime,
  formatPercentage,
  formatCompactNumber,
  formatDuration,
  parseSpanishNumber,
  isValidNumber,
} from './formatters';
