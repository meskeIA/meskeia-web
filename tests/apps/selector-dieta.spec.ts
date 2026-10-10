import { test, expect, Page, devices } from '@playwright/test';

/**
 * Selector de Dieta (selector-dieta) — primera inspección, 10/10/2026
 *
 * QUÉ PROMETE LA APP
 *   <h1> «¿Qué alimentación te conviene?» · subtítulo «Más allá de las modas: el patrón que
 *   encaja con tu vida real». La meta description: «Test de 10 preguntas para descubrir qué
 *   patrón alimentario se adapta mejor a tus objetivos, estilo de vida, salud y RESTRICCIONES».
 *   La intro: «6 patrones alimentarios analizados» (mediterránea, vegetariana, vegana,
 *   cetogénica, DASH y ayuno intermitente). App de SALUD, riesgo 2.
 *
 * EL MOTOR (calcularResultado, en app/selector-dieta/page.tsx; no hay motor.ts)
 *   Cada opción suma unos pesos fijos a las seis dietas y gana la de más puntos. El reparto
 *   sale de `Object.entries(puntos).sort((a, b) => b − a)[0]`: el sort de V8 es estable, así que
 *   un EMPATE lo gana la primera declarada (mediterránea > vegetariana > vegana > cetogénica >
 *   DASH > ayuno). Ninguna respuesta descarta nada: la restricción, la condición de salud y el
 *   presupuesto solo SUMAN puntos.
 *
 *   Pesos (med, veg, vgn, ceto, dash, ayuno) de las opciones que usan estos casos:
 *     P1  perder peso 1,1,1,3,1,3 · músculo 2,1,0,2,0,1 · salud general 3,2,2,1,3,1 · energía 3,2,1,2,2,2
 *     P2  ninguna 3,2,1,3,3,3 · vegetariano 1,3,1,0,1,2 · vegano 0,1,3,0,0,1 · sin gluten 2,1,1,3,1,2
 *     P3  sedentario 2,2,2,2,3,3 · moderado 3,2,2,2,2,2 · activo 3,2,1,1,2,2 · muy activo 2,1,0,1,1,1
 *     P4  ninguna 3,2,2,2,2,2 · diabetes 2,1,1,3,3,2 · cardiovascular 3,2,2,0,3,1 · digestiva 2,2,1,1,2,1
 *     P5  mínimo 2,1,1,2,1,3 · básico 3,2,2,2,2,2 · normal 3,3,3,2,3,1 · mucho 3,3,3,2,3,1
 *     P6  ajustado 3,3,2,1,2,3 · normal 3,2,2,2,3,2 · holgado 2,2,2,2,2,1
 *     P7  equilibrada 3,2,2,2,3,2 · selectivo 2,2,1,2,2,2 · ansiedad 2,1,1,1,2,1 · irregular 2,1,1,1,1,3
 *     P8  muy importante 2,3,3,0,2,2 · algo 3,2,2,1,2,2 · no 2,1,1,2,3,2
 *     P9  corto 1,1,0,3,1,3 · medio 2,2,1,2,2,2 · largo 3,3,3,1,3,2
 *     P10 mucha variedad 3,3,2,1,3,1 · moderada 3,2,2,2,2,2 · poca 2,2,2,3,1,3
 *
 *   Cada valor esperado de abajo se resolvió A MANO con esa tabla antes de abrir el navegador,
 *   y después se cotejó con el motor real (extraído de page.tsx por un script del scratchpad).
 *
 * BARRIDO DEL MOTOR (los 331.776 perfiles = 4^6 · 3^4), 10/10/2026
 *   Ganadoras: mediterránea 296.042 (89,2 %) · ayuno 22.905 · DASH 7.318 · cetogénica 3.055 ·
 *   vegetariana 2.249 · vegana 207. Empate en cabeza: 37.775 (11,39 %), todos resueltos por el
 *   orden de declaración. Con «Vegano/a»: 75.206 de 82.944 (90,7 %) reciben un patrón con
 *   productos animales (mediterránea 72.253, DASH 2.249, cetogénica 433, vegetariana 271); con
 *   «Vegetariano/a», 73.396 (88,5 %) uno con carne o pescado. «A veces uso la comida para
 *   gestionar emociones» pesa lo mismo que «Como de todo sin problema» menos 1 en las seis
 *   dietas: el resultado es idéntico en los 82.944 perfiles.
 *
 * Los casos que demuestran un hallazgo ABIERTO van con test.fail(): afirman lo CORRECTO, y el
 * día que se repare pasarán y Playwright avisará de que hay que quitar la marca.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Ayudantes
// ─────────────────────────────────────────────────────────────────────────────

/**
 * La app no tiene ningún <input>: el testigo de `_hidratacion.ts` (rastreador de valor) no
 * sirve. Para una app de solo botones, el equivalente es que React haya colgado sus props del
 * botón con el que se va a interactuar (mismo criterio que tests/apps/selector-smartphone.spec.ts).
 */
async function esperarHidratacionBotones(page: Page): Promise<void> {
  await page.waitForFunction(
    () => {
      const boton = Array.from(document.querySelectorAll('button')).find((b) =>
        /Comenzar el test/.test(b.textContent ?? ''),
      );
      if (!boton) return false;
      return Object.keys(boton).some((k) => k.startsWith('__reactProps$') || k.startsWith('__reactFiber$'));
    },
    null,
    { timeout: 20_000 },
  );
}

async function cargar(page: Page): Promise<void> {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/selector-dieta/');
  await esperarHidratacionBotones(page);
}

async function abrirTest(page: Page): Promise<void> {
  await cargar(page);
  await page.getByRole('button', { name: 'Comenzar el test' }).click();
  await expect(page.getByText('Pregunta 1 de 10')).toBeVisible();
}

/** Las 10 respuestas de un perfil, cada una por un trozo único de su etiqueta. */
type Perfil = readonly [string, string, string, string, string, string, string, string, string, string];

const opcion = (page: Page, texto: string) =>
  page.locator('[class*="opcionesGrid"] button', { hasText: texto }).first();

const botonAvance = (page: Page, i: number) =>
  page.getByRole('button', { name: i === 9 ? 'Ver resultado' : /Siguiente/ });

/** Contesta las 10 preguntas con clic. Pausa de 500 ms tras «Siguiente»: nadie contesta sin leer. */
async function responder(page: Page, perfil: Perfil): Promise<void> {
  for (let i = 0; i < 10; i++) {
    await expect(page.getByText(`Pregunta ${i + 1} de 10`)).toBeVisible();
    await opcion(page, perfil[i]).click();
    await botonAvance(page, i).click();
    if (i < 9) await page.waitForTimeout(500);
  }
}

/** El nombre del patrón recomendado en la tarjeta principal. */
async function leerResultado(page: Page): Promise<string> {
  const valor = page.locator('[class*="recomendacionValor"]');
  await valor.waitFor();
  return (await valor.innerText()).trim();
}

/** Lo que se VE de la pantalla de resultado (la guía cerrada es display:none y no cuenta). */
async function textoResultado(page: Page): Promise<string> {
  return (await page.locator('[class*="resultadosContainer"]').innerText()).replace(/\s+/g, ' ');
}

async function textos(page: Page, clase: string): Promise<string[]> {
  return page
    .locator(`[class*="${clase}"]`)
    .evaluateAll((els) => els.map((e) => (e.textContent ?? '').replace(/\s+/g, ' ').trim()));
}

/** ¿Pisa alguna pieza de la barra fija del logo las letras del elemento? (función de la Ronda) */
async function bajoLaBarra(
  page: Page,
  selector: string,
): Promise<{ tapado: boolean; top: number; bottom: number; barra: number; alto: number }> {
  return page.evaluate((sel) => {
    const barra = [...document.querySelectorAll('body *')].find((e) => {
      const cs = getComputedStyle(e);
      const r = e.getBoundingClientRect();
      return cs.position === 'fixed' && r.top <= 1 && r.height < 120 && r.width > 300
        && !!e.querySelector('a[href="/"], a[href="https://meskeia.com/"]');
    });
    const el = document.querySelector(sel);
    if (!barra || !el) throw new Error(`sin barra (${!!barra}) o sin ${sel} (${!!el})`);
    const rango = document.createRange();
    rango.selectNodeContents(el);
    const letras = [...rango.getClientRects()].filter((c) => c.width > 0);
    const piezas = [...barra.children].map((c) => c.getBoundingClientRect()).filter((c) => c.width > 0);
    return {
      tapado: piezas.some((p) => letras.some((c) =>
        !(p.right <= c.left || p.left >= c.right || p.bottom <= c.top || p.top >= c.bottom))),
      top: Math.round(el.getBoundingClientRect().top),
      bottom: Math.round(el.getBoundingClientRect().bottom),
      barra: Math.round(barra.getBoundingClientRect().bottom),
      alto: innerHeight,
    };
  }, selector);
}

/** Desplaza la página para dejar el centro del botón en `y` (o centrado) y devuelve ese punto. */
async function encuadrar(page: Page, nombre: string | RegExp, y: number | null = null): Promise<{ x: number; y: number }> {
  const boton = page.getByRole('button', { name: nombre });
  if (y === null) await boton.evaluate((e) => e.scrollIntoView({ block: 'center' }));
  else await boton.evaluate((e, objetivo) => {
    const r = e.getBoundingClientRect();
    window.scrollBy(0, r.top + r.height / 2 - objetivo);
  }, y);
  const caja = (await boton.boundingBox())!;
  return { x: caja.x + caja.width / 2, y: caja.y + caja.height / 2 };
}

/**
 * Contraste MÍNIMO del texto de un elemento contra su fondo real (función de
 * tests/apps/selector-smartphone.spec.ts): en las esquinas de cada línea, con la opacidad
 * acumulada, componiendo capas hasta la primera opaca y evaluando el degradado en ese punto.
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

async function ponerTema(page: Page, tema: 'light' | 'dark'): Promise<void> {
  await page.evaluate((t) => document.documentElement.setAttribute('data-theme', t), tema);
  await page.waitForFunction(() =>
    document.getAnimations().every((a) => !(a instanceof CSSTransition) || a.playState !== 'running'));
}

// ─────────────────────────────────────────────────────────────────────────────
// Perfiles (cada uno resuelto a mano; puntos en el orden med, veg, vgn, ceto, dash, ayuno)
// ─────────────────────────────────────────────────────────────────────────────

// 30, 21, 20, 18, 25, 20 → Dieta Mediterránea, sin empate.
const SALUD_GENERAL: Perfil = [
  'Mejorar la salud general', 'Ninguna, como de todo', 'Moderado', 'No, estoy en buen estado',
  'Cocino básico', 'Normal, sin grandes', 'Como de todo sin problema', 'Me importa, aunque',
  'Busco un cambio permanente', 'Variedad moderada',
];
// 29, 23, 21, 15, 29, 18 → EMPATE mediterránea = DASH; gana mediterránea por ir antes.
const EMPATE_MED_DASH: Perfil = [
  'Mejorar la salud general', 'Ninguna, como de todo', 'Sedentario', 'Colesterol alto',
  'Me gusta cocinar', 'Normal, sin grandes', 'Como de todo sin problema', 'Me importa, aunque',
  'Busco un cambio permanente', 'Me encanta probar',
];
// El mismo con P8 «No especialmente»: 28, 22, 20, 16, 30, 18 → Dieta DASH.
const DASH_POR_UNO: Perfil = [
  ...EMPATE_MED_DASH.slice(0, 7), 'No especialmente', ...EMPATE_MED_DASH.slice(8),
] as unknown as Perfil;
// Vegano/a + diabetes: 19, 16, 15, 21, 17, 18 → Dieta Cetogénica.
const VEGANO_DIABETES: Perfil = [
  'Ganar músculo', 'Vegano/a', 'Moderado', 'Diabetes o prediabetes', 'Me gusta cocinar',
  'Holgado', 'Soy bastante selectivo', 'No especialmente', 'Resultados rápidos', 'Prefiero pocas cosas',
];
// Vegano/a: 27, 20, 20, 15, 21, 19 → Dieta Mediterránea.
const VEGANO_ENERGIA: Perfil = [
  'Más energía', 'Vegano/a', 'Activo (deporte 3-4', 'No, estoy en buen estado', 'Cocino básico',
  'Normal, sin grandes', 'Como de todo sin problema', 'Me importa, aunque',
  'Busco un cambio permanente', 'Variedad moderada',
];
// Colesterol alto o hipertensión: 21, 16, 14, 22, 18, 21 → Dieta Cetogénica.
const CARDIO_CETO: Perfil = [
  'Perder peso', 'Sin gluten', 'Moderado', 'Colesterol alto', 'Cocino básico', 'Holgado',
  'Soy bastante selectivo', 'No especialmente', 'Resultados rápidos', 'Prefiero pocas cosas',
];
// Sin gluten: 29, 20, 20, 18, 23, 19 → Dieta Mediterránea.
const SIN_GLUTEN: Perfil = [
  'Mejorar la salud general', 'Sin gluten', 'Moderado', 'No, estoy en buen estado', 'Cocino básico',
  'Normal, sin grandes', 'Como de todo sin problema', 'Me importa, aunque',
  'Busco un cambio permanente', 'Variedad moderada',
];
// «A veces uso la comida para gestionar emociones»: 21, 18, 15, 20, 18, 26 → Ayuno Intermitente.
// Con «Como de todo sin problema» en P7 sale 22, 19, 16, 21, 19, 27: el mismo ayuno.
const AYUNO_EMOCIONES: Perfil = [
  'Perder peso', 'Ninguna, como de todo', 'Sedentario', 'No, estoy en buen estado', 'Mínimo, prefiero',
  'Muy ajustado', 'A veces uso la comida', 'Sí, es un criterio', 'Resultados rápidos', 'Prefiero pocas cosas',
];
// «Muy ajustado»: 22, 17, 13, 23, 18, 21 → Dieta Cetogénica («Moderada a alta»).
const AJUSTADO_CETO: Perfil = [
  'Ganar músculo', 'Sin gluten', 'Moderado', 'Diabetes o prediabetes', 'Me gusta cocinar',
  'Muy ajustado', 'Soy bastante selectivo', 'No especialmente', 'Resultados rápidos', 'Prefiero pocas cosas',
];
// Diabetes: 21, 16, 13, 22, 18, 28 → Ayuno Intermitente.
const DIABETES_AYUNO: Perfil = [
  'Perder peso', 'Ninguna, como de todo', 'Sedentario', 'Diabetes o prediabetes', 'Mínimo, prefiero',
  'Muy ajustado', 'Como fuera o con horarios', 'Me importa, aunque', 'Resultados rápidos', 'Prefiero pocas cosas',
];
// 23, 22, 24, 15, 22, 18 → Dieta Vegana.
const VEGANA: Perfil = [
  'Mejorar la salud general', 'Vegano/a', 'Sedentario', 'No, estoy en buen estado', 'Me gusta cocinar',
  'Holgado', 'Como de todo sin problema', 'Sí, es un criterio', 'Busco un cambio permanente', 'Prefiero pocas cosas',
];
// 24, 26, 20, 11, 24, 18 → Dieta Vegetariana.
const VEGETARIANA: Perfil = [
  'Mejorar la salud general', 'Vegetariano/a', 'Sedentario', 'Problemas digestivos', 'Me gusta cocinar',
  'Muy ajustado', 'Soy bastante selectivo', 'Sí, es un criterio', 'Busco un cambio permanente', 'Me encanta probar',
];

// ─────────────────────────────────────────────────────────────────────────────
// 1. Casos que la app resuelve bien
// ─────────────────────────────────────────────────────────────────────────────

test('caso normal: salud general sin restricciones → Dieta Mediterránea, con su tarjeta completa', async ({ page }) => {
  await abrirTest(page);
  await responder(page, SALUD_GENERAL);
  expect(await leerResultado(page)).toBe('Dieta Mediterránea'); // 30 puntos frente a 25 de DASH
  await expect(page.locator('[class*="heroSubtitleSm"]')).toHaveText('Dieta Mediterránea');
  expect((await textos(page, 'statValor'))[1]).toBe('Fácil — puedes empezar mañana');
  expect((await textos(page, 'alimentoItem'))[0]).toBe('Aceite de oliva virgen extra');
  await expect(page.locator('[class*="warningBox"]')).toContainText(
    'Si tienes condiciones de salud diagnosticadas, consulta siempre con un profesional antes de cambiar tu alimentación.',
  );
});

test('caso frontera: cambiar SOLO P8 a «No especialmente» pasa del empate 29-29 a DASH 30-28', async ({ page }) => {
  await abrirTest(page);
  await responder(page, DASH_POR_UNO);
  expect(await leerResultado(page)).toBe('Dieta DASH');
});

test('rechazo: sin respuesta no se avanza; «Anterior» conserva lo contestado y en la P1 vuelve a la intro; «Comenzar» empieza de cero', async ({ page }) => {
  await abrirTest(page);
  const siguiente = page.getByRole('button', { name: /Siguiente/ });
  await expect(siguiente).toBeDisabled();
  await siguiente.click({ force: true });
  await expect(page.getByText('Pregunta 1 de 10')).toBeVisible();

  await opcion(page, 'Ganar músculo').click();
  await siguiente.click();
  await page.waitForTimeout(500);
  await expect(page.getByText('Pregunta 2 de 10')).toBeVisible();
  await expect(siguiente).toBeDisabled(); // la P2 llega sin respuesta
  await page.getByRole('button', { name: /Anterior/ }).click();
  await expect(page.locator('[class*="opcionesGrid"] [aria-pressed="true"]')).toHaveText(/Ganar músculo/);

  await page.getByRole('button', { name: /Anterior/ }).click();
  await expect(page.getByRole('button', { name: 'Comenzar el test' })).toBeVisible();
  await page.getByRole('button', { name: 'Comenzar el test' }).click();
  await expect(page.getByText('Pregunta 1 de 10')).toBeVisible();
  await expect(page.locator('[class*="opcionesGrid"] [aria-pressed="true"]')).toHaveCount(0);
});

test('aviso de salud: nivel 2 (high), siempre desplegado, fuera de la guía educativa y antes del test', async ({ page }) => {
  // _private/DISCLAIMER-POLICY.md y la cabecera de components/DisclaimerCard.tsx: salud/hábitos
  // es nivel 2 ALTO, severity "high", nunca colapsable, nunca dentro de <EducationalSection>.
  await cargar(page);
  const aviso = page.locator('[class*="disclaimerCard"]');
  await expect(aviso).toHaveCount(1);
  await expect(aviso).toBeVisible();
  await expect(aviso).toContainText('Aviso Médico Importante');
  await expect(aviso).toContainText('Cualquier decisión relacionada con tu salud debe tomarse siempre bajo la supervisión');
  await expect(page.getByRole('button', { name: /Ocultar aviso|Mostrar aviso/ })).toHaveCount(0);
  expect(await aviso.evaluate((e) => !!e.closest('[class*="educational" i]'))).toBe(false);
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. Hallazgos del motor — ABIERTOS (inspector 10/10/2026)
// ─────────────────────────────────────────────────────────────────────────────

test('HALLAZGO: quien se declara vegano/a no recibe una dieta con carne, pescado, huevos ni queso', async ({ page }) => {
  // ABIERTO (inspector 10/10/2026). La restricción solo suma puntos («Vegano/a» da 0 a la
  // cetogénica) y no descarta. Perfil resuelto a mano: 19, 16, 15, 21, 17, 18 → Cetogénica, cuyos
  // alimentos clave son «Carnes y pescados grasos», «Huevos…», «Quesos curados y mantequilla».
  test.fail();
  await abrirTest(page);
  await responder(page, VEGANO_DIABETES);
  await leerResultado(page);
  const alimentos = await textos(page, 'alimentoItem');
  expect(alimentos.filter((a) => /carne|pescado|huevo|queso|mantequilla|lácteo/i.test(a))).toEqual([]);
});

test('HALLAZGO: a quien se declara vegano/a no se le recomienda pescado azul 2-3 veces por semana', async ({ page }) => {
  // ABIERTO (inspector 10/10/2026). 27, 20, 20, 15, 21, 19 → Dieta Mediterránea, la de 72.253 de
  // los 82.944 perfiles veganos del barrido.
  test.fail();
  await abrirTest(page);
  await responder(page, VEGANO_ENERGIA);
  await leerResultado(page);
  expect(await textos(page, 'alimentoItem')).not.toContain('Pescado azul 2-3 veces/semana');
});

test('HALLAZGO: quien declara «Sin gluten (celiaquía…)» no recibe «Sustituye el pan blanco por integral» sin una palabra del gluten', async ({ page }) => {
  // ABIERTO (inspector 10/10/2026). 29, 20, 20, 18, 23, 19 → Mediterránea. Ningún texto de las
  // seis dietas menciona el gluten.
  test.fail();
  await abrirTest(page);
  await responder(page, SIN_GLUTEN);
  expect(await leerResultado(page)).toBe('Dieta Mediterránea');
  expect(await textoResultado(page)).toMatch(/gluten/i);
});

test('HALLAZGO: con colesterol alto o hipertensión la tarjeta no recomienda la cetogénica sin mencionar la condición', async ({ page }) => {
  // ABIERTO (inspector 10/10/2026). La propia app da 0 puntos a la cetogénica para esa condición,
  // y aun así gana: 21, 16, 14, 22, 18, 21. La tarjeta (70-75 % de grasas, «Quesos curados y
  // mantequilla») solo avisa de la diabetes tipo 1. 26 perfiles en el barrido.
  test.fail();
  await abrirTest(page);
  await responder(page, CARDIO_CETO);
  const valor = await leerResultado(page);
  const texto = await textoResultado(page);
  expect(valor === 'Dieta Cetogénica' && !/colesterol|cardiovascular|hipertensi/i.test(texto)).toBe(false);
});

test('HALLAZGO: «A veces uso la comida para gestionar emociones» mueve el resultado o lo matiza', async ({ page }) => {
  // ABIERTO (inspector 10/10/2026). Sus pesos son los de «Como de todo sin problema» menos 1 en
  // las seis dietas: el orden no cambia nunca. Este perfil da Ayuno Intermitente (26 frente a 21)
  // igual que con «Como de todo sin problema» (27 frente a 22), y la tarjeta no dice nada de ello.
  test.fail();
  await abrirTest(page);
  await responder(page, AYUNO_EMOCIONES);
  const valor = await leerResultado(page);
  const texto = await textoResultado(page);
  expect(valor === 'Ayuno Intermitente' && !/emoci/i.test(texto)).toBe(false);
});

test('HALLAZGO: un empate en cabeza se dice; no lo decide en silencio el orden de declaración', async ({ page }) => {
  // ABIERTO (inspector 10/10/2026). 29 mediterránea = 29 DASH. Gana la mediterránea porque va
  // primero en el objeto `puntos`, y la pantalla no nombra la DASH. 37.775 perfiles empatan.
  test.fail();
  await abrirTest(page);
  await responder(page, EMPATE_MED_DASH);
  expect(await leerResultado(page)).toBe('Dieta Mediterránea');
  expect(await textoResultado(page)).toContain('DASH');
});

test('HALLAZGO: con «Muy ajustado, busco economía» no gana un patrón de coste «Moderada a alta» sin decirlo', async ({ page }) => {
  // ABIERTO (inspector 10/10/2026). Forma del 1678: el presupuesto solo suma (1 punto a la
  // cetogénica) y no descarta. 22, 17, 13, 23, 18, 21 → Cetogénica. 105 perfiles en el barrido.
  test.fail();
  await abrirTest(page);
  await responder(page, AJUSTADO_CETO);
  await leerResultado(page);
  const coste = (await textos(page, 'statValor'))[2];
  const texto = await textoResultado(page);
  expect(/alta/i.test(coste) && !/presupuesto/i.test(texto)).toBe(false);
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. Invariante de la familia «selectores» y recetas de la referencia (selector-smartphone)
// ─────────────────────────────────────────────────────────────────────────────

test('HALLAZGO: las opciones son radios de verdad (role="radio", aria-checked, sin aria-pressed)', async ({ page }) => {
  // ABIERTO (inspector 10/10/2026). Hoy: role="group" con cuatro <button aria-pressed>, la forma
  // de los hallazgos 950/1341 de la familia.
  test.fail();
  await abrirTest(page);
  const grupo = page.locator('[class*="opcionesGrid"]');
  await expect(grupo).toHaveAttribute('role', 'radiogroup', { timeout: 1_000 });
  await expect(grupo.locator('[role="radio"]')).toHaveCount(4, { timeout: 1_000 });
  await expect(grupo.locator('[aria-pressed]')).toHaveCount(0, { timeout: 1_000 });
});

test('HALLAZGO: la barra de progreso anuncia la misma fracción que pinta', async ({ page }) => {
  // ABIERTO (inspector 10/10/2026). aria-valuenow = n, aria-valuemin = 1, aria-valuemax = 10:
  // anuncia (n − 1) / 9 y pinta n / 10. En la P1, 0 frente a 0,1; en la P2, 0,111 frente a 0,2.
  test.fail();
  await abrirTest(page);
  const barra = page.locator('[role="progressbar"]');
  const fracciones = async () => barra.evaluate((el) => {
    const n = (a: string) => Number(el.getAttribute(a));
    const anunciada = (n('aria-valuenow') - n('aria-valuemin')) / (n('aria-valuemax') - n('aria-valuemin'));
    const pintada = (el.firstElementChild as HTMLElement).getBoundingClientRect().width / el.clientWidth;
    return { anunciada, pintada };
  });
  const p1 = await fracciones();
  expect(p1.anunciada).toBeCloseTo(p1.pintada, 2);
  await opcion(page, 'Perder peso').click();
  await page.getByRole('button', { name: /Siguiente/ }).click();
  await expect(page.getByText('Pregunta 2 de 10')).toBeVisible();
  const p2 = await fracciones();
  expect(p2.anunciada).toBeCloseTo(p2.pintada, 2);
});

test('HALLAZGO (C0016): tras «Comenzar» y «Siguiente» con teclado el foco sigue en el cuestionario', async ({ page }) => {
  // ABIERTO (inspector 10/10/2026). «Comenzar» desaparece y «Siguiente» se desactiva al llegar la
  // pregunta nueva sin responder: en los dos casos el foco cae a <body>, y el siguiente Tab sale
  // del cuestionario a la primera tarjeta de Apps relacionadas («Orientador IMC»).
  test.fail();
  await cargar(page);
  await page.getByRole('button', { name: 'Comenzar el test' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByText('Pregunta 1 de 10')).toBeVisible();
  const dentro = () => page.evaluate(() => !!document.activeElement?.closest('[class*="testContainer"]'));
  expect(await dentro(), 'tras «Comenzar»').toBe(true);
  await opcion(page, 'Perder peso').click();
  await page.getByRole('button', { name: /Siguiente/ }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByText('Pregunta 2 de 10')).toBeVisible();
  expect(await dentro(), 'tras «Siguiente»').toBe(true);
});

test('HALLAZGO: teclado del patrón de radios (APG): la flecha mueve y marca, y el grupo es una sola parada de Tab', async ({ page }) => {
  // ABIERTO (inspector 10/10/2026). Hoy ArrowDown no hace nada y las cuatro opciones tienen
  // tabIndex 0 (cuatro paradas de Tab).
  test.fail();
  await abrirTest(page);
  const opciones = page.locator('[class*="opcionesGrid"] button');
  await opciones.nth(0).focus();
  await page.keyboard.press('ArrowDown');
  await expect(opciones.nth(1)).toBeFocused({ timeout: 1_000 });
  await expect(opciones.nth(1)).toHaveAttribute('aria-checked', 'true', { timeout: 1_000 });
  expect(await opciones.evaluateAll((els) => els.map((e) => (e as HTMLElement).tabIndex))).toEqual([-1, 0, -1, -1]);
});

test('HALLAZGO: la pantalla de resultado tiene un <h1>', async ({ page }) => {
  // ABIERTO (inspector 10/10/2026). El hero del resultado son dos <p> («Tu patrón alimentario» y
  // el nombre de la dieta), y la tarjeta tampoco tiene encabezado: 0 <h1> en esa pantalla.
  test.fail();
  await abrirTest(page);
  await responder(page, SALUD_GENERAL);
  await leerResultado(page);
  await expect(page.locator('h1')).toHaveCount(1, { timeout: 1_000 });
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. Contraste (claro y oscuro)
// ─────────────────────────────────────────────────────────────────────────────

test('HALLAZGO: el hero del resultado (degradado --primary → --secondary) llega al contraste mínimo en los dos temas', async ({ page }) => {
  // ABIERTO (inspector 10/10/2026). Forma del 1444 (selector-mascota). Medido: nombre de la dieta
  // (16 px, opacidad 0,88) 2,90:1 en claro y 2,22:1 en oscuro, exige 4,5; «Tu patrón alimentario»
  // (texto grande) 3,23:1 en claro y 2,43:1 en oscuro, exige 3.
  test.fail();
  await abrirTest(page);
  await responder(page, SALUD_GENERAL);
  await leerResultado(page);
  await page.mouse.move(0, 0);
  const medidas: string[] = [];
  for (const tema of ['light', 'dark'] as const) {
    await ponerTema(page, tema);
    const sub = await contrasteMinimo(page, '[class*="heroSubtitleSm"]');
    const tit = await contrasteMinimo(page, '[class*="heroTitleSm"]');
    if (sub < 4.5) medidas.push(`nombre de la dieta, ${tema}: ${sub.toFixed(2)}:1`);
    if (tit < 3) medidas.push(`«Tu patrón alimentario», ${tema}: ${tit.toFixed(2)}:1`);
  }
  expect(medidas).toEqual([]);
});

test('HALLAZGO: botones de marca y textos pequeños llegan a 4,5:1', async ({ page }) => {
  // ABIERTO (inspector 10/10/2026). Forma del 1682 (selector-smartphone). Medido en claro:
  // «Comenzar el test» 3,22 · «Siguiente →» 3,26 · «Pregunta N de 10» 3,93 · perfil de la dieta
  // (--secondary) 2,80 · «Alimentos clave» 2,52 · «Reducir o evitar» 3,90 · macros/dificultad/
  // coste 4,11. En oscuro, «Comenzar» 2,43 y «Siguiente» 2,45. Ninguno es texto grande.
  test.fail();
  await cargar(page);
  const bajos: string[] = [];
  const medir = async (nombre: string, selector: string) => {
    const r = await contrasteMinimo(page, selector);
    if (r < 4.5) bajos.push(`${nombre}: ${r.toFixed(2)}:1`);
  };
  for (const tema of ['light', 'dark'] as const) {
    await ponerTema(page, tema);
    await medir(`Comenzar, ${tema}`, '[class*="btnStart"]');
  }
  await ponerTema(page, 'light');
  await page.getByRole('button', { name: 'Comenzar el test' }).click();
  await opcion(page, 'Perder peso').click();
  await page.mouse.move(0, 0);
  for (const tema of ['light', 'dark'] as const) {
    await ponerTema(page, tema);
    await medir(`Siguiente, ${tema}`, '[class*="btnSiguiente"]');
    await medir(`Pregunta N de 10, ${tema}`, '[class*="progresoPaso"]');
  }
  await ponerTema(page, 'light');
  await page.getByRole('button', { name: /Siguiente/ }).click();
  for (let i = 1; i < 10; i++) {
    await page.waitForTimeout(500);
    await page.locator('[class*="opcionesGrid"] button').first().click();
    await botonAvance(page, i).click();
  }
  await leerResultado(page);
  await page.mouse.move(0, 0);
  await medir('perfil de la dieta', '[class*="recomendacionPerfil"]');
  await medir('macros (statValor)', '[class*="statValor"]');
  await medir('«Alimentos clave»', '[class*="alimentosTitulo"]');
  await medir('«Reducir o evitar»', '[class*="limitarTitulo"]');
  expect(bajos).toEqual([]);
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. Contenido: lo servido, el FAQPage y los avisos
// ─────────────────────────────────────────────────────────────────────────────

/** Los bloques JSON-LD del HTML servido. */
async function jsonLd(page: Page): Promise<Record<string, unknown>[]> {
  const html = await (await page.request.get('/selector-dieta/')).text();
  return [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(
    (m) => JSON.parse(m[1]) as Record<string, unknown>,
  );
}

test('HALLAZGO: la guía educativa está en el HTML servido', async ({ page }) => {
  // ABIERTO (inspector 10/10/2026). Forma del 2663: <EducationalSection> va dentro de
  // `pantalla === 'resultado'`, así que el HTML no lleva ni una línea de la guía.
  test.fail();
  const html = await (await page.request.get('/selector-dieta/')).text();
  // Booleano y no toContain: si falla, no vuelca 40 KB de HTML en la salida.
  expect(html.includes('Diferencia entre dieta y patrón alimentario'), 'la guía en el HTML servido').toBe(true);
});

test('HALLAZGO: el JSON-LD WebApplication lleva entre 4 y 8 featureList (§1.ter)', async ({ page }) => {
  // ABIERTO (inspector 10/10/2026). El `jsonLd` que inyecta layout.tsx lleva `features: []`; las
  // ocho características solo están en la meta schema:WebApplication.
  test.fail();
  const app = (await jsonLd(page)).find((b) => b['@type'] === 'WebApplication');
  expect(app, 'hay un WebApplication').toBeTruthy();
  expect(((app?.featureList ?? []) as unknown[]).length).toBeGreaterThanOrEqual(4);
});

test('HALLAZGO: el FAQPage y la tarjeta vegetariana dicen lo mismo de la vitamina B12', async ({ page }) => {
  // ABIERTO (inspector 10/10/2026). FAQPage: «en vegetarianos que consumen lácteos y huevos la
  // ingesta puede ser suficiente». Tarjeta vegetariana: «Vigila vitamina B12 (suplementación
  // recomendable)». Perfil: 24, 26, 20, 11, 24, 18 → Dieta Vegetariana.
  test.fail();
  const faq = (await jsonLd(page)).find((b) => b['@type'] === 'FAQPage') as
    { mainEntity: { name: string; acceptedAnswer: { text: string } }[] } | undefined;
  const respuesta = faq?.mainEntity.find((q) => q.name.includes('vegetariana'))?.acceptedAnswer.text ?? '';
  expect(respuesta).toContain('vitamina B12');
  await abrirTest(page);
  await responder(page, VEGETARIANA);
  expect(await leerResultado(page)).toBe('Dieta Vegetariana');
  const consejos = (await textos(page, 'consejoItem')).join(' ');
  expect(consejos.includes('suplementación recomendable') && respuesta.includes('puede ser suficiente')).toBe(false);
});

test('HALLAZGO: embarazo, lactancia, menores y enfermedad renal se ven junto a un resultado de ayuno', async ({ page }) => {
  // ABIERTO (inspector 10/10/2026). Esa lista solo está en «Cuándo consultar con un
  // dietista-nutricionista», dentro de la guía educativa, que nace cerrada (display:none). La app
  // no pregunta por esos perfiles y recomienda ayuno o cetogénica. Diabetes: 21, 16, 13, 22, 18, 28.
  test.fail();
  await abrirTest(page);
  await responder(page, DIABETES_AYUNO);
  expect(await leerResultado(page)).toBe('Ayuno Intermitente');
  await expect(page.getByText(/embarazada/).first()).toBeVisible({ timeout: 1_000 });
});

test('HALLAZGO: los porcentajes llevan espacio duro antes del «%» (CLAUDE.md §2)', async ({ page }) => {
  // ABIERTO (inspector 10/10/2026). «45-55% carbohidratos · 25-35% grasas saludables · 15-20%
  // proteínas» (macros de la mediterránea), «30%» y «80%» en la guía, «100% vegetal» (P2) y
  // «100% en el navegador» (meta). Norma del 25/09/2026: separado con U+00A0.
  test.fail();
  await abrirTest(page);
  await responder(page, SALUD_GENERAL);
  await leerResultado(page);
  const macros = (await page.locator('[class*="statValor"]').first().evaluate((e) => e.textContent)) ?? '';
  expect(macros).toContain('45-55 %');
});

test('HALLAZGO: sin erratas en el enunciado de la P10 ni en la tarjeta vegana', async ({ page }) => {
  // ABIERTO (inspector 10/10/2026). «¿Qué describes mejor tu relación con la variedad…?» (debe ser
  // «describe») y «Procesados veganos ultrarefinados» («ultrarrefinados»). Perfil vegano: 23, 22,
  // 24, 15, 22, 18 → Dieta Vegana.
  test.fail();
  await abrirTest(page);
  for (let i = 0; i < 9; i++) {
    await opcion(page, VEGANA[i]).click();
    await botonAvance(page, i).click();
    await page.waitForTimeout(500);
  }
  const enunciado = await page.locator('h2[class*="preguntaTexto"]').innerText();
  await opcion(page, VEGANA[9]).click();
  await botonAvance(page, 9).click();
  expect(await leerResultado(page)).toBe('Dieta Vegana');
  const limitar = await textos(page, 'limitarItem');
  expect({ enunciado: enunciado.startsWith('¿Qué describes'), ultra: limitar.some((t) => t.includes('ultrarefinados')) })
    .toEqual({ enunciado: false, ultra: false });
});

test('HALLAZGO: el ámbito España se declara con RegionBadge', async ({ page }) => {
  // ABIERTO (inspector 10/10/2026). Presupuestos en €/mes por persona, «Adaptado al contexto
  // español», «culturalmente alineada con España», el colegio profesional «de España»; sin
  // RegionBadge (forma del 949 de selector-smartphone).
  test.fail();
  await cargar(page);
  await expect(page.getByText(/Datos de referencia: España|Solo España|Herramienta universal/).first())
    .toBeVisible({ timeout: 1_000 });
});

test('HALLAZGO: la guía no da para formar un hábito una cifra que contradice la que cita el propio catálogo', async ({ page }) => {
  // ABIERTO (inspector 10/10/2026). «El cerebro necesita entre 3 y 8 semanas para consolidar un
  // nuevo hábito», sin fuente. selector-ejercicio y seguimiento-habitos citan Lally y col.
  // (European Journal of Social Psychology, 2010): mediana de 66 días, rango 18-254.
  test.fail();
  await abrirTest(page);
  await responder(page, SALUD_GENERAL);
  await leerResultado(page);
  await page.getByRole('button', { name: 'Ver guía educativa' }).click();
  await expect(page.getByRole('heading', { name: 'Cómo hacer la transición sin fracasar' })).toBeVisible();
  expect(await textoResultado(page)).not.toContain('entre 3 y 8 semanas');
});

test('HALLAZGO: el tope de sal de la DASH no confunde sal con sodio', async ({ page }) => {
  // ABIERTO (inspector 10/10/2026). «Sal añadida (< 2g/día en versión estricta)». data/nutrients.ts
  // da para el sodio 1.500 mg/día (máx. 2.300): 1.500 mg de sodio son 3,8 g de sal
  // (NaCl/Na = 58,44/22,99 = 2,54). 2 g de sal son 0,79 g de sodio, la mitad de esa cifra.
  // Perfil: 28, 22, 20, 16, 30, 18 → Dieta DASH.
  test.fail();
  await abrirTest(page);
  await responder(page, DASH_POR_UNO);
  expect(await leerResultado(page)).toBe('Dieta DASH');
  expect((await textos(page, 'limitarItem')).join(' ')).not.toContain('< 2g/día');
});

test('HALLAZGO: la P7 no califica de «sana y sin obsesiones» solo a quien come de todo', async ({ page }) => {
  // ABIERTO (inspector 10/10/2026). Regla 1.quinquies.4 (no moralizar elecciones legítimas): la
  // descripción de «Como de todo sin problema» es «Relación sana y sin obsesiones», que por
  // contraste etiqueta a quien es selectivo/a.
  test.fail();
  await abrirTest(page);
  for (let i = 0; i < 6; i++) {
    await opcion(page, SALUD_GENERAL[i]).click();
    await botonAvance(page, i).click();
    await page.waitForTimeout(500);
  }
  await expect(page.getByText('Pregunta 7 de 10')).toBeVisible();
  await expect(page.locator('[class*="opcionesGrid"]')).not.toContainText('sin obsesiones', { timeout: 1_000 });
});

// ─────────────────────────────────────────────────────────────────────────────
// 6. Móvil 390 px: aterrizaje, doble toque y la barra del logo
// ─────────────────────────────────────────────────────────────────────────────

test.describe('móvil 390 px', () => {
  test.use({
    viewport: { width: 390, height: 844 },
    userAgent: devices['Pixel 7'].userAgent,
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  });

  /** Contesta con toques la ÚLTIMA opción de las preguntas 1..n, tocando «Siguiente» centrado. */
  async function tocarHasta(page: Page, n: number): Promise<void> {
    for (let i = 0; i < n; i++) {
      await expect(page.getByText(`Pregunta ${i + 1} de 10`)).toBeVisible();
      await page.waitForTimeout(500);
      await page.locator('[class*="opcionesGrid"] button').last().tap();
      const p = await encuadrar(page, /Siguiente/);
      await page.touchscreen.tap(p.x, p.y);
    }
  }

  test('HALLAZGO: tras tocar «Ver resultado» la tarjeta del resultado está a la vista', async ({ page }) => {
    // ABIERTO (inspector 10/10/2026). Sin foco ni desplazamiento al resultado, y con el anclaje de
    // scroll del navegador sujetando lo que había debajo: se aterriza en scrollY ≈ 3.070 con la
    // tarjeta ≈ 1.960 px por ENCIMA del borde y «Repetir el test» bajo el dedo. Foco en <body>.
    test.fail();
    test.setTimeout(60_000);
    await abrirTest(page);
    await tocarHasta(page, 9);
    await page.waitForTimeout(500);
    await page.locator('[class*="opcionesGrid"] button').first().tap();
    const p = await encuadrar(page, 'Ver resultado');
    await page.touchscreen.tap(p.x, p.y);
    await leerResultado(page);
    await expect(page.locator('[class*="recomendacionCard"]')).toBeInViewport({ timeout: 2_000 });
  });

  test('HALLAZGO: un doble toque en «Ver resultado» no tira el test y vuelve a la intro', async ({ page }) => {
    // ABIERTO (inspector 10/10/2026). El 1.er toque cambia a la pantalla de resultado y el anclaje
    // de scroll deja «🔄 Repetir el test» justo bajo el dedo; el 2.º lo pulsa: intro, las 10
    // respuestas perdidas. Medido a 360 y 390 px con el botón centrado y arriba.
    test.fail();
    test.setTimeout(60_000);
    await abrirTest(page);
    await tocarHasta(page, 9);
    await page.waitForTimeout(500);
    await page.locator('[class*="opcionesGrid"] button').last().tap();
    const p = await encuadrar(page, 'Ver resultado');
    await page.mouse.dblclick(p.x, p.y);
    await page.waitForTimeout(400);
    expect(new URL(page.url()).pathname).toBe('/selector-dieta/');
    await expect(page.locator('[class*="recomendacionValor"]')).toBeVisible({ timeout: 1_000 });
  });

  test('HALLAZGO: un doble toque en «Comenzar el test» no contesta la pregunta 1', async ({ page }) => {
    // ABIERTO (inspector 10/10/2026). Forma del 2659. Con el botón a y 600 (medido de 540 a 780) el
    // 2.º toque cae en «Mejorar la salud general y longevidad» (+3 a mediterránea y DASH).
    test.fail();
    await cargar(page);
    const p = await encuadrar(page, 'Comenzar el test', 600);
    await page.mouse.dblclick(p.x, p.y);
    await expect(page.getByText('Pregunta 1 de 10')).toBeVisible();
    await page.waitForTimeout(300);
    await expect(page.locator('[class*="opcionesGrid"] [aria-pressed="true"]')).toHaveCount(0, { timeout: 1_000 });
  });

  test('HALLAZGO: un doble toque en «Siguiente» de la P6 (3 opciones) no contesta la P7 (4 opciones)', async ({ page }) => {
    // ABIERTO (inspector 10/10/2026). La P7 tiene una opción más que la P6: su cuarta opción
    // («Como fuera o con horarios muy irregulares», +3 al ayuno) queda donde estaba «Siguiente».
    test.fail();
    test.setTimeout(60_000);
    await abrirTest(page);
    await tocarHasta(page, 5);
    await expect(page.getByText('Pregunta 6 de 10')).toBeVisible();
    await page.waitForTimeout(500);
    await page.locator('[class*="opcionesGrid"] button').last().tap();
    const p = await encuadrar(page, /Siguiente/);
    await page.mouse.dblclick(p.x, p.y);
    await expect(page.getByText('Pregunta 7 de 10')).toBeVisible();
    await page.waitForTimeout(300);
    await expect(page.locator('[class*="opcionesGrid"] [aria-pressed="true"]')).toHaveCount(0, { timeout: 1_000 });
  });

  test('HALLAZGO: tras tocar «Comenzar» el enunciado de la P1 está a la vista, por debajo de la barra del logo', async ({ page }) => {
    // ABIERTO (inspector 10/10/2026). Con el botón centrado, la página se queda en scrollY ≈ 1.420
    // y el enunciado en y −14…40, bajo la barra fija (que acaba en y 62). A 360 px queda entero
    // por encima del borde (y −92…−11).
    test.fail();
    await cargar(page);
    const p = await encuadrar(page, 'Comenzar el test');
    await page.touchscreen.tap(p.x, p.y);
    await expect(page.getByText('Pregunta 1 de 10')).toBeVisible();
    await page.waitForTimeout(200);
    const m = await bajoLaBarra(page, 'h2[class*="preguntaTexto"]');
    expect(m.tapado || m.top < m.barra || m.bottom > m.alto, JSON.stringify(m)).toBe(false);
  });

  test('HALLAZGO: el título del resultado no queda bajo la barra del logo a 390 ni a 360 px', async ({ page }) => {
    // ABIERTO (inspector 10/10/2026). `.heroResultados` lleva 2rem arriba (el `.hero` de la intro
    // sí tiene los 80 px hasta 1.023 px): «Tu patrón alimentario» ocupa y 34-64 y la píldora del
    // logo y 10-52, en scrollY 0.
    test.fail();
    test.setTimeout(60_000);
    await abrirTest(page);
    await responder(page, SALUD_GENERAL);
    await leerResultado(page);
    await page.evaluate(() => window.scrollTo(0, 0));
    const a390 = await bajoLaBarra(page, '[class*="heroTitleSm"]');
    await page.setViewportSize({ width: 360, height: 740 });
    await page.evaluate(() => window.scrollTo(0, 0));
    const a360 = await bajoLaBarra(page, '[class*="heroTitleSm"]');
    expect({ a390: a390.tapado, a360: a360.tapado }).toEqual({ a390: false, a360: false });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 7. Móvil 360 px: el doble toque, en el ancho más estrecho
// ─────────────────────────────────────────────────────────────────────────────

test.describe('móvil 360 px', () => {
  test.use({
    viewport: { width: 360, height: 740 },
    userAgent: devices['Pixel 7'].userAgent,
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  });

  test('HALLAZGO: un doble toque en «Comenzar el test» (botón a y 660) no contesta la pregunta 1', async ({ page }) => {
    // ABIERTO (inspector 10/10/2026). A 360 px, con el botón a y 600-660, el 2.º toque cae en
    // «Más energía y menos bajones».
    test.fail();
    await cargar(page);
    const p = await encuadrar(page, 'Comenzar el test', 660);
    await page.mouse.dblclick(p.x, p.y);
    await expect(page.getByText('Pregunta 1 de 10')).toBeVisible();
    await page.waitForTimeout(300);
    await expect(page.locator('[class*="opcionesGrid"] [aria-pressed="true"]')).toHaveCount(0, { timeout: 1_000 });
  });

  test('HALLAZGO: un doble toque en «Ver resultado» centrado no devuelve a la intro', async ({ page }) => {
    // ABIERTO (inspector 10/10/2026). Mismo mecanismo que a 390 px.
    test.fail();
    test.setTimeout(60_000);
    await abrirTest(page);
    for (let i = 0; i < 9; i++) {
      await page.waitForTimeout(500);
      await page.locator('[class*="opcionesGrid"] button').last().tap();
      const p = await encuadrar(page, /Siguiente/);
      await page.touchscreen.tap(p.x, p.y);
    }
    await expect(page.getByText('Pregunta 10 de 10')).toBeVisible();
    await page.waitForTimeout(500);
    await page.locator('[class*="opcionesGrid"] button').last().tap();
    const p = await encuadrar(page, 'Ver resultado');
    await page.mouse.dblclick(p.x, p.y);
    await page.waitForTimeout(400);
    await expect(page.locator('[class*="recomendacionValor"]')).toBeVisible({ timeout: 1_000 });
  });
});
