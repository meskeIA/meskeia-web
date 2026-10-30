import { test, expect, type Page, type Locator } from '@playwright/test';
import {
  PREGUNTAS_GEOGRAFIA,
  CONFIG_DIFICULTAD_GEO,
  type PreguntaGeografia,
} from '../../data/preguntas-geografia-espana';
import { esperarPaginaAsentada } from './_hidratacion';

/**
 * Quiz Geografía de España — test de regresión del Inspector (1.ª pasada 10/10/2026)
 *
 * QUÉ PROMETE LA APP
 * ──────────────────
 * · <h1> «Quiz Geografía de España» · subtítulo «Provincias, ríos, montañas y comunidades
 *   autónomas» · insignias «75 preguntas», «3 niveles de dificultad», «6 categorías».
 * · Tres niveles: Fácil (10 preguntas, «Capitales, CCAA y ríos principales»), Medio (15,
 *   «Provincias, montañas y costas») y Difícil (20, «Geografía detallada y datos avanzados»).
 *   `CONFIG_DIFICULTAD_GEO[n].pool` dice que cada nivel sale de SU banco (25 por nivel).
 * · «Modo Aprendizaje: ves la explicación tras cada respuesta».
 * · metadata.ts: «75 preguntas verificadas … 3 dificultades, ideal para oposiciones». Bloque
 *   educativo: «Todas las preguntas están verificadas con datos del INE, IGN y fuentes oficiales».
 *
 * DE DÓNDE SALEN LOS VALORES ESPERADOS
 * ────────────────────────────────────
 * · Marcador: `porcentaje = Math.round(aciertos / preguntas.length * 100)` (page.tsx:132) y los
 *   tramos de `calcularMedalla`/`calcularTextoMedalla` (page.tsx:58-70): ≥ 90 🥇 «¡Experto en
 *   Geografía de España!» · ≥ 70 🥈 «Gran conocedor del territorio español» · ≥ 50 🥉 «Nivel
 *   intermedio» · resto 🗺️ «Sigue explorando España». Tamaños: CONFIG_DIFICULTAD_GEO (10/15/20).
 * · La CLAVE con que se juega (qué opción acierta o falla) se lee del banco
 *   `data/preguntas-geografia-espana.ts`: las partidas miden la MECÁNICA (marcador, bloqueo,
 *   reinicio, foco, vista, barajado). El contenido se contrasta aparte, en «Contenido», y solo
 *   donde la propia app se contradice (la guía, el banco, las dos FAQ) o el repositorio ancla el
 *   dato: sin red no se ha podido cotejar nada contra el IGN ni el INE.
 *
 * ALEATORIEDAD
 * ────────────
 * `mezclar()` (Fisher-Yates sobre Math.random) baraja preguntas y opciones. Cada test siembra
 * Math.random (mulberry32) con `addInitScript` antes de cargar, para que la tanda sea la misma en
 * cada corrida; aun así los casos no dependen del orden: se lee el enunciado y se pulsa según la
 * clave. En el banco la correcta está 0 veces en la A, 5 en la B, 10 en la C y 60 en la D, así
 * que la nota de «pulsar siempre la D» depende del barajado. Medido el 10/10/2026 sobre 2.200
 * respuestas (140 partidas): A 550 · B 558 · C 577 · D 515, χ² = 3,67: sano.
 */

const RUTA = '/quiz-geografia-espana/';
const POR_TEXTO = new Map(PREGUNTAS_GEOGRAFIA.map((p) => [p.pregunta, p]));
const norm = (s: string | null | undefined): string => (s ?? '').replace(/\s+/g, ' ').trim();
/** Espacio duro U+00A0, construido con su código para que se vea en el fuente. */
const DURO = String.fromCharCode(0xa0);
/** «7 de 10 preguntas correctas (70 %)», admitiendo el % pegado o tras espacio duro (su formato se vigila aparte). */
const subtituloFinal = (a: number, t: number, p: number): RegExp =>
  new RegExp(`^${a} de ${t} preguntas correctas [(]${p}${DURO}?%[)]$`);
const porcentaje = (p: number): RegExp => new RegExp(`^${p}${DURO}?%$`);
const MOVIL_UA =
  'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Mobile Safari/537.36';

type Nivel = 'Fácil' | 'Medio' | 'Difícil';

interface Apertura {
  semilla?: number;
  tema?: 'light' | 'dark';
}

/** Siembra Math.random, cierra el aviso de transparencia y espera a la página asentada. */
async function abrir(page: Page, { semilla = 20261010, tema }: Apertura = {}): Promise<void> {
  await page.addInitScript(
    ({ s0, t }) => {
      let s = s0;
      Math.random = () => {
        s = (s + 0x6d2b79f5) | 0;
        let x = Math.imul(s ^ (s >>> 15), 1 | s);
        x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x;
        return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
      };
      try {
        localStorage.setItem('meskeia_transparency_banner_dismissed', 'true');
        if (t) localStorage.setItem('meskeia-theme', t);
      } catch {
        /* sin almacenamiento: saldrá el aviso y el tema del sistema */
      }
    },
    { s0: semilla, t: tema ?? null },
  );
  // globals.css anima background-color: sin esto, un color leído justo después de responder es
  // el de mitad de la transición.
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(RUTA);
  await expect(page.locator('h1')).toHaveText('Quiz Geografía de España');
  // Sin <input>: la espera que vale es la de la página con la hidratación confirmada.
  await esperarPaginaAsentada(page);
  if (tema) await expect(page.locator('html')).toHaveAttribute('data-theme', tema);
}

async function arrancar(page: Page, nivel: Nivel): Promise<void> {
  const boton = page.getByRole('button', { name: new RegExp(`^${nivel}`) });
  await boton.click();
  await expect(boton).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: /Comenzar quiz/ }).click();
  await expect(page.locator('[class*="preguntaTexto"]')).toBeVisible();
}

const opciones = (page: Page): Locator => page.locator('[role="group"][aria-label="Opciones de respuesta"] button');
/** Segundo span de la barra de progreso: «N correctas». */
const marcador = (page: Page): Locator => page.locator('[class*="progresoInfo"] span').nth(1);

async function fichaVisible(page: Page): Promise<PreguntaGeografia> {
  const texto = norm(await page.locator('[class*="preguntaTexto"]').innerText());
  const ficha = POR_TEXTO.get(texto);
  expect(ficha, `enunciado que no está en el banco: «${texto}»`).toBeTruthy();
  return ficha as PreguntaGeografia;
}

async function textosOpcion(page: Page): Promise<string[]> {
  return (await page.locator('[class*="opcionTexto"]').allInnerTexts()).map(norm);
}

/** Responde la pregunta visible. Devuelve la ficha y la letra (A-D) en que salió la correcta. */
async function responder(page: Page, modo: 'bien' | 'mal'): Promise<{ ficha: PreguntaGeografia; letra: string }> {
  const ficha = await fichaVisible(page);
  const ops = await textosOpcion(page);
  expect(ops, 'toda pregunta ofrece 4 opciones').toHaveLength(4);
  const iC = ops.indexOf(ficha.correcta);
  expect(iC, `la correcta «${ficha.correcta}» no está entre las ofrecidas`).toBeGreaterThanOrEqual(0);
  await opciones(page).nth(modo === 'bien' ? iC : iC === 0 ? 1 : 0).click();
  await expect(page.locator('[class*="feedbackMensaje"]')).toBeVisible();
  for (let i = 0; i < 4; i++) await expect(opciones(page).nth(i)).toBeDisabled();
  return { ficha, letra: 'ABCD'[iC] };
}

async function avanzar(page: Page): Promise<string> {
  const boton = page.getByRole('button', { name: /Siguiente pregunta|Ver resultado/ });
  const rotulo = norm(await boton.innerText());
  await boton.click();
  return rotulo;
}

/** Juega hasta el final: las `aciertos` primeras bien y el resto mal. */
async function jugar(page: Page, aciertos: number): Promise<PreguntaGeografia[]> {
  const fichas: PreguntaGeografia[] = [];
  for (let n = 1; n <= 25; n++) {
    fichas.push((await responder(page, n <= aciertos ? 'bien' : 'mal')).ficha);
    if (/Ver resultado/.test(await avanzar(page))) break;
  }
  return fichas;
}

async function resultado(page: Page) {
  await expect(page.locator('[class*="finTitulo"]')).toBeVisible();
  return page.evaluate(() => {
    // Solo blancos ASCII: `\s` incluye U+00A0 y borraría el espacio duro que se vigila aparte.
    const t = (s: string): string => (document.querySelector(s)?.textContent ?? '').replace(/[ \t\n\r]+/g, ' ').trim();
    return {
      titulo: t('[class*="finTitulo"]'),
      subtitulo: t('[class*="finSubtitulo"]'),
      medalla: t('[class*="medallaIcon"]'),
      stats: Object.fromEntries(
        [...document.querySelectorAll('[class*="statCard"]')].map((c) => [
          (c.querySelector('[class*="statLabel"]')?.textContent ?? '').trim(),
          (c.querySelector('[class*="statValor"]')?.textContent ?? '').replace(/[ \t\n\r]+/g, ' ').trim(),
        ]),
      ),
      errores: document.querySelectorAll('[class*="errorItem"]').length,
    };
  });
}

/** Contraste del texto de `selector` contra su fondo efectivo; con degradado, el PEOR extremo. */
async function contraste(page: Page, selector: string): Promise<number | null> {
  return page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (!el) return null;
    const parse = (c: string) => {
      const m = (c.match(/[\d.]+/g) ?? ['0', '0', '0', '0']).map(Number);
      return { r: m[0], g: m[1], b: m[2], a: m.length > 3 ? m[3] : 1 };
    };
    type C = ReturnType<typeof parse>;
    const sobre = (a: C, b: C): C => ({ r: a.r * a.a + b.r * (1 - a.a), g: a.g * a.a + b.g * (1 - a.a), b: a.b * a.a + b.b * (1 - a.a), a: 1 });
    const lum = (c: C): number => {
      const f = (v: number) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
      return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
    };
    const capas: C[] = [];
    let degradado: C[] | null = null;
    for (let n: Element | null = el; n; n = n.parentElement) {
      const cs = getComputedStyle(n);
      if (!degradado && cs.backgroundImage.includes('gradient')) degradado = (cs.backgroundImage.match(/rgba?\([^)]+\)/g) ?? []).map(parse);
      const bg = parse(cs.backgroundColor);
      if (bg.a > 0) { capas.push(bg); if (bg.a >= 1) break; }
    }
    let base: C = { r: 255, g: 255, b: 255, a: 1 };
    if (capas.length && capas[capas.length - 1].a >= 1) base = capas.pop() as C;
    for (let i = capas.length - 1; i >= 0; i--) base = sobre(capas[i], base);
    let fg = parse(getComputedStyle(el).color);
    if (fg.a < 1) fg = sobre(fg, base);
    const ratio = (x: C, y: C) => { const a = lum(x), b = lum(y); return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05); };
    return Math.min(...(degradado ?? [base]).map((f) => ratio(fg, f)));
  }, selector);
}

// ─────────────────────────────────────────────────────────────────────────────

test.describe('Quiz Geografía de España · partida', () => {
  /**
   * CASO NORMAL — Fácil, 7 bien y 3 mal.
   * Esperado a mano: 10 preguntas (CONFIG facil = 10, banco fácil = 25), distintas y todas
   * «facil»; 7/10 = 70 % → tramo ≥ 70 → 🥈 «Gran conocedor del territorio español»;
   * estadísticas 7 · 3 · 70 % · 10; tres fichas en «Preguntas que has fallado».
   */
  test('caso normal: 7 aciertos de 10 en Fácil dan 70 % y «Gran conocedor del territorio español»', async ({ page }) => {
    test.setTimeout(90_000);
    await abrir(page, { semilla: 2 });
    await arrancar(page, 'Fácil');
    await expect(page.locator('[class*="progresoInfo"]')).toContainText('Pregunta 1 de 10');
    const fichas = await jugar(page, 7);
    expect(fichas).toHaveLength(10);
    expect(new Set(fichas.map((f) => f.id)).size, 'pregunta repetida en la misma partida').toBe(10);
    expect(fichas.every((f) => f.dificultad === 'facil'), 'Fácil ha colado otro nivel').toBe(true);

    const r = await resultado(page);
    expect(r.titulo).toBe('Gran conocedor del territorio español');
    expect(r.medalla).toBe('🥈');
    expect(r.subtitulo).toMatch(subtituloFinal(7, 10, 70));
    expect(r.stats.Correctas).toBe('7');
    expect(r.stats.Errores).toBe('3');
    expect(r.stats['Puntuación']).toMatch(porcentaje(70));
    expect(r.stats.Jugadas).toBe('10');
    expect(r.errores).toBe(3);
  });

  /**
   * CASO NORMAL — Medio, 11 bien y 4 mal.
   * Esperado a mano: 15 preguntas «medio»; 11/15 = 0,7333 → Math.round(73,33) = 73 % → tramo ≥ 70
   * → 🥈 «Gran conocedor del territorio español»; estadísticas 11 · 4 · 73 % · 15; 4 fallos.
   */
  test('caso normal: 11 de 15 en Medio dan 73 % y «Gran conocedor del territorio español»', async ({ page }) => {
    test.setTimeout(90_000);
    await abrir(page, { semilla: 4 });
    await arrancar(page, 'Medio');
    const fichas = await jugar(page, 11);
    expect(fichas).toHaveLength(15);
    expect(fichas.every((f) => f.dificultad === 'medio'), 'Medio ha colado otro nivel').toBe(true);
    const r = await resultado(page);
    expect(r.titulo).toBe('Gran conocedor del territorio español');
    expect(r.medalla).toBe('🥈');
    expect(r.subtitulo).toMatch(subtituloFinal(11, 15, 73));
    expect(r.stats.Errores).toBe('4');
    expect(r.errores).toBe(4);
  });

  /**
   * CASO LÍMITE — cero aciertos en Fácil y pleno en Medio.
   * Esperado a mano: 0/10 → 0 % → 🗺️ «Sigue explorando España», 10 fichas falladas; 15/15 →
   * 100 % → 🥇 «¡Experto en Geografía de España!», sin sección de fallos.
   */
  test('caso límite: 0 de 10 da «Sigue explorando España» y 15 de 15 da «¡Experto en Geografía de España!»', async ({ page }) => {
    test.setTimeout(120_000);
    await abrir(page, { semilla: 6 });
    await arrancar(page, 'Fácil');
    await jugar(page, 0);
    let r = await resultado(page);
    expect(r.titulo).toBe('Sigue explorando España');
    expect(r.medalla).toBe('🗺️');
    expect(r.subtitulo).toMatch(subtituloFinal(0, 10, 0));
    expect(r.stats.Correctas).toBe('0');
    expect(r.stats.Errores).toBe('10');
    expect(r.errores).toBe(10);

    await page.getByRole('button', { name: 'Cambiar dificultad' }).click();
    await arrancar(page, 'Medio');
    const fichas = await jugar(page, 99);
    expect(fichas).toHaveLength(15);
    r = await resultado(page);
    expect(r.titulo).toBe('¡Experto en Geografía de España!');
    expect(r.medalla).toBe('🥇');
    expect(r.subtitulo).toMatch(subtituloFinal(15, 15, 100));
    expect(r.stats.Errores).toBe('0');
    await expect(page.locator('[class*="erroresSection"]')).toHaveCount(0);
  });

  /**
   * CASO LÍMITE — los umbrales exactos. 5/10 = 50 % cae en el tramo ≥ 50 → 🥉 «Nivel
   * intermedio»; 9/10 = 90 % cae en el tramo ≥ 90 → 🥇 «¡Experto en Geografía de España!».
   */
  test('caso límite: 5 de 10 (50 %) es «Nivel intermedio» y 9 de 10 (90 %) ya es «¡Experto…!»', async ({ page }) => {
    test.setTimeout(120_000);
    await abrir(page, { semilla: 8 });
    await arrancar(page, 'Fácil');
    await jugar(page, 5);
    let r = await resultado(page);
    expect(r.titulo).toBe('Nivel intermedio');
    expect(r.medalla).toBe('🥉');
    expect(r.subtitulo).toMatch(subtituloFinal(5, 10, 50));
    await page.getByRole('button', { name: 'Jugar de nuevo' }).click();
    await expect(page.locator('[class*="progresoInfo"]')).toContainText('Pregunta 1 de 10');
    await jugar(page, 9);
    r = await resultado(page);
    expect(r.titulo).toBe('¡Experto en Geografía de España!');
    expect(r.medalla).toBe('🥇');
    expect(r.subtitulo).toMatch(subtituloFinal(9, 10, 90));
  });

  /**
   * LO QUE NO DEBE OCURRIR — avanzar sin contestar, contestar dos veces y que «Jugar de nuevo»
   * recargue o arrastre el marcador.
   * Esperado a mano: antes de responder no existe «Siguiente» (page.tsx:254 solo lo pinta en
   * fase «respondida»); `responder` sale por `fase !== 'jugando'` y las opciones quedan disabled →
   * un doble clic en la correcta y un clic tardío en otra dejan 1 acierto, no 2, y la otra NO se
   * marca como fallada; «Jugar de nuevo» no recarga (conserva una marca en window) y pone el
   * marcador a 0.
   */
  test('caso de rechazo: sin «Siguiente» antes de responder, el doble clic no puntúa doble y «Jugar de nuevo» no recarga', async ({ page }) => {
    test.setTimeout(120_000);
    await abrir(page, { semilla: 3 });
    await page.evaluate(() => { (window as unknown as { __marca: string }).__marca = 'sin-recarga'; });
    await arrancar(page, 'Fácil');
    await expect(page.getByRole('button', { name: /Siguiente pregunta|Ver resultado/ })).toHaveCount(0);

    const ficha = await fichaVisible(page);
    const iC = (await textosOpcion(page)).indexOf(ficha.correcta);
    await opciones(page).nth(iC).dblclick();
    await opciones(page).nth(iC === 0 ? 1 : 0).click({ force: true });
    await expect(page.locator('[class*="feedbackMensaje"]')).toContainText('¡Correcto!');
    const clases = await opciones(page).evaluateAll((bs) => bs.map((b) => b.className));
    expect(clases.filter((c) => /opcion-correcta/.test(c))).toHaveLength(1);
    expect(clases.filter((c) => /opcion-seleccionada-mal/.test(c)), 'el clic tardío ha marcado otra opción').toHaveLength(0);
    await expect(marcador(page)).toHaveText(/^1 correctas?$/);

    await avanzar(page);
    await jugar(page, 0);
    const r = await resultado(page);
    expect(r.subtitulo).toMatch(subtituloFinal(1, 10, 10)); // 1 acierto pese a los 3 clics
    expect(r.stats.Correctas).toBe('1');

    await page.getByRole('button', { name: 'Jugar de nuevo' }).click();
    await expect(page.locator('[class*="progresoInfo"]')).toContainText('Pregunta 1 de 10');
    await expect(marcador(page)).toHaveText('0 correctas');
    expect(await page.evaluate(() => (window as unknown as { __marca?: string }).__marca)).toBe('sin-recarga');
  });

  /**
   * BARAJADO — ¿sacaría nota «pulsar siempre la A»? En el banco la correcta está 60 de 75 veces
   * en la D, así que todo depende de `mezclar()`. 40 partidas Medio dentro de la página = 600
   * respuestas; con reparto uniforme el χ² (3 g. l.) supera 16,27 solo 1 de cada 1.000 veces.
   * Medido el 10/10/2026: χ² = 3,67 sobre 2.200 respuestas.
   */
  test('barajado: la correcta se reparte entre A, B, C y D (χ² < 16,27) y «siempre A» no aprueba', async ({ page }) => {
    test.setTimeout(120_000);
    await abrir(page, { semilla: 12 });
    const banco = PREGUNTAS_GEOGRAFIA.map((p) => ({ pregunta: p.pregunta, correcta: p.correcta }));
    const r = await page.evaluate(async (claves) => {
      const mapa = new Map(claves.map((p) => [p.pregunta, p.correcta]));
      const tick = () => new Promise<void>((res) => setTimeout(res, 0));
      const botones = () => [...document.querySelectorAll('button')];
      const boton = (re: RegExp) => botones().find((b) => re.test((b.textContent ?? '').trim())) as HTMLButtonElement;
      const letras: Record<string, number> = { A: 0, B: 0, C: 0, D: 0 };
      let aciertosA = 0;
      let total = 0;
      for (let p = 0; p < 40; p++) {
        if (p === 0) {
          boton(/^\S*\s*Medio/).click();
          await tick();
          boton(/Comenzar quiz/).click();
        } else boton(/^Jugar de nuevo$/).click();
        await tick();
        for (let n = 0; n < 20; n++) {
          const texto = (document.querySelector('[class*="preguntaTexto"]')?.textContent ?? '').replace(/\s+/g, ' ').trim();
          const ops = [...document.querySelectorAll('[class*="opcionTexto"]')].map((e) => (e.textContent ?? '').trim());
          const i = ops.indexOf(mapa.get(texto) ?? '');
          if (i >= 0) letras['ABCD'[i]]++;
          if (i === 0) aciertosA++;
          total++;
          (document.querySelectorAll('[role="group"] button')[0] as HTMLButtonElement).click();
          await tick();
          const sig = boton(/Siguiente pregunta|Ver resultado/);
          const fin = /Ver resultado/.test(sig.textContent ?? '');
          sig.click();
          await tick();
          if (fin) break;
        }
      }
      return { letras, aciertosA, total };
    }, banco);
    expect(r.total).toBe(600); // 40 partidas × 15
    const n = Object.values(r.letras).reduce((a, b) => a + b, 0);
    expect(n, 'enunciados que no casan con el banco').toBe(600);
    const chi2 = Object.values(r.letras).reduce((s, o) => s + (o - n / 4) ** 2 / (n / 4), 0);
    expect(chi2, `reparto de la correcta ${JSON.stringify(r.letras)}`).toBeLessThan(16.27);
    // «Siempre A»: lo esperable es un 25 %; por encima del 35 % sobre 600 (z > 5) sería sesgo.
    expect(r.aciertosA / r.total).toBeLessThan(0.35);
  });

  test('sano · en oscuro el verde de la correcta y el rojo de la fallada no los pisa ninguna regla genérica', async ({ page }) => {
    // Forma (e) de la familia: medido el 10/10/2026, borde rgb(52, 211, 153) y rgb(248, 113, 113)
    // frente al rgb(64, 64, 64) de la neutra.
    await abrir(page, { semilla: 5, tema: 'dark' });
    await arrancar(page, 'Fácil');
    const ficha = await fichaVisible(page);
    const ops = await textosOpcion(page);
    const iC = ops.indexOf(ficha.correcta);
    const iM = iC === 0 ? 1 : 0;
    const iN = [0, 1, 2, 3].find((i) => i !== iC && i !== iM) as number;
    await opciones(page).nth(iM).click();
    await page.mouse.move(0, 0);
    const bordes = () =>
      opciones(page).evaluateAll((bs, [c, m, n]) => [c, m, n].map((i) => getComputedStyle(bs[i]).borderTopColor), [iC, iM, iN]);
    // correcta · fallada · neutra (con poll: la transición de 0,2 s puede seguir en curso)
    await expect.poll(bordes).toEqual(['rgb(52, 211, 153)', 'rgb(248, 113, 113)', 'rgb(64, 64, 64)']);
  });

  test('sano · ningún aria-label de la partida delata la respuesta', async ({ page }) => {
    await abrir(page, { semilla: 9 });
    await arrancar(page, 'Fácil');
    const ficha = await fichaVisible(page);
    const etiquetas = await page.locator('[class*="quizPanel"] [aria-label]').evaluateAll((els) => els.map((e) => e.getAttribute('aria-label') ?? ''));
    expect(etiquetas.filter((t) => t.includes(ficha.correcta))).toEqual([]);
  });
});

// ─────────────────────────────────────────────────────────────────────────────

test.describe('Inspector 10/10/2026 · hallazgos de la partida', () => {
  test('hallazgo · «Difícil» saca sus 20 preguntas del nivel difícil', async ({ page }) => {
    // REPARADO el 19/10/2026 (3213): cada nivel saca sus preguntas de BANCO_POR_NIVEL[cfg.pool].
    // Antes Difícil barajaba el banco ENTERO (25 fácil + 25 medio + 25 difícil) aunque
    // CONFIG_DIFICULTAD_GEO.dificil.pool = 'dificil'. Esperado a mano: 20 de 20 difíciles; con el
    // banco entero, 20·25/75 = 6,7 por partida. Medido el 10/10/2026: 392 difíciles de 1.200
    // (60 partidas), media 6,5, máximo 11; ninguna partida con 20.
    test.setTimeout(90_000);
    await abrir(page, { semilla: 13 });
    await arrancar(page, 'Difícil');
    const fichas = await jugar(page, 99);
    expect(fichas).toHaveLength(20);
    expect(fichas.filter((f) => f.dificultad !== 'dificil').map((f) => f.id), 'preguntas de otro nivel en «Difícil»').toEqual([]);
  });

  test('hallazgo · el marcador dice «1 correcta», no «1 correctas»', async ({ page }) => {
    // REPARADO el 20/10/2026 (3225), como la gemela quiz-historia-espana.
    await abrir(page, { semilla: 3 });
    await arrancar(page, 'Fácil');
    await responder(page, 'bien');
    await expect(marcador(page)).toHaveText('1 correcta', { timeout: 2000 });
  });

  test('hallazgo · el porcentaje va separado con espacio duro («70 %»)', async ({ page }) => {
    // Visto por el inspector el 10/10/2026, hoy REPARADO. Regla de formato del 25/09/2026
    // (Ortografía RAE 2010): page.tsx:277 y :289 pegaban el «%». 7/10 → «7 de 10 preguntas correctas (70 %)» y «70 %».
    // REPARADO el 20/10/2026 (3226) con formatPercentage, como la gemela.
    test.setTimeout(90_000);
    await abrir(page, { semilla: 2 });
    await arrancar(page, 'Fácil');
    await jugar(page, 7);
    const r = await resultado(page);
    expect(r.subtitulo).toBe(`7 de 10 preguntas correctas (70${DURO}%)`);
    expect(r.stats['Puntuación']).toBe(`70${DURO}%`);
  });

  test('hallazgo · el foco no cae a <body> al empezar, al responder, al pasar de pregunta ni al volver', async ({ page }) => {
    // REPARADO el 19/10/2026 (3216) con la receta de la gemela: enunciado h2 con tabIndex −1,
    // «Siguiente», título del resultado y «Comenzar quiz». Antes «Comenzar quiz» se desmontaba,
    // la opción pulsada quedaba disabled, «Siguiente» se desmontaba y «Jugar de nuevo»/«Cambiar
    // dificultad» también: en los cinco casos el foco iba a <body> (medido el 10/10/2026).
    test.setTimeout(90_000);
    const enBody = () => page.evaluate(() => document.activeElement === document.body || document.activeElement === null);
    await abrir(page, { semilla: 1 });
    await page.getByRole('button', { name: /^Fácil/ }).click();
    await page.getByRole('button', { name: /Comenzar quiz/ }).focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('[class*="preguntaTexto"]')).toBeVisible();
    const tras: string[] = [];
    if (await enBody()) tras.push('Comenzar');
    const ficha = await fichaVisible(page);
    await opciones(page).nth((await textosOpcion(page)).indexOf(ficha.correcta)).focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('[class*="feedbackMensaje"]')).toBeVisible();
    if (await enBody()) tras.push('responder');
    await page.getByRole('button', { name: /Siguiente pregunta/ }).focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('[class*="progresoInfo"]')).toContainText('Pregunta 2 de 10');
    if (await enBody()) tras.push('Siguiente');
    await jugar(page, 0);
    await page.getByRole('button', { name: 'Cambiar dificultad' }).focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('[class*="inicioPanel"]')).toBeVisible();
    if (await enBody()) tras.push('Cambiar dificultad');
    expect(tras, 'acciones tras las que el foco acaba en <body>').toEqual([]);
  });

  test('hallazgo · la región viva solo abarca el veredicto y la explicación, no el botón', async ({ page }) => {
    // Visto por el inspector el 10/10/2026, hoy REPARADO. page.tsx:255 — role="alert" (con
    // aria-live="polite", que se contradicen) envolvía el panel entero, botón «Siguiente
    // pregunta →» incluido, y nacía ya con contenido. Medido: región role=alert con 1 botón y texto «¡Correcto!…Siguiente pregunta →».
    // REPARADO el 20/10/2026 (3218) con la receta del 2108 de la gemela.
    await abrir(page, { semilla: 3 });
    await arrancar(page, 'Fácil');
    await responder(page, 'bien');
    const regiones = await page.evaluate(() =>
      [...document.querySelectorAll('[aria-live], [role="alert"], [role="status"]')]
        .filter((r) => r.id !== '__next-route-announcer__' && r.closest('[class*="quizPanel"]'))
        .map((r) => ({ role: r.getAttribute('role'), botones: r.querySelectorAll('button').length })),
    );
    expect(regiones.length, 'no hay región viva en el panel').toBeGreaterThan(0);
    expect(regiones.filter((r) => r.botones > 0), `regiones con botón dentro: ${JSON.stringify(regiones)}`).toEqual([]);
    expect(regiones.filter((r) => r.role === 'alert'), 'role="alert" con aria-live="polite" se contradicen').toEqual([]);
  });

  test('hallazgo · «Comenzar quiz» no lleva el ▶ en su nombre accesible', async ({ page }) => {
    // Visto por el inspector el 10/10/2026: page.tsx:199 — «Comenzar quiz ▶» sin aria-hidden;
    // medido el nombre accesible «Comenzar quiz ▶». REPARADO el 20/10/2026 (3219).
    await abrir(page);
    await expect(page.getByRole('button', { name: 'Comenzar quiz', exact: true })).toHaveCount(1, { timeout: 2000 });
  });
});

// ─────────────────────────────────────────────────────────────────────────────

/** Coloca el centro del control a una fracción de la altura de la ventana (si la página lo permite). */
async function colocar(page: Page, loc: Locator, frac: number): Promise<{ x: number; y: number }> {
  await loc.evaluate((e, f) => {
    const r = e.getBoundingClientRect();
    window.scrollBy(0, r.top + r.height / 2 - innerHeight * f);
  }, frac);
  await page.waitForTimeout(60);
  const b = await loc.boundingBox();
  if (!b) throw new Error('el control no tiene caja');
  return { x: b.x + b.width / 2, y: b.y + b.height / 2 };
}

/** Desplaza lo justo para que `loc` se vea entero bajo la barra del logo: lo que haría un dedo. */
async function bajarLoJusto(loc: Locator): Promise<void> {
  await loc.evaluate((el) => {
    const r = el.getBoundingClientRect();
    const barra = (document.querySelector('[class*="headerBar"]') as Element).getBoundingClientRect().bottom;
    if (r.bottom > innerHeight - 8) scrollBy(0, r.bottom - innerHeight + 8);
    else if (r.top < barra + 4) scrollBy(0, r.top - barra - 4);
  });
}

async function tocarCentro(page: Page, loc: Locator): Promise<void> {
  await bajarLoJusto(loc);
  const b = await loc.boundingBox();
  if (!b) throw new Error('el control no tiene caja');
  await page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2);
}

type Doble = (page: Page, x: number, y: number) => Promise<void>;
type Elegir = (page: Page, opcion: Locator) => Promise<void>;

/** Doble clic a ritmo humano: el 2.º (detail = 2) llega 150 ms después, en el mismo punto. */
const dobleClic: Doble = async (page, x, y) => {
  await page.mouse.click(x, y);
  await page.waitForTimeout(150);
  // No `click({ clickCount: 2 })`, que manda DOS clics más.
  await page.mouse.down({ clickCount: 2 });
  await page.mouse.up({ clickCount: 2 });
  await page.waitForTimeout(150);
};
const dobleToque: Doble = async (page, x, y) => {
  await page.touchscreen.tap(x, y);
  await page.waitForTimeout(150);
  await page.touchscreen.tap(x, y);
  await page.waitForTimeout(150);
};
const clicar: Elegir = async (page, opcion) => {
  await bajarLoJusto(opcion);
  await opcion.click();
};
const tocar: Elegir = async (page, opcion) => tocarCentro(page, opcion);

/**
 * Empieza (Fácil) con un doble clic o dos toques con el botón a la altura `frac` de la ventana y
 * recorre la partida avanzando igual, fallando con la opción más baja. La respuesta se da tras
 * LEER la pregunta (500 ms, más que la ventana de ráfaga del navegador): sin esa pausa el toque
 * que responde sería el 3.º de la misma ráfaga, que no es lo que se mide. Devuelve cada vez que el
 * segundo toque contestó la pregunta nueva, sacó de la partida o se llevó la nota.
 */
async function segundosQueActuan(page: Page, frac: number, doble: Doble, elegir: Elegir, semilla: number): Promise<string[]> {
  const mal: string[] = [];
  await abrir(page, { semilla });
  await page.getByRole('button', { name: /^Fácil/ }).click();
  const estado = () =>
    page.evaluate(() => {
      const ops = [...document.querySelectorAll('[role="group"][aria-label="Opciones de respuesta"] button')] as HTMLButtonElement[];
      return {
        ruta: location.pathname,
        opciones: ops.length,
        bloqueadas: ops.filter((b) => b.disabled).length,
        progreso: (document.querySelector('[class*="progresoInfo"] span')?.textContent ?? '').trim(),
        fin: Boolean(document.querySelector('[class*="finTitulo"]')),
        inicio: Boolean(document.querySelector('[class*="inicioPanel"]')),
      };
    });
  let p = await colocar(page, page.getByRole('button', { name: /Comenzar quiz/ }), frac);
  await doble(page, p.x, p.y);
  let e = await estado();
  if (e.ruta !== RUTA) return [`y=${Math.round(p.y)} «Comenzar»: navega a ${e.ruta}`];
  if (e.inicio) mal.push(`y=${Math.round(p.y)} «Comenzar»: vuelve a la selección`);
  else if (e.bloqueadas > 0) mal.push(`y=${Math.round(p.y)} «Comenzar»: la ${e.progreso} sale ya respondida`);
  for (let n = 1; n <= 12 && e.opciones > 0; n++) {
    if (e.bloqueadas === 0) {
      const ficha = await fichaVisible(page);
      const iC = (await textosOpcion(page)).indexOf(ficha.correcta);
      await page.waitForTimeout(500); // lee la pregunta
      await elegir(page, opciones(page).nth(iC === 3 ? 2 : 3));
      await expect(page.locator('[class*="feedbackMensaje"]')).toBeVisible();
      // Lee el veredicto: desde 3822 (30/10/2026) un toque en el MISMO punto dentro de la ventana de
      // ráfaga del que contestó se ignora (useGuardaRafaga, `soloMismoPunto`), que es lo que impide
      // saltarse la explicación. Sin esta pausa, el 1.º toque en «Siguiente» sería ese 2.º toque.
      await page.waitForTimeout(500);
    }
    const sig = page.getByRole('button', { name: /Siguiente pregunta|Ver resultado/ });
    const ultimo = /Ver resultado/.test(await sig.innerText());
    const antes = e.progreso;
    p = await colocar(page, sig, frac);
    await doble(page, p.x, p.y);
    e = await estado();
    if (e.ruta !== RUTA) {
      mal.push(`y=${Math.round(p.y)} «${ultimo ? 'Ver resultado' : 'Siguiente'}» (${antes}): navega a ${e.ruta}`);
      break;
    }
    if (ultimo) {
      if (!e.fin) mal.push(`y=${Math.round(p.y)} «Ver resultado»: la nota no llega a verse (${e.inicio ? 'vuelve a la selección' : e.progreso})`);
      break;
    }
    if (e.inicio) mal.push(`y=${Math.round(p.y)} «Siguiente» (${antes}): vuelve a la selección`);
    else if (e.bloqueadas > 0) mal.push(`y=${Math.round(p.y)} «Siguiente» (${antes}): la ${e.progreso} sale ya respondida`);
  }
  return mal;
}

test.describe('Inspector 10/10/2026 · doble clic en escritorio 1280 × 800', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  /**
   * HALLAZGO (C0082/C0140) — un doble clic en «Ver resultado» se come la nota: el primer clic
   * pinta el resultado y el segundo cae, en el mismo punto, sobre «Cambiar dificultad». Medido el
   * 10/10/2026 con el botón a 280, 480 y 720 px: 2 de 3 (con `dblclick()` en ráfaga, igual); en
   * «Comenzar» 0 de 3 y en «Siguiente» 0 de 27 (el 2.º clic abre o cierra la guía educativa).
   * Esperado: un doble clic es una sola intención y el resultado queda a la vista.
   */
  test('hallazgo · un doble clic en «Ver resultado» no lleva a «Cambiar dificultad» antes de ver la nota', async ({ page }) => {
    // REPARADO el 19/10/2026 (3214): guarda de ráfaga en captura sobre window.
    test.setTimeout(180_000);
    const mal: string[] = [];
    for (const frac of [0.35, 0.6]) mal.push(...(await segundosQueActuan(page, frac, dobleClic, clicar, Math.round(frac * 100) + 1280)));
    expect(mal).toEqual([]);
  });
});

/**
 * Móvil de 360 px (forma (b) de la familia). Medido el 10/10/2026, fallando con la opción más
 * baja: la barra fija del logo ocupa y = 0…62; tras «Comenzar quiz» «Pregunta 1 de 10» queda en
 * y = 19…41 (bajo la barra) y tras cada «Siguiente» el contador en y = −79…−57 y el enunciado en
 * 46…72 (Fácil) o entre −44 y 11 (Difícil, 20 de 20 transiciones); tras «Ver resultado» el título
 * del resultado queda a −607 px (Fácil) o −1.646 px (Difícil): la nota no se ve.
 */
test.describe('Inspector 10/10/2026 · móvil 360 × 740', () => {
  test.use({
    viewport: { width: 360, height: 740 },
    userAgent: MOVIL_UA,
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  });

  test('hallazgo · tras «Comenzar», «Siguiente» y «Ver resultado» lo nuevo queda a la vista y no bajo la barra', async ({ page }) => {
    // REPARADO el 19/10/2026 (3215): traerALaVista en cada transición, como la gemela.
    test.setTimeout(120_000);
    const tapadas = (): Promise<string[]> =>
      page.evaluate(() => {
        const tapa = (document.querySelector('[class*="headerBar"]') as Element).getBoundingClientRect();
        const fuera: string[] = [];
        for (const clase of ['progresoInfo', 'preguntaTexto', 'finTitulo']) {
          const el = document.querySelector(`[class*="${clase}"]`);
          if (!el) continue;
          const rango = document.createRange();
          rango.selectNodeContents(el);
          for (const l of rango.getClientRects()) {
            if (l.top < 0 || l.bottom > innerHeight || (l.top < tapa.bottom && l.bottom > tapa.top)) fuera.push(`${clase} ${Math.round(l.top)}…${Math.round(l.bottom)}`);
          }
        }
        return [...new Set(fuera)];
      });
    await abrir(page, { semilla: 77 });
    await tocarCentro(page, page.getByRole('button', { name: /^Fácil/ }));
    await tocarCentro(page, page.getByRole('button', { name: /Comenzar quiz/ }));
    await expect(page.locator('[class*="preguntaTexto"]')).toBeVisible();
    const malas: string[] = [];
    let t = await tapadas();
    if (t.length) malas.push(`Comenzar: ${t.join(' · ')}`);
    for (let n = 1; n <= 10; n++) {
      const ficha = await fichaVisible(page);
      const iC = (await textosOpcion(page)).indexOf(ficha.correcta);
      await page.waitForTimeout(500); // lee la pregunta: fuera de la ventana de ráfaga
      await tocarCentro(page, opciones(page).nth(iC === 3 ? 2 : 3)); // la más baja: obliga a bajar
      await expect(page.locator('[class*="feedbackMensaje"]')).toBeVisible();
      await tocarCentro(page, page.getByRole('button', { name: /Siguiente pregunta|Ver resultado/ }));
      if (n < 10) await expect(page.locator('[class*="progresoInfo"]')).toContainText(`Pregunta ${n + 1} de 10`);
      else await expect(page.locator('[class*="finTitulo"]')).toBeAttached();
      await page.waitForTimeout(200);
      t = await tapadas();
      if (t.length) malas.push(`${n < 10 ? `tras la ${n}` : 'Ver resultado'}: ${t.join(' · ')}`);
    }
    expect(malas).toEqual([]);
  });

  /**
   * HALLAZGO (C0082/C0140) — dos toques. Medido el 10/10/2026 a 360 × 740 con el botón a 259,
   * 444 y 666 px: en «Comenzar» 3 de 3 contestaron la pregunta 1 (el 2.º toque cae en la opción D
   * de la pregunta recién pintada); en «Ver resultado» 2 de 2 cayeron en «Cambiar dificultad» y la
   * nota no llegó a verse; y en «Siguiente» 1 de 25 cayó en «Ir a Quiz Historia de España» de las
   * relacionadas y sacó de la página a mitad de partida.
   */
  test('hallazgo · dos toques en «Comenzar» o «Ver resultado» no contestan solos ni se comen la nota', async ({ page }) => {
    // REPARADO el 19/10/2026 (3214): guarda de ráfaga en captura sobre window.
    test.setTimeout(180_000);
    const mal: string[] = [];
    for (const frac of [0.35, 0.6]) mal.push(...(await segundosQueActuan(page, frac, dobleToque, tocar, Math.round(frac * 100) + 360)));
    expect(mal).toEqual([]);
  });
});

test.describe('Inspector 10/10/2026 · móvil 390 × 844', () => {
  test.use({
    viewport: { width: 390, height: 844 },
    userAgent: MOVIL_UA,
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  });

  /** Medido el 10/10/2026: «Comenzar» 2 de 3, «Ver resultado» 2 de 2, «Siguiente» 1 de 26 (sale a otra app). */
  test('hallazgo · dos toques en «Comenzar» o «Ver resultado» no contestan solos ni se comen la nota', async ({ page }) => {
    // REPARADO el 19/10/2026 (3214): guarda de ráfaga en captura sobre window.
    test.setTimeout(180_000);
    const mal: string[] = [];
    for (const frac of [0.35, 0.6]) mal.push(...(await segundosQueActuan(page, frac, dobleToque, tocar, Math.round(frac * 100) + 390)));
    expect(mal).toEqual([]);
  });
});

// ─────────────────────────────────────────────────────────────────────────────

test.describe('Inspector 10/10/2026 · contraste', () => {
  for (const tema of ['light', 'dark'] as const) {
    test(`hallazgo · botones de acción y textos de estado con 4,5:1 (${tema === 'light' ? 'claro' : 'oscuro'})`, async ({ page }) => {
      // REPARADO el 19/10/2026 (3217), con la receta de la gemela (2106/2107): el módulo ya no
      // redeclara --primary/--secondary (los botones toman --primary-boton/--secondary-boton) y los
      // textos de estado van con --texto-ok/-fail/-warn. Antes, blanco sobre el degradado
      // #2E86AB→#48A9A6 de «Comenzar», «Siguiente», «Jugar de nuevo» y el número de paso: 2,80:1
      // en el extremo teal. Medido en claro: insignia de categoría 3,56 · letra blanca sobre
      // verde 2,54 / rojo 3,76 · «Preguntas que has fallado» 3,61 · pregunta fallada 3,30 ·
      // respuesta buena 2,22 · h3 del FAQ 4,11 · h2 del aviso 1,88. En oscuro: insignia 3,06 ·
      // letra sobre verde 1,92 / rojo 2,77 · h3 del FAQ 3,50.
      test.setTimeout(90_000);
      await abrir(page, { semilla: 5, tema });
      const fallos: string[] = [];
      const medir = async (nombre: string, sel: string) => {
        const r = await contraste(page, sel);
        if (r !== null && r < 4.5) fallos.push(`${nombre} ${r.toFixed(2)}`);
      };
      await medir('Comenzar quiz', '[class*="btnIniciar"]');
      await arrancar(page, 'Fácil');
      await medir('insignia de categoría', '[class*="categoriaBadge"]');
      const ficha = await fichaVisible(page);
      const ops = await textosOpcion(page);
      const iC = ops.indexOf(ficha.correcta);
      const iM = iC === 0 ? 1 : 0;
      await opciones(page).nth(iM).click();
      await page.mouse.move(0, 0);
      await expect.poll(() => opciones(page).nth(iC).evaluate((b) => /opcion-correcta/.test(b.className))).toBe(true);
      await opciones(page).nth(iC).locator('[class*="opcionLetra"]').evaluate((e) => { e.id = 'letra-ok'; });
      await opciones(page).nth(iM).locator('[class*="opcionLetra"]').evaluate((e) => { e.id = 'letra-mal'; });
      // La letra pasa del gris al verde/rojo con la transición `all 0.2s` de .opcionBtn: medida al
      // instante da el gris de partida (1,26:1). Se espera a que deje de ser el de una neutra.
      const iN = [0, 1, 2, 3].find((i) => i !== iC && i !== iM) as number;
      await opciones(page).nth(iN).locator('[class*="opcionLetra"]').evaluate((e) => { e.id = 'letra-neutra'; });
      await expect
        .poll(() =>
          page.evaluate(() => {
            const bg = (id: string) => getComputedStyle(document.getElementById(id) as Element).backgroundColor;
            const neutra = bg('letra-neutra');
            return bg('letra-ok') !== neutra && bg('letra-mal') !== neutra;
          }),
        )
        .toBe(true);
      await page.waitForTimeout(250);
      await medir('letra sobre verde', '#letra-ok');
      await medir('letra sobre rojo', '#letra-mal');
      await medir('Siguiente', '[class*="btnSiguiente"]');
      await avanzar(page);
      await jugar(page, 0);
      await medir('pregunta fallada', '[class*="errorPregunta"]');
      await medir('respuesta buena en la lista', '[class*="errorCorrecta"]');
      await medir('«Preguntas que has fallado»', '[class*="erroresTitulo"]');
      await medir('Jugar de nuevo', '[class*="finBotones"] [class*="btnIniciar"]');
      await page.getByRole('button', { name: /Ver guía educativa/ }).click();
      await medir('h3 del FAQ', '[class*="faqItem"] h3');
      await medir('número de paso', '[class*="stepNum"]');
      await medir('h2 del aviso', '[class*="warningBox"] h2');
      expect(fallos).toEqual([]);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────

/** Preguntas y respuestas del FAQPage servido (lo que leen buscadores y asistentes de IA). */
async function faqServida(page: Page): Promise<Record<string, string>> {
  return page.evaluate(() => {
    const salida: Record<string, string> = {};
    for (const s of document.querySelectorAll('script[type="application/ld+json"]')) {
      const datos = JSON.parse(s.textContent ?? '{}') as { '@type'?: string; mainEntity?: { name: string; acceptedAnswer: { text: string } }[] };
      if (datos['@type'] !== 'FAQPage') continue;
      for (const q of datos.mainEntity ?? []) salida[q.name] = q.acceptedAnswer.text;
    }
    return salida;
  });
}

/** Preguntas y respuestas de la FAQ visible de la guía (presentes en el DOM aunque esté plegada). */
async function faqVisible(page: Page): Promise<Record<string, string>> {
  return page.evaluate(() =>
    Object.fromEntries(
      [...document.querySelectorAll('[class*="faqItem"]')].map((i) => [
        (i.querySelector('h3')?.textContent ?? '').trim(),
        (i.querySelector('p')?.textContent ?? '').replace(/\s+/g, ' ').trim(),
      ]),
    ),
  );
}

const fichaDe = (re: RegExp): PreguntaGeografia => {
  const p = PREGUNTAS_GEOGRAFIA.find((q) => re.test(q.pregunta));
  if (!p) throw new Error(`no hay ninguna pregunta que case con ${re}`);
  return p;
};

test.describe('Inspector 10/10/2026 · contenido', () => {
  test('sano · el banco tiene las 75 preguntas, los 6 temas y los tamaños de nivel que anuncia la pantalla', async ({ page }) => {
    expect(PREGUNTAS_GEOGRAFIA).toHaveLength(75);
    for (const d of ['facil', 'medio', 'dificil'] as const) expect(PREGUNTAS_GEOGRAFIA.filter((p) => p.dificultad === d), d).toHaveLength(25);
    for (const p of PREGUNTAS_GEOGRAFIA) {
      expect(new Set(p.opciones).size, `id ${p.id}`).toBe(4);
      expect(p.opciones, `id ${p.id}`).toContain(p.correcta);
    }
    const temas = new Set(PREGUNTAS_GEOGRAFIA.map((p) => p.categoria)).size;
    await abrir(page);
    await expect(page.locator('[class*="heroBadges"] span')).toHaveText([`${PREGUNTAS_GEOGRAFIA.length} preguntas`, '3 niveles de dificultad', `${temas} categorías`]);
    for (const [nivel, cfg] of [['Fácil', CONFIG_DIFICULTAD_GEO.facil], ['Medio', CONFIG_DIFICULTAD_GEO.medio], ['Difícil', CONFIG_DIFICULTAD_GEO.dificil]] as const) {
      await expect(page.getByRole('button', { name: new RegExp(`^${nivel}`) })).toContainText(`${cfg.preguntas} preguntas`);
    }
  });

  test('sano · la tabla de comunidades de la guía cuadra con el banco: 17 comunidades, 50 provincias, 7 uniprovinciales', async ({ page }) => {
    // Banco: id 2 «¿Cuántas comunidades autónomas…?» → 17; id 3 «¿Cuántas provincias…?» → 50;
    // id 38 «¿Cuántas … son uniprovinciales?» → 7. La tabla las da en la columna «Provincias».
    await abrir(page);
    const filas = await page.locator('[class*="guideSection"]').first().locator('tbody tr td:nth-child(3)').evaluateAll((tds) => tds.map((t) => Number((t.textContent ?? '').match(/^\d+/)?.[0] ?? 'NaN')));
    expect(String(filas.length)).toBe(fichaDe(/Cuántas comunidades autónomas tiene España/).correcta);
    expect(String(filas.reduce((a, b) => a + b, 0))).toBe(fichaDe(/Cuántas provincias tiene España/).correcta);
    expect(String(filas.filter((n) => n === 1).length)).toBe(fichaDe(/uniprovinciales/).correcta);
  });

  test('hallazgo · «¿Cuál es el pico más alto de España?» da la misma altitud del Teide en las dos FAQ', async ({ page }) => {
    // REPARADO el 19/10/2026 (3220, C0153): las dos FAQ salen de RESPUESTA_PICO_MAS_ALTO
    // (metadata.ts) con la cifra del IGN, 3.715 m, ratificada por el usuario; el banco (ids 5 y 51)
    // pasa también a 3.715. Antes: FAQPage 3.715 m, FAQ visible y banco 3.718 m.
    await abrir(page);
    const pregunta = '¿Cuál es el pico más alto de España?';
    const servida = (await faqServida(page))[pregunta];
    const visible = (await faqVisible(page))[pregunta];
    expect(servida && visible, 'la pregunta está en las dos FAQ').toBeTruthy();
    const altura = (t: string) => (t.match(/Teide[^.]*?(\d\.\d{3})\s?m/) ?? [])[1];
    expect(altura(servida)).toBe(altura(visible));
    expect(servida).toBe(visible);
    // El banco da la misma altitud que las FAQ.
    expect(fichaDe(/altitud exacta del Teide/).correcta).toBe(`${altura(servida)} m`);
  });

  test('hallazgo · «¿Cuántas provincias tiene España?» se contesta con el mismo texto en las dos FAQ', async ({ page }) => {
    // Visto por el inspector el 10/10/2026, hoy REPARADO. Mismas cifras (50 · 17 · Ceuta y
    // Melilla) con dos redacciones; la del FAQPage («distribuidas en 17 comunidades autónomas y 2
    // ciudades autónomas») se leía como si Ceuta y Melilla tuvieran provincias. REPARADO el 20/10/2026 (3221): una constante en metadata.ts.
    await abrir(page);
    const pregunta = '¿Cuántas provincias tiene España?';
    expect((await faqServida(page))[pregunta]).toBe((await faqVisible(page))[pregunta]);
  });

  test('hallazgo · la app no enseña en un sitio la respuesta que en otro da por mala', async ({ page }) => {
    // REPARADO el 19/10/2026 (3222): la guía da 8 islas habitadas (las siete con administración
    // propia y La Graciosa, art. 4.1 del Estatuto de Autonomía de Canarias, LO 1/2018,
    // BOE-A-2018-15138, leído el 19/10/2026) y la explicación de la id 15 hace nacer el Tajo en
    // la Sierra de Albarracín (Teruel). Antes:
    // · Canarias: la guía (FAQ «¿Cuántas islas tiene España?») decía «7 islas habitadas
    //   principales»; la pregunta id 22 «¿Cuántas islas habitadas tiene el archipiélago canario?»
    //   da por buena 8 (con La Graciosa, «reconocida oficialmente en 2018») y por MALA el 7.
    // · Tajo: la explicación de la id 15 decía «El Tajo nace en Cuenca»; la id 59 «¿En qué
    //   provincia nace el río Tajo?» da por buena Teruel y por MALA Cuenca (y la explicación de la
    //   id 49, «Nace en la Sierra de Albarracín (Teruel)»).
    await abrir(page);
    const fallos: string[] = [];
    const islas = fichaDe(/islas habitadas tiene el archipiélago canario/);
    const guiaIslas = (await faqVisible(page))['¿Cuántas islas tiene España?'] ?? '';
    const enGuia = (guiaIslas.match(/Canarias \((\d+) islas habitadas/) ?? [])[1];
    if (enGuia && enGuia !== islas.correcta) fallos.push(`islas habitadas de Canarias: guía ${enGuia}, quiz ${islas.correcta}`);
    const nacimiento = fichaDe(/En qué provincia nace el río Tajo/).correcta; // 'Teruel'
    for (const p of PREGUNTAS_GEOGRAFIA) {
      const m = p.explicacion.match(/Tajo nace en ([^,.]+)/);
      if (m && !m[1].includes(nacimiento) && !/Albarrac[ií]n/.test(m[1])) fallos.push(`id ${p.id}: «Tajo nace en ${m[1]}» frente a ${nacimiento}`);
    }
    expect(fallos).toEqual([]);
  });

  test('hallazgo · la guía no hace de Zamora una comunidad ni lleva el Duero por Aragón', async ({ page }) => {
    // REPARADO el 19/10/2026 (3223): el Duero recorre una sola comunidad, con Zamora entre sus
    // provincias. Antes, FAQ visible «¿Qué ríos atraviesan más comunidades autónomas?»: «El Duero
    // atraviesa Castilla y León, Zamora y parte de Aragón antes de entrar en Portugal». La tabla
    // de la misma guía pone Zamora entre las 9 provincias de Castilla y León y la de ríos dice del
    // Duero «Atraviesa Castilla y León y Portugal»; la id 75 lo hace nacer en el Sistema Ibérico
    // (Picos de Urbión, Soria).
    await abrir(page);
    const texto = (await faqVisible(page))['¿Qué ríos atraviesan más comunidades autónomas?'] ?? '';
    const duero = (texto.match(/El Duero[^.]*\./) ?? [''])[0];
    expect(duero, 'el Duero recorre una sola comunidad').toMatch(/solo recorre una comunidad/);
    expect(duero, 'Zamora es provincia de Castilla y León, no una comunidad').not.toMatch(/Castilla y León, Zamora/);
    expect(duero, 'el Duero no pasa por Aragón').not.toMatch(/Arag[oó]n/);
  });

  test('hallazgo · la guía no se contradice en Castilla y León ni en los husos horarios', async ({ page }) => {
    // Visto por el inspector el 10/10/2026, hoy REPARADO (abajo). Antes:
    // · Castilla y León: la FAQ visible da 94.225 km² y «la segunda de la Unión Europea»; la
    //   explicación de la id 10, 94.226 km² y «la más extensa de España y de la Unión Europea».
    // · «Le siguen Castilla-La Mancha (79.463 km²) y Andalucía (87.268 km²)»: con sus propias cifras
    //   la segunda es Andalucía.
    // · La curiosidad «Tres zonas horarias» explica que «España tiene técnicamente dos husos horarios».
    // REPARADO el 20/10/2026 (3224): «más de 94.000 km²» y «la más extensa de España» en las dos
    // bocas (sin fuente consultada para el dígito ni para el puesto en la UE), Andalucía antes que
    // Castilla-La Mancha, y la curiosidad titulada «Dos husos horarios».
    await abrir(page);
    const fallos: string[] = [];
    const faq = (await faqVisible(page))['¿Cuál es la comunidad autónoma más grande?'] ?? '';
    const exp = fichaDe(/comunidad autónoma más extensa/).explicacion;
    const km = (t: string) => (t.match(/(\d{2}\.\d{3}) km²/) ?? [])[1];
    if (km(faq) !== km(exp)) fallos.push(`superficie: guía ${km(faq)} · banco ${km(exp)}`);
    if (/segunda de la Unión Europea/.test(faq) && /más extensa de España y de la Unión Europea/.test(exp)) fallos.push('UE: segunda en la guía, primera en el banco');
    const siguen = faq.match(/Le siguen [^(]+\(([\d.]+) km²\) y [^(]+\(([\d.]+) km²\)/);
    if (siguen && Number(siguen[1].replace('.', '')) < Number(siguen[2].replace('.', ''))) fallos.push(`orden: ${siguen[1]} antes que ${siguen[2]}`);
    const tarjetas = await page.locator('[class*="tipCard"]').evaluateAll((cs) => cs.map((c) => (c.textContent ?? '').replace(/\s+/g, ' ')));
    if (tarjetas.some((t) => /Tres zonas horarias/.test(t) && /dos husos horarios/.test(t))) fallos.push('«Tres zonas horarias» frente a «dos husos horarios»');
    expect(fallos).toEqual([]);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Inspector 28/10/2026 — familia «Quizzes de opción múltiple» y cabo C0203.
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Inspector 28/10/2026 · partida (casos resueltos a mano)', () => {
  /**
   * CASO NORMAL — Difícil, 13 bien y 7 mal, en ese orden.
   * Esperado a mano: 20 preguntas (CONFIG dificil = 20, banco difícil = 25), todas «dificil»;
   * el marcador en vivo sube 1 … 13 y se queda en 13 («N correctas», nunca más que las
   * contestadas: la app no tiene porcentaje en vivo); 13/20 = 65 % → tramo ≥ 50 y < 70 → 🥉
   * «Nivel intermedio»; estadísticas 13 · 7 · «65 %» (espacio duro) · 20; 7 fichas falladas.
   */
  test('caso normal: 13 de 20 en Difícil dan 65 % y «Nivel intermedio», con el marcador en vivo al día', async ({ page }) => {
    test.setTimeout(120_000);
    await abrir(page, { semilla: 28 });
    await arrancar(page, 'Difícil');
    await expect(page.locator('[class*="progresoInfo"]')).toContainText('Pregunta 1 de 20');
    const fichas: PreguntaGeografia[] = [];
    for (let n = 1; n <= 20; n++) {
      fichas.push((await responder(page, n <= 13 ? 'bien' : 'mal')).ficha);
      const esperado = Math.min(n, 13);
      await expect(marcador(page)).toHaveText(`${esperado} ${esperado === 1 ? 'correcta' : 'correctas'}`);
      const rotulo = await avanzar(page);
      expect(/Ver resultado/.test(rotulo), `«Ver resultado» sale en la ${n}`).toBe(n === 20);
    }
    expect(new Set(fichas.map((f) => f.id)).size, 'pregunta repetida').toBe(20);
    expect(fichas.every((f) => f.dificultad === 'dificil')).toBe(true);
    const r = await resultado(page);
    expect(r.titulo).toBe('Nivel intermedio');
    expect(r.medalla).toBe('🥉');
    expect(r.subtitulo).toBe(`13 de 20 preguntas correctas (65${DURO}%)`);
    expect(r.stats).toEqual({ Correctas: '13', Errores: '7', 'Puntuación': `65${DURO}%`, Jugadas: '20' });
    expect(r.errores).toBe(7);
  });

  /**
   * CASO LÍMITE — redondeo junto a un umbral, «Jugar de nuevo» sin recargar y «Cambiar dificultad»
   * con el ratón.
   * Esperado a mano: Medio 10/15 = 66,67 % → Math.round = 67 % → por debajo de 70 → 🥉 «Nivel
   * intermedio» (no 🥈). «Jugar de nuevo» no recarga, vuelve a «Pregunta 1 de 15» y «0 correctas»;
   * 14/15 = 93,33 % → 93 % → 🥇 «¡Experto en Geografía de España!». «Cambiar dificultad» pulsado con
   * el ratón deja el foco en «Comenzar quiz» (page.tsx, efecto de fase «inicio» con partida previa),
   * no en <body>, y conserva «Medio» elegido.
   */
  test('caso límite: 10 de 15 redondea a 67 % (🥉), «Jugar de nuevo» no recarga y «Cambiar dificultad» deja el foco en «Comenzar quiz»', async ({ page }) => {
    test.setTimeout(150_000);
    await abrir(page, { semilla: 29 });
    await page.evaluate(() => { (window as unknown as { __marca: string }).__marca = 'sin-recarga'; });
    await arrancar(page, 'Medio');
    await jugar(page, 10);
    let r = await resultado(page);
    expect(r.titulo).toBe('Nivel intermedio');
    expect(r.medalla).toBe('🥉');
    expect(r.subtitulo).toBe(`10 de 15 preguntas correctas (67${DURO}%)`);

    await page.getByRole('button', { name: 'Jugar de nuevo' }).click();
    await expect(page.locator('[class*="progresoInfo"]')).toContainText('Pregunta 1 de 15');
    await expect(marcador(page)).toHaveText('0 correctas');
    expect(await page.evaluate(() => (window as unknown as { __marca?: string }).__marca)).toBe('sin-recarga');
    await jugar(page, 14);
    r = await resultado(page);
    expect(r.titulo).toBe('¡Experto en Geografía de España!');
    expect(r.medalla).toBe('🥇');
    expect(r.subtitulo).toBe(`14 de 15 preguntas correctas (93${DURO}%)`);

    await page.getByRole('button', { name: 'Cambiar dificultad' }).click();
    await expect(page.locator('[class*="inicioPanel"]')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Comenzar quiz', exact: true })).toBeFocused();
    await expect(page.getByRole('button', { name: /^Medio/ })).toHaveAttribute('aria-pressed', 'true');
  });
});

/** Registra cada clic en window, en captura y ANTES que la guarda de la app, y si llegó a la burbuja. */
async function espiarClics(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const w = window as unknown as { __clics: { d: number; t: string; llega: boolean }[] };
    w.__clics = [];
    const desc = (n: EventTarget | null): string => {
      const el = n instanceof Element ? (n.closest('a,button') ?? n) : null;
      return el ? `${el.tagName.toLowerCase()}«${(el.textContent ?? '').replace(/\s+/g, ' ').trim().slice(0, 30)}»` : String(n);
    };
    window.addEventListener('click', (e) => { w.__clics.push({ d: e.detail, t: desc(e.target), llega: false }); }, true);
    window.addEventListener('click', () => { const u = w.__clics[w.__clics.length - 1]; if (u) u.llega = true; });
  });
}

/**
 * Doble clic o dos toques (el 2.º con detail 2, en el mismo punto y con la pantalla nueva ya
 * pintada) en «Comenzar», en cada «Siguiente», en «Ver resultado» y en las dos salidas del
 * resultado («Jugar de nuevo», «Cambiar dificultad»). Devuelve lo que el 2.º hizo de más, su
 * `detail` y qué había bajo él.
 */
async function dobleEnCadaTransicion(page: Page, frac: number, doble: Doble, semilla: number) {
  await espiarClics(page);
  await abrir(page, { semilla });
  const mal: string[] = [];
  const detalles: number[] = [];
  const blancos: string[] = [];
  const estado = () =>
    page.evaluate(() => {
      const ops = [...document.querySelectorAll('[role="group"][aria-label="Opciones de respuesta"] button')] as HTMLButtonElement[];
      const guia = [...document.querySelectorAll('button[aria-expanded]')].find((b) => /guía educativa/.test(b.textContent ?? ''));
      return {
        ruta: location.pathname,
        inicio: Boolean(document.querySelector('[class*="inicioPanel"]')),
        fin: Boolean(document.querySelector('[class*="finTitulo"]')),
        progreso: (document.querySelector('[class*="progresoInfo"] span')?.textContent ?? '').trim(),
        bloqueadas: ops.filter((b) => b.disabled).length,
        guia: guia?.getAttribute('aria-expanded') ?? 'sin botón',
      };
    });
  const pulsar = async (loc: Locator, rotulo: string, espera: 'pregunta' | 'fin' | 'inicio') => {
    const p = await colocar(page, loc, frac);
    const antes = await estado();
    await page.evaluate(() => { (window as unknown as { __clics: unknown[] }).__clics = []; });
    await doble(page, p.x, p.y);
    const clics = await page.evaluate(() => (window as unknown as { __clics: { d: number; t: string; llega: boolean }[] }).__clics);
    const e = await estado();
    const seg = clics[1];
    if (seg) {
      detalles.push(seg.d);
      blancos.push(seg.t);
      if (seg.llega) mal.push(`${rotulo}: el 2.º llega a ${seg.t}`);
    } else mal.push(`${rotulo}: no hubo 2.º clic`);
    if (e.ruta !== RUTA) mal.push(`${rotulo}: navega a ${e.ruta}`);
    if (e.guia !== antes.guia) mal.push(`${rotulo}: la guía pasa de ${antes.guia} a ${e.guia}`);
    if (espera === 'pregunta' && (e.inicio || e.fin || e.bloqueadas > 0)) mal.push(`${rotulo}: la ${e.progreso} sale ya respondida o se pierde`);
    if (espera === 'fin' && !e.fin) mal.push(`${rotulo}: la nota no se ve`);
    if (espera === 'inicio' && !e.inicio) mal.push(`${rotulo}: no se queda en la selección de nivel`);
    return e;
  };
  await page.getByRole('button', { name: /^Fácil/ }).click();
  let e = await pulsar(page.getByRole('button', { name: /Comenzar quiz/ }), 'Comenzar', 'pregunta');
  for (let n = 1; n <= 10 && !e.fin && !e.inicio && e.ruta === RUTA; n++) {
    if (e.bloqueadas === 0) {
      await page.waitForTimeout(500); // lee la pregunta: fuera de la ventana de ráfaga
      await opciones(page).nth(3).click();
      await expect(page.locator('[class*="feedbackMensaje"]')).toBeVisible();
    }
    const sig = page.getByRole('button', { name: /Siguiente pregunta|Ver resultado/ });
    const ultimo = /Ver resultado/.test(await sig.innerText());
    e = await pulsar(sig, ultimo ? 'Ver resultado' : `Siguiente ${n}`, ultimo ? 'fin' : 'pregunta');
  }
  expect(e.fin, 'la partida llega al resultado').toBe(true);
  await page.waitForTimeout(500);
  e = await pulsar(page.getByRole('button', { name: 'Jugar de nuevo' }), 'Jugar de nuevo', 'pregunta');
  for (let n = 1; n <= 10 && !e.fin; n++) {
    await page.waitForTimeout(400);
    await opciones(page).nth(0).click();
    await page.waitForTimeout(400);
    await page.getByRole('button', { name: /Siguiente pregunta|Ver resultado/ }).click();
    e = await estado();
  }
  expect(e.fin, 'la 2.ª partida llega al resultado').toBe(true);
  await page.waitForTimeout(500);
  await pulsar(page.getByRole('button', { name: 'Cambiar dificultad' }), 'Cambiar dificultad', 'inicio');
  return { mal, detalles, blancos };
}

/**
 * LO QUE DEBE IGNORARSE — el 2.º toque de una ráfaga. El testigo de la familia solo mide a
 * 390 × 844 y en una hermana sin guarda pasaba por geometría; aquí se mide a 412 × 915 y 768 × 1024
 * (toque) y a 1280 × 800 (ratón), con el botón a una altura en la que el 2.º cae, medido el
 * 28/10/2026, sobre una opción de la pregunta nueva, «Ver guía educativa» o «Comenzar quiz».
 * Esperado a mano (guarda en captura sobre window, page.tsx): ninguno de los 2.º llega a la app;
 * la pregunta nueva sale sin responder, la nota se ve, la guía no se abre ni se cierra, no se sale
 * de la ruta. Medido el 28/10/2026 en 195 transiciones (5 viewports × 3 alturas): 0 de 195.
 */
test.describe('Inspector 28/10/2026 · doble toque a 412 × 915', () => {
  test.use({ viewport: { width: 412, height: 915 }, userAgent: MOVIL_UA, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  test('caso de rechazo: el 2.º toque no contesta, no se come la nota, no abre la guía ni saca de la app', async ({ page }) => {
    test.setTimeout(180_000);
    const r = await dobleEnCadaTransicion(page, 0.55, dobleToque, 962);
    expect(r.mal).toEqual([]);
    expect(r.detalles.every((d) => d === 2), `detail del 2.º: ${r.detalles.join(',')}`).toBe(true);
    expect(r.blancos.some((t) => t.startsWith('button')), `el 2.º no cayó nunca en un botón: ${r.blancos.join(' · ')}`).toBe(true);
  });
});

test.describe('Inspector 28/10/2026 · doble toque a 768 × 1024', () => {
  test.use({ viewport: { width: 768, height: 1024 }, userAgent: MOVIL_UA, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  test('caso de rechazo: el 2.º toque no contesta, no se come la nota, no abre la guía ni saca de la app', async ({ page }) => {
    test.setTimeout(180_000);
    const r = await dobleEnCadaTransicion(page, 0.3, dobleToque, 1068);
    expect(r.mal).toEqual([]);
    expect(r.detalles.every((d) => d === 2), `detail del 2.º: ${r.detalles.join(',')}`).toBe(true);
    expect(r.blancos.some((t) => t.startsWith('button')), `el 2.º no cayó nunca en un botón: ${r.blancos.join(' · ')}`).toBe(true);
  });
});

test.describe('Inspector 28/10/2026 · doble clic a 1280 × 800', () => {
  test.use({ viewport: { width: 1280, height: 800 } });
  test('caso de rechazo: el 2.º clic no contesta, no se come la nota, no abre la guía ni saca de la app', async ({ page }) => {
    test.setTimeout(180_000);
    const r = await dobleEnCadaTransicion(page, 0.8, dobleClic, 2080);
    expect(r.mal).toEqual([]);
    expect(r.detalles.every((d) => d === 2), `detail del 2.º: ${r.detalles.join(',')}`).toBe(true);
    expect(r.blancos.some((t) => /Ver guía educativa/.test(t)), `el 2.º no cayó nunca en la guía: ${r.blancos.join(' · ')}`).toBe(true);
  });
});

/** Texto de las tarjetas de la guía (están en el DOM aunque la guía esté plegada). */
async function tarjetaGuia(page: Page, clase: string, texto: string): Promise<string> {
  const t = await page.evaluate(
    ([c, x]) =>
      [...document.querySelectorAll(`[class*="${c}"]`)]
        .map((e) => (e.textContent ?? '').replace(/[ \t\n\r]+/g, ' ').trim())
        .find((s) => s.includes(x)) ?? '',
    [clase, texto],
  );
  expect(t, `no hay tarjeta «${clase}» con «${texto}»`).not.toBe('');
  return t;
}

test.describe('Inspector 28/10/2026 · contenido (cabo C0203 y JSON-LD)', () => {
  test('hallazgo · Ordesa no fue el primer parque nacional: Covadonga se declaró antes', async () => {
    // ABIERTO (inspector 28/10/2026). id 62: «Fue el primer parque nacional español, creado en 1918.»
    // BOE: la Ley de 22 de julio de 1918 (Gaceta de Madrid núm. 205, 24/07/1918, BOE-A-1918-3943),
    // art. 2, declara parque nacional el macizo de Peña Santa «con el nombre de Parque Nacional de
    // la Montaña de Covadonga»; el «Real decreto de 16 de agosto de 1918 creando el Parque Nacional
    // del Valle de Ordesa o del río Ara […] fijando sus límites y extensión y los del Parque Nacional
    // de Covadonga» (Gaceta núm. 230, 18/08/1918, BOE-A-1918-4414) es 25 días posterior.
    test.fail();
    expect(fichaDe(/Parque Nacional de Ordesa y Monte Perdido/).explicacion).not.toMatch(/primer parque nacional/i);
  });

  test('hallazgo · el Aneto no está en un «Parque Nacional Posets-Maladeta»', async () => {
    // ABIERTO (inspector 28/10/2026). id 29: «dentro del Parque Nacional Posets-Maladeta».
    // BOE: Ley 3/1994, de 23 de junio, de las Cortes de Aragón, «de creación del Parque
    // Posets-Maladeta», art. 1: «Se crea el Parque de Posets-Maladeta, en el Pirineo aragonés»
    // (figura de Parque de la Ley 4/1989). Un parque nacional se declara «por ley de las Cortes
    // Generales» (Ley 30/2014, art. 8.1) y Posets-Maladeta no está entre los de la disposición
    // adicional primera de esa ley.
    test.fail();
    expect(fichaDe(/pico más alto del Pirineo/).explicacion).not.toMatch(/Parque Nacional Posets/i);
  });

  test('hallazgo · Zaragoza es hoy la cuarta ciudad más poblada y Sevilla la quinta', async () => {
    // ABIERTO (inspector 28/10/2026). id 11: «Sevilla … la cuarta ciudad más poblada de España»;
    // id 17: «Zaragoza … la quinta ciudad más poblada de España». INE, cifras oficiales del Padrón a
    // 1 de enero de 2025 (tablas «Zaragoza: Población por municipios y sexo» y «Sevilla: …»):
    // València 840.792 · Zaragoza 693.091 · Sevilla 689.423. Esperado: Zaragoza 4.ª, Sevilla 5.ª.
    test.fail();
    const fallos: string[] = [];
    if (/cuarta ciudad más poblada/.test(fichaDe(/capital de Andalucía/).explicacion)) fallos.push('Sevilla «cuarta» (INE 2025: 689.423, quinta)');
    if (/quinta ciudad más poblada/.test(fichaDe(/capital de Aragón/).explicacion)) fallos.push('Zaragoza «quinta» (INE 2025: 693.091, cuarta)');
    expect(fallos).toEqual([]);
  });

  test('hallazgo · la Albufera no es «la laguna más grande de España»: el Mar Menor tiene 135 km²', async ({ page }) => {
    // ABIERTO (inspector 28/10/2026). Curiosidad de la guía: «La Albufera de Valencia es la laguna
    // más grande de España con 2.800 ha de agua dulce. El Mar Menor (Murcia) es la laguna salada…».
    // BOE: Ley 19/2022, de 30 de septiembre, «para el reconocimiento de personalidad jurídica a la
    // laguna del Mar Menor», preámbulo: «con una superficie de 135 km2, la mayor laguna costera del
    // Mediterráneo español». 135 km² = 13.500 ha > 2.800 ha.
    test.fail();
    await abrir(page);
    const t = await tarjetaGuia(page, 'tipCard', 'Albufera');
    const ha = Number(((t.match(/([\d.]+) ha/) ?? [])[1] ?? 'NaN').replace(/\./g, ''));
    expect(ha, 'superficie que da la tarjeta').toBe(2800);
    expect(/laguna más grande de España/.test(t) && ha < 13_500, `«${t}»`).toBe(false);
  });

  test('hallazgo · Canarias no está «en la misma latitud que el norte de Marruecos»', async ({ page }) => {
    // ABIERTO (inspector 28/10/2026). BOE: Real Decreto 2510/1977, de 5 de agosto, sobre trazado de
    // líneas de base rectas: el punto más septentrional de Canarias, Pta. Grieta (Alegranza), está
    // a 29º 42' N y Pta. de la Restinga (El Hierro) a 27º 38' N; Tarifa (isla), a 36º 00' N, frente
    // a la costa norte de Marruecos a 14 km (la propia guía). Canarias queda 6º-8º más al sur.
    test.fail();
    await abrir(page);
    expect(await tarjetaGuia(page, 'tipCard', 'archipiélago canario')).not.toMatch(/norte de Marruecos/);
  });

  test('REPARADO (C0203, decisión del usuario 30/10/2026) · sin las cuatro afirmaciones que ninguna fuente oficial ancla', async ({ page }) => {
    // El inspector del 29/10 no encontró fuente oficial que confirme ni desmienta: (e) id 73 «el
    // país europeo con más municipios» (el INE no compara países); (h) Cabrera entre las islas
    // habitadas de Baleares (la Ley 14/1991 no habla de población; el INE agrupa por municipios);
    // (i) id 37 Sanabria «el lago natural más grande» (su propia explicación solo respalda «el
    // mayor de origen glaciar»); (j) id 32 «Hísperia» como nombre de la Península (dle.rae.es da
    // 403 a la tarea). Regla 1 de neutralidad: se retiran o se matizan a lo que la app sí sostiene.
    expect(fichaDe(/Cuántos municipios tiene España/).explicacion).not.toMatch(/país europeo con más municipios/);
    expect(fichaDe(/lago de origen glaciar/).pregunta).not.toMatch(/lago natural más grande/);
    expect(fichaDe(/río atraviesa la ciudad de Zaragoza/).explicacion).not.toMatch(/Hísperia/);
    await abrir(page);
    expect((await faqVisible(page))['¿Cuántas islas tiene España?'] ?? '').not.toMatch(/Cabrera/);
  });

  test('hallazgo · la Geografía no es materia obligatoria en 2.º de Bachillerato', async ({ page }) => {
    // ABIERTO (inspector 28/10/2026). Tarjeta «Bachillerato y ESO»: «La geografía de España es
    // materia obligatoria en 3.º ESO y en 2.º de Bachillerato». BOE: Real Decreto 243/2022, art. 9.2
    // (materias comunes de 2.º: Historia de España, Historia de la Filosofía, Lengua Castellana y
    // Literatura II, Lengua Extranjera II) y art. 13.2: Geografía es una de las materias de
    // modalidad de Humanidades y Ciencias Sociales entre las que se eligen dos.
    test.fail();
    await abrir(page);
    // «[^,;]*» y no «[^.]*»: «3.º ESO» lleva punto.
    expect(await tarjetaGuia(page, 'scenarioCard', 'Bachillerato')).not.toMatch(/obligatoria[^,;]*2\.º de Bachillerato/);
  });

  test('hallazgo · ningún porcentaje de la guía va pegado al «%»', async ({ page }) => {
    // ABIERTO (inspector 28/10/2026). Regla del 25/09/2026 (Ortografía RAE 2010): «Solo un 11% de su
    // territorio» en la curiosidad «España, el segundo país más montañoso de Europa». Esperado «11 %».
    test.fail();
    await abrir(page);
    const pegados = await page.evaluate(() =>
      [...document.querySelectorAll('[class*="guideSection"], [class*="warningBox"]')]
        .flatMap((s) => (s.textContent ?? '').match(/\S*\d%/g) ?? []),
    );
    expect(pegados).toEqual([]);
  });

  test('hallazgo · el WebApplication del JSON-LD declara al menos 4 características', async ({ page }) => {
    // ABIERTO (inspector 28/10/2026). metadata.ts: `features: []` → featureList vacía (§1.ter).
    test.fail();
    await abrir(page);
    const n = await page.evaluate(() => {
      for (const s of document.querySelectorAll('script[type="application/ld+json"]')) {
        const d = JSON.parse(s.textContent ?? '{}') as { '@type'?: string; featureList?: unknown[] };
        if (d['@type'] === 'WebApplication') return Array.isArray(d.featureList) ? d.featureList.length : -1;
      }
      return -2;
    });
    expect(n).toBeGreaterThanOrEqual(4);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Inspector 29/10/2026 — familia «Quizzes de opción múltiple» (tras c5b619bb y d9e710f8) y el
// resto del cabo C0203, ya con las fuentes oficiales permitidas.
// ─────────────────────────────────────────────────────────────────────────────

/** Sin <input>: la hidratación se confirma cuando React cuelga sus props de «Comenzar quiz» (como el testigo). */
async function esperarHidratado29(page: Page): Promise<void> {
  await page.waitForFunction(() => {
    const b = [...document.querySelectorAll('button')].find((x) => /Comenzar quiz/.test(x.textContent ?? ''));
    return Boolean(b && Object.keys(b).some((k) => k.startsWith('__reactProps$')));
  });
}

/** «TAG:tabindex» del elemento con el foco. */
async function focoActual(page: Page): Promise<string> {
  return page.evaluate(() => {
    const a = document.activeElement;
    return `${a?.tagName ?? '—'}:${a?.getAttribute('tabindex') ?? ''}`;
  });
}

const progreso29 = (page: Page): Locator => page.locator('[class*="progresoInfo"] span').first();

function casosInspector29(movil: boolean): void {
  /**
   * CASO NORMAL — Fácil, en el orden B M B B M B M B B M (B = la correcta del banco, M = otra).
   * Esperado a mano: 10 preguntas (CONFIG facil = 10); el marcador en vivo va 1 · 1 · 2 · 3 · 3 ·
   * 4 · 4 · 5 · 6 · 6 («1 correcta» en singular); tras cada «Siguiente» el foco va al enunciado
   * nuevo (H2 con tabindex −1, invariante de la familia); las opciones nunca llevan aria-pressed;
   * «Ver resultado» solo en la 10.ª. 6/10 = 60 % → tramo ≥ 50 y < 70 → 🥉 «Nivel intermedio»;
   * «6 de 10 preguntas correctas (60 %)» con espacio duro; estadísticas 6 · 4 · «60 %» · 10; la
   * lista de falladas son las 4 «M», cada una con su correcta, y el foco acaba en el título.
   */
  test('caso normal: Fácil con B M B B M B M B B M da 6 de 10, 60 % y «Nivel intermedio»', async ({ page }) => {
    test.setTimeout(90_000);
    await abrir(page, { semilla: 2910 });
    await esperarHidratado29(page);
    await arrancar(page, 'Fácil');
    const patron = 'BMBBMBMBBM';
    const enVivo = ['1 correcta', '1 correcta', '2 correctas', '3 correctas', '3 correctas', '4 correctas', '4 correctas', '5 correctas', '6 correctas', '6 correctas'];
    const falladas: string[] = [];
    for (let n = 0; n < 10; n++) {
      await expect(progreso29(page)).toHaveText(`Pregunta ${n + 1} de 10`);
      expect(await opciones(page).evaluateAll((bs) => bs.filter((b) => b.hasAttribute('aria-pressed')).length), 'opciones con aria-pressed').toBe(0);
      const { ficha } = await responder(page, patron[n] === 'B' ? 'bien' : 'mal');
      if (patron[n] === 'M') falladas.push(`${ficha.pregunta}✓ ${ficha.correcta}`);
      await expect(marcador(page)).toHaveText(enVivo[n]);
      const rotulo = await avanzar(page);
      expect(/Ver resultado/.test(rotulo), `«Ver resultado» en la ${n + 1}`).toBe(n === 9);
      if (n < 9) await expect.poll(() => focoActual(page), `foco tras «Siguiente» ${n + 1}`).toBe('H2:-1');
    }
    const r = await resultado(page);
    expect(r.titulo).toBe('Nivel intermedio');
    expect(r.medalla).toBe('🥉');
    expect(r.subtitulo).toBe(`6 de 10 preguntas correctas (60${DURO}%)`);
    expect(r.stats).toEqual({ Correctas: '6', Errores: '4', 'Puntuación': `60${DURO}%`, Jugadas: '10' });
    const lista = (await page.locator('[class*="errorItem"]').allTextContents()).map((t) => t.replace(/[ \t\n\r]+/g, ' ').trim());
    expect(lista).toEqual(falladas);
    await expect(page.locator('[class*="finTitulo"]')).toBeFocused();
  });

  /**
   * CASO LÍMITE — Difícil, las 20 bien (la clave del banco: mide la mecánica; la id 61 se juzga
   * aparte, abajo).
   * Esperado a mano: 20 preguntas distintas y todas «dificil» (banco difícil = 25); «Ver resultado»
   * solo en «Pregunta 20 de 20»; 20/20 = 100 % → ≥ 90 → 🥇 «¡Experto en Geografía de España!»;
   * «20 de 20 preguntas correctas (100 %)»; estadísticas 20 · 0 · «100 %» · 20; sin bloque
   * «Preguntas que has fallado».
   */
  test('caso límite: Difícil 20 de 20 da 100 %, 🥇 y ningún bloque de falladas', async ({ page }) => {
    test.setTimeout(120_000);
    await abrir(page, { semilla: 2911 });
    await esperarHidratado29(page);
    await arrancar(page, 'Difícil');
    const fichas: PreguntaGeografia[] = [];
    for (let n = 1; n <= 20; n++) {
      await expect(progreso29(page)).toHaveText(`Pregunta ${n} de 20`);
      fichas.push((await responder(page, 'bien')).ficha);
      await expect(marcador(page)).toHaveText(`${n} ${n === 1 ? 'correcta' : 'correctas'}`);
      const rotulo = await avanzar(page);
      expect(/Ver resultado/.test(rotulo), `«Ver resultado» en la ${n}`).toBe(n === 20);
    }
    expect(new Set(fichas.map((f) => f.id)).size, 'pregunta repetida').toBe(20);
    expect(fichas.every((f) => f.dificultad === 'dificil')).toBe(true);
    const r = await resultado(page);
    expect(r.titulo).toBe('¡Experto en Geografía de España!');
    expect(r.medalla).toBe('🥇');
    expect(r.subtitulo).toBe(`20 de 20 preguntas correctas (100${DURO}%)`);
    expect(r.stats).toEqual({ Correctas: '20', Errores: '0', 'Puntuación': `100${DURO}%`, Jugadas: '20' });
    expect(r.errores).toBe(0);
    await expect(page.locator('[class*="erroresSection"]')).toHaveCount(0);
  });

  /**
   * CASO DE RECHAZO — avanzar sin contestar, cambiar la respuesta dada y el doble toque/clic sobre
   * una opción.
   * Esperado a mano (page.tsx): en fase «jugando» no hay «Siguiente» (solo se pinta en
   * «respondida»); Intro y Espacio con el foco en el enunciado (H2, no un botón) no hacen nada:
   * sigue «Pregunta 1 de 10», ninguna opción bloqueada y sin veredicto. Tras fallar, las 4 opciones
   * quedan disabled: pulsar la correcta (forzado) no cambia «0 correctas» ni el «❌ Incorrecto».
   * Un doble clic (escritorio) o dos toques (360 px) sobre una opción de la 2.ª pregunta la
   * contestan UNA vez y no se saltan la explicación: sigue «Pregunta 2 de 10» con su explicación y
   * «Siguiente pregunta →», y el marcador sube a lo sumo 1.
   */
  test('caso de rechazo: sin «Siguiente» antes de contestar, la respuesta no se cambia y el doble toque contesta una vez', async ({ page }) => {
    test.setTimeout(90_000);
    await abrir(page, { semilla: 2912 });
    await esperarHidratado29(page);
    await arrancar(page, 'Fácil');
    await expect(page.getByRole('button', { name: /Siguiente pregunta|Ver resultado/ })).toHaveCount(0);
    await expect.poll(() => focoActual(page)).toBe('H2:-1');
    await page.keyboard.press('Enter');
    await page.keyboard.press('Space');
    await expect(progreso29(page)).toHaveText('Pregunta 1 de 10');
    await expect(page.locator('[class*="feedbackMensaje"]')).toHaveCount(0);
    expect(await opciones(page).evaluateAll((bs) => bs.filter((b) => (b as HTMLButtonElement).disabled).length)).toBe(0);

    const { ficha } = await responder(page, 'mal');
    const iC = (await textosOpcion(page)).indexOf(ficha.correcta);
    await opciones(page).nth(iC).click({ force: true });
    await opciones(page).nth(iC).evaluate((b) => (b as HTMLButtonElement).click());
    await expect(marcador(page)).toHaveText('0 correctas');
    await expect(page.locator('[class*="feedbackMensaje"]')).toHaveText(`❌ Incorrecto. La respuesta correcta es: "${ficha.correcta}"`);
    await expect(progreso29(page)).toHaveText('Pregunta 1 de 10');

    await avanzar(page);
    await expect(progreso29(page)).toHaveText('Pregunta 2 de 10');
    await page.waitForTimeout(600); // lee la pregunta: fuera de la ventana de ráfaga del «Siguiente»
    const segunda = await fichaVisible(page);
    const tercera = opciones(page).nth(2);
    const acierta = (await textosOpcion(page))[2] === segunda.correcta;
    await bajarLoJusto(tercera);
    const caja = await tercera.boundingBox();
    if (!caja) throw new Error('la opción C no tiene caja');
    await (movil ? dobleToque : dobleClic)(page, caja.x + caja.width / 2, caja.y + caja.height / 2);
    await page.waitForTimeout(300);
    await expect(progreso29(page)).toHaveText('Pregunta 2 de 10');
    await expect(page.locator('[class*="feedbackMensaje"]')).toHaveCount(1);
    await expect(page.locator('[class*="explicacionTexto"]')).toHaveText(segunda.explicacion);
    await expect(page.getByRole('button', { name: 'Siguiente pregunta →' })).toHaveCount(1);
    await expect(marcador(page)).toHaveText(acierta ? '1 correcta' : '0 correctas');
  });

  /**
   * REPARADO (hallazgo 3780, cabo C0203 punto b) — id 61 «¿Qué río tiene la mayor cuenca
   * hidrográfica dentro de España?» daba por correcta «Duero»; ahora «Ebro», y la explicación
   * deja al Duero la mayor cuenca de la Península contando Portugal.
   * Fuentes: Confederación Hidrográfica del Ebro, https://www.chebro.es/es/web/guest/la-cuenca-del-ebro
   * — «una superficie total de 85.534 Km2» y «Es la cuenca hidrográfica más extensa de España,
   * representando el 17 % del territorio peninsular español». Confederación Hidrográfica del Duero,
   * https://www.chduero.es/web/guest/la-cuenca-del-duero — la parte española «cubre 78.859 km2» y la
   * demarcación es «la más extensa de la Península Ibérica con 98.073 km2» (la explicación de la app
   * se la daba al Tajo; REPARADO en fa1153c1, que se la da ya al Duero).
   * Esperado: contestar «Ebro» es «✅ ¡Correcto!» y el marcador sube. Obtenido (29/10/2026, 1280 y
   * 360 px, semilla 61, la id 61 sale 16.ª): «❌ Incorrecto. La respuesta correcta es: "Duero"».
   * Al repararlo (29/10/2026) la semilla 61 ya no sacaba la id 61: el orden depende de cuántas
   * llamadas a Math.random hace la página antes de «Comenzar», y eso varía en `next dev`. Con el
   * test.fail() el testigo daba verde cayendo en el «sale en la partida», sin medir nada. Ahora
   * prueba semillas hasta que la saca (20 de las 25 difíciles por partida: 4 semillas fallan
   * juntas con probabilidad 0,2⁴ ≈ 0,16 %), y el dato se comprueba también en el banco.
   */
  test('hallazgo · la mayor cuenca hidrográfica dentro de España es la del Ebro (CHE), no la del Duero', async ({ page }) => {
    test.setTimeout(240_000);
    const ficha61 = PREGUNTAS_GEOGRAFIA.find((p) => p.id === 61);
    expect(ficha61?.correcta, 'el banco da «Ebro» en la id 61').toBe('Ebro');
    let n = 21;
    for (const semilla of [61, 62, 63, 64]) {
      await abrir(page, { semilla });
      await esperarHidratado29(page);
      await arrancar(page, 'Difícil');
      for (n = 1; n <= 20; n++) {
        if ((await fichaVisible(page)).id === 61) break;
        await responder(page, 'bien');
        await avanzar(page);
      }
      if (n <= 20) break;
    }
    expect(n, 'la id 61 sale en alguna de las 4 partidas').toBeLessThanOrEqual(20);
    const antes = n - 1;
    const iEbro = (await textosOpcion(page)).indexOf('Ebro');
    expect(iEbro, '«Ebro» está entre las opciones').toBeGreaterThanOrEqual(0);
    await opciones(page).nth(iEbro).click();
    await expect(page.locator('[class*="feedbackMensaje"]')).toHaveText('✅ ¡Correcto!', { timeout: 3000 });
    await expect(marcador(page)).toHaveText(`${antes + 1} ${antes + 1 === 1 ? 'correcta' : 'correctas'}`, { timeout: 1000 });
  });
}

test.describe('Inspector 29/10/2026 · escritorio 1280 × 800', () => {
  test.use({ viewport: { width: 1280, height: 800 } });
  casosInspector29(false);
});

test.describe('Inspector 29/10/2026 · móvil 360 × 740', () => {
  test.use({ viewport: { width: 360, height: 740 }, userAgent: MOVIL_UA, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  casosInspector29(true);
});

// ─────────────────────────────────────────────────────────────────────────────
// Inspector 29/10/2026 (tarde) — re-inspección tras /reparar. fa1153c1 cerró el 3780 (id 61, la
// mayor cuenca dentro de España). De las reparaciones de familia del día, 5b65607f SÍ llegó a esta
// app (enfocarSinCentrar al contestar) y f0b18db0 NO: su guarda de doble toque es una copia en
// línea (page.tsx, «ultimoCambioPantallaRef»), no lib/useGuardaRafaga.ts, y solo filtra el clic:
// ni frena el mousedown (3768) ni tiene el modo «mismo punto» del clic que contesta (3679/3701/3751).
// ─────────────────────────────────────────────────────────────────────────────

/**
 * De dónde sale el texto esperado de la id 61 (leído el 29/10/2026 por la tarde):
 * · Confederación Hidrográfica del Ebro, https://www.chebro.es/es/web/guest/la-cuenca-del-ebro —
 *   «una superficie total de 85.534 Km2», «Es la cuenca hidrográfica más extensa de España» y «el
 *   17 % del territorio peninsular español» (con Andorra y Francia en la cabecera del Segre, sin
 *   cifra; aun descontándolas, la parte española supera a la del Duero).
 * · Confederación Hidrográfica del Duero, https://www.chduero.es/web/guest/la-cuenca-del-duero — la
 *   parte española «cubre 78.859 km2»; la demarcación internacional, 98.073 km², «la más extensa de
 *   la Península Ibérica».
 * Ninguna otra opción (Guadalquivir, Tajo, Duero) es también correcta: la del Duero, la mayor de las
 * tres, se queda en 78.859 km² dentro de España.
 */
const PREGUNTA_CUENCA = '¿Qué río tiene la mayor cuenca hidrográfica dentro de España?';
const EXPLICACION_CUENCA =
  'El Ebro tiene la cuenca hidrográfica más extensa de España: 85.534 km², el 17 % del territorio peninsular español (Confederación Hidrográfica del Ebro). El Duero tiene la mayor cuenca de la Península Ibérica si se cuenta su parte portuguesa, pero en territorio español cubre 78.859 km² (Confederación Hidrográfica del Duero).';

/** El veredicto y «Siguiente»/«Ver resultado» enteros en pantalla, por debajo de la barra del logo. */
async function veredictoALaVista(page: Page): Promise<string> {
  return page.evaluate(() => {
    const barra = (document.querySelector('[class*="headerBar"]') as Element).getBoundingClientRect().bottom;
    const v = (document.querySelector('[class*="feedbackMensaje"]') as Element).getBoundingClientRect();
    const s = (document.querySelector('[class*="btnSiguiente"]') as Element).getBoundingClientRect();
    const mal: string[] = [];
    if (v.top < barra || v.bottom > innerHeight) mal.push(`veredicto ${Math.round(v.top)}…${Math.round(v.bottom)}`);
    if (s.top < barra || s.bottom > innerHeight) mal.push(`botón ${Math.round(s.top)}…${Math.round(s.bottom)}`);
    return mal.length ? `${mal.join(' · ')} (barra ${Math.round(barra)}, alto ${innerHeight})` : 'a la vista';
  });
}

/** Lo que tiene el foco, legible: «<body>» o «TAG«texto»». */
async function quienTieneElFoco(page: Page): Promise<string> {
  return page.evaluate(() => {
    const a = document.activeElement;
    if (!a || a === document.body) return '<body>';
    return `${a.tagName}«${(a.textContent ?? '').replace(/\s+/g, ' ').trim().slice(0, 30)}»`;
  });
}

test.describe('Inspector 29/10/2026 (tarde) · móvil 360 × 640', () => {
  test.use({ viewport: { width: 360, height: 640 }, userAgent: MOVIL_UA, deviceScaleFactor: 2, isMobile: true, hasTouch: true });

  /**
   * CASO NORMAL — Difícil, todas bien salvo la id 61, que se contesta «Duero» (la clave vieja).
   * Esperado a mano: la id 61 ofrece Ebro, Guadalquivir, Tajo y Duero; «Duero» da «❌ Incorrecto. La
   * respuesta correcta es: "Ebro"» (CHE, arriba) con la explicación literal de EXPLICACION_CUENCA, el
   * marcador NO sube, el foco va a «Siguiente»/«Ver resultado» y a 360 × 640 el veredicto y el botón
   * quedan enteros bajo la barra del logo. Al final 19/20 = 0,95 → Math.round = 95 % → tramo ≥ 90 →
   * 🥇 «¡Experto en Geografía de España!»; «19 de 20 preguntas correctas (95 %)» con espacio duro;
   * estadísticas 19 · 1 · «95 %» · 20; una sola ficha fallada, la id 61 con «✓ Ebro».
   * El orden es aleatorio: si la id 61 no sale (20 de 25 por partida), «Jugar de nuevo» (hasta 4).
   */
  test('caso normal: «Duero» en la mayor cuenca dentro de España es «❌ … "Ebro"», a la vista, y 19 de 20 dan 95 % y 🥇', async ({ page }) => {
    test.setTimeout(300_000);
    await abrir(page, { semilla: 2961 });
    await esperarHidratado29(page);
    await arrancar(page, 'Difícil');
    let vista = false;
    for (let partida = 1; partida <= 4 && !vista; partida++) {
      if (partida > 1) {
        await page.getByRole('button', { name: 'Jugar de nuevo' }).click();
        await expect(progreso29(page)).toHaveText('Pregunta 1 de 20');
      }
      for (let n = 1; n <= 20; n++) {
        await expect(progreso29(page)).toHaveText(`Pregunta ${n} de 20`);
        const ficha = await fichaVisible(page);
        if (ficha.id !== 61) {
          await responder(page, 'bien');
        } else {
          vista = true;
          const previas = n - 1; // todas las anteriores, bien
          const ops = await textosOpcion(page);
          expect([...ops].sort()).toEqual(['Duero', 'Ebro', 'Guadalquivir', 'Tajo']);
          await tocarCentro(page, opciones(page).nth(ops.indexOf('Duero')));
          await expect(page.locator('[class*="feedbackMensaje"]')).toHaveText('❌ Incorrecto. La respuesta correcta es: "Ebro"');
          expect(norm(await page.locator('[class*="explicacionTexto"]').innerText())).toBe(norm(EXPLICACION_CUENCA));
          await expect(marcador(page)).toHaveText(`${previas} ${previas === 1 ? 'correcta' : 'correctas'}`);
          await expect(page.locator('[class*="btnSiguiente"]')).toBeFocused();
          await expect.poll(() => veredictoALaVista(page), { timeout: 3000 }).toBe('a la vista');
        }
        if (/Ver resultado/.test(await avanzar(page))) break;
      }
      await expect(page.locator('[class*="finTitulo"]')).toBeVisible();
    }
    expect(vista, 'la id 61 sale en alguna de las 4 partidas').toBe(true);
    const r = await resultado(page);
    expect(r.titulo).toBe('¡Experto en Geografía de España!');
    expect(r.medalla).toBe('🥇');
    expect(r.subtitulo).toBe(`19 de 20 preguntas correctas (95${DURO}%)`);
    expect(r.stats).toEqual({ Correctas: '19', Errores: '1', 'Puntuación': `95${DURO}%`, Jugadas: '20' });
    const lista = (await page.locator('[class*="errorItem"]').allTextContents()).map((t) => t.replace(/[ \t\n\r]+/g, ' ').trim());
    expect(lista).toEqual([`${PREGUNTA_CUENCA}✓ Ebro`]);
  });

  /**
   * CASO LÍMITE — Difícil a 360 × 640, contestando con un solo toque la opción MÁS BAJA que no es la
   * buena (la D, o la C si la D es la buena), después de bajar lo justo para verla: el sitio donde
   * enfocarSinCentrar (5b65607f, 3770) tiene que mover la página. Esperado a mano: en las 20, el foco
   * en «Siguiente pregunta →» (en la 20.ª, «Ver resultado») y el veredicto y el botón enteros bajo la
   * barra; 0/20 = 0 % → tramo < 50 → 🗺️ «Sigue explorando España»; «0 de 20 preguntas correctas
   * (0 %)»; estadísticas 0 · 20 · «0 %» · 20; 20 fichas falladas; el foco en el título del resultado.
   */
  test('caso límite: 20 fallos con la opción más baja dejan el veredicto a la vista y dan 0 % y 🗺️', async ({ page }) => {
    test.setTimeout(180_000);
    await abrir(page, { semilla: 2963 });
    await esperarHidratado29(page);
    await arrancar(page, 'Difícil');
    const fuera: string[] = [];
    for (let n = 1; n <= 20; n++) {
      await expect(progreso29(page)).toHaveText(`Pregunta ${n} de 20`);
      const ficha = await fichaVisible(page);
      const iC = (await textosOpcion(page)).indexOf(ficha.correcta);
      await page.waitForTimeout(500); // lee la pregunta: fuera de la ventana de ráfaga
      await tocarCentro(page, opciones(page).nth(iC === 3 ? 2 : 3));
      await expect(page.locator('[class*="feedbackMensaje"]')).toHaveText(`❌ Incorrecto. La respuesta correcta es: "${ficha.correcta}"`);
      await expect(page.getByRole('button', { name: n < 20 ? 'Siguiente pregunta →' : 'Ver resultado' })).toBeFocused();
      await page.waitForTimeout(200); // la 2.ª mirada de enfocarSinCentrar (120 ms)
      const v = await veredictoALaVista(page);
      if (v !== 'a la vista') fuera.push(`${n} (id ${ficha.id}): ${v}`);
      // Lee el veredicto antes de avanzar: un toque en el mismo punto dentro de la ventana de ráfaga
      // del que contestó se ignora desde 3822 (useGuardaRafaga, `soloMismoPunto`)
      await page.waitForTimeout(400);
      await tocarCentro(page, page.getByRole('button', { name: /Siguiente pregunta|Ver resultado/ }));
    }
    expect(fuera).toEqual([]);
    const r = await resultado(page);
    expect(r.titulo).toBe('Sigue explorando España');
    expect(r.medalla).toBe('🗺️');
    expect(r.subtitulo).toBe(`0 de 20 preguntas correctas (0${DURO}%)`);
    expect(r.stats).toEqual({ Correctas: '0', Errores: '20', 'Puntuación': `0${DURO}%`, Jugadas: '20' });
    expect(r.errores).toBe(20);
    await expect(page.locator('[class*="finTitulo"]')).toBeFocused();
  });

  /**
   * CASO DE RECHAZO · HALLAZGO NUEVO (operativa) — dos toques sobre la opción más baja, con ella
   * pegada al borde inferior (a 4 px), se saltan el veredicto y la explicación. El 1.º contesta;
   * enfocarSinCentrar (5b65607f) sube la vista lo justo para que «Siguiente pregunta →» asome por
   * abajo, y queda bajo el dedo; el 2.º toque (detail 2) cae en él y la guarda en línea lo deja pasar,
   * porque `responder` no marca nada (el hook compartido marca `soloMismoPunto` y lo ignora: 3679,
   * 3701 y 3751). Antes de 5b65607f el foco iba con preventScroll y la página no se movía.
   * Esperado: sigue «Pregunta n de 20» con su veredicto, su explicación y «Siguiente» (una sola
   * intención). Medido el 29/10/2026: 32 de 32 (8 por caso, a 360 × 640 y 360 × 740, con la opción a
   * 4 y a 20 px del borde) pasan a la pregunta siguiente sin enseñar ni el veredicto ni la explicación.
   * REPARADO (3822, /reparar 30/10/2026): la guarda en línea se cambió por useGuardaRafaga, y
   * `responder` marca `soloMismoPunto`.
   */
  test('hallazgo · dos toques en la opción más baja, pegada al borde, no se saltan el veredicto ni la explicación', async ({ page }) => {
    test.setTimeout(90_000);
    await abrir(page, { semilla: 2962 });
    await esperarHidratado29(page);
    await arrancar(page, 'Difícil');
    const saltos: string[] = [];
    for (let vuelta = 1; vuelta <= 3; vuelta++) {
      const antes = norm(await progreso29(page).innerText());
      await page.waitForTimeout(500); // lee la pregunta: fuera de la ventana de ráfaga
      const d = opciones(page).nth(3);
      await d.evaluate((e) => {
        const r = e.getBoundingClientRect();
        scrollBy(0, r.bottom - innerHeight + 4);
      });
      await page.waitForTimeout(80);
      const c = await d.boundingBox();
      if (!c) throw new Error('la opción D no tiene caja');
      await dobleToque(page, c.x + c.width / 2, c.y + c.height / 2);
      await page.waitForTimeout(200);
      const ahora = norm(await progreso29(page).innerText());
      if (ahora !== antes) {
        saltos.push(`${antes} → ${ahora} sin veredicto ni explicación`);
        continue;
      }
      await expect(page.locator('[class*="explicacionTexto"]')).toBeVisible();
      await avanzar(page);
    }
    expect(saltos).toEqual([]); // medido antes de 3822: las 3 vueltas saltaban
  });

  /**
   * HALLAZGO NUEVO (contenido) — la explicación que escribió la reparación (fa1153c1) pone «17 %» con
   * un espacio normal (U+0020). Regla del 25/09/2026 (CLAUDE.md §2, Ortografía de la RAE de 2010): el
   * «%» va separado con espacio duro (U+00A0), y el código nuevo lo cumple. Esperado «17 %» con
   * U+00A0 · obtenido U+0020 (data/preguntas-geografia-espana.ts, id 61). REPARADO (3826, 30/10/2026).
   */
  test('hallazgo · la explicación nueva de la id 61 separa el «%» con espacio duro', () => {
    const e = PREGUNTAS_GEOGRAFIA.find((p) => p.id === 61)?.explicacion ?? '';
    expect(e).toContain('85.534 km²');
    expect(e).toContain(`17${DURO}%`);
  });
});

test.describe('Inspector 29/10/2026 (tarde) · escritorio 1280 × 800', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  /**
   * HALLAZGO NUEVO (accesibilidad, forma del cabo C0514, variante de la OPCIÓN) — tras un doble clic
   * sobre una opción, el foco cae a <body> en vez de quedarse en «Siguiente pregunta →», adonde lo
   * lleva la app al contestar. El 2.º clic cae sobre la opción ya deshabilitada y el navegador suelta
   * el foco; la guarda en línea (solo «click») no lo ve. No cuenta de más ni contesta otra cosa (caso
   * de rechazo del bloque de la mañana). Medido el 29/10/2026: 6 de 6 en Fácil a 1280 × 800, y por
   * toque 6 de 6 a 360 × 740 (la C y la D) y 6 de 6 a 360 × 640.
   * REPARADO (3823, /reparar 30/10/2026): useGuardaRafaga devuelve el foco cuando el 2.º toque cae en
   * un control deshabilitado (testigo de la familia: «doble clic en la opción»).
   */
  test('hallazgo · tras un doble clic en una opción, el foco se queda en «Siguiente», no cae a <body>', async ({ page }) => {
    test.setTimeout(60_000);
    await abrir(page, { semilla: 2964 });
    await esperarHidratado29(page);
    await arrancar(page, 'Fácil');
    const perdidos: string[] = [];
    for (let n = 1; n <= 3; n++) {
      await expect(progreso29(page)).toHaveText(`Pregunta ${n} de 10`);
      await page.waitForTimeout(500);
      const c = await opciones(page).nth(2).boundingBox();
      if (!c) throw new Error('la opción C no tiene caja');
      await dobleClic(page, c.x + c.width / 2, c.y + c.height / 2);
      await expect(page.locator('[class*="explicacionTexto"]')).toBeVisible();
      const f = await quienTieneElFoco(page);
      if (!/^BUTTON«Siguiente pregunta/.test(f)) perdidos.push(`${n}/10: foco en ${f}`);
      await page.getByRole('button', { name: 'Siguiente pregunta →' }).click();
    }
    expect(perdidos).toEqual([]); // medido antes de 3823: «<body>» las tres veces
  });

  /**
   * HALLAZGO NUEVO (accesibilidad, forma del cabo C0514 en «Siguiente»; la app no recibió f0b18db0)
   * — tras un doble clic en «Siguiente pregunta →», el mousedown del 2.º (detail 2) mueve el foco a
   * lo que haya bajo el puntero en la pantalla nueva: la guarda en línea ignora su clic pero no su
   * mousedown, que es lo que f0b18db0 añadió a lib/useGuardaRafaga.ts (3768). Esperado (invariante
   * de la familia): el foco en el enunciado nuevo (H2, tabindex −1). Medido el 29/10/2026: en 8 de 8
   * se queda en «⬇️ Ver guía educativa» a 1280 × 800 y en <body> a 360 × 740 (bajo el dedo, un h3).
   * REPARADO (3824, /reparar 30/10/2026): useGuardaRafaga frena también el mousedown del 2.º clic.
   */
  test('hallazgo · tras un doble clic en «Siguiente», el foco va al enunciado nuevo y no a lo que haya debajo', async ({ page }) => {
    test.setTimeout(60_000);
    await abrir(page, { semilla: 2965 });
    await esperarHidratado29(page);
    await arrancar(page, 'Fácil');
    const robados: string[] = [];
    for (let n = 1; n <= 3; n++) {
      await page.waitForTimeout(500);
      await responder(page, 'bien');
      await page.waitForTimeout(300);
      const c = await page.getByRole('button', { name: 'Siguiente pregunta →' }).boundingBox();
      if (!c) throw new Error('«Siguiente» no tiene caja');
      await dobleClic(page, c.x + c.width / 2, c.y + c.height / 2);
      await expect(progreso29(page)).toHaveText(`Pregunta ${n + 1} de 10`);
      const f = await focoActual(page);
      if (f !== 'H2:-1') robados.push(`pregunta ${n + 1}: foco en ${await quienTieneElFoco(page)}`);
    }
    expect(robados).toEqual([]); // medido antes de 3824: «⬇️ Ver guía educativa» las tres veces
  });

  /**
   * HALLAZGO NUEVO (accesibilidad, forma del cabo C0516) — tras contestar, la opción buena y la
   * fallada solo se distinguen por el color (borde y fondo verdes o rojos, letra sobre #047857 o
   * #b91c1c; .opcion-correcta y .opcion-seleccionada-mal no añaden contenido). Su texto visible («A
   * Ebro», con la letra aria-hidden) y su nombre accesible no cambian y no llevan aria-label (WCAG
   * 1.4.1). El veredicto sí lo dice con texto («❌ Incorrecto. La respuesta correcta es: …»), la
   * lista de opciones no. La referencia, quiz-literatura-universal, pone ✓/✗ visibles (aria-hidden)
   * y «(respuesta correcta)» / «(tu respuesta, incorrecta)» en el nombre.
   * A mano: Fácil, fallar la 1.ª con la A (o la B si la A es la buena) → esperado que el texto o el
   * nombre accesible de la buena y de la fallada cambien al contestar.
   * REPARADO (3825, /reparar 30/10/2026): ✓/✗ visibles (aria-hidden) y la marca en el aria-label.
   */
  test('hallazgo · la opción correcta y la fallada no se distinguen solo por el color', async ({ page }) => {
    await abrir(page, { semilla: 2966 });
    await esperarHidratado29(page);
    await arrancar(page, 'Fácil');
    const f = await fichaVisible(page);
    const iC = (await textosOpcion(page)).indexOf(f.correcta);
    const iMal = iC === 0 ? 1 : 0;
    const marcas = () =>
      opciones(page).evaluateAll((bs) => bs.map((b) => `${(b as HTMLElement).innerText} | ${b.getAttribute('aria-label') ?? ''}`.replace(/\s+/g, ' ').trim()));
    const antes = await marcas();
    await opciones(page).nth(iMal).click();
    await expect(page.locator('[class*="feedbackMensaje"]')).toContainText('Incorrecto');
    // Sano: el color sí cambia (el defecto es que sea lo ÚNICO que cambia).
    const clases = await opciones(page).evaluateAll((bs) => bs.map((b) => b.className));
    expect(/opcion-correcta/.test(clases[iC]) && /opcion-seleccionada-mal/.test(clases[iMal])).toBe(true);
    const despues = await marcas();
    expect([iC, iMal].filter((i) => despues[i] === antes[i]).map((i) => despues[i]), 'texto y nombre idénticos a antes de contestar').toEqual([]);
  });

  /**
   * SANO (cabos C0515 y C0518, medidos el 29/10/2026) — la app no tiene cronómetro (no hay
   * formatTiempo que dé «2m 15s»); la barra de progreso tiene nombre («Progreso: pregunta 1 de 10»);
   * y la fila de «Jugar de nuevo» / «Cambiar dificultad» lleva flex-wrap: a 320 y a 360 px la página
   * no desborda en la partida ni en el resultado (scrollWidth = clientWidth).
   */
  test('sano · la barra de progreso tiene nombre y no hay cronómetro', async ({ page }) => {
    await abrir(page, { semilla: 2967 });
    await arrancar(page, 'Fácil');
    await expect(page.getByRole('progressbar', { name: 'Progreso: pregunta 1 de 10' })).toHaveCount(1);
    await expect(page.locator('[class*="quizPanel"]')).not.toContainText(/\d+\s?m\s?\d+\s?s|\d+:\d{2}/);
  });
});
