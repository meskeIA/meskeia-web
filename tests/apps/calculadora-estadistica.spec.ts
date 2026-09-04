import { test, expect, Page } from '@playwright/test';

/**
 * calculadora-estadistica — el botón «Guardar en Historial» ya guarda de verdad (semilla S0117)
 *
 * La app ofrece guardar las series analizadas para volver a ellas, pero hasta el 04/09/2026
 * el historial vivía solo en `useState`: se vaciaba al recargar. Un botón que dice «Guardar»
 * y no guarda es una promesa incumplida sobre lo único que aporta el usuario — sus datos.
 * Ahora se persiste en localStorage bajo `meskeia-estadistica-historial`, con tope de 5
 * series (el mismo que ya aplicaba en memoria) y botón para vaciarlo.
 *
 * Casos, todos deterministas porque las series se escriben a mano:
 *   · una serie guardada sigue estando tras recargar, y al pulsarla vuelve al textarea
 *   · el tope son 5: al guardar la sexta desaparece la primera (FIFO), no la última
 *   · una serie repetida no se guarda dos veces
 *   · un almacén corrupto o con elementos que no son texto no tumba la página — el pintado
 *     llama a `substring` sobre cada entrada, así que un número suelto reventaría la lista
 */

const RUTA = '/calculadora-estadistica/';
const CLAVE = 'meskeia-estadistica-historial';

const textarea = (page: Page) => page.locator('textarea');
const botonGuardar = (page: Page) => page.getByRole('button', { name: 'Guardar en Historial' });
const entradasHistorial = (page: Page) => page.locator('[class*="historialItem"]');

async function guardarSerie(page: Page, serie: string) {
  await textarea(page).fill(serie);
  await botonGuardar(page).click();
}

/**
 * Siembra el almacén sin carrera con la hidratación.
 *
 * Al montar, la app lee la clave y su efecto de guardado la reescribe con lo que haya
 * cargado. Sembrar antes de ese momento significa que el valor sembrado se pierde, y el
 * test falla —o peor, pasa por el motivo equivocado— según lo rápido que vaya la máquina.
 * Esperar a que la clave exista prueba que el efecto ya corrió.
 */
async function sembrarAlmacen(page: Page, valor: string) {
  await page.waitForFunction((k) => window.localStorage.getItem(k) !== null, CLAVE);
  await page.evaluate(([k, v]) => window.localStorage.setItem(k, v), [CLAVE, valor] as const);
  await page.reload();
}

async function leerAlmacen(page: Page): Promise<unknown[]> {
  const crudo = await page.evaluate((k) => window.localStorage.getItem(k), CLAVE);
  return crudo ? JSON.parse(crudo) : [];
}

test.beforeEach(async ({ page }) => {
  await page.goto(RUTA);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Calculadora de Estadística Descriptiva');
});

test('una serie guardada sigue en el historial tras recargar, y al pulsarla vuelve al textarea', async ({ page }) => {
  await guardarSerie(page, '5, 7, 8, 6, 9');
  await expect(entradasHistorial(page)).toHaveCount(1);

  await page.reload();
  await expect(entradasHistorial(page)).toHaveCount(1);
  await expect(textarea(page)).toHaveValue(''); // el textarea sí empieza vacío

  await entradasHistorial(page).first().click();
  await expect(textarea(page)).toHaveValue('5, 7, 8, 6, 9');
  await expect(page.getByText('Valores detectados:')).toBeVisible();
});

test('el historial conserva 5 series: la sexta desplaza a la más antigua', async ({ page }) => {
  for (const n of [1, 2, 3, 4, 5, 6]) {
    await guardarSerie(page, `${n}, ${n}, ${n}`);
  }
  await expect(entradasHistorial(page)).toHaveCount(5);

  const guardadas = (await leerAlmacen(page)) as string[];
  expect(guardadas).toHaveLength(5);
  expect(guardadas[0]).toBe('2, 2, 2');  // la primera se ha ido
  expect(guardadas[4]).toBe('6, 6, 6');  // la última entra al final
});

test('la misma serie no se guarda dos veces', async ({ page }) => {
  await guardarSerie(page, '10, 20, 30');
  await botonGuardar(page).click();
  await botonGuardar(page).click();
  await expect(entradasHistorial(page)).toHaveCount(1);
  expect(await leerAlmacen(page)).toHaveLength(1);
});

test('el botón Vaciar borra el historial, también tras recargar', async ({ page }) => {
  await guardarSerie(page, '1, 2, 3');
  await page.getByRole('button', { name: 'Vaciar' }).click();
  await expect(entradasHistorial(page)).toHaveCount(0);

  await page.reload();
  await expect(entradasHistorial(page)).toHaveCount(0);
  expect(await leerAlmacen(page)).toHaveLength(0);
});

test('un almacén corrupto o con entradas que no son texto no tumba la página', async ({ page }) => {
  for (const basura of [
    '{no es json',
    JSON.stringify({ series: ['1, 2, 3'] }),
    JSON.stringify([42, null, { datos: '1,2' }, '   ']),
  ]) {
    await sembrarAlmacen(page, basura);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Calculadora de Estadística Descriptiva');
    await expect(entradasHistorial(page)).toHaveCount(0);
  }

  // Y una entrada válida mezclada con basura sí se recupera
  await sembrarAlmacen(page, JSON.stringify([7, '4, 8, 15', null]));
  await expect(entradasHistorial(page)).toHaveCount(1);
  await expect(entradasHistorial(page).first()).toHaveText('4, 8, 15');
});
