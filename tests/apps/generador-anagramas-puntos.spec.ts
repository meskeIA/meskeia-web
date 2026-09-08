import { test, expect, Page } from '@playwright/test';

/**
 * generador-anagramas — puntuación de Scrabble y criterio de orden (S0128).
 *
 * La app ya modelaba el atril del juego (incluidas las dos fichas blancas), pero
 * devolvía la lista sin decir cuál puntúa más, que es la decisión que el jugador
 * tiene delante. Aquí se comprueba lo que la vista promete ahora.
 *
 * EL ORÁCULO NO ES LA APP. Los puntos salen de la tabla oficial de la edición
 * española, sumados a mano:
 *
 *   ASA  = A(1) + S(1) + A(1)         = 3
 *   CASA = C(3) + A(1) + S(1) + A(1)  = 6
 *   SACA = S(1) + A(1) + C(3) + A(1)  = 6
 *
 * El motor puro tiene sus propios casos en tests/puntuacion-scrabble-motor.spec.ts;
 * esto verifica que la vista los pinta y los ordena, que es otra cosa.
 */

const URL_APP = '/generador-anagramas/';

/** Teclea un atril y espera a que la rejilla de resultados esté pintada. */
async function buscarCon(page: Page, atril: string) {
  await page.goto(URL_APP);
  const campo = page.getByLabel(/tus letras/i).first();
  await campo.fill(atril);
  const boton = page.getByRole('button', { name: 'Buscar palabras' });
  await expect(boton).toBeEnabled({ timeout: 15000 });
  await boton.click();
  await expect(page.getByRole('heading', { name: /Palabras encontradas/ })).toBeVisible({
    timeout: 15000,
  });
}

/** Los puntos de cada chip, en el orden en que la app los pinta. */
async function puntosEnPantalla(page: Page): Promise<number[]> {
  // Los CSS modules de Next ponen el nombre local AL FINAL de la clase
  // (`Fichero-module__HASH__chipPuntos`), asi que se ancla con `$=`: con `*=`
  // el selector cazaba tambien .chipPuntosUnidad y colaba un cero entre cada
  // dos puntuaciones, y una lista vacia hacia pasar en falso la comprobacion
  // de orden.
  const textos = await page.locator('[class$="chipPuntos"]').allInnerTexts();
  return textos.map((t) => Number(t.replace(/[^0-9]/g, '')));
}

test.describe('generador-anagramas · puntuación', () => {
  test('cada palabra muestra su puntuación, y son las de la tabla española', async ({ page }) => {
    await buscarCon(page, 'casa');

    // El chip de CASA dice 6, no otra cosa. Se localiza por su texto exacto para
    // no confundirlo con SACA, que puntúa lo mismo pero es otra palabra.
    const chipCasa = page.locator('[class*="wordChip"]', { hasText: /^casa\s*6/ }).first();
    await expect(chipCasa).toBeVisible();

    const asa = page.locator('[class*="wordChip"]', { hasText: /^asa\s*3/ }).first();
    await expect(asa).toBeVisible();
  });

  test('ordenar por puntos deja la lista de mayor a menor', async ({ page }) => {
    await buscarCon(page, 'zapatas');

    await page.getByRole('button', { name: 'Puntos' }).click();
    await expect(page.getByRole('heading', { name: /De más a menos puntos/ })).toBeVisible();

    const puntos = await puntosEnPantalla(page);
    expect(puntos.length).toBeGreaterThan(3);
    // La invariante del criterio: ningún elemento puntúa más que el anterior.
    for (let i = 1; i < puntos.length; i++) {
      expect(puntos[i]).toBeLessThanOrEqual(puntos[i - 1]);
    }
    // Y la promesa del resumen coincide con la cabeza de la lista.
    await expect(page.getByText(/La más valiosa:/)).toContainText(String(puntos[0]));
  });

  test('el criterio cambia de verdad el orden, no solo la etiqueta', async ({ page }) => {
    await buscarCon(page, 'zapatas');

    const porLongitud = await puntosEnPantalla(page);
    await page.getByRole('button', { name: 'Puntos' }).click();
    const porPuntos = await puntosEnPantalla(page);

    // Que la lista por longitud NO esté ya ordenada por puntos es lo que hace útil
    // al criterio nuevo: si lo estuviera, el botón no aportaría nada.
    const yaOrdenadaPorPuntos = porLongitud.every(
      (p, i) => i === 0 || p <= porLongitud[i - 1],
    );
    expect(yaOrdenadaPorPuntos).toBe(false);

    // Y la cabeza de la lista por puntos es el máximo de todas: en este atril
    // resulta ser también la más larga (ZAPATAS se lleva la Z), y eso está bien
    // — lo que se comprueba es el máximo, no que cambie de palabra.
    expect(porPuntos[0]).toBe(Math.max(...porLongitud));
  });

  test('los dos botones declaran su estado con aria-pressed', async ({ page }) => {
    await buscarCon(page, 'casa');

    const porLongitud = page.getByRole('button', { name: 'Longitud' });
    const porPuntos = page.getByRole('button', { name: 'Puntos' });

    await expect(porLongitud).toHaveAttribute('aria-pressed', 'true');
    await expect(porPuntos).toHaveAttribute('aria-pressed', 'false');

    await porPuntos.click();
    await expect(porLongitud).toHaveAttribute('aria-pressed', 'false');
    await expect(porPuntos).toHaveAttribute('aria-pressed', 'true');
  });

  test('la ficha blanca no suma: la misma palabra puntúa menos con comodín', async ({ page }) => {
    // «cas?» forma CASA poniendo la última A con la blanca: A vale 1, así que
    // baja de 6 a 5. Es el matiz que decide una jugada y el que la app tiene que
    // contar bien.
    await buscarCon(page, 'cas?');

    const chipCasa = page.locator('[class*="wordChip"]', { hasText: /^casa\s*5/ }).first();
    await expect(chipCasa).toBeVisible();
  });
});
