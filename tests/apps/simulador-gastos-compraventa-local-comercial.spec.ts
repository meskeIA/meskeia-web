import { test, expect, Page } from '@playwright/test';

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
// HALLAZGOS ABIERTOS de esta ronda: van abajo, cada uno en su test marcado
// `test.fail()` con el resultado CORRECTO escrito. El día que se reparen pasarán
// a verde y habrá que quitarles la marca, que es como se sabe que cerraron.
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
   * ⛔ HALLAZGO 07/09/2026 (ALTO) — ABIERTO. `test.fail()`: cuando se repare pasará a
   * verde y habrá que quitarle la marca.
   *
   * El perfil «Local afecto a actividad» nace con su campo de amortizaciones VACÍO
   * (`useState('')`), y ese estado por defecto rompe el panel entero del vendedor:
   *
   *   const amortizaciones = perfil === 'afecto-actividad'
   *     ? Math.max(0, parseSpanishNumber(amortizacionesAcumuladas))   // ← NaN si está vacío
   *     : 0;
   *
   * `parseSpanishNumber('')` devuelve NaN y `Math.max(0, NaN)` sigue siendo NaN, así que
   * el NaN llega a `calcularGananciaInmueble` y se propaga a la cuota. En pantalla:
   * desaparecen las tarjetas de valor de adquisición y de transmisión, la ganancia y el
   * total y el neto dicen «No definido» y —lo grave— el IRPF pinta **«SIN CUOTA» en
   * verde** (`variant="success"`), porque `NaN > 0` es `false`. Una app de riesgo 1
   * CRÍTICO afirma que no se debe IRPF sobre una ganancia de 100.900 €.
   *
   * Los otros cinco campos opcionales del mismo `useMemo` usan `parseSpanishNumberOr`,
   * que existe justamente para esto: su docstring nombra la pestaña Vendedor de
   * `estimador-compraventa-inmueble`, del mismo clúster y con el mismo defecto (14/08/2026).
   */
  test.fail('HALLAZGO 07/09 (alto) — el perfil «afecto» con las amortizaciones sin rellenar debe valer 0, no NaN', async ({ page }) => {
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
    // El orden importa: las dos primeras tarjetas SÍ se pintan hoy (con «SIN CUOTA» y
    // «No definido»), así que fallan al instante. Las de valor de adquisición y
    // transmisión desaparecen por completo —`NaN > 0` es false— y esperarlas agotaría
    // el timeout del test, que Playwright cuenta como fallo REAL aunque haya `test.fail()`.
    expect(await valorTarjeta(page, 'IRPF sobre la ganancia')).toBe('22.087,00 €');
    expect(await valorTarjeta(page, 'NETO QUE RECIBES')).toBe('358.813,00 €');
    expect(await valorTarjeta(page, 'Total gastos de la venta')).toBe('41.187,00 €');
    expect(await valorTarjeta(page, 'Ganancia patrimonial')).toBe('100.900,00 €');
    await expect(page.locator('h3', { hasText: 'Valor de adquisición' })).toHaveCount(1);
    await expect(page.locator('h3', { hasText: 'Valor de transmisión' })).toHaveCount(1);
  });

  /**
   * ⛔ HALLAZGO 07/09/2026 (MEDIO) — ABIERTO. `test.fail()`.
   *
   * Con «Años de propiedad» = 0 —un local revendido antes de cumplir el año, que es
   * cuando la plusvalía municipal más pesa: el coeficiente de COEFICIENTES_IIVTNU_2025
   * para «menos de 1 año» es 0,14, el tercero más alto de la tabla— la app no calcula el
   * impuesto y lo trata como CERO en todo lo demás: el valor de transmisión no se minora,
   * la ganancia sube y el «NETO QUE RECIBES» se presenta como cifra firme (360.045,00 €)
   * cuando le faltan unos 2.800 € de IIVTNU.
   *
   * Y la explicación que acompaña al 0,00 € enumera tres datos que faltarían —«valor
   * catastral del suelo, años y precio de compra»— cuando dos de los tres están puestos:
   * el único ausente es el de los años.
   */
  test.fail('HALLAZGO 07/09 (medio) — con 0 años de propiedad la plusvalía no puede darse por 0 € y sumarse al neto', async ({ page }) => {
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

    // La descripción no puede echar en falta lo que el formulario ya tiene.
    const motivo = await descripcionTarjeta(page, 'Plusvalía municipal');
    expect(motivo).not.toContain('valor catastral del suelo');
    expect(motivo).not.toContain('precio de compra');
    // Y el impuesto no puede valer 0,00 € mientras el neto se presenta como cifra firme.
    expect(await valorTarjeta(page, 'Plusvalía municipal')).not.toBe('0,00 €');
  });

  /**
   * ⛔ HALLAZGO 07/09/2026 (MEDIO) — ABIERTO. `test.fail()`.
   *
   * El MISMO bloque FAQPage del JSON-LD se contradice a sí mismo sobre el dato central de
   * la app. La primera pregunta deriva el rango de `RANGO_ITP` (data/itp-ccaa.ts) y dice
   * «del 4% al 13%»; la sexta —«¿Qué tipo de ITP aplica a un local comercial?»— lo tiene
   * escrito a mano y dice «entre el 4% (País Vasco) y el 10%-11% (Cataluña, Comunidad
   * Valenciana)». El 13 % no es teórico: es lo que la propia app cobra en el tramo alto de
   * Baleares y de Cataluña (CASO 2 y CASO 9 de este mismo fichero).
   *
   * Es el hallazgo 622 repetido —allí el rango escrito a mano era el del AJD, y se reparó
   * derivándolo de RANGO_AJD en este mismo metadata.ts— sobre la pregunta que peor sienta:
   * la que un asistente de IA cita cuando le preguntan por el ITP de un local.
   */
  test.fail('HALLAZGO 07/09 (medio) — el FAQPage del JSON-LD contradice a RANGO_ITP en la pregunta del ITP', async ({ page }) => {
    await page.goto(RUTA);
    const bloques = await page.locator('script[type="application/ld+json"]').allTextContents();
    const faq = bloques.find((b) => b.includes('FAQPage')) ?? '';
    expect(faq).not.toBe('');
    // Lo que sí está derivado (RANGO_ITP.min = 4, RANGO_ITP.max = 13):
    expect(faq).toContain('del 4% al 13%');
    // Lo que está escrito a mano y ya no cuadra:
    expect(faq).not.toContain('10%-11%');
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
