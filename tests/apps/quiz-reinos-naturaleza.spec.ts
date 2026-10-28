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
