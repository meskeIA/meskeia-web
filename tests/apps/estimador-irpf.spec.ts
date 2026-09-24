import { test, expect, Page } from '@playwright/test';
import { esperarHidratacion, esperarValorEnReact } from './_hidratacion';

/**
 * estimador-irpf — generado por /inspector el 24/09/2026 sobre el candado del 12/09/2026.
 *
 * Los CASOS 1 a 3 se escribieron el 12/09/2026, tras reparar dos defectos (el mínimo restado
 * de la base y la reducción por tributación conjunta tratada como mínimo); se conservan tal
 * cual. El Inspector añadió el 24/09/2026 los CASOS 4 a 8 (normal, límites y rechazo) y los
 * HALLAZGOS ABIERTOS 9 a 12, marcados con `test.fail()`: afirman lo que DEBERÍA pasar, así que
 * hoy fallan a propósito; al repararlos se les quita la marca y quedan como regresión.
 *
 * DE DÓNDE SALE CADA CIFRA — de data/fiscal, NO de lo que devuelve la app
 * ─────────────────────────────────────────────────────────────────────────
 *   · escala art. 63 + 74 (estatal + autonómico medio): 12.450 @19 % · 20.200 @24 % ·
 *     35.200 @30 % · 60.000 @37 % · 300.000 @45 % · en adelante @47 %
 *     (`TRAMOS_IRPF_2025` de `data/fiscal/irpf.ts`). La app no pide comunidad autónoma: usa
 *     esa escala combinada, y los esperados usan la misma.
 *   · método del art. 63.1.2.º: escala(base) − escala(mínimo) (`calcularCuotaIntegraGeneral`)
 *   · mínimo del contribuyente, art. 57: 5.550 € (`MINIMOS_IRPF_2025.personal`)
 *     → escala(5.550) = 5.550 × 19 % = 1.054,50 €
 *   · gastos art. 19.2.f: 2.000 € (`GASTOS_DEDUCIBLES_TRABAJO_2025.importeGeneral`)
 *   · reducción art. 20 (RDL 4/2024): 7.302 € hasta 14.852 € de RNT; 7.302 − 1,75 × (RNT −
 *     14.852) hasta 17.673,52; 2.364,34 − 1,14 × (RNT − 17.673,52) hasta 19.747,5; luego 0
 *     (`REDUCCION_RENDIMIENTOS_TRABAJO_2025`)
 *   · deducción art. 80 bis: 340 € con RNT ≤ 14.852 € (`DEDUCCION_RENTAS_BAJAS_2025`)
 *   · cotización del trabajador del EJERCICIO 2025, que es el que la app declara estimar
 *     («Estimador IRPF 2025»): 4,70 + 1,55 + 0,10 + 0,12 = 6,47 %, base máxima 4.909,50 €/mes
 *     (`COTIZACIONES_SS_2025`, `BASES_SS_2025`). La app usa las de 2026 (6,50 % y 5.101,20 €):
 *     es el HALLAZGO del CASO 9. Los casos 4 a 8 toleran esa diferencia (2,70 € con 30.000 €)
 *     porque vigilan defectos de cientos de euros.
 *   · base del ahorro (dividendos e intereses, arts. 46 y 66): 6.000 @19 % · 50.000 @21 % …
 *     (`TRAMOS_GANANCIAS_PATRIMONIALES_2025` de `data/fiscal/inmuebles.ts`)
 *
 * ⚠️ Los CASOS 1 a 3 fijan con exactitud la cotización a los tipos de 2026 (6,50 %). Si se
 * repara el hallazgo del CASO 9, esos tres hay que RECALCULARLOS a mano con el 6,47 %; no
 * basta con copiar lo que dé la app.
 */

const RUTA = '/estimador-irpf/';

const SEL_BRUTO = 'input[aria-label="Rendimientos del trabajo brutos anuales"]';
const SEL_CAPITAL = 'input[aria-label="Rendimientos del capital mobiliario (opcional)"]';
const SEL_RETENCIONES = 'input[aria-label="Retenciones ya practicadas"]';
const SEL_HIJOS = 'input[aria-label="Hijos a cargo"]';
const SEL_HIJOS_M3 = 'input[aria-label="Hijos menores de 3 años"]';

/** El importe grande del resultado (a pagar / a devolver), acotado al bloque de la app. */
const SEL_IMPORTE_FINAL = '[class*="resultadoFinal"] [role="status"]';
const SEL_ETIQUETA_FINAL = '[class*="resultadoFinal"] p';

const ESPACIO_DURO = new RegExp(String.fromCharCode(160), 'g');
const limpiar = (s: string) => s.replace(ESPACIO_DURO, ' ').replace(/\s+/g, ' ').trim();

/** «169.036,90 €» → 169036.9. Solo para leer lo que pinta la app, que ya viene en formato español. */
const euros = (s: string): number => Number(s.replace(/[^\d,-]/g, '').replace(/,/g, '.'));

/** Valor de una tarjeta `ResultCard`. */
async function tarjeta(page: Page, titulo: string): Promise<string> {
  const h3 = page.getByRole('heading', { level: 3, name: titulo, exact: true });
  return limpiar(await h3.locator('xpath=../following-sibling::div[1]//p').innerText());
}

async function escribir(page: Page, selector: string, valor: string, enReact: string = valor): Promise<void> {
  await page.locator(selector).fill(valor);
  await esperarValorEnReact(page, selector, enReact);
}

interface Entrada {
  bruto: string;
  situacion?: string;
  hijos?: string;
  hijosM3?: string;
  capital?: string;
  retenciones?: string;
  sinNomina?: boolean;
}

async function estimar(page: Page, o: Entrada): Promise<void> {
  await escribir(page, SEL_BRUTO, o.bruto);
  if (o.capital !== undefined) await escribir(page, SEL_CAPITAL, o.capital);
  if (o.retenciones !== undefined) await escribir(page, SEL_RETENCIONES, o.retenciones);
  if (o.situacion) await page.locator('#situacion').selectOption(o.situacion);
  if (o.hijos) await escribir(page, SEL_HIJOS, o.hijos);
  if (o.hijosM3) await escribir(page, SEL_HIJOS_M3, o.hijosM3);
  if (o.sinNomina) {
    await page.getByRole('checkbox', { name: /trabajador por cuenta ajena/ }).uncheck();
  }
  await page.getByRole('button', { name: 'Estimar IRPF', exact: true }).click();
}

test.beforeEach(async ({ page }) => {
  await page.goto(RUTA);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Estimador IRPF 2025');
  await esperarHidratacion(page, [SEL_BRUTO, SEL_CAPITAL, SEL_RETENCIONES, SEL_HIJOS]);
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

// ═════════════════════════════════════════════════════════════════════════════
// Inspector 24/09/2026 — casos normal, límite y rechazo
// ═════════════════════════════════════════════════════════════════════════════

test('CASO 4 (normal) · 30.000 € brutos, soltero/a, sin hijos → cuota íntegra 4.928,70 €', async ({ page }) => {
  // SS 2025: 2.500 €/mes × 6,47 % × 12 = 1.941,00 €
  // RNT = 30.000 − 1.941 − 2.000 = 26.059,00 € → reducción art. 20 = 0 € (≥ 19.747,5 €)
  // escala(26.059) = 2.365,50 + 1.860,00 + 5.859 × 30 % = 2.365,50 + 1.860,00 + 1.757,70 = 5.983,20 €
  // escala(5.550)  = 1.054,50 €
  // cuota íntegra  = 5.983,20 − 1.054,50 = 4.928,70 €
  //
  // Tolerancia ±5 € (precisión −1): vigila el mínimo restado de la base (aquí 610,50 € de
  // menos) y la reducción residual de 2.364 € ya derogada (≈709 € de menos). Absorbe los
  // 2,70 € del año de cotización, que tiene su propio caso (el 9).
  await estimar(page, { bruto: '30000' });

  expect(euros(await tarjeta(page, 'Cuota íntegra'))).toBeCloseTo(4928.7, -1);
  await expect(page.locator(SEL_ETIQUETA_FINAL).first()).toHaveText('Resultado estimado: A PAGAR');
  // Sin retenciones, lo que queda a pagar es la cuota entera.
  expect(euros(await page.locator(SEL_IMPORTE_FINAL).innerText())).toBeCloseTo(4928.7, -1);
});

test('CASO 5 (límite bajo) · 17.500 € y 500 € retenidos: reducción máxima y deducción del 80 bis dejan cuota 0', async ({ page }) => {
  // SS 2025: 1.458,33 €/mes (sobre la base mínima) × 6,47 % × 12 = 1.132,25 €
  // RNT = 17.500 − 1.132,25 − 2.000 = 14.367,75 € ≤ 14.852 → reducción art. 20 = 7.302 €
  // Base = 14.367,75 − 7.302 = 7.065,75 €
  // cuota íntegra = escala(7.065,75) − escala(5.550) = 1.515,75 × 19 % = 287,99 €
  // Deducción art. 80 bis: RNT ≤ 14.852 → 340,00 € → cuota tras deducciones = máx(0, 287,99 − 340) = 0
  // Cuota diferencial = 0 − 500 = −500 → A DEVOLVER 500,00 € (exacto, sea cual sea el año de SS)
  //
  // Tolerancia ±5 € en la cuota íntegra: sin la reducción del art. 20 saldría ≈1.675 €.
  await estimar(page, { bruto: '17500', retenciones: '500' });

  expect(euros(await tarjeta(page, 'Cuota íntegra'))).toBeCloseTo(287.99, -1);
  expect(await tarjeta(page, 'Deducción rentas bajas')).toBe('-340,00€');
  await expect(page.locator(SEL_ETIQUETA_FINAL).first()).toHaveText('Resultado estimado: A DEVOLVER');
  expect(limpiar(await page.locator(SEL_IMPORTE_FINAL).innerText())).toBe('500,00 €');
});

test('CASO 6 (límite alto) · 400.000 € brutos entra en el tramo del 47 %', async ({ page }) => {
  // SS 2025 topada en la base máxima: 4.909,50 × 12 × 6,47 % = 3.811,74 €
  // RNT = 400.000 − 3.811,74 − 2.000 = 394.188,26 € → reducción art. 20 = 0
  // escala = 2.365,50 + 1.860,00 + 4.500,00 + 9.176,00 + 108.000,00 + 94.188,26 × 47 %
  //        = 125.901,50 + 44.268,48 = 170.169,98 €
  // cuota íntegra = 170.169,98 − 1.054,50 = 169.115,48 €
  //
  // Tolerancia ±500 € (precisión −3): vigila el tramo del 47 % (a un 45 % serían 1.884 € de
  // menos) y el mínimo restado de la base (1.443 € de menos). Los 78,58 € del año de
  // cotización los vigila el CASO 9.
  await estimar(page, { bruto: '400000' });

  const ultimaFila = page.locator('table').first().locator('tbody tr').last();
  await expect(ultimaFila.locator('td').nth(0)).toHaveText(/^300\.000,00\s€$/);
  await expect(ultimaFila.locator('td').nth(1)).toHaveText('En adelante');
  await expect(ultimaFila.locator('td').nth(2)).toHaveText('47%');
  expect(euros(await tarjeta(page, 'Cuota íntegra'))).toBeCloseTo(169115.48, -3);
});

test('CASO 7 (entrada) · «30.000» con punto de millar se lee como treinta mil', async ({ page }) => {
  // Mismo esperado que el CASO 4: 4.928,70 € (±5). Si el punto se leyera como decimal
  // (30 €), el RNT quedaría a 0 y la cuota saldría 0,00 €.
  await estimar(page, { bruto: '30.000' });

  expect(euros(await tarjeta(page, 'Cuota íntegra'))).toBeCloseTo(4928.7, -1);
});

test('CASO 8 (rechazo) · negativo, vacío o texto no producen resultado', async ({ page }) => {
  const placeholder = page.getByText('Introduce tus datos y pulsa «Estimar IRPF»');

  // Texto: el control no admite letras, el campo se queda vacío.
  await page.locator(SEL_BRUTO).fill('abc');
  await esperarValorEnReact(page, SEL_BRUTO, '');

  // Vacío → no hay nada que estimar.
  await page.getByRole('button', { name: 'Estimar IRPF', exact: true }).click();
  await expect(placeholder).toBeVisible();
  await expect(page.locator(SEL_IMPORTE_FINAL)).toHaveCount(0);

  // Negativo → al perder el foco el control lo lleva a 0 y la app no calcula.
  await estimar(page, { bruto: '-30000' });
  await expect(page.locator(SEL_BRUTO)).toHaveValue('0');
  await expect(placeholder).toBeVisible();
  await expect(page.locator(SEL_IMPORTE_FINAL)).toHaveCount(0);
});

// ═════════════════════════════════════════════════════════════════════════════
// HALLAZGOS ABIERTOS (Inspector 24/09/2026) — hoy fallan a propósito
// ═════════════════════════════════════════════════════════════════════════════

test('CASO 9 · HALLAZGO: un estimador del IRPF 2025 descuenta la cotización de 2026', async ({ page }) => {
  test.fail(true, 'HALLAZGO 24/09/2026: usa COTIZACIONES_SS_2026 y BASES_SS_2026 en vez de las de 2025; da 169.036,90 €');
  // Mismo cálculo que el CASO 6 con los datos del ejercicio 2025 → 169.115,48 €.
  // Con 6,50 % y base máxima 5.101,20 €: SS 3.978,94 €, base 394.021,06 € → 169.036,90 €.
  // Diferencia 78,58 € → precisión −1 (±5 €).
  await estimar(page, { bruto: '400000' });

  expect(euros(await tarjeta(page, 'Cuota íntegra'))).toBeCloseTo(169115.48, -1);
});

test('CASO 10 · HALLAZGO: los dividendos e intereses van a la base del ahorro, no a la general', async ({ page }) => {
  test.fail(true, 'HALLAZGO 24/09/2026: suma el capital mobiliario a la base general y lo grava al marginal; da 6.426,00 €');
  // Trabajo 30.000 € → cuota general 4.928,70 € (CASO 4).
  // Capital 5.000 € («dividendos, intereses bancarios», dice la ayuda del campo) → base del
  // ahorro: 5.000 × 19 % = 950,00 € (`TRAMOS_GANANCIAS_PATRIMONIALES_2025`, primer tramo hasta 6.000).
  // Total a pagar sin retenciones = 4.928,70 + 950,00 = 5.878,70 €.
  // La app lo mete en la base general al 30 %: 6.426,00 €, 547 € de más → precisión −1 (±5 €).
  await estimar(page, { bruto: '30000', capital: '5000' });

  expect(euros(await page.locator(SEL_IMPORTE_FINAL).innerText())).toBeCloseTo(5878.7, -1);
});

test('CASO 11 · HALLAZGO: sin nómina se pierden los 2.000 € del art. 19.2.f y la reducción del art. 20', async ({ page }) => {
  test.fail(true, 'HALLAZGO 24/09/2026: desmarcar «Soy trabajador por cuenta ajena» anula gastos y reducción; da 2.643,00 €');
  // 18.000 € de rendimientos del trabajo sin cotización propia (p. ej. una pensión):
  // RNT = 18.000 − 2.000 (art. 19.2.f, «todos los contribuyentes con rendimientos del trabajo»)
  //     = 16.000 € → reducción art. 20 = 7.302 − 1,75 × (16.000 − 14.852) = 5.293,00 €
  // Base = 10.707,00 € → cuota íntegra = escala(10.707) − escala(5.550) = 5.157 × 19 % = 979,83 €
  // La app aplica la escala a los 18.000 € enteros: 2.643,00 €, 1.663 € de más → precisión −1.
  await estimar(page, { bruto: '18000', sinNomina: true });

  expect(euros(await tarjeta(page, 'Cuota íntegra'))).toBeCloseTo(979.83, -1);
});

test('CASO 12 · HALLAZGO: una entrada rechazada deja a la vista el resultado de la anterior', async ({ page }) => {
  test.fail(true, 'HALLAZGO 24/09/2026: con bruto −30.000 (acotado a 0) sigue mostrando «A PAGAR 4926,00 €» del cálculo previo');
  await estimar(page, { bruto: '30000' });
  const previo = limpiar(await page.locator(SEL_IMPORTE_FINAL).innerText());

  await estimar(page, { bruto: '-30000' });
  await expect(page.locator(SEL_BRUTO)).toHaveValue('0');

  // Lo que se pide: que la cifra de 30.000 € no siga presentándose como la de la entrada nueva
  // (vale borrarla o sustituirla por un aviso).
  await expect
    .poll(async () => {
      const final = page.locator(SEL_IMPORTE_FINAL);
      if ((await final.count()) === 0) return 'sin resultado';
      return limpiar(await final.innerText());
    })
    .not.toBe(previo);
});
