/**
 * Motor de comprobación de generador-loteria: qué categoría de premio tiene una
 * combinación guardada frente a la combinación ganadora que teclea el usuario.
 *
 * Sin dependencias y sin estado: se prueba en `tests/comprobar-loteria-motor.spec.ts`
 * con casos resueltos a mano, antes que la vista.
 *
 * Por qué existe (S0176, 03/10/2026): la app es la de mayor retención del catálogo
 * (73 % de usos recurrentes) y desde S0115 guarda las combinaciones entre visitas. El
 * ciclo generar → guardar → jugar → comprobar se cortaba en el último paso: quien
 * volvía con sus combinaciones no tenía dónde contrastarlas con el sorteo.
 *
 * NO calcula importes, a propósito: salvo los premios fijos, la cuantía de cada
 * categoría depende de la recaudación y del número de acertantes de cada sorteo.
 *
 * FUENTES de las categorías (verificadas el 03/10/2026):
 *   · La Primitiva — Normas de SELAE para La Primitiva (junio de 2015), norma 8.ª
 *     (categoría especial = 6 + reintegro; 1.ª = 6; 2.ª = 5 + complementario; 3.ª = 5;
 *     4.ª = 4), norma 9.ª (5.ª = 3 aciertos; reintegro) y norma 36.ª (el complementario
 *     es una séptima bola que sube a 2.ª la apuesta con 5 aciertos cuyo sexto pronóstico
 *     coincide con él).
 *   · Bonoloto — mismas categorías salvo la especial: 1.ª a 5.ª y reintegro (escrutinios
 *     de SELAE de 2026).
 *   · El Gordo de la Primitiva — BOE n.º 25, 29/01/2005, normas 63.ª, 65.ª y 68.ª: el
 *     número clave (0-9) lo marca el jugador, completa las categorías 1.ª, 3.ª, 5.ª y 7.ª
 *     y da el reintegro «sin perjuicio» de los demás premios.
 *   · Euromillones — 13 categorías, de 5 + 2 a 2 + 0 (escrutinios de SELAE).
 *   · Lototurf — 1.ª 6 + caballo, 2.ª 6, 3.ª 5 + caballo, 4.ª 5, 5.ª 4 + caballo,
 *     6.ª 4, 7.ª 3 + caballo (centro de ayuda de SELAE). Su reintegro va impreso en el
 *     resguardo y el generador no lo crea, así que aquí no se puede comprobar.
 */

export type Modalidad = 'primitiva' | 'euromillones' | 'bonoloto' | 'gordo' | 'lototurf';

/** Lo que se teclea del sorteo: la combinación ganadora y sus bolas aparte. */
export interface Sorteo {
  principales: number[];
  /** Solo Primitiva y Bonoloto: la séptima bola, que sube a 2.ª categoría. */
  complementario?: number;
  /** Primitiva y Bonoloto: la bola del 0 al 9 del bombo del reintegro. */
  reintegro?: number;
  /** Euromillones: las 2 estrellas · Gordo: el número clave · Lototurf: el caballo. */
  extras?: number[];
}

/** Una combinación guardada, con la misma forma que la que produce el generador. */
export interface Apuesta {
  principales: number[];
  /** Primitiva y Bonoloto: [reintegro] · Euromillones: estrellas · Gordo: [clave] · Lototurf: [caballo]. */
  extras?: number[];
}

export interface Categoria {
  /** «Categoría especial», «1.ª categoría»… */
  nombre: string;
  /** Lo que exige, en palabras: «5 aciertos + complementario». */
  requisito: string;
}

export interface Comprobacion {
  /** Números principales de la apuesta que están en la combinación ganadora. */
  acertados: number[];
  /** Estrellas, clave o caballo de la apuesta que coinciden con los del sorteo. */
  extrasAcertados: number[];
  /** La apuesta lleva el complementario (solo cuenta con 5 aciertos). */
  conComplementario: boolean;
  /** Reintegro acertado; `null` si en esta modalidad no se puede comprobar. */
  reintegro: boolean | null;
  categoria: Categoria | null;
}

/** Forma del sorteo de cada modalidad: cuántas bolas hay que teclear y en qué rango. */
export interface ReglasSorteo {
  principales: number;
  principalMax: number;
  /** Primitiva y Bonoloto. */
  conComplementario: boolean;
  /** Primitiva y Bonoloto: el reintegro sale de su propio bombo. */
  conReintegro: boolean;
  /** Estrellas, clave o caballo: cuántos y en qué rango. */
  extras: number;
  extraMin: number;
  extraMax: number;
  /** Nombre del bloque de extras tal como lo dice el sorteo («Estrellas», «Clave», «Caballo»). */
  nombreExtra: string;
}

export const REGLAS_SORTEO: Record<Modalidad, ReglasSorteo> = {
  primitiva: { principales: 6, principalMax: 49, conComplementario: true, conReintegro: true, extras: 0, extraMin: 0, extraMax: 0, nombreExtra: '' },
  bonoloto: { principales: 6, principalMax: 49, conComplementario: true, conReintegro: true, extras: 0, extraMin: 0, extraMax: 0, nombreExtra: '' },
  euromillones: { principales: 5, principalMax: 50, conComplementario: false, conReintegro: false, extras: 2, extraMin: 1, extraMax: 12, nombreExtra: 'Estrellas' },
  gordo: { principales: 5, principalMax: 54, conComplementario: false, conReintegro: false, extras: 1, extraMin: 0, extraMax: 9, nombreExtra: 'Clave' },
  lototurf: { principales: 6, principalMax: 31, conComplementario: false, conReintegro: false, extras: 1, extraMin: 1, extraMax: 12, nombreExtra: 'Caballo' },
};

/**
 * Tablas «aciertos + extras acertados → categoría» de las modalidades que se deciden
 * por esas dos cifras. Primitiva y Bonoloto no van aquí: dependen del complementario
 * y (la Primitiva) del reintegro, y se resuelven aparte.
 */
const TABLA_EUROMILLONES: Record<string, number> = {
  '5+2': 1, '5+1': 2, '5+0': 3, '4+2': 4, '4+1': 5, '3+2': 6, '4+0': 7,
  '2+2': 8, '3+1': 9, '3+0': 10, '1+2': 11, '2+1': 12, '2+0': 13,
};

const TABLA_GORDO: Record<string, number> = {
  '5+1': 1, '5+0': 2, '4+1': 3, '4+0': 4, '3+1': 5, '3+0': 6, '2+1': 7, '2+0': 8,
};

const TABLA_LOTOTURF: Record<string, number> = {
  '6+1': 1, '6+0': 2, '5+1': 3, '5+0': 4, '4+1': 5, '4+0': 6, '3+1': 7,
};

/** «1.ª categoría»: ordinal abreviado con punto y volada, como pide la RAE. */
function nombreOrdinal(n: number): string {
  return `${n}.ª categoría`;
}

function aciertosEnPalabras(n: number): string {
  return n === 1 ? '1 acierto' : `${n} aciertos`;
}

function requisitoConExtra(aciertos: number, extras: number, modalidad: Modalidad): string {
  const base = aciertosEnPalabras(aciertos);
  if (modalidad === 'euromillones') {
    if (extras === 0) return base;
    return `${base} + ${extras === 1 ? '1 estrella' : '2 estrellas'}`;
  }
  if (extras === 0) return base;
  return `${base} + ${modalidad === 'gordo' ? 'clave' : 'caballo'}`;
}

/**
 * Compara una apuesta con el sorteo de su modalidad.
 *
 * Supone ambos bien formados (los valida `validarSorteo` y, en lo guardado,
 * `leerFavoritasGuardadas` de la página); con datos incompletos no falla, simplemente
 * no encuentra coincidencias.
 */
export function comprobarApuesta(modalidad: Modalidad, apuesta: Apuesta, sorteo: Sorteo): Comprobacion {
  const ganadora = new Set(sorteo.principales);
  const acertados = apuesta.principales.filter(n => ganadora.has(n));
  const aciertos = acertados.length;

  if (modalidad === 'primitiva' || modalidad === 'bonoloto') {
    const reintegroApuesta = apuesta.extras?.[0];
    const reintegro = reintegroApuesta !== undefined && sorteo.reintegro !== undefined
      ? reintegroApuesta === sorteo.reintegro
      : false;
    // Norma 36.ª: con 5 aciertos, el sexto pronóstico es el que no está en la
    // combinación ganadora; si es el complementario, la apuesta sube a 2.ª.
    const conComplementario = sorteo.complementario !== undefined && apuesta.principales.includes(sorteo.complementario);

    let categoria: Categoria | null = null;
    if (aciertos === 6) {
      categoria = modalidad === 'primitiva' && reintegro
        ? { nombre: 'Categoría especial', requisito: '6 aciertos + reintegro' }
        : { nombre: nombreOrdinal(1), requisito: '6 aciertos' };
    } else if (aciertos === 5) {
      categoria = conComplementario
        ? { nombre: nombreOrdinal(2), requisito: '5 aciertos + complementario' }
        : { nombre: nombreOrdinal(3), requisito: '5 aciertos' };
    } else if (aciertos === 4) {
      categoria = { nombre: nombreOrdinal(4), requisito: '4 aciertos' };
    } else if (aciertos === 3) {
      categoria = { nombre: nombreOrdinal(5), requisito: '3 aciertos' };
    }

    return { acertados, extrasAcertados: [], conComplementario, reintegro, categoria };
  }

  const extrasSorteo = new Set(sorteo.extras ?? []);
  const extrasAcertados = (apuesta.extras ?? []).filter(n => extrasSorteo.has(n));
  const clave = `${aciertos}+${extrasAcertados.length}`;

  const tabla = modalidad === 'euromillones' ? TABLA_EUROMILLONES
    : modalidad === 'gordo' ? TABLA_GORDO
    : TABLA_LOTOTURF;
  const numero = tabla[clave];
  const categoria = numero === undefined
    ? null
    : { nombre: nombreOrdinal(numero), requisito: requisitoConExtra(aciertos, extrasAcertados.length, modalidad) };

  // El Gordo: el número clave da además el reintegro (norma 68.ª). Euromillones no
  // tiene reintegro, y el de Lototurf no viaja en la combinación guardada.
  const reintegro = modalidad === 'gordo' ? extrasAcertados.length === 1
    : modalidad === 'lototurf' ? null
    : false;

  return { acertados, extrasAcertados, conComplementario: false, reintegro, categoria };
}

/** Lo acertado, en palabras: «3 aciertos», «1 acierto + 2 estrellas», «2 aciertos + clave». */
export function describirAciertos(modalidad: Modalidad, c: Comprobacion): string {
  if (modalidad === 'primitiva' || modalidad === 'bonoloto') return aciertosEnPalabras(c.acertados.length);
  return requisitoConExtra(c.acertados.length, c.extrasAcertados.length, modalidad);
}

/**
 * El veredicto de una combinación en una línea. La categoría y el reintegro van por
 * separado y unidos con «y», sin sumar nada: si se cobran los dos lo dice el escrutinio.
 */
export function textoVeredicto(modalidad: Modalidad, c: Comprobacion): string {
  const premio = c.categoria ? `${c.categoria.nombre} (${c.categoria.requisito})` : null;
  // La categoría especial ya lleva el reintegro en su nombre: no se repite detrás.
  if (premio && c.reintegro && !c.categoria?.requisito.includes('reintegro')) return `${premio} y reintegro`;
  if (premio) return premio;
  if (c.reintegro) return `Reintegro (${describirAciertos(modalidad, c)}, sin premio de categoría)`;
  return `Sin premio (${describirAciertos(modalidad, c)})`;
}

/**
 * Lee un número tecleado en una casilla: solo dígitos (uno o dos). «12abc», «1,5» o
 * «-3» no son una bola, y no se convierten en una a medias.
 */
export function leerBola(texto: string): number | null {
  const limpio = texto.trim();
  if (!/^\d{1,2}$/.test(limpio)) return null;
  return Number(limpio);
}

/** Casillas del formulario, tal como se teclean. */
export interface CamposSorteo {
  principales: string[];
  complementario: string;
  reintegro: string;
  extras: string[];
}

export type ResultadoValidacion =
  | { ok: true; sorteo: Sorteo }
  | { ok: false; error: string };

/**
 * Convierte las casillas en un `Sorteo` o explica qué falla, con un solo mensaje y en
 * el orden en que se rellenan: primero la combinación, luego lo demás.
 */
export function validarSorteo(modalidad: Modalidad, campos: CamposSorteo): ResultadoValidacion {
  const r = REGLAS_SORTEO[modalidad];

  const principales: number[] = [];
  for (let i = 0; i < r.principales; i++) {
    const n = leerBola(campos.principales[i] ?? '');
    if (n === null) return { ok: false, error: `Falta el número ${i + 1} de la combinación ganadora, o no es un número entero.` };
    if (n < 1 || n > r.principalMax) return { ok: false, error: `El número ${i + 1} (${n}) está fuera de rango: va del 1 al ${r.principalMax}.` };
    if (principales.includes(n)) return { ok: false, error: `El ${n} está repetido en la combinación ganadora: en un sorteo no sale dos veces.` };
    principales.push(n);
  }

  const sorteo: Sorteo = { principales };

  if (r.conComplementario) {
    const c = leerBola(campos.complementario);
    if (c === null) return { ok: false, error: 'Falta el complementario, o no es un número entero.' };
    if (c < 1 || c > r.principalMax) return { ok: false, error: `El complementario (${c}) está fuera de rango: va del 1 al ${r.principalMax}.` };
    if (principales.includes(c)) return { ok: false, error: `El complementario (${c}) no puede ser uno de los seis de la combinación ganadora: sale del mismo bombo, después.` };
    sorteo.complementario = c;
  }

  if (r.conReintegro) {
    const re = leerBola(campos.reintegro);
    if (re === null || re > 9) return { ok: false, error: 'Falta el reintegro: es una sola cifra, del 0 al 9.' };
    sorteo.reintegro = re;
  }

  if (r.extras > 0) {
    const extras: number[] = [];
    for (let i = 0; i < r.extras; i++) {
      const etiqueta = r.extras > 1 ? `la ${r.nombreExtra.toLowerCase().replace(/s$/, '')} ${i + 1}` : `el número ${r.nombreExtra.toLowerCase()}`;
      const e = leerBola(campos.extras[i] ?? '');
      if (e === null) return { ok: false, error: `Falta ${modalidad === 'lototurf' ? 'el caballo ganador' : etiqueta}, o no es un número entero.` };
      if (e < r.extraMin || e > r.extraMax) return { ok: false, error: `${r.nombreExtra}: ${e} está fuera de rango, va del ${r.extraMin} al ${r.extraMax}.` };
      if (extras.includes(e)) return { ok: false, error: `Las dos estrellas no pueden ser la misma: el ${e} está repetido.` };
      extras.push(e);
    }
    sorteo.extras = extras;
  }

  return { ok: true, sorteo };
}
