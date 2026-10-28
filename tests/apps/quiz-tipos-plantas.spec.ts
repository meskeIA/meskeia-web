import { test, expect, type Page, type Locator } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { esperarPaginaAsentada } from './_hidratacion';

/**
 * Quiz Tipos de Plantas — test de regresión del Inspector (1.ª pasada como app, 28/10/2026).
 * Familia «Quizzes de opción múltiple» (tests/familias/quizzes.spec.ts); referencia
 * quiz-literatura-universal.
 *
 * QUÉ PROMETE LA APP
 * ──────────────────
 * · <h1> «¿Musgo, Helecho o Angiosperma?» · «Clasifica 40 plantas en su grupo botánico correcto».
 * · Modo Rápido (20 preguntas al azar), Modo Completo (las 40) y «Practicar por grupo» (6 botones,
 *   uno por grupo, con las plantas de ese grupo: 6 algas, 6 briófitos, 7 pteridófitos, 7
 *   gimnospermas, 7 monocotiledóneas y 7 dicotiledóneas contando la posidonia).
 * · Cada pregunta: el nombre común y el científico de una planta, una pista y cuatro grupos (el
 *   correcto y tres de los otros cinco al azar). Tras responder, la explicación y «Siguiente».
 * · Resultado: «Resultado: c/t», porcentaje, emoji por tramo, aciertos por grupo y lista de fallos.
 *
 * DE DÓNDE SALEN LOS VALORES ESPERADOS
 * ────────────────────────────────────
 * · `porcentaje = Math.round(correctas / total * 100)` (page.tsx:381); emoji ≥ 80 🏆 · ≥ 50 👍 ·
 *   resto 😅 (page.tsx:382). Tamaños: rápido 20, completo 40, por grupo lo que tenga el grupo.
 * · La CLAVE con la que se juega (qué opción pulsar para acertar o fallar) es la de la app,
 *   copiada de page.tsx a `CLAVE`: las partidas miden la MECÁNICA (marcador, nota, bloqueo,
 *   foco, doble toque), no la botánica. La botánica se contrasta aparte, en «hallazgos · banco».
 *
 * DOBLE TOQUE (invariante de la familia, cabo C0082)
 * ──────────────────────────────────────────────────
 * La app usa `useGuardaRafaga` (lib/useGuardaRafaga.ts, captura sobre window) y llama a
 * `marcarCambioPantalla` al elegir modo, en «Siguiente»/«Ver resultados», «Volver a jugar» y
 * «✕ Salir». Medido el 28/10/2026 a 360×740 (ratón y toque), 412×915, 768×1024 y 1280×800, en
 * las 20 preguntas de una partida rápida: 0 respuestas fantasma, 0 explicaciones saltadas, 0
 * salidas de la app. Bajo el dedo quedan una opción (tras «Modo Rápido»), el conmutador de tema 🌙
 * (tras «Salir», a 360 y 412) o un botón «Practicar Alga» (tras «Volver a jugar»): la guarda los
 * absorbe todos. Responder no marca cambio de pantalla, pero aquí el 2.º toque sobre la opción
 * cae siempre en la propia opción ya deshabilitada (0 de 20 a los cuatro anchos).
 */

const RUTA = '/quiz-tipos-plantas/';
const DURO = String.fromCharCode(0xa0);
const norm = (s: string | null | undefined): string => (s ?? '').replace(/\s+/g, ' ').trim();

/** Clave de la app (page.tsx, `PLANTAS`): grupo marcado como correcto, por nombre común. */
const CLAVE: Record<string, string> = {
  'Lechuga de mar': 'Alga', Espirulina: 'Alga', 'Kelp gigante': 'Alga', Nori: 'Alga', Fucus: 'Alga', Chara: 'Alga',
  Posidonia: 'Dicotiledónea',
  'Musgo de turbera': 'Briófito', 'Musgo de pared': 'Briófito', Marchantia: 'Briófito', Politriquio: 'Briófito',
  Antocerota: 'Briófito', 'Hepática acuática': 'Briófito',
  'Helecho común': 'Pteridófito', 'Cola de caballo': 'Pteridófito', Licopodio: 'Pteridófito', 'Helecho árbol': 'Pteridófito',
  Culantrillo: 'Pteridófito', Selaginella: 'Pteridófito', 'Asplenio negro': 'Pteridófito',
  'Pino silvestre': 'Gimnosperma', 'Abeto blanco': 'Gimnosperma', Cica: 'Gimnosperma', Ginkgo: 'Gimnosperma',
  'Secuoya roja': 'Gimnosperma', 'Ciprés mediterráneo': 'Gimnosperma', Welwitschia: 'Gimnosperma',
  Trigo: 'Monocotiledónea', 'Palmera datilera': 'Monocotiledónea', 'Orquídea silvestre': 'Monocotiledónea',
  Cebolla: 'Monocotiledónea', 'Tulipán': 'Monocotiledónea', 'Bambú': 'Monocotiledónea', 'Espadaña': 'Monocotiledónea',
  'Rosal silvestre': 'Dicotiledónea', Girasol: 'Dicotiledónea', Tomate: 'Dicotiledónea', Roble: 'Dicotiledónea',
  Lavanda: 'Dicotiledónea', Aguacate: 'Dicotiledónea',
};

const enunciado = (page: Page): Locator => page.locator('[class*="plantaNombreComun"]');
const opciones = (page: Page): Locator => page.locator('[class*="opcionesGrid"] button');
const contador = (page: Page): Locator => page.locator('[class*="contadorPregunta"]');
const marcador = (page: Page): Locator => page.locator('[class*="puntuacion"]');
const panelResultado = (page: Page): Locator => page.locator('[class*="resultadosPanel"]');
const feedback = (page: Page): Locator => page.locator('[class*="feedbackPanel"]');
const habilitadas = (page: Page): Promise<number> =>
  opciones(page).evaluateAll((bs) => bs.filter((b) => !(b as HTMLButtonElement).disabled).length);
const rotulos = async (page: Page): Promise<string[]> =>
  (await page.locator('[class*="opcionesGrid"] [class*="opcionLabel"]').allInnerTexts()).map(norm);

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
  await expect(page.locator('h1')).toHaveText('¿Musgo, Helecho o Angiosperma?');
  // Sin <input>: la espera que vale es la de la página con la hidratación confirmada.
  await esperarPaginaAsentada(page);
}

async function empezar(page: Page, boton: RegExp): Promise<void> {
  await page.getByRole('button', { name: boton }).click();
  await expect(enunciado(page)).toBeVisible();
}

interface Respuesta {
  nombre: string;
  correcta: string;
  elegida: string;
  antes: string[];
}

/** Responde la pregunta visible: 'bien', 'mal' o el rótulo de un grupo concreto. */
async function responder(page: Page, modo: string): Promise<Respuesta> {
  const nombre = norm(await enunciado(page).innerText());
  const correcta = CLAVE[nombre];
  expect(correcta, `planta que no está en la clave: «${nombre}»`).toBeTruthy();
  const antes = await rotulos(page);
  expect(antes, 'toda pregunta ofrece 4 grupos').toHaveLength(4);
  expect(antes, `la correcta «${correcta}» no está entre las ofrecidas`).toContain(correcta);
  const elegida = modo === 'bien' ? correcta : modo === 'mal' ? (antes.find((o) => o !== correcta) as string) : modo;
  const i = antes.indexOf(elegida);
  expect(i, `«${elegida}» no está entre las opciones`).toBeGreaterThanOrEqual(0);
  await opciones(page).nth(i).click();
  await expect(feedback(page)).toBeVisible();
  expect(await habilitadas(page), 'responder deshabilita las cuatro opciones').toBe(0);
  return { nombre, correcta, elegida, antes };
}

/** «Siguiente» o «Ver resultados»; espera a la pantalla nueva. Devuelve el rótulo pulsado. */
async function avanzar(page: Page): Promise<string> {
  const boton = page.locator('[class*="btnSiguiente"]');
  const rotulo = norm(await boton.innerText());
  const n = Number((norm(await contador(page).innerText()).match(/^Pregunta (\d+)/) ?? [])[1]);
  await boton.click();
  if (/resultados/.test(rotulo)) await expect(panelResultado(page)).toBeVisible();
  else await expect(contador(page)).toContainText(`Pregunta ${n + 1} /`);
  return rotulo;
}

/** Juega hasta el final: las `aciertos` primeras bien y el resto mal (o siempre `fijo`). */
async function jugar(page: Page, aciertos: number, fijo?: string): Promise<Respuesta[]> {
  const hechas: Respuesta[] = [];
  for (let n = 1; n <= 45; n++) {
    hechas.push(await responder(page, fijo ?? (n <= aciertos ? 'bien' : 'mal')));
    if (/resultados/.test(await avanzar(page))) break;
  }
  return hechas;
}

async function resultado(page: Page) {
  await expect(panelResultado(page)).toBeVisible();
  return page.evaluate(() => {
    // Solo blancos ASCII: `\s` incluye U+00A0 y borraría el espacio duro del «65 %».
    const t = (s: string): string => (document.querySelector(s)?.textContent ?? '').replace(/[ \t\n\r]+/g, ' ').trim();
    return {
      emoji: t('[class*="resultadoEmoji"]'),
      titulo: t('[class*="resultadoTitulo"]'),
      porcentaje: t('[class*="resultadoPorcentaje"]'),
      tituloErrores: t('[class*="errorListTitulo"]'),
      errores: document.querySelectorAll('[class*="errorItem"]').length,
      porGrupo: Object.fromEntries(
        [...document.querySelectorAll('[class*="statGrupo"]')].map((g) => [
          (g.querySelector('[class*="statLabel"]')?.textContent ?? '').trim(),
          (g.querySelector('[class*="statConteo"]')?.textContent ?? '').trim(),
        ]),
      ) as Record<string, string>,
    };
  });
}

/** Aciertos por grupo «c/t» que debe pintar el resultado, calculados de lo jugado. */
function porGrupoEsperado(hechas: Respuesta[]): Record<string, string> {
  const cuenta: Record<string, { c: number; t: number }> = {};
  for (const h of hechas) {
    cuenta[h.correcta] ??= { c: 0, t: 0 };
    cuenta[h.correcta].t++;
    if (h.elegida === h.correcta) cuenta[h.correcta].c++;
  }
  return Object.fromEntries(Object.entries(cuenta).map(([g, { c, t }]) => [g, `${c}/${t}`]));
}

/** Porcentaje con el «%» pegado o tras espacio duro: el formato se vigila en su propio hallazgo. */
const pct = (p: number): RegExp => new RegExp(`^${p}${DURO}?% de acierto$`);

// ─────────────────────────────────────────────────────────────────────────────

test.describe('Quiz Tipos de Plantas · partida', () => {
  /**
   * CASO NORMAL — Modo Rápido, 13 bien y 7 mal.
   * Esperado a mano: 20 plantas distintas del banco de 40; 13/20 = 65 % → Math.round = 65 → tramo
   * ≥ 50 → 👍; «Resultado: 13/20», «Repasa estos 7 errores:» con 7 fichas; el marcador en vivo,
   * «✅ 13 correctas» al contestar la 20.ª; los «c/t» por grupo suman 13/20.
   */
  test('caso normal: 13 aciertos de 20 en Modo Rápido dan 65 % y 👍', async ({ page }) => {
    test.setTimeout(90_000);
    await abrir(page);
    await empezar(page, /^Modo rápido: 20 preguntas/);
    await expect(contador(page)).toHaveText('Pregunta 1 / 20');
    const hechas: Respuesta[] = [];
    for (let n = 1; n <= 20; n++) {
      hechas.push(await responder(page, n <= 13 ? 'bien' : 'mal'));
      if (n === 20) {
        await expect(marcador(page)).toHaveText(/13 correctas$/);
        await expect(page.locator('[class*="btnSiguiente"]')).toHaveText('Ver resultados →');
      }
      await avanzar(page);
    }
    expect(new Set(hechas.map((h) => h.nombre)).size, 'planta repetida en la misma partida').toBe(20);

    const r = await resultado(page);
    expect(r.titulo).toBe('Resultado: 13/20');
    expect(r.emoji).toBe('👍');
    expect(r.porcentaje).toMatch(pct(65));
    expect(r.tituloErrores).toBe('Repasa estos 7 errores:');
    expect(r.errores).toBe(7);
    expect(r.porGrupo).toEqual(porGrupoEsperado(hechas));
  });

  /**
   * CASO LÍMITE — pleno en «Practicar Gimnosperma» y cero en «Practicar Briófito», con «Volver a
   * jugar» entre medias y sin recargar.
   * Esperado a mano: 7/7 = 100 % → 🏆, sin lista de fallos, «Gimnosperma 7/7»; 0/6 = 0 % → 😅,
   * «Repasa estos 6 errores:» con 6 fichas, «Briófito 0/6». La última pregunta dice «Ver resultados →».
   */
  test('caso límite: 7 de 7 da 100 % y 🏆; 0 de 6 da 0 % y 😅; «Volver a jugar» no recarga', async ({ page }) => {
    test.setTimeout(90_000);
    await abrir(page);
    await page.evaluate(() => { (window as unknown as { __marca: string }).__marca = 'sin-recarga'; });
    await empezar(page, /^Practicar Gimnosperma: 7 preguntas/);
    await expect(contador(page)).toHaveText('Pregunta 1 / 7');
    const pleno = await jugar(page, 99);
    expect(pleno).toHaveLength(7);
    let r = await resultado(page);
    expect(r.titulo).toBe('Resultado: 7/7');
    expect(r.emoji).toBe('🏆');
    expect(r.porcentaje).toMatch(pct(100));
    expect(r.errores).toBe(0);
    await expect(page.locator('[class*="errorList"]')).toHaveCount(0);
    expect(r.porGrupo).toEqual({ Gimnosperma: '7/7' });

    await page.getByRole('button', { name: /Volver a jugar/ }).click();
    await expect(page.getByRole('button', { name: /^Modo rápido/ })).toBeVisible();
    expect(await page.evaluate(() => (window as unknown as { __marca?: string }).__marca)).toBe('sin-recarga');

    await empezar(page, /^Practicar Briófito: 6 preguntas/);
    await expect(marcador(page)).toHaveText(/0 correctas$/);
    const cero = await jugar(page, 0);
    expect(cero).toHaveLength(6);
    r = await resultado(page);
    expect(r.titulo).toBe('Resultado: 0/6');
    expect(r.emoji).toBe('😅');
    expect(r.porcentaje).toMatch(pct(0));
    expect(r.tituloErrores).toBe('Repasa estos 6 errores:');
    expect(r.errores).toBe(6);
    expect(r.porGrupo).toEqual({ 'Briófito': '0/6' });
  });

  /**
   * LO QUE NO DEBE OCURRIR — doble clic en la correcta, clic tardío en otra opción, doble clic en
   * «Siguiente» y «Salir» a mitad de partida.
   * Esperado a mano: `seleccionarRespuesta` sale si el estado no es 'jugando' y las opciones quedan
   * disabled → 1 acierto, no 2, y ninguna opción marcada como fallada; el doble clic en
   * «Siguiente» avanza UNA pregunta y no contesta la 2.ª (guarda de ráfaga); «Salir» vuelve al
   * inicio sin recargar y la partida siguiente empieza en «Pregunta 1 / 20» con 0 correctas.
   */
  test('caso de rechazo: el doble clic no puntúa doble ni salta preguntas y «Salir» no recarga', async ({ page }) => {
    test.setTimeout(60_000);
    await abrir(page);
    await page.evaluate(() => { (window as unknown as { __marca: string }).__marca = 'sin-recarga'; });
    await empezar(page, /^Modo rápido/);
    await page.waitForTimeout(600); // fuera de la ráfaga de «Modo Rápido»
    const nombre = norm(await enunciado(page).innerText());
    const ops = await rotulos(page);
    const iC = ops.indexOf(CLAVE[nombre]);
    await opciones(page).nth(iC).dblclick();
    await opciones(page).nth(iC === 0 ? 1 : 0).click({ force: true });
    await expect(page.locator('[class*="feedbackTitulo"]')).toHaveText(/¡Correcto!/);
    await expect(page.locator('[class*="opcionesGrid"] [class*="btnIncorrecto"]')).toHaveCount(0);
    await expect(marcador(page)).toHaveText(/^✅ 1 correctas?$/);

    await page.locator('[class*="btnSiguiente"]').dblclick();
    await expect(contador(page)).toHaveText('Pregunta 2 / 20');
    await page.waitForTimeout(300);
    await expect(feedback(page)).toHaveCount(0);
    expect(await habilitadas(page), 'el 2.º clic no contesta la pregunta 2').toBe(4);

    await page.getByRole('button', { name: 'Salir del quiz' }).click();
    await expect(page.getByRole('button', { name: /^Modo rápido/ })).toBeVisible();
    expect(await page.evaluate(() => (window as unknown as { __marca?: string }).__marca)).toBe('sin-recarga');
    await empezar(page, /^Modo rápido/);
    await expect(contador(page)).toHaveText('Pregunta 1 / 20');
    await expect(marcador(page)).toHaveText(/0 correctas$/);
  });
});

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Ráfaga con ratón de verdad, como el testigo de la familia: 1.er clic en el centro del botón,
 * esperar a que la pantalla NUEVA esté pintada y el 2.º clic en el mismo punto, que el navegador
 * entrega con `detail` 2. Lo que haya debajo es lo que pisa.
 */
async function rafaga(page: Page, boton: Locator, pintada: () => Promise<boolean>, paso: string): Promise<void> {
  // scrollIntoView instantáneo: el de Playwright a veces no ve el botón «quieto» a 360 px
  await boton.evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
  await page.waitForTimeout(100);
  const caja = await boton.boundingBox();
  if (!caja) throw new Error(`${paso}: el botón no tiene caja`);
  const [x, y] = [caja.x + caja.width / 2, caja.y + caja.height / 2];
  await page.mouse.move(x, y);
  await page.mouse.down({ clickCount: 1 });
  await page.mouse.up({ clickCount: 1 });
  await expect.poll(pintada, { intervals: [20], timeout: 3000, message: `${paso}: el primer toque cambia de pantalla` }).toBe(true);
  await page.waitForTimeout(80);
  await page.mouse.down({ clickCount: 2 });
  await page.mouse.up({ clickCount: 2 });
  await page.waitForTimeout(400);
}

async function recorridoConRafagas(page: Page): Promise<void> {
  test.setTimeout(120_000);
  await abrir(page);
  const url = page.url();
  const tema = () => page.locator('html').getAttribute('data-theme');
  const guia = () => page.locator('button[aria-expanded]').filter({ hasText: /guía educativa/ }).first().getAttribute('aria-expanded');
  const enInicio = async () => (await page.getByRole('button', { name: /^Modo rápido/ }).count()) > 0;
  const tema0 = await tema();

  // «Modo Rápido»: el 2.º toque cae sobre una opción de la pregunta 1
  await rafaga(page, page.getByRole('button', { name: /^Modo rápido/ }), async () => (await habilitadas(page)) > 0, 'Modo Rápido');
  expect(await habilitadas(page), 'Modo Rápido: la ráfaga no contesta la pregunta 1').toBe(4);

  // «Salir»: a 360 y 412 el 2.º toque cae sobre el conmutador de tema
  await page.waitForTimeout(600);
  await rafaga(page, page.getByRole('button', { name: 'Salir del quiz' }), enInicio, 'Salir');
  await expect(enunciado(page), 'Salir: la ráfaga no empieza otra partida').toHaveCount(0);
  expect(await tema(), 'Salir: la ráfaga no cambia el tema').toBe(tema0);
  const guia0 = await guia();

  // «Practicar Alga» (6 preguntas): ráfaga en cada opción y en cada «Siguiente»
  await rafaga(page, page.getByRole('button', { name: /^Practicar Alga/ }), async () => (await habilitadas(page)) > 0, 'Practicar Alga');
  expect(await habilitadas(page), 'Practicar Alga: la ráfaga no contesta la pregunta 1').toBe(4);
  for (let n = 1; n <= 6; n++) {
    await page.waitForTimeout(600);
    const nombre = norm(await enunciado(page).innerText());
    const i = (await rotulos(page)).indexOf(CLAVE[nombre]);
    await rafaga(page, opciones(page).nth(i), async () => (await feedback(page).count()) > 0, `opción ${n}`);
    await expect(contador(page), `opción ${n}: la ráfaga no se salta la explicación`).toHaveText(`Pregunta ${n} / 6`);
    await expect(feedback(page)).toBeVisible();

    const sig = page.locator('[class*="btnSiguiente"]');
    const ultima = /resultados/.test(await sig.innerText());
    await rafaga(
      page,
      sig,
      async () => (await panelResultado(page).count()) > 0 || ((await contador(page).count()) > 0 && (await habilitadas(page)) > 0),
      ultima ? 'Ver resultados' : `Siguiente ${n}`,
    );
    if (ultima) break;
    await expect(contador(page)).toHaveText(`Pregunta ${n + 1} / 6`);
    expect(await habilitadas(page), `Siguiente ${n}: la ráfaga no contesta la pregunta nueva`).toBe(4);
  }
  await expect(panelResultado(page), 'Ver resultados: la ráfaga no se come la nota').toBeVisible();
  await expect(page.locator('[class*="resultadoTitulo"]')).toHaveText('Resultado: 6/6');
  expect(await guia(), 'Ver resultados: la ráfaga no abre la guía').toBe(guia0);

  // «Volver a jugar»: el 2.º toque cae sobre un botón de modo o de grupo
  await rafaga(page, page.getByRole('button', { name: /Volver a jugar/ }), enInicio, 'Volver a jugar');
  await expect(enunciado(page), 'Volver a jugar: la ráfaga no empieza otra partida').toHaveCount(0);
  expect(await guia(), 'Volver a jugar: la ráfaga no abre la guía').toBe(guia0);
  expect(await tema()).toBe(tema0);
  expect(page.url(), 'la ráfaga no saca de la app').toBe(url);
}

const MOVIL = {
  userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Mobile Safari/537.36',
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
};

test.describe('Doble toque · 360 × 740', () => {
  test.use({ viewport: { width: 360, height: 740 }, ...MOVIL });
  test('sano · la ráfaga en modo, opción, «Siguiente», resultado, «Volver a jugar» y «Salir» es una sola intención', async ({ page }) => {
    await recorridoConRafagas(page);
  });
});

test.describe('Doble toque · 412 × 915', () => {
  test.use({ viewport: { width: 412, height: 915 }, ...MOVIL });
  test('sano · la ráfaga en modo, opción, «Siguiente», resultado, «Volver a jugar» y «Salir» es una sola intención', async ({ page }) => {
    await recorridoConRafagas(page);
  });
});

test.describe('Doble toque · 768 × 1024', () => {
  test.use({ viewport: { width: 768, height: 1024 }, ...MOVIL });
  test('sano · la ráfaga en modo, opción, «Siguiente», resultado, «Volver a jugar» y «Salir» es una sola intención', async ({ page }) => {
    await recorridoConRafagas(page);
  });
});

test.describe('Doble toque · escritorio 1280 × 800', () => {
  test.use({ viewport: { width: 1280, height: 800 } });
  test('sano · la ráfaga en modo, opción, «Siguiente», resultado, «Volver a jugar» y «Salir» es una sola intención', async ({ page }) => {
    await recorridoConRafagas(page);
  });
});

// ─────────────────────────────────────────────────────────────────────────────

test.describe('Inspector 28/10/2026 · hallazgos de la partida', () => {
  test('hallazgo · al responder, las cuatro opciones no se rebarajan ni cambian', async ({ page }) => {
    // page.tsx:198-202 — `opcionesActuales` es un useMemo que depende de `juego.estado`: al pasar de
    // 'jugando' a 'feedback' vuelve a llamar a generarOpciones(), que baraja y saca OTROS tres
    // distractores. Medido el 28/10/2026 en una partida rápida: el orden cambia en 20 de 20
    // respuestas, el conjunto en 18 de 20, y en 4 de 7 fallos la opción elegida desaparece (no
    // queda ningún botón rojo). Esperado: las mismas cuatro, en el mismo orden, la elegida en rojo.
    test.fail();
    test.setTimeout(60_000);
    await abrir(page);
    await empezar(page, /^Modo rápido/);
    const fallos: string[] = [];
    for (let n = 1; n <= 6; n++) {
      const r = await responder(page, 'mal');
      const despues = await rotulos(page);
      if (despues.join('|') !== r.antes.join('|')) fallos.push(`P${n} ${r.nombre}: [${r.antes}] → [${despues}]`);
      const roja = page.locator('[class*="opcionesGrid"] button[class*="btnIncorrecto"]');
      if ((await roja.count()) !== 1 || norm(await roja.first().innerText().catch(() => '')).indexOf(r.elegida) < 0) {
        fallos.push(`P${n} elegida «${r.elegida}» sin marcar en rojo`);
      }
      await avanzar(page);
    }
    expect(fallos, 'preguntas en que las opciones cambian al responder').toEqual([]);
  });

  test('hallazgo · «Practicar por grupo» no se acierta entero pulsando siempre el grupo elegido', async ({ page }) => {
    // page.tsx:156-158 — el modo por grupo filtra las plantas de ESE grupo y pregunta «¿A qué grupo
    // pertenece?»: la respuesta es siempre el botón que se acaba de pulsar. Esperado a mano con
    // «Practicar Pteridófito» (7 plantas) pulsando siempre «Pteridófito» sin leer: no debería dar
    // pleno; obtenido «Resultado: 7/7», 100 % y 🏆.
    test.fail();
    test.setTimeout(60_000);
    await abrir(page);
    await empezar(page, /^Practicar Pteridófito: 7 preguntas/);
    await jugar(page, 0, 'Pteridófito');
    const r = await resultado(page);
    expect(r.titulo, 'pulsar siempre «Pteridófito» sin leer la planta da pleno').not.toBe('Resultado: 7/7');
  });

  test('hallazgo · el marcador y la lista de fallos concuerdan en número («1 correcta», «este error»)', async ({ page }) => {
    // page.tsx:309 `{n} correctas` y :431 `Repasa estos {n} errores:` sin singular. Practicar Alga:
    // la 1.ª bien → esperado «✅ 1 correcta»; 5 bien y la 6.ª mal → esperado sin «estos 1 errores».
    // Obtenido el 28/10/2026: «✅ 1 correctas» y «Repasa estos 1 errores:».
    test.fail();
    test.setTimeout(60_000);
    await abrir(page);
    await empezar(page, /^Practicar Alga/);
    const textos: string[] = [];
    for (let n = 1; n <= 6; n++) {
      await responder(page, n <= 5 ? 'bien' : 'mal');
      if (n === 1) textos.push(norm(await marcador(page).innerText()));
      await avanzar(page);
    }
    const r = await resultado(page);
    textos.push(r.tituloErrores);
    expect(textos.filter((t) => /\b1 correctas\b|estos 1 errores/.test(t)), 'textos en plural con 1').toEqual([]);
  });

  test('hallazgo · el porcentaje va separado del «%» con espacio duro («83 % de acierto»)', async ({ page }) => {
    // page.tsx:409 `{porcentaje}% de acierto`. Practicar Alga 5 bien + 1 mal: 5/6 = 83,3 → 83.
    // Obtenido el 28/10/2026: «83% de acierto», pegado.
    test.fail();
    test.setTimeout(60_000);
    await abrir(page);
    await empezar(page, /^Practicar Alga/);
    await jugar(page, 5);
    const r = await resultado(page);
    expect(r.titulo).toBe('Resultado: 5/6');
    expect(r.porcentaje).toBe(`83${DURO}% de acierto`);
  });

  test('hallazgo · tras «Volver a jugar» y «✕ Salir» el foco no cae a <body> y el selector de modo se ve', async ({ page }) => {
    // page.tsx:274-282 — el efecto de foco solo atiende 'jugando', 'feedback' y 'resultados': al
    // volver a 'inicio' el botón pulsado se desmonta y el foco cae a <body> (el primer Tab va al
    // logo). Tras un resultado largo (7 fallos) la portada se pinta con el scroll que tenía el
    // resultado: medido scrollY 1408 a 1280×800 y «Elige tu modo de juego» en y = −943.
    test.fail();
    test.setTimeout(90_000);
    await page.setViewportSize({ width: 1280, height: 800 });
    await abrir(page);
    const enBody = () => page.evaluate(() => document.activeElement === document.body || document.activeElement === null);
    const fallos: string[] = [];
    await empezar(page, /^Modo rápido/);
    await jugar(page, 13);
    await page.getByRole('button', { name: /Volver a jugar/ }).click();
    await expect(page.getByRole('button', { name: /^Modo rápido/ })).toBeVisible();
    await page.waitForTimeout(300);
    if (await enBody()) fallos.push('Volver a jugar: foco en <body>');
    const caja = await page.locator('#titulo-modo').boundingBox();
    if (!caja || caja.y < 0 || caja.y > 800) fallos.push(`Volver a jugar: «Elige tu modo de juego» fuera de la vista (y = ${caja ? Math.round(caja.y) : 'sin caja'})`);
    await empezar(page, /^Modo completo/);
    await page.getByRole('button', { name: 'Salir del quiz' }).click();
    await expect(page.getByRole('button', { name: /^Modo rápido/ })).toBeVisible();
    await page.waitForTimeout(300);
    if (await enBody()) fallos.push('Salir: foco en <body>');
    expect(fallos).toEqual([]);
  });
});

// ─────────────────────────────────────────────────────────────────────────────

/**
 * BANCO Y TEXTOS — cotejado el 28/10/2026. El banco vive dentro de page.tsx (no se puede importar
 * sin arrastrar React): se lee el fuente como texto y se localiza cada ficha por su nombre común.
 */
const fuente = (): string => readFileSync(join(process.cwd(), 'app', 'quiz-tipos-plantas', 'page.tsx'), 'utf8');
function ficha(nombreComun: string): { grupo: string; explicacion: string } {
  const m = fuente().match(new RegExp(`nombreComun: '${nombreComun}'[^\\n]*?grupo: '(\\w+)'[^\\n]*?explicacion: '([^']*)'`));
  if (!m) throw new Error(`no se encuentra la ficha «${nombreComun}» en page.tsx`);
  return { grupo: m[1], explicacion: m[2] };
}

test.describe('Inspector 28/10/2026 · hallazgos del banco y los textos', () => {
  test('hallazgo · la posidonia es monocotiledónea, no dicotiledónea', async ({ page }) => {
    // Posidonia oceanica (L.) Delile: familia Posidoniaceae, orden Alismatales, monocotiledóneas
    // (como todas las fanerógamas marinas: Zostera, Cymodocea). La app la marca 'dicotiledonea'
    // (page.tsx:76), lo repite la explicación y la FAQ visible («angiosperma dicotiledónea»).
    // Caso: en «Practicar Dicotiledónea» llega la posidonia, se pulsa «Monocotiledónea» →
    // esperado «¡Correcto!» · obtenido «❌ Era: Dicotiledónea». Se repite la partida hasta que la
    // posidonia ofrece «Monocotiledónea» (sale con probabilidad 3/5; 8 intentos fallan 7 de 10.000).
    test.fail();
    test.setTimeout(120_000);
    await abrir(page);
    let titulo = '';
    for (let intento = 0; intento < 8 && !titulo; intento++) {
      await empezar(page, /^Practicar Dicotiledónea/);
      for (let n = 1; n <= 7; n++) {
        const nombre = norm(await enunciado(page).innerText());
        if (nombre === 'Posidonia') {
          if (!(await rotulos(page)).includes('Monocotiledónea')) break;
          await responder(page, 'Monocotiledónea');
          titulo = norm(await page.locator('[class*="feedbackTitulo"]').innerText());
          break;
        }
        await responder(page, 'bien');
        await avanzar(page);
      }
      if (!titulo) await page.getByRole('button', { name: 'Salir del quiz' }).click();
    }
    expect(titulo, 'la posidonia no llegó a ofrecer «Monocotiledónea» en 8 partidas').not.toBe('');
    expect(titulo, 'respuesta «Monocotiledónea» a la posidonia').toBe('¡Correcto!');
  });

  test('hallazgo · la FAQ visible no dice que la posidonia sea dicotiledónea', async ({ page }) => {
    // page.tsx:734 (y :530): «La posidonia es una angiosperma dicotiledónea que volvió al mar».
    test.fail();
    await abrir(page);
    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
    const item = page.locator('details').filter({ hasText: '¿La posidonia es un alga?' });
    await item.locator('summary').click();
    await expect(item.locator('p')).not.toContainText('dicotiledónea', { timeout: 2000 });
    expect(ficha('Posidonia').grupo).toBe('monocotiledonea');
  });

  test('hallazgo · explicaciones con datos falsos y una errata', () => {
    // · Fucus: ciclo DIPLONTE, sin alternancia de generaciones (los gametos son la única fase haploide).
    // · Nori (Pyropia): no es fuente de agar-agar; el agar sale de Gelidium y Gracilaria.
    // · Orchis mascula: orquídea TERRESTRE con dos tubérculos; las raíces con velamen que absorben
    //   el agua del aire son de las orquídeas EPÍFITAS.
    // · Tomate: «botanicamente» sin tilde.
    test.fail();
    const fallos: string[] = [];
    if (/alternancia de generaciones/.test(ficha('Fucus').explicacion)) fallos.push('Fucus: alternancia de generaciones');
    if (/agar/i.test(ficha('Nori').explicacion)) fallos.push('Nori: fuente de agar-agar');
    if (/velamen/.test(ficha('Orquídea silvestre').explicacion)) fallos.push('Orchis mascula: velamen');
    if (/botanicamente/.test(ficha('Tomate').explicacion)) fallos.push('Tomate: «botanicamente»');
    expect(fallos).toEqual([]);
  });

  test('hallazgo · las preguntas del FAQPage son las de la FAQ visible, con la misma respuesta', async ({ page }) => {
    // metadata.ts:54-99 escribe 5 preguntas que no se ven en la página; page.tsx:730-734 pinta
    // otras 4. «¿Qué diferencia hay entre una monocotiledónea y una dicotiledónea?» (FAQPage) y
    // «¿Cómo distingo monocotiledóneas de dicotiledóneas rápidamente?» (visible) responden distinto.
    test.fail();
    await abrir(page);
    const enJsonLd = await page.evaluate(() =>
      [...document.querySelectorAll('script[type="application/ld+json"]')]
        .map((s) => JSON.parse(s.textContent ?? '{}'))
        .filter((j) => j['@type'] === 'FAQPage')
        .flatMap((j) => (j.mainEntity as { name: string }[]).map((q) => q.name)),
    );
    expect(enJsonLd.length).toBe(5);
    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
    const visibles = (await page.locator('[class*="faqItem"] summary').allInnerTexts()).map(norm);
    expect(enJsonLd.filter((q) => !visibles.includes(q)), 'preguntas del FAQPage que no están en la página').toEqual([]);
  });

  test('hallazgo · el FAQPage no se contradice con el banco ni lleva erratas', async ({ page }) => {
    // «los briófitos […] no pueden superar unos pocos centímetros de altura» frente al Politriquio
    // de la propia app, «Musgo erecto de hasta 40 cm»; y «reproducándose».
    test.fail();
    await abrir(page);
    const texto = await page.evaluate(() =>
      [...document.querySelectorAll('script[type="application/ld+json"]')].map((s) => s.textContent ?? '').join(' '),
    );
    const fallos: string[] = [];
    if (/no pueden superar unos pocos centímetros/.test(texto) && /hasta 40 cm/.test(fuente())) fallos.push('briófitos «unos pocos centímetros» frente a 40 cm');
    if (/reproducándose/.test(texto)) fallos.push('errata «reproducándose»');
    expect(fallos).toEqual([]);
  });

  test('hallazgo · las algas no se presentan como uno de los grupos «del reino vegetal»', async ({ page }) => {
    // Portada: «Los 6 grupos del reino vegetal» con Alga entre ellos, y la guía: «Algas […] El grupo
    // ancestral de todas las plantas». La espirulina es una cianobacteria (lo dice la propia app) y
    // el kelp, el fucus y el nori no son plantas ni en los cinco reinos de secundaria (Protoctistas)
    // ni en la sistemática actual; de las algas, solo las verdes carófitas emparentan con las plantas.
    test.fail();
    await abrir(page);
    const titulo = await page.getByRole('heading', { name: 'Los 6 grupos del reino vegetal' }).count();
    const conAlga = await page.locator('[class*="vistaGrupoCard"]').filter({ hasText: 'Alga' }).count();
    expect(titulo > 0 && conAlga > 0, 'las algas figuran entre «Los 6 grupos del reino vegetal»').toBe(false);
  });
});
