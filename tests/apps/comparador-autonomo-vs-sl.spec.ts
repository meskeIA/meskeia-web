import { test, expect, Page } from '@playwright/test';

/**
 * comparador-autonomo-vs-sl — regresión del mínimo personal (art. 63.1.2.º LIRPF)
 * Escrita el 12/09/2026, tras reparar el defecto.
 *
 * QUÉ DEFECTO VIGILA
 * ──────────────────
 * La app calculaba `baseLiquidable = rendimientoNeto − MINIMOS_IRPF_2025.personal` y aplicaba
 * la escala a ese resto, lo que valora el mínimo al tipo marginal. El art. 63.1.2.º dice que el
 * mínimo no reduce la renta: se grava a TIPO CERO aplicando la escala a la base completa y
 * restando de la cuota la misma escala aplicada al mínimo. Subestimaba el IRPF del autónomo en
 * 565,50 €/año con 25.000 € de rendimiento neto y en 1.443 € desde 70.000 €.
 *
 * Aquí el defecto no solo daba una cifra baja: SESGABA LA COMPARACIÓN. La app existe para
 * decidir entre seguir de autónomo o constituir una SL, y el error caía entero del lado del
 * autónomo —la rama de la SL tributa por IS, sin mínimo— así que hacía parecer al autónomo más
 * barato de lo que es, justo en el rango de beneficio donde la decisión está reñida.
 *
 * Norma verificada en sesión el 12/09/2026 contra la AEAT (manual de ayuda de Renta 2025,
 * «8.4.3.1 Cuota íntegra estatal»).
 *
 * DE DÓNDE SALE CADA CIFRA — de la norma y de `data/fiscal`, NO de lo que devuelve la app
 * ───────────────────────────────────────────────────────────────────────────────────────
 *   · escala art. 63: 12.450 @19 % · 20.200 @24 % · 35.200 @30 % · 60.000 @37 % · 300.000 @45 %
 *   · mínimo del contribuyente, art. 57: 5.550 €
 *   · TRAMOS_RETA_2025 + TIPO_COTIZACION_RETA (31,50 %) — cuota RETA del autónomo
 */

const RUTA = '/comparador-autonomo-vs-sl/';

const ESPACIO_DURO = new RegExp(String.fromCharCode(160), 'g');
const limpiar = (s: string) => s.replace(ESPACIO_DURO, ' ').replace(/\s+/g, ' ').trim();

/** Importe de una fila del desglose, localizada por su etiqueta exacta. */
async function fila(page: Page, etiqueta: string): Promise<string> {
  const f = page.locator(`css=div:has(> span:text-is("${etiqueta}"))`).first();
  return limpiar(await f.locator('span').nth(1).innerText());
}

/**
 * Rellena los dos importes y pulsa «Comparar».
 *
 * ⚠️ Los campos nacen VACÍOS: el «60000» y el «10000» que se ven en pantalla son placeholders,
 * no valores. Sin rellenarlos, el beneficio es 0 y la app ni siquiera calcula; y rellenar solo
 * el beneficio deja los gastos en 0, que da otra base y otra cuota. Los dos, siempre.
 */
async function comparar(page: Page, beneficio: string, gastos: string): Promise<void> {
  await page.getByLabel('Beneficio bruto anual previsto').fill(beneficio);
  await page.getByLabel('Gastos deducibles anuales').fill(gastos);
  await page.getByRole('button', { name: 'Comparar', exact: true }).click();
  await expect(page.getByText('Total cargas (SS + IRPF)').first()).toBeVisible();
}

test.beforeEach(async ({ page }) => {
  await page.goto(RUTA);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Comparador Autónomo vs SL 2025');
});

// ─────────────────────────────────────────────────────────────────────────────
test('CASO 1 · 60.000 € de beneficio y 10.000 € de gastos', async ({ page }) => {
  // Rendimiento antes de SS = 60.000 − 10.000 = 50.000 €/año → 4.166,67 €/mes
  // Ese rendimiento cae en el tramo 14 de TRAMOS_RETA_2025 (4.050-6.000 €/mes), cuya base
  // mínima es 1.732,03 €/mes:
  //   cuota RETA anual = 1.732,03 × 31,50 % × 12 = 6.547,0734 → 6.547,07 €
  // Base del IRPF = 50.000 − 6.547,0734 = 43.452,9266 €, CON el mínimo de 5.550 € dentro.
  //   escala(43.452,93) = 2.365,50 + 1.860,00 + 4.500,00 + 8.252,9266×37 %
  //                     = 8.725,50 + 3.053,5828 = 11.779,0828 €
  //   escala(5.550)     = 1.054,50 €
  //   cuota íntegra     = 10.724,5828 → 10.724,58 €
  // Total cargas del autónomo = 6.547,07 + 10.724,58 = 17.271,66 €
  // Neto anual = 50.000 − 17.271,66 = 32.728,34 €
  //
  // El método defectuoso daba escala(43.452,93 − 5.550) = escala(37.902,93) = 9.725,58 €:
  // 999,00 € menos de IRPF, y por tanto 999,00 € de más en el neto del autónomo.
  await comparar(page, '60000', '10000');

  expect(await fila(page, 'IRPF estimado')).toBe('- 10.724,58 €');
  expect(await fila(page, 'Total cargas (SS + IRPF)')).toBe('17.271,66 €');
  expect(await fila(page, 'Neto anual estimado')).toBe('32.728,34 €');
});

// ─────────────────────────────────────────────────────────────────────────────
test('CASO 2 · 120.000 € de beneficio: el mínimo cae entero en el tramo del 45 %', async ({ page }) => {
  // Es donde el defecto valía su máximo: 5.550 × (45 − 19) % = 1.443,00 €/año.
  //
  // Rendimiento antes de SS = 120.000 − 10.000 = 110.000 €/año → 9.166,67 €/mes
  // Tramo 15 de TRAMOS_RETA_2025 (desde 6.000 €/mes), base mínima 1.928,10 €/mes:
  //   cuota RETA anual = 1.928,10 × 31,50 % × 12 = 7.288,218 → 7.288,22 €
  // Base del IRPF = 110.000 − 7.288,218 = 102.711,782 €
  //   escala(102.711,78) = 17.901,50 (acumulado hasta 60.000) + 42.711,782×45 %
  //                      = 17.901,50 + 19.220,3019 = 37.121,8019 €
  //   escala(5.550)      = 1.054,50 €
  //   cuota íntegra      = 36.067,3019 → 36.067,30 €
  // Total cargas = 7.288,22 + 36.067,30 = 43.355,52 €
  // Neto anual = 110.000 − 43.355,52 = 66.644,48 €
  await comparar(page, '120000', '10000');

  expect(await fila(page, 'IRPF estimado')).toBe('- 36.067,30 €');
  expect(await fila(page, 'Total cargas (SS + IRPF)')).toBe('43.355,52 €');
  expect(await fila(page, 'Neto anual estimado')).toBe('66.644,48 €');
});
