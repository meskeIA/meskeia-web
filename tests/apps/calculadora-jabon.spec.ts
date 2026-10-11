import { test, expect, Page } from '@playwright/test';
import { esperarHidratacion, esperarValorEnReact } from './_hidratacion';

/**
 * Calculadora de Jabón Casero (calculadora-jabon) — creación del 11/10/2026 (semilla S0196)
 *
 * QUÉ TIENE DE ESTADO
 *   Tabla de aceites editable (añadir, quitar, cambiar aceite), cuatro recetas de ejemplo que
 *   reescriben todo, el conmutador sosa/potasa (que además cambia la pureza por defecto), el de
 *   agua por concentración o proporción, y «Escalar receta». Resultado en vivo. El motor
 *   (motor.ts) se probó aparte con 39 casos a mano; aquí se verifican las TRANSICIONES.
 *
 * VALORES ESPERADOS (resueltos a mano; índices de SoapCalc: oliva 0,135/0,190 · coco 0,183/0,257)
 *   Oliva 700 + coco 300, NaOH 100 %, sobreengrase 5 %, lejía al 33 %:
 *     NaOH = (94,5 + 54,9)·0,95 = 141,93 → «141,9 g» · agua = 141,93·67/33 = 288,16 → «288,2 g»
 *   La misma con potasa (pureza pasa a 90 %): (133 + 77,1)·0,95/0,9 = 221,77 → «221,8 g»
 *   Ejemplo potásico (KOH 90 %, sobreengrase 3 %, agua 3:1): 210,1·0,97/0,9 = 226,44 → «226,4 g»,
 *     agua 679,32 → «679,3 g»
 *   Escalada a 500 g: 350 + 150 → NaOH 70,965 → «71,0 g»
 *   Solo 700 g de oliva: 94,5·0,95 = 89,775 → «89,8 g»
 */

const GRAMOS = (n: number) => `input[aria-label="Gramos de la fila ${n}"]`;

async function cifra(page: Page, etiqueta: string): Promise<string> {
  return (await page.locator(`span:text-is("${etiqueta}")`).locator('xpath=following-sibling::span[1]').textContent()) ?? '';
}

test.describe('Calculadora de Jabón Casero', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/calculadora-jabon/');
    await esperarHidratacion(page, [GRAMOS(1)]);
  });

  test('estado inicial: oliva y coco 70/30 con sosa', async ({ page }) => {
    expect(await cifra(page, 'Sosa cáustica (NaOH) a pesar')).toContain('141,9');
    expect(await cifra(page, 'Agua')).toContain('288,2');
    await expect(page.getByText('70,0', { exact: false }).first()).toBeVisible();
    // Dureza 35,6 → «36» en rango 29-54
    await expect(page.locator('li', { hasText: 'Dureza' }).first()).toContainText('36');
    await expect(page.locator('li', { hasText: 'Dureza' }).first()).toContainText('en rango');
  });

  test('pasar a potasa cambia la pureza a 90 % y avisa del sobreengrase', async ({ page }) => {
    await page.getByRole('button', { name: /potasa \(KOH\)/ }).click();
    await expect(page.getByRole('button', { name: /potasa \(KOH\)/ })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByLabel('Pureza de la potasa')).toHaveValue('90');
    expect(await cifra(page, 'Potasa (KOH) a pesar')).toContain('221,8');
    await expect(page.getByText('se suele usar un sobreengrase de 0 a 3 %')).toBeVisible();
  });

  test('la receta de jabón potásico usa proporción 3:1', async ({ page }) => {
    await page.getByRole('button', { name: 'Jabón potásico (líquido)' }).click();
    await expect(page.getByRole('button', { name: 'Proporción', exact: true })).toHaveAttribute('aria-pressed', 'true');
    expect(await cifra(page, 'Potasa (KOH) a pesar')).toContain('226,4');
    expect(await cifra(page, 'Agua')).toContain('679,3');
    await expect(page.getByText('se suele usar un sobreengrase de 0 a 3 %')).toHaveCount(0);
  });

  test('escalar a 500 g mantiene los porcentajes', async ({ page }) => {
    const objetivo = page.getByLabel('Total de aceites al que escalar la receta, en gramos');
    await objetivo.fill('500');
    await esperarValorEnReact(page, objetivo, '500');
    await page.getByRole('button', { name: 'Escalar receta' }).click();
    await expect(page.locator(GRAMOS(1))).toHaveValue('350');
    await expect(page.locator(GRAMOS(2))).toHaveValue('150');
    expect(await cifra(page, 'Sosa cáustica (NaOH) a pesar')).toContain('71,0');
  });

  test('añadir un aceite vacío no cambia nada; quitar el coco recalcula', async ({ page }) => {
    await page.getByRole('button', { name: '+ Añadir aceite' }).click();
    await expect(page.locator(GRAMOS(3))).toHaveValue('');
    expect(await cifra(page, 'Sosa cáustica (NaOH) a pesar')).toContain('141,9');
    await page.getByRole('button', { name: 'Quitar la fila 2' }).click();
    expect(await cifra(page, 'Sosa cáustica (NaOH) a pesar')).toContain('89,8');
  });

  test('una pureza imposible avisa y no da receta', async ({ page }) => {
    const pureza = page.getByLabel('Pureza de la sosa');
    await pureza.fill('0');
    await esperarValorEnReact(page, pureza, '0');
    await expect(page.getByRole('alert').filter({ hasText: 'pureza' })).toBeVisible();
    await expect(page.locator('span', { hasText: 'a pesar' })).toHaveCount(0);
  });
});
