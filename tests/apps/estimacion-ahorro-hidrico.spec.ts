import { test, expect } from '@playwright/test';
import { esperarHidratacion, esperarPaginaAsentada, esperarValorEnReact } from './_hidratacion';

/**
 * estimacion-ahorro-hidrico — el campo del precio del agua, que es un NumberInput con mínimo
 * decimal (0,5 €/m³).
 *
 * De dónde sale (cabo C0850, 20/11/2026): NumberInput acotaba al salir del campo con
 * `min.toString()`, y con un límite decimal el campo pasaba de «0,2» a «0.5», en formato
 * inglés. Se vio en simulador-efecto-fotoelectrico (hallazgo 5276); esta es la otra app del
 * catálogo que pasa a NumberInput un límite literal con decimales, medida al repararlo.
 */

const PRECIO = 'input[aria-label="Precio del agua (€/m³)"]';

test.beforeEach(async ({ page }) => {
  await page.goto('/estimacion-ahorro-hidrico/');
  await esperarPaginaAsentada(page);
  await esperarHidratacion(page, [PRECIO]);
});

test('C0850 · un precio por debajo de 0,5 se acota al salir del campo a «0,5», con coma', async ({ page }) => {
  const precio = page.locator(PRECIO);
  await precio.fill('0,2');
  await esperarValorEnReact(page, precio, '0,2');
  await precio.blur();
  await expect(precio).toHaveValue('0,5');
});

test('C0850 · un límite entero se sigue escribiendo como antes: por encima de 5, «5»', async ({ page }) => {
  const precio = page.locator(PRECIO);
  await precio.fill('7,5');
  await esperarValorEnReact(page, precio, '7,5');
  await precio.blur();
  await expect(precio).toHaveValue('5');
});
