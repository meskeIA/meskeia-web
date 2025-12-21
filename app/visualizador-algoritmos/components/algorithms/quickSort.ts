import { AlgorithmStep } from '../types';

export function generateQuickSortSteps(initialArray: number[]): AlgorithmStep[] {
  const steps: AlgorithmStep[] = [];
  const arr = [...initialArray];

  function quickSort(low: number, high: number): void {
    if (low < high) {
      const pivotIndex = partition(low, high);
      quickSort(low, pivotIndex - 1);
      quickSort(pivotIndex + 1, high);
    } else if (low === high) {
      // Un solo elemento está ordenado
      steps.push({
        type: 'sorted',
        indices: [low],
        line: 1,
        description: `Elemento ${arr[low]} en posición ${low} está ordenado`,
      });
    }
  }

  function partition(low: number, high: number): number {
    const pivot = arr[high];

    // Marcar el pivote
    steps.push({
      type: 'pivot',
      indices: [high],
      line: 9,
      description: `Pivote seleccionado: ${pivot} (posición ${high})`,
    });

    let i = low - 1;

    for (let j = low; j < high; j++) {
      // Comparar con pivote
      steps.push({
        type: 'compare',
        indices: [j, high],
        line: 11,
        description: `Comparando ${arr[j]} con pivote ${pivot}`,
      });

      if (arr[j] <= pivot) {
        i++;

        if (i !== j) {
          // Intercambiar
          steps.push({
            type: 'swap',
            indices: [i, j],
            line: 13,
            description: `${arr[j]} <= ${pivot}, intercambiando posiciones ${i} y ${j}`,
          });

          [arr[i], arr[j]] = [arr[j], arr[i]];
        }
      }
    }

    // Colocar pivote en su posición final
    if (i + 1 !== high) {
      steps.push({
        type: 'swap',
        indices: [i + 1, high],
        line: 16,
        description: `Colocando pivote ${pivot} en su posición final ${i + 1}`,
      });

      [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
    }

    // Marcar pivote como ordenado
    steps.push({
      type: 'sorted',
      indices: [i + 1],
      line: 17,
      description: `Pivote ${arr[i + 1]} está en su posición correcta`,
    });

    return i + 1;
  }

  quickSort(0, arr.length - 1);

  // Asegurar que todos estén marcados como ordenados al final
  steps.push({
    type: 'sorted',
    indices: Array.from({ length: arr.length }, (_, i) => i),
    line: 5,
    description: '¡Array completamente ordenado!',
  });

  return steps;
}
