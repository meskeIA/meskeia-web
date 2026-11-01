import { test, expect } from '@playwright/test';

/**
 * seguimiento-habitos — los desbordes a 390 px viven en `desborde-390.spec.ts` (C0200, C0553).
 *
 * Cabo C0552 (turno de noche a11y del 01/11/2026): los diez botones de la paleta de color del
 * modal de hábito nuevo no tenían texto ni aria-label, y el lector anunciaba «botón, pulsado» sin
 * decir qué color era. Ahora cada uno lleva su nombre, y el elegido sigue con aria-pressed.
 */
test('C0552 · cada color de la paleta tiene nombre, y el elegido lo dice', async ({ page }) => {
  await page.goto('/seguimiento-habitos/');
  const nuevo = page.getByRole('button', { name: /Nuevo Hábito/ }).first();
  await expect(async () => {
    await nuevo.click();
    await expect(page.getByRole('heading', { name: 'Nuevo Hábito' })).toBeVisible({ timeout: 1000 });
  }).toPass({ timeout: 15000 });

  const paleta = page.getByRole('group', { name: 'Color' });
  const nombres = await paleta.getByRole('button').evaluateAll((botones) =>
    botones.map((b) => b.getAttribute('aria-label') ?? ''),
  );
  expect(nombres).toEqual([
    'Azul', 'Verde azulado', 'Rojo', 'Ámbar', 'Morado',
    'Aguamarina', 'Coral', 'Verde', 'Celeste', 'Rosa',
  ]);

  // El primero viene elegido; al pulsar otro, el estado se mueve con su nombre
  await expect(paleta.getByRole('button', { name: 'Azul', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await paleta.getByRole('button', { name: 'Coral', exact: true }).click();
  await expect(paleta.getByRole('button', { name: 'Coral', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(paleta.getByRole('button', { name: 'Azul', exact: true })).toHaveAttribute('aria-pressed', 'false');
});
