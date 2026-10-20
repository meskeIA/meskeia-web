import { test, expect } from '@playwright/test';
import { esperarHidratacion, esperarValorEnReact } from './_hidratacion';

/**
 * Generador de Fichas de Cálculo — las fichas de FRACCIONES (S0216, 20/10/2026).
 *
 * QUÉ SE COMPRUEBA EN EL NAVEGADOR (la aritmética la cubre tests/fichas-fracciones-motor.spec.ts)
 *   1) Al marcar «Fracciones» aparece el selector de tipo; al desmarcarla, desaparece.
 *   2) Una ficha solo de «Simplificar» con el nº de ficha 123456: 24 ejercicios, todos con
 *      «Simplifica», y con las soluciones visibles cada solución vale lo mismo que la fracción
 *      propuesta y es irreducible. Se lee de los aria-label «N entre D» de las fracciones
 *      apiladas, que es lo que oye un lector de pantalla.
 *   3) El mismo nº de ficha reproduce la misma hoja.
 *   4) Las fichas de enteros siguen igual: sin «Fracciones», la ficha por defecto no lleva ninguna
 *      fracción apilada.
 */

const gcd = (a: number, b: number): number => (b === 0 ? Math.abs(a) : gcd(b, a % b));

function leer(etiqueta: string): [number, number] {
  const m = etiqueta.match(/^(\d+) entre (\d+)$/);
  if (!m) throw new Error(`aria-label inesperado: ${etiqueta}`);
  return [Number(m[1]), Number(m[2])];
}

test.beforeEach(async ({ page }) => {
  await page.goto('/generador-fichas-calculo/');
  await esperarHidratacion(page, ['input[placeholder="Al azar"]']);
});

async function fichaSoloFracciones(page: import('@playwright/test').Page, tipo: string, semilla: string) {
  // Por defecto vienen marcadas Sumas y Restas: se desmarcan y se marca Fracciones
  await page.getByRole('button', { name: /Sumas$/ }).click();
  await page.getByRole('button', { name: /Restas$/ }).click();
  await page.getByRole('button', { name: /Fracciones$/ }).click();
  await page.getByRole('group', { name: 'Tipo de ejercicios de fracciones' }).getByRole('button', { name: new RegExp(`^${tipo}`) }).click();
  const caja = page.getByPlaceholder('Al azar');
  await caja.fill(semilla);
  await esperarValorEnReact(page, caja, semilla);
  await page.getByRole('button', { name: /Generar ficha/ }).click();
}

test('1 · el selector de tipo de fracciones aparece y desaparece con «Fracciones»', async ({ page }) => {
  const grupo = page.getByRole('group', { name: 'Tipo de ejercicios de fracciones' });
  await expect(grupo).toHaveCount(0);
  await page.getByRole('button', { name: /Fracciones$/ }).click();
  await expect(grupo).toBeVisible();
  await page.getByRole('button', { name: /Fracciones$/ }).click();
  await expect(grupo).toHaveCount(0);
});

test('2 · ficha de «Simplificar»: cada solución es la irreducible de su fracción', async ({ page }) => {
  await fichaSoloFracciones(page, 'Simplificar', '123456');
  const items = page.locator('ol > li');
  await expect(items).toHaveCount(24);
  await expect(items.filter({ hasText: 'Simplifica' })).toHaveCount(24);

  await page.getByRole('button', { name: /Ver soluciones/ }).click();
  for (let i = 0; i < 24; i++) {
    const fracciones = items.nth(i).locator('[role="img"]');
    // La propuesta y la solución (toda solución de «simplificar» es propia: nunca entera)
    await expect(fracciones).toHaveCount(2);
    const [n, d] = leer((await fracciones.nth(0).getAttribute('aria-label')) ?? '');
    const [sn, sd] = leer((await fracciones.nth(1).getAttribute('aria-label')) ?? '');
    expect(gcd(n, d), `ejercicio ${i + 1}: ${n}/${d}`).toBeGreaterThan(1);
    expect(n * sd, `ejercicio ${i + 1}`).toBe(sn * d);
    expect(gcd(sn, sd), `ejercicio ${i + 1}: solución ${sn}/${sd}`).toBe(1);
  }
});

test('3 · el mismo nº de ficha reproduce la misma hoja', async ({ page }) => {
  await fichaSoloFracciones(page, 'Mezcla', '777777');
  const primera = await page.locator('ol').innerText();
  await page.reload();
  await esperarHidratacion(page, ['input[placeholder="Al azar"]']);
  await fichaSoloFracciones(page, 'Mezcla', '777777');
  expect(await page.locator('ol').innerText()).toBe(primera);
});

test('4 · la ficha de enteros por defecto no lleva fracciones', async ({ page }) => {
  await page.getByRole('button', { name: /Generar ficha/ }).click();
  await expect(page.locator('ol > li')).toHaveCount(24);
  await expect(page.locator('ol [role="img"]')).toHaveCount(0);
});
