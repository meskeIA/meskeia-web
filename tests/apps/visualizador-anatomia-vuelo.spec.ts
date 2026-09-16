import { test, expect } from '@playwright/test';

/**
 * visualizador-anatomia-vuelo — el perfil de altitud · 16/09/2026
 *
 * Nace de la auditoría posterior al bug de `simulador-kmeans` (a59ba434): aquí el gráfico se
 * dibujaba recorriendo una lista `altitudes` de 7 números y leyendo `fases[i]` para el icono y
 * la etiqueta. Eran dos literales paralelos que había que mantener a la vez, así que añadir una
 * fase sin añadir su altitud dejaba el punto sin fase detrás. No llegó a fallar —los dos
 * literales tenían 7—, pero es la misma forma, y ahora la altitud viaja dentro de cada fase.
 *
 * Lo que fija este fichero es que la refactorización no cambió el dibujo: mismos puntos, mismas
 * alturas y mismas etiquetas. El desajuste que corrige ya no puede ocurrir por construcción, y
 * eso no hay test que lo pruebe: se ve en que ya no hay dos listas.
 */

const RUTA = '/visualizador-anatomia-vuelo/';

const puntos = (page: import('@playwright/test').Page) =>
  page.locator('[class*="altitudPunto"]');

// La app abre en «Por que vuela»: el perfil vive en la segunda sección
test.beforeEach(async ({ page }) => {
  await page.goto(RUTA);
  await page.getByRole('button', { name: 'Fases del vuelo' }).click();
  await expect(puntos(page).first()).toBeVisible();
});

test('el perfil dibuja un punto por fase, con su etiqueta', async ({ page }) => {
  await expect(puntos(page)).toHaveCount(7);
  await expect(puntos(page).first()).toHaveAttribute('aria-label', 'Fase 1: Revision preflight');
  await expect(puntos(page).nth(4)).toHaveAttribute('aria-label', 'Fase 5: Crucero');
  await expect(puntos(page).last()).toHaveAttribute('aria-label', 'Fase 7: Aterrizaje');

  // El 7 del texto sale de `fases.length`. Que venga de ahí y no de un número tecleado no hay
  // test que lo distinga; lo que sí se comprueba es que la cifra coincide con los puntos.
  await expect(page.getByText('7 fases diferenciadas')).toBeVisible();
});

test('cada punto está a la altura de su fase y el crucero es el más alto', async ({ page }) => {
  await expect(puntos(page)).toHaveCount(7);

  const alturas = await puntos(page).evaluateAll((els) =>
    els.map((el) => (el as HTMLElement).style.bottom),
  );
  // Suelo, suelo, despegue, ascenso, crucero, descenso, suelo
  expect(alturas).toEqual(['0%', '0%', '2%', '50%', '100%', '50%', '0%']);

  const izquierdas = await puntos(page).evaluateAll((els) =>
    els.map((el) => Math.round(parseFloat((el as HTMLElement).style.left))),
  );
  // Repartidos de 0 a 100 en 6 saltos: el último cae justo en el borde derecho
  expect(izquierdas[0]).toBe(0);
  expect(izquierdas[6]).toBe(100);
  expect(izquierdas[3]).toBe(50);
});

test('la línea del SVG pasa por los mismos 7 puntos', async ({ page }) => {
  const puntosLinea = await page
    .locator('svg[class*="altitudSvg"] polyline')
    .first()
    .getAttribute('points');

  // 200 − altitud × 2: el crucero (100) llega a y=0 y el suelo (0) se queda en y=200
  expect(puntosLinea).toBe('0,200 100,200 200,196 300,100 400,0 500,100 600,200');
});

test('pulsar un punto abre su fase y volver a pulsarlo la cierra', async ({ page }) => {
  const crucero = puntos(page).nth(4);
  await crucero.click();
  await expect(crucero).toHaveClass(/altitudPuntoActivo/);

  await crucero.click();
  await expect(crucero).not.toHaveClass(/altitudPuntoActivo/);
});
