import { AlgorithmStep } from '../types';

export function generateSelectionSortSteps(initialArray: number[]): AlgorithmStep[] {
  const steps: AlgorithmStep[] = [];
  const arr = [...initialArray];
  const n = arr.length;

  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;

    // Marcar el mínimo actual
    steps.push({
      type: 'pivot',
      indices: [minIdx],
      line: 2,
      description: `Buscando el mínimo desde posición ${i}. Mínimo actual: ${arr[minIdx]}`,
    });

    for (let j = i + 1; j < n; j++) {
      // Comparar con el mínimo actual
      steps.push({
        type: 'compare',
        indices: [j, minIdx],
        line: 4,
        description: `Comparando ${arr[j]} con el mínimo actual ${arr[minIdx]}`,
      });

      if (arr[j] < arr[minIdx]) {
        minIdx = j;
        // Nuevo mínimo encontrado
        steps.push({
          type: 'pivot',
          indices: [minIdx],
          line: 5,
          description: `Nuevo mínimo encontrado: ${arr[minIdx]} en posición ${minIdx}`,
        });
      }
    }

    // Intercambiar si el mínimo no está en su posición
    if (minIdx !== i) {
      steps.push({
        type: 'swap',
        indices: [i, minIdx],
        line: 8,
        description: `Intercambiando ${arr[i]} con el mínimo ${arr[minIdx]}`,
      });

      [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
    }

    // Marcar como ordenado
    steps.push({
      type: 'sorted',
      indices: [i],
      line: 9,
      description: `Elemento ${arr[i]} colocado en posición ${i}`,
    });
  }

  // Último elemento siempre ordenado
  steps.push({
    type: 'sorted',
    indices: [n - 1],
    line: 10,
    description: '¡Array completamente ordenado!',
  });

  return steps;
}
