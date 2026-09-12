import { test, expect, Page } from '@playwright/test';

/**
 * estimador-irpf — regresión de DOS defectos distintos que estaban mezclados
 * Escrita el 12/09/2026, tras repararlos.
 *
 * DEFECTO 1 — el mínimo restado de la base (art. 63.1.2.º LIRPF)
 * ──────────────────────────────────────────────────────────────
 * La app calculaba `baseLiquidable = baseImponibleGeneral − minimos` y aplicaba la escala a
 * ese resto, lo que valora el mínimo al tipo marginal. El art. 63.1.2.º dice que el mínimo no
 * reduce la renta: se grava a TIPO CERO aplicando la escala a la base completa y restando de
 * la cuota la misma escala aplicada al mínimo. Como esta app admite mínimos familiares, el
 * error era el mayor del catálogo: 1.507,50 €/año con 40.000 € de base y dos hijos, y hasta
 * 3.691 €/año con 70.000 € y tres hijos (uno menor de tres años).
 *
 * DEFECTO 2 — la reducción por tributación conjunta tratada como un mínimo
 * ───────────────────────────────────────────────────────────────────────
 * `calcularMinimos` sumaba 2.150 € al mínimo cuando la situación era monoparental, y los
 * 3.400 € del matrimonio con un solo ingreso no se aplicaban en absoluto. El art. 84.2,
 * reglas 3.ª y 4.ª, dice «la base imponible se reducirá»: es reducción de BASE, se valora al
 * tipo marginal, y no puede ir sumada al mínimo, que se grava a tipo cero. Eran los dos
 * tratamientos cruzados.
 *
 * Normas verificadas en sesión el 12/09/2026 contra la AEAT: manual de ayuda de Renta 2025,
 * «8.4.3.1 Cuota íntegra estatal» (art. 63.1.2.º), y manual práctico Renta 2025, «Reducción
 * por tributación conjunta» (arts. 82 y 84.2.3.º y 4.º: 3.400 € y 2.150 €).
 *
 * Los casos se resolvieron a mano ANTES de ejecutar la app; la aritmética va en cada test.
 */

const RUTA = '/estimador-irpf/';

const ESPACIO_DURO = new RegExp(String.fromCharCode(160), 'g');
const limpiar = (s: string) => s.replace(ESPACIO_DURO, ' ').replace(/\s+/g, ' ').trim();

/** Valor de una tarjeta `ResultCard`. */
async function tarjeta(page: Page, titulo: string): Promise<string> {
  const h3 = page.getByRole('heading', { level: 3, name: titulo, exact: true });
  return limpiar(await h3.locator('xpath=../following-sibling::div[1]//p').innerText());
}

async function estimar(
  page: Page,
  opciones: { bruto: string; situacion: string; hijos?: string; hijosM3?: string }
): Promise<void> {
  await page.getByLabel('Rendimientos del trabajo brutos anuales').fill(opciones.bruto);
  await page.locator('select').first().selectOption(opciones.situacion);
  if (opciones.hijos) await page.getByLabel('Hijos a cargo').fill(opciones.hijos);
  if (opciones.hijosM3) await page.getByLabel('Hijos menores de 3 años').fill(opciones.hijosM3);
  await page.getByRole('button', { name: 'Estimar IRPF', exact: true }).click();
}

test.beforeEach(async ({ page }) => {
  await page.goto(RUTA);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Estimador IRPF 2025');
});

// ─────────────────────────────────────────────────────────────────────────────
test('CASO 1 · 45.000 € brutos, soltero/a, 2 hijos — el mínimo familiar a tipo cero', async ({ page }) => {
  // SS: base 3.750 €/mes (entre mínima y máxima) × 6,50 % × 12 = 2.925,00 €
  // RNT = 45.000 − 2.925 − 2.000 = 40.075,00 € → reducción art. 20 = 0 € (supera 19.747,5 €)
  // Base imponible general = 40.075,00 €. Soltero/a: sin reducción del art. 84.2.
  // Mínimo = 5.550 (personal) + 2.400 (hijo 1.º) + 2.700 (hijo 2.º) = 10.650,00 €
  //   escala(40.075) = 2.365,50 + 1.860,00 + 4.500,00 + 4.875×37 %
  //                  = 2.365,50 + 1.860,00 + 4.500,00 + 1.803,75 = 10.529,25 €
  //   escala(10.650) = 10.650×19 %                                = 2.023,50 €
  //   cuota íntegra  = 10.529,25 − 2.023,50                       = 8.505,75 €
  //
  // El método defectuoso daba escala(40.075 − 10.650) = escala(29.425) = 6.998,25 €:
  // 1.507,50 € menos, porque valoraba los 10.650 € al 30-37 % en vez de al 19 %.
  await estimar(page, { bruto: '45000', situacion: 'soltero', hijos: '2' });

  expect(await tarjeta(page, 'Base imponible')).toBe('40.075,00€');
  expect(await tarjeta(page, 'Mínimos personales')).toBe('10.650,00€');
  expect(await tarjeta(page, 'Cuota íntegra')).toBe('8505,75€');

  // Y la nota del desglose cuadra las dos aplicaciones de la escala.
  const nota = page.locator('css=p:has-text("art. 63.1.2.º LIRPF")').first();
  await expect(nota).toContainText('10.529,25');   // los tramos sobre la base entera
  await expect(nota).toContainText('2023,50');     // la escala sobre el mínimo
  await expect(nota).toContainText('8505,75');     // la cuota íntegra
});

// ─────────────────────────────────────────────────────────────────────────────
test('CASO 2 · 45.000 € brutos, casado/a con un ingreso — la reducción del art. 84.2 sí baja la base', async ({ page }) => {
  // Mismo bruto que el caso 1, sin hijos, pero optando por tributación conjunta con un solo
  // perceptor: art. 84.2 regla 3.ª → la BASE IMPONIBLE se reduce en 3.400 €.
  //
  // Base imponible general = 40.075,00 €
  // Base liquidable general = 40.075 − 3.400 = 36.675,00 €   ← la reducción sí resta aquí
  // Mínimo = 5.550,00 € (personal, sin hijos)                ← el mínimo NO resta aquí
  //   escala(36.675) = 2.365,50 + 1.860,00 + 4.500,00 + 1.475×37 %
  //                  = 2.365,50 + 1.860,00 + 4.500,00 + 545,75 = 9.271,25 €
  //   escala(5.550)  = 1.054,50 €
  //   cuota íntegra  = 8.216,75 €
  //
  // Antes de la reparación esta situación no aplicaba NADA: ni los 3.400 € (que la app
  // ignoraba) ni el método correcto del mínimo. Daba escala(40.075 − 5.550) = 8.240,25 €.
  await estimar(page, { bruto: '45000', situacion: 'casado_un_ingreso' });

  expect(await tarjeta(page, 'Base imponible')).toBe('40.075,00€');
  expect(await tarjeta(page, 'Mínimos personales')).toBe('5550,00€');
  expect(await tarjeta(page, 'Cuota íntegra')).toBe('8216,75€');

  const nota = page.locator('css=p:has-text("art. 63.1.2.º LIRPF")').first();
  await expect(nota).toContainText('9271,25');
  await expect(nota).toContainText('1054,50');
  // Y se dice que la reducción de base es cosa aparte del mínimo.
  await expect(nota).toContainText('tributación conjunta');
  await expect(nota).toContainText('3400,00');
});

// ─────────────────────────────────────────────────────────────────────────────
test('CASO 3 · familia monoparental: 2.150 € de reducción de BASE, no de mínimo', async ({ page }) => {
  // Art. 84.2 regla 4.ª: 2.150 €/año, y la app los sumaba al mínimo personal y familiar.
  // Con un hijo, el mínimo correcto es 5.550 + 2.400 = 7.950,00 € — SIN los 2.150 €.
  // Antes de la reparación la tarjeta «Mínimos personales» mostraba 10.100,00 €.
  await estimar(page, { bruto: '30000', situacion: 'familia_monoparental', hijos: '1' });

  expect(await tarjeta(page, 'Mínimos personales')).toBe('7950,00€');

  // SS: 2.500 €/mes × 6,50 % × 12 = 1.950,00 € · RNT = 26.050,00 € · reducción art. 20 = 0 €
  // Base liquidable = 26.050 − 2.150 = 23.900,00 €
  //   escala(23.900) = 2.365,50 + 1.860,00 + 3.700×30 % = 2.365,50 + 1.860,00 + 1.110,00 = 5.335,50 €
  //   escala(7.950)  = 7.950×19 %                        = 1.510,50 €
  //   cuota íntegra  = 3.825,00 €
  expect(await tarjeta(page, 'Base imponible')).toBe('26.050,00€');
  expect(await tarjeta(page, 'Cuota íntegra')).toBe('3825,00€');

  const nota = page.locator('css=p:has-text("art. 63.1.2.º LIRPF")').first();
  await expect(nota).toContainText('2150,00');
});
