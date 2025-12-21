import { AlgorithmStep } from '../types';

export function generateInsertionSortSteps(initialArray: number[]): AlgorithmStep[] {
  const steps: AlgorithmStep[] = [];
  const arr = [...initialArray];
  const n = arr.length;

  // El primer elemento ya está "ordenado"
  steps.push({
    type: 'sorted',
    indices: [0],
    line: 1,
    description: `El primer elemento ${arr[0]} se considera ordenado`,
  });

  for (let i = 1; i < n; i++) {
    const key = arr[i];
    let j = i - 1;

    // Marcar la clave que vamos a insertar
    steps.push({
      type: 'pivot',
      indices: [i],
      line: 2,
      description: `Insertando ${key} en la parte ordenada del array`,
    });

    // Mover elementos mayores que la clave
    while (j >= 0 && arr[j] > key) {
      steps.push({
        type: 'compare',
        indices: [j, i],
        line: 4,
        description: `${arr[j]} > ${key}, desplazando ${arr[j]} a la derecha`,
      });

      arr[j + 1] = arr[j];

      steps.push({
        type: 'set',
        indices: [j + 1],
        values: [arr[j]],
        line: 5,
        description: `Moviendo ${arr[j]} de posición ${j} a ${j + 1}`,
      });

      j--;
    }

    // Insertar la clave en su posición correcta
    if (j + 1 !== i) {
      arr[j + 1] = key;
      steps.push({
        type: 'set',
        indices: [j + 1],
        values: [key],
        line: 8,
        description: `Insertando ${key} en posición ${j + 1}`,
      });
    }

    // Marcar todos los elementos hasta i como ordenados
    for (let k = 0; k <= i; k++) {
      steps.push({
        type: 'sorted',
        indices: [k],
        line: 9,
        description: k === i ? `Elemento ${arr[k]} insertado correctamente` : '',
      });
    }
  }

  return steps;
}
