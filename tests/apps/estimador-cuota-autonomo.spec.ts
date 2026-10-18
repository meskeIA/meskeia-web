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

async function calcular(page: Page, ingresos: string, gastos: string): Promise<void> {
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
  await calcular(page, '30000', '4500');

  expect(await fila(page, /^Rendimiento neto mensual$/)).toBe('2125,00 €');
  expect(await fila(page, /^Rendimiento computable mensual/)).toBe('1976,25 €');
  expect(await fila(page, /^Tramo aplicable$/)).toBe('Tramo 8');
  expect(await fila(page, /^Base de cotización$/)).toBe('1209,15 €');
  expect(await fila(page, /^Cuota mensual \(sin bonificación\)$/)).toBe('380,88 €');
  expect(await fila(page, /^Cuota anual \(sin bonificación\)$/)).toBe('4570,59 €');
});

test('la base por defecto es la MÍNIMA del tramo también con rentas altas: 90.000/6.000 → 607,35 €', async ({ page }) => {
  // Neto = 84.000 €/año = 7.000,00 €/mes → computable 84.000 × 0,93 / 12 = 6.510,00 €/mes
  //   → tramo 15 (> 6.000), base mínima 1.928,10 € → cuota 1.928,10 × 31,50 % = 607,3515 → 607,35 €
  // Hasta el 18/10/2026 un neto mayor que la base máxima del tramo (5.101,20 €) tomaba la máxima:
  // 5.101,20 × 31,50 % = 1.606,88 €/mes, cuando la propia app dice «por defecto usamos la mínima».
  await calcular(page, '90000', '6000');

  expect(await fila(page, /^Rendimiento computable mensual/)).toBe('6510,00 €');
  expect(await fila(page, /^Tramo aplicable$/)).toBe('Tramo 15');
  expect(await fila(page, /^Base de cotización$/)).toBe('1928,10 €');
  expect(await fila(page, /^Cuota mensual \(sin bonificación\)$/)).toBe('607,35 €');
});

test('C0105 · el recuadro del tramo habla de rendimiento computable', async ({ page }) => {
  await calcular(page, '30000', '4500');
  const recuadro = page.locator('h4', { hasText: /Tu tramo: 8/ }).locator('xpath=..');
  await expect(recuadro).toContainText('Rendimiento computable mensual entre');
});
