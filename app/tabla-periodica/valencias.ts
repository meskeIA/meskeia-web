/**
 * Valencias de formulación de secundaria para la tabla periódica (S0256, 07/11/2026).
 *
 * ⚠️ NO hay aquí ni una cifra escrita a mano: todo sale de la tabla del formulador
 * (`app/formulador-compuestos-inorganicos/motor.ts`). Es la que usa el formulador para
 * nombrar y para corregir, y si la tabla periódica llevara su propia lista, el día que una de
 * las dos cambiara un alumno vería en una app «el hierro: +2, +3» y en la otra otra cosa.
 *
 * De dónde sale cada número:
 *  · `positivas` del elemento: con las que forma óxidos, hidróxidos, sales binarias…
 *  · las de `ANIONES_OXO` en que es el átomo CENTRAL y que no estén ya en `positivas`. Son
 *    las del cromo (+6, cromato y dicromato) y el manganeso (+6 y +7, manganato y
 *    permanganato): sin ellas, la casilla del Mn diría «+2, 3» y cualquier tabla escolar la
 *    desmentiría.
 *  · `negativa`, la de los no metales y el hidrógeno.
 *
 * Por qué «valencias» y no «estados de oxidación»: es la palabra con la que se busca y la que
 * usa el aula de formulación. La vista lo dice: son las de secundaria, no la lista completa de
 * la IUPAC, y los libros no coinciden del todo entre sí (el +4 del manganeso en el MnO₂, por
 * ejemplo, no está en esta tabla, y el formulador avisa cuando sale).
 */
import { ANIONES_OXO, ELEMENTOS, MAPA_ELEMENTOS } from '@/app/formulador-compuestos-inorganicos/motor';

export interface ValenciaDeOxoanion {
  valor: number;
  /** Nombres de los aniones en que aparece con ese valor: 'cromato', 'dicromato' */
  aniones: string[];
}

export interface ValenciasElemento {
  /** Positivas con las que forma compuestos binarios, hidróxidos y sales, en orden creciente */
  positivas: number[];
  /** Positivas que solo aparecen como átomo central de un oxoanión (Cr +6, Mn +6 y +7) */
  soloEnOxoaniones: ValenciaDeOxoanion[];
  /** La negativa, si la tiene (no metales e hidrógeno) */
  negativa: number | null;
}

/** Cuántos elementos llevan valencias: los que cubre el formulador. */
export const TOTAL_CON_VALENCIAS = ELEMENTOS.length;

const MENOS = '−'; // U+2212, el signo menos tipográfico

export function valenciasDe(simbolo: string): ValenciasElemento | null {
  const el = MAPA_ELEMENTOS[simbolo];
  if (el === undefined) return null;

  const positivas = [...el.positivas].sort((a, b) => a - b);
  const extra = new Map<number, string[]>();
  for (const anion of ANIONES_OXO) {
    if (anion.central !== simbolo || positivas.includes(anion.valencia)) continue;
    const nombres = extra.get(anion.valencia) ?? [];
    if (!nombres.includes(anion.nombre)) nombres.push(anion.nombre);
    extra.set(anion.valencia, nombres);
  }
  const soloEnOxoaniones = [...extra.entries()]
    .sort(([a], [b]) => a - b)
    .map(([valor, aniones]) => ({ valor, aniones }));

  return { positivas, soloEnOxoaniones, negativa: el.negativa ?? null };
}

/** Todas las positivas juntas, sin distinguir de dónde salen: lo que cabe en una casilla. */
export function positivasTodas(v: ValenciasElemento): number[] {
  return [...v.positivas, ...v.soloEnOxoaniones.map((o) => o.valor)].sort((a, b) => a - b);
}

/** «+2, 3» como en las tablas escolares: el signo una vez, delante de la primera. */
export function textoPositivas(valores: number[]): string {
  return valores.length === 0 ? '' : `+${valores.join(', ')}`;
}

export function textoNegativa(negativa: number | null): string {
  return negativa === null ? '' : `${MENOS}${Math.abs(negativa)}`;
}

/**
 * Las dos líneas de la casilla. Siempre dos cadenas (vacías si no hay), para que la vista
 * monte siempre los mismos nodos y React solo cambie su texto (página traducida, C0243).
 */
export function lineasCasilla(simbolo: string): { positivas: string; negativa: string } {
  const v = valenciasDe(simbolo);
  if (v === null) return { positivas: '', negativa: '' };
  return { positivas: textoPositivas(positivasTodas(v)), negativa: textoNegativa(v.negativa) };
}

export interface FilaFicha {
  rotulo: string;
  valor: string;
}

/**
 * Las filas de la ficha, con el origen de cada número a la vista. Siempre devuelve al menos
 * una fila: un elemento sin valencias lo dice en lugar de dejar el bloque vacío.
 */
export function filasFicha(simbolo: string): FilaFicha[] {
  const v = valenciasDe(simbolo);
  if (v === null) return [{ rotulo: 'Valencias', valor: 'no entra en la formulación de secundaria' }];

  const filas: FilaFicha[] = [];
  if (v.positivas.length > 0) {
    filas.push({ rotulo: v.positivas.length === 1 ? 'Positiva' : 'Positivas', valor: textoPositivas(v.positivas) });
  }
  if (v.soloEnOxoaniones.length > 0) {
    filas.push({
      rotulo: 'Además, en oxoaniones',
      valor: v.soloEnOxoaniones.map((o) => `+${o.valor} (${o.aniones.join(', ')})`).join(' · '),
    });
  }
  if (v.negativa !== null) filas.push({ rotulo: 'Negativa', valor: textoNegativa(v.negativa) });
  // El formulador trata los peróxidos (FORMAN_PEROXIDO), y en ellos el oxígeno va con −1.
  if (simbolo === 'O') filas.push({ rotulo: 'En los peróxidos', valor: `${MENOS}1 (H₂O₂, Na₂O₂)` });
  return filas;
}

/** Lo que oye un lector de pantalla en la casilla: «valencias +1, 3, 5, 7 y −1». */
export function etiquetaValencias(simbolo: string): string {
  const v = valenciasDe(simbolo);
  if (v === null) return 'sin valencias de formulación de secundaria';
  const { positivas, negativa } = lineasCasilla(simbolo);
  const cuantas = positivasTodas(v).length + (v.negativa === null ? 0 : 1);
  const rotulo = cuantas === 1 ? 'valencia' : 'valencias';
  if (positivas === '') return `${rotulo} ${negativa}`;
  if (negativa === '') return `${rotulo} ${positivas}`;
  return `${rotulo} ${positivas} y ${negativa}`;
}
