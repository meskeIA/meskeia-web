import { test, expect, type Page, type Locator } from '@playwright/test';
import { figurasRetorica, type FiguraRetorica } from '../../data/figuras-retoricas';
import { metadata, jsonLd, faqJsonLd } from '../../app/quiz-figuras-retoricas/metadata';
import { esperarPaginaAsentada } from './_hidratacion';

/**
 * Quiz Figuras Retóricas — test de regresión del Inspector (1.ª pasada, 28/10/2026).
 * Familia «Quizzes de opción múltiple (quiz-*)», testigo tests/familias/quizzes.spec.ts.
 *
 * QUÉ PROMETE LA APP
 * ──────────────────
 * · <h1> «Quiz Figuras Retóricas ✍️» · «Identifica metáforas, hipérboles, anáforas y mucho más ·
 *   ESO, Bachillerato y Selectividad».
 * · Cuatro niveles (Básico «10 figuras», Intermedio «10», Avanzado «6», Todas «27 figuras
 *   completas») y 10, 15 o 20 preguntas. Cada pregunta es un ejemplo de `data/figuras-retoricas.ts`
 *   y cuatro nombres de figura del MISMO nivel (`generarOpciones`); tras responder, definición,
 *   distinción y otro ejemplo de la figura.
 *
 * DE DÓNDE SALEN LOS VALORES ESPERADOS
 * ────────────────────────────────────
 * · Banco: `data/figuras-retoricas.ts` — 26 figuras: 10 básico, 10 intermedio y 6 avanzado
 *   (contadas a mano el 28/10/2026). La clave de cada pregunta se lee del banco por el texto del
 *   ejemplo: las partidas miden la MECÁNICA; el contenido del banco se mide aparte, al final.
 * · Nota: `calcularPuntuacion` (page.tsx:73-79): ≥ 0,9 → 100 pts; ≥ 0,7 → 60 + (p − 0,7)/0,2·40;
 *   ≥ 0,5 → 40 + (p − 0,5)/0,2·20; resto p·80. Mensaje (page.tsx:81-86): ≥ 0,9 «¡Dominas la
 *   retórica!» · ≥ 0,7 «¡Muy buena puntuación!» · ≥ 0,5 «Buen intento» · resto «Sigue practicando».
 * · Doble toque: `useGuardaRafaga` (lib/useGuardaRafaga.ts, captura sobre window). El 2.º toque va
 *   con detail 2 en el mismo punto y con la pantalla nueva ya pintada; se comprueba que el detail
 *   fue 2 de verdad, para que el caso no pase en vacío.
 *
 * Tras «Empezar» o «Siguiente», contestar en menos de 500 ms cerca del botón es el 2.º toque de la
 * ráfaga y la guarda lo ignora (es su diseño): por eso las partidas «leen» 550 ms antes de contestar.
 */

const RUTA = '/quiz-figuras-retoricas/';
const DURO = String.fromCharCode(0xa0);
const norm = (s: string | null | undefined): string => (s ?? '').replace(/[ \t\n\r]+/g, ' ').trim();
const POR_EJEMPLO = new Map<string, FiguraRetorica>();
for (const f of figurasRetorica) for (const e of f.ejemplos) POR_EJEMPLO.set(e, f);
const figura = (id: string): FiguraRetorica => {
  const f = figurasRetorica.find((x) => x.id === id);
  if (!f) throw new Error(`no hay figura ${id} en el banco`);
  return f;
};

type Nivel = 'Básico' | 'Intermedio' | 'Avanzado' | 'Todas';

async function abrir(page: Page): Promise<void> {
  await page.addInitScript(() => {
    try {
      localStorage.setItem('meskeia_transparency_banner_dismissed', 'true');
    } catch {
      /* sin almacenamiento: saldrá el aviso */
    }
    // Registra el detail de cada clic ANTES que la guarda (se registra antes, en el mismo nodo y fase)
    const w = window as unknown as { __detalles: number[] };
    w.__detalles = [];
    window.addEventListener('click', (e) => w.__detalles.push(e.detail), true);
  });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(RUTA);
  await expect(page.locator('h1')).toContainText('Quiz Figuras Retóricas');
  await esperarPaginaAsentada(page);
}

async function elegir(page: Page, nivel: Nivel, num: 10 | 15 | 20): Promise<void> {
  const bn = page.locator('[class*="nivelGrid"] button', { hasText: nivel });
  await bn.click();
  await expect(bn).toHaveAttribute('aria-pressed', 'true');
  const bp = page.getByRole('button', { name: `${num} preguntas`, exact: true });
  await bp.click();
  await expect(bp).toHaveAttribute('aria-pressed', 'true');
}

async function arrancar(page: Page, nivel: Nivel, num: 10 | 15 | 20): Promise<void> {
  await elegir(page, nivel, num);
  await page.locator('[class*="btnIniciar"]').click();
  await expect(page.locator('[class*="preguntaCard"]')).toBeVisible();
}

const opciones = (page: Page): Locator => page.locator('[class*="opcionesGrid"] button');
const contador = (page: Page): Locator => page.locator('[class*="preguntaNumero"]');
const feedback = (page: Page): Locator => page.locator('[class*="feedbackPanel"]');
const hudValor = (page: Page, i: number): Locator => page.locator('[class*="hudItem"]').nth(i).locator('[class*="hudValor"]');

async function figuraVisible(page: Page): Promise<FiguraRetorica> {
  const texto = norm(await page.locator('[class*="ejemploTexto"]').innerText()).replace(/^"|"$/g, '');
  const f = POR_EJEMPLO.get(texto);
  expect(f, `ejemplo que no está en el banco: «${texto}»`).toBeTruthy();
  return f as FiguraRetorica;
}

async function nombresOpcion(page: Page): Promise<string[]> {
  return opciones(page).evaluateAll((bs) => bs.map((b) => (b.getAttribute('aria-label') ?? '').replace(/^Opción [A-D]: /, '')));
}

/** Responde la pregunta visible tras «leerla» 550 ms. Devuelve la figura que se preguntaba. */
async function responder(page: Page, modo: 'bien' | 'mal'): Promise<FiguraRetorica> {
  await page.waitForTimeout(550);
  const f = await figuraVisible(page);
  const ops = await nombresOpcion(page);
  expect(ops, 'toda pregunta ofrece 4 opciones').toHaveLength(4);
  const iC = ops.indexOf(f.nombre);
  expect(iC, `la correcta «${f.nombre}» no está entre las ofrecidas`).toBeGreaterThanOrEqual(0);
  await opciones(page).nth(modo === 'bien' ? iC : iC === 0 ? 1 : 0).click();
  await expect(feedback(page)).toBeVisible();
  return f;
}

async function avanzar(page: Page): Promise<string> {
  const b = page.locator('[class*="btnSiguiente"]');
  const rotulo = norm(await b.innerText());
  await b.click();
  return rotulo;
}

/** Juega hasta el resultado: las `aciertos` primeras bien y el resto mal. */
async function jugar(page: Page, aciertos: number): Promise<FiguraRetorica[]> {
  const vistas: FiguraRetorica[] = [];
  for (let n = 1; n <= 25; n++) {
    vistas.push(await responder(page, n <= aciertos ? 'bien' : 'mal'));
    if (/Ver resultados/.test(await avanzar(page))) break;
  }
  return vistas;
}

async function resultado(page: Page) {
  await expect(page.locator('[class*="resultadoPanel"]')).toBeVisible();
  return page.evaluate(() => {
    // Solo blancos ASCII: `\s` se comería el espacio duro del porcentaje
    const t = (s: string): string => (document.querySelector(s)?.textContent ?? '').replace(/[ \t\n\r]+/g, ' ').trim();
    const stats: Record<string, string> = {};
    for (const c of document.querySelectorAll('[class*="statsResultado"] > div')) {
      const etiqueta = (c.querySelector('p')?.textContent ?? '').trim();
      stats[etiqueta] = (c.querySelector('span')?.textContent ?? '').replace(/[ \t\n\r]+/g, ' ').trim();
    }
    return { titulo: t('[class*="resultadoTitulo"]'), puntos: t('[class*="resultadoPuntos"]'), sub: t('[class*="resultadoSubtitulo"]'), stats };
  });
}

const porcentaje = (p: number): RegExp => new RegExp(`^${p}${DURO}?%$`);

// ─────────────────────────────────────────────────────────────────────────────

test.describe('Quiz Figuras Retóricas · partida', () => {
  /**
   * CASO NORMAL — Básico, 10 preguntas, 7 bien y 3 mal.
   * A mano: el nivel básico tiene 10 figuras → 10 preguntas, una por figura, sin repetir.
   * 7/10 = 0,7 → 60 + (0,7 − 0,7)/0,2·40 = 60 pts · «¡Muy buena puntuación!» · 7/10 · 70 %.
   */
  test('caso normal: 7 de 10 en Básico dan 60 pts, 70 % y «¡Muy buena puntuación!»', async ({ page }) => {
    test.setTimeout(90_000);
    await abrir(page);
    await arrancar(page, 'Básico', 10);
    await expect(contador(page)).toHaveText('Pregunta 1 de 10');
    const vistas = await jugar(page, 7);
    expect(vistas).toHaveLength(10);
    const basicas = figurasRetorica.filter((f) => f.nivel === 'basico').map((f) => f.nombre).sort();
    expect(vistas.map((f) => f.nombre).sort(), 'cada figura básica sale una vez').toEqual(basicas);
    const r = await resultado(page);
    expect(r.titulo).toBe('¡Muy buena puntuación!');
    expect(r.puntos).toBe('60 pts');
    expect(r.sub).toBe('7 de 10 respuestas correctas');
    expect(r.stats.Correctas).toBe('7/10');
    // El % se admite pegado o con espacio duro: el formato se vigila en su propio hallazgo
    expect(r.stats.Acierto).toMatch(porcentaje(70));
  });

  /**
   * CASO LÍMITE — pleno y cero, con «Jugar de nuevo» sin recargar.
   * A mano: 10/10 → 1,0 ≥ 0,9 → 100 pts · «¡Dominas la retórica!» · 100 %. «Jugar de nuevo» llama a
   * iniciarQuiz: pregunta 1 de 10 y marcador a 0 en la misma página. 0/10 → 0·80 = 0 pts ·
   * «Sigue practicando» · 0 %.
   */
  test('caso límite: 10 de 10 dan 100 pts y, tras «Jugar de nuevo» sin recargar, 0 de 10 dan 0 pts', async ({ page }) => {
    test.setTimeout(120_000);
    await abrir(page);
    await page.evaluate(() => { (window as unknown as { __marca: string }).__marca = 'sin-recarga'; });
    await arrancar(page, 'Básico', 10);
    await jugar(page, 99);
    let r = await resultado(page);
    expect(r.titulo).toBe('¡Dominas la retórica!');
    expect(r.puntos).toBe('100 pts');
    expect(r.sub).toBe('10 de 10 respuestas correctas');
    expect(r.stats.Acierto).toMatch(porcentaje(100));

    await page.locator('[class*="btnRejugar"]').click();
    await expect(contador(page)).toHaveText('Pregunta 1 de 10');
    await expect(hudValor(page, 1)).toHaveText('0');
    expect(await page.evaluate(() => (window as unknown as { __marca?: string }).__marca)).toBe('sin-recarga');
    await jugar(page, 0);
    r = await resultado(page);
    expect(r.titulo).toBe('Sigue practicando');
    expect(r.puntos).toBe('0 pts');
    expect(r.sub).toBe('0 de 10 respuestas correctas');
    expect(r.stats.Acierto).toMatch(porcentaje(0));
  });

  /**
   * LO QUE SE IGNORA — doble clic en la correcta y clic tardío en otra opción.
   * A mano: `responder` sale si ya hay selección y las opciones quedan disabled → 1 acierto, una sola
   * opción en verde y ninguna en rojo; el marcador dice 1.
   */
  test('caso de rechazo: la segunda respuesta a la misma pregunta no cuenta', async ({ page }) => {
    await abrir(page);
    await arrancar(page, 'Intermedio', 10);
    await page.waitForTimeout(550);
    const f = await figuraVisible(page);
    const ops = await nombresOpcion(page);
    const iC = ops.indexOf(f.nombre);
    await opciones(page).nth(iC).dblclick();
    await opciones(page).nth(iC === 0 ? 1 : 0).click({ force: true });
    await expect(page.locator('[class*="feedbackResultado"]')).toHaveText('¡Correcto!');
    const clases = await opciones(page).evaluateAll((bs) => bs.map((b) => b.className));
    expect(clases.filter((c) => /opcionCorrecta/.test(c))).toHaveLength(1);
    expect(clases.filter((c) => /opcionIncorrecta/.test(c)), 'el clic tardío ha marcado otra opción').toHaveLength(0);
    await expect(hudValor(page, 1)).toHaveText('1');
    for (let i = 0; i < 4; i++) await expect(opciones(page).nth(i)).toBeDisabled();
  });
});

// ─────────────────────────────────────────────────────────────────────────────

/**
 * DOBLE TOQUE — invariante de la familia en los anchos donde el testigo (solo 390 × 844) es ciego,
 * y en las cinco salidas: «Empezar», «Siguiente», «Ver resultados», «Jugar de nuevo» y «Cambiar
 * nivel». Medido el 28/10/2026 (6 anchos, 3 niveles, ratón con detail 2 y toques reales): 0 de
 * ~400; el 2.º toque cae sobre una opción a 360-412 px, sobre las relacionadas a 768 px y sobre
 * «Empezar Quiz» tras «Cambiar nivel» a 390-412 px, y la guarda global lo come siempre.
 */
async function dobleToque(page: Page, boton: Locator, tactil: boolean, pantallaNueva: () => Promise<void>): Promise<void> {
  await boton.scrollIntoViewIfNeeded();
  const caja = await boton.boundingBox();
  if (!caja) throw new Error('el botón no tiene caja');
  const [x, y] = [caja.x + caja.width / 2, caja.y + caja.height / 2];
  const url = page.url();
  const edu = await page.locator('[class*="toggleButton"]').getAttribute('aria-expanded');
  if (tactil) await page.touchscreen.tap(x, y);
  else await page.mouse.click(x, y);
  await pantallaNueva();
  if (tactil) await page.touchscreen.tap(x, y);
  else {
    await page.mouse.down({ clickCount: 2 });
    await page.mouse.up({ clickCount: 2 });
  }
  await page.waitForTimeout(450);
  const detalles = await page.evaluate(() => (window as unknown as { __detalles: number[] }).__detalles);
  expect(detalles[detalles.length - 1], 'el 2.º toque no llegó como ráfaga (detail 2): el caso pasaría en vacío').toBe(2);
  expect(page.url(), 'el 2.º toque ha sacado de la app').toBe(url);
  await expect(page.locator('[class*="toggleButton"]'), 'el 2.º toque ha abierto la guía').toHaveAttribute('aria-expanded', edu ?? 'false');
}

async function partidaConDobles(page: Page, tactil: boolean): Promise<void> {
  await abrir(page);
  await elegir(page, 'Básico', 10);
  await dobleToque(page, page.locator('[class*="btnIniciar"]'), tactil, () => expect(contador(page)).toHaveText('Pregunta 1 de 10'));
  await expect(feedback(page), '«Empezar»: el 2.º toque ha contestado la pregunta 1').toHaveCount(0);
  for (let n = 1; n <= 10; n++) {
    await responder(page, 'bien');
    const sig = page.locator('[class*="btnSiguiente"]');
    if (n < 10) {
      await dobleToque(page, sig, tactil, () => expect(contador(page)).toHaveText(`Pregunta ${n + 1} de 10`));
      await expect(contador(page), '«Siguiente»: el 2.º toque ha saltado otra pregunta').toHaveText(`Pregunta ${n + 1} de 10`);
      await expect(feedback(page), `«Siguiente»: el 2.º toque ha contestado la pregunta ${n + 1}`).toHaveCount(0);
    } else {
      await dobleToque(page, sig, tactil, () => expect(page.locator('[class*="resultadoPanel"]')).toBeVisible());
    }
  }
  // «Ver resultados»: la nota sigue en pantalla (10/10 → 100 pts), nadie la ha retirado
  let r = await resultado(page);
  expect(r.sub).toBe('10 de 10 respuestas correctas');
  expect(r.puntos).toBe('100 pts');

  await dobleToque(page, page.locator('[class*="btnRejugar"]'), tactil, () => expect(contador(page)).toHaveText('Pregunta 1 de 10'));
  await expect(feedback(page), '«Jugar de nuevo»: el 2.º toque ha contestado la pregunta 1').toHaveCount(0);
  await jugar(page, 0);
  r = await resultado(page);
  expect(r.sub).toBe('0 de 10 respuestas correctas');

  await dobleToque(page, page.locator('[class*="btnConfig"]'), tactil, () => expect(page.locator('[class*="configPanel"]')).toBeVisible());
  await expect(page.locator('[class*="preguntaCard"]'), '«Cambiar nivel»: el 2.º toque ha empezado otra partida').toHaveCount(0);
  await expect(page.locator('[class*="nivelGrid"] button', { hasText: 'Básico' })).toHaveAttribute('aria-pressed', 'true');
}

const UA_MOVIL = 'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Mobile Safari/537.36';

test.describe('Doble toque · móvil 412 × 915', () => {
  test.use({ viewport: { width: 412, height: 915 }, userAgent: UA_MOVIL, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
  test('el 2.º toque no contesta, no salta, no saca de la app ni se come la nota', async ({ page }) => {
    test.setTimeout(150_000);
    await partidaConDobles(page, true);
  });
});

test.describe('Doble toque · tableta 768 × 1024', () => {
  test.use({ viewport: { width: 768, height: 1024 }, userAgent: UA_MOVIL, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  test('el 2.º toque no contesta, no salta, no saca de la app ni se come la nota', async ({ page }) => {
    test.setTimeout(150_000);
    await partidaConDobles(page, true);
  });
});

test.describe('Doble clic · escritorio 1280 × 800', () => {
  test.use({ viewport: { width: 1280, height: 800 } });
  test('el 2.º clic no contesta, no salta, no saca de la app ni se come la nota', async ({ page }) => {
    test.setTimeout(150_000);
    await partidaConDobles(page, false);
  });
});

test.describe('Foco (invariante de la familia)', () => {
  test('sano · tras «Empezar» y «Siguiente» el foco va al enunciado (tabindex -1), no a <body>', async ({ page }) => {
    await abrir(page);
    await elegir(page, 'Básico', 10);
    await page.locator('[class*="btnIniciar"]').focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('[class*="preguntaCard"]')).toBeFocused();
    await expect(page.locator('[class*="preguntaCard"]')).toHaveAttribute('tabindex', '-1');
    await responder(page, 'bien');
    await expect(page.locator('[class*="btnSiguiente"]')).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(contador(page)).toHaveText('Pregunta 2 de 10');
    await expect(page.locator('[class*="preguntaCard"]')).toBeFocused();
    // Las opciones son acciones: sin aria-pressed
    expect(await opciones(page).evaluateAll((bs) => bs.filter((b) => b.hasAttribute('aria-pressed')).length)).toBe(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────

test.describe('Inspector 28/10/2026 · hallazgos de la partida', () => {
  test('hallazgo · «Precisión» no pasa del 100 %: dos aciertos de dos son 100 %, no 200 %', async ({ page }) => {
    test.fail(); // ABIERTO — page.tsx:257 divide `correctas` (ya con la respuesta actual) entre
    // `preguntaActual` (las ANTERIORES): tras acertar la 2.ª, 2/1 = 200 %; tras acertar la 1.ª, 0 %.
    // Medido 28/10/2026: 0 %, 200 %, 150 %, 133 %, 125 %… en una partida de 7 aciertos seguidos.
    await abrir(page);
    await arrancar(page, 'Básico', 10);
    await responder(page, 'bien');
    await avanzar(page);
    await responder(page, 'bien');
    await expect(hudValor(page, 1)).toHaveText('2');
    await expect(hudValor(page, 2)).toHaveText(porcentaje(100), { timeout: 2000 });
  });

  test('hallazgo · el número de preguntas que anuncia «Empezar Quiz» es el que se juega', async ({ page }) => {
    test.fail(); // ABIERTO — generarPreguntas (page.tsx:54) corta a Math.min(num, figuras del nivel)
    // sin decirlo: «Empezar Quiz — 20 preguntas · Básico» juega 10; «10 preguntas · Avanzado», 6.
    await abrir(page);
    const fallos: string[] = [];
    for (const [nivel, num] of [['Básico', 20], ['Avanzado', 10]] as const) {
      await elegir(page, nivel, num);
      const promete = Number((norm(await page.locator('[class*="btnIniciar"]').innerText()).match(/(\d+) preguntas/) ?? [])[1]);
      await page.locator('[class*="btnIniciar"]').click();
      const juega = Number((norm(await contador(page).innerText()).match(/de (\d+)$/) ?? [])[1]);
      if (promete !== juega) fallos.push(`${nivel}: promete ${promete}, juega ${juega}`);
      await page.goto(RUTA);
      await esperarPaginaAsentada(page);
    }
    expect(fallos).toEqual([]);
  });

  test('hallazgo · el porcentaje va separado con espacio duro («70 %»)', async ({ page }) => {
    test.fail(); // ABIERTO — page.tsx:257 (HUD «Precisión») y :371 (resultado «Acierto») pegan el «%».
    test.setTimeout(90_000);
    await abrir(page);
    await arrancar(page, 'Básico', 10);
    await jugar(page, 7);
    const r = await resultado(page);
    expect(r.stats.Acierto).toBe(`70${DURO}%`);
  });

  test('hallazgo · tras «Cambiar nivel» el foco no cae a <body>', async ({ page }) => {
    test.fail(); // ABIERTO — el efecto de foco (page.tsx:162-170) no tiene rama para la pantalla
    // 'config': «Cambiar nivel» se desmonta y el foco cae a <body> (medido con Enter, 28/10/2026).
    test.setTimeout(90_000);
    await abrir(page);
    await arrancar(page, 'Avanzado', 10);
    await jugar(page, 0);
    await page.locator('[class*="btnConfig"]').focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('[class*="configPanel"]')).toBeVisible();
    expect(await page.evaluate(() => document.activeElement === document.body || document.activeElement === null)).toBe(false);
  });

  test('hallazgo · la región viva del acierto no anuncia emojis («✅», «⚡ Contraste»)', async ({ page }) => {
    test.fail(); // ABIERTO — page.tsx:316-318 (✅/❌ sin aria-hidden) y GRUPO_ETIQUETA (page.tsx:88-95,
    // «🖼️ Imagen», «⚡ Contraste»…) dentro del role="alert": el lector lee el nombre del emoji.
    await abrir(page);
    await arrancar(page, 'Básico', 10);
    await responder(page, 'bien');
    const texto = await feedback(page).evaluate((el) => {
      const clon = el.cloneNode(true) as HTMLElement;
      clon.querySelectorAll('[aria-hidden="true"]').forEach((n) => n.remove());
      return clon.textContent ?? '';
    });
    expect(texto).not.toMatch(/\p{Extended_Pictographic}/u);
  });
});

// ─────────────────────────────────────────────────────────────────────────────

test.describe('Inspector 28/10/2026 · promesas (pantalla y metadata)', () => {
  test('sano · el banco tiene 26 figuras (10 + 10 + 6), ejemplos únicos y al menos dos por figura', () => {
    const porNivel = (n: string): number => figurasRetorica.filter((f) => f.nivel === n).length;
    expect([porNivel('basico'), porNivel('intermedio'), porNivel('avanzado')]).toEqual([10, 10, 6]);
    expect(figurasRetorica).toHaveLength(26);
    expect(POR_EJEMPLO.size, 'ejemplo repetido literalmente en dos figuras').toBe(figurasRetorica.reduce((s, f) => s + f.ejemplos.length, 0));
    for (const f of figurasRetorica) expect(f.ejemplos.length, f.id).toBeGreaterThanOrEqual(2);
  });

  test('hallazgo · «27 figuras» en pantalla y en la metadata, con 26 en el banco', async ({ page }) => {
    test.fail(); // ABIERTO — botón «⭐ Todas · 27 figuras completas» (page.tsx:29), FAQ visible
    // (page.tsx:595), perfil del opositor (:556, :560), description, og «24 figuras más» y features.
    const n = figurasRetorica.length; // 26
    await abrir(page);
    const fallos: string[] = [];
    const todas = norm(await page.locator('[class*="nivelGrid"] button', { hasText: 'Todas' }).innerText());
    if (!todas.includes(`${n} figuras`)) fallos.push(`botón Todas: «${todas}»`);
    if (!String(metadata.description).includes(`${n} figuras`)) fallos.push('metadata.description');
    const features = (jsonLd as unknown as { featureList?: string[] }).featureList ?? [];
    if (features.some((t) => /\b\d+ figuras/.test(t) && !t.includes(`${n} figuras`))) fallos.push('features');
    expect(fallos).toEqual([]);
  });

  test('hallazgo · features no promete un «historial de errores» que la app no tiene', async ({ page }) => {
    test.fail(); // ABIERTO — metadata.ts:46 «Historial de errores con revisión al final del quiz»; la
    // pantalla de resultado solo da puntos, aciertos, % y tiempo (medido: 0 elementos de lista).
    test.setTimeout(90_000);
    const features = (jsonLd as unknown as { featureList?: string[] }).featureList ?? [];
    const promete = features.some((t) => /historial de errores/i.test(t));
    await abrir(page);
    await arrancar(page, 'Avanzado', 10);
    await jugar(page, 0);
    await resultado(page);
    const fallosEnPantalla = await page.locator('[class*="resultadoPanel"] li').count();
    expect(!promete || fallosEnPantalla > 0).toBe(true);
  });

  test('hallazgo · el FAQPage no dice que el quiz cubra sinestesia y encabalgamiento', () => {
    test.fail(); // ABIERTO — metadata.ts:67: «… sinestesia y encabalgamiento. El quiz cubre estas y
    // otras 17 más»: ninguna de las dos está en el banco, y 10 + 17 = 27 ≠ 26.
    const texto = faqJsonLd.mainEntity.map((q) => q.acceptedAnswer.text).join(' ');
    const nombres = figurasRetorica.map((f) => f.nombre.toLowerCase());
    const prometidas = ['sinestesia', 'encabalgamiento'].filter((x) => new RegExp(x, 'i').test(texto) && /El quiz cubre estas/.test(texto));
    expect(prometidas.filter((x) => !nombres.includes(x))).toEqual([]);
  });

  test('hallazgo · la pregunta de Selectividad tiene UNA respuesta en la FAQ visible y en el FAQPage', async ({ page }) => {
    test.fail(); // ABIERTO — visible (page.tsx:601-609): metáfora, anáfora, hipérbole, hipérbaton,
    // personificación, antítesis, paralelismo e ironía («estas 8»); FAQPage (metadata.ts:64-68):
    // metáfora, símil, hipérbole, personificación, anáfora, antítesis, oxímoron, metonimia,
    // sinestesia y encabalgamiento. Reparación: UNA constante en metadata.ts para las dos bocas.
    await abrir(page);
    const visible = norm(await page.locator('[class*="faqItem"]', { hasText: '¿Cuáles caen más en selectividad?' }).locator('[class*="faqRespuesta"]').textContent());
    const ld = faqJsonLd.mainEntity.find((q) => /Selectividad/.test(q.name));
    expect(ld).toBeTruthy();
    expect(visible).toBe(norm(ld?.acceptedAnswer.text));
  });

  test('hallazgo · la guía no pega dos palabras en el salto de línea del JSX', async ({ page }) => {
    test.fail(); // ABIERTO — JSX quita el salto entre un </strong>/</em> al final de línea y el texto
    // de la siguiente: page.tsx:595-596 «27 figurasorganizadas», :605-606 «paralelismoe ironía»,
    // :624-625 «metonimiasustituye», :668-669 «Cita textualexacta», :743-744 «subraya,evoca».
    await abrir(page);
    const guia = norm(await page.locator('[data-guia-educativa]').textContent());
    const pegadas = [/figurasorganizadas/, /paralelismoe ironía/, /metonimiasustituye/, /textualexacta/, /subraya,evoca/]
      .filter((re) => re.test(guia))
      .map((re) => re.source);
    expect(pegadas).toEqual([]);
  });

  test('hallazgo · el consejo «Usa el nivel Avanzado» apunta a figuras que están en Avanzado', async ({ page }) => {
    test.fail(); // ABIERTO — page.tsx:537-542: «Distinguir metonimia de sinécdoque o antítesis de
    // paradoja… Usa el nivel Avanzado»; esas cuatro están en Intermedio y Básico, no en Avanzado.
    await abrir(page);
    const consejo = await page.getByText('Usa el nivel Avanzado para afinar la distinción').count();
    const fuera = ['metonimia', 'sinecdoque', 'antitesis', 'paradoja'].filter((id) => figura(id).nivel !== 'avanzado');
    expect(consejo > 0 && fuera.length > 0, `fuera de Avanzado: ${fuera.join(', ')}`).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────

/**
 * CONTENIDO DEL BANCO — cotejado el 28/10/2026 contra las propias definiciones y distinciones del
 * banco (la consulta al DLE quedó denegada en la tanda). Las opciones de cada pregunta salen del
 * MISMO nivel, y en «Todas» de las 26: un ejemplo que por la definición del propio banco es también
 * otra figura de ese conjunto deja dos opciones correctas y la app da por mala una de ellas.
 */
const sinGlosa = (s: string): string => s.replace(/\s*\([^)]*\)\s*/g, ' ').replace(/\s*—.*$/, '').trim();

test.describe('Inspector 28/10/2026 · contenido del banco', () => {
  test('hallazgo · los ejemplos de Gradación no son también Asíndeton (mismo nivel intermedio)', () => {
    test.fail(); // ABIERTO — los 4 ejemplos de gradación son enumeraciones sin conjunción, que es la
    // definición de asíndeton del propio banco; «Vine, vi, vencí» es gradación y «Llegué, vi,
    // vencí», asíndeton. Si Asíndeton sale entre las opciones (3 de cada 9), las dos son correctas.
    const asindetico = (s: string): boolean => {
      const t = sinGlosa(s);
      return t.split(',').length >= 3 && !/\b(y|e|ni|o|u)\b/i.test(t);
    };
    expect(figura('gradacion').ejemplos.filter(asindetico)).toEqual([]);
  });

  test('hallazgo · ningún verso es a la vez ejemplo de dos figuras (Darío: Antítesis y Quiasmo)', () => {
    test.fail(); // ABIERTO — «Cuando quiero llorar no lloro, y a veces lloro sin querer» está en
    // antitesis.ejemplos[1] y en quiasmo.ejemplos[2]; en «Todas» se dan por buenas las dos según
    // qué figura tocó.
    const clave = (s: string): string => sinGlosa(s).toLowerCase().normalize('NFD').replace(/[^a-z ]/g, '').replace(/\s+/g, ' ').trim();
    const visto = new Map<string, string>();
    const repetidos: string[] = [];
    for (const f of figurasRetorica) {
      for (const e of f.ejemplos) {
        const k = clave(e);
        const otra = visto.get(k);
        if (otra && otra !== f.id) repetidos.push(`${otra} / ${f.id}: ${k}`);
        visto.set(k, f.id);
      }
    }
    expect(repetidos).toEqual([]);
  });

  test('hallazgo · «Bebió tres copas» es el continente por el contenido, no al revés', () => {
    test.fail(); // ABIERTO — metonimia.ejemplos[0] glosa «(el contenido por el continente)»: se dice
    // «copas» (continente) por el vino (contenido), como dice la propia definición (data:293) y
    // como leen las otras tres glosas («el autor por la obra», «el lugar por las personas»…).
    const copas = figura('metonimia').ejemplos.find((e) => /copas/.test(e));
    expect(copas).toBeTruthy();
    expect(copas).toMatch(/el continente por el contenido/);
  });

  test('hallazgo · los ejemplos de Paronomasia no repiten la MISMA palabra', () => {
    test.fail(); // ABIERTO — su distinción dice «No es la repetición de la misma palabra»: «Amo a mi
    // amo» y «Vino el amor con vino» repiten la misma forma; «No hay mal que por bien no venga, ni
    // bien que mal no cueste» repite mal/bien en cruz (ABBA), que es el quiasmo del mismo nivel.
    const vacias = new Set(['que', 'por', 'con', 'hay', 'los', 'las', 'del', 'una', 'uno']);
    const repite = (s: string): boolean => {
      const palabras = sinGlosa(s).toLowerCase().match(/[a-záéíóúñü]+/g) ?? [];
      const llenas = palabras.filter((p) => p.length >= 3 && !vacias.has(p));
      return new Set(llenas).size < llenas.length;
    };
    expect(figura('paronomasia').ejemplos.filter(repite)).toEqual([]);
  });

  test('hallazgo · otros ejemplos que son también otra figura de su conjunto de opciones', () => {
    test.fail(); // ABIERTO — Anáfora «Eres mi sol, eres mi luna…» (Metáfora en el mismo nivel básico:
    // «eres mi sol» identifica sin nexo, como «Tus ojos son dos luceros»); Paradoja «El cobarde muere
    // mil veces; el valiente, solo una» (la elipsis «; el valiente, …» de «Unos nacen con estrella;
    // otros, estrellados», mismo nivel intermedio); Zeugma «Ella entró con su sombrero de fiesta y su
    // amiga, de trabajo» (sin el cambio de sentido que exige su definición: es la elipsis del banco,
    // en «Todas»).
    const fallos: string[] = [];
    if (figura('anafora').ejemplos.some((e) => /Eres mi sol/.test(e))) fallos.push('anáfora/metáfora');
    if (figura('paradoja').ejemplos.some((e) => /; el valiente, solo una/.test(e))) fallos.push('paradoja/elipsis');
    if (figura('zeugma').ejemplos.some((e) => /su amiga, de trabajo/.test(e))) fallos.push('zeugma/elipsis');
    expect(fallos).toEqual([]);
  });

  test('hallazgo · la glosa del ejemplo no da la respuesta en el enunciado', () => {
    test.fail(); // ABIERTO — el paréntesis va en la PREGUNTA (page.tsx:279): «(fue omitido)»,
    // «(bastan, omitido)», «(el autor por la obra)», «(la parte—techo—por el todo—casa)»…
    const delata = /\((?:[^)]*\bomitid[oa]\b|el autor por|el lugar por|el instrumento por|el contenido por|la parte|lo singular por|las manos por)/;
    const casos = figurasRetorica.flatMap((f) => f.ejemplos.filter((e) => delata.test(e)).map((e) => `${f.id}: ${e}`));
    expect(casos).toEqual([]);
  });

  test('hallazgo · el verso de Darío es «bajo el ala aleve del leve abanico»', () => {
    test.fail(); // ABIERTO — aliteracion.ejemplos[0] cita «Con el ala aleve del leve abanico. (Rubén
    // Darío)»; el verso de «Era un aire suave…» (Prosas profanas, 1896) es «bajo el ala aleve del leve abanico».
    const dario = figura('aliteracion').ejemplos.find((e) => /ala aleve/.test(e));
    expect(dario).toMatch(/bajo el ala aleve del leve abanico/i);
  });
});
