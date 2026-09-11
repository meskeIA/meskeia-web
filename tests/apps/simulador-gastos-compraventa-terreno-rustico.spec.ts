/**
 * Inspector — simulador-gastos-compraventa-terreno-rustico (segmento FISCAL, riesgo 1 CRÍTICO)
 * Inspección del 26/08/2026. Apps hermanas del clúster de compraventa ya inspeccionadas:
 * garaje, trastero, local comercial, nave industrial y estimador de inmueble.
 *
 * QUÉ PROMETE LA APP
 * ──────────────────
 * H1 «Simulador de Gastos de Compra de Finca Rústica». Subtítulo y metadata prometen tres
 * cosas concretas y comprobables: (1) ITP por comunidad autónoma, (2) notaría y registro,
 * (3) SIN plusvalía municipal, con la excepción de la renuncia a la exención de IVA entre
 * profesionales (IVA 21 % con inversión del sujeto pasivo + AJD).
 *
 * DE DÓNDE SALE CADA CIFRA ESPERADA (ninguna de memoria)
 * ─────────────────────────────────────────────────────
 *  - Tipo general de ITP por CCAA → `TIPOS_ITP_CCAA_2025` en `data/fiscal/inmuebles.ts`,
 *    que `tipoGeneralDe()` de `data/itp-ccaa.ts` lee para rellenar `ITP_CCAA[x].tipoGeneral`
 *    (Madrid = 6 · Cataluña = 10 con escala · País Vasco = 4).
 *  - Ceuta y Melilla NO figuran en `TIPOS_ITP_CCAA_2025` (no son CCAA): su `tipoGeneral: 6`
 *    es una excepción declarada a mano en `data/itp-ccaa.ts`, y sobre esa cuota se aplica la
 *    bonificación del 50 % del art. 57 bis del TRLITPAJD (RDL 1/1993, añadido por la Ley
 *    53/2002), que `aplicarBonificacionCiudad()` incorpora al motor porque se cumple por el
 *    SITIO del inmueble. Verificada contra el BOE el 23/08/2026 según la cabecera del módulo.
 *  - Escalas progresivas y AJD por comunidad → `ITP_CCAA` en `data/itp-ccaa.ts`
 *    (Cataluña 10/11/12/13 % · Madrid `ajd: 0.75` · Ceuta `ajd: 0.5` · País Vasco `ajd: 0`).
 *  - IVA de la renuncia → `IVA_INMUEBLES_2025.local = 21` en `data/fiscal/inmuebles.ts`
 *    (la app lo importa como `IVA_RENUNCIA`). Territorio de aplicación → cabecera de
 *    `data/fiscal/iva.ts` y `TERRITORIOS_SIN_IVA` de `data/itp-ccaa.ts`: Canarias (IGIC),
 *    Ceuta y Melilla (IPSI) quedan fuera del IVA español.
 *  - Arancel notarial → `ARANCELES_NOTARIO` (RD 1426/1989, número 2: matriz + una copia) y
 *    la FACTURA mostrada → `FACTURA_NOTARIAL` (horquilla ×1,5 a ×2 por los números 4, 6 y 7;
 *    la tarjeta enseña el punto medio ×1,75).
 *  - Arancel registral → `ARANCELES_REGISTRO` (RD 1427/1989, número 2) MÁS los fijos de
 *    `REGISTRO_CONCEPTOS`: presentación 6,010121 € y nota simple 3,005061 €.
 *  - El 21 % de IVA sobre honorarios va dentro de `calcularArancelNotarial` y `calcularRegistro`.
 *  - Fecha y fuente que la página declara → `FISCAL_INMUEBLES_META` (verificado 2026-06-17,
 *    vigencia 2026).
 *
 * Los tres casos están resueltos a mano ANTES de ejecutar la app; el desarrollo va comentado
 * junto a cada aserción, con los importes sin redondear.
 *
 * HALLAZGOS ABIERTOS: al final, en su propio describe. Afirman lo que DEBERÍA pasar y hoy
 * fallan a propósito; cuando se reparen, quedan como test de regresión.
 */
import { test, expect, type Page } from '@playwright/test';
import { TRAMOS_GANANCIAS_PATRIMONIALES_2025 } from '../../data/fiscal/inmuebles';

const RUTA = '/simulador-gastos-compraventa-terreno-rustico/';

const PRECIO = 'Precio de compra de la finca rústica';
const GESTORIA = 'Gastos de gestoría (€)';

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

/** Rótulo completo de una ResultCard (lleva dentro el tipo aplicado). */
async function rotuloTarjeta(page: Page, patron: RegExp): Promise<string> {
  return (await page.locator('h3', { hasText: patron }).first().innerText()).replace(/\s+/g, ' ').trim();
}

async function rellenar(page: Page, etiqueta: string, valor: string): Promise<void> {
  const campo = page.locator('input[aria-label="' + etiqueta + '"]');
  await campo.fill(valor);
  await campo.blur();
}

test.describe('Simulador de gastos de compra de finca rústica — inspección 26/08/2026', () => {
  /**
   * CASO 1 (NORMAL) — Madrid, compra habitual (exenta de IVA → ITP), 80.000 €, gestoría 400 €.
   * Es la operación corriente que la app pone de ejemplo en su propio placeholder: un
   * particular compra tierra en la Comunidad de Madrid.
   */
  test('CASO 1 (normal) — Madrid, compra habitual, 80.000 €', async ({ page }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Compra habitual/ }).click();
    await page.selectOption('#select-ccaa', 'madrid');
    await rellenar(page, PRECIO, '80000');
    await rellenar(page, GESTORIA, '400');

    // ITP = 80.000 × 6 % = 4.800. El 6 % sale de TIPOS_ITP_CCAA_2025 → { ccaa: 'Madrid', tipo: 6 }.
    // Madrid no tiene escala progresiva, así que el tipo efectivo coincide con el nominal.
    // «4800,00 €» sin punto de millar: es-ES no agrupa los números de cuatro cifras.
    expect(await valorTarjeta(page, 'ITP (')).toBe('4800,00 €');
    expect(await rotuloTarjeta(page, /^ITP \(/)).toBe('ITP (6,00%)');

    // Compra habitual = exenta de IVA → no hay AJD (solo lo hay en la renuncia).
    await expect(page.locator('h3', { hasText: /^AJD/ })).toHaveCount(0);

    // Notaría — RD 1426/1989, número 2 (ARANCELES_NOTARIO):
    //   tramo 1 (hasta 6.010,12 €)                →                             90,15
    //   tramo 2 (6.010,12→30.050,61, 0,45 %)      → 24.040,49 × 0,0045 =    108,182205
    //   tramo 3 (30.050,61→60.101,21, 0,15 %)     → 30.050,60 × 0,0015 =     45,075900
    //   tramo 4 (60.101,21→80.000, 0,10 %)        → 19.898,79 × 0,0010 =     19,898790
    //   arancel sin IVA                           =                        263,306895
    //   con el 21 % de IVA                        = × 1,21 =               318,601343
    // FACTURA_NOTARIAL: ×1,5 = 477,902014 · ×2 = 637,202686 · punto medio = 557,552350
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('557,55 €');
    const notaria = await descripcionTarjeta(page, 'Gastos de notaría');
    expect(notaria).toContain('477,90 €');
    expect(notaria).toContain('637,20 €');

    // Registro — RD 1427/1989, número 2 (ARANCELES_REGISTRO):
    //   tramo 1                                   →                             24,04
    //   tramo 2 (0,175 %)                         → 24.040,49 × 0,00175 =   42,0708575
    //   tramo 3 (0,125 %)                         → 30.050,60 × 0,00125 =     37,56325
    //   tramo 4 (0,075 %)                         → 19.898,79 × 0,00075 =  14,9240925
    //   suma (muy por debajo del tope 2.181,67)   =                          118,5982
    //   + presentación 6,010121 + nota simple 3,005061 =                  127,613382
    //   con el 21 % de IVA                        = × 1,21 =              154,412192
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('154,41 €');

    expect(await valorTarjeta(page, 'Gastos de gestoría')).toBe('400,00 €');

    // Total gastos = 4.800 + 557,552350 + 154,412192 + 400 = 5.911,964542
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('5911,96 €');
    // 5.911,964542 / 80.000 = 7,3899557 % → «7,39%»
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toContain('7,39%');

    // Coste total = 80.000 + 5.911,964542 = 85.911,964542
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('85.911,96 €');

    // La promesa central de la app: en suelo rústico no hay plusvalía municipal.
    await expect(page.locator('body')).toContainText('no paga plusvalía municipal');
    await expect(page.locator('h3', { hasText: /[Pp]lusvalía/ })).toHaveCount(0);
  });

  /**
   * CASO 2 (LÍMITE) — Ceuta, compra habitual, 200.000 €, gestoría 400 €.
   * Territorio con tipo atípico por dos motivos a la vez: su 6 % está escrito a mano en
   * `data/itp-ccaa.ts` (excepción declarada, no figura en TIPOS_ITP_CCAA_2025) y sobre la
   * cuota cae la bonificación del 50 % del art. 57 bis del TRLITPAJD, que el motor aplica
   * solo. Es el caso que en agosto de 2026 estaba mal en las siete apps del clúster
   * (hallazgo 157: se cobraba el doble), así que es el que hay que dejar clavado.
   */
  test('CASO 2 (límite) — Ceuta, compra habitual, 200.000 €: la bonificación del 50 % se aplica', async ({ page }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Compra habitual/ }).click();
    await page.selectOption('#select-ccaa', 'ceuta');
    await rellenar(page, PRECIO, '200000');
    await rellenar(page, GESTORIA, '400');

    // ITP = 200.000 × 6 % = 12.000 · bonificación art. 57 bis = × 0,5 = 6.000
    // (sin bonificar habría salido 12.000: el doble, que es justo el hallazgo 157).
    expect(await valorTarjeta(page, 'ITP (')).toBe('6000,00 €');
    // Tipo EFECTIVO = 6.000 / 200.000 = 3,00 % (el recuadro de la ciudad sigue diciendo
    // «ITP General 6%», que es el nominal antes de bonificar: son dos cosas distintas).
    expect(await rotuloTarjeta(page, /^ITP \(/)).toBe('ITP (3,00%)');

    // Notaría — arancel(200.000):
    //   90,15 + 108,182205 + 45,0759 + tramo 4 completo (90.151,82 × 0,0010 = 90,15182)
    //   + tramo 5 (150.253,03→200.000, 0,05 %) → 49.746,97 × 0,0005 = 24,873485
    //   arancel sin IVA = 358,43341 · con IVA = 433,704426
    //   ×1,5 = 650,556639 · ×2 = 867,408852 · punto medio = 758,982746
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('758,98 €');
    const notaria = await descripcionTarjeta(page, 'Gastos de notaría');
    expect(notaria).toContain('650,56 €');
    expect(notaria).toContain('867,41 €');

    // Registro — arancel(200.000):
    //   24,04 + 42,0708575 + 37,56325 + (90.151,82 × 0,00075 = 67,613865)
    //   + tramo 5 (0,030 %) → 49.746,97 × 0,0003 = 14,924091
    //   suma = 186,2120635 (por debajo del tope) + 9,015182 = 195,2272455
    //   con el 21 % de IVA = 236,224967
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('236,22 €');

    // Total gastos = 6.000 + 758,982746 + 236,224967 + 400 = 7.395,207713
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('7395,20 €');
    // 7.395,207713 / 200.000 = 3,6976039 % → «3,70%»
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toContain('3,70%');
    // Coste total = 200.000 + 7.395,207713 = 207.395,207713
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('207.395,20 €');
  });

  /**
   * CASO 3 (RECHAZO) — importe cero, negativo, vacío y texto.
   * No debe salir ningún NaN, ningún «No definido» ni una cifra fantasma: la app se queda
   * en el marcador de posición hasta que el precio es un número positivo.
   */
  test('CASO 3 (rechazo) — 0, negativo, vacío y texto no producen NaN ni cifra fantasma', async ({ page }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Compra habitual/ }).click();
    await page.selectOption('#select-ccaa', 'madrid');

    const campo = page.locator('input[aria-label="' + PRECIO + '"]');
    const marcador = page.getByText('Introduce el precio de la finca rústica para ver el desglose de gastos');

    for (const entrada of ['0', '-100', '']) {
      await campo.fill(entrada);
      await expect(marcador).toBeVisible();
      await expect(page.locator('h3', { hasText: 'COSTE TOTAL DE ADQUISICIÓN' })).toHaveCount(0);
      await expect(page.locator('h3', { hasText: /^ITP \(/ })).toHaveCount(0);
    }

    // El texto ni siquiera llega al estado: NumberInput filtra con /^-?[\d.,]*$/
    await campo.fill('abc');
    expect(await campo.inputValue()).toBe('');
    await expect(marcador).toBeVisible();

    // En ningún momento aparecen los centinelas de formatNumber/formatCurrency ante NaN.
    const cuerpo = await page.locator('body').innerText();
    expect(cuerpo).not.toContain('NaN');
    expect(cuerpo).not.toContain('No definido');
    expect(cuerpo).not.toContain('∞');
  });

  /**
   * Riesgo 1 CRÍTICO (_private/DISCLAIMER-POLICY.md): el disclaimer va SIEMPRE visible y
   * NO puede ser colapsable, y la app declara la fuente y la fecha de sus datos normativos
   * con `<DataReference>` inmediatamente después.
   */
  test('Política de riesgo 1: disclaimer crítico no colapsable + DataReference sellado', async ({ page }) => {
    await page.goto(RUTA);

    const disclaimer = page.locator('[class*="disclaimer" i]').first();
    await expect(disclaimer).toBeVisible();
    await expect(disclaimer).toContainText('no constituye asesoramiento financiero, fiscal ni jurídico');
    // Sin botón dentro: no hay forma de plegarlo.
    expect(await disclaimer.locator('button').count()).toBe(0);

    // DataReference: normativa, fuente y fecha de verificación de FISCAL_INMUEBLES_META
    // (vigencia '2026', verificado '2026-06-17').
    await expect(page.getByText(/ITP\/AJD\/IVA 2026/)).toBeVisible();
    await expect(page.locator('body')).toContainText('17/06/2026');

    // App fiscal-España estructural → RegionBadge es-only (CLAUDE.md §1.bis)
    await expect(page.locator('body')).toContainText('España');
  });

  /**
   * La distinción IVA/ITP es la razón de ser de la app: el terreno rústico no edificable
   * está exento de IVA (art. 20.Uno.20º LIVA) y por eso paga ITP, salvo renuncia entre
   * profesionales (art. 20.Dos LIVA) → IVA 21 % con inversión del sujeto pasivo + AJD.
   * Madrid, 300.000 €, con renuncia:
   *   IVA = 300.000 × 21 % = 63.000   (IVA_INMUEBLES_2025.local = 21)
   *   AJD = 300.000 × 0,75 % = 2.250  (ITP_CCAA['madrid'].ajd = 0.75)
   *   ITP = 0 (no se liquidan los dos regímenes a la vez)
   */
  test('Los dos regímenes se distinguen: la renuncia liquida IVA 21 % + AJD y NO ITP', async ({ page }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /renuncia a la exención/i }).click();
    await page.selectOption('#select-ccaa', 'madrid');
    await rellenar(page, PRECIO, '300000');

    expect(await valorTarjeta(page, 'IVA (renuncia')).toBe('63.000,00 €');
    expect(await valorTarjeta(page, 'AJD (')).toBe('2250,00 €');
    // Ninguna TARJETA de resultado liquida ITP (el texto «ITP» sí sale en el recuadro de la
    // comunidad y en el bloque educativo, que hablan del impuesto, no de esta operación).
    await expect(page.locator('h3', { hasText: /^ITP \(/ })).toHaveCount(0);
    // Y se dice quién autoliquida ese IVA, que es lo que distingue este régimen.
    await expect(page.locator('body')).toContainText('inversión del sujeto pasivo');
    await expect(page.locator('body')).toContainText('Art. 20.Dos LIVA');
  });

  /**
   * La escala progresiva se aplica de verdad: Cataluña, 1.000.000 €.
   * `ITP_CCAA['cataluna'].tramosProgresivos` = 10 % hasta 600.000, 11 % hasta 900.000,
   * 12 % hasta 1.500.000 y 13 % por encima.
   *   600.000 × 10 % + 300.000 × 11 % + 100.000 × 12 % = 60.000 + 33.000 + 12.000 = 105.000
   *   (un tipo plano del 10 % habría dado 100.000: no es lo mismo)
   * Tipo efectivo = 105.000 / 1.000.000 = 10,50 %.
   */
  test('Cataluña, 1.000.000 €: se parte la base por tramos, no se aplica un tipo plano', async ({ page }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Compra habitual/ }).click();
    await page.selectOption('#select-ccaa', 'cataluna');
    await rellenar(page, PRECIO, '1000000');

    await expect(page.getByText(/escala progresiva \(10% → 11% → 12% → 13%\)/)).toBeVisible();
    expect(await valorTarjeta(page, 'ITP (')).toBe('105.000,00 €');
    expect(await rotuloTarjeta(page, /^ITP \(/)).toBe('ITP (10,50%)');
  });

  /** El País Vasco no cobra AJD (`ITP_CCAA['pais-vasco'].ajd = 0`, régimen foral). */
  test('País Vasco con renuncia: no se cobra AJD', async ({ page }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /renuncia a la exención/i }).click();
    await page.selectOption('#select-ccaa', 'pais-vasco');
    await rellenar(page, PRECIO, '100000');
    // AJD = 100.000 × 0 % = 0, y la tarjeta solo se pinta si el importe es > 0.
    await expect(page.locator('h3', { hasText: /^AJD/ })).toHaveCount(0);
    // El IVA sí, al 21 %: 100.000 × 21 % = 21.000
    expect(await valorTarjeta(page, 'IVA (renuncia')).toBe('21.000,00 €');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// REGRESIÓN de los hallazgos del 26/08/2026, REPARADOS ese mismo día.
// Estos tests se escribieron afirmando lo que DEBERÍA pasar, así que la reparación los
// puso en verde sin reescribirlos: son ya el contrato de que el defecto no vuelve.
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('Regresión — hallazgos reparados el 26/08/2026', () => {
  /**
   * HALLAZGO 1 (cálculo, alto) — en Canarias, Ceuta y Melilla la opción «Con renuncia a la
   * exención IVA» liquida un IVA del 21 % que allí NO existe, y lo suma al «COSTE TOTAL DE
   * ADQUISICIÓN» sin marcarlo como parcial.
   *
   * `TERRITORIOS_SIN_IVA` de `data/itp-ccaa.ts` los declara fuera del IVA español: Canarias
   * tributa por IGIC y las ciudades autónomas por IPSI. La app SÍ pinta el aviso
   * `<AvisoTerritorioSinIva>` —que dice literalmente «esta herramienta no lo calcula, así que
   * el importe del impuesto indirecto no es el tuyo»— pero el aviso vive en el panel del
   * formulario mientras el panel de resultados sigue enseñando la cifra inventada y el total
   * se rotula como total. Es el hallazgo 156 a medio cerrar: la hermana
   * `simulador-gastos-compraventa-nave-industrial` se reparó el 23/08/2026 poniendo
   * «No calculado» en la tarjeta y «COSTE TOTAL (PARCIAL)» en el cierre; aquí no se hizo.
   *
   * Canarias, renuncia, 150.000 €: la app enseña 31.500,00 € de IVA y 183.948,71 € de total.
   */
  test('HALLAZGO 1 — Canarias con renuncia no debe liquidar un IVA del 21 % ni cerrar un total completo', async ({ page }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /renuncia a la exención/i }).click();
    await page.selectOption('#select-ccaa', 'canarias');
    await rellenar(page, PRECIO, '150000');

    // El aviso ya está y acierta: se conserva como parte de lo que debe seguir cumpliéndose.
    await expect(page.locator('body')).toContainText('IGIC');
    await expect(page.locator('body')).toContainText('no se aplica el IVA');

    // Lo que falta: que la tarjeta no invente los 31.500 € y que el total se declare parcial.
    await expect(page.getByText('31.500,00 €')).toHaveCount(0);
    await expect(page.locator('body')).toContainText('No calculado');
    await expect(page.locator('body')).toContainText('PARCIAL');
  });

  /**
   * HALLAZGO 2 (contenido, medio) — el FAQPage del JSON-LD, que es justo lo que consumen
   * Bing Copilot, ChatGPT y Perplexity para grounding, afirma que el ITP de una finca rústica
   * va «habitualmente entre el 6% y el 10%». El propio motor de la app desmiente los dos
   * extremos: el País Vasco aplica el 4 % (`TIPOS_ITP_CCAA_2025`), Ceuta y Melilla el 3 %
   * efectivo tras la bonificación del art. 57 bis, y Cataluña y Baleares llegan al 13 % en su
   * tramo alto. `RANGO_ITP` existe en `data/itp-ccaa.ts` (= 4 a 13) precisamente para derivar
   * este rango en vez de escribirlo a mano; es el mismo defecto que el hallazgo 6 de la app
   * hermana de la nave industrial.
   */
  test('HALLAZGO 2 — el FAQPage anuncia un rango de ITP (6-10 %) que la propia app desmiente', async ({ page }) => {
    await page.goto(RUTA);
    const bloques = await page.locator('script[type="application/ld+json"]').allTextContents();
    const faq = bloques.find((b) => b.includes('FAQPage')) ?? '';
    expect(faq).not.toBe('');
    expect(faq).not.toContain('entre el 6% y el 10%');
  });

  /**
   * HALLAZGO 3 (accesibilidad, bajo) — el `<label>Tipo de operación</label>` no tiene
   * `htmlFor` ni envuelve ningún control: es un texto suelto. Los dos botones que gobierna
   * («Compra habitual» / «Con renuncia a la exención IVA») no forman un grupo accesible
   * (`role="group"` + `aria-labelledby`), así que un lector de pantalla los anuncia sin decir
   * de qué elección forman parte — y aquí la elección es nada menos que el régimen fiscal.
   * Mismo defecto que el hallazgo 9 de `simulador-gastos-compraventa-nave-industrial`.
   */
  test('HALLAZGO 3 — el par de botones de régimen fiscal no forma un grupo accesible', async ({ page }) => {
    await page.goto(RUTA);
    await expect(page.getByRole('group', { name: /Tipo de operación/ })).toBeVisible();
  });

  /**
   * HALLAZGO 4 (operativa, bajo) — mientras el campo de gestoría tiene el foco, un importe
   * negativo se suma tal cual al total: con 80.000 € en Madrid y «-1000» sin salir del campo,
   * «Total gastos adicionales» baja a 4.511,96 € aunque las líneas visibles (4.800 + 557,55 +
   * 154,41) sumen 5.511,96 €, y la tarjeta de gestoría ni se pinta (`gastosGestoria > 0`).
   * El `min={0}` de NumberInput solo actúa en el blur, así que la cifra en pantalla es
   * momentáneamente incoherente con su propio desglose. Es defecto del componente compartido
   * (mismo hallazgo 8 de la nave industrial), no propio de esta app.
   */
  test('HALLAZGO 4 — una gestoría negativa sin blur descuadra el total frente a sus líneas', async ({ page }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Compra habitual/ }).click();
    await page.selectOption('#select-ccaa', 'madrid');
    await rellenar(page, PRECIO, '80000');

    const gestoria = page.locator('input[aria-label="' + GESTORIA + '"]');
    await gestoria.click();
    await gestoria.press('Control+a');
    await gestoria.pressSequentially('-1000');   // sin salir del campo
    // El total no debería aceptar un gasto negativo: 4.800 + 557,55 + 154,41 = 5.511,96 €
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('5511,96 €');
  });

  /**
   * HALLAZGO 5 (dato, bajo) — el bloque educativo escribe a mano el tipo de la base del
   * ahorro del IRPF («base del ahorro, 19%-30%») pudiendo derivarlo de
   * `TRAMOS_GANANCIAS_PATRIMONIALES_2025`, que vive en `data/fiscal/inmuebles.ts` — el mismo
   * módulo del que esta app ya importa `IVA_INMUEBLES_2025` y `FISCAL_INMUEBLES_META`.
   *
   * Hoy los dos extremos coinciden, así que el test PASA: su valor es de guardia. El día que
   * la escala del ahorro se mueva en `data/fiscal` y el texto no, este test se pone rojo y
   * enseña la divergencia — que es lo que hoy no puede detectar nadie.
   */
  test('HALLAZGO 5 (guardia) — el 19 %-30 % del bloque educativo sigue coincidiendo con data/fiscal', async ({ page }) => {
    const minimo = TRAMOS_GANANCIAS_PATRIMONIALES_2025[0].tipo;                                   // 19
    const maximo = TRAMOS_GANANCIAS_PATRIMONIALES_2025[TRAMOS_GANANCIAS_PATRIMONIALES_2025.length - 1].tipo; // 30

    await page.goto(RUTA);
    // El bloque educativo llega plegado, así que su texto está en el DOM pero no es visible:
    // `innerText` no lo devuelve y hay que leerlo con `textContent`.
    const cuerpo = (await page.locator('body').textContent()) ?? '';
    expect(cuerpo).toContain(`base del ahorro, ${minimo}%-${maximo}%`);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// RE-INSPECCIÓN del 11/09/2026
//
// Vuelve a la cola porque cambiaron sus datos: el commit 7a02470c reescribió la ficha de
// Aragón en `data/itp-ccaa.ts` —la escala del art. 121-1 pasó de dos tramos a los cinco
// reales (8 · 8,5 · 9 · 9,5 · 10 %) y lo que se llamaban «tipos reducidos» por colectivo
// resultaron ser bonificaciones en cuota—, y el bc437470 tocó el clúster de compraventa.
// Los tres casos de abajo están resueltos a mano ANTES de ejecutar la app, con el
// desarrollo comentado junto a cada aserción.
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('Re-inspección 11/09/2026 — la escala de Aragón del art. 121-1', () => {
  /**
   * CASO 1 (NORMAL) — Aragón, compra habitual, 250.000 €, gestoría 400 €.
   * Precio dentro del PRIMER tramo de la escala: la escala existe pero todavía no parte la
   * base, así que el tipo efectivo tiene que salir exactamente el 8 % nominal. Es la prueba
   * de que reescribir la ficha con cinco tramos no ha movido el caso corriente.
   */
  test('CASO 1 (normal) — Aragón, 250.000 €: dentro del primer tramo, el efectivo es el 8 % nominal', async ({ page }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Compra habitual/ }).click();
    await page.selectOption('#select-ccaa', 'aragon');
    await rellenar(page, PRECIO, '250000');
    await rellenar(page, GESTORIA, '400');

    // ITP = 250.000 × 8 % = 20.000. El 8 % es el primer tramo de
    // `ITP_CCAA['aragon'].tramosProgresivos` (art. 121-1, hasta 400.000 €) y coincide con el
    // tipo general que `tipoGeneralDe('Aragón')` lee de TIPOS_ITP_CCAA_2025.
    expect(await valorTarjeta(page, 'ITP (')).toBe('20.000,00 €');
    expect(await rotuloTarjeta(page, /^ITP \(/)).toBe('ITP (8,00%)');

    // La app avisa de la escala completa, los cinco tramos de la ficha reescrita.
    await expect(page.getByText(/escala progresiva \(8% → 8,5% → 9% → 9,5% → 10%\)/)).toBeVisible();

    // Notaría — arancel(250.000) con ARANCELES_NOTARIO:
    //   90,15 + 108,182205 + 45,0759 + 90,15182 (tramo 4 completo)
    //   + tramo 5 (150.253,03→250.000, 0,05 %) → 99.746,97 × 0,0005 = 49,873485
    //   arancel sin IVA = 383,43341 · con IVA (×1,21) = 463,954426
    //   FACTURA_NOTARIAL: ×1,5 = 695,931639 · ×2 = 927,908852 · medio = 811,920246
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('811,92 €');

    // Registro — arancel(250.000) con ARANCELES_REGISTRO:
    //   24,04 + 42,0708575 + 37,56325 + 67,613865 (tramo 4 completo)
    //   + tramo 5 (0,030 %) → 99.746,97 × 0,0003 = 29,924091
    //   suma = 201,2120635 + presentación 6,010121 + nota simple 3,005061 = 210,2272455
    //   con el 21 % de IVA = 254,374967
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('254,37 €');

    // Total gastos = 20.000 + 811,92 + 254,37 + 400 = 21.466,29 (líneas ya redondeadas,
    // que es lo que hace `sumarLineasVisibles`)
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('21.466,29 €');
    // 21.466,29 / 250.000 = 8,5865 % → «8,59%»
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toContain('8,59%');
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('271.466,29 €');
  });

  /**
   * CASO 2 (LÍMITE) — Aragón en los dos puntos que la ficha declara: el corte de 500.000 €
   * (tres tramos) y el tramo MÁS ALTO, el 10 % a partir de 750.000 €.
   *
   * La cabecera de `ITP_CCAA['aragon']` publica la tabla oficial de cuota acumulada:
   * 32.000 € a los 400.000, 36.250 € a los 450.000, 40.750 € a los 500.000 y 64.500 € a los
   * 750.000. Los dos importes de abajo se apoyan en esos cortes, no en una memoria de tipos.
   */
  test('CASO 2 (límite) — Aragón, 500.000 € y 1.000.000 €: la cuota acumulada del art. 121-1', async ({ page }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Compra habitual/ }).click();
    await page.selectOption('#select-ccaa', 'aragon');
    await rellenar(page, GESTORIA, '400');

    // 500.000 € → 400.000 × 8 % (32.000) + 50.000 × 8,5 % (4.250) + 50.000 × 9 % (4.500)
    //           = 40.750 €, que es justo el corte que declara la ficha.
    // Un tipo plano del 8 % habría dado 40.000 €: no es lo mismo.
    await rellenar(page, PRECIO, '500000');
    expect(await valorTarjeta(page, 'ITP (')).toBe('40.750,00 €');
    // Tipo EFECTIVO = 40.750 / 500.000 = 8,15 % (el recuadro sigue diciendo «ITP General 8%»,
    // que es el nominal del primer tramo).
    expect(await rotuloTarjeta(page, /^ITP \(/)).toBe('ITP (8,15%)');
    // Notaría arancel(500.000) = 90,15 + 108,182205 + 45,0759 + 90,15182 + (349.746,97 ×
    //   0,0005 = 174,873485) = 508,43341 · con IVA = 615,204426 · medio ×1,75 = 1.076,607746
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('1076,61 €');
    // Registro arancel(500.000) = 24,04 + 42,0708575 + 37,56325 + 67,613865 + (349.746,97 ×
    //   0,0003 = 104,924091) = 276,2120635 + 9,015182 = 285,2272455 · con IVA = 345,124967
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('345,12 €');
    // Total gastos = 40.750 + 1.076,61 + 345,12 + 400 = 42.571,73 → 8,51 % sobre el precio
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('42.571,73 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toContain('8,51%');
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('542.571,73 €');

    // 1.000.000 € → cuota acumulada a los 750.000 (64.500 €, corte declarado en la ficha)
    //             + 250.000 × 10 % (el tramo más alto) = 25.000 → 89.500 €
    // Tipo efectivo = 89.500 / 1.000.000 = 8,95 %.
    await rellenar(page, PRECIO, '1000000');
    expect(await valorTarjeta(page, 'ITP (')).toBe('89.500,00 €');
    expect(await rotuloTarjeta(page, /^ITP \(/)).toBe('ITP (8,95%)');
  });

  /**
   * CASO 3 (RECHAZO) — «1.2.3» no es un número.
   * El filtro de NumberInput (/^-?[\d.,]*$/) SÍ lo deja teclear, así que la defensa está
   * entera en `parseSpanishNumber`, que devuelve NaN ante dos separadores repetidos. Si
   * algún día se sustituyera por un `parseFloat` casero, «1.2.3» pasaría a valer 1,2 € y la
   * app liquidaría un ITP de 0,10 €: por eso este caso queda clavado aquí.
   * (El caso 3 de la inspección del 26/08 cubre 0, negativo, vacío y texto puro.)
   */
  test('CASO 3 (rechazo) — «1.2.3» se queda en el marcador, sin cifra fantasma ni NaN', async ({ page }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Compra habitual/ }).click();
    await page.selectOption('#select-ccaa', 'madrid');

    const campo = page.locator('input[aria-label="' + PRECIO + '"]');
    await campo.fill('1.2.3');

    // El campo conserva lo tecleado: el filtro del componente no lo rechaza...
    expect(await campo.inputValue()).toBe('1.2.3');
    // ...pero el parser sí, y la app no calcula nada.
    await expect(page.getByText('Introduce el precio de la finca rústica para ver el desglose de gastos')).toBeVisible();
    await expect(page.locator('h3', { hasText: 'COSTE TOTAL DE ADQUISICIÓN' })).toHaveCount(0);
    await expect(page.locator('h3', { hasText: /^ITP \(/ })).toHaveCount(0);

    const cuerpo = await page.locator('body').innerText();
    expect(cuerpo).not.toContain('NaN');
    expect(cuerpo).not.toContain('No definido');
    // Y no aparece por ningún lado el 1,2 € que devolvería un parseFloat casero.
    expect(cuerpo).not.toContain('1,20 €');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// HALLAZGOS de la re-inspección del 11/09/2026 — fallan A PROPÓSITO.
// Afirman lo que debería pasar; cuando se reparen quedan como test de regresión.
// Los tres son «efecto familia»: el defecto se reparó en una hermana del clúster y no se
// propagó a ésta.
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('Hallazgos abiertos — re-inspección 11/09/2026', () => {
  /**
   * HALLAZGO 6 (contenido, medio) — la FAQ visible y el FAQPage del JSON-LD afirman que con
   * la renuncia «la operación pasa a tributar por IVA al 21%», sin la excepción territorial
   * que la propia calculadora sí aplica: en Canarias rige el IGIC y en Ceuta y Melilla el
   * IPSI (`TERRITORIOS_SIN_IVA` en `data/itp-ccaa.ts`), y allí la app se niega a dar cifra
   * («IGIC · No calculado», «COSTE TOTAL (PARCIAL)»).
   *
   * El JSON-LD es justo lo que citan los asistentes de IA, así que la versión que se
   * propaga es la que no tiene la excepción. Las hermanas `-garaje` y `-solar` ya llevan la
   * mención de IGIC/IPSI en su `metadata.ts`; ésta no (se ve grepeando IGIC en los
   * `metadata.ts` del clúster). Dentro de este mismo FAQPage la excepción simétrica del
   * ITP —la bonificación del 50 % de Ceuta y Melilla— SÍ está escrita, lo que enseña que la
   * reparación llegó a la mitad fiscal del bloque y no a la del IVA.
   */
  test('HALLAZGO 6 — la FAQ y el FAQPage prometen IVA 21 % sin decir que en Canarias, Ceuta y Melilla no rige', async ({ page }) => {
    await page.goto(RUTA);

    // Lo que la calculadora hace de verdad en Canarias con renuncia:
    await page.getByRole('button', { name: /renuncia a la exención/i }).click();
    await page.selectOption('#select-ccaa', 'canarias');
    await rellenar(page, PRECIO, '80000');
    await expect(page.locator('body')).toContainText('No calculado');
    await expect(page.locator('body')).toContainText('PARCIAL');

    // Lo que cuenta el FAQPage que leen los asistentes de IA: debería recoger la excepción.
    const bloques = await page.locator('script[type="application/ld+json"]').allTextContents();
    const faq = bloques.find((b) => b.includes('FAQPage')) ?? '';
    expect(faq).not.toBe('');
    expect(faq).toMatch(/IGIC|IPSI/);

    // Y la FAQ de la página, igual. Se lee el bloque de preguntas con `textContent` porque
    // la sección educativa llega plegada, y acotado a ESA sección para que los dos
    // <script type="application/ld+json"> del layout no den por buena la aserción.
    const faqVisible = (await page
      .locator('section', { has: page.locator('h2', { hasText: 'Preguntas frecuentes' }) })
      .last()
      .textContent()) ?? '';
    expect(faqVisible).toContain('renuncia a la exención');
    expect(faqVisible).toMatch(/IGIC|IPSI/);
  });

  /**
   * HALLAZGO 7 (contenido, medio) — en Ceuta y Melilla la cifra es correcta pero el usuario
   * no puede reconstruirla, y la página se contradice consigo misma: el recuadro de la
   * ciudad anuncia «ITP General 6%», la tarjeta cobra «ITP (3,00%)» y su descripción dice
   * «Tipo general de la CCAA (posibles reducciones agrarias no incluidas)», que es
   * exactamente lo que NO es: es el tipo general con la bonificación del 50 % de la cuota
   * del art. 57 bis del TRLITPAJD ya aplicada por el motor (`aplicarBonificacionCiudad`).
   * La palabra «bonificación» no aparece en ninguna parte de la página.
   *
   * La hermana `simulador-gastos-compraventa-nave-industrial` se reparó nombrándola en el
   * recuadro de la ciudad y en la descripción de la tarjeta (14 menciones de «bonific» en su
   * page.tsx); aquí hay 0.
   *
   * Caso: Ceuta, compra habitual, 80.000 € → ITP 2.400,00 € (3,00 %) sin explicación.
   */
  test('HALLAZGO 7 — en Ceuta la bonificación del 50 % se aplica pero no se nombra en ningún sitio', async ({ page }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Compra habitual/ }).click();
    await page.selectOption('#select-ccaa', 'ceuta');
    await rellenar(page, PRECIO, '80000');

    // La cuota está bien: 80.000 × 6 % × 0,5 = 2.400 €.
    expect(await valorTarjeta(page, 'ITP (')).toBe('2400,00 €');
    expect(await rotuloTarjeta(page, /^ITP \(/)).toBe('ITP (3,00%)');

    // Lo que falta: decir POR QUÉ son 2.400 y no 4.800, cuando el recuadro dice 6 %.
    // Se mira lo VISIBLE (`innerText`): el FAQPage del JSON-LD sí dice «la cuota se bonifica
    // al 50%», y leer el body con `textContent` lo daría por explicado en pantalla cuando el
    // usuario no lo ve por ninguna parte.
    const visible = await page.locator('body').innerText();
    expect(visible).toMatch(/bonific/i);
    // Y que la descripción de la tarjeta deje de llamarlo «tipo general» a secas.
    expect(await descripcionTarjeta(page, 'ITP (')).not.toBe(
      'Tipo general de la CCAA (posibles reducciones agrarias no incluidas)',
    );
  });

  /**
   * HALLAZGO 8 (accesibilidad, medio) — el azul de marca `--primary` (#2E86AB) se usa como
   * color de TEXTO en cuatro sitios y no llega al 4,5:1 de WCAG AA. Para eso existe
   * `--primary-texto` (#26718F, 5,47:1 sobre blanco), que la hermana
   * `simulador-gastos-compraventa-nave-industrial` ya usa.
   *
   * Medido en el tema claro sobre la página servida:
   *   .sectionTitle    #2E86AB sobre #FFFFFF · 16,8px bold → 4,11:1
   *   .infoCcaaNombre  #2E86AB sobre #FAFAFA · 16px bold   → 3,93:1
   *   .infoCcaaValue   #2E86AB sobre #FFFFFF · 16px bold   → 4,11:1
   *   .catastroLink    #2E86AB sobre #FFFFFF · 13,6px      → 4,11:1
   * Ninguno llega al umbral de texto grande (18,66px bold / 24px), así que el exigible es
   * 4,5:1 en los cuatro.
   */
  test('HALLAZGO 8 — el azul de marca como color de texto no llega a 4,5:1 (WCAG AA)', async ({ page }) => {
    await page.goto(RUTA);
    await page.selectOption('#select-ccaa', 'madrid');

    const luminancia = ([r, g, b]: number[]): number => {
      const canal = (c: number): number => {
        const s = c / 255;
        return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
      };
      return 0.2126 * canal(r) + 0.7152 * canal(g) + 0.0722 * canal(b);
    };
    const aRgb = (css: string): number[] => (css.match(/\d+(\.\d+)?/g) ?? []).slice(0, 3).map(Number);

    const selectores: [string, string][] = [
      ['.sectionTitle', 'h2[class*="sectionTitle"]'],
      ['.infoCcaaNombre', 'span[class*="infoCcaaNombre"]'],
      ['.infoCcaaValue', 'span[class*="infoCcaaValue"]'],
      ['.catastroLink', 'a[class*="catastroLink"]'],
    ];

    for (const [nombre, selector] of selectores) {
      const elemento = page.locator(selector).first();
      await expect(elemento).toBeVisible();
      const { color, fondo } = await elemento.evaluate((el) => {
        let nodo: HTMLElement | null = el as HTMLElement;
        let fondo = 'rgb(255, 255, 255)';
        while (nodo) {
          const c = getComputedStyle(nodo).backgroundColor;
          if (c && !/rgba\(0, 0, 0, 0\)|transparent/.test(c)) {
            fondo = c;
            break;
          }
          nodo = nodo.parentElement;
        }
        return { color: getComputedStyle(el as HTMLElement).color, fondo };
      });

      const l1 = luminancia(aRgb(color));
      const l2 = luminancia(aRgb(fondo));
      const contraste = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
      expect(contraste, `${nombre}: ${color} sobre ${fondo} = ${contraste.toFixed(2)}:1`).toBeGreaterThanOrEqual(4.5);
    }
  });
});
