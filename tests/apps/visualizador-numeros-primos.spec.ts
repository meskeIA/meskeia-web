import { test, expect, type Page } from '@playwright/test';
import { esperarHidratacion, esperarValorEnReact } from './_hidratacion';

/**
 * Visualizador de números primos — criba por rango y hoja imprimible (semilla S0213, 19/10/2026)
 *
 * Los valores esperados NO salen de la app: son los recuentos de la tabla clásica π(n) —
 * π(100) = 25, π(200) = 46, π(900) = 154, π(1000) = 168—, de donde del 101 al 200 hay 21
 * primos y del 901 al 1000 hay 14. El motor tiene los suyos, más finos, en
 * tests/criba-rango-motor.spec.ts; aquí se mide que la vista los alcance.
 *
 * La criba avanza un primo por pulsación de «Paso a paso», y una pulsación más la cierra
 * (marca como primos los que quedan). Por eso, para cerrar la criba de un rango hacen falta
 * tantas pulsaciones como primos ≤ √hasta, más una:
 *   del 1 al 100    → 2, 3, 5, 7                → 5 pulsaciones
 *   del 101 al 200  → 2, 3, 5, 7, 11, 13        → 7
 *   del 901 al 1000 → los 11 primos hasta el 31 → 12
 */

const RUTA = '/visualizador-numeros-primos/';
const TESTIGO = '[class*="casillaSolucionario"] input';

const contador = (page: Page) => page.locator('[class*="contadorPrimos"]');
const hoja = (page: Page) => page.locator('[data-hoja-criba]');

async function cribarHastaElFinal(page: Page, pulsaciones: number) {
  const boton = page.getByRole('button', { name: 'Paso a paso' });
  for (let i = 0; i < pulsaciones; i++) await boton.click();
}

test.beforeEach(async ({ page }) => {
  await page.goto(RUTA);
  await esperarHidratacion(page, [TESTIGO]);
});

test('CASO 1 · del 1 al 100 por defecto: quedan 25 primos y las cifras van sin «,00»', async ({ page }) => {
  await expect(page.getByRole('button', { name: 'Del 1 al 100', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await cribarHastaElFinal(page, 5);
  await expect(contador(page)).toContainText('Primos encontrados: 25 de 100 números (del 1 al 100)');
  await expect(page.locator('body')).not.toContainText('100,00');
});

test('CASO 2 · del 101 al 200: avisa de que los seis primos que tachan están fuera y deja 21', async ({ page }) => {
  await page.getByRole('button', { name: 'Del 101 al 200' }).click();
  await expect(page.locator('[class*="notaRango"]')).toContainText('2, 3, 5, 7, 11 y 13 no están en la cuadrícula');
  await expect(page.locator('[class*="gridNumeros"] > div').first()).toHaveText('101');
  await cribarHastaElFinal(page, 7);
  await expect(contador(page)).toContainText('21 de 100 números (del 101 al 200)');
});

test('CASO 3 · rango escrito del 901 al 1000: 14 primos', async ({ page }) => {
  const hasta = page.getByLabel('Hasta');
  const desde = page.getByLabel('Desde');
  await hasta.fill('1000');
  await esperarValorEnReact(page, hasta, '1000');
  await desde.fill('901');
  await esperarValorEnReact(page, desde, '901');
  await expect(contador(page)).toContainText('del 901 al 1000');
  await cribarHastaElFinal(page, 12);
  await expect(contador(page)).toContainText('Primos encontrados: 14 de 100 números');
});

test('CASO 4 · un rango invertido se rechaza en voz alta y la criba conserva el último válido', async ({ page }) => {
  const desde = page.getByLabel('Desde');
  await desde.fill('300');
  await esperarValorEnReact(page, desde, '300');
  await expect(page.getByRole('alert').filter({ hasText: 'mayor que el principio' })).toContainText(
    'La criba sigue mostrando del 1 al 100',
  );
  await expect(contador(page)).toContainText('del 1 al 100');
});

test('CASO 5 · la hoja del 101 al 200: pasos, cuadrícula alineada por la última cifra y solucionario', async ({ page }) => {
  await page.getByRole('button', { name: 'Del 101 al 200' }).click();
  await expect(hoja(page)).toContainText('Criba de Eratóstenes del 101 al 200');
  await expect(hoja(page)).toContainText('2, 3, 5, 7, 11 y 13 no están en la cuadrícula');
  await expect(hoja(page)).not.toContainText('Tacha el 1');

  const filas = hoja(page).locator('table tr');
  await expect(filas).toHaveCount(10);
  await expect(filas.first().locator('td').first()).toHaveText('101');
  await expect(filas.last().locator('td').last()).toHaveText('200');

  await expect(hoja(page)).toContainText('Hay 21 primos:');
  await expect(hoja(page)).toContainText('101, 103, 107, 109, 113, 127');
  await page.getByLabel('Añadir el solucionario en una página aparte').uncheck();
  await expect(hoja(page)).not.toContainText('Solucionario');
});

test('CASO 6 · un rango que no empieza en múltiplo de 10 + 1 deja huecos para que cada cifra caiga en su columna', async ({ page }) => {
  const desde = page.getByLabel('Desde');
  await desde.fill('95');
  await esperarValorEnReact(page, desde, '95');
  const primera = hoja(page).locator('table tr').first().locator('td');
  // 95 va bajo el 5: cuatro huecos delante (los de 91-94)
  await expect(primera.nth(3)).toHaveText('');
  await expect(primera.nth(4)).toHaveText('95');
});

test('CASO 7 · al imprimir solo sale la hoja', async ({ page }) => {
  await page.emulateMedia({ media: 'print' });
  await expect(hoja(page)).toBeVisible();
  await expect(page.getByRole('heading', { level: 1 })).toBeHidden();
  await expect(page.getByRole('button', { name: 'Paso a paso' })).toBeHidden();
  await page.emulateMedia({ media: 'screen' });
  await expect(hoja(page)).toBeHidden();
});

test('CASO 8 · el récord de Mersenne es el de GIMPS (2024) y la distribución tiene el 701-800', async ({ page }) => {
  await page.getByRole('button', { name: /Récords/ }).click();
  await expect(page.locator('body')).toContainText('41.024.320');
  await page.getByRole('button', { name: /Patrones/ }).click();
  await expect(page.locator('body')).toContainText('701-800');
  await expect(page.locator('body')).toContainText('52 primos');
});
