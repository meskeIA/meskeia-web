import { test, expect, type Page } from '@playwright/test';
import { esperarHidratacion, esperarValorEnReact } from './_hidratacion';

/**
 * Generador de Sopas de Letras — los dos defectos de la familia imprimible medidos el 17/11/2026
 * al reparar generador-laberintos (hallazgos 4948 y 4949, los mismos que 4273 y 4272 de
 * generador-fichas-calculo):
 *   · «Otra distinta» tomaba el n.º escrito como «Generar» y repetía la misma sopa.
 *   · La hoja (pie, resumen y título de la tabla) leía el nivel y el tamaño SELECCIONADOS, no los
 *     de la sopa generada: cambiados sin regenerar, la hoja daba datos con los que no se puede
 *     reconstruir lo impreso.
 * El oráculo es la propia cuadrícula: su texto, letra a letra, es la huella de la sopa.
 */

/** La tabla de la hoja: la que lleva el título «Cuadrícula de…» (la guía tiene otra tabla) */
const cuadricula = (page: Page) => page.locator('table', { has: page.locator('caption', { hasText: 'Cuadrícula de' }) });

const filas = (page: Page) => cuadricula(page).locator('tbody tr');

const huella = async (page: Page): Promise<string> =>
  (await cuadricula(page).locator('tbody').innerText()).replace(/\s+/g, '');

const numeroDeSopa = (page: Page) => page.locator('p', { hasText: 'Número de sopa:' }).locator('strong').last();

const pieDeHoja = (page: Page) => page.locator('p', { hasText: 'Sopa n.º' });

async function generar(page: Page, semilla?: string): Promise<void> {
  if (semilla !== undefined) {
    const caja = page.getByPlaceholder('Al azar');
    await caja.fill(semilla);
    await esperarValorEnReact(page, caja, semilla);
  }
  await page.getByRole('button', { name: /Generar sopa de letras/ }).click();
  await expect(filas(page).first()).toBeVisible();
}

test.beforeEach(async ({ page }) => {
  await page.goto('/generador-sopa-letras/');
  await esperarHidratacion(page, ['input[placeholder="Al azar"]']);
});

test('«Otra distinta» da otra sopa aunque haya un n.º escrito, y ese n.º nuevo la reconstruye', async ({ page }) => {
  await generar(page, '12345');
  await expect(numeroDeSopa(page)).toHaveText('12345');
  const antes = await huella(page);
  // Control: el mismo n.º reproduce la misma sopa
  await generar(page);
  expect(await huella(page), 'el 12345 escrito vuelve a dar la misma').toBe(antes);

  await page.getByRole('button', { name: /Otra distinta/ }).click();
  await expect(numeroDeSopa(page)).not.toHaveText('12345');
  await expect(numeroDeSopa(page)).toHaveText(/^[1-9]\d{5}$/);
  expect(await huella(page)).not.toBe(antes);
  await expect(page.getByPlaceholder('Al azar')).toHaveValue('');

  const n = (await numeroDeSopa(page).innerText()).trim();
  const otra = await huella(page);
  await generar(page, '1');
  await generar(page, n);
  expect(await huella(page), `n.º ${n}`).toBe(otra);
});

test('tras cambiar nivel y tamaño sin regenerar, la hoja sigue diciendo con qué se generó', async ({ page }) => {
  await page.getByLabel('Tamaño').selectOption('12');
  await page.getByRole('button', { name: /^Medio/ }).click();
  await generar(page, '12345');
  await expect(pieDeHoja(page)).toHaveText('Sopa n.º 12345 · Medio · con diagonales · meskeia.com');
  await expect(filas(page)).toHaveCount(12);

  await page.getByRole('button', { name: /^Difícil/ }).click();
  await expect(page.getByRole('button', { name: /^Difícil/ })).toHaveAttribute('aria-pressed', 'true');
  await page.getByLabel('Tamaño').selectOption('20');

  // La cuadrícula no ha cambiado: la hoja tiene que seguir describiéndola
  await expect(filas(page)).toHaveCount(12);
  await expect(pieDeHoja(page)).toHaveText('Sopa n.º 12345 · Medio · con diagonales · meskeia.com');
  await expect(page.locator('p', { hasText: 'Número de sopa:' })).toContainText('12 × 12');
  await expect(cuadricula(page).locator('caption')).toContainText('Cuadrícula de 12 por 12 letras');
});
