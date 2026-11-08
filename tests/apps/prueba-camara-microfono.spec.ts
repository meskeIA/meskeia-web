import { test, expect, devices, type Page } from '@playwright/test';

/**
 * prueba-camara · la prueba de micrófono que vive dentro de la de cámara (S0260, 08/11/2026).
 *
 * Con el micrófono simulado de Chromium (un pitido periódico) se comprueba lo que promete el
 * panel: que la barra se mueve con el sonido, que la grabación de 5 s se para sola y deja un
 * reproductor, y que «Detener» suelta el micrófono y deja la barra en cero. El arranque con el
 * AudioContext suspendido lo mide el testigo de familia tests/familias/entrada-microfono.spec.ts.
 */

test.use({
  ...devices['Desktop Chrome'],
  launchOptions: {
    args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'],
  },
  permissions: ['microphone', 'camera'],
});

async function abrirMicrofono(page: Page) {
  await page.goto('/prueba-camara/');
  const boton = page.getByRole('button', { name: /Probar micrófono/ });
  await expect(boton).toBeVisible();
  await expect
    .poll(() => boton.evaluate((el) => Object.keys(el).some((k) => k.startsWith('__reactProps$'))))
    .toBe(true);
  await boton.click();
}

const medidor = (page: Page) => page.getByRole('meter', { name: 'Nivel del micrófono' });

test('la barra se mueve con el sonido que llega', async ({ page }) => {
  await abrirMicrofono(page);
  await expect(page.getByRole('button', { name: /Detener micrófono/ })).toBeVisible();
  // El pitido simulado tarda unos segundos en llegar y va y viene: basta con que llegue
  await expect
    .poll(async () => Number(await medidor(page).getAttribute('aria-valuenow')), { timeout: 15000 })
    .toBeGreaterThan(20);
  await expect(medidor(page)).not.toHaveAttribute('aria-valuetext', 'Micrófono apagado');
});

test('grabar 5 s se para sola y deja un reproductor', async ({ page }) => {
  await abrirMicrofono(page);
  const grabar = page.getByRole('button', { name: /Grabar 5 s y escuchar/ });
  await expect(grabar).toBeEnabled();
  await grabar.click();
  await expect(page.getByRole('button', { name: /Grabando…/ })).toBeDisabled();
  await expect(page.locator('audio[controls]')).toBeVisible({ timeout: 9000 });
  await expect(page.getByRole('button', { name: /Grabar 5 s y escuchar/ })).toBeEnabled();
});

test('detener suelta el micrófono y deja la barra a cero', async ({ page }) => {
  await abrirMicrofono(page);
  await page.getByRole('button', { name: /Detener micrófono/ }).click();
  await expect(page.getByRole('button', { name: /Probar micrófono/ })).toBeVisible();
  await expect(medidor(page)).toHaveAttribute('aria-valuenow', '0');
  await expect(medidor(page)).toHaveAttribute('aria-valuetext', 'Micrófono apagado');
  const pistasVivas = await page.evaluate(() => document.querySelectorAll('[role="alert"]:not(:empty)').length);
  expect(pistasVivas).toBe(0);
});
