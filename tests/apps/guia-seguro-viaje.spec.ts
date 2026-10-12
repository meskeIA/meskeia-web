import { test, expect } from '@playwright/test';

/**
 * guia-seguro-viaje — regresión del cabo C0223 (turno de noche a11y del 11/10/2026).
 *
 * El botón que despliega la nota de cada cobertura empezaba por «▲»/«▼» como texto, sin
 * aria-hidden: el nombre accesible era «▼ Ver detalle» y algunos lectores leen la flecha
 * («triángulo negro hacia abajo»). El candado de a11y no lo veía porque el emoji llega dentro
 * de una expresión. Ahora la flecha va en su propio span oculto y el nombre es el texto.
 */
test('C0223 · «Ver detalle» se nombra sin la flecha y conmuta aria-expanded', async ({ page }) => {
  await page.goto('/guia-seguro-viaje/');
  // Las coberturas salen al elegir destino y tipo de viaje (reintenta hasta que React hidrate)
  const ver = page.getByRole('button', { name: 'Ver detalle', exact: true }).first();
  await expect(async () => {
    await page.getByRole('button', { name: /Europa \/ Schengen/ }).click();
    await page.getByRole('button', { name: /Turismo \/ vacaciones/ }).click();
    await expect(ver).toBeVisible({ timeout: 1000 });
  }).toPass({ timeout: 15000 });
  await expect(page.getByRole('button', { name: /[▲▼]/ })).toHaveCount(0);
  await expect(async () => {
    await ver.click();
    await expect(page.getByRole('button', { name: 'Ocultar detalle', exact: true }).first()).toHaveAttribute(
      'aria-expanded',
      'true',
      { timeout: 1000 },
    );
  }).toPass({ timeout: 15000 });
});
