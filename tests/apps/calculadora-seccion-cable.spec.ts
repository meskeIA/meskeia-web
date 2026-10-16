import { test, expect, type Page } from '@playwright/test';
import { esperarHidratacion, sembrarValor } from './_hidratacion';

/**
 * Calculadora de Sección de Cable — regresión del criterio de intensidad admisible (16/10/2026)
 *
 * ORIGEN: mensaje de contacto, «es imposible que 40 A pasen por un cable de 1,5». La app solo
 * aplicaba la caída de tensión: con 40 A en 5 m la caída es mínima y el titular decía
 * «Sección recomendada: 1,5 mm²». Ahora la recomendada es la mayor de caída e intensidad
 * admisible (REBT, ITC-BT-19, Tabla 1). Los números están resueltos a mano en la cabecera de
 * tests/seccion-cable-motor.spec.ts; aquí se comprueba que llegan a la pantalla.
 *
 *   40 A · 5 m · 230 V · cobre · método B
 *     PVC (columna 5): 1,5→15 · 2,5→21 · 4→27 · 6→36 · 10→50 A  → 10 mm²
 *     XLPE (columna 9): 21 · 29 · 38 · 49 A                      → 6 mm²
 *     Modo caída con 1,5 mm² instalados: admite 15 A → no aguanta los 40 A
 *     Aluminio: la Tabla 1 no lo recoge → solo «Sección por caída de tensión: 1,5 mm²»
 */

const veredicto = (page: Page) => page.locator('section[role="status"]');

async function caso40A5m(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Corriente (A)' }).click();
  await sembrarValor(page, '#corriente', 40);
  await sembrarValor(page, '#longitud', 5);
}

test.describe('calculadora-seccion-cable — intensidad admisible', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/calculadora-seccion-cable/');
    await esperarHidratacion(page, ['#tension', '#longitud']);
  });

  test('40 A en 5 m con PVC: 10 mm², no 1,5', async ({ page }) => {
    await caso40A5m(page);
    await expect(veredicto(page).locator('strong')).toHaveText('Sección recomendada: 10 mm²');
    await expect(veredicto(page)).toContainText('bastarían 1,5 mm²');
    await expect(veredicto(page)).toContainText('(50 A)');
  });

  test('con XLPE el mismo caso pide 6 mm²', async ({ page }) => {
    await caso40A5m(page);
    await page.getByRole('button', { name: 'XLPE o EPR' }).click();
    await expect(veredicto(page).locator('strong')).toHaveText('Sección recomendada: 6 mm²');
  });

  test('modo caída: 1,5 mm² instalados con 40 A no aguantan', async ({ page }) => {
    await caso40A5m(page);
    await page.getByRole('button', { name: /La caída de tensión/ }).click();
    await page.getByRole('button', { name: '1,5 mm²', exact: true }).click();
    await expect(veredicto(page).locator('strong')).toContainText('1,5 mm² no aguanta');
    await expect(veredicto(page)).toContainText('admite 15 A');
  });

  test('aluminio: sin tabla no hay sección recomendada', async ({ page }) => {
    await caso40A5m(page);
    await page.getByRole('button', { name: 'Aluminio', exact: true }).click();
    await expect(veredicto(page).locator('strong')).toHaveText(
      'Sección por caída de tensión: 1,5 mm²',
    );
    await expect(veredicto(page)).toContainText('No es una sección recomendada');
  });

  test('F y G solo se ofrecen en trifásico', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'B', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'F', exact: true })).toHaveCount(0);
    await page.getByRole('button', { name: 'Trifásico' }).click();
    await expect(page.getByRole('button', { name: 'F', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'G', exact: true })).toBeVisible();
  });
});
