import { test, expect, type Page, type Locator } from '@playwright/test';
import { organismosNaturaleza, type OrganismoNaturaleza } from '../../data/organismos-naturaleza';
import { jsonLd, faqJsonLd } from '../../app/quiz-reinos-naturaleza/metadata';
import { esperarPaginaAsentada } from './_hidratacion';

/**
 * Quiz Reinos de la Naturaleza — test de regresión del Inspector (1.ª pasada, 28/10/2026).
 * Familia «Quizzes de opción múltiple (quiz-*)», testigo tests/familias/quizzes.spec.ts.
 *
 * QUÉ PROMETE LA APP
 * ──────────────────
 * · <h1> «Quiz Reinos de la Naturaleza 🔬» · «¿Animal, planta, hongo o bacteria? 43 organismos que
 *   sorprenden · Con curiosidades científicas».
 * · Niveles Básico («20 animales contraintuitivos»), Intermedio («13 hongos, plantas y algas»),
 *   Avanzado («10 microorganismos y casos límite») y Todos («43 organismos»); 10, 15 o 20 preguntas.
 *   Cada pregunta es un organismo de `data/organismos-naturaleza.ts` con su grupo y sus 3
 *   distractores propios; tras responder, por qué se confunde y una curiosidad.
 * · La guía declara el sistema de «6 Reinos» (Animalia, Plantae, Fungi, Protista, Bacteria, Archaea).
 *
 * DE DÓNDE SALEN LOS VALORES ESPERADOS
 * ────────────────────────────────────
 * · Banco: 43 organismos, 20 básico + 13 intermedio + 10 avanzado (contados a mano el 28/10/2026).
 *   La clave de cada pregunta se lee del banco por el nombre del organismo: las partidas miden la
 *   MECÁNICA; el contenido del banco se mide aparte, al final.
 * · Nota: `calcularPuntuacion` (page.tsx:55-61): ≥ 0,9 → 100 pts; ≥ 0,7 → 60 + (p − 0,7)/0,2·40;
 *   ≥ 0,5 → 40 + (p − 0,5)/0,2·20; resto p·80. Mensaje (page.tsx:63-68): ≥ 0,9 🏆 «¡Eres un experto
 *   en biología!» · ≥ 0,7 ⭐ «¡Muy buena puntuación!» · ≥ 0,5 👍 «Buen intento» · resto 📚 «Sigue
 *   practicando».
 * · Doble toque: `useGuardaRafaga` (lib/useGuardaRafaga.ts, captura sobre window). El 2.º toque va
 *   con detail ≥ 2 en el mismo punto y con la pantalla nueva ya pintada; se comprueba el detail para
 *   que el caso no pase en vacío. Tras «Empezar» o «Siguiente», contestar en menos de 500 ms cerca del
 *   botón es el 2.º toque de la ráfaga y la guarda lo ignora (es su diseño): las partidas «leen»
 *   550 ms antes de contestar.
 */

const RUTA = '/quiz-reinos-naturaleza/';
const DURO = String.fromCharCode(0xa0);
const norm = (s: string | null | undefined): string => (s ?? '').replace(/[ \t\n\r]+/g, ' ').trim();
const POR_NOMBRE = new Map(organismosNaturaleza.map((o) => [o.nombre, o]));
const organismo = (id: string): OrganismoNaturaleza => {
  const o = organismosNaturaleza.find((x) => x.id === id);
  if (!o) throw new Error(`no hay organismo ${id} en el banco`);
  return o;
};

type Nivel = 'Básico' | 'Intermedio' | 'Avanzado' | 'Todos';

async function abrir(page: Page): Promise<void> {
  await page.addInitScript(() => {
    try {
      localStorage.setItem('meskeia_transparency_banner_dismissed', 'true');
    } catch {
      /* sin almacenamiento: saldrá el aviso */
    }
    // Registra el detail de cada clic ANTES que la guarda (se registra antes, mismo nodo y fase)
    const w = window as unknown as { __detalles: number[] };
    w.__detalles = [];
    window.addEventListener('click', (e) => w.__detalles.push(e.detail), true);
  });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(RUTA);
  await expect(page.locator('h1')).toContainText('Quiz Reinos de la Naturaleza');
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

async function organismoVisible(page: Page): Promise<OrganismoNaturaleza> {
  const nombre = norm(await page.locator('[class*="organismoNombre"]').innerText());
  const o = POR_NOMBRE.get(nombre);
  expect(o, `organismo que no está en el banco: «${nombre}»`).toBeTruthy();
  return o as OrganismoNaturaleza;
}

async function textosOpcion(page: Page): Promise<string[]> {
  return opciones(page).evaluateAll((bs) => bs.map((b) => (b.getAttribute('aria-label') ?? '').replace(/^Opción [A-D]: /, '')));
}

/** Responde la pregunta visible tras «leerla» 550 ms. */
async function responder(page: Page, modo: 'bien' | 'mal'): Promise<OrganismoNaturaleza> {
  await page.waitForTimeout(550);
  const o = await organismoVisible(page);
  const ops = await textosOpcion(page);
  expect(ops, 'toda pregunta ofrece 4 opciones').toHaveLength(4);
  const iC = ops.indexOf(o.grupo);
  expect(iC, `la correcta «${o.grupo}» no está entre las ofrecidas`).toBeGreaterThanOrEqual(0);
  await opciones(page).nth(modo === 'bien' ? iC : iC === 0 ? 1 : 0).click();
  await expect(feedback(page)).toBeVisible();
  return o;
}

async function avanzar(page: Page): Promise<string> {
  const b = page.locator('[class*="btnSiguiente"]');
  const rotulo = norm(await b.innerText());
  await b.click();
  return rotulo;
}

/** Juega hasta el resultado: las `aciertos` primeras bien y el resto mal. */
async function jugar(page: Page, aciertos: number): Promise<OrganismoNaturaleza[]> {
  const vistas: OrganismoNaturaleza[] = [];
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
    return {
      emoji: t('[class*="resultadoEmoji"]'),
      titulo: t('[class*="resultadoTitulo"]'),
      puntos: t('[class*="resultadoPuntos"]'),
      sub: t('[class*="resultadoSubtitulo"]'),
      stats,
    };
  });
}

const porcentaje = (p: number): RegExp => new RegExp(`^${p}${DURO}?%$`);

// ─────────────────────────────────────────────────────────────────────────────

test.describe('Quiz Reinos de la Naturaleza · partida', () => {
  /**
   * CASO NORMAL — Básico, 10 preguntas, 7 bien y 3 mal.
   * A mano: Básico tiene 20 organismos → 10 distintos, todos básicos. 7/10 = 0,7 →
   * 60 + (0,7 − 0,7)/0,2·40 = 60 pts · ⭐ «¡Muy buena puntuación!» · 7/10 · 70 %.
   */
  test('caso normal: 7 de 10 en Básico dan 60 pts, 70 % y «¡Muy buena puntuación!»', async ({ page }) => {
    test.setTimeout(90_000);
    await abrir(page);
    await arrancar(page, 'Básico', 10);
    await expect(contador(page)).toHaveText('Pregunta 1 de 10');
    const vistas = await jugar(page, 7);
    expect(vistas).toHaveLength(10);
    expect(new Set(vistas.map((o) => o.id)).size, 'organismo repetido en la partida').toBe(10);
    expect(vistas.every((o) => o.nivel === 'basico'), 'Básico ha colado otro nivel').toBe(true);
    const r = await resultado(page);
    expect(r.emoji).toBe('⭐');
    expect(r.titulo).toBe('¡Muy buena puntuación!');
    expect(r.puntos).toBe('60 pts');
    expect(r.sub).toBe('7 de 10 respuestas correctas');
    expect(r.stats.Correctas).toBe('7/10');
    // El % se admite pegado o con espacio duro: el formato se vigila en su propio hallazgo
    expect(r.stats.Acierto).toMatch(porcentaje(70));
  });

  /**
   * CASO LÍMITE — pleno en Avanzado (las 10 del nivel) y, tras «Jugar de nuevo» sin recargar, cero.
   * A mano: 10/10 → 1,0 ≥ 0,9 → 100 pts · 🏆 «¡Eres un experto en biología!» · 100 %. «Jugar de
   * nuevo» llama a iniciarQuiz: «Pregunta 1 de 10» y Correctas 0 en la misma página. 0/10 → 0·80 =
   * 0 pts · 📚 «Sigue practicando» · 0 %.
   */
  test('caso límite: 10 de 10 dan 100 pts y, tras «Jugar de nuevo» sin recargar, 0 de 10 dan 0 pts', async ({ page }) => {
    test.setTimeout(120_000);
    await abrir(page);
    await page.evaluate(() => { (window as unknown as { __marca: string }).__marca = 'sin-recarga'; });
    await arrancar(page, 'Avanzado', 10);
    const vistas = await jugar(page, 99);
    expect(vistas.map((o) => o.id).sort(), 'Avanzado juega sus 10 organismos').toEqual(
      organismosNaturaleza.filter((o) => o.nivel === 'avanzado').map((o) => o.id).sort(),
    );
    let r = await resultado(page);
    expect(r.emoji).toBe('🏆');
    expect(r.titulo).toBe('¡Eres un experto en biología!');
    expect(r.puntos).toBe('100 pts');
    expect(r.sub).toBe('10 de 10 respuestas correctas');
    expect(r.stats.Acierto).toMatch(porcentaje(100));

    await page.locator('[class*="btnRejugar"]').click();
    await expect(contador(page)).toHaveText('Pregunta 1 de 10');
    await expect(hudValor(page, 1)).toHaveText('0');
    await expect(page.locator('[class*="preguntaCard"]')).toBeFocused();
    expect(await page.evaluate(() => (window as unknown as { __marca?: string }).__marca)).toBe('sin-recarga');
    await jugar(page, 0);
    r = await resultado(page);
    expect(r.emoji).toBe('📚');
    expect(r.titulo).toBe('Sigue practicando');
    expect(r.puntos).toBe('0 pts');
    expect(r.sub).toBe('0 de 10 respuestas correctas');
    expect(r.stats.Acierto).toMatch(porcentaje(0));
  });

  /**
   * LO QUE SE IGNORA — doble clic en la correcta y clic tardío en otra opción.
   * A mano: `responder` sale si ya hay selección y las opciones quedan disabled → 1 acierto, una sola
   * opción en verde y ninguna en rojo; Correctas 1.
   */
  test('caso de rechazo: la segunda respuesta a la misma pregunta no cuenta', async ({ page }) => {
    await abrir(page);
    await arrancar(page, 'Intermedio', 10);
    await page.waitForTimeout(550);
    const o = await organismoVisible(page);
    const ops = await textosOpcion(page);
    const iC = ops.indexOf(o.grupo);
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
 * DOBLE TOQUE — invariante de la familia en los anchos donde el testigo (solo 390 × 844) es ciego y
 * en las cinco salidas: «Empezar», «Siguiente», «Ver resultados», «Jugar de nuevo» y «Cambiar nivel».
 * Medido el 28/10/2026 (5 anchos con ratón y 2 con toques reales, 3 niveles, 2 rondas): 0 fallos; 345
 * segundos clics con detail 2 y la guarda global los frena todos. El 2.º toque cae sobre una opción a
 * 360-412 px y en escritorio, sobre las relacionadas a 768 px (16 de 18 «Siguiente») y sobre «Empezar
 * Quiz» tras «Cambiar nivel» a 412 px y en escritorio.
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
  expect(detalles[detalles.length - 1], 'el 2.º toque no llegó como ráfaga (detail ≥ 2): el caso pasaría en vacío').toBeGreaterThanOrEqual(2);
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
  test('hallazgo · «Precisión» no pasa del 100 %: tras acertar la 1.ª es 100 %, y dos de dos, 100 %', async ({ page }) => {
    test.fail(); // ABIERTO — page.tsx:236 divide `correctas` (ya con la respuesta actual) entre
    // `preguntaActual` (las ANTERIORES). Medido 28/10/2026 acertando seguidas: «0%» tras la 1.ª,
    // «200%» tras la 2.ª, «150%» tras la 3.ª (escritorio y 412 px).
    await abrir(page);
    await arrancar(page, 'Básico', 10);
    await responder(page, 'bien');
    const tras1 = norm(await hudValor(page, 2).textContent());
    await avanzar(page);
    await responder(page, 'bien');
    await expect(hudValor(page, 1)).toHaveText('2');
    const tras2 = norm(await hudValor(page, 2).textContent());
    // 1 de 1 y 2 de 2 = 100 % (el % se admite pegado: su formato es otro hallazgo)
    expect({ tras1, tras2 }).toEqual({ tras1: expect.stringMatching(porcentaje(100)), tras2: expect.stringMatching(porcentaje(100)) });
  });

  test('hallazgo · el número de preguntas que anuncia «Empezar Quiz» es el que se juega', async ({ page }) => {
    test.fail(); // ABIERTO — generarPreguntas (page.tsx:46) corta a Math.min(num, organismos del nivel)
    // sin decirlo: «20 preguntas · 🟡 Intermedio» y «15» juegan 13; «15/20 preguntas · 🔴 Avanzado», 10.
    await abrir(page);
    const fallos: string[] = [];
    for (const [nivel, num] of [['Intermedio', 15], ['Intermedio', 20], ['Avanzado', 15], ['Avanzado', 20]] as const) {
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
    test.fail(); // ABIERTO — page.tsx:236 (HUD «Precisión») y :345 (resultado «Acierto») pegan el «%».
    test.setTimeout(90_000);
    await abrir(page);
    await arrancar(page, 'Básico', 10);
    await jugar(page, 7);
    const r = await resultado(page);
    expect(r.stats.Acierto).toBe(`70${DURO}%`);
  });

  test('hallazgo · tras «Cambiar nivel» el foco no cae a <body>', async ({ page }) => {
    test.fail(); // ABIERTO — el efecto de foco (page.tsx:141-149) no tiene rama para la pantalla
    // 'config': «Cambiar nivel» se desmonta y el foco cae a <body> (medido con Enter, 28/10/2026).
    test.setTimeout(90_000);
    await abrir(page);
    await arrancar(page, 'Avanzado', 10);
    await jugar(page, 0);
    await page.locator('[class*="btnConfig"]').focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('[class*="configPanel"]')).toBeVisible();
    await page.waitForTimeout(200);
    expect(await page.evaluate(() => document.activeElement === document.body || document.activeElement === null)).toBe(false);
  });

  test('hallazgo · los nombres accesibles no leen el emoji del nivel («🟢 Básico»)', async ({ page }) => {
    test.fail(); // ABIERTO — NIVEL_CONFIG y NIVEL_ETIQUETA (page.tsx:22-27, 70-74) son cadenas con
    // emoji, pintadas en los botones de nivel, en «Empezar Quiz — 10 preguntas · 🟢 Básico» y en la
    // insignia de la tarjeta que recibe el foco: el lector lee «círculo verde».
    await abrir(page);
    await arrancar(page, 'Básico', 10);
    const tarjeta = await page.locator('[class*="preguntaCard"]').evaluate((el) => {
      const clon = el.cloneNode(true) as HTMLElement;
      clon.querySelectorAll('[aria-hidden="true"]').forEach((n) => n.remove());
      return clon.textContent ?? '';
    });
    expect(tarjeta).not.toMatch(/\p{Extended_Pictographic}/u);
  });

  test('hallazgo · el bloque estático de la guía no es una alerta y el veredicto no nace ya lleno', async ({ page }) => {
    test.fail(); // ABIERTO — page.tsx:602 pone role="alert" al cuadro fijo «Confusiones frecuentes» de la
    // guía; page.tsx:291-295 monta el veredicto con role="alert" y aria-live="polite" (se
    // contradicen) ya lleno, receta de los hallazgos 2108/3218 de historia y geografía.
    await abrir(page);
    const enGuia = await page.locator('[data-guia-educativa] [role="alert"]').count();
    await arrancar(page, 'Básico', 10);
    // La región del veredicto tiene que existir ANTES de responder para que el lector la anuncie
    const antes = await page.locator('[class*="feedback"][role], [class*="feedback"] [role="status"], [class*="feedback"] [aria-live]').count();
    expect({ alertasEnGuia: enGuia, regionVivaAntesDeResponder: antes > 0 }).toEqual({ alertasEnGuia: 0, regionVivaAntesDeResponder: true });
  });
});

// ─────────────────────────────────────────────────────────────────────────────

test.describe('Inspector 28/10/2026 · promesas (metadata y FAQ)', () => {
  test('sano · el banco tiene 43 organismos (20 + 13 + 10) y cada pregunta 4 opciones distintas', () => {
    const porNivel = (n: string): number => organismosNaturaleza.filter((o) => o.nivel === n).length;
    expect([porNivel('basico'), porNivel('intermedio'), porNivel('avanzado')]).toEqual([20, 13, 10]);
    expect(organismosNaturaleza).toHaveLength(43); // lo que dicen el subtítulo, «Todos» y la metadata
    for (const o of organismosNaturaleza) expect(new Set([o.grupo, ...o.confundibleCon]).size, o.id).toBe(4);
  });

  test('hallazgo · features del JSON-LD no está vacía (4-8 características)', () => {
    test.fail(); // ABIERTO — metadata.ts:42 `features: []` (§1.ter pide 4-8).
    const lista = (jsonLd as unknown as { featureList?: string[] }).featureList ?? [];
    expect(lista.length).toBeGreaterThanOrEqual(4);
  });

  test('hallazgo · «¿Cuántos reinos…?» tiene UNA respuesta en la FAQ visible y en el FAQPage', async ({ page }) => {
    test.fail(); // ABIERTO — visible (page.tsx:479): el sistema de 6 reinos «es el más usado en la
    // educación secundaria española»; FAQPage (metadata.ts:54): «El más extendido en la enseñanza
    // secundaria distingue cinco… llegando a seis dominios» (los dominios son tres). Reparación: UNA
    // constante en metadata.ts para las dos bocas.
    await abrir(page);
    const visible = norm(await page.locator('[class*="faqItem"]', { hasText: '¿Cuántos reinos hay' }).locator('dd').textContent());
    const ld = faqJsonLd.mainEntity.find((q) => /Cuántos reinos/.test(q.name));
    expect(ld).toBeTruthy();
    expect(ld?.acceptedAnswer.text).not.toMatch(/seis dominios/);
    expect(visible).toBe(norm(ld?.acceptedAnswer.text));
  });
});

// ─────────────────────────────────────────────────────────────────────────────

/**
 * CONTENIDO DEL BANCO — cotejado el 28/10/2026 con el propio banco y la guía de la app. Fuentes de lo
 * externo, en cada caso. Las consultas web a fuentes no oficiales no están permitidas en la tanda.
 */
test.describe('Inspector 28/10/2026 · contenido del banco', () => {
  test('hallazgo · Prión: «Agente Acelular (no ser vivo)» también es correcta y se da por mala', async ({ page }) => {
    test.fail(); // ABIERTO — el prión es un agente infeccioso acelular (formas acelulares: virus,
    // viroides y priones) y no es un ser vivo: la distractora describe al prión tan bien como la clave.
    // Avanzado con 10 preguntas juega los 10 organismos del nivel, así que el Prión sale siempre.
    test.setTimeout(90_000);
    await abrir(page);
    await arrancar(page, 'Avanzado', 10);
    for (let n = 1; n <= 10; n++) {
      await page.waitForTimeout(550);
      const o = await organismoVisible(page);
      const ops = await textosOpcion(page);
      if (o.id === 'prion') {
        await opciones(page).nth(ops.indexOf('Agente Acelular (no ser vivo)')).click();
        await expect(page.locator('[class*="feedbackResultado"]')).toHaveText('¡Correcto!', { timeout: 2000 });
        return;
      }
      await opciones(page).nth(ops.indexOf(o.grupo)).click();
      await avanzar(page);
    }
    throw new Error('el Prión no salió en Avanzado');
  });

  test('hallazgo · Fitoplancton: «Bacteria» no puede ser incorrecta', () => {
    test.fail(); // ABIERTO — el fitoplancton es una categoría ecológica que incluye cianobacterias
    // (Prochlorococcus, Synechococcus); el propio banco da la Cianobacteria como bacteria fotosintética.
    expect(organismo('fitoplancton').confundibleCon).not.toContain('Bacteria');
  });

  test('hallazgo · Liquen: el fotobionte no es siempre un alga y la unión no es «inseparable»', () => {
    test.fail(); // ABIERTO — en una parte de los líquenes el fotobionte es una cianobacteria, y los
    // simbiontes se aíslan y cultivan por separado; además el liquen se nombra y clasifica por su hongo.
    const l = organismo('liquen');
    expect(`${l.grupo} ${l.porQueConfunde}`).not.toMatch(/inseparable/);
    expect(`${l.grupo} ${l.porQueConfunde} ${l.curiosidad}`).toMatch(/cianobacteria/i);
  });

  test('hallazgo · Alga roja: el tejido vascular no «define» a las plantas (el musgo no lo tiene)', () => {
    test.fail(); // ABIERTO — alga-roja.porQueConfunde frente a musgo.porQueConfunde («ni tejido
    // vascular… Pero sí es planta») del mismo banco.
    expect(organismo('musgo').porQueConfunde).toMatch(/tejido vascular/);
    expect(organismo('alga-roja').porQueConfunde).not.toMatch(/tejidos vasculares que definen a las plantas/);
  });

  test('hallazgo · curiosidades: caballito de mar, levadura y bacterias del cuerpo', () => {
    test.fail(); // ABIERTO — (1) la gestación masculina es de toda la familia Syngnathidae (también
    // peces pipa y dragones de mar); (2) la levadura fue el primer EUCARIOTA secuenciado (1996): antes,
    // Haemophilus influenzae (1995); (3) la razón 10:1 de bacterias está revisada: ~1,3:1 (Sender,
    // Fuchs y Milo, PLoS Biology 2016), no el 90 %.
    const fallos: string[] = [];
    if (/único pez en el que el macho/.test(organismo('caballito-mar').curiosidad)) fallos.push('caballito');
    if (/primer organismo secuenciado/.test(organismo('levadura').curiosidad)) fallos.push('levadura');
    if (/90% de las células de tu cuerpo/.test(organismo('bacteria').curiosidad)) fallos.push('bacteria');
    expect(fallos).toEqual([]);
  });

  test('hallazgo · algas: «Confundir algas con plantas» no se da como error sin decir el sistema', async ({ page }) => {
    test.fail(); // ABIERTO — en el sistema de Whittaker (1969) que cita la propia FAQ las algas
    // pluricelulares (verdes, rojas, pardas) eran Plantae, y en el de Ruggiero et al. (2015) las verdes y
    // rojas lo son; la FAQ visible además llama a Chlorophyta «el grupo más relacionado» con las plantas
    // terrestres, cuando lo son las carofitas (Streptophyta).
    await abrir(page);
    await page.locator('[class*="toggleButton"]').click();
    const guia = norm(await page.locator('[data-guia-educativa]').textContent());
    const fallos: string[] = [];
    if (/Solo las plantas terrestres \(briófitos/.test(guia) && !/Whittaker.{0,200}algas/.test(guia)) fallos.push('error común sin sistema');
    if (/Chlorophyta\) son el grupo más relacionado/.test(guia)) fallos.push('Chlorophyta');
    expect(fallos).toEqual([]);
  });

  test('hallazgo · la guía de 7 pasos no clasifica las esporas como rasgo de Fungi', async ({ page }) => {
    test.fail(); // ABIERTO — paso 7 (page.tsx:562): «¿Se reproduce por esporas (Fungi), semillas
    // (Plantae)…?»; el banco da Helecho y Musgo como Planta y dice que «se reproducen por esporas».
    await abrir(page);
    await page.locator('[class*="toggleButton"]').click();
    const guia = norm(await page.locator('[data-guia-educativa]').textContent());
    expect(organismo('helecho').curiosidad).toMatch(/esporas/);
    expect(guia).not.toMatch(/esporas \(Fungi\)/);
  });
});

// ─────────────────────────────────────────────────────────────────────────────

/**
 * INSPECTOR 29/10/2026 — 2.ª pasada, tras la reparación de la familia (c5b619bb, d9e710f8).
 * Valores esperados calculados a mano ANTES de ejecutar, con `calcularPuntuacion` y
 * `getResultadoTexto` (page.tsx:55-68) y el banco de `data/organismos-naturaleza.ts`.
 * Sin <input>: además de `esperarPaginaAsentada`, se espera a que React cuelgue sus props de
 * «Empezar Quiz» (`__reactProps$`), como `esperarHidratado` del testigo de la familia.
 */
async function esperarBotonHidratado(page: Page): Promise<void> {
  await page.waitForFunction(() => {
    const b = [...document.querySelectorAll('button')].find((x) => /Empezar Quiz/.test(x.textContent ?? ''));
    return Boolean(b && Object.keys(b).some((k) => k.startsWith('__reactProps$')));
  }, null, { timeout: 20_000 });
}

test.describe('inspector 29/10/2026 · los tres casos', () => {
  /**
   * CASO NORMAL — Todos, 15 preguntas, 11 bien y 4 mal (las 4 últimas).
   * A mano: el banco tiene 43 → 15 distintos. 11/15 = 0,7333 ≥ 0,7 → 60 + (0,7333 − 0,7)/0,2·40 =
   * 60 + 6,67 = 66,67 → 67 pts · ⭐ «¡Muy buena puntuación!» · «11/15» · round(73,33) = 73 %.
   */
  test('caso normal: 11 de 15 en Todos dan 67 pts, 73 % y «¡Muy buena puntuación!»', async ({ page }) => {
    test.setTimeout(120_000);
    await abrir(page);
    await esperarBotonHidratado(page);
    await elegir(page, 'Todos', 15);
    await expect(page.locator('[class*="btnIniciar"]')).toHaveText('Empezar Quiz — 15 preguntas · ⭐ Todos');
    await page.locator('[class*="btnIniciar"]').click();
    await expect(contador(page)).toHaveText('Pregunta 1 de 15');
    const vistas = await jugar(page, 11);
    expect(vistas).toHaveLength(15);
    expect(new Set(vistas.map((o) => o.id)).size, 'organismo repetido en la partida').toBe(15);
    const r = await resultado(page);
    expect(r.emoji).toBe('⭐');
    expect(r.titulo).toBe('¡Muy buena puntuación!');
    expect(r.puntos).toBe('67 pts');
    expect(r.sub).toBe('11 de 15 respuestas correctas');
    expect(r.stats.Correctas).toBe('11/15');
    // El % se admite pegado o con espacio duro: el formato es el hallazgo 3720, abierto
    expect(r.stats.Acierto).toMatch(porcentaje(73));
  });

  /**
   * CASO DE RECHAZO — «Siguiente» sin contestar. El botón solo se monta con una respuesta
   * (page.tsx:291-326): antes de contestar no existe, Enter sobre la tarjeta enfocada no avanza ni
   * contesta, y Tab lleva a la opción A. Esperado: «Pregunta 1 de 10», Correctas «0», sin veredicto.
   */
  test('caso de rechazo: sin contestar no hay «Siguiente» y Enter en la tarjeta no avanza', async ({ page }) => {
    await abrir(page);
    await esperarBotonHidratado(page);
    await elegir(page, 'Avanzado', 10);
    await page.locator('[class*="btnIniciar"]').focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('[class*="preguntaCard"]')).toBeFocused();
    await expect(page.locator('[class*="btnSiguiente"]')).toHaveCount(0);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(300);
    await expect(contador(page)).toHaveText('Pregunta 1 de 10');
    await expect(feedback(page)).toHaveCount(0);
    await expect(hudValor(page, 1)).toHaveText('0');
    await page.keyboard.press('Tab');
    expect(await page.evaluate(() => document.activeElement?.getAttribute('aria-label') ?? '')).toMatch(/^Opción A: /);
  });
});

test.describe('inspector 29/10/2026 · móvil 360 × 740', () => {
  test.use({ viewport: { width: 360, height: 740 }, userAgent: UA_MOVIL, deviceScaleFactor: 3, isMobile: true, hasTouch: true });

  /**
   * CASO LÍMITE — Básico con 20 preguntas: el nivel tiene justo 20, así que se juega el banco
   * entero del nivel y la 20.ª es la última («Ver resultados»). 18 bien y 2 mal (las 2 últimas).
   * A mano: 18/20 = 0,9 ≥ 0,9 → 100 pts · 🏆 «¡Eres un experto en biología!» · «18/20» · 90 %.
   */
  test('caso límite: 18 de 20 en Básico (el nivel entero) dan 100 pts, 90 % y 🏆', async ({ page }) => {
    test.setTimeout(150_000);
    await abrir(page);
    await esperarBotonHidratado(page);
    await arrancar(page, 'Básico', 20);
    await expect(contador(page)).toHaveText('Pregunta 1 de 20');
    const vistas = await jugar(page, 18); // `jugar` solo sale por «Ver resultados»
    expect(vistas.map((o) => o.id).sort(), 'Básico con 20 juega sus 20 organismos').toEqual(
      organismosNaturaleza.filter((o) => o.nivel === 'basico').map((o) => o.id).sort(),
    );
    const r = await resultado(page);
    expect(r.emoji).toBe('🏆');
    expect(r.titulo).toBe('¡Eres un experto en biología!');
    expect(r.puntos).toBe('100 pts');
    expect(r.sub).toBe('18 de 20 respuestas correctas');
    expect(r.stats.Correctas).toBe('18/20');
    expect(r.stats.Acierto).toMatch(porcentaje(90));
  });

  test('hallazgo · los botones de «Número de preguntas» caben en su tarjeta a 360 px', async ({ page }) => {
    // REPARADO (3785, 29/10/2026): flex-wrap, también en verbos-irregulares y figuras-retoricas.
    // Era: `.preguntasRow` (QuizReinosNaturaleza.module.css:98) es flex sin
    // `flex-wrap` y centrado: a 360 px los tres botones necesitan 360 px y la tarjeta da 246 px de
    // contenido (57-303), así que salen por los dos lados hasta el borde de la pantalla (0-118,
    // 126-239, 247-360; medido 29/10/2026). A 320 px, 20 px de «10 preguntas» y de «20 preguntas»
    // quedan fuera de la pantalla.
    await abrir(page);
    const m = await page.evaluate(() => {
      const panel = document.querySelector('[class*="configPanel"]') as HTMLElement;
      const cs = getComputedStyle(panel);
      const c = panel.getBoundingClientRect();
      const izq = c.left + parseFloat(cs.borderLeftWidth) + parseFloat(cs.paddingLeft);
      const der = c.right - parseFloat(cs.borderRightWidth) - parseFloat(cs.paddingRight);
      return [...document.querySelectorAll('[class*="preguntasRow"] button')].map((b) => {
        const r = b.getBoundingClientRect();
        return `${(b.textContent ?? '').trim()}: ${r.left >= izq - 1 && r.right <= der + 1 ? 'dentro' : `fuera (${Math.round(r.left)}-${Math.round(r.right)})`}`;
      });
    });
    expect(m).toEqual(['10 preguntas: dentro', '15 preguntas: dentro', '20 preguntas: dentro']);
  });
});

test.describe('inspector 29/10/2026 · contenido', () => {
  test('hallazgo · «hongo frente a planta» tiene UNA respuesta en la FAQ visible y en el FAQPage', async ({ page }) => {
    // REPARADO (3782, 29/10/2026): una sola constante, app/quiz-reinos-naturaleza/faq.ts, que
    // importan page.tsx y metadata.ts; la respuesta nombra también a los simbiontes. Era: la misma
    // pregunta con dos redacciones y dos respuestas. Visible
    // (page.tsx:484-485), «¿Por qué los hongos no son plantas?»: «heterótrofos por absorción…
    // quitina». FAQPage (metadata.ts:75-78), «¿Qué diferencia hay entre un hongo y una planta?»:
    // «obtienen energía descomponiendo materia orgánica o como parásitos», que deja fuera a los
    // simbiontes del propio banco (Trufa: «necesitan la simbiosis con raíces»; Liquen), y la frase
    // «los distingue de las plantas que no realizan fotosíntesis» se lee como «plantas que no la
    // realizan». Reparación: UNA constante en metadata.ts que importen las dos bocas.
    await abrir(page);
    const visible = norm(await page.locator('[class*="faqItem"]', { hasText: '¿Por qué los hongos no son plantas?' }).locator('dd').textContent());
    const ld = faqJsonLd.mainEntity.filter((q) => /hongo/.test(q.name));
    expect(ld, 'una sola pregunta sobre hongos en el FAQPage').toHaveLength(1);
    expect(ld[0].name).toBe('¿Por qué los hongos no son plantas?');
    expect(organismo('trufa').curiosidad).toMatch(/simbiosis/);
    expect(visible).toBe(norm(ld[0].acceptedAnswer.text));
    expect(visible, 'nombra a los simbiontes que enseña el banco').toMatch(/simbiosis/);
  });

  test('hallazgo · la guía de 7 pasos lleva la esponja a Animalia', async ({ page }) => {
    // REPARADO (3783, 29/10/2026): el paso 4 nombra la excepción de las esponjas y las manda al
    // paso 5 aunque no tengan tejidos verdaderos. Era: paso 4 (page.tsx:542-543): «sin diferenciación de tejidos → muy
    // probablemente Protista. Si es pluricelular con tejidos diferenciados → pasa al paso 5», y solo
    // desde ahí se llega a Animalia (paso 6). El banco dice de la Esponja marina, que da como
    // «Animal (Porífero)», que «no tiene tejidos ni órganos diferenciados»: con la guía no llega a su
    // reino, y la propia guía la pone entre los «organismos trampa… favoritos del examen».
    await abrir(page);
    await page.locator('[class*="toggleButton"]').click();
    const guia = norm(await page.locator('[data-guia-educativa]').textContent());
    const esponja = organismo('esponja');
    expect(esponja.grupo).toBe('Animal (Porífero)');
    const sinTejidosAProtista = /sin diferenciación de tejidos → muy probablemente Protista/.test(guia);
    const esponjaSinTejidos = /no tiene tejidos ni órganos diferenciados/.test(esponja.curiosidad);
    // La regla puede seguir, si el mismo paso saca a las esponjas de ella y las lleva a Animalia
    const excepcionEsponjas = /esponjas[^.]*sin tejidos verdaderos[^.]*Animalia/.test(guia);
    expect(sinTejidosAProtista && esponjaSinTejidos && !excepcionEsponjas).toBe(false);
    expect(excepcionEsponjas).toBe(true);
  });

  test('hallazgo · Archaea, uno de los «6 Reinos» de la guía, sale en alguna pregunta', async ({ page }) => {
    // REPARADO (3784, 29/10/2026) bajando la promesa (Frontera N2 promesa): la guía ya no manda a
    // practicar Archaea en el quiz y dice que las arqueas no salen en él. Si un día se añaden
    // arqueas al banco, también pasa. Era: la guía declara «Los 6 Reinos» con Archaea (page.tsx:376, 425) y, para la
    // EvAU, que «puede incluir preguntas sobre Archaea», recomienda «Practica en modo Todos»
    // (page.tsx:453-454). Ninguno de los 43 organismos es una arquea ni lleva «Archaea» como
    // respuesta o distractor (contado en el banco el 29/10/2026: 0).
    await abrir(page);
    await page.locator('[class*="toggleButton"]').click();
    const guia = norm(await page.locator('[data-guia-educativa]').textContent());
    expect(guia).toMatch(/preguntas sobre Archaea/);
    const conArquea = organismosNaturaleza.filter((o) => /arque|archaea/i.test([o.grupo, ...o.confundibleCon].join(' ')));
    const avisaQueNoSalen = /arqueas no salen en el quiz/.test(guia);
    expect(conArquea.length > 0 || avisaQueNoSalen, 'el quiz tiene arqueas o la guía dice que no las tiene').toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────

/**
 * INSPECTOR 29/10/2026 (tarde) — re-inspección tras /reparar (6b82c3a3: 3782-3785; familia 5b65607f
 * y f0b18db0). Valores esperados calculados a mano ANTES de ejecutar, con `calcularPuntuacion`,
 * `getResultadoTexto` y `formatTiempo` (page.tsx:56-69, 164-169) y el banco de
 * `data/organismos-naturaleza.ts`. Ninguno depende del orden de preguntas ni de opciones: la clave
 * se lee del banco por el nombre del organismo que se ve.
 */
async function anuncioOpciones(page: Page): Promise<string[]> {
  // Lo que distingue a cada opción para quien no ve el color: nombre accesible, texto y descripción
  return opciones(page).evaluateAll((bs) => bs.map((b) => {
    const desc = (b.getAttribute('aria-describedby') ?? '').split(' ').filter(Boolean)
      .map((id) => document.getElementById(id)?.textContent ?? '').join(' ');
    return `${b.getAttribute('aria-label') ?? ''} | ${(b.textContent ?? '').trim()} | ${desc}`.trim();
  }));
}

test.describe('inspector 29/10/2026 (tarde) — re-inspección tras /reparar', () => {
  /**
   * CASO NORMAL + CRONÓMETRO — Intermedio, 10 preguntas, 6 bien y 4 mal, con el reloj de la página
   * adelantado 125 s en la 5.ª pregunta (page.clock: el tiempo sigue corriendo de verdad).
   * A mano: 6/10 = 0,6 → tramo ≥ 0,5: 40 + (0,6 − 0,5)/0,2·20 = 40 + 10 = 50 pts · 👍 «Buen intento»
   * · «6 de 10 respuestas correctas» · «6/10» · round(60) = 60 %. Tiempo (page.tsx:120) =
   * round((fin − inicio)/1000) = 125 + lo transcurrido de verdad (~7-15 s) → entre 2 y 3 minutos, en
   * «min» y «s» (hallazgo 3772 de la familia, cabo C0515): «2 min N s». «Correctas» del HUD sube de
   * 1 en 1 en las seis primeras y se queda en 6. «Jugar de nuevo» rearranca el reloj: 0 de 10 en
   * menos de un minuto → «N s», con N = lo transcurrido de verdad.
   * Medido el 29/10/2026 (tarde): 50 pts, 👍, 6/10, «60%», «2 min 11 s» con 6,5 s reales; 2.ª, «6 s».
   */
  test('caso normal: 6 de 10 en Intermedio dan 50 pts y «Buen intento», y el reloj cuenta «2 min N s»', async ({ page }) => {
    test.setTimeout(120_000);
    await page.clock.install();
    await abrir(page);
    await esperarBotonHidratado(page);
    await elegir(page, 'Intermedio', 10);
    const t0 = Date.now();
    await page.locator('[class*="btnIniciar"]').click();
    await expect(contador(page)).toHaveText('Pregunta 1 de 10');
    const vistas: OrganismoNaturaleza[] = [];
    for (let n = 1; n <= 10; n++) {
      if (n === 5) await page.clock.fastForward(125_000);
      const o = await responder(page, n <= 6 ? 'bien' : 'mal');
      vistas.push(o);
      await expect(page.locator('[class*="feedbackResultado"]')).toHaveText(n <= 6 ? '¡Correcto!' : 'Incorrecto');
      // El veredicto nombra el grupo del banco
      await expect(page.locator('[class*="feedbackGrupo"]')).toHaveText(o.grupo);
      await expect(hudValor(page, 1)).toHaveText(String(Math.min(n, 6)));
      await avanzar(page);
    }
    await expect(page.locator('[class*="resultadoPanel"]')).toBeVisible();
    const real = (Date.now() - t0) / 1000;
    expect(vistas.every((o) => o.nivel === 'intermedio'), 'Intermedio ha colado otro nivel').toBe(true);
    expect(new Set(vistas.map((o) => o.id)).size, 'organismo repetido').toBe(10);
    const r = await resultado(page);
    expect(r.emoji).toBe('👍');
    expect(r.titulo).toBe('Buen intento');
    expect(r.puntos).toBe('50 pts');
    expect(r.sub).toBe('6 de 10 respuestas correctas');
    expect(r.stats.Correctas).toBe('6/10');
    expect(r.stats.Acierto).toMatch(porcentaje(60)); // pegado o con espacio duro: 3720 sigue abierto
    expect(real, 'la partida ha tardado tanto que el caso deja de valer').toBeLessThan(50);
    const m = /^(\d+) min (\d+) s$/.exec(r.stats.Tiempo);
    expect(m, `«${r.stats.Tiempo}» no va en «N min N s»`).toBeTruthy();
    const seg = Number(m?.[1]) * 60 + Number(m?.[2]);
    expect(Number(m?.[1])).toBe(2);
    expect(seg).toBeGreaterThanOrEqual(125 + Math.floor(real) - 2);
    expect(seg).toBeLessThanOrEqual(125 + Math.ceil(real) + 1);

    // «Jugar de nuevo»: el reloj empieza de cero
    const t1 = Date.now();
    await page.locator('[class*="btnRejugar"]').click();
    await expect(contador(page)).toHaveText('Pregunta 1 de 10');
    await jugar(page, 0);
    const r2 = await resultado(page);
    const real2 = (Date.now() - t1) / 1000;
    expect(r2.sub).toBe('0 de 10 respuestas correctas');
    expect(r2.puntos).toBe('0 pts');
    const m2 = /^(\d+) s$/.exec(r2.stats.Tiempo);
    expect(m2, `«${r2.stats.Tiempo}» debería ir en segundos (menos de un minuto)`).toBeTruthy();
    expect(Number(m2?.[1])).toBeLessThanOrEqual(Math.ceil(real2) + 1);
    expect(Number(m2?.[1])).toBeGreaterThanOrEqual(Math.floor(real2) - 2);
  });

  test('sano · la FAQ de hongos es UNA: la del HTML servido (FAQPage) es la visible, y no se repite', async ({ page }) => {
    // 3782 REPARADO: app/quiz-reinos-naturaleza/faq.ts la escriben page.tsx y metadata.ts. Se mira en
    // el HTML que sirve el layout, no en el módulo: es lo que leen buscadores y asistentes.
    const html = await (await page.request.get(RUTA)).text();
    type Ld = { '@type': string; mainEntity?: { name: string; acceptedAnswer: { text: string } }[] };
    const lds = [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)].map((x) => JSON.parse(x[1]) as Ld);
    const faq = lds.find((x) => x['@type'] === 'FAQPage');
    expect(faq, 'el HTML servido no lleva FAQPage').toBeTruthy();
    const hongos = (faq?.mainEntity ?? []).filter((q) => /hongo/i.test(q.name));
    expect(hongos.map((q) => q.name)).toEqual(['¿Por qué los hongos no son plantas?']);
    await abrir(page);
    const item = page.locator('[class*="faqItem"]', { hasText: '¿Por qué los hongos no son plantas?' });
    await expect(item).toHaveCount(1);
    expect(norm(await item.locator('dd').textContent())).toBe(norm(hongos[0].acceptedAnswer.text));
  });

  test('hallazgo · la guía de 7 pasos no lleva a Plantae las macroalgas del banco (Nori, Kelp)', async ({ page }) => {
    test.fail(); // ABIERTO (29/10/2026 tarde) — la reparación de 3783 escribió la excepción de la
    // esponja como regla general: paso 4, «con un pluricelular sin tejidos, pasa también al paso 5»,
    // y el paso 5 da «Si tiene cloroplastos y realiza fotosíntesis → Plantae». El Alga roja (Nori),
    // pluricelular de talo sin tejidos verdaderos y fotosintética, y el Kelp llegan así a Plantae;
    // el banco las da como «Protista (Alga)» y la FAQ visible dice «La mayoría de las algas
    // (macroalgas…) pertenecen al reino Protista». Antes, «sin diferenciación de tejidos → Protista».
    await abrir(page);
    await page.locator('[class*="toggleButton"]').click();
    const pasos = (await page.locator('[class*="stepGuide"] > li').allInnerTexts()).map(norm);
    expect(pasos).toHaveLength(7);
    expect(organismo('alga-roja').grupo).toBe('Protista (Alga)');
    expect(organismo('kelp').grupo).toBe('Protista (Alga)');
    const sinTejidosAlPaso5 = /pluricelular sin tejidos, pasa también al paso 5/.test(pasos[3]);
    const fotosintesisAPlantae = /fotosíntesis → Plantae/.test(pasos[4]);
    expect(sinTejidosAlPaso5 && fotosintesisAPlantae, 'Nori: pluricelular sin tejidos → paso 5 → Plantae').toBe(false);
  });

  test('hallazgo · tras fallar, la correcta y la elegida se distinguen por algo más que el color', async ({ page }) => {
    // REPARADO (3821, /reparar 30/10/2026): ✓/✗ visibles y la marca en el aria-label. Era — forma del cabo C0516: tras contestar, las opciones
    // solo cambian de clase (verde la correcta, rojo la elegida, page.tsx:271-276); ni ✓/✗, ni
    // nombre accesible nuevo («Opción A: Anfibio» sigue igual), ni descripción. El panel sí dice
    // «Incorrecto» y el grupo correcto, pero no qué botón es cuál.
    await abrir(page);
    await arrancar(page, 'Básico', 10);
    await page.waitForTimeout(550);
    const o = await organismoVisible(page);
    const ops = await textosOpcion(page);
    const iC = ops.indexOf(o.grupo);
    const iMal = iC === 0 ? 1 : 0;
    const antes = await anuncioOpciones(page);
    await opciones(page).nth(iMal).click();
    await expect(page.locator('[class*="feedbackResultado"]')).toHaveText('Incorrecto');
    const despues = await anuncioOpciones(page);
    expect({ correcta: despues[iC] !== antes[iC], elegida: despues[iMal] !== antes[iMal] }).toEqual({ correcta: true, elegida: true });
  });
});

test.describe('inspector 29/10/2026 (tarde) · doble clic en una opción, escritorio 1920 × 1080', () => {
  test.use({ viewport: { width: 1920, height: 1080 } });

  test('hallazgo · el 2.º clic de un doble clic en una opción no tira el foco a <body>', async ({ page }) => {
    // REPARADO (3820, /reparar 30/10/2026): useGuardaRafaga devuelve el foco cuando el 2.º toque cae
    // en un control deshabilitado. Era — forma del cabo C0514: la opción contestada queda
    // disabled y el 2.º clic solo entrega pointerdown (ni mousedown ni click), así que el freno de
    // lib/useGuardaRafaga.ts no lo ve y el foco, que ya estaba en «Siguiente», cae a <body>. Medido:
    // 1920 × 1080 en 3 de 4 opciones (B, C, D de la 2.ª pregunta) y 412 × 915 con toques, 2 de 4.
    // Precondición: en la 2.ª pregunta la página ya no se mueve al contestar (scrollY igual), así que el
    // 2.º clic cae en la misma opción, ya deshabilitada.
    await abrir(page);
    await esperarBotonHidratado(page);
    await arrancar(page, 'Básico', 10);
    await responder(page, 'bien');
    await avanzar(page);
    await expect(contador(page)).toHaveText('Pregunta 2 de 10');
    await page.waitForTimeout(700);
    const y0 = await page.evaluate(() => scrollY);
    const caja = await opciones(page).nth(1).boundingBox();
    if (!caja) throw new Error('la opción B no tiene caja');
    await page.mouse.dblclick(caja.x + caja.width / 2, caja.y + caja.height / 2);
    await page.waitForTimeout(400);
    await expect(feedback(page)).toBeVisible();
    expect(await page.evaluate(() => scrollY), 'la página se ha movido: el 2.º clic no cae en la opción').toBe(y0);
    await expect(page.locator('[class*="btnSiguiente"]')).toBeFocused();
  });
});

test.describe('inspector 29/10/2026 (tarde) · móvil 360 × 740', () => {
  test.use({ viewport: { width: 360, height: 740 }, userAgent: UA_MOVIL, deviceScaleFactor: 3, isMobile: true, hasTouch: true });

  /**
   * FORMA DE 3785 — ningún botón de la pantalla de configuración (niveles, «Número de preguntas»,
   * «Empezar Quiz») sale de su tarjeta, ni a 360 ni a 320 px, y la página no gana scroll lateral.
   * A mano: a 360 px la tarjeta da 246 px de contenido (57-303, medido por la mañana) y cada botón
   * «N preguntas» ~118 px: con flex-wrap caben 2 + 1; a 320 px, 206 px: uno por fila. Esperado: 0 fuera.
   */
  test('caso móvil: a 360 y a 320 px ningún botón de la configuración sale de su tarjeta', async ({ page }) => {
    const medir = (): Promise<{ fuera: string[]; scroll: number }> => page.evaluate(() => {
      const panel = document.querySelector('[class*="configPanel"]') as HTMLElement;
      const cs = getComputedStyle(panel);
      const c = panel.getBoundingClientRect();
      const izq = c.left + parseFloat(cs.borderLeftWidth) + parseFloat(cs.paddingLeft);
      const der = c.right - parseFloat(cs.borderRightWidth) - parseFloat(cs.paddingRight);
      const fuera = [...panel.querySelectorAll('button')].filter((b) => {
        const r = b.getBoundingClientRect();
        return r.left < izq - 1 || r.right > der + 1;
      }).map((b) => (b.textContent ?? '').trim());
      return { fuera, scroll: document.documentElement.scrollWidth };
    });
    await abrir(page);
    expect(await medir()).toEqual({ fuera: [], scroll: 360 });
    await page.setViewportSize({ width: 320, height: 740 });
    await page.waitForTimeout(300);
    expect(await medir()).toEqual({ fuera: [], scroll: 320 });
  });

  /**
   * CASO LÍMITE a 360 × 640 — Avanzado con 10 (juega el nivel entero, también el Virus, el feedback
   * más largo: 508 px), 5 bien y 5 mal, con toques. Tras cada respuesta: foco en «Siguiente» y el
   * veredicto («¡Correcto!»/«Incorrecto») entero a la vista, bajo la barra del logo
   * (scroll-padding-top) y por encima del borde inferior, con «Siguiente» también entero; tras
   * «Siguiente», foco en el enunciado y a la vista; al final, el resultado enfocado y a la vista.
   * A mano: 5/10 = 0,5 → justo el tramo ≥ 0,5: 40 + 0/0,2·20 = 40 pts · 👍 «Buen intento» · «5/10»
   * · 50 %. Medido el 29/10/2026 (tarde) a 360 × 640: «Siguiente» en 585-632 px en las 10; el
   * veredicto, entre 61 y 197 px (el más alto, el Prión, feedback de 533 px: 61-83, con la barra del
   * logo en 0-62 y el veredicto en el punto central). A 320 × 568 los feedbacks de Avanzado (505-576
   * px) ya no caben con «Siguiente» y el veredicto queda bajo la barra o por encima de la pantalla en
   * los 10: es un alto de pantalla fuera del encargo (360 × 640), anotado sin hallazgo.
   */
  test('caso límite: 5 de 10 a 360 × 640 dan 40 pts, con el veredicto y el foco siempre a la vista', async ({ page }) => {
    test.setTimeout(120_000);
    await page.setViewportSize({ width: 360, height: 640 });
    await abrir(page);
    await esperarBotonHidratado(page);
    await elegir(page, 'Avanzado', 10);
    await page.locator('[class*="btnIniciar"]').tap();
    await expect(contador(page)).toHaveText('Pregunta 1 de 10');
    const fallos: string[] = [];
    const vistas: string[] = [];
    for (let n = 1; n <= 10; n++) {
      await page.waitForTimeout(600);
      await expect(page.locator('[class*="preguntaCard"]')).toBeFocused();
      const o = await organismoVisible(page);
      vistas.push(o.id);
      const ops = await textosOpcion(page);
      const iC = ops.indexOf(o.grupo);
      await opciones(page).nth(n <= 5 ? iC : iC === 0 ? 1 : 0).tap();
      await expect(feedback(page)).toBeVisible();
      await page.waitForTimeout(300); // enfocarSinCentrar vuelve a mirar a los 120 ms
      await expect(page.locator('[class*="btnSiguiente"]')).toBeFocused();
      const v = await page.evaluate(() => {
        // «A la vista» = dentro de la ventana y SIN la barra fija del logo encima: lo que hay en el
        // centro del veredicto es el veredicto. (No vale el scroll-padding-top, 66 px, que deja 4 px de
        // aire bajo la barra de 62: el Prión queda en 61-83 px y se lee entero.)
        const el = document.querySelector('[class*="feedbackResultado"]') as HTMLElement;
        const ver = el.getBoundingClientRect();
        const centro = document.elementFromPoint(ver.left + 20, ver.top + ver.height / 2);
        const sig = (document.querySelector('[class*="btnSiguiente"]') as HTMLElement).getBoundingClientRect();
        return {
          veredicto: ver.top >= 0 && ver.bottom <= innerHeight && Boolean(centro && (centro === el || el.contains(centro))),
          siguiente: sig.bottom <= innerHeight + 1 && sig.top >= 0,
        };
      });
      if (!v.veredicto || !v.siguiente) fallos.push(`${n} ${o.id}: ${JSON.stringify(v)}`);
      await page.locator('[class*="btnSiguiente"]').tap();
      if (n < 10) {
        await expect(contador(page)).toHaveText(`Pregunta ${n + 1} de 10`);
        const enVista = await page.locator('[class*="preguntaCard"]').evaluate((el) => {
          const r = el.getBoundingClientRect();
          return r.top >= 0 && r.top < innerHeight;
        });
        if (!enVista) fallos.push(`${n + 1}: el enunciado no está a la vista`);
      }
    }
    expect(fallos).toEqual([]);
    expect([...vistas].sort()).toEqual(organismosNaturaleza.filter((o) => o.nivel === 'avanzado').map((o) => o.id).sort());
    await expect(page.locator('[class*="resultadoPanel"]')).toBeFocused();
    expect(await page.locator('[class*="resultadoPanel"]').evaluate((el) => {
      const r = el.getBoundingClientRect();
      return r.top >= 0 && r.top < innerHeight;
    })).toBe(true);
    const r = await resultado(page);
    expect(r.emoji).toBe('👍');
    expect(r.titulo).toBe('Buen intento');
    expect(r.puntos).toBe('40 pts');
    expect(r.sub).toBe('5 de 10 respuestas correctas');
    expect(r.stats.Correctas).toBe('5/10');
    expect(r.stats.Acierto).toMatch(porcentaje(50));
    // Los dos botones del resultado caben en su tarjeta (botonesResultado ya tenía flex-wrap)
    const fuera = await page.evaluate(() => {
      const panel = document.querySelector('[class*="resultadoPanel"]') as HTMLElement;
      const c = panel.getBoundingClientRect();
      return [...panel.querySelectorAll('button')].filter((b) => {
        const x = b.getBoundingClientRect();
        return x.left < c.left - 1 || x.right > c.right + 1;
      }).length;
    });
    expect(fuera).toBe(0);
  });
});
