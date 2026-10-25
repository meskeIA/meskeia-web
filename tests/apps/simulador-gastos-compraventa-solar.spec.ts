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
 *  - El 21 % de IVA sobre honorarios va dentro de `calcularArancelNotarial` y `calcularRegistro`,
 *    salvo en Canarias, Ceuta y Melilla (`honorariosLlevanIVA`, desde el 26/09/2026).
 *  - Fecha y fuente que la página declara → `FISCAL_INMUEBLES_META` (verificado 2026-06-17,
 *    vigencia 2026).
 *
 * Los tres casos están resueltos a mano ANTES de ejecutar la app, con los aranceles notarial
 * y registral recalculados tramo a tramo por un script propio que NO llama al código de la
 * app; el desarrollo va comentado junto a cada aserción, con los importes sin redondear.
 *
 * HALLAZGOS: a 25/10/2026 hay tres ABIERTOS, con `test.fail()` en el último bloque ([25/10-a] la
 * retención del 3 % que calla la salvedad del no residente, [25/10-b] la caída de la página traducida al
 * salir de Ceuta o Melilla y [25/10-c] el recuadro traducido que se queda con la comunidad anterior),
 * más dos de componentes compartidos registrados en otra app de la familia (3493 y 3498).
 * A 21/10/2026 se sumó uno, [21/10-a] (las notas de comunidad con ranking o
 * calificativo), reparado en b8d8bff5 y ya sin `test.fail()`. Los tres del 13/10 ([13/10-a] a
 * [13/10-c], hallazgos 3267-3269) se REPARARON el 21/10/2026 y quedan como regresión, sin marca:
 * la tarjeta «Promotora compra suelo para construir» da el
 * IVA por deducible sin condición —residuo del 3089—, el FAQPage de la finca rústica sin la
 * renuncia del art. 20.Dos LIVA y la plusvalía «no es un coste del comprador» sin el sustituto del
 * art. 106.2 TRLRHL). Los cuatro del Inspector del 08/10/2026 ([08/10-a] a [08/10-d], hallazgos
 * 3089-3092: la coma antes de «ni», el nombre de Ceuta y Melilla sin artículo, cuatro preguntas de
 * la FAQ escritas dos veces y el IVA deducible sin «no exenta») se REPARARON ese mismo día y quedan
 * como regresión, sin marca. Los cuatro de la re-inspección del 06/10/2026 (2916-2919: el pegado que NumberInput
 * descartaba, la nota de Canarias, el FAQPage sin IGIC/IPSI y el ITP «al tipo general») se
 * repararon ese mismo día y quedaron como regresión, sin marca. Ninguno a 26/09/2026 (tarde): los de ese día
 * (2208-2213) están reparados y sin marca en el describe «Reparación 26/09/2026», con la receta de la familia
 * (notaría y registro sin IVA en Canarias, Ceuta y Melilla, 2214; foco del select, 2215). Los
 * casos anteriores con esas comunidades se recalcularon a mano (líneas ÷ 1,21), y los lectores
 * de tarjeta comparan cifras con el «%» pegado (`pegarPct`) y apartan la salvedad del AJD
 * (`sinAvisoBaseAjd`), que tiene su propio caso.
 */
import { test, expect, type Page } from '@playwright/test';
import { IVA_INMUEBLES_2025 } from '../../data/fiscal/inmuebles';
import { FISCAL_IVA_META, PORCENTAJES_IVA } from '../../data/fiscal/iva';
import { ITP_CCAA, LIMITE_ARANCEL_NOTARIAL, RANGO_AJD_OTROS, RANGO_ITP_OTROS } from '../../data/itp-ccaa';
import { esperarHidratacion, sembrarValor, esperarValorEnReact } from './_hidratacion';
// Re-inspección del 26/09/2026 (bloques del final del fichero).
import { BONIFICACION_CUOTA_CEUTA_MELILLA, FACTURA_NOTARIAL, REGISTRO_CONCEPTOS } from '../../data/itp-ccaa';
// Re-inspección del 06/10/2026 (último bloque).
import { parseSpanishNumber } from '../../lib/formatters';
// Inspector del 25/10/2026 (último bloque): la salvedad del no residente, que desde aa47727a vive en
// data/itp-ccaa.ts y la app reexporta.
import { SALVEDAD_PLUSVALIA_NO_RESIDENTE } from '../../data/itp-ccaa';

const RUTA = '/simulador-gastos-compraventa-solar/';

const PRECIO = 'Precio de compra del solar';
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
 * El marcador del panel cuando no hay cifra que publicar. Desde el 26/09/2026 (hallazgo 2213,
 * patrón 5 de la familia) distingue tres estados: el campo VACÍO («Introduce el precio…»), el
 * ILEGIBLE («No se ha podido leer…», que conserva esa frase detrás) y el LEGIBLE PERO IMPOSIBLE
 * —0, negativo o un importe que se pinta 0,00 €—, que dice que tiene que ser mayor que 0. Los
 * casos antiguos que solo miran que no haya desglose aceptan cualquiera de los tres.
 */
const MARCADOR_SIN_CIFRA =
  /Introduce el precio del solar para ver el desglose de gastos|tiene que ser mayor que 0: corrígelo para ver el desglose de gastos del solar/;
const PRECIO_NO_VALE = 'tiene que ser mayor que 0: corrígelo para ver el desglose de gastos del solar';
/**
 * Desde el 26/09/2026 (tarde) el cierre es PARCIAL en Canarias, Ceuta y Melilla aunque la
 * operación pague ITP: a la notaría y el registro les falta su IGIC o IPSI (criterio del
 * estimador, el garaje y el trastero). El total lo dice con esta línea.
 */
const sinHonorarios = (imp: 'IGIC' | 'IPSI') =>
  ` — SIN el ${imp} de las facturas de notaría y registro, que tampoco se calcula`;
const SOLO_HONORARIOS = (imp: 'IGIC' | 'IPSI') =>
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
    //   tramo 1 (hasta 6.010,12 €)                →                         90,151816
    //   tramo 2 (6.010,12→30.050,61, 0,45 %)      → 24.040,49 × 0,0045 =    108,182205
    //   tramo 3 (30.050,61→60.101,21, 0,15 %)     → 30.050,60 × 0,0015 =     45,075900
    //   tramo 4 (60.101,21→120.000, 0,10 %)       → 59.898,79 × 0,0010 =     59,898790
    //   escala del nº 2.1                         =                        303,308711
    //   rebaja del 5 % del nº 2.1 (17/10/2026, cabo C0209) × 0,95 =        288,143275
    //   con el 21 % de IVA                        = × 1,21 =               348,653363
    // FACTURA_NOTARIAL: ×1,5 = 522,980045 · ×2 = 697,306726 · punto medio = 610,143385
    // (sin la rebaja: 642,25 · 550,50 · 734,00)
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('610,14 €');
    const notaria = await descripcionTarjeta(page, 'Gastos de notaría');
    expect(notaria).toContain('522,98 €');
    expect(notaria).toContain('697,31 €');

    // Registro — RD 1427/1989, número 2 (ARANCELES_REGISTRO):
    //   tramo 1                                   →                         24,040484
    //   tramo 2 (0,175 %)                         → 24.040,49 × 0,00175 =   42,0708575
    //   tramo 3 (0,125 %)                         → 30.050,60 × 0,00125 =     37,56325
    //   tramo 4 (0,075 %)                         → 59.898,79 × 0,00075 =  44,9240925
    //   suma (muy por debajo del tope 2.181,673939) =                       148,598684
    //   × 0,95 (rebaja del nº 2.1)                =                        141,168750
    //   + presentación 6,010121 + nota simple 3,005061 (sin rebaja) =     150,183932
    //   con el 21 % de IVA                        = × 1,21 =              181,722558
    //   (sin la rebaja, 190,71)
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('181,72 €');

    expect(await valorTarjeta(page, 'Gastos de gestoría')).toBe('500,00 €');

    // Total gastos = 7.200 + 610,14 + 181,72 + 500 = 8.491,86
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('8491,86 €');
    // 8.491,86 / 120.000 = 7,07655 % → «7,08%»
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toContain('7,08%');

    // Coste total = 120.000 + 8.491,86 = 128.491,86
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('128.491,86 €');

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

    await expect(page.getByText(/escala progresiva \(8\s% → 9\s% → 10\s% → 12\s% → 13\s%\)/)).toBeVisible();
    expect(await valorTarjeta(page, 'ITP (')).toBe('275.000,00 €');
    expect(await rotuloTarjeta(page, /^ITP \(/)).toBe('ITP (11,00%)');

    // Notaría — arancel(2.500.000):
    //   90,151816 + 108,182205 + 45,0759 + 90,15182 (tramo 4 completo)
    //   + tramo 5 (150.253,03→601.012,10, 0,05 %) → 450.759,07 × 0,0005 = 225,379535
    //   + tramo 6 (601.012,10→2.500.000, 0,03 %)  → 1.898.987,90 × 0,0003 = 569,69637
    //   escala = 1.128,637646 · × 0,95 (rebaja del nº 2.1, cabo C0209) = 1.072,205764 ·
    //   con IVA = 1.297,368974
    //   ×1,5 = 1.946,053461 · ×2 = 2.594,737948 · punto medio = 2.270,395704
    //   (sin la rebaja: 2.389,89 · 2.048,47 · 2.731,30)
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('2270,40 €');
    const notaria = await descripcionTarjeta(page, 'Gastos de notaría');
    expect(notaria).toContain('1946,05 €');
    expect(notaria).toContain('2594,74 €');

    // Registro — arancel(2.500.000):
    //   24,040484 + 42,0708575 + 37,56325 + 67,613865 (tramo 4 completo)
    //   + tramo 5 (0,030 %) → 450.759,07 × 0,0003 = 135,227721
    //   + tramo 6 (0,020 %) → 1.898.987,90 × 0,0002 = 379,79758
    //   suma = 686,313758 → SIGUE por debajo del tope REGISTRO_MAXIMO (2.181,673939)
    //   × 0,95 = 651,998070 + 6,010121 + 3,005061 = 661,013252 · con el 21 % de IVA =
    //   799,826034 (sin la rebaja, 841,35)
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('799,83 €');

    // Total gastos = 275.000 + 2.270,40 + 799,83 + 500 = 278.570,23
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('278.570,23 €');
    // 278.570,23 / 2.500.000 = 11,14281 % → «11,14%»
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toContain('11,14%');
    // Coste total = 2.500.000 + 278.570,23 = 2.778.570,23
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('2.778.570,23 €');
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
    const marcador = page.getByText(MARCADOR_SIN_CIFRA);

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
   *   escala notarial sin IVA = 90,151816 + 108,182205 + 45,0759 + 90,15182
   *                              + (300.000 − 150.253,03) × 0,0005 = 74,873485 → 408,435226
   *   × 0,95 (rebaja del nº 2.1, 17/10/2026, cabo C0209) = 388,013465
   *   con IVA = 469,496292 · ×1,5 = 704,244438 · ×2 = 938,992584 · medio = 821,618511
   *   registro sin IVA = 24,040484 + 42,0708575 + 37,56325 + 67,613865
   *                      + 149.746,97 × 0,0003 = 44,924091 → 216,212547 × 0,95 = 205,401920
   *                      + 9,015182 = 214,417102 · con IVA = 259,444694
   *   total gastos = 63.000 + 2.250 + 821,62 + 259,44 + 500 = 66.831,06
   *   coste total  = 300.000 + 66.831,06 = 366.831,06  (22,28 % sobre el precio)
   *   (sin la rebaja: 864,86 · 272,52 · 366.887,38 · 22,30 %)
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

    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('821,62 €');
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('259,44 €');
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('66.831,06 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toContain('22,28%');
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('366.831,06 €');

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
   *   ⚠️ 26/09/2026 (hallazgo 2214): en Ceuta la factura del notario y la del registro llevan
   *   IPSI, no IVA, y la app ya no les suma el 21 %: notaría 358,43341 × 1,75 = 627,258468,
   *   registro 195,2272455; total 6.000 + 627,26 + 195,23 + 500 = 7.322,49 · coste 207.322,49
   *   ⚠️ 17/10/2026 (cabo C0209): con la base del BOE y la rebaja del 5 % del nº 2.1, notaría
   *   358,435226 × 0,95 × 1,75 = 595,898564, registro 186,212547 × 0,95 + 9,015182 = 185,917102;
   *   total 6.000 + 595,90 + 185,92 + 500 = 7.281,82 · coste 207.281,82
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
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('595,90 €');
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('185,92 €');
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('7281,82 €');
    // Parcial: a los honorarios les falta el IPSI (26/09/2026, tarde).
    expect(await valorTarjeta(page, 'COSTE TOTAL (PARCIAL)')).toBe('207.281,82 €');
    expect(await descripcionTarjeta(page, 'COSTE TOTAL')).toBe(SOLO_HONORARIOS('IPSI'));
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
    // 26/09/2026 (hallazgo 2210): el IVA del solar sale de PORCENTAJES_IVA y tiene su propio
    // sello (FISCAL_IVA_META); el de inmuebles se queda con el ITP y el AJD.
    await expect(page.getByText(/ITP\/AJD 2026/)).toBeVisible();
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
    // \s casa también con el espacio duro: el «%» pegado ya no podía hacer fallar un toContain.
    expect(faq).not.toMatch(/entre el 0,5\s?% y el 1,5\s?%/);
    expect(faq).toContain('del 0,5\u00A0% al 1,5\u00A0%');
    expect(faq).not.toMatch(/el 0\s?% del Régimen foral del País Vasco/);

    // Y lo mismo en la tabla comparativa del bloque educativo (llega plegada: textContent).
    const cuerpo = pegarPct(((await page.locator('body').textContent()) ?? '').replace(/\s+/g, ' '));
    expect(cuerpo).toContain('Sí (0,5%–1,5%');
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
    // El total no debería aceptar un gasto negativo: 4.800 + 529,68 + 147,24 = 5.476,92 €
    // (80.000 €: notaría 263,308711 × 0,95 × 1,21 × 1,75 y registro (118,598684 × 0,95 +
    // 9,015182) × 1,21, con la rebaja del nº 2.1, cabo C0209; sin ella, 5.511,96 €)
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('5476,92 €');
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
    const cuerpo = pegarPct(((await page.locator('body').textContent()) ?? '').replace(/\s+/g, ' '));
    expect(cuerpo).toContain(`pagas IVA ${tipo}% + AJD`);
    expect(cuerpo).toContain(`el IVA del ${tipo}% es`);
    expect(cuerpo).toContain(`Paga IVA ${tipo}% + AJD`);

    const bloques = await page.locator('script[type="application/ld+json"]').allTextContents();
    const faq = bloques.find((b) => b.includes('FAQPage')) ?? '';
    expect(faq).toContain(`sujeta a IVA al ${tipo}\u00A0%`);
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
    await expect(page.getByText(/escala progresiva \(8\s% → 8,50\s% → 9\s% → 9,50\s% → 10\s%\)/)).toBeVisible();

    expect(await valorTarjeta(page, 'ITP (')).toBe('40.750,00 €');
    expect(await rotuloTarjeta(page, /^ITP \(/)).toBe('ITP (8,15%)');

    // Vende un particular → ni IVA ni AJD.
    await expect(page.locator('h3', { hasText: /^AJD/ })).toHaveCount(0);
    await expect(page.locator('h3', { hasText: /^IVA \(/ })).toHaveCount(0);

    // Notaría — RD 1426/1989, número 2 (ARANCELES_NOTARIO), arancel(500.000):
    //   tramo 1                                   →                          90,151816
    //   tramo 2 (0,45 %)  → 24.040,49 × 0,0045    =                         108,182205
    //   tramo 3 (0,15 %)  → 30.050,60 × 0,0015    =                          45,075900
    //   tramo 4 (0,10 %)  → 90.151,82 × 0,0010    =                          90,151820
    //   tramo 5 (0,05 %)  → 349.746,97 × 0,0005   =                         174,873485
    //   escala del nº 2.1                         =                         508,435226
    //   rebaja del 5 % del nº 2.1 (cabo C0209) × 0,95 =                     483,013465
    //   con el 21 %       = × 1,21                =                         584,446292
    // FACTURA_NOTARIAL: ×1,5 = 876,669438 · ×2 = 1.168,892584 · medio = 1.022,781011
    // (sin la rebaja: 1.076,61 · 922,81 · 1.230,41)
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('1022,78 €');
    const notaria = await descripcionTarjeta(page, 'Gastos de notaría');
    expect(notaria).toContain('876,67 €');
    expect(notaria).toContain('1168,89 €');

    // Registro — RD 1427/1989, número 2 (ARANCELES_REGISTRO), arancel(500.000):
    //   24,040484 + 42,0708575 + 37,56325 + 67,613865 + 349.746,97 × 0,0003 = 104,924091
    //   suma = 276,212547  (muy por debajo del tope REGISTRO_MAXIMO 2.181,673939)
    //   × 0,95 (rebaja del nº 2.1)                     =            262,401920
    //   + presentación 6,010121 + nota simple 3,005061 =            271,417102
    //   con el 21 %  = × 1,21                          =            328,414694 (antes 345,12)
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('328,41 €');
    expect(await valorTarjeta(page, 'Gastos de gestoría')).toBe('500,00 €');

    // Total gastos — `sumarLineasVisibles` redondea cada línea al céntimo ANTES de sumar:
    //   40.750,00 + 1.022,78 + 328,41 + 500,00 = 42.601,19
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('42.601,19 €');
    // 42.601,19 / 500.000 = 8,520238 % → «8,52%»
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toContain('8,52%');
    // Coste total = 500.000 + 42.601,19 = 542.601,19
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('542.601,19 €');
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
    //   90,151816 + 108,182205 + 45,0759 + 90,15182
    //   + tramo 5 (150.253,03 → 601.012,10, 0,05 %) → 450.759,07 × 0,0005 = 225,379535
    //   + tramo 6 (601.012,10 → 1.000.000, 0,03 %)  → 398.987,90 × 0,0003 = 119,696370
    //   escala = 678,637646 · × 0,95 (rebaja del nº 2.1, cabo C0209) = 644,705764 ·
    //   con IVA = 780,093974
    //   ×1,5 = 1.170,140961 · ×2 = 1.560,187948 · medio = 1.365,164454 (sin la rebaja, 1.437,01)
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('1365,16 €');

    // Registro — arancel(1.000.000):
    //   24,040484 + 42,0708575 + 37,56325 + 67,613865
    //   + tramo 5 (0,030 %) → 450.759,07 × 0,0003 = 135,227721
    //   + tramo 6 (0,020 %) → 398.987,90 × 0,0002 =  79,797580
    //   suma = 386,313758  (sigue bajo el tope 2.181,673939) × 0,95 = 366,998070
    //   + 9,015182 = 376,013252 · con el 21 % = 454,976034 (sin la rebaja, 478,35)
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('454,98 €');

    // Total gastos = 89.500,00 + 1.365,16 + 454,98 + 500,00 = 91.820,14
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('91.820,14 €');
    // 91.820,14 / 1.000.000 = 9,182014 % → «9,18%»
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toContain('9,18%');
    // Coste total = 1.000.000 + 91.820,14 = 1.091.820,14
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('1.091.820,14 €');
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
    const marcador = page.getByText(MARCADOR_SIN_CIFRA);

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
// HALLAZGOS de la re-inspección del 11/09/2026 (731-734): REPARADOS ese mismo día.
// Se escribieron afirmando lo que DEBÍA pasar y fallaban a propósito; reparados, quedan
// como test de regresión, igual que los del 26/08/2026 de arriba.
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('Hallazgos reparados — re-inspección 11/09/2026', () => {
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
    // \s también casa con el espacio duro: desde 2211 el texto dice «21 %» y un /21% es/
    // ya no podía fallar nunca (se vio en la re-inspección del 06/10/2026).
    await expect(page.getByText(/el IVA del 21\s?% es/)).toHaveCount(0);
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
    // 25/10/2026: el barrido se saltaba en silencio el selector que no encontraba (`continue`), así
    // que con los cuatro sin casar —un nombre de clase que cambie en el build— pasaba en verde sin
    // medir nada. Se exige que se hayan medido los cuatro.
    expect(Object.keys(medida).sort()).toEqual(
      ['[class*="catastroLink"]', '[class*="infoCcaaNombre"]', '[class*="infoCcaaValue"]', '[class*="sectionTitle"]'],
    );
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
   *   notaría: 90,151816 + 108,182205 + 45,0759 + 90,15182 + 29.746,97 × 0,05 % (14,873485)
   *            = 348,435226 × 0,95 (rebaja del nº 2.1, cabo C0209) = 331,013465 · con IVA
   *            400,526293 · ×1,5 = 600,789439 · ×2 = 801,052585 · medio = 700,921012
   *   registro: 24,040484 + 42,0708575 + 37,56325 + 67,613865 + 29.746,97 × 0,03 % (8,924091)
   *            = 180,212547 × 0,95 = 171,201920 + 9,015182 = 180,217102 · con IVA = 218,062693
   *   total = 37.800,00 + 2.160,00 + 700,92 + 218,06 + 650,00 = 41.528,98 (23,0717 %)
   *   coste total = 221.528,98
   *   (sin la rebaja: 737,81 · 632,41 · 843,21 · 228,96 · 41.576,77)
   */
  test('CASO 1 (normal) — Andalucía, promotor, 180.000 €: IVA 37.800 € + AJD 1,2 %', async ({ page }) => {
    await abrir(page, 'andalucia', 'promotor');
    await sembrarValor(page, SEL_PRECIO, '180000');
    await sembrarValor(page, SEL_GESTORIA, '650');

    await expect(rotulo(page, /^IVA \(/)).toHaveText('IVA (21,00\u00A0%)');
    await expect(valor(page, 'IVA (')).toHaveText('37.800,00 €');
    await expect(rotulo(page, /^AJD \(/)).toHaveText('AJD (1,20\u00A0%)');
    await expect(valor(page, 'AJD (')).toHaveText('2160,00 €');
    await expect(page.locator('h3', { hasText: /^ITP \(/ })).toHaveCount(0);

    await expect(valor(page, 'Gastos de notaría')).toHaveText('700,92 €');
    await expect(descripcion(page, 'Gastos de notaría')).toContainText('600,79 €');
    await expect(descripcion(page, 'Gastos de notaría')).toContainText('801,05 €');
    await expect(valor(page, 'Registro de la Propiedad')).toHaveText('218,06 €');
    await expect(valor(page, 'Gastos de gestoría')).toHaveText('650,00 €');

    await expect(valor(page, 'Total gastos adicionales')).toHaveText('41.528,98 €');
    await expect(descripcion(page, 'Total gastos adicionales')).toContainText('23,07\u00A0%');
    await expect(valor(page, 'COSTE TOTAL DE ADQUISICIÓN')).toHaveText('221.528,98 €');
    await expect(descripcion(page, 'COSTE TOTAL DE ADQUISICIÓN')).toHaveText(
      admiteAvisoAjd('Precio + todos los gastos (antes de deducir el IVA si tienes derecho)'),
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
   *   notaría: 90,151816 + 108,182205 + 45,0759 + 90,15182 + 225,379535
   *            + 1.398.987,90 × 0,03 % (419,69637) = 978,637646 × 0,95 (rebaja del nº 2.1,
   *            cabo C0209) = 929,705764 · con IVA 1.124,943974
   *            · ×1,5 = 1.687,415961 · ×2 = 2.249,887948 · medio = 1.968,651954
   *   registro: 24,040484 + 42,0708575 + 37,56325 + 67,613865 + 135,227721
   *            + 1.398.987,90 × 0,02 % (279,79758) = 586,313758 (bajo el tope 2.181,673939)
   *            × 0,95 = 556,998070 + 9,015182 = 566,013252 · con IVA = 684,876035
   *   total = 230.000,00 + 1.968,65 + 684,88 + 650,00 = 233.303,53 (11,6652 %)
   *   coste total = 2.233.303,53
   *   (sin la rebaja: 2.072,26 · 1.776,22 · 2.368,30 · 720,35 · 233.442,61)
   */
  test('CASO 2 (límite) — Cataluña, particular, 2.000.000 €: el exceso sobre 1,5 M va al 13 %', async ({ page }) => {
    await abrir(page, 'cataluna', 'particular');
    await sembrarValor(page, SEL_PRECIO, '2000000');
    await sembrarValor(page, SEL_GESTORIA, '650');

    await expect(page.getByText(/escala progresiva \(10\s% → 11\s% → 12\s% → 13\s%\)/)).toBeVisible();
    await expect(rotulo(page, /^ITP \(/)).toHaveText('ITP (11,50\u00A0%)');
    await expect(valor(page, 'ITP (')).toHaveText('230.000,00 €');
    await expect(page.locator('h3', { hasText: /^AJD/ })).toHaveCount(0);

    await expect(valor(page, 'Gastos de notaría')).toHaveText('1968,65 €');
    await expect(descripcion(page, 'Gastos de notaría')).toContainText('1687,42 €');
    await expect(descripcion(page, 'Gastos de notaría')).toContainText('2249,89 €');
    await expect(valor(page, 'Registro de la Propiedad')).toHaveText('684,88 €');
    await expect(valor(page, 'Total gastos adicionales')).toHaveText('233.303,53 €');
    await expect(descripcion(page, 'Total gastos adicionales')).toContainText('11,67\u00A0%');
    await expect(valor(page, 'COSTE TOTAL DE ADQUISICIÓN')).toHaveText('2.233.303,53 €');
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

    // 26/09/2026 (hallazgo 2213): el cero y el negativo escritos ya no «faltan»: no valen, y se dice.
    await sembrarValor(page, SEL_PRECIO, '0');
    await expect(marcador(page)).toHaveText(`El precio escrito («0») ${PRECIO_NO_VALE}.`);

    await sembrarValor(page, SEL_PRECIO, '-120000');
    await expect(marcador(page)).toHaveText(`El precio escrito («-120000») ${PRECIO_NO_VALE}.`);
    await expect(page.locator('h3', { hasText: 'COSTE TOTAL' })).toHaveCount(0);
    await page.locator(SEL_PRECIO).focus();
    await page.locator(SEL_PRECIO).blur();
    await esperarValorEnReact(page, SEL_PRECIO, '0');
    await expect(marcador(page)).toHaveText(`El precio escrito («0») ${PRECIO_NO_VALE}.`);

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
   *   ITP = 300.000 × 6 % = 18.000 · notaría 821,62 · registro 259,44 (desarrollo en el caso de
   *   Madrid 300.000 € de la inspección del 26/08; con la rebaja del nº 2.1, cabo C0209)
   *   total SIN gestoría = 18.000,00 + 821,62 + 259,44 = 19.081,06 · coste = 319.081,06
   *   (sin la rebaja, 19.137,38 y 319.137,38)
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
    await expect(valor(page, 'Total gastos adicionales')).toHaveText('19.081,06 €');
    await expect(descripcion(page, 'Total gastos adicionales')).toContainText('SIN la gestoría, que no se ha podido leer');
    // 24/09/2026 (hallazgo 1595): el título es PARCIAL, como cuando falta el IGIC. Hasta ese día
    // este test leía la tarjeta por «COSTE TOTAL DE ADQUISICIÓN», el título de una cifra
    // definitiva, y así consagraba el defecto.
    await expect(rotulo(page, /^Total gastos adicionales/)).toHaveText('Total gastos adicionales (parcial)');
    await expect(rotulo(page, /^COSTE TOTAL/)).toHaveText('COSTE TOTAL (PARCIAL)');
    await expect(valor(page, /^COSTE TOTAL/)).toHaveText('319.081,06 €');
    await expect(descripcion(page, /^COSTE TOTAL/)).toHaveText(
      admiteAvisoAjd('No incluye la gestoría, que no se ha podido leer: el coste real será mayor'),
    );

    // Cambiar de comunidad y de régimen NO lo borra: el dato sigue sin leerse.
    await page.selectOption('#select-ccaa', 'canarias');
    await page.getByRole('button', { name: /Promotor \/ Empresa/ }).click();
    await expect(valor(page, 'IGIC')).toHaveText('No calculado');
    await expect(valor(page, 'Gastos de gestoría')).toHaveText('Sin leer');
    await expect(rotulo(page, /^COSTE TOTAL/)).toHaveText('COSTE TOTAL (PARCIAL)');
    await expect(descripcion(page, /^COSTE TOTAL/)).toHaveText(
      admiteAvisoAjd('No incluye el IGIC ni la gestoría, que no se ha podido leer: el coste real será mayor'),
    );

    // Legible otra vez: el aviso de la gestoría se va y queda solo el del IGIC.
    await sembrarValor(page, SEL_GESTORIA, '500');
    // 24/09/2026: «puede ser mayor» y no «será»: el IGIC tiene tipo cero (viviendas protegidas
    // con garaje y anexos, equipamiento comunitario; Ley canaria 4/2012, arts. 52 y 58) y el
    // IPSI depende de la ordenanza de cada ciudad. Solo la gestoría ilegible autoriza el «será».
    await expect(descripcion(page, /^COSTE TOTAL/)).toHaveText(admiteAvisoAjd('No incluye el IGIC: el coste real puede ser mayor'));

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
    await expect(rotulo(page, /^AJD \(/)).toHaveText('AJD (0,25\u00A0%)');
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
      `Paga IVA ${PORCENTAJES_IVA.general}\u00A0% + AJD`,
    );
    await expect(page.locator('[class*="infoCcaaGrid"]')).toContainText(`${PORCENTAJES_IVA.general}\u00A0%`);
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
   *   IVA 63.000,00 + AJD 2.250,00 + notaría 821,62 + registro 259,44 (desarrollo en el caso
   *   de Madrid 300.000 € del 26/08; con la rebaja del nº 2.1, cabo C0209, que baja 56,32 €
   *   cada cifra de abajo)
   *   con gestoría 400 → total 66.731,06 · coste 366.731,06
   *   con «2.000.50»   → total 66.331,06 · coste 366.331,06 (−400, la gestoría fuera)
   */
  test('REPARADO 23/09 (1272, antes 23/09-D) — con la gestoría ilegible el cierre pierde la salvedad del IVA deducible', async ({ page }) => {
    await abrir(page, 'madrid', 'promotor');
    await sembrarValor(page, SEL_PRECIO, '300000');
    await sembrarValor(page, SEL_GESTORIA, '400');

    await expect(valor(page, 'COSTE TOTAL DE ADQUISICIÓN')).toHaveText('366.731,06 €');
    await expect(descripcion(page, 'COSTE TOTAL DE ADQUISICIÓN')).toContainText('antes de deducir el IVA');

    await sembrarValor(page, SEL_GESTORIA, '2.000.50');
    // 24/09/2026 (hallazgo 1595): con la gestoría ilegible la tarjeta se titula «(PARCIAL)» y se
    // lee por «COSTE TOTAL»; hasta ese día se leía por el título de la cifra definitiva.
    await expect(rotulo(page, /^COSTE TOTAL/)).toHaveText('COSTE TOTAL (PARCIAL)');
    await expect(valor(page, /^COSTE TOTAL/)).toHaveText('366.331,06 €');
    await expect(descripcion(page, /^COSTE TOTAL/)).toContainText('No incluye la gestoría');
    await expect(descripcion(page, /^COSTE TOTAL/)).toContainText('deducir el IVA');
    // Reparado (1272): el aviso se SUMA a la salvedad, en una sola frase.
    await expect(descripcion(page, /^COSTE TOTAL/)).toHaveText(
      admiteAvisoAjd('No incluye la gestoría, que no se ha podido leer: el coste real será mayor (precio + gastos antes de deducir el IVA si tienes derecho)'),
    );

    // Con un particular no hay IVA que deducir: el aviso queda solo, sin la salvedad.
    await page.getByRole('button', { name: /Un particular/ }).click();
    await expect(descripcion(page, /^COSTE TOTAL/)).toHaveText(
      admiteAvisoAjd('No incluye la gestoría, que no se ha podido leer: el coste real será mayor'),
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
      // Una sola pregunta y una sola respuesta desde el 08/10/2026 (hallazgo 3090).
      .locator('strong', { hasText: '¿Hay plusvalía municipal al comprar o vender un solar?' })
      .locator('xpath=following-sibling::p[1]');
    expect(((await faq.textContent()) ?? '').replace(/\s+/g, ' ')).toContain('la transmisión no está sujeta');

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
   *   notaría: 90,151816 + 24.040,49 × 0,45 % + 30.050,60 × 0,15 % + 90.151,82 × 0,10 %
   *            + 99.746,97 × 0,05 % = 383,435226 × 0,95 (rebaja del nº 2.1, cabo C0209) =
   *            364,263465 · con IVA 440,758792
   *            · ×1,5 = 661,14 · ×2 = 881,52 · medio ×1,75 = 771,327886 → 771,33
   *   registro: 24,040484 + 42,0708575 + 37,56325 + 67,613865 + 99.746,97 × 0,03 % (29,924091)
   *            = 201,212547 × 0,95 = 191,151920 + 9,015182 = 200,167102 · con IVA =
   *            242,202194 → 242,20
   *   total = 52.500 + 3.750 + 771,33 + 242,20 + 600 = 57.863,53 (23,1454 %)
   *   coste = 307.863,53
   *   (sin la rebaja: 811,92 · 695,93 · 927,91 · 254,37 · 57.916,29)
   */
  test('CASO 1 (normal) — Galicia, promotor, 250.000 €: IVA 52.500 € + AJD 1,5 %', async ({ page }) => {
    await abrir(page, 'galicia', 'promotor');
    await sembrarValor(page, SEL_PRECIO, '250000');
    await sembrarValor(page, SEL_GESTORIA, '600');

    await expect(rotulo(page, /^IVA \(/)).toHaveText('IVA (21,00\u00A0%)');
    await expect(valor(page, 'IVA (')).toHaveText('52.500,00 €');
    await expect(rotulo(page, /^AJD \(/)).toHaveText('AJD (1,50\u00A0%)');
    await expect(valor(page, 'AJD (')).toHaveText('3750,00 €');
    await expect(page.locator('h3', { hasText: /^ITP \(/ })).toHaveCount(0);
    await expect(valor(page, 'Gastos de notaría')).toHaveText('771,33 €');
    await expect(descripcion(page, 'Gastos de notaría')).toContainText('entre 661,14 € y 881,52 €');
    await expect(valor(page, 'Registro de la Propiedad')).toHaveText('242,20 €');
    await expect(valor(page, 'Gastos de gestoría')).toHaveText('600,00 €');
    await expect(valor(page, 'Total gastos adicionales')).toHaveText('57.863,53 €');
    await expect(descripcion(page, 'Total gastos adicionales')).toHaveText('23,15\u00A0% sobre el precio de compra');
    await expect(valor(page, 'COSTE TOTAL DE ADQUISICIÓN')).toHaveText('307.863,53 €');
    await expect(descripcion(page, 'COSTE TOTAL DE ADQUISICIÓN')).toHaveText(
      admiteAvisoAjd('Precio + todos los gastos (antes de deducir el IVA si tienes derecho)'),
    );
    // 1273 sigue reparado: con IVA en pantalla la ayuda pide el precio PACTADO.
    const idAyuda = await page.locator(SEL_PRECIO).getAttribute('aria-describedby');
    await expect(page.locator(`[id="${idAyuda}"]`)).toContainText('Precio pactado');
  });

  /**
   * CASO 2 (LÍMITE) — Madrid, vende un PARTICULAR, 12.000.000 €, gestoría 500 €. Lleva el
   * registro a su TOPE (nunca probado: el caso más alto hasta hoy, 2,5 M, quedaba por debajo).
   *   ITP = 12.000.000 × 6 % = 720.000,00 (Madrid sin escala → tipo EFECTIVO 6,00 %)
   *   registro: 306,516178 + 11.398.987,90 × 0,02 % = 2.586,313758 > tope → 2.181,673939
   *            × 0,95 (rebaja del nº 2.1, DESPUÉS del tope; cabo C0209) = 2.072,590242
   *            + 9,015182 = 2.081,605424 · con IVA = 2.518,742563 → 2.518,74 (antes 2.650,73)
   * La notaría NO se anclaba aquí: por encima de 6.010.121,04 € el RD 1426/1989 no tiene tramo
   * (hallazgo 1599, abajo). Reparado el 24/09/2026: se calcula el arancel hasta ese límite
   * (2.181,673958 × 0,95 × 1,21 × 1,75 = 4.388,709876 → 4.388,71; sin la rebaja, 4.619,69) y el
   * resto es de libre acuerdo, así que el cierre sale «(PARCIAL)»: total 720.000 + 4.388,71 +
   * 2.518,74 + 500 = 727.407,45.
   */
  test('CASO 2 (límite) — Madrid, particular, 12.000.000 €: el registro llega a su tope de 2.181,67 €', async ({ page }) => {
    const { parseSpanishNumber } = await import('../../lib/formatters');
    const euros = async (titulo: string | RegExp) =>
      parseSpanishNumber(normaliza(await valor(page, titulo).innerText()).replace(/\s?€$/, ''));

    await abrir(page, 'madrid', 'particular');
    await sembrarValor(page, SEL_PRECIO, '12000000');
    await sembrarValor(page, SEL_GESTORIA, '500');

    await expect(rotulo(page, /^ITP \(/)).toHaveText('ITP (6,00\u00A0%)');
    await expect(valor(page, 'ITP (')).toHaveText('720.000,00 €');
    await expect(page.locator('h3', { hasText: /^AJD/ })).toHaveCount(0);
    await expect(valor(page, 'Registro de la Propiedad')).toHaveText('2518,74 €');
    await expect(valor(page, 'Gastos de gestoría')).toHaveText('500,00 €');

    await expect(valor(page, 'Gastos de notaría')).toHaveText('4388,71 €');
    const lineas =
      (await euros('ITP (')) + (await euros('Gastos de notaría')) +
      (await euros('Registro de la Propiedad')) + (await euros('Gastos de gestoría'));
    expect(await euros('Total gastos adicionales')).toBeCloseTo(lineas, 2);
    await expect(valor(page, 'Total gastos adicionales')).toHaveText('727.407,45 €');
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
   *   ⚠️ 26/09/2026 (hallazgo 2214): en Ceuta la notaría y el registro van sin IVA (su factura
   *   lleva IPSI): notaría 408,43341 × 1,75 = 714,758468 · registro 225,227246
   *   → total 750 + 714,76 + 225,23 = 1.689,99 (0,5633 % → 0,56 %) · coste 301.689,99;
   *   con la gestoría legible: 2.189,99 · coste 302.189,99
   *   ⚠️ 17/10/2026 (cabo C0209): con la base del BOE y la rebaja del 5 % del nº 2.1, notaría
   *   408,435226 × 0,95 × 1,75 = 679,023564 · registro 216,212547 × 0,95 + 9,015182 = 214,417102
   *   → total 750 + 679,02 + 214,42 = 1.643,44 (0,5478 % → 0,55 %) · coste 301.643,44;
   *   con la gestoría legible: 2.143,44 · coste 302.143,44
   */
  test('CASO 3 (sin IVA) — Ceuta, promotor, 300.000 €: IPSI sin calcular, AJD bonificado, «será» solo con la gestoría ilegible', async ({ page }) => {
    await abrir(page, 'ceuta', 'promotor');
    await sembrarValor(page, SEL_PRECIO, '300000');
    await sembrarValor(page, SEL_GESTORIA, '1.500.25');

    await expect(page.getByRole('button', { name: /Promotor \/ Empresa/ })).toContainText('Paga IPSI + AJD');
    await expect(valor(page, 'IPSI')).toHaveText('No calculado');
    await expect(rotulo(page, /^AJD \(/)).toHaveText('AJD (0,25\u00A0%)');
    await expect(valor(page, 'AJD (')).toHaveText('750,00 €');
    await expect(valor(page, 'Gastos de notaría')).toHaveText('679,02 €');
    await expect(valor(page, 'Registro de la Propiedad')).toHaveText('214,42 €');
    await expect(valor(page, 'Gastos de gestoría')).toHaveText('Sin leer');
    await expect(rotulo(page, /^Total gastos adicionales/)).toHaveText('Total gastos adicionales (parcial)');
    await expect(valor(page, 'Total gastos adicionales')).toHaveText('1643,44 €');
    await expect(descripcion(page, 'Total gastos adicionales')).toHaveText(
      `0,55\u00A0% sobre el precio de compra — SIN el IPSI, que no está incluido — SIN la gestoría, que no se ha podido leer${sinHonorarios('IPSI')}`,
    );
    await expect(rotulo(page, /^COSTE TOTAL/)).toHaveText('COSTE TOTAL (PARCIAL)');
    await expect(valor(page, /^COSTE TOTAL/)).toHaveText('301.643,44 €');
    await expect(descripcion(page, /^COSTE TOTAL/)).toHaveText(
      admiteAvisoAjd('No incluye el IPSI ni la gestoría, que no se ha podido leer: el coste real será mayor'),
    );

    await sembrarValor(page, SEL_GESTORIA, '500');
    await expect(valor(page, 'Total gastos adicionales')).toHaveText('2143,44 €');
    await expect(valor(page, /^COSTE TOTAL/)).toHaveText('302.143,44 €');
    await expect(descripcion(page, /^COSTE TOTAL/)).toHaveText(admiteAvisoAjd('No incluye el IPSI: el coste real puede ser mayor'));
  });

  /**
   * Régimen × territorio en CANARIAS: el mismo desplegable con los dos botones. Con particular
   * el IGIC no pinta, y la operación va por ITP al 6,5 % (TIPOS_ITP_CCAA_2025); al pasar a
   * promotor aparece el aviso y el total se vuelve parcial; al volver, todo se restablece.
   *   particular 150.000: ITP 9.750,00 · notaría 705,78 · registro 217,94 · gestoría 500
   *     total 11.173,72 (7,45 %) · coste 161.173,72
   *   promotor 150.000: IGIC no calculado · AJD 150.000 × 0,75 % = 1.125,00
   *     total (parcial) 2.548,72 · coste (parcial) 152.548,72
   *   ⚠️ 26/09/2026 (hallazgo 2214): en Canarias la notaría y el registro van sin IVA (su
   *   factura lleva IGIC): 333,306895 × 1,75 = 583,29 y 180,11 →
   *     particular: total 9.750 + 583,29 + 180,11 + 500 = 11.013,40 · coste 161.013,40
   *     promotor: total 1.125 + 583,29 + 180,11 + 500 = 2.388,40 · coste 152.388,40
   *   ⚠️ 17/10/2026 (cabo C0209): con la base del BOE y la rebaja del 5 % del nº 2.1,
   *   333,308711 × 0,95 × 1,75 = 554,13 y 171,098684 × 0,95 + 9,015182 = 171,56 →
   *     particular: total 9.750 + 554,13 + 171,56 + 500 = 10.975,69 · coste 160.975,69
   *     promotor: total 1.125 + 554,13 + 171,56 + 500 = 2.350,69 · coste 152.350,69
   */
  test('Canarias — particular por ITP sin aviso de IGIC; promotor parcial; y vuelta atrás', async ({ page }) => {
    await abrir(page, 'canarias', 'particular');
    await sembrarValor(page, SEL_PRECIO, '150000');
    await sembrarValor(page, SEL_GESTORIA, '500');

    await expect(page.getByText('no se aplica el IVA')).toHaveCount(0);
    await expect(rotulo(page, /^ITP \(/)).toHaveText('ITP (6,50\u00A0%)');
    await expect(valor(page, 'ITP (')).toHaveText('9750,00 €');
    await expect(page.locator('h3', { hasText: /^AJD/ })).toHaveCount(0);
    await expect(valor(page, 'Total gastos adicionales')).toHaveText('10.975,69 €');
    // ⚠️ 26/09/2026 (tarde): parcial también con particular, porque a la notaría y el registro
    // les falta su IGIC; el aviso no habla del «coste real» (el ITP de la operación sí está).
    await expect(rotulo(page, /^COSTE TOTAL/)).toHaveText('COSTE TOTAL (PARCIAL)');
    await expect(valor(page, /^COSTE TOTAL/)).toHaveText('160.975,69 €');
    await expect(descripcion(page, /^COSTE TOTAL/)).toHaveText(SOLO_HONORARIOS('IGIC'));

    await page.getByRole('button', { name: /Promotor \/ Empresa/ }).click();
    await expect(page.getByText('no se aplica el IVA')).toBeVisible();
    await expect(valor(page, 'IGIC')).toHaveText('No calculado');
    await expect(rotulo(page, /^AJD \(/)).toHaveText('AJD (0,75\u00A0%)');
    await expect(valor(page, 'AJD (')).toHaveText('1125,00 €');
    await expect(valor(page, 'Total gastos adicionales')).toHaveText('2350,69 €');
    await expect(valor(page, /^COSTE TOTAL/)).toHaveText('152.350,69 €');
    await expect(descripcion(page, /^COSTE TOTAL/)).toHaveText(admiteAvisoAjd('No incluye el IGIC: el coste real puede ser mayor'));

    await page.getByRole('button', { name: /Un particular/ }).click();
    await expect(page.getByText('no se aplica el IVA')).toHaveCount(0);
    await expect(valor(page, 'ITP (')).toHaveText('9750,00 €');
    await expect(rotulo(page, /^COSTE TOTAL/)).toHaveText('COSTE TOTAL (PARCIAL)');
    await expect(descripcion(page, /^COSTE TOTAL/)).toHaveText(SOLO_HONORARIOS('IGIC'));
  });

  /**
   * Castilla y León — el corte EXACTO del primer tramo (8 % hasta 250.000 €, 10 % después).
   *   250.000 → 20.000,00 (8,00 %) · notaría 771,33 · registro 242,20 · total 21.013,53 · coste 271.013,53
   *   250.001 → 20.000 + 1 × 10 % = 20.000,10 (8,00 %) · notaría (383,435726 × 0,95 × 1,21 ×
   *            1,75 = 771,328892) 771,33 · registro ((201,212847 × 0,95 + 9,015182) × 1,21 =
   *            242,202538) 242,20 · total 21.013,63 · coste 271.014,63
   *   (17/10/2026, cabo C0209: con la base del BOE y la rebaja del 5 % del nº 2.1; sin ella,
   *   811,92 · 254,37 / 254,38 · 21.066,29 / 21.066,40. El euro de más ya no mueve el registro.)
   * Gestoría 0: es un dato, no un ilegible, así que no hay tarjeta de gestoría ni aviso.
   */
  test('Castilla y León — el corte exacto de 250.000 € no salta de tramo; un euro más va al 10 %', async ({ page }) => {
    await abrir(page, 'castilla-leon', 'particular');
    await sembrarValor(page, SEL_GESTORIA, '0');
    await sembrarValor(page, SEL_PRECIO, '250000');

    await expect(page.getByText('escala progresiva (8 % → 10 %)')).toBeVisible();
    await expect(valor(page, 'ITP (')).toHaveText('20.000,00 €');
    await expect(page.locator('h3', { hasText: 'Gastos de gestoría' })).toHaveCount(0);
    await expect(valor(page, 'Total gastos adicionales')).toHaveText('21.013,53 €');
    await expect(valor(page, 'COSTE TOTAL DE ADQUISICIÓN')).toHaveText('271.013,53 €');

    await sembrarValor(page, SEL_PRECIO, '250001');
    await expect(rotulo(page, /^ITP \(/)).toHaveText('ITP (8,00\u00A0%)');
    await expect(valor(page, 'ITP (')).toHaveText('20.000,10 €');
    await expect(valor(page, 'Registro de la Propiedad')).toHaveText('242,20 €');
    await expect(valor(page, 'Total gastos adicionales')).toHaveText('21.013,63 €');
    await expect(valor(page, 'COSTE TOTAL DE ADQUISICIÓN')).toHaveText('271.014,63 €');
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
   *   17/10/2026 (cabo C0209): con la rebaja del 5 % del nº 2.1, notaría 721,04 y registro
   *   224,96 → total 42.000 + 1.000 + 721,04 + 224,96 + 500 = 44.446,00 · coste 244.446,00.
   */
  test('REPARADO 1592 — País Vasco con promotor: cobra el AJD del 0,5 % de las Normas Forales', async ({ page }) => {
    await abrir(page, 'pais-vasco', 'promotor');
    await sembrarValor(page, SEL_PRECIO, '200000');
    await sembrarValor(page, SEL_GESTORIA, '500');
    await expect(valor(page, 'IVA (')).toHaveText('42.000,00 €');

    // Una tarjeta de AJD al 0,5 % y el coste con ella dentro.
    await expect(page.locator('h3', { hasText: /^AJD \(/ })).toHaveCount(1);
    await expect(rotulo(page, /^AJD \(/)).toHaveText('AJD (0,50\u00A0%)');
    await expect(valor(page, 'AJD (')).toHaveText('1000,00 €');
    await expect(valor(page, 'Total gastos adicionales')).toHaveText('44.446,00 €');
    await expect(valor(page, 'COSTE TOTAL DE ADQUISICIÓN')).toHaveText('244.446,00 €');
    // La ficha rotula el mismo 0,5 %, y el ITP de lo que no es vivienda (7 %, no el 4 %).
    const ficha = pegarPct(normaliza(await page.locator('[class*="infoCcaaGrid"]').innerText()));
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
    await expect(rotulo(page, /^ITP \(/)).toHaveText('ITP (3,00\u00A0%)');
    await expect(valor(page, 'ITP (')).toHaveText('5400,00 €');
    const ficha = pegarPct(normaliza(await page.locator('[class*="infoCcaaGrid"]').innerText()));
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
    // «y no exenta» desde el 08/10/2026 (hallazgo 3089).
    const si = page.locator('td', { hasText: 'Sí (si actividad sujeta y no exenta)' });
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
   *   (17/10/2026, cabo C0209: con la rebaja del nº 2.1, 52.500 + 3.750 + 771,33 + 242,20 =
   *   57.263,53 · coste 307.263,53)
   */
  test('REPARADO 1595 — con la gestoría ilegible, total y coste se titulan «(PARCIAL)»', async ({ page }) => {
    await abrir(page, 'galicia', 'promotor');
    await sembrarValor(page, SEL_PRECIO, '250000');
    await sembrarValor(page, SEL_GESTORIA, '2.000.50');
    await expect(valor(page, 'Gastos de gestoría')).toHaveText('Sin leer');
    await expect(valor(page, 'Total gastos adicionales')).toHaveText('57.263,53 €');
    await expect(valor(page, /^COSTE TOTAL/)).toHaveText('307.263,53 €');
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
    expect(pegarPct(tabla)).toContain(`IVA ${PORCENTAJES_IVA.general}%`);

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
    // Por el principio: desde el 08/10/2026 otra pregunta (la del IVA) también nombra la finca rústica.
    const sexta = faq.mainEntity?.find((q) => q.name.startsWith('¿Qué diferencia') && q.name.includes('finca rústica'))?.acceptedAnswer.text ?? '';
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
    // 17/10/2026 (cabo C0209): con la base del BOE y la rebaja del 5 % del nº 2.1, 2.181,673958
    // × 0,95 × 1,21 = 2.507,834215 → ×1,5 = 3.761,75 · ×2 = 5.015,67 · medio ×1,75 = 4.388,71.
    expect(LIMITE_ARANCEL_NOTARIAL).toBe(6010121.04);
    await expect(valor(page, 'Gastos de notaría')).toHaveText('4388,71 €');
    await expect(descripcion(page, 'Gastos de notaría')).toContainText('entre 3761,75 € y 5015,67 €');

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
    // 26/09/2026 (hallazgo 2213): sin desglose igual, pero el marcador dice que el precio no vale.
    await sembrarValor(page, SEL_PRECIO, '0');
    await expect(marcador(page)).toHaveText(`El precio escrito («0») ${PRECIO_NO_VALE}.`);

    await sembrarValor(page, SEL_PRECIO, '0,004');
    await expect(page.locator('h3', { hasText: 'Precio del solar' })).toHaveCount(0, { timeout: 2000 });
    await expect(marcador(page)).toHaveText(
      `El precio escrito («0,004») se queda en 0,00 € al céntimo, y ${PRECIO_NO_VALE}.`,
    );
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
   *   ITP = 1.200.000 × 11 % = 132.000 · notaría 1.485,86 · registro 500,96
   *   (738,637646 × 0,95 × 1,21 × 1,75 y (426,313758 × 0,95 + 9,015182) × 1,21, con la rebaja
   *   del nº 2.1, cabo C0209; sin ella, 1.564,06 y 526,75)
   *   total = 132.000 + 1.485,86 + 500,96 + 500 = 134.486,82 · coste 1.334.486,82
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
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('134.486,82 €');
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('1.334.486,82 €');
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
    expect(pegarPct(referencia)).toContain(`El ITP de un solar va del ${RANGO_ITP_OTROS.min}% al ${RANGO_ITP_OTROS.max}%`);
    expect(pegarPct(referencia)).toContain('en Ceuta y Melilla la cuota se bonifica un 50%');
    expect(referencia).not.toContain('del 4% (País Vasco');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// RE-INSPECCIÓN 26/09/2026 — hermana del grupo B de la familia «Compraventa inmobiliaria»
// (referencia: estimador-compraventa-inmueble). Antes de escribir nada se ejecutó el fichero
// entero: 51/51 en verde y ningún `test.fail()`, así que 1592-1601 siguen reparados.
//
// De dónde sale cada cifra esperada (resuelta a mano ANTES de abrir el navegador, con un script
// que reimplementa los aranceles sin llamar a la app):
//  - ITP: escala de Asturias 8/9/10 % (ITP_CCAA['asturias'].tramosProgresivos), Aragón 8 % hasta
//    400.000 (art. 121-1), Valencia 9 % y 11 % sobre TODO el valor por encima de un millón
//    (Ley 13/1997, art. 13.Uno, texto consolidado BOE-A-1998-8202 consultado hoy: «cuando el
//    valor … sea superior a un millón de euros, el tipo aplicable será el 11 %»), Melilla 6 %
//    con la bonificación del 50 % del art. 57 bis.3.a TRLITPAJD (BOE-A-1993-25359).
//  - AJD: Murcia 1,5 %, Madrid 0,75 %, Valencia 1,4 % (art. 14.Cuatro, mismo texto del BOE),
//    Ceuta 0,5 % bonificado al 50 % (art. 57 bis.1).
//  - IVA: PORCENTAJES_IVA.general = 21 (data/fiscal/iva.ts:66).
//  - Notaría: ARANCELES_NOTARIO (RD 1426/1989 nº 2) × 1,21 × FACTURA_NOTARIAL 1,5 / 2 (medio 1,75),
//    sin tramo por encima de LIMITE_ARANCEL_NOTARIAL = 6.010.121,04 €.
//  - Registro: ARANCELES_REGISTRO + REGISTRO_CONCEPTOS (6,010121 + 3,005061), tope 2.181,67, × 1,21.
//  - 17/10/2026 (cabo C0209): las dos escalas van con la base del BOE (90,151816 · 24,040484 ·
//    tope 2.181,673939) y la rebaja del 5 % del nº 2.1 (RDL 8/2010, DA 8.ª), sobre la escala y
//    no sobre la presentación ni la nota simple. Cada caso de abajo lleva la cuenta nueva.
// ═══════════════════════════════════════════════════════════════════════════════

/** «%» separado o no: los casos de cálculo no dependen de cómo se repare el hallazgo (c). */
const pctLibre = (s: string) => s.replace(/(\d)[  ]%/g, '$1%');

test.describe('Re-inspección 26/09/2026 — casos resueltos a mano y el invariante de la familia', () => {
  test.describe.configure({ timeout: 60_000 });
  const SEL_PRECIO = `input[aria-label="${PRECIO}"]`;
  const SEL_GESTORIA = `input[aria-label="${GESTORIA}"]`;
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
   * CASO 1 (NORMAL) — Asturias, PARTICULAR, 400.000 €, gestoría 650 €. Primera vez que se prueba
   * la escala asturiana en esta app, con el valor en el segundo tramo.
   *   ITP = 300.000 × 8 % + 100.000 × 9 % = 24.000 + 9.000 = 33.000,00 → efectivo 8,25 %
   *   notaría: 90,151816 + 24.040,49 × 0,45 % + 30.050,60 × 0,15 % + 90.151,82 × 0,10 %
   *            + 249.746,97 × 0,05 % = 458,435226 × 0,95 = 435,513465 · × 1,21 = 526,971292
   *            · × 1,5 = 790,46 · × 2 = 1.053,94 · × 1,75 = 922,199761 → 922,20
   *   registro: 24,040484 + 42,0708575 + 37,56325 + 67,613865 + 249.746,97 × 0,03 % (74,924091)
   *            = 246,212547 × 0,95 = 233,901920 + 9,015182 = 242,917102 · × 1,21 = 293,929694
   *            → 293,93
   *   total = 33.000 + 922,20 + 293,93 + 650 = 34.866,13 (8,7165 %) · coste 434.866,13
   *   (sin la rebaja: 970,73 · 832,06 – 1.109,41 · 308,82 · 34.929,55)
   */
  test('CASO 1 (normal) — Asturias, particular, 400.000 €: escala 8 % → 9 %, efectivo 8,25 %', async ({ page }) => {
    await abrir(page, 'asturias', 'particular');
    await sembrarValor(page, SEL_PRECIO, '400000');
    await sembrarValor(page, SEL_GESTORIA, '650');

    expect(pctLibre(await rotuloTarjeta(page, /^ITP \(/))).toBe('ITP (8,25%)');
    expect(await valorTarjeta(page, 'ITP (')).toBe('33.000,00 €');
    await expect(page.locator('h3', { hasText: /^AJD/ })).toHaveCount(0);
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('922,20 €');
    expect(await descripcionTarjeta(page, 'Gastos de notaría')).toContain('entre 790,46 € y 1053,94 €');
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('293,93 €');
    expect(await valorTarjeta(page, 'Gastos de gestoría')).toBe('650,00 €');
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('34.866,13 €');
    expect(pctLibre(await descripcionTarjeta(page, 'Total gastos adicionales'))).toBe('8,72% sobre el precio de compra');
    expect(await rotuloTarjeta(page, /^COSTE TOTAL/)).toBe('COSTE TOTAL DE ADQUISICIÓN');
    expect(await valorTarjeta(page, 'COSTE TOTAL')).toBe('434.866,13 €');
  });

  /**
   * CASO 1-bis (NORMAL) — Murcia, PROMOTOR, 95.000,40 € (con céntimos, escritos con coma),
   * gestoría 400 €.
   *   IVA = 95.000,40 × 21 % = 19.950,084 → 19.950,08 · AJD = 95.000,40 × 1,5 % = 1.425,006 → 1.425,01
   *   notaría: 90,151816 + 108,182205 + 45,0759 + 34.899,19 × 0,10 % = 278,309111 × 0,95 =
   *            264,393655 · × 1,21 = 319,916323
   *            · × 1,5 = 479,87 · × 2 = 639,83 · × 1,75 = 559,853565 → 559,85
   *   registro: 24,040484 + 42,0708575 + 37,56325 + 34.899,19 × 0,075 % (26,1743925) = 129,848984
   *            × 0,95 = 123,356535 + 9,015182 = 132,371717 · × 1,21 = 160,169778 → 160,17
   *   total = 19.950,08 + 1.425,01 + 559,85 + 160,17 + 400 = 22.495,11 · coste 117.495,51
   *   (sin la rebaja del nº 2.1, cabo C0209: 589,32 · 505,13 – 673,50 · 168,03 · 22.532,44)
   */
  test('CASO 1-bis (normal) — Murcia, promotor, 95.000,40 €: IVA 21 % + AJD 1,5 %', async ({ page }) => {
    await abrir(page, 'murcia', 'promotor');
    await sembrarValor(page, SEL_PRECIO, '95000,40');
    await sembrarValor(page, SEL_GESTORIA, '400');

    expect(pctLibre(await rotuloTarjeta(page, /^IVA \(/))).toBe('IVA (21,00%)');
    expect(await valorTarjeta(page, 'IVA (')).toBe('19.950,08 €');
    expect(pctLibre(await rotuloTarjeta(page, /^AJD \(/))).toBe('AJD (1,50%)');
    expect(await valorTarjeta(page, 'AJD (')).toBe('1425,01 €');
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('559,85 €');
    expect(await descripcionTarjeta(page, 'Gastos de notaría')).toContain('entre 479,87 € y 639,83 €');
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('160,17 €');
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('22.495,11 €');
    expect(await valorTarjeta(page, 'COSTE TOTAL')).toBe('117.495,51 €');
    expect(await descripcionTarjeta(page, 'COSTE TOTAL')).toBe(
      'Precio + todos los gastos (antes de deducir el IVA si tienes derecho)',
    );
  });

  /**
   * CASO 2 (LÍMITE) — Valencia, PARTICULAR, justo en el umbral del art. 13.Uno Ley 13/1997:
   * «superior a un millón» → 1.000.000,00 paga el 9 % y 1.000.000,01 el 11 % sobre TODO.
   *   1.000.000,00: ITP 90.000,00 · notaría 1.365,16 · registro 454,98 · gestoría 500
   *                 total 92.320,14 · recuadro «ITP General 9 %»
   *   1.000.000,01: ITP 110.000,0011 → 110.000,00 · total 112.320,14 · coste 1.112.320,15
   *                 recuadro «ITP General 11 %»
   *   (notaría 678,637646 × 0,95 × 1,21 × 1,75 y registro (386,313758 × 0,95 + 9,015182) ×
   *   1,21, con la rebaja del nº 2.1, cabo C0209; sin ella, 1.437,01 · 478,35 · 92.415,36)
   */
  test('CASO 2 (límite) — Valencia, particular: 1.000.000 € al 9 %, 1.000.000,01 € al 11 % sobre todo', async ({ page }) => {
    await abrir(page, 'valencia', 'particular');
    await sembrarValor(page, SEL_GESTORIA, '500');
    const itpGeneral = async () =>
      pctLibre(normaliza(await page.locator('[class*="infoCcaaItem"]', { hasText: 'ITP General' }).innerText()));

    await sembrarValor(page, SEL_PRECIO, '1000000');
    expect(pctLibre(await rotuloTarjeta(page, /^ITP \(/))).toBe('ITP (9,00%)');
    expect(await valorTarjeta(page, 'ITP (')).toBe('90.000,00 €');
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('92.320,14 €');
    expect(await itpGeneral()).toBe('ITP General 9%');

    await sembrarValor(page, SEL_PRECIO, '1.000.000,01');
    expect(pctLibre(await rotuloTarjeta(page, /^ITP \(/))).toBe('ITP (11,00%)');
    expect(await valorTarjeta(page, 'ITP (')).toBe('110.000,00 €');
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('112.320,14 €');
    expect(await valorTarjeta(page, 'COSTE TOTAL')).toBe('1.112.320,15 €');
    expect(await itpGeneral()).toBe('ITP General 11%');
  });

  /**
   * CASO 2-bis (LÍMITE) — Madrid, PROMOTOR, justo en el límite del arancel notarial.
   *   6.010.121,04: escala hasta el límite 2.181,673958 × 0,95 (rebaja del nº 2.1, cabo C0209)
   *                 = 2.072,590260 · × 1,21 = 2.507,834215
   *                 notaría × 1,75 = 4.388,71 (entre 3.761,75 y 5.015,67), SIN libre acuerdo
   *                 IVA 1.262.125,4184 → 1.262.125,42 · AJD 0,75 % = 45.075,9078 → 45.075,91
   *                 registro 1.388,337966 × 0,95 = 1.318,921068 + 9,015182 = 1.327,936250
   *                 × 1,21 = 1.606,80
   *                 total 1.313.696,84 · coste 7.323.817,88 — DEFINITIVO
   *   6.010.121,05: el céntimo que excede es de libre acuerdo (RD 1426/1989 nº 2.1) → mismas
   *                 líneas, coste 7.323.817,89, y el cierre pasa a «(PARCIAL)» con «puede ser».
   *   (sin la rebaja: 4.619,69 · 3.959,73 – 5.279,65 · 1.690,80 · 1.314.011,82)
   */
  test('CASO 2-bis (límite) — Madrid, promotor: 6.010.121,04 € cierra; un céntimo más, notaría de libre acuerdo', async ({ page }) => {
    await abrir(page, 'madrid', 'promotor');
    await sembrarValor(page, SEL_GESTORIA, '500');

    await sembrarValor(page, SEL_PRECIO, '6.010.121,04');
    expect(await valorTarjeta(page, 'IVA (')).toBe('1.262.125,42 €');
    expect(await valorTarjeta(page, 'AJD (')).toBe('45.075,91 €');
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('4388,71 €');
    expect(await descripcionTarjeta(page, 'Gastos de notaría')).toMatch(/^Factura estimada entre 3761,75 € y 5015,67 €/);
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('1606,80 €');
    expect(await rotuloTarjeta(page, /^Total gastos adicionales/)).toBe('Total gastos adicionales');
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('1.313.696,84 €');
    expect(await rotuloTarjeta(page, /^COSTE TOTAL/)).toBe('COSTE TOTAL DE ADQUISICIÓN');
    expect(await valorTarjeta(page, 'COSTE TOTAL')).toBe('7.323.817,88 €');

    await sembrarValor(page, SEL_PRECIO, '6.010.121,05');
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('4388,71 €');
    expect(await descripcionTarjeta(page, 'Gastos de notaría')).toContain('libre acuerdo con el notario (RD 1426/1989, número 2)');
    expect(await rotuloTarjeta(page, /^Total gastos adicionales/)).toBe('Total gastos adicionales (parcial)');
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('1.313.696,84 €');
    expect(await rotuloTarjeta(page, /^COSTE TOTAL/)).toBe('COSTE TOTAL (PARCIAL)');
    expect(await valorTarjeta(page, 'COSTE TOTAL')).toBe('7.323.817,89 €');
    expect(await descripcionTarjeta(page, 'COSTE TOTAL')).toBe(
      'No incluye la parte de la notaría de libre acuerdo: el coste real puede ser mayor (precio + gastos antes de deducir el IVA si tienes derecho)',
    );
  });

  /**
   * CASO 2-ter (LÍMITE) — Melilla, PARTICULAR, 200.000 €, gestoría 500 € (la bonificación del
   * art. 57 bis.3.a; el caso de Ceuta ya estaba, Melilla con particular no).
   *   ITP = 200.000 × 6 % × (1 − 0,5) = 6.000,00 → «ITP (3,00 %)»
   *   notaría 758,98 · registro 236,22 · total 7.495,20 · coste 207.495,20
   *   ⚠️ 26/09/2026 (hallazgo 2214): sin IVA en Melilla → notaría 627,26 · registro 195,23
   *   · total 7.322,49 · coste 207.322,49 (el cálculo del caso de Ceuta de arriba)
   *   ⚠️ 17/10/2026 (cabo C0209): con la rebaja del 5 % del nº 2.1 → notaría 595,90 · registro
   *   185,92 · total 7.281,82 · coste 207.281,82 (el mismo caso de Ceuta, recalculado)
   */
  test('CASO 2-ter (límite) — Melilla, particular, 200.000 €: ITP al 3 % efectivo y la bonificación nombrada', async ({ page }) => {
    expect(BONIFICACION_CUOTA_CEUTA_MELILLA).toBe(0.5);
    expect(ITP_CCAA['melilla'].tipoGeneral).toBe(6);
    await abrir(page, 'melilla', 'particular');
    await sembrarValor(page, SEL_PRECIO, '200000');
    await sembrarValor(page, SEL_GESTORIA, '500');

    expect(pctLibre(await rotuloTarjeta(page, /^ITP \(/))).toBe('ITP (3,00%)');
    expect(await valorTarjeta(page, 'ITP (')).toBe('6000,00 €');
    expect(await descripcionTarjeta(page, 'ITP (')).toContain('bonificación del 50');
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('595,90 €');
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('185,92 €');
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('7281,82 €');
    expect(await valorTarjeta(page, 'COSTE TOTAL')).toBe('207.281,82 €');
    const recuadro = normaliza(await page.locator('[class*="infoCcaa"]').first().innerText());
    expect(recuadro).toContain('Bonificación en cuota');
  });

  /**
   * CASO 3 (RECHAZO) — ninguna de estas entradas publica cifra; la ilegible, además, se nombra.
   *   «2.000.50»  → NaN (millar y decimal a la estadounidense): «No se ha podido leer el precio…»
   *   «0,001» y «0,004» → se pintarían «0,00 €» (hallazgo 1601): sin desglose
   *   «-50000» → negativo: sin desglose; al salir del campo, el min={0} lo reescribe a «0»
   */
  test('CASO 3 (rechazo) — ilegible, sub-céntimo y negativo no publican cifra; el ilegible se nombra', async ({ page }) => {
    await abrir(page, 'madrid', 'particular');
    await sembrarValor(page, SEL_GESTORIA, '500');
    const cierre = page.locator('h3', { hasText: /^COSTE TOTAL/ });

    await sembrarValor(page, SEL_PRECIO, '2.000.50');
    await expect(cierre).toHaveCount(0);
    await expect(marcador(page)).toContainText('No se ha podido leer el precio «2.000.50»');

    for (const entrada of ['0,001', '0,004', '-50000']) {
      await sembrarValor(page, SEL_PRECIO, entrada);
      await expect(cierre).toHaveCount(0);
      await expect(page.locator('h3', { hasText: /^ITP/ })).toHaveCount(0);
      await expect(marcador(page)).not.toContainText('No se ha podido leer');
    }
    // La siembra no pone el foco: se entra y se sale del campo, como el usuario.
    await page.locator(SEL_PRECIO).focus();
    await page.locator(SEL_PRECIO).blur();
    await esperarValorEnReact(page, SEL_PRECIO, '0');
    await expect(cierre).toHaveCount(0);

    // Y de vuelta a un precio válido, el desglose vuelve (120.000 € en Madrid, caso del testigo;
    // 128.491,86 € con la rebaja del nº 2.1, cabo C0209, resuelto en el CASO 1 del 26/08).
    await sembrarValor(page, SEL_PRECIO, '120000');
    expect(await valorTarjeta(page, 'COSTE TOTAL')).toBe('128.491,86 €');
  });

  /**
   * INVARIANTE DE LA FAMILIA medido en la combinación que el testigo no usa: Valencia con
   * PROMOTOR (IVA + AJD 1,4 %), 250.000 €. La dirección se MIDE, no se razona.
   *   con gestoría 500:        total 57.513,53 · coste 307.513,53
   *   con gestoría «2.000.50»: total 57.013,53 · coste 307.013,53 → la cifra BAJA 500,00 €, así
   *   que el aviso tiene que nombrar la gestoría y decir que el coste real es MAYOR, sin perder
   *   la salvedad del IVA deducible (1272).
   *   notaría 771,33 · registro 242,20 (desarrollo del CASO 1 del 24/09, mismo precio; con la
   *   rebaja del nº 2.1, cabo C0209: sin ella, 811,92 · 254,37 y cada total 52,76 € mayor)
   */
  test('Invariante — Valencia, promotor: la gestoría ilegible se nombra y el aviso apunta hacia arriba', async ({ page }) => {
    const { parseSpanishNumber } = await import('../../lib/formatters');
    const euros = async (t: string) => parseSpanishNumber((await valorTarjeta(page, t)).replace(/\s?€$/, ''));
    await abrir(page, 'valencia', 'promotor');
    await sembrarValor(page, SEL_PRECIO, '250000');

    await sembrarValor(page, SEL_GESTORIA, '500');
    expect(pctLibre(await rotuloTarjeta(page, /^AJD \(/))).toBe('AJD (1,40%)');
    expect(await valorTarjeta(page, 'AJD (')).toBe('3500,00 €');
    expect(await valorTarjeta(page, 'COSTE TOTAL')).toBe('307.513,53 €');
    const legible = await euros('COSTE TOTAL');

    await sembrarValor(page, SEL_GESTORIA, '2.000.50');
    expect(await valorTarjeta(page, 'Gastos de gestoría')).toBe('Sin leer');
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('57.013,53 €');
    expect(await valorTarjeta(page, 'COSTE TOTAL')).toBe('307.013,53 €');
    const ilegible = await euros('COSTE TOTAL');
    expect(ilegible - legible).toBeCloseTo(-500, 2);
    expect(await rotuloTarjeta(page, /^COSTE TOTAL/)).toBe('COSTE TOTAL (PARCIAL)');
    expect(await descripcionTarjeta(page, 'COSTE TOTAL')).toBe(
      'No incluye la gestoría, que no se ha podido leer: el coste real será mayor (precio + gastos antes de deducir el IVA si tienes derecho)',
    );
  });

  /**
   * Forma (e) de la familia, comprobada y SANA aquí: el único ejemplo con cifras del bloque
   * educativo —la FAQ «¿Cuánto cuesta escriturar un solar?», CASOS_ESCRITURAR.solar = 60.000 €—
   * da la notaría como HORQUILLA y coincide con lo que publica la calculadora con ese precio:
   *   arancel 90,15 + 108,182205 + 29.949,39 × 0,15 % = 243,25629 · × 1,21 = 294,340111
   *   × 1,5 = 441,51 · × 2 = 588,68 → «unos 442-589 €» · registro 136,20 → «unos 136 €»
   *   17/10/2026 (cabo C0209): con la base del BOE y la rebaja del 5 % del nº 2.1, escala
   *   90,151816 + 108,182205 + 44,924085 = 243,258106 × 0,95 = 231,095201 × 1,21 = 279,625193
   *   × 1,5 = 419,44 · × 2 = 559,25 → «unos 419-559 €» · registro (103,548079 × 0,95 +
   *   9,015182) × 1,21 = 129,936887 → 129,94 → «unos 130 €». La FAQ sale de
   *   `respuestaEscriturar`, que llama al motor: se movió sola con él.
   */
  test('Forma (e) — el ejemplo de «escriturar un solar» cuadra con la calculadora a 60.000 €', async ({ page }) => {
    await abrir(page, 'madrid', 'particular');
    await sembrarValor(page, SEL_PRECIO, '60000');
    expect(await descripcionTarjeta(page, 'Gastos de notaría')).toContain('entre 419,44 € y 559,25 €');
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('129,94 €');
    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
    const faq = normaliza(
      await page.locator('div', { has: page.locator('strong', { hasText: '¿Cuánto cuesta escriturar un solar?' }) }).last().innerText(),
    );
    expect(faq).toContain('para un solar de 60.000 € salen unos 419-559 € de notaría');
    expect(faq).toContain('unos 130 € para ese mismo importe');
  });

  /**
   * Forma (b) de la familia, comprobada y SANA aquí: ningún texto de marca de la app baja de
   * 4,5:1 en ninguno de los dos temas (usa --primary-texto y --primary-boton, 733 y 1594). Se
   * mide el color computado sobre el fondo real compuesto, con el movimiento reducido para no
   * medir a mitad de la transición del tema.
   */
  test('Forma (b) — el texto de marca de la app llega al 4,5:1 en claro y en oscuro', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await abrir(page, 'ceuta', 'promotor');
    await sembrarValor(page, SEL_PRECIO, '120000');
    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
    const selectores = [
      '[class*="sectionTitle"]',
      '[class*="infoCcaaNombre"]',
      '[class*="infoCcaaValue"]',
      '[class*="catastroLink"]',
      '[class*="transmisionBtn"][aria-pressed="true"] > span:nth-child(2)',
      'td:has-text("IGIC o IPSI en Canarias")',
      'th:has-text("Concepto")',
    ];
    const medir = () =>
      page.evaluate((sels) => {
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
        const out: Record<string, number> = {};
        for (const sel of sels) {
          const el = sel.includes(':has-text(')
            ? [...document.querySelectorAll(sel.split(':')[0])].find((e) => e.textContent?.includes(sel.match(/"(.+)"/)![1]))
            : document.querySelector(sel);
          if (!el) { out[sel] = -1; continue; }
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
          out[sel] = Math.round(((Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)) * 100) / 100;
        }
        return out;
      }, selectores);

    const claro = await medir();
    await page.getByRole('button', { name: 'Cambiar a modo oscuro' }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await expect(page.locator('body')).not.toHaveCSS('background-color', 'rgb(250, 250, 250)');
    await page.waitForTimeout(300);
    const oscuro = await medir();
    const peor = Math.min(...Object.values(claro), ...Object.values(oscuro));
    expect(peor, `Contrastes: ${JSON.stringify({ claro, oscuro })}`).toBeGreaterThanOrEqual(4.5);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// REPARACIÓN 26/09/2026 — los seis hallazgos de la re-inspección del 26/09 (2208-2213), sin
// marca, y la receta de la familia: notaría y registro sin IVA donde no rige (2214, anotado en
// terreno-rústico) y el foco del select en oscuro (2215, la misma regla en este módulo). Los
// seis estaban con `test.fail()`: se quita la marca y las aserciones que afirmaban el defecto
// («se reproduce») salen, porque ya no se reproduce. Cifras a mano; ninguna copiada de la app.
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('Reparación 26/09/2026 — hallazgos 2208-2213 y la receta de la familia', () => {
  test.describe.configure({ timeout: 60_000 });
  const SEL_PRECIO = `input[aria-label="${PRECIO}"]`;
  const SEL_GESTORIA = `input[aria-label="${GESTORIA}"]`;
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

  /** Descripción de una tarjeta en crudo (sin apartar la salvedad del AJD). */
  const descripcionCruda = async (page: Page, titulo: RegExp): Promise<string> =>
    normaliza(await page.locator('h3', { hasText: titulo }).first().locator('xpath=../following-sibling::p[1]').innerText());

  /**
   * REPARADO 2208 (el 726 de local-comercial, que no había llegado aquí) — la app ya no niega de
   * plano los tipos reducidos y pinta las notas de la comunidad, donde data/itp-ccaa.ts documenta
   * el 1 % del art. 121-11 de Aragón por adquirir un inmueble que se afecte al INICIO de una
   * actividad económica. El caso por defecto no cambia: Aragón, particular, 100.000 € → 8 %.
   */
  test('REPARADO 2208 — Aragón: sin negar de plano los tipos reducidos y con la nota del art. 121-11 a la vista', async ({ page }) => {
    expect(ITP_CCAA['aragon'].notas).toContain('art. 121-11');
    await abrir(page, 'aragon', 'particular');
    await sembrarValor(page, SEL_PRECIO, '100000');
    expect(pctLibre(await rotuloTarjeta(page, /^ITP \(/))).toBe('ITP (8,00%)');
    expect(await valorTarjeta(page, 'ITP (')).toBe('8000,00 €');

    const recuadro = await page.locator('[class*="infoCcaa"]').first().innerText();
    const texto = normaliza([await descripcionTarjeta(page, 'ITP ('), recuadro].join(' '));
    expect(texto).not.toMatch(/no tienen tipos reducidos|solo aplican a la vivienda habitual/);
    expect(texto).toContain('121-11');
    // La nota llega de data/ con el «%» pegado y se pinta con espacio duro.
    expect(recuadro).not.toMatch(/\d%/);
  });

  /**
   * REPARADO 2209 — la base del AJD no puede ser inferior al valor de referencia (art. 30.1
   * TRLITPAJD, redacción de la Ley 11/2021). La app no pide el valor de referencia: lo dice en
   * la ayuda del precio con promotor, en la FAQ «¿Sobre qué valor…?», en «Limitaciones», y junto
   * a las dos cifras que dependen de él, la tarjeta del AJD y el total, que así no sale
   * definitivo sin la salvedad. Sin AJD (vende un particular) no aparece.
   *   Madrid, promotor, 100.000 €: AJD 100.000 × 0,75 % = 750,00 (con valor de referencia de
   *   130.000 €, el debido sería 975,00: la salvedad es la que lo avisa)
   */
  test('REPARADO 2209 — con promotor, la ayuda, la FAQ, las limitaciones, el AJD y el total dicen que la base del AJD tiene de suelo el valor de referencia', async ({ page }) => {
    await abrir(page, 'madrid', 'particular');
    await sembrarValor(page, SEL_PRECIO, '100000');
    expect(await descripcionCruda(page, /^COSTE TOTAL/)).not.toContain('art. 30.1');

    await page.getByRole('button', { name: /Promotor \/ Empresa/ }).click();
    expect(await valorTarjeta(page, 'AJD (')).toBe('750,00 €');
    expect(await descripcionCruda(page, /^AJD/)).toBe(AVISO_BASE_AJD);
    expect((await descripcionCruda(page, /^COSTE TOTAL/)).endsWith(`. ${AVISO_BASE_AJD}`)).toBe(true);
    const idAyuda = await page.locator(SEL_PRECIO).getAttribute('aria-describedby');
    const ayuda = normaliza(await page.locator(`[id="${idAyuda}"]`).innerText());
    expect(ayuda).toContain('Precio pactado');
    expect(ayuda).toContain('La base del AJD no puede ser inferior al valor de referencia catastral (art. 30.1 TRLITPAJD)');

    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
    const faqBase = normaliza(
      await page
        .locator('div', { has: page.locator('strong', { hasText: '¿Sobre qué valor se calcula el impuesto de un solar?' }) })
        .last()
        .innerText(),
    );
    const limitacion = normaliza(await page.locator('li', { hasText: 'valor de referencia catastral puede ser' }).innerText());
    for (const t of [faqBase, limitacion]) expect(t).toMatch(/AJD.*art\. ?30\.1 TRLITPAJD/);
  });

  /**
   * REPARADO 2210 · forma (a) — un sello por módulo cuyos datos publica la página: los
   * aranceles (RD 1426/1989 y RD 1427/1989, 20/08/2026) y el IVA del solar, que sale de
   * `PORCENTAJES_IVA` (`FISCAL_IVA_META`, 18/06/2026). El de inmuebles ya no cita la Ley 35/2006
   * ni el RDL 26/2021: la app no calcula ni el IRPF ni la plusvalía (solo la recuerda).
   */
  test('REPARADO 2210 — sellos de los aranceles y del IVA, y el de inmuebles sin normas que la app no aplica', async ({ page }) => {
    const fecha = (iso: string) => iso.split('-').reverse().join('/');
    expect(FACTURA_NOTARIAL.baseNormativa).toContain('RD 1426/1989');
    expect(REGISTRO_CONCEPTOS.baseNormativa).toContain('RD 1427/1989');
    expect(fecha(FISCAL_IVA_META.verificado)).toBe('18/06/2026');
    await abrir(page, 'madrid', 'particular');
    await sembrarValor(page, SEL_PRECIO, '120000');
    // Las del CASO 1 del 26/08, con la rebaja del nº 2.1 (cabo C0209; sin ella, 642,25 y 190,71)
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('610,14 €');
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('181,72 €');

    const sellos = (await page.locator('[aria-label="Datos de referencia normativos"]').allInnerTexts()).map(normaliza);
    const todos = sellos.join(' | ');
    expect(todos).toMatch(/1426\/1989/);
    expect(todos).toMatch(/1427\/1989/);
    expect(todos).toContain(`Última verificación: ${fecha(FISCAL_IVA_META.verificado)}`);
    expect(todos).not.toMatch(/Ley 35\/2006|RDL 26\/2021/);
  });

  /**
   * REPARADO 2211 · forma (c) — el «%» va con espacio duro U+00A0 en la herramienta, los
   * sellos, el JSON-LD y las tres description (meta, og y twitter). Madrid, promotor, 120.000 €.
   */
  test('REPARADO 2211 — ningún «%» sin espacio duro en pantalla, sellos, JSON-LD ni description', async ({ page }) => {
    await abrir(page, 'madrid', 'promotor');
    await sembrarValor(page, SEL_PRECIO, '120000');
    expect(await valorTarjeta(page, 'IVA (')).toBe('25.200,00 €');

    const pantalla = [
      await page.locator('[class*="resultados"]').first().innerText(),
      await page.locator('[class*="infoCcaa"]').first().innerText(),
      await page.locator('[class*="transmisionGrid"]').first().innerText(),
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
    expect(descripciones.join(' ')).toMatch(/\d %/);
    const malos = (t: string) =>
      [...t.matchAll(/\d%|\d %/g)].map((m) => t.slice(Math.max(0, (m.index ?? 0) - 14), (m.index ?? 0) + 3).replace(/\s+/g, ' '));
    expect({ pantalla: malos(pantalla), jsonLd: malos(ld), description: malos(descripciones.join('\n')) }).toEqual({
      pantalla: [],
      jsonLd: [],
      description: [],
    });
  });

  /**
   * REPARADO 2212 — la fila del AJD de la tabla dice que en Ceuta y Melilla se paga la mitad
   * (art. 57 bis.1 TRLITPAJD), que es lo que la calculadora cobra:
   *   Ceuta, promotor, 300.000 €: AJD = 300.000 × 0,5 % × (1 − 0,5) = 750,00 (0,25 %)
   */
  test('REPARADO 2212 — la tabla dice que en Ceuta y Melilla el AJD se paga a la mitad', async ({ page }) => {
    expect(RANGO_AJD_OTROS.min).toBe(0.5);
    await abrir(page, 'ceuta', 'promotor');
    await sembrarValor(page, SEL_PRECIO, '300000');
    expect(pctLibre(await rotuloTarjeta(page, /^AJD \(/))).toBe('AJD (0,25%)');
    expect(await valorTarjeta(page, 'AJD (')).toBe('750,00 €');

    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
    const celda = normaliza(
      await page.locator('tr', { has: page.locator('td', { hasText: /^AJD$/ }) }).locator('td').nth(1).innerText(),
    );
    expect(celda).toMatch(/en Ceuta y Melilla, la mitad/);
  });

  /**
   * REPARADO 2213 · patrón 5 de la familia, «no falta, no vale» (1799 en la referencia) — un
   * precio escrito, legible e imposible (0, un importe que se pinta 0,00 €, un negativo con el
   * foco) dice que tiene que ser mayor que 0. El vacío pide «Introduce…» y el ilegible conserva
   * su mensaje (grupo B del testigo de familia).
   */
  test('REPARADO 2213 — un precio escrito como 0, 0,004 o negativo dice que tiene que ser mayor que 0', async ({ page }) => {
    await abrir(page, 'madrid', 'particular');
    const marcador = page.locator('[class*="placeholder"] p');
    await expect(marcador).toHaveText('Introduce el precio del solar para ver el desglose de gastos');
    const esperado: Record<string, string> = {
      '0': `El precio escrito («0») ${PRECIO_NO_VALE}.`,
      '0,004': `El precio escrito («0,004») se queda en 0,00 € al céntimo, y ${PRECIO_NO_VALE}.`,
      '-50000': `El precio escrito («-50000») ${PRECIO_NO_VALE}.`,
    };
    for (const entrada of Object.keys(esperado)) {
      await sembrarValor(page, SEL_PRECIO, entrada);
      await expect(page.locator('h3', { hasText: /^COSTE TOTAL/ })).toHaveCount(0);
      await expect(marcador).toHaveText(esperado[entrada]);
    }
    await sembrarValor(page, SEL_PRECIO, '2.000.50');
    await expect(marcador).toContainText('No se ha podido leer el precio «2.000.50»');
  });

  /**
   * Receta 1 (hallazgo 2214, anotado en terreno-rústico; motor en 242fffcd) — en Canarias, Ceuta
   * y Melilla la notaría y el registro van SIN IVA y se nombra el impuesto que les falta.
   * Canarias, particular, 150.000 €, gestoría 500 (aranceles a mano, RD 1426/1989 y 1427/1989):
   *   notaría 333,308711 × 0,95 (rebaja del nº 2.1, cabo C0209) × 1,75 = 554,125731 → 554,13 ·
   *   registro 171,098684 × 0,95 + 9,015182 = 171,558932 → 171,56
   *   ITP 150.000 × 6,5 % = 9.750 · total 9.750 + 554,13 + 171,56 + 500 = 10.975,69 · coste 160.975,69
   * Madrid, mismo precio: 670,49 y 207,59 «(IVA incluido)», y sin nota.
   * (Sin la rebaja: 583,29 · 180,11 · 11.013,40 y, en Madrid, 705,78 y 217,94.)
   */
  test('Receta 1 (2214) — Canarias y Melilla: notaría y registro sin IVA, rotulados sin IGIC/IPSI y nombrados junto al total', async ({ page }) => {
    await abrir(page, 'canarias', 'particular');
    await sembrarValor(page, SEL_PRECIO, '150000');
    await sembrarValor(page, SEL_GESTORIA, '500');
    expect(await valorTarjeta(page, 'ITP (')).toBe('9750,00 €');
    expect(await rotuloTarjeta(page, /^Gastos de notaría/)).toBe('Gastos de notaría (sin IGIC)');
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('554,13 €');
    expect(await rotuloTarjeta(page, /^Registro de la Propiedad/)).toBe('Registro de la Propiedad (sin IGIC)');
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('171,56 €');
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('10.975,69 €');
    expect(await valorTarjeta(page, 'COSTE TOTAL')).toBe('160.975,69 €');
    const nota = page.locator('[class*="avisoHonorarios"]');
    await expect(nota).toHaveText(
      'ℹ️ Las facturas de notaría y registro llevan además IGIC, que esta herramienta no calcula, así que cuestan más de lo que se muestra.',
    );
    await expect(nota).not.toContainText('coste real');

    await page.selectOption('#select-ccaa', 'melilla');
    expect(await rotuloTarjeta(page, /^Registro de la Propiedad/)).toBe('Registro de la Propiedad (sin IPSI)');
    await expect(nota).toContainText('llevan además IPSI');

    await page.selectOption('#select-ccaa', 'madrid');
    expect(await rotuloTarjeta(page, /^Gastos de notaría/)).toBe('Gastos de notaría (IVA incluido)');
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('670,49 €');
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('207,59 €');
    await expect(nota).toHaveCount(0);
  });

  /**
   * Hallazgo 2215 (anotado en terreno-rústico; la misma regla en este módulo) — en oscuro, la
   * regla `[data-theme='dark'] .select` pisaba el borde del foco. Ahora el borde cambia y hay
   * contorno con el teclado.
   */
  test('Hallazgo 2215 — en oscuro el select de comunidad muestra el foco', async ({ page }) => {
    await page.addInitScript(() => {
      try {
        localStorage.setItem('meskeia-theme', 'dark');
      } catch {
        /* sin almacenamiento no hay tema oscuro que medir */
      }
    });
    await page.goto(RUTA);
    await esperarHidratacion(page, [SEL_PRECIO, SEL_GESTORIA]);
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    const leer = () =>
      page.locator('#select-ccaa').evaluate((el) => {
        const cs = getComputedStyle(el);
        return { borde: cs.borderTopColor, outline: cs.outlineStyle };
      });
    const sinFoco = await leer();
    await page.locator(SEL_PRECIO).focus();
    await page.keyboard.press('Tab');
    await expect(page.locator('#select-ccaa')).toBeFocused();
    await expect.poll(async () => (await leer()).borde).not.toBe(sinFoco.borde);
    expect((await leer()).outline).not.toBe('none');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// RE-INSPECCIÓN 06/10/2026 — familia «Compraventa inmobiliaria» (hermana: solar).
// Verifica las reparaciones b86a5607, 7d5c1876 y 242fffcd en navegador, mide el invariante de la
// familia («un importe ILEGIBLE no es un cero: si mueve una cifra publicada, la app lo nombra y
// dice en qué dirección falta») en las cifras INTERMEDIAS y en los controles que no son
// NumberInput (el par de botones del vendedor y el selector de comunidad), y barre las 19
// comunidades en los dos regímenes.
//
// De dónde sale cada cifra esperada (resuelta a mano ANTES de abrir el navegador, con un script
// propio que no llama a la app):
//  - ITP de un SOLAR (objeto 'otro'): tipo general de TIPOS_ITP_CCAA_2025 (data/fiscal/
//    inmuebles.ts) y, en el País Vasco, su `tipoNoVivienda: 7`; escalas de ITP_CCAA
//    (data/itp-ccaa.ts): Aragón 8/8,5/9/9,5/10, Asturias 8/9/10, Baleares 8/9/10/12/13, Castilla
//    y León 8/10, Cataluña 10/11/12/13, Extremadura 8/10/11; umbral de Valencia (11 % sobre TODO
//    el valor por encima de un millón); Ceuta y Melilla 6 % con la bonificación del 50 %
//    (BONIFICACION_CUOTA_CEUTA_MELILLA, art. 57 bis TRLITPAJD).
//  - AJD de un solar: `ITP_CCAA[x].ajd` (País Vasco 0,5, Navarra 0,5, Madrid y Canarias 0,75,
//    Rioja 1, Andalucía y Asturias 1,2, Valencia 1,4, el resto 1,5), bonificado al 50 % en Ceuta
//    y Melilla (art. 57 bis.1).
//  - IVA del solar: PORCENTAJES_IVA.general = 21 (data/fiscal/iva.ts).
//
// ⚠️ Ninguna cifra de notaría ni de registro se fija aquí: los hallazgos 2901 y 2902 (rebaja del
// 5 % de los dos aranceles, abiertos en la referencia) las moverán al repararse. Donde un caso
// necesita el total, se mide su COHERENCIA con las líneas que la app publica (el total es la suma
// de lo que se ve encima, y el coste es precio + total), y el delta del ilegible, que es la
// gestoría y no depende de los aranceles.
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('Re-inspección 06/10/2026 — casos a mano, cifras intermedias y controles que no son NumberInput', () => {
  test.describe.configure({ timeout: 90_000 });
  const SEL_PRECIO = `input[aria-label="${PRECIO}"]`;
  const SEL_GESTORIA = `input[aria-label="${GESTORIA}"]`;
  const normaliza = (s: string | null) => (s ?? '').replace(/\s+/g, ' ').trim();
  const marcador = (page: Page) => page.locator('[class*="placeholder"] p');

  async function abrir(page: Page, ccaa: string, vende: 'particular' | 'promotor'): Promise<void> {
    await page.goto(RUTA);
    await esperarHidratacion(page, [SEL_PRECIO, SEL_GESTORIA]);
    await page.selectOption('#select-ccaa', ccaa);
    await elegirVendedor(page, vende);
  }

  async function elegirVendedor(page: Page, vende: 'particular' | 'promotor'): Promise<void> {
    const boton = page.getByRole('button', {
      name: vende === 'particular' ? /Un particular/ : /Promotor \/ Empresa/,
    });
    await boton.click();
    await expect(boton).toHaveAttribute('aria-pressed', 'true');
  }

  interface Tarjeta {
    titulo: string;
    valor: string;
    desc: string;
  }

  /** Las tarjetas del panel, en orden, con el texto normalizado (el U+00A0 pasa a espacio). */
  const tarjetas = (page: Page): Promise<Tarjeta[]> =>
    page.evaluate(() => {
      const cont = document.querySelector('[class*="resultados"]');
      const n = (s: string | undefined) => (s ?? '').replace(/\s+/g, ' ').trim();
      return [...(cont?.querySelectorAll('h3') ?? [])].map((h) => {
        const card = h.parentElement!.parentElement!;
        const valor = card.querySelector(':scope > div:nth-of-type(2) > p') as HTMLElement | null;
        const ps = card.querySelectorAll(':scope > p');
        return {
          titulo: n(h.innerText),
          valor: n(valor?.innerText),
          desc: ps.length ? n((ps[ps.length - 1] as HTMLElement).innerText) : '',
        };
      });
    });

  const euros = (s: string): number => parseSpanishNumber(s.replace(/\s?€$/, ''));
  const tarjeta = (ts: Tarjeta[], re: RegExp): Tarjeta => {
    const t = ts.find((x) => re.test(x.titulo));
    if (!t) throw new Error(`No hay tarjeta ${re} entre: ${ts.map((x) => x.titulo).join(' | ')}`);
    return t;
  };
  /** Las líneas del desglose (todo lo que tiene importe salvo el precio y los dos cierres). */
  const lineas = (ts: Tarjeta[]): number[] =>
    ts
      .filter((t) => !/^(Precio del solar|Total gastos|COSTE TOTAL)/.test(t.titulo) && /€$/.test(t.valor))
      .map((t) => euros(t.valor));

  /** El total es la suma de lo que se ve encima y el coste es precio + total, al céntimo. */
  function cuadra(ts: Tarjeta[], precio: number): void {
    const suma = lineas(ts).reduce((a, b) => a + b, 0);
    const total = euros(tarjeta(ts, /^Total gastos/).valor);
    expect(total).toBeCloseTo(suma, 2);
    expect(euros(tarjeta(ts, /^COSTE TOTAL/).valor)).toBeCloseTo(precio + total, 2);
    // Y el porcentaje intermedio que publica la descripción del total. Precisión 1 (±0,05 puntos):
    // vigila que el % siga al total (una gestoría de 500 € sobre 85.000 € ya lo mueve 0,59
    // puntos), no el redondeo del segundo decimal.
    const desc = tarjeta(ts, /^Total gastos/).desc;
    const pct = desc.match(/^([\d.,]+) % sobre el precio de compra/);
    expect(pct, `descripción del total: «${desc}»`).not.toBeNull();
    expect(parseSpanishNumber(pct![1])).toBeCloseTo((total / precio) * 100, 1);
  }

  /**
   * CASO 1 (NORMAL) — Galicia, vende un PARTICULAR, 85.000 €, gestoría 600. Comunidad sin escala.
   *   ITP = 85.000 × 8 % = 6.800,00 → «ITP (8,00 %)» · sin AJD (el ITP y la cuota gradual del AJD
   *   son incompatibles) · sin tarjeta de IVA · recuadro «ITP General 8 %», «AJD 1,5 %».
   */
  test('CASO 1 (normal) — Galicia, particular, 85.000 €: ITP 8 % = 6.800 € y el total cuadra con sus líneas', async ({ page }) => {
    await abrir(page, 'galicia', 'particular');
    await sembrarValor(page, SEL_GESTORIA, '600');
    await sembrarValor(page, SEL_PRECIO, '85000');
    const ts = await tarjetas(page);
    expect(tarjeta(ts, /^ITP \(/).titulo).toBe('ITP (8,00 %)');
    expect(tarjeta(ts, /^ITP \(/).valor).toBe('6800,00 €');
    expect(ts.some((t) => /^(AJD|IVA)/.test(t.titulo))).toBe(false);
    expect(tarjeta(ts, /^Gastos de gestoría/).valor).toBe('600,00 €');
    expect(tarjeta(ts, /^COSTE TOTAL/).titulo).toBe('COSTE TOTAL DE ADQUISICIÓN');
    cuadra(ts, 85000);
    const recuadro = normaliza(await page.locator('[class*="infoCcaa"]').first().innerText());
    expect(recuadro).toContain('ITP General 8 %');
    expect(recuadro).toContain('AJD 1,5 %');
  });

  /**
   * CASO 1-bis (NORMAL) — Castilla-La Mancha, vende un PROMOTOR, 150.000 €.
   *   IVA = 150.000 × 21 % = 31.500,00 · AJD = 150.000 × 1,5 % = 2.250,00 («AJD (1,50 %)»)
   */
  test('CASO 1-bis (normal) — Castilla-La Mancha, promotor, 150.000 €: IVA 31.500 € + AJD 2.250 €', async ({ page }) => {
    await abrir(page, 'castilla-mancha', 'promotor');
    await sembrarValor(page, SEL_PRECIO, '150000');
    const ts = await tarjetas(page);
    expect(tarjeta(ts, /^IVA \(/).titulo).toBe('IVA (21,00 %)');
    expect(tarjeta(ts, /^IVA \(/).valor).toBe('31.500,00 €');
    expect(tarjeta(ts, /^AJD \(/).titulo).toBe('AJD (1,50 %)');
    expect(tarjeta(ts, /^AJD \(/).valor).toBe('2250,00 €');
    expect(ts.some((t) => /^ITP/.test(t.titulo))).toBe(false);
    cuadra(ts, 150000);
  });

  /**
   * CASO 2 (LÍMITE) — País Vasco, 300.000 €. Un solar no es vivienda: ITP 7 % (no el 4 %) y AJD
   * del 0,5 % (la exención foral es de la primera VIVIENDA).
   *   particular: ITP = 300.000 × 7 % = 21.000,00 · promotor: IVA 63.000,00 + AJD 1.500,00
   * Y la forma de garaje y trastero (el AJD del recuadro de un selector oculto): aquí el recuadro
   * dice 0,5 % al cargar, tras pasar por el promotor y al volver. Se midió SANA.
   */
  test('CASO 2 (límite) — País Vasco, 300.000 €: ITP 7 %, IVA + AJD 0,5 %, y el AJD del recuadro no cambia con el vendedor', async ({ page }) => {
    await abrir(page, 'pais-vasco', 'particular');
    const ajdRecuadro = async () =>
      normaliza(await page.locator('[class*="infoCcaaItem"]', { hasText: /^AJD/ }).innerText());
    expect(await ajdRecuadro()).toBe('AJD 0,5 %');
    await sembrarValor(page, SEL_PRECIO, '300000');
    let ts = await tarjetas(page);
    expect(tarjeta(ts, /^ITP \(/).titulo).toBe('ITP (7,00 %)');
    expect(tarjeta(ts, /^ITP \(/).valor).toBe('21.000,00 €');
    cuadra(ts, 300000);

    await elegirVendedor(page, 'promotor');
    expect(await ajdRecuadro()).toBe('AJD 0,5 %');
    ts = await tarjetas(page);
    expect(tarjeta(ts, /^IVA \(/).valor).toBe('63.000,00 €');
    expect(tarjeta(ts, /^AJD \(/).titulo).toBe('AJD (0,50 %)');
    expect(tarjeta(ts, /^AJD \(/).valor).toBe('1500,00 €');
    cuadra(ts, 300000);

    await elegirVendedor(page, 'particular');
    expect(await ajdRecuadro()).toBe('AJD 0,5 %');
  });

  /**
   * CASO 2-bis (LÍMITE) — Extremadura, PARTICULAR, 700.000 €: los tres tramos de su escala.
   *   360.000 × 8 % + 240.000 × 10 % + 100.000 × 11 % = 28.800 + 24.000 + 11.000 = 63.800,00
   *   efectivo 63.800 / 700.000 = 9,1143 % → «ITP (9,11 %)»
   */
  test('CASO 2-bis (límite) — Extremadura, particular, 700.000 €: escala 8/10/11 → 63.800 € (9,11 %)', async ({ page }) => {
    await abrir(page, 'extremadura', 'particular');
    await sembrarValor(page, SEL_PRECIO, '700000');
    const ts = await tarjetas(page);
    expect(tarjeta(ts, /^ITP \(/).titulo).toBe('ITP (9,11 %)');
    expect(tarjeta(ts, /^ITP \(/).valor).toBe('63.800,00 €');
    cuadra(ts, 700000);
  });

  /**
   * CASO 2-ter (LÍMITE) — Canarias, PROMOTOR, 200.000 €: el IGIC no se calcula y el AJD sí.
   *   AJD = 200.000 × 0,75 % = 1.500,00 · cierre «(PARCIAL)» con «puede ser mayor» (el IGIC puede
   *   ser cero). Con la gestoría (450 €) ilegible el total y el coste BAJAN exactamente 450,00 €, el % del
   *   total también baja, y las dos cifras lo nombran; el coste pasa a «será mayor».
   */
  test('CASO 2-ter (límite) — Canarias, promotor, 200.000 €: IGIC sin calcular, AJD 0,75 % y la gestoría ilegible nombrada', async ({ page }) => {
    await abrir(page, 'canarias', 'promotor');
    await sembrarValor(page, SEL_PRECIO, '200000');
    await sembrarValor(page, SEL_GESTORIA, '450');
    const antes = await tarjetas(page);
    expect(tarjeta(antes, /^IGIC/).valor).toBe('No calculado');
    expect(tarjeta(antes, /^AJD \(/).titulo).toBe('AJD (0,75 %)');
    expect(tarjeta(antes, /^AJD \(/).valor).toBe('1500,00 €');
    expect(tarjeta(antes, /^Total gastos/).titulo).toBe('Total gastos adicionales (parcial)');
    expect(tarjeta(antes, /^COSTE TOTAL/).titulo).toBe('COSTE TOTAL (PARCIAL)');
    expect(tarjeta(antes, /^COSTE TOTAL/).desc).toMatch(/^No incluye el IGIC: el coste real puede ser mayor\./);
    cuadra(antes, 200000);

    await sembrarValor(page, SEL_GESTORIA, '2.000.50');
    const despues = await tarjetas(page);
    expect(euros(tarjeta(despues, /^Total gastos/).valor) - euros(tarjeta(antes, /^Total gastos/).valor)).toBeCloseTo(-450, 2);
    expect(euros(tarjeta(despues, /^COSTE TOTAL/).valor) - euros(tarjeta(antes, /^COSTE TOTAL/).valor)).toBeCloseTo(-450, 2);
    expect(tarjeta(despues, /^Total gastos/).desc).toContain('SIN la gestoría, que no se ha podido leer');
    expect(tarjeta(despues, /^COSTE TOTAL/).desc).toMatch(
      /^No incluye el IGIC ni la gestoría, que no se ha podido leer: el coste real será mayor\./,
    );
    cuadra(despues, 200000);
  });

  /**
   * Melilla, PROMOTOR, 400.000 €: IPSI sin calcular y AJD bonificado.
   *   AJD = 400.000 × 0,5 % × (1 − 0,5) = 1.000,00 → «AJD (0,25 %)», con la bonificación nombrada.
   */
  test('Melilla, promotor, 400.000 €: IPSI «No calculado» y AJD 0,25 % = 1.000 € con la bonificación nombrada', async ({ page }) => {
    await abrir(page, 'melilla', 'promotor');
    await sembrarValor(page, SEL_PRECIO, '400000');
    const ts = await tarjetas(page);
    expect(tarjeta(ts, /^IPSI/).valor).toBe('No calculado');
    expect(tarjeta(ts, /^AJD \(/).titulo).toBe('AJD (0,25 %)');
    expect(tarjeta(ts, /^AJD \(/).valor).toBe('1000,00 €');
    expect(tarjeta(ts, /^AJD \(/).desc).toContain('bonificación del 50 % de Ceuta y Melilla');
    cuadra(ts, 400000);
  });

  /**
   * CASO 3 (RECHAZO) — el precio ilegible se nombra y el imposible «no vale», y los dos mensajes
   * SOBREVIVEN a los controles que no son NumberInput: cambiar el vendedor y la comunidad no
   * vuelve a publicar cifra ni cambia el mensaje por el de «introduce».
   */
  test('CASO 3 (rechazo) — precio ilegible o imposible: sin cifra, nombrado, y estable al tocar vendedor y comunidad', async ({ page }) => {
    await abrir(page, 'galicia', 'particular');
    const cierre = page.locator('h3', { hasText: /^COSTE TOTAL/ });
    const casos: Array<[string, RegExp]> = [
      ['2.000.50', /^No se ha podido leer el precio «2\.000\.50»/],
      ['-120000', /^El precio escrito \(«-120000»\) tiene que ser mayor que 0/],
      ['0', /^El precio escrito \(«0»\) tiene que ser mayor que 0/],
    ];
    for (const [entrada, mensaje] of casos) {
      await sembrarValor(page, SEL_PRECIO, entrada);
      await expect(cierre).toHaveCount(0);
      await expect(marcador(page)).toHaveText(mensaje);
      await elegirVendedor(page, 'promotor');
      await page.selectOption('#select-ccaa', 'canarias');
      await expect(cierre).toHaveCount(0);
      await expect(marcador(page)).toHaveText(mensaje);
      await elegirVendedor(page, 'particular');
      await page.selectOption('#select-ccaa', 'galicia');
    }
  });

  /**
   * INVARIANTE en cuatro combinaciones de régimen × territorio que el testigo no recorre: la
   * gestoría de 450 € (no la de 500 que trae el campo: sembrar el valor que ya tiene no prueba
   * nada) pasa a «2.000.50». La dirección se MIDE: el total y el coste bajan 450,00 €
   * (la cifra queda POR DEBAJO de la real), y las dos cifras, más el % intermedio, lo nombran.
   * Después se tocan los dos controles que no son NumberInput y el aviso sigue al dato.
   */
  test('Invariante — la gestoría ilegible en 4 combinaciones: −450 € medido, nombrado en total, % y coste, y estable al tocar los selectores', async ({ page }) => {
    const combos: Array<[string, 'particular' | 'promotor', string, number]> = [
      ['galicia', 'particular', '85000', 85000],
      ['castilla-mancha', 'promotor', '150000', 150000],
      ['canarias', 'particular', '200000', 200000],
      // Por encima del límite del arancel notarial: dos ausencias en el mismo aviso.
      ['madrid', 'promotor', '6.500.000', 6500000],
    ];
    for (const [ccaa, vende, texto, precio] of combos) {
      await abrir(page, ccaa, vende);
      await sembrarValor(page, SEL_PRECIO, texto);
      await sembrarValor(page, SEL_GESTORIA, '450');
      const a = await tarjetas(page);
      await sembrarValor(page, SEL_GESTORIA, '2.000.50');
      const b = await tarjetas(page);
      const etiqueta = `${ccaa}/${vende}`;
      expect(euros(tarjeta(b, /^Total gastos/).valor) - euros(tarjeta(a, /^Total gastos/).valor), etiqueta).toBeCloseTo(-450, 2);
      expect(euros(tarjeta(b, /^COSTE TOTAL/).valor) - euros(tarjeta(a, /^COSTE TOTAL/).valor), etiqueta).toBeCloseTo(-450, 2);
      expect(tarjeta(b, /^Gastos de gestoría/).valor, etiqueta).toBe('Sin leer');
      expect(tarjeta(b, /^Total gastos/).titulo, etiqueta).toBe('Total gastos adicionales (parcial)');
      expect(tarjeta(b, /^Total gastos/).desc, etiqueta).toContain('SIN la gestoría, que no se ha podido leer');
      expect(tarjeta(b, /^COSTE TOTAL/).titulo, etiqueta).toBe('COSTE TOTAL (PARCIAL)');
      expect(tarjeta(b, /^COSTE TOTAL/).desc, etiqueta).toMatch(/la gestoría, que no se ha podido leer[^:]*: el coste real será mayor/);
      cuadra(b, precio);

      // Los controles que no son NumberInput no borran el aviso.
      await elegirVendedor(page, vende === 'particular' ? 'promotor' : 'particular');
      await page.selectOption('#select-ccaa', ccaa === 'galicia' ? 'rioja' : 'galicia');
      const c = await tarjetas(page);
      expect(tarjeta(c, /^Gastos de gestoría/).valor, etiqueta).toBe('Sin leer');
      expect(tarjeta(c, /^COSTE TOTAL/).titulo, etiqueta).toBe('COSTE TOTAL (PARCIAL)');
      expect(tarjeta(c, /^COSTE TOTAL/).desc, etiqueta).toMatch(/la gestoría, que no se ha podido leer[^:]*: el coste real será mayor/);
    }
  });

  /**
   * Barrido: las 19 comunidades × los dos regímenes a 700.000 €, contra la tabla resuelta a mano
   * (cabecera de este bloque). Con promotor, Canarias, Ceuta y Melilla publican «No calculado».
   */
  test('Barrido — 19 comunidades × particular/promotor a 700.000 €: ITP, IVA y AJD de un solar', async ({ page }) => {
    const ESPERADO: Record<string, { itp: string; rotuloItp: string; ajd: string; rotuloAjd: string }> = {
      andalucia: { itp: '49.000,00 €', rotuloItp: 'ITP (7,00 %)', ajd: '8400,00 €', rotuloAjd: 'AJD (1,20 %)' },
      aragon: { itp: '59.750,00 €', rotuloItp: 'ITP (8,54 %)', ajd: '10.500,00 €', rotuloAjd: 'AJD (1,50 %)' },
      asturias: { itp: '62.000,00 €', rotuloItp: 'ITP (8,86 %)', ajd: '8400,00 €', rotuloAjd: 'AJD (1,20 %)' },
      baleares: { itp: '60.000,00 €', rotuloItp: 'ITP (8,57 %)', ajd: '10.500,00 €', rotuloAjd: 'AJD (1,50 %)' },
      canarias: { itp: '45.500,00 €', rotuloItp: 'ITP (6,50 %)', ajd: '5250,00 €', rotuloAjd: 'AJD (0,75 %)' },
      cantabria: { itp: '63.000,00 €', rotuloItp: 'ITP (9,00 %)', ajd: '10.500,00 €', rotuloAjd: 'AJD (1,50 %)' },
      'castilla-leon': { itp: '65.000,00 €', rotuloItp: 'ITP (9,29 %)', ajd: '10.500,00 €', rotuloAjd: 'AJD (1,50 %)' },
      'castilla-mancha': { itp: '63.000,00 €', rotuloItp: 'ITP (9,00 %)', ajd: '10.500,00 €', rotuloAjd: 'AJD (1,50 %)' },
      cataluna: { itp: '71.000,00 €', rotuloItp: 'ITP (10,14 %)', ajd: '10.500,00 €', rotuloAjd: 'AJD (1,50 %)' },
      valencia: { itp: '63.000,00 €', rotuloItp: 'ITP (9,00 %)', ajd: '9800,00 €', rotuloAjd: 'AJD (1,40 %)' },
      extremadura: { itp: '63.800,00 €', rotuloItp: 'ITP (9,11 %)', ajd: '10.500,00 €', rotuloAjd: 'AJD (1,50 %)' },
      galicia: { itp: '56.000,00 €', rotuloItp: 'ITP (8,00 %)', ajd: '10.500,00 €', rotuloAjd: 'AJD (1,50 %)' },
      madrid: { itp: '42.000,00 €', rotuloItp: 'ITP (6,00 %)', ajd: '5250,00 €', rotuloAjd: 'AJD (0,75 %)' },
      murcia: { itp: '54.250,00 €', rotuloItp: 'ITP (7,75 %)', ajd: '10.500,00 €', rotuloAjd: 'AJD (1,50 %)' },
      navarra: { itp: '42.000,00 €', rotuloItp: 'ITP (6,00 %)', ajd: '3500,00 €', rotuloAjd: 'AJD (0,50 %)' },
      'pais-vasco': { itp: '49.000,00 €', rotuloItp: 'ITP (7,00 %)', ajd: '3500,00 €', rotuloAjd: 'AJD (0,50 %)' },
      rioja: { itp: '49.000,00 €', rotuloItp: 'ITP (7,00 %)', ajd: '7000,00 €', rotuloAjd: 'AJD (1,00 %)' },
      ceuta: { itp: '21.000,00 €', rotuloItp: 'ITP (3,00 %)', ajd: '1750,00 €', rotuloAjd: 'AJD (0,25 %)' },
      melilla: { itp: '21.000,00 €', rotuloItp: 'ITP (3,00 %)', ajd: '1750,00 €', rotuloAjd: 'AJD (0,25 %)' },
    };
    const SIN_IVA: Record<string, string> = { canarias: 'IGIC', ceuta: 'IPSI', melilla: 'IPSI' };
    await abrir(page, 'madrid', 'particular');
    await sembrarValor(page, SEL_PRECIO, '700000');
    const desajustes: string[] = [];
    for (const vende of ['particular', 'promotor'] as const) {
      await elegirVendedor(page, vende);
      for (const [ccaa, e] of Object.entries(ESPERADO)) {
        await page.selectOption('#select-ccaa', ccaa);
        await expect(page.locator('#select-ccaa')).toHaveValue(ccaa);
        const ts = await tarjetas(page);
        const impuesto = ts[1];
        const ajd = ts.find((t) => /^AJD \(/.test(t.titulo));
        const obtenido =
          vende === 'particular'
            ? `${impuesto.titulo} ${impuesto.valor} · AJD ${ajd ? ajd.valor : '—'}`
            : `${impuesto.titulo} ${impuesto.valor} · ${ajd ? `${ajd.titulo} ${ajd.valor}` : 'sin AJD'}`;
        const esperado =
          vende === 'particular'
            ? `${e.rotuloItp} ${e.itp} · AJD —`
            : `${SIN_IVA[ccaa] ? `${SIN_IVA[ccaa]} No calculado` : 'IVA (21,00 %) 147.000,00 €'} · ${e.rotuloAjd} ${e.ajd}`;
        if (obtenido !== esperado) desajustes.push(`${ccaa}/${vende}: esperado «${esperado}» · obtenido «${obtenido}»`);
      }
    }
    expect(desajustes).toEqual([]);
  });

  /**
   * Forma (c) en TODA la página, no solo en el panel: con la guía abierta, ningún «%» sin espacio
   * duro en el texto visible de ninguna de las 19 comunidades (sus notas llegan de data/ con el
   * «%» pegado y `separarPorcentajes` las corrige). Se midió SANA.
   */
  test('Forma (c) — ni un «%» sin espacio duro en el texto visible, con la guía abierta, en las 19 comunidades', async ({ page }) => {
    await abrir(page, 'madrid', 'promotor');
    await sembrarValor(page, SEL_PRECIO, '120000');
    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
    const malos = new Set<string>();
    for (const ccaa of Object.keys(ITP_CCAA)) {
      await page.selectOption('#select-ccaa', ccaa);
      await expect(page.locator('#select-ccaa')).toHaveValue(ccaa);
      const texto = await page.evaluate(() => document.body.innerText);
      for (const m of texto.matchAll(/.{0,20}\d ?%/g)) malos.add(`${ccaa}: ${m[0]}`);
    }
    expect([...malos]).toEqual([]);
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // HALLAZGOS del 06/10/2026 (2916-2919). Se escribieron afirmando lo que DEBERÍA pasar, con
  // `test.fail()` (salvo con `VER_HUECOS=1`). Se repararon ese mismo día: la marca se quitó y
  // quedan aquí como regresión (a 08/10/2026 la base no tiene ninguno abierto).
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * REPARADO el 06/10/2026 (hallazgo 2916, operativa) — un importe PEGADO con el símbolo del
   * euro o con espacios no llegaba a la app: el `handleChange` de components/NumberInput.tsx
   * descartaba entero cualquier valor que no casara con /^-?[\d.,]*$/, así que el campo
   * conservaba lo que tenía y la app seguía publicando el desglose del precio ANTERIOR, sin una
   * palabra. Ahora el control quita espacios (también el duro), «€», «$», «£» y «%» antes de
   * filtrar: «120.000 €» entra como «120.000», que parseSpanishNumber lee como 120.000.
   */
  test('pegar «120.000 €» sobre un precio de 85.000 € publica el desglose de 120.000 €', async ({ page }) => {
    await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
    await abrir(page, 'madrid', 'particular');
    await sembrarValor(page, SEL_PRECIO, '85000');
    expect(tarjeta(await tarjetas(page), /^Precio del solar/).valor).toBe('85.000,00 €');
    await page.evaluate((t) => navigator.clipboard.writeText(t), '120.000 €');
    await page.locator(SEL_PRECIO).click();
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Control+V');
    await expect(page.locator(SEL_PRECIO)).toHaveValue('120.000', { timeout: 3000 });
    await expect
      .poll(async () => tarjeta(await tarjetas(page), /^Precio del solar/).valor)
      .toBe('120.000,00 €');

    // Un número de miles con espacio, como lo escribe media Europa, también entra
    await page.locator(SEL_PRECIO).click();
    await page.keyboard.press('Control+A');
    await page.evaluate((t) => navigator.clipboard.writeText(t), '95 000');
    await page.keyboard.press('Control+V');
    await expect(page.locator(SEL_PRECIO)).toHaveValue('95000', { timeout: 3000 });
  });

  /**
   * REPARADO el 06/10/2026 (hallazgo 2917): las dos notas se reescribieron en data/itp-ccaa.ts
   * (Canarias, «Exención total para VPO.»; Andalucía, «Tipo reducido del 3,5% en la vivienda
   * habitual…»). Era así: desde 2208 el recuadro pinta las notas de cada comunidad, y dos decían
   * lo contrario de la tabla de la que salen:
   *  · Canarias: «ITP más bajo de España junto con País Vasco y Madrid». Para un solar Canarias
   *    cobra 6,5 % y la misma app da 6 % en Madrid y Navarra (3 % efectivo en Ceuta y Melilla) y
   *    7 % en el País Vasco (TIPOS_ITP_CCAA_2025 y su `tipoNoVivienda`).
   *  · Andalucía: «Bonificación del 3,5 %», cuando ITP_CCAA['andalucia'] lo declara como TIPO
   *    reducido del 3,5 % (no una rebaja del 3,5 % de la cuota).
   */
  test('las notas de Canarias y Andalucía del recuadro no contradicen la tabla de tipos', async ({ page }) => {
    expect(ITP_CCAA['canarias'].tipoGeneral).toBe(6.5);
    expect(ITP_CCAA['madrid'].tipoGeneral).toBe(6);
    expect(ITP_CCAA['navarra'].tipoGeneral).toBe(6);
    expect(ITP_CCAA['pais-vasco'].tipoGeneralNoVivienda).toBe(7);
    expect(ITP_CCAA['andalucia'].tiposReducidos.some((r) => r.tipo === 3.5)).toBe(true);

    await abrir(page, 'canarias', 'particular');
    const recuadro = async () => normaliza(await page.locator('[class*="infoCcaa"]').first().innerText());
    expect(await recuadro()).toContain('ITP General 6,5 %');
    expect(await recuadro()).toContain('Exención total para VPO');
    expect(await recuadro()).not.toMatch(/ITP más bajo de España/);

    await page.selectOption('#select-ccaa', 'andalucia');
    await expect.poll(recuadro).toContain('Tipo reducido del 3,5');
    expect(await recuadro()).toMatch(/vivienda habitual/);
    expect(await recuadro()).not.toMatch(/Bonificación del 3,5/);
  });

  /**
   * REPARADO el 06/10/2026 (hallazgo 2918): las dos respuestas nombran el IGIC y el IPSI.
   * Era así (contenido) — residuo de 731/1596 en el canal que leen las IA. La FAQ VISIBLE dice
   * «sujeta a IVA al 21 % — o al IGIC o el IPSI en Canarias, Ceuta y Melilla», pero en el
   * FAQPage del JSON-LD la pregunta gemela («¿Por qué un solar de empresario lleva IVA y no
   * ITP?») y la de la finca rústica afirman el IVA del 21 % sin excepción. Se espera que toda
   * respuesta que publique el IVA del 21 % lleve la excepción.
   */
  test('el FAQPage no afirma el IVA del 21 % sin la excepción de Canarias, Ceuta y Melilla', async ({ page }) => {
    await page.goto(RUTA);
    const bloques = await page.locator('script[type="application/ld+json"]').allTextContents();
    const faq = JSON.parse(bloques.find((b) => b.includes('FAQPage')) ?? '{}') as {
      mainEntity: Array<{ name: string; acceptedAnswer: { text: string } }>;
    };
    const conIva = faq.mainEntity.filter((q) => /IVA (al )?21\s?%/.test(q.acceptedAnswer.text));
    expect(conIva.length).toBeGreaterThanOrEqual(3);
    const sinExcepcion = conIva.filter((q) => !/IGIC|IPSI/.test(q.acceptedAnswer.text)).map((q) => q.name);
    expect(sinExcepcion).toEqual([]);
  });

  /**
   * REPARADO el 06/10/2026 (hallazgo 2919): las dos respuestas generales llevan la salvedad.
   * Era así (contenido) — forma ATENUADA del 2914 de nave-industrial (residuo del 2208). La
   * tarjeta del ITP y el recuadro ya dicen que alguna comunidad tiene tipos ligados a la
   * ACTIVIDAD, y en Aragón el recuadro pinta el 1 % del art. 121-11 (inmueble para iniciar una
   * actividad económica; ITP_CCAA.aragon.notas). Pero las dos respuestas generales —«¿Se paga IVA
   * o ITP al comprar un solar?» en la FAQ visible y en el FAQPage— siguen diciendo que, si vende
   * un particular, se tributa «al tipo general de la comunidad», sin salvedad. Aquí no hay un «no
   * aplican» como en la nave: es la afirmación sin excepción. Aragón, 300.000 €: 24.000 € al 8 %
   * frente a 3.000 € al 1 % si el solar se compra para iniciar una actividad.
   */
  test('la FAQ y el FAQPage dan el ITP «al tipo general» con la salvedad de los tipos ligados a la actividad', async ({ page }) => {
    expect(ITP_CCAA['aragon'].notas).toContain('art. 121-11');
    await abrir(page, 'aragon', 'particular');
    await sembrarValor(page, SEL_PRECIO, '300000');
    const ts = await tarjetas(page);
    expect(tarjeta(ts, /^ITP \(/).valor).toBe('24.000,00 €');
    expect(normaliza(await page.locator('[class*="infoCcaa"]').first().innerText())).toContain('121-11');

    const frase = (texto: string) => normaliza(texto).match(/[^.]*ITP al tipo general[^.]*\./)?.[0] ?? '';
    const conSalvedad = /salvo|excepto|aunque|ligad|121-11|actividad econ/;
    const bloques = await page.locator('script[type="application/ld+json"]').allTextContents();
    const faqLd = JSON.parse(bloques.find((b) => b.includes('FAQPage')) ?? '{}') as {
      mainEntity: Array<{ name: string; acceptedAnswer: { text: string } }>;
    };
    const ld = faqLd.mainEntity.find((q) => q.name === '¿Se paga IVA o ITP al comprar un solar?')!.acceptedAnswer.text;
    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
    const visible = await page
      .locator('div', { has: page.locator('strong', { hasText: '¿Se paga IVA o ITP al comprar un solar?' }) })
      .last()
      .innerText();
    expect(frase(ld)).not.toBe('');
    expect(frase(visible)).not.toBe('');
    expect(frase(ld)).toMatch(conSalvedad);
    expect(frase(visible)).toMatch(conSalvedad);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// INSPECTOR 08/10/2026 — la familia «Compraventa inmobiliaria» entera, una hermana por agente
// (referencia: estimador-compraventa-inmueble; testigo tests/familias/compraventa.spec.ts, 82/82
// en verde ese día). Tres casos resueltos a mano ANTES de abrir el navegador, el invariante de la
// familia campo a campo (la app tiene dos NumberInput: el precio y la gestoría), el refactor
// 99e1ee7e de las relacionadas y las cuatro sospechas del 06/10 medidas aquí:
//   (a) la coma que cierra «que no se ha podido leer» antes de «ni» → HALLAZGO [08/10-a];
//   (b) el patrón 5 («no falta, no vale») en un campo que no puede valer 0 → la app no tiene valor
//       catastral, la gestoría sí puede valer 0 y el precio ya distingue «0», «0,00» y el
//       negativo con el foco (CASO 3) → SANA;
//   (c) los rangos de ITP y AJD frente a la bonificación de Ceuta y Melilla → SANA en las cuatro
//       bocas que dan un rango (sello, tabla, «escriturar» y FAQPage);
//   (d) la misma pregunta con dos redacciones → HALLAZGO [08/10-c] (cuatro parejas); una de ellas
//       arrastra el [08/10-d], la condición del IVA deducible sin «no exenta».
// Y el [08/10-b]: el nombre oficial de ITP_CCAA.nombre sin artículo en dos frases de page.tsx.
//
// De dónde sale cada cifra esperada (ninguna de memoria):
//   · ITP de un solar → TIPOS_ITP_CCAA_2025 (data/fiscal/inmuebles.ts): Cantabria 9 %, sin escala
//     ni umbral en ITP_CCAA; Ceuta 6 % (excepción declarada en data/itp-ccaa.ts) por
//     BONIFICACION_CUOTA_CEUTA_MELILLA = 0,5 (art. 57 bis TRLITPAJD) → 3 % efectivo.
//   · AJD de un solar → ITP_CCAA[x].ajd: La Rioja 1 %, Navarra 0,5 %, Madrid 0,75 %.
//   · IVA → PORCENTAJES_IVA.general = 21 (data/fiscal/iva.ts).
//   · Límite del arancel notarial → LIMITE_ARANCEL_NOTARIAL = 6.010.121,04 € (RD 1426/1989, nº 2.1).
//   · Condición del IVA deducible → Ley 37/1992 (la fuente de FISCAL_IVA_META), consolidado
//     BOE-A-1992-28740 leído el 08/10/2026: art. 94.Uno.1.º.a) «Las entregas de bienes y
//     prestaciones de servicios sujetas y no exentas del Impuesto sobre el Valor Añadido»;
//     art. 20.Uno.23.º.b) exime el arrendamiento de «edificios o partes de los mismos destinados
//     exclusivamente a viviendas».
// Notaría y registro, sin literal: los hallazgos 2901 y 2902 (rebaja del 5 % de los dos aranceles,
// abiertos en la referencia) los moverán. Se exige que el total cuadre con las líneas visibles.
// Resueltos a mano con el motor de hoy, y coincidentes con la app: Cantabria 230.000 → notaría
// 790,75 (677,78–903,71) y registro 247,11; La Rioja 82.500 → 562,85 y 156,68; Navarra 95.000 →
// 589,31 y 168,02; Ceuta 7.000.000, sin IPSI → 3817,93 (3272,51–4363,34) y 1595,33.
//
// Los hallazgos van con `test.fail()` salvo con `VER_HUECOS=1`, que enseña el fallo (el mismo
// interruptor que el testigo de la familia). Al repararlos, quitar la marca y reescribir en pasado.
// ═══════════════════════════════════════════════════════════════════════════════

const I08_VER_HUECOS = Boolean(process.env.VER_HUECOS);

test.describe('Inspector 08/10/2026 — casos a mano, el invariante campo a campo y las sospechas (a)-(d)', () => {
  test.describe.configure({ timeout: 90_000 });
  const SEL_PRECIO = `input[aria-label="${PRECIO}"]`;
  const SEL_GESTORIA = `input[aria-label="${GESTORIA}"]`;
  const n = (s: string | null | undefined): string => (s ?? '').replace(/\s+/g, ' ').trim();
  /** El marcador del panel sin cifra (y no el anunciador de rutas de Next). */
  const marcador = (page: Page) => page.locator('[class*="placeholder"] p');

  async function elegirVendedor(page: Page, vende: 'particular' | 'promotor'): Promise<void> {
    const boton = page.getByRole('button', {
      name: vende === 'particular' ? /Un particular/ : /Promotor \/ Empresa/,
    });
    await boton.click();
    await expect(boton).toHaveAttribute('aria-pressed', 'true');
  }

  async function abrir(page: Page, ccaa: string, vende: 'particular' | 'promotor'): Promise<void> {
    await page.goto(RUTA);
    await esperarHidratacion(page, [SEL_PRECIO, SEL_GESTORIA]);
    await page.selectOption('#select-ccaa', ccaa);
    await expect(page.locator('#select-ccaa')).toHaveValue(ccaa);
    await elegirVendedor(page, vende);
  }

  interface I08Tarjeta {
    titulo: string;
    valor: string;
    desc: string;
  }

  /** Las tarjetas del panel, en orden, con el texto normalizado (el U+00A0 pasa a espacio). */
  const leer = (page: Page): Promise<I08Tarjeta[]> =>
    page.evaluate(() => {
      const cont = document.querySelector('[class*="resultados"]');
      const norm = (s: string | undefined) => (s ?? '').replace(/\s+/g, ' ').trim();
      return [...(cont?.querySelectorAll('h3') ?? [])].map((h) => {
        const card = h.parentElement!.parentElement!;
        const valor = card.querySelector(':scope > div:nth-of-type(2) > p') as HTMLElement | null;
        const ps = card.querySelectorAll(':scope > p');
        return {
          titulo: norm(h.innerText),
          valor: norm(valor?.innerText),
          desc: ps.length ? norm((ps[ps.length - 1] as HTMLElement).innerText) : '',
        };
      });
    });

  const euros = (s: string): number => parseSpanishNumber(s.replace(/\s?€$/, ''));
  const tarjeta = (ts: I08Tarjeta[], re: RegExp): I08Tarjeta => {
    const x = ts.find((c) => re.test(c.titulo));
    if (!x) throw new Error(`No hay tarjeta ${re} entre: ${ts.map((c) => c.titulo).join(' | ')}`);
    return x;
  };

  /**
   * El total es la suma de lo que se ve encima, el coste es precio + total, y el % de la
   * descripción del total sigue al total. Precisión 1 en el % (±0,05 puntos): vigila que el %
   * siga al total —una gestoría ilegible de 300 € sobre 95.000 € lo mueve 0,32 puntos—, no el
   * redondeo del segundo decimal.
   */
  function cuadra(ts: I08Tarjeta[], precio: number): void {
    const lineas = ts
      .filter((c) => !/^(Precio del solar|Total gastos|COSTE TOTAL)/.test(c.titulo) && /€$/.test(c.valor))
      .map((c) => euros(c.valor));
    const total = euros(tarjeta(ts, /^Total gastos/).valor);
    expect(total).toBeCloseTo(lineas.reduce((a, b) => a + b, 0), 2);
    expect(euros(tarjeta(ts, /^COSTE TOTAL/).valor)).toBeCloseTo(precio + total, 2);
    const desc = tarjeta(ts, /^Total gastos/).desc;
    const pct = desc.match(/^([\d.,]+) % sobre el precio de compra/);
    expect(pct, `descripción del total: «${desc}»`).not.toBeNull();
    expect(parseSpanishNumber(pct![1])).toBeCloseTo((total / precio) * 100, 1);
  }

  /** El FAQPage del JSON-LD, pregunta → respuesta normalizada. */
  async function faqLd(page: Page): Promise<Map<string, string>> {
    const bloques = await page.locator('script[type="application/ld+json"]').allTextContents();
    const faq = JSON.parse(bloques.find((b) => b.includes('"FAQPage"')) ?? '{}') as {
      mainEntity: Array<{ name: string; acceptedAnswer: { text: string } }>;
    };
    return new Map(faq.mainEntity.map((q): [string, string] => [q.name, n(q.acceptedAnswer.text)]));
  }

  /** La FAQ visible (la guía ya abierta), pregunta → respuesta normalizada. */
  async function faqVisible(page: Page): Promise<Map<string, string>> {
    const pares = await page.evaluate(() => {
      const h2 = [...document.querySelectorAll('h2')].find((h) => /Preguntas frecuentes/.test(h.textContent ?? ''));
      const cont = h2?.parentElement?.querySelector('div');
      return [...(cont?.children ?? [])].map((d) => [
        (d.querySelector('strong') as HTMLElement | null)?.innerText ?? '',
        (d.querySelector('p') as HTMLElement | null)?.innerText ?? '',
      ]);
    });
    return new Map(pares.map(([p, r]): [string, string] => [n(p), n(r)]));
  }

  /**
   * CASO 1 (NORMAL) — Cantabria, vende un PARTICULAR, 230.000 €, gestoría 650 €.
   *   ITP = 230.000 × 9 % = 20.700,00 → «ITP (9,00 %)»; sin AJD (incompatible con el ITP) ni IVA.
   *   Cierre completo. A mano, con el motor de hoy: 20.700 + 790,75 + 247,11 + 650 = 22.387,86
   *   (9,73 %) y coste 252.387,86; aquí se fijan el ITP, la gestoría y el cuadre (2901/2902).
   */
  test('CASO 1 (normal) — Cantabria, particular, 230.000 €: ITP 9 % = 20.700 € y el cierre cuadra', async ({ page }) => {
    await abrir(page, 'cantabria', 'particular');
    await sembrarValor(page, SEL_GESTORIA, '650');
    await sembrarValor(page, SEL_PRECIO, '230000');
    const ts = await leer(page);
    expect(tarjeta(ts, /^Precio del solar/).valor).toBe('230.000,00 €');
    expect(tarjeta(ts, /^ITP \(/).titulo).toBe('ITP (9,00 %)');
    expect(tarjeta(ts, /^ITP \(/).valor).toBe('20.700,00 €');
    expect(ts.some((c) => /^(AJD|IVA|IGIC|IPSI)/.test(c.titulo))).toBe(false);
    expect(tarjeta(ts, /^Gastos de notaría/).titulo).toBe('Gastos de notaría (IVA incluido)');
    expect(tarjeta(ts, /^Gastos de gestoría/).valor).toBe('650,00 €');
    expect(tarjeta(ts, /^Total gastos/).titulo).toBe('Total gastos adicionales');
    expect(tarjeta(ts, /^COSTE TOTAL/).titulo).toBe('COSTE TOTAL DE ADQUISICIÓN');
    expect(tarjeta(ts, /^COSTE TOTAL/).desc).toBe('Precio + todos los gastos de la operación');
    cuadra(ts, 230000);
    const recuadro = n(await page.locator('[class*="infoCcaa"]').first().innerText());
    expect(recuadro).toContain('ITP General 9 %');
    expect(recuadro).toContain('AJD 1,5 %');
  });

  /**
   * CASO 1-bis (NORMAL) — La Rioja, vende un PROMOTOR, 82.500 € (con punto de millar), la gestoría
   * de 500 € que trae el campo.
   *   IVA = 82.500 × 21 % = 17.325,00 · AJD = 82.500 × 1 % = 825,00 → «AJD (1,00 %)»
   *   A mano: 17.325 + 825 + 562,85 + 156,68 + 500 = 19.369,53 (23,48 %), coste 101.869,53.
   */
  test('CASO 1-bis (normal) — La Rioja, promotor, 82.500 €: IVA 17.325 € + AJD 1 % = 825 €', async ({ page }) => {
    await abrir(page, 'rioja', 'promotor');
    await sembrarValor(page, SEL_PRECIO, '82.500');
    const ts = await leer(page);
    expect(tarjeta(ts, /^Precio del solar/).valor).toBe('82.500,00 €');
    expect(tarjeta(ts, /^IVA \(/).titulo).toBe('IVA (21,00 %)');
    expect(tarjeta(ts, /^IVA \(/).valor).toBe('17.325,00 €');
    expect(tarjeta(ts, /^AJD \(/).titulo).toBe('AJD (1,00 %)');
    expect(tarjeta(ts, /^AJD \(/).valor).toBe('825,00 €');
    expect(ts.some((c) => /^ITP/.test(c.titulo))).toBe(false);
    expect(tarjeta(ts, /^COSTE TOTAL/).titulo).toBe('COSTE TOTAL DE ADQUISICIÓN');
    expect(tarjeta(ts, /^COSTE TOTAL/).desc).toBe(
      `Precio + todos los gastos (antes de deducir el IVA si tienes derecho). ${AVISO_BASE_AJD}`,
    );
    cuadra(ts, 82500);
  });

  /**
   * CASO 2 (LÍMITE) — Ceuta, vende un PARTICULAR, 7.000.000 €, gestoría 750 €: tres límites a la vez.
   *   ITP = 7.000.000 × 6 % × (1 − 0,5) = 210.000,00 → «ITP (3,00 %)» (art. 57 bis.3.a);
   *   el precio pasa de 6.010.121,04 € → la parte de la notaría que excede es de libre acuerdo;
   *   Ceuta no lleva IVA en las facturas → notaría y registro «(sin IPSI)» y la nota de debajo.
   *   Cierre «(parcial)»: el total nombra la notaría libre y el IPSI de los honorarios, y el coste
   *   dice «puede ser mayor». A mano: 210.000 + 3817,93 + 1595,33 + 750 = 216.163,26 (3,09 %).
   *   INVARIANTE: con la gestoría «2.000.50», total y coste BAJAN 750,00 € (la cifra queda por
   *   debajo de la real), el total, su % y el coste lo nombran, y el coste pasa a «será mayor».
   */
  test('CASO 2 (límite) — Ceuta, particular, 7.000.000 €: ITP 3 %, notaría de libre acuerdo, honorarios sin IPSI y la gestoría ilegible nombrada', async ({ page }) => {
    await abrir(page, 'ceuta', 'particular');
    await sembrarValor(page, SEL_GESTORIA, '750');
    await sembrarValor(page, SEL_PRECIO, '7.000.000');
    const a = await leer(page);
    expect(tarjeta(a, /^ITP \(/).titulo).toBe('ITP (3,00 %)');
    expect(tarjeta(a, /^ITP \(/).valor).toBe('210.000,00 €');
    expect(tarjeta(a, /^ITP \(/).desc).toContain('con la bonificación del 50 % de la cuota ya aplicada');
    expect(tarjeta(a, /^Gastos de notaría/).titulo).toBe('Gastos de notaría (sin IPSI)');
    expect(tarjeta(a, /^Gastos de notaría/).desc).toMatch(/^Arancel hasta 6\.010\.121,04 €: factura estimada entre/);
    expect(tarjeta(a, /^Registro de la Propiedad/).titulo).toBe('Registro de la Propiedad (sin IPSI)');
    expect(tarjeta(a, /^Gastos de gestoría/).valor).toBe('750,00 €');
    expect(tarjeta(a, /^Total gastos/).titulo).toBe('Total gastos adicionales (parcial)');
    expect(tarjeta(a, /^Total gastos/).desc).toContain(
      'SIN la parte de la notaría de libre acuerdo (el valor que excede de 6.010.121,04 €)',
    );
    expect(tarjeta(a, /^Total gastos/).desc.endsWith(sinHonorarios('IPSI'))).toBe(true);
    expect(tarjeta(a, /^COSTE TOTAL/).titulo).toBe('COSTE TOTAL (PARCIAL)');
    expect(tarjeta(a, /^COSTE TOTAL/).desc).toBe('No incluye la parte de la notaría de libre acuerdo: el coste real puede ser mayor');
    await expect(page.locator('[class*="avisoHonorarios"]')).toContainText('llevan además IPSI');
    cuadra(a, 7000000);

    await sembrarValor(page, SEL_GESTORIA, '2.000.50');
    const b = await leer(page);
    expect(tarjeta(b, /^Gastos de gestoría/).valor).toBe('Sin leer');
    expect(euros(tarjeta(b, /^Total gastos/).valor) - euros(tarjeta(a, /^Total gastos/).valor)).toBeCloseTo(-750, 2);
    expect(euros(tarjeta(b, /^COSTE TOTAL/).valor) - euros(tarjeta(a, /^COSTE TOTAL/).valor)).toBeCloseTo(-750, 2);
    expect(tarjeta(b, /^Total gastos/).desc).toContain('SIN la gestoría, que no se ha podido leer');
    // La coma que falta antes de «ni» es el [08/10-a]: aquí se tolera y se mide la dirección.
    expect(tarjeta(b, /^COSTE TOTAL/).desc).toMatch(
      /^No incluye la gestoría, que no se ha podido leer,? ni la parte de la notaría de libre acuerdo: el coste real será mayor$/,
    );
    cuadra(b, 7000000);
  });

  /**
   * CASO 3 (RECHAZO) — Navarra, vende un PROMOTOR. El precio:
   *   «-50000» sin salir del campo → no vale (patrón 5), con lo escrito entre comillas;
   *   al salir, el min={0} lo deja en «0» → el mismo mensaje con «0»;
   *   «0,00» → no vale; «7.000.000,00.5» (dos separadores decimales) → no se lee, y se nombra.
   *   Ninguno publica cifra. Con «95.000» y la gestoría 300 → IVA 19.950,00 + AJD (0,50 %) 475,00
   *   (a mano: + 589,31 + 168,02 + 300 = 21.482,33, 22,61 %). La gestoría «1,500,5» (dos comas
   *   que no agrupan millares) es ILEGIBLE: total y coste bajan 300,00 € (21.182,33, 22,30 %) y la
   *   app lo nombra en el total, el % y el coste, con «será mayor» y la salvedad del IVA deducible.
   */
  test('CASO 3 (rechazo) — Navarra, promotor: «-50000», «0» y «0,00» no valen, «7.000.000,00.5» no se lee; la gestoría «1,500,5» se nombra', async ({ page }) => {
    await abrir(page, 'navarra', 'promotor');
    const cierre = page.locator('h3', { hasText: /^COSTE TOTAL/ });
    await sembrarValor(page, SEL_PRECIO, '-50000');
    await expect(cierre).toHaveCount(0);
    await expect(marcador(page)).toHaveText(
      'El precio escrito («-50000») tiene que ser mayor que 0: corrígelo para ver el desglose de gastos del solar.',
    );
    await page.locator(SEL_PRECIO).focus();
    await page.locator(SEL_PRECIO).blur();
    await esperarValorEnReact(page, SEL_PRECIO, '0');
    await expect(cierre).toHaveCount(0);
    await expect(marcador(page)).toHaveText(
      'El precio escrito («0») tiene que ser mayor que 0: corrígelo para ver el desglose de gastos del solar.',
    );
    await sembrarValor(page, SEL_PRECIO, '0,00');
    await expect(cierre).toHaveCount(0);
    await expect(marcador(page)).toHaveText(
      'El precio escrito («0,00») tiene que ser mayor que 0: corrígelo para ver el desglose de gastos del solar.',
    );
    await sembrarValor(page, SEL_PRECIO, '7.000.000,00.5');
    await expect(cierre).toHaveCount(0);
    await expect(marcador(page)).toHaveText(/^No se ha podido leer el precio «7\.000\.000,00\.5»/);

    await sembrarValor(page, SEL_PRECIO, '95.000');
    await sembrarValor(page, SEL_GESTORIA, '300');
    const a = await leer(page);
    expect(tarjeta(a, /^IVA \(/).valor).toBe('19.950,00 €');
    expect(tarjeta(a, /^AJD \(/).titulo).toBe('AJD (0,50 %)');
    expect(tarjeta(a, /^AJD \(/).valor).toBe('475,00 €');
    expect(tarjeta(a, /^Gastos de gestoría/).valor).toBe('300,00 €');
    cuadra(a, 95000);

    await sembrarValor(page, SEL_GESTORIA, '1,500,5');
    const b = await leer(page);
    expect(tarjeta(b, /^Gastos de gestoría/).valor).toBe('Sin leer');
    expect(euros(tarjeta(b, /^Total gastos/).valor) - euros(tarjeta(a, /^Total gastos/).valor)).toBeCloseTo(-300, 2);
    expect(euros(tarjeta(b, /^COSTE TOTAL/).valor) - euros(tarjeta(a, /^COSTE TOTAL/).valor)).toBeCloseTo(-300, 2);
    expect(tarjeta(b, /^Total gastos/).titulo).toBe('Total gastos adicionales (parcial)');
    expect(tarjeta(b, /^Total gastos/).desc).toMatch(/^[\d.,]+ % sobre el precio de compra — SIN la gestoría, que no se ha podido leer$/);
    expect(tarjeta(b, /^COSTE TOTAL/).titulo).toBe('COSTE TOTAL (PARCIAL)');
    expect(tarjeta(b, /^COSTE TOTAL/).desc).toBe(
      `No incluye la gestoría, que no se ha podido leer: el coste real será mayor (precio + gastos antes de deducir el IVA si tienes derecho). ${AVISO_BASE_AJD}`,
    );
    cuadra(b, 95000);
  });

  /**
   * 99e1ee7e (08/10/2026) — las relacionadas las resuelve ahora el SERVIDOR en el layout
   * (`<ConRelacionadas slug>`) y la página pinta `<RelatedApps />` sin prop. Esperado: las cuatro
   * primeras de `appRelationsMap['simulador-gastos-compraventa-solar']` (data/app-relations.ts; el
   * bloque pinta cuatro y la quinta, el simulador de hipoteca, no sale), con su `#from=related-…`,
   * en el HTML servido y las MISMAS tras hidratar, sin error de hidratación en la consola (React
   * de producción los da minificados: #418, #423, #425…). Medido el 08/10/2026: 4 y 4, consola
   * limpia (solo dos avisos de precarga de CSS).
   */
  test('99e1ee7e — «Apps relacionadas» pinta sus cuatro tarjetas en el HTML servido y tras hidratar, sin error de hidratación', async ({
    page,
    request,
  }) => {
    const desde = '#from=related-simulador-gastos-compraventa-solar';
    const esperadas = [
      `/simulador-gastos-compraventa-terreno-rustico/${desde}`,
      `/simulador-gastos-compraventa-local-comercial/${desde}`,
      `/estimador-compraventa-inmueble/${desde}`,
      `/estimador-plusvalia-municipal/${desde}`,
    ];
    const html = await (await request.get(RUTA)).text();
    const seccion = html.match(/aria-label="Aplicaciones relacionadas"[\s\S]*?<\/section>/)?.[0] ?? '';
    expect([...seccion.matchAll(/href="([^"]+)"/g)].map((m) => m[1])).toEqual(esperadas);

    const errores: string[] = [];
    page.on('console', (m) => {
      if (m.type() === 'error') errores.push(m.text());
    });
    page.on('pageerror', (e) => errores.push(e.message));
    await page.goto(RUTA);
    await esperarHidratacion(page, [SEL_PRECIO, SEL_GESTORIA]);
    const enlaces = page.locator('section[aria-label="Aplicaciones relacionadas"] a');
    await expect(enlaces).toHaveCount(4);
    expect(await enlaces.evaluateAll((as) => as.map((a) => a.getAttribute('href')))).toEqual(esperadas);
    expect(errores.filter((e) => /hydrat|#418|#419|#422|#423|#425/i.test(e))).toEqual([]);
  });

  /**
   * Sospecha (c) — los rangos de ITP y AJD que publica la página frente a lo que cobra en Ceuta y
   * Melilla (ITP 3 % efectivo en el CASO 2; AJD 0,25 % con promotor). Se reparó aquí el 26/09
   * (2212). Se miden las cuatro bocas que dan un rango —el sello del ITP, la fila AJD de la tabla,
   * la respuesta de «escriturar» (visible y FAQPage, la misma función) y el FAQPage del impuesto—
   * y que NINGUNA otra frase con un rango de porcentajes, en pantalla o en el FAQPage, calle Ceuta
   * y Melilla. Se midió SANA el 08/10/2026.
   *   RANGO_ITP_OTROS = { 6, 13 } (Madrid, Navarra, Ceuta y Melilla al 6 % nominal; Baleares y
   *   Cataluña al 13 % en su último tramo) · RANGO_AJD_OTROS = { 0,5, 1,5 }.
   */
  test('Sospecha (c) — los rangos de ITP y AJD nombran Ceuta y Melilla en sello, tabla, «escriturar» y FAQPage', async ({ page }) => {
    expect(RANGO_ITP_OTROS).toEqual({ min: 6, max: 13 });
    expect(RANGO_AJD_OTROS).toEqual({ min: 0.5, max: 1.5 });
    expect(BONIFICACION_CUOTA_CEUTA_MELILLA).toBe(0.5);
    await page.goto(RUTA);
    await esperarHidratacion(page, [SEL_PRECIO, SEL_GESTORIA]);
    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
    const cuerpo = n(await page.evaluate(() => document.body.innerText));
    expect(cuerpo).toContain(
      'El ITP de un solar va del 6 % al 13 % según la comunidad autónoma, contando el tramo más alto de las que aplican escala progresiva; en Ceuta y Melilla la cuota se bonifica un 50 % (art. 57 bis TRLITPAJD)',
    );
    expect(cuerpo).toContain(
      'Sí (0,5 %–1,5 %; en Ceuta y Melilla, la mitad por la bonificación del 50 %, art. 57 bis.1 TRLITPAJD)',
    );
    const escriturar =
      'el ITP, del 6 % al 13 % según la comunidad autónoma (la mitad en Ceuta y Melilla, por su bonificación del 50 %, que alcanza también al AJD)';
    expect(cuerpo).toContain(escriturar);
    const ld = await faqLd(page);
    expect(ld.get('¿Cuánto cuesta escriturar un solar?')).toContain(escriturar);
    expect(ld.get('¿Se paga IVA o ITP al comprar un solar?')).toContain(
      'AJD, que va del 0,5 % al 1,5 % según la comunidad autónoma (en Ceuta y Melilla la cuota se bonifica al 50 %, art. 57 bis.1 TRLITPAJD)',
    );
    const sinCiudades: string[] = [];
    for (const texto of [cuerpo, ...ld.values()]) {
      for (const m of texto.matchAll(/\d+(?:,\d+)? % ?(?:al |–)(?:el )?\d+(?:,\d+)? %[^.]*/g)) {
        if (!/Ceuta y Melilla/.test(m[0])) sinCiudades.push(m[0]);
      }
    }
    expect(sinCiudades).toEqual([]);
  });

  /**
   * ✅ REPARADO 08/10/2026 (contenido, bajo; hallazgo 3091) — [08/10-a] sospecha (a), la forma del 2958 de la
   * referencia (3076, 3080 y 3087 en garaje, trastero y nave). La descripción de «COSTE TOTAL
   * (PARCIAL)» une las ausencias con `.join(' ni ')` (page.tsx:727-733) y el inciso «que no se ha
   * podido leer» queda sin coma de cierre: se lee como si tampoco se hubiera podido leer la parte
   * de libre acuerdo de la notaría.
   *   Madrid, promotor, 7.000.000 €, gestoría «2.000.50» → esperado «No incluye la gestoría, que no
   *   se ha podido leer, ni la parte de la notaría de libre acuerdo: el coste real será mayor (…)».
   *   Ceuta, promotor, lo mismo → «No incluye el IPSI ni la gestoría, que no se ha podido leer, ni
   *   la parte de la notaría de libre acuerdo: el coste real será mayor.»
   */
  test('[08/10-a] el coste total parcial cierra con coma el inciso «que no se ha podido leer» antes de «ni»', async ({ page }) => {
    await abrir(page, 'madrid', 'promotor');
    await sembrarValor(page, SEL_PRECIO, '7.000.000');
    await sembrarValor(page, SEL_GESTORIA, '2.000.50');
    const madrid = tarjeta(await leer(page), /^COSTE TOTAL/).desc;
    await page.selectOption('#select-ccaa', 'ceuta');
    await expect.poll(async () => tarjeta(await leer(page), /^IPSI/).valor).toBe('No calculado');
    const ceuta = tarjeta(await leer(page), /^COSTE TOTAL/).desc;
    // Lo que no depende de la coma: las ausencias están y en la dirección del ilegible.
    expect(madrid).toMatch(/la gestoría, que no se ha podido leer,? ni la parte de la notaría de libre acuerdo: el coste real será mayor/);
    expect(ceuta).toMatch(/^No incluye el IPSI ni la gestoría, que no se ha podido leer,? ni la parte/);
    // Lo que falta: la coma.
    expect(madrid).toMatch(
      /^No incluye la gestoría, que no se ha podido leer, ni la parte de la notaría de libre acuerdo: el coste real será mayor \(precio \+ gastos antes de deducir el IVA si tienes derecho\)/,
    );
    expect(ceuta).toMatch(
      /^No incluye el IPSI ni la gestoría, que no se ha podido leer, ni la parte de la notaría de libre acuerdo: el coste real será mayor\./,
    );
  });

  /**
   * ✅ REPARADO 08/10/2026 (contenido, bajo; hallazgo 3092) — [08/10-b] el nombre oficial de `ITP_CCAA.nombre`
   * («Ciudad Autónoma de Ceuta», «… de Melilla») entra sin artículo en dos frases escritas en ESTE
   * page.tsx: la tarjeta del impuesto no calculado (l. 607, `En ${datosCcaaActual.nombre} no rige
   * el IVA`) y la nota de la bonificación del recuadro (l. 528, `pero en {datosCcaaActual.nombre}
   * se aplica además`). Es la forma del 3065 (local), 3077 (garaje), 3081 (trastero) y 3084 (nave).
   * El aviso común AvisoTerritorioSinIva arrastra lo mismo, pero ese es de la familia (3065) y no
   * se mide aquí. Ninguna otra frase de page.tsx mete el nombre tras «en» o «de».
   *   Ceuta, promotor, 100.000 € → esperado «En la Ciudad Autónoma de Ceuta no rige el IVA…» (o «En
   *   Ceuta…») y «pero en la Ciudad Autónoma de Ceuta se aplica además…» · obtenido sin «la».
   */
  test('[08/10-b] las frases de page.tsx con el nombre de Ceuta y Melilla llevan su artículo', async ({ page }) => {
    const sinArticulo = /[^.]*\b[Ee]n Ciudad Autónoma de (?:Ceuta|Melilla)[^.]*/;
    const encontrados: string[] = [];
    for (const ciudad of ['ceuta', 'melilla']) {
      await abrir(page, ciudad, 'promotor');
      await sembrarValor(page, SEL_PRECIO, '100000');
      const ipsi = tarjeta(await leer(page), /^IPSI/).desc;
      const recuadro = n(await page.locator('[class*="infoCcaa"]').first().innerText());
      // Lo que no depende del artículo: las dos frases están.
      expect(ipsi).toMatch(/no rige el IVA: la compra al promotor tributa por el IPSI/);
      expect(recuadro).toMatch(/se aplica además la bonificación del 50 % de la cuota/);
      for (const frase of [ipsi, recuadro]) {
        const m = frase.match(sinArticulo);
        if (m) encontrados.push(`${ciudad}: ${m[0].trim()}`);
      }
    }
    expect(encontrados).toEqual([]);
  });

  /**
   * ✅ REPARADO 08/10/2026 (contenido, bajo; hallazgo 3090: una constante por pregunta en metadata.ts) — [08/10-c] sospecha (d), la forma del 2968: la misma
   * pregunta tiene dos respuestas escritas aparte, una en page.tsx (FAQ visible) y otra en
   * metadata.ts (FAQPage). Son cuatro parejas; solo «escriturar» comparte función. No se
   * contradicen en cifras, pero cada boca calla lo que da la otra: el FAQPage da el rango del AJD
   * (0,5-1,5 %) y su bonificación en Ceuta y Melilla, el AJD de la escritura, el modelo 303 y la
   * condición «sujeta y no exenta» (ver [08/10-d]); la visible, que la plusvalía no la paga el
   * comprador. Reparación: UNA constante por pregunta en metadata.ts que importen las dos bocas
   * (como app/simulador-gastos-compraventa-garaje).
   */
  test('[08/10-c] cada pregunta de la FAQ visible que repite el FAQPage tiene la misma respuesta', async ({ page }) => {
    const PAREJAS: Array<[string, string]> = [
      ['¿Se paga IVA o ITP al comprar un solar?', '¿Se paga IVA o ITP al comprar un solar?'],
      ['¿Por qué el solar no está exento de IVA como la finca rústica?', '¿Por qué un solar de empresario lleva IVA y no ITP?'],
      ['¿El autopromotor de su vivienda puede deducir el IVA del solar?', '¿Puedo deducir el IVA de la compra de un solar?'],
      // Tras la reparación (3090), la plusvalía quedó con una sola redacción que cubre las dos.
      ['¿Hay plusvalía municipal al comprar o vender un solar?', '¿Hay plusvalía municipal al comprar o vender un solar?'],
    ];
    await page.goto(RUTA);
    await esperarHidratacion(page, [SEL_PRECIO, SEL_GESTORIA]);
    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
    const visible = await faqVisible(page);
    const ld = await faqLd(page);
    // Control del lector: la pareja que ya comparte función sale igual.
    expect(visible.get('¿Cuánto cuesta escriturar un solar?')).toBeTruthy();
    expect(visible.get('¿Cuánto cuesta escriturar un solar?')).toBe(ld.get('¿Cuánto cuesta escriturar un solar?'));
    const distintas: string[] = [];
    for (const [pv, pl] of PAREJAS) {
      // Al repararlo, la pregunta puede quedar con una sola redacción: vale cualquiera de las dos.
      const rv = visible.get(pv) ?? visible.get(pl);
      const rl = ld.get(pl) ?? ld.get(pv);
      expect(rv, `falta en la FAQ visible: ${pv}`).toBeTruthy();
      expect(rl, `falta en el FAQPage: ${pl}`).toBeTruthy();
      if (rv !== rl) distintas.push(pv);
    }
    expect(distintas).toEqual([]);
  });

  /**
   * ✅ REPARADO 08/10/2026 (contenido, medio; hallazgo 3089) — [08/10-d] la condición para deducir el IVA del solar
   * se publica de dos maneras. «Limitaciones» y el FAQPage la dan bien, «actividad sujeta y NO
   * EXENTA» (Ley 37/1992, art. 94.Uno.1.º.a: «sujetas y no exentas»). El aviso de compra a
   * promotor («es deducible si eres empresario o autónomo y afectas el solar a una actividad
   * sujeta a IVA»), la tarjeta del IVA («Deducible si eres empresa/autónomo sujeto a IVA»), la fila
   * de la tabla («Sí (si actividad sujeta)») y la FAQ visible («Solo deducen el IVA quienes afectan
   * el solar a una actividad económica sujeta a IVA») omiten la exención. Caso típico de un solar:
   * una promotora que lo compra para construir viviendas en ALQUILER (arrendamiento exento, art.
   * 20.Uno.23.º.b) no deduce el 21 %, y el aviso y la tarjeta le dicen que sí. Las cifras no cambian:
   * el coste ya va «antes de deducir el IVA si tienes derecho».
   *   Madrid, promotor, 300.000 € → esperado: las cuatro bocas condicionan a «sujeta y no exenta» ·
   *   obtenido «actividad sujeta a IVA», «sujeto a IVA», «Sí (si actividad sujeta)», «sujeta a IVA».
   */
  test('[08/10-d] todas las bocas condicionan el IVA deducible a una actividad «sujeta y no exenta»', async ({ page }) => {
    await abrir(page, 'madrid', 'promotor');
    await sembrarValor(page, SEL_PRECIO, '300000');
    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
    // Las dos bocas que ya lo dicen bien: la referencia de lo esperado.
    const ld = await faqLd(page);
    expect(ld.get('¿Puedo deducir el IVA de la compra de un solar?')).toContain('actividad económica sujeta y no exenta de IVA');
    expect(n(await page.locator('li', { hasText: 'El IVA solo es deducible' }).first().innerText())).toContain(
      'actividad sujeta y no exenta',
    );
    const bocas: Record<string, string> = {
      'aviso del promotor': n(await page.locator('[role="note"]', { hasText: 'Compra a promotor o empresa' }).innerText()),
      'tarjeta del IVA': tarjeta(await leer(page), /^IVA \(/).desc,
      tabla: n(await page.locator('tr', { hasText: '¿IVA deducible?' }).locator('td').nth(1).innerText()),
      // La FAQ visible quedó con la pregunta del FAQPage (hallazgo 3090).
      'FAQ visible':
        (await faqVisible(page)).get('¿El autopromotor de su vivienda puede deducir el IVA del solar?') ??
        (await faqVisible(page)).get('¿Puedo deducir el IVA de la compra de un solar?') ??
        '',
    };
    expect(Object.values(bocas).every((tx) => /IVA|sujet/.test(tx))).toBe(true);
    const sinExencion = Object.entries(bocas)
      .filter(([, tx]) => !/no exent/.test(tx))
      .map(([k, tx]) => `${k}: «${tx}»`);
    expect(sinExencion).toEqual([]);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// INSPECTOR 13/10/2026 — RE-INSPECCIÓN tras la rebaja del 5 % de los aranceles (11/10), con el
// reparto del IBI (S0195) y los textos del cabo C0164.
//
// Primeros casos de este fichero que FIJAN la notaría y el registro con la rebaja del 5 % del nº 2.1
// de los dos aranceles. Los describe anteriores que los fijaban sin ella pueden estar en rojo por
// eso (cabo C0209, destino reparar): no se tocan aquí.
//
// De dónde sale cada cifra esperada (resuelta a mano ANTES de abrir el navegador, con un script
// propio que no llama a ninguna función de la app):
//   · ITP de un solar → TIPOS_ITP_CCAA_2025 (data/fiscal/inmuebles.ts): Murcia 7,75 % (sin escala
//     en ITP_CCAA); Asturias, escala de ITP_CCAA.asturias.tramosProgresivos: 8 % hasta 300.000,
//     9 % hasta 500.000, 10 % el resto.
//   · AJD de un solar → ITP_CCAA.asturias.ajd = 1,2. IVA → PORCENTAJES_IVA.general = 21.
//   · Notaría → ARANCELES_NOTARIO (RD 1426/1989, nº 2.1), acumulado por exceso desde 90,151816 €:
//     4,5 ‰ hasta 30.050,61 · 1,5 ‰ hasta 60.101,21 · 1 ‰ hasta 150.253,03 · 0,5 ‰ hasta 601.012,10
//     · 0,3 ‰ hasta 6.010.121,04; × (1 − REBAJA_ARANCEL_CUANTIA = 0,05) × 1,21 de IVA; factura
//     FACTURA_NOTARIAL ×1,5 a ×2 y la tarjeta enseña el punto medio (×1,75).
//       145.000,50 → arancel 328,309211 → 377,39 con rebaja e IVA → 566,09–754,78, medio 660,44
//       800.000,00 → arancel 618,637646 → 711,12 → 1066,69–1422,25, medio 1244,47
//   · Registro → ARANCELES_REGISTRO (RD 1427/1989, nº 2.1: 24,040484 € y 1,75/1,25/0,75/0,30/0,20 ‰),
//     tope 2.181,673939, × 0,95, + 6,010121 (nº 1) + 3,005061 (nº 4), × 1,21:
//       145.000,50 → 167,349059 → 203,28 · 800.000,00 → 346,313958 → 409,00
//   · Reparto del IBI → lib/calculadoras/prorrateoCompraventa (STS 409/2016): por días del año
//     natural; el vendedor hasta el día anterior a la escritura. 2028 es bisiesto (366 días).
//   · Textos: Ley 37/1992, art. 20.Uno.20.º, 20.Dos y 20.Uno.23.º.b (BOE-A-1992-28740) y
//     TRLRHL, art. 106.1.b y 106.2 (BOE-A-2004-4214), consolidados, leídos en el BOE el 13/10/2026.
//
// Los hallazgos van con `test.fail()` salvo con `VER_HUECOS=1`. Al repararlos, quitar la marca y
// reescribir el comentario en pasado.
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('Inspector 13/10/2026 — aranceles con la rebaja del 5 %, el reparto del IBI y los textos de C0164', () => {
  test.describe.configure({ timeout: 90_000 });
  const SEL_PRECIO = `input[aria-label="${PRECIO}"]`;
  const SEL_GESTORIA = `input[aria-label="${GESTORIA}"]`;
  const SEL_IBI = 'input[aria-label="Cuota anual del IBI"]';
  const n = (s: string | null | undefined): string => (s ?? '').replace(/\s+/g, ' ').trim();
  /** El marcador del panel sin cifra (no el anunciador de rutas de Next). */
  const marcador = (page: Page) => page.locator('[class*="placeholder"] p');
  const bloqueIbi = (page: Page) => page.locator('section[aria-labelledby="titulo-prorrateo"]');

  interface I13Tarjeta {
    titulo: string;
    valor: string;
    desc: string;
  }

  /** Las tarjetas del panel de resultados, en orden, con el texto normalizado (U+00A0 → espacio). */
  const leer = (page: Page): Promise<I13Tarjeta[]> =>
    page.evaluate(() => {
      const cont = document.querySelector('[class*="resultados"]');
      const norm = (s: string | undefined) => (s ?? '').replace(/\s+/g, ' ').trim();
      return [...(cont?.querySelectorAll('h3') ?? [])].map((h) => {
        const card = h.parentElement!.parentElement!;
        const valor = card.querySelector(':scope > div:nth-of-type(2) > p') as HTMLElement | null;
        const ps = card.querySelectorAll(':scope > p');
        return {
          titulo: norm(h.innerText),
          valor: norm(valor?.innerText),
          desc: ps.length ? norm((ps[ps.length - 1] as HTMLElement).innerText) : '',
        };
      });
    });

  const tarjeta = (ts: I13Tarjeta[], re: RegExp): I13Tarjeta => {
    const x = ts.find((c) => re.test(c.titulo));
    if (!x) throw new Error(`No hay tarjeta ${re} entre: ${ts.map((c) => c.titulo).join(' | ')}`);
    return x;
  };

  async function abrir(page: Page, ccaa: string, vende: 'particular' | 'promotor'): Promise<void> {
    await page.goto(RUTA);
    await esperarHidratacion(page, [SEL_PRECIO, SEL_GESTORIA, SEL_IBI]);
    await page.selectOption('#select-ccaa', ccaa);
    await expect(page.locator('#select-ccaa')).toHaveValue(ccaa);
    await elegir(page, vende);
  }

  async function elegir(page: Page, vende: 'particular' | 'promotor'): Promise<void> {
    const boton = page.getByRole('button', { name: vende === 'particular' ? /Un particular/ : /Promotor \/ Empresa/ });
    await boton.click();
    await expect(boton).toHaveAttribute('aria-pressed', 'true');
  }

  /** El FAQPage servido, pregunta → respuesta normalizada. */
  async function faqLd(page: Page): Promise<Map<string, string>> {
    const bloques = await page.locator('script[type="application/ld+json"]').allTextContents();
    const faq = JSON.parse(bloques.find((b) => b.includes('"FAQPage"')) ?? '{"mainEntity":[]}') as {
      mainEntity: Array<{ name: string; acceptedAnswer: { text: string } }>;
    };
    return new Map(faq.mainEntity.map((q): [string, string] => [q.name, n(q.acceptedAnswer.text)]));
  }

  /**
   * CASO 1 (NORMAL) — Región de Murcia, vende un PARTICULAR, «145.000,50» € (millar con punto y
   * céntimos con coma), gestoría 600 €.
   *   ITP = 145.000,50 × 7,75 % = 11.237,53875 → 11.237,54 → «ITP (7,75 %)»; sin AJD ni IVA.
   *   Notaría 660,44 (566,09–754,78) · registro 203,28 · gestoría 600,00
   *   Total = 11.237,54 + 660,44 + 203,28 + 600,00 = 12.701,26 → 12.701,26 / 145.000,50 = 8,76 %
   *   Coste = 145.000,50 + 12.701,26 = 157.701,76, cierre completo.
   */
  test('CASO 1 (normal) — Murcia, particular, 145.000,50 €: ITP 7,75 %, notaría y registro con la rebaja, total 12.701,26 €', async ({ page }) => {
    await abrir(page, 'murcia', 'particular');
    await sembrarValor(page, SEL_GESTORIA, '600');
    await sembrarValor(page, SEL_PRECIO, '145.000,50');
    const ts = await leer(page);
    expect(tarjeta(ts, /^Precio del solar/).valor).toBe('145.000,50 €');
    expect(tarjeta(ts, /^ITP \(/).titulo).toBe('ITP (7,75 %)');
    expect(tarjeta(ts, /^ITP \(/).valor).toBe('11.237,54 €');
    expect(ts.some((c) => /^(AJD|IVA|IGIC|IPSI)/.test(c.titulo))).toBe(false);
    expect(tarjeta(ts, /^Gastos de notaría/).titulo).toBe('Gastos de notaría (IVA incluido)');
    expect(tarjeta(ts, /^Gastos de notaría/).valor).toBe('660,44 €');
    expect(tarjeta(ts, /^Gastos de notaría/).desc).toMatch(/^Factura estimada entre 566,09 € y 754,78 €\./);
    expect(tarjeta(ts, /^Registro de la Propiedad/).valor).toBe('203,28 €');
    expect(tarjeta(ts, /^Gastos de gestoría/).valor).toBe('600,00 €');
    expect(tarjeta(ts, /^Total gastos/).titulo).toBe('Total gastos adicionales');
    expect(tarjeta(ts, /^Total gastos/).valor).toBe('12.701,26 €');
    expect(tarjeta(ts, /^Total gastos/).desc).toBe('8,76 % sobre el precio de compra');
    expect(tarjeta(ts, /^COSTE TOTAL/).titulo).toBe('COSTE TOTAL DE ADQUISICIÓN');
    expect(tarjeta(ts, /^COSTE TOTAL/).valor).toBe('157.701,76 €');
    expect(tarjeta(ts, /^COSTE TOTAL/).desc).toBe('Precio + todos los gastos de la operación');
    const recuadro = n(await page.locator('[class*="infoCcaa"]').first().innerText());
    expect(recuadro).toContain('ITP General 7,75 %');
    expect(recuadro).toContain('AJD 1,5 %');
  });

  /**
   * CASO 2 (LÍMITE) — Asturias, 800.000 €, la gestoría de 500 € que trae el campo. Dos límites:
   *   a) PARTICULAR: los tres tramos de la escala, el último al 10 %.
   *      ITP = 300.000 × 8 % + 200.000 × 9 % + 300.000 × 10 % = 24.000 + 18.000 + 30.000 = 72.000
   *      → efectivo 9,00 %. Notaría 1244,47 (1066,69–1422,25, sexto tramo del arancel), registro
   *      409,00 (sexto tramo). Total 72.000 + 1244,47 + 409,00 + 500 = 74.153,47 (9,27 %), coste
   *      874.153,47.
   *   b) PROMOTOR, mismo precio: IVA 800.000 × 21 % = 168.000,00 + AJD 800.000 × 1,2 % = 9600,00
   *      (sin escala ni ITP). Total 179.753,47 (22,47 %), coste 979.753,47, con la salvedad del IVA
   *      deducible y la del art. 30.1.
   *   c) INVARIANTE: la gestoría «1.250,00.5» no se lee → total y coste BAJAN 500,00 € (179.253,47,
   *      22,41 %; 979.253,47), los dos se rotulan parciales y el coste dice «será mayor».
   */
  test('CASO 2 (límite) — Asturias, 800.000 €: escala hasta el 10 % (72.000 €), y con promotor IVA 168.000 € + AJD 1,2 %', async ({ page }) => {
    await abrir(page, 'asturias', 'particular');
    await sembrarValor(page, SEL_PRECIO, '800000');
    const a = await leer(page);
    expect(tarjeta(a, /^ITP \(/).titulo).toBe('ITP (9,00 %)');
    expect(tarjeta(a, /^ITP \(/).valor).toBe('72.000,00 €');
    expect(tarjeta(a, /^Gastos de notaría/).valor).toBe('1244,47 €');
    expect(tarjeta(a, /^Gastos de notaría/).desc).toMatch(/^Factura estimada entre 1066,69 € y 1422,25 €\./);
    expect(tarjeta(a, /^Registro de la Propiedad/).valor).toBe('409,00 €');
    expect(tarjeta(a, /^Gastos de gestoría/).valor).toBe('500,00 €');
    expect(tarjeta(a, /^Total gastos/).valor).toBe('74.153,47 €');
    expect(tarjeta(a, /^Total gastos/).desc).toBe('9,27 % sobre el precio de compra');
    expect(tarjeta(a, /^COSTE TOTAL/).valor).toBe('874.153,47 €');
    expect(n(await page.locator('[class*="infoCcaa"]').first().innerText())).toContain(
      'aplica escala progresiva (8 % → 9 % → 10 %): cada tramo del valor tributa a su tipo',
    );

    await elegir(page, 'promotor');
    const b = await leer(page);
    expect(b.some((c) => /^ITP/.test(c.titulo))).toBe(false);
    expect(tarjeta(b, /^IVA \(/).titulo).toBe('IVA (21,00 %)');
    expect(tarjeta(b, /^IVA \(/).valor).toBe('168.000,00 €');
    expect(tarjeta(b, /^AJD \(/).titulo).toBe('AJD (1,20 %)');
    expect(tarjeta(b, /^AJD \(/).valor).toBe('9600,00 €');
    expect(tarjeta(b, /^Gastos de notaría/).valor).toBe('1244,47 €');
    expect(tarjeta(b, /^Registro de la Propiedad/).valor).toBe('409,00 €');
    expect(tarjeta(b, /^Total gastos/).titulo).toBe('Total gastos adicionales');
    expect(tarjeta(b, /^Total gastos/).valor).toBe('179.753,47 €');
    expect(tarjeta(b, /^Total gastos/).desc).toBe('22,47 % sobre el precio de compra');
    expect(tarjeta(b, /^COSTE TOTAL/).titulo).toBe('COSTE TOTAL DE ADQUISICIÓN');
    expect(tarjeta(b, /^COSTE TOTAL/).valor).toBe('979.753,47 €');
    expect(tarjeta(b, /^COSTE TOTAL/).desc).toBe(
      `Precio + todos los gastos (antes de deducir el IVA si tienes derecho). ${AVISO_BASE_AJD}`,
    );

    await sembrarValor(page, SEL_GESTORIA, '1.250,00.5');
    const c = await leer(page);
    expect(tarjeta(c, /^Gastos de gestoría/).valor).toBe('Sin leer');
    expect(tarjeta(c, /^Total gastos/).titulo).toBe('Total gastos adicionales (parcial)');
    expect(tarjeta(c, /^Total gastos/).valor).toBe('179.253,47 €');
    expect(tarjeta(c, /^Total gastos/).desc).toBe(
      '22,41 % sobre el precio de compra — SIN la gestoría, que no se ha podido leer',
    );
    expect(tarjeta(c, /^COSTE TOTAL/).titulo).toBe('COSTE TOTAL (PARCIAL)');
    expect(tarjeta(c, /^COSTE TOTAL/).valor).toBe('979.253,47 €');
    expect(tarjeta(c, /^COSTE TOTAL/).desc).toBe(
      `No incluye la gestoría, que no se ha podido leer: el coste real será mayor (precio + gastos antes de deducir el IVA si tienes derecho). ${AVISO_BASE_AJD}`,
    );
  });

  /**
   * CASO 3 (RECHAZO) — Galicia, vende un particular.
   *   Precio «12..000», «120.00.000» y «-»: no son números (el punto solo agrupa en grupos de tres)
   *   → ninguna cifra, y el marcador nombra lo escrito. «0,001» se pinta 0,00 € y «-0» es 0 → «no
   *   vale», con lo escrito entre comillas (patrón 5).
   *   Reparto del IBI (el bloque que el testigo de la familia mide solo con un ilegible): 600 € con
   *   escritura el 01/03/2028, año bisiesto → vendedor 31 + 29 = 60 días, 600 × 60 / 366 = 98,36;
   *   comprador 306 días, 600 − 98,3607 = 501,64. Con la cuota «2.000.50» no se reparte nada y se
   *   nombra el campo; con una fecha fuera del rango que el motor acepta (1899) tampoco se publica
   *   reparto.
   */
  test('CASO 3 (rechazo) — Galicia: precios que no se leen o no valen no publican cifra; el IBI de un bisiesto y el ilegible', async ({ page }) => {
    await abrir(page, 'galicia', 'particular');
    const cierre = page.locator('h3', { hasText: /^COSTE TOTAL/ });
    for (const v of ['12..000', '120.00.000', '-']) {
      await sembrarValor(page, SEL_PRECIO, v);
      await expect(cierre).toHaveCount(0);
      await expect(marcador(page)).toHaveText(
        `No se ha podido leer el precio «${v}». Introduce el precio del solar para ver el desglose de gastos, con coma decimal (120.000 o 120000,50)`,
      );
    }
    await sembrarValor(page, SEL_PRECIO, '0,001');
    await expect(cierre).toHaveCount(0);
    await expect(marcador(page)).toHaveText(
      'El precio escrito («0,001») se queda en 0,00 € al céntimo, y tiene que ser mayor que 0: corrígelo para ver el desglose de gastos del solar.',
    );
    await sembrarValor(page, SEL_PRECIO, '-0');
    await expect(cierre).toHaveCount(0);
    await expect(marcador(page)).toHaveText(
      'El precio escrito («-0») tiene que ser mayor que 0: corrígelo para ver el desglose de gastos del solar.',
    );

    const bloque = bloqueIbi(page);
    const fecha = bloque.locator('input[type="date"]');
    await fecha.fill('2028-03-01');
    await esperarValorEnReact(page, fecha, '2028-03-01');
    await sembrarValor(page, SEL_IBI, '600');
    const fila = n(await bloque.locator('tbody tr').first().innerText());
    expect(fila).toBe('IBI del año 01/01/2028 – 31/12/2028 98,36 € · 60 días 501,64 € · 306 días');
    await expect(bloque).toContainText('el comprador le abona en la firma 501,64 €.');

    await sembrarValor(page, SEL_IBI, '2.000.50');
    await expect(bloque.locator('[role="alert"]')).toContainText('No se entiende el importe de «Cuota anual del IBI»');
    await expect(bloque).not.toContainText('abona');

    await sembrarValor(page, SEL_IBI, '600');
    await expect(bloque).toContainText('el comprador le abona en la firma 501,64 €.');
    await fecha.fill('1899-12-31');
    await esperarValorEnReact(page, fecha, '1899-12-31');
    await expect(bloque).not.toContainText('abona');
    await expect(bloque.locator('table')).toHaveCount(0);
  });

  /**
   * ✅ REPARADO 21/10/2026 (abierto el 13/10/2026; hallazgo 3267; contenido, bajo): la tarjeta
   * condiciona la deducción a una actividad sujeta y no exenta y nombra la promotora que alquila.
   * Lo que había — [13/10-a] Residuo del hallazgo 3089 (cabo C0164), que
   * se reparó en sus cuatro bocas (aviso del promotor, tarjeta del IVA, fila de la tabla y FAQ, todas
   * ya con «sujeta y no exenta»). La quinta no estaba en aquella lista: la tarjeta de casos de uso
   * «Promotora compra suelo para construir» dice «Si compra a otro empresario, paga IVA 21 %
   * deducible en el modelo 303», sin condición. Es justo el caso que la FAQ de la misma página
   * excluye: quien levanta viviendas para alquilarlas no deduce, porque el arrendamiento de vivienda
   * está exento (Ley 37/1992, art. 20.Uno.23.º.b, y art. 94.Uno.1.º.a: «sujetas y no exentas»).
   *   Guía abierta → esperado: la tarjeta condiciona la deducción (actividad sujeta y no exenta) ·
   *   obtenido «…paga IVA 21 % deducible en el modelo 303 (en Canarias, Ceuta y Melilla…)».
   */
  test('[13/10-a] la tarjeta «Promotora compra suelo para construir» condiciona el IVA deducible a una actividad sujeta y no exenta', async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, [SEL_PRECIO, SEL_GESTORIA]);
    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
    // La referencia: la FAQ de la misma página excluye a la promotora de vivienda en alquiler.
    const ld = await faqLd(page);
    expect(ld.get('¿Puedo deducir el IVA de la compra de un solar?')).toContain(
      'es el caso de quien levanta en él viviendas para alquilarlas, porque ese arrendamiento está exento',
    );
    const card = n(
      await page.locator('strong', { hasText: 'Promotora compra suelo para construir' }).locator('xpath=..').innerText(),
    );
    expect(card).toContain('deducible en el modelo 303');
    expect(card, `tarjeta: «${card}»`).toMatch(/no exent/);
  });

  /**
   * ✅ REPARADO 21/10/2026 (abierto el 13/10/2026; hallazgo 3268; contenido, bajo): el FAQPage
   * nombra la renuncia del art. 20.Dos LIVA (leído el 21/10/2026) y la tarjeta relacionada dice
   * «Terreno rústico: ITP, o IVA con renuncia», en solar y en la otra entrada de app-relations que
   * la repetía. Lo que había — [13/10-b] El FAQPage («¿Qué diferencia hay entre
   * comprar un solar y una finca rústica?», solo en el JSON-LD, lo que leen los asistentes de IA)
   * dice que la finca rústica «está exenta de IVA (tributa por ITP incluso vendiéndola un
   * empresario)». Falta la renuncia: el art. 20.Dos de la Ley 37/1992 permite renunciar a la exención
   * del 20.º cuando el adquirente es un empresario con derecho a deducir, y entonces la entrega va por
   * IVA (con AJD), que es lo que la hermana terreno-rústico calcula con «Con renuncia a la exención
   * IVA». La tarjeta de apps relacionadas de esta misma página repite «Terreno rústico: solo ITP»
   * (data/app-relations.ts, entrada de solar).
   *   Esperado: la renuncia nombrada (o al menos «salvo renuncia») · obtenido la regla sin excepción.
   */
  test('[13/10-b] el FAQPage de la finca rústica no la da por «ITP incluso vendiéndola un empresario» sin la renuncia del art. 20.Dos LIVA', async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, [SEL_PRECIO, SEL_GESTORIA]);
    const ld = await faqLd(page);
    const rustica = ld.get('¿Qué diferencia hay entre comprar un solar y una finca rústica?') ?? '';
    expect(rustica).toContain('La finca rústica no edificable está exenta de IVA');
    expect(rustica, `FAQPage: «${rustica}»`).toMatch(/renuncia/i);
    const relacionada = n(
      await page.locator('section[aria-label="Aplicaciones relacionadas"] a', { hasText: 'Finca Rústica' }).innerText(),
    );
    expect(relacionada, `tarjeta relacionada: «${relacionada}»`).not.toContain('solo ITP');
  });

  /**
   * ✅ REPARADO 21/10/2026 (abierto el 13/10/2026; hallazgo 3269; contenido, bajo): la salvedad del
   * comprador sustituto (SALVEDAD_PLUSVALIA_NO_RESIDENTE, metadata.ts; art. 106.2 releído el
   * 21/10/2026) va en la FAQ de las dos bocas, la nota «Recuerda», la tarjeta y Limitaciones.
   * Lo que había — [13/10-c] La plusvalía municipal se presenta como
   * ajena al comprador sin excepción: FAQ visible y FAQPage («Sí, pero la paga el vendedor, no el
   * comprador»), la nota «Recuerda» bajo el resultado y la tarjeta de casos de uso («No es (un) coste
   * del comprador»). El TRLRHL, art. 106.2 (BOE-A-2004-4214, consolidado, leído el 13/10/2026),
   * hace al ADQUIRENTE sujeto pasivo sustituto en las transmisiones onerosas cuando el transmitente
   * es una persona física no residente en España: quien compra un solar a un no residente la debe
   * ingresar. Ninguna app de la familia ni estimador-plusvalia-municipal lo nombra.
   *   Esperado: la salvedad del no residente en la respuesta (las dos bocas) · obtenido la regla sola.
   */
  test('[13/10-c] la plusvalía «la paga el vendedor» nombra al comprador sustituto cuando vende un no residente (art. 106.2 TRLRHL)', async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, [SEL_PRECIO, SEL_GESTORIA]);
    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
    const pregunta = '¿Hay plusvalía municipal al comprar o vender un solar?';
    const visible = n(await page.locator('strong', { hasText: pregunta }).locator('xpath=../p').innerText());
    const servida = (await faqLd(page)).get(pregunta) ?? '';
    expect(visible).toContain('la paga el vendedor, no el comprador');
    expect(visible, `FAQ visible: «${visible}»`).toMatch(/no residente|sustitut/i);
    expect(servida, `FAQPage: «${servida}»`).toMatch(/no residente|sustitut/i);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// INSPECTOR 21/10/2026 — RE-INSPECCIÓN (familia «Compraventa inmobiliaria»; referencia
// estimador-compraventa-inmueble; testigo tests/familias/compraventa.spec.ts, 93/93 en verde al
// empezar la tanda). La app volvió a la cola INVALIDADA por dos commits de data/itp-ccaa.ts; su
// page.tsx y su metadata.ts no se tocaron entre el 19 y el 20/10/2026:
//   · 011fc97f (19/10, hallazgo 3272): el IVA de las facturas de notaría y registro sale de
//     PORCENTAJES_IVA.general en vez de un 0,21 tecleado, «sin que cambie ninguna cifra». Se
//     sostiene: los aranceles de los tres casos de abajo, resueltos a mano con el 21 %, coinciden.
//   · f6de548d (20/10, hallazgo 3251): la nota de Madrid ya no la declara el ITP más bajo de la
//     península. Se sostiene aquí (test «f6de548d»). Lo que dejó: la misma forma en otras notas
//     de la tabla → HALLAZGO [21/10-a].
// 3267-3269 ([13/10-a] a [13/10-c], bloque anterior) seguían ABIERTOS; se repararon el 21/10/2026.
//
// De dónde sale cada cifra esperada (ninguna de memoria; aritmética en un script propio que no
// llama al código de la app):
//   · ITP → TIPOS_ITP_CCAA_2025 (data/fiscal/inmuebles.ts): Castilla y León 8 %, con la escala de
//     ITP_CCAA['castilla-leon'] (8 % hasta 250.000 €); Navarra 6 %; País Vasco 7 % (tipoNoVivienda,
//     NF 1/2011 de Bizkaia, art. 13.a); Melilla 6 % (excepción declarada en data/itp-ccaa.ts) con
//     BONIFICACION_CUOTA_CEUTA_MELILLA = 0,5 (art. 57 bis.3.a TRLITPAJD).
//   · AJD → ITP_CCAA[x].ajd: Castilla y León 1,5 %, Navarra 0,5 %, Melilla 0,5 % × 50 % (57 bis.1).
//   · IVA → PORCENTAJES_IVA.general = 21 (data/fiscal/iva.ts).
//   · Notaría → ARANCELES_NOTARIO (RD 1426/1989, nº 2.1) × (1 − REBAJA_ARANCEL_CUANTIA, 5 %) ×
//     1,21 salvo en Canarias, Ceuta y Melilla, × FACTURA_NOTARIAL 1,5 / 1,75 (la tarjeta) / 2.
//   · Registro → ARANCELES_REGISTRO (RD 1427/1989, nº 2.1) × 0,95 + presentación 6,010121 + nota
//     simple 3,005061 (REGISTRO_CONCEPTOS), × 1,21 salvo en Canarias, Ceuta y Melilla.
//   · Reparto del IBI → components/ProrrateoIbiComunidad: el vendedor hasta el día anterior a la
//     escritura, el comprador desde ese día, por días del año natural.
//
// INVARIANTE de la familia, campo a campo. La app tiene tres NumberInput: el precio y la gestoría
// (los dos que declara el testigo) y la cuota del IBI (bloque común, también en el testigo). Aquí se
// mide lo que el testigo no recorre: lo PEGADO con palabras, que desde el 20/10/2026 (hallazgo 2965,
// components/NumberInput.tsx) se queda escrito tal cual, en el régimen foral (País Vasco) y en
// Melilla con los dos vendedores. Ninguna pantalla ni campo exclusivo de esta hermana: la app no
// tiene pestaña de vendedor, ni perfil de comprador, ni caja «Podrías pagar menos».
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('Inspector 21/10/2026 — re-inspección tras 011fc97f y f6de548d', () => {
  test.describe.configure({ timeout: 90_000 });
  const SEL_PRECIO = `input[aria-label="${PRECIO}"]`;
  const SEL_GESTORIA = `input[aria-label="${GESTORIA}"]`;
  const SEL_IBI = 'input[aria-label="Cuota anual del IBI"]';
  const n = (s: string | null | undefined): string => (s ?? '').replace(/\s+/g, ' ').trim();
  /** El marcador del panel sin cifra (no el anunciador de rutas de Next). */
  const marcador = (page: Page) => page.locator('[class*="placeholder"] p');

  interface I21Tarjeta {
    titulo: string;
    valor: string;
    desc: string;
  }

  /** Las tarjetas del panel de resultados, en orden, con el texto normalizado (U+00A0 → espacio). */
  const leer = (page: Page): Promise<I21Tarjeta[]> =>
    page.evaluate(() => {
      const cont = document.querySelector('[class*="resultados"]');
      const norm = (s: string | undefined) => (s ?? '').replace(/\s+/g, ' ').trim();
      return [...(cont?.querySelectorAll('h3') ?? [])].map((h) => {
        const card = h.parentElement!.parentElement!;
        const valor = card.querySelector(':scope > div:nth-of-type(2) > p') as HTMLElement | null;
        const ps = card.querySelectorAll(':scope > p');
        return {
          titulo: norm(h.innerText),
          valor: norm(valor?.innerText),
          desc: ps.length ? norm((ps[ps.length - 1] as HTMLElement).innerText) : '',
        };
      });
    });

  const tarjeta = (ts: I21Tarjeta[], re: RegExp): I21Tarjeta => {
    const x = ts.find((c) => re.test(c.titulo));
    if (!x) throw new Error(`No hay tarjeta ${re} entre: ${ts.map((c) => c.titulo).join(' | ')}`);
    return x;
  };

  async function elegir(page: Page, vende: 'particular' | 'promotor'): Promise<void> {
    const boton = page.getByRole('button', { name: vende === 'particular' ? /Un particular/ : /Promotor \/ Empresa/ });
    await boton.click();
    await expect(boton).toHaveAttribute('aria-pressed', 'true');
  }

  async function comunidad(page: Page, ccaa: string): Promise<void> {
    await page.selectOption('#select-ccaa', ccaa);
    await expect(page.locator('#select-ccaa')).toHaveValue(ccaa);
  }

  async function abrir(page: Page, ccaa: string, vende: 'particular' | 'promotor'): Promise<void> {
    await page.goto(RUTA);
    await esperarHidratacion(page, [SEL_PRECIO, SEL_GESTORIA, SEL_IBI]);
    await comunidad(page, ccaa);
    await elegir(page, vende);
  }

  /** Pega como un usuario (Ctrl+A, Ctrl+V): es la puerta por la que entran las palabras. */
  async function pegar(page: Page, selector: string, texto: string): Promise<void> {
    await page.evaluate((t) => navigator.clipboard.writeText(t), texto);
    await page.locator(selector).click();
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Control+V');
    await expect(page.locator(selector)).toHaveValue(texto, { timeout: 3000 });
  }

  /** La ficha de la comunidad (ITP_CCAA[x].notas) que pinta el recuadro, tras elegirla. */
  async function fichaComunidad(page: Page, ccaa: keyof typeof ITP_CCAA): Promise<string> {
    await comunidad(page, ccaa);
    const nombre = ITP_CCAA[ccaa].nombre;
    return n(await page.locator('[class*="infoCcaaNote"]', { hasText: `${nombre}:` }).innerText());
  }

  /**
   * CASO 1 (NORMAL) — Castilla y León, 180.000 €, gestoría 650 €. Dentro del primer tramo de su
   * escala (8 % hasta 250.000 €), con los dos vendedores.
   *   a) PARTICULAR: ITP = 180.000 × 8 % = 14.400,00 → «ITP (8,00 %)»; sin AJD ni IVA.
   *      Notaría: 90,151816 + 108,182205 + 45,0759 + 90,15182 + 29.746,97 × 0,05 % (14,873485)
   *      = 348,435226 × 0,95 = 331,013465 × 1,21 = 400,526292 → ×1,5 = 600,79 · ×2 = 801,05 ·
   *      ×1,75 = 700,92. Registro: 24,040484 + 42,0708575 + 37,56325 + 67,613865 + 29.746,97 ×
   *      0,03 % (8,924091) = 180,212548 × 0,95 = 171,201920 + 9,015182 = 180,217102 × 1,21 = 218,06.
   *      Total = 14.400 + 700,92 + 218,06 + 650 = 15.968,98 (8,87 %) · coste 195.968,98, completo.
   *   b) PROMOTOR: IVA = 180.000 × 21 % = 37.800,00 · AJD = 180.000 × 1,5 % = 2700,00; los mismos
   *      aranceles. Total = 37.800 + 2700 + 700,92 + 218,06 + 650 = 42.068,98 (23,37 %) · coste
   *      222.068,98, con la salvedad del IVA deducible y la del art. 30.1.
   * Y lo que la sospecha del agente de garaje miraba en su app: aquí no se ofrece ningún tipo
   * reducido (ni el 0,01 % de «Municipios poco poblados»), porque la app no tiene esa caja.
   */
  test('CASO 1 (normal) — Castilla y León, 180.000 €: ITP 8 % = 14.400 € y, con promotor, IVA 37.800 € + AJD 2700 €; aranceles con el IVA de data/fiscal', async ({ page }) => {
    expect(PORCENTAJES_IVA.general).toBe(21);
    await abrir(page, 'castilla-leon', 'particular');
    await sembrarValor(page, SEL_GESTORIA, '650');
    await sembrarValor(page, SEL_PRECIO, '180000');
    const a = await leer(page);
    expect(tarjeta(a, /^Precio del solar/).valor).toBe('180.000,00 €');
    expect(tarjeta(a, /^ITP \(/).titulo).toBe('ITP (8,00 %)');
    expect(tarjeta(a, /^ITP \(/).valor).toBe('14.400,00 €');
    expect(a.some((c) => /^(AJD|IVA|IGIC|IPSI)/.test(c.titulo))).toBe(false);
    expect(tarjeta(a, /^Gastos de notaría/).titulo).toBe('Gastos de notaría (IVA incluido)');
    expect(tarjeta(a, /^Gastos de notaría/).valor).toBe('700,92 €');
    expect(tarjeta(a, /^Gastos de notaría/).desc).toMatch(/^Factura estimada entre 600,79 € y 801,05 €\./);
    expect(tarjeta(a, /^Registro de la Propiedad/).titulo).toBe('Registro de la Propiedad (IVA incluido)');
    expect(tarjeta(a, /^Registro de la Propiedad/).valor).toBe('218,06 €');
    expect(tarjeta(a, /^Gastos de gestoría/).valor).toBe('650,00 €');
    expect(tarjeta(a, /^Total gastos/).titulo).toBe('Total gastos adicionales');
    expect(tarjeta(a, /^Total gastos/).valor).toBe('15.968,98 €');
    expect(tarjeta(a, /^Total gastos/).desc).toBe('8,87 % sobre el precio de compra');
    expect(tarjeta(a, /^COSTE TOTAL/).titulo).toBe('COSTE TOTAL DE ADQUISICIÓN');
    expect(tarjeta(a, /^COSTE TOTAL/).valor).toBe('195.968,98 €');
    expect(tarjeta(a, /^COSTE TOTAL/).desc).toBe('Precio + todos los gastos de la operación');
    const recuadro = n(await page.locator('[class*="infoCcaa"]').first().innerText());
    expect(recuadro).toContain('ITP General 8 %');
    expect(recuadro).toContain('AJD 1,5 %');
    expect(recuadro).toContain('aplica escala progresiva (8 % → 10 %): cada tramo del valor tributa a su tipo');
    await expect(page.locator('body')).not.toContainText('Podrías pagar menos');
    expect(n(await page.locator('[class*="resultados"]').innerText())).not.toContain('0,01');

    await elegir(page, 'promotor');
    const b = await leer(page);
    expect(b.some((c) => /^ITP/.test(c.titulo))).toBe(false);
    expect(tarjeta(b, /^IVA \(/).titulo).toBe('IVA (21,00 %)');
    expect(tarjeta(b, /^IVA \(/).valor).toBe('37.800,00 €');
    expect(tarjeta(b, /^AJD \(/).titulo).toBe('AJD (1,50 %)');
    expect(tarjeta(b, /^AJD \(/).valor).toBe('2700,00 €');
    expect(tarjeta(b, /^Gastos de notaría/).valor).toBe('700,92 €');
    expect(tarjeta(b, /^Registro de la Propiedad/).valor).toBe('218,06 €');
    expect(tarjeta(b, /^Total gastos/).titulo).toBe('Total gastos adicionales');
    expect(tarjeta(b, /^Total gastos/).valor).toBe('42.068,98 €');
    expect(tarjeta(b, /^Total gastos/).desc).toBe('23,37 % sobre el precio de compra');
    expect(tarjeta(b, /^COSTE TOTAL/).titulo).toBe('COSTE TOTAL DE ADQUISICIÓN');
    expect(tarjeta(b, /^COSTE TOTAL/).valor).toBe('222.068,98 €');
    expect(tarjeta(b, /^COSTE TOTAL/).desc).toBe(
      `Precio + todos los gastos (antes de deducir el IVA si tienes derecho). ${AVISO_BASE_AJD}`,
    );
  });

  /**
   * CASO 2 (LÍMITE) — Comunidad Foral de Navarra, «150.253,03» € (el corte EXACTO entre el 4.º y el
   * 5.º tramo de los dos aranceles: el 5.º no debe sumar nada) y gestoría «0» (un cero escrito, que
   * sí vale: sin tarjeta de gestoría y con el cierre completo, no parcial).
   *   a) PARTICULAR: ITP = 150.253,03 × 6 % = 9015,1818 → 9015,18 «ITP (6,00 %)».
   *      Notaría: 90,151816 + 108,182205 + 45,0759 + 90,15182 = 333,561741 × 0,95 × 1,21 =
   *      383,429221 → ×1,5 = 575,14 · ×2 = 766,86 · ×1,75 = 671,00. Registro: 24,040484 +
   *      42,0708575 + 37,56325 + 67,613865 = 171,288457 × 0,95 + 9,015182 = 171,739216 × 1,21 =
   *      207,80. Total = 9015,18 + 671,00 + 207,80 = 9893,98 (6,58 %) · coste 160.147,01.
   *   b) PROMOTOR: IVA = 150.253,03 × 21 % = 31.553,1363 → 31.553,14 · AJD = 150.253,03 × 0,5 % =
   *      751,26515 → 751,27 «AJD (0,50 %)». Total = 31.553,14 + 751,27 + 671,00 + 207,80 =
   *      33.183,21 (22,08 %) · coste 183.436,24.
   */
  test('CASO 2 (límite) — Navarra, 150.253,03 € (corte del 4.º tramo de los aranceles) con gestoría «0»: cierre completo, sin tarjeta de gestoría', async ({ page }) => {
    await abrir(page, 'navarra', 'particular');
    await sembrarValor(page, SEL_GESTORIA, '0');
    await sembrarValor(page, SEL_PRECIO, '150.253,03');
    const a = await leer(page);
    expect(tarjeta(a, /^Precio del solar/).valor).toBe('150.253,03 €');
    expect(tarjeta(a, /^ITP \(/).titulo).toBe('ITP (6,00 %)');
    expect(tarjeta(a, /^ITP \(/).valor).toBe('9015,18 €');
    expect(tarjeta(a, /^Gastos de notaría/).valor).toBe('671,00 €');
    expect(tarjeta(a, /^Gastos de notaría/).desc).toMatch(/^Factura estimada entre 575,14 € y 766,86 €\./);
    expect(tarjeta(a, /^Registro de la Propiedad/).valor).toBe('207,80 €');
    expect(a.some((c) => /^Gastos de gestoría/.test(c.titulo))).toBe(false);
    expect(tarjeta(a, /^Total gastos/).titulo).toBe('Total gastos adicionales');
    expect(tarjeta(a, /^Total gastos/).valor).toBe('9893,98 €');
    expect(tarjeta(a, /^Total gastos/).desc).toBe('6,58 % sobre el precio de compra');
    expect(tarjeta(a, /^COSTE TOTAL/).titulo).toBe('COSTE TOTAL DE ADQUISICIÓN');
    expect(tarjeta(a, /^COSTE TOTAL/).valor).toBe('160.147,01 €');
    expect(tarjeta(a, /^COSTE TOTAL/).desc).toBe('Precio + todos los gastos de la operación');
    const recuadro = n(await page.locator('[class*="infoCcaa"]').first().innerText());
    expect(recuadro).toContain('ITP General 6 %');
    expect(recuadro).toContain('AJD 0,5 %');
    expect(recuadro).not.toContain('Tipo según el valor');

    await elegir(page, 'promotor');
    const b = await leer(page);
    expect(tarjeta(b, /^IVA \(/).titulo).toBe('IVA (21,00 %)');
    expect(tarjeta(b, /^IVA \(/).valor).toBe('31.553,14 €');
    expect(tarjeta(b, /^AJD \(/).titulo).toBe('AJD (0,50 %)');
    expect(tarjeta(b, /^AJD \(/).valor).toBe('751,27 €');
    expect(tarjeta(b, /^Gastos de notaría/).valor).toBe('671,00 €');
    expect(tarjeta(b, /^Registro de la Propiedad/).valor).toBe('207,80 €');
    expect(b.some((c) => /^Gastos de gestoría/.test(c.titulo))).toBe(false);
    expect(tarjeta(b, /^Total gastos/).titulo).toBe('Total gastos adicionales');
    expect(tarjeta(b, /^Total gastos/).valor).toBe('33.183,21 €');
    expect(tarjeta(b, /^Total gastos/).desc).toBe('22,08 % sobre el precio de compra');
    expect(tarjeta(b, /^COSTE TOTAL/).titulo).toBe('COSTE TOTAL DE ADQUISICIÓN');
    expect(tarjeta(b, /^COSTE TOTAL/).valor).toBe('183.436,24 €');

    // El «0» de la gestoría sobrevive al blur (min={0} no lo reescribe) y no se trata como un dato que falta.
    await page.locator(SEL_GESTORIA).focus();
    await page.locator(SEL_GESTORIA).blur();
    await expect(page.locator(SEL_GESTORIA)).toHaveValue('0');
    expect(tarjeta(await leer(page), /^COSTE TOTAL/).titulo).toBe('COSTE TOTAL DE ADQUISICIÓN');
  });

  /**
   * CASO 3 (RECHAZO) — lo PEGADO con palabras, que desde el 20/10/2026 se queda escrito (2965).
   *   a) Madrid, particular, 85.000 € con la gestoría de 500 € que trae el campo: coste 91.291,29
   *      (5100,00 + 539,74 + 151,55 + 500). Se pega «120.000 euros» en el precio → ninguna cifra (ni
   *      la vieja de 85.000) y el marcador nombra lo escrito.
   *   b) El invariante en tres ramas que el testigo no recorre, a 90.000 € con la gestoría en 450 €
   *      y luego pegada como «EUR 450»: el total y el coste BAJAN 450,00 €, la gestoría sale «Sin
   *      leer», los dos cierres se rotulan parciales y el coste dice «será mayor».
   *        · País Vasco (foral), particular: ITP 90.000 × 7 % = 6300,00 · notaría 549,79 · registro
   *          155,86 → total 7455,65, coste 97.455,65 → con «EUR 450»: 7005,65 y 97.005,65.
   *        · Melilla, particular: ITP 90.000 × 6 % × 50 % = 2700,00 · notaría sin IPSI 454,38 ·
   *          registro sin IPSI 128,81 → 3733,19 y 93.733,19 → 3283,19 y 93.283,19.
   *        · Melilla, promotor: IPSI sin calcular · AJD 90.000 × 0,5 % × 50 % = 225,00 → 1258,19 y
   *          91.258,19 → 808,19 y 90.808,19, con «el IPSI ni la gestoría».
   *   c) Una TECLA que haría ilegible un valor legible se rechaza: «450» + «x» sigue en «450».
   *   d) El IBI: 480 € con escritura el 10/05/2027 → vendedor 31+28+31+30+9 = 129 días, 480 × 129 /
   *      365 = 169,64; comprador 236 días, 480 − 169,6438 = 310,36. Pegado «480 euros» → se nombra
   *      el campo y no se reparte nada.
   */
  test('CASO 3 (rechazo) — lo pegado con palabras no se lee: el precio se nombra sin cifra vieja; la gestoría baja 450 € y se nombra en el foral y en Melilla; el IBI no se reparte', async ({ page }) => {
    await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
    await abrir(page, 'madrid', 'particular');
    await sembrarValor(page, SEL_PRECIO, '85000');
    expect(tarjeta(await leer(page), /^COSTE TOTAL/).valor).toBe('91.291,29 €');
    await pegar(page, SEL_PRECIO, '120.000 euros');
    await expect(page.locator('[class*="resultados"] h3')).toHaveCount(0);
    await expect(marcador(page)).toHaveText(
      'No se ha podido leer el precio «120.000 euros». Introduce el precio del solar para ver el desglose de gastos, con coma decimal (120.000 o 120000,50)',
    );

    const ramas: Array<{
      ccaa: string;
      vende: 'particular' | 'promotor';
      antes: [string, string];
      despues: [string, string];
      coste: string;
    }> = [
      {
        ccaa: 'pais-vasco',
        vende: 'particular',
        antes: ['7455,65 €', '97.455,65 €'],
        despues: ['7005,65 €', '97.005,65 €'],
        coste: 'No incluye la gestoría, que no se ha podido leer: el coste real será mayor',
      },
      {
        ccaa: 'melilla',
        vende: 'particular',
        antes: ['3733,19 €', '93.733,19 €'],
        despues: ['3283,19 €', '93.283,19 €'],
        coste: 'No incluye la gestoría, que no se ha podido leer: el coste real será mayor',
      },
      {
        ccaa: 'melilla',
        vende: 'promotor',
        antes: ['1258,19 €', '91.258,19 €'],
        despues: ['808,19 €', '90.808,19 €'],
        coste: `No incluye el IPSI ni la gestoría, que no se ha podido leer: el coste real será mayor. ${AVISO_BASE_AJD}`,
      },
    ];
    for (const r of ramas) {
      const etiqueta = `${r.ccaa}/${r.vende}`;
      await comunidad(page, r.ccaa);
      await elegir(page, r.vende);
      await sembrarValor(page, SEL_PRECIO, '90000');
      await sembrarValor(page, SEL_GESTORIA, '450');
      const a = await leer(page);
      expect(tarjeta(a, /^Gastos de gestoría/).valor, etiqueta).toBe('450,00 €');
      expect(tarjeta(a, /^Total gastos/).valor, etiqueta).toBe(r.antes[0]);
      expect(tarjeta(a, /^COSTE TOTAL/).valor, etiqueta).toBe(r.antes[1]);
      await pegar(page, SEL_GESTORIA, 'EUR 450');
      const b = await leer(page);
      expect(tarjeta(b, /^Gastos de gestoría/).valor, etiqueta).toBe('Sin leer');
      expect(tarjeta(b, /^Total gastos/).titulo, etiqueta).toBe('Total gastos adicionales (parcial)');
      expect(tarjeta(b, /^Total gastos/).valor, etiqueta).toBe(r.despues[0]);
      expect(tarjeta(b, /^Total gastos/).desc, etiqueta).toContain('SIN la gestoría, que no se ha podido leer');
      expect(tarjeta(b, /^COSTE TOTAL/).titulo, etiqueta).toBe('COSTE TOTAL (PARCIAL)');
      expect(tarjeta(b, /^COSTE TOTAL/).valor, etiqueta).toBe(r.despues[1]);
      expect(tarjeta(b, /^COSTE TOTAL/).desc, etiqueta).toBe(r.coste);
    }

    await sembrarValor(page, SEL_GESTORIA, '450');
    await page.locator(SEL_GESTORIA).click();
    await page.keyboard.press('End');
    await page.keyboard.type('x');
    await expect(page.locator(SEL_GESTORIA)).toHaveValue('450');
    expect(tarjeta(await leer(page), /^Gastos de gestoría/).valor).toBe('450,00 €');

    const bloque = page.locator('section[aria-labelledby="titulo-prorrateo"]');
    const fecha = bloque.locator('input[type="date"]');
    await fecha.fill('2027-05-10');
    await esperarValorEnReact(page, fecha, '2027-05-10');
    await sembrarValor(page, SEL_IBI, '480');
    expect(n(await bloque.locator('tbody tr').first().innerText())).toBe(
      'IBI del año 01/01/2027 – 31/12/2027 169,64 € · 129 días 310,36 € · 236 días',
    );
    await expect(bloque).toContainText('el comprador le abona en la firma 310,36 €.');
    await pegar(page, SEL_IBI, '480 euros');
    await expect(bloque.locator('[role="alert"]')).toContainText('No se entiende el importe de «Cuota anual del IBI»');
    await expect(bloque).not.toContainText('abona');
    await expect(bloque.locator('table')).toHaveCount(0);
  });

  /**
   * f6de548d (hallazgo 3251, 20/10/2026), en esta app: la nota de Madrid de data/itp-ccaa.ts, que el
   * recuadro pinta por defecto, dice el dato («ITP general del 6 %») y ya no declara a Madrid el ITP
   * más bajo de la península, con Navarra al mismo 6 % en el recuadro de esta misma página.
   */
  test('f6de548d (3251) — la nota de Madrid del recuadro dice el dato, sin declararla el ITP más bajo', async ({ page }) => {
    await abrir(page, 'navarra', 'particular');
    expect(n(await page.locator('[class*="infoCcaa"]').first().innerText())).toContain('ITP General 6 %');
    const madrid = await fichaComunidad(page, 'madrid');
    expect(madrid).toContain('ITP general del 6 %');
    expect(madrid).not.toMatch(/más bajo/);
  });

  /**
   * ✅ REPARADO 21/10/2026 (hallazgo 3405): las seis notas de data/itp-ccaa.ts dicen el dato, sin
   * ranking ni calificativo (Castilla y León, con la cifra de su propio reducido: 0,01 %).
   * Lo que se vio (contenido, bajo) — [21/10-a] La forma de los 2915/2917/2921 (Canarias) y del
   * 3251 (Madrid), en las notas que quedan de data/itp-ccaa.ts. El recuadro de esta app pinta la
   * ficha de cada comunidad (desde 2208), y la reparación de esas dos dijo «el dato, sin ranking».
   * Quedan:
   *   · País Vasco: «ITP del 4 % en vivienda (el más bajo de España)». En esta misma app Ceuta y
   *     Melilla cobran el 3 % efectivo (6 % con la bonificación del 50 % del art. 57 bis.3.a
   *     TRLITPAJD, que alcanza a cualquier inmueble de la ciudad, también la vivienda): el ranking
   *     es falso con la tabla del propio motor (la misma lectura del 2915: «Ceuta y Melilla, 3 %
   *     efectivo, son más baratas»).
   *   · Y calificativos territoriales, el antipatrón 6 del §1.quinquies del CLAUDE.md («las
   *     diferencias geográficas son hechos, no notas»; precedente, el 1878 de donaciones): Navarra
   *     «ITP bajo (6 %). AJD muy reducido (0,5 %)» (el País Vasco cobra al solar el mismo 0,5 %),
   *     Cataluña «ITP elevado», La Rioja «ITP moderado (7 %)», Baleares «Una de las escalas más
   *     altas de España» (Cataluña llega al mismo 13 %) y Castilla y León «Gran incentivo contra
   *     despoblación».
   *   Esperado: cada nota dice su dato sin ranking ni calificativo · obtenido: las seis frases.
   */
  test('[21/10-a] las notas de comunidad que pinta el recuadro dicen el dato, sin ranking ni calificativo', async ({ page }) => {
    await abrir(page, 'ceuta', 'particular');
    await sembrarValor(page, SEL_PRECIO, '200000');
    // La cifra que desmiente el «más bajo de España»: 200.000 × 6 % × 50 % = 6000,00 → 3,00 %.
    expect(tarjeta(await leer(page), /^ITP \(/).titulo).toBe('ITP (3,00 %)');
    expect(ITP_CCAA['pais-vasco'].tipoGeneral).toBe(4);
    const calificativo = /más baj[oa]s? de España|más altas? de España|ITP (bajo|elevado|moderado)|muy reducido|Gran incentivo/i;
    const malas: string[] = [];
    for (const c of ['pais-vasco', 'navarra', 'cataluna', 'rioja', 'baleares', 'castilla-leon'] as const) {
      const ficha = await fichaComunidad(page, c);
      expect(ficha, c).toMatch(new RegExp(`^${ITP_CCAA[c].nombre}:`));
      const m = ficha.match(calificativo);
      if (m) malas.push(`${c}: «${m[0]}»`);
    }
    expect(malas).toEqual([]);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// INSPECTOR 25/10/2026 — la familia «Compraventa inmobiliaria» entera, una hermana por agente;
// esta, la última (referencia: estimador-compraventa-inmueble; testigo tests/familias/compraventa.spec.ts,
// 93/93 en verde en esta copia). La app volvió a la cola INVALIDADA por dos commits de data/itp-ccaa.ts:
//   · aa47727a movió SALVEDAD_PLUSVALIA_NO_RESIDENTE a data/itp-ccaa.ts (metadata.ts la reexporta).
//     Se sostiene: la constante, LITERAL, en sus cinco bocas (test «aa47727a»).
//   · 92df481b cambió calcularPlusvaliaMunicipal (adquisicionSoloSuelo, valorSueloTransmision,
//     sinRepartoSolar). Esta app NO lo llama: no tiene pestaña de vendedor ni calcula la plusvalía (ni
//     el IRPF), la nombra como recordatorio con la no sujeción del art. 104.5 TRLRHL. Por eso el cabo
//     C0441 (la plusvalía del promotor que compró un solar: 3489, 3500, 3504) no tiene aquí dónde
//     reproducirse: lo que se vende ES el solar, y no hay cifra de plusvalía que mirar.
//
// De dónde sale cada cifra (ninguna de memoria; aritmética en un script propio que no llama al código
// de la app): ITP → TIPOS_ITP_CCAA_2025 (data/fiscal/inmuebles.ts: Andalucía 7, Baleares 8 con la escala
// 8/9/10/12/13 de ITP_CCAA.baleares, Cataluña 10 con 10/11/12/13, Valencia 9 y el 11 % del umbral del
// millón) y la excepción de Ceuta y Melilla (6 % × BONIFICACION_CUOTA_CEUTA_MELILLA 0,5, art. 57 bis.3.a
// TRLITPAJD); AJD → ITP_CCAA[x].ajd (Andalucía 1,2, Baleares 1,5, Canarias 0,75, Ceuta 0,5 × 0,5); IVA →
// PORCENTAJES_IVA.general = 21; notaría → ARANCELES_NOTARIO × 0,95 × 1,21 (sin el 1,21 en Canarias, Ceuta
// y Melilla) × 1,5 / 1,75 / 2, con lo reglado hasta LIMITE_ARANCEL_NOTARIAL; registro → ARANCELES_REGISTRO
// × 0,95 + 6,010121 + 3,005061, × 1,21 donde rige el IVA.
//
// LA PÁGINA TRADUCIDA (el traductor simulado de tests/apps/generador-loteria.spec.ts, cada nodo de texto a
// <font><font>, y su detector de texto viejo): recorridas las 19 comunidades con los dos vendedores, el
// paso de vendedor en Canarias, Ceuta, Melilla, País Vasco y Madrid, el umbral valenciano, el precio vacío,
// ilegible, 0 y de libre acuerdo, la gestoría ilegible, la guía, el tema y el reparto del IBI. Sale:
//   (a) el recuadro de la comunidad se queda con la ANTERIOR → HALLAZGO [25/10-c], que alcanza también a la
//       nota de los honorarios («llevan además IGIC» en Ceuta);
//   (b) salir de Ceuta o Melilla a cualquier otra comunidad tumba la app → HALLAZGO [25/10-b];
//   (c) NO se reproduce: el botón («Paga IGIC + AJD»), la casilla «IPSI (empresario)» y las tarjetas
//       dicen el impuesto del territorio también traducidas (test «(c)»);
//   los dos de componentes compartidos registrados hoy en otra app se reproducen aquí (3493, 3498); el 3497
//   (el rótulo de NumberInput) no, porque los tres rótulos de esta app son constantes.
// ═══════════════════════════════════════════════════════════════════════════════

const I25_VER_HUECOS = Boolean(process.env.VER_HUECOS);

test.describe('Inspector 25/10/2026 — Andalucía, Baleares a 6,5 M, Melilla, el no residente y la página traducida', () => {
  test.describe.configure({ timeout: 90_000 });
  const SEL_PRECIO = `input[aria-label="${PRECIO}"]`;
  const SEL_GESTORIA = `input[aria-label="${GESTORIA}"]`;
  const SEL_IBI = 'input[aria-label="Cuota anual del IBI"]';
  const n = (s: string | null | undefined): string => (s ?? '').replace(/\s+/g, ' ').trim();
  /** El marcador del panel sin cifra (no el anunciador de rutas de Next). */
  const marcador = (page: Page) => page.locator('[class*="placeholder"] p');
  const caida = (page: Page) => page.getByText('Algo salió mal');

  interface I25Tarjeta {
    titulo: string;
    valor: string;
    desc: string;
  }

  /** Las tarjetas del panel de resultados, en orden, con lo que se VE (textContent: con la página traducida es el <font>). */
  const leer = (page: Page): Promise<I25Tarjeta[]> =>
    page.evaluate(() => {
      const cont = document.querySelector('[class*="resultados"]');
      const norm = (s: string | null | undefined) => (s ?? '').replace(/\s+/g, ' ').trim();
      return [...(cont?.querySelectorAll('h3') ?? [])].map((h) => {
        const card = h.parentElement!.parentElement!;
        const valor = card.querySelector(':scope > div:nth-of-type(2) > p');
        const ps = card.querySelectorAll(':scope > p');
        return {
          titulo: norm(h.textContent),
          valor: norm(valor?.textContent),
          desc: ps.length ? norm(ps[ps.length - 1].textContent) : '',
        };
      });
    });

  const tarjeta = (ts: I25Tarjeta[], re: RegExp): I25Tarjeta => {
    const x = ts.find((c) => re.test(c.titulo));
    if (!x) throw new Error(`No hay tarjeta ${re} entre: ${ts.map((c) => c.titulo).join(' | ')}`);
    return x;
  };

  /** Las casillas del recuadro de la comunidad, rótulo y cifra («ITP General 7 %»), tal como se ven. */
  const casillas = (page: Page): Promise<string[]> =>
    page.locator('[class*="infoCcaaItem"]').evaluateAll((els) =>
      els.map((e) =>
        `${e.querySelector('[class*="infoCcaaLabel"]')?.textContent ?? ''} ${e.querySelector('[class*="infoCcaaValue"]')?.textContent ?? ''}`
          .replace(/\s+/g, ' ')
          .trim(),
      ),
    );
  /** El recuadro entero (nombre, casillas y notas), tal como se ve. */
  const recuadro = async (page: Page): Promise<string> =>
    n(await page.locator('[class*="infoCcaa"]').first().textContent());

  async function elegir(page: Page, vende: 'particular' | 'promotor'): Promise<void> {
    const boton = page.getByRole('button', { name: vende === 'particular' ? /Un particular/ : /Promotor \/ Empresa/ });
    await boton.click();
    await expect(boton).toHaveAttribute('aria-pressed', 'true');
  }

  async function abrir(page: Page, ccaa: string, vende: 'particular' | 'promotor', precio?: string): Promise<void> {
    await page.goto(RUTA);
    await esperarHidratacion(page, [SEL_PRECIO, SEL_GESTORIA, SEL_IBI]);
    await page.selectOption('#select-ccaa', ccaa);
    await expect(page.locator('#select-ccaa')).toHaveValue(ccaa);
    await elegir(page, vende);
    if (precio !== undefined) await sembrarValor(page, SEL_PRECIO, precio);
  }

  /** El traductor del navegador, como en generador-loteria: cada nodo de texto pasa a <font><font>…</font></font>. */
  const traducir = (page: Page) =>
    page.evaluate(() => {
      const caminante = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
        acceptNode: (nodo) => {
          const padre = nodo.parentElement;
          if (!padre || !(nodo.nodeValue ?? '').trim()) return NodeFilter.FILTER_REJECT;
          if (/^(SCRIPT|STYLE|OPTION|NOSCRIPT|FONT)$/.test(padre.tagName)) return NodeFilter.FILTER_REJECT;
          return NodeFilter.FILTER_ACCEPT;
        },
      });
      const nodos: Text[] = [];
      while (caminante.nextNode()) nodos.push(caminante.currentNode as Text);
      for (const nodo of nodos) {
        const exterior = document.createElement('font');
        const interior = document.createElement('font');
        interior.textContent = nodo.nodeValue;
        exterior.appendChild(interior);
        nodo.parentNode?.replaceChild(exterior, nodo);
      }
    });

  /**
   * CASO 1 (NORMAL) — Andalucía, 95.000 €, con la gestoría de 500 € que trae el campo.
   *   a) PARTICULAR: ITP = 95.000 × 7 % = 6650,00 → «ITP (7,00 %)»; sin AJD ni IVA.
   *      Notaría: 90,151816 + 24.040,49 × 0,45 % (108,182205) + 30.050,60 × 0,15 % (45,0759) +
   *      34.898,79 × 0,10 % (34,89879) = 278,308711 × 0,95 × 1,21 = 319,915863 → ×1,5 = 479,87 ·
   *      ×2 = 639,83 · ×1,75 = 559,85. Registro: 24,040484 + 42,0708575 + 37,56325 + 34.898,79 ×
   *      0,075 % (26,1740925) = 129,848684 × 0,95 + 9,015182 = 132,371432 × 1,21 = 160,17.
   *      Total = 6650 + 559,85 + 160,17 + 500 = 7870,02 (8,28 %) · coste 102.870,02, completo.
   *   b) PROMOTOR: IVA = 95.000 × 21 % = 19.950,00 · AJD = 95.000 × 1,2 % = 1140,00; los mismos
   *      aranceles. Total = 19.950 + 1140 + 559,85 + 160,17 + 500 = 22.310,02 (23,48 %) · coste
   *      117.310,02, con la salvedad del IVA deducible y la del art. 30.1.
   */
  test('CASO 1 (normal) — Andalucía, 95.000 €: ITP 7 % = 6650 € y, con promotor, IVA 19.950 € + AJD 1,2 % = 1140 €', async ({ page }) => {
    expect(PORCENTAJES_IVA.general).toBe(21);
    expect(ITP_CCAA.andalucia.tipoGeneral).toBe(7);
    expect(ITP_CCAA.andalucia.ajd).toBe(1.2);
    await abrir(page, 'andalucia', 'particular', '95000');
    await expect(page.locator(SEL_GESTORIA)).toHaveValue('500');
    const a = await leer(page);
    expect(tarjeta(a, /^Precio del solar/).valor).toBe('95.000,00 €');
    expect(tarjeta(a, /^ITP \(/).titulo).toBe('ITP (7,00 %)');
    expect(tarjeta(a, /^ITP \(/).valor).toBe('6650,00 €');
    expect(a.some((c) => /^(AJD|IVA|IGIC|IPSI)/.test(c.titulo))).toBe(false);
    expect(tarjeta(a, /^Gastos de notaría/).titulo).toBe('Gastos de notaría (IVA incluido)');
    expect(tarjeta(a, /^Gastos de notaría/).valor).toBe('559,85 €');
    expect(tarjeta(a, /^Gastos de notaría/).desc).toMatch(/^Factura estimada entre 479,87 € y 639,83 €\./);
    expect(tarjeta(a, /^Registro de la Propiedad/).valor).toBe('160,17 €');
    expect(tarjeta(a, /^Gastos de gestoría/).valor).toBe('500,00 €');
    expect(tarjeta(a, /^Total gastos/).titulo).toBe('Total gastos adicionales');
    expect(tarjeta(a, /^Total gastos/).valor).toBe('7870,02 €');
    expect(tarjeta(a, /^Total gastos/).desc).toBe('8,28 % sobre el precio de compra');
    expect(tarjeta(a, /^COSTE TOTAL/).titulo).toBe('COSTE TOTAL DE ADQUISICIÓN');
    expect(tarjeta(a, /^COSTE TOTAL/).valor).toBe('102.870,02 €');
    expect(tarjeta(a, /^COSTE TOTAL/).desc).toBe('Precio + todos los gastos de la operación');
    expect(await casillas(page)).toEqual(['ITP General 7 %', 'AJD 1,2 %', 'IVA (empresario) 21 %']);
    const r = await recuadro(page);
    expect(r).toContain(n(`Andalucía: ${ITP_CCAA.andalucia.notas}`));
    expect(r).not.toContain('Tipo según el valor');

    await elegir(page, 'promotor');
    const b = await leer(page);
    expect(b.some((c) => /^ITP/.test(c.titulo))).toBe(false);
    expect(tarjeta(b, /^IVA \(/).titulo).toBe('IVA (21,00 %)');
    expect(tarjeta(b, /^IVA \(/).valor).toBe('19.950,00 €');
    expect(tarjeta(b, /^AJD \(/).titulo).toBe('AJD (1,20 %)');
    expect(tarjeta(b, /^AJD \(/).valor).toBe('1140,00 €');
    expect(tarjeta(b, /^Gastos de notaría/).valor).toBe('559,85 €');
    expect(tarjeta(b, /^Registro de la Propiedad/).valor).toBe('160,17 €');
    expect(tarjeta(b, /^Total gastos/).titulo).toBe('Total gastos adicionales');
    expect(tarjeta(b, /^Total gastos/).valor).toBe('22.310,02 €');
    expect(tarjeta(b, /^Total gastos/).desc).toBe('23,48 % sobre el precio de compra');
    expect(tarjeta(b, /^COSTE TOTAL/).titulo).toBe('COSTE TOTAL DE ADQUISICIÓN');
    expect(tarjeta(b, /^COSTE TOTAL/).valor).toBe('117.310,02 €');
    expect(tarjeta(b, /^COSTE TOTAL/).desc).toBe(
      `Precio + todos los gastos (antes de deducir el IVA si tienes derecho). ${AVISO_BASE_AJD}`,
    );
  });

  /**
   * CASO 2 (LÍMITE) — Baleares, 6.500.000 €: el tramo más alto de la escala más larga (13 %) y, a la
   * vez, por encima del límite del arancel notarial (6.010.121,04 €).
   *   a) PARTICULAR: ITP = 400.000 × 8 % + 200.000 × 9 % + 400.000 × 10 % + 1.000.000 × 12 % +
   *      4.500.000 × 13 % = 32.000 + 18.000 + 40.000 + 120.000 + 585.000 = 795.000,00 → «ITP (12,23 %)».
   *      Notaría, solo lo reglado: 333,561741 + 450.759,07 × 0,05 % (225,379535) + 5.409.108,94 × 0,03 %
   *      (1622,732682) = 2181,673958 × 0,95 × 1,21 = 2507,834215 → ×1,5 = 3761,75 · ×2 = 5015,67 · ×1,75 =
   *      4388,71, y el aviso del libre acuerdo. Registro: 171,288457 + 135,227721 + 5.898.987,90 × 0,02 %
   *      (1179,79758) = 1486,313758 (bajo el tope de 2181,67) × 0,95 + 9,015182 = 1421,013252 × 1,21 =
   *      1719,43. Total = 795.000 + 4388,71 + 1719,43 + 500 = 801.608,14 (12,33 %) · coste 7.301.608,14,
   *      los dos PARCIALES por la notaría de libre acuerdo.
   *   b) PROMOTOR: IVA = 6.500.000 × 21 % = 1.365.000,00 · AJD = 6.500.000 × 1,5 % = 97.500,00. Total =
   *      1.469.108,14 (22,60 %) · coste 7.969.108,14, parciales, con la salvedad del IVA y la del 30.1.
   */
  test('CASO 2 (límite) — Baleares, 6.500.000 €: el 13 % de la escala (795.000 €) y la notaría de libre acuerdo, con los dos cierres parciales', async ({ page }) => {
    expect(ITP_CCAA.baleares.tramosProgresivos?.map((t) => t.tipo)).toEqual([8, 9, 10, 12, 13]);
    expect(ITP_CCAA.baleares.ajd).toBe(1.5);
    expect(LIMITE_ARANCEL_NOTARIAL).toBe(6010121.04);
    await abrir(page, 'baleares', 'particular', '6500000');
    const a = await leer(page);
    expect(tarjeta(a, /^Precio del solar/).valor).toBe('6.500.000,00 €');
    expect(tarjeta(a, /^ITP \(/).titulo).toBe('ITP (12,23 %)');
    expect(tarjeta(a, /^ITP \(/).valor).toBe('795.000,00 €');
    expect(tarjeta(a, /^Gastos de notaría/).valor).toBe('4388,71 €');
    expect(tarjeta(a, /^Gastos de notaría/).desc).toBe(
      'Arancel hasta 6.010.121,04 €: factura estimada entre 3761,75 € y 5015,67 €. Lo que excede de ese valor no tiene arancel: sus honorarios son de libre acuerdo con el notario (RD 1426/1989, número 2), así que la factura real puede ser mayor.',
    );
    expect(tarjeta(a, /^Registro de la Propiedad/).valor).toBe('1719,43 €');
    expect(tarjeta(a, /^Total gastos/).titulo).toBe('Total gastos adicionales (parcial)');
    expect(tarjeta(a, /^Total gastos/).valor).toBe('801.608,14 €');
    expect(tarjeta(a, /^Total gastos/).desc).toBe(
      '12,33 % sobre el precio de compra — SIN la parte de la notaría de libre acuerdo (el valor que excede de 6.010.121,04 €)',
    );
    expect(tarjeta(a, /^COSTE TOTAL/).titulo).toBe('COSTE TOTAL (PARCIAL)');
    expect(tarjeta(a, /^COSTE TOTAL/).valor).toBe('7.301.608,14 €');
    expect(tarjeta(a, /^COSTE TOTAL/).desc).toBe('No incluye la parte de la notaría de libre acuerdo: el coste real puede ser mayor');
    expect(await casillas(page)).toEqual(['ITP General 8 %', 'AJD 1,5 %', 'IVA (empresario) 21 %']);
    expect(await recuadro(page)).toContain(
      'Tipo según el valor: aplica escala progresiva (8 % → 9 % → 10 % → 12 % → 13 %): cada tramo del valor tributa a su tipo.',
    );

    await elegir(page, 'promotor');
    const b = await leer(page);
    expect(tarjeta(b, /^IVA \(/).titulo).toBe('IVA (21,00 %)');
    expect(tarjeta(b, /^IVA \(/).valor).toBe('1.365.000,00 €');
    expect(tarjeta(b, /^AJD \(/).titulo).toBe('AJD (1,50 %)');
    expect(tarjeta(b, /^AJD \(/).valor).toBe('97.500,00 €');
    expect(tarjeta(b, /^Gastos de notaría/).valor).toBe('4388,71 €');
    expect(tarjeta(b, /^Registro de la Propiedad/).valor).toBe('1719,43 €');
    expect(tarjeta(b, /^Total gastos/).titulo).toBe('Total gastos adicionales (parcial)');
    expect(tarjeta(b, /^Total gastos/).valor).toBe('1.469.108,14 €');
    expect(tarjeta(b, /^Total gastos/).desc).toMatch(/^22,60 % sobre el precio de compra — SIN la parte de la notaría de libre acuerdo/);
    expect(tarjeta(b, /^COSTE TOTAL/).titulo).toBe('COSTE TOTAL (PARCIAL)');
    expect(tarjeta(b, /^COSTE TOTAL/).valor).toBe('7.969.108,14 €');
    expect(tarjeta(b, /^COSTE TOTAL/).desc).toBe(
      `No incluye la parte de la notaría de libre acuerdo: el coste real puede ser mayor (precio + gastos antes de deducir el IVA si tienes derecho). ${AVISO_BASE_AJD}`,
    );
  });

  /**
   * CASO 3 (RECHAZO) — Melilla, particular, 150.000 €.
   *   Válido: ITP = 150.000 × 6 % × 50 % = 4500,00 «ITP (3,00 %)». Notaría sin IPSI: 278,308711 −
   *   34,89879 + 89.898,79 × 0,10 % (89,89879) = 333,308711 × 0,95 = 316,643275 → ×1,5 = 474,96 · ×2 =
   *   633,29 · ×1,75 = 554,13. Registro sin IPSI: 171,288457 − 67,613865 + 89.898,79 × 0,075 %
   *   (67,4240925) = 171,0986845 × 0,95 + 9,015182 = 171,56. Total = 4500 + 554,13 + 171,56 + 500 =
   *   5725,69 (3,82 %) · coste 155.725,69, parcial por el IPSI de los honorarios.
   *   · Gestoría «2.000.50» (ilegible): «Sin leer», el total BAJA 500 → 5225,69 (3,48 %) y el coste
   *     155.225,69, que lo nombra y dice «será mayor».
   *   · Precio «1e5» (parseSpanishNumber no admite exponentes): ninguna cifra y el marcador lo nombra.
   *   · Precio «0,001»: se queda en 0,00 € al céntimo y tiene que ser mayor que 0.
   *   · Precio solo con espacios: NumberInput los quita, el campo queda vacío y pide el precio.
   */
  test('CASO 3 (rechazo) — Melilla, 150.000 €: la gestoría ilegible baja 500 € y se nombra; «1e5», «0,001» y los espacios no publican cifra', async ({ page }) => {
    expect(ITP_CCAA.melilla.tipoGeneral).toBe(6);
    expect(BONIFICACION_CUOTA_CEUTA_MELILLA).toBe(0.5);
    await abrir(page, 'melilla', 'particular', '150000');
    const a = await leer(page);
    expect(tarjeta(a, /^ITP \(/).titulo).toBe('ITP (3,00 %)');
    expect(tarjeta(a, /^ITP \(/).valor).toBe('4500,00 €');
    expect(tarjeta(a, /^Gastos de notaría/).titulo).toBe('Gastos de notaría (sin IPSI)');
    expect(tarjeta(a, /^Gastos de notaría/).valor).toBe('554,13 €');
    expect(tarjeta(a, /^Gastos de notaría/).desc).toMatch(/^Factura estimada entre 474,96 € y 633,29 €\./);
    expect(tarjeta(a, /^Registro de la Propiedad/).titulo).toBe('Registro de la Propiedad (sin IPSI)');
    expect(tarjeta(a, /^Registro de la Propiedad/).valor).toBe('171,56 €');
    expect(tarjeta(a, /^Total gastos/).titulo).toBe('Total gastos adicionales (parcial)');
    expect(tarjeta(a, /^Total gastos/).valor).toBe('5725,69 €');
    expect(tarjeta(a, /^Total gastos/).desc).toBe(`3,82 % sobre el precio de compra${sinHonorarios('IPSI')}`);
    expect(tarjeta(a, /^COSTE TOTAL/).titulo).toBe('COSTE TOTAL (PARCIAL)');
    expect(tarjeta(a, /^COSTE TOTAL/).valor).toBe('155.725,69 €');
    expect(tarjeta(a, /^COSTE TOTAL/).desc).toBe(SOLO_HONORARIOS('IPSI'));

    await sembrarValor(page, SEL_GESTORIA, '2.000.50');
    const b = await leer(page);
    expect(tarjeta(b, /^Gastos de gestoría/).valor).toBe('Sin leer');
    expect(tarjeta(b, /^Total gastos/).titulo).toBe('Total gastos adicionales (parcial)');
    expect(tarjeta(b, /^Total gastos/).valor).toBe('5225,69 €');
    expect(tarjeta(b, /^Total gastos/).desc).toBe(
      `3,48 % sobre el precio de compra — SIN la gestoría, que no se ha podido leer${sinHonorarios('IPSI')}`,
    );
    expect(tarjeta(b, /^COSTE TOTAL/).valor).toBe('155.225,69 €');
    expect(tarjeta(b, /^COSTE TOTAL/).desc).toBe('No incluye la gestoría, que no se ha podido leer: el coste real será mayor');

    const sinCifra = page.locator('[class*="resultados"] h3');
    await sembrarValor(page, SEL_PRECIO, '1e5');
    await expect(sinCifra).toHaveCount(0);
    await expect(marcador(page)).toHaveText(
      'No se ha podido leer el precio «1e5». Introduce el precio del solar para ver el desglose de gastos, con coma decimal (120.000 o 120000,50)',
    );
    await sembrarValor(page, SEL_PRECIO, '0,001');
    await expect(sinCifra).toHaveCount(0);
    await expect(marcador(page)).toHaveText(
      'El precio escrito («0,001») se queda en 0,00 € al céntimo, y tiene que ser mayor que 0: corrígelo para ver el desglose de gastos del solar.',
    );
    await sembrarValor(page, SEL_PRECIO, '   ', { esperado: '' });
    await expect(page.locator(SEL_PRECIO)).toHaveValue('');
    await expect(sinCifra).toHaveCount(0);
    await expect(marcador(page)).toHaveText('Introduce el precio del solar para ver el desglose de gastos');
  });

  /**
   * aa47727a y 92df481b, en esta app. La salvedad del comprador sustituto (art. 106.2 TRLRHL) vive desde
   * aa47727a en data/itp-ccaa.ts y la app la reexporta: sigue, LITERAL, en sus cinco bocas (FAQ visible,
   * FAQPage, nota «Recuerda», tarjeta «El vendedor y la plusvalía municipal» y Limitaciones). Y el motor
   * de la plusvalía que cambió 92df481b no tiene aquí ninguna boca: ni pestaña de vendedor ni tarjeta de
   * plusvalía; la página da la no sujeción del art. 104.5 TRLRHL como regla, sin cifra. Por eso el cabo
   * C0441 (3489, 3500, 3504) no se reproduce: lo que se vende es el solar mismo y no se calcula nada.
   */
  test('aa47727a — la salvedad del no residente, literal en sus cinco bocas; y ninguna cifra de plusvalía (92df481b y C0441 no tienen boca aquí)', async ({ page }) => {
    await abrir(page, 'madrid', 'particular', '120000');
    await expect(page.getByRole('tab')).toHaveCount(0);
    expect((await leer(page)).some((c) => /plusval/i.test(c.titulo))).toBe(false);
    const recuerda = n(await page.locator('[role="note"]', { hasText: 'Recuerda:' }).textContent());
    expect(recuerda).toContain('sin incremento, la transmisión no está sujeta (art. 104.5 TRLRHL)');
    expect(recuerda).toContain(`con una excepción: ${SALVEDAD_PLUSVALIA_NO_RESIDENTE}.`);

    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
    const pregunta = '¿Hay plusvalía municipal al comprar o vender un solar?';
    const visible = n(await page.locator('strong', { hasText: pregunta }).locator('xpath=../p').textContent());
    const ld = (await page.locator('script[type="application/ld+json"]').allTextContents()).map(
      (t) => JSON.parse(t) as { '@type'?: string; mainEntity?: { name: string; acceptedAnswer: { text: string } }[] },
    );
    const servida = ld.find((x) => x['@type'] === 'FAQPage')?.mainEntity?.find((e) => e.name === pregunta)?.acceptedAnswer.text ?? '';
    const tarjetaUso = n(
      await page.locator('div', { has: page.locator('strong', { hasText: 'El vendedor y la plusvalía municipal' }) }).last().textContent(),
    );
    const limitaciones = n(await page.locator('li', { hasText: 'No calcula la plusvalía municipal' }).textContent());
    const callan = Object.entries({ 'FAQ visible': visible, FAQPage: servida, tarjeta: tarjetaUso, Limitaciones: limitaciones })
      .filter(([, t]) => !t.includes(SALVEDAD_PLUSVALIA_NO_RESIDENTE))
      .map(([boca]) => boca);
    expect(callan).toEqual([]);
  });

  /**
   * [25/10-a] (contenido, bajo) — ABIERTO. La app habla del vendedor NO RESIDENTE en cinco bocas, pero solo
   * para la plusvalía (el comprador, sujeto pasivo sustituto, art. 106.2 TRLRHL), y calla la otra
   * obligación que ese mismo vendedor le echa encima al comprador: el TRLIRNR (RDLeg 5/2004,
   * BOE-A-2004-4527, art. 25.2, leído el 25/10/2026) obliga al adquirente de un inmueble a un no residente
   * sin establecimiento permanente «a retener e ingresar el 3 por ciento […] de la contraprestación
   * acordada», y si no lo ingresa «los bienes transmitidos quedarán afectos al pago». Para el solar de
   * 95.000 € del CASO 1 son 2850 € que el comprador no paga al vendedor sino a Hacienda. «Con una
   * excepción» deja leer que la plusvalía es lo único. Es el cabo de familia del IRNR, visto del lado del
   * comprador: ninguna hermana lo nombra.
   */
  test('[25/10-a] donde nombra al vendedor no residente, la página dice también la retención del 3 % que practica el comprador (art. 25.2 TRLIRNR)', async ({ page }) => {
    test.fail(!I25_VER_HUECOS, 'ABIERTO: hallazgo [25/10-a], la salvedad del no residente sin la retención del 3 %');
    await abrir(page, 'madrid', 'particular', '95000');
    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
    // El texto de la app, sin las tarjetas de otras apps ni el pie (una relacionada puede hablar de retenciones).
    const pagina = n(
      await page.evaluate(() => {
        const copia = document.body.cloneNode(true) as HTMLElement;
        copia.querySelectorAll('script, style, footer, section[aria-label="Aplicaciones relacionadas"]').forEach((e) => e.remove());
        return copia.textContent;
      }),
    );
    const ld = (await page.locator('script[type="application/ld+json"]').allTextContents()).join(' ');
    // Que la página hable de verdad del vendedor no residente (si no, el caso no tendría objeto).
    expect(pagina).toContain('no residente');
    expect(ld).toContain('no residente');
    const retencion = /reten(?:er|ción)[^.]{0,160}\b3\s?%|\b3\s?%[^.]{0,160}reten(?:er|ción)/i;
    const callan = Object.entries({ página: pagina, 'JSON-LD': ld })
      .filter(([, t]) => !retencion.test(t))
      .map(([boca]) => boca);
    expect(callan, 'ninguna boca nombra la retención del 3 % del comprador').toEqual([]);
  });

  /**
   * [25/10-b] (operativa, alto) — ABIERTO. Con la página traducida (cada nodo de texto a <font><font>),
   * salir de Ceuta o Melilla a CUALQUIER otra comunidad tumba la app en «Algo salió mal» (NotFoundError en
   * removeChild). page.tsx l. 539-555: `{ciudadBonificada ? (<p className={styles.infoCcaaNote}>…) : (<p
   * className={styles.infoCcaaNote}>…)}` son dos <p> del MISMO tipo en el mismo sitio, así que React no
   * cambia de elemento: reutiliza el <p> y concilia sus hijos, ocho (con texto suelto y
   * `{nombreEnFrase(ccaa)}`) en la rama de las ciudades y tres en la otra. Al pasar de ocho a tres retira
   * nodos de texto que el traductor ya cambió por <font>. Sin traducir no cae (control del caso).
   *   · Ceuta, particular, 200.000 € → Madrid: esperado «ITP (6,00 %)» de 12.000,00 €.
   *   · Melilla, promotor, 200.000 € → Cataluña: esperado «IVA (21,00 %)» de 42.000,00 €.
   * check:ternario-traducido no lo ve: las dos ramas son JSX, no texto suelto frente a JSX.
   */
  test('[25/10-b] con la página traducida, salir de Ceuta o Melilla a otra comunidad no tumba la app', async ({ page }) => {
    test.fail(!I25_VER_HUECOS, 'ABIERTO: hallazgo [25/10-b], la nota de las ciudades traducida tumba la app al salir de Ceuta o Melilla');
    // Control: sin traducir, el mismo paso cuadra (200.000 × 6 % = 12.000 €).
    await abrir(page, 'ceuta', 'particular', '200000');
    await page.selectOption('#select-ccaa', 'madrid');
    await expect.poll(async () => tarjeta(await leer(page), /^ITP \(/).valor).toBe('12.000,00 €');

    const caidas: string[] = [];
    const pasos: Array<{ desde: string; vende: 'particular' | 'promotor'; a: string; titulo: RegExp; valor: string }> = [
      { desde: 'ceuta', vende: 'particular', a: 'madrid', titulo: /^ITP \(6,00.%\)$/, valor: '12.000,00 €' },
      { desde: 'melilla', vende: 'promotor', a: 'cataluna', titulo: /^IVA \(21,00.%\)$/, valor: '42.000,00 €' },
    ];
    for (const p of pasos) {
      await abrir(page, p.desde, p.vende, '200000');
      await traducir(page);
      await page.selectOption('#select-ccaa', p.a);
      await expect(caida(page).or(page.locator('[class*="resultados"] h3', { hasText: p.titulo })).first()).toBeVisible();
      if ((await caida(page).count()) > 0) caidas.push(`${p.desde}/${p.vende} → ${p.a}: «Algo salió mal»`);
      else expect(tarjeta(await leer(page), p.titulo).valor).toBe(p.valor);
    }
    expect(caidas).toEqual([]);
  });

  /**
   * [25/10-c] (operativa, medio) — ABIERTO. Con la página traducida, el recuadro de la comunidad se queda
   * con la ANTERIOR (o con el tipo del precio anterior) mientras las tarjetas ya cobran lo nuevo: React
   * escribe en el nodo de texto que el traductor retiró cuando la variable va junto a otro texto.
   *   · Madrid → Andalucía (120.000 €): «ITP General 6 %» y «AJD 0,75 %» (l. 502 y 519,
   *     `{formatTipoNominal(…)}&nbsp;%`) y la ficha «Comunidad de Madrid: ITP general del 6 %…» (l. 565,
   *     `<strong>{nombre}:</strong> {notas}`) bajo «Andalucía», con «ITP (7,00 %)» de 8400,00 € al lado.
   *     Esperado: 7 %, 1,2 % y la ficha de Andalucía.
   *   · Baleares → Cataluña (200.000 €): «ITP General 8 %» y la nota de la escala de Baleares (l. 534,
   *     `… {subidaITP}.`), con «ITP (10,00 %)». Esperado: 10 % y «(10 % → 11 % → 12 % → 13 %)».
   *   · Valencia, 800.000 → 1.200.000 €: «ITP General 9 %» con «ITP (11,00 %)» de 132.000,00 €. Esperado 11 %.
   *   · Ceuta → Melilla (200.000 €): «pero en la Ciudad Autónoma de Ceuta se aplica además…» (l. 542,
   *     `{nombreEnFrase(ccaa)}`) y la ficha de Ceuta bajo «Ciudad Autónoma de Melilla».
   *   · Canarias → Ceuta (200.000 €): la nota de los honorarios dice «llevan además IGIC» (l. 775-776,
   *     `{' '}{territorioHonorarios.impuesto}, que…`) bajo «Gastos de notaría (sin IPSI)». Esperado IPSI.
   * Es la forma de las hermanas (3492, 3495, 3503, 3506) en el page.tsx de esta.
   */
  test('[25/10-c] con la página traducida, el recuadro y la nota de los honorarios dicen la comunidad y el precio elegidos', async ({ page }) => {
    test.fail(!I25_VER_HUECOS, 'ABIERTO: hallazgo [25/10-c], el recuadro traducido se queda con la comunidad anterior');
    expect(ITP_CCAA.cataluna.tramosProgresivos?.map((t) => t.tipo)).toEqual([10, 11, 12, 13]);
    expect(ITP_CCAA.valencia.umbralTipoUnico).toEqual({ superiorA: 1_000_000, tipo: 11 });
    const viejos: string[] = [];
    const exige = (donde: string, texto: string, esperado: string) => {
      if (!texto.includes(n(esperado))) viejos.push(`${donde}: falta «${n(esperado)}»`);
    };

    // 1 · Madrid → Andalucía (120.000 × 7 % = 8400 €).
    await abrir(page, 'madrid', 'particular', '120000');
    await traducir(page);
    await page.selectOption('#select-ccaa', 'andalucia');
    await expect.poll(async () => tarjeta(await leer(page), /^ITP \(/).valor).toBe('8400,00 €');
    exige('Andalucía', (await casillas(page)).join(' | '), 'ITP General 7 % | AJD 1,2 %');
    exige('Andalucía', await recuadro(page), `Andalucía: ${ITP_CCAA.andalucia.notas}`);

    // 2 · Baleares → Cataluña (200.000 × 10 % = 20.000 €).
    await abrir(page, 'baleares', 'particular', '200000');
    await traducir(page);
    await page.selectOption('#select-ccaa', 'cataluna');
    await expect.poll(async () => tarjeta(await leer(page), /^ITP \(/).valor).toBe('20.000,00 €');
    exige('Cataluña', (await casillas(page)).join(' | '), 'ITP General 10 %');
    exige('Cataluña', await recuadro(page), 'aplica escala progresiva (10 % → 11 % → 12 % → 13 %)');

    // 3 · Valencia, el precio cruza el millón (1.200.000 × 11 % = 132.000 €).
    await abrir(page, 'valencia', 'particular', '800000');
    await traducir(page);
    await sembrarValor(page, SEL_PRECIO, '1200000');
    await expect.poll(async () => tarjeta(await leer(page), /^ITP \(/).valor).toBe('132.000,00 €');
    exige('Valencia 1.200.000', (await casillas(page)).join(' | '), 'ITP General 11 %');

    // 4 · Ceuta → Melilla (200.000 × 6 % × 50 % = 6000 €; sin caída: las dos van por la misma rama).
    await abrir(page, 'ceuta', 'particular', '200000');
    await traducir(page);
    await page.selectOption('#select-ccaa', 'melilla');
    await expect(page.locator('[class*="infoCcaaNombre"]')).toHaveText('Ciudad Autónoma de Melilla');
    exige('Melilla', await recuadro(page), 'pero en la Ciudad Autónoma de Melilla se aplica además');
    exige('Melilla', await recuadro(page), `Ciudad Autónoma de Melilla: ${ITP_CCAA.melilla.notas}`);

    // 5 · Canarias → Ceuta: la nota de los honorarios.
    await abrir(page, 'canarias', 'particular', '200000');
    await traducir(page);
    await page.selectOption('#select-ccaa', 'ceuta');
    await expect.poll(async () => tarjeta(await leer(page), /^Gastos de notaría/).titulo).toBe('Gastos de notaría (sin IPSI)');
    exige('Ceuta, honorarios', n(await page.locator('[class*="avisoHonorarios"]').textContent()), 'llevan además IPSI');

    await expect(caida(page)).toHaveCount(0);
    expect(viejos).toEqual([]);
  });

  /**
   * Forma (c) de la familia, comprobada y SANA aquí, también con la página traducida: Madrid → Canarias →
   * Ceuta con promotor (sin salir de una ciudad, que es [25/10-b]). El botón, la casilla del recuadro y la
   * tarjeta nombran el impuesto del territorio, porque cada uno es el ÚNICO hijo de su elemento.
   *   · Canarias, 200.000 €: «Paga IGIC + AJD», «IGIC (empresario) No calculado», tarjeta «IGIC» «No
   *     calculado», AJD 200.000 × 0,75 % = 1500,00 «AJD (0,75 %)».
   *   · Ceuta: «Paga IPSI + AJD», «IPSI (empresario) No calculado», tarjeta «IPSI», AJD 200.000 × 0,5 % ×
   *     50 % = 500,00 «AJD (0,25 %)».
   */
  test('(c) con la página traducida, el botón, la casilla y la tarjeta del promotor dicen IGIC o IPSI, no IVA', async ({ page }) => {
    await abrir(page, 'madrid', 'promotor', '200000');
    const sub = page.getByRole('button', { name: /Promotor \/ Empresa/ }).locator('span').nth(2);
    expect(n(await sub.textContent())).toBe('Paga IVA 21 % + AJD');
    const pasos: Array<{ ccaa: string; imp: string; ajdTitulo: string; ajd: string }> = [
      { ccaa: 'canarias', imp: 'IGIC', ajdTitulo: 'AJD (0,75 %)', ajd: '1500,00 €' },
      { ccaa: 'ceuta', imp: 'IPSI', ajdTitulo: 'AJD (0,25 %)', ajd: '500,00 €' },
    ];
    for (const p of pasos) {
      await traducir(page);
      await page.selectOption('#select-ccaa', p.ccaa);
      await expect.poll(async () => tarjeta(await leer(page), /^AJD \(/).valor).toBe(p.ajd);
      await expect(caida(page)).toHaveCount(0);
      expect(n(await sub.textContent()), p.ccaa).toBe(`Paga ${p.imp} + AJD`);
      const cs = await casillas(page);
      expect(cs[cs.length - 1], p.ccaa).toBe(`${p.imp} (empresario) No calculado`);
      const ts = await leer(page);
      expect(tarjeta(ts, new RegExp(`^${p.imp}$`)).valor, p.ccaa).toBe('No calculado');
      expect(tarjeta(ts, /^AJD \(/).titulo, p.ccaa).toBe(p.ajdTitulo);
      expect(ts.some((c) => /^IVA/.test(c.titulo)), p.ccaa).toBe(false);
    }
  });

  /**
   * Hallazgo 3498 — REGISTRADO hoy en otra app de la familia (components/AvisoTerritorioSinIva.tsx l. 46,
   * `<span>({territorio.nombre})</span>`), y se reproduce aquí: con la página traducida, Canarias → Ceuta con
   * promotor deja «tributa por el IPSI (Impuesto General Indirecto Canario)». Esperado el nombre del IPSI
   * (TERRITORIOS_SIN_IVA.ceuta). ABIERTO; se repara en el componente, no en esta app.
   */
  test('3498 (registrado en otra app) — traducida, Canarias → Ceuta: el aviso del territorio da el nombre del IPSI', async ({ page }) => {
    test.fail(!I25_VER_HUECOS, 'ABIERTO: hallazgo 3498, registrado en otra app de la familia (AvisoTerritorioSinIva)');
    await abrir(page, 'canarias', 'promotor', '200000');
    await traducir(page);
    await page.selectOption('#select-ccaa', 'ceuta');
    const aviso = page.locator('p[role="note"]', { hasText: 'no se aplica el IVA' });
    await expect(aviso).toContainText('la Ciudad Autónoma de Ceuta');
    expect(n(await aviso.textContent())).toContain('IPSI (Impuesto sobre la Producción, los Servicios y la Importación)');
  });

  /**
   * Hallazgo 3493 — REGISTRADO hoy en otra app de la familia (components/ProrrateoIbiComunidad.tsx, que esta
   * app monta con conComunidad={false}), y se reproduce aquí. Escritura el 15/03/2026: el vendedor paga
   * del 01/01 al 14/03 (31 + 28 + 14 = 73 días) y el comprador 292. Con IBI 400: 400 × 73 / 365 = 80,00 y
   * 320,00. Traducida, IBI 650: esperado 650 × 73 / 365 = 130,00 € · 73 días y 520,00 € · 292 días; la tabla
   * sigue en 80,00 y 320,00. ABIERTO; se repara en el componente.
   */
  test('3493 (registrado en otra app) — traducida, la tabla del reparto del IBI dice los importes de lo escrito', async ({ page }) => {
    test.fail(!I25_VER_HUECOS, 'ABIERTO: hallazgo 3493, registrado en otra app de la familia (ProrrateoIbiComunidad)');
    await abrir(page, 'madrid', 'particular');
    const bloque = page.locator('section[aria-labelledby="titulo-prorrateo"]');
    const fecha = bloque.locator('input[type="date"]');
    await fecha.fill('2026-03-15');
    await esperarValorEnReact(page, fecha, '2026-03-15');
    await sembrarValor(page, SEL_IBI, '400');
    const fila = async () => (await bloque.locator('tbody tr').first().locator('td').allTextContents()).map(n).join(' | ');
    expect(await fila()).toBe('IBI del año | 01/01/2026 – 31/12/2026 | 80,00 € · 73 días | 320,00 € · 292 días');
    await traducir(page);
    await sembrarValor(page, SEL_IBI, '650');
    await expect(bloque).toContainText('520,00');
    expect(await fila()).toBe('IBI del año | 01/01/2026 – 31/12/2026 | 130,00 € · 73 días | 520,00 € · 292 días');
  });
});
