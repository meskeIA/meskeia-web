import { test, expect, type Page, type Locator } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { esperarPaginaAsentada } from './_hidratacion';

/**
 * Quiz de Métrica y Estrofas — test de regresión del Inspector (1.ª pasada, 28/10/2026)
 *
 * QUÉ PROMETE LA APP
 * ──────────────────
 * · <h1> «Quiz de Métrica 🎵» · «Tipos de verso, estrofas, rima y sinalefa · ESO, Bachillerato y
 *   Selectividad». Tres niveles (Básico «10 preguntas esenciales», Intermedio «10 preguntas
 *   habituales», Avanzado «8 preguntas complejas») y un selector de 8 / 10 / 15 preguntas; el botón
 *   dice «Empezar Quiz — N preguntas · nivel».
 * · Pantalla final: «N pts», título por tramo, «X de Y respuestas correctas», «X/Y», «Acierto» y
 *   tiempo; salidas «Jugar de nuevo» (misma configuración) y «Cambiar nivel».
 *
 * DE DÓNDE SALEN LOS VALORES ESPERADOS
 * ────────────────────────────────────
 * · `calcularPuntuacion` (page.tsx:272): ≥ 0,9 → 100 · ≥ 0,7 → 60 + (p − 0,7)/0,2·40 ·
 *   ≥ 0,5 → 40 + (p − 0,5)/0,2·20 · resto p·80. A mano: 7/10 → 60 · 6/8 → 70 · 0/10 → 0 ·
 *   8/8 → 100. Títulos (page.tsx:280): ≥ 0,9 «¡Dominas la métrica!» · ≥ 0,7 «¡Muy buena
 *   puntuación!» · ≥ 0,5 «Buen intento» · resto «Sigue repasando».
 * · La CLAVE con que se juega se lee del banco de page.tsx (como texto: el banco no se exporta).
 *   Las partidas miden la MECÁNICA. Que la clave sea VERDAD se mide aparte, en «Contenido del
 *   banco», contra una respuesta resuelta a mano para cada una de las 28 preguntas.
 * · Banco a 28/10/2026: 10 básico · 10 intermedio · 8 avanzado. `generarPreguntas` hace
 *   `slice(0, min(num, pool))`, así que el selector de 15 nunca da 15 (hallazgo).
 *
 * DOBLE TOQUE (invariante de la familia de los quizzes, cabo C0082)
 * ─────────────────────────────────────────────────────────────────
 * La app monta `useGuardaRafaga` (lib/useGuardaRafaga.ts: escucha en captura sobre window) y la
 * marca en `iniciarQuiz` (también «Jugar de nuevo»), `siguiente` («Siguiente pregunta» y «Ver
 * resultados») y `volverConfig` («Cambiar nivel»). Medido el 28/10/2026 a 1280×800, 1920×1080,
 * 412×915, 390×844, 360×740 y 768×1024, ratón con detail 2 y toque táctil: 0 anomalías en ~420
 * dobles, con el 2.º cayendo sobre opciones, sobre «Ver guía educativa» y sobre el enlace de una
 * relacionada (/guia-metrica-estrofas/ a 390 y 412 px).
 */

const RUTA = '/quiz-metrica-estrofas/';
const DURO = String.fromCharCode(0xa0);
const norm = (s: string | null | undefined): string => (s ?? '').replace(/[ \t\n\r]+/g, ' ').trim();

interface Ficha {
  nivel: string;
  categoria: string;
  enunciado: string;
  opciones: string[];
  correcta: string;
  explicacion: string;
}

const FUENTE = readFileSync(join(process.cwd(), 'app', 'quiz-metrica-estrofas', 'page.tsx'), 'utf8');
const BANCO: Ficha[] = [
  ...FUENTE.matchAll(
    /nivel: '(\w+)', categoria: '(\w+)',\s*enunciado: '([^']*)',\s*opciones: \[([\s\S]*?)\],\s*correcta: '([^']*)',\s*explicacion: '([^']*)'/g,
  ),
].map((m) => ({
  nivel: m[1],
  categoria: m[2],
  enunciado: m[3],
  opciones: [...m[4].matchAll(/'([^']*)'/g)].map((o) => o[1]),
  correcta: m[5],
  explicacion: m[6],
}));
const POR_ENUNCIADO = new Map(BANCO.map((p) => [p.enunciado, p]));

async function abrir(page: Page): Promise<void> {
  await page.addInitScript(() => {
    try {
      localStorage.setItem('meskeia_transparency_banner_dismissed', 'true');
    } catch {
      /* sin almacenamiento: saldrá el aviso */
    }
    // Registra el `detail` de cada clic ANTES que la guarda de la app (que se engancha después,
    // en un useEffect): prueba que el 2.º clic de la ráfaga existió aunque la app lo ignore.
    const w = window as unknown as { __detalles: number[] };
    w.__detalles = [];
    window.addEventListener('click', (e) => w.__detalles.push(e.detail), true);
  });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(RUTA);
  await expect(page.locator('h1')).toContainText('Quiz de Métrica');
  await esperarPaginaAsentada(page);
  await page.evaluate(() => {
    (window as unknown as { __marca: string }).__marca = 'sin-recarga';
  });
}

const botonEmpezar = (page: Page): Locator => page.getByRole('button', { name: /^Empezar Quiz/ });
const opciones = (page: Page): Locator => page.locator('button:has([class*="opcionLetra"])');
const hud = async (page: Page): Promise<string[]> => (await page.locator('[class*="hudValor"]').allInnerTexts()).map(norm);

async function configurar(page: Page, nivel: 'Básico' | 'Intermedio' | 'Avanzado', num: 8 | 10 | 15): Promise<void> {
  const bNivel = page.getByRole('button', { name: new RegExp(nivel) }).first();
  await bNivel.click();
  await expect(bNivel).toHaveAttribute('aria-pressed', 'true');
  const bNum = page.getByRole('button', { name: `${num} preguntas`, exact: true });
  await bNum.click();
  await expect(bNum).toHaveAttribute('aria-pressed', 'true');
}

async function empezar(page: Page): Promise<void> {
  await botonEmpezar(page).click();
  await expect(page.locator('[class*="preguntaCard"]')).toBeVisible();
}

async function fichaVisible(page: Page): Promise<Ficha> {
  const texto = norm(await page.locator('[class*="preguntaEnunciado"]').innerText());
  const ficha = POR_ENUNCIADO.get(texto);
  expect(ficha, `enunciado que no está en el banco: «${texto}»`).toBeTruthy();
  return ficha as Ficha;
}

/** Textos de las cuatro opciones, leídos de su aria-label «Opción A: …». */
async function textosOpcion(page: Page): Promise<string[]> {
  const etiquetas = await opciones(page).evaluateAll((bs) => bs.map((b) => b.getAttribute('aria-label') ?? ''));
  return etiquetas.map((e) => e.replace(/^Opción [A-D]: /, ''));
}

async function responder(page: Page, modo: 'bien' | 'mal'): Promise<Ficha> {
  const ficha = await fichaVisible(page);
  const ops = await textosOpcion(page);
  expect(ops).toHaveLength(4);
  const iC = ops.indexOf(ficha.correcta);
  expect(iC, `la clave «${ficha.correcta}» no está entre las opciones`).toBeGreaterThanOrEqual(0);
  await opciones(page).nth(modo === 'bien' ? iC : iC === 0 ? 1 : 0).click();
  await expect(page.locator('[class*="feedbackResultado"]')).toBeVisible();
  return ficha;
}

async function avanzar(page: Page): Promise<string> {
  const boton = page.getByRole('button', { name: /Siguiente pregunta|Ver resultados/ });
  const rotulo = norm(await boton.innerText());
  await boton.click();
  return rotulo;
}

/** Juega hasta el final: las `aciertos` primeras bien y el resto mal. Devuelve las fichas y el foco tras cada «Siguiente». */
async function jugar(page: Page, aciertos: number): Promise<{ fichas: Ficha[]; focos: string[] }> {
  const fichas: Ficha[] = [];
  const focos: string[] = [];
  for (let n = 1; n <= 20; n++) {
    fichas.push(await responder(page, n <= aciertos ? 'bien' : 'mal'));
    const rotulo = await avanzar(page);
    if (/Ver resultados/.test(rotulo)) break;
    await expect(page.locator('[class*="feedbackResultado"]')).toHaveCount(0);
    focos.push(
      await page.evaluate(() => {
        const a = document.activeElement;
        if (!a || a === document.body) return 'BODY';
        return `${a.tagName}${a.getAttribute('tabindex') === '-1' ? '[-1]' : ''}${a.matches('[class*="preguntaCard"]') ? '.enunciado' : ''}`;
      }),
    );
  }
  return { fichas, focos };
}

async function resultado(page: Page) {
  await expect(page.locator('[class*="resultadoPanel"]')).toBeVisible();
  return page.evaluate(() => {
    // Solo blancos ASCII: `\s` se comería el U+00A0 que vigila el caso del porcentaje.
    const t = (s: string | null | undefined): string => (s ?? '').replace(/[ \t\n\r]+/g, ' ').trim();
    const q = (s: string): string => t(document.querySelector(s)?.textContent);
    const stats = Object.fromEntries(
      [...document.querySelectorAll('[class*="statR"]')]
        .filter((e) => e.querySelector('[class*="statRLabel"]'))
        .map((e) => [t(e.querySelector('[class*="statRLabel"]')?.textContent), t(e.querySelector('[class*="statRValor"]')?.textContent)]),
    );
    return {
      titulo: q('[class*="resultadoTitulo"]'),
      puntos: q('[class*="resultadoPuntos"]'),
      subtitulo: q('[class*="resultadoSubtitulo"]'),
      stats,
      marca: (window as unknown as { __marca?: string }).__marca,
    };
  });
}

// ─────────────────────────────────────────────────────────────────────────────

test.describe('Quiz de Métrica · partida', () => {
  /**
   * CASO NORMAL — Básico, 10 preguntas, 7 bien y 3 mal.
   * A mano: 7/10 = 0,7 → 60 + 0·40 = 60 pts · tramo ≥ 0,7 → «¡Muy buena puntuación!» ·
   * «7 de 10 respuestas correctas» · «7/10» · Acierto 70 % (el formato del % se vigila aparte).
   * 10 enunciados distintos, todos del nivel básico (banco básico = 10).
   */
  test('caso normal: 7 de 10 en Básico dan 60 pts y «¡Muy buena puntuación!»', async ({ page }) => {
    test.setTimeout(90_000);
    await abrir(page);
    await configurar(page, 'Básico', 10);
    await expect(botonEmpezar(page)).toHaveText(/Empezar Quiz — 10 preguntas · .*Básico/);
    await empezar(page);
    expect((await hud(page))[0]).toBe('1/10');
    const { fichas, focos } = await jugar(page, 7);
    expect(fichas).toHaveLength(10);
    expect(new Set(fichas.map((f) => f.enunciado)).size, 'pregunta repetida en la partida').toBe(10);
    expect(fichas.every((f) => f.nivel === 'basico'), 'Básico ha colado otro nivel').toBe(true);
    // Invariante de la familia: tras «Siguiente», el foco va al enunciado (tabindex -1, no un botón)
    expect(focos).toEqual(Array(9).fill('DIV[-1].enunciado'));

    const r = await resultado(page);
    expect(r.puntos).toBe('60 pts');
    expect(r.titulo).toBe('¡Muy buena puntuación!');
    expect(r.subtitulo).toBe('7 de 10 respuestas correctas');
    expect(r.stats.Correctas).toBe('7/10');
    expect(r.stats.Acierto).toMatch(new RegExp(`^70${DURO}?%$`));
  });

  /**
   * CASO LÍMITE — todo mal en Intermedio, «Jugar de nuevo» sin recargar, y pleno en Avanzado con 8.
   * A mano: 0/10 → 0·80 = 0 pts, «Sigue repasando», «0 de 10», Acierto 0 %. «Jugar de nuevo»
   * conserva la marca de window, vuelve a 1/10 con 0 correctas. 8/8 en Avanzado (banco = 8) →
   * ≥ 0,9 → 100 pts, «¡Dominas la métrica!», «8 de 8 respuestas correctas».
   */
  test('caso límite: 0 de 10 da 0 pts y 8 de 8 en Avanzado da 100 pts; «Jugar de nuevo» no recarga', async ({ page }) => {
    test.setTimeout(120_000);
    await abrir(page);
    await configurar(page, 'Intermedio', 10);
    await empezar(page);
    const { fichas } = await jugar(page, 0);
    expect(fichas.every((f) => f.nivel === 'intermedio')).toBe(true);
    let r = await resultado(page);
    expect(r.puntos).toBe('0 pts');
    expect(r.titulo).toBe('Sigue repasando');
    expect(r.subtitulo).toBe('0 de 10 respuestas correctas');
    expect(r.stats.Correctas).toBe('0/10');
    expect(r.stats.Acierto).toMatch(new RegExp(`^0${DURO}?%$`));

    await page.getByRole('button', { name: /Jugar de nuevo/ }).click();
    await expect(page.locator('[class*="preguntaCard"]')).toBeVisible();
    expect(await hud(page)).toEqual(['1/10', '0', expect.stringMatching(new RegExp(`^0${DURO}?%$`))]);
    expect(await page.evaluate(() => (window as unknown as { __marca?: string }).__marca)).toBe('sin-recarga');
    await jugar(page, 0);
    await resultado(page);

    await page.getByRole('button', { name: /Cambiar nivel/ }).click();
    await configurar(page, 'Avanzado', 8);
    await empezar(page);
    const pleno = await jugar(page, 99);
    expect(pleno.fichas).toHaveLength(8);
    expect(pleno.fichas.every((f) => f.nivel === 'avanzado')).toBe(true);
    r = await resultado(page);
    expect(r.puntos).toBe('100 pts');
    expect(r.titulo).toBe('¡Dominas la métrica!');
    expect(r.subtitulo).toBe('8 de 8 respuestas correctas');
    expect(r.marca).toBe('sin-recarga');
  });

  /**
   * LO QUE DEBE IGNORARSE — doble clic en la correcta, clic tardío en otra, doble clic en «Siguiente».
   * A mano: `responder` sale si `seleccionada !== null` y las opciones quedan disabled → 1 acierto,
   * una sola opción en verde y ninguna en rojo; el doble clic en «Siguiente» avanza UNA pregunta y
   * no contesta la 2 (guarda de ráfaga).
   */
  test('caso de rechazo: el doble clic no puntúa doble ni contesta la pregunta siguiente', async ({ page }) => {
    await abrir(page);
    await configurar(page, 'Básico', 8);
    await empezar(page);
    const ficha = await fichaVisible(page);
    const iC = (await textosOpcion(page)).indexOf(ficha.correcta);
    await opciones(page).nth(iC).dblclick();
    await opciones(page).nth(iC === 0 ? 1 : 0).click({ force: true });
    await expect(page.locator('[class*="feedbackResultado"]')).toHaveText('¡Correcto!');
    const clases = await opciones(page).evaluateAll((bs) => bs.map((b) => b.className));
    expect(clases.filter((c) => /opcionCorrecta/.test(c))).toHaveLength(1);
    expect(clases.filter((c) => /opcionIncorrecta/.test(c)), 'el clic tardío ha marcado otra opción').toHaveLength(0);
    expect((await hud(page))[1]).toBe('1');

    // Doble clic de verdad en «Siguiente»: 2.º evento con detail 2 en el mismo punto
    const sig = page.getByRole('button', { name: /Siguiente pregunta/ });
    await sig.dblclick();
    await expect.poll(async () => (await hud(page))[0]).toBe('2/8');
    await page.waitForTimeout(300);
    await expect(page.locator('[class*="feedbackResultado"]')).toHaveCount(0);
    await expect(opciones(page).first()).toBeEnabled();
  });
});

// ─────────────────────────────────────────────────────────────────────────────

/**
 * DOBLE TOQUE en «Empezar», cada «Siguiente», «Ver resultados», «Jugar de nuevo» y «Cambiar
 * nivel», con el 2.º clic (detail 2) en el MISMO punto y la pantalla nueva ya pintada. Es lo que el
 * testigo de la familia no mira: solo mide a 390×844 y no recorre las salidas del resultado
 * (28/10/2026). Hoy pasa en los tres anchos: la app usa `useGuardaRafaga`.
 */
interface Estado {
  url: string;
  pantalla: string;
  contador: string;
  bloqueadas: number;
  guia: string | null;
  config: string;
  nota: string;
}

async function estado(page: Page): Promise<Estado> {
  return page.evaluate(() => {
    const ops = [...document.querySelectorAll('button')].filter((b) => b.querySelector('[class*="opcionLetra"]'));
    let pantalla = 'otra';
    if (document.querySelector('[class*="resultadoPanel"]')) pantalla = 'resultado';
    else if (document.querySelector('[class*="preguntaCard"]')) pantalla = 'quiz';
    else if (document.querySelector('[class*="configPanel"]')) pantalla = 'config';
    return {
      url: location.href,
      pantalla,
      contador: (document.querySelector('[class*="hudValor"]')?.textContent ?? '').trim(),
      bloqueadas: ops.filter((b) => b.disabled).length,
      guia: document.querySelector('[class*="toggleButton"]')?.getAttribute('aria-expanded') ?? null,
      config: [...document.querySelectorAll('button[aria-pressed="true"]')].map((b) => (b.textContent ?? '').trim()).join(','),
      nota: (document.querySelector('[class*="resultadoPuntos"]')?.textContent ?? '').trim(),
    };
  });
}

/** 1.er clic (detail 1); espera a la pantalla nueva; 2.º clic (detail 2) en el mismo punto. */
async function doble(page: Page, loc: Locator, llega: (e: Estado) => boolean): Promise<{ intermedio: Estado; despues: Estado }> {
  await loc.scrollIntoViewIfNeeded();
  const b = await loc.boundingBox();
  if (!b) throw new Error('el botón no tiene caja');
  const [x, y] = [b.x + b.width / 2, b.y + b.height / 2];
  await page.evaluate(() => {
    (window as unknown as { __detalles: number[] }).__detalles = [];
  });
  await page.mouse.move(x, y);
  await page.mouse.down({ clickCount: 1 });
  await page.mouse.up({ clickCount: 1 });
  await expect.poll(async () => llega(await estado(page))).toBe(true);
  await page.waitForTimeout(80);
  const intermedio = await estado(page);
  await page.mouse.down({ clickCount: 2 });
  await page.mouse.up({ clickCount: 2 });
  await page.waitForTimeout(400);
  const detalles = await page.evaluate(() => (window as unknown as { __detalles: number[] }).__detalles);
  expect(detalles, 'el 2.º clic no llegó con detail 2').toContain(2);
  return { intermedio, despues: await estado(page) };
}

async function recorrerConDobles(page: Page): Promise<void> {
  test.setTimeout(120_000);
  await abrir(page);
  await configurar(page, 'Básico', 8);
  let r = await doble(page, botonEmpezar(page), (e) => e.pantalla === 'quiz');
  expect(r.despues, 'Empezar').toEqual({ ...r.intermedio, bloqueadas: 0 });
  for (let n = 1; n <= 8; n++) {
    await page.waitForTimeout(250);
    await responder(page, n % 2 ? 'bien' : 'mal');
    const rot = n < 8 ? /Siguiente pregunta/ : /Ver resultados/;
    const antes = (await estado(page)).contador;
    r = await doble(page, page.getByRole('button', { name: rot }), (e) => e.pantalla !== 'quiz' || e.contador !== antes);
    if (n < 8) {
      expect(r.despues, `Siguiente tras la ${n}`).toEqual({ ...r.intermedio, bloqueadas: 0 });
    } else {
      expect(r.despues.pantalla, 'Ver resultados').toBe('resultado');
      expect(r.despues, 'Ver resultados').toEqual(r.intermedio);
    }
  }
  r = await doble(page, page.getByRole('button', { name: /Jugar de nuevo/ }), (e) => e.pantalla === 'quiz');
  expect(r.despues, 'Jugar de nuevo').toEqual({ ...r.intermedio, bloqueadas: 0 });
  await jugar(page, 0);
  await resultado(page);
  r = await doble(page, page.getByRole('button', { name: /Cambiar nivel/ }), (e) => e.pantalla === 'config');
  expect(r.despues, 'Cambiar nivel').toEqual(r.intermedio);
}

test.describe('Quiz de Métrica · doble toque a 412 × 915', () => {
  test.use({
    viewport: { width: 412, height: 915 },
    userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Mobile Safari/537.36',
    deviceScaleFactor: 2.625,
    isMobile: true,
    hasTouch: true,
  });
  test('sano · el 2.º toque no contesta, no saca de la app ni se come la nota', async ({ page }) => {
    await recorrerConDobles(page);
  });
});

test.describe('Quiz de Métrica · doble toque a 768 × 1024', () => {
  test.use({
    viewport: { width: 768, height: 1024 },
    userAgent: 'Mozilla/5.0 (Linux; Android 14; SM-X200) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36',
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });
  test('sano · el 2.º toque no contesta, no saca de la app ni se come la nota', async ({ page }) => {
    await recorrerConDobles(page);
  });
});

test.describe('Quiz de Métrica · doble clic en escritorio 1280 × 800', () => {
  test.use({ viewport: { width: 1280, height: 800 } });
  test('sano · el 2.º clic no contesta, no saca de la app ni se come la nota', async ({ page }) => {
    await recorrerConDobles(page);
  });
});

// ─────────────────────────────────────────────────────────────────────────────

test.describe('Inspector 28/10/2026 · hallazgos de la partida', () => {
  test('hallazgo · el «Acierto» en vivo no pasa del 100 % (2 de 2 dan 100 %, no 200 %)', async ({ page }) => {
    // page.tsx:452 — `correctas / preguntaActual`: el numerador ya cuenta la pregunta contestada y el
    // denominador no. A mano: 1 de 1 → 100 %; 2 de 2 → 100 %. Medido: 0 % y 200 % (luego 150, 133…).
    test.fail();
    await abrir(page);
    await configurar(page, 'Básico', 10);
    await empezar(page);
    await responder(page, 'bien');
    const tras1 = (await hud(page))[2];
    await avanzar(page);
    await responder(page, 'bien');
    const tras2 = (await hud(page))[2];
    const pct = new RegExp(`^100${DURO}?%$`);
    expect([tras1, tras2], 'Acierto tras 1 de 1 y tras 2 de 2').toEqual([expect.stringMatching(pct), expect.stringMatching(pct)]);
  });

  test('hallazgo · «15 preguntas» da 15 preguntas (y Avanzado con 10 da 10)', async ({ page }) => {
    // page.tsx:252 y :266 — el selector ofrece 15 y el botón promete «Empezar Quiz — 15 preguntas»,
    // pero `slice(0, min(num, pool))` con pools de 10/10/8 da 10 en Básico e Intermedio y 8 en
    // Avanzado (también con 10: la tarjeta de Avanzado dice «8 preguntas»). Medido: 1/10 y 1/8.
    test.fail();
    await abrir(page);
    await configurar(page, 'Básico', 15);
    await expect(botonEmpezar(page)).toHaveText(/15 preguntas/);
    await empezar(page);
    const basico15 = (await hud(page))[0];
    await page.goto(RUTA);
    await esperarPaginaAsentada(page);
    await configurar(page, 'Avanzado', 10);
    await expect(botonEmpezar(page)).toHaveText(/10 preguntas/);
    await empezar(page);
    const avanzado10 = (await hud(page))[0];
    expect([basico15, avanzado10]).toEqual(['1/15', '1/10']);
  });

  test('hallazgo · el porcentaje va separado con espacio duro («75 %»)', async ({ page }) => {
    // page.tsx:452 y :553 pegan el «%» (regla de formato del 25/09/2026, Ortografía RAE 2010).
    // A mano: Básico con 8, 6 bien → 6/8 = 0,75 → 60 + 0,05/0,2·40 = 70 pts, Acierto 75 %.
    test.fail();
    await abrir(page);
    await configurar(page, 'Básico', 8);
    await empezar(page);
    await jugar(page, 6);
    const r = await resultado(page);
    expect(r.puntos).toBe('70 pts'); // sano: que el fallo sea el del formato
    expect(r.stats.Acierto).toBe(`75${DURO}%`);
  });

  test('hallazgo · tras «Cambiar nivel» el foco no cae a <body>', async ({ page }) => {
    // page.tsx:334-357 — `volverConfig` desmonta el resultado y el efecto de foco no tiene rama para
    // la pantalla «config»: con teclado se vuelve al principio de la página. Medido: BODY.
    test.fail();
    await abrir(page);
    await configurar(page, 'Básico', 8);
    await empezar(page);
    await jugar(page, 8);
    await resultado(page);
    await page.getByRole('button', { name: /Cambiar nivel/ }).focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('[class*="configPanel"]')).toBeVisible();
    const enBody = await page.evaluate(() => document.activeElement === document.body || document.activeElement === null);
    expect(enBody, 'foco en <body> tras «Cambiar nivel»').toBe(false);
  });

  test('hallazgo · emojis sin aria-hidden en la región viva, los niveles y la categoría; barra de progreso sin nombre', async ({ page }) => {
    // page.tsx:240-249 (🟢🟡🔴 y 📏🏛️🎵✍️ en cadenas que se pintan), :509-511 (✅/❌ dentro del
    // role="alert") y :459-466 (role="progressbar" sin aria-label).
    // La parte de la barra quedó REPARADA el 29/10/2026 (56bfa250, hermana de 3773: «Progreso del
    // quiz»); el test sigue fallando por los emojis, que el 3678 conserva abiertos.
    test.fail();
    await abrir(page);
    const fallos: string[] = [];
    const nombreNivel = await page.getByRole('button', { name: /Básico/ }).first().getAttribute('aria-label');
    const textoNivel = nombreNivel ?? (await page.getByRole('button', { name: /Básico/ }).first().evaluate((b) => {
      const c = b.cloneNode(true) as HTMLElement;
      c.querySelectorAll('[aria-hidden="true"]').forEach((n) => n.remove());
      return c.textContent ?? '';
    }));
    if (/\p{Extended_Pictographic}/u.test(textoNivel)) fallos.push(`nivel: ${norm(textoNivel)}`);
    await configurar(page, 'Básico', 8);
    await empezar(page);
    const categoria = await page.locator('[class*="preguntaCategoria"]').evaluate((e) => {
      const c = e.cloneNode(true) as HTMLElement;
      c.querySelectorAll('[aria-hidden="true"]').forEach((n) => n.remove());
      return c.textContent ?? '';
    });
    if (/\p{Extended_Pictographic}/u.test(categoria)) fallos.push(`categoría: ${norm(categoria)}`);
    const barra = page.locator('[role="progressbar"]');
    const nombreBarra = (await barra.getAttribute('aria-label')) ?? (await barra.getAttribute('aria-labelledby'));
    if (!nombreBarra) fallos.push('barra de progreso sin nombre');
    await responder(page, 'bien');
    const viva = await page.locator('[class*="feedbackPanel"]').evaluate((r) => {
      const c = r.cloneNode(true) as HTMLElement;
      c.querySelectorAll('[aria-hidden="true"]').forEach((n) => n.remove());
      return (c.textContent ?? '').slice(0, 40);
    });
    if (/[✅❌]/u.test(viva)) fallos.push(`región viva: ${norm(viva)}`);
    expect(fallos).toEqual([]);
  });
});

// ─────────────────────────────────────────────────────────────────────────────

/**
 * CONTENIDO DEL BANCO — cada clave resuelta a mano el 28/10/2026, antes de leer la de la app.
 * Recuentos con sinalefa y ley del acento final (+1 aguda, 0 llana, −1 esdrújula).
 */
const ficha = (re: RegExp): Ficha => {
  const p = BANCO.find((q) => re.test(q.enunciado));
  if (!p) throw new Error(`no hay ninguna pregunta que case con ${re}`);
  return p;
};

const CLAVE_A_MANO: [RegExp, string][] = [
  [/verso de 8 sílabas/, 'Octosílabo'],
  [/verso de 11 sílabas/, 'Endecasílabo'],
  [/sílabas tiene el alejandrino/, '14'],
  [/arte pertenece el octosílabo/, 'Arte menor'], // arte menor: hasta 8 sílabas
  [/arte pertenece el endecasílabo/, 'Arte mayor'],
  [/unión de la vocal final/, 'Sinalefa'],
  [/coincide solo en las vocales/, 'Asonante'],
  [/versos tiene el soneto/, '14'],
  [/4 octosílabos tiene esquema de rima abba/, 'Redondilla'], // la cuarteta es abab
  [/tipo de verso usa el romance/, 'Octosílabo'],
  [/esquema de rima tiene el cuarteto/, 'ABBA'],
  [/versos tiene la décima/, '10'],
  [/tipo de rima usa el romance/, 'Asonante'],
  [/palabra aguda/, 'Se suma 1'],
  [/palabra esdrújula/, 'Se resta 1'],
  [/esquema de rima tiene el serventesio/, 'ABAB'],
  [/verso de 7 sílabas/, 'Heptasílabo'],
  [/rima tiene el soneto clásico/, 'Consonante'],
  [/convierte en diptongo/, 'Sinéresis'],
  [/sílabas tiene el eneasílabo/, '9'],
  [/esquema exacto de la décima/, 'abbaaccddc'],
  [/metros combina la lira/, 'Heptasílabos y endecasílabos'], // 7a 11B 7a 7b 11B
  [/combina libremente la silva/, 'Endecasílabos y heptasílabos'],
  [/haiku/, '5-7-5 (17 en total)'],
  [/diéresis en métrica/, 'Separar un diptongo en dos sílabas distintas'],
  [/soneto petrarquista/, 'ABBA ABBA / CDC DCD'],
  [/verso blanco del verso libre/, 'El blanco tiene metro regular pero sin rima; el libre no tiene ni metro ni rima fijos'],
];

test.describe('Inspector 28/10/2026 · contenido del banco', () => {
  test('sano · banco legible, 4 opciones distintas, la clave entre ellas y la clave de 27 preguntas cuadra a mano', () => {
    expect(BANCO.length, 'el patrón ya no lee el banco de page.tsx').toBeGreaterThanOrEqual(28);
    for (const p of BANCO) {
      expect(new Set(p.opciones).size, p.enunciado).toBe(4);
      expect(p.opciones, p.enunciado).toContain(p.correcta);
    }
    for (const [re, clave] of CLAVE_A_MANO) expect(ficha(re).correcta, String(re)).toBe(clave);
  });

  test('3662 · octava real: el esquema es ABABABCC (8 versos), no ABABABABCC (10)', () => {
    // La propia explicación dice «8 endecasílabos […] seis versos en rima alterna y un pareado»:
    // ABABAB + CC = 8 letras. La clave «ABABABABCC» tenía 10 y ninguna opción tenía 8.
    // REPARADO el 28/10/2026. Lo que valía era «una sola opción de 8 letras»; al reparar, las
    // cuatro pasan a 8 letras para que la longitud no delate la clave: se mide que haya una sola
    // con el esquema canónico y que la clave sea esa.
    const p = ficha(/octava real/);
    expect(p.correcta).toBe('ABABABCC');
    expect(p.opciones.filter((o) => o === 'ABABABCC')).toHaveLength(1);
    expect(p.opciones.every((o) => o.length === 8), 'cada opción, un esquema de 8 versos').toBe(true);
  });

  test('3674 · el pareado final no distingue la octava real de la ottava rima italiana', () => {
    // La ottava rima (Boccaccio, Ariosto, Tasso) ya es ABABABCC: la octava real es su adaptación.
    // REPARADO el 28/10/2026.
    expect(ficha(/octava real/).explicacion).not.toMatch(/distingue de la ottava italiana/);
  });

  test('hallazgo · rima asonante: «verde» y «ramas» no riman (é-e frente a á-a)', () => {
    // vér-de → e-e · rá-mas → a-a. En el Romance sonámbulo riman «ramas» / «montaña» (á-a).
    test.fail();
    expect(ficha(/coincide solo en las vocales/).explicacion).not.toMatch(/«verde» \/ «ramas» riman/);
  });

  test('hallazgo · el heptasílabo no es «el verso de arte menor más largo»: lo es el octosílabo', () => {
    // La propia app (pregunta del arte del octosílabo): «El octosílabo es precisamente el límite
    // superior del arte menor».
    test.fail();
    expect(ficha(/verso de 7 sílabas/).explicacion).not.toMatch(/arte menor más largo/);
  });

  test('hallazgo · «Del salón en el ángulo oscuro» es decasílabo, no ejemplo de eneasílabo', () => {
    // Del / sa / lón / en / el / án / gu / lo os / cu / ro = 10 (llana). Bécquer, Rima VII.
    test.fail();
    expect(ficha(/sílabas tiene el eneasílabo/).explicacion).not.toMatch(/Del salón en el ángulo oscuro/);
  });

  test('hallazgo · serventesio «de 4 endecasílabos» ilustrado con «Canción de otoño en primavera», en eneasílabos', () => {
    // Ju / ven / tud / di / vi / no / te / so / ro = 9 · ya / te / vas / pa / ra / no / vol / ver = 8 + 1 = 9.
    test.fail();
    const e = ficha(/esquema de rima tiene el serventesio/).explicacion;
    expect(/4 endecasílabos/.test(e) && /Canción de otoño en primavera/.test(e)).toBe(false);
  });

  test('hallazgo · la ley del acento final vale para TODO verso, no para «el último verso»', () => {
    test.fail();
    expect([ficha(/palabra aguda/).enunciado, ficha(/palabra esdrújula/).enunciado].filter((e) => /el último verso/.test(e))).toEqual([]);
  });

  test('hallazgo · el endecasílabo «introducido por Garcilaso» contradice «Boscán y Garcilaso» de la misma app', () => {
    test.fail();
    const endecasilabo = ficha(/verso de 11 sílabas/).explicacion;
    const petrarquista = ficha(/soneto petrarquista/).explicacion;
    expect(/Introducido por Garcilaso/.test(endecasilabo) && /Boscán y Garcilaso/.test(petrarquista)).toBe(false);
  });

  test('hallazgo · la tabla de la guía da ejemplos que no tienen las sílabas de su fila', async ({ page }) => {
    // Recuentos a mano (sinalefa, acento final):
    //   «Noche oscura»            No / che os / cu / ra = 4  (fila Pentasílabo, 5; y «Lira (combinado)»:
    //                             la lira es 7 + 11, la propia app lo dice)
    //   «Olas gigantes»           O / las / gi / gan / tes = 5 (fila Hexasílabo, 6; es el arranque de
    //                             un endecasílabo de la Rima LII)
    //   «Del salón en el ángulo oscuro»  = 10 (fila Eneasílabo, 9)
    //   Sanos: «Si de mi baja lira» 7 · «Verde que te quiero verde» 8 · «Yo no nací sino para
    //   quereros» 11 · «La princesa está triste…» 7 + 7 = 14.
    test.fail();
    const CUENTA: Record<string, number> = {
      'Noche oscura': 4,
      'Olas gigantes': 5,
      'Del salón en el ángulo oscuro': 10,
      'Si de mi baja lira': 7,
      'Verde que te quiero verde': 8,
      'Yo no nací sino para quereros': 11,
    };
    await abrir(page);
    await page.getByRole('button', { name: /Ver guía educativa/ }).click();
    const filas = await page.locator('[class*="comparativaTable"] tbody tr').evaluateAll((trs) =>
      trs.map((tr) => [...tr.querySelectorAll('td')].map((td) => (td.textContent ?? '').trim())),
    );
    expect(filas.length).toBeGreaterThanOrEqual(8);
    const fallos: string[] = [];
    for (const [verso, silabas, , uso, ejemplo] of filas) {
      const cita = (ejemplo.match(/«([^»]+)»/) ?? [])[1] ?? '';
      if (cita in CUENTA && CUENTA[cita] !== Number(silabas)) fallos.push(`${verso} (${silabas}): «${cita}» = ${CUENTA[cita]}`);
      if (verso === 'Pentasílabo' && /Lira/.test(uso)) fallos.push('Pentasílabo: uso «Lira»');
    }
    expect(fallos).toEqual([]);
  });

  test('hallazgo · «La hora» con sinalefa son 2 sílabas métricas, no 3', async ({ page }) => {
    // la / ho / ra = 3 fonológicas; la sinalefa la + (h)o deja «lao / ra» = 2. La app: «(3 sílabas, 1 sinalefa), no 4».
    test.fail();
    await abrir(page);
    await page.getByRole('button', { name: /Ver guía educativa/ }).click();
    await expect(page.locator('[class*="warningBox"]')).not.toContainText('3 sílabas, 1 sinalefa');
  });

  test('hallazgo · FAQPage: la h y las mayúsculas de arte menor contradicen a la página', async ({ page }) => {
    // FAQPage «¿Qué es una sinalefa…?»: «No se produce […] cuando interviene la letra h (aunque en la
    // práctica la h muda no impide la sinalefa)» frente al aviso visible «la h muda no impide la
    // sinalefa». FAQPage «estrofas clásicas»: décima «ABBAACCDDC» y redondilla «ABBA», en mayúsculas,
    // cuando la página manda «a/b/c para menor» y el banco escribe «abbaaccddc» y «abba».
    test.fail();
    await abrir(page);
    const faq = await page.evaluate(() =>
      [...document.querySelectorAll('script[type="application/ld+json"]')].map((s) => s.textContent ?? '').join(' '),
    );
    const fallos: string[] = [];
    if (/cuando interviene la letra h/.test(faq)) fallos.push('sinalefa y h');
    if (/ABBAACCDDC|cuatro octosílabos ABBA/.test(faq)) fallos.push('mayúsculas en arte menor');
    expect(fallos).toEqual([]);
  });

  test('hallazgo · la metadata no promete lo que el banco no pregunta', async ({ page }) => {
    // FAQPage: «el avanzado profundiza en […] casos especiales de cómputo silábico» — ninguna de las 8
    // del avanzado pide medir un verso (el campo `contexto` existe y ninguna pregunta lo usa).
    // features: «tipos de verso (pentasílabo al alejandrino)» — no hay pregunta sobre pentasílabo,
    // hexasílabo ni decasílabo (solo salen como distractores); «sinalefa, hiato y corrección por
    // acento» — el hiato solo es distractor.
    test.fail();
    await abrir(page);
    const ld = await page.evaluate(() =>
      [...document.querySelectorAll('script[type="application/ld+json"]')].map((s) => s.textContent ?? '').join(' '),
    );
    const preguntaSobre = (re: RegExp): boolean => BANCO.some((p) => re.test(p.enunciado) || re.test(p.correcta));
    const fallos: string[] = [];
    const avanzadoMideUnVerso = BANCO.some((p) => p.nivel === 'avanzado' && /este verso|mide|cuenta las sílabas/i.test(p.enunciado));
    if (/cómputo silábico/.test(ld) && !avanzadoMideUnVerso) fallos.push('cómputo silábico en avanzado');
    if (/pentasílabo al alejandrino/.test(ld) && !preguntaSobre(/[Pp]entasílabo/)) fallos.push('pentasílabo');
    if (/hiato/.test(ld) && !preguntaSobre(/[Hh]iato/)) fallos.push('hiato');
    expect(fallos).toEqual([]);
  });
});

// ─────────────────────────────────────────────────────────────────────────────

/**
 * INSPECTOR 29/10/2026 — re-inspección tras la reparación de la familia (c5b619bb, d9e710f8) y de
 * la octava real (2c0b05f7). Tres casos nuevos, resueltos a mano ANTES de ejecutar la app, con
 * `calcularPuntuacion` (page.tsx:276-282) y `getResultadoTexto` (page.tsx:284-289).
 *
 * Sin <input>: la hidratación se espera a que React cuelgue sus props del botón (`__reactProps$`),
 * como `esperarHidratado` del testigo de la familia (tests/familias/quizzes.spec.ts).
 */
async function esperarHidratado(page: Page, texto: RegExp): Promise<void> {
  await page.waitForFunction(
    ({ fuente, banderas }) => {
      const patron = new RegExp(fuente, banderas);
      const boton = [...document.querySelectorAll('button')].find(
        (b) => (b as HTMLElement).offsetParent !== null && patron.test(b.textContent ?? ''),
      );
      return Boolean(boton && Object.keys(boton).some((k) => k.startsWith('__reactProps$')));
    },
    { fuente: texto.source, banderas: texto.flags },
    { timeout: 20_000 },
  );
}

const enunciadoConFoco = (page: Page): Promise<boolean> =>
  page.evaluate(() => Boolean(document.activeElement?.matches('[class*="preguntaCard"][tabindex="-1"]')));

test.describe('Inspector 29/10/2026 · caso normal y de rechazo (escritorio 1280 × 800)', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test('caso normal: Intermedio con 8, 5 bien y 3 mal → 53 pts, «Buen intento», 63 % de acierto', async ({ page }) => {
    // A mano: 5/8 = 0,625 → tramo ≥ 0,5: 40 + (0,625 − 0,5)/0,2 · 20 = 40 + 12,5 = 52,5 →
    // Math.round → 53 pts. Título (≥ 0,5 y < 0,7): «Buen intento». Acierto: 5/8 · 100 = 62,5 →
    // Math.round → 63 (el «%» pegado es el hallazgo 3676, abierto: se admite con o sin espacio duro).
    // Banco intermedio = 10 preguntas → con 8 salen 8 distintas, todas del nivel.
    test.setTimeout(90_000);
    await abrir(page);
    await esperarHidratado(page, /^Empezar Quiz/);
    await configurar(page, 'Intermedio', 8);
    await expect(botonEmpezar(page)).toHaveText(/Empezar Quiz — 8 preguntas · .*Intermedio/);
    await empezar(page);
    expect((await hud(page))[0]).toBe('1/8');
    const { fichas, focos } = await jugar(page, 5);
    expect(fichas).toHaveLength(8);
    expect(new Set(fichas.map((f) => f.enunciado)).size, 'pregunta repetida').toBe(8);
    expect(fichas.every((f) => f.nivel === 'intermedio'), 'Intermedio ha colado otro nivel').toBe(true);
    expect(focos).toEqual(Array(7).fill('DIV[-1].enunciado'));

    const r = await resultado(page);
    expect(r.puntos).toBe('53 pts');
    expect(r.titulo).toBe('Buen intento');
    expect(r.subtitulo).toBe('5 de 8 respuestas correctas');
    expect(r.stats.Correctas).toBe('5/8');
    expect(r.stats.Acierto).toMatch(new RegExp(`^63${DURO}?%$`));
  });

  test('caso de rechazo: sin contestar no hay «Siguiente», y Enter o Espacio sobre el enunciado no contestan', async ({ page }) => {
    // A mano: el botón «Siguiente pregunta» solo se monta con `seleccionada !== null` (page.tsx:507),
    // así que antes de contestar no existe; el enunciado (tabindex −1) no tiene manejador de teclado:
    // Enter y Espacio no deben contestar → HUD 1/8 · 0 correctas, 4 opciones habilitadas, sin veredicto.
    // Tab desde el enunciado lleva a la opción A, no a un «Siguiente». Luego, fallar la 1: «Incorrecto»,
    // 0 correctas, una opción verde y una roja, las cuatro deshabilitadas; «Siguiente» lleva a 2/8.
    await abrir(page);
    await esperarHidratado(page, /^Empezar Quiz/);
    await configurar(page, 'Avanzado', 8);
    await empezar(page);
    await expect.poll(() => enunciadoConFoco(page), { message: 'el foco no está en el enunciado' }).toBe(true);
    await expect(page.getByRole('button', { name: /Siguiente pregunta|Ver resultados/ })).toHaveCount(0);

    await page.keyboard.press('Enter');
    await page.keyboard.press('Space');
    await page.waitForTimeout(300);
    expect(await hud(page)).toEqual(['1/8', '0', expect.stringMatching(new RegExp(`^0${DURO}?%$`))]);
    await expect(page.locator('[class*="feedbackResultado"]')).toHaveCount(0);
    await expect(page.locator('button:has([class*="opcionLetra"]):enabled')).toHaveCount(4);

    await page.keyboard.press('Tab');
    expect(await page.evaluate(() => document.activeElement?.getAttribute('aria-label') ?? '')).toMatch(/^Opción A: /);

    const f = await responder(page, 'mal');
    await expect(page.locator('[class*="feedbackResultado"]')).toHaveText('Incorrecto');
    await expect(page.locator('[class*="feedbackRespuesta"]')).toHaveText(`Respuesta correcta: ${f.correcta}`);
    expect((await hud(page))[1]).toBe('0');
    const clases = await opciones(page).evaluateAll((bs) =>
      bs.map((b) => `${/opcionCorrecta/.test(b.className) ? 'C' : /opcionIncorrecta/.test(b.className) ? 'I' : 'N'}${(b as HTMLButtonElement).disabled ? 'd' : ''}`),
    );
    expect(clases.filter((c) => c === 'Cd')).toHaveLength(1);
    expect(clases.filter((c) => c === 'Id')).toHaveLength(1);
    expect(clases.every((c) => c.endsWith('d')), 'opción habilitada tras contestar').toBe(true);
    await avanzar(page);
    await expect.poll(async () => (await hud(page))[0]).toBe('2/8');
    expect((await hud(page))[1]).toBe('0');
  });
});

test.describe('Inspector 29/10/2026 · caso límite a 360 × 740', () => {
  test.use({
    viewport: { width: 360, height: 740 },
    userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Mobile Safari/537.36',
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  });

  test('caso límite: Básico con 10, 9 bien y la ÚLTIMA mal → 90 % justo en el umbral da 100 pts', async ({ page }) => {
    // A mano: 9/10 = 0,9 → tramo ≥ 0,9 (umbral exacto: 9/10 y el literal 0,9 son el mismo double)
    // → 100 pts y «¡Dominas la métrica!». «9 de 10 respuestas correctas», «9/10», Acierto 90.
    // La 10.ª es la última: HUD «10/10», veredicto «Incorrecto» con su clave, botón «Ver resultados».
    // Banco básico = 10 → con 10 sale el banco básico entero, sin repetir.
    test.setTimeout(90_000);
    await abrir(page);
    await esperarHidratado(page, /^Empezar Quiz/);
    await configurar(page, 'Básico', 10);
    await empezar(page);
    const fichas: Ficha[] = [];
    for (let n = 1; n <= 9; n++) {
      fichas.push(await responder(page, 'bien'));
      expect(await avanzar(page)).toMatch(/Siguiente pregunta/);
      await expect(page.locator('[class*="feedbackResultado"]')).toHaveCount(0);
    }
    expect((await hud(page)).slice(0, 2)).toEqual(['10/10', '9']);
    const ultima = await responder(page, 'mal');
    fichas.push(ultima);
    await expect(page.locator('[class*="feedbackResultado"]')).toHaveText('Incorrecto');
    await expect(page.locator('[class*="feedbackRespuesta"]')).toHaveText(`Respuesta correcta: ${ultima.correcta}`);
    expect((await hud(page))[1]).toBe('9');
    expect(await avanzar(page)).toBe('Ver resultados');

    const basico = BANCO.filter((p) => p.nivel === 'basico').map((p) => p.enunciado).sort();
    expect(fichas.map((f) => f.enunciado).sort()).toEqual(basico);
    const r = await resultado(page);
    expect(r.puntos).toBe('100 pts');
    expect(r.titulo).toBe('¡Dominas la métrica!');
    expect(r.subtitulo).toBe('9 de 10 respuestas correctas');
    expect(r.stats.Correctas).toBe('9/10');
    expect(r.stats.Acierto).toMatch(new RegExp(`^90${DURO}?%$`));
  });
});

// ─────────────────────────────────────────────────────────────────────────────

/**
 * INSPECTOR 29/10/2026 (tarde) — re-inspección tras /reparar
 *
 * Vuelve a la cola por 56bfa250 (hermanas de 3770, 3772 y 3773: «Siguiente» enfocado con
 * `enfocarSinCentrar`, el tiempo en «min» y «s» y el aria-label «Progreso del quiz» de la barra) y
 * por la guarda de ráfagas compartida (f0b18db0: frena también el mousedown del 2.º toque). Nada se
 * da por bueno porque el commit exista. Medido por la tarde con sondas fuera del repositorio:
 *   · 3772 (hermana): 59 000 ms → «59 s»; 60 000 → «1 min 0 s»; 3 725 000 → «62 min 5 s». Bien.
 *   · 3773 (hermana): nombre «Progreso del quiz»; aria-valuenow 0 en 1/8 y 7 en 8/8 (preguntas ya
 *     contestadas, el criterio de la familia), aria-valuemax 8. Bien.
 *   · 3770 (hermana): fallando con la opción más baja en Avanzado (8) e Intermedio (10), 0 de 18
 *     veredictos fuera de la vista a 360 × 640 y 0 de 18 a 360 × 740; «Siguiente» enfocado con el
 *     borde inferior a 8 px del de la ventana (632 de 640), nunca centrado. Bien.
 *   · Teclado a 1280 × 800: Enter en la opción → «Siguiente»; Enter → el enunciado nuevo; «Ver
 *     resultados» → el panel del resultado. Recuento y nota bien en tres partidas seguidas.
 *   · Cabos de la familia: C0515 limpio (lo de arriba) · C0518 limpio (flex-wrap: a 360 px los tres
 *     botones en dos filas dentro de la tarjeta, 16…344; a 320 px, en tres) · C0514, variante del
 *     doble toque sobre una OPCIÓN, reproducido · C0516 reproducido. Los dos, hallazgos nuevos abajo.
 */
async function relojFijo(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const real = Date.now.bind(Date);
    const w = window as unknown as { __fijo?: number };
    Date.now = () => (typeof w.__fijo === 'number' ? w.__fijo : real());
  });
}

const fijarReloj = (page: Page, t: number): Promise<void> =>
  page.evaluate((x) => {
    (window as unknown as { __fijo: number }).__fijo = x;
  }, t);

const barraProgreso = (page: Page) =>
  page.locator('[role="progressbar"]').evaluate((b) => ({
    now: b.getAttribute('aria-valuenow'),
    max: b.getAttribute('aria-valuemax'),
    ancho: (b as HTMLElement).style.width,
  }));

/** Geometría del veredicto y de «Siguiente» frente a la barra fija del logo y al borde inferior. */
async function vistaTrasContestar(page: Page) {
  return page.evaluate(() => {
    const caja = (e: Element | null) => {
      if (!e) return null;
      const r = e.getBoundingClientRect();
      return { arriba: Math.round(r.top), abajo: Math.round(r.bottom) };
    };
    const barra = document.querySelector('[class*="headerBar"]');
    const sig = document.querySelector('[class*="btnSiguiente"]');
    return {
      veredicto: caja(document.querySelector('[class*="feedbackCabecera"]')),
      siguiente: caja(sig),
      enfocado: document.activeElement === sig,
      barra: barra ? Math.round(barra.getBoundingClientRect().bottom) : 0,
      pildora: barra?.firstElementChild ? Math.round(barra.firstElementChild.getBoundingClientRect().bottom) : 0,
      alto: innerHeight,
      scroll: Math.round(scrollY),
    };
  });
}

/** Doble clic de ratón en el centro de `loc`: 1.er clic (detail 1) y, 90 ms después, el 2.º (detail 2). */
async function dobleClicEn(page: Page, loc: Locator): Promise<void> {
  const c = await loc.boundingBox();
  if (!c) throw new Error('sin caja');
  await page.mouse.move(c.x + c.width / 2, c.y + c.height / 2);
  await page.mouse.down({ clickCount: 1 });
  await page.mouse.up({ clickCount: 1 });
  await page.waitForTimeout(90);
  await page.mouse.down({ clickCount: 2 });
  await page.mouse.up({ clickCount: 2 });
  await page.waitForTimeout(400);
}

test.describe('Inspector 29/10/2026 (tarde) · escritorio 1280 × 800', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  /**
   * CASO NORMAL — tres partidas seguidas de Básico con 8 («Jugar de nuevo»), la 1.ª con teclado, y
   * el reloj fijo para que el tiempo sea EXACTO. A mano con calcularPuntuacion, getResultadoTexto y
   * formatTiempo (page.tsx:276-289 y 374-379; tiempoTotal = round(ms / 1000)):
   *  · P1, 5 bien y 3 mal, 59 000 ms: 5/8 = 0,625 → 40 + 0,125/0,2 · 20 = 52,5 → 53 pts, «Buen
   *    intento», «5/8»; 59 s → m = 0 → «59 s».
   *  · P2, 8 bien, 60 000 ms: 8/8 → 100 pts, «¡Dominas la métrica!», «8/8»; 60 s = 1·60 + 0 →
   *    «1 min 0 s». «Jugar de nuevo» vuelve a poner tiempoInicio (iniciarQuiz): si no lo hiciera,
   *    contaría desde P1, 10 060 s → «167 min 40 s».
   *  · P3, 0 bien, 3 725 000 ms: 0/8 → 0 pts, «Sigue repasando», «0/8»; 3725 s = 62·60 + 5 →
   *    «62 min 5 s» (sin horas: es correcto, solo largo).
   *  · Barra: nombre «Progreso del quiz»; aria-valuenow = preguntaActual → 0 en 1/8 (ancho 0 %) y
   *    7 en 8/8 (7/8 · 100 = 87,5 %), aria-valuemax 8. Cada partida arranca en 1/8 con 0 correctas.
   *  · Teclado en P1: desde el enunciado, Tab × (k + 1) lleva a la opción k; Enter contesta y el foco
   *    va a «Siguiente»; Enter en «Siguiente» → el enunciado nuevo (tabindex −1); la 8.ª, «Ver
   *    resultados» → el panel del resultado.
   */
  test('caso normal: tres partidas con «Jugar de nuevo» dan «59 s», «1 min 0 s» y «62 min 5 s», con la barra y el foco de teclado en su sitio', async ({ page }) => {
    test.setTimeout(120_000);
    await relojFijo(page);
    await abrir(page);
    await esperarHidratado(page, /^Empezar Quiz/);
    await configurar(page, 'Básico', 8);
    const T0 = 1_000_000_000_000;
    await fijarReloj(page, T0);
    await empezar(page);
    await expect(page.getByRole('progressbar')).toHaveAccessibleName('Progreso del quiz');
    expect(await barraProgreso(page)).toEqual({ now: '0', max: '8', ancho: '0%' });
    expect((await hud(page)).slice(0, 2)).toEqual(['1/8', '0']);
    await expect.poll(() => enunciadoConFoco(page)).toBe(true);

    for (let n = 1; n <= 8; n++) {
      const f = await fichaVisible(page);
      const ops = await textosOpcion(page);
      const iC = ops.indexOf(f.correcta);
      const k = n <= 5 ? iC : iC === 0 ? 1 : 0;
      for (let t = 0; t <= k; t++) await page.keyboard.press('Tab');
      expect(await page.evaluate(() => document.activeElement?.getAttribute('aria-label') ?? '')).toBe(`Opción ${'ABCD'[k]}: ${ops[k]}`);
      await page.keyboard.press('Enter');
      const sig = page.getByRole('button', { name: n < 8 ? /Siguiente pregunta/ : /Ver resultados/ });
      await expect(sig).toBeFocused();
      if (n === 8) {
        expect(await barraProgreso(page)).toEqual({ now: '7', max: '8', ancho: '87.5%' });
        expect((await hud(page)).slice(0, 2)).toEqual(['8/8', '5']);
        await fijarReloj(page, T0 + 59_000);
      }
      await page.keyboard.press('Enter');
      if (n < 8) await expect.poll(() => enunciadoConFoco(page)).toBe(true);
    }
    await expect(page.locator('[class*="resultadoPanel"]')).toBeFocused();
    let r = await resultado(page);
    expect([r.puntos, r.titulo, r.stats.Correctas, r.stats.Tiempo]).toEqual(['53 pts', 'Buen intento', '5/8', '59 s']);

    const PARTIDAS: [number, number, string[]][] = [
      [60_000, 8, ['100 pts', '¡Dominas la métrica!', '8/8', '1 min 0 s']],
      [3_725_000, 0, ['0 pts', 'Sigue repasando', '0/8', '62 min 5 s']],
    ];
    let Ti = T0;
    for (const [ms, bien, esperado] of PARTIDAS) {
      Ti += 10_000_000;
      await fijarReloj(page, Ti);
      await page.getByRole('button', { name: /Jugar de nuevo/ }).click();
      await expect(page.locator('[class*="preguntaCard"]')).toBeVisible();
      expect((await hud(page)).slice(0, 2)).toEqual(['1/8', '0']);
      expect(await barraProgreso(page)).toEqual({ now: '0', max: '8', ancho: '0%' });
      for (let n = 1; n <= 8; n++) {
        await responder(page, n <= bien ? 'bien' : 'mal');
        if (n === 8) await fijarReloj(page, Ti + ms);
        await page.waitForTimeout(150);
        await avanzar(page);
      }
      r = await resultado(page);
      expect([r.puntos, r.titulo, r.stats.Correctas, r.stats.Tiempo]).toEqual(esperado);
    }
    expect(r.marca).toBe('sin-recarga');
  });
});

test.describe('Inspector 29/10/2026 (tarde) · móvil 360 × 640', () => {
  test.use({
    viewport: { width: 360, height: 640 },
    userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Mobile Safari/537.36',
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  });

  /**
   * CASO LÍMITE — las explicaciones más largas en la pantalla más baja de la medida del 3770.
   * Avanzado con 8 (su banco entero: verso blanco, 253 caracteres de explicación y la clave más
   * larga; décima, 248; petrarquista, 243) e Intermedio con 10 (su banco entero), tocando como un
   * dedo y fallando siempre con la opción más baja (la D, o la C si la D es la buena), que es la que
   * más mueve la página al contestar. A mano:
   *  · tras cada respuesta, el veredicto («Incorrecto» + «Respuesta correcta: …», .feedbackCabecera)
   *    ENTERO entre la píldora del logo y el borde inferior (640), y «Siguiente» con el foco y entero
   *    bajo la barra; si la página se movió, su borde inferior a ≤ 40 px del de la ventana (`nearest`
   *    lo deja a 8 px, el scroll-padding inferior; centrado quedaría a ~300): 0 de 18 fuera;
   *  · tras tocar «Siguiente», el foco en el enunciado nuevo;
   *  · 0/8 y 0/10 → p·80 = 0 pts, «Sigue repasando», «0 de 8» y «0 de 10 respuestas correctas».
   *  · Cabo C0518: a 360 px la fila «Número de preguntas» se parte (flex-wrap) y sus tres botones
   *    quedan dentro de la tarjeta; el documento no pasa de 360 px de ancho.
   */
  test('caso límite: 18 respuestas táctiles fallando con la opción más baja, sin un veredicto tapado ni «Siguiente» centrado', async ({ page }) => {
    test.setTimeout(150_000);
    await abrir(page);
    await esperarHidratado(page, /^Empezar Quiz/);
    const fila = await page.evaluate(() => {
      const tarjeta = document.querySelector('[class*="configPanel"]')!.getBoundingClientRect();
      const fuera = [...document.querySelectorAll('[class*="preguntasRow"] button')].filter((b) => {
        const r = b.getBoundingClientRect();
        return r.left < tarjeta.left || r.right > tarjeta.right || r.right > innerWidth;
      }).length;
      return { botones: document.querySelectorAll('[class*="preguntasRow"] button').length, fuera, ancho: document.documentElement.scrollWidth };
    });
    expect(fila).toEqual({ botones: 3, fuera: 0, ancho: 360 });

    const fuera: string[] = [];
    for (const [nivel, num] of [['Avanzado', 8], ['Intermedio', 10]] as const) {
      if (nivel === 'Intermedio') {
        await page.getByRole('button', { name: /Cambiar nivel/ }).tap();
        await expect(page.locator('[class*="configPanel"]')).toBeVisible();
        await page.waitForTimeout(300);
      }
      await configurar(page, nivel, num);
      await page.waitForTimeout(300);
      await botonEmpezar(page).tap();
      await expect(page.locator('[class*="preguntaCard"]')).toBeVisible();
      for (let n = 1; n <= num; n++) {
        await page.waitForTimeout(400); // lee la pregunta: el toque no entra en la ráfaga anterior
        const f = await fichaVisible(page);
        expect(f.nivel).toBe(nivel === 'Avanzado' ? 'avanzado' : 'intermedio');
        const iC = (await textosOpcion(page)).indexOf(f.correcta);
        const op = opciones(page).nth(iC === 3 ? 2 : 3);
        await op.evaluate((e) => e.scrollIntoView({ block: 'nearest' }));
        await page.waitForTimeout(200);
        const antes = await page.evaluate(() => Math.round(scrollY));
        const c = await op.boundingBox();
        if (!c) throw new Error('opción sin caja');
        await page.touchscreen.tap(c.x + c.width / 2, c.y + c.height / 2);
        const sig = page.getByRole('button', { name: n < num ? /Siguiente pregunta/ : /Ver resultados/ });
        await expect(sig).toBeFocused();
        await page.waitForTimeout(350); // pasada la segunda mirada de enfocarSinCentrar (120 ms)
        const v = await vistaTrasContestar(page);
        const donde = `${nivel} ${n}/${num} «${f.enunciado.slice(0, 30)}»`;
        if (!v.veredicto || v.veredicto.arriba < v.pildora || v.veredicto.abajo > v.alto) {
          fuera.push(`${donde}: veredicto ${JSON.stringify(v.veredicto)}, píldora hasta ${v.pildora}`);
        }
        if (!v.enfocado || !v.siguiente || v.siguiente.arriba < v.barra || v.siguiente.abajo > v.alto) {
          fuera.push(`${donde}: «Siguiente» ${JSON.stringify(v.siguiente)} enfocado=${v.enfocado}`);
        } else if (v.scroll !== antes && v.alto - v.siguiente.abajo > 40) {
          fuera.push(`${donde}: la página saltó ${v.scroll - antes} px y «Siguiente» quedó en ${v.siguiente.arriba}…${v.siguiente.abajo}`);
        }
        await page.waitForTimeout(300); // lee la explicación
        await sig.tap();
        if (n < num) await expect.poll(() => enunciadoConFoco(page), { message: `${donde}: foco tras «Siguiente»` }).toBe(true);
      }
      const r = await resultado(page);
      expect([r.puntos, r.titulo, r.subtitulo]).toEqual(['0 pts', 'Sigue repasando', `0 de ${num} respuestas correctas`]);
    }
    expect(fuera).toEqual([]);
  });
});

test.describe('Inspector 29/10/2026 (tarde) · doble clic sobre una opción (1366 × 1024)', () => {
  test.use({ viewport: { width: 1366, height: 1024 } });

  /**
   * CASO DE RECHAZO — doble clic de ratón sobre la opción BUENA en las tres primeras de Básico. A
   * esta altura «Siguiente» ya se ve al contestar y la página no se mueve: el 2.º clic cae en el
   * mismo punto, sobre la opción que el 1.º acaba de deshabilitar. A mano: `responder` sale si
   * `seleccionada !== null` y las cuatro quedan disabled → «Correctas» sube de 1 en 1 (1, 2, 3), una
   * sola opción en verde y ninguna en rojo, y el 2.º clic no contesta la siguiente: se sigue en n/10
   * con el veredicto «¡Correcto!» montado.
   */
  test('caso de rechazo: el doble clic en una opción cuenta un acierto, no dos, y no marca ni contesta otra', async ({ page }) => {
    await abrir(page);
    await esperarHidratado(page, /^Empezar Quiz/);
    await configurar(page, 'Básico', 10);
    await empezar(page);
    for (let n = 1; n <= 3; n++) {
      await page.waitForTimeout(400);
      const f = await fichaVisible(page);
      const iC = (await textosOpcion(page)).indexOf(f.correcta);
      await dobleClicEn(page, opciones(page).nth(iC));
      await expect(page.locator('[class*="feedbackResultado"]')).toHaveText('¡Correcto!');
      expect((await hud(page)).slice(0, 2)).toEqual([`${n}/10`, String(n)]);
      const clases = await opciones(page).evaluateAll((bs) => bs.map((b) => b.className));
      expect(clases.filter((c) => /opcionCorrecta/.test(c))).toHaveLength(1);
      expect(clases.filter((c) => /opcionIncorrecta/.test(c))).toHaveLength(0);
      await avanzar(page);
      await expect.poll(async () => (await hud(page))[0]).toBe(`${n + 1}/10`);
    }
  });

  /**
   * HALLAZGO NUEVO (accesibilidad, forma del cabo C0514) — tras un doble clic o un doble toque sobre
   * una opción, el foco cae a <body>. Debería quedarse en «Siguiente», adonde lo lleva la app al
   * contestar (efecto de foco, page.tsx:355-363, `enfocarSinCentrar`). El 2.º clic cae en el mismo
   * punto sobre la opción ya deshabilitada: Chrome no entrega mousedown ni click a un botón
   * deshabilitado, así que el `frenarFoco` de lib/useGuardaRafaga.ts (f0b18db0) no llega a verlo y
   * el navegador suelta el foco. Después Enter no hace nada (sigue en 1/10) y hace falta un Tab para
   * volver a «Siguiente». No cuenta de más ni contesta nada (caso de rechazo, arriba). Medido el
   * 29/10/2026 sobre la buena de Básico: con ratón, 10 de 10 a 1366 × 1024 y 9 de 10 a 1280 × 800;
   * por toque, 8 de 10 a 360 × 740 y 9 de 10 a 412 × 915. Es lo mismo que el 3802 de
   * quiz-tabla-periodica: la guarda es compartida.
   */
  test('hallazgo · tras un doble clic en una opción, el foco se queda en «Siguiente», no cae a <body>', async ({ page }) => {
    test.fail();
    await abrir(page);
    await esperarHidratado(page, /^Empezar Quiz/);
    await configurar(page, 'Básico', 10);
    await empezar(page);
    const enBody: string[] = [];
    for (let n = 1; n <= 3; n++) {
      await page.waitForTimeout(400);
      const f = await fichaVisible(page);
      const iC = (await textosOpcion(page)).indexOf(f.correcta);
      await dobleClicEn(page, opciones(page).nth(iC));
      await expect(page.locator('[class*="feedbackResultado"]')).toHaveText('¡Correcto!');
      const fueraDeSiguiente = await page.evaluate(() => !document.activeElement?.matches('[class*="btnSiguiente"]'));
      if (fueraDeSiguiente) enBody.push(`${n}/10: foco en ${await page.evaluate(() => (document.activeElement === document.body ? '<body>' : document.activeElement?.tagName ?? 'nada'))}`);
      await avanzar(page);
      await page.waitForTimeout(300);
    }
    expect(enBody).toEqual([]); // medido: 1/10, 2/10 y 3/10 con el foco en <body>
  });

  /**
   * HALLAZGO NUEVO (accesibilidad, forma del cabo C0516) — tras contestar, la opción buena y la
   * fallada solo se distinguen por el color: borde y fondo verdes (#22c55e) o rojos (#ef4444); las
   * dos con opacidad 1 y las otras dos a 0,5. Su texto visible y su nombre accesible («Opción A: 8»)
   * no cambian, y no hay ✓/✗ ni pseudoelemento (WCAG 1.4.1). El panel del veredicto sí lo dice con
   * texto («Incorrecto» · «Respuesta correcta: 10»), pero la lista de opciones no. La referencia,
   * quiz-literatura-universal, lo resolvió con ✓/✗ visibles (aria-hidden) y «(respuesta correcta)» /
   * «(tu respuesta, incorrecta)» en el aria-label; igual quiz-tabla-periodica (3776).
   * A mano: Intermedio con 8, fallar la 1.ª con la opción A (o la B si la A es la buena) → esperado
   * que el texto o el nombre accesible de la buena y de la fallada cambien al contestar.
   */
  test('hallazgo · la opción correcta y la fallada no se distinguen solo por el color', async ({ page }) => {
    test.fail();
    await abrir(page);
    await esperarHidratado(page, /^Empezar Quiz/);
    await configurar(page, 'Intermedio', 8);
    await empezar(page);
    const f = await fichaVisible(page);
    const iC = (await textosOpcion(page)).indexOf(f.correcta);
    const iMal = iC === 0 ? 1 : 0;
    const marcas = () =>
      opciones(page).evaluateAll((bs) => bs.map((b) => `${(b as HTMLElement).innerText} | ${b.getAttribute('aria-label') ?? ''}`.replace(/\s+/g, ' ').trim()));
    const antes = await marcas();
    await opciones(page).nth(iMal).click();
    await expect(page.locator('[class*="feedbackResultado"]')).toHaveText('Incorrecto');
    // Sano: el color sí cambia (el defecto es que sea lo ÚNICO que cambia)
    const clases = await opciones(page).evaluateAll((bs) => bs.map((b) => b.className));
    expect(/opcionCorrecta/.test(clases[iC]) && /opcionIncorrecta/.test(clases[iMal])).toBe(true);
    const despues = await marcas();
    const iguales = [iC, iMal].filter((i) => despues[i] === antes[i]).map((i) => despues[i]);
    expect(iguales, 'texto y nombre accesible idénticos a antes de contestar').toEqual([]); // medido: los dos iguales
  });
});

test.describe('Inspector 29/10/2026 (tarde) · FAQPage', () => {
  /**
   * HALLAZGO NUEVO (contenido) — el FAQPage (metadata.ts:84-89; solo lo leen buscadores y asistentes
   * de IA) responde a «¿Para qué nivel educativo está pensado este quiz de métrica?» que «el nivel
   * básico trabaja los versos más comunes (octosílabo, endecasílabo) y la sinalefa; el intermedio
   * introduce estrofas clásicas y esquemas de rima». El banco ya las pone en Básico: tres preguntas
   * de la categoría estrofa («¿Cuántos versos tiene el soneto?», «¿Qué estrofa de 4 octosílabos tiene
   * esquema de rima abba?» —estrofa Y esquema de rima— y «¿Qué tipo de verso usa el romance?») y una
   * de rima («¿Qué tipo de rima coincide solo en las vocales…?»). Contado en page.tsx el 29/10/2026.
   * Es la misma forma que el 3771 de quiz-literatura-universal; la otra mitad de esa respuesta (el
   * avanzado y el «cómputo silábico») es el 3670, abierto.
   */
  test('hallazgo · el FAQPage no dice que el intermedio «introduce» las estrofas y los esquemas de rima que Básico ya pregunta', async ({ page }) => {
    test.fail();
    await page.goto(RUTA);
    const bloques = await page.evaluate(() =>
      [...document.querySelectorAll('script[type="application/ld+json"]')].map((s) => s.textContent ?? ''),
    );
    type Bloque = { '@type'?: string; mainEntity?: { name: string; acceptedAnswer?: { text?: string } }[] };
    const faq = bloques.map((b) => JSON.parse(b) as Bloque).find((j) => j['@type'] === 'FAQPage');
    const respuesta = faq?.mainEntity?.find((q) => /nivel educativo/.test(q.name))?.acceptedAnswer?.text ?? '';
    const cuenta = (nivel: string, categoria: string): number => BANCO.filter((p) => p.nivel === nivel && p.categoria === categoria).length;
    expect([cuenta('basico', 'estrofa'), cuenta('basico', 'rima')]).toEqual([3, 1]); // sano: el banco que se ha contado
    const choques: string[] = [];
    if (/intermedio introduce estrofas clásicas/.test(respuesta) && cuenta('basico', 'estrofa') > 0) {
      choques.push(`«el intermedio introduce estrofas clásicas», y Básico ya tiene ${cuenta('basico', 'estrofa')}`);
    }
    if (/introduce[^.;]*esquemas de rima/.test(respuesta) && BANCO.some((p) => p.nivel === 'basico' && /esquema de rima/.test(p.enunciado))) {
      choques.push('«introduce … esquemas de rima», y Básico ya pregunta el esquema abba de la redondilla');
    }
    expect(choques).toEqual([]); // medido: los dos
  });
});
