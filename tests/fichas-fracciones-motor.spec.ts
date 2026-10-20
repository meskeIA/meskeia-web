import { test, expect } from '@playwright/test';
import {
  DENOMINADOR_MAXIMO,
  MCM_MAXIMO,
  generarFraccion,
  type CuentaFraccion,
  type TipoFraccion,
} from '../app/generador-fichas-calculo/fichasFracciones';

/**
 * Ejercicios de fracciones de generador-fichas-calculo (S0216, 20/10/2026).
 *
 * El oráculo NO es el motor de fracciones: la solución de cada ejercicio se recalcula aquí con
 * aritmética de producto cruzado escrita en el test (a/b ± c/d = (ad ± cb)/bd, a/b × c/d = ac/bd,
 * a/b : c/d = ad/bc) y se compara por valor. Así, si el motor compartido se equivocara, esta ficha
 * lo cazaría por su cuenta.
 *
 * Se recorren los 5 tipos × 5 niveles × 200 semillas = 5.000 ejercicios, y para cada uno:
 *   · la solución es la cuenta del test y está en forma irreducible con denominador positivo;
 *   · nunca negativa ni nula (la regla de la ficha de enteros: el minuendo es el mayor);
 *   · denominadores dentro del máximo del nivel;
 *   · «mismo denominador» lo tiene de verdad, y «distinto» lo tiene distinto con m.c.m. ≤ 60;
 *   · «simplificar» propone una fracción que NO es irreducible.
 */

const gcd = (a: number, b: number): number => (b === 0 ? Math.abs(a) : gcd(b, a % b));

/** a/b op c/d sin simplificar, por producto cruzado. */
function cuentaDelTest(c: CuentaFraccion): [number, number] {
  const { a, b } = c;
  if (!b) return [a.num, a.den];
  switch (c.operador) {
    case '+':
      return [a.num * b.den + b.num * a.den, a.den * b.den];
    case '-':
      return [a.num * b.den - b.num * a.den, a.den * b.den];
    case '*':
      return [a.num * b.num, a.den * b.den];
    case '/':
      return [a.num * b.den, a.den * b.num];
    default:
      throw new Error('operador desconocido');
  }
}

/**
 * splitmix32: mezcla la semilla antes de usarla. Un LCG sembrado con 1..200 da un primer valor
 * casi igual en todas (0,236 + s·0,0004), y «mezcla» —que elige el tipo con la primera tirada—
 * no sacaba nunca una multiplicación: el fallo era del test, no del generador.
 */
function rngLcg(semilla: number): () => number {
  let estado = semilla >>> 0 || 1;
  return () => {
    estado = (estado + 0x9e3779b9) >>> 0;
    let z = estado;
    z = Math.imul(z ^ (z >>> 16), 0x21f0aaad) >>> 0;
    z = Math.imul(z ^ (z >>> 15), 0x735a2d97) >>> 0;
    return ((z ^ (z >>> 15)) >>> 0) / 0x100000000;
  };
}

const TIPOS: TipoFraccion[] = ['mismo', 'distinto', 'producto', 'simplificar', 'mezcla'];
const NIVELES = Object.keys(DENOMINADOR_MAXIMO);

test('5.000 ejercicios: solución exacta, irreducible, positiva y dentro de los límites del nivel', () => {
  let revisados = 0;
  for (const tipo of TIPOS) {
    for (const nivel of NIVELES) {
      const maxDen = DENOMINADOR_MAXIMO[nivel];
      for (let semilla = 1; semilla <= 200; semilla++) {
        const c = generarFraccion(tipo, nivel, rngLcg(semilla * 7919 + nivel.length));
        const etiqueta = `${tipo}/${nivel}/semilla ${semilla}: ${JSON.stringify(c)}`;
        const [n, d] = cuentaDelTest(c);

        // La solución vale lo mismo que la cuenta del test
        expect(c.resultado.num * d, etiqueta).toBe(n * c.resultado.den);
        // Irreducible y con el denominador positivo
        expect(c.resultado.den, etiqueta).toBeGreaterThan(0);
        expect(gcd(c.resultado.num, c.resultado.den), etiqueta).toBe(1);
        // Nunca negativa ni nula
        expect(c.resultado.num, etiqueta).toBeGreaterThan(0);

        if (c.b === null) {
          expect(gcd(c.a.num, c.a.den), `${etiqueta}: «simplifica» ya irreducible`).toBeGreaterThan(1);
        } else {
          expect(c.a.den, etiqueta).toBeLessThanOrEqual(maxDen);
          expect(c.b.den, etiqueta).toBeLessThanOrEqual(maxDen);
          if (tipo === 'mismo') expect(c.a.den, etiqueta).toBe(c.b.den);
          if (tipo === 'distinto') {
            expect(c.a.den, etiqueta).not.toBe(c.b.den);
            const m = (c.a.den / gcd(c.a.den, c.b.den)) * c.b.den;
            expect(m, etiqueta).toBeLessThanOrEqual(MCM_MAXIMO);
          }
        }
        revisados++;
      }
    }
  }
  expect(revisados).toBe(5000);
});

test('reproducible con la misma semilla y variado entre semillas', () => {
  expect(generarFraccion('mezcla', 'basico', rngLcg(42))).toEqual(generarFraccion('mezcla', 'basico', rngLcg(42)));
  for (const tipo of TIPOS) {
    const distintos = new Set<string>();
    for (let s = 1; s <= 40; s++) distintos.add(JSON.stringify(generarFraccion(tipo, 'intermedio', rngLcg(s * 101))));
    expect(distintos.size, tipo).toBeGreaterThanOrEqual(25);
  }
});

test('«mezcla» saca los tres tipos de operación', () => {
  const operadores = new Set<string>();
  for (let s = 1; s <= 200; s++) operadores.add(String(generarFraccion('mezcla', 'avanzado', rngLcg(s)).operador));
  expect([...operadores].sort()).toEqual(['*', '+', '-', '/'].sort());
});
