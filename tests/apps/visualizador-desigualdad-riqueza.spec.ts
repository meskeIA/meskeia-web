import { test, expect } from '@playwright/test';

/**
 * visualizador-desigualdad-riqueza — cabo C0454 (Ronda del 25/10/2026)
 *
 * Al estrechar la ventana deprisa con el equipo cargado, Chart.js perdía el último
 * redimensionado y los dos lienzos se quedaban con su ancho de 800 px (736) a 390: la página
 * medía 772. No es una pista que crece (minmax no aplica): la reparación vuelve a
 * redimensionar los gráficos cuando la ventana deja de cambiar.
 *
 * Instrumento: la secuencia de la Ronda con la CPU frenada a 20× por CDP. Sin la reparación,
 * 8 de 10 intentos se quedaban en 772 aun después de quitar el freno (medido el 25/10/2026
 * con .reparar-trabajo/medir-c0454.mjs); con ella, 0 de 10. Una pasada en verde no prueba
 * nada, por eso el test repite cuatro.
 */
const RUTA = '/visualizador-desigualdad-riqueza/';

test('de 1280 a 390 px con la CPU frenada, los gráficos acaban en su columna y la página en 390', async ({
  browser,
  baseURL,
}) => {
  test.setTimeout(120_000);
  for (let intento = 1; intento <= 4; intento++) {
    // Contexto nuevo en cada intento, como el instrumento que lo midió
    const contexto = await browser.newContext({ viewport: { width: 1280, height: 900 }, baseURL });
    const page = await contexto.newPage();
    await page.goto(RUTA);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('canvas')).toHaveCount(2);
    const cdp = await page.context().newCDPSession(page);
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 20 });
    for (const ancho of [1024, 800, 390]) {
      await page.setViewportSize({ width: ancho, height: 900 });
      await page.waitForTimeout(150);
    }
    await page.waitForTimeout(3000);
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
    await expect
      .poll(() => page.evaluate(() => document.body.scrollWidth), {
        message: `intento ${intento}`,
        timeout: 5000,
      })
      .toBeLessThanOrEqual(390);
    await contexto.close();
  }
});

test('la tabla de políticas escribe el Gini con coma y la reducción como porcentaje español', async ({
  page,
}) => {
  await page.goto(RUTA);
  const filas = page.locator('table tbody tr');
  await expect(filas.first()).toBeVisible();
  const n = await filas.count();
  expect(n).toBeGreaterThan(0);
  for (let i = 0; i < n; i++) {
    const celdas = filas.nth(i).locator('td');
    await expect(celdas.nth(2)).toHaveText(/^0,\d\d$/);
    await expect(celdas.nth(3)).toHaveText(/^0,\d\d$/);
    // Espacio duro antes del %, como pide la Ortografía de la RAE
    await expect(celdas.nth(4)).toHaveText(/^-\d+ %$/);
  }
  await expect(page.locator('[class*="giniBadgeValor"]')).toHaveText(/^0,\d\d$/);
});
