import { test, expect } from '@playwright/test';
import { esperarHidratacion } from './_hidratacion';
import { contrasteSobreFondoReal } from './_contraste';

/**
 * Ajuste de recetas por altitud — contraste de la nota «Olla a presión muy recomendable».
 *
 * Cabo C0297 (reparar 01/11/2026): la nota se pintaba con var(--accent), #7FB3D3, que sobre la
 * tarjeta blanca del tema claro da ~2,2:1 (texto de 0,88rem en negrita: pide 4,5:1). Ahora va en
 * --primary-texto, que es el token de la marca como texto en los dos temas. La nota sale a partir
 * de la banda de 2.400 m (lib/calculadoras/altitudCocina.ts).
 */

test.use({ locale: 'es-ES', serviceWorkers: 'block' });

for (const tema of ['claro', 'oscuro'] as const) {
  test(`la nota de la olla a presión llega a 4,5:1 en el tema ${tema}`, async ({ page }) => {
    await page.goto('/ajuste-recetas-altitud/');
    await esperarHidratacion(page, ['#altitud']);
    if (tema === 'oscuro') {
      await page.getByRole('button', { name: 'Cambiar a modo oscuro' }).click();
      await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    }
    await page.locator('#altitud').fill('3600');
    const nota = page.getByText('Olla a presión muy recomendable');
    await expect(nota).toBeVisible();
    // El cambio de tema lleva transición: se mide con los colores ya asentados
    await expect.poll(() => page.evaluate(() => document.getAnimations().length)).toBe(0);
    expect(await contrasteSobreFondoReal(nota)).toBeGreaterThanOrEqual(4.5);
  });
}
