import { test, expect, type Page, type Locator } from '@playwright/test';
import { esperarPaginaAsentada } from './_hidratacion';

/**
 * Inspector — visualizador-anatomia-nomina (segmento CÁLCULO, riesgo 2; contenido de nómina,
 * Seguridad Social e IRPF tratado con el rigor del segmento fiscal)
 *
 * Historia del fichero:
 *  · 01/10/2026 — primera inspección. Venía con una sospecha con caso de una sesión anterior
 *    (base de cotización, plus de transporte, MEI, Guía de la empresa, contingencias comunes,
 *    redondeo del IRPF); cada punto se recalculó aquí desde la norma antes de mirar la app.
 *    Lo que hoy falla va con `test.fail()` y su comentario «ABIERTO, hallazgo: …».
 *  · 01/10/2026 — reparación de los hallazgos 2522-2532. Las cifras salen ahora de
 *    `app/visualizador-anatomia-nomina/motor.ts` (base × tipo, tipos de @/data/fiscal) y la
 *    nómina pasa a «Enero 2026»: es el año vigente y data/fiscal tiene para él todos los tipos
 *    que la página enseña (los de la empresa de 2025 no existen allí, y la Guía los usa). Los
 *    tests que dependen del año ya llevaban los esperados de 2026, resueltos a mano abajo.
 *    data/fiscal COTIZACIONES_SS_2025.mef ya vale 0,13 (corregido por el coordinador).
 *
 * La app es una nómina FICTICIA y fija (periodo «Enero 2026»), sin entradas. Sus casos son:
 *   A. sus cifras, recalculadas a mano desde sus propios devengos y la norma;
 *   B. su contenido normativo, contra data/fiscal y el BOE;
 *   C. operativa y accesibilidad (teclado, 390 px, tema oscuro, contraste).
 *
 * DE DÓNDE SALE CADA CIFRA — de la norma, NO de lo que muestra la app
 * ────────────────────────────────────────────────────────────────────
 *   · Devengos de la propia app: 2.142,86 + 85,00 + 72,00 + 120,00 = 2.419,86 €.
 *   · Base de cotización — art. 147.1 LGSS (BOE-A-2015-11724): «remuneración total […] que con
 *     carácter mensual tenga derecho a percibir», y «las percepciones de vencimiento superior
 *     al mensual se prorratearán a lo largo de los doce meses del año». Prorrata con el
 *     supuesto que escribe la propia app (dos extras iguales al salario base):
 *     2.142,86 × 2 / 12 = 357,143 → 357,14 €. El art. 147.2 dice que «únicamente» no computan,
 *     entre otros, las asignaciones de locomoción del trabajador «que se desplace fuera de su
 *     centro habitual de trabajo»: un plus de transporte AL centro de trabajo cotiza entero.
 *     → base CC = 2.419,86 + 357,14 = 2.777,00 €; base CP igual (no hay horas extra).
 *   · Tipos del trabajador — data/fiscal/irpf.ts, COTIZACIONES_SS_2025 y _2026 (iguales en
 *     ambos años): CC 4,70 %, desempleo 1,55 %, formación profesional 0,10 %.
 *     MEI — DT 43.ª LGSS (escala del RDL 2/2023): 2025 = 0,80 % (0,67 empresa / 0,13
 *     trabajador); 2026 = 0,90 % (0,75 / 0,15, también en COTIZACIONES_SS_2026 y
 *     COTIZACION_EMPRESA_2026); 2029 = 1,2 % (1,00 / 0,2).
 *     (data/fiscal llevaba COTIZACIONES_SS_2025.mef = 0.12, el tipo de 2024; corregido a 0,13
 *     el 01/10/2026.)
 *       CC   2.777,00 × 4,70 % = 130,519  → 130,52
 *       Des. 2.777,00 × 1,55 % =  43,0435 →  43,04
 *       FP   2.777,00 × 0,10 % =   2,777  →   2,78
 *       MEI  2.777,00 × 0,13 % =   3,6101 →   3,61   (2026: × 0,15 % = 4,1655 → 4,17)
 *   · IRPF — art. 82.5.º RIRPF (BOE-A-2007-6820): el importe de la retención es el tipo
 *     aplicado «a la cuantía total de las retribuciones que se satisfagan o abonen»:
 *     2.419,86 × 15,27 % = 369,5126 → 369,51 €.
 *   · Total deducciones (2025) 130,52 + 43,04 + 2,78 + 3,61 + 369,51 = 549,46 €
 *     → líquido 2.419,86 − 549,46 = 1.870,40 €.  (2026: 550,02 € → 1.869,84 €.)
 *   · Empresa 2026 — COTIZACION_EMPRESA_2026 (Orden PJC/297/2026): 23,60 + 5,50 + 0,20 + 0,60 +
 *     0,75 (MEI) = 30,65 % más AT/EP. Sobre 2.777,00 €: 655,37 + 152,74 + 5,55 + 16,66 + 20,83
 *     = 851,15 € (= 2.777,00 × 30,65 % = 851,1505).
 */

const RUTA = '/visualizador-anatomia-nomina/';

const limpiar = (s: string): string => s.replace(/[  ]/g, ' ').replace(/\s+/g, ' ').trim();

/** «− 2419,86 €» o «2.419,86 €» → 2419.86 (formato es-ES que pinta la propia app). */
function aEuros(texto: string): number {
  const m = limpiar(texto).match(/(\d{1,3}(?:\.\d{3})+|\d+),(\d{2})\s*€/);
  if (!m) throw new Error(`Sin importe en «${texto}»`);
  return Number(m[1].split('.').join('')) + Number(m[2]) / 100;
}

/** «Contingencias comunes (4,70%)» → 4.7 (admite el «%» pegado o con espacio duro). */
function aTipo(texto: string): number {
  const m = limpiar(texto).match(/\((\d+),(\d+)\s*%\)/);
  if (!m) throw new Error(`Sin tipo en «${texto}»`);
  return Number(m[1]) + Number(m[2]) / 10 ** m[2].length;
}

/** El botón de una línea de la nómina, por el principio de su nombre accesible. */
function linea(page: Page, concepto: string): Locator {
  return page.locator(`button[aria-label^="${concepto}"]`);
}

async function importe(page: Page, concepto: string): Promise<number> {
  return aEuros(await linea(page, concepto).locator('[class*="lineaImporte"]').innerText());
}

async function concepto(page: Page, principio: string): Promise<string> {
  return limpiar(await linea(page, principio).locator('[class*="lineaConcepto"]').innerText());
}

/** Despliega una línea y devuelve el texto de su explicación. */
async function explicacion(page: Page, principio: string): Promise<string> {
  const boton = linea(page, principio);
  if ((await boton.getAttribute('aria-expanded')) !== 'true') await boton.click();
  await expect(boton).toHaveAttribute('aria-expanded', 'true');
  const region = page.locator(`[role="region"][aria-label^="Explicación de ${principio}"]`);
  await expect(region).toBeVisible();
  return limpiar(await region.innerText());
}

/** Año del periodo de la nómina («Periodo: Enero 2025» → 2025). */
async function anioPeriodo(page: Page): Promise<number> {
  const t = limpiar(await page.getByText(/^Periodo: /).first().innerText());
  const m = t.match(/(20\d\d)/);
  if (!m) throw new Error(`Sin año en «${t}»`);
  return Number(m[1]);
}

/** MEI por año — DT 43.ª LGSS. Importe sobre la base correcta de 2.777,00 €. */
const MEI: Record<number, { trabajador: string; empresa: string; importe: number }> = {
  2025: { trabajador: '0,13', empresa: '0,67', importe: 3.61 },
  2026: { trabajador: '0,15', empresa: '0,75', importe: 4.17 },
};

async function abrirGuia(page: Page): Promise<string> {
  const boton = page.getByRole('button', { name: 'Ver guía educativa' });
  if ((await boton.getAttribute('aria-expanded')) !== 'true') await boton.click();
  const h3 = page.getByRole('heading', { level: 3, name: /Lo que tu empresa paga por ti/ });
  await expect(h3).toBeVisible();
  return limpiar(await page.locator('h3:has-text("Lo que tu empresa paga por ti") + p').innerText());
}

async function faq(page: Page, pregunta: RegExp): Promise<string> {
  const bloques = await page.locator('script[type="application/ld+json"]').allTextContents();
  for (const b of bloques) {
    const j = JSON.parse(b) as { '@type'?: string; mainEntity?: { name: string; acceptedAnswer: { text: string } }[] };
    if (j['@type'] !== 'FAQPage' || !j.mainEntity) continue;
    const q = j.mainEntity.find((e) => pregunta.test(e.name));
    if (q) return q.acceptedAnswer.text;
  }
  throw new Error(`Sin pregunta ${pregunta} en el FAQPage`);
}

/** Contraste WCAG del texto de `selector` contra su fondo compuesto (capas semitransparentes incluidas). */
async function contraste(page: Page, selector: string): Promise<number> {
  return page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (!el) throw new Error(`No existe ${sel}`);
    const parse = (c: string) => {
      const m = c.match(/rgba?\(([^)]+)\)/);
      if (!m) return null;
      const p = m[1].split(',').map((x) => parseFloat(x));
      return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
    };
    const lum = (c: { r: number; g: number; b: number }) => {
      const f = (v: number) => { const s = v / 255; return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4); };
      return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
    };
    const capas: { r: number; g: number; b: number; a: number }[] = [];
    let e: Element | null = el;
    while (e) {
      const c = parse(getComputedStyle(e).backgroundColor);
      if (c && c.a > 0) { capas.push(c); if (c.a >= 1) break; }
      e = e.parentElement;
    }
    let fondo = { r: 255, g: 255, b: 255 };
    if (capas.length && capas[capas.length - 1].a >= 1) { const u = capas.pop()!; fondo = { r: u.r, g: u.g, b: u.b }; }
    for (let i = capas.length - 1; i >= 0; i--) {
      const c = capas[i];
      fondo = { r: c.r * c.a + fondo.r * (1 - c.a), g: c.g * c.a + fondo.g * (1 - c.a), b: c.b * c.a + fondo.b * (1 - c.a) };
    }
    const texto = parse(getComputedStyle(el).color)!;
    const a = lum(texto), b = lum(fondo);
    return Math.round(((Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)) * 100) / 100;
  }, selector);
}

/** Lee hasta que la medida deja de moverse (la transición del cambio de tema da fotogramas intermedios). */
async function esperarEstable<T>(leer: () => Promise<T>): Promise<T> {
  let anterior = await leer();
  for (let intento = 0; intento < 30; intento++) {
    await new Promise((r) => setTimeout(r, 100));
    const actual = await leer();
    if (JSON.stringify(actual) === JSON.stringify(anterior)) return actual;
    anterior = actual;
  }
  return anterior;
}

/** Modo oscuro con el botón real, y afirmado (sembrar `data-theme` a mano pasa en falso). */
async function activarTemaOscuro(page: Page): Promise<void> {
  await page.getByRole('button', { name: /Cambiar a modo oscuro/i }).first().click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
}

test.beforeEach(async ({ page }) => {
  await page.goto(RUTA);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Anatomía de una Nómina');
  await esperarPaginaAsentada(page);
});

// ─── A. Cifras de la nómina ───────────────────────────────────────────────────

test.describe('A. Cifras de la nómina, recalculadas a mano', () => {
  test('A1 · el total devengado es la suma de los cuatro devengos (2.419,86 €) y el líquido es A − B', async ({ page }) => {
    // 2.142,86 + 85,00 + 72,00 + 120,00 = 2.419,86 € (devengos de la propia app)
    const devengos = await Promise.all(
      ['Salario base', 'Plus antigüedad', 'Plus transporte', 'Plus convenio'].map((c) => importe(page, c)),
    );
    expect(devengos.reduce((s, v) => s + v, 0)).toBeCloseTo(2419.86, 2);
    const totalA = aEuros(await page.locator('[class*="totalLinea"]').first().innerText());
    expect(totalA).toBeCloseTo(2419.86, 2);

    // B es la suma de las cinco deducciones que pinta, y el líquido A − B (aritmética interna)
    const deducciones = await Promise.all(
      ['Contingencias comunes', 'Desempleo', 'Formación profesional', 'MEI', 'Retención IRPF'].map((c) => importe(page, c)),
    );
    const totalB = aEuros(await page.locator('[class*="totalLinea"]').nth(1).innerText());
    expect(totalB).toBeCloseTo(deducciones.reduce((s, v) => s + v, 0), 2);
    const liquido = aEuros(await page.locator('[class*="liquidoResultado"]').innerText());
    expect(liquido).toBeCloseTo(totalA - totalB, 2);
  });

  test('A2 · base de cotización CC y CP = 2.777,00 € (devengos + prorrata de extras, art. 147 LGSS)', async ({ page }) => {
    // REPARADO (01/10/2026), hallazgo 2522: la base era el total devengado (2.419,86 €), sin la
    // prorrata de pagas extra (357,14 €) que exige el art. 147.1 LGSS. Ahora la calcula motor.ts.
    // 2.142,86 + 85 + 72 + 120 + 357,14 = 2.777,00 €. Defecto de 357,14 €: basta un decimal.
    expect(await importe(page, 'Base de cotización contingencias comunes')).toBeCloseTo(2777.0, 1);
    expect(await importe(page, 'Base cotización contingencias profesionales')).toBeCloseTo(2777.0, 1);
  });

  test('A3 · cotizaciones del trabajador sobre la base correcta: CC 130,52 · desempleo 43,04 · FP 2,78 · MEI del año', async ({ page }) => {
    // REPARADO (01/10/2026), hallazgos 2522 y 2524: las cuotas salían de la base errónea de
    // 2.419,86 € (CC 113,74 €) y el MEI con el tipo de 2024 (0,12 % → 2,90 €).
    const anio = await anioPeriodo(page);
    // Precisión de un decimal (±0,05 €): el defecto más pequeño que vigila es el del MEI, 0,71 €.
    expect(await importe(page, 'Contingencias comunes')).toBeCloseTo(130.52, 1);
    expect(await importe(page, 'Desempleo')).toBeCloseTo(43.04, 1);
    expect(await importe(page, 'Formación profesional')).toBeCloseTo(2.78, 1);
    expect(await importe(page, 'MEI')).toBeCloseTo(MEI[anio].importe, 1);
  });

  test('A4 · cada cuota de SS es la base CC mostrada × el tipo de su propia etiqueta, al céntimo', async ({ page }) => {
    // REPARADO (01/10/2026), hallazgos 2522 y 2525: las cuotas estaban tecleadas (113,74 € con
    // una base de 2.419,86 €, que da 113,73 €). Ahora son base × tipo importado de data/fiscal.
    const base = await importe(page, 'Base de cotización contingencias comunes');
    for (const c of ['Contingencias comunes', 'Desempleo', 'Formación profesional', 'MEI']) {
      const tipo = aTipo(await concepto(page, c));
      const esperado = Math.round(base * tipo) / 100;
      // Precisión 2 (±0,005 €): el defecto que vigila es de un céntimo.
      expect(await importe(page, c), `${c}: ${base} × ${tipo} %`).toBeCloseTo(esperado, 2);
    }
  });

  test('A5 · retención IRPF = 2.419,86 × 15,27 % = 369,51 € (art. 82.5.º RIRPF)', async ({ page }) => {
    // REPARADO (01/10/2026), hallazgo 2530: decía 369,54 € (3 céntimos de más). Ahora es
    // base × tipo, calculado.
    expect(aTipo(await concepto(page, 'Retención IRPF'))).toBeCloseTo(15.27, 2);
    expect(await importe(page, 'Base sujeta a retención IRPF')).toBeCloseTo(2419.86, 2);
    // Precisión 2 (±0,005 €): el defecto es de 0,03 €.
    expect(await importe(page, 'Retención IRPF')).toBeCloseTo(369.51, 2);
  });

  test('A6 · líquido a percibir del año del periodo (2025: 1.870,40 € · 2026: 1.869,84 €) con la base y los tipos correctos', async ({ page }) => {
    // REPARADO (01/10/2026), hallazgos 2522 y 2524: daba 1.893,75 € (23,35 € de más en 2025).
    const anio = await anioPeriodo(page);
    // 2025: 2.419,86 − 549,46 = 1.870,40 · 2026: 2.419,86 − 550,02 = 1.869,84
    const esperado: Record<number, number> = { 2025: 1870.4, 2026: 1869.84 };
    // Un decimal (±0,05 €): vigila el defecto de 23,35 €; el de 0,03 € del IRPF lo vigila A5.
    expect(aEuros(await page.locator('[class*="liquidoResultado"]').innerText())).toBeCloseTo(esperado[anio], 1);
  });
});

// ─── B. Contenido normativo ───────────────────────────────────────────────────

test.describe('B. Contenido normativo, contra data/fiscal y el BOE', () => {
  test('B1 · MEI: tipo del trabajador y de la empresa del año del periodo, y 0,20 % en 2029 (DT 43.ª LGSS)', async ({ page }) => {
    // REPARADO (01/10/2026), hallazgo 2524: la nómina de enero de 2025 llevaba los tipos de 2024
    // (0,12 % / 0,58 %) y decía «Para 2029 será del 0,17 %» (el de 2027). Ahora los tipos salen
    // de data/fiscal y 2029 dice 0,20 % del trabajador y 1,00 % de la empresa.
    const anio = await anioPeriodo(page);
    expect(await concepto(page, 'MEI')).toContain(`(${MEI[anio].trabajador}`);
    const texto = await explicacion(page, 'MEI');
    expect(texto).toMatch(new RegExp(`${MEI[anio].empresa}\\s*%`));
    expect(texto).toMatch(/2029[^.]*?0,20?\s*%/);
  });

  test('B2 · plus de transporte: no se presenta como exento de cotizar (art. 147.2 LGSS)', async ({ page }) => {
    // REPARADO (01/10/2026), hallazgo 2523: decía «NO salarial hasta ciertos límites
    // (actualmente ~0,26 €/km)» y la base lo restaba «(no cotiza)». El art. 147.2 LGSS solo
    // excluye la locomoción FUERA del centro habitual; los 0,26 €/km son la exención IRPF de
    // esa locomoción (art. 9.A.2 RIRPF).
    const transporte = await explicacion(page, 'Plus transporte');
    expect(transporte).not.toMatch(/0,26\s*€\/km/);
    expect(transporte).not.toMatch(/NO salarial hasta/i);
    const base = await explicacion(page, 'Base de cotización contingencias comunes');
    expect(base).not.toMatch(/transporte \(no cotiza\)/i);
    // Y lo positivo: el plus (72,00 €) aparece entre los sumandos de la base.
    expect(base).toMatch(/plus transporte \(72,00\)/);
  });

  test('B3 · contingencias comunes: la explicación nombra la jubilación', async ({ page }) => {
    // REPARADO (01/10/2026), hallazgo 2527: enumeraba «enfermedad común, accidente no laboral,
    // maternidad/paternidad e incapacidad temporal» y omitía la jubilación. El art. 152.1 LGSS
    // exime de cotizar «por contingencias comunes, salvo por incapacidad temporal» al alcanzar
    // la edad de jubilación.
    expect(await explicacion(page, 'Contingencias comunes')).toMatch(/jubilaci[oó]n/i);
  });

  test('B4 · Guía «Lo que tu empresa paga por ti»: incluye el MEI de la empresa', async ({ page }) => {
    // REPARADO (01/10/2026), hallazgo 2529: la lista (23,60 + AT + 5,50 + 0,20 + 0,60) omitía el
    // MEI de la empresa, 0,75 % en 2026 (data/fiscal COTIZACION_EMPRESA_2026.mei; Orden
    // PJC/297/2026, art. 16), y daba «~720 €» sobre 2.400 €. El ejemplo usa ahora la base de la
    // propia nómina: 2.777,00 × 30,65 % = 851,1505 → 851,15 € más AT (resuelto arriba).
    const guia = await abrirGuia(page);
    expect(guia).toMatch(/MEI|Equidad Intergeneracional/i);
    expect(guia).toMatch(/0,75\s*%/);
    expect(guia).toMatch(/30,65\s*%/);
    expect(guia).toContain('851,15');
  });

  test('B5 · los porcentajes llevan espacio duro antes del «%» (RAE 2010, norma del proyecto)', async ({ page }) => {
    // REPARADO (01/10/2026), hallazgo 2531: «(4,70%)», «23,60%», «30-33%»… iban pegados (10 en
    // pantalla con la Guía abierta). Ahora todos salen de formatPercentage, con U+00A0.
    await abrirGuia(page);
    const pegados = await page.evaluate(() => (document.body.innerText.match(/\d%/g) ?? []).length);
    const conEspacioNormal = await page.evaluate(() => (document.body.innerText.match(/\d %/g) ?? []).length);
    expect(pegados + conEspacioNormal).toBe(0);
    // Y en el FAQPage, que también los pegaba («~4,7%», «30-33%»).
    const bloques = (await page.locator('script[type="application/ld+json"]').allTextContents()).join(' ');
    expect(bloques.match(/\d ?%/g) ?? []).toEqual([]);
  });

  test('B6 · FAQPage: la retención es el tipo × la cuantía total de las retribuciones, y la calcula el pagador', async ({ page }) => {
    // REPARADO (01/10/2026), hallazgo 2526: decía que el porcentaje se aplica «sobre el salario
    // bruto menos las cotizaciones sociales» y que «lo calcula Hacienda». Art. 82 RIRPF: las
    // operaciones las hace el retenedor y el importe es el tipo «a la cuantía total de las
    // retribuciones» (82.5.º).
    const r = await faq(page, /retención del IRPF/);
    expect(r).not.toMatch(/bruto menos las cotizaciones/i);
    expect(r).not.toMatch(/lo calcula Hacienda/i);
    expect(r).toMatch(/lo calcula la empresa/i);
    expect(r).toMatch(/cuantía total/i);
    // El FAQPage nombra también el MEI entre las cotizaciones del trabajador (hallazgo 2529).
    expect(await faq(page, /neto es menor que el bruto/)).toMatch(/Equidad Intergeneracional 0,15\s*%/);
  });

  test('B7 · RD 723/2026: lo que afirma la Guía está en el BOE (BOE-A-2026-19200)', async ({ page }) => {
    // Cotejado el 01/10/2026 con el texto del BOE: entrada en vigor 05/10/2026 (DF 4.ª, veinte
    // días desde el 15/09/2026); art. 3.2.f (salario base y cada complemento por separado, con
    // periodicidad y método de pago; cálculo de los variables); art. 3.2.o (convenio con su
    // código); DT única (relaciones vigentes: a solicitud, treinta días hábiles, salvo que ya
    // obre en su poder); art. 2.2 (capítulo II solo para relaciones de más de cuatro semanas).
    await abrirGuia(page);
    const enlace = page.getByRole('link', { name: 'Real Decreto 723/2026' });
    await expect(enlace).toHaveAttribute('href', /BOE-A-2026-19200/);
    const bloque = limpiar(await page.locator('h3:has-text("Tu contrato debe decirte") ~ p').allInnerTexts().then((t) => t.join(' ')));
    expect(bloque).toContain('5 de octubre de 2026');
    expect(bloque).toContain('cada complemento salarial por separado');
    expect(bloque).toContain('30 días hábiles');
    expect(bloque).toContain('más de cuatro semanas');
  });
});

// ─── C. Operativa y accesibilidad ─────────────────────────────────────────────

test.describe('C. Operativa y accesibilidad', () => {
  test('C1 · las 12 líneas se despliegan con clic, solo una a la vez, y con teclado', async ({ page }) => {
    const lineas = page.locator('button[aria-label$="Pulsa para ver explicación."]');
    await expect(lineas).toHaveCount(12);
    for (let i = 0; i < 12; i++) {
      await lineas.nth(i).click();
      await expect(lineas.nth(i)).toHaveAttribute('aria-expanded', 'true');
      await expect(page.locator('button[aria-label$="Pulsa para ver explicación."][aria-expanded="true"]')).toHaveCount(1);
    }
    await lineas.nth(11).click();
    await expect(page.locator('[role="region"][aria-label^="Explicación de"]')).toHaveCount(0);

    // Teclado: foco visible, Enter abre y Espacio cierra
    await lineas.first().focus();
    await page.keyboard.press('Shift+Tab');
    await page.keyboard.press('Tab');
    const outline = await lineas.first().evaluate((b) => getComputedStyle(b).outlineStyle);
    expect(outline).not.toBe('none');
    await page.keyboard.press('Enter');
    await expect(lineas.first()).toHaveAttribute('aria-expanded', 'true');
    await page.keyboard.press('Space');
    await expect(lineas.first()).toHaveAttribute('aria-expanded', 'false');
  });

  test('C2 · tema oscuro: el contenedor y las líneas cambian de color', async ({ page }) => {
    await activarTemaOscuro(page);
    const leer = () =>
      page.evaluate(() => ({
        fondo: getComputedStyle(document.querySelector('[class*="nomina"]')!).backgroundColor,
        texto: getComputedStyle(document.querySelector('[class*="lineaConcepto"]')!).color,
      }));
    const colores = await esperarEstable(leer);
    // --bg-card #2A2A2A y --text-primary #E5E5E5 de la variante oscura del módulo
    expect(colores.fondo).toBe('rgb(42, 42, 42)');
    expect(colores.texto).toBe('rgb(229, 229, 229)');
  });

  test('C3 · importes de devengos y deducciones con contraste ≥ 4,5:1 en los dos temas', async ({ page }) => {
    // REPARADO (01/10/2026), hallazgo 2528: verde #27ae60 sobre blanco daba 2,87:1 y rojo #e74c3c
    // 3,82:1 (3,76:1 en oscuro), en texto de 14 px a peso 600. Ahora --verde/--rojo del módulo
    // tienen variante en cada tema.
    const leer = async () => ({
      devengo: await contraste(page, '[class*="linea_devengo"] [class*="lineaImporte"]'),
      deduccion: await contraste(page, '[class*="linea_deduccion"] [class*="lineaImporte"]'),
    });
    const claro = await esperarEstable(leer);
    await activarTemaOscuro(page);
    const oscuro = await esperarEstable(leer);
    expect(claro.devengo, 'devengo, claro').toBeGreaterThanOrEqual(4.5);
    expect(claro.deduccion, 'deducción, claro').toBeGreaterThanOrEqual(4.5);
    expect(oscuro.devengo, 'devengo, oscuro').toBeGreaterThanOrEqual(4.5);
    expect(oscuro.deduccion, 'deducción, oscuro').toBeGreaterThanOrEqual(4.5);
  });

  test('C4 · enlaces a las apps de sueldo neto con contraste ≥ 4,5:1 en los dos temas', async ({ page }) => {
    // REPARADO (01/10/2026), hallazgo 2532: --primary #2E86AB como texto de 14,4 px sobre #F5F5F5
    // daba 3,77:1, y sobre #333333 en oscuro 3,08:1. Ahora usa --primary-texto.
    const leer = () => contraste(page, '[class*="enlaceApp"] a');
    const claro = await esperarEstable(leer);
    await activarTemaOscuro(page);
    const oscuro = await esperarEstable(leer);
    expect(claro, 'enlace, claro').toBeGreaterThanOrEqual(4.5);
    expect(oscuro, 'enlace, oscuro').toBeGreaterThanOrEqual(4.5);
  });
});

test.describe('C. Móvil (390 px)', () => {
  test.use({
    viewport: { width: 390, height: 844 },
    userAgent:
      'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  });

  test('C5 · sin desplazamiento horizontal, líneas de al menos 24 px y se despliegan al tocar', async ({ page }) => {
    const dims = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
    expect(dims.sw).toBeLessThanOrEqual(dims.cw);
    const alturas = await page
      .locator('button[aria-label$="Pulsa para ver explicación."]')
      .evaluateAll((bs) => bs.map((b) => b.getBoundingClientRect().height));
    expect(alturas).toHaveLength(12);
    for (const h of alturas) expect(h).toBeGreaterThanOrEqual(24);
    const cc = linea(page, 'Contingencias comunes');
    await cc.tap();
    await expect(cc).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('[role="region"][aria-label^="Explicación de Contingencias comunes"]')).toBeVisible();
  });

  test('C6 · «Líquido total a percibir» con contraste ≥ 4,5:1 en móvil, en los dos temas', async ({ page }) => {
    // REPARADO (01/10/2026), hallazgo 2532: a 390 px baja a 16 px en negrita y deja de ser texto
    // grande; con --primary #2E86AB daba 4,11:1 en claro (3,50:1 en oscuro). Ahora usa
    // --primary-texto.
    const leer = () => contraste(page, '[class*="liquidoResultado"] span');
    const claro = await esperarEstable(leer);
    await activarTemaOscuro(page);
    const oscuro = await esperarEstable(leer);
    expect(claro, 'líquido, claro').toBeGreaterThanOrEqual(4.5);
    expect(oscuro, 'líquido, oscuro').toBeGreaterThanOrEqual(4.5);
  });
});
