import { test, expect } from '@playwright/test';

/**
 * lupa-digital — el equipo que NO tiene cámara (hallazgo 8 del Inspector)
 *
 * Vive en su propio fichero porque `launchOptions` solo se puede fijar en el nivel
 * superior de un spec: aquí se concede el permiso (`--use-fake-ui-for-media-stream`)
 * pero NO se simula dispositivo, así que `getUserMedia` rechaza con NotFoundError.
 * Es el caso real del portátil sin webcam, y el catch de la app lo trataba como una
 * denegación de permiso: le ofrecía un ajuste del navegador que no arregla nada.
 */

test.use({
  launchOptions: { args: ['--use-fake-ui-for-media-stream'] },
  permissions: ['camera'],
});

const RUTA = '/lupa-digital/';

test('hallazgo 8 — NotFoundError no se anuncia como permiso denegado', async ({ page }) => {
  await page.goto(RUTA);
  await page.getByRole('button', { name: /Activar lupa/i }).first().click();

  const aviso = page.locator('[role="alert"]').first();
  await expect(aviso).toContainText(/No se ha encontrado ninguna cámara/i);
  await expect(aviso).not.toContainText(/denegado/i);
});
