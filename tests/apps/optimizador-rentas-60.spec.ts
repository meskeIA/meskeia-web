import { test, expect, Page } from '@playwright/test';

/**
 * optimizador-rentas-60 — regresión del mínimo personal (art. 63.1.2.º LIRPF)
 * Escrita el 12/09/2026, tras reparar el defecto.
 *
 * QUÉ DEFECTO VIGILA
 * ──────────────────
 * Esta app hacía las dos cosas a medias, que es lo que la hacía difícil de ver: restaba el
 * mínimo de la base —`baseGeneralLiquidable = baseGeneralBruta − minimoPersonal`— Y calculaba
 * aparte `cuotaMinimo = escala(minimoPersonal)`, con el comentario «el mínimo personal reduce
 * la cuota»… pero nunca la restaba. La variable quedaba muerta, se devolvía al componente sin
 * que nada la pintara, y la cuota salía por el método malo. Alguien empezó la reparación y no
 * la terminó; el resultado tenía todo el aspecto de estar bien.
 *
 * El art. 63.1.2.º dice que el mínimo no reduce la renta: se grava a TIPO CERO aplicando la
 * escala a la base completa y restando de la cuota la misma escala aplicada al mínimo. Con
 * 45.000 € de base y 67 años el error era de 1.206 €/año, y de 1.458 € pasados los 75, porque
 * el mínimo por edad es mayor y era ese mínimo entero lo que se valoraba al marginal.
 *
 * Norma verificada en sesión el 12/09/2026 contra la AEAT (manual de ayuda de Renta 2025,
 * «8.4.3.1 Cuota íntegra estatal»).
 *
 * DE DÓNDE SALE CADA CIFRA — de la norma, NO de lo que devuelve la app
 * ───────────────────────────────────────────────────────────────────
 *   · escala art. 63: 12.450 @19 % · 20.200 @24 % · 35.200 @30 % · 60.000 @37 % …
 *   · mínimo del contribuyente, art. 57: 5.550 € · 6.700 € desde 65 · 8.100 € desde 75
 *   · gastos art. 19.2.f: 2.000 € · reducción art. 20: cero por encima de 19.747,5 € de RNT
 */

const RUTA = '/optimizador-rentas-60/';

const ESPACIO_DURO = new RegExp(String.fromCharCode(160), 'g');
const limpiar = (s: string) => s.replace(ESPACIO_DURO, ' ').replace(/\s+/g, ' ').trim();

/** Importe de una fila del desglose, localizada por el principio de su etiqueta. */
async function fila(page: Page, etiqueta: string): Promise<string> {
  const f = page.locator('css=div').filter({ hasText: new RegExp(`^${etiqueta}`) }).last();
  return limpiar(await f.locator('span, strong').nth(1).innerText());
}

/** La app recalcula sola con `useMemo`: basta con rellenar los campos. */
async function rellenar(page: Page, pension: string, edad: string): Promise<void> {
  await page.getByLabel('Pensión pública SS (€/año brutos)').fill(pension);
  await page.getByLabel('Retirada del plan de pensiones (€/año)').fill('0');
  await page.getByLabel('Intereses, dividendos y plusvalías de fondos (€/año)').fill('0');
  await page.getByLabel('Renta de alquiler bruta (€/año)').fill('0');
  await page.locator('select').first().selectOption(edad);
}

test.beforeEach(async ({ page }) => {
  await page.goto(RUTA);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Optimizador de Rentas 60+');
});

// ─────────────────────────────────────────────────────────────────────────────
test('CASO 1 · pensión de 30.000 €/año a los 67: el mínimo de 6.700 € a tipo cero', async ({ page }) => {
  // Rendimientos del trabajo = 30.000 € (pensión) → gastos art. 19 = 2.000 €
  // RNT = 28.000 € → reducción art. 20 = 0 € (supera los 19.747,5 € en que se agota)
  // Base general liquidable = 28.000,00 €, CON el mínimo de 6.700 € dentro.
  //   escala(28.000) = 12.450×19 % + 7.750×24 % + 7.800×30 %
  //                  = 2.365,50 + 1.860,00 + 2.340,00 = 6.565,50 €
  //   escala(6.700)  = 6.700×19 %                      = 1.273,00 €
  //   cuota general  = 6.565,50 − 1.273,00             = 5.292,50 €
  //
  // El método defectuoso daba escala(28.000 − 6.700) = escala(21.300) = 4.555,50 €:
  // 737,00 € menos. Y la app tenía calculada la resta correcta en una variable que no usaba.
  await rellenar(page, '30000', '67');

  expect(await fila(page, 'Base general liquidable')).toBe('28.000,00 €');
  expect(await fila(page, 'Escala sobre la base general completa')).toBe('6565,50 €');
  expect(await fila(page, '− Escala sobre el mínimo personal')).toBe('−1273,00 €');
  expect(await fila(page, 'Cuota base general')).toBe('5292,50 €');
  expect(await fila(page, 'IRPF total estimado')).toBe('5292,50 €');
});

// ─────────────────────────────────────────────────────────────────────────────
test('CASO 2 · el mínimo ya no se resta de la base, y la pantalla lo dice así', async ({ page }) => {
  // Invariante de presentación: la base general liquidable ES el rendimiento neto, sin
  // descontar el mínimo, y el mínimo aparece como lo que es —una parte de esa base que
  // tributa a cero—, no como una resta. Si volviera a verse «− Mínimo personal» seguido de
  // una base menor, el defecto habría vuelto.
  await rellenar(page, '30000', '67');

  await expect(page.getByText(/Mínimo personal \(edad 67\+\), dentro de esa base/)).toBeVisible();
  await expect(page.getByText('− Escala sobre el mínimo personal (tipo cero, art. 63.1.2.º)')).toBeVisible();
});

// ─────────────────────────────────────────────────────────────────────────────
test('CASO 3 · a los 75+ el mínimo sube a 8.100 € y vale 1.400 × 19 % más', async ({ page }) => {
  // Misma pensión, otro tramo de edad. La diferencia entre 8.100 € y 6.700 € son 1.400 €, que
  // bajo el art. 63.1.2.º se valoran al tipo del tramo donde cae el mínimo —el primero, 19 %—
  // y no al marginal del pensionista, que aquí está en el 30 %.
  //   escala(8.100) = 8.100×19 % = 1.539,00 €
  //   cuota general = 6.565,50 − 1.539,00 = 5.026,50 €
  //   diferencia con el caso 1 = 5.292,50 − 5.026,50 = 266,00 € = 1.400 × 19 %
  // Con el método defectuoso la diferencia habría sido 1.400 × 30 % = 420,00 €.
  await rellenar(page, '30000', '75');

  expect(await fila(page, 'Base general liquidable')).toBe('28.000,00 €');
  expect(await fila(page, '− Escala sobre el mínimo personal')).toBe('−1539,00 €');
  expect(await fila(page, 'Cuota base general')).toBe('5026,50 €');
});
