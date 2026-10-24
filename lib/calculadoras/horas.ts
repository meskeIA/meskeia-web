/**
 * Motor de aritmética de tiempo — sin React ni DOM.
 *
 * Usada por: `app/calculadora-horas/` (la lista de sumar y restar y el multiplicar o repartir el
 * total). Lo comprueba `tests/horas-motor.spec.ts`, con casos resueltos a mano.
 *
 * Todo se cuenta en MINUTOS ENTEROS, como hasta ahora; solo multiplicar y repartir trabajan en
 * segundos, porque 15 minutos entre 4 son 3 min 45 s y redondear al minuto daría 0:04.
 *
 * CÓMO SE LEE UNA CANTIDAD (S0224, 24/10/2026)
 * ────────────────────────────────────────────
 *   · Sin unidad, como siempre: «7:45» y «7h45» son horas y minutos, «7,75» y «7.75» son horas
 *     decimales y una cifra sola son HORAS («7» = 7:00). Esto no cambia: quien apunta «8» en un
 *     parte de horas quiere 8 horas, y cambiarlo rompería sus listas.
 *   · Con unidad, lo nuevo: «45 min», «45m», «45 minutos», «2 h», «1 h 20», «1h20m»,
 *     «1 hora y 20 minutos», «1,5 h», «90 min».
 *   · Con palabras: «media hora», «cuarto de hora», «tres cuartos de hora», «una hora»,
 *     «hora y media», «2 horas y cuarto».
 *
 * Por qué: las búsquedas que llegan a la app escriben la operación en minutos («45 min más 45 min»,
 * «12:45 más media hora»), y hasta ahora «45 min» daba error y «45» se leía como 45 horas. Los
 * minutos que acompañan a unas horas no pueden pasar de 59 («1 h 75» es un error, igual que
 * «1:75»); solos, sí («90 min» = 1:30).
 */

const MIN_POR_HORA = 60;

/** Horas y minutos sin unidad: «7:45», «7h45», «1:20:30», «7,75», «7». */
function parsearSinUnidad(cuerpo: string): number | null {
  const normal = cuerpo.replace(/h(?!$)/g, ':').replace(/h$/, '');
  if (!normal) return null;

  if (normal.includes(':')) {
    const partes = normal.split(':');
    if (partes.length > 3) return null;
    const [h, m = '0', s = '0'] = partes;
    if (![h, m, s].every((p) => /^\d*$/.test(p))) return null;
    const mins = Number(m || 0);
    const segs = Number(s || 0);
    if (mins >= 60 || segs >= 60) return null;
    return Number(h || 0) * MIN_POR_HORA + mins + segs / 60;
  }

  const decimal = normal.replace(',', '.');
  if (!/^\d*\.?\d*$/.test(decimal) || decimal === '.') return null;
  return Number(decimal) * MIN_POR_HORA;
}

/** Las expresiones con palabras pasan a cifra y unidad antes de leerlas. */
function traducirPalabras(texto: string): string {
  return texto
    .replace(/\btres cuartos de hora\b/g, '45 min')
    .replace(/\b(?:un )?cuarto de hora\b/g, '15 min')
    .replace(/\bmedia hora\b/g, '30 min')
    .replace(/\b(?:una|un) hora\b/g, '1 hora')
    .replace(/^hora\b/, '1 hora')
    .replace(/\by media\b/g, '30 min')
    .replace(/\by cuarto\b/g, '15 min')
    .replace(/\by\b/g, ' ');
}

const CON_UNIDAD =
  /^(?:(\d+(?:[.,]\d+)?)\s*(?:h|hr|hrs|horas?))?\s*(?:(\d+(?:[.,]\d+)?)\s*(min|mins|minutos?|m)?)?$/;

/** Cantidades con unidad: «45 min», «1 h 20», «2 horas», «1h20m». */
function parsearConUnidad(texto: string): number | null {
  const coincide = traducirPalabras(texto).replace(/\s+/g, ' ').trim().match(CON_UNIDAD);
  if (!coincide) return null;
  const [, horasTxt, minutosTxt, unidadMin] = coincide;
  if (horasTxt === undefined && minutosTxt === undefined) return null;
  // Una cifra suelta sin unidad no llega aquí (es horas), y «7 45» tampoco es una cantidad.
  if (horasTxt === undefined && unidadMin === undefined) return null;

  const horas = horasTxt === undefined ? 0 : Number(horasTxt.replace(',', '.'));
  const minutos = minutosTxt === undefined ? 0 : Number(minutosTxt.replace(',', '.'));
  if (horasTxt !== undefined && minutosTxt !== undefined) {
    // Junto a unas horas, los minutos son los del reloj: ni decimales en las horas ni 60 o más.
    if (!Number.isInteger(horas) || minutos >= 60) return null;
  }
  return horas * MIN_POR_HORA + minutos;
}

/**
 * Convierte el texto de una línea a minutos enteros (con signo si empieza por «-»).
 * Devuelve null si no se entiende.
 */
export function parsearTiempo(entrada: string): number | null {
  const limpio = entrada.trim().toLowerCase();
  if (!limpio) return null;

  const negativo = limpio.startsWith('-') || limpio.startsWith('−');
  const cuerpo = limpio.replace(/^[+\-−]\s*/, '');
  if (!cuerpo) return null;
  // «7 45» no es nada: quitando el espacio se leía como 745 horas (así lo hacía la versión de antes).
  if (/\d\s+\d/.test(cuerpo)) return null;

  const compacto = cuerpo.replace(/\s+/g, '');
  const minutos = /^[\d:.,h]+$/.test(compacto) ? parsearSinUnidad(compacto) : parsearConUnidad(cuerpo);

  if (minutos === null || !Number.isFinite(minutos)) return null;
  return Math.round(minutos) * (negativo ? -1 : 1);
}

/**
 * Si la línea es una cifra entera SIN unidad, la devuelve: se lee como horas, y la vista avisa de
 * cómo escribir minutos. null en cualquier otro caso.
 */
export function cifraSinUnidad(entrada: string): number | null {
  const limpio = entrada.trim().replace(/^[+\-−]\s*/, '');
  return /^\d+$/.test(limpio) ? Number(limpio) : null;
}

/** Minutos → «7:45» (con signo si es negativo). */
export function formatearHM(minutos: number): string {
  const signo = minutos < 0 ? '−' : '';
  const abs = Math.abs(Math.round(minutos));
  return `${signo}${Math.floor(abs / 60)}:${String(abs % 60).padStart(2, '0')}`;
}

/** Segundos → «7:45» si son minutos exactos, o «0:03:45» si quedan segundos. */
export function formatearHMS(segundos: number): string {
  const signo = segundos < 0 ? '−' : '';
  const abs = Math.abs(Math.round(segundos));
  const h = Math.floor(abs / 3600);
  const m = Math.floor((abs % 3600) / 60);
  const s = abs % 60;
  const hm = `${signo}${h}:${String(m).padStart(2, '0')}`;
  return s === 0 ? hm : `${hm}:${String(s).padStart(2, '0')}`;
}

export type Operacion = 'por' | 'entre';

/**
 * Multiplica un tiempo por un número o lo reparte entre N, en segundos redondeados.
 * null si el factor no vale (no es finito, es negativo o es cero al repartir).
 */
export function operarTiempo(minutos: number, operacion: Operacion, factor: number): number | null {
  if (!Number.isFinite(factor) || factor < 0) return null;
  if (operacion === 'entre' && factor === 0) return null;
  const segundos = minutos * 60;
  return Math.round(operacion === 'por' ? segundos * factor : segundos / factor);
}
