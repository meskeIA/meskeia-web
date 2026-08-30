/**
 * Inspector — simulador-gastos-compraventa-trastero (segmento FISCAL, riesgo 1 CRÍTICO)
 *
 * Primera inspección: 20/08/2026, posterior a la reparación de la factura notarial y del
 * arancel registral (commit 44a5dc7d). App hermana de simulador-gastos-compraventa-garaje:
 * comparten los motores de notaría y registro, y se han vuelto a verificar aquí desde cero.
 *
 * RE-INSPECCIÓN 27/08/2026 (la cola la reabrió porque `data/fiscal` cambió después de la
 * reparación del 21/08). Y RE-INSPECCIÓN DE CIERRE 28/08/2026, que verifica esa reparación y
 * añade las partes 5 a 7. El fichero tiene siete partes:
 *   1. CASOS 1-3 — los de la primera inspección, intactos y en verde.
 *   2. REGRESIONES — los 9 hallazgos del 20/08, reparados el 21/08 y hoy reproducidos uno a
 *      uno: los 9 siguen cerrados en lo que estas aserciones afirman.
 *   3. CASOS 4-7 (MITAD B, 27/08) — zonas que ninguna inspección anterior tocó: la plusvalía
 *      municipal del vendedor con sus dos métodos, la venta con pérdida y no sujeción, la
 *      bonificación de Ceuta y la escala progresiva catalana en un tramo alto de verdad, y
 *      el rechazo de una cifra malformada.
 *   4. REGRESIÓN 27/08 — los seis hallazgos de la re-inspección, reparados ese mismo día.
 *      Estaban escritos con `test.fail()` afirmando lo que DEBERÍA pasar; al repararlos se
 *      les quitó la marca y ahora sujetan la reparación.
 *   5. MITAD A (28/08) — el cierre de esa reparación por sus dos caras: en Canarias la obra
 *      nueva NO liquida IVA (IGIC sin cifra, total parcial) y la segunda mano SÍ liquida ITP
 *      al 6,5 %, que es donde una reparación así se pasa de largo.
 *   6. CASOS 8-9 (MITAD B, 28/08) — el método REAL de la plusvalía ganando al objetivo por la
 *      proporción catastral, y el tope del coeficiente del IIVTNU a los 20 años.
 *   7. HALLAZGOS ABIERTOS 28/08 — cuatro, con `test.fail()` y UNA sola aserción de fondo cada
 *      uno. Tres son reparaciones que llegaron a las apps hermanas y no a esta.
 *
 * De dónde sale CADA cifra esperada (ninguna de memoria):
 *  - Tipo general de ITP por CCAA → `TIPOS_ITP_CCAA_2025` en `data/fiscal/inmuebles.ts`,
 *    leído por `tipoGeneralDe()` en `data/itp-ccaa.ts` (Madrid = 6 %, Cataluña = 10 %,
 *    Galicia = 8 %).
 *  - Escala progresiva y AJD por CCAA → `ITP_CCAA` en `data/itp-ccaa.ts`
 *    (Cataluña 10/11/12/13 % y `ajd: 1.5` · Madrid `ajd: 0.75` · País Vasco `ajd: 0`).
 *  - IVA del trastero de obra nueva → `IVA_INMUEBLES_2025` en `data/fiscal/inmuebles.ts`.
 *    La app usa `garageCon: 10` para el trastero VINCULADO (anejo transmitido junto con la
 *    vivienda, art. 91.Uno.1.7º LIVA) y `garaje: 21` para el INDEPENDIENTE (finca registral
 *    propia, operación separada → tipo general).
 *  - Arancel notarial → `ARANCELES_NOTARIO` (RD 1426/1989, número 2: matriz + una copia) y
 *    la FACTURA que se muestra → `FACTURA_NOTARIAL` (horquilla ×1,5 a ×2, que cubre los
 *    números 4, 6 y 7 —copias, folios y suplidos—; la tarjeta enseña el punto medio ×1,75).
 *  - Arancel registral → `ARANCELES_REGISTRO` (RD 1427/1989, número 2) MÁS los dos importes
 *    fijos de `REGISTRO_CONCEPTOS`: asiento de presentación 6,010121 € (número 1) y nota
 *    simple 3,005061 € (número 4). Al registro NO se le aplica la horquilla de la notaría.
 *  - El 21 % de IVA sobre honorarios notariales y registrales va DENTRO de
 *    `calcularArancelNotarial` y `calcularRegistro` (ambas terminan en `* 1.21`).
 *  - Ganancia patrimonial e IRPF → `calcularGananciaInmueble` (`data/fiscal/ganancia-inmueble.ts`,
 *    arts. 34-36 LIRPF) sobre `TRAMOS_GANANCIAS_PATRIMONIALES_2025` (19 % hasta 6.000 ·
 *    21 % hasta 50.000 · 23 % hasta 200.000 · 27 % hasta 300.000 · 30 % resto).
 *  - Plusvalía municipal → `calcularPlusvaliaMunicipal` (`data/itp-ccaa.ts`) sobre
 *    `COEFICIENTES_IIVTNU_2025` y `PLUSVALIA_MUNICIPAL_META.tipoOrientativo` = 25 %
 *    (`data/fiscal/inmuebles.ts`, RDL 26/2021 y arts. 104.5 y 107.4-5 TRLHL).
 *  - Bonificación del 50 % de la cuota en Ceuta y Melilla → `ITP_CCAA.ceuta` /
 *    `aplicarBonificacionCiudad` (art. 57 bis TRLITPAJD).
 *  - Territorios donde NO rige el IVA español → `TERRITORIOS_SIN_IVA` (`data/itp-ccaa.ts`):
 *    Canarias (IGIC) y Ceuta y Melilla (IPSI).
 *  - Escala de recargos por presentación extemporánea → `lib/calculadoras/recargoPresentacionTardia.ts`
 *    (LGT art. 27.2 en la redacción de la Ley 11/2021).
 *
 * Todos los casos están resueltos a mano ANTES de ejecutar la app; el desarrollo va comentado
 * junto a cada aserción, con los importes sin redondear.
 *
 * Nota de formato: `formatCurrency` usa es-ES, que NO agrupa los millares de un número de
 * cuatro cifras («1535,59 €») y sí los de cinco o más («16.535,59 €»).
 *
 * Los hallazgos de la re-inspección van al final. Estaban marcados con `test.fail()` y hoy
 * están REPARADOS, así que la marca se retiró y las aserciones sujetan la reparación.
 */
import { test, expect, Page } from '@playwright/test';

const RUTA = '/simulador-gastos-compraventa-trastero/';

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

/** Texto de un elemento, con el espacio duro del formato español normalizado. */
async function texto(locator: ReturnType<Page['getByText']>): Promise<string> {
  return (await locator.innerText()).replace(ESPACIO_DURO, ' ').replace(/\s+/g, ' ').trim();
}

/** Texto descriptivo bajo el valor de una ResultCard. */
async function descripcionTarjeta(page: Page, titulo: string | RegExp): Promise<string> {
  const desc = page
    .locator('h3', { hasText: titulo })
    .first()
    .locator('xpath=../following-sibling::p[1]');
  return (await desc.innerText()).replace(ESPACIO_DURO, ' ').replace(/\s+/g, ' ').trim();
}

async function rellenar(page: Page, etiqueta: string, valor: string): Promise<void> {
  const campo = page.locator(`input[aria-label="${etiqueta}"]`);
  await campo.fill(valor);
  await campo.blur();
}

/**
 * Los dos desplegables ya tienen id desde la reparación del 21/08/2026 (#select-ccaa y
 * #select-perfil), pero se siguen localizando por posición para que el test no dependa de
 * un identificador: el de comunidad autónoma siempre existe; el de perfil solo se pinta en
 * la rama de segunda mano.
 */
const selectCcaa = (page: Page) => page.locator('select').nth(0);
const selectPerfil = (page: Page) => page.locator('select').nth(1);

test.describe('Simulador de gastos de compraventa de trastero — inspección 20/08/2026', () => {
  /**
   * CASO 1 (NORMAL) — segunda mano en una CCAA concreta, con el precio que la propia app
   * propone como placeholder (15.000 €) y la gestoría que trae por defecto (300 €).
   */
  test('CASO 1 (normal) — Madrid, segunda mano, 15.000 €, comprador general', async ({ page }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Segunda mano/ }).click();
    await selectCcaa(page).selectOption('madrid');
    await selectPerfil(page).selectOption('general');
    await rellenar(page, 'Precio del trastero', '15000');
    await rellenar(page, 'Gastos de gestoría del comprador (€)', '300');

    // ITP = 15.000 × 6 % = 900. El 6 % es TIPOS_ITP_CCAA_2025 → { ccaa: 'Madrid', tipo: 6 }.
    // Madrid no tiene escala progresiva, así que el tipo efectivo coincide con el nominal.
    // `elegirTipoITP` recibe `viviendaHabitual: false` (un trastero suelto nunca lo es), y
    // los tres reducidos de Madrid exigen vivienda habitual o municipio pequeño, así que
    // ninguno se aplica: el general es lo correcto.
    expect(await valorTarjeta(page, 'ITP (6,00%)')).toBe('900,00 €');
    expect(await descripcionTarjeta(page, 'ITP (6,00%)')).toContain('Comunidad de Madrid');

    // Notaría — RD 1426/1989, número 2 (ARANCELES_NOTARIO):
    //   tramo 1 (hasta 6.010,12 €)            →                             90,15
    //   tramo 2 (6.010,12→30.050,61, 0,45 %)  →  8.989,88 × 0,0045 =        40,45446
    //   arancel sin IVA                       =                           130,60446
    //   con el 21 % de IVA                    = 130,60446 × 1,21 =        158,0313966
    // FACTURA_NOTARIAL (números 4, 6 y 7 aparte): ×1,5 = 237,0470949 · ×2 = 316,0627932
    //   punto medio ×1,75, que es lo que suma la app =                    276,55494405
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('276,55 €');
    const notaria = await descripcionTarjeta(page, 'Gastos de notaría');
    expect(notaria).toContain('237,05 €');
    expect(notaria).toContain('316,06 €');

    // Registro — RD 1427/1989, números 1, 2 y 4 (ARANCELES_REGISTRO + REGISTRO_CONCEPTOS):
    //   tramo 1 (hasta 6.010,12 €)             →                            24,04
    //   tramo 2 (6.010,12→30.050,61, 0,175 %)  →  8.989,88 × 0,00175 =      15,73229
    //   inscripción (número 2)                 =                            39,77229
    //   + asiento de presentación (número 1)   →                             6,010121
    //   + nota simple (número 4)               →                             3,005061
    //                                          =                            48,787472
    //   con el 21 % de IVA                     = 48,787472 × 1,21 =         59,03284112
    // Al registro NO se le aplica el factor 1,5-2 de la notaría: son importes fijos.
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('59,03 €');

    // En segunda mano no hay AJD: la operación tributa por ITP y ambos son incompatibles.
    await expect(page.locator('h3', { hasText: 'AJD' })).toHaveCount(0);

    // Total gastos = 900 + 276,55494405 + 59,03284112 + 300 = 1.535,58778517
    //   % sobre el precio = 1.535,58778517 / 15.000 = 10,237252 %
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('1535,59 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toContain('10,24%');

    // Coste total = 15.000 + 1.535,58778517 = 16.535,58778517
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('16.535,59 €');
  });

  /**
   * CASO 2 (LÍMITE) — lo PROPIO del trastero: el mismo inmueble de obra nueva tributa al
   * 10 % si se transmite como anejo junto con la vivienda y al 21 % si es finca registral
   * independiente (art. 91.Uno.1.7º LIVA). Se comprueba el salto en los dos sentidos, y
   * sobre un precio tan bajo (3.000 €) que los importes fijos de notaría y registro
   * (230,89 €) pesan casi tanto como el propio impuesto del caso vinculado (300 €).
   */
  test('CASO 2 (límite) — obra nueva en Madrid, 3.000 €: IVA 10 % vinculado vs 21 % independiente', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Primera mano/ }).click();
    await selectCcaa(page).selectOption('madrid');
    await rellenar(page, 'Precio del trastero', '3000');
    await rellenar(page, 'Gastos de gestoría del comprador (€)', '300');

    // --- Trastero VINCULADO (es la modalidad por defecto) ---
    // IVA = 3.000 × 10 % = 300 — IVA_INMUEBLES_2025.garageCon = 10 (anejo con la vivienda).
    await expect(page.getByRole('button', { name: /Vinculado a vivienda/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(await valorTarjeta(page, 'IVA (10,00%)')).toBe('300,00 €');
    expect(await descripcionTarjeta(page, 'IVA (10,00%)')).toContain('anejo transmitido con la vivienda');

    // AJD = 3.000 × 0,75 % = 22,50 — ITP_CCAA.madrid.ajd = 0.75. Solo hay AJD en obra nueva.
    expect(await valorTarjeta(page, 'AJD (0,75%)')).toBe('22,50 €');

    // Notaría — por debajo de 6.010,12 € solo se devenga la cuota fija del primer tramo:
    //   90,15 × 1,21 (IVA) = 109,0815 de arancel
    //   horquilla FACTURA_NOTARIAL: ×1,5 = 163,62225 · ×2 = 218,163 · medio = 190,892625
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('190,89 €');
    const notaria = await descripcionTarjeta(page, 'Gastos de notaría');
    expect(notaria).toContain('163,62 €');
    expect(notaria).toContain('218,16 €');

    // Registro — cuota fija 24,04 + presentación 6,010121 + nota simple 3,005061 = 33,055182
    //   con el 21 % de IVA = 39,99677022
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('40,00 €');

    // Total vinculado = 300 + 22,5 + 190,892625 + 39,99677022 + 300 = 853,38939522
    //   % sobre el precio = 28,446313 %  ·  coste total = 3.853,38939522
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('853,39 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toContain('28,45%');
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('3853,39 €');

    // --- Mismo trastero, ahora INDEPENDIENTE ---
    await page.getByRole('button', { name: /Independiente/ }).click();

    // IVA = 3.000 × 21 % = 630 — IVA_INMUEBLES_2025.garaje = 21 (tipo general).
    // El salto respecto al vinculado es de 330 €, el 11 % del precio del trastero.
    expect(await valorTarjeta(page, 'IVA (21,00%)')).toBe('630,00 €');
    expect(await descripcionTarjeta(page, 'IVA (21,00%)')).toContain('trastero independiente');

    // El aviso tiene que explicar la CONDICIÓN, no solo el tipo: el 10 % es para los anejos
    // transmitidos junto con la vivienda.
    await expect(page.getByText(/solo se aplica a los anejos/)).toBeVisible();

    // Los fijos no se mueven (dependen del precio, no del tipo de IVA):
    expect(await valorTarjeta(page, 'AJD (0,75%)')).toBe('22,50 €');
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('190,89 €');
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('40,00 €');

    // Total independiente = 630 + 22,5 + 190,892625 + 39,99677022 + 300 = 1.183,38939522
    //   % sobre el precio = 39,446313 %  ·  coste total = 4.183,38939522
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('1183,39 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toContain('39,45%');
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('4183,39 €');

    // El 10 %/21 % es estatal (Ley 37/1992), no autonómico: cambiar de comunidad mueve el
    // AJD (Cataluña 1,5 % → 45 €) pero NO el IVA.
    await selectCcaa(page).selectOption('cataluna');
    expect(await valorTarjeta(page, 'IVA (21,00%)')).toBe('630,00 €');
    expect(await valorTarjeta(page, 'AJD (1,50%)')).toBe('45,00 €');

    // País Vasco tiene ITP_CCAA['pais-vasco'].ajd = 0, y entonces la tarjeta desaparece.
    await selectCcaa(page).selectOption('pais-vasco');
    expect(await valorTarjeta(page, 'IVA (21,00%)')).toBe('630,00 €');
    await expect(page.locator('h3', { hasText: 'AJD' })).toHaveCount(0);
  });

  /**
   * CASO 3 (DEBE RECHAZARSE) — un precio cero o negativo no puede producir presupuesto:
   * un ITP negativo (−3.000 × 6 % = −180 €) sería un «ahorro» inexistente, y un
   * «No definido» en la tarjeta de COSTE TOTAL sería peor que no responder.
   */
  test('CASO 3 (debe rechazarse) — precio negativo o cero: la app pide el dato en vez de calcular', async ({
    page,
  }) => {
    await page.goto(RUTA);
    const precio = page.locator('input[aria-label="Precio del trastero"]');
    const aviso = page.getByText(
      'Introduce el precio del trastero para ver el desglose de gastos del comprador',
    );

    // Sin escribir nada: parseSpanishNumber('') devuelve NaN y la guarda lo atrapa
    // (`!Number.isFinite(precio)`), así que no puede colarse ningún «No definido».
    await expect(aviso).toBeVisible();
    await expect(page.getByText('No definido')).toHaveCount(0);

    // Con un negativo y SIN salir del campo: la guarda `precio <= 0` corta el cálculo.
    await precio.fill('-3000');
    await expect(page.locator('h3', { hasText: 'COSTE TOTAL DE ADQUISICIÓN' })).toHaveCount(0);
    await expect(page.locator('h3', { hasText: 'ITP' })).toHaveCount(0);
    await expect(aviso).toBeVisible();

    // Al perder el foco, NumberInput normaliza al mínimo declarado (min = 0)...
    await precio.blur();
    await expect(precio).toHaveValue('0');

    // ...y con 0 tampoco calcula: nada de ITP de 0 €, ni notaría de 190,89 €, ni «0,00 %».
    await expect(page.locator('h3', { hasText: 'COSTE TOTAL DE ADQUISICIÓN' })).toHaveCount(0);
    await expect(page.locator('h3', { hasText: 'Gastos de notaría' })).toHaveCount(0);
    await expect(aviso).toBeVisible();
    await expect(page.getByText('No definido')).toHaveCount(0);

    // La pestaña del vendedor tiene la misma guarda sobre el mismo precio.
    await page.getByRole('button', { name: /Vendedor/ }).click();
    await expect(
      page.getByText('Introduce el precio de venta y los datos adicionales'),
    ).toBeVisible();
    await expect(page.locator('h3', { hasText: 'IMPORTE NETO VENDEDOR' })).toHaveCount(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// REGRESIONES — hallazgos del 20/08/2026, reparados el 21/08/2026. Afirman lo que debe
// pasar y hoy PASAN: si alguien reintroduce el defecto, saltan aquí.
// ─────────────────────────────────────────────────────────────────────────────

// ✅ REPARADO 21/08/2026 — cálculo.
// Hay UN solo campo de gestoría, en el panel «Datos de la operación» junto al precio y la
// CCAA, y su importe se cobra al COMPRADOR (tarjeta «Gastos de gestoría» dentro del COSTE
// TOTAL DE ADQUISICIÓN) y ADEMÁS se pasa como `gastosTransmision` del vendedor, donde resta
// del valor de transmisión. El art. 35.1 LIRPF solo admite como menor valor de transmisión
// los gastos «satisfechos por el transmitente»: los mismos 300 € no pueden ser a la vez
// coste del comprador y gasto deducible del vendedor. Rebaja el IRPF.
// Caso: 15.000 € de venta · 8.000 € de compra · gestoría 300 € (valor por defecto) →
//       esperado ganancia 6.550,00 € e IRPF 1.255,50 € (solo la comisión del 3 %, 450 €,
//       la paga el vendedor) · obtenido 6.250,00 € y 1.192,50 €, 63,00 € menos de IRPF.
//       Poniendo la gestoría a 0 la app da exactamente los valores esperados, lo que
//       confirma que el desvío viene de ese campo.
test('REGRESIÓN (cálculo) — la gestoría del comprador no puede reducir la ganancia del vendedor', async ({
  page,
}) => {
  await page.goto(RUTA);
  await rellenar(page, 'Precio del trastero', '15000');
  await rellenar(page, 'Gastos de gestoría del comprador (€)', '300');
  await page.getByRole('button', { name: /Vendedor/ }).click();
  await rellenar(page, 'Precio de compra original', '8000');

  // valor de transmisión = 15.000 − 450 de comisión = 14.550 (la gestoría es del comprador)
  // ganancia = 14.550 − 8.000 = 6.550 → IRPF = 6.000×19 % + 550×21 % = 1.140 + 115,50
  expect(await valorTarjeta(page, 'Valor de transmisión')).toBe('14.550,00 €');
  expect(await valorTarjeta(page, 'Ganancia patrimonial')).toBe('6550,00 €');
  expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('1255,50 €');
});

// ✅ REPARADO 21/08/2026 — contenido.
// Las tarjetas se titulan «Gastos de notaría (+ IVA)» y «Registro de la Propiedad (+ IVA)»,
// pero el importe YA lleva el 21 %: `calcularArancelNotarial` y `calcularRegistro` terminan
// en `total * 1.21`. «+ IVA» significa en castellano «IVA aparte», así que quien presupuesta
// suma un 21 % que ya está dentro. Vale cualquiera de las dos salidas —rotular «IVA
// incluido» o publicar la base sin IVA—; lo que no puede quedarse es el «+».
// Caso: Madrid · segunda mano · 15.000 € → «Gastos de notaría (+ IVA)» = 276,55 €
//       (130,60446 de arancel × 1,21 de IVA × 1,75 de factura) y «Registro de la Propiedad
//       (+ IVA)» = 59,03 € (48,787472 × 1,21). Esperado un rótulo que no prometa un IVA
//       aparte · obtenido el «(+ IVA)», que lleva a presupuestar 334,63 € y 71,43 €.
test('REGRESIÓN (contenido) — el rótulo «(+ IVA)» contradice a unos importes que ya llevan el 21 %', async ({
  page,
}) => {
  await page.goto(RUTA);
  await rellenar(page, 'Precio del trastero', '15000');

  expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('276,55 €');
  expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('59,03 €');
  const tituloNotaria = await page.locator('h3', { hasText: 'Gastos de notaría' }).first().innerText();
  const tituloRegistro = await page
    .locator('h3', { hasText: 'Registro de la Propiedad' })
    .first()
    .innerText();
  expect(tituloNotaria).not.toMatch(/\+\s*IVA/);
  expect(tituloRegistro).not.toMatch(/\+\s*IVA/);
});

// ✅ REPARADO 21/08/2026 — dato.
// La fila «AJD en primera mano» de la tabla comparativa dice «0,5% – 1,5% según CCAA» en sus
// tres columnas, escrito a mano. En la misma página, ITP_CCAA['pais-vasco'].ajd = 0: al
// elegir País Vasco el recuadro imprime «AJD 0%» y la tarjeta de AJD desaparece. El 1,5 %
// del extremo alto sí es correcto (es el máximo de la tabla); el que falla es el mínimo.
// Caso: primera mano · independiente · País Vasco · 3.000 € → esperado que la fila de AJD
//       incluya el 0 % que la propia app aplica · obtenido «0,5% – 1,5% según CCAA» y
//       cero tarjetas de AJD en el resultado.
test('REGRESIÓN (dato) — el rango de AJD de la tabla deja fuera el 0 % del País Vasco', async ({
  page,
}) => {
  await page.goto(RUTA);
  await page.getByRole('button', { name: /Primera mano/ }).click();
  await selectCcaa(page).selectOption('pais-vasco');
  await rellenar(page, 'Precio del trastero', '3000');
  await expect(page.locator('h3', { hasText: 'AJD' })).toHaveCount(0);

  await page.getByRole('button', { name: /Ver guía educativa/i }).click();
  await expect(page.locator('tr', { hasText: 'AJD en primera mano' })).toContainText('0%');
});

// ✅ REPARADO 21/08/2026 — contenido.
// La tarjeta «Trastero de segunda mano» del bloque educativo se quedó con las cifras de
// notaría y registro de antes de la reparación del 20/08/2026: dice «notaría (~160 €) y
// registro (~90 €)» y «un coste adicional de ~2.350 €». El ITP sí cuadra (10 % del primer
// tramo de la escala catalana = 1.800 €), pero los otros dos no, y en sentidos opuestos.
// Caso: Cataluña · segunda mano · 18.000 € → la app calcula notaría 305,14 € (144,10446 ×
//       1,21 × 1,75) y registro 65,39 € (54,037472 × 1,21); ITP + notaría + registro =
//       2.170,53 €. Esperado que el ejemplo repita esas cifras · obtenido ~160 €, ~90 € y
//       ~2.350 €, con la notaría casi al doble.
test('REGRESIÓN (contenido) — el ejemplo de Cataluña publica una notaría que el motor ya no da', async ({
  page,
}) => {
  await page.goto(RUTA);
  await selectCcaa(page).selectOption('cataluna');
  await rellenar(page, 'Precio del trastero', '18000');
  expect(await valorTarjeta(page, 'ITP (10,00%)')).toBe('1800,00 €');
  expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('305,14 €');
  expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('65,39 €');

  await page.getByRole('button', { name: /Ver guía educativa/i }).click();
  const ejemplo = await texto(
    page.getByText(/Una persona compra un trastero independiente en Cataluña/),
  );
  expect(ejemplo).toContain('305,14 €');
  expect(ejemplo).toContain('65,39 €');
});

// ✅ REPARADO 21/08/2026 — contenido.
// La tarjeta «Vender un trastero» anuncia una ganancia que el motor no produce: dice que
// comprado por 8.000 € y vendido por 15.000 € «la ganancia de 7.000 € tributará al 19 % en
// la base del ahorro (1.330 €)». El motor del art. 35 LIRPF descuenta del valor de
// transmisión los gastos de la venta, y con los valores por defecto de la propia app
// (comisión 3 % y gestoría 300 €) la ganancia no es 7.000 €. Además el tipo no es plano:
// los últimos 250 € van al 21 %, así que ni siquiera un 19 % sobre 7.000 daría la cifra.
// Caso: precio de venta 15.000 € · compra 8.000 € · comisión 3 % · gestoría 300 € (todo por
//       defecto) → esperado que el ejemplo diga lo mismo que la calculadora, 6.250,00 € de
//       ganancia y 1.192,50 € de IRPF · obtenido «7.000 €» y «1.330 €», 137,50 € de más.
test('REGRESIÓN (contenido) — la tarjeta de venta anuncia una ganancia que el motor no produce', async ({
  page,
}) => {
  await page.goto(RUTA);
  await rellenar(page, 'Precio del trastero', '15000');
  await page.getByRole('button', { name: /Vendedor/ }).click();
  await rellenar(page, 'Precio de compra original', '8000');
  expect(await valorTarjeta(page, 'Ganancia patrimonial')).toBe('6550,00 €');
  expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('1255,50 €');

  await page.getByRole('button', { name: /Ver guía educativa/i }).click();
  const ejemplo = await texto(page.getByText(/El vendedor debe calcular la plusvalía municipal/));
  // es-ES no agrupa los millares en cifras de cuatro dígitos: «1255,50 €», no «1.255,50 €»
  expect(ejemplo).toContain('1255,50 €');
});

// ✅ REPARADO 21/08/2026 — contenido.
// La tarjeta «Tipos reducidos de ITP» promete un «Ahorro de 600 € con el tipo reducido del
// 3%» para un joven que compra un trastero en Galicia por 12.000 €, y remite solo a «los
// requisitos de la Xunta para jóvenes compradores». El reducido gallego del 3 % exige
// «Vivienda habitual» (ITP_CCAA.galicia), y la app pasa `viviendaHabitual: false` a
// `elegirTipoITP` a propósito porque un trastero suelto no lo es nunca. La propia app lo
// dice tres pantallas más arriba: «Un trastero comprado por separado no es vivienda
// habitual, así que los tipos que exigen esa condición no suelen aplicarse».
// Caso: Galicia · segunda mano · joven · 12.000 € → esperado que el ejemplo nombre la
//       condición de vivienda habitual · obtenido una promesa de 360 € de ITP mientras la
//       calculadora cobra 960,00 € (8 %) y saca el aviso «Podrías pagar menos».
test('REGRESIÓN (contenido) — el ejemplo del reducido gallego omite la condición que lo bloquea', async ({
  page,
}) => {
  await page.goto(RUTA);
  await selectCcaa(page).selectOption('galicia');
  await rellenar(page, 'Precio del trastero', '12000');
  await selectPerfil(page).selectOption('joven');
  expect(await valorTarjeta(page, 'ITP (8,00%)')).toBe('960,00 €');
  await expect(page.getByText(/Podrías pagar menos/)).toBeVisible();

  await page.getByRole('button', { name: /Ver guía educativa/i }).click();
  const ejemplo = await texto(page.getByText(/Un joven de 30 años que compra un trastero en Galicia/));
  expect(ejemplo).toMatch(/vivienda habitual/i);
});

// ✅ REPARADO 21/08/2026 — contenido.
// La nota que encabeza la app dice del trastero independiente que «puede tributar diferente
// según la comunidad autónoma». La diferencia que la app aplica —y la única que hay— es
// ESTATAL: el 10 % del anejo transmitido con la vivienda frente al 21 % general del
// art. 91.Uno.1.7º LIVA. El selector de comunidad no mueve ese tipo ni un punto, y en la
// rama de segunda mano la modalidad no cambia absolutamente nada del cálculo.
// Caso: primera mano · independiente · 3.000 € → IVA 630,00 € (21 %) en Madrid, en Cataluña
//       y en País Vasco; y en segunda mano · Madrid · 15.000 €, alternar vinculado ↔
//       independiente deja el ITP en 900,00 € y el coste total en 16.535,59 €. Esperado que
//       la nota nombre el 21 % estatal · obtenido la remisión a la comunidad autónoma.
test('REGRESIÓN (contenido) — la nota atribuye a la CCAA una diferencia que es estatal', async ({
  page,
}) => {
  await page.goto(RUTA);
  await page.getByRole('button', { name: /Primera mano/ }).click();
  await page.getByRole('button', { name: /Independiente/ }).click();
  await rellenar(page, 'Precio del trastero', '3000');
  for (const comunidad of ['madrid', 'cataluna', 'pais-vasco']) {
    await selectCcaa(page).selectOption(comunidad);
    expect(await valorTarjeta(page, 'IVA (21,00%)')).toBe('630,00 €');
  }

  const nota = await page.locator('[class*="trasteroNote"]').first().innerText();
  expect(nota).toContain('21%');
});

// ✅ REPARADO 21/08/2026 — operativa.
// Cuando faltan los datos de la plusvalía municipal (años de propiedad y valor catastral del
// suelo), la app imprime «0,00 €» en la tarjeta y suma ese 0 al total de gastos y al neto del
// vendedor, aunque su propia descripción diga «No calculada (faltan datos)». Un importe de
// cero y un importe desconocido no son lo mismo: el neto sale más alto de lo que será.
// Caso: 15.000 € de venta · 8.000 € de compra · sin años ni valor catastral → esperado que
//       la tarjeta no dé una cifra (o que el neto avise de que le falta la plusvalía) ·
//       obtenido «Plusvalía municipal 0,00 €» y un «IMPORTE NETO VENDEDOR 13.057,50 €»
//       presentado como «Lo que realmente recibes tras los gastos».
test('REGRESIÓN (operativa) — una plusvalía no calculada no puede presentarse como 0,00 €', async ({
  page,
}) => {
  await page.goto(RUTA);
  await rellenar(page, 'Precio del trastero', '15000');
  await page.getByRole('button', { name: /Vendedor/ }).click();
  await rellenar(page, 'Precio de compra original', '8000');
  expect(await descripcionTarjeta(page, 'Plusvalía municipal')).toContain('faltan datos');
  expect(await valorTarjeta(page, 'Plusvalía municipal')).not.toBe('0,00 €');
});

// ✅ REPARADO 21/08/2026 — accesibilidad.
// Los dos <select> de la app («Comunidad Autónoma» y «Perfil del comprador») no tienen id,
// ni aria-label, ni aria-labelledby, y el <label> que los precede no lleva htmlFor ni los
// envuelve: son labels huérfanos. Un lector de pantalla anuncia «cuadro combinado» sin decir
// de qué. La CCAA es el dato que más mueve el resultado (del 4 % al 13 % de ITP). Los labels
// de «Modalidad del trastero» y «Tipo de transmisión» están igual de sueltos sobre sus
// grupos de botones.
// Caso: abrir la app → los dos selects devuelven nombre accesible vacío (id null, aria-label
//       null, aria-labelledby null, ningún label[for]) · esperado «Comunidad Autónoma
//       (ubicación del trastero)» y «Perfil del comprador (para tipos reducidos)».
test('REGRESIÓN (accesibilidad) — los desplegables deben tener nombre accesible', async ({
  page,
}) => {
  await page.goto(RUTA);
  await page.getByRole('button', { name: /Segunda mano/ }).click();
  await expect(selectCcaa(page)).toHaveAccessibleName(/Comunidad Autónoma/);
  await expect(selectPerfil(page)).toHaveAccessibleName(/Perfil del comprador/);
});

// ═════════════════════════════════════════════════════════════════════════════
// MITAD B — casos nuevos de la re-inspección del 27/08/2026, en zonas que ninguna
// inspección anterior tocó: la plusvalía municipal por sus dos métodos, la venta con
// pérdida, la bonificación de Ceuta, la escala progresiva catalana y el rechazo de una
// cifra malformada. Resueltos a mano ANTES de abrir el navegador.
// ═════════════════════════════════════════════════════════════════════════════

test.describe('MITAD B — zonas no cubiertas por la inspección del 20/08/2026', () => {
  /**
   * CASO 4 (NORMAL, pestaña Vendedor) — la plusvalía municipal con TODOS sus datos, que es
   * la parte del vendedor que la inspección anterior solo tocó por su ausencia (hallazgo 88).
   * Se elige a propósito un caso donde el método objetivo gana al real, para comprobar que
   * la app aplica el mínimo del art. 107.5 TRLHL y lo dice.
   */
  test('CASO 4 (normal) — vendedor con plusvalía calculada: 15.000/8.000, 5 años, suelo 4.000 de 9.000', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await rellenar(page, 'Precio del trastero', '15000');
    await page.getByRole('button', { name: /Vendedor/ }).click();
    await rellenar(page, 'Precio de compra original', '8000');
    await rellenar(page, 'Impuestos y gastos que pagaste al comprarlo', '1000');
    await rellenar(page, 'Años de propiedad', '5');
    await rellenar(page, 'Valor catastral del suelo', '4000');
    await rellenar(page, 'Valor catastral total (suelo + construcción)', '9000');

    // Plusvalía municipal — calcularPlusvaliaMunicipal (data/itp-ccaa.ts):
    //   método OBJETIVO (art. 107.4 TRLHL): COEFICIENTES_IIVTNU_2025 da 0,17 a los 5 años
    //     base = 4.000 × 0,17 = 680 · cuota = 680 × 25 % = 170,00
    //     (el 25 % es PLUSVALIA_MUNICIPAL_META.tipoOrientativo, no el 30 % máximo legal)
    //   método REAL (art. 107.5 TRLHL): el incremento se reparte en la proporción catastral
    //     (15.000 − 8.000) × (4.000 / 9.000) × 25 % = 7.000 × 0,4444… × 0,25 = 777,777…
    //   el contribuyente elige el más favorable → 170,00 €, y el método se nombra.
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('170,00 €');
    expect(await descripcionTarjeta(page, 'Plusvalía municipal')).toContain('Método objetivo');

    // Valor de adquisición (art. 35.1 LIRPF) = 8.000 + 1.000 de impuestos y gastos = 9.000
    expect(await valorTarjeta(page, 'Valor de adquisición')).toBe('9000,00 €');

    // Valor de transmisión (art. 35.2 LIRPF) = 15.000 − 450 de comisión (3 % por defecto)
    //   − 0 de gestoría del vendedor − 170 de plusvalía municipal = 14.380
    expect(await valorTarjeta(page, 'Valor de transmisión')).toBe('14.380,00 €');
    expect(await valorTarjeta(page, 'Comisión inmobiliaria (3%)')).toBe('450,00 €');

    // Ganancia = 14.380 − 9.000 = 5.380 → cabe entera en el primer tramo del ahorro
    //   (TRAMOS_GANANCIAS_PATRIMONIALES_2025: 19 % hasta 6.000) → 5.380 × 19 % = 1.022,20
    expect(await valorTarjeta(page, 'Ganancia patrimonial')).toBe('5380,00 €');
    expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('1022,20 €');

    // Total gastos vendedor = 170 + 450 + 0 de gestoría + 1.022,20 = 1.642,20
    // Neto = 15.000 − 1.642,20 = 13.357,80
    expect(await valorTarjeta(page, 'Total gastos vendedor')).toBe('1642,20 €');
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('13.357,80 €');
    // Con la plusvalía ya calculada, el neto deja de ser un techo (reparación del hallazgo 88)
    expect(await descripcionTarjeta(page, 'IMPORTE NETO VENDEDOR')).toContain('realmente recibes');
  });

  /**
   * CASO 5 (LÍMITE) — vender por DEBAJO de lo que se pagó. Toca a la vez las dos ramas que
   * se salen del camino normal: la no sujeción del art. 104.5 TRLHL (sin incremento de valor
   * no hay plusvalía municipal) y la pérdida patrimonial del art. 33 LIRPF (sin cuota).
   * Es el caso en el que un cero mal puesto se convierte en un impuesto inexistente.
   */
  test('CASO 5 (límite) — venta con pérdida: plusvalía no sujeta y cero IRPF', async ({ page }) => {
    await page.goto(RUTA);
    await rellenar(page, 'Precio del trastero', '8000');
    await page.getByRole('button', { name: /Vendedor/ }).click();
    await rellenar(page, 'Precio de compra original', '12000');
    await rellenar(page, 'Años de propiedad', '10');
    await rellenar(page, 'Valor catastral del suelo', '5000');
    await rellenar(page, 'Valor catastral total (suelo + construcción)', '10000');

    // incremento real = 8.000 − 12.000 = −4.000 ≤ 0 → `exento` en calcularPlusvaliaMunicipal.
    // No puede salir la cuota objetiva (5.000 × 0,08 × 25 % = 100,00 €): sin incremento de
    // valor el impuesto no se devenga, y el rótulo tiene que decirlo con palabras.
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('EXENTO');
    expect(await descripcionTarjeta(page, 'Plusvalía municipal')).toContain('No sujeta');

    // valor de transmisión = 8.000 − 240 (comisión 3 %) = 7.760 · valor de adquisición = 12.000
    // ganancia = 7.760 − 12.000 = −4.240 → pérdida patrimonial, sin cuota
    expect(await valorTarjeta(page, 'Valor de adquisición')).toBe('12.000,00 €');
    expect(await valorTarjeta(page, 'Valor de transmisión')).toBe('7760,00 €');
    expect(await valorTarjeta(page, 'Pérdida patrimonial')).toBe('4240,00 €');
    expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('SIN CUOTA');
    await expect(page.locator('h3', { hasText: 'Ganancia patrimonial' })).toHaveCount(0);

    // Total gastos = 0 de plusvalía + 240 de comisión + 0 de gestoría + 0 de IRPF = 240
    // Neto = 8.000 − 240 = 7.760
    expect(await valorTarjeta(page, 'Total gastos vendedor')).toBe('240,00 €');
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('7760,00 €');
  });

  /**
   * CASO 6 (LÍMITE) — las dos comunidades cuyo ITP NO es un porcentaje plano del precio:
   * Ceuta, donde el art. 57 bis TRLITPAJD bonifica la cuota al 50 % por el SITIO del
   * inmueble (y por tanto se aplica también a un trastero, que nunca es vivienda habitual),
   * y Cataluña, cuya escala progresiva solo se separa del tipo plano por encima de 600.000 €.
   */
  test('CASO 6 (límite) — Ceuta bonificada al 50 % y la escala progresiva catalana por encima de 600.000 €', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await selectCcaa(page).selectOption('ceuta');
    await rellenar(page, 'Precio del trastero', '20000');

    // ITP_CCAA.ceuta: tipoGeneral 6 y un reducido «Bonificación general 50%» del 3 % cuyas
    // condiciones son ['Inmueble situado en Ceuta', 'Bonificación automática 50%'] — las dos
    // de UBICACIÓN, así que `elegirTipoITP` las da por cumplidas con el perfil general.
    //   20.000 × 3 % = 600,00 (la mitad de los 1.200 del tipo general)
    expect(await valorTarjeta(page, 'ITP (3,00%)')).toBe('600,00 €');

    // Cataluña, 700.000 € — tramosProgresivos 10/11/12/13 %:
    //   600.000 × 10 % = 60.000 · (700.000 − 600.000) × 11 % = 11.000 → 71.000,00
    //   tipo EFECTIVO = 71.000 / 700.000 = 10,142857 % (NO el 10 % nominal del primer tramo:
    //   el tipo plano daría 70.000 €, mil euros menos)
    await selectCcaa(page).selectOption('cataluna');
    await rellenar(page, 'Precio del trastero', '700000');
    expect(await valorTarjeta(page, 'ITP (10,14%)')).toBe('71.000,00 €');
    await expect(page.getByText(/aplica escala progresiva/)).toBeVisible();

    // Notaría a ese precio — ARANCELES_NOTARIO acumulado hasta 700.000 = 588,63583 sin IVA;
    //   × 1,21 = 712,2493543 de arancel · factura media × 1,75 = 1.246,43637
    // Registro — ARANCELES_REGISTRO acumulado 326,3132735 (por debajo del tope de 2.181,67)
    //   + 6,010121 de presentación + 3,005061 de nota simple = 335,3284555 · × 1,21 = 405,747…
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('1246,44 €');
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('405,75 €');
  });

  /**
   * CASO 7 (DEBE RECHAZARSE) — una cifra malformada. `NumberInput` filtra las letras con su
   * regex `/^-?[\d.,]*$/`, así que lo que de verdad puede llegar al motor es un número con
   * dos separadores mal puestos. `parseSpanishNumber` devuelve NaN para «1.2.3» (está en su
   * propia documentación), y la app tiene que pedir el dato en vez de calcular sobre NaN.
   */
  test('CASO 7 (debe rechazarse) — «1.2.3» no es un precio: ni cálculo ni «No definido»', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await rellenar(page, 'Precio del trastero', '1.2.3');

    await expect(
      page.getByText('Introduce el precio del trastero para ver el desglose de gastos del comprador'),
    ).toBeVisible();
    await expect(page.locator('h3', { hasText: 'COSTE TOTAL DE ADQUISICIÓN' })).toHaveCount(0);
    await expect(page.locator('h3', { hasText: 'Gastos de notaría' })).toHaveCount(0);
    await expect(page.getByText('No definido')).toHaveCount(0);
    // Sobre el texto completo y con mayúsculas: `getByText('NaN')` es una búsqueda de
    // subcadena SIN distinguir mayúsculas y casaría con «ganancia», que lleva «nan» dentro.
    expect(await page.locator('body').innerText()).not.toContain('NaN');

    // Lo mismo en el campo de gestoría: `parseSpanishNumberOr` devuelve su valor por defecto
    // (0) en vez de contaminar el total. Con un precio válido, el total no puede llevar NaN.
    await rellenar(page, 'Precio del trastero', '15000');
    await rellenar(page, 'Gastos de gestoría del comprador (€)', '1.2.3');
    // 900 de ITP + 276,55494405 de notaría + 59,03284112 de registro + 0 de gestoría
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('1235,59 €');
    await expect(page.locator('h3', { hasText: 'Gastos de gestoría' })).toHaveCount(0);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// HALLAZGOS ABIERTOS — re-inspección del 27/08/2026.
// Marcados con `test.fail()`: afirman lo que DEBERÍA pasar, así que hoy fallan a propósito.
// Cuando se reparen, se les quita la marca y quedan como regresión.
// ═════════════════════════════════════════════════════════════════════════════

test.describe('REGRESIÓN — hallazgos del 27/08/2026, reparados', () => {
  // ✅ REPARADO 27/08 (alto) — cálculo. REPARACIÓN A MEDIAS del commit c47189ca.
  // En Canarias, Ceuta y Melilla no rige el IVA español: `TERRITORIOS_SIN_IVA`
  // (data/itp-ccaa.ts) los declara como IGIC e IPSI. La app RENDERIZA el componente
  // `AvisoTerritorioSinIva`, que dice literalmente «Esta herramienta no lo calcula, así que
  // el importe del impuesto indirecto no es el tuyo»… y la tarjeta de al lado liquida un IVA
  // que allí no existe y lo suma a un total rotulado «Precio del trastero + todos los gastos».
  // A esta app llegó el aviso pero NO el cálculo: `page.tsx` ni siquiera importa
  // `TERRITORIOS_SIN_IVA`. Las tres hermanas del clúster (nave-industrial, solar y
  // terreno-rústico) lo resolvieron con una bandera `impuestoNoCalculado` que deja el
  // impuesto sin cifra y rotula «COSTE TOTAL (PARCIAL)».
  // Caso: Canarias · primera mano · vinculado · 15.000 € · gestoría 300 € → esperado ninguna
  //       cifra de impuesto indirecto y el total marcado como parcial · obtenido
  //       «IVA (10,00%) 1500,00 €», «Total gastos adicionales 2248,09 € — 14,99% sobre el
  //       precio» y «COSTE TOTAL DE ADQUISICIÓN 17.248,09 € — Precio del trastero + todos los
  //       gastos». En Ceuta con trastero independiente: «IVA (21,00%) 3150,00 €» y 18.823,09 €.
  test('REGRESIÓN (cálculo) — en Canarias, Ceuta y Melilla no puede liquidarse IVA', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Primera mano/ }).click();
    await selectCcaa(page).selectOption('canarias');
    await rellenar(page, 'Precio del trastero', '15000');
    await rellenar(page, 'Gastos de gestoría del comprador (€)', '300');

    // El aviso SÍ está: es el cálculo el que no se enteró.
    await expect(page.getByText(/no se aplica el IVA/)).toBeVisible();

    // Ninguna tarjeta puede titularse «IVA» ni poner cifra a ese impuesto…
    await expect(page.locator('h3', { hasText: /^IVA/ })).toHaveCount(0);
    // …y el total no puede presentarse como completo mientras falte el impuesto indirecto.
    const total = await page.locator('h3', { hasText: /COSTE TOTAL/ }).first().innerText();
    expect(total).toMatch(/PARCIAL/i);
  });

  // ✅ REPARADO 27/08 (medio) — dato.
  // El único `<DataReference>` de la página declara «ITP/AJD/IVA 2026» con
  // FISCAL_INMUEBLES_META (verificado 17/06/2026), pero la pestaña Vendedor emite dos cifras
  // normativas más con vigencia y verificación PROPIAS y sin ninguna referencia: la plusvalía
  // municipal, calculada con COEFICIENTES_IIVTNU_2025 y PLUSVALIA_MUNICIPAL_META
  // (RDL 26/2021; ese módulo declara `verificado: '2025-01-15'` y `vigencia: '2025'`, y avisa
  // de que los coeficientes se actualizan cada Ley de Presupuestos), y el IRPF de la ganancia
  // con TRAMOS_GANANCIAS_PATRIMONIALES_2025. La página presenta datos de 2025 bajo un sello
  // de 2026. La app hermana del garaje cerró exactamente esto (hallazgo 35) añadiendo un
  // segundo DataReference con PLUSVALIA_MUNICIPAL_META; aquí no llegó.
  // Caso: pestaña Vendedor · 15.000/8.000 · 5 años · suelo 4.000 · total 9.000 → plusvalía
  //       170,00 € (coeficiente 0,17 de 2025) e IRPF 1022,20 € (tramos de 2025) · esperado un
  //       bloque de referencia que nombre la plusvalía municipal · obtenido un solo bloque
  //       «DATOS DE REFERENCIA — Normativa aplicada: ITP/AJD/IVA 2026 · última verificación
  //       17/06/2026», que no cubre ninguna de las dos.
  test('REGRESIÓN (dato) — la plusvalía municipal y el IRPF se publican sin su propia referencia', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await rellenar(page, 'Precio del trastero', '15000');
    await page.getByRole('button', { name: /Vendedor/ }).click();
    await rellenar(page, 'Precio de compra original', '8000');
    await rellenar(page, 'Años de propiedad', '5');
    await rellenar(page, 'Valor catastral del suelo', '4000');
    await rellenar(page, 'Valor catastral total (suelo + construcción)', '9000');
    // Plusvalía, método objetivo: 4.000 × 0,17 (coeficiente de 5 años, COEFICIENTES_IIVTNU_2025)
    //   = 680 de base × 25 % (PLUSVALIA_MUNICIPAL_META.tipoOrientativo) = 170,00 €.
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('170,00 €');

    // ⚠️ El acta anotaba aquí 1022,20 €, y esa cifra NO sale de ningún camino: estaba dentro
    // de un `test.fail()`, donde basta con que el test falle en ALGÚN punto, así que la
    // aserción nunca llegó a comprobarse. Resuelto a mano con el art. 35 LIRPF:
    //   comisión (3 % por defecto)  = 15.000 × 0,03            =    450,00
    //   valor de transmisión        = 15.000 − 450 − 170       = 14.380,00
    //   valor de adquisición        = 8.000 (sin gastos declarados)
    //   ganancia                    = 14.380 − 8.000           =  6.380,00
    //   IRPF (TRAMOS_GANANCIAS_PATRIMONIALES_2025)
    //        6.000 × 19 %           =                             1.140,00
    //          380 × 21 %           =                                79,80
    //                               =                             1.219,80
    expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('1219,80 €');

    // Debe existir una referencia que cubra el IIVTNU, además de la de ITP/AJD/IVA.
    await expect(page.getByText(/Normativa aplicada:.*(IIVTNU|[Pp]lusval)/)).toBeVisible();
  });

  // ✅ REPARADO 27/08 (medio) — dato.
  // El consejo «Liquida los impuestos a tiempo» del bloque educativo lleva escrita a mano una
  // escala de recargos por presentación extemporánea que contradice a la calculadora canónica
  // del propio catálogo: `lib/calculadoras/recargoPresentacionTardia.ts` aplica el art. 27.2
  // LGT en la redacción de la Ley 11/2021 —1 % por cada mes completo hasta 12 meses, y 15 %
  // más intereses de demora desde el mes 13— mientras esta app anuncia «recargos automáticos
  // del 5% al 20%», que es la escala ANTERIOR a esa reforma. No hay módulo en data/fiscal con
  // este dato, así que el número vive inline pudiendo derivarse de la lógica ya existente.
  // Caso: desplegar la guía educativa → consejo «Liquida los impuestos a tiempo»: obtenido
  //       «El incumplimiento genera recargos automáticos del 5% al 20%» · esperado la escala
  //       vigente. Sobre el ITP de 900,00 € del caso de Madrid que la propia página publica,
  //       un mes de retraso son 9,00 € y la app hace temer entre 45,00 € y 180,00 €.
  test('REGRESIÓN (dato) — la escala de recargos del bloque educativo es la anterior a la Ley 11/2021', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Ver guía educativa/i }).click();
    const consejo = await texto(page.getByText(/recargos/i).first());
    expect(consejo).not.toMatch(/5\s*%?\s*al\s*20\s*%/);
    expect(consejo).toMatch(/1\s*%.*mes|15\s*%/);
  });

  // ✅ REPARADO 27/08 (medio) — accesibilidad. REPARACIÓN A MEDIAS del hallazgo 85 (21/08/2026).
  // Aquel hallazgo nombraba dos cosas: los `<select>` sin nombre accesible —reparados, ver la
  // regresión de más arriba— y que «los labels de "Modalidad del trastero" y "Tipo de
  // transmisión" están igualmente sueltos sobre sus grupos de botones». Esa segunda mitad
  // sigue igual: los dos `<label>` no tienen `for` ni envuelven ningún control, y el par de
  // botones no va dentro de ningún `role="group"` ni `<fieldset>`, así que quien navega por
  // voz oye «Vinculado a vivienda» y «Segunda mano» sin saber de qué pregunta son opciones.
  // No lo cubre `npm run check:a11y-jsx`, que vigila type=, aria-hidden y aria-pressed: los
  // tres están correctos en esta página.
  // Caso: abrir la app y evaluar en el DOM →
  //       document.querySelectorAll('[role="group"],[role="radiogroup"],fieldset').length
  //       esperado ≥ 2 · obtenido 0; y los labels sin destino son
  //       ["Modalidad del trastero", "Tipo de transmisión"] (los otros dos labels huérfanos
  //       son de NumberInput, cuyo input sí lleva aria-label).
  test('REGRESIÓN (accesibilidad) — los dos grupos de botones deben tener nombre accesible', async ({
    page,
  }) => {
    await page.goto(RUTA);
    const grupos = await page.locator('[role="group"], [role="radiogroup"], fieldset').count();
    expect(grupos).toBeGreaterThanOrEqual(2);
  });

  // ✅ REPARADO 27/08 (bajo) — contenido.
  // El título de la tarjeta de comisión del vendedor interpola el TEXTO CRUDO del input
  // —`Comisión inmobiliaria (${comisionInmobiliaria}%)`— en vez de pasarlo por `formatNumber`,
  // así que un porcentaje tecleado con punto decimal se publica en formato estadounidense,
  // contra la regla de formato español obligatoria. El importe sí es correcto. Es el mismo
  // resto que el garaje tiene abierto (hallazgo 438).
  // Caso: pestaña Vendedor · precio de venta 15.000 € · compra 8.000 € · «Comisión
  //       inmobiliaria (%)» = 3.5 → esperado el título «Comisión inmobiliaria (3,5%)» ·
  //       obtenido «Comisión inmobiliaria (3.5%)», con el importe 525,00 €, que sí es
  //       correcto (15.000 × 3,5 %).
  test('REGRESIÓN (contenido) — el porcentaje de comisión se publica en formato estadounidense', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await rellenar(page, 'Precio del trastero', '15000');
    await page.getByRole('button', { name: /Vendedor/ }).click();
    await rellenar(page, 'Precio de compra original', '8000');
    await rellenar(page, 'Comisión inmobiliaria (%)', '3.5');

    const titulo = await page.locator('h3', { hasText: 'Comisión inmobiliaria' }).first().innerText();
    expect(titulo).toContain('3,5%');
    expect(titulo).not.toContain('3.5%');
  });

  // ✅ REPARADO 27/08 (bajo) — operativa.
  // Mientras el campo de gestoría tiene el foco, un importe negativo se suma tal cual al total
  // y su tarjeta ni se pinta (la guarda es `gastosGestoria > 0`), así que el total en pantalla
  // no cuadra con las líneas visibles. El `min={0}` de NumberInput solo actúa en el blur. La
  // hermana `nave-industrial` cerró esto el 23/08/2026 acotando con `Math.max(0, …)` dentro
  // del useMemo, y el comentario de su código explica por qué no basta con el blur.
  // Caso: Madrid · segunda mano · 15.000 € · escribir «-500» en «Gastos de gestoría del
  //       comprador (€)» SIN salir del campo → esperado que el total siga siendo la suma de
  //       lo que se ve, 1235,59 € (900 de ITP + 276,55 de notaría + 59,03 de registro) ·
  //       obtenido «Total gastos adicionales 735,59 € — 4,90% sobre el precio» y «COSTE TOTAL
  //       DE ADQUISICIÓN 15.735,59 €», 500 € por debajo de sus propias líneas.
  test('REGRESIÓN (operativa) — una gestoría negativa con el foco puesto descuadra el total', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await rellenar(page, 'Precio del trastero', '15000');
    const gestoria = page.locator('input[aria-label="Gastos de gestoría del comprador (€)"]');
    await gestoria.fill('-500'); // sin blur: el min={0} de NumberInput aún no ha actuado

    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('1235,59 €');
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('16.235,59 €');
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// RE-INSPECCIÓN DE CIERRE — 28/08/2026.
//
// MITAD A: comprobar que la reparación del commit d787b81b (el IVA que no existe en
// Canarias, Ceuta y Melilla) es correcta Y que no se ha pasado de largo: en SEGUNDA mano
// esos territorios sí liquidan ITP, y ahí no hay nada que dejar «sin calcular».
// MITAD B: casos nuevos sobre la parte del motor que ninguna ronda había tocado — el
// método REAL de la plusvalía ganando al objetivo (art. 107.5 TRLHL), el tope del
// coeficiente del IIVTNU a los 20 años y las partidas del vendedor sin acotar.
//
// Cifras: `TIPOS_ITP_CCAA_2025` (Canarias = 6,5 %), `ITP_CCAA` (Canarias `ajd: 0.75`,
// Ceuta `ajd: 0.5` + bonificación del 50 % del art. 57 bis TRLITPAJD),
// `COEFICIENTES_IIVTNU_2025`, `PLUSVALIA_MUNICIPAL_META.tipoOrientativo` (25 %) y
// `TRAMOS_GANANCIAS_PATRIMONIALES_2025`. Aranceles: RD 1426/1989 y RD 1427/1989.
// ═════════════════════════════════════════════════════════════════════════════

test.describe('MITAD A (28/08/2026) — cierre de la reparación del impuesto que no existe', () => {
  /**
   * La reparación es CORRECTA: en Canarias la obra nueva no devenga IVA sino IGIC, así que
   * el impuesto indirecto se queda sin cifra y el total se rotula parcial. Lo que sí se
   * sigue cobrando es todo lo demás, y eso es lo que se verifica línea a línea.
   */
  test('CIERRE (normal) — Canarias, primera mano, 25.000 €: IGIC sin cifra y el resto completo', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Primera mano/ }).click();
    await selectCcaa(page).selectOption('canarias');
    await rellenar(page, 'Precio del trastero', '25000');
    await rellenar(page, 'Gastos de gestoría del comprador (€)', '300');

    // TERRITORIOS_SIN_IVA.canarias = IGIC: ninguna tarjeta puede titularse «IVA»…
    await expect(page.locator('h3', { hasText: /^IVA/ })).toHaveCount(0);
    expect(await valorTarjeta(page, 'IGIC')).toBe('No calculado');
    expect(await descripcionTarjeta(page, 'IGIC')).toContain('no rige el IVA');

    // …pero el AJD SÍ se devenga en Canarias, y sin bonificación de ciudad autónoma:
    //   25.000 × 0,75 % (ITP_CCAA.canarias.ajd) = 187,50
    expect(await valorTarjeta(page, 'AJD (0,75%)')).toBe('187,50 €');

    // Notaría — RD 1426/1989 nº 2: 90,15 + (25.000 − 6.010,12) × 0,45 % = 175,60446
    //   × 1,21 de IVA = 212,4813966 · factura media × 1,75 = 371,84244405
    //   horquilla: × 1,5 = 318,7220949 y × 2 = 424,9627932
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('371,84 €');
    const notaria = await descripcionTarjeta(page, 'Gastos de notaría');
    expect(notaria).toContain('318,72 €');
    expect(notaria).toContain('424,96 €');

    // Registro — RD 1427/1989: 24,04 + (25.000 − 6.010,12) × 0,175 % = 57,27229
    //   + 6,010121 de presentación + 3,005061 de nota simple = 66,287472 · × 1,21 = 80,20784112
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('80,21 €');

    // Total = 0 de impuesto indirecto + 187,50 + 371,84244405 + 80,20784112 + 300 = 939,55028517
    //   % sobre el precio = 939,55028517 / 25.000 = 3,758201 %
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('939,55 €');
    const desglose = await descripcionTarjeta(page, 'Total gastos adicionales');
    expect(desglose).toContain('3,76%');
    expect(desglose).toContain('SIN el IGIC');

    // Y el total tiene que decir que está incompleto, no rotularse como coste de adquisición.
    const tituloTotal = await page.locator('h3', { hasText: /COSTE TOTAL/ }).first().innerText();
    expect(tituloTotal).toMatch(/PARCIAL/i);
    expect(await valorTarjeta(page, 'COSTE TOTAL')).toBe('25.939,55 €');
  });

  /**
   * La contrapartida, que es donde una reparación de este tipo se pasa de largo: en SEGUNDA
   * mano no hay IVA que quitar —la operación tributa por ITP— y Canarias tiene tipo propio.
   * Si la bandera de «territorio sin IVA» se hubiera aplicado a las dos ramas, aquí saldría
   * «No calculado» y el simulador dejaría de servir para el caso más frecuente.
   */
  test('CIERRE (contrapartida) — en Canarias la SEGUNDA mano sigue pagando ITP al 6,50 %', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Segunda mano/ }).click();
    await selectCcaa(page).selectOption('canarias');
    await selectPerfil(page).selectOption('general');
    await rellenar(page, 'Precio del trastero', '25000');
    await rellenar(page, 'Gastos de gestoría del comprador (€)', '300');

    // TIPOS_ITP_CCAA_2025 → { ccaa: 'Canarias', tipo: 6.5 }. Sin escala progresiva y sin
    // bonificación de ciudad, el tipo efectivo coincide con el nominal:
    //   25.000 × 6,5 % = 1.625,00
    // Ninguno de los cuatro reducidos de Canarias es aplicable: los tres primeros exigen
    // vivienda habitual (un trastero suelto nunca lo es) y el cuarto, VPO.
    expect(await valorTarjeta(page, 'ITP (6,50%)')).toBe('1625,00 €');
    expect(await descripcionTarjeta(page, 'ITP (6,50%)')).toContain('Canarias');

    // El aviso de territorio sin IVA NO debe salir aquí: en ITP no hay nada que advertir.
    await expect(page.getByText(/no se aplica el IVA/)).toHaveCount(0);

    // Total = 1.625 + 371,84244405 + 80,20784112 + 300 = 2.377,05028517 → 9,508201 %
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('2377,05 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toContain('9,51%');
    // Y el rótulo del total vuelve a ser el completo, sin «(PARCIAL)».
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('27.377,05 €');
  });
});

test.describe('MITAD B (28/08/2026) — zonas del motor que ninguna ronda anterior tocó', () => {
  /**
   * CASO 8 (NORMAL) — la rama de la plusvalía que faltaba: el método REAL ganando al
   * objetivo. El caso 4 del 27/08 eligió a propósito uno donde ganaba el objetivo, así que
   * la proporción catastral suelo/total del art. 107.5 TRLHL nunca había decidido el
   * resultado. De paso entra por primera vez la gestoría del VENDEDOR, que solo desde la
   * reparación del 20/08 es un campo distinto del de la gestoría del comprador.
   */
  test('CASO 8 (normal) — el método real gana al objetivo y la gestoría del vendedor resta en el art. 35.2', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await rellenar(page, 'Precio del trastero', '20000');
    await page.getByRole('button', { name: /Vendedor/ }).click();
    await rellenar(page, 'Precio de compra original', '18000');
    await rellenar(page, 'Impuestos y gastos que pagaste al comprarlo', '500');
    await rellenar(page, 'Años de propiedad', '15');
    await rellenar(page, 'Valor catastral del suelo', '6000');
    await rellenar(page, 'Valor catastral total (suelo + construcción)', '30000');
    await rellenar(page, 'Comisión inmobiliaria (%)', '4');
    await rellenar(page, 'Gestoría y certificados del vendedor (€)', '250');

    // Plusvalía municipal — los dos métodos, con el suelo pesando solo un 20 % del catastro:
    //   OBJETIVO  6.000 × 0,12 (coeficiente de 15 años) × 25 % =            180,00
    //   REAL      (20.000 − 18.000) × (6.000 / 30.000) × 25 % =            100,00
    //   el contribuyente elige el menor (art. 107.5 TRLHL) →               100,00
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('100,00 €');
    expect(await descripcionTarjeta(page, 'Plusvalía municipal')).toContain('Método real');

    // Valor de adquisición = 18.000 + 500 de impuestos y gastos de aquella compra = 18.500
    // Valor de transmisión = 20.000 − 800 (comisión 4 %) − 250 (gestoría propia) − 100 = 18.850
    expect(await valorTarjeta(page, 'Valor de adquisición')).toBe('18.500,00 €');
    expect(await valorTarjeta(page, 'Valor de transmisión')).toBe('18.850,00 €');
    expect(await valorTarjeta(page, 'Comisión inmobiliaria (4%)')).toBe('800,00 €');
    expect(await valorTarjeta(page, 'Gastos de gestoría')).toBe('250,00 €');

    // Ganancia = 18.850 − 18.500 = 350 → primer tramo del ahorro: 350 × 19 % = 66,50
    expect(await valorTarjeta(page, 'Ganancia patrimonial')).toBe('350,00 €');
    expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('66,50 €');

    // Total gastos = 100 + 800 + 250 + 66,50 = 1.216,50 · neto = 20.000 − 1.216,50 = 18.783,50
    expect(await valorTarjeta(page, 'Total gastos vendedor')).toBe('1216,50 €');
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('18.783,50 €');
  });

  /**
   * CASO 9 (LÍMITE) — el tope del coeficiente del IIVTNU. `COEFICIENTES_IIVTNU_2025` llega
   * hasta «20 o más años» y `calcularPlusvaliaMunicipal` acota con
   * `Math.min(Math.max(anios, 1), 20)`; el campo admite hasta 50, así que 30 años tienen que
   * dar exactamente lo mismo que 20 y no un `undefined` que caiga en el 0,45 por defecto.
   * La ganancia, además, cruza al segundo tramo de la base del ahorro.
   */
  test('CASO 9 (límite) — 30 años de propiedad: el coeficiente se topa en el de 20 años', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await rellenar(page, 'Precio del trastero', '25000');
    await page.getByRole('button', { name: /Vendedor/ }).click();
    await rellenar(page, 'Precio de compra original', '5000');
    await rellenar(page, 'Años de propiedad', '30');
    await rellenar(page, 'Valor catastral del suelo', '10000');
    await rellenar(page, 'Valor catastral total (suelo + construcción)', '20000');

    // OBJETIVO  10.000 × 0,45 (coeficiente de «20 o más años») × 25 % =  1.125,00
    // REAL      (25.000 − 5.000) × (10.000 / 20.000) × 25 % =            2.500,00
    // gana el objetivo → 1.125,00
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('1125,00 €');
    expect(await descripcionTarjeta(page, 'Plusvalía municipal')).toContain('Método objetivo');

    // Valor de transmisión = 25.000 − 750 (comisión 3 % por defecto) − 1.125 = 23.125
    // Ganancia = 23.125 − 5.000 = 18.125 → 6.000 × 19 % = 1.140 · 12.125 × 21 % = 2.546,25
    //   cuota = 3.686,25
    expect(await valorTarjeta(page, 'Valor de transmisión')).toBe('23.125,00 €');
    expect(await valorTarjeta(page, 'Ganancia patrimonial')).toBe('18.125,00 €');
    expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('3686,25 €');

    // Total gastos = 1.125 + 750 + 0 + 3.686,25 = 5.561,25 · neto = 25.000 − 5.561,25
    expect(await valorTarjeta(page, 'Total gastos vendedor')).toBe('5561,25 €');
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('19.438,75 €');
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// Hallazgos 483-486 de la re-inspección del 28/08/2026 — reparados.
// ═════════════════════════════════════════════════════════════════════════════

// Hallazgo 484 — reparado. El rótulo del AJD da ahora el tipo EFECTIVO
// (`ajd / precioInmueble`), no el nominal de la tabla, igual que ya hacían nave-industrial
// y estimador-compraventa-inmueble.
test('REGRESIÓN — el rótulo del AJD en Ceuta anuncia el tipo bonificado, no el nominal', async ({
  page,
}) => {
  await page.goto(RUTA);
  await page.getByRole('button', { name: /Primera mano/ }).click();
  await selectCcaa(page).selectOption('ceuta');
  await rellenar(page, 'Precio del trastero', '30000');

  const titulo = await page.locator('h3', { hasText: 'AJD' }).first().innerText();
  expect(titulo).toContain('0,25%');
});

// Hallazgo 483 — reparado. Sin precio de compra original, `irpfCalculado` es falso y la
// tarjeta dice «Sin calcular» en variante neutra (no «SIN CUOTA» en verde), y el neto nombra
// también el IRPF entre lo que falta, igual que ya hacía estimador-compraventa-inmueble.
test('REGRESIÓN — sin precio de compra, el IRPF no se anuncia «SIN CUOTA» en verde', async ({
  page,
}) => {
  await page.goto(RUTA);
  await rellenar(page, 'Precio del trastero', '15000');
  await page.getByRole('button', { name: /Vendedor/ }).click();

  expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('Sin calcular');
});

// Hallazgo 485 — reparado. El botón «Primera mano» y el aviso de modalidad independiente
// nombran ahora el impuesto local (IGIC/IPSI) en vez de prometer un IVA que allí no existe.
test('REGRESIÓN — en Canarias el botón no ofrece un tipo de IVA', async ({
  page,
}) => {
  await page.goto(RUTA);
  await page.getByRole('button', { name: /Primera mano/ }).click();
  await selectCcaa(page).selectOption('canarias');

  const rotulo = await texto(page.getByRole('button', { name: /Primera mano/ }));
  expect(rotulo).not.toMatch(/IVA\s*\d/);
});

// Hallazgo 486 — reparado. La comisión y la gestoría del VENDEDOR se acotan ahora con
// `Math.max(0, …)` dentro del useMemo, igual que el 457 ya acotó la gestoría del comprador.
test('CASO 10 (debe rechazarse) — una comisión negativa con el foco puesto ya no infla el neto', async ({
  page,
}) => {
  await page.goto(RUTA);
  await rellenar(page, 'Precio del trastero', '15000');
  await page.getByRole('button', { name: /Vendedor/ }).click();
  await rellenar(page, 'Precio de compra original', '8000');
  const comision = page.locator('input[aria-label="Comisión inmobiliaria (%)"]');
  await comision.fill('-10'); // sin blur: el min={0} de NumberInput aún no ha actuado

  expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('13.650,00 €');
});
