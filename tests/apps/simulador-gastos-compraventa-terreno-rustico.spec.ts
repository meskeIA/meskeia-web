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
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('7395,21 €');
    // 7.395,207713 / 200.000 = 3,6976039 % → «3,70%»
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toContain('3,70%');
    // Coste total = 200.000 + 7.395,207713 = 207.395,207713
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('207.395,21 €');
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
// HALLAZGOS ABIERTOS del 26/08/2026. Todos fallan HOY a propósito.
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('Hallazgos abiertos — 26/08/2026', () => {
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
