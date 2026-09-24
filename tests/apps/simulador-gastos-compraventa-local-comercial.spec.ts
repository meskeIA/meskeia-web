import { test, expect, Page } from '@playwright/test';
// Los casos del 12/09/2026 siembran con estos helpers: `page.goto()` espera al evento
// `load`, que no garantiza que React haya ejecutado los chunks, y sembrar en esa ventana
// mueve el DOM sin que el estado se entere (candado `check:hidratacion`).
import { esperarHidratacion, esperarValorEnReact } from './_hidratacion';
// Re-inspección del 23/09/2026: las escalas y los coeficientes con los que se resuelven sus
// casos a mano se LEEN de la misma ficha que compone la página, y se comprueban antes de
// usarlos, para que el ancla no sea una copia (como en la hermana garaje, hallazgo 625).
import { ITP_CCAA } from '../../data/itp-ccaa';
import {
  COEFICIENTES_IIVTNU_2025,
  IVA_INMUEBLES_2025,
  PLUSVALIA_MUNICIPAL_META,
  TRAMOS_GANANCIAS_PATRIMONIALES_2025,
} from '../../data/fiscal/inmuebles';

/**
 * Inspector — simulador-gastos-compraventa-local-comercial (segmento fiscal, riesgo 1 CRÍTICO)
 *
 * De dónde sale cada cifra esperada:
 *  - IVA del local comercial: `IVA_INMUEBLES_2025.local` = 21 (`data/fiscal/inmuebles.ts`,
 *    Ley 37/1992 del IVA). La app lo importa, no lo escribe.
 *  - Tipo general de ITP por CCAA: `TIPOS_ITP_CCAA_2025` (`data/fiscal/inmuebles.ts`), del
 *    que `ITP_CCAA` deriva su `tipoGeneral` — Madrid 6 %, Cataluña 10 % (escala 10/11/12/13),
 *    Murcia 7,75 %.
 *  - Escalas progresivas, tipos de AJD y aranceles: `data/itp-ccaa.ts` (ARANCELES_NOTARIO y
 *    ARANCELES_REGISTRO, RD 1426/1989 y RD 1427/1989; factura notarial = arancel × 1,75,
 *    punto medio de la horquilla 1,5–2 de FACTURA_NOTARIAL).
 *  - Bonificación del 50 % de la cuota en Ceuta y Melilla: art. 57 bis del TRLITPAJD
 *    (RDL 1/1993), implementada en `aplicarBonificacionCiudad` de `data/itp-ccaa.ts`.
 *  - Plusvalía municipal: `COEFICIENTES_IIVTNU_2025` y `PLUSVALIA_MUNICIPAL_META.tipoOrientativo`
 *    (= 25 %) de `data/fiscal/inmuebles.ts` (RDL 26/2021), vía `calcularPlusvaliaMunicipal`.
 *    La tabla tiene fila propia para «Menos de 1 año» (`anios: 0`, coeficiente 0,14): la
 *    reventa antes del año SÍ tributa desde el RDL 26/2021, y la ejercita el CASO 14.
 *  - Ganancia patrimonial e IRPF: `calcularGananciaInmueble` (`data/fiscal/ganancia-inmueble.ts`,
 *    arts. 34-36 LIRPF) sobre `TRAMOS_GANANCIAS_PATRIMONIALES_2025` (19 % hasta 6.000 ·
 *    21 % hasta 50.000 · 23 % hasta 200.000 · 27 % hasta 300.000 · 30 % el resto).
 *
 * Todos los importes se resolvieron a mano ANTES de ejecutar la app; el desglose va
 * comentado junto a cada aserción.
 *
 * Nota de formato: `formatCurrency` usa es-ES, que NO agrupa los millares de un número de
 * cuatro cifras («1500,00 €») y sí los de cinco o más («12.000,00 €»).
 */

const RUTA = '/simulador-gastos-compraventa-local-comercial/';

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

const NOTARIA_200K = '758,98 €';   // arancel 433,7044 × 1,75 (punto medio de la horquilla)
const REGISTRO_200K = '236,22 €';  // 195,2272 × 1,21 de IVA

test.describe('Simulador de gastos de compraventa de local comercial', () => {
  // ══════════════════════════════════════════════════════════════════════════
  // CASO 1 (normal) — el mismo local, por las tres vías fiscales que admite.
  // Es la comprobación que más dinero mueve: confundir ITP con IVA cambia la
  // factura de 12.000 € a 43.500 € sobre el mismo precio.
  // ══════════════════════════════════════════════════════════════════════════
  test('CASO 1 (normal) — Madrid, local de 200.000 €: ITP en 2ª mano, IVA + AJD en obra nueva y en la renuncia', async ({ page }) => {
    await page.goto(RUTA);
    await page.locator('#select-ccaa').selectOption('madrid');
    await rellenar(page, 'Precio del local comercial', '200000');
    await rellenar(page, 'Gastos de gestoría del comprador (€)', '500');

    // ── 1a. Segunda mano sin renuncia: exenta de IVA (art. 20.Uno.22º LIVA) → ITP.
    // ITP_CCAA.madrid.tipoGeneral = 6 (TIPOS_ITP_CCAA_2025 'Madrid', data/fiscal/inmuebles.ts),
    // sin escala progresiva: 200.000 × 6 % = 12.000. Un local NO tiene tipos reducidos.
    await page.getByRole('button', { name: /Segunda mano/ }).first().click();
    await expect(page.locator('h3', { hasText: /^ITP/ }).first()).toHaveText('ITP (6,00%)');
    expect(await valorTarjeta(page, /^ITP/)).toBe('12.000,00 €');
    // Sin renuncia no hay cuota gradual de AJD: la tarjeta no debe existir.
    await expect(page.locator('h3', { hasText: /^AJD/ })).toHaveCount(0);
    await expect(page.locator('h3', { hasText: /^IVA/ })).toHaveCount(0);

    // Notaría: ARANCELES_NOTARIO (RD 1426/1989) sobre 200.000 €:
    //   90,15 + 24.040,49×0,45 % + 30.050,60×0,15 % + 90.151,82×0,10 % + 49.746,97×0,05 %
    //   = 358,43341 ; × 1,21 de IVA = 433,7044 ; × 1,75 (FACTURA_NOTARIAL) = 758,9827
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe(NOTARIA_200K);
    expect(await descripcionTarjeta(page, 'Gastos de notaría')).toContain('650,56 €');
    expect(await descripcionTarjeta(page, 'Gastos de notaría')).toContain('867,41 €');
    // Registro: ARANCELES_REGISTRO (RD 1427/1989):
    //   24,04 + 24.040,49×0,175 % + 30.050,60×0,125 % + 90.151,82×0,075 % + 49.746,97×0,030 %
    //   = 186,2121 ; + 6,010121 de presentación + 3,005061 de nota simple ; × 1,21 = 236,2250
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe(REGISTRO_200K);

    // Total = las CUATRO líneas ya redondeadas, que es como las ve el usuario (hallazgo 594):
    //   12.000 + 758,98 + 236,22 + 500 = 13.495,20 → 6,7476 % de 200.000
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('13.495,20 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toContain('6,75%');
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('213.495,20 €');

    // ── 1b. Primera entrega del promotor: IVA 21 % + AJD, nunca ITP.
    // IVA_INMUEBLES_2025.local = 21 → 200.000 × 21 % = 42.000
    // ITP_CCAA.madrid.ajd = 0,75 → 200.000 × 0,75 % = 1.500
    await page.getByRole('button', { name: /Obra nueva/ }).click();
    await expect(page.locator('h3', { hasText: /^IVA/ }).first()).toHaveText('IVA (21,00%)');
    expect(await valorTarjeta(page, /^IVA/)).toBe('42.000,00 €');
    await expect(page.locator('h3', { hasText: /^AJD/ }).first()).toHaveText('AJD (0,75%)');
    expect(await valorTarjeta(page, /^AJD/)).toBe('1500,00 €');
    await expect(page.locator('h3', { hasText: /^ITP/ })).toHaveCount(0);
    // Total = 42.000 + 1.500 + 758,98 + 236,22 + 500 = 44.995,20 → 22,4976 %
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('44.995,20 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toContain('22,50%');
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('244.995,20 €');

    // ── 1c. Segunda mano CON renuncia a la exención (art. 20.Dos LIVA): IVA 21 % con
    // inversión del sujeto pasivo + AJD. Mismo importe que la obra nueva, distinto título
    // y aviso propio, porque el comprador lo autoliquida en vez de pagarlo al vendedor.
    await page.getByRole('button', { name: /renuncia IVA/ }).click();
    await expect(page.locator('h3', { hasText: /^IVA/ }).first()).toHaveText('IVA (renuncia · ISP) (21,00%)');
    expect(await valorTarjeta(page, /^IVA/)).toBe('42.000,00 €');
    expect(await descripcionTarjeta(page, /^IVA/)).toContain('inversión del sujeto pasivo');
    expect(await valorTarjeta(page, /^AJD/)).toBe('1500,00 €');
    await expect(page.getByText('Renuncia a la exención de IVA (Art. 20.Dos LIVA)')).toBeVisible();
    await expect(page.locator('h3', { hasText: /^ITP/ })).toHaveCount(0);

    // El disclaimer de nivel 1 CRÍTICO no puede colapsarse y el sello de datos normativos
    // debe estar a la vista (política de disclaimers, apps fiscales).
    await expect(page.getByText('Información Importante sobre Herramientas Financieras')).toBeVisible();
    await expect(page.locator('[aria-label="Datos de referencia normativos"]').first()).toContainText('17/06/2026');
  });

  // ══════════════════════════════════════════════════════════════════════════
  // CASO 2 (límite) — el tramo más alto de una escala progresiva y el territorio
  // con régimen especial. Los dos caminos que un tipo plano se salta.
  // ══════════════════════════════════════════════════════════════════════════
  test('CASO 2 (límite) — Cataluña 1.600.000 € recorre los cuatro tramos, y Ceuta bonifica el 50 % de la cuota', async ({ page }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Segunda mano/ }).first().click();
    await page.locator('#select-ccaa').selectOption('cataluna');
    await rellenar(page, 'Precio del local comercial', '1600000');
    await rellenar(page, 'Gastos de gestoría del comprador (€)', '500');

    // ITP_CCAA.cataluna.tramosProgresivos = 10 % hasta 600.000 · 11 % hasta 900.000 ·
    // 12 % hasta 1.500.000 · 13 % el resto (Decreto-ley 5/2025). Con 1.600.000 € se
    // recorren los cuatro, incluido el último:
    //   600.000×10 % + 300.000×11 % + 600.000×12 % + 100.000×13 %
    //   = 60.000 + 33.000 + 72.000 + 13.000 = 178.000
    // Tipo EFECTIVO = 178.000 / 1.600.000 = 11,125 % → 11,13 % con dos decimales. Hasta el
    // 25/08/2026 la app lo redondeaba a 0 y rotulaba «ITP (11%)», que sobre ese precio son
    // 176.000 € y no 178.000 €.
    expect(await valorTarjeta(page, /^ITP/)).toBe('178.000,00 €');
    await expect(page.locator('h3', { hasText: /^ITP/ }).first()).toHaveText('ITP (11,13%)');

    // Notaría sobre 1.600.000 €: 90,15 + 24.040,49×0,45 % + 30.050,60×0,15 % +
    //   90.151,82×0,10 % + 450.759,07×0,05 % + 998.987,90×0,03 % = 858,63583 ;
    //   × 1,21 = 1.038,9494 ; × 1,75 = 1.818,1614
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('1818,16 €');
    // Registro: 24,04 + 42,0709 + 37,5633 + 67,6139 + 135,2277 + 199,7976 = 506,3133 ;
    //   + 9,015182 ; × 1,21 = 623,5474 (por debajo del tope REGISTRO_MAXIMO de 2.181,67)
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('623,55 €');
    // Total = 178.000 + 1.818,1614 + 623,5474 + 500 = 180.941,7088 → 11,3089 %
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('180.941,71 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toContain('11,31%');
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('1.780.941,71 €');

    // ── Ceuta: art. 57 bis.3.a) del TRLITPAJD bonifica el 50 % de la cuota de las
    // transmisiones de inmuebles situados allí, sin distinguir el uso. Tipo 6 % (tarifa
    // estatal del art. 11 TRLITPAJD, declarado como excepción en ITP_CCAA porque Ceuta no
    // figura en TIPOS_ITP_CCAA_2025): 200.000 × 6 % = 12.000 ; × 0,5 = 6.000 (efectivo 3 %).
    await page.locator('#select-ccaa').selectOption('ceuta');
    await rellenar(page, 'Precio del local comercial', '200000');
    expect(await valorTarjeta(page, /^ITP/)).toBe('6000,00 €');
    await expect(page.locator('h3', { hasText: /^ITP/ }).first()).toHaveText('ITP (3,00%)');
    // Total = 6.000 + 758,98 + 236,22 + 500 = 7.495,20 → 3,7476 %
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('7495,20 €');
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('207.495,20 €');

    // En Ceuta no rige el IVA sino el IPSI (TERRITORIOS_SIN_IVA): al pasar a obra nueva,
    // la app tiene que advertirlo en vez de callarse.
    await page.getByRole('button', { name: /Obra nueva/ }).click();
    await expect(page.getByText(/no se aplica el IVA/)).toBeVisible();
  });

  // ══════════════════════════════════════════════════════════════════════════
  // CASO 3 (rechazo) — lo que NO debe calcularse.
  // ══════════════════════════════════════════════════════════════════════════
  test('CASO 3 (rechazo) — precio negativo, cero y texto: la app pide el dato en vez de inventarse una cifra', async ({ page }) => {
    await page.goto(RUTA);

    // Al abrir, sin precio, no puede haber ni totales ni «No definido» (el NaN de un campo
    // vacío no lo atrapa una guarda `precio <= 0`, así que se comprueba explícitamente).
    await expect(page.getByText('Introduce el precio del local comercial')).toBeVisible();
    await expect(page.getByText('No definido')).toHaveCount(0);

    const campo = page.locator('input[aria-label="Precio del local comercial"]');

    // Importe negativo: nada de ITP negativo ni de coste total negativo.
    await campo.fill('-50000');
    await expect(page.getByText('Introduce el precio del local comercial')).toBeVisible();
    await expect(page.locator('h3', { hasText: 'COSTE TOTAL DE ADQUISICIÓN' })).toHaveCount(0);
    // Y al salir del campo, NumberInput lo lleva al mínimo declarado (min = 0).
    await campo.blur();
    await expect(campo).toHaveValue('0');

    // Base cero: mismo tratamiento, sin tarjetas a 0,00 €.
    await expect(page.getByText('Introduce el precio del local comercial')).toBeVisible();
    await expect(page.locator('h3', { hasText: 'COSTE TOTAL DE ADQUISICIÓN' })).toHaveCount(0);

    // Texto: el input ni siquiera admite los caracteres.
    await campo.fill('');
    await campo.type('abc');
    await expect(campo).toHaveValue('');
    await expect(page.getByText('No definido')).toHaveCount(0);
  });

  // ══════════════════════════════════════════════════════════════════════════
  // HALLAZGOS del Inspector — 25/08/2026, los tres REPARADOS el mismo día
  // ══════════════════════════════════════════════════════════════════════════

  /**
   * ✅ HALLAZGO 330 (alto), reparado — la gestoría del VENDEDOR no entraba en el cálculo
   * hasta que se tocaba otro campo. El `useMemo` de resultadosVendedor usaba
   * `gastosGestoriaVenta` pero declaraba `gastosGestoria` (la del COMPRADOR) en su array de
   * dependencias: el campo separado el 20/08/2026 por el art. 35.1 LIRPF se separó en el
   * valor, no en las dependencias. Consecuencia medida: al escribir 2.000 € de gestoría del
   * vendedor, el neto seguía diciendo 187.398,00 € en vez de 185.818,00 € —1.580,00 € de
   * más—, y solo se corregía al editar la gestoría del comprador, que no pinta nada ahí.
   */
  test('CASO 4 (regresión 330) — la gestoría del vendedor reduce la ganancia en cuanto se escribe', async ({ page }) => {
    await page.goto(RUTA);
    await rellenar(page, 'Precio del local comercial', '200000');
    await page.getByRole('button', { name: /Vendedor/ }).click();
    await rellenar(page, 'Precio de compra original', '150000');
    await rellenar(page, 'Impuestos y gastos que pagaste al comprarlo (€)', '15000');
    await rellenar(page, 'Años de propiedad', '10');
    await rellenar(page, 'Valor catastral del suelo (€)', '40000');
    await rellenar(page, 'Valor catastral total (suelo + construcción) (€)', '100000');
    await rellenar(page, 'Comisión de la inmobiliaria (%)', '3');

    // Plusvalía municipal, por los dos métodos del RDL 26/2021:
    //   objetivo = 40.000 × 0,08 (COEFICIENTES_IIVTNU_2025, 10 años) × 25 % = 800
    //   real     = (200.000 − 150.000) × 40.000/100.000 × 25 % = 5.000
    //   → gana el objetivo, 800 €
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('800,00 €');
    expect(await descripcionTarjeta(page, 'Plusvalía municipal')).toContain('Método objetivo');

    // Sin gestoría del vendedor (art. 35.1 LIRPF):
    //   adquisición = 150.000 + 15.000 = 165.000
    //   transmisión = 200.000 − 6.000 de comisión − 800 de plusvalía = 193.200
    //   ganancia    = 28.200 → IRPF = 6.000×19 % + 22.200×21 % = 1.140 + 4.662 = 5.802
    //   gastos      = 800 + 6.000 + 5.802 = 12.602 → neto 187.398
    expect(await valorTarjeta(page, 'Valor de adquisición')).toBe('165.000,00 €');
    expect(await valorTarjeta(page, 'Ganancia patrimonial')).toBe('28.200,00 €');
    expect(await valorTarjeta(page, 'IRPF sobre la ganancia')).toBe('5802,00 €');
    expect(await valorTarjeta(page, 'NETO QUE RECIBES')).toBe('187.398,00 €');

    // Ahora 2.000 € de gestoría del vendedor, que SÍ minoran el valor de transmisión:
    //   transmisión = 200.000 − 8.000 − 800 = 191.200 ; ganancia = 26.200
    //   IRPF = 1.140 + 20.200×21 % = 1.140 + 4.242 = 5.382
    //   gastos = 800 + 6.000 + 2.000 + 5.382 = 14.182 → neto 185.818
    await rellenar(page, 'Gestoría y certificados del vendedor (€)', '2000');
    expect(await valorTarjeta(page, 'Valor de transmisión')).toBe('191.200,00 €');
    expect(await valorTarjeta(page, 'Ganancia patrimonial')).toBe('26.200,00 €');
    expect(await valorTarjeta(page, 'IRPF sobre la ganancia')).toBe('5382,00 €');
    expect(await valorTarjeta(page, 'Total gastos de la venta')).toBe('14.182,00 €');
    expect(await valorTarjeta(page, 'NETO QUE RECIBES')).toBe('185.818,00 €');
  });

  /**
   * ✅ HALLAZGO 331 (medio), reparado — la etiqueta del ITP se redondeaba a 0 decimales y
   * contradecía al importe que tiene al lado, que es justo lo que el comentario del código
   * dice evitar al mostrar el tipo EFECTIVO. Murcia tiene el 7,75 % desde el 25/07/2025
   * (Ley 3/2025, TIPOS_ITP_CCAA_2025): 200.000 × 7,75 % = 15.500 €, pero el título decía
   * «ITP (8%)», que sobre ese precio serían 16.000 €. Igual en Canarias (6,5 % → «ITP (7%)»).
   *
   * El tipo EFECTIVO va con dos decimales fijos en todo el clúster: con escala progresiva
   * el importe no es un porcentaje plano del precio, así que el decimal es información.
   */
  test('CASO 5 (regresión 331) — el tipo de la etiqueta es el que se ha aplicado (Murcia, 7,75 %)', async ({ page }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Segunda mano/ }).first().click();
    await page.locator('#select-ccaa').selectOption('murcia');
    await rellenar(page, 'Precio del local comercial', '200000');

    expect(await valorTarjeta(page, /^ITP/)).toBe('15.500,00 €');
    await expect(page.locator('h3', { hasText: /^ITP/ }).first()).toHaveText('ITP (7,75%)');
  });

  /**
   * ✅ HALLAZGO 333 (bajo), reparado — el panel «info CCAA» imprimía los tipos con el número
   * crudo de JavaScript: «7.75%» y «1.5%», con punto decimal. El CLAUDE.md global §2 obliga
   * a coma decimal, y las ResultCard de dos centímetros más allá sí la usaban («AJD (0,75%)»),
   * así que la misma pantalla mostraba el mismo dato en dos formatos.
   *
   * Ahí el tipo es NOMINAL (lo declara la norma), así que lleva los decimales que tenga y
   * no dos fijos: `formatTipoNominal` de `lib/formatters.ts`, que el 25/08/2026 subió al
   * motor desde `nave-industrial` porque el defecto estaba en las siete apps del clúster.
   */
  test('CASO 6 (regresión 333) — los tipos del panel de la CCAA van en formato español', async ({ page }) => {
    await page.goto(RUTA);
    await page.locator('#select-ccaa').selectOption('murcia');

    const panel = page.locator('text=ITP General').locator('xpath=ancestor::div[1]/ancestor::div[1]');
    await expect(panel).toContainText('7,75%');
    await expect(panel).toContainText('1,5%');
  });

  /**
   * ✅ HALLAZGO 332 (medio), reparado — el único sello de datos era el de la compra
   * («ITP/AJD/IVA 2026», verificado el 17/06/2026), mientras la mitad vendedora calcula con
   * COEFICIENTES_IIVTNU_2025 (verificados el 15/01/2025, y que se actualizan cada año por
   * Ley de Presupuestos). Un sello de 2026 cubriendo datos de 2025 es peor que no tenerlo.
   */
  test('CASO 7 (regresión 332) — cada mitad lleva su propio sello de datos normativos', async ({ page }) => {
    await page.goto(RUTA);

    const sellos = page.locator('[class*="dataReference"]');
    await expect(sellos).toHaveCount(2);
    await expect(sellos.nth(0)).toContainText('quien compra');
    await expect(sellos.nth(1)).toContainText('quien vende');
    // El de la venta tiene que declarar SU fecha, no la de la compra.
    await expect(sellos.nth(1)).toContainText('15/01/2025');
  });

  // ══════════════════════════════════════════════════════════════════════════
  // RE-INSPECCIÓN 02/09/2026 — tres casos nuevos, resueltos a mano ANTES de
  // ejecutar la app, sobre comunidades distintas a las ya cubiertas arriba.
  // El disparador fue la tanda de la nave industrial del mismo día: dos
  // hallazgos «medio» sobre TEXTOS de la rama de IVA, que aquí se comprueban
  // expresamente (CASO 8, apartados 8c y 8d).
  //
  // HALLAZGOS ABIERTOS que esta re-inspección deja documentados y NO repara
  // (el Inspector no repara; van sin aserción para que la suite siga en verde):
  //   · [medio] El texto de ayuda del precio dice «Precio escriturado o valor de
  //     referencia catastral (el mayor de ambos)» también en obra nueva y en la
  //     renuncia. Esa regla es la base mínima del ITP/AJD (art. 10 TRLITPAJD);
  //     la base del IVA es la contraprestación pactada (art. 78 LIVA). Mismo
  //     defecto que el detectado en nave-industrial.
  //   · [medio] En Ceuta y Melilla la etiqueta del AJD es el tipo NOMINAL
  //     («AJD (0,50%)») mientras el importe lleva la bonificación del 50 % del
  //     art. 57 bis.1 TRLITPAJD: 200.000 € → 500,00 €, que es el 0,25 %. La
  //     tarjeta del ITP de esta misma app sí muestra el tipo EFECTIVO, y
  //     nave-industrial ya lo corrigió (hallazgo 447).
  //   · [medio] Los rótulos de los botones («Paga IVA 21% + AJD», «IVA 21% (ISP)
  //     + AJD») y el panel de la comunidad («IVA (comercial) 21%») anuncian IVA
  //     en Canarias, Ceuta y Melilla, donde no rige (TERRITORIOS_SIN_IVA), y la
  //     propia app responde «IGIC/IPSI · No calculado». nave-industrial ya lo
  //     corrigió (hallazgo 490).
  //   · [bajo] Ese 21 % de los rótulos está escrito a mano, pudiendo derivarse de
  //     IVA_INMUEBLES_2025.local, que la app YA importa para calcular.
  //   · [bajo] La FAQ sitúa el AJD general «(0,5%-1,5%)» mientras el panel de la
  //     misma página muestra «AJD 0%» en el País Vasco. `RANGO_AJD`
  //     (data/itp-ccaa.ts) existe desde el 21/08/2026 para derivar ese rango.
  //   · [bajo] En Ceuta y Melilla la descripción del ITP dice «Tipo general — los
  //     locales comerciales no tienen tipos reducidos» sin nombrar la
  //     bonificación del 50 % que sí se ha aplicado.
  // ══════════════════════════════════════════════════════════════════════════

  test('CASO 8 (normal) — Andalucía, local de 300.000 €: ITP 7 %, IVA + AJD en obra nueva y en la renuncia', async ({ page }) => {
    await page.goto(RUTA);
    await page.locator('#select-ccaa').selectOption('andalucia');
    await rellenar(page, 'Precio del local comercial', '300000');
    await rellenar(page, 'Gastos de gestoría del comprador (€)', '500');

    // ── 8a. Segunda mano: exenta de IVA (art. 20.Uno.22º LIVA) → ITP.
    // TIPOS_ITP_CCAA_2025 'Andalucía'.tipo = 7 (data/fiscal/inmuebles.ts), del que
    // ITP_CCAA.andalucia deriva su tipoGeneral. Sin escala progresiva:
    //   300.000 × 7 % = 21.000. Los tipos reducidos del 6 % y el 3,5 % exigen
    //   «Vivienda habitual», que un local no es nunca.
    await page.getByRole('button', { name: /Segunda mano/ }).first().click();
    await expect(page.locator('h3', { hasText: /^ITP/ }).first()).toHaveText('ITP (7,00%)');
    expect(await valorTarjeta(page, /^ITP/)).toBe('21.000,00 €');
    await expect(page.locator('h3', { hasText: /^AJD/ })).toHaveCount(0);
    await expect(page.locator('h3', { hasText: /^IVA/ })).toHaveCount(0);

    // Notaría, ARANCELES_NOTARIO (RD 1426/1989) sobre 300.000 €:
    //   90,15 + 24.040,49×0,45 % + 30.050,60×0,15 % + 90.151,82×0,10 % + 149.746,97×0,05 %
    //   = 408,43341 ; × 1,21 de IVA = 494,20443 ; × 1,75 (punto medio de FACTURA_NOTARIAL,
    //   horquilla 1,5–2) = 864,85775. Horquilla: 741,30664 y 988,40885.
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('864,86 €');
    expect(await descripcionTarjeta(page, 'Gastos de notaría')).toContain('741,31 €');
    expect(await descripcionTarjeta(page, 'Gastos de notaría')).toContain('988,41 €');
    // Registro, ARANCELES_REGISTRO (RD 1427/1989):
    //   24,04 + 24.040,49×0,175 % + 30.050,60×0,125 % + 90.151,82×0,075 % + 149.746,97×0,030 %
    //   = 216,21206 ; + 6,010121 de presentación + 3,005061 de nota simple ; × 1,21 = 272,52497
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('272,52 €');
    // Total = 21.000 + 864,85775 + 272,52497 + 500 = 22.637,38271 → 7,5458 % de 300.000
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('22.637,38 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toContain('7,55%');
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('322.637,38 €');

    // ── 8b. Obra nueva del promotor: IVA_INMUEBLES_2025.local = 21 (Ley 37/1992):
    //   300.000 × 21 % = 63.000. AJD de ITP_CCAA.andalucia = 1,2 % → 3.600.
    await page.getByRole('button', { name: /Obra nueva/ }).click();
    await expect(page.locator('h3', { hasText: /^IVA/ }).first()).toHaveText('IVA (21,00%)');
    expect(await valorTarjeta(page, /^IVA/)).toBe('63.000,00 €');
    await expect(page.locator('h3', { hasText: /^AJD/ }).first()).toHaveText('AJD (1,20%)');
    expect(await valorTarjeta(page, /^AJD/)).toBe('3600,00 €');
    await expect(page.locator('h3', { hasText: /^ITP/ })).toHaveCount(0);
    // Total = 63.000 + 3.600 + 864,85775 + 272,52497 + 500 = 68.237,38271 → 22,7458 %
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('68.237,38 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toContain('22,75%');
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('368.237,38 €');

    // ── 8c. Renuncia a la exención (art. 20.Dos LIVA): mismos importes que la obra
    // nueva, porque el tipo es el mismo, pero con inversión del sujeto pasivo.
    await page.getByRole('button', { name: /renuncia IVA/ }).click();
    await expect(page.locator('h3', { hasText: /^IVA/ }).first()).toHaveText('IVA (renuncia · ISP) (21,00%)');
    expect(await valorTarjeta(page, /^IVA/)).toBe('63.000,00 €');
    expect(await valorTarjeta(page, /^AJD/)).toBe('3600,00 €');
    expect(await descripcionTarjeta(page, /^AJD/)).toContain('incrementado');
    await expect(page.locator('h3', { hasText: /^ITP/ })).toHaveCount(0);

    // ── 8d. Comprobación EXPRESA del hallazgo de la app hermana nave-industrial:
    // allí la descripción de la tarjeta del IVA con renuncia caía al texto del ITP
    // («Tipo general — no tienen tipos reducidos») porque la condición comparaba
    // `tipoImpuesto === 'IVA'` y con renuncia el título es «IVA (renuncia · ISP)».
    // Aquí la rama es `esRenuncia`, así que el texto es el del IVA. NO reproducido.
    const descIva = await descripcionTarjeta(page, /^IVA/);
    expect(descIva).toContain('inversión del sujeto pasivo');
    expect(descIva).not.toContain('tipos reducidos');
  });

  test('CASO 9 (límite) — Baleares 2.500.000 € entra en el tramo del 13 %, y en Canarias la renuncia no devenga IVA', async ({ page }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Segunda mano/ }).first().click();
    await page.locator('#select-ccaa').selectOption('baleares');
    await rellenar(page, 'Precio del local comercial', '2500000');
    await rellenar(page, 'Gastos de gestoría del comprador (€)', '500');

    // ITP_CCAA.baleares.tramosProgresivos = 8 % hasta 400.000 · 9 % hasta 600.000 ·
    // 10 % hasta 1.000.000 · 12 % hasta 2.000.000 · 13 % el resto. Con 2.500.000 € se
    // recorren los CINCO tramos, incluido el más alto de toda la tabla:
    //   400.000×8 % + 200.000×9 % + 400.000×10 % + 1.000.000×12 % + 500.000×13 %
    //   = 32.000 + 18.000 + 40.000 + 120.000 + 65.000 = 275.000
    // Tipo efectivo = 275.000 / 2.500.000 = 11,00 % (no es ninguno de los nominales).
    expect(await valorTarjeta(page, /^ITP/)).toBe('275.000,00 €');
    await expect(page.locator('h3', { hasText: /^ITP/ }).first()).toHaveText('ITP (11,00%)');

    // Notaría sobre 2.500.000 €: 90,15 + 108,18221 + 45,0759 + 90,15182 + 450.759,07×0,05 %
    //   + 1.898.987,90×0,03 % = 1.128,63583 ; × 1,21 = 1.365,64935 ; × 1,75 = 2.389,88637
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('2389,89 €');
    // Registro: 24,04 + 42,07086 + 37,56325 + 67,61387 + 135,22772 + 379,79758 = 686,31327
    //   (por debajo del tope REGISTRO_MAXIMO de 2.181,67) ; + 9,015182 ; × 1,21 = 841,34743
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('841,35 €');
    // Total = 275.000 + 2.389,89 + 841,35 + 500 = 278.731,24 → 11,1492 %
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('278.731,24 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toContain('11,15%');
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('2.778.731,24 €');

    // ── Canarias con RENUNCIA: allí no se devenga IVA sino IGIC (TERRITORIOS_SIN_IVA),
    // así que el impuesto principal no se calcula —no se inventa un 21 %— pero la cuota
    // gradual de AJD sí se devenga: ITP_CCAA.canarias.ajd = 0,75 % → 300.000 × 0,75 % = 2.250.
    await page.locator('#select-ccaa').selectOption('canarias');
    await rellenar(page, 'Precio del local comercial', '300000');
    await page.getByRole('button', { name: /renuncia IVA/ }).click();
    await expect(page.locator('h3', { hasText: 'IGIC' }).first()).toHaveText('IGIC');
    expect(await valorTarjeta(page, 'IGIC')).toBe('No calculado');
    // El texto nombra la operación ELEGIDA (la renuncia), no siempre la obra nueva.
    expect(await descripcionTarjeta(page, 'IGIC')).toContain('la renuncia a la exención');
    expect(await valorTarjeta(page, /^AJD/)).toBe('2250,00 €');
    await expect(page.getByText(/no se aplica el IVA/)).toBeVisible();
    // Total PARCIAL = 2.250 + 864,85775 + 272,52497 + 500 = 3.887,38271 → 1,2958 %
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('3887,38 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toContain('SIN el IGIC');
    expect(await valorTarjeta(page, 'COSTE TOTAL')).toBe('303.887,38 €');
  });

  test('CASO 10 (rechazo) — precio negativo, cero y texto, y una gestoría negativa que no puede abaratar la compra', async ({ page }) => {
    await page.goto(RUTA);

    // Sin precio no hay cifras: ni totales ni el «No definido» que devuelve
    // formatCurrency cuando le llega el NaN de un campo vacío.
    await expect(page.getByText('Introduce el precio del local comercial')).toBeVisible();
    await expect(page.getByText('No definido')).toHaveCount(0);

    const campo = page.locator('input[aria-label="Precio del local comercial"]');

    // Negativo: mientras el campo tiene el foco tampoco puede haber resultados
    // (la guarda es `precio <= 0`, no solo el min del NumberInput).
    await campo.fill('-50000');
    await expect(page.getByText('Introduce el precio del local comercial')).toBeVisible();
    await expect(page.locator('h3', { hasText: 'COSTE TOTAL' })).toHaveCount(0);
    await campo.blur();
    await expect(campo).toHaveValue('0');   // min = 0 del NumberInput

    // Cero: mismo tratamiento, sin tarjetas a 0,00 €.
    await expect(page.getByText('Introduce el precio del local comercial')).toBeVisible();
    await expect(page.locator('h3', { hasText: 'COSTE TOTAL' })).toHaveCount(0);

    // Texto: el input no admite los caracteres (regex /^-?[\d.,]*$/ de NumberInput).
    await campo.fill('');
    await campo.type('abc');
    await expect(campo).toHaveValue('');
    await expect(page.getByText('No definido')).toHaveCount(0);

    // Gestoría negativa con precio válido: se acota con Math.max(0, …), así que NO
    // resta del total ni pinta tarjeta. Andalucía 300.000 € sin gestoría:
    //   21.000 + 864,85775 + 272,52497 = 22.137,38271
    await page.locator('#select-ccaa').selectOption('andalucia');
    await rellenar(page, 'Precio del local comercial', '300000');
    await page.getByRole('button', { name: /Segunda mano/ }).first().click();
    const gestoria = page.locator('input[aria-label="Gastos de gestoría del comprador (€)"]');
    await gestoria.fill('-1000');
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('22.137,38 €');
    await expect(page.locator('h3', { hasText: 'Gastos de gestoría' })).toHaveCount(0);
    await gestoria.blur();
    await expect(gestoria).toHaveValue('0');
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('22.137,38 €');
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// REGRESIÓN — los seis hallazgos de la re-inspección del 02/09/2026 (618-623),
// REPARADOS ese mismo día. Los cinco primeros ya los había reparado la app hermana
// nave-industrial (hallazgos 447, 490 y 601): aquí se comprueba que el clúster ya no
// divergirá otra vez.
// ═════════════════════════════════════════════════════════════════════════════

test.describe('Regresión — hallazgos del 02/09/2026, reparados', () => {
  // 618 — la base del IVA es la contraprestación pactada (art. 78 LIVA), no el valor de
  // referencia catastral, que es la base MÍNIMA del ITP/AJD (art. 10 TRLITPAJD).
  test('618 — el texto de ayuda del precio cambia en la rama de IVA', async ({ page }) => {
    await page.goto(RUTA);
    const ayuda = page
      .locator('input[aria-label="Precio del local comercial"]')
      .locator('xpath=following-sibling::p[1]');

    await page.getByRole('button', { name: /Segunda mano/ }).first().click();
    expect((await ayuda.innerText()).replace(/\s+/g, ' ')).toContain('valor de referencia catastral');

    await page.getByRole('button', { name: /Obra nueva/ }).click();
    const enIva = (await ayuda.innerText()).replace(/\s+/g, ' ');
    expect(enIva).not.toContain('valor de referencia catastral');
    expect(enIva).toContain('Contraprestación pactada');

    await page.getByRole('button', { name: /renuncia IVA/ }).click();
    expect((await ayuda.innerText()).replace(/\s+/g, ' ')).toContain('Contraprestación pactada');
  });

  // 619 y 623 — Ceuta: el importe ya lleva la bonificación del 50 % de la cuota (art. 57 bis
  // TRLITPAJD), así que la etiqueta tiene que ser el tipo EFECTIVO, no el nominal de la tabla.
  //   ITP_CCAA.ceuta.ajd nominal = 0,5 % → 200.000 × 0,5 % = 1.000 ; bonificado = 500 €,
  //   que es el 0,25 % del precio.
  test('619 y 623 — en Ceuta el AJD imprime el tipo efectivo y el ITP nombra la bonificación', async ({ page }) => {
    await page.goto(RUTA);
    await page.locator('#select-ccaa').selectOption('ceuta');
    await rellenar(page, 'Precio del local comercial', '200000');

    await page.getByRole('button', { name: /Obra nueva/ }).click();
    await expect(page.locator('h3', { hasText: /^AJD/ }).first()).toHaveText('AJD (0,25%)');
    expect(await valorTarjeta(page, /^AJD/)).toBe('500,00 €');
    expect(await descripcionTarjeta(page, /^AJD/)).toContain('bonificación del 50 %');

    // ITP de Ceuta: tipoGeneral 6 % con la bonificación del 50 % → 3 % efectivo = 6.000 €
    await page.getByRole('button', { name: /Segunda mano/ }).first().click();
    expect(await valorTarjeta(page, /^ITP/)).toBe('6000,00 €');
    expect(await descripcionTarjeta(page, /^ITP/)).toContain('bonificación del 50 %');
  });

  // 620 y 621 — en Canarias, Ceuta y Melilla no rige el IVA (IGIC/IPSI): el rótulo no puede
  // prometerlo, y el tipo sale de IVA_INMUEBLES_2025.local en vez de estar tecleado.
  test('620 y 621 — los rótulos nombran IGIC donde no rige el IVA, y el 21 % se deriva', async ({ page }) => {
    await page.goto(RUTA);
    await page.locator('#select-ccaa').selectOption('madrid');
    await expect(page.getByRole('button', { name: /Obra nueva/ })).toContainText('IVA 21%');

    await page.locator('#select-ccaa').selectOption('canarias');
    const obraNueva = page.getByRole('button', { name: /Obra nueva/ });
    await expect(obraNueva).not.toContainText('IVA');
    await expect(obraNueva).toContainText('IGIC');
    await expect(page.getByRole('button', { name: /renuncia IVA/ })).toContainText('IGIC');

    // El literal ya no está en el JSX: el rótulo se construye con la constante.
    const fuente = await import('node:fs/promises').then((fs) =>
      fs.readFile('app/simulador-gastos-compraventa-local-comercial/page.tsx', 'utf8'),
    );
    expect(fuente).toContain('IVA_LOCAL_COMERCIAL');
    expect(fuente).not.toContain('Paga IVA 21% + AJD');
  });

  // 622 — el rango de AJD de la FAQ se deriva de RANGO_AJD, que hoy arranca en 0 % (País Vasco).
  test('622 — la FAQ del AJD ya no contradice al panel del País Vasco', async ({ page }) => {
    await page.goto(RUTA);
    // El contenido de EducationalSection se monta siempre en el DOM (por SEO), así que
    // no hace falta abrirlo para leerlo.
    const faq = page.getByText(/¿Cuánto AJD se paga si hay renuncia/).locator('xpath=..');
    const texto = (await faq.innerText()).replace(/\s+/g, ' ');
    expect(texto).not.toContain('(0,5%-1,5%)');
    // RANGO_AJD se deriva de la tabla: min 0 % (País Vasco, régimen foral), max 1,5 %.
    expect(texto).toContain('del 0% al 1,5%');
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// INSPECCIÓN 07/09/2026 — re-inspección. Tres casos NUEVOS resueltos a mano
// ANTES de abrir el navegador, sobre la superficie que las dos rondas anteriores
// no habían pisado:
//
//   · el perfil «Local afecto a actividad» (art. 40 RIRPF) NUNCA se había
//     ejercitado: la única prueba del vendedor (CASO 4) usa el perfil particular;
//   · el País Vasco, la única comunidad con AJD 0 % (RANGO_AJD.min) y con el tipo
//     general de ITP más bajo de la tabla (RANGO_ITP.min = 4 %);
//   · el tope de 20 años de los coeficientes del IIVTNU y la rama en la que gana
//     el MÉTODO REAL de la plusvalía;
//   · el tramo del 30 % de la base del ahorro, el más alto de
//     TRAMOS_GANANCIAS_PATRIMONIALES_2025.
//
// Confirmado además que el hallazgo 330 (ALTO) sigue cerrado: el CASO 4 pasa, y
// el CASO 11 vuelve a comprobar que el panel del vendedor se recalcula solo al
// tocar sus PROPIOS campos, sin pasar por la gestoría del comprador.
//
// HALLAZGOS de esta ronda, los cuatro REPARADOS: el ALTO de las amortizaciones
// vacías el 08/09/2026, y los tres restantes el 09/09/2026. Los tests que
// llevaban `test.fail()` ya no lo llevan: pasan en verde y se quedan como
// REGRESIÓN, que es como se sabe que cerraron.
//
//   · 665 (medio) — el FAQPage contradecía a RANGO_ITP en la pregunta del ITP.
//   · 666 (medio) — «0 años de propiedad» se confundía con el campo vacío, así
//     que la plusvalía del primer año no se calculaba y su 0 se sumaba al neto.
//   · 667 (bajo)  — el rango de la base del ahorro estaba escrito a mano en tres
//     rótulos y en el FAQPage, pudiendo derivarse de la tabla que la app usa.
// ═════════════════════════════════════════════════════════════════════════════

test.describe('Inspección 07/09/2026 — casos nuevos', () => {
  test('CASO 11 (normal) — vendedor con local AFECTO a actividad: las amortizaciones minoran el valor de adquisición (art. 40 RIRPF)', async ({ page }) => {
    await page.goto(RUTA);
    await rellenar(page, 'Precio del local comercial', '400000');
    await page.getByRole('button', { name: /Vendedor/ }).click();
    await page.getByRole('button', { name: /Local afecto a actividad/ }).click();
    await rellenar(page, 'Precio de compra original', '250000');
    await rellenar(page, 'Impuestos y gastos que pagaste al comprarlo (€)', '30000');
    await rellenar(page, 'Amortizaciones acumuladas deducidas (€)', '60000');
    await rellenar(page, 'Años de propiedad', '12');
    await rellenar(page, 'Valor catastral del suelo (€)', '80000');
    await rellenar(page, 'Valor catastral total (suelo + construcción) (€)', '200000');
    await rellenar(page, 'Comisión de la inmobiliaria (%)', '4');
    await rellenar(page, 'Gestoría y certificados del vendedor (€)', '1500');

    // ── Plusvalía municipal, por los dos métodos del RDL 26/2021:
    //   objetivo = 80.000 × 0,08 (COEFICIENTES_IIVTNU_2025, 12 años) × 25 %
    //              (PLUSVALIA_MUNICIPAL_META.tipoOrientativo) = 1.600
    //   real     = (400.000 − 250.000) × 80.000/200.000 × 25 % = 15.000
    //   → gana el objetivo, 1.600 €
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('1600,00 €');
    expect(await descripcionTarjeta(page, 'Plusvalía municipal')).toContain('Método objetivo');

    // ── Ganancia con el local AFECTO (calcularGananciaInmueble, arts. 34-36 LIRPF):
    //   adquisición = 250.000 + 30.000 − 60.000 de amortizaciones = 220.000
    //   transmisión = 400.000 − (16.000 de comisión + 1.500 de gestoría) − 1.600 = 380.900
    //   ganancia    = 380.900 − 220.000 = 160.900
    //   IRPF        = 6.000×19 % + 44.000×21 % + 110.900×23 %
    //               = 1.140 + 9.240 + 25.507 = 35.887
    //   gastos      = 1.600 + 16.000 + 1.500 + 35.887 = 54.987 → 13,7468 % de 400.000
    //   neto        = 400.000 − 54.987 = 345.013
    expect(await valorTarjeta(page, 'Valor de adquisición')).toBe('220.000,00 €');
    expect(await descripcionTarjeta(page, 'Valor de adquisición')).toContain('60.000,00 € de amortizaciones deducidas');
    expect(await valorTarjeta(page, 'Valor de transmisión')).toBe('380.900,00 €');
    expect(await valorTarjeta(page, 'Ganancia patrimonial')).toBe('160.900,00 €');
    expect(await valorTarjeta(page, 'IRPF sobre la ganancia')).toBe('35.887,00 €');
    expect(await valorTarjeta(page, 'Comisión de la inmobiliaria')).toBe('16.000,00 €');
    expect(await valorTarjeta(page, 'Total gastos de la venta')).toBe('54.987,00 €');
    expect(await descripcionTarjeta(page, 'Total gastos de la venta')).toContain('13,75%');
    expect(await valorTarjeta(page, 'NETO QUE RECIBES')).toBe('345.013,00 €');

    // ── Volver a «Local no afecto»: las amortizaciones dejan de restarse, el campo
    // desaparece y el impuesto baja. Es la diferencia que justifica que el perfil exista:
    //   adquisición = 280.000 ; ganancia = 100.900
    //   IRPF        = 1.140 + 9.240 + 50.900×23 % = 1.140 + 9.240 + 11.707 = 22.087
    //   gastos      = 1.600 + 16.000 + 1.500 + 22.087 = 41.187 → neto 358.813
    await page.getByRole('button', { name: /Local no afecto/ }).click();
    await expect(page.locator('input[aria-label="Amortizaciones acumuladas deducidas (€)"]')).toHaveCount(0);
    expect(await valorTarjeta(page, 'Valor de adquisición')).toBe('280.000,00 €');
    expect(await valorTarjeta(page, 'Ganancia patrimonial')).toBe('100.900,00 €');
    expect(await valorTarjeta(page, 'IRPF sobre la ganancia')).toBe('22.087,00 €');
    expect(await valorTarjeta(page, 'NETO QUE RECIBES')).toBe('358.813,00 €');
  });

  test('CASO 12 (límite) — País Vasco: AJD 0 % e ITP 4 %, los dos extremos bajos de la tabla; y en el vendedor, el tope de 20 años y el tramo del 30 %', async ({ page }) => {
    await page.goto(RUTA);
    await page.locator('#select-ccaa').selectOption('pais-vasco');
    await rellenar(page, 'Precio del local comercial', '500000');
    await rellenar(page, 'Gastos de gestoría del comprador (€)', '500');

    // Notaría sobre 500.000 € (ARANCELES_NOTARIO, RD 1426/1989):
    //   90,15 + 24.040,49×0,45 % + 30.050,60×0,15 % + 90.151,82×0,10 % + 349.746,97×0,05 %
    //   = 508,43341 ; × 1,21 de IVA = 615,2044261 ; × 1,75 (punto medio de FACTURA_NOTARIAL,
    //   horquilla 1,5–2) = 1.076,60775. Horquilla: 922,80664 y 1.230,40885.
    // Registro (ARANCELES_REGISTRO, RD 1427/1989):
    //   24,04 + 42,0708575 + 37,56325 + 67,613865 + 349.746,97×0,030 % (=104,924091)
    //   = 276,2120635 ; + 6,010121 + 3,005061 ; × 1,21 = 345,124967
    const NOTARIA_500K = '1076,61 €';
    const REGISTRO_500K = '345,12 €';

    // ── 12a. Obra nueva: IVA_INMUEBLES_2025.local = 21 % → 105.000. Y el País Vasco es
    // la ÚNICA comunidad con `ajd: 0` (régimen foral), que es RANGO_AJD.min: la tarjeta
    // de AJD no debe pintarse a 0,00 € sino no pintarse (guarda `ajd > 0`).
    await page.getByRole('button', { name: /Obra nueva/ }).click();
    await expect(page.locator('h3', { hasText: /^IVA/ }).first()).toHaveText('IVA (21,00%)');
    expect(await valorTarjeta(page, /^IVA/)).toBe('105.000,00 €');
    await expect(page.locator('h3', { hasText: /^AJD/ })).toHaveCount(0);
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe(NOTARIA_500K);
    expect(await descripcionTarjeta(page, 'Gastos de notaría')).toContain('922,81 €');
    expect(await descripcionTarjeta(page, 'Gastos de notaría')).toContain('1230,41 €');
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe(REGISTRO_500K);
    // Total = 105.000 + 0 + 1.076,61 + 345,12 + 500 = 106.921,73 → 21,3843 %
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('106.921,73 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toContain('21,38%');
    expect(await valorTarjeta(page, 'COSTE TOTAL')).toBe('606.921,73 €');

    // ── 12b. Segunda mano: tipo general del País Vasco = 4 %, el más bajo de
    // TIPOS_ITP_CCAA_2025 (RANGO_ITP.min). Un local no puede acogerse a su reducido del
    // 2,5 %, que exige vivienda habitual. 500.000 × 4 % = 20.000. Sigue sin AJD.
    await page.getByRole('button', { name: /Segunda mano/ }).first().click();
    await expect(page.locator('h3', { hasText: /^ITP/ }).first()).toHaveText('ITP (4,00%)');
    expect(await valorTarjeta(page, /^ITP/)).toBe('20.000,00 €');
    await expect(page.locator('h3', { hasText: /^AJD/ })).toHaveCount(0);
    // Total = 20.000 + 1.076,61 + 345,12 + 500 = 21.921,73 → 4,3843 %
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('21.921,73 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toContain('4,38%');
    expect(await valorTarjeta(page, 'COSTE TOTAL')).toBe('521.921,73 €');

    // ── 12c. Vendedor con 25 años de propiedad: COEFICIENTES_IIVTNU_2025 se topa en 20
    // (`Math.min(anios, 20)` de calcularPlusvaliaMunicipal) → coeficiente 0,45, el mayor
    // de la tabla. Y aquí gana el método REAL, la rama que ninguna prueba había recorrido:
    //   objetivo = 300.000 × 0,45 × 25 % = 33.750
    //   real     = (500.000 − 450.000) × 300.000/400.000 × 25 % = 50.000 × 0,75 × 0,25 = 9.375
    //   → gana el real, 9.375 €
    //   adquisición = 450.000 ; transmisión = 500.000 − 0 − 9.375 = 490.625
    //   ganancia    = 40.625 → IRPF = 6.000×19 % + 34.625×21 % = 1.140 + 7.271,25 = 8.411,25
    //   gastos      = 9.375 + 8.411,25 = 17.786,25 → 3,5573 % ; neto = 482.213,75
    await page.getByRole('button', { name: /Vendedor/ }).click();
    await rellenar(page, 'Precio de compra original', '450000');
    await rellenar(page, 'Impuestos y gastos que pagaste al comprarlo (€)', '0');
    await rellenar(page, 'Años de propiedad', '25');
    await rellenar(page, 'Valor catastral del suelo (€)', '300000');
    await rellenar(page, 'Valor catastral total (suelo + construcción) (€)', '400000');
    await rellenar(page, 'Comisión de la inmobiliaria (%)', '0');
    await rellenar(page, 'Gestoría y certificados del vendedor (€)', '0');

    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('9375,00 €');
    expect(await descripcionTarjeta(page, 'Plusvalía municipal')).toContain('Método real');
    expect(await valorTarjeta(page, 'Valor de adquisición')).toBe('450.000,00 €');
    expect(await valorTarjeta(page, 'Valor de transmisión')).toBe('490.625,00 €');
    expect(await valorTarjeta(page, 'Ganancia patrimonial')).toBe('40.625,00 €');
    expect(await valorTarjeta(page, 'IRPF sobre la ganancia')).toBe('8411,25 €');
    expect(await valorTarjeta(page, 'Total gastos de la venta')).toBe('17.786,25 €');
    expect(await descripcionTarjeta(page, 'Total gastos de la venta')).toContain('3,56%');
    expect(await valorTarjeta(page, 'NETO QUE RECIBES')).toBe('482.213,75 €');

    // ── 12d. Subiendo la venta a 1.500.000 € la ganancia entra en el ÚLTIMO tramo de
    // TRAMOS_GANANCIAS_PATRIMONIALES_2025, el 30 %, que ninguna prueba había alcanzado:
    //   real = (1.500.000 − 450.000) × 0,75 × 25 % = 196.875 → ahora gana el objetivo, 33.750
    //   transmisión = 1.500.000 − 33.750 = 1.466.250 ; ganancia = 1.016.250
    //   IRPF = 1.140 + 9.240 + 150.000×23 % + 100.000×27 % + 716.250×30 %
    //        = 1.140 + 9.240 + 34.500 + 27.000 + 214.875 = 286.755
    //   gastos = 33.750 + 286.755 = 320.505 → 21,367 % ; neto = 1.179.495
    await rellenar(page, 'Precio del local comercial', '1500000');
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('33.750,00 €');
    expect(await descripcionTarjeta(page, 'Plusvalía municipal')).toContain('Método objetivo');
    expect(await valorTarjeta(page, 'Valor de transmisión')).toBe('1.466.250,00 €');
    expect(await valorTarjeta(page, 'Ganancia patrimonial')).toBe('1.016.250,00 €');
    expect(await valorTarjeta(page, 'IRPF sobre la ganancia')).toBe('286.755,00 €');
    expect(await valorTarjeta(page, 'Total gastos de la venta')).toBe('320.505,00 €');
    expect(await descripcionTarjeta(page, 'Total gastos de la venta')).toContain('21,37%');
    expect(await valorTarjeta(page, 'NETO QUE RECIBES')).toBe('1.179.495,00 €');
  });

  test('CASO 13 (rechazo) — el campo de amortizaciones no admite texto y acota el negativo', async ({ page }) => {
    await page.goto(RUTA);
    await rellenar(page, 'Precio del local comercial', '400000');
    await page.getByRole('button', { name: /Vendedor/ }).click();
    await rellenar(page, 'Precio de compra original', '250000');
    await rellenar(page, 'Impuestos y gastos que pagaste al comprarlo (€)', '30000');
    await rellenar(page, 'Años de propiedad', '12');
    await rellenar(page, 'Valor catastral del suelo (€)', '80000');
    await rellenar(page, 'Valor catastral total (suelo + construcción) (€)', '200000');
    await rellenar(page, 'Comisión de la inmobiliaria (%)', '4');
    await rellenar(page, 'Gestoría y certificados del vendedor (€)', '1500');

    // Referencia con el perfil particular (0 amortizaciones), calculada en el CASO 11.
    expect(await valorTarjeta(page, 'IRPF sobre la ganancia')).toBe('22.087,00 €');
    expect(await valorTarjeta(page, 'NETO QUE RECIBES')).toBe('358.813,00 €');

    await page.getByRole('button', { name: /Local afecto a actividad/ }).click();
    const amortizaciones = page.locator('input[aria-label="Amortizaciones acumuladas deducidas (€)"]');

    // Texto: el NumberInput no lo admite (regex /^-?[\d.,]*$/), así que el campo queda vacío.
    await amortizaciones.fill('');
    await amortizaciones.type('abc');
    await expect(amortizaciones).toHaveValue('');

    // Negativo: `Math.max(0, …)` de la app lo acota a 0 amortizaciones, así que el impuesto
    // vuelve al del perfil particular; y el blur del NumberInput (min=0) deja el campo en «0».
    await amortizaciones.fill('-5000');
    expect(await valorTarjeta(page, 'Valor de adquisición')).toBe('280.000,00 €');
    expect(await valorTarjeta(page, 'IRPF sobre la ganancia')).toBe('22.087,00 €');
    expect(await valorTarjeta(page, 'NETO QUE RECIBES')).toBe('358.813,00 €');
    await amortizaciones.blur();
    await expect(amortizaciones).toHaveValue('0');
    expect(await valorTarjeta(page, 'NETO QUE RECIBES')).toBe('358.813,00 €');
  });

  /**
   * ✅ HALLAZGO 07/09/2026 (ALTO) — REPARADO el 08/09/2026. Sujeta la reparación como
   * regresión: llevaba `test.fail()` y hoy pasa en verde.
   *
   * El perfil «Local afecto a actividad» nacía con su campo de amortizaciones VACÍO
   * (`useState('')`), y ese estado por defecto rompía el panel entero del vendedor:
   *
   *   const amortizaciones = perfil === 'afecto-actividad'
   *     ? Math.max(0, parseSpanishNumber(amortizacionesAcumuladas))   // ← NaN si está vacío
   *     : 0;
   *
   * `parseSpanishNumber('')` devuelve NaN y `Math.max(0, NaN)` sigue siendo NaN, así que
   * el NaN llegaba a `calcularGananciaInmueble` y se propagaba a la cuota. En pantalla:
   * desaparecían las tarjetas de valor de adquisición y de transmisión, la ganancia y el
   * total y el neto decían «No definido» y —lo grave— el IRPF pintaba **«SIN CUOTA» en
   * verde** (`variant="success"`), porque `NaN > 0` es `false`. Una app de riesgo 1
   * CRÍTICO afirmaba que no se debía IRPF sobre una ganancia de 100.900 €.
   *
   * Los otros cinco campos opcionales del mismo `useMemo` ya usaban `parseSpanishNumberOr`,
   * que existe justamente para esto: su docstring nombra la pestaña Vendedor de
   * `estimador-compraventa-inmueble`, del mismo clúster y con el mismo defecto (14/08/2026).
   * La reparación es esa misma palabra, y el `Math.max(0, …)` se conserva porque sigue
   * acotando lo que el usuario SÍ teclea en negativo.
   */
  test('HALLAZGO 07/09 (alto), reparado — el perfil «afecto» con las amortizaciones sin rellenar vale 0, no NaN', async ({ page }) => {
    await page.goto(RUTA);
    await rellenar(page, 'Precio del local comercial', '400000');
    await page.getByRole('button', { name: /Vendedor/ }).click();
    await rellenar(page, 'Precio de compra original', '250000');
    await rellenar(page, 'Impuestos y gastos que pagaste al comprarlo (€)', '30000');
    await rellenar(page, 'Años de propiedad', '12');
    await rellenar(page, 'Valor catastral del suelo (€)', '80000');
    await rellenar(page, 'Valor catastral total (suelo + construcción) (€)', '200000');
    await rellenar(page, 'Comisión de la inmobiliaria (%)', '4');
    await rellenar(page, 'Gestoría y certificados del vendedor (€)', '1500');

    await page.getByRole('button', { name: /Local afecto a actividad/ }).click();
    await expect(page.locator('input[aria-label="Amortizaciones acumuladas deducidas (€)"]')).toHaveValue('');

    // Sin amortizaciones declaradas no hay nada que minorar: mismos importes que el
    // perfil particular (CASO 11), no «No definido» ni un «SIN CUOTA» en verde.
    //
    // El orden de las aserciones es el que tenía cuando el test iba con `test.fail()`:
    // las dos primeras tarjetas se pintaban aun con el NaN, así que fallaban al instante,
    // mientras que esperar las de valor de adquisición y transmisión —que desaparecían
    // por completo— habría agotado el timeout, y eso Playwright lo cuenta como fallo REAL
    // aunque haya `test.fail()`. Se conserva para no reescribir lo que ya está verificado.
    expect(await valorTarjeta(page, 'IRPF sobre la ganancia')).toBe('22.087,00 €');
    expect(await valorTarjeta(page, 'NETO QUE RECIBES')).toBe('358.813,00 €');
    expect(await valorTarjeta(page, 'Total gastos de la venta')).toBe('41.187,00 €');
    expect(await valorTarjeta(page, 'Ganancia patrimonial')).toBe('100.900,00 €');
    await expect(page.locator('h3', { hasText: 'Valor de adquisición' })).toHaveCount(1);
    await expect(page.locator('h3', { hasText: 'Valor de transmisión' })).toHaveCount(1);
  });

  /**
   * ✅ HALLAZGO 666 (MEDIO) — REPARADO el 09/09/2026. Sujeta la reparación como regresión:
   * llevaba `test.fail()` y hoy pasa en verde.
   *
   * Con «Años de propiedad» = 0 —un local revendido antes de cumplir el año, que es
   * cuando la plusvalía municipal más pesa: el coeficiente de COEFICIENTES_IIVTNU_2025
   * para «Menos de 1 año» es 0,14, el tercero más alto de la tabla— la app no calculaba el
   * impuesto y lo trataba como CERO en todo lo demás: el valor de transmisión no se
   * minoraba, la ganancia subía y el «NETO QUE RECIBES» se presentaba como cifra firme
   * (360.045,00 €) cuando le faltaban 2.800 € de IIVTNU.
   *
   * La causa era `parseInt(aniosPropiedad) || 0`, que daba el mismo 0 para el campo VACÍO
   * y para el 0 tecleado, de modo que la guarda `anios > 0` desactivaba los dos. Ahora la
   * ausencia se lee del STRING (`aniosPropiedad.trim() === ''`) y el 0 explícito sí
   * calcula. El motor acompañó: `calcularPlusvaliaMunicipal` hacía `Math.max(anios, 1)`,
   * que dejaba el coeficiente 0,14 inalcanzable desde cualquier app del catálogo.
   *
   * Y la explicación que acompañaba al 0,00 € enumeraba los tres datos posibles —«valor
   * catastral del suelo, años y precio de compra»— aunque dos de los tres estuvieran
   * puestos; ahora se compone con los que de verdad faltan y concuerda el verbo.
   */
  test('CASO 14 (regresión 666) — 0 años de propiedad es un dato, no un campo vacío: la plusvalía del primer año se liquida', async ({ page }) => {
    await page.goto(RUTA);
    await rellenar(page, 'Precio del local comercial', '400000');
    await page.getByRole('button', { name: /Vendedor/ }).click();
    await rellenar(page, 'Precio de compra original', '250000');
    await rellenar(page, 'Impuestos y gastos que pagaste al comprarlo (€)', '30000');
    await rellenar(page, 'Valor catastral del suelo (€)', '80000');
    await rellenar(page, 'Valor catastral total (suelo + construcción) (€)', '200000');
    await rellenar(page, 'Comisión de la inmobiliaria (%)', '4');
    await rellenar(page, 'Gestoría y certificados del vendedor (€)', '1500');
    await rellenar(page, 'Años de propiedad', '0');

    // ── Plusvalía municipal, por los dos métodos del RDL 26/2021, con el coeficiente de la
    // fila `anios: 0` de COEFICIENTES_IIVTNU_2025 («Menos de 1 año», 0,14):
    //   objetivo = 80.000 × 0,14 × 25 % (PLUSVALIA_MUNICIPAL_META.tipoOrientativo) = 2.800
    //   real     = (400.000 − 250.000) × 80.000/200.000 × 25 % = 15.000
    //   → gana el objetivo, 2.800 €
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('2800,00 €');
    expect(await descripcionTarjeta(page, 'Plusvalía municipal')).toContain('Método objetivo');

    // ── Y ese impuesto SÍ minora el valor de transmisión (art. 35.2 LIRPF):
    //   adquisición = 250.000 + 30.000 = 280.000
    //   comisión    = 400.000 × 4 % = 16.000
    //   transmisión = 400.000 − 16.000 − 1.500 − 2.800 = 379.700
    //   ganancia    = 379.700 − 280.000 = 99.700
    //   IRPF        = 6.000×19 % + 44.000×21 % + 49.700×23 %
    //               = 1.140 + 9.240 + 11.431 = 21.811
    //   gastos      = 2.800 + 16.000 + 1.500 + 21.811 = 42.111 → neto 357.889
    expect(await valorTarjeta(page, 'Valor de adquisición')).toBe('280.000,00 €');
    expect(await valorTarjeta(page, 'Valor de transmisión')).toBe('379.700,00 €');
    expect(await valorTarjeta(page, 'Ganancia patrimonial')).toBe('99.700,00 €');
    expect(await valorTarjeta(page, 'IRPF sobre la ganancia')).toBe('21.811,00 €');
    expect(await valorTarjeta(page, 'Total gastos de la venta')).toBe('42.111,00 €');
    expect(await valorTarjeta(page, 'NETO QUE RECIBES')).toBe('357.889,00 €');
    // Con los tres datos puestos el neto es firme: el rótulo NO lleva la marca de parcial.
    await expect(page.locator('h3', { hasText: 'NETO QUE RECIBES' })).toHaveText('NETO QUE RECIBES');

    // ── El campo VACÍO sigue sin calcular, y lo dice sin mandar a releer lo ya escrito:
    // el aviso nombra solo los años y concuerda el verbo con ellos («faltan»).
    await rellenar(page, 'Años de propiedad', '');
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('Sin calcular');
    const motivo = await descripcionTarjeta(page, 'Plusvalía municipal');
    expect(motivo).toBe('No calculada (faltan los años de propiedad)');
    expect(motivo).not.toContain('valor catastral del suelo');
    expect(motivo).not.toContain('precio de compra');

    // Y el neto deja de presentarse como cifra firme, igual que el «COSTE TOTAL (PARCIAL)»
    // del panel del comprador cuando no calcula el IGIC/IPSI.
    await expect(page.locator('h3', { hasText: 'NETO QUE RECIBES' })).toHaveText('NETO QUE RECIBES (PARCIAL)');
    expect(await descripcionTarjeta(page, 'NETO QUE RECIBES')).toContain('No descuenta la plusvalía municipal');
    await expect(page.locator('h3', { hasText: 'Total gastos de la venta' })).toHaveText('Total gastos de la venta (parcial)');
  });

  /**
   * ✅ HALLAZGO 665 (MEDIO) — REPARADO el 09/09/2026. Sujeta la reparación como regresión:
   * llevaba `test.fail()` y hoy pasa en verde.
   *
   * El MISMO bloque FAQPage del JSON-LD se contradecía a sí mismo sobre el dato central de
   * la app. La primera pregunta deriva el rango de `RANGO_ITP` (data/itp-ccaa.ts) y dice
   * «del 4% al 13%»; la sexta —«¿Qué tipo de ITP aplica a un local comercial?»— lo tiene
   * escrito a mano y decía «entre el 4% (País Vasco) y el 10%-11% (Cataluña, Comunidad
   * Valenciana)». El 13 % no es teórico: es lo que la propia app cobra en el tramo alto de
   * Baleares y de Cataluña (CASO 2 y CASO 9 de este mismo fichero). Y citar a la Comunidad
   * Valenciana como techo estaba doblemente atrasado: bajó al 9 %/11 % el 01/06/2026.
   *
   * Es el hallazgo 622 repetido —allí el rango escrito a mano era el del AJD, y se reparó
   * derivándolo de RANGO_AJD en este mismo metadata.ts— sobre la pregunta que peor sienta:
   * la que un asistente de IA cita cuando le preguntan por el ITP de un local. La
   * reparación es la misma: derivar de RANGO_ITP y no nombrar comunidades concretas, que
   * es lo que envejece.
   */
  test('CASO 15 (regresión 665) — las dos preguntas del FAQPage citan el MISMO rango de ITP, derivado de la tabla', async ({ page }) => {
    await page.goto(RUTA);
    const bloques = await page.locator('script[type="application/ld+json"]').allTextContents();
    const faq = bloques.find((b) => b.includes('FAQPage')) ?? '';
    expect(faq).not.toBe('');
    // RANGO_ITP.min = 4 (País Vasco) y RANGO_ITP.max = 13 (tramo alto de las escalas
    // progresivas): las DOS preguntas que hablan de ITP tienen que decir lo mismo.
    // ⚠️ 13/09/2026: el NÚMERO de preguntas que citan el rango no es la invariante y envejece
    // con cada pregunta nueva —el commit d2df9760 añadió la de «escriturar», que también lo
    // deriva, y dejó este test en rojo sin que nada hubiera regresado—. Lo que el hallazgo 665
    // protege es que TODAS las que lo citen digan lo mismo, derivado de la tabla.
    const citasDeITP = (faq.match(/tipo general de (?:la|su) comunidad[^.]*?del \d+% al \d+%/g) ?? [])
      .map((frase) => frase.match(/del \d+% al \d+%/)?.[0]);
    expect(citasDeITP.length).toBeGreaterThanOrEqual(2);
    expect(new Set(citasDeITP).size).toBe(1);
    expect(citasDeITP[0]).toBe('del 4% al 13%');
    // Y lo que estaba escrito a mano ya no aparece.
    expect(faq).not.toContain('10%-11%');
    expect(faq).not.toContain('Comunidad Valenciana');
  });

  /**
   * ✅ HALLAZGO 667 (BAJO) — REPARADO el 09/09/2026. No tuvo testigo en rojo porque los
   * valores coincidían: el defecto era que un cambio de la tabla no habría llegado nunca
   * al texto. El rango «19–30 %» estaba escrito a mano en tres rótulos de `page.tsx` y en
   * la quinta pregunta del `faqJsonLd`, pudiendo derivarse de
   * TRAMOS_GANANCIAS_PATRIMONIALES_2025, que es exactamente la tabla con la que la app
   * calcula a través de `calcularGananciaInmueble` (el CASO 12d recorre sus cinco tramos).
   *
   * Es la misma forma que RANGO_AJD (hallazgo 622) y que el 665 de aquí arriba, donde el
   * desfase ya se había materializado. El test fija que el rótulo y el JSON-LD digan lo
   * que dice la tabla.
   */
  test('CASO 16 (regresión 667) — el rango de la base del ahorro se deriva de la tabla de tramos', async ({ page }) => {
    await page.goto(RUTA);
    await rellenar(page, 'Precio del local comercial', '400000');
    await page.getByRole('button', { name: /Vendedor/ }).click();
    await rellenar(page, 'Precio de compra original', '250000');

    // TRAMOS_GANANCIAS_PATRIMONIALES_2025: primer tramo 19 %, último 30 %.
    expect(await descripcionTarjeta(page, 'IRPF sobre la ganancia')).toContain('Base del ahorro (19–30 %)');

    // Y el FAQPage cita ese mismo rango, en vez de uno tecleado aparte.
    const bloques = await page.locator('script[type="application/ld+json"]').allTextContents();
    const faq = bloques.find((b) => b.includes('FAQPage')) ?? '';
    expect(faq).toContain('del 19% al 30%');
  });

  /**
   * ✅ Guardia de la pista de la tanda del 07/09/2026: en dos apps hermanas el texto sobre
   * el plazo de liquidación citaba la escala de recargo DEROGADA («del 5% al 20%»). Esta
   * app no habla del plazo, así que no la arrastra; el test deja el candado puesto por si
   * algún día se añade ese texto. La escala vigente es la del art. 27.2 LGT tras la Ley
   * 11/2021 (1 % de partida más 1 % por mes completo; 15 % más intereses pasados 12 meses),
   * en `ESCALA_RECARGO_EXTEMPORANEO` de `lib/calculadoras/recargoPresentacionTardia.ts`.
   */
  test('Pista 07/09 — la app no arrastra la escala de recargo derogada del 5 % al 20 %', async ({ page }) => {
    await page.goto(RUTA);
    const cuerpo = (await page.locator('body').innerText()).toLowerCase();
    expect(cuerpo).not.toMatch(/del 5\s*%?\s*al\s*20\s*%/);
    expect(cuerpo).not.toMatch(/5\s*%\s*,?\s*10\s*%\s*,?\s*15\s*%\s*(y|o)\s*20\s*%/);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// RE-INSPECCIÓN 11/09/2026 — disparada por dos commits que tocaron el motor de
// esta app sin tocar su suite:
//
//   · `7a02470c` reescribió la ficha de Aragón en `data/itp-ccaa.ts` contra el
//     texto consolidado del BOE (BOA-d-2005-90006): la escala del art. 121-1
//     pasó de DOS tramos declarados (8 % / 10 %) a los CINCO reales
//     (8 · 8,5 · 9 · 9,5 · 10 %), y lo que la tabla llamaba «tipos reducidos»
//     resultaron ser bonificaciones en cuota. Ninguna prueba de este fichero
//     pisaba Aragón, así que ni la escala vieja ni la nueva tenían testigo aquí.
//   · `bc437470` cambió en ESTE page.tsx la lectura de «Años de propiedad»
//     (`Math.max(0, …)` fuera, `anios >= 0` dentro) y actualizó las suites de
//     garaje, trastero, nave-industrial y el hub del clúster — pero no esta.
//
// Los tres casos se resolvieron a mano ANTES de abrir el navegador; el desglose
// va comentado junto a cada aserción, con la fuente de cada cifra.
//
// HALLAZGOS de esta ronda, que el Inspector NO repara y por eso van sin
// aserción (la suite sigue en verde):
//   · [medio] El panel de la comunidad imprime «IVA (comercial) 21%» también en
//     Canarias, Ceuta y Melilla, donde no rige el IVA (TERRITORIOS_SIN_IVA) y la
//     propia app responde «IGIC/IPSI · No calculado» dos tarjetas más allá. La
//     reparación 620/621 del 02/09 alcanzó a los rótulos de los botones y no a
//     esta casilla; `nave-industrial` ya la condiciona.
//   · [medio] La nota «Los locales comerciales tributan por el tipo general de
//     ITP, sin tipos reducidos» y la sexta pregunta del `faqJsonLd` («siempre
//     aplica el tipo general») son categóricas, y la ficha de Aragón recién
//     reescrita documenta en su campo `notas` el 1 % del art. 121-11 por
//     adquirir un inmueble para INICIAR UNA ACTIVIDAD ECONÓMICA (0,75 % en
//     medio rural), que no exige vivienda habitual. Es el único tipo del
//     catálogo que puede alcanzar a un local. `garaje`, `trastero` y
//     `estimador-compraventa-inmueble` sí imprimen `datosCcaaActual.notas`.
//   · [bajo] El aviso de la renuncia a la exención se pinta con `esRenuncia` a
//     secas, así que en Canarias afirma «El IVA se autoliquida por inversión del
//     sujeto pasivo» mientras el aviso de debajo dice que allí no hay IVA.
//     `nave-industrial` condiciona ese texto por territorio.
// ═════════════════════════════════════════════════════════════════════════════

test.describe('Re-inspección 11/09/2026 — la escala de Aragón y el año negativo', () => {
  test('CASO 17 (normal) — Aragón, local de 300.000 €: ITP 8 % en el primer tramo, e IVA del 21 % (no del 10 %) por no ser residencial', async ({ page }) => {
    await page.goto(RUTA);
    await page.locator('#select-ccaa').selectOption('aragon');
    await rellenar(page, 'Precio del local comercial', '300000');
    await rellenar(page, 'Gastos de gestoría del comprador (€)', '500');

    // El panel de la comunidad tiene que publicar la escala NUEVA de cinco tramos
    // (art. 121-1, ITP_CCAA.aragon.tramosProgresivos) y en formato español: hasta el
    // 11/09/2026 se pintaba con `${t.tipo}%`, que da «8.5%» con punto decimal, y Aragón
    // es la primera comunidad del catálogo con tramos no enteros.
    const panel = page.locator('text=ITP General').locator('xpath=ancestor::div[1]/ancestor::div[1]');
    await expect(panel).toContainText('8%');     // tipoGeneral de ITP_CCAA.aragon
    await expect(panel).toContainText('1,5%');   // AJD de ITP_CCAA.aragon
    await expect(page.locator('p[class*="infoCcaaNote"]').first())
      .toContainText('escala progresiva (8% → 8,5% → 9% → 9,5% → 10%)');

    // ── 17a. Segunda mano: exenta de IVA (art. 20.Uno.22º LIVA) → ITP.
    // 300.000 € cae entero en el primer tramo de la escala (hasta 400.000 al 8 %):
    //   300.000 × 8 % = 24.000. Tipo efectivo = 8,00 %, que aquí coincide con el nominal.
    // Un local NO puede acogerse a las bonificaciones del art. 121-4 ni del 121-5: las
    // cinco exigen «Vivienda habitual» en sus `condiciones`.
    await page.getByRole('button', { name: /Segunda mano/ }).first().click();
    await expect(page.locator('h3', { hasText: /^ITP/ }).first()).toHaveText('ITP (8,00%)');
    expect(await valorTarjeta(page, /^ITP/)).toBe('24.000,00 €');
    await expect(page.locator('h3', { hasText: /^AJD/ })).toHaveCount(0);

    // Notaría y registro sobre 300.000 €, ya resueltos en el CASO 8 (Andalucía):
    //   notaría 408,43341 × 1,21 × 1,75 = 864,85775 ; registro 225,2272455 × 1,21 = 272,52497
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('864,86 €');
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('272,52 €');
    // Total = 24.000 + 864,86 + 272,52 + 500 = 25.637,38 → 8,5458 % de 300.000
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('25.637,38 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toContain('8,55%');
    expect(await valorTarjeta(page, 'COSTE TOTAL')).toBe('325.637,38 €');

    // ── 17b. Obra nueva del promotor. LA PARTICULARIDAD DEL LOCAL: no es inmueble
    // residencial, así que el IVA es el tipo GENERAL —IVA_INMUEBLES_2025.local = 21,
    // art. 90 LIVA— y no el 10 % del art. 91.Uno.1.7º, que solo alcanza a la vivienda y
    // a sus anejos (IVA_INMUEBLES_2025.obraNueva / anejoVinculado, los que usan las apps
    // hermanas de garaje y trastero). 300.000 × 21 % = 63.000, no 30.000.
    //   AJD de ITP_CCAA.aragon = 1,5 % → 300.000 × 1,5 % = 4.500
    await page.getByRole('button', { name: /Obra nueva/ }).click();
    await expect(page.locator('h3', { hasText: /^IVA/ }).first()).toHaveText('IVA (21,00%)');
    expect(await valorTarjeta(page, /^IVA/)).toBe('63.000,00 €');
    await expect(page.locator('h3', { hasText: /^AJD/ }).first()).toHaveText('AJD (1,50%)');
    expect(await valorTarjeta(page, /^AJD/)).toBe('4500,00 €');
    await expect(page.locator('h3', { hasText: /^ITP/ })).toHaveCount(0);
    // Total = 63.000 + 4.500 + 864,86 + 272,52 + 500 = 69.137,38 → 23,0458 %
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('69.137,38 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toContain('23,05%');
    expect(await valorTarjeta(page, 'COSTE TOTAL')).toBe('369.137,38 €');

    // ── 17c. Renuncia a la exención (art. 20.Dos LIVA): mismo tipo, mismo AJD, pero
    // autoliquidado por el comprador. Nunca ITP a la vez.
    await page.getByRole('button', { name: /renuncia IVA/ }).click();
    await expect(page.locator('h3', { hasText: /^IVA/ }).first()).toHaveText('IVA (renuncia · ISP) (21,00%)');
    expect(await valorTarjeta(page, /^IVA/)).toBe('63.000,00 €');
    expect(await descripcionTarjeta(page, /^IVA/)).toContain('inversión del sujeto pasivo');
    expect(await valorTarjeta(page, /^AJD/)).toBe('4500,00 €');
    await expect(page.locator('h3', { hasText: /^ITP/ })).toHaveCount(0);
  });

  test('CASO 18 (límite) — Aragón: los cinco tramos del art. 121-1 y sus cuatro cortes de cuota acumulada', async ({ page }) => {
    await page.goto(RUTA);
    await page.locator('#select-ccaa').selectOption('aragon');
    await page.getByRole('button', { name: /Segunda mano/ }).first().click();
    await rellenar(page, 'Gastos de gestoría del comprador (€)', '500');

    // Los cuatro cortes que la ficha de ITP_CCAA.aragon declara como tabla oficial, y que
    // `tests/itp-aragon.spec.ts` comprueba sobre el motor: aquí se comprueban EN PANTALLA.
    //   400.000 → 400.000×8 %                                        = 32.000  (8,00 % efectivo)
    //   450.000 → 32.000 + 50.000×8,5 %                              = 36.250  (8,0556 → 8,06 %)
    //   500.000 → 36.250 + 50.000×9 %                                = 40.750  (8,15 %)
    //   750.000 → 40.750 + 250.000×9,5 %                             = 64.500  (8,60 %)
    // Con la escala vieja de dos tramos, 500.000 € liquidaban 42.000 € y 750.000 €, 67.000 €.
    for (const [precio, cuota, etiqueta] of [
      ['400000', '32.000,00 €', 'ITP (8,00%)'],
      ['450000', '36.250,00 €', 'ITP (8,06%)'],
      ['500000', '40.750,00 €', 'ITP (8,15%)'],
      ['750000', '64.500,00 €', 'ITP (8,60%)'],
    ] as const) {
      await rellenar(page, 'Precio del local comercial', precio);
      expect(await valorTarjeta(page, /^ITP/)).toBe(cuota);
      await expect(page.locator('h3', { hasText: /^ITP/ }).first()).toHaveText(etiqueta);
    }

    // ── Y el QUINTO tramo, el del 10 %, que solo se alcanza por encima de 750.000 €:
    //   400.000×8 % + 50.000×8,5 % + 50.000×9 % + 250.000×9,5 % + 50.000×10 %
    //   = 32.000 + 4.250 + 4.500 + 23.750 + 5.000 = 69.500
    // Tipo EFECTIVO = 69.500 / 800.000 = 8,6875 % → 8,69 %, que no es ninguno de los cinco
    // nominales: por eso la etiqueta lleva dos decimales.
    await rellenar(page, 'Precio del local comercial', '800000');
    expect(await valorTarjeta(page, /^ITP/)).toBe('69.500,00 €');
    await expect(page.locator('h3', { hasText: /^ITP/ }).first()).toHaveText('ITP (8,69%)');

    // Notaría sobre 800.000 € (ARANCELES_NOTARIO, RD 1426/1989):
    //   90,15 + 24.040,49×0,45 % + 30.050,60×0,15 % + 90.151,82×0,10 % + 450.759,07×0,05 %
    //   + 198.987,90×0,03 % = 618,63583 ; × 1,21 de IVA = 748,54935 ; × 1,75 = 1.309,96137.
    //   Horquilla (FACTURA_NOTARIAL 1,5–2): 1.122,82403 y 1.497,09871.
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('1309,96 €');
    expect(await descripcionTarjeta(page, 'Gastos de notaría')).toContain('1122,82 €');
    expect(await descripcionTarjeta(page, 'Gastos de notaría')).toContain('1497,10 €');
    // Registro (ARANCELES_REGISTRO, RD 1427/1989): 24,04 + 42,07086 + 37,56325 + 67,61387
    //   + 135,22772 + 198.987,90×0,020 % (=39,79758) = 346,31327 ; + 9,015182 ; × 1,21 = 429,94743
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('429,95 €');
    // Total = 69.500 + 1.309,96 + 429,95 + 500 = 71.739,91 → 8,9675 % de 800.000
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('71.739,91 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toContain('8,97%');
    expect(await valorTarjeta(page, 'COSTE TOTAL')).toBe('871.739,91 €');
  });

  test('CASO 19 (rechazo) — un año de propiedad NEGATIVO no se acota a 0: no liquida la plusvalía de la reventa antes del año', async ({ page }) => {
    await page.goto(RUTA);
    await rellenar(page, 'Precio del local comercial', '400000');
    await page.getByRole('button', { name: /Vendedor/ }).click();
    await rellenar(page, 'Precio de compra original', '250000');
    await rellenar(page, 'Impuestos y gastos que pagaste al comprarlo (€)', '30000');
    await rellenar(page, 'Valor catastral del suelo (€)', '80000');
    await rellenar(page, 'Valor catastral total (suelo + construcción) (€)', '200000');
    await rellenar(page, 'Comisión de la inmobiliaria (%)', '4');
    await rellenar(page, 'Gestoría y certificados del vendedor (€)', '1500');

    const anios = page.locator('input[aria-label="Años de propiedad"]');

    // ── Con «−1» vivo en el campo (SIN blur, que es cuando el estado lo ve). Desde
    // `bc437470` la guarda es `anios >= 0` en vez de `Math.max(0, …)`: acotar el negativo
    // a 0 lo convertiría en una reventa antes del año y liquidaría 2.800 € de IIVTNU a
    // partir de un dato imposible. Ahora se rechaza y se DICE.
    await anios.fill('-1');
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('Sin calcular');
    expect(await descripcionTarjeta(page, 'Plusvalía municipal')).toBe('No calculada (faltan los años de propiedad)');
    // Y como al total le falta un impuesto, ni el total ni el neto se dan por firmes:
    //   adquisición = 250.000 + 30.000 = 280.000
    //   transmisión = 400.000 − 16.000 de comisión − 1.500 de gestoría − 0 = 382.500
    //   ganancia    = 102.500 → IRPF = 6.000×19 % + 44.000×21 % + 52.500×23 %
    //               = 1.140 + 9.240 + 12.075 = 22.455
    //   gastos      = 0 + 16.000 + 1.500 + 22.455 = 39.955 → neto 360.045
    await expect(page.locator('h3', { hasText: 'Total gastos de la venta' })).toHaveText('Total gastos de la venta (parcial)');
    await expect(page.locator('h3', { hasText: 'NETO QUE RECIBES' })).toHaveText('NETO QUE RECIBES (PARCIAL)');
    expect(await valorTarjeta(page, 'Ganancia patrimonial')).toBe('102.500,00 €');
    expect(await valorTarjeta(page, 'IRPF sobre la ganancia')).toBe('22.455,00 €');
    expect(await valorTarjeta(page, 'Total gastos de la venta')).toBe('39.955,00 €');
    expect(await valorTarjeta(page, 'NETO QUE RECIBES')).toBe('360.045,00 €');

    // ⚠️ RETIRADO el 21/09/2026 — aquí había un bloque que hacía `blur()` y afirmaba que el
    // −1 se acotaba a «0», que la plusvalía pasaba a 2.800,00 € y que el neto volvía a ser
    // FIRME (357.889,00 €). Eso consagraba un defecto: el 0 no es neutro en este campo, es
    // la reventa antes de cumplir el año con el tercer coeficiente más alto de
    // COEFICIENTES_IIVTNU_2025 (0,14), así que un dato IMPOSIBLE se convertía, solo por
    // pasar al campo siguiente, en un supuesto fiscal válido y caro presentado como
    // definitivo. Es el hallazgo 822/844, reparado el 15/09/2026 en `…-garaje` y
    // `…-trastero` con `acotarAlSalir={false}` y NO propagado a esta app. El caso vive
    // ahora, con lo que DEBERÍA pasar, en «[H-21/09-a]» al final del fichero.
    // El 0 explícito y válido lo sigue cubriendo el CASO 14.

    // ── Texto: el NumberInput no admite los caracteres (regex /^-?[\d.,]*$/), el campo
    // queda vacío y la plusvalía vuelve a «Sin calcular», no a 0,00 €.
    await anios.fill('');
    await anios.type('abc');
    await expect(anios).toHaveValue('');
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('Sin calcular');
    await expect(page.locator('h3', { hasText: 'NETO QUE RECIBES' })).toHaveText('NETO QUE RECIBES (PARCIAL)');
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// RE-INSPECCIÓN 12/09/2026 — la cola invalidó la del 11/09 porque el código y sus
// dependencias habían cambiado (7a02470c reescribió la ficha de Aragón, bc437470 abrió la
// reventa antes del año y 21a13c6b trajo `PLAZO_ITP` a data/fiscal y tocó `data/itp-ccaa.ts`).
//
// Qué se comprueba aquí, con los tres casos resueltos A MANO antes de ejecutar la app:
//   · CASO 20 (normal)  — Galicia, tipo PLANO del 8 %, en las dos ramas (ITP y obra nueva),
//     y la mitad del vendedor por su rama nunca probada: vender con PÉRDIDA, donde la
//     plusvalía municipal es «No sujeta» (art. 104.5 TRLHL) y el IRPF dice «SIN CUOTA».
//   · CASO 21 (límite)  — Melilla, el tercero de los territorios sin IVA y el que quedaba
//     sin probar (Ceuta ya la cubre el caso 619/623): bonificación del 50 % de la cuota en
//     ITP y en AJD (art. 57 bis TRLITPAJD) e IPSI «No calculado» en la renuncia.
//   · CASO 22 (rechazo) — la comisión de la inmobiliaria del VENDEDOR, el único importe del
//     panel que no se acota: texto y blur.
//
// De dónde sale cada cifra (ninguna de memoria):
//   · Galicia, tipo general 8 % y AJD 1,5 % → `ITP_CCAA.galicia` de `data/itp-ccaa.ts`, cuyo
//     `tipoGeneral` lo toma de `TIPOS_ITP_CCAA_2025` («Galicia», tipo 8) en
//     `data/fiscal/inmuebles.ts`. Sin `tramosProgresivos`: tipo plano.
//   · Melilla, tipo general 6 % y AJD 0,5 % → `ITP_CCAA.melilla`, con la bonificación del
//     50 % que aplica `aplicarBonificacionCiudad` (art. 57 bis del TRLITPAJD, RDL 1/1993).
//   · IVA del local, 21 % → `IVA_INMUEBLES_2025.local` (Ley 37/1992).
//   · Aranceles → `ARANCELES_NOTARIO` + `FACTURA_NOTARIAL` (horquilla ×1,5 a ×2, punto medio
//     ×1,75) y `ARANCELES_REGISTRO` + `REGISTRO_CONCEPTOS`, los dos con el 21 % de IVA dentro.
//   · Plusvalía municipal → `COEFICIENTES_IIVTNU_2025` (12 años → 0,08) y el tipo orientativo
//     del 25 % de `PLUSVALIA_MUNICIPAL_META`, vía `calcularPlusvaliaMunicipal`.
//   · Escala del ahorro → `TRAMOS_GANANCIAS_PATRIMONIALES_2025` y la fórmula del art. 35
//     LIRPF en `data/fiscal/ganancia-inmueble.ts`.
//
// Sobre `PLAZO_ITP` (la pista de esta tanda): esta app NO lo necesita, y por eso no se le
// reprocha no importarlo. Nació el 11/09 en `data/fiscal/inmuebles.ts` porque garaje tenía
// «30 días hábiles» escritos a mano en su bloque educativo; aquí se ha buscado el plazo en
// las 1.195 líneas de la página y en su `metadata.ts` y no se menciona en ningún sitio, así
// que no hay dato a mano que sellar. El dato del clúster que esta app SÍ aplica sin nombrar
// es otro, y va como hallazgo abajo: el 25 % de `PLUSVALIA_MUNICIPAL_META.tipoOrientativo`.
//
// Los inputs se siembran con `esperarValorEnReact` de `tests/apps/_hidratacion.ts`: el
// `rellenar` del principio del fichero usa `fill()` a secas, que llega a React pero no espera
// a que haya hidratado, y en esa ventana el evento se pierde y el caso mide otro escenario.
// ═════════════════════════════════════════════════════════════════════════════

/** Testigo de que la app ya escucha: el input que existe en las dos pestañas. */
const TESTIGOS_12_09 = ['input[aria-label="Precio del local comercial"]'];

/**
 * Siembra un importe y NO sigue hasta que el estado de React lo ha recogido.
 * `blur: false` deja el valor VIVO en el campo, que es donde viven los casos de rechazo:
 * el `min = 0` del NumberInput solo actúa al perder el foco.
 */
async function sembrarImporte12(
  page: Page,
  etiqueta: string,
  valor: string,
  { blur = true }: { blur?: boolean } = {},
): Promise<void> {
  const campo = page.locator(`input[aria-label="${etiqueta}"]`);
  await campo.fill(valor);
  await esperarValorEnReact(page, campo, valor);
  if (blur) await campo.blur();
}

test.describe('RE-INSPECCIÓN 12/09/2026 — Galicia, Melilla y la comisión del vendedor', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, TESTIGOS_12_09);
  });

  // ══════════════════════════════════════════════════════════════════════════
  // CASO 20 (NORMAL) — Galicia · 250.000 € · las dos ramas del comprador, y un
  // vendedor que pierde dinero.
  //
  // COMPRADOR, segunda mano (ITP, tipo PLANO del 8 %):
  //   ITP        = 250.000 × 8 % =                                  20.000,000000
  //   AJD        = 0 (la transmisión sujeta a TPO no devenga la cuota gradual)
  //   Notaría (ARANCELES_NOTARIO, RD 1426/1989):
  //     90,15 + 24.040,49×0,45 % + 30.050,60×0,15 % + 90.151,82×0,10 %
  //     + 99.746,97×0,05 %                             =              383,433410
  //     × 1,21 de IVA =                                              463,954426
  //     horquilla FACTURA_NOTARIAL: ×1,5 = 695,931639 · ×2 = 927,908852
  //     punto medio ×1,75 =                                          811,920246
  //   Registro (ARANCELES_REGISTRO, RD 1427/1989):
  //     24,04 + 24.040,49×0,175 % + 30.050,60×0,125 % + 90.151,82×0,075 %
  //     + 99.746,97×0,030 %                            =              201,212064
  //     + 6,010121 de presentación + 3,005061 de nota simple =        210,227246
  //     × 1,21 de IVA =                                              254,374967
  //   Gestoría (valor inicial del campo) =                            500,000000
  //   Total (sumarLineasVisibles, cada línea ya redondeada al céntimo):
  //     20.000,00 + 0 + 811,92 + 254,37 + 500 =                    21.566,290000
  //     → 21.566,29 / 250.000 = 8,626516 % → «8,63%»
  //   COSTE TOTAL = 250.000 + 21.566,29 =                          271.566,290000
  //
  // COMPRADOR, obra nueva (IVA 21 % + AJD 1,5 %):
  //   IVA   = 250.000 × 21 % =                                       52.500,00
  //   AJD   = 250.000 × 1,5 % =                                       3.750,00
  //   Total = 52.500 + 3.750 + 811,92 + 254,37 + 500 =               57.816,29
  //     → 57.816,29 / 250.000 = 23,126516 % → «23,13%»
  //   COSTE TOTAL =                                                 307.816,29
  //
  // VENDEDOR (rama nueva: PÉRDIDA patrimonial y plusvalía NO SUJETA):
  //   compra 300.000 + 25.000 de gastos · venta 250.000 · 6 años · suelo 60.000 · total
  //   150.000 · comisión 3 % (valor inicial) · gestoría del vendedor vacía (= 0)
  //   incremento real = 250.000 − 300.000 = −50.000 ≤ 0 → art. 104.5 TRLHL: NO SUJETA,
  //     y `calcularPlusvaliaMunicipal` devuelve 0 con `exento: true` (no es un 0 por
  //     falta de datos: los tres campos están rellenos, así que ni el total ni el neto
  //     se rotulan «parcial»).
  //   valor de adquisición = 300.000 + 25.000 =                     325.000,00
  //   comisión = 250.000 × 3 % =                                      7.500,00
  //   valor de transmisión = 250.000 − 7.500 − 0 =                   242.500,00
  //   ganancia = 242.500 − 325.000 = −82.500 → PÉRDIDA de              82.500,00
  //     → cuotaIRPF = 0 («SIN CUOTA»): una pérdida se compensa en la declaración
  //   total gastos = 0 + 7.500 + 0 + 0 =                               7.500,00
  //     → 7.500 / 250.000 = 3 % → «3,00%»
  //   neto = 250.000 − 7.500 =                                       242.500,00
  // ══════════════════════════════════════════════════════════════════════════
  test('CASO 20 (normal) — Galicia, local de 250.000 €: ITP plano al 8 %, obra nueva al 21 %, y un vendedor que vende con pérdida', async ({ page }) => {
    await page.locator('#select-ccaa').selectOption('galicia');
    await sembrarImporte12(page, 'Precio del local comercial', '250000');

    // ── Segunda mano: ITP al tipo general de Galicia, sin AJD
    await expect(page.locator('h3', { hasText: /^ITP/ }).first()).toHaveText('ITP (8,00%)');
    expect(await valorTarjeta(page, /^ITP/)).toBe('20.000,00 €');
    await expect(page.locator('h3', { hasText: /^AJD/ })).toHaveCount(0);
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('811,92 €');
    expect(await descripcionTarjeta(page, 'Gastos de notaría')).toContain('695,93 €');
    expect(await descripcionTarjeta(page, 'Gastos de notaría')).toContain('927,91 €');
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('254,37 €');
    expect(await valorTarjeta(page, 'Gastos de gestoría')).toBe('500,00 €');
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('21.566,29 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toContain('8,63%');
    expect(await valorTarjeta(page, /COSTE TOTAL/)).toBe('271.566,29 €');

    // ── Obra nueva del promotor: IVA del 21 % (local, no vivienda) + AJD del 1,5 %
    await page.getByRole('button', { name: /Obra nueva/ }).click();
    await expect(page.locator('h3', { hasText: /^IVA/ }).first()).toHaveText('IVA (21,00%)');
    expect(await valorTarjeta(page, /^IVA/)).toBe('52.500,00 €');
    await expect(page.locator('h3', { hasText: /^AJD/ }).first()).toHaveText('AJD (1,50%)');
    expect(await valorTarjeta(page, /^AJD/)).toBe('3750,00 €');
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('57.816,29 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toContain('23,13%');
    expect(await valorTarjeta(page, /COSTE TOTAL/)).toBe('307.816,29 €');

    // ── Vendedor: pérdida patrimonial y plusvalía no sujeta
    await page.getByRole('button', { name: /Vendedor/ }).click();
    await sembrarImporte12(page, 'Precio de compra original', '300000');
    await sembrarImporte12(page, 'Impuestos y gastos que pagaste al comprarlo (€)', '25000');
    await sembrarImporte12(page, 'Años de propiedad', '6');
    await sembrarImporte12(page, 'Valor catastral del suelo (€)', '60000');
    await sembrarImporte12(page, 'Valor catastral total (suelo + construcción) (€)', '150000');

    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('0,00 €');
    expect(await descripcionTarjeta(page, 'Plusvalía municipal')).toBe('No sujeta (sin incremento de valor)');
    expect(await valorTarjeta(page, 'Valor de adquisición')).toBe('325.000,00 €');
    expect(await valorTarjeta(page, 'Valor de transmisión')).toBe('242.500,00 €');
    // Una pérdida se rotula PÉRDIDA y no «exención»: se compensa en la declaración.
    await expect(page.locator('h3', { hasText: /Pérdida patrimonial/ })).toHaveCount(1);
    await expect(page.locator('h3', { hasText: /^Ganancia patrimonial/ })).toHaveCount(0);
    expect(await valorTarjeta(page, 'Pérdida patrimonial')).toBe('82.500,00 €');
    expect(await valorTarjeta(page, 'IRPF sobre la ganancia')).toBe('SIN CUOTA');
    expect(await valorTarjeta(page, 'Comisión de la inmobiliaria')).toBe('7500,00 €');
    // Los tres campos de la plusvalía están rellenos, así que NO son cifras parciales.
    await expect(page.locator('h3', { hasText: /Total gastos de la venta/ })).toHaveText('Total gastos de la venta');
    expect(await valorTarjeta(page, /Total gastos de la venta/)).toBe('7500,00 €');
    expect(await descripcionTarjeta(page, /Total gastos de la venta/)).toContain('3,00%');
    await expect(page.locator('h3', { hasText: /NETO QUE RECIBES/ })).toHaveText('NETO QUE RECIBES');
    expect(await valorTarjeta(page, /NETO QUE RECIBES/)).toBe('242.500,00 €');
  });

  // ══════════════════════════════════════════════════════════════════════════
  // CASO 21 (LÍMITE) — Melilla · 400.000 €. Dos límites a la vez: el territorio donde no
  // rige el IVA (IPSI) y la bonificación del 50 % de la cuota del art. 57 bis TRLITPAJD,
  // que `aplicarBonificacionCiudad` aplica en el MOTOR, no en la app.
  //
  //   Notaría: 90,15 + 108,182205 + 45,0759 + 90,15182 + 249.746,97×0,05 %
  //            = 458,433410 ; × 1,21 = 554,704426
  //            horquilla ×1,5 = 832,056639 · ×2 = 1.109,408852 · medio ×1,75 = 970,732746
  //   Registro: 171,287973 + 249.746,97×0,030 % = 246,212064 ; + 9,015182 = 255,227246
  //             × 1,21 = 308,824967
  //
  // Segunda mano (ITP):
  //   cuota íntegra = 400.000 × 6 % = 24.000 → bonificada al 50 % =      12.000,00
  //   tipo EFECTIVO en la etiqueta = 12.000 / 400.000 = 3 % (el nominal de la tabla, 6 %,
  //     desmentiría al importe de al lado)
  //   total = 12.000 + 970,73 + 308,82 + 500 =                           13.779,55
  //     → 13.779,55 / 400.000 = 3,444888 % → «3,44%»
  //   COSTE TOTAL =                                                     413.779,55
  //
  // Renuncia a la exención (art. 20.Dos LIVA) en Melilla:
  //   allí no hay IVA al que renunciar (rige el IPSI): el impuesto principal NO se cifra,
  //   pero la cuota gradual de AJD sí se devenga y también se bonifica (art. 57 bis.1):
  //   AJD = 400.000 × 0,5 % = 2.000 → bonificada =                        1.000,00
  //     tipo efectivo = 1.000 / 400.000 = 0,25 %
  //   total PARCIAL = 0 + 1.000 + 970,73 + 308,82 + 500 =                 2.779,55
  //     → 2.779,55 / 400.000 = 0,694888 % → «0,69%»
  //   COSTE TOTAL (PARCIAL) = 400.000 + 2.779,55 =                      402.779,55
  // ══════════════════════════════════════════════════════════════════════════
  test('CASO 21 (límite) — Melilla: el 50 % de bonificación en la cuota del ITP y del AJD, y el IPSI que no se cifra', async ({ page }) => {
    await page.locator('#select-ccaa').selectOption('melilla');
    await sembrarImporte12(page, 'Precio del local comercial', '400000');

    // El recuadro de la ciudad: tipo NOMINAL del 6 %, AJD del 0,5 % y, donde no rige el
    // IVA, el impuesto que sí rige con su «No calculado» (hallazgo 725, reparado).
    const recuadro = page.locator('#select-ccaa').locator('xpath=../..');
    await expect(recuadro).toContainText('IPSI (obra nueva)');
    await expect(recuadro).toContainText('No calculado');
    await expect(recuadro).toContainText('Bonificación automática del 50% para inmuebles en Melilla');

    // ── Segunda mano: la cuota llega bonificada y la pantalla lo DICE (hallazgos 619/623)
    await expect(page.locator('h3', { hasText: /^ITP/ }).first()).toHaveText('ITP (3,00%)');
    expect(await valorTarjeta(page, /^ITP/)).toBe('12.000,00 €');
    expect(await descripcionTarjeta(page, /^ITP/)).toBe(
      'Tipo general con la bonificación del 50 % de la cuota ya aplicada (art. 57 bis.3.a TRLITPAJD)',
    );
    await expect(page.locator('h3', { hasText: /^AJD/ })).toHaveCount(0);
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('970,73 €');
    expect(await descripcionTarjeta(page, 'Gastos de notaría')).toContain('832,06 €');
    expect(await descripcionTarjeta(page, 'Gastos de notaría')).toContain('1109,41 €');
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('308,82 €');
    await expect(page.locator('h3', { hasText: /Total gastos adicionales/ })).toHaveText('Total gastos adicionales');
    expect(await valorTarjeta(page, /Total gastos adicionales/)).toBe('13.779,55 €');
    expect(await descripcionTarjeta(page, /Total gastos adicionales/)).toContain('3,44%');
    await expect(page.locator('h3', { hasText: /COSTE TOTAL/ })).toHaveText('COSTE TOTAL DE ADQUISICIÓN');
    expect(await valorTarjeta(page, /COSTE TOTAL/)).toBe('413.779,55 €');

    // ── Renuncia: ni IVA ni inversión del sujeto pasivo, y el aviso lo dice (hallazgo 727)
    await page.getByRole('button', { name: /renuncia IVA/ }).click();
    const cuerpoVisible = (await page.locator('body').innerText()).replace(ESPACIO_DURO, ' ');
    expect(cuerpoVisible).toContain('Aquí no hay IVA al que renunciar');
    // Y NO el aviso de la renuncia peninsular, que aquí prometería un IVA inexistente
    expect(cuerpoVisible).not.toContain('Renuncia a la exención de IVA (Art. 20.Dos LIVA)');
    await expect(page.locator('h3', { hasText: /^IPSI/ }).first()).toHaveText('IPSI');
    expect(await valorTarjeta(page, /^IPSI/)).toBe('No calculado');
    expect(await descripcionTarjeta(page, /^IPSI/)).toContain(
      'En Ciudad Autónoma de Melilla no rige el IVA: la renuncia a la exención tributa por el IPSI',
    );
    await expect(page.locator('h3', { hasText: /^AJD/ }).first()).toHaveText('AJD (0,25%)');
    expect(await valorTarjeta(page, /^AJD/)).toBe('1000,00 €');
    expect(await descripcionTarjeta(page, /^AJD/)).toBe('Con la bonificación del 50 % de Ceuta y Melilla aplicada');
    // Falta un impuesto: ni el total ni el coste se dan por firmes.
    await expect(page.locator('h3', { hasText: /Total gastos adicionales/ })).toHaveText('Total gastos adicionales (parcial)');
    expect(await valorTarjeta(page, /Total gastos adicionales/)).toBe('2779,55 €');
    expect(await descripcionTarjeta(page, /Total gastos adicionales/)).toContain('0,69%');
    expect(await descripcionTarjeta(page, /Total gastos adicionales/)).toContain('SIN el IPSI');
    await expect(page.locator('h3', { hasText: /COSTE TOTAL/ })).toHaveText('COSTE TOTAL (PARCIAL)');
    expect(await valorTarjeta(page, /COSTE TOTAL/)).toBe('402.779,55 €');
    expect(await descripcionTarjeta(page, /COSTE TOTAL/)).toContain('No incluye el IPSI');
  });

  // ══════════════════════════════════════════════════════════════════════════
  // CASO 22 (RECHAZO) — la comisión de la inmobiliaria del VENDEDOR.
  //
  // Escenario base (el del CASO 11, para poder comparar): venta 400.000 · compra 250.000
  // + 30.000 de gastos · 12 años · suelo 80.000 · total 200.000 · gestoría del vendedor
  // 1.500 · comisión 4 %.
  //   plusvalía: objetivo = 80.000 × 0,08 (COEFICIENTES_IIVTNU_2025, 12 años) × 25 % = 1.600
  //              real = 150.000 × (80.000/200.000) × 25 % = 15.000 → gana el objetivo
  //   adquisición = 280.000 · transmisión = 400.000 − 16.000 − 1.500 − 1.600 = 380.900
  //   ganancia = 100.900 → IRPF = 6.000×19 % + 44.000×21 % + 50.900×23 % = 22.087
  //   gastos = 1.600 + 16.000 + 1.500 + 22.087 = 41.187 → neto 358.813
  //
  // Con la comisión a 0 (que es donde la deja el `min = 0` del NumberInput al salir del
  // campo, y también lo que vale un campo VACÍO vía `parseSpanishNumberOr`):
  //   transmisión = 400.000 − 0 − 1.500 − 1.600 = 396.900 → ganancia 116.900
  //   IRPF = 1.140 + 9.240 + 66.900×23 % (= 15.387) = 25.767
  //   gastos = 1.600 + 0 + 1.500 + 25.767 = 28.867 → neto 371.133
  // ══════════════════════════════════════════════════════════════════════════
  test('CASO 22 (rechazo) — la comisión del vendedor: el texto no se admite y el blur la acota a 0', async ({ page }) => {
    await sembrarImporte12(page, 'Precio del local comercial', '400000');
    await page.getByRole('button', { name: /Vendedor/ }).click();
    await sembrarImporte12(page, 'Precio de compra original', '250000');
    await sembrarImporte12(page, 'Impuestos y gastos que pagaste al comprarlo (€)', '30000');
    await sembrarImporte12(page, 'Años de propiedad', '12');
    await sembrarImporte12(page, 'Valor catastral del suelo (€)', '80000');
    await sembrarImporte12(page, 'Valor catastral total (suelo + construcción) (€)', '200000');
    await sembrarImporte12(page, 'Gestoría y certificados del vendedor (€)', '1500');
    await sembrarImporte12(page, 'Comisión de la inmobiliaria (%)', '4');

    // Referencia con el 4 %
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('1600,00 €');
    expect(await valorTarjeta(page, 'Comisión de la inmobiliaria')).toBe('16.000,00 €');
    expect(await valorTarjeta(page, 'IRPF sobre la ganancia')).toBe('22.087,00 €');
    expect(await valorTarjeta(page, /NETO QUE RECIBES/)).toBe('358.813,00 €');

    const comision = page.locator('input[aria-label="Comisión de la inmobiliaria (%)"]');

    // Texto: el NumberInput no admite los caracteres (regex /^-?[\d.,]*$/), el campo queda
    // vacío y `parseSpanishNumberOr` lo lee como 0 — no como NaN propagado a la cuota.
    await comision.fill('');
    await esperarValorEnReact(page, comision, '');
    await comision.type('abc');
    await expect(comision).toHaveValue('');
    expect(await valorTarjeta(page, 'Comisión de la inmobiliaria')).toBe('0,00 €');
    expect(await valorTarjeta(page, 'IRPF sobre la ganancia')).toBe('25.767,00 €');
    expect(await valorTarjeta(page, /NETO QUE RECIBES/)).toBe('371.133,00 €');

    // Negativa: al SALIR del campo, el `min = 0` del NumberInput la lleva a 0 y todo el
    // panel vuelve a cuadrar. Lo que ocurre MIENTRAS el campo tiene el foco va abajo.
    await sembrarImporte12(page, 'Comisión de la inmobiliaria (%)', '-4');
    await expect(comision).toHaveValue('0');
    expect(await valorTarjeta(page, 'Comisión de la inmobiliaria')).toBe('0,00 €');
    expect(await valorTarjeta(page, 'IRPF sobre la ganancia')).toBe('25.767,00 €');
    expect(await valorTarjeta(page, /NETO QUE RECIBES/)).toBe('371.133,00 €');
  });

  // ───────────────────────────────────────────────────────────────────────────
  // HALLAZGOS ABIERTOS del 12/09/2026, con `test.fail()`: afirman lo que DEBERÍA
  // ocurrir, así que hoy fallan a propósito. Cuando se reparen se les quita el
  // `test.fail()` y quedan como regresión — comprobando antes, uno a uno, que lo que
  // afirman sigue siendo lo correcto.
  // ───────────────────────────────────────────────────────────────────────────

  /**
   * HALLAZGO 12/09/2026 (MEDIO · cálculo) — la comisión de la inmobiliaria y la gestoría del
   * VENDEDOR son los dos únicos importes del panel que no se acotan mientras el campo tiene
   * el foco, y en negativo parten la pantalla en dos mitades que usan valores distintos del
   * MISMO dato:
   *
   *   const comisionPct = parseSpanishNumberOr(comisionInmobiliaria) / 100;   // sin Math.max
   *   const gestoria    = parseSpanishNumberOr(gastosGestoriaVenta);         // sin Math.max
   *
   * Con «−4» vivo en el campo, sobre el escenario del CASO 22:
   *   · la tarjeta «Comisión de la inmobiliaria» imprime −16.000,00 €: un gasto que cobra;
   *   · el total de gastos baja de 41.187,00 € a 13.212,00 € y el neto SUBE a 386.788,00 €;
   *   · y a la vez `calcularGananciaInmueble` sí la acota (su `positivo()` deja
   *     `gastosTransmision` en 0 porque −16.000 + 1.500 es negativo), así que el valor de
   *     transmisión se calcula SIN NINGÚN GASTO (398.400 €) y el IRPF sube a 26.112,00 €.
   *
   * De modo que la misma pantalla cobra el IRPF de una venta sin gastos y descuenta del neto
   * un gasto negativo. La app ya resolvió esto en la mitad del comprador —`const gestoria =
   * Math.max(0, parseSpanishNumberOr(gastosGestoria))`, con su comentario explicando que el
   * importe negativo «se sumaba al total y su tarjeta ni se pintaba»— y en las amortizaciones
   * del vendedor (`Math.max(0, …)`, CASO 13). Aquí falta en los dos campos que quedan.
   *
   * Esperado: acotado a 0, como los otros tres importes → comisión 0,00 €, IRPF 25.767,00 €
   * y neto 371.133,00 €, que es exactamente lo que la app da en cuanto se sale del campo.
   */
  test('[785] una comisión NEGATIVA no abarata la venta ni encarece el IRPF, ni siquiera con el foco dentro', async ({ page }) => {
    await sembrarImporte12(page, 'Precio del local comercial', '400000');
    await page.getByRole('button', { name: /Vendedor/ }).click();
    await sembrarImporte12(page, 'Precio de compra original', '250000');
    await sembrarImporte12(page, 'Impuestos y gastos que pagaste al comprarlo (€)', '30000');
    await sembrarImporte12(page, 'Años de propiedad', '12');
    await sembrarImporte12(page, 'Valor catastral del suelo (€)', '80000');
    await sembrarImporte12(page, 'Valor catastral total (suelo + construcción) (€)', '200000');
    await sembrarImporte12(page, 'Gestoría y certificados del vendedor (€)', '1500');

    // Comisión negativa VIVA en el campo (sin blur: el min = 0 solo actúa al perder el foco)
    await sembrarImporte12(page, 'Comisión de la inmobiliaria (%)', '-4', { blur: false });

    // HOY: −16.000,00 € · 26.112,00 € · 13.212,00 € · 386.788,00 €
    expect(await valorTarjeta(page, 'Comisión de la inmobiliaria')).toBe('0,00 €');
    expect(await valorTarjeta(page, 'Valor de transmisión')).toBe('396.900,00 €');
    expect(await valorTarjeta(page, 'IRPF sobre la ganancia')).toBe('25.767,00 €');
    expect(await valorTarjeta(page, /Total gastos de la venta/)).toBe('28.867,00 €');
    expect(await valorTarjeta(page, /NETO QUE RECIBES/)).toBe('371.133,00 €');
  });

  /**
   * HALLAZGO 12/09/2026 (MEDIO · contenido) — la cuota de plusvalía municipal no se puede
   * reconstruir desde la página, y el único porcentaje municipal que sí aparece da otra cifra.
   *
   * `calcularPlusvaliaMunicipal` liquida con el tipo ORIENTATIVO del 25 %
   * (`PLUSVALIA_MUNICIPAL_META.tipoOrientativo`), no con el máximo legal. Sobre el escenario
   * del CASO 22 eso son 80.000 × 0,08 × 25 % = 1.600,00 €, que es lo que la app cobra. Pero
   * en las 42.000 caracteres de texto de la página —bloque educativo incluido, que se monta
   * siempre en el DOM— el 25 % no aparece NI UNA VEZ, y el único tipo municipal escrito es
   * «hasta el máximo legal del 30%» (nota del DataReference, de
   * `PLUSVALIA_MUNICIPAL_META.nota`). Con ese 30 % la cuota serían 1.920,00 €: quien intente
   * comprobar el número con lo que la propia página le da, no llega.
   *
   * Es el hallazgo 671 del 10/09 —«los dos FAQPage daban el máximo legal del 30 % y no el
   * 25 % que la app aplica»— y el 729 del 11/09 —«la cuota era correcta y no se podía
   * reconstruir»—, cuya reparación NO llegó a esta app: `simulador-gastos-compraventa-garaje`,
   * `…-trastero` y `estimador-compraventa-inmueble` imprimen las dos cifras derivadas de la
   * constante («aplica un tipo del 25 % como referencia orientativa habitual; cada
   * ayuntamiento fija su propio tipo, con un máximo legal del 30 %») y esta no.
   *
   * Esperado: que el tipo aplicado aparezca en la página, derivado de la constante.
   */
  test('[786] la página nombra el tipo municipal con el que liquida la plusvalía', async ({ page }) => {
    await sembrarImporte12(page, 'Precio del local comercial', '400000');
    await page.getByRole('button', { name: /Vendedor/ }).click();
    await sembrarImporte12(page, 'Precio de compra original', '250000');
    await sembrarImporte12(page, 'Años de propiedad', '12');
    await sembrarImporte12(page, 'Valor catastral del suelo (€)', '80000');

    // La cuota que hay que poder reconstruir: 80.000 × 0,08 × 25 %
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('1600,00 €');

    // `textContent` y no `innerText`: el bloque educativo se monta siempre y se oculta por
    // CSS (así lo rastrea Googlebot), de modo que su texto también cuenta como «lo que la
    // página dice».
    const todo = ((await page.locator('body').textContent()) ?? '').replace(ESPACIO_DURO, ' ');
    // El 30 % del máximo legal sí está (esto pasa hoy):
    expect(todo).toContain('máximo legal del 30%');
    // El 25 % con el que se ha calculado, no. El [^\d,.] evita confundirlo con un «0,25%».
    expect(todo).toMatch(/(^|[^\d,.])25\s?%/);
  });

  /**
   * HALLAZGO 12/09/2026 (BAJO · contenido) — la tarjeta del ITP sigue negando en seco lo que
   * el recuadro de la misma pantalla acaba de matizar.
   *
   * El hallazgo 726 del 11/09 fue exactamente este texto: los textos de local comercial
   * «descartaban de plano un tipo que la ficha de esa misma comunidad documenta — el 1 % del
   * art. 121-11 de Aragón por adquirir un inmueble para INICIAR UNA ACTIVIDAD ECONÓMICA»,
   * que es el supuesto de quien compra un local para abrir un negocio. La reparación llegó al
   * párrafo del recuadro («Eso no agota los beneficios posibles — alguna comunidad tiene
   * tipos propios ligados a la ACTIVIDAD…») y al `faqJsonLd`, pero NO a la descripción de la
   * tarjeta del ITP, que es donde se lee la cifra: sigue diciendo «Tipo general — los locales
   * comerciales no tienen tipos reducidos».
   *
   * En Aragón, por tanto, la misma pantalla afirma las dos cosas.
   *
   * Esperado: que la tarjeta no niegue de plano los tipos reducidos.
   */
  test('[787] en Aragón la tarjeta del ITP no niega los tipos ligados a la actividad que su ficha documenta', async ({ page }) => {
    await page.locator('#select-ccaa').selectOption('aragon');
    await sembrarImporte12(page, 'Precio del local comercial', '300000');

    // Escala del art. 121-1, primer tramo: 300.000 × 8 % (esto pasa hoy)
    expect(await valorTarjeta(page, /^ITP/)).toBe('24.000,00 €');
    // La ficha de Aragón, en el recuadro de la izquierda, documenta el 1 % del art. 121-11
    const recuadro = page.locator('#select-ccaa').locator('xpath=../..');
    await expect(recuadro).toContainText('art. 121-11');
    await expect(recuadro).toContainText('iniciar una actividad económica');

    // Y la tarjeta donde se lee la cuota lo niega de plano:
    expect(await descripcionTarjeta(page, /^ITP/)).not.toContain('no tienen tipos reducidos');
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// RE-INSPECCIÓN 21/09/2026 — verificación de las tres reparaciones del 12/09 (785,
// 786 y 787) y tres casos NUEVOS sobre superficie que ninguna ronda anterior había
// pisado. Los tres se resolvieron A MANO antes de abrir el navegador.
//
// Las tres reparaciones del 12/09 se comprobaron VIVAS y sin efecto colateral:
//   · [785] comisión y gestoría del vendedor acotadas con Math.max(0, …) también con el
//     foco dentro. El CASO 25 lo extiende al campo que aquel test no tocó (la gestoría).
//   · [786] la tarjeta de la plusvalía imprime ahora «tipo municipal orientativo del 25 %»
//     junto a la cuota, derivado de PLUSVALIA_MUNICIPAL_META.tipoOrientativo (CASO 24).
//   · [787] la descripción de la tarjeta del ITP ya no niega de plano los tipos reducidos.
//
// Qué mira cada caso nuevo, y por qué:
//   · CASO 23 (normal)  — Comunidad Valenciana, que ninguna prueba del fichero recorría:
//     el tipo general bajó al 9 % el 01/06/2026 y su escala tiene un SEGUNDO tramo del
//     11 % por encima de 1.000.000 €. Con las tres ramas del comprador, que es donde está
//     la miga del local: ITP en segunda mano, IVA del 21 % en obra nueva y ese mismo IVA
//     con inversión del sujeto pasivo en la renuncia a la exención.
//   · CASO 24 (límite)  — la ganancia EXACTAMENTE en cero (rama `sinGananciaNiPerdida`,
//     abierta el 15/09/2026 por los hallazgos 823 y 845) con la comisión y la gestoría del
//     vendedor a cero. Ninguna prueba del fichero la había alcanzado.
//   · CASO 25 (rechazo) — el par catastral IMPOSIBLE (suelo > total), guarda nacida el
//     18/09/2026 con el hallazgo 900 y sin testigo aquí, y la gestoría del vendedor en
//     NEGATIVO con el foco dentro, que es el campo que la reparación del 785 acotó y que
//     su propio test no ejercitaba (solo probaba la comisión).
//
// De dónde sale cada cifra (ninguna de memoria):
//   · Valencia, tipo general 9 % y escala 9 % / 11 % → `ITP_CCAA.valencia` de
//     `data/itp-ccaa.ts`, cuyo `tipoGeneral` lo toma de `TIPOS_ITP_CCAA_2025` («Valencia»,
//     tipo 9) en `data/fiscal/inmuebles.ts`. AJD 1,5 % de la misma ficha.
//   · IVA del local, 21 % → `IVA_INMUEBLES_2025.local` (Ley 37/1992, art. 90: un local no
//     es inmueble residencial, así que no le alcanza el 10 % del art. 91.Uno.1.7º).
//   · Aranceles → `ARANCELES_NOTARIO` + `FACTURA_NOTARIAL` (horquilla ×1,5 a ×2, punto
//     medio ×1,75) y `ARANCELES_REGISTRO` + `REGISTRO_CONCEPTOS`, con el 21 % de IVA dentro.
//   · Plusvalía municipal → `COEFICIENTES_IIVTNU_2025` (10 años → 0,08) y el 25 % de
//     `PLUSVALIA_MUNICIPAL_META.tipoOrientativo`, vía `calcularPlusvaliaMunicipal`.
//   · Ganancia e IRPF → `calcularGananciaInmueble` (arts. 34-36 LIRPF) sobre
//     `TRAMOS_GANANCIAS_PATRIMONIALES_2025` (19 % hasta 6.000 · 21 % hasta 50.000 · …).
//
// Precisión: se comparan cadenas literales al CÉNTIMO, que es el orden de magnitud del
// defecto que vigilan (el hallazgo 594 era de un céntimo entre el total y su desglose).
//
// HALLAZGOS VIVOS de esta ronda, que el Inspector NO repara: van abajo con `test.fail()`,
// afirmando lo que DEBERÍA ocurrir, de modo que el fichero queda en VERDE.
// ═════════════════════════════════════════════════════════════════════════════

test.describe('RE-INSPECCIÓN 21/09/2026 — Valencia, la ganancia en cero y el par catastral imposible', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, TESTIGOS_12_09);
  });

  // ══════════════════════════════════════════════════════════════════════════
  // CASO 23 (NORMAL) — Comunidad Valenciana · 800.000 € · las tres ramas fiscales.
  //
  //   Notaría (ARANCELES_NOTARIO, RD 1426/1989) sobre 800.000 €:
  //     90,15 + 24.040,49×0,45 % + 30.050,60×0,15 % + 90.151,82×0,10 %
  //     + 450.759,07×0,05 % + 198.987,90×0,03 %            =        618,635830
  //     × 1,21 de IVA =                                             748,549354
  //     horquilla FACTURA_NOTARIAL: ×1,5 = 1.122,824031 · ×2 = 1.497,098709
  //     punto medio ×1,75 =                                       1.309,961370
  //   Registro (ARANCELES_REGISTRO, RD 1427/1989):
  //     24,04 + 42,070858 + 37,563250 + 67,613865 + 135,227721 + 39,797580
  //                                                        =        346,313274
  //     + 6,010121 de presentación + 3,005061 de nota simple =       355,328456
  //     × 1,21 de IVA =                                              429,947431
  //   Gestoría del comprador (valor inicial del campo) =             500,000000
  //
  //   (a) Segunda mano, exenta de IVA (art. 20.Uno.22º LIVA) → ITP. 800.000 € cae entero
  //       en el PRIMER tramo de la escala (hasta 1.000.000 al 9 %):
  //         ITP = 800.000 × 9 % = 72.000 → tipo efectivo 9,00 %
  //       Sin cuota gradual de AJD: la transmisión va por TPO.
  //       total = 72.000 + 1.309,96 + 429,95 + 500 =                74.239,910000
  //         → 74.239,91 / 800.000 = 9,280000 % → «9,28%»
  //       COSTE TOTAL = 800.000 + 74.239,91 =                      874.239,910000
  //
  //   (b) Obra nueva del promotor: IVA_INMUEBLES_2025.local = 21 % → 168.000, y AJD al
  //       1,5 % de ITP_CCAA.valencia → 12.000.
  //       total = 168.000 + 12.000 + 1.309,96 + 429,95 + 500 =     182.239,910000
  //         → 22,780000 % → «22,78%» ; COSTE TOTAL =               982.239,910000
  //
  //   (c) Renuncia a la exención (art. 20.Dos LIVA): MISMOS importes que la obra nueva
  //       —el tipo es el mismo— pero el comprador lo autoliquida por inversión del sujeto
  //       pasivo en vez de pagárselo al vendedor, y la ayuda del precio cambia de base
  //       (art. 78 LIVA, no el valor de referencia del art. 10 TRLITPAJD).
  //
  //   (d) 1.200.000 € alcanza el SEGUNDO tramo del 11 %:
  //         1.000.000×9 % + 200.000×11 % = 90.000 + 22.000 = 112.000
  //         tipo EFECTIVO = 112.000 / 1.200.000 = 9,333333 % → «9,33%», que no es ninguno
  //         de los dos nominales: por eso la etiqueta lleva dos decimales.
  // ══════════════════════════════════════════════════════════════════════════
  test('CASO 23 (normal) — Comunidad Valenciana, local de 800.000 €: ITP al 9 %, IVA del 21 % en obra nueva y en la renuncia, y el segundo tramo del 11 %', async ({ page }) => {
    await page.locator('#select-ccaa').selectOption('valencia');
    await sembrarImporte12(page, 'Precio del local comercial', '800000');

    // El recuadro de la comunidad publica los tipos NOMINALES y la escala, en formato español
    const panel = page.locator('text=ITP General').locator('xpath=ancestor::div[1]/ancestor::div[1]');
    await expect(panel).toContainText('9%');     // tipoGeneral de ITP_CCAA.valencia
    await expect(panel).toContainText('1,5%');   // AJD de ITP_CCAA.valencia
    await expect(page.locator('p[class*="infoCcaaNote"]').first())
      .toContainText('escala progresiva (9% → 11%)');

    // ── (a) Segunda mano: ITP al tipo general, sin AJD y sin IVA
    await page.getByRole('button', { name: /Segunda mano/ }).first().click();
    await expect(page.locator('h3', { hasText: /^ITP/ }).first()).toHaveText('ITP (9,00%)');
    expect(await valorTarjeta(page, /^ITP/)).toBe('72.000,00 €');
    await expect(page.locator('h3', { hasText: /^AJD/ })).toHaveCount(0);
    await expect(page.locator('h3', { hasText: /^IVA/ })).toHaveCount(0);
    // Y la descripción no niega de plano los reducidos ligados a la ACTIVIDAD (hallazgo 787)
    expect(await descripcionTarjeta(page, /^ITP/)).toContain('ACTIVIDAD');

    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('1309,96 €');
    expect(await descripcionTarjeta(page, 'Gastos de notaría')).toContain('1122,82 €');
    expect(await descripcionTarjeta(page, 'Gastos de notaría')).toContain('1497,10 €');
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('429,95 €');
    expect(await valorTarjeta(page, 'Gastos de gestoría')).toBe('500,00 €');
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('74.239,91 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toContain('9,28%');
    expect(await valorTarjeta(page, /COSTE TOTAL/)).toBe('874.239,91 €');

    // ── (b) Obra nueva: IVA del 21 % (local, no vivienda) + AJD del 1,5 %
    await page.getByRole('button', { name: /Obra nueva/ }).click();
    await expect(page.locator('h3', { hasText: /^IVA/ }).first()).toHaveText('IVA (21,00%)');
    expect(await valorTarjeta(page, /^IVA/)).toBe('168.000,00 €');
    expect(await descripcionTarjeta(page, /^IVA/)).toContain('deducible');
    await expect(page.locator('h3', { hasText: /^AJD/ }).first()).toHaveText('AJD (1,50%)');
    expect(await valorTarjeta(page, /^AJD/)).toBe('12.000,00 €');
    await expect(page.locator('h3', { hasText: /^ITP/ })).toHaveCount(0);
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('182.239,91 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toContain('22,78%');
    expect(await valorTarjeta(page, /COSTE TOTAL/)).toBe('982.239,91 €');

    // ── (c) Renuncia a la exención: mismo tipo, mismo AJD, distinto mecanismo
    await page.getByRole('button', { name: /renuncia IVA/ }).click();
    await expect(page.locator('h3', { hasText: /^IVA/ }).first()).toHaveText('IVA (renuncia · ISP) (21,00%)');
    expect(await valorTarjeta(page, /^IVA/)).toBe('168.000,00 €');
    expect(await descripcionTarjeta(page, /^IVA/)).toContain('inversión del sujeto pasivo');
    expect(await valorTarjeta(page, /^AJD/)).toBe('12.000,00 €');
    expect(await descripcionTarjeta(page, /^AJD/)).toContain('incrementado');
    await expect(page.locator('h3', { hasText: /^ITP/ })).toHaveCount(0);
    await expect(page.getByText('Renuncia a la exención de IVA (Art. 20.Dos LIVA)')).toBeVisible();
    // La base del IVA es la contraprestación pactada, no el valor de referencia (hallazgo 618)
    const ayuda = page
      .locator('input[aria-label="Precio del local comercial"]')
      .locator('xpath=following-sibling::p[1]');
    expect((await ayuda.innerText()).replace(/\s+/g, ' ')).toContain('Contraprestación pactada');

    // ── (d) El segundo tramo de la escala, el del 11 %
    await page.getByRole('button', { name: /Segunda mano/ }).first().click();
    await sembrarImporte12(page, 'Precio del local comercial', '1200000');
    await expect(page.locator('h3', { hasText: /^ITP/ }).first()).toHaveText('ITP (9,33%)');
    expect(await valorTarjeta(page, /^ITP/)).toBe('112.000,00 €');
  });

  // ══════════════════════════════════════════════════════════════════════════
  // CASO 24 (LÍMITE) — la ganancia patrimonial EXACTAMENTE en cero, con la comisión y la
  // gestoría del vendedor a cero.
  //
  //   venta 300.000 · compra 280.000 + 19.200 de gastos de aquella compra · 10 años ·
  //   suelo 40.000 · total catastral 100.000 · comisión 0 % · gestoría del vendedor 0
  //
  //   plusvalía (RDL 26/2021), por los dos métodos:
  //     objetivo = 40.000 × 0,08 (COEFICIENTES_IIVTNU_2025, 10 años) × 25 % =     800,00
  //     real     = (300.000 − 280.000) × 40.000/100.000 × 25 % =                2.000,00
  //     → gana el objetivo, 800,00 €
  //   valor de adquisición = 280.000 + 19.200 =                                299.200,00
  //   valor de transmisión = 300.000 − 0 de gastos − 800 de IIVTNU =           299.200,00
  //   ganancia = 299.200 − 299.200 =                                                 0,00
  //     → NI ganancia NI pérdida: `sinGananciaNiPerdida` (|ganancia| < medio céntimo).
  //       La rama de la pérdida sería falsa por partida doble —no se vende por debajo del
  //       coste y no hay nada que compensar en la declaración— y es justo lo que los
  //       hallazgos 823 y 845 corrigieron el 15/09/2026.
  //   IRPF = 0 → «SIN CUOTA», y aquí ese cero SÍ es un cero real: hay precio de compra.
  //   total gastos = 800 + 0 + 0 + 0 =                                             800,00
  //     → 800 / 300.000 = 0,266667 % → «0,27%»
  //   neto = 300.000 − 800 =                                                   299.200,00
  // ══════════════════════════════════════════════════════════════════════════
  test('CASO 24 (límite) — ganancia EXACTAMENTE cero con la comisión y la gestoría a cero: ni ganancia ni pérdida, y sin pérdida que compensar', async ({ page }) => {
    await sembrarImporte12(page, 'Precio del local comercial', '300000');
    await page.getByRole('button', { name: /Vendedor/ }).click();
    await sembrarImporte12(page, 'Precio de compra original', '280000');
    await sembrarImporte12(page, 'Impuestos y gastos que pagaste al comprarlo (€)', '19200');
    await sembrarImporte12(page, 'Años de propiedad', '10');
    await sembrarImporte12(page, 'Valor catastral del suelo (€)', '40000');
    await sembrarImporte12(page, 'Valor catastral total (suelo + construcción) (€)', '100000');
    await sembrarImporte12(page, 'Comisión de la inmobiliaria (%)', '0');
    await sembrarImporte12(page, 'Gestoría y certificados del vendedor (€)', '0');

    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('800,00 €');
    // El 25 % con el que se liquida va impreso junto a la cuota (hallazgo 786, reparado):
    // sin él, la cifra no se puede reconstruir con lo que la página dice.
    expect(await descripcionTarjeta(page, 'Plusvalía municipal')).toBe(
      'Método objetivo (más favorable), tipo municipal orientativo del 25 %',
    );

    expect(await valorTarjeta(page, 'Valor de adquisición')).toBe('299.200,00 €');
    expect(await valorTarjeta(page, 'Valor de transmisión')).toBe('299.200,00 €');

    // Ni «Ganancia patrimonial» ni «Pérdida patrimonial»: la tercera tarjeta
    await expect(page.locator('h3', { hasText: 'Sin ganancia ni pérdida' })).toHaveCount(1);
    await expect(page.locator('h3', { hasText: 'Pérdida patrimonial' })).toHaveCount(0);
    await expect(page.locator('h3', { hasText: /^Ganancia patrimonial/ })).toHaveCount(0);
    expect(await valorTarjeta(page, 'Sin ganancia ni pérdida')).toBe('0,00 €');
    const razon = await descripcionTarjeta(page, 'Sin ganancia ni pérdida');
    expect(razon).toContain('Vendes exactamente por el valor de adquisición');
    // Y NO la frase de la pérdida, que mandaría a una casilla que este caso no genera
    expect(razon).not.toContain('se puede compensar');

    expect(await valorTarjeta(page, 'IRPF sobre la ganancia')).toBe('SIN CUOTA');
    expect(await valorTarjeta(page, 'Comisión de la inmobiliaria')).toBe('0,00 €');
    await expect(page.locator('h3', { hasText: /Total gastos de la venta/ })).toHaveText('Total gastos de la venta');
    expect(await valorTarjeta(page, /Total gastos de la venta/)).toBe('800,00 €');
    expect(await descripcionTarjeta(page, /Total gastos de la venta/)).toContain('0,27%');
    await expect(page.locator('h3', { hasText: /NETO QUE RECIBES/ })).toHaveText('NETO QUE RECIBES');
    expect(await valorTarjeta(page, /NETO QUE RECIBES/)).toBe('299.200,00 €');
  });

  // ══════════════════════════════════════════════════════════════════════════
  // CASO 25 (RECHAZO) — dos datos que no pueden entrar en un cálculo.
  //
  // Base: venta 300.000 · compra 250.000 · 0 € de gastos de adquisición · 10 años ·
  //       comisión 0 % · gestoría del vendedor 0.
  //
  //   (a) Par catastral IMPOSIBLE — suelo 80.000 > total 50.000. El valor catastral total
  //       INCLUYE el suelo por definición, así que ese par no describe ningún inmueble: es
  //       el despiste de intercambiar dos campos que salen consecutivos del recibo del IBI.
  //       `calcularPlusvaliaMunicipal` lo detecta (`parCatastralImposible`), NO calcula el
  //       método real —antes lo convertía en «todo suelo» y liquidaba, hallazgo 900 del
  //       18/09/2026— y se queda en el objetivo, que solo necesita el suelo:
  //         objetivo = 80.000 × 0,08 × 25 % = 1.600,00 € ; y la tarjeta manda a revisar
  //         los dos campos en vez de callarse.
  //
  //   (b) El mismo par AL DERECHO — suelo 50.000, total 80.000:
  //         objetivo = 50.000 × 0,08 × 25 % =                              1.000,00
  //         real     = (300.000 − 250.000) × 50.000/80.000 × 25 % =        7.812,50
  //         → gana el objetivo, 1.000,00 €. El despiste movía la cifra 600 € hacia arriba.
  //
  //   (c) Gestoría del vendedor NEGATIVA con el foco dentro (−2.000). Es el campo que la
  //       reparación del hallazgo 785 acotó con Math.max(0, …) y que su propio test no
  //       ejercitaba: allí solo se probó la comisión. Acotada a 0:
  //         valor de transmisión = 300.000 − 0 − 1.000 =                 299.000,00
  //         ganancia = 299.000 − 250.000 =                                49.000,00
  //         IRPF = 6.000×19 % + 43.000×21 % = 1.140 + 9.030 =             10.170,00
  //         total gastos = 1.000 + 0 + 0 + 10.170 =                       11.170,00
  //           → 11.170 / 300.000 = 3,723333 % → «3,72%»
  //         neto = 300.000 − 11.170 =                                    288.830,00
  //       Y al salir del campo, el min = 0 del NumberInput lo deja en «0» sin mover una
  //       sola cifra: dentro y fuera del foco, el mismo signo recibe el mismo trato.
  // ══════════════════════════════════════════════════════════════════════════
  test('CASO 25 (rechazo) — un par catastral imposible no liquida por el método real, y una gestoría negativa no abarata la venta', async ({ page }) => {
    await sembrarImporte12(page, 'Precio del local comercial', '300000');
    await page.getByRole('button', { name: /Vendedor/ }).click();
    await sembrarImporte12(page, 'Precio de compra original', '250000');
    await sembrarImporte12(page, 'Impuestos y gastos que pagaste al comprarlo (€)', '0');
    await sembrarImporte12(page, 'Años de propiedad', '10');
    await sembrarImporte12(page, 'Comisión de la inmobiliaria (%)', '0');
    await sembrarImporte12(page, 'Gestoría y certificados del vendedor (€)', '0');

    // ── (a) suelo 80.000 > total 50.000
    await sembrarImporte12(page, 'Valor catastral del suelo (€)', '80000');
    await sembrarImporte12(page, 'Valor catastral total (suelo + construcción) (€)', '50000');
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('1600,00 €');
    const avisoPar = await descripcionTarjeta(page, 'Plusvalía municipal');
    expect(avisoPar).toContain('el valor catastral del suelo no puede superar al total');
    expect(avisoPar).toContain('revisa los dos campos del recibo del IBI');
    // No se presenta como el método «más favorable»: no ha habido comparación que ganar.
    expect(avisoPar).not.toContain('Método real');
    expect(avisoPar).not.toContain('más favorable');

    // ── (b) el mismo par, al derecho
    await sembrarImporte12(page, 'Valor catastral del suelo (€)', '50000');
    await sembrarImporte12(page, 'Valor catastral total (suelo + construcción) (€)', '80000');
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('1000,00 €');
    expect(await descripcionTarjeta(page, 'Plusvalía municipal')).toBe(
      'Método objetivo (más favorable), tipo municipal orientativo del 25 %',
    );

    // ── (c) gestoría del vendedor negativa, VIVA en el campo (sin blur)
    await sembrarImporte12(page, 'Gestoría y certificados del vendedor (€)', '-2000', { blur: false });
    const gestoria = page.locator('input[aria-label="Gestoría y certificados del vendedor (€)"]');
    await esperarValorEnReact(page, gestoria, '-2000');   // el −2.000 está de verdad en el estado
    expect(await valorTarjeta(page, 'Valor de transmisión')).toBe('299.000,00 €');
    expect(await valorTarjeta(page, 'Ganancia patrimonial')).toBe('49.000,00 €');
    expect(await valorTarjeta(page, 'IRPF sobre la ganancia')).toBe('10.170,00 €');
    expect(await valorTarjeta(page, /Total gastos de la venta/)).toBe('11.170,00 €');
    expect(await descripcionTarjeta(page, /Total gastos de la venta/)).toContain('3,72%');
    expect(await valorTarjeta(page, /NETO QUE RECIBES/)).toBe('288.830,00 €');

    // Al salir del campo no cambia NADA: es la prueba de que el acotado no depende del foco
    await gestoria.blur();
    await expect(gestoria).toHaveValue('0');
    expect(await valorTarjeta(page, 'Valor de transmisión')).toBe('299.000,00 €');
    expect(await valorTarjeta(page, 'IRPF sobre la ganancia')).toBe('10.170,00 €');
    expect(await valorTarjeta(page, /NETO QUE RECIBES/)).toBe('288.830,00 €');
  });

  // ───────────────────────────────────────────────────────────────────────────
  // REGRESIÓN — los tres hallazgos del 21/09/2026 (1159, 1160 y 1161), REPARADOS el 21/09.
  // Se escribieron con `test.fail()` afirmando lo que DEBERÍA ocurrir; al repararlos se les
  // quitó la marca sin tocar ninguna aserción, así que lo que hoy pasa en verde es
  // exactamente lo que ayer fallaba en rojo.
  //
  // Los tres fallan con aserciones NO reintentadas (leen innerText / inputValue y comparan),
  // para que el fallo sea inmediato: un `expect(...).toHaveText()` que agota el timeout
  // Playwright lo cuenta como fallo REAL aunque haya `test.fail()`.
  // ───────────────────────────────────────────────────────────────────────────

  /**
   * ❌ [H-21/09-a] (MEDIO · cálculo) — un año de propiedad IMPOSIBLE se convierte en un
   * supuesto fiscal válido y caro con solo pasar al campo siguiente.
   *
   * Con «−1» y el foco DENTRO la app acierta: la guarda `aniosNegativo` del `useMemo`
   * rechaza el dato, la plusvalía dice «Sin calcular» y el neto se rotula PARCIAL
   * (360.045,00 €). Al hacer blur, `NumberInput.handleBlur` reescribe el campo a su `min`,
   * que aquí es 0 — y el 0 NO es neutro en este campo: es la reventa antes de cumplir el
   * año, con el tercer coeficiente más alto de COEFICIENTES_IIVTNU_2025 (0,14). La app
   * liquida entonces 2.800,00 € de IIVTNU a partir de un dato que ella misma acababa de
   * rechazar, y presenta el neto como DEFINITIVO (357.889,00 €). El mismo −1 recibe dos
   * tratamientos según cuándo se mire, que es exactamente la forma del hallazgo 764 que
   * esta app ya reparó dentro del motor.
   *
   * Es el hallazgo 822/844, reparado el 15/09/2026 en `simulador-gastos-compraventa-garaje`
   * y en `…-trastero` con `acotarAlSalir={false}` —la salida que se añadió al `NumberInput`
   * para esto y cuyo docstring nombra precisamente este campo— y NO propagado aquí ni a
   * `estimador-compraventa-inmueble`. La reparación va en el control, no en el motor: la
   * guarda de la app ya sabe decidir sobre un año negativo.
   *
   * Esperado: que el blur no toque el −1 y que la app siga diciendo lo mismo que decía con
   * el foco dentro.
   */
  test('[H-21/09-a] el blur no convierte un año NEGATIVO en la reventa antes del año', async ({ page }) => {
    await sembrarImporte12(page, 'Precio del local comercial', '400000');
    await page.getByRole('button', { name: /Vendedor/ }).click();
    await sembrarImporte12(page, 'Precio de compra original', '250000');
    await sembrarImporte12(page, 'Impuestos y gastos que pagaste al comprarlo (€)', '30000');
    await sembrarImporte12(page, 'Valor catastral del suelo (€)', '80000');
    await sembrarImporte12(page, 'Valor catastral total (suelo + construcción) (€)', '200000');
    await sembrarImporte12(page, 'Comisión de la inmobiliaria (%)', '4');
    await sembrarImporte12(page, 'Gestoría y certificados del vendedor (€)', '1500');

    const anios = page.locator('input[aria-label="Años de propiedad"]');
    await sembrarImporte12(page, 'Años de propiedad', '-1', { blur: false });

    // Con el foco dentro la app ya acierta (esto pasa HOY):
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('Sin calcular');
    expect(await valorTarjeta(page, /NETO QUE RECIBES/)).toBe('360.045,00 €');

    await anios.blur();

    // HOY: el campo queda en «0», la plusvalía salta a 2.800,00 € y el neto se da por firme
    // en 357.889,00 €. Lo que debería pasar:
    expect(await anios.inputValue()).toBe('-1');
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('Sin calcular');
    expect(await valorTarjeta(page, /NETO QUE RECIBES/)).toBe('360.045,00 €');
    expect(await page.locator('h3', { hasText: /NETO QUE RECIBES/ }).innerText())
      .toBe('NETO QUE RECIBES (PARCIAL)');
  });

  /**
   * ❌ [H-21/09-b] (ALTO · contenido) — sin el precio de compra original, la pestaña del
   * vendedor afirma que no se debe IRPF.
   *
   * Basta con escribir el precio de venta —que es el campo COMPARTIDO con la pestaña del
   * comprador, así que suele venir ya relleno— y abrir «Vendedor»: la app pinta
   * «Ganancia patrimonial 0,00 €» y, debajo, «IRPF sobre la ganancia — SIN CUOTA» con la
   * variante `success` (tarjeta VERDE). Ninguna de las dos cosas es cierta: la ganancia no
   * es cero, es desconocida, y el IRPF no es que no se deba, es que no se ha podido
   * calcular. El aviso del neto parcial solo nombra la plusvalía municipal («No descuenta
   * la plusvalía municipal…»), de modo que el impuesto que falta en el neto y que nadie
   * menciona es precisamente el IRPF.
   *
   * Es la misma forma del hallazgo reparado aquí el 08/09/2026 —donde el NaN de las
   * amortizaciones pintaba «SIN CUOTA» en verde sobre una ganancia de 100.900 €— y el
   * «efecto familia del 483 / hallazgo 428» que `…-garaje`, `…-trastero` y
   * `estimador-compraventa-inmueble` ya cierran con el campo `irpfCalculado`: allí la
   * tarjeta dice «Sin calcular», en gris, con el texto «Falta el precio de compra original.
   * Este impuesto NO está incluido en el neto de abajo.», y la tarjeta de la ganancia solo
   * se pinta si hay ganancia. Esta app no tiene ese campo.
   *
   * Esperado: que el cero que viene de un dato que falta no se presente como una exención.
   */
  test('[H-21/09-b] sin precio de compra, el IRPF dice «Sin calcular» y no «SIN CUOTA» en verde', async ({ page }) => {
    await sembrarImporte12(page, 'Precio del local comercial', '300000');
    await page.getByRole('button', { name: /Vendedor/ }).click();

    // La plusvalía sí lo hace bien: dice «Sin calcular» y nombra los tres campos que faltan
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('Sin calcular');
    expect(await descripcionTarjeta(page, 'Plusvalía municipal')).toContain('el precio de compra original');

    // HOY: «Ganancia patrimonial 0,00 €» y «SIN CUOTA» en una tarjeta `success`.
    expect(await page.locator('h3', { hasText: /^Ganancia patrimonial/ }).count()).toBe(0);
    expect(await valorTarjeta(page, 'IRPF sobre la ganancia')).toBe('Sin calcular');
    expect(await descripcionTarjeta(page, 'IRPF sobre la ganancia')).toContain('precio de compra');
  });

  /**
   * ❌ [H-21/09-c] (BAJO · contenido) — la casilla del IVA del recuadro de la comunidad
   * perdió su símbolo de porcentaje, y lo perdió EN UNA REPARACIÓN.
   *
   * El recuadro publica tres cifras en fila: «ITP General 9%», «AJD 1,5%» y «IVA
   * (comercial) 21». La tercera va sin el «%», así que un 21 desnudo queda entre dos
   * porcentajes. Hasta el 11/09/2026 la línea era `{IVA_LOCAL_COMERCIAL}%` e imprimía
   * «21%»; al condicionarla por territorio para el hallazgo 725 —para que en Canarias,
   * Ceuta y Melilla dijera «IGIC/IPSI · No calculado»— el sufijo se quedó fuera del
   * ternario (commit 21a13c6b). La hermana `…-nave-industrial`, de la que se copió el
   * patrón, sí lo conserva: `${formatTipoNominal(IVA_NAVE_INDUSTRIAL)}%`.
   *
   * Esperado: el mismo formato que sus dos vecinas de fila.
   */
  test('[H-21/09-c] la casilla del IVA del recuadro de la comunidad lleva el símbolo de porcentaje', async ({ page }) => {
    await page.locator('#select-ccaa').selectOption('valencia');

    const casilla = page
      .locator('span[class*="infoCcaaLabel"]', { hasText: 'IVA (comercial)' })
      .locator('xpath=following-sibling::span[1]');
    // Sus dos vecinas de fila sí lo llevan (esto pasa HOY):
    const itp = page
      .locator('span[class*="infoCcaaLabel"]', { hasText: 'ITP General' })
      .locator('xpath=following-sibling::span[1]');
    expect(await itp.innerText()).toBe('9%');

    // HOY imprime «21» a secas:
    expect(await casilla.innerText()).toBe('21%');
  });
});

/**
 * Reparación del 23/09/2026 — hueco A3 del testigo de familia (`tests/familias/compraventa.spec.ts`).
 *
 * Con un porcentaje de comisión ilegible («3.5.0»), el neto ya avisaba de que faltaba
 * descontarla, pero su propia tarjeta publicaba «0,00 €»: un cero falso al lado de un aviso
 * que decía lo contrario. Garaje y trastero la esconden; aquí se pinta «Sin leer», como la
 * gestoría del comprador de esta misma app. El testigo de familia no lo ve porque mide la
 * cifra FINAL de cada panel, no las tarjetas del desglose.
 *
 *   precio 400.000 · comisión 3 % → 400.000 × 3 % = 12.000,00 € (control)
 */
test.describe('Reparación 23/09/2026 — la tarjeta de una comisión ilegible', () => {
  test('[A3] una comisión ilegible dice «Sin leer» y no publica «0,00 €»', async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, TESTIGOS_12_09);
    await sembrarImporte12(page, 'Precio del local comercial', '400000');
    await page.getByRole('button', { name: 'Vendedor', exact: true }).click();

    // Control: legible, publica el importe.
    await sembrarImporte12(page, 'Comisión de la inmobiliaria (%)', '3');
    expect(await valorTarjeta(page, /^Comisión de la inmobiliaria$/)).toBe('12.000,00 €');

    await sembrarImporte12(page, 'Comisión de la inmobiliaria (%)', '3.5.0');
    expect(await valorTarjeta(page, /^Comisión de la inmobiliaria$/)).toBe('Sin leer');
    expect(await descripcionTarjeta(page, /^Comisión de la inmobiliaria$/)).toContain(
      'no se ha podido leer',
    );
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// RE-INSPECCIÓN 23/09/2026 — la app de la familia «Compraventa inmobiliaria» que MÁS
// reparaciones recibió el 23/09 (0bff1872 · A1, 95187231 · A2, f654e4b8 · A3, 758e053f · C1,
// sobre cfe091a7 del 22/09).
//
// Batería previa: 38/38 en verde y ningún `test.fail()` vivo. Los cuatro huecos cierran con
// el caso literal de su commit (BASE del testigo de familia: neto 182.803,00 €; A1 → 179.399,00
// y «el neto real es MAYOR»; A2 → 187.003,00 y «será menor»; A3 → «Sin leer»; C1 en la BASE R
// → 192.187,00 y «el neto real es MAYOR»). El testigo `tests/familias/compraventa.spec.ts` ya
// mide la cifra FINAL de cada campo y NO se repite aquí: este bloque mira las tarjetas de en
// medio, las combinaciones de dos ilegibles, la PÉRDIDA y el campo exclusivo de esta app.
//
// De dónde sale CADA cifra (ninguna de memoria):
//   · Escalas de ITP de Asturias (8/9/10 %), Extremadura (8/10/11 %) y el 6 % plano de
//     Navarra, y el AJD de Asturias (1,2 %): `ITP_CCAA` de `data/itp-ccaa.ts`, que deriva el
//     tipo general de `TIPOS_ITP_CCAA_2025` (`data/fiscal/inmuebles.ts`).
//   · IVA del local: `IVA_INMUEBLES_2025.local` (21 %).
//   · Notaría: `ARANCELES_NOTARIO` (RD 1426/1989) × 1,21 de IVA × 1,75 (punto medio de la
//     horquilla 1,5–2 de `FACTURA_NOTARIAL`). Registro: `ARANCELES_REGISTRO` (RD 1427/1989)
//     + `REGISTRO_CONCEPTOS` (6,010121 + 3,005061) × 1,21.
//   · Plusvalía: `COEFICIENTES_IIVTNU_2025` y `PLUSVALIA_MUNICIPAL_META.tipoOrientativo` (25 %),
//     por los dos métodos de `calcularPlusvaliaMunicipal` (art. 107.4 y 107.5 TRLRHL).
//   · IRPF: `TRAMOS_GANANCIAS_PATRIMONIALES_2025` (19 % hasta 6.000 · 21 % hasta 50.000 ·
//     23 % hasta 200.000 · 27 % hasta 300.000 · 30 % el resto) sobre la fórmula del art. 35
//     LIRPF y el art. 40 RIRPF de `data/fiscal/ganancia-inmueble.ts`.
//
// Los hallazgos (1257-1266) se repararon el 23/09/2026 y sus casos quedan como regresión, sin
// `test.fail()`. Todas las aserciones previas a la del defecto son cifras que la reparación no
// podía mover; si una cayera, el caso fallaría por la preparación.
// ═════════════════════════════════════════════════════════════════════════════

const ILEGIBLE_2309 = '2.000.50';

/** Título y descripción de la tarjeta del neto, que es donde tiene que estar el aviso. */
async function avisoNeto2309(page: Page): Promise<string> {
  const h3 = page.locator('h3', { hasText: /^NETO QUE RECIBES/ }).first();
  const titulo = (await h3.innerText()).trim();
  return `${titulo} · ${await descripcionTarjeta(page, /^NETO QUE RECIBES/)}`;
}

/**
 * La BASE del testigo de familia, con el perfil «Local afecto a actividad» (el único en el que
 * existe el campo de amortizaciones):
 *   Madrid · 200.000 € · compra 150.000 · gastos de aquella compra 15.000 · amortizaciones
 *   20.000 · 10 años · suelo 40.000 · total 100.000 · comisión 3 % · gestoría de la venta 500.
 *
 * Resuelto a mano:
 *   plusvalía objetivo = 40.000 × 0,08 (10 años) × 25 % =                          800,00
 *   plusvalía real     = 50.000 × (40.000 / 100.000) × 25 % =                    5.000,00
 *   → gana el OBJETIVO
 *   valor de transmisión = 200.000 − 6.000 − 500 − 800 =                       192.700,00
 *   valor de adquisición = 150.000 + 15.000 − 20.000 =                         145.000,00
 *   ganancia = 47.700 → IRPF = 1.140 + 41.700 × 21 % =                           9.897,00
 *   neto = 200.000 − (800 + 6.000 + 500 + 9.897) =                             182.803,00
 */
async function prepararBaseFamilia2309(page: Page, compra = '150000'): Promise<void> {
  await sembrarImporte12(page, 'Precio del local comercial', '200000');
  await page.getByRole('button', { name: 'Vendedor', exact: true }).click();
  await page.getByRole('button', { name: /Local afecto a actividad/ }).click();
  await sembrarImporte12(page, 'Precio de compra original', compra);
  await sembrarImporte12(page, 'Impuestos y gastos que pagaste al comprarlo (€)', '15000');
  await sembrarImporte12(page, 'Amortizaciones acumuladas deducidas (€)', '20000');
  await sembrarImporte12(page, 'Años de propiedad', '10');
  await sembrarImporte12(page, 'Valor catastral del suelo (€)', '40000');
  await sembrarImporte12(page, 'Valor catastral total (suelo + construcción) (€)', '100000');
  await sembrarImporte12(page, 'Comisión de la inmobiliaria (%)', '3');
  await sembrarImporte12(page, 'Gestoría y certificados del vendedor (€)', '500');
}

test.describe('RE-INSPECCIÓN 23/09/2026 — Asturias, Extremadura y Navarra, y la familia tras A1, A2, A3 y C1', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, TESTIGOS_12_09);
  });

  // ══════════════════════════════════════════════════════════════════════════
  // Lo que las reparaciones del 23/09 dejaron BIEN y el testigo de familia no mira: la
  // dirección en la tarjeta del IRPF (TECHO/SUELO), el rótulo del valor de adquisición, que
  // el perfil «no afecto» apague de verdad las amortizaciones —con el texto ilegible aún
  // guardado en el estado—, que los campos VACÍOS no disparen ningún aviso, y la
  // concordancia «faltan los años de propiedad» (que en la hermana garaje falla).
  //
  //   A1 · gastos «2.000.50» → valor de adquisición 130.000 → ganancia 62.700
  //        IRPF = 1.140 + 9.240 + 12.700 × 23 % =                               13.301,00 (TECHO)
  //   A2 · amortizaciones «2.000.50» → valor de adquisición 165.000 → ganancia 27.700
  //        IRPF = 1.140 + 21.700 × 21 % =                                        5.697,00 (SUELO)
  //        neto = 200.000 − (800 + 6.000 + 500 + 5.697) =                       187.003,00
  //   «no afecto» con el texto ilegible guardado: las amortizaciones valen 0 y el campo no se
  //        pinta → mismo neto, 187.003,00, pero DEFINITIVO.
  //   VACÍOS (amortizaciones, gastos, total y gestoría): valor de adquisición 150.000 ·
  //        plusvalía 800 por el objetivo («falta el valor catastral total para comparar») ·
  //        transmisión 200.000 − 6.000 − 800 = 193.200 → ganancia 43.200
  //        IRPF = 1.140 + 37.200 × 21 % = 8.952 → neto = 200.000 − 15.752 =     184.248,00
  // ══════════════════════════════════════════════════════════════════════════
  test('A1 y A2 en la tarjeta del IRPF, el perfil «no afecto» apaga las amortizaciones, y lo VACÍO no avisa de nada', async ({ page }) => {
    await prepararBaseFamilia2309(page);
    expect(await valorTarjeta(page, /^NETO QUE RECIBES/)).toBe('182.803,00 €');
    expect(await valorTarjeta(page, 'IRPF sobre la ganancia')).toBe('9897,00 €');

    // A1 — la cuota es un TECHO, y el valor de adquisición no dice que suma lo que no leyó.
    await sembrarImporte12(page, 'Impuestos y gastos que pagaste al comprarlo (€)', ILEGIBLE_2309);
    expect(await valorTarjeta(page, 'IRPF sobre la ganancia')).toBe('13.301,00 €');
    expect(await descripcionTarjeta(page, 'IRPF sobre la ganancia')).toMatch(/real es menor/);
    expect(await valorTarjeta(page, 'Valor de adquisición')).toBe('130.000,00 €');
    expect(await descripcionTarjeta(page, 'Valor de adquisición')).toContain(
      'no se han podido leer y no están sumados',
    );
    await sembrarImporte12(page, 'Impuestos y gastos que pagaste al comprarlo (€)', '15000');

    // A2 — la cuota es un SUELO, y el valor de adquisición dice que no las ha restado.
    await sembrarImporte12(page, 'Amortizaciones acumuladas deducidas (€)', ILEGIBLE_2309);
    expect(await valorTarjeta(page, 'IRPF sobre la ganancia')).toBe('5697,00 €');
    expect(await descripcionTarjeta(page, 'IRPF sobre la ganancia')).toMatch(/real (?:es|puede ser) mayor/);
    expect(await valorTarjeta(page, 'Valor de adquisición')).toBe('165.000,00 €');
    expect(await descripcionTarjeta(page, 'Valor de adquisición')).toContain('no están restadas');
    expect(await valorTarjeta(page, /^NETO QUE RECIBES/)).toBe('187.003,00 €');

    // «No afecto»: el campo desaparece y su texto ilegible deja de pesar y de avisar.
    await page.getByRole('button', { name: /Local no afecto/ }).click();
    await expect(page.locator('input[aria-label="Amortizaciones acumuladas deducidas (€)"]')).toHaveCount(0);
    expect(await valorTarjeta(page, /^NETO QUE RECIBES/)).toBe('187.003,00 €');
    expect(await avisoNeto2309(page)).toBe(
      'NETO QUE RECIBES · Precio de venta menos impuestos, comisión y gestoría',
    );
    expect(await descripcionTarjeta(page, 'IRPF sobre la ganancia')).toMatch(/^Base del ahorro/);
    expect(await descripcionTarjeta(page, 'Valor de adquisición')).toBe(
      'Precio de compra + impuestos y gastos de aquella compra',
    );

    // De vuelta a «afecto», el texto sigue ahí y el aviso vuelve con él.
    await page.getByRole('button', { name: /Local afecto a actividad/ }).click();
    await expect(page.locator('input[aria-label="Amortizaciones acumuladas deducidas (€)"]')).toHaveValue(
      ILEGIBLE_2309,
    );
    expect(await descripcionTarjeta(page, 'IRPF sobre la ganancia')).toMatch(/real (?:es|puede ser) mayor/);

    // Los opcionales VACÍOS: vacío no es ilegible, y el neto sale definitivo.
    await sembrarImporte12(page, 'Amortizaciones acumuladas deducidas (€)', '');
    await sembrarImporte12(page, 'Impuestos y gastos que pagaste al comprarlo (€)', '');
    await sembrarImporte12(page, 'Valor catastral total (suelo + construcción) (€)', '');
    await sembrarImporte12(page, 'Gestoría y certificados del vendedor (€)', '');
    expect(await descripcionTarjeta(page, 'Plusvalía municipal (IIVTNU)')).toBe(
      'Método objetivo, tipo municipal orientativo del 25 % (falta el valor catastral total para comparar)',
    );
    expect(await valorTarjeta(page, 'Valor de adquisición')).toBe('150.000,00 €');
    expect(await valorTarjeta(page, 'IRPF sobre la ganancia')).toBe('8952,00 €');
    expect(await valorTarjeta(page, /^NETO QUE RECIBES/)).toBe('184.248,00 €');
    expect(await avisoNeto2309(page)).toBe(
      'NETO QUE RECIBES · Precio de venta menos impuestos, comisión y gestoría',
    );
    const panel = (await page.locator('[class*="resultsInner"]').first().innerText()).replace(/\s+/g, ' ');
    expect(panel).not.toMatch(/no se ha(n)? podido leer|legible/);

    // Concordancia: «faltan los años de propiedad», en plural.
    await sembrarImporte12(page, 'Años de propiedad', '');
    expect(await descripcionTarjeta(page, 'Plusvalía municipal (IIVTNU)')).toBe(
      'No calculada (faltan los años de propiedad)',
    );
  });

  // ══════════════════════════════════════════════════════════════════════════
  // CASO 26 (NORMAL) — ASTURIAS, local de 420.000 €, que ninguna vuelta había liquidado.
  //
  //   COMPRADOR
  //   ITP, escala de `ITP_CCAA.asturias` (8 % hasta 300.000 · 9 % hasta 500.000 · 10 %):
  //     300.000 × 8 % + 120.000 × 9 % = 24.000 + 10.800 =                        34.800,00
  //     tipo EFECTIVO = 34.800 / 420.000 = 8,285714 % → «ITP (8,29%)»
  //   Notaría, arancel sobre 420.000:
  //     90,15 + 24.040,49 × 0,45 % + 30.050,60 × 0,15 % + 90.151,82 × 0,10 %
  //     + 269.746,97 × 0,05 % = 468,433410 × 1,21 = 566,804426
  //     ×1,5 = 850,206639 · ×2 = 1.133,608852 · ×1,75 =                              991,91
  //   Registro: 24,04 + 42,070858 + 37,563250 + 67,613865 + 269.746,97 × 0,03 %
  //     = 252,212064 + 9,015182 = 261,227246 × 1,21 =                                316,08
  //   Total 2ª mano = 34.800 + 991,91 + 316,08 + 500 = 36.607,99 → 8,716188 % → «8,72%»
  //     COSTE TOTAL =                                                            456.607,99
  //   Obra nueva: IVA 21 % = 88.200 · AJD 1,2 % = 5.040 → «AJD (1,20%)»
  //     total = 88.200 + 5.040 + 991,91 + 316,08 + 500 = 95.047,99 → «22,63%»
  //     COSTE TOTAL =                                                            515.047,99
  //
  //   VENDEDOR «afecto»: compra 200.000 · gastos de aquella compra 16.000 · amortizaciones
  //   30.000 · 12 años · suelo 60.000 · total 150.000 · comisión 4 % · gestoría 600.
  //     plusvalía objetivo = 60.000 × 0,08 × 25 % = 1.200 · real = 220.000 × 0,4 × 25 %
  //       = 22.000 → gana el OBJETIVO:                                              1.200,00
  //     comisión = 420.000 × 4 % =                                                16.800,00
  //     valor de transmisión = 420.000 − 16.800 − 600 − 1.200 =                  401.400,00
  //     valor de adquisición = 200.000 + 16.000 − 30.000 =                       186.000,00
  //     ganancia =                                                               215.400,00
  //     IRPF = 1.140 + 9.240 + 150.000 × 23 % + 15.400 × 27 % (tramo del 27 %,
  //       que ninguna vuelta había pisado) = 1.140 + 9.240 + 34.500 + 4.158 =     49.038,00
  //     total = 1.200 + 16.800 + 600 + 49.038 = 67.638 → 16,104286 % → «16,10%»
  //     neto =                                                                   352.362,00
  //   El mismo vendedor «no afecto» (sin minorar): adquisición 216.000 → ganancia 185.400
  //     IRPF = 1.140 + 9.240 + 135.400 × 23 % =                                   41.522,00
  //     neto = 420.000 − 60.122 =                                                359.878,00
  //   Las amortizaciones cuestan 7.516,00 € de IRPF = 15.400 × 27 % + 14.600 × 23 %.
  // ══════════════════════════════════════════════════════════════════════════
  test('CASO 26 (normal) — Asturias, local de 420.000 €: la escala del 8/9 %, y unas amortizaciones que llevan la ganancia al tramo del 27 %', async ({ page }) => {
    expect(ITP_CCAA.asturias.tramosProgresivos).toEqual([
      { hasta: 300000, tipo: 8 },
      { hasta: 500000, tipo: 9 },
      { hasta: Infinity, tipo: 10 },
    ]);
    expect(ITP_CCAA.asturias.ajd).toBe(1.2);
    expect(IVA_INMUEBLES_2025.local).toBe(21);
    expect(TRAMOS_GANANCIAS_PATRIMONIALES_2025[3]).toEqual({ hasta: 300000, tipo: 27 });
    expect(COEFICIENTES_IIVTNU_2025.find((c) => c.anios === 12)?.coeficiente).toBe(0.08);
    expect(PLUSVALIA_MUNICIPAL_META.tipoOrientativo).toBe(25);

    await page.selectOption('#select-ccaa', 'asturias');
    await sembrarImporte12(page, 'Precio del local comercial', '420000');

    expect(await page.locator('h3', { hasText: /^ITP \(/ }).first().innerText()).toBe('ITP (8,29%)');
    expect(await valorTarjeta(page, /^ITP \(/)).toBe('34.800,00 €');
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('991,91 €');
    expect(await descripcionTarjeta(page, 'Gastos de notaría')).toContain('entre 850,21 € y 1133,61 €');
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('316,08 €');
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('36.607,99 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toBe('8,72% sobre el precio de compra');
    expect(await valorTarjeta(page, 'COSTE TOTAL')).toBe('456.607,99 €');

    await page.getByRole('button', { name: /Obra nueva/ }).click();
    expect(await valorTarjeta(page, 'IVA (21,00%)')).toBe('88.200,00 €');
    expect(await page.locator('h3', { hasText: /^AJD \(/ }).first().innerText()).toBe('AJD (1,20%)');
    expect(await valorTarjeta(page, /^AJD \(/)).toBe('5040,00 €');
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('95.047,99 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toBe('22,63% sobre el precio de compra');
    expect(await valorTarjeta(page, 'COSTE TOTAL')).toBe('515.047,99 €');

    await page.getByRole('button', { name: 'Vendedor', exact: true }).click();
    await page.getByRole('button', { name: /Local afecto a actividad/ }).click();
    await sembrarImporte12(page, 'Precio de compra original', '200000');
    await sembrarImporte12(page, 'Impuestos y gastos que pagaste al comprarlo (€)', '16000');
    await sembrarImporte12(page, 'Amortizaciones acumuladas deducidas (€)', '30000');
    await sembrarImporte12(page, 'Años de propiedad', '12');
    await sembrarImporte12(page, 'Valor catastral del suelo (€)', '60000');
    await sembrarImporte12(page, 'Valor catastral total (suelo + construcción) (€)', '150000');
    await sembrarImporte12(page, 'Comisión de la inmobiliaria (%)', '4');
    await sembrarImporte12(page, 'Gestoría y certificados del vendedor (€)', '600');

    expect(await valorTarjeta(page, 'Plusvalía municipal (IIVTNU)')).toBe('1200,00 €');
    expect(await descripcionTarjeta(page, 'Plusvalía municipal (IIVTNU)')).toBe(
      'Método objetivo (más favorable), tipo municipal orientativo del 25 %',
    );
    expect(await valorTarjeta(page, 'Valor de adquisición')).toBe('186.000,00 €');
    expect(await descripcionTarjeta(page, 'Valor de adquisición')).toBe(
      'Precio de compra + impuestos y gastos de aquella compra − 30.000,00 € de amortizaciones deducidas',
    );
    expect(await valorTarjeta(page, 'Valor de transmisión')).toBe('401.400,00 €');
    expect(await valorTarjeta(page, 'Ganancia patrimonial')).toBe('215.400,00 €');
    expect(await valorTarjeta(page, 'IRPF sobre la ganancia')).toBe('49.038,00 €');
    expect(await valorTarjeta(page, /^Comisión de la inmobiliaria$/)).toBe('16.800,00 €');
    expect(await valorTarjeta(page, 'Total gastos de la venta')).toBe('67.638,00 €');
    expect(await descripcionTarjeta(page, 'Total gastos de la venta')).toBe('16,10% sobre el precio de venta');
    expect(await valorTarjeta(page, /^NETO QUE RECIBES/)).toBe('352.362,00 €');
    expect(await avisoNeto2309(page)).toBe(
      'NETO QUE RECIBES · Precio de venta menos impuestos, comisión y gestoría',
    );

    // El contrafactual: sin minorar, 7.516,00 € menos de IRPF.
    await page.getByRole('button', { name: /Local no afecto/ }).click();
    expect(await valorTarjeta(page, 'Valor de adquisición')).toBe('216.000,00 €');
    expect(await valorTarjeta(page, 'IRPF sobre la ganancia')).toBe('41.522,00 €');
    expect(await valorTarjeta(page, /^NETO QUE RECIBES/)).toBe('359.878,00 €');
  });

  // ══════════════════════════════════════════════════════════════════════════
  // CASO 27 (LÍMITE) — EXTREMADURA, el tramo MÁS ALTO de su escala (11 % desde 600.000), y
  // una ganancia de EXACTAMENTE 300.000,00 €, el techo del tramo del 27 % de la base del
  // ahorro, alcanzada con las amortizaciones; y un euro más de amortización, que ya va al 30 %.
  //
  //   COMPRADOR — escala de `ITP_CCAA.extremadura` (8 % hasta 360.000 · 10 % hasta 600.000 · 11 %)
  //     600.000 → 28.800 + 24.000 =                          52.800,00 → «ITP (8,80%)»
  //     600.001 → 52.800 + 1 × 11 % =                                              52.800,11
  //     700.000 → 28.800 + 24.000 + 100.000 × 11 % = 63.800 → 9,114286 % → «ITP (9,11%)»
  //   Notaría sobre 700.000: 90,15 + 108,182205 + 45,075900 + 90,151820
  //     + 450.759,07 × 0,05 % + 98.987,90 × 0,03 % = 588,636230 × 1,21 = 712,249838
  //     ×1,5 = 1.068,374757 · ×2 = 1.424,499676 · ×1,75 =                          1.246,44
  //   Registro: 24,04 + 42,070858 + 37,563250 + 67,613865 + 135,227721 + 19,797580
  //     = 326,313274 + 9,015182 = 335,328456 × 1,21 =                                405,75
  //   Total = 63.800 + 1.246,44 + 405,75 + 500 = 65.952,19 → 9,421741 % → «9,42%»
  //   COSTE TOTAL =                                                              765.952,19
  //
  //   VENDEDOR «afecto»: compra 400.000 · gastos de aquella compra 30.000 · 15 años ·
  //   suelo 100.000 · total 250.000 · comisión 3 % · sin gestoría.
  //     plusvalía objetivo = 100.000 × 0,12 (15 años) × 25 % = 3.000 · real = 300.000 ×
  //       0,4 × 25 % = 30.000 → gana el OBJETIVO:                                  3.000,00
  //     valor de transmisión = 700.000 − 21.000 − 3.000 =                        676.000,00
  //     amortizaciones 54.000 → adquisición = 430.000 − 54.000 = 376.000
  //     ganancia =                                                               300.000,00
  //     IRPF = 1.140 + 9.240 + 34.500 + 100.000 × 27 % =                          71.880,00
  //     total = 3.000 + 21.000 + 71.880 = 95.880 · neto =                        604.120,00
  //   Amortizaciones 54.001 → ganancia 300.001, y ese euro al 30 %:
  //     IRPF = 71.880 + 0,30 =                                                     71.880,30
  //     neto = 700.000 − 95.880,30 =                                             604.119,70
  //   Un tramo con `<` en vez de `<=` daría 71.880,30 ya en el primer paso; uno que aplicara
  //   el 27 % al euro 300.001, 71.880,27.
  // ══════════════════════════════════════════════════════════════════════════
  test('CASO 27 (límite) — Extremadura en su tramo del 11 %, y una ganancia de 300.000,00 € exactos: el euro 300.001 ya tributa al 30 %', async ({ page }) => {
    expect(ITP_CCAA.extremadura.tramosProgresivos).toEqual([
      { hasta: 360000, tipo: 8 },
      { hasta: 600000, tipo: 10 },
      { hasta: Infinity, tipo: 11 },
    ]);
    expect(TRAMOS_GANANCIAS_PATRIMONIALES_2025[3]).toEqual({ hasta: 300000, tipo: 27 });
    expect(TRAMOS_GANANCIAS_PATRIMONIALES_2025[4].tipo).toBe(30);
    expect(COEFICIENTES_IIVTNU_2025.find((c) => c.anios === 15)?.coeficiente).toBe(0.12);

    await page.selectOption('#select-ccaa', 'extremadura');
    await sembrarImporte12(page, 'Precio del local comercial', '600000');
    expect(await page.locator('h3', { hasText: /^ITP \(/ }).first().innerText()).toBe('ITP (8,80%)');
    expect(await valorTarjeta(page, /^ITP \(/)).toBe('52.800,00 €');
    await sembrarImporte12(page, 'Precio del local comercial', '600001');
    expect(await valorTarjeta(page, /^ITP \(/)).toBe('52.800,11 €');

    await sembrarImporte12(page, 'Precio del local comercial', '700000');
    expect(await page.locator('h3', { hasText: /^ITP \(/ }).first().innerText()).toBe('ITP (9,11%)');
    expect(await valorTarjeta(page, /^ITP \(/)).toBe('63.800,00 €');
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('1246,44 €');
    expect(await descripcionTarjeta(page, 'Gastos de notaría')).toContain('entre 1068,37 € y 1424,50 €');
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('405,75 €');
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('65.952,19 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toBe('9,42% sobre el precio de compra');
    expect(await valorTarjeta(page, 'COSTE TOTAL')).toBe('765.952,19 €');

    await page.getByRole('button', { name: 'Vendedor', exact: true }).click();
    await page.getByRole('button', { name: /Local afecto a actividad/ }).click();
    await sembrarImporte12(page, 'Precio de compra original', '400000');
    await sembrarImporte12(page, 'Impuestos y gastos que pagaste al comprarlo (€)', '30000');
    await sembrarImporte12(page, 'Amortizaciones acumuladas deducidas (€)', '54000');
    await sembrarImporte12(page, 'Años de propiedad', '15');
    await sembrarImporte12(page, 'Valor catastral del suelo (€)', '100000');
    await sembrarImporte12(page, 'Valor catastral total (suelo + construcción) (€)', '250000');

    expect(await valorTarjeta(page, 'Plusvalía municipal (IIVTNU)')).toBe('3000,00 €');
    expect(await valorTarjeta(page, 'Valor de transmisión')).toBe('676.000,00 €');
    expect(await valorTarjeta(page, 'Valor de adquisición')).toBe('376.000,00 €');
    expect(await valorTarjeta(page, 'Ganancia patrimonial')).toBe('300.000,00 €');
    expect(await valorTarjeta(page, 'IRPF sobre la ganancia')).toBe('71.880,00 €');
    expect(await valorTarjeta(page, 'Total gastos de la venta')).toBe('95.880,00 €');
    expect(await valorTarjeta(page, /^NETO QUE RECIBES/)).toBe('604.120,00 €');

    await sembrarImporte12(page, 'Amortizaciones acumuladas deducidas (€)', '54001');
    expect(await valorTarjeta(page, 'Ganancia patrimonial')).toBe('300.001,00 €');
    expect(await valorTarjeta(page, 'IRPF sobre la ganancia')).toBe('71.880,30 €');
    expect(await valorTarjeta(page, /^NETO QUE RECIBES/)).toBe('604.119,70 €');
  });

  // ══════════════════════════════════════════════════════════════════════════
  // CASO 28 (RECHAZO) — ❌ ABIERTO (operativa, medio): unas amortizaciones MAYORES que todo
  // el coste de adquisición se aceptan en silencio.
  //
  // El art. 40 RIRPF minora el valor de adquisición en la amortización deducida, y esa
  // amortización se aplica sobre la CONSTRUCCIÓN, nunca sobre el suelo (en
  // `TABLA_AMORTIZACION_2026`, «edificios-comerciales», el máximo es un 2 % lineal al año):
  // no puede superar el precio de compra más sus gastos. Un cero de más —150.000 por
  // 15.000— es el tecleo que lo produce. `calcularGananciaInmueble` acota el valor de
  // adquisición a 0 con `Math.max(0, …)` y NADIE lo dice: se descartan 21.000 € de un dato
  // imposible, desaparecen las tarjetas «Valor de adquisición» y «Valor de transmisión»
  // (su guarda es `> 0`, pensada para «falta el precio de compra») y el neto se publica
  // como DEFINITIVO. Es la forma del par catastral imposible (hallazgo 900), que esta misma
  // app ya rechaza.
  //
  // NAVARRA · 180.000 € · ITP plano del 6 % = 10.800,00 → «ITP (6,00%)»
  //   notaría 737,81 · registro 228,96 · gestoría 500 → COSTE TOTAL 192.266,77
  // VENDEDOR «afecto»: compra 120.000 · gastos 9.000 · 8 años · suelo 30.000 · total 80.000
  //   plusvalía objetivo = 30.000 × 0,10 × 25 % = 750 (real: 60.000 × 0,375 × 25 % = 5.625)
  //   valor de transmisión = 180.000 − 5.400 − 750 =                             173.850,00
  //   control, amortizaciones 12.000 → adquisición 117.000 → ganancia 56.850
  //     IRPF = 1.140 + 9.240 + 6.850 × 23 % = 11.955,50 → neto =                161.894,50
  //   amortizaciones 150.000 > 129.000 → la app liquida con adquisición 0: ganancia 173.850,
  //     IRPF 38.865,50 y «NETO QUE RECIBES 134.984,50 €» sin una palabra.
  // ══════════════════════════════════════════════════════════════════════════
  test('CASO 28 (rechazo) — unas amortizaciones mayores que el precio de compra y sus gastos no se liquidan en silencio', async ({ page }) => {
    expect(ITP_CCAA.navarra.tipoGeneral).toBe(6);
    expect(COEFICIENTES_IIVTNU_2025.find((c) => c.anios === 8)?.coeficiente).toBe(0.1);

    await page.selectOption('#select-ccaa', 'navarra');
    await sembrarImporte12(page, 'Precio del local comercial', '180000');
    expect(await page.locator('h3', { hasText: /^ITP \(/ }).first().innerText()).toBe('ITP (6,00%)');
    expect(await valorTarjeta(page, /^ITP \(/)).toBe('10.800,00 €');
    expect(await valorTarjeta(page, 'COSTE TOTAL')).toBe('192.266,77 €');

    await page.getByRole('button', { name: 'Vendedor', exact: true }).click();
    await page.getByRole('button', { name: /Local afecto a actividad/ }).click();
    await sembrarImporte12(page, 'Precio de compra original', '120000');
    await sembrarImporte12(page, 'Impuestos y gastos que pagaste al comprarlo (€)', '9000');
    await sembrarImporte12(page, 'Amortizaciones acumuladas deducidas (€)', '12000');
    await sembrarImporte12(page, 'Años de propiedad', '8');
    await sembrarImporte12(page, 'Valor catastral del suelo (€)', '30000');
    await sembrarImporte12(page, 'Valor catastral total (suelo + construcción) (€)', '80000');
    expect(await valorTarjeta(page, 'Valor de adquisición')).toBe('117.000,00 €');
    expect(await valorTarjeta(page, 'IRPF sobre la ganancia')).toBe('11.955,50 €');
    expect(await valorTarjeta(page, /^NETO QUE RECIBES/)).toBe('161.894,50 €');

    // El dato imposible: el neto tiene que nombrarlo, no publicarse limpio.
    await sembrarImporte12(page, 'Amortizaciones acumuladas deducidas (€)', '150000');
    expect(await avisoNeto2309(page)).toMatch(/amortizaci/i);
    // …y no liquidar con él (hallazgo 1261): ni cuota, ni neto definitivo, ni tarjetas que
    // desaparezcan justo cuando hay que explicar el dato.
    expect(await valorTarjeta(page, 'IRPF sobre la ganancia')).toBe('Sin calcular');
    expect(await descripcionTarjeta(page, 'IRPF sobre la ganancia')).toMatch(/superan todo el coste de adquisición \(129\.000,00 €\)/);
    expect(await page.locator('h3', { hasText: /^NETO QUE RECIBES/ }).first().innerText()).toContain('(PARCIAL)');
    expect(await avisoNeto2309(page)).toMatch(/revisa las amortizaciones deducidas/i);
    expect(await valorTarjeta(page, 'Valor de adquisición')).toBe('0,00 €');
    await expect(page.locator('h3', { hasText: 'Valor de transmisión' })).toHaveCount(1);
    // Con las amortizaciones iguales al coste (129.000) el dato ya es posible y se liquida.
    await sembrarImporte12(page, 'Amortizaciones acumuladas deducidas (€)', '129000');
    expect(await valorTarjeta(page, 'IRPF sobre la ganancia')).not.toBe('Sin calcular');
    await expect(page.locator('h3', { hasText: 'Valor de adquisición' })).toHaveCount(1);
  });

  // HALLAZGO 1266 — la ayuda de «Años de propiedad» sale de COEFICIENTES_IIVTNU_2025: el tope
  // de años y la comparación del coeficiente de la reventa antes del año no van a mano.
  test('la ayuda de los años de propiedad se deriva de la tabla de coeficientes del IIVTNU', async ({ page }) => {
    await page.getByRole('button', { name: 'Vendedor', exact: true }).click();
    const tope = Math.max(...COEFICIENTES_IIVTNU_2025.map((c) => c.anios));
    const c0 = COEFICIENTES_IIVTNU_2025.find((c) => c.anios === 0)!.coeficiente;
    const c1 = COEFICIENTES_IIVTNU_2025.find((c) => c.anios === 1)!.coeficiente;
    const fmt = (n: number) => n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const ayuda = page.getByText(/Años completos desde la compra/);
    await expect(ayuda).toContainText(`cuenta como máximo ${tope}`);
    await expect(ayuda).toContainText(`con un coeficiente de ${fmt(c0)}`);
    if (c0 > c1) await expect(ayuda).toContainText(`mayor que el ${fmt(c1)} del primer año`);
  });

  // ─── HALLAZGOS 1257-1266 del 23/09/2026 — REPARADOS el mismo día ──────────────────────
  //   La dirección de cada aviso sale ahora de SONDEAR el cálculo (lib/sondeoIlegibles.ts).

  /**
   * ❌ ABIERTO (operativa, medio) — DOS ilegibles en sentidos opuestos: el aviso del NETO
   * afirma a la vez «el neto real será menor» y «el neto real es MAYOR que este».
   *
   * Es el (b) de la hermana garaje. Aquí la tarjeta del IRPF sí lo resuelve cuando son los
   * gastos de aquella compra y las amortizaciones («Cuota sin cerrar… sentidos contrarios»),
   * pero la del NETO concatena las dos frases de 0bff1872 y 95187231, cada una con su
   * conclusión categórica sobre la cifra entera, y una de las dos es falsa.
   *
   * BASE con la comisión «3.5.0» y los gastos de aquella compra «2.000.50»:
   *   transmisión = 200.000 − 500 − 800 = 198.700 · adquisición = 150.000 − 20.000 = 130.000
   *   ganancia 68.700 → IRPF = 1.140 + 9.240 + 18.700 × 23 % =                     14.681,00
   *   neto mostrado = 200.000 − (800 + 500 + 14.681) =                            184.019,00
   *   neto real =                                                                 182.803,00
   * El real es 1.216,00 € MENOR, y la segunda frase dice «el neto real es MAYOR que este».
   */
  test('dos ilegibles opuestos (comisión y gastos de aquella compra): el neto no afirma que el real es MAYOR cuando es menor', async ({ page }) => {
    await prepararBaseFamilia2309(page);
    await sembrarImporte12(page, 'Comisión de la inmobiliaria (%)', '3.5.0');
    await sembrarImporte12(page, 'Impuestos y gastos que pagaste al comprarlo (€)', ILEGIBLE_2309);

    expect(await valorTarjeta(page, 'IRPF sobre la ganancia')).toBe('14.681,00 €');
    expect(await valorTarjeta(page, /^NETO QUE RECIBES/)).toBe('184.019,00 €');
    expect(await avisoNeto2309(page)).not.toContain('el neto real es MAYOR que este');
  });

  /**
   * ❌ ABIERTO (operativa, medio) — el mismo defecto con los dos importes del valor de
   * adquisición, justo donde la tarjeta del IRPF ya dice «sentidos contrarios».
   *
   * BASE con los gastos de aquella compra y las amortizaciones «2.000.50»:
   *   adquisición = 150.000 → ganancia 42.700 → IRPF = 1.140 + 36.700 × 21 % =      8.847,00
   *   neto mostrado = 200.000 − (800 + 6.000 + 500 + 8.847) =                     183.853,00
   *   neto real =                                                                 182.803,00
   * El real es 1.050,00 € MENOR. La tarjeta del IRPF: «Cuota sin cerrar». La del neto:
   * «…el neto real será menor. …así que el neto real es MAYOR que este».
   */
  test('dos ilegibles opuestos (gastos de aquella compra y amortizaciones): el neto dice lo mismo que la tarjeta del IRPF, no las dos direcciones', async ({ page }) => {
    await prepararBaseFamilia2309(page);
    await sembrarImporte12(page, 'Impuestos y gastos que pagaste al comprarlo (€)', ILEGIBLE_2309);
    await sembrarImporte12(page, 'Amortizaciones acumuladas deducidas (€)', ILEGIBLE_2309);

    expect(await valorTarjeta(page, 'IRPF sobre la ganancia')).toBe('8847,00 €');
    expect(await descripcionTarjeta(page, 'IRPF sobre la ganancia')).toContain('sentidos contrarios');
    expect(await valorTarjeta(page, /^NETO QUE RECIBES/)).toBe('183.853,00 €');
    expect(await avisoNeto2309(page)).not.toContain('el neto real es MAYOR que este');
  });

  /**
   * ❌ ABIERTO (operativa, medio) — con PÉRDIDA, unas amortizaciones ilegibles hacen que el
   * neto se rotule «(PARCIAL)» y afirme «No descuenta el IRPF que añaden las amortizaciones
   * deducidas: el neto real será menor» (y el total, «SIN el IRPF que añaden…»), cuando con
   * la amortización real no hay IRPF y el neto es IDÉNTICO.
   *
   * Es el espejo del (a) de garaje en el campo exclusivo de esta app: A1 (0bff1872) puso a
   * los gastos de aquella compra la guarda «solo cuando hay IRPF que rebajar», y A2
   * (95187231) no tiene la suya. Con pérdida, la amortización solo crea IRPF si supera la
   * pérdida que se está publicando; aquí haría falta más de 66.500 €.
   *
   * BASE con compra 250.000 y gastos 10.000 (vende por debajo: plusvalía NO SUJETA, 0 €):
   *   transmisión = 200.000 − 6.000 − 500 = 193.500 · neto = 193.500,00 en los dos casos
   *   amortizaciones 20.000 → adquisición 240.000 → pérdida                        46.500,00
   *   amortizaciones «2.000.50» → adquisición 260.000 → pérdida                    66.500,00
   */
  test('con pérdida, unas amortizaciones ilegibles no hacen decir al neto que el real será menor', async ({ page }) => {
    await prepararBaseFamilia2309(page, '250000');
    await sembrarImporte12(page, 'Impuestos y gastos que pagaste al comprarlo (€)', '10000');
    expect(await valorTarjeta(page, 'Pérdida patrimonial')).toBe('46.500,00 €');
    expect(await valorTarjeta(page, /^NETO QUE RECIBES/)).toBe('193.500,00 €');

    await sembrarImporte12(page, 'Amortizaciones acumuladas deducidas (€)', ILEGIBLE_2309);
    expect(await valorTarjeta(page, /^NETO QUE RECIBES/)).toBe('193.500,00 €');
    expect(await avisoNeto2309(page)).not.toContain('el neto real será menor');
  });

  /**
   * ❌ ABIERTO (operativa, medio) — con PÉRDIDA, la cifra que SÍ mueve un ilegible del valor
   * de adquisición es la pérdida compensable, y su tarjeta no lo dice.
   *
   * La guarda de A1 hace bien en callar en el NETO (no se mueve), pero «Pérdida patrimonial»
   * sigue diciendo «la pérdida se puede compensar en la declaración» sobre una cifra que se
   * ha quedado corta: 10.000,00 € con los gastos de aquella compra ilegibles, y 20.000,00 €
   * de MÁS con las amortizaciones ilegibles. Solo lo explica «Valor de adquisición», una
   * tarjeta más arriba. Es la segunda mitad del (a) de garaje.
   *
   *   gastos «2.000.50»        → adquisición 230.000 → pérdida 36.500,00 (real 46.500,00)
   *   amortizaciones «2.000.50» → adquisición 260.000 → pérdida 66.500,00 (real 46.500,00)
   */
  test('con pérdida, los gastos de aquella compra ilegibles: la pérdida dice que no se han podido leer', async ({ page }) => {
    await prepararBaseFamilia2309(page, '250000');
    await sembrarImporte12(page, 'Impuestos y gastos que pagaste al comprarlo (€)', ILEGIBLE_2309);

    // El neto no se mueve y calla: la guarda de A1 funciona.
    expect(await valorTarjeta(page, /^NETO QUE RECIBES/)).toBe('193.500,00 €');
    expect(await avisoNeto2309(page)).not.toContain('MAYOR');
    expect(await valorTarjeta(page, 'Pérdida patrimonial')).toBe('36.500,00 €');
    expect(await descripcionTarjeta(page, 'Pérdida patrimonial')).toMatch(/no se ha(n)? podido leer/i);
  });

  test('con pérdida, las amortizaciones ilegibles: la pérdida dice que no se han podido leer', async ({ page }) => {
    await prepararBaseFamilia2309(page, '250000');
    await sembrarImporte12(page, 'Impuestos y gastos que pagaste al comprarlo (€)', '10000');
    await sembrarImporte12(page, 'Amortizaciones acumuladas deducidas (€)', ILEGIBLE_2309);

    expect(await valorTarjeta(page, 'Pérdida patrimonial')).toBe('66.500,00 €');
    expect(await descripcionTarjeta(page, 'Pérdida patrimonial')).toMatch(/no se ha(n)? podido leer/i);
  });

  /**
   * ❌ ABIERTO (operativa, medio) — con la comisión ilegible, la tarjeta del IRPF publica
   * como DEFINITIVA una cuota que es un TECHO, y la del valor de transmisión afirma haber
   * restado una comisión que tomó como 0.
   *
   * La comisión y la gestoría de la venta son gastos de transmisión (art. 35.1 LIRPF):
   * sin leerlas, la ganancia y el IRPF salen MAYORES. La referencia dice «TECHO» en su
   * tarjeta del IRPF también con esos dos importes desde 0f70fdf8 (C3); esta app solo lo dice
   * con los gastos de aquella compra (A1). Es el defecto de 1197 («Valor de adquisición»
   * afirmaba sumar unos gastos tomados como 0), una tarjeta más abajo.
   *
   * BASE con la comisión «3.5.0»:
   *   transmisión = 200.000 − 500 − 800 = 198.700 → ganancia 53.700
   *   IRPF = 1.140 + 9.240 + 3.700 × 23 % = 11.231,00 (real 9.897,00: +1.334,00 €)
   */
  test('con la comisión ilegible, la tarjeta del IRPF dice que es un techo', async ({ page }) => {
    await prepararBaseFamilia2309(page);
    await sembrarImporte12(page, 'Comisión de la inmobiliaria (%)', '3.5.0');

    expect(await valorTarjeta(page, 'IRPF sobre la ganancia')).toBe('11.231,00 €');
    expect(await descripcionTarjeta(page, 'IRPF sobre la ganancia')).toMatch(/techo|no se ha(n)? podido leer/i);
  });

  test('con la comisión ilegible, «Valor de transmisión» no afirma que la ha restado', async ({ page }) => {
    await prepararBaseFamilia2309(page);
    await sembrarImporte12(page, 'Comisión de la inmobiliaria (%)', '3.5.0');

    expect(await valorTarjeta(page, 'Valor de transmisión')).toBe('198.700,00 €');
    expect(await descripcionTarjeta(page, 'Valor de transmisión')).not.toBe(
      'Precio de venta − comisión, gestoría y plusvalía municipal',
    );
  });

  /**
   * ❌ ABIERTO (contenido, bajo) — «No descuenta la comisión inmobiliaria: el neto real será
   * menor» invita a restar la comisión ENTERA, y el hueco real es menor: C3 del testigo de
   * familia, reparado el 23/09 solo en la referencia (0f70fdf8).
   *
   * BASE con la comisión «3.5.0»: neto mostrado 187.469,00 · real 182.803,00 → hueco 4.666,00
   * Quien resta el 3 % de 200.000 (6.000,00 €) llega a 181.469,00, 1.334,00 € por DEBAJO del
   * real. La cota que publica la referencia es el tipo marginal de la base de ahora (53.700 →
   * 23 %): 6.000 × (1 − 23 %) = 4.620 ≤ 4.666 ≤ 6.000.
   */
  test('C3 en la hermana — «No descuenta la comisión» dice que no entera, porque rebaja también el IRPF', async ({ page }) => {
    await prepararBaseFamilia2309(page);
    await sembrarImporte12(page, 'Comisión de la inmobiliaria (%)', '3.5.0');

    expect(await valorTarjeta(page, /^NETO QUE RECIBES/)).toBe('187.469,00 €');
    expect(await avisoNeto2309(page)).toMatch(/comisi[óo]n[^.;]*IRPF/i);
  });

  /**
   * ❌ ABIERTO (operativa, bajo) — con el valor catastral total ilegible y el método OBJETIVO
   * ganando, el neto se rotula «(PARCIAL)» y afirma «el neto real es MAYOR que este», pero es
   * IDÉNTICO. Es el (c) de garaje, efecto colateral de 758e053f.
   *
   * En la BASE el real sale 5.000,00 € y el objetivo 800,00 €: con el total de verdad
   * (100.000) sigue ganando el objetivo, así que «100.000.00» no mueve nada. La tarjeta de la
   * plusvalía lo dice bien («puede salir más barata»). La fila `sin_efecto` del testigo de
   * familia mide el delta (0,00 €) pero no que el aviso calle.
   */
  test('total ilegible con el método objetivo ganando: el neto no cambia y no puede afirmar que el real es MAYOR', async ({ page }) => {
    await prepararBaseFamilia2309(page);
    await sembrarImporte12(page, 'Valor catastral total (suelo + construcción) (€)', '100.000.00');

    expect(await valorTarjeta(page, 'Plusvalía municipal (IIVTNU)')).toBe('800,00 €');
    expect(await valorTarjeta(page, /^NETO QUE RECIBES/)).toBe('182.803,00 €');
    expect(await avisoNeto2309(page)).not.toContain('el neto real es MAYOR que este');
  });

  /**
   * ❌ ABIERTO (operativa, bajo) — el «Total gastos de la venta» se publica como DEFINITIVO
   * cuando la cifra que lleva dentro es un TECHO, mientras el neto de debajo dice «(PARCIAL)»
   * y la tarjeta del IRPF dice «TECHO».
   *
   * `faltanPorAbaratar` (A1 y C1) solo llega al neto; `faltanEnElNeto` (A2 y los demás) llega
   * también al total. Con las amortizaciones ilegibles el total dice «(parcial)»; con los
   * gastos de aquella compra, no.
   *
   * BASE con los gastos de aquella compra «2.000.50»:
   *   total = 800 + 6.000 + 500 + 13.301 = 20.601,00 (real 17.197,00) · «10,30% sobre el
   *   precio de venta», sin más.
   */
  test('con los gastos de aquella compra ilegibles, el total de la venta no se publica como definitivo', async ({ page }) => {
    await prepararBaseFamilia2309(page);
    await sembrarImporte12(page, 'Impuestos y gastos que pagaste al comprarlo (€)', ILEGIBLE_2309);

    expect(await valorTarjeta(page, 'Total gastos de la venta')).toBe('20.601,00 €');
    const titulo = await page.locator('h3', { hasText: 'Total gastos de la venta' }).first().innerText();
    const total = `${titulo} · ${await descripcionTarjeta(page, 'Total gastos de la venta')}`;
    expect(total).toMatch(/parcial|techo|no se ha(n)? podido leer/i);
  });

  /**
   * ❌ ABIERTO (contenido, bajo) — un importe ESCRITO pero ilegible se anuncia como si
   * faltara: «Introduce el precio…», «falta el valor catastral del suelo».
   *
   * 8d7dcd1b lo reparó en el precio de nave, solar y terreno («confundía "ilegible" con
   * "vacío"») y 758e053f en el total catastral de esta misma app («no falta, no se lee»);
   * ninguno llegó al precio ni al suelo de aquí. Es el (d) de garaje. Lo mismo con el precio
   * de compra («Falta el precio de compra original») y los años («faltan los años»).
   */
  test('un precio escrito pero ilegible no se anuncia como que falta', async ({ page }) => {
    await sembrarImporte12(page, 'Precio del local comercial', '200.000.00');
    await expect(page.locator('input[aria-label="Precio del local comercial"]')).toHaveValue('200.000.00');
    await expect(page.locator('h3', { hasText: 'COSTE TOTAL' })).toHaveCount(0);

    const marcador = await page.locator('[class*="placeholder"]:has(p)').first().innerText();
    expect(marcador).toMatch(/no se ha podido leer|ilegible/i);
  });

  test('un valor catastral del suelo escrito pero ilegible no se anuncia como que falta', async ({ page }) => {
    await prepararBaseFamilia2309(page);
    await sembrarImporte12(page, 'Valor catastral del suelo (€)', '40.000.00');

    expect(await valorTarjeta(page, 'Plusvalía municipal (IIVTNU)')).toBe('Sin calcular');
    expect(await descripcionTarjeta(page, 'Plusvalía municipal (IIVTNU)')).toMatch(/no se ha podido leer/i);
  });
});
