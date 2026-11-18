import { test, expect, Page, Locator } from '@playwright/test';
import { esperarPaginaAsentada } from './_hidratacion';
import { contrasteSobreFondoReal } from './_contraste';

/**
 * Inspector — visualizador-ciclo-economico (segmento interactiva · economía)
 *
 * Primera inspección: 18/11/2026. La app promete en su <h1> «Ciclo Económico» y en el subtítulo
 * «Expansión, pico, recesión y recuperación — indicadores leading/lagging y la curva de
 * rendimientos como predictor de recesión». Cuatro bloques, todo en page.tsx, sin motor aparte:
 *   1. Una sinusoide y = 110 − 70·sin(2,5πt) (viewBox 700 × 220, x = 40 + 620·t) con un punto que
 *      la recorre y cuatro tramos pulsables (ZONAS_FASE), más cuatro tarjetas de fase.
 *   2. Trece indicadores leading/coincident/lagging con su dato de España y de la Eurozona.
 *   3. La curva de rendimientos (YIELD_CURVE_DATA) normal, plana e invertida.
 *   4. Un simulador de seis preguntas Sí/No que puntúa cada fase (interpretarRespuestas).
 *
 * LOS CASOS, RESUELTOS A MANO ANTES DE ABRIR EL NAVEGADOR (.inspector-trabajo/vce-esperados.mjs)
 *   CASO 1 (normal) — simulador con una expansión de manual: PIB creció Sí, paro bajando Sí,
 *     inflación > 3 % No, tipos subiendo No, PMI > 50 Sí, curva invertida No. Con las reglas de
 *     interpretarRespuestas: Expansión 2+2+1+1+2+1 = 9 · Valle 2+2+1 = 5 · Pico 1+1 = 2 ·
 *     Recesión 0 → «Expansión». Seis Sí: Pico 7 · Expansión 6 · Recesión 4 → «Pico».
 *   CASO 2 (límite: los extremos de la curva) — la sinusoide tiene su máximo en t = 0,2
 *     (x 164, y 40) y su mínimo en t = 0,6 (x 412, y 180); el eje los rotula «Pico» (40, 32) y
 *     «Valle» (40, 198), y la página define el Pico como «la economía está en su punto máximo» y el
 *     Valle como «la economía toca fondo». Al pulsar «Pico» el punto debe quedar en lo alto
 *     (cy < 110 − 0,9·70 = 47) y al pulsar «Valle / Recuperación», en lo hondo (cy > 173).
 *     El código pone el punto en el centro de su tramo: Pico t = 0,425 → cy = 123,7 (por DEBAJO
 *     de la tendencia, bajando) y Valle t = 0,875 → cy = 71,1 (por encima, subiendo); el máximo
 *     cae en el tramo «Expansión» y el mínimo en «Recesión».
 *   CASO 3 (rechazo) — PIB creció Sí, paro bajando Sí, inflación Sí, tipos No, PMI No, curva Sí.
 *     La página define la recesión como «dos trimestres consecutivos de PIB negativo» con
 *     «destrucción de empleo, paro en alza»: con el PIB creciendo y el paro bajando, «Recesión»
 *     queda excluida. Las reglas dan Recesión 1+2+3 = 6 · Expansión 2+2+1 = 5 · Pico 1+1+2+1 = 5 →
 *     «Recesión: la economía se contrae». Es una de 5 combinaciones con «PIB creció = Sí» que lo dan.
 *   Curva de rendimientos — tramo 2a y 10a de YIELD_CURVE_DATA: normal 3,2 → 3,9 (positiva),
 *     plana 3,5 → 3,5, invertida 4,0 → 3,5 (2a > 10a): coherente con cada rótulo.
 *   Contraste — blanco sobre #22c55e = 2,28:1 y sobre #ef4444 = 3,76:1 (WCAG, texto normal 4,5:1).
 *
 * FUENTE: tipos oficiales del BCE, tabla «Key ECB interest rates» (www.ecb.europa.eu, consultada
 * el 18/11/2026): operaciones principales de financiación al 4,50 % desde el 20/09/2023, 4,25 %
 * desde el 12/06/2024 (la primera bajada) y 2,65 % desde el 16/09/2026.
 *
 * Los test con test.fail() son HALLAZGOS ABIERTOS (18/11/2026): describen lo que DEBERÍA pasar y
 * hoy no pasa. Al reparar cada uno se quita su test.fail() —comprobando antes que lo que afirma
 * sigue siendo lo correcto— y «ABIERTO» pasa a «REPARADO».
 */

test.use({ locale: 'es-ES' });

const RUTA = '/visualizador-ciclo-economico/';

type Respuesta = 'Sí' | 'No';

async function abrir(page: Page): Promise<void> {
  await page.goto(RUTA);
  // El punto del ciclo se anima sin parar: el DOM no se aquieta nunca, de ahí el tope corto
  await esperarPaginaAsentada(page, { maximoMs: 1500 });
}

const svgCiclo = (page: Page): Locator => page.getByRole('img', { name: /Curva sinusoidal del ciclo/ });
const punto = (page: Page): Locator => svgCiclo(page).locator('circle');
const preguntas = (page: Page): Locator => page.locator('[class$="_preguntaCard"]');
const resultado = (page: Page): Locator => page.getByRole('region', { name: 'Resultado del simulador' });

async function cyDelPunto(page: Page): Promise<number> {
  return Number(await punto(page).getAttribute('cy'));
}

async function responder(page: Page, respuestas: Respuesta[]): Promise<void> {
  for (const [i, r] of respuestas.entries()) {
    const boton = preguntas(page).nth(i).getByRole('button', { name: r, exact: true });
    await boton.click();
    await expect(boton).toHaveAttribute('aria-pressed', 'true');
  }
}

async function abrirIndicador(page: Page, nombre: string): Promise<Locator> {
  await page.getByRole('button', { name: nombre, exact: true }).click();
  const detalle = page.getByRole('region', { name: `Detalle: ${nombre}` });
  await expect(detalle).toBeVisible();
  return detalle;
}

test.describe('Simulador «¿En qué fase estamos?»', () => {
  test.beforeEach(async ({ page }) => {
    await abrir(page);
    await expect(preguntas(page)).toHaveCount(6);
  });

  test('CASO 1 (normal): una expansión de manual (Sí, Sí, No, No, Sí, No) da «Expansión» (9 frente a 5)', async ({ page }) => {
    await responder(page, ['Sí', 'Sí', 'No', 'No', 'Sí', 'No']);
    await expect(resultado(page).locator('h3')).toHaveText('Fase estimada: Expansión');
  });

  test('seis Sí dan «Pico» (7 frente a 6 de Expansión)', async ({ page }) => {
    await responder(page, ['Sí', 'Sí', 'Sí', 'Sí', 'Sí', 'Sí']);
    await expect(resultado(page).locator('h3')).toHaveText('Fase estimada: Pico');
  });

  test('con 5 de las 6 respuestas no hay resultado, y desmarcar la sexta lo retira', async ({ page }) => {
    await responder(page, ['Sí', 'Sí', 'No', 'No', 'Sí']);
    await expect(resultado(page)).toHaveCount(0);
    const sexta = preguntas(page).nth(5).getByRole('button', { name: 'No', exact: true });
    await sexta.click();
    await expect(resultado(page)).toHaveCount(1);
    await sexta.click();
    await expect(sexta).toHaveAttribute('aria-pressed', 'false');
    await expect(resultado(page)).toHaveCount(0);
  });

  test.fail('CASO 3 (rechazo) — HALLAZGO ABIERTO: con el PIB creciendo y el paro bajando no puede salir «Recesión»', async ({ page }) => {
    // La propia página: «Técnicamente: dos trimestres consecutivos de PIB negativo» y «Destrucción
    // de empleo, paro en alza». Hoy: Recesión 6 · Expansión 5 · Pico 5 → «Recesión».
    await responder(page, ['Sí', 'Sí', 'Sí', 'No', 'No', 'Sí']);
    await expect(resultado(page).locator('h3')).toContainText('Fase estimada:');
    await expect(resultado(page).locator('h3')).not.toContainText('Recesión');
  });
});

test.describe('Las cuatro fases sobre la curva', () => {
  test.beforeEach(async ({ page }) => {
    await abrir(page);
  });

  test('la curva tiene su máximo en y = 40 y su mínimo en y = 180, y el eje los rotula «Pico» y «Valle»', async ({ page }) => {
    const ys = await svgCiclo(page)
      .locator('path:not([role])')
      .first()
      .evaluate((p) => (p.getAttribute('d') ?? '').match(/-?\d+(\.\d+)?/g)!.map(Number).filter((_, i) => i % 2 === 1));
    expect(Math.min(...ys)).toBeCloseTo(40, 0);
    expect(Math.max(...ys)).toBeCloseTo(180, 0);
    const rotulos = await svgCiclo(page).locator('text').evaluateAll((ts) =>
      ts.map((t) => ({ texto: t.textContent, y: Number(t.getAttribute('y')) })),
    );
    expect(rotulos.find((r) => r.texto === 'Pico')!.y).toBeLessThan(40);
    expect(rotulos.find((r) => r.texto === 'Valle')!.y).toBeGreaterThan(180);
  });

  test('pulsar una tarjeta para la animación, marca la tarjeta y cambia el detalle', async ({ page }) => {
    await page.getByRole('button', { name: 'Recesión', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Recesión', exact: true })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('region', { name: /Detalle de la fase/ }).locator('h3')).toHaveText('Recesión');
    await expect(page.getByRole('button', { name: 'Reanudar animación' })).toBeVisible();
    const cx = await punto(page).getAttribute('cx');
    await page.waitForTimeout(600);
    expect(await punto(page).getAttribute('cx')).toBe(cx);
  });

  test.fail('CASO 2 (límite) — HALLAZGO ABIERTO: «Pico» pone el punto en lo alto de la curva y «Valle / Recuperación» en lo hondo', async ({ page }) => {
    // Hoy: Pico cy = 123,7 (bajo la tendencia, y = 110) y Valle cy = 71,1 (sobre ella); el máximo
    // (y 40) está en el tramo «Expansión» y el mínimo (y 180) en el de «Recesión».
    await page.getByRole('button', { name: 'Pico', exact: true }).click();
    await expect(page.getByRole('region', { name: /Detalle de la fase/ }).locator('h3')).toHaveText('Pico');
    expect(await cyDelPunto(page), 'Pico: en lo alto (cy < 47)').toBeLessThan(47);
    await page.getByRole('button', { name: 'Valle / Recuperación', exact: true }).click();
    await expect(page.getByRole('region', { name: /Detalle de la fase/ }).locator('h3')).toHaveText('Valle / Recuperación');
    expect(await cyDelPunto(page), 'Valle: en lo hondo (cy > 173)').toBeGreaterThan(173);
  });
});

test.describe('Curva de rendimientos', () => {
  test('el tramo 2a-10a de cada estado cuadra con su rótulo: normal 3,2 < 3,9 · plana 3,5 = 3,5 · invertida 4,0 > 3,5', async ({ page }) => {
    await abrir(page);
    const esperados: Record<string, [string, string]> = {
      Normal: ['3,2', '3,9'],
      Plana: ['3,5', '3,5'],
      Invertida: ['4,0', '3,5'],
    };
    for (const [estado, [dos, diez]] of Object.entries(esperados)) {
      const boton = page.getByRole('button', { name: estado, exact: true });
      await boton.click();
      await expect(boton).toHaveAttribute('aria-pressed', 'true');
      const grafico = page.getByRole('img', { name: `Curva de rendimientos en estado ${estado.toLowerCase()}` });
      // Las etiquetas de los puntos son las únicas con un decimal; orden 3m, 1a, 2a, 5a, 10a, 30a
      const etiquetas = (await grafico.locator('text').allTextContents()).filter((t) => /^\d,\d\s%$/.test(t));
      expect(etiquetas).toHaveLength(6);
      expect(etiquetas[2]).toMatch(new RegExp(`^${dos}\\s%$`));
      expect(etiquetas[4]).toMatch(new RegExp(`^${diez}\\s%$`));
    }
  });
});

test.describe('Indicadores', () => {
  test.beforeEach(async ({ page }) => {
    await abrir(page);
  });

  test.fail('HALLAZGO ABIERTO: el dato «Eurozona» de los Tipos de Interés Oficiales es el del BCE, no el de la Fed', async ({ page }) => {
    const detalle = await abrirIndicador(page, 'Tipos de Interés Oficiales');
    const eurozona = detalle.locator('div', { hasText: 'Eurozona' }).last().locator('strong');
    await expect(eurozona).toBeVisible();
    // Hoy: «Fed Funds rate (abr. 2024): 5,25-5,50% (tipos máximos desde 2001)»
    await expect(eurozona).not.toContainText('Fed');
  });

  test.fail('HALLAZGO ABIERTO: «Ver solo España» deja ver solo el dato de España', async ({ page }) => {
    const boton = page.getByRole('button', { name: 'Ver solo España' });
    await boton.click();
    await expect(boton).toHaveAttribute('aria-pressed', 'true');
    const detalle = await abrirIndicador(page, 'PIB Trimestral');
    await expect(detalle).toContainText('PIB España Q1 2024');
    // Hoy los dos datos siguen a la vista; el botón solo cambia qué recuadro lleva el borde
    await expect(detalle.getByText('PIB Eurozona Q1 2024')).toBeHidden();
  });

  test.fail('HALLAZGO ABIERTO: lo que se anuncia como «los datos actuales» no puede ser el tipo del BCE de abril de 2024', async ({ page }) => {
    // BCE: 4,50 % hasta el 12/06/2024 (primera bajada, 4,25 %); 2,65 % desde el 16/09/2026.
    const subtitulo = await page
      .getByRole('heading', { name: 'Indicadores leading, coincident y lagging' })
      .locator('xpath=following-sibling::p')
      .innerText();
    const detalle = await abrirIndicador(page, 'Tipos de Interés Oficiales');
    const espana = (await detalle.locator('div', { hasText: 'España' }).last().locator('strong').innerText()).trim();
    const prometeActuales = /datos actuales/i.test(subtitulo);
    const esDeAbril2024 = /abr\. 2024/.test(espana);
    expect(prometeActuales && esDeAbril2024, `«${subtitulo}» frente a «${espana}»`).toBe(false);
  });
});

test.describe('Accesibilidad', () => {
  test.fail('HALLAZGO ABIERTO: el texto blanco de «Sí» y «No» marcados llega a 4,5:1', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' }); // sin la transición de 0,2 s del fondo
    await abrir(page);
    const si = preguntas(page).nth(0).getByRole('button', { name: 'Sí', exact: true });
    const no = preguntas(page).nth(1).getByRole('button', { name: 'No', exact: true });
    await si.click();
    await no.click();
    await expect(si).toHaveAttribute('aria-pressed', 'true');
    await expect(no).toHaveAttribute('aria-pressed', 'true');
    // Hoy: blanco sobre #22c55e = 2,28:1 y sobre #ef4444 = 3,76:1, en los dos temas
    expect(await contrasteSobreFondoReal(si), 'Sí marcado').toBeGreaterThanOrEqual(4.5);
    expect(await contrasteSobreFondoReal(no), 'No marcado').toBeGreaterThanOrEqual(4.5);
  });

  test.fail('HALLAZGO ABIERTO: con «reducir movimiento» el punto del ciclo no arranca solo', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await abrir(page);
    const antes = await punto(page).getAttribute('cx');
    await page.waitForTimeout(1500);
    // Hoy avanza ~0,0008 de ciclo por fotograma (≈ 30 px/s) aunque el sistema pida reducirlo
    expect(await punto(page).getAttribute('cx')).toBe(antes);
  });

  test.fail('HALLAZGO ABIERTO: el aviso fijo «Este es un ejercicio educativo…» no es una alerta', async ({ page }) => {
    await abrir(page);
    await expect(page.getByText('Este es un ejercicio educativo. No constituye asesoramiento financiero.')).toBeVisible();
    await expect(page.locator('[role="alert"]', { hasText: 'ejercicio educativo' })).toHaveCount(0);
  });
});

test.describe('Textos', () => {
  test.beforeEach(async ({ page }) => {
    await abrir(page);
  });

  test.fail('HALLAZGO ABIERTO: el FAQPage da a la curva invertida el mismo horizonte que la página («6-24 meses»)', async ({ page }) => {
    const respuesta = await page.evaluate(() => {
      for (const s of Array.from(document.querySelectorAll('script[type="application/ld+json"]'))) {
        const j = JSON.parse(s.textContent ?? '{}') as { '@type'?: string; mainEntity?: { name: string; acceptedAnswer: { text: string } }[] };
        if (j['@type'] !== 'FAQPage') continue;
        const q = j.mainEntity?.find((e) => /curva de rendimientos invertida/.test(e.name));
        if (q) return q.acceptedAnswer.text;
      }
      return '';
    });
    const subtitulo = await page.getByText(/El predictor más fiable de recesiones/).innerText();
    const rango = (t: string): string | undefined => t.match(/(\d+)-24 meses/)?.[1];
    expect(rango(subtitulo)).toBe('6');
    // Hoy el FAQPage dice «un horizonte de 12-24 meses»
    expect(rango(respuesta)).toBe(rango(subtitulo));
  });

  test.fail('HALLAZGO ABIERTO: sin «Però» (catalán) ni «professional» (inglés) en los textos', async ({ page }) => {
    const bolsa = await abrirIndicador(page, 'Bolsa de Valores');
    await expect(bolsa).not.toContainText('Però');
    await responder(page, ['Sí', 'Sí', 'No', 'No', 'Sí', 'No']);
    await expect(resultado(page)).not.toContainText('professional');
  });

  test.fail('HALLAZGO ABIERTO: el porcentaje va separado de la cifra («3 %», no «3%»)', async ({ page }) => {
    const textos = await page.locator('header, section').allTextContents();
    const pegados = textos.join(' ').match(/\d%/g) ?? [];
    expect(pegados, `pegados: ${pegados.length}`).toHaveLength(0);
  });
});
