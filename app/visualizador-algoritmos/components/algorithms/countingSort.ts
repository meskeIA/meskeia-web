import { AlgorithmStep } from '../types';

/**
 * Counting Sort: no compara elementos entre sí, cuenta cuántas veces aparece
 * cada valor y reconstruye el array a partir de ese recuento. Por eso baja de
 * O(n log n) —el límite de los algoritmos por comparación— a O(n + k), donde k
 * es el rango de valores. A cambio solo sirve para enteros de rango acotado.
 *
 * Se anima la variante para enteros: recorrido del recuento en orden ascendente
 * y escritura directa. Con registros (clave + datos) se usa la suma acumulada y
 * un recorrido inverso, que es lo que preserva la estabilidad.
 */
export function generateCountingSortSteps(initialArray: number[]): AlgorithmStep[] {
  const steps: AlgorithmStep[] = [];
  const arr = [...initialArray];
  const n = arr.length;
  if (n === 0) return steps;

  const maximo = Math.max(...arr);
  const recuento = new Array<number>(maximo + 1).fill(0);

  // Fase 1: contar cuántas veces aparece cada valor
  for (let i = 0; i < n; i++) {
    recuento[arr[i]]++;
    // Se marca como 'pivot' y no como 'compare' a propósito: contar no es
    // comparar, y el contador de comparaciones debe quedarse a cero — es
    // justo lo que distingue a este algoritmo de los otros seis.
    steps.push({
      type: 'pivot',
      indices: [i],
      line: 4,
      description: `Cuenta del valor ${arr[i]}: ahora aparece ${recuento[arr[i]]} ${recuento[arr[i]] === 1 ? 'vez' : 'veces'}`,
    });
  }

  // Fase 2: recorrer el recuento en orden y reescribir el array
  let posicion = 0;
  for (let valor = 0; valor <= maximo; valor++) {
    for (let repeticion = 0; repeticion < recuento[valor]; repeticion++) {
      steps.push({
        type: 'set',
        indices: [posicion],
        values: [valor],
        line: 8,
        description: `Escribiendo ${valor} en la posición ${posicion} (sin comparar con ningún otro elemento)`,
      });
      steps.push({
        type: 'sorted',
        indices: [posicion],
        line: 9,
        description: `Posición ${posicion} cerrada`,
      });
      posicion++;
    }
  }

  return steps;
}
