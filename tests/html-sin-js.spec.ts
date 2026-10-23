/**
 * Sin JavaScript, la página se ve: el HTML servido no lleva el contenido escondido tras un spinner.
 *
 * Cabo C0381 (23/10/2026): `app/loading.tsx` envolvía cada página en un Suspense y, como el
 * contenido supera el trozo de React, el HTML salía con el fallback visible («Cargando
 * aplicación... Preparando tu experiencia meskeIA») y la página real en `<div hidden id="S:0">`,
 * que solo revela el script inline `$RC`. Quien no ejecuta JS —rastreadores de IA, lectores sin
 * JS— veía el spinner en TODAS las páginas. Se retiró `loading.tsx`; este test falla si vuelve
 * un fallback global que esconda la página.
 *
 * Ejecutar con: npx playwright test tests/html-sin-js.spec.ts
 */

import { test, expect } from '@playwright/test';

test.use({ javaScriptEnabled: false });

const PAGINAS = ['/', '/calculadora-porcentajes/', '/generador-loteria/'];

for (const ruta of PAGINAS) {
  test(`C0381 · ${ruta} sin JavaScript muestra su h1 y no el spinner de carga`, async ({ page }) => {
    await page.goto(ruta);
    await expect(page.locator('h1').first()).toBeVisible();
    await expect(page.getByText('Cargando aplicación...')).toHaveCount(0);
    // El contenido no debe quedar dentro de un contenedor de Suspense pendiente de revelar
    await expect(page.locator('div[hidden][id^="S:"] h1')).toHaveCount(0);
  });
}
