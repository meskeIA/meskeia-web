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

  // El cero negativo se imprime CON signo: `(-0).toLocaleString('es-ES')` da «-0,00», y la
  // guarda de arriba no lo atrapa porque `-0 !== 0` es false. En JavaScript el -0 aparece
  // solo con hacer `-Math.log10(1)`, que es justo el pH de un HCl 1 M: el simulador de
  // titulación mostraba «pH -0,00» (hallazgo 346). `num + 0` lo normaliza a 0 sin tocar
  // ningún otro valor.
  return (num + 0).toLocaleString('es-ES', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Formatea un tipo impositivo NOMINAL con los decimales que de verdad tiene.
 *
 * Un tipo nominal es el que declara una norma (6 %, 6,5 %, 7,75 %), no el resultado de un
 * cálculo. Forzarle dos decimales convierte «escala progresiva (9 % → 11 %)» en
 * «(9,00 % → 11,00 %)», que es ruido; forzarle cero convierte el 7,75 % de Murcia en un
 * «8 %» que no cuadra con el importe de al lado (hallazgo 331 del Inspector).
 *
 * El tipo EFECTIVO —cuota entre base— sí va con dos decimales fijos: ahí el importe puede
 * no ser un porcentaje redondo del precio y el decimal es información, no adorno.
 *
 * @param num - Tipo en tanto por ciento (7.75, no 0.0775)
 * @returns String formateado sin el símbolo (ej: "7,75", "6,5", "6")
 */
export function formatTipoNominal(num: number): string {
  const decimales = Number.isInteger(num) ? 0 : Number.isInteger(num * 10) ? 1 : 2;
  return formatNumber(num, decimales);
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
 * @returns String formateado (ej: "25/11/2025", "13/05/2026")
 *
 * ── Por qué no basta `toLocaleDateString('es-ES')` (24/08/2026) ───────────────
 * A secas suprime los ceros a la izquierda: el 13 de mayo salía «13/5/2026», que no es
 * el DD/MM/YYYY que el CLAUDE.md global §2 declara obligatorio ni el que promete el
 * ejemplo de aquí arriba. Se veía en el sello «Última verificación» de todo
 * `<DataReference>` y en las 25 fichas de Delegum. `formatDateTime`, justo debajo, ya
 * pedía '2-digit' desde el principio: eran dos formatos de fecha en el mismo fichero.
 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
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

/**
 * Las tres piezas de lo que el usuario tecleó, o `null` si no es un número.
 *
 * Se separa de `parseSpanishNumber` porque hay una que el número ya no recuerda: las cifras
 * decimales TAL COMO SE ESCRIBIERON. `0,50` vale 0,5 y ahí el cero final se perdió para
 * siempre; `conversor-numeros-letras`, que promete leer las cifras tras la coma «una a una»,
 * necesita ese cero para decir «cero coma cinco cero».
 */
export interface PartesNumericas {
  /** -1 o 1 */
  signo: number;
  /** Parte entera, ya sin separadores de millar */
  entera: string;
  /** Cifras tras el separador decimal, tal cual se teclearon ('' si no hay) */
  decimales: string;
}

export function partesNumericas(input: string): PartesNumericas | null {
  if (!input || input.trim() === '') return null;

  // Fuera lo que no aporta cifra: espacios (normal, NBSP y fino) y el símbolo pegado
  const limpio = input
    .replace(/[\s\u00A0\u202F]/g, '')
    .replace(/^[€$£%]+|[€$£%]+$/g, '');

  // A partir de aquí solo cifras, signo y separadores. Nada de letras ni exponentes.
  if (!/^[+-]?[\d.,]+$/.test(limpio) || !/\d/.test(limpio)) return null;

  const signo = limpio.startsWith('-') ? -1 : 1;
  const cuerpo = limpio.replace(/^[+-]/, '');

  const comas = (cuerpo.match(/,/g) || []).length;
  const puntos = (cuerpo.match(/\./g) || []).length;

  if (comas > 0 && puntos > 0) {
    // Los dos separadores presentes: el ÚLTIMO es el decimal, el otro agrupa millares
    const decimalEsComa = cuerpo.lastIndexOf(',') > cuerpo.lastIndexOf('.');
    if ((decimalEsComa ? comas : puntos) !== 1) return null;   // dos decimales no es un número
    const corte = cuerpo.lastIndexOf(decimalEsComa ? ',' : '.');
    const entera = cuerpo.slice(0, corte);
    const decimales = cuerpo.slice(corte + 1);
    const agrupa = decimalEsComa ? AGRUPA_CON_PUNTO : AGRUPA_CON_COMA;
    if (!agrupa.test(entera)) return null;
    return { signo, entera: entera.replace(/[.,]/g, ''), decimales };
  }

  if (comas > 0) {
    // Una coma sola es SIEMPRE decimal español, aunque pudiera leerse como millar inglés
    if (comas === 1) {
      const [entera, decimales] = cuerpo.split(',');
      return { signo, entera, decimales };
    }
    if (AGRUPA_CON_COMA.test(cuerpo)) {
      return { signo, entera: cuerpo.replace(/,/g, ''), decimales: '' };
    }
    return null;                                               // "2,5,3" no es un número
  }

  if (puntos > 0) {
    if (AGRUPA_CON_PUNTO.test(cuerpo)) {
      return { signo, entera: cuerpo.replace(/\./g, ''), decimales: '' };
    }
    if (puntos === 1) {
      const [entera, decimales] = cuerpo.split('.');
      return { signo, entera, decimales };
    }
    return null;                                               // "1.2.3" no es un número
  }

  return { signo, entera: cuerpo, decimales: '' };
}

/**
 * La lectura que `parseSpanishNumber` NO ha elegido, cuando la entrada es genuinamente
 * ambigua. Devuelve `null` cuando no hay nada que desambiguar, que es lo normal.
 *
 * Esto NO cambia lo que devuelve el parser: sirve para que una app pueda decir en voz alta
 * «lo he leído así, ¿querías esto otro?» en vez de adivinar en silencio.
 *
 * ── El caso, y por qué solo este (26/08/2026) ─────────────────────────────────
 * Con un solo separador la ambigüedad es irreducible y el parser resuelve a favor del
 * español. Para «830,400» eso da 830,4 — y un mexicano, un peruano o un hondureño que
 * escribe un importe redondo quería 830.400. **Mil veces más, y sin ningún aviso.**
 *
 * No es un caso de laboratorio: de las visitas de `conversor-numeros-letras` entre el 17 y
 * el 21 de agosto, el 62 % venía de países que agrupan los millares con coma (MX 111,
 * PE 29, HN 20, DO 15 de 282), y sus consultas en Bing traían el número tal cual —«como se
 * escribe 830,400.00 en letras», «como se escribe $17,149.16 pesos en letra»—. Es la app
 * con la que se rellenan pagarés: ahí un cero de más no es una errata.
 *
 * ── Por qué NO se avisa del caso simétrico ────────────────────────────────────
 * «830.400» también podría leerse a la americana como 830,4, pero avisarlo saltaría ante
 * CUALQUIER millar redondo bien escrito en español —«1.500», «20.000»— para preguntar si
 * el usuario quería tres decimales, que en un importe no se escriben nunca. Un aviso que
 * sale siempre deja de informar, así que se calla donde la otra lectura no es plausible.
 */
export function lecturaAmbiguaAlternativa(
  input: string
): { valor: number; texto: string } | null {
  if (!input) return null;
  const limpio = input
    .replace(/[\s  ]/g, '')
    .replace(/^[€$£%]+|[€$£%]+$/g, '');
  const signo = limpio.startsWith('-') ? -1 : 1;
  const cuerpo = limpio.replace(/^[+-]/, '');

  // Una sola coma, tres cifras detrás y de una a tres delante: tanto puede ser el decimal
  // español como el millar americano. Con dos comas («85,911,818») el millar ya se delata
  // solo, y con otro número de decimales («830,40», «830,4») no hay millar posible.
  if (!/^\d{1,3},\d{3}$/.test(cuerpo)) return null;

  const valor = signo * Number(cuerpo.replace(',', ''));
  if (!Number.isFinite(valor)) return null;
  return { valor, texto: formatNumber(valor, 0) };
}

export function parseSpanishNumber(input: string): number {
  const partes = partesNumericas(input);
  if (!partes) return NaN;

  const n = parseFloat(`${partes.entera || '0'}.${partes.decimales || '0'}`);
  return Number.isFinite(n) ? partes.signo * n : NaN;
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
