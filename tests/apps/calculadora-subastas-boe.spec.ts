/**
 * calculadora-subastas-boe — lo que PINTA la página frente a los casos a mano del motor
 * (tests/subastas-boe-motor.spec.ts). El motor ya está probado; aquí se comprueba el cableado:
 * que cada selector mueve el cálculo y que el total incompleto se dice EN el resultado, que es la
 * condición con la que el usuario aceptó hacer la app (22/10/2026).
 *
 * Estado: resultados en vivo (sin botón de calcular). Valores de partida: subasta judicial de
 * 2025, valor 200.000 €, puja 150.000 €, Madrid, sin valor de referencia ni partidas del inmueble.
 *
 * ── Inspector, primera inspección (17/11/2026) ─────────────────────────────────────────────────
 * Casos resueltos a mano ANTES de ejecutar la app. Datos normativos de data/fiscal/subastas.ts,
 * cotejados ese día en el BOE:
 *   · LEC tras la LO 1/2025 (BOE-A-2025-76, art. 22): art. 669.1 «el 20 por ciento del valor que se
 *     haya dado a los bienes» o «un mínimo de 1.000 euros» si el porcentaje queda por debajo;
 *     art. 670.1 «igual o superior al 70 por ciento», remate aprobado el día siguiente al cierre y
 *     resto en los veinte días siguientes al cierre; art. 670.3, mejora de tercero «igual o superior
 *     al 60 por ciento», sin mejora 50 % (40 % si satisface al ejecutante) y, si no, decide el letrado.
 *   · RGR consolidado (eli/es/rd/2005/07/29/939/con): art. 103 bis.1.b «Un depósito del 5 por ciento
 *     del tipo de subasta» (inmuebles); art. 101.4.f «en los 15 días siguientes a que le sea
 *     notificada la adjudicación»; art. 104.3 «puja mínima … será el 10 por ciento del tipo».
 *   · RGRSS consolidado (eli/es/rd/2004/06/11/1415/con): art. 120.2 «un depósito del 30 por ciento
 *     del tipo»; art. 120.3 posturas de viva voz «iguales o superiores al 75 por ciento»;
 *     art. 117.g, «cinco días hábiles».
 *   · ITP de Madrid: 6 % (TIPOS_ITP_CCAA_2025 de data/fiscal/inmuebles.ts) sobre el mayor entre el
 *     valor de referencia y la puja (art. 10.2 TRLITPAJD).
 *   · Registro: RD 1427/1989 nº 2.1 (escala de ARANCELES_REGISTRO, rebaja del 5 %) + nº 1 (6,010121)
 *     + nº 4 (3,005061), con IVA del 21 %. Sobre 180.000 €:
 *       24,040484 + 24.040,49×0,175 % + 30.050,60×0,125 % + 90.151,82×0,075 % + 29.746,97×0,03 %
 *       = 180,2125 → ×0,95 = 171,2019 → +9,015182 = 180,2171 → ×1,21 = 218,06 €.
 *     Sobre 900 €: 24,040484 ×0,95 = 22,8385 → +9,015182 = 31,8536 → ×1,21 = 38,54 €.
 *
 *   CASO N (normal): judicial desde la reforma, valor 250.000, puja 180.000, Madrid, general, valor
 *     de referencia 220.000, deudor particular, cargas 0, comunidad 0, IBI 0.
 *     → depósito 20 % = 50.000,00 € · resto 130.000,00 € en 20 días siguientes al cierre · puja del
 *       72,0 %, aprobación al día siguiente · ITP 6 % sobre 220.000 = 13.200,00 € · Registro 218,06 €
 *       · total COMPLETO 180.000 + 13.200 + 218,06 = 193.418,06 €.
 *   CASO L (límite): judicial «no lo sé», valor 4.000, puja 900.
 *     → 20 % = 800 < 1.000: depósito 1000,00 € (mínimo) · puja menor que el depósito (aviso) · resto
 *       recortado a 0,00 € · 22,5 % (por debajo del 40 %) · total incompleto «Al menos 938,54 €».
 *     Umbrales: 140.000 sobre 200.000 = 70 % justo → aprobación directa; Seguridad Social de viva voz,
 *     75.000 sobre 100.000 = 75 % → sin aviso; 74.000 → aviso con mínimo 75.000,00 €.
 *   CASO R (rechazo): valor «-200000» o puja «1.500.50» → «No se entiende ese importe…» en el campo y
 *     ningún resultado.
 *
 * Los test con test.fail() son HALLAZGOS ABIERTOS: el día que se reparen, fallarán por pasar y
 * habrá que quitarles el test.fail() (y cambiar ABIERTO por REPARADO).
 */

import { test, expect, type Page } from '@playwright/test';
import { esperarHidratacion, esperarValorEnReact } from './_hidratacion';
import { calcularRegistro } from '../../data/itp-ccaa';

const RUTA = '/calculadora-subastas-boe/';

/** «162.807,59 €» con el formato de la app, para buscarlo en la página. */
const euros = (n: number): RegExp =>
  new RegExp(
    n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: 'always' }).replace(/\./g, '\\.') +
      '\\s€'
  );

const resultados = (page: Page) => page.locator('section[aria-labelledby="titulo-resultados"]');
const datos = (page: Page) => page.locator('section[aria-labelledby="titulo-datos"]');

async function escribir(page: Page, etiqueta: string, valor: string): Promise<void> {
  const campo = page.getByLabel(etiqueta, { exact: false });
  await campo.fill(valor);
  await esperarValorEnReact(page, campo, valor);
}

/** Por el rótulo EXACTO del campo («Valor de subasta (€)»): sin ambigüedad entre campos. */
async function escribirExacto(page: Page, etiqueta: string, valor: string): Promise<void> {
  const campo = page.getByLabel(etiqueta, { exact: true });
  await campo.fill(valor);
  await esperarValorEnReact(page, campo, valor);
}

/** Las entradas del FAQPage del JSON-LD. */
async function faqJsonLd(page: Page): Promise<{ name: string; acceptedAnswer: { text: string } }[]> {
  for (const bloque of await page.locator('script[type="application/ld+json"]').allTextContents()) {
    const d = JSON.parse(bloque) as { '@type'?: string; mainEntity?: { name: string; acceptedAnswer: { text: string } }[] };
    if (d['@type'] === 'FAQPage' && d.mainEntity) return d.mainEntity;
  }
  throw new Error('La página no lleva FAQPage en su JSON-LD');
}

/** Las características del WebApplication del JSON-LD. */
async function featuresJsonLd(page: Page): Promise<string[]> {
  for (const bloque of await page.locator('script[type="application/ld+json"]').allTextContents()) {
    const d = JSON.parse(bloque) as { '@type'?: string; featureList?: string[] | string };
    if (d['@type'] === 'WebApplication') {
      return Array.isArray(d.featureList) ? d.featureList : String(d.featureList ?? '').split(/,\s*/);
    }
  }
  throw new Error('La página no lleva WebApplication en su JSON-LD');
}

test.beforeEach(async ({ page }) => {
  await page.goto(RUTA);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Calculadora de Subastas del BOE');
  // El testigo ha de ser un <input>: el rastreador de valor de React no existe en un <select>
  await esperarHidratacion(page, ['section[aria-labelledby="titulo-datos"] input']);
});

test('CASO 1 · de partida: depósito del 20 %, resto en 20 días y total INCOMPLETO con lo que falta', async ({ page }) => {
  const r = resultados(page);
  await expect(r).toContainText(euros(40000));
  await expect(r).toContainText(euros(110000));
  await expect(r).toContainText('20 días siguientes al cierre de la subasta');
  await expect(r).toContainText('Coste total: incompleto');
  await expect(r).toContainText('Al menos');
  for (const falta of ['Valor de referencia.', 'Cargas anteriores.', 'Deudas con la comunidad.', 'IBI pendiente.']) {
    await expect(r).toContainText(falta);
  }
  // Riesgo 1: el aviso crítico va desplegado, sin botón para plegarlo y ANTES de la herramienta,
  // como en el resto del clúster de compraventa (lo pidió el usuario el 23/10/2026)
  const disclaimer = page.getByRole('note', { name: 'Aviso importante' });
  await expect(disclaimer).toContainText('carácter exclusivamente orientativo');
  expect(await disclaimer.locator('button').count()).toBe(0);
  const yAviso = (await disclaimer.boundingBox())?.y ?? Infinity;
  const yHerramienta = (await page.locator('section[aria-labelledby="titulo-datos"]').boundingBox())?.y ?? -Infinity;
  expect(yAviso).toBeLessThan(yHerramienta);
  // Devolución del depósito y reserva de postura (art. 652 LEC; sugerencia de Alex, 23/10/2026)
  await expect(r).toContainText('Si no ganas, el Portal de Subastas lo devuelve en cuanto termina la subasta');
  await expect(r).toContainText('Reserva de postura');
});

test('CASO 1.bis · la app aparece en la puerta Vivienda de Delegum', async ({ page }) => {
  await expect(page.getByText('forma parte de', { exact: false }).first()).toContainText('Vivienda');
});

test('CASO 3.bis · Seguridad Social: el depósito se devuelve al acabar el acto y no hay reserva', async ({ page }) => {
  await page.getByRole('button', { name: /Seguridad Social/ }).click();
  const r = resultados(page);
  await expect(r).toContainText('la mesa lo devuelve al terminar el acto');
  await expect(r).toContainText('no prevé reserva de postura');
});

test('CASO 2 · con todo conocido: ITP sobre el valor de referencia y total completo', async ({ page }) => {
  await escribir(page, 'Valor de referencia del Catastro', '180000');
  await escribir(page, 'Cargas anteriores que asumes', '0');
  await escribir(page, 'Deudas con la comunidad de propietarios', '1200');
  await escribir(page, 'IBI pendiente', '600');

  const r = resultados(page);
  await expect(r).toContainText(euros(10800));
  await expect(r).toContainText('Sobre el valor de referencia');
  await expect(r).toContainText('Coste total de la compra');
  await expect(r).not.toContainText('incompleto');
  const registro = Math.round(calcularRegistro(150000, 'madrid') * 100) / 100;
  await expect(r).toContainText(euros(162600 + registro));
});

test('CASO 3 · Agencia Tributaria: 5 % del tipo y 15 días tras la notificación', async ({ page }) => {
  await page.getByRole('button', { name: /Agencia Tributaria/ }).click();
  await expect(page.getByRole('button', { name: /Agencia Tributaria/ })).toHaveAttribute('aria-pressed', 'true');
  const r = resultados(page);
  await expect(r).toContainText(euros(10000));
  await expect(r).toContainText('15 días siguientes a la notificación de la adjudicación');
  await expect(r).toContainText('queda disponible al cerrar el plazo de pujas');
  await expect(r).toContainText('igual o inferior a la más alta');
  await expect(page.locator('#select-inicio')).toHaveCount(0);
});

test('CASO 4 · procedimiento anterior a la reforma: 5 % y 40 días', async ({ page }) => {
  await page.locator('#select-inicio').selectOption('antes-reforma');
  const r = resultados(page);
  await expect(r).toContainText(euros(10000));
  await expect(r).toContainText('40 días');
});

test('CASO 5 · deudor empresa: el impuesto no lleva cifra y se manda al asesor', async ({ page }) => {
  await escribir(page, 'Valor de referencia del Catastro', '180000');
  await page.locator('#select-deudor').selectOption('empresa');
  const r = resultados(page);
  await expect(r).not.toContainText('ITP en la Comunidad de Madrid');
  await expect(r).toContainText('puede llevar IVA en lugar de ITP');
  await expect(r).not.toContainText(euros(10800));
});

test('CASO 6 · puja por debajo del 70 %: la vivienda no está asegurada', async ({ page }) => {
  await escribir(page, 'Lo que piensas pujar', '110000');
  const r = resultados(page);
  await expect(r).toContainText('Tu puja es el 55,0');
  await expect(r).toContainText('no tienes la');
  await expect(r).toContainText('al menos el 60');
});

// ───────────────────────────────────────────── Inspector, 17/11/2026: casos resueltos a mano

test.describe('Inspector 17/11/2026 · casos resueltos a mano', () => {
  test('CASO N · judicial nueva, 250.000 / 180.000 con valor de referencia 220.000: total completo 193.418,06 €', async ({ page }) => {
    await escribirExacto(page, 'Valor de subasta (€)', '250000');
    await escribirExacto(page, 'Lo que piensas pujar (€)', '180000');
    await escribirExacto(page, 'Valor de referencia del Catastro (€)', '220000');
    await escribirExacto(page, 'Cargas anteriores que asumes (€)', '0');
    await escribirExacto(page, 'Deudas con la comunidad de propietarios (€)', '0');
    await escribirExacto(page, 'IBI pendiente (€)', '0');

    const r = resultados(page);
    // Art. 669.1 LEC (LO 1/2025): 20 % de 250.000
    await expect(r).toContainText(/50\.000,00\s€/);
    await expect(r).toContainText(/El 20\s% del valor de subasta/);
    // Art. 670.1: 180.000 − 50.000, en los veinte días siguientes al cierre
    await expect(r).toContainText(/130\.000,00\s€/);
    await expect(r).toContainText('En 20 días siguientes al cierre de la subasta');
    // 180.000 / 250.000 = 72 % ≥ 70 %: aprobación el día siguiente al cierre
    await expect(r).toContainText(/Tu puja es el 72,0\s% del valor de subasta/);
    await expect(r).toContainText('al día siguiente del cierre');
    // ITP de Madrid, 6 % sobre el valor de referencia (mayor que la puja): 13.200
    await expect(r).toContainText(/13\.200,00\s€/);
    await expect(r).toContainText(/Sobre el valor de referencia \(220\.000,00\s€\)/);
    // Registro sobre 180.000, a mano en la cabecera: 218,06 €
    await expect(r).toContainText(/218,06\s€/);
    // 180.000 + 13.200 + 218,06, con las tres partidas a 0: completo
    await expect(r).toContainText('Coste total de la compra');
    await expect(r).toContainText(/193\.418,06\s€/);
    await expect(r).not.toContainText('incompleto');
  });

  test('CASO L · límite: depósito mínimo de 1.000 €, puja menor que el depósito y resto a cero', async ({ page }) => {
    await page.locator('#select-inicio').selectOption('no-lo-se');
    await escribirExacto(page, 'Valor de subasta (€)', '4000');
    await escribirExacto(page, 'Lo que piensas pujar (€)', '900');

    const r = resultados(page);
    // 20 % de 4.000 = 800, por debajo del mínimo de 1.000 € del art. 669.1 (cuatro cifras: sin punto)
    await expect(r).toContainText(/no llega al mínimo de 1000,00\s€/);
    await expect(r).toContainText('Como no sabes cuándo empezó el procedimiento');
    // 900 < 1.000: aviso de la app (acotado al panel: el anunciador de rutas de Next también es alert)
    await expect(r.getByRole('alert')).toContainText('Tu puja es menor que el depósito');
    // max(0, 900 − 1.000)
    await expect(r).toContainText(/Resto a pagar si ganas\s*0,00\s€/);
    // 900 / 4.000 = 22,5 %, por debajo del 40 %
    await expect(r).toContainText(/Tu puja es el 22,5\s%/);
    await expect(r).toContainText(/Por debajo del 40\s% es muy probable que no se apruebe/);
    // Sin valor de referencia: 900 + Registro 38,54 (a mano en la cabecera)
    await expect(r).toContainText(/Al menos 938,54\s€/);
  });

  test('CASO L · umbral del 70 % justo: aprobación directa (art. 670.1, «igual o superior»)', async ({ page }) => {
    await escribirExacto(page, 'Lo que piensas pujar (€)', '140000');
    const r = resultados(page);
    await expect(r).toContainText(/Tu puja es el 70,0\s% del valor de subasta\. Al llegar al 70\s%/);
    await expect(r).not.toContainText('no tienes la vivienda asegurada');
  });

  test('CASO L · Seguridad Social de viva voz: 75 % justo se admite y 74 % avisa (art. 120.3 RGRSS)', async ({ page }) => {
    await page.getByRole('button', { name: /Seguridad Social/ }).click();
    await page.locator('#select-modalidad').selectOption('en-el-acto');
    await escribirExacto(page, 'Tipo de subasta (€)', '100000');
    await escribirExacto(page, 'Lo que piensas pujar (€)', '75000');
    const r = resultados(page);
    // Art. 120.2: 30 % de 100.000; resto 45.000 en cinco días hábiles
    await expect(r).toContainText(/30\.000,00\s€/);
    await expect(r).toContainText(/45\.000,00\s€/);
    await expect(r).toContainText('5 días hábiles siguientes al de la adjudicación');
    await expect(r.getByRole('alert')).toHaveCount(0);

    await escribirExacto(page, 'Lo que piensas pujar (€)', '74000');
    await expect(r.getByRole('alert')).toContainText(/al menos el 75\s% del tipo \(75\.000,00\s€\)/);
  });

  test('CASO L · Agencia Tributaria por debajo de la puja mínima del 10 % (art. 104.3 RGR)', async ({ page }) => {
    await page.getByRole('button', { name: /Agencia Tributaria/ }).click();
    await escribirExacto(page, 'Tipo de subasta (€)', '100000');
    await escribirExacto(page, 'Lo que piensas pujar (€)', '9000');
    const r = resultados(page);
    // Art. 103 bis.1.b: 5 % de 100.000; resto 9.000 − 5.000 (cuatro cifras: sin punto)
    await expect(r).toContainText(/5000,00\s€/);
    await expect(r).toContainText(/4000,00\s€/);
    await expect(r.getByRole('alert')).toContainText(/puja mínima es el 10\s% del tipo \(10\.000,00\s€\)/);
  });

  test('CASO R · un importe ilegible o negativo se dice en el campo y no da resultado', async ({ page }) => {
    const r = resultados(page);
    await escribirExacto(page, 'Valor de subasta (€)', '-200000');
    await expect(datos(page).getByRole('alert')).toHaveText('No se entiende ese importe: escribe una cifra como 1.500 o 1500,50.');
    await expect(r).toContainText('Escribe el valor de subasta y lo que piensas pujar');
    await expect(r).not.toContainText('Depósito para pujar');

    await escribirExacto(page, 'Valor de subasta (€)', '200000');
    await escribirExacto(page, 'Lo que piensas pujar (€)', '1.500.50');
    await expect(datos(page).getByRole('alert')).toHaveText('No se entiende ese importe: escribe una cifra como 1.500 o 1500,50.');
    await expect(r).not.toContainText('Depósito para pujar');
  });

  // ─────────────────────────────────────────── HALLAZGOS REPARADOS el 17/11/2026

  test('REPARADO (hallazgo 4926) · el porcentaje de la puja no se redondea al otro lado del umbral', async ({ page }) => {
    // Antes: TramoJudicial pintaba pct(porcentaje, 1). Con 139.950 sobre 200.000 (69,975 %) decía
    // «Tu puja es el 70,0 % del valor de subasta. Por debajo del 70 %, aunque sea la mejor puja no
    // tienes la vivienda asegurada»; con 79.990 (39,995 %), «40,0 %» y «Por debajo del 40 % es muy
    // probable que no se apruebe». El 70 % del art. 670.1 es «igual o superior»: la cifra no puede
    // decir que se llega cuando el texto dice que no. Ahora se trunca a la décima: 69,9 y 39,9.
    const r = resultados(page);
    await escribirExacto(page, 'Lo que piensas pujar (€)', '139950');
    await expect(r).toContainText(/Por debajo del 70\s%/);
    await expect(r).not.toContainText(/Tu puja es el 70,0\s%/);
    await expect(r).toContainText(/Tu puja es el 69,9\s%/);
    await escribirExacto(page, 'Lo que piensas pujar (€)', '79990');
    await expect(r).toContainText(/Por debajo del 40\s% es muy probable/);
    await expect(r).not.toContainText(/Tu puja es el 40,0\s%/);
    await expect(r).toContainText(/Tu puja es el 39,9\s%/);
    // El umbral justo sigue diciendo 70,0 (140.000 / 200.000)
    await escribirExacto(page, 'Lo que piensas pujar (€)', '140000');
    await expect(r).toContainText(/Tu puja es el 70,0\s%/);
  });

  test('REPARADO (hallazgo 4927) · la FAQ del 70 % dice a qué procedimientos se aplica', async ({ page }) => {
    // Antes: la respuesta daba las reglas de la LO 1/2025 (tercero con al menos el 60 %, aprobación
    // al día siguiente del cierre) sin decir que valen para los procedimientos iniciados desde el
    // 03/04/2025. Para los anteriores la propia app dice otra cosa: tercero con «más del 70 %»,
    // adjudicación al acreedor y remate «sin más trámite». Ahora la respuesta da los dos regímenes.
    const faq = await faqJsonLd(page);
    const p = faq.find((f) => f.name.includes('no llega al 70'));
    expect(p, 'la pregunta del 70 %').toBeTruthy();
    expect(p!.acceptedAnswer.text).toMatch(/3 de abril de 2025|antes de la reforma|procedimientos anteriores|desde la reforma/);
    expect(p!.acceptedAnswer.text).toContain('sin más trámite');
    expect(p!.acceptedAnswer.text).toMatch(/más del 70\s%/);
  });

  test('REPARADO (hallazgo 4928) · los porcentajes escritos a mano en el JSON-LD llevan espacio duro', async ({ page }) => {
    // Antes: la pregunta «¿Qué pasa si mi puja no llega al 70 % del valor de subasta?» escribía el
    // 70 a mano (es UMBRALES_REMATE_JUDICIAL.aprobacionDirecta) y con espacio normal, y la feature
    // «Funciona 100 % en el navegador» también; el resto de la app usa U+00A0 (CLAUDE.md global §2).
    const preguntas = (await faqJsonLd(page)).map((f) => f.name).join(' ');
    const features = (await featuresJsonLd(page)).join(' ');
    expect(preguntas).not.toMatch(/\d %/);
    expect(features).not.toMatch(/\d %/);
    expect(preguntas).toContain('no llega al 70 %');
  });

  test('REPARADO (hallazgo 4929) · con la puja igual al valor de referencia no dice que lo «supera»', async ({ page }) => {
    // Antes: puja 150.000 y valor de referencia 150.000 → «Sobre tu puja, que supera el valor de
    // referencia». La cuota es la misma (6 % de 150.000 = 9000,00 €), pero no lo supera: lo iguala.
    await escribirExacto(page, 'Valor de referencia del Catastro (€)', '150000');
    const r = resultados(page);
    await expect(r).toContainText(/9000,00\s€/);
    await expect(r).not.toContainText('que supera el valor de referencia');
    await expect(r).toContainText('que iguala o supera el valor de referencia');
  });

  test('REPARADO (hallazgo 4930) · la cita del plazo de Hacienda es el art. 101.4.f del RGR', async ({ page }) => {
    // Antes: el plazo de 15 días está en la letra f) del APARTADO 4 del art. 101 RGR («En el Portal
    // de Subastas se recogerán los datos esenciales…», texto consolidado leído el 17/11/2026, y otra
    // vez al reparar); la app citaba «art. 101.f» (PLAZO_PAGO_SUBASTA.aeat.norma).
    await page.getByRole('button', { name: /Agencia Tributaria/ }).click();
    await expect(resultados(page)).toContainText(/art\. 101\.4\.f/);
  });

  test('REPARADO (hallazgo 4931) · las citas del resultado no anidan paréntesis dentro de paréntesis', async ({ page }) => {
    // Antes: «El 20 % del valor de subasta (art. 669.1 LEC (LO 1/2025)).» y «En 20 días siguientes
    // al cierre de la subasta (art. 670.1 LEC (LO 1/2025)).»: dentro de un paréntesis el inciso va
    // entre corchetes (Ortografía de la RAE, 2010). Ahora «(art. 669.1 LEC [LO 1/2025])».
    await expect(resultados(page)).toContainText('Depósito para pujar');
    const texto = await resultados(page).innerText();
    expect(texto).not.toMatch(/\([^()]*\([^()]*\)\)/);
    expect(texto).toContain('(art. 669.1 LEC [LO 1/2025])');
  });
});
