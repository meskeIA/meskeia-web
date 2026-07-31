import { AlgorithmStep, ArrayBar } from './types';

/**
 * Aplica un paso sobre un estado de barras y devuelve el nuevo estado.
 * Es la misma semántica que useAlgorithmAnimation usa para la animación
 * principal, extraída para poder reproducir varios algoritmos a la vez en el
 * modo comparativa sin duplicar la lógica.
 */
export interface EstadoReproduccion {
  bars: ArrayBar[];
  comparaciones: number;
  /**
   * Movimientos, no intercambios: Insertion y Merge Sort desplazan valores en
   * lugar de permutarlos por pares, así que contar solo swaps los dejaría a cero
   * y la comparativa mentiría a su favor.
   */
  movimientos: number;
}

export function estadoInicial(array: number[]): EstadoReproduccion {
  return {
    bars: array.map((value) => ({ value, state: 'normal' })),
    comparaciones: 0,
    movimientos: 0,
  };
}

export function aplicarPaso(estado: EstadoReproduccion, paso: AlgorithmStep): EstadoReproduccion {
  // Los estados visuales duran un paso, salvo 'sorted', que es definitivo
  const bars: ArrayBar[] = estado.bars.map((b) => ({
    value: b.value,
    state: b.state === 'sorted' ? 'sorted' : 'normal',
  }));
  let { comparaciones, movimientos } = estado;

  switch (paso.type) {
    case 'compare':
      comparaciones++;
      paso.indices.forEach((i) => { if (bars[i]) bars[i].state = 'comparing'; });
      break;

    case 'swap':
      movimientos++;
      paso.indices.forEach((i) => { if (bars[i]) bars[i].state = 'swapping'; });
      if (paso.indices.length === 2) {
        const [i, j] = paso.indices;
        const tmp = bars[i].value;
        bars[i].value = bars[j].value;
        bars[j].value = tmp;
      }
      break;

    case 'set':
      if (paso.values) {
        movimientos += paso.indices.length;
        paso.indices.forEach((idx, i) => {
          if (bars[idx] && paso.values?.[i] !== undefined) {
            bars[idx].value = paso.values[i];
            bars[idx].state = 'swapping';
          }
        });
      }
      break;

    case 'pivot':
      paso.indices.forEach((i) => { if (bars[i]) bars[i].state = 'pivot'; });
      break;

    case 'sorted':
      paso.indices.forEach((i) => { if (bars[i]) bars[i].state = 'sorted'; });
      break;

    case 'merge-split':
    case 'merge-combine':
      paso.indices.forEach((i) => { if (bars[i]) bars[i].state = 'comparing'; });
      break;
  }

  return { bars, comparaciones, movimientos };
}
