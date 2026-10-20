import { test, expect, Page, APIRequestContext } from '@playwright/test';

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
async function comparar(page: Page, beneficio: string, gastos: string, regimen?: 'normal' | 'simplificada'): Promise<void> {
  if (regimen) await page.locator('#regimen').selectOption(regimen);
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
  // Rendimiento antes de SS = 60.000 − 10.000 = 50.000 €/año. El tramo lo decide el rendimiento
  // COMPUTABLE del art. 308.1.c LGSS: 50.000 × (1 − 7 %) / 12 = 3.875,00 €/mes (cabo C0105,
  // 18/10/2026; hasta entonces se buscaba con 4.166,67 €/mes y caía en el tramo 14, base
  // 1.732,03, RETA 6.547,07, IRPF 10.724,58, total 17.271,66 y neto 32.728,34).
  // 3.875,00 cae en el tramo 13 de TRAMOS_RETA_2025 (> 3.620 y ≤ 4.050 €/mes), base mínima
  // 1.601,31 €/mes:
  //   cuota RETA anual = 1.601,31 × 31,50 % × 12 = 6.052,9518 → 6.052,95 €
  // Base del IRPF = 50.000 − 6.052,9518 = 43.947,0482 €, CON el mínimo de 5.550 € dentro.
  //   escala(43.947,05) = 2.365,50 + 1.860,00 + 4.500,00 + 8.747,0482×37 %
  //                     = 8.725,50 + 3.236,4078 = 11.961,9078 €
  //   escala(5.550)     = 1.054,50 €
  //   cuota íntegra     = 10.907,4078 → 10.907,41 €
  // Total cargas del autónomo = 6.052,9518 + 10.907,4078 = 16.960,3596 → 16.960,36 €
  // Neto anual = 50.000 − 16.960,3596 = 33.039,6404 → 33.039,64 €
  //
  // El defecto del mínimo (12/09/2026) daba escala(43.947,05 − 5.550): el mínimo valorado al
  // 37 % marginal y no al 19 %, 999,00 € menos de IRPF.
  // Cuentas de la directa NORMAL: desde el 20/10/2026 (cabo C0294) la simplificada es la de por
  // defecto y resta además el 5 % de difícil justificación (casos C0294, al final).
  await comparar(page, '60000', '10000', 'normal');

  expect(await fila(page, 'IRPF estimado')).toBe('- 10.907,41 €');
  expect(await fila(page, 'Total cargas (SS + IRPF)')).toBe('16.960,36 €');
  expect(await fila(page, 'Neto anual estimado')).toBe('33.039,64 €');
});

// ─────────────────────────────────────────────────────────────────────────────
test('CASO 2 · 120.000 € de beneficio: el mínimo cae entero en el tramo del 45 %', async ({ page }) => {
  // Es donde el defecto valía su máximo: 5.550 × (45 − 19) % = 1.443,00 €/año.
  //
  // Rendimiento antes de SS = 120.000 − 10.000 = 110.000 €/año → computable 110.000 × 0,93 / 12
  // = 8.525,00 €/mes (art. 308.1.c LGSS; antes del 18/10/2026 se buscaba con 9.166,67: mismo tramo)
  // Tramo 15 de TRAMOS_RETA_2025 (desde 6.000 €/mes), base mínima 1.928,10 €/mes:
  //   cuota RETA anual = 1.928,10 × 31,50 % × 12 = 7.288,218 → 7.288,22 €
  // Base del IRPF = 110.000 − 7.288,218 = 102.711,782 €
  //   escala(102.711,78) = 17.901,50 (acumulado hasta 60.000) + 42.711,782×45 %
  //                      = 17.901,50 + 19.220,3019 = 37.121,8019 €
  //   escala(5.550)      = 1.054,50 €
  //   cuota íntegra      = 36.067,3019 → 36.067,30 €
  // Total cargas = 7.288,22 + 36.067,30 = 43.355,52 €
  // Neto anual = 110.000 − 43.355,52 = 66.644,48 €  (directa NORMAL, como el CASO 1)
  await comparar(page, '120000', '10000', 'normal');

  expect(await fila(page, 'IRPF estimado')).toBe('- 36.067,30 €');
  expect(await fila(page, 'Total cargas (SS + IRPF)')).toBe('43.355,52 €');
  expect(await fila(page, 'Neto anual estimado')).toBe('66.644,48 €');
});

// Cabo C0015 (09/10/2026): la fecha de verificación salía en ISO («2026-06-10»).
test('C0015 · la fecha de verificación de los datos sale en formato español', async ({ page }) => {
  const texto = await page.locator('body').innerText();
  expect(texto).toMatch(/Datos verificados: \d{2}\/\d{2}\/\d{4}/);
  expect(texto).not.toMatch(/verificad[oa]s?:? (a )?\d{4}-\d{2}-\d{2}/);
});

// Cabo C0339 (20/10/2026): el IS se daba como «23-25 %», con el 23 % plano de micropymes que la
// Ley 7/2024 sustituyó en 2025 por una escala. Cifras de la norma, no de data/fiscal: art. 29.1
// LIS (25 % general, 15 % nueva creación) y DT 44.ª.2.a) (19 % y 21 % en 2026 con cifra de
// negocios inferior a 1 millón), BOE-A-2014-12328 consolidado, consultado el 20/10/2026.
test('C0339 · los tipos del IS son los de 2026, no el «23-25 %»', async ({ page }) => {
  const texto = limpiar((await page.locator('body').textContent()) ?? '');
  expect(texto).not.toMatch(/23-25 ?%/);
  expect(texto).toContain('al 25 % general, o al 19-21 % en 2026 si la cifra de negocios es inferior a 1 M €');
  expect(texto).toContain('ahorro de hasta 10 puntos porcentuales frente al tipo general del 25 %');
});

// Cabo C0339 (20/10/2026): la cuota mínima del autónomo societario salía a mano con tres valores
// («~512 €/mes», «~515 €/mes», «~6.180 €» al año) de una base de 1.634,88 € sin fuente. Cifras de
// la norma: art. 308.1.a) regla 4.ª LGSS (base mínima del grupo 7 del Régimen General) y Orden
// PJC/297/2026, art. 3 (grupo 7: 1.424,40 €/mes), arts. 18.2 y 37.5-6 (28,30 + 1,30 + 0,90 MEI +
// 0,90 cese + 0,10 FP = 31,50 %):
//   1.424,40 × 31,50 % = 448,686 → 448,69 €/mes · × 12 = 5.384,28 €/año
//   escenario freelance: 7.500 + 4.605 + 5.384,28 = 17.489,28 · consultor: 7.500 + 5.500 + 5.384,28
//   = 18.384,28; ahorro bruto 19.973 − 18.384,28 = 1.588,72; sobrecoste 5.500 − 1.588,72 = 3.911,28
test('C0339 · la cuota del autónomo societario es la de la orden de cotización de 2026', async ({ page }) => {
  const texto = limpiar((await page.locator('body').textContent()) ?? '');
  expect(texto).not.toMatch(/51[25] €\/mes|6\.180 €|1\.634/);
  expect(texto).toContain('Autónomo societario obligatorio: ~449 €/mes');
  expect(texto).toContain('~449 €/mes (autónomo societario obligatorio)');
  expect(texto).toContain('La cotización mínima es ~449 €/mes (2026)');
  expect(texto).toContain('mínimo 1424,40 €/mes en 2026');
  expect(texto).toContain('autónomo societario ~5384 €)');
  expect(texto).toContain('~17.489 € en cargas');
  expect(texto).toContain('= ~18.384 €. El ahorro bruto es de solo ~1589 €');
  expect(texto).toContain('sobrecoste neto de ~3911 €/año');

  // Y el cálculo: la fila de la SL resta la cuota anual entera
  await comparar(page, '60000', '10000');
  expect(await fila(page, 'Autónomo societario (SS)')).toBe('- 5384,28 €');
});

// Cabo C0294 (20/10/2026): la app suponía siempre la directa NORMAL. Pregunta el régimen, con la
// simplificada por defecto, que resta un 5 % de difícil justificación (art. 30, regla 2.ª, RIRPF,
// tope 2.000 €/año, BOE-A-2007-6820 consultado el 20/10/2026) sobre el neto ya descontada la
// cuota, en el tramo del RETA (el art. 308.1.c LGSS no lo devuelve) y en la base del IRPF.
test('C0294 · 30.000 y 4.500 en simplificada (por defecto): mismo tramo, 5 % menos en la base del IRPF', async ({ page }) => {
  // Tramo 8 (general, tramo 5): cuota 1.209,15 × 31,50 % × 12 = 4.570,587. Computable
  // (25.500 − 5 % de 20.929,413) × 0,93 / 12 = 1.895,15 → sigue en el tramo 8.
  // 5 % = 1.046,47065 → rendimiento neto 25.500 − 4.570,587 − 1.046,47065 = 19.882,94235
  //   escala(19.882,94) = 2.365,50 + 7.432,94235 × 24 % = 2.365,50 + 1.783,90616 = 4.149,40616
  //   cuota = 4.149,40616 − 1.054,50 = 3.094,90616 → 3.094,91 €
  // Total = 4.570,587 + 3.094,90616 = 7.665,49316 → 7.665,49 · neto 25.500 − 7.665,49316 = 17.834,51
  // En la normal: base 20.929,413 → escala = 2.365,50 + 7.750 × 24 % (1.860,00) + 729,413 × 30 %
  // (218,8239) = 4.444,3239 → cuota 3.389,8239 → 3.389,82 €; total 4.570,587 + 3.389,8239 = 7.960,41.
  await expect(page.locator('#regimen')).toHaveValue('simplificada');
  await expect(page.getByRole('combobox', { name: /Régimen del autónomo en el IRPF/ })).toBeVisible();
  await comparar(page, '30000', '4500');

  expect(await fila(page, 'Cuota RETA (SS), general, tramo 5')).toBe('- 4570,59 €');
  expect(await fila(page, 'Gastos de difícil justificación')).toBe('- 1046,47 €');
  expect(await fila(page, 'Rendimiento neto')).toBe('19.882,94 €');
  expect(await fila(page, 'IRPF estimado')).toBe('- 3094,91 €');
  expect(await fila(page, 'Total cargas (SS + IRPF)')).toBe('7665,49 €');
  expect(await fila(page, 'Neto anual estimado')).toBe('17.834,51 €');
  const texto = limpiar((await page.locator('body').textContent()) ?? '');
  expect(texto).toContain('Régimen supuesto: estimación directa simplificada (resta un 5 % de gastos de difícil justificación, máximo 2000,00 € al año)');

  await comparar(page, '30000', '4500', 'normal');
  expect(await fila(page, 'IRPF estimado')).toBe('- 3389,82 €');
  expect(await fila(page, 'Total cargas (SS + IRPF)')).toBe('7960,41 €');
  expect(await page.getByText('Gastos de difícil justificación', { exact: true }).count()).toBe(0);
  expect(limpiar((await page.locator('body').textContent()) ?? '')).toContain('Régimen supuesto: estimación directa normal');
});

test('C0294 · frontera: 24.516,13 € sin gastos cotiza en simplificada un tramo menos que en normal', async ({ page }) => {
  // Normal: 24.516,13 × 0,93 / 12 = 1.900,00 → tramo 8 (general, tramo 5), 4.570,587 → 4.570,59 €.
  // Simplificada: con la cuota del 8, 1.822,71 → tramo 7; con la del 7 (1.143,79 × 31,50 % × 12 =
  // 4.323,5262), 5 % de 20.192,6038 = 1.009,63 → (24.516,13 − 1.009,63) × 0,0775 = 1.821,75 → tramo
  // 7 (general, tramo 4), estable: 4.323,53 €.
  await comparar(page, '24516,13', '0', 'normal');
  expect(await fila(page, 'Cuota RETA (SS), general, tramo 5')).toBe('- 4570,59 €');
  await comparar(page, '24516,13', '0', 'simplificada');
  expect(await fila(page, 'Cuota RETA (SS), general, tramo 4')).toBe('- 4323,53 €');
});

/** Llama a una herramienta del MCP de Delegum y devuelve el texto de la respuesta, normalizado. */
async function porMcp(request: APIRequestContext, herramienta: string, argumentos: Record<string, unknown>): Promise<string> {
  const respuesta = await request.post('/api/mcp/delegum/', {
    headers: { Accept: 'application/json, text/event-stream' },
    data: { jsonrpc: '2.0', id: 1, method: 'tools/call', params: { name: herramienta, arguments: argumentos } },
  });
  expect(respuesta.ok()).toBeTruthy();
  return limpiar((await respuesta.json()).result.content[0].text);
}

// El motor del MCP (lib/calculadoras/autonomoVsSL.ts) redondea la cuota y el 5 % a céntimos antes
// de sumar, y la app no: el neto puede diferir en un céntimo. 30.000 y 4.500, tramo 8:
//   simplificada: base 25.500 − 4.570,59 − 1.046,47 = 19.882,94 → IRPF 4.149,4056 − 1.054,50 =
//   3.094,91 → total 7.665,50 → neto 17.834,50 · normal: base 20.929,41 → IRPF 2.365,50 + 1.860,00
//   + 218,823 − 1.054,50 = 3.389,82 → total 7.960,41 → neto 17.539,59
test('C0294 · MCP comparar_autonomo_vs_sl: régimen opcional, simplificada por defecto', async ({ request }) => {
  const args = { beneficio_anual: 30000, gastos_deducibles: 4500 };
  const porDefecto = await porMcp(request, 'comparar_autonomo_vs_sl', args);
  expect(porDefecto).toContain('neto 17.834,50 €');
  expect(porDefecto).toContain('RETA tramo 8');
  expect(porDefecto).toContain('Régimen supuesto: estimación directa simplificada');

  const normal = await porMcp(request, 'comparar_autonomo_vs_sl', { ...args, regimen: 'normal' });
  expect(normal).toContain('neto 17.539,59 €');
  expect(normal).toContain('Régimen supuesto: estimación directa normal');
});

// consulta_autonomo resta el 5 % sobre el neto menos la cuota que de verdad se paga (380,88 × 12 =
// 4.570,56): 5 % de 20.929,44 = 1.046,472 → 1.046,47 €.
test('C0294 · MCP consulta_autonomo: régimen opcional, simplificada por defecto', async ({ request }) => {
  const args = { facturacion_anual: 30000, gastos_anuales: 4500 };
  const porDefecto = await porMcp(request, 'consulta_autonomo', args);
  expect(porDefecto).toContain('Cuota mensual: **380,88 €/mes**');
  expect(porDefecto).toContain('tramo 8');
  expect(porDefecto).toContain('Régimen supuesto: estimación directa simplificada');
  expect(porDefecto).toContain('Gastos de difícil justificación: −1046,47 € en la base');

  const normal = await porMcp(request, 'consulta_autonomo', { ...args, regimen: 'normal' });
  expect(normal).toContain('Régimen supuesto: estimación directa normal');
  expect(normal).not.toContain('difícil justificación');
});
