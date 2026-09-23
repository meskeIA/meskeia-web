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
// Añadido en la re-inspección del 12/09/2026: los casos nuevos siembran esperando a que
// React haya montado el input, en vez de confiar en el `load` de `page.goto()`.
import { esperarHidratacion, sembrarValor } from './_hidratacion';

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
  test('REPARADO 11/09 (728) — la FAQ y el FAQPage dicen que en Canarias, Ceuta y Melilla no rige el IVA', async ({ page }) => {
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
  test('REPARADO 11/09 (729) — en Ceuta la bonificación del 50 % se aplica y se nombra', async ({ page }) => {
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
  test('REPARADO 11/09 (730) — el texto usa --primary-texto y llega a 4,5:1 (WCAG AA)', async ({ page }) => {
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

// ✅ REPARADO 11/09/2026 (medio) — contenido. EFECTO FAMILIA (pista a).
// La FAQ visible y los cinco bloques del FAQPage afirmaban que con la renuncia a la exención
// «la compra pasa a tributar por IVA al 21%», sin la excepción territorial que la propia
// calculadora sí aplica: en Canarias rige el IGIC y en Ceuta y Melilla el IPSI. El JSON-LD es
// lo que citan los asistentes de IA, así que la versión que se propagaba era la incompleta.
// Dentro del MISMO FAQPage la excepción simétrica del ITP (la bonificación del 50 % de Ceuta
// y Melilla) sí estaba escrita, lo que enseña que la reparación llegó a la mitad fiscal del
// bloque y no a la del IVA.
// Caso: Canarias · «Con renuncia a la exención IVA» · 80.000 €
//       → la app muestra «IGIC · No calculado» y «COSTE TOTAL (PARCIAL)»
//       → antes: 0 coincidencias de /IGIC|IPSI/ en el FAQPage y en la FAQ visible
//       → ahora: las dos bocas recogen la excepción, y el 21 % se lee de data/fiscal.
test('REPARADO 11/09 (contenido) — la FAQ y el FAQPage recogen que en Canarias no hay IVA que renunciar', async ({
  page,
}) => {
  await page.goto(RUTA);

  // El JSON-LD servido, que es lo que leen ChatGPT, Bing Copilot y Perplexity.
  const jsonLd = (await page.locator('script[type="application/ld+json"]').allTextContents()).join(' ');
  expect(jsonLd).toMatch(/IGIC/);
  expect(jsonLd).toMatch(/IPSI/);

  // Y la FAQ visible, en la misma página.
  const respuesta = page
    .locator('strong', { hasText: '¿Qué es la renuncia a la exención de IVA en tierras rústicas?' })
    .locator('xpath=following-sibling::p[1]');
  expect(await respuesta.innerText()).toMatch(/IGIC|IPSI/);
});
// ═══════════════════════════════════════════════════════════════════════════════
// RE-INSPECCIÓN del 12/09/2026
//
// Vuelve a la cola porque cambiaron sus dependencias: `7a02470c` (Aragón: bonificaciones en
// cuota, escala del art. 121-1), `e947fa55` (la tarifa del ISD vuelve al art. 21) y
// `21a13c6b` (32 hallazgos del 11/09, que tocó `data/fiscal/inmuebles.ts` y
// `data/itp-ccaa.ts`). Los ocho hallazgos anteriores se verificaron uno por uno: los ocho
// siguen reparados y sus testigos siguen en verde.
//
// Los tres casos están resueltos A MANO antes de ejecutar la app, con el desarrollo comentado
// junto a cada aserción. De dónde sale cada cifra, además de lo ya citado en la cabecera:
//   - Murcia 7,75 % → `TIPOS_ITP_CCAA_2025` (Ley 3/2025, efectos 25/07/2025). Es el único
//     tipo general con dos decimales del catálogo y ningún caso anterior lo tocaba.
//   - Melilla: `tipoGeneral: 6` declarado a mano en `data/itp-ccaa.ts` (no es CCAA), `ajd: 0.5`,
//     bonificación del 50 % de la cuota y de la cuota gradual de AJD por el art. 57 bis.1 y
//     3.a) del TRLITPAJD, que aplican `calcularITP` y `calcularAJD`, y `TERRITORIOS_SIN_IVA`
//     (allí rige el IPSI, no el IVA).
//
// La siembra va por `sembrarValor` de `_hidratacion.ts`: espera a que React haya montado el
// input y comprueba que su estado recogió el valor. La gestoría NO se siembra cuando el caso
// usa su valor por defecto (400 €), porque sembrar lo que el campo ya tiene no prueba nada.
// ═══════════════════════════════════════════════════════════════════════════════

/** Los dos campos de la app, por `aria-label`, para el helper de hidratación. */
const CAMPO_PRECIO = `input[aria-label="${PRECIO}"]`;
const CAMPO_GESTORIA = `input[aria-label="${GESTORIA}"]`;

/** Carga la app y espera a que sus dos inputs estén hidratados (también protege los clics). */
async function abrirHidratada(page: Page): Promise<void> {
  await page.goto(RUTA);
  await esperarHidratacion(page, [CAMPO_PRECIO, CAMPO_GESTORIA]);
}

/** Las líneas del recuadro de la comunidad, normalizadas. */
async function lineasPanelCcaa(page: Page): Promise<string[]> {
  const textos = await page.locator('[class*="infoCcaaItem"]').allInnerTexts();
  return textos.map((t) => t.replace(/\s+/g, ' ').trim());
}

test.describe('Re-inspección 12/09/2026 — Murcia al 7,75 % y Melilla sin IVA', () => {
  /**
   * CASO 1 (NORMAL) — Murcia, compra habitual, 120.000 €, gestoría 400 € (la de por defecto).
   *
   * Murcia es el único tipo general con dos decimales: 7,75 % desde la Ley 3/2025, sellado en
   * `TIPOS_ITP_CCAA_2025` y leído por `tipoGeneralDe('Murcia')`. No tiene escala progresiva,
   * así que el tipo EFECTIVO que imprime la tarjeta tiene que salir clavado al nominal, con
   * sus dos decimales y sin redondear a 8 %.
   */
  test('CASO 1 (normal) — Murcia, 120.000 €: el 7,75 % de la Ley 3/2025, con sus dos decimales', async ({ page }) => {
    await abrirHidratada(page);
    await page.getByRole('button', { name: /Compra habitual/ }).click();
    await page.selectOption('#select-ccaa', 'murcia');
    await sembrarValor(page, CAMPO_PRECIO, '120000');

    // ITP = 120.000 × 7,75 % = 9.300. «9300,00 €» sin punto de millar: es-ES no agrupa 4 cifras.
    expect(await valorTarjeta(page, 'ITP (')).toBe('9300,00 €');
    expect(await rotuloTarjeta(page, /^ITP \(/)).toBe('ITP (7,75%)');
    // Y el recuadro de la comunidad publica el mismo nominal, sin decimales de adorno
    // (`formatTipoNominal` da los que el número tiene: dos aquí, uno en el AJD de Melilla).
    expect(await lineasPanelCcaa(page)).toContain('ITP General 7,75%');

    // Compra habitual = exenta de IVA → no hay AJD.
    await expect(page.locator('h3', { hasText: /^AJD/ })).toHaveCount(0);

    // Notaría — arancel(120.000) con ARANCELES_NOTARIO (RD 1426/1989, número 2):
    //   tramo 1 (hasta 6.010,12)                  →                              90,15
    //   tramo 2 (0,45 %)  → 24.040,49 × 0,0045    =                         108,182205
    //   tramo 3 (0,15 %)  → 30.050,60 × 0,0015    =                          45,075900
    //   tramo 4 (0,10 %)  → 59.898,79 × 0,0010    =                          59,898790
    //   arancel sin IVA                           =                         303,306895
    //   con el 21 %                               = × 1,21 =              367,00134295
    //   FACTURA_NOTARIAL: ×1,5 = 550,502014 · ×2 = 734,002686 · medio = 642,25235016
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('642,25 €');
    const notaria = await descripcionTarjeta(page, 'Gastos de notaría');
    expect(notaria).toContain('550,50 €');
    expect(notaria).toContain('734,00 €');

    // Registro — arancel(120.000) con ARANCELES_REGISTRO (RD 1427/1989, número 2):
    //   24,04 + 42,0708575 + 37,563250 + (59.898,79 × 0,00075 = 44,9240925) = 148,5982
    //   + presentación 6,010121 + nota simple 3,005061 (REGISTRO_CONCEPTOS) = 157,613382
    //   con el 21 % = 190,71219222
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('190,71 €');

    // Gestoría: el valor por defecto de la app, sin tocar el campo.
    expect(await valorTarjeta(page, 'Gastos de gestoría')).toBe('400,00 €');

    // Total = 9.300 + 642,25 + 190,71 + 400 = 10.532,96 (líneas ya redondeadas al céntimo,
    // que es lo que hace `sumarLineasVisibles`). 10.532,96 / 120.000 = 8,777466 % → 8,78 %.
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('10.532,96 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toContain('8,78%');
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('130.532,96 €');
  });

  /**
   * CASO 2 (LÍMITE) — Melilla, «Con renuncia a la exención IVA», 300.000 €, gestoría 400 €.
   *
   * Es el cruce de las dos excepciones territoriales a la vez, y por eso es el caso límite:
   *   · allí NO rige el IVA (`TERRITORIOS_SIN_IVA.melilla` → IPSI), así que la app no puede
   *     cifrar el impuesto indirecto y tiene que decirlo en vez de inventar un 21 %;
   *   · el AJD sí se devenga, y su cuota gradual se bonifica al 50 % (art. 57 bis.1
   *     TRLITPAJD), que `calcularAJD` aplica por el SITIO del inmueble.
   */
  test('CASO 2 (límite) — Melilla con renuncia, 300.000 €: IPSI sin cifra y AJD bonificado al 50 %', async ({ page }) => {
    await abrirHidratada(page);
    await page.getByRole('button', { name: /renuncia a la exención/i }).click();
    await page.selectOption('#select-ccaa', 'melilla');
    await sembrarValor(page, CAMPO_PRECIO, '300000');

    // No hay IVA que liquidar: la tarjeta se rotula con el impuesto que sí rige y no da cifra.
    expect(await rotuloTarjeta(page, /^IPSI$/)).toBe('IPSI');
    expect(await valorTarjeta(page, 'IPSI')).toBe('No calculado');
    await expect(page.locator('h3', { hasText: /IVA \(renuncia/ })).toHaveCount(0);
    // Y se dice en palabras, con el nombre largo del impuesto (AvisoTerritorioSinIva).
    await expect(page.getByText(/En Ciudad Autónoma de Melilla no se aplica el IVA/)).toBeVisible();

    // AJD = 300.000 × 0,5 % = 1.500, bonificado al 50 % → 750,00 €.
    // (Sin la bonificación del art. 57 bis.1 serían 1.500: no es lo mismo.)
    expect(await valorTarjeta(page, 'AJD (')).toBe('750,00 €');
    // El recuadro de la ciudad publica la bonificación, que es lo que permite reconstruir
    // tanto esta cuota como la del ITP (reparación del hallazgo 729).
    const panel = await lineasPanelCcaa(page);
    expect(panel.some((l) => /Bonificación en cuota/.test(l) && /50%/.test(l))).toBe(true);

    // Notaría — arancel(300.000): 90,15 + 108,182205 + 45,0759 + 90,15182 (tramo 4 completo)
    //   + (149.746,97 × 0,0005 = 74,873485) = 408,43341 · con IVA = 494,2044261
    //   ×1,5 = 741,306639 · ×2 = 988,408852 · medio = 864,85774568
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('864,86 €');
    // Registro — arancel(300.000): 24,04 + 42,0708575 + 37,56325 + 67,613865
    //   + (149.746,97 × 0,0003 = 44,924091) = 216,2120635 + 9,015182 = 225,2272455
    //   con el 21 % = 272,52496706
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('272,52 €');

    // Total gastos = 0 (impuesto no calculado) + 750 + 864,86 + 272,52 + 400 = 2.287,38
    // 2.287,38 / 300.000 = 0,76246 % → 0,76 %, y se advierte de que va SIN el IPSI.
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('2287,38 €');
    const descTotal = await descripcionTarjeta(page, 'Total gastos adicionales');
    expect(descTotal).toContain('0,76%');
    expect(descTotal).toContain('SIN el IPSI');

    // Y el total se rotula PARCIAL, porque le falta un impuesto que sí se devenga.
    expect(await valorTarjeta(page, 'COSTE TOTAL (PARCIAL)')).toBe('302.287,38 €');
    await expect(page.locator('h3', { hasText: 'COSTE TOTAL DE ADQUISICIÓN' })).toHaveCount(0);
  });

  /**
   * CASO 3 (RECHAZO) — «2,5,3» en el precio y «300,50,2» en la gestoría.
   *
   * Es el gemelo con COMAS del «1.2.3» del 11/09, y no es un caso de laboratorio: quien
   * escribe los millares con coma («2,500,000») se queda a un dedo de teclear dos comas. En
   * `partesNumericas` la rama de comas devuelve `null` cuando hay más de una y el cuerpo no
   * encaja en AGRUPA_CON_COMA, así que `parseSpanishNumber` da NaN.
   *
   * La segunda mitad prueba el OTRO parser de la página: la gestoría pasa por
   * `parseSpanishNumberOr`, que ante NaN cae a 0, así que el total queda con tres líneas y
   * sin ninguna cifra fantasma.
   *
   * ⚠️ 22/09/2026 (hallazgo 1199) — hasta hoy pedía además que la tarjeta NO se pintara, y esa
   * mitad era el defecto: el importe desaparecía del desglose sin dejar rastro mientras el
   * coste seguía rotulado «todos los gastos». Las cifras NO cambian; la línea vuelve con
   * «Sin leer».
   */
  test('CASO 3 (rechazo) — «2,5,3» y «300,50,2»: los dos parsers caen del lado seguro', async ({ page }) => {
    await abrirHidratada(page);
    await page.getByRole('button', { name: /Compra habitual/ }).click();
    await page.selectOption('#select-ccaa', 'madrid');

    await sembrarValor(page, CAMPO_PRECIO, '2,5,3');
    // El campo conserva lo tecleado (el filtro /^-?[\d.,]*$/ de NumberInput no lo rechaza)...
    expect(await page.locator(CAMPO_PRECIO).inputValue()).toBe('2,5,3');
    // ...y la app no calcula nada: ni tarjetas ni cifra fantasma.
    await expect(page.getByText('Introduce el precio de la finca rústica para ver el desglose de gastos')).toBeVisible();
    await expect(page.locator('h3', { hasText: /^ITP \(/ })).toHaveCount(0);
    let cuerpo = await page.locator('body').innerText();
    expect(cuerpo).not.toContain('NaN');
    expect(cuerpo).not.toContain('No definido');
    // Y no asoma el 2,50 € que devolvería un parseFloat casero sobre «2,5,3».
    expect(cuerpo).not.toContain('2,50 €');

    // Ahora un precio válido y una gestoría que tampoco es un número.
    await sembrarValor(page, CAMPO_PRECIO, '100000');
    await sembrarValor(page, CAMPO_GESTORIA, '300,50,2');

    // ITP Madrid = 100.000 × 6 % = 6.000.
    expect(await valorTarjeta(page, 'ITP (')).toBe('6000,00 €');
    // Notaría — arancel(100.000): 90,15 + 108,182205 + 45,0759 + (39.898,79 × 0,001 =
    //   39,89879) = 283,306895 · con IVA = 342,80134295 · medio ×1,75 = 599,90235016
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('599,90 €');
    // Registro — arancel(100.000): 24,04 + 42,0708575 + 37,56325 + (39.898,79 × 0,00075 =
    //   29,9240925) = 133,5982 + 9,015182 = 142,613382 · con el 21 % = 172,56219222
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('172,56 €');
    // La gestoría cae a 0 en el cálculo, pero su línea se pinta igual diciendo que el importe
    // escrito no se ha podido leer: un dato que falta no es un cero.
    expect(await valorTarjeta(page, 'Gastos de gestoría')).toBe('Sin leer');
    expect(await descripcionTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe(
      'No incluye la gestoría, que no se ha podido leer: el coste real será mayor',
    );
    // Total = 6.000 + 599,90 + 172,56 = 6.772,46 · 6.772,46 / 100.000 = 6,77246 % → 6,77 %
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('6772,46 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toContain('6,77%');
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('106.772,46 €');

    cuerpo = await page.locator('body').innerText();
    expect(cuerpo).not.toContain('NaN');
    expect(cuerpo).not.toContain('No definido');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// HALLAZGOS de la re-inspección del 12/09/2026 — fallan A PROPÓSITO.
// Afirman lo que debería pasar; cuando se reparen quedan como test de regresión.
// Los tres son «efecto familia»: el defecto se reparó en una hermana del clúster —con su
// número de hallazgo escrito en el código— y no llegó a ésta.
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('Hallazgos abiertos — re-inspección 12/09/2026', () => {
  /**
   * HALLAZGO A (contenido, medio) — la tarjeta del AJD se rotula con el tipo NOMINAL de la
   * tabla mientras el motor bonifica la cuota al 50 % en Ceuta y Melilla (art. 57 bis.1
   * TRLITPAJD, dentro de `calcularAJD`). El resultado es un rótulo que desmiente a su propia
   * cifra por el doble, en la misma pantalla en que el ITP de al lado sí lleva el efectivo.
   *
   * Es exactamente el hallazgo 447, reparado en `garaje`, `trastero`, `local-comercial` y
   * `nave-industrial` —las cuatro titulan `AJD (ajd / precio × 100 %)` y lo dejan comentado—,
   * y pendiente aquí y en `solar`, que siguen con `formatNumber(datosCcaaActual.ajd, 2)`.
   *
   * Caso: Melilla · «Con renuncia a la exención IVA» · 300.000 €
   *       → esperado «AJD (0,25%)» = 750,00 € · obtenido «AJD (0,50%)» = 750,00 €
   *       (750 / 300.000 = 0,25 %; el 0,5 % daría 1.500 €).
   */
  test('HALLAZGO A — el rótulo del AJD lleva el tipo efectivo, no el nominal sin bonificar', async ({ page }) => {
    await abrirHidratada(page);
    await page.getByRole('button', { name: /renuncia a la exención/i }).click();
    await page.selectOption('#select-ccaa', 'melilla');
    await sembrarValor(page, CAMPO_PRECIO, '300000');

    // La cuota está bien; lo que miente es el rótulo.
    expect(await valorTarjeta(page, 'AJD (')).toBe('750,00 €');
    expect(await rotuloTarjeta(page, /^AJD \(/)).toBe('AJD (0,25%)');
  });

  /**
   * HALLAZGO B (contenido, medio) — en Canarias, Ceuta y Melilla la página sigue anunciando
   * un IVA del 21 % en dos sitios mientras la propia calculadora se niega a cifrarlo:
   *   · el recuadro de la comunidad imprime «IVA (renuncia) 21%» en las 19 opciones del
   *     desplegable, también en las tres donde no existe el IVA;
   *   · el subtítulo del botón de régimen dice «IVA 21% (ISP) + AJD» pase lo que pase.
   * Y a la vez, dos dedos más abajo, la tarjeta dice «IGIC → No calculado» y el aviso dice
   * «En Canarias no se aplica el IVA». Es la misma clase de contradicción que el hallazgo 729
   * («ITP General 6%» frente a una cuota del 3 %), que aquí ya se reparó para el ITP.
   *
   * `nave-industrial` condiciona las dos cosas al territorio (`territorioActualSinIva`):
   * su recuadro dice «IPSI (obra nueva) → No calculado» y su botón «Paga IPSI + AJD».
   *
   * Caso: Canarias · «Con renuncia a la exención IVA» · 300.000 €
   *       → esperado: ninguna línea de la página promete un IVA del 21 % en Canarias
   *       → obtenido: recuadro «IVA (renuncia) 21%» y botón «IVA 21% (ISP) + AJD»
   *         junto a «IGIC / No calculado» y «COSTE TOTAL (PARCIAL)».
   */
  test('HALLAZGO B — en Canarias ni el recuadro ni el botón prometen un IVA del 21 %', async ({ page }) => {
    await abrirHidratada(page);
    await page.getByRole('button', { name: /renuncia a la exención/i }).click();
    await page.selectOption('#select-ccaa', 'canarias');
    await sembrarValor(page, CAMPO_PRECIO, '300000');

    // Lo que la calculadora hace de verdad, y que está bien:
    expect(await valorTarjeta(page, 'IGIC')).toBe('No calculado');

    // Lo que la misma pantalla sigue prometiendo:
    const panel = await lineasPanelCcaa(page);
    expect(panel.some((l) => /IVA \(renuncia\) 21%/.test(l))).toBe(false);

    const botones = await page.locator('[class*="transmisionBtn"]').allInnerTexts();
    expect(botones.some((b) => /IVA 21%/.test(b.replace(/\s+/g, ' ')))).toBe(false);
  });

  /**
   * HALLAZGO C (accesibilidad, medio) — la tabla comparativa del bloque educativo colorea sus
   * celdas con hexadecimales escritos en línea, sin token ni variante de tema, y dos de ellos
   * no llegan al 4,5:1 de WCAG AA en el tema claro:
   *   · `#27ae60` («No aplica», «Sí (21% + AJD)») → 2,64:1 y 2,75:1
   *   · la cabecera blanca sobre `var(--primary)` (#2E86AB), 14,4 px bold → 4,11:1
   * Y el color tampoco porta un dato coherente: en la fila del IVA el rojo marca «No (exento)»
   * y en la de la plusvalía el verde marca «No aplica», de modo que el mismo color dice cosas
   * opuestas en filas contiguas. El dato lo lleva la palabra, no el color.
   *
   * Es el hallazgo 648, reparado en `nave-industrial` con `.celdaSi` (#176A3A) y `.celdaNo`
   * (#B32D1F) más sus variantes `[data-theme='dark']`, y cuya cabecera CSS documenta el mismo
   * 2,66:1 para este verde. Aquí siguen los dos hexadecimales en línea (grep `#27ae60`).
   *
   * Caso: abrir «Guía fiscal para la compra de una finca rústica» y medir la celda
   *       «No aplica» → esperado ≥ 4,5:1 · obtenido 2,64:1 (#27ae60 sobre #F5F5F5).
   */
  test('HALLAZGO C — la tabla comparativa del bloque educativo llega a 4,5:1 (WCAG AA)', async ({ page }) => {
    await page.goto(RUTA);
    // El bloque educativo llega plegado: se abre por su disclosure (aria-expanded).
    await page.locator('button[aria-expanded]').first().click();

    const luminancia = ([r, g, b]: number[]): number => {
      const canal = (c: number): number => {
        const s = c / 255;
        return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
      };
      return 0.2126 * canal(r) + 0.7152 * canal(g) + 0.0722 * canal(b);
    };
    const aRgb = (css: string): number[] => (css.match(/\d+(\.\d+)?/g) ?? []).slice(0, 3).map(Number);

    for (const texto of ['No aplica', 'Concepto']) {
      const celda = page.locator('td, th').filter({ hasText: new RegExp(`^${texto}$`) }).first();
      await expect(celda).toBeVisible();
      const { color, fondo, px, negrita } = await celda.evaluate((el) => {
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
        const est = getComputedStyle(el as HTMLElement);
        return {
          color: est.color,
          fondo,
          px: parseFloat(est.fontSize),
          negrita: Number(est.fontWeight) >= 700,
        };
      });

      const l1 = luminancia(aRgb(color));
      const l2 = luminancia(aRgb(fondo));
      const contraste = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
      // Umbral de texto grande: ≥24 px, o ≥18,66 px en negrita. Ninguna celda llega.
      const umbral = px >= 24 || (negrita && px >= 18.66) ? 3 : 4.5;
      expect(
        contraste,
        `«${texto}»: ${color} sobre ${fondo}, ${px}px${negrita ? ' bold' : ''} = ${contraste.toFixed(2)}:1`,
      ).toBeGreaterThanOrEqual(umbral);
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// RE-INSPECCIÓN del 23/09/2026 — app de la FAMILIA «Compraventa inmobiliaria» (grupo B)
//
// Vuelve a la cola por las dos reparaciones de familia que la tocaron:
//   · `cfe091a7` (22/09) — la gestoría ilegible deja de valer 0 en silencio: la tarjeta se
//     pinta con «Sin leer» y el total dice que le falta, y en qué dirección («el coste real
//     será mayor»).
//   · `8d7dcd1b` (23/09) — con el precio escrito pero ilegible, el marcador dice «No se ha
//     podido leer el precio «…»» en vez de pedir que se introduzca.
// El testigo de familia (`tests/familias/compraventa.spec.ts`) mide las dos en el caso base
// (Madrid · ITP · 80.000 €). Aquí NO se repite campo a campo: se mide lo que el testigo no
// cubre — los tres estados del marcador del precio, y la gestoría ilegible cruzada con el
// régimen de renuncia en un territorio sin IVA y con los cambios de régimen y de comunidad.
//
// Territorios y regímenes NUEVOS respecto de las tres vueltas anteriores (26/08: Madrid,
// Ceuta, Cataluña, País Vasco y Canarias · 11/09: Aragón · 12/09: Murcia y Melilla):
// Castilla y León (con y sin renuncia), Baleares y Navarra. Todo resuelto A MANO antes de
// ejecutar la app. De dónde sale cada cifra:
//   - Tipo general de ITP → `TIPOS_ITP_CCAA_2025` (data/fiscal/inmuebles.ts), que lee
//     `tipoGeneralDe()`: Castilla y León 8 · Canarias 6,5 · Navarra 6.
//   - Escalas progresivas y AJD → `ITP_CCAA` (data/itp-ccaa.ts): Castilla y León
//     [8 % hasta 250.000 · 10 %], `ajd: 1.5` · Baleares [8 % hasta 400.000 · 9 % hasta
//     600.000 · 10 % hasta 1.000.000 · 12 % hasta 2.000.000 · 13 %] · Canarias `ajd: 0.75`.
//   - IVA de la renuncia → `PORCENTAJES_IVA.general = 21` (data/fiscal/iva.ts), que la app
//     importa como `IVA_RENUNCIA`. Canarias fuera del IVA → `TERRITORIOS_SIN_IVA` (IGIC).
//   - Notaría → `ARANCELES_NOTARIO` (RD 1426/1989, número 2) con su 21 % de IVA y la
//     horquilla `FACTURA_NOTARIAL` ×1,5 / ×2 (la tarjeta enseña el punto medio, ×1,75).
//   - Registro → `ARANCELES_REGISTRO` (RD 1427/1989, número 2), tope `REGISTRO_MAXIMO`
//     2.181,67, + `REGISTRO_CONCEPTOS` (presentación 6,010121 + nota simple 3,005061), × 1,21.
//   - Los totales suman las líneas YA redondeadas al céntimo (`sumarLineasVisibles`).
//
// Las cifras se comparan como texto al céntimo: el defecto que vigilan (un tramo mal partido,
// un tipo equivocado) mueve cientos o miles de euros, y un redondeo distinto al del desglose
// —que la app ya tuvo, hallazgo 594— mueve exactamente un céntimo, que también debe saltar.
// ═══════════════════════════════════════════════════════════════════════════════

import { PORCENTAJES_IVA } from '../../data/fiscal/iva';

test.describe('Re-inspección 23/09/2026 — Castilla y León, Baleares en su tramo del 13 % y la gestoría ilegible', () => {
  /**
   * CASO 1 (NORMAL) — Castilla y León, compra habitual, 45.000 €, gestoría 350 €; y la MISMA
   * operación con renuncia a la exención.
   *
   * Un precio corriente de finca rústica, por debajo de los 60.101,21 € que ningún caso
   * anterior había bajado: el arancel se corta dentro de su TERCER tramo, no del cuarto.
   * Castilla y León tiene escala (8 % → 10 %), pero 45.000 € quedan dentro del primer tramo,
   * así que el efectivo tiene que salir clavado al 8 % nominal.
   */
  test('CASO 1 (normal) — Castilla y León, 45.000 €: ITP del 8 % y, con renuncia, IVA 21 % + AJD 1,5 %', async ({ page }) => {
    await abrirHidratada(page);
    await page.getByRole('button', { name: /Compra habitual/ }).click();
    await page.selectOption('#select-ccaa', 'castilla-leon');
    await sembrarValor(page, CAMPO_PRECIO, '45000');
    await sembrarValor(page, CAMPO_GESTORIA, '350');

    // ITP = 45.000 × 8 % = 3.600 (primer tramo de la escala, hasta 250.000 €).
    expect(await valorTarjeta(page, 'ITP (')).toBe('3600,00 €');
    expect(await rotuloTarjeta(page, /^ITP \(/)).toBe('ITP (8,00%)');
    await expect(page.getByText(/escala progresiva \(8% → 10%\)/)).toBeVisible();
    // Compra habitual = exenta de IVA → sin AJD.
    await expect(page.locator('h3', { hasText: /^AJD/ })).toHaveCount(0);

    // Notaría — arancel(45.000):
    //   tramo 1                                  →                        90,15
    //   tramo 2 (0,45 %)  → 24.040,49 × 0,0045   =                   108,182205
    //   tramo 3 (0,15 %)  → (45.000 − 30.050,61) = 14.949,39 × 0,0015 = 22,424085
    //   arancel sin IVA = 220,75629 · × 1,21 = 267,1151109
    //   ×1,5 = 400,67266635 · ×2 = 534,2302218 · punto medio = 467,45144408
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('467,45 €');
    const notaria = await descripcionTarjeta(page, 'Gastos de notaría');
    expect(notaria).toContain('400,67 €');
    expect(notaria).toContain('534,23 €');

    // Registro — arancel(45.000):
    //   24,04 + 24.040,49 × 0,00175 (42,0708575) + 14.949,39 × 0,00125 (18,6867375)
    //   = 84,797595 + 6,010121 + 3,005061 = 93,812777 · × 1,21 = 113,51346017
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('113,51 €');
    expect(await valorTarjeta(page, 'Gastos de gestoría')).toBe('350,00 €');

    // Total = 3.600 + 467,45 + 113,51 + 350 = 4.530,96 · 4.530,96 / 45.000 = 10,0688 % → 10,07 %
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('4530,96 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toContain('10,07%');
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('49.530,96 €');
    expect(await descripcionTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('Precio + todos los gastos de la operación');

    // La MISMA finca con renuncia a la exención (art. 20.Dos LIVA): desaparece el ITP y entran
    // el IVA del tipo general y el AJD de la comunidad. Notaría, registro y gestoría no cambian.
    await page.getByRole('button', { name: /renuncia a la exención/i }).click();
    await expect(page.locator('h3', { hasText: /^ITP \(/ })).toHaveCount(0);
    // IVA = 45.000 × 21 % = 9.450
    expect(await rotuloTarjeta(page, /^IVA \(renuncia/)).toBe('IVA (renuncia · ISP) (21,00%)');
    expect(await valorTarjeta(page, 'IVA (renuncia')).toBe('9450,00 €');
    // AJD = 45.000 × 1,5 % = 675 (Castilla y León no bonifica: el efectivo es el nominal)
    expect(await rotuloTarjeta(page, /^AJD \(/)).toBe('AJD (1,50%)');
    expect(await valorTarjeta(page, 'AJD (')).toBe('675,00 €');
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('467,45 €');
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('113,51 €');
    // Total = 9.450 + 675 + 467,45 + 113,51 + 350 = 11.055,96 · / 45.000 = 24,5688 % → 24,57 %
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('11.055,96 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toContain('24,57%');
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('56.055,96 €');
    expect(await descripcionTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe(
      'Precio + todos los gastos (antes de deducir el IVA si tienes derecho)',
    );
  });

  /**
   * CASO 2 (LÍMITE) — Baleares, compra habitual: 2.000.000 € (corte exacto del tramo del 12 %)
   * y 2.500.000 € (dentro del tramo MÁS ALTO de la escala más larga del catálogo, el 13 %).
   *
   * Es además el primer caso de esta app que entra en el SEXTO tramo del arancel notarial
   * (de 601.012,10 a 6.010.121,04 €, al 0,03 %) y en el sexto del registral (0,02 %).
   * El Cataluña 1.000.000 € del 26/08 solo comprobaba el ITP.
   */
  test('CASO 2 (límite) — Baleares, 2.000.000 € y 2.500.000 €: la escala hasta su tramo del 13 %', async ({ page }) => {
    await abrirHidratada(page);
    await page.getByRole('button', { name: /Compra habitual/ }).click();
    await page.selectOption('#select-ccaa', 'baleares');
    await expect(page.getByText(/escala progresiva \(8% → 9% → 10% → 12% → 13%\)/)).toBeVisible();

    // 2.000.000 € → 400.000 × 8 % (32.000) + 200.000 × 9 % (18.000) + 400.000 × 10 % (40.000)
    //             + 1.000.000 × 12 % (120.000) = 210.000 € · efectivo 10,50 %
    await sembrarValor(page, CAMPO_PRECIO, '2000000');
    expect(await valorTarjeta(page, 'ITP (')).toBe('210.000,00 €');
    expect(await rotuloTarjeta(page, /^ITP \(/)).toBe('ITP (10,50%)');

    // 2.500.000 € → 210.000 + 500.000 × 13 % (65.000) = 275.000 € · efectivo 11,00 %
    // (un tipo plano del 8 % habría dado 200.000 €; uno del 13 %, 325.000 €)
    await sembrarValor(page, CAMPO_PRECIO, '2500000');
    expect(await valorTarjeta(page, 'ITP (')).toBe('275.000,00 €');
    expect(await rotuloTarjeta(page, /^ITP \(/)).toBe('ITP (11,00%)');

    // Notaría — arancel(2.500.000):
    //   90,15 + 108,182205 + 45,0759 + 90,15182 (tramos 1-4 completos)
    //   + tramo 5 (601.012,10 − 150.253,03 = 450.759,07 × 0,0005) = 225,379535
    //   + tramo 6 (2.500.000 − 601.012,10 = 1.898.987,90 × 0,0003) = 569,69637
    //   arancel sin IVA = 1.128,63583 · × 1,21 = 1.365,6493543
    //   ×1,5 = 2.048,47403 · ×2 = 2.731,29871 · punto medio = 2.389,88637
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('2389,89 €');
    const notaria = await descripcionTarjeta(page, 'Gastos de notaría');
    expect(notaria).toContain('2048,47 €');
    expect(notaria).toContain('2731,30 €');

    // Registro — arancel(2.500.000):
    //   24,04 + 42,0708575 + 37,56325 + 67,613865 (tramos 1-4 completos)
    //   + tramo 5 (450.759,07 × 0,0003) = 135,227721
    //   + tramo 6 (1.898.987,90 × 0,0002) = 379,79758
    //   = 686,3132735 (por debajo del tope 2.181,67) + 9,015182 = 695,3284555
    //   × 1,21 = 841,34743116
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('841,35 €');
    // Gestoría: la de por defecto (400 €), sin sembrar lo que el campo ya tiene.
    expect(await valorTarjeta(page, 'Gastos de gestoría')).toBe('400,00 €');

    // Total = 275.000 + 2.389,89 + 841,35 + 400 = 278.631,24 · / 2.500.000 = 11,14525 % → 11,15 %
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('278.631,24 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toContain('11,15%');
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('2.778.631,24 €');
  });

  /**
   * CASO 3 (RECHAZO) — lo que la app NO puede leer, y que por tanto no debe convertir en cifra.
   *
   * (1) Los tres estados del precio que distingue `8d7dcd1b`: VACÍO («Introduce…»), ILEGIBLE
   *     («No se ha podido leer el precio «…»») y CERO, que es un número legible pero no un
   *     precio: se queda en el mensaje del vacío, igual que en la referencia
   *     `estimador-compraventa-inmueble`. En ninguno hay tarjetas.
   * (2) La gestoría ilegible de `cfe091a7` cruzada con lo que el testigo de familia no prueba:
   *     Canarias con renuncia (el IGIC tampoco está en el total, así que el aviso tiene que
   *     juntar las DOS ausencias), y que siga nombrada al cambiar de régimen y de comunidad,
   *     y desaparezca en cuanto el importe se puede leer.
   */
  test('CASO 3 (rechazo) — precio vacío, ilegible y cero; gestoría ilegible en Canarias con renuncia, que sobrevive al cambio de régimen y de comunidad', async ({ page }) => {
    await abrirHidratada(page);
    const VACIO = 'Introduce el precio de la finca rústica para ver el desglose de gastos';
    const marcador = page.getByText(/Introduce el precio de la finca rústica/);
    const tarjetas = page.locator('h3', { hasText: /COSTE TOTAL|^ITP \(|^IGIC$/ });

    // (1a) VACÍO — el estado de partida de la app (no se siembra: el campo ya está vacío).
    expect(await page.locator(CAMPO_PRECIO).inputValue()).toBe('');
    expect((await marcador.innerText()).trim()).toBe(VACIO);
    await expect(tarjetas).toHaveCount(0);

    // (1b) ILEGIBLE — dos puntos y el último grupo de dos cifras: `partesNumericas` da null.
    await sembrarValor(page, CAMPO_PRECIO, '150.000.00');
    expect((await marcador.innerText()).trim()).toBe(
      'No se ha podido leer el precio «150.000.00». Introduce el precio de la finca rústica para ver el desglose de gastos, con coma decimal (80.000 o 80000,50)',
    );
    await expect(tarjetas).toHaveCount(0);

    // (1c) CERO — legible, pero la app exige precio > 0: vuelve el mensaje del vacío, sin
    // decir que no se ha podido leer (se ha leído: es un cero).
    await sembrarValor(page, CAMPO_PRECIO, '0');
    expect((await marcador.innerText()).trim()).toBe(VACIO);
    await expect(tarjetas).toHaveCount(0);

    // (2) Canarias · renuncia · 150.000 € · gestoría «2.000.50».
    await page.getByRole('button', { name: /renuncia a la exención/i }).click();
    await page.selectOption('#select-ccaa', 'canarias');
    await sembrarValor(page, CAMPO_PRECIO, '150000');
    await sembrarValor(page, CAMPO_GESTORIA, '2.000.50');

    // Sin IVA que liquidar (IGIC, no calculado) y AJD = 150.000 × 0,75 % = 1.125.
    expect(await valorTarjeta(page, 'IGIC')).toBe('No calculado');
    expect(await valorTarjeta(page, 'AJD (')).toBe('1125,00 €');
    // Notaría — arancel(150.000) = 90,15 + 108,182205 + 45,0759 + 89.898,79 × 0,001 (89,89879)
    //   = 333,306895 · × 1,21 = 403,30134295 · × 1,75 = 705,77735 → 705,78
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('705,78 €');
    // Registro — 24,04 + 42,0708575 + 37,56325 + 89.898,79 × 0,00075 (67,4240925) = 171,0982
    //   + 9,015182 = 180,113382 · × 1,21 = 217,93719 → 217,94
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('217,94 €');
    expect(await valorTarjeta(page, 'Gastos de gestoría')).toBe('Sin leer');
    // Total = 0 + 1.125 + 705,78 + 217,94 = 2.048,72 · / 150.000 = 1,36581 % → 1,37 %
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('2048,72 €');
    const descTotal = await descripcionTarjeta(page, 'Total gastos adicionales');
    expect(descTotal).toContain('1,37%');
    expect(descTotal).toContain('SIN el IGIC');
    expect(descTotal).toContain('SIN la gestoría, que no se ha podido leer');
    // Las DOS ausencias en la misma frase, y la dirección: lo que falta SUBE el coste.
    expect(await valorTarjeta(page, 'COSTE TOTAL (PARCIAL)')).toBe('152.048,72 €');
    expect(await descripcionTarjeta(page, 'COSTE TOTAL (PARCIAL)')).toBe(
      'No incluye el IGIC ni la gestoría, que no se ha podido leer: el coste real será mayor',
    );

    // Cambio de RÉGIMEN: Canarias, compra habitual → ITP 6,5 % × 150.000 = 9.750. El IGIC sale
    // del aviso; la gestoría ilegible, no.
    await page.getByRole('button', { name: /Compra habitual/ }).click();
    expect(await rotuloTarjeta(page, /^ITP \(/)).toBe('ITP (6,50%)');
    expect(await valorTarjeta(page, 'ITP (')).toBe('9750,00 €');
    expect(await valorTarjeta(page, 'Gastos de gestoría')).toBe('Sin leer');
    // Total = 9.750 + 705,78 + 217,94 = 10.673,72
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('10.673,72 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).not.toContain('IGIC');
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('160.673,72 €');
    expect(await descripcionTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe(
      'No incluye la gestoría, que no se ha podido leer: el coste real será mayor',
    );

    // Cambio de COMUNIDAD: Navarra → ITP 6 % × 150.000 = 9.000 · total 9.000 + 705,78 + 217,94
    await page.selectOption('#select-ccaa', 'navarra');
    expect(await valorTarjeta(page, 'ITP (')).toBe('9000,00 €');
    expect(await valorTarjeta(page, 'Gastos de gestoría')).toBe('Sin leer');
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('9923,72 €');
    expect(await descripcionTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toContain('la gestoría, que no se ha podido leer');

    // Y el aviso se va en cuanto el importe es legible: gestoría 450 → total 10.373,72.
    await sembrarValor(page, CAMPO_GESTORIA, '450');
    expect(await valorTarjeta(page, 'Gastos de gestoría')).toBe('450,00 €');
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('10.373,72 €');
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('160.373,72 €');
    expect(await descripcionTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('Precio + todos los gastos de la operación');
    const panel = await page.locator('[class*="resultados"]').first().innerText();
    expect(panel).not.toContain('no se ha podido leer');
    expect(panel).not.toContain('Sin leer');
    expect(panel).not.toContain('NaN');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// HALLAZGOS de la re-inspección del 23/09/2026 — los marcados con `test.fail()` fallan A
// PROPÓSITO por la aserción del defecto (la preparación va antes y pasa); al repararse,
// Playwright los da por «expected to fail» y hay que quitar la marca: quedan de regresión.
// Los cuatro son «efecto familia»: lo que se reparó en una hermana y no llegó a ésta.
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('Hallazgos abiertos — re-inspección 23/09/2026', () => {
  /**
   * HALLAZGO D (contenido, medio) — con la renuncia elegida en Canarias, Ceuta o Melilla, el
   * recuadro propio de esta app («⚠️ Renuncia a la exención de IVA (Art. 20.Dos LIVA)») sigue
   * afirmando que «El IVA se autoliquida por inversión del sujeto pasivo y es deducible si
   * tienes derecho», justo encima de `<AvisoTerritorioSinIva>` («En Canarias no se aplica el
   * IVA») y a la izquierda de la tarjeta «IGIC · No calculado».
   *
   * Es la reparación de `nave-industrial` (hallazgos 647 y 1177) que no llegó aquí: su
   * `avisoRenuncia` se condiciona a `territorioActualSinIva` y en esos territorios dice que
   * «ni la renuncia a la exención ni la inversión del sujeto pasivo del IVA entran en juego».
   * El subtítulo del botón y el recuadro de la comunidad de ESTA app ya se condicionaron el
   * 12/09 (hallazgo B); este recuadro, que es exclusivo de la finca rústica, se quedó fuera.
   *
   * Caso: Canarias · «Con renuncia a la exención IVA» · 150.000 €
   *       → esperado: ningún texto afirma que el IVA se autoliquida
   *       → obtenido: «El IVA se autoliquida por inversión del sujeto pasivo y es deducible…»
   */
  test('HALLAZGO D — en Canarias con renuncia, el aviso de la renuncia no afirma que «el IVA se autoliquida»', async ({ page }) => {
    test.fail();
    await abrirHidratada(page);
    await page.getByRole('button', { name: /renuncia a la exención/i }).click();
    await page.selectOption('#select-ccaa', 'canarias');
    await sembrarValor(page, CAMPO_PRECIO, '150000');

    // Preparación (pasa): la calculadora sabe que allí no hay IVA, y lo dice.
    expect(await valorTarjeta(page, 'IGIC')).toBe('No calculado');
    await expect(page.getByText(/En Canarias no se aplica el IVA/)).toBeVisible();
    const aviso = page.locator('[class*="renunciaAviso"]');
    await expect(aviso).toBeVisible();

    // El defecto: el recuadro de la renuncia lo contradice en la misma pantalla.
    expect(await aviso.innerText()).not.toMatch(/El IVA se autoliquida/);
  });

  /**
   * HALLAZGO E (contenido, bajo) — cuando falta el IGIC o el IPSI, «COSTE TOTAL (PARCIAL)» se
   * rotula parcial pero «Total gastos adicionales», que tiene el mismo hueco, no: lo dice solo
   * en la descripción («SIN el IGIC»). La referencia `estimador-compraventa-inmueble` y cuatro
   * hermanas (garaje, trastero, local-comercial, nave-industrial) titulan
   * `impuestoNoCalculado ? 'Total gastos adicionales (parcial)' : …`; solo `solar` y esta app
   * dejan el título fijo.
   *
   * Caso: Canarias · renuncia · 150.000 € → esperado «Total gastos adicionales (parcial)»
   *       · obtenido «Total gastos adicionales» (2.048,72 €) junto a «COSTE TOTAL (PARCIAL)».
   */
  test('HALLAZGO E — sin el IGIC, «Total gastos adicionales» se rotula parcial como el COSTE TOTAL', async ({ page }) => {
    test.fail();
    await abrirHidratada(page);
    await page.getByRole('button', { name: /renuncia a la exención/i }).click();
    await page.selectOption('#select-ccaa', 'canarias');
    await sembrarValor(page, CAMPO_PRECIO, '150000');

    // Preparación (pasa): la cifra es la de siempre y el cierre ya se declara parcial.
    // Total = 1.125 (AJD) + 705,78 + 217,94 + 400 (gestoría por defecto) = 2.448,72
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('2448,72 €');
    await expect(page.locator('h3', { hasText: 'COSTE TOTAL (PARCIAL)' })).toHaveCount(1);

    // El defecto: la otra tarjeta con el mismo hueco no lo lleva en el título.
    expect(await rotuloTarjeta(page, /^Total gastos adicionales/)).toBe('Total gastos adicionales (parcial)');
  });

  /**
   * HALLAZGO F (contenido, bajo) — el bloque educativo conserva dos frases que prometen IVA sin
   * la excepción territorial que la FAQ visible y el FAQPage ya recogen (reparación 728 del
   * 11/09, que llegó a la FAQ y no al resto del bloque — la pista (a)/(b) de la familia):
   *   · caso de uso «Empresa compra finca a otra empresa»: «La compra pasa a IVA 21% con
   *     inversión del sujeto pasivo, que el comprador autoliquida y deduce»;
   *   · la tabla «Finca rústica frente a solar edificable», fila «¿Sujeto a IVA por
   *     empresario?», columna del solar: «Sí (21% + AJD)». El FAQPage de la MISMA comparación
   *     («¿En qué se diferencia…?») sí dice que en Canarias, Ceuta y Melilla es IGIC o IPSI.
   *
   * Caso: bloque educativo, leído con `textContent` (llega plegado)
   *       → esperado: el caso de uso y la tabla mencionan IGIC/IPSI (o Canarias, Ceuta y Melilla)
   *       → obtenido: ninguno de los dos.
   */
  test('HALLAZGO F — el caso de uso de empresas y la tabla del solar recogen que en Canarias, Ceuta y Melilla no hay IVA', async ({ page }) => {
    test.fail();
    await page.goto(RUTA);

    // Preparación (pasa): las dos piezas existen, y la FAQ de al lado ya tiene la excepción.
    const casoEmpresa = page
      .locator('strong', { hasText: 'Empresa compra finca a otra empresa' })
      .locator('xpath=following-sibling::p[1]');
    const textoCaso = (await casoEmpresa.textContent()) ?? '';
    expect(textoCaso).toContain('inversión del sujeto pasivo');
    const tabla =
      (await page
        .locator('section', { has: page.locator('h2', { hasText: 'Finca rústica frente a solar edificable' }) })
        .last()
        .textContent()) ?? '';
    expect(tabla).toContain('¿Sujeto a IVA por empresario?');
    const faqRenuncia = page
      .locator('strong', { hasText: '¿Qué es la renuncia a la exención de IVA en tierras rústicas?' })
      .locator('xpath=following-sibling::p[1]');
    expect((await faqRenuncia.textContent()) ?? '').toMatch(/IGIC|IPSI/);

    // El defecto, en las dos piezas.
    expect.soft(textoCaso, 'caso de uso «Empresa compra finca a otra empresa»').toMatch(/IGIC|IPSI|Canarias/);
    expect.soft(tabla, 'tabla «Finca rústica frente a solar edificable»').toMatch(/IGIC|IPSI|Canarias/);
  });

  /**
   * HALLAZGO G (dato, bajo) — GUARDIA. Esas mismas dos frases escriben el tipo del IVA a mano
   * («IVA 21%» y «Sí (21% + AJD)», page.tsx) cuando el propio fichero ya lo lee de data/fiscal
   * como `IVA_RENUNCIA = PORCENTAJES_IVA.general` para el botón, el recuadro de la comunidad y
   * la FAQ. Es el hallazgo 806 (el subtítulo del botón), reparado el 13/09 en una sola de las
   * tres apariciones.
   *
   * Hoy coinciden (21 = 21), así que el test PASA: su valor es de guardia, como el HALLAZGO 5
   * del 26/08. El día que `PORCENTAJES_IVA.general` se mueva y el texto no, se pone rojo.
   */
  test('HALLAZGO G (guardia) — el «21%» escrito a mano en el caso de uso y en la tabla sigue coincidiendo con data/fiscal', async ({ page }) => {
    await page.goto(RUTA);
    const general = PORCENTAJES_IVA.general; // 21 — data/fiscal/iva.ts

    const textoCaso =
      (await page
        .locator('strong', { hasText: 'Empresa compra finca a otra empresa' })
        .locator('xpath=following-sibling::p[1]')
        .textContent()) ?? '';
    expect(textoCaso).toContain(`IVA ${general}%`);

    const fila = (await page.locator('tr', { hasText: '¿Sujeto a IVA por empresario?' }).textContent()) ?? '';
    expect(fila).toContain(`${general}% + AJD`);
  });
});
