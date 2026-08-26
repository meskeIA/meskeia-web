import { test, expect, Page } from '@playwright/test';

/**
 * Inspector — estimador-costas-judiciales (segmento cálculo, RIESGO 1 CRÍTICO)
 * Inspeccionada el 26/08/2026 · REPARADA el 26/08/2026 (hallazgos 414-421).
 *
 * Qué promete la app
 * ──────────────────
 *   <h1>  «Estimador de Costas Judiciales»
 *   sub.  «Cuánto puede costar un procedimiento judicial en España: abogado, procurador,
 *          tasas, peritos e IVA»
 *
 * De dónde sale cada cifra esperada
 * ─────────────────────────────────
 *   Ya NO de la propia app. El cálculo vive en `app/estimador-costas-judiciales/motor.ts`
 *   y los datos normativos en `data/fiscal/costas-judiciales.ts`, contrastados contra el
 *   texto consolidado del BOE el 26/08/2026:
 *     · RD 434/2024 (arancel de la Procura) arts. 1.4, 2, 3, 18.d y 24.1
 *     · Ley 10/2012 (tasas) arts. 4 y 7, con la nulidad de la STC 140/2016
 *     · LEC arts. 23.2.1.º, 31.2.1.º, 250.2 y 394.3, tras la LO 1/2025
 *     · Ley 37/1992 (IVA), tipo general del 21 % sobre servicios profesionales
 *
 *   La aritmética la cubre `tests/costas-judiciales-motor.spec.ts`, que corre sin navegador.
 *   Este fichero comprueba que lo que la app PINTA es lo que el motor calcula, y las cuatro
 *   cosas que solo se ven en la página: el desglose, el aviso del tercio, el rechazo audible
 *   y los grupos de botones con nombre accesible.
 *
 * Lo que la reparación descubrió y el acta NO recogía
 * ───────────────────────────────────────────────────
 *   Tres defectos normativos más graves que varios de los ocho hallazgos:
 *     · La app citaba el RD 1373/2003 como arancel del procurador. Está DEROGADO desde el
 *       02/05/2024 por el RD 434/2024, y sus cifras superaban el máximo legal vigente a
 *       partir de 60.000 € de cuantía (1.100 € frente a los 1.026,36 € del arancel).
 *     · Sumaba una cuota variable de tasa judicial del «0,10 % con tope 10.000 €». El
 *       art. 7.2 de la Ley 10/2012 fue declarado inconstitucional y NULO EN SU TOTALIDAD
 *       por la STC 140/2016, con efectos del 15/08/2016. Cobraba un tributo inexistente.
 *     · El umbral verbal/ordinario era 6.000 €. Desde el 03/04/2025 es 15.000 € (art. 250.2
 *       LEC, reformado por la LO 1/2025). El acta lo marcó como sospechoso; queda confirmado.
 *
 * Nota de formato: `formatCurrency` usa es-ES, que NO agrupa los millares de un número de
 * cuatro cifras (2.200 → «2200,00 €») y sí los de cinco o más (23.000 → «23.000,00 €»), y
 * separa la cifra del € con un espacio duro (U+00A0), que aquí se normaliza.
 *
 * CASOS (resueltos a mano ANTES de ejecutar la app)
 * ────────────────────────────────────────────────
 *   CASO 1 (normal) — ordinario · persona física · 30.000 €
 *       abogado    ancla exacta de la tabla de mercado → 1.500 – 4.500
 *       procurador escalón «hasta 36.000» = 714,00 · art. 18.d ×1,10 → 785,40
 *       tasas      persona física → 0 → «Exento»
 *       IVA 21 %   sobre 2.285,40 y 5.285,40 → 479,93 – 1109,93
 *       total      2.765,33 – 6.395,33
 *       con perito 800,00 (interpolado entre 600 a 15.000 € y 1.200 a 60.000 €)
 *
 *   CASO 2 (límite) — verbal · 2.000 € clavados
 *       abogado NO preceptivo (arts. 23.2.1.º y 31.2.1.º LEC) → mínimo 0, máximo 900
 *       tercio del art. 394.3 = 666,67 €, POR DEBAJO del máximo del abogado: muerde
 *       2.001 € cruza el umbral: abogado 400,05 – 900,15 y procurador 120,49
 *
 *   CASO 3 (continuidad) — 600.000 € frente a 600.001 €
 *       antes daba un salto del 61 % en el mínimo; ahora la diferencia es de céntimos
 *
 *   CASO 4 (rechazo) — «0», «-5000», «15000abc» y «10,500.00»
 *       los tres primeros se rechazan CON MENSAJE; el cuarto se lee como 10.500 €
 */

const RUTA = '/estimador-costas-judiciales/';

/** El formato de moneda es-ES separa la cifra del € con un espacio duro (U+00A0). */
const ESPACIO_DURO = new RegExp(String.fromCharCode(160), 'g');
const limpiar = (s: string) => s.replace(ESPACIO_DURO, ' ').replace(/\s+/g, ' ').trim();

/** «1.234,56 €» → 1234.56, para comparar importes sin depender del formato. */
function aNumero(importe: string): number {
  const limpio = limpiar(importe).replace(/[€\s]/g, '').replace(/\./g, '').replace(',', '.');
  return Number(limpio);
}

async function elegirProcedimiento(page: Page, etiqueta: RegExp): Promise<void> {
  await page.getByRole('button', { name: etiqueta }).first().click();
}

async function elegirPersona(page: Page, etiqueta: string): Promise<void> {
  await page.getByRole('button', { name: etiqueta, exact: true }).click();
}

async function elegirPerito(page: Page, necesita: boolean): Promise<void> {
  const grupo = page.getByRole('group', { name: '¿Necesitarás perito?' });
  await grupo.getByRole('button', { name: necesita ? 'Sí' : 'No', exact: true }).click();
}

async function estimar(page: Page, cuantia: string): Promise<void> {
  const campo = page.locator('#cuantia');
  await campo.fill(cuantia);
  // El `fill` puede perderse si React aún no ha hidratado: se declara y se reintenta.
  await expect(campo).toHaveValue(cuantia);
  await page.getByRole('button', { name: 'Estimar costas' }).click();
}

/** «Coste total estimado» — la horquilla que preside la tarjeta de resultados. */
async function totalEstimado(page: Page): Promise<string> {
  const total = page.locator('xpath=//*[starts-with(text(),"Coste total estimado")]/following-sibling::div[1]');
  await expect(total).toBeVisible();
  return limpiar(await total.innerText());
}

/** Importe de una fila del desglose («Abogado», «Procurador», «Tasas judiciales», «IVA»). */
async function partida(page: Page, nombre: string): Promise<string> {
  const fila = page
    .locator('h3', { hasText: 'Desglose' })
    .locator('xpath=following-sibling::div')
    .filter({ hasText: nombre });
  return limpiar(await fila.locator('strong').innerText());
}

async function notas(page: Page): Promise<string[]> {
  const parrafos = page.locator('h3', { hasText: 'Notas' }).locator('xpath=following-sibling::p');
  const salida: string[] = [];
  for (let i = 0; i < (await parrafos.count()); i++) {
    salida.push(limpiar(await parrafos.nth(i).innerText()));
  }
  return salida;
}

async function hayEstimacion(page: Page): Promise<boolean> {
  return (await page.locator('h3', { hasText: 'Desglose' }).count()) > 0;
}

/** Las dos partes de la horquilla «X – Y» del total. */
async function horquilla(page: Page): Promise<[number, number]> {
  const [min, max] = (await totalEstimado(page)).split('–');
  return [aNumero(min), aNumero(max)];
}

test.beforeEach(async ({ page }) => {
  await page.goto(RUTA);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Estimador de Costas Judiciales');
});

// ─────────────────────────────────────────────────────────────────────────────
test('CASO 1 (normal) · ordinario, persona física, 30.000 €: el desglose suma el total CON IVA', async ({ page }) => {
  // Riesgo 1: el disclaimer crítico va SIEMPRE desplegado y con role="alert".
  const disclaimer = page.locator('[role="alert"]').first();
  await expect(disclaimer).toContainText('carácter exclusivamente orientativo');
  await expect(disclaimer).toContainText('no constituye asesoramiento financiero, fiscal ni jurídico');
  expect(await disclaimer.locator('button').count()).toBe(0); // no colapsable

  // HALLAZGO 417 — la app declara de dónde salen sus cifras y cuándo se verificaron.
  await expect(page.locator('body')).toContainText('RD 434/2024');
  await expect(page.locator('body')).toContainText('26/08/2026');

  await elegirProcedimiento(page, /Juicio ordinario/);
  await elegirPersona(page, 'Persona física');
  await estimar(page, '30000');

  // abogado 1.500 – 4.500 · procurador 714,00 × 1,10 (art. 18.d) · tasas 0
  expect(await partida(page, 'Abogado')).toBe('1500,00 € – 4500,00 €');
  expect(await partida(page, 'Procurador')).toBe('785,40 €');
  expect(await partida(page, 'Tasas judiciales')).toBe('Exento');

  // HALLAZGO 414 — el IVA existe, se desglosa y entra en el total.
  expect(await partida(page, 'IVA')).toBe('479,93 € – 1109,93 €');
  expect(await totalEstimado(page)).toBe('2765,33 € – 6395,33 €');
  expect(await notas(page)).toContain('ℹ️ Las personas físicas están exentas de tasas judiciales desde 2015 (art. 4.2 Ley 10/2012)');

  // Con perito: interpolado a 800,00 € para 30.000 € de cuantía.
  await elegirPerito(page, true);
  expect(await hayEstimacion(page)).toBe(false); // cambiar un dato limpia el resultado anterior
  await estimar(page, '30000');
  expect(await partida(page, 'Perito')).toBe('800,00 €');
  // base 3.085,40 – 6.085,40 · IVA 647,93 – 1277,93 · total 3.733,33 – 7.363,33
  expect(await partida(page, 'IVA')).toBe('647,93 € – 1277,93 €');
  expect(await totalEstimado(page)).toBe('3733,33 € – 7363,33 €');

  // HALLAZGO 421 — los tres grupos de botones tienen nombre accesible.
  await expect(page.getByRole('group', { name: 'Tipo de procedimiento' })).toBeVisible();
  await expect(page.getByRole('group', { name: '¿Quién eres?' })).toBeVisible();
  await expect(page.getByRole('group', { name: '¿Necesitarás perito?' })).toBeVisible();

  // Lo que las reglas obligatorias exigen y ya se cumplía. Se recorre el DOM de la página
  // con `evaluate` y no con `page.locator('button')`: el localizador atraviesa el shadow
  // DOM y allí vive el overlay de `next dev`, cuyos botones no llevan `type` y no son de
  // la app. `getRootNode() !== document` es lo que los distingue.
  const sinType = await page.evaluate(() =>
    Array.from(document.querySelectorAll('button'))
      .filter(b => b.getRootNode() === document && !b.getAttribute('type'))
      .map(b => (b.textContent || '').slice(0, 40)),
  );
  expect(sinType).toEqual([]);
});

// ─────────────────────────────────────────────────────────────────────────────
test('CASO 2 (límite) · 2.000 € en verbal: abogado no preceptivo y el tercio del art. 394.3 LEC', async ({ page }) => {
  await elegirProcedimiento(page, /Juicio verbal/);
  await elegirPersona(page, 'Persona física');
  await estimar(page, '2000');

  // HALLAZGO 418 — hasta 2.000 € el abogado no es preceptivo: el mínimo es 0 €, no 400 €.
  expect(await partida(page, 'Abogado')).toBe('0,00 € – 900,00 €');
  await expect(page.locator('h3', { hasText: 'Desglose' }).locator('xpath=..')).toContainText('no preceptivo');
  expect(await partida(page, 'Procurador')).toBe('No requerido');
  // IVA sobre 0 – 900 → 0 – 189 · total 0 – 1.089
  expect(await partida(page, 'IVA')).toBe('0,00 € – 189,00 €');
  expect(await totalEstimado(page)).toBe('0,00 € – 1089,00 €');

  // HALLAZGO 415 — el tope del art. 394.3 LEC se calcula, se nombra y se dice si muerde.
  await expect(page.locator('body')).toContainText('art. 394.3 LEC');
  await expect(page.locator('body')).toContainText('tercio de la cuantía del proceso');
  await expect(page.locator('body')).toContainText('666,67');
  await expect(page.locator('body')).toContainText('aquí sí muerde');
  // Y los dos matices que la mera cita del tope se dejaría fuera:
  await expect(page.locator('body')).toContainText('temeridad');

  // ── 2.001 €: un euro cruza el umbral de los arts. 23.2 y 31.2 LEC ──
  await estimar(page, '2001');
  expect(await partida(page, 'Abogado')).toBe('400,05 € – 900,15 €');
  expect(await partida(page, 'Procurador')).toBe('120,49 €'); // escalón «hasta 2.400»
  expect(await notas(page)).toContain('ℹ️ Cuantía superior a 2000,00 €: procurador obligatorio en juicio verbal (art. 23.2 LEC)');

  // El umbral del verbal es 15.000 €, no 6.000: por encima, la app lo advierte.
  await estimar(page, '15001');
  expect((await notas(page)).some(n => n.includes('sería un juicio ordinario'))).toBe(true);
});

// ─────────────────────────────────────────────────────────────────────────────
test('CASO 3 (continuidad) · un euro de cuantía ya no dispara la estimación un 61 %', async ({ page }) => {
  await elegirProcedimiento(page, /Juicio ordinario/);
  await elegirPersona(page, 'Persona física');

  await estimar(page, '600000');
  const [minA, maxA] = await horquilla(page);
  expect(await partida(page, 'Abogado')).toBe('6000,00 € – 20.000,00 €');
  expect(await partida(page, 'Procurador')).toBe('2287,48 €'); // 2.079,53 × 1,10

  await estimar(page, '600001');
  const [minB, maxB] = await horquilla(page);

  // Antes: 9.000 – 23.000 € pasaba a 14.500 – 39.500 €. Ahora el único salto es el del
  // arancel del procurador, que es escalonado POR LEY (art. 2.2: 15,17 € por fracción).
  expect(minB - minA).toBeLessThan(25);
  expect(maxB - maxA).toBeLessThan(25);
  expect(minB).toBeGreaterThanOrEqual(minA);
});

// ─────────────────────────────────────────────────────────────────────────────
test('CASO 4 (rechazo) · lo que no es una cuantía se rechaza EN VOZ ALTA', async ({ page }) => {
  await elegirProcedimiento(page, /Juicio ordinario/);
  await elegirPersona(page, 'Persona física');

  // HALLAZGO 419 — el rechazo dice por qué, y lo dice en un role="alert" propio.
  // NO se cuentan los `[role="alert"]` de la página: el `__next-route-announcer__` de Next
  // también lo es y va vacío, así que `.last()` lo devolvería a él en vez del aviso de la
  // app. Se apunta por la clase del módulo CSS, que es lo único que identifica al mensaje.
  const aviso = page.locator('p[class*="errorMsg"][role="alert"]');
  await expect(aviso).toHaveCount(0);

  for (const invalida of ['0', '-5000']) {
    await estimar(page, invalida);
    expect(await hayEstimacion(page)).toBe(false);
    await expect(aviso).toHaveCount(1);
    await expect(aviso).toContainText('mayor que 0');
    await expect(page.locator('#cuantia')).toHaveAttribute('aria-invalid', 'true');
  }

  // HALLAZGO 416 — «15000abc» ya no cuela como 15.000 €: parseSpanishNumber da NaN.
  await estimar(page, '15000abc');
  expect(await hayEstimacion(page)).toBe(false);
  await expect(aviso).toContainText('como un número');

  // HALLAZGO 416 — con los dos separadores el último es el decimal: «10,500.00» = 10.500 €.
  await estimar(page, '10,500.00');
  const conSeparadores = await totalEstimado(page);
  await estimar(page, '10500');
  expect(await totalEstimado(page)).toBe(conSeparadores);
  await estimar(page, '10.500');
  expect(await totalEstimado(page)).toBe(conSeparadores);
});

// ─────────────────────────────────────────────────────────────────────────────
test('CASO 5 (cuantía indeterminada) · el supuesto que el art. 394.3 LEC resuelve', async ({ page }) => {
  // HALLAZGO 415, segunda mitad: la app no ofrecía este supuesto y ahora sí.
  await elegirProcedimiento(page, /Juicio ordinario/);
  await elegirPersona(page, 'Persona física');
  await page.getByRole('button', { name: 'Cuantía indeterminada' }).click();
  await expect(page.locator('#cuantia')).toBeDisabled();
  await page.getByRole('button', { name: 'Estimar costas' }).click();

  // Art. 3 RD 434/2024: 351,00 € · art. 18.d: ×1,10 en ordinario → 386,10 €
  expect(await partida(page, 'Procurador')).toBe('386,10 €');
  // Art. 394.3 LEC: la pretensión inestimable se valora en 24.000 € → tercio 8.000 €
  await expect(page.locator('body')).toContainText('8000,00');
  expect((await notas(page)).some(n => n.includes('Cuantía indeterminada'))).toBe(true);
});

// ─────────────────────────────────────────────────────────────────────────────
test('CASO 6 (tasas) · la persona jurídica paga la cuota fija, y solo la cuota fija', async ({ page }) => {
  await elegirProcedimiento(page, /Juicio ordinario/);
  await elegirPersona(page, 'Empresa / persona jurídica');

  // La cuota variable del art. 7.2 Ley 10/2012 es NULA desde la STC 140/2016: la tasa
  // no puede crecer con la cuantía. Antes, 1.000.000 € sumaban 1.000 € de variable.
  await estimar(page, '30000');
  expect(await partida(page, 'Tasas judiciales')).toBe('300,00 €');
  await estimar(page, '1000000');
  expect(await partida(page, 'Tasas judiciales')).toBe('300,00 €');

  // Y el IVA soportado por una empresa deducible se advierte, porque cambia su coste real.
  expect((await notas(page)).some(n => n.includes('deducirse el IVA'))).toBe(true);
});
