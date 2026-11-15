/**
 * Deletreo de las notas de una escala (hallazgos 4806 y 4808, 15/11/2026).
 *
 * Antes la app nombraba cada nota por su clase de altura con una tabla de sostenidos fija, así
 * que Fa mayor salía con La# en vez de Si♭ y Fa# mayor con Fa en vez de Mi#: la letra se repetía
 * en 59 de las 108 combinaciones de raíz y escala de siete notas. Ahora cada nota recibe una
 * LETRA por su grado (tónica + grado − 1) y la alteración es lo que falte para llegar a su altura.
 *
 * - Escalas de siete notas: una letra por nota, de la tónica en adelante.
 * - Pentatónicas y blues: la letra del grado que ocupa cada nota respecto a la escala mayor
 *   (pentatónica menor 1 ♭3 4 5 ♭7, blues 1 ♭3 4 ♭5 5 ♭7), así que el blues de La lleva Mi♭.
 * - Tónica en tecla negra: se escribe con sostenido o con bemol. Por defecto, la grafía con menos
 *   alteraciones en esa escala (Si♭ mayor y no La# mayor); con empate, el sostenido.
 */

export type Enarmonia = 'sostenido' | 'bemol';

export interface NotaDeletreada {
  /** Nombre en notación inglesa: «B♭», «E#». */
  nombre: string;
  /** Nombre en solfeo: «Si♭», «Mi#». */
  nombreEs: string;
  /** Clase de altura, 0 = Do. */
  pc: number;
  /** Alteración en semitonos: −2 doble bemol … +2 doble sostenido. */
  alteracion: number;
}

const LETRAS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const SILABAS = ['Do', 'Re', 'Mi', 'Fa', 'Sol', 'La', 'Si'];
/** Altura de cada letra natural, que es también la escala mayor grado a grado. */
const PC_LETRA = [0, 2, 4, 5, 7, 9, 11];
const ROMANOS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];

const SIGNO: Record<number, string> = { [-2]: '♭♭', [-1]: '♭', 0: '', 1: '#', 2: '##' };

/** Grado (0-6) de cada nota de la escala: en las de siete notas, su posición. */
export function letrasDeEscala(intervalos: number[], letras?: number[]): number[] {
  return letras ?? intervalos.map((_, i) => i);
}

export function esTeclaNegra(pc: number): boolean {
  return !PC_LETRA.includes(pc);
}

/** Letra (0-6) de la tónica: la natural si la hay; en tecla negra, la de abajo (#) o la de arriba (♭). */
export function letraDeTonica(pc: number, enarmonia: Enarmonia): number {
  const natural = PC_LETRA.indexOf(pc);
  if (natural >= 0) return natural;
  return enarmonia === 'sostenido' ? PC_LETRA.indexOf(pc - 1) : PC_LETRA.indexOf((pc + 1) % 12);
}

export function deletrearNota(letra: number, pc: number): NotaDeletreada {
  let alteracion = (((pc - PC_LETRA[letra]) % 12) + 12) % 12;
  if (alteracion > 6) alteracion -= 12;
  const signo = SIGNO[alteracion] ?? '';
  return { nombre: `${LETRAS[letra]}${signo}`, nombreEs: `${SILABAS[letra]}${signo}`, pc, alteracion };
}

export function deletrearEscala(
  tonica: number,
  intervalos: number[],
  letras: number[],
  enarmonia: Enarmonia,
): NotaDeletreada[] {
  const letraTonica = letraDeTonica(tonica, enarmonia);
  return intervalos.map((intervalo, i) => deletrearNota((letraTonica + letras[i]) % 7, (tonica + intervalo) % 12));
}

function alteracionesTotales(notas: NotaDeletreada[]): number {
  return notas.reduce((total, n) => total + Math.abs(n.alteracion), 0);
}

/** Grafía de la tónica con menos alteraciones en esta escala; con empate, el sostenido. */
export function enarmoniaPreferida(tonica: number, intervalos: number[], letras: number[]): Enarmonia {
  if (!esTeclaNegra(tonica)) return 'sostenido';
  const conSostenido = alteracionesTotales(deletrearEscala(tonica, intervalos, letras, 'sostenido'));
  const conBemol = alteracionesTotales(deletrearEscala(tonica, intervalos, letras, 'bemol'));
  return conBemol < conSostenido ? 'bemol' : 'sostenido';
}

/**
 * Nombre del grado. En las escalas de siete notas, el romano de su posición (I-VII, el de los
 * acordes diatónicos). En las de cinco y seis, el intervalo respecto a la escala mayor: el Do de
 * La pentatónica menor es la ♭3 y no «II».
 */
export function nombreGrado(intervalo: number, letra: number, numNotas: number): string {
  if (numNotas === 7) return ROMANOS[letra];
  const diferencia = intervalo - PC_LETRA[letra];
  const prefijo = diferencia < 0 ? '♭'.repeat(-diferencia) : '#'.repeat(diferencia);
  return `${prefijo}${letra + 1}`;
}
