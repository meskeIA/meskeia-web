/**
 * Inspector — simulador-gastos-compraventa-nave-industrial (segmento CÁLCULO/FISCAL, riesgo 1 CRÍTICO)
 *
 * Historia del fichero:
 *  · 21/08/2026 — primera inspección. 11 hallazgos (156-166).
 *  · 23/08/2026 — reparación (commits c47189ca, c78fa7db, 148e2ebc, 4b936165, 44a5dc7d).
 *  · 27/08/2026 — RE-INSPECCIÓN. Los 11 hallazgos se reprodujeron uno a uno con su caso
 *    literal: los 11 siguen cerrados. Sus tests dejan de llamarse «hallazgos abiertos» y
 *    pasan al bloque de REGRESIÓN. Se añaden casos nuevos (Melilla, Cataluña en el tramo
 *    del 13 %, tope del arancel registral, formato español de entrada) y 4 hallazgos
 *    nuevos al final, con `test.fail()`.
 *
 * De dónde sale CADA cifra esperada (ninguna de memoria):
 *  - Tipo general de ITP por CCAA → `TIPOS_ITP_CCAA_2025` en `data/fiscal/inmuebles.ts`,
 *    que `tipoGeneralDe()` de `data/itp-ccaa.ts` lee para rellenar `ITP_CCAA[x].tipoGeneral`
 *    (Madrid = 6 · Canarias = 6,5 · Murcia = 7,75 · Valencia = 9 · Baleares = 8 · Cataluña = 10).
 *  - Escalas progresivas y AJD por comunidad → `ITP_CCAA` en `data/itp-ccaa.ts`
 *    (Valencia: 9 % hasta 1.000.000 € y 11 % por encima · Baleares: 8/9/10/12/13 %
 *     · Cataluña: 10/11/12/13 % con cortes en 600.000, 900.000 y 1.500.000 €
 *     · Canarias `ajd: 0.75` · Ceuta y Melilla `ajd: 0.5` · País Vasco `ajd: 0`, foral).
 *  - Bonificación del 50 % de Ceuta y Melilla → `BONIFICACION_CUOTA_CEUTA_MELILLA` y
 *    `CIUDADES_CON_BONIFICACION` en `data/itp-ccaa.ts` (art. 57 bis del TRLITPAJD, que la
 *    reconoce por el SITIO del inmueble, sea cual sea su uso). La aplican `calcularITP`
 *    y `calcularAJD`, así que alcanza a las dos cuotas.
 *  - Territorios sin IVA → `TERRITORIOS_SIN_IVA` (Canarias → IGIC · Ceuta y Melilla → IPSI).
 *    El catálogo NO calcula esos impuestos: nombra el que toca y marca el total como parcial.
 *  - IVA de la nave / local en primera entrega → `IVA_INMUEBLES_2025.local = 21`
 *    en `data/fiscal/inmuebles.ts`.
 *  - Arancel notarial → `ARANCELES_NOTARIO` (RD 1426/1989, número 2: matriz + una copia) y
 *    la FACTURA mostrada → `FACTURA_NOTARIAL` (horquilla ×1,5 a ×2 por los números 4, 6 y 7;
 *    la tarjeta enseña el punto medio ×1,75).
 *  - Arancel registral → `ARANCELES_REGISTRO` (RD 1427/1989, número 2), con el tope
 *    `REGISTRO_MAXIMO = 2181,67`, MÁS los fijos de `REGISTRO_CONCEPTOS`: presentación
 *    6,010121 € y nota simple 3,005061 €.
 *  - El 21 % de IVA sobre honorarios va dentro de `calcularArancelNotarial` y `calcularRegistro`.
 *  - Fecha y fuente que la página declara → `FISCAL_INMUEBLES_META` (verificado 2026-06-17,
 *    vigencia 2026).
 *
 * Todos los casos están resueltos a mano ANTES de ejecutar la app; el desarrollo va comentado
 * junto a cada aserción, con los importes sin redondear.
 *
 * HALLAZGOS ABIERTOS: al final, marcados con `test.fail()`. Afirman lo que DEBERÍA pasar y hoy
 * fallan a propósito; cuando se reparen, se les quita el `test.fail()` y quedan como regresión.
 */
import { test, expect, Page } from '@playwright/test';
import { IVA_INMUEBLES_2025, TRAMOS_GANANCIAS_PATRIMONIALES_2025 } from '../../data/fiscal/inmuebles';
import { ITP_CCAA, RANGO_ITP } from '../../data/itp-ccaa';

const RUTA = '/simulador-gastos-compraventa-nave-industrial/';
const FUENTE_PAGE = 'app/simulador-gastos-compraventa-nave-industrial/page.tsx';

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

/** Rótulo completo de una ResultCard (el <h3>), que es donde va el tipo entre paréntesis. */
async function rotuloTarjeta(page: Page, patron: RegExp): Promise<string> {
  return (await page.locator('h3', { hasText: patron }).first().innerText()).replace(/\s+/g, ' ').trim();
}

const PRECIO = 'Precio de compra de la nave industrial';
const GESTORIA = 'Gastos de gestoría (€)';

async function rellenar(page: Page, etiqueta: string, valor: string): Promise<void> {
  const campo = page.locator('input[aria-label="' + etiqueta + '"]');
  await campo.fill(valor);
  await campo.blur();
}

async function leerFuente(): Promise<string> {
  const { readFile } = await import('node:fs/promises');
  return readFile(FUENTE_PAGE, 'utf8');
}

test.describe('Simulador de gastos de compra de nave industrial — casos base', () => {
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
    expect(await rotuloTarjeta(page, /^ITP \(/)).toBe('ITP (6,00%)');

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
    // 112.000 / 1.200.000 = 9,3333 % efectivo
    expect(await rotuloTarjeta(page, /^ITP \(/)).toBe('ITP (9,33%)');

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
   * CASO 3 (RECHAZO) — importe cero, negativo, vacío y texto basura.
   * No debe salir ningún NaN, ningún «No definido» ni una cifra fantasma: la app se queda
   * en el marcador de posición hasta que el precio es un número positivo.
   */
  test('CASO 3 (rechazo) — 0, negativo, vacío y texto no producen NaN ni cifra fantasma', async ({ page }) => {
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

    // «1.2.3» SÍ pasa el filtro del input (solo dígitos y separadores) pero `parseSpanishNumber`
    // lo rechaza con NaN — y ahí se detiene: la app vuelve al marcador, no pinta un total roto.
    await campo.fill('1.2.3');
    await campo.blur();
    await expect(marcador).toBeVisible();
    await expect(page.locator('h3', { hasText: 'COSTE TOTAL DE ADQUISICIÓN' })).toHaveCount(0);

    // En ningún momento aparecen los centinelas de formatNumber/formatCurrency ante NaN.
    const cuerpo = await page.locator('body').innerText();
    expect(cuerpo).not.toContain('NaN');
    expect(cuerpo).not.toContain('No definido');
    expect(cuerpo).not.toContain('∞');
  });

  /**
   * El precio escrito en FORMATO ESPAÑOL (punto de millar + coma decimal) tiene que llegar
   * entero al motor: es el formato con el que se teclea un importe en España y el que
   * `parseSpanishNumber` promete admitir.
   */
  test('El precio en formato español 1.234.567,89 se interpreta como 1.234.567,89 €', async ({ page }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Segunda mano/ }).click();
    await page.selectOption('#select-ccaa', 'madrid');
    await rellenar(page, PRECIO, '1.234.567,89');

    expect(await valorTarjeta(page, 'Precio de la nave industrial')).toBe('1.234.567,89 €');
    // ITP = 1.234.567,89 × 6 % = 74.074,0734
    expect(await valorTarjeta(page, 'ITP (')).toBe('74.074,07 €');
    // Notaría: arancel = 90,15 + 108,182205 + 45,0759 + 90,15182 + 225,379535
    //   + (1.234.567,89 − 601.012,10) × 0,0003 = 633.555,79 × 0,0003 = 190,066737
    //   = 748,856197 · × 1,21 = 906,116  · × 1,75 = 1.586,0203
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('1586,02 €');
    // Registro: 24,04 + 42,0708575 + 37,56325 + 67,613865 + 135,227721
    //   + 633.555,79 × 0,0002 = 126,711158 → 433,2268615 + 9,015182 = 442,2420435 × 1,21
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('535,11 €');
    // Total = 74.074,0734 + 1.586,020 + 535,112 + 500 = 76.695,21
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('76.695,21 €');
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('1.311.263,10 €');
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
  test('País Vasco, obra nueva: IVA del 21 % y ningún AJD', async ({ page }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Obra nueva/ }).click();
    await page.selectOption('#select-ccaa', 'pais-vasco');
    await rellenar(page, PRECIO, '500000');
    // IVA = 500.000 × 21 % (IVA_INMUEBLES_2025.local) = 105.000
    expect(await valorTarjeta(page, 'IVA (')).toBe('105.000,00 €');
    // AJD = 500.000 × 0 % = 0, y la tarjeta solo se pinta si el importe es > 0.
    await expect(page.locator('h3', { hasText: /^AJD/ })).toHaveCount(0);
    // Total = 105.000 + 1.076,608446 + 345,124967 + 500 = 106.921,733413
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('106.921,73 €');
    // La tabla comparativa ya deriva el rango de RANGO_AJD y por eso arranca en 0 %
    // (vive dentro de EducationalSection, plegada: se comprueba que está, no que se vea).
    expect(await page.getByText('Sí (0% – 1,5%)').count()).toBeGreaterThan(0);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// REGRESIÓN de la reparación del 23/08/2026 (hallazgos 156-166).
// Estaban escritos con `test.fail()`, afirmando lo que DEBERÍA ocurrir. El 27/08/2026 se
// reprodujo el caso literal de cada uno: los 11 siguen cerrados, así que se les ha quitado
// la marca y se quedan como red de seguridad. Si alguien vuelve a romperlos, salta aquí.
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('Regresión — reparación del 23/08/2026', () => {
  /**
   * HALLAZGO 158 (dato, alto) — la página no declaraba la fuente ni la fecha de los datos
   * normativos. Hoy `<LegalNotice>` se sella con `FISCAL_INMUEBLES_META.verificado` y hay
   * `<DataReference>` con normativa, fuente y URL oficial.
   */
  test('HALLAZGO 158 — DataReference con fuente y fecha, y LegalNotice sellado con data/fiscal', async ({ page }) => {
    await page.goto(RUTA);
    await expect(page.getByText(/ITP\/AJD\/IVA 2026/)).toBeVisible();
    await expect(page.getByText(/17 de junio de 2026/)).toBeVisible();
    // La fecha escrita a mano «20 de diciembre de 2024» no puede volver.
    await expect(page.getByText(/20 de diciembre de 2024/)).toHaveCount(0);
  });

  /**
   * HALLAZGO 156 (cálculo, alto) — Canarias, Ceuta y Melilla están en el desplegable y, en
   * obra nueva, la app les cobraba IVA del 21 %. `TERRITORIOS_SIN_IVA` dice que allí rigen
   * el IGIC y el IPSI. La corrección no inventa ninguna cifra —calcular el IGIC exigiría
   * sellar sus tipos con su propia fuente y hoy no están en data/fiscal—: nombra el impuesto
   * que sí corresponde, no liquida nada y marca el total como PARCIAL.
   */
  test('HALLAZGO 156 — Canarias en obra nueva: IGIC no calculado y total marcado como parcial', async ({ page }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Obra nueva/ }).click();
    await page.selectOption('#select-ccaa', 'canarias');
    await rellenar(page, PRECIO, '500000');

    // 500.000 × 21 % = 105.000 € de IVA inventado: no puede aparecer en ningún sitio.
    await expect(page.getByText('105.000,00 €')).toHaveCount(0);
    expect(await rotuloTarjeta(page, /IGIC/)).toContain('IGIC');
    expect(await valorTarjeta(page, 'IGIC')).toBe('No calculado');
    await expect(page.locator('body')).toContainText('COSTE TOTAL (PARCIAL)');
    // AJD sí se devenga: 500.000 × 0,75 % (ITP_CCAA['canarias'].ajd) = 3.750
    expect(await valorTarjeta(page, 'AJD (')).toBe('3750,00 €');
    // Total parcial = 0 + 3.750 + 1.076,608446 + 345,124967 + 500 = 5.671,733413
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('5671,73 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toContain('SIN el IGIC');
    expect(await valorTarjeta(page, 'COSTE TOTAL (PARCIAL)')).toBe('505.671,73 €');
  });

  /** Mismo cierre en Ceuta y en Melilla: el impuesto que se nombra es el IPSI. */
  test('HALLAZGO 156 — Ceuta y Melilla en obra nueva: IPSI no calculado', async ({ page }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Obra nueva/ }).click();

    await page.selectOption('#select-ccaa', 'ceuta');
    await rellenar(page, PRECIO, '500000');
    expect(await valorTarjeta(page, 'IPSI')).toBe('No calculado');
    // AJD Ceuta = 500.000 × 0,5 % = 2.500, bonificado al 50 % (art. 57 bis.1) = 1.250
    expect(await valorTarjeta(page, 'AJD (')).toBe('1250,00 €');
    // Total parcial = 1.250 + 1.076,608446 + 345,124967 + 500 = 3.171,733413
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('3171,73 €');
    expect(await valorTarjeta(page, 'COSTE TOTAL (PARCIAL)')).toBe('503.171,73 €');

    await page.selectOption('#select-ccaa', 'melilla');
    await rellenar(page, PRECIO, '1000000');
    expect(await valorTarjeta(page, 'IPSI')).toBe('No calculado');
    // AJD Melilla = 1.000.000 × 0,5 % = 5.000 → bonificado = 2.500
    expect(await valorTarjeta(page, 'AJD (')).toBe('2500,00 €');
    // Notaría(1.000.000): arancel = 558,93946 + (1.000.000 − 601.012,10) × 0,0003 = 678,635830
    //   × 1,21 = 821,149354 · × 1,75 = 1.437,011369
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('1437,01 €');
    // Registro(1.000.000): 306,5156935 + 398.987,90 × 0,0002 = 386,313274 + 9,015182 = 395,328455 × 1,21
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('478,35 €');
    // Total parcial = 2.500 + 1.437,011369 + 478,347431 + 500 = 4.915,358800
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('4915,36 €');
    expect(await valorTarjeta(page, 'COSTE TOTAL (PARCIAL)')).toBe('1.004.915,36 €');
  });

  /**
   * HALLAZGO 157 (cálculo, alto) — la bonificación del 50 % del art. 57 bis del TRLITPAJD
   * se cumple por el SITIO del inmueble, sea cual sea su uso, y no se aplicaba: una nave de
   * 500.000 € en Ceuta liquidaba 30.000 € cuando le correspondían 15.000 €, el doble. Hoy la
   * aplica `calcularITP` a través de `aplicarBonificacionCiudad`, así que ninguna app tiene
   * que acordarse de ella.
   */
  test('HALLAZGO 157 — Ceuta y Melilla: la bonificación del 50 % se aplica y se anuncia', async ({ page }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Segunda mano/ }).click();

    await page.selectOption('#select-ccaa', 'ceuta');
    await rellenar(page, PRECIO, '500000');
    // 500.000 × 6 % = 30.000 → × (1 − 0,5) = 15.000. Tipo efectivo 3,00 %.
    expect(await valorTarjeta(page, 'ITP (')).toBe('15.000,00 €');
    expect(await rotuloTarjeta(page, /^ITP \(/)).toBe('ITP (3,00%)');
    expect(await descripcionTarjeta(page, 'ITP (')).toContain('bonificación del 50 %');
    // Y se anuncia en el recuadro de la comunidad, no solo en la tarjeta.
    await expect(page.locator('[class*="infoCcaa"]').first()).toContainText('artículo 57 bis');
    // Total = 15.000 + 1.076,608446 + 345,124967 + 500 = 16.921,733413
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('16.921,73 €');

    await page.selectOption('#select-ccaa', 'melilla');
    await rellenar(page, PRECIO, '300000');
    // 300.000 × 6 % = 18.000 → bonificado = 9.000 (3,00 %)
    expect(await valorTarjeta(page, 'ITP (')).toBe('9000,00 €');
    expect(await rotuloTarjeta(page, /^ITP \(/)).toBe('ITP (3,00%)');
    // Notaría(300.000): arancel = 333,559925 + (300.000 − 150.253,03) × 0,0005 = 408,433410
    //   × 1,21 = 494,204426 · × 1,75 = 864,857746
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('864,86 €');
    // Registro(300.000): 171,2879725 + 149.746,97 × 0,0003 = 216,212064 + 9,015182 = 225,227246 × 1,21
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('272,52 €');
    // Total = 9.000 + 864,857746 + 272,524968 + 500 = 10.637,382714
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('10.637,38 €');
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('310.637,38 €');
  });

  /**
   * HALLAZGO 160 (contenido, medio) — el rótulo del impuesto redondeaba el tipo a CERO
   * decimales y contradecía al recuadro de la comunidad: Canarias salía como «ITP (7%)»
   * sobre 32.500 €, que son el 6,5 %. Hoy rotula el tipo EFECTIVO con dos decimales.
   */
  test('HALLAZGO 160 — el rótulo del tipo es el efectivo y con dos decimales', async ({ page }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Segunda mano/ }).click();
    await page.selectOption('#select-ccaa', 'canarias');
    await rellenar(page, PRECIO, '500000');
    // Canarias: TIPOS_ITP_CCAA_2025 → 6,5 %. 500.000 × 6,5 % = 32.500 €.
    expect(await valorTarjeta(page, 'ITP (')).toBe('32.500,00 €');
    expect(await rotuloTarjeta(page, /^ITP \(/)).toBe('ITP (6,50%)');

    // Murcia: 7,75 % (Ley 3/2025). 300.000 × 7,75 % = 23.250 €.
    await page.selectOption('#select-ccaa', 'murcia');
    await rellenar(page, PRECIO, '300000');
    expect(await valorTarjeta(page, 'ITP (')).toBe('23.250,00 €');
    expect(await rotuloTarjeta(page, /^ITP \(/)).toBe('ITP (7,75%)');
    // Total = 23.250 + 864,857746 + 272,524968 + 500 = 24.887,382714
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('24.887,38 €');
  });

  /**
   * HALLAZGO 161 (contenido, medio) — el recuadro de la comunidad imprimía los tipos crudos
   * con PUNTO decimal («6.5%», «0.75%»), formato anglosajón, mientras la tarjeta de resultados
   * usaba coma: la misma cifra salía dos veces en la misma pantalla con dos formatos.
   */
  test('HALLAZGO 161 — el recuadro de la comunidad usa coma decimal, no punto', async ({ page }) => {
    await page.goto(RUTA);
    const recuadro = page.locator('[class*="infoCcaa"]').first();

    await page.selectOption('#select-ccaa', 'canarias');
    await expect(recuadro).toContainText('6,5%');
    await expect(recuadro).not.toContainText('6.5%');
    await expect(recuadro).toContainText('0,75%');
    await expect(recuadro).not.toContainText('0.75%');

    await page.selectOption('#select-ccaa', 'murcia');
    await expect(recuadro).toContainText('7,75%');
    await expect(recuadro).not.toContainText('7.75%');

    await page.selectOption('#select-ccaa', 'valencia');
    await expect(recuadro).not.toContainText('1.5%');
  });

  /**
   * HALLAZGO 159 (contenido, medio) — el FAQPage de `metadata.ts`, que es lo que consumen
   * Bing Copilot, ChatGPT y Perplexity, contradecía al motor en tres cifras. Hoy las deriva
   * de RANGO_AJD, RANGO_ITP y del propio arancel.
   */
  test('HALLAZGO 159 — el FAQPage JSON-LD deriva sus cifras del motor', async ({ page }) => {
    await page.goto(RUTA);
    const bloques = await page.locator('script[type="application/ld+json"]').allTextContents();
    const faq = bloques.find((b) => b.includes('FAQPage')) ?? '';
    expect(faq).not.toContain('entre el 0,5% y el 1,5%');
    expect(faq).not.toContain('entre el 6% y el 10%');
    expect(faq).not.toContain('entre 400 € y 800 €');
    // RANGO_AJD = 0 – 1,5 (País Vasco es 0) y RANGO_ITP = 4 – 13 (tramo alto de Baleares/Cataluña)
    expect(faq).toContain('del 0% al 1,5%');
    expect(faq).toContain(`del ${String(RANGO_ITP.min)}% al ${String(RANGO_ITP.max)}%`);
    // Registro de 200.000 € según el propio arancel: 236,22 €
    expect(faq).toContain('236 €');
  });

  /**
   * HALLAZGO 162 (contenido, medio) — la FAQ visible afirmaba un rango de ITP escrito a mano
   * («4% … 10-11%») que la propia app desmentía. Hoy lo deriva de RANGO_ITP.
   */
  test('HALLAZGO 162 — el rango de ITP del bloque educativo se deriva de RANGO_ITP', async ({ page }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Segunda mano/ }).click();
    await page.selectOption('#select-ccaa', 'baleares');
    await rellenar(page, PRECIO, '2500000');
    // 400.000×8 % + 200.000×9 % + 400.000×10 % + 1.000.000×12 % + 500.000×13 %
    //   = 32.000 + 18.000 + 40.000 + 120.000 + 65.000 = 275.000 → 11 % efectivo
    expect(await valorTarjeta(page, 'ITP (')).toBe('275.000,00 €');
    expect(await rotuloTarjeta(page, /^ITP \(/)).toBe('ITP (11,00%)');
    // Notaría(2.500.000): arancel = 558,93946 + 5.409.108,94 × 0,0003 … no: el tramo 6 llega
    //   hasta 6.010.121,04, así que se aplica (2.500.000 − 601.012,10) × 0,0003 = 569,696370
    //   → 1.128,635830 × 1,21 = 1.365,649354 · × 1,75 = 2.389,886370
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('2389,89 €');
    // Registro(2.500.000): 306,5156935 + 1.898.987,90 × 0,0002 = 686,313274 (< tope 2.181,67)
    //   + 9,015182 = 695,328455 × 1,21 = 841,347431
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('841,35 €');
    // Total = 275.000 + 2.389,886370 + 841,347431 + 500 = 278.731,233801
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('278.731,23 €');
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('2.778.731,23 €');

    // …y el texto ya no sostiene un techo que la app supera.
    await expect(page.getByText(/oscila entre el 4% \(País Vasco\) y el 10-11%/)).toHaveCount(0);
    const fuente = await leerFuente();
    expect(fuente).toContain('RANGO_ITP.min');
    expect(fuente).toContain('RANGO_ITP.max');
  });

  /**
   * HALLAZGO 163 (dato, medio) — el tipo de IVA estaba hardcodeado (`const IVA_NAVE_INDUSTRIAL = 21`)
   * pudiendo venir de `IVA_INMUEBLES_2025.local`. Hoy se importa, así que no puede divergir.
   */
  test('HALLAZGO 163 — el IVA de la nave se importa de data/fiscal, no se escribe a mano', async ({ page }) => {
    const fuente = await leerFuente();
    expect(fuente).toContain('IVA_INMUEBLES_2025.local');
    expect(fuente).not.toMatch(/const IVA_NAVE_INDUSTRIAL\s*=\s*21/);

    await page.goto(RUTA);
    await page.getByRole('button', { name: /Obra nueva/ }).click();
    await page.selectOption('#select-ccaa', 'madrid');
    await rellenar(page, PRECIO, '500000');
    // 500.000 × IVA_INMUEBLES_2025.local (21) = 105.000
    const esperado = (500000 * IVA_INMUEBLES_2025.local) / 100;
    expect(await valorTarjeta(page, 'IVA (')).toBe(
      esperado.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €'
    );
    expect(await rotuloTarjeta(page, /^IVA \(/)).toBe(`IVA (${String(IVA_INMUEBLES_2025.local)},00%)`);
  });

  /**
   * HALLAZGO 164 (contenido, medio) — la segunda transmisión de una nave está exenta de IVA,
   * pero entre empresarios con derecho a deducción lo habitual es renunciar a la exención
   * (art. 20.Dos LIVA): vuelve a haber IVA —autoliquidado por el comprador, inversión del
   * sujeto pasivo— y NO se paga ITP. Para el público que la app declara (empresas y autónomos)
   * ese es el caso frecuente, y la app lo negaba: forzaba ITP en toda segunda mano.
   *
   * Madrid, 500.000 €, con renuncia:
   *   IVA 21 % = 105.000 · AJD 0,75 % = 3.750 · ITP = 0
   *   notaría (medio) 1.076,61 · registro 345,12 · gestoría 500
   *   → total gastos = 110.671,73 · coste total = 610.671,73
   */
  test('HALLAZGO 164 — la renuncia a la exención de IVA se puede elegir y liquida IVA + AJD, no ITP', async ({ page }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /renuncia al IVA/ }).click();
    await page.selectOption('#select-ccaa', 'madrid');
    await rellenar(page, PRECIO, '500000');

    expect(await valorTarjeta(page, 'IVA (renuncia')).toBe('105.000,00 €');
    // «3750,00 €» sin punto: es-ES no agrupa los millares de un número de cuatro cifras
    expect(await valorTarjeta(page, 'AJD (')).toBe('3750,00 €');
    // Ninguna TARJETA de resultado liquida ITP (el texto «ITP» sí sale en el recuadro de la
    // comunidad y en el bloque educativo, que hablan del impuesto, no de esta operación)
    await expect(page.locator('h3', { hasText: 'ITP (' })).toHaveCount(0);
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('110.671,73 €');
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('610.671,73 €');
    // Y se dice quién autoliquida ese IVA, que es lo que cambia respecto de la obra nueva
    await expect(page.locator('body')).toContainText('inversión del sujeto pasivo');
    // Se avisa además de que el AJD incrementado por renuncia NO se está aplicando
    await expect(page.locator('[class*="avisoRenuncia"]').first()).toContainText('tipo incrementado');
  });

  /**
   * HALLAZGO 165 (operativa, bajo) — mientras el campo de gestoría tenía el foco, un importe
   * negativo se sumaba tal cual al total y la tarjeta de gestoría ni se pintaba, así que el
   * total no cuadraba con sus líneas visibles. Hoy se acota con `Math.max(0, …)` en el motor.
   */
  test('HALLAZGO 165 — una gestoría negativa sin blur no descuadra el total', async ({ page }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Segunda mano/ }).click();
    await page.selectOption('#select-ccaa', 'madrid');
    await rellenar(page, PRECIO, '500000');
    const gestoria = page.locator('input[aria-label="' + GESTORIA + '"]');
    await gestoria.click();
    await gestoria.press('Control+a');
    await gestoria.pressSequentially('-1000');   // sin salir del campo
    // 30.000 + 1.076,608446 + 345,124967 = 31.421,733413, y son las tres líneas visibles
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('31.421,73 €');
    await expect(page.locator('h3', { hasText: 'Gastos de gestoría' })).toHaveCount(0);
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('531.421,73 €');
  });

  /**
   * HALLAZGO 166 (accesibilidad, bajo) — el `<label>Tipo de transmisión</label>` no gobernaba
   * ningún control y los botones no formaban grupo accesible. Hoy es `role="group"` +
   * `aria-labelledby`, con los tres botones dentro.
   */
  test('HALLAZGO 166 — los botones de transmisión forman un grupo accesible', async ({ page }) => {
    await page.goto(RUTA);
    const grupo = page.getByRole('group', { name: /Tipo de transmisión/ });
    await expect(grupo).toBeVisible();
    expect(await grupo.getByRole('button').count()).toBe(3);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// CASOS NUEVOS de la re-inspección del 27/08/2026 (lo que la vuelta anterior no miró).
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('Casos nuevos — re-inspección 27/08/2026', () => {
  /**
   * Cataluña, 2.000.000 €: cruza TRES cortes de la escala (600.000, 900.000 y 1.500.000) y
   * llega al tramo marginal del 13 %, que es el techo de RANGO_ITP.
   */
  test('Cataluña, segunda mano, 2.000.000 €: la escala llega al tramo del 13 %', async ({ page }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Segunda mano/ }).click();
    await page.selectOption('#select-ccaa', 'cataluna');
    await rellenar(page, PRECIO, '2000000');

    // 600.000×10 % + 300.000×11 % + 600.000×12 % + 500.000×13 %
    //   = 60.000 + 33.000 + 72.000 + 65.000 = 230.000 → 11,50 % efectivo
    expect(await valorTarjeta(page, 'ITP (')).toBe('230.000,00 €');
    expect(await rotuloTarjeta(page, /^ITP \(/)).toBe('ITP (11,50%)');
    // Notaría(2.000.000): arancel = 558,93946 + 1.398.987,90 × 0,0003 = 978,635830
    //   × 1,21 = 1.184,149354 · × 1,75 = 2.072,261370
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('2072,26 €');
    // Registro(2.000.000): 306,5156935 + 1.398.987,90 × 0,0002 = 586,313274 + 9,015182 = 595,328455 × 1,21
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('720,35 €');
    // Total = 230.000 + 2.072,261370 + 720,347431 + 500 = 233.292,608801
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('233.292,61 €');
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('2.233.292,61 €');
    // El tramo marginal declarado en ITP_CCAA['cataluna'] es el 13 %, el techo de RANGO_ITP
    const ultimo = ITP_CCAA['cataluna'].tramosProgresivos!.at(-1)!.tipo;
    expect(ultimo).toBe(RANGO_ITP.max);
  });

  /**
   * Tramo más alto de los aranceles: 20.000.000 €. El registro toca su tope
   * (`REGISTRO_MAXIMO = 2181,67`) y la notaría entra en el último tramo del RD 1426/1989.
   */
  test('Madrid, segunda mano, 20.000.000 €: el arancel registral toca su tope', async ({ page }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Segunda mano/ }).click();
    await page.selectOption('#select-ccaa', 'madrid');
    await rellenar(page, PRECIO, '20000000');

    // ITP = 20.000.000 × 6 % = 1.200.000
    expect(await valorTarjeta(page, 'ITP (')).toBe('1.200.000,00 €');
    // Notaría: 558,93946 + (6.010.121,04 − 601.012,10) × 0,0003 = 1.622,732682 → 2.181,672142
    //   + (20.000.000 − 6.010.121,04) × 0,0002 = 2.797,975792 → 4.979,647934
    //   × 1,21 = 6.025,374 · × 1,75 = 10.544,398
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('10.544,40 €');
    // Registro: la suma de tramos supera 2.181,67 y se corta ahí (REGISTRO_MAXIMO);
    //   2.181,67 + 6,010121 + 3,005061 = 2.190,685182 × 1,21 = 2.650,729070
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('2650,73 €');
    // Total = 1.200.000 + 10.544,398 + 2.650,729 + 500 = 1.213.695,127
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('1.213.695,13 €');
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('21.213.695,13 €');
  });

  /**
   * La renuncia a la exención cambia el impuesto y el rótulo, pero NO el resto del desglose:
   * en Madrid, elegir «2ª mano con renuncia» frente a «Segunda mano» sustituye 30.000 € de ITP
   * por 105.000 € de IVA + 3.750 € de AJD, y deja notaría, registro y gestoría intactos.
   */
  test('La renuncia sustituye ITP por IVA + AJD y no toca el resto del desglose', async ({ page }) => {
    await page.goto(RUTA);
    await page.selectOption('#select-ccaa', 'madrid');
    await rellenar(page, PRECIO, '500000');

    await page.getByRole('button', { name: /Segunda mano/ }).click();
    const notariaSinRenuncia = await valorTarjeta(page, 'Gastos de notaría');
    const registroSinRenuncia = await valorTarjeta(page, 'Registro de la Propiedad');
    expect(await valorTarjeta(page, 'ITP (')).toBe('30.000,00 €');

    await page.getByRole('button', { name: /renuncia al IVA/ }).click();
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe(notariaSinRenuncia);
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe(registroSinRenuncia);
    // 110.671,733413 − 31.921,733413 = 78.750 = 105.000 (IVA) + 3.750 (AJD) − 30.000 (ITP)
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('110.671,73 €');
  });

  /**
   * `aria-pressed` de los tres botones de transmisión: exactamente uno activo en cada momento
   * (CLAUDE.md global §5 — botón que cambia un estado visual lleva `aria-pressed`).
   */
  test('Exactamente un botón de transmisión con aria-pressed="true"', async ({ page }) => {
    await page.goto(RUTA);
    const grupo = page.getByRole('group', { name: /Tipo de transmisión/ });
    for (const patron of [/Segunda mano/, /Obra nueva/, /renuncia al IVA/]) {
      await grupo.getByRole('button', { name: patron }).click();
      expect(await grupo.locator('button[aria-pressed="true"]').count()).toBe(1);
      await expect(grupo.getByRole('button', { name: patron })).toHaveAttribute('aria-pressed', 'true');
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// REGRESIÓN — los cinco hallazgos de la re-inspección del 27/08/2026, reparados ese mismo
// día. Estaban escritos con `test.fail()`; ahora sujetan la reparación.
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('Regresión — hallazgos del 27/08/2026, reparados', () => {
  /**
   * HALLAZGO A (contenido, medio) — reparación ASIMÉTRICA de la bonificación de Ceuta y Melilla.
   *
   * `calcularAJD` aplica el 50 % del art. 57 bis.1, así que el IMPORTE es correcto, pero el
   * rótulo de la tarjeta usa el tipo NOMINAL de la tabla (`datosCcaaActual.ajd`) en vez del
   * efectivo. La tarjeta de ITP, que sí se corrigió con el hallazgo 160, muestra el efectivo:
   * en la misma pantalla conviven «ITP (3,00%) 15.000,00 €» —coherente— y «AJD (0,50%)
   * 1.250,00 €», donde 0,50 % de 500.000 € son 2.500 €, el doble de lo que la propia tarjeta
   * enseña. Es el defecto que el Inspector ya vio en `simulador-gastos-compraventa-garaje`.
   */
  test('REPARADO A — el rótulo del AJD en Ceuta muestra el tipo nominal con el importe bonificado', async ({ page }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Obra nueva/ }).click();
    await page.selectOption('#select-ccaa', 'ceuta');
    await rellenar(page, PRECIO, '500000');

    // El importe es correcto: 500.000 × 0,5 % = 2.500 → bonificado al 50 % = 1.250
    expect(await valorTarjeta(page, 'AJD (')).toBe('1250,00 €');
    // …y el rótulo debería decir el tipo que corresponde a ESE importe: 1.250 / 500.000 = 0,25 %
    expect(await rotuloTarjeta(page, /^AJD \(/)).toBe('AJD (0,25%)');
    // Hoy dice «AJD (0,50%)», el nominal de ITP_CCAA['ceuta'].ajd.
  });

  /**
   * HALLAZGO B (contenido, medio) — el bloque educativo documenta el comportamiento ANTERIOR
   * a la reparación del hallazgo 164.
   *
   * El recuadro «Limitaciones de este simulador» sigue diciendo que la calculadora «no
   * contempla situaciones especiales (renuncia a la exención de IVA en segunda mano…)»,
   * cuando la app tiene desde el 23/08/2026 un botón «2ª mano con renuncia al IVA» que la
   * calcula — y su propia FAQ, dos bloques más arriba, dice lo contrario: «El simulador lo
   * contempla en su tercera opción». Dos afirmaciones opuestas en la misma página.
   */
  test('REPARADO B — el recuadro de limitaciones niega la renuncia que la app sí calcula', async ({ page }) => {
    await page.goto(RUTA);

    // La app SÍ la calcula: Madrid, 500.000 € con renuncia → IVA 105.000 + AJD 3.750
    await page.getByRole('button', { name: /renuncia al IVA/ }).click();
    await page.selectOption('#select-ccaa', 'madrid');
    await rellenar(page, PRECIO, '500000');
    expect(await valorTarjeta(page, 'IVA (renuncia')).toBe('105.000,00 €');

    // …así que el recuadro de limitaciones no puede seguir diciendo que no la contempla.
    const limitaciones = (await page.locator('[class*="warningBox"]').first().innerText()).replace(/\s+/g, ' ');
    expect(limitaciones).not.toMatch(/no contempla situaciones especiales[^.]*renuncia a la exención de IVA/);
  });

  /**
   * HALLAZGO C (dato, medio) — la quinta pregunta del FAQPage JSON-LD se quedó escrita a mano
   * cuando las otras cuatro pasaron a derivarse del motor (hallazgo 159), y hoy lo contradice:
   *   · «Cataluña y Comunidad Valenciana … llegando al 10%-11%» — pero
   *     `ITP_CCAA['cataluna'].tramosProgresivos` llega al 13 % y la app cobra 230.000 €
   *     (11,50 % efectivo) por una nave de 2.000.000 € en Cataluña.
   *   · Valencia tiene el tipo general en el 9 % desde el 01/06/2026
   *     (`TIPOS_ITP_CCAA_2025`), no en el 10-11 %.
   * Es el bloque que consumen Bing Copilot, ChatGPT y Perplexity: la cifra que se les sirve
   * no es la que la app calcula.
   */
  test('REPARADO C — la quinta pregunta del FAQPage sigue escrita a mano y contradice al motor', async ({ page }) => {
    await page.goto(RUTA);
    const bloques = await page.locator('script[type="application/ld+json"]').allTextContents();
    const faq = bloques.find((b) => b.includes('FAQPage')) ?? '';
    expect(faq).toContain('¿Qué comunidad autónoma tiene el ITP más bajo para la compra de una nave?');
    // El techo real de la escala catalana es el 13 %, no el 10-11 %.
    expect(faq).not.toContain('llegando al 10%-11%');
    // Y el tipo general valenciano es el 9 % de TIPOS_ITP_CCAA_2025.
    expect(String(ITP_CCAA['valencia'].tipoGeneral)).toBe('9');
  });

  /**
   * HALLAZGO D (dato, bajo) — datos normativos escritos a mano en el bloque educativo
   * pudiendo venir de `data/fiscal`, que es la divergencia-en-silencio que ya costó el
   * hallazgo 163 en este mismo fichero:
   *   · la tabla comparativa rotula «IVA obra nueva · 21 % · 10 %» con literales, cuando
   *     `IVA_INMUEBLES_2025.local` (21) ya se importa aquí e `IVA_INMUEBLES_2025.obraNueva`
   *     vale 10 — y la fila de al lado, «AJD obra nueva», sí se deriva de RANGO_AJD;
   *   · la tarjeta «Vender nave con ganancia patrimonial» dice «(19-30%)» cuando esos dos
   *     extremos son el primer y el último tramo de `TRAMOS_GANANCIAS_PATRIMONIALES_2025`.
   */
  test('REPARADO D — la tabla comparativa y el IRPF del ahorro llevan los tipos escritos a mano', async () => {
    const fuente = await leerFuente();
    // Los valores de data/fiscal que hoy coinciden con los literales (por eso no hay error de
    // importe: hay riesgo de divergencia el día que cambien).
    expect(IVA_INMUEBLES_2025.local).toBe(21);
    expect(IVA_INMUEBLES_2025.obraNueva).toBe(10);
    expect(TRAMOS_GANANCIAS_PATRIMONIALES_2025[0].tipo).toBe(19);
    expect(TRAMOS_GANANCIAS_PATRIMONIALES_2025.at(-1)!.tipo).toBe(30);
    // Ninguno de ellos debería estar escrito a mano en la página.
    expect(fuente).not.toMatch(/>21%<\/td>/);
    expect(fuente).not.toMatch(/>10%<\/td>/);
    expect(fuente).not.toContain('(19-30%)');
  });

  /**
   * HALLAZGO E (contenido, bajo) — en Canarias, Ceuta y Melilla la tarjeta del impuesto nombra
   * siempre «la obra nueva», aunque el usuario haya elegido «2ª mano con renuncia al IVA».
   * El texto es fijo (`impuestoNoCalculado`) y no mira qué transmisión se ha seleccionado, así
   * que describe una operación distinta de la que el usuario está simulando.
   */
  test('REPARADO E — en Canarias, la tarjeta habla de «obra nueva» aunque se elija la renuncia', async ({ page }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /renuncia al IVA/ }).click();
    await page.selectOption('#select-ccaa', 'canarias');
    await rellenar(page, PRECIO, '500000');

    expect(await valorTarjeta(page, 'IGIC')).toBe('No calculado');
    // Hoy: «En Canarias no rige el IVA: la obra nueva tributa por el IGIC, que este simulador
    // no calcula», con «2ª mano con renuncia al IVA» seleccionado.
    expect(await descripcionTarjeta(page, 'IGIC')).not.toContain('la obra nueva');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// RE-INSPECCIÓN DE CIERRE — 28/08/2026
//
// MITAD A (cierre): se reproduce con su caso literal la reparación del commit d787b81b
//   —el IVA que no existe en Canarias y el rótulo EFECTIVO del AJD, que es la reparación
//   de referencia de la que carecían sus hermanas— y, sobre todo, se comprueba que NO se
//   pasó de largo: en SEGUNDA mano el ITP se sigue cobrando en Canarias.
// MITAD B (casos nuevos): tres casos frescos, resueltos a mano ANTES de ejecutar la app,
//   con el desarrollo entero junto a cada aserción. Ninguna cifra sale de memoria: los
//   tipos vienen de `TIPOS_ITP_CCAA_2025`/`ITP_CCAA` y los aranceles de `ARANCELES_NOTARIO`
//   y `ARANCELES_REGISTRO` (RD 1426/1989 y RD 1427/1989).
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('Cierre y casos nuevos — 28/08/2026', () => {
  /**
   * MITAD A — la reparación del IVA de Canarias no se llevó por delante el ITP.
   *
   * Lo que se apagó en `c47189ca`/`d787b81b` es el IVA de una PRIMERA entrega en un
   * territorio donde ese impuesto no existe. El ITP no tiene nada que ver: es un tributo
   * cedido que Canarias sí exige, con su tipo general del 6,5 % (`TIPOS_ITP_CCAA_2025`),
   * así que una nave usada en Las Palmas tiene que seguir liquidándolo.
   *
   * Canarias · segunda mano · 500.000 € · gestoría 500 € (a mano):
   *   ITP  = 500.000 × 6,5 %                                    = 32.500,00
   *   AJD  = 0 (no hay cuota gradual en la compraventa sin IVA)
   *   Notaría: arancel = 90,15 + 108,182205 + 45,0759 + 90,15182
   *            + (500.000 − 150.253,03) × 0,0005 = 174,873485    = 508,43341
   *            × 1,21 = 615,2044261 · × 1,75 (punto medio)       =  1.076,6077
   *   Registro: 24,04 + 42,0708575 + 37,56325 + 67,613865
   *            + (500.000 − 150.253,03) × 0,0003 = 104,924091    = 276,2120635
   *            + 6,010121 + 3,005061 = 285,2272455 · × 1,21      =    345,1250
   *   Total gastos = 32.500 + 1.076,6077 + 345,1250 + 500        = 34.421,7327
   *   Total operación                                            = 534.421,7327
   * Y ni el total ni su rótulo pueden marcarse como PARCIAL: aquí no falta ningún impuesto.
   */
  test('A (cierre) — Canarias en SEGUNDA mano sigue cobrando ITP: la reparación del IVA no se pasó de largo', async ({ page }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Segunda mano/ }).click();
    await page.selectOption('#select-ccaa', 'canarias');
    await rellenar(page, PRECIO, '500000');
    await rellenar(page, GESTORIA, '500');

    expect(await rotuloTarjeta(page, /^ITP \(/)).toBe('ITP (6,50%)');
    expect(await valorTarjeta(page, 'ITP (')).toBe('32.500,00 €');
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('1076,61 €');
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('345,12 €');
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('34.421,73 €');
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('534.421,73 €');
    // Nada de «parcial»: el IGIC solo entra en juego cuando hay IVA que sustituir.
    await expect(page.locator('body')).not.toContainText('COSTE TOTAL (PARCIAL)');
    // Ninguna tarjeta del desglose se queda «No calculado» (el recuadro de la comunidad sí
    // rotula «IGIC (obra nueva) · No calculado», y eso es correcto: describe la obra nueva).
    await expect(page.locator('[class*="resultados"]').getByText('No calculado')).toHaveCount(0);
    // El tipo del recuadro de la comunidad sale de la tabla, con su decimal y coma española.
    expect(ITP_CCAA['canarias'].tipoGeneral).toBe(6.5);
  });

  /**
   * MITAD A — el rótulo EFECTIVO del AJD, ahora en Melilla y con otro importe.
   *
   * `REPARADO A` lo fija en Ceuta con 500.000 €; esto comprueba que la reparación es de la
   * fórmula y no del caso: el art. 57 bis.1 del TRLITPAJD bonifica al 50 % la cuota gradual
   * cuando el Registro radica en Melilla igual que en Ceuta.
   *
   * Melilla · obra nueva · 800.000 € · gestoría 500 € (a mano):
   *   IPSI: no se calcula (TERRITORIOS_SIN_IVA) → total marcado PARCIAL
   *   AJD  = 800.000 × 0,5 % = 4.000 · bonificado al 50 %        =  2.000,00
   *          tipo efectivo = 2.000 / 800.000                     =      0,25 %
   *   Notaría: arancel = 558,93946 (hasta 601.012,10)
   *            + (800.000 − 601.012,10) × 0,0003 = 59,69637      = 618,63583
   *            × 1,21 = 748,5493543 · × 1,75                     =  1.309,9614
   *   Registro: 306,5156935 (hasta 601.012,10)
   *            + (800.000 − 601.012,10) × 0,0002 = 39,79758      = 346,3132735
   *            + 9,015182 = 355,3284555 · × 1,21                 =    429,9474
   *   Total parcial = 2.000 + 1.309,9614 + 429,9474 + 500        =  4.239,9088
   *   Total operación                                            = 804.239,9088
   */
  test('A (cierre) — Melilla, obra nueva 800.000 €: el AJD se rotula con su tipo efectivo (0,25%)', async ({ page }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Obra nueva/ }).click();
    await page.selectOption('#select-ccaa', 'melilla');
    await rellenar(page, PRECIO, '800000');
    await rellenar(page, GESTORIA, '500');

    expect(await valorTarjeta(page, 'IPSI')).toBe('No calculado');
    expect(await rotuloTarjeta(page, /^AJD \(/)).toBe('AJD (0,25%)');
    expect(await valorTarjeta(page, 'AJD (')).toBe('2000,00 €');
    expect(await descripcionTarjeta(page, 'AJD (')).toContain('bonificación del 50 %');
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('4239,91 €');
    expect(await valorTarjeta(page, 'COSTE TOTAL (PARCIAL)')).toBe('804.239,91 €');
    // El 21 % que allí no existe no aparece por ninguna parte del desglose.
    await expect(page.getByText('168.000,00 €')).toHaveCount(0);
  });

  /**
   * MITAD B · CASO NUEVO 1 (normal) — Baleares, segunda mano, 700.000 €.
   *
   * Una nave usada en el tramo medio de la escala balear: es donde el tipo NOMINAL de la
   * tabla (8 %) y el que de verdad se paga dejan de coincidir, que es justo lo que el
   * rótulo del tipo efectivo tiene que enseñar. `ITP_CCAA['baleares'].tramosProgresivos`
   * = 8 % hasta 400.000, 9 % hasta 600.000, 10 % hasta 1.000.000, 12 % hasta 2.000.000, 13 %.
   *
   * A mano (gestoría 500 €):
   *   ITP = 400.000 × 8 % + 200.000 × 9 % + 100.000 × 10 %
   *       = 32.000 + 18.000 + 10.000                              = 60.000,00
   *   tipo efectivo = 60.000 / 700.000                            =      8,5714 % → «8,57%»
   *   AJD = 0 (segunda mano sin renuncia: no hay cuota gradual)
   *   Notaría: arancel = 558,93946 + (700.000 − 601.012,10) × 0,0003 = 29,69637
   *          = 588,63583 · × 1,21 = 712,2493543 · × 1,75           =  1.246,4364
   *   Registro: 306,5156935 + (700.000 − 601.012,10) × 0,0002 = 19,79758
   *          = 326,3132735 + 9,015182 = 335,3284555 · × 1,21       =    405,7474
   *   Total gastos = 60.000 + 1.246,4364 + 405,7474 + 500          = 62.152,1838
   *   % sobre el precio = 62.152,1838 / 700.000                    =      8,8789 % → «8,88%»
   *   Total operación                                              = 762.152,1838
   */
  test('B1 (normal) — Baleares, segunda mano, 700.000 €: la escala 8/9/10 da un efectivo del 8,57%', async ({ page }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Segunda mano/ }).click();
    await page.selectOption('#select-ccaa', 'baleares');
    await rellenar(page, PRECIO, '700000');
    await rellenar(page, GESTORIA, '500');

    expect(await rotuloTarjeta(page, /^ITP \(/)).toBe('ITP (8,57%)');
    expect(await valorTarjeta(page, 'ITP (')).toBe('60.000,00 €');
    // El nominal de la tabla, 8 %, habría dado 56.000 €: el tramo importa.
    await expect(page.getByText('56.000,00 €')).toHaveCount(0);
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('1246,44 €');
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('405,75 €');
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('62.152,18 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toContain('8,88%');
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('762.152,18 €');
  });

  /**
   * MITAD B · CASO NUEVO 2 (el supuesto propio de una nave) — Cataluña, 2ª mano con
   * renuncia a la exención, 800.000 €.
   *
   * Es el caso que separa una nave de una vivienda: entre empresarios con derecho a
   * deducción la segunda transmisión vuelve al IVA (art. 20.Dos LIVA), con inversión del
   * sujeto pasivo, y entonces NO se paga ITP pero SÍ la cuota gradual de AJD. La app tiene
   * que sustituir un impuesto por el otro, no sumarlos.
   *
   * A mano (gestoría 500 €):
   *   IVA = 800.000 × 21 % (IVA_INMUEBLES_2025.local)             = 168.000,00
   *   AJD = 800.000 × 1,5 % (ITP_CCAA['cataluna'].ajd)            =  12.000,00
   *   ITP = 0 — y el 10 % del primer tramo catalán (80.000 €) no puede aparecer
   *   Notaría 1.309,9614 · Registro 429,9474 (mismo desarrollo que el caso de Melilla)
   *   Total gastos = 168.000 + 12.000 + 1.309,9614 + 429,9474 + 500 = 182.239,9088
   *   Total operación                                               = 982.239,9088
   */
  test('B2 (renuncia) — Cataluña, 2ª mano con renuncia, 800.000 €: IVA 21% + AJD y ningún ITP', async ({ page }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /renuncia al IVA/ }).click();
    await page.selectOption('#select-ccaa', 'cataluna');
    await rellenar(page, PRECIO, '800000');
    await rellenar(page, GESTORIA, '500');

    expect(await rotuloTarjeta(page, /^IVA \(renuncia/)).toBe('IVA (renuncia · ISP) (21,00%)');
    expect(await valorTarjeta(page, 'IVA (renuncia')).toBe('168.000,00 €');
    expect(await rotuloTarjeta(page, /^AJD \(/)).toBe('AJD (1,50%)');
    expect(await valorTarjeta(page, 'AJD (')).toBe('12.000,00 €');
    // No coexisten: ni tarjeta de ITP ni el 10 % del primer tramo catalán.
    await expect(page.locator('h3', { hasText: /^ITP \(/ })).toHaveCount(0);
    await expect(page.getByText('80.000,00 €')).toHaveCount(0);
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('182.239,91 €');
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('982.239,91 €');
  });

  /**
   * MITAD B · CASO NUEVO 3 (LÍMITE) — Madrid, segunda mano, 6.010,12 €.
   *
   * El primer tramo del arancel notarial (RD 1426/1989) y del registral (RD 1427/1989) es
   * una cuota FIJA hasta 6.010,12 € exactos. Ese es el punto en el que el bucle de
   * `calcularArancelNotarial` tiene que cortar sin entrar en el tramo del exceso: un `<=`
   * mal puesto ahí cobraría un exceso de cero euros o duplicaría la base. Además el precio
   * se teclea en formato español CON los dos separadores («6.010,12»), donde el último
   * manda como decimal.
   *
   * A mano (gestoría 500 €):
   *   ITP = 6.010,12 × 6 % (Madrid, TIPOS_ITP_CCAA_2025)          =    360,6072
   *   Notaría: arancel = 90,15 exacto (cuota fija del primer tramo)
   *            × 1,21 = 109,0815 · × 1,5 = 163,62225 (min)
   *                              × 2   = 218,163   (max)
   *                              × 1,75                            =    190,8926
   *   Registro: 24,04 + 6,010121 + 3,005061 = 33,055182 · × 1,21    =     39,9968
   *   Total gastos = 360,6072 + 190,8926 + 39,9968 + 500            =  1.091,4966
   *   % sobre el precio = 1.091,4966 / 6.010,12                     =     18,1610 % → «18,16%»
   *   Total operación = 6.010,12 + 1.091,4966                       =  7.101,6166
   */
  test('B3 (límite) — Madrid, 6.010,12 €: la frontera exacta del primer tramo del arancel', async ({ page }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Segunda mano/ }).click();
    await page.selectOption('#select-ccaa', 'madrid');
    await rellenar(page, PRECIO, '6.010,12');
    await rellenar(page, GESTORIA, '500');

    expect(await valorTarjeta(page, 'Precio de la nave industrial')).toBe('6010,12 €');
    expect(await rotuloTarjeta(page, /^ITP \(/)).toBe('ITP (6,00%)');
    expect(await valorTarjeta(page, 'ITP (')).toBe('360,61 €');
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('190,89 €');
    expect(await descripcionTarjeta(page, 'Gastos de notaría')).toContain('entre 163,62 € y 218,16 €');
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('40,00 €');
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('1091,50 €');
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('7101,62 €');
  });

  /**
   * MITAD B · CASO NUEVO 4 (RECHAZO) — la gestoría que no es un número.
   *
   * `CASO 3` cubre el rechazo del PRECIO y `HALLAZGO 165` el de una gestoría negativa. Falta
   * la tercera puerta: una gestoría que pasa el filtro del input (solo dígitos y separadores)
   * pero que `parseSpanishNumber` rechaza con NaN — «1.2.3», donde `parseFloat` habría
   * devuelto 10,5 y colado un importe inventado. `parseSpanishNumberOr` la resuelve a 0.
   *
   * Madrid · segunda mano · 500.000 € · gestoría «1.2.3» (a mano):
   *   ITP 30.000 + notaría 1.076,6077 + registro 345,1250 + gestoría 0 = 31.421,7327
   *   Total operación                                                  = 531.421,7327
   * y sin tarjeta de gestoría, porque el render la esconde cuando vale 0.
   */
  test('B4 (rechazo) — una gestoría no numérica vale 0, no descuadra el total ni pinta NaN', async ({ page }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Segunda mano/ }).click();
    await page.selectOption('#select-ccaa', 'madrid');
    await rellenar(page, PRECIO, '500000');
    await rellenar(page, GESTORIA, '1.2.3');

    await expect(page.locator('h3', { hasText: 'Gastos de gestoría' })).toHaveCount(0);
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('31.421,73 €');
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('531.421,73 €');
    const cuerpo = await page.locator('body').innerText();
    expect(cuerpo).not.toContain('NaN');
    expect(cuerpo).not.toContain('No definido');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// HALLAZGOS ABIERTOS — re-inspección del 28/08/2026.
// Afirman lo que DEBERÍA pasar y hoy fallan a propósito. UNA sola aserción de fondo cada
// uno: con `test.fail()` basta con fallar en algún punto, y varias aserciones taparían que
// la que documenta el hallazgo ni llega a evaluarse.
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('Hallazgos abiertos — 28/08/2026', () => {
  /**
   * HALLAZGO F (contenido, medio) — el formulario ofrece dos controles rotulados con un IVA
   * del 21 % en los tres territorios donde ese impuesto no existe.
   *
   * La reparación del `d787b81b` llegó al RESULTADO (tarjeta «IGIC · No calculado», total
   * marcado parcial) y al recuadro de la comunidad, que ya rotula «IGIC (obra nueva) · No
   * calculado». No llegó a los BOTONES, que es donde el usuario elige: con Canarias
   * seleccionada siguen diciendo «Paga IVA 21% + AJD» e «IVA 21% (ISP) + AJD» tres
   * centímetros por encima del aviso «En Canarias no se aplica el IVA». El usuario elige el
   * supuesto leyendo una promesa que la misma pantalla desmiente. Igual en Ceuta y Melilla.
   */
  test.fail('HALLAZGO F — en Canarias los botones siguen ofreciendo «IVA 21%»', async ({ page }) => {
    await page.goto(RUTA);
    await page.selectOption('#select-ccaa', 'canarias');
    const grupo = page.getByRole('group', { name: /Tipo de transmisión/ });
    const rotulos = (await grupo.innerText()).replace(/\s+/g, ' ');
    // Hoy: «🔄 Segunda mano Paga ITP (tipo general) || 🆕 Obra nueva / Promotor Paga IVA 21% +
    // AJD || 🤝 2ª mano con renuncia al IVA IVA 21% (ISP) + AJD».
    expect(rotulos).not.toMatch(/IVA\s*21\s*%/);
  });

  /**
   * HALLAZGO G (contenido, medio) — la FAQ del bloque educativo niega el AJD que la app
   * cobra en su tercera opción.
   *
   * «¿Hay AJD en la compra de una nave industrial?» responde: «En segunda mano, el AJD solo
   * se pagaría sobre la escritura de hipoteca, no sobre la compraventa en sí». Pero con
   * Cataluña · 2ª mano con renuncia · 800.000 € la app liquida 12.000 € de AJD sobre esa
   * misma compraventa de segunda mano (lo comprueba el caso B2 de arriba), y su propio aviso
   * bajo los botones advierte de que varias comunidades le aplican ahí un tipo incrementado.
   * Es la misma reparación de `REPARADO B` —el recuadro de limitaciones, corregido el
   * 27/08/2026— que no se propagó al párrafo de al lado.
   */
  test.fail('HALLAZGO G — la FAQ dice que en segunda mano no hay AJD sobre la compraventa', async ({ page }) => {
    await page.goto(RUTA);
    const bloque = (
      await page
        .locator('strong', { hasText: '¿Hay AJD en la compra de una nave industrial?' })
        .first()
        .locator('xpath=..')
        .innerText()
    ).replace(/\s+/g, ' ');
    expect(bloque).not.toMatch(/En segunda mano, el AJD solo se pagaría sobre la escritura de hipoteca/);
  });

  /**
   * HALLAZGO H (contenido, bajo) — «no hay bonificaciones para naves industriales» es falso
   * en Ceuta y Melilla, y lo desmiente la propia app.
   *
   * La tarjeta «Autónomo compra nave de segunda mano» afirma que se paga «ITP al tipo general
   * de su CCAA (no hay bonificaciones para naves industriales)». Tres bloques más abajo, su
   * propia FAQ dice lo contrario: «en Ceuta y Melilla se descuenta el 50 % (art. 57 bis del
   * TRLITPAJD), y ahí sí entra cualquier inmueble, también una nave». Y el motor la aplica:
   * Ceuta · segunda mano · 500.000 € liquida 15.000 €, no 30.000 € (test HALLAZGO 157).
   */
  test.fail('HALLAZGO H — el caso de uso del autónomo niega la bonificación de Ceuta y Melilla', async ({ page }) => {
    await page.goto(RUTA);
    const tarjeta = (
      await page
        .locator('strong', { hasText: 'Autónomo compra nave de segunda mano' })
        .first()
        .locator('xpath=..')
        .innerText()
    ).replace(/\s+/g, ' ');
    expect(tarjeta).not.toContain('no hay bonificaciones para naves industriales');
  });

  /**
   * HALLAZGO I (dato, bajo) — el 21 % sigue escrito a mano en tres sitios del bloque
   * educativo, con `IVA_INMUEBLES_2025.local` ya importado en el fichero.
   *
   * `REPARADO D` corrigió la tabla comparativa el 27/08/2026, pero dejó atrás los otros tres
   * literales: «Paga IVA 21% + AJD» (caso de uso de la empresa), «comprar en primera mano
   * (IVA 21%)» (consejo del régimen de IVA) y «El IVA del 21% solo es deducible…»
   * (limitaciones). Es exactamente la divergencia-en-silencio del hallazgo 163: hoy coinciden,
   * y el día que `IVA_INMUEBLES_2025.local` cambie, la app cobrará una cifra y contará otra.
   */
  test.fail('HALLAZGO I — quedan tres «21%» escritos a mano en el bloque educativo', async () => {
    const fuente = await leerFuente();
    // El valor existe en data/fiscal y ya está importado aquí (lo fija `REPARADO D`).
    expect(fuente.match(/\b21%/g) ?? []).toHaveLength(0);
  });
});
