export { generateBubbleSortSteps } from './bubbleSort';
export { generateSelectionSortSteps } from './selectionSort';
export { generateInsertionSortSteps } from './insertionSort';
export { generateQuickSortSteps } from './quickSort';
export { generateMergeSortSteps } from './mergeSort';
export { generateHeapSortSteps } from './heapSort';
export { generateCountingSortSteps } from './countingSort';

import { SortingAlgorithm, AlgorithmStep } from '../types';
import { generateBubbleSortSteps } from './bubbleSort';
import { generateSelectionSortSteps } from './selectionSort';
import { generateInsertionSortSteps } from './insertionSort';
import { generateQuickSortSteps } from './quickSort';
import { generateMergeSortSteps } from './mergeSort';
import { generateHeapSortSteps } from './heapSort';
import { generateCountingSortSteps } from './countingSort';

// Función que genera los pasos según el algoritmo seleccionado
export function generateSteps(algorithm: SortingAlgorithm, array: number[]): AlgorithmStep[] {
  switch (algorithm) {
    case 'bubble':
      return generateBubbleSortSteps(array);
    case 'selection':
      return generateSelectionSortSteps(array);
    case 'insertion':
      return generateInsertionSortSteps(array);
    case 'quick':
      return generateQuickSortSteps(array);
    case 'merge':
      return generateMergeSortSteps(array);
    case 'heap':
      return generateHeapSortSteps(array);
    case 'counting':
      return generateCountingSortSteps(array);
    default:
      return [];
  }
}
