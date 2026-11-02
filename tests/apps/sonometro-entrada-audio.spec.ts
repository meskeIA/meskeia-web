import { test, expect, type Page } from '@playwright/test';
import { esperarHidratacion } from './_hidratacion';
import { simularEntradasAudio, pedidas, enchufar, OPCIONES_ESPERADAS, SIN_PROCESADO } from './_entradaAudio';

/**
 * Sonómetro · selector «Entrada de audio» (S0245, 02/11/2026).
 *
 * Extensión del selector nacido en afinador-instrumentos: con el permiso concedido, el
 * sonómetro deja medir con un micrófono externo —uno de medición USB es el caso que lo
 * justifica—. Lo propio de esta app es qué pasa al cambiar de entrada MIDIENDO: un LAeq con dos
 * micrófonos promediaría dos sensibilidades, así que la medición en curso se cierra y se anota
 * como con «Detener y guardar», y la nueva entrada empieza otra. Es lo que fija el tercer caso.
 *
 * El micrófono es el oscilador de tests/apps/_entradaAudio.ts, con dos entradas falsas y los
 * alias de Windows que el selector no debe repetir.
 */

// Mismo motivo que sonometro.spec.ts: el micrófono sintético corre en el reloj de audio del
// sistema y, con la máquina cargada, a veces tarda en arrancar.
test.describe.configure({ retries: 2 });

const RUTA = '/sonometro/';
const iniciar = (page: Page) => page.getByRole('button', { name: /Iniciar medición/ });
const detener = (page: Page) => page.getByRole('button', { name: /Detener y guardar/ });
const selector = (page: Page) => page.getByLabel('Entrada de audio');
const filas = (page: Page) => page.locator('[class*="tablaRegistro"] tbody tr');

test.beforeEach(async ({ page }) => {
  await simularEntradasAudio(page, 1000);
  await page.goto(RUTA);
  // El deslizador de calibración es el testigo de que React ya escucha los clics
  await esperarHidratacion(page, ['#calibracion']);
});

test('no hay selector hasta conceder el micrófono', async ({ page }) => {
  await expect(selector(page)).toHaveCount(0);
});

test('mide sin el procesado de voz y lista las entradas sin los alias de Windows', async ({ page }) => {
  await iniciar(page).click();
  await expect(detener(page)).toBeVisible();

  const [primera] = await pedidas(page);
  expect(primera).toMatchObject(SIN_PROCESADO);
  expect(primera.deviceId).toBeUndefined(); // la predeterminada del sistema
  await expect(selector(page).locator('option')).toHaveText(OPCIONES_ESPERADAS);
  await expect(selector(page)).toHaveValue('');
});

test('cambiar de entrada midiendo guarda la medición en curso y empieza otra con la nueva', async ({ page }) => {
  await iniciar(page).click();
  await expect(detener(page)).toBeVisible();
  // Más de los 3 s que la app exige para anotar una medición
  await page.waitForTimeout(4500);
  await expect(filas(page)).toHaveCount(0);

  await selector(page).selectOption('interfaz-usb');

  await expect.poll(async () => (await pedidas(page)).length).toBe(2);
  expect((await pedidas(page))[1]).toMatchObject({ deviceId: { exact: 'interfaz-usb' }, ...SIN_PROCESADO });
  // La anterior, anotada; la nueva, en marcha con la interfaz elegida
  await expect(filas(page)).toHaveCount(1);
  await expect(page.locator('[class*="avisoRegistro"]')).toContainText('Medición guardada');
  await expect(detener(page)).toBeVisible();
  await expect(selector(page)).toHaveValue('interfaz-usb');
});

test('cambiar de entrada parado no mide ni anota nada hasta pulsar «Iniciar»', async ({ page }) => {
  await iniciar(page).click();
  await expect(detener(page)).toBeVisible();
  await detener(page).click();
  await expect(iniciar(page)).toBeVisible();

  await selector(page).selectOption('interfaz-usb');
  expect(await pedidas(page)).toHaveLength(1);

  await iniciar(page).click();
  await expect.poll(async () => (await pedidas(page)).length).toBe(2);
  expect((await pedidas(page))[1]).toMatchObject({ deviceId: { exact: 'interfaz-usb' } });
});

test('enchufar una entrada con la página abierta la añade a la lista', async ({ page }) => {
  await iniciar(page).click();
  await expect(selector(page).locator('option')).toHaveCount(3);

  await enchufar(page);
  await expect(selector(page).locator('option')).toHaveCount(4);
  await expect(selector(page).locator('option').last()).toHaveText('Grabadora USB');
});
