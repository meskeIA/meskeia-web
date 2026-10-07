/**
 * Corrección de los ejercicios guiados: compara el RESULTADO de la consulta del alumno con el de
 * la solución, ejecutada sobre la misma base. Sin dependencias, para poder probarla aparte.
 *
 * Antes solo se comprobaba que cada nombre de columna esperado apareciera (por subcadena) en algún
 * nombre del resultado, y el número de filas en 2 de 15 ejercicios: «SELECT * FROM productos WHERE
 * precio < 100» resolvía «más de 100 €», y «COUNT(*) AS total» no resolvía «Contar» (hallazgos
 * 2993 y 2994, 07/10/2026). Ahora mandan los DATOS, no los nombres:
 *   - mismas filas y mismas columnas (en número);
 *   - las columnas pueden venir en otro orden y con cualquier alias;
 *   - el orden de las filas solo cuenta si la solución lleva ORDER BY.
 */

export interface ConjuntoResultado {
  columns: string[];
  values: unknown[][];
}

export interface Veredicto {
  correcto: boolean;
  /** Por qué no, en una frase para el alumno; vacío si es correcto. */
  motivo: string;
}

/** Normaliza un valor para comparar: los reales, a 9 cifras significativas (AVG, divisiones). */
function clave(v: unknown): string {
  if (v === null || v === undefined) return 'NULL';
  if (typeof v === 'number') return Number.isInteger(v) ? `n:${v}` : `n:${Number(v.toPrecision(9))}`;
  return `s:${String(v)}`;
}

function multiconjunto(valores: string[]): string {
  return [...valores].sort().join('\u0001');
}

/** Todas las asignaciones columna esperada → columna del alumno con el mismo multiconjunto de valores. */
function asignaciones(esperado: string[][], obtenido: string[][]): number[][] {
  const firmasObt = obtenido.map(multiconjunto);
  const candidatas = esperado.map((col) => {
    const firma = multiconjunto(col);
    return firmasObt.map((f, j) => (f === firma ? j : -1)).filter((j) => j >= 0);
  });
  const salida: number[][] = [];
  const usadas = new Set<number>();
  const actual: number[] = [];
  const recorrer = (i: number): void => {
    if (salida.length >= 50) return; // con ≤ 6 columnas no se llega; es un tope de seguridad
    if (i === candidatas.length) {
      salida.push([...actual]);
      return;
    }
    for (const j of candidatas[i]) {
      if (usadas.has(j)) continue;
      usadas.add(j);
      actual.push(j);
      recorrer(i + 1);
      actual.pop();
      usadas.delete(j);
    }
  };
  recorrer(0);
  return salida;
}

export function importaElOrden(consultaSolucion: string): boolean {
  return /\bORDER\s+BY\b/i.test(consultaSolucion);
}

export function corregir(
  esperado: ConjuntoResultado,
  obtenido: ConjuntoResultado,
  conOrden: boolean,
): Veredicto {
  const filasE = esperado.values.length;
  const filasO = obtenido.values.length;
  const colsE = esperado.columns.length;
  const colsO = obtenido.columns.length;

  if (colsO !== colsE) {
    return {
      correcto: false,
      motivo: `Todavía no: tu consulta devuelve ${colsO} ${colsO === 1 ? 'columna' : 'columnas'} y la solución, ${colsE}.`,
    };
  }
  if (filasO !== filasE) {
    return {
      correcto: false,
      motivo: `Todavía no: tu consulta devuelve ${filasO} ${filasO === 1 ? 'fila' : 'filas'} y la solución, ${filasE}.`,
    };
  }

  const columnasE = Array.from({ length: colsE }, (_, c) => esperado.values.map((f) => clave(f[c])));
  const columnasO = Array.from({ length: colsO }, (_, c) => obtenido.values.map((f) => clave(f[c])));

  for (const mapa of asignaciones(columnasE, columnasO)) {
    const filasEsperadas = esperado.values.map((_, r) => columnasE.map((col) => col[r]).join('\u0002'));
    const filasObtenidas = obtenido.values.map((_, r) => mapa.map((j) => columnasO[j][r]).join('\u0002'));
    const iguales = conOrden
      ? filasEsperadas.every((f, r) => f === filasObtenidas[r])
      : multiconjunto(filasEsperadas) === multiconjunto(filasObtenidas);
    if (iguales) return { correcto: true, motivo: '' };
  }

  return {
    correcto: false,
    motivo: conOrden
      ? 'Todavía no: el número de filas y columnas cuadra, pero los valores o su orden no coinciden con los de la solución.'
      : 'Todavía no: el número de filas y columnas cuadra, pero los valores no coinciden con los de la solución.',
  };
}
