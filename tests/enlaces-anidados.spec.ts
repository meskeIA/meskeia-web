import { test, expect, devices, Page } from '@playwright/test';

/**
 * Ningún enlace dentro de otro enlace.
 *
 * HTML no permite un `<a>` dentro de otro `<a>` —un clic no puede pertenecer a dos
 * destinos a la vez— y el navegador, al encontrarlo, reescribe el árbol por su cuenta:
 * cierra el primero antes de abrir el segundo. El DOM real deja entonces de coincidir con
 * el que React esperaba, y de ahí el aviso de hidratación que salía en cada carga.
 *
 * El caso que motivó este test (21/08/2026): el Sidebar envolvía el logo en un
 * `<Link href="/">` y `MeskeiaLogo` traía **el suyo**, también a `/`. No se notaba porque
 * ambos van al mismo sitio, pero dejaba la portada con cuatro enlaces a `/`, obligaba a
 * pulsar Tab dos veces para atravesar el logo y hacía que un lector de pantalla anunciara
 * dos enlaces seguidos que dicen lo mismo.
 *
 * Se comprueba en el DOM del cliente y no en el HTML servido a propósito: el HTML estaba
 * limpio —el Sidebar usa un `<div>` mientras `!mounted`— y el anidamiento solo aparecía
 * después de hidratar. Mirar el HTML no habría cazado nada.
 */

/** Los enlaces anidados que haya en la página, descritos para que el fallo se lea solo. */
async function enlacesAnidados(page: Page) {
  return page.evaluate(() =>
    [...document.querySelectorAll('a a')].map((interno) => {
      const externo = interno.parentElement?.closest('a') as HTMLAnchorElement | null;
      return {
        interno: `${(interno as HTMLAnchorElement).getAttribute('href')} · ${interno.className}`,
        externo: `${externo?.getAttribute('href')} · ${externo?.className}`,
      };
    }),
  );
}

test('la portada no tiene ningún enlace dentro de otro', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  expect(await enlacesAnidados(page)).toEqual([]);
});

test('control — una app del catálogo tampoco (plantilla común)', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/calculadora-propinas/');
  await page.waitForLoadState('networkidle');

  expect(await enlacesAnidados(page)).toEqual([]);
});

test.describe('en móvil', () => {
  // Sin `...devices['Pixel 7']` entero: trae `defaultBrowserType`, que Playwright no
  // admite dentro de un describe porque obligaría a un worker nuevo.
  const PIXEL_7 = devices['Pixel 7'];
  test.use({
    viewport: PIXEL_7.viewport,
    userAgent: PIXEL_7.userAgent,
    deviceScaleFactor: PIXEL_7.deviceScaleFactor,
    isMobile: PIXEL_7.isMobile,
    hasTouch: PIXEL_7.hasTouch,
  });

  test('el menú lateral desplegado no anida enlaces', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // El SidebarMobile solo está en el DOM cuando se abre, así que hay que desplegarlo:
    // es la mitad del defecto que un test de escritorio no vería.
    const abrir = page.getByRole('button', { name: /Abrir menú/i }).first();
    await expect(abrir).toBeVisible();
    await abrir.click();
    // El panel es un <aside>: su rol accesible es complementary, no navigation.
    await expect(page.getByRole('complementary', { name: /Menú de navegación/i })).toBeVisible();

    expect(await enlacesAnidados(page)).toEqual([]);
  });
});
