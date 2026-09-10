/**
 * Inspector — simulador-gastos-compraventa-garaje (segmento FISCAL, riesgo 1 CRÍTICO)
 * Tanda del 20/08/2026, posterior a la reparación de la factura notarial (commit 44a5dc7d).
 * AMPLIADO en la RE-INSPECCIÓN del 27/08/2026 (la cola la reabrió porque `data/fiscal`
 * cambió después: commits 85f2c03f y 5747909a) y en la RE-INSPECCIÓN DE CIERRE del
 * 28/08/2026, que verifica la reparación del commit d787b81b.
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
 *   5. REGRESIÓN 27/08 — los cinco hallazgos de la re-inspección del 27/08/2026, reparados
 *      ese mismo día. Estaban escritos con `test.fail()` afirmando lo que DEBERÍA pasar; al
 *      repararlos se les quitó la marca y quedan como regresión.
 *   6. MITAD A (28/08) — el cierre del commit d787b81b verificado a fondo: el caso literal de
 *      Canarias que su mensaje nombra, y los DOS caminos que la reparación no debía tocar
 *      (Madrid en primera mano, y el ITP de Canarias en segunda mano, que allí sí existe).
 *   7. MITAD B (28/08) — casos nuevos: el otro territorio sin IVA (Ceuta, con bonificación de
 *      AJD), la plusvalía municipal por el método REAL y los importes negativos del vendedor.
 *   8. HALLAZGOS ABIERTOS 28/08 — con `test.fail()`: afirman lo que DEBERÍA pasar, así que
 *      hoy fallan a propósito. Al repararlos se les quita la marca y quedan como regresión.
 *   9. INSPECCIÓN 02/09/2026 — tres casos nuevos: la Comunidad Valenciana con su tipo del 9 %
 *      (01/06/2026), el TRAMO MÁS ALTO de una escala progresiva (el 13 % de Cataluña, que
 *      ninguna inspección había recorrido) y el rechazo de unos años de propiedad negativos.
 *      Los tres hallazgos 514-516 del 30/08 se han vuelto a ejecutar y hoy PASAN: están
 *      reparados en el código, y sus comentarios «❌ ABIERTO» son de la tanda anterior.
 *  10. HALLAZGOS ABIERTOS 02/09 — tres, con `test.fail()`. Los tres se repararon ese mismo
 *      día: hoy pasan en verde y ya no llevan la marca.
 *  11. INSPECCIÓN 07/09/2026 — la cola reabrió la app tras el commit 13d2181b (recargo del
 *      art. 27.2 LGT, que toca su bloque educativo). Tres casos nuevos en zonas vírgenes:
 *      el perfil FAMILIA NUMEROSA (Galicia), el TOPE DE 20 AÑOS del coeficiente de
 *      plusvalía cruzado con el TERCER tramo del ahorro (23 %), y la gestoría del
 *      COMPRADOR en negativo (País Vasco, el 4 % más bajo del catálogo y sin AJD).
 *      Los tres cuadraron a la primera con lo calculado a mano.
 *  12. REGRESIÓN 07/09 — los tres hallazgos de esa tanda (624, 625 y 626), REPARADOS el
 *      09/09/2026. El 624 y el 626 estaban escritos con `test.fail()`; al repararlos se les
 *      quitó la marca. El 625 no tenía testigo y se le ha escrito uno, que ancla los tipos
 *      de ITP de los ejemplos contra `ITP_CCAA` en vez de contra un literal.
 *
 * ⚠️ Desde el 09/09/2026 las preguntas de la FAQ son `<h3>` (reparación del 626) y
 * `EducationalSection` monta su contenido SIEMPRE en el DOM, así que un
 * `page.locator('h3', { hasText: 'ITP' })` cuenta también preguntas: los títulos de tarjeta
 * se anclan con `/^ITP/`, `/^IVA/` y compañía.
 *
 * De dónde sale CADA cifra esperada (ninguna de memoria):
 *  - Tipo general de ITP por CCAA → `TIPOS_ITP_CCAA_2025` en `data/fiscal/inmuebles.ts`,
 *    leído por `tipoGeneralDe()` en `data/itp-ccaa.ts` (Madrid = 6 %).
 *  - Escala progresiva y AJD por CCAA → `ITP_CCAA` en `data/itp-ccaa.ts`
 *    (Cataluña: 10/11/12/13 % y `ajd: 1.5`).
 *  - IVA del garaje de obra nueva → `IVA_INMUEBLES_2025` en `data/fiscal/inmuebles.ts`
 *    (`garaje: 21` independiente · `anejoVinculado: 10` vinculado a la vivienda).
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
// Los tipos esperados de la sección 12 NO se teclean: se leen de la misma ficha que compone
// la página, que es lo que convierte esos tests en un ancla y no en una copia (hallazgo 625).
import { ITP_CCAA } from '../../data/itp-ccaa';
import { formatNumber, formatTipoNominal } from '../../lib/formatters';

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
    // el vinculado a vivienda sería anejoVinculado = 10 y daría 300 €).
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
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('72.952,19 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toContain('10,42%');
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('772.952,19 €');
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
    // Nada de un ITP de 0,07 € sobre un precio de 1,20 €.
    // El título va anclado con `/^ITP/` desde el 09/09/2026: al reparar el hallazgo 626 las
    // preguntas de la FAQ subieron de `<h4>` a `<h3>`, y dos de ellas llevan «ITP» dentro
    // («¿Qué ITP paga un garaje de segunda mano?»). Como `EducationalSection` monta su
    // contenido SIEMPRE en el DOM —lo oculta por CSS, para que Googlebot lo lea—, un
    // `hasText: 'ITP'` a secas dejaría de contar tarjetas de resultado y empezaría a contar
    // preguntas. El rótulo de la tarjeta es «ITP (6,00%)»; las preguntas empiezan por «¿».
    await expect(page.locator('h3', { hasText: /^ITP/ })).toHaveCount(0);

    await precio.fill('12abc');
    expect(await precio.inputValue()).toBe('1.2.3');
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// REGRESIÓN — los cinco hallazgos de la re-inspección del 27/08/2026, REPARADOS ese mismo
// día. Estaban marcados con `test.fail()` afirmando lo que debería pasar; al repararlos se
// les quitó la marca y ahora sujetan la reparación.
// ═════════════════════════════════════════════════════════════════════════════

test.describe('REGRESIÓN — hallazgos del 27/08/2026, reparados', () => {
  // ✅ REPARADO 27/08 (alto) — cálculo.
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
  test('REGRESIÓN (cálculo) — en Canarias no se liquida un IVA que allí no existe', async ({
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

  // ✅ REPARADO 27/08 (medio) — dato.
  // El consejo «Liquida el ITP en el plazo legal» lleva escrita a mano una escala de recargos
  // —«del 5% al 20%»— que contradice a la calculadora canónica del propio catálogo:
  // `lib/calculadoras/recargoPresentacionTardia.ts` (LGT art. 27.2 en la redacción de la
  // Ley 11/2021, que es lo que sirve la tool MCP `calcular_recargo_presentacion_tardia` y lo
  // que explican calendario-fiscal-emprendedor y planificador-trimestres-freelance) aplica
  // 1 % por cada mes completo hasta 12 meses, y 15 % + intereses a partir del mes 13.
  // Caso: bloque educativo → obtenido «recargos del 5% al 20% más intereses de demora» ·
  //       esperado la escala del 1 %/15 %. Sobre el ITP de 1.500 € del caso de Madrid, un mes
  //       de retraso son 15,00 € y no los 75,00 € que anuncia el 5 %.
  test('REGRESIÓN (dato) — el recargo por liquidar tarde es el del art. 27.2 LGT vigente', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Ver guía educativa|Todo lo que necesitas saber/i }).click();
    const consejo = page.getByText(/El ITP debe liquidarse en 30 días hábiles/);
    await expect(consejo).not.toContainText('5% al 20%');
    await expect(consejo).toContainText('1%');
  });

  // ✅ REPARADO 27/08 (bajo) — operativa.
  // Cuando falta el precio de compra, la plusvalía no se calcula y la tarjeta culpa a un campo
  // que el usuario SÍ ha rellenado: el mensaje por defecto es «No calculada (falta valor
  // catastral del suelo)» y solo se sustituye dentro del `if (valorSuelo > 0 && anios > 0 &&
  // precioC > 0)`. `calcularPlusvaliaMunicipal` necesita el precio de compra para la no
  // sujeción del art. 104.5 TRLHL, así que es ese el dato que falta.
  // Caso: pestaña Vendedor · venta 30.000 € · años 8 · suelo catastral 5.000 € · SIN precio de
  //       compra → esperado un mensaje que nombre el precio de compra · obtenido «Plusvalía
  //       municipal 0,00 € — No calculada (falta valor catastral del suelo)», con el suelo puesto.
  test('REGRESIÓN (operativa) — el aviso de la plusvalía nombra el dato que de verdad falta', async ({
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

  // ✅ REPARADO 27/08 (bajo) — contenido.
  // El título de la tarjeta de comisión interpola el TEXTO CRUDO del input
  // (`Comisión inmobiliaria (${comisionInmobiliaria}%)`) en vez de pasarlo por `formatNumber`.
  // Es el último resto del hallazgo 36, que corrigió las otras tres interpolaciones crudas de
  // esta misma página. El importe sí es correcto; lo que sale en formato estadounidense es el
  // rótulo, en una app cuya regla de formato español es obligatoria.
  // Caso: pestaña Vendedor · venta 30.000 € · comisión «3.5» → esperado «Comisión inmobiliaria
  //       (3,5%)» · obtenido «Comisión inmobiliaria (3.5%)» con el importe correcto 1.050,00 €.
  test('REGRESIÓN (contenido) — el porcentaje de comisión se rotula en formato español', async ({
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

  // ✅ REPARADO 27/08 (bajo) — accesibilidad.
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
  test('REGRESIÓN (accesibilidad) — los grupos de botones tienen nombre accesible', async ({
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


/** Título completo de una ResultCard (el rótulo cambia con el territorio y con el tipo). */
async function tituloTarjeta(page: Page, titulo: string): Promise<string> {
  return (await page.locator('h3', { hasText: titulo }).first().innerText())
    .replace(/\s+/g, ' ')
    .trim();
}

// ═════════════════════════════════════════════════════════════════════════════
// MITAD A — RE-INSPECCIÓN DE CIERRE 28/08/2026
// Verifica que la reparación del commit d787b81b («el IVA que no existe en Canarias deja de
// sumarse al total») es correcta DE VERDAD, y que no ha roto ninguno de los dos caminos que
// antes funcionaban: el territorio con IVA (Madrid, primera mano) y el ITP de Canarias, que
// allí SÍ existe y no debía tocarse.
//
// Todas las cifras se resolvieron a mano ANTES de abrir el navegador, con los mismos módulos
// que ya cita la cabecera de este fichero: `ITP_CCAA` (ajd por CCAA), `IVA_INMUEBLES_2025`,
// `ARANCELES_NOTARIO` + `FACTURA_NOTARIAL`, `ARANCELES_REGISTRO` + `REGISTRO_CONCEPTOS` y
// `TIPOS_ITP_CCAA_2025` (Canarias = 6,5 %).
// ═════════════════════════════════════════════════════════════════════════════

test.describe('MITAD A — el cierre del IVA en Canarias, verificado (28/08/2026)', () => {
  /**
   * A1 — EL CASO LITERAL DEL COMMIT. Es el que su propio mensaje nombra: «Canarias, primera
   * mano, 25.000 EUR: 5.250,00 EUR de IVA inventados».
   *
   * `TERRITORIOS_SIN_IVA.canarias` = IGIC, así que el impuesto indirecto no se cifra. Lo que
   * SÍ se sigue devengando allí es el AJD, que es un tributo cedido distinto del IVA:
   *   AJD  = 25.000 × 0,75 % (ITP_CCAA.canarias.ajd) =                            187,50
   *   notaría (arancel 175,60446 × 1,21 × 1,75 de FACTURA_NOTARIAL) =             371,842444
   *   registro (66,287472 × 1,21) =                                                80,207841
   *   gestoría =                                                                  300,00
   *   total gastos = 0 + 187,50 + 371,842444 + 80,207841 + 300 =                  939,550285
   *   % sobre el precio = 939,550285 / 25.000 =                                     3,758201 %
   *   coste total (PARCIAL) = 25.000 + 939,550285 =                            25.939,550285
   * Antes de la reparación este mismo caso sumaba 5.250,00 € de IVA y remataba con
   * «COSTE TOTAL DE ADQUISICIÓN 31.189,55 € — Precio + todos los gastos».
   */
  test('A1 · Canarias · primera mano · 25.000 €: el IGIC se nombra, no se cifra, y el total se marca parcial', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Primera mano/ }).click();
    await page.getByRole('button', { name: /Independiente/ }).click();
    await page.selectOption('#select-ccaa', 'canarias');
    await rellenar(page, 'Precio del garaje / plaza de parking', '25000');
    await rellenar(page, 'Gastos de gestoría del comprador (€)', '300');

    // Ni una sola cifra de IVA en la pantalla
    await expect(page.getByText(/no se aplica el IVA/)).toBeVisible();
    await expect(page.locator('h3', { hasText: /^IVA/ })).toHaveCount(0);

    // El impuesto se NOMBRA (IGIC) y se declara no calculado, sin porcentaje inventado
    expect(await tituloTarjeta(page, 'IGIC')).toBe('IGIC');
    expect(await valorTarjeta(page, 'IGIC')).toBe('No calculado');
    expect(await descripcionTarjeta(page, 'IGIC')).toBe(
      'En Canarias no rige el IVA: la compra de obra nueva tributa por el IGIC, que este simulador no calcula',
    );

    // El AJD sí se devenga en Canarias: 25.000 × 0,75 % = 187,50
    expect(await valorTarjeta(page, 'AJD')).toBe('187,50 €');
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('371,84 €');
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('80,21 €');
    expect(await valorTarjeta(page, 'Gastos de gestoría')).toBe('300,00 €');

    // Y el total dice DOS veces que le falta el impuesto principal: en el rótulo y en el pie
    expect(await tituloTarjeta(page, 'Total gastos adicionales')).toBe(
      'Total gastos adicionales (parcial)',
    );
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('939,55 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toBe(
      '3,76% sobre el precio — SIN el IGIC, que no está incluido',
    );
    expect(await tituloTarjeta(page, 'COSTE TOTAL')).toBe('COSTE TOTAL (PARCIAL)');
    expect(await valorTarjeta(page, 'COSTE TOTAL')).toBe('25.939,55 €');
    expect(await descripcionTarjeta(page, 'COSTE TOTAL')).toBe(
      'No incluye el IGIC: el coste real será mayor',
    );
  });

  /**
   * A2 — LO QUE NO DEBÍA CAMBIAR (1 de 2): el territorio donde el IVA sí rige.
   * Madrid, obra nueva vinculada a la vivienda (IVA_INMUEBLES_2025.anejoVinculado = 10):
   *   IVA = 25.000 × 10 % =                                                     2.500,00
   *   AJD = 25.000 × 0,75 % (ITP_CCAA.madrid.ajd) =                               187,50
   *   total gastos = 2.500 + 187,50 + 371,842444 + 80,207841 + 300 =            3.439,550285
   *   % sobre el precio =                                                          13,758201 %
   *   coste total = 28.439,550285
   * El rótulo vuelve a ser el completo, sin «(parcial)», y sin aviso de territorio.
   */
  test('A2 · Madrid · primera mano: donde el IVA sí rige, se sigue cobrando y el total es completo', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Primera mano/ }).click();
    await page.getByRole('button', { name: /Vinculado a vivienda/ }).click();
    await page.selectOption('#select-ccaa', 'madrid');
    await rellenar(page, 'Precio del garaje / plaza de parking', '25000');
    await rellenar(page, 'Gastos de gestoría del comprador (€)', '300');

    await expect(page.getByText(/no se aplica el IVA/)).toHaveCount(0);
    expect(await valorTarjeta(page, 'IVA (10,00%)')).toBe('2500,00 €');
    expect(await valorTarjeta(page, 'AJD (0,75%)')).toBe('187,50 €');
    expect(await tituloTarjeta(page, 'Total gastos adicionales')).toBe('Total gastos adicionales');
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('3439,55 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toBe(
      '13,76% sobre el precio',
    );
    expect(await tituloTarjeta(page, 'COSTE TOTAL')).toBe('COSTE TOTAL DE ADQUISICIÓN');
    expect(await valorTarjeta(page, 'COSTE TOTAL')).toBe('28.439,55 €');
    expect(await descripcionTarjeta(page, 'COSTE TOTAL')).toBe('Precio + todos los gastos');
  });

  /**
   * A3 — LO QUE NO DEBÍA CAMBIAR (2 de 2): el ITP de Canarias, que allí SÍ existe.
   * La reparación suprime la cifra solo en la rama de primera mano; una reparación
   * demasiado ancha —que hubiera puesto `impuestoNoCalculado` a la altura de la comunidad
   * y no de la operación— dejaría sin calcular el ITP de la segunda mano, que es la
   * transmisión más frecuente y cuyo tipo sí está sellado en `data/fiscal`.
   *   ITP = 25.000 × 6,5 % (TIPOS_ITP_CCAA_2025 → { ccaa: 'Canarias', tipo: 6.5 }) = 1.625,00
   *   Ningún reducido canario aplica a un garaje suelto: los cuatro exigen «Vivienda
   *   habitual» o pertenecer a un colectivo, y `elegirTipoITP` recibe viviendaHabitual: false.
   *   total gastos = 1.625 + 371,842444 + 80,207841 + 300 =                      2.377,050285
   *   % sobre el precio =                                                            9,508201 %
   *   coste total = 27.377,050285
   */
  test('A3 · Canarias · segunda mano: el ITP no se ha suprimido con el IVA', async ({ page }) => {
    await page.goto(RUTA);
    await page.selectOption('#select-ccaa', 'canarias');
    await rellenar(page, 'Precio del garaje / plaza de parking', '25000');
    await rellenar(page, 'Gastos de gestoría del comprador (€)', '300');

    // En una transmisión por ITP no hay nada que advertir sobre el IVA
    await expect(page.getByText(/no se aplica el IVA/)).toHaveCount(0);
    expect(await valorTarjeta(page, 'ITP (6,50%)')).toBe('1625,00 €');
    expect(await tituloTarjeta(page, 'COSTE TOTAL')).toBe('COSTE TOTAL DE ADQUISICIÓN');
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('2377,05 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toBe('9,51% sobre el precio');
    expect(await valorTarjeta(page, 'COSTE TOTAL')).toBe('27.377,05 €');
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// MITAD B — CASOS NUEVOS (28/08/2026)
// Tres zonas que ninguna inspección anterior tocó, todas en la parte que el commit d787b81b
// movió o dejó a su lado: el OTRO territorio sin IVA (Ceuta, donde además hay bonificación de
// AJD), la rama del método REAL de la plusvalía municipal (la del 27/08 solo ejerció la del
// método objetivo) y los importes negativos del VENDEDOR, que es el único lado del formulario
// que la reparación de la gestoría negativa no acotó.
// Resueltos a mano ANTES de abrir el navegador; la aritmética va junto a cada aserción.
// ═════════════════════════════════════════════════════════════════════════════

test.describe('MITAD B — casos nuevos de la re-inspección (28/08/2026)', () => {
  /**
   * CASO 8 (LÍMITE TERRITORIAL) — Ceuta, primera mano. Es el otro territorio de
   * `TERRITORIOS_SIN_IVA`, y añade algo que Canarias no tiene: la bonificación del 50 % de la
   * cuota gradual de AJD (art. 57 bis.1 TRLITPAJD), que `calcularAJD` aplica vía
   * `aplicarBonificacionCiudad`. Es el único caso del catálogo donde conviven «impuesto
   * indirecto sin cifrar» y «AJD bonificado».
   *   IPSI: no se cifra (TERRITORIOS_SIN_IVA.ceuta)
   *   AJD  = 25.000 × 0,5 % (ITP_CCAA.ceuta.ajd) = 125,00 → bonificado al 50 % =    62,50
   *   notaría =                                                                    371,842444
   *   registro =                                                                    80,207841
   *   gestoría =                                                                   300,00
   *   total gastos = 0 + 62,50 + 371,842444 + 80,207841 + 300 =                    814,550285
   *   % sobre el precio =                                                            3,258201 %
   *   coste total (PARCIAL) =                                                    25.814,550285
   */
  test('CASO 8 (límite) — Ceuta, primera mano: IPSI sin cifrar y AJD con la bonificación del 50 %', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Primera mano/ }).click();
    await page.getByRole('button', { name: /Vinculado a vivienda/ }).click();
    await page.selectOption('#select-ccaa', 'ceuta');
    await rellenar(page, 'Precio del garaje / plaza de parking', '25000');
    await rellenar(page, 'Gastos de gestoría del comprador (€)', '300');

    await expect(page.locator('h3', { hasText: /^IVA/ })).toHaveCount(0);
    expect(await valorTarjeta(page, 'IPSI')).toBe('No calculado');

    // 125,00 nominales bonificados al 50 % (art. 57 bis.1 TRLITPAJD)
    expect(await valorTarjeta(page, 'AJD')).toBe('62,50 €');

    expect(await tituloTarjeta(page, 'Total gastos adicionales')).toBe(
      'Total gastos adicionales (parcial)',
    );
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('814,55 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toBe(
      '3,26% sobre el precio — SIN el IPSI, que no está incluido',
    );
    expect(await valorTarjeta(page, 'COSTE TOTAL')).toBe('25.814,55 €');
  });

  /**
   * CASO 9 (NORMAL) — la plusvalía municipal por el MÉTODO REAL. El caso 4 del 27/08 ejerció
   * la rama del método objetivo; la del real (art. 107.5 TRLHL) no se había probado nunca, y
   * es la que gana cuando el incremento de valor es pequeño frente al valor catastral del suelo.
   *
   * Entrada: venta 30.000 € · compra 28.000 € · gastos de aquella compra 0 € · 15 años ·
   *          suelo catastral 20.000 € · total catastral 25.000 € · comisión 3 % · gestoría 0 €.
   *
   * Plusvalía — `calcularPlusvaliaMunicipal`, con COEFICIENTES_IIVTNU_2025[15 años] = 0,12 y
   *   PLUSVALIA_MUNICIPAL_META.tipoOrientativo = 25:
   *   objetivo (art. 107.4) = 20.000 × 0,12 × 25 % =                                600,00
   *   real (art. 107.5)     = (30.000 − 28.000) × (20.000/25.000) × 25 % =           400,00
   *   recomendado = min(600 ; 400) = 400,00 → «Método real (más favorable)»
   *
   * Ganancia — `calcularGananciaInmueble` (art. 35 LIRPF):
   *   comisión             = 30.000 × 3 % =                                          900,00
   *   valor de adquisición = 28.000 + 0 =                                         28.000,00
   *   valor de transmisión = 30.000 − 900 − 400 =                                 28.700,00
   *   ganancia             = 28.700 − 28.000 =                                        700,00
   *   IRPF (TRAMOS_GANANCIAS_PATRIMONIALES_2025) = 700 × 19 % =                       133,00
   *   total gastos vendedor = 400 + 900 + 0 + 133 =                                 1.433,00
   *   neto = 30.000 − 1.433 =                                                     28.567,00
   */
  test('CASO 9 (normal) — la plusvalía municipal por el método real, cuando es el más favorable', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await rellenar(page, 'Precio del garaje / plaza de parking', '30000');
    await page.getByRole('tab', { name: /Vendedor/ }).click();
    await rellenar(page, 'Precio de compra original del garaje', '28000');
    await rellenar(page, 'Impuestos y gastos que pagaste al comprarlo (€)', '0');
    await rellenar(page, 'Años de propiedad', '15');
    await rellenar(page, 'Valor catastral del suelo (€)', '20000');
    await rellenar(page, 'Valor catastral total (suelo + construcción) (€)', '25000');
    await rellenar(page, 'Comisión inmobiliaria del vendedor (%)', '3');

    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('400,00 €');
    expect(await descripcionTarjeta(page, 'Plusvalía municipal')).toBe('Método real (más favorable)');
    expect(await valorTarjeta(page, 'Valor de adquisición')).toBe('28.000,00 €');
    expect(await valorTarjeta(page, 'Valor de transmisión')).toBe('28.700,00 €');
    expect(await valorTarjeta(page, 'Ganancia patrimonial')).toBe('700,00 €');
    expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('133,00 €');
    expect(await valorTarjeta(page, 'Comisión inmobiliaria')).toBe('900,00 €');
    expect(await valorTarjeta(page, 'Total gastos vendedor')).toBe('1433,00 €');
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('28.567,00 €');
  });

  /**
   * CASO 10 (DEBE RECHAZARSE) — una comisión inmobiliaria negativa. Este test fija el
   * comportamiento que SÍ es correcto: al salir del campo, `NumberInput` normaliza al mínimo
   * declarado (min = 0) y el presupuesto vuelve a cuadrar. Lo que ocurre MIENTRAS el campo
   * tiene el foco es un hallazgo abierto, y va abajo con su propio test.
   *
   * Entrada: venta 30.000 € · compra 18.000 € · gastos de aquella compra 0 € · comisión «-5».
   *   comisión acotada a 0 → valor de transmisión = 30.000
   *   ganancia = 30.000 − 18.000 =                                              12.000,00
   *   IRPF = 6.000 × 19 % + 6.000 × 21 % = 1.140 + 1.260 =                       2.400,00
   *   total gastos vendedor = 0 + 0 + 0 + 2.400 =                                2.400,00
   *   neto = 30.000 − 2.400 =                                                   27.600,00
   */
  test('CASO 10 (debe rechazarse) — al salir del campo, la comisión negativa se normaliza a 0', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await rellenar(page, 'Precio del garaje / plaza de parking', '30000');
    await page.getByRole('tab', { name: /Vendedor/ }).click();
    await rellenar(page, 'Precio de compra original del garaje', '18000');
    await rellenar(page, 'Impuestos y gastos que pagaste al comprarlo (€)', '0');
    const comision = page.locator('input[aria-label="Comisión inmobiliaria del vendedor (%)"]');
    await comision.fill('-5');
    await comision.blur();

    await expect(comision).toHaveValue('0');
    // Sin comisión, ningún gasto de transmisión rebaja la ganancia (art. 35.1 LIRPF)
    expect(await valorTarjeta(page, 'Valor de transmisión')).toBe('30.000,00 €');
    expect(await valorTarjeta(page, 'Ganancia patrimonial')).toBe('12.000,00 €');
    expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('2400,00 €');
    expect(await valorTarjeta(page, 'Total gastos vendedor')).toBe('2400,00 €');
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('27.600,00 €');
    // Una comisión de 0 no pinta tarjeta: el total no puede llevar nada que no se vea
    await expect(page.locator('h3', { hasText: 'Comisión inmobiliaria' })).toHaveCount(0);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// Hallazgos 473-475 de la re-inspección del 28/08/2026 — reparados.
// ═════════════════════════════════════════════════════════════════════════════

test.describe('Hallazgos reparados — re-inspección del 28/08/2026', () => {
  // Hallazgo 473 — reparado. La tarjeta del AJD da ahora el tipo EFECTIVO
  // (`ajd / precioGaraje * 100`), no el nominal de la tabla: en Ceuta y Melilla la
  // bonificación del 50 % (art. 57 bis TRLITPAJD) hace que el nominal desmienta el importe
  // de al lado, igual que ya reparó nave-industrial y estimador-compraventa-inmueble.
  test('REGRESIÓN — el rótulo del AJD da el tipo efectivo, no el nominal, donde hay bonificación', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Primera mano/ }).click();
    await page.selectOption('#select-ccaa', 'ceuta');
    await rellenar(page, 'Precio del garaje / plaza de parking', '25000');

    // 62,50 / 25.000 = 0,25 % — el rótulo tiene que decir lo mismo que el importe de al lado
    expect(await tituloTarjeta(page, 'AJD')).toBe('AJD (0,25%)');
  });

  // Hallazgo 474 — reparado. La comisión y la gestoría del VENDEDOR se acotan ahora con
  // `Math.max(0, ...)` dentro del useMemo, igual que d787b81b ya hizo con la gestoría del
  // comprador.
  test('REGRESIÓN — la comisión negativa del vendedor se acota a 0 mientras el campo tiene el foco', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await rellenar(page, 'Precio del garaje / plaza de parking', '30000');
    await page.getByRole('tab', { name: /Vendedor/ }).click();
    await rellenar(page, 'Precio de compra original del garaje', '18000');
    await rellenar(page, 'Impuestos y gastos que pagaste al comprarlo (€)', '0');
    await page.locator('input[aria-label="Comisión inmobiliaria del vendedor (%)"]').fill('-5');

    // El IRPF ya sale bien (el motor acota con positivo()); lo que no cuadra es el total
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('27.600,00 €');
  });

  // Hallazgo 474 — reparado. El mismo defecto en el otro campo del vendedor.
  test('REGRESIÓN — la gestoría negativa del vendedor se acota a 0 mientras el campo tiene el foco', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await rellenar(page, 'Precio del garaje / plaza de parking', '30000');
    await page.getByRole('tab', { name: /Vendedor/ }).click();
    await rellenar(page, 'Precio de compra original del garaje', '18000');
    await rellenar(page, 'Impuestos y gastos que pagaste al comprarlo (€)', '0');
    await rellenar(page, 'Comisión inmobiliaria del vendedor (%)', '0');
    await page.locator('input[aria-label="Gestoría y certificados del vendedor (€)"]').fill('-500');

    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('27.600,00 €');
  });

  // Hallazgo 475 — reparado. El selector «Tipo de garaje» ya no se ofrece en Canarias, Ceuta
  // y Melilla: la elección vinculado/independiente no cambiaba el resultado en nada allí.
  test('REGRESIÓN — en un territorio sin IVA no se ofrece un selector de tipo de IVA', async ({ page }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Primera mano/ }).click();
    await page.selectOption('#select-ccaa', 'canarias');
    await rellenar(page, 'Precio del garaje / plaza de parking', '25000');

    await expect(page.getByRole('group', { name: /Tipo de garaje/i })).toHaveCount(0);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// RE-INSPECCIÓN 30/08/2026 — la cola invalidó esta app tras la «tanda 2 de reparación»
// del clúster de compraventa (commit 0828da3e). Aquí NO se da por bueno el commit: los
// tres casos se han resuelto a mano contra `data/fiscal` y `data/itp-ccaa.ts` ANTES de
// abrir el navegador, y se han vuelto a ejecutar de cero.
//
// De dónde sale CADA cifra (ninguna de memoria):
//  - Tipo general de ITP → `TIPOS_ITP_CCAA_2025` en `data/fiscal/inmuebles.ts`, leído por
//    `tipoGeneralDe()` (Andalucía = 7 %). Ceuta es la excepción declarada del fichero:
//    `ITP_CCAA.ceuta.tipoGeneral = 6` con un reducido de UBICACIÓN al 3 %, que es el 6 %
//    ya bonificado al 50 % por el art. 57 bis TRLITPAJD.
//  - AJD por territorio → `ITP_CCAA` (`ceuta.ajd = 0.5`), bonificado al 50 % en
//    `calcularAJD` → `aplicarBonificacionCiudad` (art. 57 bis.1 TRLITPAJD).
//  - Territorios sin IVA → `TERRITORIOS_SIN_IVA` (Ceuta → IPSI).
//  - Arancel notarial → `ARANCELES_NOTARIO` (RD 1426/1989, número 2) + la horquilla de
//    `FACTURA_NOTARIAL` (×1,5 a ×2; la tarjeta enseña el punto medio ×1,75).
//  - Arancel registral → `ARANCELES_REGISTRO` (RD 1427/1989, número 2) + los dos fijos de
//    `REGISTRO_CONCEPTOS` (presentación 6,010121 € y nota simple 3,005061 €). 21 % de IVA
//    dentro de ambos motores.
// ═════════════════════════════════════════════════════════════════════════════

test.describe('RE-INSPECCIÓN 30/08/2026 — los tres casos, resueltos a mano antes de ejecutar', () => {
  /**
   * CASO 11 (NORMAL, PENÍNSULA) — el caso LITERAL que la propia app publica en su tarjeta
   * educativa «Tipos reducidos de ITP para garaje»: «Carlos, 28 años, compra un garaje en
   * Andalucía por 18.000 €». Se elige a propósito porque es donde el texto y el motor pueden
   * separarse: el motor está bien y es el texto el que promete de más (ver el `test.fail` de
   * más abajo).
   *
   * ITP — `elegirTipoITP('andalucia', 'joven', 18000, { viviendaHabitual: false })`:
   *   el único candidato por nombre es «Jóvenes < 35 años» (3,5 %), y sus condiciones son
   *   ['Menor de 35 años', 'Vivienda habitual', 'Valor ≤ 150.000 €']. Un garaje suelto NUNCA
   *   es vivienda habitual, así que esa condición no se puede dar por cumplida y el reducido
   *   cae en `noComprobables`. Se aplica el tipo general:
   *     18.000 × 7 % =                                                          1.260,00
   *   (con el 3,5 % del texto saldrían 630,00 €, la mitad)
   *
   * Notaría — ARANCELES_NOTARIO, arancel sin IVA:
   *   tramo 1 (hasta 6.010,12 €)             →                                    90,15
   *   tramo 2 (6.010,12→30.050,61, 0,45 %)   → 11.989,88 × 0,0045 =               53,95446
   *   arancel                                 =                                  144,10446
   *   con el 21 % de IVA                      = 144,10446 × 1,21 =               174,366397
   *   FACTURA_NOTARIAL: ×1,5 = 261,549595 · ×2 = 348,732793 · medio =            305,141194
   *
   * Registro — ARANCELES_REGISTRO + REGISTRO_CONCEPTOS:
   *   24,04 + 11.989,88 × 0,00175 = 24,04 + 20,98229 =                            45,02229
   *   + presentación 6,010121 + nota simple 3,005061 =                            54,037472
   *   con el 21 % de IVA = 54,037472 × 1,21 =                                     65,385341
   *
   * Total gastos = 1.260 + 305,141194 + 65,385341 + 300 =                      1.930,526535
   *   % sobre el precio = 1.930,526535 / 18.000 =                                10,725147 %
   * Coste total = 18.000 + 1.930,526535 =                                     19.930,526535
   */
  test('CASO 11 (normal) — Andalucía, 18.000 €, perfil Joven: se aplica el 7 % general, no el 3,5 %', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Segunda mano/ }).click();
    await page.selectOption('#select-ccaa', 'andalucia');
    await page.selectOption('#select-perfil', 'joven');
    await rellenar(page, 'Precio del garaje / plaza de parking', '18000');
    await rellenar(page, 'Gastos de gestoría del comprador (€)', '300');

    expect(await valorTarjeta(page, 'ITP (7,00%)')).toBe('1260,00 €');
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('305,14 €');
    const notaria = await descripcionTarjeta(page, 'Gastos de notaría');
    expect(notaria).toContain('261,55 €');
    expect(notaria).toContain('348,73 €');
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('65,39 €');
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('1930,53 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toContain('10,73%');
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('19.930,53 €');

    // El reducido no aplicado se enseña como oportunidad, nunca como cifra, y se dice por qué
    const aviso = page.locator('[role="note"]').filter({ hasText: 'Podrías pagar menos' });
    await expect(aviso).toBeVisible();
    await expect(aviso).toContainText('3,50% — Jóvenes < 35 años');
    await expect(aviso).toContainText('Un garaje comprado por separado no es vivienda habitual');
  });

  /**
   * CASO 12 (RÉGIMEN ESPECIAL) — Ceuta, que es donde se concentran tres de los cinco
   * hallazgos que la tanda 2 reparó: la bonificación del 50 %, el rótulo del AJD y el IVA
   * que allí no existe. Se prueban las dos ramas de la app en el mismo test.
   *
   * (a) SEGUNDA MANO — `elegirTipoITP('ceuta', 'general', 25000, …)`: «Bonificación general
   *     50%» tiene condiciones de UBICACIÓN (`CONDICIONES_DE_UBICACION`), así que se aplica
   *     sola con perfil General. Su `tipo: 3` ya es el 6 % bonificado (art. 57 bis.3.a
   *     TRLITPAJD), y `importeITP` no vuelve a bonificar un reducido:
   *       25.000 × 3 % =                                                           750,00
   *     tipo EFECTIVO = 750 / 25.000 = 3,00 % → el rótulo dice «ITP (3,00%)»
   *     Total gastos = 750 + 371,842444 + 80,207841 + 300 =                      1.502,050285
   *
   * (b) PRIMERA MANO — `TERRITORIOS_SIN_IVA.ceuta` = IPSI: no se cifra ningún impuesto
   *     indirecto y el total se rotula PARCIAL.
   *       AJD = 25.000 × 0,5 % = 125,00 nominales, bonificados al 50 % (art. 57 bis.1) →  62,50
   *       tipo EFECTIVO = 62,50 / 25.000 = 0,25 % → el rótulo dice «AJD (0,25%)», no 0,50 %
   *       Total gastos = 0 + 62,50 + 371,842444 + 80,207841 + 300 =                814,550285
   *         % sobre el precio = 814,550285 / 25.000 =                               3,258201 %
   *       Coste total = 25.000 + 814,550285 =                                   25.814,550285
   *     (Notaría y registro de 25.000 €: los mismos 371,84 € y 80,21 € del CASO 1.)
   */
  test('CASO 12 (régimen especial) — Ceuta: ITP bonificado al 50 %, IPSI sin cifrar y AJD al tipo efectivo', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await page.selectOption('#select-ccaa', 'ceuta');
    await page.selectOption('#select-perfil', 'general');
    await rellenar(page, 'Precio del garaje / plaza de parking', '25000');
    await rellenar(page, 'Gastos de gestoría del comprador (€)', '300');

    // (a) Segunda mano
    await page.getByRole('button', { name: /Segunda mano/ }).click();
    expect(await tituloTarjeta(page, 'ITP')).toBe('ITP (3,00%)');
    expect(await valorTarjeta(page, 'ITP')).toBe('750,00 €');
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('1502,05 €');
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('26.502,05 €');

    // (b) Primera mano: ni un solo 21 % ofrecido donde el IVA no rige
    await page.getByRole('button', { name: /Primera mano/ }).click();
    await expect(page.getByRole('group', { name: /Tipo de garaje/i })).toHaveCount(0);
    await expect(page.locator('h3', { hasText: /^IVA/ })).toHaveCount(0);
    expect(await valorTarjeta(page, 'IPSI')).toBe('No calculado');
    await expect(page.getByText(/no se aplica el IVA/)).toBeVisible();

    expect(await tituloTarjeta(page, 'AJD')).toBe('AJD (0,25%)');
    expect(await valorTarjeta(page, 'AJD')).toBe('62,50 €');
    expect(await tituloTarjeta(page, 'Total gastos adicionales')).toBe(
      'Total gastos adicionales (parcial)',
    );
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('814,55 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toContain(
      'SIN el IPSI, que no está incluido',
    );
    expect(await tituloTarjeta(page, 'COSTE TOTAL')).toBe('COSTE TOTAL (PARCIAL)');
    expect(await valorTarjeta(page, 'COSTE TOTAL')).toBe('25.814,55 €');
  });

  /**
   * CASO 13 (LÍMITE) — el precio de compra vacío y el precio de compra a 0, que es el caso
   * del que salió el hallazgo 428/483: el IRPF se anunciaba «SIN CUOTA» en verde cuando lo
   * que pasaba es que faltaba el dato para calcularlo.
   *
   * Entrada: venta 25.000 € · comisión 3 % (el valor por defecto del campo) · sin precio de
   *          compra, sin años y sin valor catastral.
   *   comisión = 25.000 × 3 % =                                                     750,00
   *   plusvalía municipal: NO calculable (faltan suelo, años y precio de compra) → 0, y NO
   *     se suma al total ni al neto
   *   IRPF: NO calculable (`irpfCalculado = false` porque `precioC > 0` es falso) → 0, y
   *     tampoco entra en el neto
   *   total gastos vendedor = 0 + 750 + 0 + 0 =                                     750,00
   *   neto = 25.000 − 750 =                                                      24.250,00
   *
   * Lo que se exige: que ni el 0 de la plusvalía ni el 0 del IRPF se presenten como una
   * exención («EXENTO», «SIN CUOTA» en verde), y que el neto se declare INCOMPLETO diciendo
   * qué dos partidas le faltan.
   */
  test('CASO 13 (límite) — sin precio de compra, el IRPF es «Sin calcular» y el neto se declara incompleto', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await rellenar(page, 'Precio del garaje / plaza de parking', '25000');
    await page.getByRole('tab', { name: /Vendedor/ }).click();

    for (const precioCompra of ['', '0']) {
      if (precioCompra !== '') {
        await rellenar(page, 'Precio de compra original del garaje', precioCompra);
      }

      expect(await valorTarjeta(page, 'Precio de venta')).toBe('25.000,00 €');

      // El 0 de la plusvalía no es una exención: es un dato que falta, y se nombra cuál
      expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('Sin calcular');
      const plusvalia = await descripcionTarjeta(page, 'Plusvalía municipal');
      expect(plusvalia).toContain('el precio de compra original');
      expect(plusvalia).toContain('el valor catastral del suelo');
      expect(plusvalia).toContain('los años de propiedad');

      // Y el 0 del IRPF tampoco: nada de «SIN CUOTA» en verde (hallazgo 428/483)
      expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('Sin calcular');
      expect(await valorTarjeta(page, 'IRPF sobre ganancia')).not.toBe('SIN CUOTA');
      expect(await descripcionTarjeta(page, 'IRPF sobre ganancia')).toContain(
        'NO está incluido en el neto',
      );

      // Sin valor de adquisición no se pinta ganancia ni pérdida: no hay nada que comparar
      await expect(page.locator('h3', { hasText: 'Valor de adquisición' })).toHaveCount(0);
      await expect(page.locator('h3', { hasText: 'Ganancia patrimonial' })).toHaveCount(0);
      await expect(page.locator('h3', { hasText: 'Pérdida patrimonial' })).toHaveCount(0);

      // Total y neto: solo la comisión, y el neto avisa de las dos partidas que le faltan
      expect(await valorTarjeta(page, 'Comisión inmobiliaria')).toBe('750,00 €');
      expect(await valorTarjeta(page, 'Total gastos vendedor')).toBe('750,00 €');
      expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('24.250,00 €');
      const neto = await descripcionTarjeta(page, 'IMPORTE NETO VENDEDOR');
      expect(neto).toContain('INCOMPLETO');
      expect(neto).toContain('la plusvalía municipal');
      expect(neto).toContain('el IRPF de la ganancia');
    }
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// HALLAZGOS 514-516 de la re-inspección del 30/08/2026 — REPARADOS.
// Se escribieron con `test.fail()` afirmando lo que DEBERÍA pasar; hoy pasan en verde y
// quedan como regresión. Verificado en navegador el 02/09/2026, con lo que afirman releído
// uno a uno antes de darlos por cerrados (un `test.fail()` que se pone verde no prueba nada
// hasta comprobar su contenido). Los comentarios «❌ ABIERTO» de cada uno describen el
// defecto ORIGINAL, no el estado actual.
// ═════════════════════════════════════════════════════════════════════════════

test.describe('Hallazgos 514-516 — re-inspección del 30/08/2026, reparados', () => {
  // ❌ ABIERTO (alto) — contenido.
  // La tarjeta educativa «Tipos reducidos de ITP para garaje» afirma: «Carlos, 28 años, compra
  // un garaje en Andalucía por 18.000 €. Al ser joven, puede aplicar el tipo reducido
  // autonómico. El simulador detecta el tipo reducido disponible y LO APLICA AUTOMÁTICAMENTE
  // al seleccionar "Joven" en el perfil del comprador.»
  // Con esa entrada exacta el simulador aplica el 7 % general (1.260,00 €) y NO el 3,5 %
  // (630,00 €), porque el reducido de Andalucía exige «Vivienda habitual» y un garaje suelto
  // no lo es nunca — que es justo lo que dice el aviso «Podrías pagar menos» de la misma
  // pantalla. El texto describe el comportamiento ANTERIOR a la reparación del 14/08/2026 y
  // contradice a la vez al motor y al aviso legal de la propia app. La fila «Tipos reducidos
  // ITP → Sí (joven, discapacidad…)» de la tabla comparativa refuerza la misma promesa sin
  // la condición que la anula.
  // Caso: bloque educativo, tarjeta de Carlos → esperado que NO prometa aplicación automática
  //       para un garaje suelto · obtenido «lo aplica automáticamente al seleccionar "Joven"».
  test('514 — el ejemplo de Carlos ya no promete un reducido que el motor descarta', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await page.selectOption('#select-ccaa', 'andalucia');
    await page.selectOption('#select-perfil', 'joven');
    await rellenar(page, 'Precio del garaje / plaza de parking', '18000');

    // Lo que el motor hace de verdad con la entrada del ejemplo
    expect(await valorTarjeta(page, 'ITP (7,00%)')).toBe('1260,00 €');

    await page
      .getByRole('button', { name: /Ver guía educativa|Todo lo que necesitas saber/i })
      .click();
    const carlos = (await page.getByText(/Carlos, 28 años/).innerText()).replace(/\s+/g, ' ');
    expect(carlos).not.toMatch(/lo aplica autom[áa]ticamente/i);
    expect(carlos).toMatch(/el reducido no aplica/i);
  });

  // ❌ ABIERTO (medio) — contenido.
  // Al elegir cualquier perfil distinto de «General», el panel izquierdo lista los tipos
  // reducidos de la comunidad bajo el rótulo «Tipos reducidos DISPONIBLES en X» y SIN sus
  // condiciones, mientras el panel derecho, en la misma pantalla, dice «En X existe:» y
  // enseña solo los que el motor ha podido considerar. En Andalucía con perfil Joven: la
  // izquierda anuncia cinco (6 % · 3,5 % · 3,5 % · 3,5 % · 3,5 %) y la derecha uno. Cuatro de
  // los cinco exigen «Vivienda habitual», que un garaje suelto no cumple nunca — condición que
  // la lista de la izquierda no muestra. Dos listas contradictorias en la misma pantalla, y la
  // que se lee primero es la que promete de más.
  // Caso: Andalucía · perfil Joven → esperado que la lista traiga la condición que la anula o
  //       no rotule «disponibles» · obtenido cinco tipos «disponibles» sin condiciones.
  test('515 — la lista de tipos reducidos muestra sus condiciones, no solo el tipo', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await page.selectOption('#select-ccaa', 'andalucia');
    await page.selectOption('#select-perfil', 'joven');
    await rellenar(page, 'Precio del garaje / plaza de parking', '18000');

    // El rótulo subió de `<h4>` a `<h3>` con el hallazgo 626 (09/09/2026), que enderezó el
    // esquema de encabezados de la app. Se localiza por su texto y su papel de encabezado,
    // no por el nivel: lo que este test verifica es el CONTENIDO de la lista.
    const lista = page.getByRole('heading', { name: /Tipos reducidos en/ }).locator('xpath=..');
    // Ya no se anuncian como «disponibles»: cada línea trae sus condiciones reales,
    // y la de Vivienda habitual es la que un garaje suelto nunca cumple.
    await expect(lista).toContainText('Vivienda habitual', { useInnerText: true });
    await expect(lista).toContainText(/TODAS sus condiciones/i);
  });

  // ❌ ABIERTO (medio) — dato.
  // La plusvalía municipal se calcula con `PLUSVALIA_MUNICIPAL_META.tipoOrientativo = 25`
  // (data/fiscal/inmuebles.ts), un tipo INVENTADO como media: la ley solo fija el techo del
  // 30 % y cada Ayuntamiento pone el suyo. Ese 25 % no aparece en ninguna parte de la página
  // —el sello de datos solo menciona el máximo legal del 30 %— y el usuario no puede
  // cambiarlo. La cifra no es decorativa: entra en el valor de transmisión, así que mueve
  // también la ganancia, el IRPF y el neto.
  // Caso: venta 22.000 · compra 15.000 · 10 años · suelo 5.000 · total 12.000 →
  //       plusvalía 100,00 € = 5.000 × 0,08 (COEFICIENTES_IIVTNU_2025, 10 años) × 25 %.
  //       En un municipio al 30 % serían 120,00 €. Esperado que la página publique el tipo
  //       usado (o lo deje introducir) · obtenido «100,00 € — Método objetivo (más favorable)»
  //       sin que el 25 % se lea en ningún sitio.
  test('516 — el tipo del 25 % con el que se calcula la plusvalía ya se publica', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await rellenar(page, 'Precio del garaje / plaza de parking', '22000');
    await page.getByRole('tab', { name: /Vendedor/ }).click();
    await rellenar(page, 'Precio de compra original del garaje', '15000');
    await rellenar(page, 'Años de propiedad', '10');
    await rellenar(page, 'Valor catastral del suelo (€)', '5000');
    await rellenar(page, 'Valor catastral total (suelo + construcción) (€)', '12000');

    // 5.000 × 0,08 × 25 % = 100,00 — el importe es el que corresponde al 25 % orientativo
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('100,00 €');

    // El 25 % ahora se publica en la FAQ del bloque educativo
    await page
      .getByRole('button', { name: /Ver guía educativa|Todo lo que necesitas saber/i })
      .click();
    const cuerpo = (await page.locator('body').innerText()).replace(/\s+/g, ' ');
    expect(cuerpo).toMatch(/tipo del 25\s*%/);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// INSPECCIÓN 02/09/2026 — tres casos NUEVOS, ninguno solapado con los anteriores.
//
// Qué añade cada uno sobre lo que ya había en este fichero:
//  · CASO A — la Comunidad Valenciana, cuyo tipo general bajó al 9 % el 01/06/2026 y que
//    ninguna inspección había ejercido. Es además una escala progresiva en su PRIMER tramo,
//    de modo que el importe tiene que coincidir con el tipo nominal del tramo.
//  · CASO B — el TRAMO MÁS ALTO de una escala progresiva (el 13 % de Cataluña). Los casos
//    5 (700.000 €) y 13 (Castilla y León) solo llegan al segundo tramo: el cuarto no se
//    había recorrido nunca, y es donde un fallo de acumulación no se vería en los otros.
//  · CASO C — el rechazo de unos AÑOS DE PROPIEDAD negativos, la única entrada del vendedor
//    que ninguna inspección había forzado (el 3 y el 7 son del precio, el 10 de la comisión).
//    Es la que alimenta el coeficiente del IIVTNU, así que un negativo no puede colarse.
//
// De dónde sale CADA cifra (ninguna de memoria):
//  - Tipo general de ITP → `TIPOS_ITP_CCAA_2025` en `data/fiscal/inmuebles.ts`, leído por
//    `tipoGeneralDe()` en `data/itp-ccaa.ts` (Valencia = 9 % desde el 01/06/2026;
//    Cataluña = 10 %).
//  - Escalas progresivas → `ITP_CCAA` en `data/itp-ccaa.ts` (Valencia 9 % hasta 1.000.000 €
//    y 11 % el resto · Cataluña 10 % hasta 600.000 · 11 % hasta 900.000 · 12 % hasta
//    1.500.000 · 13 % el resto), aplicadas por `importeITP` → `calcularITP` sin tercer
//    argumento.
//  - Arancel notarial → `ARANCELES_NOTARIO` (RD 1426/1989, número 2) + la horquilla de
//    `FACTURA_NOTARIAL` (×1,5 a ×2; la tarjeta enseña el punto medio ×1,75), con el 21 %
//    de IVA dentro de `calcularArancelNotarial`.
//  - Arancel registral → `ARANCELES_REGISTRO` (RD 1427/1989, número 2) + los dos fijos de
//    `REGISTRO_CONCEPTOS` (presentación 6,010121 € y nota simple 3,005061 €), 21 % dentro.
//  - Coeficiente de la plusvalía municipal → `COEFICIENTES_IIVTNU_2025` (1 año = 0,13) y
//    `PLUSVALIA_MUNICIPAL_META.tipoOrientativo` = 25 %, ambos en `data/fiscal/inmuebles.ts`.
//  - Ganancia patrimonial e IRPF → `calcularGananciaInmueble` (arts. 34-36 LIRPF,
//    `data/fiscal/ganancia-inmueble.ts`) sobre `TRAMOS_GANANCIAS_PATRIMONIALES_2025`
//    (19 % hasta 6.000 · 21 % hasta 50.000 · 23 % hasta 200.000 · 27 % · 30 %).
//
// Nota de formato: `formatCurrency` usa es-ES, que NO agrupa los millares de un número de
// cuatro cifras (4.457,52 → «4457,52 €») y sí los de cinco o más.
// ═════════════════════════════════════════════════════════════════════════════

test.describe('INSPECCIÓN 02/09/2026 — los tres casos, resueltos a mano antes de ejecutar', () => {
  /**
   * CASO A (NORMAL) — Comunidad Valenciana, segunda mano, 40.000 €, perfil General.
   *
   * ITP — `elegirTipoITP('valencia', 'general', 40000, { viviendaHabitual: false })` devuelve
   *   el tipo GENERAL: los siete reducidos valencianos exigen o pertenecer a un colectivo o
   *   «Vivienda habitual», que un garaje suelto no cumple nunca. `importeITP` va entonces por
   *   la escala de ITP_CCAA.valencia (9 % hasta 1.000.000 €):
   *     40.000 × 9 % =                                                            3.600,00
   *   tipo EFECTIVO = 3.600 / 40.000 = 9,00 % → el rótulo coincide con el nominal del tramo
   *
   * Notaría — ARANCELES_NOTARIO, arancel sin IVA:
   *   tramo 1 (hasta 6.010,12 €)              →                                    90,15
   *   tramo 2 (6.010,12→30.050,61, 0,45 %)    → 24.040,49 × 0,0045 =              108,182205
   *   tramo 3 (30.050,61→40.000, 0,15 %)      →  9.949,39 × 0,0015 =               14,924085
   *   arancel                                  =                                  213,25629
   *   con el 21 % de IVA                       = 213,25629 × 1,21 =               258,040111
   *   FACTURA_NOTARIAL: ×1,5 = 387,060166 · ×2 = 516,080222 · medio =             451,570194
   *
   * Registro — ARANCELES_REGISTRO + REGISTRO_CONCEPTOS:
   *   24,04 + 24.040,49×0,00175 + 9.949,39×0,00125 = 24,04 + 42,070858 + 12,436738 = 78,547595
   *   + presentación 6,010121 + nota simple 3,005061 =                             87,562777
   *   con el 21 % de IVA =                                                        105,950960
   *
   * Total gastos = 3.600 + 451,570194 + 105,950960 + 300 =                       4.457,521154
   *   % sobre el precio = 4.457,521154 / 40.000 =                                   11,143803 %
   * Coste total = 40.000 + 4.457,521154 =                                        44.457,521154
   * En segunda mano no hay AJD: TPO y AJD son incompatibles (art. 31.2 TRLITPAJD).
   */
  test('CASO A (normal) — Comunidad Valenciana, segunda mano, 40.000 €: el 9 % vigente desde el 01/06/2026', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Segunda mano/ }).click();
    await page.selectOption('#select-ccaa', 'valencia');
    await page.selectOption('#select-perfil', 'general');
    await rellenar(page, 'Precio del garaje / plaza de parking', '40000');
    await rellenar(page, 'Gastos de gestoría del comprador (€)', '300');

    expect(await tituloTarjeta(page, 'ITP')).toBe('ITP (9,00%)');
    expect(await valorTarjeta(page, 'ITP')).toBe('3600,00 €');

    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('451,57 €');
    const notaria = await descripcionTarjeta(page, 'Gastos de notaría');
    expect(notaria).toContain('387,06 €');
    expect(notaria).toContain('516,08 €');

    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('105,95 €');
    expect(await valorTarjeta(page, 'Gastos de gestoría')).toBe('300,00 €');

    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('4457,52 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toBe(
      '11,14% sobre el precio',
    );
    expect(await tituloTarjeta(page, 'COSTE TOTAL')).toBe('COSTE TOTAL DE ADQUISICIÓN');
    expect(await valorTarjeta(page, 'COSTE TOTAL')).toBe('44.457,52 €');
    await expect(page.locator('h3', { hasText: 'AJD' })).toHaveCount(0);

    // La escala se anuncia y, en este tramo, el importe coincide con su tipo nominal
    await expect(page.getByText('Esta comunidad aplica escala progresiva')).toBeVisible();
  });

  /**
   * CASO B (LÍMITE: EL TRAMO MÁS ALTO) — Cataluña, segunda mano, 2.000.000 €.
   * Es el único caso del fichero que recorre los CUATRO tramos de una escala, incluido el
   * 13 % del último. Con el tipo plano del primer tramo saldrían 200.000 € (30.000 menos).
   *
   * ITP — ITP_CCAA.cataluna.tramosProgresivos, acumulando:
   *     600.000 × 10 % =                                                          60.000,00
   *     300.000 × 11 % =                                                          33.000,00
   *     600.000 × 12 % =                                                          72.000,00
   *     500.000 × 13 % =                                                          65.000,00
   *                                                                              230.000,00
   *   tipo EFECTIVO = 230.000 / 2.000.000 = 11,50 % → el rótulo dice «ITP (11,50%)», que NO
   *   es ninguno de los cuatro tipos nominales: es la prueba de que la escala se ha aplicado.
   *
   * Notaría — ARANCELES_NOTARIO, arancel sin IVA:
   *   90,15 + 24.040,49×0,45 % + 30.050,60×0,15 % + 90.151,82×0,10 %
   *        + 450.759,07×0,05 % + 1.398.987,90×0,03 %                    =         978,63583
   *   con el 21 % de IVA = 978,63583 × 1,21 =                                   1.184,149354
   *   FACTURA_NOTARIAL: ×1,5 = 1.776,224031 · ×2 = 2.368,298709 · medio =       2.072,261370
   *
   * Registro — ARANCELES_REGISTRO + REGISTRO_CONCEPTOS:
   *   24,04 + 24.040,49×0,175 % + 30.050,60×0,125 % + 90.151,82×0,075 %
   *        + 450.759,07×0,030 % + 1.398.987,90×0,020 %                  =         586,313274
   *   (por debajo del tope REGISTRO_MAXIMO de 2.181,67)
   *   + presentación 6,010121 + nota simple 3,005061 =                           595,328456
   *   con el 21 % de IVA =                                                       720,347631
   *
   * Total gastos = 230.000 + 2.072,261370 + 720,347631 + 300 =                233.092,609001
   *   % sobre el precio =                                                          11,654630 %
   * Coste total = 2.000.000 + 233.092,609001 =                              2.233.092,609001
   */
  test('CASO B (límite: tramo más alto) — Cataluña 2.000.000 €: los cuatro tramos hasta el 13 %', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Segunda mano/ }).click();
    await page.selectOption('#select-ccaa', 'cataluna');
    await rellenar(page, 'Precio del garaje / plaza de parking', '2000000');
    await rellenar(page, 'Gastos de gestoría del comprador (€)', '300');

    await expect(page.getByText('Esta comunidad aplica escala progresiva')).toBeVisible();
    expect(await tituloTarjeta(page, 'ITP')).toBe('ITP (11,50%)');
    expect(await valorTarjeta(page, 'ITP')).toBe('230.000,00 €');

    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('2072,26 €');
    const notaria = await descripcionTarjeta(page, 'Gastos de notaría');
    expect(notaria).toContain('1776,22 €');
    expect(notaria).toContain('2368,30 €');

    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('720,35 €');
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('233.092,61 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toBe(
      '11,65% sobre el precio',
    );
    expect(await valorTarjeta(page, 'COSTE TOTAL')).toBe('2.233.092,61 €');
  });

  /**
   * CASO C (DEBE RECHAZARSE) — unos AÑOS DE PROPIEDAD negativos. Es el dato que elige el
   * coeficiente del IIVTNU (`COEFICIENTES_IIVTNU_2025`), así que un negativo no puede
   * producir plusvalía: `calcularPlusvaliaMunicipal` acotaría −3 a 1 año en silencio, y la
   * app tiene que negarse ANTES, mientras el campo aún tiene el foco.
   *
   * Entrada: venta 30.000 € · compra 20.000 € · gastos de aquella compra 0 € · suelo
   *          catastral 4.000 € · total catastral 12.000 € · comisión 3 % · años «-3».
   *
   * (a) CON «-3» EN EL CAMPO — la guarda `anios > 0` deja la plusvalía SIN CALCULAR, y el
   *     resto del vendedor sigue siendo correcto sin ella:
   *       comisión = 30.000 × 3 % =                                                 900,00
   *       valor de transmisión = 30.000 − 900 − 0 =                              29.100,00
   *       ganancia = 29.100 − 20.000 =                                            9.100,00
   *       IRPF = 6.000×19 % + 3.100×21 % = 1.140 + 651 =                          1.791,00
   *       total gastos vendedor = 0 + 900 + 0 + 1.791 =                           2.691,00
   *       neto = 30.000 − 2.691 =                                                27.309,00
   *     La plusvalía NO se suma al total ni al neto, y el neto se declara INCOMPLETO.
   *
   * (b) AL SALIR DEL CAMPO — NumberInput normaliza al mínimo declarado (min = 1):
   *       coeficiente de 1 año (COEFICIENTES_IIVTNU_2025) =                            0,13
   *       objetivo (art. 107.4 TRLHL) = 4.000 × 0,13 × 25 % =                        130,00
   *       real (art. 107.5) = 10.000 × (4.000/12.000) × 25 % =                        833,33
   *       recomendado = min(130 ; 833,33) = 130,00 → «Método objetivo (más favorable)»
   *       valor de transmisión = 30.000 − 900 − 130 =                             28.970,00
   *       ganancia = 28.970 − 20.000 =                                            8.970,00
   *       IRPF = 6.000×19 % + 2.970×21 % = 1.140 + 623,70 =                       1.763,70
   *       total gastos vendedor = 130 + 900 + 0 + 1.763,70 =                      2.793,70
   *       neto = 30.000 − 2.793,70 =                                             27.206,30
   */
  test('CASO C (debe rechazarse) — unos años de propiedad negativos no producen plusvalía', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await rellenar(page, 'Precio del garaje / plaza de parking', '30000');
    await page.getByRole('tab', { name: /Vendedor/ }).click();
    await rellenar(page, 'Precio de compra original del garaje', '20000');
    await rellenar(page, 'Impuestos y gastos que pagaste al comprarlo (€)', '0');
    await rellenar(page, 'Valor catastral del suelo (€)', '4000');
    await rellenar(page, 'Valor catastral total (suelo + construcción) (€)', '12000');
    await rellenar(page, 'Comisión inmobiliaria del vendedor (%)', '3');

    const anios = page.locator('input[aria-label="Años de propiedad"]');
    await anios.fill('-3');

    // (a) Con el foco dentro: ni una cifra de plusvalía, y el 0 no se disfraza de exención
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('Sin calcular');
    expect(await valorTarjeta(page, 'Plusvalía municipal')).not.toBe('EXENTO');
    expect(await descripcionTarjeta(page, 'Plusvalía municipal')).toContain(
      'los años de propiedad',
    );
    expect(await valorTarjeta(page, 'Ganancia patrimonial')).toBe('9100,00 €');
    expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('1791,00 €');
    expect(await valorTarjeta(page, 'Total gastos vendedor')).toBe('2691,00 €');
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('27.309,00 €');
    expect(await descripcionTarjeta(page, 'IMPORTE NETO VENDEDOR')).toContain('INCOMPLETO');
    await expect(page.getByText('No definido')).toHaveCount(0);

    // (b) Al salir del campo, el mínimo declarado (1 año) y su coeficiente de 0,13
    await anios.blur();
    await expect(anios).toHaveValue('1');
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('130,00 €');
    expect(await descripcionTarjeta(page, 'Plusvalía municipal')).toBe(
      'Método objetivo (más favorable)',
    );
    expect(await valorTarjeta(page, 'Valor de transmisión')).toBe('28.970,00 €');
    expect(await valorTarjeta(page, 'Ganancia patrimonial')).toBe('8970,00 €');
    expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('1763,70 €');
    expect(await valorTarjeta(page, 'Total gastos vendedor')).toBe('2793,70 €');
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('27.206,30 €');
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// REGRESIÓN — los tres hallazgos de la inspección del 02/09/2026 (575, 576 y 577),
// REPARADOS ese mismo día. Estaban escritos con `test.fail()` afirmando lo que DEBERÍA
// pasar; al repararlos se les quitó la marca y se quedan como regresión.
// ═════════════════════════════════════════════════════════════════════════════

test.describe('Regresión — hallazgos del 02/09/2026, reparados', () => {
  // ❌ ABIERTO (bajo) — operativa. Efecto familia del hallazgo 437, que el 27/08 arregló en la
  // TARJETA de la plusvalía y no en el pie del NETO. El texto del neto elige a qué campo mandar
  // al usuario con un ternario de dos ramas —`plusvaliaCalculada ? 'el precio de compra
  // original' : irpfCalculado ? 'el valor catastral del suelo' : …`— que no contempla la
  // tercera causa posible: que falten los AÑOS DE PROPIEDAD. Con el suelo y el precio de compra
  // ya escritos, el neto manda a rellenar «el valor catastral del suelo», que está relleno, y
  // no nombra el único dato que falta de verdad. Es el mismo defecto que la tarjeta de arriba
  // ya no comete: las dos frases están en la misma pantalla y se contradicen.
  // Caso: venta 30.000 · compra 20.000 · suelo 4.000 · total 12.000 · comisión 3 % · años «-3»
  //       → esperado que el neto nombre «los años de propiedad» · obtenido «INCOMPLETO: falta
  //       descontar la plusvalía municipal. Rellena el valor catastral del suelo para obtener
  //       el neto real.»
  test('el aviso del neto nombra el dato que de verdad falta, igual que la tarjeta de arriba', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await rellenar(page, 'Precio del garaje / plaza de parking', '30000');
    await page.getByRole('tab', { name: /Vendedor/ }).click();
    await rellenar(page, 'Precio de compra original del garaje', '20000');
    await rellenar(page, 'Valor catastral del suelo (€)', '4000');
    await rellenar(page, 'Valor catastral total (suelo + construcción) (€)', '12000');
    await page.locator('input[aria-label="Años de propiedad"]').fill('-3');

    // La tarjeta de la plusvalía sí lo nombra bien (hallazgo 437, reparado)
    expect(await descripcionTarjeta(page, 'Plusvalía municipal')).toContain(
      'los años de propiedad',
    );

    // El pie del neto tiene que decir lo mismo, no mandar a un campo ya relleno
    const neto = await descripcionTarjeta(page, 'IMPORTE NETO VENDEDOR');
    expect(neto).toContain('los años de propiedad');
    expect(neto).not.toContain('Rellena el valor catastral del suelo');
  });

  // ❌ ABIERTO (medio) — contenido. El hallazgo 514 se cerró en el bloque educativo, pero la
  // MISMA promesa sigue viva en el FAQPage del JSON-LD (`metadata.ts`, quinta pregunta), que
  // es la superficie que el CLAUDE.md declara obligatoria justo porque Bing Copilot, ChatGPT,
  // Perplexity y Gemini la usan para fundamentar sus respuestas. Ahí se lee que los tipos
  // reducidos se aplican a un garaje «siempre que el garaje se compre junto con o en el mismo
  // acto que la vivienda, O cuando se cumplan los requisitos del comprador (edad, ingresos,
  // discapacidad)»: esa segunda alternativa es exactamente la que el motor descarta
  // (`elegirTipoITP` recibe `viviendaHabitual: false`) y la que la FAQ visible de la misma
  // página niega —«Un garaje suelto nunca es vivienda habitual, así que ese tipo reducido no
  // aplica aunque el comprador cumpla el resto»—. Un asistente que cite el dato estructurado
  // presupuesta la mitad del ITP: en el ejemplo de Andalucía, 630 € en vez de 1.260 €.
  // Caso: JSON-LD servido en la página → esperado que la respuesta condicione el reducido a la
  //       vivienda habitual · obtenido la disyuntiva «o cuando se cumplan los requisitos del
  //       comprador», sin mencionar la condición que la anula.
  test('el FAQPage del JSON-LD no promete el reducido que el motor descarta', async ({ page }) => {
    await page.goto(RUTA);

    const respuestas: string[] = await page.evaluate(() => {
      const salida: string[] = [];
      for (const s of Array.from(document.querySelectorAll('script[type="application/ld+json"]'))) {
        const datos = JSON.parse(s.textContent || '{}');
        const grafo = datos['@graph'] ?? [datos];
        for (const nodo of grafo) {
          if (nodo['@type'] !== 'FAQPage') continue;
          for (const q of nodo.mainEntity ?? []) {
            if (/reducidos/i.test(q.name)) salida.push(q.acceptedAnswer.text);
          }
        }
      }
      return salida;
    });

    expect(respuestas.length).toBeGreaterThan(0);
    for (const r of respuestas) {
      expect(r).toMatch(/vivienda habitual/i);
      expect(r).not.toMatch(/o cuando se cumplan los requisitos del comprador/i);
    }
  });

  // ❌ ABIERTO (bajo) — accesibilidad. Las pestañas Comprador/Vendedor declaran `role="tablist"`,
  // `role="tab"` y `role="tabpanel"`, pero ninguno de los tres nodos lleva `id`, así que no hay
  // `aria-controls` en las pestañas ni `aria-labelledby` en el panel: con el patrón ARIA a
  // medias, un lector de pantalla anuncia «pestaña» y luego un panel que no sabe de qué pestaña
  // cuelga. En esta app el panel cambia por completo (el presupuesto del comprador o el neto del
  // vendedor), de modo que saber en cuál se está es parte del dato. No lo ve `check:a11y-jsx`,
  // que vigila type=, aria-hidden y aria-pressed, y aquí los tres están bien.
  // Caso: abrir la app → `[role="tab"]` sin `id` ni `aria-controls` y `[role="tabpanel"]` sin
  //       `aria-labelledby` · esperado el par asociado en los dos sentidos.
  test('las pestañas Comprador/Vendedor asocian cada tab con su panel', async ({ page }) => {
    await page.goto(RUTA);

    const comprador = page.getByRole('tab', { name: 'Comprador' });
    await expect(comprador).toHaveAttribute('aria-controls', /.+/);
    await expect(page.locator('[role="tabpanel"]')).toHaveAttribute('aria-labelledby', /.+/);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// 11. INSPECCIÓN 07/09/2026 — tres casos NUEVOS, resueltos a mano ANTES de abrir el
//     navegador. La cola reabrió la app porque el commit 13d2181b (recargo del art. 27.2
//     LGT) volvió a tocar su bloque educativo.
//
//     Los tres recorren zonas que ninguna tanda anterior había pisado:
//       · el perfil FAMILIA NUMEROSA (solo se habían probado «joven» y «general»),
//       · el TOPE DE 20 AÑOS del coeficiente de plusvalía y el TERCER tramo del ahorro
//         (23 %), al que ningún caso del fichero llegaba,
//       · la gestoría del COMPRADOR en negativo (solo se habían probado las del vendedor).
//
//     De dónde sale cada cifra: las mismas fuentes que cita la cabecera del fichero.
// ═════════════════════════════════════════════════════════════════════════════

test.describe('INSPECCIÓN 07/09/2026 — los tres casos, resueltos a mano antes de ejecutar', () => {
  /**
   * CASO D (NORMAL) — Galicia, segunda mano, 60.000 €, perfil FAMILIA NUMEROSA.
   *
   * Por qué este: Galicia declara un reducido del 3 % para familia numerosa
   * (`ITP_CCAA.galicia.tiposReducidos`) con las condiciones «Familia numerosa · Vivienda
   * habitual · Valor ≤ 150.000 €». Un garaje suelto NUNCA es vivienda habitual, así que
   * `elegirTipoITP` lo recibe con `viviendaHabitual: false` y NO puede aplicarlo: tiene que
   * liquidar el tipo general y enseñar el 3 % como oportunidad, no como cifra. El perfil
   * «familia numerosa» no lo había recorrido ninguna tanda anterior.
   *
   * ITP — TIPOS_ITP_CCAA_2025 «Galicia» = 8 %, sin escala progresiva:
   *   60.000 × 8 % =                                                              4.800,00
   *
   * Notaría — ARANCELES_NOTARIO, arancel sin IVA:
   *   90,15 + (30.050,61 − 6.010,12)×0,45 % + (60.000 − 30.050,61)×0,15 %
   *   = 90,15 + 108,182205 + 44,924085 =                                        243,25629
   *   con el 21 % de IVA = 243,25629 × 1,21 =                                 294,3401109
   *   FACTURA_NOTARIAL: ×1,5 = 441,510166 · ×2 = 588,680222 · medio ×1,75 =   515,095194
   *
   * Registro — ARANCELES_REGISTRO + REGISTRO_CONCEPTOS:
   *   24,04 + 24.040,49×0,175 % + 29.949,39×0,125 % =                          103,547595
   *   + presentación 6,010121 + nota simple 3,005061 =                         112,562777
   *   con el 21 % de IVA =                                                     136,200960
   *
   * Total gastos (sumarLineasVisibles, cada línea ya redondeada al céntimo):
   *   4.800,00 + 515,10 + 136,20 + 300,00 =                                     5.751,30
   *   % sobre el precio = 5.751,30 / 60.000 =                                    9,5855 %
   * Coste total = 60.000 + 5.751,30 =                                          65.751,30
   */
  test('CASO D (normal) — Galicia, 60.000 €, perfil Familia numerosa: el 3 % se enseña, no se cobra', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Segunda mano/ }).click();
    await page.selectOption('#select-ccaa', 'galicia');
    await page.selectOption('#select-perfil', 'familia-numerosa');
    await rellenar(page, 'Precio del garaje / plaza de parking', '60000');
    await rellenar(page, 'Gastos de gestoría del comprador (€)', '300');

    // El tipo que se liquida es el general, no el reducido de familia numerosa
    expect(await tituloTarjeta(page, 'ITP')).toBe('ITP (8,00%)');
    expect(await valorTarjeta(page, 'ITP')).toBe('4800,00 €');
    await expect(page.locator('h3', { hasText: 'AJD' })).toHaveCount(0);

    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('515,10 €');
    const notaria = await descripcionTarjeta(page, 'Gastos de notaría');
    expect(notaria).toContain('441,51 €');
    expect(notaria).toContain('588,68 €');

    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('136,20 €');
    expect(await valorTarjeta(page, 'Gastos de gestoría')).toBe('300,00 €');

    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('5751,30 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toBe(
      '9,59% sobre el precio',
    );
    expect(await tituloTarjeta(page, 'COSTE TOTAL')).toBe('COSTE TOTAL DE ADQUISICIÓN');
    expect(await valorTarjeta(page, 'COSTE TOTAL')).toBe('65.751,30 €');

    // El reducido del 3 % existe y se muestra como oportunidad, con sus condiciones
    const aviso = page.getByText('Podrías pagar menos');
    await expect(aviso).toBeVisible();
    const bloque = page.locator('[role="note"]', { hasText: 'Podrías pagar menos' });
    await expect(bloque).toContainText('3,00% — Familia numerosa');
    await expect(bloque).toContainText('Vivienda habitual');
    await expect(bloque).toContainText('El cálculo usa el tipo general (8,00%)');
  });

  /**
   * CASO E (LÍMITE) — vendedor con 35 AÑOS de propiedad y una ganancia que cruza el TERCER
   * tramo de la base del ahorro.
   *
   * Dos límites que ninguna tanda anterior había tocado:
   *   (a) `calcularPlusvaliaMunicipal` topa la tenencia en 20 años
   *       (`Math.min(Math.max(aniosPropiedad, 1), 20)`), porque COEFICIENTES_IIVTNU_2025 no
   *       llega más allá: su última fila es «20 o más años → 0,45». Con 35 años el
   *       coeficiente tiene que ser exactamente el mismo que con 20; si el motor buscara el
   *       año 35 en la tabla, el `?? 0.45` de reserva daría por casualidad lo mismo, así que
   *       la prueba se hace por PARTIDA DOBLE: 35 y 20 deben dar el MISMO importe.
   *   (b) TRAMOS_GANANCIAS_PATRIMONIALES_2025 tiene cinco tramos y el caso más alto del
   *       fichero se quedaba en el segundo (21 %). Aquí la ganancia entra en el tercero.
   *
   * Entrada: venta 300.000 · compra 100.000 · gastos de aquella compra 0 · años 35 ·
   *          suelo catastral 40.000 · valor catastral total EN BLANCO · comisión 0 % ·
   *          gestoría del vendedor 0.
   *
   * Plusvalía municipal (método objetivo, art. 107.4 TRLHL):
   *   coeficiente de 20 o más años =                                                  0,45
   *   base = 40.000 × 0,45 =                                                      18.000,00
   *   cuota = 18.000 × 25 % (PLUSVALIA_MUNICIPAL_META.tipoOrientativo) =            4.500,00
   *   Sin valor catastral total NO hay método real: `metodoRealDisponible` es false y el
   *   recomendado se queda en el objetivo.
   *
   * Ganancia patrimonial (art. 35 LIRPF, motor `calcularGananciaInmueble`):
   *   valor de adquisición = 100.000 + 0 =                                        100.000,00
   *   valor de transmisión = 300.000 − 0 de gastos − 4.500 de plusvalía =         295.500,00
   *   ganancia =                                                                  195.500,00
   *
   * IRPF de la base del ahorro:
   *     6.000 × 19 % =                                                              1.140,00
   *    44.000 × 21 % =                                                              9.240,00
   *   145.500 × 23 % =                                                             33.465,00
   *                                                                                43.845,00
   *
   * Total gastos vendedor = 4.500 + 43.845 =                                       48.345,00
   * Neto = 300.000 − 48.345 =                                                     251.655,00
   */
  test('CASO E (límite) — 35 años topan en el coeficiente de 20, y la ganancia entra en el tramo del 23 %', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await rellenar(page, 'Precio del garaje / plaza de parking', '300000');
    await page.getByRole('tab', { name: /Vendedor/ }).click();
    await rellenar(page, 'Precio de compra original del garaje', '100000');
    await rellenar(page, 'Impuestos y gastos que pagaste al comprarlo (€)', '0');
    await rellenar(page, 'Años de propiedad', '35');
    await rellenar(page, 'Valor catastral del suelo (€)', '40000');
    await rellenar(page, 'Comisión inmobiliaria del vendedor (%)', '0');
    await rellenar(page, 'Gestoría y certificados del vendedor (€)', '0');

    // (a) El tope de 20 años: con 35 se aplica el coeficiente de 0,45, no el de un año 35
    //     que no existe en la tabla
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('4500,00 €');
    expect(await descripcionTarjeta(page, 'Plusvalía municipal')).toBe(
      'Método objetivo (falta el valor catastral total para comparar)',
    );

    // (b) El tercer tramo de la base del ahorro
    expect(await valorTarjeta(page, 'Valor de adquisición')).toBe('100.000,00 €');
    expect(await valorTarjeta(page, 'Valor de transmisión')).toBe('295.500,00 €');
    expect(await valorTarjeta(page, 'Ganancia patrimonial')).toBe('195.500,00 €');
    expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('43.845,00 €');
    expect(await descripcionTarjeta(page, 'IRPF sobre ganancia')).toBe(
      'Tributación en base del ahorro (19%-30%)',
    );

    // Sin comisión ni gestoría no se pinta su línea, y el total cuadra con lo que se ve
    await expect(page.locator('h3', { hasText: 'Comisión inmobiliaria' })).toHaveCount(0);
    await expect(
      page.locator('h3', { hasText: 'Gestoría y certificados del vendedor' }),
    ).toHaveCount(0);
    expect(await valorTarjeta(page, 'Total gastos vendedor')).toBe('48.345,00 €');
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('251.655,00 €');
    expect(await descripcionTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe(
      'Lo que realmente recibes tras gastos e impuestos',
    );
    await expect(page.getByText('No definido')).toHaveCount(0);

    // Partida doble del tope: 20 años tiene que dar EXACTAMENTE lo mismo que 35
    await rellenar(page, 'Años de propiedad', '20');
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('4500,00 €');
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('251.655,00 €');

    // Y 19 años (coeficiente 0,36) tiene que dar OTRO importe: la prueba de que el tope no
    // está aplanando toda la tabla. 40.000 × 0,36 × 25 % = 3.600,00
    await rellenar(page, 'Años de propiedad', '19');
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('3600,00 €');
  });

  /**
   * CASO F (DEBE RECHAZARSE) — la gestoría del COMPRADOR en negativo.
   *
   * Las dos gestorías del VENDEDOR ya tienen testigo (28/08), pero la del comprador no: es
   * el campo que viene relleno por defecto con 300 € y el único que el usuario suele tocar.
   * Un importe negativo NO puede restar del presupuesto: su tarjeta no se pinta (la guarda
   * es `> 0`), así que un total rebajado por una línea invisible sería justo el defecto que
   * el hallazgo 474 describe en la otra pestaña.
   *
   * Se ejecuta en el PAÍS VASCO, que es el tipo más bajo del catálogo (4 %, el `min` de
   * RANGO_ITP) y no cobra AJD (`ajd: 0`, régimen foral), de modo que el caso vale además
   * como testigo del extremo bajo de la escala.
   *
   * ITP — TIPOS_ITP_CCAA_2025 «País Vasco» = 4 %, sin escala:
   *   22.000 × 4 % =                                                                880,00
   *
   * Notaría — ARANCELES_NOTARIO:
   *   90,15 + (22.000 − 6.010,12)×0,45 % = 90,15 + 71,95446 =                    162,10446
   *   con el 21 % de IVA =                                                     196,1463966
   *   ×1,5 = 294,219595 · ×2 = 392,292793 · medio ×1,75 =                       343,256194
   *
   * Registro — ARANCELES_REGISTRO + REGISTRO_CONCEPTOS:
   *   24,04 + 15.989,88×0,175 % = 24,04 + 27,98229 =                              52,02229
   *   + 6,010121 + 3,005061 =                                                     61,037472
   *   con el 21 % de IVA =                                                        73,855341
   *
   * Total gastos = 880,00 + 343,26 + 73,86 + 0 (gestoría acotada) =              1.297,12
   *   % sobre el precio = 1.297,12 / 22.000 =                                      5,896 %
   * Coste total = 22.000 + 1.297,12 =                                            23.297,12
   */
  test('CASO F (debe rechazarse) — la gestoría negativa del comprador no rebaja el presupuesto', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Segunda mano/ }).click();
    await page.selectOption('#select-ccaa', 'pais-vasco');
    await page.selectOption('#select-perfil', 'general');
    await rellenar(page, 'Precio del garaje / plaza de parking', '22000');

    const gestoria = page.locator('input[aria-label="Gastos de gestoría del comprador (€)"]');
    await gestoria.fill('-500');

    // (a) Con el foco DENTRO del campo: ni línea de gestoría, ni total rebajado
    await expect(page.locator('h3', { hasText: 'Gastos de gestoría' })).toHaveCount(0);
    expect(await tituloTarjeta(page, 'ITP')).toBe('ITP (4,00%)');
    expect(await valorTarjeta(page, 'ITP')).toBe('880,00 €');
    await expect(page.locator('h3', { hasText: 'AJD' })).toHaveCount(0);
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('343,26 €');
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('73,86 €');
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('1297,12 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toBe(
      '5,90% sobre el precio',
    );
    expect(await valorTarjeta(page, 'COSTE TOTAL')).toBe('23.297,12 €');
    await expect(page.getByText('No definido')).toHaveCount(0);

    // (b) Al salir del campo, el mínimo declarado (0) queda escrito y el total no cambia
    await gestoria.blur();
    await expect(gestoria).toHaveValue('0');
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('1297,12 €');
    expect(await valorTarjeta(page, 'COSTE TOTAL')).toBe('23.297,12 €');

    // El País Vasco tiene un reducido que NO exige vivienda habitual (zonas despobladas de
    // Álava, 1,5 %): se enseña como oportunidad, y sigue sin aplicarse al importe
    const bloque = page.locator('[role="note"]', { hasText: 'Podrías pagar menos' });
    await expect(bloque).toContainText('1,50% — Zonas despobladas (Álava)');
    expect(await valorTarjeta(page, 'ITP')).toBe('880,00 €');
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// 12. REGRESIÓN — los tres hallazgos de la inspección del 07/09/2026 (624, 625 y 626),
//     REPARADOS el 09/09/2026. Los dos primeros estaban escritos con `test.fail()`
//     afirmando lo que DEBERÍA pasar; al repararlos se les quitó la marca y se quedan como
//     regresión, igual que los de las tandas anteriores. El 625 no tenía testigo y se le ha
//     escrito uno, que es el que ancla la derivación desde `ITP_CCAA`.
// ═════════════════════════════════════════════════════════════════════════════

test.describe('Regresión — hallazgos del 07/09/2026, reparados', () => {
  // ✅ REPARADO 09/09/2026 (624, medio) — contenido. Es el hallazgo 578 (JSON-LD, reparado el 02/09) visto
  // desde el otro lado: aquella tanda corrigió la QUINTA pregunta del FAQPage y, de paso,
  // reescribió la SEGUNDA en `metadata.ts` («los tipos reducidos […] casi siempre exigen que
  // el inmueble sea la vivienda habitual, condición que un garaje suelto no cumple»), pero la
  // misma pregunta de la FAQ VISIBLE, en `page.tsx`, se quedó con la redacción vieja: «El
  // garaje se considera inmueble residencial y puede beneficiarse de tipos reducidos para
  // jóvenes, familias numerosas o personas con discapacidad si los cumple».
  //
  // Resultado: la página se contradice tres veces a sí misma. La FAQ visible nº 2 promete el
  // reducido; la FAQ visible nº 5, dos párrafos más abajo, lo niega («Un garaje suelto nunca
  // es vivienda habitual, así que ese tipo reducido no aplica»); y el motor lo descarta
  // (`elegirTipoITP` recibe `viviendaHabitual: false`). El propio bloque educativo publica el
  // caso de Carlos, que lo dice bien: en Andalucía se liquidan 1.260,00 € y no 630,00 €.
  //
  // Caso: abrir la guía educativa → FAQ «¿Qué ITP paga un garaje de segunda mano?» ·
  //       esperado que condicione el reducido a la vivienda habitual, como ya hace el
  //       JSON-LD de la misma página · obtenido «y puede beneficiarse de tipos reducidos
  //       para jóvenes, familias numerosas o personas con discapacidad si los cumple».
  //
  // REPARACIÓN: la respuesta ya no se escribe dos veces. Vive en una sola constante,
  // `RESPUESTA_ITP_GARAJE_SEGUNDA_MANO` de `metadata.ts`, que alimenta a la vez el FAQPage
  // del JSON-LD y el `<p>` de la FAQ visible, de modo que no pueden volver a divergir.
  test('624 — la FAQ visible dice del reducido lo mismo que el JSON-LD y que el motor', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await page
      .getByRole('button', { name: /Ver guía educativa|Todo lo que necesitas saber/i })
      .click();

    const visible = await texto(page, /El garaje se considera inmueble residencial/);
    expect(visible).toMatch(/vivienda habitual/i);
    expect(visible).not.toMatch(/y puede beneficiarse de tipos reducidos/i);

    // Y lo que se ve es LITERALMENTE la misma cadena que publica el FAQPage, no una parecida:
    // es lo que la reparación garantiza al componer las dos desde una sola constante, y lo
    // único que impide que dentro de tres meses vuelvan a divergir sin que nadie lo note.
    // Hay DOS bloques: `jsonLd` (un `@graph` con WebApplication + FAQPage) y `faqJsonLd`
    // (un FAQPage suelto). La pregunta aparece en los dos, y las dos copias tienen que
    // coincidir con lo que se lee en pantalla.
    interface Pregunta {
      name?: string;
      acceptedAnswer?: { text?: string };
    }
    interface Nodo {
      '@graph'?: Nodo[];
      mainEntity?: Pregunta[];
    }
    const bloques = await page.locator('script[type="application/ld+json"]').allTextContents();
    const respuestas: string[] = [];
    for (const bloque of bloques) {
      const raiz = JSON.parse(bloque) as Nodo;
      const nodos = [raiz, ...(Array.isArray(raiz['@graph']) ? raiz['@graph'] : [])];
      for (const nodo of nodos) {
        for (const pregunta of Array.isArray(nodo.mainEntity) ? nodo.mainEntity : []) {
          if (pregunta.name === '¿Qué ITP paga un garaje de segunda mano?') {
            respuestas.push((pregunta.acceptedAnswer?.text ?? '').replace(/\s+/g, ' ').trim());
          }
        }
      }
    }
    expect(respuestas.length).toBe(2);
    for (const respuesta of respuestas) {
      expect(visible).toBe(respuesta);
    }
  });

  // ✅ REPARADO 09/09/2026 (625, bajo) — dato. Los dos ejemplos del bloque educativo eran la
  // única cifra normativa de la página escrita a mano: «el ITP general de Madrid (6%)» y, en
  // el caso de Carlos, «el tipo reducido para jóvenes (3,5%)» frente al «tipo general
  // (7,00%)». Todo lo demás de la página se compone desde constantes (IVA_INMUEBLES_2025,
  // RANGO_ITP, RANGO_AJD, PLUSVALIA_MUNICIPAL_META, TRAMOS_GANANCIAS_PATRIMONIALES_2025,
  // ESCALA_RECARGO_EXTEMPORANEO). Coincidían con la ficha, así que no había diferencia en
  // pantalla; pero en 2026 se movieron Murcia (8 → 7,75 %) y Valencia (10 → 9 %) sin que
  // nadie avisara a los textos, y esa es exactamente la forma de fallo.
  //
  // REPARACIÓN: los tres tipos salen de `ITP_CCAA` (que los lee de `TIPOS_ITP_CCAA_2025`) a
  // través de `ITP_GENERAL_MADRID`, `ITP_GENERAL_ANDALUCIA` e `ITP_REDUCIDO_JOVENES_ANDALUCIA`.
  //
  // Este test es el ancla: los valores esperados NO se teclean aquí, se leen de la misma
  // ficha, así que si mañana una comunidad mueve su tipo y el texto se quedara atrás, falla.
  // Los IMPORTES en euros de esos párrafos siguen siendo literales tomados de la app con esa
  // entrada exacta —los fija la regresión del 20/08 (líneas 147-151)—, de modo que un cambio
  // de tipo obliga además a rehacerlos a mano; el comentario de `page.tsx` lo advierte.
  test('625 — los tipos de ITP de los ejemplos salen de ITP_CCAA, no de un literal', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await page
      .getByRole('button', { name: /Ver guía educativa|Todo lo que necesitas saber/i })
      .click();

    // Ejemplo de Luis — tipo general de Madrid (TIPOS_ITP_CCAA_2025 → 6 %)
    const luis = (
      await page.getByText(/Luis compra una plaza de parking en Madrid/).innerText()
    ).replace(/\s+/g, ' ');
    expect(luis).toContain(`Madrid (${formatTipoNominal(ITP_CCAA.madrid.tipoGeneral)}%)`);

    // Ejemplo de Carlos — reducido para jóvenes (3,5 %) frente al general (7 %) de Andalucía.
    // El reducido se busca por nombre en la ficha, igual que hace la página.
    const reducidoJoven = ITP_CCAA.andalucia.tiposReducidos.find((r) => /j[óo]ven/i.test(r.nombre));
    if (!reducidoJoven) {
      throw new Error(
        'La ficha de Andalucía ya no trae un tipo reducido para jóvenes: el ejemplo de Carlos hay que rehacerlo.',
      );
    }
    const carlos = (await page.getByText(/Carlos, 28 años/).innerText()).replace(/\s+/g, ' ');
    expect(carlos).toContain(`para jóvenes (${formatTipoNominal(reducidoJoven.tipo)}%)`);
    // El tipo general va con dos decimales fijos porque es lo que rotula la tarjeta de ITP
    expect(carlos).toContain(`el tipo general (${formatNumber(ITP_CCAA.andalucia.tipoGeneral, 2)}%`);
  });

  // ✅ REPARADO 09/09/2026 (626, bajo) — accesibilidad. Las cinco preguntas de la FAQ visible y el rótulo
  // «Tipos reducidos en …» del panel de datos usaban `<h4>` colgando directamente de un `<h2>`:
  // el nivel h3 no existe en medio, así que el esquema del documento salta un escalón y un
  // lector de pantalla que navegue por encabezados (la forma normal de leer una página larga)
  // no puede situar las preguntas dentro de su sección. No lo ve `check:a11y-jsx`, que vigila
  // `type=`, `aria-hidden` y `aria-pressed`, y aquí los tres están bien.
  //
  // La inversión h3 → h2 del bloque educativo NO entra aquí: la cabecera de
  // `<EducationalSection>` es un `<h3>` del componente compartido y sus hijos son `<h2>` por
  // diseño de `templates/app-base/page.template.tsx`, de modo que es del catálogo entero y no
  // de esta app. Lo que sí era suyo son esos `<h4>`.
  //
  // Caso: abrir la guía educativa → los encabezados de «Preguntas frecuentes sobre compraventa
  //       de garaje» (h2) · esperado h3 · obtenido h4, cinco veces.
  //
  // REPARACIÓN: los seis `<h4>` de la app subieron a `<h3>` (las cinco preguntas y el rótulo
  // «Tipos reducidos en …»), y con ellos los dos selectores del módulo CSS que colgaban de la
  // etiqueta (`.faqItem h4` y `.tiposReducidosInfo h4`). Efecto colateral que hubo que
  // atender: `EducationalSection` monta su contenido SIEMPRE en el DOM —lo oculta por CSS,
  // para que Googlebot lo lea—, así que el `page.locator('h3', { hasText: 'ITP' })` del CASO 7
  // pasó a contar también dos preguntas; se ancló con `/^ITP/`.
  test('626 — las preguntas de la FAQ ya cuelgan de un h3, sin saltar un nivel', async ({ page }) => {
    await page.goto(RUTA);
    await page
      .getByRole('button', { name: /Ver guía educativa|Todo lo que necesitas saber/i })
      .click();

    const niveles: string[] = await page.evaluate(() => {
      const secciones = Array.from(document.querySelectorAll('section'));
      const faq = secciones.find((s) =>
        /Preguntas frecuentes/.test(s.querySelector('h2')?.textContent ?? ''),
      );
      if (!faq) return [];
      return Array.from(faq.querySelectorAll('h3, h4, h5, h6')).map((h) => h.tagName);
    });

    expect(niveles.length).toBe(5);
    expect(Array.from(new Set(niveles))).toEqual(['H3']);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// 13. INSPECCIÓN 10/09/2026 — RE-INSPECCIÓN
//
// La cola reabrió la app tras el refactor de motores (commit 1808419c, 10/09/2026). De todo
// lo que esta página importa, ese commit solo tocó `lib/calculadoras/recargoPresentacionTardia.ts`
// y solo su COMENTARIO de cabecera («Usada por: …»): ninguna constante ni fórmula cambió, y
// los 52 tests anteriores siguen los 52 en verde.
//
// Tres casos nuevos, resueltos a mano ANTES de abrir el navegador, en zonas vírgenes:
//   · CASO G (normal)   — perfil DISCAPACIDAD, el único de los cuatro sin testigo, sobre
//                         Extremadura (escala progresiva 8/10/11 %, tampoco probada nunca).
//   · CASO H (límite)   — la REVENTA ANTES DEL AÑO: 0 años de propiedad, el coeficiente 0,14
//                         que el hallazgo 666 añadió a COEFICIENTES_IIVTNU_2025 el 07/09/2026
//                         y que es el TERCERO MÁS ALTO de la tabla.
//   · CASO I (rechazo)  — gastos de adquisición NEGATIVOS con el foco dentro del campo: no
//                         pueden rebajar el valor de adquisición ni, por tanto, subir el IRPF.
//
// De dónde sale cada cifra (ninguna de memoria):
//   · Tipo general y escala de Extremadura → `ITP_CCAA.extremadura` en `data/itp-ccaa.ts`
//     (tipoGeneral leído de TIPOS_ITP_CCAA_2025 → { ccaa: 'Extremadura', tipo: 8 };
//      tramos 8 % hasta 360.000, 10 % hasta 600.000, 11 % en adelante).
//   · Tipo reducido por discapacidad de Extremadura → misma ficha, «Discapacidad (bonif. 20%)»
//     al 6,4 %, con la condición «Vivienda habitual» que un garaje suelto no cumple.
//   · Coeficientes de plusvalía → `COEFICIENTES_IIVTNU_2025` en `data/fiscal/inmuebles.ts`
//     (0 años → 0,14 · 1 año → 0,13) y `PLUSVALIA_MUNICIPAL_META.tipoOrientativo` = 25 %.
//   · Escala del ahorro → `TRAMOS_GANANCIAS_PATRIMONIALES_2025` (19 % hasta 6.000, 21 % hasta
//     50.000) y la fórmula del art. 35 LIRPF en `data/fiscal/ganancia-inmueble.ts`.
//   · Aranceles → `ARANCELES_NOTARIO` + `FACTURA_NOTARIAL` (×1,5 a ×2, punto medio ×1,75) y
//     `ARANCELES_REGISTRO` + `REGISTRO_CONCEPTOS`, ambos con el 21 % de IVA dentro.
// ═════════════════════════════════════════════════════════════════════════════

test.describe('INSPECCIÓN 10/09/2026 — los tres casos, resueltos a mano antes de ejecutar', () => {
  /**
   * CASO G (NORMAL) — Extremadura · segunda mano · 45.000 € · perfil DISCAPACIDAD.
   *
   * ITP — `elegirTipoITP('extremadura', 'discapacidad', 45000, { viviendaHabitual: false })`:
   *   el único candidato por nombre es «Discapacidad (bonif. 20%)» (6,4 %), y su condición
   *   «Vivienda habitual» NO se cumple en un garaje suelto → cae en `noComprobables`.
   *   Se liquida el tipo general por la escala progresiva de la comunidad:
   *     tramo 1 (hasta 360.000, 8 %) = 45.000 × 8 % =                            3.600,000000
   *   tipo EFECTIVO mostrado = 3.600 / 45.000 =                                       8,00 %
   *
   * Notaría — `calcularArancelNotarial(45000)` (RD 1426/1989, número 2):
   *     90,15 + (30.050,61 − 6.010,12) × 0,45 % + (45.000 − 30.050,61) × 0,15 % = 220,756290
   *     × 1,21 (IVA) =                                                              267,115111
   *   `estimarFacturaNotarial`: min ×1,5 = 400,672666 · max ×2 = 534,230222
   *                             medio ×1,75 =                                       467,451444
   *
   * Registro — `calcularRegistro(45000)` (RD 1427/1989, número 2 + REGISTRO_CONCEPTOS):
   *     24,04 + (30.050,61 − 6.010,12) × 0,175 % + (45.000 − 30.050,61) × 0,125 % = 84,797595
   *     + 6,010121 (presentación) + 3,005061 (nota simple) = 93,812777
   *     × 1,21 (IVA) =                                                              113,513450
   *
   * Total gastos — `sumarLineasVisibles` redondea cada línea ANTES de sumar:
   *     3.600,00 + 0 (sin AJD en segunda mano) + 467,45 + 113,51 + 300,00 =        4.480,96
   *     % sobre el precio = 4.480,96 / 45.000 =                                        9,96 %
   * Coste total = 45.000 + 4.480,96 =                                            49.480,96
   */
  test('CASO G (normal) — Extremadura, 45.000 €, perfil Discapacidad: el 6,4 % se enseña, no se cobra', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Segunda mano/ }).click();
    await page.selectOption('#select-ccaa', 'extremadura');
    await rellenar(page, 'Precio del garaje / plaza de parking', '45000');
    await page.selectOption('#select-perfil', 'discapacidad');
    await rellenar(page, 'Gastos de gestoría del comprador (€)', '300');

    expect(await valorTarjeta(page, 'Precio del garaje')).toBe('45.000,00 €');
    // El rótulo lleva el tipo EFECTIVO, que aquí coincide con el nominal porque 45.000 €
    // no salen del primer tramo de la escala.
    expect(await tituloTarjeta(page, 'ITP (')).toBe('ITP (8,00%)');
    expect(await valorTarjeta(page, 'ITP (')).toBe('3600,00 €');

    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('467,45 €');
    expect(await descripcionTarjeta(page, 'Gastos de notaría')).toContain(
      'Factura estimada entre 400,67 € y 534,23 €',
    );
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('113,51 €');
    expect(await valorTarjeta(page, 'Gastos de gestoría')).toBe('300,00 €');

    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('4480,96 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toBe(
      '9,96% sobre el precio',
    );
    expect(await valorTarjeta(page, 'COSTE TOTAL')).toBe('49.480,96 €');

    // El reducido del 6,4 % se ENSEÑA como oportunidad y no se cobra: presupuestar de menos
    // es el error caro, y su condición «Vivienda habitual» no la cumple un garaje suelto.
    const aviso = page.locator('[role="note"]').filter({ hasText: 'Podrías pagar menos' });
    await expect(aviso).toHaveCount(1);
    const textoAviso = (await aviso.innerText()).replace(/\s+/g, ' ').trim();
    expect(textoAviso).toContain('El cálculo usa el tipo general (8,00%)');
    expect(textoAviso).toContain('En Extremadura existe');
    expect(textoAviso).toContain('6,40% — Discapacidad (bonif. 20%)');
    expect(textoAviso).toContain('Persona con discapacidad · Vivienda habitual');
  });

  /**
   * CASO H (LÍMITE) — la REVENTA ANTES DEL AÑO.
   *
   * ❌ ABIERTO 10/09/2026 (cálculo, medio) — el `test.fail()` afirma lo que DEBERÍA pasar.
   *
   * Desde el RDL 26/2021 la transmisión anterior al año SÍ tributa, y por eso
   * `COEFICIENTES_IIVTNU_2025` tiene fila propia para «Menos de 1 año» con el coeficiente
   * 0,14 —el tercero más alto de la tabla—, añadida el 07/09/2026 al reparar el hallazgo 666.
   * Esta app no puede llegar a él: `min={1}` en el campo y `parseInt(aniosPropiedad) || 0`
   * en el motor, que además usa el 0 como marca de «campo vacío».
   *
   * Entrada: Madrid · venta 30.000 € · compra 26.000 € · suelo catastral 5.000 € ·
   *          0 años de propiedad · comisión 0 % · sin valor catastral total.
   *
   * ESPERADO (COEFICIENTES_IIVTNU_2025 → { anios: 0, coeficiente: 0.14 }):
   *   plusvalía objetivo   = 5.000 × 0,14 × 25 % =                                175,00
   *   valor de transmisión = 30.000 − 0 − 175 =                                29.825,00
   *   ganancia             = 29.825 − 26.000 =                                  3.825,00
   *   IRPF                 = 3.825 × 19 % =                                       726,75
   *   neto                 = 30.000 − (175 + 726,75) =                        29.098,25
   *
   * OBTENIDO hoy: con el foco dentro, «Sin calcular — No calculada (falta los años de
   *   propiedad)» pese a que el campo lleva un 0; al salir, el campo se fuerza a «1» y la
   *   plusvalía sale con el coeficiente del año 1 (0,13):
   *   162,50 € de plusvalía, 3.837,50 € de ganancia, 729,13 € de IRPF y 29.108,37 € de neto.
   *   Se liquida DE MENOS, que es el error caro. La app hermana
   *   `simulador-gastos-compraventa-local-comercial` ya está reparada (min={0} y el campo
   *   vacío distinguido del 0); esta se quedó atrás.
   */
  test('CASO H (límite) — 0 años de propiedad: la reventa antes del año usa el coeficiente 0,14', async ({
    page,
  }) => {
    test.fail();
    await page.goto(RUTA);
    await page.selectOption('#select-ccaa', 'madrid');
    await rellenar(page, 'Precio del garaje / plaza de parking', '30000');
    await page.getByRole('tab', { name: /Vendedor/ }).click();
    await rellenar(page, 'Precio de compra original del garaje', '26000');
    await rellenar(page, 'Comisión inmobiliaria del vendedor (%)', '0');
    await rellenar(page, 'Valor catastral del suelo (€)', '5000');
    await rellenar(page, 'Años de propiedad', '0');

    // El 0 es un dato del usuario («lo revendí antes del año»), no un campo vacío.
    expect(await page.locator('input[aria-label="Años de propiedad"]').inputValue()).toBe('0');
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('175,00 €');
    expect(await valorTarjeta(page, 'Ganancia patrimonial')).toBe('3825,00 €');
    expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('726,75 €');
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('29.098,25 €');
  });

  /**
   * CASO I (DEBE RECHAZARSE) — gastos de adquisición NEGATIVOS, con el foco dentro.
   *
   * El art. 35.1 LIRPF suma al valor de adquisición «los gastos y tributos inherentes a la
   * adquisición SATISFECHOS por el adquirente»: un importe negativo no existe, y si se
   * restara bajaría el valor de adquisición y SUBIRÍA el impuesto. El campo tiene `min={0}`,
   * pero eso solo actúa al salir; mientras se teclea, quien tiene que rechazarlo es el motor
   * (`positivo()` en `calcularGananciaInmueble`).
   *
   * Entrada: Madrid · venta 30.000 € · compra 20.000 € · gastos de adquisición «-3000»
   *          (sin salir del campo) · comisión 0 % · sin datos de plusvalía.
   *
   * ESPERADO — el negativo se ignora:
   *   valor de adquisición = 20.000 + 0 =                                      20.000,00
   *   valor de transmisión = 30.000 − 0 − 0 =                                  30.000,00
   *   ganancia             =                                                   10.000,00
   *   IRPF = 6.000 × 19 % + 4.000 × 21 % = 1.140 + 840 =                        1.980,00
   *   neto = 30.000 − 1.980 =                                                  28.020,00
   *   (si el −3.000 se hubiera restado: adquisición 17.000 → ganancia 13.000 →
   *    IRPF 2.610,00 €, o sea 630,00 € de impuesto inventado)
   */
  test('CASO I (debe rechazarse) — unos gastos de adquisición negativos no inflan el IRPF', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await page.selectOption('#select-ccaa', 'madrid');
    await rellenar(page, 'Precio del garaje / plaza de parking', '30000');
    await page.getByRole('tab', { name: /Vendedor/ }).click();
    await rellenar(page, 'Precio de compra original del garaje', '20000');
    await rellenar(page, 'Comisión inmobiliaria del vendedor (%)', '0');

    const campo = page.locator(
      'input[aria-label="Impuestos y gastos que pagaste al comprarlo (€)"]',
    );
    await campo.fill('-3000'); // a propósito SIN blur: así lo ve quien está tecleando

    expect(await valorTarjeta(page, 'Valor de adquisición')).toBe('20.000,00 €');
    expect(await valorTarjeta(page, 'Valor de transmisión')).toBe('30.000,00 €');
    expect(await valorTarjeta(page, 'Ganancia patrimonial')).toBe('10.000,00 €');
    expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('1980,00 €');
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('28.020,00 €');
    // Y el neto se declara incompleto, porque la plusvalía municipal sigue sin datos.
    expect(await descripcionTarjeta(page, 'IMPORTE NETO VENDEDOR')).toContain('INCOMPLETO');

    // Al salir del campo, el valor se normaliza a 0 y nada cambia.
    await campo.blur();
    expect(await campo.inputValue()).toBe('0');
    expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('1980,00 €');
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// HALLAZGOS ABIERTOS 10/09/2026 — con `test.fail()`: afirman lo que DEBERÍA pasar, así que
// hoy fallan a propósito. Al repararlos se les quita la marca y quedan como regresión.
//
// Los tres son RESIDUOS DE REPARACIÓN: una corrección que llegó al motor (o a la app
// hermana, o a la FAQ visible) y no al texto que la acompaña.
// ═════════════════════════════════════════════════════════════════════════════
test.describe('Hallazgos abiertos — re-inspección del 10/09/2026', () => {
  /**
   * ❌ ABIERTO (contenido, medio) — el contrafactual del ejemplo de Ana está calculado a un
   * 19 % PLANO, que es justo el error contra el que avisa la frase.
   *
   * El párrafo dice: «la ganancia queda en 6.340 € y el IRPF en 1.211,40 € (19% hasta 6000 €
   * y 21% sobre el resto), no los 1.330 € que saldrían de los 7.000 € brutos».
   * 1.330 = 7.000 × 19 %. Con la escala que la propia frase acaba de enunciar y que el motor
   * aplica (TRAMOS_GANANCIAS_PATRIMONIALES_2025): 6.000 × 19 % + 1.000 × 21 % = 1.350,00 €.
   * La app lo confirma con la misma entrada y comisión 0 %.
   */
  test('el contrafactual del ejemplo de Ana usa la escala del ahorro, no un 19 % plano', async ({
    page,
  }) => {
    test.fail();
    await page.goto(RUTA);
    await page.selectOption('#select-ccaa', 'madrid');
    await rellenar(page, 'Precio del garaje / plaza de parking', '22000');
    await page.getByRole('tab', { name: /Vendedor/ }).click();
    await rellenar(page, 'Precio de compra original del garaje', '15000');
    await rellenar(page, 'Comisión inmobiliaria del vendedor (%)', '0');

    // Lo que el motor cobra por esos 7.000 € brutos que el ejemplo cita
    expect(await valorTarjeta(page, 'Ganancia patrimonial')).toBe('7000,00 €');
    expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('1350,00 €');

    const ejemplo = (
      await page.locator('p', { hasText: 'Ana compró un garaje' }).first().innerText()
    )
      .replace(/\s+/g, ' ')
      .trim();
    expect(ejemplo).toContain('1.350 €');
    expect(ejemplo).not.toContain('1.330 €');
  });

  /**
   * ❌ ABIERTO (contenido, medio) — la FAQ y la tabla comparativa afirman SIN EXCEPCIÓN que
   * un garaje de obra nueva paga IVA, mientras la calculadora de la misma página dice
   * «IGIC · No calculado» en Canarias.
   *
   * Es el residuo del commit d787b81b (23/08/2026, hallazgos 156 y 475): la reparación entró
   * en el motor y en el aviso condicional, pero no en el bloque educativo ni en el FAQPage
   * del JSON-LD, que es el canal que leen los asistentes de IA. La app hermana
   * `simulador-gastos-compraventa-trastero` sí lo dice en texto visible.
   */
  test('la FAQ del IVA nombra los territorios donde no rige (IGIC/IPSI)', async ({ page }) => {
    test.fail();
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Primera mano/ }).click();
    await page.selectOption('#select-ccaa', 'canarias');
    await rellenar(page, 'Precio del garaje / plaza de parking', '25000');

    // La calculadora ya lo hace bien: nombra el impuesto y no inventa cifra.
    expect(await tituloTarjeta(page, 'IGIC')).toBe('IGIC');
    expect(await valorTarjeta(page, 'IGIC')).toBe('No calculado');

    // Pero el texto de la misma página lo desmiente.
    const faqIva = (
      await page
        .locator('h3', { hasText: 'Garaje nuevo o de segunda mano' })
        .locator('xpath=following-sibling::p[1]')
        .innerText()
    )
      .replace(/\s+/g, ' ')
      .trim();
    expect(faqIva).toMatch(/IGIC|IPSI/);

    const filaTabla = (
      await page.locator('td', { hasText: 'IVA obra nueva' }).locator('xpath=..').innerText()
    )
      .replace(/\s+/g, ' ')
      .trim();
    expect(filaTabla).toMatch(/IGIC|IPSI/);
  });

  /**
   * ❌ ABIERTO (contenido, bajo) — el tipo del 25 % con el que se calcula la plusvalía se
   * publicó en la FAQ VISIBLE (reparación del hallazgo 516, 30/08/2026) y no llegó a
   * ninguno de los dos FAQPage del JSON-LD. Uno de ellos nombra solo el 30 % (el máximo
   * legal), de modo que un asistente de IA responde con el tipo que la app NO aplica.
   *
   * Lo que el motor aplica, comprobado en la propia página:
   *   suelo catastral 5.000 € · 10 años → COEFICIENTES_IIVTNU_2025[10] = 0,08
   *   5.000 × 0,08 × PLUSVALIA_MUNICIPAL_META.tipoOrientativo (25 %) = 100,00 €
   *   (al 30 % habrían salido 120,00 €)
   */
  test('el 25 % con el que se calcula la plusvalía también está en el FAQPage', async ({
    page,
  }) => {
    test.fail();
    await page.goto(RUTA);
    await page.selectOption('#select-ccaa', 'madrid');
    await rellenar(page, 'Precio del garaje / plaza de parking', '30000');
    await page.getByRole('tab', { name: /Vendedor/ }).click();
    await rellenar(page, 'Precio de compra original del garaje', '26000');
    await rellenar(page, 'Años de propiedad', '10');
    await rellenar(page, 'Valor catastral del suelo (€)', '5000');
    await rellenar(page, 'Comisión inmobiliaria del vendedor (%)', '0');
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('100,00 €');

    // La FAQ visible sí lo dice (hallazgo 516, reparado)
    const faqVisible = (
      await page
        .locator('h3', { hasText: 'El vendedor de un garaje paga plusvalía municipal' })
        .locator('xpath=following-sibling::p[1]')
        .innerText()
    )
      .replace(/\s+/g, ' ')
      .trim();
    expect(faqVisible).toContain('25%');

    // Y los dos FAQPage del JSON-LD deberían decir lo mismo
    const bloques = await page.locator('script[type="application/ld+json"]').allTextContents();
    const respuestas: string[] = [];
    for (const bruto of bloques) {
      const json = JSON.parse(bruto);
      const grafo: Record<string, unknown>[] = Array.isArray(json['@graph'])
        ? json['@graph']
        : [json];
      for (const nodo of grafo) {
        if (nodo['@type'] !== 'FAQPage') continue;
        const preguntas = nodo.mainEntity as {
          name: string;
          acceptedAnswer: { text: string };
        }[];
        const q = preguntas.find((p) => /plusval[ií]a municipal/i.test(p.name));
        if (q) respuestas.push(q.acceptedAnswer.text);
      }
    }
    expect(respuestas.length).toBe(2);
    for (const texto of respuestas) expect(texto).toContain('25%');
  });
});
