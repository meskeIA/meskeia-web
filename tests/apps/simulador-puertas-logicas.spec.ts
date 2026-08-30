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

// ═══════════════════════════════════════════════════════════════════════════════
// RE-INSPECCIÓN 30/08/2026 — los tres casos del Inspector
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * La app se reparó el 23/08/2026 (tanda 3, hallazgos 135-140). Esta re-inspección
 * vuelve a resolver todo A MANO con álgebra de Boole ANTES de abrir el navegador y
 * compara; ningún valor de esta sección se ha copiado de la salida de la app.
 *
 * Orden de filas en todas las tablas: la primera variable es el bit MÁS significativo
 * (con A y B: 00, 01, 10, 11), que es la invariante que comparten los cuatro modos.
 *
 * CASO 1 · NORMAL — la puerta XOR y sus cuatro combinaciones, exigida en los TRES
 *   modos que la ofrecen, que deben coincidir entre sí.
 * CASO 2 · COMPUESTO Y LÍMITE — expresiones de varias puertas encadenadas, el máximo
 *   de 4 variables (16 filas), la puerta de una sola entrada y la precedencia.
 * CASO 3 · RECHAZO Y DEGENERADO — lo que la app NO debe evaluar: debe decir cuál es
 *   el problema en vez de pintar una columna de ceros (que es exactamente el defecto
 *   del hallazgo 135) ni quedarse en blanco.
 */

const TABLA_VERDAD = 'table[class*="__truthTable"]';
const BOTON_PUERTA = '[class*="__gateBtn"]';
const AVISO_EXPRESION = '[class*="__expressionError"]';

/** Símbolo con el que la app rotula cada puerta: «AND» a secas también casaría con NAND. */
const SIMBOLO_DE: Record<string, string> = {
  AND: '∧', OR: '∨', NOT: '¬', NAND: '⊼', NOR: '⊽', XOR: '⊕', XNOR: '⊙',
};

/** El banner global de transparencia es fijo y se solapa con los controles. */
async function abrirSimulador(
  page: import('@playwright/test').Page,
  modo?: 'Circuitos' | 'Expresiones' | 'Retos',
): Promise<void> {
  await page.addInitScript(() => {
    try { localStorage.setItem('meskeia_transparency_banner_dismissed', 'true'); } catch { /* modo privado */ }
  });
  await page.goto('/simulador-puertas-logicas/');
  if (modo) await page.getByRole('button', { name: new RegExp(modo) }).first().click();
}

const cabeceraDe = (page: import('@playwright/test').Page): Promise<string[]> =>
  page.locator(TABLA_VERDAD).first().locator('thead th').allInnerTexts();

const filasDeTabla = (page: import('@playwright/test').Page): Promise<string[][]> =>
  page.locator(TABLA_VERDAD).first().locator('tbody tr').evaluateAll((trs) =>
    trs.map((tr) => [...tr.querySelectorAll('td')].map((td) => td.textContent?.trim() ?? '')));

/** Columna de salida (la última) en 0/1, para poder leerla de un vistazo. */
async function columnaSalida(page: import('@playwright/test').Page): Promise<number[]> {
  return (await filasDeTabla(page)).map((f) => Number(f[f.length - 1]));
}

async function elegirPuerta(page: import('@playwright/test').Page, puerta: string): Promise<void> {
  await page.locator(BOTON_PUERTA)
    .filter({ hasText: new RegExp(`^${SIMBOLO_DE[puerta]}\\s*${puerta}$`) })
    .click();
}

// ───────────────────────────────────────────────────────────────────────────────
// CASO 1 · NORMAL — XOR, sus 4 combinaciones, en los tres modos que la ofrecen
// ───────────────────────────────────────────────────────────────────────────────
test.describe('RE-INSPECCIÓN · CASO 1 · la puerta XOR y sus cuatro combinaciones', () => {
  /**
   * XOR, de su definición: la salida es 1 cuando las entradas son DISTINTAS.
   *   A=0 B=0 → iguales   → 0
   *   A=0 B=1 → distintas → 1
   *   A=1 B=0 → distintas → 1
   *   A=1 B=1 → iguales   → 0
   */
  const XOR = [0, 1, 1, 0];
  /** XNOR es su complemento exacto (1 cuando son IGUALES): 1-x fila a fila. */
  const XNOR = [1, 0, 0, 1];

  test('modo Tablas de Verdad: XOR da 0,1,1,0 y XNOR es su complemento', async ({ page }) => {
    await abrirSimulador(page);

    await elegirPuerta(page, 'XOR');
    expect(await cabeceraDe(page)).toEqual(['A', 'B', 'Y']);
    expect(await columnaSalida(page)).toEqual(XOR);

    await elegirPuerta(page, 'XNOR');
    expect(await columnaSalida(page)).toEqual(XNOR);
    // Complementarias fila a fila, como afirma la FAQ de la propia app.
    expect(XNOR).toEqual(XOR.map((v) => 1 - v));
  });

  test('modo Expresiones: «A XOR B» da la misma tabla que la puerta', async ({ page }) => {
    await abrirSimulador(page, 'Expresiones');
    const campo = page.getByLabel('Expresión Booleana');

    await campo.fill('A XOR B');
    expect(await cabeceraDe(page)).toEqual(['A', 'B', 'Y']);
    expect(await columnaSalida(page)).toEqual(XOR);

    await campo.fill('A XNOR B');
    expect(await columnaSalida(page)).toEqual(XNOR);

    // Y la palabra en minúscula es la misma palabra.
    await campo.fill('a xor b');
    expect(await columnaSalida(page)).toEqual(XOR);
  });

  test('modo Circuitos: la suma del Half Adder ES un XOR', async ({ page }) => {
    await abrirSimulador(page, 'Circuitos');
    await page.getByRole('button', { name: 'Half Adder (Semisumador)' }).click();

    // S = A⊕B (columna 3) y C = A·B (columna 4). Sumar dos bits:
    //   0+0 = 0 → S0 C0 · 0+1 = 1 → S1 C0 · 1+0 = 1 → S1 C0 · 1+1 = 2 → S0 C1
    expect(await cabeceraDe(page)).toEqual(['A', 'B', 'S (Suma)', 'C (Acarreo)']);
    expect(await filasDeTabla(page)).toEqual([
      ['0', '0', '0', '0'],
      ['0', '1', '1', '0'],
      ['1', '0', '1', '0'],
      ['1', '1', '0', '1'],
    ]);
    // La columna S, leída sola, es exactamente la tabla del XOR de arriba.
    expect((await filasDeTabla(page)).map((f) => Number(f[2]))).toEqual(XOR);
  });

  test('las siete puertas del modo Tablas contra su definición', async ({ page }) => {
    await abrirSimulador(page);
    // Todas calculadas a mano desde el enunciado de cada puerta, filas 00,01,10,11.
    const CANONICAS: [string, number[]][] = [
      ['AND', [0, 0, 0, 1]],   // 1 solo si AMBAS son 1
      ['OR', [0, 1, 1, 1]],    // 1 si al menos una es 1
      ['NOT', [1, 0]],         // invierte (una sola entrada → 2 filas)
      ['NAND', [1, 1, 1, 0]],  // AND negada
      ['NOR', [1, 0, 0, 0]],   // OR negada
      ['XOR', [0, 1, 1, 0]],   // 1 si son distintas
      ['XNOR', [1, 0, 0, 1]],  // 1 si son iguales
    ];
    for (const [puerta, esperado] of CANONICAS) {
      await elegirPuerta(page, puerta);
      expect(await columnaSalida(page), `puerta ${puerta}`).toEqual(esperado);
    }
  });
});

// ───────────────────────────────────────────────────────────────────────────────
// CASO 2 · COMPUESTO Y LÍMITE — varias puertas encadenadas y el máximo de variables
// ───────────────────────────────────────────────────────────────────────────────
test.describe('RE-INSPECCIÓN · CASO 2 · circuitos compuestos y límites', () => {
  test('cuatro variables (el máximo) y tres puertas encadenadas', async ({ page }) => {
    await abrirSimulador(page, 'Expresiones');

    /**
     * (A NAND B) XOR (C NOR D) — 16 filas, el tope que admite la app.
     *
     * A mano, por partes:
     *   n = A NAND B = ¬(A·B) → (A,B)=00→1 · 01→1 · 10→1 · 11→0
     *   m = C NOR  D = ¬(C+D) → (C,D)=00→1 · 01→0 · 10→0 · 11→0
     *   Y = n ⊕ m (1 cuando n y m son distintos)
     * Los tres primeros bloques de cuatro filas comparten n=1, así que Y = ¬m = 0,1,1,1.
     * El último bloque (A=1,B=1) tiene n=0, así que Y = m = 1,0,0,0.
     */
    await page.getByLabel('Expresión Booleana').fill('(A NAND B) XOR (C NOR D)');
    expect(await cabeceraDe(page)).toEqual(['A', 'B', 'C', 'D', 'Y']);
    expect(await filasDeTabla(page)).toHaveLength(16); // 2⁴
    expect(await columnaSalida(page)).toEqual([
      0, 1, 1, 1, // A=0 B=0 → n=1
      0, 1, 1, 1, // A=0 B=1 → n=1
      0, 1, 1, 1, // A=1 B=0 → n=1
      1, 0, 0, 0, // A=1 B=1 → n=0
    ]);
  });

  test('la precedencia es NOT > AND/NAND > XOR/XNOR > OR/NOR', async ({ page }) => {
    await abrirSimulador(page, 'Expresiones');
    const campo = page.getByLabel('Expresión Booleana');

    // NOT antes que NAND:  NOT A NAND B  =  ¬( (¬A)·B )
    //   00: ¬A=1, B=0 → 1·0=0 → 1 · 01: 1·1=1 → 0 · 10: ¬A=0 → 0 → 1 · 11: 0 → 1
    await campo.fill('NOT A NAND B');
    expect(await columnaSalida(page)).toEqual([1, 0, 1, 1]);

    // AND antes que XOR:  A XOR B AND C  =  A ⊕ (B·C)
    //   000→0 · 001→0 · 010→0 · 011→0⊕1=1 · 100→1 · 101→1 · 110→1 · 111→1⊕1=0
    await campo.fill('A XOR B AND C');
    expect(await columnaSalida(page)).toEqual([0, 0, 0, 1, 1, 1, 1, 0]);

    // OR y NOR al mismo nivel, por la izquierda:  A OR B NOR C  =  ¬((A+B)+C)
    // Solo hay un 1: la fila 000, la única en la que no hay ningún uno que propagar.
    await campo.fill('A OR B NOR C');
    expect(await columnaSalida(page)).toEqual([1, 0, 0, 0, 0, 0, 0, 0]);

    // Doble negación: NOT NOT A vuelve a A.
    await campo.fill('NOT NOT A');
    expect(await columnaSalida(page)).toEqual([0, 1]);
  });

  test('NAND no es asociativa, y la app lo demuestra con su propio evaluador', async ({ page }) => {
    await abrirSimulador(page, 'Expresiones');
    const campo = page.getByLabel('Expresión Booleana');

    // El recuadro de errores frecuentes afirma que (A NAND B) NAND C ≠ A NAND (B NAND C).
    // Las dos tablas, a mano:
    //   izquierda  ¬(¬(A·B)·C) → 000:1 001:0 010:1 011:0 100:1 101:0 110:1 111:1
    //   derecha    ¬(A·¬(B·C)) → 000:1 001:1 010:1 011:1 100:0 101:0 110:0 111:1
    const IZQUIERDA = [1, 0, 1, 0, 1, 0, 1, 1];
    const DERECHA = [1, 1, 1, 1, 0, 0, 0, 1];

    await campo.fill('(A NAND B) NAND C');
    expect(await columnaSalida(page)).toEqual(IZQUIERDA);

    await campo.fill('A NAND (B NAND C)');
    expect(await columnaSalida(page)).toEqual(DERECHA);

    expect(IZQUIERDA).not.toEqual(DERECHA); // la afirmación del bloque educativo, comprobada

    // Sin paréntesis la app agrupa por la izquierda, como cualquier parser de precedencia.
    await campo.fill('A NAND B NAND C');
    expect(await columnaSalida(page)).toEqual(IZQUIERDA);
  });

  test('caso frontera del Full Adder: 1+1+1 = «11» en binario', async ({ page }) => {
    await abrirSimulador(page, 'Circuitos');
    await page.getByRole('button', { name: 'Full Adder (Sumador Completo)' }).click();

    const conmutadores = page.locator('[class*="__ioSwitch"]');
    const leds = () => page.locator('[class*="__ioLed"]')
      .evaluateAll((els) => els.map((e) => e.textContent?.match(/[01]/)?.[0]));

    await expect(conmutadores).toHaveCount(3);
    expect(await leds()).toEqual(['0', '0']); // 0+0+0 = 0 → S=0, Cout=0

    for (let i = 0; i < 3; i++) await conmutadores.nth(i).click();
    // 1+1+1 = 3, que en dos bits es «11»: suma 1 y acarreo 1.
    expect(await leds()).toEqual(['1', '1']);
    await expect(page.locator('tr[class*="__currentRow"]')).toHaveText('11111');
  });

  test('la puerta de una sola entrada tiene 2 filas y una sola columna de entrada', async ({ page }) => {
    await abrirSimulador(page);

    await elegirPuerta(page, 'NOT');
    expect(await cabeceraDe(page)).toEqual(['A', 'Y']); // sin columna B
    expect(await filasDeTabla(page)).toEqual([['0', '1'], ['1', '0']]);

    // Y en el modo Expresiones, igual: una variable → 2 filas.
    await page.getByRole('button', { name: /Expresiones/ }).first().click();
    await page.getByLabel('Expresión Booleana').fill('NOT A');
    expect(await cabeceraDe(page)).toEqual(['A', 'Y']);
    expect(await columnaSalida(page)).toEqual([1, 0]);
  });
});

// ───────────────────────────────────────────────────────────────────────────────
// CASO 3 · RECHAZO — lo que la app NO debe evaluar
// ───────────────────────────────────────────────────────────────────────────────
test.describe('RE-INSPECCIÓN · CASO 3 · lo que debe rechazarse', () => {
  test('cada expresión rota dice CUÁL es el problema y no pinta ninguna tabla', async ({ page }) => {
    await abrirSimulador(page, 'Expresiones');
    const campo = page.getByLabel('Expresión Booleana');

    // El hallazgo 135 (21/08/2026) era justo lo contrario: el fallo se tragaba en un catch
    // y salía una columna de ceros con pinta de resultado. Aquí se exige el mensaje.
    //
    // «A B» YA NO está en esta lista: con el AND implícito del hallazgo 534, dos variables
    // seguidas (con o sin espacio, el tokenizador los ignora) son «A AND B» válida, no un
    // error — está cubierto como caso positivo en el test 534 («AB»).
    const RECHAZOS: [string, string][] = [
      ['A AND', 'La expresión termina antes de tiempo.'],
      ['(A AND B', 'Falta cerrar un paréntesis.'],
      ['A AND E', '«E» no es una variable válida. Usa A, B, C o D.'],
      ['A # B', 'No entiendo el carácter «#».'],
      ['A AND B)', 'Hay un paréntesis que se cierra sin haberse abierto.'],
      ['A AND AND B', 'Falta un operando antes de «AND».'],
    ];

    for (const [expresion, mensaje] of RECHAZOS) {
      await campo.fill(expresion);
      await expect(page.locator(AVISO_EXPRESION), expresion).toHaveText(mensaje);
      // Y ninguna tabla: ni de ceros ni de nada.
      await expect(page.locator(TABLA_VERDAD), expresion).toHaveCount(0);
    }
  });

  test('el aviso es un role="alert" y desaparece al arreglar la expresión', async ({ page }) => {
    await abrirSimulador(page, 'Expresiones');
    const campo = page.getByLabel('Expresión Booleana');

    await campo.fill('A AND E');
    // Se filtra por la clase porque Next monta su propio role="alert" (el route announcer).
    await expect(page.locator(AVISO_EXPRESION)).toHaveAttribute('role', 'alert');
    await expect(page.locator(AVISO_EXPRESION)).toBeVisible();

    await campo.fill('A AND B');
    await expect(page.locator(AVISO_EXPRESION)).toHaveCount(0);
    expect(await columnaSalida(page)).toEqual([0, 0, 0, 1]); // AND: 1 solo si ambas son 1
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Reparados el 30/08/2026 (Inspector, ronda 8, hallazgos 533-535). Estaban con
// test.fail(); ahora sujetan la reparación como regresión.
// ═══════════════════════════════════════════════════════════════════════════════
test.describe('RE-INSPECCIÓN · hallazgos reparados', () => {
  test('533 · «Sintaxis válida» ya nombra NAND, NOR y XNOR', async ({ page }) => {
    await abrirSimulador(page, 'Expresiones');
    const campo = page.getByLabel('Expresión Booleana');

    // Las tres funcionan: comprobado a mano y en pantalla.
    await campo.fill('A NAND B');
    expect(await columnaSalida(page)).toEqual([1, 1, 1, 0]); // AND negada
    await campo.fill('A NOR B');
    expect(await columnaSalida(page)).toEqual([1, 0, 0, 0]); // OR negada
    await campo.fill('A XNOR B');
    expect(await columnaSalida(page)).toEqual([1, 0, 0, 1]); // 1 si son iguales

    // Pero el panel que se titula «Sintaxis válida» —y que por su título se lee como una
    // lista cerrada— solo nombra AND, OR, NOT y XOR. El <h1> promete las siete, el modo
    // Tablas ofrece las siete, la comparativa educativa compara las siete y el JSON-LD
    // anuncia «7 tipos de puertas lógicas»; la ayuda del modo Retos sí las lista todas.
    const ayuda = page.locator('[class*="__syntaxHelp"]');
    for (const operador of ['NAND', 'NOR', 'XNOR']) {
      await expect(ayuda, `«Sintaxis válida» debería nombrar ${operador}`).toContainText(operador);
    }
  });

  test('534 · los símbolos ⊼ ⊽ ⊙, la prima y el producto implícito ya se admiten', async ({ page }) => {
    await abrirSimulador(page, 'Expresiones');
    const campo = page.getByLabel('Expresión Booleana');

    // El modo Tablas rotula los botones «⊼ NAND», «⊽ NOR», «⊙ XNOR», y la comparativa
    // educativa repite esos mismos símbolos. Copiarlos aquí devuelve «No entiendo el
    // carácter «⊼»». El evaluador del modo Retos (motor-retos.ts) SÍ los acepta: dos
    // parsers distintos en la misma app, con sintaxis distinta y sin decírselo al usuario.
    await campo.fill('A ⊼ B');
    expect(await columnaSalida(page)).toEqual([1, 1, 1, 0]);
    await campo.fill('A ⊽ B');
    expect(await columnaSalida(page)).toEqual([1, 0, 0, 0]);
    await campo.fill('A ⊙ B');
    expect(await columnaSalida(page)).toEqual([1, 0, 0, 1]);

    // Lo mismo con la prima y el producto implícito, que la ayuda del modo Retos anuncia:
    await campo.fill("A'");
    expect(await columnaSalida(page)).toEqual([1, 0]);
    await campo.fill('AB');
    expect(await columnaSalida(page)).toEqual([0, 0, 0, 1]);
  });

  test('535 · una expresión sin variables ya da tabla (si es válida) o aviso (si está rota)', async ({ page }) => {
    await abrirSimulador(page, 'Expresiones');
    const campo = page.getByLabel('Expresión Booleana');

    // «NOT» a secas está tan rota como «A AND» —que sí avisa—, y el propio motor tiene
    // el mensaje preparado («La expresión termina antes de tiempo»): ahora se le pregunta.
    await campo.fill('NOT');
    await expect(page.locator(AVISO_EXPRESION), '«NOT» debería avisar como lo hace «A AND»').toHaveCount(1);

    // «1 AND 0» es una expresión VÁLIDA —el motor admite las constantes 0 y 1— cuyo
    // resultado es simplemente Y = 0. No hay variables que tabular, pero SÍ hay un
    // resultado que dar: se muestra como una tabla de una fila, sin columnas de entrada.
    await campo.fill('1 AND 0');
    await expect(page.locator(AVISO_EXPRESION)).toHaveCount(0);
    expect(await columnaSalida(page)).toEqual([0]);
  });
});
