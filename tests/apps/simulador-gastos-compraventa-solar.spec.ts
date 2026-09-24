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
import { PORCENTAJES_IVA } from '../../data/fiscal/iva';
import { ITP_CCAA, LIMITE_ARANCEL_NOTARIAL, RANGO_AJD_OTROS, RANGO_ITP_OTROS } from '../../data/itp-ccaa';
import { esperarHidratacion, sembrarValor, esperarValorEnReact } from './_hidratacion';

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

    await expect(page.getByText(/escala progresiva \(8 % → 9 % → 10 % → 12 % → 13 %\)/)).toBeVisible();
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
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('278.731,24 €');
    // 278.731,233801 / 2.500.000 = 11,1492494 % → «11,15%»
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toContain('11,15%');
    // Coste total = 2.500.000 + 278.731,233801 = 2.778.731,233801
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('2.778.731,24 €');
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
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('7495,20 €');
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('207.495,20 €');
  });

  /**
   * País Vasco, empresario: se liquida el IVA y el AJD foral del 0,5 %.
   *
   * ⚠️ 24/09/2026 (hallazgo 1592) — hasta ese día este test se llamaba «se liquida el IVA pero
   * NO se cobra AJD» y CONSAGRABA el defecto: `ITP_CCAA['pais-vasco'].ajd = 0` era la exención
   * foral de la primera transmisión de VIVIENDA (NF 18/1987 de Gipuzkoa, art. 41.I.B.11), y un
   * solar comprado a un promotor paga el 0,5 % (Gipuzkoa, NF 18/1987 art. 29.2; Bizkaia, NF
   * 1/2011 art. 44.1). El motor lo lleva ya: `ajd: 0.5`, `ajdVivienda: 0`.
   */
  test('País Vasco, empresario: se liquida el IVA y el AJD foral del 0,5 %', async ({ page }) => {
    expect(ITP_CCAA['pais-vasco'].ajd).toBe(0.5);
    await page.goto(RUTA);
    await page.selectOption('#select-ccaa', 'pais-vasco');
    await page.getByRole('button', { name: /Promotor \/ Empresa/ }).click();
    await rellenar(page, PRECIO, '100000');

    // AJD = 100.000 × 0,5 % = 500
    expect(await rotuloTarjeta(page, /^AJD \(/)).toBe('AJD (0,50%)');
    expect(await valorTarjeta(page, 'AJD (')).toBe('500,00 €');
    // El IVA, al 21 %: 100.000 × 21 % = 21.000
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
// REGRESIÓN de los hallazgos del 26/08/2026, REPARADOS ese mismo día.
// Estos tests se escribieron afirmando lo que DEBERÍA pasar, así que la reparación los
// puso en verde sin reescribirlos: son ya el contrato de que el defecto no vuelve.
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('Regresión — hallazgos reparados el 26/08/2026', () => {
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
  test('HALLAZGO 2 — el FAQPage y la tabla educativa derivan el rango de AJD del motor', async ({ page }) => {
    // ⚠️ 24/09/2026 (hallazgo 1592): este test fijaba `RANGO_AJD.min = 0` y prohibía el
    // «0,5%–1,5%» en la tabla, es decir, CONSAGRABA el 0 % vasco, que era la exención de la
    // primera VIVIENDA y no la de un solar (0,5 %, NF 18/1987 art. 29.2 y NF 1/2011 art. 44.1).
    // Lo que sigue valiendo del hallazgo 2 del 26/08 es que el rango se DERIVE, no el número:
    // ahora es el de lo que no es vivienda, 0,5 – 1,5.
    expect(RANGO_AJD_OTROS).toEqual({ min: 0.5, max: 1.5 });

    await page.goto(RUTA);
    const bloques = await page.locator('script[type="application/ld+json"]').allTextContents();
    const faq = bloques.find((b) => b.includes('FAQPage')) ?? '';
    expect(faq).not.toBe('');
    // El texto escrito a mano de antes («entre el 0,5% y el 1,5%») no vuelve; el derivado, sí.
    expect(faq).not.toContain('entre el 0,5% y el 1,5%');
    expect(faq).toContain('del 0,5% al 1,5%');
    expect(faq).not.toContain('el 0% del Régimen foral del País Vasco');

    // Y lo mismo en la tabla comparativa del bloque educativo (llega plegada: textContent).
    const cuerpo = (await page.locator('body').textContent()) ?? '';
    expect(cuerpo).toContain('Sí (0,5%–1,5%)');
    expect(cuerpo).not.toContain('Sí (0%–1,5%)');
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
    // Desde el 23/09/2026 (hallazgo 1275) la guardia compara con la constante con la que la app
    // CALCULA (`IVA_SOLAR = PORCENTAJES_IVA.general`, hallazgo 734), y no con la del local
    // comercial, que es la que vigilaba hasta entonces: el día que diverjan, vigilaba la equivocada.
    const tipo = PORCENTAJES_IVA.general;   // 21

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

// ═══════════════════════════════════════════════════════════════════════════════
// RE-INSPECCIÓN del 11/09/2026 — Aragón, tras reescribirse su ficha en data/itp-ccaa.ts
//
// POR QUÉ VUELVE A LA COLA
// ────────────────────────
// `7a02470c fix(fiscal): Aragón no tiene tipos reducidos de ITP, tiene bonificaciones en
// cuota` cambió el dato que esta app consume: la escala del art. 121-1 del Decreto
// Legislativo 1/2005 pasó de DOS tramos declarados a los CINCO reales (8 / 8,5 / 9 / 9,5 /
// 10 %), verificados contra el texto consolidado del BOE (BOA-d-2005-90006). Hasta ese
// commit, un solar de 500.000 € en Aragón liquidaba 42.000 € en vez de 40.750 €.
//
// DE DÓNDE SALE CADA CIFRA (ninguna de memoria)
// ────────────────────────────────────────────
//  - Escala de Aragón → `ITP_CCAA['aragon'].tramosProgresivos` en `data/itp-ccaa.ts`, cuyos
//    cuatro cortes de cuota acumulada (32.000 € a los 400.000 · 36.250 € a los 450.000 ·
//    40.750 € a los 500.000 · 64.500 € a los 750.000) sella `tests/itp-aragon.spec.ts`.
//    Por encima de 750.000 €, el exceso al 10 %: 1.000.000 € → 89.500 € (mismo fichero).
//  - AJD de Aragón → `ITP_CCAA['aragon'].ajd = 1.5`.
//  - IVA del solar → `IVA_INMUEBLES_2025.local = 21` (la app lo importa como `IVA_SOLAR`).
//  - Aranceles → `ARANCELES_NOTARIO` / `FACTURA_NOTARIAL` (RD 1426/1989) y
//    `ARANCELES_REGISTRO` + `REGISTRO_CONCEPTOS` (RD 1427/1989), con el 21 % de IVA dentro.
//  - Bonificación del 50 % de Ceuta y Melilla → art. 57 bis TRLITPAJD, en el motor.
//
// Los tres casos se resolvieron a mano ANTES de abrir el navegador, con un script de
// aritmética propio que NO llama al código de la app; el desarrollo va junto a cada
// aserción con los importes sin redondear.
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('Re-inspección 11/09/2026 — la escala de Aragón del art. 121-1', () => {
  /**
   * CASO 1 (NORMAL) — Aragón, vende un PARTICULAR, 500.000 €, gestoría 500 €.
   * Es el corte que el propio commit cita como el que estaba mal.
   *
   * ITP por tramos (art. 121-1, cuota acumulada):
   *   400.000 × 8 %   = 32.000
   *    50.000 × 8,5 % =  4.250   (400.000 → 450.000)
   *    50.000 × 9 %   =  4.500   (450.000 → 500.000)
   *                     ───────
   *                     40.750,00   → tipo EFECTIVO 40.750 / 500.000 = 8,15 %
   *   (la escala de dos tramos que había antes daba 42.000 €: 1.250 € de más)
   */
  test('CASO 1 (normal) — Aragón, particular, 500.000 €: 40.750 € y tipo efectivo 8,15 %', async ({ page }) => {
    await page.goto(RUTA);
    await page.selectOption('#select-ccaa', 'aragon');
    await page.getByRole('button', { name: /Un particular/ }).click();
    await rellenar(page, PRECIO, '500000');
    await rellenar(page, GESTORIA, '500');

    // Los cinco escalones se anuncian con formatTipoNominal (formato español: «8,5%», no «8.5%»)
    await expect(page.getByText(/escala progresiva \(8 % → 8,50 % → 9 % → 9,50 % → 10 %\)/)).toBeVisible();

    expect(await valorTarjeta(page, 'ITP (')).toBe('40.750,00 €');
    expect(await rotuloTarjeta(page, /^ITP \(/)).toBe('ITP (8,15%)');

    // Vende un particular → ni IVA ni AJD.
    await expect(page.locator('h3', { hasText: /^AJD/ })).toHaveCount(0);
    await expect(page.locator('h3', { hasText: /^IVA \(/ })).toHaveCount(0);

    // Notaría — RD 1426/1989, número 2 (ARANCELES_NOTARIO), arancel(500.000):
    //   tramo 1                                   →                          90,150000
    //   tramo 2 (0,45 %)  → 24.040,49 × 0,0045    =                         108,182205
    //   tramo 3 (0,15 %)  → 30.050,60 × 0,0015    =                          45,075900
    //   tramo 4 (0,10 %)  → 90.151,82 × 0,0010    =                          90,151820
    //   tramo 5 (0,05 %)  → 349.746,97 × 0,0005   =                         174,873485
    //   arancel sin IVA                           =                         508,433410
    //   con el 21 %       = × 1,21                =                         615,204426
    // FACTURA_NOTARIAL: ×1,5 = 922,806639 · ×2 = 1.230,408852 · medio = 1.076,607746
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('1076,61 €');
    const notaria = await descripcionTarjeta(page, 'Gastos de notaría');
    expect(notaria).toContain('922,81 €');
    expect(notaria).toContain('1230,41 €');

    // Registro — RD 1427/1989, número 2 (ARANCELES_REGISTRO), arancel(500.000):
    //   24,04 + 42,0708575 + 37,56325 + 67,613865 + 349.746,97 × 0,0003 = 104,924091
    //   suma = 276,2120635  (muy por debajo del tope REGISTRO_MAXIMO 2.181,67)
    //   + presentación 6,010121 + nota simple 3,005061 =            285,2272455
    //   con el 21 %  = × 1,21                          =            345,124967
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('345,12 €');
    expect(await valorTarjeta(page, 'Gastos de gestoría')).toBe('500,00 €');

    // Total gastos — `sumarLineasVisibles` redondea cada línea al céntimo ANTES de sumar:
    //   40.750,00 + 1.076,61 + 345,12 + 500,00 = 42.671,73
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('42.671,73 €');
    // 42.671,73 / 500.000 = 8,534346 % → «8,53%»
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toContain('8,53%');
    // Coste total = 500.000 + 42.671,73 = 542.671,73
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('542.671,73 €');
  });

  /**
   * CASO 2 (LÍMITE) — Aragón, vende un PARTICULAR, 1.000.000 €: se rebasa el último corte
   * de la escala (750.000 €) y el exceso entra en el tramo MÁS ALTO, el 10 %.
   *
   *   64.500 (cuota acumulada a los 750.000, sellada en tests/itp-aragon.spec.ts)
   * + 250.000 × 10 % = 25.000
   *   ───────
   *   89.500,00   → tipo EFECTIVO 89.500 / 1.000.000 = 8,95 %
   *
   * Un tipo plano del 8 % habría dado 80.000 €, y la escala de dos tramos anterior, 84.000 €.
   */
  test('CASO 2 (límite) — Aragón, particular, 1.000.000 €: el exceso sobre 750.000 € va al 10 %', async ({ page }) => {
    await page.goto(RUTA);
    await page.selectOption('#select-ccaa', 'aragon');
    await page.getByRole('button', { name: /Un particular/ }).click();
    await rellenar(page, PRECIO, '1000000');
    await rellenar(page, GESTORIA, '500');

    expect(await valorTarjeta(page, 'ITP (')).toBe('89.500,00 €');
    expect(await rotuloTarjeta(page, /^ITP \(/)).toBe('ITP (8,95%)');

    // Notaría — arancel(1.000.000):
    //   90,15 + 108,182205 + 45,0759 + 90,15182
    //   + tramo 5 (150.253,03 → 601.012,10, 0,05 %) → 450.759,07 × 0,0005 = 225,379535
    //   + tramo 6 (601.012,10 → 1.000.000, 0,03 %)  → 398.987,90 × 0,0003 = 119,696370
    //   arancel sin IVA = 678,635830 · con IVA = 821,149354
    //   ×1,5 = 1.231,724031 · ×2 = 1.642,298709 · medio = 1.437,011370
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('1437,01 €');

    // Registro — arancel(1.000.000):
    //   24,04 + 42,0708575 + 37,56325 + 67,613865
    //   + tramo 5 (0,030 %) → 450.759,07 × 0,0003 = 135,227721
    //   + tramo 6 (0,020 %) → 398.987,90 × 0,0002 =  79,797580
    //   suma = 386,3132735  (sigue bajo el tope 2.181,67)
    //   + 9,015182 = 395,3284555 · con el 21 % = 478,347431
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('478,35 €');

    // Total gastos = 89.500,00 + 1.437,01 + 478,35 + 500,00 = 91.915,36
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('91.915,36 €');
    // 91.915,36 / 1.000.000 = 9,191536 % → «9,19%»
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toContain('9,19%');
    // Coste total = 1.000.000 + 91.915,36 = 1.091.915,36
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('1.091.915,36 €');
  });

  /**
   * CASO 3 (RECHAZO) — en Aragón, que es la comunidad con escala: cero, negativo, dos
   * separadores decimales («2,5,3») y un número malformado («1.2.3») no pueden producir
   * ninguna cuota. `parseSpanishNumber` devuelve NaN en los dos últimos —una segunda coma
   * o un segundo punto que no agrupa millares no es un número— y la guarda
   * `!Number.isFinite(precio) || precio <= 0` corta antes de calcular nada.
   */
  test('CASO 3 (rechazo) — 0, negativo, «2,5,3» y «1.2.3» no liquidan ITP en Aragón', async ({ page }) => {
    await page.goto(RUTA);
    await page.selectOption('#select-ccaa', 'aragon');
    await page.getByRole('button', { name: /Un particular/ }).click();

    const campo = page.locator('input[aria-label="' + PRECIO + '"]');
    const marcador = page.getByText('Introduce el precio del solar para ver el desglose de gastos');

    for (const entrada of ['0', '-500', '2,5,3', '1.2.3', '']) {
      await campo.fill(entrada);
      await expect(marcador).toBeVisible();
      await expect(page.locator('h3', { hasText: /^ITP \(/ })).toHaveCount(0);
      await expect(page.locator('h3', { hasText: 'COSTE TOTAL' })).toHaveCount(0);
    }

    // Y ni un centinela de formatNumber/formatCurrency ante NaN en toda la página.
    const cuerpo = await page.locator('body').innerText();
    expect(cuerpo).not.toContain('NaN');
    expect(cuerpo).not.toContain('No definido');
    expect(cuerpo).not.toContain('∞');
  });

  /**
   * COMPROBACIÓN ADICIONAL — el otro régimen en la misma comunidad con escala. Vender un
   * promotor en Aragón no toca la escala: es IVA 21 % (IVA_INMUEBLES_2025.local) sobre el
   * precio, más AJD al 1,5 % (`ITP_CCAA['aragon'].ajd`), y ninguna tarjeta de ITP.
   *   IVA = 500.000 × 21 %  = 105.000,00
   *   AJD = 500.000 × 1,5 % =   7.500,00
   */
  test('Aragón con promotor: IVA 21 % + AJD 1,5 %, y la escala NO interviene', async ({ page }) => {
    await page.goto(RUTA);
    await page.selectOption('#select-ccaa', 'aragon');
    await page.getByRole('button', { name: /Promotor \/ Empresa/ }).click();
    await rellenar(page, PRECIO, '500000');

    expect(await rotuloTarjeta(page, /^IVA \(/)).toBe('IVA (21,00%)');
    expect(await valorTarjeta(page, 'IVA (')).toBe('105.000,00 €');
    expect(await rotuloTarjeta(page, /^AJD \(/)).toBe('AJD (1,50%)');
    expect(await valorTarjeta(page, 'AJD (')).toBe('7500,00 €');
    await expect(page.locator('h3', { hasText: /^ITP \(/ })).toHaveCount(0);
  });

  /**
   * COMPROBACIÓN ADICIONAL — Ceuta con promotor: allí no hay IVA (IPSI) y el AJD SÍ se
   * devenga, bonificado al 50 % por el art. 57 bis.1 del TRLITPAJD.
   *   AJD = 200.000 × 0,5 % = 1.000 · × 0,5 = 500,00 €
   */
  test('Ceuta con promotor: IPSI «No calculado» y AJD bonificado al 50 % (500 €)', async ({ page }) => {
    await page.goto(RUTA);
    await page.selectOption('#select-ccaa', 'ceuta');
    await page.getByRole('button', { name: /Promotor \/ Empresa/ }).click();
    await rellenar(page, PRECIO, '200000');

    expect(await valorTarjeta(page, 'IPSI')).toBe('No calculado');
    // Tipo EFECTIVO desde el 23/09/2026 (hallazgo 1269): 500 / 200.000 = 0,25 %. Hasta
    // entonces este caso exigía «AJD (0,50%)», el nominal sin bonificar, y consagraba el defecto.
    expect(await rotuloTarjeta(page, /^AJD \(/)).toBe('AJD (0,25%)');
    expect(await valorTarjeta(page, 'AJD (')).toBe('500,00 €');
    await expect(page.locator('h3', { hasText: /COSTE TOTAL \(PARCIAL\)/ })).toHaveCount(1);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// HALLAZGOS ABIERTOS de la re-inspección del 11/09/2026.
// Escritos afirmando lo que DEBERÍA pasar, así que HOY FALLAN a propósito; cuando se
// reparen quedan como test de regresión, igual que los del 26/08/2026 de arriba.
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('Hallazgos abiertos — re-inspección 11/09/2026', () => {
  /**
   * HALLAZGO A (contenido, medio) — EFECTO FAMILIA, INVERTIDO. Las cinco preguntas de la FAQ
   * VISIBLE afirman sin excepción que la compra a promotor «tributa por IVA al 21% más AJD»,
   * mientras la calculadora de esa misma página contesta «IGIC — No calculado» en Canarias y
   * «IPSI — No calculado» en Ceuta y Melilla (`TERRITORIOS_SIN_IVA`, data/itp-ccaa.ts).
   *
   * Lo llamativo es la dirección: aquí el `metadata.ts` SÍ lleva la excepción —su FAQPage,
   * pregunta 1, dice «En Canarias, Ceuta y Melilla no rige el IVA»— y quien se quedó atrás es
   * el texto visible, justo al revés que en `-garaje`, `-trastero` y `estimador-compraventa-
   * inmueble`. El texto visible de la app NO contiene «IGIC» ni «IPSI» en ninguna parte salvo
   * el aviso reactivo que solo aparece al elegir esos territorios; la hermana
   * `simulador-gastos-compraventa-garaje` sí lo dice en su FAQ visible (page.tsx:1111).
   */
  test('REPARADO 11/09 (731) — la FAQ visible ya recoge la excepción de IGIC/IPSI que su JSON-LD llevaba', async ({ page }) => {
    await page.goto(RUTA);

    // El JSON-LD ya lo dice: no es que el dato no esté decidido, es que no llegó a la página.
    const bloques = await page.locator('script[type="application/ld+json"]').allTextContents();
    const faqLd = bloques.find((b) => b.includes('FAQPage')) ?? '';
    expect(faqLd).toContain('IGIC');
    expect(faqLd).toContain('IPSI');

    // La FAQ visible (el bloque educativo llega plegado: se lee con textContent).
    const faqVisible = await page.evaluate(() => {
      const bloques: string[] = [];
      document.querySelectorAll('section h2').forEach((h) => {
        if (/Preguntas frecuentes/.test(h.textContent ?? '')) {
          bloques.push((h.parentElement?.textContent ?? '').replace(/\s+/g, ' ').trim());
        }
      });
      return bloques.join(' ');
    });
    expect(faqVisible).toContain('¿Se paga IVA o ITP al comprar un solar?');
    expect(faqVisible).toMatch(/IGIC|IPSI/);
  });

  /**
   * HALLAZGO B (contenido, medio) — el aviso «Compra a promotor o empresa: el IVA del 21 % es
   * deducible…» se pinta con la sola condición `esEmpresario` (page.tsx:248), sin mirar el
   * territorio. En Canarias, Ceuta y Melilla sale EN LA MISMA PANTALLA que
   * `<AvisoTerritorioSinIva>`, que dice literalmente «En Canarias no se aplica el IVA».
   *
   * Canarias + «Promotor / Empresa» + 150.000 €: la pantalla muestra los dos `role="note"`
   * a la vez, uno explicando cómo se deduce un IVA que el otro declara inexistente. La
   * tarjeta de resultado ya está bien desde el 26/08 («IGIC — No calculado»); lo que no se
   * condicionó fue este aviso.
   */
  test('REPARADO 11/09 (732) — en Canarias ya no se explica cómo deducir un IVA que no se devenga', async ({ page }) => {
    await page.goto(RUTA);
    await page.selectOption('#select-ccaa', 'canarias');
    await page.getByRole('button', { name: /Promotor \/ Empresa/ }).click();
    await rellenar(page, PRECIO, '150000');

    // Lo que ya acierta y debe seguir: la tarjeta no inventa IVA.
    expect(await valorTarjeta(page, 'IGIC')).toBe('No calculado');
    await expect(page.getByText('no se aplica el IVA')).toBeVisible();

    // Lo que falla: el aviso del 21 % deducible no debería salir donde no hay IVA.
    await expect(page.getByText(/el IVA del 21% es/)).toHaveCount(0);
  });

  /**
   * HALLAZGO C (accesibilidad, medio) — el azul de marca `--primary` (#2E86AB) se usa como
   * color de TEXTO en `.sectionTitle`, `.infoCcaaNombre`, `.infoCcaaValue`, `.catastroLink` y
   * `.transmisionBtn.active`. Medido en el navegador, en modo claro:
   *     #2E86AB sobre #FFFFFF (blanco)            → 4,11:1
   *     #2E86AB sobre #FAFAFA (tarjeta de CCAA)   → 3,93:1
   *     #2E86AB sobre #EEF6F9 (botón activo)      → 3,75:1
   * Los tres por debajo del 4,5:1 que exige WCAG 2.1 AA para texto normal. Para esto existe
   * `--primary-texto` (#26718F, 5,47:1 sobre blanco), declarado en `app/globals.css` con ese
   * motivo escrito en el propio comentario. En oscuro NO ocurre: allí `--primary` y
   * `--primary-texto` son el mismo #3FA5D1.
   */
  test('REPARADO 11/09 (733) — el texto usa --primary-texto y llega al 4,5:1 de WCAG AA', async ({ page }) => {
    await page.goto(RUTA);

    const medida = await page.evaluate(() => {
      const rgb = (s: string) => (s.match(/\d+/g) ?? []).slice(0, 3).map(Number) as [number, number, number];
      const lum = ([r, g, b]: [number, number, number]) => {
        const f = (v: number) => (v / 255 <= 0.03928 ? v / 255 / 12.92 : Math.pow((v / 255 + 0.055) / 1.055, 2.4));
        return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
      };
      // Fondo efectivo: se sube por los ancestros hasta encontrar uno no transparente.
      const fondo = (el: Element): [number, number, number] => {
        let n: Element | null = el;
        while (n) {
          const c = getComputedStyle(n).backgroundColor;
          if (c && !/rgba\(0, 0, 0, 0\)|transparent/.test(c)) return rgb(c);
          n = n.parentElement;
        }
        return [255, 255, 255];
      };
      const out: Record<string, number> = {};
      for (const sel of ['[class*="infoCcaaValue"]', '[class*="infoCcaaNombre"]', '[class*="catastroLink"]', '[class*="sectionTitle"]']) {
        const el = document.querySelector(sel);
        if (!el) continue;
        const [a, b] = [lum(rgb(getComputedStyle(el).color)), lum(fondo(el))].sort((x, y) => y - x);
        out[sel] = Math.round(((a + 0.05) / (b + 0.05)) * 100) / 100;
      }
      return out;
    });

    // Medido hoy con este mismo cálculo: los cuatro dan 4,11:1 (el fondo efectivo que
    // encuentra el ascenso por ancestros es el blanco de `.infoCcaaItem` / `.formPanel`).
    // Sobre el #FAFAFA de la tarjeta de comunidad baja a 3,93:1 y en el botón activo a 3,75:1.
    for (const [selector, contraste] of Object.entries(medida)) {
      expect(contraste, `${selector} da ${contraste}:1`).toBeGreaterThanOrEqual(4.5);
    }
  });

  /**
   * HALLAZGO D (dato, bajo) — el tipo de IVA del solar se deriva de
   * `IVA_INMUEBLES_2025.local`, que en `data/fiscal/inmuebles.ts:91` está documentado como
   * «IVA local comercial». Un solar no es un local: lo que le corresponde es el tipo GENERAL
   * del art. 90 LIVA, que el repositorio ya tiene sellado aparte en `PORCENTAJES_IVA.general`
   * (`data/fiscal/iva.ts:66`). Hoy ambos valen 21, así que el importe que sale en pantalla es
   * el correcto y este test PASA: su valor es de guardia.
   *
   * El riesgo es el que documenta el hallazgo 641 citado en ese mismo fichero a propósito de
   * `garageCon`: dos constantes para un único dato existen separadas precisamente para poder
   * divergir. El día que se mueva el tipo del local comercial y no el general, el solar
   * seguirá al equivocado y este test se pondrá rojo enseñando por qué.
   */
  test('REPARADO 11/09 (734) — el IVA del solar sale del tipo general del art. 90 LIVA, no de la del LOCAL', async () => {
    expect(IVA_INMUEBLES_2025.local).toBe(PORCENTAJES_IVA.general);
  });
});

// ✅ REPARADO 11/09/2026 (medio) — contenido. EL EFECTO FAMILIA, INVERTIDO.
// Aquí el punto ciego era el contrario al de las hermanas: el FAQPage de metadata.ts SÍ
// llevaba la excepción territorial desde el origen («En Canarias, Ceuta y Melilla no rige el
// IVA: la operación tributa por IGIC o IPSI») y lo que nunca llegó fue el TEXTO VISIBLE. Las
// palabras IGIC e IPSI no aparecían en ningún texto estático de page.tsx: solo salían en el
// aviso reactivo <AvisoTerritorioSinIva>, que exige haber elegido ya ese territorio, de modo
// que quien leía la página en Madrid se llevaba una regla sin excepciones.
// Caso: abrir la página SIN tocar nada y leer la FAQ «¿Se paga IVA o ITP al comprar un solar?»
//       → antes: «tributa por IVA al 21% más AJD», con 0 apariciones de IGIC o IPSI en todo
//         el texto visible (y 1 de cada una en el JSON-LD)
//       → ahora: la misma excepción que ya publicaba el JSON-LD, también en pantalla.
test('REPARADO 11/09 (contenido) — la FAQ visible recoge la excepción que el JSON-LD ya publicaba', async ({
  page,
}) => {
  await page.goto(RUTA);

  // La FAQ visible, sin haber elegido territorio: la regla general con su excepción.
  const respuesta = page
    .locator('strong', { hasText: '¿Se paga IVA o ITP al comprar un solar?' })
    .locator('xpath=following-sibling::p[1]');
  expect(await respuesta.innerText()).toMatch(/IGIC|IPSI/);

  // Y el recuadro de cabecera, que es donde el visitante lee la regla antes de calcular.
  const cuerpo = await page.locator('body').innerText();
  expect(cuerpo).toContain('IGIC');
  expect(cuerpo).toContain('IPSI');

  // El JSON-LD servido seguía siendo el canal bueno: sigue siéndolo.
  const jsonLd = (await page.locator('script[type="application/ld+json"]').allTextContents()).join(' ');
  expect(jsonLd).toContain('IGIC');
});

// ═══════════════════════════════════════════════════════════════════════════════
// RE-INSPECCIÓN del 23/09/2026 — como app de FAMILIA (compraventa, grupo B)
//
// POR QUÉ VUELVE A LA COLA
// ────────────────────────
// Dos reparaciones en lote la tocaron: `cfe091a7` (la gestoría ilegible se nombra en las
// siete hermanas y el total dice en qué dirección falta) y `8d7dcd1b` (con el precio ilegible,
// el marcador dice que no se ha podido leer en vez de «Introduce el precio»). Su guarda está
// escrita INLINE, sin helper `esLegible`: aquí se mide el comportamiento, no el nombre.
//
// El testigo `tests/familias/compraventa.spec.ts` ya mide el invariante del ilegible sobre el
// COSTE TOTAL (Madrid, particular, 120.000 €): esto no lo repite. Mira lo que él no ve —las
// otras tarjetas, los otros regímenes, los otros territorios— y lo que SOLO existe en solar.
//
// DE DÓNDE SALE CADA CIFRA (ninguna de memoria; resueltas con un script propio que NO llama
// al código de la app, antes de abrir el navegador)
// ────────────────────────────────────────────
//  - IVA del solar → `PORCENTAJES_IVA.general = 21` (data/fiscal/iva.ts), que es de donde lo
//    deriva la app desde el hallazgo 734.
//  - AJD → `ITP_CCAA['andalucia'].ajd = 1.2` y `ITP_CCAA['melilla'].ajd = 0.5` (data/itp-ccaa.ts);
//    en Melilla, bonificado al 50 % por el art. 57 bis.1 TRLITPAJD (`aplicarBonificacionCiudad`).
//  - Escala de Cataluña → `ITP_CCAA['cataluna'].tramosProgresivos` = 10 % hasta 600.000,
//    11 % hasta 900.000, 12 % hasta 1.500.000 y 13 % por encima (data/itp-ccaa.ts).
//  - Aranceles → `ARANCELES_NOTARIO` / `FACTURA_NOTARIAL` (RD 1426/1989, horquilla ×1,5-×2,
//    punto medio ×1,75) y `ARANCELES_REGISTRO` + `REGISTRO_CONCEPTOS` (RD 1427/1989), con el
//    21 % de IVA dentro. `sumarLineasVisibles` redondea cada línea al céntimo antes de sumar.
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('Re-inspección 23/09/2026 — familia compraventa (grupo B)', () => {
  const SEL_PRECIO = `input[aria-label="${PRECIO}"]`;
  const SEL_GESTORIA = `input[aria-label="${GESTORIA}"]`;
  const MARCADOR_VACIO = 'Introduce el precio del solar para ver el desglose de gastos';

  const valor = (page: Page, titulo: string | RegExp) =>
    page.locator('h3', { hasText: titulo }).first().locator('xpath=../following-sibling::div[1]/p');
  const descripcion = (page: Page, titulo: string | RegExp) =>
    page.locator('h3', { hasText: titulo }).first().locator('xpath=../following-sibling::p[1]');
  const rotulo = (page: Page, titulo: RegExp) => page.locator('h3', { hasText: titulo }).first();
  /** El marcador de posición del panel de resultados (y no el anunciador de rutas de Next). */
  const marcador = (page: Page) => page.locator('[class*="placeholder"] p');

  async function abrir(page: Page, ccaa: string, vende: 'particular' | 'promotor'): Promise<void> {
    await page.goto(RUTA);
    await esperarHidratacion(page, [SEL_PRECIO, SEL_GESTORIA]);
    await page.selectOption('#select-ccaa', ccaa);
    await page
      .getByRole('button', { name: vende === 'particular' ? /Un particular/ : /Promotor \/ Empresa/ })
      .click();
  }

  /**
   * CASO 1 (NORMAL) — Andalucía, vende un PROMOTOR, 180.000 €, gestoría 650 €.
   * Es el régimen ORDINARIO de comprar un solar a quien lo urbaniza, en una comunidad cuyo AJD
   * (1,2 %) no había probado ninguna vuelta anterior.
   *   IVA = 180.000 × 21 %  = 37.800,00   (PORCENTAJES_IVA.general)
   *   AJD = 180.000 × 1,2 % =  2.160,00   (ITP_CCAA['andalucia'].ajd)
   *   notaría: 90,15 + 108,182205 + 45,0759 + 90,15182 + 29.746,97 × 0,05 % (14,873485)
   *            = 348,43341 · con IVA 421,604426 · ×1,5 = 632,406639 · ×2 = 843,208852
   *            · medio = 737,807746
   *   registro: 24,04 + 42,0708575 + 37,56325 + 67,613865 + 29.746,97 × 0,03 % (8,924091)
   *            = 180,2120635 + 9,015182 = 189,2272455 · con IVA = 228,964967
   *   total = 37.800,00 + 2.160,00 + 737,81 + 228,96 + 650,00 = 41.576,77 (23,0982 %)
   *   coste total = 221.576,77
   */
  test('CASO 1 (normal) — Andalucía, promotor, 180.000 €: IVA 37.800 € + AJD 1,2 %', async ({ page }) => {
    await abrir(page, 'andalucia', 'promotor');
    await sembrarValor(page, SEL_PRECIO, '180000');
    await sembrarValor(page, SEL_GESTORIA, '650');

    await expect(rotulo(page, /^IVA \(/)).toHaveText('IVA (21,00%)');
    await expect(valor(page, 'IVA (')).toHaveText('37.800,00 €');
    await expect(rotulo(page, /^AJD \(/)).toHaveText('AJD (1,20%)');
    await expect(valor(page, 'AJD (')).toHaveText('2160,00 €');
    await expect(page.locator('h3', { hasText: /^ITP \(/ })).toHaveCount(0);

    await expect(valor(page, 'Gastos de notaría')).toHaveText('737,81 €');
    await expect(descripcion(page, 'Gastos de notaría')).toContainText('632,41 €');
    await expect(descripcion(page, 'Gastos de notaría')).toContainText('843,21 €');
    await expect(valor(page, 'Registro de la Propiedad')).toHaveText('228,96 €');
    await expect(valor(page, 'Gastos de gestoría')).toHaveText('650,00 €');

    await expect(valor(page, 'Total gastos adicionales')).toHaveText('41.576,77 €');
    await expect(descripcion(page, 'Total gastos adicionales')).toContainText('23,10%');
    await expect(valor(page, 'COSTE TOTAL DE ADQUISICIÓN')).toHaveText('221.576,77 €');
    await expect(descripcion(page, 'COSTE TOTAL DE ADQUISICIÓN')).toHaveText(
      'Precio + todos los gastos (antes de deducir el IVA si tienes derecho)',
    );
  });

  /**
   * CASO 2 (LÍMITE) — Cataluña, vende un PARTICULAR, 2.000.000 €, gestoría 650 €.
   * La escala de cuatro tramos de Cataluña llevada hasta el MÁS ALTO (13 %), que ninguna vuelta
   * anterior de esta app había alcanzado (se probó el 13 % de Baleares, con otros cortes).
   *     600.000 × 10 % =  60.000
   *     300.000 × 11 % =  33.000   (600.000 → 900.000)
   *     600.000 × 12 % =  72.000   (900.000 → 1.500.000)
   *     500.000 × 13 % =  65.000   (1.500.000 → 2.000.000)
   *                      ───────
   *                      230.000,00 → tipo EFECTIVO 11,50 % (un 10 % plano habría dado 200.000)
   *   notaría: 90,15 + 108,182205 + 45,0759 + 90,15182 + 225,379535
   *            + 1.398.987,90 × 0,03 % (419,69637) = 978,63583 · con IVA 1.184,149354
   *            · ×1,5 = 1.776,224031 · ×2 = 2.368,298709 · medio = 2.072,261370
   *   registro: 24,04 + 42,0708575 + 37,56325 + 67,613865 + 135,227721
   *            + 1.398.987,90 × 0,02 % (279,79758) = 586,3132735 (bajo el tope 2.181,67)
   *            + 9,015182 = 595,3284555 · con IVA = 720,347431
   *   total = 230.000,00 + 2.072,26 + 720,35 + 650,00 = 233.442,61 (11,6721 %)
   *   coste total = 2.233.442,61
   */
  test('CASO 2 (límite) — Cataluña, particular, 2.000.000 €: el exceso sobre 1,5 M va al 13 %', async ({ page }) => {
    await abrir(page, 'cataluna', 'particular');
    await sembrarValor(page, SEL_PRECIO, '2000000');
    await sembrarValor(page, SEL_GESTORIA, '650');

    await expect(page.getByText(/escala progresiva \(10 % → 11 % → 12 % → 13 %\)/)).toBeVisible();
    await expect(rotulo(page, /^ITP \(/)).toHaveText('ITP (11,50%)');
    await expect(valor(page, 'ITP (')).toHaveText('230.000,00 €');
    await expect(page.locator('h3', { hasText: /^AJD/ })).toHaveCount(0);

    await expect(valor(page, 'Gastos de notaría')).toHaveText('2072,26 €');
    await expect(descripcion(page, 'Gastos de notaría')).toContainText('1776,22 €');
    await expect(descripcion(page, 'Gastos de notaría')).toContainText('2368,30 €');
    await expect(valor(page, 'Registro de la Propiedad')).toHaveText('720,35 €');
    await expect(valor(page, 'Total gastos adicionales')).toHaveText('233.442,61 €');
    await expect(descripcion(page, 'Total gastos adicionales')).toContainText('11,67%');
    await expect(valor(page, 'COSTE TOTAL DE ADQUISICIÓN')).toHaveText('2.233.442,61 €');
  });

  /**
   * CASO 3 (RECHAZO) — los TRES estados del precio que no dan cifra, que `8d7dcd1b` separó:
   *   VACÍO    → «Introduce el precio…»
   *   ILEGIBLE → «No se ha podido leer el precio «2.000.50»…» (el caso literal del commit)
   *   CERO / NEGATIVO → «Introduce el precio…»; el negativo, además, el blur lo acota a «0»
   *              (NumberInput con min={0}), así que nunca queda escrito un precio imposible.
   * Y los dos importes ilegibles a la vez: el panel sigue en el marcador, nombra el precio y no
   * aparece ni una cifra, ni un NaN, ni un «No definido».
   */
  test('CASO 3 (rechazo) — vacío, ilegible, cero, negativo y los dos importes ilegibles a la vez', async ({ page }) => {
    await abrir(page, 'melilla', 'promotor');
    await expect(marcador(page)).toHaveText(MARCADOR_VACIO);

    await sembrarValor(page, SEL_PRECIO, '2.000.50');
    await expect(page.locator(SEL_PRECIO)).toHaveValue('2.000.50');
    await expect(marcador(page)).toContainText('No se ha podido leer el precio «2.000.50»');
    await expect(page.locator('h3', { hasText: 'COSTE TOTAL' })).toHaveCount(0);

    await sembrarValor(page, SEL_PRECIO, '0');
    await expect(marcador(page)).toHaveText(MARCADOR_VACIO);

    await sembrarValor(page, SEL_PRECIO, '-120000');
    await expect(marcador(page)).toHaveText(MARCADOR_VACIO);
    await expect(page.locator('h3', { hasText: 'COSTE TOTAL' })).toHaveCount(0);
    await page.locator(SEL_PRECIO).focus();
    await page.locator(SEL_PRECIO).blur();
    await esperarValorEnReact(page, SEL_PRECIO, '0');
    await expect(marcador(page)).toHaveText(MARCADOR_VACIO);

    await sembrarValor(page, SEL_PRECIO, '2.000.50');
    await sembrarValor(page, SEL_GESTORIA, '1.2.3');
    await expect(marcador(page)).toContainText('No se ha podido leer el precio «2.000.50»');
    await expect(page.locator('h3', { hasText: /^(IPSI|AJD|COSTE TOTAL|Gastos de gestoría)/ })).toHaveCount(0);

    await sembrarValor(page, SEL_PRECIO, '');
    await expect(marcador(page)).toHaveText(MARCADOR_VACIO);

    const cuerpo = await page.locator('body').innerText();
    expect(cuerpo).not.toContain('NaN');
    expect(cuerpo).not.toContain('No definido');
    expect(cuerpo).not.toContain('∞');
  });

  /**
   * Efectos colaterales de `cfe091a7` — lo que SÍ está bien y debe seguir así. La gestoría
   * ilegible (500 → «2.000.50») en Madrid con particular, 300.000 €:
   *   ITP = 300.000 × 6 % = 18.000 · notaría 864,86 · registro 272,52 (desarrollo en el caso de
   *   Madrid 300.000 € de la inspección del 26/08)
   *   total SIN gestoría = 18.000,00 + 864,86 + 272,52 = 19.137,38 · coste = 319.137,38
   * El aviso sobrevive a cambiar de régimen y de comunidad (el dato sigue sin leerse), se va al
   * volver a ser legible, y ni el 0 ni el vacío lo disparan (son datos, no ilegibles).
   * Canarias con promotor, con el IGIC y la gestoría faltando a la vez, junta las dos omisiones
   * en una sola frase bien concordada.
   */
  test('cfe091a7 — el aviso de la gestoría ilegible sigue al dato, no al régimen ni a la comunidad', async ({ page }) => {
    await abrir(page, 'madrid', 'particular');
    await sembrarValor(page, SEL_PRECIO, '300000');
    await sembrarValor(page, SEL_GESTORIA, '2.000.50');

    await expect(valor(page, 'Gastos de gestoría')).toHaveText('Sin leer');
    await expect(valor(page, 'Total gastos adicionales')).toHaveText('19.137,38 €');
    await expect(descripcion(page, 'Total gastos adicionales')).toContainText('SIN la gestoría, que no se ha podido leer');
    // 24/09/2026 (hallazgo 1595): el título es PARCIAL, como cuando falta el IGIC. Hasta ese día
    // este test leía la tarjeta por «COSTE TOTAL DE ADQUISICIÓN», el título de una cifra
    // definitiva, y así consagraba el defecto.
    await expect(rotulo(page, /^Total gastos adicionales/)).toHaveText('Total gastos adicionales (parcial)');
    await expect(rotulo(page, /^COSTE TOTAL/)).toHaveText('COSTE TOTAL (PARCIAL)');
    await expect(valor(page, /^COSTE TOTAL/)).toHaveText('319.137,38 €');
    await expect(descripcion(page, /^COSTE TOTAL/)).toHaveText(
      'No incluye la gestoría, que no se ha podido leer: el coste real será mayor',
    );

    // Cambiar de comunidad y de régimen NO lo borra: el dato sigue sin leerse.
    await page.selectOption('#select-ccaa', 'canarias');
    await page.getByRole('button', { name: /Promotor \/ Empresa/ }).click();
    await expect(valor(page, 'IGIC')).toHaveText('No calculado');
    await expect(valor(page, 'Gastos de gestoría')).toHaveText('Sin leer');
    await expect(rotulo(page, /^COSTE TOTAL/)).toHaveText('COSTE TOTAL (PARCIAL)');
    await expect(descripcion(page, /^COSTE TOTAL/)).toHaveText(
      'No incluye el IGIC ni la gestoría, que no se ha podido leer: el coste real será mayor',
    );

    // Legible otra vez: el aviso de la gestoría se va y queda solo el del IGIC.
    await sembrarValor(page, SEL_GESTORIA, '500');
    // 24/09/2026: «puede ser mayor» y no «será»: el IGIC tiene tipo cero (viviendas protegidas
    // con garaje y anexos, equipamiento comunitario; Ley canaria 4/2012, arts. 52 y 58) y el
    // IPSI depende de la ordenanza de cada ciudad. Solo la gestoría ilegible autoriza el «será».
    await expect(descripcion(page, /^COSTE TOTAL/)).toHaveText('No incluye el IGIC: el coste real puede ser mayor');

    // Cero y vacío son datos, no ilegibles: sin tarjeta de gestoría y sin aviso.
    for (const v of ['0', '']) {
      await sembrarValor(page, SEL_GESTORIA, v);
      await expect(page.locator('h3', { hasText: 'Gastos de gestoría' })).toHaveCount(0);
      await expect(descripcion(page, 'Total gastos adicionales')).not.toContainText('gestoría');
    }
  });

  // ─── HALLAZGOS del 23/09/2026 (1269-1275), REPARADOS el mismo día ────────────
  // Se escribieron afirmando lo que DEBÍA pasar y fallaban en su ÚLTIMA aserción; reparados,
  // se quedan como regresión. Lo anterior a esa aserción es la preparación del caso.

  /**
   * HALLAZGO 23/09-A (cálculo, medio) — el rótulo del AJD publica el tipo NOMINAL sin
   * bonificar mientras el importe de al lado va bonificado: en Melilla dice «AJD (0,50%)» y
   * cobra el 0,25 %. Las otras SEIS hermanas lo repararon el 13/09 (hallazgos 447 y 802, «el
   * rótulo del AJD lleva el tipo efectivo»); solar se quedó fuera y es la única que sigue
   * rotulando con `datosCcaaActual.ajd`. La tarjeta del ITP de esta misma app ya lleva el
   * efectivo (Ceuta, «ITP (3,00%)»).
   *   AJD = 240.000 × 0,5 % × (1 − 0,5) = 600,00 € → efectivo 600 / 240.000 = 0,25 %
   * ⚠️ Al repararlo, el caso «Ceuta con promotor» del 11/09 (que exige «AJD (0,50%)» con 500 €
   * sobre 200.000 €, o sea un 0,25 %) consagra el defecto y tendrá que reescribirse.
   */
  test('REPARADO 23/09 (1269, antes 23/09-A) — en Melilla el rótulo del AJD dice 0,50 % y el importe es el 0,25 %', async ({ page }) => {
    await abrir(page, 'melilla', 'promotor');
    await sembrarValor(page, SEL_PRECIO, '240000');

    await expect(valor(page, 'IPSI')).toHaveText('No calculado');
    await expect(valor(page, 'AJD (')).toHaveText('600,00 €');
    await expect(rotulo(page, /^AJD \(/)).toHaveText('AJD (0,25%)');
  });

  /**
   * HALLAZGO 23/09-B (contenido, medio) — en Canarias, Ceuta y Melilla el botón del régimen
   * sigue prometiendo «Paga IVA 21% + AJD» y la ficha de la comunidad «IVA (empresario) 21%»,
   * en la misma pantalla en la que <AvisoTerritorioSinIva> dice «no se aplica el IVA» y la
   * tarjeta de resultado «IPSI — No calculado». Es el hallazgo 803 («ni el botón ni el recuadro
   * prometen un IVA en Canarias, Ceuta y Melilla») y el 725 de nave-industrial: reparado el
   * 13/09 en terreno-rústico, nave-industrial y local-comercial, no en solar.
   */
  test('REPARADO 23/09 (1270, antes 23/09-B) — en Ceuta el botón y la ficha de la comunidad siguen prometiendo IVA del 21 %', async ({ page }) => {
    await abrir(page, 'ceuta', 'promotor');
    await sembrarValor(page, SEL_PRECIO, '200000');

    await expect(page.getByText('no se aplica el IVA')).toBeVisible();
    await expect(valor(page, 'IPSI')).toHaveText('No calculado');

    const ficha = (await page.locator('[class*="infoCcaaGrid"]').innerText()).replace(/\s+/g, ' ');
    const boton = (await page.getByRole('button', { name: /Promotor \/ Empresa/ }).innerText()).replace(/\s+/g, ' ');
    expect(`${boton} · ${ficha}`).not.toMatch(/IVA[^·]*21\s?%/);
    // Reparado (1270) con la forma de terreno-rústico, nave-industrial y local-comercial:
    // el botón nombra el impuesto que sí rige y la ficha lo da por no calculado.
    expect(boton).toContain('Paga IPSI + AJD');
    expect(ficha).toContain('IPSI (empresario) No calculado');

    // Y fuera de esos territorios sigue anunciando el IVA, con el tipo de data/fiscal.
    await page.selectOption('#select-ccaa', 'madrid');
    await expect(page.getByRole('button', { name: /Promotor \/ Empresa/ })).toContainText(
      `Paga IVA ${PORCENTAJES_IVA.general}% + AJD`,
    );
    await expect(page.locator('[class*="infoCcaaGrid"]')).toContainText(`${PORCENTAJES_IVA.general}%`);
  });

  /**
   * HALLAZGO 23/09-C (contenido, bajo) — en Canarias, Ceuta y Melilla con promotor el cierre
   * se rotula «COSTE TOTAL (PARCIAL)», pero la tarjeta de encima sigue titulándose «Total
   * gastos adicionales», a secas, con el mismo IGIC/IPSI fuera. `d787b81b` puso «Total gastos
   * adicionales (parcial)» en estimador, garaje, trastero y local-comercial (nave ya lo tenía):
   * solar y terreno-rústico se quedaron fuera. La descripción sí dice «SIN el IPSI».
   */
  test('REPARADO 23/09 (1271, antes 23/09-C) — con el IPSI sin calcular, «Total gastos adicionales» no se rotula parcial', async ({ page }) => {
    await abrir(page, 'melilla', 'promotor');
    await sembrarValor(page, SEL_PRECIO, '240000');

    await expect(rotulo(page, /^COSTE TOTAL/)).toHaveText('COSTE TOTAL (PARCIAL)');
    await expect(descripcion(page, 'Total gastos adicionales')).toContainText('SIN el IPSI');
    await expect(rotulo(page, /^Total gastos adicionales/)).toHaveText('Total gastos adicionales (parcial)');
  });

  /**
   * HALLAZGO 23/09-D (contenido, bajo) — efecto colateral de `cfe091a7`, solo posible en el
   * régimen de IVA. Con la gestoría legible, el cierre dice «Precio + todos los gastos (antes
   * de deducir el IVA si tienes derecho)»; con la gestoría ILEGIBLE, el aviso nuevo SUSTITUYE a
   * esa salvedad en vez de sumarse: «No incluye la gestoría…: el coste real será mayor». Para
   * quien deduce los 63.000 € de IVA (la tarjeta del IVA dice que es deducible) el coste real
   * queda por DEBAJO de la cifra publicada, no por encima. Madrid, promotor, 300.000 €:
   *   IVA 63.000,00 + AJD 2.250,00 + notaría 864,86 + registro 272,52 (desarrollo en el caso
   *   de Madrid 300.000 € del 26/08)
   *   con gestoría 400 → total 66.787,38 · coste 366.787,38
   *   con «2.000.50»   → total 66.387,38 · coste 366.387,38 (−400, la gestoría fuera)
   */
  test('REPARADO 23/09 (1272, antes 23/09-D) — con la gestoría ilegible el cierre pierde la salvedad del IVA deducible', async ({ page }) => {
    await abrir(page, 'madrid', 'promotor');
    await sembrarValor(page, SEL_PRECIO, '300000');
    await sembrarValor(page, SEL_GESTORIA, '400');

    await expect(valor(page, 'COSTE TOTAL DE ADQUISICIÓN')).toHaveText('366.787,38 €');
    await expect(descripcion(page, 'COSTE TOTAL DE ADQUISICIÓN')).toContainText('antes de deducir el IVA');

    await sembrarValor(page, SEL_GESTORIA, '2.000.50');
    // 24/09/2026 (hallazgo 1595): con la gestoría ilegible la tarjeta se titula «(PARCIAL)» y se
    // lee por «COSTE TOTAL»; hasta ese día se leía por el título de la cifra definitiva.
    await expect(rotulo(page, /^COSTE TOTAL/)).toHaveText('COSTE TOTAL (PARCIAL)');
    await expect(valor(page, /^COSTE TOTAL/)).toHaveText('366.387,38 €');
    await expect(descripcion(page, /^COSTE TOTAL/)).toContainText('No incluye la gestoría');
    await expect(descripcion(page, /^COSTE TOTAL/)).toContainText('deducir el IVA');
    // Reparado (1272): el aviso se SUMA a la salvedad, en una sola frase.
    await expect(descripcion(page, /^COSTE TOTAL/)).toHaveText(
      'No incluye la gestoría, que no se ha podido leer: el coste real será mayor (precio + gastos antes de deducir el IVA si tienes derecho)',
    );

    // Con un particular no hay IVA que deducir: el aviso queda solo, sin la salvedad.
    await page.getByRole('button', { name: /Un particular/ }).click();
    await expect(descripcion(page, /^COSTE TOTAL/)).toHaveText(
      'No incluye la gestoría, que no se ha podido leer: el coste real será mayor',
    );
  });

  /**
   * HALLAZGO 23/09-E (contenido, medio) — la ayuda del ÚNICO campo de precio manda escribir
   * «Precio escriturado o valor de referencia catastral (el mayor de ambos)» también cuando
   * vende un promotor, mientras la FAQ de la misma página dice «El IVA se calcula sobre el
   * precio pactado; el ITP, sobre el valor de referencia… el que sea mayor» (base imponible del
   * IVA = la contraprestación, Ley 37/1992, que cita FISCAL_INMUEBLES_META). Quien sigue la
   * ayuda con un solar pactado en 120.000 € y valor de referencia de 150.000 € recibe un IVA de
   * 150.000 × 21 % = 31.500 € en vez de 120.000 × 21 % = 25.200 €: 6.300 € de más. En solar
   * el IVA es el régimen ORDINARIO de comprar a un promotor. (Misma ayuda, estática, en garaje,
   * trastero y estimador, que también tienen un régimen de IVA.)
   */
  test('REPARADO 23/09 (1273, antes 23/09-E) — con promotor, la ayuda del precio manda meter el valor de referencia que el IVA no usa', async ({ page }) => {
    await abrir(page, 'madrid', 'promotor');
    await sembrarValor(page, SEL_PRECIO, '150000');
    await expect(valor(page, 'IVA (')).toHaveText('31.500,00 €');

    // La FAQ de la página (llega plegada: se lee con textContent).
    const faq = page
      .locator('strong', { hasText: '¿Sobre qué valor se calcula el impuesto de un solar?' })
      .locator('xpath=following-sibling::p[1]');
    expect(((await faq.textContent()) ?? '').replace(/\s+/g, ' ')).toContain(
      'El IVA se calcula sobre el precio pactado',
    );

    // La ayuda del campo, con el promotor elegido. Reparado (1273) con la forma del 601 de
    // nave-industrial: en el régimen de IVA pide el precio pactado y NO «el mayor».
    const leerAyuda = async (): Promise<string> => {
      const idAyuda = await page.locator(SEL_PRECIO).getAttribute('aria-describedby');
      return (await page.locator(`[id="${idAyuda}"]`).innerText()).replace(/\s+/g, ' ');
    };
    let ayuda = await leerAyuda();
    expect(ayuda, `Ayuda publicada: «${ayuda}»`).toContain('Precio pactado');
    expect(ayuda, `Ayuda publicada: «${ayuda}»`).not.toContain('el mayor');

    // Siguiéndola con el caso de la ficha (pactado 120.000, referencia 150.000) se escribe el
    // pactado: IVA = 120.000 × 21 % = 25.200,00 € (PORCENTAJES_IVA.general), como dice la FAQ.
    await sembrarValor(page, SEL_PRECIO, '120000');
    await expect(valor(page, 'IVA (')).toHaveText('25.200,00 €');

    // Con un particular (ITP) la base mínima es el valor de referencia: vuelve «el mayor».
    await page.getByRole('button', { name: /Un particular/ }).click();
    ayuda = await leerAyuda();
    expect(ayuda).toContain('valor de referencia catastral (el mayor de ambos)');

    // Y con promotor en Ceuta, donde solo se calcula el AJD (base mínima, la de referencia),
    // tampoco se promete la base del IVA.
    await page.selectOption('#select-ccaa', 'ceuta');
    await page.getByRole('button', { name: /Promotor \/ Empresa/ }).click();
    ayuda = await leerAyuda();
    expect(ayuda).toContain('el mayor de ambos');
  });

  /**
   * HALLAZGO 23/09-F (contenido, bajo) — la plusvalía municipal se afirma sin condición en dos
   * sitios —«En todos los casos, al ser suelo urbano, el vendedor paga plusvalía municipal» en
   * la cabecera y «el vendedor pagará además la plusvalía municipal» bajo el resultado— y la FAQ
   * de la misma página la desmiente: «Si no hubo incremento real, la transmisión NO está sujeta
   * (art. 104.5 TRLRHL)», la no sujeción que introdujo el RDL 26/2021 que cita
   * FISCAL_INMUEBLES_META. El FAQPage del JSON-LD sí lleva la condición.
   */
  test('REPARADO 23/09 (1274, antes 23/09-F) — «el vendedor pagará la plusvalía» sin la no sujeción que la FAQ reconoce', async ({ page }) => {
    await abrir(page, 'madrid', 'particular');
    await sembrarValor(page, SEL_PRECIO, '120000');

    const faq = page
      .locator('strong', { hasText: '¿Hay plusvalía municipal en la compra de un solar?' })
      .locator('xpath=following-sibling::p[1]');
    expect(((await faq.textContent()) ?? '').replace(/\s+/g, ' ')).toContain('la transmisión NO está sujeta');

    const nota = (await page.locator('[role="note"]', { hasText: 'Recuerda' }).innerText()).replace(/\s+/g, ' ');
    expect(nota).toContain('plusvalía municipal');
    expect(nota, `Nota publicada: «${nota}»`).toMatch(/incremento|no est[aá] sujeta|salvo|si hubo/i);

    // Reparado (1274): la cabecera «Clave del solar» lleva la misma condición.
    const cabecera = (await page.locator('[role="note"]', { hasText: 'Clave del solar' }).innerText()).replace(/\s+/g, ' ');
    expect(cabecera, `Cabecera publicada: «${cabecera}»`).toContain('si hubo incremento real');
    expect(cabecera).toContain('104.5 TRLRHL');
    expect(nota).toContain('104.5 TRLRHL');
  });

  /**
   * HALLAZGO 23/09-G (dato, bajo) — la reparación 734 (el IVA del solar sale del tipo GENERAL
   * del art. 90 LIVA, `PORCENTAJES_IVA.general`, y no del de LOCAL COMERCIAL) no llegó a
   * `metadata.ts`: el FAQPage del JSON-LD —el canal que citan los asistentes de IA— sigue
   * derivando el tipo de `IVA_INMUEBLES_2025.local`. Y la guardia del HALLAZGO 5 del 26/08
   * compara los textos con esa misma constante del local, así que el día que diverjan las dos
   * vigilará la equivocada. Hoy ambas valen 21: no hay diferencia en pantalla (es de guardia,
   * como lo fue el 734), pero el test falla por la forma del código.
   */
  test('REPARADO 23/09 (1275, antes 23/09-G) — el FAQPage deriva el IVA de la constante del LOCAL, no de la que usa el cálculo', async () => {
    const { readFileSync } = await import('node:fs');
    const { join } = await import('node:path');
    const dir = join(process.cwd(), 'app', 'simulador-gastos-compraventa-solar');
    const pagina = readFileSync(join(dir, 'page.tsx'), 'utf8');
    const meta = readFileSync(join(dir, 'metadata.ts'), 'utf8');

    // La calculadora usa el tipo general (734): es la referencia.
    expect(pagina).toContain('const IVA_SOLAR = PORCENTAJES_IVA.general');
    // El JSON-LD tiene que seguir a la misma constante.
    expect(meta).not.toContain('IVA_INMUEBLES_2025.local');
    expect(meta).toContain('PORCENTAJES_IVA.general');

    // Reparado (1275): ningún «21%» tecleado en un texto que se publica. Se quitan antes los
    // comentarios, que pueden citar la cifra para explicar el porqué sin publicarla.
    const sinComentarios = (fuente: string) =>
      fuente.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
    expect(sinComentarios(pagina).match(/\b21\s?%/g) ?? []).toEqual([]);
    expect(sinComentarios(meta).match(/\b21\s?%/g) ?? []).toEqual([]);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// INSPECCIÓN del 24/09/2026 — régimen × territorio, y lo que el testigo de familia no mira
//
// POR QUÉ VUELVE A LA COLA
// ────────────────────────
// Tres commits desde la del 23/09: `8d7dcd1b` (precio ilegible), `b704f8f1` (repara 1269-1275)
// y `5b5d33ae` (sin el IGIC/IPSI el coste real «puede ser» mayor). Los tres se comprueban aquí
// y siguen haciendo lo que dicen. El testigo `tests/familias/compraventa.spec.ts` solo mira los
// dos NumberInput de esta app y el IGIC en CANARIAS; lo que no ve son las combinaciones de los
// controles que no son NumberInput (el desplegable de comunidad × los dos botones del
// régimen) y el IPSI de Ceuta y Melilla.
//
// DE DÓNDE SALE CADA CIFRA (ninguna de memoria)
// ────────────────────────────────────────────
//  - Tipos de ITP → `TIPOS_ITP_CCAA_2025` (data/fiscal/inmuebles.ts): Galicia 8 · Madrid 6 ·
//    Canarias 6,5 · Castilla y León 8 con la escala 8 % hasta 250.000 € y 10 % después
//    (`ITP_CCAA['castilla-leon'].tramosProgresivos`). Ceuta y Melilla 6, con la bonificación
//    del 50 % de la cuota del art. 57 bis TRLITPAJD (`aplicarBonificacionCiudad`).
//  - AJD → `ITP_CCAA[x].ajd` (data/itp-ccaa.ts): Galicia 1,5 · Canarias 0,75 · Ceuta 0,5 ·
//    País Vasco 0. Para el País Vasco, las Normas Forales: 0,5 % (ver su hallazgo abajo).
//  - IVA del solar → `PORCENTAJES_IVA.general = 21` (data/fiscal/iva.ts).
//  - Notaría → `ARANCELES_NOTARIO` × 1,21 × `FACTURA_NOTARIAL` (1,5 / 2, medio 1,75);
//    registro → `ARANCELES_REGISTRO` + `REGISTRO_CONCEPTOS` (6,010121 + 3,005061), con el tope
//    `REGISTRO_MAXIMO = 2.181,67` y el IVA del 21 %.
// Todo resuelto ANTES de abrir el navegador con un script propio que no llama a la app.
//
// HALLAZGOS: se escribieron con un `test.fail()` salvo con `VER_HUECOS=1` (la convención del
// testigo de familia), cada uno fallando en su ÚLTIMA aserción. Reparados el 24/09/2026
// (1592-1601), la marca y su ayudante se retiraron y se quedan como regresión.
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('Inspección 24/09/2026 — régimen × territorio, y lo que el testigo de familia no mira', () => {
  const SEL_PRECIO = `input[aria-label="${PRECIO}"]`;
  const SEL_GESTORIA = `input[aria-label="${GESTORIA}"]`;
  const MARCADOR_VACIO = 'Introduce el precio del solar para ver el desglose de gastos';

  const valor = (page: Page, titulo: string | RegExp) =>
    page.locator('h3', { hasText: titulo }).first().locator('xpath=../following-sibling::div[1]/p');
  const descripcion = (page: Page, titulo: string | RegExp) =>
    page.locator('h3', { hasText: titulo }).first().locator('xpath=../following-sibling::p[1]');
  const rotulo = (page: Page, titulo: RegExp) => page.locator('h3', { hasText: titulo }).first();
  /** El marcador de posición del panel de resultados (y no el anunciador de rutas de Next). */
  const marcador = (page: Page) => page.locator('[class*="placeholder"] p');
  const normaliza = (s: string | null) => (s ?? '').replace(/\s+/g, ' ').trim();

  async function abrir(page: Page, ccaa: string, vende: 'particular' | 'promotor'): Promise<void> {
    await page.goto(RUTA);
    await esperarHidratacion(page, [SEL_PRECIO, SEL_GESTORIA]);
    await page.selectOption('#select-ccaa', ccaa);
    const boton = page.getByRole('button', {
      name: vende === 'particular' ? /Un particular/ : /Promotor \/ Empresa/,
    });
    await boton.click();
    await expect(boton).toHaveAttribute('aria-pressed', 'true');
  }

  /**
   * CASO 1 (NORMAL) — Galicia, vende un PROMOTOR, 250.000 €, gestoría 600 €. Régimen ordinario
   * del solar en una comunidad que ninguna vuelta anterior había probado.
   *   IVA = 250.000 × 21 % = 52.500,00       (PORCENTAJES_IVA.general)
   *   AJD = 250.000 × 1,5 % = 3.750,00       (ITP_CCAA['galicia'].ajd)
   *   notaría: 90,15 + 24.040,49 × 0,45 % + 30.050,60 × 0,15 % + 90.151,82 × 0,10 %
   *            + 99.746,97 × 0,05 % = 383,433 · con IVA 463,954426
   *            · ×1,5 = 695,93 · ×2 = 927,91 · medio ×1,75 = 811,92
   *   registro: 24,04 + 42,0708575 + 37,56325 + 67,613865 + 99.746,97 × 0,03 % (29,924091)
   *            + 9,015182 = 210,2272455 · con IVA = 254,374967 → 254,37
   *   total = 52.500 + 3.750 + 811,92 + 254,37 + 600 = 57.916,29 (23,1665 %)
   *   coste = 307.916,29
   */
  test('CASO 1 (normal) — Galicia, promotor, 250.000 €: IVA 52.500 € + AJD 1,5 %', async ({ page }) => {
    await abrir(page, 'galicia', 'promotor');
    await sembrarValor(page, SEL_PRECIO, '250000');
    await sembrarValor(page, SEL_GESTORIA, '600');

    await expect(rotulo(page, /^IVA \(/)).toHaveText('IVA (21,00%)');
    await expect(valor(page, 'IVA (')).toHaveText('52.500,00 €');
    await expect(rotulo(page, /^AJD \(/)).toHaveText('AJD (1,50%)');
    await expect(valor(page, 'AJD (')).toHaveText('3750,00 €');
    await expect(page.locator('h3', { hasText: /^ITP \(/ })).toHaveCount(0);
    await expect(valor(page, 'Gastos de notaría')).toHaveText('811,92 €');
    await expect(descripcion(page, 'Gastos de notaría')).toContainText('entre 695,93 € y 927,91 €');
    await expect(valor(page, 'Registro de la Propiedad')).toHaveText('254,37 €');
    await expect(valor(page, 'Gastos de gestoría')).toHaveText('600,00 €');
    await expect(valor(page, 'Total gastos adicionales')).toHaveText('57.916,29 €');
    await expect(descripcion(page, 'Total gastos adicionales')).toHaveText('23,17% sobre el precio de compra');
    await expect(valor(page, 'COSTE TOTAL DE ADQUISICIÓN')).toHaveText('307.916,29 €');
    await expect(descripcion(page, 'COSTE TOTAL DE ADQUISICIÓN')).toHaveText(
      'Precio + todos los gastos (antes de deducir el IVA si tienes derecho)',
    );
    // 1273 sigue reparado: con IVA en pantalla la ayuda pide el precio PACTADO.
    const idAyuda = await page.locator(SEL_PRECIO).getAttribute('aria-describedby');
    await expect(page.locator(`[id="${idAyuda}"]`)).toContainText('Precio pactado');
  });

  /**
   * CASO 2 (LÍMITE) — Madrid, vende un PARTICULAR, 12.000.000 €, gestoría 500 €. Lleva el
   * registro a su TOPE (nunca probado: el caso más alto hasta hoy, 2,5 M, quedaba por debajo).
   *   ITP = 12.000.000 × 6 % = 720.000,00 (Madrid sin escala → tipo EFECTIVO 6,00 %)
   *   registro: 306,51 + 11.398.987,90 × 0,02 % = 2.586,31 > tope → 2.181,67
   *            + 9,015182 = 2.190,685182 · con IVA = 2.650,729070 → 2.650,73
   * La notaría NO se anclaba aquí: por encima de 6.010.121,04 € el RD 1426/1989 no tiene tramo
   * (hallazgo 1599, abajo). Reparado el 24/09/2026: se calcula el arancel hasta ese límite
   * (2.181,672142 × 1,21 × 1,75 = 4.619,690761 → 4.619,69) y el resto es de libre acuerdo, así
   * que el cierre sale «(PARCIAL)»: total 720.000 + 4.619,69 + 2.650,73 + 500 = 727.770,42.
   */
  test('CASO 2 (límite) — Madrid, particular, 12.000.000 €: el registro llega a su tope de 2.181,67 €', async ({ page }) => {
    const { parseSpanishNumber } = await import('../../lib/formatters');
    const euros = async (titulo: string | RegExp) =>
      parseSpanishNumber(normaliza(await valor(page, titulo).innerText()).replace(/\s?€$/, ''));

    await abrir(page, 'madrid', 'particular');
    await sembrarValor(page, SEL_PRECIO, '12000000');
    await sembrarValor(page, SEL_GESTORIA, '500');

    await expect(rotulo(page, /^ITP \(/)).toHaveText('ITP (6,00%)');
    await expect(valor(page, 'ITP (')).toHaveText('720.000,00 €');
    await expect(page.locator('h3', { hasText: /^AJD/ })).toHaveCount(0);
    await expect(valor(page, 'Registro de la Propiedad')).toHaveText('2650,73 €');
    await expect(valor(page, 'Gastos de gestoría')).toHaveText('500,00 €');

    await expect(valor(page, 'Gastos de notaría')).toHaveText('4619,69 €');
    const lineas =
      (await euros('ITP (')) + (await euros('Gastos de notaría')) +
      (await euros('Registro de la Propiedad')) + (await euros('Gastos de gestoría'));
    expect(await euros('Total gastos adicionales')).toBeCloseTo(lineas, 2);
    await expect(valor(page, 'Total gastos adicionales')).toHaveText('727.770,42 €');
    await expect(rotulo(page, /^COSTE TOTAL/)).toHaveText('COSTE TOTAL (PARCIAL)');
    expect(await euros(/^COSTE TOTAL/)).toBeCloseTo(12_000_000 + lineas, 2);
  });

  /**
   * CASO 3 (TERRITORIO SIN IVA, con promotor) — Ceuta, 300.000 €, gestoría «1.500.25»
   * (ilegible). El testigo de familia prueba el IGIC de CANARIAS; el IPSI de Ceuta, no.
   *   IPSI: no calculado
   *   AJD = 300.000 × 0,5 % × (1 − 0,5) = 750,00 → efectivo 0,25 % (art. 57 bis.1)
   *   notaría 864,86 · registro 272,52 (desarrollo del Madrid 300.000 € del 26/08)
   *   total (sin IPSI ni gestoría) = 750 + 864,86 + 272,52 = 1.887,38 (0,6291 %)
   *   coste = 301.887,38
   *   Con la gestoría legible (500): total 2.387,38 (0,80 %) · coste 302.387,38, «puede ser mayor»
   *   (el IPSI depende de la ordenanza de cada ciudad y puede ser cero, 5b5d33ae).
   */
  test('CASO 3 (sin IVA) — Ceuta, promotor, 300.000 €: IPSI sin calcular, AJD bonificado, «será» solo con la gestoría ilegible', async ({ page }) => {
    await abrir(page, 'ceuta', 'promotor');
    await sembrarValor(page, SEL_PRECIO, '300000');
    await sembrarValor(page, SEL_GESTORIA, '1.500.25');

    await expect(page.getByRole('button', { name: /Promotor \/ Empresa/ })).toContainText('Paga IPSI + AJD');
    await expect(valor(page, 'IPSI')).toHaveText('No calculado');
    await expect(rotulo(page, /^AJD \(/)).toHaveText('AJD (0,25%)');
    await expect(valor(page, 'AJD (')).toHaveText('750,00 €');
    await expect(valor(page, 'Gastos de notaría')).toHaveText('864,86 €');
    await expect(valor(page, 'Registro de la Propiedad')).toHaveText('272,52 €');
    await expect(valor(page, 'Gastos de gestoría')).toHaveText('Sin leer');
    await expect(rotulo(page, /^Total gastos adicionales/)).toHaveText('Total gastos adicionales (parcial)');
    await expect(valor(page, 'Total gastos adicionales')).toHaveText('1887,38 €');
    await expect(descripcion(page, 'Total gastos adicionales')).toHaveText(
      '0,63% sobre el precio de compra — SIN el IPSI, que no está incluido — SIN la gestoría, que no se ha podido leer',
    );
    await expect(rotulo(page, /^COSTE TOTAL/)).toHaveText('COSTE TOTAL (PARCIAL)');
    await expect(valor(page, /^COSTE TOTAL/)).toHaveText('301.887,38 €');
    await expect(descripcion(page, /^COSTE TOTAL/)).toHaveText(
      'No incluye el IPSI ni la gestoría, que no se ha podido leer: el coste real será mayor',
    );

    await sembrarValor(page, SEL_GESTORIA, '500');
    await expect(valor(page, 'Total gastos adicionales')).toHaveText('2387,38 €');
    await expect(valor(page, /^COSTE TOTAL/)).toHaveText('302.387,38 €');
    await expect(descripcion(page, /^COSTE TOTAL/)).toHaveText('No incluye el IPSI: el coste real puede ser mayor');
  });

  /**
   * Régimen × territorio en CANARIAS: el mismo desplegable con los dos botones. Con particular
   * el IGIC no pinta, y la operación va por ITP al 6,5 % (TIPOS_ITP_CCAA_2025); al pasar a
   * promotor aparece el aviso y el total se vuelve parcial; al volver, todo se restablece.
   *   particular 150.000: ITP 9.750,00 · notaría 705,78 · registro 217,94 · gestoría 500
   *     total 11.173,72 (7,45 %) · coste 161.173,72
   *   promotor 150.000: IGIC no calculado · AJD 150.000 × 0,75 % = 1.125,00
   *     total (parcial) 2.548,72 · coste (parcial) 152.548,72
   */
  test('Canarias — particular por ITP sin aviso de IGIC; promotor parcial; y vuelta atrás', async ({ page }) => {
    await abrir(page, 'canarias', 'particular');
    await sembrarValor(page, SEL_PRECIO, '150000');
    await sembrarValor(page, SEL_GESTORIA, '500');

    await expect(page.getByText('no se aplica el IVA')).toHaveCount(0);
    await expect(rotulo(page, /^ITP \(/)).toHaveText('ITP (6,50%)');
    await expect(valor(page, 'ITP (')).toHaveText('9750,00 €');
    await expect(page.locator('h3', { hasText: /^AJD/ })).toHaveCount(0);
    await expect(valor(page, 'Total gastos adicionales')).toHaveText('11.173,72 €');
    await expect(valor(page, 'COSTE TOTAL DE ADQUISICIÓN')).toHaveText('161.173,72 €');
    await expect(descripcion(page, 'COSTE TOTAL DE ADQUISICIÓN')).toHaveText('Precio + todos los gastos de la operación');

    await page.getByRole('button', { name: /Promotor \/ Empresa/ }).click();
    await expect(page.getByText('no se aplica el IVA')).toBeVisible();
    await expect(valor(page, 'IGIC')).toHaveText('No calculado');
    await expect(rotulo(page, /^AJD \(/)).toHaveText('AJD (0,75%)');
    await expect(valor(page, 'AJD (')).toHaveText('1125,00 €');
    await expect(valor(page, 'Total gastos adicionales')).toHaveText('2548,72 €');
    await expect(valor(page, /^COSTE TOTAL/)).toHaveText('152.548,72 €');
    await expect(descripcion(page, /^COSTE TOTAL/)).toHaveText('No incluye el IGIC: el coste real puede ser mayor');

    await page.getByRole('button', { name: /Un particular/ }).click();
    await expect(page.getByText('no se aplica el IVA')).toHaveCount(0);
    await expect(valor(page, 'ITP (')).toHaveText('9750,00 €');
    await expect(rotulo(page, /^COSTE TOTAL/)).toHaveText('COSTE TOTAL DE ADQUISICIÓN');
  });

  /**
   * Castilla y León — el corte EXACTO del primer tramo (8 % hasta 250.000 €, 10 % después).
   *   250.000 → 20.000,00 (8,00 %) · notaría 811,92 · registro 254,37 · total 21.066,29 · coste 271.066,29
   *   250.001 → 20.000 + 1 × 10 % = 20.000,10 (8,00 %) · registro 254,38 (254,375330)
   *            · total 21.066,40 · coste 271.067,40
   * Gestoría 0: es un dato, no un ilegible, así que no hay tarjeta de gestoría ni aviso.
   */
  test('Castilla y León — el corte exacto de 250.000 € no salta de tramo; un euro más va al 10 %', async ({ page }) => {
    await abrir(page, 'castilla-leon', 'particular');
    await sembrarValor(page, SEL_GESTORIA, '0');
    await sembrarValor(page, SEL_PRECIO, '250000');

    await expect(page.getByText('escala progresiva (8 % → 10 %)')).toBeVisible();
    await expect(valor(page, 'ITP (')).toHaveText('20.000,00 €');
    await expect(page.locator('h3', { hasText: 'Gastos de gestoría' })).toHaveCount(0);
    await expect(valor(page, 'Total gastos adicionales')).toHaveText('21.066,29 €');
    await expect(valor(page, 'COSTE TOTAL DE ADQUISICIÓN')).toHaveText('271.066,29 €');

    await sembrarValor(page, SEL_PRECIO, '250001');
    await expect(rotulo(page, /^ITP \(/)).toHaveText('ITP (8,00%)');
    await expect(valor(page, 'ITP (')).toHaveText('20.000,10 €');
    await expect(valor(page, 'Registro de la Propiedad')).toHaveText('254,38 €');
    await expect(valor(page, 'Total gastos adicionales')).toHaveText('21.066,40 €');
    await expect(valor(page, 'COSTE TOTAL DE ADQUISICIÓN')).toHaveText('271.067,40 €');
  });

  // ─── HALLAZGOS del 24/09/2026 (1592-1601), REPARADOS el mismo día ────────────
  // Se escribieron con `hallazgoAbierto()` y fallaban en su ÚLTIMA aserción; reparados, pierden
  // la marca y se quedan como regresión. Lo anterior a esa aserción es la preparación del caso.

  /**
   * HALLAZGO (dato, alto) — el AJD del País Vasco vale 0 en `ITP_CCAA['pais-vasco'].ajd` y la
   * app no cobra AJD a un solar comprado a un promotor. Las Normas Forales fijan el 0,5 %:
   *   · Gipuzkoa, NF 18/1987, art. 29.2 (texto vigente de gipuzkoa.eus): las primeras copias
   *     con cantidad o cosa valuable, inscribibles y no sujetas a ISD ni a TPO/OS «tributarán,
   *     además al tipo de gravamen del 0,5 por 100».
   *   · Bizkaia, NF 1/2011, art. 44.1: «al tipo de gravamen del 0,50 por 100».
   * La exención del art. 41.I.B.11 de la NF 18/1987 alcanza solo a la «primera transmisión de
   * VIVIENDAS»: puede explicar el 0 de una vivienda nueva, no el de un solar. (Álava no se ha
   * podido comprobar en la fuente.) El dato está en el módulo compartido: afecta a las
   * hermanas con compra sujeta a IVA fuera de la vivienda (local, nave, garaje o trastero
   * independientes), y consagran el 0 el test «País Vasco, empresario» del 26/08 y el
   * `RANGO_AJD.min = 0` del HALLAZGO 2, que habrá que reescribir al repararlo.
   *   200.000 × 0,5 % = 1.000,00 → total 42.000 + 1.000 + 758,98 + 236,22 + 500 = 44.495,20
   *   coste 244.495,20 (la app publica 243.495,20, sin tarjeta de AJD).
   */
  test('REPARADO 1592 — País Vasco con promotor: cobra el AJD del 0,5 % de las Normas Forales', async ({ page }) => {
    await abrir(page, 'pais-vasco', 'promotor');
    await sembrarValor(page, SEL_PRECIO, '200000');
    await sembrarValor(page, SEL_GESTORIA, '500');
    await expect(valor(page, 'IVA (')).toHaveText('42.000,00 €');

    // Una tarjeta de AJD al 0,5 % y el coste con ella dentro.
    await expect(page.locator('h3', { hasText: /^AJD \(/ })).toHaveCount(1);
    await expect(rotulo(page, /^AJD \(/)).toHaveText('AJD (0,50%)');
    await expect(valor(page, 'AJD (')).toHaveText('1000,00 €');
    await expect(valor(page, 'Total gastos adicionales')).toHaveText('44.495,20 €');
    await expect(valor(page, 'COSTE TOTAL DE ADQUISICIÓN')).toHaveText('244.495,20 €');
    // La ficha rotula el mismo 0,5 %, y el ITP de lo que no es vivienda (7 %, no el 4 %).
    const ficha = normaliza(await page.locator('[class*="infoCcaaGrid"]').innerText());
    expect(ficha).toContain('AJD 0,5%');
    expect(ficha).toContain('ITP General 7%');
  });

  /**
   * HALLAZGO (contenido, medio) — EFECTO FAMILIA de los hallazgos 729 (terreno-rústico) y 623
   * (local-comercial), y de la forma que ya tiene nave-industrial. En Ceuta y Melilla el motor
   * bonifica la cuota al 50 % (art. 57 bis TRLITPAJD) y la tarjeta cobra «ITP (3,00%)», pero la
   * palabra «bonificación» no aparece en toda la página (0 en el HTML servido), y tres textos
   * la niegan: la ficha «ITP General 6% · AJD 0,5%», la descripción de la tarjeta «Tipo
   * general — los solares no tienen tipos reducidos de ITP» y la nota de la ficha «los tipos
   * reducidos solo aplican a la vivienda habitual». La propia tabla de data/itp-ccaa.ts declara
   * para Ceuta y Melilla un «Bonificación general 50%» cuya única condición es el sitio.
   *   Melilla, particular, 180.000 € → 180.000 × 6 % × 50 % = 5.400,00 (3,00 %)
   */
  test('REPARADO 1593 — en Melilla la cuota va bonificada al 50 % y la página lo dice', async ({ page }) => {
    await abrir(page, 'melilla', 'particular');
    await sembrarValor(page, SEL_PRECIO, '180000');
    await expect(rotulo(page, /^ITP \(/)).toHaveText('ITP (3,00%)');
    await expect(valor(page, 'ITP (')).toHaveText('5400,00 €');
    const ficha = normaliza(await page.locator('[class*="infoCcaaGrid"]').innerText());
    expect(ficha).toContain('ITP General 6%');
    expect(ficha).toContain('AJD 0,5%');

    const texto = normaliza(await page.locator('[class*="mainContent"]').innerText());
    expect(
      {
        nombraLaBonificacion: /bonific/i.test(texto),
        niegaQueHayaRebaja: /no tienen tipos reducidos|solo aplican a la vivienda habitual/.test(texto),
      },
      `Panel publicado: «${texto.slice(0, 600)}…»`,
    ).toEqual({ nombraLaBonificacion: true, niegaQueHayaRebaja: false });
    // Y lo nombra junto a la cifra, con su artículo, y en la ficha.
    await expect(descripcion(page, 'ITP (')).toHaveText(
      'Tipo general con la bonificación del 50 % de la cuota ya aplicada (art. 57 bis.3.a TRLITPAJD)',
    );
    expect(ficha).toContain('Bonificación en cuota −50%');
  });

  /**
   * HALLAZGO (accesibilidad, medio) — dos celdas de la tabla «El impuesto depende de quién
   * venda» llevan el color escrito a mano en línea (`#27ae60` y `#c0392b`, page.tsx:593-594),
   * sin token ni variante oscura. Medido con el color computado y el fondo compuesto real:
   *   claro:  «Sí (si actividad sujeta)» #27ae60 sobre rgb(245,245,245) → 2,64:1
   *   oscuro: «No hay IVA»              #c0392b sobre rgb(48,48,48)    → 2,43:1
   * Texto de 14,4 px normal: exige 4,5:1. Ningún candado lo ve (check:contraste-cabeceras mira
   * los <th>, check:token-oscuro los .module.css). El 733 reparó el --primary de esta app.
   */
  test('REPARADO 1594 — las celdas verde y roja de la tabla llegan al 4,5:1 en los dos temas', async ({ page }) => {
    const contraste = (loc: ReturnType<Page['locator']>) =>
      loc.evaluate((el) => {
        const parse = (c: string): number[] => {
          const m = c.match(/rgba?\(([^)]+)\)/);
          if (!m) return [0, 0, 0, 0];
          const p = m[1].split(/[ ,/]+/).filter(Boolean).map(Number);
          return [p[0], p[1], p[2], p.length > 3 ? p[3] : 1];
        };
        const sobre = (a: number[], b: number[]) => [0, 1, 2].map((i) => a[i] * a[3] + b[i] * (1 - a[3])).concat(1);
        const lum = (c: number[]) => {
          const f = (v: number) => { const s = v / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; };
          return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]);
        };
        const capas: number[][] = [];
        for (let n: Element | null = el; n; n = n.parentElement) {
          const c = parse(getComputedStyle(n).backgroundColor);
          if (c[3] > 0) capas.push(c);
          if (c[3] >= 1) break;
        }
        let fondo = parse(getComputedStyle(document.documentElement).backgroundColor);
        if (fondo[3] === 0) fondo = [255, 255, 255, 1];
        for (let i = capas.length - 1; i >= 0; i--) fondo = sobre(capas[i], fondo);
        const texto = sobre(parse(getComputedStyle(el).color), fondo);
        const [a, b] = [lum(texto), lum(fondo)];
        return Math.round(((Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)) * 100) / 100;
      });

    // El cambio de tema lleva transición: medido a mitad, el fondo es un gris intermedio y la
    // cifra no significa nada. Se reduce el movimiento (la regla global lo deja en 0,01 ms) y,
    // además, se mide hasta que dos lecturas seguidas coinciden.
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(RUTA);
    await esperarHidratacion(page, [SEL_PRECIO]);
    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
    const si = page.locator('td', { hasText: 'Sí (si actividad sujeta)' });
    const no = page.locator('td', { hasText: 'No hay IVA' });
    await expect(si).toBeVisible();
    const medirEstable = async (): Promise<{ si: number; no: number }> => {
      let previa = '';
      for (let i = 0; i < 20; i++) {
        const actual = JSON.stringify({ si: await contraste(si), no: await contraste(no) });
        if (actual === previa) return JSON.parse(actual) as { si: number; no: number };
        previa = actual;
        await page.waitForTimeout(150);
      }
      throw new Error(`El contraste no se estabiliza: ${previa}`);
    };

    const claro = await medirEstable();
    await page.getByRole('button', { name: 'Cambiar a modo oscuro' }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await expect(page.locator('body')).not.toHaveCSS('background-color', 'rgb(250, 250, 250)');
    const oscuro = await medirEstable();

    const medidas = { claro, oscuro };
    expect(
      Math.min(claro.si, claro.no, oscuro.si, oscuro.no),
      `Contrastes medidos: ${JSON.stringify(medidas)}`,
    ).toBeGreaterThanOrEqual(4.5);
  });

  /**
   * HALLAZGO (contenido, bajo) — EFECTO FAMILIA; la misma forma salió hoy en la referencia,
   * garaje y trastero. Con la gestoría ILEGIBLE, el total y el coste pierden la gestoría y su
   * descripción lo dice («el coste real será mayor»), pero sus títulos siguen siendo los de una
   * cifra definitiva. La redacción común rotula «(PARCIAL)» toda cifra final a la que le falta
   * algo: aquí mismo, cuando falta el IGIC/IPSI, y en el neto del vendedor de las cuatro
   * hermanas con pestaña de vendedor en cuanto un importe es ilegible.
   *   Galicia, promotor, 250.000, gestoría «2.000.50» → total 57.316,29 · coste 307.316,29
   */
  test('REPARADO 1595 — con la gestoría ilegible, total y coste se titulan «(PARCIAL)»', async ({ page }) => {
    await abrir(page, 'galicia', 'promotor');
    await sembrarValor(page, SEL_PRECIO, '250000');
    await sembrarValor(page, SEL_GESTORIA, '2.000.50');
    await expect(valor(page, 'Gastos de gestoría')).toHaveText('Sin leer');
    await expect(valor(page, 'Total gastos adicionales')).toHaveText('57.316,29 €');
    await expect(valor(page, /^COSTE TOTAL/)).toHaveText('307.316,29 €');
    await expect(descripcion(page, /^COSTE TOTAL/)).toContainText('el coste real será mayor');

    const titulos = [
      normaliza(await rotulo(page, /^Total gastos adicionales/).innerText()),
      normaliza(await rotulo(page, /^COSTE TOTAL/).innerText()),
    ];
    expect(titulos).toEqual(['Total gastos adicionales (parcial)', 'COSTE TOTAL (PARCIAL)']);
  });

  /**
   * HALLAZGO (contenido, bajo) — el 731 quedó A MEDIAS. Su caso nombraba, además de la FAQ, «la
   * tabla comparativa y las dos tarjetas de casos de uso» como textos que afirman sin excepción
   * que la compra a promotor paga IVA. La FAQ, la cabecera y el botón ya llevan el IGIC/IPSI;
   * la tabla («Impuesto principal — IVA 21%») y las dos tarjetas («paga IVA 21% + AJD», «paga
   * IVA 21% deducible en el modelo 303») no. La hermana terreno-rústico sí lo escribe en su
   * tabla: «IGIC o IPSI en Canarias, Ceuta y Melilla» (su page.tsx:627).
   */
  test('REPARADO 1596 (731 a medias) — tabla y casos de uso recogen el IGIC/IPSI', async ({ page }) => {
    await page.goto(RUTA);
    // El bloque educativo llega plegado: su texto está en el DOM y se lee con textContent.
    const seccion = (h2: string) =>
      page.locator('section', { has: page.locator('h2', { hasText: h2 }) }).last();
    const tabla = normaliza(await seccion('El impuesto depende de quién venda').textContent());
    const casos = normaliza(await seccion('Casos de uso habituales').textContent());
    expect(tabla).toContain(`IVA ${PORCENTAJES_IVA.general}%`);

    expect({
      tabla: /IGIC|IPSI/.test(tabla),
      casosDeUso: /IGIC|IPSI/.test(casos),
    }).toEqual({ tabla: true, casosDeUso: true });
  });

  /**
   * HALLAZGO (contenido, bajo) — el 1274 quedó A MEDIAS. Se condicionaron la cabecera y la nota
   * «Recuerda», pero siguen afirmando la plusvalía municipal sin la no sujeción del art. 104.5
   * TRLRHL (RDL 26/2021) la tabla comparativa («Plusvalía municipal (vendedor) — Sí (suelo
   * urbano)» en las dos columnas) y la sexta respuesta del FAQPage («al ser suelo urbano genera
   * plusvalía municipal»), que contradice a la cuarta del mismo FAQPage («Si no ha habido
   * incremento real de valor, la transmisión no está sujeta al impuesto»).
   */
  test('REPARADO 1597 (1274 a medias) — la tabla y el FAQPage condicionan la plusvalía al incremento', async ({ page }) => {
    await page.goto(RUTA);
    const fila = normaliza(
      await page.locator('tr', { has: page.locator('td', { hasText: 'Plusvalía municipal (vendedor)' }) }).textContent(),
    );
    const bloques = await page.locator('script[type="application/ld+json"]').allTextContents();
    const faq = JSON.parse(bloques.find((b) => b.includes('FAQPage')) ?? '{}') as {
      mainEntity?: { name: string; acceptedAnswer: { text: string } }[];
    };
    const sexta = faq.mainEntity?.find((q) => q.name.includes('finca rústica'))?.acceptedAnswer.text ?? '';
    // (La respuesta decía «genera plusvalía municipal»; reparada, dice que está sujeto a ella.)
    expect(sexta).toContain('plusvalía municipal');

    const condiciona = (s: string) => /incremento|no est[aá] sujeta|si hubo|salvo/i.test(s);
    expect({ tabla: condiciona(fila), faqPage: condiciona(sexta) }).toEqual({ tabla: true, faqPage: true });
  });

  /**
   * HALLAZGO (contenido, bajo) — la meta description, que es lo que enseña el buscador, dice
   * «Calcula los gastos de compra…: IVA… ITP… notaría, registro y plusvalía municipal del
   * vendedor», y el feature del WebApplication «Plusvalía municipal del vendedor (suelo
   * urbano)». La página lo desmiente en su recuadro de limitaciones: «No calcula la plusvalía
   * municipal, que corresponde al vendedor; se muestra solo como recordatorio». El
   * `description` del JSON-LD sí lo dice bien («y nota sobre la plusvalía municipal»).
   */
  test('REPARADO 1598 — la meta description no promete calcular la plusvalía que la app no calcula', async ({ page }) => {
    await page.goto(RUTA);
    const cuerpo = normaliza(await page.locator('body').textContent());
    expect(cuerpo).toContain('No calcula la plusvalía municipal');

    const desc = (await page.locator('meta[name="description"]').getAttribute('content')) ?? '';
    const prometeCalculo =
      /^Calcula[^]*plusvalía municipal/.test(desc) &&
      // `\b`: «notaría» no es una «nota» sobre la plusvalía.
      !/\b(nota|recordatorio|aviso|recuerda)\b[^.]*plusvalía/i.test(desc);
    expect(prometeCalculo, `meta description: «${desc}»`).toBe(false);
    // Y el WebApplication tampoco la lista como algo que se calcula.
    const bloques = await page.locator('script[type="application/ld+json"]').allTextContents();
    const app = bloques.find((b) => b.includes('"WebApplication"')) ?? '';
    expect(app).not.toContain('"Plusvalía municipal del vendedor (suelo urbano)"');
    expect(app).toContain('no se calcula');
  });

  /**
   * HALLAZGO (dato, bajo) — la notaría por encima de 6.010.121,04 € sale de un séptimo tramo
   * del 0,02 % (`ARANCELES_NOTARIO`, `{ hasta: Infinity, exceso: 0.02 }`) que el RD 1426/1989
   * no tiene: su número 2 dice «Por lo que excede de 6.010.121,04 euros el Notario percibirá
   * la cantidad que libremente acuerde con las partes otorgantes» (BOE-A-1989-28111, el
   * `urlOficial` de FACTURA_NOTARIAL). Para 12.000.000 € la tarjeta publica 7.156,40 €
   * (6.134,06-8.178,75) sin decirlo; 2.536,71 € del punto medio salen de ese tramo
   * (5.989.878,96 × 0,02 % × 1,21 × 1,75). Módulo compartido: afecta a las siete.
   */
  test('REPARADO 1599 — por encima de 6.010.121,04 € la notaría avisa de que es libre', async ({ page }) => {
    await abrir(page, 'madrid', 'particular');
    await sembrarValor(page, SEL_PRECIO, '12000000');
    await expect(valor(page, 'ITP (')).toHaveText('720.000,00 €');
    // Arancel hasta el límite: 2.181,672142 × 1,21 = 2.639,823292 → ×1,5 = 3.959,73 · ×2 =
    // 5.279,65 · medio ×1,75 = 4.619,69 (antes, 7.156,40 con el séptimo tramo inexistente).
    expect(LIMITE_ARANCEL_NOTARIAL).toBe(6010121.04);
    await expect(valor(page, 'Gastos de notaría')).toHaveText('4619,69 €');
    await expect(descripcion(page, 'Gastos de notaría')).toContainText('entre 3959,73 € y 5279,65 €');

    await expect(descripcion(page, 'Gastos de notaría')).toContainText(/libremente|libre acuerdo/i, { timeout: 2000 });
    await expect(descripcion(page, /^COSTE TOTAL/)).toContainText('la parte de la notaría de libre acuerdo');
    await expect(descripcion(page, /^COSTE TOTAL/)).toContainText('el coste real puede ser mayor');
  });

  /**
   * HALLAZGO (dato, bajo) — el <DataReference> de esta app de riesgo 1 cita como normativa
   * aplicada «Ley 1/1993 ITP-AJD»: el texto refundido del impuesto es el Real Decreto
   * Legislativo 1/1993, de 24 de septiembre (BOE-A-1993-25359). Viene de
   * `FISCAL_INMUEBLES_META.fuente` (data/fiscal/inmuebles.ts:20), así que sale igual en toda
   * app que lo pinte.
   */
  test('REPARADO 1600 — el DataReference cita el Real Decreto Legislativo 1/1993 del ITP', async ({ page }) => {
    await page.goto(RUTA);
    const referencia = normaliza(
      await page.locator('[role="note"]', { hasText: 'DATOS DE REFERENCIA' }).first().innerText(),
    );
    expect(referencia).toContain('1/1993');

    expect(referencia).toMatch(/(Real Decreto Legislativo|RDL) 1\/1993/);
  });

  /**
   * HALLAZGO (operativa, bajo) — un precio positivo que se pinta como 0,00 € se acepta y
   * publica un desglose entero, cuando el 0 escrito devuelve el marcador. Con «0,004»: «Precio
   * del solar 0,00 €», ITP 0,00 €, notaría 190,89 € y registro 40,00 € (los mínimos de
   * arancel), gestoría 500, total 730,89 € y «18.272.250,00% sobre el precio de compra».
   */
  test('REPARADO 1601 — un precio que se pinta 0,00 € no publica desglose', async ({ page }) => {
    await abrir(page, 'madrid', 'particular');
    await sembrarValor(page, SEL_PRECIO, '0');
    await expect(marcador(page)).toHaveText(MARCADOR_VACIO);

    await sembrarValor(page, SEL_PRECIO, '0,004');
    await expect(page.locator('h3', { hasText: 'Precio del solar' })).toHaveCount(0, { timeout: 2000 });
    await expect(marcador(page)).toHaveText(MARCADOR_VACIO);
    // 0,01 € sí se pinta como un importe: es un precio, aunque absurdo, y se calcula.
    await sembrarValor(page, SEL_PRECIO, '0,01');
    await expect(valor(page, 'Precio del solar')).toHaveText('0,01 €');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// REPARACIÓN 24/09/2026 — lo que la reparación del motor toca en el solar y los hallazgos no
// nombraban: el umbral valenciano (hallazgos 1581/1602 de las hermanas) y el ITP vasco de lo
// que no es vivienda (1582), con un particular como vendedor.
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('Reparación 24/09/2026 — umbral valenciano, País Vasco y DataReference del solar', () => {
  const SEL_PRECIO = `input[aria-label="${PRECIO}"]`;
  const SEL_GESTORIA = `input[aria-label="${GESTORIA}"]`;

  /**
   * Comunitat Valenciana, particular, 1.200.000 €, gestoría 500 € (Ley 13/1997, art. 13.Uno,
   * BOE-A-1998-8202: por encima de un millón, el 11 % sobre TODO el valor):
   *   ITP = 1.200.000 × 11 % = 132.000 · notaría 1.564,06 · registro 526,75
   *   total = 132.000 + 1.564,06 + 526,75 + 500 = 134.590,81 · coste 1.334.590,81
   */
  test('Valencia, particular, 1.200.000 €: el 11 % grava todo el valor y el recuadro lo llama umbral', async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, [SEL_PRECIO, SEL_GESTORIA]);
    await page.selectOption('#select-ccaa', 'valencia');
    await page.getByRole('button', { name: /Un particular/ }).click();
    await sembrarValor(page, SEL_PRECIO, '1200000');
    await sembrarValor(page, SEL_GESTORIA, '500');

    expect(await rotuloTarjeta(page, /^ITP \(/)).toBe('ITP (11,00%)');
    expect(await valorTarjeta(page, 'ITP (')).toBe('132.000,00 €');
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('134.590,81 €');
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('1.334.590,81 €');
    const recuadro = (await page.locator('[class*="infoCcaa"]').first().innerText()).replace(/\s+/g, ' ');
    expect(recuadro).toContain('pasa al 11 % sobre TODO el valor, no solo sobre el exceso');
    expect(recuadro).not.toContain('escala progresiva');
  });

  /** País Vasco, particular, 200.000 €: 200.000 × 7 % = 14.000 (el 4 % es de la vivienda). */
  test('País Vasco, particular, 200.000 €: el ITP de un solar es el 7 %, no el 4 % de la vivienda', async ({ page }) => {
    expect(ITP_CCAA['pais-vasco'].tipoGeneralNoVivienda).toBe(7);
    await page.goto(RUTA);
    await esperarHidratacion(page, [SEL_PRECIO, SEL_GESTORIA]);
    await page.selectOption('#select-ccaa', 'pais-vasco');
    await page.getByRole('button', { name: /Un particular/ }).click();
    await sembrarValor(page, SEL_PRECIO, '200000');
    expect(await rotuloTarjeta(page, /^ITP \(/)).toBe('ITP (7,00%)');
    expect(await valorTarjeta(page, 'ITP (')).toBe('14.000,00 €');
  });

  /** El sello de datos dice lo que paga un SOLAR, con la bonificación que la app aplica. */
  test('DataReference: el rango del ITP de un solar y la bonificación de Ceuta y Melilla', async ({ page }) => {
    await page.goto(RUTA);
    const referencia = (
      await page.locator('[role="note"]', { hasText: 'DATOS DE REFERENCIA' }).first().innerText()
    ).replace(/\s+/g, ' ');
    expect(referencia).toContain(`El ITP de un solar va del ${RANGO_ITP_OTROS.min}% al ${RANGO_ITP_OTROS.max}%`);
    expect(referencia).toContain('en Ceuta y Melilla la cuota se bonifica un 50 %');
    expect(referencia).not.toContain('del 4% (País Vasco');
  });
});
