// Tipos para el Visualizador de Algoritmos

// Estado visual de una barra
export type BarState = 'normal' | 'comparing' | 'swapping' | 'sorted' | 'pivot';

// Estado de la animación
export type AnimationState = 'idle' | 'running' | 'paused' | 'finished';

// Algoritmos de ordenación disponibles
export type SortingAlgorithm = 'bubble' | 'selection' | 'insertion' | 'quick' | 'merge';

// Representación de una barra en el array
export interface ArrayBar {
  value: number;
  state: BarState;
}

// Un paso del algoritmo para la animación
export interface AlgorithmStep {
  type: 'compare' | 'swap' | 'set' | 'sorted' | 'pivot' | 'merge-split' | 'merge-combine';
  indices: number[];        // Índices involucrados
  values?: number[];        // Valores (para operaciones set)
  line: number;             // Línea de pseudocódigo a resaltar
  description: string;      // Explicación en español
}

// Métricas del algoritmo en tiempo real
export interface AlgorithmMetrics {
  comparisons: number;
  swaps: number;
  arrayAccesses: number;
  elapsedTime: number;      // milisegundos
}

// Información de un algoritmo
export interface AlgorithmInfo {
  id: SortingAlgorithm;
  name: string;
  icon: string;
  complexity: {
    best: string;
    average: string;
    worst: string;
    space: string;
  };
  description: string;
  pseudocode: string[];
}

// Colores para cada estado de barra
export const BAR_COLORS: Record<BarState, string> = {
  normal: '#2E86AB',      // Azul meskeIA
  comparing: '#fbbf24',   // Amarillo
  swapping: '#ef4444',    // Rojo
  sorted: '#10b981',      // Verde
  pivot: '#8b5cf6',       // Violeta
};

// Información de todos los algoritmos
export const ALGORITHMS_INFO: Record<SortingAlgorithm, AlgorithmInfo> = {
  bubble: {
    id: 'bubble',
    name: 'Bubble Sort',
    icon: '🫧',
    complexity: {
      best: 'O(n)',
      average: 'O(n²)',
      worst: 'O(n²)',
      space: 'O(1)',
    },
    description: 'Compara elementos adyacentes e intercambia si están desordenados. Simple pero ineficiente para arrays grandes.',
    pseudocode: [
      'procedimiento bubbleSort(A)',
      '  para i desde 0 hasta n-2',
      '    para j desde 0 hasta n-i-2',
      '      si A[j] > A[j+1] entonces',
      '        intercambiar(A[j], A[j+1])',
      '      fin si',
      '    fin para',
      '  fin para',
      'fin procedimiento',
    ],
  },
  selection: {
    id: 'selection',
    name: 'Selection Sort',
    icon: '👆',
    complexity: {
      best: 'O(n²)',
      average: 'O(n²)',
      worst: 'O(n²)',
      space: 'O(1)',
    },
    description: 'Busca el elemento mínimo y lo coloca al inicio. Realiza menos intercambios que Bubble Sort.',
    pseudocode: [
      'procedimiento selectionSort(A)',
      '  para i desde 0 hasta n-2',
      '    minIdx = i',
      '    para j desde i+1 hasta n-1',
      '      si A[j] < A[minIdx] entonces',
      '        minIdx = j',
      '      fin si',
      '    fin para',
      '    intercambiar(A[i], A[minIdx])',
      '  fin para',
      'fin procedimiento',
    ],
  },
  insertion: {
    id: 'insertion',
    name: 'Insertion Sort',
    icon: '📥',
    complexity: {
      best: 'O(n)',
      average: 'O(n²)',
      worst: 'O(n²)',
      space: 'O(1)',
    },
    description: 'Inserta cada elemento en su posición correcta. Eficiente para arrays pequeños o casi ordenados.',
    pseudocode: [
      'procedimiento insertionSort(A)',
      '  para i desde 1 hasta n-1',
      '    clave = A[i]',
      '    j = i - 1',
      '    mientras j >= 0 y A[j] > clave',
      '      A[j+1] = A[j]',
      '      j = j - 1',
      '    fin mientras',
      '    A[j+1] = clave',
      '  fin para',
      'fin procedimiento',
    ],
  },
  quick: {
    id: 'quick',
    name: 'Quick Sort',
    icon: '⚡',
    complexity: {
      best: 'O(n log n)',
      average: 'O(n log n)',
      worst: 'O(n²)',
      space: 'O(log n)',
    },
    description: 'Divide el array usando un pivote. Muy eficiente en la práctica, usado en muchas librerías.',
    pseudocode: [
      'procedimiento quickSort(A, bajo, alto)',
      '  si bajo < alto entonces',
      '    pivote = particionar(A, bajo, alto)',
      '    quickSort(A, bajo, pivote - 1)',
      '    quickSort(A, pivote + 1, alto)',
      '  fin si',
      'fin procedimiento',
      '',
      'función particionar(A, bajo, alto)',
      '  pivote = A[alto]',
      '  i = bajo - 1',
      '  para j desde bajo hasta alto - 1',
      '    si A[j] <= pivote entonces',
      '      i = i + 1',
      '      intercambiar(A[i], A[j])',
      '    fin si',
      '  fin para',
      '  intercambiar(A[i+1], A[alto])',
      '  retornar i + 1',
      'fin función',
    ],
  },
  merge: {
    id: 'merge',
    name: 'Merge Sort',
    icon: '🔀',
    complexity: {
      best: 'O(n log n)',
      average: 'O(n log n)',
      worst: 'O(n log n)',
      space: 'O(n)',
    },
    description: 'Divide el array a la mitad, ordena recursivamente y fusiona. Siempre O(n log n) pero usa memoria extra.',
    pseudocode: [
      'procedimiento mergeSort(A, izq, der)',
      '  si izq < der entonces',
      '    medio = (izq + der) / 2',
      '    mergeSort(A, izq, medio)',
      '    mergeSort(A, medio + 1, der)',
      '    fusionar(A, izq, medio, der)',
      '  fin si',
      'fin procedimiento',
      '',
      'procedimiento fusionar(A, izq, medio, der)',
      '  crear arrays temporales L y R',
      '  copiar A[izq..medio] a L',
      '  copiar A[medio+1..der] a R',
      '  fusionar L y R de vuelta a A',
      'fin procedimiento',
    ],
  },
};
