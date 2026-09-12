import { test, expect, Page } from '@playwright/test';

/**
 * simulador-desglose-nomina — regresión del mínimo personal y familiar (art. 63.1.2.º LIRPF)
 * Escrita el 12/09/2026, tras reparar el defecto.
 *
 * QUÉ DEFECTO VIGILA
 * ──────────────────
 * La app restaba el mínimo personal y familiar DE LA BASE antes de aplicar la escala, lo que
 * lo valora al tipo marginal. El art. 63.1.2.º dice lo contrario: el mínimo no reduce la
 * renta, forma parte de la base liquidable general y se grava a TIPO CERO aplicando la escala
 * dos veces —a la base completa y al mínimo— y restando la segunda cuota de la primera.
 * Subestimaba la cuota en 610,50 €/año en el caso 1 y en 1.917 €/año en el caso 2.
 *
 * Norma verificada en sesión el 12/09/2026 contra la AEAT, manual de ayuda de Renta 2025,
 * «8.4.3.1 Cuota íntegra estatal»: «A la base liquidable general (sin descontar el importe del
 * mínimo personal y familiar) se le aplicarán los tipos correspondientes a la escala general
 * del impuesto […]. Se aplicará la misma escala a la parte de base liquidable general
 * correspondiente al mínimo personal y familiar […]. Se restará a la cuota resultante del
 * apartado 1 la cuota resultante del apartado 2.»
 *
 * DE DÓNDE SALE CADA CIFRA — de la norma, NO de lo que devuelve la app
 * ───────────────────────────────────────────────────────────────────
 *   · escala art. 63: 12.450 @19 % · 20.200 @24 % · 35.200 @30 % · 60.000 @37 % · 300.000 @45 %
 *   · mínimos art. 57-58: personal 5.550 € · hijo 1.º 2.400 € · hijo 2.º 2.700 €
 *   · gastos art. 19.2.f: 2.000 € · reducción art. 20: 0 € por encima de 19.747,5 € de RNT
 *   · cotización trabajador 2026: 4,70 + 1,55 + 0,10 + 0,15 = 6,50 %
 *
 * Los dos casos se resolvieron a mano ANTES de ejecutar la app. La aritmética completa va en
 * cada test: si la app no cuadra con ella, el defecto es de la app.
 */

const RUTA = '/simulador-desglose-nomina/';

const ESPACIO_DURO = new RegExp(String.fromCharCode(160), 'g');
const limpiar = (s: string) => s.replace(ESPACIO_DURO, ' ').replace(/\s+/g, ' ').trim();

/** Importe de un paso de la cascada, buscándolo por el principio de su etiqueta. */
async function pasoCascada(page: Page, etiqueta: string): Promise<string> {
  const li = page.locator('li').filter({ hasText: etiqueta }).first();
  return limpiar(await li.locator('div').last().innerText());
}

/**
 * El bruto es un `input[type=range]`, y `fill()` sobre un slider no dispara el `onChange` de
 * React: la página se quedaba en su valor inicial de 30.000 € y el test pasaba por accidente.
 * Se usan los perfiles de ejemplo, que fijan el bruto con un clic — 30.000 € «Mediano» y
 * 60.000 € «Alto» son dos de los cuatro.
 */
async function configurar(page: Page, perfil: string, situacion: string, pagas: string): Promise<void> {
  await page.getByRole('button', { name: new RegExp(`^Cargar perfil ${perfil} `) }).click();
  await page.locator('#situacion-select').selectOption(situacion);
  await page.locator('#pagas-select').selectOption(pagas);
}

test.beforeEach(async ({ page }) => {
  await page.goto(RUTA);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Simulador Desglose de Nómina');
});

// ─────────────────────────────────────────────────────────────────────────────
test('CASO 1 · 30.000 € brutos, soltero/a, 14 pagas', async ({ page }) => {
  // SS: base 2.500 €/mes (entre la mínima 1.424,40 y la máxima 5.101,20) × 6,50 % × 12 = 1.950,00 €
  // RNT = 30.000 − 1.950 − 2.000 = 26.050,00 € → reducción art. 20 = 0 € (supera 19.747,5 €)
  // Base liquidable general = 26.050,00 €, CON el mínimo dentro.
  //   escala(26.050) = 12.450×19 % + 7.750×24 % + 5.850×30 %
  //                  = 2.365,50 + 1.860,00 + 1.755,00 = 5.980,50 €
  //   escala(5.550)  = 5.550×19 %                      = 1.054,50 €
  //   cuota íntegra  = 5.980,50 − 1.054,50             = 4.926,00 €
  // Deducción art. 80 bis: 0 € (RNT 26.050 € > 18.276 €)
  // Neto anual = 30.000 − 1.950 − 4.926 = 23.124,00 € → 1.651,71 €/mes en 14 pagas
  //
  // El método defectuoso daba escala(26.050 − 5.550) = 4.315,50 €: 610,50 € menos.
  await configurar(page, 'Mediano', 'soltero', '14');

  expect(await pasoCascada(page, '= Base Liquidable')).toBe('26.050,00 €');
  expect(await pasoCascada(page, 'Escala general aplicada a la base completa')).toBe('5980,50 €');
  expect(await pasoCascada(page, '− Escala aplicada al mínimo')).toBe('4926,00 €');
  expect(await pasoCascada(page, '= Salario NETO Anual')).toBe('23.124,00 €');

  // La resta del mínimo se anuncia en euros de CUOTA (1.054,50 €), no en euros de base.
  const paso = page.locator('li').filter({ hasText: '− Escala aplicada al mínimo' }).first();
  await expect(paso).toContainText('Se descuenta: 1054,50');
  // Y su etiqueta nombra el mínimo del caso: 5.550 € del art. 57, sin hijos.
  await expect(paso).toContainText('5550,00');
});

// ─────────────────────────────────────────────────────────────────────────────
test('CASO 2 · 60.000 € brutos, dos o más hijos, 14 pagas — el error crecía con el mínimo', async ({ page }) => {
  // SS: base 5.000 €/mes (aún por debajo de la máxima) × 6,50 % × 12 = 3.900,00 €
  // RNT = 60.000 − 3.900 − 2.000 = 54.100,00 € → reducción art. 20 = 0 €
  // Mínimo = 5.550 (personal) + 2.400 (hijo 1.º) + 2.700 (hijo 2.º) = 10.650,00 €
  //   escala(54.100) = 2.365,50 + 1.860,00 + 4.500,00 + 18.900×37 %
  //                  = 2.365,50 + 1.860,00 + 4.500,00 + 6.993,00 = 15.718,50 €
  //   escala(10.650) = 10.650×19 %                                = 2.023,50 €
  //   cuota íntegra  = 15.718,50 − 2.023,50                       = 13.695,00 €
  // Neto anual = 60.000 − 3.900 − 13.695 = 42.405,00 €
  //
  // El método defectuoso daba escala(54.100 − 10.650) = 11.778,00 €: 1.917,00 € menos.
  // El error crece con el mínimo porque es el mínimo entero lo que se valoraba al marginal.
  await configurar(page, 'Alto', 'dos_o_mas_hijos', '14');

  expect(await pasoCascada(page, '= Base Liquidable')).toBe('54.100,00 €');
  expect(await pasoCascada(page, 'Escala general aplicada a la base completa')).toBe('15.718,50 €');
  expect(await pasoCascada(page, '− Escala aplicada al mínimo')).toBe('13.695,00 €');
  expect(await pasoCascada(page, '= Salario NETO Anual')).toBe('42.405,00 €');

  const paso = page.locator('li').filter({ hasText: '− Escala aplicada al mínimo' }).first();
  await expect(paso).toContainText('Se descuenta: 2023,50');
  await expect(paso).toContainText('10.650,00');
});

// ─────────────────────────────────────────────────────────────────────────────
test('la tabla de tramos se aplica a la base ENTERA y lo dice', async ({ page }) => {
  // Invariante del art. 63.1.2.º sobre la presentación: el desglose por tramos es el de la
  // PRIMERA aplicación de la escala, así que suma más que la cuota final. Si algún día
  // volviera a sumar la cuota final, sería porque el mínimo se restó de la base otra vez.
  await configurar(page, 'Mediano', 'soltero', '14');

  const nota = page.locator('section', { has: page.getByRole('heading', { name: 'Tramos IRPF aplicados' }) });
  await expect(nota).toContainText('5980,50');   // lo que suman los tramos
  await expect(nota).toContainText('1054,50');   // la escala aplicada al mínimo
  await expect(nota).toContainText('4926,00');   // la cuota que queda
  await expect(nota).toContainText('art. 63.1.2.º LIRPF');

  // Y los tramos que se muestran llegan hasta el 30 %: con base 26.050 € entra en el tercero.
  // Con el método defectuoso la base era 20.500 € y el tercer tramo apenas asomaba.
  const filas = nota.locator('tbody tr');
  await expect(filas).toHaveCount(3);
  await expect(filas.nth(2)).toContainText('30 %');
  await expect(filas.nth(2)).toContainText('5850,00');   // 26.050 − 20.200
});
