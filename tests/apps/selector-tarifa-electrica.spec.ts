import { test, expect, Page, devices } from '@playwright/test';

/**
 * Selector de Tarifa Eléctrica (selector-tarifa-electrica) — inspección del 10/10/2026
 *
 * QUÉ PROMETE LA APP
 *   <h1> «Selector de Tarifa Electrica»: «Responde 10 preguntas y descubre si te conviene mas
 *   PVPC o mercado libre». El JSON-LD añade «Estimacion de coste anual para cada opcion».
 *   Las diez preguntas están todas en la misma pantalla (sin «Siguiente»), cada una en un
 *   role="radiogroup"; «Ver recomendacion» se activa con las diez respondidas.
 *
 * EL MOTOR (calcularResultado, app/selector-tarifa-electrica/page.tsx:152-297), de donde sale
 * cada valor esperado. Se resolvió a mano ANTES de abrir el navegador.
 *
 *   puntos  P1 1 persona +1 · 2 personas 0 · 3-4 −1 · 5 o más −2
 *           P2 Sí +2 · No −1 · No sé 0              P3 mediodía −2 · noche −1 · variable 0
 *           P4 siempre +3 · a veces +1 · nunca −2   P5 AC mucho −2 · poco 0 · no tengo +1
 *           P6 coche Sí +3 · No 0                   P7 teletrabajo siempre −2 · híbrido −1 · No +1
 *           P8 me da igual +2 · precio fijo −3 · no entiendo −1
 *           P9 <200 +2 · 200-400 0 · >400 −1        P10 placas Sí +3 · No 0
 *           ≥ 4 → «PVPC (tarifa regulada)» · ≤ −3 → «Mercado libre (precio fijo)» · resto «Ambas»
 *
 *   coste   kWh/mes 150 · 300 · 500 según P9; reparto punta/llano/valle 0,35/0,30/0,35
 *           (P4 siempre 0,25/0,25/0,50 · P4 nunca 0,45/0,35/0,20; P7 siempre: punta +0,10,
 *           valle −0,10; P6 coche: valle +0,15, punta −0,08, llano −0,07)
 *           PVPC = kWh·año × (punta·0,22 + llano·0,16 + valle·0,10) + (0,10 + 0,04) × 365
 *           libre = kWh·año × 0,18 + (0,10 + 0,04) × 365          [potencia = 51,10 € fijos]
 *   Precios escritos a mano en page.tsx:41-54 («media 2024-2025»): no hay módulo de
 *   electricidad en data/fiscal, así que el esperado se ancla al motor de la propia app.
 *
 * REPARADO el 12/10/2026 (hallazgos 3166, 3167 y 3174, opción A que decidió el usuario): la
 * estimación de coste de arriba, la etiqueta «Más barata» y los precios escritos a mano se
 * RETIRARON hasta tener los precios en data/ con fuente y <DataReference>. Las barras siguen
 * midiendo puntos y la pantalla dice que no compara precios. La tabla de coste se deja arriba
 * como registro de lo que la app hacía.
 *
 * REPARADOS el 20/10/2026 los diez restantes de la inspección del 10/10 (3168-3173, 3175-3178):
 * foco al resultado, contraste, nombre y teclado de los radios, tildes, FAQ única del cambio de
 * tarifa, Bono Social desde data/fiscal, singular del botón, «%» con espacio duro y RegionBadge.
 *
 * Los casos que demuestran un hallazgo ABIERTO van con test.fail().
 */

// ─────────────────────────────────────────────────────────────────────────────
// Ayudantes
// ─────────────────────────────────────────────────────────────────────────────

/**
 * La app no tiene ningún <input>: el testigo de hidratación es que React haya colgado sus
 * props del primer radio (mismo criterio que tests/apps/selector-smartphone.spec.ts).
 */
async function esperarHidratacionBotones(page: Page): Promise<void> {
  await page.waitForFunction(
    () => {
      const b = document.querySelector('[role="radiogroup"] button');
      return !!b && Object.keys(b).some((k) => k.startsWith('__reactProps$') || k.startsWith('__reactFiber$'));
    },
    null,
    { timeout: 20_000 },
  );
}

async function abrir(page: Page): Promise<void> {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/selector-tarifa-electrica/');
  await esperarHidratacionBotones(page);
}

/** Índice de la opción elegida en cada una de las 10 preguntas (null = sin responder). */
type Perfil = readonly (number | null)[];

async function responder(page: Page, perfil: Perfil): Promise<void> {
  for (let i = 0; i < perfil.length; i++) {
    const idx = perfil[i];
    if (idx === null) continue;
    await page.locator('[role="radiogroup"]').nth(i).locator('[role="radio"]').nth(idx).click();
  }
}

const botonVer = (page: Page) => page.locator('[class*="btnPrimary"]');

async function verResultado(page: Page): Promise<void> {
  await botonVer(page).click();
  await page.locator('[class*="resultScreen"]').waitFor();
}

async function repetir(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Repetir test' }).click();
  await expect(page.locator('[role="radio"][aria-checked="true"]')).toHaveCount(0);
}

/** Lo que dice la pantalla de resultado, ya normalizado. */
async function leerResultado(page: Page) {
  const rs = page.locator('[class*="resultScreen"]');
  const filas = rs.locator('[class*="barRow"]');
  return {
    recomendacion: ((await rs.locator('[class*="resultProfile"]').textContent()) ?? '').trim(),
    filaPvpc: ((await filas.nth(0).textContent()) ?? '').replace(/\s+/g, ' '),
    filaLibre: ((await filas.nth(1).textContent()) ?? '').replace(/\s+/g, ' '),
    texto: ((await rs.textContent()) ?? '').replace(/\s+/g, ' '),
    barras: await rs.locator('[role="img"]').evaluateAll((els) => els.map((e) => e.getAttribute('aria-label'))),
    factores: await rs
      .locator('[class*="factorItem"]')
      .evaluateAll((els) => els.map((e) => (e.textContent ?? '').replace('📌', '').trim())),
  };
}

const MAS_BARATA = /M[aá]s barata/;
/** Un importe en euros: desde el 12/10/2026 el resultado no debe llevar ninguno. */
const IMPORTE = /\d\s*€/;
const NO_COMPARA = /No es una comparación de precios/;

// Perfiles (índice de opción por pregunta), cada uno con su suma calculada a mano.
// «Amante del valle»: +1 +2 0 +3 +1 +3 +1 +2 +2 0 = 15 → PVPC.
const AMANTE_VALLE: Perfil = [0, 0, 2, 0, 2, 0, 2, 0, 0, 1];
// Umbral PVPC: 0 0 0 +1 0 0 −1 +2 +2 0 = 4 → PVPC…
const UMBRAL_4: Perfil = [1, 2, 2, 1, 1, 1, 1, 0, 0, 1];
// …y cambiando SOLO P1 a «3-4 personas» (−1): 3 → Ambas.
const UMBRAL_3: Perfil = [2, 2, 2, 1, 1, 1, 1, 0, 0, 1];
// Mínimo absoluto: −2 −1 −2 −2 −2 0 −2 −3 −1 0 = −15 → Mercado libre.
const MINIMO: Perfil = [3, 1, 0, 2, 0, 1, 0, 1, 2, 1];
// Familia con teletrabajo: −1 −1 −2 +1 −2 0 −2 −3 0 0 = −10 → Mercado libre.
const TELETRABAJO: Perfil = [2, 1, 0, 1, 0, 1, 0, 1, 1, 1];
// Umbral libre: 3-4 personas −1 · No sé 0 · noche −1 · a veces +1 · AC poco 0 · sin coche 0 ·
// híbrido −1 · «No entiendo» −1 · 200-400 0 · sin placas 0 = −3 → Mercado libre.
const UMBRAL_MENOS_3: Perfil = [2, 2, 1, 1, 1, 1, 1, 2, 1, 1];

// ─────────────────────────────────────────────────────────────────────────────
// 1. Caso normal
// ─────────────────────────────────────────────────────────────────────────────

test('caso normal: «amante del valle» → PVPC, sin importes, y sus tres factores', async ({ page }) => {
  // A mano: 15 puntos → PVPC. Hasta el 12/10/2026 mostraba «~287,26 €» frente a «~375,10 €» con
  // la PVPC «Más barata»; la estimación se retiró (hallazgos 3166, 3167, 3174).
  await abrir(page);
  await responder(page, AMANTE_VALLE);
  await verResultado(page);
  const r = await leerResultado(page);

  expect(r.recomendacion).toBe('PVPC (tarifa regulada)');
  expect(r.texto).not.toMatch(IMPORTE);
  expect(r.texto).not.toMatch(MAS_BARATA);
  expect(r.texto).toMatch(NO_COMPARA);
  expect(r.barras).toEqual(['Puntuación PVPC: 15', 'Puntuación mercado libre: 0']);
  // P6 Sí → coche · P4 siempre → electrodomésticos · P9 <200 → consumo bajo (en ese orden)
  expect(r.factores).toEqual([
    'Cargar el coche eléctrico en valle (00-08 h) reduce mucho el coste con PVPC',
    'Usar electrodomésticos siempre en valle te da una gran ventaja en PVPC',
    'Con consumo bajo, el ahorro del PVPC en valle es muy significativo proporcionalmente',
  ]);
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. Caso límite: umbrales y extremo
// ─────────────────────────────────────────────────────────────────────────────

test('caso límite: 4 puntos es PVPC y 3 es «Ambas»; el mínimo (−15) es libre', async ({ page }) => {
  test.setTimeout(60_000);
  await abrir(page);

  // 4 puntos → PVPC.
  await responder(page, UMBRAL_4);
  await verResultado(page);
  let r = await leerResultado(page);
  expect(r.recomendacion).toBe('PVPC (tarifa regulada)');

  // 3 puntos: solo cambia P1 → «Ambas».
  await repetir(page);
  await responder(page, UMBRAL_3);
  await verResultado(page);
  r = await leerResultado(page);
  expect(r.recomendacion).toBe('Ambas pueden funcionar para ti');

  // −15 puntos → Mercado libre, sin ningún importe ni «Más barata».
  await repetir(page);
  await responder(page, MINIMO);
  await verResultado(page);
  r = await leerResultado(page);
  expect(r.recomendacion).toBe('Mercado libre (precio fijo)');
  expect(r.texto).not.toMatch(IMPORTE);
  expect(r.texto).not.toMatch(MAS_BARATA);
  expect(r.barras).toEqual(['Puntuación PVPC: 0', 'Puntuación mercado libre: 15']);
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. Caso que debe rechazarse: cuestionario incompleto
// ─────────────────────────────────────────────────────────────────────────────

test('caso rechazado: con 9 de 10 respondidas no hay resultado, ni forzando el clic', async ({ page }) => {
  await abrir(page);
  await expect(botonVer(page)).toBeDisabled();
  await expect(botonVer(page)).toHaveText('Responde las 10 preguntas restantes');

  await responder(page, [0, 0, 2, 0, 2, 0, 2, 0, 0, null]);
  await expect(botonVer(page)).toBeDisabled();
  await expect(page.locator('[class*="progressText"]')).toHaveText('9 de 10 preguntas respondidas');
  // La barra pinta lo que dice el texto: 9/10 del ancho.
  await expect
    .poll(() =>
      page.locator('[class*="progressBar"]').evaluate((el) => {
        const relleno = el.firstElementChild as HTMLElement;
        return relleno.getBoundingClientRect().width / el.clientWidth;
      }),
    )
    .toBeCloseTo(0.9, 2);
  await botonVer(page).click({ force: true });
  await expect(page.locator('[class*="resultScreen"]')).toHaveCount(0);

  // Con la décima, sí.
  await page.locator('[role="radiogroup"]').nth(9).locator('[role="radio"]').nth(1).click();
  await expect(botonVer(page)).toBeEnabled();
  await expect(botonVer(page)).toHaveText(/Ver recomendaci[oó]n/);
});

test('las opciones son radios: aria-checked, sin aria-pressed, y una sola marcada por pregunta', async ({ page }) => {
  await abrir(page);
  const grupo = page.locator('[role="radiogroup"]').first();
  await expect(grupo.locator('[role="radio"]')).toHaveCount(4);
  await expect(page.locator('[role="radiogroup"] [aria-pressed]')).toHaveCount(0);
  await grupo.locator('[role="radio"]').nth(1).click();
  await grupo.locator('[role="radio"]').nth(0).click();
  await expect(grupo.locator('[aria-checked="true"]')).toHaveCount(1);
  await expect(grupo.locator('[role="radio"]').nth(0)).toHaveAttribute('aria-checked', 'true');
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. Hallazgos ABIERTOS (inspector 10/10/2026)
// ─────────────────────────────────────────────────────────────────────────────

test('hallazgo 3166: la pantalla no recomienda «Mercado libre» mientras marca PVPC como «Más barata»', async ({ page }) => {
  // REPARADO (12/10/2026), opción A del usuario: se retiró la estimación de coste y la etiqueta,
  // y la pantalla dice que no compara precios. Antes (inspector 10/10/2026): La recomendación sale de la suma de puntos y la etiqueta
  // «Mas barata», del coste estimado: son dos motores que no se miran. Con los precios de la
  // propia app el PVPC sale más barato en 11 de los 12 repartos posibles, así que en 6.256 de
  // los 7.599 perfiles que reciben «Mercado libre» (82 %) la misma pantalla dice que el PVPC es
  // más barato. Censo completo: 6.284 de 34.992 perfiles (18 %) se contradicen.
  //
  // TELETRABAJO, a mano: −10 puntos → Mercado libre. 300 kWh/mes = 3.600 kWh/año; P4 a veces +
  // P7 siempre → 0,45/0,30/0,25 → 0,099 + 0,048 + 0,025 = 0,172 → PVPC 619,20 + 51,10 = 670,30 €
  // · libre 648,00 + 51,10 = 699,10 €. Es el perfil «Pico en punta» de la guía, que afirma que
  // ahí «el PVPC [es] significativamente mas caro que un precio fijo plano».
  await abrir(page);
  await responder(page, TELETRABAJO);
  await verResultado(page);
  let r = await leerResultado(page);
  expect(r.recomendacion).toBe('Mercado libre (precio fijo)');
  expect(r.texto).not.toMatch(IMPORTE);
  expect(r.texto).toMatch(NO_COMPARA);
  expect(/Mercado libre/.test(r.recomendacion) && MAS_BARATA.test(r.filaPvpc), 'recomienda libre y llama más barata a PVPC').toBe(false);

  // UMBRAL_MENOS_3 (−3 → libre), 3.600 kWh con reparto base 0,160 → PVPC 627,10 € · libre 699,10 €,
  // y el único factor que lista es «Tu perfil de consumo es equilibrado entre ambas opciones».
  await repetir(page);
  await responder(page, UMBRAL_MENOS_3);
  await verResultado(page);
  r = await leerResultado(page);
  expect(/Mercado libre/.test(r.recomendacion) && MAS_BARATA.test(r.filaPvpc), 'umbral −3').toBe(false);
});

test('hallazgo 3167: no se muestra un coste anual con la potencia en 51,10 € fijos', async ({ page }) => {
  // REPARADO (12/10/2026) al retirar la estimación (opción A de 3166): ya no hay coste anual que
  // pueda contar mal la potencia, ni la guía da cifras de potencia sin fuente. Antes (inspector
  // 10/10/2026): El término de potencia se suma como (0,10 + 0,04) × 365 =
  // 51,10 € sin multiplicar por los kW contratados, que la app ni pregunta. La propia guía fija
  // la unidad: «Bajar de 5,75 a 4,6 kW puede ahorrar 40-60 euros al ano» solo cuadra si son
  // €/kW·día (1,15 kW × 0,14 × 365 = 58,77 €). Con esos precios y los 4,6 kW de su ejemplo, la
  // potencia son 4,6 × 51,10 = 235,06 €/año; la app cobra 51,10 en cualquier perfil.
  // TELETRABAJO: libre 699,10 € − 3.600 kWh × 0,18 = 51,10 € de potencia implícita.
  await abrir(page);
  await responder(page, TELETRABAJO);
  await verResultado(page);
  const r = await leerResultado(page);
  expect(r.texto).not.toMatch(IMPORTE);
  const html = await (await page.request.get('/selector-tarifa-electrica/')).text();
  expect(html).not.toContain('5,75 a 4,6 kW');
  expect(html).not.toMatch(/Estimaci[oó]n de coste anual/i);
});

test('ortografía: «España», «Eléctrica» y «recomendación» con sus tildes y eñes (hallazgo 3172)', async ({ page }) => {
  // REPARADO (20/10/2026). Toda la pantalla y el metadata estaban escritos sin tildes ni eñes, y
  // el <title> que muestra el buscador decía «Mercado Libre Espana». El «~287,26 €/ano» del caso
  // ya no existe: la estimación de coste se retiró el 12/10/2026.
  await abrir(page);
  expect(await page.title()).toContain('España');
  await expect(page.locator('h1')).toContainText('Eléctrica');
  await expect(page.getByRole('radiogroup', { name: /Cuántas personas/ })).toHaveCount(1);
  await expect(page.locator('[role="radio"]', { hasText: 'No sé' })).toHaveCount(1);
  await responder(page, AMANTE_VALLE);
  await verResultado(page);
  await expect(page.locator('[class*="resultTitle"]')).toContainText('recomendación');
  // El texto de la página entera, guía plegada incluida, sin scripts (los nombres de clase del
  // módulo CSS llevan «Electrica» y no son texto).
  const texto = await page.evaluate(() => {
    const copia = document.body.cloneNode(true) as HTMLElement;
    copia.querySelectorAll('script, style').forEach((n) => n.remove());
    return copia.textContent ?? '';
  });
  expect(texto).not.toMatch(/Espana|Electrica|recomendacion|Cuantas|Mas barata|Que es|\bano\b/);
});

test('con una sola pregunta pendiente el botón no dice «las 1 preguntas restantes» (hallazgo 3176)', async ({ page }) => {
  // REPARADO (20/10/2026). page.tsx interpolaba el número en un texto siempre en plural.
  await abrir(page);
  await responder(page, [0, 0, 2, 0, 2, 0, 2, 0, 0, null]);
  await expect(botonVer(page)).toHaveText('Responde la pregunta que falta');
  await expect(botonVer(page)).toHaveAccessibleName('Responde la pregunta que falta');
});

test('el nombre de cada grupo de radios es su pregunta, no «Pregunta N» (hallazgo 3170)', async ({ page }) => {
  // REPARADO (20/10/2026). aria-label={`Pregunta ${id}`} en el radiogroup y el enunciado en un
  // <p> sin asociar: con lector de pantalla, al entrar en el grupo se oía «Pregunta 2, grupo» y
  // luego «Sí / No / No sé», sin la pregunta. Ahora aria-labelledby apunta al enunciado.
  await abrir(page);
  await expect(page.getByRole('radiogroup', { name: /Cu[aá]ntas personas viven en tu hogar/ })).toHaveCount(1);
  await expect(page.getByRole('radiogroup', { name: /discriminaci[oó]n horaria/ })).toHaveCount(1);
  await expect(page.getByRole('radiogroup', { name: /^Pregunta \d+$/ })).toHaveCount(0);
});

test('teclado del patrón de radios: la flecha mueve y marca, y el grupo es una sola parada de Tab (hallazgo 3171)', async ({ page }) => {
  // REPARADO (20/10/2026), cabo C0016. Un role="radio" promete el teclado del patrón APG
  // (referencia: selector-smartphone, b0f31109). Medido el 10/10: ArrowDown y ArrowRight sobre
  // «1 persona» no movían el foco ni marcaban nada; los cuatro radios tenían tabindex 0 y el
  // cuestionario eran 29 paradas de Tab.
  await abrir(page);
  const radios = page.locator('[role="radiogroup"]').first().locator('[role="radio"]');
  // Sin respuesta, la primera es la única parada.
  expect(await radios.evaluateAll((els) => els.map((e) => (e as HTMLElement).tabIndex))).toEqual([0, -1, -1, -1]);
  await radios.nth(0).focus();
  await page.keyboard.press('ArrowDown');
  await expect(radios.nth(1)).toBeFocused({ timeout: 1_000 });
  await expect(radios.nth(1)).toHaveAttribute('aria-checked', 'true', { timeout: 1_000 });
  expect(await radios.evaluateAll((els) => els.map((e) => (e as HTMLElement).tabIndex))).toEqual([-1, 0, -1, -1]);
  await page.keyboard.press('ArrowRight');
  await expect(radios.nth(2)).toBeFocused();
  await expect(radios.nth(2)).toHaveAttribute('aria-checked', 'true');
  await page.keyboard.press('End');
  await expect(radios.nth(3)).toBeFocused();
  // Vuelta al principio desde la última.
  await page.keyboard.press('ArrowDown');
  await expect(radios.nth(0)).toBeFocused();
  await expect(radios.nth(0)).toHaveAttribute('aria-checked', 'true');
  await expect(page.locator('[role="radiogroup"]').first().locator('[aria-checked="true"]')).toHaveCount(1);
  // Tab sale del grupo al siguiente: la 1.ª opción de la pregunta 2.
  await page.keyboard.press('Tab');
  await expect(page.locator('[role="radiogroup"]').nth(1).locator('[role="radio"]').first()).toBeFocused();
});

/**
 * Contraste MÍNIMO del texto contra su fondo real (la misma medida que
 * tests/apps/selector-smartphone.spec.ts): esquinas de cada línea, opacidad acumulada y capas
 * de fondo compuestas hasta la primera opaca; los degradados lineales se evalúan en el punto.
 */
async function contrasteMinimo(page: Page, selector: string): Promise<number> {
  return page.locator(selector).first().evaluate((el) => {
    type RGBA = { r: number; g: number; b: number; a: number };
    const parse = (s: string): RGBA => {
      const p = (s.match(/rgba?\(([^)]+)\)/)?.[1] ?? '0,0,0,0').split(/[ ,/]+/).filter(Boolean).map(Number);
      return { r: p[0], g: p[1], b: p[2], a: p[3] ?? 1 };
    };
    const lum = (c: RGBA) => {
      const f = (v: number) => { const s = v / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; };
      return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
    };
    const ratio = (x: RGBA, y: RGBA) => { const [a, b] = [lum(x), lum(y)].sort((p, q) => q - p); return (a + 0.05) / (b + 0.05); };
    const sobre = (arriba: RGBA, abajo: RGBA): RGBA => ({
      r: arriba.r * arriba.a + abajo.r * (1 - arriba.a),
      g: arriba.g * arriba.a + abajo.g * (1 - arriba.a),
      b: arriba.b * arriba.a + abajo.b * (1 - arriba.a),
      a: 1,
    });
    const degradadoEn = (n: Element, x: number, y: number): RGBA => {
      const img = getComputedStyle(n).backgroundImage;
      const paradas = [...img.matchAll(/rgba?\([^)]+\)/g)].map((m) => parse(m[0]));
      const ang = (Number(img.match(/(-?[\d.]+)deg/)?.[1] ?? 180) * Math.PI) / 180;
      const c = n.getBoundingClientRect();
      const L = Math.abs(c.width * Math.sin(ang)) + Math.abs(c.height * Math.cos(ang));
      const u = Math.min(1, Math.max(0, 0.5 + ((x - (c.left + c.width / 2)) * Math.sin(ang) - (y - (c.top + c.height / 2)) * Math.cos(ang)) / L));
      const [p0, p1] = [paradas[0], paradas[paradas.length - 1]];
      return { r: p0.r + (p1.r - p0.r) * u, g: p0.g + (p1.g - p0.g) * u, b: p0.b + (p1.b - p0.b) * u, a: 1 };
    };
    const fondoEn = (x: number, y: number): RGBA => {
      const capas: RGBA[] = [];
      for (let n: Element | null = el; n; n = n.parentElement) {
        if (getComputedStyle(n).backgroundImage.includes('gradient')) { capas.push(degradadoEn(n, x, y)); break; }
        const c = parse(getComputedStyle(n).backgroundColor);
        if (c.a > 0) { capas.push(c); if (c.a >= 1) break; }
      }
      let f: RGBA = { r: 255, g: 255, b: 255, a: 1 };
      for (let i = capas.length - 1; i >= 0; i--) f = sobre(capas[i], f);
      return f;
    };
    let op = 1;
    for (let n: Element | null = el; n; n = n.parentElement) op *= Number(getComputedStyle(n).opacity);
    const color = parse(getComputedStyle(el).color);
    const rango = document.createRange();
    rango.selectNodeContents(el);
    let min = Infinity;
    for (const t of [...rango.getClientRects()].filter((q) => q.width > 0)) {
      for (const [x, y] of [[t.left + 1, t.top + 1], [t.right - 1, t.bottom - 1], [t.left + 1, t.bottom - 1], [t.right - 1, t.top + 1]]) {
        const bg = fondoEn(x, y);
        min = Math.min(min, ratio(sobre({ ...color, a: color.a * op }, bg), bg));
      }
    }
    return min;
  });
}

test('textos pequeños de marca llegan a 4,5:1 en los dos temas (hallazgo 3169)', async ({ page }) => {
  // REPARADO (20/10/2026). Medido el 10/10/2026 (ninguno es texto grande):
  //   «Pregunta N de 10» (13,6 px/600, blanco sobre #2E86AB)      4,11:1 claro y oscuro
  //   opción marcada (14,4 px/600, --primary sobre su tinte)      3,56 claro · 3,06 oscuro
  //   «Ver recomendacion» (17,6 px/600, blanco sobre degradado)   3,24 claro y oscuro
  //   «Mas barata» (12 px/700, #16a34a sobre tinte verde)          2,90 claro (ya no existe: 12/10)
  //   «Consejos para tu perfil» (16,8 px/600, --primary)          3,74 claro · 3,21 oscuro
  // El módulo redeclaraba --primary: #2E86AB en .container para los dos temas. Ahora usa la
  // marca de globals con -texto y -boton, y la opción marcada en oscuro lleva un tinte más
  // tenue (al 12 % quedaba en 4,47:1).
  await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'reduce' });
  await page.goto('/selector-tarifa-electrica/');
  await esperarHidratacionBotones(page);
  await responder(page, AMANTE_VALLE);
  await page.mouse.move(0, 0);
  const quieto = () =>
    page.waitForFunction(() => document.getAnimations().every((a) => !(a instanceof CSSTransition) || a.playState !== 'running'));
  const medidas: Record<string, number> = {};
  for (const tema of ['light', 'dark'] as const) {
    await page.evaluate((t) => document.documentElement.setAttribute('data-theme', t), tema);
    await quieto();
    medidas[`Pregunta N de 10, ${tema}`] = await contrasteMinimo(page, '[class*="questionNumber"]');
    medidas[`opción marcada, ${tema}`] = await contrasteMinimo(page, '[class*="optionBtnSelected"]');
    medidas[`Ver recomendación, ${tema}`] = await contrasteMinimo(page, '[class*="btnPrimary"]');
  }
  await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'light'));
  await verResultado(page);
  await page.mouse.move(0, 0);
  for (const tema of ['light', 'dark'] as const) {
    await page.evaluate((t) => document.documentElement.setAttribute('data-theme', t), tema);
    await quieto();
    medidas[`Consejos para tu perfil, ${tema}`] = await contrasteMinimo(page, '[class*="tipsBox"] h3');
  }
  const bajos = Object.entries(medidas).filter(([, r]) => r < 4.5).map(([k, r]) => `${k}: ${r.toFixed(2)}:1`);
  expect(bajos, 'textos por debajo de 4,5:1').toEqual([]);
});

test('el FAQPage y la FAQ visible dicen lo mismo sobre el cambio de tarifa, con la permanencia (hallazgo 3173)', async ({ page }) => {
  // REPARADO (20/10/2026): una constante en metadata.ts que importan las dos bocas, sin plazo
  // fijo (depende de la gestión con la distribuidora) y con la permanencia. Antes: visible «Si,
  // puedes cambiar en cualquier momento y sin coste. El cambio de mercado libre a PVPC es
  // inmediato (salvo permanencia contractual). El cambio de PVPC a libre [...] suele tardar 2-3
  // semanas». FAQPage (metadata.ts): «El cambio no tiene coste y suele hacerse efectivo en el
  // siguiente ciclo de facturación», sin la permanencia. Y errores comunes: «entre 1 y 3 semanas».
  await page.goto('/selector-tarifa-electrica/');
  const visible = page.locator('[class*="faqItem"]', { hasText: 'cambiar de tarifa' });
  await expect(visible).toHaveCount(1);
  const textoVisible = ((await visible.locator('p').textContent()) ?? '').trim();
  const html = await (await page.request.get('/selector-tarifa-electrica/')).text();
  const bloques = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(
    (m) => JSON.parse(m[1]) as { '@type'?: string; mainEntity?: { name: string; acceptedAnswer: { text: string } }[] },
  );
  const faq = bloques.find((b) => b['@type'] === 'FAQPage');
  const cambio = faq?.mainEntity?.find((q) => /cambiar de tarifa/i.test(q.name));
  expect(cambio, 'el FAQPage tiene la pregunta del cambio').toBeTruthy();
  expect(cambio?.acceptedAnswer.text).toMatch(/permanencia/i);
  const visibleInmediato = html.includes('es inmediato');
  const faqCiclo = (cambio?.acceptedAnswer.text ?? '').includes('siguiente ciclo de facturación');
  expect(visibleInmediato && faqCiclo, 'dos plazos distintos para el mismo cambio').toBe(false);
  // La misma respuesta, letra por letra, en las dos bocas, y ningún plazo en «Errores comunes».
  expect(textoVisible).toBe(cambio?.acceptedAnswer.text);
  expect(html).not.toMatch(/semanas|es inmediato|siguiente ciclo de facturaci/);
});

test('los porcentajes del texto llevan espacio duro antes de «%» (hallazgo 3177)', async ({ page }) => {
  // REPARADO (20/10/2026). «entre un 20% y un 35%», «100% renovable», «entre el 30% y el 40%»,
  // «un 7% mas», «un 80%», «25% (o 40%», «40-50%» (CLAUDE.md global §2, 25/09/2026).
  await abrir(page);
  const texto = (
    await page
      .locator('[class*="profileRecommendation"], [class*="tipCard"], [class*="warningList"], [class*="contentCard"], [class*="faqItem"]')
      .allTextContents()
  ).join(' ');
  expect(texto.match(/\d%/g) ?? []).toEqual([]);
});

test('una app solo de España (PVPC, 2.0TD, CNMC) lo declara con RegionBadge (hallazgo 3178)', async ({ page }) => {
  // REPARADO (20/10/2026). Sin RegionBadge, el <h1> no decía España y PVPC no existe fuera de
  // ella (CLAUDE.md del proyecto, §1.bis; precedente: hallazgo 949 de selector-smartphone). La
  // regulación es eléctrica, no fiscal: sin el enlace a los datos fiscales de Delegum.
  await abrir(page);
  const aviso = page.locator('[role="note"][aria-label*="España"]');
  await expect(aviso).toHaveCount(1);
  await expect(aviso).toContainText('Solo España');
  await expect(aviso.locator('a[href*="delegum"]')).toHaveCount(0);
});

test('hallazgo 3174: no quedan precios de la luz sin fecha ni fuente', async ({ page }) => {
  // REPARADO (12/10/2026) por retirada (opción A de 3166). Antes: PRECIOS (page.tsx:41-54), con el
  // comentario «media 2024-2025», alimentaba el «~X €/ano» y la etiqueta «Mas barata», y la guía
  // repetía «0,22 euros/kWh» y «entre 0,16 y 0,20 euros», sin año ni fuente en pantalla. Cuando
  // vuelvan, será desde un módulo de data/ con <DataReference> («Última verificación»).
  const html = await (await page.request.get('/selector-tarifa-electrica/')).text();
  expect(html).not.toMatch(/0,\d{2} euros|€\/kWh|euros\/kWh/);
});

test('el Bono Social se describe como en data/fiscal y con su fuente oficial (hallazgo 3175)', async ({ page }) => {
  // REPARADO (20/10/2026): la respuesta sale de data/fiscal/ayudas-personas.ts y enlaza la web
  // oficial. Antes, FAQ visible: «un descuento del 25% (o 40% para consumidores vulnerables
  // severos) sobre la factura PVPC», sin fuente ni fecha. data/fiscal (bono-social-electrico,
  // verificado 2026-06-11) lo describe como «Descuento sobre el precio de la energía» y remite a
  // bonosocial.gob.es; no da porcentajes.
  await abrir(page);
  const respuesta = page.locator('[class*="faqItem"]', { hasText: 'Bono Social' }).locator('p');
  const texto = (await respuesta.textContent()) ?? '';
  expect(texto).toMatch(/precio de la energ[ií]a/i);
  expect(texto).toContain('bonosocial.gob.es');
  expect(texto).not.toMatch(/\d\s*%/);
  await expect(respuesta.locator('a[href="https://www.bonosocial.gob.es"]')).toHaveCount(1);
});

// ─────────────────────────────────────────────────────────────────────────────
// Móvil: dónde aterriza el resultado
// ─────────────────────────────────────────────────────────────────────────────

test.describe('móvil (390 px)', () => {
  test.use({
    viewport: { width: 390, height: 844 },
    userAgent: devices['Pixel 7'].userAgent,
    deviceScaleFactor: 2.625,
    isMobile: true,
    hasTouch: true,
  });

  test('al tocar «Ver recomendación» se ve el encabezado del resultado y tiene el foco (hallazgo 3168)', async ({ page }) => {
    // REPARADO (20/10/2026): el foco va al encabezado del resultado, que lo desplaza a la vista,
    // y «Repetir test» lo lleva a la primera pregunta. Antes, handleVerResultado hacía
    // scrollTo({ top: 0 }) y desmontaba el botón que tenía el foco: se aterrizaba en el hero,
    // con el encabezado del resultado a 872 px (pantalla de 844) y el foco en <body>.
    await abrir(page);
    for (let i = 0; i < AMANTE_VALLE.length; i++) {
      await page.locator('[role="radiogroup"]').nth(i).locator('[role="radio"]').nth(AMANTE_VALLE[i] as number).tap();
    }
    await botonVer(page).tap();
    const titulo = page.getByRole('heading', { name: /Nuestra recomendaci[oó]n/ });
    await titulo.waitFor();
    // Se espera a que el desplazamiento TERMINE: el scroll suave de vuelta al principio pasa
    // por encima del resultado, y un toBeInViewport sin esta espera lo cazaba al vuelo.
    // (page.evaluate sí espera a la promesa; waitForFunction la daría por buena al instante.)
    await expect
      .poll(
        () =>
          page.evaluate(
            () => new Promise<boolean>((fin) => { const y = window.scrollY; setTimeout(() => fin(window.scrollY === y), 400); }),
          ),
        { timeout: 10_000 },
      )
      .toBe(true);
    await expect(titulo).toBeInViewport({ timeout: 1_000 });
    await expect(titulo).toBeFocused();

    // «Repetir test»: el foco no cae a <body>, va a la primera pregunta, que está a la vista.
    await page.getByRole('button', { name: 'Repetir test' }).tap();
    const primera = page.locator('#pregunta-1-texto');
    await expect(primera).toBeFocused();
    await expect(primera).toBeInViewport();
  });
});
