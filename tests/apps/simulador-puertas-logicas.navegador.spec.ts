import { test, expect, devices, type Locator, type Page } from '@playwright/test';

/**
 * Simulador de Puertas Lógicas — la APP EN EL NAVEGADOR (21/08/2026)
 *
 * Complementa a `simulador-puertas-logicas.spec.ts`, que es test de UNIDAD del motor de
 * retos (`motor-retos.ts`) y ya cubre el modo «Retos» en pantalla. Aquí se prueba lo que
 * aquel no toca: los modos **Tablas de Verdad**, **Circuitos** y **Expresiones**, que NO
 * usan ese motor —tienen su propio cálculo dentro de `page.tsx`— y la operativa en móvil.
 *
 * CÓMO SE DERIVA CADA VALOR ESPERADO
 *   Todas las tablas de este fichero están calculadas a mano desde la definición de cada
 *   puerta o circuito, ANTES de abrir la app; ninguna se ha copiado de su salida.
 *   Orden de filas: la primera variable es el bit más significativo (00, 01, 10, 11).
 *
 * CASO 1 · NORMAL — las 7 puertas del modo «Tablas de Verdad»:
 *     AND  1 solo si ambas son 1 ......... [0,0,0,1]
 *     OR   1 si alguna es 1 .............. [0,1,1,1]
 *     NOT  invierte (1 entrada) .......... [1,0]
 *     NAND AND negada .................... [1,1,1,0]
 *     NOR  OR negada ..................... [1,0,0,0]
 *     XOR  1 si son distintas ............ [0,1,1,0]
 *     XNOR 1 si son iguales .............. [1,0,0,1]
 *
 * CASO 2 · COMPUESTO / LÍMITE — el Full Adder, que son cinco puertas encadenadas, con el
 *   caso frontera de las tres entradas a 1 (1+1+1 = 3 = binario «11» → S=1, Cout=1).
 *     S    = A ⊕ B ⊕ Cin ............... [0,1,1,0,1,0,0,1]
 *     Cout = A·B + Cin·(A ⊕ B) ......... [0,0,0,1,0,1,1,1]
 *   Y las tablas completas de los otros cuatro circuitos, también a mano.
 *
 * CASO 3 · MÓVIL (devices['Pixel 7'], 412×839) — que el simulador se pueda usar con el
 *   dedo: sin desbordamiento horizontal de la página, conmutadores por encima de los 44 px
 *   de WCAG 2.5.5, y las tablas legibles dentro de los 412 px sin encoger la letra.
 *
 * HALLAZGOS ABIERTOS: al final, marcados con `test.fail()` — afirman lo que debería pasar y
 * hoy fallan a propósito. El día que se reparen, quitar la línea `test.fail()` y quedan como
 * regresión.
 */

const RUTA = '/simulador-puertas-logicas/';

// Los nombres de clase de un CSS Module llevan un hash que cambia en cada build
// (SimuladorPuertasLogicas-module__ExoJiG__ioSwitch), así que se busca por el sufijo estable.
const BOTON_PUERTA = '[class*="__gateBtn"]';
const TABLA = 'table[class*="__truthTable"]';
const CONMUTADOR = '[class*="__ioSwitch"]';
const LED = '[class*="__ioLed"]';
const ERROR_EXPRESION = '[class*="__expressionError"]';

/** Símbolo que la app pinta junto a cada puerta; sirve para localizar el botón sin ambigüedad
 *  («AND» a secas también casaría con NAND). De paso comprueba que el símbolo es el estándar. */
const SIMBOLO: Record<string, string> = {
  AND: '∧', OR: '∨', NOT: '¬', NAND: '⊼', NOR: '⊽', XOR: '⊕', XNOR: '⊙',
};

/**
 * El aviso global de transparencia es un banner FIJO que aparece a los 500 ms y se solapa
 * con los conmutadores. Se marca como ya cerrado para medir esta app y no el banner.
 */
async function abrir(page: Page, modo?: 'Circuitos' | 'Expresiones' | 'Retos'): Promise<void> {
  await page.addInitScript(() => {
    try { localStorage.setItem('meskeia_transparency_banner_dismissed', 'true'); } catch { /* modo privado */ }
  });
  await page.goto(RUTA);
  if (modo) await page.getByRole('button', { name: new RegExp(modo) }).first().click();
}

/** Celdas de una tabla, fila a fila, tal como se leen en pantalla. */
async function filasDe(tabla: Locator): Promise<string[][]> {
  return tabla.locator('tbody tr').evaluateAll((trs) =>
    trs.map((tr) => [...tr.querySelectorAll('td')].map((td) => td.textContent?.trim() ?? '')));
}

/** Columna de salida (la última) en 0/1, para poder compararla de un vistazo. */
async function salidasDe(tabla: Locator): Promise<number[]> {
  const filas = await filasDe(tabla);
  return filas.map((f) => Number(f[f.length - 1]));
}

/** Los dos LED de salida, leídos como 0/1. */
async function ledsDe(page: Page): Promise<(string | undefined)[]> {
  return page.locator(LED).evaluateAll((els) => els.map((e) => e.textContent?.match(/[01]/)?.[0]));
}

async function seleccionarPuerta(page: Page, puerta: string): Promise<void> {
  await page.locator(BOTON_PUERTA).filter({ hasText: new RegExp(`^${SIMBOLO[puerta]}\\s*${puerta}$`) }).click();
}

// ═══════════════════════════════════════════════════════════════════════════
// CASO 1 — Modo «Tablas de Verdad»: las siete puertas contra su definición
// ═══════════════════════════════════════════════════════════════════════════
test.describe('CASO 1 · tablas de verdad de las 7 puertas', () => {
  // Filas 00, 01, 10, 11. Calculadas a mano desde la definición de cada puerta.
  const CANONICAS: [string, number[]][] = [
    ['AND', [0, 0, 0, 1]],
    ['OR', [0, 1, 1, 1]],
    ['NOT', [1, 0]],
    ['NAND', [1, 1, 1, 0]],
    ['NOR', [1, 0, 0, 0]],
    ['XOR', [0, 1, 1, 0]],
    ['XNOR', [1, 0, 0, 1]],
  ];

  test('la app se presenta como lo que es', async ({ page }) => {
    await abrir(page);
    await expect(page.getByRole('heading', { level: 1 }))
      .toHaveText('Simulador de Puertas y Compuertas Lógicas');
    // Las cuatro formas de trabajar que promete el selector de modo.
    for (const modo of ['Tablas de Verdad', 'Circuitos', 'Expresiones', 'Retos']) {
      await expect(page.getByRole('button', { name: new RegExp(modo) }).first()).toBeVisible();
    }
  });

  test('cada puerta muestra su tabla canónica, y cambiar de puerta cambia la salida', async ({ page }) => {
    await abrir(page);
    const tabla = page.locator(TABLA).first();

    for (const [puerta, esperado] of CANONICAS) {
      await seleccionarPuerta(page, puerta);
      expect(await salidasDe(tabla), `tabla de ${puerta}`).toEqual(esperado);
      // El botón activo se anuncia como pulsado.
      await expect(page.locator(BOTON_PUERTA).filter({ hasText: new RegExp(`^${SIMBOLO[puerta]}\\s*${puerta}$`) }))
        .toHaveAttribute('aria-pressed', 'true');
    }
  });

  test('NOT es la única de una entrada: 2 filas y una sola columna de entrada', async ({ page }) => {
    await abrir(page);
    const tabla = page.locator(TABLA).first();

    await seleccionarPuerta(page, 'AND');
    expect(await tabla.locator('thead th').allInnerTexts()).toEqual(['A', 'B', 'Y']);
    expect(await filasDe(tabla)).toHaveLength(4); // 2² combinaciones

    await seleccionarPuerta(page, 'NOT');
    expect(await tabla.locator('thead th').allInnerTexts()).toEqual(['A', 'Y']);
    expect(await filasDe(tabla)).toEqual([['0', '1'], ['1', '0']]);
  });

  test('NAND y NOR son la negación exacta de AND y OR, fila a fila', async ({ page }) => {
    await abrir(page);
    const tabla = page.locator(TABLA).first();

    await seleccionarPuerta(page, 'AND');
    const and = await salidasDe(tabla);
    await seleccionarPuerta(page, 'NAND');
    expect(await salidasDe(tabla)).toEqual(and.map((v) => 1 - v));

    await seleccionarPuerta(page, 'OR');
    const or = await salidasDe(tabla);
    await seleccionarPuerta(page, 'NOR');
    expect(await salidasDe(tabla)).toEqual(or.map((v) => 1 - v));
  });

  test('la ficha de la puerta dice lo mismo que su tabla', async ({ page }) => {
    await abrir(page);

    await seleccionarPuerta(page, 'XOR');
    await expect(page.getByRole('heading', { name: 'Puerta XOR' })).toBeVisible();
    await expect(page.getByText('Salida 1 si las entradas son DIFERENTES')).toBeVisible();

    await seleccionarPuerta(page, 'XNOR');
    await expect(page.getByText('Salida 1 si las entradas son IGUALES')).toBeVisible();

    await seleccionarPuerta(page, 'NOR');
    // Cuidado con el enunciado: NOR da 1 solo cuando AMBAS son 0, y así lo dice.
    await expect(page.getByText('OR negado: salida 1 solo si ambas son 0')).toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// CASO 2 — Modo «Circuitos»: varias puertas encadenadas y el caso frontera
// ═══════════════════════════════════════════════════════════════════════════
test.describe('CASO 2 · circuitos de varias puertas', () => {
  // Full Adder, filas 000..111 con A como bit más significativo.
  // Suma de tres bits: el resultado en binario es «Cout S».
  //   000 → 0 → S0 C0      100 → 1 → S1 C0
  //   001 → 1 → S1 C0      101 → 2 → S0 C1
  //   010 → 1 → S1 C0      110 → 2 → S0 C1
  //   011 → 2 → S0 C1      111 → 3 → S1 C1
  const FULL_ADDER: string[][] = [
    ['0', '0', '0', '0', '0'],
    ['0', '0', '1', '1', '0'],
    ['0', '1', '0', '1', '0'],
    ['0', '1', '1', '0', '1'],
    ['1', '0', '0', '1', '0'],
    ['1', '0', '1', '0', '1'],
    ['1', '1', '0', '0', '1'],
    ['1', '1', '1', '1', '1'],
  ];

  test('el Full Adder suma tres bits en las ocho combinaciones', async ({ page }) => {
    await abrir(page, 'Circuitos');
    await page.getByRole('button', { name: 'Full Adder (Sumador Completo)' }).click();

    const tabla = page.locator(TABLA).first();
    expect(await tabla.locator('thead th').allInnerTexts()).toEqual(['A', 'B', 'Cin', 'S', 'Cout']);
    expect(await filasDe(tabla)).toEqual(FULL_ADDER);
  });

  test('con las tres entradas a 1 la salida es 1+1+1 = binario 11', async ({ page }) => {
    await abrir(page, 'Circuitos');
    await page.getByRole('button', { name: 'Full Adder (Sumador Completo)' }).click();

    // Estado inicial: todo a 0 → 0+0+0 = 0 → S=0, Cout=0.
    await expect(page.locator(LED).nth(0)).toContainText('S (Suma)');
    expect(await ledsDe(page)).toEqual(['0', '0']);

    // Caso frontera: las tres a 1.
    const conmutadores = page.locator(CONMUTADOR);
    await expect(conmutadores).toHaveCount(3);
    for (let i = 0; i < 3; i++) await conmutadores.nth(i).click();
    await expect(conmutadores.nth(2)).toHaveAttribute('aria-pressed', 'true');

    // 1+1+1 = 3 = «11» en binario: suma 1 y acarreo 1.
    expect(await ledsDe(page)).toEqual(['1', '1']);
    // Y la fila resaltada de la tabla es la última, 1 1 1 | 1 1.
    await expect(page.locator('tr[class*="__currentRow"]')).toHaveText('11111');
  });

  test('conmutar una sola entrada mueve la salida y la fila resaltada', async ({ page }) => {
    await abrir(page, 'Circuitos');
    await page.getByRole('button', { name: 'Full Adder (Sumador Completo)' }).click();
    const conmutadores = page.locator(CONMUTADOR);

    // A=1, B=0, Cin=0 → 1 → S=1, Cout=0.
    await conmutadores.nth(0).click();
    expect(await ledsDe(page)).toEqual(['1', '0']);
    await expect(page.locator('tr[class*="__currentRow"]')).toHaveText('10010');

    // A=1, B=1, Cin=0 → 2 → S=0, Cout=1: el acarreo aparece justo aquí.
    await conmutadores.nth(1).click();
    expect(await ledsDe(page)).toEqual(['0', '1']);
    await expect(page.locator('tr[class*="__currentRow"]')).toHaveText('11001');
  });

  test('cambiar de circuito devuelve todas las entradas a 0', async ({ page }) => {
    await abrir(page, 'Circuitos');
    await page.getByRole('button', { name: 'Full Adder (Sumador Completo)' }).click();
    await page.locator(CONMUTADOR).nth(0).click();
    await expect(page.locator(CONMUTADOR).nth(0)).toHaveAttribute('aria-pressed', 'true');

    await page.getByRole('button', { name: 'Half Adder (Semisumador)' }).click();
    const conmutadores = page.locator(CONMUTADOR);
    await expect(conmutadores).toHaveCount(2); // el semisumador solo tiene A y B
    for (let i = 0; i < 2; i++) await expect(conmutadores.nth(i)).toHaveAttribute('aria-pressed', 'false');
  });

  test('las tablas de los otros cuatro circuitos coinciden con lo calculado a mano', async ({ page }) => {
    await abrir(page, 'Circuitos');
    const tabla = page.locator(TABLA).first();

    // Half Adder: S = A⊕B, C = A·B.  00→00 · 01→10 · 10→10 · 11→01
    await page.getByRole('button', { name: 'Half Adder (Semisumador)' }).click();
    expect(await tabla.locator('thead th').allInnerTexts()).toEqual(['A', 'B', 'S', 'C']);
    expect(await filasDe(tabla)).toEqual([
      ['0', '0', '0', '0'],
      ['0', '1', '1', '0'],
      ['1', '0', '1', '0'],
      ['1', '1', '0', '1'],
    ]);

    // Multiplexor 2:1 — Y copia D0 mientras S=0 y D1 cuando S=1.
    // Filas (D0,D1,S): 000→0 · 001→0 · 010→0 · 011→1 · 100→1 · 101→0 · 110→1 · 111→1
    await page.getByRole('button', { name: 'Multiplexor 2:1' }).click();
    expect(await tabla.locator('thead th').allInnerTexts()).toEqual(['D0', 'D1', 'S', 'Y']);
    expect(await salidasDe(tabla)).toEqual([0, 0, 0, 1, 1, 0, 1, 1]);

    // Comparador de 1 bit — las tres salidas son A>B, A=B, A<B.
    // 00 → 0,1,0 · 01 → 0,0,1 · 10 → 1,0,0 · 11 → 0,1,0
    await page.getByRole('button', { name: 'Comparador 1-bit' }).click();
    expect(await filasDe(tabla)).toEqual([
      ['0', '0', '0', '1', '0'],
      ['0', '1', '0', '0', '1'],
      ['1', '0', '1', '0', '0'],
      ['1', '1', '0', '1', '0'],
    ]);

    // Decodificador 2:4 — se activa la salida cuyo número es 2·A1 + A0.
    // OJO al orden de las filas: la columna de la izquierda es A0, que aquí es el bit MENOS
    // significativo del número decodificado, así que la diagonal sale Y0, Y2, Y1, Y3.
    //   A0=0 A1=0 → 0 → Y0   |   A0=0 A1=1 → 2 → Y2
    //   A0=1 A1=0 → 1 → Y1   |   A0=1 A1=1 → 3 → Y3
    await page.getByRole('button', { name: 'Decodificador 2:4' }).click();
    expect(await tabla.locator('thead th').allInnerTexts()).toEqual(['A0', 'A1', 'Y0', 'Y1', 'Y2', 'Y3']);
    expect(await filasDe(tabla)).toEqual([
      ['0', '0', '1', '0', '0', '0'],
      ['0', '1', '0', '0', '1', '0'],
      ['1', '0', '0', '1', '0', '0'],
      ['1', '1', '0', '0', '0', '1'],
    ]);
    // Exactamente una salida activa en cada fila: eso es un decodificador.
    for (const fila of await filasDe(tabla)) {
      expect(fila.slice(2).filter((c) => c === '1')).toHaveLength(1);
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// CASO 2.bis — Modo «Expresiones»: lo que HOY evalúa bien
// ═══════════════════════════════════════════════════════════════════════════
test.describe('CASO 2.bis · evaluador de expresiones', () => {
  test('las expresiones con AND, OR y NOT dan la tabla calculada a mano', async ({ page }) => {
    await abrir(page, 'Expresiones');
    const campo = page.getByLabel('Expresión Booleana');
    const tabla = page.locator(TABLA).first();

    // La expresión que trae de fábrica: (A·B) + C̄ — 1 salvo cuando C=1 y no están A y B a 1.
    // 000→1 · 001→0 · 010→1 · 011→0 · 100→1 · 101→0 · 110→1 · 111→1
    await expect(campo).toHaveValue('(A AND B) OR (NOT C)');
    expect(await salidasDe(tabla)).toEqual([1, 0, 1, 0, 1, 0, 1, 1]);

    const CASOS: [string, string[], number[]][] = [
      ['A AND B', ['A', 'B'], [0, 0, 0, 1]],
      ['A OR B', ['A', 'B'], [0, 1, 1, 1]],
      ['NOT A', ['A'], [1, 0]],
      // De Morgan: NOT(A+B) = Ā·B̄ → solo 1 con las dos a 0.
      ['NOT (A OR B)', ['A', 'B'], [1, 0, 0, 0]],
      ['(NOT A) AND (NOT B)', ['A', 'B'], [1, 0, 0, 0]],
      // 1 cuando alguna pareja está entera a 1: filas 0011, 0111, 1011, 1100…
      ['(A AND B) OR (C AND D)', ['A', 'B', 'C', 'D'],
        [0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 1, 1]],
      // El símbolo ⊕ sí llega al evaluador (a diferencia de la palabra XOR: ver hallazgos).
      ['A ⊕ B', ['A', 'B'], [0, 1, 1, 0]],
    ];

    for (const [expresion, variables, esperado] of CASOS) {
      await campo.fill(expresion);
      expect(await tabla.locator('thead th').allInnerTexts(), expresion).toEqual([...variables, 'Y']);
      expect(await salidasDe(tabla), expresion).toEqual(esperado);
    }
  });

  test('avisa cuando se pasa de cuatro variables', async ({ page }) => {
    await abrir(page, 'Expresiones');
    await page.getByLabel('Expresión Booleana').fill('(A AND B) OR (C AND D) OR E');
    await expect(page.locator(ERROR_EXPRESION)).toHaveText('Máximo 4 variables (A-D)');
    await expect(page.locator(TABLA)).toHaveCount(0);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// CASO 3 — MÓVIL (Pixel 7): el simulador se usa con el dedo
// ═══════════════════════════════════════════════════════════════════════════
const PIXEL_7 = devices['Pixel 7'];
// Se enumeran las opciones en vez de esparcir `...devices['Pixel 7']` porque el device trae
// `defaultBrowserType`, y Playwright no lo admite dentro de un describe.
const COMO_MOVIL = {
  viewport: PIXEL_7.viewport,
  userAgent: PIXEL_7.userAgent,
  deviceScaleFactor: PIXEL_7.deviceScaleFactor,
  isMobile: PIXEL_7.isMobile,
  hasTouch: PIXEL_7.hasTouch,
};

test.describe('CASO 3 · en móvil (Pixel 7)', () => {
  test.use(COMO_MOVIL);

  test('ningún modo desborda la página a lo ancho', async ({ page }) => {
    await abrir(page);
    expect(page.viewportSize()).toEqual({ width: 412, height: 839 }); // devices['Pixel 7']

    for (const modo of ['Tablas de Verdad', 'Circuitos', 'Expresiones', 'Retos']) {
      await page.getByRole('button', { name: new RegExp(modo) }).first().click();
      const ancho = await page.evaluate(() => ({
        visible: document.documentElement.clientWidth,
        scroll: document.documentElement.scrollWidth,
      }));
      expect(ancho.scroll, `modo ${modo}`).toBeLessThanOrEqual(ancho.visible + 1);
    }
  });

  test('las tablas caben en los 412 px sin encoger la letra', async ({ page }) => {
    await abrir(page);
    const tabla = page.locator(TABLA).first();

    // La tabla de una puerta (3 columnas) y la del Full Adder (5) entran enteras.
    for (const columnas of [3, 5]) {
      if (columnas === 5) {
        await page.getByRole('button', { name: /Circuitos/ }).first().click();
        await page.getByRole('button', { name: 'Full Adder (Sumador Completo)' }).click();
      }
      const medida = await tabla.evaluate((t) => ({
        columnas: t.querySelectorAll('thead th').length,
        derecha: Math.round(t.getBoundingClientRect().right),
        cuerpo: parseFloat(getComputedStyle(t).fontSize),
      }));
      expect(medida.columnas).toBe(columnas);
      expect(medida.derecha).toBeLessThanOrEqual(412);
      expect(medida.cuerpo).toBeGreaterThanOrEqual(14); // legible sin hacer zoom
    }
  });

  test('los botones de puerta y los conmutadores llegan al tamaño de un dedo', async ({ page }) => {
    await abrir(page);

    // WCAG 2.5.5 pide 44×44 px; los siete botones de puerta pasan de largo.
    const puertas = await page.locator(BOTON_PUERTA).evaluateAll((els) => els.map((e) => {
      const r = e.getBoundingClientRect();
      return { txt: e.textContent?.trim(), w: Math.round(r.width), h: Math.round(r.height) };
    }));
    expect(puertas).toHaveLength(7);
    for (const p of puertas) {
      expect(p.w, `botón ${p.txt}`).toBeGreaterThanOrEqual(44);
      expect(p.h, `botón ${p.txt}`).toBeGreaterThanOrEqual(44);
    }

    await page.getByRole('button', { name: /Circuitos/ }).first().click();
    await page.getByRole('button', { name: 'Full Adder (Sumador Completo)' }).click();
    const conmutadores = await page.locator(CONMUTADOR).evaluateAll((els) => els.map((e) => {
      const r = e.getBoundingClientRect();
      return { txt: e.textContent?.trim(), w: Math.round(r.width), h: Math.round(r.height) };
    }));
    expect(conmutadores).toHaveLength(3);
    for (const c of conmutadores) expect(c.h, `conmutador ${c.txt}`).toBeGreaterThanOrEqual(44);
  });

  test('se conmutan entradas con el dedo y la salida responde', async ({ page }) => {
    await abrir(page, 'Circuitos');
    await page.getByRole('button', { name: 'Full Adder (Sumador Completo)' }).click();
    const conmutadores = page.locator(CONMUTADOR);

    // A=1, B=1, Cin=0 → 1+1 = 2 → S=0, Cout=1 (la fila 110 de la tabla de arriba).
    await conmutadores.nth(0).tap();
    await conmutadores.nth(1).tap();
    await expect(conmutadores.nth(0)).toHaveAttribute('aria-pressed', 'true');
    expect(await ledsDe(page)).toEqual(['0', '1']);
  });

  test('el modo Retos se puede resolver desde el móvil', async ({ page }) => {
    await abrir(page, 'Retos');
    // Reto 1, «Invertir con una sola NAND»: una NAND con las dos entradas unidas es un NOT.
    // (La corrección en sí ya está probada en simulador-puertas-logicas.spec.ts; aquí solo
    //  interesa que el campo, el teclado y el botón sean utilizables a 412 px.)
    const campo = page.getByLabel('Tu expresión');
    await campo.tap();
    await campo.fill('A NAND A');
    await page.getByRole('button', { name: 'Comprobar' }).tap();
    await expect(page.getByRole('status')).toContainText('Resuelto');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// HALLAZGOS ABIERTOS — afirman lo correcto y hoy fallan a propósito (test.fail)
// ═══════════════════════════════════════════════════════════════════════════
test.describe('hallazgos abiertos', () => {
  test('HALLAZGO 1 · la palabra XOR devuelve una columna de ceros en modo Expresiones', async ({ page }) => {
    test.fail(); // Reparado el día que esto pase en verde.
    await abrir(page, 'Expresiones');
    const campo = page.getByLabel('Expresión Booleana');
    const tabla = page.locator(TABLA).first();

    // En page.tsx la normalización sustituye OR por «|» ANTES que XOR por «^», así que
    // «XOR» acaba convertido en «X|» y queda una X suelta; al evaluar salta un ReferenceError
    // que el catch se traga y devuelve false. Resultado: TODA la columna a 0, y sin ningún
    // aviso. A mano, XOR es 1 cuando las entradas son distintas.
    await campo.fill('A XOR B');
    expect(await salidasDe(tabla)).toEqual([0, 1, 1, 0]);
    await expect(page.locator(ERROR_EXPRESION)).toHaveCount(0);

    // (A⊕B)+C — 0 solo cuando A y B coinciden y C=0: filas 000 y 110.
    await campo.fill('(A XOR B) OR C');
    expect(await salidasDe(tabla)).toEqual([0, 1, 1, 1, 1, 1, 0, 1]);

    // Paridad impar de 3 bits: 1 cuando el número de unos es impar.
    await campo.fill('A XOR B XOR C');
    expect(await salidasDe(tabla)).toEqual([0, 1, 1, 0, 1, 0, 0, 1]);

    // El botón de ejemplo de la propia app lleva al mismo sitio en un solo clic.
    await page.getByRole('button', { name: 'A XOR B', exact: true }).click();
    expect(await salidasDe(tabla)).toEqual([0, 1, 1, 0]);
  });

  test('HALLAZGO 2 · «A NAND B» se inventa variables en vez de avisar', async ({ page }) => {
    test.fail(); // Reparado el día que esto pase en verde.
    await abrir(page, 'Expresiones');
    const campo = page.getByLabel('Expresión Booleana');
    const tabla = page.locator(TABLA).first();

    // El hero, el <title> y la comparativa educativa presentan las SIETE puertas, y el modo
    // Tablas las tiene todas; pero el evaluador solo entiende AND, OR, NOT y XOR. Con NAND
    // no da error: extrae las letras N y D de la propia palabra como si fueran variables y
    // pinta una tabla de 16 filas con la salida a 0 en todas.
    await campo.fill('A NAND B');
    expect(await tabla.locator('thead th').allInnerTexts()).toEqual(['A', 'B', 'Y']);
    expect(await salidasDe(tabla)).toEqual([1, 1, 1, 0]); // NAND = AND negada

    // NOR y XNOR al menos no mienten, pero el aviso que sale («Máximo 4 variables (A-D)»)
    // no tiene nada que ver con lo que pasa: la expresión es de dos variables.
    await campo.fill('A NOR B');
    expect(await salidasDe(tabla)).toEqual([1, 0, 0, 0]);
  });

  test('HALLAZGO 3 · el comparador rotula sus tres salidas con la misma letra', async ({ page }) => {
    test.fail(); // Reparado el día que esto pase en verde.
    await abrir(page, 'Circuitos');
    await page.getByRole('button', { name: 'Comparador 1-bit' }).click();

    // La cabecera de «Tabla Completa» recorta cada rótulo por el primer espacio
    // (`output.split(' ')[0]`), así que «A > B», «A = B» y «A < B» quedan las tres en «A»:
    // la tabla muestra A · B · A · A · A y no hay forma de saber qué columna es cuál.
    // Los valores sí son correctos; lo que no se puede leer son los rótulos.
    expect(await page.locator(TABLA).first().locator('thead th').allInnerTexts())
      .toEqual(['A', 'B', 'A > B', 'A = B', 'A < B']);
  });

  test('HALLAZGO 5 · el LED de salida no está preparado para un lector de pantalla', async ({ page }) => {
    test.fail(); // Reparado el día que esto pase en verde.
    await abrir(page, 'Circuitos');
    await page.getByRole('button', { name: 'Full Adder (Sumador Completo)' }).click();

    // El conmutador de entrada sí marca su emoji como decorativo (aria-hidden="true");
    // el LED de salida, que es el mismo patrón, no. Además es un <div> sin role ni
    // aria-live: al conmutar una entrada, quien no ve la pantalla no se entera de que
    // la salida ha cambiado, que es justamente lo que enseña este modo.
    const indicadores = await page.locator(`${LED} [class*="__ioIndicator"]`)
      .evaluateAll((els) => els.map((e) => e.getAttribute('aria-hidden')));
    expect(indicadores).toEqual(['true', 'true']);
    await expect(page.locator(LED).first()).toHaveAttribute('aria-live', 'polite');
  });
});

test.describe('hallazgos abiertos · móvil', () => {
  test.use(COMO_MOVIL);

  test('HALLAZGO 4 · la flecha tapa el centro del último conmutador', async ({ page }) => {
    test.fail(); // Reparado el día que esto pase en verde.
    await abrir(page, 'Circuitos');
    await page.getByRole('button', { name: 'Full Adder (Sumador Completo)' }).click();
    await page.locator('[class*="__circuitPanel"]').scrollIntoViewIfNeeded();

    // En vertical el panel apila entradas → flecha → salidas, y la flecha se gira 90°
    // (transform: rotate). El giro NO cambia la caja de 252×51 que ocupa en el layout, así
    // que su rectángulo pasa a medir 51×252 y se monta encima del conmutador de arriba:
    // el centro de «Cin» —justo donde se pinta su 0/1— pertenece a la flecha, no al botón.
    // Tocar ahí no hace nada; hay que acertar en la parte izquierda del control.
    // Pasa igual con la 2.ª entrada del Half Adder y con la «S» del Multiplexor 2:1.
    const duenoDelCentro = await page.locator(CONMUTADOR).evaluateAll((els) => els.map((e) => {
      const r = e.getBoundingClientRect();
      const encima = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
      return encima === e || e.contains(encima as Node);
    }));
    expect(duenoDelCentro).toEqual([true, true, true]);

    // Y por tanto se puede tocar en el centro, como cualquier otro conmutador.
    await page.locator(CONMUTADOR).nth(2).tap({ timeout: 3000 });
    await expect(page.locator(CONMUTADOR).nth(2)).toHaveAttribute('aria-pressed', 'true');
  });
});
