import { test, expect } from '@playwright/test';
import {
  CRIBA_MAXIMO,
  primosHasta,
  resolverCriba,
  validarRango,
} from '../app/visualizador-numeros-primos/motor';

/**
 * Motor de la criba por rango de visualizador-numeros-primos — casos resueltos A MANO antes
 * de escribir la vista (semilla S0213, 19/10/2026).
 *
 * El oráculo no es el motor: son listas escritas a mano y recuentos de la tabla clásica
 * π(n) (número de primos ≤ n): π(100) = 25, π(200) = 46, π(300) = 62, π(500) = 95,
 * π(900) = 154, π(1000) = 168. De ahí:
 *   del 101 al 200 → 46 − 25 = 21 primos
 *   del 901 al 1000 → 168 − 154 = 14 primos
 *
 * Los primos que tachan son los de hasta √hasta:
 *   √100 = 10    → 2, 3, 5, 7
 *   √200 ≈ 14,1  → 2, 3, 5, 7, 11, 13
 *   √1000 ≈ 31,6 → 2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31
 *
 * Y quién tacha a cada compuesto (su menor factor primo):
 *   121 = 11² → 11 · 143 = 11·13 → 11 · 169 = 13² → 13 · 187 = 11·17 → 11
 *   961 = 31² → 31 (el último primo que tacha algo hasta 1.000)
 *   91 = 7·13 → 7 (el compuesto impar que más se cuela por «parece primo»)
 */

const PRIMOS_HASTA_100 = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97];
const PRIMOS_101_200 = [101, 103, 107, 109, 113, 127, 131, 137, 139, 149, 151, 157, 163, 167, 173, 179, 181, 191, 193, 197, 199];
const PRIMOS_901_1000 = [907, 911, 919, 929, 937, 941, 947, 953, 967, 971, 977, 983, 991, 997];

test.describe('resolverCriba — rangos de ejercicio', () => {
  test('A MANO: del 1 al 100 quedan los 25 primos de la tabla, tachados por 2, 3, 5 y 7', () => {
    const r = resolverCriba(1, 100);
    expect(r.celdas).toHaveLength(100);
    expect(r.primos).toEqual(PRIMOS_HASTA_100);
    expect(r.primosQueTachan).toEqual([2, 3, 5, 7]);
    expect(r.primosFueraDeHoja).toEqual([]);
  });

  test('A MANO: el 1 no es primo y no lo tacha nadie', () => {
    const uno = resolverCriba(1, 10).celdas[0];
    expect(uno).toEqual({ numero: 1, primo: false, tachadoPor: null });
  });

  test('A MANO: del 101 al 200 hay 21 primos y los seis que tachan están FUERA de la hoja', () => {
    const r = resolverCriba(101, 200);
    expect(r.celdas).toHaveLength(100);
    expect(r.celdas[0].numero).toBe(101);
    expect(r.primos).toEqual(PRIMOS_101_200);
    expect(r.primosQueTachan).toEqual([2, 3, 5, 7, 11, 13]);
    expect(r.primosFueraDeHoja).toEqual([2, 3, 5, 7, 11, 13]);
  });

  test('A MANO: del 901 al 1000 hay 14 primos', () => {
    const r = resolverCriba(901, 1000);
    expect(r.primos).toEqual(PRIMOS_901_1000);
    expect(r.primosQueTachan).toEqual([2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31]);
  });

  test('A MANO: los recuentos de π(n) desde 1', () => {
    expect(resolverCriba(1, 200).primos).toHaveLength(46);
    expect(resolverCriba(1, 300).primos).toHaveLength(62);
    expect(resolverCriba(1, 500).primos).toHaveLength(95);
    expect(resolverCriba(1, 1000).primos).toHaveLength(168);
  });

  test('A MANO: cada compuesto lo tacha su menor factor primo', () => {
    const r = resolverCriba(1, 1000);
    const tachador = (n: number) => r.celdas[n - 1].tachadoPor;
    expect(tachador(91)).toBe(7);
    expect(tachador(121)).toBe(11);
    expect(tachador(143)).toBe(11);
    expect(tachador(169)).toBe(13);
    expect(tachador(187)).toBe(11);
    expect(tachador(961)).toBe(31);
    expect(tachador(4)).toBe(2);
    expect(tachador(97)).toBeNull();
  });

  test('un primo de la hoja que también tacha (el 11 del 1 al 200) queda como primo, no tachado por sí mismo', () => {
    const r = resolverCriba(1, 200);
    expect(r.celdas[10]).toEqual({ numero: 11, primo: true, tachadoPor: null });
  });

  test('el rango que empieza en un cuadrado perfecto: del 49 al 60 el 49 lo tacha el 7', () => {
    const r = resolverCriba(49, 60);
    expect(r.celdas[0]).toEqual({ numero: 49, primo: false, tachadoPor: 7 });
    expect(r.primos).toEqual([53, 59]);
    expect(r.primosFueraDeHoja).toEqual([2, 3, 5, 7]);
  });

  test('el rango mínimo del 1 al 2: no tacha nadie y el 2 es primo', () => {
    const r = resolverCriba(1, 2);
    expect(r.primosQueTachan).toEqual([]);
    expect(r.primos).toEqual([2]);
  });
});

test.describe('validarRango — lo que no se criba', () => {
  test('acepta el rango completo hasta el máximo', () => {
    expect(validarRango(1, CRIBA_MAXIMO)).toBeNull();
    expect(validarRango(101, 200)).toBeNull();
  });

  test('rechaza el rango vacío, invertido, decimal, por debajo de 1 o por encima del máximo', () => {
    expect(validarRango(200, 200)).not.toBeNull();
    expect(validarRango(200, 101)).not.toBeNull();
    expect(validarRango(1.5, 100)).not.toBeNull();
    expect(validarRango(0, 100)).not.toBeNull();
    expect(validarRango(1, CRIBA_MAXIMO + 1)).not.toBeNull();
    expect(validarRango(NaN, 100)).not.toBeNull();
  });

  test('resolverCriba lanza con un rango inválido en vez de devolver una hoja vacía', () => {
    expect(() => resolverCriba(300, 100)).toThrow();
  });
});

test.describe('primosHasta', () => {
  test('A MANO: bordes', () => {
    expect(primosHasta(1)).toEqual([]);
    expect(primosHasta(2)).toEqual([2]);
    expect(primosHasta(100)).toEqual(PRIMOS_HASTA_100);
  });
});
