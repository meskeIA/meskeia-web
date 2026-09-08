// Puntuación de palabras en juegos de fichas tipo Scrabble (español) — lógica pura
//
// Existe para que la tabla de valores viva en UN solo sitio. La tenía sólo
// `app/calculadora-jugada-scrabble/motor.ts`, y al llevar la puntuación también
// al generador de anagramas habría quedado copiada en dos ficheros: exactamente
// el patrón que dejó los 7 simuladores de compraventa con el mismo defecto
// repetido siete veces.
//
// Alcance: la puntuación BASE de una palabra (suma de sus fichas). No conoce el
// tablero, así que no aplica multiplicadores de casilla ni la bonificación por
// vaciar el atril: eso vive en el motor de /calculadora-jugada-scrabble/, que sí
// modela gancho y casillas.
//
// Valores de la edición española de 100 fichas.

/** Valor en puntos de cada ficha. Incluye los dígrafos, que son ficha propia. */
export const VALORES_FICHA: Readonly<Record<string, number>> = {
  A: 1, E: 1, O: 1, I: 1, S: 1, N: 1, R: 1, U: 1, L: 1, T: 1,
  D: 2, G: 2,
  C: 3, B: 3, M: 3, P: 3,
  H: 4, F: 4, V: 4, Y: 4,
  CH: 5, Q: 5,
  J: 8, LL: 8, Ñ: 8, RR: 8, X: 8,
  Z: 10,
};

/** Dígrafos que en el Scrabble español clásico ocupan una sola casilla. */
export const DIGRAFOS: readonly string[] = ['CH', 'LL', 'RR'];

/**
 * Puntúa una palabra letra a letra, con las posiciones cubiertas por comodín a 0.
 *
 * **Letra a letra a propósito**: quien teclea un atril de letras sueltas no puede
 * expresar que tiene la ficha RR en vez de dos R, así que puntuar «CARRO» como
 * 8 estaría contando una ficha que ese jugador no ha dicho tener. Es además el
 * criterio de Apalabrados y de las ediciones sin dígrafos. Para la puntuación
 * con dígrafos y tablero está el motor de /calculadora-jugada-scrabble/.
 *
 * @param palabra Palabra en cualquier caja; las tildes no cuentan como ficha
 *   distinta (Á es la ficha A), pero la Ñ sí tiene ficha propia y vale 8.
 * @param posicionesComodin Índices (base 0, sobre la palabra ya normalizada) que
 *   cubre una ficha blanca: valen 0 puntos.
 */
export function puntuarPalabra(palabra: string, posicionesComodin: readonly number[] = []): number {
  const cubiertas = new Set(posicionesComodin);
  const fichas = aFichas(palabra);
  let total = 0;
  for (let i = 0; i < fichas.length; i++) {
    if (cubiertas.has(i)) continue;
    total += VALORES_FICHA[fichas[i]] ?? 0;
  }
  return total;
}

/**
 * Pasa una palabra a fichas simples: mayúsculas y sin tildes, conservando la Ñ.
 *
 * La Ñ se protege con un marcador porque NFD la descompone en N + virgulilla y
 * el filtro de diacríticos la dejaría en una N de 1 punto en vez de 8.
 */
const DIACRITICOS = new RegExp('[\\u0300-\\u036f]', 'g');

function aFichas(palabra: string): string[] {
  const MARCA = String.fromCharCode(1);
  const normalizada = palabra
    .toUpperCase()
    .split('Ñ')
    .join(MARCA)
    .normalize('NFD')
    .replace(DIACRITICOS, '')
    .split(MARCA)
    .join('Ñ');
  return Array.from(normalizada);
}
