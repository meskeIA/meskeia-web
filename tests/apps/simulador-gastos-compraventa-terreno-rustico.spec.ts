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
 * HALLAZGOS: los tres de la re-inspección del 06/10/2026 (2920-2922: las notas de la comunidad
 * escritas para la vivienda —Galicia y Andalucía—, Canarias y Andalucía contradiciendo la tabla, y
 * el botón «Con renuncia a la exención IVA») se REPARARON ese mismo día y sus cuatro casos ya no
 * llevan `test.fail()`. A 08/10/2026 la base no tenía ninguno abierto antes de la inspección de
 * ese día, cuyos seis hallazgos van con `test.fail()` y etiqueta [08/10-a…f] en el ÚLTIMO
 * describe del fichero. Lo anterior también está REPARADO: los de la
 * re-inspección del 26/09/2026 (2214-2220) están sin marca en su describe, con la receta de la
 * familia (base mínima del AJD, 2209; notas de la comunidad, 2208). Los casos anteriores con Canarias,
 * Ceuta y Melilla se recalcularon a mano (notaría y registro ÷ 1,21), y los lectores de tarjeta
 * comparan cifras con el «%» pegado (`pegarPct`) y apartan la salvedad del AJD
 * (`sinAvisoBaseAjd`), que tiene su propio caso.
 */
import { test, expect, type Page } from '@playwright/test';
import {
  TRAMOS_GANANCIAS_PATRIMONIALES_2025,
  // Añadidos en la re-inspección del 26/09/2026 (su sección, al final del fichero).
  GANANCIAS_PATRIMONIALES_META,
  FISCAL_INMUEBLES_META,
  TIPOS_ITP_CCAA_2025,
} from '../../data/fiscal/inmuebles';
// Re-inspección del 26/09/2026: el motor de la familia, para anclar los esperados a sus tablas.
import { ITP_CCAA, FACTURA_NOTARIAL, REGISTRO_CONCEPTOS, TERRITORIOS_SIN_IVA } from '../../data/itp-ccaa';
// Añadido en la re-inspección del 12/09/2026: los casos nuevos siembran esperando a que
// React haya montado el input, en vez de confiar en el `load` de `page.goto()`.
import { esperarHidratacion, esperarValorEnReact, sembrarValor } from './_hidratacion';

const RUTA = '/simulador-gastos-compraventa-terreno-rustico/';

const PRECIO = 'Precio de compra de la finca rústica';
const GESTORIA = 'Gastos de gestoría (€)';

/**
 * Cifras, no tipografía: desde el 26/09/2026 la app separa el «%» con espacio duro (hallazgos
 * 2204/2211/2216), y `\s+` → ' ' lo deja en un espacio normal. Los casos anteriores comparan
 * cifras escritas con el «%» pegado, así que los lectores de tarjeta lo vuelven a pegar; la
 * tipografía la vigila el caso del «%» (forma «c»), que lee el texto en crudo.
 */
const pegarPct = (s: string): string => s.replace(/(\d) %/g, '$1%');

/**
 * La salvedad del art. 30.1 TRLITPAJD (hallazgo 2209, 26/09/2026) que la app añade a la tarjeta
 * del AJD y al total cuando hay AJD. Es la MISMA frase en las dos, y los casos anteriores miden
 * otra cosa en esas descripciones (la bonificación, el tipo de la renuncia, la dirección del
 * aviso), así que el lector de descripciones la aparta; su presencia —y su ausencia sin AJD— la
 * mide el caso «Hallazgo 2209» de este mismo fichero, sobre el texto en crudo.
 */
const AVISO_BASE_AJD =
  'El AJD va calculado sobre el precio escrito, pero su base no puede ser inferior al valor de referencia catastral (art. 30.1 TRLITPAJD): si ese valor es mayor, el AJD se liquida sobre él';
const sinAvisoBaseAjd = (s: string): string =>
  s.endsWith(AVISO_BASE_AJD) ? s.slice(0, -AVISO_BASE_AJD.length).replace(/\.\s*$/, '') : s;

/**
 * Para las aserciones sobre el LOCALIZADOR de la descripción del total (`toHaveText`), que lee
 * el texto en crudo: acepta el texto esperado con o sin la salvedad del art. 30.1 detrás. Esos
 * casos miden la dirección del aviso; la salvedad tiene su propio caso («Hallazgo 2209»).
 */
const admiteAvisoAjd = (texto: string): RegExp =>
  new RegExp(`^${texto.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?:\\. ${AVISO_BASE_AJD.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})?$`);

/**
 * El marcador del panel cuando no hay cifra que publicar. Desde el 26/09/2026 (hallazgo 2218,
 * patrón 5 de la familia) distingue tres estados: el campo VACÍO («Introduce el precio…»), el
 * ILEGIBLE («No se ha podido leer…», que conserva esa frase detrás) y el LEGIBLE PERO IMPOSIBLE
 * —0, negativo o un importe que se pinta 0,00 €—, que dice que tiene que ser mayor que 0. Los
 * casos antiguos que solo miran que no haya desglose aceptan cualquiera de los tres.
 */
const MARCADOR_SIN_CIFRA =
  /Introduce el precio de la finca rústica para ver el desglose de gastos|tiene que ser mayor que 0: corrígelo para ver el desglose de gastos de la finca rústica/;
const PRECIO_NO_VALE = 'tiene que ser mayor que 0: corrígelo para ver el desglose de gastos de la finca rústica';
/**
 * Desde el 26/09/2026 (tarde) el cierre es PARCIAL en Canarias, Ceuta y Melilla aunque la
 * operación pague ITP: a la notaría y el registro les falta su IGIC o IPSI (criterio del
 * estimador, el garaje y el trastero). El total lo dice con esta línea.
 */
const sinHonorarios = (imp: string) =>
  ` — SIN el ${imp} de las facturas de notaría y registro, que tampoco se calcula`;
const SOLO_HONORARIOS = (imp: string) =>
  `Precio + los gastos calculados, sin el ${imp} de las facturas de notaría y registro (ver la nota de abajo)`;

/** Valor de una ResultCard, con el espacio duro del formato español normalizado. */
async function valorTarjeta(page: Page, titulo: string): Promise<string> {
  const valor = page
    .locator('h3', { hasText: titulo })
    .first()
    .locator('xpath=../following-sibling::div[1]/p');
  return pegarPct((await valor.innerText()).replace(/\s+/g, ' ').trim());
}

/** Texto descriptivo bajo el valor de una ResultCard. */
async function descripcionTarjeta(page: Page, titulo: string): Promise<string> {
  const desc = page
    .locator('h3', { hasText: titulo })
    .first()
    .locator('xpath=../following-sibling::p[1]');
  return sinAvisoBaseAjd(pegarPct((await desc.innerText()).replace(/\s+/g, ' ').trim()));
}

/** Rótulo completo de una ResultCard (lleva dentro el tipo aplicado). */
async function rotuloTarjeta(page: Page, patron: RegExp): Promise<string> {
  return pegarPct((await page.locator('h3', { hasText: patron }).first().innerText()).replace(/\s+/g, ' ').trim());
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
    // 26/09/2026 (hallazgo 2214): en Canarias, Ceuta y Melilla la notaría y el registro van SIN
    // IVA —su factura lleva IGIC o IPSI, que la app no calcula y nombra junto al total—.
    //   en Ceuta: 358,43341 ×1,5 = 537,650115 · ×2 = 716,86682 · medio ×1,75 = 627,258468
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('627,26 €');
    const notaria = await descripcionTarjeta(page, 'Gastos de notaría');
    expect(notaria).toContain('537,65 €');
    expect(notaria).toContain('716,87 €');

    // Registro — arancel(200.000):
    //   24,04 + 42,0708575 + 37,56325 + (90.151,82 × 0,00075 = 67,613865)
    //   + tramo 5 (0,030 %) → 49.746,97 × 0,0003 = 14,924091
    //   suma = 186,2120635 (por debajo del tope) + 9,015182 = 195,2272455
    //   con el 21 % de IVA = 236,224967 (en Ceuta, sin IVA: 195,2272455)
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('195,23 €');

    // Total gastos = 6.000 + 627,26 + 195,23 + 400 = 7.222,49
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('7222,49 €');
    // 7.222,49 / 200.000 = 3,611245 % → «3,61%»
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toContain('3,61%');
    // Coste total = 200.000 + 7.222,49 = 207.222,49
    // Parcial: a los honorarios les falta el IPSI (26/09/2026, tarde).
    expect(await valorTarjeta(page, 'COSTE TOTAL (PARCIAL)')).toBe('207.222,49 €');
    expect(await descripcionTarjeta(page, 'COSTE TOTAL')).toBe(SOLO_HONORARIOS('IPSI'));
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
    const marcador = page.getByText(MARCADOR_SIN_CIFRA);

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
    // 26/09/2026 (hallazgo 2217): el IVA de la renuncia tiene su propio sello (FISCAL_IVA_META).
    await expect(page.getByText(/ITP\/AJD 2026/)).toBeVisible();
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

    await expect(page.getByText(/escala progresiva \(10\s% → 11\s% → 12\s% → 13\s%\)/)).toBeVisible();
    expect(await valorTarjeta(page, 'ITP (')).toBe('105.000,00 €');
    expect(await rotuloTarjeta(page, /^ITP \(/)).toBe('ITP (10,50%)');
  });

  /**
   * País Vasco con renuncia: se cobra el AJD foral del 0,5 %.
   *
   * ⚠️ 24/09/2026 — hasta ese día este test se llamaba «no se cobra AJD» y CONSAGRABA el defecto
   * de los hallazgos 1583 y 1592 de las hermanas: `ITP_CCAA['pais-vasco'].ajd = 0` era la exención
   * foral de la primera transmisión de VIVIENDA, y la escritura de una finca con renuncia paga el
   * 0,5 % (Gipuzkoa, NF 18/1987 art. 29.2; Bizkaia, NF 1/2011 art. 44.1).
   */
  test('País Vasco con renuncia: se cobra el AJD foral del 0,5 %', async ({ page }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /renuncia a la exención/i }).click();
    await page.selectOption('#select-ccaa', 'pais-vasco');
    await rellenar(page, PRECIO, '100000');
    // AJD = 100.000 × 0,5 % = 500
    expect(await rotuloTarjeta(page, /^AJD \(/)).toBe('AJD (0,50%)');
    expect(await valorTarjeta(page, 'AJD (')).toBe('500,00 €');
    // El IVA, al 21 %: 100.000 × 21 % = 21.000
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
    const cuerpo = pegarPct(((await page.locator('body').textContent()) ?? '').replace(/\s+/g, ' '));
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
    await expect(page.getByText(/escala progresiva \(8\s% → 8,50\s% → 9\s% → 9,50\s% → 10\s%\)/)).toBeVisible();

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
// HALLAZGOS de la re-inspección del 11/09/2026 — REPARADOS (728, 729 y 730).
// Se escribieron con `test.fail()` afirmando lo que debería pasar; al repararlos perdieron la
// marca y quedaron como test de regresión. Los tres eran «efecto familia»: el defecto se había
// reparado en una hermana del clúster y no se propagó a ésta.
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('Hallazgos reparados — re-inspección 11/09/2026', () => {
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
  return textos.map((t) => pegarPct(t.replace(/\s+/g, ' ').trim()));
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
   * CASO 2 (LÍMITE) — Melilla, 300.000 €, gestoría 400 €, con la renuncia elegida antes.
   *
   * Es el cruce de las dos excepciones territoriales a la vez, y por eso es el caso límite.
   * ⚠️ 24/09/2026 — este caso esperaba «IPSI · No calculado» y AJD bonificado: CONSAGRABA una
   * renuncia que en Melilla no existe. Se decidió con la norma (hallazgo 1584 de nave-industrial
   * y 1605 de esta app): la Ley 8/1991 del IPSI (BOE-A-1991-7645) toma sus exenciones de la ley
   * del IVA (art. 7) sin regular ninguna renuncia, y prohíbe deducir el IPSI soportado en
   * inmuebles (art. 20.3), que es lo que la renuncia del art. 20.Dos LIVA exige. La finca exenta
   * paga TPO (art. 3.c Ley 8/1991 y art. 7.5 TRLITPAJD), con la bonificación del art. 57 bis.3.a:
   *   ITP = 300.000 × 6 % × (1 − 0,5) = 9.000,00 (3,00 %) · sin AJD
   *   Notaría 864,86 · registro 272,52 · gestoría 400
   *   Total = 9.000 + 864,86 + 272,52 + 400 = 10.537,38 (3,51246 % → 3,51 %) · coste 310.537,38
   */
  test('CASO 2 (límite) — Melilla, 300.000 €: la renuncia no existe en el IPSI y se paga ITP bonificado al 50 %', async ({ page }) => {
    await abrirHidratada(page);
    await page.getByRole('button', { name: /renuncia a la exención/i }).click();
    await page.selectOption('#select-ccaa', 'melilla');
    await sembrarValor(page, CAMPO_PRECIO, '300000');

    // La renuncia no se puede elegir y el botón dice por qué; se calcula la compra habitual.
    const renuncia = page.getByRole('button', { name: /renuncia a la exención/i });
    await expect(renuncia).toBeDisabled();
    await expect(renuncia).toContainText('No existe en el IPSI: paga ITP');
    await expect(page.getByRole('button', { name: /Compra habitual/ })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('h3', { hasText: /^IPSI$/ })).toHaveCount(0);
    await expect(page.locator('h3', { hasText: /^AJD/ })).toHaveCount(0);
    await expect(page.locator('h3', { hasText: /IVA \(renuncia/ })).toHaveCount(0);
    // Ni el aviso de «no se aplica el IVA», que es de una operación que aquí no se calcula.
    await expect(page.getByText(/En (?:la )?Ciudad Autónoma de Melilla no se aplica el IVA/)).toHaveCount(0);

    expect(await rotuloTarjeta(page, /^ITP \(/)).toBe('ITP (3,00%)');
    expect(await valorTarjeta(page, 'ITP (')).toBe('9000,00 €');
    // El recuadro de la ciudad publica la bonificación (reparación del hallazgo 729) y que la
    // renuncia no existe.
    const panel = await lineasPanelCcaa(page);
    expect(panel.some((l) => /Bonificación en cuota/.test(l) && /50%/.test(l))).toBe(true);
    expect(panel).toContain('IPSI (renuncia) No existe');

    // Notaría — arancel(300.000): 90,15 + 108,182205 + 45,0759 + 90,15182 (tramo 4 completo)
    //   + (149.746,97 × 0,0005 = 74,873485) = 408,43341 · con IVA = 494,2044261
    //   ×1,5 = 741,306639 · ×2 = 988,408852 · medio = 864,85774568
    // 26/09/2026 (hallazgo 2214): en Canarias, Ceuta y Melilla la notaría y el registro van SIN
    // IVA —su factura lleva IGIC o IPSI, que la app no calcula y nombra junto al total—.
    //   en Melilla: 408,43341 × 1,75 = 714,758468 · registro 225,2272455
    //   total 9.000 + 714,76 + 225,23 + 400 = 10.339,99 → 3,4467 % → 3,45 % · coste 310.339,99
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('714,76 €');
    // Registro — arancel(300.000): 24,04 + 42,0708575 + 37,56325 + 67,613865
    //   + (149.746,97 × 0,0003 = 44,924091) = 216,2120635 + 9,015182 = 225,2272455
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('225,23 €');

    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('10.339,99 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toContain('3,45%');
    // ⚠️ 26/09/2026 (tarde): hasta ese día aquí se exigía que el cierre NO fuera parcial. El ITP
    // de la operación está entero, pero a la notaría y el registro les falta su IPSI (hallazgo
    // 2214), así que es parcial por eso y lo dice sin «coste real».
    expect(await valorTarjeta(page, 'COSTE TOTAL (PARCIAL)')).toBe('310.339,99 €');
    expect(await descripcionTarjeta(page, 'COSTE TOTAL')).toBe(SOLO_HONORARIOS('IPSI'));
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
    // 24/09/2026 (hallazgo 1604): el título es «(PARCIAL)», como cuando falta el IGIC. Hasta ese
    // día se leía la tarjeta por «COSTE TOTAL DE ADQUISICIÓN», que consagraba el defecto.
    expect(await rotuloTarjeta(page, /^COSTE TOTAL/)).toBe('COSTE TOTAL (PARCIAL)');
    expect(await descripcionTarjeta(page, 'COSTE TOTAL')).toBe(
      'No incluye la gestoría, que no se ha podido leer: el coste real será mayor',
    );
    // Total = 6.000 + 599,90 + 172,56 = 6.772,46 · 6.772,46 / 100.000 = 6,77246 % → 6,77 %
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('6772,46 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toContain('6,77%');
    expect(await valorTarjeta(page, 'COSTE TOTAL')).toBe('106.772,46 €');

    cuerpo = await page.locator('body').innerText();
    expect(cuerpo).not.toContain('NaN');
    expect(cuerpo).not.toContain('No definido');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// HALLAZGOS de la re-inspección del 12/09/2026 — REPARADOS (A, B y C).
// Se escribieron con `test.fail()` afirmando lo que debería pasar; al repararlos perdieron la
// marca y quedaron como test de regresión. Los tres eran «efecto familia»: el defecto se había
// reparado en una hermana del clúster —con su número de hallazgo escrito en el código— y no
// llegó a ésta.
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('Hallazgos reparados — re-inspección 12/09/2026', () => {
  /**
   * HALLAZGO A (contenido, medio) — REPARADO. La tarjeta del AJD se rotulaba con el tipo NOMINAL de la
   * tabla mientras el motor bonifica la cuota al 50 % en Ceuta y Melilla (art. 57 bis.1
   * TRLITPAJD, dentro de `calcularAJD`). El resultado es un rótulo que desmiente a su propia
   * cifra por el doble, en la misma pantalla en que el ITP de al lado sí lleva el efectivo.
   *
   * Es exactamente el hallazgo 447, reparado en `garaje`, `trastero`, `local-comercial` y
   * `nave-industrial` —las cuatro titulan `AJD (ajd / precio × 100 %)` y lo dejan comentado—,
   * y entonces pendiente aquí y en `solar`, que seguían con `formatNumber(datosCcaaActual.ajd, 2)`.
   *
   * Caso: Melilla · «Con renuncia a la exención IVA» · 300.000 €
   *       → esperado «AJD (0,25%)» = 750,00 € · obtenido «AJD (0,50%)» = 750,00 €
   *       (750 / 300.000 = 0,25 %; el 0,5 % daría 1.500 €).
   */
  test('HALLAZGO A — el rótulo del AJD lleva el tipo efectivo, no el nominal sin bonificar', async ({ page }) => {
    // ⚠️ 24/09/2026: el caso de este hallazgo (Melilla con renuncia) ya no existe —el IPSI no
    // tiene renuncia (Ley 8/1991, arts. 7 y 20.3) y la opción se desactiva—, así que en Ceuta y
    // Melilla esta app ya no liquida AJD. Queda lo que la reparación garantiza: el rótulo es el
    // tipo EFECTIVO (importe / precio), aquí con el 0,5 % navarro, y en Melilla no hay AJD.
    await abrirHidratada(page);
    await page.getByRole('button', { name: /renuncia a la exención/i }).click();
    await page.selectOption('#select-ccaa', 'navarra');
    await sembrarValor(page, CAMPO_PRECIO, '300000');
    // 300.000 × 0,5 % = 1.500 → 1.500 / 300.000 = 0,50 %
    expect(await valorTarjeta(page, 'AJD (')).toBe('1500,00 €');
    expect(await rotuloTarjeta(page, /^AJD \(/)).toBe('AJD (0,50%)');

    await page.selectOption('#select-ccaa', 'melilla');
    await expect(page.getByRole('button', { name: /renuncia a la exención/i })).toBeDisabled();
    await expect(page.locator('h3', { hasText: /^AJD/ })).toHaveCount(0);
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

import { PORCENTAJES_IVA, FISCAL_IVA_META } from '../../data/fiscal/iva';

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
    await expect(page.getByText(/escala progresiva \(8\s% → 10\s%\)/)).toBeVisible();
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
    await expect(page.getByText(/escala progresiva \(8\s% → 9\s% → 10\s% → 12\s% → 13\s%\)/)).toBeVisible();

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
    const marcador = page.locator('[class*="placeholder"] p');
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

    // (1c) CERO — legible, pero la app exige precio > 0. Hasta el 26/09/2026 volvía el mensaje del
    // vacío; desde el hallazgo 2218 (patrón 5, «no falta, no vale») dice que no vale, sin decir
    // que no se ha podido leer (se ha leído: es un cero).
    await sembrarValor(page, CAMPO_PRECIO, '0');
    expect((await marcador.innerText()).trim()).toBe(`El precio escrito («0») ${PRECIO_NO_VALE}.`);
    await expect(tarjetas).toHaveCount(0);

    // (2) Canarias · renuncia · 150.000 € · gestoría «2.000.50».
    await page.getByRole('button', { name: /renuncia a la exención/i }).click();
    await page.selectOption('#select-ccaa', 'canarias');
    await sembrarValor(page, CAMPO_PRECIO, '150000');
    await sembrarValor(page, CAMPO_GESTORIA, '2.000.50');

    // Sin IVA que liquidar (IGIC, no calculado) y AJD = 150.000 × 0,75 % = 1.125.
    expect(await valorTarjeta(page, 'IGIC')).toBe('No calculado');
    expect(await valorTarjeta(page, 'AJD (')).toBe('1125,00 €');
    // 26/09/2026 (hallazgo 2214): en Canarias, Ceuta y Melilla la notaría y el registro van SIN
    // IVA —su factura lleva IGIC o IPSI, que la app no calcula y nombra junto al total—.
    // Notaría — arancel(150.000) = 90,15 + 108,182205 + 45,0759 + 89.898,79 × 0,001 (89,89879)
    //   = 333,306895 · × 1,75 = 583,287066 → 583,29 (con IVA era 705,78)
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('583,29 €');
    // Registro — 24,04 + 42,0708575 + 37,56325 + 89.898,79 × 0,00075 (67,4240925) = 171,0982
    //   + 9,015182 = 180,113382 → 180,11 (con IVA era 217,94)
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('180,11 €');
    expect(await valorTarjeta(page, 'Gastos de gestoría')).toBe('Sin leer');
    // Total = 0 + 1.125 + 583,29 + 180,11 = 1.888,40 · / 150.000 = 1,25893 % → 1,26 %
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('1888,40 €');
    const descTotal = await descripcionTarjeta(page, 'Total gastos adicionales');
    expect(descTotal).toContain('1,26%');
    expect(descTotal).toContain('SIN el IGIC');
    expect(descTotal).toContain('SIN la gestoría, que no se ha podido leer');
    // Las DOS ausencias en la misma frase, y la dirección: lo que falta SUBE el coste.
    expect(await valorTarjeta(page, 'COSTE TOTAL (PARCIAL)')).toBe('151.888,40 €');
    expect(await descripcionTarjeta(page, 'COSTE TOTAL (PARCIAL)')).toBe(
      'No incluye el IGIC ni la gestoría, que no se ha podido leer: el coste real será mayor',
    );

    // Cambio de RÉGIMEN: Canarias, compra habitual → ITP 6,5 % × 150.000 = 9.750. El IGIC sale
    // del aviso; la gestoría ilegible, no.
    await page.getByRole('button', { name: /Compra habitual/ }).click();
    expect(await rotuloTarjeta(page, /^ITP \(/)).toBe('ITP (6,50%)');
    expect(await valorTarjeta(page, 'ITP (')).toBe('9750,00 €');
    expect(await valorTarjeta(page, 'Gastos de gestoría')).toBe('Sin leer');
    // Total = 9.750 + 583,29 + 180,11 = 10.513,40 (sin IVA en honorarios, hallazgo 2214)
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('10.513,40 €');
    // El IGIC de la OPERACIÓN sale del total; el de las facturas de notaría y registro, no
    // (26/09/2026, tarde). 10.513,40 / 150.000 = 7,0089 % → 7,01 %.
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).not.toContain('SIN el IGIC, que no está incluido');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toBe(
      `7,01% sobre el precio de compra — SIN la gestoría, que no se ha podido leer${sinHonorarios('IGIC')}`,
    );
    // 24/09/2026 (hallazgo 1604): sin el IGIC el cierre sigue siendo PARCIAL por la gestoría
    // ilegible; hasta ese día se esperaba aquí el título definitivo, que era el defecto.
    expect(await rotuloTarjeta(page, /^COSTE TOTAL/)).toBe('COSTE TOTAL (PARCIAL)');
    expect(await rotuloTarjeta(page, /^Total gastos adicionales/)).toBe('Total gastos adicionales (parcial)');
    expect(await valorTarjeta(page, 'COSTE TOTAL')).toBe('160.513,40 €');
    expect(await descripcionTarjeta(page, 'COSTE TOTAL')).toBe(
      'No incluye la gestoría, que no se ha podido leer: el coste real será mayor',
    );

    // Cambio de COMUNIDAD: Navarra → ITP 6 % × 150.000 = 9.000 · total 9.000 + 705,78 + 217,94
    await page.selectOption('#select-ccaa', 'navarra');
    expect(await valorTarjeta(page, 'ITP (')).toBe('9000,00 €');
    expect(await valorTarjeta(page, 'Gastos de gestoría')).toBe('Sin leer');
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('9923,72 €');
    expect(await descripcionTarjeta(page, 'COSTE TOTAL')).toContain('la gestoría, que no se ha podido leer');

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
// HALLAZGOS de la re-inspección del 23/09/2026 (1276-1279), REPARADOS el mismo día. Se
// escribieron con `test.fail()` y fallaban por la aserción del defecto (la preparación va
// antes y pasa); reparados, se retiró la marca y quedan de regresión.
// Los cuatro eran «efecto familia»: lo que se reparó en una hermana y no llegó a ésta.
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('Hallazgos reparados — re-inspección 23/09/2026', () => {
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
  test('REPARADO 23/09 (1276, antes D) — en Canarias con renuncia, el aviso de la renuncia no afirma que «el IVA se autoliquida»', async ({ page }) => {
    await abrirHidratada(page);
    await page.getByRole('button', { name: /renuncia a la exención/i }).click();
    await page.selectOption('#select-ccaa', 'canarias');
    await sembrarValor(page, CAMPO_PRECIO, '150000');

    // Preparación (pasa): la calculadora sabe que allí no hay IVA, y lo dice.
    expect(await valorTarjeta(page, 'IGIC')).toBe('No calculado');
    await expect(page.getByText(/En Canarias no se aplica el IVA/)).toBeVisible();
    const aviso = page.locator('[class*="renunciaAviso"]');
    await expect(aviso).toBeVisible();

    // El defecto: el recuadro de la renuncia lo contradecía en la misma pantalla.
    expect(await aviso.innerText()).not.toMatch(/El IVA se autoliquida/);
    // Reparado con la forma de nave-industrial (647/1177): dice lo que sí pasa allí.
    await expect(aviso).toContainText('no se devenga IVA');
    await expect(aviso).toContainText('rige el IGIC');

    // En Ceuta y Melilla el IPSI no tiene renuncia (24/09/2026, Ley 8/1991 arts. 7 y 20.3): la
    // opción se desactiva y el recuadro dice que no existe, sin describir ningún IVA.
    for (const ciudad of ['ceuta', 'melilla']) {
      await page.selectOption('#select-ccaa', ciudad);
      await expect(page.getByRole('button', { name: /renuncia a la exención/i })).toBeDisabled();
      await expect(page.locator('h3', { hasText: /^IPSI$/ })).toHaveCount(0);
      expect(await aviso.innerText()).not.toMatch(/El IVA se autoliquida/);
      await expect(aviso).toContainText('IPSI');
      await expect(aviso).toContainText('no existe la renuncia a la exención');
    }

    // Y donde sí rige el IVA, el recuadro sigue explicando la inversión del sujeto pasivo.
    await page.selectOption('#select-ccaa', 'madrid');
    await expect(aviso).toContainText('El IVA se autoliquida por inversión del sujeto pasivo');
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
  test('REPARADO 23/09 (1277, antes E) — sin el IGIC, «Total gastos adicionales» se rotula parcial como el COSTE TOTAL', async ({ page }) => {
    await abrirHidratada(page);
    await page.getByRole('button', { name: /renuncia a la exención/i }).click();
    await page.selectOption('#select-ccaa', 'canarias');
    await sembrarValor(page, CAMPO_PRECIO, '150000');

    // Preparación (pasa): la cifra es la de siempre y el cierre ya se declara parcial.
    // Total = 1.125 (AJD) + 705,78 + 217,94 + 400 (gestoría por defecto) = 2.448,72
    // 26/09/2026 (hallazgo 2214): sin IVA en los honorarios → 1.125 + 583,29 + 180,11 + 400 = 2.288,40
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('2288,40 €');
    await expect(page.locator('h3', { hasText: 'COSTE TOTAL (PARCIAL)' })).toHaveCount(1);

    // El defecto: la otra tarjeta con el mismo hueco no lo llevaba en el título.
    expect(await rotuloTarjeta(page, /^Total gastos adicionales/)).toBe('Total gastos adicionales (parcial)');

    // Con el IVA calculado (Madrid) el total es completo y el título vuelve a ser el definitivo.
    await page.selectOption('#select-ccaa', 'madrid');
    await expect(page.locator('h3', { hasText: 'COSTE TOTAL DE ADQUISICIÓN' })).toHaveCount(1);
    expect(await rotuloTarjeta(page, /^Total gastos adicionales/)).toBe('Total gastos adicionales');
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
  test('REPARADO 23/09 (1278, antes F) — el caso de uso de empresas y la tabla del solar recogen que en Canarias, Ceuta y Melilla no hay IVA', async ({ page }) => {
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
    // La excepción va en la FILA del IVA del empresario, no en otra celda de la tabla.
    const fila = (await page.locator('tr', { hasText: '¿Sujeto a IVA por empresario?' }).textContent()) ?? '';
    expect(fila.replace(/\s+/g, ' ')).toContain('IGIC o IPSI en Canarias, Ceuta y Melilla');
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
  test('REPARADO 23/09 (1279, antes G) — el tipo del caso de uso y de la tabla sigue a data/fiscal', async ({ page }) => {
    await page.goto(RUTA);
    const general = PORCENTAJES_IVA.general; // 21 — data/fiscal/iva.ts

    const textoCaso =
      (await page
        .locator('strong', { hasText: 'Empresa compra finca a otra empresa' })
        .locator('xpath=following-sibling::p[1]')
        .textContent()) ?? '';
    expect(pegarPct(textoCaso.replace(/\s+/g, ' '))).toContain(`IVA ${general}%`);

    const fila = (await page.locator('tr', { hasText: '¿Sujeto a IVA por empresario?' }).textContent()) ?? '';
    expect(pegarPct(fila.replace(/\s+/g, ' '))).toContain(`${general}% + AJD`);

    // Reparado: el tipo ya no está tecleado. Ningún «21%» en un texto publicado de page.tsx;
    // se quitan antes los comentarios, que pueden citar la cifra sin publicarla.
    const { readFileSync } = await import('node:fs');
    const { join } = await import('node:path');
    const pagina = readFileSync(
      join(process.cwd(), 'app', 'simulador-gastos-compraventa-terreno-rustico', 'page.tsx'),
      'utf8',
    );
    const sinComentarios = pagina.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
    expect(sinComentarios.match(/\b21\s?%/g) ?? []).toEqual([]);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Efecto familia de los hallazgos 1272 y 1273 de solar, encontrado al repararlos y reparado
// aquí el mismo día (23/09/2026): la renuncia es el régimen de IVA de esta app, así que le
// alcanzaban los dos.
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('Regresión — familia de los hallazgos 1272 y 1273 (23/09/2026)', () => {
  /**
   * Madrid · renuncia · 150.000 € · gestoría «2.000.50». Con la gestoría legible el cierre dice
   * «antes de deducir el IVA si tienes derecho»; con la ilegible, el aviso SUSTITUÍA a esa
   * salvedad y «el coste real será mayor» quedaba falso para quien deduce el IVA de la renuncia.
   */
  test('con renuncia y la gestoría ilegible, el cierre suma el aviso a la salvedad del IVA', async ({ page }) => {
    await abrirHidratada(page);
    await page.getByRole('button', { name: /renuncia a la exención/i }).click();
    await page.selectOption('#select-ccaa', 'madrid');
    await sembrarValor(page, CAMPO_PRECIO, '150000');
    await sembrarValor(page, CAMPO_GESTORIA, '400');
    expect(await descripcionTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toContain('antes de deducir el IVA');

    await sembrarValor(page, CAMPO_GESTORIA, '2.000.50');
    // 24/09/2026 (hallazgo 1604): con la gestoría ilegible el título es «(PARCIAL)». Hasta ese
    // día aquí se exigía una tarjeta «COSTE TOTAL DE ADQUISICIÓN», que consagraba el defecto.
    await expect(page.locator('h3', { hasText: 'COSTE TOTAL (PARCIAL)' })).toHaveCount(1);
    expect(await descripcionTarjeta(page, 'COSTE TOTAL')).toBe(
      'No incluye la gestoría, que no se ha podido leer: el coste real será mayor (precio + gastos antes de deducir el IVA si tienes derecho)',
    );

    // Con ITP no hay IVA que deducir: el aviso va solo.
    await page.getByRole('button', { name: /Compra habitual/ }).click();
    expect(await descripcionTarjeta(page, 'COSTE TOTAL')).toBe('No incluye la gestoría, que no se ha podido leer: el coste real será mayor');
  });

  /**
   * La ayuda del precio: con la renuncia (IVA en pantalla) la base es la contraprestación
   * pactada (art. 78 Ley 37/1992); con ITP, y en Canarias, Ceuta y Melilla —donde con renuncia
   * solo se calcula el AJD—, el valor de referencia es la base mínima y vale «el mayor».
   */
  test('la ayuda del precio pide el precio pactado con renuncia y «el mayor de ambos» con ITP o sin IVA', async ({ page }) => {
    await abrirHidratada(page);
    const leerAyuda = async (): Promise<string> => {
      const id = await page.locator(CAMPO_PRECIO).getAttribute('aria-describedby');
      return (await page.locator(`[id="${id}"]`).innerText()).replace(/\s+/g, ' ');
    };

    expect(await leerAyuda()).toContain('el mayor de ambos');

    await page.getByRole('button', { name: /renuncia a la exención/i }).click();
    let ayuda = await leerAyuda();
    expect(ayuda).toContain('Precio pactado');
    expect(ayuda).not.toContain('el mayor');

    // Siguiéndola con 120.000 pactados: IVA = 120.000 × 21 % = 25.200,00 € (PORCENTAJES_IVA.general).
    await sembrarValor(page, CAMPO_PRECIO, '120000');
    expect(await valorTarjeta(page, 'IVA (')).toBe('25.200,00 €');

    await page.selectOption('#select-ccaa', 'canarias');
    ayuda = await leerAyuda();
    expect(ayuda).toContain('el mayor de ambos');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// INSPECCIÓN 24/09/2026 — el punto ciego del candado de familia (régimen × territorio) y
// dos datos de la Comunitat Valenciana cotejados con la ley, no con la tabla.
// Sus cinco hallazgos (1602-1606) se REPARARON el mismo día: perdieron el `test.fail()` y se
// quedan como regresión; el CASO 4 (Ceuta con renuncia) y el BARRIDO se reescribieron porque
// consagraban una renuncia que el IPSI no tiene (ver sus comentarios).
//
// Fuentes de los esperados (ninguna de memoria):
//  · tipos generales → TIPOS_ITP_CCAA_2025 (data/fiscal/inmuebles.ts); escalas y AJD → ITP_CCAA
//    (data/itp-ccaa.ts); aranceles → ARANCELES_NOTARIO/FACTURA_NOTARIAL y ARANCELES_REGISTRO +
//    REGISTRO_CONCEPTOS; IVA → PORCENTAJES_IVA.general (21); bonificación → 50 % (art. 57 bis).
//  · Ley valenciana 13/1997 (BOE-A-1998-8202), texto consolidado leído en sesión por la API de
//    datos abiertos del BOE (bloques a13 y a14, versión vigente desde el 11/08/2026):
//      art. 13.Uno — «El 9 % en las adquisiciones de inmuebles […] No obstante, cuando el valor
//        de los bienes inmuebles transmitidos […] sea superior a un millón de euros, el tipo
//        aplicable será el 11 %». Es un UMBRAL sobre todo el valor, no un tramo.
//      art. 14.Dos — «El 2 por 100 en las primeras copias de escrituras […] que documenten
//        transmisiones de bienes inmuebles respecto de las cuales se haya renunciado a la
//        exención en el Impuesto sobre el Valor Añadido».
//  · Ley canaria 4/2012 (BOE-A-2012-9282), art. 50.Uno.20.º (exención de los terrenos rústicos en
//    el IGIC) y art. 50.Cinco (su renuncia); Ley 20/1991, art. 19.1.2.º g) (inversión del sujeto
//    pasivo del IGIC en esas entregas con renuncia).
// ═══════════════════════════════════════════════════════════════════════════════

/** Importe publicado en formato español («1.234,56 €», «4800,00 €») → número. */
function euros(texto: string): number {
  return Number(texto.replace(/[^\d,.-]/g, '').replace(/\./g, '').replace(',', '.'));
}

/** Título, valor y descripción de cada tarjeta del panel de resultados, en orden. */
async function tarjetasPanel(page: Page): Promise<{ t: string; v: string; d: string | null }[]> {
  return page.locator('[class*="resultados"]').first().evaluate((panel) =>
    [...panel.querySelectorAll('h3')].map((h) => {
      const ps = [...(h.parentElement?.parentElement?.querySelectorAll('p') ?? [])].map((p) =>
        (p as HTMLElement).innerText.replace(/\s+/g, ' ').trim(),
      );
      return { t: (h as HTMLElement).innerText.trim(), v: ps[0] ?? '', d: ps[1] ?? null };
    }),
  );
}

test.describe('Inspección 24/09/2026 — régimen × territorio, la Comunitat Valenciana y la gestoría ilegible', () => {
  test.describe.configure({ timeout: 120_000 });

  /**
   * CASO 1 (NORMAL) — Galicia, compra habitual, 35.000 €, gestoría 400 € (la de por defecto).
   * Galicia no la había pisado ninguna ronda, y 35.000 € corta el arancel en su TERCER tramo.
   *   ITP  = 35.000 × 8 % (TIPOS_ITP_CCAA_2025, sin escala) = 2.800,00 €
   *   Notaría: 90,15 + 24.040,49 × 0,45 % (108,182205) + 4.949,39 × 0,15 % (7,424085)
   *            = 205,75629 × 1,21 = 248,96511 → horquilla ×1,5 / ×2 = 373,45–497,93 · ×1,75 = 435,69
   *   Registro: 24,04 + 24.040,49 × 0,175 % (42,0708575) + 4.949,39 × 0,125 % (6,1867375)
   *            + 9,015182 = 81,312777 × 1,21 = 98,39
   *   Total = 2.800 + 435,69 + 98,39 + 400 = 3.734,08 € (10,67 %) · coste 38.734,08 €
   */
  test('CASO 1 (normal) — Galicia, 35.000 €: ITP del 8 % y el arancel en su tercer tramo', async ({ page }) => {
    await abrirHidratada(page);
    await page.selectOption('#select-ccaa', 'galicia');
    await sembrarValor(page, CAMPO_PRECIO, '35000');

    expect(await rotuloTarjeta(page, /^ITP \(/)).toBe('ITP (8,00%)');
    expect(await valorTarjeta(page, 'ITP (')).toBe('2800,00 €');
    expect(await descripcionTarjeta(page, 'ITP (')).toBe('Tipo general de la CCAA (posibles reducciones agrarias no incluidas)');
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('435,69 €');
    expect(await descripcionTarjeta(page, 'Gastos de notaría')).toContain('entre 373,45 € y 497,93 €');
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('98,39 €');
    expect(await valorTarjeta(page, 'Gastos de gestoría')).toBe('400,00 €');
    await expect(page.locator('h3', { hasText: /^AJD/ })).toHaveCount(0);
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('3734,08 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toBe('10,67% sobre el precio de compra');
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('38.734,08 €');
  });

  /**
   * CASO 2 (LÍMITE) — Comunitat Valenciana, compra habitual, en el canto exacto del millón.
   * 1.000.000 € no es «superior a un millón»: 9 % sobre todo = 90.000,00 € (9,00 %). Esto lo
   * dan igual la ley y la tabla, así que pasa. El caso de 1.200.000 € va aparte (hallazgo).
   */
  test('CASO 2 (límite) — Comunitat Valenciana, 1.000.000 € exactos: 9 % sobre todo el valor', async ({ page }) => {
    await abrirHidratada(page);
    await page.selectOption('#select-ccaa', 'valencia');
    await sembrarValor(page, CAMPO_PRECIO, '1000000');
    expect(await rotuloTarjeta(page, /^ITP \(/)).toBe('ITP (9,00%)');
    expect(await valorTarjeta(page, 'ITP (')).toBe('90.000,00 €');
    // Notaría 1.437,01 · registro 478,35 · gestoría 400 → 92.315,36 €
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('92.315,36 €');
  });

  /**
   * HALLAZGO 1602 (cálculo, alto) — REPARADO el 24/09/2026; lo que decía cuando estaba abierto: por encima del millón, la Comunitat Valenciana grava TODO
   * el valor al 11 % (art. 13.Uno Ley 13/1997: «cuando el valor […] sea superior a un millón de
   * euros, el tipo aplicable será el 11 %»). ITP_CCAA.valencia lo modela como una escala por
   * tramos (9 % hasta el millón, 11 % del exceso) y la app lo anuncia así en el recuadro («Esta
   * CCAA aplica escala progresiva (9% → 11%)»). La cuota queda 20.000 € por debajo a cualquier
   * precio superior al millón.
   *   Esperado (ley): 1.200.000 × 11 % = 132.000,00 € (11,00 %) · con 1.000.001 €, 110.000,11 €
   *   Obtenido: 112.000,00 € (9,33 %) = 90.000 + 200.000 × 11 % · con 1.000.001 €, 90.000,11 €
   */
  test('REPARADO 1602 — Comunitat Valenciana, 1.200.000 €: el 11 % grava todo el valor, no solo el exceso del millón', async ({ page }) => {
    await abrirHidratada(page);
    await page.selectOption('#select-ccaa', 'valencia');
    await sembrarValor(page, CAMPO_PRECIO, '1200000');
    // Preparación (pasa): la tarjeta existe y el resto del desglose es el de siempre.
    await expect(page.locator('h3', { hasText: /^ITP \(/ })).toHaveCount(1);
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('1564,06 €');
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('526,75 €');

    // El defecto.
    expect(await valorTarjeta(page, 'ITP (')).toBe('132.000,00 €');
    expect(await rotuloTarjeta(page, /^ITP \(/)).toBe('ITP (11,00%)');
    // Total = 132.000 + 1.564,06 + 526,75 + 400 = 134.490,81
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('134.490,81 €');
    expect(await page.locator('[class*="infoCcaa"]').first().innerText()).not.toMatch(/escala progresiva \(9% → 11%\)/);
    // El recuadro lo describe como lo que es, un umbral, y rotula el 11 % a ese precio.
    const recuadro = pegarPct((await page.locator('[class*="infoCcaa"]').first().innerText()).replace(/\s+/g, ' '));
    expect(recuadro).toContain('ITP General 11%');
    expect(recuadro).toContain('pasa al 11% sobre TODO el valor, no solo sobre el exceso');
    expect(recuadro).not.toContain('escala progresiva');
    // Con 1.000.001 €: 1.000.001 × 11 % = 110.000,11 € (con la escala salían 90.000,11 €).
    await sembrarValor(page, CAMPO_PRECIO, '1000001');
    expect(await valorTarjeta(page, 'ITP (')).toBe('110.000,11 €');
  });

  /**
   * CASO 3 (NORMAL, renuncia) — Asturias, renuncia a la exención, 250.000 €, gestoría 400 €.
   *   IVA = 250.000 × 21 % (PORCENTAJES_IVA.general) = 52.500,00 € · notaría 811,92 · registro 254,37
   * El AJD NO se fija aquí a propósito: la app usa el tipo general de la tabla y la ley de alguna
   * comunidad fija otro para la renuncia (ver el hallazgo siguiente); se comprueba solo que su
   * rótulo cuadre con su importe y que el total sume lo que se ve.
   */
  test('CASO 3 (normal) — Asturias con renuncia, 250.000 €: IVA 21 % + AJD, y el total suma lo que se ve', async ({ page }) => {
    await abrirHidratada(page);
    await page.getByRole('button', { name: /renuncia a la exención/i }).click();
    await page.selectOption('#select-ccaa', 'asturias');
    await sembrarValor(page, CAMPO_PRECIO, '250000');

    expect(await rotuloTarjeta(page, /^IVA \(/)).toBe('IVA (renuncia · ISP) (21,00%)');
    expect(await valorTarjeta(page, 'IVA (')).toBe('52.500,00 €');
    await expect(page.locator('h3', { hasText: /^ITP/ })).toHaveCount(0);
    const ajd = euros(await valorTarjeta(page, 'AJD ('));
    const pctAjd = Number((await rotuloTarjeta(page, /^AJD \(/)).match(/\(([\d,]+)%\)/)![1].replace(',', '.'));
    expect(ajd).toBeGreaterThan(0);
    expect(ajd).toBeCloseTo((250000 * pctAjd) / 100, 0);
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('811,92 €');
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('254,37 €');
    const total = euros(await valorTarjeta(page, 'Total gastos adicionales'));
    expect(total).toBeCloseTo(52500 + ajd + 811.92 + 254.37 + 400, 2);
    expect(await descripcionTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe(
      'Precio + todos los gastos (antes de deducir el IVA si tienes derecho)',
    );
  });

  /**
   * HALLAZGO 1603 (dato, medio) — REPARADO el 24/09/2026; lo que decía cuando estaba abierto: con renuncia, la escritura de la finca rústica valenciana
   * tributa por AJD al 2 % (art. 14.Dos Ley 13/1997, citado arriba), y la app cobra el 1,5 % de
   * ITP_CCAA.valencia.ajd con la nota «Algunas CCAA aplican un tipo de AJD incrementado en la
   * renuncia»: el aviso va debajo de una cifra utilizable que se queda corta. (Además, el tipo
   * GENERAL valenciano es el 1,4 % desde el 01/06/2026, art. 14.Cuatro; aquí no aplica, porque en
   * esta app el AJD solo aparece con renuncia.)
   *   Valencia · renuncia · 300.000 € → esperado AJD (2,00%) 6000,00 € · obtenido AJD (1,50%) 4500,00 €
   */
  test('REPARADO 1603 — Comunitat Valenciana con renuncia, 300.000 €: el AJD de la renuncia es el 2 %', async ({ page }) => {
    await abrirHidratada(page);
    await page.getByRole('button', { name: /renuncia a la exención/i }).click();
    await page.selectOption('#select-ccaa', 'valencia');
    await sembrarValor(page, CAMPO_PRECIO, '300000');
    // Preparación (pasa): IVA 63.000 y la tarjeta del AJD presente.
    expect(await valorTarjeta(page, 'IVA (')).toBe('63.000,00 €');
    await expect(page.locator('h3', { hasText: /^AJD \(/ })).toHaveCount(1);

    // El defecto.
    expect(await rotuloTarjeta(page, /^AJD \(/)).toBe('AJD (2,00%)');
    expect(await valorTarjeta(page, 'AJD (')).toBe('6000,00 €');
    // Y se dice: el tipo es el propio de la renuncia, no el general con un aviso genérico.
    expect(await descripcionTarjeta(page, 'AJD (')).toBe('Tipo propio de la renuncia a la exención en la Comunidad Valenciana');
    const aviso = (await page.locator('[class*="renunciaAviso"]').first().innerText()).replace(/\s+/g, ' ');
    expect(aviso).toContain('tipo propio de la renuncia');
    expect(aviso).not.toContain('este simulador usa el AJD general');
    expect(await lineasPanelCcaa(page)).toContain('AJD (renuncia) 2%');
    // Total = 63.000 + 6.000 + 864,86 + 272,52 + 400 = 70.537,38 · coste 370.537,38
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('70.537,38 €');
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('370.537,38 €');
  });

  /**
   * CASO 4 (LÍMITE, sin IVA) — Ceuta, 90.000 €, con la renuncia elegida antes.
   *
   * ⚠️ 24/09/2026 — este caso esperaba «IPSI · No calculado», AJD (0,25%) 225,00 € y un coste
   * PARCIAL: CONSAGRABA una renuncia que el IPSI no tiene (Ley 8/1991, arts. 7 y 20.3, decidido
   * con la norma al reparar el 1605 y el 1584 de nave-industrial). La finca de Ceuta paga
   * siempre ITP, bonificado (art. 57 bis.3.a):
   *   ITP = 90.000 × 6 % × 50 % = 2.700,00 (3,00 %) · sin AJD
   *   Notaría: arancel 273,306895 × 1,21 × 1,75 = 578,73 · registro 135,113382 × 1,21 = 163,49
   *   Total = 2.700 + 578,73 + 163,49 + 400 = 3.842,22 (4,26913 % → 4,27 %) · coste 93.842,22
   *   Con la gestoría «2.000.50»: 3.442,22 · coste 93.442,22 (PARCIAL, «será mayor»).
   * El invariante del impuesto sin cifrar («puede ser mayor») lo sigue midiendo Canarias, donde
   * la renuncia sí existe (testigo de familia y el caso del 1605, abajo).
   */
  test('CASO 4 (límite) — Ceuta, 90.000 €: sin renuncia en el IPSI, ITP bonificado y «será» solo con la gestoría ilegible', async ({ page }) => {
    await abrirHidratada(page);
    await page.getByRole('button', { name: /renuncia a la exención/i }).click();
    await page.selectOption('#select-ccaa', 'ceuta');
    await sembrarValor(page, CAMPO_PRECIO, '90000');

    const boton = page.getByRole('button', { name: /renuncia a la exención/i });
    await expect(boton).toBeDisabled();
    await expect(boton).toContainText('No existe en el IPSI: paga ITP');
    await expect(page.locator('h3', { hasText: /^IPSI$/ })).toHaveCount(0);
    await expect(page.locator('h3', { hasText: /^AJD/ })).toHaveCount(0);
    expect(await rotuloTarjeta(page, /^ITP \(/)).toBe('ITP (3,00%)');
    expect(await valorTarjeta(page, 'ITP (')).toBe('2700,00 €');
    // 26/09/2026 (hallazgo 2214): en Canarias, Ceuta y Melilla la notaría y el registro van SIN
    // IVA —su factura lleva IGIC o IPSI, que la app no calcula y nombra junto al total—.
    //   notaría: arancel(90.000) = 90,15 + 108,182205 + 45,0759 + 29.898,79 × 0,001 = 273,306895
    //            × 1,75 = 478,287066 · registro: 126,0982 + 9,015182 = 135,113382
    //   total 2.700 + 478,29 + 135,11 + 400 = 3.713,40 → 4,1260 % → 4,13 % · coste 93.713,40
    //   con la gestoría ilegible: 3.313,40 · coste 93.313,40
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('478,29 €');
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('135,11 €');
    // Parcial: a los honorarios les falta el IPSI (26/09/2026, tarde).
    expect(await rotuloTarjeta(page, /^Total gastos adicionales/)).toBe('Total gastos adicionales (parcial)');
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('3713,40 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toBe(`4,13% sobre el precio de compra${sinHonorarios('IPSI')}`);
    expect(await valorTarjeta(page, 'COSTE TOTAL (PARCIAL)')).toBe('93.713,40 €');
    const panel = await lineasPanelCcaa(page);
    expect(panel).toContain('IPSI (renuncia) No existe');
    expect(panel).toContain('AJD (renuncia) No aplica');
    expect(panel).toContain('Bonificación en cuota −50%');

    // La gestoría ilegible suma seguro: título PARCIAL y «será mayor» (hallazgo 1604).
    await sembrarValor(page, CAMPO_GESTORIA, '2.000.50');
    expect(await valorTarjeta(page, 'Gastos de gestoría')).toBe('Sin leer');
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('3313,40 €');
    expect(await rotuloTarjeta(page, /^COSTE TOTAL/)).toBe('COSTE TOTAL (PARCIAL)');
    expect(await valorTarjeta(page, 'COSTE TOTAL')).toBe('93.313,40 €');
    expect(await descripcionTarjeta(page, 'COSTE TOTAL')).toBe(
      'No incluye la gestoría, que no se ha podido leer: el coste real será mayor',
    );

    // De vuelta en Madrid la elección se conserva: la renuncia vuelve a calcularse.
    await page.selectOption('#select-ccaa', 'madrid');
    await expect(boton).toBeEnabled();
    await expect(boton).toHaveAttribute('aria-pressed', 'true');
    // 90.000 × 21 % = 18.900
    expect(await valorTarjeta(page, 'IVA (')).toBe('18.900,00 €');
  });

  /**
   * HALLAZGO 1604 (contenido, bajo) — REPARADO el 24/09/2026. Era la forma (a) que salió hoy en garaje, trastero,
   * local-comercial y en la referencia estimador-compraventa-inmueble: con la gestoría ILEGIBLE,
   * las dos cifras de cierre conservan el título de definitivas mientras su descripción dice
   * «SIN la gestoría» y «el coste real será mayor». Esta misma tarjeta sí se rotula «(PARCIAL)»
   * cuando falta el IGIC/IPSI (hallazgo 1277).
   *   Madrid · compra habitual · 80.000 € · gestoría «2.000.50»
   *   → ITP 4.800 + notaría 557,55 + registro 154,41 = 5.511,96 € · coste 85.511,96 €
   *   → esperado «Total gastos adicionales (parcial)» y «COSTE TOTAL (PARCIAL)»
   *   → obtenido «Total gastos adicionales» y «COSTE TOTAL DE ADQUISICIÓN»
   * OJO al repararlo: el CASO 3 del 23/09 y «con renuncia y la gestoría ilegible…» (familia
   * 1272/1273) leen hoy la tarjeta por «COSTE TOTAL DE ADQUISICIÓN» con la gestoría ilegible, y
   * se pondrán rojos: consagran este título.
   */
  test('REPARADO 1604 — con la gestoría ilegible, el total y el coste se rotulan parciales', async ({ page }) => {
    await abrirHidratada(page);
    await sembrarValor(page, CAMPO_PRECIO, '80000');
    await sembrarValor(page, CAMPO_GESTORIA, '2.000.50');
    // Preparación (pasa): las cifras y el aviso con su dirección.
    expect(await valorTarjeta(page, 'Gastos de gestoría')).toBe('Sin leer');
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('5511,96 €');
    expect(await valorTarjeta(page, 'COSTE TOTAL')).toBe('85.511,96 €');
    expect(await descripcionTarjeta(page, 'COSTE TOTAL')).toBe(
      'No incluye la gestoría, que no se ha podido leer: el coste real será mayor',
    );

    // El defecto.
    expect(await rotuloTarjeta(page, /^Total gastos adicionales/)).toBe('Total gastos adicionales (parcial)');
    expect(await rotuloTarjeta(page, /^COSTE TOTAL/)).toBe('COSTE TOTAL (PARCIAL)');
  });

  /**
   * HALLAZGO 1605 (contenido, bajo) — REPARADO el 24/09/2026. Era así: en Canarias con renuncia, el recuadro propio de la app
   * («Renuncia a la exención en Canarias:») dice que «ni la renuncia a la exención ni la inversión
   * del sujeto pasivo del IVA entran en juego». En el IGIC la entrega de terrenos rústicos está
   * exenta igual (art. 50.Uno.20.º Ley canaria 4/2012), esa exención es renunciable (art.
   * 50.Cinco) y con renuncia hay inversión del sujeto pasivo (art. 19.1.2.º g) Ley 20/1991). Y la
   * app, en la misma pantalla, calcula justo la consecuencia de esa renuncia: AJD en vez de ITP.
   *   Canarias · renuncia · 150.000 € → esperado: el recuadro no niega la renuncia que calcula
   *   → obtenido: «…así que ni la renuncia a la exención ni la inversión del sujeto pasivo del
   *     IVA entran en juego…» junto a «AJD (0,75%) 1125,00 €» y sin tarjeta de ITP.
   */
  test('REPARADO 1605 — en Canarias el recuadro y el botón dicen la renuncia que la app calcula: la del IGIC', async ({ page }) => {
    await abrirHidratada(page);
    await page.getByRole('button', { name: /renuncia a la exención/i }).click();
    await page.selectOption('#select-ccaa', 'canarias');
    await sembrarValor(page, CAMPO_PRECIO, '150000');
    // Preparación (pasa): lo que calcula es el régimen de la renuncia.
    expect(await valorTarjeta(page, 'AJD (')).toBe('1125,00 €');
    await expect(page.locator('h3', { hasText: /^ITP/ })).toHaveCount(0);
    const aviso = page.locator('[class*="renunciaAviso"]');
    await expect(aviso).toContainText('rige el IGIC');

    // El defecto.
    const texto = (await aviso.innerText()).replace(/\s+/g, ' ');
    expect(texto).not.toMatch(/ni la renuncia a la exención ni la inversión del sujeto pasivo/);
    // Reparado con la norma, verificada en el BOE: la exención del IGIC de los terrenos rústicos
    // (art. 50.Uno.20.º Ley canaria 4/2012) es renunciable (art. 50.Cinco), con inversión del
    // sujeto pasivo (art. 19.1.2.º g Ley 20/1991) y sin TPO (art. 4.4 de esa misma ley).
    expect(texto).toContain('Renuncia a la exención del IGIC (art. 50.Cinco Ley canaria 4/2012)');
    expect(texto).toContain('art. 50.Uno.20.º');
    expect(texto).toContain('inversión del sujeto pasivo (art. 19.1.2.º g Ley 20/1991)');
    expect(texto).toContain('art. 4.4');
    // Y el botón nombra el impuesto cuya exención se renuncia.
    await expect(page.getByRole('button', { name: /Con renuncia a la exención del IGIC/ })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('button', { name: /Con renuncia a la exención del IVA/ })).toHaveCount(0);
  });

  /**
   * HALLAZGO 1606 (operativa, bajo) — REPARADO el 24/09/2026. Era una GUARDIA de código muerto, forma del hallazgo 374: la
   * reparación 805 dejó de leer el IVA de IVA_INMUEBLES_2025 pero el import sigue en page.tsx
   * y en metadata.ts, sin ningún uso (y en page.tsx con el comentario viejo «Tipo de IVA de
   * inmueble no residencial» encima del IVA general). No mueve ninguna cifra.
   */
  test('REPARADO 1606 — IVA_INMUEBLES_2025 ya no se importa en page.tsx ni en metadata.ts', async () => {
    const { readFileSync } = await import('node:fs');
    const { join } = await import('node:path');
    for (const fichero of ['page.tsx', 'metadata.ts']) {
      const fuente = readFileSync(join(process.cwd(), 'app', 'simulador-gastos-compraventa-terreno-rustico', fichero), 'utf8');
      const sinComentarios = fuente.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
      expect(sinComentarios.match(/\bIVA_INMUEBLES_2025\b/g) ?? [], fichero).toEqual([]);
    }
    // Y el comentario viejo «Tipo de IVA de inmueble no residencial…» ya no está sobre IVA_RENUNCIA.
    const pagina = readFileSync(join(process.cwd(), 'app', 'simulador-gastos-compraventa-terreno-rustico', 'page.tsx'), 'utf8');
    expect(pagina).not.toContain('Tipo de IVA de inmueble no residencial');
  });

  /**
   * BARRIDO — el punto ciego del candado de familia: el select de comunidad × el conmutador de
   * régimen no son <NumberInput> y el testigo solo mide Madrid con ITP y Canarias con renuncia.
   * 19 territorios × 2 regímenes a 400.000 € con la gestoría de 400 €.
   *   Notaría 400.000: 90,15 + 108,182205 + 45,0759 + 90,15182 + 249.746,97 × 0,05 % (124,873485)
   *     = 458,43341 × 1,21 × 1,75 = 970,73 · registro (246,212064 + 9,015182) × 1,21 = 308,82
   *   ITP (compra habitual), de TIPOS_ITP_CCAA_2025 y las escalas de ITP_CCAA, resuelto a mano:
   *     Asturias 300.000 × 8 % + 100.000 × 9 % = 33.000 · Castilla y León 250.000 × 8 % +
   *     150.000 × 10 % = 35.000 · Extremadura 360.000 × 8 % + 40.000 × 10 % = 32.800 · Aragón y
   *     Baleares 8 % (primer tramo hasta 400.000) · Ceuta y Melilla 6 % × 50 % = 12.000.
   *   Renuncia: IVA 21 % = 84.000 salvo Canarias (IGIC «No calculado»).
   *   El AJD de la renuncia solo se comprueba por coherencia (rótulo × precio = importe y
   *   presencia/ausencia): su tipo es el hallazgo de la Comunitat Valenciana, y fijarlo aquí lo
   *   consagraría.
   * 26/09/2026 (hallazgo 2214): en Canarias, Ceuta y Melilla la notaría y el registro van sin
   * IVA: 458,43341 × 1,75 = 802,258468 → 802,26 y 255,227246 → 255,23. Y con AJD, la descripción
   * del coste lleva detrás la salvedad del art. 30.1 (hallazgo 2209).
   * 24/09/2026: el País Vasco paga el 7 % de lo que no es vivienda (28.000, antes 16.000 con el
   * 4 % de la vivienda) y el AJD foral del 0,5 % con renuncia (antes, sin AJD); y en Ceuta y
   * Melilla la renuncia no existe (IPSI): su botón está desactivado y allí se comprueba eso.
   */
  test('BARRIDO — 19 territorios × 2 regímenes a 400.000 €: cifras, rótulos, botón, recuadro y avisos', async ({ page }) => {
    const ITP_400K: Record<string, [number, string]> = {
      andalucia: [28000, '7,00'], aragon: [32000, '8,00'], asturias: [33000, '8,25'], baleares: [32000, '8,00'],
      canarias: [26000, '6,50'], cantabria: [36000, '9,00'], 'castilla-leon': [35000, '8,75'],
      'castilla-mancha': [36000, '9,00'], cataluna: [40000, '10,00'], valencia: [36000, '9,00'],
      extremadura: [32800, '8,20'], galicia: [32000, '8,00'], madrid: [24000, '6,00'], murcia: [31000, '7,75'],
      navarra: [24000, '6,00'], 'pais-vasco': [28000, '7,00'], rioja: [28000, '7,00'], ceuta: [12000, '3,00'],
      melilla: [12000, '3,00'],
    };
    const SIN_IVA: Record<string, string> = { canarias: 'IGIC', ceuta: 'IPSI', melilla: 'IPSI' };
    const SIN_AJD = new Set<string>(); // desde el 24/09/2026 el País Vasco cobra el 0,5 % (antes, 0)
    const SIN_RENUNCIA = new Set(['ceuta', 'melilla']); // el IPSI no tiene renuncia (Ley 8/1991)
    // notaría + registro + gestoría; sin IVA en los honorarios donde no rige (hallazgo 2214)
    const fijos = (ccaa: string) => (SIN_IVA[ccaa] ? 802.26 + 255.23 : 970.73 + 308.82) + 400;

    await abrirHidratada(page);
    await sembrarValor(page, CAMPO_PRECIO, '400000');
    const primera = page.locator('[class*="resultados"] h3').nth(1);

    for (const [ccaa, [itp, pct]] of Object.entries(ITP_400K)) {
      await page.selectOption('#select-ccaa', ccaa);
      const sinIva = SIN_IVA[ccaa];
      for (const regimen of ['itp', 'renuncia'] as const) {
        const donde = `${ccaa} · ${regimen}`;
        if (regimen === 'renuncia' && SIN_RENUNCIA.has(ccaa)) {
          const boton = page.getByRole('button', { name: /renuncia a la exención/i });
          await expect(boton, donde).toBeDisabled();
          await expect(boton, donde).toContainText('No existe en el IPSI: paga ITP');
          expect(await lineasPanelCcaa(page), donde).toContain('IPSI (renuncia) No existe');
          continue;
        }
        await page.getByRole('button', { name: regimen === 'renuncia' ? /renuncia a la exención/i : /Compra habitual/ }).click();
        const rotulo = regimen === 'itp' ? `ITP (${pct}\u00A0%)` : sinIva ?? 'IVA (renuncia · ISP) (21,00\u00A0%)';
        await expect(primera, donde).toHaveText(rotulo);
        const cards = await tarjetasPanel(page);
        const card = (re: RegExp) => cards.find((c) => re.test(c.t));
        const imp = cards[1];
        let impuesto = 0;
        if (regimen === 'itp') {
          impuesto = itp;
          expect(euros(imp.v), donde).toBeCloseTo(itp, 2);
        } else if (sinIva) {
          expect(imp.v, donde).toBe('No calculado');
        } else {
          impuesto = 84000;
          expect(euros(imp.v), donde).toBeCloseTo(84000, 2);
        }

        const ajd = card(/^AJD/);
        let ajdImporte = 0;
        if (regimen === 'itp' || SIN_AJD.has(ccaa)) {
          expect(ajd, `${donde}: sin AJD`).toBeUndefined();
        } else {
          expect(ajd, `${donde}: con AJD`).toBeDefined();
          ajdImporte = euros(ajd!.v);
          const p = Number(ajd!.t.match(/\(([\d,]+)\s?%\)/)![1].replace(',', '.'));
          expect(ajdImporte, donde).toBeGreaterThan(0);
          expect(ajdImporte, `${donde}: rótulo del AJD × precio`).toBeCloseTo((400000 * p) / 100, 0);
        }
        expect(card(/^Gastos de notaría/)!.v, donde).toBe(sinIva ? '802,26 €' : '970,73 €');
        expect(card(/^Registro/)!.v, donde).toBe(sinIva ? '255,23 €' : '308,82 €');
        expect(card(/^Registro/)!.t, donde).toBe(`Registro de la Propiedad ${sinIva ? `(sin ${sinIva})` : '(IVA incluido)'}`);

        const total = card(/^Total gastos/)!;
        const coste = card(/^COSTE/)!;
        expect(euros(total.v), donde).toBeCloseTo(impuesto + ajdImporte + fijos(ccaa), 2);
        expect(euros(coste.v), donde).toBeCloseTo(400000 + impuesto + ajdImporte + fijos(ccaa), 2);
        // 26/09/2026 (tarde): donde no rige el IVA el cierre es parcial en los DOS regímenes (a
        // los honorarios les falta su IGIC o IPSI); el aviso del impuesto de la operación, solo
        // con la renuncia.
        const parcial = !!sinIva;
        expect(total.t, donde).toBe(parcial ? 'Total gastos adicionales (parcial)' : 'Total gastos adicionales');
        expect(coste.t, donde).toBe(parcial ? 'COSTE TOTAL (PARCIAL)' : 'COSTE TOTAL DE ADQUISICIÓN');
        expect(coste.d, donde).toBe(
          (parcial && regimen === 'itp'
            ? SOLO_HONORARIOS(sinIva)
            : parcial
            ? `No incluye el ${sinIva}: el coste real puede ser mayor`
            : regimen === 'renuncia'
              ? 'Precio + todos los gastos (antes de deducir el IVA si tienes derecho)'
              : 'Precio + todos los gastos de la operación') + (ajdImporte > 0 ? `. ${AVISO_BASE_AJD}` : ''),
        );
        expect(JSON.stringify(cards), donde).not.toMatch(/NaN|undefined|Infinity/);

        // Lo que rodea a la cifra: el botón de la renuncia, el recuadro y el aviso propio.
        const sinRenuncia = SIN_RENUNCIA.has(ccaa);
        await expect(page.getByRole('button', { name: /renuncia a la exención/i }), donde).toContainText(
          sinRenuncia ? 'No existe en el IPSI: paga ITP' : sinIva ? `Paga ${sinIva} (ISP) + AJD` : 'IVA 21\u00A0% (ISP) + AJD',
        );
        expect(await lineasPanelCcaa(page), donde).toContain(
          sinRenuncia ? `${sinIva} (renuncia) No existe` : sinIva ? `${sinIva} (renuncia) No calculado` : 'IVA (renuncia) 21%',
        );
        const aviso = page.locator('[class*="renunciaAviso"]');
        if (regimen === 'itp' && sinRenuncia) await expect(aviso, donde).toContainText('no existe la renuncia a la exención');
        else if (regimen === 'itp') await expect(aviso, donde).toHaveCount(0);
        else await expect(aviso, donde).toContainText(sinIva ? 'no se devenga IVA' : 'El IVA se autoliquida');
      }
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// REPARACIÓN 24/09/2026 — lo que la reparación toca y los hallazgos no nombraban: el ITP vasco
// de lo que no es vivienda (1582 de la hermana nave), la notaría de libre acuerdo (1599) y el
// precio que se pinta como cero (forma del 1601 de la hermana solar).
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('Reparación 24/09/2026 — País Vasco, notaría de libre acuerdo y el precio que se pinta cero', () => {
  /** País Vasco, compra habitual, 100.000 €: 100.000 × 7 % = 7.000 (el 4 % es de la vivienda). */
  test('País Vasco, 100.000 €: el ITP de una finca es el 7 %, no el 4 % de la vivienda', async ({ page }) => {
    await abrirHidratada(page);
    await page.selectOption('#select-ccaa', 'pais-vasco');
    await sembrarValor(page, CAMPO_PRECIO, '100000');
    expect(await rotuloTarjeta(page, /^ITP \(/)).toBe('ITP (7,00%)');
    expect(await valorTarjeta(page, 'ITP (')).toBe('7000,00 €');
    expect(await lineasPanelCcaa(page)).toContain('ITP General 7%');
    expect(await lineasPanelCcaa(page)).toContain('AJD (renuncia) 0,5%');
  });

  /**
   * Madrid, compra habitual, 8.000.000 €, gestoría 400 € (RD 1426/1989, número 2: lo que excede
   * de 6.010.121,04 € es de libre acuerdo con el notario):
   *   ITP 8.000.000 × 6 % = 480.000 · notaría 4.619,69 (el arancel hasta el límite)
   *   registro: 306,5156935 + 7.398.987,90 × 0,02 % (1.479,79758) = 1.786,3132735 (bajo el tope
   *   de 2.181,67) + 9,015182 = 1.795,3284555 × 1,21 = 2.172,347 → 2.172,35
   *   total 480.000 + 4.619,69 + 2.172,35 + 400 = 487.192,04 (PARCIAL)
   */
  test('Madrid, 8.000.000 €: la notaría por encima del límite se avisa y el cierre es parcial', async ({ page }) => {
    await abrirHidratada(page);
    await sembrarValor(page, CAMPO_PRECIO, '8000000');
    expect(await valorTarjeta(page, 'ITP (')).toBe('480.000,00 €');
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('4619,69 €');
    expect(await descripcionTarjeta(page, 'Gastos de notaría')).toContain('libre acuerdo con el notario');
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('2172,35 €');
    expect(await rotuloTarjeta(page, /^Total gastos adicionales/)).toBe('Total gastos adicionales (parcial)');
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('487.192,04 €');
    expect(await rotuloTarjeta(page, /^COSTE TOTAL/)).toBe('COSTE TOTAL (PARCIAL)');
    expect(await descripcionTarjeta(page, 'COSTE TOTAL')).toBe(
      'No incluye la parte de la notaría de libre acuerdo: el coste real puede ser mayor',
    );
  });

  /**
   * «0,004» se pinta «0,00 €»: es el cero, así que no hay desglose (como con «0»). Desde el
   * 26/09 (hallazgo 2218) el marcador dice que el precio tiene que ser mayor que 0.
   */
  test('Un precio que se pinta 0,00 € no publica desglose', async ({ page }) => {
    await abrirHidratada(page);
    const esperado: Record<string, string> = {
      '0': `El precio escrito («0») ${PRECIO_NO_VALE}.`,
      '0,004': `El precio escrito («0,004») se queda en 0,00 € al céntimo, y ${PRECIO_NO_VALE}.`,
    };
    for (const entrada of ['0', '0,004']) {
      await sembrarValor(page, CAMPO_PRECIO, entrada);
      await expect(page.locator('[class*="placeholder"] p'), entrada).toHaveText(esperado[entrada]);
      await expect(page.locator('h3', { hasText: /^COSTE TOTAL/ })).toHaveCount(0);
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// RE-INSPECCIÓN 26/09/2026 — hermana del GRUPO B de la familia «Compraventa inmobiliaria»
// (referencia: estimador-compraventa-inmueble · testigo: tests/familias/compraventa.spec.ts).
//
// Antes de escribir nada se ejecutó el fichero entero: 47/47 en verde y ningún `test.fail()`
// pendiente, así que 1602-1606 (1c83ff86 y b02fde62) siguen cerrados. Los casos nuevos los
// pisan desde otro sitio: el umbral valenciano a UN CÉNTIMO y CON renuncia (1602 y 1603), la
// renuncia en otra comunidad al mismo precio (el AJD general, rotulado como tal) y en Canarias
// (1605), y la gestoría ilegible con su dirección MEDIDA frente a una gestoría escrita a 0 (1604).
//
// De dónde sale cada cifra (ninguna de memoria):
//  - ITP: `TIPOS_ITP_CCAA_2025` (data/fiscal/inmuebles.ts) — Andalucía tipo 7 (l. 53), Canarias
//    6,5 (l. 57), Madrid 6 (l. 65); Valencia 9 con `umbralTipoUnico { superiorA: 1_000_000,
//    tipo: 11 }` (data/itp-ccaa.ts l. 565; Ley 13/1997 art. 13.Uno: el 11 % sobre TODO el valor).
//  - AJD: `ITP_CCAA[x].ajd` — Andalucía 1,2 (l. 196), Canarias 0,75 (l. 389), Madrid 0,75
//    (l. 709) — y `ajdRenuncia: 2` de Valencia (l. 610; Ley 13/1997 art. 14).
//  - IVA de la renuncia: `PORCENTAJES_IVA.general` = 21 (data/fiscal/iva.ts l. 66).
//  - Notaría: `ARANCELES_NOTARIO` (RD 1426/1989, nº 2) × 1,21 × `FACTURA_NOTARIAL` (×1,5 · ×2 ·
//    medio ×1,75). Registro: `ARANCELES_REGISTRO` + `REGISTRO_CONCEPTOS` (6,010121 + 3,005061),
//    tope 2.181,67, × 1,21. Los totales suman las líneas ya redondeadas (`sumarLineasVisibles`).
// Resuelto ANTES de abrir el navegador con un script propio que no llama a la app ni al motor;
// el desarrollo va en el comentario de cada caso.
//
// Los rótulos con «%» se comparan con `sinEspacioPct`, que quita el espacio de delante del
// signo: así estos casos siguen valiendo el día que se repare el «%» pegado (hallazgo de abajo).
// ═══════════════════════════════════════════════════════════════════════════════

/** Quita el espacio (normal o duro) de delante del «%», para comparar cifras y no tipografía. */
const sinEspacioPct = (s: string): string => s.replace(/\s+%/g, '%');

test.describe('Re-inspección 26/09/2026 — familia grupo B: casos nuevos y el invariante del ilegible', () => {
  test.describe.configure({ timeout: 60_000 });

  /**
   * CASO 1 (NORMAL) — Andalucía, 150.000 €, gestoría 450 € (Andalucía solo la había pisado el
   * BARRIDO a 400.000 €). Una compra corriente de tierra, y la MISMA con renuncia.
   *   ITP = 150.000 × 7 % = 10.500,00 (sin escala ni umbral)
   *   Notaría: 90,15 + 24.040,49 × 0,45 % (108,182205) + 30.050,60 × 0,15 % (45,0759)
   *            + 89.898,79 × 0,10 % (89,89879) = 333,306895 × 1,21 = 403,301343
   *            → 604,95 – 806,60 · medio ×1,75 = 705,777350 → 705,78
   *   Registro: 24,04 + 24.040,49 × 0,175 % (42,0708575) + 30.050,60 × 0,125 % (37,56325)
   *            + 89.898,79 × 0,075 % (67,4240925) = 171,0982 + 9,015182 = 180,113382 × 1,21
   *            = 217,937192 → 217,94
   *   a) Compra habitual: total 10.500 + 705,78 + 217,94 + 450 = 11.873,72 (7,9158 % → 7,92 %)
   *      · coste 161.873,72
   *   b) Renuncia: IVA 150.000 × 21 % = 31.500,00 + AJD 150.000 × 1,2 % = 1.800,00 (Andalucía no
   *      tiene tipo propio de la renuncia declarado: el general, y la tarjeta lo dice) · sin ITP
   *      → total 34.673,72 (23,1158 % → 23,12 %) · coste 184.673,72
   */
  test('CASO 1 (normal) — Andalucía, 150.000 €: ITP 7 %; con renuncia, IVA 21 % + AJD 1,2 % general y ningún ITP', async ({ page }) => {
    expect(TIPOS_ITP_CCAA_2025.find((t) => t.ccaa === 'Andalucía')?.tipo).toBe(7);
    expect(ITP_CCAA['andalucia'].tramosProgresivos).toBeUndefined();
    expect(ITP_CCAA['andalucia'].umbralTipoUnico).toBeUndefined();
    expect(ITP_CCAA['andalucia'].ajd).toBe(1.2);
    expect(ITP_CCAA['andalucia'].ajdRenuncia).toBeUndefined();
    expect(PORCENTAJES_IVA.general).toBe(21);

    await abrirHidratada(page);
    await page.selectOption('#select-ccaa', 'andalucia');
    await sembrarValor(page, CAMPO_PRECIO, '150000');
    await sembrarValor(page, CAMPO_GESTORIA, '450');

    // a) Compra habitual, el régimen por defecto.
    await expect(page.getByRole('button', { name: /Compra habitual/ })).toHaveAttribute('aria-pressed', 'true');
    expect(sinEspacioPct(await rotuloTarjeta(page, /^ITP \(/))).toBe('ITP (7,00%)');
    expect(await valorTarjeta(page, 'ITP (')).toBe('10.500,00 €');
    expect(await descripcionTarjeta(page, 'ITP (')).toBe('Tipo general de la CCAA (posibles reducciones agrarias no incluidas)');
    await expect(page.locator('h3', { hasText: /^AJD/ })).toHaveCount(0);
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('705,78 €');
    expect(await descripcionTarjeta(page, 'Gastos de notaría')).toContain('entre 604,95 € y 806,60 €');
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('217,94 €');
    expect(await valorTarjeta(page, 'Gastos de gestoría')).toBe('450,00 €');
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('11.873,72 €');
    expect(sinEspacioPct(await descripcionTarjeta(page, 'Total gastos adicionales'))).toBe('7,92% sobre el precio de compra');
    expect(await rotuloTarjeta(page, /^COSTE TOTAL/)).toBe('COSTE TOTAL DE ADQUISICIÓN');
    expect(await valorTarjeta(page, 'COSTE TOTAL')).toBe('161.873,72 €');
    const panel = (await lineasPanelCcaa(page)).map(sinEspacioPct);
    expect(panel).toContain('ITP General 7%');
    expect(panel).toContain('AJD (renuncia) 1,2%');
    expect(panel).toContain('IVA (renuncia) 21%');

    // b) Renuncia: el ITP se va entero y entran el IVA con inversión del sujeto pasivo y el AJD.
    await page.getByRole('button', { name: /renuncia a la exención/i }).click();
    await expect(page.locator('h3', { hasText: /^ITP/ })).toHaveCount(0);
    expect(sinEspacioPct(await rotuloTarjeta(page, /^IVA \(/))).toBe('IVA (renuncia · ISP) (21,00%)');
    expect(await valorTarjeta(page, 'IVA (')).toBe('31.500,00 €');
    expect(sinEspacioPct(await rotuloTarjeta(page, /^AJD \(/))).toBe('AJD (1,20%)');
    expect(await valorTarjeta(page, 'AJD (')).toBe('1800,00 €');
    expect(await descripcionTarjeta(page, 'AJD (')).toBe(
      'Tipo general de la comunidad: algunas CCAA aplican un tipo de AJD incrementado en la renuncia',
    );
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('34.673,72 €');
    expect(sinEspacioPct(await descripcionTarjeta(page, 'Total gastos adicionales'))).toBe('23,12% sobre el precio de compra');
    expect(await valorTarjeta(page, 'COSTE TOTAL')).toBe('184.673,72 €');
    expect(await descripcionTarjeta(page, 'COSTE TOTAL')).toBe(
      'Precio + todos los gastos (antes de deducir el IVA si tienes derecho)',
    );
  });

  /**
   * CASO 2 (LÍMITE) — 1.000.000,01 €: UN CÉNTIMO por encima del umbral valenciano, en los dos
   * regímenes, y la misma renuncia en Madrid y en Canarias al mismo precio. Gestoría 400 € (la
   * de por defecto, no se siembra).
   *   Notaría: 558,93946 (acumulado del arancel a 601.012,10) + 398.987,91 × 0,03 % (119,696373)
   *            = 678,635833 × 1,21 = 821,149358 → 1231,72 – 1642,30 · medio 1.437,011376 → 1437,01
   *   Registro: 306,5156935 + 398.987,91 × 0,02 % (79,797582) = 386,3132755 + 9,015182
   *            = 395,3284575 × 1,21 = 478,347434 → 478,35
   *   a) Valencia, compra habitual: ITP = 1.000.000,01 × 11 % = 110.000,0011 → 110.000,00
   *      (con la escala de antes del 1602 serían 90.000,0011 €). Total 110.000 + 1437,01 + 478,35
   *      + 400 = 112.315,36 (11,2315 % → 11,23 %) · coste 1.000.000,01 + 112.315,36 = 1.112.315,37
   *   b) Valencia, renuncia: el umbral del ITP no se cuela en el IVA. IVA 210.000,0021 → 210.000,00
   *      · AJD 2 % (ajdRenuncia, 1603) 20.000,0002 → 20.000,00 · total 232.315,36 (23,23 %)
   *      · coste 1.232.315,37
   *   c) Madrid, renuncia: IVA 210.000,00 · AJD 0,75 % (el general, sin tipo propio declarado)
   *      7.500,000075 → 7500,00 · total 219.815,36 (21,98 %) · coste 1.219.815,37
   *   d) Canarias, renuncia (la del IGIC, 1605): IGIC «No calculado» · AJD 0,75 % 7500,00 · total
   *      PARCIAL 7.500 + 1437,01 + 478,35 + 400 = 9815,36 (0,98 %) · coste PARCIAL 1.009.815,37,
   *      y como el IGIC puede ser cero, «puede ser mayor», no «será».
   *      ⚠️ 26/09/2026 (hallazgo 2214): sin IVA en los honorarios de Canarias → notaría
   *      678,635833 × 1,75 = 1.187,612708 · registro 395,328457 → 7.500 + 1.187,61 + 395,33 + 400
   *      = 9.482,94 (0,948 % → 0,95 %) · coste PARCIAL 1.009.482,95
   */
  test('CASO 2 (límite) — 1.000.000,01 €: Valencia al 11 % y con renuncia al 2 %; Madrid y Canarias con renuncia al mismo precio', async ({ page }) => {
    expect(ITP_CCAA['valencia'].umbralTipoUnico).toEqual({ superiorA: 1_000_000, tipo: 11 });
    expect(ITP_CCAA['valencia'].ajdRenuncia).toBe(2);
    expect(ITP_CCAA['madrid'].ajd).toBe(0.75);
    expect(ITP_CCAA['madrid'].ajdRenuncia).toBeUndefined();
    expect(ITP_CCAA['canarias'].ajd).toBe(0.75);
    expect(TERRITORIOS_SIN_IVA['canarias']?.impuesto).toBe('IGIC');

    await abrirHidratada(page);
    await page.selectOption('#select-ccaa', 'valencia');
    await sembrarValor(page, CAMPO_PRECIO, '1.000.000,01');

    // a) Compra habitual.
    expect(await valorTarjeta(page, 'Precio de la finca rústica')).toBe('1.000.000,01 €');
    expect(sinEspacioPct(await rotuloTarjeta(page, /^ITP \(/))).toBe('ITP (11,00%)');
    expect(await valorTarjeta(page, 'ITP (')).toBe('110.000,00 €');
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('1437,01 €');
    expect(await descripcionTarjeta(page, 'Gastos de notaría')).toContain('entre 1231,72 € y 1642,30 €');
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('478,35 €');
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('112.315,36 €');
    expect(sinEspacioPct(await descripcionTarjeta(page, 'Total gastos adicionales'))).toBe('11,23% sobre el precio de compra');
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('1.112.315,37 €');
    let panel = (await lineasPanelCcaa(page)).map(sinEspacioPct);
    expect(panel).toContain('ITP General 11%');
    expect(panel).toContain('AJD (renuncia) 2%');

    // b) Valencia con renuncia.
    await page.getByRole('button', { name: /renuncia a la exención/i }).click();
    await expect(page.locator('h3', { hasText: /^ITP/ })).toHaveCount(0);
    expect(await valorTarjeta(page, 'IVA (')).toBe('210.000,00 €');
    expect(sinEspacioPct(await rotuloTarjeta(page, /^AJD \(/))).toBe('AJD (2,00%)');
    expect(await valorTarjeta(page, 'AJD (')).toBe('20.000,00 €');
    expect(await descripcionTarjeta(page, 'AJD (')).toBe('Tipo propio de la renuncia a la exención en la Comunidad Valenciana');
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('232.315,36 €');
    expect(sinEspacioPct(await descripcionTarjeta(page, 'Total gastos adicionales'))).toBe('23,23% sobre el precio de compra');
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('1.232.315,37 €');

    // c) Madrid con renuncia: el AJD general, y el recuadro dice que es el general.
    await page.selectOption('#select-ccaa', 'madrid');
    await expect(page.locator('h3', { hasText: /^AJD \(/ })).toHaveText(/AJD \(0,75\s?%\)/);
    expect(await valorTarjeta(page, 'IVA (')).toBe('210.000,00 €');
    expect(await valorTarjeta(page, 'AJD (')).toBe('7500,00 €');
    expect(await descripcionTarjeta(page, 'AJD (')).toBe(
      'Tipo general de la comunidad: algunas CCAA aplican un tipo de AJD incrementado en la renuncia',
    );
    await expect(page.locator('[class*="renunciaAviso"]')).toContainText('este simulador usa el AJD general');
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('219.815,36 €');
    expect(sinEspacioPct(await descripcionTarjeta(page, 'Total gastos adicionales'))).toBe('21,98% sobre el precio de compra');
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('1.219.815,37 €');

    // d) Canarias con renuncia: el IGIC no se cifra y el cierre lo dice con «puede».
    await page.selectOption('#select-ccaa', 'canarias');
    await expect(page.locator('h3', { hasText: /^IGIC$/ })).toHaveCount(1);
    expect(await valorTarjeta(page, 'IGIC')).toBe('No calculado');
    expect(await valorTarjeta(page, 'AJD (')).toBe('7500,00 €');
    expect(await rotuloTarjeta(page, /^Total gastos adicionales/)).toBe('Total gastos adicionales (parcial)');
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('9482,94 €');
    expect(sinEspacioPct(await descripcionTarjeta(page, 'Total gastos adicionales'))).toBe(
      `0,95% sobre el precio de compra — SIN el IGIC, que no está incluido${sinHonorarios('IGIC')}`,
    );
    expect(await rotuloTarjeta(page, /^COSTE TOTAL/)).toBe('COSTE TOTAL (PARCIAL)');
    expect(await valorTarjeta(page, 'COSTE TOTAL')).toBe('1.009.482,95 €');
    expect(await descripcionTarjeta(page, 'COSTE TOTAL')).toBe('No incluye el IGIC: el coste real puede ser mayor');
    panel = (await lineasPanelCcaa(page)).map(sinEspacioPct);
    expect(panel).toContain('IGIC (renuncia) No calculado');
  });

  /**
   * CASO 3 (RECHAZO / NOMBRAR) — el invariante de la familia en los DOS importes de la app.
   * «Un importe ILEGIBLE no es un cero: si mueve alguna cifra publicada, la app tiene que
   * nombrarlo y decir EN QUÉ DIRECCIÓN falta.» La dirección se MIDE: con el dato y sin él.
   * Andalucía, compra habitual, 150.000 € (caso 1):
   *   gestoría 450        → coste 161.873,72 (definitivo)
   *   gestoría «2.000.50» → «Sin leer», total 11.423,72 · coste 161.423,72: la cifra BAJA 450 € sin
   *     el dato, así que el aviso tiene que decir que el coste real es MAYOR, y los dos títulos de
   *     cierre llevan «(parcial)» (1604).
   *   gestoría «0»        → la MISMA cifra (161.423,72), pero es un dato: sin tarjeta de gestoría y
   *     con los títulos definitivos. Es la pareja que distingue el cero del ilegible.
   *   Renuncia con la gestoría ilegible: 31.500 + 1.800 + 705,78 + 217,94 = 34.223,72 · coste
   *     184.223,72, y el aviso del ilegible se SUMA a la salvedad del IVA deducible (forma del 1272).
   * Precio «2.000.50»: ninguna cifra, y el marcador nombra lo escrito (8d7dcd1b).
   */
  test('CASO 3 (rechazo) — gestoría y precio ilegibles se nombran, con la dirección medida; el 0 de la gestoría es un dato', async ({ page }) => {
    await abrirHidratada(page);
    await page.selectOption('#select-ccaa', 'andalucia');
    await sembrarValor(page, CAMPO_PRECIO, '150000');

    await sembrarValor(page, CAMPO_GESTORIA, '450');
    const conDato = euros(await valorTarjeta(page, 'COSTE TOTAL'));
    expect(conDato).toBeCloseTo(161873.72, 2);
    expect(await rotuloTarjeta(page, /^COSTE TOTAL/)).toBe('COSTE TOTAL DE ADQUISICIÓN');

    await sembrarValor(page, CAMPO_GESTORIA, '2.000.50');
    expect(await valorTarjeta(page, 'Gastos de gestoría')).toBe('Sin leer');
    expect(await descripcionTarjeta(page, 'Gastos de gestoría')).toContain('NO está incluido en el total');
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('11.423,72 €');
    const sinDato = euros(await valorTarjeta(page, 'COSTE TOTAL'));
    expect(sinDato).toBeCloseTo(161423.72, 2);
    // Dirección medida: sin el dato la cifra publicada es MENOR, así que falta hacia arriba.
    expect(conDato - sinDato).toBeCloseTo(450, 2);
    expect(await rotuloTarjeta(page, /^Total gastos adicionales/)).toBe('Total gastos adicionales (parcial)');
    expect(sinEspacioPct(await descripcionTarjeta(page, 'Total gastos adicionales'))).toBe(
      '7,62% sobre el precio de compra — SIN la gestoría, que no se ha podido leer',
    );
    expect(await rotuloTarjeta(page, /^COSTE TOTAL/)).toBe('COSTE TOTAL (PARCIAL)');
    expect(await descripcionTarjeta(page, 'COSTE TOTAL')).toBe(
      'No incluye la gestoría, que no se ha podido leer: el coste real será mayor',
    );

    // El 0 escrito es un dato: misma cifra, títulos definitivos y sin tarjeta de gestoría.
    await sembrarValor(page, CAMPO_GESTORIA, '0');
    await expect(page.locator('h3', { hasText: /^Gastos de gestoría/ })).toHaveCount(0);
    expect(await rotuloTarjeta(page, /^Total gastos adicionales/)).toBe('Total gastos adicionales');
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('11.423,72 €');
    expect(await rotuloTarjeta(page, /^COSTE TOTAL/)).toBe('COSTE TOTAL DE ADQUISICIÓN');
    expect(await valorTarjeta(page, 'COSTE TOTAL')).toBe('161.423,72 €');

    // Con IVA en pantalla, el aviso del ilegible se suma a la salvedad del IVA deducible.
    await page.getByRole('button', { name: /renuncia a la exención/i }).click();
    await sembrarValor(page, CAMPO_GESTORIA, '2.000.50');
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('34.223,72 €');
    expect(await valorTarjeta(page, 'COSTE TOTAL')).toBe('184.223,72 €');
    expect(await descripcionTarjeta(page, 'COSTE TOTAL')).toBe(
      'No incluye la gestoría, que no se ha podido leer: el coste real será mayor (precio + gastos antes de deducir el IVA si tienes derecho)',
    );

    // El precio ilegible: ninguna cifra publicada y el marcador nombra lo que se escribió.
    await sembrarValor(page, CAMPO_PRECIO, '2.000.50');
    await expect(page.locator('h3', { hasText: /^COSTE TOTAL/ })).toHaveCount(0);
    await expect(page.locator('[class*="placeholder"] p')).toContainText('No se ha podido leer el precio «2.000.50»');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// REPARACIÓN 26/09/2026 — los siete hallazgos de la re-inspección del 26/09 (2214-2220), sin
// marca, y la receta de la familia llevada aquí: la base mínima del AJD de la renuncia (2209,
// anotado en solar) y las notas de la comunidad (2208, anotado en solar). Los siete estaban con
// `test.fail()`: se quita la marca y las aserciones que afirmaban el defecto («se reproduce»)
// salen, porque ya no se reproduce. Cifras a mano; ninguna copiada de la app.
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('Reparación 26/09/2026 — hallazgos 2214-2220 y la receta de la familia', () => {
  test.describe.configure({ timeout: 60_000 });
  const normaliza = (s: string | null) => (s ?? '').replace(/\s+/g, ' ').trim();

  /**
   * REPARADO 2216 · forma (c) — el «%» va con espacio duro U+00A0 en la herramienta, el aviso,
   * los sellos, el JSON-LD y las description. Valencia, renuncia, 300.000 €.
   */
  test('REPARADO 2216 — ningún «%» sin espacio duro en pantalla, sellos, JSON-LD ni description', async ({ page }) => {
    await abrirHidratada(page);
    await page.selectOption('#select-ccaa', 'valencia');
    await sembrarValor(page, CAMPO_PRECIO, '300000');
    await page.getByRole('button', { name: /renuncia a la exención/i }).click();
    expect(await valorTarjeta(page, 'AJD (')).toBe('6000,00 €');

    const zonas = ['[class*="resultados"]', '[class*="infoCcaa"]', '[class*="transmisionGrid"]', '[class*="renunciaAviso"]'];
    const pantalla = [
      ...(await Promise.all(zonas.map((z) => page.locator(z).first().innerText()))),
      ...(await page.locator('[aria-label="Datos de referencia normativos"]').allInnerTexts()),
    ].join('\n');
    const ld = (await page.locator('script[type="application/ld+json"]').allTextContents()).join('\n');
    const descripciones = await Promise.all(
      ['meta[name="description"]', 'meta[property="og:description"]', 'meta[name="twitter:description"]'].map(
        async (sel) => (await page.locator(sel).getAttribute('content')) ?? '',
      ),
    );
    expect(pantalla).toMatch(/\d %/);
    expect(ld).toMatch(/\d %/);
    const malos = (t: string) =>
      [...t.matchAll(/\d%|\d %/g)].map((m) => t.slice(Math.max(0, (m.index ?? 0) - 14), (m.index ?? 0) + 3).replace(/\s+/g, ' '));
    expect({ pantalla: malos(pantalla), jsonLd: malos(ld), description: malos(descripciones.join('\n')) }).toEqual({
      pantalla: [],
      jsonLd: [],
      description: [],
    });
  });

  /**
   * REPARADO 2217 · forma (a) — un sello por módulo cuyos datos publica la página: la escala del
   * ahorro de la guía (`GANANCIAS_PATRIMONIALES_META`, 12/08/2026), el IVA de la renuncia
   * (`FISCAL_IVA_META`, 18/06/2026) y los aranceles (RD 1426/1989 y RD 1427/1989). El de
   * inmuebles ya no cita el RDL 26/2021 de la plusvalía, que esta app dice que no se paga.
   * (Queda fuera: el umbral y el AJD de la renuncia de Valencia, verificados en la norma el
   * 24/09/2026, siguen bajo la fecha del sello de inmuebles, 17/06/2026; eso se decide en
   * data/fiscal, no en la app.)
   */
  test('REPARADO 2217 — sellos de la escala del ahorro, del IVA y de los aranceles', async ({ page }) => {
    const fecha = (iso: string) => iso.split('-').reverse().join('/');
    expect(fecha(FISCAL_INMUEBLES_META.verificado)).toBe('17/06/2026');
    expect(fecha(GANANCIAS_PATRIMONIALES_META.verificado)).toBe('12/08/2026');
    expect(fecha(FISCAL_IVA_META.verificado)).toBe('18/06/2026');
    expect(FACTURA_NOTARIAL.baseNormativa).toContain('RD 1426/1989');
    expect(REGISTRO_CONCEPTOS.baseNormativa).toContain('RD 1427/1989');

    await abrirHidratada(page);
    await sembrarValor(page, CAMPO_PRECIO, '150000');
    const guia = ((await page.locator('body').textContent()) ?? '').replace(/\s+/g, ' ');
    const [minAhorro, maxAhorro] = [
      TRAMOS_GANANCIAS_PATRIMONIALES_2025[0].tipo,
      TRAMOS_GANANCIAS_PATRIMONIALES_2025[TRAMOS_GANANCIAS_PATRIMONIALES_2025.length - 1].tipo,
    ];
    expect(sinEspacioPct(guia)).toContain(`base del ahorro, ${minAhorro}%-${maxAhorro}%`);
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('705,78 €');
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('217,94 €');

    const sellos = (await page.locator('[aria-label="Datos de referencia normativos"]').allInnerTexts()).map(normaliza);
    const todos = sellos.join(' | ');
    expect(todos).toContain(`Última verificación: ${fecha(FISCAL_INMUEBLES_META.verificado)}`);
    expect(todos).toContain(fecha(GANANCIAS_PATRIMONIALES_META.verificado));
    expect(todos).toContain(fecha(FISCAL_IVA_META.verificado));
    expect(todos).toMatch(/1426\/1989/);
    expect(todos).toMatch(/1427\/1989/);
    const inmuebles = sellos.find((s) => s.includes('ITP/AJD 2026')) ?? '';
    expect(inmuebles).not.toMatch(/RDL 26\/2021|Ley 35\/2006/);
  });

  /**
   * REPARADO 2218 · patrón 5 de la familia, «no falta, no vale» (1799 en la referencia) — un
   * precio escrito como 0 o negativo dice que tiene que ser mayor que 0, también después del
   * blur, que reescribe el negativo a «0» (min={0} del NumberInput). El vacío pide «Introduce…»
   * y el ilegible conserva su mensaje (grupo B del testigo de familia).
   */
  test('REPARADO 2218 — un precio escrito como 0 o negativo dice que tiene que ser mayor que 0', async ({ page }) => {
    await abrirHidratada(page);
    const marcador = page.locator('[class*="placeholder"] p');
    await expect(marcador).toHaveText('Introduce el precio de la finca rústica para ver el desglose de gastos');
    for (const entrada of ['0', '-150000']) {
      await sembrarValor(page, CAMPO_PRECIO, entrada);
      await expect(page.locator('h3', { hasText: /^COSTE TOTAL/ })).toHaveCount(0);
      await expect(marcador).toHaveText(`El precio escrito («${entrada}») ${PRECIO_NO_VALE}.`);
    }
    // Al salir del campo el negativo pasa a «0», y el mensaje lo sigue diciendo.
    await page.locator(CAMPO_PRECIO).focus();
    await page.locator(CAMPO_GESTORIA).focus();
    await esperarValorEnReact(page, CAMPO_PRECIO, '0');
    await expect(marcador).toHaveText(`El precio escrito («0») ${PRECIO_NO_VALE}.`);
    await sembrarValor(page, CAMPO_PRECIO, '2.000.50');
    await expect(marcador).toContainText('No se ha podido leer el precio «2.000.50»');
  });

  /**
   * REPARADO 2214 (motor en 242fffcd; la app pasa la comunidad) — en Canarias, Ceuta y Melilla
   * la notaría y el registro van SIN IVA, se rotulan «(sin IGIC)» / «(sin IPSI)» y una nota
   * junto al total dice que esas facturas llevan ese impuesto, que la herramienta no calcula.
   *   Canarias · compra habitual · 150.000 € · gestoría 400 (aranceles a mano):
   *     ITP 150.000 × 6,5 % = 9.750 · notaría 333,306895 × 1,75 = 583,287066 → 583,29
   *     · registro 180,113382 → 180,11 · total 9.750 + 583,29 + 180,11 + 400 = 10.913,40
   *     (7,2756 % → 7,28 %) · coste 160.913,40
   *   Ceuta: el mismo registro, 180,11 € «(sin IPSI)».
   */
  test('REPARADO 2214 — Canarias y Ceuta: registro y notaría sin IVA, rotulados sin IGIC/IPSI y nombrados junto al total', async ({ page }) => {
    expect(TIPOS_ITP_CCAA_2025.find((t) => t.ccaa === 'Canarias')?.tipo).toBe(6.5);
    expect(TERRITORIOS_SIN_IVA['canarias']?.impuesto).toBe('IGIC');
    expect(TERRITORIOS_SIN_IVA['ceuta']?.impuesto).toBe('IPSI');

    await abrirHidratada(page);
    await page.selectOption('#select-ccaa', 'canarias');
    await sembrarValor(page, CAMPO_PRECIO, '150000');
    expect(await valorTarjeta(page, 'ITP (')).toBe('9750,00 €');
    expect(await rotuloTarjeta(page, /^Gastos de notaría/)).toBe('Gastos de notaría (sin IGIC)');
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('583,29 €');
    expect(await rotuloTarjeta(page, /^Registro de la Propiedad/)).toBe('Registro de la Propiedad (sin IGIC)');
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('180,11 €');
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('10.913,40 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toBe(`7,28% sobre el precio de compra${sinHonorarios('IGIC')}`);
    expect(await valorTarjeta(page, 'COSTE TOTAL')).toBe('160.913,40 €');
    // El cierre no se presenta como definitivo (26/09/2026, tarde), y no habla del «coste real».
    expect(await rotuloTarjeta(page, /^COSTE TOTAL/)).toBe('COSTE TOTAL (PARCIAL)');
    expect(await descripcionTarjeta(page, 'COSTE TOTAL')).toBe(SOLO_HONORARIOS('IGIC'));
    const nota = page.locator('[class*="avisoHonorarios"]');
    await expect(nota).toHaveText(
      'ℹ️ Las facturas de notaría y registro llevan además IGIC, que esta herramienta no calcula, así que cuestan más de lo que se muestra.',
    );
    await expect(nota).not.toContainText('coste real');

    // Con la renuncia, la tarjeta del registro ya no promete un IVA que allí no rige.
    await page.getByRole('button', { name: /renuncia a la exención/i }).click();
    expect(await descripcionTarjeta(page, 'IGIC')).toContain('En Canarias no rige el IVA');
    expect(await rotuloTarjeta(page, /^Registro de la Propiedad/)).toBe('Registro de la Propiedad (sin IGIC)');

    await page.selectOption('#select-ccaa', 'ceuta');
    expect(await rotuloTarjeta(page, /^Registro de la Propiedad/)).toBe('Registro de la Propiedad (sin IPSI)');
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('180,11 €');
    await expect(nota).toContainText('llevan además IPSI');

    await page.selectOption('#select-ccaa', 'madrid');
    expect(await rotuloTarjeta(page, /^Registro de la Propiedad/)).toBe('Registro de la Propiedad (IVA incluido)');
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('217,94 €');
    await expect(nota).toHaveCount(0);
  });

  /**
   * REPARADO 2215 — en oscuro el select de comunidad muestra el foco: la regla
   * `[data-theme='dark'] .select` ya no pisa el borde de `:focus` (se repone en oscuro) y
   * `:focus-visible` añade un contorno. `--primary` oscuro (#3FA5D1) sobre la tarjeta #2D2D2D
   * da ≈ 4,9:1, por encima del 3:1 de WCAG 1.4.11.
   */
  test('REPARADO 2215 — en modo oscuro el select de comunidad muestra el foco', async ({ page }) => {
    await page.addInitScript(() => {
      try {
        localStorage.setItem('meskeia-theme', 'dark');
      } catch {
        /* sin almacenamiento no hay tema oscuro que medir */
      }
    });
    await abrirHidratada(page);
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    const leer = () =>
      page.locator('#select-ccaa').evaluate((el) => {
        const cs = getComputedStyle(el);
        return { borde: cs.borderTopColor, outline: cs.outlineStyle };
      });
    const sinFoco = await leer();
    await page.locator(CAMPO_PRECIO).focus();
    await page.keyboard.press('Tab');
    await expect(page.locator('#select-ccaa')).toBeFocused();
    expect(await page.locator('#select-ccaa').evaluate((el) => el.matches(':focus-visible'))).toBe(true);
    await expect.poll(async () => (await leer()).borde).not.toBe(sinFoco.borde);
    expect((await leer()).outline).not.toBe('none');
  });

  /**
   * REPARADO 2219 — la entrega de un terreno rústico por un empresario está SUJETA al IVA (art.
   * 4.Uno Ley 37/1992) y EXENTA (art. 20.Uno.20.º); por eso cabe la renuncia (art. 20.Dos) de
   * dos filas más abajo y se paga ITP. La fila ya no dice «No (exento)».
   */
  test('REPARADO 2219 — la tabla dice «sujeta pero exenta», coherente con la renuncia', async ({ page }) => {
    await abrirHidratada(page);
    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
    const celda = (fila: string) => page.locator('tr', { hasText: fila }).locator('td').nth(1);
    await expect(celda('¿Sujeto a IVA por empresario?')).toHaveText('Sí, pero exenta (art. 20.Uno.20.º LIVA)');
    await expect(celda('Renuncia a la exención de IVA')).toContainText('Posible entre profesionales');
  });

  /**
   * REPARADO 2220 — «Limitaciones» ya no equipara el suelo urbanizable al solar para el IVA: el
   * art. 20.Uno.20.º LIVA solo trata como edificables los solares y los terrenos con licencia, y
   * la exención se pierde en los urbanizados o en curso de urbanización. El urbanizable sin
   * urbanizar sigue exento (ITP y renuncia, lo que calcula esta app); para la plusvalía municipal
   * sí cuenta como urbano.
   */
  test('REPARADO 2220 — las limitaciones no mandan el urbanizable sin urbanizar a la fiscalidad del solar', async ({ page }) => {
    await abrirHidratada(page);
    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
    const caja = page.locator('[class*="warningBox"]', { hasText: 'Limitaciones de este simulador' }).first();
    const limitaciones = normaliza(await caja.textContent());
    expect(limitaciones).not.toMatch(/urbanizable o edificable, la fiscalidad es la de un solar/);
    expect(limitaciones).toContain('El suelo urbanizable que aún no está urbanizado ni en curso de urbanización sigue exento de IVA');
    expect(limitaciones).toContain('Para la plusvalía municipal, en cambio, cuenta como suelo urbano');
  });

  /**
   * Hallazgo 2209 (anotado en solar; la misma forma en la renuncia de esta app) — la base del
   * AJD no puede ser inferior al valor de referencia (art. 30.1 TRLITPAJD). Se dice en la
   * tarjeta del AJD, en el total, en la ayuda del precio y en las limitaciones; sin AJD, no.
   */
  test('Hallazgo 2209 — con la renuncia, la tarjeta del AJD, el total y la ayuda dicen que su base mínima es el valor de referencia', async ({ page }) => {
    await abrirHidratada(page);
    await sembrarValor(page, CAMPO_PRECIO, '100000');
    const crudo = async (titulo: RegExp) =>
      normaliza(await page.locator('h3', { hasText: titulo }).first().locator('xpath=../following-sibling::p[1]').innerText());
    expect(await crudo(/^COSTE TOTAL/)).not.toContain('art. 30.1');

    await page.getByRole('button', { name: /renuncia a la exención/i }).click();
    expect(await crudo(/^AJD/)).toContain(AVISO_BASE_AJD);
    expect((await crudo(/^COSTE TOTAL/)).endsWith(`. ${AVISO_BASE_AJD}`)).toBe(true);
    const ayuda = normaliza(
      await page.locator(`[id="${await page.locator(CAMPO_PRECIO).getAttribute('aria-describedby')}"]`).innerText(),
    );
    expect(ayuda).toContain('art. 30.1 TRLITPAJD');

    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
    const limitacion = normaliza(await page.locator('li', { hasText: 'valor de referencia catastral puede ser' }).innerText());
    expect(limitacion).toMatch(/AJD.*art\. 30\.1 TRLITPAJD/);
  });

  /**
   * Hallazgo 2208 (anotado en solar) — las notas de la comunidad se pintan, como en garaje,
   * trastero, local-comercial y la referencia: ahí vive el 1 % del art. 121-11 de Aragón.
   */
  test('Hallazgo 2208 — Aragón: la nota de la comunidad (art. 121-11) a la vista, con el «%» separado', async ({ page }) => {
    expect(ITP_CCAA['aragon'].notas).toContain('art. 121-11');
    await abrirHidratada(page);
    await page.selectOption('#select-ccaa', 'aragon');
    const recuadro = await page.locator('[class*="infoCcaa"]').first().innerText();
    expect(recuadro).toContain('121-11');
    expect(recuadro).not.toMatch(/\d%/);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// RE-INSPECCIÓN 06/10/2026 — hermana del grupo B de la familia «Compraventa inmobiliaria»
// (referencia: estimador-compraventa-inmueble · testigo: tests/familias/compraventa.spec.ts,
// 82/82 en verde ese día). Entró INVALIDADA tras b86a5607, 7d5c1876 y 242fffcd (26/09).
//
// Lo que se midió en navegador antes de escribir esto, y salió como debía:
//  · las reparaciones del 26/09 (2214-2220, 2208, 2209): notaría y registro «(sin IGIC/IPSI)»,
//    cierre «(parcial)» cuando solo faltan esos honorarios, la salvedad del art. 30.1 solo con
//    AJD, la nota de la comunidad con el «%» separado (barrido de los 19 territorios × 2
//    regímenes con la guía abierta: 0 «%» sin espacio duro);
//  · el invariante de la familia en los DOS NumberInput (precio y gestoría): el ilegible se
//    nombra y, en la gestoría, con su dirección («será mayor»), medida aquí abajo;
//  · los controles que el testigo no recorre: los dos botones de régimen y el selector de
//    comunidad, también la renuncia que se desactiva en Ceuta y Melilla y vuelve al regresar;
//  · las formas de las hermanas que NO se reproducen: el AJD del recuadro no depende de ningún
//    selector oculto (País Vasco 0,5 % al cargar y tras cambiar de régimen) y los subtítulos de
//    los botones no llevan opacidad (≥ 4,78:1 en claro y oscuro).
//
// Cifras a mano ANTES de abrir la app, de data/fiscal y data/itp-ccaa.ts:
//  - ITP: `TIPOS_ITP_CCAA_2025` — Extremadura 8 y País Vasco `tipoNoVivienda` 7; escala de
//    Extremadura en `ITP_CCAA.extremadura.tramosProgresivos` (8 % hasta 360.000, 10 % hasta
//    600.000, 11 % después); Ceuta 6 con la bonificación del 50 % (art. 57 bis TRLITPAJD).
//  - AJD de la renuncia: `ITP_CCAA[x].ajd` (Extremadura 1,5 · País Vasco 0,5 · Madrid 0,75), sin
//    `ajdRenuncia` propio en ninguna de las tres. IVA: `PORCENTAJES_IVA.general` = 21.
//  ⚠️ La notaría y el registro NO se fijan en estos casos: los hallazgos 2901 y 2902 (rebaja del
//  5 % de los dos aranceles, registrados en la referencia) los moverán al repararse. Los totales
//  se comprueban como suma de lo que se ve y restando esas dos líneas de la pantalla.
// ═══════════════════════════════════════════════════════════════════════════════

/** Importe de una tarjeta, como número (con `euros`, que ya entiende el formato español). */
async function importe(page: Page, titulo: string): Promise<number> {
  return euros(await valorTarjeta(page, titulo));
}

/** Las notas del recuadro de la comunidad (escala, Ley 19/1995 y la ficha de la comunidad). */
async function notasRecuadro(page: Page): Promise<string[]> {
  return (await page.locator('[class*="infoCcaaNote"]').allInnerTexts()).map((t) => t.replace(/\s+/g, ' ').trim());
}

test.describe('Re-inspección 06/10/2026 — Extremadura, País Vasco, los selectores y las notas de la comunidad', () => {
  test.describe.configure({ timeout: 60_000 });

  /**
   * CASO 1 (NORMAL) — Extremadura, 450.000 €, gestoría 500 €. Ninguna ronda había pisado su
   * escala por encima del primer tramo.
   *   a) Compra habitual: ITP = 360.000 × 8 % (28.800) + 90.000 × 10 % (9.000) = 37.800,00 €
   *      → tipo efectivo 37.800 / 450.000 = 8,40 %. El recuadro rotula el nominal del primer
   *      tramo (8 %) y la nota de la escala dice «8 % → 10 % → 11 %».
   *      Total − notaría − registro = 37.800 + 500 = 38.300,00 · coste − total = 450.000,00.
   *   b) Renuncia: IVA 450.000 × 21 % = 94.500,00 · AJD 450.000 × 1,5 % = 6.750,00 (el general:
   *      Extremadura no tiene tipo propio de la renuncia declarado) · ningún ITP.
   *      Total − notaría − registro = 94.500 + 6.750 + 500 = 101.750,00.
   *   (Comprobado a mano también lo que no se fija: notaría 483,43341 × 1,21 × 1,75 = 1.023,67 y
   *   registro 270,2272455 × 1,21 = 326,97 → total a) 39.650,64 · b) 103.100,64; la app dio eso.)
   */
  test('CASO 1 (normal) — Extremadura, 450.000 €: la escala 8/10 % y, con renuncia, IVA 21 % + AJD 1,5 % sin ITP', async ({ page }) => {
    expect(TIPOS_ITP_CCAA_2025.find((t) => t.ccaa === 'Extremadura')?.tipo).toBe(8);
    expect(ITP_CCAA['extremadura'].tramosProgresivos).toEqual([
      { hasta: 360000, tipo: 8 },
      { hasta: 600000, tipo: 10 },
      { hasta: Infinity, tipo: 11 },
    ]);
    expect(ITP_CCAA['extremadura'].ajd).toBe(1.5);
    expect(ITP_CCAA['extremadura'].ajdRenuncia).toBeUndefined();
    expect(PORCENTAJES_IVA.general).toBe(21);

    await abrirHidratada(page);
    await page.selectOption('#select-ccaa', 'extremadura');
    await sembrarValor(page, CAMPO_PRECIO, '450.000');
    await sembrarValor(page, CAMPO_GESTORIA, '500');

    // a) Compra habitual.
    expect(sinEspacioPct(await rotuloTarjeta(page, /^ITP \(/))).toBe('ITP (8,40%)');
    expect(await valorTarjeta(page, 'ITP (')).toBe('37.800,00 €');
    await expect(page.locator('h3', { hasText: /^AJD/ })).toHaveCount(0);
    const panel = (await lineasPanelCcaa(page)).map(sinEspacioPct);
    expect(panel).toContain('ITP General 8%');
    expect(panel).toContain('AJD (renuncia) 1,5%');
    expect((await notasRecuadro(page)).map(sinEspacioPct)).toContain(
      '⚠️ Tipo según el valor: aplica escala progresiva (8% → 10% → 11%): cada tramo del valor tributa a su tipo.',
    );
    let lineas = [
      await importe(page, 'ITP ('),
      await importe(page, 'Gastos de notaría'),
      await importe(page, 'Registro de la Propiedad'),
      await importe(page, 'Gastos de gestoría'),
    ];
    let total = await importe(page, 'Total gastos adicionales');
    expect(total).toBeCloseTo(lineas.reduce((a, b) => a + b, 0), 2);
    expect(total - lineas[1] - lineas[2]).toBeCloseTo(38300, 2);
    expect(await rotuloTarjeta(page, /^COSTE TOTAL/)).toBe('COSTE TOTAL DE ADQUISICIÓN');
    expect((await importe(page, 'COSTE TOTAL')) - total).toBeCloseTo(450000, 2);

    // b) Renuncia: el ITP se va entero y entran el IVA con inversión del sujeto pasivo y el AJD.
    await page.getByRole('button', { name: /renuncia a la exención/i }).click();
    await expect(page.locator('h3', { hasText: /^ITP/ })).toHaveCount(0);
    expect(sinEspacioPct(await rotuloTarjeta(page, /^IVA \(/))).toBe('IVA (renuncia · ISP) (21,00%)');
    expect(await valorTarjeta(page, 'IVA (')).toBe('94.500,00 €');
    expect(sinEspacioPct(await rotuloTarjeta(page, /^AJD \(/))).toBe('AJD (1,50%)');
    expect(await valorTarjeta(page, 'AJD (')).toBe('6750,00 €');
    expect(await descripcionTarjeta(page, 'AJD (')).toBe(
      'Tipo general de la comunidad: algunas CCAA aplican un tipo de AJD incrementado en la renuncia',
    );
    lineas = [
      await importe(page, 'IVA ('),
      await importe(page, 'AJD ('),
      await importe(page, 'Gastos de notaría'),
      await importe(page, 'Registro de la Propiedad'),
      await importe(page, 'Gastos de gestoría'),
    ];
    total = await importe(page, 'Total gastos adicionales');
    expect(total).toBeCloseTo(lineas.reduce((a, b) => a + b, 0), 2);
    expect(total - lineas[2] - lineas[3]).toBeCloseTo(101750, 2);
    expect((await importe(page, 'COSTE TOTAL')) - total).toBeCloseTo(450000, 2);
    expect(await descripcionTarjeta(page, 'COSTE TOTAL')).toBe(
      'Precio + todos los gastos (antes de deducir el IVA si tienes derecho)',
    );
  });

  /**
   * CASO 2 (LÍMITE) — País Vasco, 250.000 €, gestoría 400 € (la de por defecto, no se siembra).
   * La forma que salió hoy en garaje y trastero —un recuadro cuyo AJD sale de un selector OCULTO
   * y cambia (0 % al cargar, 0,5 % tras pasar por otra pestaña)— se mide aquí en los tres
   * momentos: al elegir la comunidad, con la renuncia y al volver a la compra habitual.
   *   a) Compra habitual: ITP = 250.000 × 7 % (lo que no es vivienda) = 17.500,00 € (7,00 %), sin
   *      AJD (la transmisión sujeta a TPO no paga cuota gradual). Total − notaría − registro = 17.900.
   *   b) Renuncia: IVA 52.500,00 · AJD 250.000 × 0,5 % = 1.250,00, el general foral.
   *      Total − notaría − registro = 52.500 + 1.250 + 400 = 54.150.
   */
  test('CASO 2 (límite) — País Vasco, 250.000 €: ITP 7 %, AJD de la renuncia 0,5 % y el recuadro igual en los tres momentos', async ({ page }) => {
    expect(TIPOS_ITP_CCAA_2025.find((t) => t.ccaa === 'País Vasco')?.tipoNoVivienda).toBe(7);
    expect(ITP_CCAA['pais-vasco'].ajd).toBe(0.5);
    expect(ITP_CCAA['pais-vasco'].ajdRenuncia).toBeUndefined();

    await abrirHidratada(page);
    await page.selectOption('#select-ccaa', 'pais-vasco');
    const recuadroEsperado = ['ITP General 7%', 'AJD (renuncia) 0,5%', 'IVA (renuncia) 21%'];
    expect((await lineasPanelCcaa(page)).map(sinEspacioPct)).toEqual(recuadroEsperado);

    await sembrarValor(page, CAMPO_PRECIO, '250000');
    expect(sinEspacioPct(await rotuloTarjeta(page, /^ITP \(/))).toBe('ITP (7,00%)');
    expect(await valorTarjeta(page, 'ITP (')).toBe('17.500,00 €');
    await expect(page.locator('h3', { hasText: /^AJD/ })).toHaveCount(0);
    let total = await importe(page, 'Total gastos adicionales');
    expect(total - (await importe(page, 'Gastos de notaría')) - (await importe(page, 'Registro de la Propiedad'))).toBeCloseTo(17900, 2);

    await page.getByRole('button', { name: /renuncia a la exención/i }).click();
    expect(await valorTarjeta(page, 'IVA (')).toBe('52.500,00 €');
    expect(sinEspacioPct(await rotuloTarjeta(page, /^AJD \(/))).toBe('AJD (0,50%)');
    expect(await valorTarjeta(page, 'AJD (')).toBe('1250,00 €');
    expect(await descripcionTarjeta(page, 'AJD (')).toBe(
      'Tipo general de la comunidad: algunas CCAA aplican un tipo de AJD incrementado en la renuncia',
    );
    total = await importe(page, 'Total gastos adicionales');
    expect(total - (await importe(page, 'Gastos de notaría')) - (await importe(page, 'Registro de la Propiedad'))).toBeCloseTo(54150, 2);
    expect((await lineasPanelCcaa(page)).map(sinEspacioPct)).toEqual(recuadroEsperado);

    await page.getByRole('button', { name: /Compra habitual/ }).click();
    expect(await valorTarjeta(page, 'ITP (')).toBe('17.500,00 €');
    await expect(page.locator('h3', { hasText: /^AJD/ })).toHaveCount(0);
    expect((await lineasPanelCcaa(page)).map(sinEspacioPct)).toEqual(recuadroEsperado);
  });

  /**
   * CASO 2b (LÍMITE, selectores) — la elección del régimen sobrevive a una comunidad donde no
   * existe. Madrid, 200.000 €, con renuncia → Ceuta → Madrid.
   *   Madrid con renuncia: IVA 42.000,00 · AJD 200.000 × 0,75 % = 1.500,00.
   *   Ceuta: el IPSI no tiene renuncia (Ley 8/1991, arts. 7 y 20.3): el botón se desactiva y se
   *   calcula la compra habitual, ITP 200.000 × 6 % × 50 % = 6.000,00 € (3,00 %), sin IVA ni AJD
   *   ni la salvedad del art. 30.1; el cierre es parcial por el IPSI de notaría y registro.
   *   De vuelta en Madrid: la renuncia elegida vuelve, con las mismas cifras.
   */
  test('CASO 2b (selectores) — Madrid con renuncia → Ceuta → Madrid: la renuncia se desactiva, se calcula ITP bonificado y la elección vuelve', async ({ page }) => {
    await abrirHidratada(page);
    await sembrarValor(page, CAMPO_PRECIO, '200000');
    const habitual = page.getByRole('button', { name: /Compra habitual/ });
    const renuncia = page.getByRole('button', { name: /renuncia a la exención/i });
    await renuncia.click();
    expect(await valorTarjeta(page, 'IVA (')).toBe('42.000,00 €');
    expect(await valorTarjeta(page, 'AJD (')).toBe('1500,00 €');

    await page.selectOption('#select-ccaa', 'ceuta');
    await expect(renuncia).toBeDisabled();
    await expect(renuncia).toHaveAttribute('aria-pressed', 'false');
    await expect(habitual).toHaveAttribute('aria-pressed', 'true');
    await expect(renuncia).toContainText('No existe en el IPSI: paga ITP');
    await expect(page.locator('h3', { hasText: /^(IVA|AJD|IPSI)/ })).toHaveCount(0);
    expect(sinEspacioPct(await rotuloTarjeta(page, /^ITP \(/))).toBe('ITP (3,00%)');
    expect(await valorTarjeta(page, 'ITP (')).toBe('6000,00 €');
    expect(await rotuloTarjeta(page, /^COSTE TOTAL/)).toBe('COSTE TOTAL (PARCIAL)');
    expect(await descripcionTarjeta(page, 'COSTE TOTAL')).toBe(SOLO_HONORARIOS('IPSI'));
    const crudoCoste = await page.locator('h3', { hasText: /^COSTE TOTAL/ }).first().locator('xpath=../following-sibling::p[1]').innerText();
    expect(crudoCoste).not.toContain('art. 30.1');
    await expect(page.locator('[class*="renunciaAviso"]', { hasText: 'no existe la renuncia a la exención' })).toHaveCount(1);

    await page.selectOption('#select-ccaa', 'madrid');
    await expect(renuncia).toBeEnabled();
    await expect(renuncia).toHaveAttribute('aria-pressed', 'true');
    expect(await valorTarjeta(page, 'IVA (')).toBe('42.000,00 €');
    expect(await valorTarjeta(page, 'AJD (')).toBe('1500,00 €');
    await expect(page.locator('h3', { hasText: /^ITP/ })).toHaveCount(0);
  });

  /**
   * CASO 3 (RECHAZO / NOMBRAR) — el invariante de la familia con la renuncia y una escala.
   * Extremadura, renuncia, 450.000 €: con la gestoría en 500 y en «2.000.50» la cifra publicada
   * BAJA exactamente 500 €, así que el aviso tiene que decir que el coste real es MAYOR, y los
   * dos títulos de cierre pasan a «(parcial)»; el IVA y el AJD no se mueven.
   * El precio ilegible («-», «1.200.000.50») no publica ninguna cifra y el marcador lo nombra.
   */
  test('CASO 3 (rechazo) — gestoría «2.000.50» con renuncia en Extremadura: dirección medida; precio «-» y «1.200.000.50» sin cifras', async ({ page }) => {
    await abrirHidratada(page);
    await page.selectOption('#select-ccaa', 'extremadura');
    await sembrarValor(page, CAMPO_PRECIO, '450000');
    await page.getByRole('button', { name: /renuncia a la exención/i }).click();
    await sembrarValor(page, CAMPO_GESTORIA, '500');
    const conDato = await importe(page, 'COSTE TOTAL');
    expect(await rotuloTarjeta(page, /^COSTE TOTAL/)).toBe('COSTE TOTAL DE ADQUISICIÓN');

    await sembrarValor(page, CAMPO_GESTORIA, '2.000.50');
    expect(await valorTarjeta(page, 'Gastos de gestoría')).toBe('Sin leer');
    const sinDato = await importe(page, 'COSTE TOTAL');
    // Dirección medida: sin el dato la cifra es MENOR en lo que valía la gestoría.
    expect(conDato - sinDato).toBeCloseTo(500, 2);
    expect(await valorTarjeta(page, 'IVA (')).toBe('94.500,00 €');
    expect(await valorTarjeta(page, 'AJD (')).toBe('6750,00 €');
    expect(await rotuloTarjeta(page, /^Total gastos adicionales/)).toBe('Total gastos adicionales (parcial)');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toMatch(/ — SIN la gestoría, que no se ha podido leer$/);
    expect(await rotuloTarjeta(page, /^COSTE TOTAL/)).toBe('COSTE TOTAL (PARCIAL)');
    expect(await descripcionTarjeta(page, 'COSTE TOTAL')).toBe(
      'No incluye la gestoría, que no se ha podido leer: el coste real será mayor (precio + gastos antes de deducir el IVA si tienes derecho)',
    );

    const marcador = page.locator('[class*="placeholder"] p');
    await sembrarValor(page, CAMPO_PRECIO, '-');
    await expect(page.locator('h3', { hasText: /^COSTE TOTAL/ })).toHaveCount(0);
    await expect(marcador).toContainText('No se ha podido leer el precio «-»');

    await page.selectOption('#select-ccaa', 'valencia');
    await sembrarValor(page, CAMPO_PRECIO, '1.200.000.50');
    await expect(page.locator('[class*="resultados"] h3')).toHaveCount(0);
    await expect(marcador).toContainText('No se ha podido leer el precio «1.200.000.50»');
    expect(await page.locator('body').innerText()).not.toMatch(/NaN|No definido/);
  });

  /**
   * Forma de garaje y trastero (`.transmisionSub { opacity: 0.8 }`, 3,36-3,60:1) medida aquí:
   * los subtítulos de los dos botones de régimen (12,48 px) no llevan opacidad y pasan el 4,5:1
   * en claro y en oscuro, activos o no. Medido el 06/10/2026: 5,50 y 5,22 en claro; 5,83 y 4,78
   * en oscuro (el botón activo, `--text-secondary` #B0B0B0 sobre el azul compuesto #2D434D).
   */
  test('Contraste — los subtítulos de los botones de régimen pasan 4,5:1 en claro y oscuro, sin opacidad', async ({ page }) => {
    const medir = () =>
      page.locator('[class*="transmisionGrid"]').evaluate((grid) => {
        const rgba = (c: string) => {
          const p = (c.match(/rgba?\(([^)]+)\)/)?.[1] ?? '0,0,0,0').split(/[ ,/]+/).filter(Boolean).map(Number);
          return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
        };
        type C = { r: number; g: number; b: number; a: number };
        const sobre = (t: C, f: C): C => ({ r: t.r * t.a + f.r * (1 - t.a), g: t.g * t.a + f.g * (1 - t.a), b: t.b * t.a + f.b * (1 - t.a), a: 1 });
        const lum = (c: C) =>
          [c.r, c.g, c.b]
            .map((v) => v / 255)
            .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
            .reduce((s, v, i) => s + v * [0.2126, 0.7152, 0.0722][i], 0);
        return [...grid.querySelectorAll('[class*="transmisionSub"]')].map((sub) => {
          const capas: C[] = [];
          let opacidad = 1;
          for (let n: Element | null = sub; n; n = n.parentElement) {
            const cs = getComputedStyle(n);
            opacidad *= Number(cs.opacity);
            const bg = rgba(cs.backgroundColor);
            if (bg.a > 0 && !capas.some((c) => c.a === 1)) capas.push(bg);
          }
          let fondo: C = { r: 255, g: 255, b: 255, a: 1 };
          for (let i = capas.length - 1; i >= 0; i--) fondo = sobre(capas[i], fondo);
          const texto = rgba(getComputedStyle(sub).color);
          const color = sobre({ ...texto, a: texto.a * opacidad }, fondo);
          const [l1, l2] = [lum(color), lum(fondo)].sort((a, b) => b - a);
          return { opacidad, ratio: (l1 + 0.05) / (l2 + 0.05) };
        });
      });

    for (const tema of ['claro', 'oscuro']) {
      if (tema === 'oscuro') {
        await page.addInitScript(() => {
          try {
            localStorage.setItem('meskeia-theme', 'dark');
          } catch {
            /* sin almacenamiento no hay tema oscuro que medir */
          }
        });
      }
      await abrirHidratada(page);
      if (tema === 'oscuro') await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
      for (const pulsar of [null, /renuncia a la exención/i]) {
        if (pulsar) await page.getByRole('button', { name: pulsar }).click();
        const subs = await medir();
        expect(subs).toHaveLength(2);
        for (const s of subs) {
          expect(s.opacidad).toBe(1);
          expect(s.ratio).toBeGreaterThanOrEqual(4.5);
        }
      }
    }
  });

  /**
   * REPARADO el 06/10/2026 (hallazgo 2920): las notas de Galicia y Andalucía de data/itp-ccaa.ts
   * dicen ya que el tipo reducido es de la vivienda habitual. Era así (re-inspección 06/10/2026): las notas de la comunidad que pinta el
   * recuadro desde la receta de la familia (forma del 2208, b86a5607) están escritas para la
   * VIVIENDA, y en esta app anuncian tipos reducidos que una finca rústica no puede tener, justo
   * debajo de «Puede haber reducciones de ITP para explotaciones agrarias prioritarias y jóvenes
   * agricultores (Ley 19/1995)». Según la propia tabla del motor, TODOS los tipos reducidos de
   * Galicia y de Andalucía exigen «Vivienda habitual» (`ITP_CCAA[x].tiposReducidos[].condiciones`).
   *   Galicia · 100.000 € → recuadro «ITP General 8 %», tarjeta ITP 8.000,00 € (correcta), y la nota
   *   «Galicia: Tipo reducido 3 % muy favorable para jóvenes y colectivos vulnerables.» → esperado:
   *   la nota dice que ese 3 % es de la vivienda habitual (o no se pinta para una finca) · obtenido:
   *   ni una palabra de vivienda; un joven que compra tierra lee que podría pagar 3.000 € en vez de
   *   8.000 €. Andalucía, lo mismo con «Bonificación del 3,5 % para colectivos vulnerables y zonas
   *   despobladas».
   */
  test('Galicia y Andalucía: la nota de la comunidad dice que sus tipos reducidos son de la vivienda habitual', async ({ page }) => {
    for (const c of ['galicia', 'andalucia'] as const) {
      expect(
        ITP_CCAA[c].tiposReducidos.every((r) => r.condiciones.some((cond) => /vivienda habitual/i.test(cond))),
      ).toBe(true);
    }
    await abrirHidratada(page);
    await sembrarValor(page, CAMPO_PRECIO, '100000');
    for (const [c, anuncio] of [
      ['galicia', 'Tipo reducido del 3'],
      ['andalucia', 'Tipo reducido del 3,5'],
    ] as const) {
      await page.selectOption('#select-ccaa', c);
      const notas = await notasRecuadro(page);
      // Preparación (pasa): la nota de la Ley 19/1995 y la de la comunidad, una al lado de la otra.
      expect(notas.some((n) => n.includes('jóvenes agricultores (Ley 19/1995)'))).toBe(true);
      const ficha = notas.find((n) => n.startsWith(`${ITP_CCAA[c].nombre}:`)) ?? '';
      expect(ficha).toContain(anuncio);
      // El defecto que fue: el tipo reducido se anunciaba sin su condición de vivienda habitual.
      expect(ficha).toMatch(/vivienda habitual/i);
    }
  });

  /**
   * REPARADO el 06/10/2026 (hallazgo 2921, Canarias): la nota se queda en «Exención total para
   * VPO.», sin comparativa. Era así (re-inspección 06/10/2026); la misma forma que el hallazgo 2915 de
   * nave-industrial, medida aquí con su caso. La nota de Canarias (data/itp-ccaa.ts:390) es de la
   * vivienda: en esta app, la finca rústica paga en el País Vasco el 7 % (`tipoNoVivienda`, NF
   * 1/2011 de Bizkaia, art. 13.a), MÁS que en Canarias (6,5 %), y la propia app lo rotula.
   *   Canarias · 100.000 € → esperado: la nota no pone al País Vasco entre los ITP más bajos ·
   *   obtenido «Canarias: ITP más bajo de España junto con País Vasco y Madrid. Exención total para
   *   VPO.», con «ITP General 6,5 %» en Canarias y «ITP General 7 %» en el País Vasco (y 6 % en
   *   Navarra, 3 % efectivo en Ceuta y Melilla).
   */
  test('Canarias: la nota no pone al País Vasco entre los ITP más bajos, que a la finca le cobra el 7 %', async ({ page }) => {
    await abrirHidratada(page);
    await sembrarValor(page, CAMPO_PRECIO, '100000');
    await page.selectOption('#select-ccaa', 'pais-vasco');
    expect((await lineasPanelCcaa(page)).map(sinEspacioPct)).toContain('ITP General 7%');
    expect(await valorTarjeta(page, 'ITP (')).toBe('7000,00 €');
    await page.selectOption('#select-ccaa', 'canarias');
    expect((await lineasPanelCcaa(page)).map(sinEspacioPct)).toContain('ITP General 6,5%');
    expect(await valorTarjeta(page, 'ITP (')).toBe('6500,00 €');
    const ficha = (await notasRecuadro(page)).find((n) => n.startsWith('Canarias:')) ?? '';
    expect(ficha).not.toBe('');
    // El defecto que fue.
    expect(ficha).not.toMatch(/más bajo de España junto con País Vasco/);
  });

  /**
   * REPARADO el 06/10/2026 (hallazgo 2921, Andalucía): la nota dice «Tipo reducido del 3,5 %».
   * Era así: la otra mitad del mismo hallazgo (forma del 2917 de la gemela
   * solar, medida aquí con su caso): la nota de Andalucía llama «Bonificación del 3,5 %» a lo que
   * la tabla de la que sale declara TIPO reducido del 3,5 % (`ITP_CCAA.andalucia.tiposReducidos`,
   * `tipo: 3.5`). Una bonificación del 3,5 % de la cuota dejaría el 7 % en el 6,755 %, no en el 3,5 %.
   *   Andalucía · 100.000 € → esperado «tipo reducido del 3,5 %» · obtenido «Andalucía: Bonificación
   *   del 3,5 % para colectivos vulnerables y zonas despobladas.»
   */
  test('Andalucía: la nota llama tipo reducido al 3,5 %, no «bonificación»', async ({ page }) => {
    expect(ITP_CCAA['andalucia'].tiposReducidos.filter((r) => r.tipo === 3.5).length).toBeGreaterThan(0);
    await abrirHidratada(page);
    await sembrarValor(page, CAMPO_PRECIO, '100000');
    await page.selectOption('#select-ccaa', 'andalucia');
    expect(await valorTarjeta(page, 'ITP (')).toBe('7000,00 €');
    const ficha = (await notasRecuadro(page)).find((n) => n.startsWith('Andalucía:')) ?? '';
    expect(ficha).toContain('Tipo reducido del 3,5');
    // El defecto que fue.
    expect(ficha).not.toMatch(/Bonificación del 3,5/);
  });

  /**
   * REPARADO el 06/10/2026 (hallazgo 2922): «Con renuncia a la exención del IVA» (del IGIC, del
   * IPSI). Era así (contenido, bajo) — re-inspección 06/10/2026. El botón del régimen decía «Con renuncia a
   * la exención IVA» (sin artículo; «IGIC» e «IPSI» en Canarias, Ceuta y Melilla), mientras el
   * hero, la FAQ y el aviso dicen «renuncia a la exención de IVA». Su nombre accesible queda «Con
   * renuncia a la exención IVA IVA 21 % (ISP) + AJD».
   *   Madrid → esperado «Con renuncia a la exención del IVA» (o «de IVA») · obtenido «…exención IVA».
   * OJO al repararlo: «REPARADO 1605» busca hoy el botón por /Con renuncia a la exención IGIC/ y
   * /Con renuncia a la exención IVA/: hay que ajustar esas dos expresiones.
   */
  test('el botón dice «Con renuncia a la exención del IVA», con artículo', async ({ page }) => {
    await abrirHidratada(page);
    const boton = page.getByRole('button', { name: /renuncia a la exención/i });
    await expect(boton).toHaveCount(1);
    // El defecto que fue.
    await expect(boton).toContainText(/exención (del|de) IVA/, { timeout: 2000 });
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// INSPECTOR 08/10/2026 — la familia «Compraventa inmobiliaria» entera, una hermana por agente
// (referencia: estimador-compraventa-inmueble · testigo: tests/familias/compraventa.spec.ts, 82/82
// en verde ese día). Único cambio de código desde la re-inspección del 06/10: 99e1ee7e, las
// relacionadas resueltas en el servidor (`<ConRelacionadas slug>` en layout.tsx).
//
// Cifras a mano ANTES de abrir la app, ninguna de memoria:
//  - ITP: `TIPOS_ITP_CCAA_2025` (data/fiscal/inmuebles.ts) — Castilla-La Mancha 9, sin escala ni
//    umbral en `ITP_CCAA`; Ceuta 6 (excepción declarada en data/itp-ccaa.ts) con la bonificación
//    del 50 % de `aplicarBonificacionCiudad` (art. 57 bis TRLITPAJD).
//  - AJD de la renuncia: `ITP_CCAA[x].ajd` (Castilla-La Mancha 1,5) y `ajdRenuncia` (Valencia 2;
//    Ley 13/1997, art. 14). IVA: `PORCENTAJES_IVA.general` = 21.
//  - Notaría y registro: calculados a mano y coincidentes (CLM 125.000 €: arancel 308,306895 ×
//    1,21 × 1,75 = 652,84 · registro 161,363382 × 1,21 = 195,25; Valencia 7.000.000 €: 2.181,672142
//    × 1,21 × 1,75 = 4619,69 · 1.595,3284555 × 1,21 = 1930,35; Ceuta 45.000 €, sin IVA: 220,75629
//    × 1,75 = 386,32 · 93,81), pero NO se fijan: los hallazgos 2901 y 2902 (rebaja del 5 % de los
//    dos aranceles, abiertos en la referencia) los moverán. Los totales se comprueban como suma de
//    lo que se ve y restando esas dos líneas de la pantalla.
//
// Con `VER_HUECOS=1 npx playwright test <este fichero>` los seis hallazgos de esta sección dejan de
// estar marcados y la salida enseña lo que la app publica frente a lo esperado.
// ═══════════════════════════════════════════════════════════════════════════════

const I08_VER_HUECOS = Boolean(process.env.VER_HUECOS);

/** El texto de los avisos de la renuncia (o de su ausencia en Ceuta y Melilla). */
async function i08AvisosRenuncia(page: Page): Promise<string[]> {
  return (await page.locator('[class*="renunciaAviso"]').allInnerTexts()).map((t) => t.replace(/\s+/g, ' ').trim());
}

/** La ficha de la comunidad: la nota del recuadro que empieza por su nombre. */
async function i08Ficha(page: Page, ccaa: keyof typeof ITP_CCAA) {
  const ficha = page.locator('[class*="infoCcaaNote"]', { hasText: `${ITP_CCAA[ccaa].nombre}:` }).last();
  await expect(ficha).toHaveCount(1);
  return ficha;
}

test.describe('Inspector 08/10/2026 — Castilla-La Mancha, la renuncia valenciana a 7 millones, Ceuta y las notas de la comunidad', () => {
  test.describe.configure({ timeout: 60_000 });

  /**
   * CASO 1 (NORMAL) — Castilla-La Mancha, 125.000 €, gestoría 350 €. Ninguna ronda había pisado
   * esta comunidad.
   *   a) Compra habitual: ITP = 125.000 × 9 % = 11.250,00 € (9,00 %). Total − notaría − registro =
   *      11.250 + 350 = 11.600,00 · coste − total = 125.000,00. Recuadro: ITP 9 %, AJD de la
   *      renuncia 1,5 % (el general: sin `ajdRenuncia`), IVA 21 %.
   *   b) Renuncia: IVA 125.000 × 21 % = 26.250,00 · AJD 125.000 × 1,5 % = 1.875,00 · ningún ITP.
   *      Total − notaría − registro = 26.250 + 1.875 + 350 = 28.475,00.
   *   (Medido el 08/10/2026: total a) 12.448,09 y coste 137.448,09; b) 29.323,09 y 154.323,09.)
   */
  test('CASO 1 (normal) — Castilla-La Mancha, 125.000 €: ITP 9 % y, con renuncia, IVA 21 % + AJD 1,5 %', async ({ page }) => {
    expect(TIPOS_ITP_CCAA_2025.find((t) => t.ccaa === 'Castilla-La Mancha')?.tipo).toBe(9);
    expect(ITP_CCAA['castilla-mancha'].tramosProgresivos).toBeUndefined();
    expect(ITP_CCAA['castilla-mancha'].umbralTipoUnico).toBeUndefined();
    expect(ITP_CCAA['castilla-mancha'].ajd).toBe(1.5);
    expect(ITP_CCAA['castilla-mancha'].ajdRenuncia).toBeUndefined();
    expect(PORCENTAJES_IVA.general).toBe(21);

    await abrirHidratada(page);
    await page.selectOption('#select-ccaa', 'castilla-mancha');
    await sembrarValor(page, CAMPO_PRECIO, '125000');
    await sembrarValor(page, CAMPO_GESTORIA, '350');

    // a) Compra habitual.
    expect(sinEspacioPct(await rotuloTarjeta(page, /^ITP \(/))).toBe('ITP (9,00%)');
    expect(await valorTarjeta(page, 'ITP (')).toBe('11.250,00 €');
    expect(await valorTarjeta(page, 'Gastos de gestoría')).toBe('350,00 €');
    await expect(page.locator('h3', { hasText: /^(AJD|IVA)/ })).toHaveCount(0);
    expect((await lineasPanelCcaa(page)).map(sinEspacioPct)).toEqual(['ITP General 9%', 'AJD (renuncia) 1,5%', 'IVA (renuncia) 21%']);
    let lineas = [
      await importe(page, 'ITP ('),
      await importe(page, 'Gastos de notaría'),
      await importe(page, 'Registro de la Propiedad'),
      await importe(page, 'Gastos de gestoría'),
    ];
    let total = await importe(page, 'Total gastos adicionales');
    expect(total).toBeCloseTo(lineas.reduce((a, b) => a + b, 0), 2);
    expect(total - lineas[1] - lineas[2]).toBeCloseTo(11600, 2);
    expect(await rotuloTarjeta(page, /^COSTE TOTAL/)).toBe('COSTE TOTAL DE ADQUISICIÓN');
    expect(await descripcionTarjeta(page, 'COSTE TOTAL')).toBe('Precio + todos los gastos de la operación');
    expect((await importe(page, 'COSTE TOTAL')) - total).toBeCloseTo(125000, 2);

    // b) Renuncia.
    await page.getByRole('button', { name: /renuncia a la exención/i }).click();
    await expect(page.locator('h3', { hasText: /^ITP/ })).toHaveCount(0);
    expect(sinEspacioPct(await rotuloTarjeta(page, /^IVA \(/))).toBe('IVA (renuncia · ISP) (21,00%)');
    expect(await valorTarjeta(page, 'IVA (')).toBe('26.250,00 €');
    expect(sinEspacioPct(await rotuloTarjeta(page, /^AJD \(/))).toBe('AJD (1,50%)');
    expect(await valorTarjeta(page, 'AJD (')).toBe('1875,00 €');
    lineas = [
      await importe(page, 'IVA ('),
      await importe(page, 'AJD ('),
      await importe(page, 'Gastos de notaría'),
      await importe(page, 'Registro de la Propiedad'),
      await importe(page, 'Gastos de gestoría'),
    ];
    total = await importe(page, 'Total gastos adicionales');
    expect(total).toBeCloseTo(lineas.reduce((a, b) => a + b, 0), 2);
    expect(total - lineas[2] - lineas[3]).toBeCloseTo(28475, 2);
    expect((await importe(page, 'COSTE TOTAL')) - total).toBeCloseTo(125000, 2);
    expect(await descripcionTarjeta(page, 'COSTE TOTAL')).toBe('Precio + todos los gastos (antes de deducir el IVA si tienes derecho)');
  });

  /**
   * CASO 2 (LÍMITE) — Comunitat Valenciana con renuncia, 7.000.000 €: el AJD propio de la renuncia
   * (2 %), la notaría por encima del límite del arancel (6.010.121,04 €) y el invariante de la
   * familia con la gestoría.
   *   IVA 7.000.000 × 21 % = 1.470.000,00 · AJD 7.000.000 × 2 % = 140.000,00 (2,00 %).
   *   Gestoría 500 → total − notaría − registro = 1.610.500,00; con «2.000.50» = 1.610.000,00: la
   *   cifra publicada BAJA 500 € y el aviso tiene que decir que el coste real será MAYOR.
   */
  test('CASO 2 (límite) — Valencia con renuncia, 7.000.000 €: AJD del 2 %, notaría de libre acuerdo y la gestoría ilegible con su dirección', async ({ page }) => {
    expect(ITP_CCAA['valencia'].ajdRenuncia).toBe(2);

    await abrirHidratada(page);
    await page.selectOption('#select-ccaa', 'valencia');
    await page.getByRole('button', { name: /renuncia a la exención/i }).click();
    await sembrarValor(page, CAMPO_PRECIO, '7.000.000');
    await sembrarValor(page, CAMPO_GESTORIA, '500');

    expect(await valorTarjeta(page, 'IVA (')).toBe('1.470.000,00 €');
    expect(sinEspacioPct(await rotuloTarjeta(page, /^AJD \(/))).toBe('AJD (2,00%)');
    expect(await valorTarjeta(page, 'AJD (')).toBe('140.000,00 €');
    const notaria = await importe(page, 'Gastos de notaría');
    const registro = await importe(page, 'Registro de la Propiedad');
    const conDato = await importe(page, 'COSTE TOTAL');
    expect((await importe(page, 'Total gastos adicionales')) - notaria - registro).toBeCloseTo(1610500, 2);
    expect(await rotuloTarjeta(page, /^COSTE TOTAL/)).toBe('COSTE TOTAL (PARCIAL)');

    await sembrarValor(page, CAMPO_GESTORIA, '2.000.50');
    expect(await valorTarjeta(page, 'Gastos de gestoría')).toBe('Sin leer');
    expect((await importe(page, 'Total gastos adicionales')) - notaria - registro).toBeCloseTo(1610000, 2);
    // Dirección medida: sin el dato la cifra es MENOR en lo que valía la gestoría.
    expect(conDato - (await importe(page, 'COSTE TOTAL'))).toBeCloseTo(500, 2);
    expect(await rotuloTarjeta(page, /^Total gastos adicionales/)).toBe('Total gastos adicionales (parcial)');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toMatch(
      / — SIN la gestoría, que no se ha podido leer — SIN la parte de la notaría de libre acuerdo \(el valor que excede de 6\.010\.121,04 €\)$/,
    );
    expect(await descripcionTarjeta(page, 'COSTE TOTAL')).toContain(
      'el coste real será mayor (precio + gastos antes de deducir el IVA si tienes derecho)',
    );
  });

  /**
   * CASO 2b (LÍMITE) — Ceuta, 45.000 €, gestoría escrita a 0 (un dato, no un hueco). Sin renuncia
   * en el IPSI: ITP = 45.000 × 6 % × 50 % = 1.350,00 € (3,00 %). Total − notaría − registro =
   * 1.350,00 · coste − total = 45.000,00. Notaría y registro «(sin IPSI)» y cierre parcial solo por
   * esos honorarios.
   */
  test('CASO 2b (límite) — Ceuta, 45.000 € y gestoría 0: ITP bonificado al 3 % y cierre parcial solo por el IPSI de los honorarios', async ({ page }) => {
    await abrirHidratada(page);
    await page.selectOption('#select-ccaa', 'ceuta');
    await sembrarValor(page, CAMPO_PRECIO, '45000');
    await sembrarValor(page, CAMPO_GESTORIA, '0');

    await expect(page.getByRole('button', { name: /renuncia a la exención/i })).toBeDisabled();
    expect(sinEspacioPct(await rotuloTarjeta(page, /^ITP \(/))).toBe('ITP (3,00%)');
    expect(await valorTarjeta(page, 'ITP (')).toBe('1350,00 €');
    await expect(page.locator('h3', { hasText: 'Gastos de gestoría' })).toHaveCount(0);
    await expect(page.locator('h3', { hasText: 'Gastos de notaría (sin IPSI)' })).toHaveCount(1);
    await expect(page.locator('h3', { hasText: 'Registro de la Propiedad (sin IPSI)' })).toHaveCount(1);
    const total = await importe(page, 'Total gastos adicionales');
    expect(total - (await importe(page, 'Gastos de notaría')) - (await importe(page, 'Registro de la Propiedad'))).toBeCloseTo(1350, 2);
    expect((await importe(page, 'COSTE TOTAL')) - total).toBeCloseTo(45000, 2);
    expect((await descripcionTarjeta(page, 'Total gastos adicionales')).endsWith(`% sobre el precio de compra${sinHonorarios('IPSI')}`)).toBe(true);
    expect(await rotuloTarjeta(page, /^COSTE TOTAL/)).toBe('COSTE TOTAL (PARCIAL)');
    expect(await descripcionTarjeta(page, 'COSTE TOTAL')).toBe(SOLO_HONORARIOS('IPSI'));
  });

  /**
   * CASO 3 (RECHAZO) — tres precios que no publican desglose, cada uno con su mensaje:
   *   «,»       → ilegible: «No se ha podido leer el precio «,»…».
   *   «0,001»   → legible pero 0,00 € al céntimo: «se queda en 0,00 € al céntimo, y tiene que ser
   *               mayor que 0».
   *   «-80000»  → con el foco dentro: «tiene que ser mayor que 0»; al salir, el min={0} lo deja en
   *               «0» y el mensaje lo sigue diciendo (no «Introduce…», que es el campo vacío).
   */
  test('CASO 3 (rechazo) — «,», «0,001» y «-80000» (con y sin foco) no publican cifras y dicen por qué', async ({ page }) => {
    await abrirHidratada(page);
    const marcador = page.locator('[class*="placeholder"] p');
    const sinTarjetas = () => expect(page.locator('[class*="resultados"] h3')).toHaveCount(0);

    await sembrarValor(page, CAMPO_PRECIO, ',');
    await sinTarjetas();
    await expect(marcador).toHaveText(
      'No se ha podido leer el precio «,». Introduce el precio de la finca rústica para ver el desglose de gastos, con coma decimal (80.000 o 80000,50)',
    );
    await sembrarValor(page, CAMPO_PRECIO, '0,001');
    await sinTarjetas();
    await expect(marcador).toHaveText(`El precio escrito («0,001») se queda en 0,00 € al céntimo, y ${PRECIO_NO_VALE}.`);
    await sembrarValor(page, CAMPO_PRECIO, '-80000');
    await sinTarjetas();
    await expect(marcador).toHaveText(`El precio escrito («-80000») ${PRECIO_NO_VALE}.`);
    await page.locator(CAMPO_PRECIO).focus();
    await page.locator(CAMPO_GESTORIA).focus();
    await esperarValorEnReact(page, CAMPO_PRECIO, '0');
    await sinTarjetas();
    await expect(marcador).toHaveText(`El precio escrito («0») ${PRECIO_NO_VALE}.`);
    expect(await page.locator('body').innerText()).not.toMatch(/NaN|undefined/);
  });

  /**
   * 99e1ee7e (08/10/2026) — las relacionadas las resuelve el SERVIDOR en el layout y la página
   * pinta `<RelatedApps />` sin prop. Esperado: las cuatro primeras de
   * `appRelations['simulador-gastos-compraventa-terreno-rustico']` (data/app-relations.ts; son
   * cinco y el bloque pinta cuatro: queda fuera el simulador de hipoteca), con su `#from=related-…`,
   * en el HTML servido y las MISMAS tras hidratar, sin error de hidratación (React de producción
   * los da minificados: #418, #423, #425…). Medido el 08/10/2026: 4 y 4, y la consola limpia.
   */
  test('99e1ee7e — «Apps relacionadas» pinta sus cuatro tarjetas en el HTML servido y tras hidratar, sin error de hidratación', async ({
    page,
    request,
  }) => {
    const desde = '#from=related-simulador-gastos-compraventa-terreno-rustico';
    const esperadas = [
      `/simulador-gastos-compraventa-solar/${desde}`,
      `/simulador-gastos-compraventa-local-comercial/${desde}`,
      `/estimador-compraventa-inmueble/${desde}`,
      `/simulador-gastos-compraventa-nave-industrial/${desde}`,
    ];
    const html = await (await request.get(RUTA)).text();
    const seccion = html.match(/aria-label="Aplicaciones relacionadas"[\s\S]*?<\/section>/)?.[0] ?? '';
    expect([...seccion.matchAll(/href="([^"]+)"/g)].map((m) => m[1])).toEqual(esperadas);

    const errores: string[] = [];
    page.on('console', (m) => {
      if (m.type() === 'error') errores.push(m.text());
    });
    page.on('pageerror', (e) => errores.push(e.message));
    await abrirHidratada(page);
    const tarjetas = page.locator('section[aria-label="Aplicaciones relacionadas"] a');
    await expect(tarjetas).toHaveCount(4);
    expect(await tarjetas.evaluateAll((as) => as.map((a) => a.getAttribute('href')))).toEqual(esperadas);
    expect(errores.filter((e) => /hydrat|#418|#419|#422|#423|#425/i.test(e))).toEqual([]);
  });

  /**
   * ✅ REPARADO 08/10/2026 (contenido, bajo; hallazgo 3093) — [08/10-a] la coma que cierra el inciso «que no se ha
   * podido leer» antes de «ni». Es la forma del 2958 de la referencia (sospecha (a), vista aquí el
   * 06/10 sin registrar): page.tsx une las partidas del COSTE TOTAL con `.join(' ni ')` (l. 811) y
   * el inciso se queda abierto, así que se lee como si tampoco se hubiera podido leer la parte de
   * la notaría.
   *   Valencia · renuncia · 7.000.000 € · gestoría «2.000.50» → esperado «No incluye la gestoría,
   *   que no se ha podido leer, ni la parte de la notaría de libre acuerdo: el coste real será
   *   mayor (…)» · obtenido «…que no se ha podido leer ni la parte…».
   */
  test('[08/10-a] el coste total parcial cierra con coma el inciso «que no se ha podido leer» antes de «ni»', async ({ page }) => {
    await abrirHidratada(page);
    await page.selectOption('#select-ccaa', 'valencia');
    await page.getByRole('button', { name: /renuncia a la exención/i }).click();
    await sembrarValor(page, CAMPO_PRECIO, '7000000');
    await sembrarValor(page, CAMPO_GESTORIA, '2.000.50');
    // Preparación (pasa): las dos partidas que faltan, en la frase.
    const desc = await descripcionTarjeta(page, 'COSTE TOTAL');
    expect(desc).toContain('la parte de la notaría de libre acuerdo');
    // El defecto.
    expect(desc).toBe(
      'No incluye la gestoría, que no se ha podido leer, ni la parte de la notaría de libre acuerdo: el coste real será mayor (precio + gastos antes de deducir el IVA si tienes derecho)',
    );
  });

  /**
   * ✅ REPARADO 08/10/2026 (contenido, bajo; hallazgo 3094) — [08/10-b] el nombre oficial de `ITP_CCAA.nombre` entra
   * sin artículo en frases escritas en ESTE page.tsx (forma del 3065 de local-comercial, 3077 de
   * garaje, 3081 de trastero y 3084 de nave): el aviso de Ceuta y Melilla (l. 480, `En
   * {datosCcaaActual.nombre} no rige el IVA`) y, con renuncia en Valencia, el aviso de la renuncia
   * (l. 522) y la descripción de la tarjeta del AJD (l. 716).
   *   Ceuta → esperado «En la Ciudad Autónoma de Ceuta no rige el IVA…» (o «En Ceuta…») · obtenido
   *   «En Ciudad Autónoma de Ceuta no rige el IVA, sino el IPSI…» (igual en Melilla).
   *   Valencia · renuncia → esperado «en la Comunidad Valenciana» · obtenido «Tipo propio de la
   *   renuncia a la exención en Comunidad Valenciana» y «al tipo propio de la renuncia en Comunidad
   *   Valenciana (2 %)».
   */
  test('[08/10-b] las frases de page.tsx con el nombre de la comunidad llevan su artículo', async ({ page }) => {
    await abrirHidratada(page);
    await sembrarValor(page, CAMPO_PRECIO, '45000');
    for (const [ccaa, ciudad] of [['ceuta', 'Ceuta'], ['melilla', 'Melilla']] as const) {
      await page.selectOption('#select-ccaa', ccaa);
      const avisos = await i08AvisosRenuncia(page);
      expect(avisos.some((a) => a.includes('no existe la renuncia a la exención'))).toBe(true);
      expect(avisos.join(' ')).toMatch(new RegExp(`En (la Ciudad Autónoma de ${ciudad}|${ciudad}) no rige el IVA`));
    }
    await page.selectOption('#select-ccaa', 'valencia');
    await page.getByRole('button', { name: /renuncia a la exención/i }).click();
    expect(await descripcionTarjeta(page, 'AJD (')).toBe('Tipo propio de la renuncia a la exención en la Comunidad Valenciana');
    expect((await i08AvisosRenuncia(page)).join(' ')).toContain('al tipo propio de la renuncia en la Comunidad Valenciana (2');
  });

  /**
   * ✅ REPARADO 08/10/2026 (contenido, bajo; hallazgo 3095: una constante por pregunta en metadata.ts) — [08/10-c] forma del 2968 (sospecha (d)): la FAQ
   * visible (page.tsx) y el FAQPage (metadata.ts) se escriben dos veces, y cuatro preguntas del
   * FAQPage repiten una visible con otra redacción y otra respuesta. No se contradicen, pero cada
   * una calla lo que da la otra: «¿Se paga IVA o ITP…?» (visible: la renuncia y Canarias, Ceuta y
   * Melilla) frente a «¿Qué impuesto se paga…?» (FAQPage: el rango del 6 % al 13 % y la
   * bonificación de Ceuta y Melilla); la plusvalía (el FAQPage añade el IRPF del vendedor); la
   * renuncia; y las reducciones agrarias. La reparación es UNA constante que importen las dos
   * bocas (`PREGUNTAS_FRECUENTES`, PASO 5 de /nueva-app-meskeia; como garaje).
   */
  test('[08/10-c] la FAQ visible y el FAQPage dan la misma respuesta a la misma pregunta', async ({ page }) => {
    await abrirHidratada(page);
    const { visible, ld } = await page.evaluate(() => {
      const limpio = (s: string | null | undefined) => (s ?? '').replace(/\s+/g, ' ').trim();
      const h2 = [...document.querySelectorAll('h2')].find((h) => h.textContent?.includes('Preguntas frecuentes'));
      const visible = [...(h2?.parentElement?.querySelectorAll('div > div') ?? [])].map((d) => ({
        q: limpio(d.querySelector('strong')?.textContent),
        a: limpio(d.querySelector('p')?.textContent),
      }));
      const faq = [...document.querySelectorAll('script[type="application/ld+json"]')]
        .map((s) => JSON.parse(s.textContent ?? '{}'))
        .find((j) => j['@type'] === 'FAQPage');
      const ld: { q: string; a: string }[] = (faq?.mainEntity ?? []).map(
        (q: { name: string; acceptedAnswer: { text: string } }) => ({ q: limpio(q.name), a: limpio(q.acceptedAnswer.text) }),
      );
      return { visible, ld };
    });
    // Preparación (pasa): las dos bocas existen y la de escriturar ya es una sola respuesta.
    expect(visible.length).toBeGreaterThanOrEqual(5);
    expect(ld.length).toBeGreaterThanOrEqual(5);
    expect(visible[0]).toEqual(ld[0]);
    const temas = [/impuesto se paga|IVA o ITP/i, /plusvalía municipal/i, /renuncia a la exención|Puede aplicarse IVA/i, /reducciones de ITP/i];
    for (const tema of temas) {
      const v = visible.find((x) => tema.test(x.q));
      const j = ld.find((x) => tema.test(x.q));
      expect(v, String(tema)).toBeTruthy();
      expect(j, String(tema)).toBeTruthy();
      // El defecto: la misma pregunta con dos respuestas escritas aparte.
      expect(v?.a, String(tema)).toBe(j?.a);
    }
  });

  /**
   * ✅ REPARADO 08/10/2026 (contenido, medio; hallazgo 3096: las seis notas dicen «en la vivienda habitual») — [08/10-d] la reparación del 2920 (06/10) se quedó en
   * Galicia y Andalucía. Las fichas de Asturias, Cataluña y Extremadura (data/itp-ccaa.ts) siguen
   * anunciando en esta app de fincas tipos reducidos que, según la propia tabla del motor, son de la
   * VIVIENDA (todos sus `tiposReducidos` llevan «Vivienda habitual» o VPO), sin decirlo, debajo de
   * «Puede haber reducciones de ITP para … jóvenes agricultores».
   *   Asturias · 100.000 € → ITP (8,00 %) 8000,00 € (correcto) · esperado: la ficha dice que el 4 %
   *   es de la vivienda habitual (o no se pinta para una finca) · obtenido «Asturias: Escala
   *   progresiva. Tipo reducido 4 % ampliado a familias monoparentales desde 2025.». Cataluña:
   *   «Tipo reducido 5 % para colectivos específicos, con el límite de edad de los jóvenes en 35
   *   años…» (ITP 10.000,00). Extremadura: «los tipos reducidos para jóvenes/familia numerosa varían
   *   entre fuentes (7 %, 6,4 %… o 3 %)».
   * Aragón tiene la misma forma en su 12,5 % del art. 121-4 (sus tres reducidos llevan «Vivienda
   * habitual»), pero no entra en el caso: su familia numerosa rural remite a «los mismos requisitos
   * del art. 121-5» sin la palabra, y el ancla del test es literal.
   */
  test('[08/10-d] las fichas de Asturias, Cataluña y Extremadura dicen que sus reducidos son de la vivienda', async ({ page }) => {
    const casos = [
      // Anclas reescritas con la reparación del 08/10/2026 (3096): las notas dicen «de la vivienda».
      ['asturias', '8000,00 €', 'Tipo reducido del 4'],
      ['cataluna', '10.000,00 €', 'Tipo reducido del 5'],
      ['extremadura', '8000,00 €', 'tipos reducidos de la vivienda habitual para jóvenes'],
    ] as const;
    for (const [c] of casos) {
      expect(ITP_CCAA[c].tiposReducidos.every((r) => r.condiciones.some((cond) => /vivienda|VPO/i.test(cond))), c).toBe(true);
    }
    await abrirHidratada(page);
    await sembrarValor(page, CAMPO_PRECIO, '100000');
    for (const [c, itp, anuncio] of casos) {
      await page.selectOption('#select-ccaa', c);
      expect(await valorTarjeta(page, 'ITP ('), c).toBe(itp);
      const notas = await notasRecuadro(page);
      expect(notas.some((n) => n.includes('jóvenes agricultores (Ley 19/1995)'))).toBe(true);
      const ficha = (await (await i08Ficha(page, c)).innerText()).replace(/\s+/g, ' ');
      expect(ficha, c).toContain(anuncio);
      // El defecto: el reducido se anuncia sin su condición de vivienda.
      expect(ficha, c).toMatch(/vivienda/i);
    }
  });

  /**
   * ✅ REPARADO 08/10/2026 (accesibilidad, bajo; hallazgo 3097: el emoji sale de las notas de data/) — [08/10-e] el «⚠️» que llevan dentro las fichas de
   * Aragón, Cataluña, Extremadura y La Rioja (texto de `ITP_CCAA[x].notas`) se pinta como texto,
   * sin `<span aria-hidden="true">` (CLAUDE.md global §5, regla 3; forma del 3083 de trastero, que
   * era un literal del page.tsx). El lector de pantalla lo anuncia en mitad de la nota y
   * check:a11y-jsx no lo ve porque viaja en un string de data/.
   *   Aragón · 100.000 € → esperado: el emoji fuera del árbol accesible · obtenido ariaSnapshot
   *   «- text: "Aragón aplica bonificaciones … ⚠️ Esta app no calcula dos casos que sí existen…"».
   */
  test('[08/10-e] el «⚠️» de las fichas de la comunidad no llega al lector de pantalla', async ({ page }) => {
    await abrirHidratada(page);
    for (const c of ['aragon', 'cataluna', 'extremadura', 'rioja'] as const) {
      // Reparado en el origen: un string de data/ no puede ocultar el emoji al lector de pantalla.
      expect(ITP_CCAA[c].notas, c).not.toContain('⚠️');
      await page.selectOption('#select-ccaa', c);
      const ficha = await i08Ficha(page, c);
      // La frase que llevaba el emoji sigue en la ficha, ya sin él.
      const frase = { aragon: 'Esta app no calcula', cataluna: 'La ATC reconoce', extremadura: 'Dato orientativo', rioja: 'Dato orientativo' }[c];
      await expect(ficha, c).toContainText(frase);
      // El defecto: el emoji forma parte del texto accesible.
      expect(await ficha.ariaSnapshot(), c).not.toContain('⚠️');
    }
  });

  /**
   * ✅ REPARADO 08/10/2026 (dato, bajo; hallazgo 3098: la lista vive en data/itp-ccaa.ts) — [08/10-f] dónde NO existe la renuncia a la exención es un
   * dato normativo (Ley 8/1991 del IPSI, arts. 7 y 20.3, decidido contra el BOE el 24/09/2026) y
   * está tecleado en la página: `const TERRITORIOS_SIN_RENUNCIA = ['ceuta', 'melilla']`
   * (page.tsx:163), mientras su gemelo `TERRITORIOS_SIN_IVA` vive en data/itp-ccaa.ts. Es la línea
   * que ya cita el 3088 de nave («vistas por grep y sin medir»): aquí medida. Hoy la app se
   * comporta bien (preparación); el riesgo es que las tres copias diverjan.
   */
  test('[08/10-f] la lista de territorios sin renuncia se importa de data/, no se teclea en page.tsx', async ({ page }) => {
    // Preparación (pasa): el comportamiento es el correcto.
    await abrirHidratada(page);
    const renuncia = page.getByRole('button', { name: /renuncia a la exención/i });
    for (const [c, desactivado] of [['ceuta', true], ['melilla', true], ['canarias', false], ['madrid', false]] as const) {
      await page.selectOption('#select-ccaa', c);
      if (desactivado) await expect(renuncia, c).toBeDisabled();
      else await expect(renuncia, c).toBeEnabled();
    }
    const { readFileSync } = await import('node:fs');
    const { join } = await import('node:path');
    const fuente = readFileSync(join(process.cwd(), 'app', 'simulador-gastos-compraventa-terreno-rustico', 'page.tsx'), 'utf8');
    // El defecto.
    expect(fuente).not.toMatch(/const\s+TERRITORIOS_SIN_RENUNCIA\b[^=]*=\s*\[/);
  });
});
