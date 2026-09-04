import { test, expect, Page } from '@playwright/test';

/**
 * Las dos apps de estadística leen ya las series igual — y lo dicen en pantalla
 *
 * Antes del 04/09/2026 el mismo texto daba resultados distintos en cada una, sin aviso:
 *
 *   entrada        estadistica-avanzada        calculadora-estadistica
 *   23,25,28   →   23,25 (un solo dato)        23 · 25 · 28
 *   1,5 2,3    →   1,5 · 2,3                   1 · 5 · 2 · 3
 *
 * Una fundía los datos y la otra los duplicaba. Ahora las dos usan `parsearSerieNumerica` y
 * muestran cuántos valores han leído y con qué criterio, porque el fallo es invisible en el
 * resultado: una media calculada con seis valores en vez de tres no parece equivocada.
 *
 * La segmentación se prueba a fondo en `tests/serie-numerica-motor.spec.ts`, con 26 casos a
 * mano. Aquí se comprueba lo que no puede verse desde el motor: que las dos apps lo usan,
 * que el eco aparece y que el cálculo posterior sale del número correcto de datos.
 */

const MEDIA_DE_TRES = /1,5|2,3|4,7/; // los valores que deben leerse en el caso decimal

async function escribirEn(page: Page, etiqueta: RegExp | string, texto: string) {
  await page.getByRole('textbox').first().fill(texto);
}

test.describe('calculadora-estadistica', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/calculadora-estadistica/');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Estadística Descriptiva');
  });

  test('«1,5 2,3 4,7» son TRES valores, no seis (era el fallo)', async ({ page }) => {
    await escribirEn(page, 'Datos', '1,5 2,3 4,7');
    await expect(page.getByText('3 valores leídos')).toBeVisible();
    await expect(page.getByText(/coma se ha interpretado como.*decimal/)).toBeVisible();
    // Media de 1,5 · 2,3 · 4,7 = 2,8333…  (con seis valores daría 2,833 también por
    // casualidad, así que se comprueba la MEDIANA, que sí distingue: 2,3 frente a 2,5)
    await expect(page.getByText('2,30').first()).toBeVisible();
  });

  test('«23, 25, 28» siguen siendo tres valores enteros', async ({ page }) => {
    await escribirEn(page, 'Datos', '23, 25, 28');
    await expect(page.getByText('3 valores leídos')).toBeVisible();
    await expect(page.getByText(/23 · 25 · 28/)).toBeVisible();
  });

  test('una columna pegada desde Excel en español se lee entera', async ({ page }) => {
    await escribirEn(page, 'Datos', '15,5\n18,2\n20,1\n17,8\n22,5');
    await expect(page.getByText('5 valores leídos')).toBeVisible();
    await expect(page.getByText(/15,5 · 18,2 · 20,1/)).toBeVisible();
  });

  test('el punto decimal de toda la vida sigue funcionando', async ({ page }) => {
    await escribirEn(page, 'Datos', '15.5 18.2 20.1');
    await expect(page.getByText('3 valores leídos')).toBeVisible();
  });

  test('lo que no es un número se nombra en vez de desaparecer', async ({ page }) => {
    await escribirEn(page, 'Datos', '12 abc 15 ?? 18');
    await expect(page.getByText('3 valores leídos')).toBeVisible();
    await expect(page.getByText(/No se ha reconocido como número.*abc/)).toBeVisible();
  });

  test('cuando el texto admite dos lecturas, la app ofrece la otra en vez de decidir sola', async ({ page }) => {
    await escribirEn(page, 'Datos', '23,25');
    await expect(page.getByText('1 valor leído')).toBeVisible();
    await expect(page.getByText(/admite otra lectura/)).toBeVisible();

    await page.getByRole('button', { name: 'Leerlo así' }).click();
    await expect(page.getByText('2 valores leídos')).toBeVisible();
    await expect(page.getByText(/porque tú lo has indicado/)).toBeVisible();

    // Y se puede volver atrás
    await page.getByRole('button', { name: /detección automática/ }).click();
    await expect(page.getByText('1 valor leído')).toBeVisible();
  });

  test('el ejemplo de temperaturas del propio botón se lee bien', async ({ page }) => {
    await page.getByRole('button', { name: 'Temperaturas' }).click();
    await expect(page.getByText('10 valores leídos')).toBeVisible();
  });
});

test.describe('estadistica-avanzada', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/estadistica-avanzada/');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Estadística');
  });

  test('«23,25,28» son TRES datos, no uno (era el fallo grave: un test t con un solo dato)', async ({ page }) => {
    const grupo1 = page.getByRole('textbox').first();
    await grupo1.fill('23,25,28');
    await expect(page.getByText('3 valores leídos').first()).toBeVisible();
    await expect(page.getByText(/23 · 25 · 28/).first()).toBeVisible();
  });

  test('«1,5 2,3 4,7» se leen como tres decimales', async ({ page }) => {
    await page.getByRole('textbox').first().fill('1,5 2,3 4,7');
    await expect(page.getByText('3 valores leídos').first()).toBeVisible();
    await expect(page.getByText(MEDIA_DE_TRES).first()).toBeVisible();
  });

  test('cada campo lleva su propio eco: dos grupos, dos lecturas', async ({ page }) => {
    const cajas = page.getByRole('textbox');
    await cajas.nth(0).fill('23 25 28 22');
    await cajas.nth(1).fill('20,5 22,1 24,3');
    await expect(page.getByText('4 valores leídos')).toBeVisible();
    await expect(page.getByText('3 valores leídos')).toBeVisible();
  });
});
