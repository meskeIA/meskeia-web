/**
 * Inspector — simulador-gastos-compraventa-trastero (segmento FISCAL, riesgo 1 CRÍTICO)
 * Primera inspección: 20/08/2026, posterior a la reparación de la factura notarial y del
 * arancel registral (commit 44a5dc7d). App hermana de simulador-gastos-compraventa-garaje:
 * comparten los motores de notaría y registro, y se han vuelto a verificar aquí desde cero.
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
 *
 * Los tres casos están resueltos a mano ANTES de ejecutar la app; el desarrollo va comentado
 * junto a cada aserción, con los importes sin redondear.
 *
 * Nota de formato: `formatCurrency` usa es-ES, que NO agrupa los millares de un número de
 * cuatro cifras («1535,59 €») y sí los de cinco o más («16.535,59 €»).
 *
 * HALLAZGOS ABIERTOS: al final, marcados con `test.fail()`. Afirman lo que DEBERÍA pasar y
 * hoy fallan a propósito; el día que se reparen, se les quita el `test.fail()` y quedan
 * como regresión.
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
 * Los dos desplegables no tienen id ni nombre accesible (ver el hallazgo de accesibilidad
 * del final), así que hay que localizarlos por posición: el de comunidad autónoma siempre
 * existe; el de perfil solo se pinta en la rama de segunda mano.
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
    await rellenar(page, 'Gastos de gestoría (€)', '300');

    // ITP = 15.000 × 6 % = 900. El 6 % es TIPOS_ITP_CCAA_2025 → { ccaa: 'Madrid', tipo: 6 }.
    // Madrid no tiene escala progresiva, así que el tipo efectivo coincide con el nominal.
    // `elegirTipoITP` recibe `viviendaHabitual: false` (un trastero suelto nunca lo es), y
    // los tres reducidos de Madrid exigen vivienda habitual o municipio pequeño, así que
    // ninguno se aplica: el general es lo correcto.
    expect(await valorTarjeta(page, 'ITP (6,0%)')).toBe('900,00 €');
    expect(await descripcionTarjeta(page, 'ITP (6,0%)')).toContain('Comunidad de Madrid');

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
    await rellenar(page, 'Gastos de gestoría (€)', '300');

    // --- Trastero VINCULADO (es la modalidad por defecto) ---
    // IVA = 3.000 × 10 % = 300 — IVA_INMUEBLES_2025.garageCon = 10 (anejo con la vivienda).
    await expect(page.getByRole('button', { name: /Vinculado a vivienda/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(await valorTarjeta(page, 'IVA (10,0%)')).toBe('300,00 €');
    expect(await descripcionTarjeta(page, 'IVA (10,0%)')).toContain('anejo transmitido con la vivienda');

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
    expect(await valorTarjeta(page, 'IVA (21,0%)')).toBe('630,00 €');
    expect(await descripcionTarjeta(page, 'IVA (21,0%)')).toContain('trastero independiente');

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
    expect(await valorTarjeta(page, 'IVA (21,0%)')).toBe('630,00 €');
    expect(await valorTarjeta(page, 'AJD (1,50%)')).toBe('45,00 €');

    // País Vasco tiene ITP_CCAA['pais-vasco'].ajd = 0, y entonces la tarjeta desaparece.
    await selectCcaa(page).selectOption('pais-vasco');
    expect(await valorTarjeta(page, 'IVA (21,0%)')).toBe('630,00 €');
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
// HALLAZGOS ABIERTOS del 20/08/2026. Todos fallan HOY a propósito.
// ─────────────────────────────────────────────────────────────────────────────

// ⚠️ HALLAZGO ABIERTO — cálculo.
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
test('HALLAZGO (cálculo) — la gestoría del comprador no puede reducir la ganancia del vendedor', async ({
  page,
}) => {
  test.fail(); // hallazgo abierto: quitar esta línea el día que se repare
  await page.goto(RUTA);
  await rellenar(page, 'Precio del trastero', '15000');
  await rellenar(page, 'Gastos de gestoría (€)', '300');
  await page.getByRole('button', { name: /Vendedor/ }).click();
  await rellenar(page, 'Precio de compra original', '8000');

  // valor de transmisión = 15.000 − 450 de comisión = 14.550 (la gestoría es del comprador)
  // ganancia = 14.550 − 8.000 = 6.550 → IRPF = 6.000×19 % + 550×21 % = 1.140 + 115,50
  expect(await valorTarjeta(page, 'Valor de transmisión')).toBe('14.550,00 €');
  expect(await valorTarjeta(page, 'Ganancia patrimonial')).toBe('6550,00 €');
  expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('1255,50 €');
});

// ⚠️ HALLAZGO ABIERTO — contenido.
// Las tarjetas se titulan «Gastos de notaría (+ IVA)» y «Registro de la Propiedad (+ IVA)»,
// pero el importe YA lleva el 21 %: `calcularArancelNotarial` y `calcularRegistro` terminan
// en `total * 1.21`. «+ IVA» significa en castellano «IVA aparte», así que quien presupuesta
// suma un 21 % que ya está dentro. Vale cualquiera de las dos salidas —rotular «IVA
// incluido» o publicar la base sin IVA—; lo que no puede quedarse es el «+».
// Caso: Madrid · segunda mano · 15.000 € → «Gastos de notaría (+ IVA)» = 276,55 €
//       (130,60446 de arancel × 1,21 de IVA × 1,75 de factura) y «Registro de la Propiedad
//       (+ IVA)» = 59,03 € (48,787472 × 1,21). Esperado un rótulo que no prometa un IVA
//       aparte · obtenido el «(+ IVA)», que lleva a presupuestar 334,63 € y 71,43 €.
test('HALLAZGO (contenido) — el rótulo «(+ IVA)» contradice a unos importes que ya llevan el 21 %', async ({
  page,
}) => {
  test.fail(); // hallazgo abierto: quitar esta línea el día que se repare
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

// ⚠️ HALLAZGO ABIERTO — dato.
// La fila «AJD en primera mano» de la tabla comparativa dice «0,5% – 1,5% según CCAA» en sus
// tres columnas, escrito a mano. En la misma página, ITP_CCAA['pais-vasco'].ajd = 0: al
// elegir País Vasco el recuadro imprime «AJD 0%» y la tarjeta de AJD desaparece. El 1,5 %
// del extremo alto sí es correcto (es el máximo de la tabla); el que falla es el mínimo.
// Caso: primera mano · independiente · País Vasco · 3.000 € → esperado que la fila de AJD
//       incluya el 0 % que la propia app aplica · obtenido «0,5% – 1,5% según CCAA» y
//       cero tarjetas de AJD en el resultado.
test('HALLAZGO (dato) — el rango de AJD de la tabla deja fuera el 0 % del País Vasco', async ({
  page,
}) => {
  test.fail(); // hallazgo abierto: quitar esta línea el día que se repare
  await page.goto(RUTA);
  await page.getByRole('button', { name: /Primera mano/ }).click();
  await selectCcaa(page).selectOption('pais-vasco');
  await rellenar(page, 'Precio del trastero', '3000');
  await expect(page.locator('h3', { hasText: 'AJD' })).toHaveCount(0);

  await page.getByRole('button', { name: /Ver guía educativa/i }).click();
  await expect(page.locator('tr', { hasText: 'AJD en primera mano' })).toContainText('0%');
});

// ⚠️ HALLAZGO ABIERTO — contenido.
// La tarjeta «Trastero de segunda mano» del bloque educativo se quedó con las cifras de
// notaría y registro de antes de la reparación del 20/08/2026: dice «notaría (~160 €) y
// registro (~90 €)» y «un coste adicional de ~2.350 €». El ITP sí cuadra (10 % del primer
// tramo de la escala catalana = 1.800 €), pero los otros dos no, y en sentidos opuestos.
// Caso: Cataluña · segunda mano · 18.000 € → la app calcula notaría 305,14 € (144,10446 ×
//       1,21 × 1,75) y registro 65,39 € (54,037472 × 1,21); ITP + notaría + registro =
//       2.170,53 €. Esperado que el ejemplo repita esas cifras · obtenido ~160 €, ~90 € y
//       ~2.350 €, con la notaría casi al doble.
test('HALLAZGO (contenido) — el ejemplo de Cataluña publica una notaría que el motor ya no da', async ({
  page,
}) => {
  test.fail(); // hallazgo abierto: quitar esta línea el día que se repare
  await page.goto(RUTA);
  await selectCcaa(page).selectOption('cataluna');
  await rellenar(page, 'Precio del trastero', '18000');
  expect(await valorTarjeta(page, 'ITP (10,0%)')).toBe('1800,00 €');
  expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('305,14 €');
  expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('65,39 €');

  await page.getByRole('button', { name: /Ver guía educativa/i }).click();
  const ejemplo = await page
    .getByText(/Una persona compra un trastero independiente en Cataluña/)
    .innerText();
  expect(ejemplo).toContain('305,14 €');
  expect(ejemplo).toContain('65,39 €');
});

// ⚠️ HALLAZGO ABIERTO — contenido.
// La tarjeta «Vender un trastero» anuncia una ganancia que el motor no produce: dice que
// comprado por 8.000 € y vendido por 15.000 € «la ganancia de 7.000 € tributará al 19 % en
// la base del ahorro (1.330 €)». El motor del art. 35 LIRPF descuenta del valor de
// transmisión los gastos de la venta, y con los valores por defecto de la propia app
// (comisión 3 % y gestoría 300 €) la ganancia no es 7.000 €. Además el tipo no es plano:
// los últimos 250 € van al 21 %, así que ni siquiera un 19 % sobre 7.000 daría la cifra.
// Caso: precio de venta 15.000 € · compra 8.000 € · comisión 3 % · gestoría 300 € (todo por
//       defecto) → esperado que el ejemplo diga lo mismo que la calculadora, 6.250,00 € de
//       ganancia y 1.192,50 € de IRPF · obtenido «7.000 €» y «1.330 €», 137,50 € de más.
test('HALLAZGO (contenido) — la tarjeta de venta anuncia una ganancia que el motor no produce', async ({
  page,
}) => {
  test.fail(); // hallazgo abierto: quitar esta línea el día que se repare
  await page.goto(RUTA);
  await rellenar(page, 'Precio del trastero', '15000');
  await page.getByRole('button', { name: /Vendedor/ }).click();
  await rellenar(page, 'Precio de compra original', '8000');
  expect(await valorTarjeta(page, 'Ganancia patrimonial')).toBe('6250,00 €');
  expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('1192,50 €');

  await page.getByRole('button', { name: /Ver guía educativa/i }).click();
  const ejemplo = await page
    .getByText(/El vendedor debe calcular la plusvalía municipal/)
    .innerText();
  expect(ejemplo).toContain('1.192,50 €');
});

// ⚠️ HALLAZGO ABIERTO — contenido.
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
test('HALLAZGO (contenido) — el ejemplo del reducido gallego omite la condición que lo bloquea', async ({
  page,
}) => {
  test.fail(); // hallazgo abierto: quitar esta línea el día que se repare
  await page.goto(RUTA);
  await selectCcaa(page).selectOption('galicia');
  await rellenar(page, 'Precio del trastero', '12000');
  await selectPerfil(page).selectOption('joven');
  expect(await valorTarjeta(page, 'ITP (8,0%)')).toBe('960,00 €');
  await expect(page.getByText(/Podrías pagar menos/)).toBeVisible();

  await page.getByRole('button', { name: /Ver guía educativa/i }).click();
  const ejemplo = await page
    .getByText(/Un joven de 30 años que compra un trastero en Galicia/)
    .innerText();
  expect(ejemplo).toMatch(/vivienda habitual/i);
});

// ⚠️ HALLAZGO ABIERTO — contenido.
// La nota que encabeza la app dice del trastero independiente que «puede tributar diferente
// según la comunidad autónoma». La diferencia que la app aplica —y la única que hay— es
// ESTATAL: el 10 % del anejo transmitido con la vivienda frente al 21 % general del
// art. 91.Uno.1.7º LIVA. El selector de comunidad no mueve ese tipo ni un punto, y en la
// rama de segunda mano la modalidad no cambia absolutamente nada del cálculo.
// Caso: primera mano · independiente · 3.000 € → IVA 630,00 € (21 %) en Madrid, en Cataluña
//       y en País Vasco; y en segunda mano · Madrid · 15.000 €, alternar vinculado ↔
//       independiente deja el ITP en 900,00 € y el coste total en 16.535,59 €. Esperado que
//       la nota nombre el 21 % estatal · obtenido la remisión a la comunidad autónoma.
test('HALLAZGO (contenido) — la nota atribuye a la CCAA una diferencia que es estatal', async ({
  page,
}) => {
  test.fail(); // hallazgo abierto: quitar esta línea el día que se repare
  await page.goto(RUTA);
  await page.getByRole('button', { name: /Primera mano/ }).click();
  await page.getByRole('button', { name: /Independiente/ }).click();
  await rellenar(page, 'Precio del trastero', '3000');
  for (const comunidad of ['madrid', 'cataluna', 'pais-vasco']) {
    await selectCcaa(page).selectOption(comunidad);
    expect(await valorTarjeta(page, 'IVA (21,0%)')).toBe('630,00 €');
  }

  const nota = await page.locator('[class*="trasteroNote"]').first().innerText();
  expect(nota).toContain('21%');
});

// ⚠️ HALLAZGO ABIERTO — operativa.
// Cuando faltan los datos de la plusvalía municipal (años de propiedad y valor catastral del
// suelo), la app imprime «0,00 €» en la tarjeta y suma ese 0 al total de gastos y al neto del
// vendedor, aunque su propia descripción diga «No calculada (faltan datos)». Un importe de
// cero y un importe desconocido no son lo mismo: el neto sale más alto de lo que será.
// Caso: 15.000 € de venta · 8.000 € de compra · sin años ni valor catastral → esperado que
//       la tarjeta no dé una cifra (o que el neto avise de que le falta la plusvalía) ·
//       obtenido «Plusvalía municipal 0,00 €» y un «IMPORTE NETO VENDEDOR 13.057,50 €»
//       presentado como «Lo que realmente recibes tras los gastos».
test('HALLAZGO (operativa) — una plusvalía no calculada no puede presentarse como 0,00 €', async ({
  page,
}) => {
  test.fail(); // hallazgo abierto: quitar esta línea el día que se repare
  await page.goto(RUTA);
  await rellenar(page, 'Precio del trastero', '15000');
  await page.getByRole('button', { name: /Vendedor/ }).click();
  await rellenar(page, 'Precio de compra original', '8000');
  expect(await descripcionTarjeta(page, 'Plusvalía municipal')).toContain('faltan datos');
  expect(await valorTarjeta(page, 'Plusvalía municipal')).not.toBe('0,00 €');
});

// ⚠️ HALLAZGO ABIERTO — accesibilidad.
// Los dos <select> de la app («Comunidad Autónoma» y «Perfil del comprador») no tienen id,
// ni aria-label, ni aria-labelledby, y el <label> que los precede no lleva htmlFor ni los
// envuelve: son labels huérfanos. Un lector de pantalla anuncia «cuadro combinado» sin decir
// de qué. La CCAA es el dato que más mueve el resultado (del 4 % al 13 % de ITP). Los labels
// de «Modalidad del trastero» y «Tipo de transmisión» están igual de sueltos sobre sus
// grupos de botones.
// Caso: abrir la app → los dos selects devuelven nombre accesible vacío (id null, aria-label
//       null, aria-labelledby null, ningún label[for]) · esperado «Comunidad Autónoma
//       (ubicación del trastero)» y «Perfil del comprador (para tipos reducidos)».
test('HALLAZGO (accesibilidad) — los desplegables deben tener nombre accesible', async ({
  page,
}) => {
  test.fail(); // hallazgo abierto: quitar esta línea el día que se repare
  await page.goto(RUTA);
  await page.getByRole('button', { name: /Segunda mano/ }).click();
  await expect(selectCcaa(page)).toHaveAccessibleName(/Comunidad Autónoma/);
  await expect(selectPerfil(page)).toHaveAccessibleName(/Perfil del comprador/);
});
