import { test, expect } from '@playwright/test';

/**
 * lupa-digital — congelado de imagen
 *
 * La lupa depende de `getUserMedia`, así que Chromium se arranca con cámara
 * simulada: `--use-fake-device-for-media-stream` entrega un patrón de vídeo
 * sintético y `--use-fake-ui-for-media-stream` concede el permiso sin diálogo.
 *
 * Lo que se comprueba es la promesa nueva de la app: que al congelar deja de
 * hacer falta el pulso (imagen fija), que sobre esa imagen siguen valiendo el
 * zoom y el recorrido, y que reanudar devuelve el directo.
 */

test.use({
  launchOptions: {
    args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream'],
  },
  permissions: ['camera'],
});

const RUTA = '/lupa-digital/';

test('congelar fija la imagen, y reanudar devuelve el vídeo en directo', async ({ page }) => {
  await page.goto(RUTA);

  const video = page.locator('video');
  const lienzo = page.locator('canvas');

  await page.getByRole('button', { name: /Activar lupa/ }).click();
  await expect(video).toBeVisible();
  await expect(lienzo).toBeHidden();

  // El fotograma solo puede copiarse cuando la cámara ya entrega dimensiones.
  await expect
    .poll(() => page.evaluate(() => document.querySelector('video')?.videoWidth ?? 0))
    .toBeGreaterThan(0);

  await page.getByRole('button', { name: /Congelar/ }).click();

  // El propio botón pasa a ofrecer «Reanudar», que es su estado presionado.
  const reanudar = page.getByRole('button', { name: /Reanudar/ });
  await expect(lienzo).toBeVisible();
  await expect(video).toBeHidden();
  await expect(reanudar).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByText('Congelada')).toBeVisible();

  // El lienzo se copia a la resolución del sensor, no a la del visor: si no
  // tuviera píxeles, el congelado sería un rectángulo en blanco.
  const anchoLienzo = await page.evaluate(() => document.querySelector('canvas')?.width ?? 0);
  expect(anchoLienzo).toBeGreaterThan(0);

  await reanudar.click();
  await expect(video).toBeVisible();
  await expect(lienzo).toBeHidden();
});

test('sobre la imagen congelada siguen valiendo el zoom, los filtros y el recorrido', async ({ page }) => {
  await page.goto(RUTA);

  await page.getByRole('button', { name: /Activar lupa/ }).click();
  await expect
    .poll(() => page.evaluate(() => document.querySelector('video')?.videoWidth ?? 0))
    .toBeGreaterThan(0);
  await page.getByRole('button', { name: /Congelar/ }).click();

  const lienzo = page.locator('canvas');

  // Zoom 4x: el margen recorrible es (4 - 1) / 2 del visor por cada lado.
  await page.getByRole('button', { name: '4x', exact: true }).click();
  await expect(lienzo).toHaveAttribute('style', /scale\(4\)/);

  await page.getByRole('button', { name: /Invertir/ }).click();
  await expect(lienzo).toHaveAttribute('style', /invert\(100%\)/);

  // Recorrido con teclado: es el camino accesible equivalente al arrastre.
  await lienzo.focus();
  await page.keyboard.press('ArrowRight');
  await expect(lienzo).toHaveAttribute('style', /translate\(-20px, 0px\)/);

  // Al bajar el zoom encoge el margen: el desplazamiento tiene que reacotarse
  // solo, o la imagen quedaría descuadrada enseñando fondo negro.
  await page.getByRole('button', { name: '1x', exact: true }).click();
  await expect(lienzo).toHaveAttribute('style', /translate\(0px, 0px\)/);
});
