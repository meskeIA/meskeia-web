/**
 * Motor de cálculo de jugadas para juegos de palabras tipo Scrabble.
 *
 * Alcance deliberadamente acotado: atril + letra gancho + multiplicadores de
 * casilla. NO resuelve el tablero completo (no valida las palabras
 * perpendiculares que se formarían al cruzar), porque eso exige conocer el
 * estado entero de la partida.
 *
 * Reglas que aplica, del reglamento de la FISE (Federación Internacional de
 * Scrabble en Español):
 *   · art. 10   el comodín vale 0 y sustituye a cualquier ficha (CH, LL y RR
 *               incluidas, que son una sola ficha) salvo la K y la W (art. 10.2)
 *   · art. 11   CH, LL y RR NO se forman con dos fichas sueltas (C+H, L+L, R+R)
 *   · art. 14   primero las casillas de letra y después las de palabra
 *   · art. 15   dos casillas de doble palabra multiplican ×4; dos de triple, ×9
 *   · art. 19   los 50 puntos por colocar las siete fichas se suman al final
 *
 * Todo el cálculo ocurre en el navegador.
 */

import { VALORES_FICHA, DIGRAFOS as DIGRAFOS_FICHA } from '@/lib/calculadoras/puntuacionScrabble';

/** Ficha del juego: una letra simple, un dígrafo (CH, LL, RR) o el comodín. */
export type Ficha = string;

export const COMODIN = '?';

/** Modo de juego: con dígrafos (Scrabble español clásico) o sin ellos. */
export type Modo = 'digrafos' | 'simple';

/**
 * Valores oficiales del Scrabble en español (edición de 100 fichas).
 *
 * La tabla vive en `lib/calculadoras/puntuacionScrabble.ts` desde que el
 * generador de anagramas también puntúa: una sola copia, para que corregir un
 * valor no deje la otra app diciendo otra cosa.
 */
export const VALORES = VALORES_FICHA;

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
export const DIGRAFOS = DIGRAFOS_FICHA;

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

export type MultiplicadorLetra = 2 | 3;

/**
 * Multiplicador de palabra de la jugada. ×4 y ×9 son los del art. 15 FISE: la
 * palabra pisa DOS casillas de doble palabra (2×2) o dos de triple (3×3).
 */
export type MultiplicadorPalabra = 1 | 2 | 3 | 4 | 9;

/** 'auto' aplica la bonificación de letra a la ficha más valiosa (mejor caso). */
export type PosicionBonus = number | 'auto';

/** Una casilla de doble o triple letra que pisa la palabra. */
export interface CasillaLetra {
  multiplicador: MultiplicadorLetra;
  posicion: PosicionBonus;
}

export interface OpcionesJugada {
  modo: Modo;
  gancho: string;
  /** Casillas de letra que pisa la palabra (ninguna, una o varias). */
  casillasLetra: CasillaLetra[];
  multiplicadorPalabra: MultiplicadorPalabra;
}

/** Bonificación de letra que ha caído sobre una ficha concreta de la jugada. */
export interface BonoAplicado {
  indice: number;
  multiplicador: MultiplicadorLetra;
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
  /** Casillas de letra que han caído sobre una ficha colocada en este turno. */
  bonos: BonoAplicado[];
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

/**
 * Parte una palabra normalizada en las fichas que ocupa en el tablero.
 *
 * Con dígrafos, CH, LL y RR son SIEMPRE una ficha: el art. 11 FISE prohíbe
 * formarlas con dos fichas sueltas («no podrán utilizarse dos eres, ni dos eles,
 * ni la ce y la hache para formar una doble letra»), así que CARRO solo tiene
 * una lectura, C-A-RR-O, y sin la ficha RR (o un comodín haciendo de RR) no se
 * puede jugar. Hasta el 01/10/2026 el motor probaba también C-A-R-R-O y
 * proponía jugadas ilegales (hallazgo 2590). El corte voraz de izquierda a
 * derecha no tiene ambigüedad con este lemario: ningún lema trae CHH, LLL ni RRR.
 */
export function fichasDePalabra(palabra: string, modo: Modo): Ficha[] {
  if (modo === 'simple') return Array.from(palabra);
  const fichas: Ficha[] = [];
  let i = 0;
  while (i < palabra.length) {
    const par = palabra.slice(i, i + 2);
    if (par.length === 2 && DIGRAFOS.includes(par)) {
      fichas.push(par);
      i += 2;
    } else {
      fichas.push(palabra[i]);
      i += 1;
    }
  }
  return fichas;
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
 * Filtro barato previo al backtracking: ¿alcanzan las fichas del atril, el
 * gancho y los comodines para cubrir las fichas de la palabra?
 *
 * Cuenta FICHAS, no letras. Antes contaba letras, y la CH pedía dos (C y H)
 * cuando un solo comodín la cubre entera: CHUSQUEL, TORRENTE o CHAQUETA con un
 * comodín por dígrafo se descartaban sin probarse (hallazgo 2591).
 */
function esViable(
  fichas: readonly Ficha[],
  disponibles: ReadonlyMap<string, number>,
  comodines: number,
  gancho: string,
  maxCasillas: number
): boolean {
  if (fichas.length > maxCasillas) return false;
  const usadas = new Map<string, number>();
  let ganchoLibre = gancho !== '';
  let faltan = 0;
  for (const ficha of fichas) {
    const n = usadas.get(ficha) ?? 0;
    if (n < (disponibles.get(ficha) ?? 0)) {
      usadas.set(ficha, n + 1);
    } else if (ganchoLibre && ficha === gancho) {
      ganchoLibre = false;
    } else {
      faltan++;
      if (faltan > comodines) return false;
    }
  }
  return true;
}

interface Colocacion {
  puntosBase: number[];
  indiceGancho: number;
  indicesComodin: number[];
  fichasUsadas: number;
}

/**
 * Explora todas las formas de cubrir las fichas de la palabra: cada una puede
 * salir del atril, ser la del gancho o ir con un comodín. Puntúan distinto (el
 * comodín vale 0 y el gancho no recibe bonificación), así que hay que probarlas.
 */
function colocaciones(
  fichas: readonly Ficha[],
  disponibles: Map<string, number>,
  comodines: number,
  gancho: string
): Colocacion[] {
  const resultados: Colocacion[] = [];
  const puntosBase: number[] = [];
  const indicesComodin: number[] = [];
  let indiceGancho = -1;
  let fichasUsadas = 0;

  const explorar = (pos: number, comodinesLibres: number): void => {
    if (resultados.length >= 64) return; // corta combinatorias absurdas
    if (pos === fichas.length) {
      resultados.push({
        puntosBase: [...puntosBase],
        indiceGancho,
        indicesComodin: [...indicesComodin],
        fichasUsadas,
      });
      return;
    }
    const ficha = fichas[pos];

    // Opción 1: la casilla la ocupa la ficha que ya estaba en el tablero.
    if (indiceGancho === -1 && gancho !== '' && ficha === gancho) {
      indiceGancho = pos;
      puntosBase.push(VALORES[ficha] ?? 0);
      explorar(pos + 1, comodinesLibres);
      puntosBase.pop();
      indiceGancho = -1;
    }

    // Opción 2: se coloca una ficha del atril.
    const quedan = disponibles.get(ficha) ?? 0;
    if (quedan > 0) {
      disponibles.set(ficha, quedan - 1);
      puntosBase.push(VALORES[ficha] ?? 0);
      fichasUsadas++;
      explorar(pos + 1, comodinesLibres);
      fichasUsadas--;
      puntosBase.pop();
      disponibles.set(ficha, quedan);
    }

    // Opción 3: se cubre con un comodín, que no suma puntos. Un comodín cubre la
    // ficha ENTERA, también un dígrafo (art. 10 FISE).
    if (comodinesLibres > 0) {
      indicesComodin.push(pos);
      puntosBase.push(0);
      fichasUsadas++;
      explorar(pos + 1, comodinesLibres - 1);
      fichasUsadas--;
      puntosBase.pop();
      indicesComodin.pop();
    }
  };

  explorar(0, comodines);
  return resultados;
}

/**
 * Reparte las casillas de letra entre las fichas de la jugada.
 *
 * Primero las de posición fija (fuera de la palabra, sobre el gancho o sobre una
 * ficha que ya tiene otra casilla: se pierden). Después las «auto», de mayor a
 * menor multiplicador, cada una sobre la ficha libre más valiosa: dar el
 * multiplicador mayor a la ficha mayor es el reparto que más suma. En empate de
 * valor gana la primera ficha.
 */
function repartirBonos(
  puntosBase: readonly number[],
  indiceGancho: number,
  casillas: readonly CasillaLetra[]
): BonoAplicado[] {
  const ocupadas = new Set<number>();
  const bonos: BonoAplicado[] = [];

  for (const casilla of casillas) {
    if (casilla.posicion === 'auto') continue;
    const idx = casilla.posicion - 1;
    if (idx < 0 || idx >= puntosBase.length || idx === indiceGancho || ocupadas.has(idx)) continue;
    ocupadas.add(idx);
    bonos.push({ indice: idx, multiplicador: casilla.multiplicador });
  }

  const autos = casillas
    .filter((c) => c.posicion === 'auto')
    .sort((a, b) => b.multiplicador - a.multiplicador);
  for (const casilla of autos) {
    let mejor = -1;
    for (let i = 0; i < puntosBase.length; i++) {
      if (i === indiceGancho || ocupadas.has(i)) continue;
      if (mejor === -1 || puntosBase[i] > puntosBase[mejor]) mejor = i;
    }
    if (mejor === -1) continue;
    ocupadas.add(mejor);
    bonos.push({ indice: mejor, multiplicador: casilla.multiplicador });
  }

  return bonos.sort((a, b) => a.indice - b.indice);
}

/**
 * Puntúa una colocación concreta. Los multiplicadores de casilla solo cuentan
 * para las fichas que se colocan ahora: la del gancho ya estaba en el tablero.
 */
function puntuar(
  fichas: Ficha[],
  colocacion: Colocacion,
  opciones: OpcionesJugada
): Jugada | null {
  const { casillasLetra, multiplicadorPalabra } = opciones;
  const { puntosBase, indiceGancho, indicesComodin, fichasUsadas } = colocacion;

  if (fichasUsadas === 0) return null; // hay que colocar al menos una ficha propia

  const bonos = repartirBonos(puntosBase, indiceGancho, casillasLetra);
  const multiplicadorDe = new Map(bonos.map((b) => [b.indice, b.multiplicador]));

  let total = 0;
  for (let i = 0; i < puntosBase.length; i++) {
    total += puntosBase[i] * (multiplicadorDe.get(i) ?? 1);
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
    bonos,
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

  const maxCasillas = atril.length + (gancho !== '' ? 1 : 0);
  const jugadas: Jugada[] = [];
  // El lemario trae variantes que solo se distinguen por la tilde (papa/papá,
  // capa/capá): en fichas son la MISMA jugada y se listaban dos veces, con la
  // misma key de React y una nota de empate falsa (hallazgo 2595).
  const vistas = new Set<string>();

  for (const entrada of diccionario) {
    const palabra = normalizarPalabra(entrada);
    if (palabra.length < 2 || palabra.length > LONGITUD_MAXIMA) continue;
    if (!/^[A-ZÑ]+$/.test(palabra)) continue; // fuera guiones, apóstrofes, K y W
    // Sin ficha en la edición española, y el comodín tampoco puede ser K ni W (art. 10.2).
    if (/[KW]/.test(palabra)) continue;
    if (vistas.has(palabra)) continue;

    const fichas = fichasDePalabra(palabra, opciones.modo);
    if (!esViable(fichas, disponibles, comodines, gancho, maxCasillas)) continue;

    const opcionesColocacion = colocaciones(fichas, disponibles, comodines, gancho);
    if (opcionesColocacion.length === 0) continue;

    let mejor: Jugada | null = null;
    for (const colocacion of opcionesColocacion) {
      // Si se pide gancho, la palabra tiene que apoyarse en él.
      if (gancho !== '' && colocacion.indiceGancho === -1) continue;
      const jugada = puntuar(fichas, colocacion, opciones);
      if (jugada && (mejor === null || jugada.puntos > mejor.puntos)) mejor = jugada;
    }

    if (mejor !== null) {
      mejor.palabra = palabra;
      vistas.add(palabra);
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
