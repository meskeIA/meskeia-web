import { test, expect } from '@playwright/test';
import { esperarHidratacion } from './_hidratacion';

/**
 * simulador-kmeans — REGRESIÓN del TypeError de producción · 16/09/2026
 *
 * `Cannot read properties of undefined (reading 'x')` en `/simulador-kmeans/`, tres caídas
 * registradas en el digest entre el 10/09 y el 15/09 desde tres visitantes distintos
 * (AR/Chrome, ES/Opera) — misma ruta y mismo mensaje, así que era bug, no extensión.
 *
 * Mecanismo: el panel «Tamaños de cada cluster» recorría `tamanosCluster`, de longitud `k`
 * (el deslizador), pero leía `centroides[j].x`, y `centroides` conserva la longitud que tenía
 * cuando se ejecutó la simulación. Mover K hacia ARRIBA sin volver a inicializar dejaba
 * índices sin centroide detrás y el render petaba: la app entera caía a «Algo salió mal».
 *
 * Por eso el fallo era ASIMÉTRICO y el caso de bajar K pasaba ya antes del arreglo: al
 * encoger, todos los índices seguían teniendo centroide detrás. Se conserva porque es lo que
 * demuestra que la causa era la desalineación y no el deslizador en sí.
 *
 * El deslizador se mueve con el TECLADO, no con el setter nativo, por dos razones: es lo que
 * hace un usuario con el foco puesto, y con la app caída el input deja de existir como
 * controlado, así que `sembrarValor` fallaría al comprobarlo y taparía el error de verdad
 * con otro suyo.
 */

const RUTA = '/simulador-kmeans/';

const panel = (page: import('@playwright/test').Page) =>
  page.getByRole('heading', { name: 'Tamaños de cada cluster' });

const filas = (page: import('@playwright/test').Page) =>
  page.locator('[class*="clusterRow"]');

test('subir K tras inicializar no tumba la app', async ({ page }) => {
  const errores: string[] = [];
  page.on('pageerror', (e) => errores.push(e.message));

  await page.goto(RUTA);
  await esperarHidratacion(page, ['#k']);

  // K=3 de partida: se calculan 3 centroides
  await page.getByRole('button', { name: 'Inicializar centroides' }).click();
  await expect(panel(page)).toBeVisible();
  await expect(filas(page)).toHaveCount(3);

  // El usuario sube el deslizador a K=5 sin volver a inicializar
  await page.locator('#k').focus();
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('#k')).toHaveValue('5');

  // La app sigue en pie y el panel describe lo que hay DIBUJADO, no lo que pide el deslizador
  await expect(panel(page)).toBeVisible();
  await expect(filas(page)).toHaveCount(3);
  expect(errores).toEqual([]);
});

test('bajar K tras inicializar tampoco la tumba', async ({ page }) => {
  const errores: string[] = [];
  page.on('pageerror', (e) => errores.push(e.message));

  await page.goto(RUTA);
  await esperarHidratacion(page, ['#k']);

  await page.getByRole('button', { name: 'Inicializar centroides' }).click();
  await expect(panel(page)).toBeVisible();

  await page.locator('#k').focus();
  await page.keyboard.press('ArrowLeft');
  await expect(page.locator('#k')).toHaveValue('2');

  await expect(panel(page)).toBeVisible();
  await expect(filas(page)).toHaveCount(3);
  expect(errores).toEqual([]);
});

test('avisa de que la pantalla es de otro K, y el aviso se va al reagrupar', async ({ page }) => {
  await page.goto(RUTA);
  await esperarHidratacion(page, ['#k']);

  const aviso = page.getByRole('status').filter({ hasText: 'Has cambiado K' });
  await page.getByRole('button', { name: 'Inicializar centroides' }).click();
  await expect(aviso).toBeHidden();

  await page.locator('#k').focus();
  await page.keyboard.press('ArrowRight');
  await expect(aviso).toContainText('sigue agrupado en 3 clusters');

  // Reagrupar con el K nuevo deja las dos cifras otra vez de acuerdo
  await page.getByRole('button', { name: 'Inicializar centroides' }).click();
  await expect(aviso).toBeHidden();
  await expect(filas(page)).toHaveCount(4);
});
