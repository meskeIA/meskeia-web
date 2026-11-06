/**
 * creador-thumbnails — cabo C0630 (06/11/2026).
 *
 * El testigo tests/apps/desborde-390.spec.ts falló en la suite entera del 04/11 con la página a
 * 835 px en 390 y a 1.310 en 1.280, y pasaba 3 de 3 aislado. No era inestable: esas son
 * EXACTAMENTE las medidas del HTML servido. El tamaño de la vista previa salía de un estado
 * `scale` que valía 1 hasta que un efecto medía la columna, así que el servidor pintaba el lienzo
 * a 1.280 px y la página desbordaba hasta que llegaba el JS: en un móvil lento, de verdad; en la
 * suite, cuando la medida caía antes del efecto. Ahora lo dimensiona el CSS (su columna, hasta
 * 900 px, en 16:9) y el ratón lee la escala del propio lienzo.
 */
import { test, expect, type Page } from '@playwright/test';
import { esperarPaginaAsentada } from './_hidratacion';

const RUTA = '/creador-thumbnails/';

for (const ancho of [390, 1280]) {
  test(`a ${ancho} px el HTML servido, sin JS, ya cabe en la pantalla y la vista previa en su columna`, async ({
    browser,
  }) => {
    const contexto = await browser.newContext({ javaScriptEnabled: false, viewport: { width: ancho, height: 900 } });
    const page = await contexto.newPage();
    await page.goto(RUTA);
    const r = await page.evaluate(() => {
      const envoltorio = document.querySelector('[class*="canvasWrapper"]') as HTMLElement;
      const lienzo = envoltorio.querySelector('canvas')!.getBoundingClientRect();
      return {
        body: document.body.scrollWidth,
        columna: envoltorio.parentElement!.clientWidth,
        ancho: lienzo.width,
        alto: lienzo.height,
      };
    });
    await contexto.close();
    expect(r.body, 'ancho de la página').toBeLessThanOrEqual(ancho);
    // La columna, hasta 900 px: 358 a 390 y 684 a 1.280, las mismas que con el JS de antes
    expect(r.ancho).toBeCloseTo(Math.min(r.columna, 900), 0);
    expect(r.alto).toBeCloseTo((r.ancho * 720) / 1280, 0);
  });
}

/** Pasa un punto del lienzo (1280 × 720) a coordenadas de la pantalla, con la escala a la vista. */
async function aPantalla(page: Page, x: number, y: number): Promise<{ x: number; y: number }> {
  const caja = (await page.locator('[class*="canvasWrapper"] canvas').boundingBox())!;
  const escala = caja.width / 1280;
  return { x: caja.x + x * escala, y: caja.y + y * escala };
}

for (const ancho of [390, 1280]) {
  test(`a ${ancho} px arrastrar un emoji lo lleva bajo el cursor, y se vuelve a coger donde ha quedado`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: ancho, height: 900 });
    await page.goto(RUTA);
    await esperarPaginaAsentada(page);
    await page.getByRole('button', { name: 'Emoji' }).click();
    await page.locator('[class*="emojiBtn"]').first().click();
    // Un emoji nuevo ocupa (100, 100)–(180, 180) y queda seleccionado: sale su rótulo de tamaño
    const rotulo = page.getByText(/^Tamaño: 64px$/);
    await expect(rotulo).toBeVisible();
    await page.locator('[class*="canvasWrapper"] canvas').scrollIntoViewIfNeeded();

    const desde = await aPantalla(page, 140, 140);
    await page.mouse.move(desde.x, desde.y);
    await page.mouse.down();
    const hasta = await aPantalla(page, 640, 340);
    await page.mouse.move(hasta.x, hasta.y, { steps: 5 });
    await page.mouse.up();

    // Donde estaba ya no hay nada: pulsar ahí deselecciona
    const viejo = await aPantalla(page, 140, 140);
    await page.mouse.move(viejo.x, viejo.y);
    await page.mouse.down();
    await page.mouse.up();
    await expect(rotulo).toHaveCount(0);
    // Y donde se soltó, sí: está en (600, 300)–(680, 380)
    const nuevo = await aPantalla(page, 640, 340);
    await page.mouse.move(nuevo.x, nuevo.y);
    await page.mouse.down();
    await page.mouse.up();
    await expect(rotulo).toBeVisible();
  });
}
