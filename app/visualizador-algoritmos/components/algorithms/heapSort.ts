import { AlgorithmStep } from '../types';

/**
 * Heap Sort: construye un montículo máximo y va extrayendo la raíz al final.
 * Garantiza O(n log n) en todos los casos y ordena in-place, pero no es estable.
 */
export function generateHeapSortSteps(initialArray: number[]): AlgorithmStep[] {
  const steps: AlgorithmStep[] = [];
  const arr = [...initialArray];
  const n = arr.length;

  // Hunde el nodo raiz por el montículo hasta que cumpla la propiedad de max-heap
  const hundir = (tamano: number, raiz: number) => {
    let mayor = raiz;
    const izq = 2 * raiz + 1;
    const der = 2 * raiz + 2;

    steps.push({
      type: 'pivot',
      indices: [raiz],
      line: 9,
      description: `Nodo ${arr[raiz]} (posición ${raiz}): comprobando si es mayor que sus hijos`,
    });

    if (izq < tamano) {
      steps.push({
        type: 'compare',
        indices: [izq, mayor],
        line: 11,
        description: `Hijo izquierdo ${arr[izq]} frente a ${arr[mayor]}`,
      });
      if (arr[izq] > arr[mayor]) mayor = izq;
    }

    if (der < tamano) {
      steps.push({
        type: 'compare',
        indices: [der, mayor],
        line: 13,
        description: `Hijo derecho ${arr[der]} frente a ${arr[mayor]}`,
      });
      if (arr[der] > arr[mayor]) mayor = der;
    }

    if (mayor !== raiz) {
      steps.push({
        type: 'swap',
        indices: [raiz, mayor],
        line: 15,
        description: `El hijo ${arr[mayor]} es mayor: sube y ${arr[raiz]} baja`,
      });
      [arr[raiz], arr[mayor]] = [arr[mayor], arr[raiz]];
      hundir(tamano, mayor);
    }
  };

  // Fase 1: construir el max-heap desde el último nodo con hijos
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    hundir(n, i);
  }

  // Fase 2: extraer el máximo (la raíz) y colocarlo al final
  for (let i = n - 1; i > 0; i--) {
    steps.push({
      type: 'swap',
      indices: [0, i],
      line: 4,
      description: `El máximo ${arr[0]} sale del montículo y ocupa la posición ${i}`,
    });
    [arr[0], arr[i]] = [arr[i], arr[0]];

    steps.push({
      type: 'sorted',
      indices: [i],
      line: 5,
      description: `${arr[i]} ya está en su sitio definitivo`,
    });

    hundir(i, 0);
  }

  steps.push({
    type: 'sorted',
    indices: [0],
    line: 6,
    description: '¡Array completamente ordenado!',
  });

  return steps;
}
