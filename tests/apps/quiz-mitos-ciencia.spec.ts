import { test, expect, type Page, type Locator } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Quiz «Mitos y Realidades de la Ciencia» — test de regresión del Inspector (1.ª pasada, 28/10/2026)
 *
 * QUÉ PROMETE LA APP
 * ──────────────────
 * · <h1> «Mitos y Realidades de la Ciencia» · «25 afirmaciones para separar la ciencia del mito
 *   popular». Formato Verdad/Mito (DOS botones, no cuatro opciones: es la única hermana de la
 *   familia de quizzes así, y los botones DESAPARECEN al responder en vez de deshabilitarse).
 * · Al final: nivel, «N / 25», porcentaje y desglose por las 5 categorías.
 * · metadata.ts/faqJsonLd: Cuerpo Humano (7), Animales (8), Física y Cosmos (4), Historia (2) y
 *   Biología (4) — cuadra con el banco.
 *
 * DE DÓNDE SALEN LOS VALORES ESPERADOS
 * ────────────────────────────────────
 * · `porcentaje = Math.round(puntuacion / 25 * 100)` y NIVELES (page.tsx:244-250): ≥ 23
 *   «Científico/a» · ≥ 18 «Investigador/a» · ≥ 13 «Curioso/a» · ≥ 8 «Aprendiz» · resto
 *   «Principiante».
 * · La CLAVE con la que se juega está escrita a mano abajo (lectura del banco, page.tsx:28-234):
 *   7 verdades (huesos, pulpos, delfines, koalas, Sol, sonido, miel) y 18 mitos. Se identifica cada
 *   afirmación por su texto, no por su orden, para que un barajado futuro no rompa los casos.
 *
 * DOBLE TOQUE (invariante de la familia, cabo C0082)
 * ──────────────────────────────────────────────────
 * La app NO usa `useGuardaRafaga` ni ninguna guarda: ningún manejador mira `detail`. El 2.º clic de
 * la ráfaga cae sobre lo que haya debajo en la pantalla nueva. Medido el 28/10/2026 con ratón
 * (1.er clic con detail 1, pantalla nueva pintada, 2.º con detail 2 en el mismo punto):
 * · «Comenzar quiz» a ¼ o ¾ del ancho del botón: contesta la 1.ª pregunta («Verdad» o «Mito») a
 *   768, 1280, 1366 y 1920 px. En el centro exacto se libra por caer en el hueco de 1 rem entre
 *   los dos botones.
 * · «Siguiente» 1 → 2 a 1280×800 y 1366×768: contesta la 2.ª con «Mito».
 * · «Siguiente» a 412×915: abre o cierra la guía en 9 de 24; a 360×740, en 1 de 24 (3 → 4).
 * · «Repetir quiz» a ¼ a 768×1024: sale de la app a /quiz-biologia-molecular/ (relacionadas).
 * · Sobre la opción: 0 de 15 por ancho se saltan la explicación (el 2.º cae en la insignia).
 * · «Ver resultados»: 0 de 4 anchos se comen la nota (cae en el desglose).
 */

const RUTA = '/quiz-mitos-ciencia/';
const DURO = String.fromCharCode(0xa0);
const norm = (s: string | null | undefined): string => (s ?? '').replace(/\s+/g, ' ').trim();

type Cat = 'cuerpo' | 'animales' | 'fisica' | 'historia' | 'biologia';
/** Clave del banco, escrita a mano: [fragmento de la afirmación, ¿es verdad?, categoría]. */
const CLAVE: [RegExp, boolean, Cat][] = [
  [/10% de nuestro cerebro/, false, 'cuerpo'],
  [/sangre venosa/, false, 'cuerpo'],
  [/uñas y el pelo/, false, 'cuerpo'],
  [/poca luz/, false, 'cuerpo'],
  [/solo 5 sentidos/, false, 'cuerpo'],
  [/zonas específicas para cada sabor/, false, 'cuerpo'],
  [/más resistentes que el hormigón/, true, 'cuerpo'],
  [/memoria de solo 3 segundos/, false, 'animales'],
  [/avestruces/, false, 'animales'],
  [/murciélagos son ciegos/, false, 'animales'],
  [/camellos/, false, 'animales'],
  [/color rojo/, false, 'animales'],
  [/pulpos tienen tres corazones/, true, 'animales'],
  [/delfines duermen/, true, 'animales'],
  [/koalas/, true, 'animales'],
  [/rayos nunca caen/, false, 'fisica'],
  [/átomos son partículas sólidas/, false, 'fisica'],
  [/Sol es una estrella de tamaño mediano/, true, 'fisica'],
  [/sonido no puede propagarse/, true, 'fisica'],
  [/Napoleón/, false, 'historia'],
  [/Gran Muralla/, false, 'historia'],
  [/chimpancés/, false, 'biologia'],
  [/azúcar causa hiperactividad/, false, 'biologia'],
  [/chicle/, false, 'biologia'],
  [/miel/, true, 'biologia'],
];

async function abrir(page: Page): Promise<void> {
  await page.addInitScript(() => {
    try {
      localStorage.setItem('meskeia_transparency_banner_dismissed', 'true');
    } catch {
      /* sin almacenamiento: saldrá el aviso */
    }
  });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(RUTA);
  await expect(page.locator('h1')).toHaveText('Mitos y Realidades de la Ciencia');
  // Sin <input>: se espera a que React cuelgue sus props del botón de arranque.
  await page.waitForFunction(
    () => {
      const b = [...document.querySelectorAll('button')].find((x) => /Comenzar quiz/.test(x.textContent ?? ''));
      return Boolean(b && Object.keys(b).some((k) => k.startsWith('__reactProps$')));
    },
    null,
    { timeout: 20_000 },
  );
}

const btnVerdad = (page: Page): Locator => page.getByRole('button', { name: 'Verdad', exact: true });
const btnMito = (page: Page): Locator => page.getByRole('button', { name: 'Mito', exact: true });
const btnAvanzar = (page: Page): Locator => page.getByRole('button', { name: /Siguiente|Ver resultados/ });
const prog = (page: Page): Locator => page.locator('[class*="progNum"]');
const revelacion = (page: Page): Locator => page.locator('[class*="revelacion"]');

async function clave(page: Page): Promise<{ verdad: boolean; cat: Cat; texto: string }> {
  const texto = norm(await page.locator('[class*="afirmacion"]').innerText());
  const fila = CLAVE.find(([re]) => re.test(texto));
  expect(fila, `afirmación que no está en la clave: «${texto}»`).toBeTruthy();
  const [, verdad, cat] = fila as [RegExp, boolean, Cat];
  return { verdad, cat, texto };
}

/** Responde la afirmación visible: `bien` pulsa lo que dice la clave, `mal` lo contrario. */
async function responder(page: Page, bien: boolean): Promise<{ verdad: boolean; cat: Cat; texto: string }> {
  const c = await clave(page);
  await (c.verdad === bien ? btnVerdad(page) : btnMito(page)).click();
  await expect(revelacion(page)).toBeVisible();
  return c;
}

/** Juega la partida entera; `bien(c, n)` decide si se acierta la n-ésima (1-based). */
async function jugar(page: Page, bien: (c: { verdad: boolean; cat: Cat; texto: string }, n: number) => boolean): Promise<number> {
  for (let n = 1; n <= 25; n++) {
    await expect(prog(page)).toHaveText(`${n} / 25`);
    const c = await clave(page);
    await responder(page, bien(c, n));
    await btnAvanzar(page).click();
  }
  await expect(page.locator('[class*="finPanel"]')).toBeVisible();
  return 25;
}

async function resultado(page: Page) {
  await expect(page.locator('[class*="finPanel"]')).toBeVisible();
  return page.evaluate(() => {
    const t = (s: string): string => (document.querySelector(s)?.textContent ?? '').replace(/[ \t\n\r]+/g, ' ').trim();
    return {
      nivel: t('[class*="nivelNombre"]'),
      puntos: t('[class*="puntNum"]'),
      total: t('[class*="puntTotal"]'),
      pct: t('[class*="puntPct"]'),
      cats: [...document.querySelectorAll('[class*="catResultItem"]')].map((c) =>
        (c.querySelector('[class*="catScore"]')?.textContent ?? '').trim(),
      ),
    };
  });
}

// ─────────────────────────────────────────────────────────────────────────────

test.describe('Quiz Mitos de la Ciencia · partida', () => {
  /**
   * CASO NORMAL — se aciertan todas salvo las 4 de Biología y la de la Gran Muralla.
   * Esperado a mano: 25 − 5 = 20 → 20 / 25 → round(80) = 80 % → 20 ≥ 18 → «Investigador/a».
   * Por categoría (orden fijo de CATEGORIAS): Cuerpo 7/7 · Animales 8/8 · Física 4/4 ·
   * Historia 1/2 · Biología 0/4. No depende del orden de las preguntas.
   */
  test('caso normal: 20 de 25 dan 80 %, «Investigador/a» y el desglose 7/7 · 8/8 · 4/4 · 1/2 · 0/4', async ({ page }) => {
    test.setTimeout(90_000);
    await abrir(page);
    await page.getByRole('button', { name: 'Comenzar quiz' }).click();
    const vistas = new Set<string>();
    await jugar(page, (c) => {
      vistas.add(c.texto);
      return c.cat !== 'biologia' && !/Gran Muralla/.test(c.texto);
    });
    expect(vistas.size, 'afirmación repetida en la misma partida').toBe(25);
    const r = await resultado(page);
    expect(r.nivel).toBe('Investigador/a');
    expect(r.puntos).toBe('20');
    expect(r.total).toBe('/ 25');
    expect(r.pct).toMatch(new RegExp(`^80${DURO}?%$`)); // el espacio duro se vigila en su hallazgo
    expect(r.cats).toEqual(['7/7', '8/8', '4/4', '1/2', '0/4']);
  });

  /**
   * CASO LÍMITE — pleno y, con «Repetir quiz» SIN recargar, cero.
   * Esperado a mano: 25/25 → 100 % → «Científico/a» y 7/7 · 8/8 · 4/4 · 2/2 · 4/4;
   * 0/25 → 0 % → «Principiante» y todas las categorías a 0. «Repetir» conserva una marca en window.
   */
  test('caso límite: 25 de 25 dan «Científico/a» y, tras «Repetir quiz» sin recargar, 0 de 25 dan «Principiante»', async ({ page }) => {
    test.setTimeout(120_000);
    await abrir(page);
    await page.evaluate(() => { (window as unknown as { __marca: string }).__marca = 'sin-recarga'; });
    await page.getByRole('button', { name: 'Comenzar quiz' }).click();
    await jugar(page, () => true);
    let r = await resultado(page);
    expect(r.nivel).toBe('Científico/a');
    expect(r.puntos).toBe('25');
    expect(r.pct).toMatch(new RegExp(`^100${DURO}?%$`));
    expect(r.cats).toEqual(['7/7', '8/8', '4/4', '2/2', '4/4']);

    await page.getByRole('button', { name: 'Repetir quiz' }).click();
    await expect(prog(page)).toHaveText('1 / 25');
    expect(await page.evaluate(() => (window as unknown as { __marca?: string }).__marca)).toBe('sin-recarga');
    await jugar(page, () => false);
    r = await resultado(page);
    expect(r.nivel).toBe('Principiante');
    expect(r.puntos).toBe('0');
    expect(r.pct).toMatch(new RegExp(`^0${DURO}?%$`));
    expect(r.cats).toEqual(['0/7', '0/8', '0/4', '0/2', '0/4']);
  });

  /**
   * LO QUE DEBE IGNORARSE — doble clic sobre la respuesta (dblclick de Playwright, en el centro).
   * Esperado a mano: el 1.er clic responde y desmonta los dos botones; el 2.º cae en la insignia
   * del veredicto y no cuenta: sigue en «1 / 25» con la explicación a la vista, y al terminar
   * la partida (resto fallado) la nota es 1 / 25 = 4 % → «Principiante».
   */
  test('caso de rechazo: el doble clic sobre «Mito» cuenta una vez y no se salta la explicación', async ({ page }) => {
    test.setTimeout(90_000);
    await abrir(page);
    await page.getByRole('button', { name: 'Comenzar quiz' }).click();
    await expect(prog(page)).toHaveText('1 / 25');
    await page.waitForTimeout(600); // fuera de la ráfaga de «Comenzar»
    await btnMito(page).dblclick(); // la 1.ª es un mito: acierto
    await expect(revelacion(page)).toBeVisible();
    await expect(prog(page)).toHaveText('1 / 25');
    await expect(page.locator('[class*="resultadoBadge"]')).toContainText('¡Correcto!');
    await btnAvanzar(page).click();
    for (let n = 2; n <= 25; n++) {
      await expect(prog(page)).toHaveText(`${n} / 25`);
      await responder(page, false);
      await btnAvanzar(page).click();
    }
    const r = await resultado(page);
    expect(r.puntos).toBe('1');
    expect(r.pct).toMatch(new RegExp(`^4${DURO}?%$`));
    expect(r.nivel).toBe('Principiante');
  });

  test('sano · tras «Siguiente» el foco va a la afirmación (tabindex -1), no a <body>, y las respuestas no llevan aria-pressed', async ({ page }) => {
    await abrir(page);
    await page.getByRole('button', { name: 'Comenzar quiz' }).focus();
    await page.keyboard.press('Enter');
    await expect(prog(page)).toHaveText('1 / 25');
    expect(await page.locator('button[aria-pressed]').count()).toBe(0);
    await btnMito(page).focus();
    await page.keyboard.press('Enter');
    await expect(revelacion(page)).toBeVisible();
    await btnAvanzar(page).focus();
    await page.keyboard.press('Enter');
    await expect(prog(page)).toHaveText('2 / 25');
    await expect
      .poll(() =>
        page.evaluate(() => {
          const a = document.activeElement;
          if (!a || a === document.body) return 'body';
          return a.getAttribute('tabindex') === '-1' && a.tagName !== 'BUTTON' && /afirmacion/.test(a.querySelector('p')?.className ?? '') ? 'afirmación' : a.tagName;
        }),
      )
      .toBe('afirmación');
  });
});

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Ráfaga con ratón de verdad, como tests/familias/quizzes.spec.ts: 1.er clic con detail 1 en el
 * punto (x a `fx` del ancho del botón), esperar a la pantalla nueva pintada, 80 ms, y el 2.º con
 * detail 2 en el MISMO punto. Devuelve qué había debajo antes del 2.º y si cambió la URL.
 */
async function rafaga(page: Page, boton: Locator, fx: number, pintada: () => Promise<boolean>): Promise<{ debajo: string; url: string }> {
  await boton.scrollIntoViewIfNeeded();
  await page.waitForTimeout(100);
  const c = await boton.boundingBox();
  if (!c) throw new Error('el botón no tiene caja');
  const [x, y] = [c.x + c.width * fx, c.y + c.height / 2];
  await page.mouse.move(x, y);
  await page.mouse.down({ clickCount: 1 });
  await page.mouse.up({ clickCount: 1 });
  await expect.poll(pintada, { intervals: [20], timeout: 3000 }).toBe(true);
  await page.waitForTimeout(80);
  const debajo = await page.evaluate(([px, py]) => {
    const el = document.elementFromPoint(px, py);
    const a = el?.closest('a');
    const b = el?.closest('button');
    return a ? `enlace ${a.getAttribute('href')}` : b ? `botón «${(b.textContent ?? '').trim()}»` : el?.tagName ?? 'nada';
  }, [x, y] as const);
  await page.mouse.down({ clickCount: 2 });
  await page.mouse.up({ clickCount: 2 });
  await page.waitForTimeout(400);
  return { debajo, url: page.url() };
}

const guiaAbierta = (page: Page): Promise<boolean> => page.getByRole('button', { name: /Ocultar guía educativa/ }).isVisible();
const enPregunta = async (page: Page, n: number): Promise<boolean> =>
  (await btnVerdad(page).isVisible()) && norm(await prog(page).textContent()) === `${n} / 25`;

/**
 * Recorre la partida contestando «Verdad» con clic suelto y dando una ráfaga en CADA «Siguiente»
 * y en «Ver resultados». Devuelve los incidentes: pregunta contestada por la ráfaga, guía que
 * se abre o se cierra, salida de la app o resultado que desaparece.
 */
async function rafagasEnSiguiente(page: Page): Promise<string[]> {
  const incidentes: string[] = [];
  const url0 = page.url();
  for (let n = 1; n <= 25; n++) {
    if (await btnVerdad(page).isVisible()) {
      await btnVerdad(page).click();
      await expect(revelacion(page)).toBeVisible();
    }
    const guia0 = await guiaAbierta(page);
    const ultima = n === 25;
    const { debajo, url } = await rafaga(page, btnAvanzar(page), 0.5, async () =>
      ultima ? page.locator('[class*="finPanel"]').isVisible() : enPregunta(page, n + 1),
    );
    if (url !== url0) {
      incidentes.push(`${n}→${n + 1}: sale a ${url}`);
      break;
    }
    if (ultima) {
      if (!(await page.locator('[class*="finPanel"]').isVisible())) incidentes.push('Ver resultados: se come la nota');
    } else if (await revelacion(page).isVisible()) incidentes.push(`${n}→${n + 1}: contesta la nueva (${debajo})`);
    if ((await guiaAbierta(page)) !== guia0) incidentes.push(`${n}→${n + 1}: ${guia0 ? 'cierra' : 'abre'} la guía (${debajo})`);
  }
  return incidentes;
}

const MOVIL_UA = 'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Mobile Safari/537.36';

test.describe('Inspector 28/10/2026 · doble toque · 360 × 740', () => {
  test.use({ viewport: { width: 360, height: 740 }, userAgent: MOVIL_UA, deviceScaleFactor: 3, isMobile: true, hasTouch: true });

  test('hallazgo · la ráfaga en «Siguiente» no abre ni cierra la guía educativa', async ({ page }) => {
    // Sin guarda (ni useGuardaRafaga ni local). Medido: 3 → 4 abre la guía («Ver guía educativa»).
    test.fail();
    test.setTimeout(120_000);
    await abrir(page);
    await page.getByRole('button', { name: 'Comenzar quiz' }).click();
    await page.waitForTimeout(600);
    expect(await rafagasEnSiguiente(page)).toEqual([]);
  });

  test('sano · la ráfaga sobre la respuesta no se salta la explicación', async ({ page }) => {
    // Medido: el 2.º toque cae en la insignia del veredicto en 15 de 15.
    test.setTimeout(60_000);
    await abrir(page);
    await page.getByRole('button', { name: 'Comenzar quiz' }).click();
    await page.waitForTimeout(600);
    for (let n = 1; n <= 6; n++) {
      await rafaga(page, btnVerdad(page), 0.5, () => revelacion(page).isVisible());
      await expect(prog(page), `pregunta ${n}: la ráfaga ha pasado de pregunta`).toHaveText(`${n} / 25`);
      await expect(revelacion(page)).toBeVisible();
      await btnAvanzar(page).click();
      await page.waitForTimeout(600);
    }
  });
});

test.describe('Inspector 28/10/2026 · doble toque · 412 × 915', () => {
  test.use({ viewport: { width: 412, height: 915 }, userAgent: MOVIL_UA, deviceScaleFactor: 2.625, isMobile: true, hasTouch: true });

  test('hallazgo · la ráfaga en «Siguiente» no abre ni cierra la guía educativa', async ({ page }) => {
    // Medido: 9 de 24 abren o cierran la guía (2→3 abre, 3→4 cierra, 4→5 abre…).
    test.fail();
    test.setTimeout(120_000);
    await abrir(page);
    await page.getByRole('button', { name: 'Comenzar quiz' }).click();
    await page.waitForTimeout(600);
    expect(await rafagasEnSiguiente(page)).toEqual([]);
  });
});

test.describe('Inspector 28/10/2026 · doble toque · 768 × 1024', () => {
  test.use({ viewport: { width: 768, height: 1024 } });

  test('hallazgo · la ráfaga en «Comenzar quiz» (a ¼ del botón) no contesta la primera afirmación', async ({ page }) => {
    // Medido: el 2.º clic cae en «Verdad» y la 1.ª sale «✗ Incorrecto» sin que nadie la eligiera.
    test.fail();
    await abrir(page);
    await rafaga(page, page.getByRole('button', { name: 'Comenzar quiz' }), 0.25, () => btnVerdad(page).isVisible());
    await expect(prog(page)).toHaveText('1 / 25');
    await expect(btnVerdad(page), 'la ráfaga ha contestado la 1.ª').toBeVisible({ timeout: 1000 });
  });

  test('sano · la ráfaga en cada «Siguiente» y en «Ver resultados» no contesta, no abre la guía ni se come la nota', async ({ page }) => {
    test.setTimeout(120_000);
    await abrir(page);
    await page.getByRole('button', { name: 'Comenzar quiz' }).click();
    await page.waitForTimeout(600);
    expect(await rafagasEnSiguiente(page)).toEqual([]);
  });

  test('hallazgo · la ráfaga en «Repetir quiz» (a ¼ del botón) no saca de la app', async ({ page }) => {
    // Medido: el 2.º clic cae en la tarjeta de relacionadas y lleva a /quiz-biologia-molecular/.
    test.fail();
    test.setTimeout(120_000);
    await abrir(page);
    await page.getByRole('button', { name: 'Comenzar quiz' }).click();
    await jugar(page, () => true);
    const url0 = page.url();
    const { url } = await rafaga(page, page.getByRole('button', { name: 'Repetir quiz' }), 0.25, () => btnVerdad(page).isVisible());
    expect(url, 'la ráfaga ha sacado de la app').toBe(url0);
    await expect(prog(page)).toHaveText('1 / 25');
    await expect(btnVerdad(page)).toBeVisible();
  });
});

test.describe('Inspector 28/10/2026 · doble toque · escritorio 1280 × 800', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test('hallazgo · la ráfaga en «Siguiente» no contesta la afirmación nueva', async ({ page }) => {
    // Medido: 1 → 2, el 2.º clic cae en «Mito» y la 2.ª (sangre venosa) queda contestada.
    test.fail();
    test.setTimeout(120_000);
    await abrir(page);
    await page.getByRole('button', { name: 'Comenzar quiz' }).click();
    await page.waitForTimeout(600);
    expect(await rafagasEnSiguiente(page)).toEqual([]);
  });

  test('hallazgo · la ráfaga en «Comenzar quiz» (a ¾ del botón) no contesta la primera afirmación', async ({ page }) => {
    // Medido: el 2.º clic cae en «Mito» → «✓ ¡Correcto!» regalado en la 1.ª.
    test.fail();
    await abrir(page);
    await rafaga(page, page.getByRole('button', { name: 'Comenzar quiz' }), 0.75, () => btnVerdad(page).isVisible());
    await expect(btnMito(page), 'la ráfaga ha contestado la 1.ª').toBeVisible({ timeout: 1000 });
  });
});

// ─────────────────────────────────────────────────────────────────────────────

test.describe('Inspector 28/10/2026 · nota y formato', () => {
  test('hallazgo · pulsar siempre «Mito» sin leer no da un nivel de «buen conocimiento científico»', async ({ page }) => {
    // 18 de las 25 son mitos y el orden es fijo: «Mito» a todo da 18/25 = 72 % → «Investigador/a»
    // («Buen conocimiento científico. Separas la mayoría de los mitos de la realidad»).
    test.fail();
    test.setTimeout(90_000);
    await abrir(page);
    await page.getByRole('button', { name: 'Comenzar quiz' }).click();
    for (let n = 1; n <= 25; n++) {
      await expect(prog(page)).toHaveText(`${n} / 25`);
      await btnMito(page).click();
      await btnAvanzar(page).click();
    }
    const r = await resultado(page);
    expect(r.puntos).toBe('18'); // valor a mano: 25 − 7 verdades
    expect(r.nivel, 'la estrategia ciega «siempre Mito» alcanza «Investigador/a»').not.toBe('Investigador/a');
  });

  test('hallazgo · el porcentaje va separado con espacio duro («80 %»)', async ({ page }) => {
    // page.tsx:440 `{porcentaje}%` pega el signo (Ortografía RAE 2010, regla de 25/09/2026).
    test.fail();
    test.setTimeout(90_000);
    await abrir(page);
    await page.getByRole('button', { name: 'Comenzar quiz' }).click();
    await jugar(page, (c) => c.cat !== 'biologia' && !/Gran Muralla/.test(c.texto));
    expect((await resultado(page)).pct).toBe(`80${DURO}%`);
  });

  test('hallazgo · la insignia de una verdad dice «Era una VERDAD», no «Era un VERDAD»', async ({ page }) => {
    // page.tsx:416 `Era un {VERDAD|MITO}`: «verdad» es femenino.
    test.fail();
    await abrir(page);
    await page.getByRole('button', { name: 'Comenzar quiz' }).click();
    for (let n = 1; n <= 7; n++) {
      await responder(page, true);
      if (n < 7) await btnAvanzar(page).click();
    }
    // la 7.ª (huesos) es una verdad
    await expect(page.locator('[class*="respuestaCorrecta"]')).toHaveText(/Era una VERDAD/, { timeout: 1000 });
  });

  test('hallazgo · la FAQ «¿Qué puntuación es buena?» cuadra con los niveles: 22/25 no es «Científico/a»', async ({ page }) => {
    // FAQ visible: «Por encima del 88% (22/25) se accede al nivel "Científico/a"». NIVELES pide 23.
    // A mano: 22/25 = 88 % → 22 < 23 → «Investigador/a». Y «La media esperada en población general
    // es de 14-16/25» es una cifra sin fuente (no hay datos de la población que lo juega).
    test.fail();
    test.setTimeout(90_000);
    await abrir(page);
    await page.getByRole('button', { name: 'Comenzar quiz' }).click();
    await jugar(page, (_c, n) => n <= 22);
    const r = await resultado(page);
    expect(r.puntos).toBe('22');
    expect(r.nivel).toBe('Investigador/a'); // lo que hace la app (correcto según NIVELES)
    await page.getByRole('button', { name: /Ver guía educativa/ }).click();
    const faq = norm(await page.locator('[class*="faqItem"]').filter({ hasText: '¿Qué puntuación es buena' }).innerText());
    expect(faq, 'la FAQ promete «Científico/a» con 22/25').not.toMatch(/\(22\/25\) se accede al nivel "?Científico/);
    expect(faq, 'cifra de población sin fuente').not.toMatch(/media esperada en población general/);
  });
});

// ─────────────────────────────────────────────────────────────────────────────

/**
 * CONTENIDO DEL BANCO Y DE LA GUÍA — leído en el fuente (el banco no se exporta). Cada valor
 * esperado está calculado a mano con su origen.
 */
const FUENTE = readFileSync(join(process.cwd(), 'app', 'quiz-mitos-ciencia', 'page.tsx'), 'utf8');

test.describe('Inspector 28/10/2026 · contenido', () => {
  test('sano · el banco tiene 25 afirmaciones: 7 verdades y 18 mitos, y cuadra con la clave y la FAQPage', () => {
    const verdades = (FUENTE.match(/esVerdad: true/g) ?? []).length;
    const mitos = (FUENTE.match(/esVerdad: false/g) ?? []).length;
    expect(verdades).toBe(7);
    expect(mitos).toBe(18);
    const cats = (c: string) => (FUENTE.match(new RegExp(`categoria: '${c}'`, 'g')) ?? []).length;
    expect([cats('cuerpo'), cats('animales'), cats('fisica'), cats('historia'), cats('biologia')]).toEqual([7, 8, 4, 2, 4]);
  });

  test('hallazgo · cifras que no cuadran en las explicaciones (Betelgeuse, Gran Muralla, Hänig)', () => {
    test.fail();
    const fallos: string[] = [];
    // Betelgeuse: la propia app dice «unas 700 veces» el diámetro del Sol → radio 700 × 695.700 km
    // = 4,87·10⁸ km = 3,26 UA, y Júpiter orbita a 5,20 UA: llega al cinturón de asteroides, no a Júpiter.
    if (/700 veces mayor; si estuviera en el lugar del Sol, englobaría la órbita de Júpiter/.test(FUENTE)) fallos.push('Betelgeuse 700× no engloba a Júpiter');
    // Gran Muralla: 6 m a 400 km = 1,5·10⁻⁵ rad; un cabello (70 µm) a 2 km = 3,5·10⁻⁸ rad, unas 430
    // veces menos. El cabello equivalente se vería a ~4,7 m, no a 2 km.
    if (/cabello humano desde 2 km/.test(FUENTE)) fallos.push('cabello desde 2 km');
    // Mapa de la lengua: el estudio de D. P. Hänig («Zur Psychophysik des Geschmackssinnes»,
    // Philosophische Studien 17) es de 1901, siglo XX.
    if (/estudio alemán del siglo XIX/.test(FUENTE)) fallos.push('Hänig 1901 no es siglo XIX');
    // Guía: «Más de 12 estudios con doble ciego en JAMA» — JAMA publicó el metaanálisis (Wolraich,
    // Wilson y White, 1995) que reúne esos ensayos, no los ensayos.
    if (/Más de 12 estudios con doble ciego en JAMA/.test(FUENTE)) fallos.push('estudios «en JAMA»');
    expect(fallos).toEqual([]);
  });

  test('hallazgo · «el Sol es una estrella de tamaño mediano» se da por VERDAD sin decir que la mayoría de las estrellas son más pequeñas', () => {
    // La explicación lo justifica con «las estrellas brillantes a ojo desnudo», un sesgo de
    // selección: la mayoría de las estrellas de la galaxia son enanas rojas, más pequeñas y menos
    // masivas que el Sol. Quien contesta «Mito» por eso tiene un argumento y pierde el punto.
    test.fail();
    const exp = FUENTE.slice(FUENTE.indexOf('El Sol es una estrella de tamaño mediano'), FUENTE.indexOf("emoji: '☀️'"));
    expect(exp).toMatch(/enanas rojas|mayoría de las estrellas (de la galaxia|de la Vía Láctea) son (más )?pequeñas/i);
  });

  test('hallazgo · la guía no llama «25 mitos» a 25 afirmaciones de las que 7 son verdad', () => {
    // EducationalSection: «Muchos de los 25 mitos de este quiz» con 7 verdades en el banco.
    test.fail();
    expect(FUENTE).not.toMatch(/los 25 mitos de este quiz/);
  });
});

test.describe('Inspector 28/10/2026 · accesibilidad', () => {
  test('hallazgo · los emojis junto a texto de las etiquetas de categoría y del aviso no se leen', async ({ page }) => {
    // page.tsx:353 `{cat.emoji} {cat.nombre}` (texto suelto) y :660 «⚠️» en un span sin aria-hidden
    // junto al título del aviso: el lector anuncia «cerebro Cuerpo Humano», «advertencia Errores…».
    test.fail();
    await abrir(page);
    const leidos = await page.evaluate(() => {
      const visibles = (el: Element): string => {
        const clon = el.cloneNode(true) as HTMLElement;
        clon.querySelectorAll('[aria-hidden="true"]').forEach((n) => n.remove());
        return clon.textContent ?? '';
      };
      return [...document.querySelectorAll('[class*="categoriaTag"]')].map(visibles);
    });
    expect(leidos.length).toBe(5);
    for (const t of leidos) expect(t).not.toMatch(/\p{Extended_Pictographic}/u);
  });
});
