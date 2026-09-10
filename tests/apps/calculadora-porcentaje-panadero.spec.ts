import { test, expect, Page } from '@playwright/test';

/**
 * calculadora-porcentaje-panadero — el prefermento como ingrediente compuesto (S0134, 10/09/2026)
 *
 * QUÉ SE ARREGLÓ. El campo de ingrediente es de nombre libre, así que escribir «Masa madre 200»
 * es lo natural. Hasta hoy esos 200 g entraban como un ingrediente plano: ni su harina contaba
 * como harina, ni su agua como agua. La app enseñaba entonces una hidratación FALSA y encima la
 * etiquetaba («hidratación estándar, equilibrada»), que es justo lo que prohíbe la regla de no
 * dar una cifra bajo un aviso. La app hermana /calculadora-masa-madre/ ya explicaba el problema
 * en su bloque educativo y sí lo resolvía; la que lo necesitaba, no.
 *
 * EL CASO, RESUELTO A MANO ANTES DE ABRIR EL NAVEGADOR
 *   Receta: 1000 g harina · 650 g agua · 20 g sal · 3 g levadura · 200 g masa madre al 100 %
 *   La masa madre al 100 % son partes iguales: 200 / (1 + 100/100) = 100 g de harina, y el
 *   resto, 100 g, de agua.
 *     harina total = 1000 + 100 = 1100 g      agua total = 650 + 100 = 750 g
 *     hidratación  = 750 / 1100 = 68,18 %  →  68,2 %   (antes: 650/1000 = 65,0 %)
 *     sal          =  20 / 1100 =  1,818 % →   1,8 %   (antes: 20/1000 = 2,0 %)
 *     harina prefermentada = 100 / 1100 = 9,09 % → 9,1 %
 *     peso de masa = 1000 + 650 + 20 + 3 + 200 = 1873 g  (no cambia: el prefermento pesa igual)
 *   En MODO GRAMOS la balanza no cambia —lo que se teclea es lo que se pesa: 1000 de harina,
 *   650 de agua y los 200 de masa madre enteros—; lo que cambia son los porcentajes, porque el
 *   100 % pasa a ser la harina TOTAL. El descuento de harina y agua se ve en el modo inverso,
 *   donde los porcentajes son los de la fórmula total (cubierto en panaderia-motores.spec.ts).
 *
 *   68,2 % NO cambia de categoría: la escala de la app pone «estándar» en 60-70. La primera
 *   versión de este fichero afirmaba que sí y el test lo tumbó — la desviación cruza la
 *   frontera con más prefermento: 400 g de la misma masa madre dan 70,8 %, ya «alta».
 *
 * La aritmética del motor la cubre tests/panaderia-motores.spec.ts (11 casos). Aquí se
 * comprueba lo que el motor no puede ver: que la vista marque sola el prefermento por su
 * nombre, que enseñe la cifra buena y que la lista de la balanza siga cuadrando.
 */

const RUTA = '/calculadora-porcentaje-panadero/';

/** Rellena la fila n-ésima de la lista de ingredientes (0 = la primera). */
async function escribirIngrediente(page: Page, indice: number, nombre: string, valor: string) {
  const fila = page.getByRole('listitem').nth(indice);
  await fila.getByLabel('Nombre del ingrediente').fill(nombre);
  await fila.getByRole('textbox').nth(1).fill(valor);
}

async function anadirMasaMadre(page: Page, gramos: string) {
  await page.getByRole('button', { name: '+ Añadir ingrediente' }).click();
  await escribirIngrediente(page, 3, 'Masa madre', gramos);
}

const calcular = (page: Page) =>
  page.getByRole('button', { name: 'Calcular porcentajes' }).click();

test.describe('Prefermento: la hidratación que se enseña es la real', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(RUTA);
  });

  test('SIN prefermento nada cambia: 1000 g de harina y 650 de agua siguen siendo el 65,0 %', async ({ page }) => {
    await calcular(page);
    await expect(page.getByText('65,0 %').first()).toBeVisible();
    await expect(page.getByRole('note')).toContainText('hidratación estándar, equilibrada');
    // La segunda tabla es solo para prefermentos: sin ellos no debe aparecer.
    await expect(page.getByRole('region', { name: 'Lo que se pesa en la balanza' })).toHaveCount(0);
  });

  test('«Masa madre» se marca sola como prefermento al escribir el nombre', async ({ page }) => {
    await anadirMasaMadre(page, '200');
    const fila = page.getByRole('listitem').nth(3);
    await expect(
      fila.getByRole('button', { name: /Tratar Masa madre como prefermento/ }),
    ).toHaveAttribute('aria-pressed', 'true');
    // Y aparece su hidratación, al 100 % por defecto y editable.
    await expect(fila.getByLabel(/Hidratación de Masa madre/)).toHaveValue('100');
  });

  test('EL CASO: con la masa madre declarada, la hidratación es 68,2 % y la sal 1,8 %', async ({ page }) => {
    await anadirMasaMadre(page, '200');
    await calcular(page);

    const nota = page.getByRole('note');
    await expect(nota).toContainText('68,2 %');
    // Y dice cuál era la cifra vieja, para que se entienda cuál de las dos creer.
    await expect(nota).toContainText('65,0 %');

    const formulaTotal = page.getByRole('region', { name: 'Tabla de porcentajes del panadero' });
    await expect(formulaTotal.getByRole('row', { name: /Harina \(total\)/ })).toContainText('1100 g');
    await expect(formulaTotal.getByRole('row', { name: /Agua \(total\)/ })).toContainText('750 g');
    await expect(formulaTotal.getByRole('row', { name: /Sal/ })).toContainText('1,8 %');

    // La tarjeta de resumen, no la mención del bloque educativo (que también dice el término).
    const tarjeta = page.getByText('Harina prefermentada', { exact: true }).locator('..');
    await expect(tarjeta).toContainText('9,1 %');
  });

  test('CAMBIO DE CATEGORÍA: con 400 g de masa madre, 65,0 % declarado son 70,8 % reales', async ({ page }) => {
    await anadirMasaMadre(page, '400');
    await calcular(page);

    const nota = page.getByRole('note');
    await expect(nota).toContainText('70,8 %');
    await expect(nota).toContainText('hidratación alta, miga abierta');
    await expect(nota).toContainText('65,0 %');
  });

  test('La balanza cuadra: lo que se pesa es lo que se tecleó, y el prefermento entero', async ({ page }) => {
    await anadirMasaMadre(page, '200');
    await calcular(page);

    const balanza = page.getByRole('region', { name: 'Lo que se pesa en la balanza' });
    await expect(balanza.getByRole('row', { name: /Harina/ })).toContainText('1000 g');
    await expect(balanza.getByRole('row', { name: /Agua/ })).toContainText('650 g');
    // El prefermento va entero, con el desglose de lo que aporta a cada lado.
    const filaPref = balanza.getByRole('row', { name: /Masa madre/ });
    await expect(filaPref).toContainText('200 g');
    await expect(filaPref).toContainText('100 g harina + 100 g agua');

    // El peso total de la masa no cambia por declarar el prefermento.
    await expect(page.getByText('1873 g')).toBeVisible();
  });

  test('Una madre FIRME al 50 % reparte distinto: 300 g son 200 de harina y 100 de agua', async ({ page }) => {
    await anadirMasaMadre(page, '300');
    await page.getByLabel(/Hidratación de Masa madre/).fill('50');
    await calcular(page);

    const filaPref = page
      .getByRole('region', { name: 'Lo que se pesa en la balanza' })
      .getByRole('row', { name: /Masa madre/ });
    await expect(filaPref).toContainText('200 g harina + 100 g agua');
    // harina total 1200, agua total 750 → 62,5 %
    await expect(page.getByRole('note')).toContainText('62,5 %');
  });

  test('Desmarcarlo a mano vuelve a la cuenta plana, y el usuario manda sobre la detección', async ({ page }) => {
    await anadirMasaMadre(page, '200');
    const fila = page.getByRole('listitem').nth(3);
    await fila.getByRole('button', { name: /Tratar Masa madre como prefermento/ }).click();
    await expect(
      fila.getByRole('button', { name: /Tratar Masa madre como prefermento/ }),
    ).toHaveAttribute('aria-pressed', 'false');

    await calcular(page);
    await expect(page.getByRole('note')).toContainText('65,0 %');
    await expect(page.getByRole('region', { name: 'Lo que se pesa en la balanza' })).toHaveCount(0);
  });

  test('DOS AGUAS: las filas de agua se suman, no se coge solo la primera', async ({ page }) => {
    // 1000 g de harina, 400 + 250 de agua → 65,0 %, no 40,0 %.
    await escribirIngrediente(page, 0, 'Agua', '400');
    await page.getByRole('button', { name: '+ Añadir ingrediente' }).click();
    await escribirIngrediente(page, 3, 'Agua tibia', '250');
    await calcular(page);
    await expect(page.getByRole('note')).toContainText('65,0 %');
  });
});
