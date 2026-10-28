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
