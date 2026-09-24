import { test, expect, Page } from '@playwright/test';
import { esperarHidratacion, esperarValorEnReact } from './_hidratacion';

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
  // RNT = 17.500 − 1.132,25 − 2.000 = 14.367,75 € ≤ 14.852 → reducción art. 20 = 7.302 €
  // Base = 7.065,75 € → cuota íntegra = 1.515,75 × 19 % = 287,99 €
  // Deducción DA 61.ª sobre los ÍNTEGROS: 340 − 0,2 × (17.500 − 16.576) = 155,20 € — la misma
  //   cifra que da la AEAT para 17.500 € en el Ejemplo 3 del Manual Renta 2025. Hasta el
  //   24/09/2026 la app la calculaba sobre el neto (14.367,75 € ≤ 14.852) y daba 340 €.
  // Cuota tras deducción = 287,99 − 155,20 = 132,79 € → A DEVOLVER 500 − 132,79 = 367,21 €
  await estimar(page, { bruto: '17500', retenciones: '500' });

  expect(euros(await tarjeta(page, 'Cuota íntegra'))).toBeCloseTo(287.99, 1);
  expect(await tarjeta(page, 'Deducción rentas bajas')).toBe('-155,20€');
  await expect(page.locator(SEL_ETIQUETA_FINAL).first()).toHaveText('Resultado estimado: A DEVOLVER');
  expect(euros(await page.locator(SEL_IMPORTE_FINAL).innerText())).toBeCloseTo(367.21, 1);
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
  // 18.000 € de pensión: sin cotización. RNT = 18.000 − 2.000 = 16.000 €
  // Reducción art. 20 = 7.302 − 1,75 × (16.000 − 14.852) = 5.293,00 € → base 10.707,00 €
  // Cuota íntegra = (10.707 − 5.550) × 19 % = 979,83 €. Sin deducción por rendimientos del
  // trabajo: la AEAT la limita a los «derivados de la prestación efectiva de servicios».
  await estimar(page, { bruto: '18000', sinNomina: true });

  expect(await tarjeta(page, 'Base imponible general')).toBe('10.707,00€');
  expect(await tarjeta(page, 'Cuota íntegra')).toBe('979,83€');
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

  // Pensión 18.000 €: reducción 5.293 €, base 10.707 €, cuota 979,83 € (CASO 11);
  // con el mínimo de ≥65 (6.700 €): (10.707 − 6.700) × 19 % = 761,33 €
  const pension = await texto('pension-18000');
  expect(pension).toContain('5293,00 €');
  expect(pension).toContain('979,83 €');
  expect(pension).toContain('761,33 €');

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
