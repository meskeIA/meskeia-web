import { test, expect } from '@playwright/test';
import {
  insertar,
  extraerRaiz,
  construir,
  heapsort,
  comprobar,
  padreDe,
  izquierdoDe,
  derechoDe,
  MAX_ELEMENTOS,
} from '../app/simulador-monticulo-binario/motor';

/**
 * Motor del montículo binario — casos resueltos A MANO antes de escribir la vista.
 *
 * El oráculo son los arreglos trazados con lápiz, no el propio motor.
 */

test.describe('índices del árbol en arreglo', () => {
  test('A MANO: padre e hijos del índice 4 en un árbol de 10 nodos', () => {
    // Con i=4: padre = ⌊3/2⌋ = 1 · hijos = 9 y 10
    expect(padreDe(4)).toBe(1);
    expect(izquierdoDe(4)).toBe(9);
    expect(derechoDe(4)).toBe(10);
    // La raíz no tiene padre válido
    expect(padreDe(0)).toBe(-1);
  });
});

test.describe('insertar', () => {
  /**
   * A MANO · montículo de MÁXIMOS [50, 30, 40, 10, 20], insertamos 45.
   *
   *   Queda [50,30,40,10,20,45], el 45 en el índice 5. Su padre es ⌊4/2⌋ = 2 → 40.
   *   45 > 40 → intercambio:            [50,30,45,10,20,40], el 45 en el índice 2.
   *   Padre del 2 es ⌊1/2⌋ = 0 → 50.  45 < 50 → para.
   *   Resultado: [50,30,45,10,20,40]
   */
  test('A MANO: 45 sube dos niveles y se para bajo el 50', () => {
    const r = insertar([50, 30, 40, 10, 20], 45, 'max');
    expect(r.ok).toBe(true);
    expect(r.arreglo).toEqual([50, 30, 45, 10, 20, 40]);
    expect(comprobar(r.arreglo, 'max').esMonticulo).toBe(true);
  });

  test('A MANO: en un montículo de MÍNIMOS el mismo 45 no se mueve del final', () => {
    // [10,20,15,40,30] + 45 → 45 > su padre (20) → se queda en el índice 5
    const r = insertar([10, 20, 15, 40, 30], 45, 'min');
    expect(r.arreglo).toEqual([10, 20, 15, 40, 30, 45]);
    expect(comprobar(r.arreglo, 'min').esMonticulo).toBe(true);
  });

  test('un valor que supera a todos acaba en la raíz', () => {
    const r = insertar([50, 30, 40, 10, 20], 99, 'max');
    expect(r.arreglo[0]).toBe(99);
    expect(comprobar(r.arreglo, 'max').esMonticulo).toBe(true);
  });

  test('insertar en el vacío deja un solo elemento y no compara nada', () => {
    const r = insertar([], 7, 'max');
    expect(r.arreglo).toEqual([7]);
    expect(r.pasos.length).toBeGreaterThan(0);
  });

  test('RECHAZO: no se pasa del máximo de elementos', () => {
    const lleno = Array.from({ length: MAX_ELEMENTOS }, (_, i) => MAX_ELEMENTOS - i);
    const r = insertar(lleno, 1, 'max');
    expect(r.ok).toBe(false);
    expect(r.error).toContain(String(MAX_ELEMENTOS));
    expect(r.arreglo).toEqual(lleno);
  });

  test('RECHAZO: un valor que no es número no entra', () => {
    const r = insertar([5], Number.NaN, 'max');
    expect(r.ok).toBe(false);
  });
});

test.describe('extraer la raíz', () => {
  /**
   * A MANO · MÁXIMOS [50,30,45,10,20,40]. Extraemos el 50.
   *
   *   Sale 50, el último (40) va a la raíz: [40,30,45,10,20]
   *   Hijos del 0: 30 y 45 → el mayor es 45 (índice 2) y 45 > 40 → intercambio
   *   [45,30,40,10,20], bajo al índice 2. Hijos del 2: no hay (2·2+1 = 5 ≥ 5). Fin.
   *   Resultado: [45,30,40,10,20], extraído 50.
   */
  test('A MANO: sale el 50 y el montículo se recompone en [45,30,40,10,20]', () => {
    const r = extraerRaiz([50, 30, 45, 10, 20, 40], 'max');
    expect(r.ok).toBe(true);
    expect(r.extraido).toBe(50);
    expect(r.arreglo).toEqual([45, 30, 40, 10, 20]);
    expect(comprobar(r.arreglo, 'max').esMonticulo).toBe(true);
  });

  test('extraer del montículo de un solo elemento lo deja vacío', () => {
    const r = extraerRaiz([7], 'max');
    expect(r.extraido).toBe(7);
    expect(r.arreglo).toEqual([]);
  });

  test('RECHAZO: no se extrae de un montículo vacío', () => {
    const r = extraerRaiz([], 'max');
    expect(r.ok).toBe(false);
    expect(r.error).toContain('vacío');
  });

  test('extraer repetidamente saca los valores en orden decreciente (MAX)', () => {
    let actual = construir([3, 9, 1, 7, 5], 'max').arreglo;
    const salida: number[] = [];
    while (actual.length > 0) {
      const r = extraerRaiz(actual, 'max');
      salida.push(r.extraido as number);
      actual = r.arreglo;
    }
    expect(salida).toEqual([9, 7, 5, 3, 1]);
  });
});

test.describe('construir (heapify)', () => {
  /**
   * A MANO · [4, 10, 3, 5, 1] a montículo de MÁXIMOS.
   *
   *   Primer nodo con hijos: ⌊5/2⌋ − 1 = 1 (valor 10).
   *   i=1 → hijos 5 y 1; el mayor es 5 < 10 → no se mueve.
   *   i=0 → valor 4, hijos 10 y 3; el mayor es 10 > 4 → intercambio.
   *         [10,4,3,5,1], bajo al índice 1: hijos 5 y 1; 5 > 4 → intercambio.
   *         [10,5,3,4,1], bajo al índice 3: es hoja. Fin.
   *   Resultado: [10,5,3,4,1]
   */
  test('A MANO: [4,10,3,5,1] se convierte en [10,5,3,4,1]', () => {
    const r = construir([4, 10, 3, 5, 1], 'max');
    expect(r.ok).toBe(true);
    expect(r.arreglo).toEqual([10, 5, 3, 4, 1]);
  });

  test('construir empieza por el último nodo CON hijos, no por el último elemento', () => {
    // Si empezara por el final, el primer paso hablaría del índice 4 y no del 1
    const r = construir([4, 10, 3, 5, 1], 'max');
    const primerHundido = r.pasos.find((p) => p.descripcion.includes('Hundo el nodo'));
    expect(primerHundido?.descripcion).toContain('índice 1');
  });

  test('un arreglo de 0 o 1 elementos ya es un montículo', () => {
    expect(construir([], 'max').arreglo).toEqual([]);
    expect(construir([9], 'min').arreglo).toEqual([9]);
  });

  test('el resultado cumple SIEMPRE la propiedad, con valores repetidos incluidos', () => {
    for (const tipo of ['max', 'min'] as const) {
      for (const entrada of [[5, 5, 5, 5], [1, 2, 3, 4, 5, 6, 7], [7, 6, 5, 4, 3, 2, 1], [2, -3, 0, 8, -1]]) {
        const r = construir(entrada, tipo);
        expect(comprobar(r.arreglo, tipo).esMonticulo).toBe(true);
        expect([...r.arreglo].sort((a, b) => a - b)).toEqual([...entrada].sort((a, b) => a - b));
      }
    }
  });
});

test.describe('heapsort', () => {
  test('A MANO: con montículo de MÁXIMOS el resultado queda ASCENDENTE', () => {
    const r = heapsort([4, 10, 3, 5, 1], 'max');
    expect(r.ok).toBe(true);
    expect(r.ordenado).toEqual([1, 3, 4, 5, 10]);
  });

  test('A MANO: con montículo de MÍNIMOS queda DESCENDENTE, que es lo que descoloca', () => {
    const r = heapsort([4, 10, 3, 5, 1], 'min');
    expect(r.ordenado).toEqual([10, 5, 4, 3, 1]);
  });

  test('ordena bien lo ya ordenado, lo invertido y lo repetido', () => {
    expect(heapsort([1, 2, 3, 4], 'max').ordenado).toEqual([1, 2, 3, 4]);
    expect(heapsort([4, 3, 2, 1], 'max').ordenado).toEqual([1, 2, 3, 4]);
    expect(heapsort([2, 2, 1, 2], 'max').ordenado).toEqual([1, 2, 2, 2]);
    expect(heapsort([], 'max').ordenado).toEqual([]);
  });
});

test.describe('comprobar', () => {
  test('señala el PRIMER índice que rompe la propiedad', () => {
    // [10,5,3,4,20]: el índice 4 (20) es mayor que su padre, el índice 1 (5)
    const c = comprobar([10, 5, 3, 4, 20], 'max');
    expect(c.esMonticulo).toBe(false);
    expect(c.indiceProblema).toBe(4);
    expect(c.mensaje).toContain('20');
  });

  test('un montículo de máximos NO es un montículo de mínimos', () => {
    expect(comprobar([10, 5, 3], 'max').esMonticulo).toBe(true);
    expect(comprobar([10, 5, 3], 'min').esMonticulo).toBe(false);
  });

  test('el vacío cumple la propiedad por definición', () => {
    expect(comprobar([], 'max').esMonticulo).toBe(true);
  });
});
