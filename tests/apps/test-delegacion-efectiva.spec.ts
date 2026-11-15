import { test, expect, type Page } from '@playwright/test';
import { esperarPaginaAsentada } from './_hidratacion';
import { selectorDelModulo } from './_modulo-css';
import { contrasteSobreFondoReal } from './_contraste';

/**
 * Inspector — test-delegacion-efectiva (test de autoconocimiento con mapa de dos ejes; hermana de
 * la familia de tests/familias/cuadrante-tests-dos-ejes.spec.ts).
 *
 * Primera inspección: 15/11/2026.
 *
 * LA REGLA QUE DECLARA LA APP (obtenerPerfil y los cálculos de page.tsx)
 *   10 afirmaciones Likert 1-5 (Nada, Poco, Regular, Bastante, Mucho), alternas:
 *     A = acompañamiento = P1 + P3 + P5 + P7 + P9      (de 5 a 25)
 *     B = autonomía      = P2 + P4 + P6 + P8 + P10     (de 5 a 25)
 *   Perfil: A ≥ 18 y B ≥ 18 → «Delegación Efectiva» · A ≥ 18 y B < 14 → «Microgestión con Cariño»
 *           A < 14 y B ≥ 18 → «Soltar y Rezar»      · A < 14 y B < 14 → «Retención Total»
 *           si no: A = B → «Sin tendencia predominante» · A > B → «Tendencia al Control»
 *                  · A < B → «Tendencia a Soltar»
 *   Mapa: pos(p) = 5 + (p − 5)/20 · 90 %  →  left = pos(B) %, top = 100 − pos(A) %
 *         (5 → 5 %, 15 → 50 %, 25 → 95 %; los umbrales 14 y 18 caen en 45,5 % y 63,5 %).
 *   Barras: A/25 · 100 % y B/25 · 100 %.
 *
 * Los esperados de abajo están calculados a mano con esa regla ANTES de ejecutar la app.
 */

const RUTA = '/test-delegacion-efectiva/';

// Respuestas por pregunta (índice 0 = pregunta 1); impares → A, pares → B.
/** A = 5+4+5+4+3 = 21 · B = 2+3+2+1+2 = 10 → Microgestión con Cariño */
const MIXTO = [5, 2, 4, 3, 5, 2, 4, 1, 3, 2];
const TODO_1 = Array<number>(10).fill(1); // A = B = 5
const TODO_5 = Array<number>(10).fill(5); // A = B = 25
/** A = 4+4+4+3+3 = 18 · B = 18 → umbral alto inclusivo: Delegación Efectiva */
const A18_B18 = [4, 4, 4, 4, 4, 4, 3, 3, 3, 3];
/** A = 3+3+3+2+2 = 13 · B = 13 → bajo estricto (< 14): Retención Total */
const A13_B13 = [3, 3, 3, 3, 3, 3, 2, 2, 2, 2];
/** A = 3+3+3+3+2 = 14 · B = 3+3+3+2+2 = 13 → zona media, A > B: Tendencia al Control */
const A14_B13 = [3, 3, 3, 3, 3, 3, 3, 2, 2, 2];
/** A = 3+3+3+3+2 = 14 · B = 3+3+3+3+2 = 14 → Sin tendencia predominante */
const A14_B14 = [3, 3, 3, 3, 3, 3, 3, 3, 2, 2];
/** A = 3+3+3+2+2 = 13 · B = 4+3+3+3+3 = 16 → A < 14 y B en la zona media: Tendencia a Soltar */
const A13_B16 = [3, 4, 3, 3, 3, 3, 2, 3, 2, 3];
/** A = 4+4+3+3+3 = 17 · B = 17 → Sin tendencia predominante */
const A17_B17 = [4, 4, 4, 4, 3, 3, 3, 3, 3, 3];
/** A = 4+4+3+4+3 = 18 · B = 3+3+4+3+3 = 16 → zona media en B, A > B: Tendencia al Control */
const A18_B16 = [4, 3, 4, 3, 3, 4, 4, 3, 3, 3];
/** A = 4+4+3+3+3 = 17 · B = 5 (todo «Nada») → Tendencia al Control */
const A17_B5 = [4, 1, 4, 1, 3, 1, 3, 1, 3, 1];
/** A = 4+4+4+3+3 = 18 · B = 5 → Microgestión con Cariño */
const A18_B5 = [4, 1, 4, 1, 4, 1, 3, 1, 3, 1];
/** P5 («Adapto mi nivel de supervisión según la experiencia de la persona») = 1, el resto 5:
 *  A = 5+5+1+5+5 = 21 · B = 25 → Delegación Efectiva */
const SIN_ADAPTAR = [5, 5, 5, 5, 1, 5, 5, 5, 5, 5];

const perfil = (page: Page) => page.locator('[class*="_profileName"]');
const descripcion = (page: Page) => page.locator('[class*="_profileDescription"]');
const puntuaciones = (page: Page) => page.locator('[class*="_scoreValue"]');
const barras = (page: Page) => page.locator('[class*="_barFill"]');
const punto = (page: Page) => page.locator('[class$="_mapDot"]');
const botonVer = (page: Page) => page.locator('button[class*="_btnPrimary"]');
const progreso = (page: Page) => page.locator('[class*="_progressInfo"]');
const acciones = (page: Page) => page.locator('[class*="_actionsList"] li');
const opcion = (page: Page, pregunta: number, valor: number) =>
  page.getByRole('radiogroup').nth(pregunta).getByRole('radio', { name: new RegExp(`\\(${valor} de 5\\)`) });

async function abrir(page: Page): Promise<void> {
  await page.goto(RUTA);
  await esperarPaginaAsentada(page);
}

async function responder(page: Page, valores: number[], hasta = valores.length): Promise<void> {
  await expect(page.getByRole('radiogroup')).toHaveCount(10);
  for (let i = 0; i < hasta; i++) await opcion(page, i, valores[i]).click();
}

async function verResultado(page: Page, valores: number[]): Promise<void> {
  await responder(page, valores);
  await botonVer(page).click();
  await expect(perfil(page)).toBeVisible();
}

/** Rótulos de los cuadrantes pintados que contienen el centro del punto «Tú». */
async function cuadranteDelPunto(page: Page): Promise<string[]> {
  const mod = await selectorDelModulo(punto(page), 'mapDot');
  return page.evaluate((selCuadrante) => {
    const dot = document.querySelector('[class$="_mapDot"]');
    if (!dot) return [];
    const d = dot.getBoundingClientRect();
    const cx = d.left + d.width / 2;
    const cy = d.top + d.height / 2;
    return Array.from(document.querySelectorAll(selCuadrante))
      .filter((q) => {
        const c = q.getBoundingClientRect();
        return cx > c.left && cx < c.right && cy > c.top && cy < c.bottom;
      })
      .map((q) => (q.textContent ?? '').replace(/\s+/g, ' ').trim());
  }, `${mod}[class*="_quadrant"]`);
}

test.describe('Caso 1 (normal): respuestas mixtas', () => {
  test('A 21 y B 10 → «Microgestión con Cariño», barras al 84 % y 40 %, punto en 27,5 % / 23 %', async ({ page }) => {
    await abrir(page);
    await verResultado(page, MIXTO);
    await expect(perfil(page)).toHaveText('Microgestión con Cariño');
    await expect(puntuaciones(page).nth(0)).toHaveText('21/25');
    await expect(puntuaciones(page).nth(1)).toHaveText('10/25');
    // 21/25 = 84 % · 10/25 = 40 %
    await expect(barras(page).nth(0)).toHaveAttribute('style', /width: 84%/);
    await expect(barras(page).nth(1)).toHaveAttribute('style', /width: 40%/);
    // left = 5 + 5/20·90 = 27,5 % · top = 100 − (5 + 16/20·90) = 23 %
    await expect(punto(page)).toHaveAttribute('style', /left: 27\.5%; top: 23%/);
    await expect(punto(page)).toHaveAttribute('aria-label', 'Tu posición: Acompañamiento 21/25, Autonomía 10/25');
    expect(await cuadranteDelPunto(page)).toEqual(['🔍 Microgestión con Cariño']);
    await expect(acciones(page)).toHaveCount(3);
    await expect(acciones(page).nth(0)).toContainText('Elegir UNA tarea esta semana');
  });
});

test.describe('Caso 2 (límite): extremos y fronteras de los umbrales 14 y 18', () => {
  const extremos: [string, number[], string, number, number, string][] = [
    ['todo «Nada»', TODO_1, 'Retención Total', 5, 5, 'left: 5%; top: 95%'],
    ['todo «Mucho»', TODO_5, 'Delegación Efectiva', 25, 25, 'left: 95%; top: 5%'],
  ];
  for (const [nombre, valores, titulo, a, b, estilo] of extremos) {
    test(`${nombre} → «${titulo}» con ${a}/25 y ${b}/25`, async ({ page }) => {
      await abrir(page);
      await verResultado(page, valores);
      await expect(perfil(page)).toHaveText(titulo);
      await expect(puntuaciones(page).nth(0)).toHaveText(`${a}/25`);
      await expect(puntuaciones(page).nth(1)).toHaveText(`${b}/25`);
      await expect(punto(page)).toHaveAttribute('style', new RegExp(estilo));
      expect((await cuadranteDelPunto(page))[0]).toContain(titulo);
    });
  }

  const fronteras: [string, number[], string, string][] = [
    ['A 18 y B 18 (alto es ≥ 18)', A18_B18, 'Delegación Efectiva', 'left: 63.5%; top: 36.5%'],
    ['A 13 y B 13 (bajo es < 14)', A13_B13, 'Retención Total', 'left: 41%; top: 59%'],
    ['A 14 y B 13', A14_B13, 'Tendencia al Control', 'left: 41%; top: 54.5%'],
    ['A 14 y B 14', A14_B14, 'Sin tendencia predominante', 'left: 45.5%; top: 54.5%'],
    ['A 13 y B 16', A13_B16, 'Tendencia a Soltar', 'left: 54.5%; top: 59%'],
    ['A 17 y B 17', A17_B17, 'Sin tendencia predominante', 'left: 59%; top: 41%'],
    ['A 18 y B 16', A18_B16, 'Tendencia al Control', 'left: 54.5%; top: 36.5%'],
    ['A 18 y B 5', A18_B5, 'Microgestión con Cariño', 'left: 5%; top: 36.5%'],
    ['A 17 y B 5', A17_B5, 'Tendencia al Control', 'left: 5%; top: 41%'],
    ['P5 = «Nada» y el resto «Mucho» (A 21, B 25)', SIN_ADAPTAR, 'Delegación Efectiva', 'left: 95%; top: 23%'],
  ];
  for (const [nombre, valores, titulo, estilo] of fronteras) {
    test(`${nombre} → «${titulo}»`, async ({ page }) => {
      await abrir(page);
      await verResultado(page, valores);
      await expect(perfil(page)).toHaveText(titulo);
      await expect(punto(page)).toHaveAttribute('style', new RegExp(estilo.replace(/\./g, '\\.')));
    });
  }
});

test.describe('Caso 3 (rechazo): sin las 10 respuestas no hay diagnóstico', () => {
  test('con 0 y con 9 respuestas el botón está deshabilitado y un clic forzado no muestra nada', async ({ page }) => {
    await abrir(page);
    await expect(botonVer(page)).toBeDisabled();
    await expect(botonVer(page)).toHaveText('Responde las 10 preguntas restantes');
    await expect(progreso(page)).toHaveText('0 de 10 respondidas');

    await responder(page, MIXTO, 9);
    await expect(progreso(page)).toHaveText('9 de 10 respondidas');
    await expect(botonVer(page)).toBeDisabled();
    await botonVer(page).dispatchEvent('click'); // un clic sintético salta el `disabled`
    await expect(perfil(page)).toHaveCount(0);
  });

  test('un doble clic en una respuesta cuenta una sola vez y no altera la suma', async ({ page }) => {
    await abrir(page);
    await responder(page, MIXTO, 9);
    await opcion(page, 9, MIXTO[9]).dblclick();
    await expect(progreso(page)).toHaveText('10 de 10 respondidas');
    await expect(page.getByRole('radio', { checked: true })).toHaveCount(10);
    await botonVer(page).click();
    await expect(puntuaciones(page).nth(1)).toHaveText('10/25'); // B = 2+3+2+1+2, la 10 sumada una vez
  });

  test('cambiar una respuesta con el diagnóstico a la vista lo retira (no queda uno viejo)', async ({ page }) => {
    await abrir(page);
    await verResultado(page, MIXTO);
    await opcion(page, 0, 1).click();
    await expect(perfil(page)).toHaveCount(0);
    await expect(progreso(page)).toHaveText('10 de 10 respondidas');
    await botonVer(page).click();
    // A = 1+4+5+4+3 = 17, B = 10 → zona media en A, A > B: Tendencia al Control
    await expect(perfil(page)).toHaveText('Tendencia al Control');
    await expect(puntuaciones(page).nth(0)).toHaveText('17/25');
  });

  test('«Repetir diagnóstico» vuelve a 0 respuestas', async ({ page }) => {
    await abrir(page);
    await verResultado(page, MIXTO);
    await page.getByRole('button', { name: 'Repetir diagnóstico' }).click();
    await expect(progreso(page)).toHaveText('0 de 10 respondidas');
    await expect(page.getByRole('radio', { checked: true })).toHaveCount(0);
    await expect(perfil(page)).toHaveCount(0);
  });
});

test.describe('Teclado', () => {
  test('con Tab y Enter se contestan las diez y se pide el diagnóstico', async ({ page }) => {
    await abrir(page);
    await opcion(page, 0, 1).focus();
    for (let i = 0; i < 10; i++) {
      const v = MIXTO[i];
      for (let k = 1; k < v; k++) await page.keyboard.press('Tab');
      await expect(opcion(page, i, v)).toBeFocused();
      await page.keyboard.press('Enter');
      // hasta la primera opción de la pregunta siguiente (o, tras la última, el botón)
      for (let k = v; k <= 5; k++) await page.keyboard.press('Tab');
    }
    await expect(botonVer(page)).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(perfil(page)).toHaveText('Microgestión con Cariño');
  });
});

test.describe('Móvil 390 px con toque', () => {
  test.use({
    viewport: { width: 390, height: 844 },
    userAgent:
      'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Mobile Safari/537.36',
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  });

  test('con toques se completa el test, nada desborda y el diagnóstico queda a la vista', async ({ page }) => {
    await abrir(page);
    for (let i = 0; i < 10; i++) await opcion(page, i, MIXTO[i]).tap();
    const caja = await opcion(page, 0, 1).boundingBox();
    expect(caja!.width, 'ancho de la opción').toBeGreaterThanOrEqual(44);
    await botonVer(page).tap();
    await expect(perfil(page)).toHaveText('Microgestión con Cariño');
    await expect
      .poll(
        async () => {
          const antes = await page.evaluate(() => window.scrollY);
          await page.waitForTimeout(300);
          return antes === (await page.evaluate(() => window.scrollY));
        },
        { timeout: 5000 },
      )
      .toBe(true);
    const titulo = await page.getByRole('heading', { name: 'Tu diagnóstico' }).boundingBox();
    expect(titulo!.y).toBeGreaterThanOrEqual(0);
    expect(titulo!.y + titulo!.height).toBeLessThanOrEqual(844);
    const anchos = await page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]);
    expect(anchos[0]).toBeLessThanOrEqual(anchos[1]);
  });
});

test.describe('JSON-LD', () => {
  test('WebApplication con al menos 4 features y FAQPage con 5 preguntas', async ({ page }) => {
    await abrir(page);
    const bloques = (await page.locator('script[type="application/ld+json"]').allTextContents()).map(
      (t) => JSON.parse(t) as Record<string, unknown>,
    );
    const app = bloques.find((b) => b['@type'] === 'WebApplication');
    const faq = bloques.find((b) => b['@type'] === 'FAQPage') as { mainEntity?: unknown[] } | undefined;
    expect(app).toBeTruthy();
    const features = (app?.featureList ?? app?.features ?? []) as unknown;
    const lista = Array.isArray(features) ? features : String(features).split(/,\s*/);
    expect(lista.length).toBeGreaterThanOrEqual(4);
    expect(faq?.mainEntity?.length).toBe(5);
  });
});

/* ─────────────────────── Hallazgos abiertos (inspector 15/11/2026) ─────────────────────── */

test.describe('Hallazgos de cálculo y operativa', () => {
  // HALLAZGO (15/11/2026, ABIERTO) · el mapa pinta los cuatro cuadrantes partidos al 50 % (grid
  // 1fr 1fr, que equivale a 15 puntos), pero los perfiles se deciden con 14 y 18 (45,5 % y 63,5 %).
  // En la zona media el punto cae dentro de un cuadrante rotulado con OTRO perfil: medido, A 18 /
  // B 16 «Tendencia al Control» y A 17 / B 17 «Sin tendencia predominante» (cuyo texto dice «el test
  // no te sitúa en ningún cuadrante») dentro de «🎯 Delegación Efectiva»; A 14 / B 13 y A 14 / B 14
  // dentro de «🔒 Retención Total». Por cuenta de combinaciones (5^10), el 47,7 % de las respuestas
  // posibles deja el punto en un cuadrante con otro nombre; el 14,4 %, en «Delegación Efectiva».
  test('en la zona media el punto no cae en un cuadrante rotulado con otro perfil', async ({ page }) => {
    test.fail();
    const casos: [number[], string][] = [
      [A18_B16, 'Tendencia al Control'],
      [A17_B17, 'Sin tendencia predominante'],
      [A14_B13, 'Tendencia al Control'],
      [A14_B14, 'Sin tendencia predominante'],
    ];
    for (const [valores, titulo] of casos) {
      await abrir(page);
      await verResultado(page, valores);
      await expect(perfil(page)).toHaveText(titulo);
      const ajenos = (await cuadranteDelPunto(page)).filter((r) => !r.includes(titulo));
      expect(ajenos, `${titulo} (${valores.join(',')})`).toEqual([]);
    }
  });
});

test.describe('Hallazgos de accesibilidad', () => {
  // HALLAZGO (15/11/2026, ABIERTO) · el botón deshabilitado dice «Responde las 10 preguntas
  // restantes» pero su aria-label fijo es «Ver mi diagnóstico»: el lector anuncia «Ver mi
  // diagnóstico, no disponible» sin decir cuántas faltan (y el nombre no contiene el texto visible).
  test('el nombre accesible del botón deshabilitado dice cuántas preguntas faltan', async ({ page }) => {
    test.fail();
    await abrir(page);
    await expect(botonVer(page)).toHaveAccessibleName(/10 preguntas/);
  });

  // HALLAZGO (15/11/2026, ABIERTO) · «Repetir diagnóstico» desmonta su propia sección y el foco cae a
  // <body>: quien va con teclado vuelve al principio del documento sin aviso.
  test('tras «Repetir diagnóstico» con teclado el foco no se pierde en <body>', async ({ page }) => {
    test.fail();
    await abrir(page);
    await verResultado(page, MIXTO);
    await page.getByRole('button', { name: 'Repetir diagnóstico' }).focus();
    await page.keyboard.press('Enter');
    await expect(perfil(page)).toHaveCount(0);
    expect(await page.evaluate(() => document.activeElement === document.body)).toBe(false);
  });

  // HALLAZGO (15/11/2026, ABIERTO) · las opciones son role="radio" dentro de role="radiogroup", pero
  // no responden a las flechas y cada una es una parada de Tab (50 en el test): el patrón de grupo
  // de radio que anuncian no se cumple.
  test('la flecha derecha mueve a la opción siguiente dentro del grupo', async ({ page }) => {
    test.fail();
    await abrir(page);
    await opcion(page, 0, 1).focus();
    await page.keyboard.press('ArrowRight');
    await expect(opcion(page, 0, 2)).toBeFocused();
  });

  // HALLAZGO (15/11/2026, ABIERTO) · el emoji grande del perfil (🔍, 🎯…) va en su propio <span> sin
  // aria-hidden junto al <h3>, y el lector lo lee antes del nombre del perfil.
  test('el emoji del perfil va oculto al lector de pantalla', async ({ page }) => {
    test.fail();
    await abrir(page);
    await verResultado(page, MIXTO);
    const oculto = await page
      .locator('[class*="_profileEmoji"]')
      .evaluate((el) => !!el.closest('[aria-hidden="true"]') || !!el.querySelector('[aria-hidden="true"]'));
    expect(oculto).toBe(true);
  });

  // HALLAZGO (15/11/2026, ABIERTO, el mismo) · el aria-label del punto («Tu posición: …») va en un
  // <div> sin rol: el árbol de accesibilidad no lo expone y el mapa se lee «Microgestión con Cariño
  // Delegación Efectiva Retención Total Soltar y Rezar Tú», sin decir dónde está «Tú».
  test('el mapa expone al lector la posición del punto', async ({ page }) => {
    test.fail();
    await abrir(page);
    await verResultado(page, MIXTO);
    expect(await page.locator('[class*="_mapContainer"]').ariaSnapshot()).toContain('Tu posición');
  });

  for (const tema of ['light', 'dark'] as const) {
    // HALLAZGO (15/11/2026, ABIERTO, solo en claro) · rótulos del cuadrante a 12 px y peso 400
    // (10,4 px en móvil): exigen 4,5:1. Medido: «Delegación Efectiva» 4,45:1 en claro.
    test(`tema ${tema}: los cuatro rótulos del cuadrante cumplen 4,5:1`, async ({ page }) => {
      test.fail(tema === 'light', 'Delegación Efectiva queda a 4,45:1 en claro');
      await page.addInitScript((t) => window.localStorage.setItem('meskeia-theme', t), tema);
      await abrir(page);
      await expect(page.locator('html')).toHaveAttribute('data-theme', tema);
      await verResultado(page, MIXTO);
      const mod = await selectorDelModulo(punto(page), 'mapDot');
      const cuadrantes = page.locator(`${mod}[class*="_quadrant"]`);
      await expect(cuadrantes).toHaveCount(4);
      for (let i = 0; i < 4; i++) {
        const c = cuadrantes.nth(i);
        await expect
          .poll(() => contrasteSobreFondoReal(c), { timeout: 3000, message: (await c.textContent()) ?? '' })
          .toBeGreaterThanOrEqual(4.5);
      }
    });
  }
});

test.describe('Hallazgos de contenido', () => {
  // HALLAZGO (15/11/2026, ABIERTO) · §1.quinquies 3: la entradilla, fuera de la guía, dice «Hersey y
  // Blanchard demostraron que no existe un estilo de delegación "correcto" universal», y la guía de
  // la misma página dice «El modelo es influyente pero discutido — su validez empírica se ha
  // cuestionado».
  test('la entradilla no dice que Hersey y Blanchard «demostraron» su modelo', async ({ page }) => {
    test.fail();
    await abrir(page);
    await expect(page.getByText(/Hersey y Blanchard demostraron/)).toHaveCount(0);
  });

  // HALLAZGO (15/11/2026, ABIERTO) · con una pregunta pendiente el botón dice «Responde las 1
  // preguntas restantes».
  test('con 9 respuestas el botón concuerda en singular', async ({ page }) => {
    test.fail();
    await abrir(page);
    await responder(page, MIXTO, 9);
    await expect(botonVer(page)).not.toHaveText('Responde las 1 preguntas restantes');
  });

  // HALLAZGO (15/11/2026, ABIERTO) · §1.quinquies 2: la entradilla abre el test a «autónomos que
  // subcontratan, o cualquiera que reparta tareas en un grupo (incluso familiar o de voluntariado)»,
  // pero las acciones dan por hecho un equipo jerárquico con varios niveles de experiencia.
  test('las acciones no dan por hecho un equipo con juniors y seniors', async ({ page }) => {
    test.fail();
    await abrir(page);
    await verResultado(page, TODO_5);
    await expect(acciones(page).filter({ hasText: 'Clasificar a tu equipo en 3 niveles de madurez' })).toHaveCount(0);
    await abrir(page);
    await verResultado(page, A18_B16);
    await expect(acciones(page).filter({ hasText: '2-3 personas más experimentadas del equipo' })).toHaveCount(0);
  });

  // HALLAZGO (15/11/2026, ABIERTO) · con la autonomía en el mínimo (5/25, «Nada» en las cinco) y el
  // acompañamiento en 17, el perfil «Tendencia al Control» dice «No es microgestión extrema»; con un
  // punto más de acompañamiento (18) la misma autonomía da «Microgestión con Cariño».
  test('con la autonomía a 5/25 el texto no dice «No es microgestión extrema»', async ({ page }) => {
    test.fail();
    await abrir(page);
    await verResultado(page, A17_B5);
    await expect(puntuaciones(page).nth(1)).toHaveText('5/25');
    await expect(descripcion(page)).not.toContainText('No es microgestión extrema');
  });

  // HALLAZGO (15/11/2026, ABIERTO) · «Delegación Efectiva» dice «Hersey y Blanchard lo llamarían un
  // estilo adaptativo maduro: sabes cuándo estar cerca y cuándo soltar» aunque se conteste «Nada» a
  // la única afirmación que mide la adaptación (P5); y la guía llama a usar siempre el mismo estilo
  // «El error más común».
  test('quien contesta «Nada» a «Adapto mi nivel de supervisión…» no recibe «sabes cuándo estar cerca y cuándo soltar»', async ({ page }) => {
    test.fail();
    await abrir(page);
    await verResultado(page, SIN_ADAPTAR);
    await expect(perfil(page)).toHaveText('Delegación Efectiva');
    await expect(descripcion(page)).not.toContainText('sabes cuándo estar cerca y cuándo soltar');
  });

  // HALLAZGO (15/11/2026, ABIERTO) · el FAQPage llama «entrenar» al estilo S2 que la guía llama
  // «Guiar», y dice que el test es para «cualquier persona que tenga personas a su cargo» cuando la
  // página lo abre a autónomos que subcontratan y a grupos familiares o de voluntariado.
  test('el FAQPage nombra los estilos y el público como la página', async ({ page }) => {
    test.fail();
    await abrir(page);
    const faq = (await page.locator('script[type="application/ld+json"]').allTextContents())
      .map((t) => JSON.parse(t) as { '@type'?: string; mainEntity?: { acceptedAnswer: { text: string } }[] })
      .find((b) => b['@type'] === 'FAQPage');
    const respuestas = (faq?.mainEntity ?? []).map((q) => q.acceptedAnswer.text);
    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
    // El nombre que la guía da al S2 (hoy «Guiar»), leído de su <strong>
    const s2 = ((await page.locator('strong', { hasText: /^S2 — / }).first().textContent()) ?? '')
      .replace(/^S2 — /, '')
      .trim();
    expect(s2.length).toBeGreaterThan(0);
    expect(respuestas[0].toLowerCase()).toContain(s2.toLowerCase());
    expect(respuestas[2]).not.toContain('que tenga personas a su cargo');
  });
});
