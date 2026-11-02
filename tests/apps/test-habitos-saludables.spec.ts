import { test, expect, type Locator, type Page } from '@playwright/test';

/**
 * Test de Hábitos Saludables — test de regresión (Inspector, 02/11/2026, primera inspección)
 *
 * La app es de la suite `salud`, sin componente clínico: nivel 2 ALTO de
 * `_private/DISCLAIMER-POLICY.md` («orientación … de hábitos de salud o ejercicio»), aviso
 * `severity="high"` y nunca plegable. Pregunta 21 cosas en 7 áreas y devuelve un porcentaje por
 * área y uno global.
 *
 * DE DÓNDE SALE CADA VALOR ESPERADO (para auditar este fichero sin ejecutarlo)
 *   page.tsx puntúa cada opción por su posición: la 1.ª vale 1 punto y la 4.ª, 4. Por área:
 *       % = round(suma / 12 · 100)        → 3 → 25 · 4 → 33 · 5 → 42 · 6 → 50 · 7 → 58 · 8 → 67
 *                                            9 → 75 · 10 → 83 · 11 → 92 · 12 → 100
 *       nivel (getLevel)     ≥ 80 «Frecuente» · ≥ 60 «Ocasional» · ≥ 40 «Poco frecuente» · «Casi nunca»
 *       sugerencia           < 50 low · < 75 medium · resto high
 *   Global = round(media de los 7 % ya redondeados); mensaje ≥ 75 «¡Excelente!…» · ≥ 50
 *   «Bien encaminado/a…» · resto «Hay varias áreas…». (El doble redondeo no cambia de mensaje a
 *   ningún total: el error máximo es 7 · 0,33 / 7 = 0,33 puntos, y 62/84 = 73,8 + 0,33 < 74,5.)
 *   Cada caso se resolvió a mano ANTES de abrir el navegador:
 *     CASO 1  [3,3,2] [2,3,4] [1,2,2] [3,3,3] [2,2,2] [4,4,2] [1,3,2]
 *             = 8, 9, 5, 9, 6, 10, 6 → 67, 75, 42, 75, 50, 83, 50 → 442 / 7 = 63,14 → 63 %
 *     CASO 2  todo a la 1.ª → 3/12 = 25 % en las 7 → 25 % · todo a la 4.ª → 100 % → 100 %
 *     CASO 3  todo a la 3.ª → 9/12 = 75 % en las 7 → 75 % · seis áreas a 9 y la última a 8
 *             → (6 · 75 + 67) / 7 = 73,86 → 74 %: la frontera del mensaje global
 *
 * QUÉ ESTÁ BIEN Y NO HAY QUE ROMPER (CASOS 1 a 9)
 *   La aritmética por área y la global; no se avanza ni se ve el resultado con una pregunta sin
 *   contestar; «Anterior» conserva lo contestado; «Repetir» lo borra; el doble toque en
 *   «Comenzar», en una opción o en «Siguiente» (con el área siguiente sin contestar) cuenta una
 *   vez; a 390 px no hay desbordamiento; las respuestas no se guardan ni se envían; el aviso es
 *   `high` y no se pliega.
 *
 * LO QUE QUEDA ABIERTO va al final, en `test.fail()` con «HALLAZGO (02/11/2026, ABIERTO)»: cada
 * uno afirma el comportamiento CORRECTO y hoy falla. Al repararlo, se quita el `test.fail()`.
 */

const RUTA = '/test-habitos-saludables/';

const AREAS = [
  'Hidratación',
  'Alimentación',
  'Actividad Física',
  'Descanso y Sueño',
  'Gestión del Tiempo',
  'Conexión Social',
  'Tiempo Personal',
] as const;

/** Las respuestas de un área: la posición (1-4) de la opción elegida en cada una de sus 3 preguntas. */
type Respuestas = readonly number[];

interface ResultadoArea {
  area: string;
  nivel: string;
  pct: number;
  sugerencia: string;
}

/** El primer número de un texto («63%», «63 %» → 63): así el formato del % no tumba la aritmética. */
const numero = (texto: string): number => Number((texto.match(/\d+/) ?? ['NaN'])[0]);

/**
 * La app solo tiene botones, y un clic anterior a la hidratación se pierde: se espera a que
 * React haya colgado sus props del botón de arranque (la señal que basta para mandar eventos,
 * cabecera de `_hidratacion.ts`).
 */
async function esperarBotonHidratado(page: Page, texto: RegExp): Promise<void> {
  await page.waitForFunction(
    (fuente) => {
      const re = new RegExp(fuente);
      const boton = Array.from(document.querySelectorAll('button')).find((b) =>
        re.test(b.textContent ?? ''),
      );
      return !!boton && Object.keys(boton).some((k) => k.startsWith('__reactProps$'));
    },
    texto.source,
    { timeout: 20_000 },
  );
}

async function abrir(page: Page): Promise<void> {
  await page.goto(RUTA);
  await esperarBotonHidratado(page, /Comenzar Test/);
}

const tarjetas = (page: Page) => page.locator('[class*="questionCard"]');
const progreso = (page: Page) => page.locator('[class*="progressInfo"]');
const botonComenzar = (page: Page) => page.getByRole('button', { name: 'Comenzar Test' });
const botonSiguiente = (page: Page) => page.getByRole('button', { name: 'Siguiente →' });
const botonVer = (page: Page) => page.getByRole('button', { name: 'Ver Resultados' });
const botonAnterior = (page: Page) => page.getByRole('button', { name: '← Anterior' });
const botonRepetir = (page: Page) => page.getByRole('button', { name: /Repetir Test/ });

/** Marca las opciones de un área y comprueba que cada clic llegó al estado. */
async function contestarArea(page: Page, r: Respuestas): Promise<void> {
  for (let i = 0; i < r.length; i++) {
    const opcion = tarjetas(page).nth(i).getByRole('button').nth(r[i] - 1);
    await opcion.click();
    await expect(opcion).toHaveAttribute('aria-pressed', 'true');
  }
}

/** Hace el test entero con una respuesta por área y espera a la pantalla de resultados. */
async function hacerTest(page: Page, matriz: readonly Respuestas[]): Promise<void> {
  await botonComenzar(page).click();
  let contestadas = 0;
  for (let a = 0; a < matriz.length; a++) {
    await expect(progreso(page)).toContainText(`Área ${a + 1} de 7: ${AREAS[a]}`);
    await contestarArea(page, matriz[a]);
    contestadas += matriz[a].length;
    await expect(progreso(page)).toContainText(`${contestadas} / 21 preguntas`);
    await (a === matriz.length - 1 ? botonVer(page) : botonSiguiente(page)).click();
  }
  await expect(page.locator('[class*="scoreValue"]')).toBeVisible();
}

async function leerAreas(page: Page): Promise<ResultadoArea[]> {
  const cards = page.locator('[class*="resultCard"]');
  await expect(cards).toHaveCount(7);
  const salida: ResultadoArea[] = [];
  for (let i = 0; i < 7; i++) {
    const c = cards.nth(i);
    salida.push({
      area: (await c.locator('[class*="resultCategory"]').innerText()).trim(),
      nivel: (await c.locator('[class*="resultLevel"]').innerText()).trim(),
      pct: numero(await c.locator('[class*="resultPercent"]').innerText()),
      sugerencia: (await c.locator('[class*="resultSuggestion"]').innerText()).trim(),
    });
  }
  return salida;
}

const leerGlobal = async (page: Page): Promise<number> =>
  numero(await page.locator('[class*="scoreValue"]').innerText());
const mensajeGlobal = (page: Page) => page.locator('[class*="scoreMessage"]');

/** Contraste WCAG entre dos `rgb(...)` calculados por el navegador. */
function contraste(a: string, b: string): number {
  const lum = (t: string): number => {
    const [r, g, bl] = (t.match(/\d+(\.\d+)?/g) ?? []).slice(0, 3).map(Number);
    const lin = (c: number): number => {
      const s = c / 255;
      return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
    };
    return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(bl);
  };
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}

/** Los bloques JSON-LD de la página, ya parseados. */
async function jsonLd(page: Page): Promise<Record<string, unknown>[]> {
  const textos = await page.locator('script[type="application/ld+json"]').allTextContents();
  return textos.map((t) => JSON.parse(t) as Record<string, unknown>);
}

interface PreguntaLd {
  name: string;
  acceptedAnswer: { text: string };
}

async function faqLd(page: Page): Promise<PreguntaLd[]> {
  const faq = (await jsonLd(page)).find((b) => b['@type'] === 'FAQPage');
  expect(faq, 'la página sirve un FAQPage').toBeTruthy();
  return (faq as { mainEntity: PreguntaLd[] }).mainEntity;
}

// ═══════════════════════════════════════════════════════════════════════════
// CASO 1 — un perfil corriente, con áreas en los cuatro niveles
// ═══════════════════════════════════════════════════════════════════════════
test('CASO 1 — perfil mixto: 67, 75, 42, 75, 50, 83 y 50 % por área, 63 % global', async ({ page }) => {
  await abrir(page);
  await hacerTest(page, [[3, 3, 2], [2, 3, 4], [1, 2, 2], [3, 3, 3], [2, 2, 2], [4, 4, 2], [1, 3, 2]]);

  const areas = await leerAreas(page);
  expect(areas.map((a) => a.area)).toEqual([...AREAS]);
  // 8/12, 9/12, 5/12, 9/12, 6/12, 10/12, 6/12
  expect(areas.map((a) => a.pct)).toEqual([67, 75, 42, 75, 50, 83, 50]);
  // 442 / 7 = 63,14 → 63
  expect(await leerGlobal(page)).toBe(63);
  await expect(mensajeGlobal(page)).toHaveText('Bien encaminado/a. Hay áreas donde puedes mejorar.');

  // Nivel y sugerencia solo donde los dos juegos de umbrales coinciden (67, 42 y 83 %). Los de
  // 75 y 50 % son justo los del hallazgo de umbrales, al final: no se fijan aquí.
  expect(areas[0]).toMatchObject({
    nivel: 'Ocasional',
    sugerencia: 'Vas por buen camino. Prueba a beber un vaso de agua al despertar y antes de cada comida.',
  });
  expect(areas[2]).toMatchObject({
    nivel: 'Poco frecuente',
    sugerencia: 'Comienza con caminatas cortas de 10-15 minutos y aumenta gradualmente.',
  });
  expect(areas[5]).toMatchObject({
    nivel: 'Frecuente',
    sugerencia: '¡Excelente red social! Las relaciones son clave para el bienestar.',
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// CASO 2 — los dos extremos
// ═══════════════════════════════════════════════════════════════════════════
test('CASO 2 — todo a la 1.ª opción da 25 % en todo; todo a la 4.ª, 100 %', async ({ page }) => {
  await abrir(page);
  await hacerTest(page, Array(7).fill([1, 1, 1]));
  let areas = await leerAreas(page);
  // 3 / 12 = 25 % → «Casi nunca» (< 40) y sugerencia baja (< 50)
  expect(areas.map((a) => a.pct)).toEqual(Array(7).fill(25));
  expect(areas.map((a) => a.nivel)).toEqual(Array(7).fill('Casi nunca'));
  expect(areas[3].sugerencia).toBe(
    'Prioriza establecer una hora fija para acostarte y crear una rutina relajante.',
  );
  expect(await leerGlobal(page)).toBe(25);
  await expect(mensajeGlobal(page)).toHaveText('Hay varias áreas con oportunidades de mejora.');

  await abrir(page);
  await hacerTest(page, Array(7).fill([4, 4, 4]));
  areas = await leerAreas(page);
  expect(areas.map((a) => a.pct)).toEqual(Array(7).fill(100));
  expect(areas.map((a) => a.nivel)).toEqual(Array(7).fill('Frecuente'));
  expect(await leerGlobal(page)).toBe(100);
  await expect(mensajeGlobal(page)).toHaveText('¡Excelente! Tus hábitos de vida son muy saludables.');
});

// ═══════════════════════════════════════════════════════════════════════════
// CASO 3 — la frontera 74/75 del mensaje global
// ═══════════════════════════════════════════════════════════════════════════
test('CASO 3 — 75 % y 74 % globales: una sola respuesta cruza la frontera', async ({ page }) => {
  await abrir(page);
  await hacerTest(page, Array(7).fill([3, 3, 3]));
  expect((await leerAreas(page)).map((a) => a.pct)).toEqual(Array(7).fill(75));
  expect(await leerGlobal(page)).toBe(75);
  // El mensaje de 75 % es parte del hallazgo de umbrales (al final): aquí solo el número.

  await abrir(page);
  await hacerTest(page, [...Array(6).fill([3, 3, 3]), [3, 3, 2]]);
  const areas = await leerAreas(page);
  expect(areas[6].pct).toBe(67); // 8 / 12
  expect(await leerGlobal(page)).toBe(74); // (6 · 75 + 67) / 7 = 73,86
  await expect(mensajeGlobal(page)).toHaveText('Bien encaminado/a. Hay áreas donde puedes mejorar.');
});

// ═══════════════════════════════════════════════════════════════════════════
// CASO 4 — lo que debe rechazarse: avanzar o ver el resultado con preguntas sin contestar
// ═══════════════════════════════════════════════════════════════════════════
test('CASO 4 — sin las 3 preguntas del área no se avanza, y sin las 21 no hay resultado', async ({ page }) => {
  await abrir(page);
  await botonComenzar(page).click();
  await expect(botonSiguiente(page)).toBeDisabled();

  await contestarArea(page, [1, 1]); // 2 de 3
  await expect(botonSiguiente(page)).toBeDisabled();
  // Ni forzando el evento sobre el botón deshabilitado.
  await botonSiguiente(page).dispatchEvent('click');
  await expect(progreso(page)).toContainText('Área 1 de 7: Hidratación');
  await expect(progreso(page)).toContainText('2 / 21 preguntas');

  await tarjetas(page).nth(2).getByRole('button').first().click();
  await botonSiguiente(page).click();
  for (let a = 1; a < 6; a++) {
    await expect(progreso(page)).toContainText(`Área ${a + 1} de 7`);
    await contestarArea(page, [2, 2, 2]);
    await botonSiguiente(page).click();
  }
  await expect(progreso(page)).toContainText('Área 7 de 7: Tiempo Personal');
  await contestarArea(page, [2, 2]); // 20 de 21
  await expect(botonVer(page)).toBeDisabled();
  await botonVer(page).dispatchEvent('click');
  await expect(page.locator('[class*="scoreValue"]')).toHaveCount(0);
  await expect(progreso(page)).toContainText('20 / 21 preguntas');
});

// ═══════════════════════════════════════════════════════════════════════════
// CASO 5 — «Anterior» conserva lo contestado y «Repetir» lo borra
// ═══════════════════════════════════════════════════════════════════════════
test('CASO 5 — «Anterior» conserva las respuestas; «Repetir Test» vuelve a 0 / 21', async ({ page }) => {
  await abrir(page);
  await botonComenzar(page).click();
  await expect(botonAnterior(page)).toBeDisabled(); // en el área 1 no hay adónde volver
  await contestarArea(page, [4, 3, 2]);
  await botonSiguiente(page).click();
  await expect(progreso(page)).toContainText('Área 2 de 7');
  await botonAnterior(page).click();
  await expect(progreso(page)).toContainText('Área 1 de 7: Hidratación');
  await expect(progreso(page)).toContainText('3 / 21 preguntas');
  const marcadas = [4, 3, 2];
  for (let i = 0; i < marcadas.length; i++) {
    await expect(tarjetas(page).nth(i).getByRole('button').nth(marcadas[i] - 1)).toHaveAttribute('aria-pressed', 'true');
  }
  await expect(botonSiguiente(page)).toBeEnabled();

  await page.goto(RUTA);
  await esperarBotonHidratado(page, /Comenzar Test/);
  await hacerTest(page, Array(7).fill([2, 2, 2]));
  await botonRepetir(page).click();
  await expect(botonComenzar(page)).toBeVisible();
  await botonComenzar(page).click();
  await expect(progreso(page)).toContainText('Área 1 de 7: Hidratación');
  await expect(progreso(page)).toContainText('0 / 21 preguntas');
  await expect(tarjetas(page).getByRole('button', { pressed: true })).toHaveCount(0);
});

// ═══════════════════════════════════════════════════════════════════════════
// CASO 6 y 7 — en móvil: el doble toque cuenta una vez y no hay desbordamiento
// ═══════════════════════════════════════════════════════════════════════════
test.describe('móvil 390 × 844', () => {
  test.use({
    viewport: { width: 390, height: 844 },
    userAgent:
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  });

  /** Dos toques en el centro del control, separados `ms` (la ráfaga de un dedo, 60-300 ms). */
  async function dobleToque(page: Page, boton: Locator, ms = 120): Promise<void> {
    await boton.scrollIntoViewIfNeeded();
    const caja = await boton.boundingBox();
    if (!caja) throw new Error('El control no tiene caja: no está a la vista.');
    const x = caja.x + caja.width / 2;
    const y = caja.y + caja.height / 2;
    await page.touchscreen.tap(x, y);
    await page.waitForTimeout(ms);
    await page.touchscreen.tap(x, y);
    await page.waitForTimeout(300);
  }

  test('CASO 6 — doble toque en «Comenzar», en una opción y en «Siguiente»: una sola intención', async ({ page }) => {
    await abrir(page);
    // «Comenzar»: el 2.º toque cae donde estaba el botón y no puede contestar nada.
    await dobleToque(page, botonComenzar(page));
    await expect(progreso(page)).toContainText('Área 1 de 7: Hidratación');
    await expect(progreso(page)).toContainText('0 / 21 preguntas');

    await contestarArea(page, [3, 3, 3]);
    // «Siguiente» con el área 2 sin contestar: el 2.º toque da en un botón ya deshabilitado.
    await dobleToque(page, botonSiguiente(page));
    await expect(progreso(page)).toContainText('Área 2 de 7: Alimentación');
    await expect(progreso(page)).toContainText('3 / 21 preguntas');

    // Una opción: el 2.º toque repite la misma respuesta, no contesta otra pregunta.
    await dobleToque(page, tarjetas(page).nth(0).getByRole('button').nth(2));
    await expect(progreso(page)).toContainText('4 / 21 preguntas');
    await expect(tarjetas(page).getByRole('button', { pressed: true })).toHaveCount(1);
  });

  test('CASO 7 — a 390 px el test se completa sin desbordar en horizontal', async ({ page }) => {
    await abrir(page);
    const desborde = () =>
      page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(await desborde()).toBe(0);
    await hacerTest(page, [[3, 3, 2], [2, 3, 4], [1, 2, 2], [3, 3, 3], [2, 2, 2], [4, 4, 2], [1, 3, 2]]);
    expect(await leerGlobal(page)).toBe(63); // el mismo perfil que el CASO 1
    expect(await desborde()).toBe(0);
  });

  test('HALLAZGO (02/11/2026, ABIERTO) · tras «Siguiente» el área nueva queda por encima de la pantalla, y tras «Ver Resultados» la puntuación global', async ({ page }) => {
    // Medido: con «Siguiente» a la vista, scrollY = 945 y la cabecera del área 2 en y = −471; al
    // terminar, el círculo de la puntuación global en y = −1.223. La página no se mueve al
    // cambiar de fase: se ve el final del área nueva (o de los resultados) y hay que subir a
    // buscar el principio, seis veces y una más. Receta del catálogo: `traerALaVista` de lib/cromoFijo.
    test.fail();
    await abrir(page);
    await botonComenzar(page).click();
    await contestarArea(page, [3, 3, 3]);
    await botonSiguiente(page).scrollIntoViewIfNeeded();
    await botonSiguiente(page).tap();
    await expect(progreso(page)).toContainText('Área 2 de 7');
    await expect(page.getByRole('heading', { name: 'Alimentación', level: 2 })).toBeInViewport();
    for (let a = 1; a < 7; a++) {
      await contestarArea(page, [2, 2, 2]);
      await (a === 6 ? botonVer(page) : botonSiguiente(page)).click();
    }
    await expect(page.locator('[class*="scoreCircle"]')).toBeInViewport();
  });

  test('HALLAZGO (02/11/2026, ABIERTO) · doble toque en «Repetir Test» arranca el test, y en «Siguiente» se salta un área ya contestada', async ({ page }) => {
    // Medido 3 de 3 a 390 × 844: tras el 1.er toque en «Repetir Test» la pantalla vuelve a la
    // introducción y bajo el dedo queda «Comenzar Test», así que el 2.º toque empieza el test.
    // Y con el área 2 ya contestada (tras «Anterior»), un doble toque en «Siguiente» lleva del
    // área 1 a la 3. Un doble toque es UNA intención (cabo C0082; receta `useGuardaRafaga`).
    test.fail();
    await abrir(page);
    await hacerTest(page, Array(7).fill([2, 3, 4]));
    await dobleToque(page, botonRepetir(page));
    await expect(botonComenzar(page)).toBeVisible();
    await expect(progreso(page)).toHaveCount(0);

    await botonComenzar(page).click();
    await contestarArea(page, [3, 3, 3]);
    await botonSiguiente(page).click();
    await contestarArea(page, [3, 3, 3]);
    await botonAnterior(page).click();
    await expect(progreso(page)).toContainText('Área 1 de 7');
    await dobleToque(page, botonSiguiente(page));
    await expect(progreso(page)).toContainText('Área 2 de 7: Alimentación');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// CASO 8 — «Sin registro, tus datos no se guardan»: comprobado
// ═══════════════════════════════════════════════════════════════════════════
test('CASO 8 — las respuestas no se guardan en el navegador ni viajan en un POST', async ({ page }) => {
  const posts: string[] = [];
  page.on('request', (r) => {
    if (r.method() === 'POST') posts.push(r.url());
  });
  await abrir(page);
  await hacerTest(page, [[1, 2, 3], [4, 3, 2], [1, 1, 1], [2, 2, 2], [3, 3, 3], [4, 4, 4], [1, 4, 1]]);

  const almacenado = await page.evaluate(() => ({
    local: Object.entries(localStorage),
    sesion: Object.entries(sessionStorage),
  }));
  // Solo los contadores de los componentes comunes (`meskeia_recent_apps`, `meskeia_share_visits_*`).
  expect(almacenado.local.map(([k]) => k).filter((k) => !k.startsWith('meskeia_'))).toEqual([]);
  expect(almacenado.sesion).toEqual([]);
  const valores = almacenado.local.map(([, v]) => v).join(' ');
  for (const rastro of ['"h1"', '"d1"', 'answers', 'percentage']) {
    expect(valores, `«${rastro}» no puede quedar guardado`).not.toContain(rastro);
  }
  expect(posts.filter((u) => !u.includes('/api/analytics'))).toEqual([]);
});

// ═══════════════════════════════════════════════════════════════════════════
// CASO 9 — aviso de nivel 2 y datos estructurados servidos
// ═══════════════════════════════════════════════════════════════════════════
test('CASO 9 — el aviso médico no se pliega y la página sirve WebApplication y FAQPage', async ({ page }) => {
  await abrir(page);
  const aviso = page.getByRole('note').filter({ hasText: 'Aviso Médico Importante' });
  await expect(aviso).toBeVisible();
  await expect(aviso).toContainText('No constituye un diagnóstico médico');
  // Nivel 2 ALTO (DISCLAIMER-POLICY §5): nunca plegable, así que no hay botón de plegado.
  await expect(aviso.locator('button[aria-expanded]')).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Términos de Uso' })).toBeVisible();
  await expect(page.locator('h1')).toHaveText(/Test de Hábitos Saludables/);

  const tipos = (await jsonLd(page)).map((b) => b['@type']);
  expect(tipos).toContain('WebApplication');
  expect(tipos).toContain('FAQPage');
});

// ═══════════════════════════════════════════════════════════════════════════
// HALLAZGOS DEL 02/11/2026, ABIERTOS: cada test afirma lo correcto y hoy falla
// ═══════════════════════════════════════════════════════════════════════════

test('HALLAZGO (02/11/2026, ABIERTO) · el nivel de un área contradice a su sugerencia y al mensaje global', async ({ page }) => {
  // Tres juegos de umbrales: nivel 40/60/80 (getLevel), sugerencia 50/75 (getSuggestion) y mensaje
  // global 50/75. Con las 21 respuestas en la 3.ª opción (9/12 = 75 % en cada área) las siete
  // tarjetas dicen «Ocasional» —el 2.º de 4 niveles— y a la vez «¡Excelente hidratación!»,
  // «¡Fantástico nivel de actividad!»…, y arriba «¡Excelente! Tus hábitos de vida son muy
  // saludables.». La sugerencia de nivel alto es la que empieza por «¡».
  test.fail();
  await abrir(page);
  await hacerTest(page, Array(7).fill([3, 3, 3]));
  const areas = await leerAreas(page);
  const contradictorias = areas.filter((a) => a.nivel === 'Ocasional' && a.sugerencia.startsWith('¡'));
  expect(contradictorias.map((a) => a.area)).toEqual([]);
  const mensaje = await mensajeGlobal(page).innerText();
  if (mensaje.startsWith('¡Excelente')) {
    expect(areas.map((a) => a.nivel)).not.toEqual(Array(7).fill('Ocasional'));
  }
});

test('HALLAZGO (02/11/2026, ABIERTO) · la pregunta de sueño no tiene opción para 6-7 horas', async ({ page }) => {
  // Opciones de d1: «Menos de 5 horas» · «5-6 horas» · «7-8 horas» · «Más de 8 horas de calidad».
  // Quien duerme 6 h 30 min no tiene dónde contestar, y «más de 8 h» puntúa más que «7-8 h»
  // aunque la tabla de la propia página da «7-9 h» como el hábito clave (y mezcla la calidad,
  // que ya pregunta d3).
  test.fail();
  await abrir(page);
  await botonComenzar(page).click();
  for (let a = 0; a < 3; a++) {
    await contestarArea(page, [2, 2, 2]);
    await botonSiguiente(page).click();
  }
  await expect(progreso(page)).toContainText('Descanso y Sueño');
  const opciones = await tarjetas(page).nth(0).getByRole('button').allInnerTexts();
  expect(opciones.some((t) => /6\D{1,6}7/.test(t)), opciones.join(' · ')).toBe(true);
});

test('HALLAZGO (02/11/2026, ABIERTO) · el texto blanco de la opción marcada no llega a 4,5:1 en 6 de las 7 áreas', async ({ page }) => {
  // Blanco sobre el color del área: 3,15 (Hidratación) · 2,87 (Alimentación) · 2,85 (Actividad) ·
  // 4,67 (Descanso, la única que pasa) · 3,82 (Tiempo) · 2,41 (Social) · 4,11 (Personal). Texto de
  // 14,4 px y peso 400: exige 4,5:1. Los colores son literales de CATEGORIES, fuera de
  // `check:contraste-marca`, que solo mira la marca.
  test.fail();
  await abrir(page);
  await botonComenzar(page).click();
  const fallos: string[] = [];
  for (let a = 0; a < 7; a++) {
    await contestarArea(page, [1, 1, 1]);
    const marcada = tarjetas(page).nth(0).getByRole('button', { pressed: true });
    await page.waitForTimeout(400); // la transición de 0,2 s del botón
    const { color, fondo } = await marcada.evaluate((el) => {
      const s = getComputedStyle(el);
      return { color: s.color, fondo: s.backgroundColor };
    });
    const r = contraste(color, fondo);
    if (r < 4.5) fallos.push(`${AREAS[a]} ${r.toFixed(2)}`);
    await (a === 6 ? botonVer(page) : botonSiguiente(page)).click();
  }
  expect(fallos).toEqual([]);
});

test('HALLAZGO (02/11/2026, ABIERTO) · la etiqueta de nivel y la cabecera del área, blanco sobre el color del área', async ({ page }) => {
  // La etiqueta (12 px, 600) y el <h2> de la cabecera (20,8 px, 600: no es texto grande, que pide
  // 24 px o 18,66 px en negrita) usan el mismo blanco sobre los mismos siete colores.
  test.fail();
  await abrir(page);
  await botonComenzar(page).click();
  const cabecera = await page.locator('[class*="categoryHeader"]').evaluate((el) => ({
    color: getComputedStyle(el.querySelector('h2') as Element).color,
    fondo: getComputedStyle(el).backgroundColor,
  }));
  const fallos: string[] = [];
  const rc = contraste(cabecera.color, cabecera.fondo);
  if (rc < 4.5) fallos.push(`cabecera Hidratación ${rc.toFixed(2)}`);
  for (let a = 0; a < 7; a++) {
    await contestarArea(page, [4, 4, 4]);
    await (a === 6 ? botonVer(page) : botonSiguiente(page)).click();
  }
  const etiquetas = await page.locator('[class*="resultLevel"]').evaluateAll((els) =>
    els.map((el) => ({ color: getComputedStyle(el).color, fondo: getComputedStyle(el).backgroundColor })),
  );
  etiquetas.forEach((e, i) => {
    const r = contraste(e.color, e.fondo);
    if (r < 4.5) fallos.push(`etiqueta ${AREAS[i]} ${r.toFixed(2)}`);
  });
  expect(fallos).toEqual([]);
});

test('HALLAZGO (02/11/2026, ABIERTO) · «Comenzar Test» y «Ver Resultados» dejan el foco en <body>', async ({ page }) => {
  // Los dos botones se desmontan al cambiar de fase y el foco cae a <body>: con teclado o lector
  // de pantalla se vuelve al principio de la página y no se oye la primera pregunta ni el resultado.
  test.fail();
  await abrir(page);
  await botonComenzar(page).focus();
  await page.keyboard.press('Enter');
  await expect(progreso(page)).toContainText('Área 1 de 7');
  expect(
    await page.evaluate(() => !!document.activeElement?.closest('[class*="testSection"]')),
    'tras «Comenzar», el foco dentro del test',
  ).toBe(true);
  for (let a = 0; a < 7; a++) {
    await contestarArea(page, [2, 2, 2]);
    if (a < 6) await botonSiguiente(page).click();
  }
  await botonVer(page).focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('[class*="scoreValue"]')).toBeVisible();
  expect(
    await page.evaluate(() => !!document.activeElement?.closest('[class*="resultsSection"]')),
    'tras «Ver Resultados», el foco dentro de los resultados',
  ).toBe(true);
});

test('HALLAZGO (02/11/2026, ABIERTO) · tras «Siguiente» con teclado, el Tabulador salta las preguntas del área nueva', async ({ page }) => {
  // El foco se queda en «Siguiente», que pasa a deshabilitado; el siguiente Tab va a «Ver guía
  // educativa», DESPUÉS del área: las 12 opciones nuevas quedan detrás y el cambio de área no se
  // anuncia. Correcto: el siguiente Tab cae en una opción del área nueva.
  test.fail();
  await abrir(page);
  await botonComenzar(page).click();
  await contestarArea(page, [2, 2, 2]);
  await botonSiguiente(page).focus();
  await page.keyboard.press('Enter');
  await expect(progreso(page)).toContainText('Área 2 de 7');
  await page.keyboard.press('Tab');
  expect(
    await page.evaluate(() => !!document.activeElement?.closest('[class*="questionCard"]')),
    'el Tab siguiente cae en una opción del área 2',
  ).toBe(true);
});

test('HALLAZGO (02/11/2026, ABIERTO) · los iconos de área junto a su nombre no llevan aria-hidden', async ({ page }) => {
  // `areaIcon` (intro), `categoryIcon` (junto al <h2> del área) y `resultIcon` (tarjetas de
  // resultado): el lector lee «gota de agua Hidratación». También `eduEscenarioIcon` y
  // `eduTipIcono` en el bloque educativo.
  test.fail();
  await abrir(page);
  const sinOcultar = await page
    .locator('[class*="areaIcon"]:not([aria-hidden="true"]), [class*="eduEscenarioIcon"]:not([aria-hidden="true"]), [class*="eduTipIcono"]:not([aria-hidden="true"])')
    .count();
  expect(sinOcultar).toBe(0);
  await botonComenzar(page).click();
  await expect(page.locator('[class*="categoryIcon"]')).toHaveAttribute('aria-hidden', 'true');
});

test('HALLAZGO (02/11/2026, ABIERTO) · el porcentaje se pega a la cifra («63%»)', async ({ page }) => {
  // Formato español (CLAUDE.md global §2, decidido el 25/09/2026): «63 %», con espacio duro U+00A0.
  test.fail();
  await abrir(page);
  await hacerTest(page, [[3, 3, 2], [2, 3, 4], [1, 2, 2], [3, 3, 3], [2, 2, 2], [4, 4, 2], [1, 3, 2]]);
  await expect(page.locator('[class*="scoreValue"]')).toHaveText('63 %');
  await expect(page.locator('[class*="resultPercent"]').first()).toHaveText('67 %');
});

test('HALLAZGO (02/11/2026, ABIERTO) · el aviso visible no trae la descarga de responsabilidad del nivel 2', async ({ page }) => {
  // El texto propio del DisclaimerCard SUSTITUYE al estándar del componente (variante médica,
  // nivel 2: «Consulta siempre con tu médico o especialista antes de realizar cambios
  // significativos en tu salud o hábitos» + «meskeIA no se responsabiliza de decisiones…»), y
  // no trae ni lo uno ni lo otro. Lo equivalente («Cambios drásticos de dieta o ejercicio sin
  // supervisión…», «Si tienes condiciones de salud preexistentes, consulta a tu médico antes de
  // modificar hábitos») vive solo en el aviso del bloque educativo, que nace plegado.
  test.fail();
  await abrir(page);
  const aviso = page.getByRole('note').filter({ hasText: 'Aviso Médico Importante' });
  await expect(aviso).toContainText('no se responsabiliza');
  await expect(aviso).toContainText(/antes de (realizar cambios|modificar)/);
});

test('HALLAZGO (02/11/2026, ABIERTO) · la FAQPage da «1,5 a 2 litros» de agua sin fuente, contra la cifra EFSA de la página', async ({ page }) => {
  // La página dice «Total recomendado EFSA: ~2 L (mujeres) / 2,5 L (hombres) contando alimentos
  // y bebidas» (corregido así en 7f116989, 12/05/2026, que quitó «1,5-2 L agua/día»). La FAQPage,
  // de 29/05/2026 (148f545f), volvió a servir a buscadores e IAs la cifra retirada, sin fuente
  // ni distinción por sexo.
  test.fail();
  await page.goto(RUTA);
  const agua = (await faqLd(page)).find((q) => /agua/i.test(q.name));
  expect(agua, 'la FAQPage tiene la pregunta del agua').toBeTruthy();
  const texto = (agua as PreguntaLd).acceptedAnswer.text;
  expect(texto).not.toContain('1,5 a 2 litros');
  if (/litro/i.test(texto)) expect(texto).toContain('EFSA');
});

test('HALLAZGO (02/11/2026, ABIERTO) · la FAQPage dice que el test mide «gestión del estrés» y calla dos de sus áreas', async ({ page }) => {
  // «¿Qué mide un test de hábitos saludables?» → «… horas y calidad del sueño, gestión del estrés
  // y hábitos sedentarios». El test no tiene área de estrés; sí «Gestión del Tiempo», «Conexión
  // Social» y «Tiempo Personal», y las dos últimas no se nombran.
  test.fail();
  await page.goto(RUTA);
  const queMide = (await faqLd(page)).find((q) => /Qué mide/i.test(q.name));
  const texto = (queMide as PreguntaLd).acceptedAnswer.text;
  expect(texto).toMatch(/social/i);
  expect(texto).toMatch(/tiempo personal/i);
  expect(texto).not.toMatch(/gestión del estrés/i);
});

test('HALLAZGO (02/11/2026, ABIERTO) · la pregunta de horas de sueño se responde dos veces, con autoridades distintas', async ({ page }) => {
  // FAQ visible: «La OMS y la NSF recomiendan 7-9 horas para adultos. Menos de 6 horas crónicas se
  // asocia con obesidad…». FAQPage: «… entre 7 y 9 horas … según las recomendaciones de la National
  // Sleep Foundation …». Una sola constante (PREGUNTAS_FRECUENTES), que exige check:faq-unica.
  test.fail();
  await page.goto(RUTA);
  const ld = (await faqLd(page)).find((q) => /horas de sueño/i.test(q.name));
  const dt = page.locator('dt', { hasText: /horas de sueño/i });
  const visible = (await dt.locator('xpath=following-sibling::dd[1]').textContent()) ?? '';
  expect(visible.trim()).toBe((ld as PreguntaLd).acceptedAnswer.text.trim());
});

test('HALLAZGO (02/11/2026, ABIERTO) · el JSON-LD sale con `features` vacía', async ({ page }) => {
  // CLAUDE.md §1.ter pide 4-8 características reales.
  test.fail();
  await page.goto(RUTA);
  const app = (await jsonLd(page)).find((b) => b['@type'] === 'WebApplication');
  const lista = (app as { featureList?: string[] }).featureList ?? [];
  expect(lista.length).toBeGreaterThanOrEqual(4);
  expect(lista.length).toBeLessThanOrEqual(8);
});

test('HALLAZGO (02/11/2026, ABIERTO) · «hasta 400 mg de cafeína es seguro» sin fuente y sin el límite del embarazo', async ({ page }) => {
  // EFSA (efsa.europa.eu/en/topics/topic/caffeine): 400 mg/día para adultos sanos, y 200 mg/día
  // en embarazo y lactancia. La FAQ visible dice «Hasta 3-4 tazas al día (400 mg cafeína) es
  // seguro para la mayoría de adultos» y calla el segundo límite.
  test.fail();
  await page.goto(RUTA);
  const cafe = page.locator('[data-guia-educativa] dd', { hasText: '400 mg' });
  await expect(cafe).toContainText(/embaraz/i);
  await expect(cafe).toContainText('EFSA');
});

test('HALLAZGO (02/11/2026, ABIERTO) · cifras populares del bloque educativo sin fuente', async ({ page }) => {
  // Regla 1 de neutralidad editorial (CLAUDE.md §1.quinquies): cifra con fuente y año, o fuera.
  // Cada frase de la lista, si sigue, tiene que llevar un año en su párrafo.
  test.fail();
  await page.goto(RUTA);
  const frases = [
    'duplica la adherencia',
    'incremento del 10',
    'suprime la melatonina hasta 3 horas',
    'antes de las 20:00',
    'mejor relación esfuerzo-beneficio',
  ];
  const sinFuente = await page.evaluate((lista) => {
    const bloques = Array.from(document.querySelectorAll('[data-guia-educativa] :is(p, dd, li)'));
    return lista.filter((f) =>
      bloques.some((b) => (b.textContent ?? '').includes(f) && !/\b(19|20)\d{2}\b/.test(b.textContent ?? '')),
    );
  }, frases);
  expect(sinFuente).toEqual([]);
});
