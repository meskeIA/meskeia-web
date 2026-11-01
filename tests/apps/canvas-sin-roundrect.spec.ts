import { test, expect, type Page } from '@playwright/test';

/**
 * Cabo C0535 (01/11/2026) — `CanvasRenderingContext2D.roundRect` no existe en Chrome < 99,
 * Safari < 16 ni Firefox < 112, y las seis apps que lo llamaban sin comprobarlo caían a la
 * pantalla de error. Caso de origen: fila `pag:error` 140878 de Turso (30/10/2026),
 * /simulador-mitosis-meiosis/ en Chrome 97 de Linux, «TypeError: e.roundRect is not a function».
 *
 * Aquí se quita el método del prototipo ANTES de que cargue la app (como en ese Chrome 97) y se
 * recorre lo que dibuja un rectángulo redondeado en cada una. Todas pasan ahora por
 * `trazarRectRedondeado` de `lib/canvas.ts`, que traza con `arcTo` si falta el nativo.
 * Una llamada nueva a `ctx.roundRect(` en otra app no la ve este testigo: si aparece, añadir
 * aquí su fila.
 */

interface Fila {
  slug: string;
  /** Lo que hay que hacer para que la app dibuje el rectángulo redondeado (si no lo hace al cargar). */
  provocar?: (page: Page) => Promise<void>;
}

const FILAS: Fila[] = [
  {
    slug: 'simulador-mitosis-meiosis',
    // En la interfase la cromatina va difusa y no hay cromosomas: el rectángulo redondeado
    // sale en la profase, que es la fase siguiente.
    provocar: async (page) => {
      await page.getByRole('button', { name: 'Fase siguiente' }).click();
    },
  },
  { slug: 'simulador-mas-resorte' },
  { slug: 'simulador-tcp-handshake' },
  { slug: 'simulador-funciones-transformaciones' },
  {
    slug: 'generador-og-images',
    // La plantilla en blanco no lleva badge; la de artículo sí («NUEVO»).
    provocar: async (page) => {
      await page.getByRole('button', { name: /Artículo \/ Blog/ }).click();
    },
  },
  {
    slug: 'creador-thumbnails',
    provocar: async (page) => {
      await page.getByRole('button', { name: 'Formas', exact: true }).click();
      await page.locator('button[title="Badge"]').click();
    },
  },
];

for (const fila of FILAS) {
  test(`C0535 · ${fila.slug} no cae en un navegador sin roundRect`, async ({ page }) => {
    await page.addInitScript(() => {
      // Se retira a propósito, como en Chrome 97.
      delete (CanvasRenderingContext2D.prototype as Partial<CanvasRenderingContext2D>).roundRect;
    });
    const errores: string[] = [];
    page.on('pageerror', (e) => errores.push(String(e)));

    await page.goto(`/${fila.slug}/`);
    await expect(page.locator('canvas').first()).toBeVisible();
    expect(await page.evaluate(() => typeof CanvasRenderingContext2D.prototype.roundRect)).toBe('undefined');

    if (fila.provocar) {
      await fila.provocar(page);
    }
    // Los dibujos van en efectos y, en algunas, en requestAnimationFrame: dejar que corran.
    await page.waitForTimeout(1500);

    expect(errores.filter((e) => /roundRect/.test(e))).toEqual([]);
    await expect(page.getByRole('heading', { name: 'Algo salió mal' })).toHaveCount(0);
  });
}
