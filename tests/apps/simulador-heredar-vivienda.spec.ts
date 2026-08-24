/**
 * Inspector — simulador-heredar-vivienda (segmento FISCAL, riesgo 1 CRÍTICO)
 *
 * Inspección del 24/08/2026 (hallazgos 199-206) · REPARADA el 24/08/2026 ·
 * RE-INSPECCIÓN del 24/08/2026: los 8 hallazgos se verifican uno a uno con casos
 * numéricos nuevos, resueltos a mano ANTES de ejecutar la app.
 *
 * De dónde sale CADA cifra esperada (ninguna de memoria: todas de `data/fiscal/`):
 *
 *  ISD — `data/fiscal/sucesiones.ts` (FISCAL_SUCESIONES_META: Ley 29/1987 ISD +
 *  normativas autonómicas 2025, verificado 2025-01-01):
 *    - `REDUCCIONES_PARENTESCO_IS['II']` = 15.956,87 € · `['III']` = 7.993,46 € · `['IV']` = 0 €
 *    - `REDUCCIONES_PARENTESCO_CATALUNA_IS['I-conyuge']` = 100.000 € · `['II']` = 50.000 €
 *      (la clave `II` es «hijo/nieto ≥21» en todo el repositorio: así la describen las tools
 *       del MCP Delegum y `lib/calculadoras/sucesiones.ts`; `I-descendiente` es el menor de 21)
 *    - `REDUCCION_VIVIENDA_PORC_IS` = 0,95 · `REDUCCION_VIVIENDA_MAX_IS` = 122.606,47 €
 *    - `TARIFA_ESTATAL_IS`, 7 tramos: 7,65 % hasta 7.993,46 · 8,50 % hasta 31.956,87 ·
 *      9,35 % hasta 79.881,18 · 10,20 % hasta 239.389,13 · 15,30 % hasta 398.777,54 ·
 *      21,25 % hasta 797.555,08 · 25,50 % en adelante
 *    - `TARIFA_CATALUNA_IS`, 5 tramos propios: 7 % hasta 50.000 · 11 % hasta 150.000 ·
 *      17 % hasta 400.000 · 24 % hasta 800.000 · 32 % en adelante
 *    - `COEFICIENTES_IS['II'][0]` = 1,0000 · `['III'][0]` = 1,5882 · `['IV'][0]` = 2,0000
 *      (índice 0 = patrimonio preexistente del heredero por debajo de 402.678,11 €, que es
 *       el supuesto que simula la app)
 *    - `BONIFICACIONES_CCAA_IS['asturias']…['II'].reduccionBase` = 300.000 € (única CCAA
 *      cuyo beneficio está modelado sobre la BASE) y `porcentaje` = 0
 *    - `['rioja']…['II']` = { porcentaje: 0,99, tope: 500.000, porcentajeMayor: 0,98 }
 *    - `['canarias']…['III'].porcentaje` = 0,999 · `['madrid']…['IV'].porcentaje` = 0
 *
 *  Plusvalía municipal (IIVTNU) — `data/fiscal/inmuebles.ts` (PLUSVALIA_MUNICIPAL_META:
 *  RDL 26/2021, verificado 2025-01-15):
 *    - Tipo municipal = `PLUSVALIA_MUNICIPAL_META.tipoOrientativo` = 25 % (NO el 30 % de
 *      `tipoMaximoLegal`: la interfaz rotula «Tipo municipal (orientativo)»)
 *    - `COEFICIENTES_IIVTNU_2025`: 0 años → 0,14 · 10 años → 0,08 · 16 años → 0,16 ·
 *      20 o más → 0,45. La tabla NO es monótona, así que un año de desfase en la tenencia
 *      unas veces cobra de más y otras de menos: por eso los casos fijan el año de
 *      adquisición como `ANIO − n` y comprueban el rótulo «(n años hasta hoy)».
 *
 *  IRPF de la ganancia al vender — `TRAMOS_GANANCIAS_PATRIMONIALES_2025` en
 *  `data/fiscal/inmuebles.ts`: 19 % hasta 6.000 · 21 % hasta 50.000 · 23 % hasta 200.000 ·
 *  27 % hasta 300.000 · 30 % en adelante.
 *
 * Formato: `formatCurrency` usa es-ES con agrupación «min2», así que los importes de
 * cuatro dígitos enteros van SIN punto de millares (5405,24 €) y los de cinco o más, con
 * él (509.405,24 €). Las cifras esperadas se escriben literales, tal cual las pinta la app.
 *
 * ⚠️ 24/08/2026 — las cuotas íntegras de TODOS los casos cambiaron al cerrar el hallazgo
 * 277: la app aplica ya la COLUMNA `cuota` de la tabla oficial (`calcularCuotaIntegraIS`,
 * compartido con el MCP y los dos estimadores) en vez de acumular los tramos marginales,
 * que era su lectura propia y la única del repositorio que hacía eso.
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

const ISD = '1. ISD al heredar';
const IIVTNU = '2. Plusvalía municipal';
const IRPF = '3. IRPF al vender';

test.describe('Simulador de heredar vivienda — re-inspección 24/08/2026', () => {
  /**
   * CASO 1 (NORMAL) — la cadena entera de los tres impuestos, en ASTURIAS y con resultado
   * DISTINTO DE CERO, que es lo que de verdad prueba la reparación del hallazgo 200: si el
   * motor volviera a ignorar `reduccionBase`, un caso que acaba en 0 € podría seguir
   * saliendo 0 € por otras vías, pero éste no.
   *
   * Hijo (Grupo II, reducKey 'II'), Asturias, vivienda habitual del padre valorada en
   * 500.000 €, comprada hace 16 años por 200.000 €, valor catastral del suelo 100.000 €
   * sobre un catastral total de 250.000 €, y venta a los 3 años por 600.000 €.
   *
   * ISD:
   *   Base imponible                                          500.000,00
   *   − Reducción parentesco  REDUCCIONES_PARENTESCO_IS['II']  −15.956,87
   *   − Reducción vivienda    mín(500.000 × 0,95; 122.606,47) −122.606,47
   *   − Reducción autonómica  asturias…['II'].reduccionBase   −300.000,00
   *   = Base liquidable                                        61.436,66
   *   Cuota íntegra por la COLUMNA `cuota` de TARIFA_ESTATAL_IS (hallazgo 277):
   *        2.648,88 + (61.436,66 − 31.956,87) × 9,35 %
   *      = 2.648,88 + 2.756,360365 = 5.405,240365 → «5405,24 €»
   *   × COEFICIENTES_IS['II'][0] = 1,0000  → cuota tributaria 5.405,240365
   *   Asturias NO bonifica en cuota (porcentaje 0) → Cuota ISD final = 5.405,240365
   *
   * Plusvalía municipal (IIVTNU), tipo ORIENTATIVO del módulo (25 %):
   *   16 años de tenencia → COEFICIENTES_IIVTNU_2025[16] = 0,16
   *   Método objetivo = 100.000 × 0,16 × 0,25 = 4.000,00
   *   Método real     = (500.000 − 200.000) × (100.000 / 250.000) × 0,25 = 30.000,00
   *   Se elige el MENOR (RDL 26/2021) = 4.000,00 → objetivo
   *   (con el 30 % hardcodeado del hallazgo 199 saldrían 4.800,00 €)
   *
   * IRPF al vender a los 3 años por 600.000 €:
   *   Valor de adquisición fiscal = 500.000 + 5.405,240365 + 4.000 = 509.405,240365
   *   Ganancia = 600.000 − 509.405,240365 = 90.594,759635
   *        6.000,000000 × 19 % =  1.140,00
   *       44.000,000000 × 21 % =  9.240,00
   *       40.594,759635 × 23 % =  9.336,79471605
   *                               ─────────────
   *                                19.716,79471605 → «19.716,79 €»
   *
   * TOTAL = 5.405,240365 + 4.000 + 19.716,79471605 = 29.122,03508105 → «29.122,04 €»
   * Porcentaje sobre la venta = 29.121,657.../600.000 × 100 = 4,8536 → «4,85 %»
   */
  test('CASO 1 (normal) — hijo hereda 500.000 € en Asturias y vende a los 3 años: ISD + IIVTNU + IRPF', async ({
    page,
  }) => {
    await page.goto(RUTA);

    await page.selectOption('#parentescoSel', 'hijo');
    await page.selectOption('#ccaaSel', 'asturias');
    await mover(page, 'edadHer', 45);
    await mover(page, 'anioAdq', ANIO - 16);
    await mover(page, 'valorAdq', 200000);
    await mover(page, 'valorRef', 500000);
    await mover(page, 'valorSuelo', 100000);
    await mover(page, 'valorCatastralTotal', 250000);
    const habitual = page.locator('#viviendaHabitual');
    if (!(await habitual.isChecked())) await habitual.check();
    await mover(page, 'aniosVenta', 3);
    await mover(page, 'valorVta', 600000);

    // ── ISD ──────────────────────────────────────────────────────────────────
    expect(await panel(page, ISD)).toContain('Principado de Asturias — Grupo II');
    expect(await linea(page, ISD, 'Base imponible (valor referencia)')).toBe('500.000,00 €');
    expect(await linea(page, ISD, '− Reducción parentesco')).toBe('−15.956,87 €');
    expect(await linea(page, ISD, '− Reducción vivienda habitual (95%)')).toBe('−122.606,47 €');
    // Hallazgo 200: la reducción de Asturias vive en la BASE, no en la cuota
    expect(await linea(page, ISD, '− Reducción autonómica (Principado de Asturias)')).toBe(
      '−300.000,00 €'
    );
    expect(await linea(page, ISD, '= Base liquidable')).toBe('61.436,66 €');
    // Hallazgo 277: la cuota íntegra se lee de la COLUMNA `cuota` de TARIFA_ESTATAL_IS,
    // como hacen `lib/calculadoras/sucesiones.ts` y los dos estimadores, y no acumulando
    // los tramos marginales. 2.648,88 + (61.436,66 − 31.956,87) × 9,35 % = 5.405,2404
    // (acumulando marginales salían 5.404,75, y era esta app la única que lo hacía).
    expect(await linea(page, ISD, 'Cuota íntegra (tarifa)')).toBe('5405,24 €');
    // Hallazgo 205: el coeficiente sale de COEFICIENTES_IS, no de una tabla inline
    expect(await linea(page, ISD, '× Coef. patrimonio (Grupo II)')).toBe('×1,0000');
    expect(await linea(page, ISD, '= Cuota tributaria')).toBe('5405,24 €');
    expect(await panel(page, ISD)).toContain('Bonificación CCAA (0,0%)');
    expect(await linea(page, ISD, 'Cuota ISD final')).toBe('5405,24 €');

    // ── Plusvalía municipal ──────────────────────────────────────────────────
    expect(await panel(page, IIVTNU)).toContain('16 años de tenencia');
    expect(await linea(page, IIVTNU, 'Coeficiente 16 años')).toBe('0,16');
    // Hallazgo 199: el tipo es el ORIENTATIVO del módulo (25 %), no el máximo legal (30 %)
    expect(await linea(page, IIVTNU, 'Tipo municipal (orientativo)')).toBe('25%');
    expect(await linea(page, IIVTNU, 'Método objetivo')).toBe('4000,00 €');
    expect(await linea(page, IIVTNU, 'Método real (suelo)')).toBe('30.000,00 €');
    expect(await linea(page, IIVTNU, 'Método elegido')).toBe('Objetivo (menor)');
    expect(await linea(page, IIVTNU, 'Cuota plusvalía municipal')).toBe('4000,00 €');

    // ── IRPF ─────────────────────────────────────────────────────────────────
    expect(await linea(page, IRPF, 'Valor adquisición fiscal*')).toBe('509.405,24 €');
    expect(await linea(page, IRPF, 'Ganancia patrimonial')).toBe('90.594,76 €');
    // 6.000 × 19 % + 44.000 × 21 % + 40.594,76 × 23 % = 19.716,79 €
    expect(await linea(page, IRPF, 'Cuota IRPF venta')).toBe('19.716,79 €');

    // ── Total y formato español ──────────────────────────────────────────────
    const total = await bloqueTotal(page);
    expect(total).toContain('29.122,04'); // 5.405,24 + 4.000,00 + 19.716,79
    expect(total).toContain('4,85%');
    expect(total).not.toMatch(/29,122\.04/); // nunca formato US

    // Hallazgo 202: el año ya no está congelado en el código, sale del reloj
    expect(await page.locator('#anioAdq').getAttribute('max')).toBe(String(ANIO));
    expect(await page.locator('label[for="anioAdq"]').innerText()).toContain('(16 años hasta hoy)');
  });

  /**
   * CASO 2 (LÍMITE) — el escalón de La Rioja, cercado por los dos lados.
   *
   * `BONIFICACIONES_CCAA_IS['rioja']…['II']` = { porcentaje: 0,99, tope: 500.000,
   * porcentajeMayor: 0,98 }. El motor no leía `tope` ni `porcentajeMayor` (hallazgo 201) y
   * aplicaba el 99 % a cualquier importe: como la bonificación va sobre cuota y lo que se
   * paga es el COMPLEMENTO, pasar del 98 % al 99 % DUPLICA el error.
   *
   * Hijo, La Rioja, sin vivienda habitual y sin venta, con dos valores de referencia que
   * dejan la base liquidable a un lado y a otro del tope de 500.000 €:
   *
   *  (a) 515.000 − 15.956,87 = 499.043,13  ≤ 500.000 → 99 %
   *      Cuota íntegra = 47.798,51 + (499.043,13 − 398.777,54) × 21,25 %
   *                    = 47.798,51 + 21.306,437875 = 69.104,947875 → «69.104,95 €»
   *      Cuota final = 69.104,947875 × 0,01 = 691,04947875 → «691,05 €»
   *
   *  (b) 520.000 − 15.956,87 = 504.043,13  > 500.000 → 98 %
   *      Cuota íntegra = 47.798,51 + 105.265,59 × 21,25 % = 70.167,447875
   *      Cuota final = 70.167,447875 × 0,02 = 1.403,3489575 → «1403,35 €»
   *      (con el 99 % que aplicaba la versión rota saldrían 701,67 €, la mitad)
   *
   * Plusvalía en ambos: 1995 → tenencia topada en 20 años → coeficiente 0,45 →
   * objetivo 100.000 × 0,45 × 0,25 = 11.250,00, menor que el real → cuota 11.250,00.
   *
   * ⚠️ Las cuotas íntegras de este caso cambiaron el 24/08/2026 al cerrar el hallazgo 277:
   * la app acumulaba los tramos marginales e ignoraba la columna `cuota` de la tabla
   * oficial, que es la que aplican `lib/calculadoras/sucesiones.ts` y los dos estimadores.
   * (a) daba 69.091,99 € y ahora da 69.104,95 €, los 12,96 € que el acta anticipaba. La
   * diferencia no es aritmética sino de fuente: la columna publicada arrastra los redondeos
   * de la tabla condensada de la ley, y manda la tabla.
   */
  test('CASO 2 (límite) — La Rioja: 99 % justo por debajo del tope de 500.000 € y 98 % justo por encima', async ({
    page,
  }) => {
    await page.goto(RUTA);

    await page.selectOption('#parentescoSel', 'hijo');
    await page.selectOption('#ccaaSel', 'rioja');
    await mover(page, 'anioAdq', 1995);
    await mover(page, 'valorAdq', 200000);
    await mover(page, 'valorSuelo', 100000);
    await mover(page, 'valorCatastralTotal', 200000);
    const habitual = page.locator('#viviendaHabitual');
    if (await habitual.isChecked()) await habitual.uncheck();
    await mover(page, 'aniosVenta', 0); // aislar el ISD: sin venta

    // (a) Base liquidable 499.043,13 € → justo por DEBAJO del tope
    await mover(page, 'valorRef', 515000);
    expect(await panel(page, ISD)).toContain('La Rioja — Grupo II');
    expect(await linea(page, ISD, '= Base liquidable')).toBe('499.043,13 €');
    expect(await linea(page, ISD, 'Cuota íntegra (tarifa)')).toBe('69.104,95 €');
    expect(await panel(page, ISD)).toContain('Bonificación CCAA (99,0%)');
    expect(await linea(page, ISD, 'Cuota ISD final')).toBe('691,05 €');
    expect(await linea(page, IIVTNU, 'Cuota plusvalía municipal')).toBe('11.250,00 €');
    expect(await bloqueTotal(page)).toContain('11.941,05'); // 691,05 + 11.250,00

    // (b) Base liquidable 504.043,13 € → justo por ENCIMA del tope
    await mover(page, 'valorRef', 520000);
    expect(await linea(page, ISD, '= Base liquidable')).toBe('504.043,13 €');
    expect(await linea(page, ISD, 'Cuota íntegra (tarifa)')).toBe('70.167,45 €');
    expect(await panel(page, ISD)).toContain('Bonificación CCAA (98,0%)');
    expect(await linea(page, ISD, 'Cuota ISD final')).toBe('1403,35 €');
    expect(await bloqueTotal(page)).toContain('12.653,35'); // 1.403,35 + 11.250,00

    // Sin venta no hay IRPF que declarar
    expect(await panel(page, IRPF)).toContain('Sin venta simulada');
  });

  /**
   * CASO 3 (RECHAZO) — tres beneficios que la app NO debe conceder, encadenados.
   *
   *  a) La reducción del 95 % por vivienda habitual (hallazgo 206). El art. 20.2.c LISD la
   *     reserva al cónyuge, ascendientes y descendientes, y al pariente COLATERAL mayor de
   *     65 años que hubiera convivido con el causante los dos años anteriores — que es lo
   *     que dice la FAQ de esta misma página. Un hermano de 40 años que no convivía NO
   *     tiene derecho a los 122.606,47 €.
   *
   *  b) La plusvalía municipal cuando no hay incremento de valor: el causante compró por
   *     400.000 € y el valor de referencia de la herencia es 300.000 €. Por el RDL 26/2021
   *     el impuesto no se devenga, por mucho que el método objetivo siga arrojando
   *     80.000 × 0,08 × 0,25 = 1.600,00 €.
   *
   *  c) El IRPF de una pérdida patrimonial: se vende por 250.000 € algo cuyo valor de
   *     adquisición fiscal es 300.049,95 €.
   *
   * ISD (Canarias, Grupo III, sin la reducción de vivienda):
   *   Base imponible                                        300.000,00
   *   − REDUCCIONES_PARENTESCO_IS['III']                     −7.993,46
   *   = Base liquidable                                     292.006,54
   *   Cuota íntegra:
   *        7.993,46 × 7,65 %  =    611,49969
   *       23.963,41 × 8,50 %  =  2.036,88985
   *       47.924,31 × 9,35 %  =  4.480,922985
   *      159.507,95 × 10,20 % = 16.269,81090
   *       52.617,41 × 15,30 % =  8.050,46373   (292.006,54 − 239.389,13)
   *                              ────────────
   *                              31.449,587155 → «31.449,59 €»
   *   × COEFICIENTES_IS['III'][0] = 1,5882 → 49.948,23431957 → «49.948,23 €»
   *   − Bonificación Canarias Grupo III (0,999) → 49.948,23431957 × 0,001 = 49,948 → «49,95 €»
   *
   * Y con los DOS requisitos cumplidos (66 años y convivencia) la reducción sí entra:
   *   Base liquidable = 300.000 − 7.993,46 − 122.606,47 = 169.400,07
   *   Cuota íntegra = 7.129,312525 + 89.518,89 × 10,20 % (=9.130,92678) = 16.260,239305
   *   × 1,5882 = 25.824,5120642 → «25.824,51 €» · × 0,001 = 25,8245 → «25,82 €»
   */
  test('CASO 3 (rechazo) — colateral sin derecho a la reducción, plusvalía no sujeta y pérdida patrimonial', async ({
    page,
  }) => {
    await page.goto(RUTA);

    await page.selectOption('#parentescoSel', 'hermano');
    await page.selectOption('#ccaaSel', 'canarias');
    await mover(page, 'edadHer', 40);
    await mover(page, 'anioAdq', ANIO - 10);
    await mover(page, 'valorAdq', 400000); // compró por MÁS de lo que hoy vale
    await mover(page, 'valorRef', 300000);
    await mover(page, 'valorSuelo', 80000);
    await mover(page, 'valorCatastralTotal', 160000);
    const habitual = page.locator('#viviendaHabitual');
    if (!(await habitual.isChecked())) await habitual.check();
    await mover(page, 'aniosVenta', 2);
    await mover(page, 'valorVta', 250000);

    // a) Con la casilla de vivienda habitual MARCADA, el hermano de 40 años no reduce
    expect(await panel(page, ISD)).toContain('Canarias — Grupo III');
    expect(await linea(page, ISD, 'Reducción vivienda habitual')).toBe(
      'No aplicable: pariente colateral menor de 65 años'
    );
    expect(await linea(page, ISD, '− Reducción parentesco')).toBe('−7993,46 €');
    expect(await linea(page, ISD, '= Base liquidable')).toBe('292.006,54 €');
    // 23.409,28 + (292.006,54 − 239.389,13) × 15,30 % = 31.459,7437 (columna `cuota`)
    expect(await linea(page, ISD, 'Cuota íntegra (tarifa)')).toBe('31.459,74 €');
    expect(await linea(page, ISD, '× Coef. patrimonio (Grupo III)')).toBe('×1,5882');
    expect(await linea(page, ISD, '= Cuota tributaria')).toBe('49.964,36 €');
    expect(await panel(page, ISD)).toContain('Bonificación CCAA (99,9%)');
    expect(await linea(page, ISD, 'Cuota ISD final')).toBe('49,96 €');

    // b) Sin incremento de valor del terreno no se devenga el IIVTNU (RDL 26/2021)
    expect(await linea(page, IIVTNU, 'Método objetivo')).toBe('1600,00 €');
    expect(await linea(page, IIVTNU, 'Método real (suelo)')).toBe('Exenta (sin ganancia)');
    expect(await linea(page, IIVTNU, 'Método elegido')).toBe('Exenta');
    expect(await linea(page, IIVTNU, 'Cuota plusvalía municipal')).toBe('0,00 €');

    // c) Una pérdida patrimonial no genera cuota de IRPF
    expect(await linea(page, IRPF, 'Valor adquisición fiscal*')).toBe('300.049,96 €');
    expect(await linea(page, IRPF, 'Pérdida patrimonial')).toBe('−50.049,96 €');
    expect(await linea(page, IRPF, 'Cuota IRPF venta')).toBe('0,00 €');

    expect(await bloqueTotal(page)).toContain('49,96 €');

    // Con 65 años cumplidos pero sin convivencia, sigue sin proceder
    await mover(page, 'edadHer', 66);
    expect(await linea(page, ISD, 'Reducción vivienda habitual')).toBe(
      'No aplicable: pariente colateral que no convivió los 2 años anteriores'
    );

    // Con los DOS requisitos, la reducción entra
    await page.locator('#convivencia').check();
    expect(await linea(page, ISD, '− Reducción vivienda habitual (95%)')).toBe('−122.606,47 €');
    expect(await linea(page, ISD, '= Base liquidable')).toBe('169.400,07 €');
    // 7.127,47 + (169.400,07 − 79.881,18) × 10,20 % = 16.258,39678 (columna `cuota`)
    expect(await linea(page, ISD, 'Cuota íntegra (tarifa)')).toBe('16.258,40 €');
    expect(await linea(page, ISD, '= Cuota tributaria')).toBe('25.821,59 €');
    expect(await linea(page, ISD, 'Cuota ISD final')).toBe('25,82 €');
  });

  /**
   * GUARDA — el extremo superior de todos los ejes a la vez: Grupo IV (sin reducción y con
   * el coeficiente multiplicador más alto), el tope del deslizador de valor de referencia
   * (2.000.000 €, que entra en el tramo del 25,50 %), Asturias (cuyo Grupo IV declara
   * `reduccionBase: 0`, así que aquí no alivia nada) y 0 años de tenencia.
   *
   *   Base imponible = base liquidable = 2.000.000,00 (ninguna reducción)
   *   Cuota íntegra por la COLUMNA `cuota` del último tramo de TARIFA_ESTATAL_IS:
   *        132.549,07 + (2.000.000 − 797.555,08) × 25,50 %
   *      = 132.549,07 + 306.623,4546 = 439.172,5246 → «439.172,52 €»
   *   × COEFICIENTES_IS['IV'][0] = 2,0000 = 878.345,0492 → «878.345,05 €»
   *   Asturias no bonifica → Cuota ISD final = 878.345,05 €
   *   (acumulando los tramos marginales, como hacía la app hasta el hallazgo 277, salían
   *    439.149,23 y 878.298,46: 46,59 € menos de cuota tributaria)
   *
   *   Plusvalía: 0 años → COEFICIENTES_IIVTNU_2025[0] = 0,14
   *     objetivo = 500.000 × 0,14 × 0,25 = 17.500,00
   *     real     = (2.000.000 − 30.000) × (500.000 / 1.000.000) × 0,25 = 246.250,00
   *   TOTAL (sin venta) = 878.345,0492 + 17.500 = 895.845,0492 → «895.845,05 €»
   */
  test('GUARDA — tramo del 25,50 %, coeficiente 2,0000 y 0 años de tenencia (Grupo IV, 2.000.000 € en Asturias)', async ({
    page,
  }) => {
    await page.goto(RUTA);

    await page.selectOption('#parentescoSel', 'sin_parentesco');
    await page.selectOption('#ccaaSel', 'asturias');
    await mover(page, 'anioAdq', ANIO); // 0 años de tenencia
    await mover(page, 'valorAdq', 30000);
    await mover(page, 'valorRef', 2000000); // tope del deslizador
    await mover(page, 'valorSuelo', 500000);
    await mover(page, 'valorCatastralTotal', 1000000);
    const habitual = page.locator('#viviendaHabitual');
    if (await habitual.isChecked()) await habitual.uncheck();
    await mover(page, 'aniosVenta', 0);

    expect(await panel(page, ISD)).toContain('Principado de Asturias — Grupo IV');
    expect(await linea(page, ISD, '− Reducción parentesco')).toBe('−0,00 €');
    // 132.549,07 + (2.000.000 − 797.555,08) × 25,50 % = 439.172,5246 (columna `cuota`)
    expect(await linea(page, ISD, 'Cuota íntegra (tarifa)')).toBe('439.172,52 €');
    expect(await linea(page, ISD, '× Coef. patrimonio (Grupo IV)')).toBe('×2,0000');
    expect(await linea(page, ISD, '= Cuota tributaria')).toBe('878.345,05 €');
    expect(await linea(page, ISD, 'Cuota ISD final')).toBe('878.345,05 €');
    // El Grupo IV de Asturias declara reduccionBase 0: no debe aparecer la línea autonómica
    expect(await panel(page, ISD)).not.toContain('Reducción autonómica');

    expect(await panel(page, IIVTNU)).toContain('0 años de tenencia');
    expect(await linea(page, IIVTNU, 'Coeficiente 0 años')).toBe('0,14');
    expect(await linea(page, IIVTNU, 'Método objetivo')).toBe('17.500,00 €');
    expect(await linea(page, IIVTNU, 'Método real (suelo)')).toBe('246.250,00 €');
    expect(await linea(page, IIVTNU, 'Cuota plusvalía municipal')).toBe('17.500,00 €');

    expect(await bloqueTotal(page)).toContain('895.845,05');
    expect(await page.locator('label[for="anioAdq"]').innerText()).toContain('(0 años hasta hoy)');
  });

  /**
   * GUARDA — el desplegable de parentesco y los botones de casos (hallazgos 203 y 204).
   *
   * Antes había dos opciones que compartían grupo y clave de reducción («Hermano / Tío /
   * Sobrino» y «Pariente lejano (Grupo III)»), así que devolvían el mismo resultado y el
   * sobrino aparecía nombrado en las dos; y «Cónyuge / Hijo / Descendiente ≥21» iba
   * rotulada Grupo II leyendo la fila `I-conyuge`. En régimen común da igual (las cuatro
   * filas valen 15.956,87 €) pero en Cataluña NO: `REDUCCIONES_PARENTESCO_CATALUNA_IS`
   * declara 100.000 € para el cónyuge y 50.000 € para el hijo ≥21.
   *
   * Y los cuatro botones de casos preconfigurados no llevaban `type="button"`, la regla de
   * oro del CLAUDE.md global §5 que hoy vigila el candado `npm run check:a11y-jsx`.
   */
  test('GUARDA — cinco parentescos distintos, Cataluña separa cónyuge de hijo, y ningún botón sin type', async ({
    page,
  }) => {
    await page.goto(RUTA);

    // Cinco opciones, ninguna repetida ni con el mismo significado
    const opciones = await page.locator('#parentescoSel option').allTextContents();
    expect(opciones).toHaveLength(5);
    expect(new Set(opciones).size).toBe(5);

    // Las 17 CCAA que promete la metadata
    expect(await page.locator('#ccaaSel option').count()).toBe(17);

    // Ningún <button> de la página sin atributo type (los 4 casos preconfigurados incluidos)
    const sinType = await page.evaluate(
      () =>
        [...document.querySelectorAll('button')].filter(b => !b.getAttribute('type')).length
    );
    expect(sinType).toBe(0);

    // Cataluña: el cónyuge reduce 100.000 € y el hijo ≥21, 50.000 €
    await page.selectOption('#ccaaSel', 'cataluna');
    await mover(page, 'valorRef', 350000);
    await mover(page, 'aniosVenta', 0);

    await page.selectOption('#parentescoSel', 'conyuge');
    expect(await linea(page, ISD, '− Reducción parentesco')).toBe('−100.000,00 €');

    await page.selectOption('#parentescoSel', 'hijo');
    expect(await linea(page, ISD, '− Reducción parentesco')).toBe('−50.000,00 €');
  });

  /**
   * GUARDA — Grupo IV con 200.000 €, el ejemplo que el bloque educativo comenta.
   *
   * Base liquidable = 200.000 (sin reducciones). Por la COLUMNA `cuota` del tramo del
   * 10,20 % (hallazgo 277; antes se acumulaban los marginales y salía 19.381,43):
   *      7.127,47 + (200.000 − 79.881,18) × 10,20 % = 7.127,47 + 12.252,11964
   *                                                 = 19.379,58964 → «19.379,59 €»
   *   × COEFICIENTES_IS['IV'][0] = 2,0000 → 38.759,17928 → «38.759,18 €»
   *   Madrid no bonifica al Grupo IV (porcentaje 0) → Cuota ISD final = 38.759,18 €
   *
   * Esta guarda fija la cifra del motor porque el bloque educativo la CITA: la tarjeta
   * «Heredero del Grupo IV (sin parentesco)» decía «80-100.000 € de ISD», más del doble de
   * lo que liquida la propia página e inalcanzable con cualquier CCAA del desplegable
   * (46.000,00 € en Cataluña, la más cara). Al cerrar el hallazgo 275 el texto dejó de
   * llevar una cifra escrita a mano: ahora la deriva del motor con estos mismos parámetros
   * (`EJEMPLO_GRUPO_IV` en page.tsx), así que si el cálculo cambia, el texto cambia con él.
   */
  test('GUARDA — Grupo IV sin reducciones: 200.000 € tributan 38.759,18 € de ISD en régimen común', async ({
    page,
  }) => {
    await page.goto(RUTA);

    await page.selectOption('#parentescoSel', 'sin_parentesco');
    await page.selectOption('#ccaaSel', 'madrid');
    await mover(page, 'valorRef', 200000);
    await mover(page, 'aniosVenta', 0);
    const habitual = page.locator('#viviendaHabitual');
    if (await habitual.isChecked()) await habitual.uncheck();

    expect(await linea(page, ISD, '= Base liquidable')).toBe('200.000,00 €');
    expect(await linea(page, ISD, 'Cuota íntegra (tarifa)')).toBe('19.379,59 €');
    expect(await linea(page, ISD, '= Cuota tributaria')).toBe('38.759,18 €');
    expect(await linea(page, ISD, 'Cuota ISD final')).toBe('38.759,18 €');

    // Y el bloque educativo tiene que decir ESA cifra, no una escrita a mano (hallazgo 275).
    // `textContent` y no `innerText` porque <EducationalSection> oculta su contenido por CSS
    // sin desmontarlo: el texto está en el DOM aunque la guía esté plegada.
    // (el espacio antes del € que pinta `formatCurrency` es U+00A0, así que se normaliza)
    const educativo = ((await page.locator('body').textContent()) ?? '').replace(/\s+/g, ' ');
    expect(educativo).toContain('38.759,18 €');
    expect(educativo).not.toContain('80-100.000');

    // Cataluña, con su tarifa propia, es la más cara del desplegable para este supuesto:
    // 50.000 × 7 % + 100.000 × 11 % + 50.000 × 17 % = 23.000,00 → × 2,0000 = 46.000,00 €
    await page.selectOption('#ccaaSel', 'cataluna');
    expect(await linea(page, ISD, 'Cuota íntegra (tarifa)')).toBe('23.000,00 €');
    expect(await linea(page, ISD, 'Cuota ISD final')).toBe('46.000,00 €');
  });
});
