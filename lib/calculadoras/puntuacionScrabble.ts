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
 * Letras del alfabeto español que NO tienen ficha en la edición española de 100 fichas.
 *
 * Son la K y la W: existen en el diccionario (kayak, whisky, waterpolo, kilo…) pero no en la
 * bolsa, así que ninguna palabra que las lleve es jugable. `VALORES_FICHA[ficha] ?? 0` las
 * puntuaba como 0 EN SILENCIO, de modo que «kayak» se presentaba como una jugada de 6 puntos
 * —A1+Y4+A1, con las dos K a cero— y «ka» como una palabra de dos letras con el valor de
 * una sola. Afecta a los 186 lemas con K y los 44 con W del diccionario que carga el
 * generador de anagramas (hallazgo 704 del Inspector, 10/09/2026).
 */
export const LETRAS_SIN_FICHA: readonly string[] = ['K', 'W'];

/**
 * Las letras sin ficha que lleva la palabra, sin repetir y en el orden en que aparecen.
 *
 * Devuelve `[]` cuando la palabra es jugable, así que `letrasSinFicha(p).length === 0` es la
 * pregunta «¿se puede jugar?».
 *
 * Una ficha blanca NO las salva: el art. 10.2 del reglamento de la FISE dice que «el comodín
 * no puede reemplazar la K ni la W». Hasta el 01/10/2026 este comentario decía lo contrario
 * («K y W incluidas») y las posiciones cubiertas por una blanca se saltaban, así que el
 * generador de anagramas daba «ya?» → YAK como jugada de 5 puntos (sospecha anotada al
 * inspeccionar /calculadora-jugada-scrabble/, cuyo motor ya descartaba bien K y W).
 *
 * @param posicionesComodin Se acepta porque el generador de anagramas la pasa, pero no exime
 *   a ninguna letra: dónde caigan las blancas no cambia que la K y la W no se pueden jugar.
 */
export function letrasSinFicha(
  palabra: string,
  posicionesComodin: readonly number[] = [],
): string[] {
  void posicionesComodin;
  const fichas = aFichas(palabra);
  const sinFicha: string[] = [];
  for (let i = 0; i < fichas.length; i++) {
    if (LETRAS_SIN_FICHA.includes(fichas[i]) && !sinFicha.includes(fichas[i])) {
      sinFicha.push(fichas[i]);
    }
  }
  return sinFicha;
}

/**
 * Una ficha de la palabra: su texto (letra o dígrafo) y las posiciones de letra que ocupa.
 *
 * `posiciones` se refiere a la palabra normalizada (una posición por letra), que es como el
 * generador de anagramas cuenta dónde caen las fichas blancas: un dígrafo ocupa DOS.
 */
export interface FichaDePalabra {
  ficha: string;
  posiciones: number[];
}

/**
 * Parte una palabra en las fichas que ocupa en el tablero del Scrabble español.
 *
 * CH, LL y RR son SIEMPRE una ficha: el art. 11 del reglamento de la FISE dice que «no podrán
 * utilizarse dos eres, ni dos eles, ni la ce y la hache para formar una doble letra». Es el
 * mismo corte voraz de izquierda a derecha que `fichasDePalabra(palabra, 'digrafos')` del motor
 * de /calculadora-jugada-scrabble/ (hallazgo 2590), que no tiene ambigüedad con este lemario:
 * ningún lema trae CHH, LLL ni RRR.
 */
export function fichasConDigrafos(palabra: string): FichaDePalabra[] {
  const letras = aFichas(palabra);
  const fichas: FichaDePalabra[] = [];
  let i = 0;
  while (i < letras.length) {
    const par = i + 1 < letras.length ? letras[i] + letras[i + 1] : '';
    if (par !== '' && DIGRAFOS.includes(par)) {
      fichas.push({ ficha: par, posiciones: [i, i + 1] });
      i += 2;
    } else {
      fichas.push({ ficha: letras[i], posiciones: [i] });
      i += 1;
    }
  }
  return fichas;
}

/**
 * Puntúa una palabra con las fichas del Scrabble español, dígrafos incluidos, y con las
 * fichas que cubre una blanca a 0.
 *
 * **Con dígrafos a propósito** (hallazgo 2602, 02/10/2026). Hasta entonces sumaba letra a
 * letra —CARRO = C3+A1+R1+R1+O1 = 7, CHAPA = 12— con el argumento de que un atril tecleado no
 * puede decir si tiene la ficha RR o dos R. Pero no hay dos formas legales: el art. 11 FISE
 * prohíbe formar el dígrafo con dos fichas sueltas, así que ese 7 no era el valor de ninguna
 * jugada de la edición cuyos valores usa la tabla (con la ficha RR, CARRO vale 13). La única
 * lectura que el reglamento admite es la del dígrafo, y es la que se puntúa; qué ficha hace
 * falta para jugarla lo dice `digrafosNecesarios`.
 *
 * Una blanca que cae sobre CUALQUIERA de las dos letras de un dígrafo es esa ficha entera
 * (el comodín sustituye a cualquier ficha, también CH, LL y RR: art. 10), así que el dígrafo
 * vale 0. Es la lectura con la que la palabra se puede jugar: «car?o» forma CARRO poniendo la
 * blanca de RR (C3+A1+0+O1 = 5) y la R suelta se queda en el atril.
 *
 * @param palabra Palabra en cualquier caja; las tildes no cuentan como ficha distinta (Á es
 *   la ficha A), pero la Ñ sí tiene ficha propia y vale 8.
 * @param posicionesComodin Índices (base 0, sobre la palabra ya normalizada, una posición por
 *   letra) que cubre una ficha blanca.
 */
export function puntuarPalabra(palabra: string, posicionesComodin: readonly number[] = []): number {
  const cubiertas = new Set(posicionesComodin);
  let total = 0;
  for (const { ficha, posiciones } of fichasConDigrafos(palabra)) {
    if (posiciones.some((p) => cubiertas.has(p))) continue;
    total += VALORES_FICHA[ficha] ?? 0;
  }
  return total;
}

/**
 * Los dígrafos (CH, LL, RR) que la palabra necesita como FICHA propia del atril, sin repetir y
 * en el orden en que aparecen; los que cubre una blanca no cuentan.
 *
 * Devuelve `[]` cuando la palabra se juega con letras sueltas. Si no está vacío, la palabra
 * solo es jugable teniendo esas fichas: con dos R sueltas no se forma la RR (art. 11 FISE).
 */
export function digrafosNecesarios(
  palabra: string,
  posicionesComodin: readonly number[] = [],
): string[] {
  const cubiertas = new Set(posicionesComodin);
  const necesarios: string[] = [];
  for (const { ficha, posiciones } of fichasConDigrafos(palabra)) {
    if (!DIGRAFOS.includes(ficha)) continue;
    if (posiciones.some((p) => cubiertas.has(p))) continue;
    if (!necesarios.includes(ficha)) necesarios.push(ficha);
  }
  return necesarios;
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
