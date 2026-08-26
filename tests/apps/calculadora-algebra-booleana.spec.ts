import { test, expect, type Page } from '@playwright/test';

/**
 * Calculadora de Álgebra Booleana — test de regresión del Inspector (26/08/2026)
 *
 * La app NO tiene campo de expresión: la entrada es la TABLA DE VERDAD (cada celda
 * de F cicla 0 → 1 → X → 0 al pulsarla) y la salida es la forma mínima SOP/POS
 * calculada por Quine-McCluskey en `lib/calculadoras/karnaugh.ts`.
 *
 * Los tres valores esperados están resueltos A MANO con mapa de Karnaugh antes de
 * ejecutar la app; cada uno lleva anotado de dónde sale.
 */

const RUTA = '/calculadora-algebra-booleana/';

/** Panel de resultado (lleva role="status" en la página) */
const resultado = (page: Page) => page.locator('section[role="status"]');

/** Sección del mapa de Karnaugh, para comprobar la leyenda de grupos */
const seccionMapa = (page: Page) => page.locator('h2:text("Mapa de Karnaugh")').locator('..');

async function ponerVariables(page: Page, n: 2 | 3 | 4): Promise<void> {
  await page.getByRole('button', { name: new RegExp('^' + n + ' vars') }).click();
}

async function ponerModo(page: Page, m: 'SOP' | 'POS'): Promise<void> {
  await page.getByRole('button', { name: new RegExp('^' + m) }).click();
}

/** Deja la fila `fila` de la tabla de verdad en el valor pedido, pulsando el ciclo 0 → 1 → X */
async function fijarFila(page: Page, fila: number, valor: 0 | 1 | 'X'): Promise<void> {
  const celda = page.locator(`[aria-label^="Fila ${fila}:"]`);
  for (let intento = 0; intento < 4; intento++) {
    if ((await celda.innerText()).trim() === String(valor)) return;
    await celda.click();
  }
  throw new Error(`No se pudo dejar la fila ${fila} en ${valor}`);
}

test.describe('Calculadora de Álgebra Booleana', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(RUTA);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Álgebra Booleana');
  });

  test('caso normal: función mayoría de 3 variables Σm(3,5,6,7)', async ({ page }) => {
    // Tabla de verdad a mano (índice = ABC, A el bit más significativo):
    //   0:000→0  1:001→0  2:010→0  3:011→1  4:100→0  5:101→1  6:110→1  7:111→1
    // Karnaugh (A en filas, BC en columnas gray 00,01,11,10):
    //   A=0 → 0 0 1 0   ·   A=1 → 0 1 1 1
    // Parejas: {3,7}=BC · {5,7}=AC · {6,7}=AB. No cabe ningún grupo de 4.
    // Los tres son primos y los tres ESENCIALES: el 3 solo lo cubre BC, el 5 solo AC,
    // el 6 solo AB. Mínima = BC + AC + AB → 3 términos, 6 literales.
    await ponerVariables(page, 3);
    for (const fila of [3, 5, 6, 7]) await fijarFila(page, fila, 1);

    await expect(resultado(page)).toContainText('F = BC + AC + AB');
    await expect(resultado(page)).toContainText('Coste: 3 términos · 6 literales');
    await expect(resultado(page)).toContainText('Mintérminos: 3, 5, 6, 7');
    // Los tres grupos van marcados como esenciales en la leyenda del mapa
    // (la insignia es la que lleva el title; el párrafo de abajo también dice «esencial»)
    await expect(
      seccionMapa(page).locator('[title^="Es el único implicante primo"]')
    ).toHaveCount(3);

    // Dual por De Morgan, agrupando los ceros 0,1,2,4:
    //   {0,1}=A'B' → (A + B) · {0,2}=A'C' → (A + C) · {0,4}=B'C' → (B + C)
    await ponerModo(page, 'POS');
    await expect(resultado(page)).toContainText('F = (A + B)(A + C)(B + C)');
    await expect(resultado(page)).toContainText('Coste: 3 términos · 6 literales');
  });

  test('caso límite: 4 variables (el máximo) con don\'t cares — detector BCD ≥ 5', async ({ page }) => {
    // F = Σm(5,6,7,8,9) + d(10..15), con A=8, B=4, C=2, D=1.
    // Implicantes primos sobre unos + don't cares:
    //   A  = 1---  cubre 8..15
    //   BD = -1-1  cubre 5,7,13,15
    //   BC = -11-  cubre 6,7,14,15
    // No hay más: cualquier ampliación exigiría las celdas 0..4, que valen 0.
    // Los tres son esenciales (el 5 solo lo cubre BD, el 6 solo BC, el 8 solo A).
    // Mínima = A + BD + BC → 3 términos, 5 literales.
    //
    // EQUIVALENCIA comprobada fila a fila (no basta con que sea corta):
    //   0000..0011 → 0 · 0100 → 0 (B=1 pero C=0 y D=0) · 0101 → 1 (BD) · 0110 → 1 (BC)
    //   0111 → 1 · 1000 → 1 (A) · 1001 → 1 (A) · 1010..1111 → 1, admitido por ser don't care.
    await ponerVariables(page, 4);
    for (const fila of [5, 6, 7, 8, 9]) await fijarFila(page, fila, 1);
    for (const fila of [10, 11, 12, 13, 14, 15]) await fijarFila(page, fila, 'X');

    await expect(resultado(page)).toContainText('F = A + BD + BC');
    await expect(resultado(page)).toContainText('Coste: 3 términos · 5 literales');
    await expect(resultado(page)).toContainText("Don't Cares: 10, 11, 12, 13, 14, 15");
    // El grupo A absorbe las seis celdas don't care, marcadas con (X) en la leyenda
    await expect(seccionMapa(page)).toContainText('[8, 9, 10(X), 11(X), 12(X), 13(X), 14(X), 15(X)]');

    // El mapa de 4 variables debe estar en código Gray: la fila AB=11 va ANTES que AB=10,
    // y las columnas son 00,01,11,10. Si el orden fuera binario, las adyacencias mentirían.
    const filaAB11 = seccionMapa(page).locator('tbody tr').nth(2);
    const indices = await filaAB11.locator('td').evaluateAll(celdas =>
      celdas.map(c => (c.getAttribute('aria-label') || '').replace(/^Celda (\d+).*$/, '$1'))
    );
    expect(indices).toEqual(['12', '13', '15', '14']);
  });

  test('casos degenerados: contradicción A·A\' = 0, tautología A+A\' = 1 y XOR no simplificable', async ({ page }) => {
    // No hay expresión de texto que malformar, así que lo que hay que rechazar bien
    // son las tablas degeneradas. Cuidado con el cero: es un valor, no una tabla vacía.
    await ponerVariables(page, 2);

    // (a) Todo 0 — contradicción A·A'. Esperado F = 0, sin mintérminos, sin grupos
    //     y SIN línea de coste (no hay ningún término que contar).
    await expect(resultado(page)).toContainText('F = 0');
    await expect(resultado(page)).toContainText('Mintérminos: ninguno');
    await expect(resultado(page)).not.toContainText('Coste:');
    await expect(seccionMapa(page)).not.toContainText('Grupos de la expresión mínima');

    // (b) Todo 1 — tautología A + A'. Esperado F = 1, y los cuatro mintérminos listados.
    for (const fila of [0, 1, 2, 3]) await fijarFila(page, fila, 1);
    await expect(resultado(page)).toContainText('F = 1');
    await expect(resultado(page)).toContainText('Mintérminos: 0, 1, 2, 3');
    await ponerModo(page, 'POS');
    await expect(resultado(page)).toContainText('F = 1'); // la constante no depende de la forma
    await ponerModo(page, 'SOP');

    // (c) XOR [0,1,1,0] — la función que NO se puede simplificar: sus dos mintérminos
    //     no son adyacentes, así que cada uno es su propio implicante primo esencial.
    //     Mínima SOP = A'B + AB' (2 términos, 4 literales); POS = (A + B)(A' + B').
    for (const fila of [0, 3]) await fijarFila(page, fila, 0);
    await expect(resultado(page)).toContainText("F = A'B + AB'");
    await expect(resultado(page)).toContainText('Coste: 2 términos · 4 literales');
    await ponerModo(page, 'POS');
    await expect(resultado(page)).toContainText("F = (A + B)(A' + B')");
  });

  test('hallazgo abierto: pulsar el botón de variables ya activo borra la tabla', async ({ page }) => {
    // Inspector 26/08/2026 — `handleNumVariablesChange` no comprueba si el número pedido
    // es el que ya está puesto, así que reinicia la tabla de verdad aunque no cambie nada.
    // Con 4 variables se pierden 16 celdas puestas a mano, sin aviso ni deshacer.
    // Cuando se corrija, este test debe pasar a esperar que la tabla NO cambie.
    await ponerVariables(page, 2);
    for (const fila of [1, 2]) await fijarFila(page, fila, 1);
    await expect(resultado(page)).toContainText("F = A'B + AB'");

    await ponerVariables(page, 2); // mismo número: no debería tocar nada
    await expect(resultado(page)).toContainText('F = 0'); // …pero hoy borra la tabla entera
  });
});
