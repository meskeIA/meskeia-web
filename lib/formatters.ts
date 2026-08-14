/**
 * Utilidades de Formato - meskeIA
 *
 * Funciones para formatear números, fechas y monedas según estándares españoles
 */

/**
 * Formatea número a formato español (coma decimal, punto miles)
 * @param num - Número a formatear
 * @param decimals - Número de decimales (por defecto 2)
 * @returns String formateado (ej: "1.234,56")
 */
export function formatNumber(num: number, decimals: number = 2): string {
  if (isNaN(num)) return 'No definido';
  if (!isFinite(num)) return num > 0 ? '∞' : '-∞';

  // Verificar si el número es muy pequeño (científico)
  if (Math.abs(num) < 0.0001 && num !== 0) return '≈0';

  return num.toLocaleString('es-ES', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Formatea moneda a formato español (EUR)
 * @param num - Cantidad a formatear
 * @returns String formateado (ej: "1.234,56 €")
 */
export function formatCurrency(num: number): string {
  if (isNaN(num)) return 'No definido';
  if (!isFinite(num)) return num > 0 ? '∞ €' : '-∞ €';

  return num.toLocaleString('es-ES', {
    style: 'currency',
    currency: 'EUR',
  });
}

/**
 * Formatea fecha a formato español (DD/MM/YYYY)
 * @param date - Fecha a formatear
 * @returns String formateado (ej: "25/11/2025")
 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString('es-ES');
}

/**
 * Formatea fecha y hora a formato español (DD/MM/YYYY HH:mm)
 * @param date - Fecha a formatear
 * @returns String formateado (ej: "25/11/2025 14:30")
 */
export function formatDateTime(date: Date): string {
  return date.toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Parsea input de usuario (acepta coma o punto como decimal)
 * @param input - String del input (ej: "1.234,56", "200.000" o "1234.56")
 * @returns Número parseado
 *
 * ⚠️ Lo usan 89 apps, 48 de ellas sobre campos de texto libre: cualquier cambio aquí
 * se propaga a todo el catálogo. Ejecutar `npm run test:unit` antes de commitear.
 *
 * ── El punto sin coma, y por qué es el caso delicado (corregido el 14/08/2026) ──
 * Hasta esa fecha esta rama hacía un `parseFloat` directo, así que "200.000" devolvía
 * 200 y "11.440" devolvía 11,44. El comentario que había aquí anunciaba una heurística
 * («asumimos decimal si hay menos de 4 dígitos después del punto») que NUNCA se llegó a
 * implementar, y los tests probaban "1.234,56" y "1234.56" pero jamás el punto de
 * millares solo, de modo que el único caso roto era justo el que nadie miraba.
 *
 * Lo encontró el Inspector en `estimador-compraventa-inmueble`: su botón «Estimar por
 * mí» escribía 11.440 en un campo y lo releía como 11,44, así que el botón pensado para
 * rebajar la ganancia del vendedor le subía el IRPF 2.618,77 €. Llevaba oculto porque
 * `es-ES` no agrupa los millares hasta 5 cifras: por debajo de 10.000 el número se
 * escribe sin punto y el fallo no se manifiesta.
 */
export function parseSpanishNumber(input: string): number {
  if (!input || input.trim() === '') return NaN;

  // Eliminar espacios
  let cleaned = input.trim();

  // Si tiene punto Y coma, asumimos formato español (1.234,56)
  if (cleaned.includes('.') && cleaned.includes(',')) {
    cleaned = cleaned.replace(/\./g, '').replace(',', '.');
  }
  // Si solo tiene coma, es decimal español
  else if (cleaned.includes(',')) {
    cleaned = cleaned.replace(',', '.');
  }
  // Si solo tiene puntos, hay que decidir si separan millares o decimales.
  // Son millares cuando cada punto va seguido de EXACTAMENTE tres dígitos: "200.000",
  // "1.234.567". Con cualquier otra cantidad de dígitos es un decimal internacional
  // ("1234.56", "3.1416", "1.5"), que se venía aceptando y se sigue aceptando.
  // "1.234" es genuinamente ambiguo —mil doscientos treinta y cuatro en español, uno
  // coma doscientos treinta y cuatro en inglés— y se resuelve a favor del español,
  // que es el formato obligatorio del proyecto.
  else if (cleaned.includes('.') && /^-?\d{1,3}(\.\d{3})+$/.test(cleaned)) {
    cleaned = cleaned.replace(/\./g, '');
  }

  return parseFloat(cleaned);
}

/**
 * Formatea porcentaje a formato español
 * @param num - Número decimal (0.15 = 15%)
 * @param decimals - Número de decimales (por defecto 2)
 * @returns String formateado (ej: "15,00%")
 */
export function formatPercentage(num: number, decimals: number = 2): string {
  if (isNaN(num)) return 'No definido';
  if (!isFinite(num)) return num > 0 ? '∞%' : '-∞%';

  return (num * 100).toLocaleString('es-ES', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }) + '%';
}

/**
 * Formatea número grande con sufijos (K, M, B)
 * @param num - Número a formatear
 * @returns String formateado (ej: "1,5K", "2,3M")
 */
export function formatCompactNumber(num: number): string {
  if (isNaN(num)) return 'No definido';
  if (!isFinite(num)) return num > 0 ? '∞' : '-∞';

  const absNum = Math.abs(num);
  const sign = num < 0 ? '-' : '';

  if (absNum >= 1_000_000_000) {
    return sign + (absNum / 1_000_000_000).toLocaleString('es-ES', { maximumFractionDigits: 1 }) + 'B';
  }
  if (absNum >= 1_000_000) {
    return sign + (absNum / 1_000_000).toLocaleString('es-ES', { maximumFractionDigits: 1 }) + 'M';
  }
  if (absNum >= 1_000) {
    return sign + (absNum / 1_000).toLocaleString('es-ES', { maximumFractionDigits: 1 }) + 'K';
  }

  return formatNumber(num, 0);
}

/**
 * Valida si un string es un número válido
 * @param input - String a validar
 * @returns true si es válido
 */
export function isValidNumber(input: string): boolean {
  const num = parseSpanishNumber(input);
  return !isNaN(num) && isFinite(num);
}

/**
 * Formatea tiempo en segundos a formato legible
 * @param seconds - Segundos totales
 * @returns String formateado (ej: "2h 30min", "45min", "30seg")
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}seg`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}min`;

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) return `${hours}h`;
  return `${hours}h ${remainingMinutes}min`;
}
