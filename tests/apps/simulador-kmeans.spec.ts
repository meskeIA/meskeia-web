import { test, expect } from '@playwright/test';

/**
 * simulador-kmeans — verificación de la importación de datos propios · 03/09/2026 (S0113)
 *
 * Nace del PASO 4.bis de /nueva-app-meskeia aplicado a una función nueva sobre app existente:
 * la caja de «Tus propios datos». El parseo en sí ya tiene sus casos resueltos a mano en
 * `tests/kmeans-parseo-motor.spec.ts` (lógica pura, sin navegador); lo que este fichero cubre
 * es lo que aquél no puede ver: que lo parseado llega de verdad al lienzo, que el resumen dice
 * la verdad sobre lo importado y que un texto ilegible produce un error visible en vez de una
 * nube de puntos inventada.
 *
 * El riesgo que justifica probarlo en navegador: un fallo aquí no se ve «raro». El lienzo
 * dibujaría una nube plausible con los datos anteriores y nadie distinguiría que la
 * importación no ha hecho nada.
 */

const RUTA = '/simulador-kmeans/';

// 6 filas, cabecera incluida: dos magnitudes muy dispares (años frente a euros)
const TABLA = `edad;ingresos
24;18500
27;21000
31;24500
44;52000
47;58000
51;61500`;

const puntos = (page: import('@playwright/test').Page) =>
  page.locator('svg circle[class*="puntoCircle"]');

test('importa una tabla pegada y la lleva al lienzo', async ({ page }) => {
  await page.goto(RUTA);

  // De partida está el preset de 3 gaussianas: 90 puntos (3 x 30)
  await expect(puntos(page)).toHaveCount(90);

  await page.locator('#datosPropios').fill(TABLA);
  await page.getByRole('button', { name: 'Agrupar mis datos' }).click();

  // Las 6 filas de datos (la cabecera NO cuenta como punto)
  await expect(puntos(page)).toHaveCount(6);

  const resumen = page.getByRole('status').filter({ hasText: 'puntos importados' });
  await expect(resumen).toContainText('6 puntos importados');
  await expect(resumen).toContainText('edad');
  await expect(resumen).toContainText('ingresos');
  // Rangos reales, en formato español y sin decimales por ser enteros
  await expect(resumen).toContainText('de 24 a 51');
  await expect(resumen).toContainText('de 18.500 a 61.500');
});

test('escala cada eje por separado: el ingreso mayor queda arriba y el menor abajo', async ({ page }) => {
  await page.goto(RUTA);
  await page.locator('#datosPropios').fill(TABLA);
  await page.getByRole('button', { name: 'Agrupar mis datos' }).click();
  await expect(puntos(page)).toHaveCount(6);

  const cys = await puntos(page).evaluateAll((els) =>
    els.map((el) => Number(el.getAttribute('cy'))),
  );
  const cxs = await puntos(page).evaluateAll((els) =>
    els.map((el) => Number(el.getAttribute('cx'))),
  );

  // Lienzo 600x400 con margen 30: los extremos caen exactamente en los márgenes útiles
  // (24 años -> x=30 · 51 años -> x=570 · 18.500 € -> y=370 · 61.500 € -> y=30)
  expect(Math.min(...cxs)).toBeCloseTo(30, 5);
  expect(Math.max(...cxs)).toBeCloseTo(570, 5);
  expect(Math.min(...cys)).toBeCloseTo(30, 5);
  expect(Math.max(...cys)).toBeCloseTo(370, 5);

  // El primer punto es el de menor edad y menor ingreso: esquina inferior izquierda
  expect(cxs[0]).toBeCloseTo(30, 5);
  expect(cys[0]).toBeCloseTo(370, 5);
});

test('un texto sin números da error visible y NO toca los puntos que había', async ({ page }) => {
  await page.goto(RUTA);
  await expect(puntos(page)).toHaveCount(90);

  await page.locator('#datosPropios').fill('esto no son datos\nni esto tampoco');
  await page.getByRole('button', { name: 'Agrupar mis datos' }).click();

  // El announcer de rutas de Next también es role="alert": hay que quedarse con el de la app
  await expect(page.getByRole('alert').filter({ hasText: 'No se ha encontrado' }))
    .toContainText('dos columnas numéricas');
  await expect(puntos(page)).toHaveCount(90);
});

test('cuenta las filas ilegibles en lugar de descartarlas en silencio', async ({ page }) => {
  await page.goto(RUTA);
  await page.locator('#datosPropios').fill('1 2\nfila rota\n3 4\n5 6');
  await page.getByRole('button', { name: 'Agrupar mis datos' }).click();

  await expect(puntos(page)).toHaveCount(3);
  await expect(page.getByRole('status').filter({ hasText: 'puntos importados' }))
    .toContainText('descartado 1 filas');
});

test('el botón de ejemplo rellena la caja y agrupa de una vez', async ({ page }) => {
  await page.goto(RUTA);
  await page.getByRole('button', { name: 'Rellenar con un ejemplo' }).click();

  await expect(page.locator('#datosPropios')).toContainText('edad;ingresos');
  await expect(puntos(page)).toHaveCount(8);
});
