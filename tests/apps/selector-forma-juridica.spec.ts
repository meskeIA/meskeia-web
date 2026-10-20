import { test, expect } from '@playwright/test';

/**
 * selector-forma-juridica — regresión de los tipos del IS (cabo C0339, 20/10/2026)
 *
 * La tabla «Fiscalidad», el párrafo «¿Cuándo puede el IS ser más favorable que el IRPF?» y la
 * lista de ventajas de la SL daban el IS como «23-25 %», con el 23 % plano de micropymes que la
 * Ley 7/2024 sustituyó en 2025 por una escala. Ahora se leen de data/fiscal.
 *
 * Cifras de la norma, no de data/fiscal: art. 29.1 LIS (25 % general, 15 % nueva creación) y
 * DT 44.ª.2.a) (19 % y 21 % en 2026 con cifra de negocios inferior a 1 millón), Ley 27/2014
 * consolidada (BOE-A-2014-12328), consultada el 20/10/2026.
 */

const RUTA = '/selector-forma-juridica/';

const ESPACIO_DURO = new RegExp(String.fromCharCode(160), 'g');
const limpiar = (s: string) => s.replace(ESPACIO_DURO, ' ').replace(/\s+/g, ' ').trim();

test('C0339 · los tipos del IS son los de 2026, no el «23-25 %»', async ({ page }) => {
  await page.goto(RUTA);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  const texto = limpiar((await page.locator('body').textContent()) ?? '');
  expect(texto).not.toMatch(/23-25 ?%/);
  expect(texto).toContain(
    'Impuesto sobre Sociedades (25 % general, o 19-21 % en 2026 con cifra de negocios inferior a 1 M €; 15 % los dos primeros ejercicios con beneficio)',
  );
  expect(texto).toContain(
    'el Impuesto sobre Sociedades (IS), al 25 % general, o 19-21 % en 2026 con cifra de negocios inferior a 1 M €, puede',
  );
});
