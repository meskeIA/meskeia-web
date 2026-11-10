import { test, expect } from '@playwright/test';

/**
 * visualizador-cinetica-quimica — las cifras salen en formato español (10/11/2026).
 *
 * Hasta el 10/11/2026 las doce cifras de la página se pintaban con toFixed: «5.0 s», «0.10» y
 * «2.00×10⁻³», con punto decimal. Casos a mano con los valores de carga:
 *   orden 0, k = 0,10 → t½ = [A]₀/(2k) = 1/0,2 = 5,0 s
 *   orden 1, k = 0,30 → t½ = ln 2/k = 0,6931/0,3 = 2,31 → 2,3 s
 *   orden 2, k = 0,50 → t½ = 1/(k·[A]₀) = 1/0,5 = 2,0 s
 *   Arrhenius a T = 500 K → 1/T = 0,002 → «2,00×10⁻³» en el eje del gráfico linealizado
 */
test.describe('visualizador-cinetica-quimica', () => {
  test('las vidas medias, las k y 1/T salen con coma decimal', async ({ page }) => {
    await page.goto('/visualizador-cinetica-quimica/');
    const comparativa = page.locator("[class*='vidaMediaValores']");
    await expect(comparativa).toContainText('5,0 s');
    await expect(comparativa).toContainText('2,3 s');
    await expect(comparativa).toContainText('2,0 s');
    for (const k of ['0,10', '0,30', '0,50']) {
      await expect(page.locator("[class*='kSliderRow']", { hasText: k })).toHaveCount(1);
    }
    await expect(page.locator('svg text', { hasText: '2,00×10⁻³' })).toHaveCount(1);
    // Ninguna cifra con punto decimal en el texto de la página principal
    const texto = await page.locator('main, body').first().innerText();
    expect(texto).not.toMatch(/\b\d+\.\d+\s?s\b/);
  });
});
