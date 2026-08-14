import { test, expect, Page } from '@playwright/test';

/**
 * Inspector — simulador-gastos-compraventa-garaje (segmento fiscal, riesgo 1 CRÍTICO)
 *
 * De dónde sale cada cifra esperada:
 *  - Tipos de ITP y AJD por CCAA, y aranceles de notaría y registro:
 *    `data/itp-ccaa.ts` (ITP_CCAA, ARANCELES_NOTARIO y ARANCELES_REGISTRO, que citan
 *    los RD 1426/1989 y RD 1427/1989). Los tipos generales coinciden con
 *    TIPOS_ITP_CCAA_2025 de `data/fiscal/inmuebles.ts`.
 *  - Tipos de IVA de garaje: IVA_INMUEBLES_2025 (`data/fiscal/inmuebles.ts`)
 *    → `garaje: 21` (independiente) y `garageCon: 10` (vinculado a vivienda).
 *  - Plusvalía municipal: COEFICIENTES_IIVTNU_2025 y PLUSVALIA_MUNICIPAL_META.tipoOrientativo
 *    (`data/fiscal/inmuebles.ts`, RDL 26/2021).
 *  - IRPF de la ganancia: TRAMOS_GANANCIAS_PATRIMONIALES_2025 (`data/fiscal/inmuebles.ts`)
 *    aplicados por calcularGananciaInmueble (`data/fiscal/ganancia-inmueble.ts`, art. 35 LIRPF).
 *
 * Todos los importes están resueltos a mano ANTES de ejecutar la app; el detalle del
 * cálculo va comentado junto a cada aserción.
 */

const RUTA = '/simulador-gastos-compraventa-garaje/';

/** Valor de una ResultCard, con el espacio duro del formato español normalizado. */
async function valorTarjeta(page: Page, titulo: string): Promise<string> {
  const valor = page
    .locator('h3', { hasText: titulo })
    .first()
    .locator('xpath=../following-sibling::div[1]/p');
  return (await valor.innerText()).replace(/\u00A0/g, ' ').trim();
}

/** Texto descriptivo bajo el valor de una ResultCard. */
async function descripcionTarjeta(page: Page, titulo: string): Promise<string> {
  const desc = page
    .locator('h3', { hasText: titulo })
    .first()
    .locator('xpath=../following-sibling::p[1]');
  return (await desc.innerText()).replace(/\u00A0/g, ' ').trim();
}

async function rellenar(page: Page, etiqueta: string, valor: string): Promise<void> {
  const campo = page.locator(`input[aria-label="${etiqueta}"]`);
  await campo.fill(valor);
  await campo.blur();
}

test.describe('Simulador de gastos de compraventa de garaje', () => {
  test('CASO 1 (normal) — Madrid, segunda mano, 25.000 €, comprador general', async ({ page }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Segunda mano/ }).click();
    await page.selectOption('#select-ccaa', 'madrid');
    await rellenar(page, 'Precio del garaje / plaza de parking', '25000');
    await rellenar(page, 'Gastos de gestoría del comprador (€)', '300');

    // ITP = 25.000 × 6 % — ITP_CCAA.madrid.tipoGeneral = 6 (= TIPOS_ITP_CCAA_2025 'Madrid')
    expect(await valorTarjeta(page, 'ITP (6,0%)')).toBe('1500,00 €');

    // Notaría (ARANCELES_NOTARIO, RD 1426/1989): 90,15 + (25.000 − 6.010,12) × 0,45 %
    //        = 175,60446 ; con el 21 % de IVA → 212,4814
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('212,48 €');

    // Registro (ARANCELES_REGISTRO, RD 1427/1989): 24,04 + (25.000 − 6.010,12) × 0,175 %
    //          = 57,27229 ; con el 21 % de IVA → 69,2995
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('69,30 €');

    // Total gastos = 1.500 + 212,4814 + 69,2995 + 300 (gestoría) = 2.081,7809
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('2081,78 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toContain('8,33%');

    // Coste total = 25.000 + 2.081,7809 (en segunda mano NO hay AJD)
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('27.081,78 €');
    await expect(page.locator('h3', { hasText: 'AJD' })).toHaveCount(0);
  });

  test('CASO 2 (límite) — Cataluña, obra nueva, garaje independiente: IVA al 21 % + AJD 1,5 %', async ({ page }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Primera mano/ }).click();
    await page.getByRole('button', { name: /Independiente/ }).click();
    await page.selectOption('#select-ccaa', 'cataluna');
    await rellenar(page, 'Precio del garaje / plaza de parking', '30000');
    await rellenar(page, 'Gastos de gestoría del comprador (€)', '300');

    // IVA = 30.000 × 21 % — IVA_INMUEBLES_2025.garaje = 21 (garaje independiente,
    // el tipo más alto que maneja la app; el vinculado a vivienda sería garageCon = 10)
    expect(await valorTarjeta(page, 'IVA (21,0%)')).toBe('6300,00 €');

    // AJD = 30.000 × 1,5 % — ITP_CCAA.cataluna.ajd = 1.5
    expect(await valorTarjeta(page, 'AJD (1,50%)')).toBe('450,00 €');

    // Notaría: 90,15 + (30.000 − 6.010,12) × 0,45 % = 198,10446 ; × 1,21 → 239,7064
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('239,71 €');
    // Registro: 24,04 + (30.000 − 6.010,12) × 0,175 % = 66,02229 ; × 1,21 → 79,887
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('79,89 €');

    // Total gastos = 6.300 + 450 + 239,7064 + 79,887 + 300 = 7.369,5934 (24,57 % del precio)
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('7369,59 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toContain('24,57%');
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('37.369,59 €');
  });

  // ⚠️ HALLAZGO ABIERTO (Inspector, 14/08/2026): sin precio introducido, la guarda
  // `if (precio <= 0) return null` no atrapa el NaN que devuelve parseSpanishNumber('')
  // —NaN <= 0 es false—, así que el placeholder nunca se muestra y la app abre con
  // «No definido» en todas las tarjetas, incluida «COSTE TOTAL DE ADQUISICIÓN», y con
  // un «No definido% sobre el precio». `test.fail` marca que hoy falla a propósito:
  // el día que se corrija, este test se pondrá en ROJO y habrá que quitar la marca.
  test('CASO 3 (debe avisar) — sin precio, la app pide el dato en vez de calcular', async ({ page }) => {
    test.fail();
    await page.goto(RUTA);

    await expect(
      page.getByText('Introduce el precio del garaje para ver el desglose de gastos del comprador'),
    ).toBeVisible();
    await expect(page.getByText('No definido')).toHaveCount(0);
  });

  test('CASO 4 (vendedor) — plusvalía municipal por el método más favorable e IRPF de la ganancia', async ({ page }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Segunda mano/ }).click();
    await rellenar(page, 'Precio del garaje / plaza de parking', '22000');
    await rellenar(page, 'Gastos de gestoría del comprador (€)', '300');
    await page.getByRole('tab', { name: 'Vendedor' }).click();
    await rellenar(page, 'Precio de compra original del garaje', '15000');
    await rellenar(page, 'Impuestos y gastos que pagaste al comprarlo (€)', '1800');
    await rellenar(page, 'Años de propiedad', '10');
    await rellenar(page, 'Valor catastral del suelo (€)', '5000');
    await rellenar(page, 'Valor catastral total (suelo + construcción) (€)', '12000');
    await rellenar(page, 'Comisión inmobiliaria del vendedor (%)', '3');

    // Plusvalía municipal (RDL 26/2021):
    //   objetivo = 5.000 × 0,08 (COEFICIENTES_IIVTNU_2025, 10 años) × 25 %
    //              (PLUSVALIA_MUNICIPAL_META.tipoOrientativo) = 100
    //   real     = (22.000 − 15.000) × (5.000 / 12.000) × 25 % = 729,17
    //   el contribuyente elige el más favorable → 100
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('100,00 €');
    expect(await descripcionTarjeta(page, 'Plusvalía municipal')).toContain('Método objetivo');

    // Art. 35 LIRPF (calcularGananciaInmueble):
    //   valor de adquisición = 15.000 + 1.800 = 16.800
    //   valor de transmisión = 22.000 − (660 comisión + 300 gestoría) − 100 plusvalía = 20.940
    //   ganancia = 4.140
    expect(await valorTarjeta(page, 'Valor de adquisición')).toBe('16.800,00 €');
    expect(await valorTarjeta(page, 'Valor de transmisión')).toBe('20.940,00 €');
    expect(await valorTarjeta(page, 'Ganancia patrimonial')).toBe('4140,00 €');

    // IRPF = 4.140 × 19 % (primer tramo de TRAMOS_GANANCIAS_PATRIMONIALES_2025, hasta 6.000)
    expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('786,60 €');

    // Total gastos vendedor = 100 + 660 + 300 + 786,60 = 1.846,60 → neto 20.153,40
    expect(await valorTarjeta(page, 'Total gastos vendedor')).toBe('1846,60 €');
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('20.153,40 €');
  });

  // ⚠️ HALLAZGO ABIERTO (Inspector, 14/08/2026): al marcar el perfil «Joven (< 35 años)»
  // la app busca el primer tipo reducido cuyo nombre contenga «joven» y lo aplica sin
  // comprobar sus `condiciones`. En Madrid —la CCAA por defecto— ese tipo es
  // «Jóvenes < 35 años (municipios pequeños)», del 0 %, condicionado a un municipio de
  // menos de 2.500 habitantes que la app nunca pregunta: un joven que compre un garaje
  // en la capital lee «ITP (0,0%) — 0,00 €». Lo anclado para él es el tipo general del
  // 6 % (ITP_CCAA.madrid.tipoGeneral = TIPOS_ITP_CCAA_2025 'Madrid') → 1.500,00 €.
  // Mismo patrón en Baleares con «joven» y con «discapacidad» (tipo 0 %).
  test('CASO 5 (tipos reducidos) — joven en Madrid: no puede salir 0 € de ITP sin preguntar el municipio', async ({ page }) => {
    test.fail();
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Segunda mano/ }).click();
    await page.selectOption('#select-ccaa', 'madrid');
    await rellenar(page, 'Precio del garaje / plaza de parking', '25000');
    await page.selectOption('#select-perfil', 'joven');

    // Esperado: «ITP (6,0%)» → 1500,00 € · Obtenido hoy: «ITP (0,0%)» → 0,00 €
    const valorITP = page
      .locator('h3', { hasText: /^ITP/ })
      .first()
      .locator('xpath=../following-sibling::div[1]/p');
    await expect(valorITP).toHaveText(/^1500,00\s€$/);
  });
});
