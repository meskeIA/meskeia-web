/**
 * Inspector — simulador-heredar-vivienda (segmento FISCAL, riesgo 1 CRÍTICO)
 * Inspección del 24/08/2026 · REPARADO el 24/08/2026 (hallazgos 199-206).
 *
 * De dónde sale CADA cifra esperada (ninguna de memoria: todas de `data/fiscal/`):
 *
 *  ISD — `data/fiscal/sucesiones.ts` (FISCAL_SUCESIONES_META: Ley 29/1987 + normativas
 *  autonómicas 2025, verificado 2025-01-01):
 *    - `REDUCCIONES_PARENTESCO_IS['II']` = 15.956,87 € · `['III']` = 7.993,46 € · `['IV']` = 0 €
 *    - `REDUCCION_VIVIENDA_PORC_IS` = 0,95 · `REDUCCION_VIVIENDA_MAX_IS` = 122.606,47 €
 *    - `TARIFA_ESTATAL_IS` = 7 tramos marginales
 *      (7,65 % hasta 7.993,46 · 8,50 % hasta 31.956,87 · 9,35 % hasta 79.881,18 ·
 *       10,20 % hasta 239.389,13 · 15,30 % hasta 398.777,54 · 21,25 % hasta 797.555,08 ·
 *       25,50 % en adelante)
 *    - `COEFICIENTES_IS['II'][0]` = 1,0000 · `['III'][0]` = 1,5882 · `['IV'][0]` = 2,0000
 *      (índice 0 = patrimonio preexistente del heredero por debajo de 402.678,11 €, que es
 *      el supuesto que simula la app; ahora los IMPORTA en vez de reescribirlos a mano)
 *    - `BONIFICACIONES_CCAA_IS['madrid'].bonificaciones['II'].porcentaje` = 0,99
 *    - `['asturias']...['II'].reduccionBase` = 300.000 € (única CCAA con el beneficio en BASE)
 *    - `['rioja']...['II']` = { porcentaje: 0,99, tope: 500.000, porcentajeMayor: 0,98 }
 *    - `['andalucia'].bonificaciones['III'].porcentaje` = 0 (no bonifica al Grupo III)
 *
 *  Plusvalía municipal (IIVTNU) — `data/fiscal/inmuebles.ts` (PLUSVALIA_MUNICIPAL_META:
 *  RDL 26/2021, verificado 2025-01-15):
 *    - `COEFICIENTES_IIVTNU_2025`: 20 años o más → 0,45 · 0 años → 0,14
 *    - Tipo municipal = `PLUSVALIA_MUNICIPAL_META.tipoOrientativo` = 25 %. La versión
 *      anterior de este spec fijaba el 30 % que la app hardcodeaba, con el aviso de que
 *      esa cifra era `tipoMaximoLegal` y de que al repararlo habría que recalcular. Esto
 *      es ese recálculo: el 30 % sobreestimaba la plusvalía un 20 % y, de rebote, el IRPF
 *      (la cuota pagada engorda el valor de adquisición fiscal) y el total.
 *
 *  IRPF de la ganancia al vender — `TRAMOS_GANANCIAS_PATRIMONIALES_2025` en
 *  `data/fiscal/inmuebles.ts`: 19 % hasta 6.000 · 21 % hasta 50.000 · 23 % hasta 200.000 ·
 *  27 % hasta 300.000 · 30 % en adelante.
 *
 * Los casos están resueltos a mano ANTES de ejecutar la app; el desarrollo va comentado
 * junto a cada aserción, con los importes sin redondear.
 */
import { test, expect, Page } from '@playwright/test';

const RUTA = '/simulador-heredar-vivienda/';

/** El año que la app usa para la tenencia del causante: el del reloj, ya no una constante. */
const ANIO = new Date().getFullYear();

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
   * ISD (Madrid, Grupo II, reducKey 'II'):
   *   Base imponible = 200.000,00
   *   − Reducción parentesco = REDUCCIONES_PARENTESCO_IS['II'] = 15.956,87
   *   − Reducción vivienda habitual = min(200.000 × 0,95 ; 122.606,47) = 122.606,47
   *   = Base liquidable = 200.000 − 15.956,87 − 122.606,47 = 61.436,66
   *   Cuota íntegra por tramos marginales de TARIFA_ESTATAL_IS:
   *       7.993,46 × 7,65 %  =    611,49969
   *      23.963,41 × 8,50 %  =  2.036,88985   (31.956,87 − 7.993,46)
   *      29.479,79 × 9,35 %  =  2.756,360365  (61.436,66 − 31.956,87)
   *                             ─────────────
   *                              5.404,749905  → «5404,75 €»
   *   × Coeficiente Grupo II (COEFICIENTES_IS['II'][0] = 1,0000) = 5.404,749905
   *   − Bonificación Madrid 99 % = 5.350,702406
   *   = Cuota ISD final = 5.404,749905 × 0,01 = 54,04749905 → «54,05 €»
   *
   * Plusvalía municipal (IIVTNU), con el tipo ORIENTATIVO del módulo (25 %):
   *   Tenencia = año actual − 1995 (≥ 20), topada en 20 → COEFICIENTES_IIVTNU_2025 = 0,45
   *   Método objetivo = 60.000 × 0,45 × 0,25 = 6.750,00
   *   Método real = (200.000 − 80.000) × (60.000 / 120.000) × 0,25 = 60.000 × 0,25 = 15.000,00
   *   Se elige el MENOR (RDL 26/2021) = 6.750,00 → objetivo
   *
   * IRPF al vender a los 5 años por 250.000 €:
   *   Valor de adquisición fiscal = 200.000 + 54,04749905 + 6.750 = 206.804,04749905
   *   Ganancia = 250.000 − 206.804,04749905 = 43.195,95250095
   *        6.000,00       × 19 % = 1.140,00
   *       37.195,95250095 × 21 % = 7.811,1500252
   *                                ────────────
   *                                 8.951,1500252 → «8951,15 €»
   *
   * TOTAL = 54,04749905 + 6.750 + 8.951,1500252 = 15.755,19752425 → «15.755,20 €»
   * Porcentaje sobre la venta = 15.755,19752 / 250.000 × 100 = 6,3020790 → «6,30 %»
   */
  test('CASO 1 (normal) — hijo hereda 200.000 € en Madrid, vivienda habitual, y vende a los 5 años', async ({
    page,
  }) => {
    await page.goto(RUTA);

    // El estado inicial ya es este caso; se fija explícitamente para no depender del default.
    await page.selectOption('#parentescoSel', 'hijo');
    await page.selectOption('#ccaaSel', 'madrid');
    await mover(page, 'anioAdq', 1995);
    await mover(page, 'valorAdq', 80000);
    await mover(page, 'valorRef', 200000);
    await mover(page, 'valorSuelo', 60000);
    await mover(page, 'valorCatastralTotal', 120000);
    await mover(page, 'aniosVenta', 5);
    await mover(page, 'valorVta', 250000);
    const habitual = page.locator('#viviendaHabitual');
    if (!(await habitual.isChecked())) await habitual.check();

    const isd = await panel(page, '1. ISD al heredar');
    expect(isd).toContain('Comunidad de Madrid — Grupo II');
    expect(isd).toContain('200.000,00'); // base imponible
    expect(isd).toContain('15.956,87'); // REDUCCIONES_PARENTESCO_IS['II']
    expect(isd).toContain('122.606,47'); // REDUCCION_VIVIENDA_MAX_IS
    expect(isd).toContain('61.436,66'); // base liquidable
    expect(await linea(page, '1. ISD al heredar', 'Cuota íntegra (tarifa)')).toBe('5404,75 €');
    expect(await linea(page, '1. ISD al heredar', '= Cuota tributaria')).toBe('5404,75 €');
    expect(isd).toContain('Bonificación CCAA (99,0%)'); // BONIFICACIONES_CCAA_IS['madrid'] = 0,99
    expect(await linea(page, '1. ISD al heredar', 'Cuota ISD final')).toBe('54,05 €');

    const plusvalia = await panel(page, '2. Plusvalía municipal');
    expect(plusvalia).toContain('20 años de tenencia'); // año actual − 1995, topado en 20
    expect(await linea(page, '2. Plusvalía municipal', 'Coeficiente 20 años')).toBe('0,45');
    // El tipo que se aplica es el ORIENTATIVO del módulo, no el máximo legal
    expect(await linea(page, '2. Plusvalía municipal', 'Tipo municipal (orientativo)')).toBe('25%');
    expect(await linea(page, '2. Plusvalía municipal', 'Método objetivo')).toBe('6750,00 €');
    expect(await linea(page, '2. Plusvalía municipal', 'Método real (suelo)')).toBe('15.000,00 €');
    expect(await linea(page, '2. Plusvalía municipal', 'Método elegido')).toBe('Objetivo (menor)');
    expect(await linea(page, '2. Plusvalía municipal', 'Cuota plusvalía municipal')).toBe(
      '6750,00 €'
    );

    const irpf = await panel(page, '3. IRPF al vender');
    expect(await linea(page, '3. IRPF al vender', 'Valor adquisición fiscal*')).toBe(
      '206.804,05 €'
    );
    expect(await linea(page, '3. IRPF al vender', 'Ganancia patrimonial')).toBe('43.195,95 €');
    expect(await linea(page, '3. IRPF al vender', 'Cuota IRPF venta')).toBe('8951,15 €');
    expect(irpf).toContain('Venta a los 5 años');

    const total = await bloqueTotal(page);
    expect(total).toContain('15.755,20'); // 54,05 + 6.750,00 + 8.951,15
    expect(total).toContain('6,30%'); // sobre 250.000 € de venta

    // Formato español: punto de millares y coma decimal, nunca el formato US.
    expect(total).toMatch(/15\.755,20/);
    expect(total).not.toMatch(/15,755\.20/);
  });

  /**
   * CASO 2 (LÍMITE) — el extremo superior de todos los ejes a la vez: heredero SIN
   * PARENTESCO (Grupo IV, el coeficiente multiplicador más alto y reducción cero),
   * el tope del deslizador de valor de referencia (2.000.000 €, que entra en el último
   * tramo de la tarifa, el del 25,50 %), Asturias (que para el Grupo IV declara
   * `reduccionBase: 0`, así que aquí no alivia nada), sin vivienda habitual y sin venta.
   *
   * ISD (Asturias, Grupo IV, reducKey 'IV'):
   *   Base imponible = base liquidable = 2.000.000,00 (ninguna reducción)
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
   *   × Coeficiente Grupo IV (COEFICIENTES_IS['IV'][0] = 2,0000) = 878.298,46401
   *   − Bonificación Asturias Grupo IV = 0 % → Cuota ISD final = 878.298,46 €
   *
   * Plusvalía municipal, con adquisición en el año en curso (0 años, el otro extremo):
   *   COEFICIENTES_IIVTNU_2025 para 0 años = 0,14
   *   Método objetivo = 500.000 × 0,14 × 0,25 = 17.500,00
   *   Método real = (2.000.000 − 30.000) × (500.000 / 1.000.000) × 0,25 = 246.250,00
   *   Menor = 17.500,00 → objetivo
   *
   * IRPF: años hasta la venta = 0 → no se simula venta → cuota 0,00 €
   * TOTAL = 878.298,46401 + 17.500 = 895.798,46401 → «895.798,46 €»
   */
  test('CASO 2 (límite) — Grupo IV hereda 2.000.000 € en Asturias, tramo del 25,50 % y coeficiente 2,0', async ({
    page,
  }) => {
    await page.goto(RUTA);

    await page.selectOption('#parentescoSel', 'sin_parentesco');
    await page.selectOption('#ccaaSel', 'asturias');
    await mover(page, 'anioAdq', ANIO); // 0 años de tenencia → coeficiente 0,14
    await mover(page, 'valorAdq', 30000);
    await mover(page, 'valorRef', 2000000); // tope del deslizador
    await mover(page, 'valorSuelo', 500000);
    await mover(page, 'valorCatastralTotal', 1000000);
    const habitual = page.locator('#viviendaHabitual');
    if (await habitual.isChecked()) await habitual.uncheck();
    await mover(page, 'aniosVenta', 0); // sin venta

    const isd = await panel(page, '1. ISD al heredar');
    expect(isd).toContain('Principado de Asturias — Grupo IV');
    expect(isd).toContain('2.000.000,00'); // base imponible = base liquidable
    expect(await linea(page, '1. ISD al heredar', '− Reducción parentesco')).toBe('−0,00 €');
    expect(await linea(page, '1. ISD al heredar', 'Cuota íntegra (tarifa)')).toBe('439.149,23 €');
    expect(isd).toContain('×2,0000'); // COEFICIENTES_IS['IV'][0]
    expect(await linea(page, '1. ISD al heredar', '= Cuota tributaria')).toBe('878.298,46 €');
    expect(isd).toContain('Bonificación CCAA (0,0%)'); // Asturias no bonifica en cuota
    expect(await linea(page, '1. ISD al heredar', 'Cuota ISD final')).toBe('878.298,46 €');
    // El Grupo IV de Asturias declara reduccionBase 0: no debe aparecer la línea autonómica
    expect(isd).not.toContain('Reducción autonómica');

    const plusvalia = await panel(page, '2. Plusvalía municipal');
    expect(plusvalia).toContain('0 años de tenencia');
    expect(await linea(page, '2. Plusvalía municipal', 'Coeficiente 0 años')).toBe('0,14');
    expect(await linea(page, '2. Plusvalía municipal', 'Método objetivo')).toBe('17.500,00 €');
    expect(await linea(page, '2. Plusvalía municipal', 'Método real (suelo)')).toBe('246.250,00 €');
    expect(await linea(page, '2. Plusvalía municipal', 'Cuota plusvalía municipal')).toBe(
      '17.500,00 €'
    );

    // Sin venta → el panel de IRPF explica que no hay ganancia patrimonial que declarar.
    expect(await panel(page, '3. IRPF al vender')).toContain('Sin venta simulada');

    const total = await bloqueTotal(page);
    expect(total).toContain('895.798,46'); // 878.298,46 + 17.500,00 + 0,00

    // Hallazgo 202: el año salía de una constante `2025` congelada en el código, así que el
    // deslizador no dejaba llegar al año en curso y la tenencia del causante (que elige el
    // coeficiente del IIVTNU, y esa tabla NO es monótona) iba desfasada un escalón.
    expect(await page.locator('#anioAdq').getAttribute('max')).toBe(String(ANIO));
    expect(await page.locator('label[for="anioAdq"]').innerText()).toContain('(0 años hasta hoy)');
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
   *      así que por el RDL 26/2021 el impuesto no se devenga: 0,00 €, por mucho que el
   *      método objetivo siga arrojando 5.000 × 0,45 × 0,25 = 562,50 €.
   *
   *   c) Pérdida patrimonial en IRPF: se vende por 50.000 € algo cuyo valor de adquisición
   *      fiscal es 100.000 €. La ganancia es −50.000 €: una pérdida no tributa.
   *
   * TOTAL = 0,00 € y 0,00 % del valor de venta.
   */
  test('CASO 3 (rechazo) — reducciones mayores que la base, plusvalía no sujeta y pérdida patrimonial: todo a 0,00 €', async ({
    page,
  }) => {
    await page.goto(RUTA);

    await page.selectOption('#parentescoSel', 'hijo');
    await page.selectOption('#ccaaSel', 'madrid');
    await mover(page, 'anioAdq', 1985); // 40 años → topado en 20 → coeficiente 0,45
    await mover(page, 'valorAdq', 300000); // compró por MÁS de lo que hoy vale
    await mover(page, 'valorRef', 100000);
    await mover(page, 'valorSuelo', 5000);
    await mover(page, 'valorCatastralTotal', 10000);
    const habitual = page.locator('#viviendaHabitual');
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
    expect(await linea(page, '2. Plusvalía municipal', 'Método objetivo')).toBe('562,50 €');
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

  /**
   * CASO 4 — ASTURIAS Y SU REDUCCIÓN EN BASE (hallazgo 200, alto).
   *
   * Asturias es la única CCAA de régimen común cuyo beneficio está modelado como reducción
   * sobre la BASE (`reduccionBase: 300000` para los Grupos I y II) en vez de como
   * bonificación en cuota, y era justo la que el motor no sabía leer: aplicaba solo la
   * reducción estatal, veía `porcentaje: 0` y presentaba Asturias como la comunidad más
   * cara del país. Un hijo que heredaba 250.000 € de vivienda habitual pagaba 10.347,97 €
   * según la app cuando `data/fiscal` dice que no paga nada.
   *
   *   Base imponible = 250.000,00
   *   − Reducción parentesco (REDUCCIONES_PARENTESCO_IS['II']) = 15.956,87
   *   − Reducción vivienda habitual = min(250.000 × 0,95 ; 122.606,47) = 122.606,47
   *   − Reducción autonómica de Asturias = 300.000,00
   *   = Base liquidable = máx(0 ; 250.000 − 438.563,34) = 0,00 → cuota íntegra 0 → ISD 0,00 €
   */
  test('CASO 4 — Asturias aplica su reducción de 300.000 € EN BASE: el hijo no paga ISD', async ({
    page,
  }) => {
    await page.goto(RUTA);

    await page.selectOption('#parentescoSel', 'hijo');
    await page.selectOption('#ccaaSel', 'asturias');
    await mover(page, 'valorRef', 250000);
    await mover(page, 'aniosVenta', 0); // aislar el ISD: sin venta
    const habitual = page.locator('#viviendaHabitual');
    if (!(await habitual.isChecked())) await habitual.check();

    const isd = await panel(page, '1. ISD al heredar');
    expect(isd).toContain('Principado de Asturias — Grupo II');
    expect(await linea(page, '1. ISD al heredar', '− Reducción parentesco')).toBe('−15.956,87 €');
    expect(await linea(page, '1. ISD al heredar', '− Reducción vivienda habitual (95%)')).toBe(
      '−122.606,47 €'
    );
    expect(
      await linea(page, '1. ISD al heredar', '− Reducción autonómica (Principado de Asturias)')
    ).toBe('−300.000,00 €');
    expect(await linea(page, '1. ISD al heredar', '= Base liquidable')).toBe('0,00 €');
    expect(await linea(page, '1. ISD al heredar', 'Cuota ISD final')).toBe('0,00 €');
  });

  /**
   * CASO 5 — EL ESCALÓN DE LA RIOJA (hallazgo 201).
   *
   * `BONIFICACIONES_CCAA_IS['rioja']` declara { porcentaje: 0,99, tope: 500.000,
   * porcentajeMayor: 0,98 }. El motor no leía `tope` ni `porcentajeMayor`, así que aplicaba
   * el 99 % a cualquier importe. Como la bonificación va sobre cuota y lo que se paga es el
   * COMPLEMENTO, pasar del 98 % al 99 % duplica el error: la app cobraba la mitad.
   *
   *   Base imponible = 900.000,00
   *   − 15.956,87 (parentesco) − 122.606,47 (vivienda habitual, en su tope)
   *   = Base liquidable = 761.436,66  → por encima del tope de 500.000
   *   Cuota íntegra por tramos:
   *         7.993,46 × 7,65 %  =    611,49969
   *        23.963,41 × 8,50 %  =  2.036,88985
   *        47.924,31 × 9,35 %  =  4.480,922985
   *       159.507,95 × 10,20 % = 16.269,81090
   *       159.388,41 × 15,30 % = 24.386,42673
   *       362.659,12 × 21,25 % = 77.065,06300   (761.436,66 − 398.777,54)
   *                              ─────────────
   *                              124.850,613155 → «124.850,61 €»
   *   × Coeficiente Grupo II = 1,0000
   *   − Bonificación 98 % → Cuota ISD final = 124.850,613155 × 0,02 = 2.497,0122631 → «2497,01 €»
   *   (con el 99 % salían 1.248,51 €, la mitad)
   */
  test('CASO 5 — La Rioja baja al 98 % por encima de 500.000 € de base liquidable', async ({
    page,
  }) => {
    await page.goto(RUTA);

    await page.selectOption('#parentescoSel', 'hijo');
    await page.selectOption('#ccaaSel', 'rioja');
    await mover(page, 'valorRef', 900000);
    await mover(page, 'aniosVenta', 0);
    const habitual = page.locator('#viviendaHabitual');
    if (!(await habitual.isChecked())) await habitual.check();

    const isd = await panel(page, '1. ISD al heredar');
    expect(isd).toContain('La Rioja — Grupo II');
    expect(await linea(page, '1. ISD al heredar', '= Base liquidable')).toBe('761.436,66 €');
    expect(await linea(page, '1. ISD al heredar', 'Cuota íntegra (tarifa)')).toBe('124.850,61 €');
    expect(isd).toContain('Bonificación CCAA (98,0%)');
    expect(await linea(page, '1. ISD al heredar', 'Cuota ISD final')).toBe('2497,01 €');

    // Y por DEBAJO del tope sigue vigente el 99 %: 400.000 − 15.956,87 − 122.606,47 = 261.436,66
    await mover(page, 'valorRef', 400000);
    expect(await linea(page, '1. ISD al heredar', '= Base liquidable')).toBe('261.436,66 €');
    expect(await panel(page, '1. ISD al heredar')).toContain('Bonificación CCAA (99,0%)');
  });

  /**
   * CASO 6 — LA REDUCCIÓN DE VIVIENDA HABITUAL NO ES PARA CUALQUIERA (hallazgo 204).
   *
   * El art. 20.2.c LISD reserva la reducción del 95 % al cónyuge, ascendientes y
   * descendientes, y al pariente COLATERAL mayor de 65 años que hubiera convivido con el
   * causante los dos años anteriores — que es exactamente lo que dice la FAQ de esta misma
   * página. El motor la concedía con `grupo !== 'IV'`, así que un hermano de 40 años que no
   * convivía se llevaba hasta 122.606,47 € a los que no tiene derecho.
   *
   * Hermano de 45 años, Andalucía (que no bonifica al Grupo III), 200.000 €:
   *   Base liquidable = 200.000 − 7.993,46 = 192.006,54
   *   Cuota íntegra:
   *        7.993,46 × 7,65 %  =    611,49969
   *       23.963,41 × 8,50 %  =  2.036,88985
   *       47.924,31 × 9,35 %  =  4.480,922985
   *      112.125,36 × 10,20 % = 11.436,78672   (192.006,54 − 79.881,18)
   *                             ─────────────
   *                              18.566,099245
   *   × COEFICIENTES_IS['III'][0] = 1,5882 → 29.486,6788... → «29.486,68 €»
   *
   * Con 65 años Y convivencia sí procede:
   *   Base liquidable = 200.000 − 7.993,46 − 122.606,47 = 69.400,07
   *   Cuota íntegra = 611,49969 + 2.036,88985 + 37.443,20 × 9,35 % (=3.500,9392) = 6.149,32874
   *   × 1,5882 = 9.766,3639... → «9766,36 €»
   */
  test('CASO 6 — el colateral solo reduce por vivienda habitual si tiene 65 años y convivió', async ({
    page,
  }) => {
    await page.goto(RUTA);

    await page.selectOption('#parentescoSel', 'hermano');
    await page.selectOption('#ccaaSel', 'andalucia');
    await mover(page, 'valorRef', 200000);
    await mover(page, 'edadHer', 45);
    await mover(page, 'aniosVenta', 0);
    const habitual = page.locator('#viviendaHabitual');
    if (!(await habitual.isChecked())) await habitual.check();

    // Marcada la casilla de vivienda habitual, pero el hermano de 45 años no cumple
    const isd = await panel(page, '1. ISD al heredar');
    expect(isd).toContain('Andalucía — Grupo III');
    expect(isd).toContain('No aplicable: pariente colateral menor de 65 años');
    expect(await linea(page, '1. ISD al heredar', '= Base liquidable')).toBe('192.006,54 €');
    expect(isd).toContain('×1,5882'); // COEFICIENTES_IS['III'][0]
    expect(await linea(page, '1. ISD al heredar', 'Cuota ISD final')).toBe('29.486,68 €');

    // Con 65 años pero sin convivencia sigue sin proceder
    await mover(page, 'edadHer', 65);
    expect(await panel(page, '1. ISD al heredar')).toContain(
      'No aplicable: pariente colateral que no convivió los 2 años anteriores'
    );

    // Con los dos requisitos, la reducción entra
    await page.locator('#convivencia').check();
    expect(await linea(page, '1. ISD al heredar', '− Reducción vivienda habitual (95%)')).toBe(
      '−122.606,47 €'
    );
    expect(await linea(page, '1. ISD al heredar', '= Base liquidable')).toBe('69.400,07 €');
    expect(await linea(page, '1. ISD al heredar', 'Cuota ISD final')).toBe('9766,36 €');
  });

  /**
   * CASO 7 — CADA OPCIÓN DEL DESPLEGABLE SIGNIFICA ALGO DISTINTO (hallazgo 206).
   *
   * Había dos opciones que compartían grupo y clave de reducción («Hermano / Tío / Sobrino»
   * y «Pariente lejano (Grupo III)»), de modo que devolvían el mismo resultado y el sobrino
   * aparecía en las dos. Y «Cónyuge / Hijo / Descendiente ≥21» iba rotulada Grupo II
   * leyendo la fila `I-conyuge`, que en Cataluña reduce 100.000 € frente a los 50.000 € del
   * hijo (REDUCCIONES_PARENTESCO_CATALUNA_IS).
   */
  test('CASO 7 — en Cataluña el cónyuge reduce 100.000 € y el hijo 50.000 €, y no hay opciones gemelas', async ({
    page,
  }) => {
    await page.goto(RUTA);

    // Cinco opciones, ninguna repetida
    const opciones = await page.locator('#parentescoSel option').allTextContents();
    expect(opciones).toHaveLength(5);
    expect(new Set(opciones).size).toBe(5);

    await page.selectOption('#ccaaSel', 'cataluna');
    await mover(page, 'valorRef', 350000);
    await mover(page, 'aniosVenta', 0);

    await page.selectOption('#parentescoSel', 'conyuge');
    expect(await linea(page, '1. ISD al heredar', '− Reducción parentesco')).toBe('−100.000,00 €');

    await page.selectOption('#parentescoSel', 'hijo');
    expect(await linea(page, '1. ISD al heredar', '− Reducción parentesco')).toBe('−50.000,00 €');
  });
});
