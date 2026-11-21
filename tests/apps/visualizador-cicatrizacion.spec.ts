import { test, expect, devices, type Page, type Locator } from '@playwright/test';
import { activarTema, prepararParaMedir } from '../contraste-text-muted-auxiliares';

/**
 * Inspector — visualizador-cicatrizacion (segmento interactiva, riesgo 2, primera inspección)
 *
 * Generado por el Inspector (modo tarea) el 21/11/2026.
 *
 * QUÉ PROMETE LA APP
 *   <h1> «Visualizador de la Cicatrización»; subtítulo «Las 4 fases de reparación de heridas:
 *   hemostasia, inflamación, proliferación y remodelado». Metadata: las 4 fases, «remodelado
 *   (hasta 2 años)», tipos de heridas y factores. Suites salud + estudiantes + cultura: por la
 *   regla multi-suite de _private/DISCLAIMER-POLICY.md manda la de salud (nivel 2 ALTO).
 *   No hay ninguna cifra que calcular: la verdad comprobable es OPERATIVA (cuatro secciones con
 *   aria-pressed, línea temporal de 4 fases, 7 células conmutables, 3 tipos de cierre, 10
 *   factores en acordeón con un único abierto) y de COHERENCIA del contenido consigo mismo.
 *
 * DÓNDE VIVEN LOS DATOS
 *   app/visualizador-cicatrizacion/page.tsx: FASES, CELULAS, TIPOS_CIERRE, FACTORES_POSITIVOS y
 *   FACTORES_NEGATIVOS en el propio componente; la tabla, la FAQ visible y los consejos, escritos
 *   a mano en <EducationalSection>. metadata.ts: jsonLd (sin features) y faqJsonLd (5 preguntas
 *   distintas de las 6 visibles: dos FAQ con preguntas distintas no son hallazgo; sí lo es que el
 *   FAQPage contradiga a la página en una cifra). Sin data/ ni lib/.
 *
 * FUENTE: el cotejo de los días de cada fase con NCBI/StatPearls (NBK535406) no se pudo hacer:
 *   www.ncbi.nlm.nih.gov no está en red-fuentes-oficiales.txt y WebFetch se denegó. Por eso los
 *   casos de duraciones comparan la app CONSIGO MISMA (timeline, ficha, tabla y FAQPage), que es
 *   verdad comprobable sin fuente externa: dos cifras distintas para la misma fase no pueden ser
 *   ciertas a la vez.
 *
 * LOS TRES CASOS, RESUELTOS A MANO ANTES DE ABRIR EL NAVEGADOR
 *
 *   CASO 1 (normal, escritorio 1280 px)
 *     Al cargar: «Las 4 fases» con aria-pressed=true y las otras tres secciones a false; en la
 *     línea temporal solo «Hemostasia» pulsada (useState 'hemostasia') y la ficha «Fase 1:
 *     Hemostasia · Segundos a minutos». Pulsar «Proliferación» → pulsados false,false,true,false;
 *     ficha «Fase 3: Proliferación», duración «Días a semanas (4-21 días)», células Fibroblastos,
 *     Miofibroblastos, Queratinocitos y Células endoteliales; mediadores VEGF, TGF-β, EGF, FGF,
 *     PDGF y Colágeno tipo III (array FASES[2]). La tabla de la guía da «4–21 días» y el FAQPage
 *     «proliferación (4-21 días)»: las tres coinciden.
 *
 *   CASO 2 (límite: la última fase, la última célula, el último tipo y el último factor)
 *     «Remodelado» → «Fase 4: Remodelado», «Semanas a años (hasta 2 años)» y el proceso
 *     «Resistencia final: máximo 70-80% del tejido original». Ir a «Células» y volver conserva la
 *     fase (el estado vive en el padre, la sección solo se desmonta). La 7.ª célula
 *     (Queratinocitos) se abre y, pulsada otra vez, se cierra y vuelve el texto de ayuda
 *     (prev === id ? null : id). «Tercera intención» → «deja abierta 4-5 días antes de suturar».
 *     Factores: un solo estado `factorExpandido` para las dos columnas → abrir el primero
 *     (Nutrición) y luego el último (Radioterapia) deja 1 abierto, el último; pulsarlo otra vez
 *     deja 0.
 *
 *   CASO 3 (móvil Pixel 7, 412 × 839, táctil)
 *     Línea temporal flex-wrap con min-width 120 px → dos filas de dos; sin desbordamiento
 *     horizontal en ninguna sección ni con la guía abierta (la tabla tiene min-width 540 px pero
 *     va dentro de .tableWrapper con overflow-x: auto). Un toque en «Remodelado» abre su ficha;
 *     «Tipos de herida» → toque en «Tercera intención» abre la suya.
 *
 *   Y LO QUE DEBE TRATARSE APARTE (hallazgos, en test.fail() con su número cuando se registre)
 *     · Contraste, calculado a mano con la luminancia WCAG antes de medir: #f1c40f sobre blanco
 *       1,66:1, #e67e22 2,85, #27ae60 2,87, #e74c3c 3,82; sobre #2D2D2D (tarjeta oscura) #e74c3c
 *       3,61, #8e44ad 2,35. El título de fase (19,2 px negrita, texto grande, 3:1) suspende en
 *       claro en Inflamación, Proliferación y Remodelado; el «Procesos principales» (13,6 px,
 *       4,5:1) en las cuatro; el número blanco del círculo (12 px) sobre su color, en las cuatro
 *       y en los dos temas. Medido: las mismas cifras (3,60 la de #e74c3c en oscuro).
 *     · Especificidad: `[data-theme='dark'] .navBtn` (0,2,0) pisa a `.navBtnActivo` (0,1,0), y
 *       lo mismo .timelineItem, .celulaCard y .tipoBtn → en oscuro el botón activo se pinta igual
 *       que los demás. Medido: fondo rgb(45,45,45) y borde #444 en activos e inactivos de los
 *       cuatro grupos (y texto #B0B0B0 en secciones y tipos de cierre).
 *     · Coherencia: «Resistencia completa en semanas» (primera intención) contra «máximo 70-80%»
 *       y «nunca recupera el 100%» de la fase 4; FAQPage «hemostasia (0-24 horas)» e «inflamación
 *       (1-4 días)» contra «Segundos–15 min» y «1–5 días» de la tabla; MMPs (enzimas, la propia
 *       ficha las llama metaloproteasas) como «Células protagonistas» en la tabla.
 *
 * Los casos se ejecutaron antes contra http://localhost:3052/visualizador-cicatrizacion/ (next
 * start) con Playwright desde .inspector-trabajo/ y coincidieron con la resolución a mano.
 */

const RUTA = '/visualizador-cicatrizacion/';

/** Espera a que React haya colgado sus props del primer botón de sección: antes, un clic se pierde. */
async function irAlVisualizador(page: Page): Promise<void> {
  await page.goto(RUTA, { waitUntil: 'domcontentloaded', timeout: 60_000 });
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Visualizador de la Cicatrización', {
    timeout: 60_000,
  });
  await page.waitForFunction(
    () => {
      const b = document.querySelector('nav[aria-label="Secciones del visualizador"] button');
      return Boolean(b && Object.keys(b).some((k) => k.startsWith('__reactProps$')));
    },
    undefined,
    { timeout: 20_000 },
  );
}

function botonesSeccion(page: Page): Locator {
  return page.locator('nav[aria-label="Secciones del visualizador"] button');
}

function seccion(page: Page, nombre: string): Locator {
  return botonesSeccion(page).filter({ hasText: nombre });
}

/** Botones conmutables de la sección visible (fases, células o tipos de cierre). */
function conmutadores(page: Page): Locator {
  return page.locator('main section button[aria-pressed]');
}

function tituloFicha(page: Page): Locator {
  return page.locator('main h3').first();
}

async function pulsados(page: Page): Promise<string[]> {
  return conmutadores(page).evaluateAll((bs) => bs.map((b) => b.getAttribute('aria-pressed') ?? ''));
}

interface Medida {
  texto: string;
  ratio: number;
  umbral: number;
}

/**
 * Contraste WCAG contra el fondo que se ve, componiendo las capas semitransparentes. A diferencia
 * de tests/apps/_contraste.ts, entiende el `color(srgb r g b / a)` con canales 0-1 que Chrome da
 * como valor calculado de un `color-mix()` (fondos de .timelineItemActivo, .tagFase…).
 */
async function medir(el: Locator): Promise<Medida> {
  return el.evaluate((nodo) => {
    const leer = (s: string): number[] => {
      const n = (s.match(/-?[\d.]+(?:e-?\d+)?/g) ?? []).map(Number);
      const a = n.length > 3 ? n[3] : 1;
      return s.trim().startsWith('color(') ? [n[0] * 255, n[1] * 255, n[2] * 255, a] : [n[0], n[1], n[2], a];
    };
    const lum = ([r, g, b]: number[]): number => {
      const f = (c: number) => {
        const x = c / 255;
        return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
      };
      return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
    };
    const capas: number[][] = [];
    for (let n: Element | null = nodo; n; n = n.parentElement) {
      const c = leer(getComputedStyle(n).backgroundColor);
      if (c[3] > 0) {
        capas.push(c);
        if (c[3] >= 1) break;
      }
    }
    let fondo = [255, 255, 255];
    for (let i = capas.length - 1; i >= 0; i--) {
      const [r, g, b, a] = capas[i];
      fondo = [r * a + fondo[0] * (1 - a), g * a + fondo[1] * (1 - a), b * a + fondo[2] * (1 - a)];
    }
    const cs = getComputedStyle(nodo);
    const t = leer(cs.color);
    const texto = [0, 1, 2].map((i) => t[i] * t[3] + fondo[i] * (1 - t[3]));
    const l1 = lum(texto);
    const l2 = lum(fondo);
    const px = parseFloat(cs.fontSize);
    const grande = px >= 24 || (px >= 18.66 && Number(cs.fontWeight) >= 700);
    return {
      texto: (nodo.textContent ?? '').trim().slice(0, 40),
      ratio: (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05),
      umbral: grande ? 3 : 4.5,
    };
  });
}

/** Lo que suspende de una lista de medidas, legible en el mensaje del expect. */
function suspensos(medidas: Medida[]): string[] {
  return medidas.filter((m) => m.ratio < m.umbral).map((m) => `«${m.texto}» ${m.ratio.toFixed(2)}:1 < ${m.umbral}`);
}

/** Todas las medidas de color de dato (fase, célula, tipo de cierre) en el tema activo. */
async function medidasColorDeDato(page: Page): Promise<Medida[]> {
  const out: Medida[] = [];
  await seccion(page, 'Las 4 fases').click();
  for (const nombre of ['Hemostasia', 'Inflamación', 'Proliferación', 'Remodelado']) {
    const boton = conmutadores(page).filter({ hasText: nombre });
    await boton.click();
    await expect(tituloFicha(page)).toContainText(nombre);
    out.push(await medir(tituloFicha(page)));
    out.push(await medir(page.locator('main h4').first()));
    out.push(await medir(boton.locator('[class*="_timelineNumero"]')));
  }
  await seccion(page, 'Células protagonistas').click();
  const n = await conmutadores(page).count();
  for (let i = 0; i < n; i++) {
    await conmutadores(page).nth(i).click();
    await expect(conmutadores(page).nth(i)).toHaveAttribute('aria-pressed', 'true');
    out.push(await medir(tituloFicha(page)));
    out.push(await medir(page.locator('main [class*="_celulaDetalle"] [class*="_tagFase"]').first()));
  }
  await seccion(page, 'Tipos de herida').click();
  for (const nombre of ['Primera intención', 'Segunda intención', 'Tercera intención']) {
    const boton = conmutadores(page).filter({ hasText: nombre });
    await boton.click();
    await expect(tituloFicha(page)).toHaveText(nombre);
    out.push(await medir(boton.locator('span').nth(1)));
    out.push(await medir(tituloFicha(page)));
    out.push(await medir(page.locator('main h4').first()));
  }
  return out;
}

/** Final del intervalo en minutos: «Segundos–15 min» → 15; «3 semanas a 2 años» → 1.051.200. */
function finDelIntervalo(texto: string): number {
  const minutos: Record<string, number> = { min: 1, h: 60, d: 1440, s: 10080, a: 525600 };
  const casos = [...texto.matchAll(/(\d+)\s*(min(?:utos)?|h(?:oras)?|d[ií]as?|semanas?|años?)\b/gi)];
  if (!casos.length) throw new Error(`Sin intervalo con unidad en «${texto}»`);
  const [, n, unidad] = casos[casos.length - 1];
  const clave = unidad.toLowerCase().startsWith('min') ? 'min' : unidad[0].toLowerCase().replace('í', 'i');
  return Number(n) * minutos[clave];
}

interface NodoJsonLd {
  '@type'?: string;
  featureList?: string[] | string;
  features?: string[];
  mainEntity?: { name: string; acceptedAnswer: { text: string } }[];
}

async function jsonLd(page: Page): Promise<NodoJsonLd[]> {
  return page.locator('script[type="application/ld+json"]').evaluateAll((ss) =>
    ss.map((s) => JSON.parse(s.textContent ?? '{}') as NodoJsonLd),
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CASO 1 — normal (escritorio)
// ─────────────────────────────────────────────────────────────────────────────

test('CASO 1: arranca en «Las 4 fases» con Hemostasia, y Proliferación abre su ficha de 4-21 días', async ({ page }) => {
  test.setTimeout(90_000);
  await irAlVisualizador(page);

  expect(await botonesSeccion(page).evaluateAll((bs) => bs.map((b) => b.getAttribute('aria-pressed')))).toEqual([
    'true',
    'false',
    'false',
    'false',
  ]);
  expect(await pulsados(page)).toEqual(['true', 'false', 'false', 'false']);
  await expect(tituloFicha(page)).toHaveText('Fase 1: Hemostasia');
  await expect(tituloFicha(page).locator('xpath=following-sibling::p')).toContainText('Segundos a minutos');

  await conmutadores(page).filter({ hasText: 'Proliferación' }).click();
  expect(await pulsados(page)).toEqual(['false', 'false', 'true', 'false']);
  await expect(tituloFicha(page)).toHaveText('Fase 3: Proliferación');
  await expect(tituloFicha(page).locator('xpath=following-sibling::p')).toContainText('Días a semanas (4-21 días)');
  await expect(page.locator('main [class*="_tagCelula"]')).toHaveText([
    'Fibroblastos',
    'Miofibroblastos',
    'Queratinocitos',
    'Células endoteliales',
  ]);
  await expect(page.locator('main [class*="_tagMediador"]')).toHaveText(['VEGF', 'TGF-β', 'EGF', 'FGF', 'PDGF', 'Colágeno tipo III']);

  // La misma fase en la tabla de la guía y en el FAQPage: 4-21 días en los tres sitios.
  await page.getByRole('button', { name: 'Ver guía educativa' }).click();
  const fila = page.locator('table tbody tr').filter({ hasText: 'Proliferación' });
  await expect(fila.locator('td').nth(1)).toHaveText('4–21 días');
  const faq = (await jsonLd(page)).find((n) => n['@type'] === 'FAQPage');
  expect(faq?.mainEntity?.[0].acceptedAnswer.text).toContain('proliferación (4-21 días)');
});

// ─────────────────────────────────────────────────────────────────────────────
// CASO 2 — límite: la última fase, célula, tipo y factor
// ─────────────────────────────────────────────────────────────────────────────

test('CASO 2: Remodelado sobrevive al cambio de sección; la última célula y el último factor conmutan', async ({ page }) => {
  test.setTimeout(90_000);
  await irAlVisualizador(page);

  await conmutadores(page).filter({ hasText: 'Remodelado' }).click();
  expect(await pulsados(page)).toEqual(['false', 'false', 'false', 'true']);
  await expect(tituloFicha(page)).toHaveText('Fase 4: Remodelado');
  await expect(tituloFicha(page).locator('xpath=following-sibling::p')).toContainText('Semanas a años (hasta 2 años)');
  await expect(page.locator('main ul li').filter({ hasText: 'Resistencia final' })).toContainText('máximo 70-80');

  // Ida y vuelta de sección: la fase elegida se conserva (estado en el padre).
  await seccion(page, 'Células protagonistas').click();
  await expect(seccion(page, 'Células protagonistas')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByText('Selecciona una célula para ver su función detallada')).toBeVisible();
  await seccion(page, 'Las 4 fases').click();
  await expect(tituloFicha(page)).toHaveText('Fase 4: Remodelado');

  // La 7.ª célula abre y, pulsada otra vez, cierra.
  await seccion(page, 'Células protagonistas').click();
  await expect(conmutadores(page)).toHaveCount(7);
  const ultima = conmutadores(page).last();
  await ultima.click();
  await expect(ultima).toHaveAttribute('aria-pressed', 'true');
  await expect(tituloFicha(page)).toHaveText('Queratinocitos');
  await ultima.click();
  await expect(ultima).toHaveAttribute('aria-pressed', 'false');
  await expect(page.getByText('Selecciona una célula para ver su función detallada')).toBeVisible();

  // El último tipo de cierre.
  await seccion(page, 'Tipos de herida').click();
  await conmutadores(page).filter({ hasText: 'Tercera intención' }).click();
  expect(await pulsados(page)).toEqual(['false', 'false', 'true']);
  await expect(page.locator('main [class*="_tipoDetalleDesc"]')).toContainText('deja abierta 4-5 días antes de suturar');

  // Acordeón de factores: un solo abierto entre las dos columnas.
  await seccion(page, 'Factores').click();
  const factores = page.locator('main section button[aria-expanded]');
  await expect(factores).toHaveCount(10);
  await factores.first().click();
  await expect(factores.first()).toHaveAttribute('aria-expanded', 'true');
  await factores.last().click();
  await expect(factores.first()).toHaveAttribute('aria-expanded', 'false');
  await expect(factores.last()).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('main [class*="_factorDetalle"]')).toHaveCount(1);
  await expect(page.locator('main [class*="_factorDetalle"]')).toContainText('radiación');
  await factores.last().click();
  await expect(page.locator('main [class*="_factorDetalle"]')).toHaveCount(0);
});

// ─────────────────────────────────────────────────────────────────────────────
// CASO 3 — móvil Pixel 7
// ─────────────────────────────────────────────────────────────────────────────

const PIXEL_7 = devices['Pixel 7'];

test.describe('CASO 3 · móvil Pixel 7', () => {
  test.use({
    viewport: PIXEL_7.viewport,
    userAgent: PIXEL_7.userAgent,
    deviceScaleFactor: PIXEL_7.deviceScaleFactor,
    isMobile: PIXEL_7.isMobile,
    hasTouch: PIXEL_7.hasTouch,
  });

  test('sin scroll horizontal, la línea temporal en 2 × 2 y los toques abren su ficha', async ({ page }) => {
    test.setTimeout(90_000);
    await irAlVisualizador(page);
    const desborde = () =>
      page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(await desborde()).toBeLessThanOrEqual(0);

    // Dos filas de dos: las dos primeras comparten «y», y la tercera baja.
    const cajas = await conmutadores(page).evaluateAll((bs) =>
      bs.map((b) => {
        const r = b.getBoundingClientRect();
        return { y: r.y, height: r.height };
      }),
    );
    expect(cajas).toHaveLength(4);
    expect(Math.round(cajas[0].y)).toBe(Math.round(cajas[1].y));
    expect(cajas[2].y).toBeGreaterThan(cajas[0].y);
    for (const c of cajas) expect(c.height).toBeGreaterThanOrEqual(44);

    const remodelado = conmutadores(page).filter({ hasText: 'Remodelado' });
    await remodelado.scrollIntoViewIfNeeded();
    await remodelado.tap();
    await expect(tituloFicha(page)).toHaveText('Fase 4: Remodelado');

    await seccion(page, 'Tipos de herida').tap();
    await conmutadores(page).filter({ hasText: 'Tercera intención' }).tap();
    await expect(tituloFicha(page)).toHaveText('Tercera intención');
    expect(await desborde()).toBeLessThanOrEqual(0);

    await seccion(page, 'Factores').tap();
    expect(await desborde()).toBeLessThanOrEqual(0);
    await page.getByRole('button', { name: 'Ver guía educativa' }).tap();
    await expect(page.locator('table')).toBeVisible();
    expect(await desborde()).toBeLessThanOrEqual(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// HALLAZGOS (21/11/2026): los test con test.fail() describen lo que DEBERÍA pasar. El día que se
// reparen fallarán por pasar: quitar el test.fail() y cambiar ABIERTO por REPARADO. Reparados en
// /reparar del 21/11/2026 todos menos 5382, reparado ese mismo día tras la decisión del usuario.
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Hallazgos de contenido', () => {
  test('HALLAZGO 5380 (21/11/2026, REPARADO) · riesgo 2: aviso sanitario visible sin desplegar nada', async ({ page }) => {
    // Suites salud + estudiantes + cultura → nivel 2 ALTO (DISCLAIMER-POLICY §3, regla
    // multi-suite): DisclaimerCard severity high, no colapsable, fuera de <EducationalSection>.
    // La app iba `// @disclaimer: exempt` y daba consejos de cuidado de heridas solo dentro de la
    // guía plegada. Ahora monta el DisclaimerCard médico tras el aviso legal (como
    // visualizador-ciclo-viral, hallazgo 1358).
    test.setTimeout(60_000);
    await irAlVisualizador(page);
    await expect(page.getByRole('button', { name: 'Ver guía educativa' })).toHaveAttribute('aria-expanded', 'false');
    const aviso = page.locator('[class*="disclaimerCard"]').first();
    await expect(aviso).toBeVisible({ timeout: 5_000 });
    await expect(aviso).toContainText('profesional sanitario');
  });

  test('HALLAZGO 5381 (21/11/2026, REPARADO) · primera intención no puede prometer «resistencia completa en semanas»', async ({ page }) => {
    // La propia app: fase 4 «Resistencia final: máximo 70-80% del tejido original», su resumen
    // «nunca recupera el 100% de la resistencia original» y la FAQ «hasta 2 años… solo alcanza el
    // 70-80%». ENTRADA Tipos de herida → Primera intención → ESPERADO un resultado coherente con
    // eso · ANTES «Cicatriz mínima. Resistencia completa en semanas.»
    test.setTimeout(60_000);
    await irAlVisualizador(page);
    await seccion(page, 'Tipos de herida').click();
    await conmutadores(page).filter({ hasText: 'Primera intención' }).click();
    const resultado = page.locator('main [class*="_tipoDetalleResultado"]');
    await expect(resultado).not.toContainText(/resistencia completa/i, { timeout: 5_000 });
    await expect(resultado).toContainText('70-80');
  });

  test('HALLAZGO 5382 (21/11/2026, REPARADO) · el FAQPage no da a hemostasia e inflamación otra duración que la página', async ({ page }) => {
    // ANTES, FAQPage: «hemostasia (0-24 horas)», «inflamación (1-4 días)», frente a la tabla de la
    // guía «Segundos–15 min» y «1–5 días» y la línea temporal «Segundos a minutos». Sin fuente
    // legible para elegir la cifra (StatPearls NBK535406 responde con un reCAPTCHA a la descarga),
    // el usuario decidió en /reparar pendientes del 21/11/2026 matizar sin cifra (criterio C0203):
    // el FAQPage describe esas dos fases sin intervalo («en los primeros minutos», «durante los
    // primeros días») y no contradice a la página. Proliferación (21 días) y remodelado (2 años)
    // coinciden con la tabla y conservan su intervalo.
    test.setTimeout(60_000);
    await irAlVisualizador(page);
    const faq = (await jsonLd(page)).find((n) => n['@type'] === 'FAQPage');
    const respuesta = faq?.mainEntity?.[0].acceptedAnswer.text ?? '';
    expect(respuesta).not.toMatch(/0-24 horas|1-4 días/);
    for (const fase of ['Hemostasia', 'Inflamación']) {
      expect(respuesta, `${fase} sin intervalo en el FAQPage`).not.toMatch(new RegExp(`${fase}\\s*\\(`, 'i'));
    }
    expect(respuesta).toContain('hemostasia, en los primeros minutos');
    expect(respuesta).toContain('inflamación, durante los primeros días');
    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
    const distintas: string[] = [];
    for (const fase of ['Proliferación', 'Remodelado']) {
      const enFaq = respuesta.match(new RegExp(`${fase}\\s*\\(([^)]+)\\)`, 'i'))?.[1] ?? '';
      const celda = (await page.locator('table tbody tr').filter({ hasText: fase }).locator('td').nth(1).textContent()) ?? '';
      const enTabla = celda.replace(/\(.*\)/, '').trim();
      if (finDelIntervalo(enFaq) !== finDelIntervalo(enTabla)) distintas.push(`${fase}: FAQPage «${enFaq}» · tabla «${enTabla}»`);
    }
    expect(distintas).toEqual([]);
  });

  test('HALLAZGO 5387 (21/11/2026, REPARADO) · el jsonLd declara al menos 4 características', async ({ page }) => {
    // CLAUDE.md §1.ter: `features` con 4-8 características reales. ESPERADO ≥ 4 · ANTES ninguna.
    test.setTimeout(60_000);
    await irAlVisualizador(page);
    const app = (await jsonLd(page)).find((n) => n['@type'] === 'WebApplication');
    const lista = app?.featureList ?? app?.features ?? [];
    expect(Array.isArray(lista) ? lista.length : String(lista).split(',').length).toBeGreaterThanOrEqual(4);
  });

  test('HALLAZGO 5383 (21/11/2026, REPARADO) · los neutrófilos son el leucocito más abundante, no la célula más abundante de la sangre', async ({ page }) => {
    // La propia ficha dice «(50-70% de leucocitos)»; visualizador-sangre-componentes (con fuente
    // MSD Manual) da eritrocitos ≥ 4 millones/µL frente a 4.500-11.000 leucocitos/µL y llama a
    // los neutrófilos «el leucocito más abundante». ENTRADA Células → Neutrófilos → ESPERADO «el
    // leucocito más abundante» · ANTES «Son las células más abundantes en sangre».
    test.setTimeout(60_000);
    await irAlVisualizador(page);
    await seccion(page, 'Células protagonistas').click();
    await conmutadores(page).filter({ hasText: 'Neutrófilos' }).click();
    const dato = page.locator('main [class*="_warningBox"] p');
    await expect(dato).not.toContainText('células más abundantes en sangre', { timeout: 5_000 });
    await expect(dato).toContainText('leucocito más abundante');
  });

  test('HALLAZGO 5388 (21/11/2026, REPARADO) · la tabla no pone las MMPs (enzimas) entre las células del remodelado', async ({ page }) => {
    // La ficha de la fase 4 da «Células protagonistas: Fibroblastos, Macrófagos residuales» y pone
    // las MMPs entre los mediadores («MMPs (metaloproteasas)»). ENTRADA guía → tabla, fila
    // Remodelado, columna «Células protagonistas» → ESPERADO sin MMPs · ANTES «MMPs, fibroblastos».
    test.setTimeout(60_000);
    await irAlVisualizador(page);
    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
    const celda = page.locator('table tbody tr').filter({ hasText: 'Remodelado' }).locator('td').nth(2);
    await expect(celda).not.toContainText('MMPs', { timeout: 5_000 });
    await expect(celda).toHaveText('Fibroblastos, macrófagos');
  });

  test('HALLAZGO 5390 (21/11/2026, REPARADO) · formato: «70-80 %» con espacio duro y «48-72 h»', async ({ page }) => {
    // CLAUDE.md global §2 (25/09/2026): el % separado con U+00A0; las horas, «24 h». ENTRADA fase
    // Remodelado y fase Inflamación → ESPERADO «70-80 %» y «48-72 h» · OBTENIDO «70-80%» y
    // «48-72h» (también «50-70%», «40%», «100%», «24h»). REPARADO (hallazgo 5390).
    test.setTimeout(60_000);
    await irAlVisualizador(page);
    await conmutadores(page).filter({ hasText: 'Remodelado' }).click();
    const remodelado = (await page.locator('main section').textContent()) ?? '';
    expect(remodelado).toContain('70-80 %');
    await conmutadores(page).filter({ hasText: 'Inflamación' }).click();
    const inflamacion = (await page.locator('main section').textContent()) ?? '';
    expect(inflamacion).not.toMatch(/\d+h\b/);
  });

  test('HALLAZGO 5389 (21/11/2026, REPARADO: sin cifra) · «un 40% más rápido» con apósito húmedo lleva fuente y año', async ({ page }) => {
    // CLAUDE.md §1.quinquies, antipatrón 1: cifra redonda sin fuente. ENTRADA Factores → Ambiente
    // húmedo → ESPERADO la cifra con su fuente (autor/año) o sin cifra · ANTES «cicatrizan un
    // 40% más rápido que las expuestas al aire» sin fuente. Se quitó la cifra.
    test.setTimeout(60_000);
    await irAlVisualizador(page);
    await seccion(page, 'Factores').click();
    await page.locator('main section button[aria-expanded]').filter({ hasText: 'Ambiente húmedo' }).click();
    const texto = (await page.locator('main [class*="_factorDetalle"]').textContent()) ?? '';
    // Control: el detalle abierto es el de la humedad
    expect(texto).toContain('humedad');
    const conCifra = /\b40\s?%/.test(texto);
    expect(!conCifra || /\b(19|20)\d{2}\b/.test(texto), texto).toBe(true);
  });
});

test.describe('Hallazgos de accesibilidad y modo oscuro', () => {
  test('HALLAZGO 5385 (21/11/2026, REPARADO) · claro: el color de fase, célula y tipo como texto, y el blanco sobre él, llegan a su umbral', async ({ page }) => {
    // Medido en claro (umbral 3:1 si ≥ 18,66 px negrita, 4,5:1 si no): «Fase 3: Proliferación»
    // 1,66, «Fase 2: Inflamación» 2,85, «Fase 4: Remodelado» 2,87; sus «Procesos principales» igual
    // y el de Hemostasia 3,82; los números blancos de la línea temporal 3,82 / 2,85 / 1,66 / 2,87;
    // «Macrófagos M1» 2,19, sus etiquetas de fase 1,95; «Primera intención» blanco sobre verde
    // 2,87, «Segunda» sobre naranja 2,85. REPARADO (hallazgo 5385): tono legible por tema con
    // tonoSobre y relleno/tinta con rellenoConTinta (coloresDeDato en la página).
    test.setTimeout(120_000);
    await irAlVisualizador(page);
    await prepararParaMedir(page);
    await activarTema(page, 'light');
    expect(suspensos(await medidasColorDeDato(page))).toEqual([]);
  });

  test('HALLAZGO 5385 (21/11/2026, REPARADO) · oscuro: el color de fase, célula y tipo como texto, y el blanco sobre él, llegan a su umbral', async ({ page }) => {
    // Medido en oscuro sobre #2D2D2D: «Procesos principales» de Hemostasia 3,60; «Miofibroblastos»
    // 2,35, «Queratinocitos» 2,95, «Fibroblastos» 3,20 y sus etiquetas 2,11-2,74; «Tercera
    // intención» 2,35; y los números blancos de la línea temporal, iguales que en claro.
    // REPARADO (hallazgo 5385).
    test.setTimeout(120_000);
    await irAlVisualizador(page);
    await prepararParaMedir(page);
    await activarTema(page, 'dark');
    expect(suspensos(await medidasColorDeDato(page))).toEqual([]);
  });

  test('HALLAZGO 5384 (21/11/2026, REPARADO) · oscuro: la sección, la fase, la célula y el tipo activos se distinguen de los demás', async ({ page }) => {
    // `[data-theme='dark'] .navBtn|.timelineItem|.celulaCard|.tipoBtn` (especificidad 0,2,0) pisa
    // a `.navBtnActivo|.timelineItemActivo|.celulaCardActiva|.tipoBtnActivo` (0,1,0). ENTRADA tema
    // oscuro, la 1.ª de cada grupo activa → ESPERADO su fondo, borde o texto distinto del de las
    // inactivas (en claro lo es) · ANTES los cuatro grupos idénticos: rgb(45,45,45), #444.
    // REPARADO (hallazgo 5384): reglas oscuras de los activos con la misma especificidad, después.
    test.setTimeout(90_000);
    await irAlVisualizador(page);
    await prepararParaMedir(page);
    await activarTema(page, 'dark');
    const firma = (b: Locator) =>
      b.evaluate((el) => {
        const cs = getComputedStyle(el);
        return `${cs.backgroundColor}|${cs.borderTopColor}|${cs.color}`;
      });
    const iguales: string[] = [];
    const comparar = async (grupo: string, selector: string) => {
      const activo = page.locator(`${selector}[aria-pressed="true"]`).first();
      const inactivo = page.locator(`${selector}[aria-pressed="false"]`).first();
      if ((await firma(activo)) === (await firma(inactivo))) iguales.push(grupo);
    };
    const SECCION = 'nav[aria-label="Secciones del visualizador"] button';
    const CONMUTADOR = 'main section button';
    await page.mouse.move(0, 0);
    await comparar('sección', SECCION);
    await comparar('fase', CONMUTADOR);
    await seccion(page, 'Células protagonistas').click();
    await conmutadores(page).first().click();
    await page.mouse.move(0, 0);
    await comparar('célula', CONMUTADOR);
    await seccion(page, 'Tipos de herida').click();
    await page.mouse.move(0, 0);
    await comparar('tipo de cierre', CONMUTADOR);
    expect(iguales).toEqual([]);
  });

  test('HALLAZGO 5386 (21/11/2026, REPARADO) · tokens de marca sobre sus tintes: etiquetas y duración activa a 4,5:1', async ({ page }) => {
    // Medido: etiqueta de célula (--primary-texto sobre su tinte) 3,91:1 en oscuro; etiqueta de
    // mediador (--secondary-texto) 4,49:1 en claro; duración de la fase activa (--text-muted
    // sobre el tinte de la fase) 4,49:1 en claro. Texto de 11,5-12,5 px: 4,5:1.
    // REPARADO (hallazgo 5386): etiquetas en --text-primary sobre su tinte y la duración activa en
    // --text-secondary.
    test.setTimeout(90_000);
    await irAlVisualizador(page);
    await prepararParaMedir(page);
    const medidas: Medida[] = [];
    for (const tema of ['light', 'dark'] as const) {
      await activarTema(page, tema);
      await seccion(page, 'Las 4 fases').click();
      await conmutadores(page).filter({ hasText: 'Hemostasia' }).click();
      medidas.push(await medir(page.locator('main [class*="_tagCelula"]').first()));
      medidas.push(await medir(page.locator('main [class*="_tagMediador"]').first()));
      medidas.push(await medir(conmutadores(page).first().locator('[class*="_timelineDuracion"]')));
    }
    expect(suspensos(medidas)).toEqual([]);
  });
});
