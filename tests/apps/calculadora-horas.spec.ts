import { test, expect, type Page } from '@playwright/test';
import { esperarHidratacion, esperarValorEnReact } from './_hidratacion';

/**
 * Calculadora de Horas — lo que añadió S0224 (24/10/2026), comprobado en el navegador.
 * Las cuentas se resolvieron a mano (el motor tiene las suyas en tests/horas-motor.spec.ts):
 *
 *   45 min + 45 min          = 90 min = 1:30 (media 0:45)
 *   12:50 + media hora       = 770 + 30 = 800 min = 13:20
 *   «45» sin unidad          = 45 horas, y la app avisa de cómo escribir minutos
 *   15 min entre 4           = 225 s = 0:03:45
 *   7:45 por 5               = 38:45
 */

const LINEA = (n: number) => `input[aria-label="Tiempo de la línea ${n}"]`;
const FACTOR_POR = 'input[aria-label="Multiplicar el total por"]';
const FACTOR_ENTRE = 'input[aria-label="Repartir el total entre"]';
/** El número grande del panel «Total» (la clase del módulo CSS lleva un sufijo que cambia). */
const TOTAL = (page: Page) => page.locator('[class*="resultadoGrande"]');

async function escribir(page: Page, selector: string, texto: string): Promise<void> {
  const caja = page.locator(selector);
  await caja.fill(texto);
  await esperarValorEnReact(page, caja, texto);
}

test.describe('calculadora-horas — minutos con unidad y operar el total', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/calculadora-horas/');
    await esperarHidratacion(page, [LINEA(1), FACTOR_POR]);
  });

  test('45 min + 45 min = 1:30', async ({ page }) => {
    await escribir(page, LINEA(1), '45 min');
    await escribir(page, LINEA(2), '45 min');
    await expect(TOTAL(page)).toHaveText('1:30');
    await expect(page.locator('strong', { hasText: /^0:45$/ })).toBeVisible();
    await expect(page.getByText('Hay alguna línea que no se entiende')).toHaveCount(0);
  });

  test('12:50 + media hora = 13:20', async ({ page }) => {
    await escribir(page, LINEA(1), '12:50');
    await escribir(page, LINEA(2), 'media hora');
    await expect(TOTAL(page)).toHaveText('13:20');
  });

  test('una cifra sola se lee como horas y la app lo avisa', async ({ page }) => {
    await escribir(page, LINEA(1), '45');
    await expect(TOTAL(page)).toHaveText('45:00');
    await expect(page.getByText(/Una cifra sin unidad se lee como horas/)).toBeVisible();
    await escribir(page, LINEA(1), '45 min');
    await expect(page.getByText(/Una cifra sin unidad se lee como horas/)).toHaveCount(0);
  });

  test('15 min entre 4 = 0:03:45', async ({ page }) => {
    await escribir(page, LINEA(1), '15 min');
    await page.getByRole('button', { name: '÷ entre' }).click();
    await expect(page.getByRole('button', { name: '÷ entre' })).toHaveAttribute('aria-pressed', 'true');
    await escribir(page, FACTOR_ENTRE, '4');
    await expect(page.locator('strong', { hasText: '0:03:45' })).toBeVisible();
  });

  test('7:45 por 5 = 38:45', async ({ page }) => {
    await escribir(page, LINEA(1), '7:45');
    await escribir(page, FACTOR_POR, '5');
    await expect(page.locator('strong', { hasText: '38:45' })).toBeVisible();
  });

  test('repartir entre cero no da cifra', async ({ page }) => {
    await escribir(page, LINEA(1), '1:00');
    await page.getByRole('button', { name: '÷ entre' }).click();
    await escribir(page, FACTOR_ENTRE, '0');
    await expect(page.getByText('No se puede repartir entre cero.')).toBeVisible();
  });
});
