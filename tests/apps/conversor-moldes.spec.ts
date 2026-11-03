/**
 * Conversor de moldes — lectura de las medidas (cabo C0597, turno de noche 03/11/2026)
 *
 * Las medidas se leían con `parseFloat(x.replace(',', '.')) || 0`: «12abc» valía 12 y «1.500»
 * valía 1,5. Y como el campo pintaba el número en vez de lo tecleado, la coma de «22,5» se borraba
 * al escribirla: no se podía dar una medida con decimales.
 *
 * Casos a mano: molde redondo de 22,5 cm → redondo de 24 cm: (24 / 22,5)² = 1,1378 → «× 1,14».
 * Redondo de 18 → redondo de 24: (24 / 18)² = 1,7778 → «× 1,78» (el estado inicial).
 */

import { test, expect } from '@playwright/test';
import { esperarPaginaAsentada } from './_hidratacion';

const RUTA = '/conversor-moldes/';

test.describe('conversor-moldes — C0597', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(RUTA);
    await esperarPaginaAsentada(page);
  });

  test('una medida con coma decimal se puede escribir y cuenta', async ({ page }) => {
    await expect(page.getByText('× 1,78')).toBeVisible();
    const diametro = page.getByLabel('Diámetro (cm)').first();
    await diametro.fill('');
    await diametro.pressSequentially('22,5');
    await expect(diametro).toHaveValue('22,5');
    await expect(page.getByText('× 1,14')).toBeVisible();
  });

  test('«12abc» no se toma por 12: avisa y no da factor', async ({ page }) => {
    const diametro = page.getByLabel('Diámetro (cm)').first();
    await diametro.fill('12abc');
    await expect(diametro).toHaveAttribute('aria-invalid', 'true');
    await expect(page.getByRole('alert').filter({ hasText: 'mayor que 0' })).toBeVisible();
    await expect(page.getByText('Introduce las dimensiones de los dos moldes.')).toBeVisible();
  });

  test('un molde de la lista sustituye a lo tecleado', async ({ page }) => {
    const diametro = page.getByLabel('Diámetro (cm)').first();
    await diametro.fill('22,5');
    await expect(diametro).toHaveValue('22,5');
    await page.getByLabel('Molde habitual (origen)').selectOption('Redondo 26 cm');
    await expect(diametro).toHaveValue('26');
    // (24 / 26)² = 0,8521 → «× 0,85»
    await expect(page.getByText('× 0,85')).toBeVisible();
  });
});
