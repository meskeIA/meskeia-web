import { test, expect, Page, Locator } from '@playwright/test';
import { esperarHidratacion, esperarValorEnReact, esperarPaginaAsentada } from './_hidratacion';

/**
 * estimador-irpf — generado por /inspector el 24/09/2026 sobre el candado del 12/09/2026.
 *
 * Los CASOS 1 a 3 se escribieron el 12/09/2026 (mínimo restado de la base, reducción por
 * tributación conjunta tratada como mínimo). El Inspector añadió el 24/09/2026 los CASOS 4 a
 * 8 y los hallazgos 1310-1318; reparados ese mismo día, sus casos quedan como regresión
 * (CASOS 9 a 18). Los CASOS 1 a 3 se RECALCULARON a mano con la cotización de 2025 (6,47 %),
 * que es la del ejercicio que la app declara estimar (hallazgo 1312).
 *
 * DE DÓNDE SALE CADA CIFRA — de data/fiscal, NO de lo que devuelve la app
 * ─────────────────────────────────────────────────────────────────────────
 *   · escala art. 63 + 74 (estatal + autonómico medio): 12.450 @19 % · 20.200 @24 % ·
 *     35.200 @30 % · 60.000 @37 % · 300.000 @45 % · en adelante @47 %
 *     (`TRAMOS_IRPF_2025` de `data/fiscal/irpf.ts`).
 *     escala(20.200) = 2.365,50 + 1.860,00 = 4.225,50 · escala(35.200) = 8.725,50 ·
 *     escala(60.000) = 17.901,50 · escala(300.000) = 125.901,50
 *   · método del art. 63.1.2.º: escala(base) − escala(mínimo) (`calcularCuotaIntegraGeneral`)
 *   · mínimo del contribuyente, art. 57: 5.550 € → escala(5.550) = 1.054,50 €
 *   · mínimo por descendientes (art. 58): 2.400 (1.º) + 2.700 (2.º); prorrateado a partes
 *     iguales si los dos progenitores declaran por separado (art. 61.1.ª)
 *   · gastos art. 19.2.f: 2.000 € — cualquier rendimiento del trabajo, pensiones incluidas
 *   · reducción art. 20 (RDL 4/2024): 7.302 € hasta 14.852 € de RNT; 7.302 − 1,75 × (RNT −
 *     14.852) hasta 17.673,52; 2.364,34 − 1,14 × (RNT − 17.673,52) hasta 19.747,5; luego 0.
 *     Se pierde con más de 6.500 € de rentas distintas del trabajo (art. 20.2).
 *   · deducción por obtención de rendimientos del trabajo (DA 61.ª LIRPF, Manual AEAT Renta
 *     2025): sobre los rendimientos ÍNTEGROS, 340 € hasta 16.576 € y 340 − 0,2 × (íntegros −
 *     16.576) hasta 18.276 €; tope en la cuota íntegra GENERAL, donde tributa el trabajo
 *     (`DEDUCCION_RENDIMIENTOS_TRABAJO_2025`); solo con nómina (prestación efectiva de servicios).
 *   · cotización del trabajador de 2025: 4,70 + 1,55 + 0,10 + 0,12 = 6,47 %, base máxima
 *     4.909,50 €/mes, mínima 1.381,20 €/mes (`COTIZACIONES_SS_2025`, `BASES_SS_2025`)
 *   · base del ahorro (dividendos e intereses, arts. 46 y 66): 6.000 @19 % · 50.000 @21 % …
 *     (`TRAMOS_GANANCIAS_PATRIMONIALES_2025` de `data/fiscal/inmuebles.ts`); el remanente
 *     del mínimo que no cabe en la base general se aplica a la del ahorro (art. 56.2).
 *
 * Las cifras con medio céntimo (x,xx5) se comparan con ±0,05 €: la coma flotante puede
 * redondear a uno u otro lado y no es lo que vigila ningún caso.
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

/** Nota del desglose de la base general (la que cita el art. 63.1.2.º). */
const notaGeneral = (page: Page) => page.locator('css=p:has-text("art. 63.1.2.º LIRPF")').first();

test.beforeEach(async ({ page }) => {
  await page.goto(RUTA);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Estimador IRPF 2025');
  await esperarHidratacion(page, [SEL_BRUTO, SEL_CAPITAL, SEL_RETENCIONES, SEL_HIJOS]);
});

// ─────────────────────────────────────────────────────────────────────────────
test('CASO 1 · 45.000 € brutos, soltero/a, 2 hijos — el mínimo familiar a tipo cero', async ({ page }) => {
  // SS 2025: base 3.750 €/mes × 6,47 % × 12 = 2.911,50 €
  // RNT = 45.000 − 2.911,50 − 2.000 = 40.088,50 € → reducción art. 20 = 0 € (supera 19.747,5 €)
  // Mínimo = 5.550 + 2.400 + 2.700 = 10.650,00 € (soltero/a: sin prorrateo)
  //   escala(40.088,50) = 8.725,50 + 4.888,50 × 37 % = 8.725,50 + 1.808,745 = 10.534,245 €
  //   escala(10.650)    = 10.650 × 19 %                                     =  2.023,50 €
  //   cuota íntegra     = 8.510,745 €
  // El método defectuoso daba escala(40.088,50 − 10.650) = 7.003,245 €: 1.507,50 € menos.
  await estimar(page, { bruto: '45000', situacion: 'soltero', hijos: '2' });

  expect(await tarjeta(page, 'Base imponible general')).toBe('40.088,50€');
  expect(await tarjeta(page, 'Mínimos personales')).toBe('10.650,00€');
  expect(euros(await tarjeta(page, 'Cuota íntegra'))).toBeCloseTo(8510.745, 1);

  const nota = notaGeneral(page);
  await expect(nota).toContainText(/10\.534,2[45]/);  // los tramos sobre la base entera
  await expect(nota).toContainText('2023,50');        // la escala sobre el mínimo
  await expect(nota).toContainText(/8510,7[45]/);     // la cuota íntegra
});

// ─────────────────────────────────────────────────────────────────────────────
test('CASO 2 · 45.000 € brutos, casado/a con un ingreso — la reducción del art. 84.2 sí baja la base', async ({ page }) => {
  // Base imponible general = 40.088,50 € (CASO 1)
  // Base liquidable general = 40.088,50 − 3.400 = 36.688,50 €   ← la reducción sí resta aquí
  // Mínimo = 5.550,00 € (personal, sin hijos)                   ← el mínimo NO resta aquí
  //   escala(36.688,50) = 8.725,50 + 1.488,50 × 37 % = 8.725,50 + 550,745 = 9.276,245 €
  //   escala(5.550)     = 1.054,50 €
  //   cuota íntegra     = 8.221,745 €
  await estimar(page, { bruto: '45000', situacion: 'casado_un_ingreso' });

  expect(await tarjeta(page, 'Base imponible general')).toBe('40.088,50€');
  expect(await tarjeta(page, 'Mínimos personales')).toBe('5550,00€');
  expect(euros(await tarjeta(page, 'Cuota íntegra'))).toBeCloseTo(8221.745, 1);

  const nota = notaGeneral(page);
  await expect(nota).toContainText(/9276,2[45]/);
  await expect(nota).toContainText('1054,50');
  await expect(nota).toContainText('tributación conjunta');
  await expect(nota).toContainText('3400,00');
});

// ─────────────────────────────────────────────────────────────────────────────
test('CASO 3 · familia monoparental: 2.150 € de reducción de BASE, no de mínimo', async ({ page }) => {
  // Mínimo = 5.550 + 2.400 = 7.950,00 € — SIN los 2.150 € del art. 84.2 regla 4.ª.
  // SS 2025: 2.500 €/mes × 6,47 % × 12 = 1.941,00 € · RNT = 30.000 − 1.941 − 2.000 = 26.059,00 €
  // Base liquidable = 26.059 − 2.150 = 23.909,00 €
  //   escala(23.909) = 4.225,50 + 3.709 × 30 % = 4.225,50 + 1.112,70 = 5.338,20 €
  //   escala(7.950)  = 1.510,50 €
  //   cuota íntegra  = 3.827,70 €
  await estimar(page, { bruto: '30000', situacion: 'familia_monoparental', hijos: '1' });

  expect(await tarjeta(page, 'Mínimos personales')).toBe('7950,00€');
  expect(await tarjeta(page, 'Base imponible general')).toBe('26.059,00€');
  expect(await tarjeta(page, 'Cuota íntegra')).toBe('3827,70€');
  await expect(notaGeneral(page)).toContainText('2150,00');
});

// ═════════════════════════════════════════════════════════════════════════════
// Inspector 24/09/2026 — casos normal, límite y rechazo
// ═════════════════════════════════════════════════════════════════════════════

test('CASO 4 (normal) · 30.000 € brutos, soltero/a, sin hijos → cuota íntegra 4.928,70 €', async ({ page }) => {
  // SS 2025 1.941,00 € · RNT 26.059,00 € · reducción art. 20 = 0
  // escala(26.059) = 4.225,50 + 5.859 × 30 % = 5.983,20 € · − 1.054,50 = 4.928,70 €
  await estimar(page, { bruto: '30000' });

  expect(await tarjeta(page, 'Cuota íntegra')).toBe('4928,70€');
  await expect(page.locator(SEL_ETIQUETA_FINAL).first()).toHaveText('Resultado estimado: A PAGAR');
  expect(limpiar(await page.locator(SEL_IMPORTE_FINAL).innerText())).toBe('4928,70 €');
});

test('CASO 5 (límite bajo) · 17.500 € y 500 € retenidos: la deducción va sobre los ÍNTEGROS (155,20 €, no 340 €)', async ({ page }) => {
  // SS 2025: 1.458,33 €/mes × 6,47 % × 12 = 1.132,25 €
  // Reducción art. 20, medida sobre 17.500 − 1.132,25 = 16.367,75 € (art. 20: SIN restar antes
  //   los 2.000 € de la letra f); hallazgo 1687) → primer tramo decreciente:
  //   7.302 − 1,75 × (16.367,75 − 14.852) = 7.302 − 2.652,56 = 4.649,44 €
  // Rendimiento neto = 16.367,75 − 2.000 = 14.367,75 € → base = 14.367,75 − 4.649,44 = 9.718,31 €
  // Cuota íntegra = (9.718,31 − 5.550) × 19 % = 791,98 €
  // Deducción DA 61.ª sobre los ÍNTEGROS: 340 − 0,2 × (17.500 − 16.576) = 155,20 € — la misma
  //   cifra que da la AEAT para 17.500 € en el Ejemplo 3 del Manual Renta 2025. Hasta el
  //   24/09/2026 la app la calculaba sobre el neto (14.367,75 € ≤ 14.852) y daba 340 €.
  // Cuota tras deducción = 791,98 − 155,20 = 636,78 € → A PAGAR 636,78 − 500 = 136,78 €
  // (Hasta el 25/09/2026, con la reducción medida sobre 14.367,75 €: cuota 287,99 € y
  //  «A DEVOLVER 367,21 €».)
  await estimar(page, { bruto: '17500', retenciones: '500' });

  expect(euros(await tarjeta(page, 'Cuota íntegra'))).toBeCloseTo(791.98, 1);
  expect(await tarjeta(page, 'Deducción rentas bajas')).toBe('-155,20€');
  await expect(page.locator(SEL_ETIQUETA_FINAL).first()).toHaveText('Resultado estimado: A PAGAR');
  expect(euros(await page.locator(SEL_IMPORTE_FINAL).innerText())).toBeCloseTo(136.78, 1);
});

test('CASO 5 bis · DA 61.ª: el tope es la cuota GENERAL; la del ahorro no la amplía', async ({ page }) => {
  // Trabajo 15.000 € (por debajo del SMI: jornada parcial, se cotiza por lo cobrado) →
  //   SS 2025 = 15.000 × 6,47 % = 970,50 € · RNT = 15.000 − 970,50 − 2.000 = 12.029,50 €
  //   → reducción art. 20 = 7.302 € · base general = 4.727,50 €, por debajo del mínimo
  //   (5.550 €) → cuota general 0 y pasan 822,50 € de mínimo a la base del ahorro (art. 56.2).
  // Capital 3.000 € (≤ 6.500: no quita la deducción) → cuota del ahorro =
  //   (3.000 − 822,50) × 19 % = 413,725 €
  // Deducción: 15.000 ≤ 16.576 → 340 €, pero su tope es la parte de la cuota que corresponde
  //   al trabajo, y el trabajo solo está en la base general, cuya cuota es 0 → deducción 0.
  //   Antes se restaba de la cuota TOTAL: 413,73 − 340 = 73,73 €, 340 € de menos.
  await estimar(page, { bruto: '15000', capital: '3000' });

  expect(euros(await tarjeta(page, 'Cuota íntegra'))).toBeCloseTo(413.73, 1);
  await expect(page.getByRole('heading', { level: 3, name: 'Deducción rentas bajas', exact: true })).toHaveCount(0);
  expect(euros(await page.locator(SEL_IMPORTE_FINAL).innerText())).toBeCloseTo(413.73, 1);
});

test('CASO 5 ter · por debajo del SMI se cotiza por lo cobrado, no por la base mínima de jornada completa', async ({ page }) => {
  // 12.000 € de nómina en 2025 solo pueden ser jornada parcial o parte del año (el SMI de 2025
  //   son 16.576 € y la base mínima, 1.381,20 €/mes, es la de jornada completa).
  //   SS = 12.000 × 6,47 % = 776,40 €. Hasta el 24/09/2026 la app la subía a la mínima:
  //   1.381,20 × 6,47 % × 12 = 1.072,36 €, 295,96 € de más.
  // Base general = 12.000 − 776,40 − 2.000 − 7.302 = 1.921,60 € (con la mínima salía 1.625,64 €)
  await estimar(page, { bruto: '12000' });
  expect(await tarjeta(page, 'Base imponible general')).toBe('1921,60€');
});

test('CASO 6 (límite alto) · 400.000 € brutos entra en el tramo del 47 %', async ({ page }) => {
  // SS 2025 topada: 4.909,50 × 12 × 6,47 % = 3.811,74 €
  // RNT = 400.000 − 3.811,74 − 2.000 = 394.188,26 €
  // escala = 125.901,50 + 94.188,26 × 47 % = 170.169,98 € · − 1.054,50 = 169.115,48 €
  await estimar(page, { bruto: '400000' });

  const ultimaFila = page.locator('table').first().locator('tbody tr').last();
  await expect(ultimaFila.locator('td').nth(0)).toHaveText(/^300\.000,00\s€$/);
  await expect(ultimaFila.locator('td').nth(1)).toHaveText('En adelante');
  await expect(ultimaFila.locator('td').nth(2)).toHaveText('47%');
  expect(await tarjeta(page, 'Cuota íntegra')).toBe('169.115,48€');
});

test('CASO 7 (entrada) · «30.000» con punto de millar se lee como treinta mil', async ({ page }) => {
  await estimar(page, { bruto: '30.000' });
  expect(await tarjeta(page, 'Cuota íntegra')).toBe('4928,70€');
});

test('CASO 8 (rechazo) · negativo, vacío o texto no producen resultado', async ({ page }) => {
  const placeholder = page.getByText('Introduce tus datos y pulsa «Estimar IRPF»');

  await page.locator(SEL_BRUTO).fill('abc');
  await esperarValorEnReact(page, SEL_BRUTO, '');

  await page.getByRole('button', { name: 'Estimar IRPF', exact: true }).click();
  await expect(placeholder).toBeVisible();
  await expect(page.locator(SEL_IMPORTE_FINAL)).toHaveCount(0);
  await expect(page.getByRole('alert').filter({ hasText: 'mayores que 0' })).toBeVisible();

  await estimar(page, { bruto: '-30000' });
  await expect(page.locator(SEL_BRUTO)).toHaveValue('0');
  await expect(placeholder).toBeVisible();
  await expect(page.locator(SEL_IMPORTE_FINAL)).toHaveCount(0);
});

// ═════════════════════════════════════════════════════════════════════════════
// Hallazgos 1310-1318 (Inspector 24/09/2026), reparados el mismo día — regresión
// ═════════════════════════════════════════════════════════════════════════════

test('CASO 9 · hallazgo 1312: el ejercicio 2025 usa la cotización de 2025 en todo', async ({ page }) => {
  // Con la de 2026 (6,50 %, base máxima 5.101,20 €) salía 169.036,90 €: 78,58 € de menos.
  await estimar(page, { bruto: '400000' });
  expect(euros(await tarjeta(page, 'Cuota íntegra'))).toBeCloseTo(169115.48, 1);

  // Y el año se dice igual en todas partes: título, desglose, referencia de datos y pie.
  await expect(page).toHaveTitle(/Estimador IRPF 2025/);
  await expect(page.getByRole('heading', { name: /Desglose por tramos IRPF 2025/ })).toBeVisible();
  await expect(page.getByRole('note', { name: 'Datos de referencia normativos' })).toContainText('IRPF 2025');
  await expect(page.getByText('Ejercicio calculado: 2025')).toBeVisible();
  await expect(page.locator('body')).not.toContainText('Vigencia: 2026');
});

test('CASO 10 · hallazgo 1310: los dividendos e intereses van a la base del ahorro', async ({ page }) => {
  // Trabajo 30.000 € → cuota general 4.928,70 € (CASO 4).
  // Capital 5.000 € → base del ahorro: 5.000 × 19 % = 950,00 € (primer tramo, hasta 6.000).
  // Total = 5.878,70 €. Sumado a la base general al 30 % daba 6.426,00 €.
  await estimar(page, { bruto: '30000', capital: '5000' });

  expect(await tarjeta(page, 'Base imponible general')).toBe('26.059,00€');
  expect(await tarjeta(page, 'Base del ahorro')).toBe('5000,00€');
  expect(await tarjeta(page, 'Cuota íntegra')).toBe('5878,70€');
  expect(limpiar(await page.locator(SEL_IMPORTE_FINAL).innerText())).toBe('5878,70 €');
  await expect(page.locator('css=p:has-text("Cuota íntegra del ahorro")')).toContainText('950,00');
});

test('CASO 10 bis · hallazgo 1310: con más de 6.500 € de capital se pierde la reducción del art. 20', async ({ page }) => {
  // Trabajo 20.000 €: SS 2025 = 1.666,67 × 6,47 % × 12 = 1.294,00 € · RNT = 16.706,00 €
  //   con reducción serían 7.302 − 1,75 × 1.854 = 4.057,50 €, pero el capital (7.000 €)
  //   supera 6.500 € (art. 20.2) → reducción 0 → base general 16.706,00 €
  //   escala(16.706) = 2.365,50 + 4.256 × 24 % = 2.365,50 + 1.021,44 = 3.386,94 € · − 1.054,50 = 2.332,44 €
  // Ahorro: 6.000 × 19 % + 1.000 × 21 % = 1.140 + 210 = 1.350,00 €
  // Total = 3.682,44 € (sin deducción de rentas bajas: otras rentas > 6.500 €)
  await estimar(page, { bruto: '20000', capital: '7000' });

  expect(await tarjeta(page, 'Base imponible general')).toBe('16.706,00€');
  expect(await tarjeta(page, 'Cuota íntegra')).toBe('3682,44€');
  await expect(notaGeneral(page)).toContainText('No se aplica la reducción por rendimientos del trabajo');
});

test('CASO 10 ter · art. 56.2: el mínimo que no cabe en la base general pasa a la del ahorro', async ({ page }) => {
  // Solo 10.000 € de intereses: base general 0, el mínimo entero (5.550) va a la del ahorro.
  //   escala ahorro(10.000) = 6.000 × 19 % + 4.000 × 21 % = 1.140 + 840 = 1.980,00 €
  //   escala ahorro(5.550)  = 1.054,50 € → cuota del ahorro = 925,50 €
  await estimar(page, { bruto: '0', capital: '10000' });

  expect(await tarjeta(page, 'Cuota íntegra')).toBe('925,50€');
  await expect(page.locator('css=p:has-text("Cuota íntegra del ahorro")')).toContainText('art. 56.2');
});

test('CASO 11 · hallazgo 1311: sin nómina se conservan los 2.000 € del art. 19.2.f y la reducción del art. 20', async ({ page }) => {
  // 18.000 € de pensión: sin cotización. La reducción del art. 20 se mide sobre los 18.000 €
  // íntegros (hallazgo 1687: los 2.000 € de la letra f) se restan después) → segundo tramo:
  //   2.364,34 − 1,14 × (18.000 − 17.673,52) = 2.364,34 − 372,19 = 1.992,15 €
  // Rendimiento neto = 18.000 − 2.000 = 16.000 € → base = 16.000 − 1.992,15 = 14.007,85 €
  // Cuota íntegra = escala(14.007,85) 2.739,38 − 1.054,50 = 1.684,88 €. Sin deducción por
  // rendimientos del trabajo: la AEAT la limita a los «derivados de la prestación efectiva de
  // servicios». (Hasta el 25/09/2026: reducción 5.293 €, base 10.707 € y cuota 979,83 €.)
  await estimar(page, { bruto: '18000', sinNomina: true });

  expect(await tarjeta(page, 'Base imponible general')).toBe('14.007,85€');
  expect(await tarjeta(page, 'Cuota íntegra')).toBe('1684,88€');
  await expect(page.getByRole('heading', { level: 3, name: 'Deducción rentas bajas' })).toHaveCount(0);
});

test('CASO 12 · hallazgo 1313: una entrada rechazada borra el resultado anterior y avisa', async ({ page }) => {
  await estimar(page, { bruto: '30000' });
  await expect(page.locator(SEL_IMPORTE_FINAL)).toHaveText(/4928,70/);

  await estimar(page, { bruto: '-30000' });
  await expect(page.locator(SEL_BRUTO)).toHaveValue('0');
  await expect(page.locator(SEL_IMPORTE_FINAL)).toHaveCount(0);
  await expect(page.getByRole('alert').filter({ hasText: 'mayores que 0' })).toBeVisible();

  // Y una entrada válida posterior retira el aviso.
  await estimar(page, { bruto: '30000' });
  await expect(page.getByRole('alert').filter({ hasText: 'mayores que 0' })).toHaveCount(0);
});

test('CASO 13 · art. 61.1.ª: con dos ingresos el mínimo por los hijos se prorratea', async ({ page }) => {
  // Cada progenitor declara por separado → (2.400 + 2.700) / 2 = 2.550 € cada uno
  // Mínimo = 5.550 + 2.550 = 8.100,00 €
  //   escala(40.088,50) = 10.534,245 € · escala(8.100) = 1.539,00 € → cuota 8.995,245 €
  await estimar(page, { bruto: '45000', situacion: 'casado_dos_ingresos', hijos: '2' });

  expect(await tarjeta(page, 'Mínimos personales')).toBe('8100,00€');
  expect(euros(await tarjeta(page, 'Cuota íntegra'))).toBeCloseTo(8995.245, 1);
});

test('CASO 14 · hallazgo 1314: los ejemplos educativos cuadran con la calculadora', async ({ page }) => {
  const ejemplo = (id: string) => page.locator(`[data-escenario="${id}"]`);
  const texto = async (id: string) => limpiar((await ejemplo(id).textContent()) ?? '');

  // Soltero 28.000 €: SS 2025 = 2.333,33 × 6,47 % × 12 = 1.811,60 € · RNT = 24.188,40 €
  //   reducción art. 20 = 0 · escala(24.188,40) = 4.225,50 + 3.988,40 × 30 % = 5.422,02 €
  //   cuota = 5.422,02 − 1.054,50 = 4.367,52 € · tipo efectivo 4.367,52 / 24.188,40 = 18,06 %
  const soltero = await texto('soltero-28000');
  expect(soltero).toContain('24.188,40 €');
  expect(soltero).toContain('4367,52 €');
  expect(soltero).toContain('18,06 %');
  expect(soltero).not.toContain('3.700');

  // Y la calculadora, con los mismos datos, dice lo mismo.
  await estimar(page, { bruto: '28000' });
  expect(await tarjeta(page, 'Cuota íntegra')).toBe('4367,52€');

  // Casada, 45.000 €, 2 hijos, individual: mínimo 8.100 € → cuota 8.995,245 € (CASO 13)
  const casada = await texto('casada-45000');
  expect(casada).toContain('8100,00 €');
  expect(casada).toMatch(/8995,2[45] €/);
  expect(casada).not.toContain('28.150');

  // Pensión 18.000 €: reducción 1.992,15 €, base 14.007,85 €, cuota 1.684,88 € (CASO 11);
  // con el mínimo de ≥65 (6.700 €): 2.739,38 − 6.700 × 19 % (1.273) = 1.466,38 €
  const pension = await texto('pension-18000');
  expect(pension).toContain('1992,15 €');
  expect(pension).toContain('1684,88 €');
  expect(pension).toContain('1466,38 €');
  expect(pension).not.toContain('5293,00 €');

  // Autónomo, 35.000 € netos: escala(35.000) = 4.225,50 + 14.800 × 30 % = 8.665,50 € · − 1.054,50 = 7.611,00 €
  const autonomo = await texto('autonomo-35000');
  expect(autonomo).toContain('7611,00 €');
  expect(autonomo).not.toContain('25.490');
});

test('CASO 15 · hallazgo 1315: el bloque educativo no dice que el mínimo reduzca la base', async ({ page }) => {
  const tarjetas = limpiar((await page.locator('[class*="guideGrid"]').textContent()) ?? '');
  expect(tarjetas).toContain('7302 €');
  expect(tarjetas).not.toContain('6.498');
  expect(tarjetas).toContain('No reduce la base');
  expect(tarjetas).not.toContain('reduce la base liquidable');
});

test('CASO 16 · hallazgo 1316: el FAQPage publica la escala que aplica la app, con el tramo del 47 %', async ({ page }) => {
  const faqs = await page.locator('script[type="application/ld+json"]').allTextContents();
  const faq = faqs.find((t) => t.includes('"FAQPage"')) ?? '';
  expect(faq).toContain('más de 300.000 € al 47 %');
  expect(faq).not.toContain('22,5');
  // Base de 40.000 €: marginal 37 % · efectivo (escala(40.000) − 1.054,50) / 40.000
  //   escala(40.000) = 8.725,50 + 4.800 × 37 % = 10.501,50 € → 9.447 / 40.000 = 23,62 %
  expect(faq).toContain('el marginal es el 37 %');
  expect(faq).toContain('23,62 %');
});

test('CASO 17 · hallazgo 1317: la tabla educativa de tramos sale de TRAMOS_IRPF_2025', async ({ page }) => {
  const tabla = page.locator('table[class*="tramosOrientativos"]').first();
  const filas = tabla.locator('tbody tr');
  await expect(filas).toHaveCount(6);
  await expect(filas.last().locator('td').nth(0)).toHaveText(/^300\.000\s€$/);
  await expect(filas.last().locator('td').nth(2)).toHaveText('47 %');
});

test('CASO 18 · hallazgo 1318: los emojis junto a texto llevan aria-hidden', async ({ page }) => {
  const aviso = page.locator('h3', { hasText: 'Herramienta de Orientación' });
  await expect(aviso.locator('span[aria-hidden="true"]')).toHaveText('⚠️');
  for (const n of ['1️⃣', '2️⃣', '3️⃣', '4️⃣']) {
    await expect(page.locator('h4 > span[aria-hidden="true"]', { hasText: n })).toHaveCount(1);
  }
});

// ═════════════════════════════════════════════════════════════════════════════
// Inspector 25/09/2026 — re-inspección tras el cambio del art. 20 en data/fiscal
// (reducción medida antes de los 2.000 € de la letra f), commit 8a6fb75b).
// CASOS 19 y 20 pasan; el CASO 21 y los HALLAZGOS van con test.fail(): afirman lo
// correcto y hoy fallan. Al repararlos se quita la marca y quedan como regresión.
// ═════════════════════════════════════════════════════════════════════════════

/** El aviso propio de la app (no el de DisclaimerCard ni el anunciador de rutas). */
const avisoApp = (page: Page) =>
  page.getByRole('button', { name: 'Estimar IRPF', exact: true }).locator('xpath=../following-sibling::div[@role="alert"][1]');

/** Párrafo de respuesta de una pregunta del bloque educativo. */
const parrafo = (page: Page, pregunta: string) =>
  page.locator('h4', { hasText: pregunta }).locator('xpath=following-sibling::p[1]');

/** Relación de contraste WCAG del texto de un elemento contra su fondo REAL compuesto. */
async function contrasteDe(elemento: Locator): Promise<number> {
  return elemento.evaluate((el) => {
    const aRgba = (c: string): number[] => {
      const m = c.match(/rgba?\(([^)]+)\)/);
      if (!m) return [255, 255, 255, 1];
      const v = m[1].split(/[ ,/]+/).filter(Boolean).map(Number);
      return [v[0], v[1], v[2], v.length > 3 ? v[3] : 1];
    };
    const mezclar = (arriba: number[], abajo: number[]): number[] => [
      arriba[0] * arriba[3] + abajo[0] * (1 - arriba[3]),
      arriba[1] * arriba[3] + abajo[1] * (1 - arriba[3]),
      arriba[2] * arriba[3] + abajo[2] * (1 - arriba[3]),
      1,
    ];
    const capas: number[][] = [];
    for (let n: Element | null = el; n; n = n.parentElement) {
      const c = aRgba(getComputedStyle(n).backgroundColor);
      if (c[3] > 0) {
        capas.push(c);
        if (c[3] >= 1) break;
      }
    }
    let fondo = [255, 255, 255, 1];
    for (let i = capas.length - 1; i >= 0; i--) fondo = mezclar(capas[i], fondo);
    const texto = mezclar(aRgba(getComputedStyle(el).color), fondo);
    const lum = (c: number[]): number => {
      const f = (x: number): number => {
        const s = x / 255;
        return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
      };
      return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]);
    };
    const l1 = lum(texto);
    const l2 = lum(fondo);
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  });
}

test('CASO 19 (normal) · 32.000 €, casado/a con dos ingresos, 1 hijo menor de 3 años, 5.000 € retenidos → a devolver 4,12 €', async ({ page }) => {
  // SS 2025: 32.000 × 6,47 % = 2.070,40 € (2.666,67 €/mes, bajo la base máxima de 4.909,50 €)
  // Reducción art. 20: se mide sobre 32.000 − 2.070,40 = 29.929,60 € ≥ 19.747,5 € → 0 €
  // Base general = 29.929,60 − 2.000 (art. 19.2.f) = 27.929,60 €
  // Mínimo (arts. 57, 58 y 61.1.ª, MINIMOS_IRPF_2025): 5.550 + (2.400 + 2.800) / 2 = 8.150,00 €.
  //   El incremento por menor de 3 años (art. 58.2) es parte del mínimo por descendientes, así
  //   que también se reparte entre los dos progenitores que declaran por separado.
  // escala(27.929,60) = 4.225,50 + 7.729,60 × 30 % = 6.544,38 € · escala(8.150) = 8.150 × 19 % = 1.548,50 €
  // Cuota íntegra = 4.995,88 € · DA 61.ª: 32.000 ≥ 18.276 € → sin deducción
  // Diferencial = 4.995,88 − 5.000 = −4,12 € → A DEVOLVER 4,12 €
  // Tipo efectivo = 4.995,88 / 27.929,60 = 17,89 %
  // (Sin repartir el incremento del menor de 3 años el mínimo sería 9.550 € y saldrían 270,12 € a devolver.)
  await estimar(page, { bruto: '32000', retenciones: '5000', situacion: 'casado_dos_ingresos', hijos: '1', hijosM3: '1' });

  expect(await tarjeta(page, 'Base imponible general')).toBe('27.929,60€');
  expect(await tarjeta(page, 'Mínimos personales')).toBe('8150,00€');
  expect(await tarjeta(page, 'Cuota íntegra')).toBe('4995,88€');
  expect(await tarjeta(page, 'Tipo efectivo')).toMatch(/^17,89\s?%$/);
  await expect(page.locator(SEL_ETIQUETA_FINAL).first()).toHaveText('Resultado estimado: A DEVOLVER');
  expect(limpiar(await page.locator(SEL_IMPORTE_FINAL).innerText())).toBe('4,12 €');
});

test('CASO 20 (límite) · 0 € de trabajo y 350.000 € de dividendos: último tramo del ahorro al 30 % y el mínimo entero en esa base', async ({ page }) => {
  // Escala del ahorro 2025 (art. 66 en la redacción de la Ley 7/2024; TRAMOS_GANANCIAS_PATRIMONIALES_2025):
  //   6.000 × 19 % = 1.140 · 44.000 × 21 % = 9.240 · 150.000 × 23 % = 34.500 ·
  //   100.000 × 27 % = 27.000 · 50.000 × 30 % = 15.000 → escala(350.000) = 86.880,00 €
  // Base general 0 → el mínimo (5.550 €) entero pasa a la del ahorro (art. 56.2):
  //   escala del ahorro(5.550) = 5.550 × 19 % = 1.054,50 €
  // Cuota íntegra = 86.880 − 1.054,50 = 85.825,50 € → A PAGAR 85.825,50 €
  // Tipo efectivo = 85.825,50 / 350.000 = 24,52 %
  // (Con el 28 % de 2024 en el último tramo saldrían 84.825,50 €; sin pasar el mínimo al ahorro, 86.880,00 €.)
  await estimar(page, { bruto: '0', capital: '350000' });

  expect(await tarjeta(page, 'Base del ahorro')).toBe('350.000,00€');
  expect(await tarjeta(page, 'Cuota íntegra')).toBe('85.825,50€');
  expect(await tarjeta(page, 'Tipo efectivo')).toMatch(/^24,52\s?%$/);
  await expect(page.locator(SEL_ETIQUETA_FINAL).first()).toHaveText('Resultado estimado: A PAGAR');
  expect(limpiar(await page.locator(SEL_IMPORTE_FINAL).innerText())).toBe('85.825,50 €');

  const ultima = page.locator('table[class*="tramosTable"]').last().locator('tbody tr').last();
  const celdas = (await ultima.locator('td').allInnerTexts()).map(limpiar);
  expect(celdas[0]).toBe('300.000,00 €');
  expect(celdas[1]).toBe('En adelante');
  expect(celdas[2]).toMatch(/^30\s?%$/);   // el espacio lo vigila el HALLAZGO del % pegado
  expect(celdas[3]).toBe('50.000,00 €');
  expect(celdas[4]).toBe('15.000,00 €');
  const nota = page.locator('css=p:has-text("Cuota íntegra del ahorro")');
  await expect(nota).toContainText('86.880,00');
  await expect(nota).toContainText('1054,50');
});

test('CASO 21 (rechazo) · unas retenciones ilegibles («4.928.70») no pueden estimarse como 0 €', async ({ page }) => {
  // HALLAZGO medio (Inspector 25/09/2026)
  test.fail();
  // «4.928.70» no es un número para el parser canónico (dos puntos y el último grupo de dos
  // cifras: parseSpanishNumber → NaN) y el campo lo conserva tras el blur. La app hace `|| 0` y
  // estima con 0 € retenidos: «A PAGAR 4928,70 €», la cuota íntegra entera de 30.000 € (CASO 4),
  // cuando quien lo tecleó quería declarar 4.928,70 € ya retenidos (resultado ≈ 0 €). Lo mismo
  // pasa con un capital ilegible («1.2.3») junto a un bruto válido. Lo correcto es lo que ya hace
  // con el bruto ilegible (CASO 8): no estimar y avisar.
  await estimar(page, { bruto: '30000', retenciones: '4.928.70' });
  await expect(page.locator(SEL_RETENCIONES)).toHaveValue('4.928.70');
  await expect(page.locator(SEL_IMPORTE_FINAL).or(avisoApp(page).locator('p')).first()).toBeVisible();

  await expect(page.locator(SEL_IMPORTE_FINAL)).toHaveCount(0);   // hoy: «4928,70 €» a pagar
  await expect(avisoApp(page)).not.toBeEmpty();
});

test('HALLAZGO · «0,5» hijos a cargo se estima como 0 hijos sin decir nada', async ({ page }) => {
  // HALLAZGO bajo (Inspector 25/09/2026)
  test.fail();
  // El campo admite decimales (NumberInput) y conserva «0,5» tras el blur, pero la página lo lee
  // con parseInt('0,5') = 0: el mínimo queda en 5.550 € (sin descendiente) y la cuota en
  // 4.928,70 € (CASO 4), como si no hubiera hijo. Quien tiene la custodia compartida y teclea
  // «0,5» pierde el mínimo entero: con «1» y «Casado/a (dos ingresos)» serían 5.550 + 1.200 =
  // 6.750 € (art. 61.1.ª), 228 € menos de cuota. Un número de hijos no entero se rechaza.
  await estimar(page, { bruto: '30000', situacion: 'casado_dos_ingresos', hijos: '0,5' });
  await expect(page.locator(SEL_HIJOS)).toHaveValue('0,5');
  await expect(page.locator(SEL_IMPORTE_FINAL).or(avisoApp(page).locator('p')).first()).toBeVisible();

  await expect(page.locator(SEL_IMPORTE_FINAL)).toHaveCount(0);   // hoy: resultado con 0 hijos
  await expect(avisoApp(page)).not.toBeEmpty();
});

test('HALLAZGO · el pie del aviso imprime la fecha de verificación en ISO («2026-09-09»)', async ({ page }) => {
  // HALLAZGO bajo (Inspector 25/09/2026) — misma forma que el hallazgo 1657 de estimador-sueldo-neto.
  test.fail();
  // FISCAL_IRPF_META.verificado = '2026-09-09' (data/fiscal/irpf.ts). DataReference, en la misma
  // página, la formatea: «Última verificación: 09/09/2026». El pie del aviso la pega tal cual:
  // «Datos verificados: 2026-09-09 | Ejercicio calculado: 2025» (page.tsx, `disclaimerFecha`).
  const referencia = limpiar(await page.getByRole('note', { name: 'Datos de referencia normativos' }).innerText());
  const fecha = (referencia.match(/Última verificación: (\d{2}\/\d{2}\/\d{4})/) ?? [])[1] ?? '';
  expect(fecha).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);   // montaje: DataReference sí da DD/MM/AAAA (hoy 09/09/2026)

  await expect(page.locator('p', { hasText: 'Datos verificados:' })).toHaveText(
    `Datos verificados: ${fecha} | Ejercicio calculado: 2025`,
  );
});

test('HALLAZGO · el % del desglose por tramos va pegado a la cifra («19%»)', async ({ page }) => {
  // HALLAZGO bajo (Inspector 25/09/2026): desde el 25/09/2026 el % va separado con espacio duro
  // (CLAUDE.md global §2). Base general de 30.000 € → tramos 19, 24 y 30; 8.000 € de capital →
  // tramos del ahorro 19 y 21. Hoy las cinco celdas dicen «19%», «24%», «30%», «19%», «21%».
  test.fail();
  await estimar(page, { bruto: '30000', capital: '8000' });
  const tipos = page.locator('table[class*="tramosTable"] tbody tr td:nth-child(3)');
  await expect(tipos).toHaveCount(5);   // montaje: las dos tablas del resultado

  expect(await tipos.allTextContents()).toEqual(['19 %', '24 %', '30 %', '19 %', '21 %']);
});

test('HALLAZGO · en oscuro, el --primary local del módulo anula el de globals.css y el texto de marca baja a 3,5:1', async ({ page }) => {
  // HALLAZGO medio (Inspector 25/09/2026). EstimadorIRPF.module.css redeclara --primary: #2E86AB
  // en .container y no lo redeclara en [data-theme='dark'] .container, así que en oscuro tapa el
  // #3FA5D1 de globals.css. Medido: enlace del aviso #2E86AB sobre #2D2A1A = 3,51:1 (14,4 px);
  // título «Desglose por tramos» #2E86AB sobre #2A2A2A = 3,50:1 (17,6 px negrita, no es texto
  // grande). Con el #3FA5D1 de globals el título daría ≈ 5,1:1.
  test.fail();
  await page.addInitScript(() => {
    try {
      localStorage.setItem('meskeia-theme', 'dark');
    } catch {
      /* sin almacenamiento no hay tema oscuro que medir */
    }
  });
  await page.goto(RUTA);
  await esperarPaginaAsentada(page);
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await esperarHidratacion(page, [SEL_BRUTO]);
  await estimar(page, { bruto: '30000' });

  const enlaceAviso = page.locator('h3', { hasText: 'Herramienta de Orientación' }).locator('xpath=..').getByRole('link').first();
  const tituloTramos = page.getByRole('heading', { level: 3, name: /Desglose por tramos IRPF/ });
  await expect(tituloTramos).toBeVisible();
  expect(await contrasteDe(enlaceAviso)).toBeGreaterThanOrEqual(4.5);   // hoy 3,51
  expect(await contrasteDe(tituloTramos)).toBeGreaterThanOrEqual(4.5);  // hoy 3,50
});

test('HALLAZGO · en claro, el texto de marca y el blanco sobre marca no llegan a 4,5:1', async ({ page }) => {
  // HALLAZGO bajo (Inspector 25/09/2026). Medido en claro: consejo del FAQ (.faqTip, #48A9A6 sobre
  // #EDF6F6, 13,2 px) = 2,55:1; enlace del aviso (#2E86AB sobre #FFF3CD) = 3,71:1; botón «Estimar
  // IRPF» (blanco sobre #2E86AB, 16 px) = 4,11:1. globals.css ya trae --primary-texto,
  // --secondary-texto y --primary-boton para esto.
  test.fail();
  await esperarPaginaAsentada(page);
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');

  const enlaceAviso = page.locator('h3', { hasText: 'Herramienta de Orientación' }).locator('xpath=..').getByRole('link').first();
  expect(await contrasteDe(page.locator('[class*="faqTip"]'))).toBeGreaterThanOrEqual(4.5);   // hoy 2,55
  expect(await contrasteDe(enlaceAviso)).toBeGreaterThanOrEqual(4.5);                           // hoy 3,71
  expect(await contrasteDe(page.getByRole('button', { name: 'Estimar IRPF', exact: true }))).toBeGreaterThanOrEqual(4.5); // hoy 4,11
});

test('HALLAZGO (dato) · el umbral del segundo pagador y los límites del plan de pensiones están tecleados a mano', async ({ page }) => {
  // HALLAZGO bajo (Inspector 25/09/2026). OBLIGACION_DECLARAR_2025.trabajo.limiteSegundoPagador =
  // 1500 (data/fiscal/irpf.ts): la tabla comparativa lo imprime desde data/fiscal con el
  // formateador de la página, «más de 1500 €» (cuatro cifras sin punto, RAE 2010). El FAQ de los
  // dos pagadores y el consejo del modelo 145 lo llevan escrito a mano: «1.500 €». Igual los
  // límites del plan de pensiones (LIMITES_PLAN_PENSIONES_2025: 1500 / 8500 / 10.000 €, en el FAQ
  // y en un consejo) y la deducción por maternidad (DEDUCCION_MATERNIDAD_IRPF: 1200, 100 y 1000 €).
  test.fail();
  await expect(page.locator('table[class*="comparativaTable"]')).toContainText('más de 1500 €');   // montaje

  const pagadores = limpiar((await parrafo(page, '¿Cómo afecta tener dos pagadores').textContent()) ?? '');
  const plan = limpiar((await parrafo(page, '¿Puedo deducir el plan de pensiones').textContent()) ?? '');
  expect(pagadores).toMatch(/más de 1500(,00)? €/);   // hoy «más de 1.500 €»
  expect(plan).toMatch(/1500(,00)? € anuales/);       // hoy «1.500 € anuales»
  expect(plan).toMatch(/8500(,00)? €/);               // hoy «8.500 €»
});

test('HALLAZGO · el FAQ de la deducción por maternidad deja fuera a quien cobraba el desempleo al nacer el hijo', async ({ page }) => {
  // HALLAZGO medio (Inspector 25/09/2026). DEDUCCION_MATERNIDAD_IRPF.situacionesConDerecho
  // (data/fiscal/maternidad.ts; art. 81 LIRPF en la redacción de la Ley 31/2022, desde el
  // 01/01/2023): de alta en la SS o mutualidad, percibiendo prestación o subsidio de desempleo al
  // nacer el menor, o alta posterior con 30 días cotizados. El FAQ dice «para madres trabajadoras
  // que coticen a la SS», la redacción anterior a 2023.
  test.fail();
  const texto = limpiar((await parrafo(page, '¿Qué es la deducción por maternidad').textContent()) ?? '');
  expect(texto).toContain('menor de 3 años');   // montaje: es el párrafo de la deducción
  expect(texto).toMatch(/desempleo/);
});
