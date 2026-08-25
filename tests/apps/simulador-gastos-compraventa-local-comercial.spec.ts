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
    await expect(page.locator('h3', { hasText: /^ITP/ }).first()).toHaveText('ITP (6%)');
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

    // Total = 12.000 + 758,9827 + 236,2250 + 500 = 13.495,2077 → 6,7476 % de 200.000
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('13.495,21 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toContain('6,75%');
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('213.495,21 €');

    // ── 1b. Primera entrega del promotor: IVA 21 % + AJD, nunca ITP.
    // IVA_INMUEBLES_2025.local = 21 → 200.000 × 21 % = 42.000
    // ITP_CCAA.madrid.ajd = 0,75 → 200.000 × 0,75 % = 1.500
    await page.getByRole('button', { name: /Obra nueva/ }).click();
    await expect(page.locator('h3', { hasText: /^IVA/ }).first()).toHaveText('IVA (21%)');
    expect(await valorTarjeta(page, /^IVA/)).toBe('42.000,00 €');
    await expect(page.locator('h3', { hasText: /^AJD/ }).first()).toHaveText('AJD (0,75%)');
    expect(await valorTarjeta(page, /^AJD/)).toBe('1500,00 €');
    await expect(page.locator('h3', { hasText: /^ITP/ })).toHaveCount(0);
    // Total = 42.000 + 1.500 + 758,9827 + 236,2250 + 500 = 44.995,2077 → 22,4976 %
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('44.995,21 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toContain('22,50%');
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('244.995,21 €');

    // ── 1c. Segunda mano CON renuncia a la exención (art. 20.Dos LIVA): IVA 21 % con
    // inversión del sujeto pasivo + AJD. Mismo importe que la obra nueva, distinto título
    // y aviso propio, porque el comprador lo autoliquida en vez de pagarlo al vendedor.
    await page.getByRole('button', { name: /renuncia IVA/ }).click();
    await expect(page.locator('h3', { hasText: /^IVA/ }).first()).toHaveText('IVA (renuncia · ISP) (21%)');
    expect(await valorTarjeta(page, /^IVA/)).toBe('42.000,00 €');
    expect(await descripcionTarjeta(page, /^IVA/)).toContain('inversión del sujeto pasivo');
    expect(await valorTarjeta(page, /^AJD/)).toBe('1500,00 €');
    await expect(page.getByText('Renuncia a la exención de IVA (Art. 20.Dos LIVA)')).toBeVisible();
    await expect(page.locator('h3', { hasText: /^ITP/ })).toHaveCount(0);

    // El disclaimer de nivel 1 CRÍTICO no puede colapsarse y el sello de datos normativos
    // debe estar a la vista (política de disclaimers, apps fiscales).
    await expect(page.getByText('Información Importante sobre Herramientas Financieras')).toBeVisible();
    await expect(page.locator('[aria-label="Datos de referencia normativos"]')).toContainText('17/06/2026');
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
    // Tipo EFECTIVO = 178.000 / 1.600.000 = 11,125 % (la app lo redondea a 0 decimales).
    expect(await valorTarjeta(page, /^ITP/)).toBe('178.000,00 €');
    await expect(page.locator('h3', { hasText: /^ITP/ }).first()).toHaveText('ITP (11%)');

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
    await expect(page.locator('h3', { hasText: /^ITP/ }).first()).toHaveText('ITP (3%)');
    // Total = 6.000 + 758,9827 + 236,2250 + 500 = 7.495,2077 → 3,7476 %
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('7495,21 €');
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('207.495,21 €');

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
  // HALLAZGOS del Inspector — 25/08/2026
  // ══════════════════════════════════════════════════════════════════════════

  /**
   * ⚠️ HALLAZGO (alto) — la gestoría del VENDEDOR no entra en el cálculo hasta que se toca
   * otro campo. El `useMemo` de resultadosVendedor usa `gastosGestoriaVenta` pero declara
   * `gastosGestoria` (la del COMPRADOR) en su array de dependencias: el campo separado el
   * 20/08/2026 por el art. 35.1 LIRPF se separó en el valor, no en las dependencias.
   * Consecuencia medida: al escribir 2.000 € de gestoría del vendedor, el neto sigue
   * diciendo 187.398,00 € en vez de 185.818,00 € — 1.580,00 € de más—, y solo se corrige
   * al editar la gestoría del comprador, que no tiene nada que ver.
   */
  test('CASO 4 (hallazgo) — la gestoría del vendedor debe reducir la ganancia en cuanto se escribe', async ({ page }) => {
    test.fail(); // hoy el useMemo depende de la gestoría del COMPRADOR
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
   * ⚠️ HALLAZGO (medio) — la etiqueta del ITP se redondea a 0 decimales y contradice al
   * importe que tiene al lado, que es justo lo que el comentario del código dice evitar al
   * mostrar el tipo EFECTIVO. Murcia tiene el 7,75 % desde el 25/07/2025 (Ley 3/2025,
   * TIPOS_ITP_CCAA_2025): 200.000 × 7,75 % = 15.500 €, pero el título dice «ITP (8%)», que
   * sobre ese precio serían 16.000 €. Pasa igual en Canarias (6,5 % → «ITP (7%)»).
   * El resto del clúster muestra un decimal («ITP (6,0%)»).
   */
  test('CASO 5 (hallazgo) — el tipo de la etiqueta debe ser el que se ha aplicado (Murcia, 7,75 %)', async ({ page }) => {
    test.fail(); // hoy rotula «ITP (8%)» junto al importe del 7,75 %
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Segunda mano/ }).first().click();
    await page.locator('#select-ccaa').selectOption('murcia');
    await rellenar(page, 'Precio del local comercial', '200000');

    expect(await valorTarjeta(page, /^ITP/)).toBe('15.500,00 €');
    // Obtenido hoy: «ITP (8%)».
    await expect(page.locator('h3', { hasText: /^ITP/ }).first()).toHaveText(/ITP \(7,75?%\)|ITP \(7,8%\)/);
  });

  /**
   * ⚠️ HALLAZGO (bajo) — el panel «info CCAA» imprime los tipos con el número crudo de
   * JavaScript: «7.75%» y «1.5%», con punto decimal. El CLAUDE.md global §2 obliga a coma
   * decimal, y las ResultCard de dos centímetros más allá sí la usan («AJD (0,75%)»), así
   * que la misma pantalla muestra el mismo dato en dos formatos.
   */
  test('CASO 6 (hallazgo) — los tipos del panel de la CCAA deben ir en formato español', async ({ page }) => {
    test.fail(); // hoy interpola el número crudo: «7.75%»
    await page.goto(RUTA);
    await page.locator('#select-ccaa').selectOption('murcia');

    const panel = page.locator('text=ITP General').locator('xpath=ancestor::div[1]/ancestor::div[1]');
    await expect(panel).toContainText('7,75%');   // obtenido hoy: «7.75%»
    await expect(panel).toContainText('1,5%');    // obtenido hoy: «1.5%»
  });
});
