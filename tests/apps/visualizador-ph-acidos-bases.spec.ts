import { test, expect, type Page, type Locator } from '@playwright/test';
import { esperarHidratacion, sembrarValor, sembrarValorAcotado } from './_hidratacion';
import { contrasteSobreFondoReal } from './_contraste';
import { activarTemaOscuro, prepararParaMedir } from '../_contraste';

/**
 * Inspector — visualizador-ph-acidos-bases (segmento cálculo, riesgo 3)
 *
 * Primera inspección: 21/11/2026. La app promete en su <h1> «pH: Ácidos y Bases» un explicador
 * de la escala de pH: un deslizador de 0 a 14 que da el color, el TIPO («Ácido fuerte», «Neutro»…)
 * y la concentración [H⁺] = 10⁻ᵖᴴ mol/L, las sustancias cotidianas a ±1,5 del valor, un mapa de
 * puntos que lleva el deslizador al pH de cada sustancia, y secciones de ácidos y bases (fuertes y
 * débiles), neutralización, indicadores naturales y curiosidades. No hay entrada de concentración:
 * no se puede pedir un ácido 0,01 M ni HCl 1 × 10⁻⁸ M. La verdad comprobable es la del deslizador
 * (pH → [H⁺], posición, sustancias cercanas, tipo) y la coherencia de los datos que da.
 *
 * DÓNDE VIVE EL CÁLCULO: todo en app/visualizador-ph-acidos-bases/page.tsx (no importa nada de
 * data/ ni de lib/calculadoras): obtenerTipoPh(ph) rotula por TRAMOS DE pH (< 3 «Ácido fuerte»,
 * < 6 «Ácido débil», < 6,5 «Ligeramente ácido», ≤ 7,5 «Neutro», ≤ 8,5 «Ligeramente básico»,
 * < 11 «Base débil», resto «Base fuerte»); [H⁺] se escribe «10⁻{ph.toFixed(1)} mol/L»;
 * sustancias cercanas = |ph − deslizador| ≤ 1,5 en coma flotante.
 *
 * CONSTANTES (PubChem, datos del HSDB, consultados el 21/11/2026)
 *   ácido acético pKa 4,76 a 25 °C (Serjeant y Dempsey, IUPAC Chemical Data Series n.º 23, 1979)
 *   amoníaco pKb 4,751 a 25 °C (CRC Handbook, 68.ª ed.) · ácido cítrico pKa 2,79 (Serjeant y
 *   Dempsey) · Kw = 1,0 × 10⁻¹⁴ a 25 °C.
 *
 * LOS CASOS, RESUELTOS A MANO ANTES DE ABRIR EL NAVEGADOR (.inspector-trabajo/ph-esperados*.mjs)
 *   CASO 1 (normal) pH 2 → [H⁺] = 10⁻² = 0,01 mol/L · marcador al 2/14 = 14,29 % · cercanas
 *     (|Δ| ≤ 1,5, por distancia y en el orden del array si empatan): Zumo de limón (0), Ácido
 *     gástrico (0,5), Vinagre (0,5), Ácido de batería (1,5), Zumo de naranja (1,5).
 *     pH 2,5 → [H⁺] = 10⁻²·⁵ = 3,162 × 10⁻³ mol/L · Vinagre, Zumo de limón, Ácido gástrico, Zumo
 *     de naranja.
 *   CASO 2 (límite) pH 0 → [H⁺] = 10⁰ = 1 mol/L, marcador al 0 %, Ácido de batería y Ácido
 *     gástrico · pH 14 → 10⁻¹⁴ mol/L, 100 %, Sosa cáustica y Lejía · pH 7 → [H⁺] = [OH⁻] =
 *     √Kw = 10⁻⁷, «Neutro», seis sustancias. La distancia EXACTA 1,5 entra (≤): pH 4,0 ↔ Vinagre,
 *     pH 9,8 ↔ Bicarbonato, pH 6,8 ↔ Bicarbonato (este último, hallazgo C).
 *   CASO 3 (rechazo) el deslizador es la única entrada: 15 → lo recorta a 14 · −1 → 0 · «abc»
 *     (y «1,5», que un range no admite) → el valor por defecto del control, 7. Nunca NaN.
 *   Tipo: el vinagre (5 % = 0,833 M) da pH 2,42 con la cuadrática y solo está disociado un
 *     0,46 %; el amoníaco a pH 11,5 (0,567 M) está ionizado un 0,56 %; el HCl 1 × 10⁻⁵ M,
 *     disociado al 100 %, da pH 5,000. La fuerza no la da el pH (la propia app lo explica).
 *   Neutralización equivalente: CH₃COOH 0,1 M + NaOH 0,1 M a volúmenes iguales → acetato 0,05 M,
 *     Kb = Kw/Ka = 5,75 × 10⁻¹⁰ → [OH⁻] = 5,36 × 10⁻⁶ → pH 8,73 (no 7).
 *
 * HALLAZGOS del 21/11/2026 (los abiertos llevan test.fail())
 *   A. obtenerTipoPh rotula la FUERZA por el pH: Vinagre (2,5) y Zumo de limón (2,0) → «Ácido
 *      fuerte», Amoniaco casero (11,5) → «Base fuerte»; la propia app da por débiles el ácido
 *      acético, el cítrico y el amoníaco y define fuerte/débil por la disociación.
 *   B. La franja 6,5-7,5 sale «Neutro»: la leche (6,5), cuya tarjeta dice «Ligeramente ácida», y la
 *      sangre (7,4), cuando la tabla de la app dice «pH: bases > 7».
 *   C. Ventana ±1,5 en coma flotante: a pH 6,8 falta Bicarbonato (8,3), |Δ| = 1,5000000000000009.
 *   D. Formato: toFixed(1) a la vista («pH 2.5», «10⁻2.5 mol/L», «Vinagre, pH 2.5» en aria-label y
 *      title) y el % pegado («5%», «30%», «+26% acidez», «100%»).
 *   E. El mapa de puntos se tapa: en escritorio el centro de «Agua de mar» es de «Bicarbonato» (sale
 *      pH 8,3); en móvil (412 px) cinco de los 17 puntos tienen el centro tapado.
 *   F. Contraste en claro del pH pintado en su color: «pH 7.0» 2,49:1 (grande, pide 3:1), pH de las
 *      tarjetas 1,85-3,96:1, escala logarítmica 1,96-4,00:1, pestaña «Ácidos» 3,41:1.
 *   G. Contraste en oscuro de colores fijos sin variante: «NaHCO₃ (bicarbonato)» 1,50:1, cabeceras
 *      «Bases» 2,06:1 y «Ácidos» 3,39:1, pestaña «Bases» 2,40:1, zona «Base» 2,70:1, pH 11,5
 *      2,26:1.
 *   H. FAQPage frente a la página: lluvia ácida por debajo de 5,0 (FAQ) o de 5,6 (página, dos veces);
 *      limón ~2,2 frente a 2,0; lejía ~13 frente a 12,5.
 *   I. FAQPage: «si las cantidades son equivalentes, el resultado es una solución de pH neutro (~7)»
 *      sin acotarlo a ácido y base fuertes (acético + NaOH → 8,73).
 *   J. featureList promete «su pH exacto» de unos valores que son típicos (el propio FAQ da otros).
 *   K. «Ácido gástrico» y «pH del estómago» llevan 🫁 (U+1FAC1, PULMONES).
 */

test.use({ locale: 'es-ES' });

const RUTA = '/visualizador-ph-acidos-bases/';
const SLIDER = 'input[type="range"][aria-label="Valor de pH"]';

const valorPh = (page: Page): Locator => page.locator('[class$="_phInfoValue"]');
const tipoPh = (page: Page): Locator => page.locator('[class$="_phInfoTipo"]');
const concentracion = (page: Page): Locator => page.locator('[class$="_phInfoConcentracion"]');
const nombresCercanas = (page: Page): Locator => page.locator('[class$="_sustanciaNombre"]');
const puntoMapa = (page: Page, nombre: string): Locator => page.locator(`button[aria-label^="${nombre},"]`);
const tarjetaAcidoBase = (page: Page, nombre: string): Locator =>
  page.locator('[class$="_acidoBaseCard"]', { hasText: nombre });
const curiosidad = (page: Page, titulo: string): Locator =>
  page.locator('[class$="_curiosidadCard"]', { hasText: titulo });

const decimal = (s: string): number => Number(s.replace(',', '.'));

/** pH que muestra la caja, con coma o con punto (el formato es el hallazgo D, no este). */
async function phMostrado(page: Page): Promise<number> {
  const m = ((await valorPh(page).textContent()) ?? '').match(/pH\s*(\d+(?:[.,]\d+)?)/);
  return m ? decimal(m[1]) : NaN;
}

/** Exponente de «Concentración H⁺: 10⁻X mol/L», con coma o con punto. */
async function exponenteH(page: Page): Promise<number> {
  const m = ((await concentracion(page).textContent()) ?? '').match(/10⁻\s*(\d+(?:[.,]\d+)?)\s*mol\/L/);
  return m ? decimal(m[1]) : NaN;
}

/** Posición del marcador de la barra, en % de su ancho. */
async function posicionMarcador(page: Page): Promise<number> {
  return parseFloat(await page.locator('[class$="_phBarMarker"]').evaluate((el) => (el as HTMLElement).style.left));
}

async function irA(page: Page, seccion: RegExp): Promise<void> {
  await page.locator('nav[aria-label="Secciones del visualizador"] button', { hasText: seccion }).click();
}

/** Puntos del mapa cuyo CENTRO cae sobre otro punto: pulsarlos elige la otra sustancia. */
async function puntosTapados(page: Page): Promise<string[]> {
  await puntoMapa(page, 'Agua pura').scrollIntoViewIfNeeded();
  return page.evaluate(() => {
    const tapados: string[] = [];
    for (const b of Array.from(document.querySelectorAll('button[aria-label*=", pH "]'))) {
      const r = b.getBoundingClientRect();
      const encima = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)?.closest('button');
      if (encima !== b) tapados.push(`${b.getAttribute('aria-label')} → ${encima?.getAttribute('aria-label')}`);
    }
    return tapados;
  });
}

/** Mide el contraste de cada elemento del localizador y anota los que no llegan al umbral. */
async function anotarContrastes(loc: Locator, umbral: number, rotulo: string, fallos: string[]): Promise<void> {
  const n = await loc.count();
  expect(n, `${rotulo}: hay algo que medir`).toBeGreaterThan(0);
  for (let i = 0; i < n; i++) {
    const r = await contrasteSobreFondoReal(loc.nth(i));
    if (r < umbral) fallos.push(`${rotulo} «${((await loc.nth(i).textContent()) ?? '').trim()}» ${r.toFixed(2)}:1 < ${umbral}`);
  }
}

async function ldDeTipo(page: Page, tipo: string): Promise<Record<string, unknown>> {
  const bloques = await page.locator('script[type="application/ld+json"]').allTextContents();
  const hallado = bloques.map((b) => JSON.parse(b) as Record<string, unknown>).find((j) => j['@type'] === tipo);
  if (!hallado) throw new Error(`No hay JSON-LD de tipo ${tipo}`);
  return hallado;
}

async function respuestaFaq(page: Page, pregunta: RegExp): Promise<string> {
  const faq = await ldDeTipo(page, 'FAQPage');
  const entradas = faq.mainEntity as { name: string; acceptedAnswer: { text: string } }[];
  const hallada = entradas.find((q) => pregunta.test(q.name));
  if (!hallada) throw new Error(`El FAQPage no trae ninguna pregunta que case con ${pregunta}`);
  return hallada.acceptedAnswer.text;
}

test.describe('visualizador-ph-acidos-bases — Inspector 21/11/2026', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, [SLIDER]);
  });

  // ── CASO 1 · normal ────────────────────────────────────────────────────────
  test('CASO 1 · pH 2: [H⁺] = 10⁻² mol/L, marcador al 14,29 % y cinco sustancias a ±1,5', async ({ page }) => {
    await sembrarValor(page, SLIDER, 2);
    expect(await phMostrado(page)).toBe(2);
    expect(await exponenteH(page)).toBeCloseTo(2, 6);
    expect(await posicionMarcador(page)).toBeCloseTo((100 * 2) / 14, 3);
    await expect(nombresCercanas(page)).toHaveText([
      'Zumo de limón', 'Ácido gástrico', 'Vinagre', 'Ácido de batería', 'Zumo de naranja',
    ]);
    // pH 2,5 → [H⁺] = 10^-2,5 = 3,162 × 10⁻³ mol/L
    await sembrarValor(page, SLIDER, 2.5);
    expect(await exponenteH(page)).toBeCloseTo(2.5, 6);
    expect(await posicionMarcador(page)).toBeCloseTo((100 * 2.5) / 14, 3);
    await expect(nombresCercanas(page)).toHaveText(['Vinagre', 'Zumo de limón', 'Ácido gástrico', 'Zumo de naranja']);
  });

  test('CASO 1 · pulsar el punto de «Zumo de limón» lleva el deslizador a pH 2', async ({ page }) => {
    await puntoMapa(page, 'Zumo de limón').click();
    await expect.poll(() => phMostrado(page)).toBe(2);
    await expect(page.locator(SLIDER)).toHaveValue('2');
  });

  // ── CASO 2 · límite ────────────────────────────────────────────────────────
  test('CASO 2 · extremos: pH 0 → [H⁺] = 10⁰ = 1 mol/L y pH 14 → 10⁻¹⁴ mol/L', async ({ page }) => {
    await sembrarValor(page, SLIDER, 0);
    expect(await exponenteH(page)).toBe(0);
    expect(await posicionMarcador(page)).toBe(0);
    await expect(nombresCercanas(page)).toHaveText(['Ácido de batería', 'Ácido gástrico']);
    await sembrarValor(page, SLIDER, 14);
    expect(await exponenteH(page)).toBe(14);
    expect(await posicionMarcador(page)).toBe(100);
    await expect(nombresCercanas(page)).toHaveText(['Sosa cáustica', 'Lejía (hipoclorito)']);
  });

  test('CASO 2 · pH 7: neutro, [H⁺] = √Kw = 10⁻⁷ mol/L (Kw = 1,0 × 10⁻¹⁴ a 25 °C)', async ({ page }) => {
    await sembrarValor(page, SLIDER, 5.3); // parte de otro estado: 7 es el inicial
    await sembrarValor(page, SLIDER, 7);
    await expect(tipoPh(page)).toHaveText('Neutro');
    expect(await exponenteH(page)).toBe(7);
    await expect(nombresCercanas(page)).toHaveText([
      'Agua pura', 'Sangre humana', 'Leche', 'Agua de mar', 'Bicarbonato', 'Lluvia normal',
    ]);
  });

  test('CASO 2 · la distancia exacta 1,5 entra: pH 4,0 ↔ Vinagre (2,5) y pH 9,8 ↔ Bicarbonato (8,3)', async ({ page }) => {
    await sembrarValor(page, SLIDER, 4);
    expect(await nombresCercanas(page).allTextContents()).toContain('Vinagre');
    await sembrarValor(page, SLIDER, 9.8);
    expect(await nombresCercanas(page).allTextContents()).toContain('Bicarbonato');
  });

  // HALLAZGO C (21/11/2026, ABIERTO): Math.abs(8.3 − 6.8) = 1.5000000000000009 > 1.5.
  test('CASO 2 · pH 6,8: Bicarbonato (8,3) está a 1,5 justos y sale, como a pH 9,8', async ({ page }) => {
    test.fail(true,'HALLAZGO C (ABIERTO): a pH 6,8 no sale la tarjeta de Bicarbonato');
    await sembrarValor(page, SLIDER, 6.8);
    expect(await nombresCercanas(page).allTextContents()).toContain('Bicarbonato');
  });

  // ── CASO 3 · rechazo ───────────────────────────────────────────────────────
  test('CASO 3 · fuera de escala: 15 → 14, −1 → 0, «abc» → 7 (lo recorta el control) y nunca NaN', async ({ page }) => {
    await sembrarValor(page, SLIDER, 5.3);
    expect(await sembrarValorAcotado(page, SLIDER, '15')).toBe('14');
    expect(await phMostrado(page)).toBe(14);
    expect(await exponenteH(page)).toBe(14);
    expect(await sembrarValorAcotado(page, SLIDER, '-1')).toBe('0');
    expect(await phMostrado(page)).toBe(0);
    expect(await sembrarValorAcotado(page, SLIDER, 'abc')).toBe('7');
    expect(await phMostrado(page)).toBe(7);
    await expect(page.locator('body')).not.toContainText('NaN', { useInnerText: true });
  });

  // ── Tipo de pH ─────────────────────────────────────────────────────────────
  // HALLAZGO A (21/11/2026, ABIERTO): obtenerTipoPh rotula la fuerza por el pH. El vinagre está
  // disociado un 0,46 % (pKa 4,76) y el amoníaco ionizado un 0,56 % (pKb 4,751): son débiles.
  test('Tipo · el vinagre, el limón y el amoníaco no salen «fuertes»: la propia app los da por débiles', async ({ page }) => {
    test.fail(true,'HALLAZGO A (ABIERTO): Vinagre 2,5 y Zumo de limón 2,0 → «Ácido fuerte»; Amoniaco casero 11,5 → «Base fuerte»');
    await irA(page, /Ácidos y Bases/);
    await expect(tarjetaAcidoBase(page, 'Ácido acético')).toContainText('Débil');
    await expect(tarjetaAcidoBase(page, 'Ácido cítrico')).toContainText('Débil');
    await page.getByRole('button', { name: 'Bases (fuertes y débiles)' }).click();
    await expect(tarjetaAcidoBase(page, 'Amoníaco')).toContainText('Débil');
    await irA(page, /Escala de pH/);
    const casos: [string, number][] = [['Vinagre', 2.5], ['Zumo de limón', 2], ['Amoniaco casero', 11.5]];
    for (const [nombre, ph] of casos) {
      await puntoMapa(page, nombre).click();
      await expect.poll(() => phMostrado(page)).toBe(ph);
      expect.soft(await tipoPh(page).textContent(), nombre).not.toMatch(/fuerte/i);
    }
  });

  // HALLAZGO B (21/11/2026, ABIERTO): if (ph <= 7.5) return 'Neutro' desde 6,5.
  test('Tipo · la leche (6,5) sale ácida como dice su tarjeta y la sangre (7,4) básica como dice la tabla', async ({ page }) => {
    test.fail(true,'HALLAZGO B (ABIERTO): Leche 6,5 y Sangre humana 7,4 → «Neutro»');
    await puntoMapa(page, 'Leche').click();
    await expect.poll(() => phMostrado(page)).toBe(6.5);
    await expect(page.locator('[class$="_sustanciaCard"]', { hasText: 'Leche' })).toContainText('Ligeramente ácida');
    expect.soft(await tipoPh(page).textContent(), 'Leche').toMatch(/ácid/i);
    await puntoMapa(page, 'Sangre humana').click();
    await expect.poll(() => phMostrado(page)).toBe(7.4);
    expect.soft(await tipoPh(page).textContent(), 'Sangre humana').toMatch(/básic/i);
  });

  // ── Formato español ────────────────────────────────────────────────────────
  // HALLAZGO D (21/11/2026, ABIERTO): phSlider.toFixed(1) y s.ph interpolado; % pegado a la cifra.
  test('Formato · el pH lleva coma decimal y el % va separado', async ({ page }) => {
    test.fail(true,'HALLAZGO D (ABIERTO): «pH 2.5», «10⁻2.5 mol/L», «Vinagre, pH 2.5», «+26% acidez»');
    await sembrarValor(page, SLIDER, 2.5);
    expect.soft(await valorPh(page).textContent()).toBe('pH 2,5');
    expect.soft(await page.locator('[class$="_phBarMarkerValue"]').textContent()).toBe('2,5');
    expect.soft(await concentracion(page).textContent()).not.toContain('2.5');
    await expect.soft(page.getByRole('heading', { name: /^Sustancias cercanas a pH/ })).toHaveText('Sustancias cercanas a pH 2,5');
    expect.soft(
      await page.locator('[class$="_sustanciaCard"]', { hasText: 'Vinagre' }).locator('[class$="_sustanciaPh"]').textContent(),
    ).toBe('pH 2,5');
    expect.soft(await puntoMapa(page, 'Vinagre').getAttribute('aria-label')).toBe('Vinagre, pH 2,5');
    await irA(page, /Datos y Curiosidades/);
    expect.soft(await curiosidad(page, 'Océanos acidificándose').textContent()).toMatch(/26 %/);
  });

  // ── Datos ──────────────────────────────────────────────────────────────────
  test('Datos · cada unidad de pH es un factor 10: pH n frente a pH 7 = 10^(7 − n); 8,2 → 8,1 = +26 %', async ({ page }) => {
    await irA(page, /Datos y Curiosidades/);
    const items = page.locator('[class$="_logItem"]');
    await expect(items).toHaveCount(7);
    for (let i = 0; i < 7; i++) {
      const ph = Number(((await items.nth(i).locator('[class$="_logPh"]').textContent()) ?? '').replace('pH', '').trim());
      const factor = Number(((await items.nth(i).locator('[class$="_logFactor"]').textContent()) ?? '').replace(/x$/, '').replace(/\./g, ''));
      expect(factor, `pH ${ph}`).toBe(10 ** (7 - ph));
    }
    // 10^0,1 = 1,2589 → +25,9 % de [H⁺], que la app redondea a 26 %
    await expect(curiosidad(page, 'Océanos acidificándose')).toContainText(/26\s?%/);
  });

  // ── Operativa: el mapa de puntos ───────────────────────────────────────────
  // HALLAZGO E (21/11/2026, ABIERTO): left = ph/14 en un mapa de ~820 px y puntos de 28 px: 8,1 y
  // 8,3 quedan a 12 px y el de Bicarbonato, posterior en el DOM, tapa el centro del de Agua de mar.
  test('Mapa · pulsar en el centro de «Agua de mar» (8,1) elige agua de mar, no bicarbonato', async ({ page }) => {
    test.fail(true,'HALLAZGO E (ABIERTO): sale pH 8,3 (Bicarbonato)');
    const punto = puntoMapa(page, 'Agua de mar');
    await punto.scrollIntoViewIfNeeded();
    const caja = await punto.boundingBox();
    if (!caja) throw new Error('El punto de «Agua de mar» no tiene caja');
    await page.mouse.click(caja.x + caja.width / 2, caja.y + caja.height / 2);
    await expect.poll(() => phMostrado(page)).toBe(8.1);
  });

  test.describe('móvil (412 px)', () => {
    test.use({
      viewport: { width: 412, height: 915 },
      userAgent:
        'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
      deviceScaleFactor: 2.625,
      isMobile: true,
      hasTouch: true,
    });

    // HALLAZGO E (21/11/2026, ABIERTO)
    test('Mapa · ningún punto tiene el centro tapado por otro', async ({ page }) => {
      test.fail(true,'HALLAZGO E (ABIERTO): Ácido gástrico, Zumo de limón, Leche, Agua pura y Agua de mar, tapados');
      expect(await puntosTapados(page)).toEqual([]);
    });
  });

  // ── Accesibilidad: contraste ───────────────────────────────────────────────
  // HALLAZGO F (21/11/2026, ABIERTO): style={{ color: colorActual }} / s.color / obtenerColorPh.
  // Umbral: 3:1 para el valor (28,8 px y 800, texto grande); 4,5:1 para el resto (12,5-13,6 px).
  test('A11y · claro: el pH pintado en su color llega a su umbral', async ({ page }) => {
    test.fail(true,'HALLAZGO F (ABIERTO): «pH 7.0» 2,49:1; tarjetas 1,85-3,96:1; escala 1,96-4,00:1; pestaña «Ácidos» 3,41:1');
    await prepararParaMedir(page);
    const fallos: string[] = [];
    await anotarContrastes(valorPh(page), 3, 'valor', fallos);
    await anotarContrastes(page.locator('[class$="_sustanciaPh"]'), 4.5, 'tarjeta', fallos);
    await irA(page, /Ácidos y Bases/);
    await anotarContrastes(page.getByRole('button', { name: 'Ácidos (fuertes y débiles)' }), 4.5, 'pestaña', fallos);
    await irA(page, /Datos y Curiosidades/);
    await anotarContrastes(page.locator('[class$="_logPh"]'), 4.5, 'escala', fallos);
    expect(fallos).toEqual([]);
  });

  // HALLAZGO G (21/11/2026, ABIERTO): #3333CC, #CC3333, #4444FF, #6644CC y la paleta del pH sin
  // variante oscura.
  test('A11y · oscuro: los colores fijos se leen sobre el fondo oscuro', async ({ page }) => {
    test.fail(true,'HALLAZGO G (ABIERTO): «NaHCO₃ (bicarbonato)» 1,50:1; «Bases» 2,06:1; «Ácidos» 3,39:1; pestaña «Bases» 2,40:1; «Base» 2,70:1; pH 11,5 2,26:1');
    await prepararParaMedir(page);
    await activarTemaOscuro(page);
    await expect(page.locator('[class$="_phInfoBox"]')).toHaveCSS('background-color', 'rgb(42, 42, 42)');
    const fallos: string[] = [];
    await sembrarValor(page, SLIDER, 11.5);
    await anotarContrastes(valorPh(page), 3, 'valor', fallos);
    await anotarContrastes(page.locator('[class$="_phZoneBase"]'), 4.5, 'zona', fallos);
    await irA(page, /Ácidos y Bases/);
    await anotarContrastes(page.locator('table th'), 4.5, 'cabecera', fallos);
    await page.getByRole('button', { name: 'Bases (fuertes y débiles)' }).click();
    await anotarContrastes(page.getByRole('button', { name: 'Bases (fuertes y débiles)' }), 4.5, 'pestaña', fallos);
    await irA(page, /Neutralización/);
    await anotarContrastes(page.locator('[class$="_neutralizacionBase"]'), 4.5, 'reacción', fallos);
    expect(fallos).toEqual([]);
  });

  // ── Contenido: FAQPage y JSON-LD ───────────────────────────────────────────
  // HALLAZGO H (21/11/2026, ABIERTO): FAQ «cuando el pH cae por debajo de 5,0»; la página, en la
  // curiosidad y en el bloque educativo, «pH < 5,6».
  test('FAQPage · el umbral de la lluvia ácida y los pH de ejemplo son los de la página', async ({ page }) => {
    test.fail(true,'HALLAZGO H (ABIERTO): lluvia ácida 5,0 frente a 5,6; limón ~2,2 frente a 2,0; lejía ~13 frente a 12,5');
    const lluvia = await respuestaFaq(page, /lluvia ácida/i);
    const delFaq = lluvia.match(/lluvia ácida cuando el pH cae por debajo de (\d+,\d+)/)?.[1];
    const ph = await respuestaFaq(page, /Qué es el pH/i);
    const limon = ph.match(/limón tiene ~(\d+(?:,\d+)?)/)?.[1] ?? 'NaN';
    const lejia = ph.match(/lejía alcanza ~(\d+(?:,\d+)?)/)?.[1] ?? 'NaN';
    // El pH de cada sustancia en la página, leído de su punto del mapa (con coma o con punto)
    const phDelMapa = async (nombre: string): Promise<number> =>
      decimal(((await puntoMapa(page, nombre).getAttribute('aria-label')) ?? '').match(/pH\s*(\d+(?:[.,]\d+)?)/)?.[1] ?? 'NaN');
    expect(await phDelMapa('Zumo de limón')).toBe(2);
    expect(await phDelMapa('Lejía (hipoclorito)')).toBe(12.5);
    expect.soft(decimal(limon), 'limón').toBe(await phDelMapa('Zumo de limón'));
    expect.soft(decimal(lejia), 'lejía').toBe(await phDelMapa('Lejía (hipoclorito)'));
    await irA(page, /Datos y Curiosidades/);
    const deLaPagina = ((await curiosidad(page, 'Lluvia ácida').textContent()) ?? '').match(/lluvia ácida cuando el pH baja de (\d+,\d+)/)?.[1];
    expect(deLaPagina).toBe('5,6');
    expect.soft(delFaq, 'lluvia ácida').toBe(deLaPagina);
  });

  // HALLAZGO I (21/11/2026, ABIERTO): CH₃COOH 0,1 M + NaOH 0,1 M → acetato 0,05 M → pH 8,73.
  test('FAQPage · neutralizar cantidades equivalentes da pH 7 solo con ácido y base fuertes', async ({ page }) => {
    test.fail(true,'HALLAZGO I (ABIERTO): «Si las cantidades son equivalentes, el resultado es una solución de pH neutro (~7)»');
    const faq = await respuestaFaq(page, /mezcla un ácido con una base/i);
    expect(faq).toMatch(/equivalentes/i);
    if (/pH neutro/i.test(faq)) expect(faq, 'acota el pH 7 a ácido y base fuertes').toMatch(/fuerte/i);
  });

  test('JSON-LD · featureList con al menos 4 características y las 17 sustancias del mapa', async ({ page }) => {
    const app = await ldDeTipo(page, 'WebApplication');
    expect((app.featureList as string[]).length).toBeGreaterThanOrEqual(4);
    await expect(page.locator('button[aria-label*=", pH "]')).toHaveCount(17);
  });

  // HALLAZGO J (21/11/2026, ABIERTO): «Más de 15 sustancias cotidianas con su pH exacto».
  test('JSON-LD · featureList no promete un «pH exacto» de valores típicos', async ({ page }) => {
    test.fail(true,'HALLAZGO J (ABIERTO): «con su pH exacto»');
    const app = await ldDeTipo(page, 'WebApplication');
    expect((app.featureList as string[]).join(' · ')).not.toMatch(/exact/i);
  });

  // HALLAZGO K (21/11/2026, ABIERTO): icono '🫁' en SUSTANCIAS y CURIOSIDADES.
  test('Contenido · el ácido gástrico no lleva el icono de los pulmones (🫁)', async ({ page }) => {
    test.fail(true,'HALLAZGO K (ABIERTO): 🫁 en «Ácido gástrico» y en «pH del estómago»');
    await expect(puntoMapa(page, 'Ácido gástrico')).not.toContainText('🫁');
    await irA(page, /Datos y Curiosidades/);
    await expect(curiosidad(page, 'pH del estómago')).not.toContainText('🫁');
  });
});
