/**
 * Inspector — simulador-gastos-compraventa-solar (segmento FISCAL, riesgo 1 CRÍTICO)
 * Inspección del 26/08/2026. Sexta app del clúster de compraventa que se inspecciona, tras
 * garaje, trastero, local comercial, nave industrial, estimador de inmueble y finca rústica.
 *
 * QUÉ PROMETE LA APP
 * ──────────────────
 * H1 «Simulador de Gastos de Compra de Solar». El subtítulo, la metadata y el aviso «Clave
 * del solar» prometen algo muy concreto y comprobable: que el suelo EDIFICABLE no sigue el
 * régimen del suelo rústico. Es decir (1) si vende un promotor o empresario, la entrega está
 * sujeta y NO exenta de IVA al 21 % y además devenga AJD; (2) si vende un particular, ITP al
 * tipo general de la comunidad; (3) al ser suelo urbano, el VENDEDOR paga plusvalía municipal
 * —que la app no calcula y solo recuerda—; (4) notaría y registro.
 *
 * Verificado en esta inspección: NO es una copia sin adaptar de la hermana rústica. El
 * régimen por defecto del empresario aquí es IVA sujeto y no exento (no la exención del art.
 * 20.Uno.20º LIVA con renuncia opcional), la app lo explica en su propio recuadro y sí
 * advierte de la plusvalía municipal, que en la rústica dice expresamente que no existe.
 *
 * DE DÓNDE SALE CADA CIFRA ESPERADA (ninguna de memoria)
 * ─────────────────────────────────────────────────────
 *  - Tipo general de ITP por CCAA → `TIPOS_ITP_CCAA_2025` en `data/fiscal/inmuebles.ts`, que
 *    `tipoGeneralDe()` de `data/itp-ccaa.ts` lee para rellenar `ITP_CCAA[x].tipoGeneral`
 *    (Madrid = 6 · Baleares = 8 con escala · País Vasco = 4).
 *  - Escalas progresivas y AJD por comunidad → `ITP_CCAA` en `data/itp-ccaa.ts`
 *    (Baleares 8/9/10/12/13 % · Madrid `ajd: 0.75` · Canarias `ajd: 0.75` · País Vasco `ajd: 0`).
 *  - Ceuta y Melilla NO figuran en `TIPOS_ITP_CCAA_2025` (no son CCAA): su `tipoGeneral: 6`
 *    es una excepción declarada a mano en `data/itp-ccaa.ts`, y sobre esa cuota cae la
 *    bonificación del 50 % del art. 57 bis del TRLITPAJD (RDL 1/1993, añadido por la Ley
 *    53/2002) que `aplicarBonificacionCiudad()` incorpora al motor por el SITIO del inmueble.
 *  - IVA del solar → `IVA_INMUEBLES_2025.local = 21` en `data/fiscal/inmuebles.ts` (la app lo
 *    importa como `IVA_SOLAR`). Territorio de aplicación → `TERRITORIOS_SIN_IVA` de
 *    `data/itp-ccaa.ts`: Canarias (IGIC), Ceuta y Melilla (IPSI) quedan fuera del IVA español.
 *  - Arancel notarial → `ARANCELES_NOTARIO` (RD 1426/1989, número 2: matriz + una copia) y la
 *    FACTURA mostrada → `FACTURA_NOTARIAL` (horquilla ×1,5 a ×2 por los números 4, 6 y 7; la
 *    tarjeta enseña el punto medio ×1,75).
 *  - Arancel registral → `ARANCELES_REGISTRO` (RD 1427/1989, número 2) MÁS los fijos de
 *    `REGISTRO_CONCEPTOS`: presentación 6,010121 € y nota simple 3,005061 €.
 *  - El 21 % de IVA sobre honorarios va dentro de `calcularArancelNotarial` y `calcularRegistro`.
 *  - Fecha y fuente que la página declara → `FISCAL_INMUEBLES_META` (verificado 2026-06-17,
 *    vigencia 2026).
 *
 * Los tres casos están resueltos a mano ANTES de ejecutar la app, con los aranceles notarial
 * y registral recalculados tramo a tramo por un script propio que NO llama al código de la
 * app; el desarrollo va comentado junto a cada aserción, con los importes sin redondear.
 *
 * HALLAZGOS ABIERTOS: al final, en su propio describe. Afirman lo que DEBERÍA pasar y hoy
 * fallan a propósito; cuando se reparen, quedan como test de regresión.
 */
import { test, expect, type Page } from '@playwright/test';
import { IVA_INMUEBLES_2025 } from '../../data/fiscal/inmuebles';
import { RANGO_AJD } from '../../data/itp-ccaa';

const RUTA = '/simulador-gastos-compraventa-solar/';

const PRECIO = 'Precio de compra del solar';
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

test.describe('Simulador de gastos de compra de solar — inspección 26/08/2026', () => {
  /**
   * CASO 1 (NORMAL) — Madrid, vende un PARTICULAR, 120.000 €, gestoría 500 €.
   * Es la operación corriente y la que la propia app pone de ejemplo: el placeholder del
   * campo de precio dice «120000» y el de gestoría trae «500» por defecto.
   */
  test('CASO 1 (normal) — Madrid, vende un particular, 120.000 €', async ({ page }) => {
    await page.goto(RUTA);
    await page.selectOption('#select-ccaa', 'madrid');
    await page.getByRole('button', { name: /Un particular/ }).click();
    await rellenar(page, PRECIO, '120000');
    await rellenar(page, GESTORIA, '500');

    // ITP = 120.000 × 6 % = 7.200. El 6 % sale de TIPOS_ITP_CCAA_2025 → { ccaa: 'Madrid', tipo: 6 }.
    // Madrid no tiene escala progresiva, así que el tipo efectivo coincide con el nominal.
    // «7200,00 €» sin punto de millar: es-ES no agrupa los números de cuatro cifras.
    expect(await valorTarjeta(page, 'ITP (')).toBe('7200,00 €');
    expect(await rotuloTarjeta(page, /^ITP \(/)).toBe('ITP (6,00%)');

    // Vende un particular → no hay IVA y por tanto tampoco AJD.
    await expect(page.locator('h3', { hasText: /^AJD/ })).toHaveCount(0);
    await expect(page.locator('h3', { hasText: /^IVA \(/ })).toHaveCount(0);

    // Notaría — RD 1426/1989, número 2 (ARANCELES_NOTARIO):
    //   tramo 1 (hasta 6.010,12 €)                →                             90,15
    //   tramo 2 (6.010,12→30.050,61, 0,45 %)      → 24.040,49 × 0,0045 =    108,182205
    //   tramo 3 (30.050,61→60.101,21, 0,15 %)     → 30.050,60 × 0,0015 =     45,075900
    //   tramo 4 (60.101,21→120.000, 0,10 %)       → 59.898,79 × 0,0010 =     59,898790
    //   arancel sin IVA                           =                        303,306895
    //   con el 21 % de IVA                        = × 1,21 =               367,001343
    // FACTURA_NOTARIAL: ×1,5 = 550,502014 · ×2 = 734,002686 · punto medio = 642,252350
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('642,25 €');
    const notaria = await descripcionTarjeta(page, 'Gastos de notaría');
    expect(notaria).toContain('550,50 €');
    expect(notaria).toContain('734,00 €');

    // Registro — RD 1427/1989, número 2 (ARANCELES_REGISTRO):
    //   tramo 1                                   →                             24,04
    //   tramo 2 (0,175 %)                         → 24.040,49 × 0,00175 =   42,0708575
    //   tramo 3 (0,125 %)                         → 30.050,60 × 0,00125 =     37,56325
    //   tramo 4 (0,075 %)                         → 59.898,79 × 0,00075 =  44,9240925
    //   suma (muy por debajo del tope 2.181,67)   =                          148,5982
    //   + presentación 6,010121 + nota simple 3,005061 =                  157,613382
    //   con el 21 % de IVA                        = × 1,21 =              190,712192
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('190,71 €');

    expect(await valorTarjeta(page, 'Gastos de gestoría')).toBe('500,00 €');

    // Total gastos = 7.200 + 642,252350 + 190,712192 + 500 = 8.532,964542
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('8532,96 €');
    // 8.532,964542 / 120.000 = 7,1108038 % → «7,11%»
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toContain('7,11%');

    // Coste total = 120.000 + 8.532,964542 = 128.532,964542
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('128.532,96 €');

    // La promesa que distingue al solar de la finca rústica: el vendedor SÍ paga plusvalía.
    await expect(page.locator('body')).toContainText('plusvalía municipal');
    // …pero la app no la calcula: no hay ninguna tarjeta de resultado con ese nombre.
    await expect(page.locator('h3', { hasText: /[Pp]lusvalía/ })).toHaveCount(0);
  });

  /**
   * CASO 2 (LÍMITE) — Baleares, vende un PARTICULAR, 2.500.000 €, gestoría 500 €.
   * Escala progresiva de cinco tramos llevada hasta el MÁS ALTO (13 %), que es el techo del
   * ITP en todo el catálogo. `ITP_CCAA['baleares'].tramosProgresivos` = 8 % hasta 400.000,
   * 9 % hasta 600.000, 10 % hasta 1.000.000, 12 % hasta 2.000.000 y 13 % por encima:
   *   400.000 × 8 %   =  32.000
   *   200.000 × 9 %   =  18.000
   *   400.000 × 10 %  =  40.000
   * 1.000.000 × 12 %  = 120.000
   *   500.000 × 13 %  =  65.000
   *                     ───────
   *                     275.000   (un tipo plano del 8 % habría dado 200.000: no es lo mismo)
   * Tipo efectivo = 275.000 / 2.500.000 = 11,00 %.
   */
  test('CASO 2 (límite) — Baleares, 2.500.000 €: se alcanza el tramo del 13 %, el más alto del catálogo', async ({ page }) => {
    await page.goto(RUTA);
    await page.selectOption('#select-ccaa', 'baleares');
    await page.getByRole('button', { name: /Un particular/ }).click();
    await rellenar(page, PRECIO, '2500000');
    await rellenar(page, GESTORIA, '500');

    await expect(page.getByText(/escala progresiva \(8% → 9% → 10% → 12% → 13%\)/)).toBeVisible();
    expect(await valorTarjeta(page, 'ITP (')).toBe('275.000,00 €');
    expect(await rotuloTarjeta(page, /^ITP \(/)).toBe('ITP (11,00%)');

    // Notaría — arancel(2.500.000):
    //   90,15 + 108,182205 + 45,0759 + 90,15182 (tramo 4 completo)
    //   + tramo 5 (150.253,03→601.012,10, 0,05 %) → 450.759,07 × 0,0005 = 225,379535
    //   + tramo 6 (601.012,10→2.500.000, 0,03 %)  → 1.898.987,90 × 0,0003 = 569,69637
    //   arancel sin IVA = 1.128,63783 · con IVA = 1.365,649354
    //   ×1,5 = 2.048,474031 · ×2 = 2.731,298709 · punto medio = 2.389,886370
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('2389,89 €');
    const notaria = await descripcionTarjeta(page, 'Gastos de notaría');
    expect(notaria).toContain('2048,47 €');
    expect(notaria).toContain('2731,30 €');

    // Registro — arancel(2.500.000):
    //   24,04 + 42,0708575 + 37,56325 + 67,613865 (tramo 4 completo)
    //   + tramo 5 (0,030 %) → 450.759,07 × 0,0003 = 135,227721
    //   + tramo 6 (0,020 %) → 1.898.987,90 × 0,0002 = 379,79758
    //   suma = 686,3132735 → SIGUE por debajo del tope REGISTRO_MAXIMO (2.181,67)
    //   + 6,010121 + 3,005061 = 695,3284555 · con el 21 % de IVA = 841,347431
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('841,35 €');

    // Total gastos = 275.000 + 2.389,886370 + 841,347431 + 500 = 278.731,233801
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('278.731,23 €');
    // 278.731,233801 / 2.500.000 = 11,1492494 % → «11,15%»
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toContain('11,15%');
    // Coste total = 2.500.000 + 278.731,233801 = 2.778.731,233801
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('2.778.731,23 €');
  });

  /**
   * CASO 3 (RECHAZO) — importe cero, negativo, vacío, texto y número malformado.
   * No debe salir ningún NaN, ningún «No definido» ni una cifra fantasma: la app se queda en
   * el marcador de posición hasta que el precio es un número positivo. `parseSpanishNumber`
   * devuelve NaN ante «1.2.3» y la guarda `!Number.isFinite(precio) || precio <= 0` lo corta.
   */
  test('CASO 3 (rechazo) — 0, negativo, vacío, texto y «1.2.3» no producen NaN ni cifra fantasma', async ({ page }) => {
    await page.goto(RUTA);
    await page.selectOption('#select-ccaa', 'madrid');
    await page.getByRole('button', { name: /Un particular/ }).click();

    const campo = page.locator('input[aria-label="' + PRECIO + '"]');
    const marcador = page.getByText('Introduce el precio del solar para ver el desglose de gastos');

    for (const entrada of ['0', '-100', '1.2.3', '']) {
      await campo.fill(entrada);
      await expect(marcador).toBeVisible();
      await expect(page.locator('h3', { hasText: 'COSTE TOTAL DE ADQUISICIÓN' })).toHaveCount(0);
      await expect(page.locator('h3', { hasText: /^ITP \(/ })).toHaveCount(0);
    }

    // El texto ni siquiera llega al estado: NumberInput filtra con /^-?[\d.,]*$/, así que
    // `onChange` no se dispara y React vuelve a pintar el valor anterior (aquí, el vacío).
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
   * La razón de ser de la app: el solar NO sigue el régimen del suelo rústico. La entrega de
   * terreno edificable por un empresario está EXCLUIDA de la exención del art. 20.Uno.20º
   * LIVA, así que va por IVA sujeto y no exento, más AJD. Madrid, 300.000 €:
   *   IVA = 300.000 × 21 % = 63.000   (IVA_INMUEBLES_2025.local = 21 → IVA_SOLAR)
   *   AJD = 300.000 × 0,75 % = 2.250  (ITP_CCAA['madrid'].ajd = 0.75)
   *   ITP = 0 (no se liquidan los dos regímenes a la vez)
   * Notaría y registro de 300.000 €, calculados aparte:
   *   arancel notarial sin IVA = 90,15 + 108,182205 + 45,0759 + 90,15182
   *                              + (300.000 − 150.253,03) × 0,0005 = 74,873485 → 408,43341
   *   con IVA = 494,204426 · ×1,5 = 741,306639 · ×2 = 988,408852 · medio = 864,857746
   *   registro sin IVA = 24,04 + 42,0708575 + 37,56325 + 67,613865
   *                      + 149.746,97 × 0,0003 = 44,924091 → 216,2120635
   *                      + 9,015182 = 225,2272455 · con IVA = 272,524967
   *   total gastos = 63.000 + 2.250 + 864,857746 + 272,524967 + 500 = 66.887,382713
   *   coste total  = 300.000 + 66.887,382713 = 366.887,382713  (22,30 % sobre el precio)
   */
  test('El solar de empresario va por IVA 21 % + AJD y NO por ITP (Madrid, 300.000 €)', async ({ page }) => {
    await page.goto(RUTA);
    await page.selectOption('#select-ccaa', 'madrid');
    await page.getByRole('button', { name: /Promotor \/ Empresa/ }).click();
    await rellenar(page, PRECIO, '300000');
    await rellenar(page, GESTORIA, '500');

    expect(await rotuloTarjeta(page, /^IVA \(/)).toBe('IVA (21,00%)');
    expect(await valorTarjeta(page, 'IVA (')).toBe('63.000,00 €');
    expect(await valorTarjeta(page, 'AJD (')).toBe('2250,00 €');
    // Ninguna TARJETA de resultado liquida ITP (la palabra «ITP» sí sale en el recuadro de la
    // comunidad y en el bloque educativo, que hablan del impuesto, no de esta operación).
    await expect(page.locator('h3', { hasText: /^ITP \(/ })).toHaveCount(0);

    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('864,86 €');
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('272,52 €');
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('66.887,38 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toContain('22,30%');
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('366.887,38 €');

    // Y se dice lo que decide si ese 21 % es coste o no: quién compra.
    await expect(page.locator('body')).toContainText('modelo 303');
    await expect(page.locator('body')).toContainText('autopromueve');
  });

  /**
   * Ceuta, vende un particular, 200.000 €. Territorio con tipo atípico por dos motivos a la
   * vez: su 6 % está escrito a mano en `data/itp-ccaa.ts` (excepción declarada, no figura en
   * TIPOS_ITP_CCAA_2025) y sobre la cuota cae la bonificación del 50 % del art. 57 bis del
   * TRLITPAJD, que el motor aplica solo por el SITIO del inmueble. Es el caso que en agosto
   * de 2026 estaba mal en las siete apps del clúster (hallazgo 157: se cobraba el doble).
   *   ITP = 200.000 × 6 % = 12.000 · × 0,5 = 6.000 → tipo efectivo 3,00 %
   *   notaría(200.000): arancel sin IVA 358,43341 · con IVA 433,704426
   *                     ×1,5 = 650,556639 · ×2 = 867,408852 · medio = 758,982746
   *   registro(200.000): 186,2120635 + 9,015182 = 195,2272455 · con IVA = 236,224967
   *   total gastos = 6.000 + 758,982746 + 236,224967 + 500 = 7.495,207713  (3,75 %)
   *   coste total  = 207.495,207713
   */
  test('Ceuta, particular, 200.000 €: la bonificación del 50 % (art. 57 bis) se aplica', async ({ page }) => {
    await page.goto(RUTA);
    await page.selectOption('#select-ccaa', 'ceuta');
    await page.getByRole('button', { name: /Un particular/ }).click();
    await rellenar(page, PRECIO, '200000');
    await rellenar(page, GESTORIA, '500');

    expect(await valorTarjeta(page, 'ITP (')).toBe('6000,00 €');
    // Tipo EFECTIVO 3,00 %: el recuadro de la ciudad sigue diciendo «ITP General 6%», que es
    // el nominal antes de bonificar. Son dos cosas distintas y ambas correctas.
    expect(await rotuloTarjeta(page, /^ITP \(/)).toBe('ITP (3,00%)');
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('758,98 €');
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('236,22 €');
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('7495,21 €');
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('207.495,21 €');
  });

  /** El País Vasco no cobra AJD (`ITP_CCAA['pais-vasco'].ajd = 0`, régimen foral). */
  test('País Vasco, empresario: se liquida el IVA pero NO se cobra AJD', async ({ page }) => {
    await page.goto(RUTA);
    await page.selectOption('#select-ccaa', 'pais-vasco');
    await page.getByRole('button', { name: /Promotor \/ Empresa/ }).click();
    await rellenar(page, PRECIO, '100000');

    // AJD = 100.000 × 0 % = 0, y la tarjeta solo se pinta si el importe es > 0.
    await expect(page.locator('h3', { hasText: /^AJD/ })).toHaveCount(0);
    // El IVA sí, al 21 %: 100.000 × 21 % = 21.000
    expect(await valorTarjeta(page, 'IVA (')).toBe('21.000,00 €');
  });

  /**
   * Riesgo 1 CRÍTICO (_private/DISCLAIMER-POLICY.md): el disclaimer va SIEMPRE visible y NO
   * puede ser colapsable, y la app declara la fuente y la fecha de sus datos normativos con
   * `<DataReference>` inmediatamente después.
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
    await expect(page.locator('body')).toContainText('Solo España');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// HALLAZGOS ABIERTOS del 26/08/2026. Todos fallan HOY a propósito.
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('Hallazgos abiertos — 26/08/2026', () => {
  /**
   * HALLAZGO 1 (cálculo, alto) — en Canarias, Ceuta y Melilla la opción «Promotor / Empresa»
   * liquida un IVA del 21 % que allí NO existe, y lo suma al «COSTE TOTAL DE ADQUISICIÓN»
   * sin marcarlo como parcial.
   *
   * `TERRITORIOS_SIN_IVA` de `data/itp-ccaa.ts` los declara fuera del IVA español: Canarias
   * tributa por IGIC y las ciudades autónomas por IPSI. La app SÍ pinta el aviso
   * `<AvisoTerritorioSinIva>` —que dice literalmente «esta herramienta no lo calcula, así que
   * el importe del impuesto indirecto no es el tuyo»— pero el aviso vive en el panel del
   * formulario mientras el panel de resultados sigue enseñando la cifra inventada y el total
   * se rotula como total. Es el hallazgo 156 a medio cerrar: la hermana
   * `simulador-gastos-compraventa-nave-industrial` se reparó el 23/08/2026 poniendo «No
   * calculado» en la tarjeta y «COSTE TOTAL (PARCIAL)» en el cierre; aquí no se hizo. Mismo
   * defecto que el hallazgo 1 de `simulador-gastos-compraventa-terreno-rustico`, y aquí pesa
   * más: allí el IVA era la excepción (renuncia entre profesionales) y aquí es el régimen
   * ORDINARIO de comprar un solar a un promotor.
   *
   * Canarias, promotor, 150.000 €: la app enseña 31.500,00 € de IVA y 184.048,71 € de total.
   * (El AJD de 1.125 € sí es correcto: el AJD se devenga también en Canarias.)
   */
  test('HALLAZGO 1 — Canarias con promotor no debe liquidar un IVA del 21 % ni cerrar un total completo', async ({ page }) => {
    await page.goto(RUTA);
    await page.selectOption('#select-ccaa', 'canarias');
    await page.getByRole('button', { name: /Promotor \/ Empresa/ }).click();
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
   * HALLAZGO 2 (contenido, medio) — el FAQPage del JSON-LD, que es justo lo que consumen Bing
   * Copilot, ChatGPT y Perplexity para grounding, afirma que el AJD va «entre el 0,5% y el
   * 1,5% según la comunidad autónoma», y la tabla comparativa del bloque educativo repite
   * «Sí (0,5%–1,5%)». El extremo alto acierta; el bajo lo desmiente la propia app en la misma
   * pantalla: `ITP_CCAA['pais-vasco'].ajd = 0` (régimen foral), su recuadro de comunidad
   * enseña «AJD 0%» y el simulador no pinta ninguna tarjeta de AJD allí.
   *
   * `RANGO_AJD` existe en `data/itp-ccaa.ts` precisamente para derivar este rango de la tabla
   * en vez de escribirlo a mano (= 0 a 1,5), y las hermanas garaje, trastero y nave industrial
   * ya lo usan. Es el mismo defecto que el hallazgo 2 de
   * `simulador-gastos-compraventa-terreno-rustico`, allí en su variante de rango de ITP.
   */
  test('HALLAZGO 2 — el FAQPage y la tabla educativa anuncian un AJD mínimo del 0,5 % que la propia app desmiente', async ({ page }) => {
    // El rango de verdad, derivado de la tabla: min = 0 (País Vasco), max = 1,5.
    expect(RANGO_AJD.min).toBe(0);
    expect(RANGO_AJD.max).toBe(1.5);

    await page.goto(RUTA);
    const bloques = await page.locator('script[type="application/ld+json"]').allTextContents();
    const faq = bloques.find((b) => b.includes('FAQPage')) ?? '';
    expect(faq).not.toBe('');
    expect(faq).not.toContain('entre el 0,5% y el 1,5%');

    // Y lo mismo en la tabla comparativa del bloque educativo (llega plegada: textContent).
    const cuerpo = (await page.locator('body').textContent()) ?? '';
    expect(cuerpo).not.toContain('0,5%–1,5%');
  });

  /**
   * HALLAZGO 3 (accesibilidad, bajo) — el `<label>¿Quién vende el solar?</label>` no tiene
   * `htmlFor` ni envuelve ningún control: es un texto suelto. Los dos botones que gobierna
   * («Un particular» / «Promotor / Empresa») no forman un grupo accesible (`role="group"` +
   * `aria-labelledby`), así que un lector de pantalla los anuncia sin decir de qué elección
   * forman parte — y aquí la elección es nada menos que el régimen fiscal (IVA o ITP).
   * Mismo defecto que el hallazgo 3 de `simulador-gastos-compraventa-terreno-rustico` y el 9
   * de `simulador-gastos-compraventa-nave-industrial`.
   */
  test('HALLAZGO 3 — el par de botones que elige el régimen fiscal no forma un grupo accesible', async ({ page }) => {
    await page.goto(RUTA);
    await expect(page.getByRole('group', { name: /Quién vende el solar/ })).toBeVisible();
  });

  /**
   * HALLAZGO 4 (operativa, bajo) — mientras el campo de gestoría tiene el foco, un importe
   * negativo se resta tal cual del total: con 80.000 € en Madrid y «-1000» sin salir del
   * campo, «Total gastos adicionales» baja a 4.511,96 € aunque las líneas visibles
   * (4.800 + 557,55 + 154,41) sumen 5.511,96 €, y la tarjeta de gestoría ni se pinta porque
   * la condición es `gastosGestoria > 0`. El `min={0}` de NumberInput solo actúa en el blur,
   * así que la cifra en pantalla es momentáneamente incoherente con su propio desglose. Es
   * defecto del componente compartido (mismo hallazgo 4 de la finca rústica y 8 de la nave
   * industrial), no propio de esta app.
   */
  test('HALLAZGO 4 — una gestoría negativa sin blur descuadra el total frente a sus líneas', async ({ page }) => {
    await page.goto(RUTA);
    await page.selectOption('#select-ccaa', 'madrid');
    await page.getByRole('button', { name: /Un particular/ }).click();
    await rellenar(page, PRECIO, '80000');

    const gestoria = page.locator('input[aria-label="' + GESTORIA + '"]');
    await gestoria.click();
    await gestoria.press('Control+a');
    await gestoria.pressSequentially('-1000');   // sin salir del campo
    // El total no debería aceptar un gasto negativo: 4.800 + 557,55 + 154,41 = 5.511,96 €
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('5511,96 €');
  });

  /**
   * HALLAZGO 5 (dato, bajo — GUARDIA) — la app deriva el tipo de IVA de `data/fiscal`
   * (`IVA_SOLAR = IVA_INMUEBLES_2025.local`) para CALCULAR, pero lo escribe a mano 19 veces
   * en los textos: hero, avisos, tabla educativa, FAQ visible, metadata y FAQPage del JSON-LD.
   * Hoy los dos coinciden (21 %), así que este test PASA: su valor es de guardia. El día que
   * `IVA_INMUEBLES_2025.local` se mueva en `data/fiscal` y los textos no, este test se pone
   * rojo y enseña la divergencia — que es exactamente lo que hoy no detecta nadie, y el
   * motivo por el que el hallazgo 163 hizo derivar la constante en todo el clúster.
   */
  test('HALLAZGO 5 (guardia) — el 21 % escrito en los textos sigue coincidiendo con data/fiscal', async ({ page }) => {
    const tipo = IVA_INMUEBLES_2025.local;   // 21

    await page.goto(RUTA);
    // El aviso de la compra a promotor solo se pinta con esa opción elegida (`esEmpresario`).
    await page.getByRole('button', { name: /Promotor \/ Empresa/ }).click();
    // El bloque educativo llega plegado, así que su texto está en el DOM pero no es visible:
    // `innerText` no lo devuelve y hay que leerlo con `textContent`.
    const cuerpo = (await page.locator('body').textContent()) ?? '';
    expect(cuerpo).toContain(`pagas IVA ${tipo}% + AJD`);
    expect(cuerpo).toContain(`el IVA del ${tipo}% es`);
    expect(cuerpo).toContain(`Paga IVA ${tipo}% + AJD`);

    const bloques = await page.locator('script[type="application/ld+json"]').allTextContents();
    const faq = bloques.find((b) => b.includes('FAQPage')) ?? '';
    expect(faq).toContain(`sujeta a IVA al ${tipo}%`);
  });
});
