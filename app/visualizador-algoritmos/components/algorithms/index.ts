export { generateBubbleSortSteps } from './bubbleSort';
export { generateSelectionSortSteps } from './selectionSort';
export { generateInsertionSortSteps } from './insertionSort';
export { generateQuickSortSteps } from './quickSort';
export { generateMergeSortSteps } from './mergeSort';

import { SortingAlgorithm, AlgorithmStep } from '../types';
import { generateBubbleSortSteps } from './bubbleSort';
import { generateSelectionSortSteps } from './selectionSort';
import { generateInsertionSortSteps } from './insertionSort';
import { generateQuickSortSteps } from './quickSort';
import { generateMergeSortSteps } from './mergeSort';

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
    default:
      return [];
  }
}
