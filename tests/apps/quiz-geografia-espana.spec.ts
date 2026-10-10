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
    // ABIERTO (inspector 10/10/2026). page.tsx:54 — Difícil baraja el banco ENTERO (25 fácil + 25
    // medio + 25 difícil) aunque CONFIG_DIFICULTAD_GEO.dificil.pool = 'dificil'. Esperado a mano:
    // 20 de 20 difíciles; con el banco entero, 20·25/75 = 6,7 por partida. Medido el 10/10/2026:
    // 392 difíciles de 1.200 (60 partidas), media 6,5, máximo 11; ninguna partida con 20.
    test.fail();
    test.setTimeout(90_000);
    await abrir(page, { semilla: 13 });
    await arrancar(page, 'Difícil');
    const fichas = await jugar(page, 99);
    expect(fichas).toHaveLength(20);
    expect(fichas.filter((f) => f.dificultad !== 'dificil').map((f) => f.id), 'preguntas de otro nivel en «Difícil»').toEqual([]);
  });

  test('hallazgo · el marcador dice «1 correcta», no «1 correctas»', async ({ page }) => {
    // ABIERTO (inspector 10/10/2026). page.tsx:212 — `{aciertos} correctas` sin singular.
    test.fail();
    await abrir(page, { semilla: 3 });
    await arrancar(page, 'Fácil');
    await responder(page, 'bien');
    await expect(marcador(page)).toHaveText('1 correcta', { timeout: 2000 });
  });

  test('hallazgo · el porcentaje va separado con espacio duro («70 %»)', async ({ page }) => {
    // ABIERTO (inspector 10/10/2026). Regla de formato del 25/09/2026 (Ortografía RAE 2010):
    // page.tsx:277 y :289 pegan el «%». 7/10 → «7 de 10 preguntas correctas (70 %)» y «70 %».
    test.fail();
    test.setTimeout(90_000);
    await abrir(page, { semilla: 2 });
    await arrancar(page, 'Fácil');
    await jugar(page, 7);
    const r = await resultado(page);
    expect(r.subtitulo).toBe(`7 de 10 preguntas correctas (70${DURO}%)`);
    expect(r.stats['Puntuación']).toBe(`70${DURO}%`);
  });

  test('hallazgo · el foco no cae a <body> al empezar, al responder, al pasar de pregunta ni al volver', async ({ page }) => {
    // ABIERTO (inspector 10/10/2026). page.tsx:198/244/264/313/316 — «Comenzar quiz» se desmonta,
    // la opción pulsada queda disabled, «Siguiente» se desmonta y «Jugar de nuevo»/«Cambiar
    // dificultad» también: en los cinco casos el foco va a <body> (medido) y el teclado vuelve al
    // principio de la página. La gemela quiz-historia-espana lo resolvió el 26/09 (enunciado h2
    // con tabIndex −1, «Siguiente», título del resultado y «Comenzar quiz»).
    test.fail();
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
    // ABIERTO (inspector 10/10/2026). page.tsx:255 — role="alert" (con aria-live="polite", que
    // se contradicen) envuelve el panel entero, botón «Siguiente pregunta →» incluido, y nace ya
    // con contenido. Medido: región role=alert con 1 botón y texto «¡Correcto!…Siguiente pregunta →».
    test.fail();
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
  });

  test('hallazgo · «Comenzar quiz» no lleva el ▶ en su nombre accesible', async ({ page }) => {
    // ABIERTO (inspector 10/10/2026). page.tsx:199 — «Comenzar quiz ▶» sin aria-hidden; medido el
    // nombre accesible «Comenzar quiz ▶».
    test.fail();
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
    // ABIERTO (inspector 10/10/2026)
    test.fail();
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
    // ABIERTO (inspector 10/10/2026)
    test.fail();
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
    // ABIERTO (inspector 10/10/2026)
    test.fail();
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
    // ABIERTO (inspector 10/10/2026)
    test.fail();
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
      // ABIERTO (inspector 10/10/2026). Blanco sobre el degradado #2E86AB→#48A9A6 de «Comenzar»,
      // «Siguiente», «Jugar de nuevo» y el número de paso: 2,80:1 en el extremo teal (existe
      // --primary-boton, 5,47:1). Medido en claro: insignia de categoría 3,56 · letra blanca sobre
      // verde 2,54 / rojo 3,76 · «Preguntas que has fallado» 3,61 · pregunta fallada 3,30 ·
      // respuesta buena 2,22 · h3 del FAQ 4,11 · h2 del aviso 1,88. En oscuro: insignia 3,06 ·
      // letra sobre verde 1,92 / rojo 2,77 · h3 del FAQ 3,50.
      test.fail();
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
    // ABIERTO (inspector 10/10/2026) · C0153. FAQPage (metadata.ts:79): «…con 3.715 metros sobre el
    // nivel del mar…»; FAQ visible (page.tsx:438): «…con 3.718 m es el punto más alto de España…»;
    // el banco (ids 5 y 51, «¿Cuál es la altitud exacta del Teide?») da 3.718 m. El repositorio no
    // ancla la cifra del IGN en ningún sitio. Reparación: UNA constante en metadata.ts que importen
    // las dos bocas, con la cifra decidida en la fuente.
    test.fail();
    await abrir(page);
    const pregunta = '¿Cuál es el pico más alto de España?';
    const servida = (await faqServida(page))[pregunta];
    const visible = (await faqVisible(page))[pregunta];
    expect(servida && visible, 'la pregunta está en las dos FAQ').toBeTruthy();
    const altura = (t: string) => (t.match(/Teide[^.]*?(\d\.\d{3})\s?m/) ?? [])[1];
    expect(altura(servida)).toBe(altura(visible));
    expect(servida).toBe(visible);
  });

  test('hallazgo · «¿Cuántas provincias tiene España?» se contesta con el mismo texto en las dos FAQ', async ({ page }) => {
    // ABIERTO (inspector 10/10/2026). Mismas cifras (50 · 17 · Ceuta y Melilla) con dos redacciones;
    // la del FAQPage («distribuidas en 17 comunidades autónomas y 2 ciudades autónomas») se lee como
    // si Ceuta y Melilla tuvieran provincias. Reparación: una constante en metadata.ts.
    test.fail();
    await abrir(page);
    const pregunta = '¿Cuántas provincias tiene España?';
    expect((await faqServida(page))[pregunta]).toBe((await faqVisible(page))[pregunta]);
  });

  test('hallazgo · la app no enseña en un sitio la respuesta que en otro da por mala', async ({ page }) => {
    // ABIERTO (inspector 10/10/2026).
    // · Canarias: la guía (FAQ «¿Cuántas islas tiene España?») dice «7 islas habitadas
    //   principales»; la pregunta id 22 «¿Cuántas islas habitadas tiene el archipiélago canario?»
    //   da por buena 8 (con La Graciosa, «reconocida oficialmente en 2018») y por MALA el 7.
    // · Tajo: la explicación de la id 15 dice «El Tajo nace en Cuenca»; la id 59 «¿En qué
    //   provincia nace el río Tajo?» da por buena Teruel y por MALA Cuenca (y la explicación de la
    //   id 49, «Nace en la Sierra de Albarracín (Teruel)»).
    test.fail();
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
    // ABIERTO (inspector 10/10/2026). FAQ visible «¿Qué ríos atraviesan más comunidades autónomas?»
    // (page.tsx:446): «El Duero atraviesa Castilla y León, Zamora y parte de Aragón antes de entrar
    // en Portugal». La tabla de la misma guía pone Zamora entre las 9 provincias de Castilla y León
    // y la de ríos dice del Duero «Atraviesa Castilla y León y Portugal»; la id 75 lo hace nacer en
    // el Sistema Ibérico (Picos de Urbión, Soria).
    test.fail();
    await abrir(page);
    const texto = (await faqVisible(page))['¿Qué ríos atraviesan más comunidades autónomas?'] ?? '';
    const duero = (texto.match(/El Duero[^.]*\./) ?? [''])[0];
    expect(duero, 'Zamora es provincia de Castilla y León, no una comunidad').not.toMatch(/Castilla y León, Zamora/);
    expect(duero, 'el Duero no pasa por Aragón').not.toMatch(/Arag[oó]n/);
  });

  test('hallazgo · la guía no se contradice en Castilla y León ni en los husos horarios', async ({ page }) => {
    // ABIERTO (inspector 10/10/2026).
    // · Castilla y León: la FAQ visible da 94.225 km² y «la segunda de la Unión Europea»; la
    //   explicación de la id 10, 94.226 km² y «la más extensa de España y de la Unión Europea».
    // · «Le siguen Castilla-La Mancha (79.463 km²) y Andalucía (87.268 km²)»: con sus propias cifras
    //   la segunda es Andalucía.
    // · La curiosidad «Tres zonas horarias» explica que «España tiene técnicamente dos husos horarios».
    test.fail();
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
