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
 * ⚠️ ESTADO A 09/09/2026 — NO queda ni un `test.fail()` en el fichero. Los tres «HALLAZGOS
 * ABIERTOS» que enumera la cabecera de arriba se cerraron el 08/09/2026, y los TRES de la
 * inspección del 07/09/2026 —que van al final del todo— están reparados: el ALTO (656, la
 * escala de recargo derogada de la FAQ del plazo) el 08/09/2026, y el MEDIO 657 (el
 * desglose impreso que no cuadraba consigo mismo) y el BAJO 658 (datos normativos
 * tecleados que el mismo fichero ya deriva) el 09/09/2026. Sus tests quedan como REGRESIÓN.
 *
 * ⚠️ 09/09/2026 — al cerrar el hallazgo 657, la app redondea al céntimo CADA importe de la
 * liquidación del ISD —igual que `calcularSucesion`— en vez de arrastrar el número largo y
 * redondear solo al pintar. Seis cifras esperadas de los tests anteriores se movieron un
 * céntimo por eso, y va dicho en el comentario de cada uno. El IRPF de los casos que venden
 * también se mueve, porque el valor de adquisición fiscal suma la cuota de ISD PAGADA, que
 * es la redondeada.
 *
 * ⚠️ 24/08/2026 — las cuotas íntegras de TODOS los casos cambiaron al cerrar el hallazgo
 * 277: la app aplica ya la COLUMNA `cuota` de la tabla oficial (`calcularCuotaIntegraIS`,
 * compartido con el MCP y los dos estimadores) en vez de acumular los tramos marginales,
 * que era su lectura propia y la única del repositorio que hacía eso.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { test, expect, Page } from '@playwright/test';
import { calcularSucesion } from '../../lib/calculadoras/sucesiones';
import { BONIFICACIONES_CCAA_IS } from '../../data/fiscal';
import {
  ESCALA_RECARGO_EXTEMPORANEO,
  porcentajeRecargoExtemporaneo,
} from '../../lib/calculadoras/recargoPresentacionTardia';

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
   *   Valor de adquisición fiscal = 500.000 + 5.405,24 + 4.000 = 509.405,24
   *   (la cuota de ISD entra ya redondeada al céntimo desde el hallazgo 657: es la que se paga)
   *   Ganancia = 600.000 − 509.405,24 = 90.594,76
   *        6.000,00 × 19 % =  1.140,00
   *       44.000,00 × 21 % =  9.240,00
   *       40.594,76 × 23 % =  9.336,7948
   *                           ──────────
   *                            19.716,7948 → «19.716,79 €»
   *
   * TOTAL = 5.405,24 + 4.000 + 19.716,7948 = 29.122,0348 → «29.122,03 €»
   * (hasta el 09/09/2026 eran «29.122,04 €», que no era la suma de los tres importes escritos)
   * Porcentaje sobre la venta = 29.122,0348/600.000 × 100 = 4,8537 → «4,85 %»
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
    expect(total).toContain('29.122,03'); // 5.405,24 + 4.000,00 + 19.716,79 (hallazgo 657)
    expect(total).toContain('4,85%');
    expect(total).not.toMatch(/29,122\.03/); // nunca formato US

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
   *   × COEFICIENTES_IS['IV'][0] = 2,0000 → 439.172,52 × 2 = 878.345,04 → «878.345,04 €»
   *   Asturias no bonifica → Cuota ISD final = 878.345,04 €
   *   (hasta el 09/09/2026 la pantalla decía «878.345,05 €», que es 439.172,5246 × 2 sin
   *    redondear el factor que ella misma escribe: exactamente el hallazgo 657)
   *
   *   Plusvalía: 0 años → COEFICIENTES_IIVTNU_2025[0] = 0,14
   *     objetivo = 500.000 × 0,14 × 0,25 = 17.500,00
   *     real     = (2.000.000 − 30.000) × (500.000 / 1.000.000) × 0,25 = 246.250,00
   *   TOTAL (sin venta) = 878.345,04 + 17.500 = 895.845,04 → «895.845,04 €»
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
    // 439.172,52 × 2,0000 = 878.345,04 — la cadena impresa cuadra desde el hallazgo 657
    expect(await linea(page, ISD, '= Cuota tributaria')).toBe('878.345,04 €');
    expect(await linea(page, ISD, 'Cuota ISD final')).toBe('878.345,04 €');
    // El Grupo IV de Asturias declara reduccionBase 0: no debe aparecer la línea autonómica
    expect(await panel(page, ISD)).not.toContain('Reducción autonómica');

    expect(await panel(page, IIVTNU)).toContain('0 años de tenencia');
    expect(await linea(page, IIVTNU, 'Coeficiente 0 años')).toBe('0,14');
    expect(await linea(page, IIVTNU, 'Método objetivo')).toBe('17.500,00 €');
    expect(await linea(page, IIVTNU, 'Método real (suelo)')).toBe('246.250,00 €');
    expect(await linea(page, IIVTNU, 'Cuota plusvalía municipal')).toBe('17.500,00 €');

    expect(await bloqueTotal(page)).toContain('895.845,04');
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
  test('GUARDA — siete parentescos distintos, Cataluña separa cónyuge, hijo y nieto, y ningún botón sin type', async ({
    page,
  }) => {
    await page.goto(RUTA);

    // Siete opciones, ninguna repetida ni con el mismo significado. La sexta es el Grupo I
    // (descendientes menores de 21), que hasta el hallazgo 612 no era expresable; la séptima
    // es el NIETO ≥21, que hasta el 08/09/2026 compartía opción con el hijo y le hacía
    // reducir sus 50.000 € en vez de los 100.000 € del hijo.
    const opciones = await page.locator('#parentescoSel option').allTextContents();
    expect(opciones).toHaveLength(7);
    expect(new Set(opciones).size).toBe(7);
    expect(opciones).toContain('Hijo o descendiente <21 años (Grupo I)');

    // Las 17 CCAA que promete la metadata
    expect(await page.locator('#ccaaSel option').count()).toBe(17);

    // Ningún <button> de la página sin atributo type (los 4 casos preconfigurados incluidos)
    const sinType = await page.evaluate(
      () =>
        [...document.querySelectorAll('button')].filter(b => !b.getAttribute('type')).length
    );
    expect(sinType).toBe(0);

    // Cataluña (art. 2 Ley 19/2010): cónyuge e hijo reducen 100.000 €, el resto de
    // descendientes 50.000 € y los ascendientes 30.000 €. Las cuatro filas son distintas y
    // el desplegable tiene que poder expresarlas: mientras hijo y nieto compartían opción,
    // uno de los dos salía mal por fuerza.
    await page.selectOption('#ccaaSel', 'cataluna');
    await mover(page, 'valorRef', 350000);
    await mover(page, 'aniosVenta', 0);

    await page.selectOption('#parentescoSel', 'conyuge');
    expect(await linea(page, ISD, '− Reducción parentesco')).toBe('−100.000,00 €');

    await page.selectOption('#parentescoSel', 'hijo');
    expect(await linea(page, ISD, '− Reducción parentesco')).toBe('−100.000,00 €');

    await page.selectOption('#parentescoSel', 'nieto');
    expect(await linea(page, ISD, '− Reducción parentesco')).toBe('−50.000,00 €');

    await page.selectOption('#parentescoSel', 'padre');
    expect(await linea(page, ISD, '− Reducción parentesco')).toBe('−30.000,00 €');
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
    // El deslizador arranca en 0 desde el hallazgo 612 (el Grupo I son los menores de 21).
    expect(valores.edadHer).toBe('45'); // (0 + 90) / 2

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
   * ⚠️ Y no acertaba ninguno de los dos. La reparación del 27/08/2026 unificó los dos caminos
   * en `evaluarReduccionVivienda` y resolvió Cataluña como el clúster de compraventa resuelve
   * el IGIC: no se calcula lo que no está modelado, y se DICE.
   *
   * ⚠️ 08/09/2026 — eso ya no vale, y el motivo está en `tests/sucesiones-cataluna-motor.spec.ts`:
   * el aviso iba debajo de una cifra que se pasaba de largo, y el régimen catalán no era tal
   * régimen sino tres cifras publicadas (95 %, tope de 500.000 € sobre el valor conjunto,
   * mínimo individual de 180.000 €). Ahora se calcula, y el escenario de la app se queda en
   * cero: 332.500 € de vivienda más 100.000 € de parentesco se comen los 350.000 € de base.
   * Por eso el test añade después un caso con base positiva — una paridad de 0 contra 0
   * sujetaría muy poco.
   */
  test('WEB ↔ MCP (2/3) — Cataluña, cónyuge, 350.000 €: la web y el MCP dicen los mismos 0,00 €', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Cónyuge hereda piso 350k en Cataluña/ }).click();
    await mover(page, 'aniosVenta', 0);

    expect(await linea(page, ISD, '− Reducción parentesco')).toBe('−100.000,00 €');
    // 95 % de 350.000 = 332.500, por debajo del tope catalán de 500.000
    expect(await linea(page, ISD, '− Reducción vivienda habitual (95%)')).toBe('−332.500,00 €');
    expect(await linea(page, ISD, '= Base liquidable')).toBe('0,00 €');
    expect(await linea(page, ISD, 'Cuota ISD final')).toBe('0,00 €');

    const mcp = calcularSucesion({
      baseImponible: 350000,
      ccaa: 'cataluna',
      grupo: 'I-conyuge',
      viviendaHabitual: 350000,
    });
    expect(mcp.reduccionVivienda).toBe(332500);
    expect(mcp.reduccionViviendaNoAplicada).toBeNull();
    expect(mcp.baseLiquidable).toBe(0);
    expect(mcp.cuotaFinal).toBe(0);
    expect(mcp.cuotaFinal).toBe(importe(await linea(page, ISD, 'Cuota ISD final')));

    // Y la misma paridad donde sí queda cuota, con el TOPE catalán mordiendo: vivienda de
    // 900.000 € → 95 % son 855.000, topados en 500.000. Base = 900.000 − 100.000 − 500.000
    // = 300.000 → 14.500 + (300.000 − 150.000) × 17 % = 40.000,00 € de cuota íntegra, y el
    // 99 % del art. 58 bis que le corresponde al cónyuge la deja en 400,00 €.
    await mover(page, 'valorRef', 900000);
    expect(await linea(page, ISD, '− Reducción vivienda habitual (95%)')).toBe('−500.000,00 €');
    expect(await linea(page, ISD, 'Cuota íntegra (tarifa)')).toBe('40.000,00 €');
    expect(await linea(page, ISD, 'Cuota ISD final')).toBe('400,00 €');

    const mcpTope = calcularSucesion({
      baseImponible: 900000,
      ccaa: 'cataluna',
      grupo: 'I-conyuge',
      viviendaHabitual: 900000,
    });
    expect(mcpTope.reduccionVivienda).toBe(500000);
    expect(mcpTope.porcentajeBonificacion).toBe(99);
    expect(mcpTope.cuotaFinal).toBe(400);
    expect(mcpTope.cuotaFinal).toBe(importe(await linea(page, ISD, 'Cuota ISD final')));
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
   *   Valor de adquisición fiscal = 200.000 + 54,05 + 6.750 = 206.804,05
   *   (la cuota de ISD entra ya redondeada al céntimo desde el hallazgo 657)
   *   Ganancia = 2.000.000 − 206.804,05 = 1.793.195,95
   *          6.000,00 × 19 % =   1.140,00
   *         44.000,00 × 21 % =   9.240,00
   *        150.000,00 × 23 % =  34.500,00
   *        100.000,00 × 27 % =  27.000,00
   *      1.493.195,95 × 30 % = 447.958,785
   *                            ───────────
   *                             519.838,785 → «519.838,79 €»  (antes del 657: «519.838,78 €»)
   *
   * Con la escala que describe el `faqJsonLd` («27 % por encima» de 200.000 €) saldrían
   * 475.042,91 €: 44.795,88 € menos. Manda `data/fiscal`, que es lo que aplica el motor.
   *
   * Y con 90 años el heredero sigue pagando: la app no modela ninguna exención de IRPF
   * (ni la del art. 33.4.b LIRPF ni la del art. 38), pese a lo que dice el `faqJsonLd`.
   */
  test('GUARDA — el tramo del 30 % del IRPF entra de verdad: ganancia de 1.793.195,95 € → 519.838,79 €', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Hijo hereda piso 200k en Madrid/ }).click();
    await mover(page, 'valorVta', 2000000);

    expect(await linea(page, IRPF, 'Valor adquisición fiscal*')).toBe('206.804,05 €');
    expect(await linea(page, IRPF, 'Ganancia patrimonial')).toBe('1.793.195,95 €');
    expect(await linea(page, IRPF, 'Cuota IRPF venta')).toBe('519.838,79 €');
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
   * `faqJsonLd` daría 475.042,91 € y el motor liquida 519.838,79 €.
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
   *      Cuota íntegra = 23.409,28 + 22.047,53 × 15,30 % = 26.782,55209 → «26.782,55 €»
   *      Bonificación  = 26.782,55 × 90 % = 24.104,295                 → «24.104,30 €»
   *      Cuota final   = 26.782,55 − 24.104,30 = 2.678,25              → «2678,25 €»
   *
   * ⚠️ Éste es el ÚNICO perfil de todo el fichero en el que la web y `calcularSucesion` dan
   * cifras distintas, y es a propósito (hallazgo 657, reparado el 09/09/2026). El motor
   * redondea la RESTA —`r(cuotaTributaria − bonificación)` = 2.678,26— pero publica la
   * bonificación ya redondeada a 24.104,30, así que sus dos campos no suman su propia cuota
   * tributaria: 24.104,30 + 2.678,26 = 26.782,56. La web redondea cada importe y resta los
   * redondeados, que es como se escribe una liquidación y lo único con lo que la aritmética
   * de la pantalla sale. Ocurre en 20.104 de las 2.233.392 combinaciones alcanzables con los
   * deslizadores (0,9 %), todas de un céntimo y todas ellas justo aquellas en las que el
   * motor se contradice a sí mismo: el defecto está en `lib/calculadoras/sucesiones.ts`.
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
    expect(await linea(page, ISD, 'Cuota ISD final')).toBe('2678,25 €');
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

  // ══════════════════════════════════════════════════════════════════════════
  // RE-INSPECCIÓN DE CIERRE 28/08/2026 — casos nuevos sobre la parte que tocó
  // el commit `e1a42c65`, resueltos a mano antes de abrir el navegador
  // ══════════════════════════════════════════════════════════════════════════

  /**
   * CASO 6 (LÍMITE) — el borde EXACTO de los 65 años del colateral, por los dos lados.
   *
   * La reparación del 27/08 movió la regla del art. 20.2.c a `evaluarReduccionVivienda`, y
   * el test «WEB ↔ MCP (3/3)» comprueba la rama que DENIEGA en el navegador y la que
   * CONCEDE solo contra el motor en Node. O sea: que la web conceda de verdad la reducción
   * a un colateral con derecho no lo había mirado nadie en pantalla, y es la mitad del
   * cambio que decide el importe. Aquí se prueban las dos ramas con un año de diferencia.
   *
   * Hermano de 65 años que convivió los 2 años anteriores, Madrid, 135.000 € de vivienda
   * habitual (`EDAD_MIN_COLATERAL_VIVIENDA_IS` = 65, así que 65 es el primer año CON
   * derecho). El importe está elegido para que la base liquidable caiga en el PRIMER tramo
   * de `TARIFA_ESTATAL_IS`, el del 7,65 % con cuota acumulada 0, que ningún otro caso de
   * este fichero visita:
   *
   *   − Reducción parentesco  REDUCCIONES_PARENTESCO_IS['III']    −7.993,46
   *   − Reducción vivienda    mín(135.000 × 0,95; 122.606,47)   −122.606,47  ← manda el TOPE
   *   = Base liquidable                                            4.400,07
   *   Cuota íntegra = 0 + 4.400,07 × 7,65 % = 336,605355         → «336,61 €»
   *   × COEFICIENTES_IS['III'][0] = 1,5882 → 534,596624          → «534,60 €»
   *   − 50 % (madrid…['III'].porcentaje) → 267,298312            → «267,30 €»
   *
   * Y con 64 años, un solo año por debajo del umbral, la reducción desaparece entera:
   *   = Base liquidable 135.000 − 7.993,46 = 127.006,54
   *   Cuota íntegra = 7.127,47 + (127.006,54 − 79.881,18) × 10,20 % = 11.934,25672
   *   × 1,5882 = 18.953,986522 → − 50 % = 9.476,993261            → «9476,99 €»
   *
   * 9.209,69 € de diferencia por un año de edad: por eso el umbral se prueba en su borde y
   * no «alrededor».
   */
  test('CASO 6 (límite) — el colateral en el borde de los 65 años: 267,30 € con derecho y 9476,99 € sin él', async ({
    page,
  }) => {
    await page.goto(RUTA);

    await page.selectOption('#parentescoSel', 'hermano');
    await page.selectOption('#ccaaSel', 'madrid');
    await mover(page, 'edadHer', 65);
    await mover(page, 'valorRef', 135000);
    await casilla(page, 'viviendaHabitual', true);
    await casilla(page, 'convivencia', true);
    await mover(page, 'aniosVenta', 0);

    // Con derecho: el tope de 122.606,47 € manda sobre el 95 % de 135.000 €
    expect(await linea(page, ISD, '− Reducción vivienda habitual (95%)')).toBe('−122.606,47 €');
    expect(await linea(page, ISD, '= Base liquidable')).toBe('4400,07 €');
    expect(await linea(page, ISD, 'Cuota íntegra (tarifa)')).toBe('336,61 €');
    expect(await linea(page, ISD, '= Cuota tributaria')).toBe('534,60 €');
    expect(await linea(page, ISD, 'Cuota ISD final')).toBe('267,30 €');

    // Un año por debajo del umbral y no queda nada de la reducción
    await mover(page, 'edadHer', 64);
    expect(await linea(page, ISD, 'Reducción vivienda habitual')).toBe(
      'No aplicable: pariente colateral menor de 65 años'
    );
    expect(await linea(page, ISD, '= Base liquidable')).toBe('127.006,54 €');
    expect(await linea(page, ISD, 'Cuota íntegra (tarifa)')).toBe('11.934,26 €');
    expect(await linea(page, ISD, 'Cuota ISD final')).toBe('9476,99 €');

    // La misma entrada por el motor compartido, que es lo que responde el MCP Delegum
    const motor = calcularSucesion({
      baseImponible: 135000,
      ccaa: 'madrid',
      grupo: 'III',
      edadHeredero: 65,
      convivenciaDosAnios: true,
      viviendaHabitual: 135000,
    });
    expect(motor.reduccionVivienda).toBe(122606.47);
    expect(motor.baseLiquidable).toBe(4400.07);
    expect(motor.cuotaFinal).toBe(267.3);
  });

  /**
   * CASO 7 (NORMAL) — la plusvalía por el método REAL, que hasta ahora nunca ganaba.
   *
   * Los cinco casos de la ronda anterior eligen siempre el método OBJETIVO (o la no
   * sujeción), así que la rama del art. 107.5 TRLHL —la que reparte la ganancia entre
   * suelo y construcción en proporción CATASTRAL— no la ejercitaba ningún test pese a ser
   * la mitad del cálculo. Se fuerza comprando barato el mismo año de la referencia:
   * la ganancia real es pequeña y el método real baja del objetivo.
   *
   * Y de paso, Baleares, la única CCAA del catálogo que bonifica al Grupo II un 95 % (no un
   * 99 %): el 5 % que queda hace visible la cuota íntegra, que con el 99 % se queda en
   * calderilla y esconde cualquier error de tarifa.
   *
   * Hijo de 45 años, Baleares, vivienda habitual comprada hace 20 años por 195.000 €, valor
   * de referencia 200.000 €, suelo catastral 60.000 € sobre 120.000 € de catastral total,
   * venta a los 2 años por 210.000 €.
   *
   * ISD:
   *   200.000 − 15.956,87 − mín(190.000; 122.606,47) = 61.436,66 de base liquidable
   *   Cuota íntegra = 2.648,88 + (61.436,66 − 31.956,87) × 9,35 % = 5.405,240365 → «5405,24 €»
   *   × 1,0000 → − 95 % (baleares…['II'].porcentaje) = 270,262018 → «270,26 €»
   *
   * Plusvalía municipal, 20 años → COEFICIENTES_IIVTNU_2025 = 0,45:
   *   objetivo = 60.000 × 0,45 × 0,25 =                                 6.750,00
   *   real     = (200.000 − 195.000) × (60.000 / 120.000) × 0,25 =         625,00  ← el MENOR
   *
   * IRPF a los 2 años:
   *   Valor de adquisición fiscal = 200.000 + 270,26 + 625 = 200.895,26
   *   (la cuota de ISD entra ya redondeada al céntimo desde el hallazgo 657)
   *   Ganancia = 210.000 − 200.895,26 = 9.104,74
   *        6.000,00 × 19 % = 1.140,00
   *        3.104,74 × 21 % =   651,9954
   *                            ────────
   *                             1.791,9954 → «1792,00 €»  (antes del 657: «1791,99 €»)
   *
   * TOTAL = 270,26 + 625 + 1.791,9954 = 2.687,2554 → «2687,26 €» = 1,28 % de 210.000
   */
  test('CASO 7 (normal) — Baleares al 95 % y la plusvalía por el método REAL: 270,26 € + 625,00 € + 1792,00 €', async ({
    page,
  }) => {
    await page.goto(RUTA);

    await page.selectOption('#parentescoSel', 'hijo');
    await page.selectOption('#ccaaSel', 'baleares');
    await mover(page, 'edadHer', 45);
    await mover(page, 'anioAdq', ANIO - 20);
    await mover(page, 'valorAdq', 195000);
    await mover(page, 'valorRef', 200000);
    await mover(page, 'valorSuelo', 60000);
    await mover(page, 'valorCatastralTotal', 120000);
    await casilla(page, 'viviendaHabitual', true);
    await mover(page, 'aniosVenta', 2);
    await mover(page, 'valorVta', 210000);

    expect(await linea(page, ISD, '= Base liquidable')).toBe('61.436,66 €');
    expect(await linea(page, ISD, 'Cuota íntegra (tarifa)')).toBe('5405,24 €');
    expect(await panel(page, ISD)).toContain('Bonificación CCAA (95,0%)');
    expect(await linea(page, ISD, 'Cuota ISD final')).toBe('270,26 €');

    expect(await panel(page, IIVTNU)).toContain('20 años de tenencia');
    expect(await linea(page, IIVTNU, 'Coeficiente 20 años')).toBe('0,45');
    expect(await linea(page, IIVTNU, 'Método objetivo')).toBe('6750,00 €');
    expect(await linea(page, IIVTNU, 'Método real (suelo)')).toBe('625,00 €');
    expect(await linea(page, IIVTNU, 'Método elegido')).toBe('Real (menor)');
    expect(await linea(page, IIVTNU, 'Cuota plusvalía municipal')).toBe('625,00 €');

    expect(await linea(page, IRPF, 'Valor adquisición fiscal*')).toBe('200.895,26 €');
    expect(await linea(page, IRPF, 'Ganancia patrimonial')).toBe('9104,74 €');
    expect(await linea(page, IRPF, 'Cuota IRPF venta')).toBe('1792,00 €');

    const total = await bloqueTotal(page);
    expect(total).toContain('2687,26 €');
    expect(total).toContain('1,28%');
  });

  /**
   * CASO 8 (RECHAZO) — Grupo IV marcando la casilla de vivienda habitual.
   *
   * La guarda del Grupo IV que ya existía DESMARCA la casilla, así que la rama que deniega
   * la reducción a quien no tiene parentesco —una de las tres que `evaluarReduccionVivienda`
   * decide— no se probaba en el navegador. Y es la que más se pulsa por error: la casilla
   * viene marcada de serie, y quien hereda de un extraño la deja como está.
   *
   * Sin parentesco (Grupo IV), Madrid, 200.000 € que SÍ eran la vivienda habitual del
   * fallecido. El art. 20.2.c LISD no contempla al Grupo IV, así que marcarla no cambia nada:
   *   Base liquidable = 200.000 (REDUCCIONES_PARENTESCO_IS['IV'] = 0 y ninguna más)
   *   Cuota íntegra = 7.127,47 + (200.000 − 79.881,18) × 10,20 % = 19.379,58964
   *   × COEFICIENTES_IS['IV'][0] = 2,0000 = 38.759,17928 → «38.759,18 €», sin bonificación
   *
   * Que es exactamente la cifra que el bloque educativo deriva del motor (`EJEMPLO_GRUPO_IV`,
   * calculado con la casilla en falso): la prueba de que la casilla es inocua aquí.
   */
  test('CASO 8 (rechazo) — Grupo IV con la vivienda habitual marcada: se deniega, se dice, y la cuota no se mueve', async ({
    page,
  }) => {
    await page.goto(RUTA);

    await page.selectOption('#parentescoSel', 'sin_parentesco');
    await page.selectOption('#ccaaSel', 'madrid');
    await mover(page, 'edadHer', 50);
    await mover(page, 'valorRef', 200000);
    await casilla(page, 'viviendaHabitual', true);
    await mover(page, 'aniosVenta', 0);

    expect(await linea(page, ISD, 'Reducción vivienda habitual')).toBe(
      'No aplicable: sin parentesco: el art. 20.2.c LISD no la contempla'
    );
    expect(await linea(page, ISD, '= Base liquidable')).toBe('200.000,00 €');
    expect(await linea(page, ISD, 'Cuota ISD final')).toBe('38.759,18 €');

    // La casilla del colateral NO se ofrece fuera del Grupo III: no tendría efecto y sugeriría
    // que el requisito del art. 20.2.c se puede cumplir sin parentesco.
    expect(await page.locator('#convivencia').count()).toBe(0);
  });

  /**
   * Hallazgo 502 — reparado. Dos defectos distintos en la misma tarjeta:
   *
   * 1. `CCAA_BONIFICACION_CASI_TOTAL` filtraba solo `porcentaje >= 0.99`, sin mirar el
   *    régimen: País Vasco (0,99 fijo, pero FORAL) entraba en una lista cuya frase habla del
   *    régimen común, con notas propias que piden consulta obligatoria a su Hacienda Foral.
   *    Ahora el filtro excluye `regimen === 'foral'`, y País Vasco se explica aparte.
   * 2. La tarjeta decía luego que «Cantabria y Aragón funcionan con una exención… no con un
   *    porcentaje plano», que es falso para Aragón: dentro de su tope de 3.000.000 € de base
   *    liquidable SÍ bonifica un 100 % plano (por eso entra, con razón, en la enumeración de
   *    arriba); lo que tiene de especial no es que reparta por tramos como Cantabria o
   *    Castilla-La Mancha, sino que la bonificación desaparece del todo por encima del tope.
   *    Sacarlo de la enumeración habría sido mentir en la otra dirección — se corrigió la
   *    frase, no la lista.
   */
  test('REGRESIÓN — la tarjeta educativa no se contradice sobre Aragón, y excluye a País Vasco por foral', async ({
    page,
  }) => {
    await page.goto(RUTA);

    const tarjeta = await page.evaluate(() => {
      const h4 = [...document.querySelectorAll('h4')].find(h =>
        (h.textContent ?? '').includes('Hijo hereda piso')
      );
      return (h4?.parentElement?.textContent ?? '').replace(/\s+/g, ' ').trim();
    });

    // La enumeración derivada («99% o más») SÍ incluye a Aragón —bonifica el 100 % de
    // verdad— y NO incluye a País Vasco, que es foral.
    const enumeracion = tarjeta.match(/99% o más\s*\(([^)]*)\)/)?.[1] ?? '';
    expect(enumeracion).toContain('Aragón');
    expect(enumeracion).not.toContain('País Vasco');

    // Ya no se afirma que Aragón "no es un porcentaje plano": es plano, con límite de base
    expect(tarjeta).not.toContain('Cantabria y Aragón funcionan con una exención');
    expect(tarjeta).toContain('3.000.000 € de base liquidable');

    // País Vasco se explica aparte, como régimen foral con consulta obligatoria
    expect(tarjeta).toContain('País Vasco bonifica también cerca del 99%, pero es régimen foral');
  });

  /**
   * Hallazgo 500 — reparado. `app/estimador-impuesto-sucesiones/page.tsx` tenía una TERCERA
   * copia de la regla del art. 20.2.c (además de `page.tsx` de esta app y del motor
   * compartido), que concedía el 95 % a todo el Grupo III sin mirar edad ni convivencia — el
   * defecto exacto del hallazgo 462. Ahora importa `evaluarReduccionVivienda` y el formulario
   * ofrece edad y la casilla de convivencia cuando el grupo es 'III'.
   *
   * Misma herencia del hallazgo 462: Madrid, Grupo III, 200.000 € de vivienda habitual. Esa
   * app añade siempre el 3 % de ajuar (base 206.000 €), y sin edad/convivencia declaradas la
   * reducción de vivienda NO se aplica: base liquidable 198.006,54 → cuota final 15.227,87 €
   * (golden GOLDEN-AH en `tests/calculadoras-invariantes.spec.ts`, mismo caso sobre el motor).
   */
  test('REGRESIÓN — estimador-impuesto-sucesiones usa la regla única del art. 20.2.c para el Grupo III', async ({
    page,
  }) => {
    await page.goto('/estimador-impuesto-sucesiones/');

    const selects = page.locator('select');
    await selects.nth(0).selectOption('madrid');
    await selects.nth(1).selectOption('III');
    await page
      .locator('xpath=//label[contains(., "Vivienda habitual")]/following::input[1]')
      .fill('200000');

    const cuota = page.locator('xpath=//*[contains(@class,"resultsPanel")]');
    await expect(cuota).toContainText('CUOTA A INGRESAR');

    // La ÚNICA aserción de fondo: el colateral de esta herencia no cumple el art. 20.2.c,
    // así que la cuota tiene que ser la misma que dan la web y el MCP para el mismo caso.
    expect((await cuota.innerText()).replace(/\s+/g, ' ')).toContain('15.227,87 €');
  });

  /**
   * Hallazgo 501 — reparado. `evaluarReduccionVivienda` exige `convivenciaDosAnios` para el
   * Grupo III. Las dos tools del MCP Delegum ya lo exponían (`convivio_dos_anios`), pero
   * `app/api/chatgpt/sucesiones/route.ts` —la Action del GPT, que llama al MISMO
   * `calcularSucesion`— no lo copiaba del body, así que el parámetro se perdía por el camino
   * y el colateral con derecho no podía acreditarlo nunca por esa ruta.
   *
   * Efecto familia encontrado al grepear los demás consumidores de `calcularSucesion`: el
   * mismo dato faltaba en `lib/calculadoras/comparacionDonacionHerencia.ts` (tool MCP
   * `comparar_donacion_vs_herencia`), donde ni siquiera existía el parámetro — se añadió
   * `edadHeredero`/`convivenciaDosAnios` a su interfaz — y en `herenciaConjunta.ts`, sin
   * consumidor activo hoy pero con la misma laguna.
   */
  test('REGRESIÓN — /api/chatgpt/sucesiones respeta convivenciaDosAnios para el Grupo III', async ({
    request,
  }) => {
    const respuesta = await request.post('/api/chatgpt/sucesiones/', {
      data: {
        baseImponible: 200000,
        ccaa: 'madrid',
        grupo: 'III',
        edadHeredero: 70,
        convivenciaDosAnios: true,
        viviendaHabitual: 200000,
      },
    });
    const json = await respuesta.json();

    // El MCP, con el mismo supuesto, da 4.883,57 €: es la cifra que fija la paridad
    expect(json.cuotaFinal).toBe(4883.57);
  });
});

// ════════════════════════════════════════════════════════════════════════════
// RE-INSPECCIÓN 02/09/2026 — tres casos NUEVOS, resueltos a mano antes de abrir
// el navegador, sobre las ramas de `data/fiscal` que ninguna ronda anterior
// había ejercitado: la exención POR IMPORTE de Galicia, la tarifa propia de
// Cataluña con un DESCENDIENTE (hasta ahora solo se probó el cónyuge) y el
// coeficiente 0,10 del IIVTNU, en la zona no monótona de la tabla.
// ════════════════════════════════════════════════════════════════════════════

test.describe('Simulador de heredar vivienda — re-inspección 02/09/2026', () => {
  /**
   * CASO 1 (NORMAL) — la cadena entera de los tres impuestos sobre una comunidad y un
   * parentesco que ningún caso anterior tocaba: CÓNYUGE en la Comunitat Valenciana.
   *
   * Importa que sea el cónyuge y no el hijo porque son filas DISTINTAS de
   * `BONIFICACIONES_CCAA_IS` (`'I-conyuge'` frente a `'II'`) y de las dos tablas de
   * reducciones; en régimen común coinciden, y esa coincidencia es justamente lo que
   * esconde un cruce de claves. Y el año de adquisición se fija en ANIO − 8 para caer en el
   * coeficiente 0,10 del IIVTNU, dentro del valle no monótono de la tabla (7 años → 0,12,
   * 8 años → 0,10, 9 años → 0,09): un año de desfase en la tenencia se vería aquí.
   *
   * Cónyuge de 60 años, Comunitat Valenciana, vivienda habitual valorada en 260.000 €,
   * comprada hace 8 años por 190.000 €, suelo catastral 90.000 € sobre 180.000 € de
   * catastral total, y venta a los 4 años por 300.000 €.
   *
   * ISD:
   *   Base imponible                                                    260.000,00
   *   − Reducción parentesco  REDUCCIONES_PARENTESCO_IS['I-conyuge']    −15.956,87
   *   − Reducción vivienda    mín(260.000 × 0,95; 122.606,47)          −122.606,47
   *   = Base liquidable                                                 121.436,66
   *   Cuota íntegra por la COLUMNA `cuota` de TARIFA_ESTATAL_IS (tramo del 10,20 %):
   *        7.127,47 + (121.436,66 − 79.881,18) × 10,20 %
   *      = 7.127,47 + 4.238,65896 = 11.366,12896                     → «11.366,13 €»
   *   × COEFICIENTES_IS['II'][0] = 1,0000 → cuota tributaria 11.366,12896
   *   − 99 % (`BONIFICACIONES_CCAA_IS['valencia']…['I-conyuge'].porcentaje` = 0,99)
   *   = 113,6612896                                                   → «113,66 €»
   *
   * Plusvalía municipal (IIVTNU), tipo ORIENTATIVO del módulo (25 %):
   *   8 años → COEFICIENTES_IIVTNU_2025[8] = 0,10
   *   Método objetivo = 90.000 × 0,10 × 0,25 =                            2.250,00  ← el MENOR
   *   Método real     = (260.000 − 190.000) × (90.000 / 180.000) × 0,25 = 8.750,00
   *
   * IRPF al vender a los 4 años por 300.000 €:
   *   Valor de adquisición fiscal = 260.000 + 113,6612896 + 2.250 = 262.363,6612896
   *   Ganancia = 300.000 − 262.363,6612896 = 37.636,3387104
   *        6.000,0000000 × 19 % = 1.140,00
   *       31.636,3387104 × 21 % = 6.643,63112918
   *                               ──────────────
   *                                7.783,63112918                        → «7783,63 €»
   *
   * TOTAL = 113,6612896 + 2.250 + 7.783,63112918 = 10.147,2924188  → «10.147,29 €»
   * y 10.147,2924188 / 300.000 = 3,3824... → «3,38 %»
   */
  test('CASO 1 (normal) — cónyuge en la Comunitat Valenciana: 113,66 € + 2250,00 € + 7783,63 € = 10.147,29 €', async ({
    page,
  }) => {
    await page.goto(RUTA);

    await page.selectOption('#parentescoSel', 'conyuge');
    await page.selectOption('#ccaaSel', 'valencia');
    await mover(page, 'edadHer', 60);
    await mover(page, 'anioAdq', ANIO - 8);
    await mover(page, 'valorAdq', 190000);
    await mover(page, 'valorRef', 260000);
    await mover(page, 'valorSuelo', 90000);
    await mover(page, 'valorCatastralTotal', 180000);
    await casilla(page, 'viviendaHabitual', true);
    await mover(page, 'aniosVenta', 4);
    await mover(page, 'valorVta', 300000);

    // ── ISD ──────────────────────────────────────────────────────────────────
    expect(await panel(page, ISD)).toContain('Comunitat Valenciana — Grupo II');
    // REDUCCIONES_PARENTESCO_IS['I-conyuge'] = 15.956,87 € (data/fiscal/sucesiones.ts)
    expect(await linea(page, ISD, '− Reducción parentesco')).toBe('−15.956,87 €');
    // REDUCCION_VIVIENDA_MAX_IS = 122.606,47 €: el tope manda sobre el 95 % de 260.000 €
    expect(await linea(page, ISD, '− Reducción vivienda habitual (95%)')).toBe('−122.606,47 €');
    expect(await linea(page, ISD, '= Base liquidable')).toBe('121.436,66 €');
    // TARIFA_ESTATAL_IS, tramo «hasta 239.389,13»: cuota 7.127,47 + 10,20 % del exceso
    expect(await linea(page, ISD, 'Cuota íntegra (tarifa)')).toBe('11.366,13 €');
    // COEFICIENTES_IS['II'][0] = 1,0000
    expect(await linea(page, ISD, '× Coef. patrimonio (Grupo II)')).toBe('×1,0000');
    // BONIFICACIONES_CCAA_IS['valencia'].bonificaciones['I-conyuge'].porcentaje = 0,99
    expect(await panel(page, ISD)).toContain('Bonificación CCAA (99,0%)');
    expect(await linea(page, ISD, 'Cuota ISD final')).toBe('113,66 €');

    // ── Plusvalía municipal ──────────────────────────────────────────────────
    expect(await page.locator('label[for="anioAdq"]').innerText()).toContain('(8 años hasta hoy)');
    expect(await panel(page, IIVTNU)).toContain('8 años de tenencia');
    // COEFICIENTES_IIVTNU_2025 → 8 años = 0,10 (valle de la tabla: 0,12 / 0,10 / 0,09)
    expect(await linea(page, IIVTNU, 'Coeficiente 8 años')).toBe('0,10');
    // PLUSVALIA_MUNICIPAL_META.tipoOrientativo = 25 (no el tipoMaximoLegal de 30)
    expect(await linea(page, IIVTNU, 'Tipo municipal (orientativo)')).toBe('25%');
    expect(await linea(page, IIVTNU, 'Método objetivo')).toBe('2250,00 €');
    expect(await linea(page, IIVTNU, 'Método real (suelo)')).toBe('8750,00 €');
    expect(await linea(page, IIVTNU, 'Método elegido')).toBe('Objetivo (menor)');
    expect(await linea(page, IIVTNU, 'Cuota plusvalía municipal')).toBe('2250,00 €');

    // ── IRPF ─────────────────────────────────────────────────────────────────
    expect(await linea(page, IRPF, 'Valor adquisición fiscal*')).toBe('262.363,66 €');
    expect(await linea(page, IRPF, 'Ganancia patrimonial')).toBe('37.636,34 €');
    // TRAMOS_GANANCIAS_PATRIMONIALES_2025: 6.000 × 19 % + 31.636,34 × 21 %
    expect(await linea(page, IRPF, 'Cuota IRPF venta')).toBe('7783,63 €');

    // ── Total y formato español ──────────────────────────────────────────────
    const total = await bloqueTotal(page);
    expect(total).toContain('10.147,29 €');
    expect(total).toContain('3,38%');
    expect(total).not.toMatch(/10,147\.29/); // nunca formato US
  });

  /**
   * CASO 2 (LÍMITE) — el umbral de EXENCIÓN POR IMPORTE de Galicia, cercado por los dos
   * lados. Es la única rama de `aplicarBonificacionIS` que ningún test de este fichero
   * ejercitaba: `BONIFICACIONES_CCAA_IS['galicia']…['II']` = { porcentaje: 0,99,
   * exencion: 1.000.000 }, o sea que por debajo de 1.000.000 € de base liquidable la cuota
   * es CERO y por encima se paga el 1 % restante. No es un escalón suave: cinco mil euros
   * más de valor de referencia convierten 0,00 € en 1.845,39 €.
   *
   * Hijo de 50 años, Galicia, vivienda habitual, sin venta simulada (para aislar el ISD).
   * Las reducciones fijas suman 15.956,87 + 122.606,47 = 138.563,34 €, así que el umbral de
   * base liquidable de 1.000.000 € cae en 1.138.563,34 € de valor de referencia, y el
   * deslizador (paso de 5.000 €) lo cerca con 1.135.000 € y 1.140.000 €.
   *
   *  (a) 1.135.000 − 138.563,34 = 996.436,66  < 1.000.000 → EXENCIÓN TOTAL (100 %)
   *      Cuota íntegra, último tramo de TARIFA_ESTATAL_IS (cuota 132.549,07, tipo 25,50 %):
   *          132.549,07 + (996.436,66 − 797.555,08) × 25,50 %
   *        = 132.549,07 + 50.714,8029 = 183.263,8729            → «183.263,87 €»
   *      Cuota final = 0,00 €
   *
   *  (b) 1.140.000 − 138.563,34 = 1.001.436,66  > 1.000.000 → bonificación del 99 %
   *      Cuota íntegra = 132.549,07 + 203.881,58 × 25,50 % = 184.538,8729 → «184.538,87 €»
   *      Cuota final = 184.538,8729 × 0,01 = 1.845,388729       → «1845,39 €»
   *
   * Plusvalía en los dos (no depende del valor de referencia porque gana el objetivo):
   *   12 años → COEFICIENTES_IIVTNU_2025[12] = 0,08
   *   objetivo = 200.000 × 0,08 × 0,25 = 4.000,00, muy por debajo del real → 4.000,00 €
   */
  test('CASO 2 (límite) — Galicia: exención total con 996.436,66 € de base y 1845,39 € con 1.001.436,66 €', async ({
    page,
  }) => {
    await page.goto(RUTA);

    await page.selectOption('#parentescoSel', 'hijo');
    await page.selectOption('#ccaaSel', 'galicia');
    await mover(page, 'edadHer', 50);
    await mover(page, 'anioAdq', ANIO - 12);
    await mover(page, 'valorAdq', 400000);
    await mover(page, 'valorSuelo', 200000);
    await mover(page, 'valorCatastralTotal', 400000);
    await casilla(page, 'viviendaHabitual', true);
    await mover(page, 'aniosVenta', 0); // aislar el ISD: sin venta

    // (a) Base liquidable 996.436,66 € → justo por DEBAJO del umbral de exención
    await mover(page, 'valorRef', 1135000);
    expect(await panel(page, ISD)).toContain('Galicia — Grupo II');
    expect(await linea(page, ISD, '= Base liquidable')).toBe('996.436,66 €');
    expect(await linea(page, ISD, 'Cuota íntegra (tarifa)')).toBe('183.263,87 €');
    // `exencion: 1.000.000` manda sobre el `porcentaje: 0,99` de la misma fila
    expect(await panel(page, ISD)).toContain('Bonificación CCAA (100,0%)');
    expect(await linea(page, ISD, 'Cuota ISD final')).toBe('0,00 €');
    // COEFICIENTES_IIVTNU_2025 → 12 años = 0,08
    expect(await linea(page, IIVTNU, 'Coeficiente 12 años')).toBe('0,08');
    expect(await linea(page, IIVTNU, 'Cuota plusvalía municipal')).toBe('4000,00 €');
    expect(await bloqueTotal(page)).toContain('4000,00 €');

    // (b) Base liquidable 1.001.436,66 € → justo por ENCIMA: se cae la exención
    await mover(page, 'valorRef', 1140000);
    expect(await linea(page, ISD, '= Base liquidable')).toBe('1.001.436,66 €');
    expect(await linea(page, ISD, 'Cuota íntegra (tarifa)')).toBe('184.538,87 €');
    expect(await panel(page, ISD)).toContain('Bonificación CCAA (99,0%)');
    expect(await linea(page, ISD, 'Cuota ISD final')).toBe('1845,39 €');
    expect(await bloqueTotal(page)).toContain('5845,39 €'); // 1.845,39 + 4.000,00

    // Sin venta no hay IRPF
    expect(await panel(page, IRPF)).toContain('Sin venta simulada');

    // Y el motor compartido (MCP Delegum) tiene que decir lo mismo en los dos lados
    const debajo = calcularSucesion({
      baseImponible: 1135000,
      ccaa: 'galicia',
      grupo: 'II',
      viviendaHabitual: 1135000,
    });
    expect(debajo.baseLiquidable).toBe(996436.66);
    expect(debajo.cuotaFinal).toBe(0);
    const encima = calcularSucesion({
      baseImponible: 1140000,
      ccaa: 'galicia',
      grupo: 'II',
      viviendaHabitual: 1140000,
    });
    expect(encima.baseLiquidable).toBe(1001436.66);
    expect(encima.cuotaFinal).toBe(1845.39);
  });

  /**
   * CASO 3 (RECHAZO) — lo que la app NO debe conceder a un DESCENDIENTE en Cataluña.
   *
   * El test «WEB ↔ MCP (2/3)» ya cubre Cataluña, pero solo con el CÓNYUGE y por el botón
   * del caso preconfigurado. El descendiente ≥21 es otra fila de las tablas catalanas
   * (`REDUCCIONES_PARENTESCO_CATALUNA_IS['II']` = 50.000 €, la mitad que el cónyuge) y su
   * base liquidable cae en otro tramo de `TARIFA_CATALUNA_IS`, así que un cruce de claves
   * entre cónyuge e hijo —el defecto que se reparó en el desplegable— no lo vería aquel
   * test. Se comprueban tres rechazos encadenados:
   *
   *  a) La reducción del 95 % por vivienda habitual: en Cataluña rige la Ley 19/2010, con
   *     topes propios que este catálogo NO modela. La app debe negarse a aplicar el tope
   *     ESTATAL de 122.606,47 € y DECIR por qué, en vez de dejar un cero mudo.
   *
   *  b) La casilla de convivencia del colateral, que solo tiene sentido en el Grupo III
   *     (art. 20.2.c LISD): con un descendiente no debe ni ofrecerse.
   *
   *  c) Una proporción de suelo mayor que 1: se declara a propósito un suelo catastral
   *     (200.000 €) SUPERIOR al catastral total (100.000 €), que es imposible. El método
   *     real del art. 107.5 TRLHL reparte la ganancia en proporción catastral, y sin el
   *     `Math.min(1, …)` esa proporción valdría 2 y el método real cobraría el DOBLE de la
   *     ganancia entera: 75.000 € en vez de 37.500 €.
   *
   * ISD (Cataluña, hijo ≥21, 350.000 € de vivienda habitual del padre):
   *   Base imponible                                                    350.000,00
   *   − REDUCCIONES_PARENTESCO_CATALUNA_IS['II']                       −100.000,00
   *   − Reducción vivienda, 95 % de 350.000 (tope catalán 500.000)     −332.500,00
   *   = Base liquidable                                                       0,00
   *   → Cuota ISD final = «0,00 €»
   *
   * ⚠️ Actualizado el 08/09/2026. Este caso esperaba 40.000,00 €, y esa cifra salía de las
   * dos cosas que la reparación de ese día corrigió: al hijo se le daban los 50.000 € del
   * nieto, y la reducción catalana por vivienda habitual no se calculaba. Lo que el caso
   * sigue comprobando —y por lo que se conserva— es que Cataluña NO usa el tope estatal de
   * 122.606,47 €, sino el suyo.
   *
   * Plusvalía: 12 años → 0,08 · objetivo = 200.000 × 0,08 × 0,25 = 4.000,00 (el menor)
   *            real    = (350.000 − 200.000) × mín(1; 200.000/100.000) × 0,25 = 37.500,00
   *
   * Contraste: la MISMA herencia en Madrid sí tiene derecho a la reducción estatal:
   *   350.000 − 15.956,87 − 122.606,47 = 211.436,66 de base liquidable
   *   7.127,47 + (211.436,66 − 79.881,18) × 10,20 % = 20.546,12896  → «20.546,13 €»
   *   × 1,0000 − 99 % = 205,4612896                                 → «205,46 €»
   */
  test('CASO 3 (rechazo) — Cataluña no aplica la reducción estatal al hijo, y la proporción de suelo se topa en 1', async ({
    page,
  }) => {
    await page.goto(RUTA);

    await page.selectOption('#parentescoSel', 'hijo');
    await page.selectOption('#ccaaSel', 'cataluna');
    await mover(page, 'edadHer', 45);
    await mover(page, 'anioAdq', ANIO - 12);
    await mover(page, 'valorAdq', 200000);
    await mover(page, 'valorRef', 350000);
    await mover(page, 'valorSuelo', 200000);
    await mover(page, 'valorCatastralTotal', 100000); // incoherente a propósito: suelo > total
    await casilla(page, 'viviendaHabitual', true);
    await mover(page, 'aniosVenta', 0);

    // a) Se aplica la reducción CATALANA, no la estatal
    expect(await panel(page, ISD)).toContain('Cataluña — Grupo II');
    // REDUCCIONES_PARENTESCO_CATALUNA_IS['II'] = 100.000 € para el hijo (50.000 el nieto)
    expect(await linea(page, ISD, '− Reducción parentesco')).toBe('−100.000,00 €');
    expect(await linea(page, ISD, '− Reducción vivienda habitual (95%)')).toBe('−332.500,00 €');
    // El tope estatal no aparece por ningún lado: en Cataluña rigen 500.000 €
    expect(await panel(page, ISD)).not.toContain('−122.606,47 €');
    expect(await linea(page, ISD, '= Base liquidable')).toBe('0,00 €');
    expect(await linea(page, ISD, 'Cuota ISD final')).toBe('0,00 €');

    // b) La casilla del colateral no se ofrece fuera del Grupo III
    expect(await page.locator('#convivencia').count()).toBe(0);

    // c) La proporción de suelo se topa en 1: el método real no puede superar la ganancia
    //    total por el tipo (150.000 × 0,25 = 37.500,00 y NO 75.000,00)
    expect(await linea(page, IIVTNU, 'Método real (suelo)')).toBe('37.500,00 €');
    expect(await linea(page, IIVTNU, 'Método objetivo')).toBe('4000,00 €');
    expect(await linea(page, IIVTNU, 'Cuota plusvalía municipal')).toBe('4000,00 €');

    expect(await bloqueTotal(page)).toContain('4000,00 €'); // 0,00 de ISD + 4.000,00 de plusvalía

    // Contraste: la misma herencia en Madrid SÍ reduce por vivienda habitual
    await page.selectOption('#ccaaSel', 'madrid');
    expect(await linea(page, ISD, '− Reducción vivienda habitual (95%)')).toBe('−122.606,47 €');
    expect(await linea(page, ISD, '= Base liquidable')).toBe('211.436,66 €');
    expect(await linea(page, ISD, 'Cuota ISD final')).toBe('205,46 €');
  });

  /**
   * ⚠️ HALLAZGO ABIERTO (02/09/2026) — datos normativos escritos A MANO en el bloque
   * educativo, pudiendo derivarse de `data/fiscal`, que la propia página ya importa.
   *
   * Es el patrón exacto de los hallazgos 275 (la cifra del Grupo IV), 463 (la escala del
   * ahorro en `metadata.ts`) y 465 (la lista de CCAA): la prosa contando una versión que el
   * motor de la misma página no lee. Hoy los siete literales COINCIDEN con `data/fiscal`,
   * así que no hay error visible; lo que hay es la garantía de que una corrección en
   * `data/fiscal` no llegará al texto. Y el caso 463 demuestra que ocurre: la escala del
   * ahorro se derivó en `metadata.ts` y se dejó escrita a mano DOS veces en `page.tsx`.
   *
   *   línea  literal                                                   exportado en data/fiscal
   *   ─────  ────────────────────────────────────────────────────────  ────────────────────────
   *    809   «reducción 95% ISD hasta 122.606 €»                       REDUCCION_VIVIENDA_MAX_IS
   *   1031   «Tramos: 19% / 21% / 23% / 27% / 30%»                     TRAMOS_GANANCIAS_…_2025
   *   1147   «(7.993 €)» y «coeficiente multiplicador 1,5882»          REDUCCIONES_PARENTESCO_IS['III'],
   *                                                                    COEFICIENTES_IS['III'][0]
   *   1157   «el coeficiente llega a 2,4»                              COEFICIENTES_IS['IV'][3]
   *   1207   «19% (hasta 6.000 €), 21% (hasta 50.000 €)…»              TRAMOS_GANANCIAS_…_2025
   *   1216   «El tope estatal es 122.606,47 €/heredero»                REDUCCION_VIVIENDA_MAX_IS
   *   1309   «la reducción del 95% (hasta 122.606 €)»                  REDUCCION_VIVIENDA_MAX_IS
   *
   * La comprobación es sobre el FUENTE y no sobre la página renderizada a propósito: lo que
   * está mal no es el número que se ve —hoy es correcto— sino que esté escrito.
   */
  // ✅ REPARADO el 02/09/2026 (hallazgos 609 y 611). Queda como regresión.
  test(
    'REGRESIÓN — el bloque educativo no escribe a mano datos que data/fiscal ya exporta',
    async () => {
      const fuente = readFileSync(
        resolve(__dirname, '..', '..', 'app', 'simulador-heredar-vivienda', 'page.tsx'),
        'utf8'
      );
      // Solo el JSX: los comentarios de cabecera SÍ pueden citar cifras, son documentación
      const jsx = fuente.slice(fuente.indexOf('export default function'));

      expect(jsx).not.toContain('hasta 122.606 €');
      expect(jsx).not.toContain('122.606,47 €/heredero');
      expect(jsx).not.toContain('7.993 €');
      expect(jsx).not.toContain('coeficiente multiplicador 1,5882');
      expect(jsx).not.toContain('el coeficiente llega a 2,4');
      expect(jsx).not.toContain('19% / 21% / 23% / 27% / 30%');
      expect(jsx).not.toContain('19% (hasta 6.000 €)');
    }
  );

  /**
   * ⚠️ HALLAZGO ABIERTO (02/09/2026) — el sello `<DataReference>` rotula «ISD + IIVTNU 2025»
   * pero declara UN SOLO módulo: `FISCAL_SUCESIONES_META` (Ley 29/1987, verificado
   * 01/01/2025, URL de la AEAT sobre el ISD).
   *
   * La página liquida TRES impuestos con datos de DOS módulos distintos:
   *   · ISD      → `data/fiscal/sucesiones.ts` · verificado 2025-01-01 ← el único que se cita
   *   · IIVTNU   → `PLUSVALIA_MUNICIPAL_META` + `COEFICIENTES_IIVTNU_2025` (RDL 26/2021)
   *   · IRPF     → `TRAMOS_GANANCIAS_PATRIMONIALES_2025`, del mismo `inmuebles.ts`,
   *                cuyo `FISCAL_INMUEBLES_META.verificado` es **2026-06-17**
   *
   * O sea que el sello que el usuario mira para saber si el dato está fresco enseña una
   * fecha año y medio ANTERIOR a la del módulo que aporta dos de los tres impuestos, y
   * manda a una URL que no habla ni del IIVTNU ni de la ganancia patrimonial. La fecha de
   * `inmuebles.ts` solo aparece dentro de `<EducationalSection>`, que va plegada.
   *
   * Declarar varios `<DataReference>` es patrón de la casa: lo hacen ya
   * `simulador-gastos-compraventa-garaje`, `-local-comercial`, `-trastero`,
   * `planificador-ahorro-jubilacion`, `conversor-cnae-iae` y `simulador-modulos-vs-directa`.
   */
  // ✅ REPARADO el 02/09/2026 (hallazgo 610): dos sellos, uno por módulo. Queda como regresión.
  test(
    'REGRESIÓN — el sello de datos declara también el módulo de inmuebles (IIVTNU e IRPF)',
    async ({ page }) => {
      await page.goto(RUTA);

      const sello = page.locator('[aria-label="Datos de referencia normativos"]');
      const texto = (await sello.first().innerText()).replace(/\s+/g, ' ');

      // Lo que hoy se ve: la verificación del ISD y nada más
      expect(texto).toContain('01/01/2025');
      // Lo que faltaría: el módulo del que salen la plusvalía municipal y la escala del IRPF
      expect(await sello.count()).toBeGreaterThan(1);
      const todos = (await sello.allInnerTexts()).join(' ').replace(/\s+/g, ' ');
      expect(todos).toContain('17/06/2026'); // FISCAL_INMUEBLES_META.verificado
      expect(todos).toContain('RDL 26/2021');
    }
  );
});

// ═════════════════════════════════════════════════════════════════════════════
// REGRESIÓN — hallazgos 612 y 613 del 02/09/2026, REPARADOS ese mismo día.
// ═════════════════════════════════════════════════════════════════════════════

test.describe('Regresión — hallazgos 612 y 613, reparados', () => {
  /**
   * 612 — el Grupo I (descendientes menores de 21 años) no era expresable: el desplegable no
   * lo ofrecía y el deslizador de edad arrancaba en 18, así que un heredero de 10 años solo
   * podía simularse como Grupo II, sin la reducción del art. 20.2.a LISD —que `data/fiscal`
   * exporta desde siempre en REDUCCION_EDAD_MENOR_21_IS— y con el impuesto sobreestimado.
   *
   * Caso resuelto A MANO antes de abrir el navegador. Madrid, heredero de 10 años, hijo,
   * vivienda de 200.000 € que NO era la habitual del causante:
   *   reducción de parentesco = 15.956,87 + 3.990,72 × (21 − 10) = 15.956,87 + 43.897,92
   *                           = 59.854,79 → topada en 47.858,59 (art. 20.2.a, tope legal)
   *   base liquidable = 200.000 − 47.858,59 = 152.141,41
   * Frente al Grupo II, cuya reducción es 15.956,87: 31.901,72 € más de base liquidable.
   */
  test('612 — el Grupo I existe, baja la edad hasta 0 y aplica la reducción del art. 20.2.a', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await page.selectOption('#ccaaSel', 'madrid');
    await page.locator('#parentescoSel').selectOption({ label: 'Hijo o descendiente <21 años (Grupo I)' });

    // El deslizador ya llega a 0: antes su mínimo era 18 y el caso no se podía plantear.
    await expect(page.locator('#edadHer')).toHaveAttribute('min', '0');
    await page.locator('#edadHer').fill('10');

    const reduccion = await page
      .getByText('− Reducción parentesco')
      .locator('xpath=following-sibling::strong[1]')
      .innerText();
    expect(reduccion.replace(/\u00a0/g, ' ')).toContain('47.858,59');

    // Y el mismo heredero como Grupo II se queda en la reducción base: la diferencia es
    // exactamente lo que el hallazgo decía que se estaba perdiendo.
    await page.locator('#parentescoSel').selectOption({ label: 'Hijo o hija ≥21 años (Grupo II)' });
    const reduccionII = await page
      .getByText('− Reducción parentesco')
      .locator('xpath=following-sibling::strong[1]')
      .innerText();
    expect(reduccionII.replace(/\u00a0/g, ' ')).toContain('15.956,87');
    // Con 10 años y Grupo II, la app avisa de que el parentesco correcto es el Grupo I.
    await expect(page.getByText(/es .*Grupo I.*, no Grupo II/)).toBeVisible();
  });

  test('612 bis — el Grupo I con 21 años o más avisa, y en Cataluña se aplican SUS cuantías', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await page.locator('#parentescoSel').selectOption({ label: 'Hijo o descendiente <21 años (Grupo I)' });
    await page.locator('#edadHer').fill('30');
    await expect(page.getByText(/El Grupo I es solo para descendientes de menos de 21 años/)).toBeVisible();

    // Cataluña tiene reducción propia por edad. Hasta el 08/09/2026 no se modelaba y la página
    // se limitaba a advertirlo; ahora se calcula con sus cuantías (12.000 €/año, tope 196.000).
    await page.locator('#edadHer').fill('10');
    await page.selectOption('#ccaaSel', 'cataluna');
    await expect(page.getByText(/12\.000 € por cada año de menos de 21/)).toBeVisible();

    // 100.000 + 11 × 12.000 = 232.000, topado en 196.000 (art. 2 Ley 19/2010). Con las
    // cuantías estatales habrían salido 47.858,59 €: cuatro veces menos.
    const reduccion = await page
      .getByText('− Reducción parentesco')
      .locator('xpath=following-sibling::strong[1]')
      .innerText();
    expect(reduccion.replace(/ /g, ' ')).toContain('196.000,00');
  });

  // 613 — al mover cualquiera de los siete deslizadores todas las cifras se recalculaban en
  // silencio para un lector de pantalla, en una herramienta cuyo contenido es el resultado.
  test('613 — los paneles de resultado y el total se anuncian a un lector de pantalla', async ({
    page,
  }) => {
    await page.goto(RUTA);
    const vivos = page.locator('[aria-live="polite"][role="status"]');
    const textos = await vivos.allInnerTexts();
    const todo = textos.join(' ');
    // Las tres liquidaciones, en un solo anuncio por cambio, y el total acumulado.
    expect(todo).toContain('1. ISD al heredar');
    expect(todo).toContain('Coste fiscal total acumulado');
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// INSPECCIÓN 07/09/2026 — tres casos NUEVOS, resueltos a mano ANTES de abrir el
// navegador, sobre ramas de `data/fiscal` que ninguna ronda anterior había
// ejercitado:
//
//   · el escalonado de CANTABRIA (100 % hasta 100.000 €, 99 % por encima) con un
//     ASCENDIENTE: la clave `II-ascendiente` no se había liquidado nunca en esta
//     app, y Cantabria solo aparecía citada en la tarjeta educativa;
//   · el TOPE de 47.858,59 € del art. 20.2.a LISD por sus DOS lados. El Grupo I
//     entró en el catálogo con el hallazgo 612 y solo se probó con 10 años, muy
//     dentro del tope: que el tope MUERDA de verdad —y en qué año exacto empieza
//     a morder— no lo había mirado nadie;
//   · la PRECEDENCIA entre el régimen propio de Cataluña y los requisitos del
//     colateral del art. 20.2.c. Un hermano de 70 años que SÍ convivió los dos
//     años anteriores es el único perfil del Grupo III al que el art. 20.2.c le
//     concedería la reducción; en Cataluña no la recibe, y la app tiene que
//     decir POR QUÉ. Las dos denegaciones se habían probado por separado, nunca
//     juntas y en el orden en que el motor las evalúa.
//
// Y, además, la paridad WEB ↔ motor compartido sobre esas tres herencias nuevas,
// porque la divergencia ya volvió una vez por un sitio distinto del reparado.
//
// De dónde sale cada cifra (ninguna de memoria — la cabecera del fichero tiene el
// inventario completo de `data/fiscal`):
//   REDUCCIONES_PARENTESCO_IS['II-ascendiente'] = 15.956,87 €
//   REDUCCION_VIVIENDA_PORC_IS = 0,95 · REDUCCION_VIVIENDA_MAX_IS = 122.606,47 €
//   REDUCCION_EDAD_MENOR_21_IS = 3.990,72 € · ..._MAX_IS = 47.858,59 €
//   BONIFICACIONES_CCAA_IS['cantabria']…['II-ascendiente'].escalonado
//   BONIFICACIONES_CCAA_IS['asturias']…['I-descendiente'].reduccionBase = 300.000 €
//   REDUCCIONES_PARENTESCO_CATALUNA_IS['III'] = 8.000 €
//   TARIFA_CATALUNA_IS · COEFICIENTES_CATALUNA_IS['III'][0] = 1,5882
//   COEFICIENTES_IIVTNU_2025: 12 años → 0,08 · 15 años → 0,12 · 20 años → 0,45
//   PLUSVALIA_MUNICIPAL_META.tipoOrientativo = 25 %
//   TRAMOS_GANANCIAS_PATRIMONIALES_2025: 19/21/23/27/30 %
// ═════════════════════════════════════════════════════════════════════════════

test.describe('Simulador de heredar vivienda — inspección 07/09/2026', () => {
  /**
   * CASO 1 (NORMAL) — ASCENDIENTE en CANTABRIA, la cadena entera de los tres impuestos.
   *
   * Padre del causante (Grupo II, `reducKey` = 'II-ascendiente'), Cantabria, vivienda
   * habitual del fallecido valorada en 400.000 €, comprada hace 12 años por 120.000 €,
   * valor catastral del suelo 90.000 € sobre un catastral total de 180.000 €, y venta a
   * los 4 años por 470.000 €.
   *
   * ISD:
   *   Base imponible                                                   400.000,00
   *   − Reducción parentesco  REDUCCIONES_PARENTESCO_IS['II-ascendiente'] −15.956,87
   *   − Reducción vivienda    mín(400.000 × 0,95 = 380.000; 122.606,47)  −122.606,47
   *   = Base liquidable                                                 261.436,66
   *   Cuota íntegra por la COLUMNA `cuota` de TARIFA_ESTATAL_IS, tramo del 15,30 %:
   *        23.409,28 + (261.436,66 − 239.389,13) × 15,30 %
   *      = 23.409,28 + 22.047,53 × 0,153 = 23.409,28 + 3.373,27209
   *      = 26.782,55209                                              → «26.782,55 €»
   *   × COEFICIENTES_IS['II'][0] = 1,0000 → cuota tributaria 26.782,55209
   *   Cantabria, escalonado: 261.436,66 > 100.000 → 99 % (NO el 100 % del primer tramo)
   *      bonificación = 26.782,55 × 99 % = 26.514,7245               → «26.514,72 €»
   *   Cuota ISD final = 26.782,55 − 26.514,72                        → «267,83 €»
   *   (hasta el 09/09/2026 la bonificación se pintaba «26.514,73 €», calculada sobre la cuota
   *    tributaria SIN redondear, y entonces la resta escrita daba 267,82 y no 267,83: es la
   *    segunda manifestación del hallazgo 657)
   *
   * Plusvalía municipal (IIVTNU), tipo ORIENTATIVO del módulo (25 %):
   *   12 años de tenencia → COEFICIENTES_IIVTNU_2025[12] = 0,08 (zona plana de la tabla)
   *   Método objetivo = 90.000 × 0,08 × 0,25 =  1.800,00
   *   Método real     = (400.000 − 120.000) × (90.000 / 180.000) × 0,25 = 35.000,00
   *   Se elige el MENOR (RDL 26/2021) = 1.800,00 → objetivo
   *
   * IRPF al vender a los 4 años por 470.000 €:
   *   Valor de adquisición fiscal = 400.000 + 267,83 + 1.800 = 402.067,83
   *   Ganancia = 470.000 − 402.067,83 = 67.932,17
   *        6.000,000000 × 19 % = 1.140,00
   *       44.000,000000 × 21 % = 9.240,00
   *       17.932,174479 × 23 % = 4.124,40013019
   *                              ──────────────
   *                               14.504,40013019                    → «14.504,40 €»
   *
   * TOTAL = 267,8255209 + 1.800 + 14.504,40013019 = 16.572,2256511  → «16.572,23 €»
   * Sobre la venta = 16.572,2256511 / 470.000 × 100 = 3,5260 %       → «3,53 %»
   */
  test('CASO 1 (normal) — ascendiente en Cantabria: 267,83 € + 1800,00 € + 14.504,40 € = 16.572,23 €', async ({
    page,
  }) => {
    await page.goto(RUTA);

    await page.selectOption('#parentescoSel', 'padre');
    await page.selectOption('#ccaaSel', 'cantabria');
    await mover(page, 'edadHer', 68);
    await mover(page, 'anioAdq', ANIO - 12);
    await mover(page, 'valorAdq', 120000);
    await mover(page, 'valorRef', 400000);
    await mover(page, 'valorSuelo', 90000);
    await mover(page, 'valorCatastralTotal', 180000);
    await casilla(page, 'viviendaHabitual', true);
    await mover(page, 'aniosVenta', 4);
    await mover(page, 'valorVta', 470000);

    // ── ISD ──────────────────────────────────────────────────────────────────
    expect(await panel(page, ISD)).toContain('Cantabria — Grupo II');
    expect(await linea(page, ISD, 'Base imponible (valor referencia)')).toBe('400.000,00 €');
    expect(await linea(page, ISD, '− Reducción parentesco')).toBe('−15.956,87 €');
    // El tope manda: el 95 % de 400.000 son 380.000, muy por encima de 122.606,47
    expect(await linea(page, ISD, '− Reducción vivienda habitual (95%)')).toBe('−122.606,47 €');
    expect(await linea(page, ISD, '= Base liquidable')).toBe('261.436,66 €');
    expect(await linea(page, ISD, 'Cuota íntegra (tarifa)')).toBe('26.782,55 €');
    expect(await linea(page, ISD, '× Coef. patrimonio (Grupo II)')).toBe('×1,0000');
    expect(await linea(page, ISD, '= Cuota tributaria')).toBe('26.782,55 €');
    // El segundo escalón de Cantabria: 99 %, no el 100 % que rige por debajo de 100.000 €
    expect(await panel(page, ISD)).toContain('Bonificación CCAA (99,0%)');
    // 26.782,55 × 99 % = 26.514,7245 → 26.514,72, y 26.782,55 − 26.514,72 = 267,83 (657)
    expect(await linea(page, ISD, '− Bonificación CCAA (99,0%)')).toBe('−26.514,72 €');
    expect(await linea(page, ISD, 'Cuota ISD final')).toBe('267,83 €');

    // ── Plusvalía municipal ──────────────────────────────────────────────────
    expect(await panel(page, IIVTNU)).toContain('12 años de tenencia');
    expect(await linea(page, IIVTNU, 'Coeficiente 12 años')).toBe('0,08');
    expect(await linea(page, IIVTNU, 'Tipo municipal (orientativo)')).toBe('25%');
    expect(await linea(page, IIVTNU, 'Método objetivo')).toBe('1800,00 €');
    expect(await linea(page, IIVTNU, 'Método real (suelo)')).toBe('35.000,00 €');
    expect(await linea(page, IIVTNU, 'Método elegido')).toBe('Objetivo (menor)');
    expect(await linea(page, IIVTNU, 'Cuota plusvalía municipal')).toBe('1800,00 €');

    // ── IRPF ─────────────────────────────────────────────────────────────────
    expect(await linea(page, IRPF, 'Valor adquisición fiscal*')).toBe('402.067,83 €');
    expect(await linea(page, IRPF, 'Ganancia patrimonial')).toBe('67.932,17 €');
    expect(await linea(page, IRPF, 'Cuota IRPF venta')).toBe('14.504,40 €');

    // ── Total ────────────────────────────────────────────────────────────────
    const total = await bloqueTotal(page);
    expect(total).toContain('16.572,23');
    expect(total).toContain('3,53%');
    expect(total).not.toMatch(/16,572\.23/); // nunca formato US
  });

  /**
   * CASO 2 (LÍMITE) — el TOPE del art. 20.2.a LISD, cercado por sus dos lados.
   *
   * `REDUCCION_EDAD_MENOR_21_IS` = 3.990,72 € por cada año por debajo de 21, sin que el
   * TOTAL exceda de `REDUCCION_EDAD_MENOR_21_MAX_IS` = 47.858,59 €. Partiendo de los
   * 15.956,87 € de la reducción de parentesco, el tope empieza a morder cuando
   *
   *      15.956,87 + (21 − edad) × 3.990,72 > 47.858,59
   *      (21 − edad) > 7,9939…  →  21 − edad ≥ 8  →  edad ≤ 13
   *
   * O sea: 14 años es el último año en el que la reducción se calcula entera, y 13 el
   * primero en el que el tope la recorta. Un año de diferencia y el comportamiento del
   * artículo cambia de régimen, así que se prueban los dos, más un tercer año por debajo
   * (12) para ver que el tope NO sigue subiendo.
   *
   * Asturias, porque es la única CCAA que no bonifica en cuota a los Grupos I y II
   * (su beneficio es la reducción de 300.000 € en BASE): con un 99 % de bonificación
   * encima, la diferencia entre los dos lados del tope quedaría escondida tras el
   * redondeo. Vivienda de 500.000 € que NO era la habitual del causante, para que la
   * única reducción en juego sea la del art. 20.2.a.
   *
   *  (a) 14 años → 15.956,87 + 7 × 3.990,72 = 15.956,87 + 27.935,04 = 43.891,91 (sin tope)
   *      Base liquidable = 500.000 − 43.891,91 − 300.000 = 156.108,09
   *      Cuota íntegra = 7.127,47 + (156.108,09 − 79.881,18) × 10,20 %
   *                    = 7.127,47 + 7.775,14482 = 14.902,61482        → «14.902,61 €»
   *
   *  (b) 13 años → 15.956,87 + 8 × 3.990,72 = 47.882,63 → TOPADA en 47.858,59
   *      Base liquidable = 500.000 − 47.858,59 − 300.000 = 152.141,41
   *      Cuota íntegra = 7.127,47 + (152.141,41 − 79.881,18) × 10,20 %
   *                    = 7.127,47 + 7.370,54346 = 14.498,01346        → «14.498,01 €»
   *
   *  (c) 12 años → 15.956,87 + 9 × 3.990,72 = 51.873,35 → TOPADA en los MISMOS 47.858,59,
   *      así que la cuota no se mueve de 14.498,01 €. Si el tope no estuviera, aquí
   *      bajaría otros 407 € y el test lo vería.
   *
   * Plusvalía en los tres: adquisición hace 20 años → COEFICIENTES_IIVTNU_2025[20] = 0,45
   *   objetivo = 150.000 × 0,45 × 0,25 = 16.875,00
   *   real     = (500.000 − 100.000) × (150.000 / 300.000) × 0,25 = 50.000,00 → gana el objetivo
   * Sin venta (0 años), así que no hay IRPF: TOTAL = ISD + 16.875,00.
   */
  test('CASO 2 (límite) — el tope de 47.858,59 € del art. 20.2.a: muerde a los 13 años, no a los 14', async ({
    page,
  }) => {
    await page.goto(RUTA);

    await page.selectOption('#parentescoSel', 'hijo_menor21');
    await page.selectOption('#ccaaSel', 'asturias');
    await mover(page, 'anioAdq', ANIO - 20);
    await mover(page, 'valorAdq', 100000);
    await mover(page, 'valorRef', 500000);
    await mover(page, 'valorSuelo', 150000);
    await mover(page, 'valorCatastralTotal', 300000);
    await casilla(page, 'viviendaHabitual', false);
    await mover(page, 'aniosVenta', 0);

    // (a) 14 años — el último año SIN tope
    await mover(page, 'edadHer', 14);
    expect(await panel(page, ISD)).toContain('Principado de Asturias — Grupo I');
    expect(await linea(page, ISD, '− Reducción parentesco')).toBe('−43.891,91 €');
    expect(await linea(page, ISD, '− Reducción autonómica (Principado de Asturias)')).toBe(
      '−300.000,00 €'
    );
    expect(await linea(page, ISD, '= Base liquidable')).toBe('156.108,09 €');
    expect(await linea(page, ISD, 'Cuota íntegra (tarifa)')).toBe('14.902,61 €');
    expect(await linea(page, ISD, '× Coef. patrimonio (Grupo I)')).toBe('×1,0000');
    expect(await linea(page, ISD, 'Cuota ISD final')).toBe('14.902,61 €');

    // (b) 13 años — el primer año CON tope: la reducción bruta serían 47.882,63 €
    await mover(page, 'edadHer', 13);
    expect(await linea(page, ISD, '− Reducción parentesco')).toBe('−47.858,59 €');
    expect(await linea(page, ISD, '= Base liquidable')).toBe('152.141,41 €');
    expect(await linea(page, ISD, 'Cuota ISD final')).toBe('14.498,01 €');

    // (c) 12 años — el tope NO sigue subiendo: misma reducción y misma cuota que con 13
    await mover(page, 'edadHer', 12);
    expect(await linea(page, ISD, '− Reducción parentesco')).toBe('−47.858,59 €');
    expect(await linea(page, ISD, 'Cuota ISD final')).toBe('14.498,01 €');

    // La plusvalía no depende de la edad del heredero, y el IRPF no existe sin venta
    expect(await linea(page, IIVTNU, 'Coeficiente 20 años')).toBe('0,45');
    expect(await linea(page, IIVTNU, 'Cuota plusvalía municipal')).toBe('16.875,00 €');
    expect(await panel(page, IRPF)).toContain('Sin venta simulada');
    expect(await bloqueTotal(page)).toContain('31.373,01'); // 14.498,01 + 16.875,00
  });

  /**
   * CASO 3 (RECHAZO) — la reducción por vivienda habitual se DENIEGA, y por el motivo
   * correcto de los dos que concurren.
   *
   * Hermano de 70 años que SÍ convivió con el causante los dos años anteriores: el único
   * perfil del Grupo III con derecho a la reducción por vivienda habitual, tanto por el
   * art. 20.2.c LISD como por el art. 17 de la Ley 19/2010 catalana (edad ≥
   * `EDAD_MIN_COLATERAL_VIVIENDA_IS` = 65 y convivencia).
   *
   * ⚠️ Reescrito el 08/09/2026. Nació como caso de RECHAZO: Cataluña denegaba la reducción a
   * todo el mundo porque su régimen no estaba modelado, y el caso comprobaba que al menos se
   * dijera el motivo correcto —el catalán, no «pariente colateral menor de 65 años», que
   * habría sido falso—. Ahora que el régimen catalán se calcula, este heredero cobra la
   * reducción que le corresponde y la casilla de convivencia vuelve a decidir. Lo que era su
   * conclusión («marcar o desmarcar la casilla NO puede mover la cuota») era una consecuencia
   * del agujero, no una regla: un caso escrito para ejercitar la casilla no ejercitaba nada.
   *
   *   Base imponible                                                    300.000,00
   *   − Reducción parentesco  REDUCCIONES_PARENTESCO_CATALUNA_IS['III']    −8.000,00
   *   − Reducción vivienda    95 % de 300.000 (tope catalán 500.000)     −285.000,00
   *   = Base liquidable                                                    7.000,00
   *   Cuota íntegra por TARIFA_CATALUNA_IS, primer tramo: 7 % de 7.000 =      490,00
   *   × COEFICIENTES_CATALUNA_IS['III'][0] = 1,5882 → 778,218            → «778,22 €»
   *
   * Y en la misma pantalla:
   *
   *   Plusvalía: valor de adquisición = valor de referencia = 300.000 €, así que el
   *   incremento es EXACTAMENTE cero. El RDL 26/2021 no sujeta la transmisión sin
   *   incremento, y el borde es `<= 0`, no `< 0`: la cuota tiene que ser 0,00 € y el
   *   método, «Exenta» — aunque el objetivo calculado (90.000 × 0,12 × 0,25 = 2.700,00 €)
   *   siga a la vista.
   *
   *   IRPF: venta a los 3 años por 400.000 €.
   *     Valor de adquisición fiscal = 300.000 + 778,218 + 0 = 300.778,218
   *     Ganancia = 400.000 − 300.778,218 = 99.221,782 → 21.701,00986   → «21.701,01 €»
   *
   *   TOTAL = 778,218 + 0 + 21.701,00986 = 22.479,22786                → «22.479,23 €»
   */
  test('CASO 3 — colateral de 70 años que convivió: en Cataluña SÍ reduce, y la casilla decide', async ({
    page,
  }) => {
    await page.goto(RUTA);

    await page.selectOption('#parentescoSel', 'hermano');
    await page.selectOption('#ccaaSel', 'cataluna');
    await mover(page, 'edadHer', 70);
    await mover(page, 'anioAdq', ANIO - 15);
    await mover(page, 'valorAdq', 300000);
    await mover(page, 'valorRef', 300000);
    await mover(page, 'valorSuelo', 90000);
    await mover(page, 'valorCatastralTotal', 200000);
    await casilla(page, 'viviendaHabitual', true);
    await casilla(page, 'convivencia', true); // cumple el art. 20.2.c… y aun así no aplica
    await mover(page, 'aniosVenta', 3);
    await mover(page, 'valorVta', 400000);

    // El art. 17 de la Ley 19/2010 le concede la reducción al colateral de 65 o más que
    // convivió los dos años anteriores, igual que el art. 20.2.c estatal: se aplica.
    const isd = await panel(page, ISD);
    expect(isd).toContain('Cataluña — Grupo III');
    expect(isd).not.toContain('pariente colateral menor de');
    expect(isd).not.toContain('que no convivió');

    expect(await linea(page, ISD, '− Reducción parentesco')).toBe('−8000,00 €');
    // 95 % de 300.000 = 285.000, por debajo del tope catalán de 500.000
    expect(await linea(page, ISD, '− Reducción vivienda habitual (95%)')).toBe('−285.000,00 €');
    expect(await linea(page, ISD, '= Base liquidable')).toBe('7000,00 €');
    // Primer tramo de TARIFA_CATALUNA_IS: 7 % de 7.000 = 490,00
    expect(await linea(page, ISD, 'Cuota íntegra (tarifa)')).toBe('490,00 €');
    expect(await linea(page, ISD, '× Coef. patrimonio (Grupo III)')).toBe('×1,5882');
    // 490 × 1,5882 = 778,218
    expect(await linea(page, ISD, 'Cuota ISD final')).toBe('778,22 €');

    // Plusvalía: incremento EXACTAMENTE cero → no sujeta (el borde es «<= 0»)
    expect(await linea(page, IIVTNU, 'Método objetivo')).toBe('2700,00 €');
    expect(await linea(page, IIVTNU, 'Método real (suelo)')).toBe('Exenta (sin ganancia)');
    expect(await linea(page, IIVTNU, 'Método elegido')).toBe('Exenta');
    expect(await linea(page, IIVTNU, 'Cuota plusvalía municipal')).toBe('0,00 €');

    // Valor de adquisición fiscal = 300.000 + 778,218 = 300.778,218
    // Ganancia = 400.000 − 300.778,218 = 99.221,782
    //      6.000,000 × 19 % =  1.140,00
    //     44.000,000 × 21 % =  9.240,00
    //     49.221,782 × 23 % = 11.321,00986
    //                         ────────────
    //                         21.701,00986
    expect(await linea(page, IRPF, 'Valor adquisición fiscal*')).toBe('300.778,22 €');
    expect(await linea(page, IRPF, 'Cuota IRPF venta')).toBe('21.701,01 €');
    expect(await bloqueTotal(page)).toContain('22.479,23');

    /**
     * Y desmarcar la convivencia SÍ mueve la cuota, que es lo que este caso vino a comprobar.
     * Las cifras de esta segunda mitad son, literalmente, las que el test esperaba en su
     * versión anterior para el heredero que sí convivía: mientras Cataluña denegaba la
     * reducción a todo el mundo, cumplir el requisito o no cumplirlo daba igual, y un caso
     * construido para ejercitar la casilla no ejercitaba nada.
     *
     *   Base liquidable 292.000 → 14.500 + (292.000 − 150.000) × 17 % = 38.640,00
     *   × 1,5882 = 61.368,048 → «61.368,05 €»
     *   Ganancia = 400.000 − 361.368,048 = 38.631,952 → 1.140 + 6.852,70992 = 7.992,70992
     */
    await casilla(page, 'convivencia', false);
    expect(await panel(page, ISD)).toContain('que no convivió');
    expect(await linea(page, ISD, '= Base liquidable')).toBe('292.000,00 €');
    expect(await linea(page, ISD, 'Cuota ISD final')).toBe('61.368,05 €');
    expect(await linea(page, IRPF, 'Valor adquisición fiscal*')).toBe('361.368,05 €');
    expect(await linea(page, IRPF, 'Cuota IRPF venta')).toBe('7992,71 €');
    expect(await bloqueTotal(page)).toContain('69.360,76');
  });

  /**
   * WEB ↔ MCP — las TRES herencias nuevas, por los dos caminos.
   *
   * La divergencia entre la web y el motor compartido ya se reparó una vez (hallazgo 276,
   * Asturias) y volvió por otro sitio (hallazgos 461 y 462, Cataluña y el colateral). Los
   * tres tests WEB ↔ MCP del 27/08 fijan aquellas tres herencias; estos son perfiles que
   * ninguno de ellos toca: la clave `II-ascendiente`, el Grupo I con el tope del art.
   * 20.2.a, y el colateral CON derecho al 20.2.c en la CCAA que se lo quita.
   */
  test('WEB ↔ MCP — ascendiente, Grupo I topado y colateral catalán: los dos caminos dicen lo mismo', async ({
    page,
  }) => {
    const casos = [
      {
        nombre: 'ascendiente en Cantabria',
        ui: { parentesco: 'padre', ccaa: 'cantabria', edad: 68, valorRef: 400000, vivienda: true },
        motor: {
          baseImponible: 400000, ccaa: 'cantabria', grupo: 'II-ascendiente' as const,
          edadHeredero: 68, viviendaHabitual: 400000,
        },
      },
      {
        nombre: 'Grupo I de 13 años en Asturias (reducción topada)',
        ui: { parentesco: 'hijo_menor21', ccaa: 'asturias', edad: 13, valorRef: 500000, vivienda: false },
        motor: {
          baseImponible: 500000, ccaa: 'asturias', grupo: 'I-descendiente' as const,
          edadHeredero: 13,
        },
      },
      {
        nombre: 'colateral de 70 años que convivió, en Cataluña',
        ui: { parentesco: 'hermano', ccaa: 'cataluna', edad: 70, valorRef: 300000, vivienda: true },
        motor: {
          baseImponible: 300000, ccaa: 'cataluna', grupo: 'III' as const, edadHeredero: 70,
          convivenciaDosAnios: true, viviendaHabitual: 300000,
        },
      },
    ];

    await page.goto(RUTA);
    for (const c of casos) {
      await page.selectOption('#parentescoSel', c.ui.parentesco);
      await page.selectOption('#ccaaSel', c.ui.ccaa);
      await mover(page, 'edadHer', c.ui.edad);
      await mover(page, 'valorRef', c.ui.valorRef);
      await casilla(page, 'viviendaHabitual', c.ui.vivienda);
      if (c.ui.parentesco === 'hermano' && c.ui.vivienda) await casilla(page, 'convivencia', true);

      const web = importe(await linea(page, ISD, 'Cuota ISD final'));
      const motor = calcularSucesion(c.motor).cuotaFinal;
      expect(web, `${c.nombre}: la web dice ${web} y el motor compartido ${motor}`).toBeCloseTo(
        motor,
        2
      );
    }
  });

  /**
   * ✅ HALLAZGO 657 (07/09/2026, MEDIO) — REPARADO el 09/09/2026. Sujeta la reparación como
   * regresión: llevaba `test.fail()` y hoy pasa en verde.
   *
   * El panel del ISD es una liquidación paso a paso: base → reducciones → base liquidable
   * → cuota íntegra → × coeficiente → cuota tributaria → − bonificación → cuota final. Cada
   * línea se redondeaba AL PINTARSE (`formatCurrency`) mientras la cadena seguía por dentro
   * con el número sin redondear, así que la multiplicación y la resta que el usuario ve
   * escritas no daban el número que hay debajo:
   *
   *   Grupo IV, Madrid, 50.000 € (sin reducciones, coeficiente 2,0000):
   *     cuota íntegra    = 2.648,88 + (50.000 − 31.956,87) × 9,35 % = 4.335,912655
   *     pintada          → «4335,91 €»
   *     × 2,0000         → la pantalla decía «8671,83 €», y 4.335,91 × 2 son 8.671,82
   *     `calcularSucesion` (motor del MCP Delegum y de /api/chatgpt/sucesiones) → 8.671,82 €
   *
   *   Y en la línea de la bonificación, que es la que ve la mayoría del catálogo (cualquier
   *   CCAA con 99 %), pasaba lo mismo restando — CASO 1 de esta misma tanda: pintaba una
   *   bonificación de 26.514,73 € calculada sobre la cuota tributaria SIN redondear, y
   *   26.782,55 − 26.514,73 = 267,82 mientras el total decía 267,83 €.
   *
   * LA REPARACIÓN: `page.tsx` redondea al céntimo cada importe con `redondearCentimos`, que
   * es el mismo `Math.round(n * 100) / 100` que `calcularSucesion` aplica en los mismos
   * pasos. NO se pasó a llamar a `calcularSucesion`, y por dos razones medidas:
   *
   *   1. El motor pierde la reducción en BASE de Asturias para el NIETO: lee
   *      `bonificaciones[p.grupo]` con la clave `II-descendiente`, que ninguna CCAA declara,
   *      así que `reduccionAutonomicaBase` se queda en 0 mientras `claveBonificacion` SÍ la
   *      colapsa sobre `II` y rotula «Reducción adicional de 300.000 € … ya aplicada antes
   *      de la tarifa». La web sí la aplica desde el hallazgo 200; llamarlo habría hecho
   *      pagar hasta miles de euros de más a ese perfil (18.336 combinaciones del barrido).
   *   2. El motor tampoco cuadra: publica la bonificación redondeada pero calcula la cuota
   *      final redondeando la RESTA sin redondear, así que sus dos campos se contradicen en
   *      20.104 combinaciones (ver la GUARDA de Castilla-La Mancha). Llamarlo no habría
   *      cerrado este hallazgo, que va justamente de que la aritmética impresa salga.
   *
   * Los dos defectos son de `lib/calculadoras/sucesiones.ts` y se reportaron sin tocarlo.
   */
  test(
    'REGRESIÓN 657 — la cuota tributaria impresa es la cuota íntegra impresa por el coeficiente',
    async ({ page }) => {
      await page.goto(RUTA);
      await page.selectOption('#parentescoSel', 'sin_parentesco');
      await page.selectOption('#ccaaSel', 'madrid');
      await mover(page, 'edadHer', 40);
      await mover(page, 'valorRef', 50000);
      await mover(page, 'aniosVenta', 0);

      const cuotaIntegra = importe(await linea(page, ISD, 'Cuota íntegra (tarifa)'));
      const coeficiente = importe(await linea(page, ISD, '× Coef. patrimonio (Grupo IV)'));
      const cuotaTributaria = importe(await linea(page, ISD, '= Cuota tributaria'));

      expect(cuotaIntegra).toBe(4335.91);
      expect(coeficiente).toBe(2);
      // 4.335,91 × 2,0000 = 8.671,82 — hasta el 09/09/2026 la pantalla decía 8.671,83
      expect(cuotaTributaria).toBe(Math.round(cuotaIntegra * coeficiente * 100) / 100);

      // Y el motor compartido, con la misma herencia, liquida 8.671,82 €
      const motor = calcularSucesion({ baseImponible: 50000, ccaa: 'madrid', grupo: 'IV', edadHeredero: 40 });
      expect(importe(await linea(page, ISD, 'Cuota ISD final'))).toBe(motor.cuotaFinal);
    }
  );

  /**
   * REGRESIÓN 657 (bis) — la INVARIANTE: la cadena impresa cuadra consigo misma.
   *
   * El test de arriba fija un importe concreto; éste fija lo que el hallazgo pedía de
   * verdad. Lee los cinco números TAL COMO SE PINTAN y comprueba las dos operaciones que el
   * usuario ve escritas en el panel:
   *
   *     cuota íntegra × coeficiente = cuota tributaria
   *     cuota tributaria − bonificación = cuota ISD final
   *
   * Un importe esperado protege un caso; esto protege la propiedad, que es lo que hace
   * auditable una liquidación. Los cinco perfiles son los que la rompían antes del
   * 09/09/2026: dos por el PRODUCTO (los Grupos III y IV, los del coeficiente distinto de
   * 1) y tres por la RESTA (las CCAA que bonifican, que es lo que ve casi todo el mundo).
   * En el barrido de las 2.233.392 combinaciones alcanzables con los deslizadores, la
   * cadena no cuadraba en 787.942 (el 35 %) y ahora cuadra en las 2.233.392.
   */
  test('REGRESIÓN 657 (bis) — el producto y la resta escritos dan el total escrito', async ({
    page,
  }) => {
    /** El importe de la línea de bonificación, cuya etiqueta lleva dentro el porcentaje. */
    const bonificacionImpresa = (textoPanel: string): number => {
      const m = textoPanel.match(/Bonificaci\u00f3n CCAA \([^)]*\)\s*\u2212\s*([\d.]*\d,\d\d)/);
      if (!m) throw new Error(`Sin línea de bonificación en el panel: ${textoPanel}`);
      return importe(m[1]);
    };

    const perfiles = [
      // Rompe el PRODUCTO: coeficiente 2,0000 sobre una cuota íntegra con decimales largos
      { nombre: 'Grupo IV en Madrid, 50.000 €', parentesco: 'sin_parentesco', ccaa: 'madrid', edad: 40, valorRef: 50000, vivienda: false, grupoCoef: 'IV' },
      // Rompe el PRODUCTO por el otro extremo del deslizador (tramo del 25,50 %)
      { nombre: 'Grupo IV en Asturias, 2.000.000 €', parentesco: 'sin_parentesco', ccaa: 'asturias', edad: 50, valorRef: 2000000, vivienda: false, grupoCoef: 'IV' },
      // Rompe la RESTA: el 99 % de Cantabria sobre el ascendiente (CASO 1 de esta tanda)
      { nombre: 'ascendiente en Cantabria, 400.000 €', parentesco: 'padre', ccaa: 'cantabria', edad: 68, valorRef: 400000, vivienda: true, grupoCoef: 'II' },
      // Rompe la RESTA con coeficiente 1,5882 y el 50 % de Madrid al Grupo III
      { nombre: 'colateral en Madrid, 200.000 €', parentesco: 'hermano', ccaa: 'madrid', edad: 40, valorRef: 200000, vivienda: true, grupoCoef: 'III' },
      // Rompe la RESTA en el peldaño del 90 % de Castilla-La Mancha (el céntimo en el que
      // la web se separa del motor: ver la GUARDA de Castilla-La Mancha más arriba)
      { nombre: 'hijo en Castilla-La Mancha, 400.000 €', parentesco: 'hijo', ccaa: 'castilla-mancha', edad: 45, valorRef: 400000, vivienda: true, grupoCoef: 'II' },
    ];

    await page.goto(RUTA);
    await mover(page, 'aniosVenta', 0); // aislar el ISD

    for (const p of perfiles) {
      await page.selectOption('#parentescoSel', p.parentesco);
      await page.selectOption('#ccaaSel', p.ccaa);
      await mover(page, 'edadHer', p.edad);
      await mover(page, 'valorRef', p.valorRef);
      await casilla(page, 'viviendaHabitual', p.vivienda);

      const texto = await panel(page, ISD);
      const cuotaIntegra = importe(await linea(page, ISD, 'Cuota íntegra (tarifa)'));
      const coeficiente = importe(await linea(page, ISD, `× Coef. patrimonio (Grupo ${p.grupoCoef})`));
      const cuotaTributaria = importe(await linea(page, ISD, '= Cuota tributaria'));
      const bonificacion = bonificacionImpresa(texto);
      const cuotaFinal = importe(await linea(page, ISD, 'Cuota ISD final'));

      expect(
        cuotaTributaria,
        `${p.nombre}: ${cuotaIntegra} × ${coeficiente} no da la cuota tributaria escrita`
      ).toBe(Math.round(cuotaIntegra * coeficiente * 100) / 100);

      expect(
        cuotaFinal,
        `${p.nombre}: ${cuotaTributaria} − ${bonificacion} no da la cuota final escrita`
      ).toBe(Math.round((cuotaTributaria - bonificacion) * 100) / 100);
    }
  });

  /**
   * ✅ HALLAZGO 07/09/2026 (ALTO) — REPARADO el 08/09/2026. Sujeta la reparación como
   * regresión: llevaba `test.fail()` y hoy pasa en verde.
   *
   * La FAQ del bloque educativo decía: «Si superas el plazo sin liquidar, hay recargos del
   * 5% al 20% más intereses». Ésa es la escala ANTERIOR a la Ley 11/2021. El art. 27.2 LGT
   * vigente —redacción del art. 13.3 de la Ley 11/2021, BOE-A-2021-11473— es «1 por ciento
   * más otro 1 por ciento adicional por cada mes completo de retraso», y 15 % más intereses
   * de demora una vez transcurridos 12 meses. Nunca 5 %, nunca 20 %.
   *
   * La escala canónica NO hay que escribirla: `lib/calculadoras/recargoPresentacionTardia.ts`
   * la exporta como `ESCALA_RECARGO_EXTEMPORANEO` y `porcentajeRecargoExtemporaneo(meses)`,
   * verificada el 07/09/2026 contra el texto consolidado del BOE. Su propia cabecera dice
   * que se hizo pública porque los hallazgos 436 y 454 del Inspector encontraron
   * «recargos del 5% al 20%» en otras dos apps: es literalmente el mismo texto, aquí.
   *
   * Sobre la cuota de ISD de 267,83 € que esta misma app liquida en el CASO 1 de arriba:
   *   · retraso de menos de un mes → art. 27.2: 1 % = 2,68 €.
   *     El texto prometía un suelo del 5 % = 13,39 €, cinco veces más.
   *   · retraso de más de doce meses → art. 27.2: 15 % = 40,17 € + intereses de demora.
   *     El texto prometía un techo del 20 % = 53,57 €.
   *
   * Y es el párrafo que responde «¿Cuál es el plazo para liquidar el ISD?» en una app de
   * riesgo 1 CRÍTICO: quien lo lee está decidiendo si le compensa apurar el plazo.
   *
   * La FAQ compone hoy sus porcentajes con `ESCALA_RECARGO_EXTEMPORANEO`, así que el día
   * que cambie el art. 27.2 cambia sola. El MISMO texto derogado vivía en
   * `orientacion-tramitacion-herencias`, del mismo clúster, y se reparó igual.
   */
  test(
    'HALLAZGO reparado — la FAQ del plazo compone el recargo con el art. 27.2 LGT, no con la escala derogada',
    async ({ page }) => {
      await page.goto(RUTA);

      const faq = await page.evaluate(() => {
        const s = [...document.querySelectorAll('strong')].find(e =>
          (e.textContent ?? '').includes('plazo para liquidar el ISD')
        );
        return (s?.parentElement?.textContent ?? '').replace(/\s+/g, ' ').trim();
      });

      expect(faq).toContain('6 meses'); // esto sí es correcto: el plazo del art. 67 RISD
      // La escala derogada, tal cual la escribe hoy el JSX
      expect(faq).not.toContain('recargos del 5% al 20%');

      // Lo que dice el art. 27.2 LGT según la fuente única del repositorio
      expect(porcentajeRecargoExtemporaneo(0)).toBe(1);   // menos de un mes
      expect(porcentajeRecargoExtemporaneo(8)).toBe(9);   // 1 % + 8 meses completos
      expect(porcentajeRecargoExtemporaneo(13)).toBe(15); // pasados 12 meses, fijo
      expect(ESCALA_RECARGO_EXTEMPORANEO.porcentajeMas12Meses).toBe(15);

      // El texto tendría que hablar del 1 % y del 15 %, no del 5 % y del 20 %
      expect(faq).toMatch(/1\s*%/);
      expect(faq).toMatch(/15\s*%/);
      expect(faq).not.toMatch(/20\s*%/);
    }
  );

  /**
   * ✅ HALLAZGO 658 (07/09/2026, BAJO) — REPARADO el 09/09/2026. Sujeta la reparación como
   * regresión: llevaba `test.fail()` y hoy pasa en verde. Era residuo del hallazgo 609: el
   * JSX seguía escribiendo a
   * mano datos normativos que `data/fiscal` exporta y que este MISMO fichero ya deriva unas
   * líneas más abajo.
   *
   *   · La tabla «Los tres impuestos en cadena» dice «× tramos 19-30%», mientras la FAQ de
   *     la misma página compone ese mismo rango con `TIPO_AHORRO_MIN`-`TIPO_AHORRO_MAX`,
   *     leídos de `TRAMOS_GANANCIAS_PATRIMONIALES_2025`. Es exactamente la forma del
   *     hallazgo 463: la escala escrita a mano se quedó en cuatro tramos cuando el módulo
   *     ya tenía cinco, y nadie se enteró.
   *   · La tarjeta del Grupo IV dice «Coeficiente multiplicador 2,0» en la misma frase en
   *     la que SÍ deriva el otro extremo de la fila («el coeficiente llega a
   *     {formatNumber(COEFICIENTES_IS['IV'][3], 1)}»). El 2,0 es
   *     `COEFICIENTES_IS['IV'][0]`, que la página ya importa y usa en el motor.
   *
   * (En la misma familia, aunque más estable: el «95 %» de la reducción del art. 20.2.c
   * aparecía cinco veces a mano —etiqueta de la casilla, línea del panel, dos tarjetas y la
   * FAQ— siendo `REDUCCION_VIVIENDA_PORC_IS`, mientras su tope SÍ se importaba como
   * `REDUCCION_VIVIENDA_MAX_IS` en las mismas frases.)
   *
   * REPARADO derivando los tres: `TIPO_AHORRO_MIN`-`TIPO_AHORRO_MAX` en la tabla,
   * `COEF_GRUPO_IV_MIN` = `COEFICIENTES_IS['IV'][0]` en la tarjeta y `PORC_REDUCCION_VIVIENDA`
   * = `REDUCCION_VIVIENDA_PORC_IS` en las cinco frases del 95 %. La comprobación es sobre el
   * FUENTE y no sobre la página renderizada, igual que en la regresión de los hallazgos 609
   * y 611: lo que estaba mal no era el número que se ve —era correcto— sino que estuviera
   * escrito, porque una corrección en `data/fiscal` no llegaba al texto.
   */
  test('REGRESIÓN 658 — el JSX no escribe a mano tipos, coeficientes ni el 95 % del art. 20.2.c', async () => {
    const fuente = readFileSync(
      resolve(__dirname, '..', '..', 'app', 'simulador-heredar-vivienda', 'page.tsx'),
      'utf8'
    );
    const jsx = fuente.slice(fuente.indexOf('export default function'));

    // La escala de la base del ahorro, en la tabla comparativa
    expect(jsx).not.toContain('19-30%');
    // El porcentaje del art. 20.2.c, en sus cinco apariciones
    expect(jsx).not.toContain('95%');
    // El coeficiente del Grupo IV, en la tarjeta de casos típicos
    expect(jsx).not.toContain('Coeficiente multiplicador 2,0');
  });
});
