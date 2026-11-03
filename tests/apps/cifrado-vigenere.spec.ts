/**
 * Cifrado Vigenère — rótulo del resultado (cabo C0596, turno de noche 03/11/2026)
 *
 * «Resultado:» era un <label> que no rotulaba ningún control (solo un <div> con el texto). El
 * caso de cifrado es el clásico: ATTACKATDAWN con clave LEMON da LXFOPVEFRNHR.
 */

import { test, expect } from '@playwright/test';
import { esperarHidratacion } from './_hidratacion';

const RUTA = '/cifrado-vigenere/';

test('cifra ATTACKATDAWN con LEMON y no deja ningún <label> sin control', async ({ page }) => {
  await page.goto(RUTA);
  await esperarHidratacion(page, ['#palabra-clave', '#mensaje']);
  await page.locator('#palabra-clave').fill('LEMON');
  await page.locator('#mensaje').fill('ATTACKATDAWN');
  await page.getByRole('button', { name: 'Cifrar mensaje' }).click();
  await expect(page.getByText('LXFOPVEFRNHR')).toBeVisible();

  const sueltos = await page.evaluate(() =>
    [...document.querySelectorAll('label')].filter((l) => !l.control).map((l) => l.textContent?.trim()),
  );
  expect(sueltos).toEqual([]);
});
