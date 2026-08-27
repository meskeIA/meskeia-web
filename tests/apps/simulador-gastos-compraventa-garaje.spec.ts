/**
 * Inspector — simulador-gastos-compraventa-garaje (segmento FISCAL, riesgo 1 CRÍTICO)
 * Tanda del 20/08/2026, posterior a la reparación de la factura notarial (commit 44a5dc7d).
 * AMPLIADO en la RE-INSPECCIÓN del 27/08/2026 (la cola la reabrió porque `data/fiscal`
 * cambió después: commits 85f2c03f y 5747909a).
 *
 * ── Cómo está organizado este fichero ────────────────────────────────────────
 *   1. CASOS 1-3 — la inspección del 20/08/2026. Los tres siguen pasando tal cual.
 *   2. REGRESIONES 20/08 — los cinco hallazgos reparados el 21/08/2026.
 *   3. MITAD A (27/08) — el caso LITERAL de los hallazgos de cálculo reparados antes del
 *      21/08 y que hasta ahora no tenían testigo: 10, 13, 31, 33, 35, 36 y 37. Todos
 *      reproducidos en navegador y CERRADOS.
 *   4. MITAD B (27/08) — casos nuevos, en zonas que ninguna inspección anterior tocó:
 *      la plusvalía municipal del vendedor con sus dos métodos, la escala progresiva en un
 *      tramo alto de verdad, la venta con pérdida y el rechazo de texto que no es un número.
 *   5. HALLAZGOS ABIERTOS 27/08 — marcados con `test.fail()`: afirman lo que DEBERÍA pasar,
 *      así que hoy fallan a propósito. Al repararlos se les quita la marca y quedan como
 *      regresión.
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

// ═════════════════════════════════════════════════════════════════════════════
// MITAD A — RE-INSPECCIÓN 27/08/2026
// El caso LITERAL de los hallazgos de cálculo y de dato reparados antes del 21/08 que
// todavía no tenían testigo. Los siete se han reproducido en navegador y siguen cerrados.
// ═════════════════════════════════════════════════════════════════════════════

/** Valor de una fila del recuadro «ITP General / AJD» del panel de comunidad. */
async function valorPanelCcaa(page: Page, etiqueta: string): Promise<string> {
  return (
    await page
      .getByText(etiqueta, { exact: true })
      .first()
      .locator('xpath=following-sibling::span[1]')
      .innerText()
  )
    .replace(/\s+/g, ' ')
    .trim();
}

test.describe('MITAD A — los hallazgos reparados siguen reparados (27/08/2026)', () => {
  // ✅ HALLAZGO 10 (alto) REPARADO 14/08/2026 — cálculo.
  // `elegirTipoITP` aplicaba el primer reducido cuyo NOMBRE casara con el perfil sin mirar
  // su array `condiciones`. En Madrid —la CCAA por defecto— el primero que casa con «joven»
  // es «Jóvenes < 35 años (municipios pequeños)», del 0 %, reservado a municipios de menos
  // de 2.500 habitantes que la app nunca pregunta: el ITP salía 0,00 €.
  // Esperado: el tipo general de Madrid, TIPOS_ITP_CCAA_2025 → { ccaa: 'Madrid', tipo: 6 },
  //           25.000 × 6 % = 1.500,00 €, y el 0 % enseñado como oportunidad, no como cifra.
  test('10 · Madrid + perfil Joven no aplica el 0 % de los municipios pequeños', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await page.selectOption('#select-ccaa', 'madrid');
    await page.selectOption('#select-perfil', 'joven');
    await rellenar(page, 'Precio del garaje / plaza de parking', '25000');

    expect(await valorTarjeta(page, 'ITP (6,00%)')).toBe('1500,00 €');
    const aviso = page.locator('[role="note"]').filter({ hasText: 'Podrías pagar menos' });
    await expect(aviso).toBeVisible();
    await expect(aviso).toContainText('0,00% — Jóvenes < 35 años (municipios pequeños)');
    await expect(aviso).toContainText('Municipio < 2.500 hab.');
  });

  // ✅ HALLAZGO 10 (el «mismo patrón en Baleares» que citaba la ficha).
  // ITP_CCAA.baleares tiene «Jóvenes < 30 años o discapacidad ≥33% (1ª vivienda)» al 0 %,
  // condicionado a «Primera vivienda habitual»: un garaje suelto no lo es nunca, así que
  // `viviendaHabitual: false` lo descarta y manda la escala progresiva.
  // Esperado: primer tramo de ITP_CCAA.baleares.tramosProgresivos (8 % hasta 400.000 €)
  //           → 25.000 × 8 % = 2.000,00 €.
  test('10bis · Baleares + perfil Joven tampoco cae al 0 %', async ({ page }) => {
    await page.goto(RUTA);
    await page.selectOption('#select-ccaa', 'baleares');
    await page.selectOption('#select-perfil', 'joven');
    await rellenar(page, 'Precio del garaje / plaza de parking', '25000');

    expect(await valorTarjeta(page, 'ITP (8,00%)')).toBe('2000,00 €');
  });

  // ✅ HALLAZGO 31 (alto) REPARADO 19/08/2026 — dato.
  // `data/itp-ccaa.ts` duplicaba el tipo general de `TIPOS_ITP_CCAA_2025` y las dos tablas
  // ya divergían: en Murcia, itp-ccaa daba «Jóvenes ≤40» SIN límite de valor y calculaba al
  // 3 %. Ahora el tipo general se LEE de data/fiscal (`tipoGeneralDe`) y el reducido de
  // Murcia exige «Vivienda habitual», que un garaje no cumple.
  // Esperado: 200.000 × 7,75 % = 15.500,00 € (TIPOS_ITP_CCAA_2025 → Murcia, tipo 7.75,
  //           Ley 3/2025 con efectos 25/07/2025). Antes daba 6.000,00 € al 3 %.
  test('31 · Murcia + perfil Joven 200.000 € tributa al 7,75 %, no al 3 %', async ({ page }) => {
    await page.goto(RUTA);
    await page.selectOption('#select-ccaa', 'murcia');
    await page.selectOption('#select-perfil', 'joven');
    await rellenar(page, 'Precio del garaje / plaza de parking', '200000');

    expect(await valorTarjeta(page, 'ITP (7,75%)')).toBe('15.500,00 €');
  });

  // ✅ HALLAZGO 33 (alto) REPARADO 16/08/2026 — cálculo.
  // La bonificación del 50 % de Ceuta y Melilla (art. 57 bis TRLITPAJD) no depende del
  // comprador sino de dónde está el inmueble, así que no era candidata por nombre y no se
  // aplicaba nunca: se cobraba el 6 % mientras el mismo recuadro anunciaba la bonificación.
  // Esperado: ITP_CCAA.ceuta.tiposReducidos → «Bonificación general 50%», tipo 3, con
  //           condiciones de UBICACIÓN → 25.000 × 3 % = 750,00 €. Antes 1.500,00 €.
  test('33 · Ceuta aplica sola la bonificación del 50 % con perfil General', async ({ page }) => {
    await page.goto(RUTA);
    await page.selectOption('#select-ccaa', 'ceuta');
    await page.selectOption('#select-perfil', 'general');
    await rellenar(page, 'Precio del garaje / plaza de parking', '25000');

    expect(await valorTarjeta(page, 'ITP (3,00%)')).toBe('750,00 €');
  });

  // ✅ HALLAZGO 13 (bajo) REPARADO 16/08/2026 — cálculo.
  // Se llamaba a `calcularITP(precio, ccaa, tipoAplicable)` con el tercer argumento SIEMPRE
  // relleno, y ese argumento cortocircuita la rama de `tramosProgresivos`: las 7 CCAA con
  // escala tributaban al tipo plano del primer tramo mientras la página anunciaba la escala.
  // Esperado (ITP_CCAA['castilla-leon'].tramosProgresivos = 250.000 @ 8 % · resto @ 10 %):
  //   250.000 × 8 % = 20.000 · 50.000 × 10 % = 5.000 → 25.000,00 €
  //   tipo EFECTIVO = 25.000 / 300.000 = 8,3333 % → el título dice «ITP (8,33%)»
  // Antes daba 24.000,00 € al 8 % plano.
  test('13 · Castilla y León 300.000 € aplica la escala progresiva que anuncia', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await page.selectOption('#select-ccaa', 'castilla-leon');
    await rellenar(page, 'Precio del garaje / plaza de parking', '300000');

    await expect(page.getByText('Esta comunidad aplica escala progresiva')).toBeVisible();
    expect(await valorTarjeta(page, 'ITP (8,33%)')).toBe('25.000,00 €');
  });

  // ✅ HALLAZGOS 36 y 37 (bajos) REPARADOS 16 y 18/08/2026 — contenido.
  // 36: los porcentajes del panel de CCAA se interpolaban crudos («7.75%» en Murcia,
  //     «0.75%» de AJD en Madrid), en formato estadounidense.
  // 37: el tipo efectivo del título se redondeaba a UN decimal y dejaba de cuadrar con el
  //     importe de debajo: «ITP (7,8%) — 1.937,50 €», cuando 25.000 × 7,8 % = 1.950 €.
  // Esperado: panel «7,75%» y «1,50%»; título «ITP (7,75%)» con 25.000 × 7,75 % = 1.937,50 €.
  test('36 y 37 · Murcia: porcentajes en formato español y con los decimales que cuadran', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await page.selectOption('#select-ccaa', 'murcia');
    await rellenar(page, 'Precio del garaje / plaza de parking', '25000');

    expect(await valorPanelCcaa(page, 'ITP General')).toBe('7,75%');
    expect(await valorPanelCcaa(page, 'AJD')).toBe('1,50%');
    expect(await valorTarjeta(page, 'ITP (7,75%)')).toBe('1937,50 €');
    // 25.000 × 7,75 % = 1.937,50 exactos: el título y el importe dicen lo mismo.
    expect(25000 * 0.0775).toBeCloseTo(1937.5, 2);
  });

  // ✅ HALLAZGO 35 (alto) REPARADO 16/08/2026 — dato.
  // El único <DataReference> cubría ITP/AJD/IVA (FISCAL_INMUEBLES_META, verificado 2026) y
  // dejaba sin sello la plusvalía municipal, que se calcula con COEFICIENTES_IIVTNU_2025 y
  // PLUSVALIA_MUNICIPAL_META (vigencia 2025): datos de 2025 bajo un sello de 2026.
  test('35 · la página sella por separado el ITP/AJD/IVA y la plusvalía municipal', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await expect(page.getByText('ITP/AJD/IVA 2026').first()).toBeVisible();
    await expect(page.getByText(/Plusvalía municipal \(IIVTNU\) 2025/).first()).toBeVisible();
    // El aviso de que los coeficientes se actualizan cada Ley de Presupuestos va con ellos.
    await expect(page.getByText(/se actualizan anualmente por Ley de Presupuestos/i).first()).toBeVisible();
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// MITAD B — CASOS NUEVOS (27/08/2026)
// Zonas que ninguna inspección anterior tocó. Resueltos a mano ANTES de abrir el navegador;
// la aritmética va escrita junto a cada aserción.
// ═════════════════════════════════════════════════════════════════════════════

test.describe('MITAD B — casos nuevos de la re-inspección (27/08/2026)', () => {
  /**
   * CASO 4 (NORMAL) — la pestaña Vendedor COMPLETA, que hasta hoy solo se había probado a
   * trozos: nunca con plusvalía municipal calculada por sus dos métodos a la vez.
   *
   * Entrada: venta 30.000 € · compra 18.000 € · gastos de aquella compra 1.800 € ·
   *          8 años · suelo catastral 5.000 € · total catastral 12.000 € · comisión 3 %.
   *
   * Plusvalía — `calcularPlusvaliaMunicipal` (data/itp-ccaa.ts) con
   *   COEFICIENTES_IIVTNU_2025[8 años] = 0,10 y PLUSVALIA_MUNICIPAL_META.tipoOrientativo = 25
   *   objetivo (art. 107.4 TRLHL) = 5.000 × 0,10 × 25 % =                       125,00
   *   real (art. 107.5 TRLHL)     = (30.000 − 18.000) × (5.000/12.000) × 25 % = 1.250,00
   *   recomendado = min(125 ; 1.250) =                                          125,00
   *   → «Método objetivo (más favorable)»
   *
   * Ganancia — `calcularGananciaInmueble` (art. 35 LIRPF, data/fiscal/ganancia-inmueble.ts)
   *   valor de adquisición = 18.000 + 1.800 =                                 19.800,00
   *   comisión             = 30.000 × 3 % =                                      900,00
   *   valor de transmisión = 30.000 − 900 − 125 =                             28.975,00
   *   ganancia             = 28.975 − 19.800 =                                  9.175,00
   *   IRPF (TRAMOS_GANANCIAS_PATRIMONIALES_2025, base del ahorro):
   *        6.000 × 19 % = 1.140,00 · 3.175 × 21 % = 666,75 →                   1.806,75
   *   total gastos vendedor = 125 + 900 + 0 + 1.806,75 =                        2.831,75
   *   neto = 30.000 − 2.831,75 =                                              27.168,25
   */
  test('CASO 4 (normal) — vendedor con plusvalía municipal por los dos métodos', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await rellenar(page, 'Precio del garaje / plaza de parking', '30000');
    await page.getByRole('tab', { name: /Vendedor/ }).click();
    await rellenar(page, 'Precio de compra original del garaje', '18000');
    await rellenar(page, 'Impuestos y gastos que pagaste al comprarlo (€)', '1800');
    await rellenar(page, 'Años de propiedad', '8');
    await rellenar(page, 'Valor catastral del suelo (€)', '5000');
    await rellenar(page, 'Valor catastral total (suelo + construcción) (€)', '12000');
    await rellenar(page, 'Comisión inmobiliaria del vendedor (%)', '3');

    expect(await valorTarjeta(page, 'Precio de venta')).toBe('30.000,00 €');
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('125,00 €');
    expect(await descripcionTarjeta(page, 'Plusvalía municipal')).toBe(
      'Método objetivo (más favorable)',
    );
    expect(await valorTarjeta(page, 'Valor de adquisición')).toBe('19.800,00 €');
    expect(await valorTarjeta(page, 'Valor de transmisión')).toBe('28.975,00 €');
    expect(await valorTarjeta(page, 'Ganancia patrimonial')).toBe('9175,00 €');
    expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('1806,75 €');
    expect(await valorTarjeta(page, 'Comisión inmobiliaria')).toBe('900,00 €');
    expect(await valorTarjeta(page, 'Total gastos vendedor')).toBe('2831,75 €');
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('27.168,25 €');
  });

  /**
   * CASO 5 (LÍMITE) — la escala progresiva en un tramo alto DE VERDAD. El caso 2 la anuncia
   * pero no la ejerce (allí la operación es IVA), y el hallazgo 13 se cerró con Castilla y
   * León, que solo tiene dos tramos. Cataluña, con 700.000 €, cruza al segundo tramo del 11 %.
   *
   * ITP — ITP_CCAA.cataluna.tramosProgresivos = 600.000 @ 10 % · 900.000 @ 11 % · …
   *   600.000 × 10 % = 60.000 · 100.000 × 11 % = 11.000 →                      71.000,00
   *   tipo efectivo = 71.000 / 700.000 = 10,142857 % → título «ITP (10,14%)»
   *   (con el tipo plano del primer tramo saldrían 70.000 €, 1.000 € menos)
   *
   * Notaría — ARANCELES_NOTARIO (RD 1426/1989, número 2), arancel sin IVA:
   *     90,15 + 24.040,49×0,45 % + 30.050,60×0,15 % + 90.151,82×0,10 %
   *          + 450.759,07×0,05 % + 98.987,90×0,03 %                    =       588,63583
   *   con el 21 % de IVA = 588,63583 × 1,21 =                                  712,249354
   *   FACTURA_NOTARIAL: ×1,5 = 1.068,374031 · ×2 = 1.424,498709 · medio =     1.246,436370
   *
   * Registro — ARANCELES_REGISTRO (RD 1427/1989, número 2):
   *     24,04 + 24.040,49×0,175 % + 30.050,60×0,125 % + 90.151,82×0,075 %
   *          + 450.759,07×0,030 % + 98.987,90×0,020 %                  =       326,313274
   *   + presentación 6,010121 + nota simple 3,005061 =                         335,328455
   *   con el 21 % de IVA =                                                     405,747431
   *
   * Total gastos = 71.000 + 1.246,436370 + 405,747431 + 300 =                72.952,183801
   *   % sobre el precio = 10,421741 %
   * Coste total = 700.000 + 72.952,183801 =                                 772.952,183801
   */
  test('CASO 5 (límite) — Cataluña 700.000 € cruza al segundo tramo de la escala (11 %)', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await page.selectOption('#select-ccaa', 'cataluna');
    await rellenar(page, 'Precio del garaje / plaza de parking', '700000');
    await rellenar(page, 'Gastos de gestoría del comprador (€)', '300');

    expect(await valorTarjeta(page, 'ITP (10,14%)')).toBe('71.000,00 €');
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('1246,44 €');
    const notaria = await descripcionTarjeta(page, 'Gastos de notaría');
    expect(notaria).toContain('1068,37 €');
    expect(notaria).toContain('1424,50 €');
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('405,75 €');
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('72.952,18 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toContain('10,42%');
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('772.952,18 €');
  });

  /**
   * CASO 6 (LÍMITE) — vender por debajo de lo que se pagó. Toca a la vez las dos ramas
   * «negativas» del motor, que nunca se habían probado: la no sujeción de la plusvalía
   * municipal (art. 104.5 TRLHL) y la pérdida patrimonial, que no genera cuota.
   *
   * Entrada: venta 15.000 € · compra 18.000 € · gastos de aquella compra 0 € · 8 años ·
   *          suelo 5.000 € · total 12.000 € · comisión 3 %.
   *   incremento real = 15.000 − 18.000 = −3.000 ≤ 0 → EXENTO, plusvalía 0
   *   comisión = 15.000 × 3 % =                                                   450,00
   *   valor de adquisición =                                                   18.000,00
   *   valor de transmisión = 15.000 − 450 − 0 =                                 14.550,00
   *   ganancia = 14.550 − 18.000 = −3.450 → pérdida de                            3.450,00
   *   IRPF: ninguno (una pérdida se compensa en la declaración, no tributa)
   *   total gastos vendedor = 0 + 450 + 0 + 0 =                                   450,00
   *   neto = 15.000 − 450 =                                                    14.550,00
   */
  test('CASO 6 (límite) — venta con pérdida: plusvalía no sujeta y ninguna cuota de IRPF', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await rellenar(page, 'Precio del garaje / plaza de parking', '15000');
    await page.getByRole('tab', { name: /Vendedor/ }).click();
    await rellenar(page, 'Precio de compra original del garaje', '18000');
    await rellenar(page, 'Impuestos y gastos que pagaste al comprarlo (€)', '0');
    await rellenar(page, 'Años de propiedad', '8');
    await rellenar(page, 'Valor catastral del suelo (€)', '5000');
    await rellenar(page, 'Valor catastral total (suelo + construcción) (€)', '12000');
    await rellenar(page, 'Comisión inmobiliaria del vendedor (%)', '3');

    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('EXENTO');
    expect(await descripcionTarjeta(page, 'Plusvalía municipal')).toBe(
      'No sujeta (sin incremento de valor)',
    );
    expect(await valorTarjeta(page, 'Valor de adquisición')).toBe('18.000,00 €');
    expect(await valorTarjeta(page, 'Valor de transmisión')).toBe('14.550,00 €');
    expect(await valorTarjeta(page, 'Pérdida patrimonial')).toBe('3450,00 €');
    expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('SIN CUOTA');
    // No puede aparecer a la vez la tarjeta de ganancia
    await expect(page.locator('h3', { hasText: 'Ganancia patrimonial' })).toHaveCount(0);
    expect(await valorTarjeta(page, 'Total gastos vendedor')).toBe('450,00 €');
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('14.550,00 €');
  });

  /**
   * CASO 7 (DEBE RECHAZARSE) — texto que no es un número. El caso 3 cubre el negativo y el
   * cero; falta lo que teclea de verdad quien se equivoca de tecla.
   *   · «abc»    → el regex de NumberInput (/^-?[\d.,]*$/) ni lo deja entrar.
   *   · «1.2.3»  → SÍ entra (solo cifras y puntos), pero `parseSpanishNumber` devuelve NaN
   *                —desde el 24/08/2026 dejó de aceptar prefijos numéricos— y la guarda
   *                `!Number.isFinite(precio)` corta el cálculo. Con `parseFloat` habría
   *                presupuestado un garaje de 1,20 €.
   *   · «12abc»  → rechazado también, dejando intacto lo que hubiera antes.
   */
  test('CASO 7 (debe rechazarse) — texto basura no produce presupuesto', async ({ page }) => {
    await page.goto(RUTA);
    const precio = page.locator('input[aria-label="Precio del garaje / plaza de parking"]');
    const aviso = page.getByText(
      'Introduce el precio del garaje para ver el desglose de gastos del comprador',
    );

    await precio.fill('abc');
    expect(await precio.inputValue()).toBe('');
    await expect(aviso).toBeVisible();

    await precio.fill('1.2.3');
    await precio.blur();
    expect(await precio.inputValue()).toBe('1.2.3');
    await expect(aviso).toBeVisible();
    await expect(page.locator('h3', { hasText: 'COSTE TOTAL DE ADQUISICIÓN' })).toHaveCount(0);
    await expect(page.getByText('No definido')).toHaveCount(0);
    // Nada de un ITP de 0,07 € sobre un precio de 1,20 €
    await expect(page.locator('h3', { hasText: 'ITP' })).toHaveCount(0);

    await precio.fill('12abc');
    expect(await precio.inputValue()).toBe('1.2.3');
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// HALLAZGOS ABIERTOS — re-inspección del 27/08/2026.
// Marcados con `test.fail()`: afirman lo que DEBERÍA pasar, así que hoy fallan a propósito.
// Cuando se reparen, se les quita la marca y quedan como regresión.
// ═════════════════════════════════════════════════════════════════════════════

test.describe('HALLAZGOS ABIERTOS — re-inspección del 27/08/2026', () => {
  test.fail();

  // ⚠️ ABIERTO (alto) — cálculo.
  // En Canarias, Ceuta y Melilla no rige el IVA español: `TERRITORIOS_SIN_IVA` (data/itp-ccaa.ts)
  // los declara como IGIC e IPSI, y la app IMPRIME ese aviso —«Esta herramienta no lo calcula,
  // así que el importe del impuesto indirecto no es el tuyo»— mientras la tarjeta de al lado
  // liquida un 21 % que allí no existe y lo suma a un total rotulado «Precio + todos los gastos».
  // Las tres apps hermanas del clúster (solar, terreno-rústico y nave-industrial) resolvieron
  // esto el 26/08/2026 poniendo el impuesto a 0 y rotulando «COSTE TOTAL (PARCIAL)»; esta se
  // quedó a medio camino, con el aviso pero sin el cambio de cálculo.
  // Caso: Canarias · primera mano · Independiente · 25.000 € · gestoría 300 € → esperado
  //       ninguna cifra de IVA y un total marcado como parcial · obtenido «IVA (21,00%)
  //       5.250,00 €» y «COSTE TOTAL DE ADQUISICIÓN 31.189,55 € — Precio + todos los gastos».
  test('ABIERTO (cálculo) — en Canarias no se liquida un IVA que allí no existe', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Primera mano/ }).click();
    await page.getByRole('button', { name: /Independiente/ }).click();
    await page.selectOption('#select-ccaa', 'canarias');
    await rellenar(page, 'Precio del garaje / plaza de parking', '25000');
    await rellenar(page, 'Gastos de gestoría del comprador (€)', '300');

    await expect(page.getByText(/no se aplica el IVA/)).toBeVisible();
    // Ninguna tarjeta puede cifrar el IVA (hoy imprime 5.250,00 €)
    await expect(page.locator('h3', { hasText: /^IVA/ })).toHaveCount(0);
    // Y el total no puede presentarse como completo
    await expect(page.locator('h3', { hasText: 'COSTE TOTAL' })).toContainText('PARCIAL');
  });

  // ⚠️ ABIERTO (medio) — dato.
  // El consejo «Liquida el ITP en el plazo legal» lleva escrita a mano una escala de recargos
  // —«del 5% al 20%»— que contradice a la calculadora canónica del propio catálogo:
  // `lib/calculadoras/recargoPresentacionTardia.ts` (LGT art. 27.2 en la redacción de la
  // Ley 11/2021, que es lo que sirve la tool MCP `calcular_recargo_presentacion_tardia` y lo
  // que explican calendario-fiscal-emprendedor y planificador-trimestres-freelance) aplica
  // 1 % por cada mes completo hasta 12 meses, y 15 % + intereses a partir del mes 13.
  // Caso: bloque educativo → obtenido «recargos del 5% al 20% más intereses de demora» ·
  //       esperado la escala del 1 %/15 %. Sobre el ITP de 1.500 € del caso de Madrid, un mes
  //       de retraso son 15,00 € y no los 75,00 € que anuncia el 5 %.
  test('ABIERTO (dato) — el recargo por liquidar tarde es el del art. 27.2 LGT vigente', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Ver guía educativa|Todo lo que necesitas saber/i }).click();
    const consejo = page.getByText(/El ITP debe liquidarse en 30 días hábiles/);
    await expect(consejo).not.toContainText('5% al 20%');
    await expect(consejo).toContainText('1%');
  });

  // ⚠️ ABIERTO (bajo) — operativa.
  // Cuando falta el precio de compra, la plusvalía no se calcula y la tarjeta culpa a un campo
  // que el usuario SÍ ha rellenado: el mensaje por defecto es «No calculada (falta valor
  // catastral del suelo)» y solo se sustituye dentro del `if (valorSuelo > 0 && anios > 0 &&
  // precioC > 0)`. `calcularPlusvaliaMunicipal` necesita el precio de compra para la no
  // sujeción del art. 104.5 TRLHL, así que es ese el dato que falta.
  // Caso: pestaña Vendedor · venta 30.000 € · años 8 · suelo catastral 5.000 € · SIN precio de
  //       compra → esperado un mensaje que nombre el precio de compra · obtenido «Plusvalía
  //       municipal 0,00 € — No calculada (falta valor catastral del suelo)», con el suelo puesto.
  test('ABIERTO (operativa) — el aviso de la plusvalía nombra el dato que de verdad falta', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await rellenar(page, 'Precio del garaje / plaza de parking', '30000');
    await page.getByRole('tab', { name: /Vendedor/ }).click();
    await rellenar(page, 'Años de propiedad', '8');
    await rellenar(page, 'Valor catastral del suelo (€)', '5000');

    expect(await descripcionTarjeta(page, 'Plusvalía municipal')).not.toContain(
      'falta valor catastral del suelo',
    );
  });

  // ⚠️ ABIERTO (bajo) — contenido.
  // El título de la tarjeta de comisión interpola el TEXTO CRUDO del input
  // (`Comisión inmobiliaria (${comisionInmobiliaria}%)`) en vez de pasarlo por `formatNumber`.
  // Es el último resto del hallazgo 36, que corrigió las otras tres interpolaciones crudas de
  // esta misma página. El importe sí es correcto; lo que sale en formato estadounidense es el
  // rótulo, en una app cuya regla de formato español es obligatoria.
  // Caso: pestaña Vendedor · venta 30.000 € · comisión «3.5» → esperado «Comisión inmobiliaria
  //       (3,5%)» · obtenido «Comisión inmobiliaria (3.5%)» con el importe correcto 1.050,00 €.
  test('ABIERTO (contenido) — el porcentaje de comisión se rotula en formato español', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await rellenar(page, 'Precio del garaje / plaza de parking', '30000');
    await page.getByRole('tab', { name: /Vendedor/ }).click();
    await rellenar(page, 'Precio de compra original del garaje', '18000');
    await rellenar(page, 'Comisión inmobiliaria del vendedor (%)', '3.5');

    // 30.000 × 3,5 % = 1.050,00 — el cálculo está bien; el rótulo, no
    expect(await valorTarjeta(page, 'Comisión inmobiliaria')).toBe('1050,00 €');
    const titulo = await page.locator('h3', { hasText: 'Comisión inmobiliaria' }).first().innerText();
    expect(titulo).toContain('3,5%');
  });

  // ⚠️ ABIERTO (bajo) — accesibilidad.
  // Los dos grupos de botones-conmutador («Tipo de transmisión» y, en obra nueva, «Tipo de
  // garaje») se rotulan con un <label> que no tiene `for` ni envuelve ningún control, y el par
  // de botones no va dentro de ningún `role="group"` ni `fieldset`: quien navega por voz oye
  // «Segunda mano» y «Primera mano (obra nueva)» sin saber de qué pregunta son opciones. Es la
  // misma clase de defecto que la app hermana estimador-costas-judiciales cerró el 26/08/2026
  // («los tres grupos de botones tienen nombre accesible»). No lo cubre `check:a11y-jsx`, que
  // vigila type=, aria-hidden y aria-pressed, y aquí los tres están bien.
  // Caso: abrir la app → `document.querySelectorAll('[role="group"],fieldset').length` = 0 y el
  //       <label> «Tipo de transmisión» sin `for` ni control dentro · esperado que el par de
  //       botones se anuncie bajo su rótulo.
  test('ABIERTO (accesibilidad) — los grupos de botones tienen nombre accesible', async ({
    page,
  }) => {
    await page.goto(RUTA);
    const huerfanos = await page.evaluate(() =>
      Array.from(document.querySelectorAll('label'))
        .filter((l) => !l.getAttribute('for') && !l.querySelector('input,select,textarea,button'))
        .map((l) => (l.textContent || '').trim()),
    );
    expect(huerfanos).not.toContain('Tipo de transmisión');
    await expect(page.getByRole('group', { name: /Tipo de transmisión/i })).toHaveCount(1);
  });
});
