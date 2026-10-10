import { test, expect, Page } from '@playwright/test';
import { esperarHidratacion, esperarValorEnReact } from './_hidratacion';

/**
 * Calculadora por Tramos (calculadora-tramos) — creación del 10/10/2026 (semilla S0193)
 *
 * QUÉ TIENE DE ESTADO
 *   Una tabla de tramos editable (añadir antes del último, quitar, el último siempre «sin
 *   límite»), cuatro ejemplos que reescriben TODO el estado, un conmutador porcentaje/precio y
 *   el resultado en vivo sin botón de calcular. El motor (motor.ts) ya se probó con 40 casos a
 *   mano fuera del navegador; aquí se verifican las TRANSICIONES de la vista.
 *
 * VALORES ESPERADOS (resueltos a mano; en pantalla, con 4 cifras enteras no se agrupa: 3750,00)
 *   Ejemplo «Impuesto progresivo»: 0 % hasta 10.000 · 15 % hasta 30.000 · 25 % hasta 60.000 ·
 *   35 % resto, cantidad 33.000:
 *     por tramos   0 + 20.000·0,15 + 3.000·0,25 = 3.750,00 · tipo medio 3.750/33.000 = 11,36 %
 *     al tramo     33.000·0,25 = 8.250,00 · quedan 24.750,00, menos que en 30.000
 *                  (30.000·0,85 = 25.500,00) → aviso de zona visible
 *   Con 30.000 exactos: al tramo 30.000·0,15 = 4.500,00 y ya no hay aviso.
 *   Ejemplo «Descuento por volumen» (10 hasta 100 · 8 hasta 500 · 6 resto), 120 unidades:
 *     por tramos 100·10 + 20·8 = 1.160,00 · al tramo 120·8 = 960,00 < 100·10 = 1.000,00
 */

const LIMITE = (n: number) => `input[aria-label="Límite superior del tramo ${n}"]`;

async function total(page: Page, titulo: string): Promise<string> {
  return (await page.locator('h3', { hasText: titulo }).locator('xpath=following-sibling::p[1]').textContent()) ?? '';
}

test.describe('Calculadora por Tramos', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/calculadora-tramos/');
    await esperarHidratacion(page, [LIMITE(1)]);
  });

  test('estado inicial: ejemplo de impuesto con 33.000 y la zona de «más es peor»', async ({ page }) => {
    expect(await total(page, 'Por tramos (progresivo)')).toContain('3750,00');
    expect(await total(page, 'Al tramo alcanzado (escalonado)')).toContain('8250,00');
    await expect(page.getByText('11,36')).toBeVisible();
    const aviso = page.getByText('Tu cantidad cae en una zona');
    await expect(aviso).toBeVisible();
    await expect(aviso.locator('xpath=..')).toContainText('25.500,00');
    // La última fila no tiene límite editable
    await expect(page.locator(LIMITE(4))).toHaveCount(0);
    await expect(page.getByText('sin límite')).toBeVisible();
  });

  test('cantidad justo en el límite: cuenta en el tramo de abajo y desaparece el aviso', async ({ page }) => {
    const base = page.getByLabel('Cantidad sobre la que se aplica la escala');
    await base.fill('30.000');
    await esperarValorEnReact(page, base, '30.000');
    expect(await total(page, 'Al tramo alcanzado (escalonado)')).toContain('4500,00');
    expect(await total(page, 'Por tramos (progresivo)')).toContain('3000,00');
    await expect(page.getByText('Tu cantidad cae en una zona')).toHaveCount(0);
  });

  test('cargar otro ejemplo reescribe modo, tramos y cantidad', async ({ page }) => {
    await page.getByRole('button', { name: 'Descuento por volumen' }).click();
    await expect(page.getByRole('button', { name: 'Un precio por unidad' })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('columnheader', { name: 'Precio por unidad' })).toBeVisible();
    await expect(page.locator(LIMITE(1))).toHaveValue('100');
    expect(await total(page, 'Por tramos (progresivo)')).toContain('1160,00');
    expect(await total(page, 'Al tramo alcanzado (escalonado)')).toContain('960,00');
    await expect(page.getByText('Tu cantidad cae en una zona').locator('xpath=..')).toContainText('1000,00');
  });

  test('añadir un tramo lo mete antes del último y quitarlo lo deja como estaba', async ({ page }) => {
    await page.getByRole('button', { name: '+ Añadir tramo' }).click();
    await expect(page.locator(LIMITE(4))).toHaveValue('120.000');
    await expect(page.getByText('sin límite')).toBeVisible();
    // Un tramo por encima de la cantidad no cambia el resultado
    expect(await total(page, 'Por tramos (progresivo)')).toContain('3750,00');
    await page.getByRole('button', { name: 'Quitar el tramo 4' }).click();
    await expect(page.locator(LIMITE(4))).toHaveCount(0);
    expect(await total(page, 'Al tramo alcanzado (escalonado)')).toContain('8250,00');
  });

  test('quitar el último tramo convierte el anterior en «sin límite»', async ({ page }) => {
    await page.getByRole('button', { name: 'Quitar el tramo 4' }).click();
    await expect(page.locator(LIMITE(3))).toHaveCount(0);
    // Ahora el 25 % se aplica sin tope: 33.000 sigue en el tramo 3
    expect(await total(page, 'Por tramos (progresivo)')).toContain('3750,00');
  });

  test('límites que no crecen: avisa del error y no pinta resultados', async ({ page }) => {
    const limite2 = page.locator(LIMITE(2));
    await limite2.fill('5.000');
    await esperarValorEnReact(page, limite2, '5.000');
    await expect(page.getByRole('alert').filter({ hasText: 'tramo' })).toContainText('El límite del tramo 2 tiene que ser mayor');
    await expect(page.locator('h3', { hasText: 'Por tramos (progresivo)' })).toHaveCount(0);
  });
});
