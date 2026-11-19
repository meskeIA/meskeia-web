import { test, expect, type Page, type Locator } from '@playwright/test';

/**
 * Los casos son independientes (cada uno carga la página y contesta desde cero, sin estado a nivel
 * de fichero ni sessionStorage: la app solo guarda en useState), así que se reparten entre workers.
 */
test.describe.configure({ mode: 'parallel' });

/**
 * Inspector — test-tolerancia-riesgo-detallado (segmento interactiva, riesgo 2, primera inspección)
 *
 * Primera inspección: 18/11/2026. Todo vive inline en `app/test-tolerancia-riesgo-detallado/page.tsx`:
 * no importa nada de `data/fiscal` ni de `lib/calculadoras`, y no cita ningún marco normativo (ni
 * MiFID II ni el test de idoneidad), así que el esperado sale de su propia tabla.
 *
 * LA ARITMÉTICA (resuelta a mano ANTES de abrir el navegador)
 *   20 preguntas (`PREGUNTAS`), 4 opciones cada una y SIEMPRE en el mismo orden: la opción i (0-3)
 *   vale i + 1 puntos, y el `value` del radio es ese valor. Puntuación = suma → mínimo 20, máximo 80.
 *   Cortes (`UMBRAL_PERFILES` = [32, 44, 56, 68], cerrados por arriba en `obtenerPerfil`):
 *     20–32 Conservador (85/15) · 33–44 Moderado-Conservador (65/35) · 45–56 Moderado (40/60)
 *     57–68 Moderado-Agresivo (20/80) · 69–80 Agresivo (5/95)            [RF/RV de `PERFILES`]
 *   Contiguos, disjuntos y cubren 20..80. Cada reparto RF + RV suma 100.
 *   Dimensiones: 4 preguntas cada una (1-4 Horizonte, 5-8 Capacidad, 9-12 Reacción, 13-16
 *   Conocimiento, 17-20 Objetivos) → suma sobre 16; nivel por `nivelDimension(pct)`:
 *   pct < 40 Bajo · < 70 Medio · resto Alto. Con 4-16 puntos: 4-6 Bajo, 7-11 Medio, 12-16 Alto.
 *   La barra mide suma/16 (por eso su mínimo es 25 %).
 *
 * LOS CASOS
 *   normal  → 4,2,3,3 · 3,3,2,3 · 3,3,2,2 · 2,2,1,1 · 3,2,2,3 = 12 + 11 + 10 + 6 + 10 = 49 → Moderado,
 *             40/60; Horizonte Alto (12/16), Capacidad Medio (11/16), Reacción Medio (10/16),
 *             Conocimiento Bajo (6/16), Objetivos Medio (10/16); barras 75 / 68,75 / 62,5 / 37,5 / 62,5 %.
 *   límite  → todo 1 = 20 (Conservador, 85/15, cinco «Bajo (4/16)») · todo 4 = 80 (Agresivo, 5/95,
 *             cinco «Alto (16/16)») · los cuatro cortes: 32/33, 44/45, 56/57 y 68/69.
 *   rechazo → 19 de 20 (falta la 20): no hay resultado · 0 de 20: «Faltan 20 preguntas…» · doble
 *             clic en «Comenzar el test» no marca ninguna respuesta. El doble clic en «Ver mi perfil»
 *             SÍ rompe: es un hallazgo (abajo).
 *
 * HALLAZGOS: cada uno con `test.fail()` —afirma lo que debería pasar y falla a propósito mientras el
 * defecto siga—. Al repararlo se quita esa línea y queda como regresión.
 */

const RUTA = '/test-tolerancia-riesgo-detallado/';

const rep = (v: number, n: number): number[] => Array<number>(n).fill(v);

const perfilNombre = (page: Page): Locator => page.locator('[class*="perfilNombre"]');
const puntuacion = (page: Page): Locator => page.locator('[class*="puntuacionTotal"]');
const nivelesDimension = (page: Page): Locator => page.locator('[class*="dimRowScore"]');
const porcentajes = (page: Page): Locator => page.locator('[class*="asignacionPct"]');
const progreso = (page: Page): Locator => page.locator('[class*="progressText"]');
/** El bloque entero del resultado: el <div> hijo de <main> que contiene la cabecera del perfil. */
const resultado = (page: Page): Locator =>
  page.locator('main > div').filter({ has: page.locator('[class*="resultadoHero"]') });

/** Carga la portada y espera a que React haya enganchado «Comenzar el test». */
async function cargar(page: Page): Promise<void> {
  await page.goto(RUTA);
  await page.waitForFunction(() => {
    const b = Array.from(document.querySelectorAll('button')).find((x) =>
      /Comenzar el test/.test(x.textContent ?? ''),
    );
    return Boolean(b && Object.keys(b).some((k) => k.startsWith('__reactProps$')));
  });
}

async function empezar(page: Page): Promise<void> {
  await cargar(page);
  await page.getByRole('button', { name: /Comenzar el test/ }).click();
  await expect(page.locator('input[name="pregunta-1"]').first()).toBeVisible();
}

/** Marca el valor `valores[i]` en la pregunta i + 1; `null` la deja en blanco. */
async function responder(page: Page, valores: (number | null)[]): Promise<void> {
  for (let i = 0; i < valores.length; i++) {
    const v = valores[i];
    if (v === null) continue;
    await page.locator(`input[name="pregunta-${i + 1}"][value="${v}"]`).check();
  }
}

async function verPerfil(page: Page): Promise<void> {
  await page.getByRole('button', { name: /Ver mi perfil de riesgo/ }).click();
}

/** Los dos porcentajes de la asignación como números (admite «40%» y «40 %»). */
async function reparto(page: Page): Promise<number[]> {
  return (await porcentajes(page).allInnerTexts()).map((t) => Number(t.replace(/[^\d]/g, '')));
}

// ============================================================
// CASO 1 — Recorrido normal
// ============================================================
test.describe('Caso normal', () => {
  test('49 puntos → Moderado 40/60, con el desglose por dimensión calculado a mano', async ({ page }) => {
    await empezar(page);
    // 12 + 11 + 10 + 6 + 10 = 49 → tramo 45–56 → Moderado
    await responder(page, [4, 2, 3, 3, 3, 3, 2, 3, 3, 3, 2, 2, 2, 2, 1, 1, 3, 2, 2, 3]);
    await expect(progreso(page)).toHaveText('20 / 20 preguntas respondidas');
    await verPerfil(page);

    await expect(perfilNombre(page)).toHaveText('Moderado');
    await expect(puntuacion(page)).toHaveText(/Puntuación:\s*49\s*\/\s*80/);
    await expect(nivelesDimension(page)).toHaveText([
      'Alto (12/16)', // 4+2+3+3 = 12 → 75 %
      'Medio (11/16)', // 3+3+2+3 = 11 → 68,75 %
      'Medio (10/16)', // 3+3+2+2 = 10 → 62,5 %
      'Bajo (6/16)', // 2+2+1+1 = 6 → 37,5 %
      'Medio (10/16)', // 3+2+2+3 = 10 → 62,5 %
    ]);
    const anchos = await page
      .locator('[class*="dimBarFill"]')
      .evaluateAll((els) => els.map((e) => parseFloat((e as HTMLElement).style.width)));
    expect(anchos).toEqual([75, 68.75, 62.5, 37.5, 62.5]);
    // PERFILES[2] = { rf: 40, rv: 60 }, y el reparto suma 100
    expect(await reparto(page)).toEqual([40, 60]);
    await expect(porcentajes(page).nth(0)).toHaveText(/^40\s?%$/);
  });

  test('el aviso financiero (riesgo 2, ALTO) se ve entero, sin plegar y fuera de la guía', async ({ page }) => {
    await cargar(page);
    const aviso = page.locator('[class*="disclaimer"]').first();
    await expect(aviso).toBeVisible();
    await expect(aviso).toContainText('no constituye asesoramiento financiero');
    await expect(aviso.locator('button')).toHaveCount(0);
    // Y sigue ahí con el resultado en pantalla
    await page.getByRole('button', { name: /Comenzar el test/ }).click();
    await responder(page, rep(3, 20));
    await verPerfil(page);
    await expect(perfilNombre(page)).toBeVisible();
    await expect(page.locator('[class*="disclaimer"]').first()).toBeVisible();
  });
});

// ============================================================
// CASO 2 — Extremos y cortes entre perfiles
// ============================================================
test.describe('Caso límite', () => {
  test('todo lo más conservador (20) y todo lo más agresivo (80)', async ({ page }) => {
    await empezar(page);
    await responder(page, rep(1, 20)); // 20 × 1 = 20, suelo de la escala
    await verPerfil(page);
    await expect(perfilNombre(page)).toHaveText('Conservador');
    await expect(puntuacion(page)).toHaveText(/20\s*\/\s*80/);
    await expect(nivelesDimension(page)).toHaveText(rep(0, 5).map(() => 'Bajo (4/16)'));
    expect(await reparto(page)).toEqual([85, 15]);

    await empezar(page);
    await responder(page, rep(4, 20)); // 20 × 4 = 80, techo
    await verPerfil(page);
    await expect(perfilNombre(page)).toHaveText('Agresivo');
    await expect(puntuacion(page)).toHaveText(/80\s*\/\s*80/);
    await expect(nivelesDimension(page)).toHaveText(rep(0, 5).map(() => 'Alto (16/16)'));
    expect(await reparto(page)).toEqual([5, 95]);
  });

  test('los cuatro cortes: 32/33, 44/45, 56/57 y 68/69', async ({ page }) => {
    test.setTimeout(90_000);
    // Sumas hechas a mano:
    //   32 = 2×12 + 1×8 · 33 = 2×13 + 1×7 · 44 = 3×4 + 2×16 · 45 = 3×5 + 2×15
    //   56 = 2×4 + 3×16 · 57 = 2×3 + 3×17 · 68 = 4×8 + 3×12 · 69 = 4×9 + 3×11
    const cortes: { valores: number[]; puntos: number; perfil: string; rf: number; rv: number }[] = [
      { valores: [...rep(2, 12), ...rep(1, 8)], puntos: 32, perfil: 'Conservador', rf: 85, rv: 15 },
      { valores: [...rep(2, 13), ...rep(1, 7)], puntos: 33, perfil: 'Moderado-Conservador', rf: 65, rv: 35 },
      { valores: [...rep(3, 4), ...rep(2, 16)], puntos: 44, perfil: 'Moderado-Conservador', rf: 65, rv: 35 },
      { valores: [...rep(3, 5), ...rep(2, 15)], puntos: 45, perfil: 'Moderado', rf: 40, rv: 60 },
      { valores: [...rep(2, 4), ...rep(3, 16)], puntos: 56, perfil: 'Moderado', rf: 40, rv: 60 },
      { valores: [...rep(2, 3), ...rep(3, 17)], puntos: 57, perfil: 'Moderado-Agresivo', rf: 20, rv: 80 },
      { valores: [...rep(4, 8), ...rep(3, 12)], puntos: 68, perfil: 'Moderado-Agresivo', rf: 20, rv: 80 },
      { valores: [...rep(4, 9), ...rep(3, 11)], puntos: 69, perfil: 'Agresivo', rf: 5, rv: 95 },
    ];
    for (const c of cortes) {
      expect(c.valores.reduce((a, b) => a + b, 0)).toBe(c.puntos);
      await empezar(page);
      await responder(page, c.valores);
      await verPerfil(page);
      await expect(perfilNombre(page)).toHaveText(c.perfil);
      await expect(puntuacion(page)).toHaveText(new RegExp(`Puntuación:\\s*${c.puntos}\\s*/\\s*80`));
      const [rf, rv] = await reparto(page);
      expect([rf, rv]).toEqual([c.rf, c.rv]);
      expect(rf + rv).toBe(100);
    }
  });
});

// ============================================================
// CASO 3 — Lo que debe rechazarse
// ============================================================
test.describe('Caso a rechazar', () => {
  test('con 19 de 20 no hay resultado, y sin contestar pide las 20', async ({ page }) => {
    await empezar(page);
    await responder(page, [...rep(3, 19), null]); // la 20 en blanco
    await expect(progreso(page)).toHaveText('19 / 20 preguntas respondidas');
    await verPerfil(page);
    await expect(perfilNombre(page)).toHaveCount(0);
    await expect(page.locator('input[name="pregunta-20"]').first()).toBeVisible();
    await expect(page.getByText(/1 pregunta por responder\./)).toBeVisible();

    await empezar(page);
    await verPerfil(page);
    await expect(perfilNombre(page)).toHaveCount(0);
    await expect(page.getByText('Faltan 20 preguntas por responder.')).toBeVisible();
  });

  test('un doble clic en «Comenzar el test» no marca ninguna respuesta', async ({ page }) => {
    await cargar(page);
    await page.getByRole('button', { name: /Comenzar el test/ }).dblclick();
    await expect(progreso(page)).toHaveText('0 / 20 preguntas respondidas');
    await expect(page.locator('input[type="radio"]:checked')).toHaveCount(0);
  });
});

// ============================================================
// HALLAZGOS de la primera inspección (18/11/2026) — ABIERTOS
// ============================================================
test.describe('hallazgos 18/11/2026', () => {
  test('ABIERTO (alto) — el perfil contradice las respuestas que lo limitan: plazo, capacidad y caída máxima', async ({
    page,
  }) => {
    test.fail();
    test.setTimeout(60_000);
    // El perfil es la suma pura: 19 respuestas al máximo compensan cualquier restricción declarada.
    // La propia página lo contradice: la tabla da al Agresivo «Horizonte recomendado 10+ años» y
    // «Pérdida máx. tolerable +50%», y la guía dice «Nunca inviertas dinero que puedas necesitar en
    // menos de 12 meses». (En la app hermana test-perfil-inversor, el mismo defecto —hallazgo 3312—
    // se reparó el 15/10/2026 con un tope por horizonte decidido por el usuario.)
    const problemas: string[] = [];

    // a) La 1 en «En menos de 1 año» y las demás al máximo: 1 + 19 × 4 = 77 → Agresivo, 95 % RV
    await empezar(page);
    await responder(page, [1, ...rep(4, 19)]);
    await verPerfil(page);
    await expect(puntuacion(page)).toHaveText(/77\s*\/\s*80/);
    const a = await resultado(page).innerText();
    const perfilA = (await perfilNombre(page).textContent()) ?? '';
    if (perfilA !== 'Conservador' && !/menos de 1 año/i.test(a)) {
      problemas.push(`plazo < 1 año → ${perfilA}, ${(await reparto(page)).join('/')} RF/RV, sin aviso`);
    }

    // b) La 8 en «Sería un problema grave para mi economía» y las demás al máximo: 77 → Agresivo,
    //    cuya descripción afirma «tienes alta capacidad financiera»
    const q8 = rep(4, 20);
    q8[7] = 1;
    await empezar(page);
    await responder(page, q8);
    await verPerfil(page);
    await expect(puntuacion(page)).toHaveText(/77\s*\/\s*80/);
    const b = await resultado(page).innerText();
    if (/alta capacidad financiera/i.test(b)) {
      problemas.push('perder el 30 % sería «un problema grave» → «tienes alta capacidad financiera»');
    }

    // c) La 18 en «Hasta un 5%» y las demás al máximo: 77 → Agresivo, «Acepta que podrás ver caídas
    //    del 40-50%»
    const q18 = rep(4, 20);
    q18[17] = 1;
    await empezar(page);
    await responder(page, q18);
    await verPerfil(page);
    await expect(puntuacion(page)).toHaveText(/77\s*\/\s*80/);
    const c = await resultado(page).innerText();
    if (/40-50/.test(c) && !/hasta un 5/i.test(c)) {
      problemas.push('caída máxima asumible «Hasta un 5%» → «Acepta que podrás ver caídas del 40-50%»');
    }

    expect(problemas).toEqual([]);
  });

  test('ABIERTO (medio) — «Horizonte Temporal: Alto» para quien necesita el dinero en menos de 1 año', async ({
    page,
  }) => {
    test.fail();
    // La dimensión suma la 1 (plazo) con la 2 (qué harías si cae un 20 %: reacción), la 3 (fondo de
    // emergencia: capacidad) y la 4 (etapa vital). Con la 1 en «En menos de 1 año» y las otras tres
    // al máximo: 1 + 4 + 4 + 4 = 13/16 = 81,25 % → «Alto».
    await empezar(page);
    await responder(page, [1, ...rep(4, 19)]);
    await verPerfil(page);
    await expect(nivelesDimension(page).nth(0)).not.toHaveText(/^Alto/);
  });

  test('REPARADO 5203 (19/11/2026) — un doble clic en «Ver mi perfil de riesgo» pulsa «Repetir el test» y borra las 20 respuestas', async ({
    page,
  }) => {
    // Reparado con useGuardaRafaga. Era: al pasar al resultado la página encoge (6.511 px de scroll → 1.362), el navegador recoloca la
    // vista y «Repetir el test» queda justo bajo el puntero: el segundo clic, si llega antes de que
    // el desplazamiento suave arranque (≤ 30-60 ms en este equipo), vuelve a la portada sin aviso.
    await empezar(page);
    await responder(page, rep(3, 20)); // 60 → Moderado-Agresivo
    await page.getByRole('button', { name: /Ver mi perfil de riesgo/ }).dblclick();
    await expect(perfilNombre(page)).toHaveText('Moderado-Agresivo');
    await expect(puntuacion(page)).toHaveText(/60\s*\/\s*80/);
  });

  test('REPARADO 5204 (19/11/2026) — el aviso de cuestionario incompleto no se anuncia y dice «Faltan 1 pregunta»', async ({
    page,
  }) => {
    await empezar(page);
    await responder(page, [...rep(3, 19), null]);
    await verPerfil(page);
    const aviso = page.getByText(/pregunta.? por responder/);
    await expect(aviso).toBeVisible();
    // Concordancia: con una sola, «Falta 1 pregunta por responder.»
    await expect(aviso).toHaveText('Falta 1 pregunta por responder.');
    // Y un lector de pantalla tiene que enterarse: role="alert" o aria-live en el aviso o su contenedor
    expect(
      await aviso.evaluate((el) => Boolean(el.closest('[role="alert"], [role="status"], [aria-live]'))),
    ).toBe(true);
    // Y señala la que falta: el foco va a la pregunta 20
    expect(await page.evaluate(() => (document.activeElement as HTMLInputElement | null)?.name)).toBe('pregunta-20');
  });

  test('REPARADO 5205 (19/11/2026) — al cambiar de fase el foco cae a <body>', async ({ page }) => {
    // «Comenzar el test», «Ver mi perfil de riesgo» y «Repetir el test» se desmontan al pulsarlos;
    // ahora el foco va al contador del cuestionario, al nombre del perfil y al título de la portada.
    await cargar(page);
    await page.getByRole('button', { name: /Comenzar el test/ }).click();
    await expect(progreso(page)).toBeVisible();
    const trasComenzar = await page.evaluate(() => document.activeElement?.tagName);
    await responder(page, rep(3, 20));
    await verPerfil(page);
    await expect(perfilNombre(page)).toBeVisible();
    const trasResultado = await page.evaluate(() => document.activeElement?.tagName);
    await page.getByRole('button', { name: /Repetir el test/ }).click();
    await expect(page.getByRole('button', { name: /Comenzar el test/ })).toBeVisible();
    const trasRepetir = await page.evaluate(() => document.activeElement?.tagName);
    expect([trasComenzar, trasResultado, trasRepetir]).not.toContain('BODY');
    expect(await page.evaluate(() => document.activeElement?.textContent ?? '')).toContain('¿Cuánto riesgo estás realmente dispuesto a asumir?');
  });

  test('ABIERTO (bajo) — barra de progreso sin nombre accesible y aria-label en <div> sin rol', async ({ page }) => {
    test.fail();
    await empezar(page);
    await expect(page.getByRole('progressbar')).toHaveAccessibleName(/\S/);
    await responder(page, rep(3, 20));
    await verPerfil(page);
    expect(await page.locator('[class*="asignacionBar"][aria-label]:not([role])').count()).toBe(0);
  });

  test('REPARADO 5207 (19/11/2026) — la misma pregunta de la frecuencia de revisión, con dos respuestas distintas', async ({
    page,
  }) => {
    await cargar(page);
    const enLd = await page.evaluate(() => {
      for (const s of Array.from(document.querySelectorAll('script[type="application/ld+json"]'))) {
        const j = JSON.parse(s.textContent ?? '{}') as {
          '@type'?: string;
          mainEntity?: { name: string; acceptedAnswer: { text: string } }[];
        };
        if (j['@type'] !== 'FAQPage') continue;
        const q = (j.mainEntity ?? []).find((m) => /frecuencia/i.test(m.name));
        if (q) return q.acceptedAnswer.text;
      }
      return '';
    });
    const visible = (
      await page.locator('[class*="faqItem"]').filter({ hasText: /frecuencia/i }).locator('p').first().textContent()
    )?.trim();
    // FAQPage: «al menos una vez al año» · visible: «Al menos cada 2-3 años». Una sola constante.
    expect(enLd).not.toBe('');
    expect(visible).toBe(enLd);
    expect(visible).not.toContain('2-3 años');
  });

  test('REPARADO 5208 (19/11/2026) — el FAQPage promete detectar contradicciones «en lugar de dar una puntuación única»', async ({
    page,
  }) => {
    await cargar(page);
    const ld = (await page.locator('script[type="application/ld+json"]').allTextContents()).join(' ');
    // El perfil sale SOLO de la suma (`obtenerPerfil(puntuacionTotal)`), la pantalla enseña
    // «Puntuación: N / 80» y ninguna combinación de respuestas produce un aviso de contradicción.
    expect(ld).not.toContain('en lugar de dar una puntuación única');
    expect(ld).not.toContain('detectar contradicciones');
    expect(ld).not.toContain('5-8 preguntas');
    expect(ld).toContain('El perfil sale de la puntuación total');
  });

  test('ABIERTO (bajo) — jsonLd con features vacía y la descripción cortada a media palabra', async ({ page }) => {
    test.fail();
    await cargar(page);
    const app = await page.evaluate(() => {
      for (const s of Array.from(document.querySelectorAll('script[type="application/ld+json"]'))) {
        const j = JSON.parse(s.textContent ?? '{}') as {
          '@type'?: string;
          description?: string;
          featureList?: string[];
        };
        if (j['@type'] === 'WebApplication') return { d: j.description ?? '', f: j.featureList ?? [] };
      }
      return { d: '', f: [] as string[] };
    });
    expect(app.f.length).toBeGreaterThanOrEqual(4);
    expect(app.d).not.toMatch(/activos re$/);
  });

  test('ABIERTO (medio) — la guía da la regla «% en renta fija ≈ tu edad» sin fuente ni origen', async ({ page }) => {
    test.fail();
    await cargar(page);
    // CLAUDE.md §1.quinquies, señales 1 y 5: es la «regla 100-edad» del asesoramiento anglosajón,
    // presentada como «Regla clásica […] útil como guía».
    await expect(page.getByText(/porcentaje en renta fija ≈ tu edad/)).toHaveCount(0);
  });

  test('REPARADO 5211 (19/11/2026) — el resultado llama «índice global» al S&P 500 y dice que el mercado «siempre se recuperó»', async ({
    page,
  }) => {
    const problemas: string[] = [];
    // Moderado (49 puntos, el caso normal): «ETFs de índices globales (MSCI World, S&P 500)»
    await empezar(page);
    await responder(page, [4, 2, 3, 3, 3, 3, 2, 3, 3, 3, 2, 2, 2, 2, 1, 1, 3, 2, 2, 3]);
    await verPerfil(page);
    await expect(perfilNombre(page)).toHaveText('Moderado');
    if (/global(es)?\s*\([^)]*S&P 500/.test(await resultado(page).innerText())) {
      problemas.push('Moderado: S&P 500 entre los «índices globales»');
    }
    // Moderado-Agresivo (60 puntos): «históricamente el mercado siempre se recuperó», cuando la guía
    // de la misma página cita el Nikkei 1989-2024 y las décadas perdidas de los emergentes
    await empezar(page);
    await responder(page, rep(3, 20));
    await verPerfil(page);
    await expect(perfilNombre(page)).toHaveText('Moderado-Agresivo');
    const t = await resultado(page).innerText();
    if (/global\s*como núcleo\s*\([^)]*S&P 500/.test(t)) problemas.push('Moderado-Agresivo: S&P 500 como renta variable global');
    if (/siempre se recuperó/.test(t)) problemas.push('Moderado-Agresivo: «siempre se recuperó»');
    expect(problemas).toEqual([]);
  });

  test('ABIERTO (bajo) — «asignación de activos recomendada» y «modelos académicos estándar» sin fuente', async ({
    page,
  }) => {
    test.fail();
    await cargar(page);
    // La FAQ visible responde «¿Es una recomendación de inversión? No.», pero la meta description
    // promete una asignación «recomendada» y atribuye los repartos a «modelos académicos estándar»
    // que no cita (los cortes 32/44/56/68 y los repartos 85/65/40/20/5 son de la app).
    const meta = (await page.locator('meta[name="description"]').getAttribute('content')) ?? '';
    expect(meta).not.toContain('recomendada');
    await expect(page.getByText(/modelos académicos estándar/)).toHaveCount(0);
  });

  test('ABIERTO (bajo) — el texto propio del aviso va en `context`, que es una clave de almacenamiento, y no se pinta', async ({
    page,
  }) => {
    test.fail();
    await cargar(page);
    // page.tsx pasa a <DisclaimerCard> context="Los resultados de este test son orientativos […] No
    // constituyen asesoramiento financiero personalizado. Consulta a un asesor financiero certificado
    // […]", pero `context` es la clave de sessionStorage/localStorage del plegado
    // (components/DisclaimerCard.tsx): el texto no llega a la pantalla. Va como hijo del componente.
    await expect(page.locator('[class*="disclaimer"]').first()).toContainText(
      'No constituyen asesoramiento financiero personalizado',
    );
  });

  test('ABIERTO (bajo) — los porcentajes van pegados a la cifra («40%»)', async ({ page }) => {
    test.fail();
    await empezar(page);
    await responder(page, [4, 2, 3, 3, 3, 3, 2, 3, 3, 3, 2, 2, 2, 2, 1, 1, 3, 2, 2, 3]);
    await verPerfil(page);
    // CLAUDE.md global §2 (25/09/2026): espacio duro U+00A0 entre la cifra y el %
    await expect(porcentajes(page)).toHaveText(['40\u00A0%', '60\u00A0%']);
  });

  test('ABIERTO (bajo) — la pregunta 4 no tiene etapa para quien ya está jubilado', async ({ page }) => {
    test.fail();
    await empezar(page);
    // Opciones: «Cerca de la jubilación (menos de 10 años)», «Adulto maduro (35-50 años…)»,
    // «Adulto joven (25-35 años…)», «Muy joven (menos de 25 años…)». Ni la persona jubilada ni la
    // de 51-56 años a más de 10 de jubilarse tienen la suya, y los 35 años caen en dos.
    const opciones = await page
      .locator('[role="radiogroup"]')
      .filter({ has: page.locator('input[name="pregunta-4"]') })
      .locator('label')
      .allInnerTexts();
    expect(opciones).toHaveLength(4);
    expect(opciones.some((o) => /jubilad/i.test(o))).toBe(true);
  });
});
