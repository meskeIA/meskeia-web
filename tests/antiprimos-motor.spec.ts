import { test, expect } from '@playwright/test';
import {
  antiprimosHasta,
  analizarAntiprimo,
  contarDivisores,
  conteoDivisoresHasta,
  LIMITE_MAXIMO,
} from '../app/calculadora-teoria-numeros/motor-antiprimos';

/**
 * Motor de antiprimos — casos resueltos A MANO antes de escribir la vista.
 *
 * Un número es altamente compuesto si tiene MÁS divisores que todos los anteriores. El
 * oráculo de estos tests no es el propio motor: son factorizaciones hechas a mano, donde
 * d(n) = producto de (exponente + 1).
 *
 *   d(12)   = d(2²·3)      = 3·2         = 6
 *   d(36)   = d(2²·3²)     = 3·3         = 9
 *   d(60)   = d(2²·3·5)    = 3·2·2       = 12
 *   d(360)  = d(2³·3²·5)   = 4·3·2       = 24
 *   d(720)  = d(2⁴·3²·5)   = 5·3·2       = 30
 *   d(840)  = d(2³·3·5·7)  = 4·2·2·2     = 32
 *   d(1260) = d(2²·3²·5·7) = 3·3·2·2     = 36
 *   d(1680) = d(2⁴·3·5·7)  = 5·2·2·2     = 40
 *   d(2520) = d(2³·3²·5·7) = 4·3·2·2     = 48
 *   d(5040) = d(2⁴·3²·5·7) = 5·3·2·2     = 60
 *
 * Y los contraejemplos, que son los que de verdad ponen a prueba la definición:
 *   d(40)  = d(2³·5)  = 4·2   = 8  → 24 ya tenía 8, así que 40 NO es antiprimo
 *   d(100) = d(2²·5²) = 3·3   = 9  → 36 ya tenía 9, así que 100 NO es antiprimo
 *   d(96)  = d(2⁵·3)  = 6·2   = 12 → 60 ya tenía 12, así que 96 NO es antiprimo
 */

/** La secuencia canónica (OEIS A002182), escrita a mano hasta 5040. */
const ANTIPRIMOS_HASTA_5040 = [1, 2, 4, 6, 12, 24, 36, 48, 60, 120, 180, 240, 360, 720, 840, 1260, 1680, 2520, 5040];

test.describe('contarDivisores — el oráculo elemental', () => {
  test('A MANO: las factorizaciones de la cabecera dan el número de divisores esperado', () => {
    expect(contarDivisores(12)).toBe(6);
    expect(contarDivisores(36)).toBe(9);
    expect(contarDivisores(60)).toBe(12);
    expect(contarDivisores(360)).toBe(24);
    expect(contarDivisores(720)).toBe(30);
    expect(contarDivisores(840)).toBe(32);
    expect(contarDivisores(1260)).toBe(36);
    expect(contarDivisores(1680)).toBe(40);
    expect(contarDivisores(2520)).toBe(48);
    expect(contarDivisores(5040)).toBe(60);
  });

  test('CUADRADO PERFECTO: la raíz no se cuenta dos veces', () => {
    expect(contarDivisores(1)).toBe(1);    // solo el 1
    expect(contarDivisores(4)).toBe(3);    // 1, 2, 4
    expect(contarDivisores(9)).toBe(3);    // 1, 3, 9
    expect(contarDivisores(16)).toBe(5);   // 1, 2, 4, 8, 16
    expect(contarDivisores(100)).toBe(9);  // 1,2,4,5,10,20,25,50,100
  });

  test('PRIMOS: exactamente dos divisores, por definición', () => {
    for (const p of [2, 3, 5, 7, 97, 9973]) expect(contarDivisores(p)).toBe(2);
  });

  test('ENTRADA INVÁLIDA: cero, negativos y decimales no cuentan divisores', () => {
    expect(contarDivisores(0)).toBe(0);
    expect(contarDivisores(-12)).toBe(0);
    expect(contarDivisores(2.5)).toBe(0);
  });
});

test.describe('conteoDivisoresHasta — la criba coincide con el conteo uno a uno', () => {
  test('CONSISTENCIA: los 2.000 primeros valores de la criba y de contarDivisores son iguales', () => {
    const cuenta = conteoDivisoresHasta(2000);
    for (let n = 1; n <= 2000; n++) {
      expect(cuenta[n], `divisores de ${n}`).toBe(contarDivisores(n));
    }
  });

  test('LÍMITE: no se criba por encima del tope aceptado', () => {
    const cuenta = conteoDivisoresHasta(LIMITE_MAXIMO * 10);
    expect(cuenta.length - 1).toBe(LIMITE_MAXIMO);
  });

  test('DEGENERADO: un límite menor que 1 no revienta', () => {
    expect(conteoDivisoresHasta(0).length).toBe(1);
    expect(conteoDivisoresHasta(-5).length).toBe(1);
    expect(conteoDivisoresHasta(NaN).length).toBe(1);
  });
});

test.describe('antiprimosHasta — la serie de récords', () => {
  test('A MANO: hasta 5040 sale exactamente la secuencia canónica, ni uno más ni uno menos', () => {
    expect(antiprimosHasta(5040).map((a) => a.numero)).toEqual(ANTIPRIMOS_HASTA_5040);
  });

  test('A MANO: cada antiprimo lleva el número de divisores de su factorización', () => {
    const porNumero = new Map(antiprimosHasta(5040).map((a) => [a.numero, a.divisores]));
    expect(porNumero.get(1)).toBe(1);
    expect(porNumero.get(6)).toBe(4);
    expect(porNumero.get(12)).toBe(6);
    expect(porNumero.get(24)).toBe(8);
    expect(porNumero.get(36)).toBe(9);
    expect(porNumero.get(60)).toBe(12);
    expect(porNumero.get(360)).toBe(24);
    expect(porNumero.get(5040)).toBe(60);
  });

  test('DEFINICIÓN: cada antiprimo tiene más divisores que TODOS los números menores', () => {
    // La comprobación por fuerza bruta de la definición, sobre los 3.000 primeros enteros
    const cuenta = conteoDivisoresHasta(3000);
    const lista = antiprimosHasta(3000);
    for (const { numero, divisores } of lista) {
      for (let k = 1; k < numero; k++) {
        expect(cuenta[k], `${k} no debería igualar ni superar a ${numero}`).toBeLessThan(divisores);
      }
    }
  });

  test('EXHAUSTIVO: ningún número menor de 3.000 fuera de la lista bate el récord vigente', () => {
    // El reverso del test anterior: que no falte ninguno
    const cuenta = conteoDivisoresHasta(3000);
    const enLista = new Set(antiprimosHasta(3000).map((a) => a.numero));
    let record = 0;
    for (let n = 1; n <= 3000; n++) {
      const baterecord = cuenta[n] > record;
      expect(enLista.has(n), `${n} con ${cuenta[n]} divisores (récord ${record})`).toBe(baterecord);
      if (baterecord) record = cuenta[n];
    }
  });

  test('ESTRUCTURAL: la serie crece y sus divisores también, siempre', () => {
    const lista = antiprimosHasta(100_000);
    for (let i = 1; i < lista.length; i++) {
      expect(lista[i].numero).toBeGreaterThan(lista[i - 1].numero);
      expect(lista[i].divisores).toBeGreaterThan(lista[i - 1].divisores);
    }
    // Hasta 100.000 el último es 83.160, con 128 divisores (2³·3³·5·7·11)
    expect(lista[lista.length - 1]).toEqual({ numero: 83160, divisores: 128 });
  });
});

test.describe('analizarAntiprimo — el veredicto que lee la app', () => {
  const antiprimos = antiprimosHasta(10_000);

  test('A MANO: 60 es antiprimo, con 48 antes y 120 después', () => {
    const a = analizarAntiprimo(60, antiprimos, 10_000)!;
    expect(a.esAntiprimo).toBe(true);
    expect(a.divisores).toBe(12);
    expect(a.anterior).toEqual({ numero: 48, divisores: 10 });
    expect(a.siguiente).toEqual({ numero: 120, divisores: 16 });
    expect(a.primeroConTantos).toEqual({ numero: 60, divisores: 12 });
  });

  test('A MANO: 5040 es antiprimo y tiene 60 divisores', () => {
    const a = analizarAntiprimo(5040, antiprimos, 10_000)!;
    expect(a.esAntiprimo).toBe(true);
    expect(a.divisores).toBe(60);
    expect(a.anterior).toEqual({ numero: 2520, divisores: 48 });
  });

  test('CONTRAEJEMPLO: 40 tiene 8 divisores, pero 24 ya llegaba a 8', () => {
    const a = analizarAntiprimo(40, antiprimos, 10_000)!;
    expect(a.esAntiprimo).toBe(false);
    expect(a.divisores).toBe(8);
    expect(a.primeroConTantos).toEqual({ numero: 24, divisores: 8 });
    expect(a.anterior).toEqual({ numero: 36, divisores: 9 });
    expect(a.siguiente).toEqual({ numero: 48, divisores: 10 });
  });

  test('CONTRAEJEMPLO: 100 tiene 9 divisores, los mismos que 36 — empatar no basta', () => {
    const a = analizarAntiprimo(100, antiprimos, 10_000)!;
    expect(a.esAntiprimo).toBe(false);
    expect(a.divisores).toBe(9);
    expect(a.primeroConTantos).toEqual({ numero: 36, divisores: 9 });
  });

  test('CONTRAEJEMPLO: 96 tiene 12 divisores, tantos como 60, y tampoco es antiprimo', () => {
    const a = analizarAntiprimo(96, antiprimos, 10_000)!;
    expect(a.esAntiprimo).toBe(false);
    expect(a.divisores).toBe(12);
    expect(a.primeroConTantos).toEqual({ numero: 60, divisores: 12 });
  });

  test('PRIMO: 97 tiene 2 divisores y el primero que los tuvo fue el 2', () => {
    const a = analizarAntiprimo(97, antiprimos, 10_000)!;
    expect(a.esAntiprimo).toBe(false);
    expect(a.divisores).toBe(2);
    expect(a.primeroConTantos).toEqual({ numero: 2, divisores: 2 });
  });

  test('EXTREMO: el 1 es antiprimo y no tiene anterior', () => {
    const a = analizarAntiprimo(1, antiprimos, 10_000)!;
    expect(a.esAntiprimo).toBe(true);
    expect(a.divisores).toBe(1);
    expect(a.anterior).toBeNull();
    expect(a.siguiente).toEqual({ numero: 2, divisores: 2 });
  });

  test('FUERA DE ALCANCE: no se opina de lo que no se ha cribado', () => {
    expect(analizarAntiprimo(10_001, antiprimos, 10_000)).toBeNull();
    expect(analizarAntiprimo(0, antiprimos, 10_000)).toBeNull();
    expect(analizarAntiprimo(-60, antiprimos, 10_000)).toBeNull();
    expect(analizarAntiprimo(60.5, antiprimos, 10_000)).toBeNull();
  });

  test('SIN SIGUIENTE: el último antiprimo explorado no promete uno posterior', () => {
    const cortos = antiprimosHasta(100);
    const a = analizarAntiprimo(60, cortos, 100)!;
    expect(a.esAntiprimo).toBe(true);
    expect(a.siguiente).toBeNull(); // 120 existe, pero cae fuera de lo cribado
  });

  test('COHERENCIA: un antiprimo es siempre el primero con esa cantidad de divisores', () => {
    for (const { numero } of antiprimosHasta(3000)) {
      const a = analizarAntiprimo(numero, antiprimos, 10_000)!;
      expect(a.primeroConTantos?.numero, `antiprimo ${numero}`).toBe(numero);
    }
  });
});
