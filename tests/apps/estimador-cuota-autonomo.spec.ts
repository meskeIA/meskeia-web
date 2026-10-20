import { test, expect, Page } from '@playwright/test';

import { esperarHidratacion, esperarValorEnReact } from './_hidratacion';

/**
 * estimador-cuota-autonomo — el tramo del RETA con el rendimiento COMPUTABLE (cabo C0105)
 * Escrita el 18/10/2026, al reparar el defecto.
 *
 * QUÉ DEFECTO VIGILA
 * ──────────────────
 * La app buscaba el tramo con (ingresos − gastos) / 12. El art. 308.1.c LGSS (BOE-A-2015-11724,
 * cotejado el 02/10/2026; `GASTOS_GENERICOS_RETA` de data/fiscal/autonomos.ts) dice que el tramo
 * lo decide el rendimiento neto más las cuotas (regla 1.ª), que es justo esa resta porque el campo
 * de gastos no lleva la cuota, MENOS un 7 % de gastos genéricos (regla 2.ª). Sin el 7 %, quien
 * está cerca de una frontera cotiza un tramo por encima.
 *
 * DE DÓNDE SALE CADA CIFRA — de la norma y de data/fiscal, NO de lo que devuelve la app
 *   · TRAMOS_RETA_2025 (Orden PJC/297/2026, art. 18) y TIPO_COTIZACION_RETA (31,50 %)
 */

const RUTA = '/estimador-cuota-autonomo/';
const ESPACIO_DURO = new RegExp(String.fromCharCode(160), 'g');
const limpiar = (s: string) => s.replace(ESPACIO_DURO, ' ').replace(/\s+/g, ' ').trim();

/** Importe de una fila del desglose, por su etiqueta. */
async function fila(page: Page, etiqueta: RegExp): Promise<string> {
  const rotulo = page.locator('span').filter({ hasText: etiqueta }).first();
  return limpiar(await rotulo.locator('xpath=following-sibling::span[1]').innerText());
}

async function calcular(page: Page, ingresos: string, gastos: string, regimen?: 'normal' | 'simplificada'): Promise<void> {
  if (regimen) await page.locator('#regimen').selectOption(regimen);
  await page.locator('#ingresos').fill(ingresos);
  await esperarValorEnReact(page, '#ingresos', ingresos);
  await page.locator('#gastos').fill(gastos);
  await esperarValorEnReact(page, '#gastos', gastos);
  await expect(page.getByRole('heading', { name: /Tu cuota estimada/ })).toBeVisible();
}

test.beforeEach(async ({ page }) => {
  await page.goto(RUTA);
  await esperarHidratacion(page, ['#ingresos', '#gastos']);
});

test('C0105 · 30.000 € de ingresos y 4.500 € de gastos: tramo 8, cuota 380,88 € (no el 9 y 401,47 €)', async ({ page }) => {
  // Neto = 30.000 − 4.500 = 25.500 €/año = 2.125,00 €/mes (sin la cuota: el campo no la lleva).
  // Computable = 25.500 × (1 − 7 %) / 12 = 1.976,25 €/mes
  //   → tramo 8 de TRAMOS_RETA_2025 (> 1.850 y ≤ 2.030), base mínima 1.209,15 €
  //   → cuota 1.209,15 × 31,50 % = 380,882 → 380,88 €/mes · × 12 = 4570,59 €/año
  // Antes del 18/10/2026: 2.125,00 → tramo 9, base 1.274,51 €, cuota 401,47 €.
  // Cuentas de la directa NORMAL: la simplificada, por defecto desde el 20/10/2026, es el C0294.
  await calcular(page, '30000', '4500', 'normal');

  expect(await fila(page, /^Rendimiento neto mensual$/)).toBe('2125,00 €');
  expect(await fila(page, /^Rendimiento computable mensual/)).toBe('1976,25 €');
  expect(await fila(page, /^Tramo aplicable$/)).toBe('Tramo 8');
  expect(await fila(page, /^Base de cotización$/)).toBe('1209,15 €');
  expect(await fila(page, /^Cuota mensual \(sin bonificación\)$/)).toBe('380,88 €');
  expect(await fila(page, /^Cuota anual \(sin bonificación\)$/)).toBe('4570,59 €');
});

test('la base por defecto es la MÍNIMA del tramo también con rentas altas: 90.000/6.000 → 607,35 €', async ({ page }) => {
  // Neto = 84.000 €/año = 7.000,00 €/mes. En la simplificada (por defecto, cabo C0294) el 5 % de
  // 84.000 − 7.288,22 (cuota del tramo 15) = 3.835,59 se capa en 2.000 €/año (art. 30, regla 2.ª,
  // RIRPF) → computable (84.000 − 2.000) × 0,93 / 12 = 6.355,00 €/mes (en la normal, 6.510,00)
  //   → tramo 15 (> 6.000), base mínima 1.928,10 € → cuota 1.928,10 × 31,50 % = 607,3515 → 607,35 €
  // Hasta el 18/10/2026 un neto mayor que la base máxima del tramo (5.101,20 €) tomaba la máxima:
  // 5.101,20 × 31,50 % = 1.606,88 €/mes, cuando la propia app dice «por defecto usamos la mínima».
  await calcular(page, '90000', '6000');

  expect(await fila(page, /^Rendimiento computable mensual/)).toBe('6355,00 €');
  expect(await fila(page, /^Tramo aplicable$/)).toBe('Tramo 15');
  expect(await fila(page, /^Base de cotización$/)).toBe('1928,10 €');
  expect(await fila(page, /^Cuota mensual \(sin bonificación\)$/)).toBe('607,35 €');
});

test('C0105 · el recuadro del tramo habla de rendimiento computable', async ({ page }) => {
  await calcular(page, '30000', '4500');
  const recuadro = page.locator('h4', { hasText: /Tu tramo: 8/ }).locator('xpath=..');
  await expect(recuadro).toContainText('Rendimiento computable mensual entre');
});

// Cabo C0294 (20/10/2026): la app suponía siempre la directa NORMAL. Pregunta el régimen, con la
// simplificada por defecto, cuyo rendimiento neto lleva restado un 5 % de difícil justificación
// (art. 30, regla 2.ª, RIRPF, tope 2.000 €/año, BOE-A-2007-6820 consultado el 20/10/2026) sobre el
// neto ya descontada la cuota; la regla 1.ª del art. 308.1.c LGSS devuelve la cuota, no el 5 %.
test('C0294 · 30.000 y 4.500 en simplificada (por defecto): computable 1.895,15 €, sigue en el tramo 8', async ({ page }) => {
  // Tramo 8: cuota 380,88225 → 4.570,587 €/año; 5 % de (25.500 − 4.570,587) = 1.046,47065
  // → (25.500 − 1.046,47065) × 0,93 / 12 = 1.895,1485 → 1.895,15 €/mes, tramo 8: estable.
  await expect(page.locator('#regimen')).toHaveValue('simplificada');
  await expect(page.getByRole('combobox', { name: /Régimen en el IRPF/ })).toBeVisible();
  await calcular(page, '30000', '4500');

  expect(await fila(page, /^Rendimiento computable mensual/)).toBe('1895,15 €');
  expect(await fila(page, /^Tramo aplicable$/)).toBe('Tramo 8');
  expect(await fila(page, /^Cuota mensual \(sin bonificación\)$/)).toBe('380,88 €');
  const texto = limpiar((await page.locator('body').textContent()) ?? '');
  expect(texto).toContain('Régimen supuesto: estimación directa simplificada (resta un 5 % de gastos de difícil justificación, máximo 2000,00 € al año');
});

test('C0294 · frontera: 1.900 €/mes de computable normal bajan en simplificada del tramo 8 (380,88 €) al 7 (360,29 €)', async ({ page }) => {
  // 1.900 × 12 / 0,93 = 24.516,13 de ingresos − gastos. Normal: 24.516,13 × 0,0775 = 1.900,00 →
  // tramo 8, base 1.209,15, cuota 380,88. Simplificada: con la cuota del 8 sale 1.822,71 → tramo 7;
  // con la del 7 (1.143,79 × 31,50 % = 360,29385 → 4.323,5262/año): 5 % de 20.192,6038 = 1.009,63
  // → (24.516,13 − 1.009,63) × 0,0775 = 1.821,75 → tramo 7, estable: base 1.143,79, cuota 360,29.
  await calcular(page, '24516,13', '0', 'normal');
  expect(await fila(page, /^Rendimiento computable mensual/)).toBe('1900,00 €');
  expect(await fila(page, /^Tramo aplicable$/)).toBe('Tramo 8');
  expect(await fila(page, /^Cuota mensual \(sin bonificación\)$/)).toBe('380,88 €');
  expect(limpiar((await page.locator('body').textContent()) ?? '')).toContain('Régimen supuesto: estimación directa normal');

  await page.locator('#regimen').selectOption('simplificada');
  await expect(page.locator('span').filter({ hasText: /^Tramo 7$/ })).toBeVisible();
  expect(await fila(page, /^Rendimiento computable mensual/)).toBe('1821,75 €');
  expect(await fila(page, /^Base de cotización$/)).toBe('1143,79 €');
  expect(await fila(page, /^Cuota mensual \(sin bonificación\)$/)).toBe('360,29 €');
});
