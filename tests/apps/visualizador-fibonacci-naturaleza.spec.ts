import { test, expect, Page } from '@playwright/test';

/**
 * Inspector — visualizador-fibonacci-naturaleza (segmento interactiva, riesgo 3)
 * Primera inspección: 31/08/2026.
 *
 * QUÉ PROMETE
 *   <h1>: «Fibonacci en la Naturaleza»
 *   subtítulo: «1, 1, 2, 3, 5, 8, 13... la secuencia que lo conecta todo»
 *   Sección 1 («La secuencia»): genera la secuencia de Fibonacci paso a paso (botón
 *   «Siguiente número»), muestra una tabla de ratios F(n)/F(n-1) convergiendo hacia
 *   φ = 1,618034... y un texto de "insight" que cambia según cuántos términos se
 *   han revelado.
 *
 * DÓNDE VIVE EL CÁLCULO — app/visualizador-fibonacci-naturaleza/page.tsx (sin motor
 * aparte en lib/, todo inline en el componente):
 *   · generarFibonacci(n): fib=[1,1]; fib.push(fib[i-1]+fib[i-2]) para i=2..n-1.
 *     OJO: esta app usa la convención F1=F2=1 (SIN el término F(0)=0 de la
 *     definición matemática estándar) — es una elección editorial explícita, ya
 *     que el propio subtítulo dice «1, 1, 2, 3, 5, 8, 13...», nunca «0, 1, 1, 2...».
 *   · FIB_COMPLETA = generarFibonacci(20) — 20 términos, calculado una sola vez a
 *     nivel de módulo. El botón "Siguiente número" solo AVANZA un contador
 *     `visibles` (inicial 5, tope 20 = FIB_COMPLETA.length, disabled en el tope).
 *   · ratios[i] = FIB_COMPLETA[i] / FIB_COMPLETA[i-1], para i = 1..visibles-1.
 *   · El texto de insight, para visibles < 8, muestra
 *     "FIB[visibles-2] + FIB[visibles-3] = FIB[visibles-1]"; para visibles >= 8,
 *     muestra la ratio FIB[visibles-1]/FIB[visibles-2] con 6 decimales.
 *
 * ─────────────────────────────────────────────────────────────────────────────────
 * LOS TRES CASOS, RESUELTOS A MANO ANTES DE ABRIR EL NAVEGADOR
 *
 *   CASO 1 (normal) — estado inicial, visibles = 5
 *     Secuencia mostrada: F1=1, F2=1, F3=2, F4=3, F5=5, F6..F20 ocultos ("?")
 *     Insight (visibles=5 < 8): FIB[3]+FIB[2]=FIB[4] → 3 + 2 = 5
 *     Tabla de ratios (ratios.slice(1), i=2,3,4):
 *       (F=2,  F-1=1, ratio=2,000000,        |ratio-φ|=0,381966)
 *       (F=3,  F-1=2, ratio=1,500000,        |ratio-φ|=0,118034)
 *       (F=5,  F-1=3, ratio=1,666667,        |ratio-φ|=0,048633)
 *
 *   CASO 2 (límite) — tope superior: 15 clics en "Siguiente número" → visibles = 20
 *     (FIB_COMPLETA.length, el botón queda disabled y ya no se puede seguir).
 *     Secuencia completa: 1,1,2,3,5,8,13,21,34,55,89,144,233,377,610,987,1597,2584,4181,6765
 *       (F20 = 6765, el Fibonacci estándar de 20 términos con esta convención)
 *     Insight (visibles=20 >= 8): ratio = FIB[19]/FIB[18] = 6765/4181 = 1,6180339632...
 *       redondeado a 6 decimales → 1,618034 (coincide con φ hasta la 6ª cifra)
 *
 *   CASO 3 (rechazo — no hay input numérico libre en esta app: el único control de
 *   la secuencia es el botón "Siguiente número", ya acotado por `disabled` en el
 *   propio tope superior) — con visibles = 20 el botón está disabled: un intento de
 *   clic debe ser rechazado por Playwright (timeout) y la secuencia debe seguir
 *   exactamente en 20 términos visibles, sin desbordar FIB_COMPLETA. "Reiniciar"
 *   debe devolver visibles a 5 (el otro extremo del rango).
 * ─────────────────────────────────────────────────────────────────────────────────
 *
 * RESULTADO DE LA VERIFICACIÓN: los 3 casos coinciden EXACTAMENTE con lo calculado
 * a mano (ver ejecución de referencia en el acta). Sin errores de consola. Todos los
 * botones llevan type="button"; el nav de secciones lleva aria-pressed correcto
 * (true solo en la sección activa); todos los emojis junto a texto llevan
 * aria-hidden="true".
 *
 * ── Reparado 02/09/2026 (hallazgo 573) ────────────────────────────────────────────
 * El FAQPage de metadata.ts (lo que leen Bing Copilot, ChatGPT o Perplexity) describía
 * la secuencia con la definición matemática ESTÁNDAR («0, 1, 1, 2, 3, 5, 8, 13, 21,
 * 34…», con el término F(0)=0), mientras que la app real NUNCA muestra un 0: ni en el
 * subtítulo («1, 1, 2, 3, 5, 8, 13...») ni en ningún término de la secuencia
 * interactiva (F1=1, F2=1, ...). No afectaba a ningún cálculo ni veredicto — era solo
 * una diferencia de convención entre el FAQ y la propia herramienta. Ahora el FAQ
 * también empieza en «1, 1, 2, 3, 5, 8, 13, 21, 34…», sin el 0.
 */

const RUTA = '/visualizador-fibonacci-naturaleza/';

const celda = (page: Page, indice: number) => page.locator('[class*="secuenciaNum"]').nth(indice);
const filasTablaRatios = (page: Page) => page.locator('table tbody tr');
const insights = (page: Page) => page.locator('[class*="insight"]');
const btnSiguiente = (page: Page) =>
  page.getByRole('button', { name: 'Revelar siguiente número de Fibonacci' });
const btnReiniciar = (page: Page) => page.getByRole('button', { name: 'Reiniciar secuencia' });

test.beforeEach(async ({ page }) => {
  await page.goto(RUTA);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Fibonacci en la Naturaleza');
});

test.describe('CASO 1 (normal) — estado inicial, visibles = 5', () => {
  test('secuencia F1..F5 = 1,1,2,3,5 y F6 en adelante ocultos ("?")', async ({ page }) => {
    await expect(celda(page, 0)).toContainText('1');
    await expect(celda(page, 1)).toContainText('1');
    await expect(celda(page, 2)).toContainText('2');
    await expect(celda(page, 3)).toContainText('3');
    await expect(celda(page, 4)).toContainText('5');
    await expect(celda(page, 5)).toContainText('?');
    await expect(celda(page, 19)).toContainText('?');
  });

  test('insight: «3 + 2 = 5» y tabla de ratios con las 3 primeras filas hacia φ', async ({ page }) => {
    // FIB_COMPLETA[visibles-2]=FIB[3]=3, FIB_COMPLETA[visibles-3]=FIB[2]=2,
    // FIB_COMPLETA[visibles-1]=FIB[4]=5
    await expect(insights(page).first()).toContainText('3 + 2 = 5');

    const filas = await filasTablaRatios(page).allTextContents();
    expect(filas).toEqual([
      '212,0000000,381966', // F=2,  F-1=1, ratio=2,000000,        diff=0,381966
      '321,5000000,118034', // F=3,  F-1=2, ratio=1,500000,        diff=0,118034
      '531,6666670,048633', // F=5,  F-1=3, ratio=1,666667,        diff=0,048633
    ]);
  });
});

test.describe('CASO 2 (límite) — 15 clics en "Siguiente número": visibles llega a 20 (tope)', () => {
  test('secuencia completa 1,1,2,3,5,8,13,21,34,55,89,144,233,377,610,987,1597,2584,4181,6765', async ({
    page,
  }) => {
    for (let i = 0; i < 15; i++) {
      await btnSiguiente(page).click();
    }
    const esperado = [
      '1', '1', '2', '3', '5', '8', '13', '21', '34', '55',
      '89', '144', '233', '377', '610', '987', '1597', '2584', '4181', '6765',
    ];
    for (let i = 0; i < 20; i++) {
      await expect(celda(page, i)).toContainText(esperado[i]);
    }
    // Ya no puede haber celdas "?": los 20 términos están revelados.
    const textoGrid = await page.locator('[class*="secuenciaGrid"]').innerText();
    expect(textoGrid).not.toContain('?');
  });

  test('botón "Siguiente número" queda disabled en el tope y el insight da ratio 1,618034', async ({
    page,
  }) => {
    for (let i = 0; i < 15; i++) {
      await btnSiguiente(page).click();
    }
    await expect(btnSiguiente(page)).toBeDisabled();

    // FIB_COMPLETA[19]/FIB_COMPLETA[18] = 6765/4181 = 1,6180339632... → 6 decimales: 1,618034
    await expect(insights(page).first()).toContainText('1,618034');
    await expect(insights(page).first()).toContainText('muy cerca de φ');
  });
});

test.describe('CASO 3 (rechazo) — sin input numérico libre; el único límite es el botón disabled', () => {
  test('con el botón disabled, un intento de clic no hace nada y la secuencia sigue en 20 términos', async ({
    page,
  }) => {
    for (let i = 0; i < 15; i++) {
      await btnSiguiente(page).click();
    }
    await expect(btnSiguiente(page)).toBeDisabled();

    // Un intento de clic sobre un botón disabled debe ser rechazado por Playwright
    // (timeout), y nunca llegar a alterar el estado.
    await expect(btnSiguiente(page).click({ timeout: 1000 })).rejects.toThrow();

    const textoGrid = await page.locator('[class*="secuenciaGrid"]').innerText();
    expect(textoGrid).not.toContain('?'); // sigue con los 20 términos revelados, ni uno más ni uno menos
  });

  test('"Reiniciar" devuelve la secuencia a visibles = 5 (el otro extremo)', async ({ page }) => {
    for (let i = 0; i < 15; i++) {
      await btnSiguiente(page).click();
    }
    await expect(btnSiguiente(page)).toBeDisabled();

    await btnReiniciar(page).click();
    await expect(celda(page, 4)).toContainText('5');
    await expect(celda(page, 5)).toContainText('?');
    await expect(btnSiguiente(page)).toBeEnabled();
  });
});

// ───────────────────────────────────────────────────────────────────────────────
test.describe('Operativa básica de las otras 3 secciones (sin resultado numérico verificable)', () => {
  test('la navegación entre secciones responde y no deja errores de consola', async ({ page }) => {
    const erroresConsola: string[] = [];
    page.on('pageerror', (err) => erroresConsola.push('pageerror: ' + err.message));
    page.on('console', (msg) => {
      if (msg.type() === 'error') erroresConsola.push('console.error: ' + msg.text());
    });

    await page.getByRole('button', { name: /La espiral/ }).click();
    await expect(page.locator('[class*="espiralCanvas"]')).toBeVisible();

    await page.getByRole('button', { name: /En las plantas/ }).click();
    await expect(page.locator('[class*="plantasGrid"]')).toBeVisible();

    await page.getByRole('button', { name: /Más allá/ }).click();
    await expect(page.locator('[class*="arteGrid"]')).toBeVisible();

    await page.getByRole('button', { name: /La secuencia/ }).click();
    await expect(page.locator('[class*="secuenciaGrid"]')).toBeVisible();

    expect(erroresConsola).toEqual([]);
  });
});

// ───────────────────────────────────────────────────────────────────────────────
test.describe('Accesibilidad básica (CLAUDE.md global §5)', () => {
  test('todos los <button> llevan type="button"', async ({ page }) => {
    // Se excluye el overlay de `next dev`, cuyo botón «Open Next.js Dev Tools» no lleva
    // type y no es de la app: contra el servidor de desarrollo daba un rojo que en
    // producción no existe, y un test que solo pasa en un entorno no informa de nada.
    // Mismo patrón ya aplicado en verificador-complemento-brecha-genero.spec.ts.
    const sinType = await page.locator('button:not([type]):not([data-nextjs-dev-tools-button])').count();
    expect(sinType).toBe(0);
  });

  test('el nav de secciones lleva aria-pressed correcto (true solo en la sección activa)', async ({
    page,
  }) => {
    const nav = page.locator('nav[aria-label="Secciones del explicador"] button');
    await expect(nav.filter({ hasText: 'La secuencia' })).toHaveAttribute('aria-pressed', 'true');
    await expect(nav.filter({ hasText: 'La espiral' })).toHaveAttribute('aria-pressed', 'false');
    await expect(nav.filter({ hasText: 'En las plantas' })).toHaveAttribute('aria-pressed', 'false');
    await expect(nav.filter({ hasText: 'Más allá' })).toHaveAttribute('aria-pressed', 'false');

    await nav.filter({ hasText: 'La espiral' }).click();
    await expect(nav.filter({ hasText: 'La espiral' })).toHaveAttribute('aria-pressed', 'true');
    await expect(nav.filter({ hasText: 'La secuencia' })).toHaveAttribute('aria-pressed', 'false');
  });
});

// ───────────────────────────────────────────────────────────────────────────────
/**
 * Hallazgo 573 (reparado 02/09/2026) — el FAQPage (JSON-LD) describía la secuencia
 * con la definición matemática estándar, que incluye el término F(0)=0, mientras que
 * la app real (subtítulo y secuencia interactiva) usa la convención F1=F2=1 y NUNCA
 * muestra un 0. Ahora el FAQ también empieza en 1, 1 — la misma convención que enseña
 * la propia herramienta.
 */
test('Hallazgo 573 (reparado) — el FAQPage cuenta la secuencia con la misma convención que la app (F1=F2=1, sin F(0)=0)', async ({
  page,
}) => {
  await page.goto(RUTA);

  // La app real: el subtítulo y la secuencia interactiva empiezan en 1, 1 — nunca en 0.
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Fibonacci en la Naturaleza');
  const subtitulo = await page.locator('p').first().innerText();
  expect(subtitulo).toContain('1, 1, 2, 3, 5, 8, 13');
  expect(subtitulo).not.toMatch(/^0,/);
  await expect(celda(page, 0)).toContainText('1'); // F1 = 1, no F(0) = 0

  // Reparado: el FAQPage ya NO incluye el término 0 — misma convención que la app.
  const bloques = await page.locator('script[type="application/ld+json"]').allTextContents();
  const faq = bloques.map((b) => JSON.parse(b)).find((j) => j['@type'] === 'FAQPage');
  const primeraRespuesta: string = faq.mainEntity[0].acceptedAnswer.text;
  expect(primeraRespuesta).toContain('1, 1, 2, 3, 5, 8, 13, 21, 34');
  expect(primeraRespuesta).not.toContain('0, 1, 1, 2, 3, 5, 8, 13, 21, 34');
});
