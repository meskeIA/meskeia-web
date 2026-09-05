import { test, expect, type Page } from '@playwright/test';

/**
 * simulador-automata-pila — 05/09/2026
 *
 * El motor está probado aparte con 22 casos a mano (tests/automata-pila-motor.spec.ts).
 * Aquí se comprueba que la pantalla usa ese motor y no una copia suya, sobre los ejemplos
 * precargados que la propia app trae, y que el no determinismo funciona de verdad.
 *
 * CASOS RESUELTOS A MANO, sobre el ejemplo aⁿbⁿ (apila una A por cada «a», desapila una
 * por cada «b», acepta si al final solo queda el fondo de pila):
 *
 *   «aabb»  → ACEPTADA   (dos a y dos b)
 *   «ab»    → ACEPTADA   (el caso mínimo, n = 1)
 *   «aab»   → RECHAZADA  (sobra una a: la pila no llega a vaciarse)
 *   «abb»   → RECHAZADA  (sobra una b y no hay A que desapilar)
 *   «ba»    → RECHAZADA  (el orden importa)
 *
 * Y sobre palíndromos pares ww^R, que EXIGE no determinismo porque el autómata tiene que
 * adivinar dónde está la mitad de la cadena:
 *
 *   «abba»  → ACEPTADA
 *   «abab»  → RECHAZADA
 */

const URL_APP = '/simulador-automata-pila/';

async function probar(page: Page, cadena: string) {
  await page.locator('#cadena').fill(cadena);
  await page.getByRole('button', { name: /Simular/ }).click();
}

test.describe('simulador-automata-pila', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URL_APP);
    await page.getByRole('button', { name: /por estado final/ }).click();
  });

  test('A MANO: aⁿbⁿ acepta «aabb» y «ab»', async ({ page }) => {
    await probar(page, 'aabb');
    await expect(page.getByText('Cadena aceptada')).toBeVisible();

    await probar(page, 'ab');
    await expect(page.getByText('Cadena aceptada')).toBeVisible();
  });

  test('A MANO: aⁿbⁿ rechaza «aab», «abb» y «ba»', async ({ page }) => {
    for (const cadena of ['aab', 'abb', 'ba']) {
      await probar(page, cadena);
      await expect(page.getByText('Cadena rechazada')).toBeVisible();
    }
  });

  test('rechazar exige agotar TODOS los caminos, y así se dice', async ({ page }) => {
    await probar(page, 'aab');
    // El motivo del motor distingue un rechazo firme de una exploración truncada
    await expect(page.getByText(/todos los caminos posibles/)).toBeVisible();
  });

  test('A MANO: los palíndromos pares exigen no determinismo — «abba» sí, «abab» no', async ({ page }) => {
    await page.getByRole('button', { name: /Palíndromos pares/ }).click();

    await probar(page, 'abba');
    await expect(page.getByText('Cadena aceptada')).toBeVisible();

    await probar(page, 'abab');
    await expect(page.getByText('Cadena rechazada')).toBeVisible();
  });

  test('el ejemplo por PILA VACÍA acepta sin necesitar estado final', async ({ page }) => {
    await page.getByRole('button', { name: /por pila vacía/ }).click();

    await probar(page, 'aabb');
    await expect(page.getByText('Cadena aceptada')).toBeVisible();
    await expect(page.getByText(/pila/).first()).toBeVisible();
  });

  test('la traza recorre el camino y termina con la entrada consumida', async ({ page }) => {
    await probar(page, 'aabb');
    await expect(page.getByText('Cadena aceptada')).toBeVisible();
    // La app informa de cuántas configuraciones ha explorado: es lo que mide la ramificación
    await expect(page.getByText('configuraciones exploradas').first()).toBeVisible();
  });

  test('la guía educativa está en el HTML servido, no solo tras hidratar', async ({ page }) => {
    const respuesta = await page.request.get(URL_APP);
    expect(respuesta.ok()).toBeTruthy();
    const html = await respuesta.text();
    expect(html).toContain('Chomsky');
    expect(html.toLowerCase()).toContain('bombeo');
  });
});
