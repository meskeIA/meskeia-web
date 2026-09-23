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
import { esperarHidratacion, esperarValorEnReact } from './_hidratacion';

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

/** Texto descriptivo bajo el valor de una ResultCard. */
async function descripcionTarjeta(page: Page, titulo: string | RegExp): Promise<string> {
  const desc = page
    .locator('h3', { hasText: titulo })
    .first()
    .locator('xpath=../following-sibling::p[1]');
  return (await desc.innerText()).replace(ESPACIO_DURO, ' ').trim();
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
    await expect(page.locator('h3', { hasText: /^ITP/ }).first()).toHaveText('ITP (6,00%)');

    // Nota del 20/08/2026: estas tarjetas ya no muestran el arancel puro sino la FACTURA
    // notarial estimada (el arancel × 1,75, punto medio de la horquilla 1,5-2 documentada en
    // FACTURA_NOTARIAL). El arancel del RD 1426/1989 cubre la matriz y una copia; copias
    // adicionales, folios y suplidos van aparte. El registro suma además el asiento de
    // presentación (6,010121 €) y la nota simple (3,005061 €) del RD 1427/1989.
    // Notaría (ARANCELES_NOTARIO, RD 1426/1989), acumulando tramos hasta 200.000 €:
    //   90,15 + 24.040,49×0,45 % + 30.050,60×0,15 % + 90.151,82×0,10 % + 49.746,97×0,05 %
    //   = 358,43341 ; con el 21 % de IVA → 433,7044 de arancel ; × 1,75 → 758,9827 de factura
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('758,98 €');

    // Registro (ARANCELES_REGISTRO, RD 1427/1989):
    //   24,04 + 24.040,49×0,175 % + 30.050,60×0,125 % + 90.151,82×0,075 % + 49.746,97×0,030 %
    //   = 186,21206 ; + 6,010121 (presentación) + 3,005061 (nota simple) = 195,22724
    //   con el 21 % de IVA → 236,2250
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('236,22 €');

    expect(await valorTarjeta(page, 'Gastos de gestoría')).toBe('300,00 €');

    // Total gastos = 12.000 + 758,9827 + 236,2250 + 300 = 13.295,2077 → 6,65 % del precio
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('13.295,20 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toContain('6,65%');

    // Coste total = 200.000 + 13.295,2077. En segunda mano NO hay AJD (TPO y AJD son incompatibles)
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('213.295,20 €');
    await expect(page.locator('h3', { hasText: /^AJD/ })).toHaveCount(0);
  });

  // ⚠️ CORREGIDO el 14/08/2026 - la app SIEMPRE pasaba `tipoAplicable` a
  // `calcularITP`, así que la rama de `tramosProgresivos` de data/itp-ccaa.ts nunca se
  // ejecuta y toda la operación tributa al tipo del primer tramo. La propia interfaz
  // imprime justo encima «⚠️ Esta comunidad aplica escala progresiva (10% → 11% → 12% → 13%)»,
  // de modo que anuncia una escala que después no aplica. Afecta a las 7 CCAA con tramos
  // declarados (Aragón, Asturias, Baleares, Castilla y León, Cataluña, Extremadura y
  // Valencia) y a las hermanas -garaje y -trastero, que hacen la misma llamada.
  // `test.fail` marca que hoy falla a propósito: cuando se corrija se pondrá en ROJO.
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

    // Notaría: 558,93946 + 398.987,90×0,03 % = 678,63583 ; × 1,21 → 821,1494
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('1437,01 €');
    // Registro: 306,51569 + 398.987,90×0,020 % = 386,31327 (< tope 2.181,67) ; × 1,21 → 467,4391
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('478,35 €');

    // Total gastos = 105.000 + 821,1494 + 467,4391 + 300 = 106.588,5884
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('107.215,36 €');
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('1.107.215,36 €');
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
    // Los tres opcionales hay que ponerlos a 0 a mano — ver CASO 6 (hallazgo abierto)
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
    expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('EXENTO');

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
    //   estimación = 11.766,77 + 300 = 12.066,77 → el campo muestra «12.067»
    //   valor de adquisición = 180.000 + 12.067 = 192.067
    //   valor de transmisión = 250.000 − 7.500 de comisión − 1.250 de plusvalía = 241.250
    //   (la gestoría de la VENTA la paga el comprador y no resta aquí: art. 35.1 LIRPF,
    //    reparado el 21/08/2026 — es otra partida distinta de la de la compra de entonces)
    //   ganancia = 241.250 − 192.067 = 49.183
    //   IRPF = 6.000×19 % + 43.183×21 % = 1.140 + 9.068,43 = 10.208,43
    // Antes de la corrección daba: adquisición 180.011,44 € · ganancia 60.938,56 € · IRPF 12.895,87 €
    expect(await valorTarjeta(page, 'Valor de adquisición')).toBe('192.067,00 €');
    expect(await valorTarjeta(page, 'Ganancia patrimonial')).toBe('49.183,00 €');
    expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('10.208,43 €');
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
    //   plusvalía objetivo = 50.000 × 0,10 (COEFICIENTES_IIVTNU_2025, 8 años) × 25 % = 1.250
    //   (el método real daría 70.000 × 50.000/120.000 × 25 % = 7.291,67 → gana el objetivo)
    //   valor de transmisión = 250.000 − 7.500 − 1.250 = 241.250 ; ganancia = 61.250
    //   (sin la gestoría del comprador: art. 35.1 LIRPF, reparado el 21/08/2026)
    //   IRPF = 6.000×19 % + 44.000×21 % + 11.250×23 % = 1.140 + 9.240 + 2.587,50 = 12.967,50
    //   neto = 250.000 − (1.250 plusvalía + 7.500 comisión + 12.967,50 IRPF) = 228.282,50
    // Obtenido hoy sin tocar los opcionales: «No definido» en IRPF, total y neto, y la
    // tarjeta de ganancia ni se pinta (la condición para mostrarla es `ganancia > 0`, y
    // NaN > 0 es false), de ahí que se compruebe primero que existe.
    await expect(page.locator('h3', { hasText: 'Ganancia patrimonial' })).toHaveCount(1);
    expect(await valorTarjeta(page, 'Ganancia patrimonial')).toBe('61.250,00 €');
    expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('12.967,50 €');
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('228.282,50 €');
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
    await expect(page.locator('h3', { hasText: /^IVA/ }).first()).toHaveText('IVA (10,00%)');
    expect(await valorTarjeta(page, /^IVA/)).toBe('18.000,00 €');
    await expect(page.locator('h3', { hasText: /^ITP/ })).toHaveCount(0);

    // AJD sobre la escritura de compraventa: ITP_CCAA.valencia.ajd = 1,5 (coincide con
    // TIPOS_AJD_2025.general de `data/fiscal/inmuebles.ts`) → 180.000 × 1,5 % = 2.700
    await expect(page.locator('h3', { hasText: /^AJD/ }).first()).toHaveText('AJD (1,50%)');
    expect(await valorTarjeta(page, /^AJD/)).toBe('2700,00 €');

    // Notaría (ARANCELES_NOTARIO, RD 1426/1989) sobre 180.000 €:
    //   90,15 + 24.040,49×0,45 % + 30.050,60×0,15 % + 90.151,82×0,10 % + 29.746,97×0,05 %
    //   = 348,43341 ; × 1,21 de IVA → 421,6044
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('737,81 €');
    // Registro (ARANCELES_REGISTRO, RD 1427/1989):
    //   24,04 + 24.040,49×0,175 % + 30.050,60×0,125 % + 90.151,82×0,075 % + 29.746,97×0,030 %
    //   = 180,21206 ; × 1,21 → 218,0566
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('228,96 €');

    // Total = 18.000 + 2.700 + 421,6044 + 218,0566 + 300 = 21.639,6610 → 12,02 % del precio
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('21.966,77 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toContain('12,20%');
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('201.966,77 €');
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
    await expect(page.locator('h3', { hasText: /^ITP/ }).first()).toHaveText('ITP (11,00%)');

    // Notaría: 558,93946 + (2.500.000 − 601.012,10)×0,03 % = 1.128,63583 ; × 1,21 → 1.365,6494
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('2389,89 €');
    // Registro: 306,51569 + (2.500.000 − 601.012,10)×0,020 % = 686,31327 (< tope
    // REGISTRO_MAXIMO 2.181,67) ; × 1,21 → 830,4391
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('841,35 €');

    // Total = 275.000 + 1.365,6494 + 830,4391 + 300 = 277.496,0884 → 11,10 % del precio
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('278.531,24 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toContain('11,14%');
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('2.778.531,24 €');
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
      page.getByText('Introduce el precio del inmueble para ver el desglose de gastos del comprador'),
    ).toBeVisible();
    await expect(page.getByText('No definido')).toHaveCount(0);
    await expect(page.locator('h3', { hasText: /^ITP/ })).toHaveCount(0);
  });

  // ⚠️ HALLAZGO ABIERTO (Inspector, 16/08/2026) — el NaN que el commit 2067ddbe no barrió.
  // Los campos del bloque de reinversión son los dos únicos del vendedor que siguen leyéndose
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

    // Plusvalía municipal: objetivo = 60.000 × 0,08 (COEFICIENTES_IIVTNU_2025, 10 años) ×
    // 25 % (PLUSVALIA_MUNICIPAL_META.tipoOrientativo) = 1.200 ; real = 100.000 ×
    // (60.000/150.000) × 25 % = 10.000 → gana el objetivo, 1.200 €.
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('1200,00 €');
    // Art. 35 LIRPF: adquisición = 200.000 ; transmisión = 300.000 − 9.000 de comisión
    //              − 1.200 de plusvalía = 289.800 ; ganancia = 89.800 (la gestoría del
    //              comprador ya no resta: art. 35.1 LIRPF, reparado el 21/08/2026)
    expect(await valorTarjeta(page, 'Ganancia patrimonial')).toBe('89.800,00 €');

    // Art. 41.1 RIRPF: importe total obtenido = 289.800 − 0 de préstamo pendiente = 289.800.
    // Se reinvierten 300.000 ≥ 289.800 → proporción 1 → exención TOTAL (art. 38 LIRPF).
    // Obtenido hoy: «19.465,00 €» de IRPF (6.000×19 % + 44.000×21 % + 39.500×23 %) y un neto
    // de 270.035,00 €, es decir 19.465 € de impuesto inventado sobre una ganancia exenta.
    expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('EXENTO');
    expect(await descripcionTarjeta(page, 'IRPF sobre ganancia')).toContain('Reinversión total');
    expect(await valorTarjeta(page, 'Total gastos vendedor')).toBe('10.200,00 €');
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('289.800,00 €');
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
    // el motor calcula bien la exención en cuanto el campo no está vacío.
    expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('EXENTO');
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('289.800,00 €');
  });

  // ⚠️ HALLAZGO ABIERTO (Inspector, 16/08/2026) — el otro rincón al que no llegó el 2067ddbe.
  // `estimarGastosAdquisicion` (page.tsx:352) sigue llamando a
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
    await expect(
      page.locator('input[aria-label="Impuestos y gastos que pagaste al comprar"]'),
    ).toHaveValue('107.215');

    // Consecuencia en cadena, con la plusvalía municipal fuera (sin valor catastral no se calcula):
    //   adquisición = 1.000.000 + 106.289 = 1.106.289
    //   transmisión = 1.200.000 − 36.000 de comisión = 1.164.000 (la gestoría es del
    //                 comprador: art. 35.1 LIRPF, reparado el 21/08/2026)
    //   adquisición = 1.000.000 + 107.215 = 1.107.215
    //   ganancia    = 1.164.000 − 1.107.215 = 56.785
    //   IRPF        = 6.000×19 % + 44.000×21 % + 6.785×23 % = 1.140 + 9.240 + 1.560,55
    // Obtenido antes de la reparación: adquisición 1.101.289,00 € · ganancia 62.411,00 € ·
    // IRPF 13.234,53 €, es decir 1.150,00 € de IRPF de más.
    expect(await valorTarjeta(page, 'Valor de adquisición')).toBe('1.107.215,00 €');
    expect(await valorTarjeta(page, 'Ganancia patrimonial')).toBe('56.785,00 €');
    expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('11.940,55 €');
  });

  // ⚠️ HALLAZGO ABIERTO (Inspector, 16/08/2026) — accesibilidad.
  // Los dos <select> de la app («Comunidad Autónoma» y «Perfil del comprador») no tienen id,
  // ni aria-label, ni aria-labelledby, y el <label> que los precede no lleva htmlFor. Son
  // labels huérfanos: un lector de pantalla anuncia «cuadro combinado» sin decir de qué.
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

    await expect(page.locator('h3', { hasText: /^IVA/ }).first()).toHaveText('IVA (21,00%)');
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

  await expect(page.locator('h3', { hasText: /^ITP/ }).first()).toHaveText('ITP (4,00%)');
  expect(await valorTarjeta(page, /^ITP/)).toBe('6000,00 €');
});

test('ITP La Rioja — el perfil general sigue pagando el tipo general del 7 %', async ({ page }) => {
  // Control del test anterior: el 4 % tiene que venir del perfil, no de haber bajado
  // el tipo general de la comunidad. 150.000 × 7 % = 10.500 €.
  await page.goto(RUTA);
  await page.getByRole('button', { name: /Segunda mano/ }).click();
  await selectCcaa(page).selectOption('rioja');
  await rellenar(page, 'Precio de la vivienda', '150.000');

  await expect(page.locator('h3', { hasText: /^ITP/ }).first()).toHaveText('ITP (7,00%)');
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

  await expect(page.locator('h3', { hasText: /^ITP/ }).first()).toHaveText('ITP (3,00%)');
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

  await expect(page.locator('h3', { hasText: /^ITP/ }).first()).toHaveText('ITP (10,00%)');
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

  await expect(page.locator('h3', { hasText: /^ITP/ }).first()).not.toHaveText('ITP (5,00%)');
  await expect(page.locator('h3', { hasText: /^ITP/ }).first()).toHaveText('ITP (10,00%)');
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

  await expect(page.locator('h3', { hasText: /^ITP/ }).first()).toHaveText('ITP (3,50%)');
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
    await expect(page.locator('h3', { hasText: /^ITP/ }).first()).toHaveText('ITP (6,00%)');
    expect(await valorTarjeta(page, /^ITP/)).toBe('12.000,00 €');

    // Arancel notarial (ARANCELES_NOTARIO, nº 2 del RD 1426/1989), acumulando tramos:
    //   90,15 + 24.040,49×0,45 % + 30.050,60×0,15 % + 90.151,82×0,10 % + 49.746,97×0,05 %
    //   = 358,43341 → con el 21 % de IVA = 433,704426
    // Factura (FACTURA_NOTARIAL, factores 1,5 y 2):
    //   min 650,556639 · max 867,408852 · medio 758,982746 ← el que suma la app
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('758,98 €');
    expect(await descripcionTarjeta(page, 'Gastos de notaría')).toContain(
      'Factura estimada entre 650,56 € y 867,41 €',
    );

    // Registro (ARANCELES_REGISTRO, nº 2 del RD 1427/1989):
    //   24,04 + 24.040,49×0,175 % + 30.050,60×0,125 % + 90.151,82×0,075 % + 49.746,97×0,030 %
    //   = 186,212064 (por debajo del tope REGISTRO_MAXIMO de 2.181,67)
    //   + 6,010121 (nº 1, presentación) + 3,005061 (nº 4, nota simple) = 195,227246
    //   con el 21 % de IVA = 236,224967
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('236,22 €');

    // Total = 12.000 + 758,982746 + 236,224967 + 300 = 13.295,207713 → 6,6476 % del precio
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('13.295,20 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toContain('6,65%');
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('213.295,20 €');
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
    await expect(page.locator('h3', { hasText: /^ITP/ }).first()).toHaveText('ITP (3,50%)');
    expect(await valorTarjeta(page, /^ITP/)).toBe('4900,00 €');

    // Arancel notarial sobre 140.000 €:
    //   90,15 + 24.040,49×0,45 % + 30.050,60×0,15 % + 79.898,79×0,10 % = 323,306895
    //   con el 21 % de IVA = 391,201343 → min 586,802014 · max 782,402686 · medio 684,602350
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('684,60 €');
    expect(await descripcionTarjeta(page, 'Gastos de notaría')).toContain(
      'Factura estimada entre 586,80 € y 782,40 €',
    );

    // Registro sobre 140.000 €:
    //   24,04 + 24.040,49×0,175 % + 30.050,60×0,125 % + 79.898,79×0,075 % = 163,598200
    //   + 6,010121 + 3,005061 = 172,613382 → con el 21 % de IVA = 208,862192
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('208,86 €');

    // Total = 4.900 + 684,602350 + 208,862192 + 300 = 6.093,464542 → 4,3525 % del precio.
    // Ojo al formato: es-ES no agrupa los millares de un número de cuatro cifras.
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('6093,46 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toContain('4,35%');
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('146.093,46 €');

    // Contraste con el texto publicado. Desde el 10/09/2026 (hallazgo 675) las tres partidas
    // y su total salen del MISMO arancel que la calculadora, y el total suma exactamente las
    // líneas que el propio párrafo enseña: 684,60 → «685 €», 208,86 → «209 €», gestoría
    // 300 € y total 685 + 209 + 300 = 1.194 €. Antes iba tecleado y publicaba «unos 1.193 €»,
    // que no es la suma de su propio desglose (la familia del hallazgo 594).
    // Formato: es-ES no agrupa los millares de un número de cuatro cifras, igual que en las
    // tarjetas de arriba — antes el texto sí lo agrupaba porque estaba escrito a mano.
    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
    const marta = page.getByText(/Marta, 29 años/).first();
    await expect(marta).toContainText(/3,5%\s*\(4900\s*€\)/);
    await expect(marta).toContainText(/1194\s*€ en notaría \(685\s*€\), registro \(209\s*€\), y gestoría \(300\s*€\)|1194\s*€ en notaría \(685\s*€\), registro \(209\s*€\) y gestoría \(300\s*€\)/);
  });

  test('CASO C (debe rechazarse) — un precio de 0 € no puede producir impuesto ni total', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await rellenar(page, 'Precio de la vivienda', '0');

    // La guarda del useMemo es `!Number.isFinite(precio) || precio <= 0` → null, y el panel
    // pide el dato. Ni un ITP de 0 €, ni la base mínima de 90,15 € del arancel notarial
    // —que es lo que saldría de calcular sobre 0—, ni ningún «No definido».
    await expect(
      page.getByText('Introduce el precio del inmueble para ver el desglose de gastos del comprador'),
    ).toBeVisible();
    await expect(page.locator('h3', { hasText: /^ITP/ })).toHaveCount(0);
    await expect(page.locator('h3', { hasText: 'Gastos de notaría' })).toHaveCount(0);
    await expect(page.locator('h3', { hasText: 'COSTE TOTAL DE ADQUISICIÓN' })).toHaveCount(0);
    await expect(page.getByText('No definido')).toHaveCount(0);
  });
});

// ⚠️ HALLAZGO ABIERTO (Inspector, 20/08/2026) — dato.
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
  await expect(page.locator('tr', { hasText: /^ITP/ }).first()).toContainText('13%');
});

// ⚠️ HALLAZGO ABIERTO (Inspector, 20/08/2026) — contenido.
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

// ⚠️ HALLAZGO ABIERTO (Inspector, 20/08/2026) — contenido.
// Las tarjetas se titulan «Gastos de notaría (+ IVA)» y «Registro de la Propiedad (+ IVA)»,
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

  expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('758,98 €');
  const titulo = await page.locator('h3', { hasText: 'Gastos de notaría' }).first().innerText();
  expect(titulo).not.toMatch(/\+\s*IVA/);
});

// ⚠️ HALLAZGO ABIERTO (Inspector, 20/08/2026) — dato.
// El bloque educativo afirma que el AJD «varía entre 0,5% y 1,5% según la comunidad» y la
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
  await expect(page.locator('[class*="infoCcaa"]').first()).toContainText('Sin AJD');

  await page.getByRole('button', { name: 'Ver guía educativa' }).click();
  await expect(page.getByText(/Actos Jurídicos Documentados\)/).first()).toContainText('0%');
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
// (b) los hallazgos abiertos de esta vuelta, al final, con `test.fail()`.
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
    await expect(page.locator('h3', { hasText: /^ITP/ }).first()).toHaveText('ITP (9,11%)');

    // Notaría (ARANCELES_NOTARIO): 90,15 + 24.040,49×0,45 % + 30.050,60×0,15 %
    //   + 90.151,82×0,10 % + 450.759,07×0,05 % + 98.987,90×0,03 % = 588,63583 de arancel
    //   × 1,21 de IVA = 712,2494 ; × 1,75 (punto medio de FACTURA_NOTARIAL) = 1.246,4362
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('1246,44 €');
    // Registro (ARANCELES_REGISTRO): 24,04 + 24.040,49×0,175 % + 30.050,60×0,125 %
    //   + 90.151,82×0,075 % + 450.759,07×0,030 % + 98.987,90×0,020 % = 326,31327
    //   + 6,010121 + 3,005061 = 335,32846 ; × 1,21 = 405,7474
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('405,75 €');

    // Total = 63.800 + 1.246,4362 + 405,7474 + 300 = 65.752,1836
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('65.752,19 €');
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('765.752,19 €');
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

    // Plusvalía municipal: objetivo = 60.000 × 0,08 (COEFICIENTES_IIVTNU_2025, 10 años)
    //   × 25 % (PLUSVALIA_MUNICIPAL_META.tipoOrientativo) = 1.200
    //   real = 100.000 × (60.000/150.000) × 25 % = 10.000 → gana el objetivo
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('1200,00 €');
    // Valor de transmisión = 300.000 − 9.000 de comisión − 1.200 de plusvalía = 289.800
    expect(await valorTarjeta(page, 'Valor de transmisión')).toBe('289.800,00 €');
    // Ganancia = 289.800 − 200.000 = 89.800
    expect(await valorTarjeta(page, 'Ganancia patrimonial')).toBe('89.800,00 €');
    // Importe total obtenido (art. 41 RIRPF) = 289.800 − 0 de hipoteca pendiente
    //   proporción reinvertida = 150.000 / 289.800 = 0,5175983…
    //   exenta = 89.800 × 0,5175983 = 46.480,3313 → base = 89.800 − 46.480,3313 = 43.319,6687
    //   IRPF = 6.000×19 % + 37.319,6687×21 % = 1.140 + 7.837,1304 = 8.977,1304
    expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('8977,13 €');
    // Neto = 300.000 − (1.200 + 9.000 + 8.977,1304) = 280.822,8696
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('280.822,87 €');
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
    // Total = 6.000 + 758,9827 + 236,2250 + 300 = 7.295,2077
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('7295,20 €');
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
test('REGRESIÓN — el caso «Ana» del bloque educativo contradice al motor', async ({ page }) => {
  await page.goto(RUTA);
  await rellenar(page, 'Precio de la vivienda', '250000');
  await page.getByRole('button', { name: 'Vendedor' }).click();
  await rellenar(page, 'Precio de compra original', '180000');
  await rellenar(page, 'Años de propiedad', '8');
  await rellenar(page, 'Comisión inmobiliaria (%)', '3');
  expect(await valorTarjeta(page, 'Ganancia patrimonial')).toBe('62.500,00 €');

  await page.getByRole('button', { name: 'Ver guía educativa' }).click();
  await expect(page.getByText(/Ana vende su piso/)).toContainText('62.500');
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
  await expect(page.locator('h3', { hasText: /^AJD/ }).first()).toHaveText('AJD (0,25%)');
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
  await expect(page.getByText('3% - Jóvenes ≤40 años')).toBeVisible();

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

  expect(await descripcionTarjeta(page, 'IRPF sobre ganancia')).toContain('51,8 %');
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

  expect(schemas).toContain(`Madrid el ${pct(ITP_CCAA['madrid'].tipoGeneral)} %`);
  expect(schemas).toContain(`Andalucía el ${pct(ITP_CCAA['andalucia'].tipoGeneral)} %`);
  expect(schemas).toContain(`País Vasco el ${pct(ITP_CCAA['pais-vasco'].tipoGeneral)} %`);
  expect(schemas).toContain(`Cataluña aplica el ${pct(ITP_CCAA['cataluna'].tipoGeneral)} %`);

  // El techo de la escala catalana es el otro número citado en esa misma frase.
  const techoCataluna = Math.max(
    ITP_CCAA['cataluna'].tipoGeneral,
    ...(ITP_CCAA['cataluna'].tramosProgresivos ?? []).map((t) => t.tipo),
  );
  expect(schemas).toContain(`escala hasta el ${pct(techoCataluna)} %`);
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
  //   Notaría ...... arancel RD 1426/1989 = 90,15 + 24.040,49×0,45 % + 30.050,60×0,15 %
  //                  + 90.151,82×0,10 % + 49.746,97×0,05 % = 358,43341 ; ×1,21 de IVA
  //                  = 433,70443 ; ×1,75 (punto medio de FACTURA_NOTARIAL) = 758,98275
  //   Registro ..... arancel RD 1427/1989 = 24,04 + 24.040,49×0,175 % + 30.050,60×0,125 %
  //                  + 90.151,82×0,075 % + 49.746,97×0,030 % = 186,21206 ; + 6,010121 de
  //                  presentación + 3,005061 de nota simple = 195,22725 ; ×1,21 = 236,22497
  //   Total gastos . 0 + 1.500 + 758,98275 + 236,22497 + 300 = 2.795,20771 → 1,40 % del precio
  //   Coste total .. 200.000 + 2.795,20771 = 202.795,20771
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
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('758,98 €');
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('236,22 €');

    await expect(page.locator('h3', { hasText: /Total gastos adicionales/ }).first()).toHaveText('Total gastos adicionales (parcial)');
    expect(await valorTarjeta(page, /Total gastos adicionales/)).toBe('2795,20 €');
    expect(await descripcionTarjeta(page, /Total gastos adicionales/)).toContain(
      'SIN el IGIC, que no está incluido',
    );
    await expect(page.locator('h3', { hasText: /COSTE TOTAL/ }).first()).toHaveText('COSTE TOTAL (PARCIAL)');
    expect(await valorTarjeta(page, /COSTE TOTAL/)).toBe('202.795,20 €');

    // El aviso del IVA del 4 % de VPO no puede salir donde no hay IVA que rebajar
    await expect(page.getByText(/protección oficial de régimen especial/)).toHaveCount(0);
  });

  // ── MITAD A · control de NO regresión ───────────────────────────────────────
  // La misma operación en la península tiene que seguir dando exactamente lo de antes:
  //   IVA .......... 200.000 × 10 % (IVA_INMUEBLES_2025.obraNueva) = 20.000
  //   AJD .......... 200.000 × 0,75 % (ITP_CCAA.madrid.ajd) = 1.500
  //   Total gastos . 20.000 + 1.500 + 758,98275 + 236,22497 + 300 = 22.795,20771 → 11,40 %
  //   Coste total .. 222.795,20771
  //   Aviso VPO .... 200.000 × 4 % (IVA_INMUEBLES_2025.viviendaProtegida) = 8.000
  test('CIERRE A (control) — Madrid, primera mano: el camino peninsular no se ha tocado', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Primera mano/ }).click();
    await page.locator('#ccaa-inmueble').selectOption('madrid');
    await rellenar(page, 'Precio de la vivienda', '200000');
    await rellenar(page, 'Gastos de gestoría del comprador (€)', '300');

    await expect(page.locator('h3', { hasText: /^IVA/ }).first()).toHaveText('IVA (10,00%)');
    expect(await valorTarjeta(page, /^IVA/)).toBe('20.000,00 €');
    expect(await valorTarjeta(page, /^AJD/)).toBe('1500,00 €');
    await expect(page.locator('h3', { hasText: /Total gastos adicionales/ }).first()).toHaveText('Total gastos adicionales');
    expect(await valorTarjeta(page, /Total gastos adicionales/)).toBe('22.795,20 €');
    await expect(page.locator('h3', { hasText: /COSTE TOTAL/ }).first()).toHaveText('COSTE TOTAL DE ADQUISICIÓN');
    expect(await valorTarjeta(page, /COSTE TOTAL/)).toBe('222.795,20 €');
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
  //   Notaría ...... arancel = 90,15 + 108,182205 + 45,0759 + 90,15182 + 249.746,97×0,05 %
  //                  (=124,873485) = 458,43341 ; ×1,21 = 554,70443 ; ×1,75 = 970,73275
  //   Registro ..... 24,04 + 42,0708575 + 37,56325 + 67,613865 + 249.746,97×0,030 %
  //                  (=74,924091) = 246,21206 ; + 9,015182 = 255,22725 ; ×1,21 = 308,82497
  //   Total gastos . 0 + 1.000 + 970,73275 + 308,82497 + 300 = 2.579,55771 → 0,64 % del precio
  //   Coste total .. 402.579,55771
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
    await expect(page.locator('h3', { hasText: /^AJD/ }).first()).toHaveText('AJD (0,25%)');
    expect(await valorTarjeta(page, /^AJD/)).toBe('1000,00 €');
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('970,73 €');
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('308,82 €');
    expect(await valorTarjeta(page, /Total gastos adicionales/)).toBe('2579,55 €');
    expect(await descripcionTarjeta(page, /Total gastos adicionales/)).toContain(
      'SIN el IPSI, que no está incluido',
    );
    expect(await valorTarjeta(page, /COSTE TOTAL/)).toBe('402.579,55 €');
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
  // montaje de los dos test.fail() de abajo: si esto se pone rojo, lo que falla es el
  // caso, no el hallazgo.
  //   plusvalía .... objetivo 50.000 × 0,10 (8 años) × 25 % = 1.250 ; real
  //                  70.000 × (50.000/120.000) × 25 % = 7.291,67 → gana el objetivo
  //   comisión ..... 250.000 × 3 % = 7.500
  //   v. transmis. . 250.000 − 7.500 − 1.250 = 241.250
  //   ganancia ..... 241.250 − 180.000 = 61.250
  //   IRPF ......... 6.000×19 % + 44.000×21 % + 11.250×23 % = 1.140 + 9.240 + 2.587,50
  //                  = 12.967,50
  //   total gastos . 1.250 + 7.500 + 0 + 12.967,50 = 21.717,50
  //   neto ......... 250.000 − 21.717,50 = 228.282,50
  test('CASO 20 (control) — vendedor con comisión del 3 % y sin otros gastos', async ({ page }) => {
    await page.goto(RUTA);
    await rellenar(page, 'Precio de la vivienda', '250000');
    await page.getByRole('button', { name: 'Vendedor' }).click();
    await rellenar(page, 'Precio de compra original', '180000');
    await rellenar(page, 'Años de propiedad', '8');
    await rellenar(page, 'Valor catastral del suelo', '50000');
    await rellenar(page, 'Valor catastral total (suelo + construcción)', '120000');
    await rellenar(page, 'Comisión inmobiliaria (%)', '3');

    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('1250,00 €');
    expect(await valorTarjeta(page, 'Valor de transmisión')).toBe('241.250,00 €');
    expect(await valorTarjeta(page, 'Ganancia patrimonial')).toBe('61.250,00 €');
    expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('12.967,50 €');
    expect(await valorTarjeta(page, 'Total gastos vendedor')).toBe('21.717,50 €');
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('228.282,50 €');
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

    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('228.282,50 €');
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

    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('234.057,50 €');
  },
);

// Hallazgo 478 — reparado. El bloque educativo deriva ahora los dos recargos de
// `ESCALA_RECARGO_EXTEMPORANEO`, igual que ya hacían garaje y trastero.
test(
  'REGRESIÓN — el bloque educativo no publica la escala de recargos anterior a la Ley 11/2021',
  async ({ page }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: 'Ver guía educativa' }).click();

    await expect(page.getByText(/5% al 20%/)).toHaveCount(0);
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
// Y cuatro hallazgos NUEVOS, en `test.fail()` hasta que se reparen.
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
    await expect(page.locator('h3', { hasText: /^ITP/ }).first()).toHaveText('ITP (8,00%)');
    expect(await valorTarjeta(page, /^ITP/)).toBe('25.600,00 €');

    // Arancel notarial (ARANCELES_NOTARIO, nº 2 del RD 1426/1989) sobre 320.000 €:
    //   90,15 + 24.040,49×0,45 % + 30.050,60×0,15 % + 90.151,82×0,10 % + 169.746,97×0,05 %
    //   = 90,15 + 108,182205 + 45,0759 + 90,15182 + 84,873485 = 418,43341
    //   con el 21 % de IVA = 506,3044261
    // Factura (FACTURA_NOTARIAL, factores 1,5 y 2): min 759,456639 · max 1.012,608852
    //   · medio 886,032746 ← el que suma la app
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('886,03 €');
    expect(await descripcionTarjeta(page, 'Gastos de notaría')).toContain(
      'Factura estimada entre 759,46 € y 1012,61 €',
    );

    // Registro (ARANCELES_REGISTRO, nº 2 del RD 1427/1989) sobre 320.000 €:
    //   24,04 + 24.040,49×0,175 % + 30.050,60×0,125 % + 90.151,82×0,075 % + 169.746,97×0,030 %
    //   = 24,04 + 42,0708575 + 37,56325 + 67,613865 + 50,924091 = 222,2120635 (< tope
    //   REGISTRO_MAXIMO 2.181,67) + 6,010121 (nº 1) + 3,005061 (nº 4) = 231,2272455
    //   con el 21 % de IVA = 279,7849671
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('279,78 €');
    expect(await valorTarjeta(page, 'Gastos de gestoría')).toBe('300,00 €');

    // Total = 25.600 + 886,032746 + 279,784967 + 300 = 27.065,817713 → 8,4581 % del precio
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('27.065,81 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toContain('8,46%');
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('347.065,81 €');
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
    await expect(page.locator('h3', { hasText: /^AJD/ }).first()).toHaveText('AJD (0,25%)');
    expect(await valorTarjeta(page, /^AJD/)).toBe('450,00 €');

    // Arancel notarial sobre 180.000 €: 90,15 + 108,182205 + 45,0759 + 90,15182
    //   + 29.746,97×0,05 % (=14,873485) = 348,43341 ; ×1,21 = 421,6044261 ; ×1,75 = 737,807746
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('737,81 €');
    // Registro: 24,04 + 42,0708575 + 37,56325 + 67,613865 + 29.746,97×0,030 % (=8,924091)
    //   = 180,2120635 ; + 9,015182 = 189,2272455 ; ×1,21 = 228,9649671
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('228,96 €');

    // Total = 0 + 450 + 737,807746 + 228,964967 + 300 = 1.716,772713 → 0,9538 % del precio.
    // Los rótulos tienen que decir que es PARCIAL: falta el IPSI, que la app no calcula.
    await expect(page.locator('h3', { hasText: /Total gastos adicionales/ }).first()).toHaveText(
      'Total gastos adicionales (parcial)',
    );
    expect(await valorTarjeta(page, /Total gastos adicionales/)).toBe('1716,77 €');
    expect(await descripcionTarjeta(page, /Total gastos adicionales/)).toContain(
      'SIN el IPSI, que no está incluido',
    );
    await expect(page.locator('h3', { hasText: /COSTE TOTAL/ }).first()).toHaveText(
      'COSTE TOTAL (PARCIAL)',
    );
    expect(await valorTarjeta(page, /COSTE TOTAL/)).toBe('181.716,77 €');
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
      'Sin la plusvalía municipal ni el IRPF de la ganancia',
    );
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('242.500,00 €');
    expect(await descripcionTarjeta(page, 'IMPORTE NETO VENDEDOR')).toContain('INCOMPLETO');
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
      'Rellena el precio de compra original para obtener el neto real',
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
    await expect(page.locator('h3', { hasText: /^ITP/ }).first()).toHaveText('ITP (6,00%)');
    expect(await valorTarjeta(page, /^ITP/)).toBe('12.000,00 €');
    // Arancel notarial acumulado hasta 200.000 € = 358,43341 ; ×1,21 IVA = 433,704426 ;
    // ×1,75 (punto medio de FACTURA_NOTARIAL) = 758,982746
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('758,98 €');
    // Registro = 186,212064 + 6,010121 (presentación) + 3,005061 (nota simple) = 195,227246 ;
    // ×1,21 IVA = 236,224967
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('236,22 €');
    expect(await valorTarjeta(page, 'Gastos de gestoría')).toBe('300,00 €');
    // 12.000 + 758,982746 + 236,224967 + 300 = 13.295,207713 → 6,6476 % del precio
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('13.295,20 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toContain('6,65%');
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('213.295,20 €');

    // ── Vendedor de la MISMA operación ──────────────────────────────────────
    await page.getByRole('button', { name: 'Vendedor' }).click();
    await rellenar(page, 'Precio de compra original', '150000');
    await rellenar(page, 'Años de propiedad', '10');
    await rellenar(page, 'Valor catastral del suelo', '50000');
    await rellenar(page, 'Valor catastral total (suelo + construcción)', '120000');
    // «Impuestos y gastos que pagaste al comprar», «mejoras» y «otros gastos» se dejan
    // vacíos a propósito: son opcionales y `parseSpanishNumberOr` los lee como 0.

    // Plusvalía municipal (art. 107 TRLHL, RDL 26/2021):
    //   objetivo = 50.000 × 0,08 (COEFICIENTES_IIVTNU_2025, 10 años)
    //              × 25 % (PLUSVALIA_MUNICIPAL_META.tipoOrientativo) = 1.000
    //   real     = (200.000 − 150.000) × 50.000/120.000 × 25 % = 5.208,33
    //   → el contribuyente elige el más favorable: 1.000 €
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('1000,00 €');
    expect(await descripcionTarjeta(page, 'Plusvalía municipal')).toBe(
      'Método objetivo (más favorable)',
    );

    // Art. 35 LIRPF (calcularGananciaInmueble):
    //   adquisición = 150.000 + 0 gastos + 0 mejoras = 150.000
    //   transmisión = 200.000 − 6.000 (comisión 3 %) − 1.000 (plusvalía) = 193.000
    //   ganancia    = 193.000 − 150.000 = 43.000
    expect(await valorTarjeta(page, 'Valor de adquisición')).toBe('150.000,00 €');
    expect(await valorTarjeta(page, 'Valor de transmisión')).toBe('193.000,00 €');
    expect(await valorTarjeta(page, 'Ganancia patrimonial')).toBe('43.000,00 €');
    // TRAMOS_GANANCIAS_PATRIMONIALES_2025: 6.000×19 % + 37.000×21 % = 1.140 + 7.770 = 8.910
    expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('8910,00 €');
    expect(await valorTarjeta(page, 'Comisión inmobiliaria')).toBe('6000,00 €');
    // 1.000 plusvalía + 6.000 comisión + 0 otros + 8.910 IRPF = 15.910 ; neto = 184.090
    expect(await valorTarjeta(page, 'Total gastos vendedor')).toBe('15.910,00 €');
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('184.090,00 €');
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
    await expect(page.locator('h3', { hasText: /^ITP/ }).first()).toHaveText('ITP (11,13%)');

    // Arancel notarial: 558,93946 + (1.600.000 − 601.012,10)×0,03 % = 858,63583 ;
    //   ×1,21 = 1.038,949354 → horquilla 1.558,42-2.077,90 y medio 1.818,161370
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('1818,16 €');
    expect(await descripcionTarjeta(page, 'Gastos de notaría')).toContain(
      'Factura estimada entre 1558,42 € y 2077,90 €',
    );
    // Registro: 306,51569 + (1.600.000 − 601.012,10)×0,020 % = 506,313274 (< tope 2.181,67)
    //   + 6,010121 + 3,005061 = 515,328456 ; ×1,21 = 623,547431
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('623,55 €');

    // 178.000 + 1.818,161370 + 623,547431 + 300 = 180.741,708801 → 11,2964 % del precio
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('180.741,71 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toContain('11,30%');
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('1.780.741,71 €');
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
    //   + notaría 737,808  (arancel 421,604343 × 1,75)
    //   + registro 228,957 (arancel 180,212064 + 9,015182, con el 21 % de IVA)
    //   + gestoría 300 (GESTORIA_TIPICA, la cuarta partida del rótulo — hallazgo 673)
    //   = 12.066,765 → formatNumber(…, 0) = «12.067»
    await expect(
      page.locator('input[aria-label="Impuestos y gastos que pagaste al comprar"]'),
    ).toHaveValue('12.067');
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
    await expect(tarjeta).toContainText(`tipo del ${PLUSVALIA_MUNICIPAL_META.tipoOrientativo}%`);
    await expect(tarjeta).toContainText(
      `máximo legal del ${PLUSVALIA_MUNICIPAL_META.tipoMaximoLegal}%`,
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
    await expect(tarjeta).toContainText(`IVA al ${IVA_INMUEBLES_2025.obraNueva}%`);
    await expect(tarjeta).toContainText(`IVA al ${IVA_INMUEBLES_2025.local}%`);
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

    // Lo que cobra el motor para 200.000 €: arancel 433,7044 × 1,5 y × 2 → 650,56 y 867,41.
    // La pregunta del JSON-LD sobre la escritura notarial cita esa misma pareja, redondeada
    // a la decena: «entre 650 € y 870 €».
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
    expect(todo).toContain('650 € y 870 €');

    // El bloque visible dice lo mismo para la banda de 100.000 € a 500.000 €:
    //   notaría  514,20 → 1.230,41  (redondeado a la decena: 510 € y 1.230 €)
    //   registro 172,56 →   345,12  (170 € y 350 €)
    const lista = page.getByText(/Notaría:\s*entre/);
    const texto = (await lista.innerText()).replace(ESPACIO_DURO, ' ').replace(/\s+/g, ' ');
    // es-ES no agrupa los millares de una cifra de cuatro dígitos: «1230 €», no «1.230 €».
    expect(texto).toContain('510 €');
    expect(texto).toContain('1230 €');
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
   *   Notaría    = arancel(250.000) × 1,21 × 1,75                =    811,92 €
   *     arancel = 90,15 + 24.040,49×0,45 % + 30.050,60×0,15 % + 90.151,82×0,10 %
   *               + 99.746,97×0,05 % = 383,43341 → ×1,21 = 463,95 → ×1,75 = 811,92
   *   Registro   = (201,2120635 + 6,010121 + 3,005061) × 1,21    =    254,37 €
   *   Gestoría                                                    =    300,00 €
   *   AJD        = 0 (segunda mano: no hay tarjeta)
   *   Total      = 19.375,00 + 811,92 + 254,37 + 300,00          = 20.741,29 €
   *   % sobre precio = 20.741,29 / 250.000                        =      8,30 %
   *   Coste total = 250.000 + 20.741,29                          = 270.741,29 €
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
    await expect(page.locator('h3', { hasText: 'ITP (7,75%)' })).toBeVisible();
    expect(await valorTarjeta(page, /^ITP/)).toBe('19.375,00 €');
    expect(await valorTarjeta(page, /Gastos de notaría/)).toBe('811,92 €');
    expect(await valorTarjeta(page, /Registro de la Propiedad/)).toBe('254,37 €');
    expect(await valorTarjeta(page, /Gastos de gestoría/)).toBe('300,00 €');
    expect(await valorTarjeta(page, /^Total gastos adicionales/)).toBe('20.741,29 €');
    expect(await descripcionTarjeta(page, /^Total gastos adicionales/)).toBe('8,30% sobre el precio');
    expect(await valorTarjeta(page, /COSTE TOTAL DE ADQUISICIÓN/)).toBe('270.741,29 €');

    // En segunda mano no hay AJD: la tarjeta no debe existir
    await expect(page.locator('h3', { hasText: /^AJD/ })).toHaveCount(0);

    // El 3 % de familia numerosa se ofrece como oportunidad, con su límite de renta a la vista
    const aviso = page.locator('div[class*="avisoReducidos"]');
    await expect(aviso).toContainText('3,00% — Familia numerosa');
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
   * Notaría(1.000.000): arancel = 90,15 + 108,182205 + 45,0759 + 90,15182 + 225,379535
   *   + 119,69637 = 678,63583 → ×1,21 = 821,1494 → ×1,75           = 1.437,01 €
   * Registro(1.000.000) = (386,3132735 + 6,010121 + 3,005061) × 1,21 = 478,35 €
   *   Total = 90.000,00 + 1.437,01 + 478,35 + 300,00              = 92.215,36 € (9,22 %)
   *   Coste total                                                  = 1.092.215,36 €
   */
  test('CASO 29 (límite) — Valencia en el canto de la escala: 1.000.000 € tributa entero al 9 %', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Segunda mano/ }).click();
    await page.locator('#ccaa-inmueble').selectOption('valencia');
    await rellenar(page, 'Precio de la vivienda', '1000000');
    await rellenar(page, 'Gastos de gestoría del comprador (€)', '300');

    // La escala que la app anuncia es la que tiene que aplicar
    expect(ITP_CCAA.valencia.tramosProgresivos).toEqual([
      { hasta: 1000000, tipo: 9 },
      { hasta: Infinity, tipo: 11 },
    ]);
    await expect(page.locator('p', { hasText: 'escala progresiva' }).first()).toContainText(
      '9% → 11%',
    );

    expect(await valorTarjeta(page, /^ITP/)).toBe('90.000,00 €');
    await expect(page.locator('h3', { hasText: 'ITP (9,00%)' })).toBeVisible();
    expect(await valorTarjeta(page, /Gastos de notaría/)).toBe('1437,01 €');
    expect(await valorTarjeta(page, /Registro de la Propiedad/)).toBe('478,35 €');
    expect(await valorTarjeta(page, /^Total gastos adicionales/)).toBe('92.215,36 €');
    expect(await descripcionTarjeta(page, /^Total gastos adicionales/)).toBe('9,22% sobre el precio');
    expect(await valorTarjeta(page, /COSTE TOTAL DE ADQUISICIÓN/)).toBe('1.092.215,36 €');

    // Un euro por encima del canto: el 11 % grava el EXCESO, no el total
    await rellenar(page, 'Precio de la vivienda', '1000001');
    expect(await valorTarjeta(page, /^ITP/)).toBe('90.000,11 €');

    // Y 200.000 € por encima: 90.000 + 22.000
    await rellenar(page, 'Precio de la vivienda', '1200000');
    expect(await valorTarjeta(page, /^ITP/)).toBe('112.000,00 €');
    await expect(page.locator('h3', { hasText: 'ITP (9,33%)' })).toBeVisible();
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

    await expect(
      page.getByText('Introduce el precio del inmueble para ver el desglose de gastos del comprador'),
    ).toBeVisible();
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
   *   Plusvalía municipal (COEFICIENTES_IIVTNU_2025[12] = 0,08; tipo orientativo 25 %):
   *     objetivo = 40.000 × 0,08 × 25 %                            =    800,00 €
   *     real     = 100.000 × (40.000/100.000) × 25 %               = 10.000,00 €
   *     recomendado = min                                          =    800,00 € (objetivo)
   *   Comisión = 300.000 × 3 %                                     =  9.000,00 €
   *   Valor de adquisición = 200.000                               = 200.000,00 €
   *   Valor de transmisión = 300.000 − 9.000 − 800                 = 290.200,00 €
   *   Ganancia = 290.200 − 200.000                                 =  90.200,00 €
   *   IRPF = 6.000×19 % + 44.000×21 % + 40.200×23 %
   *        = 1.140 + 9.240 + 9.246                                 =  19.626,00 €
   *   Total gastos = 800 + 9.000 + 19.626                          =  29.426,00 €
   *   Neto = 300.000 − 29.426                                      = 270.574,00 €
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

    expect(await valorTarjeta(page, /^Plusvalía municipal/)).toBe('800,00 €');
    expect(await descripcionTarjeta(page, /^Plusvalía municipal/)).toBe(
      'Método objetivo (más favorable)',
    );
    expect(await valorTarjeta(page, /^Valor de adquisición/)).toBe('200.000,00 €');
    expect(await valorTarjeta(page, /^Valor de transmisión/)).toBe('290.200,00 €');
    expect(await valorTarjeta(page, /^Ganancia patrimonial/)).toBe('90.200,00 €');
    expect(await valorTarjeta(page, /IRPF sobre ganancia/)).toBe('19.626,00 €');
    expect(await descripcionTarjeta(page, /IRPF sobre ganancia/)).toBe(
      'Tributación en base del ahorro',
    );
    expect(await valorTarjeta(page, /^Total gastos vendedor/)).toBe('29.426,00 €');
    expect(await valorTarjeta(page, /IMPORTE NETO VENDEDOR/)).toBe('270.574,00 €');
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
    // Sin IRPF, el total del vendedor son plusvalía (800) + comisión (9.000)
    expect(await valorTarjeta(page, /^Total gastos vendedor/)).toBe('9800,00 €');
    expect(await valorTarjeta(page, /IMPORTE NETO VENDEDOR/)).toBe('290.200,00 €');
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

    const desc = await descripcionTarjeta(page, /^Total gastos adicionales/);
    const pct = Number(desc.match(/([\d,]+)%/)![1].replace(',', '.'));
    expect(pct).toBeCloseTo(6.65, 2);

    // Y el otro extremo que nombra el hallazgo: País Vasco sobre el mismo precio.
    //   ITP 200.000 × 4 % = 8.000 · Notaría 758,98 · Registro 236,22 · Gestoría 300
    //   Total 9.295,20 € → 4,65 % del precio
    await page.locator('#ccaa-inmueble').selectOption('pais-vasco');
    await expect
      .poll(() => descripcionTarjeta(page, /^Total gastos adicionales/))
      .toContain('4,65%');
    const pctPv = 4.65;

    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
    const paso1 = await page
      .locator('li', { hasText: 'Calcula el presupuesto total antes de firmar' })
      .first()
      .innerText();
    // La horquilla se publica con decimales («3,3%»), así que el regex admite la coma.
    const rango = paso1.match(/entre un ([\d,]+)% y un ([\d,]+)%/)!;
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
    await expect(caso).toContainText(`${ajdPct}% de AJD`);
    // Y su importe: 180.000 × 1,5 %. El ejemplo escribía «2.700 €» con punto de millar, que
    // no es lo que produce el formateador de la app para esa cifra —la tarjeta de AJD dice
    // «2700,00 €» (CASO 8)—, y esa fue la señal de que iba tecleado. Se comparan las cifras
    // sin millares para que el test no dependa de cuál de los dos formatos salga.
    const cuota = (180000 * ITP_CCAA.valencia.ajd) / 100;
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
    await expect(faq).toContainText(`IVA al ${IVA_INMUEBLES_2025.obraNueva}%`);
  });

  /**
   * CASO 32 (control de la vuelta) — País Vasco, obra nueva: un 0 que SÍ es correcto.
   *
   * `ITP_CCAA['pais-vasco'].ajd = 0` (régimen foral), así que la tarjeta de AJD no se
   * pinta —el guard es `ajd > 0`— y eso es lo que debe pasar: aquí el cero no es un dato
   * que falte, es que no se devenga. Se dejó como control junto a H1 y H2, que sí eran
   * hallazgos, para que se vea que la ausencia de una tarjeta no siempre es un defecto.
   *   IVA        = 200.000 × 10 %                                  = 20.000,00 €
   *   Notaría    = 758,98 € · Registro = 236,22 € · Gestoría = 300 €
   *   Total      = 21.295,20 € (10,65 %) · Coste total = 221.295,20 €
   */
  test('CASO 32 (control) — País Vasco, obra nueva: sin AJD porque su régimen foral no lo cobra', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Primera mano/ }).click();
    await page.locator('#ccaa-inmueble').selectOption('pais-vasco');
    await rellenar(page, 'Precio de la vivienda', '200000');

    expect(ITP_CCAA['pais-vasco'].ajd).toBe(0);
    expect(await valorTarjeta(page, /^IVA/)).toBe('20.000,00 €');
    await expect(page.locator('h3', { hasText: /^AJD/ })).toHaveCount(0);
    expect(await valorTarjeta(page, /^Total gastos adicionales/)).toBe('21.295,20 €');
    expect(await valorTarjeta(page, /COSTE TOTAL DE ADQUISICIÓN/)).toBe('221.295,20 €');
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
// o a las apps hermanas y no a esta), declarados con el modificador `test.fail(...)`:
// afirman lo que DEBERÍA ocurrir, así que hoy fallan a propósito. Cuando se reparen, se
// cambia `test.fail(` por `test(` y quedan como regresión.
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
   *   Notaría    = arancel(300.000) × 1,21 × 1,75                 =    864,86 €
   *     arancel = 90,15 + 24.040,49×0,45 % + 30.050,60×0,15 %
   *               + 90.151,82×0,10 % + 149.746,97×0,05 % = 408,43341
   *               → ×1,21 = 494,2044 → ×1,75 = 864,8577  (RD 1426/1989 nº 2 + FACTURA_NOTARIAL)
   *     horquilla: ×1,5 = 741,31 € y ×2 = 988,41 €
   *   Registro   = (216,2120635 + 6,010121 + 3,005061) × 1,21     =    272,52 €
   *     (RD 1427/1989 nº 2, más el asiento de presentación nº 1 y la nota simple nº 4)
   *   Gestoría (GESTORIA_TIPICA)                                   =    300,00 €
   *   AJD        = 0 — segunda mano, no se pinta la tarjeta
   *   Total gastos = 27.000,00 + 864,86 + 272,52 + 300,00         = 28.437,38 €
   *   % sobre precio = 28.437,38 / 300.000                         =      9,48 %
   *   Coste total  = 300.000 + 28.437,38                          = 328.437,38 €
   *
   * ── VENDEDOR ──────────────────────────────────────────────────────────────
   * Compra 200.000 €, 10 años, suelo catastral 60.000 €, total catastral 100.000 €,
   * comisión 3 %, sin otros gastos, sin gastos de adquisición, vivienda habitual, < 65 años.
   *   Plusvalía objetivo = 60.000 × 0,08 × 25 %                    =  1.200,00 €
   *     (COEFICIENTES_IIVTNU_2025 → 10 años = 0,08 · PLUSVALIA_MUNICIPAL_META.tipoOrientativo = 25)
   *   Plusvalía real     = (300.000 − 200.000) × 0,6 × 25 %        = 15.000,00 €
   *     → gana el OBJETIVO, que es el menor (art. 107.5 TRLHL)
   *   Comisión           = 300.000 × 3 %                           =  9.000,00 €
   *   Valor adquisición  = 200.000                                 = 200.000,00 €
   *   Valor transmisión  = 300.000 − 9.000 − 1.200                 = 289.800,00 €
   *   Ganancia           = 289.800 − 200.000                       =  89.800,00 €
   *   IRPF (base del ahorro, TRAMOS_GANANCIAS_PATRIMONIALES_2025):
   *     6.000×19 % = 1.140 · 44.000×21 % = 9.240 · 39.800×23 % = 9.154
   *                                                              =  19.534,00 €
   *   Total gastos vendedor = 1.200 + 9.000 + 19.534              =  29.734,00 €
   *   Neto               = 300.000 − 29.734                        = 270.266,00 €
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
    expect(await page.locator('h3', { hasText: /^ITP/ }).first().innerText()).toBe('ITP (9,00%)');
    // En segunda mano no hay AJD de compraventa
    await expect(page.locator('h3', { hasText: /^AJD/ })).toHaveCount(0);
    expect(await valorTarjeta(page, /Gastos de notaría/)).toBe('864,86 €');
    expect(await descripcionTarjeta(page, /Gastos de notaría/)).toContain(
      'entre 741,31 € y 988,41 €',
    );
    expect(await valorTarjeta(page, /Registro de la Propiedad/)).toBe('272,52 €');
    expect(await valorTarjeta(page, /Gastos de gestoría/)).toBe('300,00 €');
    expect(await valorTarjeta(page, /Total gastos adicionales/)).toBe('28.437,38 €');
    expect(await descripcionTarjeta(page, /Total gastos adicionales/)).toBe('9,48% sobre el precio');
    expect(await valorTarjeta(page, /COSTE TOTAL DE ADQUISICIÓN/)).toBe('328.437,38 €');

    // Con perfil General, «Municipios despoblados» (4 %) no se aplica pero SÍ se ofrece:
    // no es un tipo de colectivo, así que entra en `alAlcanceDeCualquiera`.
    await expect(page.getByText('4,00% — Municipios despoblados')).toBeVisible();

    // ── Vendedor ──
    await page.getByRole('button', { name: 'Vendedor' }).click();
    await rellenar(page, 'Precio de compra original', '200000');
    await rellenar(page, 'Años de propiedad', '10');
    await rellenar(page, 'Valor catastral del suelo', '60000');
    await rellenar(page, 'Valor catastral total (suelo + construcción)', '100000');
    await rellenar(page, 'Comisión inmobiliaria (%)', '3');

    // es-ES no agrupa los millares de una cifra de cuatro dígitos: «1200,00 €», no «1.200,00 €»
    expect(await valorTarjeta(page, /^Plusvalía municipal/)).toBe('1200,00 €');
    expect(await descripcionTarjeta(page, /^Plusvalía municipal/)).toBe(
      'Método objetivo (más favorable)',
    );
    expect(await valorTarjeta(page, /^Valor de adquisición/)).toBe('200.000,00 €');
    expect(await valorTarjeta(page, /^Valor de transmisión/)).toBe('289.800,00 €');
    expect(await valorTarjeta(page, /^Ganancia patrimonial/)).toBe('89.800,00 €');
    expect(await valorTarjeta(page, /^IRPF sobre ganancia/)).toBe('19.534,00 €');
    expect(await valorTarjeta(page, /^Comisión inmobiliaria/)).toBe('9000,00 €');
    expect(await valorTarjeta(page, /^Total gastos vendedor/)).toBe('29.734,00 €');
    expect(await valorTarjeta(page, /IMPORTE NETO VENDEDOR/)).toBe('270.266,00 €');
    // El neto está COMPLETO: no falta ninguna partida por descontar
    expect(await descripcionTarjeta(page, /IMPORTE NETO VENDEDOR/)).toBe('Lo que realmente recibes');
  });

  /**
   * CASO 34 bis (control) — el mismo caso con 1 AÑO de tenencia, que sí funciona.
   *
   * Coeficiente de COEFICIENTES_IIVTNU_2025 para `anios: 1` = 0,13:
   *   Plusvalía objetivo = 60.000 × 0,13 × 25 % = 1.950,00 €
   * Sirve para aislar el CASO 34: lo que falla no es el año 1, es el año 0.
   */
  test('CASO 34 bis (control) — 1 año de tenencia liquida con el coeficiente 0,13', async ({
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

    expect(COEFICIENTES_IIVTNU_2025.find((c) => c.anios === 1)?.coeficiente).toBe(0.13);
    expect(await valorTarjeta(page, /^Plusvalía municipal/)).toBe('1950,00 €');
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
   */
  test(
    'CASO 34 (límite) — 0 años de tenencia: la reventa antes del año tributa con el coeficiente 0,14',
    async ({ page }) => {
      await page.goto(RUTA);
      await page.locator('#ccaa-inmueble').selectOption('cantabria');
      await rellenar(page, 'Precio de la vivienda', '300000');
      await page.getByRole('button', { name: 'Vendedor' }).click();
      await rellenar(page, 'Precio de compra original', '200000');
      await rellenar(page, 'Valor catastral del suelo', '60000');
      await rellenar(page, 'Valor catastral total (suelo + construcción)', '100000');
      await rellenar(page, 'Comisión inmobiliaria (%)', '3');

      // El coeficiente existe en la tabla y es mayor que el del año 1
      expect(COEFICIENTES_IIVTNU_2025.find((c) => c.anios === 0)?.coeficiente).toBe(0.14);

      const campoAnios = page.locator('input[aria-label="Años de propiedad"]');
      await campoAnios.fill('0');
      await campoAnios.blur();

      // 1) El campo no puede reescribirse solo: «0 años» es un dato válido, no un error
      expect(await campoAnios.inputValue()).toBe('0');
      // 2) Y la plusvalía sale por el coeficiente de «Menos de 1 año»
      expect(await valorTarjeta(page, /^Plusvalía municipal/)).toBe('2100,00 €');
      expect(await valorTarjeta(page, /^Valor de transmisión/)).toBe('288.900,00 €');
      expect(await valorTarjeta(page, /^Ganancia patrimonial/)).toBe('88.900,00 €');
      expect(await valorTarjeta(page, /^IRPF sobre ganancia/)).toBe('19.327,00 €');
      expect(await valorTarjeta(page, /^Total gastos vendedor/)).toBe('30.427,00 €');
      expect(await valorTarjeta(page, /IMPORTE NETO VENDEDOR/)).toBe('269.573,00 €');
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
    await expect(page.getByText('Introduce el precio del inmueble')).toBeVisible();

    // b) La pestaña Vendedor tampoco puede inventarse un neto
    await page.getByRole('button', { name: 'Vendedor' }).click();
    await expect(page.getByText('Introduce el precio de venta')).toBeVisible();
    await expect(page.locator('h3', { hasText: /IMPORTE NETO VENDEDOR/ })).toHaveCount(0);

    // c) Al salir del campo, el NumberInput lo acota a su `min` y sigue sin haber importes
    await page.getByRole('button', { name: 'Comprador' }).click();
    await campoPrecio.blur();
    expect(await campoPrecio.inputValue()).toBe('0');
    await expect(page.locator('h3', { hasText: /^ITP/ })).toHaveCount(0);
    await expect(page.getByText('Introduce el precio del inmueble')).toBeVisible();
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
      // 18.000 + 758,98 + 236,22 + 300 = 19.295,21 → formatNumber(…, 0) = «19.295»
      expect(await campo.inputValue()).toBe('19.295');
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

      // Las tres partidas que publica el propio caso
      expect(texto).toContain('notaría (685 €)');
      expect(texto).toContain('registro (209 €)');
      expect(texto).toContain('gestoría (300 €)');
      // …y el total tiene que ser su suma, escrita como la escribe el formateador del proyecto
      expect(texto).toContain('unos 1194 €');
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
   *   Notaría   = arancel(200.000) × 1,21 × 1,75                 =    758,98 €
   *     arancel = 90,15 + 24.040,49×0,45 % + 30.050,60×0,15 % + 90.151,82×0,10 %
   *               + 49.746,97×0,05 % = 358,43341 → ×1,21 = 433,7044 → ×1,75 = 758,9827
   *     horquilla de FACTURA_NOTARIAL: ×1,5 = 650,56 € y ×2 = 867,41 €
   *   Registro  = (186,2120635 + 6,010121 + 3,005061) × 1,21      =    236,22 €
   *   Gestoría (GESTORIA_TIPICA)                                  =    300,00 €
   *   AJD       = 0 — segunda mano, la tarjeta no se pinta
   *   Total gastos = 16.000 + 758,98 + 236,22 + 300               = 17.295,20 €
   *   % sobre precio = 17.295,20 / 200.000                        =      8,65 %
   *   Coste total  = 200.000 + 17.295,20                          = 217.295,20 €
   */
  test('CASO 36 (normal) — Aragón, segunda mano, vivienda de 200.000 €', async ({ page }) => {
    await page.goto(RUTA);
    await page.locator('#ccaa-inmueble').selectOption('aragon');
    await rellenar(page, 'Precio de la vivienda', '200000');

    // El tipo nominal que anuncia el panel de la comunidad
    expect(ITP_CCAA.aragon.tipoGeneral).toBe(8);

    expect(await valorTarjeta(page, /^Precio del inmueble/)).toBe('200.000,00 €');
    expect(await valorTarjeta(page, /^ITP/)).toBe('16.000,00 €');
    await expect(page.getByRole('heading', { name: 'ITP (8,00%)' })).toBeVisible();
    expect(await valorTarjeta(page, /^Gastos de notaría/)).toBe('758,98 €');
    expect(await descripcionTarjeta(page, /^Gastos de notaría/)).toContain(
      'entre 650,56 € y 867,41 €',
    );
    expect(await valorTarjeta(page, /^Registro de la Propiedad/)).toBe('236,22 €');
    expect(await valorTarjeta(page, /^Gastos de gestoría/)).toBe('300,00 €');
    expect(await valorTarjeta(page, /^Total gastos adicionales/)).toBe('17.295,20 €');
    expect(await descripcionTarjeta(page, /^Total gastos adicionales/)).toBe(
      '8,65% sobre el precio',
    );
    expect(await valorTarjeta(page, /COSTE TOTAL DE ADQUISICIÓN/)).toBe('217.295,20 €');
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
   *   Notaría  = arancel(500.000) × 1,21 × 1,75 =  1.076,61 €
   *     arancel = 90,15 + 108,182205 + 45,0759 + 90,15182 + 174,873485 = 508,43341
   *               → ×1,21 = 615,2044 → ×1,75 = 1.076,6077 · horquilla 922,81 € – 1.230,41 €
   *   Registro = (276,2120635 + 9,015182) × 1,21 =    345,12 €
   *   Gestoría                                   =    300,00 €
   *   Total gastos = 40.750 + 1.076,61 + 345,12 + 300 = 42.471,73 €  →  8,49 % del precio
   *   Coste total                                = 542.471,73 €
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
    await expect(page.getByText(/escala progresiva \(8% → 8,5% → 9% → 9,5% → 10%\)/)).toBeVisible();

    expect(await valorTarjeta(page, /^ITP/)).toBe('40.750,00 €');
    // El rótulo lleva el tipo EFECTIVO: con escala progresiva el nominal contradiría al importe
    await expect(page.getByRole('heading', { name: 'ITP (8,15%)' })).toBeVisible();
    expect(await valorTarjeta(page, /^Gastos de notaría/)).toBe('1076,61 €');
    expect(await valorTarjeta(page, /^Registro de la Propiedad/)).toBe('345,12 €');
    expect(await valorTarjeta(page, /^Total gastos adicionales/)).toBe('42.471,73 €');
    expect(await descripcionTarjeta(page, /^Total gastos adicionales/)).toBe(
      '8,49% sobre el precio',
    );
    expect(await valorTarjeta(page, /COSTE TOTAL DE ADQUISICIÓN/)).toBe('542.471,73 €');
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
    await expect(page.getByRole('heading', { name: 'ITP (7,00%)' })).toBeVisible();

    // Un euro por encima del tope ya no lo tiene, y la app tiene que decir que existe
    await rellenar(page, 'Precio de la vivienda', '150000');
    expect(await valorTarjeta(page, /^ITP/)).toBe('12.000,00 €');
    await expect(page.getByRole('heading', { name: 'ITP (8,00%)' })).toBeVisible();
    await expect(page.getByText('7,00% — Jóvenes < 35 años')).toBeVisible();
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
    expect(juntos).not.toContain('rondan el 1%-2%');
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
    expect(lineas).not.toMatch(/\d+\.\d+%/);
    expect(lineas).toContain('3,5%');
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
      page.getByText('0% - Jóvenes < 30 años o discapacidad ≥33% (1ª vivienda)'),
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
  expect(jsonLd).not.toContain('rondan el 1%-2%');
  const fedatarios200k =
    estimarFacturaNotarial(200000).medio + calcularRegistro(200000) + 300; // gestoría típica
  const pct200k = (fedatarios200k / 200000) * 100;
  const horquilla = jsonLd.match(/rondan el (\d+,\d+) % al (\d+,\d+) %/);
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
   *   Notaría   = arancel(140.000) × 1,21 × 1,75                  =    684,60 €
   *     arancel = 90,15 + 24.040,49×0,45 % + 30.050,60×0,15 % + 79.898,79×0,10 %
   *               = 323,306895 → ×1,21 = 391,201343 → ×1,75 = 684,602350
   *   Registro  = (163,5982 + 6,010121 + 3,005061) × 1,21         =    208,86 €
   *   Gestoría (GESTORIA_TIPICA, valor por defecto del campo)      =    300,00 €
   *   AJD       = 0 — segunda mano: TPO y AJD son incompatibles (art. 31.2 TRLITPAJD)
   *   Total gastos = 5.600 + 684,60 + 208,86 + 300                =  6.793,46 €
   *   % sobre precio = 6.793,46 / 140.000                          =      4,85 %
   *   Coste total = 140.000 + 6.793,46                             = 146.793,46 €
   * (formato es-ES: un número de cuatro cifras va SIN punto de millar — «6793,46 €»)
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

    await expect(page.getByRole('heading', { name: 'ITP (4,00%)' })).toBeVisible();
    expect(await valorTarjeta(page, /^ITP/)).toBe('5600,00 €');
    expect(await valorTarjeta(page, /^Gastos de notaría/)).toBe('684,60 €');
    expect(await valorTarjeta(page, /^Registro de la Propiedad/)).toBe('208,86 €');
    expect(await valorTarjeta(page, /^Gastos de gestoría/)).toBe('300,00 €');
    expect(await valorTarjeta(page, /^Total gastos adicionales/)).toBe('6793,46 €');
    expect(await descripcionTarjeta(page, /^Total gastos adicionales/)).toBe(
      '4,85% sobre el precio',
    );
    expect(await valorTarjeta(page, /COSTE TOTAL DE ADQUISICIÓN/)).toBe('146.793,46 €');
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
   *   Notaría  = arancel(250.000) × 1,21 × 1,75                    =    811,92 €
   *     arancel = 90,15 + 108,182205 + 45,0759 + 90,15182 + 49,873485 = 383,43341
   *               → ×1,21 = 463,954426 → ×1,75 = 811,920246
   *   Registro = (201,2120635 + 6,010121 + 3,005061) × 1,21        =    254,37 €
   *   Gestoría                                                      =    300,00 €
   *   Total gastos = 20.000 + 811,92 + 254,37 + 300                = 21.366,29 €  (8,55 %)
   *   Coste total                                                   = 271.366,29 €
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
    await expect(page.getByText(/escala progresiva \(8% → 10%\)/)).toBeVisible();

    await expect(page.getByRole('heading', { name: 'ITP (8,00%)' })).toBeVisible();
    expect(await valorTarjeta(page, /^ITP/)).toBe('20.000,00 €');
    expect(await valorTarjeta(page, /^Gastos de notaría/)).toBe('811,92 €');
    expect(await valorTarjeta(page, /^Registro de la Propiedad/)).toBe('254,37 €');
    expect(await valorTarjeta(page, /^Total gastos adicionales/)).toBe('21.366,29 €');
    expect(await descripcionTarjeta(page, /^Total gastos adicionales/)).toBe(
      '8,55% sobre el precio',
    );
    expect(await valorTarjeta(page, /COSTE TOTAL DE ADQUISICIÓN/)).toBe('271.366,29 €');

    // El reducido perdido se enseña como oportunidad, con el tope que lo dejó fuera
    const aviso = page.locator('div[class*="avisoReducidos"]').first();
    await expect(aviso).toContainText('4,00% — Jóvenes < 36 años');
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
      'Sin la plusvalía municipal',
    );
    expect(await valorTarjeta(page, /IMPORTE NETO VENDEDOR/)).toBe('233.695,00 €');
    expect(await descripcionTarjeta(page, /IMPORTE NETO VENDEDOR/)).toBe(
      'INCOMPLETO: falta descontar la plusvalía municipal. Rellena el valor catastral del suelo para obtener el neto real.',
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
    const aplicado = Number(rotulo.match(/([\d,]+)%/)![1].replace(',', '.'));
    expect(aplicado).toBe(3.5);

    // Al joven andaluz ya se le cobra el reducido más bajo: no hay rebaja que ofrecerle, y el
    // aviso desaparece en vez de ofrecerle el 6,00 % como si lo fuera.
    await expect(page.locator('div[class*="avisoReducidos"]')).toHaveCount(0);

    // Y el mecanismo sigue vivo donde SÍ hay rebaja: al perfil general se le cobra el 7,00 % y
    // el 6,00 % de vivienda habitual es una rebaja de verdad.
    await page.locator('#perfil-comprador').selectOption('general');
    const rotuloGeneral = await page.locator('h3', { hasText: /^ITP/ }).first().innerText();
    const aplicadoGeneral = Number(rotuloGeneral.match(/([\d,]+)%/)![1].replace(',', '.'));
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
      const tipo = Number(linea.match(/([\d,]+)%/)![1].replace(',', '.'));
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
    await expect(page.getByRole('heading', { name: 'ITP (4,00%)' })).toBeVisible();
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
    await expect(page.getByRole('heading', { name: 'IVA (21,00%)' })).toBeVisible();
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
   *   Notaría   = arancel(250.000) × 1,21 × 1,75                        =     811,92 €
   *     arancel = 90,15 + 24.040,49×0,45 % + 30.050,60×0,15 %
   *               + 90.151,82×0,10 % + 99.746,97×0,05 %
   *               = 383,433410 → ×1,21 = 463,954426 → ×1,75 = 811,920245
   *   Registro  = (201,212064 + 6,010121 + 3,005061) × 1,21             =     254,37 €
   *   Gestoría (GESTORIA_TIPICA, valor por defecto del campo)            =     300,00 €
   *   AJD       = 0 — segunda mano: TPO y AJD son incompatibles (art. 31.2 TRLITPAJD)
   *   Total gastos = 20.000 + 811,92 + 254,37 + 300                     =  21.366,29 €
   *   % sobre precio = 21.366,29 / 250.000                               =       8,55 %
   *   Coste total = 250.000 + 21.366,29                                  = 271.366,29 €
   */
  test('CASO 43 (normal) — Asturias, segunda mano, vivienda de 250.000 €', async ({ page }) => {
    await abrir14(page);
    await page.locator('#ccaa-inmueble').selectOption('asturias');
    await sembrar14(page, 'Precio de la vivienda', '250000');

    await expect(page.getByRole('heading', { name: 'ITP (8,00%)' })).toBeVisible();
    expect(await valorTarjeta(page, /^ITP/)).toBe('20.000,00 €');
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('811,92 €');
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('254,37 €');
    expect(await valorTarjeta(page, 'Gastos de gestoría')).toBe('300,00 €');
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('21.366,29 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toBe('8,55% sobre el precio');
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('271.366,29 €');

    // Y que la escala que la app anuncia es la de la tabla, no otra
    const tramos = (ITP_CCAA['asturias'].tramosProgresivos ?? []).map((t) => `${t.tipo}%`);
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
    //   Notaría   = arancel(140.000) × 1,21 × 1,75                =    684,60 €
    //   Registro  = (163,598193 + 6,010121 + 3,005061) × 1,21     =    208,86 €
    //   Gestoría                                                   =    300,00 €
    //   Total gastos = 9.800 + 684,60 + 208,86 + 300              = 10.993,46 €
    //   Coste total  = 140.000 + 10.993,46                        = 150.993,46 €
    await expect(page.getByRole('heading', { name: 'ITP (7,00%)' })).toBeVisible();
    expect(await valorTarjeta(page, /^ITP/)).toBe('9800,00 €');
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('10.993,46 €');
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('150.993,46 €');
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
   *   Notaría   = arancel(160.000) × 1,21 × 1,75                            =     716,63 €
   *     arancel = 90,15 + 24.040,49×0,45 % + 30.050,60×0,15 %
   *               + 90.151,82×0,10 % + 9.746,97×0,05 %  = 338,43341
   *               → ×1,21 = 409,504426 → ×1,75 = 716,632746
   *   Registro  = (174,212064 + 6,010121 + 3,005061) × 1,21                 =     221,70 €
   *   Gestoría (GESTORIA_TIPICA, valor por defecto del campo)                =     300,00 €
   *   AJD       = 0 — segunda mano: TPO y AJD son incompatibles (art. 31.2 TRLITPAJD)
   *   Total gastos = 14.400 + 716,63 + 221,70 + 300                         =  15.638,33 €
   *   % sobre precio = 15.638,33 / 160.000                                   =       9,77 %
   *   Coste total  = 160.000 + 15.638,33                                     = 175.638,33 €
   */
  test('CASO 45 (normal) — Castilla-La Mancha, segunda mano, vivienda de 160.000 €', async ({
    page,
  }) => {
    await abrir21(page);
    await page.locator('#ccaa-inmueble').selectOption('castilla-mancha');
    await sembrar21(page, 'Precio de la vivienda', '160000');

    expect(ITP_CCAA['castilla-mancha'].tipoGeneral).toBe(9);
    await expect(page.getByRole('heading', { name: 'ITP (9,00%)' })).toBeVisible();
    expect(await valorTarjeta(page, /^ITP/)).toBe('14.400,00 €');
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('716,63 €');
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('221,70 €');
    expect(await valorTarjeta(page, 'Gastos de gestoría')).toBe('300,00 €');
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('15.638,33 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toBe('9,77% sobre el precio');
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('175.638,33 €');
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
   *   Notaría   = arancel(150.000) × 1,21 × 1,75                        =     705,78 €
   *     arancel = 90,15 + 108,182205 + 45,0759 + 89.898,79×0,10 %
   *             = 333,306895 → ×1,21 = 403,301343 → ×1,75 = 705,777350
   *   Registro  = (171,098200 + 6,010121 + 3,005061) × 1,21             =     217,94 €
   *   Gestoría                                                           =     300,00 €
   *   Total gastos vivienda = 5.250 + 705,78 + 217,94 + 300             =   6.473,72 €  (4,32 %)
   *   Total gastos trastero = 10.500 + 705,78 + 217,94 + 300            =  11.723,72 €
   *   Coste total vivienda  = 156.473,72 €   ·   trastero = 161.723,72 €
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
    await expect(page.getByRole('heading', { name: 'ITP (3,50%)' })).toBeVisible();
    expect(await valorTarjeta(page, /^ITP/)).toBe('5250,00 €');
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('705,78 €');
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('217,94 €');
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('6473,72 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toBe('4,32% sobre el precio');
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('156.473,72 €');

    // Y el MISMO perfil, el mismo precio y la misma comunidad sobre un TRASTERO suelto
    // vuelven al tipo general: el doble de cuota, que es la dirección correcta.
    await page.getByRole('button', { name: /Trastero/ }).click();
    await expect(page.getByRole('heading', { name: 'ITP (7,00%)' })).toBeVisible();
    expect(await valorTarjeta(page, /^ITP/)).toBe('10.500,00 €');
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('11.723,72 €');
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('161.723,72 €');
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
   *   CONTROL (8 años, dato válido): coeficiente 0,10 de COEFICIENTES_IIVTNU_2025 y
   *     PLUSVALIA_MUNICIPAL_META.tipoOrientativo (25 %).
   *     plusvalía = 60.000 × 0,10 × 25 %                           =   1.500,00 €
   *     ganancia  = (250.000 − 7.500 − 1.500) − 180.000            =  61.000,00 €
   *     IRPF      = 1.140 + 9.240 + 11.000 × 23 % (2.530)          =  12.910,00 €
   *     total gastos = 1.500 + 7.500 + 12.910                      =  21.910,00 €
   *     neto         = 250.000 − 21.910                            = 228.090,00 €
   */
  test('CASO 47 (debe rechazarse) — «-0,5» años de tenencia no puede liquidar plusvalía', async ({
    page,
  }) => {
    expect(COEFICIENTES_IIVTNU_2025.find((c) => c.anios === 0)?.coeficiente).toBe(0.14);
    expect(COEFICIENTES_IIVTNU_2025.find((c) => c.anios === 8)?.coeficiente).toBe(0.1);
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
      'INCOMPLETO: falta descontar la plusvalía municipal',
    );

    // CONTROL: con un dato válido sí liquida, así que el rechazo de arriba no es parálisis
    await sembrar21(page, 'Años de propiedad', '8');
    await expect.poll(async () => valorTarjeta(page, 'Plusvalía municipal')).toBe('1500,00 €');
    expect(await descripcionTarjeta(page, 'Plusvalía municipal')).toBe(
      'Método objetivo (falta el valor catastral total para comparar)',
    );
    expect(await valorTarjeta(page, 'Total gastos vendedor')).toBe('21.910,00 €');
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('228.090,00 €');
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
    await expect(page.getByRole('heading', { name: 'ITP (9,00%)' })).toBeVisible();
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
   *   Notaría = arancel(300.000) × 1,21 × 1,75                           =     864,86 €
   *     arancel = 90,15 + 24.040,49×0,45 % + 30.050,60×0,15 %
   *               + 90.151,82×0,10 % + 149.746,97×0,05 %  = 408,43341
   *               → ×1,21 = 494,204426 → ×1,75 = 864,857746
   *   Registro = (216,212064 + 6,010121 + 3,005061) × 1,21               =     272,52 €
   *     216,212064 = 24,04 + 24.040,49×0,175 % + 30.050,60×0,125 %
   *                  + 90.151,82×0,075 % + 149.746,97×0,030 %
   *   Gestoría (GESTORIA_TIPICA, valor por defecto del campo)             =     300,00 €
   *   Total gastos = 30.000 + 1.500 + 864,86 + 272,52 + 300              =  32.937,38 €
   *   % sobre precio = 32.937,38 / 300.000                                =      10,98 %
   *   Coste total  = 300.000 + 32.937,38                                  = 332.937,38 €
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

    await expect(page.getByRole('heading', { name: 'IVA (10,00%)' })).toBeVisible();
    expect(await valorTarjeta(page, /^IVA/)).toBe('30.000,00 €');

    // El AJD se rotula con el tipo EFECTIVO: 1.500 / 300.000 = 0,50 %
    await expect(page.getByRole('heading', { name: 'AJD (0,50%)' })).toBeVisible();
    expect(await valorTarjeta(page, /^AJD/)).toBe('1500,00 €');

    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('864,86 €');
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('272,52 €');
    expect(await valorTarjeta(page, 'Gastos de gestoría')).toBe('300,00 €');
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('32.937,38 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toBe('10,98% sobre el precio');
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('332.937,38 €');
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
   *   Notaría  = arancel(180.304) × 1,21 × 1,75                          =     738,13 €
   *     arancel = 90,15 + 108,182205 + 45,0759 + 90,15182 + 30.050,97×0,05 %
   *             = 348,58541 → ×1,21 = 421,788346 → ×1,75 = 738,129606
   *   Registro = (180,3032635 + 6,010121 + 3,005061) × 1,21              =     229,08 €
   *   Gestoría                                                            =     300,00 €
   *   Total gastos = 10.818,24 + 738,13 + 229,08 + 300                   =  12.085,45 €  (6,70 %)
   *   Coste total  = 180.304 + 12.085,45                                 = 192.389,45 €
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
    await expect(page.getByRole('heading', { name: 'ITP (6,00%)' })).toBeVisible();
    expect(await valorTarjeta(page, /^ITP/)).toBe('10.818,24 €');
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('738,13 €');
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('229,08 €');
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('12.085,45 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toBe('6,70% sobre el precio');
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('192.389,45 €');

    // …y se ENSEÑA como oportunidad, con el del 4 % detrás
    const lineas = page.locator('ul[class*="avisoReducidosLista"] li');
    await expect(lineas).toHaveCount(2);
    await expect(lineas.nth(0)).toContainText('5,00% — Vivienda habitual');
    await expect(lineas.nth(1)).toContainText('4,00% — Municipios despoblados');

    // Un euro por encima del tope: el del 5 % ya no se puede ofrecer
    await sembrar22(page, 'Precio de la vivienda', String(tope + 1));
    expect(await valorTarjeta(page, /^ITP/)).toBe('10.818,30 €');
    const lineasArriba = page.locator('ul[class*="avisoReducidosLista"] li');
    await expect(lineasArriba).toHaveCount(1);
    await expect(lineasArriba.nth(0)).toContainText('4,00% — Municipios despoblados');
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
    // no se publican como definitivas: el aviso dice que el neto real es MAYOR.
    expect(irpf).toBe('8910,00 €');
    expect(neto).toBe('184.090,00 €');
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
    // Anclaje de los tres datos normativos del caso
    expect(
      COEFICIENTES_IIVTNU_2025.find((c) => c.anios === 10)?.coeficiente,
      'coeficiente de 10 años del RDL 26/2021',
    ).toBe(0.08);
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

    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('1000,00 €');
    expect(await valorTarjeta(page, 'Valor de transmisión')).toBe('193.000,00 €');
    expect(await valorTarjeta(page, 'Ganancia patrimonial')).toBe('43.000,00 €');
    expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('EXENTO');
    expect(await descripcionTarjeta(page, 'IRPF sobre ganancia')).toContain('art. 38 LIRPF');
    expect(await valorTarjeta(page, 'Total gastos vendedor')).toBe('7000,00 €');
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('193.000,00 €');
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

    const total = await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN');
    expect(
      await descripcionTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN'),
      `la gestoría ilegible se leyó como 0 € y su línea desapareció del desglose, pero ` +
        `el coste total (${total}) sigue anunciándose como completo`,
    ).not.toBe('Precio + todos los gastos');

    // La línea vuelve al desglose y el coste dice qué le falta, sin inventar el importe.
    expect(total).toBe('212.995,20 €');
    expect(await descripcionTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe(
      'No incluye la gestoría, que no se ha podido leer: el coste real será mayor',
    );
    expect(await valorTarjeta(page, 'Gastos de gestoría')).toBe('Sin leer');

    // Con la MISMA cifra en español vuelve a contarse, y el coste sube los 2.000,50 €.
    await sembrar22(page, 'Gastos de gestoría del comprador (€)', '2000,50');
    expect(await valorTarjeta(page, 'Gastos de gestoría')).toBe('2000,50 €');
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('214.995,70 €');
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

    expect(aviso).toContain('falta descontar la comisión inmobiliaria');
    const cota = aviso.match(/rebaja también el IRPF al descontarla, hasta un (\d+) % de su importe/);
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
 * Los hallazgos van con `test.fail()`. Para que ninguno pueda «fallar como se esperaba» por su
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
   *   Notaría  = arancel × 1,21 × 1,75
   *     arancel = 90,15 + 24.040,49×0,45 % + 30.050,60×0,15 % + 90.151,82×0,10 %
   *               + 29.746,97×0,05 % = 90,15 + 108,182205 + 45,0759 + 90,15182 + 14,873485
   *             = 348,43341 → ×1,21 = 421,604426 → ×1,75 = 737,807746         =     737,81 €
   *     (horquilla ×1,5 = 632,41 € · ×2 = 843,21 €)
   *   Registro = (24,04 + 42,0708575 + 37,56325 + 67,613865 + 29.746,97×0,030 %
   *               + 6,010121 + 3,005061) × 1,21 = 189,2272455 × 1,21            =     228,96 €
   *   Gestoría (GESTORIA_TIPICA, por defecto)                                  =     300,00 €
   *   Total = 9.000 + 737,81 + 228,96 + 300                                    =  10.266,77 €
   *   % = 10.266,77 / 180.000 = 5,7037 %                                       →       5,70 %
   *   Coste total = 190.266,77 €
   *
   * VENDEDOR — compra 120.000 · 7 años · suelo 30.000 · total 90.000 · gastos de aquella
   * compra 8.500 · mejoras 4.000 · otros gastos de la venta 600 · comisión 3 % · habitual:
   *   Plusvalía objetivo = 30.000 × 0,12 (7 años) × 25 %                        =     900,00 €
   *   Plusvalía real     = 60.000 × (30.000 / 90.000) × 25 %                    =   5.000,00 €
   *     → gana el objetivo, «Método objetivo (más favorable)»
   *   Comisión = 180.000 × 3 %                                                 =   5.400,00 €
   *   Valor de adquisición = 120.000 + 8.500 + 4.000                           = 132.500,00 €
   *   Valor de transmisión = 180.000 − 5.400 − 600 − 900                       = 173.100,00 €
   *   Ganancia = 40.600 → IRPF = 6.000×19 % + 34.600×21 % = 1.140 + 7.266     =   8.406,00 €
   *   Total gastos = 900 + 5.400 + 600 + 8.406                                 =  15.306,00 €
   *   Neto = 180.000 − 15.306                                                  = 164.694,00 €
   * Todos legibles: ni un aviso de ilegible puede aparecer (el aviso nuevo no se dispara solo).
   */
  test('CASO 52 (normal) — La Rioja, perfil discapacidad, 180.000 €: las dos pestañas', async ({ page }) => {
    const discapacidad = ITP_CCAA['rioja'].tiposReducidos.find((t) => t.nombre === 'Discapacidad ≥33%');
    expect(discapacidad?.tipo, 'el reducido sale de la tabla').toBe(5);
    expect(discapacidad?.condiciones).toEqual(['Discapacidad ≥ 33%', 'Vivienda habitual']);
    expect(ITP_CCAA['rioja'].tipoGeneral).toBe(7);
    expect(COEFICIENTES_IIVTNU_2025.find((c) => c.anios === 7)?.coeficiente).toBe(0.12);
    expect(PLUSVALIA_MUNICIPAL_META.tipoOrientativo).toBe(25);

    await abrir23(page);
    await page.getByRole('button', { name: /Segunda mano/ }).click();
    await page.locator('#ccaa-inmueble').selectOption('rioja');
    await page.locator('#perfil-comprador').selectOption('discapacidad');
    await sembrar23(page, 'Precio de la vivienda', '180000');

    await expect(page.getByRole('heading', { name: 'ITP (5,00%)' })).toBeVisible();
    expect(await valorTarjeta(page, /^ITP/)).toBe('9000,00 €');
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('737,81 €');
    expect(await descripcionTarjeta(page, 'Gastos de notaría')).toContain('entre 632,41 € y 843,21 €');
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('228,96 €');
    expect(await valorTarjeta(page, 'Gastos de gestoría')).toBe('300,00 €');
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('10.266,77 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toBe('5,70% sobre el precio');
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('190.266,77 €');
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

    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('900,00 €');
    expect(await descripcionTarjeta(page, 'Plusvalía municipal')).toBe('Método objetivo (más favorable)');
    expect(await valorTarjeta(page, 'Valor de adquisición')).toBe('132.500,00 €');
    expect(await valorTarjeta(page, 'Valor de transmisión')).toBe('173.100,00 €');
    expect(await valorTarjeta(page, 'Ganancia patrimonial')).toBe('40.600,00 €');
    expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('8406,00 €');
    expect(await descripcionTarjeta(page, 'IRPF sobre ganancia')).toBe('Tributación en base del ahorro');
    expect(await valorTarjeta(page, /^Comisión inmobiliaria/)).toBe('5400,00 €');
    expect(await valorTarjeta(page, 'Otros gastos de la venta')).toBe('600,00 €');
    expect(await valorTarjeta(page, 'Total gastos vendedor')).toBe('15.306,00 €');
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('164.694,00 €');
    expect(await descripcionTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('Lo que realmente recibes');
  });

  /**
   * CASO 53 (límite: el tramo MÁS ALTO de la escala del ahorro) — la cota de C3 en el 30 % y
   * en el canto de 300.000 €.
   *
   * La cota que publica C3 («hasta un T % de su importe») nunca se había medido fuera del 21 %.
   * Venta 700.000 · compra 350.000 · 10 años · suelo 40.000 · sin catastral total · 3 %:
   *   Plusvalía = 40.000 × 0,08 × 25 %                                          =     800,00 €
   *   Comisión  = 700.000 × 3 %                                                 =  21.000,00 €
   *   · Legible:  ganancia = 700.000 − 21.000 − 800 − 350.000 = 328.200
   *               IRPF = 71.880 + 28.200 × 30 %                                 =  80.340,00 €
   *               neto = 700.000 − (800 + 21.000 + 80.340)                      = 597.860,00 €
   *   · «3.0.0»:  ganancia = 349.200 → IRPF = 71.880 + 49.200 × 30 %            =  86.640,00 €
   *               neto = 700.000 − (800 + 86.640)                               = 612.560,00 €
   *   Hueco = 14.700,00 € = 21.000 × (1 − 30 %): las dos bases están en el 30 %, así que la
   *   cota se alcanza CON IGUALDAD. Aviso: «hasta un 30 % de su importe».
   *
   * Y en el canto: compra 399.200 → con la comisión ilegible la base es 300.000 EXACTOS, que
   * `find(base <= hasta)` coloca en el 27 % (el último euro tributa al 27 %, no al 30 %):
   *   · «3.0.0»:  IRPF = 71.880 → neto = 700.000 − (800 + 71.880)               = 627.320,00 €
   *   · Legible:  ganancia 279.000 → IRPF = 44.880 + 79.000 × 27 % = 66.210
   *               neto = 700.000 − (800 + 21.000 + 66.210)                      = 611.990,00 €
   *   Hueco = 15.330,00 € = 21.000 × (1 − 27 %).
   */
  test('CASO 53 (límite) — la cota de «falta descontar la comisión» en el 30 % y en el canto de 300.000 €', async ({
    page,
  }) => {
    expect(TRAMOS_GANANCIAS_PATRIMONIALES_2025.slice(-2)).toEqual([
      { hasta: 300000, tipo: 27 },
      { hasta: Infinity, tipo: 30 },
    ]);
    expect(COEFICIENTES_IIVTNU_2025.find((c) => c.anios === 10)?.coeficiente).toBe(0.08);

    await vendedor23(page, '700000', [
      ['Precio de compra original', '350000'],
      ['Años de propiedad', '10'],
      ['Valor catastral del suelo', '40000'],
    ]);
    expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('80.340,00 €');
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('597.860,00 €');
    expect(await descripcionTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('Lo que realmente recibes');

    await sembrar23(page, 'Comisión inmobiliaria (%)', '3.0.0');
    expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('86.640,00 €');
    expect(await descripcionTarjeta(page, 'IRPF sobre ganancia')).toMatch(/^TECHO:/);
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('612.560,00 €');
    expect(await descripcionTarjeta(page, 'IMPORTE NETO VENDEDOR')).toContain(
      'falta descontar la comisión inmobiliaria (la comisión rebaja también el IRPF al descontarla, hasta un 30 % de su importe)',
    );

    // El canto: la base queda en 300.000 exactos y el tramo es el del 27 %
    await sembrar23(page, 'Precio de compra original', '399200');
    expect(await valorTarjeta(page, 'Ganancia patrimonial')).toBe('300.000,00 €');
    expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('71.880,00 €');
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('627.320,00 €');
    expect(await descripcionTarjeta(page, 'IMPORTE NETO VENDEDOR')).toContain(
      'hasta un 27 % de su importe',
    );
    await sembrar23(page, 'Comisión inmobiliaria (%)', '3');
    expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('66.210,00 €');
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('611.990,00 €');
  });

  /**
   * CASO 54 (debe rechazarse) — un valor catastral del suelo MAYOR que el total no describe
   * ningún inmueble (el total incluye el suelo): el método real no se puede liquidar con él.
   *
   * Venta 185.000 · compra 180.000 · 6 años · suelo 60.000 · total 45.000 · 3 %:
   *   Objetivo = 60.000 × 0,16 (6 años) × 25 %                                  =   2.400,00 €
   *   Lo que NO puede salir: el real con la proporción topada a 1 —
   *     5.000 × min(1, 60.000/45.000) × 25 % = 1.250 €, «más favorable» (hallazgo 900).
   *   Comisión = 185.000 × 3 %                                                  =   5.550,00 €
   *   Valor de transmisión = 185.000 − 5.550 − 2.400                            = 177.050,00 €
   *   Pérdida = 180.000 − 177.050                                               =   2.950,00 €
   *   Neto = 185.000 − (2.400 + 5.550)                                          = 177.050,00 €
   * Con el par al derecho (suelo 45.000 · total 60.000):
   *   objetivo = 45.000 × 0,16 × 25 % = 1.800 · real = 5.000 × 0,75 × 25 % = 937,50 → 937,50 €
   *   valor de transmisión = 185.000 − 5.550 − 937,50 = 178.512,50 = neto          178.512,50 €
   */
  test('CASO 54 (debe rechazarse) — el par catastral imposible no se liquida por el método real', async ({ page }) => {
    expect(COEFICIENTES_IIVTNU_2025.find((c) => c.anios === 6)?.coeficiente).toBe(0.16);

    await montarParImposible(page);
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('2400,00 €');
    expect(await descripcionTarjeta(page, 'Plusvalía municipal')).toContain(
      'revisa los dos campos del recibo del IBI',
    );
    expect(await valorTarjeta(page, 'Valor de transmisión')).toBe('177.050,00 €');
    expect(await valorTarjeta(page, 'Pérdida patrimonial')).toBe('2950,00 €');
    expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('EXENTO');
    expect(await descripcionTarjeta(page, 'IRPF sobre ganancia')).toContain('No hay ganancia que gravar');
    expect(await valorTarjeta(page, 'Total gastos vendedor')).toBe('7950,00 €');
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('177.050,00 €');

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
   *   BASE B, total vacío     → objetivo 1.000,00 · «falta el valor catastral total» · neto
   *                             184.090,00 «Lo que realmente recibes».
   *   total «700.000.00»      → la plusvalía dice que NO SE HA PODIDO LEER (no que falta) y el
   *                             neto, 184.090,00, que el real es MAYOR.
   *   total 700.000 (legible) → real = 50.000 × (50.000/700.000) × 25 % = 892,86 €;
   *                             ganancia 43.107,14 → IRPF 1.140 + 37.107,14 × 21 % = 8.932,50;
   *                             neto = 200.000 − (892,86 + 6.000 + 8.932,50) = 184.174,64 €.
   */
  test('REPARACIÓN C1 — vacío, ilegible y legible dan tres mensajes distintos', async ({ page }) => {
    await vendedor23(page, '200000', BASE_B);
    expect(await descripcionTarjeta(page, 'Plusvalía municipal')).toBe(
      'Método objetivo (falta el valor catastral total para comparar)',
    );
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('184.090,00 €');
    expect(await descripcionTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('Lo que realmente recibes');

    await sembrar23(page, 'Valor catastral total (suelo + construcción)', '700.000.00');
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('1000,00 €');
    expect(await descripcionTarjeta(page, 'Plusvalía municipal')).toContain(
      'el valor catastral total no se ha podido leer',
    );
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('184.090,00 €');
    const aviso = await descripcionTarjeta(page, 'IMPORTE NETO VENDEDOR');
    expect(aviso).toContain('el valor catastral total');
    expect(aviso).toContain('el neto real es MAYOR que este');

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
   *   BASE B con gestoría «2.000.50» → IRPF 8.910,00 · neto 184.090,00 «Lo que realmente recibes».
   */
  test('REPARACIÓN C2 — una gestoría del comprador ilegible no mueve ni avisa en el vendedor', async ({ page }) => {
    await abrir23(page);
    await sembrar23(page, 'Precio de la vivienda', '200000');
    await sembrar23(page, 'Gastos de gestoría del comprador (€)', '2.000.50');
    expect(await valorTarjeta(page, 'Gastos de gestoría')).toBe('Sin leer');
    await page.getByRole('button', { name: 'Vendedor' }).click();
    await esperarHidratacion(page, ['input[aria-label="Precio de compra original"]']);
    for (const [etiqueta, valor] of BASE_B) await sembrar23(page, etiqueta, valor);

    expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('8910,00 €');
    expect(await descripcionTarjeta(page, 'IRPF sobre ganancia')).toBe('Tributación en base del ahorro');
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('184.090,00 €');
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

    // H1 — cifras resueltas en el propio hallazgo
    await montarH1(page);
    expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('11.365,71 €');
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('278.634,29 €');
    await sembrar23(page, 'Comisión inmobiliaria (%)', '3.0.0');
    expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('13.931,88 €');
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('285.068,12 €');

    // H2 — mayor de 65 + vivienda habitual: exento con y sin los gastos de aquella compra
    await vendedor23(page, '200000', [...BASE_B, ['Impuestos y gastos que pagaste al comprar', '2000,50']], {
      mayor65: true,
    });
    expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('EXENTO');
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('193.000,00 €');
    await sembrar23(page, 'Impuestos y gastos que pagaste al comprar', '2.000.50');
    expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('EXENTO');
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('193.000,00 €');

    // H3 — con el total legible gana el método real; ilegible, el objetivo
    await montarH3(page);
    await sembrar23(page, 'Valor catastral total (suelo + construcción)', '600000');
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('2500,00 €');
    expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('19.235,00 €');
    await sembrar23(page, 'Valor catastral total (suelo + construcción)', '600.000.00');
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('6750,00 €');
    expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('18.257,50 €');

    // H4 — las dos direcciones a la vez
    await vendedor23(page, '200000', [
      ...BASE_B,
      ['Comisión inmobiliaria (%)', '3,5'],
      ['Inversiones y mejoras (opcional)', '2000'],
    ]);
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('183.720,00 €');
    await sembrar23(page, 'Comisión inmobiliaria (%)', '3.5.0');
    await sembrar23(page, 'Inversiones y mejoras (opcional)', '2.000.00');
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('188.830,00 €');

    // H5 — el valor de adquisición se queda en el precio de compra
    await vendedor23(page, '200000', [...BASE_B, ['Impuestos y gastos que pagaste al comprar', '2.000.50']]);
    expect(await valorTarjeta(page, 'Valor de adquisición')).toBe('150.000,00 €');

    // H6 — precio de compra ilegible: no se calcula ni plusvalía ni IRPF
    await vendedor23(page, '200000', [...BASE_B.slice(1), ['Precio de compra original', '150.000.00']]);
    expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('Sin calcular');
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('194.000,00 €');

    // H7 — el par imposible, cifras en el CASO 54
    await montarParImposible(page);
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('177.050,00 €');
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
  test('H1 (hallazgo) — con hipoteca pendiente, la rebaja del IRPF supera la cota «hasta un T %»', async ({ page }) => {
    test.fail(); // H1 — la cota de C3 no vale con reinversión parcial + principal pendiente
    await montarH1(page);
    const netoReal = aEuros23(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR'));
    const importe = 300000 * 0.03;

    await sembrar23(page, 'Comisión inmobiliaria (%)', '3.0.0');
    const netoPublicado = aEuros23(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR'));
    const aviso = await descripcionTarjeta(page, 'IMPORTE NETO VENDEDOR');
    const cota = aviso.match(/hasta un (\d+) % de su importe/);
    expect(cota, `el aviso ya no publica la cota. Aviso: ${aviso}`).not.toBeNull();
    const tipo = Number(cota?.[1]);

    const hueco = netoPublicado - netoReal;
    const es = (n: number): string =>
      new Intl.NumberFormat('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
    expect(
      hueco,
      `el aviso dice que la comisión rebaja el IRPF «hasta un ${tipo} %», pero con la hipoteca ` +
        `pendiente lo rebaja un ${es((1 - hueco / importe) * 100)} %: el hueco real es ` +
        `${es(hueco)} € y la cota promete al menos ${es(importe * (1 - tipo / 100))} €`,
    ).toBeGreaterThanOrEqual(importe * (1 - tipo / 100) - 0.01);
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
    test.fail(); // H2 — el aviso de ilegible no mira si el importe puede mover la cuota
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
    test.fail(); // H3 — la tarjeta del IRPF no se entera de C1
    expect(COEFICIENTES_IIVTNU_2025.find((c) => c.anios === 20)?.coeficiente).toBe(0.45);
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
    test.fail(); // H4 — el aviso afirma MAYOR con un real 5.110,00 € menor
    await vendedor23(page, '200000', [
      ...BASE_B,
      ['Comisión inmobiliaria (%)', '3.5.0'],
      ['Inversiones y mejoras (opcional)', '2.000.00'],
    ]);
    const aviso = await descripcionTarjeta(page, 'IMPORTE NETO VENDEDOR');
    expect(aviso).toContain('falta descontar la comisión inmobiliaria');
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
    test.fail(); // H5 — la mitad de 1197 y de A3 que no llegó a la app de referencia
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
    test.fail(); // H6 — el mensaje del grupo B no llegó a la app de referencia
    await abrir23(page);
    await sembrar23(page, 'Precio de la vivienda', '200.000.00');
    expect
      .soft(await page.getByText(/Introduce el precio/).first().innerText())
      .toMatch(/no se ha podido leer/);

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
    test.fail(); // H7 — el neto no se entera del par imposible
    await montarParImposible(page);
    expect(await descripcionTarjeta(page, 'IMPORTE NETO VENDEDOR')).not.toBe('Lo que realmente recibes');
  });
});
