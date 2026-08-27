/**
 * Inspector — simulador-heredar-vivienda (segmento FISCAL, riesgo 1 CRÍTICO)
 *
 * Inspección del 24/08/2026 (hallazgos 199-206 y 275-277) · REPARADA el 24/08/2026 en
 * `164de655` y `85f2c03f` · RE-INSPECCIÓN del 27/08/2026, porque `data/fiscal` cambió
 * después de la reparación.
 *
 * Qué prueba este fichero, en dos mitades:
 *
 *  A) Que la reparación del 24/08 CERRÓ. Los seis primeros tests son los de aquella
 *     ronda y siguen verdes: tipo municipal orientativo (199), Asturias con su reducción
 *     en BASE (200), el escalón de La Rioja (201), el año del reloj (202), los
 *     coeficientes leídos de `data/fiscal` (203), los requisitos del colateral (204), los
 *     cuatro botones con `type` (205), cinco parentescos distintos (206), la cifra del
 *     Grupo IV derivada del motor (275) y la cuota íntegra por la COLUMNA `cuota` (277).
 *
 *  B) Lo que aquella ronda no miró: los tres impuestos encadenados sobre el caso
 *     preconfigurado, la base liquidable que se queda en cero, la entrada basura en los
 *     deslizadores, el tramo del 30 % del IRPF, el escalonado de Castilla-La Mancha y —lo
 *     importante— si la web y el MCP siguen dando el MISMO número para la misma herencia.
 *
 * ⚠️ HALLAZGOS ABIERTOS (van con `test.fail()`, la convención de estos ficheros):
 *   · La reducción por vivienda habitual del art. 20.2.c LISD volvió a separar la web del
 *     motor compartido, ahora por dos sitios distintos: Cataluña y el colateral del Grupo
 *     III. Es el mismo defecto del hallazgo 276 —la misma herencia con dos respuestas—
 *     reaparecido al revés: entonces el que iba por detrás era el motor compartido en
 *     Asturias, y ahora es el motor compartido en la reducción de vivienda, porque la
 *     reparación del hallazgo 204 aterrizó SOLO en `page.tsx`.
 *   · El `faqJsonLd` de `metadata.ts` (que es lo que leen Bing Copilot, ChatGPT y
 *     Perplexity) describe una escala del ahorro sin los dos tramos superiores y una
 *     exención de IRPF que la app no aplica ni `data/fiscal` reconoce en esos términos.
 *   · La tarjeta educativa «Hijo hereda piso vivienda habitual del padre» lista
 *     Castilla-La Mancha entre las CCAA donde «el ISD se reduce a casi cero».
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
 *    - `['castilla-mancha']…['II'].escalonado` = 100 % hasta 175.000 · 95 % hasta 225.000 ·
 *      90 % hasta 275.000 · 85 % hasta 300.000 · 80 % por encima de 300.000
 *    - `['canarias']…['III'].porcentaje` = 0,999 · `['madrid']…['III']` = 0,50 ·
 *      `['madrid']…['IV'].porcentaje` = 0
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
import { calcularSucesion } from '../../lib/calculadoras/sucesiones';
import { BONIFICACIONES_CCAA_IS } from '../../data/fiscal';

const RUTA = '/simulador-heredar-vivienda/';

/** El año que la app usa para la tenencia del causante: el del reloj, ya no una constante. */
const ANIO = new Date().getFullYear();

/**
 * Mueve un `input[type=range]` controlado por React. `fill()` no dispara el onChange
 * de React en un range, así que se usa el setter nativo + evento `input` burbujeante.
 */
async function mover(page: Page, id: string, valor: number | string): Promise<void> {
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
    [id, valor] as [string, number | string]
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

/**
 * Convierte un importe tal como lo pinta la app («12.013,29 €») al número que representa,
 * para poder compararlo con lo que devuelve el motor compartido. Formato español: el punto
 * es el millar y la coma, el decimal.
 */
function importe(texto: string): number {
  const limpio = texto.replace(/[^\d.,-]/g, '').replace(/\./g, '').replace(',', '.');
  return Number(limpio);
}

/** Marca o desmarca una casilla dejándola en el estado pedido. */
async function casilla(page: Page, id: string, marcada: boolean): Promise<void> {
  const el = page.locator(`#${id}`);
  if ((await el.count()) === 0) return;
  if ((await el.isChecked()) !== marcada) await el.click();
}

interface PreguntaLd {
  name: string;
  acceptedAnswer: { text: string };
}
interface BloqueLd {
  '@type'?: string;
  mainEntity?: PreguntaLd[];
}

/** Las preguntas del `faqJsonLd` tal como se sirven en el HTML de la página. */
async function faqServida(page: Page): Promise<PreguntaLd[]> {
  return await page.evaluate(() => {
    for (const s of document.querySelectorAll('script[type="application/ld+json"]')) {
      const o = JSON.parse(s.textContent ?? '{}') as BloqueLd;
      if (o['@type'] === 'FAQPage' && o.mainEntity) return o.mainEntity;
    }
    return [];
  });
}

const ISD = '1. ISD al heredar';
const IIVTNU = '2. Plusvalía municipal';
const IRPF = '3. IRPF al vender';

test.describe('Simulador de heredar vivienda — re-inspección 27/08/2026', () => {
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
    await casilla(page, 'viviendaHabitual', true);
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
    // Hallazgo 203: el coeficiente sale de COEFICIENTES_IS, no de una tabla inline
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
    await casilla(page, 'viviendaHabitual', false);
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
   *  a) La reducción del 95 % por vivienda habitual (hallazgo 204). El art. 20.2.c LISD la
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
   *     adquisición fiscal es 300.049,96 €.
   *
   * ISD (Canarias, Grupo III, sin la reducción de vivienda):
   *   Base imponible                                        300.000,00
   *   − REDUCCIONES_PARENTESCO_IS['III']                     −7.993,46
   *   = Base liquidable                                     292.006,54
   *   Cuota íntegra = 23.409,28 + (292.006,54 − 239.389,13) × 15,30 % = 31.459,74373
   *   × COEFICIENTES_IS['III'][0] = 1,5882 → 49.964,36 €
   *   − Bonificación Canarias Grupo III (0,999) → 49,96 €
   *
   * Y con los DOS requisitos cumplidos (66 años y convivencia) la reducción sí entra:
   *   Base liquidable = 300.000 − 7.993,46 − 122.606,47 = 169.400,07
   *   Cuota íntegra = 7.127,47 + (169.400,07 − 79.881,18) × 10,20 % = 16.258,39678
   *   × 1,5882 = 25.821,58... → × 0,001 = «25,82 €»
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
    await casilla(page, 'viviendaHabitual', true);
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
    await casilla(page, 'viviendaHabitual', false);
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
   * GUARDA — el desplegable de parentesco y los botones de casos (hallazgos 205 y 206).
   *
   * Antes había dos opciones que compartían grupo y clave de reducción («Hermano / Tío /
   * Sobrino» y «Pariente lejano (Grupo III)»), así que devolvían el mismo resultado y el
   * sobrino aparecía nombrado en las dos; y «Cónyuge / Hijo / Descendiente ≥21» iba
   * rotulada Grupo II leyendo la fila `I-conyuge`. En régimen común da igual (las cuatro
   * filas valen 15.956,87 €) pero en Cataluña NO: `REDUCCIONES_PARENTESCO_CATALUNA_IS`
   * declara 100.000 € para el cónyuge y 50.000 € para el hijo ≥21.
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
    await casilla(page, 'viviendaHabitual', false);

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

  // ══════════════════════════════════════════════════════════════════════════
  // RE-INSPECCIÓN 27/08/2026 — lo que la ronda anterior no miró
  // ══════════════════════════════════════════════════════════════════════════

  /**
   * CASO 4 (NORMAL) — el primer botón de la página, que es lo que pulsa la mayoría, con
   * los tres impuestos encadenados: «Hijo hereda piso 200k en Madrid».
   *
   * Parámetros del caso preconfigurado (CASOS[0] en page.tsx): hijo de 45 años, Madrid,
   * adquisición en 1995 por 80.000 €, valor de referencia 200.000 €, suelo catastral
   * 60.000 € sobre 120.000 € de catastral total, vivienda habitual, venta a los 5 años por
   * 250.000 €.
   *
   * ISD:
   *   200.000 − 15.956,87 − mín(190.000; 122.606,47) = 61.436,66 de base liquidable
   *   Cuota íntegra = 2.648,88 + (61.436,66 − 31.956,87) × 9,35 % = 5.405,240365
   *   × 1,0000 → − 99 % (madrid…['II'].porcentaje) = 54,05240365 → «54,05 €»
   *
   * Plusvalía: 1995 son 31 años, pero COEFICIENTES_IIVTNU_2025 se topa en «20 o más» →
   *   coeficiente 0,45 y el panel debe rotular «20 años de tenencia» aunque el deslizador
   *   diga «(31 años hasta hoy)»: son dos cosas distintas y las dos son correctas.
   *   objetivo = 60.000 × 0,45 × 0,25 = 6.750,00
   *   real     = (200.000 − 80.000) × (60.000 / 120.000) × 0,25 = 15.000,00 → gana el objetivo
   *
   * IRPF a los 5 años:
   *   Valor de adquisición fiscal = 200.000 + 54,05240365 + 6.750 = 206.804,05240365
   *   Ganancia = 250.000 − 206.804,05240365 = 43.195,94759635
   *        6.000,00000000 × 19 % = 1.140,00
   *       37.195,94759635 × 21 % = 7.811,148995...
   *                                ─────────────
   *                                 8.951,148995... → «8951,15 €»
   *
   * TOTAL = 54,05240365 + 6.750 + 8.951,148995 = 15.755,20139... → «15.755,20 €»
   * y 15.755,20139 / 250.000 = 6,3020... → «6,30 %»
   */
  test('CASO 4 (normal) — el caso preconfigurado de Madrid: 54,05 € + 6750,00 € + 8951,15 € = 15.755,20 €', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Hijo hereda piso 200k en Madrid/ }).click();

    expect(await panel(page, ISD)).toContain('Comunidad de Madrid — Grupo II');
    expect(await linea(page, ISD, '= Base liquidable')).toBe('61.436,66 €');
    expect(await linea(page, ISD, 'Cuota íntegra (tarifa)')).toBe('5405,24 €');
    expect(await panel(page, ISD)).toContain('Bonificación CCAA (99,0%)');
    expect(await linea(page, ISD, 'Cuota ISD final')).toBe('54,05 €');

    // La tenencia real es de 31 años; la tabla del IIVTNU se topa en «20 o más» (0,45)
    expect(await page.locator('label[for="anioAdq"]').innerText()).toContain(
      `(${ANIO - 1995} años hasta hoy)`
    );
    expect(await panel(page, IIVTNU)).toContain('20 años de tenencia');
    expect(await linea(page, IIVTNU, 'Coeficiente 20 años')).toBe('0,45');
    expect(await linea(page, IIVTNU, 'Método objetivo')).toBe('6750,00 €');
    expect(await linea(page, IIVTNU, 'Método real (suelo)')).toBe('15.000,00 €');
    expect(await linea(page, IIVTNU, 'Cuota plusvalía municipal')).toBe('6750,00 €');

    expect(await linea(page, IRPF, 'Valor adquisición fiscal*')).toBe('206.804,05 €');
    expect(await linea(page, IRPF, 'Ganancia patrimonial')).toBe('43.195,95 €');
    expect(await linea(page, IRPF, 'Cuota IRPF venta')).toBe('8951,15 €');

    const total = await bloqueTotal(page);
    expect(total).toContain('15.755,20');
    expect(total).toContain('6,30%');
  });

  /**
   * CASO 5 (LÍMITE + RECHAZO) — la base liquidable que se queda en CERO y la entrada basura.
   *
   *  a) Con el mínimo del deslizador (50.000 €) y vivienda habitual, las reducciones son
   *     mayores que la base: 50.000 − 15.956,87 − (50.000 × 0,95 = 47.500) = −13.456,87.
   *     `Math.max(0, …)` la deja en 0,00 € y `calcularCuotaIntegraIS` devuelve 0 para una
   *     base no positiva: ninguna cuota puede salir negativa.
   *     La reducción de vivienda aquí es el 95 % (47.500) y NO el tope (122.606,47): el
   *     tope solo muerde por encima de 129.059,44 € de valor de referencia.
   *
   *  b) La app no tiene ningún campo de texto —todo son deslizadores y desplegables—, así
   *     que el «texto basura» solo puede entrar forzando el valor del `input[type=range]`.
   *     El saneado del navegador lo devuelve al valor por defecto (mitad del recorrido) o
   *     al extremo, y la app nunca llega a ver un NaN. Se comprueba que no aparece ni
   *     «NaN» ni «Infinity» ni «undefined» en ninguna parte de la página.
   */
  test('CASO 5 (límite y rechazo) — base liquidable cero por exceso de reducciones, y basura en los deslizadores', async ({
    page,
  }) => {
    await page.goto(RUTA);

    await page.selectOption('#parentescoSel', 'hijo');
    await page.selectOption('#ccaaSel', 'madrid');
    await mover(page, 'valorRef', 50000); // mínimo del deslizador
    await casilla(page, 'viviendaHabitual', true);
    await mover(page, 'aniosVenta', 0);

    expect(await linea(page, ISD, '− Reducción parentesco')).toBe('−15.956,87 €');
    expect(await linea(page, ISD, '− Reducción vivienda habitual (95%)')).toBe('−47.500,00 €');
    expect(await linea(page, ISD, '= Base liquidable')).toBe('0,00 €');
    expect(await linea(page, ISD, 'Cuota íntegra (tarifa)')).toBe('0,00 €');
    expect(await linea(page, ISD, 'Cuota ISD final')).toBe('0,00 €');

    // Basura en tres deslizadores a la vez: texto, negativo fuera de rango y NaN literal
    await mover(page, 'valorRef', 'texto');
    await mover(page, 'valorSuelo', '-99999');
    await mover(page, 'edadHer', 'NaN');

    const valores = await page.evaluate(() => ({
      valorRef: (document.getElementById('valorRef') as HTMLInputElement).value,
      valorSuelo: (document.getElementById('valorSuelo') as HTMLInputElement).value,
      edadHer: (document.getElementById('edadHer') as HTMLInputElement).value,
    }));
    // El saneado del navegador: valor por defecto (mitad del recorrido) o extremo del rango
    expect(valores.valorRef).toBe('1025000'); // (50.000 + 2.000.000) / 2
    expect(valores.valorSuelo).toBe('5000'); // mínimo del deslizador
    expect(valores.edadHer).toBe('54'); // (18 + 90) / 2

    const cuerpo = await page.locator('body').innerText();
    expect(cuerpo).not.toContain('NaN');
    expect(cuerpo).not.toContain('Infinity');
    expect(cuerpo).not.toContain('undefined');

    // Y el cálculo sigue en pie con el valor saneado:
    // 1.025.000 − 15.956,87 − 122.606,47 = 886.436,66 → tramo del 25,50 %
    // 132.549,07 + (886.436,66 − 797.555,08) × 25,50 % = 155.213,8729 → −99 % = 1552,14 €
    expect(await linea(page, ISD, '= Base liquidable')).toBe('886.436,66 €');
    expect(await linea(page, ISD, 'Cuota íntegra (tarifa)')).toBe('155.213,87 €');
    expect(await linea(page, ISD, 'Cuota ISD final')).toBe('1552,14 €');
  });

  /**
   * WEB ↔ MCP (1/3) — el caso del hallazgo 276, que es el que reabrió la cola: CERRADO.
   *
   * `85f2c03f` se titula «la misma herencia ya no vale 0 € en la web y 10.346 € por MCP».
   * Aquella divergencia salía de que `lib/calculadoras/sucesiones.ts` rotulaba la reducción
   * en base de Asturias pero no la restaba. Se comprueba aquí sobre el motor compartido —el
   * mismo que ejecutan las tools `calcular_sucesiones` y `consulta_herencia` del MCP Delegum
   * (`app/api/mcp/delegum/route.ts`)— y sobre la web, con la misma entrada.
   *
   * Verificado además contra el endpoint vivo el 27/08/2026:
   *   POST http://localhost:3050/api/mcp/delegum · calcular_sucesiones
   *   { valor_herencia: 250000, ccaa: 'asturias', grupo_parentesco: 'II',
   *     vivienda_habitual: 250000 } → «Cuota a pagar: 0,00 €», base liquidable 0,00 €.
   */
  test('WEB ↔ MCP (1/3) — Asturias, hijo, 250.000 € de vivienda habitual: los dos dicen 0,00 € (hallazgo 276 cerrado)', async ({
    page,
  }) => {
    await page.goto(RUTA);

    await page.selectOption('#parentescoSel', 'hijo');
    await page.selectOption('#ccaaSel', 'asturias');
    await mover(page, 'edadHer', 45);
    await mover(page, 'valorRef', 250000);
    await casilla(page, 'viviendaHabitual', true);
    await mover(page, 'aniosVenta', 0);

    expect(await linea(page, ISD, '− Reducción autonómica (Principado de Asturias)')).toBe(
      '−300.000,00 €'
    );
    expect(await linea(page, ISD, '= Base liquidable')).toBe('0,00 €');
    const web = importe(await linea(page, ISD, 'Cuota ISD final'));
    expect(web).toBe(0);

    const mcp = calcularSucesion({
      baseImponible: 250000,
      ccaa: 'asturias',
      grupo: 'II',
      viviendaHabitual: 250000,
    });
    expect(mcp.reduccionAutonomicaBase).toBe(300000);
    expect(mcp.baseLiquidable).toBe(0);
    expect(mcp.cuotaFinal).toBe(web);
  });

  /**
   * WEB ↔ MCP (2/3) — REPARADO el 27/08/2026. La reducción por vivienda habitual en CATALUÑA.
   *
   * Es el caso preconfigurado nº 2 de la propia app («Cónyuge hereda piso 350k en
   * Cataluña»), así que basta con pulsar su botón para reproducirlo.
   *
   * Hasta el 27/08/2026 la web aplicaba aquí la reducción ESTATAL del art. 20.2.c
   * (122.606,47 €) y el motor compartido no aplicaba ninguna: la misma herencia valía
   * 12.013,29 € por la web y 31.500,00 € por MCP, 19.486,71 € de diferencia.
   *
   * ⚠️ Y no acertaba ninguno de los dos. Cataluña tiene régimen PROPIO de reducción por
   * vivienda habitual (Ley 19/2010), con topes distintos del estatal: aplicarle los
   * 122.606,47 € es inventarse una cifra que no es la suya. La reparación unifica los dos
   * caminos en `evaluarReduccionVivienda` y resuelve Cataluña como el clúster de
   * compraventa resuelve el IGIC: no se calcula lo que no está modelado, y se DICE. Modelar
   * el régimen catalán exige fuente oficial y no cabe en una ronda de reparación.
   *
   *   350.000 − 100.000 (CATALUNA['I-conyuge']) = 250.000 de base liquidable
   *   14.500 + (250.000 − 150.000) × 17 % = 31.500,00 €, por los dos caminos.
   */
  test('WEB ↔ MCP (2/3) — Cataluña, cónyuge, 350.000 €: la web y el MCP dicen los mismos 31.500,00 €', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Cónyuge hereda piso 350k en Cataluña/ }).click();
    await mover(page, 'aniosVenta', 0);

    expect(await linea(page, ISD, '− Reducción parentesco')).toBe('−100.000,00 €');
    // No se aplica ninguna reducción de vivienda, y la app dice por qué en vez de callarlo
    expect(await linea(page, ISD, 'Reducción vivienda habitual')).toContain('Cataluña tiene su propia reducción');
    expect(await linea(page, ISD, '= Base liquidable')).toBe('250.000,00 €');
    expect(await linea(page, ISD, 'Cuota ISD final')).toBe('31.500,00 €');

    const mcp = calcularSucesion({
      baseImponible: 350000,
      ccaa: 'cataluna',
      grupo: 'I-conyuge',
      viviendaHabitual: 350000,
    });
    expect(mcp.reduccionVivienda).toBe(0);
    expect(mcp.reduccionViviendaNoAplicada).toContain('Ley 19/2010');
    expect(mcp.baseLiquidable).toBe(250000);
    expect(mcp.cuotaFinal).toBe(31500);
    // Y la paridad, que es lo que este test existe para sujetar
    expect(mcp.cuotaFinal).toBe(importe(await linea(page, ISD, 'Cuota ISD final')));
  });

  /**
   * WEB ↔ MCP (3/3) — REPARADO el 27/08/2026. Los requisitos del COLATERAL (Grupo III).
   *
   * La reparación del hallazgo 204 —el art. 20.2.c LISD reserva la reducción del 95 % al
   * colateral mayor de 65 años que convivió con el causante los 2 años anteriores— había
   * aterrizado SOLO en `page.tsx`: el motor compartido se la concedía a todo el Grupo III
   * sin condición y la tool `calcular_sucesiones` ni siquiera aceptaba la edad, así que por
   * MCP el requisito no es que se incumpliera, es que no se podía expresar. Aquí la que
   * acertaba era la web; ahora la regla vive UNA sola vez, en `evaluarReduccionVivienda`,
   * y la tool expone `edad_heredero` y `convivio_dos_anios`.
   *
   *   Hermano de 40 años, Madrid, 200.000 € que eran la vivienda habitual del fallecido:
   *   WEB:  no reduce (no cumple los requisitos) → base liquidable 192.006,54
   *         7.127,47 + (192.006,54 − 79.881,18) × 10,20 % = 18.564,25672
   *         × 1,5882 = 29.483,7525 → − 50 % (madrid…['III']) = «14.741,88 €»
   *   MCP:  reduce 122.606,47 → base liquidable 69.400,07
   *         2.648,88 + (69.400,07 − 31.956,87) × 9,35 % = 6.149,82
   *         × 1,5882 = 9.767,14 → − 50 % = 4.883,57 €
   *   Diferencia: 9.858,31 €, tres veces la cuota que anuncia el MCP.
   */
  test('WEB ↔ MCP (3/3) — colateral de 40 años que no convivió: la web y el MCP dicen los mismos 14.741,88 €', async ({
    page,
  }) => {
    await page.goto(RUTA);

    await page.selectOption('#parentescoSel', 'hermano');
    await page.selectOption('#ccaaSel', 'madrid');
    await mover(page, 'edadHer', 40);
    await mover(page, 'valorRef', 200000);
    await casilla(page, 'viviendaHabitual', true);
    await mover(page, 'aniosVenta', 0);

    // Lo que hoy pinta la web (guarda literal del criterio del art. 20.2.c)
    expect(await linea(page, ISD, 'Reducción vivienda habitual')).toBe(
      'No aplicable: pariente colateral menor de 65 años'
    );
    expect(await linea(page, ISD, '= Base liquidable')).toBe('192.006,54 €');
    expect(await linea(page, ISD, 'Cuota ISD final')).toBe('14.741,88 €');

    const mcp = calcularSucesion({
      baseImponible: 200000,
      ccaa: 'madrid',
      grupo: 'III',
      edadHeredero: 40,
      viviendaHabitual: 200000,
    });
    // El motor compartido comprueba ya los dos requisitos del art. 20.2.c
    expect(mcp.reduccionVivienda).toBe(0);
    expect(mcp.reduccionViviendaNoAplicada).toBe('pariente colateral menor de 65 años');
    expect(mcp.baseLiquidable).toBe(192006.54);
    expect(mcp.cuotaFinal).toBe(importe(await linea(page, ISD, 'Cuota ISD final')));

    // Y con los dos requisitos cumplidos SÍ reduce: 65 años y convivencia acreditada
    const conDerecho = calcularSucesion({
      baseImponible: 200000,
      ccaa: 'madrid',
      grupo: 'III',
      edadHeredero: 70,
      convivenciaDosAnios: true,
      viviendaHabitual: 200000,
    });
    expect(conDerecho.reduccionVivienda).toBe(122606.47);
    expect(conDerecho.reduccionViviendaNoAplicada).toBeNull();
    expect(conDerecho.baseLiquidable).toBe(69400.07);
    expect(conDerecho.cuotaFinal).toBe(4883.57);
  });

  /**
   * GUARDA — el tramo del 30 % del IRPF, el más alto de
   * `TRAMOS_GANANCIAS_PATRIMONIALES_2025`, y la edad del heredero que NO exime.
   *
   * Caso preconfigurado de Madrid pero vendiendo por el tope del deslizador (2.000.000 €):
   *   Valor de adquisición fiscal = 200.000 + 54,05240365 + 6.750 = 206.804,05240365
   *   Ganancia = 2.000.000 − 206.804,05240365 = 1.793.195,94759635
   *          6.000,00 × 19 % =   1.140,00
   *         44.000,00 × 21 % =   9.240,00
   *        150.000,00 × 23 % =  34.500,00
   *        100.000,00 × 27 % =  27.000,00
   *      1.493.195,95 × 30 % = 447.958,784278...
   *                            ──────────────
   *                             519.838,784278... → «519.838,78 €»
   *
   * Con la escala que describe el `faqJsonLd` («27 % por encima» de 200.000 €) saldrían
   * 475.042,91 €: 44.795,88 € menos. Manda `data/fiscal`, que es lo que aplica el motor.
   *
   * Y con 90 años el heredero sigue pagando: la app no modela ninguna exención de IRPF
   * (ni la del art. 33.4.b LIRPF ni la del art. 38), pese a lo que dice el `faqJsonLd`.
   */
  test('GUARDA — el tramo del 30 % del IRPF entra de verdad: ganancia de 1.793.195,95 € → 519.838,78 €', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Hijo hereda piso 200k en Madrid/ }).click();
    await mover(page, 'valorVta', 2000000);

    expect(await linea(page, IRPF, 'Valor adquisición fiscal*')).toBe('206.804,05 €');
    expect(await linea(page, IRPF, 'Ganancia patrimonial')).toBe('1.793.195,95 €');
    expect(await linea(page, IRPF, 'Cuota IRPF venta')).toBe('519.838,78 €');
    expect(await panel(page, IRPF)).toContain('Tramos: 19% / 21% / 23% / 27% / 30%');

    // La edad del heredero no exime nada en el IRPF de esta app
    await mover(page, 'edadHer', 90);
    await mover(page, 'valorVta', 250000);
    expect(await linea(page, IRPF, 'Cuota IRPF venta')).toBe('8951,15 €');
  });

  /**
   * REPARADO 27/08/2026 — el `faqJsonLd` de metadata.ts se había quedado contando una escala del ahorro que la
   * app no aplica: «19% hasta 6.000 €, 21% de 6.000 a 50.000 €, 23% de 50.000 a 200.000 € y
   * 27% por encima». `TRAMOS_GANANCIAS_PATRIMONIALES_2025` tiene CINCO tramos (27 % hasta
   * 300.000 y 30 % en adelante) y el propio bloque educativo de la página los enumera bien.
   *
   * No es cosmético: el FAQPage es la señal estructurada que leen Bing Copilot, ChatGPT,
   * Perplexity y Gemini, y aquí describe mal la escala de un impuesto en una app de nivel 1
   * CRÍTICO. Sobre la ganancia de 1.793.195,95 € de la guarda anterior, la regla del
   * `faqJsonLd` daría 475.042,91 € y el motor liquida 519.838,78 €.
   */
  test('REGRESIÓN — el faqJsonLd sirve los cinco tramos de la base del ahorro', async ({
    page,
  }) => {
    await page.goto(RUTA);

    const faq = await faqServida(page);
    expect(faq).toHaveLength(5);
    const irpf = faq.find(q => q.name.includes('IRPF'));
    expect(irpf).toBeDefined();
    const respuesta = irpf!.acceptedAnswer.text;

    // La escala ya no se escribe: se DERIVA de TRAMOS_GANANCIAS_PATRIMONIALES_2025, así que
    // el día que data/fiscal cambie, el texto servido a las IAs cambia con él.
    expect(respuesta).toContain('27% de 200.000 € a 300.000 €');
    expect(respuesta).toContain('30% a partir de 300.000 €');
    expect(respuesta).not.toContain('27% por encima');
  });

  /**
   * REPARADO 27/08/2026 — el mismo `faqJsonLd` anunciaba una exención de IRPF que ni la app aplica ni
   * `data/fiscal` reconoce en esos términos: «Si la vivienda era habitual del fallecido y el
   * heredero es mayor de 65 años o la reinvierte en su propia vivienda habitual, puede
   * quedar exenta».
   *
   * `data/fiscal/ganancia-inmueble.ts` documenta las dos exenciones y las condiciona a la
   * vivienda habitual DEL TRANSMITENTE: «Mayores de 65 años que transmiten SU vivienda
   * habitual (art. 33.4.b LIRPF)» y «Reinversión en vivienda habitual (art. 38 LIRPF)».
   * Que la vivienda fuera la habitual del FALLECIDO es el requisito del ISD (art. 20.2.c
   * LISD), no el del IRPF: el texto mezcla los dos impuestos. Y la app, coherente con
   * `data/fiscal`, cobra el IRPF íntegro a un heredero de 90 años (guarda anterior).
   */
  test('REGRESIÓN — el faqJsonLd no atribuye la exención de IRPF a la vivienda habitual del FALLECIDO', async ({
    page,
  }) => {
    await page.goto(RUTA);

    const faq = await faqServida(page);
    const irpf = faq.find(q => q.name.includes('IRPF'));
    const respuesta = irpf!.acceptedAnswer.text;

    expect(respuesta).not.toContain('la vivienda era habitual del fallecido y el heredero es mayor de 65');
    // Y dice de quién se mira la vivienda habitual en cada impuesto, que es lo que se cruzaba
    expect(respuesta).toContain('DEL QUE VENDE');
    expect(respuesta).toContain('art. 20.2.c LISD');
  });

  /**
   * GUARDA — el escalonado de Castilla-La Mancha, que es el único del catálogo con cinco
   * peldaños. `BONIFICACIONES_CCAA_IS['castilla-mancha']…['II'].escalonado` = 100 % hasta
   * 175.000 · 95 % hasta 225.000 · 90 % hasta 275.000 · 85 % hasta 300.000 · 80 % por encima.
   *
   *  (a) 500.000 € de vivienda habitual → base liquidable 361.436,66 → peldaño del 80 %
   *      Cuota íntegra = 23.409,28 + (361.436,66 − 239.389,13) × 15,30 % = 42.082,55209
   *      Cuota final = 42.082,55209 × 0,20 = 8.416,510418 → «8416,51 €»
   *  (b) 400.000 € → base liquidable 261.436,66 → peldaño del 90 %
   *      Cuota íntegra = 23.409,28 + 22.047,53 × 15,30 % = 26.782,55209
   *      Cuota final = 26.782,55209 × 0,10 = 2.678,255209 → «2678,26 €»
   */
  test('GUARDA — Castilla-La Mancha baja del 90 % al 80 % al pasar de 300.000 € de base liquidable', async ({
    page,
  }) => {
    await page.goto(RUTA);

    await page.selectOption('#parentescoSel', 'hijo');
    await page.selectOption('#ccaaSel', 'castilla-mancha');
    await mover(page, 'edadHer', 45);
    await casilla(page, 'viviendaHabitual', true);
    await mover(page, 'aniosVenta', 0);

    await mover(page, 'valorRef', 500000);
    expect(await linea(page, ISD, '= Base liquidable')).toBe('361.436,66 €');
    expect(await panel(page, ISD)).toContain('Bonificación CCAA (80,0%)');
    expect(await linea(page, ISD, 'Cuota ISD final')).toBe('8416,51 €');

    await mover(page, 'valorRef', 400000);
    expect(await linea(page, ISD, '= Base liquidable')).toBe('261.436,66 €');
    expect(await panel(page, ISD)).toContain('Bonificación CCAA (90,0%)');
    expect(await linea(page, ISD, 'Cuota ISD final')).toBe('2678,26 €');
  });

  /**
   * REPARADO 27/08/2026 — la tarjeta educativa «Hijo hereda piso vivienda habitual del padre» listaba
   * Castilla-La Mancha entre las «CCAA con bonificación 99%» donde «el ISD se reduce a casi
   * cero». `data/fiscal` dice otra cosa: la de Castilla-La Mancha es ESCALONADA y baja al
   * 80 % por encima de 300.000 € de base liquidable, así que el motor de la misma página
   * cobra 8.416,51 € en el caso de la guarda anterior. Mismo patrón que el hallazgo 275: la
   * prosa contando una versión que el motor no calcula.
   *
   * (Cantabria y Aragón están en la misma lista con la misma imprecisión —exención total
   * hasta 100.000 € y hasta 3.000.000 € respectivamente, no un 99 %— pero ahí el texto se
   * queda corto a favor del contribuyente; Canarias, que es la más generosa del régimen
   * común con su 99,9 % para los Grupos I, II y III, no aparece.)
   */
  // ⚠️ Este test se REESCRIBIÓ al reparar. Su «esperado» era que la tarjeta no nombrase a
  // Castilla-La Mancha, pero la reparación correcta no es borrarla: es dejar de meterla en
  // la lista de las que bonifican casi al 100 % y decir que la suya baja por tramos. Así que
  // lo que se comprueba es lo que de verdad protege: que la lista de comunidades coincida
  // con las que `BONIFICACIONES_CCAA_IS` bonifica al 99 % o más con porcentaje FIJO.
  test('REGRESIÓN — la lista de CCAA que bonifican casi al 100 % sale de los datos, no de la memoria', async ({
    page,
  }) => {
    await page.goto(RUTA);

    const tarjeta = await page.evaluate(() => {
      const h4 = [...document.querySelectorAll('h4')].find(h =>
        (h.textContent ?? '').includes('Hijo hereda piso')
      );
      return (h4?.parentElement?.textContent ?? '').replace(/\s+/g, ' ').trim();
    });

    const casiTotal = Object.values(BONIFICACIONES_CCAA_IS)
      .filter(c => typeof c.bonificaciones['II']?.porcentaje === 'number' && (c.bonificaciones['II'].porcentaje as number) >= 0.99)
      .map(c => c.nombre);

    // Canarias (99,9 %) es la más generosa del régimen común y antes no aparecía
    expect(casiTotal).toContain('Canarias');
    for (const nombre of casiTotal) expect(tarjeta).toContain(nombre);

    // Castilla-La Mancha NO bonifica un porcentaje fijo: baja al 80 % por encima de 300.000 €
    expect(casiTotal).not.toContain('Castilla-La Mancha');
    expect(tarjeta).toContain('por tramos');
    expect(tarjeta).toContain('80%');
  });
});
