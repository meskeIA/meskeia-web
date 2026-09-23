import { AlgorithmStep } from '../types';

/**
 * Bubble Sort CON bandera de salida temprana: si una pasada entera no intercambia nada, el
 * array ya está ordenado y se para. Es lo que hace cierto el «Mejor O(n)» del panel (hallazgo
 * 1296): sobre un array ya ordenado, una sola pasada de n−1 comparaciones. Los números de
 * `line` son índices de `ALGORITHMS_INFO.bubble.pseudocode`.
 */
export function generateBubbleSortSteps(initialArray: number[]): AlgorithmStep[] {
  const steps: AlgorithmStep[] = [];
  const arr = [...initialArray];
  const n = arr.length;

  for (let i = 0; i < n - 1; i++) {
    let intercambiado = false;

    for (let j = 0; j < n - i - 1; j++) {
      // Paso: comparar
      steps.push({
        type: 'compare',
        indices: [j, j + 1],
        line: 4,
        description: `Comparando ${arr[j]} con ${arr[j + 1]}`,
      });

      if (arr[j] > arr[j + 1]) {
        // Paso: intercambiar
        steps.push({
          type: 'swap',
          indices: [j, j + 1],
          line: 5,
          description: `${arr[j]} > ${arr[j + 1]}, intercambiando posiciones`,
        });

        // Realizar swap en copia local
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        intercambiado = true;
      }
    }

    // Marcar elemento como ordenado
    steps.push({
      type: 'sorted',
      indices: [n - i - 1],
      line: 8,
      description: `Elemento ${arr[n - i - 1]} en posición ${n - i - 1} está ordenado`,
    });

    if (!intercambiado) {
      // Una pasada sin intercambios: lo que queda ya está en orden
      const restantes = Array.from({ length: n - i - 1 }, (_, k) => k);
      if (restantes.length > 0) {
        steps.push({
          type: 'sorted',
          indices: restantes,
          line: 9,
          description: 'Ninguna pareja intercambiada en esta pasada: el resto ya está ordenado',
        });
      }
      return steps;
    }
  }

  // Último elemento siempre ordenado
  steps.push({
    type: 'sorted',
    indices: [0],
    line: 10,
    description: '¡Array completamente ordenado!',
  });

  return steps;
}
