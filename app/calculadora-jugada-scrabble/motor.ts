/**
 * Motor de cálculo de jugadas para juegos de palabras tipo Scrabble.
 *
 * Alcance deliberadamente acotado: atril + letra gancho + multiplicadores de
 * casilla. NO resuelve el tablero completo (no valida las palabras
 * perpendiculares que se formarían al cruzar), porque eso exige conocer el
 * estado entero de la partida.
 *
 * Todo el cálculo ocurre en el navegador.
 */

/** Ficha del juego: una letra simple, un dígrafo (CH, LL, RR) o el comodín. */
export type Ficha = string;

export const COMODIN = '?';

/** Modo de juego: con dígrafos (Scrabble español clásico) o sin ellos. */
export type Modo = 'digrafos' | 'simple';

/** Valores oficiales del Scrabble en español (edición de 100 fichas). */
export const VALORES: Readonly<Record<string, number>> = {
  A: 1, E: 1, O: 1, I: 1, S: 1, N: 1, R: 1, U: 1, L: 1, T: 1,
  D: 2, G: 2,
  C: 3, B: 3, M: 3, P: 3,
  H: 4, F: 4, V: 4, Y: 4,
  CH: 5, Q: 5,
  J: 8, LL: 8, Ñ: 8, RR: 8, X: 8,
  Z: 10,
};

/** Número de fichas de cada tipo en la bolsa española (100 en total). */
export const DISTRIBUCION: Readonly<Record<string, number>> = {
  A: 12, E: 12, O: 9, I: 6, S: 6, N: 5, R: 5, U: 5, L: 4, T: 4,
  D: 5, G: 2,
  C: 4, B: 2, M: 2, P: 2,
  H: 2, F: 1, V: 1, Y: 1,
  CH: 1, Q: 1,
  J: 1, LL: 1, Ñ: 1, RR: 1, X: 1,
  Z: 1,
  [COMODIN]: 2,
};

/** Dígrafos que en el Scrabble español ocupan una sola casilla del tablero. */
export const DIGRAFOS: readonly string[] = ['CH', 'LL', 'RR'];

/** Letras simples jugables. K y W no tienen ficha en la edición española. */
export const LETRAS_SIMPLES: readonly string[] = [
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'L', 'M',
  'N', 'Ñ', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'X', 'Y', 'Z',
];

/** Tamaño estándar del atril y bonificación por vaciarlo de una vez. */
export const FICHAS_ATRIL = 7;
export const BONUS_ATRIL_COMPLETO = 50;

/** Longitud máxima de palabra que analiza el motor (acota el coste de cálculo). */
const LONGITUD_MAXIMA = 12;

export type MultiplicadorLetra = 1 | 2 | 3;
export type MultiplicadorPalabra = 1 | 2 | 3;

/** 'auto' aplica la bonificación de letra a la ficha más valiosa (mejor caso). */
export type PosicionBonus = number | 'auto';

export interface OpcionesJugada {
  modo: Modo;
  gancho: string;
  multiplicadorLetra: MultiplicadorLetra;
  posicionBonus: PosicionBonus;
  multiplicadorPalabra: MultiplicadorPalabra;
}

export interface Jugada {
  palabra: string;
  puntos: number;
  /** Descomposición en fichas tal y como se colocarían en el tablero. */
  fichas: Ficha[];
  /** Índice (base 0) de la ficha que ocupa la casilla del gancho, o -1. */
  indiceGancho: number;
  /** Índices de las fichas cubiertas por un comodín (puntúan 0). */
  indicesComodin: number[];
  /** Índice de la ficha que recibe la bonificación de letra, o -1. */
  indiceBonus: number;
  /** Fichas del atril consumidas (el gancho no cuenta: ya está en el tablero). */
  fichasUsadas: number;
  atrilCompleto: boolean;
}

const DIACRITICOS = new RegExp('[\\u0300-\\u036f]', 'g');

/**
 * Pasa una palabra del diccionario a fichas: mayúsculas y sin tildes, pero
 * conservando la Ñ (que sí tiene ficha propia y vale 8 puntos).
 */
export function normalizarPalabra(palabra: string): string {
  // NFD descompone la Ñ en N + virgulilla, así que se protege con un marcador
  // antes de limpiar las diacríticas y se restaura después.
  const MARCA = String.fromCharCode(1);
  return palabra
    .toUpperCase()
    .split('Ñ').join(MARCA)
    .normalize('NFD')
    .replace(DIACRITICOS, '')
    .split(MARCA).join('Ñ');
}

/** Multiset de fichas del atril: ficha → cuántas quedan disponibles. */
function contarFichas(atril: Ficha[]): Map<string, number> {
  const cuenta = new Map<string, number>();
  for (const ficha of atril) {
    cuenta.set(ficha, (cuenta.get(ficha) ?? 0) + 1);
  }
  return cuenta;
}

/**
 * Filtro barato previo al backtracking: descarta palabras que no pueden salir
 * del atril ni de lejos. Es condición necesaria, no suficiente.
 */
function esViable(
  palabra: string,
  letrasDisponibles: Set<string>,
  comodines: number,
  maxCasillas: number
): boolean {
  if (palabra.length > maxCasillas * 2) return false;
  let faltantes = 0;
  for (const letra of palabra) {
    if (!letrasDisponibles.has(letra)) {
      faltantes++;
      if (faltantes > comodines) return false;
    }
  }
  return true;
}

interface Colocacion {
  fichas: Ficha[];
  puntosBase: number[];
  indiceGancho: number;
  indicesComodin: number[];
  fichasUsadas: number;
}

/**
 * Explora todas las formas de escribir la palabra con las fichas disponibles.
 * Con dígrafos activos, "CARRO" admite dos lecturas (C-A-RR-O y C-A-R-R-O) y
 * cada una puntúa distinto, así que hay que probarlas todas.
 */
function colocaciones(
  palabra: string,
  disponibles: Map<string, number>,
  comodines: number,
  gancho: string,
  modo: Modo,
  maxCasillas: number
): Colocacion[] {
  const resultados: Colocacion[] = [];
  const fichas: Ficha[] = [];
  const puntosBase: number[] = [];
  const indicesComodin: number[] = [];
  let indiceGancho = -1;
  let fichasUsadas = 0;

  const explorar = (pos: number, comodinesLibres: number): void => {
    if (resultados.length >= 64) return; // corta combinatorias absurdas
    if (pos === palabra.length) {
      resultados.push({
        fichas: [...fichas],
        puntosBase: [...puntosBase],
        indiceGancho,
        indicesComodin: [...indicesComodin],
        fichasUsadas,
      });
      return;
    }
    if (fichas.length >= maxCasillas) return;

    const candidatas: string[] = [palabra[pos]];
    if (modo === 'digrafos' && pos + 1 < palabra.length) {
      const par = palabra.slice(pos, pos + 2);
      if (DIGRAFOS.includes(par)) candidatas.push(par);
    }

    for (const ficha of candidatas) {
      const avance = ficha.length;

      // Opción 1: la casilla la ocupa la ficha que ya estaba en el tablero.
      if (indiceGancho === -1 && gancho !== '' && ficha === gancho) {
        indiceGancho = fichas.length;
        fichas.push(ficha);
        puntosBase.push(VALORES[ficha] ?? 0);
        explorar(pos + avance, comodinesLibres);
        fichas.pop();
        puntosBase.pop();
        indiceGancho = -1;
      }

      // Opción 2: se coloca una ficha del atril.
      const quedan = disponibles.get(ficha) ?? 0;
      if (quedan > 0) {
        disponibles.set(ficha, quedan - 1);
        fichas.push(ficha);
        puntosBase.push(VALORES[ficha] ?? 0);
        fichasUsadas++;
        explorar(pos + avance, comodinesLibres);
        fichasUsadas--;
        fichas.pop();
        puntosBase.pop();
        disponibles.set(ficha, quedan);
      }

      // Opción 3: se cubre con un comodín, que no suma puntos.
      if (comodinesLibres > 0) {
        indicesComodin.push(fichas.length);
        fichas.push(ficha);
        puntosBase.push(0);
        fichasUsadas++;
        explorar(pos + avance, comodinesLibres - 1);
        fichasUsadas--;
        fichas.pop();
        puntosBase.pop();
        indicesComodin.pop();
      }
    }
  };

  explorar(0, comodines);
  return resultados;
}

/**
 * Puntúa una colocación concreta. Los multiplicadores de casilla solo cuentan
 * para las fichas que se colocan ahora: la del gancho ya estaba en el tablero.
 */
function puntuar(colocacion: Colocacion, opciones: OpcionesJugada): Jugada | null {
  const { multiplicadorLetra, posicionBonus, multiplicadorPalabra } = opciones;
  const { fichas, puntosBase, indiceGancho, indicesComodin, fichasUsadas } = colocacion;

  if (fichasUsadas === 0) return null; // hay que colocar al menos una ficha propia

  let indiceBonus = -1;
  if (multiplicadorLetra > 1) {
    if (posicionBonus === 'auto') {
      let mejor = -1;
      for (let i = 0; i < fichas.length; i++) {
        if (i === indiceGancho) continue;
        if (mejor === -1 || puntosBase[i] > puntosBase[mejor]) mejor = i;
      }
      indiceBonus = mejor;
    } else {
      const idx = posicionBonus - 1;
      // Fuera de la palabra o sobre la ficha del gancho: la bonificación se pierde.
      if (idx >= 0 && idx < fichas.length && idx !== indiceGancho) indiceBonus = idx;
    }
  }

  let total = 0;
  for (let i = 0; i < fichas.length; i++) {
    total += puntosBase[i] * (i === indiceBonus ? multiplicadorLetra : 1);
  }
  total *= multiplicadorPalabra;

  // El bonus exige colocar las 7 fichas en una sola jugada: vaciar un atril
  // incompleto (final de partida) no lo otorga.
  const atrilCompleto = fichasUsadas >= FICHAS_ATRIL;
  if (atrilCompleto) total += BONUS_ATRIL_COMPLETO;

  return {
    palabra: '',
    puntos: total,
    fichas,
    indiceGancho,
    indicesComodin,
    indiceBonus,
    fichasUsadas,
    atrilCompleto,
  };
}

/**
 * Devuelve las mejores jugadas posibles ordenadas por puntuación.
 *
 * @param diccionario Lemario completo, tal cual se descarga.
 * @param atril Fichas de la mano (usar '?' para el comodín).
 * @param opciones Gancho, modo y multiplicadores de la casilla.
 * @param limite Cuántas jugadas devolver.
 */
export function buscarJugadas(
  diccionario: readonly string[],
  atril: Ficha[],
  opciones: OpcionesJugada,
  limite = 50
): Jugada[] {
  if (atril.length === 0) return [];

  const comodines = atril.filter((f) => f === COMODIN).length;
  const fichasReales = atril.filter((f) => f !== COMODIN);
  const disponibles = contarFichas(fichasReales);
  const gancho = opciones.gancho;

  // Letras que el atril puede aportar (los dígrafos aportan sus dos letras).
  const letrasDisponibles = new Set<string>();
  for (const ficha of fichasReales) {
    for (const letra of ficha) letrasDisponibles.add(letra);
  }
  if (gancho !== '') {
    for (const letra of gancho) letrasDisponibles.add(letra);
  }

  const maxCasillas = atril.length + (gancho !== '' ? 1 : 0);
  const jugadas: Jugada[] = [];

  for (const entrada of diccionario) {
    const palabra = normalizarPalabra(entrada);
    if (palabra.length < 2 || palabra.length > LONGITUD_MAXIMA) continue;
    if (!/^[A-ZÑ]+$/.test(palabra)) continue; // fuera guiones, apóstrofes, K y W
    if (/[KW]/.test(palabra)) continue; // sin ficha en la edición española
    if (!esViable(palabra, letrasDisponibles, comodines, maxCasillas)) continue;

    const opcionesColocacion = colocaciones(
      palabra,
      disponibles,
      comodines,
      gancho,
      opciones.modo,
      maxCasillas
    );
    if (opcionesColocacion.length === 0) continue;

    let mejor: Jugada | null = null;
    for (const colocacion of opcionesColocacion) {
      // Si se pide gancho, la palabra tiene que apoyarse en él.
      if (gancho !== '' && colocacion.indiceGancho === -1) continue;
      const jugada = puntuar(colocacion, opciones);
      if (jugada && (mejor === null || jugada.puntos > mejor.puntos)) mejor = jugada;
    }

    if (mejor !== null) {
      mejor.palabra = palabra;
      jugadas.push(mejor);
    }
  }

  jugadas.sort((a, b) => {
    if (b.puntos !== a.puntos) return b.puntos - a.puntos;
    if (b.fichas.length !== a.fichas.length) return b.fichas.length - a.fichas.length;
    return a.palabra.localeCompare(b.palabra, 'es');
  });

  return jugadas.slice(0, limite);
}
