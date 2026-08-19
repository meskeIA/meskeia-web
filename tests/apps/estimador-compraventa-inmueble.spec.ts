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
 *
 * ── Segunda vuelta del Inspector (16/08/2026) ─────────────────────────────────
 * La app volvió a la cola porque `data/fiscal` cambió: el commit 2067ddbe llevó las 7 apps
 * del clúster de `calcularITP(precio, ccaa, tipoAplicable)` a `importeITP(precio, ccaa,
 * elegido)` y cambió los campos opcionales del vendedor a `parseSpanishNumberOr`. Los CASOS
 * 8 a 13 son de esta segunda vuelta: 8 a 10 verifican de nuevo el cálculo por caminos que la
 * primera no pisó (obra nueva con IVA + AJD, escala progresiva de cinco tramos y rechazo de
 * un precio negativo), y 11 a 13 son hallazgos NUEVOS, dos de ellos rincones donde aquel
 * arreglo no llegó.
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

  // ⚠️ CORREGIDO el 14/08/2026 - la app SIEMPRE pasaba `tipoAplicable` a
  // `calcularITP`, así que la rama de `tramosProgresivos` de data/itp-ccaa.ts nunca se
  // ejecuta y toda la operación tributa al tipo del primer tramo. La propia interfaz
  // imprime justo encima «⚠️ Esta comunidad aplica escala progresiva (10% → 11% → 12% → 13%)»,
  // de modo que anuncia una escala que después no aplica. Afecta a las 7 CCAA con tramos
  // declarados (Aragón, Asturias, Baleares, Castilla y León, Cataluña, Extremadura y
  // Valencia) y a las hermanas -garaje y -trastero, que hacen la misma llamada.
  // `test.fail` marca que hoy falla a propósito: cuando se corrija se pondrá en ROJO.
  test('CASO 2 (límite: tramo más alto) — Cataluña, segunda mano, 1.000.000 €: escala progresiva de ITP', async ({ page }) => {
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

  // ✅ CORREGIDO el 14/08/2026 (verificado el 16/08/2026): `parseSpanishNumber('')` devuelve NaN y
  // `Math.max(0, NaN)` sigue siendo NaN, así que bastaba con dejar vacío UNO de los tres campos
  // opcionales del vendedor —«Impuestos y gastos que pagaste al comprar», «Inversiones y
  // mejoras (opcional)» y «Otros gastos de la venta (opcional)»— para que todo el bloque salga
  // «No definido» y desaparecieran las tarjetas de adquisición, transmisión y ganancia. Era la
  // ruta por defecto de la pestaña Vendedor: dos de los tres campos se anuncian como opcionales.
  // Se corrigió con `parseSpanishNumberOr` y queda como REGRESIÓN. Ojo: el mismo NaN sigue vivo
  // en el bloque de reinversión, que no se migró — ver CASO 11.
  test('CASO 6 (regresión) — la pestaña Vendedor calcula sin rellenar los campos opcionales', async ({ page }) => {
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

  // ✅ CORREGIDO el 14/08/2026 - mismo NaN en la pestaña Comprador. La guarda
  // `if (precio <= 0) return null` no atrapa el NaN de un campo vacío (NaN <= 0 es false), así
  // que el placeholder no llegaba a mostrarse nunca y la app ABRÍA con siete «No definido»,
  // incluido «COSTE TOTAL DE ADQUISICIÓN», y un «No definido% sobre el precio».
  test('CASO 7 (regresión) — sin precio, la app pide el dato en vez de calcular', async ({ page }) => {
        await page.goto(RUTA);

    await expect(
      page.getByText('Introduce el precio del inmueble para ver el desglose de gastos del comprador'),
    ).toBeVisible();
    await expect(page.getByText('No definido')).toHaveCount(0);
  });

  // ══════════════════════════════════════════════════════════════════════════════
  // Segunda vuelta del Inspector — 16/08/2026
  // ══════════════════════════════════════════════════════════════════════════════

  test('CASO 8 (normal) — Valencia, obra nueva de 180.000 €: IVA al 10 % + AJD', async ({ page }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Primera mano/ }).click();
    await selectCcaa(page).selectOption('valencia');
    await rellenar(page, 'Precio de la vivienda', '180000');
    await rellenar(page, 'Gastos de gestoría del comprador (€)', '300');

    // La primera entrega del promotor tributa por IVA, no por ITP (art. 20.Uno.22º LIVA).
    // IVA_INMUEBLES_2025.obraNueva = 10 (`data/fiscal/inmuebles.ts`, Ley 37/1992):
    //   180.000 × 10 % = 18.000
    await expect(page.locator('h3', { hasText: /^IVA/ }).first()).toHaveText('IVA (10,0%)');
    expect(await valorTarjeta(page, /^IVA/)).toBe('18.000,00 €');
    await expect(page.locator('h3', { hasText: /^ITP/ })).toHaveCount(0);

    // AJD sobre la escritura de compraventa: ITP_CCAA.valencia.ajd = 1,5 (coincide con
    // TIPOS_AJD_2025.general de `data/fiscal/inmuebles.ts`) → 180.000 × 1,5 % = 2.700
    await expect(page.locator('h3', { hasText: /^AJD/ }).first()).toHaveText('AJD (1,50%)');
    expect(await valorTarjeta(page, /^AJD/)).toBe('2700,00 €');

    // Notaría (ARANCELES_NOTARIO, RD 1426/1989) sobre 180.000 €:
    //   90,15 + 24.040,49×0,45 % + 30.050,60×0,15 % + 90.151,82×0,10 % + 29.746,97×0,05 %
    //   = 348,43341 ; × 1,21 de IVA → 421,6044
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('421,60 €');
    // Registro (ARANCELES_REGISTRO, RD 1427/1989):
    //   24,04 + 24.040,49×0,175 % + 30.050,60×0,125 % + 90.151,82×0,075 % + 29.746,97×0,030 %
    //   = 180,21206 ; × 1,21 → 218,0566
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('218,06 €');

    // Total = 18.000 + 2.700 + 421,6044 + 218,0566 + 300 = 21.639,6610 → 12,02 % del precio
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('21.639,66 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toContain('12,02%');
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('201.639,66 €');
  });

  test('CASO 9 (límite: tramo más alto) — Baleares, 2.500.000 €: los cinco tramos de la escala', async ({ page }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Segunda mano/ }).click();
    await selectCcaa(page).selectOption('baleares');
    await rellenar(page, 'Precio de la vivienda', '2500000');
    await rellenar(page, 'Gastos de gestoría del comprador (€)', '300');

    // La escala de Baleares es la única del catálogo con cinco tramos, así que este caso
    // recorre el último de todos. ITP_CCAA.baleares.tramosProgresivos = 8 % hasta 400.000 ·
    // 9 % hasta 600.000 · 10 % hasta 1.000.000 · 12 % hasta 2.000.000 · 13 % el resto:
    //   400.000×8 % + 200.000×9 % + 400.000×10 % + 1.000.000×12 % + 500.000×13 %
    //   = 32.000 + 18.000 + 40.000 + 120.000 + 65.000 = 275.000
    // Tipo efectivo mostrado = 275.000 / 2.500.000 = 11,0 %
    await expect(page.getByText('Esta comunidad aplica escala progresiva')).toBeVisible();
    expect(await valorTarjeta(page, /^ITP/)).toBe('275.000,00 €');
    await expect(page.locator('h3', { hasText: /^ITP/ }).first()).toHaveText('ITP (11,0%)');

    // Notaría: 558,93946 + (2.500.000 − 601.012,10)×0,03 % = 1.128,63583 ; × 1,21 → 1.365,6494
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('1365,65 €');
    // Registro: 306,51569 + (2.500.000 − 601.012,10)×0,020 % = 686,31327 (< tope
    // REGISTRO_MAXIMO 2.181,67) ; × 1,21 → 830,4391
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('830,44 €');

    // Total = 275.000 + 1.365,6494 + 830,4391 + 300 = 277.496,0884 → 11,10 % del precio
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('277.496,09 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toContain('11,10%');
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('2.777.496,09 €');
    // En segunda mano no hay AJD: TPO y AJD son incompatibles (art. 31.2 TRLITPAJD)
    await expect(page.locator('h3', { hasText: /^AJD/ })).toHaveCount(0);
  });

  test('CASO 10 (debe rechazarse) — un precio negativo no puede producir un impuesto', async ({ page }) => {
    await page.goto(RUTA);
    await rellenar(page, 'Precio de la vivienda', '-50000');

    // NumberInput lleva min={0}: al perder el foco normaliza el valor negativo a «0», y la
    // guarda `precio <= 0` del useMemo devuelve null. La app debe pedir el dato, nunca
    // pintar un ITP negativo ni un «No definido».
    await expect(page.locator('input[aria-label="Precio de la vivienda"]')).toHaveValue('0');
    await expect(
      page.getByText('Introduce el precio del inmueble para ver el desglose de gastos del comprador'),
    ).toBeVisible();
    await expect(page.getByText('No definido')).toHaveCount(0);
    await expect(page.locator('h3', { hasText: /^ITP/ })).toHaveCount(0);
  });

  // ⚠️ HALLAZGO ABIERTO (Inspector, 16/08/2026) — el NaN que el commit 2067ddbe no barrió.
  // Los campos del bloque de reinversión son los dos únicos del vendedor que siguen leyéndose
  // con `parseSpanishNumber` en vez de `parseSpanishNumberOr` (page.tsx:309-310). Quien vende
  // su vivienda habitual SIN hipoteca pendiente deja ese campo vacío —lo natural, y su
  // placeholder es «0»— y entonces `principalPendiente` vale NaN, `importeTotalObtenido` vale
  // NaN, la guarda `importeTotalObtenido > 0` es false y la exención del art. 38 LIRPF NO se
  // aplica: la app cobra el IRPF entero de una ganancia que está exenta al 100 %.
  // Arreglados el 16/08/2026: estos tres pasaron de test.fail a verde y se quedan como
  // REGRESIÓN, que es de lo que se trataba.
  test('CASO 11 (hallazgo) — reinversión total: la exención no puede depender de teclear «0» en la hipoteca', async ({ page }) => {
    await page.goto(RUTA);
    await rellenar(page, 'Precio de la vivienda', '300000');
    await page.getByRole('button', { name: 'Vendedor' }).click();
    await rellenar(page, 'Precio de compra original', '200000');
    await rellenar(page, 'Años de propiedad', '10');
    await rellenar(page, 'Valor catastral del suelo', '60000');
    await rellenar(page, 'Valor catastral total (suelo + construcción)', '150000');
    await rellenar(page, 'Comisión inmobiliaria (%)', '3');
    await page.getByText('Voy a reinvertir en otra vivienda habitual').click();
    await rellenar(page, 'Importe que reinviertes en la nueva vivienda', '300000');
    // «Hipoteca pendiente de la vivienda que vendes» se deja SIN TOCAR, a propósito.

    // Plusvalía municipal: objetivo = 60.000 × 0,08 (COEFICIENTES_IIVTNU_2025, 10 años) ×
    // 25 % (PLUSVALIA_MUNICIPAL_META.tipoOrientativo) = 1.200 ; real = 100.000 ×
    // (60.000/150.000) × 25 % = 10.000 → gana el objetivo, 1.200 €.
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('1200,00 €');
    // Art. 35 LIRPF: adquisición = 200.000 ; transmisión = 300.000 − (9.000 + 300) − 1.200
    //              = 289.500 ; ganancia = 89.500
    expect(await valorTarjeta(page, 'Ganancia patrimonial')).toBe('89.500,00 €');

    // Art. 41.1 RIRPF: importe total obtenido = 289.500 − 0 de préstamo pendiente = 289.500.
    // Se reinvierten 300.000 ≥ 289.500 → proporción 1 → exención TOTAL (art. 38 LIRPF).
    // Obtenido hoy: «19.465,00 €» de IRPF (6.000×19 % + 44.000×21 % + 39.500×23 %) y un neto
    // de 270.035,00 €, es decir 19.465 € de impuesto inventado sobre una ganancia exenta.
    expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('EXENTO');
    expect(await descripcionTarjeta(page, 'IRPF sobre ganancia')).toContain('Reinversión total');
    expect(await valorTarjeta(page, 'Total gastos vendedor')).toBe('10.500,00 €');
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('289.500,00 €');
  });

  test('CASO 11 bis (control) — la misma reinversión con «0» escrito a mano sí queda exenta', async ({ page }) => {
    await page.goto(RUTA);
    await rellenar(page, 'Precio de la vivienda', '300000');
    await page.getByRole('button', { name: 'Vendedor' }).click();
    await rellenar(page, 'Precio de compra original', '200000');
    await rellenar(page, 'Años de propiedad', '10');
    await rellenar(page, 'Valor catastral del suelo', '60000');
    await rellenar(page, 'Valor catastral total (suelo + construcción)', '150000');
    await rellenar(page, 'Comisión inmobiliaria (%)', '3');
    await page.getByText('Voy a reinvertir en otra vivienda habitual').click();
    await rellenar(page, 'Importe que reinviertes en la nueva vivienda', '300000');
    await rellenar(page, 'Hipoteca pendiente de la vivienda que vendes', '0');

    // Mismos datos que el CASO 11, con la única diferencia del «0». Este control es lo que
    // convierte al 11 en un defecto demostrado y no en una discrepancia de criterio fiscal:
    // el motor calcula bien la exención en cuanto el campo no está vacío.
    expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('EXENTO');
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('289.500,00 €');
  });

  // ⚠️ HALLAZGO ABIERTO (Inspector, 16/08/2026) — el otro rincón al que no llegó el 2067ddbe.
  // `estimarGastosAdquisicion` (page.tsx:352) sigue llamando a
  // `calcularITP(precioC, ccaa, ITP_CCAA[ccaa].tipoGeneral)` con el tercer argumento, que es
  // exactamente lo que cortocircuita la rama de `tramosProgresivos`. La misma página, con el
  // mismo precio y la misma CCAA, da dos ITP distintos: 105.000 € en la pestaña Comprador y
  // 100.000 € dentro del botón «Estimar por mí». Como el estimado va al valor de ADQUISICIÓN,
  // quedarse corto infla la ganancia y el IRPF del vendedor.
  test('CASO 12 (hallazgo) — «Estimar por mí» debe usar la misma escala que la pestaña Comprador', async ({ page }) => {
    await page.goto(RUTA);
    await selectCcaa(page).selectOption('cataluna');
    await rellenar(page, 'Precio de la vivienda', '1200000');
    await page.getByRole('button', { name: 'Vendedor' }).click();
    await rellenar(page, 'Precio de compra original', '1000000');
    await rellenar(page, 'Años de propiedad', '10');
    await rellenar(page, 'Comisión inmobiliaria (%)', '3');
    await page.getByRole('button', { name: /Estimar por mí/ }).click();

    // ITP de 1.000.000 € en Cataluña con la escala de ITP_CCAA.cataluna (la misma que el
    // CASO 2 exige en la pestaña Comprador): 600.000×10 % + 300.000×11 % + 100.000×12 %
    // = 105.000. Más notaría 821,15 y registro 467,44 → 106.288,59, que el botón redondea
    // a «106.289». Obtenido hoy: «101.289» (ITP plano del 10 %, 5.000 € menos).
    await expect(
      page.locator('input[aria-label="Impuestos y gastos que pagaste al comprar"]'),
    ).toHaveValue('106.289');

    // Consecuencia en cadena, con la plusvalía municipal fuera (sin valor catastral no se calcula):
    //   adquisición = 1.000.000 + 106.289 = 1.106.289
    //   transmisión = 1.200.000 − (36.000 comisión + 300 gestoría) = 1.163.700
    //   ganancia    = 57.411 → IRPF = 6.000×19 % + 44.000×21 % + 7.411×23 % = 12.084,53
    // Obtenido hoy: adquisición 1.101.289,00 € · ganancia 62.411,00 € · IRPF 13.234,53 €,
    // es decir 1.150,00 € de IRPF de más.
    expect(await valorTarjeta(page, 'Valor de adquisición')).toBe('1.106.289,00 €');
    expect(await valorTarjeta(page, 'Ganancia patrimonial')).toBe('57.411,00 €');
    expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('12.084,53 €');
  });

  // ⚠️ HALLAZGO ABIERTO (Inspector, 16/08/2026) — accesibilidad.
  // Los dos <select> de la app («Comunidad Autónoma» y «Perfil del comprador») no tienen id,
  // ni aria-label, ni aria-labelledby, y el <label> que los precede no lleva htmlFor. Son
  // labels huérfanos: un lector de pantalla anuncia «cuadro combinado» sin decir de qué.
  // En esta app la CCAA es el dato que más mueve el resultado (del 4 % al 13 % de ITP).
  test('CASO 13 (hallazgo) — los desplegables deben tener nombre accesible', async ({ page }) => {
    await page.goto(RUTA);
    await expect(selectCcaa(page)).toHaveAccessibleName(/Comunidad Autónoma/);
    await expect(selectPerfil(page)).toHaveAccessibleName(/Perfil del comprador/);
  });
});

/**
 * Reparación del lote mecánico del Inspector (18/08/2026) — hallazgo 21.
 */
test.describe('Estimador de gastos de compraventa — lote mecánico 18/08/2026', () => {
  test('hallazgo 21 — el IVA sale de data/fiscal, también en el tramo del 21 %', async ({ page }) => {
    // IVA_INMUEBLES_2025.local = 21 (data/fiscal/inmuebles.ts, Ley 37/1992).
    // 200.000 × 21 % = 42.000. Antes el tipo era un literal en page.tsx, así que un
    // cambio en data/fiscal no llegaba a esta app, que es el hub del clúster.
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Primera mano/ }).click();
    await page.getByRole('button', { name: /Local comercial/ }).first().click();
    await rellenar(page, 'Precio del inmueble', '200.000');

    await expect(page.locator('h3', { hasText: /^IVA/ }).first()).toHaveText('IVA (21,0%)');
    expect(await valorTarjeta(page, /^IVA/)).toBe('42.000,00 €');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Lote ITP (19/08/2026) — hallazgo 31 del Inspector
//
// El acta decía que `data/itp-ccaa.ts` «duplica TIPOS_ITP_CCAA_2025» y que la app
// calculaba con la tabla no verificada. Al medirlo, los 17 tipos GENERALES coincidían
// al 100 %; lo que había divergido eran tres tipos REDUCIDOS, y en direcciones
// distintas. Cada valor de aquí abajo sale de la fuente oficial consultada ese día,
// no de ninguna de las dos tablas.
// ═══════════════════════════════════════════════════════════════════════════

test('ITP La Rioja — el tipo joven es el 4 % para menores de 40, no el 5 % para menores de 36', async ({
  page,
}) => {
  // Art. 45.3 de la Ley 10/2017, en la redacción de la Ley 1/2025 de medidas urgentes
  // para el acceso a la vivienda (efectos 03/03/2025), texto consolidado BOE-A-2017-13750:
  // «primera vivienda habitual de jóvenes MENORES DE 40 AÑOS → 4 %», y 3 % si el
  // municipio figura en el anexo I de la ley (condición que esta app no pregunta, así
  // que ese 3 % no debe aplicarse solo).
  //   150.000 × 4 % = 6.000 €   (antes daba 150.000 × 5 % = 7.500 €)
  await page.goto(RUTA);
  await page.getByRole('button', { name: /Segunda mano/ }).click();
  await selectCcaa(page).selectOption('rioja');
  await rellenar(page, 'Precio de la vivienda', '150.000');
  await selectPerfil(page).selectOption('joven');

  await expect(page.locator('h3', { hasText: /^ITP/ }).first()).toHaveText('ITP (4,0%)');
  expect(await valorTarjeta(page, /^ITP/)).toBe('6000,00 €');
});

test('ITP La Rioja — el perfil general sigue pagando el tipo general del 7 %', async ({ page }) => {
  // Control del test anterior: el 4 % tiene que venir del perfil, no de haber bajado
  // el tipo general de la comunidad. 150.000 × 7 % = 10.500 €.
  await page.goto(RUTA);
  await page.getByRole('button', { name: /Segunda mano/ }).click();
  await selectCcaa(page).selectOption('rioja');
  await rellenar(page, 'Precio de la vivienda', '150.000');

  await expect(page.locator('h3', { hasText: /^ITP/ }).first()).toHaveText('ITP (7,0%)');
  expect(await valorTarjeta(page, /^ITP/)).toBe('10.500,00 €');
});

test('ITP Murcia — el joven de hasta 40 años tributa al 3 % sin límite de valor del inmueble', async ({
  page,
}) => {
  // Art. 8.6 del texto refundido aprobado por el Decreto Legislativo 1/2010, texto
  // consolidado BOE-A-2011-10542 (última modificación 24/07/2025): «sujetos pasivos de
  // edad INFERIOR O IGUAL A 40 AÑOS», vivienda habitual, base imponible general menos
  // mínimo personal y familiar < 40.000 € y base del ahorro ≤ 1.800 €. NO hay límite de
  // valor del inmueble: 200.000 × 3 % = 6.000 €.
  //
  // Este es el caso que el hallazgo 31 daba por defectuoso reclamando 15.500 € (7,75 %),
  // porque partía de la nota de data/fiscal, que decía «<35 y ≤150.000 €». La razón la
  // tenía la app; lo que estaba mal era la nota, ya corregida.
  await page.goto(RUTA);
  await page.getByRole('button', { name: /Segunda mano/ }).click();
  await selectCcaa(page).selectOption('murcia');
  await rellenar(page, 'Precio de la vivienda', '200.000');
  await selectPerfil(page).selectOption('joven');

  await expect(page.locator('h3', { hasText: /^ITP/ }).first()).toHaveText('ITP (3,0%)');
  expect(await valorTarjeta(page, /^ITP/)).toBe('6000,00 €');
});

// ═══════════════════════════════════════════════════════════════════════════
// Hallazgo nuevo (19/08/2026, encontrado al verificar el lote ITP) — elegirTipoITP
// confundía condiciones de RENTA con límites de VALOR del inmueble: el regex que
// detecta «≤ X €» en `cubierta()` no distinguía «Valor ≤ 150.000 €» (comprobable
// contra el precio) de «Renta ≤ 36.000 €» (un dato que la app nunca pregunta).
// ═══════════════════════════════════════════════════════════════════════════

test('Cataluña — un inmueble caro ya NO pierde el reducido joven por el precio, sino por no poder verificar la renta', async ({
  page,
}) => {
  // Antes: 200.000 × 10 % (general) — la condición «Renta ≤ 36.000 €» se comparaba
  // contra el PRECIO (200.000), y como 200.000 > 36.000 el reducido se descartaba.
  // Casualidad, no criterio: alguien con renta baja e inmueble caro perdía un
  // beneficio al que sí tenía derecho, sin que la app supiera nada de su renta.
  // Ahora sigue dando el 10 % general, pero por la razón correcta: la renta no se
  // puede comprobar, así que el reducido cae en `noComprobables` y se avisa.
  await page.goto(RUTA);
  await page.getByRole('button', { name: /Segunda mano/ }).click();
  await selectCcaa(page).selectOption('cataluna');
  await rellenar(page, 'Precio de la vivienda', '200.000');
  await selectPerfil(page).selectOption('joven');

  await expect(page.locator('h3', { hasText: /^ITP/ }).first()).toHaveText('ITP (10,0%)');
  await expect(page.getByText(/no se ha podido comprobar|podr.as pagar menos/i)).toBeVisible();
});

test('Cataluña — un inmueble barato ya NO obtiene el reducido joven sin que se pregunte la renta', async ({
  page,
}) => {
  // Antes: 30.000 × 5 % = 1.500 €. La misma condición de renta, con un precio bajo,
  // pasaba a leerse como «cumplida» — el efecto contrario del caso anterior, y el
  // peligroso en una herramienta fiscal: enseñar una cifra más baja de la que
  // correspondería si la renta real superase los 36.000 €.
  await page.goto(RUTA);
  await page.getByRole('button', { name: /Segunda mano/ }).click();
  await selectCcaa(page).selectOption('cataluna');
  await rellenar(page, 'Precio de la vivienda', '30.000');
  await selectPerfil(page).selectOption('joven');

  await expect(page.locator('h3', { hasText: /^ITP/ }).first()).not.toHaveText('ITP (5,0%)');
  await expect(page.locator('h3', { hasText: /^ITP/ }).first()).toHaveText('ITP (10,0%)');
});

test('Andalucía — control: un reducido con límite de VALOR (no de renta) sigue aplicándose sin cambios', async ({
  page,
}) => {
  // El fix excluye SOLO las condiciones que mencionan «renta»; un límite de precio
  // real («Valor ≤ 150.000 €») tiene que seguir comparándose contra el precio.
  await page.goto(RUTA);
  await page.getByRole('button', { name: /Segunda mano/ }).click();
  await selectCcaa(page).selectOption('andalucia');
  await rellenar(page, 'Precio de la vivienda', '100.000');
  await selectPerfil(page).selectOption('joven');

  await expect(page.locator('h3', { hasText: /^ITP/ }).first()).toHaveText('ITP (3,5%)');
});
