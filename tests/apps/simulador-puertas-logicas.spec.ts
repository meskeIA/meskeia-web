import { test, expect } from '@playwright/test';
import {
  analizar,
  contarOperadores,
  corregirIntento,
  evaluar,
  filaDeIndice,
  operadoresUsados,
  tablaDeVerdad,
  RETOS,
  type Reto,
} from '../../app/simulador-puertas-logicas/motor-retos';

/**
 * Simulador de Puertas Lógicas — modo Retos (18/08/2026)
 *
 * La app más fuerte del clúster STEM (333 clics y 4.648 impresiones en 90 días, GSC).
 * El modo Retos corrige lo que escribe el usuario, así que un fallo aquí no se ve: la
 * app seguiría cargando y respondiendo, pero daría por buena una solución mala. Por eso
 * el motor está fuera de page.tsx y se prueba aquí sin navegador.
 *
 * CÓMO SE DERIVA CADA VALOR ESPERADO
 *   Las tablas de verdad se escriben con la primera variable como bit más significativo,
 *   igual que en el resto del simulador: con A y B, las filas van 00, 01, 10, 11.
 *   Cada salida esperada de este fichero está calculada a mano a partir de la definición
 *   del operador, NUNCA copiada de lo que devuelve la app.
 *
 *   Ejemplo, XOR («las entradas son distintas»):
 *     A=0 B=0 → iguales   → 0
 *     A=0 B=1 → distintas → 1
 *     A=1 B=0 → distintas → 1
 *     A=1 B=1 → iguales   → 0     =>  [0,1,1,0]
 *
 * CONTEO DE OPERADORES: cada NOT y cada operador binario del árbol suma 1. No es el
 * número de puertas físicas de un circuito, donde una señal intermedia se reparte a
 * varias entradas (el XOR con NAND son 5 operadores escritos y 4 puertas construidas).
 */

// Atajo: tabla de verdad de una expresión, en 0/1 para poder leerla de un vistazo.
const tabla = (expr: string, variables: string[]): number[] =>
  tablaDeVerdad(analizar(expr), variables).map((b) => (b ? 1 : 0));

// ============================================================
// CASO 1 — Los siete operadores, contra su definición
// ============================================================
test.describe('Operadores básicos', () => {
  test('cada operador reproduce su tabla de verdad canónica', () => {
    // Calculadas a mano desde la definición de cada puerta.
    expect(tabla('A AND B', ['A', 'B'])).toEqual([0, 0, 0, 1]); // 1 solo si ambas son 1
    expect(tabla('A OR B', ['A', 'B'])).toEqual([0, 1, 1, 1]); // 1 si alguna es 1
    expect(tabla('A XOR B', ['A', 'B'])).toEqual([0, 1, 1, 0]); // 1 si son distintas
    expect(tabla('A NAND B', ['A', 'B'])).toEqual([1, 1, 1, 0]); // AND negada
    expect(tabla('A NOR B', ['A', 'B'])).toEqual([1, 0, 0, 0]); // OR negada
    expect(tabla('A XNOR B', ['A', 'B'])).toEqual([1, 0, 0, 1]); // 1 si son iguales
    expect(tabla('NOT A', ['A'])).toEqual([1, 0]); // invierte
  });

  test('NAND y NOR son la negación exacta de AND y OR', () => {
    const and = tabla('A AND B', ['A', 'B']);
    const nand = tabla('A NAND B', ['A', 'B']);
    expect(nand).toEqual(and.map((v) => 1 - v));

    const or = tabla('A OR B', ['A', 'B']);
    const nor = tabla('A NOR B', ['A', 'B']);
    expect(nor).toEqual(or.map((v) => 1 - v));
  });

  test('las leyes de De Morgan se cumplen fila a fila', () => {
    // NOT(A AND B) == (NOT A) OR (NOT B)
    expect(tabla('NOT (A AND B)', ['A', 'B'])).toEqual(tabla('(NOT A) OR (NOT B)', ['A', 'B']));
    // NOT(A OR B) == (NOT A) AND (NOT B)
    expect(tabla('NOT (A OR B)', ['A', 'B'])).toEqual(tabla('(NOT A) AND (NOT B)', ['A', 'B']));
  });
});

// ============================================================
// CASO 2 — Precedencia y notación
// ============================================================
test.describe('Parser', () => {
  test('AND liga más fuerte que OR', () => {
    // A + B·C : con A=1,B=0,C=0 debe dar 1. Si OR ligara antes, (A+B)·C daría 0.
    expect(evaluar(analizar('A OR B AND C'), { A: true, B: false, C: false })).toBe(true);
    expect(tabla('A OR B AND C', ['A', 'B', 'C'])).toEqual(tabla('A OR (B AND C)', ['A', 'B', 'C']));
  });

  test('NOT liga más fuerte que AND', () => {
    // NOT A AND B  ==  (NOT A) AND B  →  solo 1 con A=0, B=1 → fila 01
    expect(tabla('NOT A AND B', ['A', 'B'])).toEqual([0, 1, 0, 0]);
  });

  test('XOR queda entre AND y OR', () => {
    // AND liga más que XOR, y XOR más que OR: NOT > AND > XOR > OR.
    expect(tabla('A AND B XOR C', ['A', 'B', 'C'])).toEqual(tabla('(A AND B) XOR C', ['A', 'B', 'C']));
    expect(tabla('A XOR B OR C', ['A', 'B', 'C'])).toEqual(tabla('(A XOR B) OR C', ['A', 'B', 'C']));
    // Y no al revés: agrupar el OR primero da otra tabla.
    expect(tabla('A XOR B OR C', ['A', 'B', 'C'])).not.toEqual(tabla('A XOR (B OR C)', ['A', 'B', 'C']));
  });

  test('el producto implícito AB equivale a A AND B', () => {
    expect(tabla('AB', ['A', 'B'])).toEqual([0, 0, 0, 1]);
    expect(tabla('A(B OR C)', ['A', 'B', 'C'])).toEqual(tabla('A AND (B OR C)', ['A', 'B', 'C']));
  });

  test('la prima y los símbolos son sinónimos de las palabras', () => {
    expect(tabla("A'", ['A'])).toEqual([1, 0]); // A' == NOT A
    expect(tabla('A·B', ['A', 'B'])).toEqual(tabla('A AND B', ['A', 'B']));
    expect(tabla('A+B', ['A', 'B'])).toEqual(tabla('A OR B', ['A', 'B']));
    expect(tabla('!A+B', ['A', 'B'])).toEqual(tabla('NOT A OR B', ['A', 'B']));
    expect(tabla("A'B'", ['A', 'B'])).toEqual(tabla('(NOT A) AND (NOT B)', ['A', 'B']));
  });

  test('NAND no se confunde con AND ni con NOT seguido de AND', () => {
    // Si el tokenizador leyera N-A-N-D como variables, la tabla no sería la de NAND.
    expect(tabla('A NAND B', ['A', 'B'])).toEqual([1, 1, 1, 0]);
    expect(operadoresUsados(analizar('A NAND B'))).toEqual(new Set(['NAND']));
    expect(operadoresUsados(analizar('A AND B'))).toEqual(new Set(['AND']));
  });

  test('rechaza lo que no es una expresión', () => {
    expect(() => analizar('')).toThrow();
    expect(() => analizar('A AND')).toThrow();
    expect(() => analizar('(A AND B')).toThrow();
    expect(() => analizar('A B)')).toThrow();
    expect(() => analizar('A # B')).toThrow();
  });
});

// ============================================================
// CASO 3 — Conteo de operadores
// ============================================================
test.describe('Conteo de operadores', () => {
  test('cuenta un nodo por operador, NOT incluido', () => {
    expect(contarOperadores(analizar('A'))).toBe(0); // una variable no es una puerta
    expect(contarOperadores(analizar('NOT A'))).toBe(1);
    expect(contarOperadores(analizar('A AND B'))).toBe(1);
    expect(contarOperadores(analizar('A AND B AND C'))).toBe(2); // dos AND de 2 entradas
    expect(contarOperadores(analizar('NOT A OR B'))).toBe(2); // NOT + OR
    expect(contarOperadores(analizar('(A AND B) OR (A AND C) OR (B AND C)'))).toBe(5); // 3 AND + 2 OR
  });

  test('los subárboles repetidos se cuentan cada vez (no hay reutilización de señal)', () => {
    // El XOR con NAND se construye con 4 puertas reutilizando A NAND B, pero escrito
    // como expresión tiene 5 operadores. La app cuenta lo escrito, y así lo explica.
    expect(contarOperadores(analizar('(A NAND (A NAND B)) NAND (B NAND (A NAND B))'))).toBe(5);
  });
});

// ============================================================
// CASO 4 — El catálogo de retos es coherente consigo mismo
// ============================================================
test.describe('Catálogo de retos', () => {
  test('no hay identificadores repetidos', () => {
    const ids = RETOS.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  for (const reto of RETOS) {
    test(`«${reto.nombre}»: la solución de referencia resuelve el reto`, () => {
      // Si esto falla, la app estaría enseñando una solución que no cumple su enunciado.
      const correccion = corregirIntento(reto.referencia, reto);
      expect(correccion.error).toBeUndefined();
      expect(correccion.resuelto).toBe(true);
      expect(correccion.aciertos).toBe(reto.salidas.length);
    });

    test(`«${reto.nombre}»: la referencia usa los operadores declarados`, () => {
      expect(contarOperadores(analizar(reto.referencia))).toBe(reto.operadoresReferencia);
      if (reto.permitidos) {
        const usados = [...operadoresUsados(analizar(reto.referencia))];
        expect(usados.every((op) => reto.permitidos?.includes(op))).toBe(true);
      }
    });

    test(`«${reto.nombre}»: la tabla objetivo tiene 2^n filas`, () => {
      expect(reto.salidas.length).toBe(2 ** reto.variables.length);
      expect(new Set(reto.variables).size).toBe(reto.variables.length);
    });
  }
});

// ============================================================
// CASO 5 — Las tablas objetivo, recalculadas a mano aquí
// ============================================================
test.describe('Tablas objetivo de los retos', () => {
  const objetivo = (id: string): Reto => {
    const reto = RETOS.find((r) => r.id === id);
    if (!reto) throw new Error(`No existe el reto ${id}`);
    return reto;
  };
  const como01 = (reto: Reto): number[] => reto.salidas.map((b) => (b ? 1 : 0));

  test('implicación A→B: solo falla con A=1, B=0', () => {
    // 00→1 (premisa falsa), 01→1, 10→0 (única violación), 11→1
    expect(como01(objetivo('implicacion'))).toEqual([1, 1, 0, 1]);
  });

  test('comparador A>B: solo 1 en la fila 10', () => {
    expect(como01(objetivo('comparador-mayor'))).toEqual([0, 0, 1, 0]);
  });

  test('votación por mayoría: 1 en las cuatro filas con dos o más unos', () => {
    // 000→0 · 001→0 · 010→0 · 011→1 · 100→0 · 101→1 · 110→1 · 111→1
    expect(como01(objetivo('mayoria-3'))).toEqual([0, 0, 0, 1, 0, 1, 1, 1]);
  });

  test('paridad impar: 1 cuando el número de unos es impar', () => {
    // 000(0 unos)→0 · 001(1)→1 · 010(1)→1 · 011(2)→0 · 100(1)→1 · 101(2)→0 · 110(2)→0 · 111(3)→1
    expect(como01(objetivo('paridad-impar'))).toEqual([0, 1, 1, 0, 1, 0, 0, 1]);
  });

  test('multiplexor: copia A mientras S=0 y B cuando S=1', () => {
    const reto = objetivo('multiplexor');
    expect(reto.variables).toEqual(['S', 'A', 'B']); // el orden fija la lectura de las filas
    // S=0 → salida = A:  000→0 · 001→0 · 010→1 · 011→1
    // S=1 → salida = B:  100→0 · 101→1 · 110→0 · 111→1
    expect(como01(reto)).toEqual([0, 0, 1, 1, 0, 1, 0, 1]);
  });

  test('las tablas de los retos de conversión son las de la puerta que imitan', () => {
    expect(como01(objetivo('not-con-nand'))).toEqual([1, 0]);
    expect(como01(objetivo('and-con-nand'))).toEqual([0, 0, 0, 1]);
    expect(como01(objetivo('or-con-nor'))).toEqual([0, 1, 1, 1]);
    expect(como01(objetivo('xor-con-nand'))).toEqual([0, 1, 1, 0]);
  });
});

// ============================================================
// CASO 6 — El corrector
// ============================================================
test.describe('Corrección de intentos', () => {
  const xorNand = RETOS.find((r) => r.id === 'xor-con-nand')!;
  const mayoria = RETOS.find((r) => r.id === 'mayoria-3')!;

  test('una solución equivalente pero distinta también se acepta', () => {
    // XNOR negada es XOR: otra forma de llegar a la misma tabla.
    const reto = RETOS.find((r) => r.id === 'implicacion')!;
    const c = corregirIntento('NOT (A AND NOT B)', reto); // De Morgan sobre NOT A OR B
    expect(c.resuelto).toBe(true);
    expect(c.operadores).toBe(3); // más larga que la referencia (2), pero válida
    expect(c.optimo).toBe(false);
  });

  test('marca exactamente las filas que fallan', () => {
    // NAND = [1,1,1,0] frente al objetivo XOR = [0,1,1,0]: coinciden en todo salvo en
    // la fila 00, donde NAND da 1 y se espera 0. Son 3 aciertos de 4.
    const c = corregirIntento('A NAND B', xorNand);
    expect(c.valida).toBe(true);
    expect(c.resuelto).toBe(false);
    expect(c.aciertos).toBe(3);
    expect(c.filas.map((f) => f.acierta)).toEqual([false, true, true, true]);
    expect(c.filas[0].obtenido).toBe(true);
    expect(c.filas[0].esperado).toBe(false);
  });

  test('rechaza los operadores que el reto no permite', () => {
    const c = corregirIntento('A XOR B', xorNand); // resolvería la tabla, pero hace trampa
    expect(c.valida).toBe(false);
    expect(c.resuelto).toBe(false);
    expect(c.error).toContain('NAND');
  });

  test('rechaza variables que no son del reto', () => {
    const c = corregirIntento('A AND Z', mayoria);
    expect(c.valida).toBe(false);
    expect(c.error).toContain('Z');
  });

  test('una expresión inválida no rompe la corrección', () => {
    const c = corregirIntento('A AND', mayoria);
    expect(c.valida).toBe(false);
    expect(c.error).toBeTruthy();
    expect(c.filas).toEqual([]);
  });

  test('resolver con menos operadores que la referencia cuenta como óptimo', () => {
    // La referencia de la mayoría usa 5; esta forma factorizada usa 4.
    const c = corregirIntento('(A AND (B OR C)) OR (B AND C)', mayoria);
    expect(c.resuelto).toBe(true);
    expect(c.operadores).toBe(4);
    expect(c.optimo).toBe(true);
  });
});

// ============================================================
// CASO 7 — Orden de las filas (invariante compartida con el simulador)
// ============================================================
test('la primera variable es el bit más significativo', () => {
  expect(filaDeIndice(['A', 'B'], 0)).toEqual([false, false]);
  expect(filaDeIndice(['A', 'B'], 1)).toEqual([false, true]);
  expect(filaDeIndice(['A', 'B'], 2)).toEqual([true, false]);
  expect(filaDeIndice(['A', 'B'], 3)).toEqual([true, true]);
  expect(filaDeIndice(['A', 'B', 'C'], 5)).toEqual([true, false, true]); // 5 = 101
});

// ============================================================
// CASO 8 — La vista del modo Retos, en el navegador
// ============================================================
// A partir de aquí hace falta el servidor: lo levanta la propia configuración de
// Playwright. Lo anterior es motor puro y corre sin navegador.
test.describe('Modo Retos en la página', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/simulador-puertas-logicas/');
    await page.getByRole('button', { name: /Retos/ }).click();
  });

  test('muestra el primer reto con su restricción', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Del enunciado al circuito' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Invertir con una sola NAND' })).toBeVisible();
    await expect(page.getByText('Solo puedes usar:')).toBeVisible();
  });

  test('resolver un reto lo suma al contador', async ({ page }) => {
    await page.getByLabel('Tu expresión').fill('A NAND A');
    await page.getByRole('button', { name: 'Comprobar' }).click();

    const veredicto = page.getByRole('status');
    await expect(veredicto).toContainText('Resuelto');
    await expect(veredicto).toContainText('1 operador');
    await expect(page.getByText(`Resueltos: 1 de ${RETOS.length}`)).toBeVisible();
  });

  test('la solución que salta la restricción se rechaza aunque dé la tabla', async ({ page }) => {
    await page.getByRole('button', { name: /XOR usando solo NAND/ }).click();
    await page.getByLabel('Tu expresión').fill('A XOR B');
    await page.getByRole('button', { name: 'Comprobar' }).click();

    const veredicto = page.getByRole('status');
    await expect(veredicto).toContainText('No se puede evaluar');
    await expect(veredicto).toContainText('NAND');
  });

  test('un intento parcial señala las filas falladas en la tabla', async ({ page }) => {
    await page.getByRole('button', { name: /Votación por mayoría/ }).click();
    await page.getByLabel('Tu expresión').fill('A AND B');
    await page.getByRole('button', { name: 'Comprobar' }).click();

    // A·B acierta 6 de las 8 filas de la mayoría: falla en 011 y en 101.
    await expect(page.getByRole('status')).toContainText('Aciertas 6 de 8 filas');
    await expect(page.getByText('(tú: 0)')).toHaveCount(2);
  });

  test('reconoce una solución más corta que la de referencia', async ({ page }) => {
    await page.getByRole('button', { name: /Votación por mayoría/ }).click();
    await page.getByLabel('Tu expresión').fill('(A AND (B OR C)) OR (B AND C)');
    await page.getByRole('button', { name: 'Comprobar' }).click();

    const veredicto = page.getByRole('status');
    await expect(veredicto).toContainText('4 operadores');
    await expect(veredicto).toContainText('la tuya es más corta');
  });

  test('cambiar de reto limpia el intento anterior', async ({ page }) => {
    await page.getByLabel('Tu expresión').fill('A NAND A');
    await page.getByRole('button', { name: 'Comprobar' }).click();
    await expect(page.getByRole('status')).toBeVisible();

    await page.getByRole('button', { name: /Multiplexor 2 a 1/ }).click();
    await expect(page.getByRole('status')).toHaveCount(0);
    await expect(page.getByLabel('Tu expresión')).toHaveValue('');
  });

  test('los cuatro modos son excluyentes y anuncian su estado', async ({ page }) => {
    for (const modo of ['Tablas de Verdad', 'Circuitos', 'Expresiones', 'Retos']) {
      const boton = page.getByRole('button', { name: new RegExp(modo) }).first();
      await boton.click();
      await expect(boton).toHaveAttribute('aria-pressed', 'true');
    }
  });

  test('el veredicto tiene fondo propio en modo oscuro', async ({ page }) => {
    await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
    await page.getByLabel('Tu expresión').fill('A NAND A');
    await page.getByRole('button', { name: 'Comprobar' }).click();

    const fondo = await page.getByRole('status').evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(fondo).not.toBe('rgba(0, 0, 0, 0)');
  });
});
