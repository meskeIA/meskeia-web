import { test, expect, type Page, type Locator } from '@playwright/test';
import { metadata, jsonLd, faqJsonLd } from '../../app/quiz-complejidad-algoritmos/metadata';
import { esperarPaginaAsentada } from './_hidratacion';
import { ORIGEN } from './_puerto';

/**
 * Quiz Complejidad Algorítmica — test de regresión del Inspector (1.ª pasada, 28/10/2026).
 * Familia «Quizzes de opción múltiple (quiz-*)», testigo tests/familias/quizzes.spec.ts.
 *
 * QUÉ PROMETE LA APP
 * ──────────────────
 * · <h1> «Quiz Complejidad Algorítmica» · «25 preguntas sobre notación Big O, ordenación,
 *   estructuras de datos y análisis de código». Dos modos: «Examen completo (25)» y «Práctica por
 *   categoría (5)» con cinco categorías de 5 preguntas (Notación Big O, Búsqueda y Ordenación,
 *   Estructuras de Datos, Análisis de Código, Comparativa). Tras responder, explicación y
 *   «Siguiente pregunta →» / «Ver resultados →»; en el resultado, «Repetir quiz» y «Cambiar modo».
 *   Solo en el examen, «Resultado por categoría» (correctas/total de cada una).
 *
 * DE DÓNDE SALEN LOS VALORES ESPERADOS
 * ────────────────────────────────────
 * · El banco está ESCRITO DENTRO de page.tsx (BANCO_PREGUNTAS, no se exporta). La tabla `BANCO` de
 *   abajo es la clave resuelta a mano el 28/10/2026 antes de mirar la de la app, con el enunciado
 *   (y el código, en las cinco que lo llevan) para reconocer cada pregunta: la partida no depende
 *   del orden ni de la letra.
 * · Nota: pct = Math.round(aciertos / preguntas · 100) (page.tsx:346); getClasificacion
 *   (page.tsx:296-302): 100 → 🏆 «Experto en algoritmia» · ≥ 80 🌟 «Listo para entrevistas
 *   senior» · ≥ 60 👍 «Buen nivel para entrevistas júnior» · ≥ 40 💪 «Base sólida, sigue
 *   practicando» · resto 📚 «Necesitas repasar los fundamentos».
 * · Doble toque: `useGuardaRafaga` (lib/useGuardaRafaga.ts, captura sobre window) en iniciarQuiz,
 *   siguiente y reiniciar. NO en responder: ver el hallazgo del doble toque sobre una opción.
 */

const RUTA = '/quiz-complejidad-algoritmos/';
const DURO = String.fromCharCode(0xa0);
const UA_MOVIL = 'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Mobile Safari/537.36';
const norm = (s: string | null | undefined): string => (s ?? '').replace(/[ \t\n\r]+/g, ' ').trim();

type Categoria = 'Notación Big O' | 'Búsqueda y Ordenación' | 'Estructuras de Datos' | 'Análisis de Código' | 'Comparativa';
const CATEGORIAS: Categoria[] = ['Notación Big O', 'Búsqueda y Ordenación', 'Estructuras de Datos', 'Análisis de Código', 'Comparativa'];

interface Ficha {
  n: number;
  cat: Categoria;
  enunciado: RegExp;
  codigo?: RegExp;
  /** La opción correcta resuelta a mano (anclada: entre las cuatro casa una sola). */
  correcta: RegExp;
}

const NOT: Categoria = 'Notación Big O';
const BUS: Categoria = 'Búsqueda y Ordenación';
const EST: Categoria = 'Estructuras de Datos';
const ANA: Categoria = 'Análisis de Código';
const COM: Categoria = 'Comparativa';
const CODIGO = /este código/;

const BANCO: Ficha[] = [
  { n: 1, cat: NOT, enunciado: /describe la notación Big O/, correcta: /^El crecimiento del tiempo\/espacio/ },
  { n: 2, cat: NOT, enunciado: /^Ordena de mejor a peor/, correcta: /^O\(1\) < O\(log n\) < O\(n\) < O\(n log n\) < O\(n²\)$/ },
  { n: 3, cat: NOT, enunciado: /por su índice/, correcta: /^O\(1\)$/ },
  { n: 4, cat: NOT, enunciado: /O\(2n \+ 5\)/, correcta: /^O\(n\)$/ },
  { n: 5, cat: NOT, enunciado: /dos bucles anidados/, correcta: /^O\(n²\)$/ },
  { n: 6, cat: BUS, enunciado: /de la búsqueda binaria/, correcta: /^O\(log n\)$/ },
  { n: 7, cat: BUS, enunciado: /media de Quicksort/, correcta: /^O\(n log n\)$/ },
  { n: 8, cat: BUS, enunciado: /garantía de O\(n log n\)/, correcta: /^Merge Sort$/ },
  { n: 9, cat: BUS, enunciado: /Insertion Sort preferible/, correcta: /^Para arrays pequeños/ },
  // La cota inferior es Ω(n log n): se acepta también la notación reparada
  { n: 10, cat: BUS, enunciado: /límite inferior/, correcta: /^[OΩΘ]\(n log n\)$/ },
  { n: 11, cat: EST, enunciado: /en un HashSet/, correcta: /^O\(1\)$/ },
  { n: 12, cat: EST, enunciado: /puntero a cola/, correcta: /^O\(1\)$/ },
  { n: 13, cat: EST, enunciado: /árbol binario de búsqueda/, correcta: /^O\(log n\)$/ },
  { n: 14, cat: EST, enunciado: /heap \(montículo\)/, correcta: /^O\(1\)$/ },
  { n: 15, cat: EST, enunciado: /espacio extra usa Merge Sort/, correcta: /^O\(n\)$/ },
  // for i in range(n): for j in range(i, n) → n + (n−1) + … + 1 = n(n+1)/2
  { n: 16, cat: ANA, enunciado: CODIGO, codigo: /range\(i, n\)/, correcta: /^O\(n²\)$/ },
  // i se divide por 2 hasta 1: ⌊log₂ n⌋ vueltas
  { n: 17, cat: ANA, enunciado: CODIGO, codigo: /i = i \/\/ 2/, correcta: /^O\(log n\)$/ },
  // Fibonacci ingenuo: 2·F(n+1) − 1 llamadas = Θ(φⁿ); O(2ⁿ) es la única cota superior de las cuatro
  { n: 18, cat: ANA, enunciado: CODIGO, codigo: /return fibonacci\(n-1\)/, correcta: /^[OΘ]\((2|φ)ⁿ\)$/ },
  { n: 19, cat: ANA, enunciado: CODIGO, codigo: /memo = \{\}/, correcta: /^O\(n\)$/ },
  // un bucle de n y, DESPUÉS, dos anidados de n: n + n² → O(n²)
  { n: 20, cat: ANA, enunciado: CODIGO, codigo: /print\(i\)\s+for j/, correcta: /^O\(n²\)$/ },
  { n: 21, cat: COM, enunciado: /lista no ordenada/, correcta: /^HashSet/ },
  { n: 22, cat: COM, enunciado: /casi ordenados/, correcta: /^Insertion Sort/ },
  { n: 23, cat: COM, enunciado: /cola de prioridad/, correcta: /^Heap/ },
  { n: 24, cat: COM, enunciado: /millones de consultas/, correcta: /^HashSet/ },
  { n: 25, cat: COM, enunciado: /k-ésimo/, correcta: /^Max-heap de tamaño k/ },
];

// ── Localizadores ──
const enunciado = (page: Page): Locator => page.locator('[class*="textoPregunta"]');
const opciones = (page: Page): Locator => page.locator('[class*="listaOpciones"] button');
const contador = (page: Page): Locator => page.locator('[class*="progresoInfo"] > span').first();
const marcador = (page: Page): Locator => page.locator('[class*="aciertosActuales"]');
const feedback = (page: Page): Locator => page.locator('[class*="panelFeedback"]');
const siguiente = (page: Page): Locator => page.locator('[class*="btnSiguiente"]');
const tarjetaResultado = (page: Page): Locator => page.locator('[class*="cardResultado"]');
const guia = (page: Page): Locator => page.locator('[class*="toggleButton"]').first();

async function abrir(page: Page, tema?: 'light' | 'dark'): Promise<void> {
  await page.addInitScript((t) => {
    try {
      localStorage.setItem('meskeia_transparency_banner_dismissed', 'true');
      if (t) localStorage.setItem('meskeia-theme', t);
    } catch {
      /* sin almacenamiento: saldrá el aviso y el tema del sistema */
    }
    // El detail de cada clic, registrado ANTES que la guarda (mismo nodo y fase, se engancha antes)
    const w = window as unknown as { __detalles: number[] };
    w.__detalles = [];
    window.addEventListener('click', (e) => w.__detalles.push(e.detail), true);
  }, tema ?? null);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(RUTA);
  await expect(page.locator('h1')).toHaveText('Quiz Complejidad Algorítmica');
  await esperarPaginaAsentada(page);
}

async function comenzarExamen(page: Page): Promise<void> {
  await page.getByRole('button', { name: /Comenzar examen/ }).click();
  await expect(contador(page)).toHaveText('Pregunta 1 de 25');
}

async function comenzarPractica(page: Page, cat: Categoria): Promise<void> {
  const modo = page.getByRole('button', { name: /Práctica por categoría/ });
  await modo.click();
  await expect(modo).toHaveAttribute('aria-pressed', 'true');
  const boton = page.getByRole('button', { name: cat, exact: true });
  await boton.click();
  await expect(boton).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: new RegExp(`^Practicar ${cat}`) }).click();
  await expect(contador(page)).toHaveText('Pregunta 1 de 5');
}

async function fichaVisible(page: Page): Promise<Ficha> {
  const texto = norm(await enunciado(page).innerText());
  const pre = page.locator('[class*="tarjetaPregunta"] pre');
  const codigo = (await pre.count()) > 0 ? await pre.innerText() : '';
  const candidatas = BANCO.filter((f) => f.enunciado.test(texto) && (f.codigo ? f.codigo.test(codigo) : codigo === ''));
  expect(candidatas, `pregunta que no está en la tabla: «${texto}» ${codigo}`).toHaveLength(1);
  return candidatas[0];
}

async function textosOpcion(page: Page): Promise<string[]> {
  return (await page.locator('[class*="listaOpciones"] button > span:nth-child(2)').allInnerTexts()).map(norm);
}

function indiceCorrecta(ficha: Ficha, ops: string[]): number {
  const buenas = ops.map((o, i) => (ficha.correcta.test(o) ? i : -1)).filter((i) => i >= 0);
  expect(buenas, `pregunta ${ficha.n}: la correcta no está entre las cuatro, o está dos veces (${ops.join(' | ')})`).toHaveLength(1);
  return buenas[0];
}

/** Responde la pregunta visible. Devuelve la ficha y la letra (A-D) en que salió la correcta. */
async function responder(page: Page, modo: 'bien' | 'mal'): Promise<{ ficha: Ficha; letra: string }> {
  const ficha = await fichaVisible(page);
  const ops = await textosOpcion(page);
  expect(ops, 'toda pregunta ofrece 4 opciones').toHaveLength(4);
  const iC = indiceCorrecta(ficha, ops);
  await opciones(page).nth(modo === 'bien' ? iC : (iC + 1) % 4).click();
  await expect(feedback(page)).toBeVisible();
  return { ficha, letra: 'ABCD'[iC] };
}

async function avanzar(page: Page): Promise<string> {
  const rotulo = norm(await siguiente(page).innerText());
  await siguiente(page).click();
  return rotulo;
}

/** Juega hasta el resultado: las `aciertos` primeras bien y el resto mal. */
async function jugar(page: Page, aciertos: number): Promise<{ fichas: Ficha[]; letras: string[] }> {
  const fichas: Ficha[] = [];
  const letras: string[] = [];
  for (let n = 1; n <= 30; n++) {
    const { ficha, letra } = await responder(page, n <= aciertos ? 'bien' : 'mal');
    fichas.push(ficha);
    letras.push(letra);
    if (/Ver resultados/.test(await avanzar(page))) break;
  }
  return { fichas, letras };
}

async function resultado(page: Page) {
  await expect(tarjetaResultado(page)).toBeVisible();
  return page.evaluate(() => {
    // Solo blancos ASCII: `\s` se comería el espacio duro del porcentaje
    const t = (el: Element | null): string => (el?.textContent ?? '').replace(/[ \t\n\r]+/g, ' ').trim();
    const stats: Record<string, string> = {};
    for (const s of document.querySelectorAll('[class*="statItem"]')) {
      stats[t(s.querySelector('[class*="statLabel"]'))] = t(s.querySelector('[class*="statNumero"]'));
    }
    const desglose: Record<string, string> = {};
    for (const f of document.querySelectorAll('[class*="filaCategoriaResultado"]')) {
      desglose[t(f.querySelector('[class*="badgePequeno"]'))] = t(f.querySelector('[class*="porcentajeCategoria"]'));
    }
    return {
      circulo: t(document.querySelector('[class*="circuloPuntuacion"]')).replace(/ /g, ''),
      texto: t(document.querySelector('[class*="textoClasificacion"]')),
      emoji: t(document.querySelector('[class*="emojiClasificacion"]')),
      stats,
      desglose,
    };
  });
}

const porcentaje = (p: number): RegExp => new RegExp(`^${p}${DURO}?%$`);

// ─────────────────────────────────────────────────────────────────────────────

test.describe('Quiz Complejidad Algorítmica · partida', () => {
  /**
   * CASO NORMAL — examen, las 18 primeras bien y las 7 últimas mal.
   * A mano: 18/25 = 0,72 → 72 % → tramo ≥ 60 → 👍 «Buen nivel para entrevistas júnior»;
   * estadísticas 18 · 7 · 72 %. El desglose se cuenta de las fichas jugadas; con el orden de hoy
   * (fijo, el del banco) es Notación 5/5 · Búsqueda 5/5 · Estructuras 5/5 · Análisis 3/5 ·
   * Comparativa 0/5.
   */
  test('caso normal: 18 de 25 en el examen dan 72 % y «Buen nivel para entrevistas júnior»', async ({ page }) => {
    test.setTimeout(90_000);
    await abrir(page);
    await comenzarExamen(page);
    const { fichas } = await jugar(page, 18);
    expect(fichas).toHaveLength(25);
    expect(new Set(fichas.map((f) => f.n)).size, 'pregunta repetida en el mismo examen').toBe(25);

    const r = await resultado(page);
    expect(r.circulo).toBe('18/25');
    expect(r.texto).toBe('Buen nivel para entrevistas júnior');
    expect(r.emoji).toBe('👍');
    expect(r.stats.Aciertos).toBe('18');
    expect(r.stats.Errores).toBe('7');
    // El % se admite pegado o con espacio duro: el formato se vigila en su propio hallazgo
    expect(r.stats['Puntuación']).toMatch(porcentaje(72));
    const esperado: Record<string, string> = {};
    for (const c of CATEGORIAS) {
      const deC = fichas.map((f, i) => ({ f, bien: i < 18 })).filter((x) => x.f.cat === c);
      esperado[c] = `${deC.filter((x) => x.bien).length}/${deC.length}`;
    }
    expect(r.desglose).toEqual(esperado);
  });

  /**
   * CASO LÍMITE — práctica de Notación Big O: pleno y, tras «Repetir quiz» sin recargar, cero.
   * A mano: 5/5 → 100 % → 🏆 «Experto en algoritmia», sin desglose (solo sale en el examen);
   * «Repetir quiz» llama a iniciarQuiz: pregunta 1 de 5 y «✓ 0 correctas» en la misma página;
   * 0/5 → 0 % → 📚 «Necesitas repasar los fundamentos», 5 errores.
   */
  test('caso límite: 5 de 5 dan «Experto en algoritmia» y, tras «Repetir quiz» sin recargar, 0 de 5 dan «Necesitas repasar los fundamentos»', async ({ page }) => {
    test.setTimeout(60_000);
    await abrir(page);
    await page.evaluate(() => { (window as unknown as { __marca: string }).__marca = 'sin-recarga'; });
    await comenzarPractica(page, 'Notación Big O');
    const { fichas } = await jugar(page, 99);
    expect(fichas.map((f) => f.cat)).toEqual(Array.from({ length: 5 }, () => 'Notación Big O'));
    let r = await resultado(page);
    expect(r.circulo).toBe('5/5');
    expect(r.texto).toBe('Experto en algoritmia');
    expect(r.emoji).toBe('🏆');
    expect(r.stats['Puntuación']).toMatch(porcentaje(100));
    expect(r.desglose).toEqual({});

    await page.getByRole('button', { name: 'Repetir quiz' }).click();
    await expect(contador(page)).toHaveText('Pregunta 1 de 5');
    await expect(marcador(page)).toHaveText('✓ 0 correctas');
    expect(await page.evaluate(() => (window as unknown as { __marca?: string }).__marca)).toBe('sin-recarga');
    await jugar(page, 0);
    r = await resultado(page);
    expect(r.circulo).toBe('0/5');
    expect(r.texto).toBe('Necesitas repasar los fundamentos');
    expect(r.emoji).toBe('📚');
    expect(r.stats.Errores).toBe('5');
    expect(r.stats['Puntuación']).toMatch(porcentaje(0));
  });

  /**
   * LO QUE SE IGNORA — doble clic en la correcta, clic tardío en otra opción y doble clic en
   * «Siguiente». A mano: `responder` sale por `haRespondido` y las opciones quedan disabled → 1
   * acierto, una sola opción en verde y ninguna en rojo; el doble clic en «Siguiente» avanza UNA
   * pregunta y no la contesta (guarda de ráfaga).
   */
  test('caso de rechazo: la segunda respuesta no cuenta y el doble clic en «Siguiente» avanza una sola pregunta', async ({ page }) => {
    await abrir(page);
    await comenzarExamen(page);
    const ficha = await fichaVisible(page);
    const iC = indiceCorrecta(ficha, await textosOpcion(page));
    await opciones(page).nth(iC).dblclick();
    await opciones(page).nth((iC + 1) % 4).click({ force: true });
    await expect(page.locator('[class*="resultadoFeedback"]')).toHaveText('✓ ¡Correcto!');
    const clases = await opciones(page).evaluateAll((bs) => bs.map((b) => b.className));
    expect(clases.filter((c) => /opcionCorrecta/.test(c))).toHaveLength(1);
    expect(clases.filter((c) => /opcionIncorrecta/.test(c)), 'el clic tardío ha marcado otra opción').toHaveLength(0);
    await expect(marcador(page)).toHaveText(/^✓ 1 correctas?$/);
    for (let i = 0; i < 4; i++) await expect(opciones(page).nth(i)).toBeDisabled();

    await siguiente(page).dblclick();
    await expect(contador(page)).toHaveText('Pregunta 2 de 25');
    await expect(feedback(page), 'el 2.º clic ha contestado la pregunta 2').toHaveCount(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────

/**
 * DOBLE TOQUE — invariante de la familia en los anchos donde el testigo (solo 390 × 844) es ciego
 * y en todas las salidas: «Comenzar examen», cada «Siguiente», «Ver resultados», «Repetir quiz» y
 * «Cambiar modo». El 2.º toque va con detail 2 en el mismo punto y con la pantalla nueva ya
 * pintada. Medido el 28/10/2026 (412, 768, 1280, 390 y 360 px; ratón y toques): 0 fallos. Lo que
 * hay debajo y la guarda se come: «Ver guía educativa» (360-412 px), «Cambiar modo» tras «Ver
 * resultados» (390-412), las relacionadas (768), la opción D tras «Comenzar» y «Práctica por
 * categoría» tras «Cambiar modo» (360).
 */
async function dobleToque(page: Page, boton: Locator, tactil: boolean, pantallaNueva: () => Promise<void>, paso: string): Promise<void> {
  await boton.scrollIntoViewIfNeeded();
  await page.waitForTimeout(100);
  const caja = await boton.boundingBox();
  if (!caja) throw new Error(`${paso}: el botón no tiene caja`);
  const [x, y] = [caja.x + caja.width / 2, caja.y + caja.height / 2];
  const url = page.url();
  const guiaAntes = await guia(page).getAttribute('aria-expanded');
  if (tactil) await page.touchscreen.tap(x, y);
  else {
    await page.mouse.move(x, y);
    await page.mouse.down({ clickCount: 1 });
    await page.mouse.up({ clickCount: 1 });
  }
  await pantallaNueva();
  await page.waitForTimeout(80);
  if (tactil) await page.touchscreen.tap(x, y);
  else {
    await page.mouse.down({ clickCount: 2 });
    await page.mouse.up({ clickCount: 2 });
  }
  await page.waitForTimeout(400);
  const detalles = await page.evaluate(() => (window as unknown as { __detalles: number[] }).__detalles);
  expect(detalles[detalles.length - 1], `${paso}: el 2.º toque no llegó como ráfaga (detail 2): el caso pasaría en vacío`).toBe(2);
  expect(page.url(), `${paso}: el 2.º toque ha sacado de la app`).toBe(url);
  await expect(guia(page), `${paso}: el 2.º toque ha abierto o cerrado la guía`).toHaveAttribute('aria-expanded', guiaAntes ?? 'false');
}

async function partidaConDobles(page: Page, tactil: boolean): Promise<void> {
  await abrir(page);
  await dobleToque(page, page.getByRole('button', { name: /Comenzar examen/ }), tactil, () => expect(contador(page)).toHaveText('Pregunta 1 de 25'), 'Comenzar');
  await expect(feedback(page), '«Comenzar»: el 2.º toque ha contestado la pregunta 1').toHaveCount(0);
  for (let n = 1; n <= 25; n++) {
    if (tactil) await page.waitForTimeout(550); // leer: un toque tras otro toque cercano sería ráfaga
    await responder(page, 'bien');
    if (n < 25) {
      await dobleToque(page, siguiente(page), tactil, () => expect(contador(page)).toHaveText(`Pregunta ${n + 1} de 25`), `Siguiente ${n}`);
      await expect(contador(page), `«Siguiente» ${n}: el 2.º toque ha saltado otra pregunta`).toHaveText(`Pregunta ${n + 1} de 25`);
      await expect(feedback(page), `«Siguiente» ${n}: el 2.º toque ha contestado la pregunta ${n + 1}`).toHaveCount(0);
    } else {
      await dobleToque(page, siguiente(page), tactil, () => expect(tarjetaResultado(page)).toBeVisible(), 'Ver resultados');
    }
  }
  // «Ver resultados»: la nota sigue en pantalla (25/25), nadie ha pulsado «Repetir» ni «Cambiar modo»
  let r = await resultado(page);
  expect(r.circulo).toBe('25/25');
  expect(r.texto).toBe('Experto en algoritmia');

  await dobleToque(page, page.getByRole('button', { name: 'Repetir quiz' }), tactil, () => expect(contador(page)).toHaveText('Pregunta 1 de 25'), 'Repetir quiz');
  await expect(feedback(page), '«Repetir quiz»: el 2.º toque ha contestado la pregunta 1').toHaveCount(0);
  await jugar(page, 0);
  r = await resultado(page);
  expect(r.circulo).toBe('0/25');

  await dobleToque(page, page.getByRole('button', { name: 'Cambiar modo' }), tactil, () => expect(page.locator('[class*="tituloInicio"]')).toBeVisible(), 'Cambiar modo');
  await expect(enunciado(page), '«Cambiar modo»: el 2.º toque ha empezado otra partida').toHaveCount(0);
  await expect(page.getByRole('button', { name: /Examen completo/ }), '«Cambiar modo»: el 2.º toque ha cambiado el modo').toHaveAttribute('aria-pressed', 'true');
}

test.describe('Doble toque · móvil 412 × 915', () => {
  test.use({ viewport: { width: 412, height: 915 }, userAgent: UA_MOVIL, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
  test('el 2.º toque no contesta, no salta, no saca de la app ni se come la nota', async ({ page }) => {
    test.setTimeout(180_000);
    await partidaConDobles(page, true);
  });
});

test.describe('Doble toque · tableta 768 × 1024', () => {
  test.use({ viewport: { width: 768, height: 1024 }, userAgent: UA_MOVIL, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  test('el 2.º toque no contesta, no salta, no saca de la app ni se come la nota', async ({ page }) => {
    test.setTimeout(180_000);
    await partidaConDobles(page, true);
  });
});

test.describe('Doble clic · escritorio 1280 × 800', () => {
  test.use({ viewport: { width: 1280, height: 800 } });
  test('el 2.º clic no contesta, no salta, no saca de la app ni se come la nota', async ({ page }) => {
    test.setTimeout(180_000);
    await partidaConDobles(page, false);
  });
});

test.describe('Inspector 28/10/2026 · doble toque sobre una opción · móvil 360 × 740', () => {
  test.use({ viewport: { width: 360, height: 740 }, userAgent: UA_MOVIL, deviceScaleFactor: 3, isMobile: true, hasTouch: true });

  /**
   * Punto ciego del testigo: nadie hace doble toque sobre la OPCIÓN. Al responder, el foco va a
   * «Siguiente» con un `focus()` sin preventScroll (page.tsx:338), que desplaza la página 365-534 px
   * a 360-375 px de ancho; `responder` no llama a marcarCambioPantalla, así que la guarda deja
   * pasar el 2.º toque, y en algunas preguntas cae justo sobre «Siguiente pregunta →»: se salta la
   * explicación sin haberla visto (no hay vuelta atrás). Medido el 28/10/2026 contestando bien con
   * ratón (detail 2) y con toques: 360 × 740 → preguntas 10, 21 y 23; 375 × 667 → 7, 9, 21 y 22;
   * 390, 412 y 768 px → ninguna.
   */
  test('3679 · el 2.º toque sobre la opción elegida no pulsa «Siguiente» ni salta la explicación', async ({ page }) => {
    // REPARADO el 28/10/2026 (medido antes: [10, 21, 23]): contestar marca la guarda con soloMismoPunto
    test.setTimeout(120_000);
    await abrir(page);
    await comenzarExamen(page);
    const saltadas: number[] = [];
    for (let n = 1; n <= 25; n++) {
      const ficha = await fichaVisible(page);
      const opcion = opciones(page).nth(indiceCorrecta(ficha, await textosOpcion(page)));
      await opcion.scrollIntoViewIfNeeded();
      const caja = await opcion.boundingBox();
      if (!caja) throw new Error(`pregunta ${n}: la opción no tiene caja`);
      const [x, y] = [caja.x + caja.width / 2, caja.y + caja.height / 2];
      await page.mouse.move(x, y);
      await page.mouse.down({ clickCount: 1 });
      await page.mouse.up({ clickCount: 1 });
      await expect(feedback(page)).toBeVisible();
      await page.waitForTimeout(80);
      await page.mouse.down({ clickCount: 2 });
      await page.mouse.up({ clickCount: 2 });
      await page.waitForTimeout(350);
      if ((await tarjetaResultado(page).count()) > 0) {
        saltadas.push(n);
        break;
      }
      if (norm(await contador(page).innerText()) !== `Pregunta ${n} de 25`) {
        saltadas.push(n);
        continue;
      }
      await siguiente(page).click();
      if (n < 25) await expect(contador(page)).toHaveText(`Pregunta ${n + 1} de 25`);
    }
    expect(saltadas, 'preguntas cuya explicación se salta el 2.º toque sobre la opción').toEqual([]);
  });
});

// ─────────────────────────────────────────────────────────────────────────────

test.describe('Foco (invariante de la familia)', () => {
  test('sano · el foco va al enunciado tras «Comenzar» y «Siguiente», a «Siguiente» tras responder, al resultado y al título del inicio', async ({ page }) => {
    test.setTimeout(60_000);
    const foco = () =>
      page.evaluate(() => {
        const a = document.activeElement;
        if (!a || a === document.body) return 'body';
        return `${a.tagName}${a.getAttribute('tabindex') === '-1' ? '[-1]' : ''}.${String(a.className).split('_').pop()}`;
      });
    await abrir(page);
    await page.getByRole('button', { name: /Comenzar examen/ }).focus();
    await page.keyboard.press('Enter');
    await expect(contador(page)).toHaveText('Pregunta 1 de 25');
    expect(await foco()).toBe('P[-1].textoPregunta');
    // Las opciones son acciones: sin aria-pressed
    expect(await opciones(page).evaluateAll((bs) => bs.filter((b) => b.hasAttribute('aria-pressed')).length)).toBe(0);
    for (let n = 1; n <= 25; n++) {
      const ficha = await fichaVisible(page);
      await opciones(page).nth(indiceCorrecta(ficha, await textosOpcion(page))).focus();
      await page.keyboard.press('Enter');
      await expect(feedback(page)).toBeVisible();
      expect(await foco(), `pregunta ${n}: tras responder`).toBe('BUTTON.btnSiguiente');
      await page.keyboard.press('Enter');
      if (n < 25) {
        await expect(contador(page)).toHaveText(`Pregunta ${n + 1} de 25`);
        expect(await foco(), `pregunta ${n}: tras «Siguiente»`).toBe('P[-1].textoPregunta');
      }
    }
    await expect(tarjetaResultado(page)).toBeVisible();
    expect(await foco()).toBe('DIV[-1].cardResultado');
    await page.getByRole('button', { name: 'Cambiar modo' }).focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('[class*="tituloInicio"]')).toBeVisible();
    expect(await foco()).toBe('H2[-1].tituloInicio');
  });
});

// ─────────────────────────────────────────────────────────────────────────────

/** Contraste del texto de cada elemento contra su primer fondo opaco. */
async function contrastes(page: Page, selector: string): Promise<string[]> {
  return page.evaluate((sel) => {
    const parse = (c: string) => {
      const m = (c.match(/[\d.]+/g) ?? ['0', '0', '0', '0']).map(Number);
      return { r: m[0], g: m[1], b: m[2], a: m.length > 3 ? m[3] : 1 };
    };
    const lum = (c: { r: number; g: number; b: number }): number => {
      const f = (v: number) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
      return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
    };
    const bajos: string[] = [];
    for (const el of document.querySelectorAll(sel)) {
      let fondo = { r: 255, g: 255, b: 255, a: 1 };
      for (let n: Element | null = el; n; n = n.parentElement) {
        const c = parse(getComputedStyle(n).backgroundColor);
        if (c.a >= 1) { fondo = c; break; }
      }
      const a = lum(parse(getComputedStyle(el).color));
      const b = lum(fondo);
      const ratio = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
      if (ratio < 4.5) bajos.push(`${(el.textContent ?? '').trim()} ${ratio.toFixed(2)}`);
    }
    return bajos;
  }, selector);
}

test.describe('Inspector 28/10/2026 · hallazgos de la partida', () => {
  test('hallazgo · el marcador dice «1 correcta», no «1 correctas»', async ({ page }) => {
    test.fail(); // ABIERTO — page.tsx:498 `{totalAciertos} correctas` sin singular (medido «✓ 1 correctas»).
    await abrir(page);
    await comenzarExamen(page);
    await responder(page, 'bien');
    await expect(marcador(page)).toHaveText('✓ 1 correcta', { timeout: 2000 });
  });

  test('hallazgo · el porcentaje del resultado va separado con espacio duro («60 %»)', async ({ page }) => {
    test.fail(); // ABIERTO — page.tsx:598 `{pct}%` pega el «%» (medido «72%», «100%», «0%»).
    await abrir(page);
    await comenzarPractica(page, 'Búsqueda y Ordenación');
    await jugar(page, 3); // 3/5 = 60 %
    const r = await resultado(page);
    expect(r.stats['Puntuación']).toBe(`60${DURO}%`);
  });

  test('hallazgo · la barra de progreso tiene nombre accesible', async ({ page }) => {
    // REPARADO (3691, con el 3773 de figuras-retoricas, 29/10/2026): «Progreso del quiz».
    // Era: page.tsx:502-509: role="progressbar" sin aria-label ni aria-labelledby
    // (ARIA 1.2 exige nombre en progressbar; axe «aria-progressbar-name»). El lector dice «barra de
    // progreso, 0» sin decir de qué.
    await abrir(page);
    await comenzarExamen(page);
    await expect(page.getByRole('progressbar')).toHaveAccessibleName(/.+/, { timeout: 2000 });
  });

  /**
   * El banco no se baraja: mismas 25 preguntas en el mismo orden y cada opción en su letra fija.
   * A mano sobre page.tsx: la correcta es la A en 0 de 25, la B en 1, la C en 14 y la D en 10.
   * Medido el 28/10/2026: pulsar SIEMPRE la C da 14/25 = 56 % «Base sólida, sigue practicando» en el
   * examen y 4/5 = 80 % 🌟 «Listo para entrevistas senior» en la práctica de Comparativa; «Repetir
   * quiz» vuelve a sacar la misma secuencia. Con las letras barajadas, que una sola letra acapare
   * más de 13 de 25 respuestas pasa ≈ 1 de cada 700 veces.
   */
  test('hallazgo · la correcta no cae siempre en la misma letra: «siempre la C» no aprueba', async ({ page }) => {
    test.fail(); // ABIERTO — medido: { A: 0, B: 1, C: 14, D: 10 }
    test.setTimeout(60_000);
    await abrir(page);
    await comenzarExamen(page);
    const { letras } = await jugar(page, 99);
    const cuenta: Record<string, number> = { A: 0, B: 0, C: 0, D: 0 };
    for (const l of letras) cuenta[l]++;
    expect(Math.max(...Object.values(cuenta)), `reparto de la correcta ${JSON.stringify(cuenta)}`).toBeLessThanOrEqual(13);
  });

  test('hallazgo · las insignias de categoría y el marcador «✓ N correctas» llegan a 4,5:1 (tema claro)', async ({ page }) => {
    // REPARADO el 29/10/2026 (3683, con el 3781): los --cat-* bajan a tonos que dan ≥ 4,5:1 con el
    // blanco y el marcador usa --correcto-text. Antes: texto blanco de 12,5 px sobre los colores de categoría del módulo
    // (--cat-*, page.tsx:478/514/611): Notación 4,11 · Búsqueda 2,80 · Estructuras 2,97 · Comparativa
    // 3,51 (solo Análisis, 5,25, cumple; igual en oscuro, el color no cambia de tema). El marcador
    // verde (#28A745 sobre #FAFAFA, 14 px) da 3,00. check:contraste-marca no lo ve: el hexadecimal de
    // la marca llega por una variable propia (--cat-notacion), no por var(--primary).
    await abrir(page, 'light');
    const bajos = await contrastes(page, '[class*="badgesCategoria"] span');
    await comenzarExamen(page);
    await responder(page, 'bien');
    bajos.push(...(await contrastes(page, '[class*="aciertosActuales"]')));
    expect(bajos).toEqual([]);
  });
});

// ─────────────────────────────────────────────────────────────────────────────

test.describe('Inspector 28/10/2026 · promesas (pantalla y metadata)', () => {
  test('sano · 25 preguntas en 5 categorías de 5, como anuncian el hero, los botones y la metadata', async ({ page }) => {
    expect(BANCO).toHaveLength(25);
    for (const c of CATEGORIAS) expect(BANCO.filter((f) => f.cat === c), c).toHaveLength(5);
    expect(String(metadata.description)).toMatch(/25 preguntas/);
    const ld = jsonLd as unknown as { featureList?: string[] };
    expect(ld.featureList?.length ?? 0).toBeGreaterThanOrEqual(4);
    expect(faqJsonLd.mainEntity).toHaveLength(5);
    await abrir(page);
    await expect(page.locator('[class*="heroSubtitulo"]')).toContainText('25 preguntas');
    await expect(page.getByRole('button', { name: 'Examen completo (25)' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Práctica por categoría (5)' })).toBeVisible();
  });
});

// ─────────────────────────────────────────────────────────────────────────────

/**
 * CONTENIDO DEL BANCO — el banco vive en page.tsx sin exportar, así que se LEE DE LA PANTALLA:
 * una partida entera de examen (enunciado, código, opciones, la opción que la app pinta como
 * correcta y la explicación) y la tabla de la guía. Cada pregunta se resolvió a mano antes de
 * mirar la clave de la app; los cálculos van en cada caso.
 */
interface Leida { enunciado: string; codigo: string; opciones: string[]; correcta: string; explicacion: string }
const LEIDAS: Leida[] = [];
const TABLA_GUIA: string[] = [];

function leida(re: RegExp, codigo?: RegExp): Leida {
  const l = LEIDAS.filter((x) => re.test(x.enunciado) && (codigo ? codigo.test(x.codigo) : true));
  if (l.length !== 1) throw new Error(`${l.length} preguntas casan con ${re} ${codigo ?? ''}`);
  return l[0];
}

test.describe('Inspector 28/10/2026 · contenido del banco', () => {
  test.beforeAll(async ({ browser }) => {
    const ctx = await browser.newContext({ baseURL: ORIGEN });
    const page = await ctx.newPage();
    await abrir(page);
    await comenzarExamen(page);
    for (let i = 0; i < 25; i++) {
      const texto = norm(await enunciado(page).innerText());
      const pre = page.locator('[class*="tarjetaPregunta"] pre');
      const codigo = (await pre.count()) > 0 ? await pre.innerText() : '';
      const ops = await textosOpcion(page);
      await opciones(page).first().click();
      await expect(feedback(page)).toBeVisible();
      LEIDAS.push({
        enunciado: texto,
        codigo,
        opciones: ops,
        correcta: norm(await page.locator('[class*="opcionCorrecta"] > span:nth-child(2)').innerText()),
        explicacion: norm(await page.locator('[class*="explicacionFeedback"]').innerText()),
      });
      await siguiente(page).click();
    }
    TABLA_GUIA.push(...(await page.locator('[data-guia-educativa] table tbody tr').allTextContents()).map(norm));
    await ctx.close();
  });

  test('sano · la clave de la app coincide con la resuelta a mano en las 25', () => {
    expect(LEIDAS).toHaveLength(25);
    for (const f of BANCO) {
      const l = leida(f.enunciado, f.codigo);
      expect(l.correcta, `pregunta ${f.n}`).toMatch(f.correcta);
    }
  });

  test('hallazgo · P1: Big O no es «el peor caso»', () => {
    test.fail(); // ABIERTO — la opción buena dice «(caso peor)» y la explicación «Big O describe el
    // comportamiento asintótico en el peor caso». O(g) es una COTA SUPERIOR de una función (Cormen et
    // al., Introduction to Algorithms, cap. 3), y se aplica a cualquier caso: la propia app da
    // «complejidad temporal MEDIA de Quicksort» O(n log n) (P7), HashSet «en el caso promedio» O(1)
    // (P11), Insertion Sort «O(n) en datos casi ordenados» (P22) y el FAQPage «O(n log n) en
    // promedio, aunque O(n²) en el peor caso».
    const l = leida(/describe la notación Big O/);
    expect(l.correcta).not.toMatch(/caso peor/);
    expect(l.explicacion).not.toMatch(/Big O describe el comportamiento asintótico en el peor caso/);
  });

  test('hallazgo · P10: un límite inferior se escribe con Ω, no con O', () => {
    test.fail(); // ABIERTO — «¿Cuál es el límite inferior teórico…?» con clave «O(n log n)» y la
    // explicación «no puede superar O(n log n)». O da una cota SUPERIOR: decir que la ordenación por
    // comparaciones es O(n log n) no dice nada de que no pueda bajar de ahí. La cota es Ω(n log n)
    // (log₂ n! comparaciones; árbol de decisión).
    const l = leida(/límite inferior/);
    expect(l.correcta).not.toMatch(/^O\(/);
    expect(l.explicacion).not.toMatch(/no puede superar O\(n log n\)/);
  });

  test('hallazgo · P18: Fibonacci ingenuo no hace «~2ⁿ» llamadas ni «~1.000 millones» con n = 40', () => {
    test.fail(); // ABIERTO — fib(n) ingenuo hace C(n) = 1 + C(n−1) + C(n−2), C(0) = C(1) = 1, es decir
    // 2·F(n+1) − 1 llamadas = Θ(φⁿ), φ ≈ 1,618. Con n = 40: 2·165.580.141 − 1 = 331.160.281, no «~1.000
    // millones»; y 2⁴⁰ ≈ 1,1·10¹², 3.300 veces más. O(2ⁿ) vale como cota superior (es la clave, y
    // está bien), pero «el árbol tiene ~2ⁿ nodos» y la cifra de n = 40 son falsas.
    const llamadas = (n: number): number => (n <= 1 ? 1 : 1 + llamadas(n - 1) + llamadas(n - 2));
    const fib: number[] = [0, 1];
    for (let i = 2; i <= 41; i++) fib.push(fib[i - 1] + fib[i - 2]);
    expect(llamadas(20)).toBe(2 * fib[21] - 1); // la fórmula, contada a fuerza bruta: 21.891
    expect(2 * fib[41] - 1).toBe(331_160_281);
    const l = leida(CODIGO, /return fibonacci\(n-1\)/);
    expect(l.explicacion).not.toMatch(/~?2ⁿ nodos/);
    expect(l.explicacion).not.toMatch(/1\.000 millones de llamadas/);
  });

  test('hallazgo · P20: «O(2n²)» no puede ser una opción incorrecta, es la misma clase que O(n²)', () => {
    test.fail(); // ABIERTO — el código hace n + n² operaciones; n + n² ≤ 2n² para n ≥ 1, así que el
    // tiempo es O(2n²), y O(2n²) = O(n²) como conjunto (la propia P4 enseña que las constantes
    // multiplicativas se eliminan). La app da por mala la B «O(2n²)». El enunciado no pide la forma
    // simplificada, como sí hace P4.
    const l = leida(CODIGO, /print\(i\)\s+for j/);
    const iguales = l.opciones.filter((o) => /^O\(2n²\)$/.test(o));
    expect(iguales.length === 0 || /simplificad/.test(l.enunciado), `opciones: ${l.opciones.join(' | ')}`).toBe(true);
  });

  test('hallazgo · P21: para UNA búsqueda en una lista no ordenada, el HashSet no sale gratis', () => {
    test.fail(); // ABIERTO — «Para buscar un elemento en una lista no ordenada de 10 millones…»: la
    // explicación da «HashSet ≈ 1 operación» frente a «búsqueda lineal ≈ 5M comparaciones», sin
    // contar que construir el HashSet son 10.000.000 de inserciones (Θ(n)) y ordenar para la binaria
    // ≈ n·log₂ n ≈ 2,3·10⁸ comparaciones. Para una búsqueda, la lineal (≤ n, ≈ n/2 de media) es la
    // más barata; el HashSet gana con MUCHAS consultas, que es justo la P24.
    const l = leida(/lista no ordenada/);
    expect(`${l.enunciado} ${l.explicacion}`).toMatch(/muchas|repetid|consultas|constru|crear el|insertar/i);
  });

  test('hallazgo · P24 y FAQPage: cotas mal etiquetadas («amortizado», lista enlazada con búsqueda binaria)', () => {
    test.fail(); // ABIERTO — (1) «Lista enlazada ordenada O(log n) con binary search»: sin acceso
    // aleatorio, llegar al centro cuesta O(n), así que cada consulta es O(n), y la explicación la
    // mete con «BST/binary search ≈ 20» por consulta. (2) «HashSet O(1) amortizado» y el FAQPage
    // «búsqueda, inserción y eliminación en O(1) amortizado en el caso promedio»: la búsqueda es O(1)
    // en PROMEDIO (esperado), no amortizado — si todas las claves colisionan, cada consulta cuesta
    // Θ(n) y ninguna secuencia lo compensa; «amortizado» es lo de la inserción con redimensionado.
    const l = leida(/millones de consultas/);
    const fallos: string[] = [];
    if (l.opciones.some((o) => /^Lista enlazada.*O\(log n\)/.test(o))) fallos.push('lista enlazada con búsqueda binaria O(log n)');
    if (l.opciones.some((o) => /O\(1\) amortizado/.test(o))) fallos.push('HashSet O(1) amortizado');
    const faq = faqJsonLd.mainEntity.map((q) => q.acceptedAnswer.text).join(' ');
    if (/búsqueda, inserción y eliminación en O\(1\) amortizado/.test(faq)) fallos.push('FAQPage: búsqueda O(1) amortizado');
    expect(fallos).toEqual([]);
  });

  test('hallazgo · P15 y tabla de la guía: una cota de caso medio dice que lo es', () => {
    test.fail(); // ABIERTO — (1) P15: «Quicksort, que ordena in-place con solo O(log n) de pila de
    // llamadas»: es el caso medio; en el peor, la recursión ingenua llega a n − 1 niveles, O(n)
    // (O(log n) en el peor solo recursando primero en la parte menor). (2) La tabla de la guía pone
    // «operaciones hash» en O(1) sin «(promedio)», que sí lleva Quicksort dos filas más abajo; la
    // propia P11 dice que el peor caso es O(n).
    const fallos: string[] = [];
    const p15 = leida(/espacio extra usa Merge Sort/).explicacion;
    if (/solo O\(log n\) de pila/.test(p15) && !/promedio|caso medio|parte (menor|más pequeña)/.test(p15)) fallos.push('P15: pila de Quicksort');
    const filaO1 = TABLA_GUIA.find((t) => /^O\(1\)/.test(t)) ?? '';
    if (/operaciones hash/.test(filaO1) && !/promedio/.test(filaO1)) fallos.push(`tabla: «${filaO1}»`);
    expect(fallos).toEqual([]);
  });
});

// ─────────────────────────────────────────────────────────────────────────────

/**
 * INSPECTOR 29/10/2026 — 2.ª pasada, tras la guarda de la familia (d9e710f8, c5b619bb).
 * Tres casos resueltos a mano ANTES de ejecutar, en escritorio (1280 × 800) y a 360 × 740.
 *
 * CASO NORMAL — práctica de «Análisis de Código» (P16-P20 del banco, las cinco con código),
 * respondiendo bien, mal, bien, bien, mal. La clave, derivada a mano:
 *   · P16 `for i in range(n): for j in range(i, n)` → Σ (n − i) = n(n+1)/2 → O(n²)
 *   · P17 `while i > 1: i = i // 2` → ⌊log₂ n⌋ vueltas → O(log n)
 *   · P18 fib ingenuo T(n) = T(n−1) + T(n−2) + O(1) → Θ(φⁿ) ⊂ O(2ⁿ): la única cota superior de las 4
 *   · P19 fib con memo: cada fib(k), k = 0…n, se calcula una vez → O(n)
 *   · P20 un bucle de n y DESPUÉS dos anidados → n + n² → O(n²)
 * Nota: 3/5 = 0,6 → Math.round(60) = 60 (page.tsx:346) → tramo ≥ 60 → 👍 «Buen nivel para
 * entrevistas júnior»; aciertos 3 · errores 2; sin desglose (solo sale en el examen). Marcador tras
 * cada respuesta: 1, 1, 2, 3, 3. La 5.ª dice «Ver resultados →».
 *
 * CASO LÍMITE — examen completo con las 25 mal. 0/25 → 0 % → 📚 «Necesitas repasar los
 * fundamentos», 25 errores, y el desglose 0/5 en las cinco categorías (5 preguntas cada una) con
 * las barritas a 0 %. En la 25.ª: «Pregunta 25 de 25», «Ver resultados →» y la barra en 24/25
 * (aria-valuenow = índice, page.tsx:508).
 *
 * CASO DE RECHAZO — «Siguiente» sin contestar: no existe hasta responder. Con el foco en el
 * enunciado (tabindex -1), Enter, Espacio y las flechas no contestan ni avanzan: sigue «Pregunta
 * 1 de 25», «✓ 0 correctas», sin panel; y Tab lleva a la opción A.
 *
 * El % se admite pegado o con espacio duro, y el marcador en plural: los vigilan sus hallazgos
 * abiertos (3689 y 3690, arriba).
 */
async function esperarBotonHidratado(page: Page, texto: RegExp): Promise<void> {
  // Sin <input>: React cuelga sus props del botón al hidratar (esperarHidratado del testigo)
  await page.waitForFunction(
    (fuente) => {
      const patron = new RegExp(fuente);
      const boton = [...document.querySelectorAll('button')].find((b) => patron.test(b.textContent ?? ''));
      return Boolean(boton && Object.keys(boton).some((k) => k.startsWith('__reactProps$')));
    },
    texto.source,
  );
}

const ANCHOS_29 = [
  { nombre: 'escritorio 1280 × 800', uso: { viewport: { width: 1280, height: 800 } } },
  {
    nombre: 'móvil 360 × 740',
    uso: { viewport: { width: 360, height: 740 }, userAgent: UA_MOVIL, deviceScaleFactor: 3, isMobile: true, hasTouch: true },
  },
];

for (const ancho of ANCHOS_29) {
  test.describe(`Inspector 29/10/2026 · tres casos · ${ancho.nombre}`, () => {
    test.use(ancho.uso);

    test('caso normal: práctica de Análisis de Código, bien-mal-bien-bien-mal → 3/5, 60 % y «Buen nivel para entrevistas júnior»', async ({ page }) => {
      test.setTimeout(60_000);
      await abrir(page);
      await esperarBotonHidratado(page, /Práctica por categoría/);
      await comenzarPractica(page, 'Análisis de Código');
      const plan: ('bien' | 'mal')[] = ['bien', 'mal', 'bien', 'bien', 'mal'];
      const jugadas: number[] = [];
      const marcas: string[] = [];
      for (let n = 0; n < 5; n++) {
        await expect(contador(page)).toHaveText(`Pregunta ${n + 1} de 5`);
        const { ficha } = await responder(page, plan[n]);
        jugadas.push(ficha.n);
        marcas.push((norm(await marcador(page).innerText()).match(/\d+/) ?? [''])[0]);
        await expect(siguiente(page)).toHaveText(n === 4 ? 'Ver resultados →' : 'Siguiente pregunta →');
        await siguiente(page).click();
      }
      expect([...jugadas].sort((a, b) => a - b), 'la práctica de Análisis son P16-P20').toEqual([16, 17, 18, 19, 20]);
      expect(marcas, 'marcador tras cada respuesta').toEqual(['1', '1', '2', '3', '3']);
      const r = await resultado(page);
      expect(r.circulo).toBe('3/5');
      expect(r.emoji).toBe('👍');
      expect(r.texto).toBe('Buen nivel para entrevistas júnior');
      expect(r.stats.Aciertos).toBe('3');
      expect(r.stats.Errores).toBe('2');
      expect(r.stats['Puntuación']).toMatch(porcentaje(60));
      expect(r.desglose, 'la práctica no lleva desglose por categoría').toEqual({});
    });

    test('caso límite: examen con las 25 mal → 0/25, 0 %, «Necesitas repasar los fundamentos» y 0/5 en cada categoría', async ({ page }) => {
      test.setTimeout(90_000);
      await abrir(page);
      await esperarBotonHidratado(page, /Comenzar examen/);
      await comenzarExamen(page);
      for (let n = 1; n <= 25; n++) {
        await expect(contador(page)).toHaveText(`Pregunta ${n} de 25`);
        await responder(page, 'mal');
        await expect(marcador(page)).toHaveText('✓ 0 correctas');
        if (n === 25) {
          await expect(siguiente(page)).toHaveText('Ver resultados →');
          const barra = page.locator('[role="progressbar"]');
          await expect(barra).toHaveAttribute('aria-valuenow', '24');
          await expect(barra).toHaveAttribute('aria-valuemax', '25');
        }
        await siguiente(page).click();
      }
      const r = await resultado(page);
      expect(r.circulo).toBe('0/25');
      expect(r.emoji).toBe('📚');
      expect(r.texto).toBe('Necesitas repasar los fundamentos');
      expect(r.stats.Aciertos).toBe('0');
      expect(r.stats.Errores).toBe('25');
      expect(r.stats['Puntuación']).toMatch(porcentaje(0));
      expect(r.desglose).toEqual(Object.fromEntries(CATEGORIAS.map((c) => [c, '0/5'])));
      const anchos = await page.locator('[class*="barritaRelleno"]').evaluateAll((bs) => bs.map((b) => (b as HTMLElement).style.width));
      expect(anchos).toEqual(['0%', '0%', '0%', '0%', '0%']);
    });

    test('caso de rechazo: sin contestar no hay «Siguiente», y Enter, Espacio o flechas en el enunciado no contestan ni avanzan', async ({ page }) => {
      await abrir(page);
      await esperarBotonHidratado(page, /Comenzar examen/);
      await page.getByRole('button', { name: /Comenzar examen/ }).focus();
      await page.keyboard.press('Enter');
      await expect(contador(page)).toHaveText('Pregunta 1 de 25');
      await expect(enunciado(page)).toBeFocused();
      await expect(page.getByRole('button', { name: /Siguiente pregunta|Ver resultados/ })).toHaveCount(0);
      for (const tecla of ['Enter', ' ', 'ArrowRight', 'ArrowDown']) await page.keyboard.press(tecla);
      await page.waitForTimeout(300);
      await expect(contador(page)).toHaveText('Pregunta 1 de 25');
      await expect(feedback(page)).toHaveCount(0);
      await expect(marcador(page)).toHaveText('✓ 0 correctas');
      await expect(page.getByRole('button', { name: /Siguiente pregunta|Ver resultados/ })).toHaveCount(0);
      await page.keyboard.press('Tab');
      await expect(opciones(page).first(), 'Tab desde el enunciado va a la opción A').toBeFocused();
    });
  });
}

test.describe('Inspector 29/10/2026 · hallazgo nuevo', () => {
  /**
   * El botón de categoría SELECCIONADO en «Práctica por categoría» pone texto blanco de 14 px
   * (peso 500, texto normal: exige 4,5:1) sobre el mismo --cat-* de las insignias
   * (QuizComplejidadAlgoritmos.module.css:202-217). Calculado a mano con el blanco: Notación
   * #2E86AB 4,11 · Búsqueda #48A9A6 2,80 · Estructuras #E07B39 2,97 · Análisis #7B5EA7 5,25 ·
   * Comparativa #3D9970 3,51; medido el 29/10/2026 igual en claro y en oscuro (el --cat-* no cambia
   * de tema). Notación es la que sale marcada por defecto. Es la misma raíz que las insignias del
   * hallazgo 3683, pero otro elemento que su descripción no nombra.
   */
  test('hallazgo · el botón de categoría seleccionado llega a 4,5:1 en las cinco', async ({ page }) => {
    // REPARADO el 29/10/2026 (3781): antes, medido 4,11 · 2,80 · 2,97 · 5,25 · 3,51 en los dos temas
    const bajos: string[] = [];
    for (const tema of ['light', 'dark'] as const) {
      await abrir(page, tema);
      await esperarBotonHidratado(page, /Práctica por categoría/);
      await page.getByRole('button', { name: /Práctica por categoría/ }).click();
      for (const c of CATEGORIAS) {
        const boton = page.getByRole('button', { name: c, exact: true });
        await boton.click();
        await expect(boton).toHaveAttribute('aria-pressed', 'true');
        bajos.push(...(await contrastes(page, '[class*="btnCategoriaActivo"]')).map((b) => `${tema}: ${b}`));
      }
    }
    expect(bajos).toEqual([]);
  });
});

// ─────────────────────────────────────────────────────────────────────────────

/**
 * INSPECTOR 29/10/2026 (tarde) — re-inspección tras /reparar (6856d845 y 655ecb17: 3781, 3683 y
 * 3691). Los colores se miden PINTADOS: `pintados()` compone, desde <html> hasta el elemento, cada
 * fondo con su alfa y cada `opacity`, que getComputedStyle no aplica (el `contrastes()` de arriba
 * no la ve: por eso su test del 3781 pasa con el puntero encima del botón).
 *
 * Valores esperados, calculados a mano ANTES de ejecutar (WCAG 2.x, luminancia relativa):
 *  · Blanco sobre los --cat-* nuevos (QuizComplejidadAlgoritmos.module.css:26-30): #26718F L 0,1421
 *    → 1,05/0,1921 = 5,47 · #327874 L 0,1537 → 5,15 · #B35A1F L 0,1700 → 4,77 · #7B5EA7 L 0,1500
 *    → 5,25 · #2E7D59 L 0,1597 → 5,01. El texto es blanco en los dos temas: mismas cifras.
 *  · `.btnCategoria:hover { opacity: 0.85 }` (css:199-201): con el puntero encima el botón se
 *    mezcla al 85 % con la tarjeta. En claro (tarjeta #FFFFFF) el texto sigue blanco y el fondo
 *    aclara: #26718F → (70,6; 134,3; 159,8) L 0,210 → 4,04 · #327874 → 3,84 · #B35A1F →
 *    (190,4; 114,8; 64,6) L 0,236 → 3,67 · #7B5EA7 → 3,87 · #2E7D59 → 3,76. En oscuro (tarjeta
 *    #2A2A2A) el texto baja a #DFDFDF: 4,76 · 4,52 · 4,24 · 4,58 · 4,41. Y el inactivo en claro,
 *    #666 sobre #F5F5F5 → #7D7D7D sobre #F7F7F7: 3,83.
 *  · Estado activo frente al inactivo en OSCURO: el fondo activo (--cat-*) contra el inactivo
 *    (--hover #333333, L 0,0331): 0,1921/0,0831 = 2,31 · 2,45 · 2,65 · 2,41 · 2,52; contra la
 *    tarjeta #2A2A2A (L 0,0232): 2,63 · 2,78 · 3,01 · 2,73 · 2,87. Con los --cat-* de antes de
 *    6856d845 eran 3,08 · 4,51 · 4,25 · 2,41 · 3,60 contra el inactivo.
 *  · Círculo de la nota: «/N» es blanco con `opacity: 0.85` (css:528-532) sobre --primary-boton
 *    #26718F → texto (222,5; 233,7; 238,2) L 0,805 → 0,855/0,192 = 4,45; 20,8 px a peso 500 no es
 *    texto grande: exige 4,5.
 *  · Marcador «✓ N correctas»: --correcto-text #155724 (L 0,0711) sobre #FAFAFA (L 0,955) →
 *    1,005/0,1211 = 8,3; en oscuro #7AE79A sobre #1A1A1A, holgado.
 */
interface Pintado { t: string; ratio: number; lumFondo: number; opacidad: string }

async function pintados(page: Page, selector: string): Promise<Pintado[]> {
  return page.evaluate((sel) => {
    interface C { r: number; g: number; b: number; a: number }
    const parse = (c: string): C => {
      const m = (c.match(/[\d.]+/g) ?? ['0', '0', '0', '0']).map(Number);
      return { r: m[0], g: m[1], b: m[2], a: m.length > 3 ? m[3] : 1 };
    };
    const sobre = (c: C, f: C): C => ({ r: c.a * c.r + (1 - c.a) * f.r, g: c.a * c.g + (1 - c.a) * f.g, b: c.a * c.b + (1 - c.a) * f.b, a: 1 });
    const mezcla = (o: number, x: C, f: C): C => ({ r: o * x.r + (1 - o) * f.r, g: o * x.g + (1 - o) * f.g, b: o * x.b + (1 - o) * f.b, a: 1 });
    const lum = (c: C): number => {
      const f = (v: number) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
      return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
    };
    const blanco: C = { r: 255, g: 255, b: 255, a: 1 };
    return [...document.querySelectorAll(sel)].map((el) => {
      const cadena: Element[] = [];
      for (let n: Element | null = el; n; n = n.parentElement) cadena.unshift(n);
      const fondo = (i: number, bajo: C): C => {
        const cs = getComputedStyle(cadena[i]);
        let dentro = sobre(parse(cs.backgroundColor), bajo);
        if (i < cadena.length - 1) dentro = fondo(i + 1, dentro);
        return mezcla(Number(cs.opacity), dentro, bajo);
      };
      const texto = (i: number, bajo: C): C => {
        const cs = getComputedStyle(cadena[i]);
        const bajoDentro = sobre(parse(cs.backgroundColor), bajo);
        const dentro = i < cadena.length - 1 ? texto(i + 1, bajoDentro) : sobre(parse(cs.color), bajoDentro);
        return mezcla(Number(cs.opacity), dentro, bajo);
      };
      const lf = lum(fondo(0, blanco));
      const lt = lum(texto(0, blanco));
      return {
        t: (el.textContent ?? '').trim(),
        ratio: Math.round(((Math.max(lf, lt) + 0.05) / (Math.min(lf, lt) + 0.05)) * 100) / 100,
        lumFondo: lf,
        opacidad: getComputedStyle(el).opacity,
      };
    });
  }, selector);
}

const ratioLum = (a: number, b: number): number => Math.round(((Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)) * 100) / 100;
const BLANCO_SOBRE_CAT = [5.47, 5.15, 4.77, 5.25, 5.01]; // a mano, ver la cabecera del bloque

async function botonCategoria(page: Page, c: Categoria): Promise<Locator> {
  const b = page.getByRole('button', { name: c, exact: true });
  await expect(b).toBeVisible();
  return b;
}

test.describe('Inspector 29/10/2026 (tarde) · re-inspección tras /reparar · escritorio', () => {
  /**
   * CASO NORMAL — sin el puntero encima, el blanco sobre cada --cat-* llega a lo calculado a mano
   * en el botón activo, la insignia del inicio, la de cada pregunta y la del desglose, en los dos
   * temas; el marcador y la barra (con nombre, 655ecb17) se leen a la vez. Examen contestando
   * siempre la A: la barra marca aria-valuenow = índice (0…24) sobre 25.
   */
  test('caso normal: sin puntero encima, las cinco categorías dan 5,47 · 5,15 · 4,77 · 5,25 · 5,01 en botón e insignias, en claro y en oscuro', async ({ page }) => {
    test.setTimeout(120_000);
    for (const tema of ['light', 'dark'] as const) {
      await abrir(page, tema);
      await esperarBotonHidratado(page, /Práctica por categoría/);
      await page.getByRole('button', { name: /Práctica por categoría/ }).click();
      const activos: number[] = [];
      for (const c of CATEGORIAS) {
        await (await botonCategoria(page, c)).click();
        await page.mouse.move(2, 2);
        await page.waitForTimeout(450); // transition: all 0.2s del botón
        const p = await pintados(page, '[class*="btnCategoriaActivo"]');
        expect(p.map((x) => x.t), `${tema}: un solo botón activo`).toEqual([c]);
        activos.push(p[0].ratio);
      }
      activos.forEach((r, i) => expect(r, `${tema}: botón activo ${CATEGORIAS[i]}`).toBeCloseTo(BLANCO_SOBRE_CAT[i], 1));
      const inicio = await pintados(page, '[class*="badgesCategoria"] span');
      expect(inicio.map((x) => x.t)).toEqual(CATEGORIAS);
      inicio.forEach((x, i) => expect(x.ratio, `${tema}: insignia del inicio ${x.t}`).toBeCloseTo(BLANCO_SOBRE_CAT[i], 1));

      await page.getByRole('button', { name: /Examen completo/ }).click();
      await page.getByRole('button', { name: /Comenzar examen/ }).click();
      const vistas = new Map<string, number>();
      for (let n = 1; n <= 25; n++) {
        await expect(contador(page)).toHaveText(`Pregunta ${n} de 25`);
        const barra = page.getByRole('progressbar', { name: 'Progreso del quiz' });
        await expect(barra).toHaveAttribute('aria-valuenow', String(n - 1));
        await expect(barra).toHaveAttribute('aria-valuemax', '25');
        const [ins] = await pintados(page, '[class*="tarjetaPregunta"] > span[class*="badgeCategoria"]');
        vistas.set(ins.t, ins.ratio);
        await opciones(page).first().click();
        await expect(feedback(page)).toBeVisible();
        const [m] = await pintados(page, '[class*="aciertosActuales"]');
        expect(m.ratio, `${tema}: marcador en la pregunta ${n}`).toBeGreaterThanOrEqual(4.5);
        await siguiente(page).click();
      }
      expect([...vistas.keys()].sort()).toEqual([...CATEGORIAS].sort());
      CATEGORIAS.forEach((c, i) => expect(vistas.get(c), `${tema}: insignia de la pregunta ${c}`).toBeCloseTo(BLANCO_SOBRE_CAT[i], 1));
      const desglose = await pintados(page, '[class*="badgePequeno"]');
      expect(desglose.map((x) => x.t)).toEqual(CATEGORIAS);
      desglose.forEach((x, i) => expect(x.ratio, `${tema}: insignia del desglose ${x.t}`).toBeCloseTo(BLANCO_SOBRE_CAT[i], 1));
      const [numero] = await pintados(page, '[class*="numeroAciertos"]');
      expect(numero.ratio).toBeCloseTo(5.47, 1);
    }
  });

  /**
   * CASO LÍMITE — el botón recién elegido CON EL PUNTERO ENCIMA, que es donde queda tras el clic.
   * Esperado: ≥ 4,5 en las cinco, en los dos temas, y el inactivo bajo el puntero también.
   * Obtenido (29/10/2026, tarde): claro 4,04 · 3,84 · 3,67 · 3,87 · 3,76 y el inactivo 3,83;
   * oscuro 4,76 · 4,52 · 4,24 · 4,58 · 4,41. Es la regla `.btnCategoria:hover { opacity: 0.85 }`.
   */
  test('hallazgo · reparación incompleta de 3781: con el puntero encima (tras el clic) el botón de categoría baja de 4,5:1', async ({ page }) => {
    // REPARADO (3813, /reparar 30/10/2026): el :hover ya no baja la opacidad
    test.setTimeout(60_000);
    const bajos: string[] = [];
    for (const tema of ['light', 'dark'] as const) {
      await abrir(page, tema);
      await esperarBotonHidratado(page, /Práctica por categoría/);
      await page.getByRole('button', { name: /Práctica por categoría/ }).click();
      for (const c of CATEGORIAS) {
        await (await botonCategoria(page, c)).click(); // el puntero se queda encima
        await page.waitForTimeout(450);
        const [p] = await pintados(page, '[class*="btnCategoriaActivo"]');
        if (p.ratio < 4.5) bajos.push(`${tema} activo ${c} ${p.ratio} (opacity ${p.opacidad})`);
      }
      const otro = await botonCategoria(page, 'Notación Big O');
      await otro.hover();
      await page.waitForTimeout(450);
      const [q] = await pintados(page, '[class*="categoriasGrid"] button:not([aria-pressed="true"]):hover');
      if (q && q.ratio < 4.5) bajos.push(`${tema} inactivo Notación ${q.ratio}`);
    }
    expect(bajos).toEqual([]);
  });

  /**
   * Lo que la reparación ha movido alrededor: en OSCURO, oscurecer los --cat-* ha acercado el fondo
   * del botón activo al gris del inactivo. Esperado ≥ 3:1 (WCAG 1.4.11, indicador de estado)
   * contra el inactivo y contra la tarjeta. Obtenido: contra el inactivo 2,31 · 2,45 · 2,65 ·
   * 2,41 · 2,52 (antes de 6856d845, 3,08 · 4,51 · 4,25 · 2,41 · 3,60); contra la tarjeta 2,63 ·
   * 2,78 · 3,01 · 2,73 · 2,87. El activo pierde además la franja de color de la izquierda.
   * REPARADO (3814, /reparar 30/10/2026). El esperado del acta pedía que lo diera el FONDO, pero el
   * fondo no puede: para llegar a 3:1 contra la tarjeta (#2A2A2A) el --cat-* tendría que subir a una
   * luminancia de 0,169 y contra el gris del inactivo a 0,2, y con más de 0,183 el blanco encima baja
   * de 4,5:1. WCAG 1.4.11 pide 3:1 al INDICADOR, que puede ser un borde: en oscuro el activo lleva un
   * borde #E5E5E5 de 2 px. Vale el fondo a 3:1 o el borde a 3:1 contra los dos.
   */
  test('hallazgo · en oscuro, el botón de categoría activo se distingue del inactivo con 3:1', async ({ page }) => {
    await abrir(page, 'dark');
    await esperarBotonHidratado(page, /Práctica por categoría/);
    await page.getByRole('button', { name: /Práctica por categoría/ }).click();
    const bajos: string[] = [];
    for (const c of CATEGORIAS) {
      await (await botonCategoria(page, c)).click();
      await page.mouse.move(2, 2);
      await page.waitForTimeout(450);
      const [act] = await pintados(page, '[class*="btnCategoriaActivo"]');
      const [inact] = await pintados(page, '[class*="categoriasGrid"] button:not([aria-pressed="true"])');
      const [tarjeta] = await pintados(page, '[class*="categoriasGrid"]');
      const r1 = ratioLum(act.lumFondo, inact.lumFondo);
      const r2 = ratioLum(act.lumFondo, tarjeta.lumFondo);
      const borde = await page.locator('[class*="btnCategoriaActivo"]').evaluate((b) => {
        const cs = getComputedStyle(b);
        const [r, g, bl] = (cs.borderTopColor.match(/[\d.]+/g) ?? ['0', '0', '0']).map(Number);
        const f = (v: number) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
        return { ancho: parseFloat(cs.borderTopWidth), lum: 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(bl) };
      });
      const porBorde = borde.ancho >= 2 && ratioLum(borde.lum, inact.lumFondo) >= 3 && ratioLum(borde.lum, tarjeta.lumFondo) >= 3;
      if ((r1 < 3 || r2 < 3) && !porBorde) bajos.push(`${c}: ${r1} contra el inactivo, ${r2} contra la tarjeta, sin borde que lo marque`);
    }
    expect(bajos).toEqual([]);
  });

  /** «/25» del círculo: blanco con opacity 0.85 sobre #26718F → 4,45 a mano (ver la cabecera). */
  test('hallazgo · el «/N» del círculo de la nota llega a 4,5:1', async ({ page }) => {
    // REPARADO (3815, /reparar 30/10/2026): sin opacity; antes medido 4,45
    await abrir(page, 'light');
    await esperarBotonHidratado(page, /Práctica por categoría/);
    await comenzarPractica(page, 'Comparativa');
    await jugar(page, 5);
    await expect(tarjetaResultado(page)).toBeVisible();
    const [total] = await pintados(page, '[class*="totalPreguntas"]');
    expect(total.t).toBe('/5');
    expect(total.ratio).toBeGreaterThanOrEqual(4.5);
  });

  /**
   * Forma del cabo C0514: un doble clic sobre una OPCIÓN. La 1.ª pulsación contesta y deshabilita
   * las opciones; el foco va a «Siguiente» (page.tsx:338). La 2.ª cae sobre un botón disabled, que
   * no recibe mousedown ni click, así que la guarda (lib/useGuardaRafaga.ts) no la ve.
   * Esperado: foco en «Siguiente pregunta →». Obtenido: <body> (1280 × 800 y 360 × 740).
   */
  test('hallazgo · forma del cabo C0514: tras un doble clic en una opción el foco sigue en «Siguiente»', async ({ page }) => {
    // REPARADO (3816, /reparar 30/10/2026): useGuardaRafaga devuelve el foco cuando el 2.º toque cae
    // en un control deshabilitado (testigo de la familia: «doble clic en la opción»).
    await abrir(page);
    await esperarBotonHidratado(page, /Comenzar examen/);
    await comenzarExamen(page);
    await opciones(page).first().dblclick();
    await expect(feedback(page)).toBeVisible();
    await page.waitForTimeout(300);
    await expect(siguiente(page)).toBeFocused({ timeout: 1000 });
  });

  /**
   * Forma del cabo C0516: tras fallar, la correcta y la elegida solo se distinguen por el color
   * (opcionCorrecta / opcionIncorrecta). Esperado: una marca que no sea color —✓/✗ visibles o
   * «correcta»/«tu respuesta» en el nombre accesible—. Obtenido: los nombres no cambian («AO(n)»,
   * «BO(log n)»…) y el panel solo dice «✗ Incorrecto».
   */
  test('hallazgo · forma del cabo C0516: la correcta y la fallada se distinguen por algo más que el color', async ({ page }) => {
    // REPARADO (3817, /reparar 30/10/2026): ✓/✗ visibles y la marca en el aria-label
    await abrir(page);
    await esperarBotonHidratado(page, /Comenzar examen/);
    await comenzarExamen(page);
    const { ficha } = await responder(page, 'mal');
    expect(ficha.n).toBeGreaterThan(0);
    const marcas = await page.evaluate(() => {
      const nombre = (b: Element | null): string => {
        if (!b) return '';
        const desc = (b.getAttribute('aria-describedby') ?? '').split(' ').map((id) => document.getElementById(id)?.textContent ?? '').join(' ');
        return `${b.getAttribute('aria-label') ?? b.textContent ?? ''} ${desc}`.trim();
      };
      return {
        correcta: nombre(document.querySelector('[class*="opcionCorrecta"]')),
        fallada: nombre(document.querySelector('[class*="opcionIncorrecta"]')),
      };
    });
    expect(marcas.correcta, 'la correcta').toMatch(/✓|correcta/i);
    expect(marcas.fallada, 'la fallada').toMatch(/✗|incorrecta|tu respuesta|fallada/i);
  });

  /**
   * P21 escribe el orden al revés que P2. P2 enseña «de mejor a peor: O(1) < O(log n) < O(n) < …»
   * (el «<» compara el crecimiento); la explicación de P21 abre con «O(1) > O(log n) > O(n)», que con
   * ese mismo convenio dice que O(1) crece más deprisa que O(n). Esperado: el mismo símbolo que P2
   * (o «mejor que» en palabras). Obtenido: «O(1) > O(log n) > O(n)».
   */
  test('hallazgo · la explicación de P21 no invierte el «<» que enseña P2', async ({ page }) => {
    // REPARADO (3818, /reparar 30/10/2026): «De mejor a peor, como en la escala de P2: O(1) < O(log n) < O(n)»
    await abrir(page);
    await esperarBotonHidratado(page, /Práctica por categoría/);
    await comenzarPractica(page, 'Comparativa');
    let explicacion = '';
    for (let n = 1; n <= 5 && !explicacion; n++) {
      const { ficha } = await responder(page, 'bien');
      if (ficha.n === 21) explicacion = norm(await page.locator('[class*="explicacionFeedback"]').innerText());
      else await siguiente(page).click();
    }
    expect(explicacion, 'P21 está en la práctica de Comparativa').not.toBe('');
    expect(explicacion).not.toMatch(/O\(1\) > O\(log n\) > O\(n\)/);
  });
});

test.describe('Inspector 29/10/2026 (tarde) · re-inspección tras /reparar · móvil 360 × 740', () => {
  test.use({ viewport: { width: 360, height: 740 }, userAgent: UA_MOVIL, deviceScaleFactor: 3, isMobile: true, hasTouch: true });

  /**
   * CASO MÓVIL — práctica de «Estructuras de Datos» con toques: bien, bien, mal, bien, mal.
   * Clave a mano: P11 HashSet promedio O(1) · P12 cola con puntero O(1) · P13 BST balanceado
   * O(log n) · P14 cima del heap O(1) · P15 espacio de Merge Sort O(n). Marcador tras cada
   * respuesta 1, 2, 2, 3, 3 → 3/5 = 0,6 → 60 → tramo ≥ 60 → 👍 «Buen nivel para entrevistas
   * júnior»; 3 aciertos, 2 errores, sin desglose. Barra «Progreso del quiz» con aria-valuenow
   * 0…4 sobre 5. Insignia «Estructuras de Datos» (#B35A1F) a 4,77 sin puntero. Sin desborde
   * horizontal a 360 px en el inicio, la pregunta y el resultado (cabo C0518: limpio).
   */
  test('caso móvil: práctica de Estructuras de Datos por toques, bien-bien-mal-bien-mal → 3/5, 60 % y sin desborde', async ({ page }) => {
    test.setTimeout(60_000);
    await abrir(page, 'light');
    await esperarBotonHidratado(page, /Práctica por categoría/);
    const sinDesborde = async (donde: string) =>
      expect(await page.evaluate(() => document.documentElement.scrollWidth), `${donde}: desborde horizontal`).toBe(360);
    await page.getByRole('button', { name: /Práctica por categoría/ }).tap();
    const est = await botonCategoria(page, 'Estructuras de Datos');
    await est.tap();
    await expect(est).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('button', { name: /^Practicar / })).toHaveText('Practicar Estructuras de Datos →');
    await sinDesborde('inicio');
    await page.getByRole('button', { name: /^Practicar Estructuras/ }).tap();
    const plan: ('bien' | 'mal')[] = ['bien', 'bien', 'mal', 'bien', 'mal'];
    const jugadas: number[] = [];
    const marcas: string[] = [];
    for (let n = 0; n < 5; n++) {
      await expect(contador(page)).toHaveText(`Pregunta ${n + 1} de 5`);
      await expect(page.getByRole('progressbar', { name: 'Progreso del quiz' })).toHaveAttribute('aria-valuenow', String(n));
      await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuemax', '5');
      const [ins] = await pintados(page, '[class*="tarjetaPregunta"] > span[class*="badgeCategoria"]');
      expect(ins.t).toBe('Estructuras de Datos');
      expect(ins.ratio).toBeCloseTo(4.77, 1);
      if (n === 0) await sinDesborde('pregunta');
      await page.waitForTimeout(550); // un toque tras otro cercano sería ráfaga
      const ficha = await fichaVisible(page);
      const iC = indiceCorrecta(ficha, await textosOpcion(page));
      await opciones(page).nth(plan[n] === 'bien' ? iC : (iC + 1) % 4).tap();
      await expect(feedback(page)).toBeVisible();
      jugadas.push(ficha.n);
      marcas.push((norm(await marcador(page).innerText()).match(/\d+/) ?? [''])[0]);
      await page.waitForTimeout(550);
      await siguiente(page).tap();
    }
    expect([...jugadas].sort((a, b) => a - b), 'la práctica de Estructuras son P11-P15').toEqual([11, 12, 13, 14, 15]);
    expect(marcas).toEqual(['1', '2', '2', '3', '3']);
    const r = await resultado(page);
    expect(r.circulo).toBe('3/5');
    expect(r.emoji).toBe('👍');
    expect(r.texto).toBe('Buen nivel para entrevistas júnior');
    expect(r.stats.Aciertos).toBe('3');
    expect(r.stats.Errores).toBe('2');
    expect(r.stats['Puntuación']).toMatch(porcentaje(60));
    expect(r.desglose).toEqual({});
    await sinDesborde('resultado');
  });

  /**
   * El mismo hallazgo de la opacidad, en el móvil: tras tocar la categoría, Chrome deja :hover
   * pegado al botón tocado. Esperado ≥ 4,5. Obtenido: «Estructuras de Datos» 3,67 (opacity 0.85).
   */
  test('hallazgo · reparación incompleta de 3781 (móvil): la categoría recién tocada se queda en :hover y baja de 4,5:1', async ({ page }) => {
    // REPARADO (3813, /reparar 30/10/2026): el :hover ya no baja la opacidad
    await abrir(page, 'light');
    await esperarBotonHidratado(page, /Práctica por categoría/);
    await page.getByRole('button', { name: /Práctica por categoría/ }).tap();
    const est = await botonCategoria(page, 'Estructuras de Datos');
    await est.tap();
    await page.waitForTimeout(450);
    const [p] = await pintados(page, '[class*="btnCategoriaActivo"]');
    expect(p.t).toBe('Estructuras de Datos');
    expect(p.ratio).toBeGreaterThanOrEqual(4.5);
  });
});
