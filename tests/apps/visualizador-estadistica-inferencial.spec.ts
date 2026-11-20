import { test, expect } from '@playwright/test';
import { esperarPaginaAsentada } from './_hidratacion';

/**
 * visualizador-estadistica-inferencial — cabo C0857 (/reparar 20/11/2026)
 *
 * Las cifras del HTML salían con toFixed y punto decimal («z = 1.50», «0.134», alfa, beta y la
 * potencia) y las frases del p-valor decían «α=0.05» y «Entre 0.05 y 0.10». Se leen ahora con
 * formatNumber. El contraste de alfa, beta y la potencia, que iban en rojo, naranja y verde puros
 * con style, lo mide la fila de la app en tests/contraste-marca-datos.spec.ts.
 *
 * CASOS, resueltos a mano con los valores iniciales:
 *   p-valor: z = 1,5 bilateral → p = 2·(1 − Φ(1,5)) = 2·(1 − 0,93319) = 0,1336 → «0,134», por
 *     encima de 0,05.
 *   Errores: α = 0,05 → z crítico 1,96; efecto 1,5 → β = Φ(1,96 − 1,5) = Φ(0,46) = 0,677 → «0,68»;
 *     potencia 1 − β = 0,323 → «0,32».
 *   Potencia: n = 30, d = 0,5 → d·√n − 1,96 = 2,739 − 1,96 = 0,779 → Φ = 0,782 → «78 %».
 */

test.describe('visualizador-estadistica-inferencial', () => {
  test('C0857 — las cifras salen con coma decimal y el porcentaje separado', async ({ page }) => {
    await page.goto('/visualizador-estadistica-inferencial/');
    await esperarPaginaAsentada(page);

    const principal = page.locator('main');
    await expect(principal.getByText('z = 1,50', { exact: true })).toBeVisible();
    await expect(principal.getByText('0,134', { exact: true })).toBeVisible();
    await expect(principal.getByText('p = 0,134 — Por encima de 0,05.', { exact: false })).toBeVisible();

    await page.getByRole('button', { name: /Errores/ }).click();
    await expect(principal.getByText('Error Tipo II (β ≈ 0,68)')).toBeVisible();
    await expect(principal.getByText('0,32', { exact: true })).toBeVisible();

    await page.getByRole('button', { name: /Potencia/ }).first().click();
    await expect(principal.getByText('78 %', { exact: true }).first()).toBeVisible();
    await expect(principal.getByText('0,50', { exact: true }).first()).toBeVisible();
  });
});
