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
 * Como `parseSpanishNumber`, pero un campo vacío o ilegible vale `porDefecto` (0) en vez
 * de NaN. Para los campos OPCIONALES de un formulario, que es donde el NaN hace daño.
 *
 * ── Por qué hace falta (14/08/2026) ───────────────────────────────────────────
 * `parseSpanishNumber('')` devuelve NaN, y eso está bien: significa «no hay dato». El
 * problema es que NaN se propaga en silencio y ninguna comparación lo delata —`NaN <= 0`
 * es `false`, y `Math.max(0, NaN)` sigue siendo NaN—, así que un solo campo opcional sin
 * rellenar bastaba para que un bloque entero de resultados saliera «No definido».
 *
 * En `estimador-compraventa-inmueble` la pestaña Vendedor no calculaba nada por su ruta
 * por defecto: dos de sus tres campos se anuncian como «(opcional)» en la propia etiqueta,
 * y dejarlos vacíos —lo natural— vaciaba el IRPF y el importe neto.
 *
 * Regla: si el formulario dice «opcional», el código tiene que tratarlo como opcional.
 */
export function parseSpanishNumberOr(input: string, porDefecto = 0): number {
  const n = parseSpanishNumber(input);
  return Number.isFinite(n) ? n : porDefecto;
}

/**
 * Parsea input de usuario (acepta coma o punto como decimal)
 * @param input - String del input (ej: "1.234,56", "1,234.56", "200.000" o "1234.56")
 * @returns Número parseado, o NaN si lo tecleado no es un número
 *
 * ⚠️ Lo usan 93 ficheros, casi la mitad sobre campos de texto libre: cualquier cambio aquí
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
 *
 * ── El formato internacional, y la basura que colaba (corregido el 24/08/2026) ──
 * El CLAUDE.md prometía, en su regla Latam-friendly, que esta función «ya admite 1,234.56
 * y 1.234,56», y era falso: con punto Y coma resolvía siempre a favor del español, así que
 * "1,234.56" salía 1,23456 —tres órdenes de magnitud menos— sin ningún aviso. Con LATAM en
 * el 59,6 % de las impresiones y México o Perú escribiendo el millar con coma, la promesa
 * tenía que cumplirla el código, no la documentación.
 *
 * La regla que lo resuelve sin ambigüedad: **cuando aparecen los dos separadores, el
 * ÚLTIMO es el decimal**. Vale en los dos convenios y no cambia nada de lo que ya
 * funcionaba en español, donde la coma va siempre detrás del punto.
 *
 * Con UN SOLO separador la ambigüedad es irreducible ("1.234" y "1,234" significan cosas
 * distintas en cada convenio) y se resuelve a favor del español, que es el formato
 * obligatorio del proyecto: la coma sola es decimal, y el punto solo agrupa millares
 * cuando parte el número en grupos de exactamente tres cifras.
 *
 * Y se dejó de admitir lo que no es un número. `parseFloat` acepta prefijos numéricos y
 * notación científica, de modo que "12abc" valía 12, "1e3" valía 1000 y "1.2.3" valía 1,2:
 * importes plausibles pero equivocados, sin nada que los delatase. En
 * `conversor-numeros-letras` eso se escribe en un pagaré. Ahora devuelven NaN, que es lo
 * que las apps ya saben tratar («No definido»), y `parseSpanishNumberOr` sigue dando su
 * valor por defecto.
 *
 * Lo que SÍ se sigue tolerando: espacios de cualquier clase —incluido el NBSP con que
 * `Intl` separa el símbolo de moneda— y un símbolo de moneda o porcentaje pegado al
 * número, para que releer lo que escribió `formatCurrency` siga funcionando.
 */
// Un separador agrupa millares si parte el número en grupos de exactamente tres cifras
const AGRUPA_CON_PUNTO = /^\d{1,3}(\.\d{3})+$/;
const AGRUPA_CON_COMA = /^\d{1,3}(,\d{3})+$/;

export function parseSpanishNumber(input: string): number {
  if (!input || input.trim() === '') return NaN;

  // Fuera lo que no aporta cifra: espacios (normal, NBSP y fino) y el símbolo pegado
  const limpio = input
    .replace(/[\s\u00A0\u202F]/g, '')
    .replace(/^[€$£%]+|[€$£%]+$/g, '');

  // A partir de aquí solo cifras, signo y separadores. Nada de letras ni exponentes.
  if (!/^[+-]?[\d.,]+$/.test(limpio) || !/\d/.test(limpio)) return NaN;

  const signo = limpio.startsWith('-') ? -1 : 1;
  const cuerpo = limpio.replace(/^[+-]/, '');

  const comas = (cuerpo.match(/,/g) || []).length;
  const puntos = (cuerpo.match(/\./g) || []).length;

  let normalizado: string;

  if (comas > 0 && puntos > 0) {
    // Los dos separadores presentes: el ÚLTIMO es el decimal, el otro agrupa millares
    const decimalEsComa = cuerpo.lastIndexOf(',') > cuerpo.lastIndexOf('.');
    if ((decimalEsComa ? comas : puntos) !== 1) return NaN;  // dos decimales no es un número
    const corte = cuerpo.lastIndexOf(decimalEsComa ? ',' : '.');
    const entera = cuerpo.slice(0, corte);
    const decimales = cuerpo.slice(corte + 1);
    const agrupa = decimalEsComa ? AGRUPA_CON_PUNTO : AGRUPA_CON_COMA;
    if (!agrupa.test(entera)) return NaN;
    normalizado = entera.replace(/[.,]/g, '') + '.' + decimales;
  } else if (comas > 0) {
    // Una coma sola es SIEMPRE decimal español, aunque pudiera leerse como millar inglés
    if (comas === 1) normalizado = cuerpo.replace(',', '.');
    else if (AGRUPA_CON_COMA.test(cuerpo)) normalizado = cuerpo.replace(/,/g, '');
    else return NaN;                                          // "2,5,3" no es un número
  } else if (puntos > 0) {
    if (AGRUPA_CON_PUNTO.test(cuerpo)) normalizado = cuerpo.replace(/\./g, '');
    else if (puntos === 1) normalizado = cuerpo;              // decimal internacional
    else return NaN;                                          // "1.2.3" no es un número
  } else {
    normalizado = cuerpo;
  }

  const n = parseFloat(normalizado);
  return Number.isFinite(n) ? signo * n : NaN;
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
