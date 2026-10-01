import { test, expect, Page, Locator } from '@playwright/test';
import { esperarHidratacion, esperarValorEnReact } from './_hidratacion';
import { COSTAS_JUDICIALES_META } from '../../data/fiscal/costas-judiciales';

/**
 * Inspector — estimador-costas-judiciales (segmento fiscal, RIESGO 1 CRÍTICO)
 * Inspeccionada el 26/08/2026 · REPARADA el 26/08/2026 (hallazgos 414-421).
 * RE-INSPECCIONADA el 01/10/2026: casos 7 a 10 y los `test.fail()` del final (ver abajo).
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
 *
 * RE-INSPECCIÓN DEL 01/10/2026
 * ────────────────────────────
 *   Los ocho hallazgos del 26/08 siguen REPARADOS (casos 1 a 6 en verde). Lo nuevo se cotejó
 *   contra el texto consolidado del BOE leído en sesión, no contra la memoria:
 *     · RD 434/2024 (BOE-A-2024-8706): art. 1.4 del real decreto (tope de 75.000 €), arts. 2,
 *       3, 18.d, 24.1, 25 y 69.2 del arancel
 *     · Ley 10/2012 (BOE-A-2012-14301) arts. 4, 6.2 y 7, y el fallo de la STC 140/2016
 *       (BOE-A-2016-7905), que anuló TAMBIÉN las cuotas de instancia del contencioso
 *     · LEC (BOE-A-2000-323) arts. 23.2, 31.2, 250 y 394.3 · LJCA (BOE-A-1998-16718) arts. 23
 *       y 139.4 · LRJS (BOE-A-2011-15936) arts. 97.3 y 235
 *   Los honorarios de abogado y del perito NO son normativos: son las anclas de mercado que
 *   declara `motor.ts`, interpoladas linealmente; se usan aquí solo para cuadrar el total.
 *
 *   CASO 7 (normal) — verbal · empresa · 10.000 €
 *       abogado    anclas 6.000 (600/1.500) y 15.000 (1.000/3.000), t = 4/9 → 777,78 – 2.166,67
 *       procurador art. 2, escalón «hasta 12.000» → 356,99 (sin el 10 % del art. 18.d: no es ordinario)
 *       tasa       art. 7.1, verbal: 150 € (supera los 2.000 € de la exención del art. 4.1.c)
 *       IVA 21 %   sobre 1.134,77 y 2.523,66 → 238,30 – 529,97 (las tasas no lo llevan)
 *       total      1.523,07 – 3.203,62 · tercio del art. 394.3 → 3.333,33, por encima del abogado
 *
 *   CASO 8 (límite) — verbal · persona física · 15.000 € clavados y 15.000,01 TECLEADO
 *       art. 250.2 LEC: el verbal llega a las demandas «que no excedan» de 15.000 € → sin aviso
 *       procurador escalón «hasta 24.000» → 535,50 en los dos · tercio 5.000,00
 *       15.000,01 sí excede → aparece el aviso del ordinario
 *
 *   CASO 9 (rechazo) — campo vacío y «-0,01» tecleado carácter a carácter
 *       vacío → «como un número» · -0,01 → «mayor que 0» · ninguno pinta estimación
 *
 *   CASO 10 (móvil 390 px + tema oscuro) — verbal · física · «12.000,5» tecleado
 *       12.000,50 excede el escalón «hasta 12.000» → 535,50 (12.000 clavados → 356,99)
 *       tercio 4.000,17 · el desbordamiento horizontal va aparte, como ABIERTO
 *
 *   ABIERTOS (test.fail) — cada uno lleva su caso y su fuente en el comentario.
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
  // El `fill` puede perderse si React aún no ha hidratado: se comprueba el ESTADO de React,
  // no el DOM, que es justo lo que sí cambia cuando el evento se pierde (_hidratacion.ts).
  await esperarValorEnReact(page, '#cuantia', cuantia);
  await page.getByRole('button', { name: 'Estimar costas' }).click();
}

/** Como `estimar`, pero tecleando carácter a carácter: los estados intermedios («15000,») cuentan. */
async function teclearYEstimar(page: Page, cuantia: string): Promise<void> {
  const campo = page.locator('#cuantia');
  await campo.fill('');
  await campo.pressSequentially(cuantia, { delay: 20 });
  await esperarValorEnReact(page, '#cuantia', cuantia);
  await page.getByRole('button', { name: 'Estimar costas' }).click();
}

/** La tarjeta «Estimación de costes», que existe siempre (con o sin resultado). */
function tarjetaResultados(page: Page): Locator {
  return page.locator('h2', { hasText: 'Estimación de costes' }).locator('xpath=..');
}

/** El bloque «Si te condenan en costas», que solo existe con resultado. */
function bloqueCondena(page: Page): Locator {
  return page.locator('h3', { hasText: 'Si te condenan en costas' }).locator('xpath=..');
}

/** Contraste WCAG del texto de un elemento contra su fondo efectivo (capas rgba compuestas). */
async function contraste(locator: Locator): Promise<number> {
  return locator.evaluate((el) => {
    const parse = (c: string) => {
      const p = (c.match(/rgba?\(([^)]+)\)/)?.[1] ?? '0,0,0,0').split(',').map((s) => parseFloat(s));
      return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
    };
    type Rgba = ReturnType<typeof parse>;
    const sobre = (a: Rgba, b: Rgba): Rgba => ({
      r: a.r * a.a + b.r * (1 - a.a), g: a.g * a.a + b.g * (1 - a.a), b: a.b * a.a + b.b * (1 - a.a), a: 1,
    });
    const capas: Rgba[] = [];
    for (let n: Element | null = el; n; n = n.parentElement) {
      const c = parse(getComputedStyle(n).backgroundColor);
      if (c.a > 0) capas.push(c);
      if (c.a >= 1) break;
    }
    let fondo: Rgba = { r: 255, g: 255, b: 255, a: 1 };
    for (let i = capas.length - 1; i >= 0; i--) fondo = sobre(capas[i], fondo);
    const texto = sobre(parse(getComputedStyle(el).color), fondo);
    const lum = ({ r, g, b }: Rgba) => {
      const f = (v: number) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
      return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
    };
    const [l1, l2] = [lum(texto), lum(fondo)].sort((x, y) => y - x);
    return (l1 + 0.05) / (l2 + 0.05);
  });
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
  // Un clic en «Juicio verbal» antes de hidratar se pierde sin error: el input es el testigo.
  await esperarHidratacion(page, ['#cuantia']);
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

// ═════════════════════════════════════════════════════════════════════════════
// RE-INSPECCIÓN DEL 01/10/2026 — casos nuevos que hoy pasan
// ═════════════════════════════════════════════════════════════════════════════

test('CASO 7 (normal) · verbal, empresa, 10.000 €: tasa de 150 € e IVA solo sobre los profesionales', async ({ page }) => {
  await elegirProcedimiento(page, /Juicio verbal/);
  await elegirPersona(page, 'Empresa / persona jurídica');
  await estimar(page, '10000');

  // Abogado: anclas de MERCADO de motor.ts (6.000 → 600/1.500 · 15.000 → 1.000/3.000), t = 4/9.
  expect(await partida(page, 'Abogado')).toBe('777,78 € – 2166,67 €');
  // RD 434/2024, art. 2: «12.000,00 → 356,99». Sin el 10 % del art. 18.d, que es del ordinario.
  expect(await partida(page, 'Procurador')).toBe('356,99 €');
  // Ley 10/2012, art. 7.1: «Verbal y cambiario 150 €» (cuota de instancia civil NO anulada).
  expect(await partida(page, 'Tasas judiciales')).toBe('150,00 €');
  // 21 % (data/fiscal/iva.ts) sobre 1.134,77 y 2.523,66; la tasa queda fuera de la base.
  expect(await partida(page, 'IVA')).toBe('238,30 € – 529,97 €');
  expect(await totalEstimado(page)).toBe('1523,07 € – 3203,62 €');

  // Art. 394.3 LEC: 10.000 / 3 = 3.333,33 €, por encima del máximo del abogado (2.166,67).
  await expect(bloqueCondena(page)).toContainText('3333,33 €');
  await expect(bloqueCondena(page)).toContainText('no llega a aplicarse');
  expect(await notas(page)).toContain('ℹ️ Si tu empresa puede deducirse el IVA soportado, el coste real es la base sin IVA');
});

test('CASO 8 (límite) · 15.000 € clavados siguen siendo verbal; 15.000,01 tecleado ya no', async ({ page }) => {
  await elegirProcedimiento(page, /Juicio verbal/);
  await elegirPersona(page, 'Persona física');

  // Art. 250.2 LEC (LO 1/2025): demandas «cuya cuantía no exceda de quince mil euros».
  await estimar(page, '15000');
  expect(await partida(page, 'Abogado')).toBe('1000,00 € – 3000,00 €'); // ancla exacta
  expect(await partida(page, 'Procurador')).toBe('535,50 €'); // art. 2: «24.000,00 → 535,50»
  expect(await partida(page, 'Tasas judiciales')).toBe('Exento'); // art. 4.2.a
  await expect(bloqueCondena(page)).toContainText('5000,00 €'); // 15.000 / 3
  expect((await notas(page)).some(n => n.includes('sería un juicio ordinario'))).toBe(false);

  // Un céntimo más, tecleado con coma decimal: el campo admite el estado intermedio «15000,».
  await teclearYEstimar(page, '15000,01');
  expect(await partida(page, 'Procurador')).toBe('535,50 €');
  expect(await notas(page)).toContain('ℹ️ Con más de 15.000,00 € el procedimiento sería un juicio ordinario, no un verbal (art. 250.2 LEC)');
});

test('CASO 9 (rechazo) · campo vacío y «-0,01» tecleado se rechazan con su motivo', async ({ page }) => {
  await elegirProcedimiento(page, /Juicio verbal/);
  // Acotado a la clase del módulo: `getByRole('alert')` casaría también con el DisclaimerCard.
  const aviso = page.locator('p[class*="errorMsg"][role="alert"]');

  // Vacío: parseSpanishNumber('') es NaN → se pide un número, no se calcula sobre 0.
  await page.getByRole('button', { name: 'Estimar costas' }).click();
  await expect(aviso).toContainText('como un número');
  expect(await hayEstimacion(page)).toBe(false);

  // «-0,01»: número válido pero no positivo.
  await teclearYEstimar(page, '-0,01');
  await expect(aviso).toContainText('mayor que 0');
  expect(await hayEstimacion(page)).toBe(false);
  await expect(page.locator('#cuantia')).toHaveAttribute('aria-invalid', 'true');
});

test.describe('CASO 10 · móvil 390 px en tema oscuro', () => {
  test.use({
    viewport: { width: 390, height: 844 },
    userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  });

  test('el decimal tecleado cambia de escalón también en móvil y en oscuro', async ({ page }) => {
    // El tema se cambia con el botón real y se AFIRMA: sembrar `data-theme` lo pisa la hidratación.
    await page.getByRole('button', { name: /Cambiar a modo oscuro/i }).first().click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

    await elegirProcedimiento(page, /Juicio verbal/);
    await elegirPersona(page, 'Persona física');

    // RD 434/2024, art. 2: 12.000 «no excede» del escalón de 12.000 → 356,99.
    await teclearYEstimar(page, '12.000');
    expect(await partida(page, 'Procurador')).toBe('356,99 €');
    // 12.000,50 sí excede → escalón «hasta 24.000» → 535,50. Tercio: 12.000,5 / 3 = 4.000,17.
    await teclearYEstimar(page, '12.000,5');
    expect(await partida(page, 'Procurador')).toBe('535,50 €');
    await expect(bloqueCondena(page)).toContainText('4000,17 €');
  });

  test('ABIERTO · con resultado en pantalla, las tarjetas no se salen de los 390 px', async ({ page }) => {
    test.fail(true, 'ABIERTO, hallazgo: en móvil, al pintar el resultado las dos tarjetas se ensanchan a 432 px y se recortan');
    // `html` y `body` llevan overflow-x: hidden, así que `scrollWidth` da 390 y NO delata nada: lo
    // recortado simplemente no se ve. Se mide el borde derecho de cada tarjeta. Antes de estimar
    // acaban en x = 366; después, en x = 456 (66 px fuera): el «€» de las cifras del desglose y
    // el final de cada línea de «Si te condenan en costas» y «Notas» quedan cortados. La causa
    // medida: `.nota { display: flex }` sobre párrafos que mezclan texto y <strong>; cada trozo
    // es un elemento flexible y la suma de sus anchos mínimos ensancha la pista de la rejilla
    // (con `display: block` en esos párrafos vuelven a 366).
    await elegirProcedimiento(page, /Juicio verbal/);
    await estimar(page, '10000');
    await expect(page.locator('h3', { hasText: 'Desglose' })).toBeVisible();
    const bordes = await page.evaluate(() =>
      Array.from(document.querySelectorAll('[class*="mainContent"] > [class*="card"]')).map((c) =>
        Math.round(c.getBoundingClientRect().right),
      ),
    );
    expect(bordes).toHaveLength(2);
    for (const borde of bordes) expect(borde).toBeLessThanOrEqual(390);
  });
});

test('CASO 11 (vigilancia) · el año del JSON-LD y del DataReference sigue al de la vigencia del módulo', async ({ page }) => {
  // ABIERTO, hallazgo: `jsonLd.name` («… 2026») y `normativa` del DataReference («2025-2026»)
  // están escritos a mano, mientras el <title> lo deriva de COSTAS_JUDICIALES_META.vigencia
  // (b7ec248c). Hoy coinciden y este caso pasa; es el que se pondrá rojo el día que se re-selle
  // el módulo sin tocar metadata.ts ni page.tsx. `check:anio-titulo` no mira el JSON-LD.
  const anio = COSTAS_JUDICIALES_META.vigencia.slice(-4);
  await expect(page).toHaveTitle(new RegExp(`Estimador de Costas Judiciales ${anio}`));
  const nombres = await page.evaluate(() =>
    Array.from(document.querySelectorAll('script[type="application/ld+json"]'))
      .map((s) => JSON.parse(s.textContent || '{}'))
      .filter((j) => j['@type'] === 'WebApplication')
      .map((j) => String(j.name)),
  );
  expect(nombres).toEqual([`Estimador de Costas Judiciales ${anio}`]);
  await expect(page.locator('body')).toContainText(`Costas judiciales ${COSTAS_JUDICIALES_META.vigencia}`);
});

// ═════════════════════════════════════════════════════════════════════════════
// RE-INSPECCIÓN DEL 01/10/2026 — hallazgos ABIERTOS (test.fail)
// Cada caso afirma lo CORRECTO; cuando llegue la reparación se pondrá verde, Playwright
// avisará de que un `test.fail()` ha pasado y entonces se retira la marca.
// ═════════════════════════════════════════════════════════════════════════════

test('ABIERTO · contencioso, empresa, 30.000 €: no hay tasa de instancia que cobrar', async ({ page }) => {
  test.fail(true, 'ABIERTO, hallazgo: cobra 350 € de tasa en el contencioso ordinario, cuota anulada por la STC 140/2016');
  // Fallo 3.º de la STC 140/2016 (BOE-A-2016-7905): nulos los incisos «en el orden jurisdiccional
  // contencioso-administrativo: abreviado: 200 €; ordinario: 350 €; apelación…; casación…».
  // El texto consolidado de la Ley 10/2012 los marca en negrilla como anulados. El error está en
  // data/fiscal/costas-judiciales.ts (TASAS_JUDICIALES_CUOTA_FIJA.contencioso y su comentario
  // «las de instancia no se tocaron»), no solo en la app.
  await elegirProcedimiento(page, /Contencioso/);
  await elegirPersona(page, 'Empresa / persona jurídica');
  await estimar(page, '30000');
  expect(await partida(page, 'Procurador')).toBe('714,00 €'); // art. 69.1 → art. 2, «hasta 36.000»
  expect(await partida(page, 'Tasas judiciales')).toBe('Exento');
  // abogado 1.500 – 4.500 + procurador 714 = 2.214 – 5.214 · ×1,21 → 2.678,94 – 6.308,94
  expect(await totalEstimado(page)).toBe('2678,94 € – 6308,94 €');
});

test('ABIERTO · el FAQ (página y FAQPage) no anuncia la tasa anulada del contencioso', async ({ page }) => {
  test.fail(true, 'ABIERTO, hallazgo: «350 € en el contencioso ordinario» en el FAQ y en el JSON-LD');
  const faq = await page.evaluate(() =>
    Array.from(document.querySelectorAll('script[type="application/ld+json"]')).map((s) => s.textContent || '').join(' '),
  );
  expect(faq).not.toContain('350 € en el contencioso');
  await expect(page.locator('body')).not.toContainText('350 € en el contencioso');
});

test('ABIERTO · verbal de cuantía indeterminada: la empresa paga la tasa del verbal', async ({ page }) => {
  test.fail(true, 'ABIERTO, hallazgo: la cuantía indeterminada se pasa como 0 € y cae en la exención de los 2.000 €');
  // Ley 10/2012: la exención del art. 4.1.c es para el verbal «en reclamación de cantidad» que no
  // supere 2.000 €; lo indeterminado se valora en 18.000 € (art. 6.2). Cuota: art. 7.1, 150 €.
  await elegirProcedimiento(page, /Juicio verbal/);
  await elegirPersona(page, 'Empresa / persona jurídica');
  await page.getByRole('button', { name: 'Cuantía indeterminada' }).click();
  await page.getByRole('button', { name: 'Estimar costas' }).click();
  expect(await partida(page, 'Procurador')).toBe('351,00 €'); // art. 3 del arancel
  expect(await partida(page, 'Tasas judiciales')).toBe('150,00 €');
});

test('ABIERTO · monitorio de 5.000 €: la petición inicial no exige abogado ni procurador', async ({ page }) => {
  test.fail(true, 'ABIERTO, hallazgo: el monitorio por encima de 2.000 € trata abogado y procurador como preceptivos');
  // LEC arts. 23.2.1.º y 31.2.1.º: «y para la petición inicial de los procedimientos monitorios»,
  // SIN límite de cuantía (el de 2.000 € es solo del verbal). La propia nota de la app lo dice.
  await elegirProcedimiento(page, /Proceso monitorio/);
  await elegirPersona(page, 'Persona física');
  await estimar(page, '5000');
  // Anclas de mercado del monitorio: 2.000 → 200/500 · 6.000 → 400/1.000, t = 3/4 → máximo 875.
  expect(await partida(page, 'Abogado')).toBe('0,00 € – 875,00 €');
  expect(await partida(page, 'Procurador')).toBe('No requerido');
});

test('ABIERTO · laboral: el art. 394.3 LEC no rige en el orden social', async ({ page }) => {
  test.fail(true, 'ABIERTO, hallazgo: el bloque «Si te condenan en costas» aplica la LEC a laboral y contencioso');
  // LRJS: en instancia no hay condena en costas por vencimiento; solo la del art. 97.3 (mala fe
  // o temeridad, honorarios hasta 600 € y solo si el condenado es el empresario). El art. 235
  // regula las costas de los RECURSOS. Hoy la app promete un tope de 10.000,00 €.
  await elegirProcedimiento(page, /Procedimiento laboral/);
  await elegirPersona(page, 'Persona física');
  await estimar(page, '30000');
  await expect(tarjetaResultados(page)).toContainText('Coste total estimado');
  await expect(tarjetaResultados(page)).not.toContainText('art. 394.3 LEC limita');
});

test('ABIERTO · contencioso de cuantía indeterminada: el tope es el del art. 139.4 LJCA', async ({ page }) => {
  test.fail(true, 'ABIERTO, hallazgo: el bloque «Si te condenan en costas» aplica la LEC a laboral y contencioso');
  // LJCA art. 139.4: «una cantidad total que no exceda de la tercera parte»; lo indeterminado se
  // valora en 18.000 € (no en los 24.000 € del art. 394.3 LEC) → 18.000 / 3 = 6.000,00 €.
  await elegirProcedimiento(page, /Contencioso/);
  await elegirPersona(page, 'Persona física');
  await page.getByRole('button', { name: 'Cuantía indeterminada' }).click();
  await page.getByRole('button', { name: 'Estimar costas' }).click();
  await expect(bloqueCondena(page)).toContainText('6000,00 €');
});

test('ABIERTO · contencioso de cuantía indeterminada: el procurador tiene concepto propio', async ({ page }) => {
  test.fail(true, 'ABIERTO, hallazgo: el procurador del contencioso indeterminado sale del art. 3 y no del art. 69.2');
  // RD 434/2024, art. 69.2.a: 351,11 € ante los Juzgados de lo Contencioso (451,41 € TSJ/AN,
  // 401,27 € TS). El art. 3 (351,00 €) es supletorio: «en aquellos que no tengan fijado
  // expresamente un concepto especial».
  await elegirProcedimiento(page, /Contencioso/);
  await elegirPersona(page, 'Persona física');
  await page.getByRole('button', { name: 'Cuantía indeterminada' }).click();
  await page.getByRole('button', { name: 'Estimar costas' }).click();
  expect(await partida(page, 'Procurador')).toBe('351,11 €');
});

test('ABIERTO · verbal de 6.000 € con perito: el perito entra en el tercio', async ({ page }) => {
  test.fail(true, 'ABIERTO, hallazgo: el tope del tercio se compara solo con el abogado y deja fuera al perito');
  // Art. 394.3 LEC: «abogados y demás profesionales que no estén sujetos a tarifa o arancel»;
  // el perito no tiene arancel. Tope 6.000 / 3 = 2.000; abogado máx. 1.500 (ancla) + perito 600
  // (ancla de 15.000 €, que rige por debajo) = 2.100 > 2.000 → el tope sí muerde.
  await elegirProcedimiento(page, /Juicio verbal/);
  await elegirPersona(page, 'Persona física');
  await elegirPerito(page, true);
  await estimar(page, '6000');
  expect(await partida(page, 'Perito')).toBe('600,00 €');
  await expect(bloqueCondena(page)).toContainText('2000,00 €');
  await expect(bloqueCondena(page)).toContainText('sí muerde');
});

test('ABIERTO · verbal de 20.000 €: el aviso del ordinario debe salvar el verbal por materia', async ({ page }) => {
  test.fail(true, 'ABIERTO, hallazgo: «sería un juicio ordinario» sin la salvedad del art. 250.1 LEC');
  // Art. 250.1 LEC: desahucios, rentas impagadas, propiedad horizontal… van a verbal
  // «cualquiera que sea su cuantía». El aviso por cuantía solo vale para el art. 250.2.
  await elegirProcedimiento(page, /Juicio verbal/);
  await elegirPersona(page, 'Persona física');
  await estimar(page, '20000');
  const aviso = (await notas(page)).find(n => n.includes('juicio ordinario')) ?? '';
  expect(aviso).toContain('250.1');
});

test('ABIERTO · contraste del procedimiento elegido (texto de marca sobre fondo claro)', async ({ page }) => {
  test.fail(true, 'ABIERTO, hallazgo: texto de marca por debajo de 4,5:1 en el formulario y el resultado');
  // «Juicio ordinario» viene elegido de inicio: #2E86AB sobre rgba(46,134,171,0,07) → 3,78:1
  // (2,95:1 en oscuro). Es texto de 14 px en negrita: WCAG 1.4.3 pide 4,5:1. El token que
  // cumple es --primary-texto (#26718F, 5,47:1 sobre blanco).
  const elegido = page.locator('button[aria-pressed="true"] strong', { hasText: 'Juicio ordinario' });
  await expect(elegido).toBeVisible();
  expect(await contraste(elegido)).toBeGreaterThanOrEqual(4.5);
});

test('ABIERTO · el campo deshabilitado no cambia de fondo (--bg-secondary sin definir)', async ({ page }) => {
  test.fail(true, 'ABIERTO, hallazgo: .input:disabled usa var(--bg-secondary), que no existe');
  const campo = page.locator('#cuantia');
  const habilitado = await campo.evaluate((el) => getComputedStyle(el).backgroundColor);
  await page.getByRole('button', { name: 'Cuantía indeterminada' }).click();
  await expect(campo).toBeDisabled();
  const deshabilitado = await campo.evaluate((el) => getComputedStyle(el).backgroundColor);
  expect(deshabilitado).not.toBe(habilitado);
});

test('ABIERTO · el resultado se anuncia al lector de pantalla', async ({ page }) => {
  test.fail(true, 'ABIERTO, hallazgo: pulsar «Estimar costas» no anuncia nada; el foco se queda en el botón');
  await elegirProcedimiento(page, /Juicio verbal/);
  await estimar(page, '10000');
  await expect(page.locator('h3', { hasText: 'Desglose' })).toBeVisible();
  const anunciado = page
    .locator('[aria-live]:not(#__next-route-announcer__), [role="status"]')
    .filter({ hasText: 'Coste total estimado' });
  await expect(anunciado).toHaveCount(1, { timeout: 1000 });
});
