import { test, expect } from '@playwright/test';
import { esperarPaginaAsentada } from './_hidratacion';

/**
 * visualizador-optica-ondulatoria — cabo C0858 (/reparar 20/11/2026)
 *
 * Las cifras de los deslizadores y de los resultados salían con toFixed y punto decimal
 * («1.0 mm», «0.55 mm», «θ = ±0.06°») y la intensidad transmitida pegaba el «%». Se leen ahora con
 * formatNumber. El contraste del texto (la longitud de onda escrita en el color de su luz, los
 * tonos del estado) lo mide la fila de la app en tests/contraste-marca-datos.spec.ts.
 *
 * CASOS, resueltos a mano con los valores iniciales:
 *   Young: d = 1,0 mm, D = 1,0 m, λ = 550 nm → Δy = λD/d = 550e-9 · 1 / 1e-3 = 0,55 mm.
 *   Difracción: a = 0,5 mm → a/λ = 0,5e-3 / 550e-9 = 909,09 → «909»; primer mínimo
 *     asen(λ/a) = asen(0,0011) = 0,0630° → «θ = ±0,06°».
 *   Polarización: 45° → cos²45° = 0,5 → «50 % I₀» con espacio duro.
 */

test.describe('visualizador-optica-ondulatoria', () => {
  test('C0858 — las cifras salen con coma decimal y el porcentaje separado', async ({ page }) => {
    await page.goto('/visualizador-optica-ondulatoria/');
    await esperarPaginaAsentada(page);

    const principal = page.locator('main');
    await expect(principal.getByText('1,0 mm', { exact: true })).toBeVisible();
    await expect(principal.getByText('1,0 m', { exact: true })).toBeVisible();
    await expect(principal.getByText('0,55 mm', { exact: true })).toBeVisible();
    await expect(principal.getByText(/\d\.\d/)).toHaveCount(0);

    await page.getByRole('button', { name: /Difracción/ }).click();
    await expect(principal.getByText('0,5 mm', { exact: true })).toBeVisible();
    await expect(principal.getByText('909', { exact: true })).toBeVisible();
    await expect(principal.getByText('θ = ±0,06°', { exact: true })).toBeVisible();

    await page.getByRole('button', { name: /Polarización/ }).click();
    await expect(principal.getByText('50 % I₀', { exact: true })).toBeVisible();
  });
});
