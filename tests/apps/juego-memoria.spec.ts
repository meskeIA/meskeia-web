import { test, expect } from '@playwright/test';

/**
 * Juego de Memoria — test de regresión de accesibilidad (seguimiento del turno de noche, 10/10/2026)
 *
 * Lo que se comprueba es lo que oye un lector de pantalla, no el aspecto:
 *   · los botones de dificultad se llaman «Fácil (6)», «Medio (8)», «Difícil (12)» sin el
 *     nombre del emoji, y dicen cuál está activo con aria-pressed;
 *   · el marcador nombra cada cifra («Tiempo», «Movimientos», «Parejas encontradas»): antes
 *     solo la decían ⏱️, 👆 y ✅, que el lector leía como nombres de emoji.
 *
 * DE DÓNDE SALE CADA VALOR ESPERADO (page.tsx, CONFIG_DIFICULTAD)
 *   fácil 6 parejas → 12 cartas · medio 8 → 16 · difícil 12 → 24. Dificultad inicial: fácil.
 *
 * ⚠️ HIDRATACIÓN: el tablero nace vacío en el servidor y lo llena el useEffect de montaje,
 * así que ver las 12 «Carta oculta» garantiza que React ya escucha los clics.
 */

const RUTA = '/juego-memoria/';

test('dificultad: nombre sin emoji, aria-pressed y nº de cartas', async ({ page }) => {
  await page.goto(RUTA);
  const ocultas = page.getByRole('button', { name: 'Carta oculta' });
  await expect(ocultas).toHaveCount(12);

  const facil = page.getByRole('button', { name: 'Fácil (6)', exact: true });
  const medio = page.getByRole('button', { name: 'Medio (8)', exact: true });
  await expect(facil).toHaveAttribute('aria-pressed', 'true');
  await expect(medio).toHaveAttribute('aria-pressed', 'false');

  await medio.click();
  await expect(medio).toHaveAttribute('aria-pressed', 'true');
  await expect(facil).toHaveAttribute('aria-pressed', 'false');
  await expect(ocultas).toHaveCount(16);

  await page.getByRole('button', { name: 'Difícil (12)', exact: true }).click();
  await expect(ocultas).toHaveCount(24);
});

test('el marcador nombra cada cifra', async ({ page }) => {
  await page.goto(RUTA);
  await expect(page.getByRole('button', { name: 'Carta oculta' })).toHaveCount(12);

  await expect(page.getByText('Tiempo:', { exact: true })).toHaveCount(1);
  await expect(page.getByText('Movimientos:', { exact: true })).toHaveCount(1);
  await expect(page.getByText('Parejas encontradas:', { exact: true })).toHaveCount(1);
  // La cifra de parejas sigue a su etiqueta: 0 de 6 al empezar
  await expect(page.getByText('0/6', { exact: true })).toBeVisible();
});
