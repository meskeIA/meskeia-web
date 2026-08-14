import { test, expect, Page } from '@playwright/test';

/**
 * Inspector — estimador-compraventa-inmueble (segmento fiscal, riesgo 1 CRÍTICO)
 *
 * De dónde sale cada cifra esperada:
 *  - Tipos de ITP y AJD por CCAA, escalas progresivas y aranceles de notaría y registro:
 *    `data/itp-ccaa.ts` (ITP_CCAA, ARANCELES_NOTARIO y ARANCELES_REGISTRO, que citan los
 *    RD 1426/1989 y RD 1427/1989). Los tipos generales coinciden con TIPOS_ITP_CCAA_2025
 *    de `data/fiscal/inmuebles.ts`.
 *  - Plusvalía municipal: COEFICIENTES_IIVTNU_2025 y PLUSVALIA_MUNICIPAL_META.tipoOrientativo
 *    (`data/fiscal/inmuebles.ts`, RDL 26/2021), aplicados por calcularPlusvaliaMunicipal.
 *  - Ganancia patrimonial e IRPF: calcularGananciaInmueble (`data/fiscal/ganancia-inmueble.ts`,
 *    arts. 34-36 LIRPF) sobre TRAMOS_GANANCIAS_PATRIMONIALES_2025 (`data/fiscal/inmuebles.ts`:
 *    19 % hasta 6.000 · 21 % hasta 50.000 · 23 % hasta 200.000 · 27 % hasta 300.000 · 30 % resto).
 *
 * Todos los importes están resueltos a mano ANTES de ejecutar la app; el detalle del
 * cálculo va comentado junto a cada aserción.
 *
 * Nota de formato: `formatCurrency` usa es-ES, que NO agrupa los millares de un número
 * de cuatro cifras (4.500 → «4500,00 €») y sí los de cinco o más (12.000 → «12.000,00 €»).
 */

const RUTA = '/estimador-compraventa-inmueble/';

/** El formato de moneda es-ES separa la cifra del € con un espacio duro (U+00A0). */
const ESPACIO_DURO = new RegExp(String.fromCharCode(160), 'g');

/** Valor de una ResultCard, con el espacio duro del formato español normalizado. */
async function valorTarjeta(page: Page, titulo: string | RegExp): Promise<string> {
  const valor = page
    .locator('h3', { hasText: titulo })
    .first()
    .locator('xpath=../following-sibling::div[1]/p');
  return (await valor.innerText()).replace(ESPACIO_DURO, ' ').trim();
}

/** Texto descriptivo bajo el valor de una ResultCard. */
async function descripcionTarjeta(page: Page, titulo: string | RegExp): Promise<string> {
  const desc = page
    .locator('h3', { hasText: titulo })
    .first()
    .locator('xpath=../following-sibling::p[1]');
  return (await desc.innerText()).replace(ESPACIO_DURO, ' ').trim();
}

async function rellenar(page: Page, etiqueta: string, valor: string): Promise<void> {
  const campo = page.locator(`input[aria-label="${etiqueta}"]`);
  await campo.fill(valor);
  await campo.blur();
}

/** Los dos <select> de la app no tienen id: se localizan por una opción propia de cada uno. */
const selectCcaa = (page: Page) =>
  page.locator('select').filter({ has: page.locator('option[value="madrid"]') });
const selectPerfil = (page: Page) =>
  page.locator('select').filter({ has: page.locator('option[value="familia-numerosa"]') });

test.describe('Estimador de gastos de compraventa de vivienda', () => {
  test('CASO 1 (normal) — Madrid, segunda mano, vivienda de 200.000 €, comprador general', async ({ page }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Segunda mano/ }).click();
    await selectCcaa(page).selectOption('madrid');
    await rellenar(page, 'Precio de la vivienda', '200000');
    await rellenar(page, 'Gastos de gestoría del comprador (€)', '300');

    // ITP = 200.000 × 6 % — ITP_CCAA.madrid.tipoGeneral = 6
    // (coincide con TIPOS_ITP_CCAA_2025 'Madrid' de data/fiscal/inmuebles.ts)
    expect(await valorTarjeta(page, /^ITP/)).toBe('12.000,00 €');
    await expect(page.locator('h3', { hasText: /^ITP/ }).first()).toHaveText('ITP (6,0%)');

    // Notaría (ARANCELES_NOTARIO, RD 1426/1989), acumulando tramos hasta 200.000 €:
    //   90,15 + 24.040,49×0,45 % + 30.050,60×0,15 % + 90.151,82×0,10 % + 49.746,97×0,05 %
    //   = 358,43341 ; con el 21 % de IVA → 433,7044
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('433,70 €');

    // Registro (ARANCELES_REGISTRO, RD 1427/1989):
    //   24,04 + 24.040,49×0,175 % + 30.050,60×0,125 % + 90.151,82×0,075 % + 49.746,97×0,030 %
    //   = 186,21206 ; con el 21 % de IVA → 225,3166
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('225,32 €');

    expect(await valorTarjeta(page, 'Gastos de gestoría')).toBe('300,00 €');

    // Total gastos = 12.000 + 433,7044 + 225,3166 + 300 = 12.959,0210 → 6,48 % del precio
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('12.959,02 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toContain('6,48%');

    // Coste total = 200.000 + 12.959,0210. En segunda mano NO hay AJD (TPO y AJD son incompatibles)
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('212.959,02 €');
    await expect(page.locator('h3', { hasText: /^AJD/ })).toHaveCount(0);
  });

  // ⚠️ HALLAZGO ABIERTO (Inspector, 14/08/2026): la app SIEMPRE pasa `tipoAplicable` a
  // `calcularITP`, así que la rama de `tramosProgresivos` de data/itp-ccaa.ts nunca se
  // ejecuta y toda la operación tributa al tipo del primer tramo. La propia interfaz
  // imprime justo encima «⚠️ Esta comunidad aplica escala progresiva (10% → 11% → 12% → 13%)»,
  // de modo que anuncia una escala que después no aplica. Afecta a las 7 CCAA con tramos
  // declarados (Aragón, Asturias, Baleares, Castilla y León, Cataluña, Extremadura y
  // Valencia) y a las hermanas -garaje y -trastero, que hacen la misma llamada.
  // `test.fail` marca que hoy falla a propósito: cuando se corrija se pondrá en ROJO.
  test('CASO 2 (límite: tramo más alto) — Cataluña, segunda mano, 1.000.000 €: escala progresiva de ITP', async ({ page }) => {
    test.fail();
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Segunda mano/ }).click();
    await selectCcaa(page).selectOption('cataluna');
    await rellenar(page, 'Precio de la vivienda', '1000000');
    await rellenar(page, 'Gastos de gestoría del comprador (€)', '300');

    await expect(page.getByText('Esta comunidad aplica escala progresiva')).toBeVisible();

    // ITP_CCAA.cataluna.tramosProgresivos = 10 % hasta 600.000 · 11 % hasta 900.000 ·
    // 12 % hasta 1.500.000 · 13 % el resto →
    //   600.000×10 % + 300.000×11 % + 100.000×12 % = 60.000 + 33.000 + 12.000 = 105.000
    // Obtenido hoy: «ITP (10,0%)» → 100.000,00 € (5.000 € menos de impuesto)
    expect(await valorTarjeta(page, /^ITP/)).toBe('105.000,00 €');

    // Notaría: 558,93946 + 398.987,90×0,03 % = 678,63583 ; × 1,21 → 821,1494
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('821,15 €');
    // Registro: 306,51569 + 398.987,90×0,020 % = 386,31327 (< tope 2.181,67) ; × 1,21 → 467,4391
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('467,44 €');

    // Total gastos = 105.000 + 821,1494 + 467,4391 + 300 = 106.588,5884
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('106.588,59 €');
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('1.106.588,59 €');
  });

  test('CASO 3 (debe avisar) — vendedor con pérdida: plusvalía no sujeta y sin IRPF', async ({ page }) => {
    await page.goto(RUTA);
    await rellenar(page, 'Precio de la vivienda', '150000');
    await page.getByRole('button', { name: 'Vendedor' }).click();
    await rellenar(page, 'Precio de compra original', '200000');
    await rellenar(page, 'Años de propiedad', '10');
    await rellenar(page, 'Valor catastral del suelo', '50000');
    await rellenar(page, 'Valor catastral total (suelo + construcción)', '120000');
    await rellenar(page, 'Comisión inmobiliaria (%)', '3');
    await rellenar(page, 'Gastos de gestoría del comprador (€)', '300');
    // Los tres opcionales hay que ponerlos a 0 a mano — ver CASO 6 (hallazgo abierto)
    await rellenar(page, 'Impuestos y gastos que pagaste al comprar', '0');
    await rellenar(page, 'Inversiones y mejoras (opcional)', '0');
    await rellenar(page, 'Otros gastos de la venta (opcional)', '0');

    // Se vende por 150.000 lo que se compró por 200.000: no hay incremento de valor del
    // terreno, así que la transmisión NO está sujeta al IIVTNU (art. 104.5 TRLHL, tras la
    // STC 182/2021). El método objetivo habría dado 50.000 × 0,08 (COEFICIENTES_IIVTNU_2025,
    // 10 años) × 25 % (PLUSVALIA_MUNICIPAL_META.tipoOrientativo) = 1.000 €, y la app debe
    // avisar de la no sujeción en vez de cobrarlos.
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('EXENTO');
    expect(await descripcionTarjeta(page, 'Plusvalía municipal')).toBe('No sujeta (sin incremento de valor)');

    // Art. 35 LIRPF (calcularGananciaInmueble, data/fiscal/ganancia-inmueble.ts):
    //   valor de adquisición = 200.000 + 0 gastos + 0 mejoras = 200.000
    //   valor de transmisión = 150.000 − (4.500 comisión + 300 gestoría + 0 otros) − 0 plusvalía
    //                        = 145.200
    //   ganancia = 145.200 − 200.000 = −54.800 → pérdida patrimonial, cuota 0
    expect(await valorTarjeta(page, 'Valor de adquisición')).toBe('200.000,00 €');
    expect(await valorTarjeta(page, 'Valor de transmisión')).toBe('145.200,00 €');
    expect(await valorTarjeta(page, 'Pérdida patrimonial')).toBe('54.800,00 €');
    await expect(page.locator('h3', { hasText: 'Ganancia patrimonial' })).toHaveCount(0);
    expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('EXENTO');

    // Total gastos vendedor = 0 plusvalía + 4.500 comisión + 300 gestoría + 0 otros + 0 IRPF
    expect(await valorTarjeta(page, 'Comisión inmobiliaria')).toBe('4500,00 €');
    expect(await valorTarjeta(page, 'Total gastos vendedor')).toBe('4800,00 €');
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('145.200,00 €');
  });

  // ✅ CORREGIDO el 14/08/2026 — era el hallazgo más grave de la primera tanda del Inspector.
  // El botón «Estimar por mí» calcula bien (ITP 6 % + notaría + registro sobre el precio de
  // compra = 11.439,66 €) pero escribía el resultado con `formatNumber(estimado, 0)`, es decir
  // «11.440», con el punto de los millares español. Ese mismo campo se lee luego con
  // `parseSpanishNumber`, que ante un único punto hacía `parseFloat('11.440')` = 11,44, así que
  // el botón pensado para REBAJAR la ganancia sumaba 11,44 € en vez de 11.440 € y el vendedor
  // leía 2.618,77 € de IRPF de más.
  //
  // La causa raíz NO estaba en esta app sino en `lib/formatters.ts`, que usan 89 apps: la rama
  // de "punto sin coma" hacía un parseFloat directo. Corregida allí, este test dejó de necesitar
  // `test.fail()` y se queda como REGRESIÓN: si alguien vuelve a romper el parser, salta aquí.
  test('CASO 4 (regresión) — «Estimar por mí» conserva los millares', async ({ page }) => {
    await page.goto(RUTA);
    await selectCcaa(page).selectOption('madrid');
    await rellenar(page, 'Precio de la vivienda', '250000');
    await page.getByRole('button', { name: 'Vendedor' }).click();
    await rellenar(page, 'Precio de compra original', '180000');
    await rellenar(page, 'Años de propiedad', '8');
    await rellenar(page, 'Valor catastral del suelo', '50000');
    await rellenar(page, 'Valor catastral total (suelo + construcción)', '120000');
    await rellenar(page, 'Inversiones y mejoras (opcional)', '0');
    await rellenar(page, 'Otros gastos de la venta (opcional)', '0');
    await page.getByRole('button', { name: /Estimar por mí/ }).click();

    // Estimación = 180.000×6 % (ITP_CCAA.madrid.tipoGeneral) + notaría 421,60 + registro 218,06
    //            = 11.439,66 → redondeado a 11.440
    //   valor de adquisición = 180.000 + 11.440 = 191.440
    //   valor de transmisión = 250.000 − (7.500 + 300) − 1.250 plusvalía = 240.950
    //   ganancia = 49.510 → IRPF = 6.000×19 % + 43.510×21 % = 1.140 + 9.137,10 = 10.277,10
    // Antes de la corrección daba: adquisición 180.011,44 € · ganancia 60.938,56 € · IRPF 12.895,87 €
    expect(await valorTarjeta(page, 'Valor de adquisición')).toBe('191.440,00 €');
    expect(await valorTarjeta(page, 'Ganancia patrimonial')).toBe('49.510,00 €');
    expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('10.277,10 €');
  });

  // ✅ CORREGIDO el 14/08/2026 — con el perfil «Joven (< 35 años)» la app
  // busca el primer tipo reducido cuyo nombre contenga «joven» y lo aplica comprobando solo
  // su `valorMaximo`, nunca sus `condiciones`. En Madrid —la CCAA que viene por defecto— ese
  // tipo es «Jóvenes < 35 años (municipios pequeños)», del 0 %, reservado a municipios de
  // menos de 2.500 habitantes que la app jamás pregunta: quien compre en la capital lee
  // «ITP (0,0%) — 0,00 €». Mismo patrón en Baleares («joven» y «discapacidad», tipo 0 %).
  test('CASO 5 (regresión) — joven en Madrid: no puede salir 0 € de ITP sin preguntar el municipio', async ({ page }) => {
        await page.goto(RUTA);
    await page.getByRole('button', { name: /Segunda mano/ }).click();
    await selectCcaa(page).selectOption('madrid');
    await rellenar(page, 'Precio de la vivienda', '200000');
    await selectPerfil(page).selectOption('joven');

    // Lo anclado para él es el tipo general: ITP_CCAA.madrid.tipoGeneral = 6 → 12.000,00 €
    // Obtenido hoy: «ITP (0,0%)» → 0,00 €
    expect(await valorTarjeta(page, /^ITP/)).toBe('12.000,00 €');
  });

  // ⚠️ HALLAZGO ABIERTO (Inspector, 14/08/2026): `parseSpanishNumber('')` devuelve NaN y
  // `Math.max(0, NaN)` sigue siendo NaN, así que basta con dejar vacío UNO de los tres campos
  // opcionales del vendedor —«Impuestos y gastos que pagaste al comprar», «Inversiones y
  // mejoras (opcional)» y «Otros gastos de la venta (opcional)»— para que todo el bloque salga
  // «No definido» y desaparezcan las tarjetas de adquisición, transmisión y ganancia. Es la
  // ruta por defecto de la pestaña Vendedor: dos de los tres campos se anuncian como opcionales.
  test('CASO 6 (hallazgo) — la pestaña Vendedor debe calcular sin rellenar los campos opcionales', async ({ page }) => {
    test.fail();
    await page.goto(RUTA);
    await rellenar(page, 'Precio de la vivienda', '250000');
    await page.getByRole('button', { name: 'Vendedor' }).click();
    await rellenar(page, 'Precio de compra original', '180000');
    await rellenar(page, 'Años de propiedad', '8');
    await rellenar(page, 'Valor catastral del suelo', '50000');
    await rellenar(page, 'Valor catastral total (suelo + construcción)', '120000');

    // Con los opcionales a 0 la app da estas cifras exactas (comprobado):
    //   plusvalía objetivo = 50.000 × 0,10 (COEFICIENTES_IIVTNU_2025, 8 años) × 25 % = 1.250
    //   (el método real daría 70.000 × 50.000/120.000 × 25 % = 7.291,67 → gana el objetivo)
    //   valor de transmisión = 250.000 − (7.500 + 300) − 1.250 = 240.950 ; ganancia = 60.950
    //   IRPF = 6.000×19 % + 44.000×21 % + 10.950×23 % = 1.140 + 9.240 + 2.518,50 = 12.898,50
    // Obtenido hoy sin tocar los opcionales: «No definido» en IRPF, total y neto, y la
    // tarjeta de ganancia ni se pinta (la condición para mostrarla es `ganancia > 0`, y
    // NaN > 0 es false), de ahí que se compruebe primero que existe.
    await expect(page.locator('h3', { hasText: 'Ganancia patrimonial' })).toHaveCount(1);
    expect(await valorTarjeta(page, 'Ganancia patrimonial')).toBe('60.950,00 €');
    expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('12.898,50 €');
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('228.051,50 €');
  });

  // ⚠️ HALLAZGO ABIERTO (Inspector, 14/08/2026): mismo NaN en la pestaña Comprador. La guarda
  // `if (precio <= 0) return null` no atrapa el NaN de un campo vacío (NaN <= 0 es false), así
  // que el placeholder no llega a mostrarse nunca y la app ABRE con siete «No definido»,
  // incluido «COSTE TOTAL DE ADQUISICIÓN», y un «No definido% sobre el precio».
  test('CASO 7 (hallazgo) — sin precio, la app debe pedir el dato en vez de calcular', async ({ page }) => {
    test.fail();
    await page.goto(RUTA);

    await expect(
      page.getByText('Introduce el precio del inmueble para ver el desglose de gastos del comprador'),
    ).toBeVisible();
    await expect(page.getByText('No definido')).toHaveCount(0);
  });
});
