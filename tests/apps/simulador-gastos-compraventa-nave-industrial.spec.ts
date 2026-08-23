/**
 * Inspector — simulador-gastos-compraventa-nave-industrial (segmento CÁLCULO/FISCAL, riesgo 1 CRÍTICO)
 * Tanda del 21/08/2026. Apps hermanas ya inspeccionadas: garaje, trastero y estimador de inmueble.
 *
 * De dónde sale CADA cifra esperada (ninguna de memoria):
 *  - Tipo general de ITP por CCAA → `TIPOS_ITP_CCAA_2025` en `data/fiscal/inmuebles.ts`,
 *    que `tipoGeneralDe()` de `data/itp-ccaa.ts` lee para rellenar `ITP_CCAA[x].tipoGeneral`
 *    (Madrid = 6 · Canarias = 6,5 · Murcia = 7,75 · Valencia = 9 · Baleares = 8).
 *  - Escalas progresivas y AJD por comunidad → `ITP_CCAA` en `data/itp-ccaa.ts`
 *    (Valencia: 9 % hasta 1.000.000 € y 11 % por encima · Baleares: 8/9/10/12/13 %
 *     · Canarias `ajd: 0.75` · País Vasco `ajd: 0`, régimen foral).
 *  - Bonificación del 50 % de Ceuta y Melilla → `ITP_CCAA['ceuta'].tiposReducidos`
 *    («Bonificación general 50 %», tipo 3, condición: «Inmueble situado en Ceuta»).
 *  - IVA de la nave / local en primera entrega → `IVA_INMUEBLES_2025.local = 21`
 *    en `data/fiscal/inmuebles.ts`. Territorio de aplicación → cabecera de
 *    `data/fiscal/iva.ts`: «península + Baleares. Canarias (IGIC), Ceuta y Melilla (IPSI)
 *    tienen sus propios impuestos indirectos».
 *  - Arancel notarial → `ARANCELES_NOTARIO` (RD 1426/1989, número 2: matriz + una copia) y
 *    la FACTURA mostrada → `FACTURA_NOTARIAL` (horquilla ×1,5 a ×2 por los números 4, 6 y 7;
 *    la tarjeta enseña el punto medio ×1,75).
 *  - Arancel registral → `ARANCELES_REGISTRO` (RD 1427/1989, número 2) MÁS los fijos de
 *    `REGISTRO_CONCEPTOS`: presentación 6,010121 € y nota simple 3,005061 €.
 *  - El 21 % de IVA sobre honorarios va dentro de `calcularArancelNotarial` y `calcularRegistro`.
 *  - Fecha y fuente que la página debería declarar → `FISCAL_INMUEBLES_META`
 *    (verificado 2026-06-17, vigencia 2026).
 *
 * Los tres casos están resueltos a mano ANTES de ejecutar la app; el desarrollo va comentado
 * junto a cada aserción, con los importes sin redondear.
 *
 * HALLAZGOS ABIERTOS: al final, marcados con `test()`. Afirman lo que DEBERÍA pasar y hoy
 * fallan a propósito; cuando se reparen, se quita el `test()` y quedan como regresión.
 */
import { test, expect, Page } from '@playwright/test';

const RUTA = '/simulador-gastos-compraventa-nave-industrial/';

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

const PRECIO = 'Precio de compra de la nave industrial';
const GESTORIA = 'Gastos de gestoría (€)';

async function rellenar(page: Page, etiqueta: string, valor: string): Promise<void> {
  const campo = page.locator('input[aria-label="' + etiqueta + '"]');
  await campo.fill(valor);
  await campo.blur();
}

test.describe('Simulador de gastos de compra de nave industrial — inspección 21/08/2026', () => {
  /**
   * CASO 1 (NORMAL) — Madrid, segunda mano, 500.000 €, gestoría 500 €.
   * Operación corriente: una empresa compra una nave usada en la Comunidad de Madrid.
   */
  test('CASO 1 (normal) — Madrid, segunda mano, 500.000 €', async ({ page }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Segunda mano/ }).click();
    await page.selectOption('#select-ccaa', 'madrid');
    await rellenar(page, PRECIO, '500000');
    await rellenar(page, GESTORIA, '500');

    // ITP = 500.000 × 6 % = 30.000. El 6 % sale de TIPOS_ITP_CCAA_2025 → { ccaa: 'Madrid', tipo: 6 }.
    // Madrid no tiene escala progresiva, así que el tipo efectivo coincide con el nominal.
    expect(await valorTarjeta(page, 'ITP (')).toBe('30.000,00 €');

    // En segunda mano NO hay AJD de compraventa (solo lo habría sobre la escritura de hipoteca).
    await expect(page.locator('h3', { hasText: /^AJD/ })).toHaveCount(0);

    // Notaría — RD 1426/1989, número 2 (ARANCELES_NOTARIO):
    //   tramo 1 (hasta 6.010,12 €)                →                             90,15
    //   tramo 2 (6.010,12→30.050,61, 0,45 %)      → 24.040,49 × 0,0045 =    108,182205
    //   tramo 3 (30.050,61→60.101,21, 0,15 %)     → 30.050,60 × 0,0015 =     45,075900
    //   tramo 4 (60.101,21→150.253,03, 0,10 %)    → 90.151,82 × 0,0010 =     90,151820
    //   tramo 5 (150.253,03→500.000, 0,05 %)      → 349.746,97 × 0,0005 =   174,873485
    //   arancel sin IVA                           =                        508,433410
    //   con el 21 % de IVA                        = × 1,21 =               615,204826
    // FACTURA_NOTARIAL: ×1,5 = 922,807239 · ×2 = 1.230,409652 · punto medio = 1.076,608446
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('1076,61 €');
    const notaria = await descripcionTarjeta(page, 'Gastos de notaría');
    expect(notaria).toContain('922,81 €');
    expect(notaria).toContain('1230,41 €');

    // Registro — RD 1427/1989, número 2 (ARANCELES_REGISTRO):
    //   tramo 1                                   →                             24,04
    //   tramo 2 (0,175 %)                         → 24.040,49 × 0,00175 =   42,0708575
    //   tramo 3 (0,125 %)                         → 30.050,60 × 0,00125 =     37,56325
    //   tramo 4 (0,075 %)                         → 90.151,82 × 0,00075 =    67,613865
    //   tramo 5 (0,030 %)                         → 349.746,97 × 0,0003 =   104,924091
    //   suma (por debajo del tope 2.181,67)       =                       276,2120635
    //   + presentación 6,010121 + nota simple 3,005061 =                   285,2272455
    //   con el 21 % de IVA                        = × 1,21 =              345,1249671
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('345,12 €');

    expect(await valorTarjeta(page, 'Gastos de gestoría')).toBe('500,00 €');

    // Total gastos = 30.000 + 1.076,608446 + 345,124967 + 500 = 31.921,733413
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('31.921,73 €');
    // 31.921,733413 / 500.000 = 6,3843467 % → «6,38%»
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toContain('6,38%');

    // Coste total = 500.000 + 31.921,733413 = 531.921,733413
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('531.921,73 €');
  });

  /**
   * CASO 2 (LÍMITE) — Comunidad Valenciana, segunda mano, 1.200.000 €.
   * Es el borde donde cambia el TIPO: la escala de `ITP_CCAA['valencia'].tramosProgresivos`
   * pasa del 9 % al 11 % justo en 1.000.000 €, así que el caso prueba que el motor parte la
   * base y no aplica un tipo plano.
   */
  test('CASO 2 (límite) — Valencia, segunda mano, 1.200.000 €: cruza el umbral 9 % → 11 %', async ({ page }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Segunda mano/ }).click();
    await page.selectOption('#select-ccaa', 'valencia');
    await rellenar(page, PRECIO, '1200000');

    // La app avisa de la escala en el recuadro de la comunidad.
    await expect(page.getByText(/escala progresiva \(9% → 11%\)/)).toBeVisible();

    // ITP = 1.000.000 × 9 % + 200.000 × 11 % = 90.000 + 22.000 = 112.000
    // (un tipo plano del 9 % habría dado 108.000, y del 11 %, 132.000: ninguno de los dos)
    expect(await valorTarjeta(page, 'ITP (')).toBe('112.000,00 €');

    // Notaría — arancel(1.200.000):
    //   90,15 + 108,182205 + 45,0759 + 90,15182
    //   + tramo 5 (150.253,03→601.012,10, 0,05 %) → 450.759,07 × 0,0005 =  225,379535
    //   + tramo 6 (601.012,10→1.200.000, 0,03 %)  → 598.987,90 × 0,0003 =  179,696370
    //   arancel sin IVA = 738,63583 · con IVA = 893,749354
    //   ×1,5 = 1.340,624031 · ×2 = 1.787,498708 · punto medio = 1.564,061370
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('1564,06 €');

    // Registro — arancel(1.200.000):
    //   24,04 + 42,0708575 + 37,56325 + 67,613865
    //   + tramo 5 (0,030 %) → 450.759,07 × 0,0003 = 135,227721
    //   + tramo 6 (0,020 %) → 598.987,90 × 0,0002 = 119,797580
    //   suma = 426,3132735 (por debajo del tope) + 9,015182 = 435,3284555
    //   con el 21 % de IVA = 526,7474311
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('526,75 €');

    // Total gastos = 112.000 + 1.564,06137 + 526,747431 + 500 = 114.590,808801
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('114.590,81 €');
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('1.314.590,81 €');
  });

  /**
   * CASO 3 (RECHAZO) — importe cero, negativo y texto.
   * No debe salir ningún NaN, ningún «No definido» ni una cifra fantasma: la app se queda
   * en el marcador de posición hasta que el precio es un número positivo.
   */
  test('CASO 3 (rechazo) — 0, negativo y texto no producen NaN ni cifra fantasma', async ({ page }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Segunda mano/ }).click();
    await page.selectOption('#select-ccaa', 'madrid');

    const campo = page.locator('input[aria-label="' + PRECIO + '"]');
    const marcador = page.getByText('Introduce el precio de la nave industrial para ver el desglose de gastos');

    for (const entrada of ['0', '-100', '']) {
      await campo.fill(entrada);
      await expect(marcador).toBeVisible();
      await expect(page.locator('h3', { hasText: 'COSTE TOTAL DE ADQUISICIÓN' })).toHaveCount(0);
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
   * Riesgo 1: el disclaimer crítico tiene que estar y NO puede ser colapsable
   * (_private/DISCLAIMER-POLICY.md, nivel 1 CRÍTICO).
   */
  test('Disclaimer crítico presente y no colapsable', async ({ page }) => {
    await page.goto(RUTA);
    const disclaimer = page.locator('[class*="disclaimer" i]').first();
    await expect(disclaimer).toBeVisible();
    await expect(disclaimer).toContainText('no constituye asesoramiento financiero, fiscal ni jurídico');
    // Sin botón dentro: no hay forma de plegarlo.
    expect(await disclaimer.locator('button').count()).toBe(0);
  });

  /** El País Vasco no cobra AJD (`ITP_CCAA['pais-vasco'].ajd = 0`, régimen foral). */
  test('País Vasco, obra nueva: no se cobra AJD', async ({ page }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Obra nueva/ }).click();
    await page.selectOption('#select-ccaa', 'pais-vasco');
    await rellenar(page, PRECIO, '500000');
    // AJD = 500.000 × 0 % = 0, y la tarjeta solo se pinta si el importe es > 0.
    await expect(page.locator('h3', { hasText: /^AJD/ })).toHaveCount(0);
    // La tabla comparativa ya deriva el rango de RANGO_AJD y por eso arranca en 0 %
    // (vive dentro de EducationalSection, plegada: se comprueba que está, no que se vea).
    expect(await page.getByText('Sí (0% – 1,5%)').count()).toBeGreaterThan(0);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// HALLAZGOS ABIERTOS del 21/08/2026. Todos fallan HOY a propósito.
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('Hallazgos abiertos — 21/08/2026', () => {
  /**
   * HALLAZGO 1 (dato, alto) — la página no declara la fuente ni la fecha de los datos
   * normativos que usa. Falta `<DataReference>` (obligatorio en CLAUDE.md para apps con
   * datos con fecha de caducidad, e implementado ya en la app hermana del garaje), y el
   * `<LegalNotice>` lleva la fecha escrita a mano «2024-12-20», año y medio anterior a los
   * datos que el motor está usando (FISCAL_INMUEBLES_META.verificado = 2026-06-17).
   */
  test('HALLAZGO 1 — DataReference con fuente y fecha, y LegalNotice sellado con data/fiscal', async ({ page }) => {
    await page.goto(RUTA);
    // La hermana `simulador-gastos-compraventa-garaje` lo hace así:
    //   <LegalNotice lastUpdated={FISCAL_INMUEBLES_META.verificado} />
    //   <DataReference normativa={`ITP/AJD/IVA ${FISCAL_INMUEBLES_META.vigencia}`} ... />
    await expect(page.getByText(/ITP\/AJD\/IVA 2026/)).toBeVisible();
    await expect(page.getByText(/17 de junio de 2026/)).toBeVisible();
    // Hoy muestra: «Última actualización: 20 de diciembre de 2024» y ningún DataReference.
  });

  /**
   * HALLAZGO 2 (cálculo, alto) — Canarias, Ceuta y Melilla están en el desplegable y, en
   * obra nueva, la app les cobra IVA del 21 %. `data/fiscal/iva.ts` dice en su cabecera que
   * el IVA se aplica en «península + Baleares» y que «Canarias (IGIC), Ceuta y Melilla
   * (IPSI) tienen sus propios impuestos indirectos». Con el IGIC general del 7 %, una nave
   * nueva de 500.000 € en Canarias soporta ~35.000 €, no 105.000 €: un factor de tres en
   * una app de riesgo 1.
   */
  test('HALLAZGO 2 — Canarias en obra nueva no debe liquidarse como IVA 21 %', async ({ page }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Obra nueva/ }).click();
    await page.selectOption('#select-ccaa', 'canarias');
    await rellenar(page, PRECIO, '500000');
    // Reparado el 23/08/2026. El acta pedía «que no se presente como IVA del 21 %»; la
    // corrección va más allá y no inventa ninguna cifra, porque calcular el IGIC exigiría
    // sellar sus tipos con su propia fuente y hoy no están en data/fiscal. Así que la app
    // nombra el impuesto que sí corresponde, no liquida nada y marca el total como parcial.
    await expect(page.getByText('105.000,00 €')).toHaveCount(0);
    await expect(page.locator('body')).toContainText('IGIC');
    await expect(page.locator('body')).toContainText('No calculado');
    await expect(page.locator('body')).toContainText('COSTE TOTAL (PARCIAL)');
  });

  /**
   * HALLAZGO 3 (cálculo, alto) — Ceuta y Melilla tienen declarada en `ITP_CCAA` una
   * «Bonificación general 50 %» (tipo 3) cuya única condición es que el inmueble esté
   * situado allí: no es un tipo reducido de comprador ni exige uso residencial. La app
   * llama a `calcularITP()` a secas y cobra el 6 % (30.000 € sobre 500.000 €) en vez del
   * 3 % (15.000 €) — el doble. Es el mismo defecto que el Inspector encontró en
   * `simulador-gastos-compraventa-garaje` y que motivó las condiciones «que se cumplen por
   * el SITIO» de `data/itp-ccaa.ts`; aquí, además, ni se aplica ni se avisa de que existe.
   */
  test('HALLAZGO 3 — Ceuta: la bonificación del 50 % declarada en ITP_CCAA no se aplica ni se anuncia', async ({ page }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Segunda mano/ }).click();
    await page.selectOption('#select-ccaa', 'ceuta');
    await rellenar(page, PRECIO, '500000');
    // 500.000 × 3 % = 15.000 (tipo 3 de ITP_CCAA['ceuta'].tiposReducidos).
    expect(await valorTarjeta(page, 'ITP (')).toBe('15.000,00 €');
  });

  /**
   * HALLAZGO 4 (contenido, medio) — el rótulo del impuesto redondea el tipo a CERO decimales
   * (`formatNumber(porcentaje, 0)`), así que contradice al recuadro de la comunidad que está
   * dos dedos más arriba en la misma pantalla: Canarias sale como «ITP (7%)» sobre 32.500 €,
   * que son el 6,5 %; Murcia, como «ITP (8%)» sobre el 7,75 %. Quien multiplique 500.000 × 7 %
   * obtiene 35.000 €, no los 32.500 € que la tarjeta enseña al lado. La app hermana del garaje
   * ya rotula con dos decimales («ITP (6,00%)»).
   */
  test('HALLAZGO 4 — el rótulo del tipo redondea a entero y contradice al importe', async ({ page }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Segunda mano/ }).click();
    await page.selectOption('#select-ccaa', 'canarias');
    await rellenar(page, PRECIO, '500000');
    // Canarias: TIPOS_ITP_CCAA_2025 → 6,5 %. 500.000 × 6,5 % = 32.500 €.
    expect(await valorTarjeta(page, 'ITP (')).toBe('32.500,00 €');
    // El rótulo debería decir el tipo que corresponde a ese importe. Hoy dice «ITP (7%)».
    const rotulo = (await page.locator('h3', { hasText: /^ITP \(/ }).first().innerText()).trim();
    expect(rotulo).toBe('ITP (6,50%)');
  });

  /**
   * HALLAZGO 5 (contenido, medio) — el recuadro de la comunidad imprime los tipos con PUNTO
   * decimal, formato anglosajón: «ITP General 6.5%», «7.75%», «AJD 0.75%», «AJD 1.5%». Se
   * renderizan crudos (`{datosCcaaActual.tipoGeneral}%`) en vez de pasar por `formatNumber`,
   * que es lo que sí hace la tarjeta de resultados — de modo que la MISMA cifra sale dos
   * veces en la misma página con dos formatos distintos: «AJD 0.75%» arriba y «AJD (0,75%)»
   * en la tarjeta. El formato español es obligatorio (regla 2 del CLAUDE.md global).
   */
  test('HALLAZGO 5 — el recuadro de la comunidad usa punto decimal en vez de coma', async ({ page }) => {
    await page.goto(RUTA);
    await page.selectOption('#select-ccaa', 'canarias');
    const recuadro = page.locator('[class*="infoCcaa"]').first();
    await expect(recuadro).toContainText('6,5%');
    await expect(recuadro).not.toContainText('6.5%');
    await expect(recuadro).toContainText('0,75%');
  });

  /**
   * HALLAZGO 6 (contenido, medio) — el FAQPage de `metadata.ts`, que es justo lo que consumen
   * Bing Copilot, ChatGPT y Perplexity, se quedó sin reparar cuando la página visible sí se
   * corrigió:
   *   · «AJD ... entre el 0,5% y el 1,5%» — pero la app cobra 0 € en el País Vasco
   *     (`ajd: 0`) y la tabla de la propia página ya dice «Sí (0% – 1,5%)» vía RANGO_AJD.
   *     Es exactamente el defecto que documenta el comentario de RANGO_AJD (21/08/2026).
   *   · «ITP ... habitualmente entre el 6% y el 10%» — el motor aplica el 4 % en el País
   *     Vasco y llega al 13 % en el tramo alto de Baleares y Cataluña (RANGO_ITP = 4–13).
   *   · «el Registro de la Propiedad entre 400 € y 800 €» para una nave de 200.000 € — el
   *     propio motor da 236,22 € (arancel 186,2121 + 9,015182 fijos, × 1,21).
   */
  test('HALLAZGO 6 — el FAQPage JSON-LD contradice al motor en AJD, ITP y registro', async ({ page }) => {
    await page.goto(RUTA);
    const bloques = await page.locator('script[type="application/ld+json"]').allTextContents();
    const faq = bloques.find((b) => b.includes('FAQPage')) ?? '';
    expect(faq).not.toContain('entre el 0,5% y el 1,5%');
    expect(faq).not.toContain('entre el 6% y el 10%');
    expect(faq).not.toContain('entre 400 € y 800 €');
  });

  /**
   * HALLAZGO 7 (contenido, medio) — la FAQ visible afirma que el tipo general «oscila entre
   * el 4% (País Vasco) y el 10-11% (Cataluña, Valencia)», un rango escrito a mano que la
   * propia app desmiente: una nave de 2.500.000 € en Baleares paga 275.000 €, el 11 % efectivo,
   * con un tramo marginal del 13 % (`ITP_CCAA['baleares'].tramosProgresivos`), y Cataluña llega
   * también al 13 %. `RANGO_ITP` existe en `data/itp-ccaa.ts` precisamente para derivarlo.
   */
  test('HALLAZGO 7 — el rango de ITP del bloque educativo se queda corto frente al propio motor', async ({ page }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Segunda mano/ }).click();
    await page.selectOption('#select-ccaa', 'baleares');
    await rellenar(page, PRECIO, '2500000');
    // 400.000×8 % + 200.000×9 % + 400.000×10 % + 1.000.000×12 % + 500.000×13 %
    //   = 32.000 + 18.000 + 40.000 + 120.000 + 65.000 = 275.000 → 11 % efectivo
    expect(await valorTarjeta(page, 'ITP (')).toBe('275.000,00 €');
    // …mientras el texto sigue diciendo que el techo es el 10-11 %.
    await expect(page.getByText(/oscila entre el 4% \(País Vasco\) y el 10-11%/)).toHaveCount(0);
  });

  /**
   * HALLAZGO 8 (operativa, bajo) — mientras el campo de gestoría tiene el foco, un importe
   * negativo se suma tal cual al total: con 500.000 € en Madrid y «-1000» sin salir del campo,
   * «Total gastos adicionales» baja a 30.421,73 € aunque las líneas visibles (30.000 + 1.076,61
   * + 345,12) sumen 31.421,73 €, y la tarjeta de gestoría ni se pinta (`gastosGestoria > 0`).
   * El `min={0}` de NumberInput solo actúa en el blur, así que la cifra en pantalla es
   * momentáneamente incoherente con su propio desglose.
   */
  test('HALLAZGO 8 — una gestoría negativa sin blur descuadra el total frente a sus líneas', async ({ page }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Segunda mano/ }).click();
    await page.selectOption('#select-ccaa', 'madrid');
    await rellenar(page, PRECIO, '500000');
    const gestoria = page.locator('input[aria-label="' + GESTORIA + '"]');
    await gestoria.click();
    await gestoria.press('Control+a');
    await gestoria.pressSequentially('-1000');   // sin salir del campo
    // El total no debería aceptar un gasto negativo: 30.000 + 1.076,61 + 345,12 = 31.421,73 €
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('31.421,73 €');
  });

  /**
   * HALLAZGO 9 (accesibilidad, bajo) — el `<label>Tipo de transmisión</label>` no tiene
   * `htmlFor` ni envuelve ningún control: es un texto suelto. Los dos botones que gobierna
   * («Segunda mano» / «Obra nueva») no forman un grupo accesible (`role="group"` +
   * `aria-labelledby`), así que un lector de pantalla los anuncia sin decir de qué elección
   * forman parte.
   */
  test('HALLAZGO 9 — el par de botones de transmisión no forma un grupo accesible', async ({ page }) => {
    await page.goto(RUTA);
    await expect(page.getByRole('group', { name: /Tipo de transmisión/ })).toBeVisible();
  });
});
