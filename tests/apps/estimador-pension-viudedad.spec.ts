import { test, expect, Page, Locator } from '@playwright/test';
import { RECLAMACION_PREVIA_SS } from '../../data/fiscal/pensiones';
import { esperarHidratacion, esperarValorEnReact, sembrarValor } from './_hidratacion';

/**
 * ESTIMADOR DE PENSIÓN DE VIUDEDAD — regresión del cálculo, del contenido y de la reclamación previa.
 *
 * ── QUÉ PROMETE (leído el 04/10/2026, primera inspección) ───────────────────────────────
 *   · <h1>: «Estimador Pensión de Viudedad»; subtítulo «Seguridad Social · Cuantía orientativa
 *     2026 · Porcentajes 52% / 60% / 70%».
 *   · <title>: «Estimador Pensión de Viudedad 2026 — Cuantía y requisitos SS». La metadata
 *     promete «porcentaje aplicable, base reguladora, pensión mínima garantizada y requisitos».
 *   · Resultado: pensión bruta mensual, «≈ X €/mes netos», desglose (base reguladora, porcentaje,
 *     pensión calculada, pensión mínima garantizada) y verificación de requisitos.
 *
 * ── DE DÓNDE SALE CADA CIFRA ─────────────────────────────────────────────────────────────
 *   · `PENSION_VIUDEDAD_2026` (data/fiscal/pensiones.ts): 52 / 60 / 70 %, divisor 28 de la base
 *     reguladora en activo, límite del 70 % = 916 €/mes (75 % del SMI redondeado), SMI 1.221 €/mes,
 *     pensión máxima 3.359,60 €/mes.
 *   · `MINIMOS_VIUDEDAD_2026` (Anexo I del RD 241/2026, BOE-A-2026-6977, €/año ÷ 14):
 *     con cargas 17.592,40 → 1.256,60 · ≥ 65 13.106,80 → 936,20 · 60-64 12.262,60 → 875,90 ·
 *     < 60 9.931,60 → 709,40 €/mes.
 *   · `TOPE_COMPLEMENTO_MINIMOS_2026`: el complemento a mínimos de una pensión causada desde el
 *     01/01/2013 no puede superar la PNC del año (art. 59.4 LGSS, art. 9.5 RD 241/2026):
 *     8.803,20 €/año ÷ 14 = 628,80 €/mes. Una viudedad que se estima HOY se causa en 2026.
 *   · `COMPLEMENTO_MINIMOS_LIMITES_2026.sinConyuge` = 9.442 €/año: por encima, el complemento
 *     se reduce por la regla diferencial del art. 9.2 RD 241/2026 (art. 59.1 LGSS).
 *   · IRPF: `calcularRendimientoNetoTrabajo` + `calcularCuotaIntegraGeneral` + `MINIMOS_IRPF_2025`
 *     (data/fiscal/irpf.ts). La pensión de viudedad es rendimiento del trabajo (art. 17.2.a LIRPF).
 *   · LGSS consolidada (BOE-A-2015-11724), leída en el BOE el 04/10/2026: art. 219.1 (500 días en
 *     los 5 años anteriores si el causante estaba en alta; 15 años si no) y art. 221 en la redacción
 *     de la Ley 21/2021 (la pareja de hecho ya NO tiene requisito de ingresos).
 *
 * ── LOS CASOS, RESUELTOS A MANO ANTES DE ABRIR EL NAVEGADOR ─────────────────────────────
 *   CASO 1 — normal. Activo · base media 2.100 €/mes · < 60 · sin cargas · ingresos 0.
 *     BR = 24 × 2.100 / 28 = 1.800,00 · 52 % → 936,00 > mínimo 709,40 → 936,00 €/mes; 13.104,00 €/año.
 *   CASO 2 — el tope NO muerde (control). Jubilado 600 · ≥ 65 · sin cargas · ingresos 0.
 *     60 % → 360,00; complemento 936,20 − 360,00 = 576,20 < 628,80 → 936,20 €/mes.
 *   CASO 3 — la máxima. Jubilado 7.000 · < 60 → 52 % = 3.640,00 > 3.359,60 → 3.359,60 €/mes.
 *   CASO 4 — rechazo. Pensión vacía, negativa o cero → aviso y ninguna cifra.
 *   CASO 5 — tope de la PNC con cargas (sospecha del 03/10). Activo · base 800 · < 60 · con
 *     cargas · ingresos 0. BR = 24 × 800 / 28 = 685,71 · 70 % → 480,00; íntegro 1.256,60 − 480,00
 *     = 776,60 > 628,80 → 480,00 + 628,80 = 1.108,80 €/mes. La app da 1.256,60.
 *   CASO 6 — tope de la PNC con 65 años o más. Jubilado 400 · ≥ 65 · ingresos 0. 60 % → 240,00;
 *     íntegro 696,20 > 628,80 → 868,80 €/mes. La app da 936,20.
 *   CASO 7 — prueba de rentas. Jubilado 1.000 · < 60 · ingresos 1.500 €/mes (≥ 18.000 €/año, se
 *     lea en 12 o en 14 pagas). 52 % → 520,00. Regla diferencial: (9.442 + 9.931,60) − (18.000 +
 *     7.280) < 0 → complemento 0 → 520,00 €/mes. La app da 709,40.
 *   CASO 8 — requisito de cotización con el causante en alta y 3 años cotizados: el art. 219.1
 *     pide 500 días en los 5 años anteriores, que 3 años pueden cubrir. No puede salir ❌.
 *   CASO 9 — el neto. Jubilado 2.061 · < 60 · ingresos 0 → 52 % = 1.071,72 €/mes = 15.004,08 €/año.
 *     Reducción art. 20 = 7.302 − 1,75 × (15.004,08 − 14.852) = 7.035,86; RN = 15.004,08 − 2.000
 *     − 7.035,86 = 5.968,22; cuota = (5.968,22 − 5.550) × 19 % = 79,46 €/año → neto 1.066,04 €/mes
 *     (1.071,72 si la retención fuese 0 por el límite excluyente). La app da 985,98 (un 8 % fijo
 *     desde 15.000 €), menos que los 1.071,20 que da a 2.060 €. Y con 2.000,00 €/mes brutos
 *     (jubilado 3.846,16): 28.000,04 €/año, RN 26.000,04, cuota 4.911,01 (17,54 %) → 1.649,20 €/mes;
 *     la app da 1.760,00 (12 % fijo).
 *
 * ── REPARADO el 04/10/2026 (hallazgos 2811-2822) ─────────────────────────────────────────
 *   Los CASOS 5-18 eran test.fail y pasan a tests normales: complemento con prueba de rentas
 *   y tope de la PNC, requisito de cotización del art. 219.1, neto con el IRPF de data/fiscal,
 *   FAQ y FAQPage desde MINIMOS_VIUDEDAD_2026, pareja de hecho sin requisito de ingresos,
 *   grupos con nombre, emojis fuera del nombre accesible, «52 %» y contrastes del resultado.
 *   La fila «Pensión mínima garantizada» pasa a «Cuantía mínima de viudedad» + «Complemento a
 *   mínimos»: la mínima NO está garantizada (art. 59.1 y 59.4 LGSS).
 *
 * ⚠️ `formatCurrency` (es-ES) no agrupa con cuatro cifras enteras: «1256,60 €», pero
 *    «13.104,00 €». El espacio antes del € es U+00A0: el texto se normaliza antes de comparar.
 *
 * ── RECLAMACIÓN PREVIA (05/09/2026) ──────────────────────────────────────────────────────
 * El último bloque cubre que el paso 5 de la guía lea el trámite de `RECLAMACION_PREVIA_SS`
 * (art. 71 LRJS + art. 30.2 Ley 39/2015) en vez de teclearlo: nació al reparar el hallazgo 605
 * en `verificador-complemento-brecha-genero`, donde la MISMA norma vivía en dos sitios.
 */

const RUTA = '/estimador-pension-viudedad/';

const ROTULO = {
  pension: 'Pensión mensual que cobraba el causante (€/mes)',
  base: 'Base de cotización media de los últimos 2 años (€/mes)',
  anios: 'Años cotizados totales del causante',
  ingresos: 'Ingresos propios del trabajo o actividad (€/mes)',
} as const;

/** El formato es-ES separa la cifra del € con espacio duro (U+00A0). */
const ESPACIO_DURO = new RegExp(String.fromCharCode(160), 'g');

function normalizar(texto: string): string {
  return texto.replace(ESPACIO_DURO, ' ').replace(/\s+/g, ' ').trim();
}

/** «1256,60 €» o «13.104,00 €/año» → número. */
function euros(texto: string): number {
  const m = normalizar(texto).match(/-?[\d.]+,\d{2}/);
  if (!m) throw new Error(`No hay importe en «${texto}»`);
  return Number(m[0].replace(/\./g, '').replace(',', '.'));
}

function campo(page: Page, rotulo: string): Locator {
  return page.getByRole('textbox', { name: rotulo, exact: true });
}

function panelResultado(page: Page): Locator {
  return page.getByRole('heading', { level: 2, name: 'Estimación orientativa' }).locator('xpath=..');
}

async function abrir(page: Page): Promise<void> {
  await page.goto(RUTA, { waitUntil: 'load' });
  // El primer input numérico de la página es el de la app; con él hidratado lo está el árbol.
  await esperarHidratacion(page, ['input[inputmode="decimal"]']);
}

interface Entrada {
  situacion?: 'activo' | 'jubilado';
  pension?: string;
  base?: string;
  anios?: string;
  edad?: '45' | '62' | '67';
  cargas?: boolean;
  ingresos?: string;
}

/** Rellena el formulario a partir del estado por defecto (jubilado · 1400 · 67 · sin cargas · 0). */
async function rellenar(page: Page, e: Entrada): Promise<void> {
  if (e.situacion === 'activo') await page.getByRole('button', { name: /Trabajando/ }).click();
  if (e.pension !== undefined) await sembrarValor(page, campo(page, ROTULO.pension), e.pension);
  if (e.base !== undefined) await sembrarValor(page, campo(page, ROTULO.base), e.base);
  if (e.anios !== undefined) await sembrarValor(page, campo(page, ROTULO.anios), e.anios);
  if (e.edad) await page.selectOption('#edad', e.edad);
  if (e.cargas !== undefined) {
    await page.getByRole('button', { name: e.cargas ? 'Sí' : 'No', exact: true }).click();
  }
  if (e.ingresos !== undefined) await sembrarValor(page, campo(page, ROTULO.ingresos), e.ingresos);
}

async function calcular(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Calcular pensión de viudedad' }).click();
  await expect(panelResultado(page)).toContainText('Desglose del cálculo');
}

async function pensionFinal(page: Page): Promise<number> {
  return euros(await page.locator('[class*="pensionImporte"]').innerText());
}

async function neto(page: Page): Promise<number> {
  const texto = normalizar(await page.locator('[class*="pensionNeta"]').innerText());
  const m = texto.match(/≈ ([\d.]+,\d{2}) €\/mes netos/);
  if (!m) throw new Error(`Sin neto en «${texto}»`);
  return euros(m[1]);
}

/** Euros de una línea del desglose: «Pensión calculada 480,00 €/mes». */
async function lineaDesglose(page: Page, etiqueta: string): Promise<number> {
  const texto = normalizar(await panelResultado(page).innerText());
  const m = texto.match(new RegExp(`${etiqueta} ([\\d.]+,\\d{2}) €/mes`));
  if (!m) throw new Error(`No aparece «${etiqueta}» en:\n${texto}`);
  return euros(m[1]);
}

test.describe('Estimador de pensión de viudedad — cálculo', () => {
  test('CASO 1 — activo, base 2.100 €, < 60 sin cargas: 52 % de 1.800,00 = 936,00 €/mes', async ({ page }) => {
    await abrir(page);
    await rellenar(page, { situacion: 'activo', base: '2100', edad: '45', ingresos: '0' });
    await calcular(page);

    // BR = 24 × 2.100 / PENSION_VIUDEDAD_2026.divisorBaseReguladora (28)
    expect(await lineaDesglose(page, 'Base reguladora')).toBeCloseTo(1800, 2);
    // PENSION_VIUDEDAD_2026.porcentajeGeneral = 52
    expect(normalizar(await panelResultado(page).innerText())).toContain('Porcentaje aplicado 52');
    expect(await lineaDesglose(page, 'Pensión calculada')).toBeCloseTo(936, 2);
    // MINIMOS_VIUDEDAD_2026.menor60 = 9.931,60 / 14
    expect(await lineaDesglose(page, 'Cuantía mínima de viudedad')).toBeCloseTo(709.4, 2);
    // La pensión ya pasa del mínimo: no hay complemento.
    expect(await lineaDesglose(page, 'Complemento a mínimos')).toBeCloseTo(0, 2);
    expect(await pensionFinal(page)).toBeCloseTo(936, 2);
    // 936,00 × 14 pagas
    await expect(page.locator('[class*="pensionNeta"]')).toContainText('13.104,00');
  });

  test('CASO 2 — control: ≥ 65 con pensión calculada de 360 €, el complemento (576,20) cabe bajo el tope', async ({ page }) => {
    await abrir(page);
    await rellenar(page, { pension: '600', edad: '67', cargas: false, ingresos: '0' });
    await calcular(page);

    // PENSION_VIUDEDAD_2026.porcentaje60: 600 × 60 % = 360,00
    expect(await lineaDesglose(page, 'Pensión calculada')).toBeCloseTo(360, 2);
    // MINIMOS_VIUDEDAD_2026.desde65oDiscapacidad65 = 13.106,80 / 14 = 936,20; 576,20 < 628,80
    expect(await pensionFinal(page)).toBeCloseTo(936.2, 2);
  });

  test('CASO 3 — la máxima: 52 % de 7.000 = 3.640 se queda en 3.359,60 €/mes', async ({ page }) => {
    await abrir(page);
    await rellenar(page, { pension: '7000', edad: '45', ingresos: '0' });
    await calcular(page);

    expect(await lineaDesglose(page, 'Pensión calculada')).toBeCloseTo(3640, 2);
    // PENSION_VIUDEDAD_2026.pensionMaxima = 3.359,60 (= LIMITES_PENSION_2025.maximaMensual)
    expect(await pensionFinal(page)).toBeCloseTo(3359.6, 2);
    await expect(panelResultado(page)).toContainText('Se aplica la pensión máxima');
  });

  test('CASO 4 — sin pensión, con una negativa o con cero no hay cifra', async ({ page }) => {
    await abrir(page);
    // El anunciador de rutas de Next y el DisclaimerCard también tienen role="alert": se acota.
    const aviso = page.getByRole('alert').filter({ hasText: 'Introduce la base reguladora' });

    // Se parte de «1400» (por defecto), así que cada siembra CAMBIA el estado.
    for (const valor of ['', '-500', '0']) {
      await sembrarValor(page, campo(page, ROTULO.pension), valor);
      await page.getByRole('button', { name: 'Calcular pensión de viudedad' }).click();
      await expect(aviso).toHaveCount(1);
      await expect(panelResultado(page)).not.toContainText('Desglose del cálculo');
    }
  });

  test('CASO 5 — tope de la PNC con cargas: 480,00 + 628,80 = 1.108,80 €/mes, no 1.256,60', async ({ page }) => {
    await abrir(page);
    await rellenar(page, { situacion: 'activo', base: '800', edad: '45', cargas: true, ingresos: '0' });
    await calcular(page);

    // 24 × 800 / 28 = 685,71 · PENSION_VIUDEDAD_2026.porcentaje70 → 480,00
    expect(await lineaDesglose(page, 'Pensión calculada')).toBeCloseTo(480, 2);
    // TOPE_COMPLEMENTO_MINIMOS_2026.sinConyugeMensual = 8.803,20 / 14 = 628,80 (el íntegro serían 776,60)
    expect(await lineaDesglose(page, 'Complemento a mínimos')).toBeCloseTo(628.8, 2);
    expect(await pensionFinal(page)).toBeCloseTo(1108.8, 2);
    await expect(panelResultado(page)).toContainText('no puede superar la pensión no contributiva');
  });

  test('CASO 6 — tope de la PNC con 65 años o más: 240,00 + 628,80 = 868,80 €/mes, no 936,20', async ({ page }) => {
    await abrir(page);
    await rellenar(page, { pension: '400', edad: '67', cargas: false, ingresos: '0' });
    await calcular(page);

    // 400 × 60 % = 240,00; íntegro 936,20 − 240,00 = 696,20 > 628,80
    expect(await lineaDesglose(page, 'Pensión calculada')).toBeCloseTo(240, 2);
    expect(await pensionFinal(page)).toBeCloseTo(868.8, 2);
  });

  test('CASO 7 — prueba de rentas: con 1.500 €/mes de trabajo no hay complemento, 520,00 €/mes', async ({ page }) => {
    await abrir(page);
    await rellenar(page, { pension: '1000', edad: '45', cargas: false, ingresos: '1500' });
    await calcular(page);

    // 1.000 × 52 % = 520,00. Rentas ≥ 18.000 €/año > COMPLEMENTO_MINIMOS_LIMITES_2026.sinConyuge
    // (9.442): (9.442 + 9.931,60) − (18.000 + 7.280) < 0 → sin complemento.
    expect(await lineaDesglose(page, 'Pensión calculada')).toBeCloseTo(520, 2);
    expect(await pensionFinal(page)).toBeCloseTo(520, 2);
    await expect(panelResultado(page)).toContainText('Sin complemento a mínimos');
    await expect(panelResultado(page)).not.toContainText('Se completa hasta la cuantía mínima');
  });

  test('CASO 8 — causante en alta con 3 años cotizados: el art. 219.1 LGSS pide 500 días en 5 años, no 15 años', async ({ page }) => {
    await abrir(page);
    await rellenar(page, { situacion: 'activo', base: '2100', anios: '3', edad: '45', ingresos: '0' });
    await calcular(page);

    const fila = panelResultado(page)
      .locator('[class*="requisitoItem"]')
      .filter({ hasText: 'períodos mínimos requeridos' });
    await expect(fila).toHaveCount(1);
    // 3 años pueden contener 500 días dentro de los últimos 5: el requisito no se puede dar por incumplido.
    await expect(fila.locator('[class*="requisitoIcono"]')).not.toHaveText('❌');
    // Y sigue marcando ❌ quien no estaba en alta con menos de 15 años (art. 219.1, párrafo 2.º).
    await page.getByRole('button', { name: /Sin trabajar/ }).click();
    await calcular(page);
    await expect(fila.locator('[class*="requisitoIcono"]')).toHaveText('❌');
  });

  test('CASO 9 — el neto: a 1.071,72 €/mes el IRPF es 79,46 €/año, no un 8 %', async ({ page }) => {
    await abrir(page);
    await rellenar(page, { pension: '2061', edad: '45', cargas: false, ingresos: '0' });
    await calcular(page);

    expect(await pensionFinal(page)).toBeCloseTo(1071.72, 2);
    // calcularRendimientoNetoTrabajo + calcularCuotaIntegraGeneral(5.968,22, 5.550) = 79,46 €/año
    // → 1.066,04 €/mes; 1.071,72 si no hubiera retención. El defecto vigilado son 80 €/mes.
    const n = await neto(page);
    expect(n).toBeGreaterThanOrEqual(1060);
    expect(n).toBeLessThanOrEqual(1071.72);

    // 2.000,00 €/mes brutos = 28.000,04 €/año: cuota 4.911,01 (17,54 %) → 1.649,20 €/mes.
    await sembrarValor(page, campo(page, ROTULO.pension), '3846,16');
    await calcular(page);
    expect(await pensionFinal(page)).toBeCloseTo(2000, 2);
    const n2 = await neto(page);
    expect(n2).toBeGreaterThanOrEqual(1640);
    expect(n2).toBeLessThanOrEqual(1660);
  });
});

test.describe('Estimador de pensión de viudedad — contenido', () => {
  test('CASO 10 — la FAQ de la pensión mínima publica las cuantías del Anexo I del RD 241/2026', async ({ page }) => {
    await page.goto(RUTA);
    const faq = normalizar(
      (await page.locator('details').filter({ hasText: '¿Cuánto es la pensión mínima de viudedad en 2026?' }).textContent()) ?? '',
    );
    // MINIMOS_VIUDEDAD_2026: < 60 709,40 · 60-64 875,90 · ≥ 65 936,20 · con cargas 1.256,60 €/mes
    expect(faq).toMatch(/709,40/);
    expect(faq).toMatch(/875,90/);
    expect(faq).toMatch(/936,20/);
    expect(faq).toMatch(/1\.?256,60/);
    expect(faq).not.toContain('785 €/mes');
  });

  test('CASO 11 — el FAQPage no da para ≥ 65 un mínimo de «unos 11.940 €» (son 13.106,80 €/año)', async ({ page }) => {
    await page.goto(RUTA);
    const ld = (await page.locator('script[type="application/ld+json"]').allTextContents()).join(' ');
    expect(ld).toContain('FAQPage');
    // Anexo I del RD 241/2026: 13.106,80 €/año = 936,20 €/mes
    expect(ld).not.toContain('11.940');
    expect(ld).toMatch(/13\.?106,80|936,20/);
  });

  test('CASO 12 — la pareja de hecho no tiene requisito de ingresos desde la Ley 21/2021 (art. 221 LGSS)', async ({ page }) => {
    await page.goto(RUTA);
    const pagina = normalizar((await page.locator('body').textContent()) ?? '');
    const ld = (await page.locator('script[type="application/ld+json"]').allTextContents()).join(' ');
    expect(pagina).not.toContain('Los requisitos económicos también son más restrictivos');
    expect(pagina).not.toContain('(inscripción, convivencia, límite de ingresos)');
    expect(pagina).not.toContain('siempre que no existan ingresos superiores al límite legal');
    expect(ld).not.toContain('el 50% de la suma de los ingresos de ambos');
  });

  test('CASO 13 — el ejemplo de Manuel (70 años, sin cargas) no puede prometer el 70 % que la calculadora no da', async ({ page }) => {
    await abrir(page);
    await rellenar(page, { pension: '1500', edad: '67', cargas: false, ingresos: '0' });
    await calcular(page);
    // ≥ 65 sin cargas → PENSION_VIUDEDAD_2026.porcentaje60
    expect(normalizar(await panelResultado(page).innerText())).toContain('Porcentaje aplicado 60');

    const escenario = normalizar(
      (await page.locator('[class*="escenarioCard"]').filter({ hasText: 'Manuel' }).textContent()) ?? '',
    );
    expect(escenario).not.toContain('percibirá el 70%');
  });

  test('CASO 14 — el porcentaje se separa con espacio duro («52 %»)', async ({ page }) => {
    await abrir(page);
    await rellenar(page, { pension: '1500', edad: '45', ingresos: '0' });
    await calcular(page);
    const texto = await page.locator('[class*="porcentajeBadge"]').innerText();
    expect(texto).toBe(`52${String.fromCharCode(160)}%`);
  });
});

/** Relación de contraste WCAG entre dos colores sRGB. */
function contraste(a: number[], b: number[]): number {
  const lum = (c: number[]): number => {
    const f = (v: number): number => {
      const s = v / 255;
      return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
    };
    return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]);
  };
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}

/**
 * Contraste MEDIDO EN PÍXELES de un texto sin emoji: el fondo es el color más frecuente del
 * recorte y el texto el píxel de mayor contraste con él. Un degradado no se puede leer del CSS.
 */
async function contrastePorPixel(page: Page, selector: string): Promise<number> {
  const png = await page.locator(selector).first().screenshot();
  const pixeles = await page.evaluate(async (b64: string) => {
    const img = new Image();
    img.src = 'data:image/png;base64,' + b64;
    await img.decode();
    const lienzo = document.createElement('canvas');
    lienzo.width = img.width;
    lienzo.height = img.height;
    const ctx = lienzo.getContext('2d')!;
    ctx.drawImage(img, 0, 0);
    return Array.from(ctx.getImageData(0, 0, lienzo.width, lienzo.height).data);
  }, png.toString('base64'));
  const cuenta = new Map<string, number>();
  for (let i = 0; i < pixeles.length; i += 4) {
    const clave = `${pixeles[i]},${pixeles[i + 1]},${pixeles[i + 2]}`;
    cuenta.set(clave, (cuenta.get(clave) ?? 0) + 1);
  }
  const fondo = [...cuenta.entries()].sort((a, b) => b[1] - a[1])[0][0].split(',').map(Number);
  let maximo = 1;
  for (const clave of cuenta.keys()) maximo = Math.max(maximo, contraste(clave.split(',').map(Number), fondo));
  return maximo;
}

test.describe('Estimador de pensión de viudedad — accesibilidad', () => {
  test('CASO 15 — las tres preguntas de botones tienen nombre de grupo', async ({ page }) => {
    await abrir(page);
    await expect(page.getByRole('group', { name: /hijos/ })).toHaveCount(1);
    await expect(page.getByRole('group', { name: /Situación del causante/ })).toHaveCount(1);
    await expect(page.getByRole('group', { name: /Vínculo con el causante/ })).toHaveCount(1);
  });

  test('CASO 16 — los emojis junto a texto no entran en el nombre accesible', async ({ page }) => {
    await abrir(page);
    await expect(page.getByRole('button', { name: 'Matrimonio', exact: true })).toHaveCount(1);
    await expect(page.getByRole('button', { name: 'Pareja de hecho', exact: true })).toHaveCount(1);
  });

  test('CASO 17 — el neto y el rótulo del resultado llegan a 4,5:1, en los dos temas', async ({ page }) => {
    for (const tema of ['light', 'dark'] as const) {
      await page.addInitScript((t: string) => localStorage.setItem('meskeia-theme', t), tema);
      await abrir(page);
      await expect(page.locator('html')).toHaveAttribute('data-theme', tema);
      await calcular(page);
      // Texto normal (13,1 y 14,4 px, peso 400): WCAG 1.4.3 pide 4,5:1.
      expect(await contrastePorPixel(page, '[class*="pensionNeta"]')).toBeGreaterThanOrEqual(4.5);
      expect(await contrastePorPixel(page, '[class*="pensionLabel"]')).toBeGreaterThanOrEqual(4.5);
    }
  });

  test('CASO 18 — «Se aplica el mínimo garantizado» llega a 4,5:1 en claro', async ({ page }) => {
    await abrir(page);
    await calcular(page); // por defecto: 60 % de 1.400 = 840 < 936,20 → aparece el aviso
    const aviso = page.locator('[class*="minimoAplicado"]');
    await expect(aviso).toBeVisible();
    const colores = await aviso.evaluate((n) => {
      const rgba = (s: string): number[] => (s.match(/[\d.]+/g) ?? []).map(Number);
      const padre = n.parentElement as HTMLElement;
      return {
        texto: rgba(getComputedStyle(n).color),
        tinte: rgba(getComputedStyle(n).backgroundColor),
        base: rgba(getComputedStyle(padre).backgroundColor),
      };
    });
    const alfa = colores.tinte[3] ?? 1;
    const fondo = [0, 1, 2].map((i) => alfa * colores.tinte[i] + (1 - alfa) * colores.base[i]);
    expect(contraste(colores.texto.slice(0, 3), fondo)).toBeGreaterThanOrEqual(4.5);
  });
});

test.describe('Estimador de pensión de viudedad — móvil', () => {
  test.use({
    viewport: { width: 375, height: 740 },
    userAgent:
      'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Mobile Safari/537.36',
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });

  test('CASO 19 — 375 px: «1.234,56» tecleado pulsación a pulsación se respeta y el resultado se ve', async ({ page }) => {
    await abrir(page);
    const pension = campo(page, ROTULO.pension);
    await pension.click();
    await pension.press('Control+A');
    await pension.press('Backspace');
    await pension.pressSequentially('1.234,56', { delay: 30 });
    await esperarValorEnReact(page, pension, '1.234,56');
    // El blur no reescribe el campo.
    await campo(page, ROTULO.ingresos).click();
    await expect(pension).toHaveValue('1.234,56');

    await page.getByRole('button', { name: 'Calcular pensión de viudedad' }).tap();
    await expect(panelResultado(page)).toContainText('Desglose del cálculo');
    // BR = 1.234,56; ≥ 65 sin cargas (por defecto) → 60 % = 740,74; mínimo 936,20 (complemento 195,46 < 628,80)
    expect(await lineaDesglose(page, 'Base reguladora')).toBeCloseTo(1234.56, 2);
    expect(await lineaDesglose(page, 'Pensión calculada')).toBeCloseTo(740.74, 2);
    const importe = page.locator('[class*="pensionImporte"]');
    await importe.scrollIntoViewIfNeeded();
    await expect(importe).toBeInViewport();
    expect(await pensionFinal(page)).toBeCloseTo(936.2, 2);

    const [ancho, ventana] = await page.evaluate(() => [document.documentElement.scrollWidth, window.innerWidth]);
    expect(ancho).toBeLessThanOrEqual(ventana);
  });
});

/** Abre la sección educativa, que es donde vive la guía del trámite. */
async function abrirGuia(page: Page): Promise<void> {
  await page.goto(RUTA);
  const boton = page.getByRole('button', { name: 'Ver guía educativa' });
  if (await boton.isVisible()) await boton.click();
  await expect(page.getByText('Espera la resolución del INSS')).toBeVisible();
}

test.describe('Estimador de pensión de viudedad — reclamación previa', () => {
  test('el plazo se publica en días HÁBILES y sale de data/fiscal', async ({ page }) => {
    await abrirGuia(page);
    const guia = normalizar(await page.locator('body').innerText());

    // El módulo manda: si alguien lo devuelve a 'naturales', cae aquí antes que en la página.
    expect(RECLAMACION_PREVIA_SS.tipoDias).toBe('hábiles');
    expect(guia).toContain(`${RECLAMACION_PREVIA_SS.dias} días ${RECLAMACION_PREVIA_SS.tipoDias}`);
    expect(guia).toContain(RECLAMACION_PREVIA_SS.norma);
    // La forma que publicaba el defecto hermano no puede aparecer tampoco aquí.
    expect(guia).not.toContain(`${RECLAMACION_PREVIA_SS.dias} días naturales`);
  });

  test('la guía dice que perder el plazo NO extingue el derecho (art. 71.4 LRJS)', async ({
    page,
  }) => {
    await abrirGuia(page);
    const guia = normalizar(await page.locator('body').innerText());

    expect(RECLAMACION_PREVIA_SS.reiteracion.puede).toBe(true);
    expect(guia).toContain(RECLAMACION_PREVIA_SS.reiteracion.detalle);
    expect(guia).toContain(RECLAMACION_PREVIA_SS.reiteracion.norma);
  });

  test('la guía dice cuándo se abre la vía judicial por silencio (art. 71.5 LRJS)', async ({
    page,
  }) => {
    await abrirGuia(page);
    const guia = normalizar(await page.locator('body').innerText());

    // Sin este dato, quien no recibe respuesta no sabe que ya puede demandar.
    expect(guia).toContain(RECLAMACION_PREVIA_SS.resolucion.detalle);
    expect(guia).toContain(RECLAMACION_PREVIA_SS.resolucion.norma);
  });
});
