import { test, expect, type Page, type Locator } from '@playwright/test';
import { PREGUNTAS_HISTORIA, type PreguntaHistoria } from '../../data/preguntas-historia-espana';
import { esperarPaginaAsentada } from './_hidratacion';

/**
 * Quiz Historia de España — test de regresión del Inspector (1.ª pasada 25/09/2026;
 * reparación de los hallazgos 2101-2124 el 26/09/2026)
 *
 * QUÉ PROMETE LA APP
 * ──────────────────
 * · <h1> «Quiz Historia de España» · subtítulo «Desde los íberos hasta la Constitución de 1978 y
 *   la democracia» · insignias con el total del banco (81), «3 niveles de dificultad» y el número
 *   de épocas que usa el banco (11): ambas cifras salen de los datos, no escritas a mano.
 * · Tres niveles: Fácil (10 preguntas, «Hechos clave y fechas principales»), Medio (15,
 *   «Personajes, causas y consecuencias») y Difícil (20, «Detalles, política y cultura»), cada uno
 *   con preguntas SOLO de su nivel.
 * · metadata.ts/faqJsonLd: sin filtro por época («Dentro de cada nivel las épocas se mezclan al
 *   azar»); ya no promete elegir época.
 * · Aviso del bloque educativo: «El grueso del quiz llega hasta 1978» y un bloque breve
 *   «Democracia (desde 1978)» con el 23-F, la CEE, 1992 y el euro.
 *
 * DE DÓNDE SALEN LOS VALORES ESPERADOS
 * ────────────────────────────────────
 * · Marcador: `porcentaje = Math.round(aciertos / preguntas.length * 100)` (page.tsx:135) y los
 *   tramos de `calcularMedalla`/`calcularTextoMedalla` (page.tsx:63-75): ≥ 90 🥇 «¡Experto en
 *   Historia de España!» · ≥ 70 🥈 «Gran conocedor de la historia» · ≥ 50 🥉 «Nivel
 *   intermedio» · resto 📚 «Sigue aprendiendo». Tamaños de partida: CONFIG_DIFICULTAD (10/15/20).
 * · La CLAVE con que se juega (qué opción pulsar para acertar o fallar) se lee del propio banco
 *   `data/preguntas-historia-espana.ts`: las partidas miden la MECÁNICA (marcador, bloqueo,
 *   reinicio, foco, barajado), no la historia. La verdad histórica de la clave se contrasta
 *   aparte, en «Contenido del banco», con cada valor escrito a mano y su fuente citada.
 *
 * ALEATORIEDAD
 * ────────────
 * `mezclar()` (Fisher-Yates sobre Math.random) baraja las preguntas y, en cada una, las cuatro
 * opciones. No hay semilla en la UI: se lee el enunciado que sale y se pulsa según la clave.
 * Medido el 25/09/2026 sobre 3.000 respuestas (150 partidas Difícil) la correcta cayó en
 * A 764 · B 743 · C 745 · D 748 (χ² = 0,37 con 3 g. l.): el barajado de opciones está sano, aunque
 * en el banco la correcta sea SIEMPRE la primera del array (81 de 81).
 */

const RUTA = '/quiz-historia-espana/';
const POR_TEXTO = new Map(PREGUNTAS_HISTORIA.map((p) => [p.pregunta, p]));
const norm = (s: string | null | undefined): string => (s ?? '').replace(/\s+/g, ' ').trim();
/** Espacio duro U+00A0: se construye con su código para que se vea en el fuente. */
const DURO = String.fromCharCode(0xa0);
/** «7 de 10 preguntas correctas (70 %)» admitiendo el % pegado o tras espacio duro (su formato se vigila aparte). */
const subtituloFinal = (a: number, t: number, p: number): RegExp =>
  new RegExp(`^${a} de ${t} preguntas correctas [(]${p}${DURO}?%[)]$`);
const porcentaje = (p: number): RegExp => new RegExp(`^${p}${DURO}?%$`);

type Nivel = 'Fácil' | 'Medio' | 'Difícil';

async function abrir(page: Page, tema?: 'light' | 'dark'): Promise<void> {
  await page.addInitScript((t) => {
    try {
      localStorage.setItem('meskeia_transparency_banner_dismissed', 'true');
      if (t) localStorage.setItem('meskeia-theme', t);
    } catch {
      /* sin almacenamiento: saldrá el aviso y el tema del sistema */
    }
  }, tema ?? null);
  // globals.css pone `* { transition: background-color 0.3s }`: sin esto, un color leído justo
  // después de responder es el de mitad de la transición (medido: la letra aún gris, 1,26:1).
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(RUTA);
  await expect(page.locator('h1')).toHaveText('Quiz Historia de España');
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
/** Segundo span de la barra de progreso: «N correctas» (el textContent del bloque pega los dos). */
const marcador = (page: Page): Locator => page.locator('[class*="progresoInfo"] span').nth(1);

async function fichaVisible(page: Page): Promise<PreguntaHistoria> {
  const texto = norm(await page.locator('[class*="preguntaTexto"]').innerText());
  const ficha = POR_TEXTO.get(texto);
  expect(ficha, `enunciado que no está en el banco: «${texto}»`).toBeTruthy();
  return ficha as PreguntaHistoria;
}

async function textosOpcion(page: Page): Promise<string[]> {
  return (await page.locator('[class*="opcionTexto"]').allInnerTexts()).map(norm);
}

/** Responde la pregunta visible. Devuelve la ficha y la letra (A-D) en que salió la correcta. */
async function responder(page: Page, modo: 'bien' | 'mal'): Promise<{ ficha: PreguntaHistoria; letra: string }> {
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
async function jugar(page: Page, aciertos: number): Promise<{ fichas: PreguntaHistoria[]; letras: string[] }> {
  const fichas: PreguntaHistoria[] = [];
  const letras: string[] = [];
  for (let n = 1; n <= 25; n++) {
    const { ficha, letra } = await responder(page, n <= aciertos ? 'bien' : 'mal');
    fichas.push(ficha);
    letras.push(letra);
    if (/Ver resultado/.test(await avanzar(page))) break;
  }
  return { fichas, letras };
}

async function resultado(page: Page) {
  await expect(page.locator('[class*="finTitulo"]')).toBeVisible();
  return page.evaluate(() => {
    // Se colapsan solo los blancos ASCII: `\s` incluye U+00A0 y borraba el espacio duro del «70 %»
    // que vigila el caso del porcentaje (26/09/2026).
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

/** Contraste del texto de `el` contra su fondo efectivo; con degradado, el PEOR de sus extremos. */
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

test.describe('Quiz Historia de España · partida', () => {
  /**
   * CASO NORMAL — Fácil, 7 bien y 3 mal.
   * Esperado a mano: 10 preguntas (CONFIG facil = 10, banco fácil = 29), distintas y todas de
   * dificultad «facil»; 7/10 = 70 % → tramo ≥ 70 → 🥈 «Gran conocedor de la historia»;
   * estadísticas 7 · 3 · 70 % · 10; tres fichas en «Preguntas que has fallado».
   */
  test('caso normal: 7 aciertos de 10 en Fácil dan 70 % y «Gran conocedor de la historia»', async ({ page }) => {
    test.setTimeout(90_000);
    await abrir(page);
    await arrancar(page, 'Fácil');
    await expect(page.locator('[class*="progresoInfo"]')).toContainText('Pregunta 1 de 10');
    const { fichas } = await jugar(page, 7);
    expect(fichas).toHaveLength(10);
    expect(new Set(fichas.map((f) => f.id)).size, 'pregunta repetida en la misma partida').toBe(10);
    expect(fichas.every((f) => f.dificultad === 'facil'), 'Fácil ha colado otro nivel').toBe(true);

    const r = await resultado(page);
    expect(r.titulo).toBe('Gran conocedor de la historia');
    expect(r.medalla).toBe('🥈');
    // El % se admite pegado o con espacio duro: el formato se vigila en su propio test (hallazgo abierto).
    expect(r.subtitulo).toMatch(subtituloFinal(7, 10, 70));
    expect(r.stats.Correctas).toBe('7');
    expect(r.stats.Errores).toBe('3');
    expect(r.stats['Puntuación']).toMatch(porcentaje(70));
    expect(r.stats.Jugadas).toBe('10');
    expect(r.errores).toBe(3);
  });

  /**
   * CASO LÍMITE — cero aciertos en Fácil y pleno en Medio.
   * Esperado a mano: 0/10 → 0 % → 📚 «Sigue aprendiendo», 10 fichas falladas; 15/15 → 100 % → 🥇
   * «¡Experto en Historia de España!», sin sección de fallos. Medio saca 15 de las 31 «medio».
   */
  test('caso límite: 0 de 10 da «Sigue aprendiendo» y 15 de 15 da «¡Experto en Historia de España!»', async ({ page }) => {
    test.setTimeout(120_000);
    await abrir(page);
    await arrancar(page, 'Fácil');
    await jugar(page, 0);
    let r = await resultado(page);
    expect(r.titulo).toBe('Sigue aprendiendo');
    expect(r.medalla).toBe('📚');
    expect(r.subtitulo).toMatch(subtituloFinal(0, 10, 0));
    expect(r.stats.Correctas).toBe('0');
    expect(r.stats.Errores).toBe('10');
    expect(r.errores).toBe(10);

    await page.getByRole('button', { name: 'Cambiar dificultad' }).click();
    await arrancar(page, 'Medio');
    const { fichas } = await jugar(page, 99);
    expect(fichas).toHaveLength(15);
    expect(fichas.every((f) => f.dificultad === 'medio')).toBe(true);
    r = await resultado(page);
    expect(r.titulo).toBe('¡Experto en Historia de España!');
    expect(r.medalla).toBe('🥇');
    expect(r.subtitulo).toMatch(subtituloFinal(15, 15, 100));
    expect(r.stats.Errores).toBe('0');
    await expect(page.locator('[class*="erroresSection"]')).toHaveCount(0);
  });

  /**
   * LO QUE NO DEBE OCURRIR — doble clic en la correcta, clic tardío en otra opción, doble clic
   * en «Siguiente» y «Jugar de nuevo».
   * Esperado a mano: `responder` sale por `fase !== 'jugando'` y las opciones quedan disabled →
   * 1 acierto, no 2, y la otra NO se marca como fallada; el doble clic en «Siguiente» avanza UNA
   * pregunta (el botón desaparece al primer clic); «Jugar de nuevo» no recarga la página
   * (conserva una marca en window), pone el marcador a 0 y reparte otra tanda.
   */
  test('caso de rechazo: el doble clic no puntúa doble ni salta preguntas y «Jugar de nuevo» no recarga', async ({ page }) => {
    test.setTimeout(120_000);
    await abrir(page);
    await page.evaluate(() => { (window as unknown as { __marca: string }).__marca = 'sin-recarga'; });
    await arrancar(page, 'Fácil');

    const ficha = await fichaVisible(page);
    const ops = await textosOpcion(page);
    const iC = ops.indexOf(ficha.correcta);
    await opciones(page).nth(iC).dblclick();
    await opciones(page).nth(iC === 0 ? 1 : 0).click({ force: true });
    await expect(page.locator('[class*="feedbackMensaje"]')).toContainText('¡Correcto!');
    const clases = await opciones(page).evaluateAll((bs) => bs.map((b) => b.className));
    expect(clases.filter((c) => /opcion-correcta/.test(c))).toHaveLength(1);
    expect(clases.filter((c) => /opcion-seleccionada-mal/.test(c)), 'el clic tardío ha marcado otra opción').toHaveLength(0);
    await expect(marcador(page)).toHaveText(/^1 correctas?$/);

    await page.getByRole('button', { name: /Siguiente pregunta/ }).dblclick();
    await expect(page.locator('[class*="progresoInfo"]')).toContainText('Pregunta 2 de 10');
    // El 2.º clic no ha contestado la pregunta 2 por su cuenta (medido: cae en vacío o en el
    // conmutador de la guía, que no afecta a la partida)
    await expect(page.locator('[class*="feedbackMensaje"]')).toHaveCount(0);

    const resto = await jugar(page, 0);
    const primera = [ficha.id, ...resto.fichas.map((f) => f.id)];
    const r = await resultado(page);
    expect(r.subtitulo).toMatch(subtituloFinal(1, 10, 10)); // 1 acierto pese a 3 clics
    expect(r.stats.Correctas).toBe('1');

    await page.getByRole('button', { name: 'Jugar de nuevo' }).click();
    await expect(page.locator('[class*="progresoInfo"]')).toContainText('Pregunta 1 de 10');
    await expect(marcador(page)).toHaveText('0 correctas');
    expect(await page.evaluate(() => (window as unknown as { __marca?: string }).__marca)).toBe('sin-recarga');
    const segunda = (await jugar(page, 0)).fichas.map((f) => f.id);
    // Misma tanda y mismo orden: probabilidad 1 / (29·28·…·20) ≈ 2·10⁻¹⁴
    expect(segunda.join(','), '«Jugar de nuevo» ha repetido la misma tanda en el mismo orden').not.toBe(primera.join(','));
  });

  /**
   * BARAJADO — sospecha (d) de la familia de quizzes: ¿sacaría nota «pulsar siempre C»?
   * En el banco la correcta es SIEMPRE la primera opción (81 de 81), así que todo depende de
   * `mezclar()`. 8 partidas Difícil = 160 respuestas; con reparto uniforme el χ² (3 g. l.)
   * supera 16,27 solo 1 de cada 1.000 veces. Medido 25/09/2026: χ² = 0,37 sobre 3.000.
   */
  test('barajado: la correcta se reparte entre A, B, C y D (χ² < 16,27)', async ({ page }) => {
    test.setTimeout(240_000);
    await abrir(page);
    const cuenta: Record<string, number> = { A: 0, B: 0, C: 0, D: 0 };
    for (let g = 0; g < 8; g++) {
      if (g > 0) await page.getByRole('button', { name: 'Jugar de nuevo' }).click();
      else await arrancar(page, 'Difícil');
      const { letras } = await jugar(page, 99);
      for (const l of letras) cuenta[l]++;
    }
    const total = Object.values(cuenta).reduce((a, b) => a + b, 0);
    expect(total).toBe(160);
    const chi2 = Object.values(cuenta).reduce((s, o) => s + (o - total / 4) ** 2 / (total / 4), 0);
    expect(chi2, `reparto de la correcta ${JSON.stringify(cuenta)}`).toBeLessThan(16.27);
  });
});

// ─────────────────────────────────────────────────────────────────────────────

// Hallazgos del 25/09/2026, reparados el 26/09/2026: cada caso afirma ya el comportamiento correcto.
test.describe('Inspector 25/09/2026 · hallazgos de la partida (reparados)', () => {
  test('hallazgo · «Difícil» saca sus 20 preguntas del nivel difícil', async ({ page }) => {
    // page.tsx:59 — el nivel Difícil baraja el banco ENTERO (29 fácil + 31 medio + 21 difícil) aunque
    // CONFIG_DIFICULTAD.dificil.pool = 'dificil' y la tarjeta promete «Detalles, política y cultura».
    // Medido: 747 difíciles de 3.000 (24,9 %; 20·21/81 = 5,2 por partida) y 1.053 fáciles (35,1 %).
    await abrir(page);
    await arrancar(page, 'Difícil');
    const { fichas } = await jugar(page, 99);
    expect(fichas).toHaveLength(20);
    const niveles = fichas.map((f) => f.dificultad);
    expect(niveles.filter((d) => d !== 'dificil'), 'preguntas de otro nivel en «Difícil»').toEqual([]);
  });

  test('hallazgo · el marcador dice «1 correcta», no «1 correctas»', async ({ page }) => {
    // page.tsx:217 — `{aciertos} correctas` sin singular.
    await abrir(page);
    await arrancar(page, 'Fácil');
    await responder(page, 'bien');
    await avanzar(page);
    await expect(marcador(page)).toHaveText('1 correcta', { timeout: 2000 });
  });

  test('hallazgo · el porcentaje va separado con espacio duro («70 %»)', async ({ page }) => {
    // Regla de formato del 25/09/2026 (Ortografía RAE 2010): page.tsx:280 y :292 pegan el «%».
    await abrir(page);
    await arrancar(page, 'Fácil');
    await jugar(page, 7);
    const r = await resultado(page);
    expect(r.subtitulo).toBe(`7 de 10 preguntas correctas (70${DURO}%)`);
    expect(r.stats['Puntuación']).toBe(`70${DURO}%`);
  });

  test('hallazgo · el foco no cae a <body> al empezar, al responder ni al pasar de pregunta', async ({ page }) => {
    // page.tsx:203/248/267 — «Comenzar quiz» se desmonta, la opción pulsada queda disabled y
    // «Siguiente» se desmonta: en los tres casos el foco va a <body> y el teclado vuelve al principio.
    const enBody = () => page.evaluate(() => document.activeElement === document.body || document.activeElement === null);
    await abrir(page);
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
    expect(tras, 'acciones tras las que el foco acaba en <body>').toEqual([]);
  });

  test('hallazgo · la región viva no anuncia los emojis ✅/❌', async ({ page }) => {
    // page.tsx:258-262 — «✅ ¡Correcto!» y «❌ Incorrecto…» son CADENAS dentro de un role="alert":
    // el lector de pantalla lee el nombre del emoji. check:a11y-jsx no lo ve (solo mira JSX).
    await abrir(page);
    await arrancar(page, 'Fácil');
    await responder(page, 'bien');
    const textos = await page.evaluate(() =>
      [...document.querySelectorAll('[aria-live], [role="alert"], [role="status"]')]
        .filter((r) => r.id !== '__next-route-announcer__' && r.closest('[class*="quizPanel"]'))
        .map((r) => {
          const clon = r.cloneNode(true) as HTMLElement;
          clon.querySelectorAll('[aria-hidden="true"]').forEach((n) => n.remove());
          return (clon.textContent ?? '').replace(/\s+/g, ' ').trim();
        }),
    );
    expect(textos.length, 'no hay región viva en el panel').toBeGreaterThan(0);
    for (const t of textos) expect(t).not.toMatch(/[✅❌]/u);
  });

  test('hallazgo · «Comenzar quiz» no lleva el ▶ en su nombre accesible', async ({ page }) => {
    // page.tsx:204 — «Comenzar quiz ▶» sin aria-hidden (lo marca check:a11y-jsx sobre el fichero).
    await abrir(page);
    await expect(page.getByRole('button', { name: 'Comenzar quiz', exact: true })).toHaveCount(1, { timeout: 2000 });
  });

  test('hallazgo · la promesa de elegir época del FAQ tiene un control detrás', async ({ page }) => {
    // metadata.ts:63 — «Puedes seleccionar el nivel y la época histórica que quieras repasar»; la
    // pantalla de inicio solo tiene los tres niveles y una tarjeta fija de «Modo Aprendizaje».
    await abrir(page);
    const faq = await page.evaluate(() => [...document.querySelectorAll('script[type="application/ld+json"]')].map((s) => s.textContent ?? '').join(' '));
    const promete = /época histórica que quieras repasar/.test(faq);
    const controles = await page.locator('[class*="inicioPanel"] button, [class*="inicioPanel"] select').allInnerTexts();
    const hayControlDeEpoca = controles.some((t) => /[ÉE]poca|Siglo|Reconquista|Romana|Visigoda|Franquismo/.test(t));
    expect(!promete || hayControlDeEpoca, `FAQ promete elegir época; controles: ${controles.map(norm).join(' | ')}`).toBe(true);
  });

  test('hallazgo · el aviso «llega hasta 1978» no convive con preguntas de 1981-2002', async ({ page }) => {
    // Antes el aviso decía «El período cubierto llega hasta 1978 […] no está incluida» frente a las
    // preguntas del 23-F (1981), la CEE (1986), Barcelona 92 y el euro. Reparación: esas preguntas
    // se quedan, con su época propia «Democracia (desde 1978)», y el aviso lo dice.
    await abrir(page);
    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
    const aviso = await page.getByText('El período cubierto llega hasta 1978').count();
    const posteriores = PREGUNTAS_HISTORIA.filter((p) =>
      [...`${p.pregunta} ${p.correcta}`.matchAll(/\b(1[0-9]{3}|20[0-9]{2})\b/g)].some((m) => Number(m[1]) > 1978),
    );
    expect(aviso > 0 && posteriores.length > 0, `aviso visible y preguntas posteriores a 1978: ${posteriores.map((p) => p.id).join(', ')}`).toBe(false);
    if (posteriores.length > 0) {
      await expect(page.locator('[class*="warningBox"]')).toContainText('Democracia (desde 1978)');
      expect(posteriores.filter((p) => p.epoca !== 'democracia').map((p) => p.id), 'posteriores a 1978 fuera de «Democracia»').toEqual([]);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────

test.describe('Inspector 25/09/2026 · contraste', () => {
  for (const tema of ['light', 'dark'] as const) {
    test(`hallazgo · botones de acción y textos de estado con 4,5:1 (${tema === 'light' ? 'claro' : 'oscuro'})`, async ({ page }) => {
      // Blanco sobre el degradado #2E86AB→#48A9A6: 2,80:1 en el extremo teal (existe --primary-boton).
      // Claro: insignia de época 3,56 · letra blanca sobre verde 2,54 / rojo 3,76 · lista de fallos
      // 3,30 / 2,22 · «Preguntas que has fallado» 3,61 · h2 del aviso 1,88 · h3 del FAQ 4,11.
      // Oscuro: insignia 3,06 · letra sobre verde 1,92 / rojo 2,77 · h3 del FAQ 3,50.
      test.setTimeout(90_000);
      await abrir(page, tema);
      const fallos: string[] = [];
      const medir = async (nombre: string, sel: string) => {
        const r = await contraste(page, sel);
        if (r !== null && r < 4.5) fallos.push(`${nombre} ${r.toFixed(2)}`);
      };
      await medir('Comenzar quiz', '[class*="btnIniciar"]');
      await arrancar(page, 'Fácil');
      await medir('insignia de época', '[class*="epocaBadge"]');
      const ficha = await fichaVisible(page);
      const ops = await textosOpcion(page);
      const iC = ops.indexOf(ficha.correcta);
      const iM = iC === 0 ? 1 : 0;
      await opciones(page).nth(iM).click();
      await expect.poll(() => opciones(page).nth(iC).evaluate((b) => /opcion-correcta/.test(b.className))).toBe(true);
      await opciones(page).nth(iC).locator('[class*="opcionLetra"]').evaluate((e) => { e.id = 'letra-ok'; });
      await opciones(page).nth(iM).locator('[class*="opcionLetra"]').evaluate((e) => { e.id = 'letra-mal'; });
      // La letra de una opción neutra conserva el gris de partida: se espera a que las otras dos
      // hayan terminado de pintar su verde/rojo antes de medir.
      const iN = [0, 1, 2, 3].find((i) => i !== iC && i !== iM) as number;
      await opciones(page).nth(iN).locator('[class*="opcionLetra"]').evaluate((e) => { e.id = 'letra-neutra'; });
      await expect
        .poll(() =>
          page.evaluate(() => {
            const bg = (id: string) => getComputedStyle(document.getElementById(id) as Element).backgroundColor;
            return bg('letra-ok') !== bg('letra-neutra') && bg('letra-mal') !== bg('letra-neutra');
          }),
        )
        .toBe(true);
      await medir('letra sobre verde', '#letra-ok');
      await medir('letra sobre rojo', '#letra-mal');
      await medir('Siguiente', '[class*="btnSiguiente"]');
      await avanzar(page);
      await jugar(page, 0);
      await medir('pregunta fallada', '[class*="errorPregunta"]');
      await medir('respuesta buena en la lista', '[class*="errorCorrecta"]');
      await medir('«Preguntas que has fallado»', '[class*="erroresTitulo"]');
      await page.getByRole('button', { name: 'Ver guía educativa' }).click();
      await medir('h3 del FAQ', '[class*="faqItem"] h3');
      await medir('h2 del aviso', '[class*="warningBox"] h2');
      expect(fallos).toEqual([]);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Móvil de 360 px (sospecha (b) de la familia). Medido el 25/09/2026: la barra fija del logo
 * ocupa y = 0…62; tras «Comenzar quiz» (con la vista donde estaba el botón) y tras cada
 * «Siguiente pregunta», «Pregunta N de 10» queda en y = −198…−177 y el enunciado entre y = −73 y
 * 39: sus primeras líneas fuera de pantalla y las siguientes bajo la barra.
 */
test.describe('Inspector 25/09/2026 · móvil 360 × 740', () => {
  test.use({
    viewport: { width: 360, height: 740 },
    userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Mobile Safari/537.36',
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  });

  test('hallazgo · tras «Comenzar» y tras «Siguiente» el enunciado no queda fuera ni bajo la barra fija', async ({ page }) => {
    test.setTimeout(60_000);
    const tocar = async (loc: Locator): Promise<void> => {
      await loc.scrollIntoViewIfNeeded();
      const b = await loc.boundingBox();
      if (!b) throw new Error('el elemento no tiene caja');
      await page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2);
    };
    const tapadas = (): Promise<string[]> =>
      page.evaluate(() => {
        const barra = document.querySelector('[class*="headerBar"]');
        const tapa = barra ? barra.getBoundingClientRect() : null;
        const fuera: string[] = [];
        for (const clase of ['progresoInfo', 'preguntaTexto']) {
          const el = document.querySelector(`[class*="${clase}"]`);
          if (!el) continue;
          const rango = document.createRange();
          rango.selectNodeContents(el);
          for (const l of rango.getClientRects()) {
            if (l.top < 0 || (tapa && l.top < tapa.bottom && l.bottom > tapa.top)) fuera.push(`${clase} ${Math.round(l.top)}…${Math.round(l.bottom)}`);
          }
        }
        return [...new Set(fuera)];
      });
    await abrir(page);
    await tocar(page.getByRole('button', { name: /^Fácil/ }));
    await tocar(page.getByRole('button', { name: /Comenzar quiz/ }));
    await expect(page.locator('[class*="preguntaTexto"]')).toBeAttached();
    await expect.poll(tapadas, { message: 'tras «Comenzar quiz»', timeout: 3000 }).toEqual([]);

    const ficha = await fichaVisible(page);
    await tocar(opciones(page).nth((await textosOpcion(page)).indexOf(ficha.correcta)));
    await expect(page.locator('[class*="feedbackMensaje"]')).toBeVisible();
    await tocar(page.getByRole('button', { name: /Siguiente pregunta/ }));
    await expect(page.locator('[class*="progresoInfo"]')).toContainText('Pregunta 2 de 10');
    await expect.poll(tapadas, { message: 'tras «Siguiente pregunta»', timeout: 3000 }).toEqual([]);
  });
});

// ─────────────────────────────────────────────────────────────────────────────

/**
 * CONTENIDO DEL BANCO — cotejado el 25/09/2026. Cada valor esperado está escrito a mano y
 * lleva su fuente. Se localiza cada pregunta por su enunciado (no por id), para que una
 * reparación que reescriba la pregunta no deje el test apuntando a otra.
 */
const pregunta = (re: RegExp): PreguntaHistoria => {
  const p = PREGUNTAS_HISTORIA.find((q) => re.test(q.pregunta));
  if (!p) throw new Error(`no hay ninguna pregunta que case con ${re}`);
  return p;
};
const incorrectas = (p: PreguntaHistoria): string[] => p.opciones.filter((o) => o !== p.correcta);

test.describe('Inspector 25/09/2026 · contenido del banco', () => {
  test('sano · el banco tiene 81 preguntas, 4 opciones distintas y la correcta entre ellas', () => {
    expect(PREGUNTAS_HISTORIA).toHaveLength(81); // lo que anuncian la insignia y la metadata
    for (const p of PREGUNTAS_HISTORIA) {
      expect(new Set(p.opciones).size, `id ${p.id}`).toBe(4);
      expect(p.opciones, `id ${p.id}`).toContain(p.correcta);
    }
  });

  test('hallazgo · euro: la moneda oficial de España lo es desde 1999, no desde 2002', () => {
    // Ley 46/1998, de 17 de diciembre (BOE-A-1998-29216), art. 3.1: «Desde el 1 de enero de 1999,
    // inclusive, la moneda del sistema monetario nacional es el euro». 2002 es la circulación de
    // billetes y monedas. Antes la app preguntaba por la «moneda oficial», marcaba 2002 y daba por
    // mala 1999. Reparación: el enunciado pregunta por la circulación (una sola respuesta, 2002) y
    // la explicación da las dos fechas.
    const p = pregunta(/euro/);
    if (/moneda oficial/i.test(p.pregunta)) expect(p.correcta).toBe('1999');
    else {
      expect(p.pregunta).toMatch(/billetes y monedas/);
      expect(p.correcta).toBe('2002');
    }
    expect(p.explicacion).toMatch(/1 de enero de 1999/);
    expect(p.explicacion).toMatch(/1 de enero de 2002/);
  });

  test('hallazgo · Armada de 1588: «La Gran Armada» no puede ser una opción incorrecta', () => {
    // es.wikipedia «Armada Invencible»: «La Grande y Felicísima Armada o Gran Armada de 1588
    // (apodada posteriormente Armada Invencible)». Dos opciones correctas. Reparación: se pregunta
    // por el SOBRENOMBRE posterior, y ninguna opción errónea es un nombre de esa flota.
    const p = pregunta(/Felipe II envió contra Inglaterra en 1588/);
    expect(p.pregunta).toMatch(/sobrenombre/);
    expect(p.correcta).toBe('La Armada Invencible');
    for (const o of incorrectas(p)) expect(o).not.toMatch(/Gran(de)? (y Felicísima )?Armada/);
  });

  test('hallazgo · primer Habsburgo: Felipe I el Hermoso reinó en Castilla (1506) y se da por malo sin matiz', () => {
    // es.wikipedia «Felipe I de Castilla»: rey de Castilla del 12/07 al 25/09/1506, «quien introdujo
    // la casa de los Habsburgo en territorios de la actual España».
    const p = pregunta(/primer rey de la dinastía Habsburgo/);
    const lista = incorrectas(p).some((o) => /Felipe I\b.*Hermoso/.test(o));
    expect(!lista || /Felipe I\b/.test(p.explicacion)).toBe(true);
  });

  test('hallazgo · Viriato fue lusitano, no celtíbero', () => {
    // RAH, Historia Hispánica «Viriato»: caudillo lusitano (Guerras Lusitanas, 147-139 a. C.). La
    // propia explicación de la app dice «el líder lusitano»: contradice al enunciado.
    const p = PREGUNTAS_HISTORIA.find((q) => q.correcta === 'Viriato');
    expect(p, 'no hay pregunta cuya respuesta sea Viriato').toBeTruthy();
    expect(p?.pregunta).not.toMatch(/celt[ií]bero/i);
    expect(p?.pregunta).toMatch(/lusitano/);
  });

  test('hallazgo · la Constitución de 1978 no establece cuántas provincias hay', () => {
    // CE arts. 137 y 141.1 (BOE-A-1978-31229): la provincia es entidad local; ningún artículo fija
    // el número ni las enumera. La explicación dice «Esta estructura fue consagrada en la Constitución».
    const p = pregunta(/provincias/);
    expect(p.pregunta).not.toMatch(/establece la Constituci[oó]n/i);
    expect(p.explicacion).not.toMatch(/consagrada en la Constituci[oó]n/i);
  });

  test('hallazgo · 1898: no fueron las «últimas colonias» y Cuba no se cedió a EE. UU.', () => {
    // Tratado de París (10/12/1898), art. I: «España renuncia a todo derecho de soberanía y propiedad
    // sobre Cuba» (art. II cede Puerto Rico y Guam). Carolinas, Marianas y Palaos se vendieron a
    // Alemania en 1899 (tratado germano-español) y Guinea siguió siendo española hasta 1968.
    const p = pregunta(/Cuba, Puerto Rico y Filipinas/);
    expect(p.pregunta).not.toMatch(/últimas colonias/);
    expect(p.explicacion).not.toMatch(/cedió Cuba/);
  });

  test('hallazgo · la expulsión de los judíos no fue «antes de 1492»', () => {
    // Edicto de Granada: 31 de marzo de 1492 (la propia explicación lo fecha en 1492).
    const p = PREGUNTAS_HISTORIA.find((q) => /judíos/.test(q.correcta));
    expect(p).toBeTruthy();
    expect(p?.pregunta).not.toMatch(/antes de 1492/);
    expect(p?.pregunta).toMatch(/en 1492/);
  });

  test('hallazgo · la expedición de Magallanes-Elcano no «demostró que la Tierra era redonda»', () => {
    // La esfericidad se conocía desde la Antigüedad: Eratóstenes midió la circunferencia en el s. III a. C.
    const p = PREGUNTAS_HISTORIA.find((q) => q.correcta === 'La expedición de Magallanes-Elcano');
    expect(p).toBeTruthy();
    expect(p?.explicacion).not.toMatch(/Tierra era redonda/);
    expect(p?.pregunta).not.toMatch(/demostró/);
  });

  test('hallazgo · el Estatuto catalán de 1932 no fue «recuperado en la Transición»', () => {
    // es.wikipedia «Estatuto de autonomía de Cataluña de 1932»: el de Núria (1931) era el proyecto; las
    // Cortes aprobaron otro texto (52 → 18 artículos) el 9/9/1932; suspendido en 1934 y derogado por
    // Franco el 5/4/1938. En la Transición se aprobó uno nuevo (Estatuto de Sau, 1979).
    // Reparación: el enunciado pregunta por el PROYECTO refrendado en 1931, que es lo que fue Núria.
    const p = pregunta(/Estatuto de Autonomía de Cataluña/);
    expect(p.correcta).toBe('Estatuto de Núria');
    expect(p.pregunta).toMatch(/proyecto/);
    expect(p.explicacion).not.toMatch(/recuperado en la Transición/);
    expect(p.explicacion).toMatch(/5 de abril de 1938/);
  });

  test('hallazgo · fechas y datos menores en las explicaciones', () => {
    // Nueva Planta de Cataluña: decreto de 16/01/1716 (Archivo de la Corona de Aragón), no 1714.
    // Califato de Córdoba: 929-1031 (siglos X-XI), no «siglos IX y X».
    // PCE: abandonó el leninismo en su IX Congreso (abril de 1978), después de legalizarse.
    // Utrecht (1713): Sicilia pasó a Saboya, no «los territorios italianos a Austria».
    // Referéndum de 1978: 87,87 % de síes → «87,9 %» (así lo dice la propia guía), no «87,8 %».
    const fallos: string[] = [];
    if (/Nueva Planta \(1714\)/.test(pregunta(/Mancomunitat/).explicacion)) fallos.push('Mancomunitat: Nueva Planta (1714)');
    if (/siglos IX y X/.test(pregunta(/capital del Califato de Córdoba/).explicacion)) fallos.push('Califato: siglos IX y X');
    if (/había renunciado al leninismo/.test(pregunta(/legalizado el Partido Comunista/).explicacion)) fallos.push('PCE: leninismo');
    if (/territorios italianos a Austria/.test(pregunta(/tratado \(1713\)/i).explicacion)) fallos.push('Utrecht: Italia a Austria');
    if (/87,8\s?%/.test(pregunta(/actual Constitución/).explicacion)) fallos.push('referéndum: 87,8 %');
    expect(fallos).toEqual([]);
  });

  test('hallazgo · erratas: «Spain» y «Al-Magrreb»', () => {
    expect(pregunta(/Desarrollismo|crecimiento económico español en los años 60/).explicacion).not.toMatch(/\bSpain\b/);
    expect(pregunta(/España árabe/).opciones).not.toContain('Al-Magrreb');
  });

  test('sano · otras preguntas con dos respuestas defendibles, reformuladas en la misma pasada (26/09/2026)', () => {
    // Misma forma de defecto que 2102, hallada al revisar el banco entero:
    // · reino germánico peninsular: los SUEVOS tuvieron reino en Gallaecia (409-585);
    // · 1.ª constitución: el Estatuto de Bayona (1808) se cita como primer texto constitucional;
    // · período 1874-1931 «basado en la alternancia»: «El Turno Pacífico» ES la alternancia;
    // · cuadro de Goya «relacionado con la resistencia»: también lo es «El dos de mayo de 1808»;
    // · «el rey en cuyos dominios nunca se ponía el sol»: la frase se aplicó también a Carlos I;
    // · «matrimonio que unió ambas coronas» (1469) con 1479, año de la unión, como errónea.
    const opcionesDe = (id: number): string[] => incorrectas(PREGUNTAS_HISTORIA.find((q) => q.id === id) as PreguntaHistoria);
    expect(opcionesDe(6)).not.toContain('Los suevos');
    expect(pregunta(/Cortes de Cádiz en 1812/).correcta).toBe('La Pepa');
    expect(opcionesDe(37)).not.toContain('El Estatuto de Bayona');
    expect(opcionesDe(42)).not.toContain('El Turno Pacífico');
    expect(pregunta(/cuadro de Goya/).pregunta).toMatch(/ejecución/);
    expect(pregunta(/corona de Portugal/).pregunta).not.toMatch(/nunca se ponía el sol/);
    expect(pregunta(/se casaron Fernando de Aragón e Isabel de Castilla/).pregunta).not.toMatch(/unió ambas coronas/);
  });

  test('hallazgo · la insignia «Siglo XIX» no cae sobre hechos de 1909-1931', () => {
    // La tabla de la propia app fecha «Siglo XIX» en 1808-1902; las preguntas de 1909, 1914,
    // 1921, 1923 y la Restauración hasta 1931 llevan epoca 'siglo-xix'.
    const mal = PREGUNTAS_HISTORIA.filter(
      (p) => p.epoca === 'siglo-xix' && [...`${p.pregunta} ${p.correcta}`.matchAll(/\b(1[89][0-9]{2})\b/g)].some((m) => Number(m[1]) > 1902),
    ).map((p) => p.id);
    expect(mal).toEqual([]);
  });

  test('hallazgo · 12 de octubre: la explicación da algo de contexto más allá del «Día de la Hispanidad en España»', () => {
    // Antipatrón 8 del CLAUDE.md y §1.bis (Latam): en Argentina la fecha es «Día del Respeto a la
    // Diversidad Cultural» (Decreto 1584/2010) y en Venezuela «Día de la Resistencia Indígena» (2002).
    expect(pregunta(/llegó Cristóbal Colón a América/).explicacion).toMatch(
      /Diversidad Cultural|Resistencia Indígena|pueblos originarios|indígenas|conquista|coloniza/i,
    );
  });
});
