/**
 * Tests unitarios del evaluador booleano de simulador-puertas-logicas
 *
 * Ejecutar: npx playwright test tests/puertas-logicas-motor.spec.ts
 *
 * Las tablas de verdad se escriben a mano, en el orden A=0,0,1,1 · B=0,1,0,1:
 *
 *   AND  [0,0,0,1]     NAND [1,1,1,0]
 *   OR   [0,1,1,1]     NOR  [1,0,0,0]
 *   XOR  [0,1,1,0]     XNOR [1,0,0,1]
 *
 * El hallazgo 135 era que «A XOR B» devolvía [0,0,0,0] sin avisar, porque la normalización
 * convertía «XOR» en «X|» al reemplazar OR antes que XOR. El 136, que NAND, NOR y XNOR ni
 * se reconocían. Los dos casos están abajo, y con ellos la propiedad que los hace visibles:
 * un error debe SALIR como error, no como una columna de ceros.
 */

import { test, expect } from '@playwright/test';
import { evaluarExpresion, extraerVariables } from '../app/simulador-puertas-logicas/motor';

/** Columna de salida de una expresión de dos variables, en orden 00, 01, 10, 11 */
function tabla2(expr: string): number[] {
  return [
    [false, false],
    [false, true],
    [true, false],
    [true, true],
  ].map(([A, B]) => {
    const r = evaluarExpresion(expr, { A, B });
    if (!r.ok) throw new Error(`«${expr}» no se pudo evaluar: ${r.error}`);
    return r.valor ? 1 : 0;
  });
}

test.describe('Las siete puertas, en palabra', () => {
  test('AND, OR y NOT', () => {
    expect(tabla2('A AND B')).toEqual([0, 0, 0, 1]);
    expect(tabla2('A OR B')).toEqual([0, 1, 1, 1]);
    expect(tabla2('NOT A')).toEqual([1, 1, 0, 0]);
  });

  test('XOR — el hallazgo 135: devolvía [0,0,0,0] sin avisar', () => {
    expect(tabla2('A XOR B')).toEqual([0, 1, 1, 0]);
  });

  test('NAND, NOR y XNOR — el hallazgo 136: no se reconocían', () => {
    expect(tabla2('A NAND B')).toEqual([1, 1, 1, 0]);
    expect(tabla2('A NOR B')).toEqual([1, 0, 0, 0]);
    expect(tabla2('A XNOR B')).toEqual([1, 0, 0, 1]);
  });

  test('los símbolos dan lo mismo que las palabras', () => {
    expect(tabla2('A ⊕ B')).toEqual(tabla2('A XOR B'));
    expect(tabla2('A · B')).toEqual(tabla2('A AND B'));
    expect(tabla2('A + B')).toEqual(tabla2('A OR B'));
    expect(tabla2('¬A')).toEqual(tabla2('NOT A'));
    expect(tabla2('A & B')).toEqual(tabla2('A AND B'));
    expect(tabla2('A | B')).toEqual(tabla2('A OR B'));
  });
});

test.describe('Precedencia y asociatividad', () => {
  test('NOT se ata más fuerte que AND', () => {
    // NOT A AND B  =  (NOT A) AND B  → [0,1,0,0], no NOT(A AND B) = [1,1,1,0]
    expect(tabla2('NOT A AND B')).toEqual([0, 1, 0, 0]);
    expect(tabla2('NOT (A AND B)')).toEqual([1, 1, 1, 0]);
  });

  test('AND se ata más fuerte que OR', () => {
    // A OR B AND B = A OR (B AND B) = A OR B → [0,1,1,1]
    expect(tabla2('A OR B AND B')).toEqual([0, 1, 1, 1]);
    expect(tabla2('(A OR B) AND B')).toEqual([0, 1, 0, 1]);
  });

  test('XOR queda entre AND y OR', () => {
    // A XOR B AND B = A XOR (B AND B) = A XOR B → [0,1,1,0]
    expect(tabla2('A XOR B AND B')).toEqual([0, 1, 1, 0]);
  });

  test('XOR encadenado da la paridad impar (el otro caso del hallazgo 135)', () => {
    const filas = [
      [0, 0, 0], [0, 0, 1], [0, 1, 0], [0, 1, 1],
      [1, 0, 0], [1, 0, 1], [1, 1, 0], [1, 1, 1],
    ];
    const salida = filas.map(([a, b, c]) => {
      const r = evaluarExpresion('A XOR B XOR C', { A: !!a, B: !!b, C: !!c });
      if (!r.ok) throw new Error(r.error);
      return r.valor ? 1 : 0;
    });
    // Paridad impar: 1 cuando hay un número impar de entradas a 1
    expect(salida).toEqual([0, 1, 1, 0, 1, 0, 0, 1]);
  });
});

test.describe('Leyes conocidas, como prueba cruzada', () => {
  test('De Morgan', () => {
    expect(tabla2('NOT (A AND B)')).toEqual(tabla2('NOT A OR NOT B'));
    expect(tabla2('NOT (A OR B)')).toEqual(tabla2('NOT A AND NOT B'));
  });

  test('NAND y NOR son las negaciones de AND y OR', () => {
    expect(tabla2('A NAND B')).toEqual(tabla2('NOT (A AND B)'));
    expect(tabla2('A NOR B')).toEqual(tabla2('NOT (A OR B)'));
    expect(tabla2('A XNOR B')).toEqual(tabla2('NOT (A XOR B)'));
  });

  test('el XOR se puede escribir con AND, OR y NOT', () => {
    expect(tabla2('A XOR B')).toEqual(tabla2('(A OR B) AND NOT (A AND B)'));
  });
});

test.describe('Errores: se dicen, no se convierten en ceros', () => {
  const error = (expr: string) => {
    const r = evaluarExpresion(expr, { A: true, B: true });
    expect(r.ok, `«${expr}» debería fallar`).toBe(false);
    return r.ok ? '' : r.error;
  };

  test('variable fuera de A-D', () => {
    expect(error('A AND Z')).toContain('no es una variable válida');
  });

  test('paréntesis desbalanceados', () => {
    expect(error('(A AND B')).toContain('Falta cerrar');
    expect(error('A AND B)')).toContain('se cierra sin haberse abierto');
  });

  test('operador sin operandos', () => {
    expect(error('A AND')).toContain('termina antes de tiempo');
    expect(error('AND B')).toContain('Falta un operando');
  });

  test('dos términos sin operador entre medias', () => {
    expect(error('A B')).toContain('Falta un operador');
  });

  test('expresión vacía', () => {
    expect(error('')).toContain('Escribe una expresión');
  });
});

test.describe('extraerVariables', () => {
  test('no confunde las letras de los operadores con variables', () => {
    // El defecto: «A NAND B» daba [A, B, D, N] y pintaba 16 filas
    const r = extraerVariables('A NAND B');
    expect(r.ok && r.variables).toEqual(['A', 'B']);
  });

  test('devuelve las variables en orden y sin repetir', () => {
    const r = extraerVariables('C OR A AND C');
    expect(r.ok && r.variables).toEqual(['A', 'C']);
  });

  test('una expresión de constantes no tiene variables', () => {
    const r = extraerVariables('1 AND 0');
    expect(r.ok && r.variables).toEqual([]);
  });

  test('las constantes 0 y 1 se evalúan como tales', () => {
    const r = evaluarExpresion('1 AND NOT 0', {});
    expect(r.ok && r.valor).toBe(true);
  });
});
