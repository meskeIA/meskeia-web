import { test, expect, type Page } from '@playwright/test';
import { esperarHidratacion } from './_hidratacion';
import { simularEntradasAudio, pedidas, OPCIONES_ESPERADAS, SIN_PROCESADO } from './_entradaAudio';

/**
 * Analizador de espectro · selector «Entrada de audio» (S0245, 02/11/2026).
 *
 * Extensión del selector nacido en afinador-instrumentos: el micrófono del equipo, uno de
 * medición o una interfaz con un instrumento por cable. Aquí no hay medición acumulada que
 * mezclar, así que cambiar de entrada analizando solo reabre la captura con la nueva.
 *
 * El último caso cubre `abrirEntradaAudio` (lib/useEntradaAudio): una entrada que sigue en la
 * lista pero ya no abre —se desenchufó entre la elección y la apertura— no deja la app en error,
 * sino analizando con la predeterminada.
 */

const RUTA = '/analizador-espectro/';
const iniciar = (page: Page) => page.getByRole('button', { name: /Iniciar análisis/ });
const detener = (page: Page) => page.getByRole('button', { name: /Detener/ });
const selector = (page: Page) => page.getByLabel('Entrada de audio');

async function abrir(page: Page, ausente = ''): Promise<void> {
  await simularEntradasAudio(page, 440, ausente);
  await page.goto(RUTA);
  // El deslizador de sensibilidad es el testigo de que React ya escucha los clics
  await esperarHidratacion(page, ['#sensitivity-slider']);
}

test('no hay selector hasta conceder el micrófono', async ({ page }) => {
  await abrir(page);
  await expect(selector(page)).toHaveCount(0);
});

test('analiza sin el procesado de voz y lista las entradas sin los alias de Windows', async ({ page }) => {
  await abrir(page);
  await iniciar(page).click();
  await expect(detener(page)).toBeVisible();

  const [primera] = await pedidas(page);
  expect(primera).toMatchObject(SIN_PROCESADO);
  expect(primera.deviceId).toBeUndefined();
  await expect(selector(page).locator('option')).toHaveText(OPCIONES_ESPERADAS);
});

test('cambiar de entrada analizando reabre la captura con la nueva', async ({ page }) => {
  await abrir(page);
  await iniciar(page).click();
  await expect(detener(page)).toBeVisible();

  await selector(page).selectOption('interfaz-usb');
  await expect.poll(async () => (await pedidas(page)).length).toBe(2);
  expect((await pedidas(page))[1]).toMatchObject({ deviceId: { exact: 'interfaz-usb' }, ...SIN_PROCESADO });
  await expect(detener(page)).toBeVisible();
  await expect(page.locator('[class*="noteValue"]')).toHaveText(/A4/);
});

test('si la entrada elegida ya no abre, sigue analizando con la predeterminada', async ({ page }) => {
  await abrir(page, 'interfaz-usb');
  await iniciar(page).click();
  await expect(detener(page)).toBeVisible();

  await selector(page).selectOption('interfaz-usb');
  // La elegida (rechazada) y, tras ella, la predeterminada
  await expect.poll(async () => (await pedidas(page)).length).toBe(3);
  expect((await pedidas(page))[2].deviceId).toBeUndefined();
  await expect(selector(page)).toHaveValue('');
  await expect(detener(page)).toBeVisible();
  await expect(page.locator('[class*="errorMessage"][role="alert"]')).toHaveCount(0);
});
