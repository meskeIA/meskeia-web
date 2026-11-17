import { test, expect } from '@playwright/test';
import { esperarHidratacion } from './_hidratacion';

/**
 * Generador de Enlaces UTM — spec de regresión (reparar 17/11/2026, cabo C0777).
 *
 * C0777 (turno de noche 16/11/2026): el banner que muestra los errores de validación
 * («Introduce una URL de destino», «El campo Source es obligatorio»…) no llevaba role="alert"
 * ni aria-live, así que el lector de pantalla no anunciaba nada al pulsar «Generar Enlace UTM»
 * con el formulario incompleto. Se mide por el ROL: el error tiene que estar en una alerta.
 */

const URL_APP = '/generador-utm/';

test.beforeEach(async ({ page }) => {
  await page.goto(URL_APP);
  await esperarHidratacion(page, ['input[placeholder="https://ejemplo.com/pagina"]']);
});

test('C0777 — el error de validación se anuncia como alerta', async ({ page }) => {
  await page.getByRole('button', { name: /Generar Enlace UTM/ }).click();
  await expect(page.getByRole('alert').filter({ hasText: 'Introduce una URL de destino' })).toBeVisible();

  await page.locator('input[placeholder="https://ejemplo.com/pagina"]').fill('ejemplo.com');
  await page.getByRole('button', { name: /Generar Enlace UTM/ }).click();
  await expect(page.getByRole('alert').filter({ hasText: 'El campo Source es obligatorio' })).toBeVisible();
});
