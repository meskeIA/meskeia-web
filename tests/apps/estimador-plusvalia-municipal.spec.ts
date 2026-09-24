import { test, expect, Page } from '@playwright/test';
import { esperarHidratacion, esperarValorEnReact } from './_hidratacion';

/**
 * estimador-plusvalia-municipal — el coeficiente del método objetivo del IIVTNU
 * Escrito el 24/09/2026, al reparar los hallazgos 1559 y 1560 del Inspector.
 *
 * QUÉ DEFECTOS TENÍA
 * ──────────────────
 *  · 1559 — la tabla de coeficientes máximos era la que el RDL 26/2021 dio al art. 107.4
 *    TRLRHL (vigente del 10/11/2021 al 31/12/2022): 7 años → 0,12, 20 o más → 0,45. La vigente
 *    es la del art. 24 del RDL 8/2023, cotejada ese día en el BOE (BOE-A-2004-4214, bloque
 *    a107, versión del 28/01/2026: las actualizaciones posteriores decayeron):
 *        <1 año 0,15 · 1 0,15 · 2 0,14 · 3 0,14 · 4 0,16 · 5 0,18 · 6 0,19 · 7 0,20 · 8 0,19 ·
 *        9 0,15 · 10 0,12 · 11 0,10 · 12-15 0,09 · 16 0,10 · 17 0,13 · 18 0,17 · 19 0,23 ·
 *        igual o superior a 20 años 0,40
 *  · 1560 — por debajo del año, el art. 107.4 manda prorratear el coeficiente anual «teniendo
 *    en cuenta el número de meses completos». La FAQ de la app lo prometía y el cálculo
 *    aplicaba el 0,15 entero a cualquier reventa dentro del año. Desde la reparación, al elegir
 *    «Menos de 1 año» aparece un selector de meses completos y sin él no se calcula.
 *
 * Todas las cifras esperadas de este fichero están resueltas A MANO con la tabla de arriba y
 * escritas literales, tal como las pinta `formatCurrency` (es-ES: los importes de cuatro
 * cifras enteras van SIN punto de millar, «2000,00 €»).
 */

const RUTA = '/estimador-plusvalia-municipal/';

const SUELO = 'input[aria-label="Valor catastral del suelo (€)"]';
const TIPO = 'input[aria-label="Tipo impositivo municipal (%)"]';
const ANIOS = 'select[aria-label="Años de tenencia del inmueble"]';
const MESES = '#meses-tenencia';

/** Abre la app y espera a que React haya montado los dos campos de texto. */
async function abrir(page: Page): Promise<void> {
  await page.goto(RUTA);
  await esperarHidratacion(page, [SUELO, TIPO]);
}

/** Escribe en un NumberInput y comprueba que el ESTADO de React lo recogió. */
async function escribir(page: Page, selector: string, valor: string): Promise<void> {
  const campo = page.locator(selector);
  await campo.fill(valor);
  await esperarValorEnReact(page, campo, valor);
}

/** Valor que pinta la tarjeta de resultado cuyo título es `titulo` (la primera, la del objetivo). */
async function tarjeta(page: Page, titulo: string): Promise<string> {
  const card = page.locator('h3', { hasText: titulo }).first().locator('xpath=../..');
  return (await card.locator('p').first().innerText()).replace(/\s+/g, ' ').trim();
}

/** El distintivo «Coeficiente: …» que acompaña a la etiqueta de los años. */
function distintivo(page: Page) {
  return page.locator('label', { hasText: 'Años de tenencia' }).locator('span');
}

const BOTON = 'button[aria-label="Obtener estimación orientativa"]';

test.describe('Estimador de plusvalía municipal — coeficientes del art. 107.4 TRLRHL', () => {
  /**
   * CASO NORMAL — 7 años, el coeficiente más alto de la tabla por debajo de los 20.
   *
   *   Valor catastral del suelo 40.000 €, 7 años de tenencia, tipo municipal 25 %
   *   Coeficiente (art. 107.4, 7 años)       0,20
   *   Base imponible = 40.000 × 0,20        = 8.000,00 €
   *   Cuota          = 8.000 × 25 %         = 2.000,00 €
   *
   * Con la tabla caducada del RDL 26/2021 (0,12) salían 4.800,00 € de base y 1.200,00 € de
   * cuota: 800,00 € menos de lo que la ley vigente permite liquidar al Ayuntamiento.
   */
  test('CASO NORMAL — 40.000 € de suelo, 7 años y tipo del 25 %: 40.000 × 0,20 × 25 % = 2000,00 €', async ({
    page,
  }) => {
    await abrir(page);

    await escribir(page, SUELO, '40000');
    await escribir(page, TIPO, '25');
    await page.locator(ANIOS).selectOption('7');
    // El distintivo sale del estado de React: si lo pinta, la selección llegó
    await expect(distintivo(page)).toHaveText('Coeficiente: 0,20');
    // Y el desplegable enseña el mismo coeficiente junto a la opción
    await expect(page.locator(`${ANIOS} option[value="7"]`)).toHaveText('7 años (coef. 0,20)');

    await page.locator(BOTON).click();

    expect(await tarjeta(page, 'Base imponible estimada')).toBe('8000,00 €');
    expect(await tarjeta(page, 'Cuota orientativa')).toBe('2000,00 €');
    await expect(page.locator('p', { hasText: 'Coeficiente aplicado:' })).toContainText(
      'Coeficiente aplicado: 0,20'
    );
    // Sin meses que pedir: el selector solo existe por debajo del año
    await expect(page.locator(MESES)).toHaveCount(0);
  });

  /**
   * CASO BAJO EL AÑO — 6 meses completos: el coeficiente se PRORRATEA (hallazgo 1560).
   *
   *   Valor catastral del suelo 40.000 €, «Menos de 1 año» y 6 meses completos, tipo 25 %
   *   Coeficiente = 0,15 × 6/12              = 0,075 → el distintivo lo pinta con cuatro
   *                                            decimales: «0,0750»
   *   Base imponible = 40.000 × 0,075        = 3.000,00 €
   *   Cuota          = 3.000 × 25 %          =   750,00 €
   *
   * Antes de la reparación se aplicaba el 0,15 entero (0,14 con la tabla caducada): 6.000,00 €
   * de base y 1.500,00 € de cuota, el DOBLE de lo que la ley permite con seis meses.
   */
  test('CASO BAJO EL AÑO — 6 meses: 0,15 × 6/12 = 0,075 → 40.000 × 0,075 × 25 % = 750,00 €', async ({
    page,
  }) => {
    await abrir(page);

    await escribir(page, SUELO, '40000');
    await escribir(page, TIPO, '25');
    await page.locator(ANIOS).selectOption('0');
    await expect(page.locator(`${ANIOS} option[value="0"]`)).toHaveText('Menos de 1 año (coef. 0,15)');

    // El selector de meses aparece solo con «Menos de 1 año»
    await expect(page.locator(MESES)).toBeVisible();
    await page.locator(MESES).selectOption('6');
    await expect(distintivo(page)).toHaveText('Coeficiente: 0,0750');

    await page.locator(BOTON).click();

    expect(await tarjeta(page, 'Base imponible estimada')).toBe('3000,00 €');
    expect(await tarjeta(page, 'Cuota orientativa')).toBe('750,00 €');
  });

  /**
   * CASO DE RECHAZO — «Menos de 1 año» sin decir cuántos meses: no se calcula.
   *
   * Sin los meses el prorrateo no tiene con qué hacerse, y aplicar el coeficiente anual
   * entero (lo que hacía la app antes del hallazgo 1560) daría una cuota por encima de la
   * que la ley admite para CUALQUIER número de meses por debajo de doce. La app tiene que
   * pedir el dato y no pintar ninguna cifra: ni resultado, ni el distintivo del coeficiente.
   *
   * Se parte de un resultado YA calculado (el del caso normal, 2000,00 €) para que «ninguna
   * cifra» signifique algo: el rechazo tiene que retirar la que había, no solo no pintar una.
   */
  test('CASO DE RECHAZO — menos de 1 año sin meses: aviso y ninguna cifra', async ({ page }) => {
    await abrir(page);

    await escribir(page, SUELO, '40000');
    await escribir(page, TIPO, '25');
    await page.locator(ANIOS).selectOption('7');
    await expect(distintivo(page)).toHaveText('Coeficiente: 0,20');
    await page.locator(BOTON).click();
    expect(await tarjeta(page, 'Cuota orientativa')).toBe('2000,00 €');

    await page.locator(ANIOS).selectOption('0');
    await expect(page.locator(MESES)).toBeVisible();
    await expect(page.locator(MESES)).toHaveValue('');
    // Sin meses no hay coeficiente que enseñar
    await expect(distintivo(page)).toHaveCount(0);

    await page.locator(BOTON).click();

    const aviso = page.locator('[role="alert"]', { hasText: 'Con menos de 1 año' });
    await expect(aviso).toContainText(
      'Con menos de 1 año, indica los meses completos: el coeficiente se prorratea por ellos.'
    );
    await expect(page.locator('h2', { hasText: 'Estimación orientativa' })).toHaveCount(0);
    await expect(page.locator('h3', { hasText: 'Cuota orientativa' })).toHaveCount(0);
  });

  /**
   * LA TABLA DE COEFICIENTES del bloque educativo — la que el usuario consulta para
   * contrastar el coeficiente con la ordenanza de su Ayuntamiento.
   *
   *   «20 o más años» → 0,40 (art. 107.4 vigente: «Igual o superior a 20 años. 0,40»).
   *   Con la tabla caducada del RDL 26/2021 ponía 0,45.
   *
   * Y los dos extremos del desplegable dicen lo mismo que la tabla.
   */
  test('TABLA — «20 o más años» = 0,40, en la tabla y en el desplegable', async ({ page }) => {
    await abrir(page);

    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
    const tabla = page.locator('table', { has: page.locator('th', { hasText: 'Coeficiente máximo' }) });
    const fila = tabla.locator('tr', { has: page.locator('td', { hasText: '20 o más años' }) });
    await expect(fila.locator('td').nth(1)).toHaveText('0,40');
    // 21 filas: menos de 1 año, de 1 a 19 años, y 20 o más
    await expect(tabla.locator('tbody tr')).toHaveCount(21);

    await expect(page.locator(`${ANIOS} option[value="20"]`)).toHaveText('20 o más años (coef. 0,40)');
  });
});
