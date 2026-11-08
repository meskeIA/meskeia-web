import { test, expect } from '@playwright/test';

/**
 * visualizador-carbono — el borde del panel de cada alótropo (cabo C0297, 08/11/2026).
 *
 * El panel toma el color del alótropo con un alfa pegado: `alotropoInfo.color + '66'`. El grafito
 * tenía '#555', así que salía '#55566', un color inválido que el navegador descarta: su panel se
 * quedaba sin el borde de su color. Control: con '#555' el estilo en línea sale vacío y este test
 * cae en el grafito.
 */
test('cada alótropo pinta el borde de su panel con su color al 40 %', async ({ page }) => {
  await page.goto('/visualizador-carbono/');
  const pestanas = page.getByRole('tab');
  await expect(pestanas.first()).toBeVisible();
  const n = await pestanas.count();
  expect(n).toBeGreaterThan(1);
  const panel = page.getByRole('tabpanel').first();
  for (let i = 0; i < n; i++) {
    await pestanas.nth(i).click();
    await expect(pestanas.nth(i)).toHaveAttribute('aria-selected', 'true');
    const nombre = (await pestanas.nth(i).textContent())?.trim();
    await expect(panel).toHaveAttribute('aria-label', `Información sobre ${nombre?.replace(/^\P{L}+/u, '')}`);
    expect(await panel.evaluate((e) => getComputedStyle(e).borderTopColor), `borde de ${nombre}`).toMatch(/^rgba\(\d+, \d+, \d+, 0\.4\)$/);
  }
});
