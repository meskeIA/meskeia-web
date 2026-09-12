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
 * SEGUNDO DEFECTO, REPARADO EL MISMO DÍA — el tope de la base de cotización
 * ────────────────────────────────────────────────────────────────────────
 * `calcularSueldo` usaba `pagas = 14` también para la Seguridad Social: base mensual =
 * bruto/14, y luego multiplicaba por 14. Mientras la base no llega al tope da lo mismo que
 * dividir entre 12 —bruto/14 × 14 es bruto—, y por eso el defecto estuvo invisible; por
 * ENCIMA del tope, no. La app topaba la cotización en 71.416,80 € de bruto en vez de en
 * 61.214,40 €, y cobraba hasta 663,16 €/año de más: con 150.000 € publicaba 4.642,09 € donde
 * el tope de 5.101,20 €/mes sobre doce liquidaciones da 3.978,94 €. Como esa SS de más
 * rebajaba además la base del IRPF, el neto publicado salía unos 365 €/año por debajo del real.
 *
 * La norma se verificó en sesión el 12/09/2026 en la Seguridad Social («Bases y tipos de
 * cotización», art. 147 LGSS): la base mensual incluye «la parte proporcional de las pagas
 * extraordinarias», la liquidación es MENSUAL —doce al año— y los topes (1.424,40 € /
 * 5.101,20 € en 2026) se aplican a esa base mensual. No hay lectura en la que dividir entre
 * 14 sea correcto: la prorrata entra en la base tanto si las extras se pagan aparte como si no.
 *
 * Era el único sitio del catálogo que dividía entre 14. El barrido de los doce consumidores de
 * `BASES_SS_2026` dejó ver que `estimador-sueldo-neto`, `simulador-desglose-nomina`,
 * `estimador-smi`, `estimador-irpf` y `lib/calculadoras/sueldoNeto.ts` ya usaban 12, y que
 * `bajaMedica`, `costeEmpleado` y `simulador-jubilacion-publica` reciben ya un salario mensual
 * y no dividen nada. Un valor atípico, no una política.
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
test('CASO 3 · 71.000 € brutos: el mínimo cae entero en el tramo del 45 % y la base SS se topa', async ({ page }) => {
  // Los dos defectos a la vez, que es lo que hace útil este caso.
  //
  // Seguridad Social: 71.000 / 12 = 5.916,67 €/mes, POR ENCIMA de la máxima de 5.101,20 €,
  // así que la base se clava en el tope → SS = 5.101,20 × 6,50 % × 12 = 3.978,936 → 3.978,94 €.
  //   Con el divisor viejo la base era 71.000/14 = 5.071,43 €/mes, aún por debajo del tope, de
  //   modo que ni siquiera llegaba a topar: 4.615,00 €, que son 636,06 € de más.
  // RNT = 71.000 − 3.978,936 − 2.000 = 65.021,064 € → reducción art. 20 = 0 €
  //   escala(65.021,06) = 17.901,50 (acumulado hasta 60.000) + 5.021,064×45 %
  //                     = 17.901,50 + 2.259,4788 = 20.160,9788 €
  //   escala(5.550)     = 1.054,50 €   ← y NO 5.550 × 45 % = 2.497,50 €, que es lo que valía
  //                                      el método viejo del mínimo: 1.443,00 €/año de error
  //   cuota íntegra     = 19.106,4788 → 19.106,48 €
  // Neto anual = 71.000 − 3.978,936 − 19.106,4788 = 47.914,5852 → 47.914,59 €
  await ponerBruto(page, 71000);

  expect(await cascada(page, 'Sueldo bruto anual')).toBe('71.000,00 €');
  expect(await cascada(page, 'Seguridad Social')).toBe('− 3978,94 €');
  expect(await cascada(page, 'Retención IRPF')).toBe('− 19.106,48 €');
  expect(await cascada(page, 'Tu sueldo neto anual')).toBe('47.914,59 €');

  // Y la nota deja a la vista la diferencia entre los dos métodos del mínimo: los tramos suman
  // 20.160,98 € y de ahí se resta 1.054,50 €, no 2.497,50 €.
  const nota = page.locator('css=p:has-text("art. 63.1.2.º LIRPF")').first();
  await expect(nota).toContainText('20.160,98');
  await expect(nota).toContainText('1054,50');
  await expect(nota).toContainText('19.106,48');
});

// ─────────────────────────────────────────────────────────────────────────────
test('CASO 4 (límite) · 150.000 €: la SS no crece, el IRPF sí', async ({ page }) => {
  // El invariante del tope, que es lo que el divisor 14 rompía: pasados 61.214,40 € de bruto
  // (5.101,20 × 12) la cotización del trabajador SE CONGELA en 3.978,94 €/año, gane lo que
  // gane. Con el divisor viejo seguía creciendo hasta 71.416,80 € y se congelaba en 4.642,09 €.
  //
  // RNT = 150.000 − 3.978,936 − 2.000 = 144.021,064 € → reducción art. 20 = 0 €
  //   escala(144.021,06) = 17.901,50 + 84.021,064×45 % = 17.901,50 + 37.809,4788 = 55.710,9788 €
  //   escala(5.550)      = 1.054,50 €  →  cuota íntegra = 54.656,4788 → 54.656,48 €
  // Neto anual = 150.000 − 3.978,936 − 54.656,4788 = 91.364,5852 → 91.364,59 €
  await ponerBruto(page, 150000);

  expect(await cascada(page, 'Sueldo bruto anual')).toBe('150.000,00 €');
  expect(await cascada(page, 'Seguridad Social')).toBe('− 3978,94 €');   // la misma que con 71.000 €
  expect(await cascada(page, 'Retención IRPF')).toBe('− 54.656,48 €');
  expect(await cascada(page, 'Tu sueldo neto anual')).toBe('91.364,59 €');

  // Y el texto que acompaña a los sueldos altos nombra el tope ANUAL correcto: 61.214,40 €,
  // no los 71.416,80 € que publicaba antes (5.101,20 × 14).
  const insight = page.locator('css=p:has-text("deja de crecer")').first();
  await expect(insight).toContainText('61.214,40');
  await expect(insight).toContainText('5101,20');
});
