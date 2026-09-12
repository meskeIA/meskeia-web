import { test, expect, Page } from '@playwright/test';

/**
 * visualizador-sueldo-neto — regresión del mínimo personal (art. 63.1.2.º LIRPF)
 * Escrita el 12/09/2026, tras reparar el defecto.
 *
 * QUÉ DEFECTO VIGILA
 * ──────────────────
 * La app calculaba `baseGravable = baseImponible − minimoPersonal` y aplicaba la escala a ese
 * resto, que valora el mínimo al tipo marginal. El art. 63.1.2.º dice que el mínimo no reduce
 * la renta: forma parte de la base liquidable general y se grava a TIPO CERO, aplicando la
 * escala a la base COMPLETA y restando de la cuota la misma escala aplicada al mínimo.
 * Subestimaba la cuota en 610,50 €/año con 30.000 € de bruto y en 1.443 € desde 80.000 €.
 *
 * Norma verificada en sesión el 12/09/2026 contra la AEAT (manual de ayuda de Renta 2025,
 * «8.4.3.1 Cuota íntegra estatal» y «8.4.3.2 Cuota íntegra autonómica»).
 *
 * El caso se resolvió a mano ANTES de ejecutar la app; la aritmética va en el test.
 *
 * ⚠️ HALLAZGO COLATERAL, NO REPARADO AQUÍ — el tope de la base de cotización
 * `calcularSueldo` usa `pagas = 14` también para la Seguridad Social: base mensual = bruto/14,
 * y luego multiplica por 14. Mientras la base no llega al tope da lo mismo que dividir entre 12
 * (bruto/14 × 14 = bruto), pero POR ENCIMA del tope no: con 150.000 € de bruto la app cotiza
 * 4.642,09 €/año donde la base máxima de 5.101,20 €/mes sobre 12 liquidaciones da 3.978,94 €.
 * Son 663,15 € de más. La cotización en España se liquida mensualmente (12 veces), con las
 * pagas extras PRORRATEADAS dentro de la base mensual, y el tope se aplica a esa base.
 *
 * Es un defecto distinto —Orden de cotización y LGSS, no el art. 63 LIRPF— y queda FUERA de
 * esta reparación, que es la del mínimo personal. Se deja escrito aquí para que no se pierda,
 * y por eso el caso 3 se queda en 71.000 €: por debajo del tope, donde el neto no depende de
 * qué divisor se use y el golden se puede derivar de la ley sin arrastrar el otro problema.
 *
 * ⚠️ El bruto es un `input[type=range]` controlado por React: ni `fill()` ni asignar el valor
 * disparan su `onChange`, así que el slider se mueve con el teclado (ver `ponerBruto`).
 */

const RUTA = '/visualizador-sueldo-neto/';

const ESPACIO_DURO = new RegExp(String.fromCharCode(160), 'g');
const limpiar = (s: string) => s.replace(ESPACIO_DURO, ' ').replace(/\s+/g, ' ').trim();

/**
 * Mueve el slider del bruto. `fill()` no sirve sobre un `input[type=range]` controlado por
 * React —cambia el atributo pero no dispara el `onChange`, y la página se queda en su valor
 * inicial de 30.000 € haciendo pasar el test por accidente—, así que se usa el teclado, que es
 * además lo que haría una persona navegando sin ratón. `End` lleva al máximo (150.000 €) y
 * cada `ArrowLeft` baja un paso de 1.000 €.
 */
async function ponerBruto(page: Page, euros: number): Promise<void> {
  const slider = page.getByRole('slider').first();
  await slider.focus();
  await page.keyboard.press('End');
  for (let v = 150000; v > euros; v -= 1000) await page.keyboard.press('ArrowLeft');
}

/** Valor de un ítem de la cascada, localizado por su etiqueta exacta. */
async function cascada(page: Page, etiqueta: string): Promise<string> {
  const info = page.locator(`css=div:has(> span:text-is("${etiqueta}"))`).first();
  return limpiar(await info.locator('span').nth(1).innerText());
}

test.beforeEach(async ({ page }) => {
  await page.goto(RUTA);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Tu Sueldo Bruto a Neto, Paso a Paso');
});

// ─────────────────────────────────────────────────────────────────────────────
test('CASO 1 · 30.000 € brutos (valor por defecto)', async ({ page }) => {
  // SS: base 2.500 €/mes × 6,50 % × 12 = 1.950,00 €
  // RNT = 30.000 − 1.950 − 2.000 = 26.050,00 € → reducción art. 20 = 0 € (supera 19.747,5 €)
  // Base liquidable general = 26.050,00 €, CON el mínimo de 5.550 € dentro.
  //   escala(26.050) = 12.450×19 % + 7.750×24 % + 5.850×30 % = 5.980,50 €
  //   escala(5.550)  = 5.550×19 %                            = 1.054,50 €
  //   cuota íntegra  = 5.980,50 − 1.054,50                   = 4.926,00 €
  // Deducción art. 80 bis: 0 € (RNT 26.050 € > 18.276 €)
  // Neto anual = 30.000 − 1.950 − 4.926 = 23.124,00 € → 1.927,00 €/mes
  //
  // El método defectuoso daba escala(26.050 − 5.550) = 4.315,50 €: 610,50 € menos, y un neto
  // de 23.734,50 € que la app publicaba como el sueldo que se cobra.
  expect(await cascada(page, 'Sueldo bruto anual')).toBe('30.000,00 €');
  expect(await cascada(page, 'Seguridad Social')).toBe('− 1950,00 €');
  expect(await cascada(page, 'Retención IRPF')).toBe('− 4926,00 €');
  expect(await cascada(page, 'Tu sueldo neto anual')).toBe('23.124,00 €');

  // El desglose por tramos es el de la PRIMERA aplicación de la escala, sobre la base entera,
  // así que suma 5.980,50 € y no la cuota final. La nota lo dice y lo cuadra.
  const nota = page.locator('css=p:has-text("art. 63.1.2.º LIRPF")').first();
  await expect(nota).toContainText('5980,50');   // lo que suman los tramos
  await expect(nota).toContainText('5550,00');   // el mínimo personal
  await expect(nota).toContainText('1054,50');   // la escala aplicada al mínimo
  await expect(nota).toContainText('4926,00');   // la cuota íntegra
});

// ─────────────────────────────────────────────────────────────────────────────
test('CASO 2 · el tramo del 30 % aparece porque la base lleva el mínimo dentro', async ({ page }) => {
  // Invariante estructural del art. 63.1.2.º: los tramos se aplican a la base ENTERA.
  // Con 30.000 € de bruto la base es 26.050 €, que entra en el tercer tramo (20.200-35.200 €)
  // por 5.850 €. Con el método defectuoso la base era 20.500 € y ese tramo solo recibía 300 €.
  // Si algún día vuelve a aparecer 300,00 € en la última fila, el mínimo se restó de la base.
  const tramos = page.locator('css=div:has(> p:text-is("Desglose por tramos IRPF"))').first();
  await expect(tramos).toBeVisible();

  const filas = tramos.locator('css=div[class*="tramoItem"]');
  await expect(filas).toHaveCount(3);
  await expect(filas.nth(0)).toContainText('12.450,00');
  await expect(filas.nth(1)).toContainText('7750,00');
  await expect(filas.nth(2)).toContainText('al 30%');
  await expect(filas.nth(2)).toContainText('5850,00');
  await expect(filas.nth(2)).toContainText('1755,00');   // 5.850 × 30 %
});

// ─────────────────────────────────────────────────────────────────────────────
test('CASO 3 · 71.000 € brutos: el mínimo cae entero en el tramo del 45 %', async ({ page }) => {
  // Es el caso donde el defecto valía su máximo: con el marginal en el 45 %, restar el mínimo
  // de la base lo valoraba a ese tipo (5.550 × 45 % = 2.497,50 €) en vez de al 19 % de la
  // escala (1.054,50 €). Diferencia: 1.443,00 €/año, el techo del defecto.
  //
  // SS: 71.000 / 14 = 5.071,43 €/mes, aún por debajo de la máxima → SS = 71.000 × 6,50 % = 4.615,00 €
  // RNT = 71.000 − 4.615 − 2.000 = 64.385,00 € → reducción art. 20 = 0 €
  //   escala(64.385) = 17.901,50 (acumulado hasta 60.000) + 4.385×45 %
  //                  = 17.901,50 + 1.973,25 = 19.874,75 €
  //   escala(5.550)  = 1.054,50 €
  //   cuota íntegra  = 18.820,25 €
  // Neto anual = 71.000 − 4.615 − 18.820,25 = 47.564,75 €
  await ponerBruto(page, 71000);

  expect(await cascada(page, 'Sueldo bruto anual')).toBe('71.000,00 €');
  expect(await cascada(page, 'Seguridad Social')).toBe('− 4615,00 €');
  expect(await cascada(page, 'Retención IRPF')).toBe('− 18.820,25 €');
  expect(await cascada(page, 'Tu sueldo neto anual')).toBe('47.564,75 €');

  // Y la nota deja a la vista la diferencia entre los dos métodos: los tramos suman 19.874,75 €
  // y de ahí se resta 1.054,50 €, no 2.497,50 €.
  const nota = page.locator('css=p:has-text("art. 63.1.2.º LIRPF")').first();
  await expect(nota).toContainText('19.874,75');
  await expect(nota).toContainText('1054,50');
  await expect(nota).toContainText('18.820,25');
});
