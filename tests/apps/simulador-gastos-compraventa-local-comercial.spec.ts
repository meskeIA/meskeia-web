import { test, expect, Page } from '@playwright/test';
// Los casos del 12/09/2026 siembran con estos helpers: `page.goto()` espera al evento
// `load`, que no garantiza que React haya ejecutado los chunks, y sembrar en esa ventana
// mueve el DOM sin que el estado se entere (candado `check:hidratacion`).
import { esperarHidratacion, esperarValorEnReact, sembrarValor } from './_hidratacion';
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
// Inspección del 24/09/2026: el sello propio de la escala del ahorro (hallazgo 781) y las
// piezas del arancel con las que se resuelve a mano el caso de Castilla y León.
import { GANANCIAS_PATRIMONIALES_META } from '../../data/fiscal/inmuebles';
import { ARANCELES_NOTARIO, FACTURA_NOTARIAL, REGISTRO_CONCEPTOS } from '../../data/itp-ccaa';
// Re-inspección del 06/10/2026: la bonificación de Ceuta y el límite del arancel notarial.
import { BONIFICACION_CUOTA_CEUTA_MELILLA, LIMITE_ARANCEL_NOTARIAL } from '../../data/itp-ccaa';

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
 *    (= 25 %) de `data/fiscal/inmuebles.ts`, vía `calcularPlusvaliaMunicipal`. Desde el
 *    24/09/2026 la tabla es la del art. 107.4 TRLRHL en la redacción del RDL 8/2023
 *    (BOE-A-2004-4214 consolidado): 10 años 0,12 · 12-15 años 0,09 · ≥ 20 años 0,40…; hasta
 *    ese día la app usaba la del RDL 26/2021 original (0,08 · 0,08 · 0,45). La reventa antes
 *    del año prorratea el coeficiente anual (0,15) por los meses completos, que la app
 *    pregunta; la ejercita el CASO 14. Cada caso afectado dice su cifra anterior.
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
    await expect(page.locator('h3', { hasText: /^ITP/ }).first()).toHaveText('ITP (6,00 %)');
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
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toContain('6,75 %');
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('213.495,20 €');

    // ── 1b. Primera entrega del promotor: IVA 21 % + AJD, nunca ITP.
    // IVA_INMUEBLES_2025.local = 21 → 200.000 × 21 % = 42.000
    // ITP_CCAA.madrid.ajd = 0,75 → 200.000 × 0,75 % = 1.500
    await page.getByRole('button', { name: /Obra nueva/ }).click();
    await expect(page.locator('h3', { hasText: /^IVA/ }).first()).toHaveText('IVA (21,00 %)');
    expect(await valorTarjeta(page, /^IVA/)).toBe('42.000,00 €');
    await expect(page.locator('h3', { hasText: /^AJD/ }).first()).toHaveText('AJD (0,75 %)');
    expect(await valorTarjeta(page, /^AJD/)).toBe('1500,00 €');
    await expect(page.locator('h3', { hasText: /^ITP/ })).toHaveCount(0);
    // Total = 42.000 + 1.500 + 758,98 + 236,22 + 500 = 44.995,20 → 22,4976 %
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('44.995,20 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toContain('22,50 %');
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('244.995,20 €');

    // ── 1c. Segunda mano CON renuncia a la exención (art. 20.Dos LIVA): IVA 21 % con
    // inversión del sujeto pasivo + AJD. Mismo importe que la obra nueva, distinto título
    // y aviso propio, porque el comprador lo autoliquida en vez de pagarlo al vendedor.
    await page.getByRole('button', { name: /renuncia IVA/ }).click();
    await expect(page.locator('h3', { hasText: /^IVA/ }).first()).toHaveText('IVA (renuncia · ISP) (21,00 %)');
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
    await expect(page.locator('h3', { hasText: /^ITP/ }).first()).toHaveText('ITP (11,13 %)');

    // Notaría sobre 1.600.000 €: 90,15 + 24.040,49×0,45 % + 30.050,60×0,15 % +
    //   90.151,82×0,10 % + 450.759,07×0,05 % + 998.987,90×0,03 % = 858,63583 ;
    //   × 1,21 = 1.038,9494 ; × 1,75 = 1.818,1614
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('1818,16 €');
    // Registro: 24,04 + 42,0709 + 37,5633 + 67,6139 + 135,2277 + 199,7976 = 506,3133 ;
    //   + 9,015182 ; × 1,21 = 623,5474 (por debajo del tope REGISTRO_MAXIMO de 2.181,67)
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('623,55 €');
    // Total = 178.000 + 1.818,1614 + 623,5474 + 500 = 180.941,7088 → 11,3089 %
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('180.941,71 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toContain('11,31 %');
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('1.780.941,71 €');

    // ── Ceuta: art. 57 bis.3.a) del TRLITPAJD bonifica el 50 % de la cuota de las
    // transmisiones de inmuebles situados allí, sin distinguir el uso. Tipo 6 % (tarifa
    // estatal del art. 11 TRLITPAJD, declarado como excepción en ITP_CCAA porque Ceuta no
    // figura en TIPOS_ITP_CCAA_2025): 200.000 × 6 % = 12.000 ; × 0,5 = 6.000 (efectivo 3 %).
    await page.locator('#select-ccaa').selectOption('ceuta');
    await rellenar(page, 'Precio del local comercial', '200000');
    expect(await valorTarjeta(page, /^ITP/)).toBe('6000,00 €');
    await expect(page.locator('h3', { hasText: /^ITP/ }).first()).toHaveText('ITP (3,00 %)');
    // ⚠️ 26/09/2026 (hallazgo 2214, motor reparado en 242fffcd): en Ceuta la factura de notaría
    // y la de registro NO llevan IVA sino IPSI, que el catálogo no calcula. Sin el × 1,21:
    //   notaría: arancel 90,15 + 108,182205 + 45,0759 + 90,15182 + 49.746,97 × 0,05 % (24,873485)
    //     = 358,43341 × 1,75 = 627,26 (con IVA eran 758,98)
    //   registro: 186,2120635 + 9,015182 = 195,23 (con IVA, 236,22)
    // Total = 6.000 + 627,26 + 195,23 + 500 = 7.322,49, y PARCIAL: le falta el IPSI de esas facturas.
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('627,26 €');
    await expect(page.locator('h3', { hasText: 'Gastos de notaría' })).toHaveText('Gastos de notaría (sin IPSI)');
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('195,23 €');
    await expect(page.locator('h3', { hasText: 'Registro de la Propiedad' })).toHaveText('Registro de la Propiedad (sin IPSI)');
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('7322,49 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toContain('SIN el IPSI de las facturas de notaría y registro');
    expect(await tituloTarjeta24(page, /^COSTE TOTAL/)).toBe('COSTE TOTAL (PARCIAL)');
    expect(await valorTarjeta(page, /^COSTE TOTAL/)).toBe('207.322,49 €');
    expect(await descripcionTarjeta(page, /^COSTE TOTAL/)).toBe(
      // 26/09/2026: la frase común de las siete para los honorarios, sin «coste real».
      'Las facturas de notaría y registro llevan además IPSI, que esta herramienta no calcula, así que cuestan más de lo que se muestra.',
    );

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

    // Importe negativo: nada de ITP negativo ni de coste total negativo. Escrito y legible, se
    // nombra como no válido en vez de pedirlo (patrón 5, hallazgo 3062, 08/10/2026).
    await campo.fill('-50000');
    await expect(page.getByText('El precio escrito («-50000») tiene que ser mayor que 0').first()).toBeVisible();
    await expect(page.locator('h3', { hasText: 'COSTE TOTAL DE ADQUISICIÓN' })).toHaveCount(0);
    // Y al salir del campo, NumberInput lo lleva al mínimo declarado (min = 0).
    await campo.blur();
    await expect(campo).toHaveValue('0');

    // Base cero: mismo tratamiento, sin tarjetas a 0,00 €.
    await expect(page.getByText('El precio escrito («0») tiene que ser mayor que 0').first()).toBeVisible();
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

    // Plusvalía municipal, por los dos métodos:
    //   objetivo = 40.000 × 0,12 (art. 107.4 TRLRHL, RDL 8/2023, 10 años) × 25 % = 1.200
    //     (hasta el 24/09/2026, 0,08 → 800; hallazgo 1559 de la familia)
    //   real     = (200.000 − 150.000) × 40.000/100.000 × 25 % = 5.000
    //   → gana el objetivo, 1.200 €
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('1200,00 €');
    expect(await descripcionTarjeta(page, 'Plusvalía municipal')).toContain('Método objetivo');

    // Sin gestoría del vendedor (art. 35.1 LIRPF):
    //   adquisición = 150.000 + 15.000 = 165.000
    //   transmisión = 200.000 − 6.000 de comisión − 1.200 de plusvalía = 192.800
    //   ganancia    = 27.800 → IRPF = 6.000×19 % + 21.800×21 % = 1.140 + 4.578 = 5.718
    //   gastos      = 1.200 + 6.000 + 5.718 = 12.918 → neto 187.082
    expect(await valorTarjeta(page, 'Valor de adquisición')).toBe('165.000,00 €');
    expect(await valorTarjeta(page, 'Ganancia patrimonial')).toBe('27.800,00 €');
    expect(await valorTarjeta(page, 'IRPF sobre la ganancia')).toBe('5718,00 €');
    expect(await valorTarjeta(page, 'NETO QUE RECIBES')).toBe('187.082,00 €');

    // Ahora 2.000 € de gestoría del vendedor, que SÍ minoran el valor de transmisión:
    //   transmisión = 200.000 − 8.000 − 1.200 = 190.800 ; ganancia = 25.800
    //   IRPF = 1.140 + 19.800×21 % = 1.140 + 4.158 = 5.298
    //   gastos = 1.200 + 6.000 + 2.000 + 5.298 = 14.498 → neto 185.502
    await rellenar(page, 'Gestoría y certificados del vendedor (€)', '2000');
    expect(await valorTarjeta(page, 'Valor de transmisión')).toBe('190.800,00 €');
    expect(await valorTarjeta(page, 'Ganancia patrimonial')).toBe('25.800,00 €');
    expect(await valorTarjeta(page, 'IRPF sobre la ganancia')).toBe('5298,00 €');
    expect(await valorTarjeta(page, 'Total gastos de la venta')).toBe('14.498,00 €');
    expect(await valorTarjeta(page, 'NETO QUE RECIBES')).toBe('185.502,00 €');
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
    await expect(page.locator('h3', { hasText: /^ITP/ }).first()).toHaveText('ITP (7,75 %)');
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
    await expect(panel).toContainText('7,75 %');
    await expect(panel).toContainText('1,5 %');
  });

  /**
   * ✅ HALLAZGO 332 (medio), reparado — el único sello de datos era el de la compra
   * («ITP/AJD/IVA 2026», verificado el 17/06/2026), mientras la mitad vendedora calcula con
   * COEFICIENTES_IIVTNU_2025 (verificados el 15/01/2025, y que se actualizan cada año por
   * Ley de Presupuestos). Un sello de 2026 cubriendo datos de 2025 es peor que no tenerlo.
   */
  // ⚠️ REESCRITO el 24/09/2026 (hallazgo 1579): la mitad del vendedor lleva ahora DOS sellos,
  // uno por tributo, porque la plusvalía y el IRPF de la ganancia tienen fuente y fecha
  // propias (`PLUSVALIA_MUNICIPAL_META`, re-verificada el 24/09/2026 con la tabla del RDL
  // 8/2023, y `GANANCIAS_PATRIMONIALES_META`, art. 66 LIRPF, 12/08/2026).
  test('CASO 7 (regresión 332) — cada mitad lleva su propio sello de datos normativos', async ({ page }) => {
    await page.goto(RUTA);

    const sellos = page.locator('[class*="dataReference"]');
    await expect(sellos).toHaveCount(3);
    await expect(sellos.nth(0)).toContainText('quien compra');
    await expect(sellos.nth(1)).toContainText('quien vende');
    await expect(sellos.nth(2)).toContainText('quien vende');
    // Cada sello de la venta declara SU fecha, no la de la compra.
    await expect(sellos.nth(1)).toContainText('24/09/2026');
    await expect(sellos.nth(2)).toContainText('12/08/2026');
  });

  // ══════════════════════════════════════════════════════════════════════════
  // RE-INSPECCIÓN 02/09/2026 — tres casos nuevos, resueltos a mano ANTES de
  // ejecutar la app, sobre comunidades distintas a las ya cubiertas arriba.
  // El disparador fue la tanda de la nave industrial del mismo día: dos
  // hallazgos «medio» sobre TEXTOS de la rama de IVA, que aquí se comprueban
  // expresamente (CASO 8, apartados 8c y 8d).
  //
  // HALLAZGOS que esta re-inspección dejó documentados sin repararlos (el Inspector no
  // repara). Todos REPARADOS el 02/09/2026: sus casos de regresión están en el describe
  // «Regresión — hallazgos del 02/09/2026, reparados» (618, 619 y 623, 620 y 621, 622):
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
    await expect(page.locator('h3', { hasText: /^ITP/ }).first()).toHaveText('ITP (7,00 %)');
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
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toContain('7,55 %');
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('322.637,38 €');

    // ── 8b. Obra nueva del promotor: IVA_INMUEBLES_2025.local = 21 (Ley 37/1992):
    //   300.000 × 21 % = 63.000. AJD de ITP_CCAA.andalucia = 1,2 % → 3.600.
    await page.getByRole('button', { name: /Obra nueva/ }).click();
    await expect(page.locator('h3', { hasText: /^IVA/ }).first()).toHaveText('IVA (21,00 %)');
    expect(await valorTarjeta(page, /^IVA/)).toBe('63.000,00 €');
    await expect(page.locator('h3', { hasText: /^AJD/ }).first()).toHaveText('AJD (1,20 %)');
    expect(await valorTarjeta(page, /^AJD/)).toBe('3600,00 €');
    await expect(page.locator('h3', { hasText: /^ITP/ })).toHaveCount(0);
    // Total = 63.000 + 3.600 + 864,85775 + 272,52497 + 500 = 68.237,38271 → 22,7458 %
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('68.237,38 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toContain('22,75 %');
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('368.237,38 €');

    // ── 8c. Renuncia a la exención (art. 20.Dos LIVA): mismos importes que la obra
    // nueva, porque el tipo es el mismo, pero con inversión del sujeto pasivo.
    await page.getByRole('button', { name: /renuncia IVA/ }).click();
    await expect(page.locator('h3', { hasText: /^IVA/ }).first()).toHaveText('IVA (renuncia · ISP) (21,00 %)');
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
    await expect(page.locator('h3', { hasText: /^ITP/ }).first()).toHaveText('ITP (11,00 %)');

    // Notaría sobre 2.500.000 €: 90,15 + 108,18221 + 45,0759 + 90,15182 + 450.759,07×0,05 %
    //   + 1.898.987,90×0,03 % = 1.128,63583 ; × 1,21 = 1.365,64935 ; × 1,75 = 2.389,88637
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('2389,89 €');
    // Registro: 24,04 + 42,07086 + 37,56325 + 67,61387 + 135,22772 + 379,79758 = 686,31327
    //   (por debajo del tope REGISTRO_MAXIMO de 2.181,67) ; + 9,015182 ; × 1,21 = 841,34743
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('841,35 €');
    // Total = 275.000 + 2.389,89 + 841,35 + 500 = 278.731,24 → 11,1492 %
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('278.731,24 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toContain('11,15 %');
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('2.778.731,24 €');

    // ── Canarias con RENUNCIA: allí no se devenga IVA sino IGIC (TERRITORIOS_SIN_IVA),
    // así que el impuesto principal no se calcula —no se inventa un 21 %— pero la cuota
    // gradual de AJD sí se devenga: ITP_CCAA.canarias.ajd = 0,75 % → 300.000 × 0,75 % = 2.250.
    await page.locator('#select-ccaa').selectOption('canarias');
    await rellenar(page, 'Precio del local comercial', '300000');
    // En Canarias el botón nombra la renuncia al IGIC (art. 50.Cinco Ley 4/2012), no al IVA.
    await page.getByRole('button', { name: /2ª mano con renuncia/ }).click();
    await expect(page.locator('h3', { hasText: 'IGIC' }).first()).toHaveText('IGIC');
    expect(await valorTarjeta(page, 'IGIC')).toBe('No calculado');
    // El texto nombra la operación ELEGIDA (la renuncia), no siempre la obra nueva.
    expect(await descripcionTarjeta(page, 'IGIC')).toContain('la renuncia a la exención');
    expect(await valorTarjeta(page, /^AJD/)).toBe('2250,00 €');
    await expect(page.getByText(/no se aplica el IVA/)).toBeVisible();
    // ⚠️ 26/09/2026 (hallazgo 2214): notaría y registro sin IVA en Canarias (llevan IGIC):
    //   notaría: 408,43341 × 1,75 = 714,76 (con IVA, 864,86) · registro: 216,2120635 +
    //   9,015182 = 225,23 (con IVA, 272,52)
    // Total PARCIAL = 2.250 + 714,76 + 225,23 + 500 = 3.689,99
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('714,76 €');
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('225,23 €');
    await expect(page.locator('h3', { hasText: 'Registro de la Propiedad' })).toHaveText('Registro de la Propiedad (sin IGIC)');
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('3689,99 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toContain('SIN el IGIC');
    expect(await valorTarjeta(page, 'COSTE TOTAL')).toBe('303.689,99 €');
    // El IGIC de la compra puede ser cero (dirección «puede ser»); el de las facturas, no.
    expect(await descripcionTarjeta(page, /^COSTE TOTAL/)).toBe(
      'No incluye el IGIC: el coste real puede ser mayor. Las facturas de notaría y registro llevan además IGIC, que esta herramienta no calcula, así que cuestan más de lo que se muestra.',
    );
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
    // Escrito y legible: se nombra como no válido (patrón 5, hallazgo 3062, 08/10/2026).
    await expect(page.getByText('El precio escrito («-50000») tiene que ser mayor que 0').first()).toBeVisible();
    await expect(page.locator('h3', { hasText: 'COSTE TOTAL' })).toHaveCount(0);
    await campo.blur();
    await expect(campo).toHaveValue('0');   // min = 0 del NumberInput

    // Cero: mismo tratamiento, sin tarjetas a 0,00 €.
    await expect(page.getByText('El precio escrito («0») tiene que ser mayor que 0').first()).toBeVisible();
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
    // 26/09/2026 (hallazgo 2209): con IVA la ayuda sigue sin decir «el mayor de ambos» para el
    // precio, pero nombra el valor de referencia como SUELO DEL AJD (art. 30.1 TRLITPAJD).
    expect(enIva).not.toContain('el mayor de ambos');
    expect(enIva).toContain('La base del AJD no puede ser inferior al valor de referencia catastral (art. 30.1 TRLITPAJD)');
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
    await expect(page.locator('h3', { hasText: /^AJD/ }).first()).toHaveText('AJD (0,25 %)');
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
    await expect(page.getByRole('button', { name: /Obra nueva/ })).toContainText('IVA 21 %');

    await page.locator('#select-ccaa').selectOption('canarias');
    const obraNueva = page.getByRole('button', { name: /Obra nueva/ });
    await expect(obraNueva).not.toContainText('IVA');
    await expect(obraNueva).toContainText('IGIC');
    // Desde el 24/09/2026 el rótulo principal también: «2ª mano con renuncia IGIC».
    await expect(page.getByRole('button', { name: /2ª mano con renuncia/ })).toContainText('renuncia IGIC');

    // El literal ya no está en el JSX: el rótulo se construye con la constante.
    const fuente = await import('node:fs/promises').then((fs) =>
      fs.readFile('app/simulador-gastos-compraventa-local-comercial/page.tsx', 'utf8'),
    );
    expect(fuente).toContain('IVA_LOCAL_COMERCIAL');
    expect(fuente).not.toContain('Paga IVA 21 % + AJD');
  });

  // 622 — el rango de AJD de la FAQ se deriva de la tabla, no se escribe a mano.
  // ⚠️ 24/09/2026: el rango que toca a un LOCAL es `RANGO_AJD_OTROS` (del 0,5 % al 1,5 %). El
  // 0 % del País Vasco es la exención de la primera transmisión de VIVIENDA, que deja fuera los
  // locales de negocio (NF 1/2011 de Bizkaia art. 58.35, en la ficha del motor): la FAQ lo
  // decía «del 0% al 1,5%» y prometía un AJD cero que un local no tiene.
  test('622 — la FAQ del AJD cita el rango de un local, derivado de la tabla', async ({ page }) => {
    await page.goto(RUTA);
    // El contenido de EducationalSection se monta siempre en el DOM (por SEO), así que
    // no hace falta abrirlo para leerlo.
    const faq = page.getByText(/¿Cuánto AJD se paga si hay renuncia/).locator('xpath=..');
    const texto = (await faq.innerText()).replace(/\s+/g, ' ');
    expect(texto).not.toContain('(0,5 %-1,5 %)');
    expect(texto).not.toContain('del 0 % al 1,5 %');
    expect(texto).toContain('del 0,5 % al 1,5 %');
    // Y la renuncia con tipo propio, que es la pregunta: Valencia, 2 % (Ley 13/1997, art. 14).
    expect(texto).toContain('la Comunitat Valenciana, el 2 %');
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

    // ── Plusvalía municipal, por los dos métodos:
    //   objetivo = 80.000 × 0,09 (art. 107.4 TRLRHL, RDL 8/2023, 12 años) × 25 %
    //              (PLUSVALIA_MUNICIPAL_META.tipoOrientativo) = 1.800
    //              (hasta el 24/09/2026, 0,08 → 1.600; hallazgo 1559 de la familia)
    //   real     = (400.000 − 250.000) × 80.000/200.000 × 25 % = 15.000
    //   → gana el objetivo, 1.800 €
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('1800,00 €');
    expect(await descripcionTarjeta(page, 'Plusvalía municipal')).toContain('Método objetivo');

    // ── Ganancia con el local AFECTO (calcularGananciaInmueble, arts. 34-36 LIRPF):
    //   adquisición = 250.000 + 30.000 − 60.000 de amortizaciones = 220.000
    //   transmisión = 400.000 − (16.000 de comisión + 1.500 de gestoría) − 1.800 = 380.700
    //   ganancia    = 380.700 − 220.000 = 160.700
    //   IRPF        = 6.000×19 % + 44.000×21 % + 110.700×23 %
    //               = 1.140 + 9.240 + 25.461 = 35.841
    //   gastos      = 1.800 + 16.000 + 1.500 + 35.841 = 55.141 → 13,7853 % de 400.000
    //   neto        = 400.000 − 55.141 = 344.859
    expect(await valorTarjeta(page, 'Valor de adquisición')).toBe('220.000,00 €');
    expect(await descripcionTarjeta(page, 'Valor de adquisición')).toContain('60.000,00 € de amortizaciones deducidas');
    expect(await valorTarjeta(page, 'Valor de transmisión')).toBe('380.700,00 €');
    expect(await valorTarjeta(page, 'Ganancia patrimonial')).toBe('160.700,00 €');
    expect(await valorTarjeta(page, 'IRPF sobre la ganancia')).toBe('35.841,00 €');
    expect(await valorTarjeta(page, 'Comisión de la inmobiliaria')).toBe('16.000,00 €');
    expect(await valorTarjeta(page, 'Total gastos de la venta')).toBe('55.141,00 €');
    expect(await descripcionTarjeta(page, 'Total gastos de la venta')).toContain('13,79 %');
    expect(await valorTarjeta(page, 'NETO QUE RECIBES')).toBe('344.859,00 €');

    // ── Volver a «Local no afecto».
    // ⚠️ 26/09/2026 (hallazgo 2199): el perfil ya NO apaga las amortizaciones. El local
    // alquilado por un particular es «no afecto» (art. 27.2 LIRPF) y también minora su valor de
    // adquisición en ellas (art. 35.2 LIRPF; art. 40 RIRPF), así que el campo sigue a la vista
    // y las 60.000 siguen restando: mismas cifras. La diferencia la da el DATO, no el perfil:
    // sin amortizaciones (el local que no se alquiló) sale lo que antes daba el perfil.
    //   adquisición = 280.000 ; ganancia = 100.700
    //   IRPF        = 1.140 + 9.240 + 50.700×23 % = 1.140 + 9.240 + 11.661 = 22.041
    //   gastos      = 1.800 + 16.000 + 1.500 + 22.041 = 41.341 → neto 358.659
    await page.getByRole('button', { name: /Local no afecto/ }).click();
    await expect(page.locator('input[aria-label="Amortizaciones acumuladas deducidas (€)"]')).toHaveValue('60000');
    expect(await valorTarjeta(page, 'Valor de adquisición')).toBe('220.000,00 €');
    expect(await valorTarjeta(page, 'IRPF sobre la ganancia')).toBe('35.841,00 €');
    await rellenar(page, 'Amortizaciones acumuladas deducidas (€)', '');
    expect(await valorTarjeta(page, 'Valor de adquisición')).toBe('280.000,00 €');
    expect(await valorTarjeta(page, 'Ganancia patrimonial')).toBe('100.700,00 €');
    expect(await valorTarjeta(page, 'IRPF sobre la ganancia')).toBe('22.041,00 €');
    expect(await valorTarjeta(page, 'NETO QUE RECIBES')).toBe('358.659,00 €');
  });

  // ⚠️ REESCRITO el 24/09/2026. El caso daba al local el AJD del 0 % y el ITP del 4 % del País
  // Vasco, que son los de la VIVIENDA. Un local no lo es: paga el ITP del 7 % (NF 1/2011 de
  // Bizkaia art. 13.a; NF 18/1987 de Gipuzkoa art. 11.1.a) y el AJD del 0,5 %, porque la
  // exención foral es solo de la primera transmisión de vivienda y deja fuera los locales de
  // negocio (NF 1/2011 de Bizkaia art. 58.35) — `ITP_CCAA['pais-vasco'].tipoGeneralNoVivienda`
  // y `.ajd`, fuentes citadas en la propia ficha del motor.
  test('CASO 12 (límite) — País Vasco: un local no es vivienda (ITP 7 % y AJD 0,5 %); y en el vendedor, el tope de 20 años y el tramo del 30 %', async ({ page }) => {
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

    // ── 12a. Obra nueva: IVA_INMUEBLES_2025.local = 21 % → 105.000, y AJD del 0,5 % sobre
    // un local → 2.500 (hasta el 24/09/2026 la app no lo cobraba: hallazgos 1583 y 1592).
    await page.getByRole('button', { name: /Obra nueva/ }).click();
    await expect(page.locator('h3', { hasText: /^IVA/ }).first()).toHaveText('IVA (21,00 %)');
    expect(await valorTarjeta(page, /^IVA/)).toBe('105.000,00 €');
    await expect(page.locator('h3', { hasText: /^AJD/ }).first()).toHaveText('AJD (0,50 %)');
    expect(await valorTarjeta(page, /^AJD/)).toBe('2500,00 €');
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe(NOTARIA_500K);
    expect(await descripcionTarjeta(page, 'Gastos de notaría')).toContain('922,81 €');
    expect(await descripcionTarjeta(page, 'Gastos de notaría')).toContain('1230,41 €');
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe(REGISTRO_500K);
    // Total = 105.000 + 2.500 + 1.076,61 + 345,12 + 500 = 109.421,73 → 21,8843 %
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('109.421,73 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toContain('21,88 %');
    expect(await valorTarjeta(page, 'COSTE TOTAL')).toBe('609.421,73 €');

    // ── 12b. Segunda mano: el 7 % de los inmuebles que no son vivienda. Un local tampoco
    // puede acogerse a los reducidos, que exigen vivienda habitual. 500.000 × 7 % = 35.000.
    // Sin AJD: la transmisión va por TPO.
    await page.getByRole('button', { name: /Segunda mano/ }).first().click();
    await expect(page.locator('h3', { hasText: /^ITP/ }).first()).toHaveText('ITP (7,00 %)');
    expect(await valorTarjeta(page, /^ITP/)).toBe('35.000,00 €');
    await expect(page.locator('h3', { hasText: /^AJD/ })).toHaveCount(0);
    // Total = 35.000 + 1.076,61 + 345,12 + 500 = 36.921,73 → 7,3843 %
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('36.921,73 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toContain('7,38 %');
    expect(await valorTarjeta(page, 'COSTE TOTAL')).toBe('536.921,73 €');

    // ── 12c. Vendedor con 25 años de propiedad: el coeficiente se topa en 20
    // (`Math.min(anios, 20)` de calcularPlusvaliaMunicipal) → 0,40 (art. 107.4 TRLRHL, RDL
    // 8/2023; era 0,45 hasta el 24/09/2026). Y aquí gana el método REAL:
    //   objetivo = 300.000 × 0,40 × 25 % = 30.000
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
    expect(await descripcionTarjeta(page, 'Total gastos de la venta')).toContain('3,56 %');
    expect(await valorTarjeta(page, 'NETO QUE RECIBES')).toBe('482.213,75 €');

    // ── 12d. Subiendo la venta a 1.500.000 € la ganancia entra en el ÚLTIMO tramo de
    // TRAMOS_GANANCIAS_PATRIMONIALES_2025, el 30 %, que ninguna prueba había alcanzado:
    //   real = (1.500.000 − 450.000) × 0,75 × 25 % = 196.875 → ahora gana el objetivo, 30.000
    //   transmisión = 1.500.000 − 30.000 = 1.470.000 ; ganancia = 1.020.000
    //   IRPF = 1.140 + 9.240 + 150.000×23 % + 100.000×27 % + 720.000×30 %
    //        = 1.140 + 9.240 + 34.500 + 27.000 + 216.000 = 287.880
    //   gastos = 30.000 + 287.880 = 317.880 → 21,192 % ; neto = 1.182.120
    await rellenar(page, 'Precio del local comercial', '1500000');
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('30.000,00 €');
    expect(await descripcionTarjeta(page, 'Plusvalía municipal')).toContain('Método objetivo');
    expect(await valorTarjeta(page, 'Valor de transmisión')).toBe('1.470.000,00 €');
    expect(await valorTarjeta(page, 'Ganancia patrimonial')).toBe('1.020.000,00 €');
    expect(await valorTarjeta(page, 'IRPF sobre la ganancia')).toBe('287.880,00 €');
    expect(await valorTarjeta(page, 'Total gastos de la venta')).toBe('317.880,00 €');
    expect(await descripcionTarjeta(page, 'Total gastos de la venta')).toContain('21,19 %');
    expect(await valorTarjeta(page, 'NETO QUE RECIBES')).toBe('1.182.120,00 €');
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

    // Referencia con el perfil particular (0 amortizaciones), calculada en el CASO 11 (con el
    // coeficiente de 12 años del RDL 8/2023, 0,09; hasta el 24/09/2026 eran 22.087 y 358.813).
    expect(await valorTarjeta(page, 'IRPF sobre la ganancia')).toBe('22.041,00 €');
    expect(await valorTarjeta(page, 'NETO QUE RECIBES')).toBe('358.659,00 €');

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
    expect(await valorTarjeta(page, 'IRPF sobre la ganancia')).toBe('22.041,00 €');
    expect(await valorTarjeta(page, 'NETO QUE RECIBES')).toBe('358.659,00 €');
    await amortizaciones.blur();
    await expect(amortizaciones).toHaveValue('0');
    expect(await valorTarjeta(page, 'NETO QUE RECIBES')).toBe('358.659,00 €');
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
    // perfil particular (CASO 11, recalculado el 24/09/2026 con el coeficiente de 12 años del
    // RDL 8/2023), no «No definido» ni un «SIN CUOTA» en verde.
    //
    // El orden de las aserciones es el que tenía cuando el test iba con `test.fail()`:
    // las dos primeras tarjetas se pintaban aun con el NaN, así que fallaban al instante,
    // mientras que esperar las de valor de adquisición y transmisión —que desaparecían
    // por completo— habría agotado el timeout, y eso Playwright lo cuenta como fallo REAL
    // aunque haya `test.fail()`. Se conserva para no reescribir lo que ya está verificado.
    expect(await valorTarjeta(page, 'IRPF sobre la ganancia')).toBe('22.041,00 €');
    expect(await valorTarjeta(page, 'NETO QUE RECIBES')).toBe('358.659,00 €');
    expect(await valorTarjeta(page, 'Total gastos de la venta')).toBe('41.341,00 €');
    expect(await valorTarjeta(page, 'Ganancia patrimonial')).toBe('100.700,00 €');
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

    // ⚠️ REESCRITO el 24/09/2026 (hallazgo 1560 de la familia). El art. 107.4 TRLRHL no da a
    // la reventa antes del año un coeficiente fijo (la app aplicaba 0,14): «se prorrateará el
    // coeficiente anual teniendo en cuenta el número de meses completos». Con años = 0 la app
    // pregunta los meses; sin ellos, el dato falta y la plusvalía no se inventa.
    await expect(page.locator('#meses-completos')).toBeVisible();
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('Sin calcular');
    expect(await descripcionTarjeta(page, 'Plusvalía municipal')).toBe(
      'No calculada (faltan los meses completos desde la compra)',
    );
    await page.locator('#meses-completos').selectOption('6');

    // ── Plusvalía municipal con 6 meses completos: coeficiente 0,15 × 6/12 = 0,075
    //   objetivo = 80.000 × 0,075 × 25 % (PLUSVALIA_MUNICIPAL_META.tipoOrientativo) = 1.500
    //   real     = (400.000 − 250.000) × 80.000/200.000 × 25 % = 15.000
    //   → gana el objetivo, 1.500 €
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('1500,00 €');
    expect(await descripcionTarjeta(page, 'Plusvalía municipal')).toContain('Método objetivo');

    // ── Y ese impuesto SÍ minora el valor de transmisión (art. 35.2 LIRPF):
    //   adquisición = 250.000 + 30.000 = 280.000
    //   comisión    = 400.000 × 4 % = 16.000
    //   transmisión = 400.000 − 16.000 − 1.500 − 1.500 = 381.000
    //   ganancia    = 381.000 − 280.000 = 101.000
    //   IRPF        = 6.000×19 % + 44.000×21 % + 51.000×23 %
    //               = 1.140 + 9.240 + 11.730 = 22.110
    //   gastos      = 1.500 + 16.000 + 1.500 + 22.110 = 41.110 → neto 358.890
    expect(await valorTarjeta(page, 'Valor de adquisición')).toBe('280.000,00 €');
    expect(await valorTarjeta(page, 'Valor de transmisión')).toBe('381.000,00 €');
    expect(await valorTarjeta(page, 'Ganancia patrimonial')).toBe('101.000,00 €');
    expect(await valorTarjeta(page, 'IRPF sobre la ganancia')).toBe('22.110,00 €');
    expect(await valorTarjeta(page, 'Total gastos de la venta')).toBe('41.110,00 €');
    expect(await valorTarjeta(page, 'NETO QUE RECIBES')).toBe('358.890,00 €');
    // Con los datos puestos (y los meses) el neto es firme: el rótulo NO lleva la marca de parcial.
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
    // Las preguntas que hablan de ITP tienen que decir lo mismo, derivado de la tabla.
    // ⚠️ 24/09/2026: el rango de un LOCAL es `RANGO_ITP_OTROS` (del 6 % al 13 %), no el de la
    // vivienda (del 4 %): el 4 % del País Vasco es solo de la vivienda, y un local paga allí
    // el 7 % (`ITP_CCAA['pais-vasco'].tipoGeneralNoVivienda`). El 6 % es el tipo general más
    // bajo para lo que no es vivienda.
    // ⚠️ 13/09/2026: el NÚMERO de preguntas que citan el rango no es la invariante y envejece
    // con cada pregunta nueva —el commit d2df9760 añadió la de «escriturar», que también lo
    // deriva, y dejó este test en rojo sin que nada hubiera regresado—. Lo que el hallazgo 665
    // protege es que TODAS las que lo citen digan lo mismo, derivado de la tabla.
    // ⚠️ 26/09/2026 (hallazgo 2202): el % va separado por un espacio DURO, que `\s` reconoce.
    const citasDeITP = (faq.match(/tipo general de (?:la|su) comunidad[^.]*?del \d+\s?% al \d+\s?%/g) ?? [])
      .map((frase) => frase.match(/del \d+\s?% al \d+\s?%/)?.[0]?.replace(ESPACIO_DURO, ' '));
    expect(citasDeITP.length).toBeGreaterThanOrEqual(2);
    expect(new Set(citasDeITP).size).toBe(1);
    expect(citasDeITP[0]).toBe('del 6 % al 13 %');
    // Y lo que estaba escrito a mano ya no aparece.
    expect(faq).not.toContain('10 %-11 %');
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
    // Desde el 24/09/2026 (hallazgo 1570), con la plusvalía sin calcular la tarjeta del IRPF
    // dice que la cuota es un máximo; el rango del ahorro sale cuando la plusvalía está.
    await rellenar(page, 'Años de propiedad', '12');
    await rellenar(page, 'Valor catastral del suelo (€)', '80000');

    // TRAMOS_GANANCIAS_PATRIMONIALES_2025: primer tramo 19 %, último 30 %.
    expect(await descripcionTarjeta(page, 'IRPF sobre la ganancia')).toContain('Base del ahorro (19–30 %)');

    // Y el FAQPage cita ese mismo rango, en vez de uno tecleado aparte.
    const bloques = await page.locator('script[type="application/ld+json"]').allTextContents();
    const faq = bloques.find((b) => b.includes('FAQPage')) ?? '';
    expect(faq.replace(ESPACIO_DURO, ' ')).toContain('del 19 % al 30 %');
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
    await expect(panel).toContainText('8 %');     // tipoGeneral de ITP_CCAA.aragon
    await expect(panel).toContainText('1,5 %');   // AJD de ITP_CCAA.aragon
    await expect(page.locator('p[class*="infoCcaaNote"]').first())
      // La frase del motor (`describirSubidaITP`, 24/09/2026), con el espacio antes del %.
      .toContainText('escala progresiva (8 % → 8,50 % → 9 % → 9,50 % → 10 %)');

    // ── 17a. Segunda mano: exenta de IVA (art. 20.Uno.22º LIVA) → ITP.
    // 300.000 € cae entero en el primer tramo de la escala (hasta 400.000 al 8 %):
    //   300.000 × 8 % = 24.000. Tipo efectivo = 8,00 %, que aquí coincide con el nominal.
    // Un local NO puede acogerse a las bonificaciones del art. 121-4 ni del 121-5: las
    // cinco exigen «Vivienda habitual» en sus `condiciones`.
    await page.getByRole('button', { name: /Segunda mano/ }).first().click();
    await expect(page.locator('h3', { hasText: /^ITP/ }).first()).toHaveText('ITP (8,00 %)');
    expect(await valorTarjeta(page, /^ITP/)).toBe('24.000,00 €');
    await expect(page.locator('h3', { hasText: /^AJD/ })).toHaveCount(0);

    // Notaría y registro sobre 300.000 €, ya resueltos en el CASO 8 (Andalucía):
    //   notaría 408,43341 × 1,21 × 1,75 = 864,85775 ; registro 225,2272455 × 1,21 = 272,52497
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('864,86 €');
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('272,52 €');
    // Total = 24.000 + 864,86 + 272,52 + 500 = 25.637,38 → 8,5458 % de 300.000
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('25.637,38 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toContain('8,55 %');
    expect(await valorTarjeta(page, 'COSTE TOTAL')).toBe('325.637,38 €');

    // ── 17b. Obra nueva del promotor. LA PARTICULARIDAD DEL LOCAL: no es inmueble
    // residencial, así que el IVA es el tipo GENERAL —IVA_INMUEBLES_2025.local = 21,
    // art. 90 LIVA— y no el 10 % del art. 91.Uno.1.7º, que solo alcanza a la vivienda y
    // a sus anejos (IVA_INMUEBLES_2025.obraNueva / anejoVinculado, los que usan las apps
    // hermanas de garaje y trastero). 300.000 × 21 % = 63.000, no 30.000.
    //   AJD de ITP_CCAA.aragon = 1,5 % → 300.000 × 1,5 % = 4.500
    await page.getByRole('button', { name: /Obra nueva/ }).click();
    await expect(page.locator('h3', { hasText: /^IVA/ }).first()).toHaveText('IVA (21,00 %)');
    expect(await valorTarjeta(page, /^IVA/)).toBe('63.000,00 €');
    await expect(page.locator('h3', { hasText: /^AJD/ }).first()).toHaveText('AJD (1,50 %)');
    expect(await valorTarjeta(page, /^AJD/)).toBe('4500,00 €');
    await expect(page.locator('h3', { hasText: /^ITP/ })).toHaveCount(0);
    // Total = 63.000 + 4.500 + 864,86 + 272,52 + 500 = 69.137,38 → 23,0458 %
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('69.137,38 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toContain('23,05 %');
    expect(await valorTarjeta(page, 'COSTE TOTAL')).toBe('369.137,38 €');

    // ── 17c. Renuncia a la exención (art. 20.Dos LIVA): mismo tipo, mismo AJD, pero
    // autoliquidado por el comprador. Nunca ITP a la vez.
    await page.getByRole('button', { name: /renuncia IVA/ }).click();
    await expect(page.locator('h3', { hasText: /^IVA/ }).first()).toHaveText('IVA (renuncia · ISP) (21,00 %)');
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
      ['400000', '32.000,00 €', 'ITP (8,00 %)'],
      ['450000', '36.250,00 €', 'ITP (8,06 %)'],
      ['500000', '40.750,00 €', 'ITP (8,15 %)'],
      ['750000', '64.500,00 €', 'ITP (8,60 %)'],
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
    await expect(page.locator('h3', { hasText: /^ITP/ }).first()).toHaveText('ITP (8,69 %)');

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
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toContain('8,97 %');
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
    // Desde el 24/09/2026 (hallazgo 1578) el año negativo no «falta»: está escrito y es imposible.
    expect(await descripcionTarjeta(page, 'Plusvalía municipal')).toBe(
      'No calculada (los años de propiedad no pueden ser negativos)',
    );
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
    await expect(page.locator('h3', { hasText: /^ITP/ }).first()).toHaveText('ITP (8,00 %)');
    expect(await valorTarjeta(page, /^ITP/)).toBe('20.000,00 €');
    await expect(page.locator('h3', { hasText: /^AJD/ })).toHaveCount(0);
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('811,92 €');
    expect(await descripcionTarjeta(page, 'Gastos de notaría')).toContain('695,93 €');
    expect(await descripcionTarjeta(page, 'Gastos de notaría')).toContain('927,91 €');
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('254,37 €');
    expect(await valorTarjeta(page, 'Gastos de gestoría')).toBe('500,00 €');
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('21.566,29 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toContain('8,63 %');
    expect(await valorTarjeta(page, /COSTE TOTAL/)).toBe('271.566,29 €');

    // ── Obra nueva del promotor: IVA del 21 % (local, no vivienda) + AJD del 1,5 %
    await page.getByRole('button', { name: /Obra nueva/ }).click();
    await expect(page.locator('h3', { hasText: /^IVA/ }).first()).toHaveText('IVA (21,00 %)');
    expect(await valorTarjeta(page, /^IVA/)).toBe('52.500,00 €');
    await expect(page.locator('h3', { hasText: /^AJD/ }).first()).toHaveText('AJD (1,50 %)');
    expect(await valorTarjeta(page, /^AJD/)).toBe('3750,00 €');
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('57.816,29 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toContain('23,13 %');
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
    expect(await descripcionTarjeta(page, /Total gastos de la venta/)).toContain('3,00 %');
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
  // Obra nueva en Melilla (la renuncia a la exención no existe en el IPSI: ver el test):
  //   allí no hay IVA (rige el IPSI): el impuesto principal NO se cifra,
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
    await expect(recuadro).toContainText('Bonificación automática del 50 % para inmuebles en Melilla');

    // ── Segunda mano: la cuota llega bonificada y la pantalla lo DICE (hallazgos 619/623)
    await expect(page.locator('h3', { hasText: /^ITP/ }).first()).toHaveText('ITP (3,00 %)');
    expect(await valorTarjeta(page, /^ITP/)).toBe('12.000,00 €');
    expect(await descripcionTarjeta(page, /^ITP/)).toBe(
      'Tipo general con la bonificación del 50 % de la cuota ya aplicada (art. 57 bis.3.a TRLITPAJD)',
    );
    await expect(page.locator('h3', { hasText: /^AJD/ })).toHaveCount(0);
    // ⚠️ 26/09/2026 (hallazgo 2214): en Melilla notaría y registro llevan IPSI, no IVA, y el
    // catálogo no lo calcula: sin el × 1,21 del motor anterior.
    //   notaría: arancel 458,43341 × 1,75 = 802,26 · ×1,5 = 687,65 · ×2 = 916,87
    //   registro: 246,2120635 + 9,015182 = 255,23
    //   total = 12.000 + 802,26 + 255,23 + 500 = 13.557,49 (3,39 %), PARCIAL por ese IPSI
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('802,26 €');
    expect(await descripcionTarjeta(page, 'Gastos de notaría')).toContain('687,65 €');
    expect(await descripcionTarjeta(page, 'Gastos de notaría')).toContain('916,87 €');
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('255,23 €');
    await expect(page.locator('h3', { hasText: /Total gastos adicionales/ })).toHaveText('Total gastos adicionales (parcial)');
    expect(await valorTarjeta(page, /Total gastos adicionales/)).toBe('13.557,49 €');
    expect(await descripcionTarjeta(page, /Total gastos adicionales/)).toContain('3,39 %');
    await expect(page.locator('h3', { hasText: /COSTE TOTAL/ })).toHaveText('COSTE TOTAL (PARCIAL)');
    expect(await valorTarjeta(page, /COSTE TOTAL/)).toBe('413.557,49 €');
    expect(await descripcionTarjeta(page, /COSTE TOTAL/)).toContain('llevan además IPSI, que esta herramienta no calcula, así que cuestan más de lo que se muestra');

    // ── Renuncia: ⚠️ REESCRITO el 24/09/2026. El caso la calculaba en Melilla como una
    // operación sin impuesto principal más AJD. En el IPSI la renuncia NO existe: la Ley
    // 8/1991 exime las entregas de inmuebles remitiéndose a la del IVA (art. 7) sin regular
    // ninguna renuncia, y las cuotas soportadas en entregas de inmuebles no son deducibles
    // (art. 20.3), que es lo que la renuncia del art. 20.Dos LIVA exige (BOE-A-1991-7645,
    // consultado en sesión). La segunda mano paga siempre ITP, y el botón se desactiva y lo dice.
    const renuncia = page.getByRole('button', { name: /2ª mano con renuncia/ });
    await expect(renuncia).toBeDisabled();
    await expect(renuncia).toContainText('No existe en el IPSI: paga ITP');
    const cuerpoVisible = (await page.locator('body').innerText()).replace(ESPACIO_DURO, ' ');
    expect(cuerpoVisible).toContain('no existe en el IPSI: la segunda mano paga siempre ITP');
    // Y NO el aviso de la renuncia peninsular, que aquí prometería un IVA inexistente
    expect(cuerpoVisible).not.toContain('Renuncia a la exención de IVA (Art. 20.Dos LIVA)');

    // ── Obra nueva: tampoco hay IVA, y el IPSI no se cifra; la cuota gradual de AJD sí se
    // devenga y se bonifica (art. 57 bis.1): 400.000 × 0,5 % = 2.000 → 1.000,00 (0,25 %).
    await page.getByRole('button', { name: /Obra nueva/ }).click();
    await expect(page.locator('h3', { hasText: /^IPSI/ }).first()).toHaveText('IPSI');
    expect(await valorTarjeta(page, /^IPSI/)).toBe('No calculado');
    expect(await descripcionTarjeta(page, /^IPSI/)).toContain(
      'En la Ciudad Autónoma de Melilla no rige el IVA: la compra de obra nueva tributa por el IPSI',
    );
    await expect(page.locator('h3', { hasText: /^AJD/ }).first()).toHaveText('AJD (0,25 %)');
    expect(await valorTarjeta(page, /^AJD/)).toBe('1000,00 €');
    expect(await descripcionTarjeta(page, /^AJD/)).toBe('Con la bonificación del 50 % de Ceuta y Melilla aplicada');
    // Falta un impuesto: ni el total ni el coste se dan por firmes.
    //   total = 1.000 + 802,26 + 255,23 + 500 = 2.557,49 (0,64 %) · coste 402.557,49
    await expect(page.locator('h3', { hasText: /Total gastos adicionales/ })).toHaveText('Total gastos adicionales (parcial)');
    expect(await valorTarjeta(page, /Total gastos adicionales/)).toBe('2557,49 €');
    expect(await descripcionTarjeta(page, /Total gastos adicionales/)).toContain('0,64 %');
    expect(await descripcionTarjeta(page, /Total gastos adicionales/)).toContain('SIN el IPSI');
    await expect(page.locator('h3', { hasText: /COSTE TOTAL/ })).toHaveText('COSTE TOTAL (PARCIAL)');
    expect(await valorTarjeta(page, /COSTE TOTAL/)).toBe('402.557,49 €');
    expect(await descripcionTarjeta(page, /COSTE TOTAL/)).toContain('No incluye el IPSI');
  });

  // ══════════════════════════════════════════════════════════════════════════
  // CASO 22 (RECHAZO) — la comisión de la inmobiliaria del VENDEDOR.
  //
  // Escenario base (el del CASO 11, para poder comparar): venta 400.000 · compra 250.000
  // + 30.000 de gastos · 12 años · suelo 80.000 · total 200.000 · gestoría del vendedor
  // 1.500 · comisión 4 %.
  //   plusvalía: objetivo = 80.000 × 0,09 (art. 107.4 TRLRHL, RDL 8/2023, 12 años) × 25 % = 1.800
  //              (0,08 → 1.600 hasta el 24/09/2026, hallazgo 1559 de la familia)
  //              real = 150.000 × (80.000/200.000) × 25 % = 15.000 → gana el objetivo
  //   adquisición = 280.000 · transmisión = 400.000 − 16.000 − 1.500 − 1.800 = 380.700
  //   ganancia = 100.700 → IRPF = 6.000×19 % + 44.000×21 % + 50.700×23 % = 22.041
  //   gastos = 1.800 + 16.000 + 1.500 + 22.041 = 41.341 → neto 358.659
  //
  // Con la comisión a 0 (que es donde la deja el `min = 0` del NumberInput al salir del
  // campo, y también lo que vale un campo VACÍO vía `parseSpanishNumberOr`):
  //   transmisión = 400.000 − 0 − 1.500 − 1.800 = 396.700 → ganancia 116.700
  //   IRPF = 1.140 + 9.240 + 66.700×23 % (= 15.341) = 25.721
  //   gastos = 1.800 + 0 + 1.500 + 25.721 = 29.021 → neto 370.979
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
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('1800,00 €');
    expect(await valorTarjeta(page, 'Comisión de la inmobiliaria')).toBe('16.000,00 €');
    expect(await valorTarjeta(page, 'IRPF sobre la ganancia')).toBe('22.041,00 €');
    expect(await valorTarjeta(page, /NETO QUE RECIBES/)).toBe('358.659,00 €');

    const comision = page.locator('input[aria-label="Comisión de la inmobiliaria (%)"]');

    // Texto: el NumberInput no admite los caracteres (regex /^-?[\d.,]*$/), el campo queda
    // vacío y `parseSpanishNumberOr` lo lee como 0 — no como NaN propagado a la cuota.
    await comision.fill('');
    await esperarValorEnReact(page, comision, '');
    await comision.type('abc');
    await expect(comision).toHaveValue('');
    expect(await valorTarjeta(page, 'Comisión de la inmobiliaria')).toBe('0,00 €');
    expect(await valorTarjeta(page, 'IRPF sobre la ganancia')).toBe('25.721,00 €');
    expect(await valorTarjeta(page, /NETO QUE RECIBES/)).toBe('370.979,00 €');

    // Negativa: al SALIR del campo, el `min = 0` del NumberInput la lleva a 0 y todo el
    // panel vuelve a cuadrar. Lo que ocurre MIENTRAS el campo tiene el foco va abajo.
    await sembrarImporte12(page, 'Comisión de la inmobiliaria (%)', '-4');
    await expect(comision).toHaveValue('0');
    expect(await valorTarjeta(page, 'Comisión de la inmobiliaria')).toBe('0,00 €');
    expect(await valorTarjeta(page, 'IRPF sobre la ganancia')).toBe('25.721,00 €');
    expect(await valorTarjeta(page, /NETO QUE RECIBES/)).toBe('370.979,00 €');
  });

  // ───────────────────────────────────────────────────────────────────────────
  // HALLAZGOS del 12/09/2026 (785, 786 y 787), REPARADOS: se escribieron con `test.fail()`
  // afirmando lo que DEBERÍA ocurrir y, al repararlos, se les quitó la marca y quedaron como
  // regresión (la base del Inspector no tiene ninguno abierto: comprobado el 06/10/2026).
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

    // Con el defecto: −16.000,00 € · 26.112,00 € · 13.212,00 € · 386.788,00 € (cifras del
    // 12/09, con el coeficiente anterior). Acotada a 0, con el de 12 años del RDL 8/2023 (0,09):
    // transmisión 396.700 · IRPF 25.721 · gastos 29.021 · neto 370.979 (CASO 22).
    expect(await valorTarjeta(page, 'Comisión de la inmobiliaria')).toBe('0,00 €');
    expect(await valorTarjeta(page, 'Valor de transmisión')).toBe('396.700,00 €');
    expect(await valorTarjeta(page, 'IRPF sobre la ganancia')).toBe('25.721,00 €');
    expect(await valorTarjeta(page, /Total gastos de la venta/)).toBe('29.021,00 €');
    expect(await valorTarjeta(page, /NETO QUE RECIBES/)).toBe('370.979,00 €');
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

    // La cuota que hay que poder reconstruir: 80.000 × 0,09 (12 años, RDL 8/2023; 0,08 hasta el
    // 24/09/2026) × 25 %
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('1800,00 €');

    // `textContent` y no `innerText`: el bloque educativo se monta siempre y se oculta por
    // CSS (así lo rastrea Googlebot), de modo que su texto también cuenta como «lo que la
    // página dice».
    const todo = ((await page.locator('body').textContent()) ?? '').replace(ESPACIO_DURO, ' ');
    // El 30 % del máximo legal sí está (esto pasa hoy):
    expect(todo).toContain('máximo legal del 30 %');
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
// Los hallazgos de esta ronda (1159, 1160 y 1161) se escribieron abajo con `test.fail()`,
// afirmando lo que DEBERÍA ocurrir; REPARADOS el 21/09/2026, hoy pasan sin la marca.
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
  //       1,4 % de ITP_CCAA.valencia → 11.200 (Ley 13/1997, art. 14.Cuatro, devengos desde el
  //       01/06/2026; ⚠️ el motor lo tuvo al 1,5 % anterior hasta el 24/09/2026).
  //       total = 168.000 + 11.200 + 1.309,96 + 429,95 + 500 =     181.439,910000
  //         → 22,679989 % → «22,68%» ; COSTE TOTAL =               981.439,910000
  //
  //   (c) Renuncia a la exención (art. 20.Dos LIVA): MISMO IVA que la obra nueva, que el
  //       comprador autoliquida por inversión del sujeto pasivo, y la ayuda del precio cambia
  //       de base (art. 78 LIVA, no el valor de referencia del art. 10 TRLITPAJD). ⚠️ Desde el
  //       24/09/2026 el AJD es el PROPIO de la renuncia en Valencia, el 2 % (Ley 13/1997,
  //       art. 14.Dos; hallazgo 1603, `ITP_CCAA.valencia.ajdRenuncia`) → 16.000:
  //       total = 168.000 + 16.000 + 1.309,96 + 429,95 + 500 =     186.239,910000
  //
  //   (d) 1.200.000 € supera el UMBRAL de 1.000.000 €, y desde ahí el 11 % grava TODO el valor
  //       (Ley 13/1997, art. 13.Uno: «el tipo aplicable será el 11 %»): 1.200.000 × 11 % =
  //       132.000 → «ITP (11,00%)». ⚠️ Hasta el 24/09/2026 la app lo calculaba como una escala
  //       (90.000 + 22.000 = 112.000, «9,33%»): 20.000 € de menos (hallazgos 1581 y 1602).
  // ══════════════════════════════════════════════════════════════════════════
  test('CASO 23 (normal) — Comunidad Valenciana, local de 800.000 €: ITP al 9 %, IVA del 21 % en obra nueva y en la renuncia, y el segundo tramo del 11 %', async ({ page }) => {
    await page.locator('#select-ccaa').selectOption('valencia');
    await sembrarImporte12(page, 'Precio del local comercial', '800000');

    // El recuadro de la comunidad publica los tipos NOMINALES y la escala, en formato español
    const panel = page.locator('text=ITP General').locator('xpath=ancestor::div[1]/ancestor::div[1]');
    await expect(panel).toContainText('9 %');     // tipoGeneral de ITP_CCAA.valencia
    await expect(panel).toContainText('1,4 %');   // AJD de ITP_CCAA.valencia
    // Valencia no tiene escala sino umbral, y el recuadro lo dice así (`describirSubidaITP`).
    await expect(page.locator('p[class*="infoCcaaNote"]').first()).toContainText(
      'En esta comunidad, el tipo general es del 9 %, y si el valor supera 1.000.000 € pasa al 11 % sobre TODO el valor, no solo sobre el exceso.',
    );

    // ── (a) Segunda mano: ITP al tipo general, sin AJD y sin IVA
    await page.getByRole('button', { name: /Segunda mano/ }).first().click();
    await expect(page.locator('h3', { hasText: /^ITP/ }).first()).toHaveText('ITP (9,00 %)');
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
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toContain('9,28 %');
    expect(await valorTarjeta(page, /COSTE TOTAL/)).toBe('874.239,91 €');

    // ── (b) Obra nueva: IVA del 21 % (local, no vivienda) + AJD del 1,4 %
    await page.getByRole('button', { name: /Obra nueva/ }).click();
    await expect(page.locator('h3', { hasText: /^IVA/ }).first()).toHaveText('IVA (21,00 %)');
    expect(await valorTarjeta(page, /^IVA/)).toBe('168.000,00 €');
    expect(await descripcionTarjeta(page, /^IVA/)).toContain('deducible');
    await expect(page.locator('h3', { hasText: /^AJD/ }).first()).toHaveText('AJD (1,40 %)');
    expect(await valorTarjeta(page, /^AJD/)).toBe('11.200,00 €');
    await expect(page.locator('h3', { hasText: /^ITP/ })).toHaveCount(0);
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('181.439,91 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toContain('22,68 %');
    expect(await valorTarjeta(page, /COSTE TOTAL/)).toBe('981.439,91 €');

    // ── (c) Renuncia a la exención: mismo IVA, con el AJD propio de la renuncia (2 %)
    await page.getByRole('button', { name: /renuncia IVA/ }).click();
    await expect(page.locator('h3', { hasText: /^IVA/ }).first()).toHaveText('IVA (renuncia · ISP) (21,00 %)');
    expect(await valorTarjeta(page, /^IVA/)).toBe('168.000,00 €');
    expect(await descripcionTarjeta(page, /^IVA/)).toContain('inversión del sujeto pasivo');
    await expect(page.locator('h3', { hasText: /^AJD/ }).first()).toHaveText('AJD (2,00 %)');
    expect(await valorTarjeta(page, /^AJD/)).toBe('16.000,00 €');
    expect(await descripcionTarjeta(page, /^AJD/)).toBe(
      'Tipo propio de la renuncia a la exención del IVA en la Comunidad Valenciana',
    );
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('186.239,91 €');
    await expect(page.locator('h3', { hasText: /^ITP/ })).toHaveCount(0);
    await expect(page.getByText('Renuncia a la exención de IVA (Art. 20.Dos LIVA)')).toBeVisible();
    // La base del IVA es la contraprestación pactada, no el valor de referencia (hallazgo 618)
    const ayuda = page
      .locator('input[aria-label="Precio del local comercial"]')
      .locator('xpath=following-sibling::p[1]');
    expect((await ayuda.innerText()).replace(/\s+/g, ' ')).toContain('Contraprestación pactada');

    // ── (d) Por encima del umbral, el 11 % sobre TODO el valor
    await page.getByRole('button', { name: /Segunda mano/ }).first().click();
    await sembrarImporte12(page, 'Precio del local comercial', '1200000');
    await expect(page.locator('h3', { hasText: /^ITP/ }).first()).toHaveText('ITP (11,00 %)');
    expect(await valorTarjeta(page, /^ITP/)).toBe('132.000,00 €');
  });

  // ══════════════════════════════════════════════════════════════════════════
  // CASO 24 (LÍMITE) — la ganancia patrimonial EXACTAMENTE en cero, con la comisión y la
  // gestoría del vendedor a cero.
  //
  //   venta 300.000 · compra 280.000 + 19.200 de gastos de aquella compra · 10 años ·
  //   suelo 40.000 · total catastral 100.000 · comisión 0 % · gestoría del vendedor 0
  //
  //   ⚠️ 24/09/2026 (hallazgo 1559 de la familia): con el coeficiente de 10 años del RDL
  //   8/2023 (0,12, antes 0,08) la plusvalía pasa de 800 a 1.200, y los gastos de aquella
  //   compra, de 19.200 a 18.800, para que la ganancia siga cayendo en el cero exacto.
  //   plusvalía, por los dos métodos:
  //     objetivo = 40.000 × 0,12 (art. 107.4 TRLRHL, 10 años) × 25 % =            1.200,00
  //     real     = (300.000 − 280.000) × 40.000/100.000 × 25 % =                2.000,00
  //     → gana el objetivo, 1.200,00 €
  //   valor de adquisición = 280.000 + 18.800 =                                298.800,00
  //   valor de transmisión = 300.000 − 0 de gastos − 1.200 de IIVTNU =         298.800,00
  //   ganancia = 298.800 − 298.800 =                                                 0,00
  //     → NI ganancia NI pérdida: `sinGananciaNiPerdida` (|ganancia| < medio céntimo).
  //       La rama de la pérdida sería falsa por partida doble —no se vende por debajo del
  //       coste y no hay nada que compensar en la declaración— y es justo lo que los
  //       hallazgos 823 y 845 corrigieron el 15/09/2026.
  //   IRPF = 0 → «SIN CUOTA», y aquí ese cero SÍ es un cero real: hay precio de compra.
  //   total gastos = 1.200 + 0 + 0 + 0 =                                         1.200,00
  //     → 1.200 / 300.000 = 0,4 % → «0,40%»
  //   neto = 300.000 − 1.200 =                                                 298.800,00
  // ══════════════════════════════════════════════════════════════════════════
  test('CASO 24 (límite) — ganancia EXACTAMENTE cero con la comisión y la gestoría a cero: ni ganancia ni pérdida, y sin pérdida que compensar', async ({ page }) => {
    await sembrarImporte12(page, 'Precio del local comercial', '300000');
    await page.getByRole('button', { name: /Vendedor/ }).click();
    await sembrarImporte12(page, 'Precio de compra original', '280000');
    await sembrarImporte12(page, 'Impuestos y gastos que pagaste al comprarlo (€)', '18800');
    await sembrarImporte12(page, 'Años de propiedad', '10');
    await sembrarImporte12(page, 'Valor catastral del suelo (€)', '40000');
    await sembrarImporte12(page, 'Valor catastral total (suelo + construcción) (€)', '100000');
    await sembrarImporte12(page, 'Comisión de la inmobiliaria (%)', '0');
    await sembrarImporte12(page, 'Gestoría y certificados del vendedor (€)', '0');

    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('1200,00 €');
    // El 25 % con el que se liquida va impreso junto a la cuota (hallazgo 786, reparado):
    // sin él, la cifra no se puede reconstruir con lo que la página dice.
    expect(await descripcionTarjeta(page, 'Plusvalía municipal')).toBe(
      'Método objetivo (más favorable), tipo municipal orientativo del 25 %',
    );

    expect(await valorTarjeta(page, 'Valor de adquisición')).toBe('298.800,00 €');
    expect(await valorTarjeta(page, 'Valor de transmisión')).toBe('298.800,00 €');

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
    expect(await valorTarjeta(page, /Total gastos de la venta/)).toBe('1200,00 €');
    expect(await descripcionTarjeta(page, /Total gastos de la venta/)).toContain('0,40 %');
    await expect(page.locator('h3', { hasText: /NETO QUE RECIBES/ })).toHaveText('NETO QUE RECIBES');
    expect(await valorTarjeta(page, /NETO QUE RECIBES/)).toBe('298.800,00 €');
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
  //         objetivo = 80.000 × 0,12 × 25 % = 2.400,00 € ; y la tarjeta manda a revisar
  //         los dos campos en vez de callarse. (0,12 = 10 años en el art. 107.4 TRLRHL,
  //         redacción del RDL 8/2023; hasta el 24/09/2026 la app usaba 0,08.)
  //
  //   (b) El mismo par AL DERECHO — suelo 50.000, total 80.000:
  //         objetivo = 50.000 × 0,12 × 25 % =                              1.500,00
  //         real     = (300.000 − 250.000) × 50.000/80.000 × 25 % =        7.812,50
  //         → gana el objetivo, 1.500,00 €. El despiste movía la cifra 900 € hacia arriba.
  //
  //   (c) Gestoría del vendedor NEGATIVA con el foco dentro (−2.000). Es el campo que la
  //       reparación del hallazgo 785 acotó con Math.max(0, …) y que su propio test no
  //       ejercitaba: allí solo se probó la comisión. Acotada a 0:
  //         valor de transmisión = 300.000 − 0 − 1.500 =                 298.500,00
  //         ganancia = 298.500 − 250.000 =                                48.500,00
  //         IRPF = 6.000×19 % + 42.500×21 % = 1.140 + 8.925 =             10.065,00
  //         total gastos = 1.500 + 0 + 0 + 10.065 =                       11.565,00
  //           → 11.565 / 300.000 = 3,855 % → «3,86%»
  //         neto = 300.000 − 11.565 =                                    288.435,00
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
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('2400,00 €');
    const avisoPar = await descripcionTarjeta(page, 'Plusvalía municipal');
    expect(avisoPar).toContain('el valor catastral del suelo no puede superar al total');
    expect(avisoPar).toContain('revisa los dos campos del recibo del IBI');
    // No se presenta como el método «más favorable»: no ha habido comparación que ganar.
    expect(avisoPar).not.toContain('Método real');
    expect(avisoPar).not.toContain('más favorable');

    // ── (b) el mismo par, al derecho
    await sembrarImporte12(page, 'Valor catastral del suelo (€)', '50000');
    await sembrarImporte12(page, 'Valor catastral total (suelo + construcción) (€)', '80000');
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('1500,00 €');
    expect(await descripcionTarjeta(page, 'Plusvalía municipal')).toBe(
      'Método objetivo (más favorable), tipo municipal orientativo del 25 %',
    );

    // ── (c) gestoría del vendedor negativa, VIVA en el campo (sin blur)
    await sembrarImporte12(page, 'Gestoría y certificados del vendedor (€)', '-2000', { blur: false });
    const gestoria = page.locator('input[aria-label="Gestoría y certificados del vendedor (€)"]');
    await esperarValorEnReact(page, gestoria, '-2000');   // el −2.000 está de verdad en el estado
    expect(await valorTarjeta(page, 'Valor de transmisión')).toBe('298.500,00 €');
    expect(await valorTarjeta(page, 'Ganancia patrimonial')).toBe('48.500,00 €');
    expect(await valorTarjeta(page, 'IRPF sobre la ganancia')).toBe('10.065,00 €');
    expect(await valorTarjeta(page, /Total gastos de la venta/)).toBe('11.565,00 €');
    expect(await descripcionTarjeta(page, /Total gastos de la venta/)).toContain('3,86 %');
    expect(await valorTarjeta(page, /NETO QUE RECIBES/)).toBe('288.435,00 €');

    // Al salir del campo no cambia NADA: es la prueba de que el acotado no depende del foco
    await gestoria.blur();
    await expect(gestoria).toHaveValue('0');
    expect(await valorTarjeta(page, 'Valor de transmisión')).toBe('298.500,00 €');
    expect(await valorTarjeta(page, 'IRPF sobre la ganancia')).toBe('10.065,00 €');
    expect(await valorTarjeta(page, /NETO QUE RECIBES/)).toBe('288.435,00 €');
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
    expect((await itp.innerText()).replace(ESPACIO_DURO, ' ')).toBe('9 %');

    // HOY imprime «21» a secas:
    expect((await casilla.innerText()).replace(ESPACIO_DURO, ' ')).toBe('21 %');
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
 * Resuelto a mano (⚠️ 24/09/2026, hallazgo 1559 de la familia: el coeficiente de 10 años es
 * 0,12 en el art. 107.4 TRLRHL, redacción del RDL 8/2023; con el 0,08 anterior la plusvalía
 * era 800 y el neto 182.803,00. Todos los casos que parten de esta base se han recalculado):
 *   plusvalía objetivo = 40.000 × 0,12 (10 años) × 25 % =                        1.200,00
 *   plusvalía real     = 50.000 × (40.000 / 100.000) × 25 % =                    5.000,00
 *   → gana el OBJETIVO
 *   valor de transmisión = 200.000 − 6.000 − 500 − 1.200 =                     192.300,00
 *   valor de adquisición = 150.000 + 15.000 − 20.000 =                         145.000,00
 *   ganancia = 47.300 → IRPF = 1.140 + 41.300 × 21 % =                           9.813,00
 *   neto = 200.000 − (1.200 + 6.000 + 500 + 9.813) =                           182.487,00
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
  //   (Recalculado el 24/09/2026 con la plusvalía de la base, 1.200.)
  //   A1 · gastos «2.000.50» → valor de adquisición 130.000 → ganancia 62.300
  //        IRPF = 1.140 + 9.240 + 12.300 × 23 % =                               13.209,00 (TECHO)
  //   A2 · amortizaciones «2.000.50» → valor de adquisición 165.000 → ganancia 27.300
  //        IRPF = 1.140 + 21.300 × 21 % =                                        5.613,00 (SUELO)
  //        neto = 200.000 − (1.200 + 6.000 + 500 + 5.613) =                     186.687,00
  //   «no afecto» con el texto ilegible guardado: las amortizaciones valen 0 y el campo no se
  //        pinta → mismo neto, 186.687,00, pero DEFINITIVO.
  //   VACÍOS (amortizaciones, gastos, total y gestoría): valor de adquisición 150.000 ·
  //        plusvalía 1.200 por el objetivo («falta el valor catastral total para comparar») ·
  //        transmisión 200.000 − 6.000 − 1.200 = 192.800 → ganancia 42.800
  //        IRPF = 1.140 + 36.800 × 21 % = 8.868 → neto = 200.000 − 16.068 =     183.932,00
  // ══════════════════════════════════════════════════════════════════════════
  test('A1 y A2 en la tarjeta del IRPF, el perfil «no afecto» apaga las amortizaciones, y lo VACÍO no avisa de nada', async ({ page }) => {
    await prepararBaseFamilia2309(page);
    expect(await valorTarjeta(page, /^NETO QUE RECIBES/)).toBe('182.487,00 €');
    expect(await valorTarjeta(page, 'IRPF sobre la ganancia')).toBe('9813,00 €');

    // A1 — la cuota es un TECHO, y el valor de adquisición no dice que suma lo que no leyó.
    await sembrarImporte12(page, 'Impuestos y gastos que pagaste al comprarlo (€)', ILEGIBLE_2309);
    expect(await valorTarjeta(page, 'IRPF sobre la ganancia')).toBe('13.209,00 €');
    expect(await descripcionTarjeta(page, 'IRPF sobre la ganancia')).toMatch(/real es menor/);
    expect(await valorTarjeta(page, 'Valor de adquisición')).toBe('130.000,00 €');
    expect(await descripcionTarjeta(page, 'Valor de adquisición')).toContain(
      'no se han podido leer y no están sumados',
    );
    await sembrarImporte12(page, 'Impuestos y gastos que pagaste al comprarlo (€)', '15000');

    // A2 — la cuota es un SUELO, y el valor de adquisición dice que no las ha restado.
    await sembrarImporte12(page, 'Amortizaciones acumuladas deducidas (€)', ILEGIBLE_2309);
    expect(await valorTarjeta(page, 'IRPF sobre la ganancia')).toBe('5613,00 €');
    expect(await descripcionTarjeta(page, 'IRPF sobre la ganancia')).toMatch(/real (?:es|puede ser) mayor/);
    expect(await valorTarjeta(page, 'Valor de adquisición')).toBe('165.000,00 €');
    expect(await descripcionTarjeta(page, 'Valor de adquisición')).toContain('no están restadas');
    expect(await valorTarjeta(page, /^NETO QUE RECIBES/)).toBe('186.687,00 €');

    // «No afecto»: ⚠️ 26/09/2026 (hallazgo 2199) el campo ya NO desaparece. El local alquilado
    // por un particular es «no afecto» y también resta sus amortizaciones (art. 35.2 LIRPF), así
    // que el texto ilegible sigue pesando y AVISANDO en los dos perfiles: callarlo al cambiar de
    // perfil sería el hueco A2 otra vez, ahora en el perfil del alquiler.
    await page.getByRole('button', { name: /Local no afecto/ }).click();
    await expect(page.locator('input[aria-label="Amortizaciones acumuladas deducidas (€)"]')).toHaveValue(ILEGIBLE_2309);
    expect(await valorTarjeta(page, /^NETO QUE RECIBES/)).toBe('186.687,00 €');
    expect(await tituloTarjeta24(page, /^NETO QUE RECIBES/)).toBe('NETO QUE RECIBES (PARCIAL)');
    expect(await descripcionTarjeta(page, 'IRPF sobre la ganancia')).toMatch(/real (?:es|puede ser) mayor/);
    expect(await descripcionTarjeta(page, 'Valor de adquisición')).toContain('no están restadas');

    // De vuelta a «afecto», el texto sigue ahí y el aviso sigue con él.
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
    expect(await valorTarjeta(page, 'IRPF sobre la ganancia')).toBe('8868,00 €');
    expect(await valorTarjeta(page, /^NETO QUE RECIBES/)).toBe('183.932,00 €');
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
  //   (⚠️ 24/09/2026, hallazgo 1559 de la familia: 12 años → 0,09, art. 107.4 TRLRHL en la
  //   redacción del RDL 8/2023; con el 0,08 anterior la plusvalía era 1.200 y el neto 352.362.)
  //     plusvalía objetivo = 60.000 × 0,09 × 25 % = 1.350 · real = 220.000 × 0,4 × 25 %
  //       = 22.000 → gana el OBJETIVO:                                              1.350,00
  //     comisión = 420.000 × 4 % =                                                16.800,00
  //     valor de transmisión = 420.000 − 16.800 − 600 − 1.350 =                  401.250,00
  //     valor de adquisición = 200.000 + 16.000 − 30.000 =                       186.000,00
  //     ganancia =                                                               215.250,00
  //     IRPF = 1.140 + 9.240 + 150.000 × 23 % + 15.250 × 27 % (tramo del 27 %,
  //       que ninguna vuelta había pisado) = 1.140 + 9.240 + 34.500 + 4.117,50 =  48.997,50
  //     total = 1.350 + 16.800 + 600 + 48.997,50 = 67.747,50 → 16,130357 % → «16,13%»
  //     neto =                                                                   352.252,50
  //   El mismo vendedor «no afecto» (sin minorar): adquisición 216.000 → ganancia 185.250
  //     IRPF = 1.140 + 9.240 + 135.250 × 23 % =                                   41.487,50
  //     neto = 420.000 − 60.237,50 =                                             359.762,50
  //   Las amortizaciones cuestan 7.510,00 € de IRPF = 15.250 × 27 % + 14.750 × 23 %.
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
    expect(COEFICIENTES_IIVTNU_2025.find((c) => c.anios === 12)?.coeficiente).toBe(0.09);
    expect(PLUSVALIA_MUNICIPAL_META.tipoOrientativo).toBe(25);

    await page.selectOption('#select-ccaa', 'asturias');
    await sembrarImporte12(page, 'Precio del local comercial', '420000');

    expect((await page.locator('h3', { hasText: /^ITP \(/ }).first().innerText()).replace(ESPACIO_DURO, ' ')).toBe('ITP (8,29 %)');
    expect(await valorTarjeta(page, /^ITP \(/)).toBe('34.800,00 €');
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('991,91 €');
    expect(await descripcionTarjeta(page, 'Gastos de notaría')).toContain('entre 850,21 € y 1133,61 €');
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('316,08 €');
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('36.607,99 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toBe('8,72 % sobre el precio de compra');
    expect(await valorTarjeta(page, 'COSTE TOTAL')).toBe('456.607,99 €');

    await page.getByRole('button', { name: /Obra nueva/ }).click();
    expect(await valorTarjeta(page, 'IVA (21,00 %)')).toBe('88.200,00 €');
    expect((await page.locator('h3', { hasText: /^AJD \(/ }).first().innerText()).replace(ESPACIO_DURO, ' ')).toBe('AJD (1,20 %)');
    expect(await valorTarjeta(page, /^AJD \(/)).toBe('5040,00 €');
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('95.047,99 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toBe('22,63 % sobre el precio de compra');
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

    expect(await valorTarjeta(page, 'Plusvalía municipal (IIVTNU)')).toBe('1350,00 €');
    expect(await descripcionTarjeta(page, 'Plusvalía municipal (IIVTNU)')).toBe(
      'Método objetivo (más favorable), tipo municipal orientativo del 25 %',
    );
    expect(await valorTarjeta(page, 'Valor de adquisición')).toBe('186.000,00 €');
    expect(await descripcionTarjeta(page, 'Valor de adquisición')).toBe(
      'Precio de compra + impuestos y gastos de aquella compra − 30.000,00 € de amortizaciones deducidas',
    );
    expect(await valorTarjeta(page, 'Valor de transmisión')).toBe('401.250,00 €');
    expect(await valorTarjeta(page, 'Ganancia patrimonial')).toBe('215.250,00 €');
    expect(await valorTarjeta(page, 'IRPF sobre la ganancia')).toBe('48.997,50 €');
    expect(await valorTarjeta(page, /^Comisión de la inmobiliaria$/)).toBe('16.800,00 €');
    expect(await valorTarjeta(page, 'Total gastos de la venta')).toBe('67.747,50 €');
    expect(await descripcionTarjeta(page, 'Total gastos de la venta')).toBe('16,13 % sobre el precio de venta');
    expect(await valorTarjeta(page, /^NETO QUE RECIBES/)).toBe('352.252,50 €');
    expect(await avisoNeto2309(page)).toBe(
      'NETO QUE RECIBES · Precio de venta menos impuestos, comisión y gestoría',
    );

    // El contrafactual: sin minorar, 7.510,00 € menos de IRPF. ⚠️ 26/09/2026 (hallazgo 2199):
    // el perfil «no afecto» ya no apaga las amortizaciones (el local alquilado también las
    // resta, art. 35.2 LIRPF): el contrafactual es VACIAR el campo, no cambiar de perfil.
    await page.getByRole('button', { name: /Local no afecto/ }).click();
    expect(await valorTarjeta(page, 'Valor de adquisición')).toBe('186.000,00 €');
    await sembrarImporte12(page, 'Amortizaciones acumuladas deducidas (€)', '');
    expect(await valorTarjeta(page, 'Valor de adquisición')).toBe('216.000,00 €');
    expect(await valorTarjeta(page, 'IRPF sobre la ganancia')).toBe('41.487,50 €');
    expect(await valorTarjeta(page, /^NETO QUE RECIBES/)).toBe('359.762,50 €');
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
  //   (⚠️ 24/09/2026, hallazgo 1559 de la familia: 15 años → 0,09 en el art. 107.4 TRLRHL,
  //   redacción del RDL 8/2023 (era 0,12). Para seguir cayendo en 300.000 € exactos, las
  //   amortizaciones pasan de 54.000 a 53.250, y el euro de más, de 54.001 a 53.251.)
  //     plusvalía objetivo = 100.000 × 0,09 (15 años) × 25 % = 2.250 · real = 300.000 ×
  //       0,4 × 25 % = 30.000 → gana el OBJETIVO:                                  2.250,00
  //     valor de transmisión = 700.000 − 21.000 − 2.250 =                        676.750,00
  //     amortizaciones 53.250 → adquisición = 430.000 − 53.250 = 376.750
  //     ganancia =                                                               300.000,00
  //     IRPF = 1.140 + 9.240 + 34.500 + 100.000 × 27 % =                          71.880,00
  //     total = 2.250 + 21.000 + 71.880 = 95.130 · neto =                        604.870,00
  //   Amortizaciones 53.251 → ganancia 300.001, y ese euro al 30 %:
  //     IRPF = 71.880 + 0,30 =                                                     71.880,30
  //     neto = 700.000 − 95.130,30 =                                             604.869,70
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
    expect(COEFICIENTES_IIVTNU_2025.find((c) => c.anios === 15)?.coeficiente).toBe(0.09);

    await page.selectOption('#select-ccaa', 'extremadura');
    await sembrarImporte12(page, 'Precio del local comercial', '600000');
    expect((await page.locator('h3', { hasText: /^ITP \(/ }).first().innerText()).replace(ESPACIO_DURO, ' ')).toBe('ITP (8,80 %)');
    expect(await valorTarjeta(page, /^ITP \(/)).toBe('52.800,00 €');
    await sembrarImporte12(page, 'Precio del local comercial', '600001');
    expect(await valorTarjeta(page, /^ITP \(/)).toBe('52.800,11 €');

    await sembrarImporte12(page, 'Precio del local comercial', '700000');
    expect((await page.locator('h3', { hasText: /^ITP \(/ }).first().innerText()).replace(ESPACIO_DURO, ' ')).toBe('ITP (9,11 %)');
    expect(await valorTarjeta(page, /^ITP \(/)).toBe('63.800,00 €');
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('1246,44 €');
    expect(await descripcionTarjeta(page, 'Gastos de notaría')).toContain('entre 1068,37 € y 1424,50 €');
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('405,75 €');
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('65.952,19 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toBe('9,42 % sobre el precio de compra');
    expect(await valorTarjeta(page, 'COSTE TOTAL')).toBe('765.952,19 €');

    await page.getByRole('button', { name: 'Vendedor', exact: true }).click();
    await page.getByRole('button', { name: /Local afecto a actividad/ }).click();
    await sembrarImporte12(page, 'Precio de compra original', '400000');
    await sembrarImporte12(page, 'Impuestos y gastos que pagaste al comprarlo (€)', '30000');
    await sembrarImporte12(page, 'Amortizaciones acumuladas deducidas (€)', '53250');
    await sembrarImporte12(page, 'Años de propiedad', '15');
    await sembrarImporte12(page, 'Valor catastral del suelo (€)', '100000');
    await sembrarImporte12(page, 'Valor catastral total (suelo + construcción) (€)', '250000');

    expect(await valorTarjeta(page, 'Plusvalía municipal (IIVTNU)')).toBe('2250,00 €');
    expect(await valorTarjeta(page, 'Valor de transmisión')).toBe('676.750,00 €');
    expect(await valorTarjeta(page, 'Valor de adquisición')).toBe('376.750,00 €');
    expect(await valorTarjeta(page, 'Ganancia patrimonial')).toBe('300.000,00 €');
    expect(await valorTarjeta(page, 'IRPF sobre la ganancia')).toBe('71.880,00 €');
    expect(await valorTarjeta(page, 'Total gastos de la venta')).toBe('95.130,00 €');
    expect(await valorTarjeta(page, /^NETO QUE RECIBES/)).toBe('604.870,00 €');

    await sembrarImporte12(page, 'Amortizaciones acumuladas deducidas (€)', '53251');
    expect(await valorTarjeta(page, 'Ganancia patrimonial')).toBe('300.001,00 €');
    expect(await valorTarjeta(page, 'IRPF sobre la ganancia')).toBe('71.880,30 €');
    expect(await valorTarjeta(page, /^NETO QUE RECIBES/)).toBe('604.869,70 €');
  });

  // ══════════════════════════════════════════════════════════════════════════
  // CASO 28 (RECHAZO) — ✅ REPARADO (hallazgo 1261, operativa, medio; 85daf805): unas
  // amortizaciones MAYORES que todo el coste de adquisición se aceptaban en silencio.
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
  //   (⚠️ 24/09/2026, hallazgo 1559 de la familia: 8 años → 0,19 en el art. 107.4 TRLRHL,
  //   redacción del RDL 8/2023; era 0,10, con plusvalía 750 y neto de control 161.894,50)
  //   plusvalía objetivo = 30.000 × 0,19 × 25 % = 1.425 (real: 60.000 × 0,375 × 25 % = 5.625)
  //   valor de transmisión = 180.000 − 5.400 − 1.425 =                           173.175,00
  //   control, amortizaciones 12.000 → adquisición 117.000 → ganancia 56.175
  //     IRPF = 1.140 + 9.240 + 6.175 × 23 % = 11.800,25 → neto =                161.374,75
  //   amortizaciones 150.000 > 129.000 → la app liquidaba con adquisición 0 sin una palabra.
  // ══════════════════════════════════════════════════════════════════════════
  test('CASO 28 (rechazo) — unas amortizaciones mayores que el precio de compra y sus gastos no se liquidan en silencio', async ({ page }) => {
    expect(ITP_CCAA.navarra.tipoGeneral).toBe(6);
    expect(COEFICIENTES_IIVTNU_2025.find((c) => c.anios === 8)?.coeficiente).toBe(0.19);

    await page.selectOption('#select-ccaa', 'navarra');
    await sembrarImporte12(page, 'Precio del local comercial', '180000');
    expect((await page.locator('h3', { hasText: /^ITP \(/ }).first().innerText()).replace(ESPACIO_DURO, ' ')).toBe('ITP (6,00 %)');
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
    expect(await valorTarjeta(page, 'IRPF sobre la ganancia')).toBe('11.800,25 €');
    expect(await valorTarjeta(page, /^NETO QUE RECIBES/)).toBe('161.374,75 €');

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
  // de años y el coeficiente de la reventa antes del año no van a mano.
  // ⚠️ REESCRITO el 24/09/2026 (hallazgo 1560 de la familia): la ayuda decía que esa reventa
  // tributaba «con un coeficiente de 0,14, mayor que el 0,13 del primer año». El art. 107.4
  // TRLRHL no tiene tal coeficiente: prorratea el ANUAL por los meses completos, así que el
  // de menos de un año nunca supera al del año. La ayuda lo dice ahora y deriva el anual.
  test('la ayuda de los años de propiedad se deriva de la tabla de coeficientes del IIVTNU', async ({ page }) => {
    await page.getByRole('button', { name: 'Vendedor', exact: true }).click();
    const tope = Math.max(...COEFICIENTES_IIVTNU_2025.map((c) => c.anios));
    const c0 = COEFICIENTES_IIVTNU_2025.find((c) => c.anios === 0)!.coeficiente;
    const fmt = (n: number) => n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const ayuda = page.getByText(/Años completos desde la compra/);
    await expect(ayuda).toContainText(`cuenta como máximo ${tope}`);
    await expect(ayuda).toContainText(`el coeficiente anual (${fmt(c0)}) se prorratea`);
    await expect(ayuda).not.toContainText('mayor que el');
  });

  // ─── HALLAZGOS 1257-1266 del 23/09/2026 — REPARADOS el mismo día ──────────────────────
  //   La dirección de cada aviso sale ahora de SONDEAR el cálculo (lib/sondeoIlegibles.ts).

  /**
   * ✅ REPARADO (operativa, medio) — DOS ilegibles en sentidos opuestos: el aviso del NETO
   * afirmaba a la vez «el neto real será menor» y «el neto real es MAYOR que este».
   *
   * Es el (b) de la hermana garaje. Aquí la tarjeta del IRPF sí lo resuelve cuando son los
   * gastos de aquella compra y las amortizaciones («Cuota sin cerrar… sentidos contrarios»),
   * pero la del NETO concatena las dos frases de 0bff1872 y 95187231, cada una con su
   * conclusión categórica sobre la cifra entera, y una de las dos es falsa.
   *
   * BASE con la comisión «3.5.0» y los gastos de aquella compra «2.000.50» (plusvalía 1.200,
   * recalculada el 24/09/2026):
   *   transmisión = 200.000 − 500 − 1.200 = 198.300 · adquisición = 150.000 − 20.000 = 130.000
   *   ganancia 68.300 → IRPF = 1.140 + 9.240 + 18.300 × 23 % =                     14.589,00
   *   neto mostrado = 200.000 − (1.200 + 500 + 14.589) =                          183.711,00
   *   neto real =                                                                 182.487,00
   * El real es 1.224,00 € MENOR, y la segunda frase decía «el neto real es MAYOR que este».
   */
  test('dos ilegibles opuestos (comisión y gastos de aquella compra): el neto no afirma que el real es MAYOR cuando es menor', async ({ page }) => {
    await prepararBaseFamilia2309(page);
    await sembrarImporte12(page, 'Comisión de la inmobiliaria (%)', '3.5.0');
    await sembrarImporte12(page, 'Impuestos y gastos que pagaste al comprarlo (€)', ILEGIBLE_2309);

    expect(await valorTarjeta(page, 'IRPF sobre la ganancia')).toBe('14.589,00 €');
    expect(await valorTarjeta(page, /^NETO QUE RECIBES/)).toBe('183.711,00 €');
    expect(await avisoNeto2309(page)).not.toContain('el neto real es MAYOR que este');
  });

  /**
   * ✅ REPARADO (operativa, medio) — el mismo defecto con los dos importes del valor de
   * adquisición, justo donde la tarjeta del IRPF ya dice «sentidos contrarios».
   *
   * BASE con los gastos de aquella compra y las amortizaciones «2.000.50» (plusvalía 1.200,
   * recalculada el 24/09/2026):
   *   adquisición = 150.000 → ganancia 42.300 → IRPF = 1.140 + 36.300 × 21 % =      8.763,00
   *   neto mostrado = 200.000 − (1.200 + 6.000 + 500 + 8.763) =                   183.537,00
   *   neto real =                                                                 182.487,00
   * El real es 1.050,00 € MENOR. La tarjeta del IRPF: «Cuota sin cerrar». La del neto:
   * «…el neto real será menor. …así que el neto real es MAYOR que este».
   */
  test('dos ilegibles opuestos (gastos de aquella compra y amortizaciones): el neto dice lo mismo que la tarjeta del IRPF, no las dos direcciones', async ({ page }) => {
    await prepararBaseFamilia2309(page);
    await sembrarImporte12(page, 'Impuestos y gastos que pagaste al comprarlo (€)', ILEGIBLE_2309);
    await sembrarImporte12(page, 'Amortizaciones acumuladas deducidas (€)', ILEGIBLE_2309);

    expect(await valorTarjeta(page, 'IRPF sobre la ganancia')).toBe('8763,00 €');
    expect(await descripcionTarjeta(page, 'IRPF sobre la ganancia')).toContain('sentidos contrarios');
    expect(await valorTarjeta(page, /^NETO QUE RECIBES/)).toBe('183.537,00 €');
    expect(await avisoNeto2309(page)).not.toContain('el neto real es MAYOR que este');
  });

  /**
   * ✅ REPARADO (operativa, medio) — con PÉRDIDA, unas amortizaciones ilegibles hacían que el
   * neto se rotulara «(PARCIAL)» y afirmara «No descuenta el IRPF que añaden las amortizaciones
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
   * ✅ REPARADO (operativa, medio) — con PÉRDIDA, la cifra que SÍ mueve un ilegible del valor
   * de adquisición es la pérdida compensable, y su tarjeta no lo decía.
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
   * ✅ REPARADO (operativa, medio) — con la comisión ilegible, la tarjeta del IRPF publicaba
   * como DEFINITIVA una cuota que es un TECHO, y la del valor de transmisión afirmaba haber
   * restado una comisión que tomó como 0.
   *
   * La comisión y la gestoría de la venta son gastos de transmisión (art. 35.1 LIRPF):
   * sin leerlas, la ganancia y el IRPF salen MAYORES. La referencia dice «TECHO» en su
   * tarjeta del IRPF también con esos dos importes desde 0f70fdf8 (C3); esta app solo lo dice
   * con los gastos de aquella compra (A1). Es el defecto de 1197 («Valor de adquisición»
   * afirmaba sumar unos gastos tomados como 0), una tarjeta más abajo.
   *
   * BASE con la comisión «3.5.0» (plusvalía 1.200, recalculada el 24/09/2026):
   *   transmisión = 200.000 − 500 − 1.200 = 198.300 → ganancia 53.300
   *   IRPF = 1.140 + 9.240 + 3.300 × 23 % = 11.139,00 (real 9.813,00: +1.326,00 €)
   */
  test('con la comisión ilegible, la tarjeta del IRPF dice que es un techo', async ({ page }) => {
    await prepararBaseFamilia2309(page);
    await sembrarImporte12(page, 'Comisión de la inmobiliaria (%)', '3.5.0');

    expect(await valorTarjeta(page, 'IRPF sobre la ganancia')).toBe('11.139,00 €');
    expect(await descripcionTarjeta(page, 'IRPF sobre la ganancia')).toMatch(/techo|no se ha(n)? podido leer/i);
  });

  test('con la comisión ilegible, «Valor de transmisión» no afirma que la ha restado', async ({ page }) => {
    await prepararBaseFamilia2309(page);
    await sembrarImporte12(page, 'Comisión de la inmobiliaria (%)', '3.5.0');

    expect(await valorTarjeta(page, 'Valor de transmisión')).toBe('198.300,00 €');
    expect(await descripcionTarjeta(page, 'Valor de transmisión')).not.toBe(
      'Precio de venta − comisión, gestoría y plusvalía municipal',
    );
  });

  /**
   * ✅ REPARADO (contenido, bajo) — «No descuenta la comisión inmobiliaria: el neto real será
   * menor» invitaba a restar la comisión ENTERA, y el hueco real es menor: C3 del testigo de
   * familia, reparado el 23/09 solo en la referencia (0f70fdf8).
   *
   * BASE con la comisión «3.5.0» (plusvalía 1.200, recalculada el 24/09/2026): neto mostrado
   * 187.161,00 · real 182.487,00 → hueco 4.674,00
   * Quien resta el 3 % de 200.000 (6.000,00 €) llega a 181.161,00, 1.326,00 € por DEBAJO del
   * real. La cota que publica la referencia es el tipo marginal de la base de ahora (53.300 →
   * 23 %): 6.000 × (1 − 23 %) = 4.620 ≤ 4.674 ≤ 6.000.
   */
  test('C3 en la hermana — «No descuenta la comisión» dice que no entera, porque rebaja también el IRPF', async ({ page }) => {
    await prepararBaseFamilia2309(page);
    await sembrarImporte12(page, 'Comisión de la inmobiliaria (%)', '3.5.0');

    expect(await valorTarjeta(page, /^NETO QUE RECIBES/)).toBe('187.161,00 €');
    expect(await avisoNeto2309(page)).toMatch(/comisi[óo]n[^.;]*IRPF/i);
  });

  /**
   * ✅ REPARADO (operativa, bajo) — con el valor catastral total ilegible y el método OBJETIVO
   * ganando, el neto se rotulaba «(PARCIAL)» y afirmaba «el neto real es MAYOR que este», pero es
   * IDÉNTICO. Es el (c) de garaje, efecto colateral de 758e053f.
   *
   * En la BASE el real sale 5.000,00 € y el objetivo 1.200,00 €: con el total de verdad
   * (100.000) sigue ganando el objetivo, así que «100.000.00» no mueve nada. La tarjeta de la
   * plusvalía lo dice bien («puede salir más barata»). La fila `sin_efecto` del testigo de
   * familia mide el delta (0,00 €) pero no que el aviso calle.
   */
  test('total ilegible con el método objetivo ganando: el neto no cambia y no puede afirmar que el real es MAYOR', async ({ page }) => {
    await prepararBaseFamilia2309(page);
    await sembrarImporte12(page, 'Valor catastral total (suelo + construcción) (€)', '100.000.00');

    expect(await valorTarjeta(page, 'Plusvalía municipal (IIVTNU)')).toBe('1200,00 €');
    expect(await valorTarjeta(page, /^NETO QUE RECIBES/)).toBe('182.487,00 €');
    expect(await avisoNeto2309(page)).not.toContain('el neto real es MAYOR que este');
  });

  /**
   * ✅ REPARADO (operativa, bajo) — el «Total gastos de la venta» se publicaba como DEFINITIVO
   * cuando la cifra que lleva dentro es un TECHO, mientras el neto de debajo dice «(PARCIAL)»
   * y la tarjeta del IRPF dice «TECHO».
   *
   * `faltanPorAbaratar` (A1 y C1) solo llega al neto; `faltanEnElNeto` (A2 y los demás) llega
   * también al total. Con las amortizaciones ilegibles el total dice «(parcial)»; con los
   * gastos de aquella compra, no.
   *
   * BASE con los gastos de aquella compra «2.000.50»:
   *   total = 1.200 + 6.000 + 500 + 13.209 = 20.909,00 (real 17.513,00) · «10,45% sobre el
   *   precio de venta», sin más (plusvalía 1.200, recalculada el 24/09/2026).
   */
  test('con los gastos de aquella compra ilegibles, el total de la venta no se publica como definitivo', async ({ page }) => {
    await prepararBaseFamilia2309(page);
    await sembrarImporte12(page, 'Impuestos y gastos que pagaste al comprarlo (€)', ILEGIBLE_2309);

    expect(await valorTarjeta(page, 'Total gastos de la venta')).toBe('20.909,00 €');
    const titulo = await page.locator('h3', { hasText: 'Total gastos de la venta' }).first().innerText();
    const total = `${titulo} · ${await descripcionTarjeta(page, 'Total gastos de la venta')}`;
    expect(total).toMatch(/parcial|techo|no se ha(n)? podido leer/i);
  });

  /**
   * ✅ REPARADO (contenido, bajo) — un importe ESCRITO pero ilegible se anunciaba como si
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

// ═════════════════════════════════════════════════════════════════════════════
// RE-INSPECCIÓN 24/09/2026 — Castilla y León, las amortizaciones frente al coste, y los
// estados del vendedor que el testigo de familia no mide.
//
// Batería previa en verde y sin `test.fail()` vivo: los hallazgos 1257-1266 siguen cerrados.
// Comprobado en navegador lo que cambió desde el 23/09: f654e4b8 («Sin leer»), 85daf805
// (sondeo, amortizaciones imposibles, ayuda de los años), e9c56b95 y 85c9c9fe (sin precio de
// compra el neto «puede ser» menor, redacción común) y 5b5d33ae (IGIC/IPSI «puede ser»; el
// testigo solo recorre Canarias y aquí se miran Ceuta y Melilla).
//
// De dónde sale CADA cifra (ninguna de memoria):
//   · Castilla y León: `ITP_CCAA['castilla-leon']` (data/itp-ccaa.ts), escala 8 % hasta
//     250.000 € y 10 % el resto, AJD 1,5 %; el tipo general, de `TIPOS_ITP_CCAA_2025`.
//   · IVA del local: `IVA_INMUEBLES_2025.local` = 21 (art. 90 LIVA). Renuncia a la exención
//     (art. 20.Dos LIVA) con inversión del sujeto pasivo: mismo IVA + AJD.
//   · Notaría: `ARANCELES_NOTARIO` (RD 1426/1989) × 1,21 de IVA × `FACTURA_NOTARIAL`
//     (×1,5 a ×2; punto medio ×1,75). Registro: `ARANCELES_REGISTRO` (RD 1427/1989) +
//     `REGISTRO_CONCEPTOS` (6,010121 + 3,005061) × 1,21.
//   · Plusvalía: `COEFICIENTES_IIVTNU_2025` (15 años → 0,09 desde el 24/09/2026, art. 107.4
//     TRLRHL en la redacción del RDL 8/2023; era 0,12) × tipo orientativo del 25 %.
//   · IRPF: `TRAMOS_GANANCIAS_PATRIMONIALES_2025` sobre la fórmula del art. 35.1 LIRPF; la
//     amortización deducida MINORA el valor de adquisición (art. 40 RIRPF), en
//     `data/fiscal/ganancia-inmueble.ts`.
// ═════════════════════════════════════════════════════════════════════════════

/** El caso de Castilla y León: venta 350.000 € y el vendedor que se pida. */
async function prepararCyL24(
  page: Page,
  {
    afecto = true,
    compra = '180000',
    gastos = '14000',
    amort = '25000',
    anios = '15',
    suelo = '50000',
    total = '140000',
    comision = '4',
    gestoria = '800',
  }: {
    afecto?: boolean;
    compra?: string;
    gastos?: string;
    amort?: string;
    anios?: string;
    suelo?: string;
    total?: string;
    comision?: string;
    gestoria?: string;
  } = {},
): Promise<void> {
  await page.selectOption('#select-ccaa', 'castilla-leon');
  await sembrarImporte12(page, 'Precio del local comercial', '350000');
  await page.getByRole('button', { name: 'Vendedor', exact: true }).click();
  if (afecto) await page.getByRole('button', { name: /Local afecto a actividad/ }).click();
  await sembrarImporte12(page, 'Precio de compra original', compra);
  await sembrarImporte12(page, 'Impuestos y gastos que pagaste al comprarlo (€)', gastos);
  if (afecto) await sembrarImporte12(page, 'Amortizaciones acumuladas deducidas (€)', amort);
  await sembrarImporte12(page, 'Años de propiedad', anios);
  await sembrarImporte12(page, 'Valor catastral del suelo (€)', suelo);
  await sembrarImporte12(page, 'Valor catastral total (suelo + construcción) (€)', total);
  await sembrarImporte12(page, 'Comisión de la inmobiliaria (%)', comision);
  await sembrarImporte12(page, 'Gestoría y certificados del vendedor (€)', gestoria);
}

/** Título de una tarjeta (para ver si se rotula «(PARCIAL)»). */
async function tituloTarjeta24(page: Page, titulo: string | RegExp): Promise<string> {
  // Con el espacio duro del % normalizado (hallazgo 2202), como descripcionTarjeta.
  return (await page.locator('h3', { hasText: titulo }).first().innerText()).replace(ESPACIO_DURO, ' ').trim();
}

test.describe('Inspección 24/09/2026 — Castilla y León, amortizaciones frente al coste y los estados que el testigo no mide', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, TESTIGOS_12_09);
  });

  // ══════════════════════════════════════════════════════════════════════════
  // CASO 29 (NORMAL) — CASTILLA Y LEÓN, local de 350.000 €, la única comunidad con escala
  // que ninguna vuelta había liquidado.
  //   ITP = 250.000 × 8 % + 100.000 × 10 % = 20.000 + 10.000 =                     30.000,00
  //     tipo EFECTIVO = 30.000 / 350.000 = 8,5714 % → «ITP (8,57%)»
  //   Notaría: 90,15 + 24.040,49 × 0,45 % + 30.050,60 × 0,15 % + 90.151,82 × 0,10 %
  //     + 199.746,97 × 0,05 % = 433,43341 × 1,21 = 524,454426
  //     ×1,5 = 786,68 · ×2 = 1048,91 · ×1,75 =                                         917,80
  //   Registro: 24,04 + 42,0708575 + 37,56325 + 67,613865 + 199.746,97 × 0,03 %
  //     = 231,212064 + 9,015182 = 240,227246 × 1,21 =                                  290,67
  //   2ª mano: 30.000 + 917,80 + 290,67 + 500 = 31.708,47 (9,06 %) · COSTE      381.708,47
  //   Renuncia (ISP) y obra nueva: IVA 21 % = 73.500 · AJD 1,5 % = 5.250
  //     total = 73.500 + 5.250 + 917,80 + 290,67 + 500 = 80.458,47 (22,99 %) · COSTE 430.458,47
  // ══════════════════════════════════════════════════════════════════════════
  test('CASO 29 (normal) — Castilla y León 350.000 €: escala 8/10 % en 2ª mano, y la renuncia con ISP por el mismo IVA que la obra nueva', async ({ page }) => {
    expect(ITP_CCAA['castilla-leon'].tramosProgresivos).toEqual([
      { hasta: 250000, tipo: 8 },
      { hasta: Infinity, tipo: 10 },
    ]);
    expect(ITP_CCAA['castilla-leon'].ajd).toBe(1.5);
    expect(IVA_INMUEBLES_2025.local).toBe(21);
    expect(FACTURA_NOTARIAL.factorMin).toBe(1.5);
    expect(FACTURA_NOTARIAL.factorMax).toBe(2);
    expect(ARANCELES_NOTARIO[4]).toEqual({ hasta: 601012.1, base: 333.56, exceso: 0.05 });
    expect(REGISTRO_CONCEPTOS.presentacion + REGISTRO_CONCEPTOS.notaSimple).toBeCloseTo(9.015182, 6);

    await page.selectOption('#select-ccaa', 'castilla-leon');
    await sembrarImporte12(page, 'Precio del local comercial', '350000');
    const panel = (await page.locator('[class*="infoCcaa"]').first().innerText()).replace(/\s+/g, ' ');
    expect(panel).toContain('ITP General 8 %');
    expect(panel).toContain('AJD 1,5 %');
    expect(panel).toContain('IVA (comercial) 21 %');
    // La frase del motor (`describirSubidaITP`, 24/09/2026), con el espacio antes del %.
    expect(panel).toContain('(8 % → 10 %)');

    expect(await tituloTarjeta24(page, /^ITP \(/)).toBe('ITP (8,57 %)');
    expect(await valorTarjeta(page, /^ITP \(/)).toBe('30.000,00 €');
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('917,80 €');
    expect(await descripcionTarjeta(page, 'Gastos de notaría')).toContain('entre 786,68 € y 1048,91 €');
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('290,67 €');
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('31.708,47 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toBe('9,06 % sobre el precio de compra');
    expect(await valorTarjeta(page, /^COSTE TOTAL/)).toBe('381.708,47 €');

    await page.getByRole('button', { name: /2ª mano con renuncia/ }).click();
    await expect(page.getByText('Contraprestación pactada en la escritura (base del IVA, art. 78 LIVA)')).toBeVisible();
    expect(await tituloTarjeta24(page, /^IVA \(renuncia/)).toBe('IVA (renuncia · ISP) (21,00 %)');
    expect(await valorTarjeta(page, /^IVA \(renuncia/)).toBe('73.500,00 €');
    expect(await descripcionTarjeta(page, /^IVA \(renuncia/)).toContain('inversión del sujeto pasivo');
    expect(await tituloTarjeta24(page, /^AJD \(/)).toBe('AJD (1,50 %)');
    expect(await valorTarjeta(page, /^AJD \(/)).toBe('5250,00 €');
    await expect(page.locator('h3', { hasText: /^ITP \(/ })).toHaveCount(0);
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('80.458,47 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toBe('22,99 % sobre el precio de compra');
    expect(await valorTarjeta(page, /^COSTE TOTAL/)).toBe('430.458,47 €');

    await page.getByRole('button', { name: /Obra nueva/ }).click();
    expect(await tituloTarjeta24(page, /^IVA \(/)).toBe('IVA (21,00 %)');
    expect(await valorTarjeta(page, /^COSTE TOTAL/)).toBe('430.458,47 €');
  });

  // ══════════════════════════════════════════════════════════════════════════
  // CASO 29 (NORMAL), vendedor «afecto»: compra 180.000 · gastos de aquella compra 14.000 ·
  // amortizaciones 25.000 · 15 años · suelo 50.000 · total 140.000 · comisión 4 % · gestoría 800.
  // (⚠️ 24/09/2026, hallazgo 1559 de la familia: 15 años → 0,09; con el 0,12 anterior la
  // plusvalía era 1.500 y el neto 296.939,00.)
  //   plusvalía objetivo = 50.000 × 0,09 × 25 % = 1125,00 · real = 170.000 × (50/140) × 25 %
  //     = 15.178,57 → gana el OBJETIVO
  //   transmisión = 350.000 − 14.000 − 800 − 1.125 =                                334.075,00
  //   adquisición = 180.000 + 14.000 − 25.000 (art. 40 RIRPF) =                     169.000,00
  //   ganancia 165.075 → IRPF = 1.140 + 9.240 + 115.075 × 23 % =                     36.847,25
  //   total = 1.125 + 14.000 + 800 + 36.847,25 = 52.772,25 (15,08 %) · NETO        297.227,75
  //   «no afecto»: adquisición 194.000 · ganancia 140.075 · IRPF 31.097,25 · NETO 302.977,75
  //   (la diferencia, 5.750,00 €, son las 25.000 de amortización al 23 % marginal)
  // ══════════════════════════════════════════════════════════════════════════
  test('CASO 29 (normal) — vendedor afecto a actividad: la amortización minora el valor de adquisición y cuesta 5.750 € de IRPF', async ({ page }) => {
    expect(COEFICIENTES_IIVTNU_2025.find((c) => c.anios === 15)?.coeficiente).toBe(0.09);
    expect(PLUSVALIA_MUNICIPAL_META.tipoOrientativo).toBe(25);
    expect(TRAMOS_GANANCIAS_PATRIMONIALES_2025.map((t) => t.tipo)).toEqual([19, 21, 23, 27, 30]);

    await prepararCyL24(page);
    expect(await valorTarjeta(page, 'Plusvalía municipal (IIVTNU)')).toBe('1125,00 €');
    expect(await descripcionTarjeta(page, 'Plusvalía municipal (IIVTNU)')).toBe(
      'Método objetivo (más favorable), tipo municipal orientativo del 25 %',
    );
    expect(await valorTarjeta(page, 'Valor de adquisición')).toBe('169.000,00 €');
    expect(await descripcionTarjeta(page, 'Valor de adquisición')).toBe(
      'Precio de compra + impuestos y gastos de aquella compra − 25.000,00 € de amortizaciones deducidas',
    );
    expect(await valorTarjeta(page, 'Valor de transmisión')).toBe('334.075,00 €');
    expect(await valorTarjeta(page, 'Ganancia patrimonial')).toBe('165.075,00 €');
    expect(await valorTarjeta(page, 'IRPF sobre la ganancia')).toBe('36.847,25 €');
    expect(await valorTarjeta(page, 'Total gastos de la venta')).toBe('52.772,25 €');
    expect(await descripcionTarjeta(page, 'Total gastos de la venta')).toBe('15,08 % sobre el precio de venta');
    expect(await tituloTarjeta24(page, /^NETO QUE RECIBES/)).toBe('NETO QUE RECIBES');
    expect(await valorTarjeta(page, /^NETO QUE RECIBES/)).toBe('297.227,75 €');

    // ⚠️ 26/09/2026 (hallazgo 2199): «no afecto» también resta las amortizaciones (el local
    // alquilado); el caso sin ellas es el campo vacío.
    await page.getByRole('button', { name: /Local no afecto/ }).click();
    expect(await valorTarjeta(page, 'Valor de adquisición')).toBe('169.000,00 €');
    await sembrarImporte12(page, 'Amortizaciones acumuladas deducidas (€)', '');
    expect(await valorTarjeta(page, 'Valor de adquisición')).toBe('194.000,00 €');
    expect(await valorTarjeta(page, 'IRPF sobre la ganancia')).toBe('31.097,25 €');
    expect(await valorTarjeta(page, /^NETO QUE RECIBES/)).toBe('302.977,75 €');
  });

  // ══════════════════════════════════════════════════════════════════════════
  // CASO 30 (LÍMITE) — amortizaciones IGUALES a todo el coste (100.000 + 8.000 = 108.000):
  // el dato es posible (valor de adquisición 0) y la ganancia atraviesa los cinco tramos.
  //   transmisión 334.075 (plusvalía 1.125 por el objetivo, 15 años → 0,09 desde el
  //   24/09/2026: el real, 250.000 × 50/140 × 25 %, son 22.321,43) · ganancia 334.075
  //   IRPF = 1.140 + 9.240 + 34.500 + 27.000 + 34.075 × 30 % (10.222,50) =            82.102,50
  //   total = 1.125 + 14.000 + 800 + 82.102,50 = 98.027,50 (28,01 %) · NETO          251.972,50
  // ══════════════════════════════════════════════════════════════════════════
  test('CASO 30 (límite) — amortizaciones iguales al coste: adquisición 0, la ganancia llega al tramo del 30 % y se liquida', async ({ page }) => {
    await prepararCyL24(page, { compra: '100000', gastos: '8000', amort: '108000' });
    expect(await valorTarjeta(page, 'Valor de adquisición')).toBe('0,00 €');
    expect(await descripcionTarjeta(page, 'Valor de adquisición')).not.toContain('superan');
    expect(await valorTarjeta(page, 'Ganancia patrimonial')).toBe('334.075,00 €');
    expect(await valorTarjeta(page, 'IRPF sobre la ganancia')).toBe('82.102,50 €');
    expect(await valorTarjeta(page, 'Total gastos de la venta')).toBe('98.027,50 €');
    expect(await descripcionTarjeta(page, 'Total gastos de la venta')).toBe('28,01 % sobre el precio de venta');
    expect(await tituloTarjeta24(page, /^NETO QUE RECIBES/)).toBe('NETO QUE RECIBES');
    expect(await valorTarjeta(page, /^NETO QUE RECIBES/)).toBe('251.972,50 €');
  });

  // ══════════════════════════════════════════════════════════════════════════
  // CASO 31 (RECHAZO) — un euro más (108.001 > 108.000) ya es imposible (art. 40 RIRPF: se
  // amortiza la construcción, que es parte del coste). Reparado en 85daf805 (hallazgo 1261):
  //   IRPF «Sin calcular» · total = 1.125 + 14.000 + 800 = 15.925,00 (parcial)
  //   neto = 350.000 − 15.925 = 334.075,00 (PARCIAL)   (plusvalía 1.125 desde el 24/09/2026)
  // ══════════════════════════════════════════════════════════════════════════
  test('CASO 31 (rechazo) — un euro de amortización por encima del coste no se liquida y el neto no es definitivo', async ({ page }) => {
    await prepararCyL24(page, { compra: '100000', gastos: '8000', amort: '108001' });
    expect(await valorTarjeta(page, 'IRPF sobre la ganancia')).toBe('Sin calcular');
    expect(await descripcionTarjeta(page, 'IRPF sobre la ganancia')).toContain(
      'superan todo el coste de adquisición (108.000,00 €)',
    );
    await expect(page.locator('h3', { hasText: 'Ganancia patrimonial' })).toHaveCount(0);
    expect(await tituloTarjeta24(page, 'Total gastos de la venta')).toBe('Total gastos de la venta (parcial)');
    expect(await valorTarjeta(page, 'Total gastos de la venta')).toBe('15.925,00 €');
    expect(await tituloTarjeta24(page, /^NETO QUE RECIBES/)).toBe('NETO QUE RECIBES (PARCIAL)');
    expect(await valorTarjeta(page, /^NETO QUE RECIBES/)).toBe('334.075,00 €');
    expect(await avisoNeto2309(page)).toContain('Revisa las amortizaciones deducidas');
  });

  // ══════════════════════════════════════════════════════════════════════════
  // Regresión de los cambios del 24/09: e9c56b95/85c9c9fe (sin precio de compra, «puede ser
  // menor», nunca «será») y 5b5d33ae en Ceuta y Melilla, que el testigo no recorre.
  //   Sin compra: neto = 300.000 − 9.000 de comisión (3 %) = 291.000,00 (PARCIAL)
  //   Ceuta y Melilla, obra nueva, 350.000: AJD 0,5 % × 50 % = 875,00 «AJD (0,25%)»
  //   (⚠️ 24/09/2026: el caso de Ceuta usaba la RENUNCIA, que en el IPSI no existe —Ley
  //   8/1991, arts. 7 y 20.3—; ahora el botón está desactivado, y se comprueba aquí.)
  //   total (parcial) = 875 + 917,80 + 290,67 + 500 = 2583,47 · COSTE (PARCIAL) 352.583,47
  //   con la gestoría ilegible: 352.083,47, y ahí sí «será mayor» (la gestoría seguro suma)
  // ══════════════════════════════════════════════════════════════════════════
  test('regresión 24/09 — sin compra el neto «puede ser» menor, y en Ceuta y Melilla el IPSI «puede ser» mayor', async ({ page }) => {
    await sembrarImporte12(page, 'Precio del local comercial', '300000');
    await page.getByRole('button', { name: 'Vendedor', exact: true }).click();
    expect(await valorTarjeta(page, /^NETO QUE RECIBES/)).toBe('291.000,00 €');
    expect(await avisoNeto2309(page)).toBe(
      'NETO QUE RECIBES (PARCIAL) · No descuenta la plusvalía municipal ni el IRPF de la ganancia: el neto real puede ser menor que este. Rellena el valor catastral del suelo, los años de propiedad y el precio de compra original para obtenerlo.',
    );

    for (const ccaa of ['ceuta', 'melilla'] as const) {
      await page.goto(RUTA);
      await esperarHidratacion(page, TESTIGOS_12_09);
      await page.selectOption('#select-ccaa', ccaa);
      await sembrarImporte12(page, 'Precio del local comercial', '350000');
      await expect(page.getByRole('button', { name: /2ª mano con renuncia/ })).toBeDisabled();
      await page.getByRole('button', { name: /Obra nueva/ }).click();
      expect(await valorTarjeta(page, 'IPSI')).toBe('No calculado');
      expect(await tituloTarjeta24(page, /^AJD \(/)).toBe('AJD (0,25 %)');
      expect(await valorTarjeta(page, /^AJD \(/)).toBe('875,00 €');
      // ⚠️ 26/09/2026 (hallazgo 2214): notaría y registro sin IVA (llevan IPSI):
      //   notaría 433,43341 × 1,75 = 758,51 · registro 231,2120635 + 9,015182 = 240,23
      //   total = 875 + 758,51 + 240,23 + 500 = 2.373,74 · coste 352.373,74
      // La dirección del IPSI de la COMPRA sigue siendo «puede ser»; el de las facturas se dice aparte.
      expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('2373,74 €');
      expect(await tituloTarjeta24(page, /^COSTE TOTAL/)).toBe('COSTE TOTAL (PARCIAL)');
      expect(await valorTarjeta(page, /^COSTE TOTAL/)).toBe('352.373,74 €');
      expect(await descripcionTarjeta(page, /^COSTE TOTAL/)).toBe(
        'No incluye el IPSI: el coste real puede ser mayor. Las facturas de notaría y registro llevan además IPSI, que esta herramienta no calcula, así que cuestan más de lo que se muestra.',
      );
      await sembrarImporte12(page, 'Gastos de gestoría del comprador (€)', '5.0.0');
      expect(await valorTarjeta(page, /^COSTE TOTAL/)).toBe('351.873,74 €');
      expect(await descripcionTarjeta(page, /^COSTE TOTAL/)).toBe(
        'No incluye el IPSI ni la gestoría, que no se ha podido leer: el coste real será mayor. Las facturas de notaría y registro llevan además IPSI, que esta herramienta no calcula, así que cuestan más de lo que se muestra.',
      );
    }
  });

  // ─── HALLAZGOS 1570-1580 del 24/09/2026 — REPARADOS el mismo día ──────────────────────
  // Estaban con `test.fail()`. Al repararlos se les quitó la marca; los que llevaban cifras
  // de la tabla de coeficientes anterior se han recalculado a mano con la del art. 107.4
  // TRLRHL en la redacción del RDL 8/2023 (15 años → 0,09), y cada uno lo dice.

  // HALLAZGO 1570 [24/09-a] (medio), REPARADO — con la plusvalía «Sin calcular», «Valor de
  // transmisión» decía restarla y el IRPF se publicaba como definitivo siendo un MÁXIMO.
  //   suelo VACÍO: transmisión = 350.000 − 14.000 − 800 = 335.200 (sin plusvalía)
  //   ganancia 166.200 → IRPF = 1.140 + 9.240 + 116.200 × 23 % = 37.106,00; con el suelo
  //   50.000 la plusvalía (1.125) lo baja a 36.847,25 → el publicado es un máximo.
  test('[24/09-a] 1570 — con la plusvalía sin calcular, el valor de transmisión no dice que la resta y el IRPF avisa de que es un máximo', async ({ page }) => {
    await prepararCyL24(page, { suelo: '' });
    expect(await valorTarjeta(page, 'Plusvalía municipal (IIVTNU)')).toBe('Sin calcular');
    expect(await valorTarjeta(page, 'Valor de transmisión')).toBe('335.200,00 €');
    expect(await descripcionTarjeta(page, 'Valor de transmisión')).toBe(
      'Precio de venta − comisión y gestoría, sin la plusvalía municipal, que falta',
    );
    expect(await tituloTarjeta24(page, /^Ganancia patrimonial/)).toBe('Ganancia patrimonial (máximo)');
    expect(await tituloTarjeta24(page, /^IRPF sobre la ganancia/)).toBe('IRPF sobre la ganancia (máximo)');
    expect(await valorTarjeta(page, 'IRPF sobre la ganancia')).toBe('37.106,00 €');
    expect(await descripcionTarjeta(page, 'IRPF sobre la ganancia')).toBe(
      'No resta la plusvalía municipal, que falta, así que la cuota real puede ser menor.',
    );

    await sembrarImporte12(page, 'Valor catastral del suelo (€)', '50000');
    expect(await tituloTarjeta24(page, /^IRPF sobre la ganancia/)).toBe('IRPF sobre la ganancia');
    expect(await valorTarjeta(page, 'IRPF sobre la ganancia')).toBe('36.847,25 €');
  });

  // HALLAZGO 1571 [24/09-b] (bajo), REPARADO — EFECTO FAMILIA del 1232 de
  // estimador-compraventa-inmueble: con el par catastral imposible (suelo 150.000 > total
  // 140.000) el neto salía DEFINITIVO. Objetivo = 150.000 × 0,09 × 25 % = 3.375,00 ·
  // transmisión 331.825 · ganancia 162.825 · IRPF = 1.140 + 9.240 + 112.825 × 23 % =
  // 36.329,75 · neto = 295.495,25; con el recibo al derecho (50.000/140.000) el neto es
  // 297.227,75: el real puede ser MAYOR, que es lo que el aviso dice.
  test('[24/09-b] 1571 — con el par catastral imposible, el neto no se publica como definitivo', async ({ page }) => {
    await prepararCyL24(page, { suelo: '150000' });
    expect(await valorTarjeta(page, 'Plusvalía municipal (IIVTNU)')).toBe('3375,00 €');
    expect(await descripcionTarjeta(page, 'Plusvalía municipal (IIVTNU)')).toContain('revisa los dos campos');
    expect(await valorTarjeta(page, 'IRPF sobre la ganancia')).toBe('36.329,75 €');
    expect(await valorTarjeta(page, /^NETO QUE RECIBES/)).toBe('295.495,25 €');
    expect(await tituloTarjeta24(page, /^NETO QUE RECIBES/)).toBe('NETO QUE RECIBES (PARCIAL)');
    const aviso = await avisoNeto2309(page);
    expect(aviso).toContain('el neto real puede ser MAYOR que este');
    expect(aviso).toContain('Revisa los dos valores catastrales del recibo del IBI para obtenerlo.');

    await sembrarImporte12(page, 'Valor catastral del suelo (€)', '50000');
    expect(await valorTarjeta(page, /^NETO QUE RECIBES/)).toBe('297.227,75 €');
    expect(await tituloTarjeta24(page, /^NETO QUE RECIBES/)).toBe('NETO QUE RECIBES');
  });

  // HALLAZGO 1572 [24/09-c] (bajo), REPARADO — vendiendo por DEBAJO del precio de compra la
  // plusvalía es NO SUJETA (art. 104.5 TRLRHL: «No se producirá la sujeción al impuesto en las
  // transmisiones de terrenos respecto de los cuales se constate la inexistencia de incremento
  // de valor»; el motor lo decide con venta − compra ≤ 0), y la app no llamaba al motor sin el
  // suelo. venta 350.000 < compra 380.000 · transmisión 335.200 · adquisición 394.000 ·
  // pérdida 58.800,00 · neto 335.200,00 definitivo.
  test('[24/09-c] 1572 — vendiendo por debajo del precio de compra, el suelo vacío no deja el neto en parcial', async ({ page }) => {
    await prepararCyL24(page, { afecto: false, compra: '380000', suelo: '' });
    expect(await descripcionTarjeta(page, 'Plusvalía municipal (IIVTNU)')).toContain('No sujeta');
    expect(await valorTarjeta(page, 'Pérdida patrimonial')).toBe('58.800,00 €');
    expect(await valorTarjeta(page, /^NETO QUE RECIBES/)).toBe('335.200,00 €');
    expect(await tituloTarjeta24(page, /^NETO QUE RECIBES/)).toBe('NETO QUE RECIBES');
    expect(await avisoNeto2309(page)).not.toContain('Rellena el valor catastral del suelo');
  });

  // HALLAZGO 1573 [24/09-d] (medio), REPARADO — campo EXCLUSIVO de esta app: unos gastos de
  // aquella compra ILEGIBLES se tomaban como 0 al decidir si las amortizaciones son imposibles
  // (105.000 > 100.000), y la app afirmaba que «superan todo el coste de adquisición». Con los
  // gastos legibles (8.000) el coste es 108.000 y liquida: adquisición 3.000,00 · transmisión
  // 350.000 − 14.000 − 800 − 1.125 = 334.075 · ganancia 331.075 · IRPF = 1.140 + 9.240 +
  // 34.500 + 27.000 + 31.075 × 30 % = 81.202,50 · neto 252.872,50.
  test('[24/09-d] 1573 — con los gastos de aquella compra ilegibles, unas amortizaciones posibles no se declaran imposibles', async ({ page }) => {
    await prepararCyL24(page, { compra: '100000', gastos: '8000', amort: '105000' });
    expect(await valorTarjeta(page, 'IRPF sobre la ganancia')).toBe('81.202,50 €');
    expect(await valorTarjeta(page, /^NETO QUE RECIBES/)).toBe('252.872,50 €');
    await sembrarImporte12(page, 'Impuestos y gastos que pagaste al comprarlo (€)', '8.000.00');
    expect(await descripcionTarjeta(page, 'Valor de adquisición')).toContain('no se han podido leer y no están sumados');
    expect(await descripcionTarjeta(page, 'IRPF sobre la ganancia')).not.toMatch(/superan todo el coste de adquisición/);
    expect(await avisoNeto2309(page)).not.toMatch(/revisa las amortizaciones/i);
    expect(await avisoNeto2309(page)).toMatch(/impuestos y gastos de aquella compra/);
  });

  // HALLAZGO 1574 [24/09-e] (bajo), REPARADO — campo EXCLUSIVO: con las amortizaciones
  // imposibles el sondeo se apagaba entero (`sondeadas = []`) y una comisión ilegible dejaba
  // de nombrarse en el neto. Neto = 350.000 − 1.125 − 800 = 348.075,00 (sin IRPF, que no se
  // liquida; con la comisión al 4 % serían 334.075,00: 14.000,00 € menos).
  test('[24/09-e] 1574 — con las amortizaciones imposibles, el neto sigue nombrando la comisión que no se ha podido leer', async ({ page }) => {
    await prepararCyL24(page, { compra: '100000', gastos: '8000', amort: '108001', comision: '4.0.0' });
    expect(await valorTarjeta(page, 'Comisión de la inmobiliaria')).toBe('Sin leer');
    expect(await valorTarjeta(page, /^NETO QUE RECIBES/)).toBe('348.075,00 €');
    const aviso = await avisoNeto2309(page);
    expect(aviso).toMatch(/comisi[óo]n/i);
    expect(aviso).toMatch(/revisa las amortizaciones deducidas/i);
  });

  // HALLAZGO 1575 [24/09-f] (bajo), REPARADO — con la ganancia en cero porque los gastos de
  // aquella compra no se leen, «Sin ganancia ni pérdida» negaba una pérdida compensable. compra
  // 348.875 = transmisión 350.000 − 1.125 de plusvalía (sin comisión ni gestoría, sin total
  // catastral; era 348.500 con la plusvalía de 1.500 del coeficiente anterior); con los gastos
  // a 14.000 hay «Pérdida patrimonial 14.000,00 €».
  test('[24/09-f] 1575 — con la ganancia en cero por unos gastos ilegibles, no se niega la pérdida que habría', async ({ page }) => {
    await prepararCyL24(page, {
      afecto: false,
      compra: '348875',
      gastos: '14.000.00',
      total: '',
      comision: '0',
      gestoria: '',
    });
    expect(await valorTarjeta(page, 'Plusvalía municipal (IIVTNU)')).toBe('1125,00 €');
    expect(await valorTarjeta(page, 'Valor de transmisión')).toBe('348.875,00 €');
    expect(await valorTarjeta(page, 'Sin ganancia ni pérdida')).toBe('0,00 €');
    const razon = await descripcionTarjeta(page, 'Sin ganancia ni pérdida');
    expect(razon).not.toContain('ni pérdida que compensar');
    expect(razon).toContain('hay una pérdida que se compensaría en la declaración');

    await sembrarImporte12(page, 'Impuestos y gastos que pagaste al comprarlo (€)', '14000');
    expect(await valorTarjeta(page, 'Pérdida patrimonial')).toBe('14.000,00 €');
  });

  // HALLAZGO 1576 [24/09-g] (bajo), REPARADO — con la gestoría del COMPRADOR ilegible la cifra
  // de cierre conservaba el título de definitiva aunque dice «el coste real será mayor».
  // 30.000 + 917,80 + 290,67 = 31.208,47 · COSTE 381.208,47.
  test('[24/09-g] 1576 — con la gestoría del comprador ilegible, el coste total se rotula parcial', async ({ page }) => {
    await page.selectOption('#select-ccaa', 'castilla-leon');
    await sembrarImporte12(page, 'Precio del local comercial', '350000');
    await sembrarImporte12(page, 'Gastos de gestoría del comprador (€)', ILEGIBLE_2309);
    expect(await valorTarjeta(page, /^COSTE TOTAL/)).toBe('381.208,47 €');
    expect(await descripcionTarjeta(page, /^COSTE TOTAL/)).toContain('el coste real será mayor');
    expect(await tituloTarjeta24(page, /^COSTE TOTAL/)).toBe('COSTE TOTAL (PARCIAL)');
    expect(await tituloTarjeta24(page, /^Total gastos adicionales/)).toBe('Total gastos adicionales (parcial)');
  });

  // HALLAZGO 1577 [24/09-h] (bajo), REPARADO — el aviso de la pérdida con un ilegible empezaba
  // en minúscula (`avisoPerdida` sin `mayuscula()`). compra 380.000 · gastos «14.000.00» →
  // adquisición 380.000 · pérdida 44.800,00 (real 58.800,00).
  test('[24/09-h] 1577 — el aviso de la pérdida con un importe ilegible empieza con mayúscula', async ({ page }) => {
    await prepararCyL24(page, { afecto: false, compra: '380000', gastos: '14.000.00' });
    expect(await valorTarjeta(page, 'Pérdida patrimonial')).toBe('44.800,00 €');
    const aviso = await descripcionTarjeta(page, 'Pérdida patrimonial');
    expect(aviso).toContain('la pérdida real es mayor que esta');
    expect(aviso).toMatch(/^No se han podido leer/);
  });

  // HALLAZGO 1578 [24/09-i] (bajo), REPARADO — un año NEGATIVO se rechazaba bien (el campo
  // conserva «-3» y no se liquida), pero se anunciaba como si faltara. El CASO 19 se ha
  // actualizado a la misma frase.
  test('[24/09-i] 1578 — un año de propiedad negativo no se anuncia como que «faltan» los años', async ({ page }) => {
    await prepararCyL24(page, { anios: '-3' });
    await expect(page.locator('input[aria-label="Años de propiedad"]')).toHaveValue('-3');
    expect(await valorTarjeta(page, 'Plusvalía municipal (IIVTNU)')).toBe('Sin calcular');
    expect(await descripcionTarjeta(page, 'Plusvalía municipal (IIVTNU)')).toBe(
      'No calculada (los años de propiedad no pueden ser negativos)',
    );
    const aviso = await avisoNeto2309(page);
    expect(aviso).toContain('Corrige los años de propiedad (no pueden ser negativos) para obtenerlo.');
    expect(aviso).not.toMatch(/Rellena los años|faltan los años/);
  });

  // HALLAZGO 1579 [24/09-j] (medio), REPARADO — el sello del vendedor cubría «el IRPF de la
  // ganancia» con la fuente y la fecha de la plusvalía municipal. Como en
  // simulador-heredar-vivienda (hallazgo 781), cada tributo lleva ahora su sello: la plusvalía
  // con `PLUSVALIA_MUNICIPAL_META` y el IRPF con `GANANCIAS_PATRIMONIALES_META` (art. 66 LIRPF,
  // verificado el 12/08/2026).
  test('[24/09-j] 1579 — el sello del IRPF de la venta cita el art. 66 LIRPF y su propia fecha', async ({ page }) => {
    const sellos = page.locator('[class*="dataReference"]');
    await expect(sellos).toHaveCount(3);
    await expect(sellos.nth(1)).toContainText('Plusvalía municipal (IIVTNU)');
    await expect(sellos.nth(1)).not.toContainText('IRPF');
    await expect(sellos.nth(2)).toContainText('IRPF de la ganancia');
    expect(GANANCIAS_PATRIMONIALES_META.fuente).toContain('art. 66');
    await expect(sellos.nth(2)).toContainText('art. 66');
    const [a, m, d] = GANANCIAS_PATRIMONIALES_META.verificado.split('-');
    await expect(sellos.nth(2)).toContainText(`${d}/${m}/${a}`);
  });

  // HALLAZGO 1580 [24/09-k] (accesibilidad), REPARADO — dos celdas de la tabla de escenarios del
  // bloque educativo llevan colores LITERALES sin variante oscura: «Sí (si sujeto pasivo)»
  // #27ae60 da 2,64:1 en claro y «No (ITP no se recupera)» #c0392b da 3,20:1 en oscuro, por
  // debajo del 4,5:1 del texto pequeño (14,4 px). Ningún candado lo mira: el de cabeceras solo
  // mira th/thead y el del token oscuro, los .module.css.
  // Reparado con los tokens `--celda-favorable` / `--celda-desfavorable` de
  // `.tablaEscenarios` en el módulo CSS, con variante oscura (#18743a/#b03a2e en claro,
  // #81c784/#ef9a9a en oscuro, todos ≥ 5,35:1 sobre su fondo).
  test('[24/09-k] 1580 — las celdas de la tabla de escenarios alcanzan 4,5:1 en los dos temas', async ({ page }) => {
    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
    const contraste = (texto: string) =>
      page.evaluate((t) => {
        const td = [...document.querySelectorAll('table td')].find((x) => x.textContent?.trim() === t) as HTMLElement;
        const rgb = (s: string) => (s.match(/[\d.]+/g) ?? []).map(Number);
        let n: HTMLElement | null = td;
        let fondo = [255, 255, 255];
        while (n) {
          const c = rgb(getComputedStyle(n).backgroundColor);
          if (c.length >= 3 && (c[3] ?? 1) === 1) {
            fondo = c.slice(0, 3);
            break;
          }
          n = n.parentElement;
        }
        const color = rgb(getComputedStyle(td).color).slice(0, 3);
        const lum = (c: number[]) => {
          const f = (v: number) => {
            const x = v / 255;
            return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
          };
          return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]);
        };
        const [l1, l2] = [lum(color), lum(fondo)];
        return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
      }, texto);
    expect(await contraste('Sí (si sujeto pasivo)')).toBeGreaterThanOrEqual(4.5);
    await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
    await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(26, 26, 26)');
    expect(await contraste('No (ITP no se recupera)')).toBeGreaterThanOrEqual(4.5);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// RE-INSPECCIÓN 26/09/2026 — Castilla-La Mancha, el umbral de Valencia, la reventa con 0 meses
// y los ECOS de la referencia (comisión por encima del 100 %) y de garaje (2189-2192).
//
// Batería previa: 71/71 en verde y sin `test.fail()` vivo. Los hallazgos 1570-1580 siguen
// reparados: sus once casos [24/09-a…k] pasan sin marca.
//
// De dónde sale CADA cifra (ninguna de memoria):
//   · Castilla-La Mancha: tipo general 9 % de `TIPOS_ITP_CCAA_2025` (data/fiscal/inmuebles.ts:59),
//     sin escala, y AJD 1,5 % de `ITP_CCAA['castilla-mancha']` (data/itp-ccaa.ts:489).
//   · Valencia: umbral del art. 13.Uno Ley 13/1997 («si el valor supera 1.000.000 €, el tipo
//     aplicable será el 11 %»), `umbralTipoUnico` (data/itp-ccaa.ts:565); AJD de la renuncia 2 %
//     (art. 14.Dos, `ajdRenuncia`, data/itp-ccaa.ts:610).
//   · IVA del local: `IVA_INMUEBLES_2025.local` = 21 (data/fiscal/inmuebles.ts:110).
//   · Notaría: `ARANCELES_NOTARIO` (RD 1426/1989) × 1,21 de IVA × 1,75 (punto medio de
//     `FACTURA_NOTARIAL`). Registro: `ARANCELES_REGISTRO` (RD 1427/1989) + `REGISTRO_CONCEPTOS`
//     (6,010121 + 3,005061) × 1,21.
//   · Plusvalía: `COEFICIENTES_IIVTNU_2025` (12 años 0,09, l. 377; menos de un año 0,15, l. 365),
//     prorrateado por meses completos en `coeficienteIIVTNU` (l. 436, art. 107.4 TRLRHL), × tipo
//     orientativo del 25 %; método real del art. 107.5 en `calcularPlusvaliaMunicipal`.
//   · IRPF: `TRAMOS_GANANCIAS_PATRIMONIALES_2025` (l. 150-156) sobre el art. 35 LIRPF; las
//     amortizaciones minoran el valor de adquisición (art. 35.2 LIRPF y art. 40 RIRPF), en
//     `calcularGananciaInmueble` (data/fiscal/ganancia-inmueble.ts).
// ═════════════════════════════════════════════════════════════════════════════

/** Espera a que la tarjeta publique la cifra (tras un selectOption o un clic). */
async function esperarTarjeta2609(page: Page, titulo: string | RegExp, esperado: string): Promise<void> {
  await expect.poll(() => valorTarjeta(page, titulo)).toBe(esperado);
}

/** El vendedor en Madrid, con la base del testigo de familia salvo lo que se pida. */
async function prepararVendedor2609(
  page: Page,
  {
    precio = '200000',
    afecto = false,
    compra = '150000',
    gastos = '15000',
    amort = '',
    anios = '10',
    suelo = '40000',
    total = '100000',
    comision = '3',
    gestoria = '500',
  }: {
    precio?: string;
    afecto?: boolean;
    compra?: string;
    gastos?: string;
    amort?: string;
    anios?: string;
    suelo?: string;
    total?: string;
    comision?: string;
    gestoria?: string;
  } = {},
): Promise<void> {
  await sembrarImporte12(page, 'Precio del local comercial', precio);
  await page.getByRole('button', { name: 'Vendedor', exact: true }).click();
  if (afecto) {
    await page.getByRole('button', { name: /Local afecto a actividad/ }).click();
    await sembrarImporte12(page, 'Amortizaciones acumuladas deducidas (€)', amort);
  }
  await sembrarImporte12(page, 'Precio de compra original', compra);
  await sembrarImporte12(page, 'Impuestos y gastos que pagaste al comprarlo (€)', gastos);
  await sembrarImporte12(page, 'Años de propiedad', anios);
  await sembrarImporte12(page, 'Valor catastral del suelo (€)', suelo);
  await sembrarImporte12(page, 'Valor catastral total (suelo + construcción) (€)', total);
  await sembrarImporte12(page, 'Comisión de la inmobiliaria (%)', comision);
  await sembrarImporte12(page, 'Gestoría y certificados del vendedor (€)', gestoria);
}

/**
 * Contraste WCAG del texto de un elemento contra su fondo REAL: compone las capas con alfa de
 * los ancestros (el botón de transmisión activo lleva un velo rgba de la marca).
 */
function contrasteElemento2609(el: Element): number {
  const rgba = (s: string) => {
    const m = (s.match(/[\d.]+/g) ?? []).map(Number);
    return { r: m[0], g: m[1], b: m[2], a: m.length > 3 ? m[3] : 1 };
  };
  const capas: { r: number; g: number; b: number; a: number }[] = [];
  let n: Element | null = el;
  while (n) {
    const c = rgba(getComputedStyle(n).backgroundColor);
    if (c.a > 0) capas.push(c);
    if (c.a === 1) break;
    n = n.parentElement;
  }
  let fondo = { r: 255, g: 255, b: 255 };
  if (capas.length && capas[capas.length - 1].a === 1) fondo = capas.pop() as typeof fondo;
  for (let i = capas.length - 1; i >= 0; i--) {
    const c = capas[i];
    fondo = { r: c.r * c.a + fondo.r * (1 - c.a), g: c.g * c.a + fondo.g * (1 - c.a), b: c.b * c.a + fondo.b * (1 - c.a) };
  }
  const t = rgba(getComputedStyle(el).color);
  const texto = { r: t.r * t.a + fondo.r * (1 - t.a), g: t.g * t.a + fondo.g * (1 - t.a), b: t.b * t.a + fondo.b * (1 - t.a) };
  const lum = (c: { r: number; g: number; b: number }) => {
    const f = (v: number) => {
      const x = v / 255;
      return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
    };
    return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
  };
  const [l1, l2] = [lum(texto), lum(fondo)];
  return Math.round(((Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)) * 100) / 100;
}

test.describe('RE-INSPECCIÓN 26/09/2026 — Castilla-La Mancha, el umbral de Valencia y los ecos de la familia', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, TESTIGOS_12_09);
  });

  // ══════════════════════════════════════════════════════════════════════════
  // CASO 32 (NORMAL) — CASTILLA-LA MANCHA, local de 400.000 €, la única comunidad de tipo plano
  // que ninguna vuelta había liquidado, por las tres vías y con un vendedor afecto.
  //   Notaría: 90,15 + 24.040,49 × 0,45 % + 30.050,60 × 0,15 % + 90.151,82 × 0,10 %
  //     + 249.746,97 × 0,05 % = 458,43341 × 1,21 = 554,704426
  //     ×1,5 = 832,06 · ×2 = 1109,41 · ×1,75 =                                         970,73
  //   Registro: 24,04 + 42,0708575 + 37,56325 + 67,613865 + 249.746,97 × 0,03 % (74,924091)
  //     = 246,2120635 + 9,015182 = 255,2272455 × 1,21 =                                308,82
  //   2ª mano: ITP 400.000 × 9 % = 36.000 · total 36.000 + 970,73 + 308,82 + 500 = 37.779,55
  //     (9,44 % del precio) · COSTE                                                437.779,55
  //   Obra nueva: IVA 21 % = 84.000 + AJD 1,5 % = 6000 · total 91.779,55 (22,94 %) · COSTE 491.779,55
  //   Renuncia (art. 20.Dos LIVA, ISP): el mismo IVA y, sin tipo propio en la tabla, el AJD
  //     general 1,5 %: el mismo total, 91.779,55.
  //   VENDEDOR afecto: compra 220.000 · gastos 22.000 · amortizaciones 30.000 · 12 años · suelo
  //     90.000 · total 250.000 · comisión 3 % · gestoría 600
  //     plusvalía objetivo = 90.000 × 0,09 × 25 % = 2025,00 ; real = 180.000 × 0,36 × 25 % = 16.200
  //       → gana el objetivo
  //     adquisición = 220.000 + 22.000 − 30.000 =                                  212.000,00
  //     transmisión = 400.000 − 12.000 − 600 − 2.025 =                             385.375,00
  //     ganancia 173.375 → IRPF = 1.140 + 9.240 + 123.375 × 23 % =                  38.756,25
  //     total = 2.025 + 12.000 + 600 + 38.756,25 = 53.381,25 (13,35 %) · NETO       346.618,75
  // ══════════════════════════════════════════════════════════════════════════
  test('CASO 32 (normal) — Castilla-La Mancha 400.000 €: ITP plano al 9 %, IVA + AJD por las dos vías, y un vendedor afecto con 38.756,25 € de IRPF', async ({ page }) => {
    await page.selectOption('#select-ccaa', 'castilla-mancha');
    await sembrarImporte12(page, 'Precio del local comercial', '400000');

    await expect(page.locator('h3', { hasText: /^ITP/ }).first()).toHaveText(/^ITP \(9,00\s?%\)$/);
    expect(await valorTarjeta(page, /^ITP/)).toBe('36.000,00 €');
    await expect(page.locator('h3', { hasText: /^AJD/ })).toHaveCount(0);
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('970,73 €');
    expect(await descripcionTarjeta(page, 'Gastos de notaría')).toContain('entre 832,06 € y 1109,41 €');
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('308,82 €');
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('37.779,55 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toMatch(/^9,44\s?% sobre el precio de compra$/);
    expect(await valorTarjeta(page, /^COSTE TOTAL/)).toBe('437.779,55 €');

    await page.getByRole('button', { name: /Obra nueva/ }).click();
    await esperarTarjeta2609(page, /^IVA/, '84.000,00 €');
    await expect(page.locator('h3', { hasText: /^AJD/ }).first()).toHaveText(/^AJD \(1,50\s?%\)$/);
    expect(await valorTarjeta(page, /^AJD/)).toBe('6000,00 €');
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('91.779,55 €');
    expect(await valorTarjeta(page, /^COSTE TOTAL/)).toBe('491.779,55 €');

    await page.getByRole('button', { name: /renuncia IVA/ }).click();
    await expect(page.locator('h3', { hasText: /^IVA/ }).first()).toHaveText(/^IVA \(renuncia · ISP\) \(21,00\s?%\)$/);
    expect(await valorTarjeta(page, /^AJD/)).toBe('6000,00 €');
    expect(await descripcionTarjeta(page, /^AJD/)).toBe(
      'AJD general de Castilla-La Mancha: algunas comunidades aplican un tipo incrementado en la renuncia',
    );
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('91.779,55 €');
    await expect(page.locator('h3', { hasText: /^ITP/ })).toHaveCount(0);

    // ── Vendedor afecto a actividad
    await page.getByRole('button', { name: 'Vendedor', exact: true }).click();
    await page.getByRole('button', { name: /Local afecto a actividad/ }).click();
    await sembrarImporte12(page, 'Precio de compra original', '220000');
    await sembrarImporte12(page, 'Impuestos y gastos que pagaste al comprarlo (€)', '22000');
    await sembrarImporte12(page, 'Amortizaciones acumuladas deducidas (€)', '30000');
    await sembrarImporte12(page, 'Años de propiedad', '12');
    await sembrarImporte12(page, 'Valor catastral del suelo (€)', '90000');
    await sembrarImporte12(page, 'Valor catastral total (suelo + construcción) (€)', '250000');
    await sembrarImporte12(page, 'Comisión de la inmobiliaria (%)', '3');
    await sembrarImporte12(page, 'Gestoría y certificados del vendedor (€)', '600');

    expect(await valorTarjeta(page, 'Plusvalía municipal (IIVTNU)')).toBe('2025,00 €');
    expect(await descripcionTarjeta(page, 'Plusvalía municipal (IIVTNU)')).toMatch(/^Método objetivo \(más favorable\)/);
    expect(await valorTarjeta(page, 'Valor de adquisición')).toBe('212.000,00 €');
    expect(await descripcionTarjeta(page, 'Valor de adquisición')).toBe(
      'Precio de compra + impuestos y gastos de aquella compra − 30.000,00 € de amortizaciones deducidas',
    );
    expect(await valorTarjeta(page, 'Valor de transmisión')).toBe('385.375,00 €');
    expect(await valorTarjeta(page, 'Ganancia patrimonial')).toBe('173.375,00 €');
    expect(await valorTarjeta(page, 'IRPF sobre la ganancia')).toBe('38.756,25 €');
    expect(await valorTarjeta(page, 'Comisión de la inmobiliaria')).toBe('12.000,00 €');
    expect(await valorTarjeta(page, 'Total gastos de la venta')).toBe('53.381,25 €');
    expect(await descripcionTarjeta(page, 'Total gastos de la venta')).toMatch(/^13,35\s?% sobre el precio de venta$/);
    expect(await valorTarjeta(page, /^NETO QUE RECIBES/)).toBe('346.618,75 €');
    expect(await tituloTarjeta24(page, /^NETO QUE RECIBES/)).toBe('NETO QUE RECIBES');
  });

  // ══════════════════════════════════════════════════════════════════════════
  // CASO 33 (LÍMITE) — dos fronteras.
  //  (a) VALENCIA en el umbral del art. 13.Uno Ley 13/1997 (`superiorA: 1_000_000`, «supera»):
  //      1.000.000,00 € → 9 % → 90.000,00 € («ITP (9,00 %)») y el recuadro dice 9
  //      1.000.000,01 € → 11 % sobre TODO el valor → 110.000,0011 → 110.000,00 € y el recuadro, 11
  //      Renuncia a 1.200.000 €: IVA 252.000 · AJD de la renuncia 2 % = 24.000
  //        notaría (90,15 + 108,182205 + 45,0759 + 90,15182 + 450.759,07 × 0,05 % + 598.987,90 ×
  //        0,03 %) = 738,63583 × 1,21 × 1,75 = 1564,06 · registro (426,3132735 + 9,015182) ×
  //        1,21 = 526,75 → total 278.590,81 · COSTE 1.478.590,81
  //  (b) REVENTA ANTES DEL AÑO con 0 meses completos: el art. 107.4 TRLRHL prorratea el
  //      coeficiente anual (0,15) «teniendo en cuenta el número de meses completos» → 0,15 × 0/12
  //      = 0: plusvalía 0,00 € (y el método real, 60.000 × 0,4 × 25 % = 6.000, no puede bajarla).
  //      venta 300.000 · compra 240.000 · suelo 60.000 · total 150.000 · comisión 0 · sin gastos
  //      ganancia 60.000 → IRPF = 1.140 + 9.240 + 10.000 × 23 % = 12.680,00 · NETO 287.320,00
  //      Con 10 meses: 0,15 × 10/12 = 0,125 → plusvalía 60.000 × 0,125 × 25 % = 1875,00
  //      ganancia 58.125 → IRPF = 1.140 + 9.240 + 8.125 × 23 % = 12.248,75 · NETO 285.876,25
  // ══════════════════════════════════════════════════════════════════════════
  test('CASO 33 (límite) — Valencia en el euro del millón (9 % → 11 % sobre todo), renuncia al 2 %, y la reventa con 0 y 10 meses completos', async ({ page }) => {
    await page.selectOption('#select-ccaa', 'valencia');
    const recuadroITP = page.locator('[class*="infoCcaaItem"]').first();

    await sembrarImporte12(page, 'Precio del local comercial', '1000000');
    await expect(page.locator('h3', { hasText: /^ITP/ }).first()).toHaveText(/^ITP \(9,00\s?%\)$/);
    expect(await valorTarjeta(page, /^ITP/)).toBe('90.000,00 €');
    await expect(recuadroITP).toContainText(/ITP General\s*9\s?%/);

    await sembrarImporte12(page, 'Precio del local comercial', '1000000,01');
    await expect(page.locator('h3', { hasText: /^ITP/ }).first()).toHaveText(/^ITP \(11,00\s?%\)$/);
    expect(await valorTarjeta(page, /^ITP/)).toBe('110.000,00 €');
    await expect(recuadroITP).toContainText(/ITP General\s*11\s?%/);

    await sembrarImporte12(page, 'Precio del local comercial', '1200000');
    await page.getByRole('button', { name: /renuncia IVA/ }).click();
    await esperarTarjeta2609(page, /^IVA/, '252.000,00 €');
    await expect(page.locator('h3', { hasText: /^AJD/ }).first()).toHaveText(/^AJD \(2,00\s?%\)$/);
    expect(await valorTarjeta(page, /^AJD/)).toBe('24.000,00 €');
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('278.590,81 €');
    expect(await valorTarjeta(page, /^COSTE TOTAL/)).toBe('1.478.590,81 €');

    // ── (b) La reventa antes del año
    await sembrarImporte12(page, 'Precio del local comercial', '300000');
    await page.getByRole('button', { name: 'Vendedor', exact: true }).click();
    await sembrarImporte12(page, 'Precio de compra original', '240000');
    await sembrarImporte12(page, 'Años de propiedad', '0');
    await sembrarImporte12(page, 'Valor catastral del suelo (€)', '60000');
    await sembrarImporte12(page, 'Valor catastral total (suelo + construcción) (€)', '150000');
    await sembrarImporte12(page, 'Comisión de la inmobiliaria (%)', '0');
    expect(await valorTarjeta(page, 'Plusvalía municipal (IIVTNU)')).toBe('Sin calcular');

    await page.locator('#meses-completos').selectOption('0');
    await esperarTarjeta2609(page, 'Plusvalía municipal (IIVTNU)', '0,00 €');
    expect(await valorTarjeta(page, 'IRPF sobre la ganancia')).toBe('12.680,00 €');
    expect(await valorTarjeta(page, /^NETO QUE RECIBES/)).toBe('287.320,00 €');
    expect(await tituloTarjeta24(page, /^NETO QUE RECIBES/)).toBe('NETO QUE RECIBES');

    await page.locator('#meses-completos').selectOption('10');
    await esperarTarjeta2609(page, 'Plusvalía municipal (IIVTNU)', '1875,00 €');
    expect(await valorTarjeta(page, 'IRPF sobre la ganancia')).toBe('12.248,75 €');
    expect(await valorTarjeta(page, /^NETO QUE RECIBES/)).toBe('285.876,25 €');
  });

  // ══════════════════════════════════════════════════════════════════════════
  // CASO 34 (NOMBRAR) — el invariante de la familia en el campo EXCLUSIVO, combinado con un
  // dato que FALTA: amortizaciones «2.000.50» (ilegibles) y el suelo vacío (plusvalía sin calcular).
  //   Madrid 200.000 · afecto · compra 150.000 · gastos 15.000 · 10 años · total 100.000 · 3 % · 500
  //   adquisición 165.000 (sin restar las amortizaciones) · transmisión 200.000 − 6.000 − 500 = 193.500
  //   ganancia 28.500 → IRPF = 1.140 + 22.500 × 21 % = 5865,00 · NETO 200.000 − 12.365 = 187.635,00
  //   La plusvalía que falta BAJA la cuota y las amortizaciones la SUBEN: la tarjeta no puede ser
  //   un máximo y lo dice («sentidos contrarios»); el neto baja por las dos, y lo dice.
  // ══════════════════════════════════════════════════════════════════════════
  test('CASO 34 (nombrar) — amortizaciones ilegibles con la plusvalía sin calcular: la cuota «sin cerrar» y el neto menor, cada uno con su causa', async ({ page }) => {
    await prepararVendedor2609(page, { afecto: true, amort: ILEGIBLE_2309, suelo: '' });
    expect(await valorTarjeta(page, 'Plusvalía municipal (IIVTNU)')).toBe('Sin calcular');
    expect(await descripcionTarjeta(page, 'Valor de adquisición')).toContain(
      'Las amortizaciones deducidas no se han podido leer y no están restadas',
    );
    expect(await valorTarjeta(page, 'IRPF sobre la ganancia')).toBe('5865,00 €');
    expect(await tituloTarjeta24(page, /^IRPF sobre la ganancia/)).toBe('IRPF sobre la ganancia');
    expect(await descripcionTarjeta(page, 'IRPF sobre la ganancia')).toContain(
      'Sin cerrar: falta la plusvalía municipal, no se han podido leer las amortizaciones deducidas y mueven la cuota en sentidos contrarios',
    );
    expect(await valorTarjeta(page, /^NETO QUE RECIBES/)).toBe('187.635,00 €');
    expect(await tituloTarjeta24(page, /^NETO QUE RECIBES/)).toBe('NETO QUE RECIBES (PARCIAL)');
    const aviso = await avisoNeto2309(page);
    expect(aviso).toContain('No descuenta la plusvalía municipal: el neto real puede ser menor que este');
    expect(aviso).toContain('amortizaciones deducidas');
    expect(aviso).toContain('el neto real es menor que este');
    expect(aviso).not.toMatch(/MAYOR/);
  });

  // ─── HALLAZGOS del 26/09/2026 (2198-2203), REPARADOS el mismo día ────────────────────
  // Se escribieron con `test.fail()` afirmando lo que DEBERÍA ocurrir. Al repararlos se les quitó
  // la marca y se reforzaron con lo que la reparación decidió; las aserciones de preparación
  // (cifras que la reparación no debía mover) siguen como estaban.

  // HALLAZGO 2198 [26/09-a] (medio, cálculo) — ECO del 2186 de la referencia y del 2191 de garaje, y
  // aquí PEOR: el campo de la comisión no lleva max ni avisa de nada. Con «150» la app liquida
  // una comisión de 300.000 € sobre una venta de 200.000; el motor acota el valor de transmisión
  // a 0 (data/fiscal/ganancia-inmueble.ts:136-139) y fabrica una «Pérdida patrimonial» igual a
  // todo el valor de adquisición, 165.000 €, «que se puede compensar en la declaración» y
  // «vendes por debajo del valor de adquisición», falso: la venta (200.000) supera la
  // adquisición (165.000). El neto, −101.700 €, salía como «NETO QUE RECIBES» definitivo.
  //   comisión 200.000 × 150 % = 300.000 · plusvalía 1.200 · transmisión max(0, −101.700) = 0
  //   total 1.200 + 300.000 + 500 = 301.700 · neto −101.700
  // REPARADO (patrón 5, «no falta, no vale»): el campo lo nombra sin reescribirlo, la ganancia y
  // el IRPF no se liquidan con el dato imposible, y el neto es PARCIAL y dice qué corregir. Las
  // cifras de preparación no se mueven: la app sigue publicando lo que descuenta.
  //   Con la GESTORÍA de la venta mayor que el precio (comisión 3 %, gestoría 250.000):
  //   total 1.200 + 6.000 + 250.000 = 257.200 · neto −57.200
  test('[26/09-a] una comisión del 150 % no produce un neto definitivo ni una pérdida compensable', async ({ page }) => {
    await prepararVendedor2609(page, { comision: '150' });
    await expect(page.locator('input[aria-label="Comisión de la inmobiliaria (%)"]')).toHaveValue('150');
    expect(await valorTarjeta(page, 'Comisión de la inmobiliaria')).toBe('300.000,00 €');
    expect(await valorTarjeta(page, 'Valor de transmisión')).toBe('0,00 €');
    expect(await valorTarjeta(page, 'Total gastos de la venta')).toBe('301.700,00 €');
    expect((await valorTarjeta(page, /^NETO QUE RECIBES/)).replace('−', '-')).toBe('-101.700,00 €');
    // El defecto: nada nombraba el dato imposible y todo se publicaba como firme.
    await expect(page.locator('h3', { hasText: 'Pérdida patrimonial' })).toHaveCount(0);
    await expect(page.locator('h3', { hasText: 'Ganancia patrimonial' })).toHaveCount(0);
    expect(await tituloTarjeta24(page, /^NETO QUE RECIBES/)).toBe('NETO QUE RECIBES (PARCIAL)');
    const aviso = await avisoNeto2309(page);
    expect(aviso).toMatch(/comisi[óo]n/i);
    expect(aviso).toContain('La comisión no puede superar el 100 % del precio de venta');
    expect(aviso).toContain('Corrige la comisión para obtenerlo.');
    expect(aviso).not.toMatch(/neto real (?:es|será|puede ser) (?:mayor|menor)/i);
    expect(await valorTarjeta(page, 'IRPF sobre la ganancia')).toBe('Sin calcular');
    expect(await descripcionTarjeta(page, 'IRPF sobre la ganancia')).toContain(
      'la comisión no puede superar el 100 % del precio de venta',
    );
    const panel = (await page.locator('[class*="resultsInner"]').first().innerText()).replace(ESPACIO_DURO, ' ');
    expect(panel).not.toContain('Vendes por debajo del valor de adquisición');
    // El propio campo lo dice, sin reescribir lo escrito.
    await expect(page.getByRole('alert').filter({ hasText: 'La comisión no puede superar el 100' })).toHaveCount(1);

    // La gestoría de la venta mayor que el precio, igual.
    await sembrarImporte12(page, 'Comisión de la inmobiliaria (%)', '3');
    await sembrarImporte12(page, 'Gestoría y certificados del vendedor (€)', '250000');
    expect(await valorTarjeta(page, 'Total gastos de la venta')).toBe('257.200,00 €');
    expect((await valorTarjeta(page, /^NETO QUE RECIBES/)).replace('−', '-')).toBe('-57.200,00 €');
    await expect(page.locator('h3', { hasText: 'Pérdida patrimonial' })).toHaveCount(0);
    expect(await tituloTarjeta24(page, /^NETO QUE RECIBES/)).toBe('NETO QUE RECIBES (PARCIAL)');
    const avisoGestoria = await avisoNeto2309(page);
    expect(avisoGestoria).toContain('La gestoría de la venta no puede superar el precio de venta');
    expect(avisoGestoria).toContain('Corrige la gestoría de la venta para obtenerlo.');
    expect(await valorTarjeta(page, 'IRPF sobre la ganancia')).toBe('Sin calcular');

    // Y con los dos datos posibles vuelve el caso base, definitivo (IRPF 5613,00 · neto 186.687,00).
    await sembrarImporte12(page, 'Gestoría y certificados del vendedor (€)', '500');
    expect(await valorTarjeta(page, 'IRPF sobre la ganancia')).toBe('5613,00 €');
    expect(await valorTarjeta(page, /^NETO QUE RECIBES/)).toBe('186.687,00 €');
    expect(await tituloTarjeta24(page, /^NETO QUE RECIBES/)).toBe('NETO QUE RECIBES');
  });

  // HALLAZGO 2199 [26/09-b] (medio, contenido) — CAMPO EXCLUSIVO: el perfil que admitía
  // amortizaciones se llama «Local afecto a actividad» y el otro, «Local no afecto · Patrimonio
  // particular», que es justo donde cae el local ALQUILADO por un particular (el arrendamiento sin
  // actividad no es actividad económica, art. 27.2 LIRPF). Pero su valor de adquisición también se
  // minora en las amortizaciones (art. 35.2 LIRPF: «se minorará, en su caso, en el importe de las
  // amortizaciones»; art. 40 RIRPF, al menos la mínima), y la propia guía de la app lo dice: «Si
  // lo usaste en tu negocio o lo tuviste alquilado y deduciste amortización». El formulario no
  // nombraba el alquiler en ninguna parte y el neto salía definitivo.
  // REPARADO: el campo de amortizaciones existe en los DOS perfiles (el mismo NumberInput, así que
  // el testigo de familia lo sigue cubriendo con su fila), y el perfil «no afecto» nombra el
  // alquiler en su rótulo y en la ayuda del campo. Recalculado a mano con la escala del ahorro de
  // `TRAMOS_GANANCIAS_PATRIMONIALES_2025` (data/fiscal/inmuebles.ts:150: 19 % hasta 6.000, 21 %
  // hasta 50.000) y el coeficiente de 10 años, 0,12 (l. 375):
  //   plusvalía objetivo 40.000 × 0,12 × 25 % = 1.200 (real 50.000 × 0,4 × 25 % = 5.000, no gana)
  //   transmisión 200.000 − 6.000 − 500 − 1.200 = 192.300
  //   sin amortización: adquisición 165.000 · ganancia 27.300 → IRPF 1.140 + 21.300 × 21 %
  //     = 5613,00 · NETO 200.000 − 1.200 − 6.000 − 500 − 5.613 = 186.687,00
  //   con 20.000 del alquiler: adquisición 145.000 · ganancia 47.300 → IRPF 1.140 + 41.300 × 21 %
  //     = 1.140 + 8.673 = 9813,00 · NETO 200.000 − 17.513 = 182.487,00
  test('[26/09-b] el vendedor de un local ALQUILADO encuentra dónde restar la amortización', async ({ page }) => {
    await prepararVendedor2609(page);
    expect(await valorTarjeta(page, 'IRPF sobre la ganancia')).toBe('5613,00 €');
    expect(await valorTarjeta(page, /^NETO QUE RECIBES/)).toBe('186.687,00 €');
    await page.getByRole('button', { name: /Local afecto a actividad/ }).click();
    await sembrarImporte12(page, 'Amortizaciones acumuladas deducidas (€)', '20000');
    expect(await valorTarjeta(page, 'IRPF sobre la ganancia')).toBe('9813,00 €');
    expect(await valorTarjeta(page, /^NETO QUE RECIBES/)).toBe('182.487,00 €');
    await page.getByRole('button', { name: /Local no afecto/ }).click();
    // El defecto: ni los perfiles ni el formulario nombraban el local alquilado.
    await expect(page.locator('[class*="formVendedor"]').first()).toContainText(/alquil|arrend/i);
    await expect(page.getByRole('button', { name: /Local no afecto/ })).toContainText('alquilado');

    // Y el perfil del alquiler RESTA la amortización, con la misma cifra: el campo sigue a la vista.
    await expect(page.locator('input[aria-label="Amortizaciones acumuladas deducidas (€)"]')).toHaveValue('20000');
    expect(await valorTarjeta(page, 'IRPF sobre la ganancia')).toBe('9813,00 €');
    expect(await valorTarjeta(page, /^NETO QUE RECIBES/)).toBe('182.487,00 €');
    expect(await tituloTarjeta24(page, /^NETO QUE RECIBES/)).toBe('NETO QUE RECIBES');
    expect(await descripcionTarjeta(page, 'Valor de adquisición')).toBe(
      'Precio de compra + impuestos y gastos de aquella compra − 20.000,00 € de amortizaciones deducidas',
    );
    const ayuda = (await page.locator('[class*="formVendedor"]').first().innerText()).replace(ESPACIO_DURO, ' ');
    expect(ayuda).toContain('Si lo tuviste alquilado');

    // Desde un arranque limpio, el perfil «no afecto» basta: sin tocar el otro.
    await page.goto(RUTA);
    await esperarHidratacion(page, TESTIGOS_12_09);
    await prepararVendedor2609(page);
    await sembrarImporte12(page, 'Amortizaciones acumuladas deducidas (€)', '20000');
    expect(await valorTarjeta(page, 'IRPF sobre la ganancia')).toBe('9813,00 €');
    expect(await valorTarjeta(page, /^NETO QUE RECIBES/)).toBe('182.487,00 €');
  });

  // HALLAZGO 2200 [26/09-c] (bajo, contenido) — ECO del 2189 de garaje y del 1799 de la referencia
  // (patrón 5): un precio de compra escrito como 0 se anunciaba como que FALTA y se pedía
  // «rellenarlo» con el 0 a la vista. Neto: 200.000 − 6.000 − 500 = 193.500,00 (PARCIAL, sin
  // plusvalía ni IRPF), que es correcto; lo que fallaba era la frase.
  // REPARADO con el texto de la referencia: «tiene que ser mayor que 0» y «corrige…», también con
  // un negativo mientras el campo tiene el foco (el blur, con min=0, lo reescribiría a 0).
  test('[26/09-c] un precio de compra 0 se pide corregir, no se anuncia como que falta', async ({ page }) => {
    await prepararVendedor2609(page, { compra: '0' });
    await expect(page.locator('input[aria-label="Precio de compra original"]')).toHaveValue('0');
    expect(await valorTarjeta(page, 'IRPF sobre la ganancia')).toBe('Sin calcular');
    expect(await valorTarjeta(page, /^NETO QUE RECIBES/)).toBe('193.500,00 €');
    expect(await tituloTarjeta24(page, /^NETO QUE RECIBES/)).toBe('NETO QUE RECIBES (PARCIAL)');
    expect(await descripcionTarjeta(page, 'IRPF sobre la ganancia')).not.toContain('Falta el precio de compra original');
    expect(await avisoNeto2309(page)).not.toContain('Rellena el precio de compra original');
    expect(await descripcionTarjeta(page, 'IRPF sobre la ganancia')).toBe(
      'El precio de compra original tiene que ser mayor que 0: corrígelo. Este impuesto NO está incluido en el neto de abajo.',
    );
    expect(await descripcionTarjeta(page, 'Plusvalía municipal (IIVTNU)')).toBe(
      'No calculada (el precio de compra original tiene que ser mayor que 0)',
    );
    expect(await avisoNeto2309(page)).toContain(
      'Corrige el precio de compra original (tiene que ser mayor que 0) para obtenerlo.',
    );

    // Un negativo con el foco dentro: lo mismo.
    await sembrarImporte12(page, 'Precio de compra original', '-5', { blur: false });
    expect(await descripcionTarjeta(page, 'IRPF sobre la ganancia')).toContain('tiene que ser mayor que 0');
    expect(await avisoNeto2309(page)).not.toContain('Rellena el precio de compra original');

    // Y VACÍO sigue siendo lo que falta, que se rellena.
    await sembrarImporte12(page, 'Precio de compra original', '');
    expect(await descripcionTarjeta(page, 'IRPF sobre la ganancia')).toContain('Falta el precio de compra original');
    expect(await avisoNeto2309(page)).toContain('Rellena el precio de compra original');
  });

  // HALLAZGO 2201 [26/09-d] (bajo, contenido) — ECO del 2192 de garaje, de la familia entera: con el
  // valor catastral total ilegible y PÉRDIDA, la tarjeta prometía «(o puede haber ganancia)». El
  // total solo puede abaratar la plusvalía, y ni con plusvalía 0 habría ganancia.
  //   compra 195.000 · gastos 15.000 · total «100.000.00» → plusvalía 1200,00 (objetivo)
  //   transmisión 200.000 − 6.000 − 500 − 1.200 = 192.300 · adquisición 210.000 · pérdida 17.700
  //   con plusvalía 0: 193.500 − 210.000 = −16.500 → sigue siendo pérdida
  //   con el total bien escrito (100.000): real 5.000 × 0,4 × 25 % = 500 → pérdida 17.000,00
  // REPARADO: la promesa se CALCULA (sondeo y plusvalía a cero). Contrapunto en el que sí se
  // escribe: compra 193.000 → adquisición 208.000, pérdida con la plusvalía objetivo 15.700, y
  // con plusvalía 0: 193.500 − 208.000 = −14.500, tampoco. Hace falta que la plusvalía sea lo único
  // que separa de la ganancia: compra 178.000 · gastos 15.000 → adquisición 193.000; transmisión
  // con 1.200 = 192.300 → pérdida 700,00; con plusvalía 0 = 193.500 → ganancia 500. Ahí sí.
  test('[26/09-d] con el total catastral ilegible y pérdida, no se promete una ganancia imposible', async ({ page }) => {
    await prepararVendedor2609(page, { compra: '195000', total: '100.000.00' });
    expect(await valorTarjeta(page, 'Plusvalía municipal (IIVTNU)')).toBe('1200,00 €');
    expect(await valorTarjeta(page, 'Pérdida patrimonial')).toBe('17.700,00 €');
    expect(await valorTarjeta(page, /^NETO QUE RECIBES/)).toBe('192.300,00 €');
    expect(await avisoNeto2309(page)).toContain('el neto real puede ser MAYOR que este');
    const avisoPerdida = await descripcionTarjeta(page, 'Pérdida patrimonial');
    await sembrarImporte12(page, 'Valor catastral total (suelo + construcción) (€)', '100000');
    expect(await valorTarjeta(page, 'Pérdida patrimonial')).toBe('17.000,00 €');
    expect(avisoPerdida).toContain('la pérdida real puede ser menor que esta');
    expect(avisoPerdida).not.toContain('(o puede haber ganancia)');

    // Donde la plusvalía es lo único que separa de la ganancia, la promesa sí se escribe.
    await sembrarImporte12(page, 'Precio de compra original', '178000');
    await sembrarImporte12(page, 'Valor catastral total (suelo + construcción) (€)', '100.000.00');
    expect(await valorTarjeta(page, 'Pérdida patrimonial')).toBe('700,00 €');
    expect(await descripcionTarjeta(page, 'Pérdida patrimonial')).toContain('(o puede haber ganancia)');
  });

  // HALLAZGO 2202 [26/09-e] (bajo, contenido) — el % pegado a la cifra (CLAUDE.md global §2, desde el
  // 25/09/2026, 75d5db87), que la referencia ya separa (hallazgo 1800). Medido: 28 casos en el
  // texto visible («ITP (6,00%)», «6%» del recuadro, «x% sobre el precio», «IVA 21%», «(19%-30%)»,
  // la nota del sello «del 6% al 13%»…), 2 con espacio normal y ninguno con espacio duro; 17 en
  // el JSON-LD y la meta description («IVA 21% en obra nueva»).
  // REPARADO: `conPct`/`PCT` en la página, `separarPorcentajes` en los textos que llegan de data/,
  // y `PCT` en metadata.ts. Se mira el texto visible de las dos pestañas con la guía abierta: ni un
  // % pegado ni uno separado por un espacio NORMAL (que deja saltar el % solo de línea).
  test('[26/09-e] el % va separado de la cifra con espacio duro, en pantalla y en el JSON-LD', async ({ page }) => {
    await sembrarImporte12(page, 'Precio del local comercial', '200000');
    expect(await valorTarjeta(page, /^ITP/)).toBe('12.000,00 €');
    const ld = (await page.locator('script[type="application/ld+json"]').allTextContents()).join('\n');
    expect(ld).toContain('FAQPage');
    await expect(page.locator('h3', { hasText: /^ITP/ }).first()).toHaveText('ITP (6,00 %)');
    expect(ld).not.toMatch(/\d%/);
    expect(ld).not.toMatch(/\d %/);
    const meta = (await page.locator('meta[name="description"]').getAttribute('content')) ?? '';
    expect(meta).toContain('IVA 21');
    expect(meta).not.toMatch(/\d ?%/);

    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
    const pegados: string[] = [];
    const conEspacioNormal: string[] = [];
    const mirar = async (donde: string) => {
      const texto = await page.locator('body').innerText();
      for (const m of texto.matchAll(/.{0,25}\d%.{0,5}/g)) pegados.push(`${donde}: ${m[0]}`);
      for (const m of texto.matchAll(/.{0,25}\d %.{0,5}/g)) conEspacioNormal.push(`${donde}: ${m[0]}`);
    };
    await mirar('comprador');
    await prepararVendedor2609(page, { afecto: true, amort: '20000' });
    await mirar('vendedor');
    expect(pegados).toEqual([]);
    expect(conEspacioNormal).toEqual([]);
  });

  // HALLAZGO 2203 [26/09-f] (medio, accesibilidad) — ECO del 2188 de garaje y del 1801 de la
  // referencia: el color de marca como texto y como fondo de la pestaña activa, sin los tokens
  // --primary-texto / --primary-boton de globals.css. Medido con getComputedStyle sobre el fondo
  // compuesto, transiciones apagadas. Claro: pestaña activa (blanco sobre #2E86AB, 16 px/600)
  // 4,11:1; «Datos de la operación» 4,11; botón de transmisión activo 3,74; nombre de la
  // comunidad 3,93; valor del recuadro 4,11; enlace al Catastro 4,11; celdas «IVA 21%» de la
  // tabla 3,77. Oscuro: la pestaña activa, blanco sobre #3FA5D1, 2,79:1. Ninguno es texto grande.
  // REPARADO con los tokens, como la referencia. Se miden ahora TODOS en los dos temas.
  test('[26/09-f] el color de marca alcanza 4,5:1 como texto y en la pestaña activa, en los dos temas', async ({ page }) => {
    await page.addStyleTag({ content: '*,*::before,*::after{transition:none!important;animation:none!important}' });
    await page.mouse.move(0, 0);
    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
    const objetivos = {
      'pestaña activa': page.getByRole('button', { name: 'Comprador', exact: true }),
      'Datos de la operación': page.locator('h2[class*="sectionTitle"]'),
      'transmisión activa': page.getByRole('button', { name: /Segunda mano/ }).first().locator('span').nth(1),
      'nombre de la comunidad': page.locator('[class*="infoCcaaNombre"]'),
      'valor del recuadro': page.locator('[class*="infoCcaaValue"]').first(),
      'enlace al Catastro': page.locator('a[class*="catastroLink"]').first(),
      'celda IVA de la tabla': page.locator('table td', { hasText: /^IVA \d/ }).first(),
    };
    const fallan: string[] = [];
    for (const [nombre, loc] of Object.entries(objetivos)) {
      const r = await loc.evaluate(contrasteElemento2609);
      if (r < 4.5) fallan.push(`claro · ${nombre} ${r}:1`);
    }
    await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
    await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(26, 26, 26)');
    for (const [nombre, loc] of Object.entries(objetivos)) {
      const r = await loc.evaluate(contrasteElemento2609);
      if (r < 4.5) fallan.push(`oscuro · ${nombre} ${r}:1`);
    }
    expect(fallan).toEqual([]);
  });
  // RECETA 1 de la familia (hallazgo 2214, motor reparado en 242fffcd; lo cierra el coordinador
  // con las siete). En Canarias, Ceuta y Melilla la factura de notaría y la de registro no llevan
  // IVA sino IGIC o IPSI, que el catálogo no calcula: la app pasa la comunidad al motor y lo dice.
  // Caso de origen: Canarias · 150.000 €, registro 217,94 € «(IVA incluido)» → 180,11 € sin IGIC.
  //   registro (ARANCELES_REGISTRO, RD 1427/1989): 24,04 + 24.040,49 × 0,175 % (42,0708575) +
  //     30.050,60 × 0,125 % (37,56325) + 89.898,79 × 0,075 % (67,4240925) = 171,0981999
  //     + REGISTRO_CONCEPTOS 9,015182 = 180,113382 → 180,11 · × 1,21 (península) = 217,94
  //   notaría (ARANCELES_NOTARIO, RD 1426/1989): 90,15 + 108,182205 + 45,0759 + 89.898,79 × 0,10 %
  //     (89,89879) = 333,306895 × 1,75 = 583,29 · × 1,21 × 1,75 (península) = 705,78
  test('[2214] en Canarias notaría y registro van sin IVA y el coste dice que les falta el IGIC', async ({ page }) => {
    await sembrarImporte12(page, 'Precio del local comercial', '150000');
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('217,94 €');
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('705,78 €');
    await expect(page.locator('h3', { hasText: 'Registro de la Propiedad' })).toHaveText('Registro de la Propiedad (IVA incluido)');
    await expect(page.locator('h3', { hasText: 'Gastos de notaría' })).toHaveText('Gastos de notaría (IVA incluido)');
    expect(await tituloTarjeta24(page, /^COSTE TOTAL/)).toBe('COSTE TOTAL DE ADQUISICIÓN');

    await page.selectOption('#select-ccaa', 'canarias');
    await expect(page.locator('h3', { hasText: 'Registro de la Propiedad' })).toHaveText('Registro de la Propiedad (sin IGIC)');
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('180,11 €');
    await expect(page.locator('h3', { hasText: 'Gastos de notaría' })).toHaveText('Gastos de notaría (sin IGIC)');
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('583,29 €');
    expect(await tituloTarjeta24(page, /^COSTE TOTAL/)).toBe('COSTE TOTAL (PARCIAL)');
    expect(await descripcionTarjeta(page, /^COSTE TOTAL/)).toBe(
      // 26/09/2026: la frase común de las siete para los honorarios, sin «coste real».
      'Las facturas de notaría y registro llevan además IGIC, que esta herramienta no calcula, así que cuestan más de lo que se muestra.',
    );
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
    const CAMPO = 'input[aria-label="Precio del local comercial"]';
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
    await page.getByRole('button', { name: /Obra nueva/ }).first().click();
    await expect(page.locator('h3', { hasText: /^AJD/ })).toHaveCount(1);
    expect(await crudo(/^AJD/)).toContain(AVISO_BASE_AJD);
    expect((await crudo(/^COSTE TOTAL/)).endsWith(AVISO_BASE_AJD)).toBe(true);
    const idAyuda = await page.locator(CAMPO).getAttribute('aria-describedby');
    const ayuda = (await page.locator(`[id="${idAyuda}"]`).innerText()).replace(/\s+/g, ' ');
    expect(ayuda).toContain('La base del AJD no puede ser inferior al valor de referencia catastral (art. 30.1 TRLITPAJD)');
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// RE-INSPECCIÓN 06/10/2026 — Cantabria, la renuncia que Ceuta no tiene, la venta al precio de
// compra y las CIFRAS INTERMEDIAS de la familia («Un importe ILEGIBLE no es un cero»).
//
// Batería previa: los 82 casos de arriba en verde, sin `test.fail()` vivo, y la base del
// Inspector sin hallazgos abiertos en esta app. Verificado en navegador lo que entró después del
// 26/09: 72e1184a (2198-2203 y la amortización del local ALQUILADO en el perfil «no afecto»),
// 7d5c1876 (total parcial sin IGIC/IPSI y la salvedad del art. 30.1 TRLITPAJD) y 242fffcd
// (notaría y registro sin IVA en Canarias, Ceuta y Melilla; el % con espacio duro en los textos de
// data/itp-ccaa.ts: 0 porcentajes pegados en las 19 comunidades × 3 operaciones, las dos pestañas,
// el JSON-LD y la meta description).
//
// ⚠️ Notaría y registro NO se fijan en estos casos: data/itp-ccaa.ts no aplica la rebaja del 5 %
// del RD 1426/1989 (Anexo I, nº 2.1) ni la del RD 1427/1989 (hallazgos 2901 y 2902, abiertos en la
// referencia y comunes a las siete). Se lee lo que pinta la app y se exige que el total cuadre con
// las líneas visibles (hallazgo 594), que es lo que no cambiará al repararlos.
//
// De dónde sale CADA cifra (ninguna de memoria):
//   · Cantabria: tipo general 9 % de `TIPOS_ITP_CCAA_2025` (data/fiscal/inmuebles.ts:58), sin escala
//     en `ITP_CCAA.cantabria`, y AJD 1,5 % (data/itp-ccaa.ts:437), sin tipo propio de la renuncia.
//   · Ceuta: tipo 6 % de `ITP_CCAA.ceuta` y la bonificación del 50 % de la cuota (art. 57 bis
//     TRLITPAJD, `BONIFICACION_CUOTA_CEUTA_MELILLA`); la renuncia no existe en el IPSI
//     (`TERRITORIOS_SIN_RENUNCIA` de la página, Ley 8/1991 arts. 7 y 20.3).
//   · País Vasco: 7 % para lo que no es vivienda (`tipoNoVivienda`, NF 1/2011 art. 13.a) y AJD 0,5 %.
//   · Madrid: 6 % y AJD 0,75 %. Límite del arancel notarial: `LIMITE_ARANCEL_NOTARIAL` (RD 1426/1989,
//     nº 2.1: lo que excede es de libre acuerdo).
//   · IVA del local: `IVA_INMUEBLES_2025.local` = 21.
//   · Plusvalía: `COEFICIENTES_IIVTNU_2025` (6 años 0,19; 10 años 0,12) × 25 % orientativo; no
//     sujeción del art. 104.5 TRLRHL cuando la venta no supera la compra.
//   · IRPF: `TRAMOS_GANANCIAS_PATRIMONIALES_2025` (19 % hasta 6.000 · 21 % hasta 50.000 · 23 % hasta
//     200.000) sobre el art. 35 LIRPF; las amortizaciones minoran el valor de adquisición (art. 35.2
//     LIRPF y art. 40.1 RIRPF, «computándose en todo caso la amortización mínima», BOE-A-2007-6820).
// ═════════════════════════════════════════════════════════════════════════════

/** Céntimos de un importe pintado («17.766,77 €» → 1776677): la app pinta siempre dos decimales. */
const centimos0610 = (s: string): number => Number(s.replace(/\D/g, ''));

/**
 * El total del comprador cuadra con las líneas que se ven (hallazgo 594) y el coste es precio +
 * total, sin fijar la notaría ni el registro (hallazgos 2901 y 2902).
 */
async function totalCuadra0610(page: Page, precio: number, lineas: (string | RegExp)[]): Promise<void> {
  let suma = 0;
  for (const l of lineas) suma += centimos0610(await valorTarjeta(page, l));
  expect(centimos0610(await valorTarjeta(page, 'Total gastos adicionales'))).toBe(suma);
  expect(centimos0610(await valorTarjeta(page, /^COSTE TOTAL/))).toBe(precio * 100 + suma);
}

test.describe('RE-INSPECCIÓN 06/10/2026 — Cantabria, la renuncia que Ceuta no tiene, la venta al precio de compra y las cifras intermedias', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, TESTIGOS_12_09);
  });

  // ══════════════════════════════════════════════════════════════════════════
  // CASO 35 (NORMAL) — CANTABRIA, local de 180.000 €, la única comunidad de tipo plano que
  // ninguna vuelta había liquidado, y un vendedor que lo tuvo ALQUILADO (perfil «no afecto»).
  //   2ª mano: ITP 180.000 × 9 % = 16.200,00 → «ITP (9,00 %)», sin AJD.
  //   Obra nueva: IVA 21 % = 37.800,00 + AJD 1,5 % = 2700,00.
  //   Renuncia (art. 20.Dos LIVA, ISP): el mismo IVA y, sin tipo propio, el AJD general: 2700,00.
  //   VENDEDOR no afecto: compra 120.000 · gastos 10.000 · amortizaciones del alquiler 15.000 ·
  //     6 años · suelo 30.000 · total 90.000 · comisión 4 % · gestoría 300
  //     plusvalía objetivo = 30.000 × 0,19 × 25 % = 1425,00 ; real = 60.000 × ⅓ × 25 % = 5.000
  //       → gana el objetivo
  //     transmisión = 180.000 − 7.200 − 300 − 1.425 =                             171.075,00
  //     adquisición = 120.000 + 10.000 − 15.000 =                                  115.000,00
  //     ganancia 56.075 → IRPF = 1.140 + 9.240 + 6.075 × 23 % =                     11.777,25
  //     total = 1.425 + 7.200 + 300 + 11.777,25 = 20.702,25 (11,50 %) · NETO       159.297,75
  // ══════════════════════════════════════════════════════════════════════════
  test('CASO 35 (normal) — Cantabria 180.000 €: ITP plano al 9 %, IVA + AJD por las dos vías, y el vendedor de un local alquilado', async ({ page }) => {
    expect(ITP_CCAA.cantabria.tipoGeneral).toBe(9);
    expect(ITP_CCAA.cantabria.tramosProgresivos).toBeUndefined();
    expect(ITP_CCAA.cantabria.ajd).toBe(1.5);
    expect(ITP_CCAA.cantabria.ajdRenuncia).toBeUndefined();
    expect(IVA_INMUEBLES_2025.local).toBe(21);
    expect(COEFICIENTES_IIVTNU_2025.find((c) => c.anios === 6)?.coeficiente).toBe(0.19);
    expect(PLUSVALIA_MUNICIPAL_META.tipoOrientativo).toBe(25);

    await page.selectOption('#select-ccaa', 'cantabria');
    await sembrarImporte12(page, 'Precio del local comercial', '180000');
    await sembrarImporte12(page, 'Gastos de gestoría del comprador (€)', '600');

    await esperarTarjeta2609(page, /^ITP/, '16.200,00 €');
    expect(await tituloTarjeta24(page, /^ITP/)).toBe('ITP (9,00 %)');
    await expect(page.locator('h3', { hasText: /^AJD/ })).toHaveCount(0);
    await totalCuadra0610(page, 180000, [/^ITP/, 'Gastos de notaría', 'Registro de la Propiedad', 'Gastos de gestoría']);
    expect(await tituloTarjeta24(page, /^COSTE TOTAL/)).toBe('COSTE TOTAL DE ADQUISICIÓN');

    await page.getByRole('button', { name: /Obra nueva/ }).click();
    await esperarTarjeta2609(page, /^IVA \(21/, '37.800,00 €');
    expect(await tituloTarjeta24(page, /^AJD/)).toBe('AJD (1,50 %)');
    expect(await valorTarjeta(page, /^AJD/)).toBe('2700,00 €');
    await totalCuadra0610(page, 180000, [/^IVA/, /^AJD/, 'Gastos de notaría', 'Registro de la Propiedad', 'Gastos de gestoría']);

    await page.getByRole('button', { name: /2ª mano con renuncia/ }).click();
    await esperarTarjeta2609(page, /^IVA \(renuncia/, '37.800,00 €');
    expect(await valorTarjeta(page, /^AJD/)).toBe('2700,00 €');
    expect(await descripcionTarjeta(page, /^AJD/)).toBe(
      'AJD general de Cantabria: algunas comunidades aplican un tipo incrementado en la renuncia',
    );
    await totalCuadra0610(page, 180000, [/^IVA/, /^AJD/, 'Gastos de notaría', 'Registro de la Propiedad', 'Gastos de gestoría']);

    await page.getByRole('button', { name: 'Vendedor', exact: true }).click();
    await expect(page.getByRole('button', { name: /Local no afecto/ })).toHaveAttribute('aria-pressed', 'true');
    await sembrarImporte12(page, 'Precio de compra original', '120000');
    await sembrarImporte12(page, 'Impuestos y gastos que pagaste al comprarlo (€)', '10000');
    await sembrarImporte12(page, 'Amortizaciones acumuladas deducidas (€)', '15000');
    await sembrarImporte12(page, 'Años de propiedad', '6');
    await sembrarImporte12(page, 'Valor catastral del suelo (€)', '30000');
    await sembrarImporte12(page, 'Valor catastral total (suelo + construcción) (€)', '90000');
    await sembrarImporte12(page, 'Comisión de la inmobiliaria (%)', '4');
    await sembrarImporte12(page, 'Gestoría y certificados del vendedor (€)', '300');

    expect(await valorTarjeta(page, 'Plusvalía municipal (IIVTNU)')).toBe('1425,00 €');
    expect(await descripcionTarjeta(page, 'Plusvalía municipal (IIVTNU)')).toBe(
      'Método objetivo (más favorable), tipo municipal orientativo del 25 %',
    );
    expect(await valorTarjeta(page, 'Valor de adquisición')).toBe('115.000,00 €');
    expect(await descripcionTarjeta(page, 'Valor de adquisición')).toBe(
      'Precio de compra + impuestos y gastos de aquella compra − 15.000,00 € de amortizaciones deducidas',
    );
    expect(await valorTarjeta(page, 'Valor de transmisión')).toBe('171.075,00 €');
    expect(await valorTarjeta(page, 'Ganancia patrimonial')).toBe('56.075,00 €');
    expect(await valorTarjeta(page, 'IRPF sobre la ganancia')).toBe('11.777,25 €');
    expect(await valorTarjeta(page, 'Comisión de la inmobiliaria')).toBe('7200,00 €');
    expect(await valorTarjeta(page, 'Total gastos de la venta')).toBe('20.702,25 €');
    expect(await descripcionTarjeta(page, 'Total gastos de la venta')).toBe('11,50 % sobre el precio de venta');
    expect(await valorTarjeta(page, /^NETO QUE RECIBES/)).toBe('159.297,75 €');
    expect(await tituloTarjeta24(page, /^NETO QUE RECIBES/)).toBe('NETO QUE RECIBES');
  });

  // ══════════════════════════════════════════════════════════════════════════
  // CASO 36 (LÍMITE) — la renuncia elegida en Madrid y la comunidad cambiada a CEUTA, donde no
  // existe: el botón se desactiva, se calcula la segunda mano y la elección vuelve al regresar.
  //   Madrid, renuncia: IVA 200.000 × 21 % = 42.000,00 · AJD 0,75 % = 1500,00
  //   Ceuta, 2ª mano: ITP 200.000 × 6 % × (1 − 50 %) = 6000,00 → «ITP (3,00 %)», sin AJD ni IVA;
  //     notaría y registro sin IPSI → total y coste «(PARCIAL)».
  // ══════════════════════════════════════════════════════════════════════════
  test('CASO 36 (límite) — la renuncia elegida y la comunidad cambiada a Ceuta: segunda mano bonificada, y la elección vuelve en Madrid', async ({ page }) => {
    expect(ITP_CCAA.ceuta.tipoGeneral).toBe(6);
    expect(BONIFICACION_CUOTA_CEUTA_MELILLA).toBe(0.5);
    expect(ITP_CCAA.madrid.ajd).toBe(0.75);

    await sembrarImporte12(page, 'Precio del local comercial', '200000');
    const renuncia = page.getByRole('button', { name: /2ª mano con renuncia/ });
    await renuncia.click();
    await esperarTarjeta2609(page, /^IVA \(renuncia/, '42.000,00 €');
    expect(await valorTarjeta(page, /^AJD/)).toBe('1500,00 €');

    await page.selectOption('#select-ccaa', 'ceuta');
    await esperarTarjeta2609(page, /^ITP/, '6000,00 €');
    await expect(renuncia).toBeDisabled();
    await expect(renuncia).toHaveAttribute('aria-pressed', 'false');
    await expect(page.getByRole('button', { name: /Segunda mano/ }).first()).toHaveAttribute('aria-pressed', 'true');
    expect(await tituloTarjeta24(page, /^ITP/)).toBe('ITP (3,00 %)');
    expect(await descripcionTarjeta(page, /^ITP/)).toContain('bonificación del 50 %');
    await expect(page.locator('h3', { hasText: /^AJD/ })).toHaveCount(0);
    await expect(page.locator('h3', { hasText: /^IVA/ })).toHaveCount(0);
    await totalCuadra0610(page, 200000, [/^ITP/, 'Gastos de notaría', 'Registro de la Propiedad', 'Gastos de gestoría']);
    expect(await tituloTarjeta24(page, 'Gastos de notaría')).toBe('Gastos de notaría (sin IPSI)');
    expect(await tituloTarjeta24(page, /^COSTE TOTAL/)).toBe('COSTE TOTAL (PARCIAL)');

    await page.selectOption('#select-ccaa', 'madrid');
    await esperarTarjeta2609(page, /^IVA \(renuncia/, '42.000,00 €');
    await expect(renuncia).toBeEnabled();
    await expect(renuncia).toHaveAttribute('aria-pressed', 'true');
  });

  // ══════════════════════════════════════════════════════════════════════════
  // CASO 36-bis (LÍMITE) — PAÍS VASCO con renuncia (el AJD de un local, no el 0 de la vivienda) y
  // un precio por encima del límite del arancel notarial.
  //   País Vasco 350.000: 2ª mano ITP 7 % = 24.500,00 · renuncia IVA 73.500,00 + AJD 0,5 % = 1750,00
  //   Madrid 8.000.000, 2ª mano: ITP 6 % = 480.000,00; la notaría que excede de 6.010.121,04 € es
  //     de libre acuerdo, así que total y coste «(parcial)» y dicen qué les falta.
  // ══════════════════════════════════════════════════════════════════════════
  test('CASO 36-bis (límite) — País Vasco con renuncia (AJD 0,5 %) y un local de 8.000.000 € con la notaría de libre acuerdo', async ({ page }) => {
    expect(ITP_CCAA['pais-vasco'].tipoGeneralNoVivienda).toBe(7);
    expect(ITP_CCAA['pais-vasco'].ajd).toBe(0.5);
    expect(ITP_CCAA['pais-vasco'].ajdRenuncia).toBeUndefined();
    expect(LIMITE_ARANCEL_NOTARIAL).toBe(6010121.04);

    await page.selectOption('#select-ccaa', 'pais-vasco');
    await sembrarImporte12(page, 'Precio del local comercial', '350000');
    await esperarTarjeta2609(page, /^ITP/, '24.500,00 €');
    expect(await tituloTarjeta24(page, /^ITP/)).toBe('ITP (7,00 %)');
    await page.getByRole('button', { name: /2ª mano con renuncia/ }).click();
    await esperarTarjeta2609(page, /^IVA \(renuncia/, '73.500,00 €');
    expect(await tituloTarjeta24(page, /^AJD/)).toBe('AJD (0,50 %)');
    expect(await valorTarjeta(page, /^AJD/)).toBe('1750,00 €');
    await totalCuadra0610(page, 350000, [/^IVA/, /^AJD/, 'Gastos de notaría', 'Registro de la Propiedad', 'Gastos de gestoría']);

    await page.selectOption('#select-ccaa', 'madrid');
    await page.getByRole('button', { name: /Segunda mano/ }).first().click();
    await sembrarImporte12(page, 'Precio del local comercial', '8000000');
    await esperarTarjeta2609(page, /^ITP/, '480.000,00 €');
    expect(await descripcionTarjeta(page, 'Gastos de notaría')).toContain(
      'Por encima de 6.010.121,04 € el arancel no fija cantidad',
    );
    await totalCuadra0610(page, 8000000, [/^ITP/, 'Gastos de notaría', 'Registro de la Propiedad', 'Gastos de gestoría']);
    expect(await tituloTarjeta24(page, 'Total gastos adicionales')).toBe('Total gastos adicionales (parcial)');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toContain('SIN la parte de la notaría que es de libre acuerdo');
    expect(await tituloTarjeta24(page, /^COSTE TOTAL/)).toBe('COSTE TOTAL (PARCIAL)');
    expect(await descripcionTarjeta(page, /^COSTE TOTAL/)).toBe(
      'No incluye la parte de la notaría que excede de 6.010.121,04 €, que es de libre acuerdo: el coste real puede ser mayor',
    );
  });

  // ══════════════════════════════════════════════════════════════════════════
  // CASO 37 (LÍMITE, vendedor) — se vende por EXACTAMENTE lo que se pagó: la plusvalía no está
  // sujeta (art. 104.5 TRLRHL, sin computar gastos) aunque falten el suelo y los años, y aun así
  // hay IRPF, porque las amortizaciones del alquiler bajan el valor de adquisición.
  //   Madrid · 200.000 · no afecto · compra 200.000 · gastos 15.000 · amortizaciones 30.000 ·
  //   suelo, total y años VACÍOS · comisión 3 % · gestoría 500
  //   plusvalía 0,00 (no sujeta) · transmisión = 200.000 − 6.000 − 500 =          193.500,00
  //   adquisición = 200.000 + 15.000 − 30.000 =                                   185.000,00
  //   ganancia 8.500 → IRPF = 1.140 + 2.500 × 21 % =                                 1665,00
  //   total = 6.000 + 500 + 1.665 = 8165,00 (4,08 %) · NETO 191.835,00, definitivo
  // ══════════════════════════════════════════════════════════════════════════
  test('CASO 37 (límite) — vender al precio de compra: plusvalía no sujeta sin pedir el suelo, e IRPF por las amortizaciones del alquiler', async ({ page }) => {
    await sembrarImporte12(page, 'Precio del local comercial', '200000');
    await page.getByRole('button', { name: 'Vendedor', exact: true }).click();
    await sembrarImporte12(page, 'Precio de compra original', '200000');
    await sembrarImporte12(page, 'Impuestos y gastos que pagaste al comprarlo (€)', '15000');
    await sembrarImporte12(page, 'Amortizaciones acumuladas deducidas (€)', '30000');
    await sembrarImporte12(page, 'Gestoría y certificados del vendedor (€)', '500');

    expect(await valorTarjeta(page, 'Plusvalía municipal (IIVTNU)')).toBe('0,00 €');
    expect(await descripcionTarjeta(page, 'Plusvalía municipal (IIVTNU)')).toBe('No sujeta (sin incremento de valor)');
    expect(await valorTarjeta(page, 'Valor de adquisición')).toBe('185.000,00 €');
    expect(await valorTarjeta(page, 'Valor de transmisión')).toBe('193.500,00 €');
    expect(await valorTarjeta(page, 'Ganancia patrimonial')).toBe('8500,00 €');
    expect(await valorTarjeta(page, 'IRPF sobre la ganancia')).toBe('1665,00 €');
    expect(await valorTarjeta(page, 'Total gastos de la venta')).toBe('8165,00 €');
    expect(await descripcionTarjeta(page, 'Total gastos de la venta')).toBe('4,08 % sobre el precio de venta');
    expect(await valorTarjeta(page, /^NETO QUE RECIBES/)).toBe('191.835,00 €');
    expect(await tituloTarjeta24(page, /^NETO QUE RECIBES/)).toBe('NETO QUE RECIBES');
    expect(await descripcionTarjeta(page, /^NETO QUE RECIBES/)).toBe('Precio de venta menos impuestos, comisión y gestoría');
  });

  // ══════════════════════════════════════════════════════════════════════════
  // CASO 38 (NOMBRAR) — el invariante de la familia en las CIFRAS INTERMEDIAS, no solo en el neto:
  // cada tarjeta que un importe ilegible mueve lo nombra y dice hacia dónde queda la real.
  // BASE del testigo (prepararBaseFamilia2309): adquisición 145.000 · transmisión 192.300 ·
  // ganancia 47.300 · IRPF 9813,00 · neto 182.487,00. Con cada ilegible a 0:
  //   comisión «3.5.0»  → transmisión 198.300 · ganancia 53.300 · IRPF 1.140 + 9.240 + 3.300 × 23 %
  //                       = 11.139,00 · neto 187.161,00 (las tres reales, MENORES)
  //   gestoría «5.0.0»  → transmisión 192.800 · ganancia 47.800 · IRPF 1.140 + 41.800 × 21 % =
  //                       9918,00 · neto 182.882,00 (MENORES)
  //   gastos «2.000.50» → adquisición 130.000 · ganancia 62.300 · IRPF 1.140 + 9.240 + 12.300 × 23 %
  //                       = 13.209,00 · neto 179.091,00 (ganancia e IRPF reales MENORES)
  //   amort. «2.000.50» → adquisición 165.000 · ganancia 27.300 · IRPF 1.140 + 21.300 × 21 % =
  //                       5613,00 · neto 186.687,00 (ganancia e IRPF reales MAYORES)
  // Y el PUNTO CIEGO del grupo, el campo exclusivo en el perfil «no afecto» (desde 72e1184a): BASE R
  // (compra 195.000, gana el método real, plusvalía 500) con las amortizaciones ilegibles →
  //   adquisición 210.000 · transmisión 193.000 · pérdida 17.000 (con las 20.000 reales hay ganancia
  //   de 3.000) · neto 193.000,00 (el real, 192.430,00, menor).
  // ══════════════════════════════════════════════════════════════════════════
  test('CASO 38 (nombrar) — cada cifra intermedia que mueve un importe ilegible lo nombra y dice hacia dónde', async ({ page }) => {
    const filas: { campo: string; ilegible: string; tarjetas: [string, string, string][]; neto: string }[] = [
      {
        campo: 'Comisión de la inmobiliaria (%)',
        ilegible: '3.5.0',
        tarjetas: [
          ['Valor de transmisión', '198.300,00 €', 'la comisión no se ha podido leer'],
          ['Ganancia patrimonial', '53.300,00 €', 'La comisión inmobiliaria no se ha podido leer, así que la ganancia real es menor'],
          ['IRPF sobre la ganancia', '11.139,00 €', 'La comisión inmobiliaria no se ha podido leer, así que la cuota real es menor'],
        ],
        neto: '187.161,00 €',
      },
      {
        campo: 'Gestoría y certificados del vendedor (€)',
        ilegible: '5.0.0',
        tarjetas: [
          ['Valor de transmisión', '192.800,00 €', 'la gestoría de la venta no se ha podido leer'],
          ['Ganancia patrimonial', '47.800,00 €', 'La gestoría de la venta no se ha podido leer, así que la ganancia real es menor'],
          ['IRPF sobre la ganancia', '9918,00 €', 'La gestoría de la venta no se ha podido leer, así que la cuota real es menor'],
        ],
        neto: '182.882,00 €',
      },
      {
        campo: 'Impuestos y gastos que pagaste al comprarlo (€)',
        ilegible: ILEGIBLE_2309,
        tarjetas: [
          ['Valor de adquisición', '130.000,00 €', 'Los impuestos y gastos de aquella compra no se han podido leer y no están sumados'],
          ['Ganancia patrimonial', '62.300,00 €', 'No se han podido leer los impuestos y gastos de aquella compra, así que la ganancia real es menor'],
          ['IRPF sobre la ganancia', '13.209,00 €', 'No se han podido leer los impuestos y gastos de aquella compra, así que la cuota real es menor'],
        ],
        neto: '179.091,00 €',
      },
      {
        campo: 'Amortizaciones acumuladas deducidas (€)',
        ilegible: ILEGIBLE_2309,
        tarjetas: [
          ['Valor de adquisición', '165.000,00 €', 'Las amortizaciones deducidas no se han podido leer y no están restadas'],
          ['Ganancia patrimonial', '27.300,00 €', 'No se han podido leer las amortizaciones deducidas, así que la ganancia real es mayor'],
          ['IRPF sobre la ganancia', '5613,00 €', 'No se han podido leer las amortizaciones deducidas, así que la cuota real es mayor'],
        ],
        neto: '186.687,00 €',
      },
    ];
    const fallos: string[] = [];
    for (const f of filas) {
      await page.goto(RUTA);
      await esperarHidratacion(page, TESTIGOS_12_09);
      await prepararBaseFamilia2309(page);
      await sembrarImporte12(page, f.campo, f.ilegible);
      for (const [titulo, valor, aviso] of f.tarjetas) {
        const v = await valorTarjeta(page, titulo);
        const d = await descripcionTarjeta(page, titulo);
        if (v !== valor) fallos.push(`${f.campo} «${f.ilegible}» · ${titulo}: ${v} (esperado ${valor})`);
        if (!d.includes(aviso)) fallos.push(`${f.campo} «${f.ilegible}» · ${titulo} no lo nombra: «${d}»`);
      }
      if ((await valorTarjeta(page, /^NETO QUE RECIBES/)) !== f.neto) fallos.push(`${f.campo} · neto distinto de ${f.neto}`);
      if ((await tituloTarjeta24(page, /^NETO QUE RECIBES/)) !== 'NETO QUE RECIBES (PARCIAL)') fallos.push(`${f.campo} · neto no parcial`);
    }
    expect(fallos).toEqual([]);

    // El punto ciego: las amortizaciones del local ALQUILADO, en el perfil «no afecto».
    await page.goto(RUTA);
    await esperarHidratacion(page, TESTIGOS_12_09);
    await prepararVendedor2609(page, { compra: '195000' });
    await expect(page.getByRole('button', { name: /Local no afecto/ })).toHaveAttribute('aria-pressed', 'true');
    await sembrarImporte12(page, 'Amortizaciones acumuladas deducidas (€)', ILEGIBLE_2309);
    expect(await valorTarjeta(page, 'Plusvalía municipal (IIVTNU)')).toBe('500,00 €');
    expect(await valorTarjeta(page, 'Valor de adquisición')).toBe('210.000,00 €');
    expect(await descripcionTarjeta(page, 'Valor de adquisición')).toContain(
      'Las amortizaciones deducidas no se han podido leer y no están restadas',
    );
    expect(await valorTarjeta(page, 'Pérdida patrimonial')).toBe('17.000,00 €');
    expect(await descripcionTarjeta(page, 'Pérdida patrimonial')).toContain(
      'No se han podido leer las amortizaciones deducidas: la pérdida real es menor que esta (o puede haber ganancia)',
    );
    expect(await valorTarjeta(page, /^NETO QUE RECIBES/)).toBe('193.000,00 €');
    expect(await avisoNeto2309(page)).toContain('el neto real puede ser menor que este');
  });

  // ─── HALLAZGOS del 06/10/2026, ABIERTOS ──────────────────────────────────────────────
  // Con `test.fail()`, afirmando lo que DEBERÍA ocurrir. Las aserciones previas a la del defecto
  // son cifras que la reparación no debe mover; la del defecto no reintenta (lee y compara), para
  // que el fallo sea inmediato y no un timeout.

  // HALLAZGO [06/10-a] (bajo, operativa) — ❌ ABIERTO. La cifra INTERMEDIA que se escapa del
  // invariante: con el valor catastral total ilegible y el método REAL ganando, la plusvalía se
  // liquida por el objetivo (1200,00 en vez de 500,00) y «Valor de transmisión» baja 700 € sin que su
  // tarjeta lo diga: «Precio de venta − comisión, gestoría y plusvalía municipal». La plusvalía, la
  // ganancia, el IRPF y el neto sí nombran el ilegible («puede ser mayor»). Es la forma del hallazgo
  // de hoy en la referencia (la base imponible de la tarjeta de la ganancia), y la referencia, garaje
  // y trastero tienen la misma descripción fija en su «Valor de transmisión».
  //   BASE R: plusvalía real = (200.000 − 195.000) × 0,4 × 25 % = 500 < objetivo 40.000 × 0,12 × 25 %
  //   = 1.200 → transmisión = 200.000 − 6.000 − 500 − 500 = 193.000,00
  //   total «100.000.00» → plusvalía 1.200 → transmisión 192.300,00 (la real, MAYOR)
  test('[06/10-a] con el valor catastral total ilegible, «Valor de transmisión» nombra el dato y dice que el real puede ser mayor', async ({ page }) => {
    test.fail();
    await prepararVendedor2609(page, { afecto: true, amort: '20000', compra: '195000' });
    expect(await valorTarjeta(page, 'Plusvalía municipal (IIVTNU)')).toBe('500,00 €');
    expect(await valorTarjeta(page, 'Valor de transmisión')).toBe('193.000,00 €');

    await sembrarImporte12(page, 'Valor catastral total (suelo + construcción) (€)', '100.000.00');
    expect(await valorTarjeta(page, 'Plusvalía municipal (IIVTNU)')).toBe('1200,00 €');
    expect(await valorTarjeta(page, 'Valor de transmisión')).toBe('192.300,00 €');
    expect(await descripcionTarjeta(page, 'Ganancia patrimonial')).toContain(
      'El valor catastral total no se ha podido leer, así que la ganancia real puede ser mayor',
    );
    expect(await descripcionTarjeta(page, 'IRPF sobre la ganancia')).toContain('El valor catastral total no se ha podido leer');
    // El defecto.
    expect(await descripcionTarjeta(page, 'Valor de transmisión')).toMatch(/valor catastral total/i);
  });

  // HALLAZGO [06/10-b] (bajo, accesibilidad) — ✅ REPARADO el 06/10/2026 (hallazgo 2912): `.errorText`
  // pasa a #C53030 (5,24:1 sobre #FAFAFA) y #FC8181 en oscuro (7,12:1 sobre #1A1A1A). Era así: el aviso que nombra la comisión imposible
  // en el propio campo (añadido el 26/09 con el hallazgo 2198) es texto de 13,6 px en #E53E3E,
  // literal y sin variante oscura (components/NumberInput.module.css, `.errorText`): 3,95:1 sobre el
  // fondo del formulario del vendedor en claro (#FAFAFA) y 4,22:1 en oscuro (#1A1A1A), por debajo
  // del 4,5:1 del texto pequeño. Medido con axe-core y con el fondo compuesto de este fichero.
  test('[06/10-b] el aviso de la comisión imposible alcanza 4,5:1 en los dos temas', async ({ page }) => {
    await page.addStyleTag({ content: '*,*::before,*::after{transition:none!important;animation:none!important}' });
    await prepararVendedor2609(page, { comision: '150' });
    const aviso = page.getByRole('alert').filter({ hasText: 'La comisión no puede superar el 100' });
    await expect(aviso).toHaveCount(1);
    const claro = await aviso.evaluate(contrasteElemento2609);
    await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
    await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(26, 26, 26)');
    const oscuro = await aviso.evaluate(contrasteElemento2609);
    expect({ claro: claro >= 4.5, oscuro: oscuro >= 4.5 }).toEqual({ claro: true, oscuro: true });
  });

  // HALLAZGO [06/10-c] (bajo, contenido) — ✅ REPARADO el 06/10/2026 (hallazgo 2913): concuerda con
  // sujetoPlural(v.campos), en las cuatro hermanas que tenían la línea. Era así: la forma registrada hoy en la referencia, medida
  // aquí a petición del coordinador: en la rama «menor» del aviso del neto (`avisoIlegiblesNeto`,
  // page.tsx:1027) el verbo de «que no se ha podido leer» concuerda con el número de CAMPOS
  // (`v.campos.length > 1`) y no con su sujeto. Con las amortizaciones ilegibles el campo es uno y el
  // sujeto plural, y la frase queda «No descuenta el IRPF que añaden las amortizaciones deducidas, que
  // no se ha podido leer»: lo que «no se ha podido leer» pasa a ser el IRPF. La tarjeta del IRPF de la
  // misma pantalla lo dice bien («No se han podido leer las amortizaciones deducidas»).
  //   BASE del testigo + amortizaciones «2.000.50» → esperado «…las amortizaciones deducidas, que no
  //   se han podido leer» · obtenido «…, que no se ha podido leer».
  // Las otras tres formas del aviso del coordinador NO se reproducen aquí (medidas en navegador el
  // 06/10/2026): el recuadro de la comunidad toma el AJD solo de la operación VISIBLE (País Vasco
  // 0,5 % al cargar, en las tres operaciones y tras pasar por el vendedor; Valencia 1,4 % / 2 % con
  // la renuncia; Ceuta con la renuncia oculta, 0,5 %); `.transmisionSub` no lleva `opacity` y sus
  // subtítulos dan 5,22-5,50:1 en claro y 4,78-5,83:1 en oscuro; y la app no tiene el consejo
  // «Liquida los impuestos a tiempo» ni frases pegadas en el texto pintado.
  test('[06/10-c] el aviso del neto concuerda «que no se han podido leer» con las amortizaciones', async ({ page }) => {
    await prepararBaseFamilia2309(page);
    await sembrarImporte12(page, 'Amortizaciones acumuladas deducidas (€)', ILEGIBLE_2309);
    expect(await valorTarjeta(page, /^NETO QUE RECIBES/)).toBe('186.687,00 €');
    expect(await descripcionTarjeta(page, 'IRPF sobre la ganancia')).toContain(
      'No se han podido leer las amortizaciones deducidas',
    );
    // El defecto (lee y compara, sin reintento).
    expect(await avisoNeto2309(page)).toContain('las amortizaciones deducidas, que no se han podido leer');
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// RE-INSPECCIÓN 07/10/2026 — vuelve a la cola por f00a18f7 (2913) y e0979382 (NumberInput:
// el pegado con «€» y espacios, y el contraste del aviso de campo, 2912).
//
// Batería previa: los casos de arriba en verde; [06/10-a] (2911) sigue con `test.fail()` porque
// sigue ABIERTO en la base. Verificado en navegador, escritorio y 390 px:
//   · 2913 en las cuatro formas de la rama «menor» del aviso del neto (un importe de sujeto
//     singular, dos, y el de sujeto plural solo y con otro): el verbo concuerda con el sujeto.
//   · e0979382: «200.000 €», «1 250 €», «150.000,00 €», «20.000 €» con espacio duro, «40 000» con
//     espacio fino y «3 %» se leen; el menos tipográfico pasa a guion y se acota; las letras se
//     siguen rechazando.
//   · 2912: los DOS avisos de campo (comisión > 100 % y gestoría > precio) dan 5,24:1 en claro
//     (#C53030 sobre #FAFAFA) y 7,12:1 en oscuro (#FC8181 sobre #1A1A1A), con aria-invalid.
//
// De dónde sale CADA cifra de los casos nuevos (resueltos a mano ANTES de ejecutar):
//   · La Rioja: tipo general 7 % de `TIPOS_ITP_CCAA_2025` (data/fiscal/inmuebles.ts:64), sin escala,
//     umbral ni tipo propio de lo que no es vivienda en `ITP_CCAA.rioja`; AJD 1 %
//     (data/itp-ccaa.ts:830), sin tipo de la renuncia.
//   · IVA del local: `IVA_INMUEBLES_2025.local` = 21.
//   · Plusvalía: `COEFICIENTES_IIVTNU_2025` (5 años 0,18 · 19 años 0,23 · 20 o más 0,40, con el tope
//     de 20 del art. 107.4 TRLRHL en `coeficienteIIVTNU`) × 25 % orientativo; método real del 107.5.
//   · IRPF: `TRAMOS_GANANCIAS_PATRIMONIALES_2025` (19 % hasta 6.000 · 21 % hasta 50.000 · 23 % hasta
//     200.000) sobre el art. 35 LIRPF; amortizaciones del art. 35.2 LIRPF y 40.1 RIRPF.
//   · Amortización del ALQUILER: art. 14.2.a RIRPF (RD 439/2007, BOE-A-2007-6820 consolidado,
//     leído el 07/10/2026): «cuando, en cada año, no excedan del resultado de aplicar el 3 por
//     ciento sobre el mayor de los siguientes valores: el coste de adquisición satisfecho o el
//     valor catastral, sin incluir en el cómputo el del suelo».
//   · Notaría y registro NO se fijan (hallazgos 2901 y 2902, abiertos en la referencia): se exige
//     que el total cuadre con las líneas visibles (`totalCuadra0610`).
// ═════════════════════════════════════════════════════════════════════════════

/** Pega un importe tal como viene de un anuncio y espera a que React tenga el valor ya limpio. */
async function pegarImporte0710(page: Page, etiqueta: string, pegado: string, leido: string): Promise<void> {
  const campo = page.locator(`input[aria-label="${etiqueta}"]`);
  await campo.fill(pegado);
  await esperarValorEnReact(page, campo, leido);
  await campo.blur();
}

/** El FAQPage del JSON-LD, pregunta → respuesta. */
async function faqPage0710(page: Page): Promise<Map<string, string>> {
  const pares = await page.evaluate(() =>
    Array.from(document.querySelectorAll('script[type="application/ld+json"]'))
      .map((s) => JSON.parse(s.textContent ?? '{}'))
      .filter((j) => j['@type'] === 'FAQPage')
      .flatMap((j) =>
        (j.mainEntity as { name: string; acceptedAnswer: { text: string } }[]).map(
          (q) => [q.name, q.acceptedAnswer.text] as [string, string],
        ),
      ),
  );
  return new Map(pares.map(([q, a]) => [q, a.replace(ESPACIO_DURO, ' ')]));
}

/** Respuesta de la FAQ VISIBLE (la sección educativa está en el DOM aunque nazca plegada). */
async function faqVisible0710(page: Page, pregunta: string): Promise<string> {
  const p = page.locator('strong', { hasText: pregunta }).first().locator('xpath=following-sibling::p[1]');
  return ((await p.textContent()) ?? '').replace(ESPACIO_DURO, ' ').replace(/\s+/g, ' ').trim();
}

test.describe('RE-INSPECCIÓN 07/10/2026 — La Rioja, el euro 50.001 de la base del ahorro, comisión y gestoría juntas, y la amortización del alquiler', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, TESTIGOS_12_09);
  });

  // ══════════════════════════════════════════════════════════════════════════
  // REPARADO 2913 (f00a18f7) — las otras ramas de «que no se ha/han podido leer», sobre la BASE del
  // testigo (neto 182.487,00). Netos resueltos a mano con cada ilegible a 0:
  //   comisión «3.5.0»            → transm 198.300 · gan 53.300 · IRPF 11.139 · neto 187.161,00
  //   + gestoría «5.0.0»          → transm 198.800 · gan 53.800 · IRPF 1.140 + 9.240 + 3.800 × 23 %
  //                                 = 11.254 · neto 200.000 − 1.200 − 11.254 = 187.546,00
  //   gestoría + amortizaciones   → transm 192.800 · adq 165.000 · gan 27.800 · IRPF 1.140 + 21.800 ×
  //                                 21 % = 5718 · neto 200.000 − 1.200 − 6.000 − 5.718 = 187.082,00
  // El tope de la rebaja es el tipo marginal de la base que se publica: 23 % con 53.300/53.800,
  // 21 % con 27.800.
  // ══════════════════════════════════════════════════════════════════════════
  test('REPARADO 2913 — el verbo concuerda con el sujeto con uno y con dos importes, también junto a las amortizaciones', async ({ page }) => {
    await prepararBaseFamilia2309(page);
    expect(await valorTarjeta(page, /^NETO QUE RECIBES/)).toBe('182.487,00 €');

    await sembrarImporte12(page, 'Comisión de la inmobiliaria (%)', '3.5.0');
    expect(await valorTarjeta(page, /^NETO QUE RECIBES/)).toBe('187.161,00 €');
    expect(await avisoNeto2309(page)).toContain(
      'No descuenta la comisión inmobiliaria, que no se ha podido leer (la comisión inmobiliaria rebaja también el IRPF al descontarla, hasta un 23 % de su importe): el neto real es menor que este',
    );

    await sembrarImporte12(page, 'Gestoría y certificados del vendedor (€)', '5.0.0');
    expect(await valorTarjeta(page, /^NETO QUE RECIBES/)).toBe('187.546,00 €');
    expect(await avisoNeto2309(page)).toContain(
      'No descuenta la comisión inmobiliaria ni la gestoría de la venta, que no se han podido leer (la comisión inmobiliaria y la gestoría de la venta rebajan también el IRPF al descontarlas, hasta un 23 % de su importe): el neto real es menor que este',
    );

    await sembrarImporte12(page, 'Comisión de la inmobiliaria (%)', '3');
    await sembrarImporte12(page, 'Amortizaciones acumuladas deducidas (€)', ILEGIBLE_2309);
    expect(await valorTarjeta(page, /^NETO QUE RECIBES/)).toBe('187.082,00 €');
    expect(await avisoNeto2309(page)).toContain(
      'No descuenta la gestoría de la venta ni el IRPF que añaden las amortizaciones deducidas, que no se han podido leer (la gestoría de la venta rebaja también el IRPF al descontarla, hasta un 21 % de su importe): el neto real es menor que este',
    );
  });

  // REPARADO e0979382 (hallazgo 2916 de la hermana solar, en el NumberInput común): un importe PEGADO
  // con «€», espacios o «%» se descartaba entero y la app seguía con el cálculo anterior. Aquí, en
  // los campos del vendedor, incluido el exclusivo (amortizaciones). Con lo pegado se tiene que
  // llegar a la BASE del testigo: adquisición 145.000 · transmisión 192.300 · IRPF 9813 · neto 182.487.
  test('REPARADO e0979382 — un importe pegado con «€», espacios o «%» se lee, también en las amortizaciones', async ({ page }) => {
    await pegarImporte0710(page, 'Precio del local comercial', '200.000 €', '200.000');
    expect(await valorTarjeta(page, 'Precio del local comercial')).toBe('200.000,00 €');
    await pegarImporte0710(page, 'Gastos de gestoría del comprador (€)', '1 250 €', '1250');
    expect(await valorTarjeta(page, 'Gastos de gestoría')).toBe('1250,00 €');

    await page.getByRole('button', { name: 'Vendedor', exact: true }).click();
    await page.getByRole('button', { name: /Local afecto a actividad/ }).click();
    await pegarImporte0710(page, 'Precio de compra original', '150.000,00 €', '150.000,00');
    await pegarImporte0710(page, 'Impuestos y gastos que pagaste al comprarlo (€)', '15 000', '15000');
    await pegarImporte0710(page, 'Amortizaciones acumuladas deducidas (€)', '20.000 €', '20.000');
    await sembrarImporte12(page, 'Años de propiedad', '10');
    await pegarImporte0710(page, 'Valor catastral del suelo (€)', '40 000', '40000');
    await pegarImporte0710(page, 'Valor catastral total (suelo + construcción) (€)', '100.000 €', '100.000');
    await pegarImporte0710(page, 'Comisión de la inmobiliaria (%)', '3 %', '3');
    await pegarImporte0710(page, 'Gestoría y certificados del vendedor (€)', '500 €', '500');

    expect(await valorTarjeta(page, 'Valor de adquisición')).toBe('145.000,00 €');
    expect(await valorTarjeta(page, 'Valor de transmisión')).toBe('192.300,00 €');
    expect(await valorTarjeta(page, 'IRPF sobre la ganancia')).toBe('9813,00 €');
    expect(await valorTarjeta(page, /^NETO QUE RECIBES/)).toBe('182.487,00 €');
    expect(await tituloTarjeta24(page, /^NETO QUE RECIBES/)).toBe('NETO QUE RECIBES');

    // El menos tipográfico pasa a guion y, con el foco dentro, se acota a 0 (adquisición sin restar).
    const amort = page.locator('input[aria-label="Amortizaciones acumuladas deducidas (€)"]');
    await amort.fill('−5000');
    await esperarValorEnReact(page, amort, '-5000');
    expect(await valorTarjeta(page, 'Valor de adquisición')).toBe('165.000,00 €');
  });

  // REPARADO 2912 (e0979382): el test [06/10-b] mide el aviso de la comisión; este, el de la
  // gestoría de la venta mayor que el precio, que usa el mismo `.errorText`.
  test('REPARADO 2912 — el aviso de la gestoría mayor que el precio alcanza 4,5:1 en los dos temas', async ({ page }) => {
    await page.addStyleTag({ content: '*,*::before,*::after{transition:none!important;animation:none!important}' });
    await prepararVendedor2609(page, { gestoria: '250000' });
    const aviso = page.getByRole('alert').filter({ hasText: 'La gestoría de la venta no puede superar el precio de venta' });
    await expect(aviso).toHaveCount(1);
    await expect(page.locator('input[aria-label="Gestoría y certificados del vendedor (€)"]')).toHaveAttribute('aria-invalid', 'true');
    const claro = await aviso.evaluate(contrasteElemento2609);
    await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
    await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(26, 26, 26)');
    const oscuro = await aviso.evaluate(contrasteElemento2609);
    expect({ claro: claro >= 4.5, oscuro: oscuro >= 4.5 }).toEqual({ claro: true, oscuro: true });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // CASO 39 (NORMAL) — LA RIOJA, local de 260.000 €, la única comunidad que ninguna vuelta había
  // liquidado, y un vendedor AFECTO a su actividad durante 19 años.
  //   2ª mano: ITP 260.000 × 7 % = 18.200,00 → «ITP (7,00 %)», sin AJD.
  //   Obra nueva: IVA 21 % = 54.600,00 + AJD 1 % = 2600,00. Renuncia: el mismo IVA y el AJD general.
  //   VENDEDOR afecto: compra 120.000 · gastos 9.000 · amortizaciones 36.000 · 19 años · suelo 50.000
  //     · total 150.000 · comisión 4 % · gestoría 600
  //     plusvalía objetivo = 50.000 × 0,23 × 25 % = 2875,00 ; real = 140.000 × ⅓ × 25 % = 11.666,67
  //     transmisión = 260.000 − 10.400 − 600 − 2.875 =                              246.125,00
  //     adquisición = 120.000 + 9.000 − 36.000 =                                      93.000,00
  //     ganancia 153.125 → IRPF = 1.140 + 9.240 + 103.125 × 23 % =                   34.098,75
  //     total = 2.875 + 10.400 + 600 + 34.098,75 = 47.973,75 (18,45 %) · NETO         212.026,25
  // ══════════════════════════════════════════════════════════════════════════
  test('CASO 39 (normal) — La Rioja 260.000 €: ITP plano al 7 %, IVA + AJD 1 % por las dos vías, y un vendedor afecto 19 años', async ({ page }) => {
    expect(ITP_CCAA.rioja.tipoGeneral).toBe(7);
    expect(ITP_CCAA.rioja.tramosProgresivos).toBeUndefined();
    expect(ITP_CCAA.rioja.umbralTipoUnico).toBeUndefined();
    expect(ITP_CCAA.rioja.tipoGeneralNoVivienda).toBeUndefined();
    expect(ITP_CCAA.rioja.ajd).toBe(1);
    expect(ITP_CCAA.rioja.ajdRenuncia).toBeUndefined();
    expect(COEFICIENTES_IIVTNU_2025.find((c) => c.anios === 19)?.coeficiente).toBe(0.23);
    expect(PLUSVALIA_MUNICIPAL_META.tipoOrientativo).toBe(25);

    await page.selectOption('#select-ccaa', 'rioja');
    await sembrarImporte12(page, 'Precio del local comercial', '260000');
    await esperarTarjeta2609(page, /^ITP/, '18.200,00 €');
    expect(await tituloTarjeta24(page, /^ITP/)).toBe('ITP (7,00 %)');
    await expect(page.locator('h3', { hasText: /^AJD/ })).toHaveCount(0);
    await totalCuadra0610(page, 260000, [/^ITP/, 'Gastos de notaría', 'Registro de la Propiedad', 'Gastos de gestoría']);
    const recuadro = (await page.locator('[class*="infoCcaaGrid"]').innerText()).replace(ESPACIO_DURO, ' ').replace(/\s+/g, ' ');
    expect(recuadro).toBe('ITP General 7 % AJD 1 % IVA (comercial) 21 %');

    await page.getByRole('button', { name: /Obra nueva/ }).click();
    await esperarTarjeta2609(page, /^IVA \(21/, '54.600,00 €');
    expect(await tituloTarjeta24(page, /^AJD/)).toBe('AJD (1,00 %)');
    expect(await valorTarjeta(page, /^AJD/)).toBe('2600,00 €');
    await totalCuadra0610(page, 260000, [/^IVA/, /^AJD/, 'Gastos de notaría', 'Registro de la Propiedad', 'Gastos de gestoría']);

    await page.getByRole('button', { name: /2ª mano con renuncia/ }).click();
    await esperarTarjeta2609(page, /^IVA \(renuncia/, '54.600,00 €');
    expect(await valorTarjeta(page, /^AJD/)).toBe('2600,00 €');
    expect(await descripcionTarjeta(page, /^AJD/)).toBe(
      'AJD general de La Rioja: algunas comunidades aplican un tipo incrementado en la renuncia',
    );

    await page.getByRole('button', { name: /Segunda mano/ }).first().click();
    await page.getByRole('button', { name: 'Vendedor', exact: true }).click();
    await page.getByRole('button', { name: /Local afecto a actividad/ }).click();
    await sembrarImporte12(page, 'Precio de compra original', '120000');
    await sembrarImporte12(page, 'Impuestos y gastos que pagaste al comprarlo (€)', '9000');
    await sembrarImporte12(page, 'Amortizaciones acumuladas deducidas (€)', '36000');
    await sembrarImporte12(page, 'Años de propiedad', '19');
    await sembrarImporte12(page, 'Valor catastral del suelo (€)', '50000');
    await sembrarImporte12(page, 'Valor catastral total (suelo + construcción) (€)', '150000');
    await sembrarImporte12(page, 'Comisión de la inmobiliaria (%)', '4');
    await sembrarImporte12(page, 'Gestoría y certificados del vendedor (€)', '600');

    expect(await valorTarjeta(page, 'Plusvalía municipal (IIVTNU)')).toBe('2875,00 €');
    expect(await descripcionTarjeta(page, 'Plusvalía municipal (IIVTNU)')).toBe(
      'Método objetivo (más favorable), tipo municipal orientativo del 25 %',
    );
    expect(await valorTarjeta(page, 'Valor de adquisición')).toBe('93.000,00 €');
    expect(await descripcionTarjeta(page, 'Valor de adquisición')).toBe(
      'Precio de compra + impuestos y gastos de aquella compra − 36.000,00 € de amortizaciones deducidas',
    );
    expect(await valorTarjeta(page, 'Valor de transmisión')).toBe('246.125,00 €');
    expect(await valorTarjeta(page, 'Ganancia patrimonial')).toBe('153.125,00 €');
    expect(await valorTarjeta(page, 'IRPF sobre la ganancia')).toBe('34.098,75 €');
    expect(await valorTarjeta(page, 'Comisión de la inmobiliaria')).toBe('10.400,00 €');
    expect(await valorTarjeta(page, 'Total gastos de la venta')).toBe('47.973,75 €');
    expect(await descripcionTarjeta(page, 'Total gastos de la venta')).toBe('18,45 % sobre el precio de venta');
    expect(await valorTarjeta(page, /^NETO QUE RECIBES/)).toBe('212.026,25 €');
    expect(await tituloTarjeta24(page, /^NETO QUE RECIBES/)).toBe('NETO QUE RECIBES');
  });

  // ══════════════════════════════════════════════════════════════════════════
  // CASO 40 (LÍMITE) — la ganancia en el corte de 50.000 € de la base del ahorro, movida con el
  // campo EXCLUSIVO en el perfil «no afecto» (el alquiler), y el tope de 20 años del IIVTNU.
  //   Madrid · 200.000 · compra 140.000 · gastos 10.000 · 35 años · suelo 10.000 · total 100.000 ·
  //   comisión 0 · gestoría vacía
  //   plusvalía objetivo = 10.000 × 0,40 (35 años → tope de 20) × 25 % = 1000,00 ; real = 60.000 ×
  //     0,1 × 25 % = 1.500 → gana el objetivo · transmisión = 200.000 − 1.000 = 199.000,00
  //   amortizaciones 1.000 → adquisición 149.000 → ganancia 50.000,00 → IRPF 1.140 + 44.000 × 21 % =
  //     10.380,00 · total 11.380,00 (5,69 %) · neto 188.620,00
  //   amortizaciones 1.001 → ganancia 50.001,00 → el euro 50.001 al 23 %: IRPF 10.380,23 ·
  //     total 11.380,23 · neto 188.619,77
  //   20 años da lo mismo (0,40) y 19 años, 10.000 × 0,23 × 25 % = 575,00.
  // ══════════════════════════════════════════════════════════════════════════
  test('CASO 40 (límite) — ganancia de 50.000,00 € exactos y el euro siguiente al 23 %, con las amortizaciones del alquiler y el tope de 20 años', async ({ page }) => {
    expect(TRAMOS_GANANCIAS_PATRIMONIALES_2025.slice(0, 3)).toEqual([
      { hasta: 6000, tipo: 19 },
      { hasta: 50000, tipo: 21 },
      { hasta: 200000, tipo: 23 },
    ]);
    expect(COEFICIENTES_IIVTNU_2025.find((c) => c.anios === 20)?.coeficiente).toBe(0.4);

    await sembrarImporte12(page, 'Precio del local comercial', '200000');
    await page.getByRole('button', { name: 'Vendedor', exact: true }).click();
    await expect(page.getByRole('button', { name: /Local no afecto/ })).toHaveAttribute('aria-pressed', 'true');
    await sembrarImporte12(page, 'Precio de compra original', '140000');
    await sembrarImporte12(page, 'Impuestos y gastos que pagaste al comprarlo (€)', '10000');
    await sembrarImporte12(page, 'Amortizaciones acumuladas deducidas (€)', '1000');
    await sembrarImporte12(page, 'Años de propiedad', '35');
    await sembrarImporte12(page, 'Valor catastral del suelo (€)', '10000');
    await sembrarImporte12(page, 'Valor catastral total (suelo + construcción) (€)', '100000');
    await sembrarImporte12(page, 'Comisión de la inmobiliaria (%)', '0');

    expect(await valorTarjeta(page, 'Plusvalía municipal (IIVTNU)')).toBe('1000,00 €');
    expect(await valorTarjeta(page, 'Valor de transmisión')).toBe('199.000,00 €');
    expect(await valorTarjeta(page, 'Valor de adquisición')).toBe('149.000,00 €');
    expect(await valorTarjeta(page, 'Ganancia patrimonial')).toBe('50.000,00 €');
    expect(await valorTarjeta(page, 'IRPF sobre la ganancia')).toBe('10.380,00 €');
    expect(await valorTarjeta(page, 'Comisión de la inmobiliaria')).toBe('0,00 €');
    expect(await valorTarjeta(page, 'Total gastos de la venta')).toBe('11.380,00 €');
    expect(await descripcionTarjeta(page, 'Total gastos de la venta')).toBe('5,69 % sobre el precio de venta');
    expect(await valorTarjeta(page, /^NETO QUE RECIBES/)).toBe('188.620,00 €');
    expect(await tituloTarjeta24(page, /^NETO QUE RECIBES/)).toBe('NETO QUE RECIBES');

    await sembrarImporte12(page, 'Amortizaciones acumuladas deducidas (€)', '1001');
    expect(await valorTarjeta(page, 'Ganancia patrimonial')).toBe('50.001,00 €');
    expect(await valorTarjeta(page, 'IRPF sobre la ganancia')).toBe('10.380,23 €');
    expect(await valorTarjeta(page, 'Total gastos de la venta')).toBe('11.380,23 €');
    expect(await valorTarjeta(page, /^NETO QUE RECIBES/)).toBe('188.619,77 €');

    await sembrarImporte12(page, 'Años de propiedad', '20');
    expect(await valorTarjeta(page, 'Plusvalía municipal (IIVTNU)')).toBe('1000,00 €');
    await sembrarImporte12(page, 'Años de propiedad', '19');
    expect(await valorTarjeta(page, 'Plusvalía municipal (IIVTNU)')).toBe('575,00 €');
  });

  // ══════════════════════════════════════════════════════════════════════════
  // CASO 41 (RECHAZO) — la comisión y la gestoría de la venta, cada una POSIBLE, juntas por encima
  // del precio (la rama `sumaImposible` del 2198, que ningún caso ejercitaba).
  //   Madrid · 150.000 · compra 100.000 · gastos 8.000 · 5 años · suelo 20.000 · total 80.000
  //   comisión 60 % = 90.000 · gestoría 100.000 → 190.000 > 150.000: no se liquidan ganancia ni IRPF
  //   plusvalía objetivo = 20.000 × 0,18 × 25 % = 900,00 (real 3.125) ; total sin IRPF = 190.900,00
  //   (127,27 %) · neto −40.900,00 «(PARCIAL)», que no vale. Ningún campo es imposible por sí solo,
  //   así que ninguno lleva aviso propio.
  //   Con la gestoría en 50.000: transmisión 150.000 − 90.000 − 50.000 − 900 = 9100,00 · adquisición
  //   108.000 · pérdida 98.900,00 · SIN CUOTA · neto 9100,00, definitivo.
  // ══════════════════════════════════════════════════════════════════════════
  test('CASO 41 (rechazo) — comisión y gestoría de la venta posibles por separado, juntas por encima del precio', async ({ page }) => {
    expect(COEFICIENTES_IIVTNU_2025.find((c) => c.anios === 5)?.coeficiente).toBe(0.18);
    await prepararVendedor2609(page, {
      precio: '150000', compra: '100000', gastos: '8000', anios: '5', suelo: '20000', total: '80000',
      comision: '60', gestoria: '100000',
    });

    expect(await valorTarjeta(page, 'Plusvalía municipal (IIVTNU)')).toBe('900,00 €');
    expect(await valorTarjeta(page, 'Comisión de la inmobiliaria')).toBe('90.000,00 €');
    expect(await valorTarjeta(page, 'Total gastos de la venta')).toBe('190.900,00 €');
    expect((await valorTarjeta(page, /^NETO QUE RECIBES/)).replace('−', '-')).toBe('-40.900,00 €');
    await expect(page.locator('h3', { hasText: 'Pérdida patrimonial' })).toHaveCount(0);
    await expect(page.locator('h3', { hasText: 'Ganancia patrimonial' })).toHaveCount(0);
    expect(await valorTarjeta(page, 'IRPF sobre la ganancia')).toBe('Sin calcular');
    expect(await descripcionTarjeta(page, 'IRPF sobre la ganancia')).toBe(
      'Sin calcular: la comisión y la gestoría de la venta, juntas, no pueden superar el precio de venta, y con ese dato el valor de transmisión saldría negativo. Corrige la comisión o la gestoría de la venta. Este impuesto NO está incluido en el neto de abajo.',
    );
    expect(await descripcionTarjeta(page, 'Valor de transmisión')).toContain(
      'La comisión y la gestoría de la venta, juntas, no pueden superar el precio de venta: con ese dato saldría negativo',
    );
    expect(await tituloTarjeta24(page, 'Total gastos de la venta')).toBe('Total gastos de la venta (parcial)');
    expect(await tituloTarjeta24(page, /^NETO QUE RECIBES/)).toBe('NETO QUE RECIBES (PARCIAL)');
    expect(await descripcionTarjeta(page, /^NETO QUE RECIBES/)).toBe(
      'La comisión y la gestoría de la venta, juntas, no pueden superar el precio de venta, así que no se calculan la ganancia ni el IRPF, y este neto no vale. Corrige la comisión o la gestoría de la venta para obtenerlo.',
    );
    await expect(page.getByRole('alert').filter({ hasText: /no puede superar/ })).toHaveCount(0);

    await sembrarImporte12(page, 'Gestoría y certificados del vendedor (€)', '50000');
    expect(await valorTarjeta(page, 'Valor de transmisión')).toBe('9100,00 €');
    expect(await valorTarjeta(page, 'Valor de adquisición')).toBe('108.000,00 €');
    expect(await valorTarjeta(page, 'Pérdida patrimonial')).toBe('98.900,00 €');
    expect(await valorTarjeta(page, 'IRPF sobre la ganancia')).toBe('SIN CUOTA');
    expect(await valorTarjeta(page, /^NETO QUE RECIBES/)).toBe('9100,00 €');
    expect(await tituloTarjeta24(page, /^NETO QUE RECIBES/)).toBe('NETO QUE RECIBES');
  });

  // ─── HALLAZGOS del 07/10/2026: [07/10-a] ABIERTO; [07/10-b] y [07/10-c] REPARADOS ─────────
  // Se escribieron con `test.fail()`, afirmando lo que DEBERÍA ocurrir. Las aserciones previas a la
  // del defecto son cifras que la reparación no debe mover; la del defecto lee y compara, sin
  // reintento. [07/10-b] y [07/10-c] (2967 y 2968) se repararon el 07/10 (e8c8d2ca) y la
  // re-inspección del 08/10/2026 los verificó en navegador: ya van sin la marca.

  // HALLAZGO [07/10-a] (medio, cálculo) — ❌ ABIERTO. La SOSPECHA de la inversa del 1261, con caso:
  // la regla «amortizaciones mayores que todo el coste de adquisición = no puede ser» rechaza la
  // amortización legítima de un local ALQUILADO cuyo valor catastral de la construcción supera el
  // coste. El art. 14.2.a RIRPF admite cada año el 3 % del MAYOR entre el coste y el valor catastral
  // sin el suelo, y ni él ni el art. 40 RIRPF ponen tope acumulado: la frase de la app («se amortiza
  // solo la construcción», que es parte del coste) es falsa cuando la base es el valor catastral.
  // La app tiene el dato en su propio formulario (total − suelo).
  //   Madrid · 200.000 · no afecto · compra 40.000 · gastos 4.000 (coste 44.000) · 25 años · suelo
  //   40.000 · total 120.000 (construcción 80.000) · comisión 3 % · gestoría 500 · amortizaciones
  //   48.000 = 3 % × 80.000 × 20 años de alquiler (≤ 25 × 2.400 = 60.000)
  //   plusvalía objetivo 40.000 × 0,40 × 25 % = 4000,00 (real 13.333,33) · transmisión 189.500,00
  //   esperado: no se declara imposible y el IRPF se liquida (con el motor, que acota el valor de
  //   adquisición en 0, saldrían 42.465,00 €; con la minoración literal del art. 35.2 LIRPF, −4.000 de
  //   adquisición y 43.385,00 €: el tratamiento del exceso lo decide la reparación)
  //   obtenido: «IRPF Sin calcular: … superan todo el coste de adquisición (44.000,00 €), y eso no
  //   puede ser porque solo se amortiza la construcción. Revisa el dato» y el neto «(PARCIAL)».
  test('[07/10-a] la amortización del alquiler sobre el valor catastral de la construcción no se declara imposible aunque supere el coste', async ({ page }) => {
    test.fail();
    await prepararVendedor2609(page, {
      compra: '40000', gastos: '4000', anios: '25', suelo: '40000', total: '120000',
    });
    await sembrarImporte12(page, 'Amortizaciones acumuladas deducidas (€)', '48000');
    expect(await valorTarjeta(page, 'Plusvalía municipal (IIVTNU)')).toBe('4000,00 €');
    expect(await valorTarjeta(page, 'Valor de transmisión')).toBe('189.500,00 €');
    // El defecto (lee y compara, sin reintento).
    expect(await descripcionTarjeta(page, 'IRPF sobre la ganancia')).not.toContain('no puede ser');
    expect(await valorTarjeta(page, 'IRPF sobre la ganancia')).not.toBe('Sin calcular');
  });

  // HALLAZGO [07/10-b] (medio, dato) — ✅ REPARADO el 07/10/2026 (RESPUESTA_IMPUESTO_COMPRA, e8c8d2ca),
  // verificado el 08/10/2026. Efecto familia del 714 (trastero) y el 670 (garaje). Era así: la
  // respuesta a «qué impuesto se paga al comprar», en el FAQPage y en la FAQ visible, decía «se paga
  // IVA al 21 % más AJD» sin excepción territorial, y el FAQPage metía a Ceuta y Melilla en esa misma
  // frase («en Ceuta y Melilla se paga la mitad»). La propia app responde allí «En Ciudad Autónoma de
  // Ceuta no rige el IVA: la compra de obra nueva tributa por el IPSI». «IGIC» e «IPSI» no aparecían en
  // todo metadata.ts; nave, solar, garaje, trastero y terreno sí lo decían en su FAQPage.
  // El `toBe` de la tarjeta del IPSI fijaba el texto SIN artículo; cambió con la reparación del
  // hallazgo [08/10-f] (3065, 08/10/2026): «En la Ciudad Autónoma de Ceuta».
  test('[07/10-b] el FAQPage y la FAQ visible dicen que en Canarias, Ceuta y Melilla no rige el IVA', async ({ page }) => {
    await page.selectOption('#select-ccaa', 'ceuta');
    await sembrarImporte12(page, 'Precio del local comercial', '200000');
    await page.getByRole('button', { name: /Obra nueva/ }).click();
    await esperarTarjeta2609(page, /^IPSI/, 'No calculado');
    expect(await descripcionTarjeta(page, /^IPSI/)).toBe(
      'En la Ciudad Autónoma de Ceuta no rige el IVA: la compra de obra nueva tributa por el IPSI, que este simulador no calcula',
    );
    const faq = await faqPage0710(page);
    const jsonLd = faq.get('¿Qué impuesto se paga al comprar un local comercial?') ?? '';
    expect(jsonLd).toContain('se paga IVA al 21 % más AJD');
    const visible = await faqVisible0710(page, '¿Se paga IVA o ITP al comprar un local comercial?');
    expect(visible).toContain('se paga IVA al 21 % más AJD');
    // El defecto.
    expect({ jsonLd: /IGIC/.test(jsonLd) && /IPSI/.test(jsonLd), visible: /IGIC/.test(visible) && /IPSI/.test(visible) }).toEqual({
      jsonLd: true,
      visible: true,
    });
  });

  // HALLAZGO [07/10-c] (bajo, contenido) — ✅ REPARADO el 07/10/2026 (una constante, dos bocas),
  // verificado el 08/10/2026. Era así: la misma pregunta tenía dos respuestas escritas aparte, «¿Se
  // paga IVA o ITP al comprar un local comercial?» (visible) y «¿Qué impuesto se paga al comprar un
  // local comercial?» (FAQPage). La del FAQPage daba los rangos del AJD y del ITP y la bonificación de
  // Ceuta y Melilla; la visible, la excepción de la renuncia. La reparación fue UNA constante en
  // metadata.ts (RESPUESTA_IMPUESTO_COMPRA) que importan las dos bocas. La pareja de la RENUNCIA sigue
  // escrita dos veces: es el hallazgo [08/10-d].
  test('[07/10-c] la pregunta del impuesto de la compra tiene UNA respuesta en las dos bocas', async ({ page }) => {
    const faq = await faqPage0710(page);
    const jsonLd = faq.get('¿Qué impuesto se paga al comprar un local comercial?') ?? '';
    const visible = await faqVisible0710(page, '¿Se paga IVA o ITP al comprar un local comercial?');
    expect(jsonLd.length).toBeGreaterThan(0);
    expect(visible.length).toBeGreaterThan(0);
    // El defecto.
    expect(visible).toBe(jsonLd);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// RE-INSPECCIÓN 07/10/2026 a 390 px — los casos 39 (vendedor) y 41 en viewport de móvil. Las
// cifras son las de arriba; lo que se mide aquí es que el formulario del vendedor se puede usar
// y publica lo mismo sin desbordar la pantalla.
// ═════════════════════════════════════════════════════════════════════════════
test.describe('RE-INSPECCIÓN 07/10/2026 — 390 px', () => {
  test.use({
    viewport: { width: 390, height: 844 },
    userAgent:
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  });

  test.beforeEach(async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, TESTIGOS_12_09);
  });

  test('CASO 39 a 390 px — el vendedor afecto de La Rioja publica las mismas cifras y la página no desborda', async ({ page }) => {
    await page.selectOption('#select-ccaa', 'rioja');
    await sembrarImporte12(page, 'Precio del local comercial', '260000');
    await esperarTarjeta2609(page, /^ITP/, '18.200,00 €');
    await page.getByRole('button', { name: 'Vendedor', exact: true }).click();
    await page.getByRole('button', { name: /Local afecto a actividad/ }).click();
    await sembrarImporte12(page, 'Precio de compra original', '120000');
    await sembrarImporte12(page, 'Impuestos y gastos que pagaste al comprarlo (€)', '9000');
    await sembrarImporte12(page, 'Amortizaciones acumuladas deducidas (€)', '36000');
    await sembrarImporte12(page, 'Años de propiedad', '19');
    await sembrarImporte12(page, 'Valor catastral del suelo (€)', '50000');
    await sembrarImporte12(page, 'Valor catastral total (suelo + construcción) (€)', '150000');
    await sembrarImporte12(page, 'Comisión de la inmobiliaria (%)', '4');
    await sembrarImporte12(page, 'Gestoría y certificados del vendedor (€)', '600');
    expect(await valorTarjeta(page, 'IRPF sobre la ganancia')).toBe('34.098,75 €');
    expect(await valorTarjeta(page, /^NETO QUE RECIBES/)).toBe('212.026,25 €');
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  });

  test('CASO 41 a 390 px — comisión y gestoría juntas por encima del precio: el neto no vale y lo dice', async ({ page }) => {
    await prepararVendedor2609(page, {
      precio: '150000', compra: '100000', gastos: '8000', anios: '5', suelo: '20000', total: '80000',
      comision: '60', gestoria: '100000',
    });
    expect(await valorTarjeta(page, 'IRPF sobre la ganancia')).toBe('Sin calcular');
    expect(await tituloTarjeta24(page, /^NETO QUE RECIBES/)).toBe('NETO QUE RECIBES (PARCIAL)');
    expect((await valorTarjeta(page, /^NETO QUE RECIBES/)).replace('−', '-')).toBe('-40.900,00 €');
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// INSPECTOR 08/10/2026 — re-inspección tras e8c8d2ca (2967 y 2968) y 99e1ee7e (relacionadas
// pintadas por el layout), con la familia «Compraventa inmobiliaria» entera en la misma tanda.
//
// Batería previa en verde; [06/10-a] (2911) y [07/10-a] (2966) siguen con `test.fail()` porque
// siguen ABIERTOS en la base. [07/10-b] y [07/10-c] ya van sin la marca y pasan (verificado).
//
// De dónde sale CADA cifra de los casos nuevos (resueltos a mano ANTES de ejecutar la app):
//   · Aragón: escala del art. 121-1 (8 % hasta 400.000 · 8,5 % hasta 450.000 · 9 % hasta 500.000 ·
//     9,5 % hasta 750.000 · 10 % el resto), `ITP_CCAA.aragon.tramosProgresivos`; AJD 1,5 %
//     (`ITP_CCAA.aragon.ajd`), sin tipo propio de la renuncia.
//   · IVA del local: `IVA_INMUEBLES_2025.local` = 21.
//   · Plusvalía: `COEFICIENTES_IIVTNU_2025` (3 años 0,14 · 10 años 0,12) × 25 % orientativo
//     (`PLUSVALIA_MUNICIPAL_META.tipoOrientativo`); método real del art. 107.5 TRLRHL.
//   · IRPF: `TRAMOS_GANANCIAS_PATRIMONIALES_2025` (19 % hasta 6.000 · 21 % hasta 50.000 · 23 % hasta
//     200.000) sobre el art. 35 LIRPF; amortizaciones del alquiler, art. 35.2 LIRPF.
//   · CEUTA Y MELILLA, en el BOE consolidado leído el 08/10/2026:
//       - art. 68.4 LIRPF (BOE-A-2006-20764): «se considerarán rentas obtenidas en Ceuta o Melilla
//         […] d) Las ganancias patrimoniales que procedan de bienes inmuebles radicados en Ceuta o
//         Melilla», y tanto los residentes (1.º a) como los no residentes (2.º, que solo excluye las
//         letras a, e e i) «se deducirán el 60 por ciento de la parte de la suma de las cuotas
//         íntegras estatal y autonómica que proporcionalmente corresponda» a esas rentas.
//       - art. 159.2 TRLRHL (BOE-A-2004-4214): «Las cuotas tributarias correspondientes a los
//         impuestos municipales regulados en esta ley serán objeto de una bonificación del 50 por
//         ciento.» El IIVTNU es uno de ellos (arts. 104-110).
//   · IRPF foral: Ley 12/2002 del Concierto Económico (BOE-A-2002-9969), art. 6.Uno: «El Impuesto
//     sobre la Renta de las Personas Físicas es un tributo concertado de normativa autónoma. Su
//     exacción corresponderá a la Diputación Foral competente […] cuando el contribuyente tenga su
//     residencia habitual en el País Vasco»; Ley 28/1990 del Convenio con Navarra (BOE-A-1990-31117),
//     art. 9.1: «Corresponde a la Comunidad Foral la exacción del Impuesto sobre la Renta de las
//     Personas Físicas de los sujetos pasivos que tengan su residencia habitual en Navarra».
//   · Notaría y registro NO se fijan (hallazgos 2901 y 2902, abiertos en la referencia): se exige
//     que el total cuadre con las líneas visibles (`totalCuadra0610`).
// ═════════════════════════════════════════════════════════════════════════════

/** Abre la app y espera a que React escuche, recogiendo los errores de la consola. */
async function abrir0810(page: Page): Promise<string[]> {
  const errores: string[] = [];
  page.on('console', (m) => {
    if (m.type() === 'error') errores.push(m.text());
  });
  page.on('pageerror', (e) => errores.push(e.message));
  await page.goto(RUTA);
  await esperarHidratacion(page, TESTIGOS_12_09);
  return errores;
}

/** El texto del recuadro que sustituye al desglose cuando no hay precio que calcular. */
async function avisoSinDesglose0810(page: Page): Promise<string> {
  const p = page.locator('div[class*="placeholder"] > p').first();
  return ((await p.innerText()) ?? '').replace(ESPACIO_DURO, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * El vendedor de la base del testigo SIN amortizaciones, en la comunidad que se pida:
 *   200.000 · compra 150.000 · gastos 15.000 · 10 años · suelo 40.000 · total 100.000 · comisión 3 % ·
 *   gestoría 500 · perfil «Local no afecto».
 *   plusvalía objetivo = 40.000 × 0,12 × 25 % = 1200,00 (real 50.000 × 0,4 × 25 % = 5.000)
 *   transmisión 200.000 − 6.000 − 500 − 1.200 = 192.300 · adquisición 165.000 · ganancia 27.300
 *   IRPF = 1.140 + 21.300 × 21 % = 5613,00 · neto 200.000 − 13.313 = 186.687,00
 */
async function vendedorSinAmortizar0810(page: Page, ccaa: string): Promise<void> {
  await page.selectOption('#select-ccaa', ccaa);
  await sembrarImporte12(page, 'Precio del local comercial', '200000');
  await page.getByRole('button', { name: 'Vendedor', exact: true }).click();
  await sembrarImporte12(page, 'Precio de compra original', '150000');
  await sembrarImporte12(page, 'Impuestos y gastos que pagaste al comprarlo (€)', '15000');
  await sembrarImporte12(page, 'Años de propiedad', '10');
  await sembrarImporte12(page, 'Valor catastral del suelo (€)', '40000');
  await sembrarImporte12(page, 'Valor catastral total (suelo + construcción) (€)', '100000');
  await sembrarImporte12(page, 'Comisión de la inmobiliaria (%)', '3');
  await sembrarImporte12(page, 'Gestoría y certificados del vendedor (€)', '500');
}

const PREGUNTA_RENUNCIA_FAQPAGE_0810 = '¿Qué es la renuncia a la exención de IVA en la compra de un local?';
const PREGUNTA_RENUNCIA_VISIBLE_0810 = '¿Qué es la renuncia a la exención de IVA y a quién le interesa?';

test.describe('Inspector 08/10/2026 — Aragón en cuatro tramos, el vendedor de Ceuta, el precio en cero y las dos bocas de la renuncia', () => {
  // ══════════════════════════════════════════════════════════════════════════
  // REPARADO 99e1ee7e — «Apps relacionadas» la pinta ahora el layout (<ConRelacionadas slug>) y la
  // página monta <RelatedApps /> sin prop. Las cuatro tarjetas de data/app-relations.ts (nave,
  // solar, rústico y la referencia) tienen que estar en el HTML SERVIDO, seguir tras hidratar y no
  // dejar errores de hidratación en la consola.
  // ══════════════════════════════════════════════════════════════════════════
  test('REPARADO 99e1ee7e — las cuatro relacionadas en el HTML servido y tras hidratar, sin error de hidratación', async ({ page, request }) => {
    const html = await (await request.get(RUTA)).text();
    expect(html.match(/aria-label="Ir a [^"]+"/g)).toEqual([
      'aria-label="Ir a Gastos Nave Industrial"',
      'aria-label="Ir a Gastos Solar"',
      'aria-label="Ir a Gastos Finca Rústica"',
      'aria-label="Ir a Gastos Compraventa Vivienda"',
    ]);
    const errores = await abrir0810(page);
    const tarjetas = page.locator('section[aria-label="Aplicaciones relacionadas"] a');
    await expect(tarjetas).toHaveCount(4);
    await expect(tarjetas.first()).toHaveAttribute(
      'href',
      '/simulador-gastos-compraventa-nave-industrial/#from=related-simulador-gastos-compraventa-local-comercial',
    );
    expect(errores.filter((e) => /hydrat|did not match|server rendered|Minified React error #(418|419|422|423|425)/i.test(e))).toEqual([]);
  });

  // ══════════════════════════════════════════════════════════════════════════
  // CASO 42 (NORMAL) — ARAGÓN, local de 620.000 €: la escala del art. 121-1 recorrida en CUATRO
  // tramos (el CASO 17 solo pisaba el primero), y un vendedor que lo tuvo ALQUILADO tres años.
  //   2ª mano: 400.000 × 8 % + 50.000 × 8,5 % + 50.000 × 9 % + 120.000 × 9,5 %
  //          = 32.000 + 4.250 + 4.500 + 11.400 = 52.150,00 → «ITP (8,41 %)» (52.150 / 620.000)
  //   Obra nueva: IVA 21 % = 130.200,00 + AJD 1,5 % = 9300,00. Renuncia: el mismo IVA y el AJD
  //   general («AJD general de Aragón»), porque Aragón no tiene tipo propio de la renuncia.
  //   VENDEDOR «Local no afecto»: compra 450.000 · gastos 36.000 · amortizaciones del alquiler 27.000
  //     · 3 años · suelo 120.000 · total 400.000 · comisión 3 % · gestoría 1.000
  //     plusvalía objetivo = 120.000 × 0,14 × 25 % = 4200,00 ; real = 170.000 × 0,3 × 25 % = 12.750
  //     transmisión = 620.000 − 18.600 − 1.000 − 4.200 =                         596.200,00
  //     adquisición = 450.000 + 36.000 − 27.000 =                                 459.000,00
  //     ganancia 137.200 → IRPF = 1.140 + 9.240 + 87.200 × 23 % =                  30.436,00
  //     total = 4.200 + 18.600 + 1.000 + 30.436 = 54.236,00 (8,75 %) · NETO       565.764,00
  // ══════════════════════════════════════════════════════════════════════════
  test('CASO 42 (normal) — Aragón 620.000 €: cuatro tramos de la escala, IVA + AJD 1,5 %, y un vendedor que lo tuvo alquilado', async ({ page }) => {
    expect(ITP_CCAA.aragon.tramosProgresivos).toEqual([
      { hasta: 400000, tipo: 8 },
      { hasta: 450000, tipo: 8.5 },
      { hasta: 500000, tipo: 9 },
      { hasta: 750000, tipo: 9.5 },
      { hasta: Infinity, tipo: 10 },
    ]);
    expect(ITP_CCAA.aragon.ajd).toBe(1.5);
    expect(ITP_CCAA.aragon.ajdRenuncia).toBeUndefined();
    expect(IVA_INMUEBLES_2025.local).toBe(21);
    expect(COEFICIENTES_IIVTNU_2025.find((c) => c.anios === 3)?.coeficiente).toBe(0.14);

    await abrir0810(page);
    await page.selectOption('#select-ccaa', 'aragon');
    await sembrarImporte12(page, 'Precio del local comercial', '620000');
    await esperarTarjeta2609(page, /^ITP/, '52.150,00 €');
    expect(await tituloTarjeta24(page, /^ITP/)).toBe('ITP (8,41 %)');
    await expect(page.locator('h3', { hasText: /^AJD/ })).toHaveCount(0);
    await totalCuadra0610(page, 620000, [/^ITP/, 'Gastos de notaría', 'Registro de la Propiedad', 'Gastos de gestoría']);
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toBe('8,75 % sobre el precio de compra');

    await page.getByRole('button', { name: /Obra nueva/ }).click();
    await esperarTarjeta2609(page, /^IVA \(21/, '130.200,00 €');
    expect(await tituloTarjeta24(page, /^AJD/)).toBe('AJD (1,50 %)');
    expect(await valorTarjeta(page, /^AJD/)).toBe('9300,00 €');
    await totalCuadra0610(page, 620000, [/^IVA/, /^AJD/, 'Gastos de notaría', 'Registro de la Propiedad', 'Gastos de gestoría']);

    await page.getByRole('button', { name: /2ª mano con renuncia/ }).click();
    await esperarTarjeta2609(page, /^IVA \(renuncia/, '130.200,00 €');
    expect(await valorTarjeta(page, /^AJD/)).toBe('9300,00 €');
    expect(await descripcionTarjeta(page, /^AJD/)).toBe(
      'AJD general de Aragón: algunas comunidades aplican un tipo incrementado en la renuncia',
    );

    await page.getByRole('button', { name: /Segunda mano/ }).first().click();
    await page.getByRole('button', { name: 'Vendedor', exact: true }).click();
    await expect(page.getByRole('button', { name: /Local no afecto/ })).toHaveAttribute('aria-pressed', 'true');
    await sembrarImporte12(page, 'Precio de compra original', '450000');
    await sembrarImporte12(page, 'Impuestos y gastos que pagaste al comprarlo (€)', '36000');
    await sembrarImporte12(page, 'Amortizaciones acumuladas deducidas (€)', '27000');
    await sembrarImporte12(page, 'Años de propiedad', '3');
    await sembrarImporte12(page, 'Valor catastral del suelo (€)', '120000');
    await sembrarImporte12(page, 'Valor catastral total (suelo + construcción) (€)', '400000');
    await sembrarImporte12(page, 'Comisión de la inmobiliaria (%)', '3');
    await sembrarImporte12(page, 'Gestoría y certificados del vendedor (€)', '1000');

    expect(await valorTarjeta(page, 'Plusvalía municipal (IIVTNU)')).toBe('4200,00 €');
    expect(await descripcionTarjeta(page, 'Plusvalía municipal (IIVTNU)')).toBe(
      'Método objetivo (más favorable), tipo municipal orientativo del 25 %',
    );
    expect(await valorTarjeta(page, 'Valor de adquisición')).toBe('459.000,00 €');
    expect(await descripcionTarjeta(page, 'Valor de adquisición')).toBe(
      'Precio de compra + impuestos y gastos de aquella compra − 27.000,00 € de amortizaciones deducidas',
    );
    expect(await valorTarjeta(page, 'Valor de transmisión')).toBe('596.200,00 €');
    expect(await valorTarjeta(page, 'Ganancia patrimonial')).toBe('137.200,00 €');
    expect(await valorTarjeta(page, 'IRPF sobre la ganancia')).toBe('30.436,00 €');
    expect(await valorTarjeta(page, 'Comisión de la inmobiliaria')).toBe('18.600,00 €');
    expect(await valorTarjeta(page, 'Total gastos de la venta')).toBe('54.236,00 €');
    expect(await descripcionTarjeta(page, 'Total gastos de la venta')).toBe('8,75 % sobre el precio de venta');
    expect(await valorTarjeta(page, /^NETO QUE RECIBES/)).toBe('565.764,00 €');
    expect(await tituloTarjeta24(page, /^NETO QUE RECIBES/)).toBe('NETO QUE RECIBES');
  });

  // ══════════════════════════════════════════════════════════════════════════
  // CASO 43 (LÍMITE territorial) — CEUTA, el vendedor. Lo que la app hace bien y no depende del
  // territorio: el valor de adquisición, la comisión y la ganancia sobre la plusvalía que publica.
  // Las dos rebajas de Ceuta y Melilla que NO aplica van abajo como [08/10-a] y [08/10-b].
  // ══════════════════════════════════════════════════════════════════════════
  test('CASO 43 (límite) — Ceuta, vendedor: las partidas que no dependen del territorio', async ({ page }) => {
    await abrir0810(page);
    await vendedorSinAmortizar0810(page, 'ceuta');
    expect(await valorTarjeta(page, 'Valor de adquisición')).toBe('165.000,00 €');
    expect(await valorTarjeta(page, 'Comisión de la inmobiliaria')).toBe('6000,00 €');
    // La ganancia es la transmisión menos la adquisición con la plusvalía que se PUBLICA.
    const plusvalia = centimos0610(await valorTarjeta(page, 'Plusvalía municipal (IIVTNU)'));
    expect(centimos0610(await valorTarjeta(page, 'Valor de transmisión'))).toBe(20000000 - 600000 - 50000 - plusvalia);
    expect(centimos0610(await valorTarjeta(page, 'Ganancia patrimonial'))).toBe(20000000 - 600000 - 50000 - plusvalia - 16500000);
  });

  // ══════════════════════════════════════════════════════════════════════════
  // CASO 44 (RECHAZO) — un precio que no vale no publica desglose: «0», «-5000» con el foco dentro,
  // «0,004» (se pinta 0,00 €, hallazgo 1601) e ilegible. Lo que dice el recuadro con el 0 escrito
  // es el hallazgo [08/10-c].
  // ══════════════════════════════════════════════════════════════════════════
  test('CASO 44 (rechazo) — precio 0, negativo con el foco o 0,004: ningún desglose en los dos paneles', async ({ page }) => {
    await abrir0810(page);
    await sembrarImporte12(page, 'Precio del local comercial', '0');
    await expect(page.locator('h3', { hasText: /^COSTE TOTAL/ })).toHaveCount(0);
    await expect(page.locator('h3', { hasText: /^ITP/ })).toHaveCount(0);
    await page.getByRole('button', { name: 'Vendedor', exact: true }).click();
    await expect(page.locator('h3', { hasText: /^NETO QUE RECIBES/ })).toHaveCount(0);
    await page.getByRole('button', { name: 'Comprador', exact: true }).click();

    await sembrarImporte12(page, 'Precio del local comercial', '-5000', { blur: false });
    await expect(page.locator('h3', { hasText: /^COSTE TOTAL/ })).toHaveCount(0);
    await page.locator('input[aria-label="Precio del local comercial"]').blur();
    // El min = 0 del NumberInput lo deja en 0 al salir: sigue sin desglose.
    await expect(page.locator('input[aria-label="Precio del local comercial"]')).toHaveValue('0');
    await expect(page.locator('h3', { hasText: /^COSTE TOTAL/ })).toHaveCount(0);

    await sembrarImporte12(page, 'Precio del local comercial', '0,004');
    await expect(page.locator('h3', { hasText: /^COSTE TOTAL/ })).toHaveCount(0);

    await sembrarImporte12(page, 'Precio del local comercial', ILEGIBLE_2309);
    expect(await avisoSinDesglose0810(page)).toBe(
      'No se ha podido leer el precio «2.000.50». Introduce el precio del local comercial con coma decimal (200.000 o 200000,50) para ver el desglose de gastos',
    );
  });

  // REPARADO 2967 (la parte de la RENUNCIA): las dos respuestas sobre la renuncia llevan la salvedad
  // de Ceuta y Melilla, donde la app deshabilita el botón (hallazgo 1584).
  test('REPARADO 2967 — las dos respuestas de la renuncia dicen que no existe en Ceuta y Melilla, como el botón', async ({ page }) => {
    await abrir0810(page);
    const faq = await faqPage0710(page);
    expect(faq.get(PREGUNTA_RENUNCIA_FAQPAGE_0810)).toContain('La renuncia no existe en Ceuta y Melilla');
    expect(await faqVisible0710(page, PREGUNTA_RENUNCIA_VISIBLE_0810)).toContain('No existe en Ceuta y Melilla');
    await page.selectOption('#select-ccaa', 'melilla');
    await expect(page.getByRole('button', { name: /2ª mano con renuncia/ })).toBeDisabled();
  });

  // ─── HALLAZGOS del 08/10/2026, ABIERTOS ──────────────────────────────────────────────
  // Con `test.fail()`, afirmando lo que DEBERÍA ocurrir. Las aserciones previas a la del defecto son
  // cifras o textos que la reparación no debe mover; la del defecto lee y compara, sin reintento.

  // HALLAZGO [08/10-a] (alto, cálculo) — ❌ ABIERTO. El IRPF de la ganancia de un local SITUADO en
  // Ceuta o Melilla se liquida entero: la app no aplica la deducción del 60 % del art. 68.4 LIRPF,
  // que alcanza a esa ganancia («d) Las ganancias patrimoniales que procedan de bienes inmuebles
  // radicados en Ceuta o Melilla») resida donde resida el vendedor en territorio común (1.º a y 2.º,
  // que solo excluye las letras a, e e i). La app sabe dónde está el local —es su selector— y en
  // Ceuta publica las mismas cifras que en Madrid.
  //   Ceuta · base sin amortizaciones → cuota íntegra 5.613 (sobre la ganancia de 27.300 que publica)
  //   − 60 % = 2245,20 ; o 2295,60 si antes se repara [08/10-b] (plusvalía 600, ganancia 27.900,
  //   cuota 1.140 + 21.900 × 21 % = 5.739, × 40 %). Obtenido: 5613,00 € como definitivo.
  test('[08/10-a] Ceuta: el IRPF de la ganancia de un local situado allí lleva la deducción del 60 % (art. 68.4 LIRPF)', async ({ page }) => {
    test.fail();
    await abrir0810(page);
    await vendedorSinAmortizar0810(page, 'ceuta');
    expect(await valorTarjeta(page, 'Valor de adquisición')).toBe('165.000,00 €');
    // El defecto (lee y compara, sin reintento).
    expect(['2245,20 €', '2295,60 €']).toContain(await valorTarjeta(page, 'IRPF sobre la ganancia'));
  });

  // HALLAZGO [08/10-b] (medio, cálculo) — ❌ ABIERTO. La plusvalía municipal de un local en Ceuta o
  // Melilla se liquida sin la bonificación del 50 % del art. 159.2 TRLRHL («Las cuotas tributarias
  // correspondientes a los impuestos municipales regulados en esta ley serán objeto de una
  // bonificación del 50 por ciento»). `calcularPlusvaliaMunicipal` no recibe la comunidad.
  //   Ceuta · base sin amortizaciones → objetivo 40.000 × 0,12 × 25 % = 1.200 (el real, 5.000, es
  //   mayor) → con la bonificación 600,00 · obtenido 1200,00 €, igual que en Madrid.
  test('[08/10-b] Ceuta: la plusvalía municipal lleva la bonificación del 50 % de la cuota (art. 159.2 TRLRHL)', async ({ page }) => {
    test.fail();
    expect(COEFICIENTES_IIVTNU_2025.find((c) => c.anios === 10)?.coeficiente).toBe(0.12);
    await abrir0810(page);
    await vendedorSinAmortizar0810(page, 'ceuta');
    expect(await valorTarjeta(page, 'Comisión de la inmobiliaria')).toBe('6000,00 €');
    // El defecto.
    expect(await valorTarjeta(page, 'Plusvalía municipal (IIVTNU)')).toBe('600,00 €');
  });

  // HALLAZGO [08/10-c] (bajo, contenido) — ✅ REPARADO el 08/10/2026 (3062). Patrón 5 en el PRECIO principal, el 2960 de
  // la referencia: con «0» escrito (o «-5000» con el foco dentro, que el blur deja en 0) los dos
  // paneles piden que se introduzca el precio, como si el campo estuviera vacío. Solar, nave y
  // terreno ya lo distinguen («El precio escrito («0») tiene que ser mayor que 0: corrígelo…»).
  //   obtenido: «Introduce el precio del local comercial para ver el desglose de gastos» (comprador) y
  //   «Introduce el precio de venta del local para ver lo que te queda tras impuestos» (vendedor).
  test('[08/10-c] un precio escrito como 0 se nombra como no válido, no como que falta', async ({ page }) => {
    await abrir0810(page);
    await sembrarImporte12(page, 'Precio del local comercial', '0');
    await expect(page.locator('input[aria-label="Precio del local comercial"]')).toHaveValue('0');
    await expect(page.locator('h3', { hasText: /^COSTE TOTAL/ })).toHaveCount(0);
    const comprador = await avisoSinDesglose0810(page);
    await page.getByRole('button', { name: 'Vendedor', exact: true }).click();
    const vendedor = await avisoSinDesglose0810(page);
    // El defecto.
    expect({ comprador: /mayor que 0/.test(comprador), vendedor: /mayor que 0/.test(vendedor) }).toEqual({
      comprador: true,
      vendedor: true,
    });
  });

  // HALLAZGO [08/10-d] (bajo, contenido) — ❌ ABIERTO. La forma del 2968 en la otra pareja: «¿Qué es la
  // renuncia a la exención de IVA y a quién le interesa?» (visible) y «¿Qué es la renuncia a la
  // exención de IVA en la compra de un local?» (FAQPage) son la misma pregunta con dos respuestas
  // escritas aparte; e8c8d2ca tuvo que añadir la misma salvedad de Ceuta y Melilla DOS veces. La
  // reparación es UNA constante en metadata.ts que importen las dos bocas.
  test('[08/10-d] la pregunta de qué es la renuncia tiene UNA respuesta en las dos bocas', async ({ page }) => {
    test.fail();
    await abrir0810(page);
    const jsonLd = (await faqPage0710(page)).get(PREGUNTA_RENUNCIA_FAQPAGE_0810) ?? '';
    const visible = await faqVisible0710(page, PREGUNTA_RENUNCIA_VISIBLE_0810);
    expect(jsonLd.length).toBeGreaterThan(0);
    expect(visible.length).toBeGreaterThan(0);
    // El defecto.
    expect(visible).toBe(jsonLd);
  });

  // HALLAZGO [08/10-e] (bajo, dato) — ❌ ABIERTO. Las dos respuestas sobre la renuncia dicen que la
  // operación pasa a «IVA al 21 %» y solo exceptúan Ceuta y Melilla; en Canarias la renuncia existe
  // pero es a la exención del IGIC, y la propia app lo dice en el botón («2ª mano con renuncia IGIC»),
  // en el aviso y en la tarjeta («IGIC · No calculado»). RESPUESTA_IMPUESTO_COMPRA dice además que el
  // simulador no calcula allí «el impuesto de la obra nueva», cuando tampoco calcula el IGIC de la
  // renuncia. nave-industrial y terreno-rustico ya lo dicen en su FAQPage («En Canarias la renuncia
  // existe igual, sobre la exención del IGIC»).
  test('[08/10-e] las respuestas de la renuncia dicen que en Canarias es a la exención del IGIC', async ({ page }) => {
    test.fail();
    await abrir0810(page);
    await page.selectOption('#select-ccaa', 'canarias');
    await sembrarImporte12(page, 'Precio del local comercial', '200000');
    await page.getByRole('button', { name: /2ª mano con renuncia/ }).click();
    await esperarTarjeta2609(page, /^IGIC$/, 'No calculado');
    expect(await descripcionTarjeta(page, /^IGIC$/)).toBe(
      'En Canarias no rige el IVA: la renuncia a la exención tributa por el IGIC, que este simulador no calcula',
    );
    const jsonLd = (await faqPage0710(page)).get(PREGUNTA_RENUNCIA_FAQPAGE_0810) ?? '';
    const visible = await faqVisible0710(page, PREGUNTA_RENUNCIA_VISIBLE_0810);
    expect(jsonLd).toContain('IVA al 21 %');
    // El defecto.
    expect({ jsonLd: /Canarias[^.]*IGIC/.test(jsonLd), visible: /Canarias[^.]*IGIC/.test(visible) }).toEqual({
      jsonLd: true,
      visible: true,
    });
  });

  // HALLAZGO [08/10-f] (bajo, contenido) — ✅ REPARADO el 08/10/2026 (3065, `nombreEnFrase` y `deNombreCcaa`). El nombre de la comunidad de `ITP_CCAA.nombre`
  // se interpola sin artículo: «en Ciudad Autónoma de Ceuta no rige el IVA», «En Ciudad Autónoma de
  // Ceuta no se aplica el IVA… la administración tributaria de Ciudad Autónoma de Ceuta»
  // (AvisoTerritorioSinIva, común), «AJD general de Comunidad de Madrid», «En Comunidad Valenciana
  // es del 2 %», «Comunidad Foral de Navarra», «Región de Murcia». Es la sospecha del 06/10 (c),
  // medida aquí: sale en pantalla.
  test('[08/10-f] el nombre de la comunidad lleva su artículo en las frases que lo interpolan', async ({ page }) => {
    const sinArticulo = /(?:^|[\s(])(?:[Ee]n|de) (?:Ciudad Autónoma|Comunidad|Región) /;
    await abrir0810(page);
    await page.selectOption('#select-ccaa', 'ceuta');
    await sembrarImporte12(page, 'Precio del local comercial', '200000');
    await page.getByRole('button', { name: /Obra nueva/ }).click();
    await esperarTarjeta2609(page, /^IPSI/, 'No calculado');
    const ipsi = await descripcionTarjeta(page, /^IPSI/);
    await page.selectOption('#select-ccaa', 'madrid');
    await page.getByRole('button', { name: /2ª mano con renuncia/ }).click();
    await esperarTarjeta2609(page, /^AJD/, '1500,00 €');
    const ajdMadrid = await descripcionTarjeta(page, /^AJD/);
    // El defecto.
    expect({ ipsi: sinArticulo.test(ipsi), ajdMadrid: sinArticulo.test(ajdMadrid) }).toEqual({
      ipsi: false,
      ajdMadrid: false,
    });
    expect(ipsi).toContain('En la Ciudad Autónoma de Ceuta no rige el IVA');
    expect(ajdMadrid).toContain('AJD general de la Comunidad de Madrid');
  });

  // HALLAZGO [08/10-g] (medio, dato) — ❌ ABIERTO. El IRPF de la ganancia se liquida con la escala del
  // ahorro de territorio común (arts. 66 y 76 LIRPF) y la página no dice en ningún sitio que con
  // residencia en el País Vasco o en Navarra el IRPF es foral (Concierto, art. 6.Uno; Convenio, art.
  // 9.1). El sello del IRPF afirma lo contrario: «Toda ganancia patrimonial por transmisión tributa
  // con esta escala». La residencia del vendedor no es la ubicación del local, así que el caso va en
  // Madrid, donde hoy la palabra «foral» no sale en toda la página (tampoco en lo plegado).
  test('[08/10-g] la página avisa de que con residencia en el País Vasco o Navarra el IRPF de la ganancia es foral', async ({ page }) => {
    test.fail();
    await abrir0810(page);
    await vendedorSinAmortizar0810(page, 'madrid');
    expect(await valorTarjeta(page, 'IRPF sobre la ganancia')).toBe('5613,00 €');
    expect(await descripcionTarjeta(page, 'IRPF sobre la ganancia')).toBe(
      'Base del ahorro (19–30 %). Un local no tiene exención por reinversión ni por edad.',
    );
    // El defecto.
    // Todo el texto de la página, también lo plegado del bloque educativo, sin los scripts (el JSON-LD).
    const texto = await page.evaluate(() => {
      const copia = document.body.cloneNode(true) as HTMLElement;
      copia.querySelectorAll('script, style, noscript').forEach((n) => n.remove());
      return copia.textContent ?? '';
    });
    expect(/foral/i.test(texto)).toBe(true);
  });
});
