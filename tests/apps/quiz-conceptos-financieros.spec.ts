import { test, expect, type Page, type Locator } from '@playwright/test';
import { esperarPaginaAsentada } from './_hidratacion';

/**
 * Quiz de Conceptos Financieros — test de regresión del Inspector (1.ª pasada, 28/10/2026)
 *
 * QUÉ PROMETE LA APP
 * ──────────────────
 * · <h1> «Quiz de Conceptos Financieros» · subtítulo «15 preguntas para descubrir cuánto sabes sobre
 *   dinero, ahorro, inversión e impuestos» · metadata: «Test educativo de 15 preguntas […] Aprende
 *   mientras juegas» · applications.ts: «Con explicaciones tras cada respuesta».
 * · Abre ya en la primera pregunta (sin pantalla de inicio, sin niveles, sin selector de N): es la
 *   única de la familia de los quizzes que no tiene «Empezar». Tras la última, «Ver resultado» da
 *   un título por tramos, «N / 15» y un «Resumen por tema» con aciertos por categoría (pantalla
 *   que no tiene ninguna hermana). La única salida del resultado es «Repetir quiz».
 *
 * DE DÓNDE SALEN LOS VALORES ESPERADOS
 * ────────────────────────────────────
 * · Nota: `porcentaje = aciertos / 15 · 100` y `getNivel()` (page.tsx:96-101): ≥ 90 🏆 «¡Experto
 *   financiero!» · ≥ 70 🌟 «Muy bien» · ≥ 50 📚 «En camino» · resto 💪 «A seguir aprendiendo».
 *   Con 15 preguntas: 14 → 93,3 % · 13 → 86,7 % · 11 → 73,3 % · 10 → 66,7 % · 8 → 53,3 % · 7 → 46,7 %.
 * · Categorías (en el orden en que aparecen en el banco, page.tsx:22-38): Economía básica (P1, P11,
 *   P15) · Ahorro e inversión (P2, P3) · Presupuesto (P4, P5) · Ahorro (P6) · Deuda (P7, P12, P13) ·
 *   Banca (P8) · Inversión (P9, P14) · Impuestos (P10).
 * · CLAVE: la respuesta correcta de cada enunciado, cotejada a mano el 28/10/2026 contra el
 *   concepto (no copiada del índice `correcta`). En la P14 la clave reproduce la que marca la app
 *   para poder conducir la partida, y el error de esa clave se mide aparte (hallazgo del banco).
 * · No hay barajado: preguntas y opciones salen siempre en el mismo orden.
 */

const RUTA = '/quiz-conceptos-financieros/';
/**
 * Espacio duro a espacio, «%» pegado al número y blancos colapsados: así la clave no depende de
 * cómo se repare el formato del porcentaje (hallazgo aparte).
 */
const norm = (s: string | null | undefined): string =>
  (s ?? '').replace(/ /g, ' ').replace(/(\d) %/g, '$1%').replace(/\s+/g, ' ').trim();

const CLAVE = new Map<string, string>(
  [
    ['¿Qué es la inflación?', 'Que sube el precio general de las cosas'],
    ['¿Qué significa "interés compuesto"?', 'Intereses que se calculan sobre el capital + los intereses anteriores'],
    // 1.000 € · 1,05 = 1.050 € (un año: simple y compuesto coinciden)
    ['Tienes 1.000 € en el banco al 5% anual. ¿Cuánto tendrás en 1 año?', '1.050 €'],
    ['¿Qué es un presupuesto?', 'Un plan que organiza ingresos y gastos'],
    ['¿Cuál es la regla del 50/30/20?', '50% necesidades, 30% deseos, 20% ahorro'],
    ['¿Qué es un fondo de emergencia?', 'Ahorro reservado para imprevistos'],
    ['¿Qué pasa si solo pagas el mínimo de tu tarjeta de crédito?', 'Pagas muchos más intereses a largo plazo'],
    ['¿Qué es la TAE?', 'Tasa Anual Equivalente — el coste real de un préstamo'],
    ['¿Qué es diversificar las inversiones?', 'Repartir el dinero en diferentes tipos de inversión'],
    ['¿Qué es el IRPF?', 'El impuesto sobre la renta de las personas físicas'],
    // 1,01 / 1,03 − 1 = −1,94 %: se pierde poder adquisitivo
    ['Si la inflación es del 3% y tu cuenta da un 1%, ¿qué pasa con tu dinero?', 'Pierdes poder adquisitivo (tu dinero vale menos)'],
    ['¿Qué es un aval?', 'Una persona o bien que garantiza el pago de una deuda'],
    ['¿Cuál de estas deudas suele tener el interés más alto?', 'Tarjeta de crédito'],
    // A los 35: 100 €·120 meses al 5 % = 15.528 € frente a 200 €·60 meses = 13.601 € (3702, más abajo)
    ['¿Qué acaba con más dinero: ahorrar 100 € al mes de los 25 a los 35 años, o 200 € al mes de los 30 a los 35?', 'Empezar a los 25 con 100 €/mes (si se invierte)'],
    ['¿Qué es el IPC?', 'Índice de Precios de Consumo — mide la inflación'],
  ].map(([e, c]) => [norm(e), norm(c)]),
);

async function abrir(page: Page): Promise<void> {
  await page.addInitScript(() => {
    try {
      localStorage.setItem('meskeia_transparency_banner_dismissed', 'true');
    } catch {
      /* sin almacenamiento: saldrá el aviso de transparencia */
    }
  });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(RUTA);
  await expect(page.locator('h1')).toHaveText('Quiz de Conceptos Financieros');
  // Sin <input>: la espera que vale es la de la página con la hidratación confirmada.
  await esperarPaginaAsentada(page);
}

const opciones = (page: Page): Locator => page.locator('[class*="opcionBtn"]');
const enunciado = (page: Page): Locator => page.locator('[class*="preguntaTexto"]');
const progreso = (page: Page): Locator => page.locator('[class*="progressInfo"] span').first();
const explicacion = (page: Page): Locator => page.locator('[class*="explicacionCard"]');
const heroResultado = (page: Page): Locator => page.locator('[class*="resultadoHero"]');

async function textosOpcion(page: Page): Promise<string[]> {
  const brutos = await opciones(page).evaluateAll((bs) =>
    bs.map((b) => {
      const letra = b.querySelector('[class*="opcionLetra"]')?.textContent ?? '';
      return (b.textContent ?? '').slice(letra.length);
    }),
  );
  return brutos.map((t) => norm(t).replace(/\s*[✓✗]$/u, ''));
}

async function indiceCorrecta(page: Page): Promise<number> {
  const texto = norm(await enunciado(page).innerText());
  const correcta = CLAVE.get(texto);
  expect(correcta, `enunciado que no está en la clave: «${texto}»`).toBeTruthy();
  const ops = await textosOpcion(page);
  const i = ops.indexOf(correcta as string);
  expect(i, `la correcta «${correcta}» no está entre ${JSON.stringify(ops)}`).toBeGreaterThanOrEqual(0);
  return i;
}

type Modo = 'bien' | 'mal' | number;

/** Contesta la pregunta visible: bien, mal (la A, o la B si la A es la buena) o la opción N. */
async function responder(page: Page, modo: Modo): Promise<boolean> {
  const iC = await indiceCorrecta(page);
  const i = typeof modo === 'number' ? modo : modo === 'bien' ? iC : iC === 0 ? 1 : 0;
  await opciones(page).nth(i).click();
  await expect(explicacion(page)).toBeVisible();
  // La clave de la app coincide con la cotejada a mano: «¡Correcto!» solo si se pulsó la buena
  await expect(explicacion(page).locator('strong')).toHaveText(i === iC ? '¡Correcto!' : 'Incorrecto');
  return i === iC;
}

async function avanzar(page: Page): Promise<string> {
  const boton = page.getByRole('button', { name: /Siguiente pregunta|Ver resultado/ });
  const rotulo = norm(await boton.innerText());
  await boton.click();
  return rotulo;
}

/** Juega hasta el resultado; `plan(n)` dice cómo contestar la pregunta n (1-15). Devuelve los aciertos. */
async function jugar(page: Page, plan: (n: number) => Modo): Promise<number> {
  let aciertos = 0;
  for (let n = 1; n <= 20; n++) {
    await expect(progreso(page)).toHaveText(`Pregunta ${n} de 15`);
    if (await responder(page, plan(n))) aciertos++;
    if (/Ver resultado/.test(await avanzar(page))) {
      expect(n, 'el banco tiene las 15 preguntas que anuncian el hero y la metadata').toBe(15);
      return aciertos;
    }
  }
  throw new Error('20 preguntas sin llegar al resultado');
}

async function resultado(page: Page) {
  await expect(heroResultado(page)).toBeVisible();
  return page.evaluate(() => {
    const t = (n: Element | null | undefined): string => (n?.textContent ?? '').replace(/[ \t\n\r]+/g, ' ').trim();
    const hero = document.querySelector('[class*="resultadoHero"]');
    return {
      emoji: t(hero?.querySelector('[class*="resultadoEmoji"]')),
      titulo: t(hero?.querySelector('h2')),
      puntuacion: t(hero?.querySelector('[class*="resultadoPuntuacion"]')),
      texto: t(hero?.querySelector('p')),
      temas: [...document.querySelectorAll('[class*="categoriaItem"]')].map(
        (c) => `${t(c.querySelector('[class*="categoriaNombre"]'))} ${t(c.querySelector('[class*="categoriaScore"]'))}`,
      ),
    };
  });
}

const claseTermina = (clases: string, nombre: string): boolean =>
  clases.split(/\s+/).some((c) => c === nombre || c.endsWith(`_${nombre}`));

// ─────────────────────────────────────────────────────────────────────────────

test.describe('Quiz de Conceptos Financieros · partida', () => {
  /**
   * CASO NORMAL — P1-P11 bien y P12-P15 mal.
   * Esperado a mano: 11/15 = 73,3 % → tramo ≥ 70 → 🌟 «Muy bien», «11 / 15». Por tema: Economía
   * básica 2/3 (P1 y P11 bien, P15 mal) · Ahorro e inversión 2/2 · Presupuesto 2/2 · Ahorro 1/1 ·
   * Deuda 1/3 (P7 bien, P12 y P13 mal) · Banca 1/1 · Inversión 1/2 (P9 bien, P14 mal) · Impuestos 1/1.
   */
  test('caso normal: 11 aciertos de 15 dan «11 / 15», «Muy bien» y el resumen por tema', async ({ page }) => {
    test.setTimeout(90_000);
    await abrir(page);
    await expect(page.locator('[class*="hero"] [class*="subtitle"]').first()).toContainText('15 preguntas');
    const aciertos = await jugar(page, (n) => (n <= 11 ? 'bien' : 'mal'));
    expect(aciertos).toBe(11);
    const r = await resultado(page);
    expect(r.puntuacion).toBe('11 / 15');
    expect(r.titulo).toBe('Muy bien');
    expect(r.emoji).toBe('🌟');
    expect(r.texto).toBe('Tienes buena base. Repasa los conceptos que fallaste.');
    expect(r.temas).toEqual([
      'Economía básica 2/3',
      'Ahorro e inversión 2/2',
      'Presupuesto 2/2',
      'Ahorro 1/1',
      'Deuda 1/3',
      'Banca 1/1',
      'Inversión 1/2',
      'Impuestos 1/1',
    ]);
  });

  /**
   * CASO LÍMITE — todo mal, «Repetir quiz» y todo bien.
   * Esperado a mano: 0/15 → 💪 «A seguir aprendiendo», todos los temas a 0; «Repetir quiz» vuelve
   * a «Pregunta 1 de 15» sin recargar (conserva una marca en window) y sin respuesta; 15/15 → 🏆
   * «¡Experto financiero!».
   */
  test('caso límite: 0 de 15, «Repetir quiz» sin recargar y 15 de 15', async ({ page }) => {
    test.setTimeout(120_000);
    await abrir(page);
    await page.evaluate(() => {
      (window as unknown as { __marca: string }).__marca = 'sin-recarga';
    });
    expect(await jugar(page, () => 'mal')).toBe(0);
    let r = await resultado(page);
    expect(r.puntuacion).toBe('0 / 15');
    expect(r.titulo).toBe('A seguir aprendiendo');
    expect(r.emoji).toBe('💪');
    expect(r.temas.every((t) => /^.+ 0\/\d$/.test(t)), r.temas.join(' · ')).toBe(true);

    await page.getByRole('button', { name: 'Repetir quiz' }).click();
    await expect(progreso(page)).toHaveText('Pregunta 1 de 15');
    await expect(explicacion(page)).toHaveCount(0);
    for (let i = 0; i < 4; i++) await expect(opciones(page).nth(i)).toBeEnabled();
    expect(await page.evaluate(() => (window as unknown as { __marca?: string }).__marca)).toBe('sin-recarga');

    expect(await jugar(page, () => 'bien')).toBe(15);
    r = await resultado(page);
    expect(r.puntuacion).toBe('15 / 15');
    expect(r.titulo).toBe('¡Experto financiero!');
    expect(r.emoji).toBe('🏆');
  });

  /**
   * UMBRALES — los bordes de `getNivel()` con 15 preguntas.
   * 14 → 93,3 % ≥ 90 → «¡Experto financiero!» · 13 → 86,7 % → «Muy bien» · 10 → 66,7 % → «En
   * camino» · 8 → 53,3 % → «En camino» · 7 → 46,7 % → «A seguir aprendiendo».
   */
  test('umbrales: 14, 13, 10, 8 y 7 aciertos caen en su tramo', async ({ page }) => {
    test.setTimeout(180_000);
    await abrir(page);
    const tramos: [number, string][] = [
      [14, '¡Experto financiero!'],
      [13, 'Muy bien'],
      [10, 'En camino'],
      [8, 'En camino'],
      [7, 'A seguir aprendiendo'],
    ];
    for (const [k, titulo] of tramos) {
      expect(await jugar(page, (n) => (n <= k ? 'bien' : 'mal'))).toBe(k);
      const r = await resultado(page);
      expect(r.puntuacion).toBe(`${k} / 15`);
      expect(r.titulo, `${k} aciertos`).toBe(titulo);
      await page.getByRole('button', { name: 'Repetir quiz' }).click();
    }
  });

  /**
   * LO QUE DEBE IGNORARSE — doble clic en la correcta y un clic tardío en otra opción.
   * Esperado a mano: `responder` sale por `mostrarExplicacion` y las opciones quedan disabled →
   * sigue «¡Correcto!», una sola opción en verde y ninguna en rojo; jugando el resto mal, 1 / 15.
   */
  test('caso de rechazo: la segunda respuesta a la misma pregunta no cuenta', async ({ page }) => {
    test.setTimeout(90_000);
    // A 1280×720 (y a 360×740) el 2.º clic del doble clic cae en «Siguiente pregunta», que el foco
    // sube bajo el puntero: es el hallazgo del doble toque en una opción, medido aparte. Aquí se
    // aísla la regla «una respuesta por pregunta» en un alto donde no ocurre.
    await page.setViewportSize({ width: 1280, height: 800 });
    await abrir(page);
    const iC = await indiceCorrecta(page);
    await opciones(page).nth(iC).dblclick();
    await opciones(page)
      .nth(iC === 0 ? 1 : 0)
      .click({ force: true });
    await expect(explicacion(page).locator('strong')).toHaveText('¡Correcto!');
    const clases = await opciones(page).evaluateAll((bs) => bs.map((b) => b.className));
    expect(clases.filter((c) => claseTermina(c, 'correcta'))).toHaveLength(1);
    expect(clases.filter((c) => claseTermina(c, 'incorrecta')), 'el clic tardío ha marcado otra opción').toHaveLength(0);
    await avanzar(page);
    const resto = await jugar2(page);
    expect(resto).toBe(0);
    const r = await resultado(page);
    expect(r.puntuacion).toBe('1 / 15'); // 1 acierto pese a 3 clics en la P1
  });

  /** Invariante de la familia: foco al enunciado (tabindex -1) y opciones sin aria-pressed. */
  test('sano · foco tras «Siguiente», «Ver resultado» y «Repetir quiz»; opciones sin aria-pressed', async ({ page }) => {
    test.setTimeout(90_000);
    await abrir(page);
    const enfocado = (sel: string) => page.evaluate((s) => document.activeElement === document.querySelector(s), sel);
    expect(await page.locator('[class*="opcionBtn"][aria-pressed]').count()).toBe(0);
    for (let n = 1; n <= 15; n++) {
      await opciones(page).nth(await indiceCorrecta(page)).focus();
      await page.keyboard.press('Enter');
      await expect(explicacion(page)).toBeVisible();
      expect(await page.locator('button[aria-pressed]:disabled').count()).toBe(0);
      // Tras responder, el foco va a «Siguiente» (la opción pulsada queda disabled)
      await expect.poll(() => page.evaluate(() => (document.activeElement?.textContent ?? '').trim())).toMatch(/Siguiente pregunta|Ver resultado/);
      await page.keyboard.press('Enter');
      if (n < 15) {
        await expect(progreso(page)).toHaveText(`Pregunta ${n + 1} de 15`);
        await expect.poll(() => enfocado('[class*="preguntaTexto"]'), { message: `foco tras «Siguiente» ${n}` }).toBe(true);
        await expect(enunciado(page)).toHaveAttribute('tabindex', '-1');
      }
    }
    await expect.poll(() => enfocado('[class*="resultadoHero"]'), { message: 'foco tras «Ver resultado»' }).toBe(true);
    await page.getByRole('button', { name: 'Repetir quiz' }).focus();
    await page.keyboard.press('Enter');
    await expect(progreso(page)).toHaveText('Pregunta 1 de 15');
    await expect.poll(() => enfocado('[class*="preguntaTexto"]'), { message: 'foco tras «Repetir quiz»' }).toBe(true);
  });
});

/** Resto de la partida (desde la pregunta visible) contestando mal. Devuelve los aciertos. */
async function jugar2(page: Page): Promise<number> {
  let aciertos = 0;
  for (let n = 0; n < 20; n++) {
    if (await responder(page, 'mal')) aciertos++;
    if (/Ver resultado/.test(await avanzar(page))) return aciertos;
  }
  throw new Error('20 preguntas sin llegar al resultado');
}

// ─────────────────────────────────────────────────────────────────────────────

/**
 * DOBLE TOQUE (invariante de la familia, cabo C0082). Ratón de verdad, como el testigo
 * tests/familias/quizzes.spec.ts: 1.er clic suelto en el centro del botón, esperar a que la
 * pantalla NUEVA esté pintada y el 2.º clic de la ráfaga (`detail` 2) en el mismo punto. En cada
 * «Siguiente pregunta», en «Ver resultado» y en «Repetir quiz».
 *
 * La app no tiene guarda (ni `useGuardaRafaga` ni una local). Medido el 28/10/2026, con y sin el
 * aviso de transparencia (las mismas cifras):
 *   · 360×740: el 2.º toque del PRIMER «Siguiente» cae en la opción D de la P2 («Interés fijo que
 *     nunca cambia») y la contesta: 15 bien dan 14 / 15 (2 de 2 corridas). Abre la guía 4 de 14.
 *   · 390×844: abre la guía 4 de 14 (el testigo de la familia mide a este ancho y pasa: no mira la guía).
 *   · 412×915: abre la guía 6 de 14 · 768×1024: 12 de 14 y también en «Repetir quiz» ·
 *     1280×800: 1 de 14 (el último «Siguiente») · 1920×1080: 1 de 14.
 *   · «Ver resultado» no se come la nota en ningún ancho (cae en el resumen por tema).
 */
async function partidaConRafagas(page: Page): Promise<string[]> {
  const incidencias: string[] = [];
  const url = page.url();
  const guia = (): Locator => page.getByRole('button', { name: /guía educativa/i });

  async function rafaga(boton: Locator, pintada: () => Promise<boolean>, paso: string): Promise<boolean> {
    await boton.scrollIntoViewIfNeeded();
    await page.waitForTimeout(100);
    const caja = await boton.boundingBox();
    if (!caja) throw new Error(`${paso}: el botón no tiene caja`);
    const [x, y] = [caja.x + caja.width / 2, caja.y + caja.height / 2];
    await page.mouse.move(x, y);
    await page.mouse.down({ clickCount: 1 });
    await page.mouse.up({ clickCount: 1 });
    await expect.poll(pintada, { intervals: [20], timeout: 3000, message: `${paso}: el primer toque cambia de pantalla` }).toBe(true);
    await page.waitForTimeout(80);
    const guiaAntes = await guia().getAttribute('aria-expanded');
    await page.mouse.down({ clickCount: 2 });
    await page.mouse.up({ clickCount: 2 });
    await page.waitForTimeout(400);
    if (page.url() !== url) {
      incidencias.push(`${paso}: saca de la app (${page.url()})`);
      return false;
    }
    if ((await explicacion(page).count()) > 0) incidencias.push(`${paso}: contesta la pregunta nueva`);
    if ((await guia().getAttribute('aria-expanded')) !== guiaAntes) {
      incidencias.push(`${paso}: abre la guía`);
      await guia().click(); // se cierra con un clic suelto para medir cada paso igual
      await page.waitForTimeout(150);
    }
    return true;
  }

  for (let n = 1; n <= 15; n++) {
    if ((await explicacion(page).count()) === 0) await responder(page, 'bien');
    const boton = page.getByRole('button', { name: /Siguiente pregunta|Ver resultado/ });
    const antes = norm(await enunciado(page).innerText());
    const ultima = n === 15;
    const sigue = await rafaga(
      boton,
      async () =>
        ultima
          ? (await heroResultado(page).count()) > 0
          : norm(await enunciado(page).innerText()) !== antes,
      ultima ? 'Ver resultado' : `Siguiente ${n}`,
    );
    if (!sigue) return incidencias;
  }
  if ((await heroResultado(page).count()) === 0) incidencias.push('Ver resultado: la ráfaga se come la nota');
  else if (norm(await page.locator('[class*="resultadoPuntuacion"]').innerText()) !== '15 / 15')
    incidencias.push(`resultado: ${norm(await page.locator('[class*="resultadoPuntuacion"]').innerText())} con las 15 contestadas bien a propósito`);
  await rafaga(
    page.getByRole('button', { name: 'Repetir quiz' }),
    async () => (await opciones(page).count()) > 0,
    'Repetir quiz',
  );
  return incidencias;
}

// REPARADOS el 28/10/2026 (hallazgos 3700 y 3701): la app usa useGuardaRafaga, y contestar marca
// con `soloMismoPunto`.
test.describe('Inspector 28/10/2026 · doble toque (sin guarda)', () => {
  test('3700 · 360×740: el 2.º toque del primer «Siguiente» no contesta la pregunta 2', async ({ page }) => {
    // Mide: tras el 1.er «Siguiente», el 2.º clic de la ráfaga cae en la opción D de la P2.
    await page.setViewportSize({ width: 360, height: 740 });
    await abrir(page);
    await responder(page, 'bien');
    const sig = page.getByRole('button', { name: 'Siguiente pregunta' });
    await sig.scrollIntoViewIfNeeded();
    await page.waitForTimeout(100);
    const caja = await sig.boundingBox();
    if (!caja) throw new Error('«Siguiente» sin caja');
    const [x, y] = [caja.x + caja.width / 2, caja.y + caja.height / 2];
    await page.mouse.move(x, y);
    await page.mouse.down({ clickCount: 1 });
    await page.mouse.up({ clickCount: 1 });
    await expect(progreso(page)).toHaveText('Pregunta 2 de 15');
    await page.waitForTimeout(80);
    await page.mouse.down({ clickCount: 2 });
    await page.mouse.up({ clickCount: 2 });
    await page.waitForTimeout(400);
    await expect(explicacion(page), 'la ráfaga ha contestado la P2 sin que nadie la eligiera').toHaveCount(0, { timeout: 1000 });
  });

  /**
   * Doble toque en una OPCIÓN (fuera del invariante de la familia, que solo mira «Empezar»,
   * «Siguiente» y «Ver resultado»). Al contestar, el efecto de foco hace
   * `siguienteRef.current?.focus()` SIN preventScroll (page.tsx:89): si «Siguiente pregunta» queda
   * bajo el borde, el navegador sube la página y el botón cae bajo el puntero, así que el 2.º toque
   * lo pulsa y la explicación de la P1 no se llega a ver. Medido el 28/10/2026 en la P1: 360×740 y
   * 1280×720 (el escritorio por defecto de Playwright) sí; 390, 412, 768, 1280×800 y 1920 no.
   */
  for (const [ancho, alto] of [
    [360, 740],
    [1280, 720],
  ] as const) {
    test(`3701 · ${ancho}×${alto}: el doble toque en una respuesta de la P1 no se salta su explicación`, async ({ page }) => {
      await page.setViewportSize({ width: ancho, height: alto });
      await abrir(page);
      const op = opciones(page).nth(await indiceCorrecta(page));
      await op.scrollIntoViewIfNeeded();
      const caja = await op.boundingBox();
      if (!caja) throw new Error('la opción no tiene caja');
      const [x, y] = [caja.x + caja.width / 2, caja.y + caja.height / 2];
      await page.mouse.move(x, y);
      await page.mouse.down({ clickCount: 1 });
      await page.mouse.up({ clickCount: 1 });
      await expect(explicacion(page)).toBeVisible();
      await page.waitForTimeout(80);
      await page.mouse.down({ clickCount: 2 });
      await page.mouse.up({ clickCount: 2 });
      await page.waitForTimeout(300);
      await expect(progreso(page), 'el 2.º toque ha pulsado «Siguiente pregunta»').toHaveText('Pregunta 1 de 15', { timeout: 1000 });
      await expect(explicacion(page)).toBeVisible({ timeout: 1000 });
    });
  }

  for (const [ancho, alto] of [
    [360, 740],
    [412, 915],
    [768, 1024],
    [1280, 800],
  ] as const) {
    test(`3700 · ${ancho}×${alto}: ninguna ráfaga en «Siguiente», «Ver resultado» ni «Repetir quiz» contesta, abre la guía ni saca de la app`, async ({ page }) => {
      // Mide la partida entera: lista cada paso en el que el 2.º toque hizo algo. Medido: 360 →
      // contesta la P2 + guía 4; 412 → guía 6; 768 → guía 12 + «Repetir quiz»; 1280 → guía 1.
      test.setTimeout(120_000);
      await page.setViewportSize({ width: ancho, height: alto });
      await abrir(page);
      expect(await partidaConRafagas(page)).toEqual([]);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────

test.describe('Inspector 28/10/2026 · banco y nota', () => {
  /**
   * P14 «¿Qué es mejor: ahorrar 100 € al mes durante 10 años, o 200 € al mes durante 5 años?» — la
   * app da por buena «Ahorrar 100 €/mes durante 10 años (si se invierte)» porque «el dinero
   * ahorrado antes tiene más tiempo para crecer». Empezando los dos HOY, es al revés: el plan de
   * 200 € mete cada euro antes. Al 5 % anual (0,4167 % al mes, aportación a fin de mes), al cabo de
   * 10 años: 100 €·120 meses = 15.528 € · 200 €·60 meses y 5 años quieto = 13.601 € · 1,2834 =
   * 17.455 €. Solo gana el de 100 € si el de 200 € empieza 5 años más tarde (13.601 € al año 10),
   * y el enunciado no lo dice.
   * REPARADO el 28/10/2026: el enunciado fija las fechas —100 € de los 25 a los 35 años, 200 € de
   * los 30 a los 35— y el principio que la explicación quería enseñar pasa a ser cierto: los dos
   * acaban a la vez y suman 12.000 €, pero el de 100 € empieza antes. A los 35, con las mismas
   * cuentas: 100 €·120 meses = 15.528 € frente a 200 €·60 meses = 13.601 €; desde ahí crecen igual.
   */
  test('3702 · la P14 dice cuándo empieza cada plan y da por buena la que acaba con más dinero', async ({ page }) => {
    test.setTimeout(90_000);
    const i = 0.05 / 12;
    const vfCuotas = (cuota: number, meses: number): number => (cuota * ((1 + i) ** meses - 1)) / i;
    // Con los dos empezando HOY ganaría el de 200 € (el caso del hallazgo)…
    expect(vfCuotas(200, 60) * (1 + i) ** 60).toBeGreaterThan(vfCuotas(100, 120));
    // …y con los dos acabando a los 35, el de 100 € que empieza a los 25
    const plan100 = vfCuotas(100, 120);
    const plan200 = vfCuotas(200, 60);
    expect(plan100).toBeCloseTo(15528, -1);
    expect(plan200).toBeCloseTo(13601, -1);

    await abrir(page);
    for (let n = 1; n < 14; n++) {
      await responder(page, 'bien');
      await avanzar(page);
    }
    const texto = norm(await enunciado(page).innerText());
    expect(texto).toMatch(/100 € al mes de los 25 a los 35 años.*200 € al mes de los 30 a los 35/);
    await opciones(page).first().click();
    await expect(explicacion(page)).toBeVisible();
    const ops = await textosOpcion(page);
    const clases = await opciones(page).evaluateAll((bs) => bs.map((b) => b.className));
    const marcada = ops[clases.findIndex((c) => claseTermina(c, 'correcta'))];
    expect(marcada).toMatch(/Empezar a los 25 con 100 €\/mes/);
    const exp = norm(await explicacion(page).innerText());
    expect(exp).toContain('15.528 €');
    expect(exp).toContain('13.601 €');
  });

  /**
   * Sin barajado: la correcta es la B en 12 de las 15 (A en la TAE y el IPC, C en la tarjeta).
   * Pulsar siempre B da 12 / 15 = 80 % → «Muy bien — Tienes buena base». Con las opciones
   * barajadas, una letra fija acierta como Binomial(15; 0,25): P(≥ 11) ≈ 1·10⁻⁴.
   */
  test('hallazgo · contestar siempre la B no saca «Muy bien»', async ({ page }) => {
    test.fail();
    test.setTimeout(90_000);
    await abrir(page);
    const aciertos = await jugar(page, () => 1);
    const r = await resultado(page);
    expect(r.puntuacion).toBe(`${aciertos} / 15`);
    expect(aciertos, `siempre B → ${r.puntuacion} «${r.titulo}»`).toBeLessThan(11);
  });

  /** Cifras del FAQPage recalculadas a mano: correctas. */
  test('sano · las cifras del FAQPage cuadran (1.000 € al 7 % en 30 años; 10.000 € con un 3 % en 10)', async ({ page }) => {
    await abrir(page);
    const faq = norm(
      await page.evaluate(() =>
        [...document.querySelectorAll('script[type="application/ld+json"]')].map((s) => s.textContent ?? '').join(' '),
      ),
    );
    // 1.000 · 1,07³⁰ = 7.612,26 € → «más de 7.600 €»
    expect(faq).toContain('se convierten en más de 7.600 €');
    expect(1000 * 1.07 ** 30).toBeGreaterThan(7600);
    expect(1000 * 1.07 ** 30).toBeLessThan(7700);
    // 10.000 / 1,03¹⁰ = 7.440,94 € → «unos 7.440 €»
    expect(faq).toContain('unos 7.440 € actuales');
    expect(10000 / 1.03 ** 10).toBeCloseTo(7441, 0);
    // «15 preguntas» del FAQ, la metadata y el hero = el banco (lo comprueba `jugar`)
    expect(faq).toContain('Las 15 preguntas');
  });
});

// ─────────────────────────────────────────────────────────────────────────────

test.describe('Inspector 28/10/2026 · contenido y accesibilidad', () => {
  /** Recorre las 15 contestando bien y devuelve el texto CRUDO de enunciados, opciones y explicaciones. */
  async function textosDelBanco(page: Page): Promise<string[]> {
    const textos: string[] = [];
    for (let n = 1; n <= 15; n++) {
      textos.push(await enunciado(page).evaluate((e) => e.textContent ?? ''));
      textos.push(...(await opciones(page).evaluateAll((bs) => bs.map((b) => b.textContent ?? ''))));
      await responder(page, 'bien');
      textos.push(await explicacion(page).locator('p').evaluate((e) => e.textContent ?? ''));
      await avanzar(page);
    }
    return textos;
  }

  test('hallazgo · el porcentaje va separado del número con espacio duro («5 %»)', async ({ page }) => {
    // Regla de formato del 25/09/2026 (Ortografía RAE 2010): «5% anual», «50% necesidades»,
    // «20-25% TAE», «del 3% y tu cuenta da un 1%»… en enunciados, opciones y explicaciones.
    test.fail();
    test.setTimeout(90_000);
    await abrir(page);
    // `\d%` no casa con «5 %» (U+00A0 entre número y signo), que es lo correcto
    const pegados = (await textosDelBanco(page)).filter((t) => /\d%/.test(t));
    expect(pegados).toEqual([]);
  });

  test('hallazgo · reglas populares y citas sin fuente ni matiz (neutralidad editorial)', async ({ page }) => {
    // CLAUDE.md §1.quinquies, antipatrones 1, 2, 3, 4 y 5:
    //   · P2: «Einstein lo llamó "la octava maravilla del mundo"» — atribución sin fuente documentada
    //   · P5: la 50/30/20 como recomendación, sin su origen (Warren y Tyagi, EE. UU., 2005) ni que
    //     con rentas justas el 50 % no cubre las necesidades
    //   · P6: «(3-6 meses de gastos)» como cifra cerrada
    //   · FAQPage: «tipos de deuda (buena vs costosa)» y «los expertos recomiendan que el dinero a
    //     largo plazo esté invertido»
    test.fail();
    test.setTimeout(90_000);
    await abrir(page);
    const textos = (await textosDelBanco(page)).map(norm);
    const banco = textos.join(' ');
    const p5 = textos.find((t) => /50\/30\/20/.test(t) && /ingresos/.test(t)) ?? '';
    const p6 = textos.find((t) => /meses de gastos/.test(t)) ?? '';
    const faq = norm(
      await page.evaluate(() =>
        [...document.querySelectorAll('script[type="application/ld+json"]')].map((s) => s.textContent ?? '').join(' '),
      ),
    );
    const fallos: string[] = [];
    if (/Einstein lo llamó/.test(banco)) fallos.push('P2: «Einstein lo llamó» sin fuente');
    if (p5 && !/Warren|EE\. ?UU\.|Estados Unidos/.test(p5)) fallos.push('P5: 50/30/20 sin origen');
    if (/3-6 meses/.test(p6) && !/orientativ|depende|según|se suele|cifra/i.test(p6)) fallos.push('P6: 3-6 meses sin matiz');
    if (/deuda \(buena vs costosa\)/.test(faq)) fallos.push('FAQ: deuda buena vs costosa');
    if (/los expertos recomiendan/.test(faq)) fallos.push('FAQ: «los expertos recomiendan»');
    expect(fallos).toEqual([]);
  });

  test('hallazgo · el FAQPage no promete las explicaciones «al terminar» si el resultado no las da', async ({ page }) => {
    // metadata.ts:82 «Las 15 preguntas incluyen explicación de la respuesta correcta al terminar»;
    // la explicación sale tras CADA respuesta y la pantalla del resultado no muestra ninguna.
    test.fail();
    test.setTimeout(90_000);
    await abrir(page);
    const faq = norm(
      await page.evaluate(() =>
        [...document.querySelectorAll('script[type="application/ld+json"]')].map((s) => s.textContent ?? '').join(' '),
      ),
    );
    await jugar(page, () => 'bien');
    await expect(heroResultado(page)).toBeVisible();
    const explicacionesAlFinal = await page.locator('[class*="resultadoSection"]').getByText(/aumento generalizado y sostenido de los precios/).count();
    expect(!/explicación de la respuesta correcta al terminar/.test(faq) || explicacionesAlFinal > 0).toBe(true);
  });

  test('hallazgo · el JSON-LD WebApplication lista al menos 4 características', async ({ page }) => {
    // metadata.ts:36-47 — jsonLd sin `featureList` (CLAUDE.md §1.ter: 4-8 características reales).
    test.fail();
    await abrir(page);
    const app = await page.evaluate(() => {
      for (const s of document.querySelectorAll('script[type="application/ld+json"]')) {
        const o = JSON.parse(s.textContent ?? '{}') as Record<string, unknown>;
        if (o['@type'] === 'WebApplication') return o;
      }
      return null;
    });
    expect(app).not.toBeNull();
    const lista = (app?.featureList ?? app?.features) as unknown;
    expect(Array.isArray(lista) ? lista.length : 0).toBeGreaterThanOrEqual(4);
  });

  test('hallazgo · el veredicto se anuncia y la correcta se distingue sin depender del color', async ({ page }) => {
    // page.tsx:153-171 — la explicación no está en ninguna región viva y el foco salta a
    // «Siguiente»: con lector de pantalla no se oye «Incorrecto» ni cuál era la buena. La opción
    // correcta solo cambia de color (clase `correcta`), sin texto ni aria-label (WCAG 1.4.1). La
    // referencia (quiz-literatura-universal) usa role="status" y un aria-label con la marca.
    test.fail();
    await abrir(page);
    const iC = await indiceCorrecta(page);
    await opciones(page).nth(iC === 0 ? 1 : 0).focus();
    await page.keyboard.press('Enter');
    await expect(explicacion(page)).toBeVisible();
    const fallos: string[] = [];
    const vivas = page.locator('[class*="quizSection"] :is([aria-live], [role="status"], [role="alert"])');
    if ((await vivas.count()) === 0) fallos.push('sin región viva en el quiz');
    else if (!/Incorrecto/.test(await vivas.first().innerText())) fallos.push('la región viva no lleva el veredicto');
    const nombreCorrecta = await opciones(page)
      .nth(iC)
      .evaluate((b) => b.getAttribute('aria-label') ?? b.textContent ?? '');
    if (!/correcta|✓/i.test(nombreCorrecta)) fallos.push(`la opción buena se anuncia igual que antes: «${nombreCorrecta}»`);
    expect(fallos).toEqual([]);
  });
});
