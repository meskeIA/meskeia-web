import { test, expect, type Page } from '@playwright/test';

/**
 * Service worker de meskeIA (components/ServiceWorkerRegister.tsx + public/sw.js) — cabo C0237.
 *
 * El registro colgaba de `load` DENTRO de un useEffect: si la hidratación acababa después de
 * `load`, esa carga se quedaba sin SW (el Inspector del 13/10/2026 midió 0 registros en / y en
 * /lupa-digital/). Y lo que guardaba no tenía límite: cada GET que no fuera /api/. Aquí se mide
 * lo que se prometía en la FAQ de lupa-digital («solo necesitas conexión para cargar la página
 * por primera vez») y que el almacenamiento queda acotado.
 *
 * playwright.config bloquea los service workers por defecto; este spec es el único que los deja.
 */
test.use({ serviceWorkers: 'allow' });

const CACHE_PAGINAS = 'meskeia-paginas-v4';
const CACHE_CHUNKS = 'meskeia-chunks-v4';
const MAX_PAGINAS = 40;

async function esperarRegistro(page: Page) {
  await page.waitForFunction(
    async () => Boolean(await navigator.serviceWorker.getRegistration()),
    null,
    { timeout: 20_000 },
  );
}

async function esperarControl(page: Page) {
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller), null, { timeout: 20_000 });
}

test.describe('Service worker — cabo C0237', () => {
  for (const ruta of ['/', '/lupa-digital/', '/conversor-braille/']) {
    test(`se registra en ${ruta} aunque la hidratación acabe después de «load»`, async ({ page }) => {
      await page.goto(ruta, { waitUntil: 'load' });
      await esperarRegistro(page);
    });
  }

  test('una app ya visitada se recarga sin conexión, con su contenido y no con un error', async ({ page, context }) => {
    test.setTimeout(90_000);
    await page.goto('/conversor-braille/', { waitUntil: 'load' });
    const titulo = (await page.locator('h1').first().innerText()).trim();
    expect(titulo.length).toBeGreaterThan(0);
    await esperarRegistro(page);
    await esperarControl(page);

    // Segunda carga ya controlada: la página y sus chunks pasan por el SW y quedan guardados
    await page.reload({ waitUntil: 'load' });
    await page.waitForFunction(
      async ([nombre]) => {
        const cache = await caches.open(nombre);
        return Boolean(await cache.match(location.origin + location.pathname));
      },
      [CACHE_PAGINAS],
      { timeout: 15_000 },
    );

    await context.setOffline(true);
    try {
      await page.reload({ waitUntil: 'domcontentloaded' });
      await expect(page.locator('h1').first()).toHaveText(titulo);
    } finally {
      await context.setOffline(false);
    }
  });

  test('solo guarda páginas y chunks del propio origen, y la caché de páginas tiene tope', async ({ page }) => {
    test.setTimeout(90_000);
    await page.goto('/lupa-digital/', { waitUntil: 'load' });
    await esperarRegistro(page);
    await esperarControl(page);

    // Se llena la caché de páginas por encima del tope; la siguiente navegación la recorta
    await page.evaluate(async ([nombre]) => {
      const cache = await caches.open(nombre);
      for (let i = 0; i < 60; i++) {
        await cache.put(`${location.origin}/relleno-${i}/`, new Response('relleno'));
      }
    }, [CACHE_PAGINAS]);

    await page.reload({ waitUntil: 'load' });
    await page.waitForFunction(
      async ([nombre, maximo]) => {
        const claves = await (await caches.open(String(nombre))).keys();
        return claves.length <= Number(maximo)
          && claves.some((c) => new URL(c.url).pathname === location.pathname);
      },
      [CACHE_PAGINAS, MAX_PAGINAS] as const,
      { timeout: 15_000 },
    );

    const inventario = await page.evaluate(async () => {
      const salida: Record<string, string[]> = {};
      for (const nombre of await caches.keys()) {
        salida[nombre] = (await (await caches.open(nombre)).keys()).map((r) => r.url);
      }
      return { origen: location.origin, salida };
    });

    expect(Object.keys(inventario.salida).sort()).toEqual(
      ['meskeia-chunks-v4', 'meskeia-paginas-v4', 'meskeia-static-v4'].filter((n) => n in inventario.salida).sort(),
    );
    for (const url of Object.values(inventario.salida).flat()) {
      expect(url.startsWith(inventario.origen), url).toBe(true);
      expect(url, url).not.toContain('/api/');
    }
    for (const url of inventario.salida[CACHE_CHUNKS] ?? []) {
      expect(new URL(url).pathname.startsWith('/_next/static/'), url).toBe(true);
    }
    for (const url of inventario.salida[CACHE_PAGINAS] ?? []) {
      expect(new URL(url).search, url).toBe('');
    }
  });
});
