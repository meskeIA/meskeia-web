import { test, expect, devices, type Page } from '@playwright/test';
import { PUERTO } from './_puerto';
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

// Al NIVEL DEL FICHERO porque `launchOptions` fuerza un worker nuevo: mapea meskeia.com al
// servidor local para que el bloque de <ZonaHerramienta> (16/10/2026, al final) vea un host de
// producción y emita `evt:primer-uso`. Al resto de tests no les afecta: van a localhost.
test.use({ launchOptions: { args: [`--host-resolver-rules=MAP meskeia.com 127.0.0.1:${PUERTO}`] } });

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
    // De Morgan sobre la referencia NOT A OR B: NOT (A AND NOT B) da la misma tabla [1,1,0,1].
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

    // REPARADO el 30/08/2026 (d749e6ac): el panel que se titula «Sintaxis válida» —y que por
    // su título se lee como una lista cerrada— solo nombraba AND, OR, NOT y XOR, mientras el
    // <h1>, el modo Tablas, la comparativa educativa y el JSON-LD presentaban las siete.
    const ayuda = page.locator('[class*="__syntaxHelp"]');
    for (const operador of ['NAND', 'NOR', 'XNOR']) {
      await expect(ayuda, `«Sintaxis válida» debería nombrar ${operador}`).toContainText(operador);
    }
  });

  test('534 · los símbolos ⊼ ⊽ ⊙, la prima y el producto implícito ya se admiten', async ({ page }) => {
    await abrirSimulador(page, 'Expresiones');
    const campo = page.getByLabel('Expresión Booleana');

    // REPARADO el 30/08/2026 (d749e6ac): el modo Tablas rotula los botones «⊼ NAND», «⊽ NOR»,
    // «⊙ XNOR», y copiarlos aquí devolvía «No entiendo el carácter «⊼»», mientras el evaluador
    // del modo Retos (motor-retos.ts) sí los aceptaba: dos parsers con sintaxis distinta en la
    // misma app. Hoy motor.ts admite lo mismo que motor-retos.ts.
    await campo.fill('A ⊼ B');
    expect(await columnaSalida(page)).toEqual([1, 1, 1, 0]);
    await campo.fill('A ⊽ B');
    expect(await columnaSalida(page)).toEqual([1, 0, 0, 0]);
    await campo.fill('A ⊙ B');
    expect(await columnaSalida(page)).toEqual([1, 0, 0, 1]);

    // Lo mismo con la prima y el producto implícito, que la ayuda del modo Retos anuncia
    // (también rechazados hasta el 30/08/2026):
    await campo.fill("A'");
    expect(await columnaSalida(page)).toEqual([1, 0]);
    await campo.fill('AB');
    expect(await columnaSalida(page)).toEqual([0, 0, 0, 1]);
  });

  test('535 · una expresión sin variables ya da tabla (si es válida) o aviso (si está rota)', async ({ page }) => {
    await abrirSimulador(page, 'Expresiones');
    const campo = page.getByLabel('Expresión Booleana');

    // REPARADO el 30/08/2026 (d749e6ac): «NOT» a secas, tan rota como «A AND», no avisaba
    // porque page.tsx cortaba antes de preguntar al motor cuando no había variables. Ahora se
    // le pregunta, y el motor contesta «La expresión termina antes de tiempo».
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

// ═══════════════════════════════════════════════════════════════════════════════
// RE-INSPECCIÓN 16/10/2026 — tras el piloto de «primer uso» (3d5c5db0), el contraste de las
// cabeceras (b7733c6d) y las relacionadas servidas por el layout (99e1ee7e)
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * Todo resuelto A MANO antes de abrir el navegador; ningún valor copiado de la app.
 * Filas con la primera variable como bit MÁS significativo, como en el resto del fichero.
 *
 * CASO 1 · NORMAL (escritorio) — paridad de 4 bits con tres XOR en cascada (lo que afirma la
 *   tarjeta «Técnico en electrónica» del bloque educativo), un XNOR con prima y producto
 *   implícito, y dos circuitos conmutados a mano: multiplexor 2:1 y comparador de 1 bit.
 * CASO 2 · LÍMITE (móvil 360×740, táctil) — el decodificador 2:4 con el dedo, expresiones sin
 *   ninguna variable (solo constantes), la doble prima y un reto resuelto desde el móvil.
 * CASO 3 · RECHAZO — expresiones rotas que deben avisar sin pintar tabla y, en Retos, un
 *   operador prohibido, una variable ajena y una expresión incompleta.
 * Y además: <ZonaHerramienta> (evt:primer-uso, con /api/analytics interceptado: nada llega a
 * Turso), el contraste de las tablas de verdad y el contenido (bloque educativo, FAQPage y
 * featureList). Los hallazgos abiertos van con test.fail(): afirman lo correcto y hoy fallan.
 */

const MOVIL_360 = {
  viewport: { width: 360, height: 740 },
  userAgent: devices['Pixel 7'].userAgent,
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
};

type Modo = 'Tablas de Verdad' | 'Circuitos' | 'Expresiones' | 'Retos';

/** Pulsa un modo y espera a que quede pulsado: un clic antes de hidratar no hace nada. */
async function elegirModo(page: Page, modo: Modo, conDedo = false): Promise<void> {
  const boton = page.getByRole('button', { name: new RegExp(modo) }).first();
  await expect(async () => {
    if (conDedo) await boton.tap(); else await boton.click();
    await expect(boton).toHaveAttribute('aria-pressed', 'true', { timeout: 1000 });
  }).toPass({ timeout: 15000 });
}

/** Los valores 0/1 de los LED de salida (solo el valor: el rótulo «Y1» también lleva cifras). */
const valoresLed = (page: Page): Promise<string[]> =>
  page.locator('[class*="__ioLed"] [class*="__ioValue"]').allInnerTexts();

const FILA_ACTUAL = 'tr[class*="__currentRow"]';
const VEREDICTO = '[class*="__retoVeredicto"]';

async function abrirGuiaEducativa(page: Page): Promise<void> {
  const boton = page.getByRole('button', { name: /Ver guía educativa/ });
  await expect(async () => {
    await boton.click();
    await expect(page.getByRole('heading', { name: 'Casos de Uso por Perfil' })).toBeVisible({ timeout: 1000 });
  }).toPass({ timeout: 15000 });
}

// ───────────────────────────────────────────────────────────────────────────────
// CASO 1 · NORMAL (escritorio)
// ───────────────────────────────────────────────────────────────────────────────
test.describe('16/10 · CASO 1 · normal, en escritorio', () => {
  test('paridad de 4 bits: A ⊕ B ⊕ C ⊕ D vale 1 cuando el número de unos es impar', async ({ page }) => {
    await abrirSimulador(page);
    await elegirModo(page, 'Expresiones');
    await page.getByLabel('Expresión Booleana').fill('A ⊕ B ⊕ C ⊕ D');

    // A mano, contando los unos de ABCD de 0000 a 1111 (impar → 1):
    //   0000:0→0 0001:1→1 0010:1→1 0011:2→0 0100:1→1 0101:2→0 0110:2→0 0111:3→1
    //   1000:1→1 1001:2→0 1010:2→0 1011:3→1 1100:2→0 1101:3→1 1110:3→1 1111:4→0
    // Es la afirmación del bloque educativo: «3 puertas XOR en cascada» dan la paridad de 4 bits.
    expect(await cabeceraDe(page)).toEqual(['A', 'B', 'C', 'D', 'Y']);
    expect(await columnaSalida(page)).toEqual([0, 1, 1, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 1, 1, 0]);
  });

  test("XNOR con prima y producto implícito: A'B ⊙ C", async ({ page }) => {
    await abrirSimulador(page);
    await elegirModo(page, 'Expresiones');
    await page.getByLabel('Expresión Booleana').fill("A'B ⊙ C");

    // El AND implícito liga más que XNOR: (A'·B) ⊙ C, y ⊙ vale 1 cuando los dos lados son iguales.
    //   000: A'B=0, C=0 → 1 · 001: 0 vs 1 → 0 · 010: A'B=1, C=0 → 0 · 011: 1 vs 1 → 1
    //   100: A'=0 → A'B=0, C=0 → 1 · 101: 0 vs 1 → 0 · 110: 0 vs 0 → 1 · 111: 0 vs 1 → 0
    expect(await cabeceraDe(page)).toEqual(['A', 'B', 'C', 'Y']);
    expect(await columnaSalida(page)).toEqual([1, 0, 0, 1, 1, 0, 1, 0]);
  });

  test('multiplexor 2:1 conmutado a mano: Y copia D1 con S=1 y D0 con S=0', async ({ page }) => {
    await abrirSimulador(page);
    await elegirModo(page, 'Circuitos');
    await page.getByRole('button', { name: 'Multiplexor 2:1' }).click();
    const conmutadores = page.locator('[class*="__ioSwitch"]'); // D0, D1, S

    // Y = S ? D1 : D0. La fila resaltada se lee D0 D1 S | Y.
    await conmutadores.nth(0).click(); // D0 = 1
    await conmutadores.nth(2).click(); // S = 1  → copia D1 = 0
    expect(await valoresLed(page)).toEqual(['0']);
    await expect(page.locator(FILA_ACTUAL)).toHaveText('1010');

    await conmutadores.nth(1).click(); // D1 = 1 → copia D1 = 1
    expect(await valoresLed(page)).toEqual(['1']);
    await expect(page.locator(FILA_ACTUAL)).toHaveText('1111');

    await conmutadores.nth(2).click(); // S = 0  → copia D0 = 1
    expect(await valoresLed(page)).toEqual(['1']);
    await expect(page.locator(FILA_ACTUAL)).toHaveText('1101');
  });

  test('comparador de 1 bit con A=0 y B=1: solo se enciende «A < B»', async ({ page }) => {
    await abrirSimulador(page);
    await elegirModo(page, 'Circuitos');
    await page.getByRole('button', { name: 'Comparador 1-bit' }).click();
    await page.locator('[class*="__ioSwitch"]').nth(1).click(); // B = 1

    // Salidas en orden A>B, A=B, A<B. Con 0 frente a 1: 0, 0, 1. Fila «01» + «001».
    expect(await valoresLed(page)).toEqual(['0', '0', '1']);
    await expect(page.locator(FILA_ACTUAL)).toHaveText('01001');
  });
});

// ───────────────────────────────────────────────────────────────────────────────
// CASO 2 · LÍMITE, en móvil (360×740, táctil)
// ───────────────────────────────────────────────────────────────────────────────
test.describe('16/10 · CASO 2 · límite, en móvil (360×740, táctil)', () => {
  test.use(MOVIL_360);

  test('decodificador 2:4 con el dedo: A1=1 activa Y2 y luego A0=1 activa Y3', async ({ page }) => {
    await abrirSimulador(page);
    await elegirModo(page, 'Circuitos', true);
    await page.getByRole('button', { name: 'Decodificador 2:4' }).tap();
    const conmutadores = page.locator('[class*="__ioSwitch"]'); // A1, A0

    // Se activa la salida número 2·A1 + A0, y solo esa.
    expect(await valoresLed(page)).toEqual(['1', '0', '0', '0']); // 00 → 0 → Y0
    await conmutadores.nth(0).tap(); // A1 = 1 → 2 → Y2
    expect(await valoresLed(page)).toEqual(['0', '0', '1', '0']);
    await expect(page.locator(FILA_ACTUAL)).toHaveText('100010');
    await conmutadores.nth(1).tap(); // A0 = 1 → 3 → Y3
    expect(await valoresLed(page)).toEqual(['0', '0', '0', '1']);
    await expect(page.locator(FILA_ACTUAL)).toHaveText('110001');
  });

  test('sin variables: constantes y doble prima', async ({ page }) => {
    await abrirSimulador(page);
    await elegirModo(page, 'Expresiones', true);
    const campo = page.getByLabel('Expresión Booleana');

    // 1 ⊕ 1: las dos entradas son iguales → 0. Sin variables: una fila y solo la columna Y.
    await campo.fill('1 XOR 1');
    expect(await cabeceraDe(page)).toEqual(['Y']);
    expect(await filasDeTabla(page)).toEqual([['0']]);

    // NOT liga más que NAND: (¬0) ⊼ 1 = 1 ⊼ 1 = ¬(1·1) = 0.
    await campo.fill('NOT 0 NAND 1');
    expect(await filasDeTabla(page)).toEqual([['0']]);

    // Doble prima: ¬¬A = A → 0, 1.
    await campo.fill("A''");
    expect(await columnaSalida(page)).toEqual([0, 1]);
  });

  test('el reto de paridad impar se resuelve desde el móvil con 2 operadores', async ({ page }) => {
    await abrirSimulador(page);
    await elegirModo(page, 'Retos', true);
    await page.getByRole('button', { name: /Paridad impar/ }).tap();
    await page.getByLabel('Tu expresión').fill('A^B^C');
    await page.getByRole('button', { name: 'Comprobar' }).tap();

    // A⊕B⊕C es 1 con un número impar de unos: es la tabla del reto. Dos «^» = dos operadores,
    // los mismos que la referencia «A XOR B XOR C».
    const veredicto = page.locator(VEREDICTO);
    await expect(veredicto).toContainText('Resuelto.');
    await expect(veredicto).toContainText('con 2 operadores');
    await expect(veredicto).toContainText('Es la misma longitud que nuestra solución de referencia.');
    await expect(page.getByText('Resueltos: 1 de 9')).toBeVisible(); // 9 retos en motor-retos.ts
  });

  // HALLAZGO ABIERTO (16/10/2026). A 360×740 el selector de modo se apila en una columna de
  // 388 px (4 botones de ~85 px) y la herramienta empieza en y≈1008. Al tocar «Circuitos» lo
  // que cambia (el selector de circuito, y≈996) queda por debajo de la pantalla: lo único que
  // se ve es el borde del botón. Medido en la inspección: top 996 px con 740 px de alto.
  // REPARADO (hallazgo 3352, 17/10/2026): tras tocar un modo, si su contenido empieza en el último
  // cuarto de la pantalla o más abajo, la página se desplaza (con suavidad: por eso se sondea).
  test('3352 · al tocar un modo, lo que cambia aparece en la pantalla', async ({ page }) => {
    await abrirSimulador(page);
    await elegirModo(page, 'Circuitos', true);
    const primerControl = page.getByRole('button', { name: 'Half Adder (Semisumador)' });
    await expect.poll(
      () => primerControl.evaluate((e) => e.getBoundingClientRect().bottom <= window.innerHeight && e.getBoundingClientRect().top >= 0),
      { message: 'el primer control del modo debe quedar a la vista' },
    ).toBe(true);
    // Y el modo tocado sigue a la vista o justo encima, no se pierde a media pantalla
    await elegirModo(page, 'Expresiones', true);
    await expect.poll(() => page.getByLabel('Expresión Booleana').evaluate((e) => {
      const r = e.getBoundingClientRect();
      return r.top >= 0 && r.bottom <= window.innerHeight;
    })).toBe(true);
  });
});

// ───────────────────────────────────────────────────────────────────────────────
// CASO 3 · RECHAZO
// ───────────────────────────────────────────────────────────────────────────────
test.describe('16/10 · CASO 3 · lo que debe rechazarse', () => {
  test('«()» y «A NAND» dicen el motivo y no pintan tabla', async ({ page }) => {
    await abrirSimulador(page);
    await elegirModo(page, 'Expresiones');
    const campo = page.getByLabel('Expresión Booleana');

    // «()»: el paréntesis se abre y lo primero que llega es «)», sin operando.
    await campo.fill('()');
    await expect(page.locator(AVISO_EXPRESION)).toHaveText('Falta un operando antes de «)».');
    await expect(page.locator(TABLA_VERDAD)).toHaveCount(0);

    // «A NAND»: falta el segundo operando.
    await campo.fill('A NAND');
    await expect(page.locator(AVISO_EXPRESION)).toHaveText('La expresión termina antes de tiempo.');
    await expect(page.locator(TABLA_VERDAD)).toHaveCount(0);
  });

  test('Retos: operador prohibido, variable ajena y expresión incompleta no se dan por buenos', async ({ page }) => {
    await abrirSimulador(page);
    await elegirModo(page, 'Retos');
    const comprobar = page.getByRole('button', { name: 'Comprobar' });
    const campo = page.getByLabel('Tu expresión');
    const veredicto = page.locator(VEREDICTO);

    await expect(comprobar).toBeDisabled(); // sin nada escrito no hay qué corregir

    // «AND usando solo NAND» admite solo NAND; NOT (A NAND B) da la tabla de AND, pero con NOT.
    await page.getByRole('button', { name: /AND usando solo NAND/ }).click();
    await campo.fill('NOT (A NAND B)');
    await comprobar.click();
    await expect(veredicto).toHaveText('No se puede evaluar. Este reto solo admite NAND. Has usado: NOT.');

    // La implicación es de A y B: E no es una variable del reto.
    await page.getByRole('button', { name: /Implicación/ }).click();
    await campo.fill('A AND E');
    await comprobar.click();
    await expect(veredicto).toHaveText('No se puede evaluar. La variable «E» no es de este reto');

    // Incompleta, enviada con Intro.
    await campo.fill('A +');
    await campo.press('Enter');
    await expect(veredicto).toHaveText('No se puede evaluar. La expresión termina antes de tiempo');

    await expect(page.getByText('Resueltos: 0 de 9')).toBeVisible();
  });
});

// ───────────────────────────────────────────────────────────────────────────────
// <ZonaHerramienta> — evt:primer-uso (piloto del 09/10/2026, 3d5c5db0)
// ───────────────────────────────────────────────────────────────────────────────
// Mismo montaje que tests/primer-uso-zona.spec.ts: meskeia.com mapeado al servidor local (por
// el `test.use` del nivel del fichero), `navigator.webdriver` falso y un UA sin «Headless». TODO
// /api/analytics se contesta con page.route: el servidor local tiene las credenciales de Turso.
const SLUG = 'simulador-puertas-logicas';
const UA_ESCRITORIO =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36';

interface Envio {
  aplicacion: string;
  datos_adicionales?: { app?: string; t?: number };
}

async function abrirConAnalytics(page: Page): Promise<Envio[]> {
  const envios: Envio[] = [];
  await page.addInitScript(() => {
    Object.defineProperty(Object.getPrototypeOf(navigator), 'webdriver', { get: () => false });
    try { localStorage.setItem('meskeia_transparency_banner_dismissed', 'true'); } catch { /* modo privado */ }
  });
  await page.route('**/api/analytics/**', async (ruta) => {
    const cuerpo = ruta.request().postData();
    if (ruta.request().url().includes('/api/analytics/track') && cuerpo) envios.push(JSON.parse(cuerpo) as Envio);
    await ruta.fulfill({ status: 200, contentType: 'application/json', body: '{"status":"success"}' });
  });
  await page.goto(`http://meskeia.com/${SLUG}/`, { waitUntil: 'domcontentloaded' });
  // La visita la registra AnalyticsTracker en un efecto: que llegue prueba que React hidrató.
  await expect.poll(() => envios.some((e) => e.aplicacion === SLUG), { timeout: 20000 }).toBe(true);
  return envios;
}

const primerosUsos = (envios: Envio[]): Envio[] => envios.filter((e) => e.aplicacion === 'evt:primer-uso');

/** Deslizamiento táctil REAL (CDP): desplaza la página como un pulgar, sin soltar en el sitio. */
async function deslizarDesde(page: Page, x: number, y: number, pasos: number, paso: number): Promise<void> {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
  for (let i = 1; i <= pasos; i++) {
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y: y - i * paso }] });
    await page.waitForTimeout(16);
  }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  // Que acabe la inercia: un toque durante ella solo la frena y no pulsa nada.
  let previo = -1;
  for (let i = 0; i < 40; i++) {
    await page.waitForTimeout(250);
    const actual = await page.evaluate(() => window.scrollY);
    if (actual === previo) break;
    previo = actual;
  }
}

test.describe('16/10 · ZonaHerramienta en escritorio', () => {
  test.use({ userAgent: UA_ESCRITORIO });

  test('no cambia la maquetación; desplazarse, pulsar texto y abrir la guía no emiten; un botón emite UNA vez', async ({ page }) => {
    const envios = await abrirConAnalytics(page);

    // display: contents → el envoltorio no tiene caja y el selector de modo sigue en 4 columnas.
    const zona = await page.locator(`[data-zona-herramienta="${SLUG}"]`).evaluate((e) => ({
      display: getComputedStyle(e).display, ancho: e.getBoundingClientRect().width,
    }));
    expect(zona).toEqual({ display: 'contents', ancho: 0 });
    const columnas = await page.locator('[class*="__modeSelector"]').evaluate((e) =>
      getComputedStyle(e).gridTemplateColumns.split(' ').length);
    expect(columnas).toBe(4);

    await page.mouse.wheel(0, 1200);
    await page.mouse.wheel(0, -1200);
    await page.locator('[class*="__gateDescription"]').click(); // texto, no un control
    await abrirGuiaEducativa(page); // fuera de la zona: es leer, no usar
    await page.waitForTimeout(500);
    expect(primerosUsos(envios), 'emitió sin usar ningún control').toHaveLength(0);

    await page.locator(BOTON_PUERTA).filter({ hasText: /^⊼\s*NAND$/ }).click();
    await expect.poll(() => primerosUsos(envios).length).toBe(1);
    expect(primerosUsos(envios)[0].datos_adicionales?.app).toBe(SLUG);
    expect(typeof primerosUsos(envios)[0].datos_adicionales?.t).toBe('number');

    // Más usos en la misma carga no vuelven a emitir.
    await page.locator(BOTON_PUERTA).filter({ hasText: /^⊕\s*XOR$/ }).click();
    await elegirModo(page, 'Expresiones');
    await page.getByLabel('Expresión Booleana').fill('A AND B');
    await page.waitForTimeout(500);
    expect(primerosUsos(envios), 'se repitió en la misma carga').toHaveLength(1);
  });

  // HALLAZGO ABIERTO (16/10/2026): `svg` está en CONTROLES de ZonaHerramienta porque en otros
  // simuladores es el lienzo donde se arrastra; aquí el «Símbolo» de la puerta es un dibujo
  // estático y pulsarlo cuenta como uso.
  test.fail('HALLAZGO · pulsar el dibujo estático del símbolo NO es usar la herramienta', async ({ page }) => {
    const envios = await abrirConAnalytics(page);
    const dibujo = page.locator('svg[class*="__gateSvg"]');
    await dibujo.scrollIntoViewIfNeeded();
    await dibujo.click();
    await page.waitForTimeout(800);
    expect(primerosUsos(envios)).toHaveLength(0);
  });
});

test.describe('16/10 · ZonaHerramienta en móvil (360×740, táctil)', () => {
  test.use(MOVIL_360);

  test('deslizar sobre la tabla desplaza sin emitir; un toque en una puerta emite UNA vez', async ({ page }) => {
    const envios = await abrirConAnalytics(page);
    const tabla = page.locator(TABLA_VERDAD).first();
    await tabla.evaluate((t) => t.scrollIntoView({ block: 'center' }));
    await page.waitForTimeout(500);
    const antes = await page.evaluate(() => window.scrollY);
    const caja = await tabla.boundingBox();
    if (!caja) throw new Error('la tabla no tiene caja');
    await deslizarDesde(page, Math.round(caja.x + caja.width / 2), Math.round(caja.y + caja.height / 2), 6, 20);
    expect(await page.evaluate(() => window.scrollY), 'el deslizamiento debe desplazar').toBeGreaterThan(antes);
    expect(primerosUsos(envios), 'desplazarse no es usar').toHaveLength(0);

    const or = page.locator(BOTON_PUERTA).filter({ hasText: /^∨\s*OR$/ });
    await or.evaluate((b) => b.scrollIntoView({ block: 'center' }));
    await expect(async () => { // repetir el toque es inocuo: vuelve a elegir OR
      await or.tap();
      await expect(or).toHaveAttribute('aria-pressed', 'true', { timeout: 1000 });
    }).toPass({ timeout: 10000 });
    expect(await columnaSalida(page)).toEqual([0, 1, 1, 1]); // OR: 1 si alguna es 1
    await expect.poll(() => primerosUsos(envios).length).toBe(1);
  });

  // HALLAZGO ABIERTO (16/10/2026): ZonaHerramienta escucha `pointerdown`, que en táctil salta al
  // POSAR el dedo, antes de saber si el gesto es un toque o un desplazamiento. Deslizar para bajar
  // la página empezando sobre cualquier botón (los 4 de modo llenan la mitad baja de la primera
  // pantalla en móvil) emite evt:primer-uso sin que se haya usado nada: la puerta activa no cambia.
  test.fail('HALLAZGO · deslizar el dedo sobre un botón solo para desplazarse NO es usar', async ({ page }) => {
    const envios = await abrirConAnalytics(page);
    const not = page.locator(BOTON_PUERTA).filter({ hasText: /^¬\s*NOT$/ });
    await not.evaluate((b) => b.scrollIntoView({ block: 'center' }));
    await page.waitForTimeout(500);
    const caja = await not.boundingBox();
    if (!caja) throw new Error('el botón NOT no tiene caja');
    await deslizarDesde(page, Math.round(caja.x + caja.width / 2), Math.round(caja.y + caja.height / 2), 8, 25);
    expect(primerosUsos(envios)).toHaveLength(0);
  });
});

// ───────────────────────────────────────────────────────────────────────────────
// Contraste de las tablas de verdad (hallazgo ABIERTO del 16/10/2026)
// ───────────────────────────────────────────────────────────────────────────────
/**
 * El «1» de cada celda (.cellOne: #10b981 sobre ese mismo verde al 15 %) y la cabecera «Y»
 * (.outputHeader: var(--primary) sobre el azul al 10 %) son texto de 17,6 px en negrita: texto
 * PEQUEÑO, exige 4,5:1. Calculado a mano antes de medir: 2,20:1 y 3,65:1 en claro. El candado
 * check:contraste-cabeceras no lo ve a propósito: mira blanco SOBRE la marca, no la marca como
 * texto. Se mide el color ya compuesto sobre el fondo real, no se lee el CSS.
 */
async function contrastesDeLaTabla(page: Page): Promise<{ uno: number; cabeceraY: number }> {
  return page.locator(TABLA_VERDAD).first().evaluate((t) => {
    const leer = (c: string): number[] => {
      const m = c.match(/rgba?\(([^)]+)\)/);
      if (!m) return [0, 0, 0, 0];
      const p = m[1].split(/[ ,/]+/).filter(Boolean).map(Number);
      return [p[0], p[1], p[2], p.length > 3 ? p[3] : 1];
    };
    const sobre = (a: number[], b: number[]): number[] => [0, 1, 2].map((i) => a[i] * a[3] + b[i] * (1 - a[3])).concat(1);
    const fondo = (el: Element): number[] => {
      const capas: number[][] = [];
      for (let e: Element | null = el; e; e = e.parentElement) {
        const c = leer(getComputedStyle(e).backgroundColor);
        if (c[3] > 0) capas.push(c);
        if (c[3] >= 1) break;
      }
      return capas.reverse().reduce((res, capa) => sobre(capa, res), [255, 255, 255, 1]);
    };
    const lum = (c: number[]): number => {
      const f = (v: number): number => { const s = v / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; };
      return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]);
    };
    const ratio = (el: Element): number => {
      const bg = fondo(el);
      const fg = sobre(leer(getComputedStyle(el).color), bg);
      const [hi, lo] = [lum(fg), lum(bg)].sort((x, y) => y - x);
      return Math.round(((hi + 0.05) / (lo + 0.05)) * 100) / 100;
    };
    const uno = t.querySelector('td[class*="__cellOne"]');
    const y = t.querySelector('th[class*="__outputHeader"]');
    if (!uno || !y) throw new Error('falta la celda «1» o la cabecera Y');
    return { uno: ratio(uno), cabeceraY: ratio(y) };
  });
}

/**
 * Las dos trampas de medir color en navegador (tests/contraste-cabeceras-tabla.spec.ts): el
 * overlay de Next en dev y las transiciones, que dejan leer colores intermedios (aquí, 1,49:1
 * a mitad del cambio a oscuro). Se desactivan, y además se repite la lectura hasta que dos
 * seguidas coinciden.
 */
async function contrastesEstables(page: Page): Promise<{ uno: number; cabeceraY: number }> {
  await page.addStyleTag({
    content: 'nextjs-portal { display: none !important; } *, *::before, *::after { animation: none !important; transition: none !important; }',
  });
  let previa = await contrastesDeLaTabla(page);
  for (let i = 0; i < 20; i++) {
    await page.waitForTimeout(150);
    const actual = await contrastesDeLaTabla(page);
    if (actual.uno === previa.uno && actual.cabeceraY === previa.cabeceraY) return actual;
    previa = actual;
  }
  throw new Error('la medida de contraste no se estabiliza');
}

test.describe('16/10 · contraste de las tablas de verdad', () => {
  // REPARADO (hallazgo 3354, 17/10/2026): «Y» con --primary-texto; «1» en #047857 (claro) y #6ee7b7 (oscuro).
  test('3354 · claro: el «1» y la cabecera «Y» llegan a 4,5:1', async ({ page }) => {
    await abrirSimulador(page);
    const c = await contrastesEstables(page); // medido el 16/10: 2,20 y 3,65
    expect(c.uno, 'celda «1»').toBeGreaterThanOrEqual(4.5);
    expect(c.cabeceraY, 'cabecera Y').toBeGreaterThanOrEqual(4.5);
  });

  test('3354 · oscuro: el «1» y la cabecera «Y» llegan a 4,5:1', async ({ page }) => {
    await abrirSimulador(page);
    // Con el conmutador de la propia web, no sembrando data-theme (el gestor lo pisa y pasa en falso).
    await page.emulateMedia({ colorScheme: 'dark' });
    await expect(async () => {
      await page.getByRole('button', { name: 'Cambiar a modo oscuro' }).click({ timeout: 1000 });
      await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark', { timeout: 1000 });
    }).toPass({ timeout: 15000 });
    const c = await contrastesEstables(page); // medido el 16/10: 3,59 y 4,42
    expect(c.uno, 'celda «1»').toBeGreaterThanOrEqual(4.5);
    expect(c.cabeceraY, 'cabecera Y').toBeGreaterThanOrEqual(4.5);
  });
});

// ───────────────────────────────────────────────────────────────────────────────
// Contenido: bloque educativo, FAQPage y featureList (hallazgos ABIERTOS del 16/10/2026)
// ───────────────────────────────────────────────────────────────────────────────
test.describe('16/10 · contenido', () => {
  // REPARADO (hallazgo 3356, 17/10/2026)
  test('3356 · un multiplexor 4:1 en AND-OR lleva 4 puertas AND, no 3', async ({ page }) => {
    await abrirSimulador(page);
    await abrirGuiaEducativa(page);
    // Y = S1'S0'·D0 + S1'S0·D1 + S1S0'·D2 + S1S0·D3: un AND por cada entrada de datos (4),
    // un OR de 4 entradas y 2 NOT. Con 3 AND una de las cuatro fuentes no llega nunca a Y.
    const tarjeta = page.locator('[class*="__escenarioCard"]').filter({ hasText: 'Multiplexor 4:1' });
    await expect(tarjeta).toHaveCount(1);
    await expect(tarjeta).not.toContainText('3 puertas AND');
    await expect(tarjeta).toContainText('4 puertas AND');
    await expect(tarjeta).toContainText('1 puerta OR de 4 entradas');
  });

  // REPARADO (hallazgo 3357, 17/10/2026)
  test('3357 · la FAQ no llama «universales» a las 7 puertas', async ({ page }) => {
    await abrirSimulador(page);
    await abrirGuiaEducativa(page);
    // Dos preguntas más abajo la propia FAQ define «universal» (solo NAND y NOR lo son) y la
    // comparativa marca «Universal: No» en AND, OR, NOT, XOR y XNOR.
    const pregunta = page.locator('[class*="__faqItem"]').filter({ hasText: '¿Es lo mismo una puerta lógica' });
    await expect(pregunta).toHaveCount(1);
    await expect(pregunta).not.toContainText('son universales');
  });

  // REPARADO (hallazgo 3355, 17/10/2026)
  test('3355 · los emojis decorativos del bloque educativo llevan aria-hidden', async ({ page }) => {
    await abrirSimulador(page);
    await abrirGuiaEducativa(page);
    // 🎓 🔬 🔧 💻 junto al perfil de cada tarjeta y ⚠️ junto al título del recuadro de errores.
    const sinOcultar = await page.locator('[class*="__escenarioIcon"], [class*="__warningIcon"]')
      .evaluateAll((els) => els.filter((e) => e.getAttribute('aria-hidden') !== 'true').map((e) => e.textContent));
    expect(sinOcultar).toEqual([]);
  });

  // REPARADO (hallazgo 3358, 17/10/2026)
  test('3358 · featureList no promete una «visualización paso a paso de la propagación»', async ({ page }) => {
    await abrirSimulador(page);
    // Ningún modo enseña señales intermedias ni avanza paso a paso: los circuitos muestran la
    // salida final y la tabla completa.
    const features = await page.locator('script[type="application/ld+json"]').evaluateAll((els) => {
      for (const el of els) {
        const d = JSON.parse(el.textContent || '{}') as { '@type'?: string; featureList?: string[] };
        if (d['@type'] === 'WebApplication') return d.featureList ?? [];
      }
      return null;
    });
    expect(features, 'no hay WebApplication en la página').not.toBeNull();
    expect((features ?? []).filter((f) => /paso a paso|propagaci/i.test(f))).toEqual([]);
  });

  // REPARADO (hallazgo 3359, 17/10/2026): PREGUNTAS_FRECUENTES en metadata.ts, que importan las dos.
  test('3359 · el FAQPage y la FAQ visible dicen lo mismo (una sola constante)', async ({ page }) => {
    await abrirSimulador(page);
    await abrirGuiaEducativa(page);
    const normal = (s: string): string => s.replace(/\s+/g, ' ').trim();
    const faq = await page.locator('script[type="application/ld+json"]').evaluateAll((els) => {
      for (const el of els) {
        const d = JSON.parse(el.textContent || '{}') as { '@type'?: string; mainEntity?: { name: string; acceptedAnswer: { text: string } }[] };
        if (d['@type'] === 'FAQPage') return (d.mainEntity ?? []).map((q) => ({ pregunta: q.name, respuesta: q.acceptedAnswer.text }));
      }
      return [];
    });
    expect(faq).toHaveLength(6);
    const visibles = await page.locator('[class*="__faqItem"]').evaluateAll((items) => items.map((i) => ({
      pregunta: i.querySelector('h4')?.textContent ?? '',
      respuesta: i.querySelector('p')?.textContent ?? '',
    })));
    // Las 6 del FAQPage están también en pantalla, escritas otra vez. El 16/10/2026 divergían 4:
    // puerta/compuerta, tabla de verdad, XOR/XNOR (solo mayúsculas) y hardware (otro enunciado).
    const distintas = faq.filter((q) => {
      const v = visibles.find((x) => normal(x.pregunta) === normal(q.pregunta));
      return !v || normal(v.respuesta) !== normal(q.respuesta);
    }).map((q) => q.pregunta);
    expect(distintas).toEqual([]);
  });

  // REPARADO (hallazgo 3360, 17/10/2026)
  test('3360 · el texto de «Sigue explorando» no promete «cualquier fórmula booleana»', async ({ page }) => {
    await abrirSimulador(page);
    // El evaluador admite 4 variables (A-D): cualquier expresión con una E se rechaza con
    // ««E» no es una variable válida. Usa A, B, C o D.» (RECHAZOS del CASO 3 de 30/08, arriba).
    const seccion = page.locator('section[class*="__relatedConcepts"]');
    await expect(seccion).toHaveCount(1);
    await expect(seccion).not.toContainText('cualquier fórmula booleana');
    await expect(seccion).toContainText('hasta cuatro variables (A, B, C y D)');
  });
});
