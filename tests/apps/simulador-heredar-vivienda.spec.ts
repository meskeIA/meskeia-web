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
 * ✅ Los tres hallazgos que esta cabecera daba por ABIERTOS —la regla del art. 20.2.c
 * separada entre la web y el motor, la escala del ahorro incompleta en el `faqJsonLd` y
 * Castilla-La Mancha en la lista de CCAA «a casi cero»— se repararon entre el 27/08 y el
 * 10/09/2026 y tienen abajo su test de REGRESIÓN sin `test.fail()`. La cabecera se quedó
 * anunciándolos hasta el 21/09/2026: corregido entonces, porque una lista de hallazgos
 * abiertos que no lo están es exactamente el defecto del hallazgo 867 en otra forma.
 *
 * ⚠️ HALLAZGOS ABIERTOS HOY (21/09/2026), todos con `test.fail()` al final del fichero:
 *   · [21-A] el aviso de la complementaria salta aunque la regularización sea de 0,00 €.
 *   · [21-B] la tarjeta «Aprovecha la reducción de vivienda habitual» anuncia el tope
 *     estatal sin decir que lo es — la mitad sin reparar del hallazgo 861.
 *   · [21-C] la fila del IRPF de la tabla educativa describe la ganancia sin descontar el
 *     IIVTNU de la venta — la fórmula que el hallazgo 862 retiró del `faqJsonLd`.
 *   · [21-D] las dos prórrogas de esa misma tabla van sin unidad, y «otros 6» (adicional)
 *     y «hasta 12» (total) no significan lo mismo.
 *
 * De dónde sale CADA cifra esperada (ninguna de memoria: todas de `data/fiscal/`):
 *
 *  ISD — `data/fiscal/sucesiones.ts` (FISCAL_SUCESIONES_META: Ley 29/1987 ISD +
 *  normativas autonómicas 2025, verificado 2025-01-01):
 *    - `REDUCCIONES_PARENTESCO_IS['II']` = 15.956,87 € · `['III']` = 7.993,46 € · `['IV']` = 0 €
 *    - `REDUCCIONES_PARENTESCO_CATALUNA_IS['I-conyuge']` = 100.000 € · `['II']` = 100.000 €
 *      (hijo o hija ≥21) · `['II-descendiente']` = 50.000 € (nieto y demás descendientes
 *      ≥21) · `['II-ascendiente']` = 30.000 € · `['III']` = 8.000 €. `I-descendiente` es el
 *      menor de 21.
 *      ⚠️ Corregido el 21/09/2026: esta línea seguía diciendo `['II']` = 50.000 € y que la
 *      clave valía para «hijo/nieto» indistintamente. Son las cuantías ANTERIORES al
 *      08/09/2026 (f6c0650a), el commit que separó al nieto del hijo tras contrastar con la
 *      Agència Tributària — el mismo dato mal escrito que costó 23.000 € de diferencia.
 *    - `REDUCCION_VIVIENDA_MAX_CATALUNA_IS` = 500.000 € (art. 17 Ley 19/2010) y
 *      `REDUCCION_VIVIENDA_ANIOS_MANTENIMIENTO_CATALUNA_IS` = 5 (art. 19)
 *    - `REDUCCION_VIVIENDA_PORC_IS` = 0,95 · `REDUCCION_VIVIENDA_MAX_IS` = 122.606,47 €
 *    - `TARIFA_ESTATAL_IS`, la escala del art. 21.2 LISD: 16 tramos del 7,65 % al 34 %,
 *      que entra a partir de 797.555,08 € de base liquidable. Hasta el 11/09/2026 eran
 *      SIETE y se quedaban en el 25,50 % (hallazgo 735): todos los valores de este fichero
 *      se recalcularon entonces, y la escala la vigila `tests/tarifa-isd-motor.spec.ts`
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
 *  art. 107.4 TRLRHL en la redacción del art. 24 del RDL 8/2023, verificado 2026-09-24):
 *    - Tipo municipal = `PLUSVALIA_MUNICIPAL_META.tipoOrientativo` = 25 % (NO el 30 % de
 *      `tipoMaximoLegal`: la interfaz rotula «Tipo municipal (orientativo)»)
 *    - Coeficientes máximos del art. 107.4 (`coeficienteIIVTNU`), tabla vigente desde el
 *      01/01/2024: <1 año 0,15 · 1 0,15 · 2 0,14 · 3 0,14 · 4 0,16 · 5 0,18 · 6 0,19 ·
 *      7 0,20 · 8 0,19 · 9 0,15 · 10 0,12 · 11 0,10 · 12-15 0,09 · 16 0,10 · 17 0,13 ·
 *      18 0,17 · 19 0,23 · 20 o más 0,40. Por debajo del año se prorratea por meses
 *      completos, y sin meses (esta app solo pregunta años) se toman 11: 0,15 × 11/12.
 *      La tabla NO es monótona, así que un año de desfase en la tenencia unas veces cobra
 *      de más y otras de menos: por eso los casos fijan el año de adquisición como
 *      `ANIO − n` y comprueban el rótulo «(n años hasta hoy)».
 *    ⚠️ 24/09/2026 (hallazgo 1559): hasta ese día aquí constaba la tabla del RDL 26/2021
 *      (0 años 0,14 · 10 años 0,08 · 16 años 0,16 · 20 o más 0,45…), caducada desde el
 *      01/01/2023, y TODOS los esperados de plusvalía de este fichero —y, en cadena, el IRPF
 *      de la venta y el total— se calcularon con ella. Se recalcularon a mano ese día con la
 *      tabla vigente, cotejada en el BOE (BOE-A-2004-4214, bloque a107, versión 28/01/2026).
 *
 *  IRPF de la ganancia al vender — `TRAMOS_GANANCIAS_PATRIMONIALES_2025` en
 *  `data/fiscal/inmuebles.ts`: 19 % hasta 6.000 · 21 % hasta 50.000 · 23 % hasta 200.000 ·
 *  27 % hasta 300.000 · 30 % en adelante.
 *
 * Formato: `formatCurrency` usa es-ES con agrupación «min2», así que los importes de
 * cuatro dígitos enteros van SIN punto de millares (6454,01 €) y los de cinco o más, con
 * él (509.405,24 €). Las cifras esperadas se escriben literales, tal cual las pinta la app.
 *
 * ⚠️ ESTADO A 13/09/2026 — NO queda ni un `test.fail()` en el fichero: los siete de la tanda
 * del 12/09 se cerraron ese día y sus tests quedan como GUARDAS, al final del fichero.
 *
 * ⚠️ ESTADO A 09/09/2026 — tampoco quedaba ninguno entonces. Los tres «HALLAZGOS
 * ABIERTOS» que enumera la cabecera de arriba se cerraron el 08/09/2026, y los TRES de la
 * inspección del 07/09/2026 —que van al final del todo— están reparados: el ALTO (656, la
 * escala de recargo derogada de la FAQ del plazo) el 08/09/2026, y el MEDIO 657 (el
 * desglose impreso que no cuadraba consigo mismo) y el BAJO 658 (datos normativos
 * tecleados que el mismo fichero ya deriva) el 09/09/2026. Sus tests quedan como REGRESIÓN.
 *
 * ⚠️ 13/09/2026 — REPARACIÓN de los siete hallazgos de la tanda del 12/09 (778 a 784). Dos
 * de ellos cambian TODAS las cifras de este fichero, así que conviene saberlo antes de leer
 * un golden y creer que está mal:
 *
 *   · [780] la base imponible del ISD lleva dentro el ajuar doméstico del art. 15 LISD (un
 *     3 % del caudal, presunción destruible con prueba), como ya hacía el motor compartido
 *     `calcularSucesion` y la app hermana `estimador-impuesto-sucesiones`. Toda cuota de ISD
 *     de este fichero sube, y las llamadas al motor que sirven de oráculo llevan ahora
 *     `incluyeAjuar: true`. En los tres casos de BORDE —el escalón de La Rioja, el umbral de
 *     exención de Galicia y la escala ponderada catalana— se recolocó la ENTRADA para dejar
 *     la base liquidable donde estaba, en vez de cambiar el porcentaje esperado: lo que esos
 *     tests cercan es el borde, y con la entrada vieja se habrían quedado en verde sin
 *     ejercitar ya nada.
 *
 *   · [779] el TOTAL incluye la plusvalía municipal de la SEGUNDA transmisión (la venta), y
 *     esa cuota se descuenta además del valor de transmisión en el IRPF (art. 35.2 LIRPF).
 *     Los casos que venden cambian por partida doble: el total sube y la ganancia baja.
 *
 *   · [778] cuando la venta cae dentro del plazo de mantenimiento del art. 20.2.c LISD (diez
 *     años, cinco en Cataluña), el total lleva una línea más —«ISD regularizado»— con lo que
 *     habría que ingresar en la complementaria.
 *
 * Los goldens se re-dedujeron con el motor compartido como oráculo independiente (el test
 * «WEB ↔ MOTOR» barre las 17 CCAA por los 7 parentescos) y la aritmética de cada caso está
 * desarrollada a mano en su comentario.
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
import {
  esperarHidratacion,
  esperarValorEnReact,
  leerValorEnReact,
  sembrarValorAcotado,
} from './_hidratacion';
import {
  calcularSucesion,
  // Añadido el 14/09/2026: la edad mínima del colateral del art. 20.2.c, para comprobar que
  // la cifra que lee el usuario sale de la misma constante que decide la reducción
  EDAD_MIN_COLATERAL_VIVIENDA_IS,
  type GrupoParentescoIS,
} from '../../lib/calculadoras/sucesiones';
import {
  BONIFICACIONES_CCAA_IS,
  REDUCCIONES_PARENTESCO_IS,
  REDUCCIONES_PARENTESCO_CATALUNA_IS,
  REDUCCION_VIVIENDA_MAX_IS,
  REDUCCION_VIVIENDA_MAX_CATALUNA_IS,
  REDUCCION_VIVIENDA_ANIOS_MANTENIMIENTO_CATALUNA_IS,
  PLUSVALIA_MUNICIPAL_META,
  FISCAL_INMUEBLES_META,
  // Añadidos el 12/09/2026 por los casos de la re-inspección de ese día
  REDUCCION_VIVIENDA_ANIOS_MANTENIMIENTO_IS,
  REDUCCION_EDAD_MENOR_21_CATALUNA_IS,
  REDUCCION_EDAD_MENOR_21_MAX_CATALUNA_IS,
  COEFICIENTES_IIVTNU_2025,
  PORC_AJUAR_DOMESTICO_IS,
  // Añadidos el 13/09/2026 por las guardas de la reparación (hallazgos 781 y 782)
  GANANCIAS_PATRIMONIALES_META,
  PLAZO_ISD,
  // Añadido el 21/09/2026: el plazo del IIVTNU ya tiene constante propia (hallazgo 864), y
  // la tabla educativa que lo enseña es la que se audita al final del fichero
  PLAZO_IIVTNU,
  // Añadido el 24/09/2026 (hallazgos 1559 y 1560): el coeficiente del art. 107.4 ya resuelto,
  // que es lo que la app lee desde ese día en vez de consultar la tabla a mano
  coeficienteIIVTNU,
} from '../../data/fiscal';
import {
  ESCALA_RECARGO_EXTEMPORANEO,
  porcentajeRecargoExtemporaneo,
} from '../../lib/calculadoras/recargoPresentacionTardia';

const RUTA = '/simulador-heredar-vivienda/';

/** El año que la app usa para la tenencia del causante: el del reloj, ya no una constante. */
const ANIO = new Date().getFullYear();

/** Año y mes (1-12) de hace `n` meses completos: la app cuenta meses desde el 25/09/2026. */
function haceMeses(n: number): { anio: number; mes: number } {
  const hoy = new Date();
  const total = hoy.getFullYear() * 12 + hoy.getMonth() - n; // getMonth() va de 0 a 11
  return { anio: Math.floor(total / 12), mes: (total % 12) + 1 };
}

/**
 * Abre el simulador y espera a que la app esté VIVA. El `goto` solo garantiza que los chunks
 * se han descargado, no que React los haya ejecutado: hasta entonces los deslizadores y las
 * casillas están pintados pero sordos, y un movimiento se pierde dejando el DOM cambiado y el
 * estado de React en el valor viejo — con lo que el test mediría otra herencia sin enterarse
 * (ver tests/apps/_hidratacion.ts). En una app FISCAL eso es una cuota equivocada dada por
 * buena, así que ninguna prueba de aquí toca nada antes de esta espera.
 */
async function abrir(page: Page): Promise<void> {
  await page.goto(RUTA);
  await esperarHidratacion(page, ['#valorRef', '#edadHer']);
}

/**
 * Mueve un `input[type=range]` controlado por React y comprueba que el ESTADO de React lo
 * recogió. `fill()` no dispara el onChange de React en un range, así que se usa el setter
 * nativo + evento `input` burbujeante; el testigo es el valor que el control ACEPTA, porque
 * varios casos consisten justo en ver cómo el navegador capa un valor imposible.
 *
 * Si el deslizador YA está donde se le pide, pasa antes por el escalón de al lado. Cada test de
 * aquí declara la herencia entera —valor de referencia, edad, año, catastro…— y una parte de
 * esos valores coincide con los de fábrica (valorRef 200.000, edadHer 45, anioAdq 1995…): sin el
 * rodeo, esos controles quedarían sin comprobar y la cuota se estaría midiendo sobre un dato
 * que el test cree haber fijado. Detectado con `SIEMBRA_ESTRICTA=1`. El rodeo es inocuo: cada
 * onChange escribe SOLO su propio estado, ninguno recorta a otro.
 */
async function mover(page: Page, id: string, valor: number | string): Promise<void> {
  const sel = `#${id}`;
  if ((await leerValorEnReact(page, sel)) === String(valor)) {
    const { min, max, step } = await page
      .locator(sel)
      .evaluate((el: HTMLInputElement) => ({
        min: Number(el.min),
        max: Number(el.max),
        step: Number(el.step),
      }));
    const n = Number(valor);
    await sembrarValorAcotado(page, sel, n + step <= max ? n + step : Math.max(min, n - step));
  }
  await sembrarValorAcotado(page, sel, valor);
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
   * ⚠️ DERIVACIÓN REHECHA el 15/09/2026 (hallazgo 867). La de antes partía de una base de
   * 500.000 € —sin el ajuar del art. 15 LISD, que entró con el hallazgo 780 el 13/09— y de un
   * valor de adquisición sin el ISD regularizado, que entró con el 859. Las aserciones se
   * habían actualizado y los comentarios que las justifican no, así que el golden ya no se
   * podía re-verificar leyendo el caso: el siguiente que se fiara del comentario «repararía»
   * un valor correcto. Toda la aritmética de abajo reproduce hoy, cifra a cifra, lo que la
   * app imprime.
   *
   * ISD:
   *   Masa hereditaria                                         500.000,00
   *   + Ajuar doméstico (3 %, art. 15 LISD)                     15.000,00
   *   = Base imponible                                         515.000,00
   *   − Reducción parentesco  REDUCCIONES_PARENTESCO_IS['II']  −15.956,87
   *   − Reducción vivienda    mín(500.000 × 0,95; 122.606,47) −122.606,47
   *   − Reducción autonómica  asturias…['II'].reduccionBase   −300.000,00
   *   = Base liquidable                                        76.436,66
   *   Cuota íntegra por la COLUMNA `cuota` de TARIFA_ESTATAL_IS (hallazgo 277), tramo que
   *   arranca en 71.893,07:
   *        7.943,98 + (76.436,66 − 71.893,07) × 15,30 %
   *      = 7.943,98 + 695,169270 = 8.639,149270 → «8639,15 €»
   *   × COEFICIENTES_IS['II'][0] = 1,0000  → cuota tributaria 8.639,15
   *   Asturias NO bonifica en cuota (porcentaje 0) → Cuota ISD final = 8.639,15
   *
   * ISD REGULARIZADO (se vende a los 3 años y el art. 20.2.c exige mantener 10):
   *   Base liquidable sin la reducción de vivienda = 515.000 − 15.956,87 − 300.000
   *                                                = 199.043,13
   *   Cuota, tramo que arranca en 159.634,83:
   *        23.063,25 + (199.043,13 − 159.634,83) × 21,25 % = 31.437,51
   *   Regularización = 31.437,51 − 8.639,15 = 22.798,36
   *
   * Plusvalía municipal (IIVTNU), tipo ORIENTATIVO del módulo (25 %) — RECALCULADA el
   * 24/09/2026 con la tabla vigente del art. 107.4 TRLRHL (hallazgo 1559; antes 0,16 y 0,16):
   *   Herencia: 16 años de tenencia → coeficiente 0,10
   *     Método objetivo = 100.000 × 0,10 × 0,25 = 2.500,00
   *     Método real     = (500.000 − 200.000) × (100.000 / 250.000) × 0,25 = 30.000,00
   *     Se elige el MENOR = 2.500,00 → objetivo
   *     (con el 30 % hardcodeado del hallazgo 199 saldrían 3.000,00 €)
   *   Venta: 3 años de tenencia → coeficiente 0,14 → 100.000 × 0,14 × 0,25 = 3.500,00
   *     (real = (600.000 − 500.000) × 0,4 × 0,25 = 10.000,00)
   *
   * IRPF al vender a los 3 años por 600.000 €:
   *   Valor de adquisición fiscal = 500.000 + (8.639,15 + 22.798,36) + 2.500 = 533.937,51
   *     — el ISD que se suma es el EFECTIVAMENTE pagado, regularización incluida (art. 36
   *       LIRPF, que remite al 35.1.b); es la reparación del hallazgo 859.
   *   Valor de transmisión = 600.000 − 3.500 (IIVTNU de la venta, art. 35.2) = 596.500
   *   Ganancia = 596.500 − 533.937,51 = 62.562,49
   *        6.000,00 × 19 % =  1.140,00
   *       44.000,00 × 21 % =  9.240,00
   *       12.562,49 × 23 % =  2.889,3727
   *                           ──────────
   *                            13.269,3727 → «13.269,37 €»
   *
   * TOTAL = 8.639,15 + 22.798,36 + 2.500 + 3.500 + 13.269,3727 = 50.706,8827 → «50.706,88 €»
   * (el total es la suma de los importes escritos desde el hallazgo 657, que es también el
   * que hace que la cuota de ISD entre aquí ya redondeada al céntimo)
   * Porcentaje sobre la venta = 50.706,8827/600.000 × 100 = 8,4511 → «8,45 %»
   */
  test('CASO 1 (normal) — hijo hereda 500.000 € en Asturias y vende a los 3 años: ISD + IIVTNU + IRPF', async ({
    page,
  }) => {
    await abrir(page);

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
    expect(await linea(page, ISD, '= Base imponible')).toBe('515.000,00 €');
    expect(await linea(page, ISD, '− Reducción parentesco')).toBe('−15.956,87 €');
    expect(await linea(page, ISD, '− Reducción vivienda habitual (95%)')).toBe('−122.606,47 €');
    // Hallazgo 200: la reducción de Asturias vive en la BASE, no en la cuota
    expect(await linea(page, ISD, '− Reducción autonómica (Principado de Asturias)')).toBe(
      '−300.000,00 €'
    );
    expect(await linea(page, ISD, '= Base liquidable')).toBe('76.436,66 €');
    // Hallazgo 277: la cuota íntegra se lee de la COLUMNA `cuota` de TARIFA_ESTATAL_IS,
    // como hacen `lib/calculadoras/sucesiones.ts` y los dos estimadores, y no acumulando
    // los tramos marginales. 5703,50 + (61.436,66 − 55.918,17) × 13,60 % = 6454,0146
    // (acumulando marginales salían 5.404,75, y era esta app la única que lo hacía).
    expect(await linea(page, ISD, 'Cuota íntegra (tarifa)')).toBe('8639,15 €');
    // Hallazgo 203: el coeficiente sale de COEFICIENTES_IS, no de una tabla inline
    expect(await linea(page, ISD, '× Coef. patrimonio (Grupo II)')).toBe('×1,0000');
    expect(await linea(page, ISD, '= Cuota tributaria')).toBe('8639,15 €');
    expect(await panel(page, ISD)).toContain('Bonificación CCAA (0,0%)');
    expect(await linea(page, ISD, 'Cuota ISD final')).toBe('8639,15 €');

    // ── Plusvalía municipal ──────────────────────────────────────────────────
    expect(await panel(page, IIVTNU)).toContain('16 años de tenencia');
    // Hallazgo 1559: 16 años → 0,10 en la tabla vigente del art. 107.4 (era 0,16, RDL 26/2021)
    expect(await linea(page, IIVTNU, 'Coeficiente 16 años')).toBe('0,10');
    // Hallazgo 199: el tipo es el ORIENTATIVO del módulo (25 %), no el máximo legal (30 %)
    expect(await linea(page, IIVTNU, 'Tipo municipal (orientativo)')).toBe('25%');
    // 100.000 × 0,10 × 25 % (hallazgo 1559)
    expect(await linea(page, IIVTNU, 'Método objetivo')).toBe('2500,00 €');
    expect(await linea(page, IIVTNU, 'Método real (suelo)')).toBe('30.000,00 €');
    expect(await linea(page, IIVTNU, 'Método elegido')).toBe('Objetivo (menor)');
    expect(await linea(page, IIVTNU, 'Cuota plusvalía municipal')).toBe('2500,00 €');

    // ── IRPF ─────────────────────────────────────────────────────────────────
    // 500.000 + 8.639,15 + 22.798,36 + 2.500 (hallazgo 1559)
    expect(await linea(page, IRPF, 'Valor adquisición fiscal*')).toBe('533.937,51 €');
    // (600.000 − 3.500 de IIVTNU de la venta a 0,14) − 533.937,51
    expect(await linea(page, IRPF, 'Ganancia patrimonial')).toBe('62.562,49 €');
    // 6.000 × 19 % + 44.000 × 21 % + 12.562,49 × 23 % = 13.269,3727
    expect(await linea(page, IRPF, 'Cuota IRPF venta')).toBe('13.269,37 €');

    // ── Total y formato español ──────────────────────────────────────────────
    const total = await bloqueTotal(page);
    // 8.639,15 (ISD) + 22.798,36 (ISD regularizado: la venta a los 3 años pierde la reducción
    // del art. 20.2.c) + 2.500,00 (IIVTNU herencia) + 3.500,00 (IIVTNU venta) + 13.269,37
    // (IRPF) — recalculado con la tabla vigente (hallazgo 1559)
    expect(total).toContain('50.706,88');
    expect(total).toContain('8,45%');
    expect(total).not.toMatch(/50,706\.88/); // nunca formato US

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
   *      Cuota íntegra = 80.655,08 + (499.043,13 − 398.777,54) × 29,75 %
   *                    = 80.655,08 + 29.829,012425 = 110.484,092425 → «110.484,09 €»
   *      Cuota final = 110.484,092425 × 0,01 = 1.104,84092425 → «1104,84 €»
   *
   *  (b) 520.000 − 15.956,87 = 504.043,13  > 500.000 → 98 %
   *      Cuota íntegra = 80.655,08 + 105.265,59 × 29,75 % = 111.971,513025
   *      Cuota final = 111.971,513025 × 0,02 = 2.239,4302605 → «2239,43 €»
   *      (con el 99 % que aplicaba la versión rota saldría la mitad)
   *
   * Plusvalía en ambos: 1995 → tenencia topada en 20 años → coeficiente 0,40 («igual o
   * superior a 20 años» del art. 107.4 vigente; era 0,45 con la tabla caducada del RDL
   * 26/2021, hallazgo 1559) → objetivo 100.000 × 0,40 × 0,25 = 10.000,00, menor que el
   * real → cuota 10.000,00.
   */
  test('CASO 2 (límite) — La Rioja: 99 % justo por debajo del tope de 500.000 € y 98 % justo por encima', async ({
    page,
  }) => {
    await abrir(page);

    await page.selectOption('#parentescoSel', 'hijo');
    await page.selectOption('#ccaaSel', 'rioja');
    await mover(page, 'anioAdq', 1995);
    await mover(page, 'valorAdq', 200000);
    await mover(page, 'valorSuelo', 100000);
    await mover(page, 'valorCatastralTotal', 200000);
    await casilla(page, 'viviendaHabitual', false);
    await mover(page, 'aniosVenta', 0); // aislar el ISD: sin venta

    // ⚠  13/09/2026: los valores de referencia bajan de 515.000/520.000 € a 500.000/505.000 €
    // porque desde hoy la base imponible lleva dentro el ajuar del art. 15 LISD (hallazgo
    // 780). Lo que este caso cerca es el ESCALÓN de La Rioja en 500.000 € de base liquidable,
    // así que se recoloca la entrada para volver a dejar la base donde estaba — cambiar el
    // porcentaje esperado habría dejado el test en verde sin ejercitar ya ningún borde.

    // (a) Base liquidable 499.043,13 € → justo por DEBAJO del tope
    //     500.000 + 3 % = 515.000 − 15.956,87 = 499.043,13
    await mover(page, 'valorRef', 500000);
    expect(await panel(page, ISD)).toContain('La Rioja — Grupo II');
    expect(await linea(page, ISD, '= Base imponible')).toBe('515.000,00 €');
    expect(await linea(page, ISD, '= Base liquidable')).toBe('499.043,13 €');
    expect(await linea(page, ISD, 'Cuota íntegra (tarifa)')).toBe('110.484,09 €');
    expect(await panel(page, ISD)).toContain('Bonificación CCAA (99,0%)');
    expect(await linea(page, ISD, 'Cuota ISD final')).toBe('1104,84 €');
    // 100.000 × 0,40 × 25 % (hallazgo 1559)
    expect(await linea(page, IIVTNU, 'Cuota plusvalía municipal')).toBe('10.000,00 €');
    expect(await bloqueTotal(page)).toContain('11.104,84'); // 1.104,84 + 10.000,00

    // (b) Base liquidable 504.193,13 € → justo por ENCIMA del tope
    //     505.000 + 3 % = 520.150 − 15.956,87 = 504.193,13
    //     cuota íntegra = 80.655,08 + (504.193,13 − 398.777,54) × 29,75 % = 112.016,22
    //     bonificación 98 % = 109.775,90 → cuota final 2.240,32
    await mover(page, 'valorRef', 505000);
    expect(await linea(page, ISD, '= Base liquidable')).toBe('504.193,13 €');
    expect(await linea(page, ISD, 'Cuota íntegra (tarifa)')).toBe('112.016,22 €');
    expect(await panel(page, ISD)).toContain('Bonificación CCAA (98,0%)');
    expect(await linea(page, ISD, 'Cuota ISD final')).toBe('2240,32 €');
    expect(await bloqueTotal(page)).toContain('12.240,32'); // 2.240,32 + 10.000,00 (hallazgo 1559)

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
   *     80.000 × 0,12 × 0,25 = 2.400,00 € (10 años → 0,12 en la tabla vigente del art. 107.4;
   *     hasta el 24/09/2026 se esperaba 0,08 → 1.600,00 €, de la tabla caducada — hallazgo 1559).
   *
   *  c) El IRPF de una pérdida patrimonial: se vende por 250.000 € algo cuyo valor de
   *     adquisición fiscal es 300.084,86 €.
   *
   * ⚠️ DERIVACIÓN REHECHA el 15/09/2026 (hallazgo 867): partía de una base de 300.000 €, sin
   * el ajuar del art. 15 LISD que entró con el hallazgo 780 el 13/09. Las aserciones se
   * actualizaron entonces y esta aritmética no, así que el golden ya no se podía comprobar
   * leyéndola. Todo lo de abajo reproduce hoy, al céntimo, lo que la app imprime.
   *
   * ISD (Canarias, Grupo III, sin la reducción de vivienda):
   *   Base imponible = 300.000 + 3 % de ajuar (art. 15 LISD)  309.000,00
   *   − REDUCCIONES_PARENTESCO_IS['III']                       −7.993,46
   *   = Base liquidable                                       301.006,54
   *   Cuota íntegra, tramo que arranca en 239.389,13:
   *        40.011,04 + (301.006,54 − 239.389,13) × 25,50 % = 55.723,478550 → «55.723,48 €»
   *   × COEFICIENTES_IS['III'][0] = 1,5882 → 88.500,03 €
   *   − Bonificación Canarias Grupo III (99,9 %) → «88,50 €»
   *
   * Y con los DOS requisitos cumplidos (66 años y convivencia) la reducción sí entra:
   *   Base liquidable = 309.000 − 7.993,46 − 122.606,47 = 178.400,07
   *   Cuota íntegra = 23.063,25 + (178.400,07 − 159.634,83) × 21,25 % = 27.050,863500
   *   × 1,5882 = 42.962,18 → × 0,001 = «42,96 €»
   *
   * Valor de adquisición fiscal del IRPF = 300.000 + 88,50 + 0 (IIVTNU no sujeto) = 300.088,50
   */
  test('CASO 3 (rechazo) — colateral sin derecho a la reducción, plusvalía no sujeta y pérdida patrimonial', async ({
    page,
  }) => {
    await abrir(page);

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
    expect(await linea(page, ISD, '= Base liquidable')).toBe('301.006,54 €');
    // 40.011,04 + (292.006,54 − 239.389,13) × 25,50 % = 53.428,4796 (columna `cuota`)
    expect(await linea(page, ISD, 'Cuota íntegra (tarifa)')).toBe('55.723,48 €');
    expect(await linea(page, ISD, '× Coef. patrimonio (Grupo III)')).toBe('×1,5882');
    expect(await linea(page, ISD, '= Cuota tributaria')).toBe('88.500,03 €');
    expect(await panel(page, ISD)).toContain('Bonificación CCAA (99,9%)');
    expect(await linea(page, ISD, 'Cuota ISD final')).toBe('88,50 €');

    // b) Sin incremento de valor del terreno no se devenga el IIVTNU (RDL 26/2021)
    //    80.000 × 0,12 × 25 % = 2.400,00, a la vista pero no liquidado (hallazgo 1559)
    expect(await linea(page, IIVTNU, 'Método objetivo')).toBe('2400,00 €');
    expect(await linea(page, IIVTNU, 'Método real (suelo)')).toBe('No sujeta (sin incremento)');
    expect(await linea(page, IIVTNU, 'Método elegido')).toBe('No sujeta');
    expect(await linea(page, IIVTNU, 'Cuota plusvalía municipal')).toBe('0,00 €');

    // c) Una pérdida patrimonial no genera cuota de IRPF
    expect(await linea(page, IRPF, 'Valor adquisición fiscal*')).toBe('300.088,50 €');
    expect(await linea(page, IRPF, 'Pérdida patrimonial')).toBe('−50.088,50 €');
    expect(await linea(page, IRPF, 'Cuota IRPF venta')).toBe('0,00 €');

    expect(await bloqueTotal(page)).toContain('88,50 €');

    // Con 65 años cumplidos pero sin convivencia, sigue sin proceder
    await mover(page, 'edadHer', 66);
    expect(await linea(page, ISD, 'Reducción vivienda habitual')).toBe(
      'No aplicable: pariente colateral que no convivió los 2 años anteriores'
    );

    // Con los DOS requisitos, la reducción entra
    await page.locator('#convivencia').check();
    expect(await linea(page, ISD, '− Reducción vivienda habitual (95%)')).toBe('−122.606,47 €');
    expect(await linea(page, ISD, '= Base liquidable')).toBe('178.400,07 €');
    // 23.063,25 + (169.400,07 − 159.634,83) × 21,25 % = 25.138,36350 (columna `cuota`)
    expect(await linea(page, ISD, 'Cuota íntegra (tarifa)')).toBe('27.050,86 €');
    expect(await linea(page, ISD, '= Cuota tributaria')).toBe('42.962,18 €');
    expect(await linea(page, ISD, 'Cuota ISD final')).toBe('42,96 €');
  });

  /**
   * GUARDA — el extremo superior de todos los ejes a la vez: Grupo IV (sin reducción y con
   * el coeficiente multiplicador más alto), el tope del deslizador de valor de referencia
   * (2.000.000 €, que entra en el tramo del 34 %), Asturias (cuyo Grupo IV declara
   * `reduccionBase: 0`, así que aquí no alivia nada) y 0 años de tenencia.
   *
   *   ⚠️ Derivación rehecha el 15/09/2026 (hallazgo 867): partía de 2.000.000 € sin el ajuar
   *   del art. 15 LISD, que entró con el hallazgo 780.
   *
   *   Base imponible = base liquidable = 2.000.000 × 1,03 = 2.060.000,00 (ninguna reducción)
   *   Cuota íntegra por la COLUMNA `cuota` del último tramo de TARIFA_ESTATAL_IS:
   *        199.291,40 + (2.060.000 − 797.555,08) × 34,00 %
   *      = 199.291,40 + 429.231,2728 = 628.522,6728 → «628.522,67 €»
   *   × COEFICIENTES_IS['IV'][0] = 2,0000 → 628.522,67 × 2 = 1.257.045,34 → «1.257.045,34 €»
   *   Asturias no bonifica → Cuota ISD final = 1.257.045,34 €
   *   (hasta el 09/09/2026 la pantalla añadía un céntimo aquí, por multiplicar la íntegra sin
   *    redondear el factor que ella misma escribe: exactamente el hallazgo 657)
   *
   *   Plusvalía: 0 años → periodo inferior a un año. RECALCULADA el 24/09/2026 (hallazgos
   *   1559 y 1560): el coeficiente de «inferior a 1 año» del art. 107.4 vigente es 0,15, y la
   *   ley lo PRORRATEA por meses completos. La app solo pregunta el año de adquisición, así
   *   que `coeficienteIIVTNU(0)` toma 11 meses, el máximo que cabe por debajo del año:
   *     coeficiente = 0,15 × 11/12 = 0,1375 (el panel lo pinta con dos decimales: «0,14»)
   *     objetivo = 500.000 × 0,1375 × 0,25 = 17.187,50
   *     real     = (2.000.000 − 30.000) × (500.000 / 1.000.000) × 0,25 = 246.250,00
   *   TOTAL (sin venta) = 1.257.045,34 + 17.187,50 = 1.274.232,84 → «1.274.232,84 €»
   *   (con la tabla caducada del RDL 26/2021 se esperaban 0,14 entero → 17.500,00 y
   *   1.274.545,34 €)
   *
   *   ⚠️ Lo que el «0,14» del panel NO dice: que la cifra es una COTA SUPERIOR (11 meses) y que
   *   el coeficiente aplicado es 0,1375 — 500.000 × 0,14 × 25 % darían 17.500,00, no los
   *   17.187,50 de la línea de abajo. Se deja la aserción literal de lo que se pinta y se
   *   reporta aparte; no es un dato de este test decidir cómo debe rotularlo la app.
   */
  test('GUARDA — tramo del 34 %, coeficiente 2,0000 y 11 meses de tenencia (Grupo IV, 2.000.000 € en Asturias)', async ({
    page,
  }) => {
    await abrir(page);

    await page.selectOption('#parentescoSel', 'sin_parentesco');
    await page.selectOption('#ccaaSel', 'asturias');
    // Once meses completos exactos, sea cual sea el día en que corra el test. Hasta el 25/09/2026
    // la app no preguntaba el mes y rotulaba aquí el TECHO de 11 meses; desde el hallazgo 1615
    // los cuenta, así que se siembran 11 para que las cifras de abajo sigan siendo las mismas.
    const adq = haceMeses(11);
    await mover(page, 'anioAdq', adq.anio);
    await page.selectOption('#mesAdq', String(adq.mes));
    await mover(page, 'valorAdq', 30000);
    await mover(page, 'valorRef', 2000000); // tope del deslizador
    await mover(page, 'valorSuelo', 500000);
    await mover(page, 'valorCatastralTotal', 1000000);
    await casilla(page, 'viviendaHabitual', false);
    await mover(page, 'aniosVenta', 0);

    expect(await panel(page, ISD)).toContain('Principado de Asturias — Grupo IV');
    expect(await linea(page, ISD, '− Reducción parentesco')).toBe('−0,00 €');
    // 199.291,40 + (2.000.000 − 797.555,08) × 34,00 % = 608.122,6728 (columna `cuota`)
    expect(await linea(page, ISD, 'Cuota íntegra (tarifa)')).toBe('628.522,67 €');
    expect(await linea(page, ISD, '× Coef. patrimonio (Grupo IV)')).toBe('×2,0000');
    // 608.122,67 × 2,0000 = 1.216.245,34 — la cadena impresa cuadra desde el hallazgo 657
    expect(await linea(page, ISD, '= Cuota tributaria')).toBe('1.257.045,34 €');
    expect(await linea(page, ISD, 'Cuota ISD final')).toBe('1.257.045,34 €');
    // El Grupo IV de Asturias declara reduccionBase 0: no debe aparecer la línea autonómica
    expect(await panel(page, ISD)).not.toContain('Reducción autonómica');

    // De dónde sale el coeficiente (hallazgos 1559 y 1560): 0,15 prorrateado a 11 meses
    expect(COEFICIENTES_IIVTNU_2025[0].coeficiente).toBe(0.15);
    expect(coeficienteIIVTNU(0)).toMatchObject({ prorrateado: true, meses: 11, cotaSuperior: true });

    expect(await panel(page, IIVTNU)).toContain('11 meses de tenencia');
    // 0,15 × 11/12 = 0,1375, con cuatro decimales para que cuadre con la cuota de abajo (con
    // dos se leía «0,14»). Ya no es un techo: son los 11 meses completos sembrados.
    expect(await linea(page, IIVTNU, 'Coeficiente, menos de 1 año (prorrateado a 11 meses)')).toBe('0,1375');
    // 500.000 × 0,1375 × 25 % (hallazgo 1559)
    expect(await linea(page, IIVTNU, 'Método objetivo')).toBe('17.187,50 €');
    expect(await linea(page, IIVTNU, 'Método real (suelo)')).toBe('246.250,00 €');
    expect(await linea(page, IIVTNU, 'Cuota plusvalía municipal')).toBe('17.187,50 €');

    // 1.257.045,34 + 17.187,50 (hallazgo 1559)
    expect(await bloqueTotal(page)).toContain('1.274.232,84');
    expect(await page.locator('label[for="anioAdq"]').innerText()).toContain('(11 meses hasta hoy)');
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
    await abrir(page);

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
   * Base liquidable = 206.000 (200.000 + el 3 % de ajuar del art. 15 LISD, que entra en la
   * base desde el 13/09/2026 — hallazgo 780; no hay reducciones en el Grupo IV). Por la
   * COLUMNA `cuota` del tramo correspondiente (hallazgo 277; antes se acumulaban los
   * marginales y salía menos):
   *      23.063,25 + (206.000 − 159.634,83) × 21,25 % = 23.063,25 + 9.852,598625
   *                                                 = 32.915,848625 → «32.915,85 €»
   *   × COEFICIENTES_IS['IV'][0] = 2,0000 → 65.831,69725 → «65.831,70 €»
   *   Madrid no bonifica al Grupo IV (porcentaje 0) → Cuota ISD final = 65.831,70 €
   *
   * Esta guarda fija la cifra del motor porque el bloque educativo la CITA: la tarjeta
   * «Heredero del Grupo IV (sin parentesco)» decía «80-100.000 € de ISD», más del doble de
   * lo que liquida la propia página e inalcanzable con cualquier CCAA del desplegable
   * (46.000,00 € en Cataluña, la más cara). Al cerrar el hallazgo 275 el texto dejó de
   * llevar una cifra escrita a mano: ahora la deriva del motor con estos mismos parámetros
   * (`EJEMPLO_GRUPO_IV` en page.tsx), así que si el cálculo cambia, el texto cambia con él.
   */
  test('GUARDA — Grupo IV sin reducciones: 200.000 € tributan 65.831,70 € de ISD en régimen común', async ({
    page,
  }) => {
    await abrir(page);

    await page.selectOption('#parentescoSel', 'sin_parentesco');
    await page.selectOption('#ccaaSel', 'madrid');
    await mover(page, 'valorRef', 200000);
    await mover(page, 'aniosVenta', 0);
    await casilla(page, 'viviendaHabitual', false);

    expect(await linea(page, ISD, '= Base liquidable')).toBe('206.000,00 €');
    expect(await linea(page, ISD, 'Cuota íntegra (tarifa)')).toBe('32.915,85 €');
    expect(await linea(page, ISD, '= Cuota tributaria')).toBe('65.831,70 €');
    expect(await linea(page, ISD, 'Cuota ISD final')).toBe('65.831,70 €');

    // Y el bloque educativo tiene que decir ESA cifra, no una escrita a mano (hallazgo 275).
    // `textContent` y no `innerText` porque <EducationalSection> oculta su contenido por CSS
    // sin desmontarlo: el texto está en el DOM aunque la guía esté plegada.
    // (el espacio antes del € que pinta `formatCurrency` es U+00A0, así que se normaliza)
    const educativo = ((await page.locator('body').textContent()) ?? '').replace(/\s+/g, ' ');
    expect(educativo).toContain('65.831,70 €');
    expect(educativo).not.toContain('80-100.000');

    // Cataluña, con su tarifa propia, es la más cara del desplegable para este supuesto:
    // 50.000 × 7 % + 100.000 × 11 % + 50.000 × 17 % = 23.000,00 → × 2,0000 = 46.000,00 €
    await page.selectOption('#ccaaSel', 'cataluna');
    expect(await linea(page, ISD, 'Cuota íntegra (tarifa)')).toBe('24.020,00 €');
    expect(await linea(page, ISD, 'Cuota ISD final')).toBe('48.040,00 €');
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
   * ⚠️ DERIVACIÓN REHECHA el 24/09/2026 (hallazgo 1559) desde la plusvalía hacia abajo. La
   * de antes arrastraba además un ISD sin ajuar (64,54 €) y sin regularización; las cifras
   * de ISD de aquí son las que la app imprime desde el hallazgo 780 y están desarrolladas en
   * la cabecera de las GUARDAS del 13/09 ([778] y siguientes): cuota 73,00 € y 222,25 € de
   * ISD regularizado, porque la venta a los 5 años cae dentro de los 10 del art. 20.2.c.
   *
   * Plusvalía: 1995 son 31 años, pero el art. 107.4 se topa en «igual o superior a 20 años» →
   *   coeficiente 0,40 (era 0,45 con la tabla caducada del RDL 26/2021) y el panel debe
   *   rotular «20 años de tenencia» aunque el deslizador diga «(31 años hasta hoy)»: son dos
   *   cosas distintas y las dos son correctas.
   *   objetivo = 60.000 × 0,40 × 0,25 = 6.000,00
   *   real     = (200.000 − 80.000) × (60.000 / 120.000) × 0,25 = 15.000,00 → gana el objetivo
   *   Venta a los 5 años: coeficiente 0,18 → 60.000 × 0,18 × 0,25 = 2.700,00
   *     (real = 50.000 × 0,5 × 0,25 = 6.250,00)
   *
   * IRPF a los 5 años:
   *   Valor de adquisición fiscal = 200.000 + 73,00 + 222,25 + 6.000 = 206.295,25
   *   Valor de transmisión = 250.000 − 2.700 = 247.300,00
   *   Ganancia = 247.300 − 206.295,25 = 41.004,75
   *        6.000,00 × 19 % = 1.140,00
   *       35.004,75 × 21 % = 7.350,9975
   *                          ──────────
   *                           8.490,9975 → «8491,00 €»
   *
   * TOTAL = 73,00 + 222,25 + 6.000 + 2.700 + 8.490,9975 = 17.486,2475 → «17.486,25 €»
   * y 17.486,2475 / 250.000 = 6,9945 % → «6,99 %»
   */
  test('CASO 4 (normal) — el caso preconfigurado de Madrid: 73,00 € + 222,25 € + 6000,00 € + 2700,00 € + 8491,00 € = 17.486,25 €', async ({
    page,
  }) => {
    await abrir(page);
    await page.getByRole('button', { name: /Hijo hereda piso 200k en Madrid/ }).click();

    expect(await panel(page, ISD)).toContain('Comunidad de Madrid — Grupo II');
    expect(await linea(page, ISD, '= Base liquidable')).toBe('67.436,66 €');
    expect(await linea(page, ISD, 'Cuota íntegra (tarifa)')).toBe('7300,03 €');
    expect(await panel(page, ISD)).toContain('Bonificación CCAA (99,0%)');
    expect(await linea(page, ISD, 'Cuota ISD final')).toBe('73,00 €');

    // La tenencia real es de 31 años; el art. 107.4 se topa en «20 o más» (0,40, hallazgo 1559)
    expect(await page.locator('label[for="anioAdq"]').innerText()).toContain(
      `(${ANIO - 1995} años hasta hoy)`
    );
    expect(await panel(page, IIVTNU)).toContain('20 años de tenencia');
    expect(await linea(page, IIVTNU, 'Coeficiente 20 años')).toBe('0,40');
    // 60.000 × 0,40 × 25 %
    expect(await linea(page, IIVTNU, 'Método objetivo')).toBe('6000,00 €');
    expect(await linea(page, IIVTNU, 'Método real (suelo)')).toBe('15.000,00 €');
    expect(await linea(page, IIVTNU, 'Cuota plusvalía municipal')).toBe('6000,00 €');

    // 200.000 + 73,00 + 222,25 + 6.000 · (250.000 − 2.700) − 206.295,25 (hallazgo 1559)
    expect(await linea(page, IRPF, 'Valor adquisición fiscal*')).toBe('206.295,25 €');
    expect(await linea(page, IRPF, 'Ganancia patrimonial')).toBe('41.004,75 €');
    // 1.140 + 35.004,75 × 21 % = 8.490,9975
    expect(await linea(page, IRPF, 'Cuota IRPF venta')).toBe('8491,00 €');

    const total = await bloqueTotal(page);
    // 73,00 + 222,25 + 6.000,00 + 2.700,00 + 8.490,9975 = 17.486,2475 (hallazgo 1559)
    expect(total).toContain('17.486,25');
    expect(total).toContain('6,99%');
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
    await abrir(page);

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

    // Basura en tres deslizadores a la vez: texto, negativo fuera de rango y NaN literal.
    // La edad se baja antes a 30 A PROPÓSITO: el navegador sanea «NaN» a la mitad del recorrido
    // —(0+90)/2 = 45— que es justo donde arranca el deslizador, así que desde ahí el valor no se
    // movería, React descartaría el evento y la comprobación de abajo pasaría sin haber saneado
    // nada (ver tests/apps/_hidratacion.ts).
    await mover(page, 'edadHer', 30);
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
    // 1.025.000 − 15.956,87 − 122.606,47 = 886.436,66 → tramo del 34 %
    // 199.291,40 + (886.436,66 − 797.555,08) × 34,00 % = 229.511,1372 → −99 % = 2295,11 €
    expect(await linea(page, ISD, '= Base liquidable')).toBe('917.186,66 €');
    expect(await linea(page, ISD, 'Cuota íntegra (tarifa)')).toBe('239.966,14 €');
    expect(await linea(page, ISD, 'Cuota ISD final')).toBe('2399,66 €');
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
    await abrir(page);

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
      incluyeAjuar: true,
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
    await abrir(page);
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
      incluyeAjuar: true,
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
    expect(await linea(page, ISD, 'Cuota íntegra (tarifa)')).toBe('44.590,00 €');
    expect(await linea(page, ISD, 'Cuota ISD final')).toBe('445,90 €');

    const mcpTope = calcularSucesion({
      baseImponible: 900000,
      ccaa: 'cataluna',
      grupo: 'I-conyuge',
      viviendaHabitual: 900000,
      incluyeAjuar: true,
    });
    expect(mcpTope.reduccionVivienda).toBe(500000);
    expect(mcpTope.porcentajeBonificacion).toBe(99);
    expect(mcpTope.cuotaFinal).toBe(445.9);
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
   *         23.063,25 + (192.006,54 − 159.634,83) × 21,25 % = 29.942,23838
   *         × 1,5882 = 47.554,2637 → − 50 % (madrid…['III']) = «23.777,13 €»
   *   MCP:  reduce 122.606,47 → base liquidable 69.400,07
   *         6789,79 + (69.400,07 − 63.905,62) × 14,45 % = 7583,74
   *         × 1,5882 = 9.767,14 → − 50 % = 4.883,57 €
   *   Diferencia: 9.858,31 €, tres veces la cuota que anuncia el MCP.
   */
  test('WEB ↔ MCP (3/3) — colateral de 40 años que no convivió: la web y el MCP dicen los mismos 23.777,13 €', async ({
    page,
  }) => {
    await abrir(page);

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
    expect(await linea(page, ISD, '= Base liquidable')).toBe('198.006,54 €');
    expect(await linea(page, ISD, 'Cuota ISD final')).toBe('24.789,61 €');

    const mcp = calcularSucesion({
      baseImponible: 200000,
      ccaa: 'madrid',
      grupo: 'III',
      edadHeredero: 40,
      viviendaHabitual: 200000,
      incluyeAjuar: true,
    });
    // El motor compartido comprueba ya los dos requisitos del art. 20.2.c
    expect(mcp.reduccionVivienda).toBe(0);
    expect(mcp.reduccionViviendaNoAplicada).toBe('pariente colateral menor de 65 años');
    expect(mcp.baseLiquidable).toBe(198006.54);
    expect(mcp.cuotaFinal).toBe(importe(await linea(page, ISD, 'Cuota ISD final')));

    // Y con los dos requisitos cumplidos SÍ reduce: 65 años y convivencia acreditada
    const conDerecho = calcularSucesion({
      baseImponible: 200000,
      ccaa: 'madrid',
      grupo: 'III',
      edadHeredero: 70,
      convivenciaDosAnios: true,
      viviendaHabitual: 200000,
      incluyeAjuar: true,
    });
    expect(conDerecho.reduccionVivienda).toBe(122606.47);
    expect(conDerecho.reduccionViviendaNoAplicada).toBeNull();
    expect(conDerecho.baseLiquidable).toBe(75400.07);
    expect(conDerecho.cuotaFinal).toBe(6734.4);
  });

  /**
   * GUARDA — el tramo del 30 % del IRPF, el más alto de
   * `TRAMOS_GANANCIAS_PATRIMONIALES_2025`, y la edad del heredero que NO exime.
   *
   * Caso preconfigurado de Madrid pero vendiendo por el tope del deslizador (2.000.000 €).
   * ⚠️ REHECHO el 24/09/2026 con la tabla vigente del art. 107.4 (hallazgo 1559): IIVTNU de
   * la herencia 60.000 × 0,40 × 0,25 = 6.000,00 y de la venta a los 5 años 60.000 × 0,18 ×
   * 0,25 = 2.700,00 (el real, (2.000.000 − 200.000) × 0,5 × 0,25 = 225.000, no gana). La
   * derivación anterior partía además de un ISD sin ajuar ni regularización (64,54 €).
   *   Valor de adquisición fiscal = 200.000 + 73,00 + 222,25 (ISD regularizado) + 6.000
   *                               = 206.295,25
   *   (la cuota de ISD entra ya redondeada al céntimo desde el hallazgo 657)
   *   Valor de transmisión = 2.000.000 − 2.700 = 1.997.300,00
   *   Ganancia = 1.997.300 − 206.295,25 = 1.791.004,75
   *          6.000,00 × 19 % =   1.140,00
   *         44.000,00 × 21 % =   9.240,00
   *        150.000,00 × 23 % =  34.500,00
   *        100.000,00 × 27 % =  27.000,00
   *      1.491.004,75 × 30 % = 447.301,425
   *                            ───────────
   *                             519.181,425 → «519.181,43 €»
   *
   * Con la escala que describe el `faqJsonLd` («27 % por encima» de 200.000 €) saldrían
   * 44.730,14 € menos (el 3 % de los 1.491.004,75 € por encima de 300.000). Manda
   * `data/fiscal`, que es lo que aplica el motor.
   *
   * Y con 90 años el heredero sigue pagando: la app no modela ninguna exención de IRPF
   * (ni la del art. 33.4.b LIRPF ni la del art. 38), pese a lo que dice el `faqJsonLd`.
   */
  test('GUARDA — el tramo del 30 % del IRPF entra de verdad: ganancia de 1.791.004,75 € → 519.181,43 €', async ({
    page,
  }) => {
    await abrir(page);
    await page.getByRole('button', { name: /Hijo hereda piso 200k en Madrid/ }).click();
    await mover(page, 'valorVta', 2000000);

    // Recalculados con la tabla vigente del art. 107.4 (hallazgo 1559), desarrollo arriba
    expect(await linea(page, IRPF, 'Valor adquisición fiscal*')).toBe('206.295,25 €');
    expect(await linea(page, IRPF, 'Ganancia patrimonial')).toBe('1.791.004,75 €');
    expect(await linea(page, IRPF, 'Cuota IRPF venta')).toBe('519.181,43 €');
    expect(await panel(page, IRPF)).toContain('Tramos: 19% / 21% / 23% / 27% / 30%');

    // La edad del heredero no exime nada en el IRPF de esta app: con 90 años y la venta de
    // fábrica (250.000 €) la cuota es la del CASO 4, 8.490,9975 (hallazgo 1559)
    await mover(page, 'edadHer', 90);
    await mover(page, 'valorVta', 250000);
    expect(await linea(page, IRPF, 'Cuota IRPF venta')).toBe('8491,00 €');
  });

  /**
   * REPARADO 27/08/2026 — el `faqJsonLd` de metadata.ts se había quedado contando una escala del ahorro que la
   * app no aplica: «19% hasta 6.000 €, 21% de 6.000 a 50.000 €, 23% de 50.000 a 200.000 € y
   * 27% por encima». `TRAMOS_GANANCIAS_PATRIMONIALES_2025` tiene CINCO tramos (27 % hasta
   * 300.000 y 30 % en adelante) y el propio bloque educativo de la página los enumera bien.
   *
   * No es cosmético: el FAQPage es la señal estructurada que leen Bing Copilot, ChatGPT,
   * Perplexity y Gemini, y aquí describe mal la escala de un impuesto en una app de nivel 1
   * CRÍTICO. Sobre la ganancia de 1.791.004,75 € de la guarda anterior (recalculada el
   * 24/09/2026 con la tabla vigente del IIVTNU, hallazgo 1559), la regla del `faqJsonLd`
   * daría 474.451,28 € y el motor liquida 519.181,43 €.
   */
  test('REGRESIÓN — el faqJsonLd sirve los cinco tramos de la base del ahorro', async ({
    page,
  }) => {
    await abrir(page);

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
    await abrir(page);

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
   *      Cuota íntegra = 40.011,04 + (361.436,66 − 239.389,13) × 25,50 % = 71.133,16015
   *      Cuota final = 71.133,16015 × 0,20 = 14.226,63203 → «14.226,63 €»
   *  (b) 400.000 € → base liquidable 261.436,66 → peldaño del 90 %
   *      Cuota íntegra = 40.011,04 + 22.047,53 × 25,50 % = 45.633,16015 → «45.633,16 €»
   *      Bonificación  = 45.633,16 × 90 % = 41.069,844                 → «41.069,84 €»
   *      Cuota final   = 45.633,16 − 41.069,84 = 4.563,32              → «4563,32 €»
   *
   * ⚠️ COMENTARIO CORREGIDO el 10/09/2026 (el test no se toca: sus dos cifras siguen
   * siendo las correctas). Aquí se decía que éste era «el ÚNICO perfil de todo el fichero
   * en el que la web y `calcularSucesion` dan cifras distintas», porque el motor redondeaba
   * la RESTA —`r(cuotaTributaria − bonificación)` = 2.678,26— publicando a la vez la
   * bonificación ya redondeada a 41.069,84. **Eso ya no es cierto**: el commit `0a2fa220`
   * (09/09/2026) hizo que `calcularSucesion` reste la bonificación PUBLICADA
   * (`bonificacionPublicada`), así que hoy el motor devuelve los mismos 2.678,25 € que la
   * pantalla. Lo comprueba el barrido WEB ↔ MOTOR de la tanda del 10/09/2026, que incluye
   * este perfil exacto.
   */
  test('GUARDA — Castilla-La Mancha baja del 90 % al 80 % al pasar de 300.000 € de base liquidable', async ({
    page,
  }) => {
    await abrir(page);

    await page.selectOption('#parentescoSel', 'hijo');
    await page.selectOption('#ccaaSel', 'castilla-mancha');
    await mover(page, 'edadHer', 45);
    await casilla(page, 'viviendaHabitual', true);
    await mover(page, 'aniosVenta', 0);

    await mover(page, 'valorRef', 500000);
    expect(await linea(page, ISD, '= Base liquidable')).toBe('376.436,66 €');
    expect(await panel(page, ISD)).toContain('Bonificación CCAA (80,0%)');
    expect(await linea(page, ISD, 'Cuota ISD final')).toBe('14.991,63 €');

    await mover(page, 'valorRef', 400000);
    expect(await linea(page, ISD, '= Base liquidable')).toBe('273.436,66 €');
    expect(await panel(page, ISD)).toContain('Bonificación CCAA (90,0%)');
    expect(await linea(page, ISD, 'Cuota ISD final')).toBe('4869,32 €');
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
    await abrir(page);

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
   *   Cuota íntegra = 15.606,22 + (127.006,54 − 119.757,67) × 18,70 % = 16.961,75869
   *   × 1,5882 = 26.938,665151 → − 50 % = 13.469,332576           → «13.469,33 €»
   *
   * 9.209,69 € de diferencia por un año de edad: por eso el umbral se prueba en su borde y
   * no «alrededor».
   */
  test('CASO 6 (límite) — el colateral en el borde de los 65 años: 267,30 € con derecho y 13.469,33 € sin él', async ({
    page,
  }) => {
    await abrir(page);

    await page.selectOption('#parentescoSel', 'hermano');
    await page.selectOption('#ccaaSel', 'madrid');
    await mover(page, 'edadHer', 65);
    await mover(page, 'valorRef', 135000);
    await casilla(page, 'viviendaHabitual', true);
    await casilla(page, 'convivencia', true);
    await mover(page, 'aniosVenta', 0);

    // Con derecho: el tope de 122.606,47 € manda sobre el 95 % de 135.000 €
    expect(await linea(page, ISD, '− Reducción vivienda habitual (95%)')).toBe('−122.606,47 €');
    expect(await linea(page, ISD, '= Base liquidable')).toBe('8450,07 €');
    expect(await linea(page, ISD, 'Cuota íntegra (tarifa)')).toBe('650,31 €');
    expect(await linea(page, ISD, '= Cuota tributaria')).toBe('1032,82 €');
    expect(await linea(page, ISD, 'Cuota ISD final')).toBe('516,41 €');

    // Un año por debajo del umbral y no queda nada de la reducción
    await mover(page, 'edadHer', 64);
    expect(await linea(page, ISD, 'Reducción vivienda habitual')).toBe(
      'No aplicable: pariente colateral menor de 65 años'
    );
    expect(await linea(page, ISD, '= Base liquidable')).toBe('131.056,54 €');
    expect(await linea(page, ISD, 'Cuota íntegra (tarifa)')).toBe('17.719,11 €');
    expect(await linea(page, ISD, 'Cuota ISD final')).toBe('14.070,74 €');

    // La misma entrada por el motor compartido, que es lo que responde el MCP Delegum
    const motor = calcularSucesion({
      baseImponible: 135000,
      ccaa: 'madrid',
      grupo: 'III',
      edadHeredero: 65,
      convivenciaDosAnios: true,
      viviendaHabitual: 135000,
      incluyeAjuar: true,
    });
    expect(motor.reduccionVivienda).toBe(122606.47);
    expect(motor.baseLiquidable).toBe(8450.07);
    expect(motor.cuotaFinal).toBe(516.41);
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
   *   Cuota íntegra = 5703,50 + (61.436,66 − 55.918,17) × 13,60 % = 6454,014640 → «5405,24 €»
   *   × 1,0000 → − 95 % (baleares…['II'].porcentaje) = 322,700732 → «322,70 €»
   *
   * Plusvalía municipal, 20 años → coeficiente 0,40 del art. 107.4 vigente (era 0,45 con la
   * tabla caducada del RDL 26/2021; recalculado el 24/09/2026, hallazgo 1559):
   *   objetivo = 60.000 × 0,40 × 0,25 =                                 6.000,00
   *   real     = (200.000 − 195.000) × (60.000 / 120.000) × 0,25 =         625,00  ← el MENOR
   *   Venta a los 2 años (coeficiente 0,14, antes 0,15): objetivo 60.000 × 0,14 × 0,25 =
   *   2.100,00 frente a un real de (210.000 − 200.000) × 0,5 × 0,25 = 1.250,00 ← el MENOR
   *   Como en las dos transmisiones gana el método REAL, el cambio de tabla no mueve ni el
   *   IRPF ni el total de este caso: solo el coeficiente y el objetivo impresos.
   *
   * IRPF a los 2 años:
   *   Valor de adquisición fiscal = 200.000 + 322,70 + 625 = 200.947,70
   *   (la cuota de ISD entra ya redondeada al céntimo desde el hallazgo 657)
   *   Ganancia = 210.000 − 200.895,26 = 9.104,74
   *        6.000,00 × 19 % = 1.140,00
   *        3.104,74 × 21 % =   651,9954
   *                            ────────
   *                             1.791,9954 → «1792,00 €»  (antes del 657: «1791,99 €»)
   *
   * TOTAL = 322,70 + 625 + 1.780,98 = 2.728,68 → «2728,68 €» = 1,30 % de 210.000
   */
  test('CASO 7 (normal) — Baleares al 95 % y la plusvalía por el método REAL: 322,70 € + 625,00 € + 1780,98 €', async ({
    page,
  }) => {
    await abrir(page);

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

    expect(await linea(page, ISD, '= Base liquidable')).toBe('67.436,66 €');
    expect(await linea(page, ISD, 'Cuota íntegra (tarifa)')).toBe('7300,03 €');
    expect(await panel(page, ISD)).toContain('Bonificación CCAA (95,0%)');
    expect(await linea(page, ISD, 'Cuota ISD final')).toBe('365,00 €');

    expect(await panel(page, IIVTNU)).toContain('20 años de tenencia');
    // 0,40 y 60.000 × 0,40 × 25 % (hallazgo 1559)
    expect(await linea(page, IIVTNU, 'Coeficiente 20 años')).toBe('0,40');
    expect(await linea(page, IIVTNU, 'Método objetivo')).toBe('6000,00 €');
    expect(await linea(page, IIVTNU, 'Método real (suelo)')).toBe('625,00 €');
    expect(await linea(page, IIVTNU, 'Método elegido')).toBe('Real (menor)');
    expect(await linea(page, IIVTNU, 'Cuota plusvalía municipal')).toBe('625,00 €');

    expect(await linea(page, IRPF, 'Valor adquisición fiscal*')).toBe('202.101,25 €');
    expect(await linea(page, IRPF, 'Ganancia patrimonial')).toBe('6648,75 €');
    expect(await linea(page, IRPF, 'Cuota IRPF venta')).toBe('1276,24 €');

    const total = await bloqueTotal(page);
    expect(total).toContain('4627,49 €');
    expect(total).toContain('2,20%');
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
   *   Cuota íntegra = 23.063,25 + (200.000 − 159.634,83) × 21,25 % = 31.640,84863
   *   × COEFICIENTES_IS['IV'][0] = 2,0000 = 65.831,69725 → «65.831,70 €», sin bonificación
   *
   * Que es exactamente la cifra que el bloque educativo deriva del motor (`EJEMPLO_GRUPO_IV`,
   * calculado con la casilla en falso): la prueba de que la casilla es inocua aquí.
   */
  test('CASO 8 (rechazo) — Grupo IV con la vivienda habitual marcada: se deniega, se dice, y la cuota no se mueve', async ({
    page,
  }) => {
    await abrir(page);

    await page.selectOption('#parentescoSel', 'sin_parentesco');
    await page.selectOption('#ccaaSel', 'madrid');
    await mover(page, 'edadHer', 50);
    await mover(page, 'valorRef', 200000);
    await casilla(page, 'viviendaHabitual', true);
    await mover(page, 'aniosVenta', 0);

    expect(await linea(page, ISD, 'Reducción vivienda habitual')).toBe(
      'No aplicable: sin parentesco: el art. 20.2.c LISD no la contempla'
    );
    expect(await linea(page, ISD, '= Base liquidable')).toBe('206.000,00 €');
    expect(await linea(page, ISD, 'Cuota ISD final')).toBe('65.831,70 €');

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
    await abrir(page);

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
   * reducción de vivienda NO se aplica: base liquidable 198.006,54 → cuota final 24.789,61 €
   * (golden GOLDEN-AH en `tests/calculadoras-invariantes.spec.ts`, mismo caso sobre el motor).
   */
  test('REGRESIÓN — estimador-impuesto-sucesiones usa la regla única del art. 20.2.c para el Grupo III', async ({
    page,
  }) => {
    await page.goto('/estimador-impuesto-sucesiones/');

    const selects = page.locator('select');
    await selects.nth(0).selectOption('madrid');
    await selects.nth(1).selectOption('III');
    const vivienda = page.locator(
      'xpath=//label[contains(., "Vivienda habitual")]/following::input[1]',
    );
    await vivienda.fill('200000');
    // Esta app es otra, y aquí no vale el `abrir()` de arriba: se comprueba que los 200.000 €
    // llegaron al ESTADO de React. Un `fill()` anterior a la hidratación deja el campo escrito
    // y el cálculo con el valor viejo (ver tests/apps/_hidratacion.ts).
    await esperarValorEnReact(page, vivienda, '200000');

    const cuota = page.locator('xpath=//*[contains(@class,"resultsPanel")]');
    await expect(cuota).toContainText('CUOTA A INGRESAR');

    // La ÚNICA aserción de fondo: el colateral de esta herencia no cumple el art. 20.2.c,
    // así que la cuota tiene que ser la misma que dan la web y el MCP para el mismo caso.
    expect((await cuota.innerText()).replace(/\s+/g, ' ')).toContain('24.789,61 €');
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
    // ⚠️ El servidor de desarrollo compila las rutas de API a demanda y de vez en cuando
    // devuelve su página 404 en HTML en vez de la respuesta (medido el 12/09/2026: 1 de cada 4
    // corridas del fichero, y también antes de tocar nada de hidratación — es el dev server, no
    // la app). Se afirma el estado ANTES de parsear para que ese caso no se disfrace de
    // «SyntaxError: Unexpected token '<'», que no dice nada de lo que ha pasado.
    expect(
      respuesta.status(),
      'la ruta de API no llegó a servirse: next dev la compila a demanda',
    ).toBe(200);
    const json = await respuesta.json();

    // El MCP, con el mismo supuesto, da 4.883,57 €: es la cifra que fija la paridad
    expect(json.cuotaFinal).toBe(6022.25);
  });
});

// ════════════════════════════════════════════════════════════════════════════
// RE-INSPECCIÓN 02/09/2026 — tres casos NUEVOS, resueltos a mano antes de abrir
// el navegador, sobre las ramas de `data/fiscal` que ninguna ronda anterior
// había ejercitado: la exención POR IMPORTE de Galicia, la tarifa propia de
// Cataluña con un DESCENDIENTE (hasta ahora solo se probó el cónyuge) y el
// coeficiente del IIVTNU a los 8 años, en la zona no monótona de la tabla (0,10 en
// la del RDL 26/2021; 0,19 en la vigente del art. 107.4 — hallazgo 1559).
// ════════════════════════════════════════════════════════════════════════════

test.describe('Simulador de heredar vivienda — re-inspección 02/09/2026', () => {
  /**
   * CASO 1 (NORMAL) — la cadena entera de los tres impuestos sobre una comunidad y un
   * parentesco que ningún caso anterior tocaba: CÓNYUGE en la Comunitat Valenciana.
   *
   * Importa que sea el cónyuge y no el hijo porque son filas DISTINTAS de
   * `BONIFICACIONES_CCAA_IS` (`'I-conyuge'` frente a `'II'`) y de las dos tablas de
   * reducciones; en régimen común coinciden, y esa coincidencia es justamente lo que
   * esconde un cruce de claves. Y el año de adquisición se fija en ANIO − 8 para caer en la
   * zona no monótona de la tabla del IIVTNU: en la vigente del art. 107.4 (hallazgo 1559)
   * 7 años → 0,20, 8 años → 0,19, 9 años → 0,15, así que un año de desfase en la tenencia
   * se vería aquí. (Con la del RDL 26/2021, caducada, eran 0,12 / 0,10 / 0,09.)
   *
   * Cónyuge de 60 años, Comunitat Valenciana, vivienda habitual valorada en 260.000 €,
   * comprada hace 8 años por 190.000 €, suelo catastral 90.000 € sobre 180.000 € de
   * catastral total, y venta a los 4 años por 300.000 €.
   *
   * ISD:
   *   ⚠️ Derivación rehecha el 15/09/2026 (hallazgo 867): faltaba el ajuar del art. 15 LISD,
   *   que entró con el hallazgo 780 el 13/09 y movió toda la cadena.
   *   Base imponible = 260.000 × 1,03                                   267.800,00
   *   − Reducción parentesco  REDUCCIONES_PARENTESCO_IS['I-conyuge']    −15.956,87
   *   − Reducción vivienda    mín(260.000 × 0,95; 122.606,47)          −122.606,47
   *   = Base liquidable                                                 129.236,66
   *   Cuota íntegra por la COLUMNA `cuota` de TARIFA_ESTATAL_IS, tramo que arranca en 119.757,67:
   *        15.606,22 + (129.236,66 − 119.757,67) × 18,70 %
   *      = 15.606,22 + 1.772,570530 = 17.378,790530                  → «17.378,79 €»
   *   × COEFICIENTES_IS['II'][0] = 1,0000 → cuota tributaria 17.378,790530
   *   − 99 % (`BONIFICACIONES_CCAA_IS['valencia']…['I-conyuge'].porcentaje` = 0,99)
   *   = 173,78790530                                                  → «173,79 €»
   *
   * ISD REGULARIZADO (venta a los 4 años, dentro de los 10 del art. 20.2.c):
   *   Base liquidable sin la reducción de vivienda = 267.800 − 15.956,87 = 251.843,13
   *   Cuota íntegra = 40.011,04 + (251.843,13 − 239.389,13) × 25,50 % = 43.186,81
   *   − 99 % (42.754,94) = 431,87 · Regularización = 431,87 − 173,79 = 258,08
   *
   * ⚠️ De aquí abajo, RECALCULADO el 24/09/2026 con la tabla vigente del art. 107.4 TRLRHL
   * (hallazgo 1559). La derivación anterior usaba 0,10 y 0,17 (tabla caducada del RDL
   * 26/2021) y, además, un ISD sin regularización.
   *
   * Plusvalía municipal (IIVTNU), tipo ORIENTATIVO del módulo (25 %):
   *   8 años → coeficiente 0,19
   *   Método objetivo = 90.000 × 0,19 × 0,25 =                            4.275,00  ← el MENOR
   *   Método real     = (260.000 − 190.000) × (90.000 / 180.000) × 0,25 = 8.750,00
   *   Venta a los 4 años → coeficiente 0,16: 90.000 × 0,16 × 0,25 = 3.600,00
   *     (real = (300.000 − 260.000) × 0,5 × 0,25 = 5.000,00)
   *
   * IRPF al vender a los 4 años por 300.000 €:
   *   Valor de adquisición fiscal = 260.000 + 173,79 + 258,08 + 4.275 = 264.706,87
   *   Valor de transmisión = 300.000 − 3.600 = 296.400,00
   *   Ganancia = 296.400 − 264.706,87 = 31.693,13
   *        6.000,00 × 19 % = 1.140,00
   *       25.693,13 × 21 % = 5.395,5573
   *                          ──────────
   *                           6.535,5573                              → «6535,56 €»
   *
   * TOTAL = 173,79 + 258,08 + 4.275 + 3.600 + 6.535,5573 = 14.842,4273  → «14.842,43 €»
   * y 14.842,4273 / 300.000 = 4,9475 % → «4,95 %»
   */
  test('CASO 1 (normal) — cónyuge en la Comunitat Valenciana: 173,79 € + 258,08 € + 4275,00 € + 3600,00 € + 6535,56 € = 14.842,43 €', async ({
    page,
  }) => {
    await abrir(page);

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
    expect(await linea(page, ISD, '= Base liquidable')).toBe('129.236,66 €');
    // TARIFA_ESTATAL_IS, tramo «hasta 159.634,83»: cuota 15.606,22 + 18,70 % del exceso
    expect(await linea(page, ISD, 'Cuota íntegra (tarifa)')).toBe('17.378,79 €');
    // COEFICIENTES_IS['II'][0] = 1,0000
    expect(await linea(page, ISD, '× Coef. patrimonio (Grupo II)')).toBe('×1,0000');
    // BONIFICACIONES_CCAA_IS['valencia'].bonificaciones['I-conyuge'].porcentaje = 0,99
    expect(await panel(page, ISD)).toContain('Bonificación CCAA (99,0%)');
    expect(await linea(page, ISD, 'Cuota ISD final')).toBe('173,79 €');

    // ── Plusvalía municipal ──────────────────────────────────────────────────
    expect(await page.locator('label[for="anioAdq"]').innerText()).toContain('(8 años hasta hoy)');
    expect(await panel(page, IIVTNU)).toContain('8 años de tenencia');
    // Art. 107.4 vigente → 8 años = 0,19 (zona no monótona: 0,20 / 0,19 / 0,15) — hallazgo 1559
    expect(await linea(page, IIVTNU, 'Coeficiente 8 años')).toBe('0,19');
    // PLUSVALIA_MUNICIPAL_META.tipoOrientativo = 25 (no el tipoMaximoLegal de 30)
    expect(await linea(page, IIVTNU, 'Tipo municipal (orientativo)')).toBe('25%');
    // 90.000 × 0,19 × 25 %
    expect(await linea(page, IIVTNU, 'Método objetivo')).toBe('4275,00 €');
    expect(await linea(page, IIVTNU, 'Método real (suelo)')).toBe('8750,00 €');
    expect(await linea(page, IIVTNU, 'Método elegido')).toBe('Objetivo (menor)');
    expect(await linea(page, IIVTNU, 'Cuota plusvalía municipal')).toBe('4275,00 €');

    // ── IRPF ─────────────────────────────────────────────────────────────────
    // 260.000 + 173,79 + 258,08 + 4.275 · (300.000 − 3.600) − 264.706,87 (hallazgo 1559)
    expect(await linea(page, IRPF, 'Valor adquisición fiscal*')).toBe('264.706,87 €');
    expect(await linea(page, IRPF, 'Ganancia patrimonial')).toBe('31.693,13 €');
    // TRAMOS_GANANCIAS_PATRIMONIALES_2025: 6.000 × 19 % + 25.693,13 × 21 % = 6.535,5573
    expect(await linea(page, IRPF, 'Cuota IRPF venta')).toBe('6535,56 €');

    // ── Total y formato español ──────────────────────────────────────────────
    const total = await bloqueTotal(page);
    // 173,79 + 258,08 + 4.275,00 + 3.600,00 + 6.535,5573 = 14.842,4273 (hallazgo 1559)
    expect(total).toContain('14.842,43 €');
    expect(total).toContain('4,95%');
    expect(total).not.toMatch(/14,842\.43/); // nunca formato US
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
   *
   * ⚠ 13/09/2026: la base imponible lleva dentro el ajuar del art. 15 LISD (hallazgo 780),
   * así que el valor de referencia que deja la base liquidable en el umbral ya no es el
   * mismo. Se RECOLOCA la entrada en vez de cambiar el porcentaje esperado: lo que este caso
   * cerca es el umbral, y con 1.135.000/1.140.000 € los dos lados caen ya por encima, de modo
   * que el test se quedaría en verde sin ejercitar ningún borde.
   *
   * base liquidable = valorRef × 1,03 − 15.956,87 − 122.606,47 = valorRef × 1,03 − 138.563,34,
   * así que el umbral de 1.000.000 € cae en 1.105.401,69 € de valor de referencia y el
   * deslizador (paso de 5.000 €) lo cerca con 1.105.000 € y 1.110.000 €.
   *
   *  (a) 1.105.000 × 1,03 = 1.138.150 − 138.563,34 = 999.586,66  < 1.000.000 → EXENCIÓN (100 %)
   *      Cuota íntegra, último tramo de TARIFA_ESTATAL_IS (cuota 199.291,40, tipo 34,00 %):
   *          199.291,40 + (999.586,66 − 797.555,08) × 34,00 %
   *        = 199.291,40 + 68.690,7372 = 267.982,1372            → «267.982,14 €»
   *      Cuota final = 0,00 €
   *
   *  (b) 1.110.000 × 1,03 = 1.143.300 − 138.563,34 = 1.004.736,66 > 1.000.000 → 99 %
   *      Cuota íntegra = 199.291,40 + 207.181,58 × 34,00 % = 269.733,1372 → «269.733,14 €»
   *      Cuota final = 269.733,1372 × 0,01 = 2.697,331372       → «2697,33 €»
   *
   * Plusvalía en los dos (no depende del valor de referencia porque gana el objetivo):
   *   12 años → 0,09 del art. 107.4 vigente (era 0,08 con la tabla caducada del RDL 26/2021;
   *   recalculado el 24/09/2026, hallazgo 1559)
   *   objetivo = 200.000 × 0,09 × 0,25 = 4.500,00, muy por debajo del real → 4.500,00 €
   */
  test('CASO 2 (límite) — Galicia: exención total con 999.586,66 € de base y 2697,33 € con 1.004.736,66 €', async ({
    page,
  }) => {
    await abrir(page);

    await page.selectOption('#parentescoSel', 'hijo');
    await page.selectOption('#ccaaSel', 'galicia');
    await mover(page, 'edadHer', 50);
    await mover(page, 'anioAdq', ANIO - 12);
    await mover(page, 'valorAdq', 400000);
    await mover(page, 'valorSuelo', 200000);
    await mover(page, 'valorCatastralTotal', 400000);
    await casilla(page, 'viviendaHabitual', true);
    await mover(page, 'aniosVenta', 0); // aislar el ISD: sin venta

    // (a) Base liquidable 999.586,66 € → justo por DEBAJO del umbral de exención
    await mover(page, 'valorRef', 1105000);
    expect(await panel(page, ISD)).toContain('Galicia — Grupo II');
    expect(await linea(page, ISD, '= Base imponible')).toBe('1.138.150,00 €');
    expect(await linea(page, ISD, '= Base liquidable')).toBe('999.586,66 €');
    expect(await linea(page, ISD, 'Cuota íntegra (tarifa)')).toBe('267.982,14 €');
    // `exencion: 1.000.000` manda sobre el `porcentaje: 0,99` de la misma fila
    expect(await panel(page, ISD)).toContain('Bonificación CCAA (100,0%)');
    expect(await linea(page, ISD, 'Cuota ISD final')).toBe('0,00 €');
    // Art. 107.4 vigente → 12 años = 0,09 · 200.000 × 0,09 × 25 % (hallazgo 1559)
    expect(await linea(page, IIVTNU, 'Coeficiente 12 años')).toBe('0,09');
    expect(await linea(page, IIVTNU, 'Cuota plusvalía municipal')).toBe('4500,00 €');
    expect(await bloqueTotal(page)).toContain('4500,00 €');

    // (b) Base liquidable 1.004.736,66 € → justo por ENCIMA: se cae la exención
    await mover(page, 'valorRef', 1110000);
    expect(await linea(page, ISD, '= Base liquidable')).toBe('1.004.736,66 €');
    expect(await linea(page, ISD, 'Cuota íntegra (tarifa)')).toBe('269.733,14 €');
    expect(await panel(page, ISD)).toContain('Bonificación CCAA (99,0%)');
    expect(await linea(page, ISD, 'Cuota ISD final')).toBe('2697,33 €');
    expect(await bloqueTotal(page)).toContain('7197,33 €'); // 2.697,33 + 4.500,00 (hallazgo 1559)

    // Sin venta no hay IRPF
    expect(await panel(page, IRPF)).toContain('Sin venta simulada');

    // Y el motor compartido (MCP Delegum) tiene que decir lo mismo en los dos lados
    const debajo = calcularSucesion({
      baseImponible: 1105000,
      ccaa: 'galicia',
      grupo: 'II',
      viviendaHabitual: 1105000,
      incluyeAjuar: true,
    });
    expect(debajo.baseLiquidable).toBe(999586.66);
    expect(debajo.cuotaFinal).toBe(0);
    const encima = calcularSucesion({
      baseImponible: 1110000,
      ccaa: 'galicia',
      grupo: 'II',
      viviendaHabitual: 1110000,
      incluyeAjuar: true,
    });
    expect(encima.baseLiquidable).toBe(1004736.66);
    expect(encima.cuotaFinal).toBe(2697.33);
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
   *   ⚠️ Derivación rehecha el 15/09/2026 (hallazgo 867): faltaba el ajuar del art. 15 LISD.
   *   Base imponible = 350.000 × 1,03                                   360.500,00
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
   * Plusvalía: 12 años → 0,09 (art. 107.4 vigente; era 0,08, hallazgo 1559)
   *            objetivo = 200.000 × 0,09 × 0,25 = 4.500,00 (el menor)
   *            real    = (350.000 − 200.000) × mín(1; 200.000/100.000) × 0,25 = 37.500,00
   *
   * Contraste: la MISMA herencia en Madrid sí tiene derecho a la reducción estatal:
   *   350.000 − 15.956,87 − 122.606,47 = 211.436,66 de base liquidable
   *   23.063,25 + (211.436,66 − 159.634,83) × 21,25 % = 34.071,13888  → «34.071,14 €»
   *   × 1,0000 − 99 % = 340,7113888                                 → «340,71 €»
   */
  test('CASO 3 (rechazo) — Cataluña no aplica la reducción estatal al hijo, y la proporción de suelo se topa en 1', async ({
    page,
  }) => {
    await abrir(page);

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
    // 200.000 × 0,09 × 25 % (hallazgo 1559)
    expect(await linea(page, IIVTNU, 'Método objetivo')).toBe('4500,00 €');
    expect(await linea(page, IIVTNU, 'Cuota plusvalía municipal')).toBe('4500,00 €');

    expect(await bloqueTotal(page)).toContain('4500,00 €'); // 0,00 de ISD + 4.500,00 de plusvalía

    // Contraste: la misma herencia en Madrid SÍ reduce por vivienda habitual
    await page.selectOption('#ccaaSel', 'madrid');
    expect(await linea(page, ISD, '− Reducción vivienda habitual (95%)')).toBe('−122.606,47 €');
    expect(await linea(page, ISD, '= Base liquidable')).toBe('221.936,66 €');
    expect(await linea(page, ISD, 'Cuota ISD final')).toBe('363,02 €');
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
      await abrir(page);

      const sello = page.locator('[aria-label="Datos de referencia normativos"]');
      const texto = (await sello.first().innerText()).replace(/\s+/g, ' ');

      // Lo que hoy se ve: la verificación del ISD y nada más
      expect(texto).toContain('01/01/2025');
      // Lo que faltaría: el módulo del que salen la plusvalía municipal y la escala del IRPF
      expect(await sello.count()).toBeGreaterThan(1);
      const todos = (await sello.allInnerTexts()).join(' ').replace(/\s+/g, ' ');
      // ⚠️ 24/09/2026 (hallazgo 1559): aquí se exigía 'RDL 26/2021', que era la norma que
      // declaraba `PLUSVALIA_MUNICIPAL_META.baseNormativa` mientras la tabla que servía estaba
      // caducada desde 2023. Resellado ese día: la base es el TRLRHL y los coeficientes son
      // los que el art. 24 del RDL 8/2023 dio al art. 107.4. Lo que este test protege —que el
      // sello del IIVTNU exista y nombre SU norma— no cambia; cambia el nombre de la norma.
      expect(todos).toContain('Plusvalía municipal (IIVTNU)');
      expect(todos).toContain('art. 24 del RDL 8/2023');

      /**
       * ⚠️ CORREGIDO EN EL TEST el 10/09/2026, sin tocar la app.
       *
       * Aquí había una línea más: `expect(todos).toContain('17/06/2026')`, con el
       * comentario «FISCAL_INMUEBLES_META.verificado». Fijaba como contrato correcto
       * justamente lo que hoy es el defecto: el segundo sello rotula «Plusvalía municipal
       * (IIVTNU) e IRPF de la venta» y enseña una sola fecha, la del módulo entero
       * (17/06/2026), mientras `PLUSVALIA_MUNICIPAL_META` —de donde salen el tipo
       * orientativo y los `COEFICIENTES_IIVTNU_2025`— declara la suya propia: 15/01/2025,
       * vigencia 2025.
       *
       * Es el hallazgo 610 dado la vuelta: entonces el sello único enseñaba una fecha
       * año y medio ANTERIOR a la del módulo que aportaba dos de los tres impuestos, y
       * ahora enseña una 17 meses POSTERIOR a la del dato que rotula. Con la línea puesta,
       * el defecto no podía verse: el test estaba verde. La comprobación de lo que el
       * sello DEBERÍA decir va en su propio test, más abajo, con `test.fail()`.
       *
       * (24/09/2026: `PLUSVALIA_MUNICIPAL_META` se reselló ese día —verificado 2026-09-24,
       * vigencia 2026— al cambiar la tabla de coeficientes por la vigente, hallazgo 1559.
       * Las fechas de arriba son las de entonces; el test del sello, más abajo, fija las de
       * hoy.)
       */
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
    await abrir(page);
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
    await abrir(page);
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
    await abrir(page);
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
//   Coeficientes del art. 107.4 vigente (hallazgo 1559, 24/09/2026): 3 años → 0,14 ·
//   4 años → 0,16 · 12 y 15 años → 0,09 · 20 años → 0,40 (con la tabla caducada del
//   RDL 26/2021, que es la que se usó aquí hasta ese día: 0,16 · 0,17 · 0,08 · 0,12 · 0,45)
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
   *   ⚠️ Rehecha el 15/09/2026 (hallazgo 867): faltaba el ajuar del art. 15 LISD.
   *   Base imponible = 400.000 × 1,03                                  412.000,00
   *   − Reducción parentesco  REDUCCIONES_PARENTESCO_IS['II-ascendiente'] −15.956,87
   *   − Reducción vivienda    mín(400.000 × 0,95 = 380.000; 122.606,47)  −122.606,47
   *   = Base liquidable                                                 273.436,66
   *   Cuota íntegra, tramo que arranca en 239.389,13:
   *        40.011,04 + (273.436,66 − 239.389,13) × 25,50 % = 48.693,160150
   *   × 1,0000 → − 99 % (Cantabria, Grupo II) → cuota final «486,93 €»
   *   Cuota íntegra por la COLUMNA `cuota` de TARIFA_ESTATAL_IS, tramo del 25,50 %:
   *        40.011,04 + (261.436,66 − 239.389,13) × 25,50 %
   *      = 40.011,04 + 22.047,53 × 0,255 = 40.011,04 + 5.622,12015
   *      = 45.633,16015                                              → «45.633,16 €»
   *   × COEFICIENTES_IS['II'][0] = 1,0000 → cuota tributaria 45.633,16015
   *   Cantabria, escalonado: 261.436,66 > 100.000 → 99 % (NO el 100 % del primer tramo)
   *      bonificación = 45.633,16 × 99 % = 45.176,8284               → «45.176,83 €»
   *   Cuota ISD final = 45.633,16 − 45.176,83                        → «456,33 €»
   *   (hasta el 09/09/2026 la bonificación se calculaba sobre la cuota tributaria SIN
   *    redondear, y entonces la resta escrita daba un céntimo menos que el total: es la
   *    segunda manifestación del hallazgo 657)
   *
   * ISD REGULARIZADO (venta a los 4 años, dentro de los 10 del art. 20.2.c):
   *   Base liquidable sin la reducción de vivienda = 412.000 − 15.956,87 = 396.043,13
   *   Cuota íntegra = 40.011,04 + (396.043,13 − 239.389,13) × 25,50 % = 79.957,81
   *   − 99 % (79.158,23) = 799,58 · Regularización = 799,58 − 486,93 = 312,65
   *
   * ⚠️ De aquí abajo, RECALCULADO el 24/09/2026 con la tabla vigente del art. 107.4 TRLRHL
   * (hallazgo 1559). La derivación anterior usaba 0,08 y 0,17 de la tabla caducada del RDL
   * 26/2021, y además un ISD sin ajuar ni regularización.
   *
   * Plusvalía municipal (IIVTNU), tipo ORIENTATIVO del módulo (25 %):
   *   12 años de tenencia → coeficiente 0,09 (zona plana de la tabla: 12 a 15 años)
   *   Método objetivo = 90.000 × 0,09 × 0,25 =  2.025,00
   *   Método real     = (400.000 − 120.000) × (90.000 / 180.000) × 0,25 = 35.000,00
   *   Se elige el MENOR = 2.025,00 → objetivo
   *   Venta a los 4 años → coeficiente 0,16: 90.000 × 0,16 × 0,25 = 3.600,00
   *     (real = (470.000 − 400.000) × 0,5 × 0,25 = 8.750,00)
   *
   * IRPF al vender a los 4 años por 470.000 €:
   *   Valor de adquisición fiscal = 400.000 + 486,93 + 312,65 + 2.025 = 402.824,58
   *   Valor de transmisión = 470.000 − 3.600 = 466.400,00
   *   Ganancia = 466.400 − 402.824,58 = 63.575,42
   *        6.000,00 × 19 % = 1.140,00
   *       44.000,00 × 21 % = 9.240,00
   *       13.575,42 × 23 % = 3.122,3466
   *                          ──────────
   *                          13.502,3466                              → «13.502,35 €»
   *   (la misma ganancia que con la tabla vieja, por casualidad: la herencia sube 225,00 €
   *    —de 1.800 a 2.025— y la venta baja exactamente 225,00 —de 3.825 a 3.600—)
   *
   * TOTAL = 486,93 + 312,65 + 2.025 + 3.600 + 13.502,3466 = 19.926,9266  → «19.926,93 €»
   * Sobre la venta = 19.926,9266 / 470.000 × 100 = 4,2398 %          → «4,24 %»
   */
  test('CASO 1 (normal) — ascendiente en Cantabria: 486,93 € + 312,65 € + 2025,00 € + 3600,00 € + 13.502,35 € = 19.926,93 €', async ({
    page,
  }) => {
    await abrir(page);

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
    expect(await linea(page, ISD, '= Base imponible')).toBe('412.000,00 €');
    expect(await linea(page, ISD, '− Reducción parentesco')).toBe('−15.956,87 €');
    // El tope manda: el 95 % de 400.000 son 380.000, muy por encima de 122.606,47
    expect(await linea(page, ISD, '− Reducción vivienda habitual (95%)')).toBe('−122.606,47 €');
    expect(await linea(page, ISD, '= Base liquidable')).toBe('273.436,66 €');
    expect(await linea(page, ISD, 'Cuota íntegra (tarifa)')).toBe('48.693,16 €');
    expect(await linea(page, ISD, '× Coef. patrimonio (Grupo II)')).toBe('×1,0000');
    expect(await linea(page, ISD, '= Cuota tributaria')).toBe('48.693,16 €');
    // El segundo escalón de Cantabria: 99 %, no el 100 % que rige por debajo de 100.000 €
    expect(await panel(page, ISD)).toContain('Bonificación CCAA (99,0%)');
    // 45.633,16 × 99 % = 45.176,8284 → 45.176,83, y 45.633,16 − 45.176,83 = 456,33 (657)
    expect(await linea(page, ISD, '− Bonificación CCAA (99,0%)')).toBe('−48.206,23 €');
    expect(await linea(page, ISD, 'Cuota ISD final')).toBe('486,93 €');

    // ── Plusvalía municipal ──────────────────────────────────────────────────
    expect(await panel(page, IIVTNU)).toContain('12 años de tenencia');
    // Art. 107.4 vigente: 12 años → 0,09 · 90.000 × 0,09 × 25 % (hallazgo 1559)
    expect(await linea(page, IIVTNU, 'Coeficiente 12 años')).toBe('0,09');
    expect(await linea(page, IIVTNU, 'Tipo municipal (orientativo)')).toBe('25%');
    expect(await linea(page, IIVTNU, 'Método objetivo')).toBe('2025,00 €');
    expect(await linea(page, IIVTNU, 'Método real (suelo)')).toBe('35.000,00 €');
    expect(await linea(page, IIVTNU, 'Método elegido')).toBe('Objetivo (menor)');
    expect(await linea(page, IIVTNU, 'Cuota plusvalía municipal')).toBe('2025,00 €');

    // ── IRPF ─────────────────────────────────────────────────────────────────
    // 400.000 + 486,93 + 312,65 + 2.025 (hallazgo 1559) · ganancia (470.000 − 3.600) − 402.824,58
    expect(await linea(page, IRPF, 'Valor adquisición fiscal*')).toBe('402.824,58 €');
    expect(await linea(page, IRPF, 'Ganancia patrimonial')).toBe('63.575,42 €');
    expect(await linea(page, IRPF, 'Cuota IRPF venta')).toBe('13.502,35 €');

    // ── Total ────────────────────────────────────────────────────────────────
    const total = await bloqueTotal(page);
    // 486,93 + 312,65 + 2.025,00 + 3.600,00 + 13.502,3466 — el mismo total que con la tabla
    // vieja: los 225,00 € que sube la herencia los baja la venta (hallazgo 1559)
    expect(total).toContain('19.926,93');
    expect(total).toContain('4,24%');
    expect(total).not.toMatch(/19,926\.93/); // nunca formato US
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
   *      Cuota íntegra = 15.606,22 + (156.108,09 − 119.757,67) × 18,70 %
   *                    = 15.606,22 + 6.797,52854 = 22.403,74854        → «22.403,75 €»
   *
   *  (b) 13 años → 15.956,87 + 8 × 3.990,72 = 47.882,63 → TOPADA en 47.858,59
   *      Base liquidable = 500.000 − 47.858,59 − 300.000 = 152.141,41
   *      Cuota íntegra = 15.606,22 + (152.141,41 − 119.757,67) × 18,70 %
   *                    = 15.606,22 + 6.055,75938 = 21.661,97938        → «21.661,98 €»
   *
   *  (c) 12 años → 15.956,87 + 9 × 3.990,72 = 51.873,35 → TOPADA en los MISMOS 47.858,59,
   *      así que la cuota no se mueve de 21.661,98 €. Si el tope no estuviera, aquí
   *      bajaría otros 407 € y el test lo vería.
   *
   * Plusvalía en los tres: adquisición hace 20 años → 0,40 del art. 107.4 vigente (era
   * 0,45 con la tabla caducada del RDL 26/2021; recalculado el 24/09/2026, hallazgo 1559)
   *   objetivo = 150.000 × 0,40 × 0,25 = 15.000,00
   *   real     = (500.000 − 100.000) × (150.000 / 300.000) × 0,25 = 50.000,00 → gana el objetivo
   * Sin venta (0 años), así que no hay IRPF: TOTAL = ISD + 15.000,00.
   */
  test('CASO 2 (límite) — el tope de 47.858,59 € del art. 20.2.a: muerde a los 13 años, no a los 14', async ({
    page,
  }) => {
    await abrir(page);

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
    expect(await linea(page, ISD, '= Base liquidable')).toBe('171.108,09 €');
    expect(await linea(page, ISD, 'Cuota íntegra (tarifa)')).toBe('25.501,32 €');
    expect(await linea(page, ISD, '× Coef. patrimonio (Grupo I)')).toBe('×1,0000');
    expect(await linea(page, ISD, 'Cuota ISD final')).toBe('25.501,32 €');

    // (b) 13 años — el primer año CON tope: la reducción bruta serían 47.882,63 €
    await mover(page, 'edadHer', 13);
    expect(await linea(page, ISD, '− Reducción parentesco')).toBe('−47.858,59 €');
    expect(await linea(page, ISD, '= Base liquidable')).toBe('167.141,41 €');
    expect(await linea(page, ISD, 'Cuota ISD final')).toBe('24.658,40 €');

    // (c) 12 años — el tope NO sigue subiendo: misma reducción y misma cuota que con 13
    await mover(page, 'edadHer', 12);
    expect(await linea(page, ISD, '− Reducción parentesco')).toBe('−47.858,59 €');
    expect(await linea(page, ISD, 'Cuota ISD final')).toBe('24.658,40 €');

    // La plusvalía no depende de la edad del heredero, y el IRPF no existe sin venta
    // 0,40 y 150.000 × 0,40 × 25 % (hallazgo 1559)
    expect(await linea(page, IIVTNU, 'Coeficiente 20 años')).toBe('0,40');
    expect(await linea(page, IIVTNU, 'Cuota plusvalía municipal')).toBe('15.000,00 €');
    expect(await panel(page, IRPF)).toContain('Sin venta simulada');
    expect(await bloqueTotal(page)).toContain('39.658,40'); // 24.658,40 + 15.000,00
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
   *   ⚠️ Rehecha el 15/09/2026 (hallazgo 867): faltaba el ajuar del art. 15 LISD.
   *   Base imponible = 300.000 × 1,03                                   309.000,00
   *   − Reducción parentesco  REDUCCIONES_PARENTESCO_CATALUNA_IS['III']    −8.000,00
   *   − Reducción vivienda    95 % de 300.000 (tope catalán 500.000)     −285.000,00
   *   = Base liquidable                                                   16.000,00
   *   Cuota íntegra por TARIFA_CATALUNA_IS, primer tramo: 7 % de 16.000 =   1.120,00
   *   × COEFICIENTES_CATALUNA_IS['III'][0] = 1,5882 → 1.778,784          → «1778,78 €»
   *
   * Y en la misma pantalla:
   *
   *   Plusvalía: valor de adquisición = valor de referencia = 300.000 €, así que el
   *   incremento es EXACTAMENTE cero. El RDL 26/2021 no sujeta la transmisión sin
   *   incremento, y el borde es `<= 0`, no `< 0`: la cuota tiene que ser 0,00 € y el
   *   método, «No sujeta» — aunque el objetivo calculado siga a la vista: 15 años → 0,09
   *   del art. 107.4 vigente, 90.000 × 0,09 × 0,25 = 2.025,00 € (hasta el 24/09/2026 se
   *   esperaba 0,12 → 2.700,00 €, de la tabla caducada del RDL 26/2021 — hallazgo 1559).
   *
   *   ⚠️ IRPF y TOTAL, RECALCULADOS el 24/09/2026 (hallazgo 1559). La derivación anterior
   *   era la de antes del régimen catalán (ISD 778,218 y sin regularización), y las
   *   aserciones ya no la seguían.
   *   ISD regularizado: la venta a los 3 años cae dentro de los 5 del art. 19 de la Ley
   *   19/2010, y sin la reducción la cuota es la de la segunda mitad del test (63.797,99):
   *     63.797,99 − 1.778,78 = 62.019,21
   *   Plusvalía de la VENTA a los 3 años: coeficiente 0,14 → 90.000 × 0,14 × 0,25 = 3.150,00
   *     (real = (400.000 − 300.000) × (90.000 / 200.000) × 0,25 = 11.250,00)
   *   IRPF: venta a los 3 años por 400.000 €.
   *     Valor de adquisición fiscal = 300.000 + 1.778,78 + 62.019,21 + 0 = 363.797,99
   *     Valor de transmisión = 400.000 − 3.150 = 396.850,00
   *     Ganancia = 396.850 − 363.797,99 = 33.052,01
   *       → 6.000 × 19 % + 27.052,01 × 21 % = 1.140 + 5.680,9221 = 6.820,9221 → «6820,92 €»
   *
   *   TOTAL = 1.778,78 + 62.019,21 + 0 + 3.150 + 6.820,9221 = 73.768,9121 → «73.768,91 €»
   */
  test('CASO 3 — colateral de 70 años que convivió: en Cataluña SÍ reduce, y la casilla decide', async ({
    page,
  }) => {
    await abrir(page);

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
    expect(await linea(page, ISD, '= Base liquidable')).toBe('16.000,00 €');
    // Primer tramo de TARIFA_CATALUNA_IS: 7 % de 7.000 = 490,00
    expect(await linea(page, ISD, 'Cuota íntegra (tarifa)')).toBe('1120,00 €');
    expect(await linea(page, ISD, '× Coef. patrimonio (Grupo III)')).toBe('×1,5882');
    // 490 × 1,5882 = 778,218
    expect(await linea(page, ISD, 'Cuota ISD final')).toBe('1778,78 €');

    // Plusvalía: incremento EXACTAMENTE cero → no sujeta (el borde es «<= 0»)
    // El objetivo, a la vista: 90.000 × 0,09 (15 años) × 25 % (hallazgo 1559)
    expect(await linea(page, IIVTNU, 'Método objetivo')).toBe('2025,00 €');
    expect(await linea(page, IIVTNU, 'Método real (suelo)')).toBe('No sujeta (sin incremento)');
    expect(await linea(page, IIVTNU, 'Método elegido')).toBe('No sujeta');
    expect(await linea(page, IIVTNU, 'Cuota plusvalía municipal')).toBe('0,00 €');

    // Recalculado el 24/09/2026 (hallazgo 1559), desarrollo en la cabecera del caso:
    // Valor de adquisición fiscal = 300.000 + 1.778,78 + 62.019,21 (regularizado) = 363.797,99
    // Ganancia = (400.000 − 3.150 de IIVTNU de la venta) − 363.797,99 = 33.052,01
    //      6.000,00 × 19 % = 1.140,00
    //     27.052,01 × 21 % = 5.680,9221
    //                        ──────────
    //                        6.820,9221
    expect(await linea(page, IRPF, 'Valor adquisición fiscal*')).toBe('363.797,99 €');
    expect(await linea(page, IRPF, 'Cuota IRPF venta')).toBe('6820,92 €');
    // 1.778,78 + 62.019,21 + 0 + 3.150,00 + 6.820,9221
    expect(await bloqueTotal(page)).toContain('73.768,91');

    /**
     * Y desmarcar la convivencia SÍ mueve la cuota, que es lo que este caso vino a comprobar.
     * Las cifras de esta segunda mitad son, literalmente, las que el test esperaba en su
     * versión anterior para el heredero que sí convivía: mientras Cataluña denegaba la
     * reducción a todo el mundo, cumplir el requisito o no cumplirlo daba igual, y un caso
     * construido para ejercitar la casilla no ejercitaba nada.
     *
     *   ⚠️ Rehecho el 24/09/2026 (hallazgo 1559; la derivación anterior era de antes del
     *   ajuar y del régimen catalán):
     *   Base liquidable 309.000 − 8.000 = 301.000 → 14.500 + (301.000 − 150.000) × 17 %
     *   = 40.170,00 × 1,5882 = 63.797,994 → «63.797,99 €». Sin reducción no hay
     *   regularización, así que el ISD pagado es el mismo que en la primera mitad y con él el
     *   valor de adquisición (363.797,99), la ganancia (33.052,01), el IRPF (6.820,9221) y
     *   el total: 63.797,99 + 0 + 3.150,00 + 6.820,9221 = 73.768,9121 → «73.768,91 €».
     */
    await casilla(page, 'convivencia', false);
    expect(await panel(page, ISD)).toContain('que no convivió');
    expect(await linea(page, ISD, '= Base liquidable')).toBe('301.000,00 €');
    expect(await linea(page, ISD, 'Cuota ISD final')).toBe('63.797,99 €');
    expect(await linea(page, IRPF, 'Valor adquisición fiscal*')).toBe('363.797,99 €');
    expect(await linea(page, IRPF, 'Cuota IRPF venta')).toBe('6820,92 €');
    expect(await bloqueTotal(page)).toContain('73.768,91');
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
          edadHeredero: 68, viviendaHabitual: 400000, incluyeAjuar: true,
        },
      },
      {
        nombre: 'Grupo I de 13 años en Asturias (reducción topada)',
        ui: { parentesco: 'hijo_menor21', ccaa: 'asturias', edad: 13, valorRef: 500000, vivienda: false },
        motor: {
          baseImponible: 500000, ccaa: 'asturias', grupo: 'I-descendiente' as const,
          edadHeredero: 13, incluyeAjuar: true,
        },
      },
      {
        nombre: 'colateral de 70 años que convivió, en Cataluña',
        ui: { parentesco: 'hermano', ccaa: 'cataluna', edad: 70, valorRef: 300000, vivienda: true },
        motor: {
          baseImponible: 300000, ccaa: 'cataluna', grupo: 'III' as const, edadHeredero: 70,
          convivenciaDosAnios: true, viviendaHabitual: 300000, incluyeAjuar: true,
        },
      },
    ];

    await abrir(page);
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
   *     cuota íntegra    = 4685,10 + (50.000 − 47.930,72) × 12,75 % = 4948,933200
   *     pintada          → «4948,93 €»
   *     × 2,0000         → la pantalla multiplicaba la íntegra SIN redondear y sacaba un
   *                        céntimo de más; 4.948,93 × 2 son 9.897,86
   *     `calcularSucesion` (motor del MCP Delegum y de /api/chatgpt/sucesiones) → 9.897,86 €
   *
   *   Y en la línea de la bonificación, que es la que ve la mayoría del catálogo (cualquier
   *   CCAA con 99 %), pasaba lo mismo restando — CASO 1 de esta misma tanda: pintaba la
   *   bonificación calculada sobre la cuota tributaria SIN redondear, y la resta escrita
   *   daba un céntimo menos que el total que la propia pantalla anunciaba.
   *
   * LA REPARACIÓN: `page.tsx` redondea al céntimo cada importe con `redondearCentimos`, que
   * es el mismo `Math.round(n * 100) / 100` que `calcularSucesion` aplica en los mismos
   * pasos. NO se pasó a llamar a `calcularSucesion` porque el motor arrastraba entonces dos
   * defectos propios: perdía la reducción en BASE de Asturias para el NIETO (leía
   * `bonificaciones['II-descendiente']`, clave que ninguna CCAA declara) y publicaba la
   * bonificación redondeada mientras redondeaba la RESTA sin redondear, contradiciéndose a
   * sí mismo en 20.104 combinaciones.
   *
   * ⚠️ COMENTARIO CORREGIDO el 10/09/2026: los DOS defectos del motor se repararon en el
   * commit `0a2fa220` (09/09/2026) —`claveBonificacion` en `reduccionAutonomicaBase` y
   * `bonificacionPublicada` en la resta—, así que la razón para no llamarlo ya no existe.
   * Lo que sigue vigente es la INVARIANTE que este test protege. Que hoy los dos caminos
   * coinciden lo mide el barrido WEB ↔ MOTOR de la tanda del 10/09/2026.
   */
  test(
    'REGRESIÓN 657 — la cuota tributaria impresa es la cuota íntegra impresa por el coeficiente',
    async ({ page }) => {
      await abrir(page);
      await page.selectOption('#parentescoSel', 'sin_parentesco');
      await page.selectOption('#ccaaSel', 'madrid');
      await mover(page, 'edadHer', 40);
      await mover(page, 'valorRef', 50000);
      await mover(page, 'aniosVenta', 0);

      const cuotaIntegra = importe(await linea(page, ISD, 'Cuota íntegra (tarifa)'));
      const coeficiente = importe(await linea(page, ISD, '× Coef. patrimonio (Grupo IV)'));
      const cuotaTributaria = importe(await linea(page, ISD, '= Cuota tributaria'));

      expect(cuotaIntegra).toBe(5140.18);
      expect(coeficiente).toBe(2);
      // 4.948,93 × 2,0000 = 9.897,86 — hasta el 09/09/2026 la pantalla sacaba un céntimo más
      expect(cuotaTributaria).toBe(Math.round(cuotaIntegra * coeficiente * 100) / 100);

      // Y el motor compartido, con la misma herencia, liquida 8.671,82 €
      const motor = calcularSucesion({ baseImponible: 50000, ccaa: 'madrid', grupo: 'IV', edadHeredero: 40, incluyeAjuar: true });
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

    await abrir(page);
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
   * Sobre la cuota de ISD de 456,33 € que esta misma app liquida en el CASO 1 de arriba:
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
      await abrir(page);

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

// ═════════════════════════════════════════════════════════════════════════════
// RE-INSPECCIÓN 10/09/2026 — la app vuelve a la cola porque sus dependencias se
// movieron: `0a2fa220` reparó los dos defectos de `lib/calculadoras/sucesiones.ts`
// que esta app documentaba como divergencias «a propósito», y `1808419c` retiró
// 86 motores del repositorio. Los tres casos nuevos se resolvieron A MANO, con las
// cifras ancladas a `data/fiscal`, ANTES de abrir el navegador.
// ═════════════════════════════════════════════════════════════════════════════

test.describe('Simulador de heredar vivienda — re-inspección 10/09/2026', () => {
  /**
   * CASO 1 (NORMAL) — Canarias al Grupo III, la rama del catálogo que ninguna tanda
   * anterior había pisado: es la ÚNICA comunidad de régimen común que bonifica al
   * colateral (`BONIFICACIONES_CCAA_IS['canarias'].bonificaciones['III'].porcentaje` =
   * 0,999), y además con el porcentaje más alto de las 17. Las tandas anteriores probaron
   * el Grupo III en Madrid (50 %), Extremadura y Andalucía (0 %) y País Vasco (0 %), donde
   * un fallo al leer un porcentaje de tres decimales no se vería.
   *
   * Hermano de 55 años, Canarias, 300.000 € de valor de referencia que NO era vivienda
   * habitual, comprada hace 12 años por 120.000 €, catastral de suelo 90.000 € sobre un
   * catastral total de 250.000 €, y venta a los 4 años por 340.000 €.
   *
   * ISD (`data/fiscal/sucesiones.ts`):
   *   ⚠️ Rehecha el 15/09/2026 (hallazgo 867): faltaba el ajuar del art. 15 LISD.
   *   Base imponible = 300.000 × 1,03                           309.000,00
   *   − REDUCCIONES_PARENTESCO_IS['III']                          −7.993,46
   *   = Base liquidable                                          301.006,54
   *   Cuota íntegra por la COLUMNA `cuota` de TARIFA_ESTATAL_IS (tramo hasta 398.777,54):
   *        40.011,04 + (292.006,54 − 239.389,13) × 25,50 %
   *      = 40.011,04 + 15.712,438550 = 55.723,478550          → «55.723,48 €»
   *   × COEFICIENTES_IS['III'][0] = 1,5882 → 88.500,027...   → «88.500,03 €»
   *   − 99,9 % → cuota ISD final                              → «88,50 €»
   *   = Cuota ISD final 84.855,11 − 84.770,26 = 84,85        → «84,86 €»
   *
   * ⚠️ De aquí abajo, RECALCULADO el 24/09/2026 con la tabla vigente del art. 107.4 TRLRHL
   * (hallazgo 1559). La derivación anterior usaba 0,08 (tabla caducada del RDL 26/2021),
   * una cuota de ISD de 84,86 € anterior al ajuar y no contaba la plusvalía de la venta.
   * La cuota de ISD que entra es la que se imprime: 88,50 € (sin vivienda habitual no hay
   * reducción que perder, así que tampoco regularización).
   *
   * Plusvalía municipal (`data/fiscal/inmuebles.ts`, tipo ORIENTATIVO del 25 %):
   *   12 años → coeficiente 0,09
   *   Objetivo = 90.000 × 0,09 × 0,25 = 2.025,00
   *   Real     = (300.000 − 120.000) × (90.000 / 250.000) × 0,25 = 64.800 × 0,25 = 16.200,00
   *   Se elige el MENOR → 2.025,00, objetivo
   *   Venta a los 4 años → coeficiente 0,16: objetivo 90.000 × 0,16 × 0,25 = 3.600,00 y real
   *   (340.000 − 300.000) × 0,36 × 0,25 = 3.600,00 — EMPATE; la cuota es 3.600,00 por los
   *   dos métodos (con la tabla vieja, 0,17 → 3.825, ganaba el real con los mismos 3.600).
   *
   * IRPF al vender a los 4 años por 340.000 € (TRAMOS_GANANCIAS_PATRIMONIALES_2025):
   *   Valor de adquisición fiscal = 300.000 + 88,50 + 2.025,00 = 302.113,50
   *   Valor de transmisión = 340.000 − 3.600 = 336.400,00
   *   Ganancia = 336.400 − 302.113,50 = 34.286,50
   *        6.000,00 × 19 % = 1.140,00
   *       28.286,50 × 21 % = 5.940,165
   *                          ─────────
   *                           7.080,165                       → «7080,17 €»
   *
   * TOTAL = 88,50 + 2.025,00 + 3.600,00 + 7.080,165 = 12.793,665 → «12.793,67 €»
   * Sobre la venta = 12.793,665 / 340.000 × 100 = 3,7628 %        → «3,76 %»
   * (los dos medios céntimos, 7.080,165 y 12.793,665, se pintan hacia arriba: comprobado
   *  contra la pantalla, no supuesto)
   */
  test('CASO 1 (normal) — Canarias bonifica también al Grupo III: 88,50 € + 2025,00 € + 3600,00 € + 7080,17 €', async ({
    page,
  }) => {
    await abrir(page);

    await page.selectOption('#parentescoSel', 'hermano');
    await page.selectOption('#ccaaSel', 'canarias');
    await mover(page, 'edadHer', 55);
    await mover(page, 'anioAdq', ANIO - 12);
    await mover(page, 'valorAdq', 120000);
    await mover(page, 'valorRef', 300000);
    await mover(page, 'valorSuelo', 90000);
    await mover(page, 'valorCatastralTotal', 250000);
    await casilla(page, 'viviendaHabitual', false);
    await mover(page, 'aniosVenta', 4);
    await mover(page, 'valorVta', 340000);

    expect(await panel(page, ISD)).toContain('Canarias — Grupo III');
    expect(await linea(page, ISD, '− Reducción parentesco')).toBe('−7993,46 €');
    expect(await linea(page, ISD, '= Base liquidable')).toBe('301.006,54 €');
    expect(await linea(page, ISD, 'Cuota íntegra (tarifa)')).toBe('55.723,48 €');
    expect(await linea(page, ISD, '× Coef. patrimonio (Grupo III)')).toBe('×1,5882');
    expect(await linea(page, ISD, '= Cuota tributaria')).toBe('88.500,03 €');
    expect(await panel(page, ISD)).toContain('Bonificación CCAA (99,9%)');
    expect(await linea(page, ISD, 'Cuota ISD final')).toBe('88,50 €');

    // Art. 107.4 vigente: 12 años → 0,09 · 90.000 × 0,09 × 25 % (hallazgo 1559)
    expect(await linea(page, IIVTNU, 'Coeficiente 12 años')).toBe('0,09');
    expect(await linea(page, IIVTNU, 'Método objetivo')).toBe('2025,00 €');
    expect(await linea(page, IIVTNU, 'Método real (suelo)')).toBe('16.200,00 €');
    expect(await linea(page, IIVTNU, 'Cuota plusvalía municipal')).toBe('2025,00 €');

    // 300.000 + 88,50 + 2.025 · (340.000 − 3.600) − 302.113,50 · 1.140 + 28.286,50 × 21 %
    expect(await linea(page, IRPF, 'Valor adquisición fiscal*')).toBe('302.113,50 €');
    expect(await linea(page, IRPF, 'Ganancia patrimonial')).toBe('34.286,50 €');
    expect(await linea(page, IRPF, 'Cuota IRPF venta')).toBe('7080,17 €');

    const total = await bloqueTotal(page);
    // 88,50 + 2.025,00 + 3.600,00 + 7.080,165 = 12.793,665 (hallazgo 1559)
    expect(total).toContain('12.793,67 €');
    expect(total).toContain('3,76%');

    // Y el motor compartido (MCP Delegum y /api/chatgpt/sucesiones) liquida lo mismo
    expect(
      calcularSucesion({ baseImponible: 300000, ccaa: 'canarias', grupo: 'III', edadHeredero: 55, incluyeAjuar: true })
        .cuotaFinal
    ).toBe(88.5);
  });

  /**
   * CASO 2 (LÍMITE) — el TOPE de la reducción por vivienda habitual del art. 20.2.c LISD,
   * en el escalón exacto en el que empieza a morder.
   *
   * `REDUCCION_VIVIENDA_PORC_IS` = 0,95 y `REDUCCION_VIVIENDA_MAX_IS` = 122.606,47 €, así
   * que el tope entra en juego a partir de 122.606,47 / 0,95 = 129.059,44 € de valor de
   * referencia. Con el paso de 5.000 € del deslizador, el corte cae entre 125.000 € (donde
   * manda el 95 %) y 130.000 € (donde manda el tope). Las tandas anteriores probaron el tope
   * ya aplicado (500.000 €, 135.000 €), nunca la FRONTERA.
   *
   * Se elige un COLATERAL de 70 años que convivió los 2 años anteriores, en Extremadura:
   *   · el colateral es el único perfil al que la reducción se le puede negar (art. 20.2.c),
   *     así que probar el tope sobre él prueba de paso que el derecho está bien concedido;
   *   · Extremadura NO bonifica al Grupo III (`…['extremadura']…['III'].porcentaje` = 0),
   *     de modo que el efecto del tope llega ENTERO a la cuota final, sin que un 99 % lo
   *     aplane hasta hacerlo invisible.
   *
   *   125.000 € → 0,95 × 125.000 = 118.750,00 < 122.606,47 → manda el 95 %
   *               Base liquidable = máx(0; 125.000 − 7.993,46 − 118.750,00) = 0,00
   *   130.000 € → 0,95 × 130.000 = 123.500,00 > 122.606,47 → manda el TOPE
   *               Base liquidable = máx(0; 130.000 − 7.993,46 − 122.606,47) = 0,00
   *   135.000 € → tope de nuevo, y ya asoma base liquidable:
   *               135.000 − 7.993,46 − 122.606,47 = 4.400,07
   *               Cuota íntegra = 0 + 4.400,07 × 7,65 % = 336,605355   → «336,61 €»
   *               × COEFICIENTES_IS['III'][0] = 1,5882 → 534,604002   → «534,60 €»
   *               − 0 % (Extremadura, Grupo III) = 534,60             → «534,60 €»
   *
   * Sin el tope, ese heredero pagaría 0,00 €: 0,95 × 135.000 = 128.250,00 se comería la base
   * entera. Los 534,60 € son exactamente lo que el tope produce.
   */
  test('CASO 2 (límite) — el tope de 122.606,47 € del art. 20.2.c muerde entre 125.000 € y 130.000 €', async ({
    page,
  }) => {
    await abrir(page);

    await page.selectOption('#parentescoSel', 'hermano');
    await page.selectOption('#ccaaSel', 'extremadura');
    await mover(page, 'edadHer', 70);
    await casilla(page, 'viviendaHabitual', true);
    await casilla(page, 'convivencia', true);
    await mover(page, 'aniosVenta', 0);

    // Justo por DEBAJO del corte: manda el 95 %
    await mover(page, 'valorRef', 125000);
    expect(await linea(page, ISD, '− Reducción vivienda habitual (95%)')).toBe('−118.750,00 €');
    expect(await linea(page, ISD, '= Base liquidable')).toBe('2006,54 €');
    expect(await linea(page, ISD, 'Cuota ISD final')).toBe('243,79 €');

    // Justo por ENCIMA: manda el tope de REDUCCION_VIVIENDA_MAX_IS
    await mover(page, 'valorRef', 130000);
    expect(await linea(page, ISD, '− Reducción vivienda habitual (95%)')).toBe('−122.606,47 €');
    expect(REDUCCION_VIVIENDA_MAX_IS).toBe(122606.47);

    // Y el importe en el que el tope ya decide lo que se paga
    await mover(page, 'valorRef', 135000);
    expect(await linea(page, ISD, '− Reducción vivienda habitual (95%)')).toBe('−122.606,47 €');
    expect(await linea(page, ISD, '= Base liquidable')).toBe('8450,07 €');
    expect(await linea(page, ISD, 'Cuota íntegra (tarifa)')).toBe('650,31 €');
    expect(await linea(page, ISD, '= Cuota tributaria')).toBe('1032,82 €');
    expect(await panel(page, ISD)).toContain('Bonificación CCAA (0,0%)');
    expect(await linea(page, ISD, 'Cuota ISD final')).toBe('1032,82 €');

    // El motor compartido, con la misma herencia, dice lo mismo
    expect(
      calcularSucesion({
        baseImponible: 135000,
        ccaa: 'extremadura',
        grupo: 'III',
        edadHeredero: 70,
        viviendaHabitual: 135000,
        convivenciaDosAnios: true,
        incluyeAjuar: true,
      }).cuotaFinal
    ).toBe(1032.82);
  });

  /**
   * CASO 3 (RECHAZO) — Cataluña deniega la reducción por vivienda habitual al Grupo IV, y
   * lo DICE con su norma, no con la estatal.
   *
   * Es la rama catalana de `evaluarReduccionVivienda` que ninguna tanda había ejercitado:
   * el art. 17 de la Ley 19/2010 enumera cónyuge, pareja estable, descendientes,
   * ascendientes y el colateral de 65 años o más que hubiera convivido, y el Grupo IV no
   * está. La tanda del 27/08 probó la denegación al Grupo IV en RÉGIMEN COMÚN («el art.
   * 20.2.c LISD no la contempla») y la del 07/09 el colateral catalán CON derecho, así que
   * el «no» catalán al Grupo IV es el hueco que quedaba: si esa rama se cayera al camino
   * estatal, el mensaje citaría la ley equivocada aunque la cifra saliera igual.
   *
   * Primo o sin parentesco (Grupo IV), 50 años, Cataluña, 300.000 €, con la casilla de
   * vivienda habitual MARCADA:
   *   REDUCCIONES_PARENTESCO_CATALUNA_IS['IV'] = 0 · reducción de vivienda DENEGADA
   *   Base liquidable = 300.000,00
   *   Cuota íntegra por TARIFA_CATALUNA_IS (tramo hasta 400.000):
   *        14.500 + (300.000 − 150.000) × 17 % = 14.500 + 25.500 = 40.000,00
   *   × COEFICIENTES_CATALUNA_IS['IV'][0] = 2,0000 → 80.000,00
   *   Cataluña no bonifica en cuota a los Grupos III y IV (art. 58 bis) → 0 %
   *   = Cuota ISD final 80.000,00 €
   *
   * Y desmarcar la casilla no puede mover ni un céntimo: si lo moviera, la reducción se
   * estaría colando por algún sitio.
   */
  test('CASO 3 (rechazo) — Cataluña deniega la vivienda al Grupo IV citando el art. 17 de la Ley 19/2010', async ({
    page,
  }) => {
    await abrir(page);

    await page.selectOption('#parentescoSel', 'sin_parentesco');
    await page.selectOption('#ccaaSel', 'cataluna');
    await mover(page, 'edadHer', 50);
    await mover(page, 'valorRef', 300000);
    await casilla(page, 'viviendaHabitual', true);
    await mover(page, 'aniosVenta', 0);

    const conCasilla = await panel(page, ISD);
    expect(conCasilla).toContain('Cataluña — Grupo IV');
    // Se deniega Y se dice por qué, con la norma catalana (no con el art. 20.2.c estatal)
    expect(conCasilla).toContain(
      'No aplicable: sin parentesco: el art. 17 de la Ley 19/2010 no la contempla'
    );
    expect(conCasilla).not.toContain('art. 20.2.c');
    // Ni el tope estatal ni el catalán aparecen: no hay reducción que topar
    expect(conCasilla).not.toContain('122.606,47 €');
    expect(REDUCCION_VIVIENDA_MAX_CATALUNA_IS).toBe(500000);

    expect(await linea(page, ISD, '− Reducción parentesco')).toBe('−0,00 €');
    expect(await linea(page, ISD, '= Base liquidable')).toBe('309.000,00 €');
    expect(await linea(page, ISD, 'Cuota íntegra (tarifa)')).toBe('41.530,00 €');
    expect(await linea(page, ISD, '× Coef. patrimonio (Grupo IV)')).toBe('×2,0000');
    expect(await linea(page, ISD, 'Cuota ISD final')).toBe('83.060,00 €');

    // Desmarcar la casilla no mueve la cuota: la reducción no estaba entrando por detrás
    await casilla(page, 'viviendaHabitual', false);
    expect(await linea(page, ISD, 'Cuota ISD final')).toBe('83.060,00 €');
    expect(await panel(page, ISD)).not.toContain('No aplicable');

    // Y el motor compartido liquida los mismos 80.000,00 €
    expect(
      calcularSucesion({
        baseImponible: 300000,
        ccaa: 'cataluna',
        grupo: 'IV',
        edadHeredero: 50,
        viviendaHabitual: 300000,
        incluyeAjuar: true,
      }).cuotaFinal
    ).toBe(83060);
  });

  /**
   * WEB ↔ MOTOR — el barrido completo, que es la comprobación por la que esta app vuelve a
   * la cola: tres veces ha tenido la MISMA herencia con dos respuestas distintas según se
   * preguntara por meskeia.com o por `calcularSucesion` (hallazgos 276, 277, 461 y 462), y
   * el 09/09/2026 el motor se reparó por dos sitios (`0a2fa220`) sin que nadie volviera a
   * cruzar los dos caminos entero.
   *
   * `app/api/chatgpt/sucesiones/route.ts` y las dos tools del MCP Delegum llaman a
   * `calcularSucesion` sin más lógica propia, así que comparar contra el motor ES comparar
   * contra esas bocas. La web mantiene su propio `calcularISD` porque encadena tres
   * impuestos y el motor solo hace el ISD, de modo que la única garantía posible es medirlo.
   *
   * 17 CCAA × los 7 parentescos del desplegable = 119 herencias de 250.000 € de vivienda
   * habitual, más las 17 del Grupo I con 8 años (que es la rama del art. 20.2.a, con
   * cuantías propias en Cataluña), más el perfil de Castilla-La Mancha con 400.000 € que
   * hasta el 09/09/2026 divergía un céntimo. Se comparan la BASE LIQUIDABLE y la CUOTA
   * FINAL: con la cuota sola, dos errores que se compensen pasarían.
   */
  test('WEB ↔ MOTOR — las 17 CCAA por los 7 parentescos dan la misma cuota por los dos caminos', async ({
    page,
  }) => {
    test.setTimeout(180_000);

    /** El desplegable de la app ↔ la clave de parentesco del motor compartido. */
    const MAPA: Array<{ ui: string; grupo: GrupoParentescoIS }> = [
      { ui: 'conyuge', grupo: 'I-conyuge' },
      { ui: 'hijo_menor21', grupo: 'I-descendiente' },
      { ui: 'hijo', grupo: 'II' },
      { ui: 'nieto', grupo: 'II-descendiente' },
      { ui: 'padre', grupo: 'II-ascendiente' },
      { ui: 'hermano', grupo: 'III' },
      { ui: 'sin_parentesco', grupo: 'IV' },
    ];
    const CCAA = Object.keys(BONIFICACIONES_CCAA_IS);
    expect(CCAA).toHaveLength(17);

    /** Base liquidable y cuota final tal como las pinta el panel del ISD. */
    const leerISD = async (): Promise<{ base: number; cuota: number }> => {
      const texto = await panel(page, ISD);
      const base = texto.match(/= Base liquidable ([\d.]*\d,\d\d) €/);
      const cuota = texto.match(/Cuota ISD final ([\d.]*\d,\d\d) €/);
      if (!base || !cuota) throw new Error(`Panel del ISD ilegible: ${texto}`);
      return { base: importe(base[1]), cuota: importe(cuota[1]) };
    };

    const divergencias: string[] = [];
    let comparadas = 0;

    await abrir(page);
    await mover(page, 'aniosVenta', 0); // aislar el ISD

    // ── Pasada 1: 250.000 € de vivienda habitual, heredero de 70 años que convivió
    for (const { ui, grupo } of MAPA) {
      await page.selectOption('#parentescoSel', ui);
      await mover(page, 'edadHer', 70);
      await mover(page, 'valorRef', 250000);
      await casilla(page, 'viviendaHabitual', true);
      await casilla(page, 'convivencia', true); // solo existe para el Grupo III

      for (const ccaa of CCAA) {
        await page.selectOption('#ccaaSel', ccaa);
        const web = await leerISD();
        const motor = calcularSucesion({
          baseImponible: 250000,
          ccaa,
          grupo,
          edadHeredero: 70,
          viviendaHabitual: 250000,
          convivenciaDosAnios: true,
          incluyeAjuar: true,
        });
        comparadas++;
        if (web.cuota !== motor.cuotaFinal || web.base !== motor.baseLiquidable) {
          divergencias.push(
            `${ccaa}/${grupo} · web ${web.base} → ${web.cuota} € · motor ${motor.baseLiquidable} → ${motor.cuotaFinal} €`
          );
        }
      }
    }

    // ── Pasada 2: el Grupo I del art. 20.2.a con 8 años (Cataluña tiene cuantías propias)
    await page.selectOption('#parentescoSel', 'hijo_menor21');
    await mover(page, 'edadHer', 8);
    await mover(page, 'valorRef', 250000);
    await casilla(page, 'viviendaHabitual', false);
    for (const ccaa of CCAA) {
      await page.selectOption('#ccaaSel', ccaa);
      const web = await leerISD();
      const motor = calcularSucesion({
        baseImponible: 250000,
        ccaa,
        grupo: 'I-descendiente',
        edadHeredero: 8,
        incluyeAjuar: true,
      });
      comparadas++;
      if (web.cuota !== motor.cuotaFinal || web.base !== motor.baseLiquidable) {
        divergencias.push(
          `${ccaa}/I-descendiente(8 años) · web ${web.base} → ${web.cuota} € · motor ${motor.baseLiquidable} → ${motor.cuotaFinal} €`
        );
      }
    }
    // El barrido tiene que haber comparado de verdad las 119 + 17 herencias: un bucle que
    // no entra deja el test verde sin haber mirado nada.
    expect(comparadas).toBe(17 * 7 + 17);

    // ── Pasada 3: el perfil que divergía un céntimo hasta el commit `0a2fa220`
    await page.selectOption('#parentescoSel', 'hijo');
    await page.selectOption('#ccaaSel', 'castilla-mancha');
    await mover(page, 'edadHer', 45);
    await mover(page, 'valorRef', 400000);
    await casilla(page, 'viviendaHabitual', true);
    const clm = await leerISD();
    const clmMotor = calcularSucesion({
      baseImponible: 400000,
      ccaa: 'castilla-mancha',
      grupo: 'II',
      edadHeredero: 45,
      viviendaHabitual: 400000,
      incluyeAjuar: true,
    });
    // 13/09/2026: 4.869,32 € y no 4.563,32 € porque desde hoy la web suma el ajuar del art. 15
    // LISD, como ya hacía el motor (hallazgo 780). Desarrollo a mano:
    //   base 400.000 + 3 % = 412.000 − 15.956,87 (parentesco II) − 122.606,47 (tope del
    //   art. 20.2.c) = 273.436,66 de base liquidable
    //   tarifa estatal: 40.011,04 + (273.436,66 − 239.389,13) × 25,50 % = 48.693,16
    //   coeficiente 1,0000 · bonificación CLM 90 % (base ≤ 300.000) = 43.823,84
    //   cuota final = 48.693,16 − 43.823,84 = 4.869,32
    expect(clm.cuota, 'Castilla-La Mancha 400.000 €: el céntimo del hallazgo 657').toBe(4869.32);
    expect(clmMotor.cuotaFinal, 'el motor ya no redondea la resta sin redondear').toBe(4869.32);

    expect(divergencias, `Divergencias web ↔ motor:\n${divergencias.join('\n')}`).toEqual([]);
  });

  /**
   * ⚠️ HALLAZGO ABIERTO (10/09/2026) — el `faqJsonLd` promete una diferencia entre Madrid y
   * Cataluña que el motor de la propia página no alcanza NI EN SU CASO MÁS EXTREMO.
   *
   * La quinta pregunta —«¿Qué diferencia hay entre heredar en Madrid y en Cataluña?»— dice:
   * «Para una vivienda de 300.000 € heredada por un hijo, la diferencia de ISD entre ambas
   * comunidades puede superar los 20.000 €».
   *
   * Con ese enunciado exacto solo hay dos escenarios en la app, y los dos se quedan lejos:
   *   · sin vivienda habitual → Madrid 513,98 € · Cataluña 10.350,00 € →  9.836,02 €
   *   · con vivienda habitual → Madrid 234,46 € · Cataluña      0,00 € →     234,46 €
   *
   * El máximo alcanzable es 9.836,02 €, menos de la MITAD de lo prometido. Y el segundo
   * escenario invierte el signo: con vivienda habitual del causante, Cataluña sale más
   * barata que Madrid, porque su reducción del art. 17 de la Ley 19/2010 (95 % con tope de
   * 500.000 €) se come la base entera mientras la estatal se topa en 122.606,47 €.
   *
   * Es la forma exacta del hallazgo 275 —la prosa contando una versión que el motor de la
   * misma página no calcula— pero en el canal que leen Bing Copilot, ChatGPT, Perplexity y
   * Gemini, donde la cifra viaja sin el disclaimer al lado y sin la app debajo para
   * contrastarla. Y es la pregunta que responde «¿me conviene una comunidad u otra?».
   *
   * REPARADO el 10/09/2026: la respuesta ya no lleva la cifra tecleada, la DERIVA llamando a
   * `calcularSucesion` con ese mismo supuesto, y nombra además el caso que invertía el signo.
   * Este test pasa a ser la regresión de esa derivación: no comprueba un número concreto,
   * sino que el número publicado es EL QUE LA APP CALCULA, que es lo que impide que vuelvan
   * a separarse.
   */
  test('HALLAZGO 10/09/2026 — el faqJsonLd promete 20.000 € de diferencia Madrid/Cataluña', async ({
    page,
  }) => {
    await abrir(page);

    const respuesta =
      (await faqServida(page)).find(q => q.name.includes('Madrid y en Cataluña'))?.acceptedAnswer
        .text ?? '';
    expect(respuesta, 'la promesa que el motor no alcanzaba').not.toContain('20.000 €');

    // La misma herencia, por el motor de la propia página, en los dos escenarios posibles
    await page.selectOption('#parentescoSel', 'hijo');
    await mover(page, 'edadHer', 45);
    await mover(page, 'valorRef', 300000);
    await mover(page, 'aniosVenta', 0);

    const cuotas: Record<string, Record<string, number>> = {};
    for (const vivienda of [false, true]) {
      await casilla(page, 'viviendaHabitual', vivienda);
      cuotas[String(vivienda)] = {};
      for (const ccaa of ['madrid', 'cataluna']) {
        await page.selectOption('#ccaaSel', ccaa);
        cuotas[String(vivienda)][ccaa] = importe(await linea(page, ISD, 'Cuota ISD final'));
      }
    }

    // Lo que de verdad calcula la app (los dos escenarios, resueltos a mano más arriba)
    // 13/09/2026: con el ajuar del art. 15 en la base (hallazgo 780), 300.000 € pasan a
    // 309.000 € y las dos cuotas suben; la diferencia que publica el faqJsonLd la deriva
    // el propio metadata.ts del motor, con el mismo ajuar, así que sigue cuadrando.
    expect(cuotas.false).toEqual({ madrid: 536.93, cataluna: 11109.95 });
    expect(cuotas.true).toEqual({ madrid: 253.59, cataluna: 0 });

    const maxDiferencia = Math.max(
      Math.abs(cuotas.false.cataluna - cuotas.false.madrid),
      Math.abs(cuotas.true.cataluna - cuotas.true.madrid)
    );
    expect(maxDiferencia).toBeCloseTo(10573.02, 2);

    // Y lo que el faqJsonLd publica a los asistentes de IA es ESA cifra, redondeada al euro:
    // la del escenario sin vivienda habitual, que es el que la propia frase enuncia.
    const diferenciaSinVivienda = cuotas.false.cataluna - cuotas.false.madrid;
    expect(respuesta).toContain(`${Math.round(diferenciaSinVivienda).toLocaleString('es-ES')} €`);

    // Y no se calla el escenario que invierte el signo, que es lo que convertía la respuesta
    // en un mal consejo justo en la pregunta «¿me conviene una comunidad u otra?».
    expect(respuesta, 'el caso de la vivienda habitual, donde Cataluña sale más barata')
      .toMatch(/vivienda habitual/i);
    expect(cuotas.true.cataluna).toBeLessThan(cuotas.true.madrid);
  });

  /**
   * ⚠️ HALLAZGO ABIERTO (10/09/2026) — el `faqJsonLd` sigue describiendo Cataluña con la
   * imagen ANTERIOR a la reparación del 08/09/2026 (`f6c0650a`).
   *
   * La misma respuesta dice: «Cataluña tiene reducciones más limitadas». `data/fiscal` dice
   * lo contrario desde que se verificó la Ley 19/2010 contra la Agència Tributària:
   *
   *   reducción por parentesco al hijo    Cataluña 100.000,00 €  ·  estatal  15.956,87 €
   *   tope de la reducción por vivienda   Cataluña 500.000,00 €  ·  estatal 122.606,47 €
   *
   * Las reducciones catalanas son SEIS y CUATRO veces mayores; lo que Cataluña tiene más
   * limitado es la BONIFICACIÓN EN CUOTA (una escala ponderada que da el 55 % a una base de
   * 300.000 €, frente al 99 % fijo de Madrid), que es cosa distinta. El texto residual es
   * justo el que la reparación del 08/09 tuvo que corregir en el motor y en `data/fiscal`,
   * y que en el canal de las IAs se quedó sin tocar.
   *
   * Que la frase no es un matiz lo demuestra el escenario con vivienda habitual del caso
   * anterior: allí Cataluña cobra 0,00 € y Madrid 234,46 €, exactamente por la reducción que
   * esta respuesta llama «más limitada».
   */
  test('HALLAZGO 10/09/2026 — el faqJsonLd llama «más limitadas» a las reducciones catalanas', async ({
    page,
  }) => {
    // Lo que dice data/fiscal, verificado el 08/09/2026 contra la Agència Tributària
    expect(REDUCCIONES_PARENTESCO_CATALUNA_IS['II']).toBe(100000);
    expect(REDUCCIONES_PARENTESCO_IS['II']).toBe(15956.87);
    expect(REDUCCION_VIVIENDA_MAX_CATALUNA_IS).toBeGreaterThan(REDUCCION_VIVIENDA_MAX_IS);

    await abrir(page);
    const respuesta =
      (await faqServida(page)).find(q => q.name.includes('Madrid y en Cataluña'))?.acceptedAnswer
        .text ?? '';

    expect(
      respuesta,
      'el faqJsonLd llama «más limitadas» a unas reducciones 6 veces mayores que las estatales'
    ).not.toContain('reducciones más limitadas');
  });

  /**
   * ⚠️ HALLAZGO ABIERTO (10/09/2026) — el segundo sello `<DataReference>` enseña para el
   * IIVTNU una verificación 17 meses más NUEVA que la que declara su propio dato.
   *
   * El sello rotula «Plusvalía municipal (IIVTNU) e IRPF de la venta» y muestra una sola
   * fecha: `FISCAL_INMUEBLES_META.verificado` = 17/06/2026. Pero el tipo municipal y los
   * `COEFICIENTES_IIVTNU_2025` que la app usa vienen de `PLUSVALIA_MUNICIPAL_META`, que
   * lleva su propio sello dentro del MISMO fichero: `verificado: '2025-01-15'`, `vigencia:
   * '2025'` — igual que `FISCAL_SUCESIONES_CATALUNA_META` lleva el suyo aparte del módulo
   * de sucesiones, y por la misma razón: «un sello que dijera 2026-09-08 para todo el
   * módulo afirmaría un trabajo que no se ha hecho».
   *
   * Es el hallazgo 610 dado la vuelta. Entonces el sello único enseñaba una fecha año y
   * medio ANTERIOR a la del módulo que aportaba dos de los tres impuestos; la reparación
   * partió el sello en dos, y el segundo juntó dos datos con 17 meses de diferencia y se
   * quedó con el más nuevo. La nota que lleva debajo («Los coeficientes se actualizan
   * anualmente por Ley de Presupuestos. Verificar para el ejercicio en curso») es
   * precisamente la que pide mirar la fecha — y la fecha que hay al lado no es la suya.
   *
   * El test que cerraba el 610 fijaba `toContain('17/06/2026')`, es decir, fijaba como
   * contrato correcto lo que aquí se reporta como defecto: por eso estaba invisible. Esa
   * línea se retiró de aquel test el 10/09/2026, con su explicación.
   *
   * ⚠️ 24/09/2026 (hallazgo 1559): `PLUSVALIA_MUNICIPAL_META` se reselló al sustituir la tabla
   * de coeficientes del RDL 26/2021 —caducada desde el 01/01/2023, y era la que ese sello de
   * «2025-01-15» avalaba— por la vigente del art. 107.4 (RDL 8/2023), verificada ese día en
   * el BOE. Los dos sellos del fichero siguen siendo DISTINTOS, ahora con el del IIVTNU
   * como el más nuevo, así que la propiedad que este test protege no cambia: el sello del
   * IIVTNU enseña la fecha de SU dato (24/09/2026) y no la del módulo (17/06/2026).
   */
  test('HALLAZGO 10/09/2026 — el sello del IIVTNU enseña la fecha del módulo, no la del dato', async ({
    page,
  }) => {
    // Los dos sellos del fichero de inmuebles, distintos (resellado del IIVTNU: hallazgo 1559)
    expect(FISCAL_INMUEBLES_META.verificado).toBe('2026-06-17');
    expect(PLUSVALIA_MUNICIPAL_META.verificado).toBe('2026-09-24');
    expect(PLUSVALIA_MUNICIPAL_META.vigencia).toBe('2026');

    await abrir(page);
    const sellos = await page.locator('[aria-label="Datos de referencia normativos"]').allInnerTexts();
    const sello = sellos.map(s => s.replace(/\s+/g, ' ')).find(s => s.includes('IIVTNU')) ?? '';

    expect(sello).toContain('Plusvalía municipal (IIVTNU)');
    expect(
      sello,
      `el sello del IIVTNU dice «${sello.match(/Última verificación: ([\d/]+)/)?.[1]}» y su dato declara 24/09/2026`
    ).toContain('24/09/2026');
    // Y no la fecha del módulo entero, que es la que el hallazgo denunciaba
    expect(sello).not.toContain('17/06/2026');
  });

  /**
   * ⚠️ HALLAZGO ABIERTO (10/09/2026) — el plazo de mantenimiento de la vivienda va escrito a
   * mano como «10 años», y en Cataluña —que esta app modela desde el 08/09/2026— son CINCO.
   *
   * Dos sitios lo dicen, y el segundo sin matiz ninguno:
   *   · FAQ «¿Cómo afecta que fuera la vivienda habitual del fallecido?»: «Requisito:
   *     mantener la vivienda al menos 10 años (en algunas CCAA es menor)».
   *   · «Errores frecuentes a evitar»: «Vender antes de los 10 años cuando se aplicó la
   *     reducción de vivienda habitual: pierdes la reducción retroactivamente».
   *
   * `data/fiscal` exporta la cifra catalana desde la verificación del 08/09/2026:
   * `REDUCCION_VIVIENDA_ANIOS_MANTENIMIENTO_CATALUNA_IS` = 5 (art. 19 de la Ley 19/2010), y
   * la app YA aplica el otro dato de ese mismo artículo —el tope de 500.000 €— cuando el
   * usuario elige Cataluña. O sea: la mitad de la reparación llegó al motor y la otra mitad
   * no llegó al texto, que es la forma clásica del residuo.
   *
   * Es el patrón de los hallazgos 463, 609 y 658: el dato escrito a mano se queda quieto
   * mientras `data/fiscal` avanza. Aquí, además, el número apunta contra el usuario catalán,
   * que creerá que no puede vender hasta el décimo año.
   */
  test('HALLAZGO 10/09/2026 — los 10 años de mantenimiento no conocen los 5 de Cataluña', async ({
    page,
  }) => {
    expect(REDUCCION_VIVIENDA_ANIOS_MANTENIMIENTO_CATALUNA_IS).toBe(5);

    await abrir(page);

    // La app SÍ aplica el otro dato del mismo art. 19: el tope catalán de 500.000 €
    await page.selectOption('#parentescoSel', 'hijo');
    await page.selectOption('#ccaaSel', 'cataluna');
    await mover(page, 'edadHer', 45);
    await mover(page, 'valorRef', 350000);
    await casilla(page, 'viviendaHabitual', true);
    expect(await linea(page, ISD, '− Reducción vivienda habitual (95%)')).toBe('−332.500,00 €');

    const parrafos = await page.evaluate(() =>
      [...document.querySelectorAll('p, li')]
        .map(e => (e.textContent ?? '').replace(/\s+/g, ' ').trim())
        .filter(t => t.includes('10 años'))
    );
    expect(parrafos.length).toBeGreaterThan(0);

    // ⚠️ Con `toContain('5 años')` este test pasaba en falso: la misma FAQ dice «colateral
    // mayor de 65 años», y «5 años» es subcadena de «65 años». Hace falta el plazo SOLO,
    // sin dígito delante.
    expect(
      parrafos.join(' '),
      'el texto habla solo de 10 años y en Cataluña el art. 19 de la Ley 19/2010 pide 5'
    ).toMatch(/(^|[^\d])5 años/);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// RE-INSPECCIÓN 12/09/2026 — la app vuelve a la cola porque sus dependencias se
// movieron otra vez: `ff10c2f5` reparó los siete hallazgos del 10/09 y `e947fa55`
// devolvió `TARIFA_ESTATAL_IS` a la escala del art. 21.2 LISD (16 tramos, hasta el
// 34 %) después de que hubiera vivido meses con SIETE tramos y un techo del 25,50 %.
// Los tres casos nuevos se resolvieron A MANO —cifras ancladas a `data/fiscal`—
// ANTES de abrir el navegador, y uno de ellos entra a propósito en los dos tramos
// altos de esa escala, que son los que la versión inventada infravaloraba.
// ═════════════════════════════════════════════════════════════════════════════

test.describe('Simulador de heredar vivienda — re-inspección 12/09/2026', () => {
  /**
   * CASO 1 (NORMAL) — el tramo del 29,75 % del art. 21.2 LISD, el que ninguna tanda
   * anterior había pisado: las de arriba llegan al 25,50 % (292.006,54 € de base) o saltan
   * al 34 % (2.000.000 €), y entre 398.777,54 € y 797.555,08 € no había ningún caso. Es
   * justo donde la escala de SIETE tramos que vivió en `data/fiscal` hasta el 11/09/2026
   * (hallazgo 735) se separaba más de la ley sin dejar de parecer coherente.
   *
   * Hermano de 50 años, Madrid, 600.000 € de valor de referencia que NO era vivienda
   * habitual, comprada hace 12 años por 200.000 €, catastral de suelo 100.000 € sobre un
   * catastral total de 200.000 €, y venta a los 3 años por 750.000 €.
   *
   * Se elige Madrid porque es la única comunidad, junto a Murcia, que bonifica al Grupo III
   * con un porcentaje FIJO intermedio (`…['madrid']…['III'].porcentaje` = 0,50): con el 0 %
   * de Extremadura la bonificación no se probaría y con el 99,9 % de Canarias la cuota
   * quedaría aplanada hasta hacer invisible cualquier error de la tarifa.
   *
   * ISD (`data/fiscal/sucesiones.ts`):
   *   ⚠️ Rehecha el 15/09/2026 (hallazgo 867): faltaba el ajuar del art. 15 LISD.
   *   Base imponible = 600.000 × 1,03                             618.000,00
   *   − REDUCCIONES_PARENTESCO_IS['III']                           −7.993,46
   *   = Base liquidable                                           610.006,54
   *   Cuota íntegra por la COLUMNA `cuota` de TARIFA_ESTATAL_IS (tramo hasta 797.555,08,
   *   cuota acumulada 80.655,08 y tipo 29,75 % sobre el exceso de 398.777,54):
   *        80.655,08 + (610.006,54 − 398.777,54) × 29,75 %
   *      = 80.655,08 + 211.229,00 × 0,2975
   *      = 80.655,08 + 62.840,6275 = 143.495,7075              → «143.495,71 €»
   *   × COEFICIENTES_IS['III'][0] = 1,5882 → 227.899,886...   → «227.899,89 €»
   *   − 50 % = 113.949,945                                      → «−113.949,94 €»
   *   = Cuota ISD final 227.899,89 − 113.949,94 = 113.949,95... → «113.949,94 €»
   *
   * Plusvalía municipal (`data/fiscal/inmuebles.ts`, tipo ORIENTATIVO del 25 %) —
   * RECALCULADA el 24/09/2026 con la tabla vigente del art. 107.4 (hallazgo 1559; antes
   * 0,08 y 0,16, de la tabla caducada del RDL 26/2021):
   *   12 años → coeficiente 0,09
   *   Objetivo = 100.000 × 0,09 × 0,25 = 2.250,00
   *   Real     = (600.000 − 200.000) × (100.000 / 200.000) × 0,25 = 200.000 × 0,25 = 50.000,00
   *   Se elige el MENOR → 2.250,00, objetivo
   *   Venta a los 3 años → coeficiente 0,14: 100.000 × 0,14 × 0,25 = 3.500,00
   *     (real = (750.000 − 600.000) × 0,5 × 0,25 = 18.750,00)
   *
   * IRPF al vender a los 3 años por 750.000 € (TRAMOS_GANANCIAS_PATRIMONIALES_2025):
   *   Valor de adquisición fiscal = 600.000 + 113.949,94 + 2.250,00 = 716.199,94
   *   Valor de transmisión = 750.000 − 3.500 (IIVTNU de la venta) = 746.500,00
   *   Ganancia = 746.500 − 716.199,94 = 30.300,06
   *        6.000,00 × 19 % = 1.140,00
   *       24.300,06 × 21 % = 5.103,0126
   *                          ─────────
   *                           6.243,0126                        → «6243,01 €»
   *
   * TOTAL = 113.949,94 (ISD) + 2.250,00 (IIVTNU herencia) + 3.500,00 (IIVTNU venta)
   *       + 6.243,0126 (IRPF) = 125.942,9526                    → «125.942,95 €»
   *       = 16,7924 % de la venta                                → «16,79 %»
   * (aquí NO hay ISD regularizado: el Grupo III de Madrid no llega a tener reducción por
   *  vivienda habitual que perder)
   */
  test('CASO 1 (normal) — el tramo del 29,75 % del art. 21: hermano con 600.000 € en Madrid paga 109.697,54 €', async ({
    page,
  }) => {
    await abrir(page);

    await page.selectOption('#parentescoSel', 'hermano');
    await page.selectOption('#ccaaSel', 'madrid');
    await mover(page, 'edadHer', 50);
    await mover(page, 'anioAdq', ANIO - 12);
    await mover(page, 'valorAdq', 200000);
    await mover(page, 'valorRef', 600000);
    await mover(page, 'valorSuelo', 100000);
    await mover(page, 'valorCatastralTotal', 200000);
    await casilla(page, 'viviendaHabitual', false);
    await mover(page, 'aniosVenta', 3);
    await mover(page, 'valorVta', 750000);

    expect(await panel(page, ISD)).toContain('Comunidad de Madrid — Grupo III');
    expect(await linea(page, ISD, '− Reducción parentesco')).toBe('−7993,46 €');
    expect(await linea(page, ISD, '= Base liquidable')).toBe('610.006,54 €');
    expect(await linea(page, ISD, 'Cuota íntegra (tarifa)')).toBe('143.495,71 €');
    expect(await linea(page, ISD, '× Coef. patrimonio (Grupo III)')).toBe('×1,5882');
    expect(await linea(page, ISD, '= Cuota tributaria')).toBe('227.899,89 €');
    expect(await panel(page, ISD)).toContain('Bonificación CCAA (50,0%)');
    expect(await linea(page, ISD, 'Cuota ISD final')).toBe('113.949,94 €');

    // Art. 107.4 vigente: 12 años → 0,09 · 100.000 × 0,09 × 25 % (hallazgo 1559)
    expect(await linea(page, IIVTNU, 'Coeficiente 12 años')).toBe('0,09');
    expect(await linea(page, IIVTNU, 'Método objetivo')).toBe('2250,00 €');
    expect(await linea(page, IIVTNU, 'Método real (suelo)')).toBe('50.000,00 €');
    expect(await linea(page, IIVTNU, 'Cuota plusvalía municipal')).toBe('2250,00 €');

    // 600.000 + 113.949,94 + 2.250 · (750.000 − 3.500) − 716.199,94 · 1.140 + 24.300,06 × 21 %
    expect(await linea(page, IRPF, 'Valor adquisición fiscal*')).toBe('716.199,94 €');
    expect(await linea(page, IRPF, 'Ganancia patrimonial')).toBe('30.300,06 €');
    expect(await linea(page, IRPF, 'Cuota IRPF venta')).toBe('6243,01 €');

    const total = await bloqueTotal(page);
    // 113.949,94 + 2.250,00 + 3.500,00 + 6.243,0126 (hallazgo 1559)
    expect(total).toContain('125.942,95 €');
    expect(total).toContain('16,79%');

    // El motor compartido (MCP Delegum y /api/chatgpt/sucesiones) liquida lo mismo
    const motor = calcularSucesion({
      baseImponible: 600000,
      ccaa: 'madrid',
      grupo: 'III',
      edadHeredero: 50,
      incluyeAjuar: true,
    });
    expect(motor.baseLiquidable).toBe(610006.54);
    expect(motor.cuotaIntegra).toBe(143495.71);
    expect(motor.cuotaFinal).toBe(113949.94);
    // Y lo hace por la escala de 16 tramos. Con la de SIETE del hallazgo 735 —que en este
    // intervalo aplicaba 47.798,51 € de cuota acumulada y un 21,25 % marginal— esta misma
    // base liquidable salía por 88.859,67 € de cuota íntegra, 49.281,04 € por debajo, y la
    // cuota final habría sido de unos 70.563 € en vez de 109.697,54 €.
    expect(motor.tarifaAplicada).toContain('art. 21.2 LISD');
  });

  /**
   * CASO 2 (LÍMITE) — el TOPE de la reducción del Grupo I catalán, en el escalón exacto en
   * el que empieza a morder.
   *
   * Art. 2 de la Ley 19/2010: el descendiente menor de 21 años parte de 100.000 €
   * (`REDUCCIONES_PARENTESCO_CATALUNA_IS['I-descendiente']`) y suma 12.000 € por cada año de
   * menos de 21 (`REDUCCION_EDAD_MENOR_21_CATALUNA_IS`), sin que el total pase de 196.000 €
   * (`REDUCCION_EDAD_MENOR_21_MAX_CATALUNA_IS`). El tope se alcanza por primera vez a los 13
   * años —100.000 + 8 × 12.000 = 196.000 exactos— y a los 12 ya recorta: 100.000 + 9 × 12.000
   * = 208.000 se quedan en 196.000. La frontera está por tanto entre los 14 y los 13 años, y
   * a partir de los 13 la edad deja de mover la cuota.
   *
   * La pasada 2 del barrido WEB ↔ MOTOR del 10/09 usa 8 años, donde el tope ya está aplicado
   * desde hace cinco escalones: prueba el tope, no su frontera. Y el CASO 2 del 07/09 mide la
   * frontera del tope ESTATAL (47.858,59 €, a los 13/14 años también, pero con 3.990,72 € por
   * año): mismos escalones, otro régimen y otras cuantías, que es justo lo que se confunde.
   *
   * 600.000 € de valor de referencia, NO vivienda habitual (para que la única reducción sea
   * la del art. 2 y el efecto del tope llegue entero a la cuota), sin venta.
   *
   * Tarifa propia de Cataluña, TARIFA_CATALUNA_IS (tramo hasta 800.000: cuota acumulada
   * 57.000 y 24 % sobre el exceso de 400.000) y COEFICIENTES_CATALUNA_IS['I'][0] = 1,0000.
   * Bonificación del art. 58 bis por la escala del GRUPO I —no la del II—, ponderada sobre la
   * base IMPONIBLE, que desde el 13/09/2026 lleva dentro el ajuar del art. 15 LISD: 600.000 ×
   * 1,03 = 618.000 € (hallazgo 780). La ponderación cambia con ella, y por eso baja del
   * 91,8333 % al 91,4887 %: el tramo que más crece es el del 80 %, el peor.
   *     100.000 × 99 % + 100.000 × 97 % + 100.000 × 95 % + 200.000 × 90 % + 118.000 × 80 %
   *   = 99.000 + 97.000 + 95.000 + 180.000 + 94.400 = 565.400 → 565.400 / 618.000 = 91,4887 %
   *
   *   14 años → reducción 100.000 + 7 × 12.000 = 184.000,00 (por debajo del tope)
   *             Base liquidable 600.000 − 184.000 = 416.000,00
   *             Cuota íntegra 57.000 + 16.000 × 24 % = 60.840,00
   *             × 1,0000 = 60.840,00 · − 91,8333 % = 55.871,40 → 4.968,60
   *   13 años → reducción mín(100.000 + 8 × 12.000; 196.000) = 196.000,00 (tope justo)
   *             Base liquidable 404.000,00 · Cuota íntegra 57.000 + 4.000 × 24 % = 57.960,00
   *             × 1,0000 = 57.960,00 · − 91,8333 % = 53.226,60 → 4.733,40
   *   12 años → reducción mín(208.000; 196.000) = 196.000,00 → cuota IDÉNTICA a la de 13
   */
  test('CASO 2 (límite) — Cataluña, Grupo I: el tope de 196.000 € muerde a los 13 años, no a los 14', async ({
    page,
  }) => {
    expect(REDUCCION_EDAD_MENOR_21_CATALUNA_IS).toBe(12000);
    expect(REDUCCION_EDAD_MENOR_21_MAX_CATALUNA_IS).toBe(196000);
    expect(REDUCCIONES_PARENTESCO_CATALUNA_IS['I-descendiente']).toBe(100000);

    await abrir(page);

    await page.selectOption('#parentescoSel', 'hijo_menor21');
    await page.selectOption('#ccaaSel', 'cataluna');
    await mover(page, 'anioAdq', ANIO - 12);
    await mover(page, 'valorAdq', 200000);
    await mover(page, 'valorRef', 600000);
    await mover(page, 'valorSuelo', 100000);
    await mover(page, 'valorCatastralTotal', 200000);
    await casilla(page, 'viviendaHabitual', false);
    await mover(page, 'aniosVenta', 0);

    // ── 14 años: la escala del art. 2 todavía cabe entera
    await mover(page, 'edadHer', 14);
    expect(await panel(page, ISD)).toContain('Cataluña — Grupo I');
    expect(await linea(page, ISD, '− Reducción parentesco')).toBe('−184.000,00 €');
    expect(await linea(page, ISD, '= Base liquidable')).toBe('434.000,00 €');
    expect(await linea(page, ISD, 'Cuota íntegra (tarifa)')).toBe('65.160,00 €');
    expect(await linea(page, ISD, '× Coef. patrimonio (Grupo I)')).toBe('×1,0000');
    expect(await panel(page, ISD)).toContain('Bonificación CCAA (91,5%)');
    expect(await linea(page, ISD, '− Bonificación CCAA (91,5%)')).toBe('−59.614,02 €');
    expect(await linea(page, ISD, 'Cuota ISD final')).toBe('5545,98 €');

    // ── 13 años: el tope se alcanza justo, sin recortar todavía nada
    await mover(page, 'edadHer', 13);
    expect(await linea(page, ISD, '− Reducción parentesco')).toBe('−196.000,00 €');
    expect(await linea(page, ISD, '= Base liquidable')).toBe('422.000,00 €');
    expect(await linea(page, ISD, 'Cuota íntegra (tarifa)')).toBe('62.280,00 €');
    expect(await linea(page, ISD, '− Bonificación CCAA (91,5%)')).toBe('−56.979,15 €');
    expect(await linea(page, ISD, 'Cuota ISD final')).toBe('5300,85 €');

    // ── 12 años: el tope RECORTA, así que la cuota ya no se mueve
    await mover(page, 'edadHer', 12);
    expect(await linea(page, ISD, '− Reducción parentesco')).toBe('−196.000,00 €');
    expect(await linea(page, ISD, 'Cuota ISD final')).toBe('5300,85 €');

    // Los tres, por el motor compartido
    for (const [edad, cuota] of [[14, 5545.98], [13, 5300.85], [12, 5300.85]] as const) {
      expect(
        calcularSucesion({
          baseImponible: 600000,
          ccaa: 'cataluna',
          grupo: 'I-descendiente',
          edadHeredero: edad,
          incluyeAjuar: true,
        }).cuotaFinal,
        `el motor con ${edad} años`
      ).toBe(cuota);
    }
  });

  /**
   * CASO 3 (RECHAZO) — el Grupo IV en la comunidad MÁS generosa del régimen común, con la
   * casilla de vivienda habitual marcada: se le deniegan las tres cosas a la vez y la cuota
   * entra en el tramo del 34 %.
   *
   * Canarias bonifica al 99,9 % a los Grupos I, II y III —es la única que alcanza al
   * colateral— y al Grupo IV le da 0 (`…['canarias']…['IV'].porcentaje` = 0). Probar el
   * rechazo aquí es lo que demuestra que la denegación no depende de haber elegido una
   * comunidad cara: no hay ninguna que rescate al Grupo IV.
   *
   * Las tres denegaciones:
   *   · `REDUCCIONES_PARENTESCO_IS['IV']` = 0 → no hay reducción de parentesco.
   *   · `evaluarReduccionVivienda` devuelve 0 con motivo escrito: el art. 20.2.c LISD
   *     enumera cónyuge, descendientes, ascendientes y el colateral de 65 años o más que
   *     conviviera, y el Grupo IV no está. La app tiene que DECIRLO, no dejar un cero sin
   *     explicación (la línea «No aplicable: …»), y la cuota no se puede mover por marcar
   *     la casilla.
   *   · Bonificación en cuota: 0 %.
   *
   * 1.500.000 € de valor de referencia, comprada hace 20 años por 500.000 €, catastral de
   * suelo 300.000 € sobre un total de 600.000 €, sin venta.
   *
   *   Base liquidable = 1.500.000,00 (ninguna reducción)
   *   Cuota íntegra, último tramo de TARIFA_ESTATAL_IS (cuota acumulada 199.291,40 y 34 %
   *   sobre el exceso de 797.555,08):
   *        199.291,40 + (1.500.000 − 797.555,08) × 34 %
   *      = 199.291,40 + 702.444,92 × 0,34 = 199.291,40 + 238.831,2728 = 438.122,6728
   *                                                                 → «438.122,67 €»
   *   × COEFICIENTES_IS['IV'][0] = 2,0000 = 876.245,34              → «876.245,34 €»
   *   − 0 % = 0,00 → Cuota ISD final 876.245,34                     → «876.245,34 €»
   *
   *   Plusvalía: 20 años → 0,40 del art. 107.4 vigente (era 0,45 con la tabla caducada del
   *   RDL 26/2021; recalculado el 24/09/2026, hallazgo 1559)
   *   Objetivo = 300.000 × 0,40 × 0,25 = 30.000,00
   *   Real     = (1.500.000 − 500.000) × (300.000 / 600.000) × 0,25 = 125.000,00
   *   → objetivo, 30.000,00 · TOTAL = 906.845,34 (la cuota que se imprime, con el ajuar del
   *   art. 15 en la base) + 30.000,00 = 936.845,34
   */
  test('CASO 3 (rechazo) — Grupo IV en Canarias: se deniega la vivienda, no hay bonificación y manda el 34 %', async ({
    page,
  }) => {
    expect(REDUCCIONES_PARENTESCO_IS['IV']).toBe(0);
    expect(BONIFICACIONES_CCAA_IS['canarias'].bonificaciones['III'].porcentaje).toBe(0.999);
    expect(BONIFICACIONES_CCAA_IS['canarias'].bonificaciones['IV'].porcentaje).toBe(0);

    await abrir(page);

    await page.selectOption('#parentescoSel', 'sin_parentesco');
    await page.selectOption('#ccaaSel', 'canarias');
    await mover(page, 'edadHer', 50);
    await mover(page, 'anioAdq', ANIO - 20);
    await mover(page, 'valorAdq', 500000);
    await mover(page, 'valorRef', 1500000);
    await mover(page, 'valorSuelo', 300000);
    await mover(page, 'valorCatastralTotal', 600000);
    await mover(page, 'aniosVenta', 0);

    // Sin marcar la casilla: la cuota de referencia
    await casilla(page, 'viviendaHabitual', false);
    const sinMarcar = await linea(page, ISD, 'Cuota ISD final');

    // Marcándola: se deniega, se dice, y la cuota NO se mueve
    await casilla(page, 'viviendaHabitual', true);
    const textoISD = await panel(page, ISD);
    expect(textoISD).toContain('Canarias — Grupo IV');
    expect(textoISD).toContain(
      'No aplicable: sin parentesco: el art. 20.2.c LISD no la contempla'
    );
    expect(textoISD).not.toContain('− Reducción vivienda habitual (95%)');
    expect(await linea(page, ISD, '− Reducción parentesco')).toBe('−0,00 €');
    expect(await linea(page, ISD, '= Base liquidable')).toBe('1.545.000,00 €');
    expect(await linea(page, ISD, 'Cuota íntegra (tarifa)')).toBe('453.422,67 €');
    expect(await linea(page, ISD, '× Coef. patrimonio (Grupo IV)')).toBe('×2,0000');
    expect(await linea(page, ISD, '= Cuota tributaria')).toBe('906.845,34 €');
    expect(textoISD).toContain('Bonificación CCAA (0,0%)');
    expect(await linea(page, ISD, 'Cuota ISD final')).toBe('906.845,34 €');
    expect(await linea(page, ISD, 'Cuota ISD final')).toBe(sinMarcar);

    // 0,40 y 300.000 × 0,40 × 25 % · 906.845,34 + 30.000,00 (hallazgo 1559)
    expect(await linea(page, IIVTNU, 'Coeficiente 20 años')).toBe('0,40');
    expect(await linea(page, IIVTNU, 'Cuota plusvalía municipal')).toBe('30.000,00 €');
    expect(await bloqueTotal(page)).toContain('936.845,34 €');

    // El motor compartido deniega igual y da la misma cuota
    const motor = calcularSucesion({
      baseImponible: 1500000,
      ccaa: 'canarias',
      grupo: 'IV',
      edadHeredero: 50,
      viviendaHabitual: 1500000,
      incluyeAjuar: true,
    });
    expect(motor.reduccionVivienda).toBe(0);
    expect(motor.reduccionViviendaNoAplicada).toBe(
      'sin parentesco: el art. 20.2.c LISD no la contempla'
    );
    expect(motor.cuotaFinal).toBe(906845.34);
  });

  /**
   * ─────────────────────────────────────────────────────────────────────────
   * GUARDAS de la REPARACIÓN del 13/09/2026 — los siete hallazgos de la tanda
   * del 12/09 (778 a 784). Llegaron aquí como `test.fail()` y hoy son candados:
   * lo que afirman es lo que la app tiene que seguir haciendo.
   *
   * Estado de fábrica, que es el caso de la mayoría: hijo de 45 años, Madrid,
   * 200.000 € de valor de referencia de vivienda habitual comprada en 1995 por
   * 80.000 €, suelo catastral 60.000 € sobre un total de 120.000 €, venta a los
   * 5 años por 250.000 €. Desarrollado a mano:
   *
   *   Base imponible  = 200.000 + 3 % de ajuar (art. 15 LISD) = 206.000,00
   *   Base liquidable = 206.000 − 15.956,87 − 122.606,47      =  67.436,66
   *   Cuota íntegra   = 6.789,79 + (67.436,66 − 63.905,62) × 14,45 % = 7.300,02
   *   × 1,0000 · − 99 % (Madrid) = 7.227,02 → cuota ISD          =      73,00
   *
   *   Sin la reducción de vivienda (que la venta a los 5 años hace perder):
   *   base liquidable 190.043,13 → 23.063,25 + 30.408,30 × 21,25 % = 29.525,01
   *   − 99 % = 29.229,76 → 295,25 · regularización 295,25 − 73,00  =     222,25
   *
   *   ⚠️ De aquí abajo, RECALCULADO el 24/09/2026 con la tabla vigente del art. 107.4
   *   TRLRHL (hallazgo 1559; antes 0,45 y 0,17, de la tabla caducada del RDL 26/2021):
   *   IIVTNU de la herencia: 31 años, topados en 20 → coef. 0,40
   *     objetivo 60.000 × 0,40 × 0,25 = 6.000,00 (menor que el real, 15.000,00)
   *   IIVTNU de la VENTA: 5 años → coef. 0,18
   *     objetivo 60.000 × 0,18 × 0,25 = 2.700,00 (menor que el real, 6.250,00)
   *
   *   IRPF: adquisición fiscal 200.000 + 73,00 + 222,25 (ISD regularizado, hallazgo 859)
   *         + 6.000,00 = 206.295,25
   *         transmisión 250.000 − 2.700,00 = 247.300,00 (art. 35.2 LIRPF)
   *         ganancia 41.004,75 → 6.000 × 19 % + 35.004,75 × 21 % = 8.490,9975
   *
   *   TOTAL = 73,00 + 222,25 + 6.000,00 + 2.700,00 + 8.490,9975 = 17.486,2475 → 17.486,25
   * ─────────────────────────────────────────────────────────────────────────
   */

  /**
   * [778] ALTO — la reducción del art. 20.2.c LISD ya no sobrevive a una venta que la propia
   * simulación coloca dentro del plazo de mantenimiento.
   *
   * No se recalcula el ISD hacia atrás —lo que se liquidó al heredar se liquidó con la
   * reducción—, sino que se publica la REGULARIZACIÓN: lo que hay que ingresar en la
   * complementaria, en su línea propia del total y con el aviso pegado a la cifra del ISD,
   * no dentro del bloque educativo colapsado.
   */
  test('[778] vender dentro del plazo de mantenimiento cuesta la reducción, y se dice junto a la cifra', async ({
    page,
  }) => {
    expect(REDUCCION_VIVIENDA_ANIOS_MANTENIMIENTO_IS).toBe(10);
    expect(REDUCCION_VIVIENDA_ANIOS_MANTENIMIENTO_CATALUNA_IS).toBe(5);

    await abrir(page);

    // El estado de fábrica: vivienda habitual reducida Y venta dentro de los 10 años
    expect(await linea(page, ISD, '− Reducción vivienda habitual (95%)')).toBe('−122.606,47 €');
    expect(await linea(page, ISD, 'Cuota ISD final')).toBe('73,00 €');
    expect(await panel(page, IRPF)).toContain('Venta a los 5 años');

    // El aviso vive en el panel del ISD, con el importe de la regularización dentro
    const panelISD = await panel(page, ISD);
    expect(panelISD).toContain('Pierdes la reducción por vivienda habitual');
    expect(panelISD).toContain('art. 20.2.c LISD');
    expect(panelISD).toContain('222,25 €');
    expect(panelISD).toMatch(/manten(er|erla|imiento)/i);

    // Y el TOTAL la suma en su propia línea
    const total = await bloqueTotal(page);
    expect(total).toContain('ISD regularizado (venta antes de 10 años)');
    expect(total).toContain('222,25 €');

    // Fuera del plazo no hay nada que regularizar: a los 10 años el aviso desaparece
    await mover(page, 'aniosVenta', 10);
    expect(await panel(page, ISD)).not.toContain('Pierdes la reducción');
    expect(await bloqueTotal(page)).not.toContain('ISD regularizado');

    // Y sin reducción que perder, tampoco: Grupo IV no tiene derecho a ella
    await mover(page, 'aniosVenta', 5);
    expect(await panel(page, ISD)).toContain('Pierdes la reducción');
    await page.selectOption('#parentescoSel', 'sin_parentesco');
    expect(await panel(page, ISD)).not.toContain('Pierdes la reducción');
  });

  /**
   * [778] El plazo catalán es OTRO, y la app lo aplica: 5 años del art. 19 de la Ley 19/2010.
   * Una venta a los 7 años pierde la reducción en régimen común y NO en Cataluña.
   */
  test('[778] Cataluña cuenta 5 años de mantenimiento, no 10', async ({ page }) => {
    await abrir(page);
    await mover(page, 'aniosVenta', 7);

    // Régimen común (Madrid): 7 < 10 → se pierde
    expect(await panel(page, ISD)).toContain('Pierdes la reducción por vivienda habitual');
    expect(await bloqueTotal(page)).toContain('ISD regularizado (venta antes de 10 años)');

    // Cataluña: 7 > 5 → no se pierde
    await page.selectOption('#ccaaSel', 'cataluna');
    expect(await panel(page, ISD)).not.toContain('Pierdes la reducción');

    // Y a los 3 años sí, citando la norma catalana
    await mover(page, 'aniosVenta', 3);
    const panelCat = await panel(page, ISD);
    expect(panelCat).toContain('Pierdes la reducción por vivienda habitual');
    expect(panelCat).toContain('art. 19 de la Ley 19/2010');
    expect(await bloqueTotal(page)).toContain('ISD regularizado (venta antes de 5 años)');
  });

  /**
   * [779] ALTO — el TOTAL incluye la plusvalía municipal de la SEGUNDA transmisión, y esa
   * misma cuota se descuenta del valor de transmisión en el IRPF (art. 35.2 LIRPF), así que
   * no es una suma simple: entra entera en el total y rebaja la ganancia patrimonial.
   */
  test('[779] la plusvalía municipal de la venta entra en el total y rebaja la ganancia del IRPF', async ({
    page,
  }) => {
    await abrir(page);

    // 5 años de tenencia del heredero, el mismo suelo catastral: 60.000 × 0,18 × 25 %.
    // 0,18 es el coeficiente del art. 107.4 vigente (hallazgo 1559; era 0,17, RDL 26/2021)
    expect(coeficienteIIVTNU(5).coeficiente).toBe(0.18);
    const total = await bloqueTotal(page);
    expect(total).toContain('Plusvalía municipal (herencia)');
    // 20 años o más → 0,40: 60.000 × 0,40 × 25 %
    expect(total).toContain('6000,00 €');
    expect(total).toContain('Plusvalía municipal (venta)');
    expect(total).toContain('2700,00 €');

    // El panel del IRPF descuenta esa cuota del precio antes de calcular la ganancia
    const panelIRPF = await panel(page, IRPF);
    expect(panelIRPF).toContain('Plusvalía municipal de la venta');
    // 250.000 − 2.700 · 247.300 − 206.295,25 · 1.140 + 35.004,75 × 21 % (hallazgo 1559)
    expect(await linea(page, IRPF, '= Valor de transmisión**')).toBe('247.300,00 €');
    expect(await linea(page, IRPF, 'Ganancia patrimonial')).toBe('41.004,75 €');
    expect(await linea(page, IRPF, 'Cuota IRPF venta')).toBe('8491,00 €');
    expect(panelIRPF).toContain('art. 35.2 LIRPF');

    // 73,00 + 222,25 + 6.000,00 + 2.700,00 + 8.490,9975 = 17.486,2475
    expect(total).toContain('17.486,25');

    // Sin venta simulada no hay segunda transmisión que liquidar
    await mover(page, 'aniosVenta', 0);
    expect(await bloqueTotal(page)).not.toContain('Plusvalía municipal (venta)');
  });

  /**
   * [780] MEDIO — el ajuar doméstico del art. 15 LISD entra en la base imponible, se ve en su
   * línea propia y coincide con lo que devuelve el motor compartido del MCP. Es una presunción
   * destruible con prueba, así que el rótulo cita el artículo en vez de esconder la suma.
   */
  test('[780] el ajuar del art. 15 LISD entra en la base, se ve, y cuadra con el motor', async ({
    page,
  }) => {
    expect(PORC_AJUAR_DOMESTICO_IS).toBe(0.03);

    await abrir(page);

    expect(await linea(page, ISD, 'Valor de referencia de la vivienda')).toBe('200.000,00 €');
    expect(await linea(page, ISD, '+ Ajuar doméstico (3 % del caudal, art. 15 LISD)')).toBe(
      '+6000,00 €'
    );
    expect(await linea(page, ISD, '= Base imponible')).toBe('206.000,00 €');
    expect(await linea(page, ISD, 'Cuota ISD final')).toBe('73,00 €');

    // La misma herencia por el otro camino (tool calcular_sucesiones del MCP Delegum)
    const motor = calcularSucesion({
      baseImponible: 200000,
      ccaa: 'madrid',
      grupo: 'II',
      edadHeredero: 45,
      viviendaHabitual: 200000,
      incluyeAjuar: true,
    });
    expect(motor.ajuarDomestico).toBe(6000);
    expect(motor.baseImponibleConAjuar).toBe(206000);
    expect(motor.cuotaFinal).toBe(73);
  });

  /**
   * [781] MEDIO — el tercer sello enseña la fecha de la escala del ahorro, no la del módulo
   * entero de inmuebles, cuyo `verificado` lo mueven los commits del ITP.
   */
  test('[781] el sello del IRPF cita el art. 66 LIRPF y su propia fecha', async ({ page }) => {
    await abrir(page);

    const sellos = page.locator('[aria-label="Datos de referencia normativos"]');
    await expect(sellos).toHaveCount(3);
    const irpf = sellos.nth(2);
    await expect(irpf).toContainText('IRPF de la venta');
    await expect(irpf).toContainText('art. 66');
    await expect(irpf).toContainText(GANANCIAS_PATRIMONIALES_META.verificado.split('-').reverse().join('/'));
    // Y ya NO enseña la fecha que se ganó revisando el ITP ni las tres normas ajenas
    await expect(irpf).not.toContainText('Ley 1/1993');
    await expect(irpf).not.toContainText(
      FISCAL_INMUEBLES_META.verificado.split('-').reverse().join('/')
    );
  });

  /**
   * [782] BAJO — el plazo del ISD sale de data/fiscal con su norma citada, en los cuatro
   * sitios donde iba escrito a mano, y dice que la prórroga devenga intereses.
   */
  test('[782] el plazo del ISD viene sellado y cita los arts. 67 y 68 del Reglamento', async ({
    page,
  }) => {
    expect(PLAZO_ISD.mesesPresentacion).toBe(6);
    expect(PLAZO_ISD.mesesProrroga).toBe(6);
    expect(PLAZO_ISD.mesesParaPedirProrroga).toBe(5);
    expect(PLAZO_ISD.prorrogaDevengaIntereses).toBe(true);

    await abrir(page);
    const cuerpo = ((await page.locator('body').textContent()) ?? '').replace(/\s+/g, ' ');

    expect(cuerpo).toContain(PLAZO_ISD.norma);
    // La prórroga ya no se anuncia como si fuera gratis
    expect(cuerpo).toMatch(/prórroga[^.]*intereses de demora/i);

    // Y el dato está en data/fiscal, no tecleado en la app
    const jsx = readFileSync(
      resolve(__dirname, '..', '..', 'app', 'simulador-heredar-vivienda', 'page.tsx'),
      'utf8'
    );
    expect(jsx).toContain('PLAZO_ISD.mesesPresentacion');
    expect(jsx).not.toMatch(/>\s*6 meses desde el fallecimiento/);
  });

  /**
   * [783] BAJO — el faqJsonLd (el canal que leen los asistentes de IA sin el disclaimer al
   * lado) dice lo mismo que la app: sin incremento real el IIVTNU NO SE DEVENGA, y eso se
   * declara. Impugnar la liquidación era la vía anterior al RDL 26/2021.
   */
  test('[783] el faqJsonLd declara la no sujeción del IIVTNU en vez de mandar impugnar', async ({
    page,
  }) => {
    await abrir(page);

    const respuesta =
      (await faqServida(page)).find(q => q.name.includes('plusvalía municipal al heredar'))
        ?.acceptedAnswer.text ?? '';
    expect(respuesta).toContain('NO se devenga');
    expect(respuesta).toContain('art. 104.5 TRLHL');
    expect(respuesta).not.toContain('impugnar la liquidación');

    // Y la app hace eso mismo: adquisición 300.000 €, valor de referencia 200.000 €
    await mover(page, 'valorAdq', 300000);
    await mover(page, 'valorRef', 200000);
    expect(await linea(page, IIVTNU, 'Método elegido')).toBe('No sujeta');
    expect(await linea(page, IIVTNU, 'Cuota plusvalía municipal')).toBe('0,00 €');
  });

  /**
   * [784] BAJO — el 99 % de Madrid va derivado de BONIFICACIONES_CCAA_IS en las DOS preguntas
   * del faqJsonLd que lo citan, no tecleado en una y derivado en la otra.
   */
  test('[784] el porcentaje de Madrid se deriva en las dos preguntas que lo citan', async ({
    page,
  }) => {
    await abrir(page);

    const pct = Math.round(
      (BONIFICACIONES_CCAA_IS['madrid'].bonificaciones['I-descendiente']?.porcentaje ?? 0) * 100
    );
    const faq = await faqServida(page);
    const primera = faq.find(q => q.name.includes('impuestos hay que pagar al heredar'))?.acceptedAnswer.text ?? '';
    const quinta = faq.find(q => q.name.includes('Madrid y en Cataluña'))?.acceptedAnswer.text ?? '';
    expect(primera).toContain(`bonificaciones del ${pct}%`);
    expect(quinta).toContain(`bonificación del ${pct}%`);

    // El literal ya no está en el fichero: si Madrid mueve su bonificación, se mueven las dos
    const meta = readFileSync(
      resolve(__dirname, '..', '..', 'app', 'simulador-heredar-vivienda', 'metadata.ts'),
      'utf8'
    );
    expect(meta).not.toContain('bonificaciones del 99%');
    expect(meta).toContain('${BONIFICACION_MADRID_PCT}% para familiares directos');
  });
});

/**
 * ─── Re-inspección del 14/09/2026 (la 9ª) ────────────────────────────────────
 *
 * Los siete hallazgos del 12/09 se dan por CERRADOS y quedan cercados por los tests
 * [778]-[784] de arriba; esta tanda los re-ejercita de paso y añade tres casos nuevos más
 * ocho hallazgos abiertos.
 *
 * Los tres casos, resueltos A MANO antes de abrir el navegador (la aritmética completa va
 * en el comentario de cada uno), y ninguna cifra esperada de memoria: todas salen de
 * `data/fiscal/sucesiones.ts`, `data/fiscal/inmuebles.ts` o de la norma que esos módulos
 * citan.
 *
 *   · CASO 1 (normal)  — hijo, Madrid, vivienda habitual de 300.000 € y venta a los 12
 *     años, o sea FUERA del plazo de mantenimiento: la cadena entera sin regularización.
 *   · CASO 2 (límite)  — la FRONTERA EXACTA del plazo del art. 20.2.c: la misma herencia
 *     de Asturias vendida a los 9 años (dentro) y a los 10 (justo fuera).
 *   · CASO 3 (rechazo) — Grupo IV con la casilla de vivienda habitual marcada y venta a
 *     los 2 años: se rechaza la reducción, se rechaza la regularización (no hay reducción
 *     que perder) y se rechaza el IRPF (pérdida patrimonial).
 *
 * ⚠️ HALLAZGOS ABIERTOS de esta tanda, cada uno con su `test.fail()`:
 *   [H1] el «ISD regularizado» se cobra en el total y NO entra en el valor de adquisición
 *        fiscal del IRPF, pese a que la nota al pie promete «cuota ISD … pagadas».
 *   [H2] el `faqJsonLd` publica una ganancia patrimonial (venta − valor declarado) que el
 *        motor no calcula, y que es justo el error que la propia página lista como
 *        «error frecuente a evitar».
 *   [H3] la casilla de vivienda habitual anuncia el tope ESTATAL también en Cataluña,
 *        donde la app aplica el del art. 17 de la Ley 19/2010.
 *   [H4] el aviso de mantenimiento escribe «mantenerla 10» sin la unidad.
 *   [H5] el plazo de la complementaria se cuenta «desde la venta» con la constante cuyo
 *        dies a quo es el FALLECIMIENTO.
 *   [H6] el plazo del IIVTNU se sirve desde `PLAZO_ISD`, que es de otro tributo.
 *   [H7] los 65 años del colateral van tecleados mientras su constante queda importada y
 *        sin usar.
 *   [H8] el panel llama «Exenta» a lo que el `faqJsonLd` declara supuesto de NO SUJECIÓN.
 */
test.describe('Simulador de heredar vivienda — re-inspección 14/09/2026', () => {
  /**
   * CASO 1 (NORMAL) — hijo de 50 años, Comunidad de Madrid, vivienda habitual del padre
   * valorada en 300.000 €, comprada hace 25 años por 100.000 €, catastral del suelo
   * 90.000 € sobre un catastral total de 150.000 €, y venta a los 12 años por 380.000 €.
   *
   * Se elige 12 años a propósito: por encima de los
   * REDUCCION_VIVIENDA_ANIOS_MANTENIMIENTO_IS = 10 del art. 20.2.c, para que la cadena se
   * mida SIN la regularización del hallazgo 778 y quede separada del CASO 2.
   *
   * ISD:
   *   Caudal relicto                                              300.000,00
   *   + Ajuar art. 15 LISD  PORC_AJUAR_DOMESTICO_IS = 3 %          +9.000,00
   *   = Base imponible                                            309.000,00
   *   − Parentesco      REDUCCIONES_PARENTESCO_IS['II']           −15.956,87
   *   − Vivienda        mín(300.000 × 0,95; 122.606,47)          −122.606,47
   *   = Base liquidable                                           170.436,66
   *   Cuota íntegra por la COLUMNA `cuota` de TARIFA_ESTATAL_IS (tramo hasta 239.389,13):
   *        23.063,25 + (170.436,66 − 159.634,83) × 21,25 %
   *      = 23.063,25 + 2.295,388875 = 25.358,638875 → «25.358,64 €»
   *   × COEFICIENTES_IS['II'][0] = 1,0000 → cuota tributaria 25.358,64
   *   − Bonificación Madrid 99 % = 25.105,0536 → 25.105,05 (se redondea ANTES de restar)
   *   = Cuota ISD final 253,59 €
   *
   * ⚠️ De aquí abajo, RECALCULADO el 24/09/2026 con la tabla vigente del art. 107.4 TRLRHL
   * (hallazgo 1559; antes 0,45 y 0,08, de la tabla caducada del RDL 26/2021).
   *
   * Plusvalía municipal de la HERENCIA (tipo orientativo del módulo, 25 %):
   *   25 años de tenencia → topados en 20 → coeficiente 0,40
   *   Objetivo = 90.000 × 0,40 × 0,25 = 9.000,00
   *   Real     = (300.000 − 100.000) × (90.000 / 150.000) × 0,25 = 30.000,00
   *   Menor → 9.000,00 €
   *
   * Plusvalía municipal de la VENTA (hallazgo 779): 12 años → coeficiente 0,09
   *   Objetivo = 90.000 × 0,09 × 0,25 = 2.025,00 · Real = 80.000 × 0,6 × 0,25 = 12.000,00
   *   Menor → 2.025,00 €
   *
   * IRPF:
   *   Valor de adquisición fiscal = 300.000 + 253,59 + 9.000,00 = 309.253,59
   *   Valor de transmisión (art. 35.2 LIRPF) = 380.000 − 2.025 = 377.975,00
   *   Ganancia = 68.721,41
   *        6.000,00 × 19 % =  1.140,00
   *       44.000,00 × 21 % =  9.240,00
   *       18.721,41 × 23 % =  4.305,9243
   *                           ──────────
   *                            14.685,9243 → «14.685,92 €»
   *
   * TOTAL = 253,59 + 9.000,00 + 2.025,00 + 14.685,9243 = 25.964,5143 → «25.964,51 €»
   * Porcentaje sobre la venta = 25.964,5143 / 380.000 × 100 = 6,8328 → «6,83%»
   */
  test('CASO 1 (normal) — hijo, Madrid, 300.000 € de vivienda habitual y venta a los 12 años', async ({
    page,
  }) => {
    await abrir(page);

    await page.selectOption('#parentescoSel', 'hijo');
    await page.selectOption('#ccaaSel', 'madrid');
    await mover(page, 'edadHer', 50);
    await mover(page, 'anioAdq', ANIO - 25);
    await mover(page, 'valorAdq', 100000);
    await mover(page, 'valorRef', 300000);
    await mover(page, 'valorSuelo', 90000);
    await mover(page, 'valorCatastralTotal', 150000);
    await casilla(page, 'viviendaHabitual', true);
    await mover(page, 'aniosVenta', 12);
    await mover(page, 'valorVta', 380000);

    // ── ISD ──────────────────────────────────────────────────────────────────
    expect(await linea(page, ISD, '+ Ajuar doméstico (3 % del caudal, art. 15 LISD)')).toBe(
      '+9000,00 €'
    );
    expect(await linea(page, ISD, '= Base imponible')).toBe('309.000,00 €');
    // REDUCCIONES_PARENTESCO_IS['II'] = 15.956,87 €
    expect(await linea(page, ISD, '− Reducción parentesco')).toBe('−15.956,87 €');
    // Topada en REDUCCION_VIVIENDA_MAX_IS = 122.606,47 € (300.000 × 0,95 lo supera)
    expect(await linea(page, ISD, '− Reducción vivienda habitual (95%)')).toBe('−122.606,47 €');
    expect(await linea(page, ISD, '= Base liquidable')).toBe('170.436,66 €');
    expect(await linea(page, ISD, 'Cuota íntegra (tarifa)')).toBe('25.358,64 €');
    expect(await linea(page, ISD, '× Coef. patrimonio (Grupo II)')).toBe('×1,0000');
    expect(await linea(page, ISD, '= Cuota tributaria')).toBe('25.358,64 €');
    expect(await linea(page, ISD, 'Cuota ISD final')).toBe('253,59 €');

    // 12 ≥ 10: el art. 20.2.c queda cumplido y NO hay complementaria
    expect(await panel(page, ISD)).not.toContain('Pierdes la reducción');

    // ── Plusvalía municipal de la herencia ───────────────────────────────────
    expect(await panel(page, IIVTNU)).toContain('20 años de tenencia');
    // 0,40 y 90.000 × 0,40 × 25 % (hallazgo 1559)
    expect(await linea(page, IIVTNU, 'Coeficiente 20 años')).toBe('0,40');
    expect(await linea(page, IIVTNU, 'Método objetivo')).toBe('9000,00 €');
    expect(await linea(page, IIVTNU, 'Método real (suelo)')).toBe('30.000,00 €');
    expect(await linea(page, IIVTNU, 'Método elegido')).toBe('Objetivo (menor)');
    expect(await linea(page, IIVTNU, 'Cuota plusvalía municipal')).toBe('9000,00 €');

    // ── IRPF ─────────────────────────────────────────────────────────────────
    // 300.000 + 253,59 + 9.000 · 380.000 − 2.025 · 1.140 + 9.240 + 18.721,41 × 23 % (1559)
    expect(await linea(page, IRPF, 'Valor adquisición fiscal*')).toBe('309.253,59 €');
    expect(await linea(page, IRPF, '= Valor de transmisión**')).toBe('377.975,00 €');
    expect(await linea(page, IRPF, 'Ganancia patrimonial')).toBe('68.721,41 €');
    expect(await linea(page, IRPF, 'Cuota IRPF venta')).toBe('14.685,92 €');

    // ── Total ────────────────────────────────────────────────────────────────
    const total = await bloqueTotal(page);
    // 12 años → 0,09: 90.000 × 0,09 × 25 % (hallazgo 1559)
    expect(total).toContain('+ Plusvalía municipal (venta) 2025,00 €');
    // 253,59 + 9.000,00 + 2.025,00 + 14.685,9243 = 25.964,5143
    expect(total).toContain('= TOTAL 25.964,51 €');
    expect(total).toContain('6,83%');
    // Nunca formato US: el punto es el millar y la coma el decimal
    expect(total).not.toMatch(/25,964\.51/);
  });

  /**
   * CASO 2 (LÍMITE) — la FRONTERA EXACTA del plazo de mantenimiento del art. 20.2.c LISD.
   *
   * La condición de la app es `aniosHastaVenta < REDUCCION_VIVIENDA_ANIOS_MANTENIMIENTO_IS`,
   * así que el borde está entre el año 9 (dentro, hay complementaria) y el 10 (cumplido, no
   * la hay). Se cerca por los dos lados con la MISMA herencia, para que lo único que cambie
   * sea el deslizador de años.
   *
   * Hijo de 50 años, Asturias —la única CCAA cuyo beneficio vive en la BASE—, vivienda
   * habitual de 450.000 € comprada hace 18 años por 180.000 €, catastral del suelo 90.000 €
   * sobre 225.000 € de catastral total, venta por 550.000 €.
   *
   * ISD (idéntico en los dos lados del borde: la venta no cambia la liquidación inicial):
   *   Base imponible 450.000 × 1,03                                463.500,00
   *   − Parentesco   REDUCCIONES_PARENTESCO_IS['II']               −15.956,87
   *   − Vivienda     mín(450.000 × 0,95; 122.606,47)              −122.606,47
   *   − Autonómica   asturias…['II'].reduccionBase                −300.000,00
   *   = Base liquidable                                             24.936,66
   *   Cuota íntegra (tramo hasta 31.955,81): 2.037,26 + (24.936,66 − 23.968,36) × 10,20 %
   *                 = 2.037,26 + 98,7666 = 2.136,0266 → «2136,03 €»
   *   × 1,0000 y Asturias no bonifica en cuota → Cuota ISD final 2.136,03 €
   *
   * Y lo que habría que ingresar si se pierde la reducción (isdSinReduccionVivienda):
   *   Base liquidable 463.500 − 15.956,87 − 300.000 = 147.543,13
   *   Cuota íntegra (tramo hasta 159.634,83): 15.606,22 + 27.785,46 × 18,70 % = 20.802,10102
   *   Regularización = 20.802,10 − 2.136,03 = 18.666,07 €
   *
   * ⚠️ Plusvalías, IRPF y totales RECALCULADOS el 24/09/2026 con la tabla vigente del
   * art. 107.4 TRLRHL (hallazgo 1559). Con la tabla caducada del RDL 26/2021 eran 0,26 (18
   * años), 0,09 (9) y 0,08 (10); ahora 0,17, 0,15 y 0,12.
   *
   * Plusvalía de la HERENCIA: 18 años → coeficiente 0,17
   *   Objetivo = 90.000 × 0,17 × 0,25 = 3.825,00 · Real = 270.000 × 0,4 × 0,25 = 27.000,00
   *   Menor → 3.825,00 €
   *
   * (a) VENTA A LOS 9 AÑOS — dentro del plazo:
   *   ⚠️ DERIVACIÓN REHECHA el 21/09/2026. Es el hallazgo 867 otra vez, y justo en el caso
   *   que la reparación del 859 movió: aquel commit rehízo OCHO derivaciones a mano y esta
   *   se quedó fuera, describiendo el valor de adquisición SIN el ISD regularizado —los
   *   457.986,03 € de antes de la reparación— mientras las aserciones de abajo ya exigían
   *   los 476.652,10 € de después. Un golden cuya aritmética documentada no lo reproduce no
   *   se puede re-verificar leyéndolo.
   *
   *   Plusvalía de la venta: coeficiente 0,15 → objetivo 90.000 × 0,15 × 0,25 = 3.375,00
   *                          (real = 100.000 × 0,4 × 0,25 = 10.000) → 3.375,00 €
   *   ISD efectivamente pagado = 2.136,03 + 18.666,07 (complementaria) = 20.802,10
   *   Valor de adquisición fiscal = 450.000 + 20.802,10 + 3.825,00 = 474.627,10
   *   Valor de transmisión = 550.000 − 3.375 = 546.625,00 · Ganancia = 71.997,90
   *   IRPF = 1.140,00 + 9.240,00 + 21.997,90 × 23 % = 15.439,517 → «15.439,52 €»
   *   TOTAL = 2.136,03 + 18.666,07 + 3.825,00 + 3.375,00 + 15.439,517 = 43.441,617
   *
   * (b) VENTA A LOS 10 AÑOS — justo en el borde, plazo CUMPLIDO:
   *   Plusvalía de la venta: coeficiente 0,12 → 90.000 × 0,12 × 0,25 = 2.700,00 €
   *   Valor de adquisición fiscal = 450.000 + 2.136,03 + 3.825,00 = 455.961,03
   *   Valor de transmisión = 547.300,00 · Ganancia = 91.338,97
   *   IRPF = 1.140,00 + 9.240,00 + 41.338,97 × 23 % = 19.887,9631 → «19.887,96 €»
   *   TOTAL = 2.136,03 + 3.825,00 + 2.700,00 + 19.887,9631 = 28.548,9931
   */
  test('CASO 2 (límite) — la frontera del plazo del art. 20.2.c: 9 años dentro, 10 fuera', async ({
    page,
  }) => {
    await abrir(page);

    await page.selectOption('#parentescoSel', 'hijo');
    await page.selectOption('#ccaaSel', 'asturias');
    await mover(page, 'edadHer', 50);
    await mover(page, 'anioAdq', ANIO - 18);
    await mover(page, 'valorAdq', 180000);
    await mover(page, 'valorRef', 450000);
    await mover(page, 'valorSuelo', 90000);
    await mover(page, 'valorCatastralTotal', 225000);
    await casilla(page, 'viviendaHabitual', true);
    await mover(page, 'aniosVenta', 9);
    await mover(page, 'valorVta', 550000);

    // ── (a) a los 9 años: dentro del plazo ───────────────────────────────────
    expect(await linea(page, ISD, '= Base liquidable')).toBe('24.936,66 €');
    expect(await linea(page, ISD, 'Cuota ISD final')).toBe('2136,03 €');
    // 18 años → 0,17: 90.000 × 0,17 × 25 % (hallazgo 1559)
    expect(await linea(page, IIVTNU, 'Cuota plusvalía municipal')).toBe('3825,00 €');

    const avisoDentro = await panel(page, ISD);
    expect(avisoDentro).toContain('Pierdes la reducción por vivienda habitual');
    expect(avisoDentro).toContain('vendes a los 9 años');
    // Lo que hay que ingresar en la complementaria, resuelto arriba a mano
    expect(avisoDentro).toContain('18.666,07 €');

    // Recalculados con la tabla vigente del art. 107.4 (hallazgo 1559), desarrollo arriba
    expect(await linea(page, IRPF, 'Valor adquisición fiscal*')).toBe('474.627,10 €');
    expect(await linea(page, IRPF, 'Ganancia patrimonial')).toBe('71.997,90 €');
    expect(await linea(page, IRPF, 'Cuota IRPF venta')).toBe('15.439,52 €');

    const totalDentro = await bloqueTotal(page);
    expect(totalDentro).toContain(
      `+ ISD regularizado (venta antes de ${REDUCCION_VIVIENDA_ANIOS_MANTENIMIENTO_IS} años) 18.666,07 €`
    );
    expect(totalDentro).toContain('= TOTAL 43.441,62 €');

    // ── (b) el mismo caso a los 10 años: el borde exacto, plazo cumplido ──────
    await mover(page, 'aniosVenta', 10);

    // La liquidación inicial no se mueve: lo que desaparece es la complementaria
    expect(await linea(page, ISD, 'Cuota ISD final')).toBe('2136,03 €');
    expect(await panel(page, ISD)).not.toContain('Pierdes la reducción');

    // (550.000 − 2.700) − 455.961,03 y su IRPF (hallazgo 1559)
    expect(await linea(page, IRPF, 'Ganancia patrimonial')).toBe('91.338,97 €');
    expect(await linea(page, IRPF, 'Cuota IRPF venta')).toBe('19.887,96 €');

    const totalFuera = await bloqueTotal(page);
    expect(totalFuera).not.toContain('ISD regularizado');
    expect(totalFuera).toContain('= TOTAL 28.548,99 €');
  });

  /**
   * CASO 3 (RECHAZO) — tres negativas encadenadas en la misma pantalla.
   *
   * Grupo IV (sin parentesco) de 50 años, Madrid, con la casilla de vivienda habitual
   * MARCADA, valor de referencia 250.000 €, comprada hace 5 años por 200.000 €, catastral
   * del suelo 60.000 € sobre 120.000 €, y venta a los 2 años por 260.000 €.
   *
   *   1. La reducción del art. 20.2.c se DENIEGA y se dice por qué: `evaluarReduccionVivienda`
   *      excluye al Grupo IV («el art. 20.2.c LISD no la contempla»).
   *   2. Como no hay reducción, tampoco puede haber complementaria: el aviso de
   *      mantenimiento NO debe salir pese a vender a los 2 años, que están dentro del plazo.
   *   3. El IRPF se rechaza por PÉRDIDA patrimonial: la cuota de ISD del Grupo IV es tan
   *      alta que el valor de adquisición fiscal supera al de transmisión.
   *
   * ISD:
   *   Base imponible 250.000 × 1,03                                257.500,00
   *   − Parentesco   REDUCCIONES_PARENTESCO_IS['IV'] = 0                 0,00
   *   − Vivienda     denegada                                           0,00
   *   = Base liquidable                                           257.500,00
   *   Cuota íntegra (tramo hasta 398.777,54): 40.011,04 + (257.500 − 239.389,13) × 25,50 %
   *                 = 40.011,04 + 4.618,27185 = 44.629,31185 → «44.629,31 €»
   *   × COEFICIENTES_IS['IV'][0] = 2,0000 → 89.258,62
   *   Madrid no bonifica al Grupo IV (porcentaje 0) → Cuota ISD final 89.258,62 €
   *
   * ⚠️ Plusvalías, IRPF y total RECALCULADOS el 24/09/2026 con la tabla vigente del
   * art. 107.4 TRLRHL (hallazgo 1559; antes 0,17 y 0,15, de la tabla caducada del RDL
   * 26/2021).
   *
   * Plusvalía de la HERENCIA: 5 años → coeficiente 0,18
   *   Objetivo = 60.000 × 0,18 × 0,25 = 2.700,00 · Real = 50.000 × 0,5 × 0,25 = 6.250,00
   *   Menor → 2.700,00 € (objetivo)
   *
   * Plusvalía de la VENTA: 2 años → coeficiente 0,14
   *   Objetivo = 60.000 × 0,14 × 0,25 = 2.100,00 · Real = 10.000 × 0,5 × 0,25 = 1.250,00
   *   Menor → 1.250,00 € (aquí gana el método REAL, al revés que en los otros dos casos)
   *
   * IRPF:
   *   Valor de adquisición fiscal = 250.000 + 89.258,62 + 2.700,00 = 341.958,62
   *   Valor de transmisión = 260.000 − 1.250 = 258.750,00
   *   Ganancia = −83.208,62 → pérdida patrimonial, cuota 0,00 €
   *
   * TOTAL = 89.258,62 + 2.700,00 + 1.250,00 + 0 = 93.208,62 € (35,8495 % → «35,85 %»)
   */
  test('CASO 3 (rechazo) — Grupo IV: vivienda denegada, sin complementaria y con pérdida', async ({
    page,
  }) => {
    await abrir(page);

    await page.selectOption('#parentescoSel', 'sin_parentesco');
    await page.selectOption('#ccaaSel', 'madrid');
    await mover(page, 'edadHer', 50);
    await mover(page, 'anioAdq', ANIO - 5);
    await mover(page, 'valorAdq', 200000);
    await mover(page, 'valorRef', 250000);
    await mover(page, 'valorSuelo', 60000);
    await mover(page, 'valorCatastralTotal', 120000);
    await casilla(page, 'viviendaHabitual', true);
    await mover(page, 'aniosVenta', 2);
    await mover(page, 'valorVta', 260000);

    // 1. La reducción se deniega, y se dice por qué (no se calla ni se aplica a medias)
    const panelISD = await panel(page, ISD);
    expect(panelISD).toContain(
      'No aplicable: sin parentesco: el art. 20.2.c LISD no la contempla'
    );
    expect(await linea(page, ISD, '= Base liquidable')).toBe('257.500,00 €');
    expect(await linea(page, ISD, 'Cuota íntegra (tarifa)')).toBe('44.629,31 €');
    expect(await linea(page, ISD, '× Coef. patrimonio (Grupo IV)')).toBe('×2,0000');
    expect(await linea(page, ISD, 'Cuota ISD final')).toBe('89.258,62 €');

    // 2. Vender a los 2 años NO dispara la complementaria: no hay reducción que perder
    expect(panelISD).not.toContain('Pierdes la reducción');

    // 3. El IRPF se rechaza por pérdida patrimonial
    // 250.000 + 89.258,62 + 2.700 (IIVTNU de la herencia a 0,18, hallazgo 1559)
    expect(await linea(page, IRPF, 'Valor adquisición fiscal*')).toBe('341.958,62 €');
    expect(await linea(page, IRPF, 'Pérdida patrimonial')).toBe('−83.208,62 €');
    expect(await linea(page, IRPF, 'Cuota IRPF venta')).toBe('0,00 €');

    const total = await bloqueTotal(page);
    expect(total).not.toContain('ISD regularizado');
    // En la venta gana el método REAL (1.250 €), no el objetivo (2.100 € a 0,14)
    expect(total).toContain('+ Plusvalía municipal (venta) 1250,00 €');
    // 89.258,62 + 2.700,00 + 1.250,00 (hallazgo 1559)
    expect(total).toContain('= TOTAL 93.208,62 €');
    expect(total).toContain('35,85%');
  });

  /**
   * [H1] MEDIO — el «ISD regularizado» se cobra en el total y NO engorda el valor de
   * adquisición fiscal del IRPF.
   *
   * Cuando la venta cae dentro del plazo de mantenimiento, la app añade al total una línea
   * «+ ISD regularizado» —el ISD que hay que ingresar en la complementaria— y a la vez
   * calcula el valor de adquisición fiscal con la cuota de ISD INICIAL solamente:
   *
   *     const valorAdquisicionFiscal = valorReferenciaISD + cuotaISD + cuotaIIVTNU;
   *
   * donde `cuotaISD` es `isd.cuotaFinal` y no `isd.cuotaFinal + regularizacionVivienda`.
   *
   * El art. 36 LIRPF remite al 35.1, que manda sumar al importe real «los gastos y tributos
   * inherentes a la adquisición … satisfechos por el adquirente»; y lo que se satisface por
   * la adquisición, en este escenario, es el ISD ENTERO — que es precisamente la cifra que
   * la app acaba de escribir en el bloque total. La página además se contradice consigo
   * misma por dos sitios: la nota al pie del panel del IRPF dice «* Valor referencia ISD +
   * cuota ISD + cuota plusvalía pagadas», y su propia lista de errores frecuentes advierte
   * de «calcular la ganancia patrimonial al vender sin sumar ISD ni plusvalía pagados al
   * valor de adquisición fiscal: pagas IRPF de más».
   *
   * Caso (el del CASO 2a, con la aritmética ya desarrollada allí; plusvalías recalculadas el
   * 24/09/2026 con la tabla vigente del art. 107.4 — hallazgo 1559 —: 3.825,00 € la de la
   * herencia y 3.375,00 € la de la venta, donde antes eran 5.850,00 y 2.025,00):
   *   ISD inicial 2.136,03 € + ISD regularizado 18.666,07 € = 20.802,10 € de ISD pagado.
   *   Valor de adquisición fiscal esperado = 450.000 + 20.802,10 + 3.825,00 = 474.627,10 €
   *   Ganancia = 546.625,00 − 474.627,10 = 71.997,90 €
   *   IRPF = 1.140,00 + 9.240,00 + 21.997,90 × 23 % = 15.439,517 → 15.439,52 €
   *   TOTAL = 2.136,03 + 18.666,07 + 3.825,00 + 3.375,00 + 15.439,517 = 43.441,617 €
   *
   *   Antes de la reparación (15/09/2026) la app daba 457.986,03 € de valor de adquisición,
   *   19.577,46 € de IRPF y 48.254,56 € de total: 4.293,19 € de más, un 9,8 % del coste que
   *   anunciaba. El test de abajo exige ya los cuatro valores buenos.
   */
  test(
    '[H1] el ISD regularizado se cobra en el total y no entra en el valor de adquisición del IRPF',
    async ({ page }) => {
      await abrir(page);

      await page.selectOption('#parentescoSel', 'hijo');
      await page.selectOption('#ccaaSel', 'asturias');
      await mover(page, 'edadHer', 50);
      await mover(page, 'anioAdq', ANIO - 18);
      await mover(page, 'valorAdq', 180000);
      await mover(page, 'valorRef', 450000);
      await mover(page, 'valorSuelo', 90000);
      await mover(page, 'valorCatastralTotal', 225000);
      await casilla(page, 'viviendaHabitual', true);
      await mover(page, 'aniosVenta', 9);
      await mover(page, 'valorVta', 550000);

      // El ISD que la propia página dice que hay que pagar, leído de la pantalla
      const isdInicial = importe(await linea(page, ISD, 'Cuota ISD final'));
      const total = await bloqueTotal(page);
      // El importe va detrás del rótulo «+ ISD regularizado (venta antes de 10 años)», que
      // lleva dentro un número: el patrón exige coma decimal y dos cifras para no picar en él.
      const regularizado = importe(
        total.match(/ISD regularizado[^€]*?([\d.]+,\d{2}) €/)?.[1] ?? '0'
      );
      const iivtnuHerencia = importe(await linea(page, IIVTNU, 'Cuota plusvalía municipal'));
      expect(isdInicial + regularizado).toBeCloseTo(20802.1, 2);

      // Y el valor de adquisición fiscal que la app usa para el IRPF
      const valorAdquisicion = importe(await linea(page, IRPF, 'Valor adquisición fiscal*'));
      expect(
        valorAdquisicion,
        'el valor de adquisición debe incluir TODO el ISD satisfecho (art. 35.1.b LIRPF)'
      ).toBeCloseTo(450000 + isdInicial + regularizado + iivtnuHerencia, 2);

      // Recalculados con la tabla vigente del art. 107.4 (hallazgo 1559), desarrollo arriba
      expect(await linea(page, IRPF, 'Ganancia patrimonial')).toBe('71.997,90 €');
      expect(await linea(page, IRPF, 'Cuota IRPF venta')).toBe('15.439,52 €');
      expect(await bloqueTotal(page)).toContain('= TOTAL 43.441,62 €');
    }
  );

  /**
   * [H2] MEDIO — el `faqJsonLd` publica una ganancia patrimonial que el motor no calcula.
   *
   * La tercera pregunta —la que leen Bing Copilot, ChatGPT, Perplexity y Gemini sin el
   * disclaimer al lado— dice: «La ganancia patrimonial se calcula como la diferencia entre
   * el precio de venta y el valor declarado en la herencia (que actúa como precio de
   * adquisición)».
   *
   * La app no hace eso: suma al valor declarado el ISD y la plusvalía municipal pagados al
   * heredar (art. 35.1.b LIRPF) y resta del precio la plusvalía municipal de la venta
   * (art. 35.2 LIRPF). Es la misma página la que lo explica, dos veces, en el bloque
   * educativo: el paso 5 de la cronología y la tarjeta «Suma los impuestos pagados al valor
   * de adquisición». Y su lista de errores frecuentes llama «error a evitar» exactamente a
   * lo que la FAQ publica.
   *
   * Caso (el del CASO 1): la fórmula de la FAQ da 380.000 − 300.000 = 80.000 € de ganancia
   * y la app calcula 68.721,41 € (recalculada el 24/09/2026 con la tabla vigente del IIVTNU,
   * hallazgo 1559; antes 67.821,41). Al 23 % marginal son 11.278,59 × 23 % = 2.594,08 € de
   * IRPF de diferencia.
   */
  test('[H2] el faqJsonLd publica una ganancia que el motor no calcula', async ({ page }) => {
    await abrir(page);

    const respuesta =
      (await faqServida(page)).find(q => q.name.includes('IRPF se paga al vender'))?.acceptedAnswer
        .text ?? '';
    expect(respuesta, 'la FAQ debe existir').not.toBe('');

    // El valor de adquisición del art. 36 LIRPF no es el valor declarado a secas
    expect(
      respuesta,
      'la FAQ tiene que decir que al valor declarado se le suman los tributos satisfechos'
    ).toMatch(/ISD pagad|impuestos pagados|tributos inherentes/i);

    // Y el de transmisión tampoco es el precio a secas (hallazgo 779, ya reparado en la app)
    expect(respuesta).toMatch(/plusvalía municipal de la venta|art\. 35\.2/i);

    // Lo que de verdad calcula la app con ese mismo supuesto
    await page.selectOption('#parentescoSel', 'hijo');
    await page.selectOption('#ccaaSel', 'madrid');
    await mover(page, 'edadHer', 50);
    await mover(page, 'anioAdq', ANIO - 25);
    await mover(page, 'valorAdq', 100000);
    await mover(page, 'valorRef', 300000);
    await mover(page, 'valorSuelo', 90000);
    await mover(page, 'valorCatastralTotal', 150000);
    await casilla(page, 'viviendaHabitual', true);
    await mover(page, 'aniosVenta', 12);
    await mover(page, 'valorVta', 380000);
    // 377.975,00 − 309.253,59, desarrollado en el CASO 1 de esta tanda (hallazgo 1559)
    expect(importe(await linea(page, IRPF, 'Ganancia patrimonial'))).toBeCloseTo(68721.41, 2);
  });

  /**
   * [H3] MEDIO — la casilla de vivienda habitual anuncia el tope ESTATAL también en
   * Cataluña, donde la app aplica el del art. 17 de la Ley 19/2010.
   *
   * La etiqueta se escribe sin mirar la comunidad:
   *
   *     (reducción {PORC_REDUCCION_VIVIENDA}% ISD hasta {formatCurrency(REDUCCION_VIVIENDA_MAX_IS)})
   *
   * y lo mismo la tarjeta «Aprovecha la reducción de vivienda habitual» de buenas prácticas.
   * `REDUCCION_VIVIENDA_MAX_CATALUNA_IS` = 500.000 € está sellada en `data/fiscal` desde el
   * 08/09/2026 y `metadata.ts` ya la importa para el faqJsonLd; `page.tsx` no la importa.
   *
   * Es la forma exacta del hallazgo 696 —el plazo de mantenimiento que no conocía los 5 años
   * de Cataluña— reaparecida sobre el TOPE en vez de sobre el plazo.
   *
   * Caso: Cataluña, hijo de 50 años, vivienda habitual de 400.000 €.
   *   La app aplica mín(400.000 × 0,95; 500.000) = 380.000,00 € y deja la base liquidable en
   *   0,00 €, mientras la etiqueta de la casilla que acaba de marcarse promete «hasta
   *   122.606,47 €» — tres veces menos de lo que la propia app está aplicando.
   */
  test('[H3] en Cataluña la casilla anuncia el tope estatal y la app aplica el catalán', async ({
    page,
  }) => {
    await abrir(page);

    await page.selectOption('#parentescoSel', 'hijo');
    await page.selectOption('#ccaaSel', 'cataluna');
    await mover(page, 'edadHer', 50);
    await mover(page, 'valorRef', 400000);
    await casilla(page, 'viviendaHabitual', true);
    await mover(page, 'aniosVenta', 0);

    // Lo que la app APLICA: el tope catalán del art. 17 de la Ley 19/2010
    expect(await linea(page, ISD, '− Reducción vivienda habitual (95%)')).toBe('−380.000,00 €');
    expect(await linea(page, ISD, '= Base liquidable')).toBe('0,00 €');

    // Lo que la etiqueta de esa misma casilla ANUNCIA
    const etiqueta = (await page.locator('label:has(#viviendaHabitual)').innerText()).replace(
      /\s+/g,
      ' '
    );
    const topeCatalan = new Intl.NumberFormat('es-ES', { minimumFractionDigits: 2 }).format(
      REDUCCION_VIVIENDA_MAX_CATALUNA_IS
    );
    expect(etiqueta, 'la etiqueta debe anunciar el tope que la app va a aplicar').toContain(
      topeCatalan
    );
  });

  /**
   * [H4] BAJO — el aviso de mantenimiento escribe el plazo sin unidad.
   *
   * El JSX es `exige mantenerla {aniosMantenimiento}` y la línea siguiente abre con el
   * paréntesis de Cataluña, así que en régimen común sale literalmente «el art. 20.2.c LISD
   * exige mantenerla 10. Hay que presentar…». Un plazo sin unidad en una app de riesgo 1 no
   * es un detalle tipográfico: «10» puede leerse como meses tan fácilmente como años, y el
   * aviso va justo encima de una cifra que hay que ingresar.
   *
   * Caso: el estado de fábrica de la app (hijo, Madrid, vivienda habitual, venta a los 5
   * años) ya lo enseña, y se ve en el HTML servido sin necesidad de tocar nada.
   */
  test('[H4] el aviso de mantenimiento escribe el plazo sin la unidad', async ({ page }) => {
    await abrir(page);

    // Estado de fábrica: vivienda habitual marcada y venta a los 5 años
    const aviso = await panel(page, ISD);
    expect(aviso).toContain('Pierdes la reducción por vivienda habitual');
    expect(aviso).toContain(
      `exige mantenerla ${REDUCCION_VIVIENDA_ANIOS_MANTENIMIENTO_IS} años`
    );
  });

  /**
   * [H5] MEDIO — el plazo de la complementaria se cuenta «desde la venta» con la constante
   * cuyo dies a quo es el FALLECIMIENTO.
   *
   * El aviso cierra con `El plazo es de {PLAZO_ISD.mesesPresentacion} meses desde la venta.`
   * y `PLAZO_ISD.mesesPresentacion` está sellado en `data/fiscal/sucesiones.ts` como
   * «Meses desde el fallecimiento para presentar la autoliquidación (art. 67.1.a)». El
   * art. 67.1.a del RD 1629/1991 dice, literalmente, «seis meses, contados desde el día del
   * fallecimiento del causante»: no habla de la pérdida sobrevenida de una reducción ni de
   * ningún plazo que arranque en la venta.
   *
   * O sea, la app publica una fecha límite que la constante de la que la lee no respalda, y
   * lo hace en el mismo aviso donde SÍ cita bien la norma de la reducción. Es el hallazgo
   * 782 —el plazo que iba a mano y sin norma— repetido al revés: ahora hay constante, pero
   * se le pide algo que no dice.
   */
  test('[H5] el plazo de la complementaria se cuenta desde la venta con la constante del fallecimiento', async ({
    page,
  }) => {
    await abrir(page);

    expect(await panel(page, ISD)).toContain('Pierdes la reducción por vivienda habitual');
    expect(
      await panel(page, ISD),
      `PLAZO_ISD.mesesPresentacion (${PLAZO_ISD.mesesPresentacion}) cuenta desde el fallecimiento, no desde la venta`
    ).not.toContain(`${PLAZO_ISD.mesesPresentacion} meses desde la venta`);

    // Y el JSX que lo escribe, para que la regresión se vea sin navegador
    const jsx = readFileSync(
      resolve(__dirname, '..', '..', 'app', 'simulador-heredar-vivienda', 'page.tsx'),
      'utf8'
    );
    expect(jsx).not.toMatch(/\{PLAZO_ISD\.mesesPresentacion\} meses desde la venta/);
  });

  /**
   * [H6] BAJO — el plazo del IIVTNU se sirve desde `PLAZO_ISD`, que es de otro tributo.
   *
   * La fila «Plusvalía municipal (IIVTNU)» de la tabla «Los tres impuestos en cadena» y el
   * último punto de «Errores frecuentes» escriben los dos
   * `{PLAZO_ISD.mesesPresentacion} meses`, con la constante del Impuesto de Sucesiones.
   * El plazo del IIVTNU lo fija el art. 110.2.b del TRLHL (RDL 2/2004) y tiene además una
   * prórroga distinta —hasta un año a solicitud del sujeto pasivo, no los seis meses del
   * art. 68 RISD—, así que el día que uno de los dos se mueva, la app moverá el otro sin
   * que nadie se entere. `grep -rn "PLAZO_IIVTNU" data/` no devuelve nada.
   *
   * Es el caso de PLAZO_ITP (hallazgo 713) y el de PLAZO_ISD (hallazgo 782) por tercera vez:
   * un dato normativo que se enseña sin una fuente propia que revisar.
   */
  test('[H6] el plazo del IIVTNU no tiene constante propia y se toma de PLAZO_ISD', async () => {
    const inmuebles = readFileSync(
      resolve(__dirname, '..', '..', 'data', 'fiscal', 'inmuebles.ts'),
      'utf8'
    );
    expect(
      inmuebles,
      'el plazo del IIVTNU (art. 110.2.b TRLHL) necesita su propio dato sellado'
    ).toMatch(/export const PLAZO_IIVTNU/);
  });

  /**
   * [H7] BAJO — los 65 años del colateral van tecleados y su constante queda importada sin
   * usar.
   *
   * `page.tsx` importa `EDAD_MIN_COLATERAL_VIVIENDA_IS` y lo reexpone en la línea
   *
   *     const EDAD_MIN_COLATERAL_VIVIENDA = EDAD_MIN_COLATERAL_VIVIENDA_IS;
   *
   * …que no se usa en ninguna parte: es la única aparición del identificador en las 1.716
   * líneas del fichero. Mientras tanto el 65 va escrito a mano en los dos sitios donde lo
   * lee el usuario —la etiqueta de la casilla de convivencia, que es el control que gobierna
   * el requisito, y la pregunta «¿Cómo afecta que fuera la vivienda habitual del
   * fallecido?»—. Quien decide de verdad es `evaluarReduccionVivienda`, que sí lee la
   * constante y con ella redacta el rechazo.
   *
   * Caso: hermano de 64 años, Madrid, vivienda habitual de 300.000 € y convivencia marcada.
   *   La app deniega con «No aplicable: pariente colateral menor de 65 años» (texto DERIVADO
   *   de la constante) mientras la casilla de al lado promete el requisito con un 65
   *   tecleado. Hoy coinciden; el día que la constante cambie, no.
   */
  test('[H7] los 65 años del colateral van a mano y la constante queda sin usar', async ({
    page,
  }) => {
    await abrir(page);

    await page.selectOption('#parentescoSel', 'hermano');
    await page.selectOption('#ccaaSel', 'madrid');
    await mover(page, 'valorRef', 300000);
    await casilla(page, 'viviendaHabitual', true);
    await casilla(page, 'convivencia', true);
    await mover(page, 'aniosVenta', 0);
    await mover(page, 'edadHer', EDAD_MIN_COLATERAL_VIVIENDA_IS - 1);

    // El rechazo SÍ sale de la constante
    expect(await panel(page, ISD)).toContain(
      `pariente colateral menor de ${EDAD_MIN_COLATERAL_VIVIENDA_IS} años`
    );
    // Y un año más tarde la reducción entra
    await mover(page, 'edadHer', EDAD_MIN_COLATERAL_VIVIENDA_IS);
    // Topada en REDUCCION_VIVIENDA_MAX_IS = 122.606,47 € (300.000 × 0,95 lo supera)
    expect(await linea(page, ISD, '− Reducción vivienda habitual (95%)')).toBe('−122.606,47 €');

    // Pero el número que lee el usuario va tecleado, y la constante local está muerta
    const jsx = readFileSync(
      resolve(__dirname, '..', '..', 'app', 'simulador-heredar-vivienda', 'page.tsx'),
      'utf8'
    );
    const usos = (jsx.match(/\bEDAD_MIN_COLATERAL_VIVIENDA\b/g) ?? []).length;
    expect(usos, 'la constante local solo aparece en su propia declaración').toBeGreaterThan(1);
    expect(jsx).not.toContain('tener 65 años o más');
  });

  /**
   * [H8] BAJO — el panel llama «Exenta» a lo que el `faqJsonLd` declara supuesto de NO
   * SUJECIÓN.
   *
   * La segunda pregunta del faqJsonLd, reparada el 12/09/2026 (hallazgo 783), insiste en la
   * distinción: «el impuesto NO se devenga (art. 104.5 TRLHL …): es un supuesto de no
   * sujeción». El panel de la plusvalía, para ese mismo escenario, rotula «Exenta (sin
   * ganancia)» y «Exenta», y la pregunta del bloque educativo se titula «¿La plusvalía
   * municipal está exenta si hay pérdida?».
   *
   * No es sinónimo y la propia FAQ se toma la molestia de decirlo: una exención se reconoce
   * sobre un hecho imponible realizado, y la no sujeción significa que no hay hecho imponible
   * que declarar más allá de aportar las escrituras. La reparación llegó al canal que leen
   * los asistentes de IA y no a la pantalla.
   *
   * Caso: adquisición 400.000 €, valor de referencia 300.000 € → «Método elegido: Exenta».
   *
   * ⚠️ Al repararlo hay que mover también la aserción del test [783], que hoy congela
   * `.toBe('Exenta')` — y es lo que ha permitido que la divergencia sobreviva a la propia
   * reparación que la creó.
   */
  test('[H8] el panel dice «no sujeta», como el faqJsonLd', async ({
    page,
  }) => {
    await abrir(page);

    const respuesta =
      (await faqServida(page)).find(q => q.name.includes('plusvalía municipal al heredar'))
        ?.acceptedAnswer.text ?? '';
    expect(respuesta).toContain('no sujeción');

    await mover(page, 'valorAdq', 400000);
    await mover(page, 'valorRef', 300000);
    expect(await linea(page, IIVTNU, 'Cuota plusvalía municipal')).toBe('0,00 €');
    expect(
      await linea(page, IIVTNU, 'Método elegido'),
      'la pantalla tiene que decir lo mismo que el canal estructurado'
    ).toMatch(/no sujet/i);
  });
});

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * RE-INSPECCIÓN del 21/09/2026 — verificar que los NUEVE hallazgos del 14/09 (859,
 * 861-866 y los dos del propio fichero de tests) cerraron, y que ninguno se pasó de
 * frenada al lado contrario.
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Los tres casos de abajo están puestos en CATALUÑA a propósito: allí se cruzan a la vez
 * las tres piezas que el 14/09 estaban rotas —el tope del art. 17 de la Ley 19/2010, el
 * plazo de mantenimiento de 5 años de su art. 19 y la regularización que entra en el valor
 * de adquisición del IRPF— y es el régimen donde la app no puede caer de pie por casualidad:
 * tarifa propia, reducciones propias y bonificación por escala ponderada.
 *
 * Toda la aritmética viene de `data/fiscal` y de la Ley 19/2010 que ese módulo cita; ni una
 * cifra de memoria. Resuelta a mano ANTES de abrir el navegador, y las tres cuadran al
 * céntimo con lo que la app imprime.
 *
 * HALLAZGOS ABIERTOS de esta pasada: los cuatro `test.fail()` del final. Afirman lo que
 * DEBERÍA ocurrir, así que hoy fallan a propósito; al repararlos se les quita la marca y
 * quedan como regresión, igual que se hizo con los de las pasadas anteriores.
 */
test.describe('Simulador de heredar vivienda — re-inspección 21/09/2026', () => {
  /**
   * CASO 1 (NORMAL) — la cadena entera en CATALUÑA, con venta DENTRO del plazo de
   * mantenimiento. Es el caso que cierra a la vez el 859, el 861, el 863 y el 864.
   *
   * Hijo de 50 años (Grupo II, `reducKey` 'II'), Cataluña, vivienda habitual del padre
   * valorada en 600.000 €, comprada hace 14 años por 200.000 €, catastral del suelo
   * 120.000 € sobre 300.000 € de catastral total, y venta a los 3 años por 700.000 €.
   *
   * ISD (Cataluña: tarifa, reducciones y coeficientes propios):
   *   Masa hereditaria                                                600.000,00
   *   + Ajuar  PORC_AJUAR_DOMESTICO_IS = 3 % (art. 15 LISD)           +18.000,00
   *   = Base imponible                                                618.000,00
   *   − Parentesco  REDUCCIONES_PARENTESCO_CATALUNA_IS['II']         −100.000,00
   *   − Vivienda    mín(600.000 × 0,95 ; 500.000) — art. 17 Ley      −500.000,00
   *                 19/2010, REDUCCION_VIVIENDA_MAX_CATALUNA_IS
   *   = Base liquidable                                                18.000,00
   *   Cuota íntegra por TARIFA_CATALUNA_IS (primer tramo, hasta 50.000 al 7 %):
   *        0 + 18.000 × 7 % = 1.260,00 → «1260,00 €»
   *   × COEFICIENTES_CATALUNA_IS['II'][0] = 1,0000 → cuota tributaria 1.260,00
   *   − Bonificación del art. 58 bis: escala PONDERADA del Grupo II sobre la base
   *     IMPONIBLE (618.000), con los marginales de ESCALA_BONIF_CATALUNA_GRUPO_II_IS:
   *        100.000 × 60 % + 100.000 × 55 % + 100.000 × 50 % + 200.000 × 45 %
   *      + 118.000 × 40 % = 302.200 → 302.200 / 618.000 = 48,8997 % → «48,9%»
   *     1.260,00 × 0,488996… = 616,1359… → se redondea ANTES de restar → 616,14
   *   = Cuota ISD final 643,86 €
   *
   * ISD REGULARIZADO — se vende a los 3 años y el art. 19 de la Ley 19/2010 exige mantener
   * REDUCCION_VIVIENDA_ANIOS_MANTENIMIENTO_CATALUNA_IS = 5:
   *   Base liquidable sin la reducción de vivienda = 618.000 − 100.000 = 518.000,00
   *   Cuota íntegra (tramo hasta 800.000): 57.000 + (518.000 − 400.000) × 24 % = 85.320,00
   *   − Bonificación ponderada (el mismo 48,8997 % : la base IMPONIBLE no cambia)
   *        85.320,00 × 0,488996… = 41.721,2038… → 41.721,20
   *   = 43.598,80 · Regularización = 43.598,80 − 643,86 = 42.954,94 €
   *
   * Plusvalía municipal, tipo ORIENTATIVO del módulo (PLUSVALIA_MUNICIPAL_META, 25 %) —
   * RECALCULADA el 24/09/2026 con la tabla vigente del art. 107.4 TRLRHL (hallazgo 1559;
   * antes 0,10 y 0,16, de la tabla caducada del RDL 26/2021):
   *   HERENCIA — 14 años de tenencia del causante → coeficiente 0,09
   *     Objetivo = 120.000 × 0,09 × 0,25 = 2.700,00
   *     Real     = (600.000 − 200.000) × (120.000 / 300.000) × 0,25 = 40.000,00
   *     Menor → 2.700,00 €
   *   VENTA — 3 años → coeficiente 0,14
   *     Objetivo = 120.000 × 0,14 × 0,25 = 4.200,00
   *     Real     = (700.000 − 600.000) × 0,4 × 0,25 = 10.000,00 → menor 4.200,00 €
   *
   * IRPF de la venta:
   *   Valor de adquisición fiscal = 600.000 + (643,86 + 42.954,94) + 2.700 = 646.298,80
   *     — el ISD que se suma es el EFECTIVAMENTE pagado, complementaria incluida
   *       (art. 36 LIRPF, que remite al 35.1.b). Es la reparación del hallazgo 859, aquí
   *       medida en una comunidad distinta de la del acta.
   *   Valor de transmisión (art. 35.2 LIRPF) = 700.000 − 4.200 = 695.800,00
   *   Ganancia = 49.501,20
   *        6.000,00 × 19 % = 1.140,00
   *       43.501,20 × 21 % = 9.135,252
   *                          ─────────
   *                           10.275,252 → «10.275,25 €»
   *
   * TOTAL = 643,86 + 42.954,94 + 2.700,00 + 4.200,00 + 10.275,252 = 60.774,052
   * Porcentaje sobre la venta = 60.774,052 / 700.000 × 100 = 8,6820 → «8,68%»
   */
  test('CASO 1 (normal) — Cataluña, hijo, 600.000 € de vivienda habitual y venta a los 3 años', async ({
    page,
  }) => {
    await abrir(page);

    await page.selectOption('#parentescoSel', 'hijo');
    await page.selectOption('#ccaaSel', 'cataluna');
    await mover(page, 'edadHer', 50);
    await mover(page, 'anioAdq', ANIO - 14);
    await mover(page, 'valorAdq', 200000);
    await mover(page, 'valorRef', 600000);
    await mover(page, 'valorSuelo', 120000);
    await mover(page, 'valorCatastralTotal', 300000);
    await casilla(page, 'viviendaHabitual', true);
    await mover(page, 'aniosVenta', 3);
    await mover(page, 'valorVta', 700000);

    // ── 861: la etiqueta anuncia el tope que la app VA A APLICAR, no el estatal ──────
    const etiqueta = (await page.locator('label:has(#viviendaHabitual)').innerText()).replace(
      /\s+/g,
      ' '
    );
    expect(etiqueta).toContain(
      new Intl.NumberFormat('es-ES', { minimumFractionDigits: 2 }).format(
        REDUCCION_VIVIENDA_MAX_CATALUNA_IS
      )
    );

    // ── ISD ──────────────────────────────────────────────────────────────────────────
    expect(await linea(page, ISD, '+ Ajuar doméstico (3 % del caudal, art. 15 LISD)')).toBe(
      '+18.000,00 €'
    );
    expect(await linea(page, ISD, '= Base imponible')).toBe('618.000,00 €');
    // REDUCCIONES_PARENTESCO_CATALUNA_IS['II'] = 100.000 € (art. 2 Ley 19/2010)
    expect(await linea(page, ISD, '− Reducción parentesco')).toBe('−100.000,00 €');
    // Topada en REDUCCION_VIVIENDA_MAX_CATALUNA_IS = 500.000 € (art. 17 Ley 19/2010)
    expect(await linea(page, ISD, '− Reducción vivienda habitual (95%)')).toBe('−500.000,00 €');
    expect(await linea(page, ISD, '= Base liquidable')).toBe('18.000,00 €');
    expect(await linea(page, ISD, 'Cuota íntegra (tarifa)')).toBe('1260,00 €');
    expect(await linea(page, ISD, '× Coef. patrimonio (Grupo II)')).toBe('×1,0000');
    expect(await linea(page, ISD, '= Cuota tributaria')).toBe('1260,00 €');
    expect(await panel(page, ISD)).toContain('− Bonificación CCAA (48,9%) −616,14 €');
    expect(await linea(page, ISD, 'Cuota ISD final')).toBe('643,86 €');

    // ── 863 y 865: el aviso cita la norma catalana, con la unidad del plazo, y NO pone
    //     fecha límite a la complementaria (PLAZO_ISD cuenta desde el FALLECIMIENTO) ───
    const aviso = await panel(page, ISD);
    expect(aviso).toContain(
      `el art. 19 de la Ley 19/2010 de Cataluña exige mantenerla ${REDUCCION_VIVIENDA_ANIOS_MANTENIMIENTO_CATALUNA_IS} años`
    );
    expect(aviso).toContain('42.954,94 €');
    expect(aviso).not.toContain(`${PLAZO_ISD.mesesPresentacion} meses desde la venta`);
    // Y la coletilla de «otras comunidades» NO se imprime cuando la comunidad elegida ES
    // la que tiene plazo propio: sería contarle al usuario catalán que mire otra norma.
    expect(aviso).not.toContain('Otras comunidades fijan plazos de mantenimiento propios');

    // ── Plusvalía municipal de la herencia ───────────────────────────────────────────
    expect(await panel(page, IIVTNU)).toContain('14 años de tenencia');
    // Art. 107.4 vigente: 14 años → 0,09 · 120.000 × 0,09 × 25 % (hallazgo 1559)
    expect(await linea(page, IIVTNU, 'Coeficiente 14 años')).toBe('0,09');
    expect(await linea(page, IIVTNU, 'Método objetivo')).toBe('2700,00 €');
    expect(await linea(page, IIVTNU, 'Método real (suelo)')).toBe('40.000,00 €');
    expect(await linea(page, IIVTNU, 'Cuota plusvalía municipal')).toBe('2700,00 €');

    // ── IRPF: el 859, medido fuera de la comunidad del acta ──────────────────────────
    // Recalculado con la tabla vigente del art. 107.4 (hallazgo 1559), desarrollo arriba
    expect(
      await linea(page, IRPF, 'Valor adquisición fiscal*'),
      'el ISD de la complementaria es tributo inherente a la adquisición (art. 35.1.b LIRPF)'
    ).toBe('646.298,80 €');
    // IIVTNU de la venta: 3 años → 0,14 · 120.000 × 0,14 × 25 %
    expect(await panel(page, IRPF)).toContain('−4200,00 €');
    expect(await linea(page, IRPF, '= Valor de transmisión**')).toBe('695.800,00 €');
    expect(await linea(page, IRPF, 'Ganancia patrimonial')).toBe('49.501,20 €');
    expect(await linea(page, IRPF, 'Cuota IRPF venta')).toBe('10.275,25 €');

    // ── Total ────────────────────────────────────────────────────────────────────────
    const total = await bloqueTotal(page);
    expect(total).toContain(
      `+ ISD regularizado (venta antes de ${REDUCCION_VIVIENDA_ANIOS_MANTENIMIENTO_CATALUNA_IS} años) 42.954,94 €`
    );
    expect(total).toContain('+ Plusvalía municipal (venta) 4200,00 €');
    // 643,86 + 42.954,94 + 2.700,00 + 4.200,00 + 10.275,252 = 60.774,052 (hallazgo 1559)
    expect(total).toContain('= TOTAL 60.774,05 €');
    expect(total).toContain('8,68%');
    // Nunca formato US: el punto es el millar y la coma el decimal
    expect(total).not.toMatch(/60,774\.05/);
  });

  /**
   * CASO 2 (LÍMITE) — el canto EXACTO del tope catalán de la reducción por vivienda
   * habitual: REDUCCION_VIVIENDA_MAX_CATALUNA_IS = 500.000 € (art. 17 de la Ley 19/2010).
   *
   * El tope muerde cuando 95 % del valor supera los 500.000 €, o sea a partir de
   * 526.315,79 €. El deslizador va de 5.000 en 5.000, así que el borde se cerca por los dos
   * lados con la MISMA herencia: 525.000 € (95 % = 498.750 €, por debajo) y 530.000 €
   * (95 % = 503.500 €, topado). Es el mismo canto del CASO 2 del 10/09 —que cercaba el tope
   * ESTATAL entre 125.000 € y 130.000 €— trasladado al régimen donde el 14/09 la etiqueta
   * prometía un tope y la app aplicaba otro (hallazgo 861).
   *
   * Se elige ASCENDIENTE (Grupo II, `reducKey` 'II-ascendiente', 30.000 € en Cataluña)
   * porque con los 100.000 € del hijo la base liquidable se va a cero por los dos lados y el
   * borde dejaría de verse en la cuota. Edad 70 y venta a 0 años, para aislar el ISD.
   *
   * (a) 525.000 € — SIN tope:
   *     Base imponible 525.000 × 1,03                                540.750,00
   *     − Parentesco REDUCCIONES_PARENTESCO_CATALUNA_IS['II-ascendiente']  −30.000,00
   *     − Vivienda   525.000 × 0,95 = 498.750 (< 500.000)           −498.750,00
   *     = Base liquidable                                             12.000,00
   *     Cuota íntegra (primer tramo de TARIFA_CATALUNA_IS, 7 %) = 840,00 · × 1,0000
   *     Bonificación ponderada del Grupo II sobre 540.750:
   *        60.000 + 55.000 + 50.000 + 90.000 + 40.750 × 40 % = 271.300
   *        271.300 / 540.750 = 50,1711 % → «50,2%» · 840,00 × 0,501710… = 421,4368 → 421,44
   *     = Cuota ISD final 418,56 €
   *
   * (b) 530.000 € — TOPADO:
   *     Base imponible 530.000 × 1,03                                545.900,00
   *     − Parentesco                                                 −30.000,00
   *     − Vivienda   mín(503.500 ; 500.000)                         −500.000,00
   *     = Base liquidable                                             15.900,00
   *     Cuota íntegra = 15.900 × 7 % = 1.113,00 · × 1,0000
   *     Bonificación ponderada sobre 545.900:
   *        60.000 + 55.000 + 50.000 + 90.000 + 45.900 × 40 % = 273.360
   *        273.360 / 545.900 = 50,0751 % → «50,1%» · 1.113,00 × 0,500751… = 557,3358 → 557,34
   *     = Cuota ISD final 555,66 €
   *
   * El testigo del canto: 5.000 € más de valor solo añaden 1.250 € de reducción (498.750 →
   * 500.000) en vez de los 4.750 € que daría el 95 % sin tope.
   */
  test('CASO 2 (límite) — el tope catalán de 500.000 € del art. 17, por los dos lados', async ({
    page,
  }) => {
    await abrir(page);

    await page.selectOption('#parentescoSel', 'padre');
    await page.selectOption('#ccaaSel', 'cataluna');
    await mover(page, 'edadHer', 70);
    await mover(page, 'anioAdq', ANIO - 20);
    await mover(page, 'valorAdq', 200000);
    await mover(page, 'valorRef', 525000);
    await mover(page, 'valorSuelo', 100000);
    await mover(page, 'valorCatastralTotal', 250000);
    await casilla(page, 'viviendaHabitual', true);
    await mover(page, 'aniosVenta', 0);

    // ── (a) justo por debajo del tope: reduce el 95 % entero ─────────────────────────
    expect(await linea(page, ISD, '= Base imponible')).toBe('540.750,00 €');
    expect(await linea(page, ISD, '− Reducción parentesco')).toBe('−30.000,00 €');
    expect(await linea(page, ISD, '− Reducción vivienda habitual (95%)')).toBe('−498.750,00 €');
    expect(await linea(page, ISD, '= Base liquidable')).toBe('12.000,00 €');
    expect(await linea(page, ISD, 'Cuota íntegra (tarifa)')).toBe('840,00 €');
    expect(await linea(page, ISD, 'Cuota ISD final')).toBe('418,56 €');

    // ── (b) 5.000 € más: el tope del art. 17 muerde ──────────────────────────────────
    await mover(page, 'valorRef', 530000);
    expect(await linea(page, ISD, '= Base imponible')).toBe('545.900,00 €');
    expect(
      await linea(page, ISD, '− Reducción vivienda habitual (95%)'),
      'el 95 % de 530.000 son 503.500 €, y el art. 17 de la Ley 19/2010 lo capa en 500.000 €'
    ).toBe('−500.000,00 €');
    expect(await linea(page, ISD, '= Base liquidable')).toBe('15.900,00 €');
    expect(await linea(page, ISD, 'Cuota íntegra (tarifa)')).toBe('1113,00 €');
    expect(await linea(page, ISD, 'Cuota ISD final')).toBe('555,66 €');

    // Y la etiqueta sigue anunciando el tope catalán, no el estatal (hallazgo 861)
    const etiqueta = (await page.locator('label:has(#viviendaHabitual)').innerText()).replace(
      /\s+/g,
      ' '
    );
    expect(etiqueta).toContain('500.000,00');
    expect(etiqueta).not.toContain(
      new Intl.NumberFormat('es-ES', { minimumFractionDigits: 2 }).format(REDUCCION_VIVIENDA_MAX_IS)
    );
  });

  /**
   * CASO 3 (RECHAZO) — tres negativas encadenadas, y ninguna se cuela como resultado.
   *
   * Hermano (Grupo III) de 70 años en Cataluña que NO convivió con el causante, con la
   * casilla de vivienda habitual MARCADA, valor de referencia 300.000 €, comprada por el
   * causante hace 10 años por 350.000 € (más cara que el valor de referencia), y venta a
   * los 2 años por 280.000 €.
   *
   *   1. La reducción del art. 17 de la Ley 19/2010 se DENIEGA por falta de convivencia y
   *      se dice por qué, aunque la edad (70 ≥ EDAD_MIN_COLATERAL_VIVIENDA_IS) sí cumple.
   *   2. Sin reducción no puede haber complementaria: el aviso de mantenimiento NO sale,
   *      pese a que 2 < 5 años.
   *   3. Las DOS plusvalías municipales son de NO SUJECIÓN (art. 104.5 TRLRHL): no hay
   *      incremento ni en la herencia (300.000 < 350.000) ni en la venta (280.000 <
   *      300.000). La pantalla tiene que decir «no sujeta», no «exenta» (hallazgo 866).
   *   4. El IRPF se rechaza por pérdida patrimonial.
   *
   * ISD (Cataluña, Grupo III — fuera del art. 58 bis, así que NO hay bonificación):
   *   Base imponible 300.000 × 1,03                                  309.000,00
   *   − Parentesco  REDUCCIONES_PARENTESCO_CATALUNA_IS['III']         −8.000,00
   *   − Vivienda    denegada                                               0,00
   *   = Base liquidable                                              301.000,00
   *   Cuota íntegra por TARIFA_CATALUNA_IS (tramo hasta 400.000, arranca en 150.000):
   *        14.500 + (301.000 − 150.000) × 17 % = 14.500 + 25.670 = 40.170,00
   *   × COEFICIENTES_CATALUNA_IS['III'][0] = 1,5882 → 63.797,994 → «63.797,99 €»
   *   Sin bonificación → Cuota ISD final 63.797,99 €
   *
   * IRPF: valor de adquisición fiscal = 300.000 + 63.797,99 + 0 = 363.797,99
   *       valor de transmisión = 280.000 − 0 = 280.000 · Ganancia = −83.797,99 → cuota 0
   *
   * TOTAL = 63.797,99 € · 63.797,99 / 280.000 × 100 = 22,7850 → «22,78%»
   */
  test('CASO 3 (rechazo) — colateral catalán sin convivencia, IIVTNU no sujeto y pérdida', async ({
    page,
  }) => {
    await abrir(page);

    await page.selectOption('#parentescoSel', 'hermano');
    await page.selectOption('#ccaaSel', 'cataluna');
    await mover(page, 'edadHer', 70);
    await mover(page, 'anioAdq', ANIO - 10);
    await mover(page, 'valorAdq', 350000);
    await mover(page, 'valorRef', 300000);
    await mover(page, 'valorSuelo', 90000);
    await mover(page, 'valorCatastralTotal', 180000);
    await casilla(page, 'viviendaHabitual', true);
    await casilla(page, 'convivencia', false);
    await mover(page, 'aniosVenta', 2);
    await mover(page, 'valorVta', 280000);

    // 1. Se deniega y se dice por qué — con 70 años la edad NO es el motivo
    const panelISD = await panel(page, ISD);
    expect(panelISD).toContain(
      'No aplicable: pariente colateral que no convivió los 2 años anteriores'
    );
    expect(panelISD).not.toContain(`menor de ${EDAD_MIN_COLATERAL_VIVIENDA_IS} años`);
    expect(await linea(page, ISD, '= Base liquidable')).toBe('301.000,00 €');
    expect(await linea(page, ISD, 'Cuota íntegra (tarifa)')).toBe('40.170,00 €');
    expect(await linea(page, ISD, '× Coef. patrimonio (Grupo III)')).toBe('×1,5882');
    expect(await linea(page, ISD, 'Cuota ISD final')).toBe('63.797,99 €');

    // 2. Vender a los 2 años NO dispara la complementaria: no hay reducción que perder
    expect(panelISD).not.toContain('Pierdes la reducción');

    // 3. No sujeción, no exención (art. 104.5 TRLRHL) — hallazgo 866
    expect(await linea(page, IIVTNU, 'Método real (suelo)')).toBe('No sujeta (sin incremento)');
    expect(await linea(page, IIVTNU, 'Método elegido')).toMatch(/no sujet/i);
    expect(await linea(page, IIVTNU, 'Cuota plusvalía municipal')).toBe('0,00 €');
    expect(await panel(page, IIVTNU)).not.toContain('Exenta');

    // 4. Pérdida patrimonial: no hay cuota de IRPF
    expect(await linea(page, IRPF, 'Valor adquisición fiscal*')).toBe('363.797,99 €');
    expect(await linea(page, IRPF, 'Pérdida patrimonial')).toBe('−83.797,99 €');
    expect(await linea(page, IRPF, 'Cuota IRPF venta')).toBe('0,00 €');

    const total = await bloqueTotal(page);
    expect(total).not.toContain('ISD regularizado');
    expect(total).toContain('= TOTAL 63.797,99 €');
    expect(total).toContain('22,78%');
  });

  /**
   * ❌ ABIERTO 21/09/2026 (operativa, bajo) — el `test.fail()` afirma lo que DEBERÍA pasar.
   *
   * [21-A] El aviso de la complementaria salta aunque la reducción NO haya ahorrado nada,
   * y entonces manda ingresar 0,00 € «más intereses de demora».
   *
   * La condición del aviso es `isd.reduccionVivienda > 0`, no `regularizacionVivienda > 0`.
   * En las comunidades cuyo beneficio llega DESPUÉS de la reducción —Andalucía y Galicia,
   * con exención total por debajo de 1.000.000 € de base liquidable; Asturias, con sus
   * 300.000 € de reducción en base— quitar la reducción de vivienda no mueve la cuota: los
   * dos escenarios dan 0,00 €. El propio bloque total lo sabe y NO pinta la línea «+ ISD
   * regularizado» (va condicionada a `regularizacionVivienda > 0`), así que la pantalla se
   * contradice consigo misma: arriba un aviso en rojo que exige una autoliquidación
   * complementaria y abajo ningún importe que ingresar.
   *
   * Es la reparación del hallazgo 778 pasada de frenada al lado contrario: aquella añadió
   * el aviso porque la app sumaba a la vez una reducción y la venta que la anula, y ahora
   * avisa también cuando no hay nada que devolver.
   *
   * Caso medido: hijo de 50 años, Andalucía, 200.000 € de vivienda habitual, venta a los 3
   * años → «Cuota ISD final 0,00 €», el total sin línea de regularizado, y aun así «Hay que
   * presentar una autoliquidación complementaria e ingresar los 0,00 € … más intereses de
   * demora». Idéntico en Galicia y en Asturias.
   */
  test('[21-A] REPARADO 1178 — sin importe que regularizar, el aviso no exige una complementaria', async ({
    page,
  }) => {
    await abrir(page);

    await page.selectOption('#parentescoSel', 'hijo');
    await page.selectOption('#ccaaSel', 'andalucia');
    await mover(page, 'edadHer', 50);
    await mover(page, 'anioAdq', ANIO - 10);
    await mover(page, 'valorAdq', 100000);
    await mover(page, 'valorRef', 200000);
    await mover(page, 'valorSuelo', 50000);
    await mover(page, 'valorCatastralTotal', 100000);
    await casilla(page, 'viviendaHabitual', true);
    await mover(page, 'aniosVenta', 3);
    await mover(page, 'valorVta', 250000);

    // La reducción se aplica, pero la exención de Andalucía deja la cuota en cero con y sin
    // ella, así que no hay nada que regularizar — y el bloque total ya lo refleja
    expect(await linea(page, ISD, '− Reducción vivienda habitual (95%)')).toBe('−122.606,47 €');
    expect(await linea(page, ISD, 'Cuota ISD final')).toBe('0,00 €');
    expect(await bloqueTotal(page)).not.toContain('ISD regularizado');

    // Lo que el panel NO debería decir cuando no hay nada que ingresar
    expect(
      await panel(page, ISD),
      'sin importe que regularizar, el aviso no puede exigir una complementaria'
    ).not.toContain('Hay que presentar una autoliquidación complementaria');
  });

  /**
   * ✅ REPARADO el 21/09/2026 — se escribió con `test.fail()` afirmando lo que DEBERÍA
   * pasar, y al repararlo se le quitó la marca sin tocar ninguna aserción.
   *
   * [21-B] La tarjeta «Aprovecha la reducción de vivienda habitual» de Buenas prácticas
   * sigue anunciando el tope ESTATAL a secas: «la reducción del 95% (hasta 122.606,47 €)».
   *
   * Es la mitad sin reparar del hallazgo 861, que nombraba expresamente las dos superficies
   * —la etiqueta de la casilla y esta tarjeta—. La etiqueta se arregló el 15/09/2026
   * (`topeReduccionVivienda`, que mira la comunidad) y la tarjeta se quedó con
   * `REDUCCION_VIVIENDA_MAX_IS` escrito sin adjetivo, a seis líneas de la pregunta de la FAQ
   * que sí dice «El tope estatal es …/heredero (cada CCAA puede mejorarlo)».
   *
   * Basta con que diga «estatal», como su vecina: la tarjeta es texto fijo del bloque
   * educativo y no puede depender del selector, pero sí puede no prometer como universal un
   * tope que en Cataluña es cuatro veces mayor.
   */
  test('[21-B] REPARADO 1179 — la tarjeta de buenas prácticas rotula el tope como estatal', async ({
    page,
  }) => {
    await abrir(page);

    const tarjeta = await page.evaluate(() => {
      const s = [...document.querySelectorAll('strong')].find(e =>
        (e.textContent ?? '').includes('Aprovecha la reducción de vivienda habitual')
      );
      return (s?.parentElement?.textContent ?? '').replace(/\s+/g, ' ').trim();
    });
    expect(tarjeta, 'la tarjeta de buenas prácticas debe existir').not.toBe('');
    expect(tarjeta).toContain(
      new Intl.NumberFormat('es-ES', { minimumFractionDigits: 2 }).format(REDUCCION_VIVIENDA_MAX_IS)
    );

    expect(
      tarjeta,
      'un tope que no vale en todas las CCAA tiene que salir rotulado como estatal'
    ).toMatch(/estatal|cada CCAA|Cataluña/);
  });

  /**
   * ✅ REPARADO el 21/09/2026 — se escribió con `test.fail()` afirmando lo que DEBERÍA
   * pasar, y al repararlo se le quitó la marca sin tocar ninguna aserción.
   *
   * [21-C] La fila del IRPF de la tabla «Los tres impuestos en cadena» publica la fórmula
   * «(Valor venta − valor adquisición fiscal) × tramos», que es exactamente la que el
   * hallazgo 862 (reparado el 15/09) retiró del `faqJsonLd` por describir una ganancia que
   * el motor no calcula.
   *
   * Desde el hallazgo 779 la app resta del precio la plusvalía municipal de la VENTA
   * (art. 35.2 LIRPF) antes de comparar: su propio panel lo pinta en dos líneas, «− Plusvalía
   * municipal de la venta» y «= Valor de transmisión**», con la nota al pie que cita el
   * artículo. La tabla educativa se quedó en la versión anterior.
   *
   * Medido sobre el CASO 1 de arriba (cifras recalculadas el 24/09/2026 con la tabla vigente
   * del IIVTNU, hallazgo 1559): la app calcula 49.501,20 € de ganancia (695.800,00 −
   * 646.298,80) y la fórmula de la tabla daría 53.701,20 € (700.000 − 646.298,80): son
   * 498,80 × 21 % + 3.701,20 × 23 % = 956,02 € de IRPF de diferencia.
   */
  test('[21-C] REPARADO 1180 — la tabla educativa describe la ganancia que el motor calcula', async ({
    page,
  }) => {
    await abrir(page);

    const filaIRPF = await page.evaluate(() => {
      const tr = [...document.querySelectorAll('tr')].find(f =>
        (f.querySelector('td')?.textContent ?? '').includes('IRPF')
      );
      return (tr?.textContent ?? '').replace(/\s+/g, ' ').trim();
    });
    expect(filaIRPF, 'la fila del IRPF debe existir').not.toBe('');
    expect(filaIRPF).toContain('valor adquisición fiscal');

    expect(
      filaIRPF,
      'la app resta del precio la plusvalía municipal de la venta (art. 35.2 LIRPF): la fila tiene que decirlo'
    ).toMatch(/valor de transmisión|35\.2|plusvalía municipal de la venta/i);
  });

  /**
   * ✅ REPARADO el 21/09/2026 — se escribió con `test.fail()` afirmando lo que DEBERÍA
   * pasar, y al repararlo se le quitó la marca sin tocar ninguna aserción.
   *
   * [21-D] Las dos prórrogas de la tabla «Los tres impuestos en cadena» van SIN unidad, y
   * las dos construcciones no significan lo mismo:
   *
   *     ISD    → «Plazo 6 meses tras el fallecimiento (prorrogable otros 6)»
   *     IIVTNU → «Plazo 6 meses tras el fallecimiento (prorrogable hasta 12 a solicitud)»
   *
   * El «otros 6» del ISD es ADICIONAL (art. 68 RISD: otros seis meses) y el «hasta 12» del
   * IIVTNU es el TOTAL (art. 110.2.b TRLRHL: «seis meses prorrogables hasta un año»), que es
   * lo que `PLAZO_IIVTNU.mesesMaximoConProrroga` guarda. Sumados como si fueran del mismo
   * tipo salen 18 meses para el IIVTNU.
   *
   * Es el hallazgo 863 —el plazo escrito sin la unidad— reaparecido en la tabla educativa
   * después de repararse en el aviso del panel, y sobre plazos que también hay que cumplir.
   */
  test('[21-D] REPARADO 1181 — las dos prórrogas de la tabla llevan unidad y dicen de qué tipo son', async ({ page }) => {
    await abrir(page);

    const tabla = await page.evaluate(() => {
      const t = [...document.querySelectorAll('table')].find(x =>
        (x.textContent ?? '').includes('Plusvalía municipal (IIVTNU)')
      );
      return (t?.textContent ?? '').replace(/\s+/g, ' ').trim();
    });
    expect(tabla, 'la tabla de los tres impuestos debe existir').not.toBe('');
    expect(tabla).toContain(`Plazo ${PLAZO_ISD.mesesPresentacion} meses tras el fallecimiento`);

    expect(
      tabla,
      'una prórroga sin unidad se lee tan fácil en meses como en años, y las dos filas usan la misma forma para cosas distintas'
    ).toMatch(
      new RegExp(
        `prorrogable otros ${PLAZO_ISD.mesesProrroga} meses[\\s\\S]*prorrogable hasta ${PLAZO_IIVTNU.mesesMaximoConProrroga} meses`
      )
    );
  });
});

/* ────────────────────────────────────────────────────────────────────────────────────────────
 * REPARADO el 25/09/2026 (hallazgo 1615). La tenencia del IIVTNU se calculaba como «año actual
 * − año de adquisición», pero el art. 107.4 TRLRHL toma AÑOS COMPLETOS y, por debajo del año,
 * prorratea por MESES completos. Visto el 24/09/2026: compra en diciembre de 2016 → «10 años» y
 * 0,12 cuando eran 9 años completos y 0,15; compra en diciembre de 2025 → «1 año» y 0,15 entero
 * cuando eran 9 meses y 0,15 × 9/12 = 0,1125. La app pregunta ahora el mes.
 * Los casos se siembran en meses RELATIVOS a hoy para que no dependan del día de la ejecución.
 * ──────────────────────────────────────────────────────────────────────────────────────────── */
test.describe('Hallazgo 1615 · años completos y prorrateo por meses', () => {
  test('9 años y 11 meses cuentan como 9 años: coeficiente de 9, no de 10', async ({ page }) => {
    await abrir(page);
    const adq = haceMeses(9 * 12 + 11);
    await mover(page, 'anioAdq', adq.anio);
    await page.selectOption('#mesAdq', String(adq.mes));
    // Con el año solo, salvo en diciembre, «año actual − año» daba 10 (el defecto).
    const coef9 = COEFICIENTES_IIVTNU_2025.find((c) => c.anios === 9)!.coeficiente;
    expect(coef9).toBe(0.15); // tabla del art. 107.4 (RDL 8/2023)
    expect(await panel(page, IIVTNU)).toContain('9 años de tenencia');
    expect(await linea(page, IIVTNU, 'Coeficiente 9 años')).toBe('0,15');
    expect(await page.locator('label[for="anioAdq"]').innerText()).toContain('(9 años hasta hoy)');
  });

  test('9 meses completos prorratean: 0,15 × 9/12 = 0,1125', async ({ page }) => {
    await abrir(page);
    const adq = haceMeses(9);
    await mover(page, 'anioAdq', adq.anio);
    await page.selectOption('#mesAdq', String(adq.mes));
    expect(await panel(page, IIVTNU)).toContain('9 meses de tenencia');
    expect(await linea(page, IIVTNU, 'Coeficiente, menos de 1 año (prorrateado a 9 meses)')).toBe('0,1125');
  });

  test('con el mes de hoy y el año pasado son 12 meses: «1 año» y el coeficiente de 1 año entero', async ({ page }) => {
    await abrir(page);
    const adq = haceMeses(12);
    await mover(page, 'anioAdq', adq.anio);
    await page.selectOption('#mesAdq', String(adq.mes));
    const coef1 = COEFICIENTES_IIVTNU_2025.find((c) => c.anios === 1)!.coeficiente;
    expect(await panel(page, IIVTNU)).toContain('1 año de tenencia');
    expect(await linea(page, IIVTNU, 'Coeficiente 1 año')).toBe(
      new Intl.NumberFormat('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(coef1)
    );
  });
});
