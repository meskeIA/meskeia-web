import { test, expect } from '@playwright/test';
import { esperarHidratacion } from './_hidratacion';

/**
 * Regresión de los DOS buscadores que quedan en el sitio, y de la ausencia del tercero.
 *
 * El 19/09/2026 se retiró el buscador modal Ctrl+K de la cabecera de las páginas
 * estáticas (`HeaderActions` → `SearchBar`). Llevaba roto desde el 26/04/2026
 * (`f2465ae8`, migración a MiniSearch): guardaba `suites` en `storeFields`, el
 * `extractField` propio aplana los arrays con `join(' ')` y MiniSearch usa ese mismo
 * extractor también para los campos almacenados, así que `result.suites` volvía como
 * cadena y `result.suites.map(...)` **tiraba la página entera** a la pantalla de error
 * en cuanto alguien tecleaba dos caracteres. Seis caídas registradas en nueve días y
 * cero clics medidos (`from=search`) en 30.
 *
 * Lo que este test protege:
 *   1. Que el buscador de la portada sigue devolviendo resultados MARCADOS — es el que
 *      sí se usa (272 clics/30d) y el que absorbe la función del retirado.
 *   2. Que el catálogo /apps/ conserva su buscador propio, que era la razón por la que
 *      el modal sobraba también allí.
 *   3. Que ninguna de las dos páginas lanza un TypeError al buscar. Esta es la parte
 *      que habría cazado el fallo original: no bastaba con que la página cargara, el
 *      error solo aparecía al PINTAR los resultados.
 */

/** Recoge los errores de consola y las excepciones no capturadas de la página. */
function vigilarErrores(page: import('@playwright/test').Page): string[] {
  const errores: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') errores.push(msg.text());
  });
  page.on('pageerror', (err) => errores.push(err.message));
  return errores;
}

test.describe('Buscador de la portada', () => {
  test('devuelve resultados marcados con from=home-search y sin errores', async ({ page }) => {
    const errores = vigilarErrores(page);

    await page.goto('/');
    await esperarHidratacion(page, ['input[aria-label="Describe lo que necesitas"]']);

    const campo = page.getByLabel('Describe lo que necesitas');
    await campo.fill('conversor de unidades');

    // Los resultados se calculan en un useMemo: aparecen en el mismo render.
    const resultados = page.locator('a[href*="from=home-search"]');
    await expect(resultados.first()).toBeVisible();

    const cuantos = await resultados.count();
    expect(cuantos, 'el buscador de la portada no ha devuelto ninguna app').toBeGreaterThan(0);
    expect(cuantos, 'el buscador muestra como mucho 5 resultados').toBeLessThanOrEqual(5);

    // Una consulta sin correspondencia posible dice por qué no hay nada, en vez de callar.
    await campo.fill('zzzzqqq');
    await expect(page.getByText(/no hemos encontrado apps/i)).toBeVisible();

    expect(errores, `errores en consola: ${errores.join(' | ')}`).toEqual([]);
  });
});

test.describe('Catálogo /apps/', () => {
  test('filtra con su buscador propio y ya no ofrece el modal Ctrl+K', async ({ page }) => {
    const errores = vigilarErrores(page);

    await page.goto('/apps/');
    await esperarHidratacion(page, ['input[aria-label="Buscar dentro del catálogo"]']);

    // El buscador modal de la cabecera está retirado: ni botón ni atajo.
    await expect(page.getByRole('button', { name: /buscar/i })).toHaveCount(0);
    await page.keyboard.press('Control+k');
    await expect(page.getByPlaceholder('Buscar aplicaciones...')).toHaveCount(0);

    // El de la página sí filtra.
    const tarjetas = page.locator('main a[href^="/"]');
    const antes = await tarjetas.count();

    await page.getByLabel('Buscar dentro del catálogo').fill('braille');
    await expect
      .poll(async () => tarjetas.count(), { message: 'el filtro del catálogo no ha reducido la lista' })
      .toBeLessThan(antes);
    const tarjetaBraille = page.getByRole('button', { name: /braille/i });
    await expect(tarjetaBraille).toBeVisible();

    // Abrirla pinta las etiquetas de suite con `app.suites.map(...)` sobre los datos del
    // catálogo — la MISMA operación que reventaba en el modal retirado, que la hacía
    // sobre lo que devolvía MiniSearch. Aquí debe funcionar: el array llega intacto.
    await tarjetaBraille.click();
    await expect(page.locator('a[href*="braille"]').first()).toBeVisible();

    expect(errores, `errores en consola: ${errores.join(' | ')}`).toEqual([]);
  });
});
