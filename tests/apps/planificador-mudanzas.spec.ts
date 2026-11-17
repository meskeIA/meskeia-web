import { test, expect } from '@playwright/test';
import { esperarHidratacion } from './_hidratacion';

/**
 * Planificador de Mudanzas — spec de regresión (reparar 17/11/2026, cabo C0778).
 *
 * C0778 (turno de noche 16/11/2026): el nombre de la mudanza se editaba con un onClick en el
 * <h2>, sin rol de botón ni teclado, y el campo que aparecía no tenía etiqueta. Quien navega con
 * teclado no podía cambiar el nombre, y el lector anunciaba un cuadro de texto sin nombre.
 * Se mide por comportamiento: llegar al botón con el teclado, abrir con Enter, escribir en un
 * campo que tenga nombre accesible y ver el nombre nuevo en el encabezado.
 */

test.beforeEach(async ({ page }) => {
  await page.goto('/planificador-mudanzas/');
  await esperarHidratacion(page, ['#fecha-mudanza']);
});

test('C0778 — el nombre de la mudanza se edita con teclado y su campo tiene etiqueta', async ({ page }) => {
  const boton = page.getByRole('heading', { level: 2 }).getByRole('button', { name: /editar nombre de la mudanza/ });
  await expect(boton).toBeVisible();

  await boton.focus();
  await page.keyboard.press('Enter');

  const campo = page.getByRole('textbox', { name: 'Nombre de la mudanza' });
  await expect(campo).toBeFocused();
  await campo.fill('Mudanza al piso nuevo');
  await page.keyboard.press('Enter');

  await expect(
    page.getByRole('heading', { level: 2 }).getByRole('button', { name: /Mudanza al piso nuevo/ }),
  ).toBeVisible();
});
