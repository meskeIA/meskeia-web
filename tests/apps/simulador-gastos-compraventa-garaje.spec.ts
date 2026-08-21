/**
 * Inspector — simulador-gastos-compraventa-garaje (segmento FISCAL, riesgo 1 CRÍTICO)
 * Tanda del 20/08/2026, posterior a la reparación de la factura notarial (commit 44a5dc7d).
 *
 * De dónde sale CADA cifra esperada (ninguna de memoria):
 *  - Tipo general de ITP por CCAA → `TIPOS_ITP_CCAA_2025` en `data/fiscal/inmuebles.ts`,
 *    leído por `tipoGeneralDe()` en `data/itp-ccaa.ts` (Madrid = 6 %).
 *  - Escala progresiva y AJD por CCAA → `ITP_CCAA` en `data/itp-ccaa.ts`
 *    (Cataluña: 10/11/12/13 % y `ajd: 1.5`).
 *  - IVA del garaje de obra nueva → `IVA_INMUEBLES_2025` en `data/fiscal/inmuebles.ts`
 *    (`garaje: 21` independiente · `garageCon: 10` vinculado a la vivienda).
 *  - Arancel notarial → `ARANCELES_NOTARIO` (RD 1426/1989, número 2: matriz + una copia),
 *    y la FACTURA que se muestra → `FACTURA_NOTARIAL` (horquilla ×1,5 a ×2, que cubre los
 *    números 4, 6 y 7 —copias, folios y suplidos—; la tarjeta enseña el punto medio ×1,75).
 *  - Arancel registral → `ARANCELES_REGISTRO` (RD 1427/1989, número 2) MÁS los dos importes
 *    fijos de `REGISTRO_CONCEPTOS`: asiento de presentación 6,010121 € (número 1) y nota
 *    simple 3,005061 € (número 4). Al registro NO se le aplica la horquilla de la notaría.
 *  - El 21 % de IVA sobre honorarios notariales y registrales va dentro de
 *    `calcularArancelNotarial` y `calcularRegistro`.
 *
 * Los tres casos están resueltos a mano ANTES de ejecutar la app; el desarrollo va
 * comentado junto a cada aserción, con los importes sin redondear.
 */
import { test, expect, Page } from '@playwright/test';

const RUTA = '/simulador-gastos-compraventa-garaje/';

/** Valor de una ResultCard, con el espacio duro del formato español normalizado. */
async function valorTarjeta(page: Page, titulo: string): Promise<string> {
  const valor = page
    .locator('h3', { hasText: titulo })
    .first()
    .locator('xpath=../following-sibling::div[1]/p');
  return (await valor.innerText()).replace(/\s+/g, ' ').trim();
}

/** Texto descriptivo bajo el valor de una ResultCard. */
async function descripcionTarjeta(page: Page, titulo: string): Promise<string> {
  const desc = page
    .locator('h3', { hasText: titulo })
    .first()
    .locator('xpath=../following-sibling::p[1]');
  return (await desc.innerText()).replace(/\s+/g, ' ').trim();
}

async function rellenar(page: Page, etiqueta: string, valor: string): Promise<void> {
  const campo = page.locator(`input[aria-label="${etiqueta}"]`);
  await campo.fill(valor);
  await campo.blur();
}

test.describe('Simulador de gastos de compraventa de garaje — inspección 20/08/2026', () => {
  /**
   * CASO 1 (NORMAL) — el que la propia app publica en su bloque educativo:
   * «Luis compra una plaza de parking en Madrid por 25.000 €». Se comprueba que la
   * calculadora y esa tarjeta dicen exactamente lo mismo, porque un ejemplo que no
   * cuadra con el motor enseña a desconfiar del resultado correcto.
   */
  test('CASO 1 (normal) — Madrid, segunda mano, 25.000 €, comprador general', async ({ page }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Segunda mano/ }).click();
    await page.selectOption('#select-ccaa', 'madrid');
    await page.selectOption('#select-perfil', 'general');
    await rellenar(page, 'Precio del garaje / plaza de parking', '25000');
    await rellenar(page, 'Gastos de gestoría del comprador (€)', '300');

    // ITP = 25.000 × 6 % = 1.500. El 6 % es TIPOS_ITP_CCAA_2025 → { ccaa: 'Madrid', tipo: 6 }.
    // Madrid no tiene escala progresiva, así que el tipo efectivo coincide con el nominal.
    expect(await valorTarjeta(page, 'ITP (6,00%)')).toBe('1500,00 €');

    // Notaría — RD 1426/1989, número 2 (ARANCELES_NOTARIO):
    //   tramo 1 (hasta 6.010,12 €)            →                            90,15
    //   tramo 2 (6.010,12→30.050,61, 0,45 %)  → 18.989,88 × 0,0045 =       85,45446
    //   arancel sin IVA                       =                          175,60446
    //   con el 21 % de IVA                    = 175,60446 × 1,21 =       212,481397
    // FACTURA_NOTARIAL (números 4, 6 y 7 aparte): ×1,5 = 318,722095 · ×2 = 424,962793
    //   punto medio, que es lo que suma la app =                         371,842444
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('371,84 €');
    const notaria = await descripcionTarjeta(page, 'Gastos de notaría');
    expect(notaria).toContain('318,72 €');
    expect(notaria).toContain('424,96 €');

    // Registro — RD 1427/1989, números 1, 2 y 4 (ARANCELES_REGISTRO + REGISTRO_CONCEPTOS):
    //   tramo 1 (hasta 6.010,12 €)             →                           24,04
    //   tramo 2 (6.010,12→30.050,61, 0,175 %)  → 18.989,88 × 0,00175 =     33,23229
    //   inscripción (número 2)                 =                           57,27229
    //   + asiento de presentación (número 1)   →                            6,010121
    //   + nota simple (número 4)               →                            3,005061
    //                                          =                           66,287472
    //   con el 21 % de IVA                     = 66,287472 × 1,21 =        80,207841
    // Al registro NO se le aplica el factor 1,5-2 de la notaría: son importes fijos.
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('80,21 €');

    // En segunda mano no hay AJD: la operación tributa por ITP y ambos son incompatibles.
    await expect(page.locator('h3', { hasText: 'AJD' })).toHaveCount(0);

    // Total gastos = 1.500 + 371,842444 + 80,207841 + 300 = 2.252,050285
    //   % sobre el precio = 2.252,050285 / 25.000 = 9,008201 %
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('2252,05 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toContain('9,01%');

    // Coste total = 25.000 + 2.252,050285 = 27.252,050285
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('27.252,05 €');

    // Contraste con el ejemplo publicado: la tarjeta «Comprar garaje solo (segunda mano)»
    // del bloque educativo tiene que repetir estas mismas cifras, no unas parecidas.
    const ejemplo = (
      await page.getByText(/Luis compra una plaza de parking en Madrid/).innerText()
    ).replace(/\s+/g, ' ');
    expect(ejemplo).toContain('1.500 €');
    expect(ejemplo).toContain('371,84 €');
    expect(ejemplo).toContain('318,72 € a 424,96 €');
    expect(ejemplo).toContain('80,21 €');
    expect(ejemplo).toContain('27.252,05 €');
  });

  /**
   * CASO 2 (LÍMITE) — dos extremos a la vez: la rama de obra nueva (IVA + AJD, la única
   * en la que aparece la tarjeta de AJD) con el IVA más alto que maneja la app y el AJD
   * más alto de la tabla, sobre un precio tan bajo que los importes fijos del arancel
   * pesan más que el propio impuesto.
   */
  test('CASO 2 (límite) — Cataluña, obra nueva independiente, 3.000 €: IVA 21 % + AJD 1,5 % con los fijos dominando', async ({ page }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Primera mano/ }).click();
    await page.getByRole('button', { name: /Independiente/ }).click();
    await page.selectOption('#select-ccaa', 'cataluna');
    await rellenar(page, 'Precio del garaje / plaza de parking', '3000');
    await rellenar(page, 'Gastos de gestoría del comprador (€)', '300');

    // IVA = 3.000 × 21 % = 630 — IVA_INMUEBLES_2025.garaje = 21 (garaje independiente;
    // el vinculado a vivienda sería garageCon = 10 y daría 300 €).
    expect(await valorTarjeta(page, 'IVA (21,00%)')).toBe('630,00 €');

    // AJD = 3.000 × 1,5 % = 45 — ITP_CCAA.cataluna.ajd = 1.5, el tipo más alto de la tabla.
    expect(await valorTarjeta(page, 'AJD (1,50%)')).toBe('45,00 €');

    // Notaría — por debajo de 6.010,12 € solo se devenga la cuota fija del primer tramo:
    //   90,15 × 1,21 (IVA) = 109,0815 de arancel
    //   horquilla FACTURA_NOTARIAL: ×1,5 = 163,62225 · ×2 = 218,163 · medio = 190,892625
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('190,89 €');
    const notaria = await descripcionTarjeta(page, 'Gastos de notaría');
    expect(notaria).toContain('163,62 €');
    expect(notaria).toContain('218,16 €');

    // Registro — cuota fija 24,04 + presentación 6,010121 + nota simple 3,005061 = 33,055182
    //   con el 21 % de IVA = 39,996770
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('40,00 €');

    // Total gastos = 630 + 45 + 190,892625 + 39,996770 + 300 = 1.205,889395
    //   % sobre el precio = 1.205,889395 / 3.000 = 40,196313 % (los fijos pesan más que el IVA)
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('1205,89 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toContain('40,20%');

    // Coste total = 3.000 + 1.205,889395 = 4.205,889395
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('4205,89 €');

    // La app anuncia la escala progresiva catalana aunque aquí no se aplique (esto es IVA):
    // ITP_CCAA.cataluna.tramosProgresivos = 10 → 11 → 12 → 13 %.
    await expect(page.getByText('Esta comunidad aplica escala progresiva')).toBeVisible();
  });

  /**
   * CASO 3 (DEBE RECHAZARSE) — un precio negativo o cero no puede producir presupuesto:
   * un ITP negativo (−3.000 × 6 % = −180 €) sería un «ahorro» inexistente, y un
   * «No definido» en la tarjeta de COSTE TOTAL sería peor que no responder.
   */
  test('CASO 3 (debe rechazarse) — precio negativo o cero: la app pide el dato en vez de calcular', async ({ page }) => {
    await page.goto(RUTA);
    const precio = page.locator('input[aria-label="Precio del garaje / plaza de parking"]');
    const aviso = page.getByText(
      'Introduce el precio del garaje para ver el desglose de gastos del comprador',
    );

    // Sin escribir nada: parseSpanishNumber('') devuelve NaN y la guarda lo atrapa
    // (`!Number.isFinite(precio)`), así que no puede colarse ningún «No definido».
    await expect(aviso).toBeVisible();
    await expect(page.getByText('No definido')).toHaveCount(0);

    // Con un negativo y SIN salir del campo: la guarda `precio <= 0` corta el cálculo.
    await precio.fill('-3000');
    await expect(page.locator('h3', { hasText: 'COSTE TOTAL DE ADQUISICIÓN' })).toHaveCount(0);
    await expect(aviso).toBeVisible();

    // Al perder el foco, NumberInput normaliza al mínimo declarado (min = 0)...
    await precio.blur();
    await expect(precio).toHaveValue('0');

    // ...y con 0 tampoco calcula: nada de ITP de 0 €, ni notaría de 190,89 €, ni «0,00 %».
    await expect(page.locator('h3', { hasText: 'COSTE TOTAL DE ADQUISICIÓN' })).toHaveCount(0);
    await expect(page.locator('h3', { hasText: 'Gastos de notaría' })).toHaveCount(0);
    await expect(aviso).toBeVisible();
    await expect(page.getByText('No definido')).toHaveCount(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// REGRESIONES — los cinco hallazgos del 20/08/2026, reparados el 21/08/2026.
// Afirman lo que debe pasar y hoy PASAN: si alguien reintroduce el defecto, saltan aquí.
// ─────────────────────────────────────────────────────────────────────────────

/** Texto de un elemento con los espacios (duros incluidos) normalizados. */
async function texto(page: Page, patron: RegExp): Promise<string> {
  return (await page.getByText(patron).first().innerText()).replace(/\s+/g, ' ').trim();
}

// ✅ REPARADO 21/08/2026 — cálculo (era el defecto 1, y el mismo del trastero).
// El único campo de gestoría se rotulaba «Gastos de gestoría del comprador (€)» y valía
// 300 € por defecto, pero la pestaña Vendedor lo pasaba a `gastosTransmision` de
// `calcularGananciaInmueble`: los mismos 300 € eran a la vez coste del comprador y gasto
// deducible del vendedor. El art. 35.1 LIRPF solo admite los gastos «satisfechos por el
// transmitente». Ahora el vendedor tiene su propio campo, con 0 € por defecto.
// Caso: venta 22.000 € · compra 15.000 € · comisión 0 % · gestoría del comprador 300 € →
//       transmisión 22.000, ganancia 7.000 e IRPF 1.350,00 € (6.000×19 % + 1.000×21 %).
//       Antes daba 21.700, 6.700 y 1.287,00 €, es decir 63,00 € menos de IRPF.
test('REGRESIÓN (cálculo) — la gestoría del comprador no reduce la ganancia del vendedor', async ({
  page,
}) => {
  await page.goto(RUTA);
  await rellenar(page, 'Precio del garaje / plaza de parking', '22000');
  await rellenar(page, 'Gastos de gestoría del comprador (€)', '300');
  await page.getByRole('tab', { name: /Vendedor/ }).click();
  await rellenar(page, 'Precio de compra original del garaje', '15000');
  await rellenar(page, 'Comisión inmobiliaria del vendedor (%)', '0');
  await rellenar(page, 'Impuestos y gastos que pagaste al comprarlo (€)', '0');

  expect(await valorTarjeta(page, 'Valor de transmisión')).toBe('22.000,00 €');
  expect(await valorTarjeta(page, 'Ganancia patrimonial')).toBe('7000,00 €');
  expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('1350,00 €');
  expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('20.650,00 €');

  // Y el vendedor puede fijar la SUYA sin tocar el presupuesto del comprador
  await rellenar(page, 'Gestoría y certificados del vendedor (€)', '150');
  expect(await valorTarjeta(page, 'Valor de transmisión')).toBe('21.850,00 €');
});

// ✅ REPARADO 21/08/2026 — contenido (defecto 3).
// Las tarjetas se titulaban «Gastos de notaría (+ IVA)» y «Registro de la Propiedad
// (+ IVA)», pero el importe ya lleva el 21 % dentro (`calcularArancelNotarial` y
// `calcularRegistro` terminan en `total * 1.21`). «+ IVA» se lee como «IVA aparte».
test('REGRESIÓN (contenido) — ningún rótulo promete un IVA que ya está dentro', async ({ page }) => {
  await page.goto(RUTA);
  await rellenar(page, 'Precio del garaje / plaza de parking', '25000');

  // 175,60446 de arancel × 1,21 de IVA × 1,75 de factura = 371,84 €
  expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('371,84 €');
  // 66,287472 × 1,21 = 80,21 €
  expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('80,21 €');

  const tituloNotaria = await page.locator('h3', { hasText: 'Gastos de notaría' }).first().innerText();
  const tituloRegistro = await page
    .locator('h3', { hasText: 'Registro de la Propiedad' })
    .first()
    .innerText();
  expect(tituloNotaria).not.toMatch(/\+\s*IVA/);
  expect(tituloRegistro).not.toMatch(/\+\s*IVA/);
});

// ✅ REPARADO 21/08/2026 — contenido (defecto 2).
// La FAQ escribía el rango de ITP a mano —«entre el 4% (País Vasco) y el 11% (Cataluña,
// Comunidad Valenciana)»— y se quedaba dos puntos por debajo de la propia tabla de la app,
// que en el tramo alto de Baleares y Cataluña llega al 13 %. `RANGO_ITP` existe justo para
// que nadie lo escriba a mano, y la misma pantalla se contradecía al elegir Cataluña.
test('REGRESIÓN (contenido) — la FAQ da el mismo rango de ITP que RANGO_ITP', async ({ page }) => {
  await page.goto(RUTA);
  await page.getByRole('button', { name: /Ver guía educativa|Todo lo que necesitas saber/i }).click();
  const faq = await texto(page, /tributa por el Impuesto de Transmisiones Patrimoniales/);
  expect(faq).toContain('4%');
  expect(faq).toContain('13%');
  expect(faq).not.toContain('11%');
});

// ✅ REPARADO 21/08/2026 — contenido (defecto 5).
// La FAQ prometía «AJD (entre 0,5% y 1,5% según la comunidad)», pero
// ITP_CCAA['pais-vasco'].ajd = 0 y la app no cobra AJD allí: el simulador y su propia FAQ
// decían cosas distintas para la misma comunidad.
test('REGRESIÓN (contenido) — el rango de AJD de la FAQ incluye el 0 % del País Vasco', async ({
  page,
}) => {
  await page.goto(RUTA);
  await page.getByRole('button', { name: /Primera mano/ }).click();
  await page.locator('#select-ccaa').selectOption('pais-vasco');
  await rellenar(page, 'Precio del garaje / plaza de parking', '25000');
  // El País Vasco no cobra AJD: la tarjeta no se pinta
  await expect(page.locator('h3', { hasText: 'AJD' })).toHaveCount(0);

  await page.getByRole('button', { name: /Ver guía educativa|Todo lo que necesitas saber/i }).click();
  const faq = await texto(page, /paga IVA más AJD/);
  expect(faq).toContain('0%');
});

// ✅ REPARADO 21/08/2026 — contenido (defecto 4).
// La tarjeta «Vender garaje con ganancia» anunciaba que Ana tributa «por la ganancia de
// 7.000 €» aunque paga comisión, cuando el art. 35 LIRPF descuenta esos gastos del valor
// de transmisión: con la comisión del 3 % que trae el simulador, la ganancia es 6.340 € y
// el IRPF 1.211,40 €, no los 1.330 € que salían de aplicar un 19 % plano a 7.000 €.
test('REGRESIÓN (contenido) — el ejemplo de venta cuadra con lo que calcula el motor', async ({
  page,
}) => {
  await page.goto(RUTA);
  await rellenar(page, 'Precio del garaje / plaza de parking', '22000');
  await page.getByRole('tab', { name: /Vendedor/ }).click();
  await rellenar(page, 'Precio de compra original del garaje', '15000');
  await rellenar(page, 'Comisión inmobiliaria del vendedor (%)', '3');
  await rellenar(page, 'Impuestos y gastos que pagaste al comprarlo (€)', '0');

  // transmisión = 22.000 − 660 de comisión = 21.340 ; ganancia = 6.340
  // IRPF = 6.000×19 % + 340×21 % = 1.140 + 71,40 = 1.211,40
  expect(await valorTarjeta(page, 'Ganancia patrimonial')).toBe('6340,00 €');
  expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('1211,40 €');

  await page.getByRole('button', { name: /Ver guía educativa|Todo lo que necesitas saber/i }).click();
  const ejemplo = await texto(page, /Ana compró un garaje por 15.000/);
  expect(ejemplo).toContain('6.340 €');
  expect(ejemplo).toContain('1.211,40 €');
});
