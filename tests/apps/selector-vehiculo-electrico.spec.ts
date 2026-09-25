import { test, expect, type Page, type Locator } from '@playwright/test';

/**
 * Selector de Vehículo Eléctrico (selector-vehiculo-electrico) — inspección del 25/09/2026
 *
 * QUÉ PROMETE LA APP
 *   <h1> «Selector de Vehículo Eléctrico», «Test de 10 preguntas para saber qué tipo de vehículo
 *   eléctrico o híbrido encaja con tu vida». La metadata enumera los cinco resultados posibles:
 *   «eléctrico puro (BEV), híbrido enchufable (PHEV), híbrido suave (HEV), moto eléctrica o
 *   esperar».
 *
 * EL MOTOR (app/selector-vehiculo-electrico/page.tsx, calcularResultado)
 *   Suma de pesos por opción (PREGUNTAS, l. 43-279) y gana el máximo con
 *   `totales[a] >= totales[b] ? a : b` en el orden bev, phev, hev, moto_electrica, esperar: en un
 *   empate gana en silencio el primero de esa lista. Ninguna respuesta descarta nada: todas SUMAN.
 *   Los casos se resolvieron a mano con esas tablas ANTES de abrir el navegador, y un barrido de
 *   las 124.416 combinaciones con las mismas tablas dio: BEV 64.603 · HEV 42.052 · PHEV 16.498 ·
 *   moto 1.263 · Esperar 0; 10.152 empates en cabeza.
 *
 * Los perfiles se escriben como el ÍNDICE de la opción en cada pregunta (0 = la primera), en el
 * orden de las 10 preguntas:
 *   P1 km/día · P2 carga en casa · P3 viajes largos · P4 presupuesto · P5 conducción ·
 *   P6 maletero · P7 otro vehículo · P8 ayudas · P9 ansiedad de autonomía · P10 moto.
 *
 * Los casos marcados con test.fail() vigilan un hallazgo ABIERTO: pasan en verde hoy porque la
 * aserción (lo correcto) falla, y avisarán («expected to fail but passed») cuando se repare.
 */

type Perfil = readonly [number, number, number, number, number, number, number, number, number, number];

const URL_APP = '/selector-vehiculo-electrico/';

/**
 * La app no tiene ningún <input>, así que `esperarHidratacion` de `_hidratacion.ts` no tiene
 * testigo. El equivalente para una app de solo botones (el mismo del testigo de la familia
 * `tests/familias/selectores.spec.ts`): que React haya colgado sus props de la primera opción.
 */
async function abrir(page: Page): Promise<void> {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(URL_APP);
  await page.waitForFunction(
    () => {
      const b = document.querySelector('main button');
      return !!b && Object.keys(b).some((k) => k.startsWith('__reactProps$') || k.startsWith('__reactFiber$'));
    },
    null,
    { timeout: 20_000 },
  );
}

const opciones = (page: Page): Locator => page.locator('main [role="group"] button');

async function completar(page: Page, perfil: Perfil): Promise<void> {
  for (let i = 0; i < perfil.length; i++) {
    await expect(page.getByText(`${i + 1} / 10`, { exact: true })).toBeVisible();
    await opciones(page).nth(perfil[i]).click();
    await page.getByRole('button', { name: i === perfil.length - 1 ? 'Ver resultado' : 'Siguiente →' }).click();
  }
  await page.locator('main h2').first().waitFor();
}

interface Resultado {
  titulo: string;
  tarjeta: string;
  puntos: Record<string, number>;
}

async function leerResultado(page: Page): Promise<Resultado> {
  const titulo = (await page.locator('main h2').first().innerText()).trim();
  const tarjeta = (await page.locator('main [class*="resultadoCard"]').innerText()).replace(/\s+/g, ' ');
  const filas = await page.locator('main [class*="barraResultado"]').allInnerTexts();
  const puntos: Record<string, number> = {};
  for (const f of filas) {
    const m = f.replace(/\s+/g, ' ').trim().match(/^(.*) (\d+)$/);
    if (m) puntos[m[1]] = Number(m[2]);
  }
  return { titulo, tarjeta, puntos };
}

// ─────────────────────────────────────────────────────────────────────────────
// Perfiles (cálculo a mano con las tablas de page.tsx, l. 43-279)
// ─────────────────────────────────────────────────────────────────────────────

// NORMAL: <30 km · garaje propio con cargador · viajes largos raramente · 25-40 k€ · ciudad ·
// maletero a veces · único vehículo · ayudas «las tendré en cuenta» · ansiedad «un poco» ·
// «necesito un coche».
//   BEV 3+4+4+3+4+2+0+2+2+2 = 26 · PHEV 0+3+0+3+0+2+3+2+3+2 = 18 · HEV 1+0+0+2+2+2+3+2+1+2 = 15
//   moto 4+0+2+0+3 = 9 · esperar 1 (P7)
const NORMAL: Perfil = [0, 0, 0, 2, 0, 1, 1, 1, 1, 2];

// LÍMITE (el del encargo): >150 km · aparco en la calle · viajes largos cada semana · <15 k€ ·
// carretera · maletero a veces · único vehículo · ayudas «las tendré en cuenta» · ansiedad «un
// poco» · «necesito un coche».
//   HEV 3+4+3+0+4+2+3+2+1+2 = 24 · PHEV 2+0+3+0+2+2+3+2+3+2 = 19 · BEV 0+0+0+0+0+2+0+2+2+2 = 8
//   moto 2+5 = 7 · esperar 1+2+2+1 = 6
const LIMITE: Perfil = [3, 2, 2, 0, 2, 1, 1, 1, 1, 2];

// SIN GARAJE y 80-150 km/día, el resto pro-BEV: 80-150 km · calle · raramente · >40 k€ · mixto ·
// poco maletero · segundo coche · ayudas «sí» · ansiedad «nada» · «necesito un coche».
//   BEV 2+0+4+5+2+3+4+4+4+2 = 30 · PHEV 3+0+0+3+4+0+0+2+0+2 = 14 · HEV 3+4+0+0+2+0+0+0+0+2 = 11
//   moto 0+2+2+0+0+3+2 = 9 · esperar 2
const CALLE_80_150: Perfil = [2, 2, 0, 3, 1, 2, 0, 0, 2, 2];

// «No, necesito un coche sí o sí» y sale la moto: <30 km · calle · raramente · <15 k€ · ciudad ·
// poco maletero · segundo coche · ayudas «no me influyen» · ansiedad «mucho» · P10 «necesito coche».
//   moto 4+2+2+5+3+3+2+0+0+0 = 21 · BEV 3+0+4+0+4+3+4+0+0+2 = 20 · HEV 1+4+0+0+2+0+0+2+4+2 = 15
//   esperar 2+2+1+1 = 6 · PHEV 3+2 = 5
const MOTO_NECESITA_COCHE: Perfil = [0, 2, 0, 0, 0, 2, 0, 2, 0, 2];

// >150 km/día y sale la moto: >150 km · calle · raramente · <15 k€ · ciudad · poco maletero ·
// segundo coche · ayudas «no me influyen» · ansiedad «un poco» · P10 «sería perfecta».
//   moto 0+2+2+5+3+3+2+0+0+4 = 21 · BEV 0+0+4+0+4+3+4+0+2+0 = 17 · HEV 3+4+0+0+2+0+0+2+1+0 = 12
//   esperar 1+2+2+1 = 6 · PHEV 2+3 = 5
const MOTO_150_KM: Perfil = [3, 2, 0, 0, 0, 2, 0, 2, 1, 0];

// PRESUPUESTO MÍNIMO y el resto pro-BEV: 30-80 km · garaje propio · raramente · <15 k€ · ciudad ·
// poco maletero · segundo coche · ayudas «sí» · ansiedad «nada» · «necesito un coche».
//   BEV 3+4+4+0+4+3+4+4+4+2 = 32 · moto 0+0+2+5+3+3+2 = 15 · PHEV 3+3+0+0+0+0+0+2+0+2 = 10
//   HEV 2+0+0+0+2+0+0+0+0+2 = 6 · esperar 2
const BEV_MENOS_15K: Perfil = [1, 0, 0, 0, 0, 2, 0, 0, 2, 2];

// EMPATE BEV = PHEV: 30-80 km · garaje comunitario sin cargador · viajes largos alguna vez al mes ·
// 25-40 k€ · mixto · maletero a veces · segundo coche · ayudas «las tendré en cuenta» · ansiedad
// «un poco» · «necesito un coche».
//   BEV 3+2+2+3+2+2+4+2+2+2 = 24 · PHEV 3+2+3+3+4+2+0+2+3+2 = 24 · HEV 2+1+2+2+2+2+0+2+1+2 = 16
//   moto 2 · esperar 0
const EMPATE_BEV_PHEV: Perfil = [1, 1, 1, 2, 1, 1, 0, 1, 1, 2];

// EL PERFIL QUE MÁS SUMA A «ESPERAR»: >150 km · calle · raramente · <15 k€ · rural · poco maletero
// · único vehículo · ayudas «no me influyen» · ansiedad «mucho» · P10 «sería perfecta».
//   esperar 1+2+0+2+2+0+1+1+1+0 = 10 (el máximo posible) · HEV 3+4+0+0+3+0+3+2+4+0 = 19
//   moto 0+2+2+5+0+3+0+0+0+4 = 16 · PHEV 2+3+3 = 8 · BEV 4+3 = 7
// Por las escalas de la propia app no le cabe nada: el HEV y el PHEV puntúan 0 con <15 k€ (P4) y
// la moto, según su guía, es para «menos de 50 km/día».
const MAXIMO_ESPERAR: Perfil = [3, 2, 0, 0, 3, 2, 1, 2, 0, 0];

// ─────────────────────────────────────────────────────────────────────────────
// 1. Casos que la app resuelve según sus propias reglas
// ─────────────────────────────────────────────────────────────────────────────

test('caso normal: urbano con garaje y cargador y 25-40 k€ → eléctrico puro, 26/18/15/9/1', async ({ page }) => {
  await abrir(page);
  await completar(page, NORMAL);
  const r = await leerResultado(page);
  expect(r.titulo).toBe('Eléctrico Puro (BEV)');
  expect(r.puntos).toEqual({
    'Eléctrico puro': 26,
    'Híbrido enchufable': 18,
    'Híbrido suave': 15,
    'Moto eléctrica': 9,
    Esperar: 1,
  });
});

test('caso límite: sin garaje, >150 km de carretera y <15 k€ → NO sale el eléctrico puro (HEV 24, BEV 8)', async ({ page }) => {
  await abrir(page);
  await completar(page, LIMITE);
  const r = await leerResultado(page);
  expect(r.titulo).not.toBe('Eléctrico Puro (BEV)');
  expect(r.puntos['Híbrido suave']).toBe(24);
  expect(r.puntos['Híbrido enchufable']).toBe(19);
  expect(r.puntos['Eléctrico puro']).toBe(8);
  expect(r.puntos['Moto eléctrica']).toBe(7);
  expect(r.puntos.Esperar).toBe(6);
});

test('la barra de progreso anuncia la misma fracción que pinta (invariante de la familia selector-*)', async ({ page }) => {
  await abrir(page);
  const barra = page.locator('main [role="progressbar"]');
  const anunciada = async (): Promise<number> => {
    const [a, mi, ma] = await Promise.all(
      ['aria-valuenow', 'aria-valuemin', 'aria-valuemax'].map(async (x) => Number(await barra.getAttribute(x))),
    );
    return (a - mi) / (ma - mi);
  };
  const pintada = (): Promise<number> =>
    barra.evaluate((el) => (el.firstElementChild as HTMLElement).getBoundingClientRect().width / el.clientWidth);
  expect(await anunciada()).toBe(0);
  await expect.poll(pintada).toBeCloseTo(0, 2);
  await opciones(page).first().click();
  await page.getByRole('button', { name: 'Siguiente →' }).click();
  await expect.poll(anunciada).toBeCloseTo(0.1, 5);
  await expect.poll(pintada).toBeCloseTo(0.1, 2);
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. Hallazgos abiertos del motor
// ─────────────────────────────────────────────────────────────────────────────

test('HALLAZGO: «aparco en la calle» no descarta ni matiza el eléctrico puro, y la tarjeta le dice que tiene carga en casa', async ({ page }) => {
  test.fail(); // hallazgo abierto (25/09/2026): 14.406 de 41.472 perfiles con «calle» reciben BEV
  await abrir(page);
  await completar(page, CALLE_80_150);
  const r = await leerResultado(page);
  // Hoy: «Eléctrico Puro (BEV)» con 30 puntos y «Tienes acceso a carga en casa, haces pocos o
  // moderados kilómetros diarios…». Lo correcto: no afirmar lo contrario de P2 y, si sale el BEV,
  // decir que depende de la recarga fuera de casa.
  expect(r.tarjeta).not.toContain('Tienes acceso a carga en casa');
  if (r.titulo === 'Eléctrico Puro (BEV)') {
    expect(r.tarjeta).toMatch(/calle|sin garaje|fuera de casa|recarga pública|punto de carga/i);
  }
});

test('HALLAZGO: «No, necesito un coche sí o sí» y la app recomienda la moto eléctrica (21 frente a 20)', async ({ page }) => {
  test.fail(); // hallazgo abierto (25/09/2026): P10 solo suma, no descarta la moto
  await abrir(page);
  await completar(page, MOTO_NECESITA_COCHE);
  const r = await leerResultado(page);
  expect(r.titulo).not.toBe('Moto Eléctrica');
});

test('HALLAZGO: con más de 150 km diarios sale la moto y la tarjeta dice «los kilómetros diarios son cortos»', async ({ page }) => {
  test.fail(); // hallazgo abierto (25/09/2026): 175 perfiles con >150 km y 74 con 80-150 reciben la moto
  await abrir(page);
  await completar(page, MOTO_150_KM);
  const r = await leerResultado(page);
  // La guía de la propia app: la moto, «si todos tus desplazamientos son urbanos (menos de 50 km/día)».
  expect(r.tarjeta).not.toContain('los kilómetros diarios son cortos');
  expect(r.titulo).not.toBe('Moto Eléctrica');
});

test('HALLAZGO: con «Menos de 15.000 €» gana el eléctrico puro sin una palabra sobre el presupuesto', async ({ page }) => {
  test.fail(); // hallazgo abierto (25/09/2026): la escala de P4 da 0 al BEV, PHEV y HEV y no acota
  await abrir(page);
  await completar(page, BEV_MENOS_15K);
  const r = await leerResultado(page);
  // Hoy: «Eléctrico Puro (BEV)» con 32 puntos (37 con «Más de 40.000 €»: el mismo ganador).
  expect(r.titulo).toBe('Eléctrico Puro (BEV)');
  expect(r.puntos['Eléctrico puro']).toBe(32);
  expect(r.tarjeta).toMatch(/presupuesto|15\.000/i);
});

test('HALLAZGO: el perfil que más suma a «Esperar» no obtiene «Esperar» (0 de 124.416 combinaciones)', async ({ page }) => {
  test.fail(); // hallazgo abierto (25/09/2026): el resultado «Esperar 1–2 años» es inalcanzable
  await abrir(page);
  await completar(page, MAXIMO_ESPERAR);
  const r = await leerResultado(page);
  // Hoy: «Híbrido Suave (HEV)» 19, moto 16, Esperar 10 (su máximo posible).
  expect(r.puntos.Esperar).toBe(10);
  expect(r.titulo).toBe('Esperar 1–2 años');
});

test('HALLAZGO: un empate BEV = PHEV (24 = 24) se resuelve en silencio por el orden del código', async ({ page }) => {
  test.fail(); // hallazgo abierto (25/09/2026): 10.152 empates en cabeza sin explicar
  await abrir(page);
  await completar(page, EMPATE_BEV_PHEV);
  const r = await leerResultado(page);
  expect(r.puntos['Eléctrico puro']).toBe(24);
  expect(r.puntos['Híbrido enchufable']).toBe(24);
  // Hoy: «Eléctrico Puro (BEV)» · «Ideal para tu perfil» · «Tu perfil encaja perfectamente…».
  expect(r.tarjeta).toMatch(/empat|misma puntuación|igual de compatible/i);
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. Hallazgos abiertos de datos y contenido
// ─────────────────────────────────────────────────────────────────────────────

async function abrirGuia(page: Page): Promise<string> {
  await page.getByRole('button', { name: 'Ver guía educativa' }).click();
  const guia = page.locator('main').getByText('Guía de vehículos electrificados en España').locator('xpath=ancestor::section[1]');
  await expect(page.getByText('¿Qué significan BEV, PHEV y HEV?')).toBeVisible();
  return ((await guia.count()) ? await guia.innerText() : await page.locator('main').innerText()).replace(/\s+/g, ' ');
}

test('HALLAZGO: el MOVES III se presenta como ayuda vigente (terminó en 2025; hoy Programa Auto+, RD 609/2026)', async ({ page }) => {
  test.fail(); // hallazgo abierto (25/09/2026)
  // Fuente: Real Decreto 609/2026, de 22 de julio (BOE-A-2026-16010), Programa Auto+; su
  // preámbulo dice que el MOVES «ha estado vigente entre los años 2019 y 2025».
  await abrir(page);
  for (let i = 0; i < 7; i++) {
    await opciones(page).first().click();
    await page.getByRole('button', { name: 'Siguiente →' }).click();
  }
  await expect(page.getByText('8 / 10', { exact: true })).toBeVisible();
  const p8 = await page.locator('main [class*="preguntaTexto"]').innerText();
  expect(p8).not.toContain('MOVES III');
});

test('HALLAZGO: «Híbrido Suave (HEV)» llama «suave» (MHEV) al híbrido completo que describe', async ({ page }) => {
  test.fail(); // hallazgo abierto (25/09/2026)
  // es.wikipedia.org/wiki/Híbrido_suave: los híbridos suaves (MHEV) «carecen de un modo de
  // propulsión exclusivamente eléctrico» y no logran la mejora de consumo de los híbridos.
  await abrir(page);
  await completar(page, LIMITE);
  const r = await leerResultado(page);
  expect(r.titulo).not.toContain('Suave');
});

test('HALLAZGO: la guía da en presente datos fechados en 2025 y una previsión «2026–2027»', async ({ page }) => {
  test.fail(); // hallazgo abierto (25/09/2026)
  await abrir(page);
  await completar(page, NORMAL);
  const guia = await abrirGuia(page);
  expect(guia).not.toContain('Subvenciones disponibles en España (2025)');
  expect(guia).not.toContain('puntos de carga públicos (2025)');
});

test('HALLAZGO: el coste de cargar en casa sale con tres cifras distintas (tarjeta, guía y FAQPage)', async ({ page, request }) => {
  test.fail(); // hallazgo abierto (25/09/2026)
  await abrir(page);
  await completar(page, NORMAL);
  const r = await leerResultado(page);
  const guia = await abrirGuia(page);
  const html = await (await request.get(URL_APP)).text();
  // Hoy: tarjeta «≈ 2–3 € cada 100 km» · guía «1,5 €/100 km» (tarifa nocturna) · FAQPage «entre
  // 2,5 € y 4 €/100 km cargando en casa (tarifa nocturna)». Lo correcto: una sola horquilla.
  const tarjeta = r.tarjeta.match(/≈ ?(\d+(?:,\d+)?)–(\d+(?:,\d+)?) € cada 100 km/);
  const enGuia = guia.match(/equivalente a (\d+(?:,\d+)?) €\/100 km/);
  const enFaq = html.match(/entre (\d+(?:,\d+)?) € y (\d+(?:,\d+)?) €\/100 km cargando en casa/);
  const n = (s: string): number => Number(s.replace(',', '.'));
  if (tarjeta && enGuia) {
    expect(n(enGuia[1])).toBeGreaterThanOrEqual(n(tarjeta[1]));
    expect(n(enGuia[1])).toBeLessThanOrEqual(n(tarjeta[2]));
  }
  if (tarjeta && enFaq) {
    expect([n(enFaq[1]), n(enFaq[2])]).toEqual([n(tarjeta[1]), n(tarjeta[2])]);
  }
});

test('HALLAZGO: «Bonificaciones ITP/AJD» explica una rebaja del impuesto de matriculación, que es otro impuesto', async ({ page }) => {
  test.fail(); // hallazgo abierto (25/09/2026)
  // El impuesto de matriculación es el Impuesto Especial sobre Determinados Medios de Transporte
  // (Ley 38/1992, de Impuestos Especiales, cap. VII), no el ITP/AJD.
  await abrir(page);
  await completar(page, NORMAL);
  await abrirGuia(page);
  const item = page.locator('main li', { hasText: 'ITP/AJD' });
  await expect(item).toHaveCount(1);
  await expect(item).not.toContainText('impuesto de matriculación');
});

test('HALLAZGO: el JSON-LD WebApplication se sirve con featureList vacío (§1.ter pide 4-8)', async ({ request }) => {
  test.fail(); // hallazgo abierto (25/09/2026): metadata.ts:42 features: []
  const html = await (await request.get(URL_APP)).text();
  const bloques = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]));
  const app = bloques.find((b) => b['@type'] === 'WebApplication');
  expect(app).toBeTruthy();
  expect(app.featureList.length).toBeGreaterThanOrEqual(4);
});

test('HALLAZGO: los % van pegados («100%») o con espacio normal («20–30 %»), no con espacio duro', async ({ page }) => {
  test.fail(); // hallazgo abierto (25/09/2026): regla del 25/09/2026, U+00A0 antes del %
  await abrir(page);
  await completar(page, LIMITE);
  const r = await leerResultado(page);
  expect(r.titulo).toBe('Híbrido Suave (HEV)');
  const texto = await page.locator('main [class*="resultadoCard"]').innerText();
  expect(texto).toContain('20–30 %');
});

test('HALLAZGO: no monta RegionBadge aunque sus datos (ayudas, IDAE, CCAA, €) son de España', async ({ page }) => {
  test.fail(); // hallazgo abierto (25/09/2026): §1.bis del CLAUDE.md
  await abrir(page);
  await expect(page.locator('[role="note"][aria-label^="Aviso: los datos de referencia son de España"], [role="note"][aria-label^="Aviso: esta herramienta aplica"]')).toHaveCount(1);
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. Hallazgos abiertos de accesibilidad
// ─────────────────────────────────────────────────────────────────────────────

test('HALLAZGO: una elección única se anuncia como conmutadores aria-pressed (y pulsar dos veces no desmarca)', async ({ page }) => {
  test.fail(); // hallazgo abierto (25/09/2026): invariante de la familia selector-* (950, 1341)
  await abrir(page);
  const primera = opciones(page).first();
  await primera.click();
  await primera.click();
  // Hoy sigue aria-pressed="true": un conmutador que no conmuta.
  await expect(primera).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('main [role="group"] [aria-pressed]')).toHaveCount(0);
  await expect(page.locator('main [role="radio"]')).toHaveCount(4);
});

test('HALLAZGO: tras «Siguiente →» con teclado el foco cae a <body> y el siguiente Tab sale del cuestionario', async ({ page }) => {
  test.fail(); // hallazgo abierto (25/09/2026): la forma del 1680 de selector-smartphone
  await abrir(page);
  await opciones(page).first().focus();
  await page.keyboard.press('Space');
  await expect(opciones(page).first()).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Siguiente →' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByText('2 / 10', { exact: true })).toBeVisible();
  // Hoy: el botón queda disabled (P2 sin responder) y document.activeElement es BODY.
  await expect.poll(() => page.evaluate(() => document.activeElement?.tagName)).not.toBe('BODY');
  const dentro = await page.evaluate(() => !!document.activeElement?.closest('main'));
  expect(dentro).toBe(true);
});

test('HALLAZGO: al pulsar «Ver resultado» el foco cae a <body> y no se lleva al resultado', async ({ page }) => {
  test.fail(); // hallazgo abierto (25/09/2026): la forma del 1679 de selector-smartphone
  await abrir(page);
  await completar(page, NORMAL);
  await expect.poll(() => page.evaluate(() => document.activeElement?.tagName)).not.toBe('BODY');
});

test('HALLAZGO: el hero usa un degradado en hexadecimal en vez de var(--hero-bg), y su subtítulo no llega a 4,5:1', async ({ page }) => {
  test.fail(); // hallazgo abierto (25/09/2026): la forma del 1505 de selector-movilidad-urbana
  await abrir(page);
  const hero = page.locator('header').filter({ has: page.locator('h1') }).first();
  // --hero-bg = #1a5278 (CLAUDE.md, «obligatorio en hero sections»).
  const fondo = await hero.evaluate((el) => ({ img: getComputedStyle(el).backgroundImage, color: getComputedStyle(el).backgroundColor }));
  expect(fondo.img).toBe('none');
  expect(fondo.color).toBe('rgb(26, 82, 120)');
});

test('HALLAZGO: en tema claro la opción marcada, «← Anterior» y «Repetir test» ponen #2e86ab a 3,93:1', async ({ page }) => {
  test.fail(); // hallazgo abierto (25/09/2026)
  await abrir(page);
  await page.evaluate(() => { document.documentElement.dataset.theme = 'light'; });
  await opciones(page).first().click();
  // Contraste del texto de la opción marcada contra su fondo REAL: rgba(46,134,171,0.1) sobre el
  // fondo de la tarjeta, calculado en el navegador.
  const ratio = await page.locator('main [class*="seleccionada"]').evaluate((el) => {
    const rgb = (s: string): number[] => (s.match(/[\d.]+/g) ?? []).map(Number);
    const lum = (c: number[]): number => {
      const f = (v: number): number => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
      return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]);
    };
    const capa = rgb(getComputedStyle(el).backgroundColor);
    const base = rgb(getComputedStyle(el.parentElement!.closest('[class*="pregunta"]')!).backgroundColor);
    const a = capa[3] ?? 1;
    const fondo = [0, 1, 2].map((i) => capa[i] * a + base[i] * (1 - a));
    const texto = rgb(getComputedStyle(el).color);
    const [l1, l2] = [lum(texto), lum(fondo)];
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  });
  // Hoy: 3,93. Texto de 0,95rem en seminegrita: exige 4,5.
  expect(ratio).toBeGreaterThanOrEqual(4.5);
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. Móvil de 360 px
// ─────────────────────────────────────────────────────────────────────────────

test.describe('móvil 360 px', () => {
  test.use({
    viewport: { width: 360, height: 740 },
    userAgent:
      'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36',
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });

  test('sin desbordamiento horizontal ni en el cuestionario ni en el resultado; el resultado queda a mano', async ({ page }) => {
    await abrir(page);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
    await completar(page, NORMAL);
    const r = await leerResultado(page);
    expect(r.titulo).toBe('Eléctrico Puro (BEV)');
    expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
    // Hoy el título queda ~36 px por encima del borde superior: la tarjeta sí está en pantalla.
    const tarjeta = await page.locator('main [class*="resultadoCard"]').boundingBox();
    expect(tarjeta).not.toBeNull();
    expect(tarjeta!.y + tarjeta!.height).toBeGreaterThan(0);
  });
});
