import { AlgorithmStep } from '../types';

export function generateMergeSortSteps(initialArray: number[]): AlgorithmStep[] {
  const steps: AlgorithmStep[] = [];
  const arr = [...initialArray];

  function mergeSort(left: number, right: number): void {
    if (left < right) {
      const mid = Math.floor((left + right) / 2);

      // Indicar división
      steps.push({
        type: 'merge-split',
        indices: [left, mid, right],
        line: 2,
        description: `Dividiendo array desde posición ${left} hasta ${right} (mitad: ${mid})`,
      });

      mergeSort(left, mid);
      mergeSort(mid + 1, right);
      merge(left, mid, right);
    }
  }

  function merge(left: number, mid: number, right: number): void {
    const leftArr = arr.slice(left, mid + 1);
    const rightArr = arr.slice(mid + 1, right + 1);

    steps.push({
      type: 'merge-combine',
      indices: [left, right],
      line: 9,
      description: `Fusionando subarrays [${leftArr.join(', ')}] y [${rightArr.join(', ')}]`,
    });

    let i = 0;      // Índice para leftArr
    let j = 0;      // Índice para rightArr
    let k = left;   // Índice para arr principal

    while (i < leftArr.length && j < rightArr.length) {
      // Comparar elementos de ambos subarrays
      steps.push({
        type: 'compare',
        indices: [left + i, mid + 1 + j],
        line: 11,
        description: `Comparando ${leftArr[i]} con ${rightArr[j]}`,
      });

      if (leftArr[i] <= rightArr[j]) {
        arr[k] = leftArr[i];
        steps.push({
          type: 'set',
          indices: [k],
          values: [leftArr[i]],
          line: 12,
          description: `Colocando ${leftArr[i]} en posición ${k}`,
        });
        i++;
      } else {
        arr[k] = rightArr[j];
        steps.push({
          type: 'set',
          indices: [k],
          values: [rightArr[j]],
          line: 13,
          description: `Colocando ${rightArr[j]} en posición ${k}`,
        });
        j++;
      }
      k++;
    }

    // Copiar elementos restantes del subarray izquierdo
    while (i < leftArr.length) {
      arr[k] = leftArr[i];
      steps.push({
        type: 'set',
        indices: [k],
        values: [leftArr[i]],
        line: 14,
        description: `Copiando ${leftArr[i]} restante a posición ${k}`,
      });
      i++;
      k++;
    }

    // Copiar elementos restantes del subarray derecho
    while (j < rightArr.length) {
      arr[k] = rightArr[j];
      steps.push({
        type: 'set',
        indices: [k],
        values: [rightArr[j]],
        line: 14,
        description: `Copiando ${rightArr[j]} restante a posición ${k}`,
      });
      j++;
      k++;
    }

    // Marcar sección fusionada como parcialmente ordenada
    if (left === 0 && right === arr.length - 1) {
      // Solo marcar como completamente ordenado al final
      for (let idx = left; idx <= right; idx++) {
        steps.push({
          type: 'sorted',
          indices: [idx],
          line: 6,
          description: idx === right ? '¡Array completamente ordenado!' : '',
        });
      }
    }
  }

  mergeSort(0, arr.length - 1);

  return steps;
}
