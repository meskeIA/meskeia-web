import { AlgorithmStep } from '../types';

export function generateBubbleSortSteps(initialArray: number[]): AlgorithmStep[] {
  const steps: AlgorithmStep[] = [];
  const arr = [...initialArray];
  const n = arr.length;

  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      // Paso: comparar
      steps.push({
        type: 'compare',
        indices: [j, j + 1],
        line: 3,
        description: `Comparando ${arr[j]} con ${arr[j + 1]}`,
      });

      if (arr[j] > arr[j + 1]) {
        // Paso: intercambiar
        steps.push({
          type: 'swap',
          indices: [j, j + 1],
          line: 4,
          description: `${arr[j]} > ${arr[j + 1]}, intercambiando posiciones`,
        });

        // Realizar swap en copia local
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
      }
    }

    // Marcar elemento como ordenado
    steps.push({
      type: 'sorted',
      indices: [n - i - 1],
      line: 6,
      description: `Elemento ${arr[n - i - 1]} en posición ${n - i - 1} está ordenado`,
    });
  }

  // Último elemento siempre ordenado
  steps.push({
    type: 'sorted',
    indices: [0],
    line: 7,
    description: '¡Array completamente ordenado!',
  });

  return steps;
}
