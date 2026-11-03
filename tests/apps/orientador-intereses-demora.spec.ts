/**
 * orientador-intereses-demora — las fechas propuestas (reparar 03/11/2026, cabo C0603).
 *
 * Las dos fechas del formulario se proponían en el valor inicial de useState con el reloj
 * (hoyISOLocal), así que el HTML prerenderizado llevaba las del día del BUILD y React 19 no
 * corrige el atributo al hidratar (check:reloj-azar). Ahora nacen vacías y se proponen al montar:
 * hoy como fecha fin y 30 días antes como inicio, en LOCAL (cabo C0468).
 */
import { test, expect } from '@playwright/test';

const iso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

test('el HTML servido no lleva fechas en los inputs de fecha', async ({ request }) => {
  const html = await (await request.get('/orientador-intereses-demora/')).text();
  const inputsFecha = html.match(/<input[^>]*type="date"[^>]*>/g) ?? [];
  expect(inputsFecha.length).toBeGreaterThanOrEqual(2);
  for (const input of inputsFecha) expect(input, input).not.toMatch(/value="\d{4}-\d{2}-\d{2}"/);
});

test('al montar, propone hoy como fin y 30 días antes como inicio, sin errores de hidratación', async ({ page }) => {
  const errores: string[] = [];
  page.on('pageerror', (e) => errores.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error' && /hydrat/i.test(m.text())) errores.push(m.text()); });
  await page.goto('/orientador-intereses-demora/');
  const hoy = new Date();
  const hace30 = new Date();
  hace30.setDate(hace30.getDate() - 30);
  const fechas = page.locator('input[type="date"]');
  await expect(fechas.nth(0)).toHaveValue(iso(hace30));
  await expect(fechas.nth(1)).toHaveValue(iso(hoy));
  expect(errores).toEqual([]);
});
