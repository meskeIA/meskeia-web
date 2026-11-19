import { test, expect, devices, type Page } from '@playwright/test';
import { esperarHidratacion, esperarValorEnReact, sembrarValor } from './_hidratacion';
import { contrasteSobreFondoReal } from './_contraste';

/**
 * Inspector — calculadora-1rm-gimnasio (segmento MOTOR, riesgo 2)
 *
 * Primera inspección: 19/11/2026.
 *
 * QUÉ PROMETE
 *   <h1>: «🏋️ Calculadora de 1RM»
 *   subtítulo: «Calcula tu fuerza máxima en cualquier ejercicio con las fórmulas Epley y Brzycki»
 *   metadata: «Calcula tu repetición máxima (1RM) … Obtén tu tabla de cargas de entrenamiento por
 *             porcentaje con las fórmulas Epley y Brzycki.»
 *   rótulo del campo: «Número de repeticiones (1–12)»
 *
 * DÓNDE VIVE EL CÁLCULO — calcular1RM de lib/calculadoras/deporte.ts (motor COMPARTIDO: también lo
 * usan la herramienta MCP calcular_1rm_gimnasio y /api/chatgpt/1rm-gimnasio)
 *   · Epley   = r === 1 ? w : w · (1 + r/30)                 (Epley, 1985)
 *   · Brzycki = r === 1 ? w : w / (1,0278 − 0,0278 · r)       (Brzycki, 1993; ≈ w · 36/(37 − r))
 *   · Media   = (Epley + Brzycki) / 2, media ARITMÉTICA simple
 *   · Tabla   = Media sin redondear × 100, 95 … 60 %, redondeada a 1 decimal
 *   · Aviso solo con r > 12. La página descarta EN SILENCIO peso ≤ 0, NaN o r < 1 (`return`).
 *
 * ─────────────────────────────────────────────────────────────────────────────────────────
 * LOS TRES CASOS, RESUELTOS A MANO ANTES DE ABRIR EL NAVEGADOR
 *
 *   CASO 1 (normal) — 100 kg × 5 repeticiones
 *     Epley   = 100 × (1 + 5/30)            = 116,667 → «116,7 kg»
 *     Brzycki = 100 / (1,0278 − 0,139)      = 100 / 0,8888 = 112,511 → «112,5 kg»
 *               (con la forma 36/(37 − r): 100 × 36/32 = 112,5, igual a un decimal)
 *     Media   = (116,667 + 112,511) / 2     = 114,589 → «114,6 kg»
 *     Tabla   = 114,589 × 1,00 / 0,95 / 0,90 / 0,85 / 0,80 / 0,75 / 0,70 / 0,65 / 0,60
 *             = 114,6 · 108,9 · 103,1 · 97,4 · 91,7 · 85,9 · 80,2 · 74,5 · 68,8
 *     Y con coma decimal, 102,5 kg × 3: Epley 102,5 × 1,1 = 112,75 → «112,8» · Brzycki
 *     102,5 / 0,9444 = 108,535 → «108,5» · Media 110,642 → «110,6».
 *
 *   CASO 2 (límite)
 *     2a · 100 × 1  → el propio peso en las tres: «100,0 kg»; tabla 100,0 · 95,0 … 60,0
 *     2b · 100 × 12 (el máximo del rótulo) → Epley 100 × 1,4 = «140,0» · Brzycki 100 / 0,6942
 *          = 144,051 → «144,1» · Media 142,025 → «142,0»; sin aviso (12 no es > 12)
 *     2c · 100 × 13 → aparece el aviso de «más de 12 repeticiones»
 *     2d · donde Brzycki deja de existir: 1,0278 − 0,0278 r = 0 en r = 36,97
 *          100 × 36 → 100 / 0,027 = 3703,7 kg (37 veces el peso) · Media 1961,9
 *          100 × 37 → 100 / (−0,0008) = −125.000 kg · Media −62.388,3
 *          Esperado: lo que el rótulo promete (1–12) o, como mínimo, ningún kilo negativo ni
 *          absurdo. HALLAZGO ABIERTO.
 *
 *   CASO 3 (rechazo) — 0 repeticiones, peso −50, peso 0 y peso ilegible pegado («abc»)
 *     Esperado: ninguna cifra y un aviso que diga qué falla. Obtenido: no pasa nada, y si había un
 *     resultado anterior se queda en pantalla como si fuera el de los datos nuevos. HALLAZGO ABIERTO.
 *
 * Los test con test.fail() son HALLAZGOS ABIERTOS: el día que se reparen, fallarán por pasar y habrá
 * que quitarles el test.fail() (y cambiar ABIERTO por REPARADO).
 */

const RUTA = '/calculadora-1rm-gimnasio/';
const SEL_PESO = 'input[aria-label="Peso levantado (kg)"]';
const SEL_REPS = 'input[aria-label="Número de repeticiones (1–12)"]';

async function abrir(page: Page): Promise<void> {
  await page.goto(RUTA);
  await esperarHidratacion(page, [SEL_PESO, SEL_REPS]);
}

async function rellenar(page: Page, peso: string, reps: string): Promise<void> {
  await page.locator(SEL_PESO).fill(peso);
  await esperarValorEnReact(page, SEL_PESO, peso);
  await page.locator(SEL_REPS).fill(reps);
  await esperarValorEnReact(page, SEL_REPS, reps);
}

const boton = (page: Page) => page.getByRole('button', { name: 'Calcular repetición máxima' });

async function calcular(page: Page, peso: string, reps: string): Promise<void> {
  await rellenar(page, peso, reps);
  await boton(page).click();
}

/** La cifra de una tarjeta de resultado (h3 → cabecera → tarjeta → p > span). */
const valor = (page: Page, titulo: string) =>
  page
    .getByRole('heading', { level: 3, name: titulo, exact: true })
    .locator('xpath=../..')
    .locator('p > span')
    .first();

/** La región viva del aviso de entrada, justo detrás del botón (siempre montada; vacía sin aviso). */
const avisoEntrada = (page: Page) => boton(page).locator('xpath=following-sibling::*[@role="alert"][1]');

const tabla = (page: Page) =>
  page.getByRole('table', { name: 'Tabla de cargas por porcentaje del 1RM' });

async function filas(page: Page): Promise<string[][]> {
  return tabla(page)
    .locator('tbody tr')
    .evaluateAll((trs) =>
      trs.map((tr) => Array.from(tr.querySelectorAll('td')).map((td) => (td.textContent ?? '').trim())),
    );
}

const TITULOS = ['Fórmula Epley', 'Fórmula Brzycki', 'Media (más fiable)'];

/** Todas las cifras en kg que pintan las tarjetas y la tabla, ya convertidas a número. */
async function kilosPintados(page: Page): Promise<number[]> {
  const textos: string[] = [];
  for (const t of TITULOS) {
    if ((await valor(page, t).count()) > 0) textos.push((await valor(page, t).textContent()) ?? '');
  }
  textos.push(...(await tabla(page).locator('tbody td:nth-child(2)').allTextContents()));
  return textos
    .filter((t) => /kg$/.test(t.trim()))
    .map((t) => Number(t.replace(/\s*kg$/, '').replace(/\./g, '').replace(',', '.').replace('−', '-')));
}

interface BloqueJsonLd {
  '@type'?: string;
  featureList?: string[];
  mainEntity?: { name: string; acceptedAnswer: { text: string } }[];
}

async function bloquesJsonLd(page: Page): Promise<BloqueJsonLd[]> {
  const textos = await page.locator('script[type="application/ld+json"]').allTextContents();
  return textos.flatMap((t) => {
    const j = JSON.parse(t) as BloqueJsonLd | BloqueJsonLd[];
    return Array.isArray(j) ? j : [j];
  });
}

async function faqTexto(page: Page): Promise<string> {
  const faq = (await bloquesJsonLd(page)).find((b) => b['@type'] === 'FAQPage');
  return (faq?.mainEntity ?? []).map((q) => q.acceptedAnswer.text).join(' ');
}

test.describe('calculadora-1rm-gimnasio · escritorio', () => {
  test.beforeEach(async ({ page }) => {
    await abrir(page);
  });

  test('CASO 1 · 100 kg × 5 → Epley 116,7 · Brzycki 112,5 · Media 114,6 y su tabla', async ({ page }) => {
    await calcular(page, '100', '5');
    await expect(valor(page, 'Fórmula Epley')).toHaveText('116,7 kg');
    await expect(valor(page, 'Fórmula Brzycki')).toHaveText('112,5 kg');
    await expect(valor(page, 'Media (más fiable)')).toHaveText('114,6 kg');
    const f = await filas(page);
    expect(f.map((r) => r[1])).toEqual([
      '114,6 kg', '108,9 kg', '103,1 kg', '97,4 kg', '91,7 kg', '85,9 kg', '80,2 kg', '74,5 kg', '68,8 kg',
    ]);
    // Repeticiones aproximadas: coherentes con las dos fórmulas invertidas (75 % → 10 reps en ambas)
    expect(f.map((r) => r[2])).toEqual(['1', '2', '3–4', '5–6', '7–8', '9–10', '11–13', '14–16', '17–20']);
    // Sin aviso con 5 repeticiones
    await expect(page.getByText('menos precisas con más de 12 repeticiones')).toHaveCount(0);
  });

  test('CASO 1b · coma decimal: 102,5 kg × 3 → 112,8 · 108,5 · 110,6', async ({ page }) => {
    await calcular(page, '102,5', '3');
    await expect(valor(page, 'Fórmula Epley')).toHaveText('112,8 kg');
    await expect(valor(page, 'Fórmula Brzycki')).toHaveText('108,5 kg');
    await expect(valor(page, 'Media (más fiable)')).toHaveText('110,6 kg');
  });

  test('CASO 2a · 1 repetición da el propio peso en las tres y la tabla son los porcentajes de 100', async ({ page }) => {
    await calcular(page, '100', '1');
    for (const t of ['Fórmula Epley', 'Fórmula Brzycki', 'Media (más fiable)']) {
      await expect(valor(page, t)).toHaveText('100,0 kg');
    }
    expect((await filas(page)).map((r) => r[1])).toEqual([
      '100,0 kg', '95,0 kg', '90,0 kg', '85,0 kg', '80,0 kg', '75,0 kg', '70,0 kg', '65,0 kg', '60,0 kg',
    ]);
  });

  test('CASO 2b · 12 repeticiones (máximo del rótulo) → 140,0 · 144,1 · 142,0, sin aviso; con 13 se rechaza', async ({ page }) => {
    await calcular(page, '100', '12');
    await expect(valor(page, 'Fórmula Epley')).toHaveText('140,0 kg');
    await expect(valor(page, 'Fórmula Brzycki')).toHaveText('144,1 kg');
    await expect(valor(page, 'Media (más fiable)')).toHaveText('142,0 kg');
    await expect(avisoEntrada(page)).toHaveText('');

    // REPARADO (hallazgo 5250): el rótulo promete 1–12 y con 13 ya no se calcula. Antes salía
    // Epley 143,3 con un aviso de «menos precisas»; ahora, el aviso del rango y ninguna cifra.
    await calcular(page, '100', '13');
    await expect(avisoEntrada(page)).toContainText('de 1 a 12 repeticiones');
    await expect(page.getByText('142,0 kg')).toHaveCount(0);
  });

  test('HALLAZGO · 100 kg × 37 repeticiones no da kilos negativos', async ({ page }) => {
    // REPARADO (5250): el rótulo dice 1–12 pero se aceptaba cualquier entero ≥ 1 con solo un
    // aviso. El denominador de Brzycki (1,0278 − 0,0278 r) se anula en r = 36,97: con 37 salía
    // Brzycki «-125.000,0 kg», «Media (más fiable) -62.388,3 kg» y la tabla entera en negativo.
    // Ahora errorEntrada1RM rechaza r > 12 en la página, en la herramienta MCP (zod .max) y en
    // /api/chatgpt/1rm-gimnasio (400 con el motivo).
    // Se parte de un cálculo válido para saber cuándo ha re-renderizado (la cifra de 100 × 5 se va)
    await calcular(page, '100', '5');
    await expect(valor(page, 'Media (más fiable)')).toHaveText('114,6 kg');
    await calcular(page, '100', '37');
    await expect(page.getByText('114,6 kg')).toHaveCount(0);
    await expect(avisoEntrada(page)).toContainText('de 1 a 12 repeticiones');
    const kilos = await kilosPintados(page);
    expect(kilos.filter((k) => k <= 0)).toEqual([]);
  });

  test('HALLAZGO · 100 kg × 36 repeticiones no da un 1RM de casi dos toneladas', async ({ page }) => {
    // REPARADO (5250): 100 / (1,0278 − 1,0008) = 3703,7 kg de Brzycki y «Media (más fiable)
    // 1961,9 kg». Epley da 220,0: ninguna cifra razonable pasa de ~3 veces el peso levantado.
    await calcular(page, '100', '5');
    await expect(valor(page, 'Media (más fiable)')).toHaveText('114,6 kg');
    await calcular(page, '100', '36');
    await expect(page.getByText('114,6 kg')).toHaveCount(0);
    await expect(avisoEntrada(page)).toContainText('de 1 a 12 repeticiones');
    const kilos = await kilosPintados(page);
    expect(Math.max(0, ...kilos)).toBeLessThanOrEqual(300);
  });

  test('HALLAZGO · 0 repeticiones tras un cálculo no deja la cifra anterior en pantalla', async ({ page }) => {
    // REPARADO (5251): con 100 × 5 calculado, 0 repeticiones y «Calcular» → la página hacía
    // `return` en silencio: seguían «Media (más fiable) 114,6 kg» y la tabla, sin ningún aviso.
    await calcular(page, '100', '5');
    await expect(valor(page, 'Media (más fiable)')).toHaveText('114,6 kg');
    await calcular(page, '100', '0');
    await expect(page.getByText('114,6 kg')).toHaveCount(0);
    await expect(
      page.locator('[role="alert"]:not(#__next-route-announcer__), [aria-live]:not(#__next-route-announcer__)').filter({ hasText: /repetici/i }),
    ).toHaveCount(1);
  });

  test('HALLAZGO · peso negativo, cero o ilegible se rechazan con un aviso', async ({ page }) => {
    // REPARADO (5251): −50, 0 y «abc» pegado se descartaban en silencio (y la cifra de antes se
    // quedaba). Ahora parseSpanishNumber + errorEntrada1RM: aviso en la región viva y sin cifra.
    await calcular(page, '100', '5');
    for (const peso of ['-50', '0']) {
      await calcular(page, peso, '5');
      await expect(page.getByText('114,6 kg')).toHaveCount(0);
      await expect(avisoEntrada(page)).toContainText('peso levantado');
    }
    await sembrarValor(page, SEL_PESO, 'abc');
    await boton(page).click();
    await expect(
      page.locator('[role="alert"]:not(#__next-route-announcer__), [aria-live]:not(#__next-route-announcer__)').filter({ hasText: /peso/i }),
    ).toHaveCount(1);
  });

  test('HALLAZGO · 5,5 repeticiones no se leen en silencio como 5', async ({ page }) => {
    // REPARADO (5251): parseInt('5,5') = 5 daba el mismo resultado que 100 × 5 sin decir nada.
    // Se parte de 100 × 4 (Epley 113,333 · Brzycki 100 / 0,9166 = 109,099 · Media 111,216 → 111,2)
    // para saber cuándo ha re-renderizado.
    await calcular(page, '100', '4');
    await expect(valor(page, 'Media (más fiable)')).toHaveText('111,2 kg');
    await calcular(page, '100', '5,5');
    await expect(page.getByText('111,2 kg')).toHaveCount(0);
    await expect(page.getByText('114,6 kg')).toHaveCount(0);
    await expect(avisoEntrada(page)).toContainText('número entero');
  });

  test('el motor: Epley queda por ENCIMA de Brzycki por debajo de 10 repeticiones y por DEBAJO por encima', async ({ page }) => {
    // Contraste de la afirmación de la guía y del FAQPage (ver el hallazgo de abajo)
    await calcular(page, '100', '5');
    await expect(valor(page, 'Fórmula Epley')).toHaveText('116,7 kg');
    await expect(valor(page, 'Fórmula Brzycki')).toHaveText('112,5 kg');
    await calcular(page, '100', '12');
    await expect(valor(page, 'Fórmula Epley')).toHaveText('140,0 kg');
    await expect(valor(page, 'Fórmula Brzycki')).toHaveText('144,1 kg');
  });

  test('HALLAZGO · ni la guía ni el FAQPage dicen que Epley es la generosa en repeticiones altas', async ({ page }) => {
    // ABIERTO: FAQPage «Epley … tiende a ser ligeramente más generosa en repeticiones altas»; guía
    // «Epley … tiende a sobreestimar ligeramente el 1RM cuando se realizan muchas repeticiones» y
    // Brzycki «suele ser más conservadora». El motor (caso de arriba): por encima de 10 la mayor
    // es Brzycki (144,1 frente a 140,0 con 12); Epley solo es mayor por debajo de 10.
    test.fail();
    expect(await faqTexto(page)).not.toMatch(/Epley[^.]*m[aá]s generosa en repeticiones altas/);
    const guia = (await page.locator('[data-guia-educativa]').textContent()) ?? '';
    expect(guia).not.toMatch(/sobreestimar ligeramente el 1RM cuando se realizan muchas repeticiones/);
  });

  test('HALLAZGO · las bandas de % del 1RM son las mismas en la tabla, la guía y el FAQPage', async ({ page }) => {
    // ABIERTO: tabla 80 % → «7–8» reps y 85 % → «Fuerza + hipertrofia»; guía «85–100%: fuerza
    // máxima (1–6 repeticiones)»; FAQPage «el 80-90%, para fuerza (4-6 reps)» y, en otra respuesta,
    // «85-95% para fuerza máxima».
    test.fail();
    await calcular(page, '100', '5');
    const f = await filas(page);
    const fila85 = f.find((r) => r[0].startsWith('85'));
    const guia = (await page.locator('[data-guia-educativa]').textContent()) ?? '';
    const guiaFuerzaMaxDesde85 = /85[–-]100\s*%[^.]*fuerza máxima/i.test(guia);
    expect(guiaFuerzaMaxDesde85 ? /fuerza máxima/i.test(fila85?.[3] ?? '') : true).toBe(true);
    expect(await faqTexto(page)).not.toMatch(/80-90%, para fuerza \(4-6 reps\)/);
  });

  test('HALLAZGO · features no promete una «media ponderada» que el motor no hace', async ({ page }) => {
    // ABIERTO: el motor hace (Epley + Brzycki) / 2: con 100 × 5, (116,667 + 112,511) / 2 = 114,6.
    test.fail();
    const app = (await bloquesJsonLd(page)).find((b) => b['@type'] === 'WebApplication');
    const lista = app?.featureList ?? [];
    expect(lista.length).toBeGreaterThanOrEqual(4);
    expect(lista.join(' ')).not.toMatch(/ponderada/i);
  });

  test('HALLAZGO · la app de la suite salud monta su DisclaimerCard', async ({ page }) => {
    // ABIERTO: page.tsx lleva «// @disclaimer: exempt». Suites salud + tecnicas → nivel 2 ALTO
    // (no colapsable) según la política; sus hermanas calculadora-zonas-cardiacas y
    // calculadora-potencia-ciclismo montan severity="high". El FAQPage habla de riesgo de lesión.
    test.fail();
    await expect(page.getByRole('note')).toHaveCount(1);
  });

  test('HALLAZGO · el resultado se anuncia y el botón se llama como se lee', async ({ page }) => {
    // ABIERTO: las tarjetas y la tabla aparecen fuera de toda región viva (solo el aviso de > 12
    // la tiene) y el botón visible «Calcular 1RM» se llama «Calcular repetición máxima» (WCAG
    // 2.5.3: el nombre accesible debe contener el texto visible).
    test.fail();
    await calcular(page, '100', '5');
    await expect(
      page.locator('[aria-live]:not(#__next-route-announcer__), [role="status"]').filter({ hasText: '114,6 kg' }),
    ).toHaveCount(1);
    await expect(page.getByRole('button', { name: /Calcular 1RM/ })).toHaveCount(1);
  });

  test('HALLAZGO · en oscuro, «100%» de la fila destacada llega a 4,5:1', async ({ page }) => {
    // ABIERTO: --primary-texto sobre el tinte rgba(46,134,171,0,18) de .rowMax encima de la tarjeta
    // #2A2A2A: medido 4,19:1 (texto de 15,2 px en negrita: no es «grande», pide 4,5:1).
    // El tema se pone ANTES de calcular: cambiarlo con la tabla ya pintada mide a mitad de la
    // transición de color (2,54:1 con el texto aún del tema claro), que no es el estado estable.
    test.fail();
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
    await calcular(page, '100', '5');
    const celda = tabla(page).locator('tbody tr').first().locator('td').first();
    await expect(celda).toHaveText(/^100/);
    expect(await contrasteSobreFondoReal(celda)).toBeGreaterThanOrEqual(4.5);
  });

  test('HALLAZGO · el porcentaje lleva espacio duro (100 %)', async ({ page }) => {
    // ABIERTO: la tabla pinta «100%», «95%»… (regla de formato del 25/09/2026: «15 %» con U+00A0).
    test.fail();
    await calcular(page, '100', '5');
    expect((await filas(page))[0][0]).toBe('100 %');
  });
});

test.describe('calculadora-1rm-gimnasio · móvil (Pixel 7)', () => {
  test.use({
    viewport: devices['Pixel 7'].viewport,
    userAgent: devices['Pixel 7'].userAgent,
    deviceScaleFactor: devices['Pixel 7'].deviceScaleFactor,
    isMobile: true,
    hasTouch: true,
  });

  test.beforeEach(async ({ page }) => {
    await abrir(page);
  });

  test('el cálculo es el mismo tocando el botón', async ({ page }) => {
    await rellenar(page, '100', '5');
    await boton(page).tap();
    await expect(valor(page, 'Media (más fiable)')).toHaveText('114,6 kg');
  });

  test('HALLAZGO · tras tocar «Calcular 1RM» la cifra queda a la vista', async ({ page }) => {
    // ABIERTO: medido a 412 × 839, la tarjeta «Media» queda con su borde superior a 1155 px, por
    // debajo de la ventana: en pantalla no cambia nada y el foco se queda en el botón.
    test.fail();
    await rellenar(page, '100', '5');
    await boton(page).scrollIntoViewIfNeeded();
    await boton(page).tap();
    await expect(valor(page, 'Media (más fiable)')).toBeInViewport();
  });

  test('HALLAZGO · la cabecera «Uso habitual» no queda sobre una columna vacía', async ({ page }) => {
    // ABIERTO: por debajo de 768 px el CSS oculta las celdas de «Uso habitual» (td) pero no su
    // <th>: la cabecera ocupa ~75 px sobre nada y el peso se parte en dos líneas («146,7 / kg»).
    test.fail();
    await rellenar(page, '100', '5');
    await boton(page).tap();
    await expect(tabla(page)).toBeVisible();
    const cabecera = tabla(page).getByRole('columnheader', { name: 'Uso habitual' });
    const celda = tabla(page).locator('tbody tr').first().locator('td').nth(3);
    const cabeceraVisible = await cabecera.isVisible();
    const celdaVisible = await celda.isVisible();
    expect(cabeceraVisible).toBe(celdaVisible);
  });
});
