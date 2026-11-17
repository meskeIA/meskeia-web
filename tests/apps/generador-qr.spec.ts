import { test, expect } from '@playwright/test';
import { esperarHidratacion } from './_hidratacion';

/**
 * Generador de QR — spec de regresión (reparar 17/11/2026, cabo C0779).
 *
 * C0779 (turno de noche 16/11/2026): el botón que despliega el «Código de implementación» es un
 * desplegable, pero llevaba aria-pressed (el lector lo anunciaba como un conmutador «pulsado»)
 * y un aria-label («Mostrar código» / «Ocultar código») que no coincidía con el texto visible
 * («Ver código HTML»). Ahora el nombre es el visible y fijo, y el estado lo dice aria-expanded.
 */

test.beforeEach(async ({ page }) => {
  await page.goto('/generador-qr/');
  await esperarHidratacion(page, ['#url-input']);
});

test('C0779 — el desplegable del código HTML es un disclosure con su nombre visible', async ({ page }) => {
  await page.locator('#url-input').fill('https://ejemplo.com');

  const boton = page.getByRole('button', { name: 'Ver código HTML', exact: true });
  await expect(boton).toBeVisible({ timeout: 15000 });
  await expect(boton).toHaveAttribute('aria-expanded', 'false');
  await expect(boton).not.toHaveAttribute('aria-pressed', /.*/);

  await boton.click();
  await expect(boton).toHaveAttribute('aria-expanded', 'true');
  await expect(page.getByRole('button', { name: /Copiar código/ })).toBeVisible();

  await boton.click();
  await expect(boton).toHaveAttribute('aria-expanded', 'false');
  await expect(page.getByRole('button', { name: /Copiar código/ })).toHaveCount(0);
});
