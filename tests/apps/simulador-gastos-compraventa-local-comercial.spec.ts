import { test, expect, Page } from '@playwright/test';
// Los casos del 12/09/2026 siembran con estos helpers: `page.goto()` espera al evento
// `load`, que no garantiza que React haya ejecutado los chunks, y sembrar en esa ventana
// mueve el DOM sin que el estado se entere (candado `check:hidratacion`).
import { esperarHidratacion, esperarValorEnReact } from './_hidratacion';

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
    expect(faq.match(/del 4% al 13%/g)?.length).toBe(2);
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

    // ── Al salir del campo, el NumberInput (min = 0) lo lleva al mínimo declarado: el 0
    // pasa a estar A LA VISTA, y entonces sí es el dato válido de la reventa antes del año
    // (COEFICIENTES_IIVTNU_2025, fila `anios: 0`, coeficiente 0,14):
    //   objetivo = 80.000 × 0,14 × 25 % = 2.800 ; real = 150.000 × 0,4 × 25 % = 15.000
    //   → gana el objetivo, y esos 2.800 € minoran el valor de transmisión (CASO 14).
    await anios.blur();
    await expect(anios).toHaveValue('0');
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('2800,00 €');
    expect(await valorTarjeta(page, 'NETO QUE RECIBES')).toBe('357.889,00 €');
    await expect(page.locator('h3', { hasText: 'NETO QUE RECIBES' })).toHaveText('NETO QUE RECIBES');

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
  test.fail('HALLAZGO 12/09 (medio) — una comisión NEGATIVA no puede abaratar la venta ni encarecer el IRPF', async ({ page }) => {
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
  test.fail('HALLAZGO 12/09 (medio) — la página no dice el 25 % con el que liquida la plusvalía, y sí el 30 % que no aplica', async ({ page }) => {
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
  test.fail('HALLAZGO 12/09 (bajo) — en Aragón la tarjeta del ITP niega los tipos reducidos que su propia ficha documenta', async ({ page }) => {
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
