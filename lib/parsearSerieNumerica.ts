import { parseSpanishNumber } from './formatters';

/**
 * Lectura de una SERIE de números escrita o pegada por el usuario.
 *
 * El problema que resuelve no es convertir un número —de eso ya se encarga
 * `parseSpanishNumber`— sino **segmentar**: decidir dónde acaba cada número cuando la coma
 * tiene dos papeles posibles, decimal y separador de lista. Escrito el 04/09/2026 tras
 * comprobar que las dos apps de estadística del catálogo leían el MISMO texto de formas
 * distintas y ninguna avisaba:
 *
 *   entrada        estadistica-avanzada        calculadora-estadistica
 *   23,25,28   →   23,25 (¡un solo dato!)      23 · 25 · 28
 *   1,5 2,3    →   1,5 · 2,3                   1 · 5 · 2 · 3  (¡el doble de datos!)
 *
 * La primera hacía `replace(/,/g,'.')` sobre el texto entero, así que la coma nunca era
 * separador; la segunda partía por coma, así que nunca era decimal. Un test t calculado
 * con un dato en vez de tres no se distingue a simple vista del correcto: por eso el
 * resultado incluye SIEMPRE cómo se ha leído la entrada, para que la app pueda enseñarlo.
 *
 * El caso que manda en el diseño es **pegar una columna de Excel en español**, donde el
 * decimal es coma y los valores vienen separados por saltos de línea o tabuladores. Ahí no
 * sirve pedirle al usuario que reescriba: nadie retoca 200 valores a mano.
 */

/** Papel que se le da a la coma al leer la serie. */
export type PapelComa = 'decimal' | 'separador' | 'sin-comas';

/** `auto` deduce el papel de la coma; los otros dos lo imponen. */
export type ModoLectura = 'auto' | 'decimal' | 'separador';

export interface SerieNumerica {
  valores: number[];
  /** Cómo se ha leído la coma finalmente. */
  papelComa: PapelComa;
  /**
   * La entrada admitía las dos lecturas y se ha elegido una por convención.
   * Cuando es `true`, la app debería ofrecer el cambio en vez de dar por buena la suya.
   */
  ambigua: boolean;
  /** La otra lectura posible, para ofrecerla con un clic. `null` si no produce nada distinto. */
  alternativa: { papelComa: 'decimal' | 'separador'; valores: number[] } | null;
  /** Trozos que no se pudieron leer como número, tal cual los escribió el usuario. */
  descartados: string[];
}

/**
 * Separadores que nunca son otra cosa: salto de línea, tabulador, espacio y punto y coma.
 * El tabulador y el salto son los que trae una columna pegada desde una hoja de cálculo.
 */
const DUROS = /[\s;]+/;

/** ¿Hay algún separador que no sea la coma? De eso depende que la coma pueda ser decimal. */
function tieneSeparadoresDuros(texto: string): boolean {
  return DUROS.test(texto.trim());
}

/**
 * Lee la serie con un papel FIJADO para la coma.
 *
 * Con la coma como decimal se parte solo por los separadores duros y se limpian las comas
 * que queden colgando al final de un trozo: así «23, 25, 28» sigue dando tres valores, que
 * es lo que quiere quien escribe con comas y espacios.
 */
function leerCon(texto: string, papel: 'decimal' | 'separador'): { valores: number[]; descartados: string[] } {
  const limpio = texto.trim();
  if (!limpio) return { valores: [], descartados: [] };

  const trozos =
    papel === 'separador'
      ? limpio.split(/[,;\s]+/)
      : limpio.split(DUROS).map((t) => t.replace(/,+$/, ''));

  const valores: number[] = [];
  const descartados: string[] = [];
  for (const trozo of trozos) {
    if (!trozo) continue;
    const n = parseSpanishNumber(trozo);
    if (Number.isFinite(n)) valores.push(n);
    else descartados.push(trozo);
  }
  return { valores, descartados };
}

/** Dos lecturas son distintas si difieren en cuántos valores dan o en alguno de ellos. */
function sonDistintas(a: number[], b: number[]): boolean {
  return a.length !== b.length || a.some((v, i) => v !== b[i]);
}

/**
 * Decide el papel de la coma por el contexto de la propia entrada.
 *
 * La regla, en una frase: **la coma es decimal si en el texto hay algún otro separador**;
 * si la coma es lo único que separa, es separador de lista, salvo que haya una sola y por
 * tanto un solo número («1,5» es uno y medio, no dos valores).
 *
 * El caso «23,25,28» no tiene verdad matemática: se elige lista por convención —tres
 * decimales seguidos sin un solo espacio es escritura muy improbable— y se marca `ambigua`
 * para que la app lo enseñe en vez de decidir en silencio.
 */
function deducirPapel(texto: string): 'decimal' | 'separador' {
  if (tieneSeparadoresDuros(texto)) return 'decimal';
  return (texto.match(/,/g)?.length ?? 0) <= 1 ? 'decimal' : 'separador';
}

export function parsearSerieNumerica(texto: string, modo: ModoLectura = 'auto'): SerieNumerica {
  const limpio = (texto ?? '').trim();
  if (!limpio) {
    return { valores: [], papelComa: 'sin-comas', ambigua: false, alternativa: null, descartados: [] };
  }

  // Sin comas no hay nada que decidir: manda cualquier separador duro
  if (!limpio.includes(',')) {
    const { valores, descartados } = leerCon(limpio, 'separador');
    return { valores, papelComa: 'sin-comas', ambigua: false, alternativa: null, descartados };
  }

  const papel = modo === 'auto' ? deducirPapel(limpio) : modo;
  const elegida = leerCon(limpio, papel);
  const otroPapel = papel === 'decimal' ? 'separador' : 'decimal';
  const otra = leerCon(limpio, otroPapel);

  const hayAlternativa = otra.valores.length > 0 && sonDistintas(elegida.valores, otra.valores);

  return {
    valores: elegida.valores,
    papelComa: papel,
    // Solo es ambigua de verdad cuando la coma es lo único que separa: con un espacio o un
    // salto de línea de por medio, la lectura decimal es la única razonable.
    ambigua: modo === 'auto' && hayAlternativa && !tieneSeparadoresDuros(limpio),
    alternativa: hayAlternativa ? { papelComa: otroPapel, valores: otra.valores } : null,
    descartados: elegida.descartados,
  };
}

/** Texto corto que describe la lectura hecha, para enseñárselo al usuario. */
export function describirLectura(serie: SerieNumerica): string {
  if (serie.valores.length === 0) return 'No se ha reconocido ningún número.';
  const cuantos = `${serie.valores.length} ${serie.valores.length === 1 ? 'valor' : 'valores'}`;
  if (serie.papelComa === 'decimal') return `${cuantos}, leyendo la coma como decimal.`;
  if (serie.papelComa === 'separador') return `${cuantos}, leyendo la coma como separador.`;
  return `${cuantos}.`;
}
