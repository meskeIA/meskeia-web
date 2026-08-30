/**
 * ⚠️ Cifras revisadas el 20/08/2026, cuando calcularNotario dejó de devolver el arancel puro
 * para devolver la FACTURA notarial estimada (arancel × 1,75, punto medio de la horquilla
 * 1,5-2 de FACTURA_NOTARIAL) y calcularRegistro empezó a sumar el asiento de presentación y
 * la nota simple del RD 1427/1989. Los comentarios que desglosan tramos de arancel siguen
 * siendo correctos como CÁLCULO DEL COMPONENTE: lo que ya no describen es la cifra final de
 * la tarjeta, que lleva encima el factor.
 */
import { test, expect, Page } from '@playwright/test';
import { ITP_CCAA } from '../../data/itp-ccaa';

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

/**
 * Desde el 16/08/2026 los dos <select> SÍ tienen id (#ccaa-inmueble y #perfil-comprador) y su
 * <label> lleva htmlFor: era el hallazgo 42. Estos dos helpers se conservan porque los usan los
 * casos escritos antes; los nuevos van directos al id.
 */
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
    await expect(page.locator('h3', { hasText: /^ITP/ }).first()).toHaveText('ITP (6,00%)');

    // Nota del 20/08/2026: estas tarjetas ya no muestran el arancel puro sino la FACTURA
    // notarial estimada (el arancel × 1,75, punto medio de la horquilla 1,5-2 documentada en
    // FACTURA_NOTARIAL). El arancel del RD 1426/1989 cubre la matriz y una copia; copias
    // adicionales, folios y suplidos van aparte. El registro suma además el asiento de
    // presentación (6,010121 €) y la nota simple (3,005061 €) del RD 1427/1989.
    // Notaría (ARANCELES_NOTARIO, RD 1426/1989), acumulando tramos hasta 200.000 €:
    //   90,15 + 24.040,49×0,45 % + 30.050,60×0,15 % + 90.151,82×0,10 % + 49.746,97×0,05 %
    //   = 358,43341 ; con el 21 % de IVA → 433,7044 de arancel ; × 1,75 → 758,9827 de factura
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('758,98 €');

    // Registro (ARANCELES_REGISTRO, RD 1427/1989):
    //   24,04 + 24.040,49×0,175 % + 30.050,60×0,125 % + 90.151,82×0,075 % + 49.746,97×0,030 %
    //   = 186,21206 ; + 6,010121 (presentación) + 3,005061 (nota simple) = 195,22724
    //   con el 21 % de IVA → 236,2250
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('236,22 €');

    expect(await valorTarjeta(page, 'Gastos de gestoría')).toBe('300,00 €');

    // Total gastos = 12.000 + 758,9827 + 236,2250 + 300 = 13.295,2077 → 6,65 % del precio
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('13.295,21 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toContain('6,65%');

    // Coste total = 200.000 + 13.295,2077. En segunda mano NO hay AJD (TPO y AJD son incompatibles)
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('213.295,21 €');
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
    // Obtenido hoy: «ITP (10,00%)» → 100.000,00 € (5.000 € menos de impuesto)
    expect(await valorTarjeta(page, /^ITP/)).toBe('105.000,00 €');

    // Notaría: 558,93946 + 398.987,90×0,03 % = 678,63583 ; × 1,21 → 821,1494
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('1437,01 €');
    // Registro: 306,51569 + 398.987,90×0,020 % = 386,31327 (< tope 2.181,67) ; × 1,21 → 467,4391
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('478,35 €');

    // Total gastos = 105.000 + 821,1494 + 467,4391 + 300 = 106.588,5884
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('107.215,36 €');
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('1.107.215,36 €');
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
    //   valor de transmisión = 150.000 − (4.500 comisión + 0 otros) − 0 plusvalía = 145.500
    //   (la gestoría de 300 € la paga el COMPRADOR: art. 35.1 LIRPF solo descuenta los
    //    gastos satisfechos por el transmitente — reparado el 21/08/2026)
    //   ganancia = 145.500 − 200.000 = −54.500 → pérdida patrimonial, cuota 0
    expect(await valorTarjeta(page, 'Valor de adquisición')).toBe('200.000,00 €');
    expect(await valorTarjeta(page, 'Valor de transmisión')).toBe('145.500,00 €');
    expect(await valorTarjeta(page, 'Pérdida patrimonial')).toBe('54.500,00 €');
    await expect(page.locator('h3', { hasText: 'Ganancia patrimonial' })).toHaveCount(0);
    expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('EXENTO');

    // Total gastos vendedor = 0 plusvalía + 4.500 comisión + 0 otros + 0 IRPF
    expect(await valorTarjeta(page, 'Comisión inmobiliaria')).toBe('4500,00 €');
    expect(await valorTarjeta(page, 'Total gastos vendedor')).toBe('4500,00 €');
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('145.500,00 €');
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

    // Estimación = 180.000×6 % (ITP_CCAA.madrid.tipoGeneral) + notaría 737,81 + registro 228,96
    //            = 11.766,77 → redondeado a 11.767 (el campo muestra «11.767»)
    //   Cifras revisadas el 27/08/2026: desde el 20/08 calcularNotario devuelve la FACTURA
    //   (arancel 421,6044 × 1,75) y calcularRegistro suma presentación y nota simple.
    //   valor de adquisición = 180.000 + 11.767 = 191.767
    //   valor de transmisión = 250.000 − 7.500 de comisión − 1.250 de plusvalía = 241.250
    //   (la gestoría de 300 € la paga el COMPRADOR y ya no resta aquí: art. 35.1 LIRPF,
    //    reparado el 21/08/2026)
    //   ganancia = 241.250 − 191.767 = 49.483
    //   IRPF = 6.000×19 % + 43.483×21 % = 1.140 + 9.131,43 = 10.271,43
    // Antes de la corrección daba: adquisición 180.011,44 € · ganancia 60.938,56 € · IRPF 12.895,87 €
    expect(await valorTarjeta(page, 'Valor de adquisición')).toBe('191.767,00 €');
    expect(await valorTarjeta(page, 'Ganancia patrimonial')).toBe('49.483,00 €');
    expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('10.271,43 €');
  });

  // ✅ CORREGIDO el 14/08/2026 — con el perfil «Joven (< 35 años)» la app
  // busca el primer tipo reducido cuyo nombre contenga «joven» y lo aplica comprobando solo
  // su `valorMaximo`, nunca sus `condiciones`. En Madrid —la CCAA que viene por defecto— ese
  // tipo es «Jóvenes < 35 años (municipios pequeños)», del 0 %, reservado a municipios de
  // menos de 2.500 habitantes que la app jamás pregunta: quien compre en la capital lee
  // «ITP (0,00%) — 0,00 €». Mismo patrón en Baleares («joven» y «discapacidad», tipo 0 %).
  test('CASO 5 (regresión) — joven en Madrid: no puede salir 0 € de ITP sin preguntar el municipio', async ({ page }) => {
        await page.goto(RUTA);
    await page.getByRole('button', { name: /Segunda mano/ }).click();
    await selectCcaa(page).selectOption('madrid');
    await rellenar(page, 'Precio de la vivienda', '200000');
    await selectPerfil(page).selectOption('joven');

    // Lo anclado para él es el tipo general: ITP_CCAA.madrid.tipoGeneral = 6 → 12.000,00 €
    // Obtenido hoy: «ITP (0,00%)» → 0,00 €
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
    //   valor de transmisión = 250.000 − 7.500 − 1.250 = 241.250 ; ganancia = 61.250
    //   (sin la gestoría del comprador: art. 35.1 LIRPF, reparado el 21/08/2026)
    //   IRPF = 6.000×19 % + 44.000×21 % + 11.250×23 % = 1.140 + 9.240 + 2.587,50 = 12.967,50
    //   neto = 250.000 − (1.250 plusvalía + 7.500 comisión + 12.967,50 IRPF) = 228.282,50
    // Obtenido hoy sin tocar los opcionales: «No definido» en IRPF, total y neto, y la
    // tarjeta de ganancia ni se pinta (la condición para mostrarla es `ganancia > 0`, y
    // NaN > 0 es false), de ahí que se compruebe primero que existe.
    await expect(page.locator('h3', { hasText: 'Ganancia patrimonial' })).toHaveCount(1);
    expect(await valorTarjeta(page, 'Ganancia patrimonial')).toBe('61.250,00 €');
    expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('12.967,50 €');
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('228.282,50 €');
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
    await expect(page.locator('h3', { hasText: /^IVA/ }).first()).toHaveText('IVA (10,00%)');
    expect(await valorTarjeta(page, /^IVA/)).toBe('18.000,00 €');
    await expect(page.locator('h3', { hasText: /^ITP/ })).toHaveCount(0);

    // AJD sobre la escritura de compraventa: ITP_CCAA.valencia.ajd = 1,5 (coincide con
    // TIPOS_AJD_2025.general de `data/fiscal/inmuebles.ts`) → 180.000 × 1,5 % = 2.700
    await expect(page.locator('h3', { hasText: /^AJD/ }).first()).toHaveText('AJD (1,50%)');
    expect(await valorTarjeta(page, /^AJD/)).toBe('2700,00 €');

    // Notaría (ARANCELES_NOTARIO, RD 1426/1989) sobre 180.000 €:
    //   90,15 + 24.040,49×0,45 % + 30.050,60×0,15 % + 90.151,82×0,10 % + 29.746,97×0,05 %
    //   = 348,43341 ; × 1,21 de IVA → 421,6044
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('737,81 €');
    // Registro (ARANCELES_REGISTRO, RD 1427/1989):
    //   24,04 + 24.040,49×0,175 % + 30.050,60×0,125 % + 90.151,82×0,075 % + 29.746,97×0,030 %
    //   = 180,21206 ; × 1,21 → 218,0566
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('228,96 €');

    // Total = 18.000 + 2.700 + 421,6044 + 218,0566 + 300 = 21.639,6610 → 12,02 % del precio
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('21.966,77 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toContain('12,20%');
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('201.966,77 €');
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
    await expect(page.locator('h3', { hasText: /^ITP/ }).first()).toHaveText('ITP (11,00%)');

    // Notaría: 558,93946 + (2.500.000 − 601.012,10)×0,03 % = 1.128,63583 ; × 1,21 → 1.365,6494
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('2389,89 €');
    // Registro: 306,51569 + (2.500.000 − 601.012,10)×0,020 % = 686,31327 (< tope
    // REGISTRO_MAXIMO 2.181,67) ; × 1,21 → 830,4391
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('841,35 €');

    // Total = 275.000 + 1.365,6494 + 830,4391 + 300 = 277.496,0884 → 11,10 % del precio
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('278.531,23 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toContain('11,14%');
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('2.778.531,23 €');
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
    // Art. 35 LIRPF: adquisición = 200.000 ; transmisión = 300.000 − 9.000 de comisión
    //              − 1.200 de plusvalía = 289.800 ; ganancia = 89.800 (la gestoría del
    //              comprador ya no resta: art. 35.1 LIRPF, reparado el 21/08/2026)
    expect(await valorTarjeta(page, 'Ganancia patrimonial')).toBe('89.800,00 €');

    // Art. 41.1 RIRPF: importe total obtenido = 289.800 − 0 de préstamo pendiente = 289.800.
    // Se reinvierten 300.000 ≥ 289.800 → proporción 1 → exención TOTAL (art. 38 LIRPF).
    // Obtenido hoy: «19.465,00 €» de IRPF (6.000×19 % + 44.000×21 % + 39.500×23 %) y un neto
    // de 270.035,00 €, es decir 19.465 € de impuesto inventado sobre una ganancia exenta.
    expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('EXENTO');
    expect(await descripcionTarjeta(page, 'IRPF sobre ganancia')).toContain('Reinversión total');
    expect(await valorTarjeta(page, 'Total gastos vendedor')).toBe('10.200,00 €');
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('289.800,00 €');
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
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('289.800,00 €');
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
    ).toHaveValue('106.915');

    // Consecuencia en cadena, con la plusvalía municipal fuera (sin valor catastral no se calcula):
    //   adquisición = 1.000.000 + 106.289 = 1.106.289
    //   transmisión = 1.200.000 − 36.000 de comisión = 1.164.000 (la gestoría es del
    //                 comprador: art. 35.1 LIRPF, reparado el 21/08/2026)
    //   ganancia    = 1.164.000 − 1.106.915 = 57.085
    //   IRPF        = 6.000×19 % + 44.000×21 % + 7.085×23 % = 1.140 + 9.240 + 1.629,55
    // Obtenido hoy: adquisición 1.101.289,00 € · ganancia 62.411,00 € · IRPF 13.234,53 €,
    // es decir 1.150,00 € de IRPF de más.
    expect(await valorTarjeta(page, 'Valor de adquisición')).toBe('1.106.915,00 €');
    expect(await valorTarjeta(page, 'Ganancia patrimonial')).toBe('57.085,00 €');
    expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('12.009,55 €');
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

    await expect(page.locator('h3', { hasText: /^IVA/ }).first()).toHaveText('IVA (21,00%)');
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

  await expect(page.locator('h3', { hasText: /^ITP/ }).first()).toHaveText('ITP (4,00%)');
  expect(await valorTarjeta(page, /^ITP/)).toBe('6000,00 €');
});

test('ITP La Rioja — el perfil general sigue pagando el tipo general del 7 %', async ({ page }) => {
  // Control del test anterior: el 4 % tiene que venir del perfil, no de haber bajado
  // el tipo general de la comunidad. 150.000 × 7 % = 10.500 €.
  await page.goto(RUTA);
  await page.getByRole('button', { name: /Segunda mano/ }).click();
  await selectCcaa(page).selectOption('rioja');
  await rellenar(page, 'Precio de la vivienda', '150.000');

  await expect(page.locator('h3', { hasText: /^ITP/ }).first()).toHaveText('ITP (7,00%)');
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

  await expect(page.locator('h3', { hasText: /^ITP/ }).first()).toHaveText('ITP (3,00%)');
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

  await expect(page.locator('h3', { hasText: /^ITP/ }).first()).toHaveText('ITP (10,00%)');
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

  await expect(page.locator('h3', { hasText: /^ITP/ }).first()).not.toHaveText('ITP (5,00%)');
  await expect(page.locator('h3', { hasText: /^ITP/ }).first()).toHaveText('ITP (10,00%)');
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

  await expect(page.locator('h3', { hasText: /^ITP/ }).first()).toHaveText('ITP (3,50%)');
});

// ═══════════════════════════════════════════════════════════════════════════
// Vuelta del Inspector — 20/08/2026 (verificación de la reparación de notaría
// y registro, commit 44a5dc7d)
//
// Lo que se cambió el día anterior y aquí se comprueba:
//   · `calcularNotario` devolvía el arancel PURO del número 2 del RD 1426/1989 —que solo
//     cubre la matriz y una copia— y ahora devuelve el punto medio de una horquilla de
//     1,5-2× ese arancel (FACTURA_NOTARIAL, `data/itp-ccaa.ts`), porque las copias
//     adicionales, los folios (nº 4 y 7) y los suplidos (nº 6) se facturan aparte.
//   · `calcularRegistro` suma ahora dos importes fijos del RD 1427/1989 que el número 2 no
//     incluye: asiento de presentación 6,010121 € (nº 1) y nota simple 3,005061 € (nº 4).
//     A propósito NO se le aplica el factor 1,5-2 de la notaría: allí lo que crece con la
//     escritura son copias y folios, aquí son dos importes fijos y pequeños.
//
// Los tres casos de esta vuelta están resueltos a mano ANTES de abrir el navegador, y el
// CASO B contrasta el motor contra el ejemplo numérico que la propia app publica.
// ═══════════════════════════════════════════════════════════════════════════

test.describe('Inspector 20/08/2026 — factura notarial y registral', () => {
  test('CASO A (normal) — Madrid, 200.000 €: la tarjeta de notaría publica la horquilla, no el arancel', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Segunda mano/ }).click();
    await selectCcaa(page).selectOption('madrid');
    await rellenar(page, 'Precio de la vivienda', '200000');
    await rellenar(page, 'Gastos de gestoría del comprador (€)', '300');

    // ITP: ITP_CCAA.madrid.tipoGeneral = 6, que se LEE de TIPOS_ITP_CCAA_2025 'Madrid'
    // (`data/fiscal/inmuebles.ts`). Madrid no tiene escala progresiva → 200.000 × 6 % = 12.000
    await expect(page.locator('h3', { hasText: /^ITP/ }).first()).toHaveText('ITP (6,00%)');
    expect(await valorTarjeta(page, /^ITP/)).toBe('12.000,00 €');

    // Arancel notarial (ARANCELES_NOTARIO, nº 2 del RD 1426/1989), acumulando tramos:
    //   90,15 + 24.040,49×0,45 % + 30.050,60×0,15 % + 90.151,82×0,10 % + 49.746,97×0,05 %
    //   = 358,43341 → con el 21 % de IVA = 433,704426
    // Factura (FACTURA_NOTARIAL, factores 1,5 y 2):
    //   min 650,556639 · max 867,408852 · medio 758,982746 ← el que suma la app
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('758,98 €');
    expect(await descripcionTarjeta(page, 'Gastos de notaría')).toContain(
      'Factura estimada entre 650,56 € y 867,41 €',
    );

    // Registro (ARANCELES_REGISTRO, nº 2 del RD 1427/1989):
    //   24,04 + 24.040,49×0,175 % + 30.050,60×0,125 % + 90.151,82×0,075 % + 49.746,97×0,030 %
    //   = 186,212064 (por debajo del tope REGISTRO_MAXIMO de 2.181,67)
    //   + 6,010121 (nº 1, presentación) + 3,005061 (nº 4, nota simple) = 195,227246
    //   con el 21 % de IVA = 236,224967
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('236,22 €');

    // Total = 12.000 + 758,982746 + 236,224967 + 300 = 13.295,207713 → 6,6476 % del precio
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('13.295,21 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toContain('6,65%');
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('213.295,21 €');
    // Segunda mano: TPO y AJD son incompatibles (art. 31.2 TRLITPAJD)
    await expect(page.locator('h3', { hasText: /^AJD/ })).toHaveCount(0);
  });

  test('CASO B (límite: tipo reducido por edad) — Andalucía, joven, 140.000 €: el motor tiene que dar el ejemplo que la app publica', async ({
    page,
  }) => {
    // Es el caso «Marta» de la sección «Casos de uso reales» de la propia app, elegido
    // porque publica las tres cifras que tocó la reparación: ITP 4.900 €, notaría 685 €,
    // registro 209 € y 1.193 € entre notaría, registro y gestoría.
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Segunda mano/ }).click();
    await selectCcaa(page).selectOption('andalucia');
    await rellenar(page, 'Precio de la vivienda', '140000');
    await rellenar(page, 'Gastos de gestoría del comprador (€)', '300');
    await selectPerfil(page).selectOption('joven');

    // ITP_CCAA.andalucia, reducido «Jóvenes < 35 años» = 3,5 % con valorMaximo 150.000 € y
    // condiciones ['Menor de 35 años', 'Vivienda habitual', 'Valor ≤ 150.000 €'], las tres
    // comprobables con lo que la app pregunta → 140.000 × 3,5 % = 4.900
    // (el tipo general de Andalucía, 7 %, habría dado 9.800)
    await expect(page.locator('h3', { hasText: /^ITP/ }).first()).toHaveText('ITP (3,50%)');
    expect(await valorTarjeta(page, /^ITP/)).toBe('4900,00 €');

    // Arancel notarial sobre 140.000 €:
    //   90,15 + 24.040,49×0,45 % + 30.050,60×0,15 % + 79.898,79×0,10 % = 323,306895
    //   con el 21 % de IVA = 391,201343 → min 586,802014 · max 782,402686 · medio 684,602350
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('684,60 €');
    expect(await descripcionTarjeta(page, 'Gastos de notaría')).toContain(
      'Factura estimada entre 586,80 € y 782,40 €',
    );

    // Registro sobre 140.000 €:
    //   24,04 + 24.040,49×0,175 % + 30.050,60×0,125 % + 79.898,79×0,075 % = 163,598200
    //   + 6,010121 + 3,005061 = 172,613382 → con el 21 % de IVA = 208,862192
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('208,86 €');

    // Total = 4.900 + 684,602350 + 208,862192 + 300 = 6.093,464542 → 4,3525 % del precio.
    // Ojo al formato: es-ES no agrupa los millares de un número de cuatro cifras.
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('6093,46 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toContain('4,35%');
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('146.093,46 €');

    // Contraste con el texto publicado: 684,60 → «685 €», 208,86 → «209 €» y
    // 684,60 + 208,86 + 300 = 1.193,46 → «unos 1.193 €». Si el motor y la tarjeta educativa
    // vuelven a separarse —que es exactamente lo que se reparó el 20/08— salta aquí.
    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
    const marta = page.getByText(/Marta, 29 años/).first();
    await expect(marta).toContainText(/3,5%\s*\(4\.900\s*€\)/);
    await expect(marta).toContainText(/1\.193\s*€ en notaría \(685\s*€\), registro \(209\s*€\)/);
  });

  test('CASO C (debe rechazarse) — un precio de 0 € no puede producir impuesto ni total', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await rellenar(page, 'Precio de la vivienda', '0');

    // La guarda del useMemo es `!Number.isFinite(precio) || precio <= 0` → null, y el panel
    // pide el dato. Ni un ITP de 0 €, ni la base mínima de 90,15 € del arancel notarial
    // —que es lo que saldría de calcular sobre 0—, ni ningún «No definido».
    await expect(
      page.getByText('Introduce el precio del inmueble para ver el desglose de gastos del comprador'),
    ).toBeVisible();
    await expect(page.locator('h3', { hasText: /^ITP/ })).toHaveCount(0);
    await expect(page.locator('h3', { hasText: 'Gastos de notaría' })).toHaveCount(0);
    await expect(page.locator('h3', { hasText: 'COSTE TOTAL DE ADQUISICIÓN' })).toHaveCount(0);
    await expect(page.getByText('No definido')).toHaveCount(0);
  });
});

// ⚠️ HALLAZGO ABIERTO (Inspector, 20/08/2026) — dato.
// `RANGO_ITP` (`data/itp-ccaa.ts`) se calcula de la tabla justamente para que nadie escriba
// el rango a mano, y el bloque educativo lo usa: «va del 4% (País Vasco) al 13%». Dos
// secciones más abajo, la tabla «Comparativa de impuestos en compraventa» lleva el rango
// escrito a mano como «4% – 11%», así que la misma página se contradice. El 11 % es el tramo
// alto de Valencia; los de Baleares y Cataluña llegan al 13 %, que es lo que paga quien
// compra caro allí. La misma cifra a mano está en el JSON-LD de metadata.ts («ITP entre el
// 4% y el 11%»), que convive con otro schema donde el rango sí sale de RANGO_ITP.
// Caso: abrir /estimador-compraventa-inmueble/ y desplegar el bloque educativo → fila ITP de
//       la tabla comparativa: esperado «4% – 13%» (RANGO_ITP) · obtenido «4% – 11%».
test('REGRESIÓN (dato) — la tabla comparativa debe dar el mismo rango de ITP que RANGO_ITP', async ({
  page,
}) => {
  await page.goto(RUTA);
  await page.getByRole('button', { name: 'Ver guía educativa' }).click();
  await expect(page.locator('tr', { hasText: /^ITP/ }).first()).toContainText('13%');
});

// ⚠️ HALLAZGO ABIERTO (Inspector, 20/08/2026) — contenido.
// El aviso «Podrías pagar menos, pero depende de requisitos que no preguntamos» y el panel
// «Tipos reducidos disponibles en…» solo aparecen cuando el perfil NO es «General»:
// `elegirTipoITP` sale por `if (perfil === 'general')` antes de rellenar `noComprobables`, y
// el panel se pinta con `perfilComprador !== 'general'`. Pero hay reducidos que no dependen
// de ningún colectivo: ITP_CCAA.madrid incluye «Vivienda habitual (bonif. 10%)» al 5,4 %
// para valor ≤ 250.000 €, y ITP_CCAA.andalucia otro al 6 % para ≤ 150.000 €. Quien compra su
// vivienda habitual sin pertenecer a ningún colectivo —la ruta por defecto de la app y el
// caso más común— no ve ni la cifra ni el aviso de que existe.
// Caso: Madrid · segunda mano · vivienda · 200.000 € · perfil «General (sin bonificaciones)»
//       → esperado: el aviso citando el 5,4 % de vivienda habitual (10.800 €, 1.200 € menos)
//       · obtenido: ITP 12.000,00 € (6 %) y ninguna mención a ese tipo en toda la página.
test('REGRESIÓN (contenido) — con perfil General también hay que avisar del reducido de vivienda habitual', async ({
  page,
}) => {
  await page.goto(RUTA);
  await page.getByRole('button', { name: /Segunda mano/ }).click();
  await selectCcaa(page).selectOption('madrid');
  await rellenar(page, 'Precio de la vivienda', '200000');

  expect(await valorTarjeta(page, /^ITP/)).toBe('12.000,00 €');
  await expect(page.getByText(/Podrías pagar menos/i)).toBeVisible();
});

// ⚠️ HALLAZGO ABIERTO (Inspector, 20/08/2026) — contenido.
// Las tarjetas se titulan «Gastos de notaría (+ IVA)» y «Registro de la Propiedad (+ IVA)»,
// pero el importe YA lleva el 21 %: `calcularArancelNotarial` y `calcularRegistro` terminan
// con `total * 1.21`. «+ IVA» significa en castellano «IVA aparte», así que quien presupuesta
// suma un 21 % que ya está dentro (758,98 € → 918,37 €). El propio recuadro de errores
// comunes de la app da por hecho lo contrario («los honorarios de notaría y registro llevan
// IVA al 21 %, que a menudo se olvida»). Vale cualquiera de las dos salidas —rotular «IVA
// incluido» o publicar la base sin IVA—; lo que no puede quedarse es el «+».
// Caso: Madrid · 200.000 € → tarjeta «Gastos de notaría (+ IVA)» con valor 758,98 €, que es
//       358,43 € de arancel × 1,21 de IVA × 1,75 de factura · esperado un rótulo que no
//       prometa un IVA aparte · obtenido «Gastos de notaría (+ IVA)».
test('REGRESIÓN (contenido) — el rótulo «(+ IVA)» contradice a un importe que ya lleva el 21 %', async ({
  page,
}) => {
  await page.goto(RUTA);
  await rellenar(page, 'Precio de la vivienda', '200000');

  expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('758,98 €');
  const titulo = await page.locator('h3', { hasText: 'Gastos de notaría' }).first().innerText();
  expect(titulo).not.toMatch(/\+\s*IVA/);
});

// ⚠️ HALLAZGO ABIERTO (Inspector, 20/08/2026) — dato.
// El bloque educativo afirma que el AJD «varía entre 0,5% y 1,5% según la comunidad» y la
// tabla comparativa repite «0,5% – 1,5%», los dos escritos a mano. En la misma página, al
// elegir País Vasco, el recuadro de la comunidad imprime «AJD 0%» y su nota dice «Sin AJD.
// Régimen foral propio» (ITP_CCAA['pais-vasco'].ajd = 0). El rango es derivable de la tabla,
// igual que RANGO_ITP.
// Caso: elegir «País Vasco» en el selector de comunidad → recuadro de la comunidad: «AJD 0%»
//       y «Sin AJD» · bloque educativo, en la misma página: «varía entre 0,5% y 1,5%».
//       Esperado que el rango incluya el 0 % que la propia app calcula.
test('REGRESIÓN (dato) — el rango de AJD del bloque educativo deja fuera el 0 % del País Vasco', async ({
  page,
}) => {
  await page.goto(RUTA);
  await selectCcaa(page).selectOption('pais-vasco');
  await expect(page.locator('[class*="infoCcaa"]').first()).toContainText('Sin AJD');

  await page.getByRole('button', { name: 'Ver guía educativa' }).click();
  await expect(page.getByText(/Actos Jurídicos Documentados\)/).first()).toContainText('0%');
});

// ══════════════════════════════════════════════════════════════════════════════
// Tercera vuelta del Inspector — 27/08/2026 (RE-INSPECCIÓN)
//
// La app volvió a la cola porque `data/fiscal` cambió otra vez: el commit 23b2844f llevó el
// tipo general de las 17 comunidades a `tipoGeneralDe('X')`, que lo LEE de
// TIPOS_ITP_CCAA_2025 (`data/fiscal/inmuebles.ts`), y dejó el candado `npm run check:itp`
// enganchado al build para que no vuelva a tener dos dueños. Comprobado en esta vuelta: los
// 28 casos anteriores siguen en verde y ninguna reparación se ha deshecho.
//
// Lo que sigue son: (a) casos NUEVOS por caminos que las dos vueltas anteriores no pisaron
// —escala de tres tramos, reinversión PARCIAL, bonificación de Ceuta y entrada basura— y
// (b) los hallazgos abiertos de esta vuelta, al final, con `test.fail()`.
// ══════════════════════════════════════════════════════════════════════════════

test.describe('Inspector 27/08/2026 — caminos nuevos', () => {
  // Tercera escala progresiva del catálogo, con tres tramos y cortes distintos a los de
  // Cataluña y Baleares (que ya tenían caso): ITP_CCAA.extremadura.tramosProgresivos =
  // 8 % hasta 360.000 · 10 % hasta 600.000 · 11 % el resto.
  test('CASO 14 (límite: escala de tres tramos) — Extremadura, 700.000 €', async ({ page }) => {
    await page.goto(RUTA);
    await page.locator('#ccaa-inmueble').selectOption('extremadura');
    await rellenar(page, 'Precio de la vivienda', '700000');
    await rellenar(page, 'Gastos de gestoría del comprador (€)', '300');

    await expect(page.getByText('Esta comunidad aplica escala progresiva')).toBeVisible();

    // ITP = 360.000×8 % + 240.000×10 % + 100.000×11 % = 28.800 + 24.000 + 11.000 = 63.800
    // Tipo EFECTIVO = 63.800 / 700.000 = 9,1142… → la tarjeta rotula 9,11 %
    expect(await valorTarjeta(page, /^ITP/)).toBe('63.800,00 €');
    await expect(page.locator('h3', { hasText: /^ITP/ }).first()).toHaveText('ITP (9,11%)');

    // Notaría (ARANCELES_NOTARIO): 90,15 + 24.040,49×0,45 % + 30.050,60×0,15 %
    //   + 90.151,82×0,10 % + 450.759,07×0,05 % + 98.987,90×0,03 % = 588,63583 de arancel
    //   × 1,21 de IVA = 712,2494 ; × 1,75 (punto medio de FACTURA_NOTARIAL) = 1.246,4362
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('1246,44 €');
    // Registro (ARANCELES_REGISTRO): 24,04 + 24.040,49×0,175 % + 30.050,60×0,125 %
    //   + 90.151,82×0,075 % + 450.759,07×0,030 % + 98.987,90×0,020 % = 326,31327
    //   + 6,010121 + 3,005061 = 335,32846 ; × 1,21 = 405,7474
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('405,75 €');

    // Total = 63.800 + 1.246,4362 + 405,7474 + 300 = 65.752,1836
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('65.752,18 €');
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('765.752,18 €');
  });

  // La exención por reinversión del art. 38 LIRPF es PROPORCIONAL cuando no se reinvierte
  // todo: hasta ahora solo estaba anclado el caso de reinversión TOTAL (CASO 11).
  test('CASO 15 (normal) — reinversión PARCIAL: la exención es proporcional a lo reinvertido', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await rellenar(page, 'Precio de la vivienda', '300000');
    await page.getByRole('button', { name: 'Vendedor' }).click();
    await rellenar(page, 'Precio de compra original', '200000');
    await rellenar(page, 'Años de propiedad', '10');
    await rellenar(page, 'Valor catastral del suelo', '60000');
    await rellenar(page, 'Valor catastral total (suelo + construcción)', '150000');
    await rellenar(page, 'Comisión inmobiliaria (%)', '3');
    await page.getByText('Voy a reinvertir en otra vivienda habitual').click();
    await rellenar(page, 'Importe que reinviertes en la nueva vivienda', '150000');

    // Plusvalía municipal: objetivo = 60.000 × 0,08 (COEFICIENTES_IIVTNU_2025, 10 años)
    //   × 25 % (PLUSVALIA_MUNICIPAL_META.tipoOrientativo) = 1.200
    //   real = 100.000 × (60.000/150.000) × 25 % = 10.000 → gana el objetivo
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('1200,00 €');
    // Valor de transmisión = 300.000 − 9.000 de comisión − 1.200 de plusvalía = 289.800
    expect(await valorTarjeta(page, 'Valor de transmisión')).toBe('289.800,00 €');
    // Ganancia = 289.800 − 200.000 = 89.800
    expect(await valorTarjeta(page, 'Ganancia patrimonial')).toBe('89.800,00 €');
    // Importe total obtenido (art. 41 RIRPF) = 289.800 − 0 de hipoteca pendiente
    //   proporción reinvertida = 150.000 / 289.800 = 0,5175983…
    //   exenta = 89.800 × 0,5175983 = 46.480,3313 → base = 89.800 − 46.480,3313 = 43.319,6687
    //   IRPF = 6.000×19 % + 37.319,6687×21 % = 1.140 + 7.837,1304 = 8.977,1304
    expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('8977,13 €');
    // Neto = 300.000 − (1.200 + 9.000 + 8.977,1304) = 280.822,8696
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('280.822,87 €');
  });

  // Art. 57 bis TRLITPAJD: la cuota se bonifica al 50 % por estar el inmueble en Ceuta o
  // Melilla. En la tabla ese tipo ya viene con el 50 % descontado (`tipo: 3` sobre el 6 %
  // general), y `elegirTipoITP` lo aplica por UBICACIÓN, sin preguntar el perfil.
  test('CASO 16 (límite: régimen especial) — Ceuta, segunda mano, 200.000 €', async ({ page }) => {
    await page.goto(RUTA);
    await page.locator('#ccaa-inmueble').selectOption('ceuta');
    await rellenar(page, 'Precio de la vivienda', '200000');
    await rellenar(page, 'Gastos de gestoría del comprador (€)', '300');

    // 200.000 × 3 % = 6.000 (el 6 % general bonificado al 50 %), NO 12.000
    expect(await valorTarjeta(page, /^ITP/)).toBe('6000,00 €');
    // Total = 6.000 + 758,9827 + 236,2250 + 300 = 7.295,2077
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('7295,21 €');
  });

  // Caso que DEBE rechazarse: texto que no es un número. `parseSpanishNumber` devuelve NaN
  // (no un prefijo numérico, como haría parseFloat) y la app tiene que pedir el dato en vez
  // de pintar cifras. Complementa al CASO 7 (campo vacío) y al CASO 10 (precio negativo).
  test('CASO 17 (debe rechazarse) — «doscientos mil» no es un precio', async ({ page }) => {
    await page.goto(RUTA);
    await rellenar(page, 'Precio de la vivienda', 'doscientos mil');

    await expect(
      page.getByText('Introduce el precio del inmueble para ver el desglose de gastos del comprador'),
    ).toBeVisible();
    await expect(page.getByText('No definido')).toHaveCount(0);
    await expect(page.locator('h3', { hasText: /^ITP/ })).toHaveCount(0);
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// REGRESIÓN — los ocho hallazgos del Inspector del 27/08/2026, REPARADOS ese mismo día.
// Estaban escritos con `test.fail()` afirmando lo que debería pasar; al repararlos se les
// quitó la marca y ahora sujetan la reparación.
// ══════════════════════════════════════════════════════════════════════════════

// ✅ REPARADO 27/08/2026 — cálculo (ALTO).
// En Canarias, Ceuta y Melilla no rige el IVA español (TERRITORIOS_SIN_IVA: allí se liquida
// IGIC o IPSI). El commit c47189ca dice que «ya no se inventa cifra: se nombra el impuesto
// que toca y el total se marca como parcial», y así lo hacen las hermanas nave-industrial,
// solar y terreno-rústico con su bandera `impuestoNoCalculado`. A esta app —el hub del
// clúster— solo llegó el AVISO: sigue calculando un IVA del 10 % (o del 21 %) y metiéndolo
// en «Total gastos adicionales» y en «COSTE TOTAL DE ADQUISICIÓN», que se presenta como
// «Precio + todos los gastos» mientras el aviso de tres líneas más arriba dice que ese
// importe «no es el tuyo».
// Caso: Canarias · primera mano · vivienda · 200.000 € · gestoría 300 € → esperado ninguna
//       tarjeta de IVA y el total marcado como parcial · obtenido «IVA (10,00%) 20.000,00 €»,
//       «Total gastos adicionales 22.795,21 € — 11,40% sobre el precio» y «COSTE TOTAL DE
//       ADQUISICIÓN 222.795,21 €».
test('REGRESIÓN — en Canarias no se puede liquidar un IVA que allí no existe', async ({ page }) => {
  await page.goto(RUTA);
  await page.getByRole('button', { name: /Primera mano/ }).click();
  await page.locator('#ccaa-inmueble').selectOption('canarias');
  await rellenar(page, 'Precio de la vivienda', '200000');

  await expect(page.getByText(/no se aplica el IVA/)).toBeVisible();
  await expect(page.locator('h3', { hasText: /^IVA/ })).toHaveCount(0);
});

// ✅ REPARADO 27/08/2026 — contenido (ALTO).
// Sin precio de compra no hay ganancia que calcular, y el motor deja el IRPF en 0. La
// tarjeta traduce ese 0 a «EXENTO» en verde, con la descripción «Tributación en base del
// ahorro»: afirma una exención que nadie ha comprobado. Es el mismo defecto que el hallazgo
// 43 (la plusvalía pintada como «0,00 €» cuando faltaban datos), reparado el 16/08 en la
// tarjeta de al lado —que hoy dice «Sin calcular»— y no en esta. Además el 0 entra callado
// en «Total gastos vendedor» y en el neto, cuyo único aviso es sobre la plusvalía.
// Caso: Vendedor · precio de venta 250.000 € · sin tocar «Precio de compra original»
//       → esperado «Sin calcular», como en la plusvalía · obtenido «EXENTO» y un neto de
//       242.500,00 €. Control: con compra 180.000 € y 8 años, esa misma venta paga
//       13.255,00 € de IRPF.
test('REGRESIÓN — sin precio de compra el IRPF no está «EXENTO», está sin calcular', async ({
  page,
}) => {
  await page.goto(RUTA);
  await rellenar(page, 'Precio de la vivienda', '250000');
  await page.getByRole('button', { name: 'Vendedor' }).click();

  expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('Sin calcular');
  expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('Sin calcular');
});

// ✅ REPARADO 27/08/2026 — contenido (MEDIO).
// El caso de uso «Ana» del bloque educativo sigue enseñando la regla que la reparación del
// 21/08 retiró del motor: dice que a la ganancia se le resta «la comisión inmobiliaria (3%)
// y la gestoría», y por eso publica 62.200 € en vez de 62.500 €. La gestoría del formulario
// la paga el COMPRADOR y el art. 35.1 LIRPF solo descuenta los gastos satisfechos por el
// transmitente — que es exactamente el motivo por el que se corrigió el cálculo.
// Caso: venta 250.000 € · compra 180.000 € · 8 años · comisión 3 % · gestoría 300 € y sin
//       valores catastrales → la app da «Ganancia patrimonial 62.500,00 €» mientras su
//       propio bloque educativo publica 62.200 € · esperado 62.500 € y sin citar la gestoría.
test('REGRESIÓN — el caso «Ana» del bloque educativo contradice al motor', async ({ page }) => {
  await page.goto(RUTA);
  await rellenar(page, 'Precio de la vivienda', '250000');
  await page.getByRole('button', { name: 'Vendedor' }).click();
  await rellenar(page, 'Precio de compra original', '180000');
  await rellenar(page, 'Años de propiedad', '8');
  await rellenar(page, 'Comisión inmobiliaria (%)', '3');
  expect(await valorTarjeta(page, 'Ganancia patrimonial')).toBe('62.500,00 €');

  await page.getByRole('button', { name: 'Ver guía educativa' }).click();
  await expect(page.getByText(/Ana vende su piso/)).toContainText('62.500');
});

// ✅ REPARADO 27/08/2026 — operativa (MEDIO). Era la mitad no reparada del hallazgo 21.
// El perfil «Vivienda de Protección Oficial» se honra en segunda mano (Murcia: ITP al 4 %),
// pero al pasar a primera mano el selector DESAPARECE, el perfil declarado se descarta sin
// decirlo y se cobra el 10 % de IVA. IVA_INMUEBLES_2025.viviendaProtegida = 4 vive en
// `data/fiscal/inmuebles.ts` y no hay ningún camino en la app que llegue a él: ni se aplica
// ni se menciona, aunque la app tiene justo para esto el aviso «Podrías pagar menos».
// Caso: Murcia · vivienda · 200.000 € · perfil «Vivienda de Protección Oficial» → segunda
//       mano da «ITP (4,00%) 8.000,00 €»; al pulsar «Primera mano» da «IVA (10,00%)
//       20.000,00 €» sin selector de perfil y sin una sola mención al 4 % de VPO
//       (8.000 €) · esperado al menos el aviso de que ese tipo existe.
test('REGRESIÓN — en primera mano el perfil VPO se descarta sin avisar', async ({ page }) => {
  await page.goto(RUTA);
  await page.locator('#ccaa-inmueble').selectOption('murcia');
  await rellenar(page, 'Precio de la vivienda', '200000');
  await page.locator('#perfil-comprador').selectOption('vpo');
  expect(await valorTarjeta(page, /^ITP/)).toBe('8000,00 €');

  await page.getByRole('button', { name: /Primera mano/ }).click();
  await expect(
    page.locator('section[class*="mainContent"]').getByText(/protección oficial|VPO/i).first(),
  ).toBeVisible();
});

// ✅ REPARADO 27/08/2026 — contenido (BAJO).
// La tarjeta del AJD rotula el tipo NOMINAL de la tabla mientras el importe ya lleva la
// bonificación del 50 % del art. 57 bis TRLITPAJD que `calcularAJD` aplica en Ceuta y
// Melilla. La tarjeta del ITP, en la misma pantalla, resuelve esto mostrando el tipo
// EFECTIVO precisamente para no contradecir a la cifra de al lado.
// Caso: Melilla · primera mano · vivienda · 200.000 € → tarjeta «AJD (0,50%)» con
//       500,00 €, que es el 0,25 % · esperado «AJD (0,25%)» (o 1.000,00 € si el rótulo
//       fuera el bueno, que no lo es: la bonificación es correcta).
test('REGRESIÓN — el rótulo del AJD en Melilla no coincide con su importe', async ({ page }) => {
  await page.goto(RUTA);
  await page.getByRole('button', { name: /Primera mano/ }).click();
  await page.locator('#ccaa-inmueble').selectOption('melilla');
  await rellenar(page, 'Precio de la vivienda', '200000');

  expect(await valorTarjeta(page, /^AJD/)).toBe('500,00 €');
  await expect(page.locator('h3', { hasText: /^AJD/ }).first()).toHaveText('AJD (0,25%)');
});

// ✅ REPARADO 27/08/2026 — contenido (BAJO).
// El bloque educativo y la FAQ (que va también al JSON-LD que consumen los buscadores y las
// IAs) fijan la edad del tipo joven en «menores de 35-36 años», escrita a mano. La propia
// tabla de la app la desmiente en dos comunidades desde el commit 23b2844f, que subió esas
// edades con su norma: Murcia ≤40 (art. 8.6 del Decreto Legislativo 1/2010) y La Rioja <40
// (art. 45.3 de la Ley 10/2017 según la Ley 1/2025). Quien tenga 38 años lee que no le toca.
// Caso: Murcia · perfil «Joven (< 35 años)» · vivienda · 150.000 € → el panel «Tipos
//       reducidos disponibles» lista «3% - Jóvenes ≤40 años» y la app cobra 4.500,00 €,
//       mientras el bloque educativo dice «Jóvenes (generalmente menores de 35-36 años)» y
//       la FAQ «tipos reducidos para jóvenes (menores de 35-36 años)».
test('REGRESIÓN — la edad del tipo joven del bloque educativo contradice a la tabla', async ({
  page,
}) => {
  await page.goto(RUTA);
  await page.locator('#ccaa-inmueble').selectOption('murcia');
  await rellenar(page, 'Precio de la vivienda', '150000');
  await page.locator('#perfil-comprador').selectOption('joven');
  expect(await valorTarjeta(page, /^ITP/)).toBe('4500,00 €');
  await expect(page.getByText('3% - Jóvenes ≤40 años')).toBeVisible();

  await page.getByRole('button', { name: 'Ver guía educativa' }).click();
  await expect(page.getByText(/menores de 35-36 años/)).toHaveCount(0);
});

// ✅ REPARADO 27/08/2026 — contenido (BAJO).
// El motivo de la exención parcial por reinversión se compone con
// `(proporcionReinvertida * 100).toFixed(1)` en `data/fiscal/ganancia-inmueble.ts`, así que
// el porcentaje sale con punto decimal inglés en una app en español (CLAUDE.md §2: nunca
// `toFixed()` para presentar cifras). Lo ve todo el que reinvierte en parte.
// Caso: el CASO 15 (venta 300.000 €, compra 200.000 €, reinversión de 150.000 €) → la
//       descripción de la tarjeta de IRPF dice «exento el 51.8 % de la ganancia»
//       · esperado «51,8 %».
test('REGRESIÓN — el porcentaje de reinversión sale con punto decimal inglés', async ({ page }) => {
  await page.goto(RUTA);
  await rellenar(page, 'Precio de la vivienda', '300000');
  await page.getByRole('button', { name: 'Vendedor' }).click();
  await rellenar(page, 'Precio de compra original', '200000');
  await rellenar(page, 'Años de propiedad', '10');
  await rellenar(page, 'Valor catastral del suelo', '60000');
  await rellenar(page, 'Valor catastral total (suelo + construcción)', '150000');
  await rellenar(page, 'Comisión inmobiliaria (%)', '3');
  await page.getByText('Voy a reinvertir en otra vivienda habitual').click();
  await rellenar(page, 'Importe que reinviertes en la nueva vivienda', '150000');

  expect(await descripcionTarjeta(page, 'IRPF sobre ganancia')).toContain('51,8 %');
});

// ✅ REPARADO 27/08/2026 — dato (BAJO).
// El JSON-LD de `metadata.ts` escribe a mano cuatro tipos generales de ITP («Cataluña
// aplica el 10 % … Madrid el 6 %, Andalucía el 7 % y el País Vasco el 4 %») en el mismo
// fichero donde los extremos del rango SÍ se derivan de RANGO_ITP. Hoy los cuatro coinciden
// con TIPOS_ITP_CCAA_2025, pero salen de un literal: el candado `npm run check:itp` vigila
// `data/itp-ccaa.ts`, no los ficheros de las apps, así que un cambio en data/fiscal —como
// el de Murcia (8 → 7,75 %) o el de Valencia (10 → 9 %) de junio— no llegaría hasta aquí.
// ⚠️ Este test se REESCRIBIÓ al reparar, porque su «esperado» no se sostenía: derivar el
// tipo de la tabla produce EXACTAMENTE el mismo texto que el literal —«Madrid el 6 %» sale
// igual de las dos maneras—, así que desde el navegador es imposible distinguir un literal
// de un derivado, y `not.toMatch(/Madrid el 6 %/)` habría obligado a EMPEORAR la frase para
// ponerse verde. Lo que sí protege es comprobar que lo publicado COINCIDE con ITP_CCAA: el
// día que la tabla se mueva y el JSON-LD se quede atrás, salta aquí.
test('REGRESIÓN — los tipos de ITP del JSON-LD coinciden con la tabla', async ({ page }) => {
  await page.goto(RUTA);
  const schemas = (await page.locator('script[type="application/ld+json"]').allTextContents()).join(' ');
  const pct = (n: number) => String(n).replace('.', ',');

  expect(schemas).toContain(`Madrid el ${pct(ITP_CCAA['madrid'].tipoGeneral)} %`);
  expect(schemas).toContain(`Andalucía el ${pct(ITP_CCAA['andalucia'].tipoGeneral)} %`);
  expect(schemas).toContain(`País Vasco el ${pct(ITP_CCAA['pais-vasco'].tipoGeneral)} %`);
  expect(schemas).toContain(`Cataluña aplica el ${pct(ITP_CCAA['cataluna'].tipoGeneral)} %`);

  // El techo de la escala catalana es el otro número citado en esa misma frase.
  const techoCataluna = Math.max(
    ITP_CCAA['cataluna'].tipoGeneral,
    ...(ITP_CCAA['cataluna'].tramosProgresivos ?? []).map((t) => t.tipo),
  );
  expect(schemas).toContain(`escala hasta el ${pct(techoCataluna)} %`);
});

// ══════════════════════════════════════════════════════════════════════════════
// Inspector 28/08/2026 — RE-INSPECCIÓN DE CIERRE del commit d787b81b
// ("el IVA que no existe en Canarias deja de sumarse al total en las cuatro apps
// que faltaban"). Mitad A: que la reparación es correcta de verdad y no ha roto
// el camino peninsular. Mitad B: tres caminos que no tenían caso.
// ══════════════════════════════════════════════════════════════════════════════

test.describe('Inspector 28/08/2026 — cierre del IVA en territorios sin IVA', () => {
  // ── MITAD A · el caso literal del commit ────────────────────────────────────
  // La REGRESIÓN de arriba comprueba que ya no hay tarjeta de IVA, pero no llega a
  // las cifras, que es donde vivía el daño: el IVA inventado se colaba en el total
  // rotulado «Precio + todos los gastos». Aquí se anclan los importes exactos.
  //
  // Canarias · primera mano · vivienda · 200.000 € · gestoría 300 €:
  //   Impuesto ..... TERRITORIOS_SIN_IVA.canarias → IGIC, sin cifra (allí no rige el IVA)
  //   AJD .......... 200.000 × 0,75 % = 1.500 (ITP_CCAA.canarias.ajd = 0,75; Canarias NO
  //                  está en CIUDADES_CON_BONIFICACION, así que el efectivo es el nominal)
  //   Notaría ...... arancel RD 1426/1989 = 90,15 + 24.040,49×0,45 % + 30.050,60×0,15 %
  //                  + 90.151,82×0,10 % + 49.746,97×0,05 % = 358,43341 ; ×1,21 de IVA
  //                  = 433,70443 ; ×1,75 (punto medio de FACTURA_NOTARIAL) = 758,98275
  //   Registro ..... arancel RD 1427/1989 = 24,04 + 24.040,49×0,175 % + 30.050,60×0,125 %
  //                  + 90.151,82×0,075 % + 49.746,97×0,030 % = 186,21206 ; + 6,010121 de
  //                  presentación + 3,005061 de nota simple = 195,22725 ; ×1,21 = 236,22497
  //   Total gastos . 0 + 1.500 + 758,98275 + 236,22497 + 300 = 2.795,20771 → 1,40 % del precio
  //   Coste total .. 200.000 + 2.795,20771 = 202.795,20771
  // Antes de d787b81b ese total era 222.795,21 € (20.000 € de IVA inexistente dentro).
  test('CIERRE A — Canarias, primera mano: el total ya NO lleva el IVA inventado', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Primera mano/ }).click();
    await page.locator('#ccaa-inmueble').selectOption('canarias');
    await rellenar(page, 'Precio de la vivienda', '200000');
    await rellenar(page, 'Gastos de gestoría del comprador (€)', '300');

    await expect(page.locator('h3', { hasText: /^IVA/ })).toHaveCount(0);
    expect(await valorTarjeta(page, /^IGIC/)).toBe('No calculado');
    expect(await valorTarjeta(page, /^AJD/)).toBe('1500,00 €');
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('758,98 €');
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('236,22 €');

    await expect(page.locator('h3', { hasText: /Total gastos adicionales/ }).first()).toHaveText('Total gastos adicionales (parcial)');
    expect(await valorTarjeta(page, /Total gastos adicionales/)).toBe('2795,21 €');
    expect(await descripcionTarjeta(page, /Total gastos adicionales/)).toContain(
      'SIN el IGIC, que no está incluido',
    );
    await expect(page.locator('h3', { hasText: /COSTE TOTAL/ }).first()).toHaveText('COSTE TOTAL (PARCIAL)');
    expect(await valorTarjeta(page, /COSTE TOTAL/)).toBe('202.795,21 €');

    // El aviso del IVA del 4 % de VPO no puede salir donde no hay IVA que rebajar
    await expect(page.getByText(/protección oficial de régimen especial/)).toHaveCount(0);
  });

  // ── MITAD A · control de NO regresión ───────────────────────────────────────
  // La misma operación en la península tiene que seguir dando exactamente lo de antes:
  //   IVA .......... 200.000 × 10 % (IVA_INMUEBLES_2025.obraNueva) = 20.000
  //   AJD .......... 200.000 × 0,75 % (ITP_CCAA.madrid.ajd) = 1.500
  //   Total gastos . 20.000 + 1.500 + 758,98275 + 236,22497 + 300 = 22.795,20771 → 11,40 %
  //   Coste total .. 222.795,20771
  //   Aviso VPO .... 200.000 × 4 % (IVA_INMUEBLES_2025.viviendaProtegida) = 8.000
  test('CIERRE A (control) — Madrid, primera mano: el camino peninsular no se ha tocado', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Primera mano/ }).click();
    await page.locator('#ccaa-inmueble').selectOption('madrid');
    await rellenar(page, 'Precio de la vivienda', '200000');
    await rellenar(page, 'Gastos de gestoría del comprador (€)', '300');

    await expect(page.locator('h3', { hasText: /^IVA/ }).first()).toHaveText('IVA (10,00%)');
    expect(await valorTarjeta(page, /^IVA/)).toBe('20.000,00 €');
    expect(await valorTarjeta(page, /^AJD/)).toBe('1500,00 €');
    await expect(page.locator('h3', { hasText: /Total gastos adicionales/ }).first()).toHaveText('Total gastos adicionales');
    expect(await valorTarjeta(page, /Total gastos adicionales/)).toBe('22.795,21 €');
    await expect(page.locator('h3', { hasText: /COSTE TOTAL/ }).first()).toHaveText('COSTE TOTAL DE ADQUISICIÓN');
    expect(await valorTarjeta(page, /COSTE TOTAL/)).toBe('222.795,21 €');
    await expect(page.getByText(/protección oficial de régimen especial/).first()).toBeVisible();
    await expect(page.getByText(/serían.*8000,00/).first()).toBeVisible();
  });

  // ── MITAD B · CASO 18 ───────────────────────────────────────────────────────
  // El cierre solo se probó con vivienda en Canarias. Aquí se cruza el territorio sin
  // IVA con las DOS ramas que el arreglo atraviesa y que no tenían caso: un inmueble NO
  // residencial (el que iba al 21 %, no al 10 %) y la ciudad donde además se bonifica el
  // AJD al 50 % (art. 57 bis TRLITPAJD, aplicado por `aplicarBonificacionCiudad`).
  //
  // Ceuta · primera mano · local comercial · 400.000 € · gestoría 300 €:
  //   Impuesto ..... TERRITORIOS_SIN_IVA.ceuta → IPSI, sin cifra (antes: 21 % = 84.000 €)
  //   AJD .......... 400.000 × 0,5 % = 2.000 ; × (1 − 0,5) de bonificación = 1.000
  //                  → tipo EFECTIVO 1.000 / 400.000 = 0,25 %
  //   Notaría ...... arancel = 90,15 + 108,182205 + 45,0759 + 90,15182 + 249.746,97×0,05 %
  //                  (=124,873485) = 458,43341 ; ×1,21 = 554,70443 ; ×1,75 = 970,73275
  //   Registro ..... 24,04 + 42,0708575 + 37,56325 + 67,613865 + 249.746,97×0,030 %
  //                  (=74,924091) = 246,21206 ; + 9,015182 = 255,22725 ; ×1,21 = 308,82497
  //   Total gastos . 0 + 1.000 + 970,73275 + 308,82497 + 300 = 2.579,55771 → 0,64 % del precio
  //   Coste total .. 402.579,55771
  test('CASO 18 (límite: territorio sin IVA + inmueble no residencial) — Ceuta, primera mano, local de 400.000 €', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Local comercial/ }).click();
    await page.getByRole('button', { name: /Primera mano/ }).click();
    await page.locator('#ccaa-inmueble').selectOption('ceuta');
    await rellenar(page, 'Precio del inmueble', '400000');
    await rellenar(page, 'Gastos de gestoría del comprador (€)', '300');

    await expect(page.locator('h3', { hasText: /^IVA/ })).toHaveCount(0);
    expect(await valorTarjeta(page, /^IPSI/)).toBe('No calculado');
    await expect(page.locator('h3', { hasText: /^AJD/ }).first()).toHaveText('AJD (0,25%)');
    expect(await valorTarjeta(page, /^AJD/)).toBe('1000,00 €');
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('970,73 €');
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('308,82 €');
    expect(await valorTarjeta(page, /Total gastos adicionales/)).toBe('2579,56 €');
    expect(await descripcionTarjeta(page, /Total gastos adicionales/)).toContain(
      'SIN el IPSI, que no está incluido',
    );
    expect(await valorTarjeta(page, /COSTE TOTAL/)).toBe('402.579,56 €');
    // Un local no es vivienda: el aviso del IVA del 4 % de VPO no le corresponde
    await expect(page.getByText(/protección oficial de régimen especial/)).toHaveCount(0);
  });

  // ── MITAD B · CASO 19 ───────────────────────────────────────────────────────
  // Dos caminos de `calcularPlusvaliaMunicipal` que ningún caso anterior recorría: que
  // gane el MÉTODO REAL (en el CASO 15 y en el 3 siempre ganaba el objetivo o había
  // exención) y el TOPE de 20 años de `aniosCapped` (COEFICIENTES_IIVTNU_2025 se acaba
  // en «20 o más años», coeficiente 0,45).
  //
  // Venta 260.000 · compra 250.000 · 25 años · suelo 80.000 · total 200.000 · comisión 3 %:
  //   objetivo ..... 80.000 × 0,45 (coef. de 20 años, por el tope) × 25 %
  //                  (PLUSVALIA_MUNICIPAL_META.tipoOrientativo) = 9.000
  //   real ......... (260.000 − 250.000) × (80.000/200.000 = 0,4) × 25 % = 1.000
  //   recomendado .. min(9.000, 1.000) = 1.000 → «Método real (más favorable)»
  //   comisión ..... 260.000 × 3 % = 7.800
  //   v. transmis. . 260.000 − 7.800 − 1.000 = 251.200 (art. 35.1 LIRPF)
  //   v. adquisic. . 250.000 (sin gastos de compra ni mejoras declarados)
  //   ganancia ..... 1.200 → primer tramo del ahorro
  //   IRPF ......... 1.200 × 19 % = 228
  //   total gastos . 1.000 + 7.800 + 0 + 228 = 9.028
  //   neto ......... 260.000 − 9.028 = 250.972
  test('CASO 19 (límite: tope de 20 años) — la plusvalía sale por el método real y el coeficiente se topa', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await rellenar(page, 'Precio de la vivienda', '260000');
    await page.getByRole('button', { name: 'Vendedor' }).click();
    await rellenar(page, 'Precio de compra original', '250000');
    await rellenar(page, 'Años de propiedad', '25');
    await rellenar(page, 'Valor catastral del suelo', '80000');
    await rellenar(page, 'Valor catastral total (suelo + construcción)', '200000');
    await rellenar(page, 'Comisión inmobiliaria (%)', '3');

    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('1000,00 €');
    expect(await descripcionTarjeta(page, 'Plusvalía municipal')).toBe('Método real (más favorable)');
    expect(await valorTarjeta(page, 'Valor de adquisición')).toBe('250.000,00 €');
    expect(await valorTarjeta(page, 'Valor de transmisión')).toBe('251.200,00 €');
    expect(await valorTarjeta(page, 'Ganancia patrimonial')).toBe('1200,00 €');
    expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('228,00 €');
    expect(await valorTarjeta(page, 'Total gastos vendedor')).toBe('9028,00 €');
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('250.972,00 €');
  });

  // ── MITAD B · CASO 20 (control) ─────────────────────────────────────────────
  // La misma pantalla con los dos campos del vendedor en su valor legítimo. Sujeta el
  // montaje de los dos test.fail() de abajo: si esto se pone rojo, lo que falla es el
  // caso, no el hallazgo.
  //   plusvalía .... objetivo 50.000 × 0,10 (8 años) × 25 % = 1.250 ; real
  //                  70.000 × (50.000/120.000) × 25 % = 7.291,67 → gana el objetivo
  //   comisión ..... 250.000 × 3 % = 7.500
  //   v. transmis. . 250.000 − 7.500 − 1.250 = 241.250
  //   ganancia ..... 241.250 − 180.000 = 61.250
  //   IRPF ......... 6.000×19 % + 44.000×21 % + 11.250×23 % = 1.140 + 9.240 + 2.587,50
  //                  = 12.967,50
  //   total gastos . 1.250 + 7.500 + 0 + 12.967,50 = 21.717,50
  //   neto ......... 250.000 − 21.717,50 = 228.282,50
  test('CASO 20 (control) — vendedor con comisión del 3 % y sin otros gastos', async ({ page }) => {
    await page.goto(RUTA);
    await rellenar(page, 'Precio de la vivienda', '250000');
    await page.getByRole('button', { name: 'Vendedor' }).click();
    await rellenar(page, 'Precio de compra original', '180000');
    await rellenar(page, 'Años de propiedad', '8');
    await rellenar(page, 'Valor catastral del suelo', '50000');
    await rellenar(page, 'Valor catastral total (suelo + construcción)', '120000');
    await rellenar(page, 'Comisión inmobiliaria (%)', '3');

    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('1250,00 €');
    expect(await valorTarjeta(page, 'Valor de transmisión')).toBe('241.250,00 €');
    expect(await valorTarjeta(page, 'Ganancia patrimonial')).toBe('61.250,00 €');
    expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('12.967,50 €');
    expect(await valorTarjeta(page, 'Total gastos vendedor')).toBe('21.717,50 €');
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('228.282,50 €');
  });
});

// Hallazgo 476 — reparado. `otrosVenta` y `comisionPct` se acotan con `Math.max(0, …)` DENTRO
// del useMemo, igual que d787b81b ya hizo con la gestoría del comprador.
test(
  'REGRESIÓN — un importe negativo en «Otros gastos de la venta» no sube el neto',
  async ({ page }) => {
    await page.goto(RUTA);
    await rellenar(page, 'Precio de la vivienda', '250000');
    await page.getByRole('button', { name: 'Vendedor' }).click();
    await rellenar(page, 'Precio de compra original', '180000');
    await rellenar(page, 'Años de propiedad', '8');
    await rellenar(page, 'Valor catastral del suelo', '50000');
    await rellenar(page, 'Valor catastral total (suelo + construcción)', '120000');
    await rellenar(page, 'Comisión inmobiliaria (%)', '3');
    // SIN blur: así es como está el campo mientras el usuario teclea
    await page.locator('input[aria-label="Otros gastos de la venta (opcional)"]').fill('-2000');

    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('228.282,50 €');
  },
);

// Hallazgo 477 — reparado. Misma acotación que el 476, en la comisión inmobiliaria.
test(
  'REGRESIÓN — una comisión negativa no resta del total de gastos del vendedor',
  async ({ page }) => {
    await page.goto(RUTA);
    await rellenar(page, 'Precio de la vivienda', '250000');
    await page.getByRole('button', { name: 'Vendedor' }).click();
    await rellenar(page, 'Precio de compra original', '180000');
    await rellenar(page, 'Años de propiedad', '8');
    await rellenar(page, 'Valor catastral del suelo', '50000');
    await rellenar(page, 'Valor catastral total (suelo + construcción)', '120000');
    // SIN blur, igual que arriba
    await page.locator('input[aria-label="Comisión inmobiliaria (%)"]').fill('-3');

    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('234.057,50 €');
  },
);

// Hallazgo 478 — reparado. El bloque educativo deriva ahora los dos recargos de
// `ESCALA_RECARGO_EXTEMPORANEO`, igual que ya hacían garaje y trastero.
test(
  'REGRESIÓN — el bloque educativo no publica la escala de recargos anterior a la Ley 11/2021',
  async ({ page }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: 'Ver guía educativa' }).click();

    await expect(page.getByText(/5% al 20%/)).toHaveCount(0);
  },
);

// ══════════════════════════════════════════════════════════════════════════════
// Inspector 30/08/2026 — RE-INSPECCIÓN del commit 0828da3e ("tanda 2 de reparación
// — clúster de compraventa de inmuebles"). La cola marcó la app «invalidada», así
// que aquí NO se da por bueno el commit: los tres casos están resueltos a mano
// ANTES de abrir el navegador, anclados en data/fiscal y data/itp-ccaa, y recorren
// justo los caminos que se tocaron.
//
//   CASO 21 (normal)   · península, vivienda usada — que la reparación no ha roto
//                        el camino por defecto.
//   CASO 22 (especial) · Melilla en obra nueva — cruza los DOS arreglos del clúster
//                        en una sola pantalla: el IVA que allí no rige (IPSI) y el
//                        rótulo del AJD, que debe publicar el tipo EFECTIVO tras la
//                        bonificación del 50 % del art. 57 bis TRLITPAJD.
//   CASO 23 (límite)   · vendedor sin precio de compra — el «SIN CUOTA» en verde.
//
// Y cuatro hallazgos NUEVOS, en `test.fail()` hasta que se reparen.
// ══════════════════════════════════════════════════════════════════════════════

test.describe('Inspector 30/08/2026 — re-verificación de la tanda 2', () => {
  test('CASO 21 (normal) — Galicia, segunda mano, vivienda de 320.000 €', async ({ page }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Segunda mano/ }).click();
    await page.locator('#ccaa-inmueble').selectOption('galicia');
    await rellenar(page, 'Precio de la vivienda', '320000');
    await rellenar(page, 'Gastos de gestoría del comprador (€)', '300');

    // ITP: ITP_CCAA.galicia.tipoGeneral = 8, que se LEE de TIPOS_ITP_CCAA_2025 'Galicia'
    // (`data/fiscal/inmuebles.ts`). Galicia no tiene `tramosProgresivos` ni está en
    // CIUDADES_CON_BONIFICACION → 320.000 × 8 % = 25.600
    await expect(page.locator('h3', { hasText: /^ITP/ }).first()).toHaveText('ITP (8,00%)');
    expect(await valorTarjeta(page, /^ITP/)).toBe('25.600,00 €');

    // Arancel notarial (ARANCELES_NOTARIO, nº 2 del RD 1426/1989) sobre 320.000 €:
    //   90,15 + 24.040,49×0,45 % + 30.050,60×0,15 % + 90.151,82×0,10 % + 169.746,97×0,05 %
    //   = 90,15 + 108,182205 + 45,0759 + 90,15182 + 84,873485 = 418,43341
    //   con el 21 % de IVA = 506,3044261
    // Factura (FACTURA_NOTARIAL, factores 1,5 y 2): min 759,456639 · max 1.012,608852
    //   · medio 886,032746 ← el que suma la app
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('886,03 €');
    expect(await descripcionTarjeta(page, 'Gastos de notaría')).toContain(
      'Factura estimada entre 759,46 € y 1012,61 €',
    );

    // Registro (ARANCELES_REGISTRO, nº 2 del RD 1427/1989) sobre 320.000 €:
    //   24,04 + 24.040,49×0,175 % + 30.050,60×0,125 % + 90.151,82×0,075 % + 169.746,97×0,030 %
    //   = 24,04 + 42,0708575 + 37,56325 + 67,613865 + 50,924091 = 222,2120635 (< tope
    //   REGISTRO_MAXIMO 2.181,67) + 6,010121 (nº 1) + 3,005061 (nº 4) = 231,2272455
    //   con el 21 % de IVA = 279,7849671
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('279,78 €');
    expect(await valorTarjeta(page, 'Gastos de gestoría')).toBe('300,00 €');

    // Total = 25.600 + 886,032746 + 279,784967 + 300 = 27.065,817713 → 8,4581 % del precio
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('27.065,82 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toContain('8,46%');
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('347.065,82 €');
    // Segunda mano: TPO y AJD son incompatibles (art. 31.2 TRLITPAJD)
    await expect(page.locator('h3', { hasText: /^AJD/ })).toHaveCount(0);
  });

  test('CASO 22 (territorio con régimen especial) — Melilla, primera mano, vivienda de 180.000 €', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Primera mano/ }).click();
    await page.locator('#ccaa-inmueble').selectOption('melilla');
    await rellenar(page, 'Precio de la vivienda', '180000');
    await rellenar(page, 'Gastos de gestoría del comprador (€)', '300');

    // TERRITORIOS_SIN_IVA.melilla (`data/itp-ccaa.ts`) → IPSI: allí no se devenga IVA, así
    // que la app nombra el impuesto y NO inventa cifra. Ni tarjeta de IVA, ni aviso del
    // IVA del 4 % de VPO (IVA_INMUEBLES_2025.viviendaProtegida), que aquí no rebaja nada.
    await expect(page.locator('h3', { hasText: /^IVA/ })).toHaveCount(0);
    expect(await valorTarjeta(page, /^IPSI/)).toBe('No calculado');
    await expect(page.getByText(/protección oficial de régimen especial/)).toHaveCount(0);
    await expect(page.getByText(/no se aplica el IVA/)).toBeVisible();

    // AJD: ITP_CCAA.melilla.ajd = 0,5 → 180.000 × 0,5 % = 900 ; el art. 57 bis.1 del
    // TRLITPAJD bonifica al 50 % la cuota gradual cuando el Registro radica en Melilla
    // (`aplicarBonificacionCiudad`) → 450. El rótulo tiene que publicar el tipo EFECTIVO
    // 450/180.000 = 0,25 %, no el 0,5 % nominal de la tabla (hallazgo 473/484).
    await expect(page.locator('h3', { hasText: /^AJD/ }).first()).toHaveText('AJD (0,25%)');
    expect(await valorTarjeta(page, /^AJD/)).toBe('450,00 €');

    // Arancel notarial sobre 180.000 €: 90,15 + 108,182205 + 45,0759 + 90,15182
    //   + 29.746,97×0,05 % (=14,873485) = 348,43341 ; ×1,21 = 421,6044261 ; ×1,75 = 737,807746
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('737,81 €');
    // Registro: 24,04 + 42,0708575 + 37,56325 + 67,613865 + 29.746,97×0,030 % (=8,924091)
    //   = 180,2120635 ; + 9,015182 = 189,2272455 ; ×1,21 = 228,9649671
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('228,96 €');

    // Total = 0 + 450 + 737,807746 + 228,964967 + 300 = 1.716,772713 → 0,9538 % del precio.
    // Los rótulos tienen que decir que es PARCIAL: falta el IPSI, que la app no calcula.
    await expect(page.locator('h3', { hasText: /Total gastos adicionales/ }).first()).toHaveText(
      'Total gastos adicionales (parcial)',
    );
    expect(await valorTarjeta(page, /Total gastos adicionales/)).toBe('1716,77 €');
    expect(await descripcionTarjeta(page, /Total gastos adicionales/)).toContain(
      'SIN el IPSI, que no está incluido',
    );
    await expect(page.locator('h3', { hasText: /COSTE TOTAL/ }).first()).toHaveText(
      'COSTE TOTAL (PARCIAL)',
    );
    expect(await valorTarjeta(page, /COSTE TOTAL/)).toBe('181.716,77 €');
  });

  test('CASO 23 (límite: sin precio de compra) — el IRPF no está exento, está sin calcular', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await rellenar(page, 'Precio de la vivienda', '250000');
    await page.getByRole('button', { name: 'Vendedor' }).click();
    await rellenar(page, 'Años de propiedad', '8');
    await rellenar(page, 'Valor catastral del suelo', '50000');
    await rellenar(page, 'Valor catastral total (suelo + construcción)', '120000');
    await rellenar(page, 'Comisión inmobiliaria (%)', '3');
    // «Precio de compra original» se deja VACÍO a propósito: es el caso del hallazgo 483.

    // Sin precio de compra no hay ganancia que calcular, así que ni la plusvalía municipal
    // (necesita el incremento real, art. 104.5 TRLHL) ni el IRPF pueden salir. Un 0 en verde
    // rotulado «EXENTO» afirmaría una exención que nadie ha comprobado.
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('Sin calcular');
    expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('Sin calcular');
    expect(await descripcionTarjeta(page, 'IRPF sobre ganancia')).toContain(
      'Falta el precio de compra original',
    );
    await expect(page.getByText('EXENTO', { exact: true })).toHaveCount(0);
    // Sin valor de adquisición no se pintan las tarjetas derivadas
    await expect(page.locator('h3', { hasText: 'Valor de adquisición' })).toHaveCount(0);
    await expect(page.locator('h3', { hasText: 'Ganancia patrimonial' })).toHaveCount(0);

    // Lo único que el neto SÍ descuenta es la comisión: 250.000 × 3 % = 7.500
    // → neto = 250.000 − 7.500 = 242.500, y hay que decir que está incompleto.
    expect(await valorTarjeta(page, 'Comisión inmobiliaria')).toBe('7500,00 €');
    expect(await valorTarjeta(page, 'Total gastos vendedor')).toBe('7500,00 €');
    expect(await descripcionTarjeta(page, 'Total gastos vendedor')).toBe(
      'Sin la plusvalía municipal ni el IRPF de la ganancia',
    );
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('242.500,00 €');
    expect(await descripcionTarjeta(page, 'IMPORTE NETO VENDEDOR')).toContain('INCOMPLETO');
  });

  // Reparados el 30/08/2026 (Inspector, ronda 8, hallazgos 509-512). Los cuatro pasaron
  // de `test.fail` a verde y se quedan como regresión.
  test('509 — la fila AJD distingue la hipoteca (paga la entidad financiera, Ley 5/2019)', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
    const filaAJD = page.locator('table tbody tr', { hasText: /^AJD/ }).first();
    // La celda «¿Quién paga?» tiene que distinguir la hipoteca del resto.
    await expect(filaAJD.locator('td').nth(3)).toHaveText(/entidad financiera|banco|prestamista/i);
  });

  test('510 — el botón de primera mano nombra el impuesto real del territorio (Melilla → IPSI)', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await page.locator('#ccaa-inmueble').selectOption('melilla');
    await expect(page.getByRole('button', { name: /Primera mano/ })).toContainText('Paga IPSI');
  });

  test('512 — el aviso del neto solo pide el campo que de verdad falta', async ({ page }) => {
    await page.goto(RUTA);
    await rellenar(page, 'Precio de la vivienda', '250000');
    await page.getByRole('button', { name: 'Vendedor' }).click();
    await rellenar(page, 'Años de propiedad', '8');
    await rellenar(page, 'Valor catastral del suelo', '50000');
    await rellenar(page, 'Valor catastral total (suelo + construcción)', '120000');
    // El suelo YA está relleno: el único dato que falta es el precio de compra.
    expect(await descripcionTarjeta(page, 'IMPORTE NETO VENDEDOR')).toContain(
      'Rellena el precio de compra original para obtener el neto real',
    );
  });

  test('511 — el bloque educativo ya no atribuye al vendedor la gestoría del comprador', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
    const tarjeta = page.locator('h4', { hasText: 'IRPF del vendedor' }).locator('xpath=..');
    await expect(tarjeta).not.toHaveText(/se restan la comisión, la gestoría y la plusvalía/);
    await expect(tarjeta).toContainText('la del comprador no cuenta');
  });
});
