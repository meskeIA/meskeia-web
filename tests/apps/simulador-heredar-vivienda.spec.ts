/**
 * Inspector — simulador-heredar-vivienda (segmento FISCAL, riesgo 1 CRÍTICO)
 * Tanda del 24/08/2026.
 *
 * De dónde sale CADA cifra esperada (ninguna de memoria: todas de `data/fiscal/`):
 *
 *  ISD — `data/fiscal/sucesiones.ts` (FISCAL_SUCESIONES_META: Ley 29/1987 + normativas
 *  autonómicas 2025, verificado 2025-01-01):
 *    - `REDUCCIONES_PARENTESCO_IS['I-conyuge']` = 15.956,87 € · `['IV']` = 0 €
 *    - `REDUCCION_VIVIENDA_PORC_IS` = 0,95 · `REDUCCION_VIVIENDA_MAX_IS` = 122.606,47 €
 *    - `TARIFA_ESTATAL_IS` = 7 tramos marginales
 *      (7,65 % hasta 7.993,46 · 8,50 % hasta 31.956,87 · 9,35 % hasta 79.881,18 ·
 *       10,20 % hasta 239.389,13 · 15,30 % hasta 398.777,54 · 21,25 % hasta 797.555,08 ·
 *       25,50 % en adelante)
 *    - Coeficiente multiplicador: `COEFICIENTES_IS['II'][0]` = 1,0000 ·
 *      `COEFICIENTES_IS['IV'][0]` = 2,0000 (⚠️ la app los reescribe a mano en su
 *      `coeficientesGrupo`; hoy coinciden, y esta prueba fija esa coincidencia)
 *    - `BONIFICACIONES_CCAA_IS['madrid'].bonificaciones['I-conyuge'].porcentaje` = 0,99
 *    - `BONIFICACIONES_CCAA_IS['asturias'].bonificaciones['IV'].porcentaje` = 0
 *
 *  Plusvalía municipal (IIVTNU) — `data/fiscal/inmuebles.ts` (PLUSVALIA_MUNICIPAL_META:
 *  RDL 26/2021, verificado 2025-01-15):
 *    - `COEFICIENTES_IIVTNU_2025`: 20 años o más → 0,45 · 0 años → 0,14
 *    - Tipo municipal: ⚠️ la app HARDCODEA 0,30 (`TIPO_MUNICIPAL_PLUSVALIA`) y lo rotula
 *      «orientativo», cuando el módulo declara `tipoOrientativo: 25` y reserva el 30 %
 *      para `tipoMaximoLegal`. La prueba fija el 30 % que la app aplica HOY para que la
 *      corrección de ese hallazgo no pase inadvertida (el test fallará y habrá que
 *      recalcular con 0,25).
 *
 *  IRPF de la ganancia al vender — `TRAMOS_GANANCIAS_PATRIMONIALES_2025` en
 *  `data/fiscal/inmuebles.ts`: 19 % hasta 6.000 · 21 % hasta 50.000 · 23 % hasta 200.000 ·
 *  27 % hasta 300.000 · 30 % en adelante.
 *
 * Los tres casos están resueltos a mano ANTES de ejecutar la app; el desarrollo va
 * comentado junto a cada aserción, con los importes sin redondear.
 */
import { test, expect, Page } from '@playwright/test';

const RUTA = '/simulador-heredar-vivienda/';

/**
 * Mueve un `input[type=range]` controlado por React. `fill()` no dispara el onChange
 * de React en un range, así que se usa el setter nativo + evento `input` burbujeante.
 */
async function mover(page: Page, id: string, valor: number): Promise<void> {
  await page.evaluate(
    ([id, valor]) => {
      const el = document.getElementById(id as string) as HTMLInputElement;
      const setter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        'value'
      )!.set!;
      setter.call(el, String(valor));
      el.dispatchEvent(new Event('input', { bubbles: true }));
    },
    [id, valor] as [string, number]
  );
}

/** Texto completo de uno de los tres paneles de resultado, con espacios normalizados. */
async function panel(page: Page, titulo: string): Promise<string> {
  const contenedor = page.locator('h3', { hasText: titulo }).first().locator('xpath=..');
  return (await contenedor.innerText()).replace(/\s+/g, ' ').trim();
}

/** Valor (el `<strong>`) de una línea concreta dentro de un panel. */
async function linea(page: Page, titulo: string, etiqueta: string): Promise<string> {
  const contenedor = page.locator('h3', { hasText: titulo }).first().locator('xpath=..');
  const fila = contenedor
    .locator('div', { has: page.locator(`span:text-is("${etiqueta}")`) })
    .last();
  return (await fila.locator('strong').innerText()).replace(/\s+/g, ' ').trim();
}

/** Texto del bloque «Coste fiscal total acumulado». */
async function bloqueTotal(page: Page): Promise<string> {
  const bloque = page
    .locator('h2', { hasText: 'Coste fiscal total acumulado' })
    .locator('xpath=..');
  return (await bloque.innerText()).replace(/\s+/g, ' ').trim();
}

test.describe('Simulador de heredar vivienda — inspección 24/08/2026', () => {
  /**
   * CASO 1 (NORMAL) — el estado por defecto de la app, que es además su primer caso
   * preconfigurado: «Hijo hereda piso 200k en Madrid», vivienda habitual del padre,
   * comprado en 1995 por 80.000 €, valor catastral del suelo 60.000 € sobre un catastral
   * total de 120.000 €, y venta a los 5 años por 250.000 €.
   *
   * ISD (Madrid, Grupo II, reducKey 'I-conyuge'):
   *   Base imponible = 200.000,00
   *   − Reducción parentesco = REDUCCIONES_PARENTESCO_IS['I-conyuge'] = 15.956,87
   *   − Reducción vivienda habitual = min(200.000 × 0,95 ; 122.606,47) = 122.606,47
   *     (REDUCCION_VIVIENDA_PORC_IS × base, topado en REDUCCION_VIVIENDA_MAX_IS)
   *   = Base liquidable = 200.000 − 15.956,87 − 122.606,47 = 61.436,66
   *   Cuota íntegra por tramos marginales de TARIFA_ESTATAL_IS:
   *       7.993,46 × 7,65 %  =    611,49969
   *      23.963,41 × 8,50 %  =  2.036,88985   (31.956,87 − 7.993,46)
   *      29.479,79 × 9,35 %  =  2.756,360365  (61.436,66 − 31.956,87)
   *                             ─────────────
   *                              5.404,749905  → «5404,75 €»
   *   × Coeficiente Grupo II (COEFICIENTES_IS['II'][0] = 1,0000) = 5.404,749905
   *   − Bonificación Madrid 99 % (BONIFICACIONES_CCAA_IS['madrid']) = 5.350,702406
   *   = Cuota ISD final = 5.404,749905 × 0,01 = 54,04749905 → «54,05 €»
   *
   * Plusvalía municipal (IIVTNU):
   *   Años de tenencia = 2025 − 1995 = 30, topados en 20 → COEFICIENTES_IIVTNU_2025 = 0,45
   *   Método objetivo = 60.000 × 0,45 × 0,30 = 8.100,00
   *   Método real = (200.000 − 80.000) × (60.000 / 120.000) × 0,30 = 60.000 × 0,30 = 18.000,00
   *   Se elige el MENOR (RDL 26/2021) = 8.100,00 → objetivo
   *
   * IRPF al vender a los 5 años por 250.000 €:
   *   Valor de adquisición fiscal = 200.000 + 54,04749905 + 8.100 = 208.154,04749905
   *   Ganancia = 250.000 − 208.154,04749905 = 41.845,95250095
   *   Tramos de TRAMOS_GANANCIAS_PATRIMONIALES_2025:
   *        6.000,00       × 19 % = 1.140,00
   *       35.845,95250095 × 21 % = 7.527,6500252
   *                                ────────────
   *                                 8.667,6500252 → «8.667,65 €»
   *
   * TOTAL = 54,04749905 + 8.100 + 8.667,6500252 = 16.821,69752425 → «16.821,70 €»
   * Porcentaje sobre la venta = 16.821,69752 / 250.000 × 100 = 6,7286790 → «6,73 %»
   */
  test('CASO 1 (normal) — hijo hereda 200.000 € en Madrid, vivienda habitual, y vende a los 5 años', async ({
    page,
  }) => {
    await page.goto(RUTA);

    // El estado inicial ya es este caso; se fija explícitamente para no depender del default.
    await page.selectOption('#parentescoSel', 'conyuge_hijo');
    await page.selectOption('#ccaaSel', 'madrid');
    await mover(page, 'anioAdq', 1995);
    await mover(page, 'valorAdq', 80000);
    await mover(page, 'valorRef', 200000);
    await mover(page, 'valorSuelo', 60000);
    await mover(page, 'valorCatastralTotal', 120000);
    await mover(page, 'aniosVenta', 5);
    await mover(page, 'valorVta', 250000);
    const habitual = page.locator('input[type="checkbox"]').first();
    if (!(await habitual.isChecked())) await habitual.check();

    const isd = await panel(page, '1. ISD al heredar');
    expect(isd).toContain('Comunidad de Madrid — Grupo II');
    expect(isd).toContain('200.000,00'); // base imponible
    expect(isd).toContain('15.956,87'); // REDUCCIONES_PARENTESCO_IS['I-conyuge']
    expect(isd).toContain('122.606,47'); // REDUCCION_VIVIENDA_MAX_IS
    expect(isd).toContain('61.436,66'); // base liquidable
    expect(await linea(page, '1. ISD al heredar', 'Cuota íntegra (tarifa)')).toBe('5404,75 €');
    expect(await linea(page, '1. ISD al heredar', '= Cuota tributaria')).toBe('5404,75 €');
    expect(isd).toContain('Bonificación CCAA (99,0%)'); // BONIFICACIONES_CCAA_IS['madrid'] = 0,99
    expect(await linea(page, '1. ISD al heredar', 'Cuota ISD final')).toBe('54,05 €');

    const plusvalia = await panel(page, '2. Plusvalía municipal');
    expect(plusvalia).toContain('20 años de tenencia'); // 2025 − 1995 = 30, topado en 20
    expect(await linea(page, '2. Plusvalía municipal', 'Coeficiente 20 años')).toBe('0,45'); // COEFICIENTES_IIVTNU_2025
    expect(await linea(page, '2. Plusvalía municipal', 'Método objetivo')).toBe('8100,00 €');
    expect(await linea(page, '2. Plusvalía municipal', 'Método real (suelo)')).toBe('18.000,00 €');
    expect(await linea(page, '2. Plusvalía municipal', 'Método elegido')).toBe('Objetivo (menor)');
    expect(await linea(page, '2. Plusvalía municipal', 'Cuota plusvalía municipal')).toBe(
      '8100,00 €'
    );

    const irpf = await panel(page, '3. IRPF al vender');
    expect(await linea(page, '3. IRPF al vender', 'Valor adquisición fiscal*')).toBe(
      '208.154,05 €'
    );
    expect(await linea(page, '3. IRPF al vender', 'Ganancia patrimonial')).toBe('41.845,95 €');
    expect(await linea(page, '3. IRPF al vender', 'Cuota IRPF venta')).toBe('8667,65 €');
    expect(irpf).toContain('Venta a los 5 años');

    const total = await bloqueTotal(page);
    expect(total).toContain('16.821,70'); // 54,05 + 8.100,00 + 8.667,65
    expect(total).toContain('6,73%'); // sobre 250.000 € de venta

    // Formato español: punto de millares y coma decimal, nunca el formato US.
    expect(total).toMatch(/16\.821,70/);
    expect(total).not.toMatch(/16,821\.70/);
  });

  /**
   * CASO 2 (LÍMITE) — el extremo superior de todos los ejes a la vez: heredero SIN
   * PARENTESCO (Grupo IV, el coeficiente multiplicador más alto y reducción cero),
   * el tope del deslizador de valor de referencia (2.000.000 €, que entra en el último
   * tramo de la tarifa, el del 25,50 %), Asturias (la única CCAA de régimen común SIN
   * bonificación en cuota), sin vivienda habitual y sin venta posterior.
   *
   * ISD (Asturias, Grupo IV, reducKey 'IV'):
   *   Base imponible = 2.000.000,00
   *   − Reducción parentesco = REDUCCIONES_PARENTESCO_IS['IV'] = 0
   *   − Reducción vivienda habitual = 0 (el Grupo IV queda excluido y además no está marcada)
   *   = Base liquidable = 2.000.000,00
   *   Cuota íntegra por tramos marginales de TARIFA_ESTATAL_IS:
   *          7.993,46 × 7,65 %  =        611,49969
   *         23.963,41 × 8,50 %  =      2.036,88985
   *         47.924,31 × 9,35 %  =      4.480,922985
   *        159.507,95 × 10,20 % =     16.269,81090
   *        159.388,41 × 15,30 % =     24.386,42673
   *        398.777,54 × 21,25 % =     84.740,22725
   *      1.202.444,92 × 25,50 % =    306.623,45460   (2.000.000 − 797.555,08)
   *                                 ──────────────
   *                                  439.149,232005  → «439.149,23 €»
   *   × Coeficiente Grupo IV (COEFICIENTES_IS['IV'][0] = 2,0000) = 878.298,46401 → «878.298,46 €»
   *   − Bonificación Asturias Grupo IV = 0 % → Cuota ISD final = 878.298,46 €
   *
   * Plusvalía municipal, con adquisición en 2025 (0 años de tenencia, el otro extremo):
   *   COEFICIENTES_IIVTNU_2025 para 0 años = 0,14
   *   Método objetivo = 500.000 × 0,14 × 0,30 = 21.000,00
   *   Método real = (2.000.000 − 30.000) × (500.000 / 1.000.000) × 0,30 = 985.000 × 0,30 = 295.500,00
   *   Menor = 21.000,00 → objetivo
   *
   * IRPF: años hasta la venta = 0 → no se simula venta → cuota 0,00 €
   * TOTAL = 878.298,46401 + 21.000 + 0 = 899.298,46401 → «899.298,46 €»
   */
  test('CASO 2 (límite) — Grupo IV hereda 2.000.000 € en Asturias, tramo del 25,50 % y coeficiente 2,0', async ({
    page,
  }) => {
    await page.goto(RUTA);

    await page.selectOption('#parentescoSel', 'sin_parentesco');
    await page.selectOption('#ccaaSel', 'asturias');
    await mover(page, 'anioAdq', 2025); // 0 años de tenencia → coeficiente 0,14
    await mover(page, 'valorAdq', 30000);
    await mover(page, 'valorRef', 2000000); // tope del deslizador
    await mover(page, 'valorSuelo', 500000);
    await mover(page, 'valorCatastralTotal', 1000000);
    const habitual = page.locator('input[type="checkbox"]').first();
    if (await habitual.isChecked()) await habitual.uncheck();
    await mover(page, 'aniosVenta', 0); // sin venta

    const isd = await panel(page, '1. ISD al heredar');
    expect(isd).toContain('Principado de Asturias — Grupo IV');
    expect(isd).toContain('2.000.000,00'); // base imponible = base liquidable
    expect(await linea(page, '1. ISD al heredar', '− Reducción parentesco')).toBe('−0,00 €'); // REDUCCIONES_PARENTESCO_IS['IV'] = 0
    expect(await linea(page, '1. ISD al heredar', 'Cuota íntegra (tarifa)')).toBe('439.149,23 €');
    expect(isd).toContain('×2,0000'); // COEFICIENTES_IS['IV'][0]
    expect(await linea(page, '1. ISD al heredar', '= Cuota tributaria')).toBe('878.298,46 €');
    expect(isd).toContain('Bonificación CCAA (0,0%)'); // Asturias no bonifica en cuota
    expect(await linea(page, '1. ISD al heredar', 'Cuota ISD final')).toBe('878.298,46 €');

    const plusvalia = await panel(page, '2. Plusvalía municipal');
    expect(plusvalia).toContain('0 años de tenencia');
    expect(await linea(page, '2. Plusvalía municipal', 'Coeficiente 0 años')).toBe('0,14'); // COEFICIENTES_IIVTNU_2025
    expect(await linea(page, '2. Plusvalía municipal', 'Método objetivo')).toBe('21.000,00 €');
    expect(await linea(page, '2. Plusvalía municipal', 'Método real (suelo)')).toBe('295.500,00 €');
    expect(await linea(page, '2. Plusvalía municipal', 'Cuota plusvalía municipal')).toBe(
      '21.000,00 €'
    );

    // Sin venta → el panel de IRPF explica que no hay ganancia patrimonial que declarar.
    expect(await panel(page, '3. IRPF al vender')).toContain('Sin venta simulada');

    const total = await bloqueTotal(page);
    expect(total).toContain('899.298,46'); // 878.298,46 + 21.000,00 + 0,00
  });

  /**
   * CASO 3 (RECHAZO) — el caso que la app NO debe cobrar. Tres negativos encadenados:
   *
   *   a) Base liquidable negativa: se hereda una vivienda habitual de 100.000 €, y las
   *      reducciones (15.956,87 de parentesco + 95.000 de vivienda habitual, que aquí es
   *      el 95 % del valor y no llega al tope de 122.606,47) suman 110.956,87 > 100.000.
   *      La base liquidable debe quedar en 0,00 € —nunca en −10.956,87— y con ella la
   *      cuota íntegra y la cuota final.
   *
   *   b) Plusvalía municipal NO SUJETA: el causante compró por 300.000 € y el valor de
   *      referencia de la herencia es 100.000 €. No hay incremento de valor del terreno,
   *      así que por el RDL 26/2021 (PLUSVALIA_MUNICIPAL_META.baseNormativa) el impuesto
   *      no se devenga: 0,00 €, por mucho que el método objetivo siga arrojando
   *      5.000 × 0,45 (COEFICIENTES_IIVTNU_2025, 20 años) × 0,30 = 675,00 €.
   *
   *   c) Pérdida patrimonial en IRPF: se vende por 50.000 € algo cuyo valor de adquisición
   *      fiscal es 100.000 + 0 (ISD) + 0 (plusvalía) = 100.000 €. La ganancia es
   *      50.000 − 100.000 = −50.000 €: una pérdida NO tributa, la cuota debe ser 0,00 €.
   *
   * TOTAL = 0,00 € y 0,00 % del valor de venta.
   *
   * Complemento: los importes se introducen con `input[type=range]` de mínimo positivo
   * (valorRef y valorVta, mín. 50.000 €), de modo que un importe NEGATIVO es inalcanzable
   * por construcción; la comprobación del final lo fija.
   */
  test('CASO 3 (rechazo) — reducciones mayores que la base, plusvalía no sujeta y pérdida patrimonial: todo a 0,00 €', async ({
    page,
  }) => {
    await page.goto(RUTA);

    await page.selectOption('#parentescoSel', 'conyuge_hijo');
    await page.selectOption('#ccaaSel', 'madrid');
    await mover(page, 'anioAdq', 1985); // 40 años → topado en 20 → coeficiente 0,45
    await mover(page, 'valorAdq', 300000); // compró por MÁS de lo que hoy vale
    await mover(page, 'valorRef', 100000);
    await mover(page, 'valorSuelo', 5000);
    await mover(page, 'valorCatastralTotal', 10000);
    const habitual = page.locator('input[type="checkbox"]').first();
    if (!(await habitual.isChecked())) await habitual.check();
    await mover(page, 'aniosVenta', 5);
    await mover(page, 'valorVta', 50000); // vende por debajo del valor heredado

    // a) La base liquidable se corta en cero, no en negativo.
    expect(await linea(page, '1. ISD al heredar', '− Reducción parentesco')).toBe('−15.956,87 €');
    expect(await linea(page, '1. ISD al heredar', '− Reducción vivienda habitual (95%)')).toBe(
      '−95.000,00 €'
    ); // 100.000 × REDUCCION_VIVIENDA_PORC_IS, por debajo del tope
    expect(await linea(page, '1. ISD al heredar', '= Base liquidable')).toBe('0,00 €');
    expect(await linea(page, '1. ISD al heredar', 'Cuota íntegra (tarifa)')).toBe('0,00 €');
    expect(await linea(page, '1. ISD al heredar', 'Cuota ISD final')).toBe('0,00 €');

    // b) Sin incremento de valor del terreno no hay plusvalía municipal (RDL 26/2021).
    expect(await linea(page, '2. Plusvalía municipal', 'Método objetivo')).toBe('675,00 €');
    expect(await linea(page, '2. Plusvalía municipal', 'Método real (suelo)')).toBe(
      'Exenta (sin ganancia)'
    );
    expect(await linea(page, '2. Plusvalía municipal', 'Método elegido')).toBe('Exenta');
    expect(await linea(page, '2. Plusvalía municipal', 'Cuota plusvalía municipal')).toBe(
      '0,00 €'
    );

    // c) Una pérdida patrimonial no genera cuota de IRPF.
    expect(await linea(page, '3. IRPF al vender', 'Valor adquisición fiscal*')).toBe(
      '100.000,00 €'
    );
    expect(await linea(page, '3. IRPF al vender', 'Pérdida patrimonial')).toBe('−50.000,00 €');
    expect(await linea(page, '3. IRPF al vender', 'Cuota IRPF venta')).toBe('0,00 €');

    const total = await bloqueTotal(page);
    expect(total).toContain('0,00 €');
    expect(total).toContain('0,00%');

    // Un importe negativo es inalcanzable: el deslizador lo recorta a su mínimo.
    const recortado = await page.evaluate(() => {
      const el = document.getElementById('valorRef') as HTMLInputElement;
      const setter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        'value'
      )!.set!;
      setter.call(el, '-500000');
      el.dispatchEvent(new Event('input', { bubbles: true }));
      return el.value;
    });
    expect(recortado).toBe('50000');
  });
});
