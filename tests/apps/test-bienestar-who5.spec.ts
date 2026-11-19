import { test, expect, devices, type Page, type Locator } from '@playwright/test';

/**
 * Inspector — test-bienestar-who5 (segmento interactiva, riesgo 2, primera inspección)
 *
 * Primera inspección: 19/11/2026. La app promete en su <h1> «Test de Bienestar WHO-5» y en su
 * subtítulo «Escala de bienestar subjetivo de la OMS — 5 preguntas sobre cómo te has sentido en las
 * últimas 2 semanas». Todo vive inline en `app/test-bienestar-who5/page.tsx` (no importa nada de
 * `data/fiscal` ni de `lib/calculadoras`).
 *
 * LA FUENTE: OMS, «The World Health Organization-Five Well-Being Index (WHO-5)», WHO/UCN/MSD/MHE/2024.1
 * (www.who.int/publications/m/item/WHO-UCN-MSD-MHE-2024.01, PDF inglés leído el 19/11/2026):
 *   · 5 afirmaciones sobre «the last two weeks»; opciones All of the time 5 · Most of the time 4 ·
 *     More than half of the time 3 · Less than half of the time 2 · Some of the time 1 · At no time 0.
 *   · «The raw score ranges from zero to 25 … To get a percentage score ranging from zero to 100, the
 *     raw score is multiplied by four.»
 *   · Único corte: «A percentage score below 50 (or a raw score below 13) has been suggested as a
 *     cut-off for poor mental well-being and as an indication for further assessment for the possible
 *     presence of a mental health condition (e.g., depressive disorder).» No hay corte en 28 ni en 72.
 *   La app añade cuatro niveles propios: ≥ 72 alto · ≥ 52 moderado · ≥ 28 bajo · < 28 muy bajo. Como
 *   la puntuación va de 4 en 4, «< 52» es lo mismo que «< 50» de la OMS (48 es el último por debajo).
 *
 * LOS TRES CASOS, RESUELTOS A MANO ANTES DE ABRIR EL NAVEGADOR
 *   CASO 1 (normal)  → 4, 3, 3, 2, 4 = 16 × 4 = 64 → ≥ 52 y < 72 → «moderado»; 64 ≥ 50 (OMS).
 *   CASO 2 (límite)  → todo 0 = 0 → «muy bajo» · todo 5 = 25 × 4 = 100 → «alto»
 *                      corte de la OMS: 3,3,3,3,0 = 12 → 48 (< 50, bajo bienestar) → «bajo»
 *                                       3,3,3,3,1 = 13 → 52 (≥ 50)                 → «moderado»
 *                      cortes propios: 2,2,1,1,1 = 7 → 28 «bajo» · 2,1,1,1,1 = 6 → 24 «muy bajo»
 *                                      4,4,3,3,3 = 17 → 68 «moderado» · 4,4,4,3,3 = 18 → 72 «alto»
 *   CASO 3 (rechazo) → 4 de 5 respondidas (falta la 3): sin resultado; «Ver resultado» deshabilitado.
 *
 * Los test con test.fail() son HALLAZGOS ABIERTOS: el día que se reparen, fallarán por pasar y habrá
 * que quitarles el test.fail() (y cambiar ABIERTO por REPARADO).
 */

const RUTA = '/test-bienestar-who5/';

/** Carga la app y espera a que las opciones tengan React enganchado (un clic antes se pierde). */
async function cargar(page: Page): Promise<void> {
  await page.goto(RUTA);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Test de Bienestar WHO-5');
  await page.waitForFunction(() => {
    const b = Array.from(document.querySelectorAll('button')).find((x) =>
      /Todo el tiempo/.test(x.textContent ?? ''),
    );
    return Boolean(b && Object.keys(b).some((k) => k.startsWith('__reactProps$')));
  });
}

/** La tarjeta de la pregunta n (1-5), por su número y no por su redacción. */
function tarjeta(page: Page, n: number): Locator {
  return page.locator('p', { hasText: new RegExp(`^\\s*${n}\\.`) }).locator('xpath=..');
}

/** La opción de valor v (0-5) de la pregunta n: su nombre accesible empieza por la cifra. */
function opcion(page: Page, n: number, v: number): Locator {
  return tarjeta(page, n).getByRole('button', { name: new RegExp(`^${v}\\D`) });
}

/** Marca valores[i] en la pregunta i + 1; null la deja en blanco. */
async function responder(page: Page, valores: (number | null)[], tocar = false): Promise<void> {
  for (let i = 0; i < valores.length; i++) {
    const v = valores[i];
    if (v === null) continue;
    const boton = opcion(page, i + 1, v);
    if (tocar) await boton.tap();
    else await boton.click();
    await expect(boton).toHaveAttribute('aria-pressed', 'true');
  }
}

const botonResultado = (page: Page): Locator => page.getByRole('button', { name: 'Ver resultado' });
/** La cifra del resultado («64%» hoy; «64 %» con el espacio duro de la regla del 25/09/2026). */
const cifra = (page: Page): Locator => page.getByText(/^\d{1,3}\s?%$/);
/** La cabecera del resultado (lleva el nivel en data-nivel) y la sección que la contiene. */
const cabecera = (page: Page): Locator => page.locator('[data-nivel]').first();

type Pregunta = { name: string; acceptedAnswer: { text: string } };

async function bloquesJsonLd(page: Page): Promise<Record<string, unknown>[]> {
  const textos = await page.locator('script[type="application/ld+json"]').allTextContents();
  return textos.map((t) => JSON.parse(t) as Record<string, unknown>);
}

async function faqJsonLd(page: Page): Promise<Pregunta[]> {
  for (const b of await bloquesJsonLd(page)) {
    if (b['@type'] === 'FAQPage') return b.mainEntity as Pregunta[];
  }
  throw new Error('La página no lleva FAQPage en su JSON-LD');
}

const normalizar = (t: string): string => t.replace(/\s+/g, ' ').trim();

test.describe('WHO-5 — la puntuación y su nivel', () => {
  test.beforeEach(async ({ page }) => {
    await cargar(page);
  });

  test('CASO 1 (normal) · 4,3,3,2,4 = 16 × 4 = 64 → «moderado»', async ({ page }) => {
    await responder(page, [4, 3, 3, 2, 4]);
    await botonResultado(page).click();
    await expect(cifra(page)).toHaveText(/^64\s?%$/);
    await expect(cabecera(page)).toContainText(/Tu bienestar es moderado/);
    // La barra mide la puntuación sobre 100
    const ancho = await page
      .locator('[data-nivel]')
      .nth(1)
      .evaluate((e) => (e as HTMLElement).style.width);
    expect(ancho).toBe('64%');
    // No se presenta como diagnóstico: el aviso va junto al resultado, fuera de la guía
    await expect(page.getByText('Este test NO es un diagnóstico')).toBeVisible();
  });

  const LIMITES: { nombre: string; valores: number[]; pct: number; nivel: RegExp }[] = [
    { nombre: 'todo «En ningún momento» = 0 (mínimo)', valores: [0, 0, 0, 0, 0], pct: 0, nivel: /Tu bienestar es muy bajo/ },
    { nombre: '3,3,3,3,0 = 12 → 48 (OMS: bruta < 13, bajo bienestar)', valores: [3, 3, 3, 3, 0], pct: 48, nivel: /Tu bienestar es bajo/ },
    { nombre: '3,3,3,3,1 = 13 → 52 (OMS: por encima del corte de 50)', valores: [3, 3, 3, 3, 1], pct: 52, nivel: /Tu bienestar es moderado/ },
    { nombre: '2,2,1,1,1 = 7 → 28 (corte propio de la app: ≥ 28 bajo)', valores: [2, 2, 1, 1, 1], pct: 28, nivel: /Tu bienestar es bajo/ },
    { nombre: '2,1,1,1,1 = 6 → 24 (< 28 muy bajo)', valores: [2, 1, 1, 1, 1], pct: 24, nivel: /Tu bienestar es muy bajo/ },
    { nombre: '4,4,3,3,3 = 17 → 68 (< 72 moderado)', valores: [4, 4, 3, 3, 3], pct: 68, nivel: /Tu bienestar es moderado/ },
    { nombre: '4,4,4,3,3 = 18 → 72 (corte propio de la app: ≥ 72 alto)', valores: [4, 4, 4, 3, 3], pct: 72, nivel: /Tu bienestar subjetivo es alto/ },
    { nombre: 'todo «Todo el tiempo» = 25 → 100 (máximo)', valores: [5, 5, 5, 5, 5], pct: 100, nivel: /Tu bienestar subjetivo es alto/ },
  ];

  for (const c of LIMITES) {
    test(`CASO 2 (límite) · ${c.nombre}`, async ({ page }) => {
      expect(c.valores.reduce((a, b) => a + b, 0) * 4, 'la puntuación del caso').toBe(c.pct);
      await responder(page, c.valores);
      await botonResultado(page).click();
      await expect(cifra(page)).toHaveText(new RegExp(`^${c.pct}\\s?%$`));
      await expect(cabecera(page)).toContainText(c.nivel);
    });
  }

  test('CASO 2 (límite) · con 0 puntos las recomendaciones dan el 024 y dicen que no es un diagnóstico', async ({ page }) => {
    await responder(page, [0, 0, 0, 0, 0]);
    await botonResultado(page).click();
    const lista = page.getByRole('heading', { name: 'Recomendaciones' }).locator('xpath=..');
    await expect(lista).toContainText('024');
    await expect(lista).toContainText('Un resultado bajo no es un diagnóstico');
  });

  test('CASO 3 (rechazo) · con 4 de 5 respondidas no hay resultado', async ({ page }) => {
    await responder(page, [4, 3, null, 2, 4]);
    await expect(botonResultado(page)).toBeDisabled();
    await botonResultado(page).click({ force: true }).catch(() => undefined);
    await page.waitForTimeout(300);
    await expect(page.locator('[data-nivel]')).toHaveCount(0);
  });

  test('«Repetir test» vuelve al cuestionario en blanco', async ({ page }) => {
    await responder(page, [4, 3, 3, 2, 4]);
    await botonResultado(page).click();
    await expect(cifra(page)).toBeVisible();
    await page.getByRole('button', { name: 'Repetir test' }).click();
    await expect(page.locator('[data-nivel]')).toHaveCount(0);
    await expect(page.locator('button[aria-pressed="true"]')).toHaveCount(0);
    await expect(botonResultado(page)).toBeDisabled();
  });

  test('un doble clic en «Ver resultado» en escritorio deja el resultado en pantalla', async ({ page }) => {
    // Hoy el 2.º clic cae en un hueco del contenedor (medido: un DIV sin acción). El día que la
    // vista suba al resultado, lo que quede bajo el puntero cambia: este caso lo vigila.
    await responder(page, [4, 3, 3, 2, 4]);
    await botonResultado(page).dblclick();
    await page.waitForTimeout(500);
    expect(new URL(page.url()).pathname).toBe(RUTA);
    await expect(cifra(page)).toHaveText(/^64\s?%$/);
  });

  test('el aviso médico se ve al entrar, desplegado y fuera de la guía plegada', async ({ page }) => {
    const aviso = page.getByRole('note').filter({ hasText: 'no constituye diagnóstico médico' });
    await expect(aviso).toBeVisible();
    expect(await aviso.evaluate((e) => Boolean(e.closest('[data-guia-educativa]')))).toBe(false);
  });

  test('HALLAZGO · al pulsar «Ver resultado» la cifra queda a la vista', async ({ page }) => {
    // ABIERTO: el resultado (más corto que el cuestionario) se monta donde estaba el cuestionario y
    // la vista se queda en el mismo scroll: medido a 1280 × 720, la cifra queda 675 px POR ENCIMA de
    // la ventana y lo que se ve es el borde de «Repetir test», la guía y las relacionadas.
    test.fail();
    await responder(page, [4, 3, 3, 2, 4]);
    await botonResultado(page).scrollIntoViewIfNeeded();
    await botonResultado(page).click();
    await expect(cifra(page)).toBeInViewport();
  });

  test('HALLAZGO · al cambiar de fase el foco no cae a <body>', async ({ page }) => {
    // ABIERTO: «Ver resultado» se desmonta con el foco dentro y document.activeElement queda en
    // BODY; nada anuncia la cifra. Igual con «Repetir test» (y la vista se queda a media encuesta).
    test.fail();
    await responder(page, [4, 3, 3, 2, 4]);
    await botonResultado(page).click();
    await expect(cifra(page)).toBeVisible();
    await page.waitForTimeout(300);
    const dentro = await cabecera(page).evaluate((h) => {
      const seccion = h.parentElement;
      return Boolean(seccion && document.activeElement && seccion.contains(document.activeElement));
    });
    expect(dentro, 'el foco está en la sección del resultado').toBe(true);
    await page.getByRole('button', { name: 'Repetir test' }).click();
    await page.waitForTimeout(300);
    const tag = await page.evaluate(() => document.activeElement?.tagName ?? 'NADA');
    expect(tag, 'tras repetir, el foco no cae a <body>').not.toBe('BODY');
  });

  test('HALLAZGO · con una pregunta sin contestar la app dice cuál falta', async ({ page }) => {
    // ABIERTO: con 4 de 5, «Ver resultado» está deshabilitado (fuera del orden de tabulación) y no
    // hay ningún texto que diga qué falta ni región viva que lo anuncie.
    test.fail();
    await responder(page, [4, 3, null, 2, 4]);
    await botonResultado(page).click({ force: true }).catch(() => undefined);
    await expect(
      page.getByText(/falta|pendiente|responde/i).filter({ visible: true }).first(),
    ).toBeVisible({ timeout: 2000 });
  });

  test('HALLAZGO · el recuadro fijo del 024 no lleva role="alert"', async ({ page }) => {
    // ABIERTO: el aviso permanente «Si estás pasando por un momento difícil: 024 …» lleva
    // role="alert" desde la carga; es contenido estático (mismo criterio que DisclaimerCard,
    // cabo C0117: role="note", un alert presente al cargar lo leen unos lectores y otros no).
    test.fail();
    await expect(page.locator('[role="alert"]', { hasText: '024' })).toHaveCount(0);
  });

  test('HALLAZGO · la cifra lleva espacio duro antes del % (64 %)', async ({ page }) => {
    // ABIERTO: sale «64%» (regla de formato del 25/09/2026: «15 %» con U+00A0).
    test.fail();
    await responder(page, [4, 3, 3, 2, 4]);
    await botonResultado(page).click();
    await expect(cifra(page)).toHaveText('64 %');
  });

  test('HALLAZGO · el FAQPage no da cortes distintos de la página ni etiqueta «probable depresión»', async ({ page }) => {
    // ABIERTO: «¿Cómo se interpreta…?» dice «76-100 … buen bienestar; 51-75, bienestar moderado;
    // 26-50, malestar significativo; y 0-25, probable depresión», y «¿Qué es…?» «por debajo de 28
    // sugiere depresión probable». La página da 72 como «alto» (4,4,4,3,3 = 18 → 72, arriba) y la OMS
    // solo da un corte (< 50: bajo bienestar e indicación de valoración adicional), sin «probable
    // depresión». La FAQ visible dice además «¿Un resultado bajo significa que tengo depresión? No.»
    test.fail();
    const faq = await faqJsonLd(page);
    const todo = faq.map((q) => q.acceptedAnswer.text).join(' ');
    expect(todo).not.toMatch(/probable depresi[oó]n|depresi[oó]n probable/i);
    const interpreta = faq.find((q) => /interpreta/i.test(q.name));
    expect(interpreta, 'la pregunta de la interpretación').toBeDefined();
    expect(interpreta!.acceptedAnswer.text).not.toContain('51-75');
    expect(interpreta!.acceptedAnswer.text).not.toContain('76-100');
  });

  test('HALLAZGO · la frecuencia tiene UNA respuesta en la FAQ visible y en el FAQPage', async ({ page }) => {
    // ABIERTO: visible «Puedes repetirlo cada 2-4 semanas»; FAQPage «La OMS recomienda aplicarlo con
    // una periodicidad mínima de dos semanas … cada 4-6 semanas». La publicación de la OMS solo dice
    // que las afirmaciones se refieren a las dos últimas semanas.
    test.fail();
    const visible = normalizar(
      (await page
        .locator('details')
        .filter({ has: page.locator('summary', { hasText: /frecuencia/i }) })
        .locator('p')
        .textContent()) ?? '',
    );
    const enFaq = (await faqJsonLd(page)).find((q) => /frecuencia/i.test(q.name));
    expect(enFaq, 'la pregunta de la frecuencia en el FAQPage').toBeDefined();
    expect(enFaq!.acceptedAnswer.text).not.toContain('La OMS recomienda');
    expect(normalizar(enFaq!.acceptedAnswer.text)).toBe(visible);
  });

  test('HALLAZGO · lo que se dice del instrumento casa con la publicación de la OMS', async ({ page }) => {
    // ABIERTO: la guía dice «desarrollado por la OMS en 1998» y «validada en más de 30 idiomas»; el
    // FAQPage, «en más de 30 países». La OMS: «developed during the 1990s by the late Per Bech of the
    // Psychiatric Centre North Zealand … derived from other scales and studies by the WHO Regional
    // Office in Europe» y «translated into over 30 languages».
    test.fail();
    const guia = (await page.locator('[data-guia-educativa]').textContent()) ?? '';
    expect(guia).not.toContain('desarrollado por la OMS en 1998');
    const todo = (await faqJsonLd(page)).map((q) => q.acceptedAnswer.text).join(' ');
    expect(todo).not.toContain('más de 30 países');
  });

  test('HALLAZGO · features del JSON-LD con al menos 4 características (CLAUDE.md §1.ter)', async ({ page }) => {
    // ABIERTO: el WebApplication no lleva features ni featureList.
    test.fail();
    const app = (await bloquesJsonLd(page)).find((b) => b['@type'] === 'WebApplication');
    const lista = (app?.featureList ?? app?.features ?? []) as string[];
    expect(lista.length).toBeGreaterThanOrEqual(4);
  });

  test('HALLAZGO · el aviso es el de nivel crítico si la app se presenta como cribado', async ({ page }) => {
    // ABIERTO: la app dice «El WHO-5 es una herramienta de cribado» y la política de disclaimers pone
    // en Nivel 1 (critical) la suite salud cuando trata «Diagnóstico o screening de condiciones de
    // salud»; la app monta severity="high". Si se decide dejar de presentarla como cribado, este caso
    // cambia por el que compruebe ese texto.
    test.fail();
    await expect(page.getByRole('note', { name: 'Aviso importante' })).toHaveCount(1);
  });
});

test.describe('WHO-5 en móvil (Pixel 7)', () => {
  test.use({
    viewport: devices['Pixel 7'].viewport,
    userAgent: devices['Pixel 7'].userAgent,
    deviceScaleFactor: devices['Pixel 7'].deviceScaleFactor,
    isMobile: true,
    hasTouch: true,
  });

  test.beforeEach(async ({ page }) => {
    // Un toque que saque de la app no debe depender de la red: se sirve una página vacía
    await page.route(/^https?:\/\/(?!localhost[:/])/, (r) =>
      r.fulfill({ status: 200, contentType: 'text/html', body: '<p>fuera de la app</p>' }),
    );
    await cargar(page);
  });

  test('CASO 1 en móvil · a toques, 4,3,3,2,4 = 64 → «moderado», sin desborde horizontal', async ({ page }) => {
    await responder(page, [4, 3, 3, 2, 4], true);
    await botonResultado(page).tap();
    await expect(cifra(page)).toHaveText(/^64\s?%$/);
    await expect(cabecera(page)).toContainText(/Tu bienestar es moderado/);
    const desborde = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(desborde).toBeLessThanOrEqual(0);
  });

  test('HALLAZGO · tras tocar «Ver resultado» la cifra queda a la vista', async ({ page }) => {
    // ABIERTO: medido a 412 × 839, la cifra queda 1.016 px por encima de la ventana; en pantalla
    // quedan «Ver guía educativa», las relacionadas y «Nuestras webs temáticas».
    test.fail();
    await responder(page, [4, 3, 3, 2, 4], true);
    await botonResultado(page).scrollIntoViewIfNeeded();
    await botonResultado(page).tap();
    await expect(cifra(page)).toBeInViewport();
  });

  test('HALLAZGO · dos toques seguidos en «Ver resultado» no sacan de la app', async ({ page }) => {
    // ABIERTO: sin useGuardaRafaga, el 2.º toque cae sobre lo que hay bajo el dedo en la pantalla
    // nueva: el bloque «Nuestras webs temáticas», y el ajuste de toque de Chrome lo lleva al enlace
    // de Coquinum. Medido 3 de 3: https://coquinum.com/?from=meskeia, y el resultado se pierde.
    test.fail();
    await responder(page, [4, 3, 3, 2, 4], true);
    const boton = botonResultado(page);
    await boton.scrollIntoViewIfNeeded();
    const caja = await boton.boundingBox();
    expect(caja, 'la caja del botón').not.toBeNull();
    const x = caja!.x + caja!.width / 2;
    const y = caja!.y + caja!.height / 2;
    await page.touchscreen.tap(x, y);
    await page.waitForTimeout(120);
    await page.touchscreen.tap(x, y);
    await page.waitForTimeout(1000);
    expect(page.url(), 'sigue en la app').toContain(RUTA);
    await expect(cifra(page)).toHaveText(/^64\s?%$/);
  });
});
