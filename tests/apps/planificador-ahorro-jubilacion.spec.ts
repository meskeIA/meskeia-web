import { test, expect, Page } from '@playwright/test';
import { esperarHidratacion, esperarValorEnReact } from './_hidratacion';

/**
 * planificador-ahorro-jubilacion — spec nacido en /reparar el 13/11/2026 (cabo C0019).
 *
 * Qué se comprueba
 * ────────────────
 *   1. Los importes con punto de millar, que es como los enseñan los propios ejemplos del
 *      formulario («Ej: 2.200», «Ej: 1.400», «Ej: 35.000»), se leen enteros. Con el parseo
 *      casero de antes (cambiar la coma por punto), «2.200» valía 2,2 y «1.400» 1,4: la brecha
 *      salía de 80 céntimos, sin aviso.
 *   2. El tipo marginal del bloque «¿Cuánto me ahorro con un plan de pensiones?» sale del
 *      SUELDO BRUTO. El campo se rotulaba «Base imponible IRPF anual» mientras su ayuda decía
 *      «salario bruto» y la función restaba la SS, los 2.000 € y la reducción del art. 20: quien
 *      tecleaba su base imponible recibía el tipo de una base más baja.
 *
 * CASOS (resueltos a mano; datos de data/fiscal/irpf.ts: SS del trabajador 2026 = 4,70 + 1,55
 * + 0,10 + 0,15 = 6,50 %, otros gastos 2.000 €, reducción del art. 20 nula por encima de
 * 19.747,5 €, escala 19/24/30/37/45/47 con cortes en 12.450, 20.200, 35.200 y 60.000 €)
 *
 *   CASO 1 — sueldo neto 2.200, pensión 1.400, edad 40, jubilación 67, 20 años, 4 %:
 *     brecha mensual 2.200 − 1.400 = 800,00 €.
 *   CASO 2 — bruto 35.000 €, aportación 125 €/mes (1.500 €/año, el tope deducible):
 *     35.000 × (1 − 0,065) = 32.725 (previo, > 19.747,5 → sin reducción) − 2.000 = 30.725 €
 *     → tramo del 30 % · ahorro 1.500 × 30 % = 450,00 €.
 *     Antes, «35.000» valía 35 → tramo del 19 % → 285,00 €.
 */

const RUTA = '/planificador-ahorro-jubilacion/';

async function poner(page: Page, rotulo: string, valor: string): Promise<void> {
  const c = page.getByLabel(rotulo, { exact: true });
  await c.fill(valor);
  await esperarValorEnReact(page, c, valor);
  await c.press('Tab');
}

async function planificar(page: Page): Promise<void> {
  await poner(page, 'Sueldo neto mensual actual (€)', '2.200');
  await poner(page, 'Pensión estimada mensual (€)', '1.400');
  await poner(page, 'Edad actual', '40');
  await page.getByRole('button', { name: 'Calcular plan de ahorro' }).click();
}

test.describe('planificador-ahorro-jubilacion · cabo C0019', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, ['input']);
  });

  test('CASO 1 · «2.200» y «1.400» se leen enteros → brecha 800,00 €', async ({ page }) => {
    await planificar(page);
    const brecha = page.getByText('Brecha mensual', { exact: true }).locator('xpath=..');
    await expect(brecha).toContainText('800,00');
    await expect(brecha).not.toContainText('0,80');
  });

  test('CASO 2 · bruto «35.000» → tipo marginal 30 % y ahorro 450,00 €', async ({ page }) => {
    await planificar(page);
    await page.getByRole('button', { name: /¿Cuánto me ahorro con un plan de pensiones\?/ }).click();
    await expect(page.getByLabel('Salario bruto anual (€)', { exact: true })).toBeVisible();
    await expect(page.getByLabel('Base imponible IRPF anual (€)')).toHaveCount(0);

    await poner(page, 'Salario bruto anual (€)', '35.000');
    const aportacion = page.getByLabel(/^Aportación mensual al plan/);
    await aportacion.fill('125');
    await esperarValorEnReact(page, aportacion, '125');
    await page.getByRole('button', { name: 'Calcular ventaja fiscal' }).click();

    const tipo = page.getByText('Tu tipo marginal IRPF', { exact: true }).locator('xpath=..');
    await expect(tipo).toContainText('30');
    const ahorro = page
      .getByText('Ahorro fiscal anual (desgravación IRPF)', { exact: true })
      .locator('xpath=..');
    await expect(ahorro).toContainText('450,00');
  });
});
