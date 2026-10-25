/**
 * ⚠️ Cifras revisadas el 20/08/2026, cuando calcularNotario dejó de devolver el arancel puro
 * para devolver la FACTURA notarial estimada (arancel × 1,75, punto medio de la horquilla
 * 1,5-2 de FACTURA_NOTARIAL) y calcularRegistro empezó a sumar el asiento de presentación y
 * la nota simple del RD 1427/1989. Los comentarios que desglosan tramos de arancel siguen
 * siendo correctos como CÁLCULO DEL COMPONENTE: lo que ya no describen es la cifra final de
 * la tarjeta, que lleva encima el factor.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test, expect, Page } from '@playwright/test';
import {
  ITP_CCAA,
  BANDA_PRECIO_VIVIENDA,
  horquillaEdadJoven,
  estimarFacturaNotarial,
  calcularRegistro,
  sumarLineasVisibles,
} from '../../data/itp-ccaa';
import {
  PLUSVALIA_MUNICIPAL_META,
  IVA_INMUEBLES_2025,
  COEFICIENTES_IIVTNU_2025,
} from '../../data/fiscal/inmuebles';
// ── Añadidos por la re-inspección del 12/09/2026 (describe del final del fichero) ──
import { PLAZO_ITP } from '../../data/fiscal/inmuebles';
import { PORCENTAJES_IVA } from '../../data/fiscal/iva';
// ── Añadido por la re-inspección del 22/09/2026 (describe del final del fichero) ──
import { TRAMOS_GANANCIAS_PATRIMONIALES_2025 } from '../../data/fiscal/inmuebles';
// ── Añadido por la re-inspección del 26/09/2026 (describe del final del fichero) ──
import { GANANCIAS_PATRIMONIALES_META, FISCAL_INMUEBLES_META } from '../../data/fiscal/inmuebles';
// ── Añadido por la reparación del 26/09/2026 (hallazgos 2182-2186 y receta 1 de la familia) ──
import { FACTURA_NOTARIAL, REGISTRO_CONCEPTOS } from '../../data/itp-ccaa';
import { esperarHidratacion, esperarValorEnReact, sembrarValor } from './_hidratacion';
// ── Añadido por la re-inspección del 06/10/2026 (describe del final del fichero) ──
import { parseSpanishNumber } from '../../lib/formatters';
// ── Añadidos por la re-inspección del 12/10/2026 (describe del final del fichero) ──
import {
  BONIFICACION_IIVTNU_CEUTA_MELILLA,
  DEDUCCION_IRPF_RENTAS_CEUTA_MELILLA,
} from '../../data/fiscal/inmuebles';
import { REBAJA_ARANCEL_CUANTIA, TERRITORIOS_IIVTNU_FORAL } from '../../data/itp-ccaa';
// ── Añadido por la re-inspección del 25/10/2026 (describe del final del fichero) ──
import { TERRITORIOS_SIN_IVA } from '../../data/itp-ccaa';

/**
 * Inspector — estimador-compraventa-inmueble (segmento fiscal, riesgo 1 CRÍTICO)
 *
 * De dónde sale cada cifra esperada:
 *  - Tipos de ITP y AJD por CCAA, escalas progresivas y aranceles de notaría y registro:
 *    `data/itp-ccaa.ts` (ITP_CCAA, ARANCELES_NOTARIO y ARANCELES_REGISTRO, que citan los
 *    RD 1426/1989 y RD 1427/1989). Los tipos generales coinciden con TIPOS_ITP_CCAA_2025
 *    de `data/fiscal/inmuebles.ts`.
 *  - Plusvalía municipal: COEFICIENTES_IIVTNU_2025 y PLUSVALIA_MUNICIPAL_META.tipoOrientativo
 *    (`data/fiscal/inmuebles.ts`, RDL 26/2021), aplicados por calcularPlusvaliaMunicipal.
 *  - Ganancia patrimonial e IRPF: calcularGananciaInmueble (`data/fiscal/ganancia-inmueble.ts`,
 *    arts. 34-36 LIRPF) sobre TRAMOS_GANANCIAS_PATRIMONIALES_2025 (`data/fiscal/inmuebles.ts`:
 *    19 % hasta 6.000 · 21 % hasta 50.000 · 23 % hasta 200.000 · 27 % hasta 300.000 · 30 % resto).
 *
 * Todos los importes están resueltos a mano ANTES de ejecutar la app; el detalle del
 * cálculo va comentado junto a cada aserción.
 *
 * Nota de formato: `formatCurrency` usa es-ES, que NO agrupa los millares de un número
 * de cuatro cifras (4.500 → «4500,00 €») y sí los de cinco o más (12.000 → «12.000,00 €»).
 *
 * ── Segunda vuelta del Inspector (16/08/2026) ─────────────────────────────────
 * La app volvió a la cola porque `data/fiscal` cambió: el commit 2067ddbe llevó las 7 apps
 * del clúster de `calcularITP(precio, ccaa, tipoAplicable)` a `importeITP(precio, ccaa,
 * elegido)` y cambió los campos opcionales del vendedor a `parseSpanishNumberOr`. Los CASOS
 * 8 a 13 son de esta segunda vuelta: 8 a 10 verifican de nuevo el cálculo por caminos que la
 * primera no pisó (obra nueva con IVA + AJD, escala progresiva de cinco tramos y rechazo de
 * un precio negativo), y 11 a 13 son hallazgos NUEVOS, dos de ellos rincones donde aquel
 * arreglo no llegó.
 */

const RUTA = '/estimador-compraventa-inmueble/';

/** El formato de moneda es-ES separa la cifra del € con un espacio duro (U+00A0). */
const ESPACIO_DURO = new RegExp(String.fromCharCode(160), 'g');

/** Valor de una ResultCard, con el espacio duro del formato español normalizado. */
async function valorTarjeta(page: Page, titulo: string | RegExp): Promise<string> {
  const valor = page
    .locator('h3', { hasText: titulo })
    .first()
    .locator('xpath=../following-sibling::div[1]/p');
  return (await valor.innerText()).replace(ESPACIO_DURO, ' ').trim();
}

/**
 * La salvedad del art. 30.1 TRLITPAJD (hallazgo 2209 de la hermana solar, llevado aquí el
 * 26/09/2026): la app la añade a la tarjeta del AJD y al total cuando hay AJD. Los casos
 * anteriores miden otra cosa en esas descripciones (la bonificación, el tipo de la renuncia, la
 * dirección del aviso), así que el lector de descripciones la aparta; su presencia —y su
 * ausencia sin AJD— la mide el caso «Hallazgo 2209» del final de este fichero, en crudo.
 */
const AVISO_BASE_AJD =
  'El AJD va calculado sobre el precio escrito, pero su base no puede ser inferior al valor de referencia catastral (art. 30.1 TRLITPAJD): si ese valor es mayor, el AJD se liquida sobre él';
/**
 * La app une la salvedad con «. » si el texto no acababa en punto, y con un espacio si ya
 * acababa (las frases completas de esta familia: la nota de los honorarios, «…se muestra.», y la
 * rebaja del AJD de la vivienda habitual, «…lo preguntamos.»). Aquí se deshace igual.
 */
const sinAvisoBaseAjd = (s: string): string => {
  if (!s.endsWith(AVISO_BASE_AJD)) return s;
  const resto = s.slice(0, -AVISO_BASE_AJD.length).trimEnd();
  return /(?:se muestra|lo preguntamos)\.$/.test(resto) ? resto : resto.replace(/\.$/, '');
};

/** Texto descriptivo bajo el valor de una ResultCard. */
async function descripcionTarjeta(page: Page, titulo: string | RegExp): Promise<string> {
  const desc = page
    .locator('h3', { hasText: titulo })
    .first()
    .locator('xpath=../following-sibling::p[1]');
  return sinAvisoBaseAjd((await desc.innerText()).replace(ESPACIO_DURO, ' ').trim());
}

async function rellenar(page: Page, etiqueta: string, valor: string): Promise<void> {
  const campo = page.locator(`input[aria-label="${etiqueta}"]`);
  await campo.fill(valor);
  await campo.blur();
}

/**
 * Desde el 16/08/2026 los dos <select> SÍ tienen id (#ccaa-inmueble y #perfil-comprador) y su
 * <label> lleva htmlFor: era el hallazgo 42. Estos dos helpers se conservan porque los usan los
 * casos escritos antes; los nuevos van directos al id.
 */
const selectCcaa = (page: Page) =>
  page.locator('select').filter({ has: page.locator('option[value="madrid"]') });
const selectPerfil = (page: Page) =>
  page.locator('select').filter({ has: page.locator('option[value="familia-numerosa"]') });

test.describe('Estimador de gastos de compraventa de vivienda', () => {
  test('CASO 1 (normal) — Madrid, segunda mano, vivienda de 200.000 €, comprador general', async ({ page }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Segunda mano/ }).click();
    await selectCcaa(page).selectOption('madrid');
    await rellenar(page, 'Precio de la vivienda', '200000');
    await rellenar(page, 'Gastos de gestoría del comprador (€)', '300');

    // ITP = 200.000 × 6 % — ITP_CCAA.madrid.tipoGeneral = 6
    // (coincide con TIPOS_ITP_CCAA_2025 'Madrid' de data/fiscal/inmuebles.ts)
    expect(await valorTarjeta(page, /^ITP/)).toBe('12.000,00 €');
    await expect(page.locator('h3', { hasText: /^ITP/ }).first()).toHaveText('ITP (6,00 %)');

    // Nota del 20/08/2026: estas tarjetas ya no muestran el arancel puro sino la FACTURA
    // notarial estimada (el arancel × 1,75, punto medio de la horquilla 1,5-2 documentada en
    // FACTURA_NOTARIAL). El arancel del RD 1426/1989 cubre la matriz y una copia; copias
    // adicionales, folios y suplidos van aparte. El registro suma además el asiento de
    // presentación (6,010121 €) y la nota simple (3,005061 €) del RD 1427/1989.
    // Notaría (ARANCELES_NOTARIO, RD 1426/1989), acumulando tramos hasta 200.000 € con los
    // decimales del BOE:
    //   90,151816 + 24.040,49×0,45 % + 30.050,60×0,15 % + 90.151,82×0,10 % + 49.746,97×0,05 %
    //   = 358,435226 ; × 0,95 (rebaja del 5 % del nº 2.1, DA 8.ª RDL 8/2010, hallazgo 2901)
    //   = 340,513465 ; con el 21 % de IVA → 412,021292 de arancel ; × 1,75 → 721,037261 de factura
    //   (hasta el 11/10/2026, sin la rebaja: 758,98 €)
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('721,04 €');

    // Registro (ARANCELES_REGISTRO, RD 1427/1989):
    //   24,040484 + 24.040,49×0,175 % + 30.050,60×0,125 % + 90.151,82×0,075 % + 49.746,97×0,030 %
    //   = 186,212547 ; × 0,95 (rebaja del nº 2.1, hallazgo 2902) = 176,901920 ;
    //   + 6,010121 (presentación) + 3,005061 (nota simple) = 185,917102 ; × 1,21 → 224,959694
    //   (hasta el 11/10/2026: 236,22 €)
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('224,96 €');

    expect(await valorTarjeta(page, 'Gastos de gestoría')).toBe('300,00 €');

    // Total gastos = 12.000 + 721,04 + 224,96 + 300 = 13.246,00 → 6,62 % del precio (6,623)
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('13.246,00 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toContain('6,62 %');

    // Coste total = 200.000 + 13.246,00. En segunda mano NO hay AJD (TPO y AJD son incompatibles)
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('213.246,00 €');
    await expect(page.locator('h3', { hasText: /^AJD/ })).toHaveCount(0);
  });

  // ⚠️ CORREGIDO el 14/08/2026 - la app SIEMPRE pasaba `tipoAplicable` a
  // `calcularITP`, así que la rama de `tramosProgresivos` de data/itp-ccaa.ts nunca se
  // ejecuta y toda la operación tributa al tipo del primer tramo. La propia interfaz
  // imprime justo encima «⚠️ Esta comunidad aplica escala progresiva (10% → 11% → 12% → 13%)»,
  // de modo que anuncia una escala que después no aplica. Afecta a las 7 CCAA con tramos
  // declarados (Aragón, Asturias, Baleares, Castilla y León, Cataluña, Extremadura y
  // Valencia) y a las hermanas -garaje y -trastero, que hacen la misma llamada.
  // REPARADO: se escribió con `test.fail` y pasó a verde al aplicar la escala; queda como
  // regresión (las cifras de notaría y registro de los comentarios son las de antes del
  // 20/08/2026: las aserciones llevan las de la factura × 1,75 y el registro con sus dos fijos).
  test('CASO 2 (límite: tramo más alto) — Cataluña, segunda mano, 1.000.000 €: escala progresiva de ITP', async ({ page }) => {
        await page.goto(RUTA);
    await page.getByRole('button', { name: /Segunda mano/ }).click();
    await selectCcaa(page).selectOption('cataluna');
    await rellenar(page, 'Precio de la vivienda', '1000000');
    await rellenar(page, 'Gastos de gestoría del comprador (€)', '300');

    await expect(page.getByText('Esta comunidad aplica escala progresiva')).toBeVisible();

    // ITP_CCAA.cataluna.tramosProgresivos = 10 % hasta 600.000 · 11 % hasta 900.000 ·
    // 12 % hasta 1.500.000 · 13 % el resto →
    //   600.000×10 % + 300.000×11 % + 100.000×12 % = 60.000 + 33.000 + 12.000 = 105.000
    // Obtenido hoy: «ITP (10,00%)» → 100.000,00 € (5.000 € menos de impuesto)
    expect(await valorTarjeta(page, /^ITP/)).toBe('105.000,00 €');

    // Recalculado a mano el 12/10/2026 con la rebaja del 5 % del nº 2.1 (hallazgos 2901 y 2902):
    // Notaría: escala hasta 601.012,10 (558,941276) + 398.987,90×0,03 % = 678,637646 ; × 0,95 =
    //   644,705764 ; × 1,21 = 780,093974 ; × 1,75 → 1.365,164455 (antes 1437,01)
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('1365,16 €');
    // Registro: 306,516178 + 398.987,90×0,020 % = 386,313757 (< tope 2.181,673939) ; × 0,95 =
    //   366,998070 ; + 9,015182 = 376,013252 ; × 1,21 → 454,976034 (antes 478,35)
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('454,98 €');

    // Total gastos = 105.000 + 1.365,16 + 454,98 + 300 = 107.120,14
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('107.120,14 €');
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('1.107.120,14 €');
  });

  test('CASO 3 (debe avisar) — vendedor con pérdida: plusvalía no sujeta y sin IRPF', async ({ page }) => {
    await page.goto(RUTA);
    await rellenar(page, 'Precio de la vivienda', '150000');
    await page.getByRole('button', { name: 'Vendedor' }).click();
    await rellenar(page, 'Precio de compra original', '200000');
    await rellenar(page, 'Años de propiedad', '10');
    await rellenar(page, 'Valor catastral del suelo', '50000');
    await rellenar(page, 'Valor catastral total (suelo + construcción)', '120000');
    await rellenar(page, 'Comisión inmobiliaria (%)', '3');
    await rellenar(page, 'Gastos de gestoría del comprador (€)', '300');
    // Los tres opcionales se ponían a 0 a mano por el NaN del CASO 6 (REPARADO el 16/08/2026);
    // se conservan a 0 para no cambiar el caso
    await rellenar(page, 'Impuestos y gastos que pagaste al comprar', '0');
    await rellenar(page, 'Inversiones y mejoras (opcional)', '0');
    await rellenar(page, 'Otros gastos de la venta (opcional)', '0');

    // Se vende por 150.000 lo que se compró por 200.000: no hay incremento de valor del
    // terreno, así que la transmisión NO está sujeta al IIVTNU (art. 104.5 TRLHL, tras la
    // STC 182/2021). El método objetivo habría dado 50.000 × 0,08 (COEFICIENTES_IIVTNU_2025,
    // 10 años) × 25 % (PLUSVALIA_MUNICIPAL_META.tipoOrientativo) = 1.000 €, y la app debe
    // avisar de la no sujeción en vez de cobrarlos.
    // «NO SUJETA» desde el 18/09/2026 (hallazgo 901): el art. 104.5 TRLRHL articula un
    // supuesto de NO SUJECIÓN, no una exención, y la propia tarjeta ya lo decía así en su
    // descripción mientras el valor decía «EXENTO».
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('NO SUJETA');
    expect(await descripcionTarjeta(page, 'Plusvalía municipal')).toBe('No sujeta (sin incremento de valor)');

    // Art. 35 LIRPF (calcularGananciaInmueble, data/fiscal/ganancia-inmueble.ts):
    //   valor de adquisición = 200.000 + 0 gastos + 0 mejoras = 200.000
    //   valor de transmisión = 150.000 − (4.500 comisión + 0 otros) − 0 plusvalía = 145.500
    //   (la gestoría de 300 € la paga el COMPRADOR: art. 35.1 LIRPF solo descuenta los
    //    gastos satisfechos por el transmitente — reparado el 21/08/2026)
    //   ganancia = 145.500 − 200.000 = −54.500 → pérdida patrimonial, cuota 0
    expect(await valorTarjeta(page, 'Valor de adquisición')).toBe('200.000,00 €');
    expect(await valorTarjeta(page, 'Valor de transmisión')).toBe('145.500,00 €');
    expect(await valorTarjeta(page, 'Pérdida patrimonial')).toBe('54.500,00 €');
    await expect(page.locator('h3', { hasText: 'Ganancia patrimonial' })).toHaveCount(0);
    // ⚠️ 24/09/2026 (hallazgo 1554): aquí se exigía «EXENTO», que consagraba el defecto: con
    // pérdida no hay nada exento, hay ausencia de ganancia (la mitad del 724 que no se reparó).
    expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('SIN CUOTA');

    // Total gastos vendedor = 0 plusvalía + 4.500 comisión + 0 otros + 0 IRPF
    expect(await valorTarjeta(page, 'Comisión inmobiliaria')).toBe('4500,00 €');
    expect(await valorTarjeta(page, 'Total gastos vendedor')).toBe('4500,00 €');
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('145.500,00 €');
  });

  // ✅ CORREGIDO el 14/08/2026 — era el hallazgo más grave de la primera tanda del Inspector.
  // El botón «Estimar por mí» calcula bien (ITP 6 % + notaría + registro sobre el precio de
  // compra = 11.439,66 €) pero escribía el resultado con `formatNumber(estimado, 0)`, es decir
  // «11.440», con el punto de los millares español. Ese mismo campo se lee luego con
  // `parseSpanishNumber`, que ante un único punto hacía `parseFloat('11.440')` = 11,44, así que
  // el botón pensado para REBAJAR la ganancia sumaba 11,44 € en vez de 11.440 € y el vendedor
  // leía 2.618,77 € de IRPF de más.
  //
  // La causa raíz NO estaba en esta app sino en `lib/formatters.ts`, que usan 89 apps: la rama
  // de "punto sin coma" hacía un parseFloat directo. Corregida allí, este test dejó de necesitar
  // `test.fail()` y se queda como REGRESIÓN: si alguien vuelve a romper el parser, salta aquí.
  test('CASO 4 (regresión) — «Estimar por mí» conserva los millares', async ({ page }) => {
    await page.goto(RUTA);
    await selectCcaa(page).selectOption('madrid');
    await rellenar(page, 'Precio de la vivienda', '250000');
    await page.getByRole('button', { name: 'Vendedor' }).click();
    await rellenar(page, 'Precio de compra original', '180000');
    await rellenar(page, 'Años de propiedad', '8');
    await rellenar(page, 'Valor catastral del suelo', '50000');
    await rellenar(page, 'Valor catastral total (suelo + construcción)', '120000');
    await rellenar(page, 'Inversiones y mejoras (opcional)', '0');
    await rellenar(page, 'Otros gastos de la venta (opcional)', '0');
    await page.getByRole('button', { name: /Estimar por mí/ }).click();

    // Estimación = 180.000×6 % (ITP_CCAA.madrid.tipoGeneral) + notaría 737,81 + registro 228,96
    //            = 11.766,77 → redondeado a 11.767 (el campo muestra «11.767»)
    //   Cifras revisadas el 27/08/2026: desde el 20/08 calcularNotario devuelve la FACTURA
    //   (arancel 421,6044 × 1,75) y calcularRegistro suma presentación y nota simple.
    //   Desde el 10/09/2026 (hallazgo 673) el botón suma también la GESTORÍA de aquella
    //   compra, que es la cuarta partida que enumera el rótulo del campo que rellena y que la
    //   pestaña Comprador ya sumaba para el mismo precio (GESTORIA_TIPICA = 300). Faltaba, y
    //   quedarse corto en el valor de ADQUISICIÓN infla la ganancia y el IRPF.
    //   estimación = 11.766,77 + 300 = 12.066,77 → el campo mostraba «12.067»
    //   Recalculado a mano el 12/10/2026 con la rebaja del 5 % del nº 2.1 de los dos aranceles
    //   (hallazgos 2901 y 2902): notaría 180.000 → 348,435226 × 0,95 × 1,21 × 1,75 = 700,921 ;
    //   registro (180,212547 × 0,95 + 9,015182) × 1,21 = 218,062694 ;
    //   estimación = 10.800 + 700,921 + 218,062694 + 300 = 12.018,98 → el campo muestra «12.019»
    //   valor de adquisición = 180.000 + 12.019 = 192.019
    //   plusvalía (24/09/2026, hallazgo 1559: coeficientes del RDL 8/2023, 8 años = 0,19;
    //   antes 0,10) = 50.000 × 0,19 × 25 % = 2.375 (el real daría 7.291,67: gana el objetivo)
    //   valor de transmisión = 250.000 − 7.500 de comisión − 2.375 de plusvalía = 240.125
    //   (la gestoría de la VENTA la paga el comprador y no resta aquí: art. 35.1 LIRPF,
    //    reparado el 21/08/2026 — es otra partida distinta de la de la compra de entonces)
    //   ganancia = 240.125 − 192.019 = 48.106
    //   IRPF = 6.000×19 % + 42.106×21 % = 1.140 + 8.842,26 = 9.982,26
    // Antes de la corrección daba: adquisición 180.011,44 € · ganancia 60.938,56 € · IRPF 12.895,87 €
    expect(await valorTarjeta(page, 'Valor de adquisición')).toBe('192.019,00 €');
    expect(await valorTarjeta(page, 'Ganancia patrimonial')).toBe('48.106,00 €');
    expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('9982,26 €');
  });

  // ✅ CORREGIDO el 14/08/2026 — con el perfil «Joven (< 35 años)» la app
  // busca el primer tipo reducido cuyo nombre contenga «joven» y lo aplica comprobando solo
  // su `valorMaximo`, nunca sus `condiciones`. En Madrid —la CCAA que viene por defecto— ese
  // tipo es «Jóvenes < 35 años (municipios pequeños)», del 0 %, reservado a municipios de
  // menos de 2.500 habitantes que la app jamás pregunta: quien compre en la capital lee
  // «ITP (0,00%) — 0,00 €». Mismo patrón en Baleares («joven» y «discapacidad», tipo 0 %).
  test('CASO 5 (regresión) — joven en Madrid: no puede salir 0 € de ITP sin preguntar el municipio', async ({ page }) => {
        await page.goto(RUTA);
    await page.getByRole('button', { name: /Segunda mano/ }).click();
    await selectCcaa(page).selectOption('madrid');
    await rellenar(page, 'Precio de la vivienda', '200000');
    await selectPerfil(page).selectOption('joven');

    // Lo anclado para él es el tipo general: ITP_CCAA.madrid.tipoGeneral = 6 → 12.000,00 €
    // Obtenido hoy: «ITP (0,00%)» → 0,00 €
    expect(await valorTarjeta(page, /^ITP/)).toBe('12.000,00 €');
  });

  // ✅ CORREGIDO el 14/08/2026 (verificado el 16/08/2026): `parseSpanishNumber('')` devuelve NaN y
  // `Math.max(0, NaN)` sigue siendo NaN, así que bastaba con dejar vacío UNO de los tres campos
  // opcionales del vendedor —«Impuestos y gastos que pagaste al comprar», «Inversiones y
  // mejoras (opcional)» y «Otros gastos de la venta (opcional)»— para que todo el bloque salga
  // «No definido» y desaparecieran las tarjetas de adquisición, transmisión y ganancia. Era la
  // ruta por defecto de la pestaña Vendedor: dos de los tres campos se anuncian como opcionales.
  // Se corrigió con `parseSpanishNumberOr` y queda como REGRESIÓN. Ojo: el mismo NaN sigue vivo
  // en el bloque de reinversión, que no se migró — ver CASO 11.
  test('CASO 6 (regresión) — la pestaña Vendedor calcula sin rellenar los campos opcionales', async ({ page }) => {
        await page.goto(RUTA);
    await rellenar(page, 'Precio de la vivienda', '250000');
    await page.getByRole('button', { name: 'Vendedor' }).click();
    await rellenar(page, 'Precio de compra original', '180000');
    await rellenar(page, 'Años de propiedad', '8');
    await rellenar(page, 'Valor catastral del suelo', '50000');
    await rellenar(page, 'Valor catastral total (suelo + construcción)', '120000');

    // Con los opcionales a 0 la app da estas cifras exactas (comprobado):
    //   plusvalía objetivo = 50.000 × 0,19 (art. 107.4 TRLRHL, RDL 8/2023, 8 años; era 0,10
    //   con la tabla caducada, hallazgo 1559) × 25 % = 2.375
    //   (el método real daría 70.000 × 50.000/120.000 × 25 % = 7.291,67 → gana el objetivo)
    //   valor de transmisión = 250.000 − 7.500 − 2.375 = 240.125 ; ganancia = 60.125
    //   (sin la gestoría del comprador: art. 35.1 LIRPF, reparado el 21/08/2026)
    //   IRPF = 6.000×19 % + 44.000×21 % + 10.125×23 % = 1.140 + 9.240 + 2.328,75 = 12.708,75
    //   neto = 250.000 − (2.375 plusvalía + 7.500 comisión + 12.708,75 IRPF) = 227.416,25
    // Obtenido hoy sin tocar los opcionales: «No definido» en IRPF, total y neto, y la
    // tarjeta de ganancia ni se pinta (la condición para mostrarla es `ganancia > 0`, y
    // NaN > 0 es false), de ahí que se compruebe primero que existe.
    await expect(page.locator('h3', { hasText: 'Ganancia patrimonial' })).toHaveCount(1);
    expect(await valorTarjeta(page, 'Ganancia patrimonial')).toBe('60.125,00 €');
    expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('12.708,75 €');
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('227.416,25 €');
  });

  // ✅ CORREGIDO el 14/08/2026 - mismo NaN en la pestaña Comprador. La guarda
  // `if (precio <= 0) return null` no atrapa el NaN de un campo vacío (NaN <= 0 es false), así
  // que el placeholder no llegaba a mostrarse nunca y la app ABRÍA con siete «No definido»,
  // incluido «COSTE TOTAL DE ADQUISICIÓN», y un «No definido% sobre el precio».
  test('CASO 7 (regresión) — sin precio, la app pide el dato en vez de calcular', async ({ page }) => {
        await page.goto(RUTA);

    await expect(
      page.getByText('Introduce el precio del inmueble para ver el desglose de gastos del comprador'),
    ).toBeVisible();
    await expect(page.getByText('No definido')).toHaveCount(0);
  });

  // ══════════════════════════════════════════════════════════════════════════════
  // Segunda vuelta del Inspector — 16/08/2026
  // ══════════════════════════════════════════════════════════════════════════════

  test('CASO 8 (normal) — Valencia, obra nueva de 180.000 €: IVA al 10 % + AJD', async ({ page }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Primera mano/ }).click();
    await selectCcaa(page).selectOption('valencia');
    await rellenar(page, 'Precio de la vivienda', '180000');
    await rellenar(page, 'Gastos de gestoría del comprador (€)', '300');

    // La primera entrega del promotor tributa por IVA, no por ITP (art. 20.Uno.22º LIVA).
    // IVA_INMUEBLES_2025.obraNueva = 10 (`data/fiscal/inmuebles.ts`, Ley 37/1992):
    //   180.000 × 10 % = 18.000
    await expect(page.locator('h3', { hasText: /^IVA/ }).first()).toHaveText('IVA (10,00 %)');
    expect(await valorTarjeta(page, /^IVA/)).toBe('18.000,00 €');
    await expect(page.locator('h3', { hasText: /^ITP/ })).toHaveCount(0);

    // AJD sobre la escritura de compraventa: ITP_CCAA.valencia.ajd = 1,4 desde el 01/06/2026
    // (Ley 13/1997, art. 14.Cuatro, verificado en el BOE el 24/09/2026, hallazgo 1603; hasta
    // ese día la tabla decía 1,5) → 180.000 × 1,4 % = 2.520. La app no pregunta si será la
    // vivienda habitual (0,1 %): cobra el general y lo enseña en la descripción.
    await expect(page.locator('h3', { hasText: /^AJD/ }).first()).toHaveText('AJD (1,40 %)');
    expect(await valorTarjeta(page, /^AJD/)).toBe('2520,00 €');
    expect(await descripcionTarjeta(page, /^AJD/)).toContain('el AJD baja al 0,1 %: serían 180,00 €');

    // Recalculado a mano el 12/10/2026 con la rebaja del 5 % del nº 2.1 (hallazgos 2901 y 2902).
    // Notaría (ARANCELES_NOTARIO, RD 1426/1989) sobre 180.000 €:
    //   90,151816 + 24.040,49×0,45 % + 30.050,60×0,15 % + 90.151,82×0,10 % + 29.746,97×0,05 %
    //   = 348,435226 ; × 0,95 = 331,013465 ; × 1,21 = 400,526292 ; × 1,75 → 700,921 (antes 737,81)
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('700,92 €');
    // Registro (ARANCELES_REGISTRO, RD 1427/1989):
    //   24,040484 + 24.040,49×0,175 % + 30.050,60×0,125 % + 90.151,82×0,075 % + 29.746,97×0,030 %
    //   = 180,212547 ; × 0,95 = 171,201920 ; + 9,015182 ; × 1,21 → 218,062694 (antes 228,96)
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('218,06 €');

    // Total = 18.000 + 2.520 + 700,92 + 218,06 + 300 = 21.738,98 → 12,08 % del precio (12,077)
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('21.738,98 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toContain('12,08 %');
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('201.738,98 €');
  });

  test('CASO 9 (límite: tramo más alto) — Baleares, 2.500.000 €: los cinco tramos de la escala', async ({ page }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Segunda mano/ }).click();
    await selectCcaa(page).selectOption('baleares');
    await rellenar(page, 'Precio de la vivienda', '2500000');
    await rellenar(page, 'Gastos de gestoría del comprador (€)', '300');

    // La escala de Baleares es la única del catálogo con cinco tramos, así que este caso
    // recorre el último de todos. ITP_CCAA.baleares.tramosProgresivos = 8 % hasta 400.000 ·
    // 9 % hasta 600.000 · 10 % hasta 1.000.000 · 12 % hasta 2.000.000 · 13 % el resto:
    //   400.000×8 % + 200.000×9 % + 400.000×10 % + 1.000.000×12 % + 500.000×13 %
    //   = 32.000 + 18.000 + 40.000 + 120.000 + 65.000 = 275.000
    // Tipo efectivo mostrado = 275.000 / 2.500.000 = 11,0 %
    await expect(page.getByText('Esta comunidad aplica escala progresiva')).toBeVisible();
    expect(await valorTarjeta(page, /^ITP/)).toBe('275.000,00 €');
    await expect(page.locator('h3', { hasText: /^ITP/ }).first()).toHaveText('ITP (11,00 %)');

    // Recalculado a mano el 12/10/2026 con la rebaja del 5 % del nº 2.1 (hallazgos 2901 y 2902):
    // Notaría: 558,941276 + (2.500.000 − 601.012,10)×0,03 % = 1.128,637646 ; × 0,95 =
    //   1.072,205764 ; × 1,21 = 1.297,368974 ; × 1,75 → 2.270,395704 (antes 2389,89)
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('2270,40 €');
    // Registro: 306,516178 + (2.500.000 − 601.012,10)×0,020 % = 686,313757 (< tope
    // REGISTRO_MAXIMO 2.181,673939) ; × 0,95 = 651,998070 ; + 9,015182 ; × 1,21 → 799,826034
    // (antes 841,35)
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('799,83 €');

    // Total = 275.000 + 2.270,40 + 799,83 + 300 = 278.370,23 → 11,13 % del precio (11,1348)
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('278.370,23 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toContain('11,13 %');
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('2.778.370,23 €');
    // En segunda mano no hay AJD: TPO y AJD son incompatibles (art. 31.2 TRLITPAJD)
    await expect(page.locator('h3', { hasText: /^AJD/ })).toHaveCount(0);
  });

  test('CASO 10 (debe rechazarse) — un precio negativo no puede producir un impuesto', async ({ page }) => {
    await page.goto(RUTA);
    await rellenar(page, 'Precio de la vivienda', '-50000');

    // NumberInput lleva min={0}: al perder el foco normaliza el valor negativo a «0», y la
    // guarda `precio <= 0` del useMemo devuelve null. La app debe pedir el dato, nunca
    // pintar un ITP negativo ni un «No definido».
    await expect(page.locator('input[aria-label="Precio de la vivienda"]')).toHaveValue('0');
    await expect(
      page.getByText('El precio escrito («0») tiene que ser mayor que 0: corrígelo para ver el desglose de gastos del comprador.'),
    ).toBeVisible();
    await expect(page.getByText('No definido')).toHaveCount(0);
    await expect(page.locator('h3', { hasText: /^ITP/ })).toHaveCount(0);
  });

  // ✅ HALLAZGO REPARADO (Inspector, 16/08/2026) — el NaN que el commit 2067ddbe no barrió.
  // Los campos del bloque de reinversión eran los dos únicos del vendedor que se leían
  // con `parseSpanishNumber` en vez de `parseSpanishNumberOr` (page.tsx:309-310). Quien vende
  // su vivienda habitual SIN hipoteca pendiente deja ese campo vacío —lo natural, y su
  // placeholder es «0»— y entonces `principalPendiente` vale NaN, `importeTotalObtenido` vale
  // NaN, la guarda `importeTotalObtenido > 0` es false y la exención del art. 38 LIRPF NO se
  // aplica: la app cobra el IRPF entero de una ganancia que está exenta al 100 %.
  // Arreglados el 16/08/2026: estos tres pasaron de test.fail a verde y se quedan como
  // REGRESIÓN, que es de lo que se trataba.
  test('CASO 11 (hallazgo) — reinversión total: la exención no puede depender de teclear «0» en la hipoteca', async ({ page }) => {
    await page.goto(RUTA);
    await rellenar(page, 'Precio de la vivienda', '300000');
    await page.getByRole('button', { name: 'Vendedor' }).click();
    await rellenar(page, 'Precio de compra original', '200000');
    await rellenar(page, 'Años de propiedad', '10');
    await rellenar(page, 'Valor catastral del suelo', '60000');
    await rellenar(page, 'Valor catastral total (suelo + construcción)', '150000');
    await rellenar(page, 'Comisión inmobiliaria (%)', '3');
    await page.getByText('Voy a reinvertir en otra vivienda habitual').click();
    await rellenar(page, 'Importe que reinviertes en la nueva vivienda', '300000');
    // «Hipoteca pendiente de la vivienda que vendes» se deja SIN TOCAR, a propósito.

    // Plusvalía municipal: objetivo = 60.000 × 0,12 (art. 107.4 TRLRHL, RDL 8/2023, 10 años;
    // era 0,08 con la tabla caducada, hallazgo 1559) × 25 % (PLUSVALIA_MUNICIPAL_META.
    // tipoOrientativo) = 1.800 ; real = 100.000 × (60.000/150.000) × 25 % = 10.000 → gana el
    // objetivo, 1.800 €.
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('1800,00 €');
    // Art. 35 LIRPF: adquisición = 200.000 ; transmisión = 300.000 − 9.000 de comisión
    //              − 1.800 de plusvalía = 289.200 ; ganancia = 89.200 (la gestoría del
    //              comprador ya no resta: art. 35.1 LIRPF, reparado el 21/08/2026)
    expect(await valorTarjeta(page, 'Ganancia patrimonial')).toBe('89.200,00 €');

    // Art. 41.1 RIRPF: importe total obtenido = 289.200 − 0 de préstamo pendiente = 289.200.
    // Se reinvierten 300.000 ≥ 289.200 → proporción 1 → exención TOTAL (art. 38 LIRPF).
    expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('EXENTO');
    expect(await descripcionTarjeta(page, 'IRPF sobre ganancia')).toContain('Reinversión total');
    expect(await valorTarjeta(page, 'Total gastos vendedor')).toBe('10.800,00 €');
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('289.200,00 €');
  });

  test('CASO 11 bis (control) — la misma reinversión con «0» escrito a mano sí queda exenta', async ({ page }) => {
    await page.goto(RUTA);
    await rellenar(page, 'Precio de la vivienda', '300000');
    await page.getByRole('button', { name: 'Vendedor' }).click();
    await rellenar(page, 'Precio de compra original', '200000');
    await rellenar(page, 'Años de propiedad', '10');
    await rellenar(page, 'Valor catastral del suelo', '60000');
    await rellenar(page, 'Valor catastral total (suelo + construcción)', '150000');
    await rellenar(page, 'Comisión inmobiliaria (%)', '3');
    await page.getByText('Voy a reinvertir en otra vivienda habitual').click();
    await rellenar(page, 'Importe que reinviertes en la nueva vivienda', '300000');
    await rellenar(page, 'Hipoteca pendiente de la vivienda que vendes', '0');

    // Mismos datos que el CASO 11, con la única diferencia del «0». Este control es lo que
    // convierte al 11 en un defecto demostrado y no en una discrepancia de criterio fiscal:
    // el motor calcula bien la exención en cuanto el campo no está vacío. Neto con la tabla
    // del RDL 8/2023 (hallazgo 1559): 300.000 − 1.800 − 9.000 = 289.200.
    expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('EXENTO');
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('289.200,00 €');
  });

  // ✅ HALLAZGO REPARADO (Inspector, 16/08/2026) — el otro rincón al que no llegó el 2067ddbe.
  // `estimarGastosAdquisicion` (page.tsx:352) llamaba a
  // `calcularITP(precioC, ccaa, ITP_CCAA[ccaa].tipoGeneral)` con el tercer argumento, que es
  // exactamente lo que cortocircuita la rama de `tramosProgresivos`. La misma página, con el
  // mismo precio y la misma CCAA, da dos ITP distintos: 105.000 € en la pestaña Comprador y
  // 100.000 € dentro del botón «Estimar por mí». Como el estimado va al valor de ADQUISICIÓN,
  // quedarse corto infla la ganancia y el IRPF del vendedor.
  test('CASO 12 (hallazgo) — «Estimar por mí» debe usar la misma escala que la pestaña Comprador', async ({ page }) => {
    await page.goto(RUTA);
    await selectCcaa(page).selectOption('cataluna');
    await rellenar(page, 'Precio de la vivienda', '1200000');
    await page.getByRole('button', { name: 'Vendedor' }).click();
    await rellenar(page, 'Precio de compra original', '1000000');
    await rellenar(page, 'Años de propiedad', '10');
    await rellenar(page, 'Comisión inmobiliaria (%)', '3');
    await page.getByRole('button', { name: /Estimar por mí/ }).click();

    // ITP de 1.000.000 € en Cataluña con la escala de ITP_CCAA.cataluna (la misma que el
    // CASO 2 exige en la pestaña Comprador): 600.000×10 % + 300.000×11 % + 100.000×12 %
    // = 105.000. Más notaría, registro y —desde el 10/09/2026, hallazgo 673— la GESTORÍA de
    // 300 € que el rótulo del campo enumera y el botón no sumaba.
    // Obtenido antes de la reparación de la escala: «101.289» (ITP plano del 10 %, 5.000 €
    // menos); antes de la de la gestoría: «106.915», 300 € menos.
    // Recalculado a mano el 12/10/2026 con la rebaja del 5 % del nº 2.1 (hallazgos 2901 y 2902):
    //   105.000 + notaría 1.365,164455 + registro 454,976034 + 300 = 107.120,14 → «107.120»
    //   (antes, sin la rebaja, «107.215»)
    await expect(
      page.locator('input[aria-label="Impuestos y gastos que pagaste al comprar"]'),
    ).toHaveValue('107.120');

    // Consecuencia en cadena, con la plusvalía municipal fuera (sin valor catastral no se calcula):
    //   transmisión = 1.200.000 − 36.000 de comisión = 1.164.000 (la gestoría es del
    //                 comprador: art. 35.1 LIRPF, reparado el 21/08/2026)
    //   adquisición = 1.000.000 + 107.120 = 1.107.120
    //   ganancia    = 1.164.000 − 1.107.120 = 56.880
    //   IRPF        = 6.000×19 % + 44.000×21 % + 6.880×23 % = 1.140 + 9.240 + 1.582,40 = 11.962,40
    // Obtenido antes de la reparación: adquisición 1.101.289,00 € · ganancia 62.411,00 € ·
    // IRPF 13.234,53 €, es decir 1.150,00 € de IRPF de más.
    expect(await valorTarjeta(page, 'Valor de adquisición')).toBe('1.107.120,00 €');
    expect(await valorTarjeta(page, 'Ganancia patrimonial')).toBe('56.880,00 €');
    expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('11.962,40 €');
  });

  // ✅ HALLAZGO REPARADO (Inspector, 16/08/2026) — accesibilidad.
  // Los dos <select> de la app («Comunidad Autónoma» y «Perfil del comprador») no tenían id,
  // ni aria-label, ni aria-labelledby, y el <label> que los precedía no llevaba htmlFor. Eran
  // labels huérfanos: un lector de pantalla anunciaba «cuadro combinado» sin decir de qué.
  // En esta app la CCAA es el dato que más mueve el resultado (del 4 % al 13 % de ITP).
  test('CASO 13 (hallazgo) — los desplegables deben tener nombre accesible', async ({ page }) => {
    await page.goto(RUTA);
    await expect(selectCcaa(page)).toHaveAccessibleName(/Comunidad Autónoma/);
    await expect(selectPerfil(page)).toHaveAccessibleName(/Perfil del comprador/);
  });
});

/**
 * Reparación del lote mecánico del Inspector (18/08/2026) — hallazgo 21.
 */
test.describe('Estimador de gastos de compraventa — lote mecánico 18/08/2026', () => {
  test('hallazgo 21 — el IVA sale de data/fiscal, también en el tramo del 21 %', async ({ page }) => {
    // IVA_INMUEBLES_2025.local = 21 (data/fiscal/inmuebles.ts, Ley 37/1992).
    // 200.000 × 21 % = 42.000. Antes el tipo era un literal en page.tsx, así que un
    // cambio en data/fiscal no llegaba a esta app, que es el hub del clúster.
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Primera mano/ }).click();
    await page.getByRole('button', { name: /Local comercial/ }).first().click();
    await rellenar(page, 'Precio del inmueble', '200.000');

    await expect(page.locator('h3', { hasText: /^IVA/ }).first()).toHaveText('IVA (21,00 %)');
    expect(await valorTarjeta(page, /^IVA/)).toBe('42.000,00 €');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Lote ITP (19/08/2026) — hallazgo 31 del Inspector
//
// El acta decía que `data/itp-ccaa.ts` «duplica TIPOS_ITP_CCAA_2025» y que la app
// calculaba con la tabla no verificada. Al medirlo, los 17 tipos GENERALES coincidían
// al 100 %; lo que había divergido eran tres tipos REDUCIDOS, y en direcciones
// distintas. Cada valor de aquí abajo sale de la fuente oficial consultada ese día,
// no de ninguna de las dos tablas.
// ═══════════════════════════════════════════════════════════════════════════

test('ITP La Rioja — el tipo joven es el 4 % para menores de 40, no el 5 % para menores de 36', async ({
  page,
}) => {
  // Art. 45.3 de la Ley 10/2017, en la redacción de la Ley 1/2025 de medidas urgentes
  // para el acceso a la vivienda (efectos 03/03/2025), texto consolidado BOE-A-2017-13750:
  // «primera vivienda habitual de jóvenes MENORES DE 40 AÑOS → 4 %», y 3 % si el
  // municipio figura en el anexo I de la ley (condición que esta app no pregunta, así
  // que ese 3 % no debe aplicarse solo).
  //   150.000 × 4 % = 6.000 €   (antes daba 150.000 × 5 % = 7.500 €)
  await page.goto(RUTA);
  await page.getByRole('button', { name: /Segunda mano/ }).click();
  await selectCcaa(page).selectOption('rioja');
  await rellenar(page, 'Precio de la vivienda', '150.000');
  await selectPerfil(page).selectOption('joven');

  await expect(page.locator('h3', { hasText: /^ITP/ }).first()).toHaveText('ITP (4,00 %)');
  expect(await valorTarjeta(page, /^ITP/)).toBe('6000,00 €');
});

test('ITP La Rioja — el perfil general sigue pagando el tipo general del 7 %', async ({ page }) => {
  // Control del test anterior: el 4 % tiene que venir del perfil, no de haber bajado
  // el tipo general de la comunidad. 150.000 × 7 % = 10.500 €.
  await page.goto(RUTA);
  await page.getByRole('button', { name: /Segunda mano/ }).click();
  await selectCcaa(page).selectOption('rioja');
  await rellenar(page, 'Precio de la vivienda', '150.000');

  await expect(page.locator('h3', { hasText: /^ITP/ }).first()).toHaveText('ITP (7,00 %)');
  expect(await valorTarjeta(page, /^ITP/)).toBe('10.500,00 €');
});

test('ITP Murcia — el joven de hasta 40 años tributa al 3 % sin límite de valor del inmueble', async ({
  page,
}) => {
  // Art. 8.6 del texto refundido aprobado por el Decreto Legislativo 1/2010, texto
  // consolidado BOE-A-2011-10542 (última modificación 24/07/2025): «sujetos pasivos de
  // edad INFERIOR O IGUAL A 40 AÑOS», vivienda habitual, base imponible general menos
  // mínimo personal y familiar < 40.000 € y base del ahorro ≤ 1.800 €. NO hay límite de
  // valor del inmueble: 200.000 × 3 % = 6.000 €.
  //
  // Este es el caso que el hallazgo 31 daba por defectuoso reclamando 15.500 € (7,75 %),
  // porque partía de la nota de data/fiscal, que decía «<35 y ≤150.000 €». La razón la
  // tenía la app; lo que estaba mal era la nota, ya corregida.
  await page.goto(RUTA);
  await page.getByRole('button', { name: /Segunda mano/ }).click();
  await selectCcaa(page).selectOption('murcia');
  await rellenar(page, 'Precio de la vivienda', '200.000');
  await selectPerfil(page).selectOption('joven');

  await expect(page.locator('h3', { hasText: /^ITP/ }).first()).toHaveText('ITP (3,00 %)');
  expect(await valorTarjeta(page, /^ITP/)).toBe('6000,00 €');
});

// ═══════════════════════════════════════════════════════════════════════════
// Hallazgo nuevo (19/08/2026, encontrado al verificar el lote ITP) — elegirTipoITP
// confundía condiciones de RENTA con límites de VALOR del inmueble: el regex que
// detecta «≤ X €» en `cubierta()` no distinguía «Valor ≤ 150.000 €» (comprobable
// contra el precio) de «Renta ≤ 36.000 €» (un dato que la app nunca pregunta).
// ═══════════════════════════════════════════════════════════════════════════

test('Cataluña — un inmueble caro ya NO pierde el reducido joven por el precio, sino por no poder verificar la renta', async ({
  page,
}) => {
  // Antes: 200.000 × 10 % (general) — la condición «Renta ≤ 36.000 €» se comparaba
  // contra el PRECIO (200.000), y como 200.000 > 36.000 el reducido se descartaba.
  // Casualidad, no criterio: alguien con renta baja e inmueble caro perdía un
  // beneficio al que sí tenía derecho, sin que la app supiera nada de su renta.
  // Ahora sigue dando el 10 % general, pero por la razón correcta: la renta no se
  // puede comprobar, así que el reducido cae en `noComprobables` y se avisa.
  await page.goto(RUTA);
  await page.getByRole('button', { name: /Segunda mano/ }).click();
  await selectCcaa(page).selectOption('cataluna');
  await rellenar(page, 'Precio de la vivienda', '200.000');
  await selectPerfil(page).selectOption('joven');

  await expect(page.locator('h3', { hasText: /^ITP/ }).first()).toHaveText('ITP (10,00 %)');
  await expect(page.getByText(/no se ha podido comprobar|podr.as pagar menos/i)).toBeVisible();
});

test('Cataluña — un inmueble barato ya NO obtiene el reducido joven sin que se pregunte la renta', async ({
  page,
}) => {
  // Antes: 30.000 × 5 % = 1.500 €. La misma condición de renta, con un precio bajo,
  // pasaba a leerse como «cumplida» — el efecto contrario del caso anterior, y el
  // peligroso en una herramienta fiscal: enseñar una cifra más baja de la que
  // correspondería si la renta real superase los 36.000 €.
  await page.goto(RUTA);
  await page.getByRole('button', { name: /Segunda mano/ }).click();
  await selectCcaa(page).selectOption('cataluna');
  await rellenar(page, 'Precio de la vivienda', '30.000');
  await selectPerfil(page).selectOption('joven');

  await expect(page.locator('h3', { hasText: /^ITP/ }).first()).not.toHaveText(/ITP \(5,00\s?%\)/);
  await expect(page.locator('h3', { hasText: /^ITP/ }).first()).toHaveText('ITP (10,00 %)');
});

test('Andalucía — control: un reducido con límite de VALOR (no de renta) sigue aplicándose sin cambios', async ({
  page,
}) => {
  // El fix excluye SOLO las condiciones que mencionan «renta»; un límite de precio
  // real («Valor ≤ 150.000 €») tiene que seguir comparándose contra el precio.
  await page.goto(RUTA);
  await page.getByRole('button', { name: /Segunda mano/ }).click();
  await selectCcaa(page).selectOption('andalucia');
  await rellenar(page, 'Precio de la vivienda', '100.000');
  await selectPerfil(page).selectOption('joven');

  await expect(page.locator('h3', { hasText: /^ITP/ }).first()).toHaveText('ITP (3,50 %)');
});

// ═══════════════════════════════════════════════════════════════════════════
// Vuelta del Inspector — 20/08/2026 (verificación de la reparación de notaría
// y registro, commit 44a5dc7d)
//
// Lo que se cambió el día anterior y aquí se comprueba:
//   · `calcularNotario` devolvía el arancel PURO del número 2 del RD 1426/1989 —que solo
//     cubre la matriz y una copia— y ahora devuelve el punto medio de una horquilla de
//     1,5-2× ese arancel (FACTURA_NOTARIAL, `data/itp-ccaa.ts`), porque las copias
//     adicionales, los folios (nº 4 y 7) y los suplidos (nº 6) se facturan aparte.
//   · `calcularRegistro` suma ahora dos importes fijos del RD 1427/1989 que el número 2 no
//     incluye: asiento de presentación 6,010121 € (nº 1) y nota simple 3,005061 € (nº 4).
//     A propósito NO se le aplica el factor 1,5-2 de la notaría: allí lo que crece con la
//     escritura son copias y folios, aquí son dos importes fijos y pequeños.
//
// Los tres casos de esta vuelta están resueltos a mano ANTES de abrir el navegador, y el
// CASO B contrasta el motor contra el ejemplo numérico que la propia app publica.
// ═══════════════════════════════════════════════════════════════════════════

test.describe('Inspector 20/08/2026 — factura notarial y registral', () => {
  test('CASO A (normal) — Madrid, 200.000 €: la tarjeta de notaría publica la horquilla, no el arancel', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Segunda mano/ }).click();
    await selectCcaa(page).selectOption('madrid');
    await rellenar(page, 'Precio de la vivienda', '200000');
    await rellenar(page, 'Gastos de gestoría del comprador (€)', '300');

    // ITP: ITP_CCAA.madrid.tipoGeneral = 6, que se LEE de TIPOS_ITP_CCAA_2025 'Madrid'
    // (`data/fiscal/inmuebles.ts`). Madrid no tiene escala progresiva → 200.000 × 6 % = 12.000
    await expect(page.locator('h3', { hasText: /^ITP/ }).first()).toHaveText('ITP (6,00 %)');
    expect(await valorTarjeta(page, /^ITP/)).toBe('12.000,00 €');

    // Recalculado a mano el 12/10/2026 con la rebaja del 5 % del nº 2.1 (hallazgos 2901 y 2902).
    // Arancel notarial (ARANCELES_NOTARIO, nº 2 del RD 1426/1989), acumulando tramos:
    //   90,151816 + 24.040,49×0,45 % + 30.050,60×0,15 % + 90.151,82×0,10 % + 49.746,97×0,05 %
    //   = 358,435226 → × 0,95 = 340,513465 → con el 21 % de IVA = 412,021292
    // Factura (FACTURA_NOTARIAL, factores 1,5 y 2):
    //   min 618,031938 · max 824,042584 · medio 721,037261 ← el que suma la app
    //   (sin la rebaja era 758,98, entre 650,56 y 867,41)
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('721,04 €');
    expect(await descripcionTarjeta(page, 'Gastos de notaría')).toContain(
      'Factura estimada entre 618,03 € y 824,04 €',
    );

    // Registro (ARANCELES_REGISTRO, nº 2 del RD 1427/1989):
    //   24,040484 + 24.040,49×0,175 % + 30.050,60×0,125 % + 90.151,82×0,075 % + 49.746,97×0,030 %
    //   = 186,212547 (por debajo del tope REGISTRO_MAXIMO de 2.181,673939) → × 0,95 = 176,901920
    //   + 6,010121 (nº 1, presentación) + 3,005061 (nº 4, nota simple) = 185,917102
    //   con el 21 % de IVA = 224,959694 (sin la rebaja, 236,22)
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('224,96 €');

    // Total = 12.000 + 721,04 + 224,96 + 300 = 13.246,00 → 6,623 % del precio
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('13.246,00 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toContain('6,62 %');
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('213.246,00 €');
    // Segunda mano: TPO y AJD son incompatibles (art. 31.2 TRLITPAJD)
    await expect(page.locator('h3', { hasText: /^AJD/ })).toHaveCount(0);
  });

  test('CASO B (límite: tipo reducido por edad) — Andalucía, joven, 140.000 €: el motor tiene que dar el ejemplo que la app publica', async ({
    page,
  }) => {
    // Es el caso «Marta» de la sección «Casos de uso reales» de la propia app, elegido
    // porque publica las tres cifras que tocó la reparación: ITP 4.900 €, notaría 685 €,
    // registro 209 € y 1.193 € entre notaría, registro y gestoría.
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Segunda mano/ }).click();
    await selectCcaa(page).selectOption('andalucia');
    await rellenar(page, 'Precio de la vivienda', '140000');
    await rellenar(page, 'Gastos de gestoría del comprador (€)', '300');
    await selectPerfil(page).selectOption('joven');

    // ITP_CCAA.andalucia, reducido «Jóvenes < 35 años» = 3,5 % con valorMaximo 150.000 € y
    // condiciones ['Menor de 35 años', 'Vivienda habitual', 'Valor ≤ 150.000 €'], las tres
    // comprobables con lo que la app pregunta → 140.000 × 3,5 % = 4.900
    // (el tipo general de Andalucía, 7 %, habría dado 9.800)
    await expect(page.locator('h3', { hasText: /^ITP/ }).first()).toHaveText('ITP (3,50 %)');
    expect(await valorTarjeta(page, /^ITP/)).toBe('4900,00 €');

    // Recalculado a mano el 12/10/2026 con la rebaja del 5 % del nº 2.1 (hallazgos 2901 y 2902).
    // Arancel notarial sobre 140.000 €:
    //   90,151816 + 24.040,49×0,45 % + 30.050,60×0,15 % + 79.898,79×0,10 % = 323,308711
    //   × 0,95 = 307,143275 → con el 21 % de IVA = 371,643363 → min 557,465045 · max 743,286726 ·
    //   medio 650,375886 (sin la rebaja: 684,60, entre 586,80 y 782,40)
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('650,38 €');
    expect(await descripcionTarjeta(page, 'Gastos de notaría')).toContain(
      'Factura estimada entre 557,47 € y 743,29 €',
    );

    // Registro sobre 140.000 €:
    //   24,040484 + 24.040,49×0,175 % + 30.050,60×0,125 % + 79.898,79×0,075 % = 163,598684
    //   × 0,95 = 155,418750 + 6,010121 + 3,005061 = 164,433932 → con el 21 % de IVA = 198,965057
    //   (sin la rebaja, 208,86)
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('198,97 €');

    // Total = 4.900 + 650,38 + 198,97 + 300 = 6.049,35 → 4,3210 % del precio.
    // Ojo al formato: es-ES no agrupa los millares de un número de cuatro cifras.
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('6049,35 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toContain('4,32 %');
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('146.049,35 €');

    // Contraste con el texto publicado. Desde el 10/09/2026 (hallazgo 675) las tres partidas
    // y su total salen del MISMO arancel que la calculadora, y el total suma exactamente las
    // líneas que el propio párrafo enseña: 650,38 → «650 €», 198,97 → «199 €», gestoría
    // 300 € y total 650 + 199 + 300 = 1.149 € (con la rebaja; antes 685 + 209 + 300 = 1.194 €).
    // Antes de la reparación iba tecleado y publicaba «unos 1.193 €», que no era la suma de su
    // propio desglose (la familia del hallazgo 594).
    // Formato: es-ES no agrupa los millares de un número de cuatro cifras, igual que en las
    // tarjetas de arriba — antes el texto sí lo agrupaba porque estaba escrito a mano.
    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
    const marta = page.getByText(/Marta, 29 años/).first();
    await expect(marta).toContainText(/3,5\s?%\s*\(4900\s*€\)/);
    await expect(marta).toContainText(/1149\s*€ en notaría \(650\s*€\), registro \(199\s*€\), y gestoría \(300\s*€\)|1149\s*€ en notaría \(650\s*€\), registro \(199\s*€\) y gestoría \(300\s*€\)/);
  });

  test('CASO C (debe rechazarse) — un precio de 0 € no puede producir impuesto ni total', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await rellenar(page, 'Precio de la vivienda', '0');

    // La guarda del useMemo es `!Number.isFinite(precio) || precio <= 0` → null, y el panel
    // pide el dato. Ni un ITP de 0 €, ni la base mínima de 90,15 € del arancel notarial
    // —que es lo que saldría de calcular sobre 0—, ni ningún «No definido».
    // 08/10/2026: el panel decía «Introduce el precio…» con el «0» escrito en el campo; era
    // el hallazgo 2960, patrón 5 de la familia («no falta, no vale»; ver el describe del 07/10 al
    // final), REPARADO: cambió la aserción del mensaje; las otras cuatro, no.
    await expect(
      page.getByText('El precio escrito («0») tiene que ser mayor que 0: corrígelo para ver el desglose de gastos del comprador.'),
    ).toBeVisible();
    await expect(page.locator('h3', { hasText: /^ITP/ })).toHaveCount(0);
    await expect(page.locator('h3', { hasText: 'Gastos de notaría' })).toHaveCount(0);
    await expect(page.locator('h3', { hasText: 'COSTE TOTAL DE ADQUISICIÓN' })).toHaveCount(0);
    await expect(page.getByText('No definido')).toHaveCount(0);
  });
});

// ✅ HALLAZGO REPARADO (Inspector, 20/08/2026) — dato. Lo que sigue describe el defecto de entonces.
// `RANGO_ITP` (`data/itp-ccaa.ts`) se calcula de la tabla justamente para que nadie escriba
// el rango a mano, y el bloque educativo lo usa: «va del 4% (País Vasco) al 13%». Dos
// secciones más abajo, la tabla «Comparativa de impuestos en compraventa» lleva el rango
// escrito a mano como «4% – 11%», así que la misma página se contradice. El 11 % es el tramo
// alto de Valencia; los de Baleares y Cataluña llegan al 13 %, que es lo que paga quien
// compra caro allí. La misma cifra a mano está en el JSON-LD de metadata.ts («ITP entre el
// 4% y el 11%»), que convive con otro schema donde el rango sí sale de RANGO_ITP.
// Caso: abrir /estimador-compraventa-inmueble/ y desplegar el bloque educativo → fila ITP de
//       la tabla comparativa: esperado «4% – 13%» (RANGO_ITP) · obtenido «4% – 11%».
test('REGRESIÓN (dato) — la tabla comparativa debe dar el mismo rango de ITP que RANGO_ITP', async ({
  page,
}) => {
  await page.goto(RUTA);
  await page.getByRole('button', { name: 'Ver guía educativa' }).click();
  await expect(page.locator('tr', { hasText: /^ITP/ }).first()).toContainText('13 %');
});

// ✅ HALLAZGO REPARADO (Inspector, 20/08/2026) — contenido. Lo que sigue describe el defecto de entonces.
// El aviso «Podrías pagar menos, pero depende de requisitos que no preguntamos» y el panel
// «Tipos reducidos disponibles en…» solo aparecen cuando el perfil NO es «General»:
// `elegirTipoITP` sale por `if (perfil === 'general')` antes de rellenar `noComprobables`, y
// el panel se pinta con `perfilComprador !== 'general'`. Pero hay reducidos que no dependen
// de ningún colectivo: ITP_CCAA.madrid incluye «Vivienda habitual (bonif. 10%)» al 5,4 %
// para valor ≤ 250.000 €, y ITP_CCAA.andalucia otro al 6 % para ≤ 150.000 €. Quien compra su
// vivienda habitual sin pertenecer a ningún colectivo —la ruta por defecto de la app y el
// caso más común— no ve ni la cifra ni el aviso de que existe.
// Caso: Madrid · segunda mano · vivienda · 200.000 € · perfil «General (sin bonificaciones)»
//       → esperado: el aviso citando el 5,4 % de vivienda habitual (10.800 €, 1.200 € menos)
//       · obtenido: ITP 12.000,00 € (6 %) y ninguna mención a ese tipo en toda la página.
test('REGRESIÓN (contenido) — con perfil General también hay que avisar del reducido de vivienda habitual', async ({
  page,
}) => {
  await page.goto(RUTA);
  await page.getByRole('button', { name: /Segunda mano/ }).click();
  await selectCcaa(page).selectOption('madrid');
  await rellenar(page, 'Precio de la vivienda', '200000');

  expect(await valorTarjeta(page, /^ITP/)).toBe('12.000,00 €');
  await expect(page.getByText(/Podrías pagar menos/i)).toBeVisible();
});

// ✅ HALLAZGO REPARADO (Inspector, 20/08/2026) — contenido. Lo que sigue describe el defecto de entonces.
// Las tarjetas se titulaban «Gastos de notaría (+ IVA)» y «Registro de la Propiedad (+ IVA)»,
// pero el importe YA lleva el 21 %: `calcularArancelNotarial` y `calcularRegistro` terminan
// con `total * 1.21`. «+ IVA» significa en castellano «IVA aparte», así que quien presupuesta
// suma un 21 % que ya está dentro (758,98 € → 918,37 €). El propio recuadro de errores
// comunes de la app da por hecho lo contrario («los honorarios de notaría y registro llevan
// IVA al 21 %, que a menudo se olvida»). Vale cualquiera de las dos salidas —rotular «IVA
// incluido» o publicar la base sin IVA—; lo que no puede quedarse es el «+».
// Caso: Madrid · 200.000 € → tarjeta «Gastos de notaría (+ IVA)» con valor 758,98 €, que es
//       358,43 € de arancel × 1,21 de IVA × 1,75 de factura · esperado un rótulo que no
//       prometa un IVA aparte · obtenido «Gastos de notaría (+ IVA)».
test('REGRESIÓN (contenido) — el rótulo «(+ IVA)» contradice a un importe que ya lleva el 21 %', async ({
  page,
}) => {
  await page.goto(RUTA);
  await rellenar(page, 'Precio de la vivienda', '200000');

  // 721,04 € desde la rebaja del 5 % del nº 2.1 (hallazgo 2901; recalculado en el CASO 1): era 758,98
  expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('721,04 €');
  const titulo = await page.locator('h3', { hasText: 'Gastos de notaría' }).first().innerText();
  expect(titulo).not.toMatch(/\+\s*IVA/);
});

// ✅ HALLAZGO REPARADO (Inspector, 20/08/2026) — dato. Lo que sigue describe el defecto de entonces.
// El bloque educativo afirmaba que el AJD «varía entre 0,5% y 1,5% según la comunidad» y la
// tabla comparativa repite «0,5% – 1,5%», los dos escritos a mano. En la misma página, al
// elegir País Vasco, el recuadro de la comunidad imprime «AJD 0%» y su nota dice «Sin AJD.
// Régimen foral propio» (ITP_CCAA['pais-vasco'].ajd = 0). El rango es derivable de la tabla,
// igual que RANGO_ITP.
// Caso: elegir «País Vasco» en el selector de comunidad → recuadro de la comunidad: «AJD 0%»
//       y «Sin AJD» · bloque educativo, en la misma página: «varía entre 0,5% y 1,5%».
//       Esperado que el rango incluya el 0 % que la propia app calcula.
test('REGRESIÓN (dato) — el rango de AJD del bloque educativo deja fuera el 0 % del País Vasco', async ({
  page,
}) => {
  await page.goto(RUTA);
  await selectCcaa(page).selectOption('pais-vasco');
  // ⚠️ 24/09/2026 (hallazgos 1583 y 1592): el País Vasco no es «Sin AJD». Su AJD foral es el
  // 0,5 % (NF 1/2011 de Bizkaia, art. 44.1) y lo que está exento es la primera transmisión de
  // VIVIENDA (art. 58.35). Con «Vivienda» elegida, el recuadro sigue diciendo AJD 0 %; la nota
  // de la comunidad ya no dice «Sin AJD», y el rango del bloque educativo conserva el 0 %.
  await expect(page.locator('[class*="infoCcaa"]').first()).toContainText('AJD0 %');
  await expect(page.locator('[class*="infoCcaa"]').first()).toContainText('exenta la primera transmisión de vivienda');

  await page.getByRole('button', { name: 'Ver guía educativa' }).click();
  await expect(page.getByText(/Actos Jurídicos Documentados\)/).first()).toContainText('0 %');
});

// ══════════════════════════════════════════════════════════════════════════════
// Tercera vuelta del Inspector — 27/08/2026 (RE-INSPECCIÓN)
//
// La app volvió a la cola porque `data/fiscal` cambió otra vez: el commit 23b2844f llevó el
// tipo general de las 17 comunidades a `tipoGeneralDe('X')`, que lo LEE de
// TIPOS_ITP_CCAA_2025 (`data/fiscal/inmuebles.ts`), y dejó el candado `npm run check:itp`
// enganchado al build para que no vuelva a tener dos dueños. Comprobado en esta vuelta: los
// 28 casos anteriores siguen en verde y ninguna reparación se ha deshecho.
//
// Lo que sigue son: (a) casos NUEVOS por caminos que las dos vueltas anteriores no pisaron
// —escala de tres tramos, reinversión PARCIAL, bonificación de Ceuta y entrada basura— y
// (b) los hallazgos de esta vuelta, al final; se escribieron con `test.fail()` y están
//     REPARADOS (hoy son regresión).
// ══════════════════════════════════════════════════════════════════════════════

test.describe('Inspector 27/08/2026 — caminos nuevos', () => {
  // Tercera escala progresiva del catálogo, con tres tramos y cortes distintos a los de
  // Cataluña y Baleares (que ya tenían caso): ITP_CCAA.extremadura.tramosProgresivos =
  // 8 % hasta 360.000 · 10 % hasta 600.000 · 11 % el resto.
  test('CASO 14 (límite: escala de tres tramos) — Extremadura, 700.000 €', async ({ page }) => {
    await page.goto(RUTA);
    await page.locator('#ccaa-inmueble').selectOption('extremadura');
    await rellenar(page, 'Precio de la vivienda', '700000');
    await rellenar(page, 'Gastos de gestoría del comprador (€)', '300');

    await expect(page.getByText('Esta comunidad aplica escala progresiva')).toBeVisible();

    // ITP = 360.000×8 % + 240.000×10 % + 100.000×11 % = 28.800 + 24.000 + 11.000 = 63.800
    // Tipo EFECTIVO = 63.800 / 700.000 = 9,1142… → la tarjeta rotula 9,11 %
    expect(await valorTarjeta(page, /^ITP/)).toBe('63.800,00 €');
    await expect(page.locator('h3', { hasText: /^ITP/ }).first()).toHaveText('ITP (9,11 %)');

    // Recalculado a mano el 12/10/2026 con la rebaja del 5 % del nº 2.1 (hallazgos 2901 y 2902).
    // Notaría (ARANCELES_NOTARIO): 90,151816 + 24.040,49×0,45 % + 30.050,60×0,15 %
    //   + 90.151,82×0,10 % + 450.759,07×0,05 % + 98.987,90×0,03 % = 588,637646 de arancel
    //   × 0,95 = 559,205764 ; × 1,21 de IVA = 676,638974 ; × 1,75 (punto medio de
    //   FACTURA_NOTARIAL) = 1.184,118204 (sin la rebaja, 1246,44)
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('1184,12 €');
    // Registro (ARANCELES_REGISTRO): 24,040484 + 24.040,49×0,175 % + 30.050,60×0,125 %
    //   + 90.151,82×0,075 % + 450.759,07×0,030 % + 98.987,90×0,020 % = 326,313757
    //   × 0,95 = 309,998070 + 6,010121 + 3,005061 = 319,013252 ; × 1,21 = 386,006034 (antes 405,75)
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('386,01 €');

    // Total = 63.800 + 1.184,12 + 386,01 + 300 = 65.670,13
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('65.670,13 €');
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('765.670,13 €');
  });

  // La exención por reinversión del art. 38 LIRPF es PROPORCIONAL cuando no se reinvierte
  // todo: hasta ahora solo estaba anclado el caso de reinversión TOTAL (CASO 11).
  test('CASO 15 (normal) — reinversión PARCIAL: la exención es proporcional a lo reinvertido', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await rellenar(page, 'Precio de la vivienda', '300000');
    await page.getByRole('button', { name: 'Vendedor' }).click();
    await rellenar(page, 'Precio de compra original', '200000');
    await rellenar(page, 'Años de propiedad', '10');
    await rellenar(page, 'Valor catastral del suelo', '60000');
    await rellenar(page, 'Valor catastral total (suelo + construcción)', '150000');
    await rellenar(page, 'Comisión inmobiliaria (%)', '3');
    await page.getByText('Voy a reinvertir en otra vivienda habitual').click();
    await rellenar(page, 'Importe que reinviertes en la nueva vivienda', '150000');

    // Plusvalía municipal: objetivo = 60.000 × 0,12 (art. 107.4 TRLRHL, RDL 8/2023, 10 años;
    //   era 0,08 con la tabla caducada, hallazgo 1559) × 25 % = 1.800
    //   real = 100.000 × (60.000/150.000) × 25 % = 10.000 → gana el objetivo
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('1800,00 €');
    // Valor de transmisión = 300.000 − 9.000 de comisión − 1.800 de plusvalía = 289.200
    expect(await valorTarjeta(page, 'Valor de transmisión')).toBe('289.200,00 €');
    // Ganancia = 289.200 − 200.000 = 89.200
    expect(await valorTarjeta(page, 'Ganancia patrimonial')).toBe('89.200,00 €');
    // Importe total obtenido (art. 41 RIRPF) = 289.200 − 0 de hipoteca pendiente
    //   proporción reinvertida = 150.000 / 289.200 = 0,5186722…
    //   exenta = 89.200 × 0,5186722 = 46.265,5602 → base = 89.200 − 46.265,5602 = 42.934,4398
    //   IRPF = 6.000×19 % + 36.934,4398×21 % = 1.140 + 7.756,2324 = 8.896,2324
    expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('8896,23 €');
    // Neto = 300.000 − (1.800 + 9.000 + 8.896,23) = 280.303,77
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('280.303,77 €');
  });

  // Art. 57 bis TRLITPAJD: la cuota se bonifica al 50 % por estar el inmueble en Ceuta o
  // Melilla. En la tabla ese tipo ya viene con el 50 % descontado (`tipo: 3` sobre el 6 %
  // general), y `elegirTipoITP` lo aplica por UBICACIÓN, sin preguntar el perfil.
  test('CASO 16 (límite: régimen especial) — Ceuta, segunda mano, 200.000 €', async ({ page }) => {
    await page.goto(RUTA);
    await page.locator('#ccaa-inmueble').selectOption('ceuta');
    await rellenar(page, 'Precio de la vivienda', '200000');
    await rellenar(page, 'Gastos de gestoría del comprador (€)', '300');

    // 200.000 × 3 % = 6.000 (el 6 % general bonificado al 50 %), NO 12.000
    expect(await valorTarjeta(page, /^ITP/)).toBe('6000,00 €');
    // Total = 6.000 + notaría 358,435226 × 0,95 (rebaja del nº 2.1, hallazgo 2901) × 1,75 =
    // 595,898564 (SIN el 1,21: en Ceuta no rige el IVA, hallazgo 2214) + registro 186,212547 ×
    // 0,95 + 9,015182 = 185,917102 (rebaja del nº 2.1, hallazgo 2902) + 300
    // → las líneas redondeadas 6.000 + 595,90 + 185,92 + 300 = 7.081,82 (recalculado a mano el
    // 12/10/2026; sin la rebaja era 7122,49)
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('7081,82 €');
  });

  // Caso que DEBE rechazarse: texto que no es un número. `parseSpanishNumber` devuelve NaN
  // (no un prefijo numérico, como haría parseFloat) y la app tiene que pedir el dato en vez
  // de pintar cifras. Complementa al CASO 7 (campo vacío) y al CASO 10 (precio negativo).
  test('CASO 17 (debe rechazarse) — «doscientos mil» no es un precio', async ({ page }) => {
    await page.goto(RUTA);
    await rellenar(page, 'Precio de la vivienda', 'doscientos mil');

    await expect(
      page.getByText('Introduce el precio del inmueble para ver el desglose de gastos del comprador'),
    ).toBeVisible();
    await expect(page.getByText('No definido')).toHaveCount(0);
    await expect(page.locator('h3', { hasText: /^ITP/ })).toHaveCount(0);
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// REGRESIÓN — los ocho hallazgos del Inspector del 27/08/2026, REPARADOS ese mismo día.
// Estaban escritos con `test.fail()` afirmando lo que debería pasar; al repararlos se les
// quitó la marca y ahora sujetan la reparación.
// ══════════════════════════════════════════════════════════════════════════════

// ✅ REPARADO 27/08/2026 — cálculo (ALTO).
// En Canarias, Ceuta y Melilla no rige el IVA español (TERRITORIOS_SIN_IVA: allí se liquida
// IGIC o IPSI). El commit c47189ca dice que «ya no se inventa cifra: se nombra el impuesto
// que toca y el total se marca como parcial», y así lo hacen las hermanas nave-industrial,
// solar y terreno-rústico con su bandera `impuestoNoCalculado`. A esta app —el hub del
// clúster— solo llegó el AVISO: sigue calculando un IVA del 10 % (o del 21 %) y metiéndolo
// en «Total gastos adicionales» y en «COSTE TOTAL DE ADQUISICIÓN», que se presenta como
// «Precio + todos los gastos» mientras el aviso de tres líneas más arriba dice que ese
// importe «no es el tuyo».
// Caso: Canarias · primera mano · vivienda · 200.000 € · gestoría 300 € → esperado ninguna
//       tarjeta de IVA y el total marcado como parcial · obtenido «IVA (10,00%) 20.000,00 €»,
//       «Total gastos adicionales 22.795,21 € — 11,40% sobre el precio» y «COSTE TOTAL DE
//       ADQUISICIÓN 222.795,21 €».
test('REGRESIÓN — en Canarias no se puede liquidar un IVA que allí no existe', async ({ page }) => {
  await page.goto(RUTA);
  await page.getByRole('button', { name: /Primera mano/ }).click();
  await page.locator('#ccaa-inmueble').selectOption('canarias');
  await rellenar(page, 'Precio de la vivienda', '200000');

  await expect(page.getByText(/no se aplica el IVA/)).toBeVisible();
  await expect(page.locator('h3', { hasText: /^IVA/ })).toHaveCount(0);
});

// ✅ REPARADO 27/08/2026 — contenido (ALTO).
// Sin precio de compra no hay ganancia que calcular, y el motor deja el IRPF en 0. La
// tarjeta traduce ese 0 a «EXENTO» en verde, con la descripción «Tributación en base del
// ahorro»: afirma una exención que nadie ha comprobado. Es el mismo defecto que el hallazgo
// 43 (la plusvalía pintada como «0,00 €» cuando faltaban datos), reparado el 16/08 en la
// tarjeta de al lado —que hoy dice «Sin calcular»— y no en esta. Además el 0 entra callado
// en «Total gastos vendedor» y en el neto, cuyo único aviso es sobre la plusvalía.
// Caso: Vendedor · precio de venta 250.000 € · sin tocar «Precio de compra original»
//       → esperado «Sin calcular», como en la plusvalía · obtenido «EXENTO» y un neto de
//       242.500,00 €. Control: con compra 180.000 € y 8 años, esa misma venta paga
//       13.255,00 € de IRPF.
test('REGRESIÓN — sin precio de compra el IRPF no está «EXENTO», está sin calcular', async ({
  page,
}) => {
  await page.goto(RUTA);
  await rellenar(page, 'Precio de la vivienda', '250000');
  await page.getByRole('button', { name: 'Vendedor' }).click();

  expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('Sin calcular');
  expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('Sin calcular');
});

// ✅ REPARADO 27/08/2026 — contenido (MEDIO).
// El caso de uso «Ana» del bloque educativo sigue enseñando la regla que la reparación del
// 21/08 retiró del motor: dice que a la ganancia se le resta «la comisión inmobiliaria (3%)
// y la gestoría», y por eso publica 62.200 € en vez de 62.500 €. La gestoría del formulario
// la paga el COMPRADOR y el art. 35.1 LIRPF solo descuenta los gastos satisfechos por el
// transmitente — que es exactamente el motivo por el que se corrigió el cálculo.
// Caso: venta 250.000 € · compra 180.000 € · 8 años · comisión 3 % · gestoría 300 € y sin
//       valores catastrales → la app da «Ganancia patrimonial 62.500,00 €» mientras su
//       propio bloque educativo publica 62.200 € · esperado 62.500 € y sin citar la gestoría.
//
// ⚠️ 25/09/2026 (hallazgo 1802): este caso CONSAGRABA otro defecto. Exigía que Ana publicase
// 62.500 € de ganancia, que es la cifra SIN la plusvalía municipal que el mismo párrafo decía
// que Ana paga y que «también minora el valor de transmisión»; con esos datos la calculadora la
// rotula «Ganancia patrimonial (máximo)». Se conserva el fondo —el ejemplo coincide con el
// motor y no resta la gestoría del comprador— con el suelo catastral que la plusvalía necesita
// (60.000 €, el del CASO 47): plusvalía 2850 € y ganancia 250.000 − 7.500 − 2.850 − 180.000 =
// 59.650 €, en la calculadora y en el ejemplo.
test('REGRESIÓN — el caso «Ana» del bloque educativo contradice al motor', async ({ page }) => {
  await page.goto(RUTA);
  await rellenar(page, 'Precio de la vivienda', '250000');
  await page.getByRole('button', { name: 'Vendedor' }).click();
  await rellenar(page, 'Precio de compra original', '180000');
  await rellenar(page, 'Años de propiedad', '8');
  await rellenar(page, 'Valor catastral del suelo', '60000');
  await rellenar(page, 'Comisión inmobiliaria (%)', '3');
  expect(await valorTarjeta(page, /^Ganancia patrimonial/)).toBe('59.650,00 €');
  await expect(page.locator('h3', { hasText: /^Ganancia patrimonial/ }).first()).toHaveText('Ganancia patrimonial');

  await page.getByRole('button', { name: 'Ver guía educativa' }).click();
  await expect(page.getByText(/Ana vende su piso/)).toContainText('59.650');
  await expect(page.getByText(/Ana vende su piso/)).not.toContainText('gestoría del comprador y');
});

// ✅ REPARADO 27/08/2026 — operativa (MEDIO). Era la mitad no reparada del hallazgo 21.
// El perfil «Vivienda de Protección Oficial» se honra en segunda mano (Murcia: ITP al 4 %),
// pero al pasar a primera mano el selector DESAPARECE, el perfil declarado se descarta sin
// decirlo y se cobra el 10 % de IVA. IVA_INMUEBLES_2025.viviendaProtegida = 4 vive en
// `data/fiscal/inmuebles.ts` y no hay ningún camino en la app que llegue a él: ni se aplica
// ni se menciona, aunque la app tiene justo para esto el aviso «Podrías pagar menos».
// Caso: Murcia · vivienda · 200.000 € · perfil «Vivienda de Protección Oficial» → segunda
//       mano da «ITP (4,00%) 8.000,00 €»; al pulsar «Primera mano» da «IVA (10,00%)
//       20.000,00 €» sin selector de perfil y sin una sola mención al 4 % de VPO
//       (8.000 €) · esperado al menos el aviso de que ese tipo existe.
test('REGRESIÓN — en primera mano el perfil VPO se descarta sin avisar', async ({ page }) => {
  await page.goto(RUTA);
  await page.locator('#ccaa-inmueble').selectOption('murcia');
  await rellenar(page, 'Precio de la vivienda', '200000');
  await page.locator('#perfil-comprador').selectOption('vpo');
  expect(await valorTarjeta(page, /^ITP/)).toBe('8000,00 €');

  await page.getByRole('button', { name: /Primera mano/ }).click();
  await expect(
    page.locator('section[class*="mainContent"]').getByText(/protección oficial|VPO/i).first(),
  ).toBeVisible();
});

// ✅ REPARADO 27/08/2026 — contenido (BAJO).
// La tarjeta del AJD rotula el tipo NOMINAL de la tabla mientras el importe ya lleva la
// bonificación del 50 % del art. 57 bis TRLITPAJD que `calcularAJD` aplica en Ceuta y
// Melilla. La tarjeta del ITP, en la misma pantalla, resuelve esto mostrando el tipo
// EFECTIVO precisamente para no contradecir a la cifra de al lado.
// Caso: Melilla · primera mano · vivienda · 200.000 € → tarjeta «AJD (0,50%)» con
//       500,00 €, que es el 0,25 % · esperado «AJD (0,25%)» (o 1.000,00 € si el rótulo
//       fuera el bueno, que no lo es: la bonificación es correcta).
test('REGRESIÓN — el rótulo del AJD en Melilla no coincide con su importe', async ({ page }) => {
  await page.goto(RUTA);
  await page.getByRole('button', { name: /Primera mano/ }).click();
  await page.locator('#ccaa-inmueble').selectOption('melilla');
  await rellenar(page, 'Precio de la vivienda', '200000');

  expect(await valorTarjeta(page, /^AJD/)).toBe('500,00 €');
  await expect(page.locator('h3', { hasText: /^AJD/ }).first()).toHaveText('AJD (0,25 %)');
});

// ✅ REPARADO 27/08/2026 — contenido (BAJO).
// El bloque educativo y la FAQ (que va también al JSON-LD que consumen los buscadores y las
// IAs) fijan la edad del tipo joven en «menores de 35-36 años», escrita a mano. La propia
// tabla de la app la desmiente en dos comunidades desde el commit 23b2844f, que subió esas
// edades con su norma: Murcia ≤40 (art. 8.6 del Decreto Legislativo 1/2010) y La Rioja <40
// (art. 45.3 de la Ley 10/2017 según la Ley 1/2025). Quien tenga 38 años lee que no le toca.
// Caso: Murcia · perfil «Joven (< 35 años)» · vivienda · 150.000 € → el panel «Tipos
//       reducidos disponibles» lista «3% - Jóvenes ≤40 años» y la app cobra 4.500,00 €,
//       mientras el bloque educativo dice «Jóvenes (generalmente menores de 35-36 años)» y
//       la FAQ «tipos reducidos para jóvenes (menores de 35-36 años)».
test('REGRESIÓN — la edad del tipo joven del bloque educativo contradice a la tabla', async ({
  page,
}) => {
  await page.goto(RUTA);
  await page.locator('#ccaa-inmueble').selectOption('murcia');
  await rellenar(page, 'Precio de la vivienda', '150000');
  await page.locator('#perfil-comprador').selectOption('joven');
  expect(await valorTarjeta(page, /^ITP/)).toBe('4500,00 €');
  await expect(page.getByText('3 % - Jóvenes ≤40 años')).toBeVisible();

  await page.getByRole('button', { name: 'Ver guía educativa' }).click();
  await expect(page.getByText(/menores de 35-36 años/)).toHaveCount(0);
});

// ✅ REPARADO 27/08/2026 — contenido (BAJO).
// El motivo de la exención parcial por reinversión se compone con
// `(proporcionReinvertida * 100).toFixed(1)` en `data/fiscal/ganancia-inmueble.ts`, así que
// el porcentaje sale con punto decimal inglés en una app en español (CLAUDE.md §2: nunca
// `toFixed()` para presentar cifras). Lo ve todo el que reinvierte en parte.
// Caso: el CASO 15 (venta 300.000 €, compra 200.000 €, reinversión de 150.000 €) → la
//       descripción de la tarjeta de IRPF dice «exento el 51.8 % de la ganancia»
//       · esperado «51,8 %».
test('REGRESIÓN — el porcentaje de reinversión sale con punto decimal inglés', async ({ page }) => {
  await page.goto(RUTA);
  await rellenar(page, 'Precio de la vivienda', '300000');
  await page.getByRole('button', { name: 'Vendedor' }).click();
  await rellenar(page, 'Precio de compra original', '200000');
  await rellenar(page, 'Años de propiedad', '10');
  await rellenar(page, 'Valor catastral del suelo', '60000');
  await rellenar(page, 'Valor catastral total (suelo + construcción)', '150000');
  await rellenar(page, 'Comisión inmobiliaria (%)', '3');
  await page.getByText('Voy a reinvertir en otra vivienda habitual').click();
  await rellenar(page, 'Importe que reinviertes en la nueva vivienda', '150000');

  // 150.000 / 289.200 = 51,867 % con la plusvalía del RDL 8/2023 (1.800 €, hallazgo 1559);
  // con la tabla caducada eran 150.000 / 289.800 = 51,76 %. Lo que vigila es la coma.
  expect(await descripcionTarjeta(page, 'IRPF sobre ganancia')).toContain('51,9 %');
});

// ✅ REPARADO 27/08/2026 — dato (BAJO).
// El JSON-LD de `metadata.ts` escribe a mano cuatro tipos generales de ITP («Cataluña
// aplica el 10 % … Madrid el 6 %, Andalucía el 7 % y el País Vasco el 4 %») en el mismo
// fichero donde los extremos del rango SÍ se derivan de RANGO_ITP. Hoy los cuatro coinciden
// con TIPOS_ITP_CCAA_2025, pero salen de un literal: el candado `npm run check:itp` vigila
// `data/itp-ccaa.ts`, no los ficheros de las apps, así que un cambio en data/fiscal —como
// el de Murcia (8 → 7,75 %) o el de Valencia (10 → 9 %) de junio— no llegaría hasta aquí.
// ⚠️ Este test se REESCRIBIÓ al reparar, porque su «esperado» no se sostenía: derivar el
// tipo de la tabla produce EXACTAMENTE el mismo texto que el literal —«Madrid el 6 %» sale
// igual de las dos maneras—, así que desde el navegador es imposible distinguir un literal
// de un derivado, y `not.toMatch(/Madrid el 6 %/)` habría obligado a EMPEORAR la frase para
// ponerse verde. Lo que sí protege es comprobar que lo publicado COINCIDE con ITP_CCAA: el
// día que la tabla se mueva y el JSON-LD se quede atrás, salta aquí.
test('REGRESIÓN — los tipos de ITP del JSON-LD coinciden con la tabla', async ({ page }) => {
  await page.goto(RUTA);
  const schemas = (await page.locator('script[type="application/ld+json"]').allTextContents()).join(' ');
  const pct = (n: number) => String(n).replace('.', ',');

  expect(schemas).toContain(`Madrid el ${pct(ITP_CCAA['madrid'].tipoGeneral)}\u00A0%`);
  expect(schemas).toContain(`Andalucía el ${pct(ITP_CCAA['andalucia'].tipoGeneral)}\u00A0%`);
  expect(schemas).toContain(`País Vasco el ${pct(ITP_CCAA['pais-vasco'].tipoGeneral)}\u00A0%`);
  expect(schemas).toContain(`Cataluña aplica el ${pct(ITP_CCAA['cataluna'].tipoGeneral)}\u00A0%`);

  // El techo de la escala catalana es el otro número citado en esa misma frase.
  const techoCataluna = Math.max(
    ITP_CCAA['cataluna'].tipoGeneral,
    ...(ITP_CCAA['cataluna'].tramosProgresivos ?? []).map((t) => t.tipo),
  );
  expect(schemas).toContain(`escala hasta el ${pct(techoCataluna)}\u00A0%`);
});

// ══════════════════════════════════════════════════════════════════════════════
// Inspector 28/08/2026 — RE-INSPECCIÓN DE CIERRE del commit d787b81b
// ("el IVA que no existe en Canarias deja de sumarse al total en las cuatro apps
// que faltaban"). Mitad A: que la reparación es correcta de verdad y no ha roto
// el camino peninsular. Mitad B: tres caminos que no tenían caso.
// ══════════════════════════════════════════════════════════════════════════════

test.describe('Inspector 28/08/2026 — cierre del IVA en territorios sin IVA', () => {
  // ── MITAD A · el caso literal del commit ────────────────────────────────────
  // La REGRESIÓN de arriba comprueba que ya no hay tarjeta de IVA, pero no llega a
  // las cifras, que es donde vivía el daño: el IVA inventado se colaba en el total
  // rotulado «Precio + todos los gastos». Aquí se anclan los importes exactos.
  //
  // Canarias · primera mano · vivienda · 200.000 € · gestoría 300 €:
  //   Impuesto ..... TERRITORIOS_SIN_IVA.canarias → IGIC, sin cifra (allí no rige el IVA)
  //   AJD .......... 200.000 × 0,75 % = 1.500 (ITP_CCAA.canarias.ajd = 0,75; Canarias NO
  //                  está en CIUDADES_CON_BONIFICACION, así que el efectivo es el nominal)
  //   Notaría ...... arancel RD 1426/1989 = 90,151816 + 24.040,49×0,45 % + 30.050,60×0,15 %
  //                  + 90.151,82×0,10 % + 49.746,97×0,05 % = 358,435226 ; × 0,95 (rebaja del
  //                  nº 2.1, hallazgo 2901) = 340,513465 ; ×1,75 (punto medio de
  //                  FACTURA_NOTARIAL) = 595,898564, SIN IVA: en Canarias no rige (hallazgo
  //                  2214, 26/09/2026). Sin la rebaja era 627,26.
  //   Registro ..... arancel RD 1427/1989 = 24,040484 + 24.040,49×0,175 % + 30.050,60×0,125 %
  //                  + 90.151,82×0,075 % + 49.746,97×0,030 % = 186,212547 ; × 0,95 (hallazgo
  //                  2902) = 176,901920 ; + 6,010121 de presentación + 3,005061 de nota simple
  //                  = 185,917102, sin IVA (sin la rebaja, 195,23)
  //   Total gastos . líneas redondeadas 0 + 1.500 + 595,90 + 185,92 + 300 = 2.581,82
  //   Coste total .. 200.000 + 2.581,82 = 202.581,82
  //   (recalculados a mano el 12/10/2026 con la rebaja; antes 2.622,49 y 202.622,49)
  // Antes de d787b81b ese total era 222.795,21 € (20.000 € de IVA inexistente dentro).
  test('CIERRE A — Canarias, primera mano: el total ya NO lleva el IVA inventado', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Primera mano/ }).click();
    await page.locator('#ccaa-inmueble').selectOption('canarias');
    await rellenar(page, 'Precio de la vivienda', '200000');
    await rellenar(page, 'Gastos de gestoría del comprador (€)', '300');

    await expect(page.locator('h3', { hasText: /^IVA/ })).toHaveCount(0);
    expect(await valorTarjeta(page, /^IGIC/)).toBe('No calculado');
    expect(await valorTarjeta(page, /^AJD/)).toBe('1500,00 €');
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('595,90 €');
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('185,92 €');

    await expect(page.locator('h3', { hasText: /Total gastos adicionales/ }).first()).toHaveText('Total gastos adicionales (parcial)');
    expect(await valorTarjeta(page, /Total gastos adicionales/)).toBe('2581,82 €');
    expect(await descripcionTarjeta(page, /Total gastos adicionales/)).toContain(
      'SIN el IGIC, que no está incluido',
    );
    await expect(page.locator('h3', { hasText: /COSTE TOTAL/ }).first()).toHaveText('COSTE TOTAL (PARCIAL)');
    expect(await valorTarjeta(page, /COSTE TOTAL/)).toBe('202.581,82 €');

    // El aviso del IVA del 4 % de VPO no puede salir donde no hay IVA que rebajar
    await expect(page.getByText(/protección oficial de régimen especial/)).toHaveCount(0);
  });

  // ── MITAD A · control de NO regresión ───────────────────────────────────────
  // La misma operación en la península tiene que seguir dando exactamente lo de antes:
  //   IVA .......... 200.000 × 10 % (IVA_INMUEBLES_2025.obraNueva) = 20.000
  //   AJD .......... 200.000 × 0,75 % (ITP_CCAA.madrid.ajd) = 1.500
  //   Total gastos . 20.000 + 1.500 + 721,04 + 224,96 + 300 = 22.746,00 → 11,37 % (notaría y
  //                  registro con la rebaja del 5 % del nº 2.1, hallazgos 2901 y 2902, como en el
  //                  CASO 1; recalculado a mano el 12/10/2026, antes 22.795,20)
  //   Coste total .. 222.746,00
  //   Aviso VPO .... 200.000 × 4 % (IVA_INMUEBLES_2025.viviendaProtegida) = 8.000
  test('CIERRE A (control) — Madrid, primera mano: el camino peninsular no se ha tocado', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Primera mano/ }).click();
    await page.locator('#ccaa-inmueble').selectOption('madrid');
    await rellenar(page, 'Precio de la vivienda', '200000');
    await rellenar(page, 'Gastos de gestoría del comprador (€)', '300');

    await expect(page.locator('h3', { hasText: /^IVA/ }).first()).toHaveText('IVA (10,00 %)');
    expect(await valorTarjeta(page, /^IVA/)).toBe('20.000,00 €');
    expect(await valorTarjeta(page, /^AJD/)).toBe('1500,00 €');
    await expect(page.locator('h3', { hasText: /Total gastos adicionales/ }).first()).toHaveText('Total gastos adicionales');
    expect(await valorTarjeta(page, /Total gastos adicionales/)).toBe('22.746,00 €');
    await expect(page.locator('h3', { hasText: /COSTE TOTAL/ }).first()).toHaveText('COSTE TOTAL DE ADQUISICIÓN');
    expect(await valorTarjeta(page, /COSTE TOTAL/)).toBe('222.746,00 €');
    await expect(page.getByText(/protección oficial de régimen especial/).first()).toBeVisible();
    await expect(page.getByText(/serían.*8000,00/).first()).toBeVisible();
  });

  // ── MITAD B · CASO 18 ───────────────────────────────────────────────────────
  // El cierre solo se probó con vivienda en Canarias. Aquí se cruza el territorio sin
  // IVA con las DOS ramas que el arreglo atraviesa y que no tenían caso: un inmueble NO
  // residencial (el que iba al 21 %, no al 10 %) y la ciudad donde además se bonifica el
  // AJD al 50 % (art. 57 bis TRLITPAJD, aplicado por `aplicarBonificacionCiudad`).
  //
  // Ceuta · primera mano · local comercial · 400.000 € · gestoría 300 €:
  //   Impuesto ..... TERRITORIOS_SIN_IVA.ceuta → IPSI, sin cifra (antes: 21 % = 84.000 €)
  //   AJD .......... 400.000 × 0,5 % = 2.000 ; × (1 − 0,5) de bonificación = 1.000
  //                  → tipo EFECTIVO 1.000 / 400.000 = 0,25 %
  //   Notaría ...... arancel = 90,151816 + 108,182205 + 45,0759 + 90,15182 + 249.746,97×0,05 %
  //                  (=124,873485) = 458,435226 ; × 0,95 (rebaja del nº 2.1, hallazgo 2901) =
  //                  435,513465 ; ×1,75 = 762,148564, SIN IVA: en Ceuta no rige (hallazgo 2214,
  //                  26/09/2026). Sin la rebaja era 802,26.
  //   Registro ..... 24,040484 + 42,0708575 + 37,56325 + 67,613865 + 249.746,97×0,030 %
  //                  (=74,924091) = 246,212547 ; × 0,95 (hallazgo 2902) = 233,901920 ;
  //                  + 9,015182 = 242,917102, sin IVA (sin la rebaja, 255,23)
  //   Total gastos . líneas redondeadas 0 + 1.000 + 762,15 + 242,92 + 300 = 2.305,07
  //   Coste total .. 402.305,07 (recalculados a mano el 12/10/2026; antes 2.357,49 y 402.357,49)
  test('CASO 18 (límite: territorio sin IVA + inmueble no residencial) — Ceuta, primera mano, local de 400.000 €', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Local comercial/ }).click();
    await page.getByRole('button', { name: /Primera mano/ }).click();
    await page.locator('#ccaa-inmueble').selectOption('ceuta');
    await rellenar(page, 'Precio del inmueble', '400000');
    await rellenar(page, 'Gastos de gestoría del comprador (€)', '300');

    await expect(page.locator('h3', { hasText: /^IVA/ })).toHaveCount(0);
    expect(await valorTarjeta(page, /^IPSI/)).toBe('No calculado');
    await expect(page.locator('h3', { hasText: /^AJD/ }).first()).toHaveText('AJD (0,25 %)');
    expect(await valorTarjeta(page, /^AJD/)).toBe('1000,00 €');
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('762,15 €');
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('242,92 €');
    expect(await valorTarjeta(page, /Total gastos adicionales/)).toBe('2305,07 €');
    expect(await descripcionTarjeta(page, /Total gastos adicionales/)).toContain(
      'SIN el IPSI, que no está incluido',
    );
    expect(await valorTarjeta(page, /COSTE TOTAL/)).toBe('402.305,07 €');
    // Un local no es vivienda: el aviso del IVA del 4 % de VPO no le corresponde
    await expect(page.getByText(/protección oficial de régimen especial/)).toHaveCount(0);
  });

  // ── MITAD B · CASO 19 ───────────────────────────────────────────────────────
  // Dos caminos de `calcularPlusvaliaMunicipal` que ningún caso anterior recorría: que
  // gane el MÉTODO REAL (en el CASO 15 y en el 3 siempre ganaba el objetivo o había
  // exención) y el TOPE de 20 años de `aniosCapped` (COEFICIENTES_IIVTNU_2025 se acaba
  // en «20 o más años», coeficiente 0,45).
  //
  // Venta 260.000 · compra 250.000 · 25 años · suelo 80.000 · total 200.000 · comisión 3 %:
  //   objetivo ..... 80.000 × 0,45 (coef. de 20 años, por el tope) × 25 %
  //                  (PLUSVALIA_MUNICIPAL_META.tipoOrientativo) = 9.000
  //   real ......... (260.000 − 250.000) × (80.000/200.000 = 0,4) × 25 % = 1.000
  //   recomendado .. min(9.000, 1.000) = 1.000 → «Método real (más favorable)»
  //   comisión ..... 260.000 × 3 % = 7.800
  //   v. transmis. . 260.000 − 7.800 − 1.000 = 251.200 (art. 35.1 LIRPF)
  //   v. adquisic. . 250.000 (sin gastos de compra ni mejoras declarados)
  //   ganancia ..... 1.200 → primer tramo del ahorro
  //   IRPF ......... 1.200 × 19 % = 228
  //   total gastos . 1.000 + 7.800 + 0 + 228 = 9.028
  //   neto ......... 260.000 − 9.028 = 250.972
  test('CASO 19 (límite: tope de 20 años) — la plusvalía sale por el método real y el coeficiente se topa', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await rellenar(page, 'Precio de la vivienda', '260000');
    await page.getByRole('button', { name: 'Vendedor' }).click();
    await rellenar(page, 'Precio de compra original', '250000');
    await rellenar(page, 'Años de propiedad', '25');
    await rellenar(page, 'Valor catastral del suelo', '80000');
    await rellenar(page, 'Valor catastral total (suelo + construcción)', '200000');
    await rellenar(page, 'Comisión inmobiliaria (%)', '3');

    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('1000,00 €');
    expect(await descripcionTarjeta(page, 'Plusvalía municipal')).toBe('Método real (más favorable)');
    expect(await valorTarjeta(page, 'Valor de adquisición')).toBe('250.000,00 €');
    expect(await valorTarjeta(page, 'Valor de transmisión')).toBe('251.200,00 €');
    expect(await valorTarjeta(page, 'Ganancia patrimonial')).toBe('1200,00 €');
    expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('228,00 €');
    expect(await valorTarjeta(page, 'Total gastos vendedor')).toBe('9028,00 €');
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('250.972,00 €');
  });

  // ── MITAD B · CASO 20 (control) ─────────────────────────────────────────────
  // La misma pantalla con los dos campos del vendedor en su valor legítimo. Sujeta el
  // montaje de los dos casos de abajo (escritos con test.fail(), REPARADOS y hoy regresión):
  // si esto se pone rojo, lo que falla es el caso, no el hallazgo.
  //   plusvalía .... objetivo 50.000 × 0,19 (8 años, art. 107.4 TRLRHL en la redacción del
  //                  RDL 8/2023; era 0,10 con la tabla caducada, hallazgo 1559) × 25 % = 2.375 ;
  //                  real 70.000 × (50.000/120.000) × 25 % = 7.291,67 → gana el objetivo
  //   comisión ..... 250.000 × 3 % = 7.500
  //   v. transmis. . 250.000 − 7.500 − 2.375 = 240.125
  //   ganancia ..... 240.125 − 180.000 = 60.125
  //   IRPF ......... 6.000×19 % + 44.000×21 % + 10.125×23 % = 1.140 + 9.240 + 2.328,75
  //                  = 12.708,75
  //   total gastos . 2.375 + 7.500 + 0 + 12.708,75 = 22.583,75
  //   neto ......... 250.000 − 22.583,75 = 227.416,25
  test('CASO 20 (control) — vendedor con comisión del 3 % y sin otros gastos', async ({ page }) => {
    await page.goto(RUTA);
    await rellenar(page, 'Precio de la vivienda', '250000');
    await page.getByRole('button', { name: 'Vendedor' }).click();
    await rellenar(page, 'Precio de compra original', '180000');
    await rellenar(page, 'Años de propiedad', '8');
    await rellenar(page, 'Valor catastral del suelo', '50000');
    await rellenar(page, 'Valor catastral total (suelo + construcción)', '120000');
    await rellenar(page, 'Comisión inmobiliaria (%)', '3');

    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('2375,00 €');
    expect(await valorTarjeta(page, 'Valor de transmisión')).toBe('240.125,00 €');
    expect(await valorTarjeta(page, 'Ganancia patrimonial')).toBe('60.125,00 €');
    expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('12.708,75 €');
    expect(await valorTarjeta(page, 'Total gastos vendedor')).toBe('22.583,75 €');
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('227.416,25 €');
  });
});

// Hallazgo 476 — reparado. `otrosVenta` y `comisionPct` se acotan con `Math.max(0, …)` DENTRO
// del useMemo, igual que d787b81b ya hizo con la gestoría del comprador.
test(
  'REGRESIÓN — un importe negativo en «Otros gastos de la venta» no sube el neto',
  async ({ page }) => {
    await page.goto(RUTA);
    await rellenar(page, 'Precio de la vivienda', '250000');
    await page.getByRole('button', { name: 'Vendedor' }).click();
    await rellenar(page, 'Precio de compra original', '180000');
    await rellenar(page, 'Años de propiedad', '8');
    await rellenar(page, 'Valor catastral del suelo', '50000');
    await rellenar(page, 'Valor catastral total (suelo + construcción)', '120000');
    await rellenar(page, 'Comisión inmobiliaria (%)', '3');
    // SIN blur: así es como está el campo mientras el usuario teclea
    await page.locator('input[aria-label="Otros gastos de la venta (opcional)"]').fill('-2000');

    // El neto del CASO 20 (227.416,25 € con los coeficientes del RDL 8/2023, hallazgo 1559).
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('227.416,25 €');
  },
);

// Hallazgo 477 — reparado. Misma acotación que el 476, en la comisión inmobiliaria.
test(
  'REGRESIÓN — una comisión negativa no resta del total de gastos del vendedor',
  async ({ page }) => {
    await page.goto(RUTA);
    await rellenar(page, 'Precio de la vivienda', '250000');
    await page.getByRole('button', { name: 'Vendedor' }).click();
    await rellenar(page, 'Precio de compra original', '180000');
    await rellenar(page, 'Años de propiedad', '8');
    await rellenar(page, 'Valor catastral del suelo', '50000');
    await rellenar(page, 'Valor catastral total (suelo + construcción)', '120000');
    // SIN blur, igual que arriba
    await page.locator('input[aria-label="Comisión inmobiliaria (%)"]').fill('-3');

    // Comisión acotada a 0: plusvalía 50.000 × 0,19 × 25 % = 2.375 (RDL 8/2023, 1559) ·
    // ganancia 250.000 − 2.375 − 180.000 = 67.625 · IRPF 1.140 + 9.240 + 17.625 × 23 % =
    // 14.433,75 · neto 250.000 − 2.375 − 14.433,75 = 233.191,25
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('233.191,25 €');
  },
);

// Hallazgo 478 — reparado. El bloque educativo deriva ahora los dos recargos de
// `ESCALA_RECARGO_EXTEMPORANEO`, igual que ya hacían garaje y trastero.
test(
  'REGRESIÓN — el bloque educativo no publica la escala de recargos anterior a la Ley 11/2021',
  async ({ page }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: 'Ver guía educativa' }).click();

    await expect(page.getByText(/5\s?% al 20\s?%/)).toHaveCount(0);
  },
);

// ══════════════════════════════════════════════════════════════════════════════
// Inspector 30/08/2026 — RE-INSPECCIÓN del commit 0828da3e ("tanda 2 de reparación
// — clúster de compraventa de inmuebles"). La cola marcó la app «invalidada», así
// que aquí NO se da por bueno el commit: los tres casos están resueltos a mano
// ANTES de abrir el navegador, anclados en data/fiscal y data/itp-ccaa, y recorren
// justo los caminos que se tocaron.
//
//   CASO 21 (normal)   · península, vivienda usada — que la reparación no ha roto
//                        el camino por defecto.
//   CASO 22 (especial) · Melilla en obra nueva — cruza los DOS arreglos del clúster
//                        en una sola pantalla: el IVA que allí no rige (IPSI) y el
//                        rótulo del AJD, que debe publicar el tipo EFECTIVO tras la
//                        bonificación del 50 % del art. 57 bis TRLITPAJD.
//   CASO 23 (límite)   · vendedor sin precio de compra — el «SIN CUOTA» en verde.
//
// Y cuatro hallazgos NUEVOS, escritos en `test.fail()`; REPARADOS desde entonces (regresión).
// ══════════════════════════════════════════════════════════════════════════════

test.describe('Inspector 30/08/2026 — re-verificación de la tanda 2', () => {
  test('CASO 21 (normal) — Galicia, segunda mano, vivienda de 320.000 €', async ({ page }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Segunda mano/ }).click();
    await page.locator('#ccaa-inmueble').selectOption('galicia');
    await rellenar(page, 'Precio de la vivienda', '320000');
    await rellenar(page, 'Gastos de gestoría del comprador (€)', '300');

    // ITP: ITP_CCAA.galicia.tipoGeneral = 8, que se LEE de TIPOS_ITP_CCAA_2025 'Galicia'
    // (`data/fiscal/inmuebles.ts`). Galicia no tiene `tramosProgresivos` ni está en
    // CIUDADES_CON_BONIFICACION → 320.000 × 8 % = 25.600
    await expect(page.locator('h3', { hasText: /^ITP/ }).first()).toHaveText('ITP (8,00 %)');
    expect(await valorTarjeta(page, /^ITP/)).toBe('25.600,00 €');

    // Recalculado a mano el 12/10/2026 con la rebaja del 5 % del nº 2.1 (hallazgos 2901 y 2902).
    // Arancel notarial (ARANCELES_NOTARIO, nº 2 del RD 1426/1989) sobre 320.000 €:
    //   90,151816 + 24.040,49×0,45 % + 30.050,60×0,15 % + 90.151,82×0,10 % + 169.746,97×0,05 %
    //   = 90,151816 + 108,182205 + 45,0759 + 90,15182 + 84,873485 = 418,435226
    //   × 0,95 = 397,513465 ; con el 21 % de IVA = 480,991292
    // Factura (FACTURA_NOTARIAL, factores 1,5 y 2): min 721,486938 · max 961,982584
    //   · medio 841,734761 ← el que suma la app (sin la rebaja, 886,03 entre 759,46 y 1012,61)
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('841,73 €');
    expect(await descripcionTarjeta(page, 'Gastos de notaría')).toContain(
      'Factura estimada entre 721,49 € y 961,98 €',
    );

    // Registro (ARANCELES_REGISTRO, nº 2 del RD 1427/1989) sobre 320.000 €:
    //   24,040484 + 24.040,49×0,175 % + 30.050,60×0,125 % + 90.151,82×0,075 % + 169.746,97×0,030 %
    //   = 24,040484 + 42,0708575 + 37,56325 + 67,613865 + 50,924091 = 222,212547 (< tope
    //   REGISTRO_MAXIMO 2.181,673939) × 0,95 = 211,101920 + 6,010121 (nº 1) + 3,005061 (nº 4)
    //   = 220,117102 ; con el 21 % de IVA = 266,341694 (sin la rebaja, 279,78)
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('266,34 €');
    expect(await valorTarjeta(page, 'Gastos de gestoría')).toBe('300,00 €');

    // Total = 25.600 + 841,73 + 266,34 + 300 = 27.008,07 → 8,4400 % del precio
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('27.008,07 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toContain('8,44 %');
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('347.008,07 €');
    // Segunda mano: TPO y AJD son incompatibles (art. 31.2 TRLITPAJD)
    await expect(page.locator('h3', { hasText: /^AJD/ })).toHaveCount(0);
  });

  test('CASO 22 (territorio con régimen especial) — Melilla, primera mano, vivienda de 180.000 €', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Primera mano/ }).click();
    await page.locator('#ccaa-inmueble').selectOption('melilla');
    await rellenar(page, 'Precio de la vivienda', '180000');
    await rellenar(page, 'Gastos de gestoría del comprador (€)', '300');

    // TERRITORIOS_SIN_IVA.melilla (`data/itp-ccaa.ts`) → IPSI: allí no se devenga IVA, así
    // que la app nombra el impuesto y NO inventa cifra. Ni tarjeta de IVA, ni aviso del
    // IVA del 4 % de VPO (IVA_INMUEBLES_2025.viviendaProtegida), que aquí no rebaja nada.
    await expect(page.locator('h3', { hasText: /^IVA/ })).toHaveCount(0);
    expect(await valorTarjeta(page, /^IPSI/)).toBe('No calculado');
    await expect(page.getByText(/protección oficial de régimen especial/)).toHaveCount(0);
    await expect(page.getByText(/no se aplica el IVA/)).toBeVisible();

    // AJD: ITP_CCAA.melilla.ajd = 0,5 → 180.000 × 0,5 % = 900 ; el art. 57 bis.1 del
    // TRLITPAJD bonifica al 50 % la cuota gradual cuando el Registro radica en Melilla
    // (`aplicarBonificacionCiudad`) → 450. El rótulo tiene que publicar el tipo EFECTIVO
    // 450/180.000 = 0,25 %, no el 0,5 % nominal de la tabla (hallazgo 473/484).
    await expect(page.locator('h3', { hasText: /^AJD/ }).first()).toHaveText('AJD (0,25 %)');
    expect(await valorTarjeta(page, /^AJD/)).toBe('450,00 €');

    // Recalculado a mano el 12/10/2026 con la rebaja del 5 % del nº 2.1 (hallazgos 2901 y 2902).
    // Arancel notarial sobre 180.000 €: 90,151816 + 108,182205 + 45,0759 + 90,15182
    //   + 29.746,97×0,05 % (=14,873485) = 348,435226 ; × 0,95 = 331,013465 ; ×1,75 = 579,273564,
    //   SIN IVA: en Melilla no rige (hallazgo 2214, 26/09/2026). Sin la rebaja era 609,76.
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('579,27 €');
    // Registro: 24,040484 + 42,0708575 + 37,56325 + 67,613865 + 29.746,97×0,030 % (=8,924091)
    //   = 180,212547 ; × 0,95 = 171,201920 ; + 9,015182 = 180,217102, sin IVA (antes 189,23)
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('180,22 €');

    // Total = líneas redondeadas 0 + 450 + 579,27 + 180,22 + 300 = 1.509,49 (sin el IVA de los
    // honorarios, hallazgo 2214, y con la rebaja; antes 1.548,99 y, antes aún, 1.716,77).
    // Los rótulos tienen que decir que es PARCIAL: falta el IPSI, que la app no calcula.
    await expect(page.locator('h3', { hasText: /Total gastos adicionales/ }).first()).toHaveText(
      'Total gastos adicionales (parcial)',
    );
    expect(await valorTarjeta(page, /Total gastos adicionales/)).toBe('1509,49 €');
    expect(await descripcionTarjeta(page, /Total gastos adicionales/)).toContain(
      'SIN el IPSI, que no está incluido',
    );
    await expect(page.locator('h3', { hasText: /COSTE TOTAL/ }).first()).toHaveText(
      'COSTE TOTAL (PARCIAL)',
    );
    expect(await valorTarjeta(page, /COSTE TOTAL/)).toBe('181.509,49 €');
  });

  test('CASO 23 (límite: sin precio de compra) — el IRPF no está exento, está sin calcular', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await rellenar(page, 'Precio de la vivienda', '250000');
    await page.getByRole('button', { name: 'Vendedor' }).click();
    await rellenar(page, 'Años de propiedad', '8');
    await rellenar(page, 'Valor catastral del suelo', '50000');
    await rellenar(page, 'Valor catastral total (suelo + construcción)', '120000');
    await rellenar(page, 'Comisión inmobiliaria (%)', '3');
    // «Precio de compra original» se deja VACÍO a propósito: es el caso del hallazgo 483.

    // Sin precio de compra no hay ganancia que calcular, así que ni la plusvalía municipal
    // (necesita el incremento real, art. 104.5 TRLHL) ni el IRPF pueden salir. Un 0 en verde
    // rotulado «EXENTO» afirmaría una exención que nadie ha comprobado.
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('Sin calcular');
    expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('Sin calcular');
    expect(await descripcionTarjeta(page, 'IRPF sobre ganancia')).toContain(
      'Falta el precio de compra original',
    );
    await expect(page.getByText('EXENTO', { exact: true })).toHaveCount(0);
    // Sin valor de adquisición no se pintan las tarjetas derivadas
    await expect(page.locator('h3', { hasText: 'Valor de adquisición' })).toHaveCount(0);
    await expect(page.locator('h3', { hasText: 'Ganancia patrimonial' })).toHaveCount(0);

    // Lo único que el neto SÍ descuenta es la comisión: 250.000 × 3 % = 7.500
    // → neto = 250.000 − 7.500 = 242.500, y hay que decir que está incompleto.
    expect(await valorTarjeta(page, 'Comisión inmobiliaria')).toBe('7500,00 €');
    expect(await valorTarjeta(page, 'Total gastos vendedor')).toBe('7500,00 €');
    expect(await descripcionTarjeta(page, 'Total gastos vendedor')).toBe(
      'SIN la plusvalía municipal ni el IRPF de la ganancia, que no se incluyen',
    );
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('242.500,00 €');
    expect(await descripcionTarjeta(page, 'IMPORTE NETO VENDEDOR')).toContain('No descuenta');
  });

  // Reparados el 30/08/2026 (Inspector, ronda 8, hallazgos 509-512). Los cuatro pasaron
  // de `test.fail` a verde y se quedan como regresión.
  test('509 — la fila AJD distingue la hipoteca (paga la entidad financiera, Ley 5/2019)', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
    const filaAJD = page.locator('table tbody tr', { hasText: /^AJD/ }).first();
    // La celda «¿Quién paga?» tiene que distinguir la hipoteca del resto.
    await expect(filaAJD.locator('td').nth(3)).toHaveText(/entidad financiera|banco|prestamista/i);
  });

  test('510 — el botón de primera mano nombra el impuesto real del territorio (Melilla → IPSI)', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await page.locator('#ccaa-inmueble').selectOption('melilla');
    await expect(page.getByRole('button', { name: /Primera mano/ })).toContainText('Paga IPSI');
  });

  test('512 — el aviso del neto solo pide el campo que de verdad falta', async ({ page }) => {
    await page.goto(RUTA);
    await rellenar(page, 'Precio de la vivienda', '250000');
    await page.getByRole('button', { name: 'Vendedor' }).click();
    await rellenar(page, 'Años de propiedad', '8');
    await rellenar(page, 'Valor catastral del suelo', '50000');
    await rellenar(page, 'Valor catastral total (suelo + construcción)', '120000');
    // El suelo YA está relleno: el único dato que falta es el precio de compra.
    expect(await descripcionTarjeta(page, 'IMPORTE NETO VENDEDOR')).toContain(
      'Rellena el precio de compra original para obtenerlo',
    );
  });

  test('511 — el bloque educativo ya no atribuye al vendedor la gestoría del comprador', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
    const tarjeta = page.locator('h4', { hasText: 'IRPF del vendedor' }).locator('xpath=..');
    await expect(tarjeta).not.toHaveText(/se restan la comisión, la gestoría y la plusvalía/);
    await expect(tarjeta).toContainText('la del comprador no cuenta');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Inspector — 02/09/2026 (segmento fiscal, riesgo 1 CRÍTICO)
//
// Tres casos resueltos A MANO antes de abrir el navegador. Cada tipo y cada
// coeficiente sale de `data/fiscal` o de `data/itp-ccaa.ts`, nunca de memoria:
//   · ITP general de Madrid = 6 → TIPOS_ITP_CCAA_2025 'Madrid' (data/fiscal/inmuebles.ts),
//     leído por `tipoGeneralDe('Madrid')` en ITP_CCAA.madrid.tipoGeneral.
//   · Escala de Cataluña 10/11/12/13 % → ITP_CCAA.cataluna.tramosProgresivos.
//   · Aranceles → ARANCELES_NOTARIO (RD 1426/1989) y ARANCELES_REGISTRO (RD 1427/1989),
//     con FACTURA_NOTARIAL (×1,5-2, medio ×1,75) y REGISTRO_CONCEPTOS.
//   · Plusvalía → COEFICIENTES_IIVTNU_2025 y PLUSVALIA_MUNICIPAL_META.tipoOrientativo.
//   · IRPF → TRAMOS_GANANCIAS_PATRIMONIALES_2025 vía calcularGananciaInmueble.
// ═══════════════════════════════════════════════════════════════════════════

test.describe('Inspector 02/09/2026 — comprador y vendedor de punta a punta', () => {
  test('CASO 24 (normal) — Madrid, 200.000 €: las dos pestañas de la misma operación', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await page.locator('#ccaa-inmueble').selectOption('madrid');
    await rellenar(page, 'Precio de la vivienda', '200000');

    // ── Comprador ────────────────────────────────────────────────────────────
    // ITP = 200.000 × 6 % (ITP_CCAA.madrid.tipoGeneral, sin escala progresiva) = 12.000
    await expect(page.locator('h3', { hasText: /^ITP/ }).first()).toHaveText('ITP (6,00 %)');
    expect(await valorTarjeta(page, /^ITP/)).toBe('12.000,00 €');
    // Recalculado a mano el 12/10/2026 con la rebaja del 5 % del nº 2.1 (hallazgos 2901 y 2902).
    // Arancel notarial acumulado hasta 200.000 € = 358,435226 ; × 0,95 = 340,513465 ;
    // ×1,21 IVA = 412,021292 ; ×1,75 (punto medio de FACTURA_NOTARIAL) = 721,037261 (antes 758,98)
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('721,04 €');
    // Registro = 186,212547 × 0,95 = 176,901920 + 6,010121 (presentación) + 3,005061 (nota
    // simple) = 185,917102 ; ×1,21 IVA = 224,959694 (antes 236,22)
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('224,96 €');
    expect(await valorTarjeta(page, 'Gastos de gestoría')).toBe('300,00 €');
    // 12.000 + 721,04 + 224,96 + 300 = 13.246,00 → 6,623 % del precio
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('13.246,00 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toContain('6,62 %');
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('213.246,00 €');

    // ── Vendedor de la MISMA operación ──────────────────────────────────────
    await page.getByRole('button', { name: 'Vendedor' }).click();
    await rellenar(page, 'Precio de compra original', '150000');
    await rellenar(page, 'Años de propiedad', '10');
    await rellenar(page, 'Valor catastral del suelo', '50000');
    await rellenar(page, 'Valor catastral total (suelo + construcción)', '120000');
    // «Impuestos y gastos que pagaste al comprar», «mejoras» y «otros gastos» se dejan
    // vacíos a propósito: son opcionales y `parseSpanishNumberOr` los lee como 0.

    // Plusvalía municipal (art. 107.4 TRLRHL en la redacción del RDL 8/2023; hasta el
    // 24/09/2026 la app usaba la tabla caducada del RDL 26/2021, 0,08 a 10 años, hallazgo 1559):
    //   objetivo = 50.000 × 0,12 (10 años) × 25 % (PLUSVALIA_MUNICIPAL_META.tipoOrientativo) = 1.500
    //   real     = (200.000 − 150.000) × 50.000/120.000 × 25 % = 5.208,33
    //   → el contribuyente elige el más favorable: 1.500 €
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('1500,00 €');
    expect(await descripcionTarjeta(page, 'Plusvalía municipal')).toBe(
      'Método objetivo (más favorable)',
    );

    // Art. 35 LIRPF (calcularGananciaInmueble):
    //   adquisición = 150.000 + 0 gastos + 0 mejoras = 150.000
    //   transmisión = 200.000 − 6.000 (comisión 3 %) − 1.500 (plusvalía) = 192.500
    //   ganancia    = 192.500 − 150.000 = 42.500
    expect(await valorTarjeta(page, 'Valor de adquisición')).toBe('150.000,00 €');
    expect(await valorTarjeta(page, 'Valor de transmisión')).toBe('192.500,00 €');
    expect(await valorTarjeta(page, 'Ganancia patrimonial')).toBe('42.500,00 €');
    // TRAMOS_GANANCIAS_PATRIMONIALES_2025: 6.000×19 % + 36.500×21 % = 1.140 + 7.665 = 8.805
    expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('8805,00 €');
    expect(await valorTarjeta(page, 'Comisión inmobiliaria')).toBe('6000,00 €');
    // 1.500 plusvalía + 6.000 comisión + 0 otros + 8.805 IRPF = 16.305 ; neto = 183.695
    expect(await valorTarjeta(page, 'Total gastos vendedor')).toBe('16.305,00 €');
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('183.695,00 €');
  });

  test('CASO 25 (límite: el tramo MÁS ALTO de Cataluña) — 1.600.000 €, el 13 % que nadie pisaba', async ({
    page,
  }) => {
    // El CASO 2 se queda en 1.000.000 € y por tanto en el tercer tramo (12 %). Este entra
    // en el cuarto, que es el que fija RANGO_ITP.max = 13 y el que cita el bloque educativo.
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Segunda mano/ }).click();
    await page.locator('#ccaa-inmueble').selectOption('cataluna');
    await rellenar(page, 'Precio de la vivienda', '1600000');

    await expect(page.getByText('Esta comunidad aplica escala progresiva')).toBeVisible();

    // ITP_CCAA.cataluna.tramosProgresivos = 10 % hasta 600.000 · 11 % hasta 900.000 ·
    // 12 % hasta 1.500.000 · 13 % el resto:
    //   600.000×10 % + 300.000×11 % + 600.000×12 % + 100.000×13 %
    //   = 60.000 + 33.000 + 72.000 + 13.000 = 178.000
    // Tipo EFECTIVO mostrado = 178.000 / 1.600.000 = 11,125 % → «11,13%»
    expect(await valorTarjeta(page, /^ITP/)).toBe('178.000,00 €');
    await expect(page.locator('h3', { hasText: /^ITP/ }).first()).toHaveText('ITP (11,13 %)');

    // Recalculado a mano el 12/10/2026 con la rebaja del 5 % del nº 2.1 (hallazgos 2901 y 2902).
    // Arancel notarial: 558,941276 + (1.600.000 − 601.012,10)×0,03 % = 858,637646 ; × 0,95 =
    //   815,705764 ; ×1,21 = 987,003974 → horquilla 1.480,505961-1.974,007948 y medio 1.727,256955
    //   (sin la rebaja, 1818,16 entre 1558,42 y 2077,90)
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('1727,26 €');
    expect(await descripcionTarjeta(page, 'Gastos de notaría')).toContain(
      'Factura estimada entre 1480,51 € y 1974,01 €',
    );
    // Registro: 306,516178 + (1.600.000 − 601.012,10)×0,020 % = 506,313757 (< tope 2.181,673939)
    //   × 0,95 = 480,998070 + 6,010121 + 3,005061 = 490,013252 ; ×1,21 = 592,916034 (antes 623,55)
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('592,92 €');

    // 178.000 + 1.727,26 + 592,92 + 300 = 180.620,18 → 11,2888 % del precio
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('180.620,18 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toContain('11,29 %');
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('1.780.620,18 €');
    // Segunda mano: TPO y AJD son incompatibles (art. 31.2 TRLITPAJD)
    await expect(page.locator('h3', { hasText: /^AJD/ })).toHaveCount(0);
  });

  // ✅ REPARADO el 02/09/2026 (hallazgo 580) — el NaN volvía en el botón.
  // `estimarGastosAdquisicion` se protege dos veces con la MISMA comparación rota:
  //   disabled={parseSpanishNumber(precioCompraOriginal) <= 0}   (page.tsx:923)
  //   if (precioC <= 0) return;                                  (page.tsx:417)
  // Con el campo vacío `parseSpanishNumber` devuelve NaN y `NaN <= 0` es false, así que
  // ni el botón se deshabilita ni la guarda corta: se calcula sobre NaN y el resultado se
  // escribe con `formatNumber(NaN, 0)`, que devuelve la CADENA «No definido» — y va a
  // parar a un campo de euros. Es el mismo defecto que el comentario de page.tsx:401
  // dice haber cerrado («!(x > 0) y no «x <= 0»… el mismo bug que el hallazgo 512 venía
  // a cerrar»), sin propagarlo a estas dos líneas.
  // Medido: precio de venta 250.000 · compra 180.000 · 8 años. Pulsando el botón con el
  // campo vacío, «No definido» se queda ahí, `parseSpanishNumberOr` lo lee como 0 y la
  // adquisición sale 180.000,00 € con 13.255,00 € de IRPF; con el botón pulsado en su
  // orden correcto escribe «11.767» y la adquisición sube a 191.767,00 €. El usuario ve
  // el campo relleno y paga IRPF sobre una ganancia inflada.
  test('CASO 26 (debe rechazarse) — «Estimar por mí» sin precio de compra no puede escribir texto en un campo de euros', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await rellenar(page, 'Precio de la vivienda', '250000');
    await page.getByRole('button', { name: 'Vendedor' }).click();
    // «Precio de compra original» se deja VACÍO a propósito: es lo que el botón necesita.

    // Lo correcto es que el botón esté deshabilitado mientras no haya precio de compra.
    await expect(page.getByRole('button', { name: /Estimar por mí/ })).toBeDisabled();

    // Y, si aun así se pulsa, el campo de euros no puede acabar con una cadena dentro.
    await page.getByRole('button', { name: /Estimar por mí/ }).click({ force: true });
    await expect(
      page.locator('input[aria-label="Impuestos y gastos que pagaste al comprar"]'),
    ).not.toHaveValue('No definido');
  });

  // Control del CASO 26: con el precio de compra relleno el botón SÍ estima, y lo hace
  // bien. Es lo que convierte el 26 en un defecto demostrado y no en una preferencia.
  test('CASO 26 bis (control) — con el precio de compra relleno, el botón estima y no escribe texto', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await page.locator('#ccaa-inmueble').selectOption('madrid');
    await rellenar(page, 'Precio de la vivienda', '250000');
    await page.getByRole('button', { name: 'Vendedor' }).click();
    await rellenar(page, 'Precio de compra original', '180000');
    await page.getByRole('button', { name: /Estimar por mí/ }).click();

    // 180.000 × 6 % (ITP_CCAA.madrid.tipoGeneral) = 10.800
    //   + notaría 700,921 (arancel 348,435226 × 0,95 × 1,21 = 400,526292, × 1,75)
    //   + registro 218,063 (180,212547 × 0,95 + 9,015182, con el 21 % de IVA)
    //   + gestoría 300 (GESTORIA_TIPICA, la cuarta partida del rótulo — hallazgo 673)
    //   = 12.018,984 → formatNumber(…, 0) = «12.019»
    // Recalculado a mano el 12/10/2026 con la rebaja del 5 % del nº 2.1 de los dos aranceles
    // (hallazgos 2901 y 2902); sin ella era «12.067».
    await expect(
      page.locator('input[aria-label="Impuestos y gastos que pagaste al comprar"]'),
    ).toHaveValue('12.019');
  });

  // ✅ REPARADO el 02/09/2026 (hallazgo 581) — el bloque educativo escribía a mano el tipo con el que
  // ESTA calculadora liquida la plusvalía («un tipo del 25%») y el techo legal («máximo
  // legal del 30%»), pudiendo leerlos de PLUSVALIA_MUNICIPAL_META (tipoOrientativo y
  // tipoMaximoLegal, data/fiscal/inmuebles.ts), que es de donde los toma el motor. Hoy
  // los tres coinciden; el día que el triaje fiscal mueva `tipoOrientativo`, el importe
  // cambiará y la frase que dice «esta calculadora aplica…» quedará mintiendo sobre la
  // propia calculadora. Es el mismo caso de RANGO_ITP y RANGO_AJD, ya derivados.
  // Este test es el guardián mientras el literal siga ahí: no falla hoy, falla el día
  // de la divergencia.
  test('REGRESIÓN (dato) — el tipo de plusvalía del bloque educativo debe seguir a data/fiscal', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
    // `.first()`: «plusvalía municipal» también titula una pregunta de la FAQ más abajo.
    const tarjeta = page
      .locator('div[class*="contentCard"]')
      .filter({ has: page.locator('h4', { hasText: 'Plusvalía municipal' }) })
      .first();
    await expect(tarjeta).toContainText(`tipo del ${PLUSVALIA_MUNICIPAL_META.tipoOrientativo} %`);
    await expect(tarjeta).toContainText(
      `máximo legal del ${PLUSVALIA_MUNICIPAL_META.tipoMaximoLegal} %`,
    );
  });

  // Mismo caso para los dos tipos de IVA del bloque educativo, que la propia página ya
  // importa de data/fiscal y usa en el aviso de VPO (page.tsx:826-828) pero escribe a
  // mano dos pantallas más abajo.
  test('REGRESIÓN (dato) — los tipos de IVA del bloque educativo deben seguir a data/fiscal', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
    const tarjeta = page.locator('h4', { hasText: 'Primera mano' }).locator('xpath=..');
    await expect(tarjeta).toContainText(`IVA al ${IVA_INMUEBLES_2025.obraNueva} %`);
    await expect(tarjeta).toContainText(`IVA al ${IVA_INMUEBLES_2025.local} %`);
  });

  // ✅ REPARADO el 02/09/2026 (hallazgo 583) — 14 emojis decorativos en nodo propio sin
  // `aria-hidden="true"` (page.tsx:626, 864, 1177, 1401, 1412, 1422, 1435, 1561, 1567,
  // 1573, 1579, 1585, 1593, 1605). El más visible es el 📍 que precede al nombre de la
  // comunidad autónoma: un lector de pantalla lo anuncia justo delante del dato que más
  // mueve el resultado. El resto de la app sí los marca.
  test('CASO 27 (accesibilidad) — el icono de la comunidad es decorativo y debe ir oculto', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await expect(page.locator('span[class*="infoCcaaIcon"]')).toHaveAttribute(
      'aria-hidden',
      'true',
    );
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// REGRESIÓN — hallazgo 584 (contenido, medio), REPARADO el 02/09/2026.
//
// La página publicaba TRES rangos distintos de notaría y registro para lo mismo: el
// FAQPage del JSON-LD decía «notaría 300 €-1.000 €» y «registro 100 €-600 €», el bloque
// visible «600 €-1.500 €» y «200 €-600 €», y otra pregunta del MISMO JSON-LD «700-900 €».
// Ninguno coincidía con lo que la app cobra —758,98 € de notaría para 200.000 €— y el peor
// era justo el que leen los asistentes de IA. Ahora los tres salen de `horquillaFedatarios`,
// que deriva del arancel (RD 1426/1989 y RD 1427/1989).
// ═════════════════════════════════════════════════════════════════════════════

test.describe('Regresión — hallazgo 584, reparado', () => {
  test('584 — el JSON-LD, el bloque visible y el motor dan la MISMA horquilla de notaría', async ({
    page,
  }) => {
    await page.goto(RUTA);

    // Lo que cobra el motor para 200.000 €, con la rebaja del 5 % del nº 2.1 (hallazgo 2901,
    // recalculado a mano el 12/10/2026): arancel 358,435226 × 0,95 × 1,21 = 412,021292, × 1,5 y
    // × 2 → 618,03 y 824,04. La pregunta del JSON-LD sobre la escritura notarial cita esa misma
    // pareja, redondeada a la decena: «entre 620 € y 820 €» (sin la rebaja era «650 € y 870 €»).
    const respuestas: string[] = await page.evaluate(() => {
      const salida: string[] = [];
      for (const s of Array.from(document.querySelectorAll('script[type="application/ld+json"]'))) {
        const datos = JSON.parse(s.textContent || '{}');
        const grafo = datos['@graph'] ?? [datos];
        for (const nodo of grafo) {
          if (nodo['@type'] !== 'FAQPage') continue;
          for (const q of nodo.mainEntity ?? []) salida.push(q.acceptedAnswer.text);
        }
      }
      return salida;
    });
    expect(respuestas.length).toBeGreaterThan(0);
    const todo = respuestas.join(' \u00b7 ').replace(ESPACIO_DURO, ' ');

    // Los tres rangos viejos, que se desmentían entre sí, ya no pueden aparecer.
    expect(todo).not.toContain('entre 300 € y 1.000 €');
    expect(todo).not.toContain('entre 100 € y 600 €');
    expect(todo).not.toContain('700-900 €');
    // Y el que sí aparece es el del arancel para 200.000 €.
    expect(todo).toContain('620 € y 820 €');

    // El bloque visible dice lo mismo para la banda de 100.000 € a 500.000 € (con la rebaja):
    //   notaría  100.000: 283,308711 × 0,95 × 1,21 × 1,5 = 488,50 → 500.000: 508,435226 × 0,95
    //            × 1,21 × 2 = 1.168,89 (redondeado a la decena: 490 € y 1.170 €; antes 510 y 1.230)
    //   registro (133,598684 × 0,95 + 9,015182) × 1,21 = 164,48 → (276,212547 × 0,95 + 9,015182)
    //            × 1,21 = 328,41 (160 € y 330 €; antes 170 y 350)
    const lista = page.getByText(/Notaría:\s*entre/);
    const texto = (await lista.innerText()).replace(ESPACIO_DURO, ' ').replace(/\s+/g, ' ');
    // es-ES no agrupa los millares de una cifra de cuatro dígitos: «1170 €», no «1.170 €».
    expect(texto).toContain('490 €');
    expect(texto).toContain('1170 €');
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// INSPECCIÓN 07/09/2026 — RE-INSPECCIÓN tras la reparación del 07/09
//
// La batería anterior (63 casos) pasa entera y ya no queda ningún `test.fail()`: los
// hallazgos de la vuelta del 02/09 —el crítico de «Estimar por mí», la escala progresiva,
// el perfil «Joven», los territorios sin IVA y el bloque de reinversión— cierran.
//
// Esta vuelta añade CUATRO caminos que ninguna de las anteriores había pisado, resueltos a
// mano ANTES de abrir el navegador:
//   · CASO 28 — Murcia (tipo general 7,75 %, sin escala) con perfil FAMILIA NUMEROSA, que
//     no se había probado nunca: su reducido del 3 % exige una renta que la app no
//     pregunta, así que tiene que quedarse en el aviso y NO en la cifra.
//   · CASO 29 — Valencia en el CANTO EXACTO de su escala (1.000.000 €), más un euro por
//     encima y 200.000 € por encima: es el único tramo del catálogo cuyo salto cae en una
//     cifra redonda que un usuario teclea de verdad.
//   · CASO 30 — «1.2.3», que el filtro del NumberInput SÍ deja entrar (solo cifras y
//     puntos) y tiene que rechazar el parser, no la máscara. Distinto de «doscientos mil»
//     (CASO 17), que ni siquiera llega al estado.
//   · CASO 31 — la exención de los mayores de 65 años SIN vivienda habitual, que no estaba
//     cubierta en 1.839 líneas de batería: es la única exención total del IRPF de la app y
//     concederla de más deja al vendedor con una liquidación entera sin provisionar.
//
// Y CUATRO hallazgos: H1 y H2 (medios), que se escribieron con `test.fail()`, y H3 y H4
// (bajos), que nacieron en verde porque eran candados sobre datos tecleados que todavía
// coincidían con la tabla.
//
// ── REPARADOS el 09/09/2026 (hallazgos 627 a 630) ────────────────────────────
// A H1 y H2 se les quitó el `test.fail()` y los cuatro se quedan como REGRESIÓN, que es de
// lo que se trataba: sujetan la reparación en vez de describir el defecto.
//   · 627 (H1) — `page.tsx` ya no le pasa al motor un perfil que el usuario no puede ver:
//     con inmueble no residencial se le pasa «general», porque su selector no está en
//     pantalla. El aviso de tipos reducidos desaparece con él.
//   · 628 (H2) — las tres horquillas salen ahora de `HORQUILLA_GASTOS_COMPRAVENTA`
//     (`metadata.ts`), derivada recorriendo las 19 comunidades y la banda de precios con
//     el mismo motor de la pantalla: 3,3 % - 12,6 %, que contiene el 6,65 % de Madrid y el
//     4,65 % del País Vasco.
//   · 629 (H3) — el AJD del caso «Carlos» sale de `calcularAJD` y su tipo de
//     `ITP_CCAA.valencia.ajd`.
//   · 630 (H4) — el IVA de la FAQ visible sale de `IVA_INMUEBLES_2025.obraNueva`.
// ═════════════════════════════════════════════════════════════════════════════

test.describe('Inspector 07/09/2026 — caminos nuevos', () => {
  /**
   * CASO 28 (normal) — Murcia, segunda mano, vivienda de 250.000 €, FAMILIA NUMEROSA.
   *
   * ITP: `elegirTipoITP('murcia', 'familia-numerosa', 250000, {viviendaHabitual:true})`.
   * El candidato «Familia numerosa» (3 %) exige ['Familia numerosa', 'Vivienda habitual',
   * 'Renta < 44.000 €'] y la renta NO es comprobable, así que NO se aplica: manda el tipo
   * general de ITP_CCAA.murcia.tipoGeneral = 7,75 (TIPOS_ITP_CCAA_2025, Ley 3/2025).
   *   ITP        = 250.000 × 7,75 %                              = 19.375,00 €
   * Recalculado a mano el 12/10/2026 con la rebaja del 5 % del nº 2.1 (hallazgos 2901 y 2902):
   *   Notaría    = arancel(250.000) × 0,95 × 1,21 × 1,75         =    771,33 €
   *     arancel = 90,151816 + 24.040,49×0,45 % + 30.050,60×0,15 % + 90.151,82×0,10 %
   *               + 99.746,97×0,05 % = 383,435226 → ×0,95 = 364,263465 → ×1,21 = 440,758792
   *               → ×1,75 = 771,327886 (sin la rebaja, 811,92)
   *   Registro   = (201,212547 × 0,95 + 6,010121 + 3,005061) × 1,21 = 242,202194 → 242,20 €
   *               (sin la rebaja, 254,37)
   *   Gestoría                                                    =    300,00 €
   *   AJD        = 0 (segunda mano: no hay tarjeta)
   *   Total      = 19.375,00 + 771,33 + 242,20 + 300,00          = 20.688,53 €
   *   % sobre precio = 20.688,53 / 250.000                        =      8,28 %
   *   Coste total = 250.000 + 20.688,53                          = 270.688,53 €
   */
  test('CASO 28 (normal) — Murcia, familia numerosa, 250.000 €: el reducido con límite de renta se enseña, no se cobra', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Segunda mano/ }).click();
    await page.locator('#ccaa-inmueble').selectOption('murcia');
    await rellenar(page, 'Precio de la vivienda', '250000');
    await rellenar(page, 'Gastos de gestoría del comprador (€)', '300');
    await page.locator('#perfil-comprador').selectOption('familia-numerosa');

    expect(ITP_CCAA.murcia.tipoGeneral).toBe(7.75);
    await expect(page.locator('h3', { hasText: 'ITP (7,75 %)' })).toBeVisible();
    expect(await valorTarjeta(page, /^ITP/)).toBe('19.375,00 €');
    expect(await valorTarjeta(page, /Gastos de notaría/)).toBe('771,33 €');
    expect(await valorTarjeta(page, /Registro de la Propiedad/)).toBe('242,20 €');
    expect(await valorTarjeta(page, /Gastos de gestoría/)).toBe('300,00 €');
    expect(await valorTarjeta(page, /^Total gastos adicionales/)).toBe('20.688,53 €');
    expect(await descripcionTarjeta(page, /^Total gastos adicionales/)).toBe('8,28 % sobre el precio');
    expect(await valorTarjeta(page, /COSTE TOTAL DE ADQUISICIÓN/)).toBe('270.688,53 €');

    // En segunda mano no hay AJD: la tarjeta no debe existir
    await expect(page.locator('h3', { hasText: /^AJD/ })).toHaveCount(0);

    // El 3 % de familia numerosa se ofrece como oportunidad, con su límite de renta a la vista
    const aviso = page.locator('div[class*="avisoReducidos"]');
    await expect(aviso).toContainText('3,00 % — Familia numerosa');
    await expect(aviso).toContainText('Renta < 44.000 €');
  });

  /**
   * CASO 29 (límite: el canto EXACTO de la escala) — Valencia, segunda mano, 1.000.000 €.
   *
   * ITP_CCAA.valencia.tramosProgresivos = [{hasta: 1.000.000, tipo: 9}, {∞, 11}]
   * En el canto, el primer tramo agota el valor y el 11 % NO puede tocar nada:
   *   ITP(1.000.000) = 1.000.000 × 9 %                            = 90.000,00 €  (9,00 %)
   *   ITP(1.000.001) = 90.000 + 1 × 11 %                          = 90.000,11 €  (9,00 %)
   *   ITP(1.200.000) = 90.000 + 200.000 × 11 %                    = 112.000,00 € (9,33 % efectivo)
   * Recalculado a mano el 12/10/2026 con la rebaja del 5 % del nº 2.1 (hallazgos 2901 y 2902):
   * Notaría(1.000.000): arancel = 90,151816 + 108,182205 + 45,0759 + 90,15182 + 225,379535
   *   + 119,69637 = 678,637646 → ×0,95 = 644,705764 → ×1,21 = 780,093974 → ×1,75 = 1.365,16 €
   *   (sin la rebaja, 1.437,01)
   * Registro(1.000.000) = (386,313757 × 0,95 + 6,010121 + 3,005061) × 1,21 = 454,98 € (antes 478,35)
   *   Total = 90.000,00 + 1.365,16 + 454,98 + 300,00              = 92.120,14 € (9,21 %)
   *   Coste total                                                  = 1.092.120,14 €
   */
  test('CASO 29 (límite) — Valencia en el canto de la escala: 1.000.000 € tributa entero al 9 %', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Segunda mano/ }).click();
    await page.locator('#ccaa-inmueble').selectOption('valencia');
    await rellenar(page, 'Precio de la vivienda', '1000000');
    await rellenar(page, 'Gastos de gestoría del comprador (€)', '300');

    // ⚠️ 24/09/2026 (hallazgos 1581 y 1602): este caso consagraba el cálculo EQUIVOCADO. El
    // 11 % valenciano no es un tramo sobre el exceso sino un UMBRAL sobre todo el valor: «Si
    // el valor […] fuera superior a 1.000.000 de euros, el tipo aplicable será el 11 %» (Ley
    // 13/1997, art. 13.Uno, texto consolidado del BOE). Hasta el 1.000.000 exacto, el 9 %.
    expect(ITP_CCAA.valencia.tramosProgresivos).toBeUndefined();
    expect(ITP_CCAA.valencia.umbralTipoUnico).toEqual({ superiorA: 1000000, tipo: 11 });
    await expect(page.locator('p', { hasText: 'sobre TODO el valor' }).first()).toContainText(
      'el tipo general es del 9 %, y si el valor supera 1.000.000 € pasa al 11 %',
    );

    expect(await valorTarjeta(page, /^ITP/)).toBe('90.000,00 €');
    await expect(page.locator('h3', { hasText: 'ITP (9,00 %)' })).toBeVisible();
    expect(await valorTarjeta(page, /Gastos de notaría/)).toBe('1365,16 €');
    expect(await valorTarjeta(page, /Registro de la Propiedad/)).toBe('454,98 €');
    expect(await valorTarjeta(page, /^Total gastos adicionales/)).toBe('92.120,14 €');
    expect(await descripcionTarjeta(page, /^Total gastos adicionales/)).toBe('9,21 % sobre el precio');
    expect(await valorTarjeta(page, /COSTE TOTAL DE ADQUISICIÓN/)).toBe('1.092.120,14 €');

    // Un euro por encima del canto: el 11 % grava TODO el valor → 1.000.001 × 11 % = 110.000,11
    await rellenar(page, 'Precio de la vivienda', '1000001');
    expect(await valorTarjeta(page, /^ITP/)).toBe('110.000,11 €');

    // Y 200.000 € por encima: 1.200.000 × 11 % = 132.000 (no los 112.000 de «9 % + 11 %»)
    await rellenar(page, 'Precio de la vivienda', '1200000');
    expect(await valorTarjeta(page, /^ITP/)).toBe('132.000,00 €');
    await expect(page.locator('h3', { hasText: 'ITP (11,00 %)' })).toBeVisible();
  });

  /**
   * CASO 30 (debe rechazarse) — «1.2.3» no es un precio.
   *
   * El filtro del NumberInput (`/^-?[\d.,]*$/`) lo deja ENTRAR —solo lleva cifras y
   * puntos— y su blur tampoco lo toca, porque `parseFloat('1.2.3')` da 1,2 y no es NaN.
   * Quien tiene que rechazarlo es `parseSpanishNumber`, que devuelve NaN con dos puntos
   * y ningún grupo de tres cifras (lib/formatters.ts: «1.2.3 no es un número»).
   * Esperado: las DOS pestañas se quedan en su marcador de posición y no aparece ni un
   * importe. Lo contrario sería cobrar un ITP sobre 1,2 € o sobre 123.
   */
  test('CASO 30 (debe rechazarse) — «1.2.3» pasa el filtro del campo pero no puede producir un importe', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await rellenar(page, 'Precio de la vivienda', '1.2.3');

    // El campo conserva lo tecleado (nadie lo ha "corregido" por detrás)
    await expect(page.locator('input[aria-label="Precio de la vivienda"]')).toHaveValue('1.2.3');

    // Escrito pero ilegible: se dice que no se lee, no que falta (hallazgo 1231).
    await expect(page.getByText('No se ha podido leer el precio «1.2.3»', { exact: false })).toBeVisible();
    await expect(page.locator('h3', { hasText: /^ITP/ })).toHaveCount(0);
    await expect(page.locator('h3', { hasText: /COSTE TOTAL/ })).toHaveCount(0);

    await page.getByRole('button', { name: 'Vendedor' }).click();
    await expect(page.locator('h3', { hasText: /IMPORTE NETO/ })).toHaveCount(0);
    await expect(page.locator('h3', { hasText: /^Precio de venta/ })).toHaveCount(0);
  });

  test('CASO 30 bis (control) — con un precio legible sí calcula', async ({ page }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Segunda mano/ }).click();
    await page.locator('#ccaa-inmueble').selectOption('madrid');
    await rellenar(page, 'Precio de la vivienda', '1.200');
    // «1.200» es el millar español: 1.200 × 6 % = 72,00 €
    expect(await valorTarjeta(page, /^ITP/)).toBe('72,00 €');
  });

  /**
   * CASO 31 (límite: exención que NO procede) — mayor de 65 años sin vivienda habitual.
   *
   * `exentoIRPF = vendedorMayor65 && esViviendaHabitual`. El art. 33.4.b LIRPF exige las
   * DOS cosas; con solo la edad, la ganancia tributa entera.
   * Venta 300.000 · compra 200.000 · 12 años · suelo 40.000 · catastral total 100.000 ·
   * comisión 3 % · sin gastos de adquisición ni mejoras ni otros gastos.
   *   Plusvalía municipal (12 años = 0,09 en el art. 107.4 TRLRHL, redacción del RDL 8/2023;
   *   era 0,08 con la tabla caducada, hallazgo 1559; tipo orientativo 25 %):
   *     objetivo = 40.000 × 0,09 × 25 %                            =    900,00 €
   *     real     = 100.000 × (40.000/100.000) × 25 %               = 10.000,00 €
   *     recomendado = min                                          =    900,00 € (objetivo)
   *   Comisión = 300.000 × 3 %                                     =  9.000,00 €
   *   Valor de adquisición = 200.000                               = 200.000,00 €
   *   Valor de transmisión = 300.000 − 9.000 − 900                 = 290.100,00 €
   *   Ganancia = 290.100 − 200.000                                 =  90.100,00 €
   *   IRPF = 6.000×19 % + 44.000×21 % + 40.100×23 %
   *        = 1.140 + 9.240 + 9.223                                 =  19.603,00 €
   *   Total gastos = 900 + 9.000 + 19.603                          =  29.503,00 €
   *   Neto = 300.000 − 29.503                                      = 270.497,00 €
   */
  test('CASO 31 (límite) — mayor de 65 años SIN vivienda habitual: la exención del art. 33.4.b no procede', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await rellenar(page, 'Precio de la vivienda', '300000');
    await page.getByRole('button', { name: 'Vendedor' }).click();
    await rellenar(page, 'Precio de compra original', '200000');
    await rellenar(page, 'Años de propiedad', '12');
    await rellenar(page, 'Valor catastral del suelo', '40000');
    await rellenar(page, 'Valor catastral total (suelo + construcción)', '100000');
    await page.getByRole('checkbox', { name: 'Es mi vivienda habitual' }).uncheck();
    await page.getByRole('checkbox', { name: 'Soy mayor de 65 años' }).check();

    expect(await valorTarjeta(page, /^Plusvalía municipal/)).toBe('900,00 €');
    expect(await descripcionTarjeta(page, /^Plusvalía municipal/)).toBe(
      'Método objetivo (más favorable)',
    );
    expect(await valorTarjeta(page, /^Valor de adquisición/)).toBe('200.000,00 €');
    expect(await valorTarjeta(page, /^Valor de transmisión/)).toBe('290.100,00 €');
    expect(await valorTarjeta(page, /^Ganancia patrimonial/)).toBe('90.100,00 €');
    expect(await valorTarjeta(page, /IRPF sobre ganancia/)).toBe('19.603,00 €');
    expect(await descripcionTarjeta(page, /IRPF sobre ganancia/)).toBe(
      'Tributación en base del ahorro. Calculado como si esta venta fuera tu única renta del ahorro del año: si tienes intereses, dividendos u otras ganancias, escríbelos arriba, porque la cuota puede ser mayor.',
    );
    expect(await valorTarjeta(page, /^Total gastos vendedor/)).toBe('29.503,00 €');
    expect(await valorTarjeta(page, /IMPORTE NETO VENDEDOR/)).toBe('270.497,00 €');
    // El neto está COMPLETO: no falta ninguna partida por descontar
    expect(await descripcionTarjeta(page, /IMPORTE NETO VENDEDOR/)).toBe(
      'Lo que realmente recibes',
    );
  });

  test('CASO 31 bis (control) — con vivienda habitual, la misma venta sí queda exenta', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await rellenar(page, 'Precio de la vivienda', '300000');
    await page.getByRole('button', { name: 'Vendedor' }).click();
    await rellenar(page, 'Precio de compra original', '200000');
    await rellenar(page, 'Años de propiedad', '12');
    await rellenar(page, 'Valor catastral del suelo', '40000');
    await rellenar(page, 'Valor catastral total (suelo + construcción)', '100000');
    await page.getByRole('checkbox', { name: 'Soy mayor de 65 años' }).check();
    // «Es mi vivienda habitual» viene marcada por defecto

    expect(await valorTarjeta(page, /IRPF sobre ganancia/)).toBe('EXENTO');
    expect(await descripcionTarjeta(page, /IRPF sobre ganancia/)).toBe(
      'Mayor de 65 años + vivienda habitual',
    );
    // Sin IRPF, el total del vendedor son plusvalía (900, RDL 8/2023) + comisión (9.000)
    expect(await valorTarjeta(page, /^Total gastos vendedor/)).toBe('9900,00 €');
    expect(await valorTarjeta(page, /IMPORTE NETO VENDEDOR/)).toBe('290.100,00 €');
  });

  /**
   * H1 (contenido, medio) — hallazgo 627, REPARADO el 09/09/2026. Queda como REGRESIÓN.
   *
   * El perfil del comprador sobrevivía al cambio de tipo de inmueble, y su selector
   * DESAPARECE al elegir uno no residencial (`esInmuebleResidencial` esconde el bloque).
   * Resultado: quien miraba primero una vivienda con perfil «Joven» y luego cambiaba a
   * «Local comercial» se llevaba un aviso «Podrías pagar menos» que le ofrecía el 3 % de
   * Murcia con el requisito «Vivienda habitual» impreso al lado —una condición que un
   * local no puede cumplir nunca— y no tenía ningún control en pantalla para deshacerlo.
   *
   * La regla ya existía en el motor: `elegirTipoITP` filtra por `viviendaHabitual` la lista
   * `alAlcanceDeCualquiera`. Lo que no filtra es la rama `candidatos → noComprobables`,
   * que es justo la que alimenta este aviso. La reparación va en la app, que es donde está
   * el defecto: con inmueble no residencial se llama al motor con perfil «general», porque
   * un perfil que el usuario no puede ver ni cambiar no puede seguir decidiendo lo que se
   * le ofrece. El ITP no se mueve (el reducido tampoco se aplicaba); lo que desaparece es
   * la oferta imposible.
   *
   * Es el mismo criterio del comentario de `elegirTipoITP`: «se enseña como oportunidad,
   * nunca como cifra» — pero una oportunidad imposible no es una oportunidad.
   */
  test('H1 (regresión) — un local comercial no puede recibir la oferta de un tipo de VIVIENDA HABITUAL', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Segunda mano/ }).click();
    await page.locator('#ccaa-inmueble').selectOption('murcia');
    await rellenar(page, 'Precio de la vivienda', '250000');
    await page.locator('#perfil-comprador').selectOption('joven');
    // Con vivienda el reducido SÍ se aplica: 250.000 × 3 % = 7.500 €
    expect(await valorTarjeta(page, /^ITP/)).toBe('7500,00 €');

    await page.getByRole('button', { name: /Local comercial/ }).click();
    // El selector de perfil ya no está: el usuario no puede volver a «General»
    await expect(page.locator('#perfil-comprador')).toHaveCount(0);
    // Y el ITP vuelve al general, que es correcto
    expect(await valorTarjeta(page, /^ITP/)).toBe('19.375,00 €');

    // Lo que NO debe quedar es la oferta de un tipo reservado a la vivienda habitual
    await expect(page.locator('div[class*="avisoReducidos"]')).toHaveCount(0);
  });

  /**
   * H2 (contenido, medio) — hallazgo 628, REPARADO el 09/09/2026. Queda como REGRESIÓN.
   *
   * La app publicaba TRES horquillas incompatibles de «cuánto hay que sumar al precio», y
   * NINGUNA contenía lo que su propio motor calcula para la comunidad que viene elegida
   * por defecto:
   *   · paso 1 del bloque visible ... «entre un 10% y 15% adicional»
   *   · JSON-LD (WebApplication+FAQ) .. «del 10% al 14% ... segunda mano y del 12% al 15% en obra nueva»
   *   · JSON-LD (FAQPage) ............ «entre el 8 % y el 13 % del precio de compra»
   * Motor, Madrid segunda mano 200.000 € → 6,65 %. País Vasco, 4,65 %.
   *
   * Es la familia del hallazgo 584 (tres rangos para lo mismo, ninguno igual al motor),
   * que se cerró para notaría y registro derivándolos del arancel — pero la cifra de
   * cabecera de toda la app, la que el comprador usa para saber cuánto ahorrar aparte,
   * se había quedado escrita a mano en los tres sitios.
   *
   * Ahora las tres salen de `HORQUILLA_GASTOS_COMPRAVENTA` (`metadata.ts`), que recorre las
   * 19 comunidades en la banda de BANDA_PRECIO_VIVIENDA reproduciendo las dos ramas del
   * cálculo (ITP en segunda mano · IVA + AJD en obra nueva, más notaría, registro y
   * gestoría) y redondea sus extremos hacia fuera: 3,3 % - 12,6 %.
   *
   * El test no comprueba esos dos números, sino la propiedad que importa y que se rompió:
   * que lo que la app manda provisionar CONTENGA lo que ella misma cobra. Se mide en las
   * dos comunidades que el hallazgo nombra, que son los extremos vivos del catálogo.
   */
  test('H2 (regresión) — el porcentaje que el paso 1 manda provisionar tiene que contener al que calcula la app', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Segunda mano/ }).click();
    await page.locator('#ccaa-inmueble').selectOption('madrid');
    await rellenar(page, 'Precio de la vivienda', '200000');

    // Madrid · 200.000 €: 12.000 + 721,04 + 224,96 + 300 = 13.246,00 → 6,62 % (con la rebaja del
    // 5 % del nº 2.1 de los dos aranceles, hallazgos 2901 y 2902; recalculado a mano el
    // 12/10/2026 como en el CASO 1. Sin la rebaja era 6,65 %)
    const desc = await descripcionTarjeta(page, /^Total gastos adicionales/);
    const pct = parseSpanishNumber(desc.match(/([\d,]+)\s?%/)![1]);
    expect(pct).toBeCloseTo(6.62, 2);

    // Y el otro extremo que nombra el hallazgo: País Vasco sobre el mismo precio.
    //   ITP 200.000 × 4 % = 8.000 · Notaría 721,04 · Registro 224,96 · Gestoría 300
    //   Total 9.246,00 € → 4,62 % del precio (sin la rebaja, 9.295,20 € y 4,65 %)
    await page.locator('#ccaa-inmueble').selectOption('pais-vasco');
    await expect
      .poll(() => descripcionTarjeta(page, /^Total gastos adicionales/))
      .toContain('4,62 %');
    const pctPv = 4.62;

    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
    const paso1 = await page
      .locator('li', { hasText: 'Calcula el presupuesto total antes de firmar' })
      .first()
      .innerText();
    // La horquilla se publica con decimales («3,3%»), así que el regex admite la coma.
    const rango = paso1.match(/entre un ([\d,]+)\s?% y un ([\d,]+)\s?%/)!;
    const min = Number(rango[1].replace(',', '.'));
    const max = Number(rango[2].replace(',', '.'));
    for (const medido of [pct, pctPv]) {
      expect(medido).toBeGreaterThanOrEqual(min);
      expect(medido).toBeLessThanOrEqual(max);
    }
  });

  /**
   * H3 (dato, bajo) — hallazgo 629, REPARADO el 09/09/2026. Queda como REGRESIÓN.
   *
   * `page.tsx` publicaba «más el 1,5% de AJD (2.700 €)» para una obra nueva en Valencia
   * mientras la misma página importaba `ITP_CCAA` y calculaba ese AJD tres pantallas más
   * arriba. Coincidía (ITP_CCAA.valencia.ajd = 1,5), así que no había ninguna cifra mal:
   * lo que faltaba era el vínculo. Es el caso del hallazgo 434 —cuatro comunidades
   * nombradas a mano en el JSON-LD— repetido en el bloque educativo, y lo mismo que ya hizo
   * Valencia con su ITP (10 → 9 % el 01/06/2026) podía hacerlo con el AJD sin que nada
   * avisara.
   *
   * Ahora el tipo sale de `ITP_CCAA[...].ajd`, el importe de `calcularAJD` —el mismo motor
   * de la tarjeta— y el precio del ejemplo de una constante, `EJEMPLO_OBRA_NUEVA`, de la
   * que cuelgan también el IVA y el total. Este test es el candado: si el AJD de Valencia
   * se mueve, el ejemplo se mueve con él en vez de envejecer en silencio.
   */
  test('H3 (regresión) — el AJD del ejemplo de obra nueva debe seguir a ITP_CCAA.valencia.ajd', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
    const caso = page.locator('div[class*="casoCard"]', { hasText: 'Carlos' }).first();
    const ajdPct = String(ITP_CCAA.valencia.ajd).replace('.', ',');
    await expect(caso).toContainText(`${ajdPct} % de AJD`);
    // Y su importe: 180.000 × 1,5 %. El ejemplo escribía «2.700 €» con punto de millar, que
    // no es lo que produce el formateador de la app para esa cifra —la tarjeta de AJD dice
    // «2700,00 €» (CASO 8)—, y esa fue la señal de que iba tecleado. Se comparan las cifras
    // sin millares para que el test no dependa de cuál de los dos formatos salga.
    // Redondeado: con el 1,4 % de 2026, 180.000 × 1,4 / 100 da 2519,9999999999995 en coma
    // flotante, y el ejemplo escribe euros enteros (2.520 €).
    const cuota = Math.round((180000 * ITP_CCAA.valencia.ajd) / 100);
    const sinMillares = (await caso.innerText()).replace(/\./g, '');
    expect(sinMillares).toContain(`${cuota} €`);
  });

  /**
   * H4 (dato, bajo) — hallazgo 630, REPARADO el 09/09/2026. Queda como REGRESIÓN.
   *
   * `page.tsx` decía «el IVA al 10% se paga en viviendas nuevas» con el 10 tecleado,
   * mientras la MISMA pregunta del JSON-LD (`metadata.ts`) ya lo interpolaba desde
   * `IVA_INMUEBLES_2025.obraNueva`. El bloque «Primera mano» de más arriba también lo
   * deriva, y desde el 02/09 tiene su propio candado: esta FAQ se había quedado fuera de
   * aquel barrido siendo el mismo dato en la misma página. Ya sale de la ficha.
   */
  test('H4 (regresión) — el IVA de la FAQ visible debe seguir a IVA_INMUEBLES_2025', async ({ page }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
    const faq = page
      .locator('div[class*="faqItem"]')
      .filter({ has: page.locator('h4', { hasText: '¿Qué diferencia hay entre ITP e IVA' }) })
      .first();
    await expect(faq).toContainText(`IVA al ${IVA_INMUEBLES_2025.obraNueva} %`);
  });

  /**
   * CASO 32 (control de la vuelta) — País Vasco, obra nueva: un 0 que SÍ es correcto.
   *
   * `ITP_CCAA['pais-vasco'].ajd = 0` (régimen foral), así que la tarjeta de AJD no se
   * pinta —el guard es `ajd > 0`— y eso es lo que debe pasar: aquí el cero no es un dato
   * que falte, es que no se devenga. Se dejó como control junto a H1 y H2, que sí eran
   * hallazgos, para que se vea que la ausencia de una tarjeta no siempre es un defecto.
   *   IVA        = 200.000 × 10 %                                  = 20.000,00 €
   *   Notaría    = 721,04 € · Registro = 224,96 € · Gestoría = 300 € (con la rebaja del 5 % del
   *                nº 2.1, hallazgos 2901 y 2902; recalculado a mano el 12/10/2026 como en el
   *                CASO 1. Sin la rebaja: 758,98 y 236,22)
   *   Total      = 21.246,00 € (10,62 %) · Coste total = 221.246,00 €
   */
  test('CASO 32 (control) — País Vasco, obra nueva: sin AJD porque su régimen foral no lo cobra', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Primera mano/ }).click();
    await page.locator('#ccaa-inmueble').selectOption('pais-vasco');
    await rellenar(page, 'Precio de la vivienda', '200000');

    // ⚠️ 24/09/2026 (hallazgos 1583 y 1592): el 0 es de la VIVIENDA, no de toda la comunidad.
    // El AJD foral es el 0,5 % (NF 1/2011 de Bizkaia, art. 44.1) y la exención es de la
    // primera transmisión de vivienda (art. 58.35). El control sigue valiendo para la vivienda.
    expect(ITP_CCAA['pais-vasco'].ajdVivienda).toBe(0);
    expect(ITP_CCAA['pais-vasco'].ajd).toBe(0.5);
    expect(await valorTarjeta(page, /^IVA/)).toBe('20.000,00 €');
    await expect(page.locator('h3', { hasText: /^AJD/ })).toHaveCount(0);
    expect(await valorTarjeta(page, /^Total gastos adicionales/)).toBe('21.246,00 €');
    expect(await valorTarjeta(page, /COSTE TOTAL DE ADQUISICIÓN/)).toBe('221.246,00 €');

    // Y un local nuevo en el mismo sitio SÍ paga AJD: 200.000 × 0,5 % = 1.000; IVA 21 % = 42.000
    await page.getByRole('button', { name: /Local comercial/ }).click();
    await expect(page.locator('h3', { hasText: /^AJD/ }).first()).toHaveText('AJD (0,50 %)');
    expect(await valorTarjeta(page, /^AJD/)).toBe('1000,00 €');
    expect(await valorTarjeta(page, /^IVA/)).toBe('42.000,00 €');
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// INSPECCIÓN 10/09/2026 — RE-INSPECCIÓN tras el refactor de motores
//
// La app vuelve a la cola porque sus dependencias se movieron: el 09/09 (579b3a05) se
// reparó `calcularPlusvaliaMunicipal` para que «menos de 1 año» dejara de ser inalcanzable
// y se creó `IVA_INMUEBLES_2025.anejoVinculado`, y el 10/09 (1808419c) se retiraron 86
// motores de `lib/calculadoras/`. Los 74 casos anteriores pasan enteros.
//
// Esta vuelta añade TRES caminos nuevos, resueltos a mano ANTES de abrir el navegador:
//   · CASO 33 (normal)   — Cantabria, 300.000 €, LAS DOS PESTAÑAS de la misma operación.
//     Cantabria no se había probado nunca: tipo general 9 % sin escala progresiva y con un
//     reducido «Municipios despoblados» que NO es de colectivo, así que sale como aviso
//     incluso con perfil General.
//   · CASO 34 (límite)   — la REVENTA ANTES DEL AÑO (0 años de tenencia), que es el
//     coeficiente 0,14 de COEFICIENTES_IIVTNU_2025, el tercero más alto de la tabla.
//   · CASO 35 (rechazo)  — un precio NEGATIVO, que no puede producir ni un ITP negativo ni
//     un coste total por debajo del precio, ni antes ni después de salir del campo.
//
// Y CUATRO hallazgos, los cuatro RESIDUOS DE REPARACIÓN (una corrección que llegó al motor
// o a las apps hermanas y no a esta), declarados entonces con el modificador `test.fail(...)`:
// afirmaban lo que DEBERÍA ocurrir. Están REPARADOS y ya son `test(`, como regresión.
// ═════════════════════════════════════════════════════════════════════════════

test.describe('Inspector 10/09/2026 — re-inspección tras el refactor de motores', () => {
  /**
   * CASO 33 (normal) — Cantabria, segunda mano, vivienda de 300.000 €, perfil General.
   *
   * ── COMPRADOR ─────────────────────────────────────────────────────────────
   * ITP_CCAA.cantabria.tipoGeneral = tipoGeneralDe('Cantabria') = 9 (TIPOS_ITP_CCAA_2025,
   * `data/fiscal/inmuebles.ts`). Cantabria NO tiene `tramosProgresivos`, así que el ITP es
   * plano, y ninguno de sus reducidos se puede aplicar con perfil General:
   *   ITP        = 300.000 × 9 %                                  = 27.000,00 €
   * Notaría y registro recalculados a mano el 12/10/2026 con la rebaja del 5 % del nº 2.1
   * (hallazgos 2901 y 2902):
   *   Notaría    = arancel(300.000) × 0,95 × 1,21 × 1,75          =    821,62 €
   *     arancel = 90,151816 + 24.040,49×0,45 % + 30.050,60×0,15 %
   *               + 90.151,82×0,10 % + 149.746,97×0,05 % = 408,435226
   *               → ×0,95 = 388,013465 → ×1,21 = 469,496292 → ×1,75 = 821,618511
   *               (RD 1426/1989 nº 2 + FACTURA_NOTARIAL; sin la rebaja, 864,86)
   *     horquilla: ×1,5 = 704,24 € y ×2 = 938,99 € (antes 741,31 y 988,41)
   *   Registro   = (216,212547 × 0,95 + 6,010121 + 3,005061) × 1,21 =  259,44 € (antes 272,52)
   *     (RD 1427/1989 nº 2, más el asiento de presentación nº 1 y la nota simple nº 4)
   *   Gestoría (GESTORIA_TIPICA)                                   =    300,00 €
   *   AJD        = 0 — segunda mano, no se pinta la tarjeta
   *   Total gastos = 27.000,00 + 821,62 + 259,44 + 300,00         = 28.381,06 €
   *   % sobre precio = 28.381,06 / 300.000                         =      9,46 %
   *   Coste total  = 300.000 + 28.381,06                          = 328.381,06 €
   *
   * ── VENDEDOR ──────────────────────────────────────────────────────────────
   * Compra 200.000 €, 10 años, suelo catastral 60.000 €, total catastral 100.000 €,
   * comisión 3 %, sin otros gastos, sin gastos de adquisición, vivienda habitual, < 65 años.
   *   Plusvalía objetivo = 60.000 × 0,12 × 25 %                    =  1.800,00 €
   *     (art. 107.4 TRLRHL en la redacción del RDL 8/2023 → 10 años = 0,12; era 0,08 con la
   *      tabla caducada del RDL 26/2021, hallazgo 1559 · tipoOrientativo = 25)
   *   Plusvalía real     = (300.000 − 200.000) × 0,6 × 25 %        = 15.000,00 €
   *     → gana el OBJETIVO, que es el menor (art. 107.5 TRLHL)
   *   Comisión           = 300.000 × 3 %                           =  9.000,00 €
   *   Valor adquisición  = 200.000                                 = 200.000,00 €
   *   Valor transmisión  = 300.000 − 9.000 − 1.800                 = 289.200,00 €
   *   Ganancia           = 289.200 − 200.000                       =  89.200,00 €
   *   IRPF (base del ahorro, TRAMOS_GANANCIAS_PATRIMONIALES_2025):
   *     6.000×19 % = 1.140 · 44.000×21 % = 9.240 · 39.200×23 % = 9.016
   *                                                              =  19.396,00 €
   *   Total gastos vendedor = 1.800 + 9.000 + 19.396              =  30.196,00 €
   *   Neto               = 300.000 − 30.196                        = 269.804,00 €
   */
  test('CASO 33 (normal) — Cantabria, 300.000 €: las dos pestañas de la misma operación', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Segunda mano/ }).click();
    await page.locator('#ccaa-inmueble').selectOption('cantabria');
    await rellenar(page, 'Precio de la vivienda', '300000');
    await rellenar(page, 'Gastos de gestoría del comprador (€)', '300');

    // El tipo general se lee de la tabla, no de la memoria del test
    expect(ITP_CCAA.cantabria.tipoGeneral).toBe(9);
    expect(ITP_CCAA.cantabria.tramosProgresivos).toBeUndefined();

    expect(await valorTarjeta(page, /^ITP/)).toBe('27.000,00 €');
    // Tipo EFECTIVO: sin escala progresiva coincide con el nominal
    expect(await page.locator('h3', { hasText: /^ITP/ }).first().innerText()).toBe('ITP (9,00\u00A0%)');
    // En segunda mano no hay AJD de compraventa
    await expect(page.locator('h3', { hasText: /^AJD/ })).toHaveCount(0);
    expect(await valorTarjeta(page, /Gastos de notaría/)).toBe('821,62 €');
    expect(await descripcionTarjeta(page, /Gastos de notaría/)).toContain(
      'entre 704,24 € y 938,99 €',
    );
    expect(await valorTarjeta(page, /Registro de la Propiedad/)).toBe('259,44 €');
    expect(await valorTarjeta(page, /Gastos de gestoría/)).toBe('300,00 €');
    expect(await valorTarjeta(page, /Total gastos adicionales/)).toBe('28.381,06 €');
    expect(await descripcionTarjeta(page, /Total gastos adicionales/)).toBe('9,46 % sobre el precio');
    expect(await valorTarjeta(page, /COSTE TOTAL DE ADQUISICIÓN/)).toBe('328.381,06 €');

    // Con perfil General, «Municipios despoblados» (4 %) no se aplica pero SÍ se ofrece:
    // no es un tipo de colectivo, así que entra en `alAlcanceDeCualquiera`.
    await expect(page.getByText('4,00 % — Municipios despoblados')).toBeVisible();

    // ── Vendedor ──
    await page.getByRole('button', { name: 'Vendedor' }).click();
    await rellenar(page, 'Precio de compra original', '200000');
    await rellenar(page, 'Años de propiedad', '10');
    await rellenar(page, 'Valor catastral del suelo', '60000');
    await rellenar(page, 'Valor catastral total (suelo + construcción)', '100000');
    await rellenar(page, 'Comisión inmobiliaria (%)', '3');

    // es-ES no agrupa los millares de una cifra de cuatro dígitos: «1800,00 €», no «1.800,00 €»
    expect(await valorTarjeta(page, /^Plusvalía municipal/)).toBe('1800,00 €');
    expect(await descripcionTarjeta(page, /^Plusvalía municipal/)).toBe(
      'Método objetivo (más favorable)',
    );
    expect(await valorTarjeta(page, /^Valor de adquisición/)).toBe('200.000,00 €');
    expect(await valorTarjeta(page, /^Valor de transmisión/)).toBe('289.200,00 €');
    expect(await valorTarjeta(page, /^Ganancia patrimonial/)).toBe('89.200,00 €');
    expect(await valorTarjeta(page, /^IRPF sobre ganancia/)).toBe('19.396,00 €');
    expect(await valorTarjeta(page, /^Comisión inmobiliaria/)).toBe('9000,00 €');
    expect(await valorTarjeta(page, /^Total gastos vendedor/)).toBe('30.196,00 €');
    expect(await valorTarjeta(page, /IMPORTE NETO VENDEDOR/)).toBe('269.804,00 €');
    // El neto está COMPLETO: no falta ninguna partida por descontar
    expect(await descripcionTarjeta(page, /IMPORTE NETO VENDEDOR/)).toBe('Lo que realmente recibes');
  });

  /**
   * CASO 34 bis (control) — el mismo caso con 1 AÑO de tenencia, que sí funciona.
   *
   * Coeficiente del art. 107.4 TRLRHL para 1 año en la redacción del RDL 8/2023 = 0,15 (era
   * 0,13 con la tabla caducada del RDL 26/2021, hallazgo 1559):
   *   Plusvalía objetivo = 60.000 × 0,15 × 25 % = 2.250,00 €
   * Sirve para aislar el CASO 34: lo que falla no es el año 1, es el año 0.
   */
  test('CASO 34 bis (control) — 1 año de tenencia liquida con el coeficiente del primer año', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await page.locator('#ccaa-inmueble').selectOption('cantabria');
    await rellenar(page, 'Precio de la vivienda', '300000');
    await page.getByRole('button', { name: 'Vendedor' }).click();
    await rellenar(page, 'Precio de compra original', '200000');
    await rellenar(page, 'Años de propiedad', '1');
    await rellenar(page, 'Valor catastral del suelo', '60000');
    await rellenar(page, 'Valor catastral total (suelo + construcción)', '100000');
    await rellenar(page, 'Comisión inmobiliaria (%)', '3');

    expect(COEFICIENTES_IIVTNU_2025.find((c) => c.anios === 1)?.coeficiente).toBe(0.15);
    expect(await valorTarjeta(page, /^Plusvalía municipal/)).toBe('2250,00 €');
  });

  /**
   * ⚠️ HALLAZGO 10/09/2026 (ALTO) — CASO 34 (límite): la REVENTA ANTES DEL AÑO.
   *
   * `COEFICIENTES_IIVTNU_2025` tiene fila propia para `anios: 0` («Menos de 1 año»), con
   * coeficiente 0,14 — el TERCERO MÁS ALTO de la tabla, por encima del año 1 (0,13). Desde
   * el RDL 26/2021 la reventa antes del año SÍ tributa, y el 09/09/2026 se reparó
   * `calcularPlusvaliaMunicipal` para que ese coeficiente dejara de ser inalcanzable
   * (hallazgo 666), y con él `simulador-gastos-compraventa-local-comercial`, que hoy lee
   * los años del STRING para distinguir «0» del campo VACÍO y deja `min={0}` en su campo.
   *
   * A ESTA app, que es el hub del clúster, la reparación no llegó:
   *   · `<NumberInput label="Años de propiedad" min={1} />` — el blur del componente
   *     REESCRIBE el campo de «0» a «1» sin decir nada, y
   *   · `const anios = parseInt(aniosPropiedad) || 0` + `anios > 0` — mientras el campo
   *     conserva el 0, la plusvalía sale «Sin calcular» y NO entra en el neto.
   *
   * Los dos caminos dan un impuesto por debajo del real, y el segundo lo deja fuera del
   * neto entero. Caso: venta 300.000 €, compra 200.000 €, suelo catastral 60.000 €, total
   * 100.000 €, comisión 3 %, 0 años de tenencia.
   *
   *   Esperado (coeficiente 0,14):
   *     Plusvalía          = 60.000 × 0,14 × 25 %                  =  2.100,00 €
   *     Valor transmisión  = 300.000 − 9.000 − 2.100               = 288.900,00 €
   *     Ganancia           = 288.900 − 200.000                     =  88.900,00 €
   *     IRPF   = 6.000×19 % + 44.000×21 % + 38.900×23 %            =  19.327,00 €
   *     Total gastos       = 2.100 + 9.000 + 19.327                =  30.427,00 €
   *     Neto               = 300.000 − 30.427                      = 269.573,00 €
   *
   *   Obtenido: el campo se reescribe a «1» y liquida con 0,13 →
   *     Plusvalía 1.950,00 € · transmisión 289.050,00 € · ganancia 89.050,00 € ·
   *     IRPF 19.361,50 € · total 30.311,50 € · neto 269.688,50 €
   *     (y sin salir del campo: «Sin calcular», con el neto rotulado INCOMPLETO)
   *
   * ⚠️ 24/09/2026 (hallazgo 1560): el esperado de arriba también estaba mal. El coeficiente de
   * «Menos de 1 año» es ANUAL y el art. 107.4 TRLRHL lo prorratea por meses completos («En el
   * caso de que el periodo de generación sea inferior a un año, se prorrateará el coeficiente
   * anual teniendo en cuenta el número de meses completos», BOE-A-2004-4214, verificado ese
   * día). Aplicarlo entero superaba lo que la ley permite para CUALQUIER reventa dentro del año.
   * Ahora la app pregunta los meses completos y, mientras no se eligen, la plusvalía falta:
   *   coeficiente vigente (RDL 8/2023) = 0,15 · con 6 meses: 0,15 × 6/12 = 0,075
   *     Plusvalía          = 60.000 × 0,075 × 25 %                 =  1.125,00 €
   *     Valor transmisión  = 300.000 − 9.000 − 1.125               = 289.875,00 €
   *     Ganancia           = 289.875 − 200.000                     =  89.875,00 €
   *     IRPF   = 6.000×19 % + 44.000×21 % + 39.875×23 %            =  19.551,25 €
   *     Total gastos       = 1.125 + 9.000 + 19.551,25             =  29.676,25 €
   *     Neto               = 300.000 − 29.676,25                   = 270.323,75 €
   *   y con 11 meses (el máximo): 60.000 × 0,15 × 11/12 × 25 %     =  2.062,50 €
   */
  test(
    'CASO 34 (límite) — 0 años de tenencia: la reventa antes del año prorratea el coeficiente por meses completos',
    async ({ page }) => {
      await page.goto(RUTA);
      await page.locator('#ccaa-inmueble').selectOption('cantabria');
      await rellenar(page, 'Precio de la vivienda', '300000');
      await page.getByRole('button', { name: 'Vendedor' }).click();
      await rellenar(page, 'Precio de compra original', '200000');
      await rellenar(page, 'Valor catastral del suelo', '60000');
      await rellenar(page, 'Valor catastral total (suelo + construcción)', '100000');
      await rellenar(page, 'Comisión inmobiliaria (%)', '3');

      // El coeficiente ANUAL de «Menos de 1 año» (RDL 8/2023)
      expect(COEFICIENTES_IIVTNU_2025.find((c) => c.anios === 0)?.coeficiente).toBe(0.15);

      const campoAnios = page.locator('input[aria-label="Años de propiedad"]');
      await campoAnios.fill('0');
      await campoAnios.blur();

      // 1) El campo no puede reescribirse solo: «0 años» es un dato válido, no un error
      expect(await campoAnios.inputValue()).toBe('0');
      // 2) Sin los meses completos la plusvalía FALTA, como cualquier dato vacío
      expect(await valorTarjeta(page, /^Plusvalía municipal/)).toBe('Sin calcular');
      expect(await descripcionTarjeta(page, /^Plusvalía municipal/)).toContain(
        'Faltan los meses completos desde la compra',
      );
      expect(await descripcionTarjeta(page, /IMPORTE NETO VENDEDOR/)).toContain(
        'Elige los meses completos desde la compra para obtenerlo.',
      );
      // 3) Con 6 meses completos, el coeficiente anual prorrateado
      await page.locator('#meses-completos').selectOption('6');
      expect(await valorTarjeta(page, /^Plusvalía municipal/)).toBe('1125,00 €');
      expect(await valorTarjeta(page, /^Valor de transmisión/)).toBe('289.875,00 €');
      expect(await valorTarjeta(page, /^Ganancia patrimonial/)).toBe('89.875,00 €');
      expect(await valorTarjeta(page, /^IRPF sobre ganancia/)).toBe('19.551,25 €');
      expect(await valorTarjeta(page, /^Total gastos vendedor/)).toBe('29.676,25 €');
      expect(await valorTarjeta(page, /IMPORTE NETO VENDEDOR/)).toBe('270.323,75 €');
      // 4) Y con 11, el máximo que cabe por debajo del año: sigue por debajo del año entero
      await page.locator('#meses-completos').selectOption('11');
      expect(await valorTarjeta(page, /^Plusvalía municipal/)).toBe('2062,50 €');
    },
  );

  /**
   * CASO 35 (debe rechazarse) — un precio NEGATIVO no puede producir ningún importe.
   *
   * −250.000 € pasa el filtro del NumberInput (su regex admite el signo menos), así que la
   * guarda tiene que estar en el cálculo y no en la máscara. Ni mientras el campo tiene el
   * foco —donde el componente todavía no ha normalizado nada— ni después de salir de él
   * puede aparecer un ITP negativo, un coste total por debajo del precio ni un neto de
   * vendedor inventado. Es el simétrico del CASO C (0 €) y del CASO 30 («1.2.3»): aquellos
   * comprobaban el cero y lo ilegible; este, el signo.
   */
  test('CASO 35 (debe rechazarse) — un precio negativo no produce ni impuesto ni total, en ninguna pestaña', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await page.locator('#ccaa-inmueble').selectOption('cantabria');
    const campoPrecio = page.locator('input[aria-label="Precio de la vivienda"]');

    // a) Con el foco todavía dentro: el componente no ha normalizado y el cálculo tiene que cortar
    await campoPrecio.fill('-250000');
    expect(await campoPrecio.inputValue()).toBe('-250000');
    await expect(page.locator('h3', { hasText: /^ITP/ })).toHaveCount(0);
    await expect(page.locator('h3', { hasText: /COSTE TOTAL/ })).toHaveCount(0);
    await expect(page.getByText('El precio escrito («-250000») tiene que ser mayor que 0')).toBeVisible();

    // b) La pestaña Vendedor tampoco puede inventarse un neto
    await page.getByRole('button', { name: 'Vendedor' }).click();
    // Al pulsar la pestaña, el campo pierde el foco y el NumberInput lo acota a «0».
    await expect(page.getByText('El precio de venta escrito («0») tiene que ser mayor que 0')).toBeVisible();
    await expect(page.locator('h3', { hasText: /IMPORTE NETO VENDEDOR/ })).toHaveCount(0);

    // c) Al salir del campo, el NumberInput lo acota a su `min` y sigue sin haber importes
    // (08/10/2026: el «Introduce el precio…» con «-250000» o «0» a la vista era el hallazgo 2960 del
    // patrón 5, REPARADO: cambiaron los textos de este caso, no los importes)
    await page.getByRole('button', { name: 'Comprador' }).click();
    await campoPrecio.blur();
    expect(await campoPrecio.inputValue()).toBe('0');
    await expect(page.locator('h3', { hasText: /^ITP/ })).toHaveCount(0);
    await expect(page.getByText('El precio escrito («0») tiene que ser mayor que 0')).toBeVisible();
  });

  /**
   * ⚠️ HALLAZGO 10/09/2026 (BAJO) — el IVA del garaje y del trastero se lee de la
   * constante de la VIVIENDA, no de la del anejo.
   *
   * El 09/09/2026 (hallazgo 641) `IVA_INMUEBLES_2025.garageCon` pasó a llamarse
   * `anejoVinculado`, con el art. 91.Uno.1.7º LIVA citado, y las apps de garaje y trastero
   * se apuntaron a ella. Este estimador ofrece «Garaje/Parking» y «Trastero» en su selector
   * y afirma en su propio texto de derivación «Aquí se aplica siempre el 10%», pero calcula
   * con `IVA_INMUEBLES_2025.obraNueva`.
   *
   * Hoy las dos constantes valen 10, así que NINGUNA cifra está mal — existen separadas
   * precisamente para poder divergir, y el día que lo hagan esta app se quedará atrás sin
   * que nada avise. Es el mismo candado de fuente que ya sujeta al trastero.
   *
   * Caso: garaje de 30.000 €, Madrid, primera mano → IVA 3.000,00 € leyendo `obraNueva`
   * (esperado: la misma cifra, pero leída de `anejoVinculado`).
   */
  test(
    'HALLAZGO — el IVA del anejo debe salir de anejoVinculado, no de obraNueva',
    async ({ page }) => {
      await page.goto(RUTA);
      await page.getByRole('button', { name: /Primera mano/ }).click();
      await page.locator('#ccaa-inmueble').selectOption('madrid');
      await page.getByRole('button', { name: /Garaje\/Parking/ }).click();
      await rellenar(page, 'Precio del inmueble', '30000');

      // La cifra de hoy es correcta porque las dos constantes coinciden…
      expect(IVA_INMUEBLES_2025.anejoVinculado).toBe(IVA_INMUEBLES_2025.obraNueva);
      expect(await valorTarjeta(page, /^IVA/)).toBe('3000,00 €');

      // …pero la rama de anejos tiene que leer la constante del ANEJO, como el motor del clúster
      const fuente = readFileSync(
        join(process.cwd(), 'app/estimador-compraventa-inmueble/page.tsx'),
        'utf8',
      );
      expect(fuente).toContain('IVA_INMUEBLES_2025.anejoVinculado');
    },
  );

  /**
   * ⚠️ HALLAZGO 10/09/2026 (BAJO) — «Estimar por mí» rellena el campo SIN la gestoría que
   * el propio rótulo del campo incluye.
   *
   * El campo se llama «Impuestos y gastos que pagaste al comprar» y su ayuda dice, literal:
   * «ITP o IVA, notaría, registro **y gestoría** de aquella compra». El botón que lo
   * rellena suma solo tres de las cuatro líneas:
   *     const estimado = calcularITP(precioC, ccaa) + calcularNotario(precioC) + calcularRegistro(precioC);
   * mientras la pestaña Comprador de la MISMA app, para el mismo precio, suma también la
   * gestoría (GESTORIA_TIPICA = 300). Y la cifra alimenta el valor de ADQUISICIÓN: quedarse
   * corto infla la ganancia y el IRPF, que es justo la dirección contra la que avisa la
   * cabecera de `data/fiscal/ganancia-inmueble.ts`.
   *
   * Caso: Cantabria, precio de compra 200.000 € → «Estimar por mí»
   *   ITP      = 200.000 × 9 %                     = 18.000,00 €
   *   Notaría  = 433,7044 × 1,75                   =    758,98 €
   *   Registro = 195,2272455 × 1,21                =    236,22 €
   *   Gestoría (GESTORIA_TIPICA)                   =    300,00 €
   *   Esperado (las cuatro líneas del rótulo) = 19.295  ·  Obtenido = 18.995
   */
  test(
    'HALLAZGO — «Estimar por mí» omite la gestoría que su propio rótulo incluye',
    async ({ page }) => {
      await page.goto(RUTA);
      await page.locator('#ccaa-inmueble').selectOption('cantabria');
      await page.getByRole('button', { name: 'Vendedor' }).click();
      await rellenar(page, 'Precio de compra original', '200000');

      const campo = page.locator('input[aria-label="Impuestos y gastos que pagaste al comprar"]');
      // El rótulo del campo promete las cuatro partidas
      expect(await campo.locator('xpath=../p').first().innerText()).toContain('gestoría');

      await page.getByRole('button', { name: /Estimar por mí/ }).click();
      // Con la rebaja del 5 % del nº 2.1 de los dos aranceles (hallazgos 2901 y 2902; recalculado
      // a mano el 12/10/2026 como en el CASO 1): 18.000 + 721,037261 + 224,959694 + 300 =
      // 19.245,996955 → formatNumber(…, 0) = «19.246» (sin la rebaja, «19.295»)
      expect(await campo.inputValue()).toBe('19.246');
    },
  );

  /**
   * ⚠️ HALLAZGO 10/09/2026 (BAJO) — el caso «Marta» del bloque educativo publica un total
   * que no suma lo que él mismo desglosa, y con las tres cifras tecleadas a mano.
   *
   * Literal en pantalla: «Además paga unos 1.193 € en notaría (685 €), registro (209 €) y
   * gestoría (300 €)». 685 + 209 + 300 = 1.194, no 1.193.
   *
   * Es la familia del hallazgo 594 —un total que no cuadra con el desglose de encima—, que
   * se cerró en la calculadora con `sumarLineasVisibles` (las líneas se redondean ANTES de
   * sumarse, que es como las ve el usuario) y no llegó al bloque educativo. Con ese mismo
   * criterio, la factura de 140.000 € es 684,60 + 208,86 + 300,00 = 1.193,46, así que las
   * cifras redondeadas que se publican tienen que sumar 685 + 209 + 300 = 1.194.
   *
   * Agravante: las tres son literales, no derivadas del arancel como el resto de la página
   * (`HORQUILLA_FEDATARIOS`, `EJEMPLO_OBRA_NUEVA_AJD`…), así que un cambio en
   * FACTURA_NOTARIAL o en REGISTRO_CONCEPTOS las deja obsoletas en silencio — el hallazgo
   * 584 otra vez.
   *
   * REPARADO el 10/09/2026: las tres partidas salen de `calcularNotario` / `calcularRegistro`
   * / `GESTORIA_TIPICA` y el total es su suma, redondeando cada línea al EURO —que es la
   * unidad en la que este bloque las escribe— por el mismo criterio con el que
   * `sumarLineasVisibles` redondea al céntimo en la calculadora. De paso, el ITP y el ahorro
   * pasan a derivarse de `ITP_CCAA`.
   *
   * Al derivarse, el total se escribe con el formateador canónico y `es-ES` NO agrupa el
   * millar de un número de cuatro cifras: «1194 €», igual que las tarjetas de la propia
   * calculadora («6093,46 €», «1937,50 €»). Antes ponía el punto porque estaba tecleado a
   * mano, y era la única cifra de la página que lo hacía.
   */
  test(
    'HALLAZGO — el caso «Marta» del bloque educativo no suma su propio desglose',
    async ({ page }) => {
      await page.goto(RUTA);
      await page.getByRole('button', { name: 'Ver guía educativa' }).click();
      const texto = (await page.getByText(/Marta, 29 años/).innerText())
        .replace(ESPACIO_DURO, ' ')
        .replace(/\s+/g, ' ');

      // Las tres partidas que publica el propio caso. Con la rebaja del 5 % del nº 2.1 de los dos
      // aranceles (hallazgos 2901 y 2902; recalculado a mano el 12/10/2026): notaría de 140.000 €
      // 650,38 → «650 €», registro 198,97 → «199 €» (sin la rebaja, 685 y 209)
      expect(texto).toContain('notaría (650 €)');
      expect(texto).toContain('registro (199 €)');
      expect(texto).toContain('gestoría (300 €)');
      // …y el total tiene que ser su suma, escrita como la escribe el formateador del proyecto
      expect(texto).toContain('unos 1149 €');
      // La prueba de fondo, independiente del formato: el total ES la suma del desglose.
      // Solo el tramo que va del total a su punto final — antes está el ITP, que no es una
      // de las partidas que ese total suma.
      const desglose = texto.match(/unos (\d+) € en (.+?)\./);
      expect(desglose, 'la frase del total y su desglose').not.toBeNull();
      const partidas = [...desglose![2].matchAll(/\((\d+) €\)/g)].map((m) => Number(m[1]));
      expect(partidas).toHaveLength(3);
      expect(partidas.reduce((a, b) => a + b, 0)).toBe(Number(desglose![1]));
    },
  );

  /**
   * ⚠️ HALLAZGO 10/09/2026 (BAJO) — la horquilla de la gestoría se escribe de tres formas
   * distintas en la misma página, y dos de ellas sin el espacio del formato español.
   *
   * CLAUDE.md global §2: la moneda va «1.234,56 €», con espacio antes del símbolo. En esta
   * página conviven:
   *   · «Típico: 200-400€ (tramitación de escrituras)»   — ayuda del campo de gestoría
   *   · «Gestoría: Opcional, entre 200€ y 400€»          — lista de gastos de notaría y registro
   *   · «Su coste oscila entre 200 € y 400 €»            — FAQ visible  ✔ correcto
   *   · «opcionalmente la gestoría (200-400 €)»          — FAQPage del JSON-LD  ✔ correcto
   */
  test(
    'HALLAZGO — la horquilla de gestoría va sin espacio antes del € en dos de sus cuatro bocas',
    async ({ page }) => {
      await page.goto(RUTA);
      await page.getByRole('button', { name: 'Ver guía educativa' }).click();
      const cuerpo = (await page.locator('body').innerText()).replace(ESPACIO_DURO, ' ');

      expect(cuerpo).not.toContain('200-400€');
      expect(cuerpo).not.toContain('200€ y 400€');
      // La forma correcta, que la FAQ de la misma página ya usa
      expect(cuerpo).toContain('entre 200 € y 400 €');
    },
  );
});


test.describe('Inspector 11/09/2026 — re-inspección: Aragón y residuos de reparación', () => {
  /**
   * Por qué esta tanda mira a Aragón: el commit 7a02470c del 11/09/2026 reescribió su ficha
   * («Aragón no tiene tipos reducidos de ITP, tiene bonificaciones en cuota»). Le dio una
   * escala de CINCO tramos con cuota acumulada donde antes había dos, y convirtió sus
   * colectivos en tipos EFECTIVOS derivados de una bonificación sobre la cuota. Nada de eso
   * lo vigila el build: hay que verlo en pantalla.
   *
   * Todas las cifras esperadas salen de `data/itp-ccaa.ts` (ITP_CCAA.aragon, que cita el
   * Decreto Legislativo 1/2005 arts. 121-1, 121-4, 121-5 y 160-3, y los aranceles de los
   * RD 1426/1989 y RD 1427/1989) y de `data/fiscal/inmuebles.ts`. Resueltas a mano ANTES
   * de abrir el navegador.
   */

  /**
   * CASO 36 (normal) — Aragón, segunda mano, vivienda de 200.000 €, perfil General.
   *
   * 200.000 € cae entero dentro del primer tramo de la escala (hasta 400.000 € al 8 %), así
   * que el tipo efectivo coincide con el nominal. Ninguno de los reducidos de Aragón se
   * puede aplicar con perfil General: los tres del art. 121-4 y los dos de familia numerosa
   * son de colectivo, y el de víctimas de violencia de género tiene el tope de 100.000 €.
   *   ITP       = 200.000 × 8 %                                  = 16.000,00 €
   * Notaría y registro recalculados a mano el 12/10/2026 con la rebaja del 5 % del nº 2.1
   * (hallazgos 2901 y 2902), como en el CASO 1:
   *   Notaría   = arancel(200.000) × 0,95 × 1,21 × 1,75          =    721,04 €
   *     arancel = 90,151816 + 24.040,49×0,45 % + 30.050,60×0,15 % + 90.151,82×0,10 %
   *               + 49.746,97×0,05 % = 358,435226 → ×0,95 = 340,513465 → ×1,21 = 412,021292
   *               → ×1,75 = 721,037261 (sin la rebaja, 758,98)
   *     horquilla de FACTURA_NOTARIAL: ×1,5 = 618,03 € y ×2 = 824,04 € (antes 650,56 y 867,41)
   *   Registro  = (186,212547 × 0,95 + 6,010121 + 3,005061) × 1,21 = 224,96 € (antes 236,22)
   *   Gestoría (GESTORIA_TIPICA)                                  =    300,00 €
   *   AJD       = 0 — segunda mano, la tarjeta no se pinta
   *   Total gastos = 16.000 + 721,04 + 224,96 + 300               = 17.246,00 €
   *   % sobre precio = 17.246,00 / 200.000                        =      8,62 %
   *   Coste total  = 200.000 + 17.246,00                          = 217.246,00 €
   */
  test('CASO 36 (normal) — Aragón, segunda mano, vivienda de 200.000 €', async ({ page }) => {
    await page.goto(RUTA);
    await page.locator('#ccaa-inmueble').selectOption('aragon');
    await rellenar(page, 'Precio de la vivienda', '200000');

    // El tipo nominal que anuncia el panel de la comunidad
    expect(ITP_CCAA.aragon.tipoGeneral).toBe(8);

    expect(await valorTarjeta(page, /^Precio del inmueble/)).toBe('200.000,00 €');
    expect(await valorTarjeta(page, /^ITP/)).toBe('16.000,00 €');
    await expect(page.getByRole('heading', { name: 'ITP (8,00 %)' })).toBeVisible();
    expect(await valorTarjeta(page, /^Gastos de notaría/)).toBe('721,04 €');
    expect(await descripcionTarjeta(page, /^Gastos de notaría/)).toContain(
      'entre 618,03 € y 824,04 €',
    );
    expect(await valorTarjeta(page, /^Registro de la Propiedad/)).toBe('224,96 €');
    expect(await valorTarjeta(page, /^Gastos de gestoría/)).toBe('300,00 €');
    expect(await valorTarjeta(page, /^Total gastos adicionales/)).toBe('17.246,00 €');
    expect(await descripcionTarjeta(page, /^Total gastos adicionales/)).toBe(
      '8,62 % sobre el precio',
    );
    expect(await valorTarjeta(page, /COSTE TOTAL DE ADQUISICIÓN/)).toBe('217.246,00 €');
  });

  /**
   * CASO 37 (límite: la escala de CINCO tramos que estrenó el 11/09/2026) — Aragón, 500.000 €.
   *
   * Hasta ese día la ficha tenía dos tramos [400.000 → 8 %, resto → 10 %] y esta misma
   * vivienda liquidaba 42.000 €. La escala real del art. 121-1 tiene tres escalones
   * intermedios y da 1.250 € menos:
   *   400.000 × 8 %                            = 32.000,00 €   (cuota acumulada a 400.000)
   *    50.000 × 8,5 %                          =  4.250,00 €   (cuota acumulada a 450.000: 36.250)
   *    50.000 × 9 %                            =  4.500,00 €   (cuota acumulada a 500.000: 40.750)
   *   ITP                                      = 40.750,00 €
   *   Tipo EFECTIVO = 40.750 / 500.000          =      8,15 %   (no el nominal del 8 %)
   * Notaría y registro recalculados a mano el 12/10/2026 con la rebaja del 5 % del nº 2.1
   * (hallazgos 2901 y 2902):
   *   Notaría  = arancel(500.000) × 0,95 × 1,21 × 1,75 = 1.022,78 €
   *     arancel = 90,151816 + 108,182205 + 45,0759 + 90,15182 + 174,873485 = 508,435226
   *               → ×0,95 = 483,013465 → ×1,21 = 584,446292 → ×1,75 = 1.022,781011
   *               · horquilla 876,67 € – 1.168,89 € (sin la rebaja, 1.076,61)
   *   Registro = (276,212547 × 0,95 + 9,015182) × 1,21 = 328,41 € (antes 345,12)
   *   Gestoría                                   =    300,00 €
   *   Total gastos = 40.750 + 1.022,78 + 328,41 + 300 = 42.401,19 €  →  8,48 % del precio
   *   Coste total                                = 542.401,19 €
   *
   * (formato es-ES: un número de cuatro cifras va SIN punto de millar — «1076,61 €»)
   */
  test('CASO 37 (límite) — Aragón, 500.000 €: los tres escalones intermedios de la escala', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await page.locator('#ccaa-inmueble').selectOption('aragon');
    await rellenar(page, 'Precio de la vivienda', '500000');

    // La escala que la ficha declara, y que el panel de la comunidad anuncia en pantalla
    expect(ITP_CCAA.aragon.tramosProgresivos?.map((t) => t.tipo)).toEqual([8, 8.5, 9, 9.5, 10]);
    // Desde el 24/09/2026 la frase la escribe `describirSubidaITP` del motor, con el espacio
    // antes del % (hallazgos 1581 y 1602: distingue la escala del umbral de Valencia).
    // (el motor escribe los tipos no enteros con dos decimales: «8,50 %»)
    await expect(page.getByText(/escala progresiva \(8\s% → 8,50\s% → 9\s% → 9,50\s% → 10\s%\)/)).toBeVisible();

    expect(await valorTarjeta(page, /^ITP/)).toBe('40.750,00 €');
    // El rótulo lleva el tipo EFECTIVO: con escala progresiva el nominal contradiría al importe
    await expect(page.getByRole('heading', { name: 'ITP (8,15 %)' })).toBeVisible();
    expect(await valorTarjeta(page, /^Gastos de notaría/)).toBe('1022,78 €');
    expect(await valorTarjeta(page, /^Registro de la Propiedad/)).toBe('328,41 €');
    expect(await valorTarjeta(page, /^Total gastos adicionales/)).toBe('42.401,19 €');
    expect(await descripcionTarjeta(page, /^Total gastos adicionales/)).toBe(
      '8,48 % sobre el precio',
    );
    expect(await valorTarjeta(page, /COSTE TOTAL DE ADQUISICIÓN/)).toBe('542.401,19 €');
  });

  /**
   * CASO 38 (límite: bonificación en cuota) — Aragón, perfil Joven, dentro y fuera del tope.
   *
   * El art. 121-4.a) no da un tipo reducido: bonifica el 12,5 % de la CUOTA íntegra, con el
   * inmueble a ≤100.000 €. La ficha lo declara como tipo efectivo del 7 % (8 % − 12,5 %), y
   * eso solo es exacto mientras el tope de valor mantenga la operación dentro del primer
   * tramo del 8 % — el tope son 100.000 € y el tramo llega a 400.000 €, así que se cumple.
   *   a) 100.000 € (justo en el tope) → 100.000 × 7 %            =  7.000,00 €
   *   b) 150.000 € (por encima del tope) → el reducido NO se aplica; vuelve la escala:
   *      150.000 × 8 % (primer tramo)                            = 12.000,00 €
   *      …y el aviso «Podrías pagar menos» tiene que nombrar el 7 % con su requisito de valor.
   */
  test('CASO 38 (límite) — Aragón, joven: el 7 % efectivo del art. 121-4 y su tope de 100.000 €', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await page.locator('#ccaa-inmueble').selectOption('aragon');
    await rellenar(page, 'Precio de la vivienda', '100000');
    await page.locator('#perfil-comprador').selectOption('joven');

    // El tipo efectivo y su tope, tal como los declara la ficha
    const joven = ITP_CCAA.aragon.tiposReducidos.find((r) => r.nombre.includes('Jóvenes'));
    expect(joven?.tipo).toBe(7);
    expect(joven?.valorMaximo).toBe(100000);

    expect(await valorTarjeta(page, /^ITP/)).toBe('7000,00 €');
    await expect(page.getByRole('heading', { name: 'ITP (7,00 %)' })).toBeVisible();

    // Un euro por encima del tope ya no lo tiene, y la app tiene que decir que existe
    await rellenar(page, 'Precio de la vivienda', '150000');
    expect(await valorTarjeta(page, /^ITP/)).toBe('12.000,00 €');
    await expect(page.getByRole('heading', { name: 'ITP (8,00 %)' })).toBeVisible();
    await expect(page.getByText('7,00 % — Jóvenes < 35 años')).toBeVisible();
  });

  /**
   * CASO 39 (debe rechazarse) — un número de años NEGATIVO no puede producir un impuesto.
   *
   * Desde el commit bc437470 el «0» es un dato VÁLIDO en «Años de propiedad»: es la reventa
   * antes de cumplir el año, que tributa con el coeficiente 0,14 de COEFICIENTES_IIVTNU_2025
   * (el tercero más alto). El propio motor lo dice por escrito: «Un año NEGATIVO no se acota
   * a 0: se rechaza. Acotarlo lo convertiría en una reventa antes del año y liquidaría un
   * impuesto a partir de un dato imposible».
   *
   * Caso: venta 250.000 € · compra 200.000 € · suelo catastral 50.000 € · «-5» años.
   *   · Con el foco dentro, la app corta bien: «Sin calcular».
   *   · Tras el blur, el `min={0}` del NumberInput reescribe el campo a «0» y la plusvalía
   *     pasa a 50.000 × 0,14 × 25 % = 1.750,00 €, que es exactamente la cifra de la reventa
   *     antes del año — a partir de un dato que el usuario nunca escribió.
   *   Esperado: «Sin calcular» en los dos momentos  ·  Obtenido: «Sin calcular» → 1750,00 €.
   */
  test('CASO 39 (debe rechazarse) — «-5» años no puede convertirse en una reventa antes del año', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await rellenar(page, 'Precio de la vivienda', '250000');
    await page.getByRole('button', { name: 'Vendedor' }).click();
    await rellenar(page, 'Precio de compra original', '200000');
    await rellenar(page, 'Valor catastral del suelo', '50000');

    const campoAnios = page.locator('input[aria-label="Años de propiedad"]');
    await campoAnios.fill('-5');
    // a) Mientras el campo tiene el foco, el cálculo corta: esta parte ya está bien
    expect(await valorTarjeta(page, /^Plusvalía municipal/)).toBe('Sin calcular');

    // b) Y al salir del campo tiene que seguir cortando, no reescribirse a un valor con
    //    significado fiscal propio
    await campoAnios.blur();
    expect(await campoAnios.inputValue()).not.toBe('0');
    expect(await valorTarjeta(page, /^Plusvalía municipal/)).toBe('Sin calcular');
  });

  /**
   * ⚠️ HALLAZGO 11/09/2026 (MEDIO) — el FAQPage del JSON-LD sigue diciendo a mano que
   * notaría, registro y gestoría «rondan el 1%-2%», y el motor da entre el 0,34 % y el 1,07 %.
   *
   * Es un residuo del hallazgo 628: en esa MISMA frase la horquilla total se derivó del motor
   * (HORQUILLA_GASTOS_COMPRAVENTA, hoy 3,3 %-12,6 %), pero la coletilla de las tres partidas
   * de fedatarios se quedó tecleada. Sobre la banda que la propia app publica
   * (BANDA_PRECIO_VIVIENDA, 100.000 €-500.000 €):
   *   100.000 € → 599,90 + 172,56 + 300 = 1.072,46 €  →  1,07 %
   *   200.000 € → 758,98 + 236,22 + 300 = 1.295,20 €  →  0,65 %
   *   500.000 € → 1.076,61 + 345,12 + 300 = 1.721,73 € →  0,34 %
   * El 2 % no se alcanza en ningún punto de la banda, y a partir de ~107.000 € ni siquiera el
   * 1 %. La frase además no cuadra consigo misma: 4 % de ITP mínimo + 1 % son 5 %, por encima
   * del 3,3 % que ella misma acaba de publicar como mínimo del total.
   *
   * Lo lee ChatGPT, Bing Copilot y Perplexity, que es justo el sitio donde una cifra a mano
   * hace más daño (es la lección del hallazgo 584).
   */
  test('REPARADO 11/09 (718) — el JSON-LD publica la horquilla de fedatarios que da el motor', async ({
    page,
  }) => {
    await page.goto(RUTA);

    // Lo que el motor cobra en los dos extremos de la banda que la app publica
    const pctFedatarios = (precio: number) =>
      (sumarLineasVisibles(estimarFacturaNotarial(precio).medio, calcularRegistro(precio), 300) /
        precio) *
      100;
    const enElSuelo = pctFedatarios(BANDA_PRECIO_VIVIENDA.min);
    const enElTecho = pctFedatarios(BANDA_PRECIO_VIVIENDA.max);
    expect(enElSuelo).toBeLessThan(1.1);
    expect(enElTecho).toBeLessThan(0.5);

    const bloques = await page.locator('script[type="application/ld+json"]').allTextContents();
    const juntos = bloques.join(' ');
    expect(juntos).toContain('FAQPage');
    expect(juntos).not.toMatch(/rondan el 1\s?%-2\s?%/);
  });

  /**
   * ⚠️ HALLAZGO 11/09/2026 (BAJO) — el panel «Tipos reducidos disponibles» imprime el tipo
   * con punto decimal inglés.
   *
   * La lista se pinta con `<strong>{tr.tipo}%</strong>`, sin pasar por `formatTipoNominal`,
   * así que cualquier tipo con decimales sale en formato US (CLAUDE.md global §2). La misma
   * pantalla, dos dedos más abajo, sí lo escribe bien en el aviso «Podrías pagar menos»
   * («7,00% — Jóvenes < 35 años»), de modo que la página se contradice a sí misma.
   *
   * Casos: Andalucía · perfil Joven → «3.5% - Jóvenes < 35 años»   · esperado «3,5%»
   *        Aragón    · perfil Joven → «3.2% - Familia numerosa en medio rural» · esperado «3,2%»
   * El de Aragón lo estrenó el commit 7a02470c de hoy: hasta ayer su lista no tenía decimales.
   */
  test('REPARADO 11/09 (721) — los tipos reducidos con decimales salen en formato español', async ({ page }) => {
    await page.goto(RUTA);
    await rellenar(page, 'Precio de la vivienda', '140000');
    await page.locator('#ccaa-inmueble').selectOption('andalucia');
    await page.locator('#perfil-comprador').selectOption('joven');

    const panel = page.locator('h4', { hasText: 'Beneficios fiscales en' }).locator('..');
    const lineas = (await panel.innerText()).replace(ESPACIO_DURO, ' ');

    // El dato de la ficha lleva decimales, así que hay algo que formatear
    expect(
      ITP_CCAA.andalucia.tiposReducidos.find((r) => r.nombre.includes('Jóvenes'))?.tipo,
    ).toBe(3.5);
    expect(lineas).not.toMatch(/\d+\.\d+\s?%/);
    expect(lineas).toContain('3,5 %');
  });

  /**
   * ⚠️ HALLAZGO 11/09/2026 (BAJO) — la FAQ visible dice que la edad tope del tipo joven «va
   * de los 32 a los 40 años», y la tabla de la propia app empieza en 30.
   *
   * Residuo de la reparación del 27/08/2026, que sustituyó el «menores de 35-36 años» por
   * esta horquilla: el 32 era entonces el tope de Cataluña, y el Decreto-ley 5/2025 lo subió
   * a 35 — el propio `data/itp-ccaa.ts` lo documenta («desde el 27/06/2025; antes ≤32»). Con
   * el 32 fuera, el suelo real de la tabla es el de Baleares, «Jóvenes < 30 años».
   *
   * Caso: Baleares · perfil Joven · 200.000 € → el panel «Tipos reducidos disponibles» lista
   *       «0% - Jóvenes < 30 años o discapacidad ≥33% (1ª vivienda)» mientras la FAQ dice que
   *       la edad tope más baja son 32 años  ·  esperado «de los 30 a los 40 años».
   */
  test('REPARADO 11/09 (720) — la horquilla de edad del tipo joven se deriva de la tabla', async ({
    page,
  }) => {
    // Las edades que de verdad hay en la tabla, leídas de las condiciones de cada reducido
    const edades = Object.values(ITP_CCAA)
      .flatMap((c) => c.tiposReducidos)
      .filter((r) => /joven/i.test(r.nombre.normalize('NFD').replace(/[\u0300-\u036f]/g, '')))
      .flatMap((r) => r.condiciones)
      .map((c) => c.match(/^menor (?:de|o igual de) (\d+)/i)?.[1])
      .filter((n): n is string => !!n)
      .map(Number);
    const menor = Math.min(...edades);
    const mayor = Math.max(...edades);
    expect(menor).toBe(30); // Baleares
    expect(mayor).toBe(40); // Murcia y La Rioja

    await page.goto(RUTA);
    await rellenar(page, 'Precio de la vivienda', '200000');
    await page.locator('#ccaa-inmueble').selectOption('baleares');
    await page.locator('#perfil-comprador').selectOption('joven');
    await expect(
      page.getByText('0 % - Jóvenes < 30 años o discapacidad ≥33 % (1ª vivienda)'),
    ).toBeVisible();

    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
    const cuerpo = (await page.locator('body').innerText()).replace(ESPACIO_DURO, ' ');
    expect(cuerpo).toContain(`va de los ${menor} a los ${mayor} años`);
  });

  /**
   * ⚠️ HALLAZGO 11/09/2026 (BAJO) — `normalizarTexto` se declara para comparar nombres de
   * tipos reducidos sin tildes… y no se llama desde ningún sitio.
   *
   * La única comparación de ese tipo que hay en el fichero, la del ejemplo «Marta», va sin
   * normalizar: `tiposReducidos?.find((t) => t.nombre.includes('Jóvenes'))`. Hoy acierta
   * porque Andalucía escribe «Jóvenes < 35 años» con la misma tilde, pero es exactamente la
   * forma del hallazgo 526 —«'jóvenes'.includes('joven')» es false— que obligó a exportar
   * `normaliza` desde `data/itp-ccaa.ts`. Si el nombre cambiara, el `find` devolvería
   * undefined, el ejemplo caería al tipo GENERAL y publicaría «se aplica el tipo reducido
   * del 7% en lugar del tipo general del 7%. Ahorra 0 €», sin que nada avisara.
   *
   * Caso: `grep -c normalizarTexto app/estimador-compraventa-inmueble/page.tsx`
   *       · esperado ≥ 2 (declaración + uso)  ·  obtenido 1 (solo la declaración).
   */
  test('REPARADO 11/09 (723) — el normalizador de tildes se usa donde hace falta', async () => {
    const fuente = readFileSync(
      join(process.cwd(), 'app/estimador-compraventa-inmueble/page.tsx'),
      'utf8',
    );
    const apariciones = fuente.match(/normalizarTexto/g)?.length ?? 0;
    // O se usa donde hace falta, o sobra: un helper muerto es una reparación a medias
    expect(apariciones).not.toBe(1);
    expect(fuente).not.toContain(".nombre.includes('Jóvenes')");
  });

  /**
   * ⚠️ HALLAZGO 11/09/2026 (BAJO) — con PÉRDIDA patrimonial la tarjeta del IRPF dice
   * «EXENTO» y su descripción, justo debajo, «Tributación en base del ahorro».
   *
   * Cuando hay pérdida, `calcularGananciaInmueble` devuelve `motivoExencion: null`, y la
   * tarjeta cae en su texto por defecto. El resultado es una tarjeta verde que afirma dos
   * cosas incompatibles: que está exenta y que tributa. Además no es una exención: es que no
   * hay ganancia —la tarjeta de encima ya dice «Pérdida patrimonial»—, y la diferencia
   * importa, porque una pérdida se compensa en la declaración y una exención no.
   *
   * Caso: venta 250.000 € · compra 300.000 € · 10 años · suelo catastral 50.000 €
   *       → «Pérdida patrimonial 57.500,00 €» y, debajo, «IRPF sobre ganancia: EXENTO ·
   *         Tributación en base del ahorro»  ·  esperado un texto que hable de la pérdida.
   */
  test('REPARADO 11/09 (724) — en pérdida patrimonial el IRPF ya no dice «exento» y «tributa» a la vez', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await rellenar(page, 'Precio de la vivienda', '250000');
    await page.getByRole('button', { name: 'Vendedor' }).click();
    await rellenar(page, 'Precio de compra original', '300000');
    await rellenar(page, 'Años de propiedad', '10');
    await rellenar(page, 'Valor catastral del suelo', '50000');

    // La pérdida es la de la fórmula del art. 35 LIRPF: 250.000 − 7.500 de comisión − 0 de
    // plusvalía (no sujeta, sin incremento) − 300.000 de valor de adquisición = −57.500 €
    expect(await valorTarjeta(page, /^Pérdida patrimonial/)).toBe('57.500,00 €');
    // «NO SUJETA» desde el 18/09/2026 (hallazgo 901): el art. 104.5 TRLRHL articula un
    // supuesto de NO SUJECIÓN, no una exención, y la propia tarjeta ya lo decía así en su
    // descripción mientras el valor decía «EXENTO».
    expect(await valorTarjeta(page, /^Plusvalía municipal/)).toBe('NO SUJETA');

    expect(await descripcionTarjeta(page, /^IRPF sobre ganancia/)).not.toBe(
      'Tributación en base del ahorro',
    );
  });

  /**
   * ⚠️ HALLAZGO 11/09/2026 (MEDIO) — la reparación de la edad del tipo joven llegó a la FAQ
   * visible y NO al JSON-LD, que es el canal que leen los asistentes de IA.
   *
   * El 27/08/2026 se corrigió «jóvenes (generalmente menores de 35-36 años)» en el bloque
   * educativo porque la tabla de la app lo desmiente en dos comunidades: Murcia ≤40 (art. 8.6
   * del Decreto Legislativo 1/2010) y La Rioja <40 (Ley 1/2025). El FAQPage del JSON-LD dice
   * todavía, palabra por palabra, «tipos reducidos para jóvenes (menores de 35-36 años)».
   * El test que vigila aquella reparación mira el texto VISIBLE con `getByText`, que no entra
   * en un `<script>`: por eso el residuo no salta.
   *
   * Caso: Murcia · perfil Joven · vivienda de 150.000 € → la app cobra 4.500,00 € (3 %) en
   *       lugar de 11.625,00 € (7,75 % general), 7.125 € de diferencia, mientras el JSON-LD
   *       le cuenta a ChatGPT y a Bing Copilot que a los 38 años ya no le corresponde.
   */
  test('REPARADO 11/09 (719) — el JSON-LD y la FAQ visible dicen la misma edad tope', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await page.locator('#ccaa-inmueble').selectOption('murcia');
    await rellenar(page, 'Precio de la vivienda', '150000');
    await page.locator('#perfil-comprador').selectOption('joven');

    // Lo que la tabla dice y la app cobra: 3 % para el joven de hasta 40 años
    expect(ITP_CCAA.murcia.tiposReducidos.find((r) => r.nombre.includes('Jóvenes'))?.tipo).toBe(3);
    expect(await valorTarjeta(page, /^ITP/)).toBe('4500,00 €');

    // Lo que la señal estructurada le cuenta a los asistentes de IA
    const bloques = await page.locator('script[type="application/ld+json"]').allTextContents();
    expect(bloques.join(' ')).not.toContain('menores de 35-36 años');
  });
});

// ✅ REPARADO 11/09/2026 (medio y bajo) — contenido. Los tres son el mismo defecto: una cifra
// que se quedó TECLEADA en el FAQPage mientras la de al lado ya se derivaba del motor.
//
//  · 718 — «notaría, registro y gestoría, que en conjunto rondan el 1%-2%». El motor no llega
//    al 2 % en ningún punto de la banda que la propia app publica, y por encima de ~107.000 €
//    tampoco al 1 %. Residuo del 628: en la MISMA frase la horquilla total sí se derivó.
//  · 719 — «tipos reducidos para jóvenes (menores de 35-36 años)», que es el texto que el
//    27/08/2026 se corrigió en la FAQ visible y no en el <script>. El test que lo vigilaba
//    usaba getByText, que no entra en un script: de ahí que sobreviviera dos semanas.
//  · 720 — y la FAQ visible decía «de los 32 a los 40 años», con un 32 que era el tope de
//    Cataluña ANTES del Decreto-ley 5/2025. El suelo real es el de Baleares.
//
// Los tres se cierran igual: la cifra se deriva (HORQUILLA_FEDATARIOS_PCT y horquillaEdadJoven)
// y las dos bocas la leen del mismo sitio.
test('REPARADO 11/09 (contenido) — el FAQPage publica las cifras del motor, no las tecleadas', async ({
  page,
}) => {
  await page.goto(RUTA);
  const jsonLd = (await page.locator('script[type="application/ld+json"]').allTextContents()).join(' ');

  // 718 — la horquilla de fedatarios ya no es la inventada, y contiene lo que el motor cobra.
  expect(jsonLd).not.toMatch(/rondan el 1\s?%-2\s?%/);
  const fedatarios200k =
    estimarFacturaNotarial(200000).medio + calcularRegistro(200000) + 300; // gestoría típica
  const pct200k = (fedatarios200k / 200000) * 100;
  const horquilla = jsonLd.match(/rondan el (\d+,\d+)\s% al (\d+,\d+)\s%/);
  expect(horquilla, 'el FAQPage publica la horquilla de fedatarios').not.toBeNull();
  const [minPct, maxPct] = horquilla!.slice(1, 3).map((n) => Number(n.replace(',', '.')));
  expect(minPct).toBeLessThanOrEqual(pct200k);
  expect(maxPct).toBeGreaterThanOrEqual(pct200k);
  expect(maxPct).toBeLessThan(2); // el 2 % tecleado no lo alcanza el motor en ningún punto

  // 719 y 720 — la edad tope sale de la tabla, y las dos bocas dicen lo mismo.
  const edad = horquillaEdadJoven();
  expect(jsonLd).not.toContain('35-36 años');
  expect(jsonLd).toContain(`de los ${edad.min} a los ${edad.max} años`);

  // El párrafo concreto, no `body.innerText()`: la FAQ vive dentro de la sección educativa
  // colapsable y el innerText del documento no la recoge.
  const respuestaReducidos = page
    .locator('h4', { hasText: '¿Qué son los tipos reducidos de ITP y cómo acceder a ellos?' })
    .locator('xpath=following-sibling::p[1]');
  const visible = (await respuestaReducidos.innerText()).replace(ESPACIO_DURO, ' ');
  expect(visible).toContain(`va de los ${edad.min} a los ${edad.max} años`);

  // Y que la tabla no ha dejado de declararlas: 30 es Baleares y 40 Murcia y La Rioja.
  expect(edad.min).toBe(30);
  expect(edad.max).toBe(40);
});

// ═══════════════════════════════════════════════════════════════════════════════
// Inspector 12/09/2026 — re-inspección tras el tope de Castilla y León
// ═══════════════════════════════════════════════════════════════════════════════
//
// Por qué vuelve a la cola: tres commits del 11/09/2026 movieron su código o sus datos.
//   · 7a02470c — Aragón pasa a escala de cinco tramos y bonificaciones en cuota.
//   · e947fa55 — la tarifa del ISD y el pase FAQ ↔ JSON-LD (aquí, `horquillaEdadJoven`).
//   · 21a13c6b — 32 hallazgos; de los suyos, el que toca al MOTOR de esta app es el 717:
//     el reducido de jóvenes de Castilla y León se ofrecía SIN su tope de 150.000 €, que
//     vivía solo en el texto libre de `notaReducido`. Ese tope es ahora un campo
//     (`valorMaximo: 150000` en ITP_CCAA['castilla-leon']) y cambia la cuota por 10.000 €
//     en una vivienda de 250.000 €, así que hay que verlo en pantalla.
//
// De dónde sale cada cifra esperada: `data/itp-ccaa.ts` (ITP_CCAA['castilla-leon'], que
// declara la escala 8 %/10 % con corte en 250.000 € y el reducido del 4 % con tope de
// 150.000 €; ARANCELES_NOTARIO y ARANCELES_REGISTRO, RD 1426/1989 y RD 1427/1989) y
// `data/fiscal/inmuebles.ts` (TRAMOS_GANANCIAS_PATRIMONIALES_2025 para el IRPF del ahorro:
// 19 % hasta 6.000 € · 21 % hasta 50.000 €). Los aranceles de 140.000 € y 250.000 €
// coinciden con los ya verificados en el CASO B y en el CASO 28 de este mismo fichero.
//
// Los tres casos van resueltos A MANO antes de abrir el navegador; el desarrollo va
// comentado junto a cada aserción. Las siembras pasan por `_hidratacion.ts`: sin esperar a
// que React monte, el `fill()` mueve el DOM y el cálculo se queda en el valor anterior.

test.describe('Inspector 12/09/2026 — re-inspección: el tope de Castilla y León', () => {
  /** Espera a que React monte y siembra comprobando que el estado lo recogió. */
  async function sembrar(page: Page, etiqueta: string, valor: string): Promise<void> {
    const campo = page.locator(`input[aria-label="${etiqueta}"]`);
    await campo.fill(valor);
    await esperarValorEnReact(page, campo, valor);
    await campo.blur();
  }

  async function abrir(page: Page): Promise<void> {
    await page.goto(RUTA);
    // Un input de la página como testigo: un clic anterior a la hidratación también se pierde
    await esperarHidratacion(page, ['input[aria-label="Precio de la vivienda"]']);
  }

  /**
   * CASO 40 (normal) — Castilla y León, perfil Joven, vivienda de 140.000 €.
   *
   * Control del tope que estrenó el commit 21a13c6b: 140.000 € está DENTRO de los
   * 150.000 €, así que el reducido del 4 % sigue aplicándose y la reparación no ha roto
   * el camino que ya funcionaba.
   *   ITP       = 140.000 × 4 %  (ITP_CCAA['castilla-leon'], «Jóvenes < 36 años»,
   *               condiciones ['Menor de 36 años', 'Vivienda habitual'], las dos
   *               comprobables con lo que la app pregunta)        =  5.600,00 €
   * Notaría y registro recalculados a mano el 12/10/2026 con la rebaja del 5 % del nº 2.1
   * (hallazgos 2901 y 2902), como en el CASO B:
   *   Notaría   = arancel(140.000) × 0,95 × 1,21 × 1,75           =    650,38 €
   *     arancel = 90,151816 + 24.040,49×0,45 % + 30.050,60×0,15 % + 79.898,79×0,10 %
   *               = 323,308711 → ×0,95 = 307,143275 → ×1,21 = 371,643363 → ×1,75 = 650,375886
   *               (sin la rebaja, 684,60)
   *   Registro  = (163,598684 × 0,95 + 6,010121 + 3,005061) × 1,21 =   198,97 € (antes 208,86)
   *   Gestoría (GESTORIA_TIPICA, valor por defecto del campo)      =    300,00 €
   *   AJD       = 0 — segunda mano: TPO y AJD son incompatibles (art. 31.2 TRLITPAJD)
   *   Total gastos = 5.600 + 650,38 + 198,97 + 300                =  6.749,35 €
   *   % sobre precio = 6.749,35 / 140.000                          =      4,82 %
   *   Coste total = 140.000 + 6.749,35                             = 146.749,35 €
   * (formato es-ES: un número de cuatro cifras va SIN punto de millar — «6749,35 €»)
   */
  test('CASO 40 (normal) — Castilla y León, joven, 140.000 €: el reducido del 4 % dentro del tope', async ({
    page,
  }) => {
    await abrir(page);
    await page.locator('#ccaa-inmueble').selectOption('castilla-leon');
    await sembrar(page, 'Precio de la vivienda', '140000');
    await page.locator('#perfil-comprador').selectOption('joven');

    // El tope es ahora un CAMPO de la ficha, no una frase del texto libre (hallazgo 717)
    const joven = ITP_CCAA['castilla-leon'].tiposReducidos.find((r) =>
      r.nombre.includes('Jóvenes'),
    );
    expect(joven?.tipo).toBe(4);
    expect(joven?.valorMaximo).toBe(150000);

    await expect(page.getByRole('heading', { name: 'ITP (4,00 %)' })).toBeVisible();
    expect(await valorTarjeta(page, /^ITP/)).toBe('5600,00 €');
    expect(await valorTarjeta(page, /^Gastos de notaría/)).toBe('650,38 €');
    expect(await valorTarjeta(page, /^Registro de la Propiedad/)).toBe('198,97 €');
    expect(await valorTarjeta(page, /^Gastos de gestoría/)).toBe('300,00 €');
    expect(await valorTarjeta(page, /^Total gastos adicionales/)).toBe('6749,35 €');
    expect(await descripcionTarjeta(page, /^Total gastos adicionales/)).toBe(
      '4,82 % sobre el precio',
    );
    expect(await valorTarjeta(page, /COSTE TOTAL DE ADQUISICIÓN/)).toBe('146.749,35 €');
    await expect(page.locator('h3', { hasText: /^AJD/ })).toHaveCount(0);
  });

  /**
   * CASO 41 (límite) — Castilla y León, perfil Joven, 250.000 €: el tope y el canto de la
   * escala a la vez.
   *
   * 250.000 € es DOS límites en el mismo número: está por encima del tope de 150.000 € del
   * reducido (que por tanto NO se aplica) y es exactamente el corte del primer tramo de la
   * escala del art. 26 del texto refundido autonómico tal como la declara la ficha
   * [{hasta: 250.000, tipo: 8}, {∞, 10}], así que el 10 % no puede tocar nada.
   *   ITP = 250.000 × 8 %                                          = 20.000,00 €  (8,00 %)
   *   Antes del commit 21a13c6b, sin el campo `valorMaximo`, el reducido del 4 % se
   *   aplicaba aquí y la app liquidaba 10.000,00 €: la mitad.
   * Notaría y registro recalculados a mano el 12/10/2026 con la rebaja del 5 % del nº 2.1
   * (hallazgos 2901 y 2902):
   *   Notaría  = arancel(250.000) × 0,95 × 1,21 × 1,75             =    771,33 €
   *     arancel = 90,151816 + 108,182205 + 45,0759 + 90,15182 + 49,873485 = 383,435226
   *               → ×0,95 = 364,263465 → ×1,21 = 440,758792 → ×1,75 = 771,327886 (antes 811,92)
   *   Registro = (201,212547 × 0,95 + 6,010121 + 3,005061) × 1,21  =    242,20 € (antes 254,37)
   *   Gestoría                                                      =    300,00 €
   *   Total gastos = 20.000 + 771,33 + 242,20 + 300                = 21.313,53 €  (8,53 %)
   *   Coste total                                                   = 271.313,53 €
   * Y el 4 % tiene que seguir apareciendo como oportunidad, con su tope a la vista.
   */
  test('CASO 41 (límite) — Castilla y León, 250.000 €: el tope de 150.000 € devuelve la escala', async ({
    page,
  }) => {
    await abrir(page);
    await page.locator('#ccaa-inmueble').selectOption('castilla-leon');
    await sembrar(page, 'Precio de la vivienda', '250000');
    await page.locator('#perfil-comprador').selectOption('joven');

    // La escala que la ficha declara, y que el panel de la comunidad anuncia en pantalla
    expect(ITP_CCAA['castilla-leon'].tramosProgresivos?.map((t) => t.tipo)).toEqual([8, 10]);
    // La frase del motor (`describirSubidaITP`), con el espacio antes del %.
    await expect(page.getByText(/escala progresiva \(8\s% → 10\s%\)/)).toBeVisible();

    await expect(page.getByRole('heading', { name: 'ITP (8,00 %)' })).toBeVisible();
    expect(await valorTarjeta(page, /^ITP/)).toBe('20.000,00 €');
    expect(await valorTarjeta(page, /^Gastos de notaría/)).toBe('771,33 €');
    expect(await valorTarjeta(page, /^Registro de la Propiedad/)).toBe('242,20 €');
    expect(await valorTarjeta(page, /^Total gastos adicionales/)).toBe('21.313,53 €');
    expect(await descripcionTarjeta(page, /^Total gastos adicionales/)).toBe(
      '8,53 % sobre el precio',
    );
    expect(await valorTarjeta(page, /COSTE TOTAL DE ADQUISICIÓN/)).toBe('271.313,53 €');

    // El reducido perdido se enseña como oportunidad, con el tope que lo dejó fuera
    const aviso = page.locator('div[class*="avisoReducidos"]').first();
    await expect(aviso).toContainText('4,00 % — Jóvenes < 36 años');
    await expect(aviso).toContainText('Valor máximo 150.000,00 €');
  });

  /**
   * CASO 42 (debe rechazarse) — «1.2.3» en el valor catastral del suelo no puede producir
   * una plusvalía municipal, y el neto tiene que decir que le falta.
   *
   * «1.2.3» pasa el filtro del NumberInput (regex /^-?[\d.,]*$/) y su blur lo deja intacto
   * (parseFloat('1.2.3') da 1,2, que respeta el min={0}), pero `parseSpanishNumber` lo
   * rechaza con NaN: no es un número. La guarda de la app es `valorSuelo > 0`, y NaN > 0 es
   * false, así que la plusvalía queda «Sin calcular» y FUERA del neto — que es lo correcto:
   * un 0 € ahí se leería como «no pagas nada».
   *
   * Venta 250.000 € · compra 200.000 € · 10 años · suelo «1.2.3» · comisión 3 % (defecto):
   *   Plusvalía municipal → «Sin calcular» (no entra en el total ni en el neto)
   *   IRPF (art. 35 LIRPF, calcularGananciaInmueble):
   *     valor de adquisición = 200.000                                = 200.000,00 €
   *     valor de transmisión = 250.000 − 7.500 (comisión) − 0          = 242.500,00 €
   *       (la gestoría de 300 € la paga el COMPRADOR: art. 35.1 LIRPF)
   *     ganancia = 242.500 − 200.000                                  =  42.500,00 €
   *     cuota = 6.000×19 % + 36.500×21 % = 1.140 + 7.665              =   8.805,00 €
   *   Total gastos vendedor = 0 + 7.500 + 0 + 8.805                    =  16.305,00 €
   *   Neto = 250.000 − 16.305                                          = 233.695,00 €
   *   …y el rótulo del neto tiene que NOMBRAR el campo que falta, no solo el impuesto.
   */
  test('CASO 42 (debe rechazarse) — «1.2.3» de valor catastral no produce plusvalía, y el neto lo dice', async ({
    page,
  }) => {
    await abrir(page);
    await sembrar(page, 'Precio de la vivienda', '250000');
    await page.getByRole('button', { name: 'Vendedor' }).click();
    await sembrar(page, 'Precio de compra original', '200000');
    await sembrar(page, 'Años de propiedad', '10');
    await sembrar(page, 'Valor catastral del suelo', '1.2.3');

    // El campo conserva lo tecleado: el blur no lo reescribe a un número con significado
    expect(await page.locator('input[aria-label="Valor catastral del suelo"]').inputValue()).toBe(
      '1.2.3',
    );

    expect(await valorTarjeta(page, /^Plusvalía municipal/)).toBe('Sin calcular');
    expect(await descripcionTarjeta(page, /^Plusvalía municipal/)).toContain(
      'NO está incluido en el neto',
    );

    // Lo que SÍ se puede calcular se calcula, y con la cuota del ahorro resuelta a mano
    expect(await valorTarjeta(page, /^Valor de adquisición/)).toBe('200.000,00 €');
    expect(await valorTarjeta(page, /^Valor de transmisión/)).toBe('242.500,00 €');
    expect(await valorTarjeta(page, /^Ganancia patrimonial/)).toBe('42.500,00 €');
    expect(await valorTarjeta(page, /^IRPF sobre ganancia/)).toBe('8805,00 €');
    expect(await valorTarjeta(page, /^Comisión inmobiliaria/)).toBe('7500,00 €');

    // El total y el neto dejan fuera la plusvalía, y lo dicen nombrando el campo que falta
    expect(await valorTarjeta(page, /^Total gastos vendedor/)).toBe('16.305,00 €');
    expect(await descripcionTarjeta(page, /^Total gastos vendedor/)).toBe(
      'SIN la plusvalía municipal, que no se incluye',
    );
    expect(await valorTarjeta(page, /IMPORTE NETO VENDEDOR/)).toBe('233.695,00 €');
    expect(await descripcionTarjeta(page, /IMPORTE NETO VENDEDOR/)).toBe(
      // El suelo está escrito pero no se lee: no «falta», se pide corregirlo (hallazgo 1231).
      'No descuenta la plusvalía municipal: el neto real puede ser menor que este. El valor catastral del suelo no se ha podido leer. Escribe con coma decimal (1.234,56) lo que no se ha podido leer para obtenerlo.',
    );
  });

  /**
   * ⚠️ HALLAZGO 12/09/2026 (MEDIO) — el aviso «Podrías pagar menos» ofrece un tipo MÁS ALTO
   * que el que la app acaba de cobrar.
   *
   * `elegirTipoITP` mete en `noComprobables` todo reducido cuyo tipo sea menor que el
   * GENERAL (`r.tipo < (porUbicacion?.tipo ?? datos.tipoGeneral)`), no menor que el que
   * finalmente se aplica. Cuando un reducido SÍ se aplica, la lista puede quedarse con
   * tipos por encima de él, bajo el rótulo «Podrías pagar menos».
   *
   * Caso: Andalucía · perfil Joven · 140.000 € → la app cobra el 3,50 % (4.900,00 €) y el
   * aviso ofrece «6,00% — Vivienda habitual (valor ≤150.000€)», que sobre ese precio son
   * 8.400 € — 3.500 € MÁS — y «3,50% — Municipios despoblados», que no ahorra nada.
   *   esperado: la lista solo contiene tipos por debajo del 3,50 % aplicado (o el aviso no
   *             se pinta)  ·  obtenido: 6,00 % y 3,50 % presentados como rebaja.
   * El pie remata invitando a llamar a la oficina liquidadora «antes de contar con la
   * rebaja», así que el error no se queda en la pantalla.
   *
   * ✅ REPARADO el 13/09/2026, y el TESTIGO reescrito el 22/09 (hallazgo 1192).
   *
   * Seguía marcado `test.fail()` nueve días después de la reparación, y ya no vigilaba nada:
   * en este caso el aviso no se pinta, así que el test fallaba por su propia guarda de
   * montaje —`expect(ofrecidos.length).toBeGreaterThan(0)`— y no por el defecto. Playwright
   * lo contaba como «fallo esperado» y la suite salía verde, de modo que el testigo estaba
   * muerto en los DOS sentidos: no avisaba de que el hallazgo se había cerrado, y si la
   * regresión volviera seguiría en «x» sin que nadie se enterara. Es la forma de fallo del
   * §3 de los candados de juicio: un indicador que da siempre el mismo valor deja de informar.
   *
   * Reescrito para que informe por los dos lados, porque comprobar la invariante sobre una
   * lista VACÍA no prueba nada:
   *   · perfil JOVEN → se cobra el 3,50 % y el aviso NO se pinta (nada que ofrecer por debajo)
   *   · perfil GENERAL → se cobra el 7,00 % y el aviso SÍ aparece, con el 6,00 % de vivienda
   *     habitual, que es una rebaja REAL: ahí es donde la invariante tiene algo que decir.
   */
  test('767 (regresión) — el aviso no ofrece tipos por encima del aplicado, y sigue ofreciendo los de abajo', async ({
    page,
  }) => {
    await abrir(page);
    await page.locator('#ccaa-inmueble').selectOption('andalucia');
    await sembrar(page, 'Precio de la vivienda', '140000');
    await page.locator('#perfil-comprador').selectOption('joven');

    // El tipo que la app ha aplicado, leído del rótulo de la tarjeta
    const rotulo = await page.locator('h3', { hasText: /^ITP/ }).first().innerText();
    const aplicado = Number(rotulo.match(/([\d,]+)\s?%/)![1].replace(',', '.'));
    expect(aplicado).toBe(3.5);

    // Al joven andaluz ya se le cobra el reducido más bajo: no hay rebaja que ofrecerle, y el
    // aviso desaparece en vez de ofrecerle el 6,00 % como si lo fuera.
    await expect(page.locator('div[class*="avisoReducidos"]')).toHaveCount(0);

    // Y el mecanismo sigue vivo donde SÍ hay rebaja: al perfil general se le cobra el 7,00 % y
    // el 6,00 % de vivienda habitual es una rebaja de verdad.
    await page.locator('#perfil-comprador').selectOption('general');
    const rotuloGeneral = await page.locator('h3', { hasText: /^ITP/ }).first().innerText();
    const aplicadoGeneral = Number(rotuloGeneral.match(/([\d,]+)\s?%/)![1].replace(',', '.'));
    expect(aplicadoGeneral).toBe(7);

    const ofrecidos = await page
      .locator('div[class*="avisoReducidos"]')
      .first()
      .locator('li strong')
      .allInnerTexts();
    expect(
      ofrecidos.length,
      'el aviso tiene que seguir ofreciendo las rebajas reales',
    ).toBeGreaterThan(0);
    for (const linea of ofrecidos) {
      const tipo = Number(linea.match(/([\d,]+)\s?%/)![1].replace(',', '.'));
      expect(
        tipo,
        `«${linea}» se ofrece como rebaja sobre un ${aplicadoGeneral} % ya aplicado`,
      ).toBeLessThan(aplicadoGeneral);
    }
  });

  /**
   * ⚠️ HALLAZGO 12/09/2026 (MEDIO) — el mismo aviso afirma «El cálculo usa el tipo general»
   * cuando ha usado un tipo REDUCIDO.
   *
   * El texto es fijo y el aviso se pinta con solo que `noComprobables` traiga algo, sin
   * mirar si se aplicó el general o un reducido. El lector tiene delante dos frases
   * incompatibles sobre el mismo importe.
   *
   * Caso: Castilla y León · perfil Joven · 140.000 € → la tarjeta dice «ITP (4,00%)» —el
   * reducido— y el panel de la comunidad, tres dedos más arriba, «ITP General 8%»; el aviso
   * de debajo asegura que «el cálculo usa el tipo general».
   *   esperado: el aviso dice qué tipo se ha usado de verdad  ·  obtenido: «usa el tipo
   *             general» sobre una cuota liquidada al 4 %.
   */
  test('HALLAZGO — «usa el tipo general» no puede aparecer cuando se ha aplicado un reducido', async ({
    page,
  }) => {
    await abrir(page);
    await page.locator('#ccaa-inmueble').selectOption('castilla-leon');
    await sembrar(page, 'Precio de la vivienda', '140000');
    await page.locator('#perfil-comprador').selectOption('joven');

    // Se ha aplicado el reducido: 4 % frente al 8 % general que anuncia el panel
    await expect(page.getByRole('heading', { name: 'ITP (4,00 %)' })).toBeVisible();
    expect(ITP_CCAA['castilla-leon'].tipoGeneral).toBe(8);

    const texto = await page.locator('div[class*="avisoReducidos"]').first().innerText();
    expect(texto).not.toContain('usa el tipo general');
  });

  /**
   * ⚠️ HALLAZGO 12/09/2026 (BAJO) — el rótulo «Tipos reducidos disponibles en Aragón»
   * contradice a la nota de la ficha de Aragón que la propia pantalla imprime encima.
   *
   * Es el hallazgo 711, reparado el 11/09 en `simulador-gastos-compraventa-garaje`
   * («Beneficios fiscales en …, solo si se cumplen TODAS sus condiciones») y no aquí, que
   * es el hub del clúster. Desde el commit 7a02470c, Aragón no tiene tipos reducidos: tiene
   * bonificaciones sobre la cuota, y su `notas` lo dice con esas palabras.
   *
   * Caso: Aragón · perfil Joven · 200.000 € → el panel titula «Tipos reducidos disponibles
   * en Aragón:» y la nota de encima, «Aragón aplica bonificaciones sobre la cuota, no tipos
   * reducidos». Quien llame a su oficina liquidadora pedirá algo que allí no existe con ese
   * nombre.  ·  esperado: un rótulo que no diga «tipos reducidos» en una comunidad cuya
   * propia ficha lo niega.
   */
  test('HALLAZGO — el rótulo del panel contradice a la nota de la ficha de Aragón', async ({
    page,
  }) => {
    await abrir(page);
    await page.locator('#ccaa-inmueble').selectOption('aragon');
    await sembrar(page, 'Precio de la vivienda', '200000');
    await page.locator('#perfil-comprador').selectOption('joven');

    // La ficha lo niega por escrito, y la app imprime esa nota en la misma pantalla
    expect(ITP_CCAA.aragon.notas).toContain('no tipos reducidos');
    expect(await page.locator('body').innerText()).toContain(
      'Aragón aplica bonificaciones sobre la cuota, no tipos reducidos',
    );

    const rotulo = await page.locator('div[class*="tiposReducidosInfo"]').first().locator('h4').innerText();
    expect(rotulo.toLowerCase()).not.toContain('tipos reducidos');
  });

  /**
   * ⚠️ HALLAZGO 12/09/2026 (MEDIO, dato) — el plazo de liquidación del ITP va escrito a
   * mano TRES veces, sin norma, pudiendo salir de `PLAZO_ITP` de `data/fiscal`.
   *
   * `PLAZO_ITP` nació el 11/09/2026 en el commit 21a13c6b precisamente por este defecto
   * (hallazgo 713), y lo consume ya `simulador-gastos-compraventa-garaje` citando su
   * `baseNormativa`. Aquí las tres frases siguen con el «30 días hábiles» tecleado, y en la
   * misma oración el recargo SÍ viene sellado desde `ESCALA_RECARGO_EXTEMPORANEO` con el
   * art. 27.2 LGT impreso al lado: un dato con fuente y otro sin ella, y el segundo es el
   * que fija la fecha desde la que corre el primero.
   *
   * Agravante propio de esta app: tiene selector de comunidad, y `PLAZO_ITP.aviso` advierte
   * de que el plazo es de gestión autonómica (Cataluña lo tiene en un mes en varios
   * supuestos). La app lo afirma plano para las 19 comunidades de su desplegable.
   *
   * Caso: «Ver guía educativa» → paso 5, consejo «Planifica los plazos fiscales» y el
   * recuadro de errores comunes → «30 días hábiles» ×3, sin RD 828/1995 en ninguna.
   *   esperado: la cifra derivada de PLAZO_ITP.dias con su PLAZO_ITP.baseNormativa
   *   obtenido: tres literales sin norma.
   */
  test('HALLAZGO (dato) — el plazo del ITP debe salir de PLAZO_ITP, con su norma', async ({
    page,
  }) => {
    await abrir(page);
    await page.getByRole('button', { name: /Ver guía educativa/ }).click();

    // El valor que hay escrito coincide con el sellado: lo que falta es el vínculo y la norma
    expect(PLAZO_ITP.dias).toBe(30);
    expect(PLAZO_ITP.unidad).toBe('días hábiles');

    const cuerpo = await page.locator('body').innerText();
    expect((cuerpo.match(/30 días hábiles/g) ?? []).length).toBeGreaterThan(0);
    expect(cuerpo).toContain(PLAZO_ITP.baseNormativa);
  });

  /**
   * ⚠️ HALLAZGO 12/09/2026 (BAJO, dato) — la rama de TERRENO liquida el IVA leyendo la
   * constante del LOCAL comercial.
   *
   * `IVA_INMUEBLES_2025.local` es el IVA del local comercial; el del suelo edificable es el
   * tipo general del art. 90 LIVA, que en `data/fiscal` es `PORCENTAJES_IVA.general`. Es
   * literalmente el hallazgo 734, reparado el 11/09 en
   * `simulador-gastos-compraventa-solar` («el solar lee el IVA del tipo general del art. 90
   * LIVA en vez de la constante del LOCAL comercial, que es otro dato») y no en el hub.
   *
   * Hoy las dos valen 21, así que NINGUNA cifra está mal: existen separadas para poder
   * divergir, y el día que lo hagan esta app se quedará atrás sin que nada avise — el mismo
   * razonamiento con el que se cerró el hallazgo 674 en la rama del anejo.
   *
   * Caso: Terreno · primera mano · Madrid · 400.000 € → «IVA (21,00%) 84.000,00 €», cifra
   * correcta leída de la constante equivocada.
   */
  test('HALLAZGO (dato) — el IVA del terreno debe salir del tipo general, no del local', async ({
    page,
  }) => {
    await abrir(page);
    await page.getByRole('button', { name: /Terreno/ }).click();
    await page.getByRole('button', { name: /Primera mano/ }).click();
    await page.locator('#ccaa-inmueble').selectOption('madrid');
    await sembrar(page, 'Precio del inmueble', '400000');

    // La cifra de hoy es correcta porque las dos constantes coinciden…
    expect(PORCENTAJES_IVA.general).toBe(IVA_INMUEBLES_2025.local);
    await expect(page.getByRole('heading', { name: 'IVA (21,00 %)' })).toBeVisible();
    expect(await valorTarjeta(page, /^IVA/)).toBe('84.000,00 €');

    // …pero la rama del suelo tiene que leer el tipo general, como ya hace el simulador de solar
    const fuente = readFileSync(
      join(process.cwd(), 'app/estimador-compraventa-inmueble/page.tsx'),
      'utf8',
    );
    expect(fuente).toContain('PORCENTAJES_IVA.general');
  });

  /**
   * ⚠️ HALLAZGO 12/09/2026 (BAJO) — el aviso imprime el mismo límite de valor hasta tres
   * veces en una línea, y en dos formatos distintos.
   *
   * La línea junta el `nombre` del reducido, su array `condiciones` y, detrás, el
   * `valorMaximo` formateado. Cuando el tope ya viaja en el nombre o en las condiciones
   * —que es lo normal en la tabla— sale repetido, y con dos escrituras del mismo número.
   *
   * Caso: Andalucía · perfil Joven · 140.000 € → «6,00% — Vivienda habitual
   * (valor ≤150.000€) / Requisitos: Vivienda habitual · Valor ≤ 150.000 € · Valor máximo
   * 150.000,00 €»: el tope aparece tres veces y escrito de tres maneras.
   *   esperado: el límite se dice UNA vez  ·  obtenido: tres.
   */
  test('HALLAZGO — el límite de valor no se puede imprimir tres veces en la misma línea', async ({
    page,
  }) => {
    await abrir(page);
    await page.locator('#ccaa-inmueble').selectOption('andalucia');
    await sembrar(page, 'Precio de la vivienda', '140000');
    // ⚠️ 13/09/2026: con el perfil JOVEN este caso ya no existe. La reparación del hallazgo
    // 767 dejó en el aviso solo las rebajas REALES sobre el tipo aplicado, y a un joven
    // andaluz se le cobra el 3,50 %, así que el 6,00 % de vivienda habitual —que era la
    // línea con el tope repetido— desapareció de la lista, que es justo lo que aquel
    // hallazgo pedía. Con el perfil general sí se ofrece, porque 6,00 < 7,00.
    const linea = await page
      .locator('div[class*="avisoReducidos"]')
      .first()
      .locator('li')
      .filter({ hasText: 'Vivienda habitual (valor' })
      .innerText();
    expect((linea.match(/150\.000/g) ?? []).length).toBe(1);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Inspector 14/09/2026 — re-inspección: los ANEJOS residenciales y la segunda boca
// del JSON-LD
// ═══════════════════════════════════════════════════════════════════════════════
//
// Por qué esta tanda mira aquí: once re-inspecciones han recorrido la vivienda —Madrid,
// Cataluña, Baleares, Aragón, Castilla y León, Valencia, Murcia, La Rioja, Ceuta,
// Melilla, Canarias, Galicia, Cantabria, Extremadura y el País Vasco— y las ramas de
// local, nave y terreno. Lo que ninguna había pisado es el camino de SEGUNDA MANO de los
// dos anejos (garaje y trastero) con un perfil de comprador elegido, que es justo donde
// `esResidencial` hace dos trabajos distintos a la vez, y la escala progresiva de
// Asturias, la única de las siete que no tenía caso.
//
// De dónde sale cada cifra esperada: `data/itp-ccaa.ts` (ITP_CCAA['asturias'], escala
// 8 %/9 %/10 %; ITP_CCAA['andalucia'], tipo general 7 % y reducido «Jóvenes < 35 años»
// del 3,5 % con la condición «Vivienda habitual»; ARANCELES_NOTARIO y ARANCELES_REGISTRO,
// RD 1426/1989 y RD 1427/1989) y `data/fiscal/inmuebles.ts`
// (TRAMOS_GANANCIAS_PATRIMONIALES_2025: 19 % hasta 6.000 € · 21 % hasta 50.000 € · 23 %
// hasta 200.000 €). Los aranceles de 140.000 € coinciden con los ya verificados en el
// CASO B y en el CASO 40 de este mismo fichero.
//
// Los tres casos van resueltos A MANO antes de abrir el navegador; el desarrollo va
// comentado junto a cada aserción.

test.describe('Inspector 14/09/2026 — anejos residenciales y segunda boca del JSON-LD', () => {
  /** Espera a que React monte y siembra comprobando que el estado lo recogió. */
  async function sembrar14(page: Page, etiqueta: string, valor: string): Promise<void> {
    const campo = page.locator(`input[aria-label="${etiqueta}"]`);
    await campo.fill(valor);
    await esperarValorEnReact(page, campo, valor);
    await campo.blur();
  }

  async function abrir14(page: Page): Promise<void> {
    await page.goto(RUTA);
    // Un input de la página como testigo: un clic anterior a la hidratación también se pierde
    await esperarHidratacion(page, ['input[aria-label="Precio de la vivienda"]']);
  }

  /**
   * CASO 43 (normal) — Asturias, segunda mano, vivienda de 250.000 €, perfil general.
   *
   * Asturias era la única de las siete comunidades con escala progresiva sin caso en este
   * fichero. 250.000 € cae ENTERO dentro del primer tramo, así que la cuota coincide con el
   * tipo plano y sirve de control del tramo bajo de la escala.
   *   ITP       = 250.000 × 8 %   (ITP_CCAA['asturias'].tramosProgresivos:
   *               8 % hasta 300.000 · 9 % hasta 500.000 · 10 % resto)   =  20.000,00 €
   * Notaría y registro recalculados a mano el 12/10/2026 con la rebaja del 5 % del nº 2.1
   * (hallazgos 2901 y 2902), como en el CASO 41:
   *   Notaría   = arancel(250.000) × 0,95 × 1,21 × 1,75                 =     771,33 €
   *     arancel = 90,151816 + 24.040,49×0,45 % + 30.050,60×0,15 %
   *               + 90.151,82×0,10 % + 99.746,97×0,05 %
   *               = 383,435226 → ×0,95 = 364,263465 → ×1,21 = 440,758792 → ×1,75 = 771,327886
   *               (sin la rebaja, 811,92)
   *   Registro  = (201,212547 × 0,95 + 6,010121 + 3,005061) × 1,21      =     242,20 € (antes 254,37)
   *   Gestoría (GESTORIA_TIPICA, valor por defecto del campo)            =     300,00 €
   *   AJD       = 0 — segunda mano: TPO y AJD son incompatibles (art. 31.2 TRLITPAJD)
   *   Total gastos = 20.000 + 771,33 + 242,20 + 300                     =  21.313,53 €
   *   % sobre precio = 21.313,53 / 250.000                               =       8,53 %
   *   Coste total = 250.000 + 21.313,53                                  = 271.313,53 €
   */
  test('CASO 43 (normal) — Asturias, segunda mano, vivienda de 250.000 €', async ({ page }) => {
    await abrir14(page);
    await page.locator('#ccaa-inmueble').selectOption('asturias');
    await sembrar14(page, 'Precio de la vivienda', '250000');

    await expect(page.getByRole('heading', { name: 'ITP (8,00 %)' })).toBeVisible();
    expect(await valorTarjeta(page, /^ITP/)).toBe('20.000,00 €');
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('771,33 €');
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('242,20 €');
    expect(await valorTarjeta(page, 'Gastos de gestoría')).toBe('300,00 €');
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('21.313,53 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toBe('8,53 % sobre el precio');
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('271.313,53 €');

    // Y que la escala que la app anuncia es la de la tabla, no otra. Desde el 24/09/2026 el
    // recuadro la escribe `describirSubidaITP` del motor, con el espacio antes del % («8 %»).
    const tramos = (ITP_CCAA['asturias'].tramosProgresivos ?? []).map((t) => `${t.tipo} %`);
    await expect(page.locator('p[class*="infoCcaaNote"]').first()).toContainText(tramos.join(' → '));
  });

  /**
   * ⚠️ HALLAZGO 14/09/2026 (ALTO, cálculo) — un GARAJE o un TRASTERO sueltos reciben los
   * tipos reducidos de ITP reservados a la VIVIENDA HABITUAL, y la cuota sale a la MITAD.
   *
   * `esResidencial` (INMUEBLES_RESIDENCIALES = vivienda, garaje, trastero) se usa para dos
   * cosas distintas en la misma línea: decidir el tipo de IVA del anejo —donde sí agrupa
   * bien— y responder a `elegirTipoITP` si la operación puede ser vivienda habitual, donde
   * NO: un garaje suelto no lo es nunca. El contrato de `elegirTipoITP` lo dice por escrito
   * («`false` en garaje, trastero, local, nave y terreno») y las dos apps hermanas lo pasan
   * así (`simulador-gastos-compraventa-garaje` y `-trastero`, ambas con el comentario «un
   * garaje suelto NO lo es nunca»). Aquí llega `true`.
   *
   * Es la misma familia del hallazgo 627, que el 07/09 cerró la puerta a local, nave y
   * terreno forzando el perfil a «general»; los dos anejos se quedaron dentro porque para
   * ellos `esResidencial` vale `true`.
   *
   * Caso: Garaje/Parking · segunda mano · Andalucía · perfil Joven · 140.000 €
   *   esperado: ITP al tipo general del 7 % = 9.800,00 € — el reducido «Jóvenes < 35 años»
   *     del 3,5 % exige «Vivienda habitual» (ITP_CCAA['andalucia']), condición que un garaje
   *     suelto no cumple. Es lo que cobra la app hermana para esa misma operación.
   *   obtenido: «ITP (3,50%) — 4900,00 €». Infravalora el impuesto en 4.900 €, la mitad, y
   *     en la dirección que el propio motor documenta como no recuperable.
   */
  test('HALLAZGO 14/09 — un garaje suelto no puede cobrar el tipo reducido de VIVIENDA HABITUAL', async ({
    page,
  }) => {
    await abrir14(page);
    await page.getByRole('button', { name: /Garaje\/Parking/ }).click();
    await page.locator('#ccaa-inmueble').selectOption('andalucia');
    await sembrar14(page, 'Precio del inmueble', '140000');
    await page.locator('#perfil-comprador').selectOption('joven');

    // El reducido que se cuela exige vivienda habitual: está en la tabla, no en la memoria
    const joven = ITP_CCAA['andalucia'].tiposReducidos.find((t) => /j[oó]venes/i.test(t.nombre));
    expect(joven?.condiciones).toContain('Vivienda habitual');

    //   ITP       = 140.000 × 7 % (tipo general de Andalucía)     =  9.800,00 €
    // Notaría y registro con la rebaja del 5 % del nº 2.1 (hallazgos 2901 y 2902; recalculado a
    // mano el 12/10/2026 como en el CASO B; sin la rebaja, 684,60 y 208,86):
    //   Notaría   = 323,308711 × 0,95 × 1,21 × 1,75               =    650,38 €
    //   Registro  = (163,598684 × 0,95 + 6,010121 + 3,005061) × 1,21 = 198,97 €
    //   Gestoría                                                   =    300,00 €
    //   Total gastos = 9.800 + 650,38 + 198,97 + 300              = 10.949,35 €
    //   Coste total  = 140.000 + 10.949,35                        = 150.949,35 €
    await expect(page.getByRole('heading', { name: 'ITP (7,00 %)' })).toBeVisible();
    expect(await valorTarjeta(page, /^ITP/)).toBe('9800,00 €');
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('10.949,35 €');
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('150.949,35 €');
  });

  /**
   * El mismo defecto por su otra salida: con perfil GENERAL, el aviso «Podrías pagar menos»
   * le ofrece a un garaje un tipo cuyo requisito impreso al lado es «Vivienda habitual».
   *
   * Caso: Garaje/Parking · segunda mano · Madrid · perfil General · 140.000 €
   *   esperado: ningún tipo con el requisito «Vivienda habitual» (Madrid solo tiene ese, el
   *     del 5,40 %, al alcance de cualquiera, así que el aviso no debería aparecer).
   *   obtenido: «5,40% — Vivienda habitual (bonif. 10%) · Requisitos: Vivienda habitual ·
   *     Valor ≤ 250.000 €» — la rebaja que se ofrece es aritméticamente imposible para un
   *     garaje, y el pie del aviso invita a llamar a la oficina liquidadora.
   *
   * Es literalmente el hallazgo H1 del 07/09 («un local comercial no puede recibir la oferta
   * de un tipo de VIVIENDA HABITUAL»), que se reparó para local, nave y terreno y no para
   * los dos anejos.
   */
  test('HALLAZGO 14/09 — a un garaje no se le ofrece una rebaja que exige vivienda habitual', async ({
    page,
  }) => {
    await abrir14(page);
    await page.getByRole('button', { name: /Garaje\/Parking/ }).click();
    await page.locator('#ccaa-inmueble').selectOption('madrid');
    await sembrar14(page, 'Precio del inmueble', '140000');

    const aviso = page.locator('div[class*="avisoReducidos"]');
    if (await aviso.count()) {
      expect(await aviso.first().innerText()).not.toContain('Vivienda habitual');
    }
  });

  /**
   * CASO 44 (debe rechazarse) — la exención por reinversión NO puede sobrevivir a que la
   * vivienda deje de ser la habitual.
   *
   * El art. 38 LIRPF la reserva a quien transmite su vivienda habitual, y la casilla de
   * reinversión solo se pinta mientras «Es mi vivienda habitual» está marcada — pero su
   * ESTADO sobrevive al desmarcado (es el patrón del hallazgo 627, aquí por el lado del
   * vendedor). Este caso comprueba que el cálculo sí se entera y vuelve a cobrar el IRPF
   * entero, aunque la casilla marcada ya no esté a la vista para desmarcarla.
   *
   * Venta 300.000 € · compra 200.000 € · comisión 3 % (valor por defecto) · sin plusvalía
   * municipal (faltan sus datos, así que queda «Sin calcular» y fuera del neto).
   *   valor de transmisión = 300.000 − 9.000                         = 291.000,00 €
   *   ganancia             = 291.000 − 200.000                       =  91.000,00 €
   *   con vivienda habitual y 300.000 € reinvertidos: importe obtenido 291.000 €,
   *     proporción reinvertida = mín(1; 300.000/291.000) = 1 → EXENTO, neto 291.000,00 €
   *   al desmarcar la vivienda habitual (TRAMOS_GANANCIAS_PATRIMONIALES_2025):
   *     6.000 × 19 %  =  1.140,00
   *    44.000 × 21 %  =  9.240,00
   *    41.000 × 23 %  =  9.430,00
   *     IRPF          = 19.810,00 €
   *   total gastos = 9.000 + 19.810                                  =  28.810,00 €
   *   neto         = 300.000 − 28.810                                = 271.190,00 €
   */
  test('CASO 44 (debe rechazarse) — la reinversión no exime una vivienda que ya no es la habitual', async ({
    page,
  }) => {
    await abrir14(page);
    await sembrar14(page, 'Precio de la vivienda', '300000');
    await page.getByRole('button', { name: /Vendedor/ }).click();
    await sembrar14(page, 'Precio de compra original', '200000');
    await page.getByText('Voy a reinvertir en otra vivienda habitual').click();
    await sembrar14(page, 'Importe que reinviertes en la nueva vivienda', '300000');

    // Punto de partida: con vivienda habitual, la reinversión total sí exime
    expect(await valorTarjeta(page, 'Ganancia patrimonial')).toBe('91.000,00 €');
    expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('EXENTO');
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('291.000,00 €');

    // Y al dejar de ser la vivienda habitual, el art. 38 LIRPF ya no ampara nada
    await page.getByText('Es mi vivienda habitual').click();
    await expect(page.getByRole('heading', { name: 'IRPF sobre ganancia' })).toBeVisible();
    await expect
      .poll(async () => valorTarjeta(page, 'IRPF sobre ganancia'))
      .toBe('19.810,00 €');
    expect(await valorTarjeta(page, 'Total gastos vendedor')).toBe('28.810,00 €');
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('271.190,00 €');
  });

  /**
   * ⚠️ HALLAZGO 14/09/2026 (MEDIO, contenido) — el FAQPage que leen los asistentes de IA
   * publica una TERCERA exención del IRPF que no existe, y contradice al otro FAQPage de
   * la misma página.
   *
   * `metadata.ts` inyecta dos bloques: el de `jsonLd` dice «Existen dos exenciones
   * importantes en el IRPF […]: la reinversión […] y la de los mayores de 65 años», que es
   * lo que aplica el motor (`data/fiscal/ganancia-inmueble.ts`, arts. 38 y 33.4.b LIRPF) y
   * lo que dice el bloque educativo visible. El de `faqJsonLd` añade «vivienda habitual con
   * hipoteca…», que no es ninguna exención —el principal pendiente solo minora el importe
   * obtenido a efectos del art. 41 RIRPF— y remata con puntos suspensivos que sugieren más.
   *
   * Caso: `curl /estimador-compraventa-inmueble/` → respuesta a «¿Qué impuestos paga el
   * vendedor al vender un inmueble?»
   *   esperado: las DOS exenciones que el motor aplica.
   *   obtenido: «reinversión en vivienda habitual, mayores de 65 años, vivienda habitual
   *     con hipoteca…». Es la boca que se cita sin el disclaimer al lado.
   */
  test('HALLAZGO 14/09 — el FAQPage no puede inventar una tercera exención del IRPF', async ({
    page,
  }) => {
    await page.goto(RUTA);
    const jsonLd = (
      await page.locator('script[type="application/ld+json"]').allTextContents()
    ).join(' ');

    expect(jsonLd).toContain('mayores de 65 años');
    expect(jsonLd).toContain('reinversión');
    expect(jsonLd).not.toContain('vivienda habitual con hipoteca');
  });

  /**
   * ⚠️ HALLAZGO 14/09/2026 (BAJO, dato) — residuo de la reparación del 12/09: el CÁLCULO del
   * terreno ya lee el tipo general del art. 90 LIVA, pero el bloque educativo sigue
   * atribuyendo a los terrenos el IVA del LOCAL comercial, en dos sitios.
   *
   * `page.tsx:1453` («Los locales comerciales, naves industriales y terrenos pagan IVA al
   * {IVA_INMUEBLES_2025.local}%») y `page.tsx:1550` (fila IVA de la tabla comparativa,
   * «{obraNueva}% ({local}% locales/terrenos)»). Hoy las dos constantes valen 21, así que
   * ninguna cifra está mal; existen separadas para poder divergir, y el día que lo hagan el
   * texto dirá una cosa y la calculadora cobrará otra en la misma página.
   *
   * Caso: Ver guía educativa → tarjeta «Primera mano → IVA + AJD»
   *   esperado: el suelo edificable citado con PORCENTAJES_IVA.general.
   *   obtenido: agrupado con el local comercial bajo IVA_INMUEBLES_2025.local.
   */
  test('HALLAZGO 14/09 (dato) — el bloque educativo atribuye al terreno el IVA del local', async () => {
    // Hoy coinciden: por eso no hay ninguna cifra mal en pantalla
    expect(PORCENTAJES_IVA.general).toBe(IVA_INMUEBLES_2025.local);

    const fuente = readFileSync(
      join(process.cwd(), 'app/estimador-compraventa-inmueble/page.tsx'),
      'utf8',
    );
    // ⚠️ Se mide por FRAGMENTO, no por línea (14/09/2026). La reparación deja la fila de la
    // tabla comparativa nombrando los dos tipos en la misma línea —«21% locales y naves ·
    // 21% terrenos», cada uno con su constante—, que es exactamente lo que había que
    // conseguir, y un filtro por línea lo leía como el defecto. Lo que no puede ocurrir es
    // que el tipo del LOCAL sea el que acompaña a la palabra «terreno».
    const mezclan = fuente
      .split('\n')
      .flatMap((l) => l.split('·'))
      .filter((trozo) => /terreno/i.test(trozo) && trozo.includes('IVA_INMUEBLES_2025.local'));
    expect(mezclan, 'ningún fragmento debe atribuir al terreno el IVA del local').toEqual([]);
  });

  /**
   * ⚠️ HALLAZGO 14/09/2026 (BAJO, dato) — el ejemplo de «Marta» deriva del motor el tipo y
   * el importe, pero teclea a mano el TOPE de valor y la EDAD que lo condicionan.
   *
   * `page.tsx:1605`: «Al ser menor de 35 años y no superar los 150.000 €». Los dos datos
   * están en la tabla —`ITP_CCAA['andalucia']`, reducido «Jóvenes < 35 años», con
   * `valorMaximo: 150000` y la condición «Menor de 35 años»— y el párrafo ya llama a esa
   * misma entrada para el tipo. Es la familia de los hallazgos 581, 584, 629 y 719/720,
   * reparados uno a uno en esta app.
   *
   * Agravante: `EJEMPLO_MARTA_TIPO_JOVEN` elige el reducido POR NOMBRE y no comprueba su
   * `valorMaximo`, así que si Andalucía bajara el tope por debajo de los 140.000 € del
   * ejemplo, la página seguiría publicando «se aplica el tipo reducido del 3,5 %» para una
   * compra que ya no podría acogerse, con el tope viejo escrito al lado.
   *
   * Caso: Ver guía educativa → tarjeta «Comprador primera vivienda»
   *   esperado: tope y edad derivados de la ficha de la comunidad.
   *   obtenido: «no superar los 150.000 €» y «menor de 35 años» literales.
   */
  test('HALLAZGO 14/09 (dato) — el ejemplo de Marta teclea el tope y la edad del reducido', async () => {
    const joven = ITP_CCAA['andalucia'].tiposReducidos.find((t) => /j[oó]venes/i.test(t.nombre));
    expect(joven?.valorMaximo).toBe(150000);
    expect(joven?.condiciones).toContain('Menor de 35 años');

    const fuente = readFileSync(
      join(process.cwd(), 'app/estimador-compraventa-inmueble/page.tsx'),
      'utf8',
    );
    const tecleados = fuente
      .split('\n')
      .filter((l) => /no superar los 150\.000 €|Al ser menor de 35 años/.test(l));
    expect(tecleados, 'el tope y la edad del reducido no pueden ir tecleados').toEqual([]);
  });
});

test.describe('Inspector 21/09/2026 — re-inspección: el tope del reducido y el hueco del nombre', () => {
  /** Espera a que React monte y siembra comprobando que el estado lo recogió. */
  async function sembrar21(page: Page, etiqueta: string, valor: string): Promise<void> {
    const campo = page.locator(`input[aria-label="${etiqueta}"]`);
    await campo.fill(valor);
    await esperarValorEnReact(page, campo, valor);
    await campo.blur();
  }

  async function abrir21(page: Page): Promise<void> {
    await page.goto(RUTA);
    // Un input de la página como testigo: un clic anterior a la hidratación también se pierde
    await esperarHidratacion(page, ['input[aria-label="Precio de la vivienda"]']);
  }

  /**
   * CASO 45 (normal) — Castilla-La Mancha, segunda mano, vivienda de 160.000 €, perfil general.
   *
   * Era, con Navarra, una de las dos únicas comunidades sin ningún caso en este fichero. No
   * tiene escala progresiva, así que sirve de control del camino plano con tipo general alto.
   *   ITP       = 160.000 × 9 %  (ITP_CCAA['castilla-mancha'].tipoGeneral, que se lee de
   *               TIPOS_ITP_CCAA_2025 en data/fiscal/inmuebles.ts)          =  14.400,00 €
   * Notaría y registro recalculados a mano el 12/10/2026 con la rebaja del 5 % del nº 2.1
   * (hallazgos 2901 y 2902):
   *   Notaría   = arancel(160.000) × 0,95 × 1,21 × 1,75                     =     680,80 €
   *     arancel = 90,151816 + 24.040,49×0,45 % + 30.050,60×0,15 %
   *               + 90.151,82×0,10 % + 9.746,97×0,05 %  = 338,435226
   *               → ×0,95 = 321,513465 → ×1,21 = 389,031292 → ×1,75 = 680,804761 (antes 716,63)
   *   Registro  = (174,212547 × 0,95 + 6,010121 + 3,005061) × 1,21          =     211,17 € (antes 221,70)
   *   Gestoría (GESTORIA_TIPICA, valor por defecto del campo)                =     300,00 €
   *   AJD       = 0 — segunda mano: TPO y AJD son incompatibles (art. 31.2 TRLITPAJD)
   *   Total gastos = 14.400 + 680,80 + 211,17 + 300                         =  15.591,97 €
   *   % sobre precio = 15.591,97 / 160.000                                   =       9,74 %
   *   Coste total  = 160.000 + 15.591,97                                     = 175.591,97 €
   */
  test('CASO 45 (normal) — Castilla-La Mancha, segunda mano, vivienda de 160.000 €', async ({
    page,
  }) => {
    await abrir21(page);
    await page.locator('#ccaa-inmueble').selectOption('castilla-mancha');
    await sembrar21(page, 'Precio de la vivienda', '160000');

    expect(ITP_CCAA['castilla-mancha'].tipoGeneral).toBe(9);
    await expect(page.getByRole('heading', { name: 'ITP (9,00 %)' })).toBeVisible();
    expect(await valorTarjeta(page, /^ITP/)).toBe('14.400,00 €');
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('680,80 €');
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('211,17 €');
    expect(await valorTarjeta(page, 'Gastos de gestoría')).toBe('300,00 €');
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('15.591,97 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toBe('9,74 % sobre el precio');
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('175.591,97 €');
  });

  /**
   * CASO 46 (límite) — Andalucía, perfil Joven, EXACTAMENTE 150.000 €: el canto del tope.
   *
   * Vigila la regresión del hallazgo ALTO del 14/09 POR LOS DOS LADOS, que es lo que un
   * arreglo de este tipo puede romper: que el anejo suelto deje de cobrar el tipo de vivienda
   * habitual, y que la vivienda que SÍ cumple los requisitos lo siga cobrando. El precio se
   * pone en el borde (`precio <= valorMaximo` en `elegirTipoITP` y `superaElTope`) para que
   * el mismo caso mida también que el tope se compara con «≤» y no con «<».
   *
   * Ficha: ITP_CCAA['andalucia'] — tipo general 7 %; reducido «Jóvenes < 35 años» al 3,5 %,
   * `valorMaximo` 150.000 € y condiciones «Menor de 35 años · Vivienda habitual · Valor ≤
   * 150.000 €». Un trastero SUELTO no es vivienda habitual nunca —el contrato de
   * `elegirTipoITP` lo dice por escrito— así que para él solo cabe el tipo general.
   *
   *   VIVIENDA  ITP = 150.000 × 3,5 %                                  =   5.250,00 €
   *   TRASTERO  ITP = 150.000 × 7 %                                    =  10.500,00 €
   * Notaría y registro recalculados a mano el 12/10/2026 con la rebaja del 5 % del nº 2.1
   * (hallazgos 2901 y 2902):
   *   Notaría   = arancel(150.000) × 0,95 × 1,21 × 1,75                 =     670,49 €
   *     arancel = 90,151816 + 108,182205 + 45,0759 + 89.898,79×0,10 %
   *             = 333,308711 → ×0,95 = 316,643275 → ×1,21 = 383,138363 → ×1,75 = 670,492135
   *             (sin la rebaja, 705,78)
   *   Registro  = (171,098684 × 0,95 + 6,010121 + 3,005061) × 1,21      =     207,59 € (antes 217,94)
   *   Gestoría                                                           =     300,00 €
   *   Total gastos vivienda = 5.250 + 670,49 + 207,59 + 300             =   6.428,08 €  (4,29 %)
   *   Total gastos trastero = 10.500 + 670,49 + 207,59 + 300            =  11.678,08 €
   *   Coste total vivienda  = 156.428,08 €   ·   trastero = 161.678,08 €
   */
  test('CASO 46 (límite) — Andalucía, joven, 150.000 € justo en el tope: la vivienda sí y el trastero no', async ({
    page,
  }) => {
    const joven = ITP_CCAA['andalucia'].tiposReducidos.find((t) => /j[oó]venes/i.test(t.nombre));
    expect(joven?.tipo).toBe(3.5);
    expect(joven?.valorMaximo).toBe(150000);
    expect(joven?.condiciones).toContain('Vivienda habitual');

    await abrir21(page);
    await page.locator('#ccaa-inmueble').selectOption('andalucia');
    await sembrar21(page, 'Precio de la vivienda', '150000');
    await page.locator('#perfil-comprador').selectOption('joven');

    // La vivienda que cumple los requisitos SIGUE recibiendo el reducido, con el precio
    // justo en el tope: la reparación del 14/09 no podía pasarse de frenada.
    await expect(page.getByRole('heading', { name: 'ITP (3,50 %)' })).toBeVisible();
    expect(await valorTarjeta(page, /^ITP/)).toBe('5250,00 €');
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('670,49 €');
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('207,59 €');
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('6428,08 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toBe('4,29 % sobre el precio');
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('156.428,08 €');

    // Y el MISMO perfil, el mismo precio y la misma comunidad sobre un TRASTERO suelto
    // vuelven al tipo general: el doble de cuota, que es la dirección correcta.
    await page.getByRole('button', { name: /Trastero/ }).click();
    await expect(page.getByRole('heading', { name: 'ITP (7,00 %)' })).toBeVisible();
    expect(await valorTarjeta(page, /^ITP/)).toBe('10.500,00 €');
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('11.678,08 €');
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('161.678,08 €');
  });

  /**
   * CASO 47 (debe rechazarse) — «-0,5» años de tenencia: el −0 de `Math.trunc`.
   *
   * Es el hallazgo 764 por su rincón exacto, y no lo cubre el CASO 39, que prueba el entero
   * «-5»: `Math.trunc(-0,5)` devuelve **-0**, y `-0 >= 0` es `true`, así que la guarda
   * escrita sobre el valor truncado dejaba pasar el decimal negativo y liquidaba la
   * plusvalía con el coeficiente de «Menos de 1 año» (0,14) a partir de un dato imposible.
   * El campo NO lleva `min`, así que el blur no lo reescribe y el «-0,5» permanece a la
   * vista (hallazgo 722): la app tiene que decir «Sin calcular», no inventar un supuesto.
   *
   * Venta 250.000 € · compra 180.000 € · suelo catastral 60.000 € · comisión 3 % (defecto).
   *   RECHAZADO («-0,5» años): plusvalía «Sin calcular» y fuera del neto.
   *     ganancia = (250.000 − 7.500) − 180.000                    =  62.500,00 €
   *     IRPF (TRAMOS_GANANCIAS_PATRIMONIALES_2025):
   *        6.000 × 19 % = 1.140 · 44.000 × 21 % = 9.240 · 12.500 × 23 % = 2.875
   *        IRPF                                                    =  13.255,00 €
   *     total gastos = 7.500 + 13.255                              =  20.755,00 €
   *     neto         = 250.000 − 20.755                            = 229.245,00 €
   *   CONTROL (8 años, dato válido): coeficiente 0,19 del art. 107.4 TRLRHL en la redacción
   *     del RDL 8/2023 (era 0,10 con la tabla caducada, hallazgo 1559) y
   *     PLUSVALIA_MUNICIPAL_META.tipoOrientativo (25 %).
   *     plusvalía = 60.000 × 0,19 × 25 %                           =   2.850,00 €
   *     ganancia  = (250.000 − 7.500 − 2.850) − 180.000            =  59.650,00 €
   *     IRPF      = 1.140 + 9.240 + 9.650 × 23 % (2.219,50)        =  12.599,50 €
   *     total gastos = 2.850 + 7.500 + 12.599,50                   =  22.949,50 €
   *     neto         = 250.000 − 22.949,50                         = 227.050,50 €
   */
  test('CASO 47 (debe rechazarse) — «-0,5» años de tenencia no puede liquidar plusvalía', async ({
    page,
  }) => {
    expect(COEFICIENTES_IIVTNU_2025.find((c) => c.anios === 0)?.coeficiente).toBe(0.15);
    expect(COEFICIENTES_IIVTNU_2025.find((c) => c.anios === 8)?.coeficiente).toBe(0.19);
    expect(PLUSVALIA_MUNICIPAL_META.tipoOrientativo).toBe(25);

    await abrir21(page);
    await sembrar21(page, 'Precio de la vivienda', '250000');
    await page.getByRole('button', { name: /Vendedor/ }).click();
    await sembrar21(page, 'Precio de compra original', '180000');
    await sembrar21(page, 'Valor catastral del suelo', '60000');
    await sembrar21(page, 'Años de propiedad', '-0,5');

    // El dato imposible se queda a la vista, sin reescribirse a 0 (que SÍ es un supuesto)
    expect(await page.locator('input[aria-label="Años de propiedad"]').inputValue()).toBe('-0,5');
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('Sin calcular');
    expect(await valorTarjeta(page, 'Total gastos vendedor')).toBe('20.755,00 €');
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('229.245,00 €');
    expect(await descripcionTarjeta(page, 'IMPORTE NETO VENDEDOR')).toContain(
      'No descuenta la plusvalía municipal',
    );

    // CONTROL: con un dato válido sí liquida, así que el rechazo de arriba no es parálisis
    await sembrar21(page, 'Años de propiedad', '8');
    await expect.poll(async () => valorTarjeta(page, 'Plusvalía municipal')).toBe('2850,00 €');
    expect(await descripcionTarjeta(page, 'Plusvalía municipal')).toBe(
      'Método objetivo (falta el valor catastral total para comparar)',
    );
    expect(await valorTarjeta(page, 'Total gastos vendedor')).toBe('22.949,50 €');
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('227.050,50 €');
  });

  /**
   * ✅ HALLAZGO 1155 del 21/09/2026 (MEDIO, contenido), REPARADO el 21/09 — era el RESIDUO
   * del hallazgo MEDIO del 14/09: a un garaje o un trastero SUELTOS se les seguía ofreciendo
   * un tipo llamado «Vivienda habitual».
   *
   * La reparación del 14/09 descartaba de `alAlcanceDeCualquiera` los reducidos que exigen
   * vivienda habitual, pero miraba SOLO el array `condiciones`:
   *     !(!viviendaHabitual && r.condiciones.some(c => /vivienda habitual/i.test(c)))
   * y en Castilla-La Mancha ese requisito viaja en el NOMBRE — «Vivienda habitual (primera
   * compra)», 6 % — mientras sus condiciones dicen «Primera vivienda · Valor ≤ 180.000 € ·
   * Hipoteca > 50% del valor». Ninguna casaba con el patrón, así que el filtro no lo veía y
   * el aviso se lo ofrecía a un garaje suelto, que no puede ser ni la vivienda habitual ni la
   * «primera vivienda» de nadie. Es la ÚNICA entrada de la tabla en ese caso (barrido de las
   * 19 comunidades: las otras dos con el requisito solo en el nombre, «VPO primera vivienda»
   * de Valencia y La Rioja, son de colectivo y ya quedan fuera por `DE_COLECTIVO`).
   *
   * Caso: Garaje/Parking · segunda mano · Castilla-La Mancha · perfil General · 140.000 €
   *   esperado: ningún tipo que exija ser la vivienda habitual (quedarían los tres de zona
   *     despoblada, que dependen del municipio y no de quién compra).
   *   obtenido (21/09, antes de reparar): «6,00% — Vivienda habitual (primera compra) ·
   *     Requisitos: Primera vivienda · Valor ≤ 180.000 € · Hipoteca > 50% del valor», bajo el
   *     rótulo «Podrías pagar menos» y con el pie que invita a llamar a la oficina liquidadora.
   */
  test('REGRESIÓN 1155 — a un garaje no se le ofrece un reducido cuyo requisito va en el NOMBRE', async ({
    page,
  }) => {
    // ✅ REPARADO el 21/09/2026 en `data/itp-ccaa.ts`: `exigeViviendaHabitual` mira el NOMBRE
    // además del array `condiciones`, y reconoce «primera vivienda» como la otra forma de
    // escribir el requisito. La ficha sigue declarándolo en el nombre —no se tocó el dato,
    // que es correcto— y lo que cambió es el filtro que lo lee.
    // El requisito está en el nombre y no en las condiciones: de ahí venía el hueco
    const clm = ITP_CCAA['castilla-mancha'].tiposReducidos.find((t) =>
      /vivienda habitual/i.test(t.nombre),
    );
    expect(clm?.tipo).toBe(6);
    expect(clm?.condiciones.some((c) => /vivienda habitual/i.test(c))).toBe(false);

    await abrir21(page);
    await page.getByRole('button', { name: /Garaje\/Parking/ }).click();
    await page.locator('#ccaa-inmueble').selectOption('castilla-mancha');
    await sembrar21(page, 'Precio del inmueble', '140000');

    // La CUOTA sí es correcta desde el 14/09: tipo general, sin reducido de vivienda
    await expect(page.getByRole('heading', { name: 'ITP (9,00 %)' })).toBeVisible();
    expect(await valorTarjeta(page, /^ITP/)).toBe('12.600,00 €');

    // Lo que falla es el aviso: ofrece una rebaja que un garaje suelto no puede pedir
    const aviso = page.locator('div[class*="avisoReducidos"]');
    if (await aviso.count()) {
      expect(await aviso.first().innerText()).not.toContain('Vivienda habitual');
    }
  });

  /**
   * ✅ HALLAZGO 1156 del 21/09/2026 (BAJO, dato), REPARADO el 21/09 — eran cuatro tipos de
   * IVA tecleados a mano en una página que importa las constantes de las que salen.
   *
   * Es la familia de los hallazgos 581, 584, 629, 674 y 770, reparados uno a uno aquí: la
   * calculadora ya deriva su IVA de `IVA_INMUEBLES_2025` y `PORCENTAJES_IVA`, y el bloque
   * educativo también desde el 14/09 — pero quedan cuatro literales:
   *   · `DERIVACIONES.garaje[0].matiz`   «(IVA 10%, hasta 2 plazas)» y «(IVA 21%)»
   *        → IVA_INMUEBLES_2025.anejoVinculado y PORCENTAJES_IVA.general
   *   · `DERIVACIONES.trastero[0].matiz` «(IVA 10%)» y «(IVA 21%)»  → las mismas dos
   *   · `DERIVACIONES.terreno[1].matiz`  «IVA 21% + AJD»  → PORCENTAJES_IVA.general
   *   · «Errores comunes»: «Los honorarios de notaría y registro llevan IVA al 21%»
   *        → PORCENTAJES_IVA.general, que es el tipo que `calcularNotario` y
   *          `calcularRegistro` aplican con su «× 1,21»
   *
   * Hoy los cuatro coinciden con sus constantes, así que no hay ninguna cifra mal en
   * pantalla: lo que falta es el vínculo, exactamente como en el hallazgo 629 («hoy coincide,
   * y lo que faltaba era el vínculo»). Los tres textos con «IVA 10%» / «IVA 21%» viven dentro
   * de los avisos que derivan a las calculadoras especializadas, que son justo las que sí
   * distinguen el anejo del independiente.
   */
  test('REGRESIÓN 1156 — los tipos de IVA de la prosa salen de data/fiscal, no tecleados', async () => {
    // ✅ REPARADO el 21/09/2026: los cuatro literales pasaron a interpolar
    // `IVA_INMUEBLES_2025.anejoVinculado` y `PORCENTAJES_IVA.general`.
    // Coinciden con lo que había escrito: por eso no había ninguna cifra mal en pantalla
    expect(IVA_INMUEBLES_2025.anejoVinculado).toBe(10);
    expect(PORCENTAJES_IVA.general).toBe(21);

    const fuente = readFileSync(
      join(process.cwd(), 'app/estimador-compraventa-inmueble/page.tsx'),
      'utf8',
    );
    // Solo lo que llega al usuario: los comentarios del código quedan fuera
    const tecleados = fuente
      .split('\n')
      .map((linea, i) => ({ n: i + 1, linea: linea.trim() }))
      .filter(({ linea }) => !/^(\/\/|\*|\/\*)/.test(linea))
      .filter(({ linea }) => /IVA (al )?\d{1,2}\s?%/.test(linea))
      .map(({ n, linea }) => `${n}: ${linea}`);
    expect(tecleados, 'los tipos de IVA salen de data/fiscal, no de la memoria').toEqual([]);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Inspector — re-inspección 22/09/2026
//
// Dos frentes nuevos:
//  (a) NAVARRA, la única comunidad que este fichero no había pisado nunca (lo dejó escrito
//      la re-inspección del 21/09 en el CASO 45: «era, con Navarra, una de las dos únicas
//      comunidades sin ningún caso»). Régimen foral: ITP general del 6 % sin escala y el
//      AJD más bajo del catálogo, 0,5 %.
//  (b) El IMPORTE ILEGIBLE, medido el mismo día en la hermana
//      `simulador-gastos-compraventa-garaje`: un importe que `parseSpanishNumber` no puede
//      leer —«193.000.00», con el millar y el decimal escritos los dos con punto— se
//      convierte en 0 € y la página sigue publicando una cifra como si el dato estuviera.
//      Aquí entran por `parseSpanishNumberOr`, que es correcto para el campo VACÍO
//      («si el formulario dice opcional, el código tiene que tratarlo como opcional») y no
//      distingue el vacío del ilegible.
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Inspector 22/09/2026 — re-inspección: Navarra y el importe ilegible', () => {
  /** Siembra comprobando que el ESTADO de React recogió el valor, y después acota con el blur. */
  async function sembrar22(page: Page, etiqueta: string, valor: string): Promise<void> {
    const campo = page.locator(`input[aria-label="${etiqueta}"]`);
    await campo.fill(valor);
    await esperarValorEnReact(page, campo, valor);
    await campo.blur();
  }

  async function abrir22(page: Page): Promise<void> {
    await page.goto(RUTA);
    await esperarHidratacion(page, ['input[aria-label="Precio de la vivienda"]']);
  }

  /** Abre la pestaña Vendedor y espera a que sus campos estén hidratados. */
  async function abrirVendedor22(page: Page): Promise<void> {
    await page.getByRole('button', { name: 'Vendedor' }).click();
    await esperarHidratacion(page, ['input[aria-label="Precio de compra original"]']);
  }

  /**
   * CASO 48 (normal) — Navarra, PRIMERA MANO, vivienda de 300.000 €.
   *
   * Camino IVA + AJD por la comunidad con el AJD más bajo de la tabla (0,5 %, régimen
   * foral): el estimador nunca lo había recorrido, y es el tipo que más se aleja del 1,5 %
   * habitual, así que un AJD que se calculara con un tipo fijo se delataría aquí.
   *   IVA  = 300.000 × 10 %  (IVA_INMUEBLES_2025.obraNueva)              =  30.000,00 €
   *   AJD  = 300.000 × 0,5 % (ITP_CCAA.navarra.ajd)                      =   1.500,00 €
   * Notaría y registro recalculados a mano el 12/10/2026 con la rebaja del 5 % del nº 2.1
   * (hallazgos 2901 y 2902), como en el CASO 33:
   *   Notaría = arancel(300.000) × 0,95 × 1,21 × 1,75                    =     821,62 €
   *     arancel = 90,151816 + 24.040,49×0,45 % + 30.050,60×0,15 %
   *               + 90.151,82×0,10 % + 149.746,97×0,05 %  = 408,435226
   *               → ×0,95 = 388,013465 → ×1,21 = 469,496292 → ×1,75 = 821,618511 (antes 864,86)
   *   Registro = (216,212547 × 0,95 + 6,010121 + 3,005061) × 1,21        =     259,44 € (antes 272,52)
   *     216,212547 = 24,040484 + 24.040,49×0,175 % + 30.050,60×0,125 %
   *                  + 90.151,82×0,075 % + 149.746,97×0,030 %
   *   Gestoría (GESTORIA_TIPICA, valor por defecto del campo)             =     300,00 €
   *   Total gastos = 30.000 + 1.500 + 821,62 + 259,44 + 300              =  32.881,06 €
   *   % sobre precio = 32.881,06 / 300.000                                =      10,96 %
   *   Coste total  = 300.000 + 32.881,06                                  = 332.881,06 €
   */
  test('CASO 48 (normal) — Navarra, obra nueva de 300.000 €: IVA al 10 % y el AJD foral del 0,5 %', async ({
    page,
  }) => {
    // Anclaje: los dos tipos salen de la tabla, no de la memoria del test
    expect(ITP_CCAA['navarra'].ajd).toBe(0.5);
    expect(ITP_CCAA['navarra'].tipoGeneral).toBe(6);
    expect(IVA_INMUEBLES_2025.obraNueva).toBe(10);

    await abrir22(page);
    await page.getByRole('button', { name: /Primera mano/ }).click();
    await page.locator('#ccaa-inmueble').selectOption('navarra');
    await sembrar22(page, 'Precio de la vivienda', '300000');

    await expect(page.getByRole('heading', { name: 'IVA (10,00 %)' })).toBeVisible();
    expect(await valorTarjeta(page, /^IVA/)).toBe('30.000,00 €');

    // El AJD se rotula con el tipo EFECTIVO: 1.500 / 300.000 = 0,50 %
    await expect(page.getByRole('heading', { name: 'AJD (0,50 %)' })).toBeVisible();
    expect(await valorTarjeta(page, /^AJD/)).toBe('1500,00 €');

    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('821,62 €');
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('259,44 €');
    expect(await valorTarjeta(page, 'Gastos de gestoría')).toBe('300,00 €');
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('32.881,06 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toBe('10,96 % sobre el precio');
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('332.881,06 €');
  });

  /**
   * CASO 49 (límite) — Navarra, segunda mano, EXACTAMENTE 180.304 €: el canto del tope.
   *
   * `ITP_CCAA.navarra` trae dos reducidos SIN colectivo —«Vivienda habitual» al 5 % con
   * `valorMaximo` 180.304 € y «Municipios despoblados» al 4 % sin tope—, así que con perfil
   * General los dos caen en `alAlcanceDeCualquiera` y se enseñan como oportunidad sin
   * aplicarse. El precio se pone en el borde para medir que la comparación del tope es «≤»
   * y no «<»: un euro más y el del 5 % tiene que desaparecer de la lista.
   *
   *   ITP      = 180.304 × 6 %  (tipo general; Navarra no tiene escala)  =  10.818,24 €
   * Notaría y registro recalculados a mano el 12/10/2026 con la rebaja del 5 % del nº 2.1
   * (hallazgos 2901 y 2902):
   *   Notaría  = arancel(180.304) × 0,95 × 1,21 × 1,75                   =     701,23 €
   *     arancel = 90,151816 + 108,182205 + 45,0759 + 90,15182 + 30.050,97×0,05 %
   *             = 348,587226 → ×0,95 = 331,157865 → ×1,21 = 400,701016 → ×1,75 = 701,226778
   *             (sin la rebaja, 738,13)
   *   Registro = (180,303747 × 0,95 + 6,010121 + 3,005061) × 1,21        =     218,17 € (antes 229,08)
   *   Gestoría                                                            =     300,00 €
   *   Total gastos = 10.818,24 + 701,23 + 218,17 + 300                   =  12.037,64 €  (6,68 %)
   *   Coste total  = 180.304 + 12.037,64                                 = 192.341,64 €
   *
   *   Con 180.305 € el ITP pasa a 10.818,30 € y el reducido del 5 % sale de la lista.
   */
  test('CASO 49 (límite) — Navarra, 180.304 € justo en el tope del reducido de vivienda habitual', async ({
    page,
  }) => {
    const habitual = ITP_CCAA['navarra'].tiposReducidos.find((t) => t.nombre === 'Vivienda habitual');
    expect(habitual?.valorMaximo, 'el tope del reducido sale de la tabla').toBe(180304);
    expect(habitual?.tipo).toBe(5);
    /** `valorMaximo` es opcional en la ficha: el `expect` de arriba ya ha dicho que aquí existe. */
    const tope = habitual?.valorMaximo ?? 0;

    await abrir22(page);
    await page.getByRole('button', { name: /Segunda mano/ }).click();
    await page.locator('#ccaa-inmueble').selectOption('navarra');
    await sembrar22(page, 'Precio de la vivienda', String(tope));

    // Se COBRA el tipo general: el reducido exige requisitos que la app no pregunta
    await expect(page.getByRole('heading', { name: 'ITP (6,00 %)' })).toBeVisible();
    expect(await valorTarjeta(page, /^ITP/)).toBe('10.818,24 €');
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('701,23 €');
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('218,17 €');
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('12.037,64 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toBe('6,68 % sobre el precio');
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('192.341,64 €');

    // …y se ENSEÑA como oportunidad, con el del 4 % detrás
    const lineas = page.locator('ul[class*="avisoReducidosLista"] li');
    await expect(lineas).toHaveCount(2);
    await expect(lineas.nth(0)).toContainText('5,00 % — Vivienda habitual');
    await expect(lineas.nth(1)).toContainText('4,00 % — Municipios despoblados');

    // Un euro por encima del tope: el del 5 % ya no se puede ofrecer
    await sembrar22(page, 'Precio de la vivienda', String(tope + 1));
    expect(await valorTarjeta(page, /^ITP/)).toBe('10.818,30 €');
    const lineasArriba = page.locator('ul[class*="avisoReducidosLista"] li');
    await expect(lineasArriba).toHaveCount(1);
    await expect(lineasArriba.nth(0)).toContainText('4,00 % — Municipios despoblados');
  });

  /**
   * CASO 50 (debe rechazarse) — un importe ILEGIBLE no es un cero.
   *
   * ⚠️ HALLAZGO 22/09/2026 (ALTO) — medido en navegador sobre localhost:3050.
   *
   * Siete campos de dinero de esta página se leen con `parseSpanishNumberOr`, que devuelve
   * 0 tanto para el campo vacío como para lo que no es un número. Para el vacío es lo
   * correcto y está documentado en `lib/formatters.ts`; para el ilegible no, porque el
   * usuario SÍ escribió un dato y la página lo descarta sin decirlo. El texto sigue en
   * pantalla (el blur del NumberInput no lo toca: solo acota lo que sí parsea), así que
   * nada delata la pérdida.
   *
   * El caso más caro es la exención por reinversión del art. 38 LIRPF, que se pierde entera:
   *   Venta 200.000 · compra 150.000 · 10 años · suelo catastral 50.000 · comisión 3 % ·
   *   vivienda habitual · «Voy a reinvertir» marcado · sin hipoteca pendiente.
   *     Plusvalía municipal = 50.000 × 0,08 (COEFICIENTES_IIVTNU_2025, 10 años)
   *                           × 25 % (PLUSVALIA_MUNICIPAL_META.tipoOrientativo) = 1.000,00 €
   *     Comisión = 200.000 × 3 %                                              =  6.000,00 €
   *     Valor de transmisión = 200.000 − 6.000 − 1.000                        = 193.000,00 €
   *     Ganancia = 193.000 − 150.000                                          =  43.000,00 €
   *
   *   · Reinversión «193000» (legible)   → proporción 1 → EXENTO · neto 193.000,00 €
   *   · Reinversión «193.000.00»          → se lee 0 € → base 43.000 →
   *       IRPF = 6.000×19 % + 37.000×21 % = 1.140 + 7.770                     =  8.910,00 €
   *       neto = 200.000 − (1.000 + 6.000 + 8.910)                            = 184.090,00 €
   *
   * 8.910 € de diferencia, con el importe tecleado todavía visible en el campo, sin ningún
   * aviso — y el neto rotulado «Lo que realmente recibes», es decir declarado DEFINITIVO,
   * porque `faltanEnElNeto` solo mira la plusvalía y el precio de compra.
   *
   * ✅ REPARADO el 22/09/2026: los seis importes del vendedor y la gestoría del comprador
   * distinguen el campo VACÍO del ILEGIBLE, la tarjeta del IRPF nombra la exención que no ha
   * podido aplicar y el aviso del neto separa las dos direcciones. Queda como regresión.
   */
  test('CASO 50 (regresión) — un importe de reinversión ilegible no vale 0 € en silencio', async ({
    page,
  }) => {
    await abrir22(page);
    await page.getByRole('button', { name: /Segunda mano/ }).click();
    await sembrar22(page, 'Precio de la vivienda', '200000');
    await abrirVendedor22(page);
    await sembrar22(page, 'Precio de compra original', '150000');
    await sembrar22(page, 'Años de propiedad', '10');
    await sembrar22(page, 'Valor catastral del suelo', '50000');
    await page.getByText('Voy a reinvertir en otra vivienda habitual').click();
    await esperarHidratacion(page, [
      'input[aria-label="Importe que reinviertes en la nueva vivienda"]',
    ]);
    await sembrar22(page, 'Importe que reinviertes en la nueva vivienda', '193.000.00');

    // Lo tecleado sigue ahí: nadie lo ha corregido por detrás
    await expect(
      page.locator('input[aria-label="Importe que reinviertes en la nueva vivienda"]'),
    ).toHaveValue('193.000.00');

    const irpf = await valorTarjeta(page, 'IRPF sobre ganancia');
    const neto = await valorTarjeta(page, 'IMPORTE NETO VENDEDOR');

    expect(
      await descripcionTarjeta(page, 'IMPORTE NETO VENDEDOR'),
      `el importe de reinversión ilegible se leyó como 0 €: IRPF ${irpf} y neto ${neto}, ` +
        'publicados como definitivos sin nombrar el dato que no se pudo leer',
    ).not.toContain('Lo que realmente recibes');

    // Las cifras son las mismas —la app no puede inventar el importe que no ha leído— pero ya
    // no se publican como definitivas: el aviso dice que el neto real es MAYOR. Con la tabla
    // del RDL 8/2023 (hallazgo 1559): plusvalía 50.000 × 0,12 × 25 % = 1.500 · ganancia
    // 200.000 − 6.000 − 1.500 − 150.000 = 42.500 · IRPF 1.140 + 36.500 × 21 % = 8.805 ·
    // neto 200.000 − 1.500 − 6.000 − 8.805 = 183.695.
    expect(irpf).toBe('8805,00 €');
    expect(neto).toBe('183.695,00 €');
    const aviso = await descripcionTarjeta(page, 'IMPORTE NETO VENDEDOR');
    expect(aviso).toContain('el neto real es MAYOR que este');
    expect(aviso).toContain('art. 38 LIRPF');

    // Y se dice también en la tarjeta del IRPF, que es donde se lee la cuota.
    const avisoIrpf = await descripcionTarjeta(page, 'IRPF sobre ganancia');
    expect(avisoIrpf).toContain('no se ha podido leer');
    expect(avisoIrpf).toContain('art. 38 LIRPF');
  });

  /**
   * CASO 50 bis (control) — el MISMO importe escrito en español sí exime.
   *
   * Es la mitad que tiene que seguir en verde cuando se repare el 50: la reparación no puede
   * consistir en dejar de aplicar la exención. Cifras, arriba.
   */
  test('CASO 50 bis (control) — con el importe legible, la reinversión total sí deja la ganancia exenta', async ({
    page,
  }) => {
    // Anclaje de los tres datos normativos del caso. El coeficiente de 10 años es el del
    // art. 107.4 TRLRHL en la redacción del RDL 8/2023 (0,12); el 0,08 que anclaba este test
    // era el de la tabla caducada del RDL 26/2021 (hallazgo 1559).
    expect(
      COEFICIENTES_IIVTNU_2025.find((c) => c.anios === 10)?.coeficiente,
      'coeficiente de 10 años del RDL 8/2023',
    ).toBe(0.12);
    expect(PLUSVALIA_MUNICIPAL_META.tipoOrientativo).toBe(25);
    expect(TRAMOS_GANANCIAS_PATRIMONIALES_2025[0]).toEqual({ hasta: 6000, tipo: 19 });

    await abrir22(page);
    await page.getByRole('button', { name: /Segunda mano/ }).click();
    await sembrar22(page, 'Precio de la vivienda', '200000');
    await abrirVendedor22(page);
    await sembrar22(page, 'Precio de compra original', '150000');
    await sembrar22(page, 'Años de propiedad', '10');
    await sembrar22(page, 'Valor catastral del suelo', '50000');
    await page.getByText('Voy a reinvertir en otra vivienda habitual').click();
    await esperarHidratacion(page, [
      'input[aria-label="Importe que reinviertes en la nueva vivienda"]',
    ]);
    await sembrar22(page, 'Importe que reinviertes en la nueva vivienda', '193000');

    // 193.000 reinvertidos ≥ 192.500 obtenidos → reinversión total (art. 41 RIRPF)
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('1500,00 €');
    expect(await valorTarjeta(page, 'Valor de transmisión')).toBe('192.500,00 €');
    expect(await valorTarjeta(page, 'Ganancia patrimonial')).toBe('42.500,00 €');
    expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('EXENTO');
    expect(await descripcionTarjeta(page, 'IRPF sobre ganancia')).toContain('art. 38 LIRPF');
    expect(await valorTarjeta(page, 'Total gastos vendedor')).toBe('7500,00 €');
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('192.500,00 €');
  });

  /**
   * CASO 51 (debe rechazarse) — la otra cara del mismo hueco, en la pestaña COMPRADOR.
   *
   * ⚠️ HALLAZGO 22/09/2026 (MEDIO) — misma raíz que el CASO 50, dirección contraria.
   *
   * La gestoría del comprador también se lee con `parseSpanishNumberOr`. Con un importe
   * ilegible vale 0 €, y como la tarjeta se pinta bajo la guarda `gastosGestoria > 0`, la
   * línea DESAPARECE del desglose: no queda ni un «0,00 €» que delate la pérdida.
   *
   *   Madrid, segunda mano, 200.000 €, gestoría «2.000.50»:
   *     ITP 12.000,00 + notaría 758,98 + registro 236,22                 = 12.995,20 €
   *     …frente a los 13.295,20 € con la gestoría por defecto de 300 €.
   *   Y el coste total, 212.995,20 €, sigue rotulado «Precio + todos los gastos».
   *
   * Aquí el desvío va a la baja, que es la dirección contra la que avisa por escrito el
   * contrato de `elegirTipoITP` en data/itp-ccaa.ts: «quien presupuesta 0 y paga 12.000
   * tiene un problema».
   */
  test('CASO 51 (regresión) — una gestoría ilegible no desaparece de «todos los gastos»', async ({
    page,
  }) => {
    await abrir22(page);
    await page.getByRole('button', { name: /Segunda mano/ }).click();
    await page.locator('#ccaa-inmueble').selectOption('madrid');
    await sembrar22(page, 'Precio de la vivienda', '200000');
    await sembrar22(page, 'Gastos de gestoría del comprador (€)', '2.000.50');

    await expect(
      page.locator('input[aria-label="Gastos de gestoría del comprador (€)"]'),
    ).toHaveValue('2.000.50');

    // Desde el 24/09/2026 el título también lo dice: «COSTE TOTAL (PARCIAL)» (hallazgo 1556).
    const total = await valorTarjeta(page, /^COSTE TOTAL/);
    expect(
      await descripcionTarjeta(page, /^COSTE TOTAL/),
      `la gestoría ilegible se leyó como 0 € y su línea desapareció del desglose, pero ` +
        `el coste total (${total}) sigue anunciándose como completo`,
    ).not.toBe('Precio + todos los gastos');

    // La línea vuelve al desglose y el coste dice qué le falta, sin inventar el importe.
    // Con la rebaja del 5 % del nº 2.1 de los dos aranceles (hallazgos 2901 y 2902; recalculado a
    // mano el 12/10/2026 como en el CASO 1): 200.000 + 12.000 + 721,04 + 224,96 = 212.946,00
    // (sin la rebaja, 212.995,20)
    expect(total).toBe('212.946,00 €');
    expect(await descripcionTarjeta(page, /^COSTE TOTAL/)).toBe(
      'No incluye la gestoría, que no se ha podido leer: el coste real será mayor',
    );
    expect(await valorTarjeta(page, 'Gastos de gestoría')).toBe('Sin leer');

    // Con la MISMA cifra en español vuelve a contarse, y el coste sube los 2.000,50 €:
    // 212.946,00 + 2.000,50 = 214.946,50 (sin la rebaja, 214.995,70)
    await sembrar22(page, 'Gastos de gestoría del comprador (€)', '2000,50');
    expect(await valorTarjeta(page, 'Gastos de gestoría')).toBe('2000,50 €');
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('214.946,50 €');
    expect(await descripcionTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe(
      'Precio + todos los gastos',
    );
  });
});

/**
 * Reparación del 23/09/2026 — hueco C3 del testigo de familia (`tests/familias/compraventa.spec.ts`).
 *
 * El testigo de familia vigila la DIRECCIÓN del aviso; este caso vigila su MAGNITUD. Con la
 * comisión ilegible, «falta descontar la comisión inmobiliaria» invitaba a restar los
 * 7.000,00 € enteros cuando el hueco real era 5.530,00 €: la comisión es gasto de la venta
 * (art. 35.1 LIRPF) y al descontarla baja también el IRPF, 1.470,00 €.
 *
 * La app publica ahora una COTA: «hasta un T % de su importe», con T el tipo marginal del
 * ahorro en la base actual. El caso no copia la cifra: la MIDE y exige que la cota sea cierta,
 *     importe × (1 − T/100) ≤ hueco real ≤ importe
 *
 * BASE B del testigo — precio 200.000 · compra 150.000 · 10 años · suelo 50.000 · vivienda
 * habitual · comisión 3,5 % → 7.000,00 € · tipo marginal 21 % (la base está entre 6.000 y
 * 50.000) → hueco entre 5.530,00 € y 7.000,00 €. Medido: 5.530,00 €.
 */
test.describe('Reparación 23/09/2026 — la magnitud de «falta descontar la comisión»', () => {
  async function sembrarC3(page: Page, etiqueta: string, valor: string): Promise<void> {
    const campo = page.locator(`input[aria-label="${etiqueta}"]`);
    await campo.fill(valor);
    await esperarValorEnReact(page, campo, valor);
    await campo.blur();
  }

  test('[C3] la cota que publica el aviso de la comisión es cierta', async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, ['input[aria-label="Precio de la vivienda"]']);
    await sembrarC3(page, 'Precio de la vivienda', '200000');
    await page.getByRole('button', { name: 'Vendedor' }).click();
    await esperarHidratacion(page, ['input[aria-label="Precio de compra original"]']);
    await sembrarC3(page, 'Precio de compra original', '150000');
    await sembrarC3(page, 'Años de propiedad', '10');
    await sembrarC3(page, 'Valor catastral del suelo', '50000');

    const aEuros = (t: string): number => Number(t.replace(/[€\s.]/g, '').replace(',', '.'));

    await sembrarC3(page, 'Comisión inmobiliaria (%)', '3,5');
    const netoReal = aEuros(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR'));
    const importe = 200000 * 0.035;

    await sembrarC3(page, 'Comisión inmobiliaria (%)', '3.5.0');
    const netoPublicado = aEuros(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR'));
    const aviso = await descripcionTarjeta(page, 'IMPORTE NETO VENDEDOR');

    expect(aviso).toContain('No descuenta la comisión inmobiliaria');
    const cota = aviso.match(/rebaja también el IRPF al descontarla, hasta un (\d+)\s% de su importe/);
    expect(cota, `el aviso no publica la cota del IRPF. Aviso: ${aviso}`).not.toBeNull();
    const tipo = Number(cota?.[1]);
    // El tipo publicado sale de la tabla, no del texto: es el tramo de la base actual.
    expect(TRAMOS_GANANCIAS_PATRIMONIALES_2025.map((t) => t.tipo)).toContain(tipo);

    const hueco = netoPublicado - netoReal;
    expect(hueco).toBeGreaterThanOrEqual(importe * (1 - tipo / 100) - 0.01);
    expect(hueco).toBeLessThanOrEqual(importe + 0.01);
    expect(hueco).toBeCloseTo(5530, 2);
  });
});

/**
 * Inspector 23/09/2026 — RE-INSPECCIÓN de la app de referencia de la familia de compraventa.
 *
 * La app volvió a la cola por cuatro reparaciones del 22-23/09: cfe091a7 (el ilegible se
 * nombra), 85a4a29c (C1, valor catastral total), e107b44c (C2, lectura muerta de la gestoría)
 * y 0f70fdf8 (C3, magnitud de «falta descontar»). Batería previa: 120/120 en verde.
 *
 * El testigo de familia (`tests/familias/compraventa.spec.ts`) mide cada campo ILEGIBLE por
 * separado sobre las bases B, A, A' y C, y solo exige texto cuando el campo MUEVE la cifra.
 * Lo que no mira, y es donde está lo de esta vuelta:
 *   · el aviso que sale cuando el campo NO mueve nada (no tiene filas `sin_efecto` en esta app);
 *   · varios ilegibles a la vez, en direcciones opuestas;
 *   · las tarjetas intermedias del vendedor (IRPF, valor de adquisición), no solo el neto;
 *   · perfiles que solo existen aquí: mayor de 65, reinversión con hipoteca pendiente.
 *
 * Todas las cifras se resolvieron a mano ANTES de ejecutar la app, con:
 *   · ITP_CCAA y los aranceles de `data/itp-ccaa.ts` (RD 1426/1989 y RD 1427/1989);
 *   · COEFICIENTES_IIVTNU_2025 y PLUSVALIA_MUNICIPAL_META.tipoOrientativo (25 %) de
 *     `data/fiscal/inmuebles.ts` (RDL 26/2021);
 *   · TRAMOS_GANANCIAS_PATRIMONIALES_2025 (19 % hasta 6.000 · 21 % hasta 50.000 · 23 % hasta
 *     200.000 · 27 % hasta 300.000 · 30 % resto) y la fórmula de `calcularGananciaInmueble`
 *     (`data/fiscal/ganancia-inmueble.ts`, arts. 35 y 38 LIRPF, art. 41 RIRPF).
 * Cuotas del ahorro que se repiten abajo: hasta 50.000 → 10.380 € · hasta 200.000 → 44.880 € ·
 * hasta 300.000 → 71.880 €.
 *
 * Los hallazgos (1226-1232) se REPARARON el 23/09/2026 y ya no llevan `test.fail()`; lo que
 * sigue explica cómo se escribieron. Para que ninguno pudiera «fallar como se esperaba» por su
 * propio montaje (la trampa del 1192), el caso «CONTROL de montaje» de este bloque, que va en
 * VERDE, repite cada preparación y exige las cifras que la app publica hoy: si un montaje se
 * rompe, se pone rojo ese control y no se esconde detrás de un fallo esperado.
 */
test.describe('Inspector 23/09/2026 — re-inspección de familia: las reparaciones y sus colaterales', () => {
  /** Siembra comprobando que el ESTADO de React recogió el valor, y después acota con el blur. */
  async function sembrar23(page: Page, etiqueta: string, valor: string): Promise<void> {
    const campo = page.locator(`input[aria-label="${etiqueta}"]`);
    await campo.fill(valor);
    await esperarValorEnReact(page, campo, valor);
    await campo.blur();
  }

  async function abrir23(page: Page): Promise<void> {
    await page.goto(RUTA);
    await esperarHidratacion(page, ['input[aria-label="Precio de la vivienda"]']);
  }

  /**
   * Deja la pestaña Vendedor con el precio de venta y los campos indicados, en orden. La
   * comisión NO se siembra si no se pide: su valor por defecto es «3».
   */
  async function vendedor23(
    page: Page,
    precio: string,
    campos: ReadonlyArray<readonly [string, string]>,
    marcas: { mayor65?: boolean; reinvierte?: boolean } = {},
  ): Promise<void> {
    await abrir23(page);
    await sembrar23(page, 'Precio de la vivienda', precio);
    await page.getByRole('button', { name: 'Vendedor' }).click();
    await esperarHidratacion(page, ['input[aria-label="Precio de compra original"]']);
    if (marcas.mayor65) {
      await page.getByRole('checkbox', { name: 'Soy mayor de 65 años' }).check();
    }
    if (marcas.reinvierte) {
      await page.getByRole('checkbox', { name: /Voy a reinvertir en otra vivienda habitual/ }).check();
      await esperarHidratacion(page, [
        'input[aria-label="Importe que reinviertes en la nueva vivienda"]',
        'input[aria-label="Hipoteca pendiente de la vivienda que vendes"]',
      ]);
    }
    for (const [etiqueta, valor] of campos) await sembrar23(page, etiqueta, valor);
  }

  /** «285.068,12 €» → 285068.12 */
  const aEuros23 = (t: string): number => Number(t.replace(/[€\s.]/g, '').replace(',', '.'));

  /** BASE B del testigo de familia: 200.000 · compra 150.000 · 10 años · suelo 50.000 · 3 %. */
  const BASE_B: ReadonlyArray<readonly [string, string]> = [
    ['Precio de compra original', '150000'],
    ['Años de propiedad', '10'],
    ['Valor catastral del suelo', '50000'],
  ];

  // ─── Montajes de los hallazgos (los usan el CONTROL y cada `test.fail()`) ───────────────

  /** H1 · reinversión PARCIAL con hipoteca pendiente. Cifras en el test del hallazgo. */
  const montarH1 = (page: Page) =>
    vendedor23(
      page,
      '300000',
      [
        ['Precio de compra original', '100000'],
        ['Años de propiedad', '10'],
        ['Valor catastral del suelo', '50000'],
        ['Importe que reinviertes en la nueva vivienda', '100000'],
        ['Hipoteca pendiente de la vivienda que vendes', '150000'],
      ],
      { reinvierte: true },
    );

  /** H3 · 300.000 · compra 200.000 · 20 años · suelo 60.000 (gana el método real). */
  const montarH3 = (page: Page) =>
    vendedor23(page, '300000', [
      ['Precio de compra original', '200000'],
      ['Años de propiedad', '20'],
      ['Valor catastral del suelo', '60000'],
    ]);

  /** N3 · el par catastral imposible: suelo 60.000 > total 45.000. */
  const montarParImposible = (page: Page) =>
    vendedor23(page, '185000', [
      ['Precio de compra original', '180000'],
      ['Años de propiedad', '6'],
      ['Valor catastral del suelo', '60000'],
      ['Valor catastral total (suelo + construcción)', '45000'],
    ]);

  /**
   * CASO 52 (normal) — La Rioja, segunda mano, vivienda de 180.000 €, perfil «Persona con
   * discapacidad». Ni La Rioja con este perfil ni el perfil mismo habían pasado nunca por la
   * batería (grep: 0 `selectOption('discapacidad')`).
   *
   * COMPRADOR — `elegirTipoITP('rioja', 'discapacidad', 180000, {viviendaHabitual: true})`:
   *   candidato «Discapacidad ≥33%» al 5 %, condiciones «Discapacidad ≥ 33%» (la cubre el
   *   perfil) y «Vivienda habitual» (la cubre la vivienda) → SE APLICA. Los demás reducidos
   *   de La Rioja son todos de colectivo, así que no queda nada que ofrecer por debajo del 5 %.
   *   ITP      = 180.000 × 5 %                                               =   9.000,00 €
   *   Notaría y registro recalculados a mano el 12/10/2026 con la rebaja del 5 % del nº 2.1
   *   (hallazgos 2901 y 2902), como en el CASO 8:
   *   Notaría  = arancel × 0,95 × 1,21 × 1,75
   *     arancel = 90,151816 + 24.040,49×0,45 % + 30.050,60×0,15 % + 90.151,82×0,10 %
   *               + 29.746,97×0,05 % = 90,151816 + 108,182205 + 45,0759 + 90,15182 + 14,873485
   *             = 348,435226 → ×0,95 = 331,013465 → ×1,21 = 400,526292 → ×1,75 = 700,921011
   *                                                                            =     700,92 €
   *     (horquilla ×1,5 = 600,79 € · ×2 = 801,05 €; sin la rebaja 737,81, entre 632,41 y 843,21)
   *   Registro = ((24,040484 + 42,0708575 + 37,56325 + 67,613865 + 29.746,97×0,030 %) × 0,95
   *               + 6,010121 + 3,005061) × 1,21 = 180,217102 × 1,21              =     218,06 €
   *               (sin la rebaja, 228,96)
   *   Gestoría (GESTORIA_TIPICA, por defecto)                                  =     300,00 €
   *   Total = 9.000 + 700,92 + 218,06 + 300                                    =  10.218,98 €
   *   % = 10.218,98 / 180.000 = 5,6772 %                                       →       5,68 %
   *   Coste total = 190.218,98 €
   *
   * VENDEDOR — compra 120.000 · 7 años · suelo 30.000 · total 90.000 · gastos de aquella
   * compra 8.500 · mejoras 4.000 · otros gastos de la venta 600 · comisión 3 % · habitual:
   *   Plusvalía objetivo = 30.000 × 0,20 (7 años) × 25 %                        =   1.500,00 €
   *     (art. 107.4 TRLRHL en la redacción del RDL 8/2023; era 0,12 con la tabla caducada
   *      del RDL 26/2021, hallazgo 1559)
   *   Plusvalía real     = 60.000 × (30.000 / 90.000) × 25 %                    =   5.000,00 €
   *     → gana el objetivo, «Método objetivo (más favorable)»
   *   Comisión = 180.000 × 3 %                                                 =   5.400,00 €
   *   Valor de adquisición = 120.000 + 8.500 + 4.000                           = 132.500,00 €
   *   Valor de transmisión = 180.000 − 5.400 − 600 − 1.500                     = 172.500,00 €
   *   Ganancia = 40.000 → IRPF = 6.000×19 % + 34.000×21 % = 1.140 + 7.140     =   8.280,00 €
   *   Total gastos = 1.500 + 5.400 + 600 + 8.280                               =  15.780,00 €
   *   Neto = 180.000 − 15.780                                                  = 164.220,00 €
   * Todos legibles: ni un aviso de ilegible puede aparecer (el aviso nuevo no se dispara solo).
   */
  test('CASO 52 (normal) — La Rioja, perfil discapacidad, 180.000 €: las dos pestañas', async ({ page }) => {
    // El «%» lleva espacio duro en data/ desde el 12/10/2026 (cabo C0028)
    const discapacidad = ITP_CCAA['rioja'].tiposReducidos.find((t) => t.nombre === 'Discapacidad ≥33 %');
    expect(discapacidad?.tipo, 'el reducido sale de la tabla').toBe(5);
    expect(discapacidad?.condiciones).toEqual(['Discapacidad ≥ 33 %', 'Vivienda habitual']);
    expect(ITP_CCAA['rioja'].tipoGeneral).toBe(7);
    expect(COEFICIENTES_IIVTNU_2025.find((c) => c.anios === 7)?.coeficiente).toBe(0.2);
    expect(PLUSVALIA_MUNICIPAL_META.tipoOrientativo).toBe(25);

    await abrir23(page);
    await page.getByRole('button', { name: /Segunda mano/ }).click();
    await page.locator('#ccaa-inmueble').selectOption('rioja');
    await page.locator('#perfil-comprador').selectOption('discapacidad');
    await sembrar23(page, 'Precio de la vivienda', '180000');

    await expect(page.getByRole('heading', { name: 'ITP (5,00 %)' })).toBeVisible();
    expect(await valorTarjeta(page, /^ITP/)).toBe('9000,00 €');
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('700,92 €');
    expect(await descripcionTarjeta(page, 'Gastos de notaría')).toContain('entre 600,79 € y 801,05 €');
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('218,06 €');
    expect(await valorTarjeta(page, 'Gastos de gestoría')).toBe('300,00 €');
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('10.218,98 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toBe('5,68 % sobre el precio');
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('190.218,98 €');
    expect(await descripcionTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('Precio + todos los gastos');
    // Aplicado el 5 %, no queda en La Rioja ningún reducido sin colectivo por debajo
    await expect(page.locator('ul[class*="avisoReducidosLista"] li')).toHaveCount(0);

    await page.getByRole('button', { name: 'Vendedor' }).click();
    await esperarHidratacion(page, ['input[aria-label="Precio de compra original"]']);
    await sembrar23(page, 'Precio de compra original', '120000');
    await sembrar23(page, 'Años de propiedad', '7');
    await sembrar23(page, 'Valor catastral del suelo', '30000');
    await sembrar23(page, 'Valor catastral total (suelo + construcción)', '90000');
    await sembrar23(page, 'Impuestos y gastos que pagaste al comprar', '8500');
    await sembrar23(page, 'Inversiones y mejoras (opcional)', '4000');
    await sembrar23(page, 'Otros gastos de la venta (opcional)', '600');

    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('1500,00 €');
    expect(await descripcionTarjeta(page, 'Plusvalía municipal')).toBe('Método objetivo (más favorable)');
    expect(await valorTarjeta(page, 'Valor de adquisición')).toBe('132.500,00 €');
    expect(await valorTarjeta(page, 'Valor de transmisión')).toBe('172.500,00 €');
    expect(await valorTarjeta(page, 'Ganancia patrimonial')).toBe('40.000,00 €');
    expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('8280,00 €');
    expect(await descripcionTarjeta(page, 'IRPF sobre ganancia')).toBe('Tributación en base del ahorro. Calculado como si esta venta fuera tu única renta del ahorro del año: si tienes intereses, dividendos u otras ganancias, escríbelos arriba, porque la cuota puede ser mayor.');
    expect(await valorTarjeta(page, /^Comisión inmobiliaria/)).toBe('5400,00 €');
    expect(await valorTarjeta(page, 'Otros gastos de la venta')).toBe('600,00 €');
    expect(await valorTarjeta(page, 'Total gastos vendedor')).toBe('15.780,00 €');
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('164.220,00 €');
    expect(await descripcionTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('Lo que realmente recibes');
  });

  /**
   * CASO 53 (límite: el tramo MÁS ALTO de la escala del ahorro) — la cota de C3 en el 30 % y
   * en el canto de 300.000 €.
   *
   * La cota que publica C3 («hasta un T % de su importe») nunca se había medido fuera del 21 %.
   * Venta 700.000 · compra 350.000 · 10 años · suelo 40.000 · sin catastral total · 3 %:
   *   Plusvalía = 40.000 × 0,12 × 25 %                                          =   1.200,00 €
   *     (10 años = 0,12 en la redacción del RDL 8/2023; era 0,08, hallazgo 1559)
   *   Comisión  = 700.000 × 3 %                                                 =  21.000,00 €
   *   · Legible:  ganancia = 700.000 − 21.000 − 1.200 − 350.000 = 327.800
   *               IRPF = 71.880 + 27.800 × 30 %                                 =  80.220,00 €
   *               neto = 700.000 − (1.200 + 21.000 + 80.220)                    = 597.580,00 €
   *   · «3.0.0»:  ganancia = 348.800 → IRPF = 71.880 + 48.800 × 30 %            =  86.520,00 €
   *               neto = 700.000 − (1.200 + 86.520)                             = 612.280,00 €
   *   Hueco = 14.700,00 € = 21.000 × (1 − 30 %): las dos bases están en el 30 %, así que la
   *   cota se alcanza CON IGUALDAD. Aviso: «hasta un 30 % de su importe».
   *
   * Y en el canto: compra 398.800 (399.200 con la plusvalía de 800 € de la tabla caducada) →
   * con la comisión ilegible la base es 300.000 EXACTOS, que `find(base <= hasta)` coloca en
   * el 27 % (el último euro tributa al 27 %, no al 30 %):
   *   · «3.0.0»:  IRPF = 71.880 → neto = 700.000 − (1.200 + 71.880)             = 626.920,00 €
   *   · Legible:  ganancia 279.000 → IRPF = 44.880 + 79.000 × 27 % = 66.210
   *               neto = 700.000 − (1.200 + 21.000 + 66.210)                    = 611.590,00 €
   *   Hueco = 15.330,00 € = 21.000 × (1 − 27 %).
   */
  test('CASO 53 (límite) — la cota de «falta descontar la comisión» en el 30 % y en el canto de 300.000 €', async ({
    page,
  }) => {
    expect(TRAMOS_GANANCIAS_PATRIMONIALES_2025.slice(-2)).toEqual([
      { hasta: 300000, tipo: 27 },
      { hasta: Infinity, tipo: 30 },
    ]);
    expect(COEFICIENTES_IIVTNU_2025.find((c) => c.anios === 10)?.coeficiente).toBe(0.12);

    await vendedor23(page, '700000', [
      ['Precio de compra original', '350000'],
      ['Años de propiedad', '10'],
      ['Valor catastral del suelo', '40000'],
    ]);
    expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('80.220,00 €');
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('597.580,00 €');
    expect(await descripcionTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('Lo que realmente recibes');

    await sembrar23(page, 'Comisión inmobiliaria (%)', '3.0.0');
    expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('86.520,00 €');
    expect(await descripcionTarjeta(page, 'IRPF sobre ganancia')).toMatch(/real es menor/);
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('612.280,00 €');
    expect(await descripcionTarjeta(page, 'IMPORTE NETO VENDEDOR')).toContain(
      'No descuenta la comisión inmobiliaria, que no se ha podido leer (la comisión inmobiliaria rebaja también el IRPF al descontarla, hasta un 30 % de su importe): el neto real es menor que este',
    );

    // El canto: la base queda en 300.000 exactos y el tramo es el del 27 %
    await sembrar23(page, 'Precio de compra original', '398800');
    expect(await valorTarjeta(page, 'Ganancia patrimonial')).toBe('300.000,00 €');
    expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('71.880,00 €');
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('626.920,00 €');
    expect(await descripcionTarjeta(page, 'IMPORTE NETO VENDEDOR')).toContain(
      'hasta un 27 % de su importe',
    );
    await sembrar23(page, 'Comisión inmobiliaria (%)', '3');
    expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('66.210,00 €');
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('611.590,00 €');
  });

  /**
   * CASO 54 (debe rechazarse) — un valor catastral del suelo MAYOR que el total no describe
   * ningún inmueble (el total incluye el suelo): el método real no se puede liquidar con él.
   *
   * Venta 185.000 · compra 180.000 · 6 años · suelo 60.000 · total 45.000 · 3 %:
   *   Objetivo = 60.000 × 0,19 (6 años, RDL 8/2023; era 0,16, hallazgo 1559) × 25 % =   2.850,00 €
   *   Lo que NO puede salir: el real con la proporción topada a 1 —
   *     5.000 × min(1, 60.000/45.000) × 25 % = 1.250 €, «más favorable» (hallazgo 900).
   *   Comisión = 185.000 × 3 %                                                  =   5.550,00 €
   *   Valor de transmisión = 185.000 − 5.550 − 2.850                            = 176.600,00 €
   *   Pérdida = 180.000 − 176.600                                               =   3.400,00 €
   *   Neto = 185.000 − (2.850 + 5.550)                                          = 176.600,00 €
   * Con el par al derecho (suelo 45.000 · total 60.000):
   *   objetivo = 45.000 × 0,19 × 25 % = 2.137,50 · real = 5.000 × 0,75 × 25 % = 937,50 → 937,50 €
   *   valor de transmisión = 185.000 − 5.550 − 937,50 = 178.512,50 = neto          178.512,50 €
   */
  test('CASO 54 (debe rechazarse) — el par catastral imposible no se liquida por el método real', async ({ page }) => {
    expect(COEFICIENTES_IIVTNU_2025.find((c) => c.anios === 6)?.coeficiente).toBe(0.19);

    await montarParImposible(page);
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('2850,00 €');
    expect(await descripcionTarjeta(page, 'Plusvalía municipal')).toContain(
      'revisa los dos campos del recibo del IBI',
    );
    expect(await valorTarjeta(page, 'Valor de transmisión')).toBe('176.600,00 €');
    expect(await valorTarjeta(page, 'Pérdida patrimonial')).toBe('3400,00 €');
    // Con pérdida no hay nada exento: «SIN CUOTA» (hallazgo 1554; aquí se exigía «EXENTO»).
    expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('SIN CUOTA');
    expect(await descripcionTarjeta(page, 'IRPF sobre ganancia')).toContain('No hay ganancia que gravar');
    expect(await valorTarjeta(page, 'Total gastos vendedor')).toBe('8400,00 €');
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('176.600,00 €');

    // El mismo recibo con los dos campos al derecho sí compara y gana el método real
    await sembrar23(page, 'Valor catastral del suelo', '45000');
    await sembrar23(page, 'Valor catastral total (suelo + construcción)', '60000');
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('937,50 €');
    expect(await descripcionTarjeta(page, 'Plusvalía municipal')).toBe('Método real (más favorable)');
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('178.512,50 €');
  });

  /**
   * REPARACIÓN C1 (85a4a29c) — el caso literal del commit, con sus dos bordes: el campo VACÍO
   * no es ilegible, y el legible no dispara el aviso.
   *   BASE B, total vacío     → objetivo 1.500,00 (0,12, RDL 8/2023; era 1.000 con el 0,08
   *                             caducado, hallazgo 1559) · «falta el valor catastral total» ·
   *                             neto 183.695,00 «Lo que realmente recibes».
   *   total «700.000.00»      → la plusvalía dice que NO SE HA PODIDO LEER (no que falta) y el
   *                             neto, 183.695,00, que el real es MAYOR.
   *   total 700.000 (legible) → real = 50.000 × (50.000/700.000) × 25 % = 892,86 €;
   *                             ganancia 43.107,14 → IRPF 1.140 + 37.107,14 × 21 % = 8.932,50;
   *                             neto = 200.000 − (892,86 + 6.000 + 8.932,50) = 184.174,64 €.
   */
  test('REPARACIÓN C1 — vacío, ilegible y legible dan tres mensajes distintos', async ({ page }) => {
    await vendedor23(page, '200000', BASE_B);
    expect(await descripcionTarjeta(page, 'Plusvalía municipal')).toBe(
      'Método objetivo (falta el valor catastral total para comparar)',
    );
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('183.695,00 €');
    expect(await descripcionTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('Lo que realmente recibes');

    await sembrar23(page, 'Valor catastral total (suelo + construcción)', '700.000.00');
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('1500,00 €');
    expect(await descripcionTarjeta(page, 'Plusvalía municipal')).toContain(
      'el valor catastral total no se ha podido leer',
    );
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('183.695,00 €');
    const aviso = await descripcionTarjeta(page, 'IMPORTE NETO VENDEDOR');
    expect(aviso).toContain('El valor catastral total');
    // «puede ser»: con el total ilegible la app no sabe si el método real ganaría, porque el
    // dato que lo decide es justo el que no lee (lo calcula el sondeo, lib/sondeoIlegibles.ts).
    expect(aviso).toContain('el neto real puede ser MAYOR que este');

    await sembrar23(page, 'Valor catastral total (suelo + construcción)', '700000');
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('892,86 €');
    expect(await descripcionTarjeta(page, 'Plusvalía municipal')).toBe('Método real (más favorable)');
    expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('8932,50 €');
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('184.174,64 €');
    expect(await descripcionTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('Lo que realmente recibes');
  });

  /**
   * REPARACIÓN C2 (e107b44c) — la gestoría del COMPRADOR no entra en la ganancia del vendedor
   * (art. 35.1 LIRPF), así que ilegible tampoco puede tocar el panel del vendedor.
   *   BASE B con gestoría «2.000.50» → IRPF 8.805,00 · neto 183.695,00 «Lo que realmente recibes»
   *   (con los coeficientes del RDL 8/2023, hallazgo 1559).
   */
  test('REPARACIÓN C2 — una gestoría del comprador ilegible no mueve ni avisa en el vendedor', async ({ page }) => {
    await abrir23(page);
    await sembrar23(page, 'Precio de la vivienda', '200000');
    await sembrar23(page, 'Gastos de gestoría del comprador (€)', '2.000.50');
    expect(await valorTarjeta(page, 'Gastos de gestoría')).toBe('Sin leer');
    await page.getByRole('button', { name: 'Vendedor' }).click();
    await esperarHidratacion(page, ['input[aria-label="Precio de compra original"]']);
    for (const [etiqueta, valor] of BASE_B) await sembrar23(page, etiqueta, valor);

    expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('8805,00 €');
    expect(await descripcionTarjeta(page, 'IRPF sobre ganancia')).toBe('Tributación en base del ahorro. Calculado como si esta venta fuera tu única renta del ahorro del año: si tienes intereses, dividendos u otras ganancias, escríbelos arriba, porque la cuota puede ser mayor.');
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('183.695,00 €');
    expect(await descripcionTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('Lo que realmente recibes');
  });

  /**
   * CONTROL de montaje de los hallazgos H1-H7 — va en VERDE.
   *
   * Repite la preparación de cada `test.fail()` de abajo y exige las cifras que la app publica
   * hoy (que son las del motor: el defecto de cada hallazgo está en el TEXTO o en la cota, no
   * en estas cifras). Si un montaje deja de valer, cae aquí, y no dentro de un fallo esperado.
   */
  test('CONTROL de montaje — las preparaciones de H1-H7 publican las cifras del motor', async ({ page }) => {
    test.setTimeout(90_000);

    // Cifras recalculadas el 24/09/2026 con los coeficientes del art. 107.4 TRLRHL en la
    // redacción del RDL 8/2023 (hallazgo 1559): 10 años = 0,12 y ≥ 20 años = 0,40.
    // H1 — plusvalía 50.000 × 0,12 × 25 % = 1.500 · VT 289.500 · G 189.500 · ITO 139.500 ·
    //      base 189.500 × 39.500/139.500 = 53.657,71 → IRPF 10.380 + 3.657,71 × 23 % = 11.221,27
    //      · neto 300.000 − 1.500 − 9.000 − 11.221,27 = 278.278,73. Con «3.0.0»: VT 298.500 ·
    //      G 198.500 · ITO 148.500 · base 198.500 × 48.500/148.500 = 64.829,97 → IRPF 10.380 +
    //      14.829,97 × 23 % = 13.790,89 · neto 300.000 − 1.500 − 13.790,89 = 284.709,11
    await montarH1(page);
    expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('11.221,27 €');
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('278.278,73 €');
    await sembrar23(page, 'Comisión inmobiliaria (%)', '3.0.0');
    expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('13.790,89 €');
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('284.709,11 €');

    // H2 — mayor de 65 + vivienda habitual: exento con y sin los gastos de aquella compra
    //      (neto 200.000 − 1.500 − 6.000 = 192.500)
    await vendedor23(page, '200000', [...BASE_B, ['Impuestos y gastos que pagaste al comprar', '2000,50']], {
      mayor65: true,
    });
    expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('EXENTO');
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('192.500,00 €');
    await sembrar23(page, 'Impuestos y gastos que pagaste al comprar', '2.000.50');
    expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('EXENTO');
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('192.500,00 €');

    // H3 — con el total legible gana el método real; ilegible, el objetivo:
    //      60.000 × 0,40 × 25 % = 6.000 · ganancia 85.000 → IRPF 10.380 + 35.000 × 23 % = 18.430
    await montarH3(page);
    await sembrar23(page, 'Valor catastral total (suelo + construcción)', '600000');
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('2500,00 €');
    expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('19.235,00 €');
    await sembrar23(page, 'Valor catastral total (suelo + construcción)', '600.000.00');
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('6000,00 €');
    expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('18.430,00 €');

    // H4 — las dos direcciones a la vez: legible VT 191.500 · adquisición 152.000 · ganancia
    //      39.500 → IRPF 1.140 + 33.500 × 21 % = 8.175 · neto 200.000 − 1.500 − 7.000 − 8.175
    //      = 183.325; ilegibles VT 198.500 · ganancia 48.500 → IRPF 10.065 · neto 188.435
    await vendedor23(page, '200000', [
      ...BASE_B,
      ['Comisión inmobiliaria (%)', '3,5'],
      ['Inversiones y mejoras (opcional)', '2000'],
    ]);
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('183.325,00 €');
    await sembrar23(page, 'Comisión inmobiliaria (%)', '3.5.0');
    await sembrar23(page, 'Inversiones y mejoras (opcional)', '2.000.00');
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('188.435,00 €');

    // H5 — el valor de adquisición se queda en el precio de compra
    await vendedor23(page, '200000', [...BASE_B, ['Impuestos y gastos que pagaste al comprar', '2.000.50']]);
    expect(await valorTarjeta(page, 'Valor de adquisición')).toBe('150.000,00 €');

    // H6 — precio de compra ilegible: no se calcula ni plusvalía ni IRPF
    await vendedor23(page, '200000', [...BASE_B.slice(1), ['Precio de compra original', '150.000.00']]);
    expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('Sin calcular');
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('194.000,00 €');

    // H7 — el par imposible, cifras en el CASO 54
    await montarParImposible(page);
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('176.600,00 €');
  });

  /**
   * ⚠️ HALLAZGO H1 (calculo, MEDIO) — la cota que publica C3 NO es cierta con reinversión
   * parcial y HIPOTECA PENDIENTE.
   *
   * 0f70fdf8 afirma: «Es una cota cierta porque la escala es progresiva y la base solo puede
   * bajar; con reinversión parcial la rebaja es aún menor». Lo segundo es falso cuando hay
   * principal pendiente: la comisión baja la ganancia Y ADEMÁS el «importe total obtenido» del
   * art. 41 RIRPF (valor de transmisión − principal pendiente), que es el DENOMINADOR de la
   * proporción exenta. Con ganancia G mayor que ese importe (V), cada euro de comisión baja la
   * base 1 − (R/V)·(1 − G/V) euros, que pasa de 1.
   *
   * Venta 300.000 · compra 100.000 · 10 años · suelo 50.000 (plusvalía 1.000) · reinvierte
   * 100.000 · hipoteca pendiente 150.000 · comisión 3 % = 9.000 €:
   *   · Legible:  VT = 290.000 · G = 190.000 · ITO = 140.000 · exento 71,43 %
   *               base = 190.000 × (1 − 100/140) = 54.285,71 → IRPF = 10.380 + 4.285,71 × 23 %
   *               = 11.365,71 € · neto = 300.000 − (1.000 + 9.000 + 11.365,71) = 278.634,29 €
   *   · «3.0.0»:  VT = 299.000 · G = 199.000 · ITO = 149.000 · exento 67,11 %
   *               base = 199.000 × (1 − 100/149) = 65.442,95 → IRPF = 10.380 + 15.442,95 × 23 %
   *               = 13.931,88 € · neto = 300.000 − (1.000 + 13.931,88) = 285.068,12 €
   *   La base baja 11.157,24 € por 9.000 € de comisión, y el IRPF 2.566,17 € = 28,51 % del
   *   importe. El aviso dice «hasta un 23 % de su importe», así que promete un hueco de al
   *   menos 9.000 × 77 % = 6.930,00 €; el real es 285.068,12 − 278.634,29 = 6.433,83 €.
   *   esperado: hueco ≥ importe × (1 − T/100)  ·  obtenido: 6.433,83 < 6.930,00 (496,17 € fuera)
   */
  test('H1 (hallazgo 1226, REPARADO) — con reinversión parcial no se publica una cota «hasta un T %» que no vale', async ({ page }) => {
    // La reparación retira la cota en vez de corregirla: con la exención proporcional del
    // art. 41 RIRPF, la comisión baja también el importe total obtenido (el denominador), y
    // cada euro puede bajar la base en MÁS de un euro — aquí un 28,51 % frente al 23 % que se
    // publicaba. No hay tipo que acote esa rebaja sin inventarlo, así que el aviso dice solo lo
    // que es cierto siempre: que el neto real baja menos que el importe de la comisión.
    await montarH1(page);
    const netoReal = aEuros23(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR'));
    const importe = 300000 * 0.03;

    await sembrar23(page, 'Comisión inmobiliaria (%)', '3.0.0');
    const netoPublicado = aEuros23(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR'));
    const aviso = await descripcionTarjeta(page, 'IMPORTE NETO VENDEDOR');
    expect(aviso).not.toMatch(/hasta un \d+\s% de su importe/);
    expect(aviso).toContain('rebaja también el IRPF al descontarla, así que el neto real baja menos que su importe');
    // Y lo que dice es cierto: el hueco real (6.433,83 €) es menor que la comisión (9.000 €).
    const hueco = netoPublicado - netoReal;
    expect(hueco).toBeGreaterThan(0);
    expect(hueco).toBeLessThan(importe);
  });

  /**
   * ⚠️ HALLAZGO H2 (calculo, MEDIO) — el aviso de ilegible sale cuando el campo NO MUEVE NADA,
   * y dice que el neto real es MAYOR cuando es EXACTAMENTE el publicado.
   *
   * `faltanPorAbaratar` y el «TECHO» de la tarjeta del IRPF miran solo si el texto se lee, no si
   * el importe puede mover la cuota. Con el vendedor mayor de 65 que vende su vivienda habitual
   * (exención total del art. 33.4.b LIRPF) los gastos de aquella compra no mueven nada:
   *   BASE B + mayor de 65 · gastos 2.000,50 o «2.000.50» → IRPF EXENTO · neto 193.000,00 €
   *   (200.000 − 1.000 − 6.000) en los DOS casos.
   * Y aun así, con «2.000.50»:
   *   IRPF «EXENTO» · «TECHO: hay importes que no se han podido leer y que reducen la ganancia»
   *     (desaparece «Mayor de 65 años + vivienda habitual», que es la razón del EXENTO);
   *   neto «INCOMPLETO: … REDUCEN el impuesto (los impuestos y gastos de aquella compra), así
   *     que el neto real es MAYOR que este».
   * Es la dirección cara: promete al vendedor más dinero del que va a recibir. Mismo defecto en
   * la PÉRDIDA patrimonial (compra 210.000: IRPF 0 con o sin los gastos), en la reinversión
   * TOTAL con hipoteca «2.000.50» (BASE A: el propio testigo mide delta 0,00 €) y con la hipoteca
   * ilegible y el importe de reinversión VACÍO (sin reinversión la hipoteca no entra en nada).
   *   esperado: «Mayor de 65 años + vivienda habitual» · «Lo que realmente recibes»
   *   obtenido: «TECHO: …» · «INCOMPLETO: … el neto real es MAYOR que este …»
   */
  test('H2 (hallazgo) — un ilegible que no mueve nada no puede decir que el neto real es MAYOR', async ({ page }) => {
    await vendedor23(page, '200000', [...BASE_B, ['Impuestos y gastos que pagaste al comprar', '2.000.50']], {
      mayor65: true,
    });
    expect.soft(await descripcionTarjeta(page, 'IRPF sobre ganancia')).toBe('Mayor de 65 años + vivienda habitual');
    expect.soft(await descripcionTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('Lo que realmente recibes');
  });

  /**
   * ⚠️ HALLAZGO H3 (contenido, MEDIO) — C1 marca la plusvalía y el neto, pero la tarjeta del
   * IRPF sigue publicando como DEFINITIVA una cuota que, al leer el valor catastral total, SUBE.
   *
   * La plusvalía se resta del valor de transmisión (art. 35.1 LIRPF): si el método real la
   * abarata, la ganancia y el IRPF crecen. El neto va en la dirección que dice el aviso (sube),
   * pero la cuota va en la CONTRARIA, y el aviso del neto la engloba en «REDUCEN el impuesto».
   * 300.000 · compra 200.000 · 20 años · suelo 60.000 · 3 %:
   *   · total 600.000: objetivo 60.000 × 0,45 × 25 % = 6.750 · real 100.000 × 10 % × 25 % =
   *     2.500 → plusvalía 2.500 · ganancia 300.000 − 9.000 − 2.500 − 200.000 = 88.500
   *     → IRPF = 10.380 + 38.500 × 23 % = 19.235,00 € · neto 269.265,00 €
   *   · total «600.000.00»: plusvalía 6.750 · ganancia 84.250 → IRPF = 10.380 + 34.250 × 23 %
   *     = 18.257,50 € «Tributación en base del ahorro» · neto 265.992,50 € (este sí avisa).
   *   esperado: la tarjeta del IRPF nombra el valor catastral total y dice que la cuota real es
   *             mayor (977,50 € aquí)
   *   obtenido: 18.257,50 € rotulado «Tributación en base del ahorro», como definitivo.
   * Con la comisión también ilegible, la tarjeta pasa a «TECHO», que es la dirección contraria
   * de la que empuja el valor catastral total: allí la cuota no está acotada por ningún lado.
   */
  test('H3 (hallazgo) — con el valor catastral total ilegible, el IRPF no puede publicarse como definitivo', async ({
    page,
  }) => {
    // ≥ 20 años = 0,40 en la redacción del RDL 8/2023 (era 0,45, hallazgo 1559)
    expect(COEFICIENTES_IIVTNU_2025.find((c) => c.anios === 20)?.coeficiente).toBe(0.4);
    await montarH3(page);
    await sembrar23(page, 'Valor catastral total (suelo + construcción)', '600.000.00');
    const cuota = await valorTarjeta(page, 'IRPF sobre ganancia');
    expect(
      await descripcionTarjeta(page, 'IRPF sobre ganancia'),
      `la cuota ${cuota} se publica como definitiva y con el total leído sería 19.235,00 €`,
    ).toMatch(/valor catastral total/i);
  });

  /**
   * ⚠️ HALLAZGO H4 (contenido, MEDIO) — con ilegibles en direcciones OPUESTAS, el aviso remata
   * «así que el neto real es MAYOR que este» aunque el real sea MENOR.
   *
   * BASE B + comisión «3.5.0» (sube el neto) + mejoras «2.000.00» (lo baja):
   *   publicado: VT 199.000 · ganancia 49.000 · IRPF 1.140 + 43.000 × 21 % = 10.170
   *              neto = 200.000 − (1.000 + 10.170)                               = 188.830,00 €
   *   real (3,5 % y 2.000): VT 192.000 · adquisición 152.000 · ganancia 40.000
   *              IRPF = 1.140 + 34.000 × 21 % = 8.280
   *              neto = 200.000 − (1.000 + 7.000 + 8.280)                        = 183.720,00 €
   *   El real está 5.110,00 € POR DEBAJO, y el aviso cierra con «el neto real es MAYOR que este».
   *   La hermana `local-comercial` ya resuelve este cruce en su tarjeta del IRPF («Cuota sin
   *   cerrar: … la mueven en sentidos contrarios»); la app de referencia, no.
   *   esperado: el aviso no afirma una dirección que la otra mitad contradice
   *   obtenido: «…falta descontar la comisión inmobiliaria (…); hay importes que no se han podido
   *             leer y REDUCEN el impuesto (las mejoras), así que el neto real es MAYOR que este.»
   */
  test('H4 (hallazgo) — dos ilegibles opuestos no pueden rematar «el neto real es MAYOR»', async ({ page }) => {
    await vendedor23(page, '200000', [
      ...BASE_B,
      ['Comisión inmobiliaria (%)', '3.5.0'],
      ['Inversiones y mejoras (opcional)', '2.000.00'],
    ]);
    const aviso = await descripcionTarjeta(page, 'IMPORTE NETO VENDEDOR');
    // Los nombra a los dos y dice que no se puede saber hacia dónde queda el neto real: la
    // dirección conjunta depende de lo que valgan (reparado con el sondeo, hallazgo 1229).
    expect(aviso).toContain('la comisión inmobiliaria');
    expect(aviso).toContain('las mejoras');
    expect(aviso).toContain('sentidos contrarios');
    expect(aviso, 'con el dato leído el neto real es 183.720,00 €, 5.110,00 € MENOS que el publicado').not.toContain(
      'el neto real es MAYOR que este',
    );
  });

  /**
   * ⚠️ HALLAZGO H5 (contenido, MEDIO) — el desglose del vendedor de la app de REFERENCIA se
   * quedó atrás de sus hermanas.
   *
   *   · «Valor de adquisición» con los gastos de aquella compra «2.000.50»: publica 150.000,00 €
   *     rotulado «Precio de compra + impuestos y gastos de aquella compra + mejoras», afirmando
   *     que suma lo que el motor tomó como 0. Es el hallazgo 1197 del garaje; garaje, trastero y
   *     local-comercial ya dicen «Solo el precio de compra: los impuestos y gastos de aquella
   *     compra no se han podido leer». El estimador, no.
   *   · La tarjeta «Comisión inmobiliaria» DESAPARECE con la comisión «3.5.0» (guarda `> 0`),
   *     el mismo defecto que el 1191 cerró en la gestoría del comprador de esta misma app;
   *     local-comercial la pinta «Sin leer» desde el hueco A3.
   *   esperado: la descripción dice que no se han podido leer · la línea de la comisión sigue
   *   obtenido: «Precio de compra + impuestos y gastos de aquella compra + mejoras» · sin línea
   */
  test('H5 (hallazgo) — el desglose del vendedor dice qué importes no se han podido leer', async ({ page }) => {
    await vendedor23(page, '200000', [...BASE_B, ['Impuestos y gastos que pagaste al comprar', '2.000.50']]);
    expect.soft(await descripcionTarjeta(page, 'Valor de adquisición')).toMatch(/no se han? podido leer/);

    await sembrar23(page, 'Impuestos y gastos que pagaste al comprar', '');
    await sembrar23(page, 'Comisión inmobiliaria (%)', '3.5.0');
    expect
      .soft(await page.locator('h3', { hasText: /^Comisión inmobiliaria/ }).count(), 'la línea de la comisión ilegible desaparece del desglose')
      .toBeGreaterThan(0);
  });

  /**
   * ⚠️ HALLAZGO H6 (contenido, BAJO) — «escrito pero ilegible» se sigue tratando como «no
   * escrito» en los mensajes, cuando el 23/09 se reparó justo eso en el grupo B (nave, solar,
   * terreno rústico: «el placeholder distingue el campo VACÍO del que tiene un texto que no se
   * ha podido leer»).
   *   · Precio de la vivienda «200.000.00» → «Introduce el precio del inmueble para ver el
   *     desglose…», con el precio a la vista en el campo.
   *   · Precio de compra «150.000.00» → IRPF «Falta el precio de compra original» y neto
   *     «Rellena el precio de compra original para obtener el neto real».
   *   esperado: «no se ha podido leer» · obtenido: «Introduce…», «Falta…», «Rellena…»
   */
  test('H6 (hallazgo) — un precio escrito pero ilegible no se pide como si faltara', async ({ page }) => {
    await abrir23(page);
    await sembrar23(page, 'Precio de la vivienda', '200.000.00');
    expect
      .soft(await page.getByText(/Introduce el precio/).first().innerText())
      .toMatch(/no se ha podido leer/i);

    await vendedor23(page, '200000', [...BASE_B.slice(1), ['Precio de compra original', '150.000.00']]);
    expect.soft(await descripcionTarjeta(page, 'IRPF sobre ganancia')).toMatch(/no se ha podido leer/);
    expect.soft(await descripcionTarjeta(page, 'IMPORTE NETO VENDEDOR')).toMatch(/no se ha podido leer/);
  });

  /**
   * ⚠️ HALLAZGO H7 (contenido, BAJO) — con el par catastral imposible, la tarjeta de la
   * plusvalía pide revisar el recibo, pero el neto se publica como «Lo que realmente recibes».
   *
   * Es el mismo mecanismo que C1: el método real no se compara, y puede ser más barato. En el
   * CASO 54, con el recibo al derecho, el neto sube de 177.050,00 € a 178.512,50 € (1.462,50 €).
   * C1 añadió el total ilegible a `faltanPorAbaratar`; el par imposible, que es un total que la
   * app tampoco puede usar, se quedó fuera.
   *   esperado: el neto no se rotula «Lo que realmente recibes»
   *   obtenido: «Lo que realmente recibes»
   */
  test('H7 (hallazgo) — con el par catastral imposible el neto no es definitivo', async ({ page }) => {
    await montarParImposible(page);
    expect(await descripcionTarjeta(page, 'IMPORTE NETO VENDEDOR')).not.toBe('Lo que realmente recibes');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Propagación del hallazgo 1273 de solar (23/09/2026): la ayuda del precio no manda escribir
// «el mayor» con el valor de referencia catastral cuando el impuesto es IVA, cuya base es la
// contraprestación pactada (art. 78 Ley 37/1992). En Canarias, Ceuta y Melilla no hay IVA.
// ─────────────────────────────────────────────────────────────────────────────
test('la ayuda del precio depende del régimen: en IVA, el precio pactado (familia del 1273)', async ({ page }) => {
  await page.goto('/estimador-compraventa-inmueble/');
  await esperarHidratacion(page, ['input[aria-label="Precio de la vivienda"]']);
  const ayuda = page.getByText(/Precio escriturado o valor de referencia catastral|Precio pactado en la escritura/).first();
  await expect(ayuda).toContainText('(el mayor)');
  await page.getByRole('button', { name: /Primera mano/ }).click();
  await expect(ayuda).toContainText('la base del IVA es la contraprestación');
  await page.locator('select').filter({ has: page.locator('option[value="canarias"]') }).first().selectOption('canarias');
  await expect(ayuda).toContainText('(el mayor)');
});

// ─────────────────────────────────────────────────────────────────────────────
// Inspección 24/09/2026 — re-inspección tras 70cce469, 85c9c9fe (redacción común del neto
// incompleto) y 5b5d33ae (IGIC/IPSI «puede ser»). Las tres reparaciones hacen lo que dicen y la
// batería previa pasa entera (134/134). Lo nuevo sale de los controles que NO son `<NumberInput>`
// —el punto ciego del candado `check:familias`—: el tipo de inmueble cruzado con las casillas
// del vendedor, el botón «Estimar por mí», y las ramas de texto que el testigo de familia no lee
// (tarjetas del IRPF y de la pérdida, título del coste total del comprador, FAQ).
//
// Todos los importes están resueltos a mano ANTES de ejecutar, con las tablas de data/fiscal:
// ITP_CCAA (data/itp-ccaa.ts), COEFICIENTES_IIVTNU_2025, PLUSVALIA_MUNICIPAL_META.tipoOrientativo
// (25 %), TRAMOS_GANANCIAS_PATRIMONIALES_2025 (19/21/23/27/30 %) y los aranceles de los RD
// 1426/1989 (notaría, factura ×1,75) y 1427/1989 (registro).
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Inspección 24/09/2026 — el tipo de inmueble en el vendedor y las ramas que el testigo no lee', () => {
  /** Siembra comprobando que el ESTADO de React recogió el valor, y después acota con el blur. */
  async function sembrar24(page: Page, etiqueta: string, valor: string): Promise<void> {
    const campo = page.locator(`input[aria-label="${etiqueta}"]`);
    await campo.fill(valor);
    await esperarValorEnReact(page, campo, valor);
    await campo.blur();
  }

  async function abrir24(page: Page): Promise<void> {
    await page.goto(RUTA);
    await esperarHidratacion(page, ['input[aria-label="Precio de la vivienda"]']);
  }

  /** Pestaña Vendedor con el precio de venta y los campos indicados, en orden. */
  async function vendedor24(
    page: Page,
    precio: string,
    campos: ReadonlyArray<readonly [string, string]>,
    opciones: { inmueble?: RegExp; etiquetaPrecio?: string } = {},
  ): Promise<void> {
    await abrir24(page);
    if (opciones.inmueble) await page.getByRole('button', { name: opciones.inmueble }).click();
    await sembrar24(page, opciones.etiquetaPrecio ?? 'Precio de la vivienda', precio);
    await page.getByRole('button', { name: 'Vendedor' }).click();
    await esperarHidratacion(page, ['input[aria-label="Precio de compra original"]']);
    for (const [etiqueta, valor] of campos) await sembrar24(page, etiqueta, valor);
  }

  const textoH3 = async (page: Page, titulo: RegExp) =>
    (await page.locator('h3', { hasText: titulo }).first().innerText()).trim();

  // ─── Montajes (los usan el CONTROL y cada `test.fail()`) ───────────────────────────────

  /** Local comercial · Madrid · 300.000 · compra 200.000 · 10 años · suelo 60.000 · 3 %. */
  const montarLocal = (page: Page) =>
    vendedor24(
      page,
      '300000',
      [
        ['Precio de compra original', '200000'],
        ['Años de propiedad', '10'],
        ['Valor catastral del suelo', '60000'],
      ],
      { inmueble: /Local comercial/, etiquetaPrecio: 'Precio del inmueble' },
    );

  /** Ni ganancia ni pérdida: 200.000 · compra 200.000 · 5 años · suelo 50.000 · comisión 0. */
  const montarGananciaCero = (page: Page) =>
    vendedor24(page, '200000', [
      ['Precio de compra original', '200000'],
      ['Años de propiedad', '5'],
      ['Valor catastral del suelo', '50000'],
      ['Comisión inmobiliaria (%)', '0'],
    ]);

  /** Pérdida con los gastos de aquella compra ilegibles: 250.000 · compra 300.000 · 10 años. */
  const montarPerdidaIlegible = (page: Page) =>
    vendedor24(page, '250000', [
      ['Precio de compra original', '300000'],
      ['Años de propiedad', '10'],
      ['Valor catastral del suelo', '50000'],
      ['Impuestos y gastos que pagaste al comprar', '2.000.50'],
    ]);

  /** Base B del testigo con dos ilegibles opuestos: comisión «3.5.0» y mejoras «2.000.00». */
  const montarMixto = (page: Page) =>
    vendedor24(page, '200000', [
      ['Precio de compra original', '150000'],
      ['Años de propiedad', '10'],
      ['Valor catastral del suelo', '50000'],
      ['Comisión inmobiliaria (%)', '3.5.0'],
      ['Inversiones y mejoras (opcional)', '2.000.00'],
    ]);

  /** Comprador · Madrid · 200.000 · gestoría ilegible «2.000.50». */
  const montarGestoriaIlegible = async (page: Page) => {
    await abrir24(page);
    await sembrar24(page, 'Precio de la vivienda', '200000');
    await sembrar24(page, 'Gastos de gestoría del comprador (€)', '2.000.50');
  };

  /** Base B con la comisión escrita con punto decimal, «3.5» (se lee 3,5 %: no agrupa de tres en tres). */
  const montarComisionPunto = (page: Page) =>
    vendedor24(page, '200000', [
      ['Precio de compra original', '150000'],
      ['Años de propiedad', '10'],
      ['Valor catastral del suelo', '50000'],
      ['Comisión inmobiliaria (%)', '3.5'],
    ]);

  /**
   * CASO 55 (normal) — Valencia, segunda mano, vivienda de 250.000 €, perfil «Familia numerosa».
   * Nunca probado: Valencia solo había pasado por obra nueva (CASO 8) y por el canto de su
   * escala con perfil General (CASO 29).
   *
   * `elegirTipoITP('valencia', 'familia-numerosa', 250000, {viviendaHabitual: true})`:
   *   candidato «Familia numerosa» 4 % con [Familia numerosa, Vivienda habitual]: el perfil
   *   cubre la primera y la vivienda la segunda → SE APLICA. «Familia monoparental» (4 %) no la
   *   cubre el perfil y no rebaja del 4 % → fuera de la lista. «Víctimas violencia de género»
   *   (3 %) no es de colectivo según DE_COLECTIVO y baja del 4 % → se enseña como oportunidad.
   *   ITP      = 250.000 × 4 %                                                 =  10.000,00 €
   *   Notaría y registro recalculados a mano el 12/10/2026 con la rebaja del 5 % del nº 2.1
   *   (hallazgos 2901 y 2902), como en el CASO 41:
   *   Notaría  = arancel (383,435226) × 0,95 × 1,21 × 1,75 = 771,327886          =     771,33 €
   *              (horquilla ×1,5 = 661,14 € · ×2 = 881,52 €; sin la rebaja 811,92, entre 695,93
   *              y 927,91)
   *   Registro = ((24,040484 + 42,0708575 + 37,56325 + 67,613865 + 99.746,97 × 0,03 %) × 0,95
   *               + 6,010121 + 3,005061) × 1,21 = 200,167102 × 1,21             =     242,20 €
   *               (sin la rebaja, 254,37)
   *   Gestoría (GESTORIA_TIPICA)                                               =     300,00 €
   *   Total = 11.313,53 € → 4,5254 % → «4,53 %» · COSTE TOTAL = 261.313,53 €
   */
  test('CASO 55 (normal) — Valencia, familia numerosa, 250.000 €: el reducido del 4 % se aplica y el 3 % se enseña', async ({
    page,
  }) => {
    const fn = ITP_CCAA['valencia'].tiposReducidos.find((t) => t.nombre === 'Familia numerosa');
    expect(fn?.tipo, 'el reducido sale de la tabla').toBe(4);
    expect(fn?.condiciones).toEqual(['Familia numerosa', 'Vivienda habitual']);
    expect(ITP_CCAA['valencia'].tipoGeneral).toBe(9);

    await abrir24(page);
    await page.locator('#ccaa-inmueble').selectOption('valencia');
    await sembrar24(page, 'Precio de la vivienda', '250000');
    await page.locator('#perfil-comprador').selectOption('familia-numerosa');

    expect(await valorTarjeta(page, 'ITP (4,00 %)')).toBe('10.000,00 €');
    expect(await valorTarjeta(page, /^Gastos de notaría/)).toBe('771,33 €');
    expect(await descripcionTarjeta(page, /^Gastos de notaría/)).toContain('entre 661,14 € y 881,52 €');
    expect(await valorTarjeta(page, /^Registro de la Propiedad/)).toBe('242,20 €');
    expect(await valorTarjeta(page, 'Gastos de gestoría')).toBe('300,00 €');
    expect(await valorTarjeta(page, /^Total gastos adicionales/)).toBe('11.313,53 €');
    expect(await descripcionTarjeta(page, /^Total gastos adicionales/)).toBe('4,53 % sobre el precio');
    expect(await valorTarjeta(page, /^COSTE TOTAL/)).toBe('261.313,53 €');

    const aviso = page.locator('div[class*="avisoReducidos"]');
    await expect(aviso).toContainText('El cálculo aplica el 4,00 % (Familia numerosa)');
    await expect(aviso).toContainText('3,00 % — Víctimas violencia de género');
    await expect(aviso).not.toContainText('Familia monoparental');
  });

  /**
   * CASO 56 (normal, vendedor) — Galicia · venta 380.000 · compra 210.000 · 22 años · suelo
   * 160.000 · total 500.000 · comisión 3 % · «Estimar por mí». Tres cosas a la vez que ningún
   * caso anterior juntó: el botón en una comunidad de tipo plano, el tope de 20 años del
   * coeficiente con el método REAL ganando, y el tramo del 23 % de la base del ahorro.
   *
   * ⚠️ 24/09/2026 (hallazgo 1559): con el coeficiente vigente de ≥ 20 años (0,40, RDL 8/2023;
   * era 0,45) y el total de 400.000 que llevaba el caso, el real (17.000) ya no ganaba al
   * objetivo (16.000). Para seguir probando lo que el caso prueba, el total pasa a 500.000.
   *
   *   Recalculado a mano el 12/10/2026 con la rebaja del 5 % del nº 2.1 de los dos aranceles
   *   (hallazgos 2901 y 2902; sin ella el botón escribía «18.109» y el neto era 326.935,07):
   *   Estimar = ITP Galicia 8 % plano (210.000 × 8 % = 16.800) + notaría (363,435226 × 0,95 ×
   *             1,21 × 1,75 = 731,095386) + registro ((189,212547 × 0,95 + 9,015182) × 1,21 =
   *             228,408194) + gestoría 300
   *           = 18.059,50 → el campo recibe «18.060», que se relee 18.060 (millar español)
   *   Plusvalía: 22 años → tope de 20 → coeficiente 0,40
   *     objetivo = 160.000 × 0,40 × 25 %                                        =  16.000,00 €
   *     real     = (380.000 − 210.000) × (160.000 / 500.000) × 25 %             =  13.600,00 €
   *     → «Método real (más favorable)», 13.600,00 €
   *   Comisión = 380.000 × 3 %                                                  =  11.400,00 €
   *   Valor de adquisición = 210.000 + 18.060                                   = 228.060,00 €
   *   Valor de transmisión = 380.000 − 11.400 − 13.600                          = 355.000,00 €
   *   Ganancia = 126.940 → IRPF = 6.000×19 % + 44.000×21 % + 76.940×23 %
   *            = 1.140 + 9.240 + 17.696,20                                      =  28.076,20 €
   *   Total gastos = 13.600 + 11.400 + 28.076,20                                =  53.076,20 €
   *   Neto = 380.000 − 53.076,20                                                = 326.923,80 €
   */
  test('CASO 56 (normal) — Galicia, «Estimar por mí», método real con el tope de 20 años y tramo del 23 %', async ({
    page,
  }) => {
    expect(ITP_CCAA['galicia'].tipoGeneral).toBe(8);
    expect(ITP_CCAA['galicia'].tramosProgresivos).toBeUndefined();
    expect(COEFICIENTES_IIVTNU_2025.find((c) => c.anios === 20)?.coeficiente).toBe(0.4);
    expect(TRAMOS_GANANCIAS_PATRIMONIALES_2025.slice(0, 3).map((t) => t.tipo)).toEqual([19, 21, 23]);

    await abrir24(page);
    await page.locator('#ccaa-inmueble').selectOption('galicia');
    await sembrar24(page, 'Precio de la vivienda', '380000');
    await page.getByRole('button', { name: 'Vendedor' }).click();
    await esperarHidratacion(page, ['input[aria-label="Precio de compra original"]']);
    await sembrar24(page, 'Precio de compra original', '210000');
    await sembrar24(page, 'Años de propiedad', '22');
    await page.getByRole('button', { name: /Estimar por mí/ }).click();
    const gastos = page.locator('input[aria-label="Impuestos y gastos que pagaste al comprar"]');
    await esperarValorEnReact(page, gastos, '18.060');
    await sembrar24(page, 'Valor catastral del suelo', '160000');
    await sembrar24(page, 'Valor catastral total (suelo + construcción)', '500000');

    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('13.600,00 €');
    expect(await descripcionTarjeta(page, 'Plusvalía municipal')).toBe('Método real (más favorable)');
    expect(await valorTarjeta(page, 'Valor de adquisición')).toBe('228.060,00 €');
    expect(await valorTarjeta(page, 'Valor de transmisión')).toBe('355.000,00 €');
    expect(await valorTarjeta(page, 'Ganancia patrimonial')).toBe('126.940,00 €');
    expect(await valorTarjeta(page, /^IRPF sobre ganancia/)).toBe('28.076,20 €');
    expect(await valorTarjeta(page, /^Comisión inmobiliaria/)).toBe('11.400,00 €');
    expect(await valorTarjeta(page, /^Total gastos vendedor/)).toBe('53.076,20 €');
    expect(await valorTarjeta(page, /^IMPORTE NETO VENDEDOR/)).toBe('326.923,80 €');
    expect(await descripcionTarjeta(page, /^IMPORTE NETO VENDEDOR/)).toBe('Lo que realmente recibes');
  });

  /**
   * CASO 57 (debe rechazarse) — «Estimar por mí» con un precio de compra ESCRITO pero ilegible
   * («150.000.00»). El CASO 26 solo probaba el campo vacío: aquí el texto está a la vista y el
   * botón tampoco puede estimar sobre un NaN.
   */
  test('CASO 57 (debe rechazarse) — «Estimar por mí» no estima sobre un precio de compra ilegible', async ({ page }) => {
    await vendedor24(page, '250000', [['Precio de compra original', '150.000.00']]);
    await expect(page.getByRole('button', { name: /Estimar por mí/ })).toBeDisabled();
    expect(await valorTarjeta(page, /^IRPF sobre ganancia/)).toBe('Sin calcular');
  });

  /**
   * CONTROL de montaje — repite la preparación de cada hallazgo de abajo y exige las cifras que
   * la app publica, calculadas a mano. Si esto se pone rojo, el que falla es el montaje, no el
   * hallazgo.
   *
   * ⚠️ 24/09/2026 — las cifras se recalcularon con los coeficientes del art. 107.4 TRLRHL en la
   * redacción del RDL 8/2023 (hallazgo 1559): 10 años = 0,12 (antes 0,08).
   */
  test('CONTROL de montaje — las preparaciones de los hallazgos del 24/09 publican las cifras del motor', async ({
    page,
  }) => {
    // Siete montajes seguidos, cada uno con su navegación: el límite de 30 s no alcanza.
    test.setTimeout(90_000);
    // Local: plusvalía 60.000 × 0,12 × 25 % = 1.800 · comisión 9.000 · ganancia 300.000 −
    // 9.000 − 1.800 − 200.000 = 89.200 → IRPF 1.140 + 9.240 + 39.200 × 23 % = 19.396,00 ·
    // neto 300.000 − 1.800 − 9.000 − 19.396 = 269.804,00. Y sin casillas de vivienda habitual:
    // con un local ya no se ofrecen (hallazgo 1553).
    await montarLocal(page);
    await expect(page.getByRole('checkbox', { name: 'Es mi vivienda habitual' })).toHaveCount(0);
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('1800,00 €');
    expect(await valorTarjeta(page, /^IRPF sobre ganancia/)).toBe('19.396,00 €');
    expect(await valorTarjeta(page, /^IMPORTE NETO VENDEDOR/)).toBe('269.804,00 €');

    // Ganancia cero: 200.000 − 0 − 0 (no sujeta) − 200.000 = 0
    await montarGananciaCero(page);
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('NO SUJETA');
    expect(await valorTarjeta(page, 'Sin ganancia ni pérdida')).toBe('0,00 €');
    expect(await valorTarjeta(page, /^IMPORTE NETO VENDEDOR/)).toBe('200.000,00 €');

    // Pérdida: 250.000 − 7.500 − 0 − 300.000 = −57.500 (con 2.000,50 legible sería −59.500,50)
    await montarPerdidaIlegible(page);
    expect(await valorTarjeta(page, 'Pérdida patrimonial')).toBe('57.500,00 €');
    expect(await descripcionTarjeta(page, 'Pérdida patrimonial')).toContain('la pérdida real es mayor que esta');

    // Mixto: comisión 0 y mejoras 0 → plusvalía 50.000 × 0,12 × 25 % = 1.500 · ganancia
    // 48.500 · IRPF 1.140 + 42.500 × 21 % = 10.065 · neto 200.000 − 1.500 − 10.065 = 188.435,00
    await montarMixto(page);
    expect(await valorTarjeta(page, /^IMPORTE NETO VENDEDOR/)).toBe('188.435,00 €');
    expect(await descripcionTarjeta(page, /^IMPORTE NETO VENDEDOR/)).toContain('Sin cerrar');

    // Gestoría ilegible: 12.000 + 721,04 + 224,96 = 12.946,00 · coste 212.946,00 (notaría y
    // registro con la rebaja del 5 % del nº 2.1, hallazgos 2901 y 2902, recalculados a mano el
    // 12/10/2026 como en el CASO 1; sin ella, 212.995,20)
    await montarGestoriaIlegible(page);
    expect(await valorTarjeta(page, /^COSTE TOTAL/)).toBe('212.946,00 €');
    expect(await descripcionTarjeta(page, /^COSTE TOTAL/)).toBe(
      'No incluye la gestoría, que no se ha podido leer: el coste real será mayor',
    );

    // Comisión «3.5»: 200.000 × 3,5 % = 7.000 · ganancia 200.000 − 7.000 − 1.500 − 150.000 =
    // 41.500 → IRPF 1.140 + 35.500 × 21 % = 8.595,00
    await montarComisionPunto(page);
    expect(await valorTarjeta(page, /^Comisión inmobiliaria/)).toBe('7000,00 €');
    expect(await valorTarjeta(page, /^IRPF sobre ganancia/)).toBe('8595,00 €');
  });

  /**
   * HALLAZGO 1553 (ALTO), REPARADO — la pestaña Vendedor aplicaba las exenciones de VIVIENDA
   * HABITUAL (art. 33.4.b y art. 38 LIRPF) a un LOCAL comercial: «Es mi vivienda habitual» venía
   * marcada por defecto sea cual sea el tipo de inmueble, y `exentoIRPF = vendedorMayor65 &&
   * esViviendaHabitual` no miraba `tipoInmueble`. Ahora las casillas solo se ofrecen con
   * «Vivienda», y el cálculo mira el tipo aunque el estado de las casillas sobreviva al cambio.
   *   Caso: marcar «Soy mayor de 65 años» con Vivienda y pasar a Local comercial.
   *   Esperado (sin exención, CONTROL de arriba): IRPF 19.396,00 € · neto 269.804,00 €
   *   Obtenido antes: «EXENTO · Mayor de 65 años + vivienda habitual» · neto 289.200,00 €
   */
  test('HALLAZGO 1553 — un local comercial no queda exento por mayor de 65 y vivienda habitual', async ({
    page,
  }) => {
    await abrir24(page);
    await sembrar24(page, 'Precio de la vivienda', '300000');
    await page.getByRole('button', { name: 'Vendedor' }).click();
    await esperarHidratacion(page, ['input[aria-label="Precio de compra original"]']);
    await sembrar24(page, 'Precio de compra original', '200000');
    await sembrar24(page, 'Años de propiedad', '10');
    await sembrar24(page, 'Valor catastral del suelo', '60000');
    await page.getByRole('checkbox', { name: 'Soy mayor de 65 años' }).check();
    // Con la vivienda habitual (marcada por defecto) sí está exenta: es el control.
    expect(await valorTarjeta(page, /^IRPF sobre ganancia/)).toBe('EXENTO');

    // El mismo estado de las casillas, con un local: ni se ofrecen ni eximen.
    await page.getByRole('button', { name: /Local comercial/ }).click();
    await expect(page.getByRole('checkbox', { name: 'Soy mayor de 65 años' })).toHaveCount(0);
    await expect(page.getByRole('checkbox', { name: 'Es mi vivienda habitual' })).toHaveCount(0);
    await expect(page.getByRole('note').filter({ hasText: 'art. 33.4.b LIRPF' })).toContainText(
      'no se aplican a la venta de un local comercial',
    );
    expect(await valorTarjeta(page, /^IRPF sobre ganancia/)).toBe('19.396,00 €');
    expect(await valorTarjeta(page, /^IMPORTE NETO VENDEDOR/)).toBe('269.804,00 €');
  });

  /** HALLAZGO 1553 (ALTO, misma raíz), REPARADO — ni por reinversión en vivienda habitual (art. 38). */
  test('HALLAZGO 1553 — un local comercial no queda exento por reinversión en vivienda habitual', async ({
    page,
  }) => {
    await abrir24(page);
    await sembrar24(page, 'Precio de la vivienda', '300000');
    await page.getByRole('button', { name: 'Vendedor' }).click();
    await esperarHidratacion(page, ['input[aria-label="Precio de compra original"]']);
    await sembrar24(page, 'Precio de compra original', '200000');
    await sembrar24(page, 'Años de propiedad', '10');
    await sembrar24(page, 'Valor catastral del suelo', '60000');
    await page.getByRole('checkbox', { name: /Voy a reinvertir en otra vivienda habitual/ }).check();
    await esperarHidratacion(page, ['input[aria-label="Importe que reinviertes en la nueva vivienda"]']);
    await sembrar24(page, 'Importe que reinviertes en la nueva vivienda', '300000');
    // Control con la vivienda: 300.000 reinvertidos ≥ 289.200 obtenidos → exención total.
    expect(await valorTarjeta(page, /^IRPF sobre ganancia/)).toBe('EXENTO');

    await page.getByRole('button', { name: /Local comercial/ }).click();
    await expect(page.getByRole('checkbox', { name: /Voy a reinvertir/ })).toHaveCount(0);
    await expect(page.locator('input[aria-label="Importe que reinviertes en la nueva vivienda"]')).toHaveCount(0);
    expect(await valorTarjeta(page, /^IRPF sobre ganancia/)).toBe('19.396,00 €');
  });

  /**
   * HALLAZGO 1554 (BAJO), REPARADO — residuo del 724. Sin ganancia ni pérdida la tarjeta del IRPF
   * decía «EXENTO · Tributación en base del ahorro»: no hay exención ni tributación, hay ausencia
   * de ganancia. Ahora «SIN CUOTA», como las hermanas, con una descripción que no afirma ninguna
   * de las dos cosas. La pérdida, igual: ya no es «EXENTO».
   */
  test('HALLAZGO 1554 — sin ganancia ni pérdida, el IRPF no está «EXENTO» ni «tributa»', async ({ page }) => {
    await montarGananciaCero(page);
    expect(await valorTarjeta(page, /^IRPF sobre ganancia/)).toBe('SIN CUOTA');
    expect(await descripcionTarjeta(page, /^IRPF sobre ganancia/)).toBe(
      'No hay ganancia que gravar, así que esta venta no tiene IRPF',
    );

    await montarPerdidaIlegible(page);
    expect(await valorTarjeta(page, /^IRPF sobre ganancia/)).toBe('SIN CUOTA');
    expect(await descripcionTarjeta(page, /^IRPF sobre ganancia/)).toContain('No hay ganancia que gravar');
  });

  /**
   * HALLAZGO 1555 (BAJO), REPARADO — la redacción común no llegaba a la tarjeta de la PÉRDIDA
   * (`avisoPerdida` era la única sin `mayuscula()`), el «Sin cerrar» conjugaba por el número de
   * campos («las mejoras lo subiría») y las tarjetas remataban «Escríbelo» tras dos importes.
   */
  test('HALLAZGO 1555 — el aviso de la pérdida empieza en mayúscula, como los demás', async ({ page }) => {
    await montarPerdidaIlegible(page);
    expect(await descripcionTarjeta(page, 'Pérdida patrimonial')).toBe(
      'No se han podido leer los impuestos y gastos de aquella compra: la pérdida real es mayor que esta. Escríbelo con coma decimal (1.234,56).',
    );
  });

  test('HALLAZGO 1555 — «las mejoras lo subirían» y «Escríbelos» tras dos importes', async ({ page }) => {
    await montarMixto(page);
    const neto = await descripcionTarjeta(page, /^IMPORTE NETO VENDEDOR/);
    expect(neto).toContain('(la comisión inmobiliaria lo bajaría; las mejoras lo subirían)');
    expect(neto).not.toContain('las mejoras lo subiría)');
    // La cuota: los dos ilegibles la bajarían (la comisión es gasto de transmisión y las mejoras
    // suman al valor de adquisición), así que la dirección es segura y el remate va en plural.
    expect(await descripcionTarjeta(page, /^IRPF sobre ganancia/)).toBe(
      // Desde el hallazgo 3386 (20/10/2026) el aviso va seguido de la base del ahorro de la cuota.
      'No se han podido leer la comisión inmobiliaria y las mejoras, así que la cuota real es menor. Escríbelos con coma decimal (1.234,56). Calculado como si esta venta fuera tu única renta del ahorro del año: si tienes intereses, dividendos u otras ganancias, escríbelos arriba, porque la cuota puede ser mayor.',
    );
  });

  /**
   * HALLAZGO 1556 (BAJO), REPARADO — con la gestoría ilegible, el comprador titulaba «COSTE
   * TOTAL DE ADQUISICIÓN» y «Total gastos adicionales» mientras la descripción decía «será
   * mayor». Misma condición que el IGIC/IPSI no calculado: «(PARCIAL)» (patrón de familia 1).
   */
  test('HALLAZGO 1556 — un coste total al que le falta la gestoría se rotula (PARCIAL)', async ({ page }) => {
    await montarGestoriaIlegible(page);
    expect(await textoH3(page, /^COSTE TOTAL/)).toBe('COSTE TOTAL (PARCIAL)');
    expect(await textoH3(page, /^Total gastos adicionales/)).toBe('Total gastos adicionales (parcial)');
    // Con la gestoría legible vuelve a ser definitivo.
    await sembrar24(page, 'Gastos de gestoría del comprador (€)', '300');
    expect(await textoH3(page, /^COSTE TOTAL/)).toBe('COSTE TOTAL DE ADQUISICIÓN');
  });

  /**
   * HALLAZGO 1557 (BAJO, dato), REPARADO — la FAQ visible y las dos del JSON-LD decían que sin
   * incremento se puede «quedar exento». El art. 104.5 TRLRHL (redacción del RDL 26/2021,
   * verificado en el BOE el 24/09/2026) dice «No se producirá la sujeción al impuesto en las
   * transmisiones de terrenos respecto de los cuales se constate la inexistencia de incremento
   * de valor»: es NO SUJECIÓN, que es lo que dice la tarjeta desde el hallazgo 901.
   */
  test('HALLAZGO 1557 (dato) — sin incremento de valor la plusvalía no está «exenta», no está sujeta', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
    const visible = await page.locator('div[class*="faqList"]').innerText();
    const schemas = (await page.locator('script[type="application/ld+json"]').allTextContents()).join(' ');
    expect(`${visible} ${schemas}`).not.toMatch(/quedar exento/);
    await expect(page.getByRole('heading', { name: '¿Cuándo no se paga plusvalía municipal?' })).toBeVisible();
    expect(visible).toContain('la transmisión no está sujeta al impuesto (art. 104.5');
    // Las dos bocas del JSON-LD dicen lo mismo que la FAQ visible
    expect(schemas).toContain('no está sujeta');
    expect(schemas.match(/no está sujeta/g)?.length ?? 0).toBeGreaterThanOrEqual(2);
  });

  /**
   * HALLAZGO 1558 (BAJO), REPARADO — el título de la comisión repetía la CADENA tecleada: «3.5»
   * se calculaba bien (3,5 %) y se rotulaba «(3.5%)», con el punto estadounidense.
   */
  test('HALLAZGO 1558 — el porcentaje de la comisión se rotula en formato español', async ({ page }) => {
    await montarComisionPunto(page);
    expect(await textoH3(page, /^Comisión inmobiliaria/)).toBe('Comisión inmobiliaria (3,5\u00A0%)');
  });

  // ─── Los patrones de familia, también en la referencia (24/09/2026) ─────────────────────

  /**
   * PATRÓN 2 (hallazgos 1546, 1562 y 1570 de las hermanas; la referencia tenía la misma forma).
   * Con la plusvalía «Sin calcular» (suelo vacío) el valor de transmisión decía restarla, y la
   * ganancia y el IRPF salían como definitivos cuando son un MÁXIMO: al calcularse, la plusvalía
   * resta del valor de transmisión (art. 35.1 LIRPF).
   *   BASE B sin suelo: ganancia 200.000 − 6.000 − 150.000 = 44.000 → IRPF 1.140 + 38.000 × 21 %
   *   = 9.120,00. Con el suelo (50.000): plusvalía 1.500 · ganancia 42.500 · IRPF 8.805,00.
   */
  test('PATRÓN 2 — sin la plusvalía, la ganancia y el IRPF son un máximo y la transmisión no la resta', async ({
    page,
  }) => {
    await vendedor24(page, '200000', [
      ['Precio de compra original', '150000'],
      ['Años de propiedad', '10'],
    ]);
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('Sin calcular');
    expect(await descripcionTarjeta(page, 'Valor de transmisión')).toBe(
      'Precio de venta − comisión y otros gastos de la venta, sin la plusvalía municipal, que falta',
    );
    expect(await textoH3(page, /^Ganancia patrimonial/)).toBe('Ganancia patrimonial (máximo)');
    expect(await valorTarjeta(page, /^Ganancia patrimonial/)).toBe('44.000,00 €');
    expect(await textoH3(page, /^IRPF sobre ganancia/)).toBe('IRPF sobre ganancia (máximo)');
    expect(await valorTarjeta(page, /^IRPF sobre ganancia/)).toBe('9120,00 €');
    // Desde el hallazgo 3386 (20/10/2026) el aviso va seguido de la base del ahorro de la cuota.
    expect(await descripcionTarjeta(page, /^IRPF sobre ganancia/)).toBe(
      'No resta la plusvalía municipal, que falta, así que la cuota real puede ser menor. Calculado como si esta venta fuera tu única renta del ahorro del año: si tienes intereses, dividendos u otras ganancias, escríbelos arriba, porque la cuota puede ser mayor.',
    );
    // Con el suelo la cuota baja, que es lo que el «máximo» anunciaba
    await sembrar24(page, 'Valor catastral del suelo', '50000');
    expect(await textoH3(page, /^IRPF sobre ganancia/)).toBe('IRPF sobre ganancia');
    expect(await valorTarjeta(page, /^IRPF sobre ganancia/)).toBe('8805,00 €');
  });

  /**
   * PATRÓN 4 (hallazgos 1548, 1564 y 1572) — vendiendo por debajo de la compra la no sujeción del
   * art. 104.5 TRLRHL no depende del suelo: sin él, la plusvalía sale «NO SUJETA» y el neto es
   * definitivo. 150.000 · compra 200.000 · 10 años · suelo VACÍO · 3 %: neto 150.000 − 4.500 =
   * 145.500,00 (el mismo que con el suelo, CASO 3).
   */
  test('PATRÓN 4 — vendiendo con pérdida, la plusvalía no sujeta no necesita el suelo', async ({ page }) => {
    await vendedor24(page, '150000', [
      ['Precio de compra original', '200000'],
      ['Años de propiedad', '10'],
    ]);
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('NO SUJETA');
    expect(await descripcionTarjeta(page, 'Plusvalía municipal')).toBe('No sujeta (sin incremento de valor)');
    expect(await textoH3(page, /^IMPORTE NETO VENDEDOR/)).toBe('IMPORTE NETO VENDEDOR');
    expect(await valorTarjeta(page, /^IMPORTE NETO VENDEDOR/)).toBe('145.500,00 €');
    expect(await descripcionTarjeta(page, /^IMPORTE NETO VENDEDOR/)).toBe('Lo que realmente recibes');
  });

  /**
   * PATRÓN 5 (hallazgos 1552, 1566 y 1578) — un año negativo se rechaza, pero no «falta»: está
   * escrito y a la vista. La app dice que no puede ser negativo y pide corregirlo.
   */
  test('PATRÓN 5 — unos años negativos no «faltan»: no pueden ser negativos', async ({ page }) => {
    await vendedor24(page, '300000', [
      ['Precio de compra original', '200000'],
      ['Años de propiedad', '-3'],
      ['Valor catastral del suelo', '60000'],
    ]);
    await expect(page.locator('input[aria-label="Años de propiedad"]')).toHaveValue('-3');
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('Sin calcular');
    expect(await descripcionTarjeta(page, 'Plusvalía municipal')).toBe(
      'Los años de tenencia no pueden ser negativos. Este impuesto NO está incluido en el neto de abajo.',
    );
    const neto = await descripcionTarjeta(page, /^IMPORTE NETO VENDEDOR/);
    expect(neto).toContain('Corrige los años de tenencia (no pueden ser negativos) para obtenerlo.');
    expect(neto).not.toMatch(/faltan? los años|Rellena los años/);
  });

  /**
   * PATRÓN 6 (hallazgos 1549, 1565 y 1575) — la tarjeta «Sin ganancia ni pérdida» no puede negar
   * una pérdida que la app sabe que hay sin leer.
   *   200.000 · compra 192.500 · 10 años · suelo 50.000 · 3 %: plusvalía 1.500 · ganancia
   *   200.000 − 6.000 − 1.500 − 192.500 = 0. Con los gastos de aquella compra «2.000.50», que
   *   con cualquier valor positivo darían una pérdida compensable.
   */
  test('PATRÓN 6 — el cero con un importe ilegible no niega la pérdida', async ({ page }) => {
    await vendedor24(page, '200000', [
      ['Precio de compra original', '192500'],
      ['Años de propiedad', '10'],
      ['Valor catastral del suelo', '50000'],
    ]);
    expect(await valorTarjeta(page, 'Sin ganancia ni pérdida')).toBe('0,00 €');
    expect(await descripcionTarjeta(page, 'Sin ganancia ni pérdida')).toBe(
      'Vendes exactamente por el valor de adquisición: no hay IRPF que pagar ni pérdida que compensar',
    );
    await sembrar24(page, 'Impuestos y gastos que pagaste al comprar', '2.000.50');
    expect(await valorTarjeta(page, 'Sin ganancia ni pérdida')).toBe('0,00 €');
    expect(await descripcionTarjeta(page, 'Sin ganancia ni pérdida')).toBe(
      'No se han podido leer los impuestos y gastos de aquella compra, así que hay una pérdida que se compensaría en la declaración. Escríbelo con coma decimal (1.234,56).',
    );
  });

  /**
   * HALLAZGO 1561 (visto en trastero; la referencia tenía el mismo mecanismo) — con un ilegible
   * que SUBIRÍA el neto y la plusvalía que FALTA, que lo bajaría, no hay dirección segura.
   *   20.000 · compra 16.000 · años VACÍOS · suelo 10.000 de 12.000 · 3 % · gastos «2.000.50»:
   *   ganancia 20.000 − 600 − 16.000 = 3.400 → IRPF 646 · neto 20.000 − 600 − 646 = 18.754,00
   */
  test('HALLAZGO 1561 — un ilegible que sube el neto y la plusvalía que falta: «Sin cerrar»', async ({ page }) => {
    await vendedor24(page, '20000', [
      ['Precio de compra original', '16000'],
      ['Valor catastral del suelo', '10000'],
      ['Valor catastral total (suelo + construcción)', '12000'],
      ['Impuestos y gastos que pagaste al comprar', '2.000.50'],
    ]);
    expect(await valorTarjeta(page, /^IMPORTE NETO VENDEDOR/)).toBe('18.754,00 €');
    const aviso = await descripcionTarjeta(page, /^IMPORTE NETO VENDEDOR/);
    expect(aviso).not.toContain('el neto real es MAYOR');
    expect(aviso).toContain(
      'Sin cerrar: no se han podido leer los impuestos y gastos de aquella compra y lo subirían, pero falta la plusvalía municipal, que lo bajaría',
    );
  });

  /**
   * PRORRATEO (hallazgo 1560) — ya cubierto en el CASO 34; aquí, la ayuda del campo, que decía
   * «con un coeficiente mayor»: prorrateado, el coeficiente de la reventa dentro del año es
   * siempre MENOR que el de un año entero.
   */
  test('HALLAZGO 1560 — la ayuda de los años ya no promete «un coeficiente mayor»', async ({ page }) => {
    await abrir24(page);
    await page.getByRole('button', { name: 'Vendedor' }).click();
    const ayuda = await page.locator('input[aria-label="Años de propiedad"]').evaluate((el) => {
      const id = el.getAttribute('aria-describedby');
      return (id ? document.getElementById(id)?.textContent : el.parentElement?.parentElement?.textContent) ?? '';
    });
    expect(ayuda).not.toContain('coeficiente mayor');
    expect(ayuda).toContain('meses completos');
  });

  /**
   * HALLAZGO 1599 (motor) en la pantalla — por encima de 6.010.121,04 € el arancel notarial no
   * fija cantidad (RD 1426/1989, nº 2.1). Madrid · 7.000.000 € · segunda mano:
   *   ITP 6 % = 420.000 · notaría hasta el límite: (558,941276 + 5.409.108,94 × 0,03 %) =
   *   2.181,673958 × 0,95 (rebaja del nº 2.1, hallazgo 2901) = 2.072,590260 × 1,21 × 1,75 =
   *   4.388,71 € (recalculado a mano el 12/10/2026; sin la rebaja, 4.619,69) · y la parte que
   *   excede, de libre acuerdo: el coste total se rotula «(PARCIAL)» con «puede ser mayor».
   */
  test('HALLAZGO 1599 — la notaría por encima del arancel es de libre acuerdo y el coste sale (PARCIAL)', async ({
    page,
  }) => {
    await abrir24(page);
    await sembrar24(page, 'Precio de la vivienda', '7000000');
    expect(await valorTarjeta(page, /^Gastos de notaría/)).toBe('4388,71 €');
    expect(await descripcionTarjeta(page, /^Gastos de notaría/)).toContain(
      'Por encima de 6.010.121,04 € el arancel no fija cantidad',
    );
    expect(await textoH3(page, /^COSTE TOTAL/)).toBe('COSTE TOTAL (PARCIAL)');
    expect(await descripcionTarjeta(page, /^COSTE TOTAL/)).toBe(
      'No incluye la parte de la notaría que excede de 6.010.121,04 €, que es de libre acuerdo: el coste real puede ser mayor',
    );
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Inspector 25/09/2026 — re-inspección de la app de referencia de la familia de compraventa.
//
// Viene por la SOSPECHA que dejó la del 24/09 sin caso reproducible, y la convierte en caso:
//  (a) «Estimar por mí» rellena los gastos de aquella compra con ITP de SEGUNDA MANO a los tipos
//      de HOY, y la pantalla no lo dice ni pregunta nada que permita saberlo (hallazgos A1 y A2).
//  (b) La comisión lleva `max={10}`: con el foco, «15» calcula el 15 %; al salir del campo se
//      reescribe a 10 sin una palabra y el neto sube (hallazgo B).
// Y la inspección normal: CASOS 58-60 más cinco hallazgos nuevos (reinversión con la hipoteca que
// agota el importe obtenido, su sondeo de ilegibles, el precio de compra 0, el % pegado, el
// contraste de la marca y el ejemplo de Ana).
//
// Todos los importes están resueltos a mano ANTES de ejecutar, con: ITP_CCAA y los aranceles de
// data/itp-ccaa.ts (RD 1426/1989 notaría, factura ×1,75; RD 1427/1989 registro),
// IVA_INMUEBLES_2025, COEFICIENTES_IIVTNU_2025, PLUSVALIA_MUNICIPAL_META.tipoOrientativo (25 %) y
// TRAMOS_GANANCIAS_PATRIMONIALES_2025 (19/21/23/27/30 %) de data/fiscal, y el art. 41 del RIRPF
// (RD 439/2007, texto consolidado del BOE consultado el 25/09/2026) que cita
// data/fiscal/ganancia-inmueble.ts.
//
// Los porcentajes se buscan con « ?%» a propósito: el hallazgo del % pegado se va a reparar, y
// estos casos no tienen que ponerse rojos por el espacio (valorTarjeta ya normaliza el duro).
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Inspector 25/09/2026 — «Estimar por mí», el tope de la comisión y la reinversión', () => {
  /** Escribe como el usuario y comprueba que el ESTADO de React lo recogió; después sale del campo. */
  async function sembrar25(page: Page, etiqueta: string, valor: string, salir = true): Promise<void> {
    const campo = page.locator(`input[aria-label="${etiqueta}"]`);
    await campo.fill(valor);
    await esperarValorEnReact(page, campo, valor);
    if (salir) await campo.blur();
  }

  async function abrir25(page: Page): Promise<void> {
    await page.goto(RUTA);
    await esperarHidratacion(page, ['input[aria-label="Precio de la vivienda"]']);
  }

  /** Pestaña Vendedor con el precio de venta y los campos indicados, en orden. */
  async function vendedor25(
    page: Page,
    precio: string,
    campos: ReadonlyArray<readonly [string, string]>,
    ccaa?: string,
  ): Promise<void> {
    await abrir25(page);
    if (ccaa) await page.locator('#ccaa-inmueble').selectOption(ccaa);
    await sembrar25(page, 'Precio de la vivienda', precio);
    await page.getByRole('button', { name: 'Vendedor' }).click();
    await esperarHidratacion(page, ['input[aria-label="Precio de compra original"]']);
    for (const [etiqueta, valor] of campos) await sembrar25(page, etiqueta, valor);
  }

  const formVendedor = (page: Page) => page.locator('div[class*="formVendedor"]');
  const campoGastosCompra = (page: Page) =>
    page.locator('input[aria-label="Impuestos y gastos que pagaste al comprar"]');

  // ─── Montajes (los usan el CONTROL y cada `test.fail()`) ───────────────────────────────

  /** A1 · Madrid · venta 300.000 · compra 200.000 (obra nueva en 2010) · 16 años · suelo 60.000. */
  const montarObraNueva = (page: Page) =>
    vendedor25(page, '300000', [
      ['Precio de compra original', '200000'],
      ['Años de propiedad', '16'],
      ['Valor catastral del suelo', '60000'],
    ]);

  /** A2 · Valencia · venta 300.000 · compra 200.000 (de segunda mano, en 2025). */
  const montarValencia = (page: Page) =>
    vendedor25(page, '300000', [['Precio de compra original', '200000']], 'valencia');

  /** B · BASE B (200.000 · compra 150.000 · 10 años · suelo 50.000) con «15» en la comisión, SIN salir. */
  const montarComision15 = async (page: Page) => {
    await vendedor25(page, '200000', [
      ['Precio de compra original', '150000'],
      ['Años de propiedad', '10'],
      ['Valor catastral del suelo', '50000'],
    ]);
    await sembrar25(page, 'Comisión inmobiliaria (%)', '15', false);
  };

  /** R · 200.000 · compra 100.000 · 10 años · suelo 50.000 · 3 % · habitual · reinvierte `importe`. */
  const montarReinversion = async (page: Page, importe: string) => {
    await vendedor25(page, '200000', [
      ['Precio de compra original', '100000'],
      ['Años de propiedad', '10'],
      ['Valor catastral del suelo', '50000'],
    ]);
    await page.getByRole('checkbox', { name: /Voy a reinvertir/ }).check();
    await esperarHidratacion(page, ['input[aria-label="Importe que reinviertes en la nueva vivienda"]']);
    await sembrar25(page, 'Importe que reinviertes en la nueva vivienda', importe);
  };

  /**
   * CASO 58 (normal) — Asturias, segunda mano, vivienda de 350.000 €, perfil General. Asturias
   * solo había pasado una vez, y nunca por su escala progresiva (ITP_CCAA.asturias.tramosProgresivos:
   * 8 % hasta 300.000 · 9 % hasta 500.000 · 10 % el resto).
   *   ITP      = 300.000 × 8 % + 50.000 × 9 % = 24.000 + 4.500                    =  28.500,00 €
   *              efectivo 28.500 / 350.000 = 8,142857 %                           → «ITP (8,14 %)»
   *   Notaría y registro recalculados a mano el 12/10/2026 con la rebaja del 5 % del nº 2.1
   *   (hallazgos 2901 y 2902):
   *   Notaría  = arancel 90,151816 + 24.040,49 × 0,45 % + 30.050,60 × 0,15 % + 90.151,82 × 0,10 %
   *              + 199.746,97 × 0,05 % = 433,435226 × 0,95 = 411,763465 × 1,21 = 498,233792
   *              × 1,75 = 871,91 € (horquilla × 1,5 = 747,35 € · × 2 = 996,47 €; sin la rebaja
   *              917,80, entre 786,68 y 1048,91)
   *   Registro = (24,040484 + 42,0708575 + 37,56325 + 67,613865 + 199.746,97 × 0,03 % (59,924091))
   *              × 0,95 + 6,010121 + 3,005061 = 228,667102 × 1,21                  =     276,69 €
   *              (sin la rebaja, 290,67)
   *   Gestoría (GESTORIA_TIPICA)                                                   =     300,00 €
   *   Total = 28.500 + 871,91 + 276,69 + 300 = 29.948,60 € → 8,5567 % → «8,56 %»
   *   COSTE TOTAL = 379.948,60 €
   */
  test('CASO 58 (normal) — Asturias, 350.000 €: la escala progresiva cobra cada tramo a su tipo', async ({ page }) => {
    expect(ITP_CCAA['asturias'].tipoGeneral).toBe(8);
    expect(ITP_CCAA['asturias'].tramosProgresivos).toEqual([
      { hasta: 300000, tipo: 8 },
      { hasta: 500000, tipo: 9 },
      { hasta: Infinity, tipo: 10 },
    ]);

    await abrir25(page);
    await page.locator('#ccaa-inmueble').selectOption('asturias');
    await sembrar25(page, 'Precio de la vivienda', '350000');

    expect(await valorTarjeta(page, /ITP \(8,14\s?%\)/)).toBe('28.500,00 €');
    expect(await valorTarjeta(page, /^Gastos de notaría/)).toBe('871,91 €');
    expect(await descripcionTarjeta(page, /^Gastos de notaría/)).toContain('entre 747,35 € y 996,47 €');
    expect(await valorTarjeta(page, /^Registro de la Propiedad/)).toBe('276,69 €');
    expect(await valorTarjeta(page, 'Gastos de gestoría')).toBe('300,00 €');
    expect(await valorTarjeta(page, /^Total gastos adicionales/)).toBe('29.948,60 €');
    expect(await descripcionTarjeta(page, /^Total gastos adicionales/)).toMatch(/^8,56\s?% sobre el precio$/);
    expect(await valorTarjeta(page, /^COSTE TOTAL/)).toBe('379.948,60 €');
    // La escala se nombra con sus tres tipos, que es lo que describe el cálculo de arriba
    await expect(page.locator('div[class*="infoCcaa"]').first()).toContainText('escala progresiva');
  });

  /**
   * CASO 59 (límite) — el tramo MÁS ALTO de la base del ahorro (30 % por encima de 300.000) con la
   * comisión al 10 %, que fue el máximo del campo hasta el 25/09/2026 (hallazgo 1796: ya no lleva
   * max, y el blur tampoco la toca). Madrid · venta 1.000.000 · compra
   * 400.000 · 17 años · suelo 300.000 · sin valor catastral total.
   *   Plusvalía = 300.000 × 0,13 (17 años) × 25 %                                 =   9750,00 €
   *   Comisión  = 1.000.000 × 10 %                                                 = 100.000,00 €
   *   Transmisión = 1.000.000 − 100.000 − 9.750                                   = 890.250,00 €
   *   Ganancia  = 890.250 − 400.000                                                = 490.250,00 €
   *   IRPF = 6.000 × 19 % + 44.000 × 21 % + 150.000 × 23 % + 100.000 × 27 % + 190.250 × 30 %
   *        = 1.140 + 9.240 + 34.500 + 27.000 + 57.075                             = 128.955,00 €
   *   Total = 9.750 + 100.000 + 128.955 = 238.705,00 € · Neto = 761.295,00 €
   */
  test('CASO 59 (límite) — tramo del 30 % de la base del ahorro y una comisión del 10 %', async ({ page }) => {
    expect(COEFICIENTES_IIVTNU_2025.find((c) => c.anios === 17)?.coeficiente).toBe(0.13);
    expect(PLUSVALIA_MUNICIPAL_META.tipoOrientativo).toBe(25);
    expect(TRAMOS_GANANCIAS_PATRIMONIALES_2025.map((t) => t.tipo)).toEqual([19, 21, 23, 27, 30]);

    await vendedor25(page, '1000000', [
      ['Precio de compra original', '400000'],
      ['Años de propiedad', '17'],
      ['Valor catastral del suelo', '300000'],
      ['Comisión inmobiliaria (%)', '10'],
    ]);
    await expect(page.locator('input[aria-label="Comisión inmobiliaria (%)"]')).toHaveValue('10');
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('9750,00 €');
    expect(await descripcionTarjeta(page, 'Plusvalía municipal')).toBe(
      'Método objetivo (falta el valor catastral total para comparar)',
    );
    expect(await valorTarjeta(page, 'Valor de transmisión')).toBe('890.250,00 €');
    expect(await valorTarjeta(page, /^Ganancia patrimonial/)).toBe('490.250,00 €');
    expect(await valorTarjeta(page, /^IRPF sobre ganancia/)).toBe('128.955,00 €');
    expect(await valorTarjeta(page, /Comisión inmobiliaria \(10\s?%\)/)).toBe('100.000,00 €');
    expect(await valorTarjeta(page, /^Total gastos vendedor/)).toBe('238.705,00 €');
    expect(await valorTarjeta(page, /^IMPORTE NETO VENDEDOR/)).toBe('761.295,00 €');
    expect(await descripcionTarjeta(page, /^IMPORTE NETO VENDEDOR/)).toBe('Lo que realmente recibes');
  });

  /**
   * CASO 60 (debe rechazarse) — precio de compra «0». Una compraventa a 0 € no existe: no puede
   * liquidar plusvalía (sin incremento calculable) ni ganancia, ni «Estimar por mí» puede estimar.
   * Venta 200.000 · 10 años · suelo 50.000 · comisión 3 %: el neto queda en 200.000 − 6.000 =
   * 194.000,00 € y se rotula PARCIAL.
   */
  test('CASO 60 (debe rechazarse) — un precio de compra 0 no liquida plusvalía ni IRPF', async ({ page }) => {
    await vendedor25(page, '200000', [
      ['Precio de compra original', '0'],
      ['Años de propiedad', '10'],
      ['Valor catastral del suelo', '50000'],
    ]);
    await expect(page.getByRole('button', { name: /Estimar por mí/ })).toBeDisabled();
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('Sin calcular');
    expect(await valorTarjeta(page, /^IRPF sobre ganancia/)).toBe('Sin calcular');
    expect(await valorTarjeta(page, /^Comisión inmobiliaria/)).toBe('6000,00 €');
    expect(await valorTarjeta(page, /^IMPORTE NETO VENDEDOR/)).toBe('194.000,00 €');
    expect(await page.locator('h3', { hasText: /^IMPORTE NETO VENDEDOR/ }).first().innerText()).toBe(
      'IMPORTE NETO VENDEDOR (PARCIAL)',
    );
    expect(await descripcionTarjeta(page, /^IMPORTE NETO VENDEDOR/)).toContain('el neto real puede ser menor que este');
  });

  /**
   * CONTROL de montaje — repite la preparación de cada hallazgo y exige lo que la app publica hoy,
   * calculado a mano. Si esto se pone rojo, el que falla es el montaje, no el hallazgo.
   */
  test('CONTROL de montaje — las preparaciones de los hallazgos del 25/09 publican las cifras del motor', async ({
    page,
  }) => {
    test.setTimeout(90_000);
    expect(ITP_CCAA['madrid'].tipoGeneral).toBe(6);
    expect(ITP_CCAA['madrid'].ajd).toBe(0.75);
    expect(IVA_INMUEBLES_2025.obraNueva).toBe(10);
    expect(ITP_CCAA['valencia'].tipoGeneral).toBe(9);

    // A1 · «Estimar por mí» en Madrid para 200.000, con la rebaja del 5 % del nº 2.1 de los dos
    // aranceles (hallazgos 2901 y 2902; recalculado a mano el 12/10/2026 como en el CASO 1): ITP
    // 6 % = 12.000 + notaría 721,04 + registro 224,96 + gestoría 300 = 13.246,00 → «13.246» (sin la
    // rebaja, «13.295»). Plusvalía 60.000 × 0,10 (16 años) × 25 % = 1.500 · comisión 9.000 ·
    // ganancia 289.500 − 213.246 = 76.254 → IRPF 1.140 + 9.240 + 26.254 × 23 % (6.038,42) =
    // 16.418,42 · neto 300.000 − 1.500 − 9.000 − 16.418,42 = 273.081,58.
    await montarObraNueva(page);
    await page.getByRole('button', { name: /Estimar por mí/ }).click();
    await esperarValorEnReact(page, campoGastosCompra(page), '13.246');
    expect(await valorTarjeta(page, 'Valor de adquisición')).toBe('213.246,00 €');
    expect(await valorTarjeta(page, /^IRPF sobre ganancia/)).toBe('16.418,42 €');
    expect(await valorTarjeta(page, /^IMPORTE NETO VENDEDOR/)).toBe('273.081,58 €');
    // Con lo que pagó de verdad una obra nueva, ESCRITO a mano (no estimado: no depende del
    // arancel): 22.795 → ganancia 66.705 → IRPF 1.140 + 9.240 + 16.705 × 23 % = 14.222,15 · neto
    // 275.277,85.
    await sembrar25(page, 'Impuestos y gastos que pagaste al comprar', '22795');
    expect(await valorTarjeta(page, /^IRPF sobre ganancia/)).toBe('14.222,15 €');
    expect(await valorTarjeta(page, /^IMPORTE NETO VENDEDOR/)).toBe('275.277,85 €');

    // A2 · Valencia, 200.000: ITP 9 % = 18.000 + 721,04 + 224,96 + 300 = 19.246,00 → «19.246»
    // (con la rebaja; sin ella, «19.295». Con el 10 % que regía antes del 01/06/2026, según
    // data/fiscal/inmuebles.ts, serían 21.246).
    await montarValencia(page);
    await page.getByRole('button', { name: /Estimar por mí/ }).click();
    await esperarValorEnReact(page, campoGastosCompra(page), '19.246');

    // B · con el foco en la comisión, «15» se calcula al 15 %: comisión 30.000 · transmisión
    // 200.000 − 30.000 − 1.500 = 168.500 · ganancia 18.500 → IRPF 1.140 + 12.500 × 21 % = 3.765 ·
    // neto 200.000 − 1.500 − 30.000 − 3.765 = 164.735,00.
    await montarComision15(page);
    expect(await valorTarjeta(page, /^Comisión inmobiliaria/)).toBe('30.000,00 €');
    expect(await valorTarjeta(page, /^IMPORTE NETO VENDEDOR/)).toBe('164.735,00 €');

    // R · reinvierte 250.000 con 192.499 de hipoteca: transmisión 200.000 − 6.000 − 1.500 = 192.500
    // → importe total obtenido 1 € (art. 41.1 RIRPF) → reinvierte más → EXENTO.
    await montarReinversion(page, '250000');
    await sembrar25(page, 'Hipoteca pendiente de la vivienda que vendes', '192499');
    expect(await valorTarjeta(page, /^IRPF sobre ganancia/)).toBe('EXENTO');

    // R · reinvierte 100.000 con 2.000,50 de hipoteca, LEGIBLE: importe total obtenido 190.499,50
    // → exento 100.000 / 190.499,50 = 52,49 % de 92.500 → base 43.943,44 → IRPF 1.140 + 37.943,44
    // × 21 % = 9108,12 · neto 200.000 − 1.500 − 6.000 − 9.108,12 = 183.391,88. Sin hipoteca: 9214,09.
    await montarReinversion(page, '100000');
    expect(await valorTarjeta(page, /^IRPF sobre ganancia/)).toBe('9214,09 €');
    await sembrar25(page, 'Hipoteca pendiente de la vivienda que vendes', '2000,50');
    expect(await valorTarjeta(page, /^IRPF sobre ganancia/)).toBe('9108,12 €');
    expect(await valorTarjeta(page, /^IMPORTE NETO VENDEDOR/)).toBe('183.391,88 €');
  });

  /**
   * HALLAZGO A1 [medio] (Inspector 25/09/2026) — «Estimar por mí» supone que aquella compra fue de
   * SEGUNDA MANO. Quien compró obra nueva pagó IVA (10 %, IVA_INMUEBLES_2025.obraNueva) + AJD
   * (Madrid 0,75 %), no ITP (6 %): en 200.000 € el botón escribe 13.295 cuando, aun a los tipos de
   * hoy, fueron 22.795 — 9.500 € de menos en el valor de adquisición, que inflan la ganancia y el
   * IRPF en 2.185,00 € (CONTROL). La pantalla no lo dice ni pregunta nada que permita saberlo: el
   * rótulo del campo promete «ITP o IVA». Afirma lo correcto —que el formulario del vendedor
   * nombre el caso de la obra nueva, sea preguntándolo o avisando de que el botón no lo cubre—.
   *
   * ✅ REPARADO 25/09/2026: el formulario PREGUNTA cómo se pagó aquella compra (select
   * #regimen-compra-original) y, con «Obra nueva», el botón estima IVA + AJD con las mismas
   * constantes que la pestaña Comprador. Se mide la cifra y no solo el rótulo: 22.795 y el IRPF
   * y el neto del CONTROL (14.222,15 € · 275.277,85 €). En Canarias no hay IVA sino IGIC, que
   * la app no calcula: allí el botón no estima y lo dice.
   */
  test('HALLAZGO A1 — «Estimar por mí» no dice que supone ITP de segunda mano (la obra nueva pagó IVA + AJD)', async ({
    page,
  }) => {
    await montarObraNueva(page);
    await page.getByRole('button', { name: /Estimar por mí/ }).click();
    // 12.000 + 721,04 + 224,96 + 300 = 13.246 con la rebaja del nº 2.1 (ver el CONTROL de arriba)
    await esperarValorEnReact(page, campoGastosCompra(page), '13.246');
    await expect(formVendedor(page)).toContainText(/obra nueva/i, { timeout: 2000 });

    // Con la compra de obra nueva: IVA 10 % (20.000) + AJD Madrid 0,75 % (1.500) + notaría 721,04
    // + registro 224,96 + gestoría 300 = 22.746,00 → «22.746» (recalculado a mano el 12/10/2026
    // con la rebaja del 5 % del nº 2.1, hallazgos 2901 y 2902; sin ella, «22.795»).
    // Adquisición 222.746 · ganancia 289.500 − 222.746 = 66.754 → IRPF 1.140 + 9.240 + 16.754 ×
    // 23 % (3.853,42) = 14.233,42 · neto 300.000 − 1.500 − 9.000 − 14.233,42 = 275.266,58.
    await page.locator('#regimen-compra-original').selectOption('primera-mano');
    await page.getByRole('button', { name: /Estimar por mí/ }).click();
    await esperarValorEnReact(page, campoGastosCompra(page), '22.746');
    expect(await valorTarjeta(page, 'Valor de adquisición')).toBe('222.746,00 €');
    expect(await valorTarjeta(page, /^IRPF sobre ganancia/)).toBe('14.233,42 €');
    expect(await valorTarjeta(page, /^IMPORTE NETO VENDEDOR/)).toBe('275.266,58 €');

    // Canarias: la obra nueva pagó IGIC, que no se calcula → el botón no estima y lo dice.
    await page.locator('#ccaa-inmueble').selectOption('canarias');
    await expect(page.getByRole('button', { name: /Estimar por mí/ })).toBeDisabled();
    await expect(formVendedor(page)).toContainText(/IGIC/);
  });

  /**
   * HALLAZGO A2 [bajo] (Inspector 25/09/2026) — el botón estima con los tipos de HOY de la
   * comunidad, sea cual sea el año de aquella compra, y tampoco lo dice. Caso anclado en la propia
   * ficha: data/fiscal/inmuebles.ts documenta que Valencia cobraba el 10 % hasta el 01/06/2026.
   * Compra de 200.000 en 2025 → pagó 20.000 de ITP; el botón escribe 19.295 (ITP al 9 %), 2.000 €
   * de menos (IRPF inflado en 2.000 × el tipo marginal). Afirma lo correcto: que el formulario diga
   * que la estimación usa los tipos actuales (o pregunte el año).
   *
   * ✅ REPARADO 25/09/2026 con el aviso, no con una tabla histórica de tipos: junto al botón, y
   * enlazada a él con aria-describedby, una nota dice que estima con los tipos generales
   * vigentes HOY, sin reducidos, y que si aquella compra pagó otro se escriba el de la escritura.
   */
  test('HALLAZGO A2 — «Estimar por mí» no dice que usa los tipos de hoy', async ({ page }) => {
    await montarValencia(page);
    await page.getByRole('button', { name: /Estimar por mí/ }).click();
    // 18.000 + 721,04 + 224,96 + 300 = 19.246 con la rebaja del nº 2.1 (ver el CONTROL de arriba)
    await esperarValorEnReact(page, campoGastosCompra(page), '19.246');
    await expect(formVendedor(page)).toContainText(/\bhoy\b|actuales|vigentes?|año de (la|aquella) compra/i, {
      timeout: 2000,
    });
  });

  /**
   * HALLAZGO B [medio] (Inspector 25/09/2026) — la comisión lleva `max={10}` y el blur del
   * NumberInput reescribe «15» a «10» sin decirlo: con el foco dentro la app publica el neto del
   * 15 % (164.735,00 €, CONTROL) y al salir del campo el del 10 % (20.000 de comisión, IRPF
   * 5865,00, neto 172.635,00 €: 7.900 € más), con el «Típico: 3-5%» como único texto del campo.
   * La comisión es libre; una tarifa mínima sobre un inmueble barato la sube de 10.
   * Afirma lo correcto: o se calcula lo escrito, o el campo dice su tope.
   *
   * ✅ REPARADO 25/09/2026 (hallazgo 1796): el campo ya no lleva max, así que se calcula lo
   * escrito también al salir. Lo mismo en garaje y trastero; el testigo de familia lo mide en
   * las cuatro hermanas con vendedor.
   */
  test('HALLAZGO B — una comisión del 15 % no se reescribe a 10 en silencio al salir del campo', async ({
    page,
  }) => {
    await montarComision15(page);
    const campo = page.locator('input[aria-label="Comisión inmobiliaria (%)"]');
    await campo.blur();
    // Lo que el control ACEPTE (15 o 10) tiene que haber llegado a React antes de leer las tarjetas
    await esperarValorEnReact(page, campo, await campo.inputValue());
    const neto = await valorTarjeta(page, /^IMPORTE NETO VENDEDOR/);
    const textoDelCampo = await campo.evaluate((el) => (el as HTMLElement).parentElement?.innerText ?? '');
    const diceElTope = /10\s?%|máximo|tope/i.test(textoDelCampo);
    expect(neto === '164.735,00 €' || diceElTope).toBe(true);
    // Y la reparación elegida es la primera: lo escrito se queda y se calcula.
    await expect(campo).toHaveValue('15');
    expect(neto).toBe('164.735,00 €');
  });

  /**
   * HALLAZGO R1 [medio] (Inspector 25/09/2026) — la exención por reinversión DESAPARECE cuando la
   * hipoteca pendiente iguala o supera el valor de transmisión. Art. 41.1 RIRPF: importe total
   * obtenido = valor de transmisión − principal pendiente = 192.500 − 192.500 = 0; art. 41.4: la
   * exención solo es proporcional «en el caso de que el importe de la reinversión fuera inferior al
   * total obtenido», y 250.000 no lo es → exención total. El motor (`importeTotalObtenido > 0` en
   * data/fiscal/ganancia-inmueble.ts) la descarta: IRPF 20.155,00 € (1.140 + 9.240 + 42.500 × 23 %),
   * «Tributación en base del ahorro», sin nombrar la reinversión. Con 1 € MENOS de hipoteca, EXENTO.
   *
   * ✅ REPARADO 25/09/2026 en el motor (data/fiscal/ganancia-inmueble.ts): con el importe total
   * obtenido a 0 cualquier reinversión lo cubre y la proporción es 1. Texto del art. 41.1 y 41.4
   * del RD 439/2007 leído en el BOE consolidado (BOE-A-2007-6820) el 25/09/2026. El neto es el
   * precio menos la comisión y la plusvalía: 200.000 − 6.000 − 1.500 = 192.500,00 €. Y con una
   * hipoteca MAYOR que el valor de transmisión, igual.
   */
  test('HALLAZGO R1 — con la hipoteca igual al valor de transmisión, reinvertir sigue eximiendo', async ({
    page,
  }) => {
    await montarReinversion(page, '250000');
    await sembrar25(page, 'Hipoteca pendiente de la vivienda que vendes', '192500');
    expect(await valorTarjeta(page, /^IRPF sobre ganancia/)).toBe('EXENTO');
    expect(await descripcionTarjeta(page, /^IRPF sobre ganancia/)).toContain('art. 41.1 RIRPF');
    expect(await valorTarjeta(page, /^IMPORTE NETO VENDEDOR/)).toBe('192.500,00 €');
    await sembrar25(page, 'Hipoteca pendiente de la vivienda que vendes', '250000');
    expect(await valorTarjeta(page, /^IRPF sobre ganancia/)).toBe('EXENTO');
    expect(await valorTarjeta(page, /^IMPORTE NETO VENDEDOR/)).toBe('192.500,00 €');
  });

  /**
   * HALLAZGO R2 [medio] (Inspector 25/09/2026) — invariante de la familia: con la hipoteca ILEGIBLE
   * («2.000.50») y reinversión parcial, la app dice «no se puede saber» y nombra el campo DOS
   * veces («no se han podido leer el principal pendiente de la hipoteca y el principal pendiente
   * de la hipoteca … (… lo bajaría; … lo subiría)»). La dirección es segura: más principal
   * pendiente → menos importe obtenido → más proporción exenta (art. 41.1 y 41.4 RIRPF), así que el
   * neto real es MAYOR (con 2.000,50 legible, 183.391,88 € frente a 183.285,91 €, CONTROL). El
   * sondeo «grande» (principal = precio de venta) cae en el agujero de R1 y sale al revés.
   *
   * ✅ REPARADO 25/09/2026: con R1 reparado en el motor, el sondeo grande sale en el mismo
   * sentido que el pequeño y el veredicto es «mayor», seguro. Además la app nombra una sola vez
   * un campo que el veredicto ponga en las dos listas (`sinRepetir`), por si otro importe no
   * monótono lo hiciera.
   */
  test('HALLAZGO R2 — una hipoteca ilegible dice hacia dónde queda el neto, y la nombra una vez', async ({
    page,
  }) => {
    await montarReinversion(page, '100000');
    await sembrar25(page, 'Hipoteca pendiente de la vivienda que vendes', '2.000.50');
    const neto = await descripcionTarjeta(page, /^IMPORTE NETO VENDEDOR/);
    expect(neto).not.toContain('el principal pendiente de la hipoteca y el principal pendiente de la hipoteca');
    expect(neto).toContain('el neto real es MAYOR que este');
  });

  /**
   * HALLAZGO P0 [bajo] (Inspector 25/09/2026) — patrón 5 de la familia con el precio de compra: un
   * «0» escrito y a la vista (o un negativo, que el blur reescribe a 0) no «falta», y la app dice
   * «Falta el precio de compra original» y «Rellena el precio de compra original» (CASO 60).
   *
   * ✅ REPARADO 25/09/2026: dice que tiene que ser mayor que 0 y pide corregirlo.
   */
  test('HALLAZGO P0 — un precio de compra 0 no «falta»: está escrito y no vale', async ({ page }) => {
    await vendedor25(page, '200000', [
      ['Precio de compra original', '0'],
      ['Años de propiedad', '10'],
      ['Valor catastral del suelo', '50000'],
    ]);
    expect(await descripcionTarjeta(page, /^IRPF sobre ganancia/)).not.toContain('Falta el precio de compra original');
    expect(await descripcionTarjeta(page, /^IMPORTE NETO VENDEDOR/)).not.toContain('Rellena el precio de compra original');
    expect(await descripcionTarjeta(page, /^IRPF sobre ganancia/)).toContain(
      'El precio de compra original tiene que ser mayor que 0',
    );
    expect(await descripcionTarjeta(page, 'Plusvalía municipal')).toContain(
      'El precio de compra original tiene que ser mayor que 0',
    );
    expect(await descripcionTarjeta(page, /^IMPORTE NETO VENDEDOR/)).toContain(
      'Corrige el precio de compra original (tiene que ser mayor que 0) para obtenerlo.',
    );
  });

  /**
   * HALLAZGO % [bajo] (Inspector 25/09/2026) — desde el 25/09/2026 el % va separado de la cifra con
   * espacio duro (CLAUDE.md global §2). La página lo pega en decenas de sitios: títulos «ITP
   * (6,00%)», «AJD (0,75%)», «IVA (10,00%)», «Comisión inmobiliaria (3%)», «6,65% sobre el
   * precio», el recuadro de la comunidad, los avisos de reducidos, la ayuda «Típico: 3-5%», las
   * derivaciones y todo el bloque educativo; y el JSON-LD («IVA al 10%», «del 19% al 30%», «≥33%»).
   *
   * ✅ REPARADO 25/09/2026: el % va tras un espacio DURO en la página, el JSON-LD y los textos
   * que llegan de data/ (se separan al pintarlos, con `separarPorcentajes`). El caso original,
   * más los estados que el original no abría: vendedor, obra nueva, garaje y un perfil con
   * reducidos. Y ningún % tras un espacio NORMAL, que deja saltar el signo solo de línea.
   */
  test('HALLAZGO % — ningún porcentaje visible ni del JSON-LD va pegado a la cifra', async ({ page }) => {
    await abrir25(page);
    await sembrar25(page, 'Precio de la vivienda', '200000');
    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
    const visible = await page.locator('body').innerText();
    const schemas = (await page.locator('script[type="application/ld+json"]').allTextContents()).join(' ');
    const pegados = `${visible} ${schemas}`.match(/\S{0,12}\d%/g) ?? [];
    expect(pegados).toEqual([]);
    const conEspacioNormal = `${visible} ${schemas}`.match(/\S{0,12}\d %/g) ?? [];
    expect(conEspacioNormal).toEqual([]);

    // Los estados que el caso original no abría
    const recorrer = async (): Promise<string[]> => {
      const texto = await page.locator('body').innerText();
      return texto.match(/\S{0,12}\d ?%/g) ?? [];
    };
    await page.getByRole('button', { name: /Primera mano/ }).click();
    expect(await recorrer()).toEqual([]);
    await page.getByRole('button', { name: /Segunda mano/ }).click();
    await page.locator('#ccaa-inmueble').selectOption('valencia');
    await page.locator('#perfil-comprador').selectOption('familia-numerosa');
    expect(await recorrer()).toEqual([]);
    await page.getByRole('button', { name: /Garaje/ }).click();
    expect(await recorrer()).toEqual([]);
    await page.getByRole('button', { name: 'Vendedor' }).click();
    expect(await recorrer()).toEqual([]);
  });

  /**
   * HALLAZGO C [bajo] (Inspector 25/09/2026, accesibilidad) — el módulo redeclara `--primary:
   * #2E86AB` en `.container` y no en su variante oscura, y lo usa como color de TEXTO pequeño:
   * «Estimar por mí» (13,6 px, 600) da 3,93:1 sobre #FAFAFA; la pestaña activa, blanco sobre
   * #2E86AB (16 px, 600), 4,11:1; y en oscuro el tipo de inmueble activo (14,4 px, 600) 3,13:1.
   * WCAG 1.4.3 pide 4,5:1. Medido en el navegador, no por regex.
   *
   * ✅ REPARADO 25/09/2026: el módulo ya no redeclara --primary/--secondary; el texto de marca
   * usa --primary-texto y los fondos con texto blanco --primary-boton (app/globals.css).
   */
  test('HALLAZGO C — el texto de marca de los controles llega a 4,5:1 en los dos temas', async ({ page }) => {
    await abrir25(page);
    await page.getByRole('button', { name: 'Vendedor' }).click();
    await esperarHidratacion(page, ['input[aria-label="Precio de compra original"]']);
    // Con precio de compra, para medir «Estimar por mí» HABILITADO (deshabilitado está exento)
    await sembrar25(page, 'Precio de compra original', '150000');
    // Sin transiciones: al cambiar de tema, getComputedStyle devolvería el color a medio camino
    await page.addStyleTag({ content: '*, *::before, *::after { transition: none !important; }' });
    const medir = (tema: string) =>
      page.evaluate((t) => {
        document.documentElement.setAttribute('data-theme', t);
        const rgb = (s: string) => (s.match(/[\d.]+/g) ?? []).map(Number);
        const lum = ([r, g, b]: number[]) => {
          const f = (v: number) => {
            const c = v / 255;
            return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
          };
          return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
        };
        const fondo = (el: Element) => {
          const capas: number[][] = [];
          for (let n: Element | null = el; n; n = n.parentElement) {
            const c = rgb(getComputedStyle(n).backgroundColor);
            const a = c.length > 3 ? c[3] : 1;
            if (c.length >= 3 && a > 0) {
              capas.push([c[0], c[1], c[2], a]);
              if (a >= 1) break;
            }
          }
          let res = [255, 255, 255];
          for (const c of capas.reverse()) res = res.map((v, i) => v * (1 - c[3]) + c[i] * c[3]);
          return res;
        };
        const ratio = (el: Element | undefined) => {
          if (!el) return 0;
          const a = lum(rgb(getComputedStyle(el).color));
          const b = lum(fondo(el));
          return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
        };
        const botones = Array.from(document.querySelectorAll('button'));
        return {
          estimar: ratio(botones.find((b) => b.textContent?.includes('Estimar por mí'))),
          pestana: ratio(botones.find((b) => b.getAttribute('aria-pressed') === 'true' && b.textContent?.includes('Vendedor'))),
          tipo: ratio(botones.find((b) => b.getAttribute('aria-pressed') === 'true' && b.textContent?.includes('Vivienda (piso'))),
        };
      }, tema);
    const claro = await medir('light');
    const oscuro = await medir('dark');
    for (const [nombre, valor] of Object.entries({ ...claro, tipoOscuro: oscuro.tipo })) {
      expect(valor, `${nombre}: ${valor.toFixed(2)}:1`).toBeGreaterThanOrEqual(4.5);
    }
  });

  /**
   * HALLAZGO ANA [bajo] (Inspector 25/09/2026, contenido) — el ejemplo del bloque educativo afirma
   * «su ganancia patrimonial es de 62.500 €» y dos frases después que Ana «además paga la plusvalía
   * municipal …, que también minora el valor de transmisión»: la ganancia es 62.500 − plusvalía, y
   * con esos datos la propia calculadora rotula 62.500 «Ganancia patrimonial (máximo)» (patrón 2 de
   * la familia, 24/09/2026). Con un suelo de 60.000 € (CASO 47) la ganancia es 59.650 €.
   *
   * ✅ REPARADO 25/09/2026: el ejemplo trae el suelo de 60.000 € y sus cifras salen del mismo
   * cálculo que la pestaña Vendedor (CASO 47): comisión 7500, plusvalía 2850, ganancia 59.650 €
   * e IRPF 12.599,50 €.
   */
  test('HALLAZGO ANA — el ejemplo no publica como ganancia la cifra antes de restar la plusvalía que cita', async ({
    page,
  }) => {
    await abrir25(page);
    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
    const ana = await page.locator('p', { hasText: 'Ana vende su piso' }).first().innerText();
    const contradice =
      /ganancia patrimonial es de 62\.500/.test(ana) && /también minora el valor de transmisión/.test(ana);
    expect(contradice).toBe(false);
    expect(ana).toContain('ganancia patrimonial es de 59.650 €');
    expect(ana).toContain('2850 €');
    expect(ana).toMatch(/12\.599,50\s€/);
  });
});

// ════════════════════════════════════════════════════════════════════════════════════════
// Inspector 26/09/2026 — re-inspección de la REFERENCIA de la familia de compraventa
// ════════════════════════════════════════════════════════════════════════════════════════
/**
 * Re-inspección tras las reparaciones del 25/09 (hallazgos 1794-1802) y los cambios de datos del
 * 24/09 (ITP/AJD de Valencia y País Vasco en data/itp-ccaa.ts; coeficientes del IIVTNU y su
 * prorrateo en data/fiscal/inmuebles.ts) y del 25/09 (el % con espacio duro). Las nueve
 * reparaciones las vigila la sección del 25/09, que sigue en verde; aquí van tres casos propios,
 * un control de contraste de lo que añadió la reparación de 1794/1795 y los hallazgos NUEVOS,
 * todos en lo que SOLO tiene esta app de la familia (reinversión, hipoteca pendiente, «Estimar
 * por mí» con régimen, exención de mayores de 65 y los sellos de la mitad del vendedor): el punto
 * ciego del testigo tests/familias/compraventa.spec.ts.
 *
 * Fuentes: data/itp-ccaa.ts (ITP_CCAA y aranceles de los RD 1426/1989 y 1427/1989),
 * data/fiscal/inmuebles.ts (TIPOS_ITP_CCAA_2025, IVA_INMUEBLES_2025, TRAMOS_GANANCIAS_
 * PATRIMONIALES_2025, COEFICIENTES_IIVTNU_2025 y coeficienteIIVTNU, PLUSVALIA_MUNICIPAL_META) y
 * data/fiscal/ganancia-inmueble.ts (art. 35 LIRPF y art. 41 RIRPF). Normas leídas en sesión en el
 * BOE (API de legislación consolidada): LIRPF art. 33.4.b (BOE-A-2006-20764, bloque a33), RIRPF
 * art. 41 bis.1 (BOE-A-2007-6820, bloque a41bis) y Código Civil art. 1455 (BOE-A-1889-4763,
 * bloque art1455).
 */
test.describe('Inspector 26/09/2026 — la referencia de la familia: reinversión, exenciones y sellos', () => {
  /** Escribe como el usuario, comprueba que el ESTADO de React lo recogió y sale del campo. */
  async function sembrar26(page: Page, etiqueta: string, valor: string): Promise<void> {
    const campo = page.locator(`input[aria-label="${etiqueta}"]`);
    await campo.fill(valor);
    await esperarValorEnReact(page, campo, valor);
    await campo.blur();
  }

  async function abrir26(page: Page, ccaa?: string): Promise<void> {
    await page.goto(RUTA);
    await esperarHidratacion(page, ['input[aria-label="Precio de la vivienda"]']);
    if (ccaa) await page.locator('#ccaa-inmueble').selectOption(ccaa);
  }

  async function aVendedor26(page: Page): Promise<void> {
    await page.getByRole('button', { name: 'Vendedor' }).click();
    await esperarHidratacion(page, ['input[aria-label="Precio de compra original"]']);
  }

  const formVendedor = (page: Page) => page.locator('div[class*="formVendedor"]');
  const campoGastosCompra = (page: Page) =>
    page.locator('input[aria-label="Impuestos y gastos que pagaste al comprar"]');
  /** «2026-09-24» → «24/09/2026», como pinta la fecha DataReference. */
  const fechaES = (iso: string) => iso.split('-').reverse().join('/');
  /** El rótulo entero de una tarjeta, para ver su «(máximo)» o su «(PARCIAL)». */
  const titulo26 = (page: Page, titulo: RegExp) => page.locator('h3', { hasText: titulo }).first().innerText();

  /**
   * Vendedor del CASO 61 hasta la hipoteca: Andalucía · venta 250.000 · compra 150.000 de OBRA
   * NUEVA estimada con el botón (17.978 con la rebaja del nº 2.1; 18.024 sin ella) · 12 años ·
   * suelo 50.000 · total 125.000 · 3 % · vivienda habitual · reinvierte `reinvierte` · hipoteca
   * pendiente 40.000.
   */
  async function montarVendedor61(page: Page, reinvierte: string): Promise<void> {
    await abrir26(page, 'andalucia');
    await sembrar26(page, 'Precio de la vivienda', '250000');
    await aVendedor26(page);
    await sembrar26(page, 'Precio de compra original', '150000');
    await page.locator('#regimen-compra-original').selectOption('primera-mano');
    await page.getByRole('button', { name: /Estimar por mí/ }).click();
    await esperarValorEnReact(page, campoGastosCompra(page), '17.978');
    await sembrar26(page, 'Años de propiedad', '12');
    await sembrar26(page, 'Valor catastral del suelo', '50000');
    await sembrar26(page, 'Valor catastral total (suelo + construcción)', '125000');
    await page.getByRole('checkbox', { name: /Voy a reinvertir/ }).check();
    await esperarHidratacion(page, ['input[aria-label="Hipoteca pendiente de la vivienda que vendes"]']);
    await sembrar26(page, 'Hipoteca pendiente de la vivienda que vendes', '40000');
    await sembrar26(page, 'Importe que reinviertes en la nueva vivienda', reinvierte);
  }

  /** Montaje del art. 41 bis: Madrid · venta 300.000 · compra 200.000 · `anios` · suelo 60.000 · 3 %. */
  async function montar41bis(page: Page, anios: string): Promise<void> {
    await abrir26(page);
    await sembrar26(page, 'Precio de la vivienda', '300000');
    await aVendedor26(page);
    await sembrar26(page, 'Precio de compra original', '200000');
    await sembrar26(page, 'Años de propiedad', anios);
    await sembrar26(page, 'Valor catastral del suelo', '60000');
  }

  /**
   * CASO 61 (normal) — Andalucía, las dos pestañas de la misma operación, y en el vendedor los
   * tres campos que solo tiene esta app de la familia: «Estimar por mí» con la compra de OBRA
   * NUEVA (reparación de 1794, fuera de Madrid), la reinversión PARCIAL y la hipoteca pendiente.
   *
   * Comprador — vivienda de segunda mano de 250.000 €, perfil General:
   *   ITP 7 % (TIPOS_ITP_CCAA_2025 'Andalucía')                       = 17.500,00 € «ITP (7,00 %)»
   * Notaría y registro recalculados a mano el 12/10/2026 con la rebaja del 5 % del nº 2.1
   * (hallazgos 2901 y 2902); entre paréntesis, la cifra de antes:
   *   Notaría  = arancel 90,151816 + 24.040,49 × 0,45 % + 30.050,60 × 0,15 % + 90.151,82 × 0,10 %
   *              + 99.746,97 × 0,05 % = 383,435226 × 0,95 × 1,21 = 440,758792 → × 1,75 = 771,33 €
   *              (× 1,5 = 661,14 € · × 2 = 881,52 €) (811,92, entre 695,93 y 927,91)
   *   Registro = (24,040484 + 42,0708575 + 37,56325 + 67,613865 + 99.746,97 × 0,03 % (29,924091))
   *              × 0,95 + 6,010121 + 3,005061 = 200,167102 × 1,21           =   242,20 € (254,37)
   *   Gestoría (GESTORIA_TIPICA)                                           =   300,00 €
   *   Total 18.813,53 € → 7,5254 % → «7,53 %» · COSTE TOTAL 268.813,53 € (18.866,29 · 268.866,29)
   *   «Municipios despoblados» (3,5 %, sin tope de valor) se ENSEÑA, no se cobra (elegirTipoITP).
   *
   * Vendedor — compra 150.000 · 12 años · suelo 50.000 · total 125.000 · 3 % · habitual ·
   * reinvierte 150.000 · hipoteca pendiente 40.000:
   *   «Estimar por mí» de segunda mano: ITP 7 % 10.500 + notaría(150.000) 670,49 + registro
   *     207,59 + gestoría 300 = 11.678,08 → «11.678» («11.724»)
   *   «Estimar por mí» de obra nueva: IVA 10 % (IVA_INMUEBLES_2025.obraNueva) 15.000 + AJD 1,2 %
   *     (ITP_CCAA.andalucia.ajd) 1.800 + 670,49 + 207,59 + 300 = 17.978,08 → «17.978» («18.024»)
   *     (notaría 150.000: 333,308711 × 0,95 × 1,21 × 1,75 = 670,492 · registro: (171,098684 × 0,95
   *     + 9,015182) × 1,21 = 207,586)
   *   Plusvalía: objetivo 50.000 × 0,09 (12 años) × 25 % = 1125,00; real 100.000 × 50.000/125.000
   *     × 25 % = 10.000 → «Método objetivo (más favorable)»
   *   Transmisión 250.000 − 7.500 − 1.125 = 241.375 · Adquisición 150.000 + 17.978 = 167.978
   *   Ganancia 73.397 · importe obtenido 241.375 − 40.000 = 201.375 (art. 41.1 RIRPF)
   *   Exento 150.000 / 201.375 = 74,4879 % → «74,5 %» (art. 41.4 RIRPF)
   *   Base 73.397 × 51.375 / 201.375 = 18.725,12 · IRPF 6.000 × 19 % + 12.725,12 × 21 %
   *     = 1.140 + 2.672,28 = 3812,28 € (3809,81)
   *   Total 1.125 + 7.500 + 3.812,28 = 12.437,28 · Neto 250.000 − 12.437,28 = 237.562,72 € (237.565,19)
   */
  test('CASO 61 (normal) — Andalucía: las dos pestañas, «Estimar por mí» de obra nueva y reinversión parcial con hipoteca', async ({
    page,
  }) => {
    test.setTimeout(60_000);
    expect(ITP_CCAA['andalucia'].tipoGeneral).toBe(7);
    expect(ITP_CCAA['andalucia'].ajd).toBe(1.2);
    expect(IVA_INMUEBLES_2025.obraNueva).toBe(10);
    expect(COEFICIENTES_IIVTNU_2025.find((c) => c.anios === 12)?.coeficiente).toBe(0.09);
    expect(PLUSVALIA_MUNICIPAL_META.tipoOrientativo).toBe(25);

    // Comprador
    await abrir26(page, 'andalucia');
    await sembrar26(page, 'Precio de la vivienda', '250000');
    expect(await valorTarjeta(page, /ITP \(7,00\s?%\)/)).toBe('17.500,00 €');
    expect(await valorTarjeta(page, /^Gastos de notaría/)).toBe('771,33 €');
    expect(await descripcionTarjeta(page, /^Gastos de notaría/)).toContain('entre 661,14 € y 881,52 €');
    expect(await valorTarjeta(page, /^Registro de la Propiedad/)).toBe('242,20 €');
    expect(await valorTarjeta(page, 'Gastos de gestoría')).toBe('300,00 €');
    expect(await valorTarjeta(page, /^Total gastos adicionales/)).toBe('18.813,53 €');
    expect(await descripcionTarjeta(page, /^Total gastos adicionales/)).toMatch(/^7,53\s?% sobre el precio$/);
    expect(await valorTarjeta(page, /^COSTE TOTAL/)).toBe('268.813,53 €');
    await expect(page.locator('div[class*="avisoReducidos"]').first()).toContainText('Municipios despoblados');

    // Vendedor: el botón, primero de segunda mano y luego de obra nueva
    await aVendedor26(page);
    await sembrar26(page, 'Precio de compra original', '150000');
    await page.getByRole('button', { name: /Estimar por mí/ }).click();
    await esperarValorEnReact(page, campoGastosCompra(page), '11.678');
    await page.locator('#regimen-compra-original').selectOption('primera-mano');
    await page.getByRole('button', { name: /Estimar por mí/ }).click();
    await esperarValorEnReact(page, campoGastosCompra(page), '17.978');

    await sembrar26(page, 'Años de propiedad', '12');
    await sembrar26(page, 'Valor catastral del suelo', '50000');
    await sembrar26(page, 'Valor catastral total (suelo + construcción)', '125000');
    await page.getByRole('checkbox', { name: /Voy a reinvertir/ }).check();
    await esperarHidratacion(page, ['input[aria-label="Hipoteca pendiente de la vivienda que vendes"]']);
    await sembrar26(page, 'Hipoteca pendiente de la vivienda que vendes', '40000');
    await sembrar26(page, 'Importe que reinviertes en la nueva vivienda', '150000');

    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('1125,00 €');
    expect(await descripcionTarjeta(page, 'Plusvalía municipal')).toBe('Método objetivo (más favorable)');
    expect(await valorTarjeta(page, 'Valor de adquisición')).toBe('167.978,00 €');
    expect(await valorTarjeta(page, 'Valor de transmisión')).toBe('241.375,00 €');
    expect(await valorTarjeta(page, /^Ganancia patrimonial/)).toBe('73.397,00 €');
    expect(await descripcionTarjeta(page, /^Ganancia patrimonial/)).toBe('Tributa 18.725,12 € tras aplicar la exención');
    expect(await valorTarjeta(page, /^IRPF sobre ganancia/)).toBe('3812,28 €');
    expect(await descripcionTarjeta(page, /^IRPF sobre ganancia/)).toBe(
      'Reinversión parcial: exento el 74,5 % de la ganancia (art. 41 RIRPF). Calculado como si esta venta fuera tu única renta del ahorro del año: si tienes intereses, dividendos u otras ganancias, escríbelos arriba, porque la cuota puede ser mayor.',
    );
    expect(await valorTarjeta(page, /Comisión inmobiliaria \(3\s?%\)/)).toBe('7500,00 €');
    expect(await valorTarjeta(page, /^Total gastos vendedor/)).toBe('12.437,28 €');
    expect(await valorTarjeta(page, /^IMPORTE NETO VENDEDOR/)).toBe('237.562,72 €');
    expect(await descripcionTarjeta(page, /^IMPORTE NETO VENDEDOR/)).toBe('Lo que realmente recibes');
  });

  /**
   * CASO 61 bis (invariante de la familia, en un campo EXCLUSIVO) — la misma operación con el
   * importe que se reinvierte ILEGIBLE («150.000.00»). Sin él no hay exención y el motor cobra la
   * cuota entera. Recalculado a mano el 12/10/2026 con la adquisición del CASO 61 con la rebaja
   * del nº 2.1 (167.978; antes 168.024): base 73.397 → IRPF 1.140 + 44.000 × 21 % + 23.397 × 23 %
   * = 1.140 + 9.240 + 5.381,31 = 15.761,31 € · neto 250.000 − 1.125 − 7.500 − 15.761,31 =
   * 225.613,69 € (PARCIAL). Antes: 15.750,73 € y 225.624,27 €.
   * Cualquier importe reinvertido > 0 exime algo, así que la dirección es SEGURA: la cuota real es
   * menor y el neto real MAYOR. La app lo dice, y cita el art. 38 LIRPF.
   */
  test('CASO 61 bis (invariante) — con la reinversión ilegible, la cuota real es menor y el neto MAYOR, y lo dice', async ({
    page,
  }) => {
    test.setTimeout(60_000);
    await montarVendedor61(page, '150.000.00');
    expect(await valorTarjeta(page, /^IRPF sobre ganancia/)).toBe('15.761,31 €');
    const irpf = await descripcionTarjeta(page, /^IRPF sobre ganancia/);
    expect(irpf).toContain('El importe que reinviertes no se ha podido leer, así que la cuota real es menor');
    expect(irpf).toContain('art. 38 LIRPF');
    expect(await page.locator('h3', { hasText: /^IMPORTE NETO VENDEDOR/ }).first().innerText()).toBe(
      'IMPORTE NETO VENDEDOR (PARCIAL)',
    );
    expect(await valorTarjeta(page, /^IMPORTE NETO VENDEDOR/)).toBe('225.613,69 €');
    expect(await descripcionTarjeta(page, /^IMPORTE NETO VENDEDOR/)).toContain('el neto real es MAYOR que este');
    // Y con el importe legible vuelve a la cifra del CASO 61
    await sembrar26(page, 'Importe que reinviertes en la nueva vivienda', '150000');
    expect(await valorTarjeta(page, /^IMPORTE NETO VENDEDOR/)).toBe('237.562,72 €');
  });

  /**
   * CASO 62 (límite) — tres cantos que nada pisaba:
   *  (a) La frontera de 200.000 € de la base del ahorro (23 % → 27 %, TRAMOS_GANANCIAS_
   *      PATRIMONIALES_2025). Madrid · venta 500.000 · compra 280.000 · 10 años · suelo 40.000 · 3 %.
   *      Plusvalía 40.000 × 0,12 × 25 % = 1200,00 · comisión 15.000 · transmisión 483.800.
   *      Gastos de aquella compra 3.800 → adquisición 283.800 → ganancia 200.000 →
   *      IRPF 1.140 + 9.240 + 150.000 × 23 % = 44.880,00 · neto 500.000 − 1.200 − 15.000 − 44.880
   *      = 438.920,00. Con 3.799 → ganancia 200.001 → IRPF 44.880,27 (el euro al 27 %) ·
   *      neto 438.919,73.
   *  (b) Reventa antes del año con 0 meses completos: coeficienteIIVTNU(0, 0) prorratea 0,15 × 0/12
   *      = 0 (art. 107.4 TRLRHL, «meses completos») → plusvalía 0,00 €.
   *  (c) Valencia a 1.000.000,01 €: el umbral (ITP_CCAA.valencia.umbralTipoUnico, 11 % sobre TODO el
   *      valor por encima del millón) → 1.000.000,01 × 11 % = 110.000,0011 → 110.000,00 €.
   */
  test('CASO 62 (límite) — la frontera de 200.000 € del ahorro, 0 meses de tenencia y el umbral valenciano', async ({
    page,
  }) => {
    test.setTimeout(60_000);
    expect(TRAMOS_GANANCIAS_PATRIMONIALES_2025[2]).toEqual({ hasta: 200000, tipo: 23 });
    expect(TRAMOS_GANANCIAS_PATRIMONIALES_2025[3]).toEqual({ hasta: 300000, tipo: 27 });
    expect(COEFICIENTES_IIVTNU_2025.find((c) => c.anios === 10)?.coeficiente).toBe(0.12);
    expect(COEFICIENTES_IIVTNU_2025.find((c) => c.anios === 0)?.coeficiente).toBe(0.15);
    expect(ITP_CCAA['valencia'].umbralTipoUnico).toEqual({ superiorA: 1000000, tipo: 11 });

    // (a)
    await abrir26(page);
    await sembrar26(page, 'Precio de la vivienda', '500000');
    await aVendedor26(page);
    await sembrar26(page, 'Precio de compra original', '280000');
    await sembrar26(page, 'Años de propiedad', '10');
    await sembrar26(page, 'Valor catastral del suelo', '40000');
    await sembrar26(page, 'Impuestos y gastos que pagaste al comprar', '3800');
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('1200,00 €');
    expect(await valorTarjeta(page, 'Valor de transmisión')).toBe('483.800,00 €');
    expect(await valorTarjeta(page, /^Ganancia patrimonial/)).toBe('200.000,00 €');
    expect(await valorTarjeta(page, /^IRPF sobre ganancia/)).toBe('44.880,00 €');
    expect(await valorTarjeta(page, /^IMPORTE NETO VENDEDOR/)).toBe('438.920,00 €');
    await sembrar26(page, 'Impuestos y gastos que pagaste al comprar', '3799');
    expect(await valorTarjeta(page, /^Ganancia patrimonial/)).toBe('200.001,00 €');
    expect(await valorTarjeta(page, /^IRPF sobre ganancia/)).toBe('44.880,27 €');
    expect(await valorTarjeta(page, /^IMPORTE NETO VENDEDOR/)).toBe('438.919,73 €');

    // (b)
    await sembrar26(page, 'Años de propiedad', '0');
    await page.locator('#meses-completos').selectOption('0');
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('0,00 €');

    // (c)
    await abrir26(page, 'valencia');
    await sembrar26(page, 'Precio de la vivienda', '1000000,01');
    expect(await valorTarjeta(page, /ITP \(11,00\s?%\)/)).toBe('110.000,00 €');
  });

  /**
   * CASO 63 (debe rechazarse) · HALLAZGO [bajo, cálculo] — una comisión del 150 %.
   *
   * Desde el 25/09 (hallazgo 1796) el campo no lleva max y avisa por encima del 100 %: «La
   * comisión no puede superar el 100 % del precio de venta: revisa el porcentaje». Pero el
   * cálculo sigue con lo escrito y publica como DEFINITIVAS cifras que salen de un dato que la
   * propia app declara imposible. Madrid · venta 200.000 · compra 150.000 · 10 años · suelo
   * 50.000 · comisión «150»: comisión 300.000,00 € · transmisión max(0, 200.000 − 300.000 − 1.500)
   * = 0 · «Pérdida patrimonial 150.000,00 €» con «la pérdida se puede compensar en la
   * declaración» · total 301.500,00 € · «IMPORTE NETO VENDEDOR −101.500,00 €» rotulado «Lo que
   * realmente recibes». Es el patrón 5 de la familia (escrito, legible e imposible): los años
   * negativos y el precio de compra 0 no liquidan y lo dicen; esta comisión sí liquida.
   *
   * Afirma lo correcto: con el aviso del campo en pantalla (que sí está), el neto no se rotula
   * «Lo que realmente recibes» ni se ofrece compensar una pérdida fabricada por ese dato.
   */
  /*
   * REPARADO el 26/09/2026 (hallazgo 2186, receta 5 de la familia). La comisión imposible queda
   * FUERA del cálculo, como los años negativos: su tarjeta dice «No válida», el neto se rotula
   * «(PARCIAL)» y pide corregirla. Cifras a mano sin la comisión (BASE B del CONTROL de abajo):
   *   plusvalía 50.000 × 0,12 × 25 % = 1.500 · transmisión 200.000 − 1.500 = 198.500 ·
   *   ganancia 198.500 − 150.000 = 48.500 → IRPF 6.000 × 19 % + 42.500 × 21 % = 1.140 + 8.925
   *   = 10.065,00 · total 1.500 + 10.065 = 11.565,00 · neto 200.000 − 11.565 = 188.435,00 (PARCIAL:
   *   con una comisión válida, que es ≥ 0, el neto real solo puede ser igual o menor).
   */
  test('CASO 63 (debe rechazarse) — una comisión del 150 % no produce un neto «que realmente recibes»', async ({
    page,
  }) => {
    await abrir26(page);
    await sembrar26(page, 'Precio de la vivienda', '200000');
    await aVendedor26(page);
    await sembrar26(page, 'Precio de compra original', '150000');
    await sembrar26(page, 'Años de propiedad', '10');
    await sembrar26(page, 'Valor catastral del suelo', '50000');
    await sembrar26(page, 'Comisión inmobiliaria (%)', '150');
    // El campo lo rechaza por escrito (esto ya pasa)
    await expect(formVendedor(page)).toContainText(/La comisión no puede superar el 100\s%/);
    // Y las cifras de abajo ya no lo dan por bueno
    expect(await descripcionTarjeta(page, /^IMPORTE NETO VENDEDOR/)).not.toBe('Lo que realmente recibes');
    await expect(page.locator('h3', { hasText: /^Pérdida patrimonial/ })).toHaveCount(0);
    expect(await valorTarjeta(page, /^Comisión inmobiliaria/)).toBe('No válida');
    expect((await descripcionTarjeta(page, /^Comisión inmobiliaria/)).replace(ESPACIO_DURO, ' ')).toContain(
      'Corrige la comisión: no puede superar el 100 % del precio de venta',
    );
    expect(await valorTarjeta(page, /^Ganancia patrimonial/)).toBe('48.500,00 €');
    expect(await titulo26(page, /^Ganancia patrimonial/)).toBe('Ganancia patrimonial (máximo)');
    expect(await valorTarjeta(page, /^IRPF sobre ganancia/)).toBe('10.065,00 €');
    expect(await descripcionTarjeta(page, /^IRPF sobre ganancia/)).toContain(
      'No resta la comisión inmobiliaria, que no es válida, así que la cuota real puede ser menor',
    );
    expect(await titulo26(page, /^IMPORTE NETO VENDEDOR/)).toBe('IMPORTE NETO VENDEDOR (PARCIAL)');
    expect(await valorTarjeta(page, /^IMPORTE NETO VENDEDOR/)).toBe('188.435,00 €');
    const neto = (await descripcionTarjeta(page, /^IMPORTE NETO VENDEDOR/)).replace(ESPACIO_DURO, ' ');
    expect(neto).toContain('No descuenta la comisión inmobiliaria: el neto real puede ser menor que este');
    expect(neto).toContain('Corrige la comisión: no puede superar el 100 % del precio de venta para obtenerlo');
    // Con la comisión corregida vuelve la BASE B del CONTROL, definitiva
    await sembrar26(page, 'Comisión inmobiliaria (%)', '3');
    expect(await valorTarjeta(page, /^IMPORTE NETO VENDEDOR/)).toBe('183.695,00 €');
    expect(await descripcionTarjeta(page, /^IMPORTE NETO VENDEDOR/)).toBe('Lo que realmente recibes');
  });

  /**
   * CONTROL de montaje de los hallazgos de abajo — lo que la app publica hoy, calculado a mano. Si
   * esto se pone rojo, el que falla es el montaje, no el hallazgo.
   *  · 41 bis, 1 año, SIN exención: plusvalía 60.000 × 0,15 × 25 % = 2250,00 · comisión 9.000 ·
   *    transmisión 288.750 · ganancia 88.750 → IRPF 1.140 + 9.240 + 38.750 × 23 % = 19.292,50 ·
   *    neto 269.457,50. «Es mi vivienda habitual» viene MARCADA por defecto.
   *  · 41 bis, 3 años + mayor de 65 (legítimo: 3 años de propiedad caben en 3 de residencia):
   *    plusvalía 60.000 × 0,14 × 25 % = 2100,00 → neto 300.000 − 9.000 − 2.100 = 288.900,00, EXENTO.
   *  · 33.4.b, BASE B (200.000 · compra 150.000 · 10 años · suelo 50.000 · 3 %): plusvalía 1.500 ·
   *    transmisión 192.500 · ganancia 42.500 → IRPF 1.140 + 36.500 × 21 % = 8805,00 · neto
   *    183.695,00. Con la exención del art. 33.4.b sería 0 y 192.500,00.
   */
  test('CONTROL de montaje — las preparaciones de los hallazgos del 26/09 publican las cifras del motor', async ({
    page,
  }) => {
    test.setTimeout(90_000);
    expect(COEFICIENTES_IIVTNU_2025.find((c) => c.anios === 1)?.coeficiente).toBe(0.15);
    expect(COEFICIENTES_IIVTNU_2025.find((c) => c.anios === 3)?.coeficiente).toBe(0.14);

    await montar41bis(page, '1');
    await expect(page.getByRole('checkbox', { name: /Es mi vivienda habitual/ })).toBeChecked();
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('2250,00 €');
    expect(await valorTarjeta(page, /^IRPF sobre ganancia/)).toBe('19.292,50 €');
    expect(await valorTarjeta(page, /^IMPORTE NETO VENDEDOR/)).toBe('269.457,50 €');

    await montar41bis(page, '3');
    await page.getByRole('checkbox', { name: /Soy mayor de 65 años/ }).check();
    expect(await valorTarjeta(page, /^IRPF sobre ganancia/)).toBe('EXENTO');
    expect(await valorTarjeta(page, /^IMPORTE NETO VENDEDOR/)).toBe('288.900,00 €');

    await abrir26(page);
    await sembrar26(page, 'Precio de la vivienda', '200000');
    await aVendedor26(page);
    await sembrar26(page, 'Precio de compra original', '150000');
    await sembrar26(page, 'Años de propiedad', '10');
    await sembrar26(page, 'Valor catastral del suelo', '50000');
    expect(await valorTarjeta(page, /^IRPF sobre ganancia/)).toBe('8805,00 €');
    expect(await valorTarjeta(page, /^IMPORTE NETO VENDEDOR/)).toBe('183.695,00 €');
  });

  /**
   * HALLAZGO 41 bis [alto, cálculo] — las dos exenciones de la vivienda habitual se aplican con
   * 1 año de propiedad. Art. 41 bis.1 RIRPF (BOE-A-2007-6820, leído en sesión): «A los efectos
   * previstos en los artículos 7.t), 33.4.b), y 38 de la Ley del Impuesto se considera vivienda
   * habitual del contribuyente la edificación que constituya su residencia durante un plazo
   * continuado de, al menos, tres años», salvo fallecimiento, matrimonio, separación, traslado
   * laboral, primer empleo, cambio de empleo u otras análogas, que la app no pregunta. La app SÍ
   * sabe los años (el campo «Años de propiedad») y con «1» —menos de tres años de propiedad no
   * caben en tres de residencia— da EXENTO en cuanto se marca «Soy mayor de 65 años» (y «Es mi
   * vivienda habitual» viene marcada por defecto), o se reinvierte todo: IRPF 0 en vez de
   * 19.292,50 € y neto 288.750,00 € «Lo que realmente recibes» en vez de 269.457,50 € (CONTROL).
   * Es el error en la dirección que el propio motor llama irrecuperable (contrato de elegirTipoITP:
   * «quien presupuesta 0 y paga 12.000 tiene un problema»), y nada en la página nombra el plazo.
   *
   * Afirma lo correcto: con menos de 3 años, o no se exime, o la tarjeta del IRPF dice que la
   * exención exige 3 años de residencia (art. 41 bis RIRPF) salvo esas circunstancias.
   */
  /*
   * REPARADO el 26/09/2026. Con menos de 3 años de propiedad la exención no se aplica (IRPF y neto
   * del CONTROL) y la tarjeta del IRPF nombra el art. 41 bis.1; una casilla deja declarar la
   * excepción del reglamento (causa que obliga a cambiar de domicilio), y entonces sí se exime:
   *   · edad + excepción: transmisión 300.000 − 9.000 − 2.250 = 288.750 → IRPF 0 · neto 288.750,00;
   *   · reinversión de 300.000 ≥ importe obtenido 288.750 (sin hipoteca) → exención total, mismo neto.
   */
  test('HALLAZGO 41 bis — con 1 año de propiedad, la exención de vivienda habitual no se da por hecha', async ({
    page,
  }) => {
    test.setTimeout(60_000);
    const exigeElPlazo = (texto: string) => /tres años|3 años|41 bis/i.test(texto);

    // Mayor de 65 que vende su «vivienda habitual» de hace 1 año
    await montar41bis(page, '1');
    await page.getByRole('checkbox', { name: /Soy mayor de 65 años/ }).check();
    const irpfEdad = await valorTarjeta(page, /^IRPF sobre ganancia/);
    const descEdad = await descripcionTarjeta(page, /^IRPF sobre ganancia/);
    expect(irpfEdad === '19.292,50 €' || exigeElPlazo(descEdad), `${irpfEdad} · ${descEdad}`).toBe(true);

    // Y la reinversión total, que el art. 41 bis.1 somete al mismo requisito
    await page.getByRole('checkbox', { name: /Soy mayor de 65 años/ }).uncheck();
    await page.getByRole('checkbox', { name: /Voy a reinvertir/ }).check();
    await esperarHidratacion(page, ['input[aria-label="Importe que reinviertes en la nueva vivienda"]']);
    await sembrar26(page, 'Importe que reinviertes en la nueva vivienda', '300000');
    const irpfReinv = await valorTarjeta(page, /^IRPF sobre ganancia/);
    const descReinv = await descripcionTarjeta(page, /^IRPF sobre ganancia/);
    expect(irpfReinv === '19.292,50 €' || exigeElPlazo(descReinv), `${irpfReinv} · ${descReinv}`).toBe(true);

    // Lo que hace la reparación, exacto: no exime, y lo dice con el artículo
    expect(irpfReinv).toBe('19.292,50 €');
    expect(descReinv).toContain('art. 41 bis.1 RIRPF');
    expect(await valorTarjeta(page, /^IMPORTE NETO VENDEDOR/)).toBe('269.457,50 €');

    // Declarada la excepción del reglamento, la reinversión total sí exime
    const excepcion = page.getByRole('checkbox', { name: /causa que me obligó a cambiar de domicilio/ });
    await excepcion.check();
    expect(await valorTarjeta(page, /^IRPF sobre ganancia/)).toBe('EXENTO');
    expect(await descripcionTarjeta(page, /^IRPF sobre ganancia/)).toContain('art. 41 bis.1 RIRPF');
    expect(await valorTarjeta(page, /^IMPORTE NETO VENDEDOR/)).toBe('288.750,00 €');

    // Y la de edad también, con la excepción declarada
    await page.getByRole('checkbox', { name: /Voy a reinvertir/ }).uncheck();
    await page.getByRole('checkbox', { name: /Soy mayor de 65 años/ }).check();
    expect(await valorTarjeta(page, /^IRPF sobre ganancia/)).toBe('EXENTO');
    expect(await descripcionTarjeta(page, /^IRPF sobre ganancia/)).toBe(
      'Mayor de 65 años + vivienda habitual (con menos de 3 años de residencia, por la causa que declaras: art. 41 bis.1 RIRPF)',
    );
    expect(await valorTarjeta(page, /^IMPORTE NETO VENDEDOR/)).toBe('288.750,00 €');
  });

  /**
   * HALLAZGO 33.4.b [medio, contenido] — la exención de la vivienda habitual del art. 33.4.b LIRPF
   * no es solo de los mayores de 65. Texto consolidado (BOE-A-2006-20764, bloque a33, leído en
   * sesión): «b) Con ocasión de la transmisión de su vivienda habitual por mayores de 65 años o
   * por personas en situación de dependencia severa o de gran dependencia de conformidad con la
   * Ley de promoción de la autonomía personal…». La app solo ofrece «Soy mayor de 65 años», el
   * motor lo rotula «Mayor de 65 años que transmite su vivienda habitual (art. 33.4.b LIRPF)» y el
   * FAQPage responde «Existen dos exenciones … la reinversión … y la de los mayores de 65 años (art.
   * 33.4.b LIRPF)»: cita el artículo y se deja la mitad. Una persona con gran dependencia de 50
   * años que vende su vivienda habitual (BASE B del CONTROL) lee IRPF 8805,00 € y neto 183.695,00 €
   * «Lo que realmente recibes», cuando su ganancia está exenta (IRPF 0, neto 192.500,00 €), y no
   * tiene casilla ni aviso. Es campo exclusivo de esta app en la familia.
   *
   * Afirma lo correcto: el formulario del vendedor y el FAQPage nombran la dependencia.
   */
  /*
   * REPARADO el 26/09/2026: casilla propia, motivo propio en la tarjeta del IRPF y las dos FAQ del
   * vendedor en el JSON-LD. El caso del acta (BASE B del CONTROL, 10 años de propiedad, vendedor de
   * 50 años con gran dependencia): transmisión 192.500 → ganancia 42.500 EXENTA → neto 192.500,00.
   */
  test('HALLAZGO 33.4.b — la exención de la vivienda habitual alcanza a la dependencia severa o gran dependencia', async ({
    page,
  }) => {
    await abrir26(page);
    await sembrar26(page, 'Precio de la vivienda', '200000');
    await aVendedor26(page);
    await expect(formVendedor(page)).toContainText(/dependencia/i, { timeout: 2000 });
    const jsonLd = (await page.locator('script[type="application/ld+json"]').allTextContents()).join(' ');
    expect(jsonLd).toMatch(/dependencia/i);

    // Y la exención se aplica de verdad
    await sembrar26(page, 'Precio de compra original', '150000');
    await sembrar26(page, 'Años de propiedad', '10');
    await sembrar26(page, 'Valor catastral del suelo', '50000');
    await page.getByRole('checkbox', { name: /dependencia severa o una gran dependencia/ }).check();
    expect(await valorTarjeta(page, /^IRPF sobre ganancia/)).toBe('EXENTO');
    expect(await descripcionTarjeta(page, /^IRPF sobre ganancia/)).toBe(
      'Dependencia severa o gran dependencia + vivienda habitual (art. 33.4.b LIRPF)',
    );
    expect(await valorTarjeta(page, /^IMPORTE NETO VENDEDOR/)).toBe('192.500,00 €');
    expect(await descripcionTarjeta(page, /^IMPORTE NETO VENDEDOR/)).toBe('Lo que realmente recibes');
    // Sin vivienda habitual no procede (art. 33.4.b: «transmisión de su vivienda habitual»)
    await page.getByRole('checkbox', { name: 'Es mi vivienda habitual' }).uncheck();
    expect(await valorTarjeta(page, /^IRPF sobre ganancia/)).toBe('8805,00 €');
  });

  /**
   * HALLAZGO SELLOS [medio, dato] — la app de referencia tiene UN sello y la familia ya lleva dos
   * o tres. El único DataReference dice «ITP/AJD 2026» verificado el 17/06/2026
   * (FISCAL_INMUEBLES_META), y la pestaña Vendedor calcula además con los coeficientes del IIVTNU
   * (PLUSVALIA_MUNICIPAL_META, verificado 24/09/2026: justo los que estuvieron caducados hasta ese
   * día, hallazgo 1559) y con la escala del ahorro (GANANCIAS_PATRIMONIALES_META, verificado
   * 12/08/2026), sin enseñar la fuente ni la fecha de ninguno de los dos. Es la reparación de los
   * hallazgos 35 (garaje), 332 y 1579 (local-comercial) y 695/781 (heredar-vivienda), que no llegó
   * a la referencia: local-comercial pinta tres sellos, garaje y trastero dos.
   *
   * Afirma lo correcto: hay un sello de la plusvalía con su fecha y uno del IRPF con la suya.
   */
  // REPARADO el 26/09/2026 (receta 2 de la familia): un sello por módulo publicado.
  test('HALLAZGO SELLOS — la mitad del vendedor enseña la fuente y la fecha de la plusvalía y del IRPF', async ({
    page,
  }) => {
    await abrir26(page);
    const sellos = (await page.locator('[aria-label="Datos de referencia normativos"]').allInnerTexts()).map((s) =>
      s.replace(ESPACIO_DURO, ' '),
    );
    expect(sellos.length).toBeGreaterThanOrEqual(1);
    expect(sellos.some((s) => s.includes(fechaES(FISCAL_INMUEBLES_META.verificado)))).toBe(true);
    expect(
      sellos.some((s) => /plusval[ií]a|IIVTNU/i.test(s) && s.includes(fechaES(PLUSVALIA_MUNICIPAL_META.verificado))),
      sellos.join(' || '),
    ).toBe(true);
    expect(
      sellos.some((s) => /IRPF|ahorro/i.test(s) && s.includes(fechaES(GANANCIAS_PATRIMONIALES_META.verificado))),
      sellos.join(' || '),
    ).toBe(true);
    // Y los aranceles de notaría y registro, que la página también publica (receta 2)
    expect(
      sellos.some((s) => s.includes('RD 1426/1989') && s.includes(fechaES(FACTURA_NOTARIAL.verificado))),
      sellos.join(' || '),
    ).toBe(true);
    expect(
      sellos.some((s) => s.includes('RD 1427/1989') && s.includes(fechaES(REGISTRO_CONCEPTOS.verificado))),
      sellos.join(' || '),
    ).toBe(true);
    // Un sello no cita normas de otro: el de ITP/AJD ya no nombra el RDL 26/2021 de la plusvalía
    const selloItp = sellos.find((s) => /ITP, AJD/.test(s)) ?? '';
    expect(selloItp).not.toContain('RDL 26/2021');
  });

  /**
   * HALLAZGO 1455 [medio, contenido] — la FAQ visible y el FAQPage del JSON-LD («¿Puedo negociar
   * quién paga cada gasto?») afirman: «salvo los gastos del vendedor (plusvalía municipal, IRPF),
   * el resto son del comprador por ley». Código Civil, art. 1455 (BOE-A-1889-4763, leído en
   * sesión): «Los gastos de otorgamiento de escrituras serán de cuenta del vendedor, y los de la
   * primera copia y los demás posteriores a la venta serán de cuenta del comprador, salvo pacto en
   * contrario». Por ley la matriz de la escritura es del VENDEDOR; que lo pague todo el comprador
   * es un pacto habitual, no la ley. El paso 3 de la guía («sí puedes acordar que el vendedor
   * asuma ciertos gastos notariales») y la fila «Notaría · ¿Quién paga? Comprador» de la tabla
   * repiten la misma idea. Es la boca que leen los asistentes de IA sin el disclaimer al lado.
   *
   * Afirma lo correcto: ni la FAQ visible ni el JSON-LD dicen que el resto sea del comprador «por ley».
   */
  // REPARADO el 26/09/2026: una constante para las dos bocas, el paso 3 y la fila de la tabla.
  test('HALLAZGO 1455 — la FAQ no atribuye al comprador «por ley» los gastos de otorgamiento de la escritura', async ({
    page,
  }) => {
    await abrir26(page);
    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
    const faq = await page.locator('div[class*="faqItem"]', { hasText: '¿Puedo negociar quién paga' }).first().innerText();
    const jsonLd = (await page.locator('script[type="application/ld+json"]').allTextContents()).join(' ');
    expect(faq).not.toContain('el resto son del comprador por ley');
    expect(jsonLd).not.toContain('el resto son del comprador por ley');
    // Y dice lo que dice la ley, en las dos bocas
    expect(faq).toContain('art. 1455 del Código Civil');
    expect(jsonLd).toContain('art. 1455 del Código Civil');
    expect(faq).toMatch(/otorgamiento de la escritura[^.]*son del vendedor/);
    // El paso 3 de la guía y la fila «Notaría» de la tabla
    await expect(page.locator('li', { hasText: 'Firma el contrato de arras' }).first()).toContainText(
      'la escritura matriz corre a cargo del vendedor',
    );
    const filaNotaria = page.locator('tr', { has: page.locator('td', { hasText: /^Notaría$/ }) }).first();
    await expect(filaNotaria).toContainText('art. 1455 CC');
    await expect(filaNotaria.locator('td').last()).not.toHaveText('Comprador');
  });

  /**
   * CONTROL (accesibilidad) — lo que añadió la reparación de 1794/1795 (la pregunta del régimen,
   * su <select> y la nota de los tipos de hoy) llega a 4,5:1 en los dos temas, como el resto de
   * controles que midió el hallazgo 1801. Medido: claro 16,67 / 16,67 / 5,50; oscuro 13,82 /
   * 11,39 / 8,03.
   */
  test('CONTROL (contraste) — la pregunta del régimen, su desplegable y la nota de «Estimar por mí» en los dos temas', async ({
    page,
  }) => {
    await abrir26(page);
    await aVendedor26(page);
    await page.addStyleTag({ content: '*, *::before, *::after { transition: none !important; }' });
    const medir = (tema: string) =>
      page.evaluate((t) => {
        document.documentElement.setAttribute('data-theme', t);
        const rgb = (s: string) => (s.match(/[\d.]+/g) ?? []).map(Number);
        const lum = ([r, g, b]: number[]) => {
          const f = (v: number) => {
            const c = v / 255;
            return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
          };
          return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
        };
        const fondo = (el: Element) => {
          const capas: number[][] = [];
          for (let n: Element | null = el; n; n = n.parentElement) {
            const c = rgb(getComputedStyle(n).backgroundColor);
            const a = c.length > 3 ? c[3] : 1;
            if (c.length >= 3 && a > 0) {
              capas.push([c[0], c[1], c[2], a]);
              if (a >= 1) break;
            }
          }
          let res = [255, 255, 255];
          for (const c of capas.reverse()) res = res.map((v, i) => v * (1 - c[3]) + c[i] * c[3]);
          return res;
        };
        const ratio = (el: Element | null) => {
          if (!el) return 0;
          const a = lum(rgb(getComputedStyle(el).color));
          const b = lum(fondo(el));
          return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
        };
        return {
          pregunta: ratio(document.querySelector('label[for="regimen-compra-original"]')),
          desplegable: ratio(document.getElementById('regimen-compra-original')),
          nota: ratio(document.getElementById('nota-estimar-gastos')),
        };
      }, tema);
    for (const tema of ['light', 'dark']) {
      const r = await medir(tema);
      for (const [nombre, valor] of Object.entries(r)) {
        expect(valor, `${tema} · ${nombre}: ${valor.toFixed(2)}:1`).toBeGreaterThanOrEqual(4.5);
      }
    }
  });

  /**
   * RECETA 1 de la familia (hallazgo 2214, motor reparado en 242fffcd) — notaría y registro SIN IVA
   * donde no rige. Canarias · vivienda de segunda mano · 150.000 €, a mano (recalculado el
   * 12/10/2026 con la rebaja del 5 % del nº 2.1 de los dos aranceles, hallazgos 2901 y 2902;
   * entre paréntesis, la cifra sin la rebaja):
   *   Registro = (24,040484 + 42,0708575 + 37,56325 + 67,4240925 (tramos) = 171,098684) × 0,95
   *              + 6,010121 (presentación) + 3,005061 (nota simple) = 171,558932 € SIN el 1,21 →
   *              171,56 € (180,11; y antes de 242fffcd, 217,94 € «IVA incluido», con 37,82 € de un
   *              IVA que allí no existe).
   *   Notaría  = arancel 333,308711 × 0,95 = 316,643275 sin IVA × 1,5 = 474,96 · × 2 = 633,29 ·
   *              medio × 1,75 = 554,126 → 554,13 € (583,29, entre 499,96 y 666,61).
   * Los rótulos dicen «(sin IGIC)», el coste total sale «(PARCIAL)» y una nota junto al total dice,
   * con la redacción común de la familia, que esas facturas llevan además IGIC, que no se calcula,
   * así que cuestan más de lo que se muestra. En Madrid, el mismo
   * precio sigue «(IVA incluido)» con 207,59 € (171,558932 × 1,21; sin la rebaja, 217,94).
   */
  test('RECETA 1 — en Canarias la notaría y el registro van sin IVA y el coste total lo dice', async ({ page }) => {
    await abrir26(page, 'canarias');
    await sembrar26(page, 'Precio de la vivienda', '150000');
    expect(await titulo26(page, /^Registro de la Propiedad/)).toBe('Registro de la Propiedad (sin IGIC)');
    expect(await valorTarjeta(page, /^Registro de la Propiedad/)).toBe('171,56 €');
    expect(await titulo26(page, /^Gastos de notaría/)).toBe('Gastos de notaría (sin IGIC)');
    expect(await valorTarjeta(page, /^Gastos de notaría/)).toBe('554,13 €');
    expect(await descripcionTarjeta(page, /^Gastos de notaría/)).toContain('entre 474,96 € y 633,29 €');
    expect(await titulo26(page, /^COSTE TOTAL/)).toBe('COSTE TOTAL (PARCIAL)');
    await expect(page.getByRole('note').filter({ hasText: 'Las facturas de notaría y registro llevan además' })).toHaveText(
      'Las facturas de notaría y registro llevan además IGIC, que esta herramienta no calcula, así que cuestan más de lo que se muestra.',
    );

    // Control: la península no cambia
    await abrir26(page, 'madrid');
    await sembrar26(page, 'Precio de la vivienda', '150000');
    expect(await titulo26(page, /^Registro de la Propiedad/)).toBe('Registro de la Propiedad (IVA incluido)');
    expect(await valorTarjeta(page, /^Registro de la Propiedad/)).toBe('207,59 €');
    await expect(page.getByRole('note').filter({ hasText: 'Las facturas de notaría y registro llevan' })).toHaveCount(0);
  });

  /**
   * RECETA 6 de la familia (hallazgo 2192 en las hermanas) — «(o puede haber ganancia)» solo si,
   * con la plusvalía a 0, habría ganancia. Madrid · venta 200.000 · compra 190.000 · 10 años ·
   * suelo 50.000 · comisión 3 % · valor catastral total ILEGIBLE («700.000.00»):
   *   plusvalía objetivo 50.000 × 0,12 × 25 % = 1.500 · transmisión 200.000 − 6.000 − 1.500 = 192.500
   *   (a) gastos de aquella compra 5.000 → adquisición 195.000 → pérdida 2.500. Sin plusvalía,
   *       194.000 − 195.000 = −1.000: sigue siendo pérdida → NO se promete ganancia.
   *   (b) gastos 3.000 → adquisición 193.000 → pérdida 500. Sin plusvalía, 194.000 − 193.000 =
   *       +1.000 → SÍ puede haber ganancia.
   */
  test('RECETA 6 — «(o puede haber ganancia)» solo cuando, sin plusvalía, la habría', async ({ page }) => {
    test.setTimeout(60_000);
    await abrir26(page);
    await sembrar26(page, 'Precio de la vivienda', '200000');
    await aVendedor26(page);
    await sembrar26(page, 'Precio de compra original', '190000');
    await sembrar26(page, 'Años de propiedad', '10');
    await sembrar26(page, 'Valor catastral del suelo', '50000');
    await sembrar26(page, 'Valor catastral total (suelo + construcción)', '700.000.00');
    await sembrar26(page, 'Impuestos y gastos que pagaste al comprar', '5000');
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('1500,00 €');
    expect(await valorTarjeta(page, /^Pérdida patrimonial/)).toBe('2500,00 €');
    const a = await descripcionTarjeta(page, /^Pérdida patrimonial/);
    expect(a).toMatch(/la pérdida real (?:es|puede ser) menor que esta/);
    expect(a).not.toContain('(o puede haber ganancia)');

    await sembrar26(page, 'Impuestos y gastos que pagaste al comprar', '3000');
    expect(await valorTarjeta(page, /^Pérdida patrimonial/)).toBe('500,00 €');
    expect(await descripcionTarjeta(page, /^Pérdida patrimonial/)).toContain('(o puede haber ganancia)');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Hallazgo 2209 (26/09/2026) — anotado en la hermana solar y llevado a las siete apps de la
// familia: la base del AJD no puede ser inferior al valor de referencia (art. 30.1 TRLITPAJD,
// redacción de la Ley 11/2021), aunque la del IVA sea la contraprestación pactada. La app tiene
// un solo precio: lo dice en la tarjeta del AJD, al final del total y en la ayuda del precio con
// IVA, y en ningún sitio cuando no hay AJD.
// ═══════════════════════════════════════════════════════════════════════════════
test.describe('Hallazgo 2209 — la base mínima del AJD (art. 30.1 TRLITPAJD)', () => {
  test('con AJD, la tarjeta, el total y la ayuda lo dicen; sin AJD, no', async ({ page }) => {
    const CAMPO = 'input[aria-label="Precio de la vivienda"]';
    await page.goto(RUTA);
    await esperarHidratacion(page, [CAMPO]);
    await sembrarValor(page, CAMPO, '200000');
    const crudo = async (titulo: RegExp): Promise<string> =>
      (await page.locator('h3', { hasText: titulo }).first().locator('xpath=../following-sibling::p[1]').innerText())
        .replace(/\s+/g, ' ')
        .trim();

    // Segunda mano: ITP y ningún AJD, así que ninguna salvedad.
    await page.getByRole('button', { name: /Segunda mano/ }).first().click();
    await expect(page.locator('h3', { hasText: /^AJD/ })).toHaveCount(0);
    expect(await crudo(/^COSTE TOTAL/)).not.toContain('art. 30.1');

    // Primera mano en Madrid: IVA + AJD, y la salvedad en la tarjeta y al final del total.
    await page.getByRole('button', { name: /Primera mano/ }).first().click();
    await expect(page.locator('h3', { hasText: /^AJD/ })).toHaveCount(1);
    expect(await crudo(/^AJD/)).toContain(AVISO_BASE_AJD);
    expect((await crudo(/^COSTE TOTAL/)).endsWith(AVISO_BASE_AJD)).toBe(true);
    const idAyuda = await page.locator(CAMPO).getAttribute('aria-describedby');
    const ayuda = (await page.locator(`[id="${idAyuda}"]`).innerText()).replace(/\s+/g, ' ');
    expect(ayuda).toContain('La base del AJD no puede ser inferior al valor de referencia catastral (art. 30.1 TRLITPAJD)');
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// Inspector 06/10/2026 — re-inspección de la REFERENCIA de la familia (INVALIDADA)
//
// Entra tras las reparaciones del 26/09 —fe7609ca (art. 41 bis, dependencia, sellos, art. 1455
// CC, comisión > 100 %), 7d5c1876 (total parcial sin IGIC/IPSI y la salvedad del art. 30.1) y
// 242fffcd (notaría y registro sin IVA donde rige IGIC o IPSI)— y con una sospecha CON CASO de
// SOSPECHAS.md (03/10/2026): la rebaja del 5 % del arancel notarial.
//
// Verificado en el navegador, no por el commit: los casos 61-63, RECETA 1, RECETA 6, el 41 bis,
// el 33.4.b, los sellos y el 2209 siguen en verde, y los casos de abajo pisan caminos que no:
// Baleares (escala en dos tramos) con el vendedor completo, los dos TOPES de los aranceles, las
// facturas sin IPSI de Ceuta, el plazo del art. 41 bis en su último año que bloquea (2) con la
// dependencia, y el invariante de la familia CAMPO A CAMPO en los doce importes de la app.
//
// Fuentes de esta vuelta, leídas hoy en el BOE consolidado:
//   · RD 1426/1989, Anexo I, nº 2.1 (BOE-A-1989-28111): a) hasta 6.010,12 € → 90,151816 € ·
//     b) 4,5 ‰ · c) 1,50 ‰ · d) 1 ‰ · e) 0,5 ‰ · f) 0,3 ‰ hasta 6.010.121,04 €, y «En todos los
//     supuestos de este apartado se aplicará una rebaja del 5 por 100 del importe del arancel a
//     percibir por el notario» (párrafo añadido por el RD 1612/2011; DA 8.ª.1.1 RDL 8/2010).
//   · RD 1427/1989, Anexo I, nº 2.1 (BOE-A-1989-28112): a) 24,040484 € · b) 1,75 ‰ · c) 1,25 ‰ ·
//     d) 0,75 ‰ · e) 0,30 ‰ · f) 0,20 ‰; «el arancel global … no podrá superar los 2.181,673939
//     euros», y «En todos los supuestos de este número se aplicará una rebaja del 5 por 100 del
//     importe del arancel a percibir por el registrador» (RD 1612/2011; DA 8.ª.1.2 RDL 8/2010).
//     Presentación (nº 1, 6,010121 €) y nota simple (nº 4.1.f, 3,005061 €) no son del nº 2.
//   · ITP de Baleares: ITP_CCAA.baleares.tramosProgresivos (8 % hasta 400.000 · 9 % hasta
//     600.000…). Plusvalía: COEFICIENTES_IIVTNU_2025 y PLUSVALIA_MUNICIPAL_META.tipoOrientativo.
//     IRPF: TRAMOS_GANANCIAS_PATRIMONIALES_2025 (19/21/23/27/30 %).
//
// Los casos que MIDEN el cálculo no fijan la cifra de la notaría ni la del registro: eso lo hacen
// los dos hallazgos del final, con la rebaja. Así, cuando se reparen, estos casos siguen en verde
// y los dos `test.fail()` se ponen en rojo, que es la señal para convertirlos en `test(`.
// ══════════════════════════════════════════════════════════════════════════════
test.describe('Inspector 06/10/2026 — la rebaja de los aranceles y el invariante campo a campo', () => {
  /** Escribe como el usuario, comprueba que el ESTADO de React lo recogió y sale del campo. */
  async function sembrar(page: Page, etiqueta: string, valor: string): Promise<void> {
    const campo = page.locator(`input[aria-label="${etiqueta}"]`);
    await campo.fill(valor);
    await esperarValorEnReact(page, campo, valor);
    await campo.blur();
  }

  async function abrir(page: Page, ccaa?: string): Promise<void> {
    await page.goto(RUTA);
    await esperarHidratacion(page, ['input[aria-label="Precio de la vivienda"]']);
    if (ccaa) await page.locator('#ccaa-inmueble').selectOption(ccaa);
  }

  async function aVendedor(page: Page): Promise<void> {
    await page.getByRole('button', { name: 'Vendedor' }).click();
    await esperarHidratacion(page, ['input[aria-label="Precio de compra original"]']);
  }

  /** El rótulo entero de una tarjeta, para ver su «(parcial)» o su «(sin IPSI)». */
  const rotulo = (page: Page, titulo: RegExp) => page.locator('h3', { hasText: titulo }).first().innerText();
  /** «1076,61 €» → 1076.61, con el parser del catálogo (no con un parseFloat casero). */
  const euros = (texto: string): number => parseSpanishNumber(texto.replace(/\s*€\s*$/, ''));

  /**
   * BASE V del invariante (y de los hallazgos de concordancia y de la base imponible): Madrid ·
   * venta 300.000 · compra 200.000 · 10 años · suelo 60.000 · total 150.000 · comisión 3 % (la de
   * fábrica) · vivienda habitual (marcada de fábrica), sin edad ni reinversión. A mano:
   *   plusvalía objetivo 60.000 × 0,12 × 25 % = 1.800 · real 100.000 × 0,4 × 25 % = 10.000 → 1.800
   *   comisión 9.000 · transmisión 289.200 · adquisición 200.000 · ganancia 89.200
   *   IRPF 6.000 × 19 % + 44.000 × 21 % + 39.200 × 23 % = 1.140 + 9.240 + 9.016 = 19.396,00
   *   neto 300.000 − 1.800 − 9.000 − 19.396 = 269.804,00
   */
  async function montarBaseV(page: Page): Promise<void> {
    await abrir(page);
    await sembrar(page, 'Precio de la vivienda', '300000');
    await aVendedor(page);
    await sembrar(page, 'Precio de compra original', '200000');
    await sembrar(page, 'Años de propiedad', '10');
    await sembrar(page, 'Valor catastral del suelo', '60000');
    await sembrar(page, 'Valor catastral total (suelo + construcción)', '150000');
  }

  /** La reinversión de la BASE V: marca la casilla y espera a sus dos campos. */
  async function marcarReinversion(page: Page): Promise<void> {
    await page.getByRole('checkbox', { name: /Voy a reinvertir/ }).check();
    await esperarHidratacion(page, ['input[aria-label="Hipoteca pendiente de la vivienda que vendes"]']);
  }

  /**
   * CASO 64 (normal) — Baleares, segunda mano, vivienda de 500.000 €, perfil General, gestoría
   * de fábrica (300 €), y el vendedor completo con los dos campos que solo tiene esta app de la
   * familia (gastos de aquella compra y mejoras) y otros gastos de la venta.
   *
   * Comprador: ITP = 400.000 × 8 % + 100.000 × 9 % = 32.000 + 9.000 = 41.000,00 € (tipo
   *   efectivo 8,20 %). Notaría y registro: los fijan los dos hallazgos del final; aquí se exige
   *   que el total sume lo que se ve (hoy 41.000 + 1076,61 + 345,12 + 300 = 42.721,73 €).
   * Vendedor: compra 300.000 · 15 años · suelo 90.000 · total 225.000 · comisión 4 % · otros
   *   gastos 1.500 · gastos de aquella compra 25.000 · mejoras 10.000 · vivienda habitual sin edad:
   *   plusvalía objetivo 90.000 × 0,09 × 25 % = 2.025 · real 200.000 × 0,4 × 25 % = 20.000 → 2.025
   *   comisión 20.000 · transmisión 500.000 − 20.000 − 1.500 − 2.025 = 476.475
   *   adquisición 300.000 + 25.000 + 10.000 = 335.000 · ganancia 141.475
   *   IRPF 1.140 + 9.240 + 91.475 × 23 % (21.039,25) = 31.419,25 €
   *   total 2.025 + 20.000 + 1.500 + 31.419,25 = 54.944,25 · neto 445.055,75 €
   */
  test('CASO 64 (normal) — Baleares, 500.000 €: la escala en dos tramos y el vendedor completo', async ({
    page,
  }) => {
    test.setTimeout(60_000);
    expect(ITP_CCAA['baleares'].tramosProgresivos?.slice(0, 2)).toEqual([
      { hasta: 400000, tipo: 8 },
      { hasta: 600000, tipo: 9 },
    ]);
    expect(COEFICIENTES_IIVTNU_2025.find((c) => c.anios === 15)?.coeficiente).toBe(0.09);
    expect(PLUSVALIA_MUNICIPAL_META.tipoOrientativo).toBe(25);

    await abrir(page, 'baleares');
    await sembrar(page, 'Precio de la vivienda', '500000');
    await expect(page.locator('h3', { hasText: /^ITP/ }).first()).toHaveText('ITP (8,20 %)');
    expect(await valorTarjeta(page, /^ITP/)).toBe('41.000,00 €');
    expect(await valorTarjeta(page, /^Gastos de gestoría/)).toBe('300,00 €');
    const notaria = euros(await valorTarjeta(page, /^Gastos de notaría/));
    const registro = euros(await valorTarjeta(page, /^Registro de la Propiedad/));
    const total = euros(await valorTarjeta(page, /^Total gastos adicionales/));
    expect(total).toBeCloseTo(41000 + notaria + registro + 300, 2);
    expect(await rotulo(page, /^COSTE TOTAL/)).toBe('COSTE TOTAL DE ADQUISICIÓN');
    expect(euros(await valorTarjeta(page, /^COSTE TOTAL/))).toBeCloseTo(500000 + total, 2);

    await aVendedor(page);
    await sembrar(page, 'Precio de compra original', '300000');
    await sembrar(page, 'Años de propiedad', '15');
    await sembrar(page, 'Valor catastral del suelo', '90000');
    await sembrar(page, 'Valor catastral total (suelo + construcción)', '225000');
    await sembrar(page, 'Comisión inmobiliaria (%)', '4');
    await sembrar(page, 'Otros gastos de la venta (opcional)', '1500');
    await sembrar(page, 'Impuestos y gastos que pagaste al comprar', '25000');
    await sembrar(page, 'Inversiones y mejoras (opcional)', '10000');
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('2025,00 €');
    expect(await descripcionTarjeta(page, 'Plusvalía municipal')).toBe('Método objetivo (más favorable)');
    expect(await valorTarjeta(page, 'Valor de adquisición')).toBe('335.000,00 €');
    expect(await valorTarjeta(page, 'Valor de transmisión')).toBe('476.475,00 €');
    expect(await valorTarjeta(page, /^Ganancia patrimonial/)).toBe('141.475,00 €');
    expect(await valorTarjeta(page, /^IRPF sobre ganancia/)).toBe('31.419,25 €');
    expect(await valorTarjeta(page, /^Comisión inmobiliaria/)).toBe('20.000,00 €');
    expect(await valorTarjeta(page, /^Otros gastos de la venta/)).toBe('1500,00 €');
    expect(await valorTarjeta(page, /^Total gastos vendedor/)).toBe('54.944,25 €');
    expect(await valorTarjeta(page, /^IMPORTE NETO VENDEDOR/)).toBe('445.055,75 €');
    expect(await descripcionTarjeta(page, /^IMPORTE NETO VENDEDOR/)).toBe('Lo que realmente recibes');
  });

  /**
   * CASO 65 (límite) — tres cantos que nada pisaba:
   *  (a) Los dos TOPES de los aranceles. El notarial no fija cantidad por encima de 6.010.121,04 €
   *      (nº 2.1): la notaría de 10 M y de 12 M es la del canto, y el coste sale «(PARCIAL)». El
   *      registral no puede superar 2.181,673939 € (nº 2.1): la escala de 10.000.000 € ya da
   *      24,04 + 42,07 + 37,56 + 67,61 + 135,23 + 9.398.987,90 × 0,20 ‰ (1.879,80) = 2.186,31,
   *      por encima del tope, así que el registro de 10 M y el de 12 M son el mismo. Se miden
   *      como IGUALDADES para que valgan con y sin la rebaja de los hallazgos del final.
   *      ITP: 10.000.000 × 6 % = 600.000,00 · 12.000.000 × 6 % = 720.000,00.
   *  (b) Ceuta, 150.000 €: ITP 6 % con la bonificación del 50 % (art. 57 bis TRLITPAJD) → 3 % →
   *      4500,00 €; las facturas de notaría y registro, SIN IPSI (hallazgo 2214, 242fffcd): son
   *      las de Madrid al mismo precio divididas entre 1,21, y una nota lo dice.
   *  (c) El art. 41 bis.1 RIRPF en su último año que bloquea (2), con la DEPENDENCIA del art.
   *      33.4.b (hallazgos 2182 y 2183 juntos). Madrid · 300.000 · compra 200.000 · 2 años ·
   *      suelo 60.000 · 3 %: plusvalía 60.000 × 0,14 × 25 % = 2.100 · transmisión 288.900 ·
   *      ganancia 88.900 → IRPF 1.140 + 9.240 + 38.900 × 23 % (8.947) = 19.327,00 · neto
   *      300.000 − 9.000 − 2.100 − 19.327 = 269.573,00. Con la excepción declarada: EXENTO y
   *      neto 288.900,00.
   */
  test('CASO 65 (límite) — los topes de los dos aranceles, Ceuta sin IPSI y el art. 41 bis en 2 años', async ({
    page,
  }) => {
    test.setTimeout(90_000);
    expect(COEFICIENTES_IIVTNU_2025.find((c) => c.anios === 2)?.coeficiente).toBe(0.14);

    // (a)
    await abrir(page, 'madrid');
    await sembrar(page, 'Precio de la vivienda', '10000000');
    expect(await valorTarjeta(page, /^ITP/)).toBe('600.000,00 €');
    const notaria10 = await valorTarjeta(page, /^Gastos de notaría/);
    const registro10 = await valorTarjeta(page, /^Registro de la Propiedad/);
    expect(await descripcionTarjeta(page, /^Gastos de notaría/)).toContain(
      'Por encima de 6.010.121,04 € el arancel no fija cantidad',
    );
    expect(await rotulo(page, /^Total gastos adicionales/)).toBe('Total gastos adicionales (parcial)');
    expect(await rotulo(page, /^COSTE TOTAL/)).toBe('COSTE TOTAL (PARCIAL)');
    expect(await descripcionTarjeta(page, /^COSTE TOTAL/)).toBe(
      'No incluye la parte de la notaría que excede de 6.010.121,04 €, que es de libre acuerdo: el coste real puede ser mayor',
    );
    await sembrar(page, 'Precio de la vivienda', '12000000');
    expect(await valorTarjeta(page, /^ITP/)).toBe('720.000,00 €');
    expect(await valorTarjeta(page, /^Gastos de notaría/)).toBe(notaria10);
    expect(await valorTarjeta(page, /^Registro de la Propiedad/)).toBe(registro10);
    // En el canto exacto la notaría ya es la máxima reglada, y no hay parte libre
    await sembrar(page, 'Precio de la vivienda', '6010121,04');
    expect(await valorTarjeta(page, /^Gastos de notaría/)).toBe(notaria10);
    expect(await rotulo(page, /^COSTE TOTAL/)).toBe('COSTE TOTAL DE ADQUISICIÓN');

    // (b)
    await abrir(page, 'ceuta');
    await sembrar(page, 'Precio de la vivienda', '150000');
    expect(await valorTarjeta(page, /^ITP/)).toBe('4500,00 €');
    expect(await rotulo(page, /^Gastos de notaría/)).toBe('Gastos de notaría (sin IPSI)');
    expect(await rotulo(page, /^Registro de la Propiedad/)).toBe('Registro de la Propiedad (sin IPSI)');
    expect(await rotulo(page, /^COSTE TOTAL/)).toBe('COSTE TOTAL (PARCIAL)');
    await expect(page.getByRole('note').filter({ hasText: 'Las facturas de notaría y registro llevan además' })).toHaveText(
      'Las facturas de notaría y registro llevan además IPSI, que esta herramienta no calcula, así que cuestan más de lo que se muestra.',
    );
    const notariaCeuta = euros(await valorTarjeta(page, /^Gastos de notaría/));
    const registroCeuta = euros(await valorTarjeta(page, /^Registro de la Propiedad/));
    await abrir(page, 'madrid');
    await sembrar(page, 'Precio de la vivienda', '150000');
    expect(euros(await valorTarjeta(page, /^Gastos de notaría/))).toBeCloseTo(notariaCeuta * 1.21, 1);
    expect(euros(await valorTarjeta(page, /^Registro de la Propiedad/))).toBeCloseTo(registroCeuta * 1.21, 1);

    // (c)
    await abrir(page);
    await sembrar(page, 'Precio de la vivienda', '300000');
    await aVendedor(page);
    await sembrar(page, 'Precio de compra original', '200000');
    await sembrar(page, 'Años de propiedad', '2');
    await sembrar(page, 'Valor catastral del suelo', '60000');
    await page.getByRole('checkbox', { name: /dependencia severa/ }).check();
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('2100,00 €');
    expect(await valorTarjeta(page, /^IRPF sobre ganancia/)).toBe('19.327,00 €');
    expect(await descripcionTarjeta(page, /^IRPF sobre ganancia/)).toContain(
      'con 2 años de propiedad no llega a los 3 años seguidos de residencia que exige el art. 41 bis.1 RIRPF',
    );
    expect(await valorTarjeta(page, /^IMPORTE NETO VENDEDOR/)).toBe('269.573,00 €');
    await page.getByRole('checkbox', { name: /Vivo en ella menos de 3 años/ }).check();
    expect(await valorTarjeta(page, /^IRPF sobre ganancia/)).toBe('EXENTO');
    expect(await descripcionTarjeta(page, /^IRPF sobre ganancia/)).toContain(
      'Dependencia severa o gran dependencia + vivienda habitual (art. 33.4.b LIRPF)',
    );
    expect(await valorTarjeta(page, /^IMPORTE NETO VENDEDOR/)).toBe('288.900,00 €');
  });

  /**
   * CASO 66 (debe nombrarse) — el invariante de la familia en los DOCE importes de la app, en el
   * navegador: «2.000.50» (NaN por diseño) no es un cero; si mueve una cifra publicada, la app
   * lo nombra y dice en qué dirección queda la real. La cifra que se mide es la FINAL de cada
   * pestaña (neto del vendedor, coste del comprador), con su valor a mano sobre la BASE V:
   *   · precio de compra → sin plusvalía ni IRPF: 300.000 − 9.000 = 291.000,00 (menor)
   *   · años / suelo → sin plusvalía: IRPF de 91.000 = 1.140 + 9.240 + 41.000 × 23 % = 19.810 →
   *     300.000 − 9.000 − 19.810 = 271.190,00 (menor)
   *   · valor total / gastos de aquella compra / mejoras / otros gastos / reinversión → como 0:
   *     el neto de la BASE V, 269.804,00 (total y reinversión: MAYOR; gastos y mejoras: MAYOR;
   *     otros gastos: menor)
   *   · comisión → 0: transmisión 298.200, ganancia 98.200, IRPF 1.140 + 9.240 + 48.200 × 23 %
   *     = 21.466 → 300.000 − 1.800 − 21.466 = 276.734,00 (menor)
   *   · hipoteca, con 150.000 reinvertidos → 0: obtenido 289.200, exento 150.000 / 289.200 →
   *     base 89.200 × 139.200 / 289.200 = 42.934,44 → IRPF 1.140 + 36.934,44 × 21 % = 8.896,23
   *     → 300.000 − 1.800 − 9.000 − 8.896,23 = 280.303,77 (MAYOR)
   *   · gestoría del comprador → fuera del total: «el coste real será mayor»
   *   · precio → no hay desglose, y el mensaje nombra el texto
   * Los campos de la reinversión (importe e hipoteca) y las mejoras solo existen en esta app de
   * la familia: el testigo los cubre, pero ninguna hermana los tiene.
   */
  const ILEGIBLE_0610 = '2.000.50';
  const FILAS_66: {
    etiqueta: string;
    reinversion?: string;
    neto: string;
    dice: string[];
  }[] = [
    {
      etiqueta: 'Precio de compra original',
      neto: '291.000,00 €',
      dice: ['El precio de compra original no se ha podido leer', 'el neto real puede ser menor que este'],
    },
    {
      etiqueta: 'Años de propiedad',
      neto: '271.190,00 €',
      dice: ['No se han podido leer los años de tenencia', 'el neto real puede ser menor que este'],
    },
    {
      etiqueta: 'Valor catastral del suelo',
      neto: '271.190,00 €',
      dice: ['El valor catastral del suelo no se ha podido leer', 'el neto real puede ser menor que este'],
    },
    {
      etiqueta: 'Valor catastral total (suelo + construcción)',
      neto: '269.804,00 €',
      dice: ['El valor catastral total (con él la plusvalía puede salir más barata por el método real) no se ha podido leer: el neto real puede ser MAYOR que este'],
    },
    {
      etiqueta: 'Impuestos y gastos que pagaste al comprar',
      neto: '269.804,00 €',
      dice: ['No se han podido leer los impuestos y gastos de aquella compra (suman al valor de adquisición y REDUCEN el IRPF): el neto real es MAYOR que este'],
    },
    {
      etiqueta: 'Inversiones y mejoras (opcional)',
      neto: '269.804,00 €',
      dice: ['No se han podido leer las mejoras (suman al valor de adquisición y REDUCEN el IRPF): el neto real es MAYOR que este'],
    },
    {
      etiqueta: 'Comisión inmobiliaria (%)',
      neto: '276.734,00 €',
      dice: ['No descuenta la comisión inmobiliaria, que no se ha podido leer', 'el neto real es menor que este'],
    },
    {
      etiqueta: 'Otros gastos de la venta (opcional)',
      neto: '269.804,00 €',
      dice: ['No descuenta los otros gastos de la venta', 'el neto real es menor que este'],
    },
    {
      etiqueta: 'Importe que reinviertes en la nueva vivienda',
      reinversion: '',
      neto: '269.804,00 €',
      dice: ['El importe que reinviertes (con él, la ganancia puede quedar exenta por el art. 38 LIRPF) no se ha podido leer: el neto real es MAYOR que este'],
    },
    {
      etiqueta: 'Hipoteca pendiente de la vivienda que vendes',
      reinversion: '150000',
      neto: '280.303,77 €',
      dice: ['El principal pendiente de la hipoteca (se resta del importe obtenido, así que con él es mayor la parte exenta de la ganancia, art. 41 RIRPF) no se ha podido leer: el neto real es MAYOR que este'],
    },
  ];
  for (const fila of FILAS_66) {
    test(`CASO 66 (debe nombrarse) — «${ILEGIBLE_0610}» en «${fila.etiqueta}»`, async ({ page }) => {
      test.setTimeout(60_000);
      await montarBaseV(page);
      if (fila.reinversion !== undefined) {
        await marcarReinversion(page);
        if (fila.reinversion) await sembrar(page, 'Importe que reinviertes en la nueva vivienda', fila.reinversion);
      }
      await sembrar(page, fila.etiqueta, ILEGIBLE_0610);
      // El texto imposible se queda a la vista: el blur no lo reescribe
      await expect(page.locator(`input[aria-label="${fila.etiqueta}"]`)).toHaveValue(ILEGIBLE_0610);
      expect(await rotulo(page, /^IMPORTE NETO VENDEDOR/)).toBe('IMPORTE NETO VENDEDOR (PARCIAL)');
      expect(await valorTarjeta(page, /^IMPORTE NETO VENDEDOR/)).toBe(fila.neto);
      const neto = await descripcionTarjeta(page, /^IMPORTE NETO VENDEDOR/);
      for (const frase of fila.dice) expect(neto).toContain(frase);
    });
  }

  test(`CASO 66 (debe nombrarse) — «${ILEGIBLE_0610}» en la gestoría y en el precio del comprador`, async ({
    page,
  }) => {
    // Madrid · 300.000: ITP 18.000 + notaría + registro, SIN la gestoría ilegible
    await abrir(page, 'madrid');
    await sembrar(page, 'Precio de la vivienda', '300000');
    await sembrar(page, 'Gastos de gestoría del comprador (€)', ILEGIBLE_0610);
    expect(await valorTarjeta(page, /^Gastos de gestoría/)).toBe('Sin leer');
    const total = euros(await valorTarjeta(page, /^Total gastos adicionales/));
    const notaria = euros(await valorTarjeta(page, /^Gastos de notaría/));
    const registro = euros(await valorTarjeta(page, /^Registro de la Propiedad/));
    expect(total).toBeCloseTo(18000 + notaria + registro, 2);
    expect(await rotulo(page, /^COSTE TOTAL/)).toBe('COSTE TOTAL (PARCIAL)');
    expect(await descripcionTarjeta(page, /^COSTE TOTAL/)).toBe(
      'No incluye la gestoría, que no se ha podido leer: el coste real será mayor',
    );

    await sembrar(page, 'Precio de la vivienda', ILEGIBLE_0610);
    await expect(page.locator('h3', { hasText: /^ITP/ })).toHaveCount(0);
    await expect(page.getByText(`No se ha podido leer el precio «${ILEGIBLE_0610}»`)).toBeVisible();
  });

  /**
   * CONTROL de montaje de los cuatro hallazgos de abajo: si esto se pone rojo, lo que falla es la
   * preparación, no el hallazgo. Nada de aquí cambia al repararlos:
   *  · Madrid · 200.000 €: la notaría y el registro se leen y caen en una banda que contiene la
   *    cifra de hoy y la de después de la rebaja (758,98 → 721,04 · 236,22 → 224,96).
   *  · BASE V + reinversión de 150.000 + hipoteca 40.000: IRPF 1.140 + 29.508,19 × 21 % = 7336,72 €
   *    y «Tributa 35.508,19 €»; con la hipoteca «2.000.50», leída como 0, IRPF 8896,23 € (ver el
   *    CASO 66). El de la concordancia lo sujeta su fila del CASO 66 (neto 269.804,00 €).
   */
  test('CONTROL de montaje — las preparaciones de los hallazgos del 06/10 publican lo que se mide', async ({
    page,
  }) => {
    test.setTimeout(60_000);
    await abrir(page, 'madrid');
    await sembrar(page, 'Precio de la vivienda', '200000');
    const notaria = euros(await valorTarjeta(page, /^Gastos de notaría/));
    const registro = euros(await valorTarjeta(page, /^Registro de la Propiedad/));
    expect(notaria).toBeGreaterThan(700);
    expect(notaria).toBeLessThan(780);
    expect(registro).toBeGreaterThan(220);
    expect(registro).toBeLessThan(240);

    await montarBaseV(page);
    await marcarReinversion(page);
    await sembrar(page, 'Importe que reinviertes en la nueva vivienda', '150000');
    await sembrar(page, 'Hipoteca pendiente de la vivienda que vendes', '40000');
    expect(await valorTarjeta(page, /^IRPF sobre ganancia/)).toBe('7336,72 €');
    expect(await descripcionTarjeta(page, /^Ganancia patrimonial/)).toBe('Tributa 35.508,19 € tras aplicar la exención');
    await sembrar(page, 'Hipoteca pendiente de la vivienda que vendes', ILEGIBLE_0610);
    expect(await valorTarjeta(page, /^IRPF sobre ganancia/)).toBe('8896,23 €');
  });

  /**
   * HALLAZGO 2901 [medio, dato] — el MOTOR quedó REPARADO por el triaje del 11/10/2026 (a3c3ecb0:
   * REBAJA_ARANCEL_CUANTIA en data/itp-ccaa.ts, DA 8.ª RDL 8/2010), verificado aquí el 12/10/2026:
   * Madrid 200.000 → 721,04 € y 10.000.000 → 4.388,71 €, las cifras de abajo. El hallazgo siguió
   * abierto en la base por el cabo C0209 hasta el 17/10/2026, cuando se dio por REPARADO; en esta app
   * el bloque educativo y el FAQPage derivan sus rangos del motor y ya publican los de la rebaja
   * (ver el caso 584). Por eso el `test.fail` pasó a `test`: hoy es la regresión del motor.
   * Era así: la notaría no aplicaba la rebaja del 5 % del
   * nº 2.1 del Arancel de los Notarios. Vive en `calcularArancelNotarial` de data/itp-ccaa.ts y
   * alcanza a las siete apps de la familia, a «Estimar por mí», al bloque educativo y al FAQPage
   * («entre 650 € y 870 €» para 200.000 €). estimador-costes-divorcio ya la aplica con la misma
   * escala (entonces ARANCEL_NOTARIAL_DIVORCIO.rebajaEscala; desde el 12/10/2026 lee la misma
   * REBAJA_ARANCEL_CUANTIA de data/itp-ccaa.ts, cabo C0211).
   *
   * Madrid · 200.000 € · arancel (BOE, ver la cabecera de este describe):
   *   90,151816 + 24.040,49 × 4,5 ‰ (108,182205) + 30.050,60 × 1,5 ‰ (45,0759)
   *   + 90.151,82 × 1 ‰ (90,15182) + 49.746,97 × 0,5 ‰ (24,873485) = 358,435226
   *   × 0,95 (rebaja) = 340,513465 · × 1,21 (IVA) = 412,021292 · factura media × 1,75 = 721,04 €
   *   Hasta el 11/10/2026: 758,98 € (sin la rebaja, y con la base del primer tramo redondeada a
   *   90,15): +37,94 €, el 5,26 % (1/0,95).
   * Madrid · 10.000.000 € (máximo reglado, 6.010.121,04 €): 2.181,674 × 0,95 = 2.072,59026 ·
   *   × 1,21 × 1,75 = 4.388,71 €. Hasta el 11/10/2026: 4619,69 €.
   * La tolerancia (±5 €) se elige por el defecto, que es del 5 %: 38 € y 231 €.
   */
  test('HALLAZGO arancel notarial — la escala del nº 2.1 lleva la rebaja del 5 % (RD 1426/1989)', async ({
    page,
  }) => {
    const factorMedio = (FACTURA_NOTARIAL.factorMin + FACTURA_NOTARIAL.factorMax) / 2;
    await abrir(page, 'madrid');
    await sembrar(page, 'Precio de la vivienda', '200000');
    expect(euros(await valorTarjeta(page, /^Gastos de notaría/))).toBeCloseTo(340.513465 * 1.21 * factorMedio, -1);
    await sembrar(page, 'Precio de la vivienda', '10000000');
    expect(euros(await valorTarjeta(page, /^Gastos de notaría/))).toBeCloseTo(2072.59026 * 1.21 * factorMedio, -1);
  });

  /**
   * HALLAZGO 2902 [medio, dato] — el MOTOR quedó REPARADO por el triaje del 11/10/2026 (a3c3ecb0),
   * verificado aquí el 12/10/2026: Madrid 200.000 → 224,96 € y 10.000.000 → 2.518,74 €. Siguió
   * abierto por el cabo C0209 hasta el 17/10/2026 (REPARADO), como el 2901; el `test.fail` ya era `test`.
   * Era así: el registro no aplicaba la rebaja del 5 % del
   * nº 2.1 del Arancel de los Registradores, que alcanza también al tope. Vive en
   * `calcularRegistro` de data/itp-ccaa.ts y llega a las siete apps de la familia.
   *
   * Madrid · 200.000 € (BOE, ver la cabecera de este describe):
   *   24,040484 + 24.040,49 × 1,75 ‰ (42,0708575) + 30.050,60 × 1,25 ‰ (37,56325)
   *   + 90.151,82 × 0,75 ‰ (67,613865) + 49.746,97 × 0,30 ‰ (14,924091) = 186,2125475
   *   × 0,95 = 176,901920 · + 6,010121 (nº 1) + 3,005061 (nº 4) = 185,917102 · × 1,21 = 224,96 €
   *   Hasta el 11/10/2026: 236,22 €, +11,26 €.
   * Madrid · 10.000.000 € (tope 2.181,673939): × 0,95 = 2.072,590242 + 9,015182 = 2.081,605424 ·
   *   × 1,21 = 2.518,74 €. Hasta el 11/10/2026: 2650,73 €.
   * Tolerancia ±0,5 €: el defecto es de 11 € y 132 €.
   */
  test('HALLAZGO arancel registral — la escala del nº 2.1 lleva la rebaja del 5 % (RD 1427/1989)', async ({
    page,
  }) => {
    const fijos = REGISTRO_CONCEPTOS.presentacion + REGISTRO_CONCEPTOS.notaSimple;
    await abrir(page, 'madrid');
    await sembrar(page, 'Precio de la vivienda', '200000');
    expect(euros(await valorTarjeta(page, /^Registro de la Propiedad/))).toBeCloseTo((176.90192 + fijos) * 1.21, 0);
    await sembrar(page, 'Precio de la vivienda', '10000000');
    expect(euros(await valorTarjeta(page, /^Registro de la Propiedad/))).toBeCloseTo((2072.590242 + fijos) * 1.21, 0);
  });

  /**
   * HALLAZGO [bajo, contenido] — REPARADO el 06/10/2026 (hallazgo 2903; también en garaje, trastero
   * y local-comercial, que tenían la misma línea). Era así: «No descuenta los otros gastos de la venta,
   * que no se ha podido leer»: el verbo concuerda con el número de CAMPOS (`v.campos.length > 1`,
   * page.tsx, rama `v.tipo === 'menor'` de `avisoIlegiblesNeto`) y no con el sujeto, que es
   * plural. Es la regla del hallazgo 1555 (`sujetoPlural`), y la misma página escribe bien «No se
   * han podido leer los otros gastos de la venta» en la tarjeta de la ganancia.
   * BASE V + «2.000.50» en «Otros gastos de la venta (opcional)» → esperado «…, que no se han
   * podido leer» · obtenido «…, que no se ha podido leer».
   */
  test('HALLAZGO concordancia — «los otros gastos de la venta, que no se han podido leer»', async ({ page }) => {
    test.setTimeout(60_000);
    await montarBaseV(page);
    await sembrar(page, 'Otros gastos de la venta (opcional)', ILEGIBLE_0610);
    expect(await descripcionTarjeta(page, /^IMPORTE NETO VENDEDOR/)).toContain(
      'No descuenta los otros gastos de la venta, que no se han podido leer',
    );
  });

  /**
   * HALLAZGO 2904 [bajo, contenido] — ✅ REPARADO el 20/10/2026 (`veredictoBase`, el sondeo de la
   * BASE junto al «Tributa»). Era así (06/10/2026; seguía abierto el 07/10). La tarjeta de la GANANCIA publica la base
   * imponible («Tributa X € tras aplicar la exención», o «Base para IRPF» cuando no hay exención)
   * y su aviso sale del sondeo de la GANANCIA, que la reinversión y la hipoteca no mueven: con
   * cualquiera de las dos ilegible, la base publicada se mueve y la tarjeta calla (la del IRPF y la
   * del neto sí lo dicen). Son dos campos que solo tiene esta app de la familia.
   * BASE V + reinversión de 150.000:
   *   hipoteca 40.000 → obtenido 249.200 → exento 150.000 / 249.200 → base 89.200 × 99.200 /
   *     249.200 = 35.508,19 → «Tributa 35.508,19 € tras aplicar la exención» (control)
   *   hipoteca «2.000.50» → se lee 0 → base 42.934,44 → «Tributa 42.934,44 € tras aplicar la
   *     exención», sin nombrar la hipoteca ni decir que la base real es menor.
   */
  test('HALLAZGO base imponible — la tarjeta de la ganancia nombra la hipoteca ilegible que mueve su «Tributa»', async ({
    page,
  }) => {
    test.setTimeout(60_000);
    await montarBaseV(page);
    await marcarReinversion(page);
    await sembrar(page, 'Importe que reinviertes en la nueva vivienda', '150000');
    await sembrar(page, 'Hipoteca pendiente de la vivienda que vendes', ILEGIBLE_0610);
    // Antes: «Tributa 42.934,44 € tras aplicar la exención», sin nombrar nada (ver el CONTROL)
    const d = await descripcionTarjeta(page, /^Ganancia patrimonial/);
    expect(d).toContain('Tributa 42.934,44 € tras aplicar la exención');
    expect(d).toMatch(/no se ha podido leer/);
    expect(d).toContain('hipoteca');
    // La hipoteca leída como 0 deja más importe obtenido sin reinvertir: la base real es MENOR.
    expect(d).toMatch(/la base real (es|puede ser) menor/);
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// Inspector 07/10/2026 — re-verificación de la REFERENCIA tras las reparaciones del 06/10
//
// Vuelve a la cola porque su código cambió el 06/10: 05320bea (el plazo del ITP se atribuía al
// IVA), f00a18f7 (hallazgo 2903, concordancia de «que no se ha podido leer»), 9ed38781 (los
// subtítulos de los botones de transmisión a 3,36:1 por `opacity: 0.8`) y e0979382
// (components/NumberInput: el pegado con «€» o espacios se descartaba entero, y el aviso de error
// no llegaba a 4,5:1). Las cuatro, VERIFICADAS aquí con su caso original y medidas en navegador.
//
// Seguían abiertos entonces (no se registraron de nuevo): 2901 y 2902 (la rebaja del 5 % de los
// aranceles, REPARADOS el 17/10/2026) y 2904 (la «Tributa» de la ganancia y la hipoteca ilegible,
// REPARADO el 20/10/2026). Los casos que miden el cálculo no
// fijan la cifra de la notaría ni la del registro, por lo mismo que el describe del 06/10.
//
// Tres sospechas de SOSPECHAS.md (06/10): (a) la coma que falta antes de «ni» → hallazgo; (b) el
// recuadro de la comunidad con el precio ilegible → DESCARTADA (ver su caso); (c) el suelo 0 o
// negativo que «falta» → hallazgo, por el patrón 5 de la familia («no falta, no vale»).
//
// Fuentes de las cifras: ITP_CCAA (data/itp-ccaa.ts), COEFICIENTES_IIVTNU_2025 y
// PLUSVALIA_MUNICIPAL_META.tipoOrientativo (data/fiscal/inmuebles.ts), y la escala del ahorro
// TRAMOS_GANANCIAS_PATRIMONIALES_2025 (19/21/23/27/30 %) con calcularGananciaInmueble
// (data/fiscal/ganancia-inmueble.ts, arts. 35, 38 LIRPF y 41 RIRPF). Todas resueltas a mano
// ANTES de abrir la app.
// ══════════════════════════════════════════════════════════════════════════════
test.describe('Inspector 07/10/2026 — las reparaciones del 06/10 y dónde no llega el patrón de la familia', () => {
  const CAMPO_PRECIO = 'input[aria-label="Precio de la vivienda"]';
  const ILEGIBLE_0710 = '2.000.50';
  const SIN_TRANSICIONES = '*,*::before,*::after{transition:none!important;animation:none!important}';

  /** Escribe como el usuario, comprueba que el ESTADO de React lo recogió y sale del campo. */
  async function sembrar(page: Page, etiqueta: string, valor: string): Promise<void> {
    const campo = page.locator(`input[aria-label="${etiqueta}"]`);
    await campo.fill(valor);
    await esperarValorEnReact(page, campo, valor);
    await campo.blur();
  }

  /** Como quien aún no ha salido del campo: sin el blur, que acotaría el valor a su `min`. */
  async function escribirConFoco(page: Page, etiqueta: string, valor: string): Promise<void> {
    const campo = page.locator(`input[aria-label="${etiqueta}"]`);
    await campo.fill(valor);
    await esperarValorEnReact(page, campo, valor);
  }

  async function abrir(page: Page, ccaa?: string): Promise<void> {
    await page.goto(RUTA);
    await esperarHidratacion(page, [CAMPO_PRECIO]);
    if (ccaa) await page.locator('#ccaa-inmueble').selectOption(ccaa);
  }

  async function aVendedor(page: Page): Promise<void> {
    await page.getByRole('button', { name: 'Vendedor' }).click();
    await esperarHidratacion(page, ['input[aria-label="Precio de compra original"]']);
  }

  const rotulo = (page: Page, titulo: RegExp) => page.locator('h3', { hasText: titulo }).first().innerText();
  /** «1278,20 €» → 1278.2, con el parser del catálogo. */
  const euros = (texto: string): number => parseSpanishNumber(texto.replace(/\s*€\s*$/, ''));

  /**
   * BASE V (la del describe del 06/10, mismas cifras): Madrid · venta 300.000 · compra 200.000 ·
   * 10 años · suelo 60.000 · total 150.000 · comisión 3 % (de fábrica) · vivienda habitual.
   *   plusvalía 60.000 × 0,12 × 25 % = 1.800 (el real, 100.000 × 0,4 × 25 % = 10.000, no gana)
   *   comisión 9.000 · transmisión 289.200 · adquisición 200.000 · ganancia 89.200
   *   IRPF 1.140 + 9.240 + 39.200 × 23 % (9.016) = 19.396 · neto 269.804,00
   */
  async function montarBaseV(page: Page): Promise<void> {
    await abrir(page);
    await sembrar(page, 'Precio de la vivienda', '300000');
    await aVendedor(page);
    await sembrar(page, 'Precio de compra original', '200000');
    await sembrar(page, 'Años de propiedad', '10');
    await sembrar(page, 'Valor catastral del suelo', '60000');
    await sembrar(page, 'Valor catastral total (suelo + construcción)', '150000');
  }

  async function marcarReinversion(page: Page): Promise<void> {
    await page.getByRole('checkbox', { name: /Voy a reinvertir/ }).check();
    await esperarHidratacion(page, ['input[aria-label="Importe que reinviertes en la nueva vivienda"]']);
  }

  /**
   * El tema con el BOTÓN de la página, no escribiendo `data-theme`: el gestor de tema lo pisa al
   * hidratar y el test mediría dos veces el claro (reference_playwright_sembrar_localstorage_carrera).
   */
  async function ponerTema(page: Page, tema: 'light' | 'dark'): Promise<void> {
    const html = page.locator('html');
    if (tema === 'dark') {
      await page.getByRole('button', { name: /Cambiar a modo oscuro/i }).first().click();
      await expect(html).toHaveAttribute('data-theme', 'dark');
    } else {
      await expect(html).not.toHaveAttribute('data-theme', 'dark');
    }
  }

  /**
   * El contraste MÁS BAJO de los elementos visibles del selector contra su fondo COMPUESTO (las
   * capas semitransparentes, como el `rgba(46,134,171,0.1)` del botón activo, sobre la primera
   * opaca) y contando la opacidad de toda la cadena: es la que bajaba los subtítulos a 3,36:1.
   */
  async function contrasteMinimo(page: Page, selector: string): Promise<{ ratio: number; texto: string }> {
    return page.evaluate((sel) => {
      const canal = (c: number) => {
        const v = c / 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
      };
      const partes = (s: string) => (s.match(/[\d.]+/g) || []).map(Number);
      const lum = ([r, g, b]: number[]) => 0.2126 * canal(r) + 0.7152 * canal(g) + 0.0722 * canal(b);
      const mezcla = (fg: number[], bg: number[], a: number) => fg.map((c, i) => a * c + (1 - a) * bg[i]);
      let peor = { ratio: Infinity, texto: '' };
      for (const el of Array.from(document.querySelectorAll(sel))) {
        if ((el as HTMLElement).offsetParent === null) continue;
        const capas: { rgb: number[]; a: number }[] = [];
        for (let n: Element | null = el; n; n = n.parentElement) {
          const p = partes(getComputedStyle(n).backgroundColor);
          const a = p.length === 4 ? p[3] : 1;
          if (p.length >= 3 && a > 0) capas.push({ rgb: p.slice(0, 3), a });
          if (p.length >= 3 && a === 1) break;
        }
        if (!capas.length || capas[capas.length - 1].a !== 1) capas.push({ rgb: [255, 255, 255], a: 1 });
        let fondo = capas[capas.length - 1].rgb;
        for (let i = capas.length - 2; i >= 0; i--) fondo = mezcla(capas[i].rgb, fondo, capas[i].a);
        let opacidad = 1;
        for (let m: Element | null = el; m; m = m.parentElement) opacidad *= Number(getComputedStyle(m).opacity);
        const color = partes(getComputedStyle(el).color);
        const texto = mezcla(color.slice(0, 3), fondo, (color.length === 4 ? color[3] : 1) * opacidad);
        const l1 = lum(texto);
        const l2 = lum(fondo);
        const ratio = Math.round(((Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)) * 100) / 100;
        if (ratio < peor.ratio) peor = { ratio, texto: (el.textContent ?? '').trim() };
      }
      return peor;
    }, selector);
  }

  /** Las preguntas de CADA bloque FAQPage que sirve la página (JSON-LD), con su respuesta. */
  async function bloquesFaqPage(page: Page): Promise<{ pregunta: string; respuesta: string }[][]> {
    return page.evaluate(() => {
      const bloques: { pregunta: string; respuesta: string }[][] = [];
      for (const s of Array.from(document.querySelectorAll('script[type="application/ld+json"]'))) {
        const datos = JSON.parse(s.textContent || '{}');
        const grafo = datos['@graph'] ?? [datos];
        for (const nodo of grafo) {
          if (nodo['@type'] !== 'FAQPage') continue;
          bloques.push(
            (nodo.mainEntity ?? []).map((q: { name: string; acceptedAnswer: { text: string } }) => ({
              pregunta: q.name,
              respuesta: q.acceptedAnswer.text,
            })),
          );
        }
      }
      return bloques;
    });
  }
  const normaliza = (s: string) => s.replace(/\s+/g, ' ').trim();

  // ─── Las cuatro reparaciones del 06/10, con su caso original ───────────────────────────

  /**
   * REPARADO 05320bea — «El ITP o IVA+AJD debe liquidarse en … (art. 102.1 RITPAJD)»: ese artículo
   * regula el ITP y el AJD; el IVA de la obra nueva lo repercute el promotor. Y faltaba el espacio
   * tras el aviso del plazo («presentar.El incumplimiento»). Los dos sitios de la guía.
   */
  test('REPARADO 05320bea — el plazo es del ITP o, en obra nueva, del AJD, y el aviso no se pega a la frase siguiente', async ({
    page,
  }) => {
    await abrir(page);
    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
    const texto = normaliza(await page.locator('body').innerText());
    expect(texto).toContain(
      `El ITP o, en obra nueva, el AJD debe liquidarse en un plazo de ${PLAZO_ITP.dias} ${PLAZO_ITP.unidad} desde la firma (${PLAZO_ITP.baseNormativa}). ${PLAZO_ITP.aviso} El incumplimiento genera un recargo`,
    );
    expect(texto).toContain(
      `El ITP o, en obra nueva, el AJD debe pagarse en ${PLAZO_ITP.dias} ${PLAZO_ITP.unidad} desde la escritura (${PLAZO_ITP.baseNormativa})`,
    );
    expect(texto).not.toMatch(/IVA ?\+ ?AJD debe/);
    expect(texto).not.toMatch(/presentar\.\S/);
  });

  /**
   * REPARADO f00a18f7 (hallazgo 2903) — el verbo concuerda con el SUJETO (`sujetoPlural`), no con
   * el número de campos. El caso original (los otros gastos, plural con un solo campo) lo sujeta el
   * describe del 06/10; aquí, el singular y los dos a la vez sobre la BASE V:
   *   comisión «2.000.50» → se lee 0: transmisión 298.200 · ganancia 98.200 · IRPF 1.140 + 9.240 +
   *     48.200 × 23 % = 21.466 → neto 300.000 − 1.800 − 21.466 = 276.734,00
   *   y además otros gastos «2.000.50» → se leen 0: el mismo neto
   */
  test('REPARADO f00a18f7 — «que no se ha/han podido leer» concuerda con el sujeto, con uno y con dos importes', async ({
    page,
  }) => {
    test.setTimeout(60_000);
    await montarBaseV(page);
    await sembrar(page, 'Comisión inmobiliaria (%)', ILEGIBLE_0710);
    expect(await valorTarjeta(page, /^IMPORTE NETO VENDEDOR/)).toBe('276.734,00 €');
    expect(await descripcionTarjeta(page, /^IMPORTE NETO VENDEDOR/)).toContain(
      'No descuenta la comisión inmobiliaria, que no se ha podido leer (',
    );
    await sembrar(page, 'Otros gastos de la venta (opcional)', ILEGIBLE_0710);
    expect(await valorTarjeta(page, /^IMPORTE NETO VENDEDOR/)).toBe('276.734,00 €');
    expect(await descripcionTarjeta(page, /^IMPORTE NETO VENDEDOR/)).toContain(
      'No descuenta la comisión inmobiliaria ni los otros gastos de la venta, que no se han podido leer (',
    );
  });

  /**
   * REPARADO 9ed38781 — `.transmisionSub` sin `opacity: 0.8`. Medido el 07/10 con el fondo
   * compuesto: claro 4,85:1 (botón activo, #26718F sobre #EAF3F7) y 5,5:1 (inactivo); oscuro
   * 4,6:1 (activo, #3FA5D1 sobre #2A3337) y 8,03:1 (inactivo). Antes, 3,36:1.
   */
  test('REPARADO 9ed38781 — «Paga ITP» y «Paga IVA» llegan a 4,5:1 en los dos temas, con su botón activo e inactivo', async ({
    page,
  }) => {
    await abrir(page);
    await page.addStyleTag({ content: SIN_TRANSICIONES });
    for (const tema of ['light', 'dark'] as const) {
      await ponerTema(page, tema);
      for (const boton of [/Segunda mano/, /Primera mano/]) {
        await page.getByRole('button', { name: boton }).first().click();
        await page.mouse.move(0, 0); // sin :hover, que cambia el fondo del botón
        const medida = await contrasteMinimo(page, '[class*="transmisionSub"]');
        expect(medida.texto, 'el selector tiene que encontrar los subtítulos').toMatch(/^Paga /);
        await expect
          .poll(async () => (await contrasteMinimo(page, '[class*="transmisionSub"]')).ratio, {
            message: `tema ${tema}, ${boton}`,
          })
          .toBeGreaterThanOrEqual(4.5);
      }
    }
  });

  /**
   * REPARADO e0979382 (hallazgos 2916 y 2912, en components/NumberInput) — el caso original:
   * «120.000 €» pegado sobre un precio de 85.000 € se descartaba entero y la app seguía publicando
   * el desglose de 85.000 €; y el aviso de error (#E53E3E) daba 3,95:1. Aquí, con el aviso que esta
   * app pasa al control: la comisión imposible. Medido el 07/10: 5,24:1 en claro y 7,12:1 en oscuro.
   */
  test('REPARADO e0979382 — un importe pegado con «€» o con espacios entra entero, y el aviso de la comisión imposible llega a 4,5:1', async ({
    page,
  }) => {
    test.setTimeout(60_000);
    await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
    await abrir(page, 'madrid');
    const campo = page.locator(CAMPO_PRECIO);
    const pegar = async (texto: string): Promise<void> => {
      await campo.click();
      await page.keyboard.press('Control+A');
      await page.evaluate((t) => navigator.clipboard.writeText(t), texto);
      await page.keyboard.press('Control+V');
    };
    await sembrar(page, 'Precio de la vivienda', '85000');
    expect(await valorTarjeta(page, /^Precio del inmueble/)).toBe('85.000,00 €');
    await pegar('120.000 €');
    await expect(campo).toHaveValue('120.000');
    await expect.poll(() => valorTarjeta(page, /^Precio del inmueble/)).toBe('120.000,00 €');
    await pegar('95 000');
    await expect(campo).toHaveValue('95000');
    await expect.poll(() => valorTarjeta(page, /^Precio del inmueble/)).toBe('95.000,00 €');

    await aVendedor(page);
    await page.addStyleTag({ content: SIN_TRANSICIONES });
    await sembrar(page, 'Comisión inmobiliaria (%)', '150');
    await expect(page.locator('[role="alert"]').filter({ hasText: 'La comisión no puede superar el 100' })).toBeVisible();
    for (const tema of ['light', 'dark'] as const) {
      await ponerTema(page, tema);
      expect((await contrasteMinimo(page, '[class*="errorText"]')).texto).toContain('La comisión no puede superar');
      await expect
        .poll(async () => (await contrasteMinimo(page, '[class*="errorText"]')).ratio, { message: `tema ${tema}` })
        .toBeGreaterThanOrEqual(4.5);
    }
  });

  // ─── Los tres casos de esta vuelta, resueltos a mano ──────────────────────────────────

  /**
   * CASO 67 (normal) — Cataluña, segunda mano, vivienda de 750.000 €, perfil General, gestoría de
   * fábrica (300 €): el SEGUNDO tramo de la escala, que no pisaba ningún caso (el CASO 2 está en
   * 1.000.000 €, en el tercero). Y el vendedor completo con la ganancia en el tramo del 27 %.
   *
   * Comprador (ITP_CCAA.cataluna.tramosProgresivos: 10 % hasta 600.000 · 11 % hasta 900.000):
   *   ITP 600.000 × 10 % + 150.000 × 11 % = 60.000 + 16.500 = 76.500,00 € (efectivo 10,20 %)
   *   Notaría y registro: los fijan 2901 y 2902; aquí, que el total sume lo que se ve (hoy
   *   1278,20 + 417,85 → total 78.496,05 € y coste 828.496,05 €, sin parcial).
   * Vendedor: compra 450.000 · 12 años · suelo 150.000 · total 400.000 · comisión 4 % · otros
   *   gastos 2.000 · gastos de aquella compra 40.000 · vivienda habitual sin edad ni reinversión:
   *   plusvalía objetivo 150.000 × 0,09 × 25 % = 3.375 · real 300.000 × 0,375 × 25 % = 28.125 → 3.375
   *   comisión 30.000 · transmisión 750.000 − 30.000 − 2.000 − 3.375 = 714.625
   *   adquisición 450.000 + 40.000 = 490.000 · ganancia 224.625
   *   IRPF 6.000 × 19 % + 44.000 × 21 % + 150.000 × 23 % + 24.625 × 27 %
   *      = 1.140 + 9.240 + 34.500 + 6.648,75 = 51.528,75 €
   *   total 3.375 + 30.000 + 2.000 + 51.528,75 = 86.903,75 · neto 663.096,25 €
   */
  test('CASO 67 (normal) — Cataluña, 750.000 €: el segundo tramo de la escala y la ganancia en el 27 %', async ({
    page,
  }) => {
    test.setTimeout(60_000);
    expect(ITP_CCAA['cataluna'].tramosProgresivos?.slice(0, 2)).toEqual([
      { hasta: 600000, tipo: 10 },
      { hasta: 900000, tipo: 11 },
    ]);
    expect(COEFICIENTES_IIVTNU_2025.find((c) => c.anios === 12)?.coeficiente).toBe(0.09);
    expect(PLUSVALIA_MUNICIPAL_META.tipoOrientativo).toBe(25);
    expect(TRAMOS_GANANCIAS_PATRIMONIALES_2025.map((t) => t.tipo)).toEqual([19, 21, 23, 27, 30]);

    await abrir(page, 'cataluna');
    await sembrar(page, 'Precio de la vivienda', '750000');
    expect(normaliza(await rotulo(page, /^ITP/))).toBe('ITP (10,20 %)');
    expect(await valorTarjeta(page, /^ITP/)).toBe('76.500,00 €');
    expect(await valorTarjeta(page, /^Gastos de gestoría/)).toBe('300,00 €');
    const notaria = euros(await valorTarjeta(page, /^Gastos de notaría/));
    const registro = euros(await valorTarjeta(page, /^Registro de la Propiedad/));
    const total = euros(await valorTarjeta(page, /^Total gastos adicionales/));
    expect(total).toBeCloseTo(76500 + notaria + registro + 300, 2);
    expect(await rotulo(page, /^COSTE TOTAL/)).toBe('COSTE TOTAL DE ADQUISICIÓN');
    expect(euros(await valorTarjeta(page, /^COSTE TOTAL/))).toBeCloseTo(750000 + total, 2);
    // El recuadro rotula el tipo general y describe la escala (no un umbral)
    await expect(
      page.locator('[class*="infoCcaaItem"]', { hasText: 'ITP General' }).locator('[class*="infoCcaaValue"]'),
    ).toHaveText(/^10\s%$/);
    await expect(page.locator('[class*="infoCcaa"]').first()).toContainText(
      /aplica escala progresiva \(10\s%\s→\s11\s%\s→\s12\s%\s→\s13\s%\)/,
    );

    await aVendedor(page);
    await sembrar(page, 'Precio de compra original', '450000');
    await sembrar(page, 'Años de propiedad', '12');
    await sembrar(page, 'Valor catastral del suelo', '150000');
    await sembrar(page, 'Valor catastral total (suelo + construcción)', '400000');
    await sembrar(page, 'Comisión inmobiliaria (%)', '4');
    await sembrar(page, 'Otros gastos de la venta (opcional)', '2000');
    await sembrar(page, 'Impuestos y gastos que pagaste al comprar', '40000');
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('3375,00 €');
    expect(await descripcionTarjeta(page, 'Plusvalía municipal')).toBe('Método objetivo (más favorable)');
    expect(await valorTarjeta(page, 'Valor de adquisición')).toBe('490.000,00 €');
    expect(await valorTarjeta(page, 'Valor de transmisión')).toBe('714.625,00 €');
    expect(await valorTarjeta(page, /^Ganancia patrimonial/)).toBe('224.625,00 €');
    expect(await valorTarjeta(page, /^IRPF sobre ganancia/)).toBe('51.528,75 €');
    expect(await valorTarjeta(page, /^Comisión inmobiliaria/)).toBe('30.000,00 €');
    expect(await valorTarjeta(page, /^Otros gastos de la venta/)).toBe('2000,00 €');
    expect(await valorTarjeta(page, /^Total gastos vendedor/)).toBe('86.903,75 €');
    expect(await valorTarjeta(page, /^IMPORTE NETO VENDEDOR/)).toBe('663.096,25 €');
    expect(await descripcionTarjeta(page, /^IMPORTE NETO VENDEDOR/)).toBe('Lo que realmente recibes');
  });

  /**
   * CASO 68 (límite) — la reinversión del art. 38 LIRPF en su canto: reinvertir EXACTAMENTE el
   * importe obtenido (art. 41.1 RIRPF: valor de transmisión menos el principal pendiente, aquí 0)
   * y 100 € por debajo. BASE V: transmisión 289.200 · ganancia 89.200.
   *   289.200 → proporción 1 → base 0 → EXENTO · neto 300.000 − 1.800 − 9.000 = 289.200,00
   *   289.100 → proporción 289.100 / 289.200 → base 89.200 × 100 / 289.200 = 30,84 →
   *     IRPF 30,84371 × 19 % = 5,86 € · total 1.800 + 9.000 + 5,86 = 10.805,86 · neto 289.194,14
   */
  test('CASO 68 (límite) — reinvertir el importe obtenido entero (EXENTO) y 100 € menos (5,86 €)', async ({ page }) => {
    test.setTimeout(60_000);
    await montarBaseV(page);
    await marcarReinversion(page);
    await sembrar(page, 'Importe que reinviertes en la nueva vivienda', '289200');
    expect(await valorTarjeta(page, /^IRPF sobre ganancia/)).toBe('EXENTO');
    expect(await descripcionTarjeta(page, /^IRPF sobre ganancia/)).toBe(
      'Reinversión total del importe obtenido en una nueva vivienda habitual (art. 38 LIRPF)',
    );
    expect(await valorTarjeta(page, /^IMPORTE NETO VENDEDOR/)).toBe('289.200,00 €');
    expect(await descripcionTarjeta(page, /^IMPORTE NETO VENDEDOR/)).toBe('Lo que realmente recibes');

    await sembrar(page, 'Importe que reinviertes en la nueva vivienda', '289100');
    expect(await valorTarjeta(page, /^Ganancia patrimonial/)).toBe('89.200,00 €');
    expect(await descripcionTarjeta(page, /^Ganancia patrimonial/)).toBe('Tributa 30,84 € tras aplicar la exención');
    expect(await valorTarjeta(page, /^IRPF sobre ganancia/)).toBe('5,86 €');
    expect(await valorTarjeta(page, /^Total gastos vendedor/)).toBe('10.805,86 €');
    expect(await valorTarjeta(page, /^IMPORTE NETO VENDEDOR/)).toBe('289.194,14 €');
  });

  /**
   * CASO 69 (debe rechazarse) — un precio «0» no da cifras en ninguna pestaña; un valor catastral
   * del suelo «0» (o «-60000» con el foco dentro, que el blur acota a 0) no liquida plusvalía.
   * Madrid · venta 300.000 · compra 200.000 · 10 años · suelo 0, sin total:
   *   sin plusvalía: transmisión 291.000 · ganancia 91.000 (máximo) · IRPF 1.140 + 9.240 +
   *   41.000 × 23 % = 19.810 (máximo) · total 9.000 + 19.810 = 28.810 · neto 271.190,00 (PARCIAL)
   * Los IMPORTES de este caso no cambian al reparar los dos hallazgos de los mensajes de abajo.
   */
  test('CASO 69 (debe rechazarse) — un precio 0 no da cifras, y un suelo 0 o negativo no liquida plusvalía', async ({
    page,
  }) => {
    test.setTimeout(60_000);
    await abrir(page, 'madrid');
    await sembrar(page, 'Precio de la vivienda', '0');
    await expect(page.locator(CAMPO_PRECIO)).toHaveValue('0');
    await expect(page.locator('h3', { hasText: /^ITP/ })).toHaveCount(0);
    await expect(page.locator('h3', { hasText: /^COSTE TOTAL/ })).toHaveCount(0);
    await aVendedor(page);
    await expect(page.locator('h3', { hasText: /^IMPORTE NETO VENDEDOR/ })).toHaveCount(0);

    await abrir(page, 'madrid');
    await sembrar(page, 'Precio de la vivienda', '300000');
    await aVendedor(page);
    await sembrar(page, 'Precio de compra original', '200000');
    await sembrar(page, 'Años de propiedad', '10');
    await sembrar(page, 'Valor catastral del suelo', '0');
    const suelo = page.locator('input[aria-label="Valor catastral del suelo"]');
    for (const paso of ['suelo 0', 'suelo -60000 con el foco'] as const) {
      if (paso === 'suelo -60000 con el foco') await escribirConFoco(page, 'Valor catastral del suelo', '-60000');
      expect(await valorTarjeta(page, 'Plusvalía municipal'), paso).toBe('Sin calcular');
      expect(await valorTarjeta(page, /^Ganancia patrimonial/), paso).toBe('91.000,00 €');
      expect(await valorTarjeta(page, /^IRPF sobre ganancia/), paso).toBe('19.810,00 €');
      expect(await valorTarjeta(page, /^Total gastos vendedor/), paso).toBe('28.810,00 €');
      expect(await valorTarjeta(page, /^IMPORTE NETO VENDEDOR/), paso).toBe('271.190,00 €');
      expect(await rotulo(page, /^IMPORTE NETO VENDEDOR/), paso).toBe('IMPORTE NETO VENDEDOR (PARCIAL)');
      expect(await descripcionTarjeta(page, /^IMPORTE NETO VENDEDOR/), paso).toContain(
        'el neto real puede ser menor que este',
      );
    }
    await suelo.blur();
    await expect(suelo).toHaveValue('0');
  });

  /**
   * SOSPECHA (b) de SOSPECHAS.md — DESCARTADA el 07/10/2026. «Con el precio ilegible, el recuadro
   * de la comunidad rotula el tipo del precio 0 (Valencia 9 %) aunque el panel se abstiene.» Es
   * cierto, y es lo mismo que rotula con el campo VACÍO: el recuadro no publica ninguna cifra de
   * la operación, sino el tipo general de la comunidad, y justo debajo dice en qué dirección se
   * mueve («si el valor supera 1.000.000 € pasa al 11 % sobre TODO el valor»). El precio ilegible
   * ya lo nombra el panel, que no calcula nada con él. Se fija aquí para que un cambio lo diga.
   */
  test('SOSPECHA (b) descartada — con el precio ilegible, el recuadro de Valencia da el tipo general y la regla del umbral', async ({
    page,
  }) => {
    await abrir(page, 'valencia');
    const tipoRecuadro = page
      .locator('[class*="infoCcaaItem"]', { hasText: 'ITP General' })
      .locator('[class*="infoCcaaValue"]');
    await sembrar(page, 'Precio de la vivienda', '1.500.000.50');
    await expect(page.getByText('No se ha podido leer el precio «1.500.000.50»')).toBeVisible();
    await expect(page.locator('h3', { hasText: /^ITP/ })).toHaveCount(0);
    await expect(tipoRecuadro).toHaveText(/^9\s%$/);
    await expect(page.locator('[class*="infoCcaa"]').first()).toContainText(
      /si el valor supera 1\.000\.000\s€\spasa al 11\s%\ssobre TODO el valor/,
    );
    await sembrar(page, 'Precio de la vivienda', '1500000');
    await expect(tipoRecuadro).toHaveText(/^11\s%$/);
  });

  // ─── HALLAZGOS de esta vuelta (test.fail: se ponen en rojo al repararse) ────────────────

  /**
   * HALLAZGO [bajo, contenido] — ✅ REPARADO el 08/10/2026 (2958), la sospecha (a). Al inciso explicativo «que
   * no se ha podido leer» le falta la coma de cierre antes de «ni», y la frase se lee como si
   * tampoco se hubiera podido leer la parte libre de la notaría. Se compone con `.join(' ni ')`
   * (page.tsx, descripción de «COSTE TOTAL (PARCIAL)»).
   * Madrid · 7.000.000 € · gestoría «2.000.50» → esperado «No incluye la gestoría, que no se ha
   * podido leer, ni la parte de la notaría que excede de 6.010.121,04 €, que es de libre acuerdo:
   * el coste real será mayor» · obtenido «…que no se ha podido leer ni la parte de la notaría…».
   */
  test('HALLAZGO coma — «la gestoría, que no se ha podido leer, ni la parte de la notaría…»', async ({ page }) => {
    await abrir(page, 'madrid');
    await sembrar(page, 'Precio de la vivienda', '7000000');
    await sembrar(page, 'Gastos de gestoría del comprador (€)', ILEGIBLE_0710);
    expect(await descripcionTarjeta(page, /^COSTE TOTAL/)).toContain(
      'No incluye la gestoría, que no se ha podido leer, ni la parte de la notaría que excede de 6.010.121,04 €',
    );
  });

  /**
   * HALLAZGO [bajo, contenido] — ✅ REPARADO el 08/10/2026 (2959, `escritoNoValido`), la sospecha (c). Patrón 5 de la familia
   * («no falta, no vale»): un suelo ESCRITO, legible e imposible se anuncia como si faltara. La
   * misma tarjeta ya dice «el precio de compra original tiene que ser mayor que 0» (hallazgo
   * 1799) y «los años de tenencia no pueden ser negativos» (1552); el suelo, que es el tercer dato
   * de la plusvalía, sigue en «falta» (`faltaValorSuelo: !(valorSuelo > 0)`). El CASO L de garaje
   * fija el mismo texto para «-5000»: es de antes del patrón 5.
   * Madrid · venta 300.000 · compra 200.000 · 10 años · suelo «0» (o «-60000» con el foco) →
   * esperado: que diga que el valor escrito no vale y pida corregirlo · obtenido «Falta el valor
   * catastral del suelo. Este impuesto NO está incluido…» y «Rellena el valor catastral del suelo
   * para obtenerlo», con el 0 a la vista. Los importes los sujeta el CASO 69.
   */
  test('HALLAZGO patrón 5 — un valor catastral del suelo 0 o negativo no «falta»: no vale', async ({ page }) => {
    test.setTimeout(60_000);
    await abrir(page, 'madrid');
    await sembrar(page, 'Precio de la vivienda', '300000');
    await aVendedor(page);
    await sembrar(page, 'Precio de compra original', '200000');
    await sembrar(page, 'Años de propiedad', '10');
    await sembrar(page, 'Valor catastral del suelo', '0');
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('Sin calcular');
    expect(await descripcionTarjeta(page, 'Plusvalía municipal')).not.toContain('Falta el valor catastral del suelo');
    expect(await descripcionTarjeta(page, /^IMPORTE NETO VENDEDOR/)).not.toContain('Rellena el valor catastral del suelo');
    // Y en positivo: lo nombra como no válido y pide corregirlo, como el precio de compra 0.
    expect(await descripcionTarjeta(page, 'Plusvalía municipal')).toContain('El valor catastral del suelo tiene que ser mayor que 0');
    expect(await descripcionTarjeta(page, /^IMPORTE NETO VENDEDOR/)).toContain('Corrige el valor catastral del suelo (tiene que ser mayor que 0) para obtenerlo.');
    await escribirConFoco(page, 'Valor catastral del suelo', '-60000');
    expect(await descripcionTarjeta(page, 'Plusvalía municipal')).not.toContain('Falta el valor catastral del suelo');
    expect(await descripcionTarjeta(page, 'Plusvalía municipal')).toContain('tiene que ser mayor que 0');
  });

  /**
   * HALLAZGO [bajo, contenido] — ✅ REPARADO el 08/10/2026 (2960, `avisoEscritoNoValido`). El mismo patrón 5, en el PRECIO de la
   * propia referencia: con «0» escrito (o «-250000» con el foco, que el blur acota a 0) los dos
   * paneles piden «Introduce el precio…». Solar, nave y terreno rústico ya lo dicen bien —«El precio
   * escrito («0») tiene que ser mayor que 0: corrígelo…», con el comentario «hallazgo 1799 en la
   * referencia»—, pero la referencia no lo aplicó a su propio precio (ni garaje, trastero y local).
   * Madrid · precio «0» → esperado: que nombre el 0 escrito como no válido · obtenido «Introduce el
   * precio del inmueble para ver el desglose de gastos del comprador» (y en Vendedor, «Introduce el
   * precio de venta y los datos adicionales…»). Al repararlo cambian los textos de los CASOS C y 35.
   */
  test('HALLAZGO patrón 5 — un precio «0» escrito no se pide como si faltara', async ({ page }) => {
    await abrir(page, 'madrid');
    await sembrar(page, 'Precio de la vivienda', '0');
    await expect(page.locator(CAMPO_PRECIO)).toHaveValue('0');
    await expect(page.locator('[class*="placeholder"] p').first()).toBeVisible();
    await expect(page.getByText('Introduce el precio del inmueble para ver el desglose de gastos del comprador')).toHaveCount(0);
    await expect(page.getByText('El precio escrito («0») tiene que ser mayor que 0: corrígelo para ver el desglose de gastos del comprador.')).toHaveCount(1);
    await aVendedor(page);
    await expect(page.getByText('Introduce el precio de venta y los datos adicionales')).toHaveCount(0);
    await expect(page.getByText('El precio de venta escrito («0») tiene que ser mayor que 0: corrígelo para calcular el neto del vendedor.')).toHaveCount(1);
  });

  /**
   * HALLAZGO [bajo, contenido] — ✅ REPARADO el 20/10/2026 (2961). Concordancia de género en un campo que SOLO
   * tiene esta app de la familia (las mejoras): la descripción del valor de adquisición cierra
   * siempre con «y no están sumados», también cuando lo ilegible son «las mejoras».
   * BASE V + mejoras «2.000.50» → esperado «… no se han podido leer las mejoras, y no están
   * sumadas» · obtenido «Precio de compra y lo que se lee: no se han podido leer las mejoras, y no
   * están sumados». Con «los impuestos y gastos de aquella compra», o con los dos, está bien.
   */
  test('HALLAZGO concordancia — «las mejoras … no están sumadas»', async ({ page }) => {
    test.setTimeout(60_000);
    await montarBaseV(page);
    await sembrar(page, 'Inversiones y mejoras (opcional)', ILEGIBLE_0710);
    expect(await valorTarjeta(page, 'Valor de adquisición')).toBe('200.000,00 €');
    const d = await descripcionTarjeta(page, 'Valor de adquisición');
    expect(d).toContain('las mejoras');
    expect(d).not.toContain('las mejoras, y no están sumados');
    expect(d).toContain('las mejoras, y no están sumadas');
  });

  /**
   * HALLAZGO [bajo, contenido] — ✅ REPARADO el 20/10/2026 (2962, `porcentajeExentoParcial`: «más del
   * 99,9 %» y «menos del 0,1 %» en los cantos). El motivo de la reinversión PARCIAL redondeaba
   * la proporción exenta a una décima (`formatNumber(proporcionReinvertida * 100, 1)`,
   * data/fiscal/ganancia-inmueble.ts), así que en los dos cantos se contradice con la cuota de al
   * lado: «Reinversión parcial: exento el 100,0 %» con 5,86 € de IRPF, y «exento el 0,0 %» con una
   * parte exenta de 30,84 €. BASE V (transmisión 289.200, ganancia 89.200):
   *   reinversión 289.100 → exento el 99,965 % → esperado un porcentaje por debajo de 100 (o que no
   *     diga «100,0 %» junto a una cuota) · obtenido «Reinversión parcial: exento el 100,0 % de la
   *     ganancia (art. 41 RIRPF)» con IRPF 5,86 € y «Tributa 30,84 €»
   *   reinversión 100 → exento el 0,035 % → obtenido «exento el 0,0 % de la ganancia» con «Tributa
   *     89.169,16 €» (30,84 € exentos)
   */
  test('HALLAZGO redondeo — la reinversión parcial no puede decir «exento el 100,0 %» con cuota, ni «el 0,0 %» con parte exenta', async ({
    page,
  }) => {
    test.setTimeout(60_000);
    await montarBaseV(page);
    await marcarReinversion(page);
    await sembrar(page, 'Importe que reinviertes en la nueva vivienda', '289100');
    let d = await descripcionTarjeta(page, /^IRPF sobre ganancia/);
    expect(d).toContain('Reinversión parcial');
    expect(d).not.toContain('exento el 100,0 %');
    expect(d).toContain('exento más del 99,9 % de la ganancia');
    await sembrar(page, 'Importe que reinviertes en la nueva vivienda', '100');
    d = await descripcionTarjeta(page, /^IRPF sobre ganancia/);
    expect(d).toContain('Reinversión parcial');
    expect(d).not.toContain('exento el 0,0 %');
    expect(d).toContain('exento menos del 0,1 % de la ganancia');
  });

  /**
   * HALLAZGO [bajo, contenido] — ✅ REPARADO el 20/10/2026 (2963): `jsonLd` es solo el
   * WebApplication y las preguntas de la guía pasan a `faqJsonLd`, salvo dos que repetían otra. Era
   * así (07/10/2026). La página sirve DOS FAQPage: `jsonLd`
   * combina el WebApplication con uno de 9 preguntas (generateFAQSchema) y el layout inyecta además
   * `faqJsonLd`, con 5. Es el hallazgo 846 de garaje («UN solo FAQPage por URL»), reparado allí y
   * presente ya en las seis hermanas, que sirven uno: no llegó a la referencia.
   * curl /estimador-compraventa-inmueble/ → esperado 1 bloque FAQPage · obtenido 2 (9 + 5).
   */
  test('HALLAZGO — la página sirve un solo FAQPage, como sus seis hermanas', async ({ page }) => {
    await page.goto(RUTA);
    const bloques = await bloquesFaqPage(page);
    expect(bloques.length).toBe(1);
    // Las 5 de faqJsonLd + 8 de la guía (9 menos la que repetía otra con otras palabras), sin
    // ninguna pregunta dos veces.
    const preguntas = bloques[0].map((q) => q.pregunta);
    expect(preguntas).toHaveLength(13);
    expect(new Set(preguntas).size).toBe(13);
    expect(preguntas).not.toContain('¿Qué paga el vendedor de una vivienda?');
    expect(preguntas).toContain('¿Cuándo no se paga plusvalía municipal?');
    expect(preguntas).toContain('¿Qué son los tipos reducidos de ITP y cómo acceder a ellos?');
  });

  /**
   * REPARADO (21/10/2026, cabo C0349, la forma del 3402 de local-comercial). El FAQPage «¿Qué
   * impuestos paga el vendedor al vender un inmueble?» y la tarjeta «IRPF del vendedor» de la guía
   * daban la ganancia patrimonial del ahorro como la renta de todo vendedor, mientras la pestaña
   * Vendedor dice desde 616e5fc8 (AVISO_VENTA_PROMOTOR) que en obra nueva vende el promotor, cuya
   * renta es de actividad económica (art. 27.1 LIRPF) o del Impuesto sobre Sociedades.
   */
  test('REPARADO (C0349): el FAQPage y la guía del vendedor llevan la salvedad del promotor', async ({ page }) => {
    await page.goto(RUTA);
    const [faq] = await bloquesFaqPage(page);
    const vendedor = faq.find((q) => q.pregunta === '¿Qué impuestos paga el vendedor al vender un inmueble?');
    expect(vendedor, 'la pregunta del vendedor sigue en el FAQPage').toBeTruthy();
    expect(vendedor!.respuesta).toContain('vende el promotor');
    expect(vendedor!.respuesta).toContain('art. 27.1 LIRPF');
    const tarjeta = page.locator('h4', { hasText: 'IRPF del vendedor' }).locator('..');
    await expect(tarjeta).toContainText('vende el promotor', { useInnerText: false });
    await expect(tarjeta).toContainText('art. 27.1 LIRPF', { useInnerText: false });
  });

  /**
   * HALLAZGO [bajo, contenido] — REPARADO el 08/10/2026 (2964). Era así (07/10/2026): «¿Qué son los tipos reducidos de ITP y cómo
   * acceder a ellos?» estaba en la FAQ visible y en el FAQPage de `jsonLd` con dos redacciones (la del
   * FAQPage resume la visible: mete la edad entre paréntesis y omite el panel de la calculadora). Es
   * la única de las siete preguntas compartidas que diverge; las otras seis son idénticas, y dos de
   * ellas ya salen de una constante de metadata.ts (PREGUNTA/RESPUESTA_NO_SUJECION y _QUIEN_PAGA).
   */
  // REPARADO el 08/10/2026 (2964): PREGUNTA_/RESPUESTA_TIPOS_REDUCIDOS en metadata.ts.
  test('HALLAZGO — la FAQ visible y el FAQPage responden lo mismo a «¿Qué son los tipos reducidos de ITP…?»', async ({
    page,
  }) => {
    const PREGUNTA = '¿Qué son los tipos reducidos de ITP y cómo acceder a ellos?';
    await abrir(page);
    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
    const visible = normaliza(
      await page.locator('h4', { hasText: PREGUNTA }).locator('xpath=following-sibling::p[1]').innerText(),
    );
    const enJsonLd = (await bloquesFaqPage(page)).flat().filter((q) => q.pregunta === PREGUNTA);
    expect(enJsonLd.length).toBeGreaterThan(0);
    for (const q of enJsonLd) expect(normaliza(q.respuesta)).toBe(visible);
  });

  /**
   * HALLAZGO 2965 [bajo, operativa] — ✅ REPARADO el 20/10/2026 (components/NumberInput), con la
   * decisión del usuario: el texto pegado se queda tal cual y la app lo nombra como ilegible, sin
   * adivinar la cifra. Una tecla suelta que haría ilegible un valor legible se sigue rechazando, y
   * las letras pegadas se pueden borrar una a una. Era así: el residuo del 2916 que e0979382 dejó a
   * propósito («las letras se siguen rechazando, como al teclear»): un importe pegado con la
   * palabra «euros» o «EUR» se descarta ENTERO y en silencio, y la app sigue publicando el desglose
   * del precio anterior. Al teclear, cada letra rechazada es una tecla y se ve; al pegar se pierde
   * todo sin una palabra, que es justo lo que el CLAUDE.md global §5 prohíbe («nunca bloquear el
   * pegado en un input»). Vive en components/NumberInput, así que alcanza a todo el catálogo.
   * Madrid · precio 85.000 · pegar «120.000 euros» → esperado: el campo deja de decir 85000 (lo lee
   * o lo nombra como ilegible) · obtenido: el campo sigue en «85000» y «Precio del inmueble
   * 85.000,00 €». Lo mismo con «EUR 120.000».
   */
  test('HALLAZGO 2965 — «120.000 euros» pegado no se descarta en silencio: se queda y se nombra', async ({ page }) => {
    await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
    await abrir(page, 'madrid');
    const campo = page.locator(CAMPO_PRECIO);
    const pegar = async (texto: string) => {
      await campo.click();
      await page.keyboard.press('Control+A');
      await page.evaluate((t) => navigator.clipboard.writeText(t), texto);
      await page.keyboard.press('Control+V');
    };
    await sembrar(page, 'Precio de la vivienda', '85000');
    await pegar('120.000 euros');
    await expect(campo).toHaveValue('120.000 euros', { timeout: 3000 });
    // El desglose de 85.000 ya no se publica: la app dice que no ha podido leer lo pegado.
    await expect(page.getByText('No se ha podido leer el precio «120.000 euros»').first()).toBeVisible();
    await expect(page.locator('h3', { hasText: 'Precio del inmueble' })).toHaveCount(0);

    await pegar('EUR 120.000');
    await expect(campo).toHaveValue('EUR 120.000', { timeout: 3000 });

    // Las letras pegadas se borran una a una, y al quedar solo la cifra vuelve a leerse.
    await campo.press('End');
    await pegar('120.000 euros');
    await campo.press('End');
    // Cinco, no seis: con «120.000 » el texto ya casa y el espacio se limpia solo.
    for (let i = 0; i < 'euros'.length; i++) await campo.press('Backspace');
    await expect(campo).toHaveValue('120.000');
    await expect(page.getByText('No se ha podido leer el precio').first()).toHaveCount(0);

    // Una tecla suelta que haría ilegible un valor legible se sigue rechazando, como siempre.
    await campo.press('End');
    await page.keyboard.type('x');
    await expect(campo).toHaveValue('120.000');
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// Inspector 07/10/2026 — los mismos casos en un móvil de 390 px (Pixel 7)
// ══════════════════════════════════════════════════════════════════════════════
test.describe('Inspector 07/10/2026 — 390 px', () => {
  test.use({
    viewport: { width: 390, height: 844 },
    userAgent:
      'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  });

  async function sembrar(page: Page, etiqueta: string, valor: string): Promise<void> {
    const campo = page.locator(`input[aria-label="${etiqueta}"]`);
    await campo.fill(valor);
    await esperarValorEnReact(page, campo, valor);
    await campo.blur();
  }

  /**
   * CASO 67 en móvil (cifras a mano en el describe de arriba): el ITP de 750.000 € en Cataluña, el
   * neto del vendedor y que nada desborde en horizontal, que en 390 px obligaría a desplazar para
   * leer una cifra.
   */
  test('CASO 67 en 390 px — Cataluña, 750.000 €: ITP 76.500,00 € y neto 663.096,25 €, sin desbordar', async ({
    page,
  }) => {
    test.setTimeout(60_000);
    await page.goto(RUTA);
    await esperarHidratacion(page, ['input[aria-label="Precio de la vivienda"]']);
    await page.locator('#ccaa-inmueble').selectOption('cataluna');
    await sembrar(page, 'Precio de la vivienda', '750000');
    expect(await valorTarjeta(page, /^ITP/)).toBe('76.500,00 €');
    await page.getByRole('button', { name: 'Vendedor' }).click();
    await esperarHidratacion(page, ['input[aria-label="Precio de compra original"]']);
    await sembrar(page, 'Precio de compra original', '450000');
    await sembrar(page, 'Años de propiedad', '12');
    await sembrar(page, 'Valor catastral del suelo', '150000');
    await sembrar(page, 'Valor catastral total (suelo + construcción)', '400000');
    await sembrar(page, 'Comisión inmobiliaria (%)', '4');
    await sembrar(page, 'Otros gastos de la venta (opcional)', '2000');
    await sembrar(page, 'Impuestos y gastos que pagaste al comprar', '40000');
    expect(await valorTarjeta(page, /^IMPORTE NETO VENDEDOR/)).toBe('663.096,25 €');
    const sobra = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(sobra).toBeLessThanOrEqual(0);
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// Inspector 08/10/2026 — la pestaña Vendedor no mira la comunidad
// ══════════════════════════════════════════════════════════════════════════════
//
// Re-inspección de la REFERENCIA de la familia tras 99e1ee7e (las relacionadas ya no viajan en el
// barrel: page.tsx pinta <RelatedApps /> sin prop y layout.tsx monta <ConRelacionadas slug>). Se
// buscó donde la familia no había mirado: lo que pasa en la pestaña Vendedor cuando el inmueble
// está en Ceuta, Melilla, Navarra o el País Vasco. `resultadosVendedor` no depende de `ccaa` (no
// está en sus dependencias) y `calcularPlusvaliaMunicipal` (data/itp-ccaa.ts) no la recibe: el
// vendedor de Madrid y el de Ceuta, Melilla, Navarra o el País Vasco salen con las MISMAS cifras.
//
// Normas leídas en el BOE (API de legislación consolidada) en esta sesión:
//  · TRLRHL (BOE-A-2004-4214), art. 1.2: «Esta ley se aplicará en todo el territorio nacional, sin
//    perjuicio de los regímenes financieros forales de los Territorios Históricos del País Vasco y
//    Navarra». Art. 159.2 (Ceuta y Melilla): «Las cuotas tributarias correspondientes a los impuestos
//    municipales regulados en esta ley serán objeto de una bonificación del 50 por ciento».
//  · LIRPF (BOE-A-2006-20764), art. 68.4: 1.º.a) residentes en Ceuta o Melilla y 2.º no residentes
//    «se deducirán el 60 por ciento de la parte de la suma de las cuotas íntegras estatal y
//    autonómica que proporcionalmente corresponda a las rentas […] obtenidas en Ceuta o Melilla»;
//    3.º.d) son rentas obtenidas allí «Las ganancias patrimoniales que procedan de bienes inmuebles
//    radicados en Ceuta o Melilla» (la exclusión del 2.º solo alcanza a las letras a, e e i).
//  · Concierto Económico, Ley 12/2002 (BOE-A-2002-9969), art. 6.Uno: el IRPF «es un tributo
//    concertado de normativa autónoma. Su exacción corresponderá a la Diputación Foral […] cuando el
//    contribuyente tenga su residencia habitual en el País Vasco»; art. 42: los Territorios
//    Históricos «podrán mantener, establecer y regular […] el régimen tributario de otros tributos
//    propios de las Entidades locales».
//  · Convenio Económico, Ley 28/1990 (BOE-A-1990-31117, redacción de la Ley 25/2003), art. 1:
//    «Navarra tiene potestad para mantener, establecer y regular su propio régimen tributario»;
//    art. 9.1: la exacción del IRPF de quien tenga su residencia habitual en Navarra; arts. 48-49:
//    Haciendas Locales de Navarra.
//  · Ley Foral 2/1995, de Haciendas Locales de Navarra (BOE-A-1995-16401), art. 175.2 en la
//    redacción del art. 8.2 de la Ley Foral 17/2025 (BOE-A-2026-3910, vigente desde el 01/01/2026):
//    coeficiente máximo de 10 años = 0,58 (el art. 107.4 TRLRHL da 0,12); art. 176.2: tipo máximo
//    del 25 %, que es también el tipo orientativo de la app (PLUSVALIA_MUNICIPAL_META).
//
// Seguían abiertos entonces y NO se registraron de nuevo: 2901, 2902, 2904 y 2958 a 2965. [Todos
// REPARADOS: 2958, 2959, 2960 y 2964 el 08/10; 2901 y 2902 el 17/10; 2904, 2961, 2962, 2963 y 2965
// el 20/10/2026. Al 21/10/2026 la base no tiene ninguno abierto y sus casos ya no son test.fail.]
test.describe('Inspector 08/10/2026 — Ceuta, Melilla y los territorios forales en la pestaña Vendedor', () => {
  const CAMPO_PRECIO = 'input[aria-label="Precio de la vivienda"]';

  /** Escribe como el usuario, comprueba que el ESTADO de React lo recogió y sale del campo. */
  async function sembrar(page: Page, etiqueta: string, valor: string): Promise<void> {
    const campo = page.locator(`input[aria-label="${etiqueta}"]`);
    await campo.fill(valor);
    await esperarValorEnReact(page, campo, valor);
    await campo.blur();
  }

  async function abrir(page: Page, ccaa?: string): Promise<void> {
    await page.goto(RUTA);
    await esperarHidratacion(page, [CAMPO_PRECIO]);
    if (ccaa) await page.locator('#ccaa-inmueble').selectOption(ccaa);
  }

  async function aVendedor(page: Page): Promise<void> {
    await page.getByRole('button', { name: 'Vendedor' }).click();
    await esperarHidratacion(page, ['input[aria-label="Precio de compra original"]']);
  }

  /** «8868,00 €» → 8868, con el parser del catálogo. */
  const euros = (texto: string): number => parseSpanishNumber(texto.replace(/\s*€\s*$/, ''));
  const normaliza = (s: string) => s.replace(/ /g, ' ').replace(/\s+/g, ' ').trim();

  /**
   * VENDEDOR A: venta 200.000 · compra 150.000 · 10 años · suelo 40.000 · sin valor catastral
   * total · comisión 3 % (de fábrica) · vivienda habitual (de fábrica), sin edad ni reinversión.
   */
  async function montarVendedorA(page: Page, ccaa: string): Promise<void> {
    await abrir(page, ccaa);
    await sembrar(page, 'Precio de la vivienda', '200000');
    await aVendedor(page);
    await sembrar(page, 'Precio de compra original', '150000');
    await sembrar(page, 'Años de propiedad', '10');
    await sembrar(page, 'Valor catastral del suelo', '40000');
  }

  /** VENDEDOR B: venta 300.000 · compra 200.000 · 10 años · suelo 60.000, el resto de fábrica. */
  async function montarVendedorB(page: Page, ccaa: string): Promise<void> {
    await abrir(page, ccaa);
    await sembrar(page, 'Precio de la vivienda', '300000');
    await aVendedor(page);
    await sembrar(page, 'Precio de compra original', '200000');
    await sembrar(page, 'Años de propiedad', '10');
    await sembrar(page, 'Valor catastral del suelo', '60000');
  }

  /** Las respuestas de todos los FAQPage servidos (la página sirve dos: hallazgo 2963). */
  async function respuestasFaqPage(page: Page): Promise<string[]> {
    const crudos = await page.locator('script[type="application/ld+json"]').allTextContents();
    const respuestas: string[] = [];
    for (const crudo of crudos) {
      const datos = JSON.parse(crudo);
      for (const nodo of datos['@graph'] ?? [datos]) {
        if (nodo['@type'] !== 'FAQPage') continue;
        for (const q of nodo.mainEntity ?? []) respuestas.push(normaliza(q.acceptedAnswer.text));
      }
    }
    return respuestas;
  }

  /**
   * CASO 70 (normal) — Ceuta COMPRA bien y el mismo vendedor en MADRID (régimen común) sale bien.
   *
   * Comprador, Ceuta · segunda mano · vivienda de 200.000 € · General · gestoría 300 (de fábrica):
   *   ITP 6 % (ITP_CCAA.ceuta.tipoGeneral) con la bonificación del 50 % del art. 57 bis TRLITPAJD
   *   → 3 % → 6000,00 € («ITP (3,00 %)»). Notaría y registro sin IPSI (hallazgo 2214); el total suma
   *   lo que se ve y se rotula «(PARCIAL)» porque falta el IPSI de esas dos facturas.
   * Vendedor A en Madrid, a mano con COEFICIENTES_IIVTNU_2025 (10 años = 0,12),
   * PLUSVALIA_MUNICIPAL_META.tipoOrientativo (25 %) y TRAMOS_GANANCIAS_PATRIMONIALES_2025:
   *   plusvalía 40.000 × 0,12 × 25 % = 1.200 · comisión 6.000 · transmisión 192.800
   *   adquisición 150.000 · ganancia 42.800 · IRPF 6.000 × 19 % + 36.800 × 21 % = 1.140 + 7.728 = 8.868
   *   total 1.200 + 6.000 + 8.868 = 16.068 · neto 183.932,00
   */
  test('CASO 70 (normal) — Ceuta compra al 3 % y el vendedor A en Madrid: 1200,00 · 8868,00 · 183.932,00', async ({
    page,
  }) => {
    test.setTimeout(90_000);
    expect(ITP_CCAA['ceuta'].tipoGeneral).toBe(6);
    expect(COEFICIENTES_IIVTNU_2025.find((c) => c.anios === 10)?.coeficiente).toBe(0.12);
    expect(PLUSVALIA_MUNICIPAL_META.tipoOrientativo).toBe(25);
    expect(TRAMOS_GANANCIAS_PATRIMONIALES_2025.slice(0, 2)).toEqual([
      { hasta: 6000, tipo: 19 },
      { hasta: 50000, tipo: 21 },
    ]);

    await abrir(page, 'ceuta');
    await sembrar(page, 'Precio de la vivienda', '200000');
    await expect(page.locator('h3', { hasText: /^ITP/ }).first()).toHaveText('ITP (3,00 %)');
    expect(await valorTarjeta(page, /^ITP/)).toBe('6000,00 €');
    const notaria = euros(await valorTarjeta(page, /^Gastos de notaría/));
    const registro = euros(await valorTarjeta(page, /^Registro de la Propiedad/));
    const total = euros(await valorTarjeta(page, /^Total gastos adicionales/));
    expect(total).toBeCloseTo(6000 + notaria + registro + 300, 2);
    await expect(page.locator('h3', { hasText: /^COSTE TOTAL/ }).first()).toHaveText('COSTE TOTAL (PARCIAL)');

    await montarVendedorA(page, 'madrid');
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('1200,00 €');
    expect(await valorTarjeta(page, 'Valor de transmisión')).toBe('192.800,00 €');
    expect(await valorTarjeta(page, /^Ganancia patrimonial/)).toBe('42.800,00 €');
    expect(await valorTarjeta(page, /^IRPF sobre ganancia/)).toBe('8868,00 €');
    expect(await valorTarjeta(page, /^Total gastos vendedor/)).toBe('16.068,00 €');
    expect(await valorTarjeta(page, /^IMPORTE NETO VENDEDOR/)).toBe('183.932,00 €');
    expect(await descripcionTarjeta(page, /^IMPORTE NETO VENDEDOR/)).toBe('Lo que realmente recibes');
  });

  /**
   * CONTROL de montaje de los hallazgos del CASO 71 — va en VERDE, antes y después de repararlos.
   * Exige solo lo que no depende del régimen: la comisión y el valor de adquisición de los dos
   * vendedores, y que el comprador de Ceuta paga el ITP y el AJD a la mitad (lo que los rangos del
   * hallazgo de abajo no contienen). Si un montaje deja de valer, cae aquí y no dentro de un fallo
   * esperado.
   *   A en Ceuta: comisión 200.000 × 3 % = 6000,00 · adquisición 150.000,00
   *   B en Navarra: comisión 300.000 × 3 % = 9000,00 · adquisición 200.000,00
   *   Ceuta · local · primera mano · 200.000: AJD 0,5 % (ITP_CCAA.ceuta.ajd) × 50 % (art. 57 bis.1
   *   TRLITPAJD) = 0,25 % → 500,00 €
   */
  test('CONTROL de montaje — vendedores A (Ceuta) y B (Navarra), y el 3 % y el 0,25 % que cobra Ceuta', async ({
    page,
  }) => {
    test.setTimeout(90_000);
    await montarVendedorA(page, 'ceuta');
    expect(await valorTarjeta(page, /^Comisión inmobiliaria/)).toBe('6000,00 €');
    expect(await valorTarjeta(page, 'Valor de adquisición')).toBe('150.000,00 €');
    await expect(page.locator('h3', { hasText: 'Plusvalía municipal' })).toHaveCount(1);
    await expect(page.locator('h3', { hasText: /^IRPF sobre ganancia/ })).toHaveCount(1);

    await montarVendedorB(page, 'navarra');
    expect(await valorTarjeta(page, /^Comisión inmobiliaria/)).toBe('9000,00 €');
    expect(await valorTarjeta(page, 'Valor de adquisición')).toBe('200.000,00 €');

    expect(ITP_CCAA['ceuta'].ajd).toBe(0.5);
    await abrir(page, 'ceuta');
    await page.getByRole('button', { name: /Local comercial/ }).click();
    await page.getByRole('button', { name: /Primera mano/ }).click();
    await sembrar(page, 'Precio del inmueble', '200000');
    await expect(page.locator('h3', { hasText: /^AJD/ }).first()).toHaveText('AJD (0,25 %)');
    expect(await valorTarjeta(page, /^AJD/)).toBe('500,00 €');
  });

  // ─── HALLAZGOS de esta vuelta (test.fail: se ponen en rojo al repararse) ────────────────

  /**
   * HALLAZGO [alto, calculo] — ✅ REPARADO el 10/10/2026 (3069, decisión del usuario con la cita del art. 159.2 TRLRHL). CASO 71 (límite: régimen especial). La
   * plusvalía municipal de un inmueble en Ceuta o Melilla no lleva la bonificación del 50 % del art.
   * 159.2 TRLRHL. `calcularPlusvaliaMunicipal` (data/itp-ccaa.ts) no recibe la comunidad, así que
   * alcanza a toda pestaña Vendedor de la familia; el motor sí aplica la bonificación «por el SITIO»
   * al ITP y al AJD (`aplicarBonificacionCiudad`), y el recuadro de Ceuta dice «Bonificación
   * automática del 50 % para inmuebles en Ceuta».
   * Vendedor A en Ceuta → esperado 40.000 × 0,12 × 25 % × 50 % = 600,00 € · obtenido 1200,00 €. Igual
   * en Melilla.
   */
  test('HALLAZGO IIVTNU en Ceuta y Melilla — la cuota lleva la bonificación del 50 % (art. 159.2 TRLRHL)', async ({
    page,
  }) => {
    test.setTimeout(60_000);
    await montarVendedorA(page, 'ceuta');
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('600,00 €');
    expect(await descripcionTarjeta(page, 'Plusvalía municipal')).toMatch(/bonificación del 50\s% de la cuota de Ceuta y Melilla \(art\. 159\.2 TRLRHL\)/);
    await page.locator('#ccaa-inmueble').selectOption('melilla');
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('600,00 €');
    // Control: fuera de las dos ciudades, la cuota entera.
    await page.locator('#ccaa-inmueble').selectOption('madrid');
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('1200,00 €');
  });

  /**
   * HALLAZGO [alto, calculo] — ✅ REPARADO el 10/10/2026 (3070, decisión del usuario con la cita del art. 68.4 LIRPF). CASO 71. El IRPF de la ganancia de un inmueble
   * radicado en Ceuta o Melilla no lleva la deducción del 60 % del art. 68.4 LIRPF, que vale para
   * residentes (1.º.a) y no residentes (2.º) por la letra d) del 3.º: depende del SITIO, que la app
   * ya conoce. Vendedor A en Ceuta, con la plusvalía que la app publica (1.200): ganancia 42.800 →
   * cuota 8.868 → esperado 8.868 × 40 % = 3547,20 €; con la plusvalía bonificada del hallazgo de
   * arriba (600): ganancia 43.400 → cuota 1.140 + 37.400 × 21 % = 8.994 → 3597,60 €. Obtenido
   * 8868,00 € y neto 183.932,00 € «Lo que realmente recibes» (esperado, con las dos: 200.000 − 600 −
   * 6.000 − 3.597,60 = 189.802,40 €).
   */
  test('HALLAZGO IRPF en Ceuta y Melilla — la ganancia de un inmueble radicado allí lleva la deducción del 60 % (art. 68.4 LIRPF)', async ({
    page,
  }) => {
    test.setTimeout(60_000);
    await montarVendedorA(page, 'ceuta');
    // Reparadas las dos (plusvalía 600 y deducción del 60 %): la cifra exacta de la ficha.
    expect(await valorTarjeta(page, /^IRPF sobre ganancia/)).toBe('3597,60 €');
    expect(await descripcionTarjeta(page, /^IRPF sobre ganancia/)).toMatch(/deducción del 60\s% por rentas obtenidas en Ceuta o Melilla \(art\. 68\.4 LIRPF\): 5396,40 € menos/);
    expect(await valorTarjeta(page, /^IMPORTE NETO VENDEDOR/)).toBe('189.802,40 €');
  });

  /**
   * HALLAZGO [alto, calculo] — ✅ REPARADO el 10/10/2026 (3071): por decisión del usuario, en territorio foral la plusvalía no se calcula y se dice por qué, como el IGIC. Sospecha (b). En Navarra y el País Vasco el
   * IIVTNU no se rige por el TRLRHL (art. 1.2) sino por la norma foral (Convenio arts. 48-49;
   * Concierto art. 42), y la app lo liquida con los coeficientes del art. 107.4 TRLRHL. Navarra es
   * calculable desde el BOE: Ley Foral 2/1995, art. 175.2 (10 años = 0,58) y art. 176.2 (máx. 25 %).
   * Vendedor B en Navarra → esperado, con el coeficiente máximo y el tipo orientativo de la app
   * (25 %, que allí es el máximo legal), 60.000 × 0,58 × 25 % = 8700,00 € · obtenido 1800,00 €
   * (60.000 × 0,12 × 25 %), con ganancia 89.200,00 €, IRPF 19.396,00 € y neto 269.804,00 € «Lo que
   * realmente recibes», idénticos a Madrid. País Vasco: misma forma (Normas Forales del IIVTNU de cada
   * territorio, sin texto consolidado en el BOE): se pide al menos que lo nombre.
   */
  test('HALLAZGO IIVTNU foral — Navarra y el País Vasco no liquidan con los coeficientes del art. 107.4 TRLRHL', async ({
    page,
  }) => {
    test.setTimeout(60_000);
    await montarVendedorB(page, 'navarra');
    const valorNavarra = await valorTarjeta(page, 'Plusvalía municipal');
    const descNavarra = await descripcionTarjeta(page, 'Plusvalía municipal');
    expect(valorNavarra).not.toBe('1800,00 €');
    expect(`${valorNavarra} ${descNavarra}`).toMatch(/8700,00 €|foral/i);
    await page.locator('#ccaa-inmueble').selectOption('pais-vasco');
    const valorPV = await valorTarjeta(page, 'Plusvalía municipal');
    const descPV = await descripcionTarjeta(page, 'Plusvalía municipal');
    expect(`${valorPV} ${descPV}`).toMatch(/foral/i);
    // Sin cifra: el neto es parcial y no pide rellenar un suelo que ya está escrito.
    expect(valorPV).toBe('Sin calcular');
    const neto = await descripcionTarjeta(page, /^IMPORTE NETO VENDEDOR/);
    expect(neto).toContain('No descuenta');
    expect(neto).toContain('la plusvalía municipal se rige por la norma foral');
    expect(neto).not.toContain('Rellena el valor catastral del suelo');
  });

  /**
   * HALLAZGO [medio, calculo] — REPARADO el 08/10/2026 (3072). Era así (sospecha (a)): quien vende su vivienda habitual
   * en el País Vasco o en Navarra reside allí, y su IRPF es foral (Concierto art. 6.Uno; Convenio
   * arts. 1 y 9.1): la app le aplica la escala estatal del ahorro sin decirlo. data/fiscal no tiene
   * las escalas forales, así que lo esperado no es una cifra sino que la tarjeta lo nombre (como el
   * IGIC y el IPSI, que la familia nombra y no calcula).
   * Vendedor B en el País Vasco (o Navarra), «Es mi vivienda habitual» marcada → esperado: la tarjeta
   * del IRPF dice que es foral y que esa cuota no es la suya · obtenido «IRPF sobre ganancia
   * 19.396,00 € · Tributación en base del ahorro» y neto «Lo que realmente recibes».
   */
  // REPARADO el 08/10/2026 (3072): la tarjeta lo nombra con avisoIrpfForalResidente (data/itp-ccaa.ts).
  test('HALLAZGO IRPF foral — la vivienda habitual vendida en el País Vasco o Navarra no tributa con la escala estatal', async ({
    page,
  }) => {
    test.setTimeout(60_000);
    await montarVendedorB(page, 'pais-vasco');
    await expect(page.getByRole('checkbox', { name: 'Es mi vivienda habitual' })).toBeChecked();
    const irpfPV = `${await valorTarjeta(page, /^IRPF sobre ganancia/)} ${await descripcionTarjeta(page, /^IRPF sobre ganancia/)}`;
    expect(irpfPV).toMatch(/foral/i);
    await page.locator('#ccaa-inmueble').selectOption('navarra');
    const irpfNA = `${await valorTarjeta(page, /^IRPF sobre ganancia/)} ${await descripcionTarjeta(page, /^IRPF sobre ganancia/)}`;
    expect(irpfNA).toMatch(/foral/i);
  });

  /**
   * HALLAZGO [bajo, contenido] — REPARADO el 08/10/2026 (3073). Era así (sospecha (c)): los rangos de ITP y AJD que
   * publicaba la página eran los NOMINALES de la tabla y no contenían lo que la app cobra en Ceuta y
   * Melilla (3 % de ITP y 0,25 % de AJD en lo que no es vivienda), sin salvedad. Es la forma de los
   * hallazgos 2206 y 2212 de nave y solar, que la referencia no recibió. El propio FAQPage se
   * contradice: «Los gastos e impuestos van del 3,3 %…» (el suelo es Ceuta) y, en la misma
   * respuesta, «ITP entre el 4 % y el 13 %».
   * Esperado: cada texto que publica el rango nombra Ceuta y Melilla (o lo contiene) · obtenido:
   * «…va del 4 % (País Vasco) al 13 %…», «4 % – 13 % (según CC.AA.)», «En locales, naves y suelo
   * va del 0,5 % al 1,5 %, también en el País Vasco.» y, en los dos FAQPage, «ITP entre el 4 % y el
   * 13 %» y «varía entre el 4 % y el 13 % de su valor», sin Ceuta ni Melilla.
   */
  // REPARADO el 08/10/2026 (3073): cada rango publicado dice que en Ceuta y Melilla se paga la mitad.
  test('HALLAZGO rangos — el ITP y el AJD publicados salvan lo que la app cobra en Ceuta y Melilla', async ({
    page,
  }) => {
    await abrir(page);
    // El bloque educativo nace plegado: se lee el textContent del párrafo o la celda ENTEROS, para
    // que una salvedad añadida en otra frase del mismo párrafo también cuente.
    const texto = async (selector: string, contiene: string): Promise<string> =>
      normaliza(await page.locator(selector, { hasText: contiene }).first().evaluate((e) => e.textContent ?? ''));
    const parrafoITP = await texto('p', 'Cada comunidad autónoma fija su propio tipo');
    const parrafoAJD = await texto('p', 'En locales, naves y suelo va del');
    const celdaITP = await texto('td', '(según CC.AA.)');
    // Las respuestas que dan un rango de ITP en la misma frase (hoy, «ITP entre el 4 % y el 13 %»
    // y «(ITP) de una vivienda varía entre el 4 % y el 13 %»); [^.] corta también en «100.000».
    const faq = (await respuestasFaqPage(page)).filter((r) =>
      /(ITP|Transmisiones Patrimoniales)[^.]*entre el [\d,]+ % y el [\d,]+ %/.test(r),
    );
    for (const t of [parrafoITP, parrafoAJD, celdaITP, ...faq]) expect(t).toMatch(/Ceuta|Melilla/);
  });

  // ─── Lo que sí está bien (verde) ───────────────────────────────────────────────────────

  /**
   * CASO 72 (debe rechazarse) — Ceuta, «Estimar por mí» con aquella compra de OBRA NUEVA: allí no se
   * pagó IVA sino IPSI (TERRITORIOS_SIN_IVA), que el catálogo no calcula, así que el botón no estima.
   * Con SEGUNDA MANO sí estima, y a mano (recalculado el 12/10/2026 con la rebaja del 5 % del nº 2.1
   * de los dos aranceles, hallazgos 2901 y 2902): ITP 150.000 × 3 % = 4.500 · notaría sin IPSI
   * (escala del nº 2.1 de data/itp-ccaa.ts: 90,151816 + 24.040,49 × 4,5 ‰ + 30.050,60 × 1,5 ‰ +
   * 89.898,79 × 1 ‰ = 333,308711 × 0,95 = 316,643275 × 1,75 = 554,125732) · registro sin IPSI
   * (171,098684 × 0,95 + 9,015182 = 171,558932, el de la RECETA 1) · gestoría 300 → 5525,68 →
   * «5526». Sin la rebaja era «5563».
   */
  test('CASO 72 (debe rechazarse) — Ceuta: «Estimar por mí» no estima una obra nueva que pagó IPSI', async ({
    page,
  }) => {
    test.setTimeout(60_000);
    await abrir(page, 'ceuta');
    await sembrar(page, 'Precio de la vivienda', '200000');
    await aVendedor(page);
    await sembrar(page, 'Precio de compra original', '150000');
    const boton = page.getByRole('button', { name: /Estimar por mí/ });
    const campo = page.locator('input[aria-label="Impuestos y gastos que pagaste al comprar"]');
    await page.locator('#regimen-compra-original').selectOption('primera-mano');
    await expect(boton).toBeDisabled();
    await expect(page.locator('#nota-estimar-gastos')).toHaveText(
      'En la Ciudad Autónoma de Ceuta la obra nueva no paga IVA sino IPSI (Impuesto sobre la Producción, los Servicios y la Importación), que esta app no calcula: escribe lo que pagaste, que figura en tu escritura.',
    );
    await boton.click({ force: true });
    await expect(campo).toHaveValue('');
    await page.locator('#regimen-compra-original').selectOption('segunda-mano');
    await expect(boton).toBeEnabled();
    await boton.click();
    await expect(campo).toHaveValue('5526');
  });

  /**
   * 99e1ee7e (08/10) — las relacionadas se resuelven en el layout y la página pinta <RelatedApps />
   * sin prop. Las cuatro tarjetas tienen que estar en el HTML SERVIDO (sin JS) y seguir tras hidratar,
   * sin error de hidratación en la consola. Medido hoy: garaje, trastero, estimador-plusvalia-municipal
   * y estimador-hipoteca.
   */
  test('Relacionadas — cuatro tarjetas en el HTML servido y tras hidratar, sin error de hidratación', async ({
    page,
  }) => {
    const ENLACE = /href="(\/[^"]+#from=related-estimador-compraventa-inmueble)"/g;
    const html = await (await page.request.get(RUTA)).text();
    const servidas = Array.from(html.matchAll(ENLACE), (m) => m[1]);
    expect(servidas).toHaveLength(4);

    const errores: string[] = [];
    page.on('console', (m) => {
      if (m.type() === 'error') errores.push(m.text());
    });
    page.on('pageerror', (e) => errores.push(e.message));
    await abrir(page);
    await expect(page.getByRole('heading', { name: 'Apps relacionadas' })).toBeVisible();
    const hidratadas = await page
      .locator('a[href*="#from=related-estimador-compraventa-inmueble"]')
      .evaluateAll((as) => as.map((a) => a.getAttribute('href')));
    expect(hidratadas).toEqual(servidas);
    expect(errores.filter((e) => /hydrat|did not match|#418|#423|#425/i.test(e))).toEqual([]);
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// Inspector 12/10/2026 — la rebaja de los aranceles ya en el motor, el reparto del IBI y la
// comunidad (eda487ab), Ceuta y Melilla (183f367a), el IRPF foral (41c9992c) y el 0 que no vale
// (09a9cebb)
//
// La rebaja del 5 % del nº 2.1 de los dos aranceles (DA 8.ª RDL 8/2010) la aplicó el triaje del
// 11/10 (a3c3ecb0, REBAJA_ARANCEL_CUANTIA en data/itp-ccaa.ts). Los casos de este fichero que
// fijaban la notaría y el registro SIN ella se recalcularon a mano el 12/10/2026 (×0,95 sobre la
// escala del nº 2.1, con los decimales del BOE que trae data/itp-ccaa.ts), y los dos `test.fail`
// de 2901 y 2902 pasaron a `test`.
//
// Fuentes de las cifras de abajo, todas resueltas a mano ANTES de abrir la app:
//  · ITP_CCAA (data/itp-ccaa.ts): Murcia 7,75 % (lo lee de TIPOS_ITP_CCAA_2025), Melilla 6 % con
//    la bonificación del 50 % del art. 57 bis TRLITPAJD; aranceles de los RD 1426/1989 y
//    1427/1989 con REBAJA_ARANCEL_CUANTIA, y sin IVA en Melilla (honorariosLlevanIVA).
//  · data/fiscal/inmuebles.ts: COEFICIENTES_IIVTNU_2025 (6 años 0,19 · 9 años 0,15 · 10 años
//    0,12), PLUSVALIA_MUNICIPAL_META.tipoOrientativo (25 %), BONIFICACION_IIVTNU_CEUTA_MELILLA
//    (50 %, art. 159.2 TRLRHL), DEDUCCION_IRPF_RENTAS_CEUTA_MELILLA (60 %, art. 68.4 LIRPF) y
//    TRAMOS_GANANCIAS_PATRIMONIALES_2025 (19/21/23/27/30 %).
//  · lib/calculadoras/prorrateoCompraventa.ts: el vendedor cuenta del inicio del periodo al DÍA
//    ANTERIOR a la escritura y el comprador desde ese día (STS 409/2016); 366 días en 2028.
// ══════════════════════════════════════════════════════════════════════════════
test.describe('Inspector 12/10/2026 — reparto del IBI, Ceuta y Melilla, el IRPF foral y el 0 que no vale', () => {
  const CAMPO_PRECIO = 'input[aria-label="Precio de la vivienda"]';

  /** Escribe como el usuario, comprueba que el ESTADO de React lo recogió y sale del campo. */
  async function sembrar(page: Page, etiqueta: string, valor: string): Promise<void> {
    const campo = page.locator(`input[aria-label="${etiqueta}"]`);
    await campo.fill(valor);
    await esperarValorEnReact(page, campo, valor);
    await campo.blur();
  }

  async function abrir(page: Page, ccaa?: string): Promise<void> {
    await page.goto(RUTA);
    await esperarHidratacion(page, [CAMPO_PRECIO, 'input[aria-label="Cuota anual del IBI"]']);
    if (ccaa) await page.locator('#ccaa-inmueble').selectOption(ccaa);
  }

  async function aVendedor(page: Page): Promise<void> {
    await page.getByRole('button', { name: 'Vendedor' }).click();
    await esperarHidratacion(page, ['input[aria-label="Precio de compra original"]']);
  }

  /** El rótulo entero de una tarjeta, para ver su «(PARCIAL)», su «(máximo)» o su «(sin IPSI)». */
  const rotulo = async (page: Page, titulo: RegExp): Promise<string> =>
    (await page.locator('h3', { hasText: titulo }).first().innerText()).replace(ESPACIO_DURO, ' ');

  /** El bloque del reparto del IBI y la comunidad (components/ProrrateoIbiComunidad.tsx). */
  const bloqueReparto = (page: Page) => page.locator('section[aria-labelledby="titulo-prorrateo"]');

  /** Fecha de la escritura (input type="date", controlado por React) y los dos importes. */
  async function repartir(page: Page, fecha: string, ibi?: string, comunidad?: string, periodo?: string) {
    const fechaInput = bloqueReparto(page).locator('input[type="date"]');
    await fechaInput.fill(fecha);
    await esperarValorEnReact(page, fechaInput, fecha);
    if (ibi !== undefined) await sembrar(page, 'Cuota anual del IBI', ibi);
    if (comunidad !== undefined) await sembrar(page, 'Cuota de comunidad', comunidad);
    if (periodo) await bloqueReparto(page).locator('select').selectOption(periodo);
  }

  /** Las celdas de una fila de la tabla del reparto, con el espacio duro normalizado. */
  async function filaReparto(page: Page, concepto: RegExp): Promise<string[]> {
    const celdas = await bloqueReparto(page).locator('tbody tr', { hasText: concepto }).first().locator('td').allInnerTexts();
    return celdas.map((c) => c.replace(ESPACIO_DURO, ' ').replace(/\s+/g, ' ').trim());
  }

  /** «Si el vendedor paga los recibos, el comprador le abona en la firma X €.» → «X €» */
  const totalReparto = async (page: Page): Promise<string> =>
    (await bloqueReparto(page).locator('p', { hasText: 'le abona en la firma' }).locator('strong').innerText())
      .replace(ESPACIO_DURO, ' ')
      .trim();

  /** «297,21 € · 226 días» → 297.21, con el parser del catálogo. */
  const importeCelda = (celda: string): number => parseSpanishNumber(celda.split('€')[0].trim());

  /**
   * CASO 73 (normal) — Murcia, segunda mano, vivienda de 230.000 €, perfil General, las dos
   * pestañas de la misma operación y el reparto del IBI y la comunidad en un año BISIESTO.
   *
   * Comprador:
   *   ITP      = 230.000 × 7,75 % (ITP_CCAA.murcia.tipoGeneral; sin escala)       = 17.825,00 €
   *   Notaría  = escala del nº 2.1 hasta 230.000: 90,151816 + 24.040,49 × 4,5 ‰ + 30.050,60 ×
   *              1,5 ‰ + 90.151,82 × 1 ‰ + 79.746,97 × 0,5 ‰ = 373,435226 · × 0,95 (rebaja) =
   *              354,763465 · × 1,21 (IVA) = 429,263792 · × 1,75 = 751,2116          =    751,21 €
   *              (horquilla × 1,5 = 643,90 € · × 2 = 858,53 €)
   *   Registro = (24,040484 + 24.040,49 × 1,75 ‰ + 30.050,60 × 1,25 ‰ + 90.151,82 × 0,75 ‰ +
   *              79.746,97 × 0,3 ‰ = 195,212547) × 0,95 + 6,010121 + 3,005061 = 194,467102
   *              × 1,21 = 235,3052                                                  =    235,31 €
   *   Gestoría (GESTORIA_TIPICA)                                                    =    300,00 €
   *   Total = 17.825 + 751,21 + 235,31 + 300 = 19.111,52 € → 8,3094 % → «8,31 %»
   *   Coste total = 249.111,52 € «Precio + todos los gastos»
   * Vendedor — compra 160.000 · 9 años · suelo 48.000 · total 120.000 · comisión 3 % (de
   * fábrica) · otros gastos de la venta 800 · vivienda habitual sin edad ni reinversión:
   *   Plusvalía objetivo 48.000 × 0,15 (9 años) × 25 % = 1.800 · real 70.000 × 48/120 × 25 % =
   *     7.000 → «Método objetivo (más favorable)», 1800,00 €
   *   Comisión 6.900 · transmisión 230.000 − 6.900 − 800 − 1.800 = 220.500 · adquisición 160.000
   *   Ganancia 60.500 → IRPF 6.000 × 19 % + 44.000 × 21 % + 10.500 × 23 % = 1.140 + 9.240 + 2.415
   *     = 12.795,00 € · total 1.800 + 6.900 + 800 + 12.795 = 22.295,00 · neto 207.705,00 €
   * Reparto — escritura el 15/08/2028 (2028 es bisiesto: 366 días), IBI 549 €, comunidad 210 €
   * trimestral:
   *   IBI: vendedor del 01/01 al 14/08 = 31 + 29 + 31 + 30 + 31 + 30 + 31 + 14 = 227 días,
   *     comprador 366 − 227 = 139 días (el día de la firma cuenta para el COMPRADOR) →
   *     549 × 227 / 366 = 340,50 € y 549 − 340,50 = 208,50 €
   *   Comunidad: trimestre 01/07–30/09/2028 = 92 días; vendedor 31 + 14 = 45, comprador 47 →
   *     210 × 45 / 92 = 102,717… → 102,72 € y 210 − 102,717… = 107,282… → 107,28 €
   *   El comprador abona 208,50 + 107,282… = 315,782… → 315,78 € (aquí las líneas suman lo mismo)
   */
  test('CASO 73 (normal) — Murcia, 230.000 €: las dos pestañas y el reparto en un año bisiesto', async ({ page }) => {
    test.setTimeout(90_000);
    expect(ITP_CCAA['murcia'].tipoGeneral).toBe(7.75);
    expect(ITP_CCAA['murcia'].tramosProgresivos).toBeUndefined();
    expect(REBAJA_ARANCEL_CUANTIA).toBe(0.05);
    expect(COEFICIENTES_IIVTNU_2025.find((c) => c.anios === 9)?.coeficiente).toBe(0.15);
    expect(PLUSVALIA_MUNICIPAL_META.tipoOrientativo).toBe(25);

    await abrir(page, 'murcia');
    await sembrar(page, 'Precio de la vivienda', '230000');
    expect(await rotulo(page, /^ITP/)).toBe('ITP (7,75 %)');
    expect(await valorTarjeta(page, /^ITP/)).toBe('17.825,00 €');
    expect(await valorTarjeta(page, /^Gastos de notaría/)).toBe('751,21 €');
    expect(await descripcionTarjeta(page, /^Gastos de notaría/)).toContain('Factura estimada entre 643,90 € y 858,53 €');
    expect(await valorTarjeta(page, /^Registro de la Propiedad/)).toBe('235,31 €');
    expect(await valorTarjeta(page, 'Gastos de gestoría')).toBe('300,00 €');
    expect(await valorTarjeta(page, /^Total gastos adicionales/)).toBe('19.111,52 €');
    expect(await descripcionTarjeta(page, /^Total gastos adicionales/)).toBe('8,31 % sobre el precio');
    expect(await rotulo(page, /^COSTE TOTAL/)).toBe('COSTE TOTAL DE ADQUISICIÓN');
    expect(await valorTarjeta(page, /^COSTE TOTAL/)).toBe('249.111,52 €');
    expect(await descripcionTarjeta(page, /^COSTE TOTAL/)).toBe('Precio + todos los gastos');

    await aVendedor(page);
    await sembrar(page, 'Precio de compra original', '160000');
    await sembrar(page, 'Años de propiedad', '9');
    await sembrar(page, 'Valor catastral del suelo', '48000');
    await sembrar(page, 'Valor catastral total (suelo + construcción)', '120000');
    await sembrar(page, 'Otros gastos de la venta (opcional)', '800');
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('1800,00 €');
    expect(await descripcionTarjeta(page, 'Plusvalía municipal')).toBe('Método objetivo (más favorable)');
    expect(await valorTarjeta(page, 'Valor de adquisición')).toBe('160.000,00 €');
    expect(await valorTarjeta(page, 'Valor de transmisión')).toBe('220.500,00 €');
    expect(await valorTarjeta(page, /^Ganancia patrimonial/)).toBe('60.500,00 €');
    expect(await valorTarjeta(page, /^IRPF sobre ganancia/)).toBe('12.795,00 €');
    expect(await valorTarjeta(page, /^Comisión inmobiliaria/)).toBe('6900,00 €');
    expect(await valorTarjeta(page, 'Otros gastos de la venta')).toBe('800,00 €');
    expect(await valorTarjeta(page, /^Total gastos vendedor/)).toBe('22.295,00 €');
    expect(await valorTarjeta(page, /^IMPORTE NETO VENDEDOR/)).toBe('207.705,00 €');
    expect(await descripcionTarjeta(page, /^IMPORTE NETO VENDEDOR/)).toBe('Lo que realmente recibes');

    await repartir(page, '2028-08-15', '549', '210', 'trimestral');
    expect(await filaReparto(page, /^IBI/)).toEqual([
      'IBI del año',
      '01/01/2028 – 31/12/2028',
      '340,50 € · 227 días',
      '208,50 € · 139 días',
    ]);
    expect(await filaReparto(page, /^Comunidad/)).toEqual([
      'Comunidad (cuota trimestral)',
      '01/07/2028 – 30/09/2028',
      '102,72 € · 45 días',
      '107,28 € · 47 días',
    ]);
    expect(await totalReparto(page)).toBe('315,78 €');
  });

  /**
   * CASO 74 (límite) — Melilla, vivienda de 900.000 €: el tramo MÁS ALTO de la base del ahorro (30 %
   * por encima de 300.000 €) con las dos rebajas de las ciudades a la vez (183f367a): la plusvalía
   * bonificada al 50 % (art. 159.2 TRLRHL) y el IRPF con la deducción del 60 % (art. 68.4 LIRPF).
   *
   * Comprador (segunda mano, perfil General):
   *   ITP      = 900.000 × 6 % × 50 % (art. 57 bis TRLITPAJD) = 3 %                = 27.000,00 €
   *   Notaría  = (558,941276 + 298.987,90 × 0,3 ‰ = 648,637646) × 0,95 = 616,205764, SIN IPSI
   *              (honorariosLlevanIVA) × 1,75 = 1.078,360087                         =  1078,36 €
   *              (horquilla × 1,5 = 924,31 € · × 2 = 1232,41 €)
   *   Registro = (306,516178 + 298.987,90 × 0,2 ‰ = 366,313758) × 0,95 + 9,015182
   *              = 357,013252, sin IPSI                                             =    357,01 €
   *   Total = 27.000 + 1.078,36 + 357,01 + 300 = 28.735,37 € → 3,1928 % → «3,19 %», «(parcial)»
   *   porque las facturas de notaría y registro llevan además IPSI · coste 928.735,37 € (PARCIAL)
   * Vendedor — compra 400.000 · 6 años · suelo 200.000 · total 500.000 · comisión 3 % · vivienda
   * habitual de fábrica, sin edad ni reinversión:
   *   Plusvalía objetivo 200.000 × 0,19 × 25 % × 50 % = 4.750 · real 500.000 × 0,4 × 25 % × 50 %
   *     = 25.000 → objetivo, 4750,00 €, con la bonificación nombrada
   *   Comisión 27.000 · transmisión 900.000 − 27.000 − 4.750 = 868.250 · ganancia 468.250
   *   Cuota íntegra 1.140 + 9.240 + 34.500 + 27.000 + 168.250 × 30 % (50.475) = 122.355
   *   Deducción 60 % = 73.413 → IRPF 48.942,00 € · total 4.750 + 27.000 + 48.942 = 80.692,00
   *   Neto 900.000 − 80.692 = 819.308,00 € «Lo que realmente recibes»
   */
  test('CASO 74 (límite) — Melilla, 900.000 €: el tramo del 30 % con la bonificación de la plusvalía y la deducción del IRPF', async ({
    page,
  }) => {
    test.setTimeout(90_000);
    expect(ITP_CCAA['melilla'].tipoGeneral).toBe(6);
    expect(BONIFICACION_IIVTNU_CEUTA_MELILLA.porcentaje).toBe(50);
    expect(DEDUCCION_IRPF_RENTAS_CEUTA_MELILLA.porcentaje).toBe(60);
    expect(COEFICIENTES_IIVTNU_2025.find((c) => c.anios === 6)?.coeficiente).toBe(0.19);
    expect(TRAMOS_GANANCIAS_PATRIMONIALES_2025.map((t) => t.tipo)).toEqual([19, 21, 23, 27, 30]);

    await abrir(page, 'melilla');
    await sembrar(page, 'Precio de la vivienda', '900000');
    expect(await rotulo(page, /^ITP/)).toBe('ITP (3,00 %)');
    expect(await valorTarjeta(page, /^ITP/)).toBe('27.000,00 €');
    expect(await rotulo(page, /^Gastos de notaría/)).toBe('Gastos de notaría (sin IPSI)');
    expect(await valorTarjeta(page, /^Gastos de notaría/)).toBe('1078,36 €');
    expect(await descripcionTarjeta(page, /^Gastos de notaría/)).toContain('Factura estimada entre 924,31 € y 1232,41 €');
    expect(await valorTarjeta(page, /^Registro de la Propiedad/)).toBe('357,01 €');
    expect(await rotulo(page, /^Total gastos adicionales/)).toBe('Total gastos adicionales (parcial)');
    expect(await valorTarjeta(page, /^Total gastos adicionales/)).toBe('28.735,37 €');
    expect(await descripcionTarjeta(page, /^Total gastos adicionales/)).toContain('3,19 % sobre el precio');
    expect(await rotulo(page, /^COSTE TOTAL/)).toBe('COSTE TOTAL (PARCIAL)');
    expect(await valorTarjeta(page, /^COSTE TOTAL/)).toBe('928.735,37 €');

    await aVendedor(page);
    await sembrar(page, 'Precio de compra original', '400000');
    await sembrar(page, 'Años de propiedad', '6');
    await sembrar(page, 'Valor catastral del suelo', '200000');
    await sembrar(page, 'Valor catastral total (suelo + construcción)', '500000');
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('4750,00 €');
    expect(await descripcionTarjeta(page, 'Plusvalía municipal')).toBe(
      'Método objetivo (más favorable), con la bonificación del 50 % de la cuota de Ceuta y Melilla (art. 159.2 TRLRHL)',
    );
    expect(await valorTarjeta(page, 'Valor de transmisión')).toBe('868.250,00 €');
    expect(await valorTarjeta(page, /^Ganancia patrimonial/)).toBe('468.250,00 €');
    expect(await valorTarjeta(page, /^IRPF sobre ganancia/)).toBe('48.942,00 €');
    expect(await descripcionTarjeta(page, /^IRPF sobre ganancia/)).toBe(
      'Tributación en base del ahorro. Lleva la deducción del 60 % por rentas obtenidas en Ceuta o Melilla (art. 68.4 LIRPF): 73.413,00 € menos. Calculado como si esta venta fuera tu única renta del ahorro del año: si tienes intereses, dividendos u otras ganancias, escríbelos arriba, porque la cuota puede ser mayor.',
    );
    expect(await valorTarjeta(page, /^Comisión inmobiliaria/)).toBe('27.000,00 €');
    expect(await valorTarjeta(page, /^Total gastos vendedor/)).toBe('80.692,00 €');
    expect(await valorTarjeta(page, /^IMPORTE NETO VENDEDOR/)).toBe('819.308,00 €');
    expect(await descripcionTarjeta(page, /^IMPORTE NETO VENDEDOR/)).toBe('Lo que realmente recibes');
  });

  /**
   * CASO 75 (debe rechazarse) — dos importes ESCRITOS que no valen (09a9cebb y eda487ab):
   *  (a) Valor catastral total «0» (Madrid · venta 300.000 · compra 200.000 · 10 años · suelo
   *      60.000): no es un total con el que comparar el método real, y no «falta»: está escrito.
   *      La plusvalía se liquida por el objetivo, 60.000 × 0,12 × 25 % = 1800,00 €, y la tarjeta
   *      dice que el 0 escrito tiene que ser mayor que 0. El «0» se queda a la vista.
   *  (b) Cuota anual del IBI «-450» en el reparto (escritura 20/05/2026): no hay reparto que
   *      publicar con un importe imposible. Ni tabla ni «abona»: un aviso que nombra el campo.
   */
  test('CASO 75 (debe rechazarse) — un total catastral 0 no se compara y un IBI negativo no se reparte', async ({ page }) => {
    test.setTimeout(60_000);
    expect(COEFICIENTES_IIVTNU_2025.find((c) => c.anios === 10)?.coeficiente).toBe(0.12);

    // (a)
    await abrir(page, 'madrid');
    await sembrar(page, 'Precio de la vivienda', '300000');
    await aVendedor(page);
    await sembrar(page, 'Precio de compra original', '200000');
    await sembrar(page, 'Años de propiedad', '10');
    await sembrar(page, 'Valor catastral del suelo', '60000');
    await sembrar(page, 'Valor catastral total (suelo + construcción)', '0');
    await expect(page.locator('input[aria-label="Valor catastral total (suelo + construcción)"]')).toHaveValue('0');
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('1800,00 €');
    const plusvalia = await descripcionTarjeta(page, 'Plusvalía municipal');
    expect(plusvalia).toBe(
      'Método objetivo (el valor catastral total escrito tiene que ser mayor que 0: corrígelo para comparar con el método real)',
    );
    expect(plusvalia).not.toContain('falta el valor catastral total');

    // (b)
    await abrir(page);
    await repartir(page, '2026-05-20', '-450');
    await expect(page.locator('input[aria-label="Cuota anual del IBI"]')).toHaveValue('-450');
    await expect(bloqueReparto(page).getByRole('alert')).toContainText('«Cuota anual del IBI»');
    await expect(bloqueReparto(page).locator('table')).toHaveCount(0);
    await expect(bloqueReparto(page)).not.toContainText('abona');
  });

  /**
   * CONTROL de montaje de los hallazgos de abajo: va en VERDE antes y después de repararlos.
   *  · País Vasco · LOCAL comercial · venta 300.000 · compra 200.000 · 10 años · suelo 60.000 ·
   *    3 %, con «Es mi vivienda habitual» DESMARCADA antes de pasar a Local: plusvalía foral sin
   *    calcular (3071) · transmisión 300.000 − 9.000 = 291.000 · ganancia 91.000 (máximo) · IRPF
   *    1.140 + 9.240 + 41.000 × 23 % (9.430) = 19.810,00 € (máximo) · neto 300.000 − 9.000 −
   *    19.810 = 271.190,00 € (PARCIAL). Es la cifra que el hallazgo exige con la casilla de fábrica.
   *  · Reparto · IBI 480 € · comunidad 90 € trimestral · escritura 20/05/2026 (365 días):
   *    IBI vendedor 31 + 28 + 31 + 30 + 19 = 139 días → 480 × 139 / 365 = 182,7945 → 182,79 €;
   *    comprador 226 días → 297,2055 → 297,21 €. Comunidad: trimestre 01/04–30/06 = 91 días;
   *    vendedor 30 + 19 = 49 → 90 × 49 / 91 = 48,4615 → 48,46 €; comprador 42 → 41,5385 → 41,54 €.
   */
  test('CONTROL de montaje — el local en el País Vasco con la casilla desmarcada, y las dos líneas del reparto', async ({
    page,
  }) => {
    test.setTimeout(60_000);
    expect(TERRITORIOS_IIVTNU_FORAL).toContain('pais-vasco');
    await abrir(page, 'pais-vasco');
    await sembrar(page, 'Precio de la vivienda', '300000');
    await aVendedor(page);
    await page.getByRole('checkbox', { name: 'Es mi vivienda habitual' }).uncheck();
    await page.getByRole('button', { name: /Local comercial/ }).click();
    await sembrar(page, 'Precio de compra original', '200000');
    await sembrar(page, 'Años de propiedad', '10');
    await sembrar(page, 'Valor catastral del suelo', '60000');
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('Sin calcular');
    expect(await rotulo(page, /^IRPF sobre ganancia/)).toBe('IRPF sobre ganancia (máximo)');
    expect(await valorTarjeta(page, /^IRPF sobre ganancia/)).toBe('19.810,00 €');
    expect(await valorTarjeta(page, /^IMPORTE NETO VENDEDOR/)).toBe('271.190,00 €');

    await abrir(page);
    await repartir(page, '2026-05-20', '480', '90', 'trimestral');
    expect(await filaReparto(page, /^IBI/)).toEqual([
      'IBI del año',
      '01/01/2026 – 31/12/2026',
      '182,79 € · 139 días',
      '297,21 € · 226 días',
    ]);
    expect(await filaReparto(page, /^Comunidad/)).toEqual([
      'Comunidad (cuota trimestral)',
      '01/04/2026 – 30/06/2026',
      '48,46 € · 49 días',
      '41,54 € · 42 días',
    ]);
  });

  // ─── HALLAZGOS de esta vuelta (test.fail: se ponen en rojo al repararse) ────────────────

  /**
   * HALLAZGO [medio, calculo] — REPARADO el 19/10/2026 (3238): `irpfForal` exige ahora que el
   * inmueble sea una vivienda, como `pideExencion`. La casilla «Es mi vivienda habitual» viene
   * marcada de fábrica y solo se pinta con «Vivienda»; al pasar a un LOCAL, una nave, un terreno,
   * un garaje o un trastero en el País Vasco o en Navarra, su estado sobrevive y `irpfForal`
   * (`esViviendaHabitual && TERRITORIOS_IIVTNU_FORAL.includes(ccaa)`, page.tsx) no mira el tipo
   * de inmueble, como sí hacen `exentoIRPF` y `pideExencion` desde el hallazgo 1553. La tarjeta
   * afirma «Vendes tu vivienda habitual en el País Vasco, así que resides allí: tu IRPF es foral»
   * de un local, y el IRPF —calculable con la escala estatal, como cuando la casilla está
   * desmarcada (CONTROL)— queda «Sin calcular» y fuera del neto. Es la rama de 41c9992c/3072, que
   * solo tiene esta app de la familia.
   * PV · local · 300.000 · compra 200.000 · 10 años · suelo 60.000 · 3 % → esperado IRPF (máximo)
   * 19.810,00 € y neto 271.190,00 € · obtenido «Sin calcular · Vendes tu vivienda habitual…» y neto
   * 291.000,00 €. Igual en Navarra con un garaje.
   */
  test('HALLAZGO IRPF foral — un local en el País Vasco no es la vivienda habitual del vendedor', async ({ page }) => {
    test.setTimeout(60_000);
    await abrir(page, 'pais-vasco');
    await page.getByRole('button', { name: /Local comercial/ }).click();
    await sembrar(page, 'Precio del inmueble', '300000');
    await aVendedor(page);
    await expect(page.getByRole('checkbox', { name: 'Es mi vivienda habitual' })).toHaveCount(0);
    await sembrar(page, 'Precio de compra original', '200000');
    await sembrar(page, 'Años de propiedad', '10');
    await sembrar(page, 'Valor catastral del suelo', '60000');
    // Antes de 3238: «Sin calcular» y «Vendes tu vivienda habitual en el País Vasco…»
    expect(await descripcionTarjeta(page, /^IRPF sobre ganancia/)).not.toContain('Vendes tu vivienda habitual');
    expect(await valorTarjeta(page, /^IRPF sobre ganancia/)).toBe('19.810,00 €');
    expect(await valorTarjeta(page, /^IMPORTE NETO VENDEDOR/)).toBe('271.190,00 €');
  });

  /**
   * HALLAZGO [bajo, calculo] — ✅ REPARADO el 20/10/2026 (3239, `alCentimo` en el componente, para
   * las siete apps). Era así (12/10/2026). El total del reparto («el comprador le abona en
   * la firma») suma los importes SIN redondear y redondea al final, mientras cada línea de la tabla
   * se pinta redondeada al céntimo: el total no cuadra con las dos líneas que tiene encima. Es la
   * familia del hallazgo 594, que el resto de la app evita con `sumarLineasVisibles`
   * (data/itp-ccaa.ts); vive en components/ProrrateoIbiComunidad.tsx (`totalComprador`), así que
   * alcanza a las siete apps, y el testigo de familia solo reparte el IBI (una línea).
   * IBI 480 € · comunidad 90 € trimestral · 20/05/2026 → líneas del comprador 297,21 € + 41,54 € =
   * esperado 338,75 € · obtenido «le abona en la firma 338,74 €» (297,2055 + 41,5385 = 338,7439).
   */
  test('HALLAZGO reparto — el total que abona el comprador suma las líneas que enseña', async ({ page }) => {
    test.setTimeout(60_000);
    await abrir(page);
    await repartir(page, '2026-05-20', '480', '90', 'trimestral');
    const ibi = importeCelda((await filaReparto(page, /^IBI/))[3]);
    const comunidad = importeCelda((await filaReparto(page, /^Comunidad/))[3]);
    expect(ibi).toBeCloseTo(297.21, 2);
    expect(comunidad).toBeCloseTo(41.54, 2);
    expect(parseSpanishNumber((await totalReparto(page)).replace(/\s*€$/, ''))).toBeCloseTo(ibi + comunidad, 2);
    expect(await totalReparto(page)).toMatch(/^338,75\s€$/);
  });

  /**
   * HALLAZGO [bajo, contenido] — ✅ REPARADO el 20/10/2026 (3240, estado «negativo» en
   * `leerImporte`). Era así (12/10/2026). Patrón 5 de la familia («no falta, no vale»):
   * una cuota NEGATIVA se lee bien —«-450» es un número— y es imposible, pero el aviso del reparto
   * dice «No se entiende el importe de «Cuota anual del IBI»: escríbelo como 450 o 450,80», la
   * frase del importe ILEGIBLE. `leerImporte` (components/ProrrateoIbiComunidad.tsx) mete `n < 0`
   * en el estado «ilegible». La pestaña Vendedor ya distingue los dos casos («los años de tenencia
   * no pueden ser negativos», «tiene que ser mayor que 0»). Alcanza a las siete apps.
   * IBI «-450» · 20/05/2026 → esperado un aviso que diga que la cuota no puede ser negativa ·
   * obtenido «No se entiende el importe de «Cuota anual del IBI»: escríbelo como 450 o 450,80…».
   * (Que no reparta nada es correcto: lo sujeta el CASO 75.)
   */
  test('HALLAZGO reparto — un IBI negativo se entiende: no vale, y el aviso tiene que decirlo', async ({ page }) => {
    await abrir(page);
    await repartir(page, '2026-05-20', '-450');
    const aviso = bloqueReparto(page).getByRole('alert');
    await expect(aviso).toBeVisible();
    await expect(aviso).not.toContainText('No se entiende');
    await expect(aviso).toContainText(/negativ/i);
    await expect(aviso).toContainText('«Cuota anual del IBI» no puede ser negativa');
  });

  /**
   * HALLAZGO [bajo, dato] — ✅ REPARADO el 20/10/2026 (3241: cita el art. 104.5 TRLRHL, como la
   * FAQ). Era así (12/10/2026). La tarjeta «Plusvalía municipal» del bloque
   * educativo atribuye la no sujeción sin incremento a la sentencia del TC de 26/10/2021 (STC
   * 182/2021): «Si no hay incremento de valor, no se paga (sentencia del Tribunal Constitucional de
   * 26 de octubre de 2021)». data/fiscal/inmuebles.ts (cabecera de PRESCRIPCION_DEVOLUCION_IIVTNU,
   * verificada en el BOE el 25/09/2026) dice lo contrario: «La vía de la PÉRDIDA la abrió la STC
   * 59/2017 (11/05/2017), no la STC 182/2021: esta última anuló el método de cálculo». La regla
   * hoy es el art. 104.5 TRLRHL (RDL 26/2021), que la FAQ de la misma página ya cita bien
   * (RESPUESTA_NO_SUJECION).
   * Esperado: que la tarjeta cite el art. 104.5 TRLRHL o la STC 59/2017 · obtenido «(sentencia del
   * Tribunal Constitucional de 26 de octubre de 2021)».
   */
  test('HALLAZGO (dato) — la no sujeción sin incremento no viene de la STC de 26/10/2021', async ({ page }) => {
    await abrir(page);
    const tarjeta = page
      .locator('div[class*="contentCard"]')
      .filter({ has: page.locator('h4', { hasText: 'Plusvalía municipal' }) })
      .first();
    const texto = (await tarjeta.evaluate((e) => e.textContent ?? '')).replace(/\s+/g, ' ');
    expect(texto).toContain('Si no hay incremento de valor, no se paga');
    expect(texto).not.toMatch(/no se paga \(sentencia del Tribunal Constitucional de 26 de octubre de 2021\)/);
    expect(texto).toContain('art. 104.5 TRLRHL');
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// Inspector 19/10/2026 — re-inspección tras 58ca4c50 (3238, el IRPF foral exige vivienda; lo
// sujeta el caso «HALLAZGO IRPF foral» de arriba, ya en verde), 5f1b199a (3368, las otras rentas
// del ahorro) y ca9ab312 (retirada de COSTES_COMPRAVENTA_2025, sin lectores en la app).
//
// Fuentes de las cifras de abajo, todas resueltas a mano ANTES de abrir la app:
//  · TRAMOS_GANANCIAS_PATRIMONIALES_2025 (data/fiscal/inmuebles.ts, art. 66 LIRPF): 19 % hasta
//    6.000 · 21 % hasta 50.000 · 23 % hasta 200.000 · 27 % hasta 300.000 · 30 % el resto.
//  · Con otras rentas del ahorro, la venta paga lo que AÑADE: cuota(otras + ganancia) −
//    cuota(otras) (calcularGananciaInmueble, data/fiscal/ganancia-inmueble.ts, hallazgo 3368).
//  · COEFICIENTES_IIVTNU_2025 (10 años: 0,12) y PLUSVALIA_MUNICIPAL_META.tipoOrientativo (25 %).
//  · BONIFICACION_IIVTNU_CEUTA_MELILLA (50 %, art. 159.2 TRLRHL) y
//    DEDUCCION_IRPF_RENTAS_CEUTA_MELILLA (60 % de la parte de la cuota que proporcionalmente
//    corresponde a la venta, art. 68.4 LIRPF).
//
// BASE O (la de todos los casos): vivienda · segunda mano · precio 300.000 · VENDEDOR: compra
// 200.000 · 10 años · suelo 60.000 · total 150.000 · comisión 3 % de fábrica · vivienda habitual
// de fábrica, sin edad ni reinversión. En Madrid:
//   Plusvalía: objetivo 60.000 × 0,12 × 25 % = 1.800 · real 100.000 × 60/150 × 25 % = 10.000 →
//     el objetivo, 1800,00 € «Método objetivo (más favorable)»
//   Comisión 9.000 · transmisión 300.000 − 9.000 − 1.800 = 289.200 · adquisición 200.000 ·
//   ganancia 89.200 · sola: 6.000 × 19 % + 44.000 × 21 % + 39.200 × 23 % = 1.140 + 9.240 +
//   9.016 = 19.396,00 € · neto 300.000 − 1.800 − 9.000 − 19.396 = 269.804,00 €
// ══════════════════════════════════════════════════════════════════════════════
test.describe('Inspector 19/10/2026 — otras rentas del ahorro (3368) y la rama de obra nueva del vendedor', () => {
  const CAMPO_PRECIO = 'input[aria-label="Precio de la vivienda"]';
  const OTRAS = 'Otras rentas del ahorro de este año (€)';

  /** Escribe como el usuario, comprueba que el ESTADO de React lo recogió y sale del campo. */
  async function sembrar(page: Page, etiqueta: string, valor: string): Promise<void> {
    const campo = page.locator(`input[aria-label="${etiqueta}"]`);
    await campo.fill(valor);
    await esperarValorEnReact(page, campo, valor);
    await campo.blur();
  }

  /**
   * La BASE O en la comunidad dada, con la pestaña Vendedor abierta. En obra nueva, con «Un
   * inmueble ya construido»: desde el 3466 (24/10/2026) la app pregunta qué compró el promotor y
   * por defecto es un solar, que con esta base sale NO SUJETA (300.000 × 60/150 = 120.000 ≤
   * 200.000). Ya construido, la proporción va a las dos y la plusvalía es la de segunda mano.
   */
  async function baseO(page: Page, ccaa: string, primeraMano = false): Promise<void> {
    await page.goto(RUTA);
    await esperarHidratacion(page, [CAMPO_PRECIO]);
    await page.locator('#ccaa-inmueble').selectOption(ccaa);
    if (primeraMano) await page.getByRole('button', { name: /Primera mano/ }).click();
    await sembrar(page, 'Precio de la vivienda', '300000');
    await page.getByRole('button', { name: 'Vendedor' }).click();
    await esperarHidratacion(page, ['input[aria-label="Precio de compra original"]']);
    if (primeraMano) await page.getByLabel('¿Qué compraste?').selectOption('construido');
    await sembrar(page, 'Precio de compra original', '200000');
    await sembrar(page, 'Años de propiedad', '10');
    await sembrar(page, 'Valor catastral del suelo', '60000');
    await sembrar(page, 'Valor catastral total (suelo + construcción)', '150000');
  }

  const rotulo = async (page: Page, titulo: RegExp): Promise<string> =>
    (await page.locator('h3', { hasText: titulo }).first().innerText()).replace(ESPACIO_DURO, ' ');

  /**
   * CASO 76 (normal) — Madrid, BASE O, con otras rentas del ahorro que CRUZAN un tramo (3368):
   *  · Sin ellas: 19.396,00 € (la cuota de la ganancia sola, cabecera del describe).
   *  · 45.000 (cruza el de 50.000): base 134.200 → 1.140 + 9.240 + 84.200 × 23 % (19.366) =
   *    29.746; sin la venta, 1.140 + 39.000 × 21 % (8.190) = 9.330 → 20.416,00 € (= 5.000 × 21 %
   *    + 84.200 × 23 %) · total 1.800 + 9.000 + 20.416 = 31.216,00 · neto 268.784,00 €.
   *  · 150.000 (cruza el de 200.000): 50.000 × 23 % (11.500) + 39.200 × 27 % (10.584) =
   *    22.084,00 € · total 32.884,00 · neto 267.116,00 €.
   */
  test('CASO 76 (normal) — Madrid, 300.000: otras rentas de 45.000 y de 150.000 suben la cuota que la venta añade', async ({
    page,
  }) => {
    test.setTimeout(90_000);
    expect(TRAMOS_GANANCIAS_PATRIMONIALES_2025.map((t) => [t.hasta, t.tipo])).toEqual([
      [6000, 19],
      [50000, 21],
      [200000, 23],
      [300000, 27],
      [Infinity, 30],
    ]);
    expect(COEFICIENTES_IIVTNU_2025.find((c) => c.anios === 10)?.coeficiente).toBe(0.12);
    expect(PLUSVALIA_MUNICIPAL_META.tipoOrientativo).toBe(25);

    await baseO(page, 'madrid');
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('1800,00 €');
    expect(await descripcionTarjeta(page, 'Plusvalía municipal')).toBe('Método objetivo (más favorable)');
    expect(await valorTarjeta(page, 'Valor de transmisión')).toBe('289.200,00 €');
    expect(await valorTarjeta(page, /^Ganancia patrimonial/)).toBe('89.200,00 €');
    expect(await valorTarjeta(page, /^IRPF sobre ganancia/)).toBe('19.396,00 €');
    expect(await valorTarjeta(page, /^IMPORTE NETO VENDEDOR/)).toBe('269.804,00 €');

    await sembrar(page, OTRAS, '45000');
    expect(await valorTarjeta(page, /^IRPF sobre ganancia/)).toBe('20.416,00 €');
    expect(await descripcionTarjeta(page, /^IRPF sobre ganancia/)).toBe(
      'Tributación en base del ahorro. Es lo que esta venta añade a tu cuota, sumada a 45.000,00 € de otras rentas del ahorro del año.',
    );
    expect(await valorTarjeta(page, /^Total gastos vendedor/)).toBe('31.216,00 €');
    expect(await valorTarjeta(page, /^IMPORTE NETO VENDEDOR/)).toBe('268.784,00 €');
    expect(await descripcionTarjeta(page, /^IMPORTE NETO VENDEDOR/)).toBe('Lo que realmente recibes');
    // Las otras rentas no tocan la ganancia: solo el tramo en que tributa.
    expect(await valorTarjeta(page, /^Ganancia patrimonial/)).toBe('89.200,00 €');

    await sembrar(page, OTRAS, '150000');
    expect(await valorTarjeta(page, /^IRPF sobre ganancia/)).toBe('22.084,00 €');
    expect(await valorTarjeta(page, /^Total gastos vendedor/)).toBe('32.884,00 €');
    expect(await valorTarjeta(page, /^IMPORTE NETO VENDEDOR/)).toBe('267.116,00 €');
  });

  /**
   * CASO 76 bis (normal) — Melilla, BASE O + otras rentas 45.000: la deducción del art. 68.4
   * LIRPF con otras rentas, la rama que 5f1b199a reescribió (el 60 % de la parte PROPORCIONAL de la
   * cuota total; las otras rentas, fuera de la ciudad).
   *   Plusvalía 1.800 × 50 % = 900 · transmisión 300.000 − 9.000 − 900 = 290.100 · ganancia 90.100
   *   Base 135.100 → cuota total 1.140 + 9.240 + 85.100 × 23 % (19.573) = 29.953 · sin la venta
   *     9.330 → añade 20.623
   *   Deducción 60 % × 29.953 × 90.100 / 135.100 = 11.985,634… → «11.985,63 € menos»
   *   IRPF 20.623 − 11.985,634 = 8.637,366 → «8637,37 €» · total 900 + 9.000 + 8.637,37 =
   *   18.537,37 · neto 281.462,63 €
   */
  test('CASO 76 bis (normal) — Melilla con otras rentas: la deducción del 60 % sobre la parte proporcional', async ({
    page,
  }) => {
    test.setTimeout(90_000);
    expect(BONIFICACION_IIVTNU_CEUTA_MELILLA.porcentaje).toBe(50);
    expect(DEDUCCION_IRPF_RENTAS_CEUTA_MELILLA.porcentaje).toBe(60);

    await baseO(page, 'melilla');
    await sembrar(page, OTRAS, '45000');
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('900,00 €');
    expect(await valorTarjeta(page, /^Ganancia patrimonial/)).toBe('90.100,00 €');
    expect(await valorTarjeta(page, /^IRPF sobre ganancia/)).toBe('8637,37 €');
    expect(await descripcionTarjeta(page, /^IRPF sobre ganancia/)).toBe(
      'Tributación en base del ahorro. Lleva la deducción del 60 % por rentas obtenidas en Ceuta o Melilla (art. 68.4 LIRPF): 11.985,63 € menos. Es lo que esta venta añade a tu cuota, sumada a 45.000,00 € de otras rentas del ahorro del año.',
    );
    expect(await valorTarjeta(page, /^Total gastos vendedor/)).toBe('18.537,37 €');
    expect(await valorTarjeta(page, /^IMPORTE NETO VENDEDOR/)).toBe('281.462,63 €');
  });

  /**
   * CASO 77 (límite) — Madrid, BASE O, las otras rentas en los bordes de la escala:
   *  · 6.000 (fin exacto del tramo del 19 %): toda la ganancia empieza en el 21 % → 44.000 × 21 %
   *    (9.240) + 45.200 × 23 % (10.396) = 19.636,00 € · neto 300.000 − 10.800 − 19.636 = 269.564,00
   *  · 300.000 (principio exacto del tramo del 30 %): 89.200 × 30 % = 26.760,00 € · neto
   *    300.000 − 10.800 − 26.760 = 262.440,00
   *  · «0» escrito: es la venta sola, 19.396,00 €, y la frase vuelve a la de «única renta».
   */
  test('CASO 77 (límite) — otras rentas en 6.000, en 300.000 y en 0: los bordes de la escala del ahorro', async ({
    page,
  }) => {
    test.setTimeout(90_000);
    await baseO(page, 'madrid');

    await sembrar(page, OTRAS, '6000');
    expect(await valorTarjeta(page, /^IRPF sobre ganancia/)).toBe('19.636,00 €');
    expect(await valorTarjeta(page, /^IMPORTE NETO VENDEDOR/)).toBe('269.564,00 €');

    await sembrar(page, OTRAS, '300000');
    expect(await valorTarjeta(page, /^IRPF sobre ganancia/)).toBe('26.760,00 €');
    expect(await valorTarjeta(page, /^Total gastos vendedor/)).toBe('37.560,00 €');
    expect(await valorTarjeta(page, /^IMPORTE NETO VENDEDOR/)).toBe('262.440,00 €');

    await sembrar(page, OTRAS, '0');
    expect(await valorTarjeta(page, /^IRPF sobre ganancia/)).toBe('19.396,00 €');
    expect(await descripcionTarjeta(page, /^IRPF sobre ganancia/)).toBe(
      'Tributación en base del ahorro. Calculado como si esta venta fuera tu única renta del ahorro del año: si tienes intereses, dividendos u otras ganancias, escríbelos arriba, porque la cuota puede ser mayor.',
    );
    expect(await valorTarjeta(page, /^IMPORTE NETO VENDEDOR/)).toBe('269.804,00 €');
  });

  /**
   * CASO 78 (debe rechazarse) — Madrid, BASE O, otras rentas «45.000.50» (millar y decimal a la
   * estadounidense: NaN por diseño). No es un cero: la cuota se publica con 0 (19.396,00 €, la
   * venta sola) y la tarjeta del IRPF tiene que NOMBRAR el importe y decir que la cuota real es
   * MAYOR (con 45.000 legible son 20.416,00 €, CASO 76). El testigo de familia mide el NETO de este
   * campo; aquí se mide la tarjeta del IRPF, que es la cifra que el campo mueve primero.
   */
  test('CASO 78 (debe rechazarse) — otras rentas ilegibles: la cuota se nombra como mínima, no como definitiva', async ({
    page,
  }) => {
    test.setTimeout(90_000);
    await baseO(page, 'madrid');
    await sembrar(page, OTRAS, '45.000.50');
    await expect(page.locator(`input[aria-label="${OTRAS}"]`)).toHaveValue('45.000.50');
    expect(await valorTarjeta(page, /^IRPF sobre ganancia/)).toBe('19.396,00 €');
    expect(await descripcionTarjeta(page, /^IRPF sobre ganancia/)).toBe(
      'El importe de otras rentas del ahorro no se ha podido leer, así que la cuota real es mayor. Escríbelo con coma decimal (1.234,56).',
    );
    expect(await rotulo(page, /^IMPORTE NETO VENDEDOR/)).toBe('IMPORTE NETO VENDEDOR (PARCIAL)');
    expect(await valorTarjeta(page, /^IMPORTE NETO VENDEDOR/)).toBe('269.804,00 €');
    expect(await descripcionTarjeta(page, /^IMPORTE NETO VENDEDOR/)).toBe(
      'El importe de otras rentas del ahorro no se ha podido leer: el neto real es menor que este. Escribe con coma decimal (1.234,56) lo que no se ha podido leer para obtenerlo.',
    );
  });

  /**
   * CONTROL de montaje del hallazgo de obra nueva: va en VERDE antes y después de repararlo. Con
   * «Primera mano» pulsado, la plusvalía municipal (que también paga la promotora) es la de la
   * BASE O: 1800,00 €. Hasta la reparación (3377, 20/10/2026) medía también el valor de
   * transmisión, 289.200,00 €; desde entonces esa tarjeta no se pinta en obra nueva, y la cifra
   * es el neto sin IRPF: 300.000 − 9.000 de comisión − 1.800 de plusvalía.
   * Desde el 3466 (24/10/2026) eso vale con «Un inmueble ya construido». Con un solar (la opción
   * de fábrica), el suelo en la venta, 300.000 × 60/150 = 120.000, no supera los 200.000 pagados:
   * NO SUJETA (art. 104.5 TRLRHL) y neto 300.000 − 9.000 = 291.000,00 €.
   */
  test('CONTROL de montaje — BASE O con «Primera mano»: la plusvalía y la transmisión no cambian', async ({ page }) => {
    test.setTimeout(90_000);
    await baseO(page, 'madrid', true);
    await expect(page.getByRole('button', { name: /Primera mano/ })).toHaveAttribute('aria-pressed', 'true');
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('1800,00 €');
    expect(await valorTarjeta(page, /^IMPORTE NETO VENDEDOR/)).toBe('289.200,00 €');
    await page.getByLabel('¿Qué compraste?').selectOption('solar');
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('NO SUJETA');
    expect(await valorTarjeta(page, /^IMPORTE NETO VENDEDOR/)).toBe('291.000,00 €');
  });

  // ─── HALLAZGOS de esta vuelta (test.fail: se ponen en rojo al repararse) ────────────────

  /**
   * HALLAZGO [medio, calculo] — REPARADO 20/10/2026 (hallazgo 3377; cabo C0284, visto primero en garaje). Con
   * «Primera mano» —obra nueva, que esta misma página define como «primera transmisión del
   * promotor» y que el selector del vendedor rotula «Obra nueva, a la promotora»— la pestaña
   * Vendedor liquida la venta como ganancia patrimonial de un particular en la base del ahorro,
   * ofrece las exenciones de vivienda habitual y publica un neto «Lo que realmente recibes». Quien
   * hace una entrega sujeta a IVA es empresario (Ley 37/1992, arts. 4.Uno y 5.Uno.d: «la promoción,
   * construcción o rehabilitación de edificaciones … aunque sea ocasionalmente»), y su renta es de
   * actividad económica (Ley 35/2006, art. 27.1: «… de construcción …») o del Impuesto sobre
   * Sociedades, no una ganancia patrimonial (art. 33.1: «salvo que por esta Ley se califiquen como
   * rendimientos»). BOE-A-2006-20764 y BOE-A-1992-28740, leídos el 19/10/2026.
   * Madrid · Primera mano · BASE O → esperado: el IRPF avisa de que esa venta no tributa como
   * ganancia patrimonial (o no se publica) · obtenido «IRPF sobre ganancia 19.396,00 € ·
   * Tributación en base del ahorro…» y neto 269.804,00 € «Lo que realmente recibes»; con «Soy
   * mayor de 65 años», «EXENTO · Mayor de 65 años + vivienda habitual» y 289.200,00 €.
   * Si avisa o se apaga lo decide el usuario: el caso acepta las dos reparaciones.
   * El usuario decidió el 20/10/2026 avisar y NO publicar cuota: la tarjeta del IRPF y las de la
   * ganancia dejan paso a «Impuesto sobre la renta de la venta · Sin calcular» con el aviso común
   * (AVISO_VENTA_PROMOTOR), las casillas de vivienda habitual y edad no se ofrecen, y el neto sale
   * sin IRPF y «(PARCIAL)»: 300.000 − 9.000 − 1.800 = 289.200,00 €.
   */
  test('HALLAZGO obra nueva — la pestaña Vendedor no liquida a la promotora como a un particular', async ({ page }) => {
    test.setTimeout(90_000);
    await baseO(page, 'madrid', true);
    await expect(page.locator('h3', { hasText: /^IRPF sobre ganancia/ })).toHaveCount(0);
    await expect(page.locator('h3', { hasText: /^Ganancia patrimonial/ })).toHaveCount(0);
    expect(await valorTarjeta(page, 'Impuesto sobre la renta de la venta')).toBe('Sin calcular');
    expect(await descripcionTarjeta(page, 'Impuesto sobre la renta de la venta')).toMatch(/vende el promotor.*actividad económica/);
    await expect(page.getByText('Soy mayor de 65 años')).toHaveCount(0);
    await expect(page.getByText('Es mi vivienda habitual')).toHaveCount(0);
    expect(await rotulo(page, /^IMPORTE NETO VENDEDOR/)).toBe('IMPORTE NETO VENDEDOR (PARCIAL)');
    expect(await valorTarjeta(page, /^IMPORTE NETO VENDEDOR/)).toBe('289.200,00 €');
    expect(await descripcionTarjeta(page, /^IMPORTE NETO VENDEDOR/)).toContain('No descuenta el impuesto sobre la renta del promotor');
  });

  /**
   * HALLAZGO [bajo, contenido] — REPARADO el 20/10/2026 (3378); era así el 19/10/2026. La línea que 5f1b199a (3368) añadió a la caja
   * «Errores comunes al calcular los gastos de compraventa» termina en «No se compensan pérdidas de
   * otras operaciones.» En garaje la misma frase va en la lista de limitaciones y se lee como un
   * límite de la herramienta; aquí, entre errores fiscales, se lee como regla, y es falsa: el art.
   * 49.1.b LIRPF integra y compensa «exclusivamente entre sí» las ganancias y pérdidas patrimoniales
   * del periodo. Y contradice la tarjeta del IRPF de esta página con pérdida: «la pérdida se
   * compensa con otras ganancias del ahorro en tu declaración».
   * Esperado: que diga que ESTA herramienta no las compensa · obtenido «… la cuota será la que esta
   * venta añade. No se compensan pérdidas de otras operaciones.»
   */
  // REPARADO el 20/10/2026 (hallazgo 3378): dice que es la calculadora la que no compensa, y que en
  // la declaración sí se compensan (art. 49.1.b LIRPF, leído en el BOE ese día). En garaje, trastero
  // y local-comercial, la misma frase de limitaciones con la misma salvedad.
  test('HALLAZGO pérdidas — la caja de errores comunes no niega la compensación de pérdidas', async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, [CAMPO_PRECIO]);
    const linea = (
      await page
        .locator('li', { hasText: 'como si fuera tu única renta del ahorro' })
        .first()
        .evaluate((e) => e.textContent ?? '')
    ).replace(/\s+/g, ' ');
    expect(linea).toContain('la cuota será la que esta venta añade');
    expect(linea).not.toContain('No se compensan pérdidas de otras operaciones');
    expect(linea).toContain('Lo que esta calculadora no hace es compensar pérdidas de otras operaciones');
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// Inspector 21/10/2026 — re-inspección tras las reparaciones del 19-20/10/2026 (58ca4c50,
// 79ed543c, ef34f391, 1084f12f, e2c8819a, 616e5fc8 y 0dc46e32)
//
// Verificadas con su caso, en verde el 21/10/2026: 2904 (la «Tributa» de la ganancia nombra la
// hipoteca ilegible), 2961, 2962, 2963 (un solo FAQPage, 13 preguntas; las siete de la FAQ visible,
// idénticas), 2965 (pegado con «euros»), 3238, 3239, 3240, 3241, 3377 (obra nueva: vende el
// promotor) y 3378. La base no tiene ninguno abierto.
//
// Tres casos nuevos, resueltos a mano ANTES de abrir la app, por caminos que el spec no pisaba:
//   79 · Valencia: reinversión PARCIAL con hipoteca, gastos de aquella compra, mejoras y otras
//        rentas del ahorro a la vez (ningún caso las juntaba).
//   80 · el plazo del art. 41 bis.1 RIRPF justo en 3 años, y en 2 con la ganancia en el tramo del
//        30 % de la escala del ahorro.
//   81 · obra nueva (vende el promotor) con importes ilegibles: el invariante de la familia en la
//        rama de 616e5fc8, que el testigo no mide (sus filas van sobre la BASE B, segunda mano), y
//        la «Cuota de comunidad» del reparto (el testigo solo mide el IBI).
//
// Fuentes: ITP_CCAA (data/itp-ccaa.ts: Valencia 9 % hasta 1.000.000 €, Madrid 6 %),
// COEFICIENTES_IIVTNU_2025 y PLUSVALIA_MUNICIPAL_META.tipoOrientativo (data/fiscal/inmuebles.ts),
// TRAMOS_GANANCIAS_PATRIMONIALES_2025 (19/21/23/27/30 %) con calcularGananciaInmueble
// (data/fiscal/ganancia-inmueble.ts: arts. 35 y 38 LIRPF, 41 RIRPF) y el art. 41 bis.1 RIRPF que
// aplica page.tsx.
// ══════════════════════════════════════════════════════════════════════════════
test.describe('Inspector 21/10/2026 — reinversión parcial con todo, el plazo de 3 años y la obra nueva con ilegibles', () => {
  const CAMPO_PRECIO = 'input[aria-label="Precio de la vivienda"]';
  const OTRAS = 'Otras rentas del ahorro de este año (€)';

  /** Escribe como el usuario, comprueba que el ESTADO de React lo recogió y sale del campo. */
  async function sembrar(page: Page, etiqueta: string, valor: string): Promise<void> {
    const campo = page.locator(`input[aria-label="${etiqueta}"]`);
    await campo.fill(valor);
    await esperarValorEnReact(page, campo, valor);
    await campo.blur();
  }

  async function abrir(page: Page, ccaa: string, primeraMano = false): Promise<void> {
    await page.goto(RUTA);
    await esperarHidratacion(page, [CAMPO_PRECIO]);
    await page.locator('#ccaa-inmueble').selectOption(ccaa);
    if (primeraMano) await page.getByRole('button', { name: /Primera mano/ }).click();
  }

  async function irAVendedor(page: Page): Promise<void> {
    await page.getByRole('button', { name: 'Vendedor' }).click();
    await esperarHidratacion(page, ['input[aria-label="Precio de compra original"]']);
  }

  /**
   * La BASE O del describe del 19/10 (300.000 · compra 200.000 · 10 años · suelo 60.000 · total
   * 150.000 · comisión 3 %, la de fábrica), en la comunidad y la transmisión dadas. A mano:
   * plusvalía objetivo 60.000 × 0,12 × 25 % = 1.800 (el real, 100.000 × 60/150 × 25 % = 10.000,
   * pierde) · comisión 9.000 · transmisión 289.200 · ganancia 89.200. En obra nueva, con «Un
   * inmueble ya construido» (3466: con el solar de fábrica esta base sale NO SUJETA).
   */
  async function baseO(page: Page, ccaa: string, primeraMano = false): Promise<void> {
    await abrir(page, ccaa, primeraMano);
    await sembrar(page, 'Precio de la vivienda', '300000');
    await irAVendedor(page);
    if (primeraMano) await page.getByLabel('¿Qué compraste?').selectOption('construido');
    await sembrar(page, 'Precio de compra original', '200000');
    await sembrar(page, 'Años de propiedad', '10');
    await sembrar(page, 'Valor catastral del suelo', '60000');
    await sembrar(page, 'Valor catastral total (suelo + construcción)', '150000');
  }

  const rotulo = async (page: Page, titulo: RegExp): Promise<string> =>
    (await page.locator('h3', { hasText: titulo }).first().innerText()).replace(ESPACIO_DURO, ' ');

  /** El texto de ayuda de un NumberInput, por su aria-describedby; null si el campo no está. */
  async function ayudaDe(page: Page, etiqueta: string): Promise<string | null> {
    const campo = page.locator(`input[aria-label="${etiqueta}"]`);
    if ((await campo.count()) === 0) return null;
    const id = await campo.getAttribute('aria-describedby');
    if (!id) return '';
    return (await page.locator(`[id="${id}"]`).innerText()).replace(ESPACIO_DURO, ' ');
  }

  /**
   * CASO 79 (normal) — Valencia, segunda mano, vivienda de 260.000 €, perfil General.
   *  Comprador: ITP_CCAA.valencia, 9 % hasta 1.000.000 € → 260.000 × 9 % = 23.400,00 € «ITP (9,00 %)».
   *  Vendedor: compra 180.000 · 7 años · gastos de aquella compra 15.000 · mejoras 5.000 · suelo
   *  50.000 · total 140.000 · comisión 3 % (la de fábrica) · otras rentas 20.000 · reinvierte
   *  150.000 · hipoteca pendiente 60.000:
   *   Plusvalía: objetivo 50.000 × 0,20 (7 años) × 25 % = 2.500 · real 80.000 × 50/140 × 25 % =
   *     7.142,86 → el objetivo, «2500,00 €»
   *   Comisión 7.800 · transmisión 260.000 − 7.800 − 2.500 = 249.700 · adquisición 180.000 + 15.000
   *     + 5.000 = 200.000 · ganancia 49.700
   *   Importe obtenido (art. 41.1 RIRPF) 249.700 − 60.000 = 189.700 · exento 150.000 / 189.700 =
   *     79,07 % → «exento el 79,1 %» · base 49.700 × 39.700 / 189.700 = 10.401,107 → «10.401,11 €»
   *   Cuota con 20.000 de otras rentas: toda la base cae en el 21 % → 10.401,107 × 21 % = 2.184,23
   *   Total 2.500 + 7.800 + 2.184,23 = 12.484,23 · neto 260.000 − 12.484,23 = 247.515,77 €
   */
  test('CASO 79 (normal) — Valencia, 260.000: reinversión parcial con hipoteca, gastos, mejoras y otras rentas', async ({
    page,
  }) => {
    test.setTimeout(90_000);
    expect(ITP_CCAA.valencia.tipoGeneral).toBe(9);
    expect(ITP_CCAA.valencia.umbralTipoUnico?.superiorA).toBe(1_000_000);
    expect(COEFICIENTES_IIVTNU_2025.find((c) => c.anios === 7)?.coeficiente).toBe(0.2);
    expect(PLUSVALIA_MUNICIPAL_META.tipoOrientativo).toBe(25);
    expect(TRAMOS_GANANCIAS_PATRIMONIALES_2025.slice(0, 2).map((t) => [t.hasta, t.tipo])).toEqual([
      [6000, 19],
      [50000, 21],
    ]);

    await abrir(page, 'valencia');
    await sembrar(page, 'Precio de la vivienda', '260000');
    expect(await rotulo(page, /^ITP \(/)).toBe('ITP (9,00 %)');
    expect(await valorTarjeta(page, /^ITP \(/)).toBe('23.400,00 €');

    await irAVendedor(page);
    await sembrar(page, 'Precio de compra original', '180000');
    await sembrar(page, 'Años de propiedad', '7');
    await sembrar(page, 'Impuestos y gastos que pagaste al comprar', '15000');
    await sembrar(page, 'Inversiones y mejoras (opcional)', '5000');
    await sembrar(page, 'Valor catastral del suelo', '50000');
    await sembrar(page, 'Valor catastral total (suelo + construcción)', '140000');
    await sembrar(page, OTRAS, '20000');
    await page.getByRole('checkbox', { name: /Voy a reinvertir en otra vivienda habitual/ }).check();
    await sembrar(page, 'Importe que reinviertes en la nueva vivienda', '150000');
    await sembrar(page, 'Hipoteca pendiente de la vivienda que vendes', '60000');

    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('2500,00 €');
    expect(await descripcionTarjeta(page, 'Plusvalía municipal')).toBe('Método objetivo (más favorable)');
    expect(await valorTarjeta(page, 'Valor de adquisición')).toBe('200.000,00 €');
    expect(await valorTarjeta(page, 'Valor de transmisión')).toBe('249.700,00 €');
    expect(await valorTarjeta(page, /^Ganancia patrimonial/)).toBe('49.700,00 €');
    expect(await descripcionTarjeta(page, /^Ganancia patrimonial/)).toBe('Tributa 10.401,11 € tras aplicar la exención');
    expect(await valorTarjeta(page, /^IRPF sobre ganancia/)).toBe('2184,23 €');
    expect(await descripcionTarjeta(page, /^IRPF sobre ganancia/)).toBe(
      'Reinversión parcial: exento el 79,1 % de la ganancia (art. 41 RIRPF). Es lo que esta venta añade a tu cuota, sumada a 20.000,00 € de otras rentas del ahorro del año.',
    );
    expect(await valorTarjeta(page, /^Comisión inmobiliaria/)).toBe('7800,00 €');
    expect(await valorTarjeta(page, /^Total gastos vendedor/)).toBe('12.484,23 €');
    expect(await rotulo(page, /^IMPORTE NETO VENDEDOR/)).toBe('IMPORTE NETO VENDEDOR');
    expect(await valorTarjeta(page, /^IMPORTE NETO VENDEDOR/)).toBe('247.515,77 €');
    expect(await descripcionTarjeta(page, /^IMPORTE NETO VENDEDOR/)).toBe('Lo que realmente recibes');
  });

  /**
   * CASO 80 (límite) — Madrid, vivienda de 700.000 €, vendedor mayor de 65 en su vivienda habitual:
   * el plazo de 3 años del art. 41 bis.1 RIRPF en su canto, y la ganancia en el tramo del 30 %.
   *  Comprador: 700.000 × 6 % = 42.000,00 € «ITP (6,00 %)» (el 5,4 % de vivienda habitual se queda
   *  en su tope de 250.000 €).
   *  Vendedor: compra 300.000 · suelo 150.000 · total 400.000 · comisión 4 %:
   *   Plusvalía: objetivo 150.000 × 0,14 (3 años, y también 2) × 25 % = 5.250 · real 400.000 ×
   *     150/400 × 25 % = 37.500 → «5250,00 €» · comisión 28.000 · transmisión 666.750 · ganancia 366.750
   *  · 3 años: el plazo se cumple → EXENTO (art. 33.4.b LIRPF), sin la casilla de la excepción ·
   *    neto 700.000 − 5.250 − 28.000 = 666.750,00 €
   *  · 2 años: no llega a 3 de residencia → sin exención: 6.000 × 19 % (1.140) + 44.000 × 21 %
   *    (9.240) + 150.000 × 23 % (34.500) + 100.000 × 27 % (27.000) + 66.750 × 30 % (20.025) =
   *    91.905,00 € · total 125.155,00 · neto 574.845,00 €
   *  · 2 años y la excepción marcada (traslado, matrimonio…): EXENTO otra vez, y lo dice.
   */
  test('CASO 80 (límite) — 41 bis justo en 3 años y en 2, con la ganancia en el tramo del 30 %', async ({ page }) => {
    test.setTimeout(90_000);
    expect(COEFICIENTES_IIVTNU_2025.find((c) => c.anios === 3)?.coeficiente).toBe(0.14);
    expect(COEFICIENTES_IIVTNU_2025.find((c) => c.anios === 2)?.coeficiente).toBe(0.14);
    expect(ITP_CCAA.madrid.tipoGeneral).toBe(6);
    expect(TRAMOS_GANANCIAS_PATRIMONIALES_2025[TRAMOS_GANANCIAS_PATRIMONIALES_2025.length - 1].tipo).toBe(30);

    await abrir(page, 'madrid');
    await sembrar(page, 'Precio de la vivienda', '700000');
    expect(await rotulo(page, /^ITP \(/)).toBe('ITP (6,00 %)');
    expect(await valorTarjeta(page, /^ITP \(/)).toBe('42.000,00 €');

    await irAVendedor(page);
    await sembrar(page, 'Precio de compra original', '300000');
    await sembrar(page, 'Años de propiedad', '3');
    await sembrar(page, 'Valor catastral del suelo', '150000');
    await sembrar(page, 'Valor catastral total (suelo + construcción)', '400000');
    await sembrar(page, 'Comisión inmobiliaria (%)', '4');
    await page.getByRole('checkbox', { name: /Soy mayor de 65 años/ }).check();
    const excepcion = page.getByRole('checkbox', { name: /menos de 3 años por una causa/ });

    // 3 años: el plazo se cumple
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('5250,00 €');
    expect(await valorTarjeta(page, /^Ganancia patrimonial/)).toBe('366.750,00 €');
    expect(await valorTarjeta(page, /^IRPF sobre ganancia/)).toBe('EXENTO');
    expect(await descripcionTarjeta(page, /^IRPF sobre ganancia/)).toBe('Mayor de 65 años + vivienda habitual');
    await expect(excepcion).toHaveCount(0);
    expect(await valorTarjeta(page, /^IMPORTE NETO VENDEDOR/)).toBe('666.750,00 €');

    // 2 años: no llega
    await sembrar(page, 'Años de propiedad', '2');
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('5250,00 €');
    expect(await valorTarjeta(page, /^IRPF sobre ganancia/)).toBe('91.905,00 €');
    expect(await descripcionTarjeta(page, /^IRPF sobre ganancia/)).toContain(
      'con 2 años de propiedad no llega a los 3 años seguidos de residencia que exige el art. 41 bis.1 RIRPF',
    );
    expect(await valorTarjeta(page, /^Total gastos vendedor/)).toBe('125.155,00 €');
    expect(await valorTarjeta(page, /^IMPORTE NETO VENDEDOR/)).toBe('574.845,00 €');
    await expect(excepcion).toHaveCount(1);

    // 2 años con la causa que obligó a cambiar de domicilio
    await excepcion.check();
    expect(await valorTarjeta(page, /^IRPF sobre ganancia/)).toBe('EXENTO');
    expect(await descripcionTarjeta(page, /^IRPF sobre ganancia/)).toBe(
      'Mayor de 65 años + vivienda habitual (con menos de 3 años de residencia, por la causa que declaras: art. 41 bis.1 RIRPF)',
    );
    expect(await valorTarjeta(page, /^IMPORTE NETO VENDEDOR/)).toBe('666.750,00 €');
  });

  /**
   * CASO 81 (debe rechazarse) — Madrid, OBRA NUEVA, BASE O: vende el promotor (616e5fc8), así que
   * no hay IRPF que publicar y el neto sin él es 300.000 − 9.000 − 1.800 = 289.200,00 € (PARCIAL).
   *  · Comisión «3.5.0» (NaN por diseño): no es un 0. Se publica sin ella, 300.000 − 1.800 =
   *    298.200,00 €, y el aviso tiene que nombrarla y decir que el neto real es MENOR.
   *  · Otras rentas «45.000.50»: en esta rama no mueven ninguna cifra (no hay cuota del ahorro), así
   *    que el neto sigue en 289.200,00 € y la app no puede atribuirles una dirección.
   *  · Reparto, IBI 600 legible y «Cuota de comunidad» «90.5.0»: no se reparte nada y se nombra el campo.
   */
  test('CASO 81 (debe rechazarse) — obra nueva: la comisión ilegible se nombra y las otras rentas no inventan dirección', async ({
    page,
  }) => {
    test.setTimeout(90_000);
    await baseO(page, 'madrid', true);
    expect(await valorTarjeta(page, 'Impuesto sobre la renta de la venta')).toBe('Sin calcular');
    expect(await valorTarjeta(page, /^IMPORTE NETO VENDEDOR/)).toBe('289.200,00 €');

    await sembrar(page, 'Comisión inmobiliaria (%)', '3.5.0');
    await expect(page.locator('input[aria-label="Comisión inmobiliaria (%)"]')).toHaveValue('3.5.0');
    expect(await valorTarjeta(page, /^Comisión inmobiliaria/)).toBe('Sin leer');
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('1800,00 €');
    expect(await rotulo(page, /^Total gastos vendedor/)).toBe('Total gastos vendedor (parcial)');
    expect(await valorTarjeta(page, /^Total gastos vendedor/)).toBe('1800,00 €');
    expect(await rotulo(page, /^IMPORTE NETO VENDEDOR/)).toBe('IMPORTE NETO VENDEDOR (PARCIAL)');
    expect(await valorTarjeta(page, /^IMPORTE NETO VENDEDOR/)).toBe('298.200,00 €');
    expect(await descripcionTarjeta(page, /^IMPORTE NETO VENDEDOR/)).toBe(
      'No descuenta el impuesto sobre la renta del promotor: el neto real puede ser menor que este. No descuenta la comisión inmobiliaria, que no se ha podido leer: el neto real es menor que este. Escribe con coma decimal (1.234,56) lo que no se ha podido leer para calcular lo demás.',
    );

    await sembrar(page, 'Comisión inmobiliaria (%)', '3');
    // Desde el 3394 (21/10/2026) las otras rentas no se piden en obra nueva: no hay cuota del ahorro.
    await expect(page.locator(`input[aria-label="${OTRAS}"]`)).toHaveCount(0);
    expect(await valorTarjeta(page, /^IMPORTE NETO VENDEDOR/)).toBe('289.200,00 €');
    expect(await descripcionTarjeta(page, /^IMPORTE NETO VENDEDOR/)).toBe(
      'No descuenta el impuesto sobre la renta del promotor: el neto real puede ser menor que este.',
    );

    // El reparto del IBI y la comunidad: un importe ilegible tampoco es un cero allí.
    const bloque = page.locator('section[aria-labelledby="titulo-prorrateo"]');
    const fecha = bloque.locator('input[type="date"]');
    await fecha.fill('2026-07-01');
    await esperarValorEnReact(page, fecha, '2026-07-01');
    await sembrar(page, 'Cuota anual del IBI', '600');
    await sembrar(page, 'Cuota de comunidad', '90');
    await expect(bloque).toContainText('abona');
    await sembrar(page, 'Cuota de comunidad', '90.5.0');
    await expect(bloque.getByRole('alert')).toHaveText(
      'No se entiende el importe de «Cuota de comunidad»: escríbelo como 450 o 450,80. Hasta corregirlo no se reparte nada, para no publicar una cifra calculada con un importe equivocado.',
    );
    await expect(bloque).not.toContainText('abona');
  });

  /**
   * CONTROL de montaje de los hallazgos de abajo: va en VERDE antes y después de repararlos.
   *  · Madrid, BASE O + reinvierte 150.000 (sin hipoteca): obtenido 289.200 → exento 150.000 /
   *    289.200 = 51,87 % → «exento el 51,9 %» · base 89.200 × 139.200 / 289.200 = 42.934,44 →
   *    1.140 + 36.934,44 × 21 % = 8.896,23 € (las cifras del hallazgo 2904).
   *  · Madrid, OBRA NUEVA, BASE O: neto 289.200,00 € con o sin otras rentas, gastos y mejoras.
   */
  test('CONTROL de montaje — la reinversión parcial con su motivo, y la obra nueva que no se mueve', async ({ page }) => {
    test.setTimeout(90_000);
    await baseO(page, 'madrid');
    await page.getByRole('checkbox', { name: /Voy a reinvertir en otra vivienda habitual/ }).check();
    await sembrar(page, 'Importe que reinviertes en la nueva vivienda', '150000');
    expect(await valorTarjeta(page, /^IRPF sobre ganancia/)).toBe('8896,23 €');
    expect(await descripcionTarjeta(page, /^IRPF sobre ganancia/)).toContain(
      'Reinversión parcial: exento el 51,9 % de la ganancia (art. 41 RIRPF)',
    );

    // Obra nueva: antes del 3394 se escribían aquí otras rentas 45.000, gastos 20.000 y mejoras
    // 10.000 y el neto no se movía; desde el 21/10/2026 esos campos ya no se ofrecen. Lo que se
    // escribió en segunda mano tampoco mueve nada al pasar a obra nueva.
    await baseO(page, 'madrid');
    await sembrar(page, OTRAS, '45000');
    await sembrar(page, 'Impuestos y gastos que pagaste al comprar', '20000');
    await sembrar(page, 'Inversiones y mejoras (opcional)', '10000');
    await page.getByRole('button', { name: /Primera mano/ }).click();
    // Ya construido, la plusvalía de la BASE O (con el solar de fábrica sería no sujeta, 3466).
    await page.getByLabel('¿Qué compraste?').selectOption('construido');
    expect(await valorTarjeta(page, /^IMPORTE NETO VENDEDOR/)).toBe('289.200,00 €');
    await expect(page.locator(`input[aria-label="${OTRAS}"]`)).toHaveCount(0);
  });

  // ─── HALLAZGOS de esta vuelta (test.fail: se ponen en rojo al repararse) ────────────────

  /**
   * HALLAZGO 3393 [bajo, contenido] — REPARADO (21/10/2026): el motivo va detrás del aviso, como la
   * deducción de Ceuta y Melilla y las otras rentas desde el 3386.
   * Lo que se vio: con una reinversión PARCIAL, la tarjeta del
   * IRPF publica una cuota que ya lleva la exención del art. 38 LIRPF y lo dice con su motivo
   * («Reinversión parcial: exento el 51,9 % de la ganancia (art. 41 RIRPF)»). En cuanto otro importe
   * es ilegible, el aviso SUSTITUYE al motivo (page.tsx: `avisoTarjeta(...) ?? motivo`) y la cuota,
   * que sigue llevando la exención, deja de decirlo; la deducción de Ceuta y Melilla y la frase de
   * las otras rentas sí se mantienen detrás del aviso desde el hallazgo 3386. Es esa forma, en el
   * motivo de la exención.
   * Madrid · BASE O + reinvierte 150.000 → «8896,23 € · Reinversión parcial: exento el 51,9 %…» ·
   * + otras rentas «45.000.50» → esperado: el aviso y el motivo · obtenido «8896,23 € · El importe de
   * otras rentas del ahorro no se ha podido leer, así que la cuota real es mayor. Escríbelo con
   * coma decimal (1.234,56).», sin el motivo. Igual con la comisión «3.5.0» (10.128,76 €).
   */
  test('REPARADO 3393 motivo — la cuota con reinversión parcial no pierde su motivo detrás de un aviso', async ({
    page,
  }) => {
    test.setTimeout(90_000);
    await baseO(page, 'madrid');
    await page.getByRole('checkbox', { name: /Voy a reinvertir en otra vivienda habitual/ }).check();
    await sembrar(page, 'Importe que reinviertes en la nueva vivienda', '150000');
    await sembrar(page, OTRAS, '45.000.50');
    expect(await valorTarjeta(page, /^IRPF sobre ganancia/)).toBe('8896,23 €');
    const d = await descripcionTarjeta(page, /^IRPF sobre ganancia/);
    expect(d).toContain('no se ha podido leer');
    expect(d).toContain('Reinversión parcial: exento el 51,9 % de la ganancia (art. 41 RIRPF)');
    // El aviso primero, después el motivo
    expect(d.indexOf('no se ha podido leer')).toBeLessThan(d.indexOf('Reinversión parcial'));
    // Y con la comisión «3.5.0» (la otra forma del hallazgo): 10.128,76 €, con el motivo
    await sembrar(page, OTRAS, '');
    await sembrar(page, 'Comisión inmobiliaria (%)', '3.5.0');
    expect(await valorTarjeta(page, /^IRPF sobre ganancia/)).toBe('10.128,76 €');
    const c = await descripcionTarjeta(page, /^IRPF sobre ganancia/);
    expect(c).toContain('La comisión inmobiliaria no se ha podido leer');
    expect(c).toContain('Reinversión parcial: exento el');
  });

  /**
   * HALLAZGO 3394 [bajo, contenido] — REPARADO (21/10/2026): en obra nueva la pestaña ya no pide los
   * gastos de aquella compra (ni «Estimar por mí»), las mejoras ni las otras rentas del ahorro, y el
   * rótulo dice «Datos para calcular la plusvalía». La misma reparación en garaje, trastero y local.
   * Lo que se vio: con «Primera mano» la pestaña Vendedor ya no
   * liquida la renta del promotor (616e5fc8, hallazgo 3377) y retiró las casillas de vivienda
   * habitual, edad y reinversión, pero sigue pidiendo los campos que solo alimentan esa cuota, con
   * ayudas que prometen un efecto que la misma pestaña niega: «Impuestos y gastos que pagaste al
   * comprar» (con «Estimar por mí» y su desplegable) «Suman al valor de adquisición y REDUCEN la
   * ganancia (art. 35.1 LIRPF)», y «Otras rentas del ahorro de este año» «…así que con ellas la
   * venta puede tributar a un tipo mayor». Escribir en ellos no mueve ninguna cifra.
   * Madrid · Primera mano · BASE O → neto 289.200,00 € · + otras rentas 45.000, gastos 20.000 y
   * mejoras 10.000 → esperado: esos campos no se ofrecen en obra nueva, o su ayuda no promete efecto
   * · obtenido: neto 289.200,00 € idéntico, con las dos ayudas tal cual.
   */
  test('REPARADO 3394 obra nueva — no se piden campos del IRPF que esta rama no calcula', async ({ page }) => {
    test.setTimeout(90_000);
    await baseO(page, 'madrid', true);
    const otras = await ayudaDe(page, OTRAS);
    if (otras !== null) expect(otras).not.toContain('la venta puede tributar a un tipo mayor');
    const gastos = await ayudaDe(page, 'Impuestos y gastos que pagaste al comprar');
    if (gastos !== null) expect(gastos).not.toContain('REDUCEN la ganancia');
    expect(otras).toBeNull();
    expect(gastos).toBeNull();
    expect(await ayudaDe(page, 'Inversiones y mejoras (opcional)')).toBeNull();
    await expect(page.getByRole('button', { name: /Estimar por mí/ })).toHaveCount(0);
    await expect(page.locator('h3', { hasText: 'Datos para calcular la plusvalía' })).toHaveCount(1);
    // Lo que sí alimenta la plusvalía sigue ahí.
    expect(await ayudaDe(page, 'Valor catastral del suelo')).not.toBeNull();
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('1800,00 €');
  });

  /**
   * HALLAZGO 3395 [bajo, contenido] — REPARADO (21/10/2026): la línea de la nave dice ya lo mismo
   * que la del local. Residuo de ef34f391 (efecto familia del 3387)
   * en la MISMA constante DERIVACIONES de page.tsx: la línea del local se corrigió al art. 20.Dos
   * LIVA («cuando el vendedor es empresario y renuncia porque el comprador es un empresario con
   * derecho a deducir el IVA») y la de la nave se quedó en «la renuncia a la exención de IVA … entre
   * empresarios», sin el requisito del adquirente. El art. 20.Dos (BOE-A-1992-28740, leído el
   * 21/10/2026) la limita al adquirente empresario «y se le atribuya el derecho a efectuar la
   * deducción total o parcial del Impuesto soportado» (o, si no, por el destino previsible de los
   * bienes): un empresario con actividad exenta no puede pedirla. La app de la nave lo dice bien.
   * Tipo de inmueble «Nave industrial» → esperado: el requisito del derecho a deducir, como en el
   * local · obtenido «…(art. 20.Dos LIVA) entre empresarios.»
   */
  test('REPARADO 3395 renuncia — la derivación de la nave nombra el derecho a deducir del comprador', async ({ page }) => {
    await abrir(page, 'madrid');
    await page.getByRole('button', { name: /Nave industrial/ }).click();
    const linea = (
      await page.locator('li', { hasText: 'Simulador de gastos de compra de nave industrial' }).innerText()
    ).replace(ESPACIO_DURO, ' ');
    expect(linea).toContain('art. 20.Dos LIVA');
    expect(linea).toMatch(/derecho a deducir/);
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// Inspector 24/10/2026 — la plusvalía del promotor, quién responde de cada impuesto y los cabos
// C0351 y C0354
// ══════════════════════════════════════════════════════════════════════════════
//
// Re-inspección de la REFERENCIA de la familia de compraventa tras la sesión de reparación del
// 21/10/2026 (f374a163, 4620dd66, b462c664, d41e7b5d, accfe7b4 y las notas de b8d8bff5). Los casos
// de 3393, 3394 y 3395 siguen en verde arriba. Lo nuevo se buscó donde el testigo de la familia no
// llega: la rama de obra nueva de la pestaña Vendedor (que desde el 3394 ya solo pide los datos de
// la plusvalía) y las bocas de texto que solo tiene esta app (la tabla comparativa, la FAQ de
// «¿Puedo negociar quién paga cada gasto?» y las derivaciones por tipo de inmueble).
//
// Normas leídas en el BOE el 24/10/2026 (texto consolidado):
//  · Ley 37/1992 del IVA (BOE-A-1992-28740): art. 20.Uno.20.º («Las entregas de terrenos rústicos y
//    demás que no tengan la condición de edificables»); art. 20.Dos, la renuncia a las exenciones
//    de los números 20.º y 22.º «podrán ser objeto de renuncia por el sujeto pasivo» cuando el
//    adquirente es empresario con derecho a deducir; art. 84.Uno.1.º, sujetos pasivos «Las personas
//    físicas o jurídicas que tengan la condición de empresarios o profesionales y realicen las
//    entregas de bienes»; art. 84.Uno.2.º.e), inversión del sujeto pasivo en «Las entregas exentas a
//    que se refieren los apartados 20.º y 22.º del artículo 20.Uno» en las que «el sujeto pasivo
//    hubiera renunciado a la exención».
//  · RDLeg 1/1993, TRLITPAJD (BOE-A-1993-25359): art. 7.5, las entregas de inmuebles quedan sujetas
//    a TPO «cuando gocen de exención en el Impuesto sobre el Valor Añadido»; art. 31.2, AJD de las
//    primeras copias no sujetas a TPO; art. 29, párrafo 2.º («Cuando se trate de escrituras de
//    préstamo con garantía hipotecaria, se considerará sujeto pasivo al prestamista»), en la
//    redacción del RDL 17/2018.
//  · Ley 5/2019 (BOE-A-2019-3814), art. 14.1.e): el pago del ITP y el AJD «se realizará de
//    conformidad» con la normativa tributaria; no fija quién paga el AJD.
//  · RDLeg 2/2004, TRLRHL (BOE-A-2004-4214): art. 104.5, «esta proporción se aplicará tanto al valor
//    de transmisión como, en su caso, al de adquisición»; art. 106.1.b) y 106.2, el adquirente es
//    sujeto pasivo sustituto «cuando el contribuyente sea una persona física no residente en España».
test.describe('Inspector 24/10/2026 — la plusvalía del promotor, quién responde de cada impuesto y los cabos C0351 y C0354', () => {
  const CAMPO_PRECIO = 'input[aria-label="Precio de la vivienda"]';

  /** Escribe como el usuario, comprueba que el ESTADO de React lo recogió y sale del campo. */
  async function sembrar(page: Page, etiqueta: string, valor: string): Promise<void> {
    const campo = page.locator(`input[aria-label="${etiqueta}"]`);
    await campo.fill(valor);
    await esperarValorEnReact(page, campo, valor);
    await campo.blur();
  }

  async function abrir(page: Page, ccaa: string, primeraMano = false): Promise<void> {
    await page.goto(RUTA);
    await esperarHidratacion(page, [CAMPO_PRECIO]);
    await page.locator('#ccaa-inmueble').selectOption(ccaa);
    if (primeraMano) await page.getByRole('button', { name: /Primera mano/ }).click();
  }

  async function irAVendedor(page: Page): Promise<void> {
    await page.getByRole('button', { name: 'Vendedor' }).click();
    await esperarHidratacion(page, ['input[aria-label="Precio de compra original"]']);
  }

  const rotulo = async (page: Page, titulo: RegExp): Promise<string> =>
    (await page.locator('h3', { hasText: titulo }).first().innerText()).replace(ESPACIO_DURO, ' ');

  const limpio = (s: string | null): string => (s ?? '').replace(ESPACIO_DURO, ' ').replace(/\s+/g, ' ').trim();

  /** Las preguntas del FAQPage servido, con su respuesta. */
  async function faqPage(page: Page): Promise<{ pregunta: string; respuesta: string }[]> {
    const bloques = await page.locator('script[type="application/ld+json"]').allTextContents();
    const out: { pregunta: string; respuesta: string }[] = [];
    for (const b of bloques) {
      const j = JSON.parse(b) as { '@type'?: string; mainEntity?: { name: string; acceptedAnswer: { text: string } }[] };
      if (j['@type'] !== 'FAQPage') continue;
      for (const q of j.mainEntity ?? []) out.push({ pregunta: q.name, respuesta: limpio(q.acceptedAnswer.text) });
    }
    return out;
  }

  /** El texto (textContent) del párrafo que responde a una pregunta de la FAQ visible. */
  async function faqVisible(page: Page, pregunta: string): Promise<string> {
    return limpio(await page.locator('h4', { hasText: pregunta }).locator('xpath=following-sibling::p[1]').textContent());
  }

  /** Las celdas de una fila de la tabla comparativa, por su concepto. */
  async function filaComparativa(page: Page, concepto: string): Promise<string[]> {
    const fila = page.locator('table tr', { has: page.locator('td', { hasText: new RegExp(`^${concepto}$`) }) }).first();
    return (await fila.locator('td').allTextContents()).map(limpio);
  }

  /**
   * CASO 82 (normal) — Andalucía, segunda mano, vivienda de 180.000 €, perfil General.
   *  Comprador (ITP_CCAA.andalucia, tipo general 7 %; aranceles de data/itp-ccaa.ts con la rebaja
   *  del 5 % y el 21 % de IVA):
   *   ITP 180.000 × 7 % = 12.600,00 € «ITP (7,00 %)»
   *   Notaría: 90,151816 + 24.040,49 × 0,45 % + 30.050,60 × 0,15 % + 90.151,82 × 0,10 % + 29.746,97
   *     × 0,05 % = 348,4352 × 0,95 × 1,21 = 400,5263 (arancel) → factura × 1,75 = 700,92 € (× 1,5 =
   *     600,79 · × 2 = 801,05)
   *   Registro: 24,040484 + 24.040,49 × 0,175 % + 30.050,60 × 0,125 % + 90.151,82 × 0,075 % +
   *     29.746,97 × 0,03 % = 180,2125 × 0,95 = 171,2019 + 6,010121 + 3,005061 = 180,2171 × 1,21 = 218,06 €
   *   Gestoría 300 · total 12.600 + 700,92 + 218,06 + 300 = 13.818,98 € (7,68 %) · coste 193.818,98 €
   *   «Podrías pagar menos»: solo el 3,50 % de municipios despoblados (el 6 % de vivienda habitual
   *   tiene tope de 150.000 €; los de jóvenes, familia y discapacidad son de colectivo).
   *  Vendedor: compra 110.000 · 12 años · gastos de aquella compra 8.000 · mejoras 4.000 · suelo
   *  30.000 · total 90.000 · comisión 3 % (la de fábrica) · otros gastos 500:
   *   Plusvalía: objetivo 30.000 × 0,09 (12 años) × 25 % = 675 · real 70.000 × 30/90 × 25 % =
   *     5.833,33 → «675,00 €», método objetivo
   *   Comisión 5.400 · transmisión 180.000 − 5.400 − 500 − 675 = 173.425 · adquisición 122.000 ·
   *     ganancia 51.425 · IRPF 6.000 × 19 % + 44.000 × 21 % + 1.425 × 23 % = 1.140 + 9.240 + 327,75 =
   *     10.707,75 € · total 675 + 5.400 + 500 + 10.707,75 = 17.282,75 · neto 162.717,25 €
   */
  test('CASO 82 (normal) — Andalucía, 180.000: comprador y vendedor con gastos, mejoras y otros gastos', async ({ page }) => {
    test.setTimeout(90_000);
    expect(ITP_CCAA.andalucia.tipoGeneral).toBe(7);
    expect(COEFICIENTES_IIVTNU_2025.find((c) => c.anios === 12)?.coeficiente).toBe(0.09);
    expect(PLUSVALIA_MUNICIPAL_META.tipoOrientativo).toBe(25);
    expect(REBAJA_ARANCEL_CUANTIA).toBe(0.05);

    await abrir(page, 'andalucia');
    await sembrar(page, 'Precio de la vivienda', '180000');
    expect(await rotulo(page, /^ITP \(/)).toBe('ITP (7,00 %)');
    expect(await valorTarjeta(page, /^ITP \(/)).toBe('12.600,00 €');
    expect(await valorTarjeta(page, /^Gastos de notaría/)).toBe('700,92 €');
    expect(await descripcionTarjeta(page, /^Gastos de notaría/)).toContain('Factura estimada entre 600,79 € y 801,05 €');
    expect(await valorTarjeta(page, /^Registro de la Propiedad/)).toBe('218,06 €');
    expect(await valorTarjeta(page, 'Gastos de gestoría')).toBe('300,00 €');
    expect(await valorTarjeta(page, /^Total gastos adicionales/)).toBe('13.818,98 €');
    expect(await descripcionTarjeta(page, /^Total gastos adicionales/)).toBe('7,68 % sobre el precio');
    expect(await valorTarjeta(page, /^COSTE TOTAL/)).toBe('193.818,98 €');
    const aviso = limpio(
      await page.locator('[role="note"]', { hasText: 'Podrías pagar menos' }).first().textContent(),
    );
    expect(aviso).toContain('3,50 % — Municipios despoblados');
    expect(aviso).not.toContain('Vivienda habitual (valor');

    await irAVendedor(page);
    await sembrar(page, 'Precio de compra original', '110000');
    await sembrar(page, 'Años de propiedad', '12');
    await sembrar(page, 'Impuestos y gastos que pagaste al comprar', '8000');
    await sembrar(page, 'Inversiones y mejoras (opcional)', '4000');
    await sembrar(page, 'Valor catastral del suelo', '30000');
    await sembrar(page, 'Valor catastral total (suelo + construcción)', '90000');
    await sembrar(page, 'Otros gastos de la venta (opcional)', '500');
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('675,00 €');
    expect(await descripcionTarjeta(page, 'Plusvalía municipal')).toBe('Método objetivo (más favorable)');
    expect(await valorTarjeta(page, 'Valor de adquisición')).toBe('122.000,00 €');
    expect(await valorTarjeta(page, 'Valor de transmisión')).toBe('173.425,00 €');
    expect(await valorTarjeta(page, /^Ganancia patrimonial/)).toBe('51.425,00 €');
    expect(await valorTarjeta(page, /^IRPF sobre ganancia/)).toBe('10.707,75 €');
    expect(await valorTarjeta(page, /^Comisión inmobiliaria/)).toBe('5400,00 €');
    expect(await valorTarjeta(page, 'Otros gastos de la venta')).toBe('500,00 €');
    expect(await valorTarjeta(page, /^Total gastos vendedor/)).toBe('17.282,75 €');
    expect(await rotulo(page, /^IMPORTE NETO VENDEDOR/)).toBe('IMPORTE NETO VENDEDOR');
    expect(await valorTarjeta(page, /^IMPORTE NETO VENDEDOR/)).toBe('162.717,25 €');
    expect(await descripcionTarjeta(page, /^IMPORTE NETO VENDEDOR/)).toBe('Lo que realmente recibes');
  });

  /**
   * CONTROL de montaje del hallazgo de la plusvalía del promotor: va en VERDE antes y después de
   * repararlo. En SEGUNDA mano lo que se compró era el mismo inmueble, con suelo y construcción, y la
   * proporción catastral se aplica a la compra y a la venta (art. 104.5 TRLRHL): lo que hace la app.
   *  Madrid · segunda mano · 300.000 · compra 160.000 · 7 años · suelo 150.000 · total 300.000 ·
   *  comisión 3 %: objetivo 150.000 × 0,20 × 25 % = 7.500 · real (300.000 − 160.000) × 0,5 × 25 % =
   *  17.500 → «7500,00 €» · transmisión 283.500 · ganancia 123.500 · IRPF 1.140 + 9.240 + 73.500 ×
   *  23 % (16.905) = 27.285,00 € · total 7.500 + 9.000 + 27.285 = 43.785,00 · neto 256.215,00 €.
   *  Y en obra nueva, con los mismos datos, no se publica la renta del promotor y la comisión es la misma.
   */
  test('CONTROL de montaje — la proporción catastral en segunda mano, y la obra nueva sin la renta del promotor', async ({
    page,
  }) => {
    test.setTimeout(90_000);
    expect(COEFICIENTES_IIVTNU_2025.find((c) => c.anios === 7)?.coeficiente).toBe(0.2);
    await abrir(page, 'madrid');
    await sembrar(page, 'Precio de la vivienda', '300000');
    await irAVendedor(page);
    await sembrar(page, 'Precio de compra original', '160000');
    await sembrar(page, 'Años de propiedad', '7');
    await sembrar(page, 'Valor catastral del suelo', '150000');
    await sembrar(page, 'Valor catastral total (suelo + construcción)', '300000');
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('7500,00 €');
    expect(await descripcionTarjeta(page, 'Plusvalía municipal')).toBe('Método objetivo (más favorable)');
    expect(await valorTarjeta(page, 'Valor de transmisión')).toBe('283.500,00 €');
    expect(await valorTarjeta(page, /^Ganancia patrimonial/)).toBe('123.500,00 €');
    expect(await valorTarjeta(page, /^IRPF sobre ganancia/)).toBe('27.285,00 €');
    expect(await valorTarjeta(page, /^Total gastos vendedor/)).toBe('43.785,00 €');
    expect(await valorTarjeta(page, /^IMPORTE NETO VENDEDOR/)).toBe('256.215,00 €');

    await page.getByRole('button', { name: /Primera mano/ }).click();
    expect(await valorTarjeta(page, 'Impuesto sobre la renta de la venta')).toBe('Sin calcular');
    expect(await valorTarjeta(page, /^Comisión inmobiliaria/)).toBe('9000,00 €');
  });

  /**
   * CASO 84 (debe rechazarse) — Madrid, segunda mano, 200.000 €, precio de compra «150.000.50»
   * (NaN por diseño: el millar y el decimal a la estadounidense), 10 años, suelo 40.000.
   *  Sin precio de compra no se puede liquidar ni la plusvalía ni el IRPF, y no es un 0: comisión
   *  200.000 × 3 % = 6.000 · total 6.000 (parcial) · neto 194.000,00 € (PARCIAL), nombrando el campo.
   *  Corregido a «150.000»: plusvalía objetivo 40.000 × 0,12 × 25 % = 1.200 (sin total, no se compara)
   *  · transmisión 200.000 − 6.000 − 1.200 = 192.800 · ganancia 42.800 · IRPF 1.140 + 36.800 × 21 % =
   *  8.868,00 € · total 1.200 + 6.000 + 8.868 = 16.068,00 · neto 183.932,00 €.
   */
  test('CASO 84 (debe rechazarse) — el precio de compra ilegible no es un cero', async ({ page }) => {
    test.setTimeout(90_000);
    expect(COEFICIENTES_IIVTNU_2025.find((c) => c.anios === 10)?.coeficiente).toBe(0.12);
    await abrir(page, 'madrid');
    await sembrar(page, 'Precio de la vivienda', '200000');
    await irAVendedor(page);
    await sembrar(page, 'Precio de compra original', '150.000.50');
    await sembrar(page, 'Años de propiedad', '10');
    await sembrar(page, 'Valor catastral del suelo', '40000');
    await expect(page.locator('input[aria-label="Precio de compra original"]')).toHaveValue('150.000.50');
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('Sin calcular');
    expect(await descripcionTarjeta(page, 'Plusvalía municipal')).toBe(
      'El precio de compra original no se ha podido leer. Este impuesto NO está incluido en el neto de abajo.',
    );
    expect(await valorTarjeta(page, /^IRPF sobre ganancia/)).toBe('Sin calcular');
    expect(await descripcionTarjeta(page, /^IRPF sobre ganancia/)).toBe(
      'El precio de compra original no se ha podido leer: escríbelo con coma decimal (1.234,56). Este impuesto NO está incluido en el neto de abajo.',
    );
    expect(await valorTarjeta(page, /^Comisión inmobiliaria/)).toBe('6000,00 €');
    expect(await rotulo(page, /^Total gastos vendedor/)).toBe('Total gastos vendedor (parcial)');
    expect(await valorTarjeta(page, /^Total gastos vendedor/)).toBe('6000,00 €');
    expect(await rotulo(page, /^IMPORTE NETO VENDEDOR/)).toBe('IMPORTE NETO VENDEDOR (PARCIAL)');
    expect(await valorTarjeta(page, /^IMPORTE NETO VENDEDOR/)).toBe('194.000,00 €');
    expect(await descripcionTarjeta(page, /^IMPORTE NETO VENDEDOR/)).toBe(
      'No descuenta la plusvalía municipal ni el IRPF de la ganancia: el neto real puede ser menor que este. El precio de compra original no se ha podido leer. Escribe con coma decimal (1.234,56) lo que no se ha podido leer para obtenerlo.',
    );

    await sembrar(page, 'Precio de compra original', '150.000');
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('1200,00 €');
    expect(await valorTarjeta(page, /^Ganancia patrimonial/)).toBe('42.800,00 €');
    expect(await valorTarjeta(page, /^IRPF sobre ganancia/)).toBe('8868,00 €');
    expect(await valorTarjeta(page, /^Total gastos vendedor/)).toBe('16.068,00 €');
    expect(await valorTarjeta(page, /^IMPORTE NETO VENDEDOR/)).toBe('183.932,00 €');
  });

  // ─── HALLAZGOS de esta vuelta: los seis, REPARADOS el 24/10/2026 (sin test.fail; la base no
  // tiene ninguno abierto al 25/10/2026). Se escribieron con test.fail y hoy son regresión. ──────

  /**
   * HALLAZGO 3466 [medio, cálculo] — REPARADO (abierto el 24/10/2026). En obra nueva (la pestaña
   * Vendedor pide desde el 3394 solo los «Datos para calcular la plusvalía»), lo que compró el
   * promotor fue normalmente el SUELO, un solar. El art. 104.5 TRLRHL aplica la proporción catastral
   * suelo/total al valor de transmisión y «en su caso» al de adquisición, es decir, cuando lo
   * adquirido también tenía construcción. `calcularPlusvaliaMunicipal` (data/itp-ccaa.ts) la aplicaba
   * siempre a (venta − compra), así que el método real salía más alto de lo que la ley permite y no
   * lo decía.
   *  CASO 83 (límite) — Madrid · Primera mano · vivienda 300.000 · compra del solar 160.000 · 7 años ·
   *  suelo 150.000 · total 300.000 · comisión 3 %:
   *   · valor del suelo en la venta 300.000 × 150/300 = 150.000 ≤ 160.000 pagados por el solar →
   *     NO SUJETA (art. 104.5) · la app daba entonces: objetivo 150.000 × 0,20 × 25 % = «7500,00 €»
   *   · compra del solar 140.000: incremento real 150.000 − 140.000 = 10.000 → 2.500,00 € (art.
   *     107.5) frente al objetivo de 7.500 · la app daba: real (300.000 − 140.000) × 0,5 × 25 % =
   *     20.000, así que se quedaba en «7500,00 €»
   * REPARADO (24/10/2026, decisión del usuario): en obra nueva la pestaña Vendedor pregunta «¿Qué
   * compraste?» (por defecto, el solar) y `calcularPlusvaliaMunicipal` recibe
   * `adquisicionSoloSuelo`: la venta se reparte en la proporción catastral y la compra del solar
   * entra entera, para la no sujeción y para el método real. Art. 104.5 y 107.5 TRLRHL releídos en
   * el BOE (BOE-A-2004-4214, consolidado) el 24/10/2026. Con «Un inmueble ya construido» la
   * proporción vuelve a ir a las dos (CONTROL), y sin el valor catastral total la venta no se puede
   * repartir: objetivo, con el aviso de que puede salir más baja.
   */
  test('HALLAZGO plusvalía del promotor — en obra nueva la proporción catastral no se aplica a la compra del solar', async ({
    page,
  }) => {
    test.setTimeout(90_000);
    await abrir(page, 'madrid', true);
    await sembrar(page, 'Precio de la vivienda', '300000');
    await irAVendedor(page);
    await sembrar(page, 'Precio de compra original', '160000');
    await sembrar(page, 'Años de propiedad', '7');
    await sembrar(page, 'Valor catastral del suelo', '150000');
    await sembrar(page, 'Valor catastral total (suelo + construcción)', '300000');
    // 300.000 × 150/300 = 150.000 ≤ 160.000 pagados por el solar → no sujeta.
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('NO SUJETA');
    expect(await descripcionTarjeta(page, 'Plusvalía municipal')).toBe(
      'No sujeta: el valor del suelo en la venta (150.000,00 €) no supera lo que se pagó por el solar (art. 104.5 TRLRHL)',
    );
    // Neto: 300.000 − 9.000 de comisión.
    expect(await valorTarjeta(page, /^IMPORTE NETO VENDEDOR/)).toBe('291.000,00 €');

    // 150.000 − 140.000 = 10.000 × 25 % = 2.500, por debajo del objetivo (150.000 × 0,20 × 25 % = 7.500).
    await sembrar(page, 'Precio de compra original', '140000');
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('2500,00 €');
    expect(await descripcionTarjeta(page, 'Plusvalía municipal')).toContain('menos lo pagado por el solar');

    // CONTROL: comprado ya construido, la proporción va también a la compra:
    // (300.000 − 140.000) × 0,5 × 25 % = 20.000 > 7.500 → objetivo.
    await page.getByLabel('¿Qué compraste?').selectOption('construido');
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('7500,00 €');
    expect(await descripcionTarjeta(page, 'Plusvalía municipal')).toBe('Método objetivo (más favorable)');

    // Solar sin el valor catastral total: no se puede repartir la venta → objetivo, con el aviso.
    await page.getByLabel('¿Qué compraste?').selectOption('solar');
    await sembrar(page, 'Valor catastral total (suelo + construcción)', '');
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('7500,00 €');
    expect(await descripcionTarjeta(page, 'Plusvalía municipal')).toContain(
      'Al haberse comprado un solar, puede salir más baja o no sujeta',
    );
  });

  /**
   * HALLAZGO 3467 [bajo, dato] — REPARADO (abierto el 24/10/2026, cabo C0354). La app daba la
   * plusvalía municipal como del vendedor sin la salvedad del art. 106.2 TRLRHL: si vende una persona
   * física no residente en España, el comprador es sujeto pasivo sustituto y es él quien la ingresa.
   * La hermana solar la lleva desde d91a94ed (SALVEDAD_PLUSVALIA_NO_RESIDENTE). Bocas que la callaban:
   * el FAQPage «¿Qué es la plusvalía municipal y quién la paga?» («La paga el vendedor, salvo en
   * herencias y donaciones»), la FAQ «¿Puedo negociar quién paga cada gasto?» (visible y FAQPage,
   * RESPUESTA_QUIEN_PAGA: «el vendedor de la plusvalía municipal»), la tarjeta «Plusvalía municipal»
   * de la guía («El vendedor debe pagar…») y la tabla comparativa («¿Quién paga?» → «Vendedor»).
   */
  // REPARADO (hallazgo 3467, 24/10/2026): SALVEDAD_PLUSVALIA_NO_RESIDENTE, ahora en data/itp-ccaa.ts.
  test('HALLAZGO C0354 — la plusvalía municipal lleva la salvedad del comprador sustituto (no residente)', async ({
    page,
  }) => {
    await page.goto(RUTA);
    const faq = await faqPage(page);
    const quien = faq.find((q) => q.pregunta === '¿Qué es la plusvalía municipal y quién la paga?');
    expect(quien, 'la pregunta sigue en el FAQPage').toBeTruthy();
    expect(quien!.respuesta).toContain('no residente');
    expect(await faqVisible(page, '¿Puedo negociar quién paga cada gasto?')).toContain('no residente');
    const tarjeta = limpio(await page.locator('h4', { hasText: /Plusvalía municipal$/ }).first().locator('..').textContent());
    expect(tarjeta).toContain('no residente');
    expect((await filaComparativa(page, 'Plusvalía municipal'))[3]).toContain('no residente');
  });

  /**
   * HALLAZGO 3469 [bajo, dato] — REPARADO (abierto el 24/10/2026). RESPUESTA_QUIEN_PAGA (FAQ visible
   * y FAQPage, una sola constante) decía que lo que el pacto no cambia es quién responde de cada
   * impuesto ante la Administración, «el comprador del ITP o del IVA y el AJD». Del IVA no: el sujeto
   * pasivo es quien entrega, el promotor (Ley 37/1992, art. 84.Uno.1.º); el comprador lo soporta en
   * la factura. Solo con inversión del sujeto pasivo (art. 84.Uno.2.º.e, la renuncia) lo ingresa el
   * comprador, y esa no es la obra nueva de vivienda que calcula la app. Solo esta app de la familia
   * tenía la frase.
   */
  // REPARADO (hallazgo 3469, 24/10/2026): del IVA de la obra nueva responde el promotor, que lo repercute.
  test('HALLAZGO quién responde del IVA — la FAQ no hace al comprador responsable del IVA ante la Administración', async ({
    page,
  }) => {
    await page.goto(RUTA);
    expect(await faqVisible(page, '¿Puedo negociar quién paga cada gasto?')).not.toContain('el comprador del ITP o del IVA');
    const faq = await faqPage(page);
    const negociar = faq.find((q) => q.pregunta === '¿Puedo negociar quién paga cada gasto?');
    expect(negociar!.respuesta).not.toContain('el comprador del ITP o del IVA');
  });

  /**
   * HALLAZGO 3468 [bajo, dato] — REPARADO (abierto el 24/10/2026, cabo C0351). La derivación del
   * terreno a la finca rústica decía que el suelo rústico «paga ITP incluso cuando el vendedor es un
   * empresario». Con la
   * renuncia a la exención (art. 20.Dos LIVA: el comprador es empresario con derecho a deducir) la
   * entrega va por IVA con inversión del sujeto pasivo (art. 84.Uno.2.º.e) y AJD (TRLITPAJD, arts.
   * 7.5 y 31.2), no por ITP: es lo que la app del rústico calcula con su opción de renuncia. La misma
   * frase en el FAQPage del solar fue el hallazgo 3268.
   */
  // REPARADO (hallazgo 3468, 24/10/2026), y la caja «Errores comunes» nombra la renuncia en segunda mano.
  test('HALLAZGO C0351 — la derivación del rústico nombra la renuncia a la exención', async ({ page }) => {
    await abrir(page, 'madrid');
    await page.getByRole('button', { name: /Terreno/ }).click();
    // Obtenido hoy: «…exento de IVA (art. 20.Uno.20º LIVA): paga ITP incluso cuando el vendedor es un
    // empresario, y no genera plusvalía municipal…», sin la renuncia.
    const linea = limpio(await page.locator('li', { hasText: 'Simulador de gastos de compra de finca rústica' }).textContent());
    expect(linea).toMatch(/renuncia/);
  });

  /**
   * HALLAZGO 3470 [bajo, dato] — REPARADO (abierto el 24/10/2026). Residuo del cabo C0349
   * (f374a163): el FAQPage y la tarjeta «IRPF del vendedor» ya decían que en una primera entrega vende
   * el promotor, cuya renta es de actividad económica (art. 27.1 LIRPF) o del Impuesto sobre
   * Sociedades, y la pestaña Vendedor no publica cuota en obra nueva (AVISO_VENTA_PROMOTOR). La tabla
   * comparativa seguía dando, en la columna «Vivienda nueva», «IRPF ganancia patrimonial · 19 % – 30 %
   * · Vendedor».
   */
  // REPARADO (hallazgo 3470, 24/10/2026).
  test('HALLAZGO tabla del promotor — la columna «Vivienda nueva» no da la ganancia del ahorro como renta del promotor', async ({
    page,
  }) => {
    await page.goto(RUTA);
    const fila = await filaComparativa(page, 'IRPF ganancia patrimonial');
    expect(fila[2]).toBe('19 % – 30 %');
    expect(fila[1]).not.toBe('19 % – 30 %');
  });

  /**
   * HALLAZGO 3471 [bajo, dato] — REPARADO (abierto el 24/10/2026). La tabla comparativa atribuía a la
   * Ley 5/2019 que el AJD de la hipoteca lo pague la entidad («Comprador · con hipoteca, la entidad
   * financiera (Ley 5/2019)»). Esa ley remite a la normativa tributaria (art. 14.1.e); quien hace sujeto pasivo al
   * prestamista es el art. 29 TRLITPAJD en la redacción del RDL 17/2018. El mismo error está en la
   * nota de TIPOS_AJD_2025 (data/fiscal/inmuebles.ts), que esta app no pinta.
   */
  // REPARADO (hallazgo 3471, 24/10/2026) en la tabla; la nota de TIPOS_AJD_2025 en data/fiscal queda a decisión (fiscal).
  test('HALLAZGO norma del AJD de la hipoteca — la tabla cita el art. 29 TRLITPAJD (RDL 17/2018)', async ({ page }) => {
    await page.goto(RUTA);
    // Obtenido hoy: «Comprador · con hipoteca, la entidad financiera (Ley 5/2019)».
    const fila = await filaComparativa(page, 'AJD');
    expect(fila[3]).toMatch(/17\/2018|art\. 29/);
  });
});

test.describe('Inspector 24/10/2026 — 390 px', () => {
  test.use({
    viewport: { width: 390, height: 844 },
    userAgent:
      'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  });

  async function sembrar(page: Page, etiqueta: string, valor: string): Promise<void> {
    const campo = page.locator(`input[aria-label="${etiqueta}"]`);
    await campo.fill(valor);
    await esperarValorEnReact(page, campo, valor);
    await campo.blur();
  }

  const sobra = (page: Page) =>
    page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);

  /**
   * CASO 82 en móvil (cifras a mano en el describe de arriba): Andalucía, 180.000 €, coste total
   * 193.818,98 €; en el vendedor, mayor de 65 con 2 años de propiedad: sin la casilla de la excepción
   * del art. 41 bis.1 RIRPF no hay exención, y la casilla se puede marcar en 390 px.
   *  Vendedor: compra 110.000 · 2 años · suelo 30.000 · total 90.000 · comisión 3 %: objetivo 30.000 ×
   *  0,14 × 25 % = 1.050 · real 70.000 × 30/90 × 25 % = 5.833,33 → 1.050 · transmisión 180.000 −
   *  5.400 − 1.050 = 173.550 · ganancia 63.550 · IRPF 1.140 + 9.240 + 13.550 × 23 % (3.116,50) =
   *  13.496,50 € · con la excepción, EXENTO y neto 180.000 − 1.050 − 5.400 = 173.550,00 €.
   */
  test('CASO 82 en 390 px — coste del comprador, y el 41 bis del mayor de 65 sin desbordar', async ({ page }) => {
    test.setTimeout(90_000);
    expect(COEFICIENTES_IIVTNU_2025.find((c) => c.anios === 2)?.coeficiente).toBe(0.14);
    await page.goto(RUTA);
    await esperarHidratacion(page, ['input[aria-label="Precio de la vivienda"]']);
    await page.locator('#ccaa-inmueble').selectOption('andalucia');
    await sembrar(page, 'Precio de la vivienda', '180000');
    expect(await valorTarjeta(page, /^COSTE TOTAL/)).toBe('193.818,98 €');
    expect(await sobra(page)).toBeLessThanOrEqual(0);

    await page.getByRole('button', { name: 'Vendedor' }).click();
    await esperarHidratacion(page, ['input[aria-label="Precio de compra original"]']);
    await sembrar(page, 'Precio de compra original', '110000');
    await sembrar(page, 'Años de propiedad', '2');
    await sembrar(page, 'Valor catastral del suelo', '30000');
    await sembrar(page, 'Valor catastral total (suelo + construcción)', '90000');
    await page.getByRole('checkbox', { name: /Soy mayor de 65 años/ }).check();
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('1050,00 €');
    expect(await valorTarjeta(page, /^IRPF sobre ganancia/)).toBe('13.496,50 €');
    const excepcion = page.getByRole('checkbox', { name: /menos de 3 años por una causa/ });
    await excepcion.tap();
    await expect(excepcion).toBeChecked();
    expect(await valorTarjeta(page, /^IRPF sobre ganancia/)).toBe('EXENTO');
    expect(await valorTarjeta(page, /^IMPORTE NETO VENDEDOR/)).toBe('173.550,00 €');
    expect(await sobra(page)).toBeLessThanOrEqual(0);
  });
});

/* ═══════════════════════════════════════════════════════════════════════════════════════════
 * Inspector 25/10/2026 — la app de REFERENCIA de la familia «Compraventa inmobiliaria», en la cola
 * como INVALIDADA por 92df481b (hallazgo 3466), aa47727a (3467-3471), 8c473228 (ResultCard, 3481) y
 * 8d859faf (49 ternarios de fragmento contra fragmento). La base no tiene ninguno abierto.
 *
 * Todas las cifras se resolvieron a mano ANTES de abrir la app, con los datos de
 * data/fiscal/inmuebles.ts (TIPOS_ITP_CCAA_2025, COEFICIENTES_IIVTNU_2025, PLUSVALIA_MUNICIPAL_META,
 * TRAMOS_GANANCIAS_PATRIMONIALES_2025, IVA_INMUEBLES_2025), data/itp-ccaa.ts (ITP_CCAA, aranceles y
 * calcularPlusvaliaMunicipal) y data/fiscal/ganancia-inmueble.ts, y el art. 104.5, 106.2 y 107.5
 * TRLRHL leídos en el BOE (BOE-A-2004-4214, consolidado) el 25/10/2026. Las cinco cuadraron al céntimo.
 *
 * SE SOSTIENEN: el 3466 (el solar a 150.000, 148.000 y 100.000, además del 160.000 y el 140.000
 * del describe anterior), las bocas del 3467-3471 (las cubren los tests del describe del 24/10, en
 * verde) y el 3481 y los ternarios de 8d859faf: con la página traducida, las tarjetas de toda la
 * pestaña Vendedor y la obra nueva siguen al cálculo y no caen (test «página traducida — …»).
 *
 * NO SE SOSTIENE la página traducida FUERA de las tarjetas (el JSX que la hermana garaje midió hoy y
 * dijo que esta app comparte, y cuatro sitios más): ver los HALLAZGOS del final, con test.fail.
 * ═══════════════════════════════════════════════════════════════════════════════════════════ */

test.describe('Inspector 25/10/2026 — las reparaciones del 24/10, la página traducida y el tope del art. 38.3', () => {
  const CAMPO_PRECIO = 'input[aria-label="Precio de la vivienda"]';

  /** Escribe como el usuario, comprueba que el ESTADO de React lo recogió y sale del campo. */
  async function sembrar(page: Page, etiqueta: string, valor: string): Promise<void> {
    const campo = page.locator(`input[aria-label="${etiqueta}"]`);
    await campo.fill(valor);
    await esperarValorEnReact(page, campo, valor);
    await campo.blur();
  }

  async function abrir(page: Page, ccaa: string, primeraMano = false): Promise<void> {
    await page.goto(RUTA);
    await esperarHidratacion(page, [CAMPO_PRECIO]);
    await page.locator('#ccaa-inmueble').selectOption(ccaa);
    if (primeraMano) await page.getByRole('button', { name: /Primera mano/ }).click();
  }

  async function irAVendedor(page: Page): Promise<void> {
    await page.getByRole('button', { name: 'Vendedor', exact: true }).click();
    await esperarHidratacion(page, ['input[aria-label="Precio de compra original"]']);
  }

  const limpio = (s: string | null): string => (s ?? '').replace(ESPACIO_DURO, ' ').replace(/\s+/g, ' ').trim();
  const rotulo = async (page: Page, titulo: RegExp): Promise<string> =>
    limpio(await page.locator('h3', { hasText: titulo }).first().textContent());
  const podriasPagarMenos = (page: Page) => page.locator('[role="note"]', { hasText: 'Podrías pagar menos' }).first();

  // ─── El traductor del navegador, como en tests/apps/generador-loteria.spec.ts ──────────────
  interface NodoTraducido { nodo: Text; valor: string | null; avisado: boolean }
  type VentanaTraducida = Window & { __nodosTraducidos?: NodoTraducido[] };

  /** Cada nodo de texto visible pasa a <font><font>texto</font></font>, y se apunta el retirado. */
  const traducir = (page: Page) =>
    page.evaluate(() => {
      const w = window as VentanaTraducida;
      const apuntados = (w.__nodosTraducidos = w.__nodosTraducidos ?? []);
      const caminante = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
        acceptNode: (n) => {
          const padre = n.parentElement;
          if (!padre || !(n.nodeValue ?? '').trim()) return NodeFilter.FILTER_REJECT;
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
        apuntados.push({ nodo, valor: nodo.nodeValue, avisado: false });
        nodo.parentNode?.replaceChild(exterior, nodo);
      }
    });

  /** Detector de texto viejo: un nodo ya retirado en el que React ha vuelto a escribir. */
  const textoViejo = (page: Page) =>
    page.evaluate(() => {
      const r: string[] = [];
      for (const t of (window as VentanaTraducida).__nodosTraducidos ?? []) {
        if (!t.avisado && t.nodo.nodeValue !== t.valor) {
          t.avisado = true;
          r.push(`«${t.valor}» → «${t.nodo.nodeValue}»`);
        }
      }
      return r;
    });

  /** Errores de React al tocar nodos que el traductor ya cambió. */
  function vigilarErrores(page: Page): string[] {
    const errores: string[] = [];
    page.on('pageerror', (e) => errores.push(e.message));
    page.on('console', (m) => {
      if (m.type() === 'error' && /NotFoundError|insertBefore|removeChild/.test(m.text())) errores.push(m.text());
    });
    return errores;
  }

  const enPie = (page: Page) => expect(page.getByRole('heading', { name: 'Algo salió mal' })).toHaveCount(0);

  /**
   * Escribe con la página traducida SIN salir del campo antes de mirar si la app sigue en pie: si
   * cae, el campo desaparece y un blur o una espera del estado agotarían el tiempo en vez de decir
   * por qué falla.
   */
  async function escribirTraducida(page: Page, etiqueta: string, valor: string): Promise<void> {
    const campo = page.locator(`input[aria-label="${etiqueta}"]`);
    await campo.fill(valor);
    await enPie(page);
    await esperarValorEnReact(page, campo, valor);
    await campo.blur();
  }

  /**
   * CASO 85 (normal) — Cantabria, segunda mano, vivienda de 250.000 €, perfil General.
   *  Comprador (ITP_CCAA.cantabria: tipo general 9 % de TIPOS_ITP_CCAA_2025, sin escala; aranceles
   *  de data/itp-ccaa.ts con la rebaja del 5 % del nº 2.1 y el 21 % de IVA):
   *   ITP 250.000 × 9 % = 22.500,00 € «ITP (9,00 %)»
   *   Notaría: 90,151816 + 24.040,49 × 0,45 % + 30.050,60 × 0,15 % + 90.151,82 × 0,10 % + 99.746,97 ×
   *     0,05 % = 383,4352 × 0,95 × 1,21 = 440,7588 (arancel) → factura × 1,75 = 771,33 € (× 1,5 =
   *     661,14 · × 2 = 881,52)
   *   Registro: 24,040484 + 24.040,49 × 0,175 % + 30.050,60 × 0,125 % + 90.151,82 × 0,075 % +
   *     99.746,97 × 0,03 % = 201,2125 × 0,95 = 191,1519 + 6,010121 + 3,005061 = 200,1671 × 1,21 = 242,20 €
   *   Gestoría 300 · total 22.500 + 771,33 + 242,20 + 300 = 23.813,53 € (9,53 %) · coste 273.813,53 €
   *   «Podrías pagar menos»: solo «Municipios despoblados» al 4 % (el 7 % de vivienda habitual tiene
   *   tope de 200.000 €; jóvenes, familia, discapacidad y VPO son de colectivo): «En Cantabria existe:»
   *  Vendedor: compra 150.000 · 11 años · gastos de aquella compra 12.000 · suelo 60.000 · total
   *  150.000 · comisión 3 %:
   *   Plusvalía: objetivo 60.000 × 0,10 (11 años) × 25 % = 1.500 · real 100.000 × 60/150 × 25 % =
   *     10.000 → «1500,00 €», método objetivo
   *   Comisión 7.500 · transmisión 250.000 − 7.500 − 1.500 = 241.000 · adquisición 162.000 · ganancia
   *     79.000 · IRPF 6.000 × 19 % + 44.000 × 21 % + 29.000 × 23 % = 1.140 + 9.240 + 6.670 = 17.050,00 €
   *   Total 1.500 + 7.500 + 17.050 = 26.050,00 · neto 223.950,00 €
   */
  test('CASO 85 (normal) — Cantabria, 250.000: el ITP del comprador y la ganancia y el IRPF del vendedor', async ({ page }) => {
    test.setTimeout(90_000);
    expect(ITP_CCAA.cantabria.tipoGeneral).toBe(9);
    expect(ITP_CCAA.cantabria.tramosProgresivos).toBeUndefined();
    expect(COEFICIENTES_IIVTNU_2025.find((c) => c.anios === 11)?.coeficiente).toBe(0.1);
    expect(PLUSVALIA_MUNICIPAL_META.tipoOrientativo).toBe(25);

    await abrir(page, 'cantabria');
    await sembrar(page, 'Precio de la vivienda', '250000');
    expect(await rotulo(page, /^ITP \(/)).toBe('ITP (9,00 %)');
    expect(await valorTarjeta(page, /^ITP \(/)).toBe('22.500,00 €');
    expect(await valorTarjeta(page, /^Gastos de notaría/)).toBe('771,33 €');
    expect(await descripcionTarjeta(page, /^Gastos de notaría/)).toContain('Factura estimada entre 661,14 € y 881,52 €');
    expect(await valorTarjeta(page, /^Registro de la Propiedad/)).toBe('242,20 €');
    expect(await valorTarjeta(page, 'Gastos de gestoría')).toBe('300,00 €');
    expect(await valorTarjeta(page, /^Total gastos adicionales/)).toBe('23.813,53 €');
    expect(await descripcionTarjeta(page, /^Total gastos adicionales/)).toBe('9,53 % sobre el precio');
    expect(await valorTarjeta(page, /^COSTE TOTAL/)).toBe('273.813,53 €');
    const aviso = limpio(await podriasPagarMenos(page).textContent());
    expect(aviso).toContain('En Cantabria existe:');
    expect(aviso).toContain('4,00 % — Municipios despoblados');
    expect(aviso).not.toContain('Vivienda habitual <');

    await irAVendedor(page);
    await sembrar(page, 'Precio de compra original', '150000');
    await sembrar(page, 'Años de propiedad', '11');
    await sembrar(page, 'Impuestos y gastos que pagaste al comprar', '12000');
    await sembrar(page, 'Valor catastral del suelo', '60000');
    await sembrar(page, 'Valor catastral total (suelo + construcción)', '150000');
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('1500,00 €');
    expect(await descripcionTarjeta(page, 'Plusvalía municipal')).toBe('Método objetivo (más favorable)');
    expect(await valorTarjeta(page, 'Valor de adquisición')).toBe('162.000,00 €');
    expect(await valorTarjeta(page, 'Valor de transmisión')).toBe('241.000,00 €');
    expect(await valorTarjeta(page, /^Ganancia patrimonial/)).toBe('79.000,00 €');
    expect(await valorTarjeta(page, /^IRPF sobre ganancia/)).toBe('17.050,00 €');
    expect(await rotulo(page, /^Comisión inmobiliaria/)).toBe('Comisión inmobiliaria (3 %)');
    expect(await valorTarjeta(page, /^Comisión inmobiliaria/)).toBe('7500,00 €');
    expect(await valorTarjeta(page, /^Total gastos vendedor/)).toBe('26.050,00 €');
    expect(await rotulo(page, /^IMPORTE NETO VENDEDOR/)).toBe('IMPORTE NETO VENDEDOR');
    expect(await valorTarjeta(page, /^IMPORTE NETO VENDEDOR/)).toBe('223.950,00 €');
    expect(await descripcionTarjeta(page, /^IMPORTE NETO VENDEDOR/)).toBe('Lo que realmente recibes');
  });

  /**
   * CASO 86 (límite: el tramo del 30 % y la reinversión parcial) — Madrid, segunda mano, 900.000 €.
   *  Vendedor: compra 300.000 · 20 años · gastos de aquella compra 20.000 · suelo 200.000 · total
   *  400.000 · comisión 3 % · otras rentas del ahorro 50.000 · vivienda habitual, reinvierte 400.000 con
   *  50.000 de hipoteca pendiente:
   *   Plusvalía: objetivo 200.000 × 0,40 (20 años) × 25 % = 20.000 · real 600.000 × 0,5 × 25 % = 75.000
   *     → «20.000,00 €»
   *   Comisión 27.000 · transmisión 900.000 − 27.000 − 20.000 = 853.000 · adquisición 320.000 ·
   *     ganancia 533.000
   *   Reinversión (art. 41 RIRPF): importe obtenido 853.000 − 50.000 = 803.000 · proporción 400.000 /
   *     803.000 = 0,498132 → «exento el 49,8 %» · base 533.000 × (1 − 0,498132) = 267.495,64
   *   Escala del ahorro sobre la base entera (3368): cuota(50.000 + 267.495,64) = 1.140 + 9.240 + 34.500
   *     + 27.000 + 17.495,64 × 30 % (5.248,69) = 77.128,69 − cuota(50.000) 10.380 = 66.748,69 €
   *   Total 20.000 + 27.000 + 66.748,69 = 113.748,69 · neto 786.251,31 €
   *  Sin la reinversión: cuota(583.000) = 71.880 + 283.000 × 30 % = 156.780 − 10.380 = 146.400,00 € ·
   *  total 193.400,00 · neto 706.600,00. Y sin las otras rentas: cuota(533.000) = 71.880 + 233.000 ×
   *  30 % = 141.780,00 € · total 188.780,00 · neto 711.220,00.
   */
  test('CASO 86 (límite) — Madrid, 900.000: el tramo del 30 %, las otras rentas y una reinversión parcial', async ({ page }) => {
    test.setTimeout(90_000);
    expect(COEFICIENTES_IIVTNU_2025.find((c) => c.anios === 20)?.coeficiente).toBe(0.4);
    expect(TRAMOS_GANANCIAS_PATRIMONIALES_2025.map((t) => t.tipo)).toEqual([19, 21, 23, 27, 30]);
    expect(TRAMOS_GANANCIAS_PATRIMONIALES_2025[3].hasta).toBe(300000);

    await abrir(page, 'madrid');
    await sembrar(page, 'Precio de la vivienda', '900000');
    await irAVendedor(page);
    await sembrar(page, 'Precio de compra original', '300000');
    await sembrar(page, 'Años de propiedad', '20');
    await sembrar(page, 'Impuestos y gastos que pagaste al comprar', '20000');
    await sembrar(page, 'Valor catastral del suelo', '200000');
    await sembrar(page, 'Valor catastral total (suelo + construcción)', '400000');
    await sembrar(page, 'Otras rentas del ahorro de este año (€)', '50000');
    await page.getByRole('checkbox', { name: /Voy a reinvertir/ }).check();
    await sembrar(page, 'Importe que reinviertes en la nueva vivienda', '400000');
    await sembrar(page, 'Hipoteca pendiente de la vivienda que vendes', '50000');
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('20.000,00 €');
    expect(await valorTarjeta(page, 'Valor de transmisión')).toBe('853.000,00 €');
    expect(await valorTarjeta(page, /^Ganancia patrimonial/)).toBe('533.000,00 €');
    expect(await descripcionTarjeta(page, /^Ganancia patrimonial/)).toBe('Tributa 267.495,64 € tras aplicar la exención');
    expect(await valorTarjeta(page, /^IRPF sobre ganancia/)).toBe('66.748,69 €');
    expect(await descripcionTarjeta(page, /^IRPF sobre ganancia/)).toBe(
      'Reinversión parcial: exento el 49,8 % de la ganancia (art. 41 RIRPF). Es lo que esta venta añade a tu cuota, sumada a 50.000,00 € de otras rentas del ahorro del año.',
    );
    expect(await valorTarjeta(page, /^Total gastos vendedor/)).toBe('113.748,69 €');
    expect(await valorTarjeta(page, /^IMPORTE NETO VENDEDOR/)).toBe('786.251,31 €');

    await page.getByRole('checkbox', { name: /Voy a reinvertir/ }).uncheck();
    expect(await valorTarjeta(page, /^IRPF sobre ganancia/)).toBe('146.400,00 €');
    expect(await valorTarjeta(page, /^Total gastos vendedor/)).toBe('193.400,00 €');
    expect(await valorTarjeta(page, /^IMPORTE NETO VENDEDOR/)).toBe('706.600,00 €');

    await sembrar(page, 'Otras rentas del ahorro de este año (€)', '');
    expect(await valorTarjeta(page, /^IRPF sobre ganancia/)).toBe('141.780,00 €');
    expect(await valorTarjeta(page, /^Total gastos vendedor/)).toBe('188.780,00 €');
    expect(await valorTarjeta(page, /^IMPORTE NETO VENDEDOR/)).toBe('711.220,00 €');
  });

  /**
   * CASO 86-bis (límite: venta con pérdida) — Madrid, 200.000 €, compra 230.000, 5 años, suelo 50.000.
   *  Venta < compra → plusvalía no sujeta sin mirar el suelo (art. 104.5 TRLRHL) · comisión 6.000 ·
   *  transmisión 194.000 · adquisición 230.000 → pérdida 36.000,00 €, sin cuota · neto 200.000 −
   *  6.000 = 194.000,00 €, definitivo.
   */
  test('CASO 86-bis (límite) — venta con pérdida: no sujeta, sin cuota y con la pérdida compensable', async ({ page }) => {
    test.setTimeout(90_000);
    await abrir(page, 'madrid');
    await sembrar(page, 'Precio de la vivienda', '200000');
    await irAVendedor(page);
    await sembrar(page, 'Precio de compra original', '230000');
    await sembrar(page, 'Años de propiedad', '5');
    await sembrar(page, 'Valor catastral del suelo', '50000');
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('NO SUJETA');
    expect(await descripcionTarjeta(page, 'Plusvalía municipal')).toBe('No sujeta (sin incremento de valor)');
    expect(await valorTarjeta(page, 'Valor de transmisión')).toBe('194.000,00 €');
    expect(await valorTarjeta(page, 'Pérdida patrimonial')).toBe('36.000,00 €');
    expect(await valorTarjeta(page, /^IRPF sobre ganancia/)).toBe('SIN CUOTA');
    expect(await descripcionTarjeta(page, /^IRPF sobre ganancia/)).toBe(
      'No hay ganancia que gravar: la pérdida se compensa con otras ganancias del ahorro en tu declaración',
    );
    expect(await valorTarjeta(page, /^Total gastos vendedor/)).toBe('6000,00 €');
    expect(await valorTarjeta(page, /^IMPORTE NETO VENDEDOR/)).toBe('194.000,00 €');
    expect(await descripcionTarjeta(page, /^IMPORTE NETO VENDEDOR/)).toBe('Lo que realmente recibes');
  });

  /**
   * CASO 87 (debe rechazarse) — el precio «250.000.50» (NaN por diseño) no da ninguna cifra en las
   * dos pestañas; con 250.000, unos años «-2» no se liquidan (la plusvalía queda fuera y el neto
   * PARCIAL), y una comisión del 150 % tampoco:
   *  años -2 · compra 150.000 · suelo 60.000 · comisión 3 %: comisión 7.500 · transmisión 242.500 (sin
   *  plusvalía) · ganancia 92.500 (máximo) · IRPF 1.140 + 9.240 + 42.500 × 23 % = 20.155,00 € (máximo) ·
   *  neto 250.000 − 7.500 − 20.155 = 222.345,00 € (PARCIAL).
   *  Con la comisión del 150 %, fuera del cálculo: ganancia 100.000 · IRPF 1.140 + 9.240 + 50.000 × 23 %
   *  = 21.880,00 € · neto 228.120,00 € (PARCIAL).
   */
  test('CASO 87 (debe rechazarse) — precio ilegible, años negativos y una comisión por encima del 100 %', async ({ page }) => {
    test.setTimeout(90_000);
    await abrir(page, 'madrid');
    await sembrar(page, 'Precio de la vivienda', '250.000.50');
    await expect(page.locator('p', { hasText: 'No se ha podido leer el precio' })).toHaveText(
      'No se ha podido leer el precio «250.000.50». Introduce el precio del inmueble con coma decimal (200.000 o 200000,50) para ver el desglose de gastos del comprador',
    );
    await expect(page.locator('h3', { hasText: /^COSTE TOTAL/ })).toHaveCount(0);
    await irAVendedor(page);
    await expect(page.locator('p', { hasText: 'No se ha podido leer el precio' })).toHaveText(
      'No se ha podido leer el precio «250.000.50». Introduce el precio de venta con coma decimal (200.000 o 200000,50) para calcular el neto del vendedor',
    );
    await expect(page.locator('h3', { hasText: /^IMPORTE NETO VENDEDOR/ })).toHaveCount(0);

    await sembrar(page, 'Precio de la vivienda', '250000');
    await sembrar(page, 'Precio de compra original', '150000');
    await sembrar(page, 'Años de propiedad', '-2');
    await sembrar(page, 'Valor catastral del suelo', '60000');
    await expect(page.locator('input[aria-label="Años de propiedad"]')).toHaveValue('-2');
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('Sin calcular');
    expect(await descripcionTarjeta(page, 'Plusvalía municipal')).toBe(
      'Los años de tenencia no pueden ser negativos. Este impuesto NO está incluido en el neto de abajo.',
    );
    expect(await rotulo(page, /^IRPF sobre ganancia/)).toBe('IRPF sobre ganancia (máximo)');
    expect(await valorTarjeta(page, /^IRPF sobre ganancia/)).toBe('20.155,00 €');
    expect(await rotulo(page, /^IMPORTE NETO VENDEDOR/)).toBe('IMPORTE NETO VENDEDOR (PARCIAL)');
    expect(await valorTarjeta(page, /^IMPORTE NETO VENDEDOR/)).toBe('222.345,00 €');
    expect(await descripcionTarjeta(page, /^IMPORTE NETO VENDEDOR/)).toBe(
      'No descuenta la plusvalía municipal: el neto real puede ser menor que este. Corrige los años de tenencia (no pueden ser negativos) para obtenerlo.',
    );

    await sembrar(page, 'Comisión inmobiliaria (%)', '150');
    await expect(page.locator('p[role="alert"]', { hasText: 'La comisión no puede superar' })).toHaveText(
      'La comisión no puede superar el 100 % del precio de venta: revisa el porcentaje',
    );
    expect(await valorTarjeta(page, /^Comisión inmobiliaria/)).toBe('No válida');
    expect(await valorTarjeta(page, /^IRPF sobre ganancia/)).toBe('21.880,00 €');
    expect(await valorTarjeta(page, /^IMPORTE NETO VENDEDOR/)).toBe('228.120,00 €');
  });

  /**
   * 3466 SE SOSTIENE (92df481b) — Madrid · Primera mano · 300.000 · 7 años · suelo 150.000 · total
   * 300.000 · comisión 3 %. Art. 104.5 TRLRHL: «esta proporción se aplicará tanto al valor de
   * transmisión como, en su caso, al de adquisición»; comprado un solar, la compra entra entera. Valor
   * del suelo en la venta 300.000 × 150/300 = 150.000; objetivo 150.000 × 0,20 × 25 % = 7.500.
   *  · «¿Qué compraste?» viene en «solar» de fábrica.
   *  · solar a 150.000 (el límite): incremento 0 → NO SUJETA · neto 300.000 − 9.000 = 291.000,00
   *  · solar a 148.000: incremento 2.000 × 25 % = 500 < 7.500 → método real «500,00 €» · neto 290.500,00
   *  · solar a 100.000: incremento 50.000 × 25 % = 12.500 > 7.500 → objetivo «7500,00 €» · neto 283.500,00
   *  · construido a 100.000: (300.000 − 100.000) × 0,5 × 25 % = 25.000 → objetivo «7500,00 €»
   *  · de vuelta a segunda mano la pregunta desaparece y no arrastra el solar: objetivo «7500,00 €».
   * El neto es siempre PARCIAL: no descuenta la renta del promotor (3377).
   */
  test('3466 se sostiene — el solar comprado justo por el valor del suelo, por poco menos y por mucho menos', async ({ page }) => {
    test.setTimeout(90_000);
    expect(COEFICIENTES_IIVTNU_2025.find((c) => c.anios === 7)?.coeficiente).toBe(0.2);
    await abrir(page, 'madrid', true);
    await sembrar(page, 'Precio de la vivienda', '300000');
    await irAVendedor(page);
    await expect(page.locator('#compra-original')).toHaveValue('solar');
    await sembrar(page, 'Precio de compra original', '150000');
    await sembrar(page, 'Años de propiedad', '7');
    await sembrar(page, 'Valor catastral del suelo', '150000');
    await sembrar(page, 'Valor catastral total (suelo + construcción)', '300000');
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('NO SUJETA');
    expect(await descripcionTarjeta(page, 'Plusvalía municipal')).toBe(
      'No sujeta: el valor del suelo en la venta (150.000,00 €) no supera lo que se pagó por el solar (art. 104.5 TRLRHL)',
    );
    expect(await rotulo(page, /^IMPORTE NETO VENDEDOR/)).toBe('IMPORTE NETO VENDEDOR (PARCIAL)');
    expect(await valorTarjeta(page, /^IMPORTE NETO VENDEDOR/)).toBe('291.000,00 €');
    expect(await descripcionTarjeta(page, /^IMPORTE NETO VENDEDOR/)).toBe(
      'No descuenta el impuesto sobre la renta del promotor: el neto real puede ser menor que este.',
    );

    await sembrar(page, 'Precio de compra original', '148000');
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('500,00 €');
    expect(await descripcionTarjeta(page, 'Plusvalía municipal')).toBe(
      'Método real (más favorable): valor del suelo en la venta (150.000,00 €) menos lo pagado por el solar (arts. 104.5 y 107.5 TRLRHL)',
    );
    expect(await valorTarjeta(page, /^Total gastos vendedor/)).toBe('9500,00 €');
    expect(await valorTarjeta(page, /^IMPORTE NETO VENDEDOR/)).toBe('290.500,00 €');

    await sembrar(page, 'Precio de compra original', '100000');
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('7500,00 €');
    expect(await descripcionTarjeta(page, 'Plusvalía municipal')).toBe('Método objetivo (más favorable)');
    expect(await valorTarjeta(page, /^IMPORTE NETO VENDEDOR/)).toBe('283.500,00 €');

    await page.locator('#compra-original').selectOption('construido');
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('7500,00 €');
    expect(await descripcionTarjeta(page, 'Plusvalía municipal')).toBe('Método objetivo (más favorable)');

    await page.getByRole('button', { name: /Segunda mano/ }).click();
    await expect(page.locator('#compra-original')).toHaveCount(0);
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('7500,00 €');
    expect(await descripcionTarjeta(page, 'Plusvalía municipal')).toBe('Método objetivo (más favorable)');
  });

  /**
   * 8c473228 (ResultCard) y 8d859faf (ternarios) SE SOSTIENEN en la pestaña Vendedor: con la página
   * traducida (cada texto a <font><font>), la obra nueva, «¿Qué compraste?» y la vuelta a segunda mano
   * mueven las tarjetas sin caer y sin texto viejo. Mismos datos que el 3466 (7 años, suelo 150.000 de
   * 300.000, 300.000 de venta, comisión 3 %):
   *  · solar a 160.000 → 140.000: real 10.000 × 25 % = «2500,00 €» · neto 300.000 − 9.000 − 2.500 = 288.500,00
   *  · construido: (300.000 − 140.000) × 0,5 × 25 % = 20.000 → objetivo «7500,00 €» · neto 283.500,00
   *  · segunda mano con compra 140.000: objetivo 7.500 · transmisión 283.500 · ganancia 143.500 · IRPF
   *    1.140 + 9.240 + 93.500 × 23 % (21.505) = 31.885,00 € · total 7.500 + 9.000 + 31.885 = 48.385,00
   *    · neto 251.615,00 €
   */
  test('página traducida — la obra nueva, «¿Qué compraste?» y la vuelta a segunda mano mueven las tarjetas sin caer', async ({ page }) => {
    test.setTimeout(90_000);
    const errores = vigilarErrores(page);
    const viejos: string[] = [];
    await abrir(page, 'madrid', true);
    await sembrar(page, 'Precio de la vivienda', '300000');
    await irAVendedor(page);
    await sembrar(page, 'Precio de compra original', '160000');
    await sembrar(page, 'Años de propiedad', '7');
    await sembrar(page, 'Valor catastral del suelo', '150000');
    await sembrar(page, 'Valor catastral total (suelo + construcción)', '300000');
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('NO SUJETA');

    await traducir(page);
    await escribirTraducida(page, 'Precio de compra original', '140000');
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('2500,00 €');
    expect(await descripcionTarjeta(page, 'Plusvalía municipal')).toContain('menos lo pagado por el solar');
    expect(await valorTarjeta(page, /^IMPORTE NETO VENDEDOR/)).toBe('288.500,00 €');
    viejos.push(...(await textoViejo(page)));

    await traducir(page);
    await page.locator('#compra-original').selectOption('construido');
    await enPie(page);
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('7500,00 €');
    expect(await descripcionTarjeta(page, 'Plusvalía municipal')).toBe('Método objetivo (más favorable)');
    expect(await valorTarjeta(page, /^IMPORTE NETO VENDEDOR/)).toBe('283.500,00 €');
    viejos.push(...(await textoViejo(page)));

    await traducir(page);
    await page.getByRole('button', { name: /Segunda mano/ }).click();
    await enPie(page);
    expect(await valorTarjeta(page, /^Ganancia patrimonial/)).toBe('143.500,00 €');
    expect(await valorTarjeta(page, /^IRPF sobre ganancia/)).toBe('31.885,00 €');
    expect(await valorTarjeta(page, /^Total gastos vendedor/)).toBe('48.385,00 €');
    expect(await rotulo(page, /^IMPORTE NETO VENDEDOR/)).toBe('IMPORTE NETO VENDEDOR');
    expect(await valorTarjeta(page, /^IMPORTE NETO VENDEDOR/)).toBe('251.615,00 €');
    viejos.push(...(await textoViejo(page)));

    expect(viejos).toEqual([]);
    expect(errores).toEqual([]);
  });

  // ─── HALLAZGOS de esta vuelta (test.fail: se ponen en rojo al repararse) ────────────────

  /**
   * HALLAZGO 3494 [operativa, alto] — REPARADO (25/10/2026, /reparar): lo que aparece o desaparece es
   * un <span key> entero y cada texto variable, único hijo de su elemento. Antes: con la página traducida, dos piezas de cada
   * línea de «Podrías pagar menos» (page.tsx l. 2190-2194) tumban la app en «Algo salió mal»
   * (NotFoundError en removeChild o insertBefore): React retira o inserta un nodo de texto suelto junto
   * a otros que el traductor ya cambió por <font>.
   *  · El fragmento `{superaElTope(r, precio) && (<> · <span aria-hidden>⚠️</span> tu precio supera ese
   *    límite: no podrías acogerte</>)}`, al bajar el precio por debajo del tope.
   *  · El ternario `{topeYaDicho ? '' : ' · Valor máximo …'}` en un <li key={r.nombre}> que se
   *    conserva, al pasar a una comunidad donde la misma línea ya dice su tope (o al revés).
   * Es lo que la hermana garaje midió hoy con su caso; aquí, con los de la vivienda.
   *  Madrid · Joven · 300.000 → 200.000: ITP_CCAA.madrid no tiene reducido aplicable al perfil (el de
   *  jóvenes exige municipio < 2.500 hab.) → general 6 % = «ITP (6,00 %)» 12.000,00 €.
   *  Castilla y León · Joven · 350.000 → Cantabria: «Jóvenes < 36 años» (tope 300.000) no alcanza →
   *  general 9 % = «ITP (9,00 %)» 31.500,00 €. Y Cantabria → Castilla y León: escala 250.000 × 8 % +
   *  100.000 × 10 % = 30.000,00 € «ITP (8,57 %)».
   */
  test('HALLAZGO página traducida — bajar el precio por debajo del tope del reducido tumba la app', async ({ page }) => {
    test.setTimeout(90_000);
    const errores = vigilarErrores(page);
    await abrir(page, 'madrid');
    await sembrar(page, 'Precio de la vivienda', '300000');
    await page.locator('#perfil-comprador').selectOption('joven');
    await expect(podriasPagarMenos(page)).toContainText('tu precio supera ese límite');
    await traducir(page);
    await escribirTraducida(page, 'Precio de la vivienda', '200000');
    expect(await rotulo(page, /^ITP \(/)).toBe('ITP (6,00 %)');
    expect(await valorTarjeta(page, /^ITP \(/)).toBe('12.000,00 €');
    expect(errores).toEqual([]);
  });

  test('HALLAZGO página traducida — cambiar de comunidad con el «Valor máximo» de una línea tumba la app', async ({ page }) => {
    test.setTimeout(90_000);
    const errores = vigilarErrores(page);
    await abrir(page, 'castilla-leon');
    await sembrar(page, 'Precio de la vivienda', '350000');
    await page.locator('#perfil-comprador').selectOption('joven');
    await expect(podriasPagarMenos(page)).toContainText('Valor máximo 150.000,00 €');
    await traducir(page);
    await page.locator('#ccaa-inmueble').selectOption('cantabria');
    await enPie(page);
    expect(await rotulo(page, /^ITP \(/)).toBe('ITP (9,00 %)');
    expect(await valorTarjeta(page, /^ITP \(/)).toBe('31.500,00 €');

    await traducir(page);
    await page.locator('#ccaa-inmueble').selectOption('castilla-leon');
    await enPie(page);
    expect(await rotulo(page, /^ITP \(/)).toBe('ITP (8,57 %)');
    expect(await valorTarjeta(page, /^ITP \(/)).toBe('30.000,00 €');
    expect(errores).toEqual([]);
  });

  /**
   * HALLAZGO 3495 [operativa, medio] — REPARADO (25/10/2026, /reparar): cada cifra o nombre, una sola
   * cadena única hija de su elemento. Antes: con la página traducida, al cambiar de
   * comunidad el formulario se queda con la ANTERIOR mientras las tarjetas cobran la nueva: React
   * escribe en el nodo que el traductor retiró cuando una cifra o un nombre va junto a otro texto.
   *  · recuadro «ITP General» y «AJD» (l. 1838 y 1844, `{formatTipoNominal(…)}&nbsp;%`) y la nota de la
   *    escala (l. 1852, `<span>⚠️</span> {texto}`);
   *  · «Beneficios fiscales en {comunidad}» (l. 1879) y sus líneas, con key={idx} (l. 1881-1887);
   *  · en «Podrías pagar menos», «En {comunidad} existe/existen:» (l. 2166) y cada línea (l. 2187-2189);
   *  · «Paga {IVA|IGIC|IPSI}» del botón Primera mano (l. 1786) y la nota de los honorarios «llevan
   *    además {IGIC|IPSI}» (l. 2112-2113).
   *  Madrid 250.000 → Cataluña: ITP_CCAA.cataluna = 10 % (escala 10 % hasta 600.000) y AJD 1,5 % →
   *  recuadro «10 %» y «1,5 %», tarjeta «ITP (10,00 %)» 25.000,00 €. Cataluña → Baleares: la nota dice
   *  la escala de ITP_CCAA.baleares, 8 % → 9 % → 10 % → 12 % → 13 %.
   */
  test('HALLAZGO página traducida — el recuadro de la comunidad y la nota de su escala se quedan con la anterior', async ({ page }) => {
    test.setTimeout(90_000);
    expect(ITP_CCAA.cataluna.tipoGeneral).toBe(10);
    expect(ITP_CCAA.cataluna.ajd).toBe(1.5);
    expect(ITP_CCAA.baleares.tramosProgresivos?.map((t) => t.tipo)).toEqual([8, 9, 10, 12, 13]);
    const recuadro = (page: Page, rotuloItem: string) =>
      page.locator('[class*="infoCcaaItem"]', { hasText: rotuloItem }).locator('[class*="infoCcaaValue"]');
    await abrir(page, 'madrid');
    await sembrar(page, 'Precio de la vivienda', '250000');
    await traducir(page);
    await page.locator('#ccaa-inmueble').selectOption('cataluna');
    expect(await rotulo(page, /^ITP \(/)).toBe('ITP (10,00 %)');
    expect(await valorTarjeta(page, /^ITP \(/)).toBe('25.000,00 €');
    expect(limpio(await recuadro(page, 'ITP General').textContent())).toBe('10 %');
    expect(limpio(await recuadro(page, 'AJD').textContent())).toBe('1,5 %');

    await traducir(page);
    await page.locator('#ccaa-inmueble').selectOption('baleares');
    expect(limpio(await page.locator('p[class*="infoCcaaNote"]').first().textContent())).toContain(
      '8 % → 9 % → 10 % → 12 % → 13 %',
    );
  });

  /**
   *  Madrid 250.000 · Familia numerosa → Cataluña: «Beneficios fiscales en Cataluña» y su primera
   *  línea, la primera de ITP_CCAA.cataluna.tiposReducidos, «5 % - Jóvenes ≤35 años».
   *  Cantabria 250.000 · General → Madrid: «Podrías pagar menos» ofrece solo «Vivienda habitual
   *  (bonif. 10 %)» al 5,40 % (tope 250.000) → «En la Comunidad de Madrid existe:».
   */
  test('HALLAZGO página traducida — «Beneficios fiscales en…» y «Podrías pagar menos» se quedan con la comunidad anterior', async ({ page }) => {
    test.setTimeout(90_000);
    expect(ITP_CCAA.cataluna.tiposReducidos[0]).toMatchObject({ nombre: 'Jóvenes ≤35 años', tipo: 5 });
    await abrir(page, 'madrid');
    await sembrar(page, 'Precio de la vivienda', '250000');
    await page.locator('#perfil-comprador').selectOption('familia-numerosa');
    await traducir(page);
    await page.locator('#ccaa-inmueble').selectOption('cataluna');
    const info = page.locator('div[class*="tiposReducidosInfo"]');
    expect(limpio(await info.locator('h4').textContent())).toBe(
      'Beneficios fiscales en Cataluña, solo si se cumplen TODAS sus condiciones:',
    );
    expect(limpio(await info.locator('li').first().textContent())).toBe('5 % - Jóvenes ≤35 años');

    await abrir(page, 'cantabria');
    await sembrar(page, 'Precio de la vivienda', '250000');
    await expect(podriasPagarMenos(page)).toContainText('En Cantabria existe:');
    await traducir(page);
    await page.locator('#ccaa-inmueble').selectOption('madrid');
    expect(await rotulo(page, /^ITP \(/)).toBe('ITP (6,00 %)');
    const aviso = limpio(await podriasPagarMenos(page).textContent());
    expect(aviso).toContain('En la Comunidad de Madrid existe:');
    expect(aviso).toContain('5,40 % — Vivienda habitual (bonif. 10 %)');
  });

  /**
   *  Madrid 250.000 → Canarias: el botón de primera mano dice «Paga IGIC»
   *  (TERRITORIOS_SIN_IVA.canarias.impuesto). Canarias → Ceuta: la nota de los honorarios dice que
   *  llevan además IPSI (TERRITORIOS_SIN_IVA.ceuta.impuesto).
   */
  test('HALLAZGO página traducida — «Paga IVA» y la nota de los honorarios no siguen a Canarias, Ceuta y Melilla', async ({ page }) => {
    test.setTimeout(90_000);
    expect(TERRITORIOS_SIN_IVA.canarias?.impuesto).toBe('IGIC');
    expect(TERRITORIOS_SIN_IVA.ceuta?.impuesto).toBe('IPSI');
    await abrir(page, 'madrid');
    await sembrar(page, 'Precio de la vivienda', '250000');
    await traducir(page);
    await page.locator('#ccaa-inmueble').selectOption('canarias');
    await expect(page.locator('[role="note"]', { hasText: 'Las facturas de notaría y registro llevan además' })).toHaveCount(1);
    expect(limpio(await page.locator('[class*="transmisionSub"]').nth(1).textContent())).toBe('Paga IGIC');

    await abrir(page, 'canarias');
    await sembrar(page, 'Precio de la vivienda', '250000');
    await traducir(page);
    await page.locator('#ccaa-inmueble').selectOption('ceuta');
    expect(limpio(await page.locator('[role="note"]', { hasText: 'Las facturas de notaría y registro' }).textContent())).toContain(
      'llevan además IPSI',
    );
  });

  /**
   * HALLAZGO 3496 [operativa, medio] — REPARADO (25/10/2026, /reparar), con la receta del 3495. La misma forma, con otros disparadores:
   *  · el aviso del IVA superreducido de la obra nueva (l. 2132-2137) se queda con las cifras de antes
   *    al cambiar el PRECIO: Madrid · Primera mano · 250.000 → 300.000 → «serían 12.000,00 € en vez de
   *    30.000,00 €» (300.000 × IVA_INMUEBLES_2025.viviendaProtegida 4 % y × obraNueva 10 %), con la
   *    tarjeta en «IVA (10,00 %)» 30.000,00 €;
   *  · la nota de la pestaña Vendedor «no se aplican a la venta de {CON_ARTICULO[tipo]}» (l. 2530) se
   *    queda con el inmueble anterior: Local comercial → Nave industrial → «…de una nave industrial».
   */
  test('HALLAZGO página traducida — el aviso del IVA del 4 % se queda con el precio anterior', async ({ page }) => {
    test.setTimeout(90_000);
    expect(IVA_INMUEBLES_2025.obraNueva).toBe(10);
    expect(IVA_INMUEBLES_2025.viviendaProtegida).toBe(4);
    await abrir(page, 'madrid', true);
    await sembrar(page, 'Precio de la vivienda', '250000');
    await traducir(page);
    await escribirTraducida(page, 'Precio de la vivienda', '300000');
    expect(await valorTarjeta(page, /^IVA \(/)).toBe('30.000,00 €');
    expect(
      limpio(await page.locator('[role="note"]', { hasText: 'protección oficial de régimen especial' }).textContent()),
    ).toContain('serían 12.000,00 € en vez de 30.000,00 €');
  });

  test('HALLAZGO página traducida — la nota del vendedor nombra el inmueble anterior', async ({ page }) => {
    test.setTimeout(90_000);
    await abrir(page, 'madrid');
    await sembrar(page, 'Precio de la vivienda', '250000');
    await page.getByRole('button', { name: /Local comercial/ }).click();
    await irAVendedor(page);
    const nota = page.locator('p[role="note"]', { hasText: 'son de la' });
    await expect(nota).toContainText('a la venta de un local comercial');
    await traducir(page);
    await page.getByRole('button', { name: /Nave industrial/ }).click();
    expect(limpio(await nota.textContent())).toContain('a la venta de una nave industrial');
  });

  /**
   * HALLAZGO 3497 [operativa, bajo] — REPARADO (25/10/2026, /reparar): el rótulo va en su <span>.
   * components/NumberInput.tsx, compartido: el
   * rótulo es `{label}{required && …}`, dos hijos, así que el texto es un nodo suelto y con la página
   * traducida se queda viejo. Aquí el del precio cambia con el tipo de inmueble (page.tsx l. 1795):
   * Vivienda → Garaje → el campo se llama «Precio del inmueble» (su aria-label ya lo dice) y el rótulo
   * visible sigue diciendo «Precio de la vivienda».
   */
  test('HALLAZGO página traducida — el rótulo del precio no cambia con el tipo de inmueble', async ({ page }) => {
    test.setTimeout(90_000);
    await abrir(page, 'madrid');
    await sembrar(page, 'Precio de la vivienda', '250000');
    await traducir(page);
    await page.getByRole('button', { name: /Garaje/ }).click();
    const campo = page.locator('input[aria-label="Precio del inmueble"]');
    await expect(campo).toHaveCount(1);
    expect(limpio(await campo.evaluate((el) => (el as HTMLInputElement).labels?.[0]?.textContent ?? ''))).toBe(
      'Precio del inmueble',
    );
  });

  /**
   * HALLAZGO 3498 [operativa, bajo] — REPARADO (25/10/2026, /reparar): `{`(${nombre})`}` en una sola
   * cadena. components/AvisoTerritorioSinIva.tsx,
   * compartido: 8c473228 (3482) metió cada variable en su <span>, pero `<span>({territorio.nombre})</span>`
   * (l. 46) son tres hijos y el nombre sigue siendo un nodo suelto. Madrid → Primera mano → Canarias →
   * Ceuta: «tributa por el IPSI (Impuesto sobre la Producción, los Servicios y la Importación)»
   * (TERRITORIOS_SIN_IVA.ceuta) y no «IPSI (Impuesto General Indirecto Canario)».
   */
  test('HALLAZGO página traducida — el aviso de territorio sin IVA deja el nombre del impuesto de Canarias en Ceuta', async ({ page }) => {
    test.setTimeout(90_000);
    expect(TERRITORIOS_SIN_IVA.ceuta?.nombre).toBe('Impuesto sobre la Producción, los Servicios y la Importación');
    await abrir(page, 'canarias', true);
    await sembrar(page, 'Precio de la vivienda', '250000');
    const aviso = page.locator('p[role="note"]', { hasText: 'no se aplica el IVA' });
    await expect(aviso).toContainText('IGIC (Impuesto General Indirecto Canario)');
    await traducir(page);
    await page.locator('#ccaa-inmueble').selectOption('ceuta');
    expect(limpio(await aviso.textContent())).toContain(
      'tributa por el IPSI (Impuesto sobre la Producción, los Servicios y la Importación)',
    );
  });

  /**
   * HALLAZGO 3499 [dato, bajo] — REPARADO (25/10/2026, /reparar): EXENCION_RENTA_VITALICIA_MAYORES_65
   * en data/fiscal/inmuebles.ts, con el art. 38.3 leído en el BOE ese día. El tope de 240.000 € de la renta vitalicia de los
   * mayores de 65 (art. 38.3 LIRPF) va tecleado en dos bocas: el bloque educativo (page.tsx l. 3111,
   * «con un máximo de 240.000 €») y el FAQPage «¿Qué impuestos paga el vendedor al vender un
   * inmueble?» (metadata.ts l. 369, «hasta 240.000 €»). No está en data/fiscal (ningún módulo lo
   * tiene), y la regla del CLAUDE.md es crear el módulo e importarlo, nunca inline: es un importe
   * normativo que la ley puede mover, y las dos bocas no se enterarían. El plazo de «seis meses» va
   * en las mismas frases.
   */
  test('HALLAZGO dato — el tope de 240.000 € del art. 38.3 LIRPF no va tecleado en la página ni en el FAQPage', async () => {
    const tecleado = /240\.000\s*€/;
    for (const fichero of ['page.tsx', 'metadata.ts']) {
      const fuente = readFileSync(join(process.cwd(), 'app/estimador-compraventa-inmueble', fichero), 'utf8');
      const lineas = fuente.split('\n').filter((l) => tecleado.test(l));
      expect(lineas, `${fichero}: el tope de la renta vitalicia, escrito a mano`).toEqual([]);
    }
  });
});
