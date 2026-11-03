/**
 * Generador de sombras CSS — pestañas de capa con teclado (cabo C0595, turno de noche 03/11/2026)
 *
 * Las pestañas «Capa n» eran <div onClick>, sin rol ni tabIndex: con teclado no había forma de
 * pasar a otra capa, y el <label> «Capas (n/5)» no rotulaba ningún control. Ahora cada capa se
 * elige con un <button aria-pressed> dentro de un grupo rotulado por ese título.
 */

import { test, expect } from '@playwright/test';
import { esperarPaginaAsentada } from './_hidratacion';

const RUTA = '/generador-sombras/';

test.describe('generador-sombras — C0595', () => {
  test('una capa se elige con el teclado, y el grupo lleva el rótulo «Capas»', async ({ page }) => {
    await page.goto(RUTA);
    await esperarPaginaAsentada(page);

    await page.getByRole('button', { name: '+ Añadir' }).click();
    const grupo = page.getByRole('group', { name: /Capas \(2\/5\)/ });
    await expect(grupo).toBeVisible();

    const capa1 = grupo.getByRole('button', { name: 'Capa 1', exact: true });
    const capa2 = grupo.getByRole('button', { name: 'Capa 2', exact: true });
    // Añadir una capa la deja activa.
    await expect(capa2).toHaveAttribute('aria-pressed', 'true');
    await expect(capa1).toHaveAttribute('aria-pressed', 'false');

    await capa1.focus();
    await page.keyboard.press('Enter');
    await expect(capa1).toHaveAttribute('aria-pressed', 'true');
    await expect(capa2).toHaveAttribute('aria-pressed', 'false');

    await expect(grupo.getByRole('button', { name: 'Eliminar capa 2' })).toBeVisible();
    await grupo.getByRole('button', { name: 'Eliminar capa 2' }).click();
    await expect(page.getByRole('group', { name: /Capas \(1\/5\)/ })).toBeVisible();
  });

  test('no queda ningún <label> sin control en la app', async ({ page }) => {
    await page.goto(RUTA);
    await esperarPaginaAsentada(page);
    const sueltos = await page.evaluate(() =>
      [...document.querySelectorAll('label')]
        .filter((l) => !l.control)
        .map((l) => l.textContent?.trim()),
    );
    expect(sueltos).toEqual([]);
  });
});
