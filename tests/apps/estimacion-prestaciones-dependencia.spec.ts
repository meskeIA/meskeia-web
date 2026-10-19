/**
 * estimacion-prestaciones-dependencia — cabo C0313 (19/10/2026).
 *
 * El anexo IV del RD 1051/2013 (BOE-A-2013-13811, consolidado leído el 19/10/2026) fija dos
 * excepciones a la cuantía general de la prestación vinculada al servicio (PEVS): vinculada a la
 * atención RESIDENCIAL, el grado II tiene la del grado III; vinculada a un CENTRO DE DÍA, el
 * grado I tiene la del grado II. La app solo daba la general: con Grado II, 445,30 € para
 * cualquier servicio, cuando una plaza residencial llega a 747,25 €.
 */
import { test, expect } from '@playwright/test';

test.describe('estimacion-prestaciones-dependencia — excepciones de la PEVS (cabo C0313)', () => {
  test('Grado II: la PEVS general es 445,30 € y la vinculada a una residencia, 747,25 €', async ({ page }) => {
    await page.goto('/estimacion-prestaciones-dependencia/');
    const boton = page.getByRole('button', { name: /^Seleccionar Grado II —/ });
    // Un clic previo a la hidratación se pierde: se repite hasta que React lo recoge.
    await expect(async () => {
      await boton.click();
      await expect(boton).toHaveAttribute('aria-pressed', 'true', { timeout: 1000 });
    }).toPass();

    const pevs = page.locator('[class*="prestacionItem"]').filter({ hasText: 'PEVS' });
    await expect(pevs).toContainText('445,30');
    await expect(pevs).toContainText('Vinculada a una plaza residencial: hasta 747,25');
  });

  test('Grado I: la vinculada a un centro de día llega a 445,30 €, la del Grado II', async ({ page }) => {
    await page.goto('/estimacion-prestaciones-dependencia/');
    const boton = page.getByRole('button', { name: /^Seleccionar Grado I —/ });
    await expect(async () => {
      await boton.click();
      await expect(boton).toHaveAttribute('aria-pressed', 'true', { timeout: 1000 });
    }).toPass();

    const pevs = page.locator('[class*="prestacionItem"]').filter({ hasText: 'PEVS' });
    await expect(pevs).toContainText('313,50');
    await expect(pevs).toContainText('Vinculada a un centro de día: hasta 445,30');
  });

  test('Grado III: sin excepción que añadir', async ({ page }) => {
    await page.goto('/estimacion-prestaciones-dependencia/');
    const boton = page.getByRole('button', { name: /^Seleccionar Grado III —/ });
    await expect(async () => {
      await boton.click();
      await expect(boton).toHaveAttribute('aria-pressed', 'true', { timeout: 1000 });
    }).toPass();

    const pevs = page.locator('[class*="prestacionItem"]').filter({ hasText: 'PEVS' });
    await expect(pevs).toContainText('747,25');
    await expect(pevs).not.toContainText('Vinculada a una');
  });
});
