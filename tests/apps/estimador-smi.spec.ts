import { test, expect, Page } from '@playwright/test';

/**
 * estimador-smi — candado del método del art. 63.1.2.º LIRPF
 * Escrita el 12/09/2026, tras reparar el defecto.
 *
 * QUÉ DEFECTO TENÍA, Y POR QUÉ NUNCA SE VIO
 * ─────────────────────────────────────────
 * La app calculaba `baseLiquidable = baseImponible − MINIMOS_IRPF_2025.personal` y aplicaba la
 * escala a ese resto: el defecto del art. 63.1.2.º, el mismo de las otras seis apps reparadas
 * el 12/09/2026. Pero aquí **la cifra publicada nunca llegó a estar mal**, y conviene dejar
 * escrito por qué, porque es lo que distingue un defecto latente de uno que cobra:
 *
 *   1. Con el SMI, la base imponible (6.680,89 €) y el mínimo (5.550 €) caen los DOS dentro
 *      del primer tramo. Ahí escala(B) − escala(m) y escala(B − m) valen exactamente lo
 *      mismo: (B − m) × 19 %. Los dos métodos solo divergen cuando la base cruza de tramo.
 *   2. Y aunque divergieran, la deducción del art. 80 bis (340 € para rentas bajas) supera la
 *      cuota resultante, así que el IRPF sale 0 € por cualquiera de los dos caminos.
 *
 * La app solo calcula sobre el SMI, así que el defecto no tenía forma de aflorar. Se reparó
 * igual —la fórmula ya no vive aquí, la pone `calcularCuotaIntegraGeneral`— porque el día que
 * alguien le añada un campo de sueldo libre habría empezado a cobrar sin que nada avisara.
 *
 * DE DÓNDE SALE CADA CIFRA — de la norma y de `data/fiscal`, NO de lo que devuelve la app
 * ───────────────────────────────────────────────────────────────────────────────────────
 *   · SMI_2026.anual = 17.094 € (14 pagas de 1.221 €)
 *   · cotización trabajador 2026: 6,50 %, sobre base mensual acotada entre 1.424,40 y 5.101,20
 *   · gastos art. 19.2.f: 2.000 € · reducción art. 20: 7.302 € para RNT ≤ 14.852 €
 *   · mínimo del contribuyente, art. 57: 5.550 € · escala art. 63: 12.450 @19 %…
 *   · deducción art. 80 bis: 340 € completos para RNT ≤ 14.852 €
 */

const RUTA = '/estimador-smi/';

const ESPACIO_DURO = new RegExp(String.fromCharCode(160), 'g');
const limpiar = (s: string) => s.replace(ESPACIO_DURO, ' ').replace(/\s+/g, ' ').trim();

/** Importe de una fila del desglose anual, localizada por su etiqueta exacta. */
async function fila(page: Page, etiqueta: string): Promise<string> {
  const f = page.locator(`css=div:has(> span:text-is("${etiqueta}"))`).first();
  return limpiar(await f.locator('span').nth(1).innerText());
}

test.beforeEach(async ({ page }) => {
  await page.goto(RUTA);
  await expect(page.getByRole('heading', { level: 3, name: 'Neto anual', exact: true })).toBeVisible();
});

// ─────────────────────────────────────────────────────────────────────────────
test('el neto del SMI 2026 sale de la cadena completa, mínimo incluido', async ({ page }) => {
  // Bruto anual = 17.094,00 €
  // Base de cotización mensual = 17.094 / 12 = 1.424,50 €, justo por encima de la mínima
  //   (1.424,40 €), así que no se acota → SS anual = 1.424,50 × 6,50 % × 12 = 1.111,11 €
  // RNT = 17.094 − 1.111,11 − 2.000 = 13.982,89 € → reducción art. 20 = 7.302,00 € (RNT ≤ 14.852)
  // Base liquidable general = 13.982,89 − 7.302 = 6.680,89 €, CON el mínimo de 5.550 € dentro.
  //   escala(6.680,89) = 6.680,89 × 19 % = 1.269,3691 €
  //   escala(5.550)    = 1.054,50 €
  //   cuota íntegra    = 214,8691 €      ← los dos métodos coinciden: ambos en el primer tramo
  // Deducción art. 80 bis = 340,00 € (RNT ≤ 14.852) > cuota → IRPF = 0,00 €
  // Neto anual = 17.094 − 1.111,11 − 0 = 15.982,89 € → 1.141,64 €/mes en 14 pagas
  expect(await fila(page, 'Salario bruto anual')).toBe('17.094,00 €');
  expect(await fila(page, 'Seguridad Social (trabajador)')).toBe('-1111,11 €');
  expect(await fila(page, 'IRPF')).toBe('-0,00 €');
  expect(await fila(page, 'Deducción rentas bajas (art. 80 bis)')).toBe('+340,00 €');

  const neto = page.locator('css=div:has(> span > strong:text-is("Salario neto anual"))').first();
  expect(limpiar(await neto.locator('span').nth(1).innerText())).toBe('15.982,89 €');
});

// ─────────────────────────────────────────────────────────────────────────────
test('en 12 pagas el neto anual no cambia, solo el reparto mensual', async ({ page }) => {
  // Invariante estructural: el número de pagas reparte el mismo neto anual, no lo altera.
  // 15.982,89 / 14 = 1.141,635… → 1.141,64 €/mes · 15.982,89 / 12 = 1.331,9075 → 1.331,91 €/mes
  const netoMensual = async () => {
    const h3 = page.getByRole('heading', { level: 3, name: 'Neto mensual', exact: true });
    return limpiar(await h3.locator('xpath=../following-sibling::div[1]//p').innerText());
  };

  expect(await netoMensual()).toBe('1141,64€');

  await page.locator('#pagas').selectOption('12');
  expect(await netoMensual()).toBe('1331,91€');

  const neto = page.locator('css=div:has(> span > strong:text-is("Salario neto anual"))').first();
  expect(limpiar(await neto.locator('span').nth(1).innerText())).toBe('15.982,89 €');
});
