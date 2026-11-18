import { test, expect, devices, Page, Locator } from '@playwright/test';
import { esperarPaginaAsentada } from './_hidratacion';
import { comprobarFaqPageUnico } from './_faqpage-unico';

/**
 * Inspector — visualizador-ojo-humano-vision (segmento interactiva · suites estudiantes, cultura y salud)
 *
 * Primera inspección: 18/11/2026, con el cabo C0385 (prevalencia del daltonismo sin fuente). En su
 * <h1> la app promete «El Ojo Humano y la Visión», con «Anatomía interactiva del ojo, fotorreceptores,
 * defectos visuales y curiosidades». Tiene cuatro pestañas (Anatomía, Conos y bastones, Defectos y
 * Datos) con datos escritos a mano en page.tsx. No hay entradas ni motor de cálculo. Lo comprobable
 * es qué abre cada control, si los diagramas de los defectos muestran lo que dicen y si las cifras
 * cuadran entre sí y con su fuente.
 *
 * LOS CASOS, RESUELTOS A MANO ANTES DE ABRIR EL NAVEGADOR (.inspector-trabajo/ojo-esperados.mjs)
 *   CASO 1 (normal) — un clic en la córnea del diagrama abre la tarjeta «Córnea», y otro en el nervio
 *     óptico la cambia por la suya; un segundo clic en la tarjeta la cierra. Cifras:
 *     120.000.000 / 6.000.000 = 20 → «20:1» cuadra. Otras no: el nervio óptico «~8,75 Mbps» da
 *     8,75 × 10^6 × 3.600 = 31.500.000.000 bits/hora, frente a los «36.000 bits/hora» de Datos
 *     (875.000 veces menos). Y «~576 megapíxeles» no caben en «130 millones de fotorreceptores»
 *     (4,43 veces más) ni en «~1,2 millones de fibras» (480 veces más).
 *   CASO 2 (límite: los diagramas de los defectos y el defecto del cabo) — DefectoSVG dibuja la
 *     retina como M 260 43 A 90 62 0 0 1 260 167: la cuerda (124) es 2·ry, el centro está en
 *     (260, 105) y el borde posterior en x = 350. Miopía, foco en 270 (delante, bien). Hipermetropía,
 *     foco en 370 (detrás, bien). Presbicia, foco en 240 + 100 + 10 = 350: SOBRE la retina, que es
 *     el ojo que enfoca, mientras el rótulo dice «No enfoca de cerca». Daltonismo: con la fuente
 *     que ya cita simulador-daltonismo (de1a7007 y 99711f32), «cerca del 8 % de los hombres y el
 *     0,4 % de las mujeres de ascendencia europea (Birch, 2012)». Con el desglose de esa misma app,
 *     la dicromatopsia rojo-verde (protanopia + deuteranopia) es ~1 % + ~1 % = ~2 % de los hombres.
 *     La forma más frecuente es la deuteranomalía (~5 %), en la que no falta ningún cono.
 *   CASO 3 (operativa: la app no tiene entrada que rechazar) — teclado: las diez partes del diagrama
 *     llevan role="button" y tabIndex={0}, así que Enter o Espacio sobre «Córnea» deben abrir su
 *     tarjeta como el clic. Las tarjetas son <button> y responden. Pixel 7: sin desborde horizontal
 *     en las cuatro pestañas, y el dedo sobre el cristalino abre su tarjeta.
 *
 * FUENTES: Birch, J. (2012), «Worldwide prevalence of red-green color deficiency», JOSA A 29(3),
 * 313-320, como la cita simulador-daltonismo (no consultada directamente: está fuera de la red de
 * fuentes de la tarea). OMS, nota descriptiva «Blindness and vision impairment» (who.int, consultada
 * el 18/11/2026): «Globally, at least 2.2 billion people have a near or distance vision impairment».
 *
 * Los test con test.fail() son HALLAZGOS ABIERTOS (18/11/2026): describen lo que DEBERÍA pasar y
 * hoy no pasa. Al reparar cada uno se quita su test.fail() —comprobando antes que lo que afirma
 * sigue siendo lo correcto— y «ABIERTO» pasa a «REPARADO».
 */

test.use({ locale: 'es-ES', reducedMotion: 'reduce' });

const RUTA = '/visualizador-ojo-humano-vision/';

/** La tarjeta de una parte del ojo (<button aria-expanded>), por su nombre exacto. */
const tarjetaParte = (page: Page, nombre: string): Locator =>
  page.locator('button[aria-expanded]').filter({ has: page.locator('span', { hasText: new RegExp(`^${nombre}$`) }) });

/** La tarjeta de un defecto en su panel. */
const tarjetaDefecto = (page: Page, nombre: string): Locator =>
  page.locator('#panel-defectos button[aria-expanded]').filter({ hasText: nombre }).first();

/** Una parte del diagrama de anatomía (los <path>/<ellipse>/<circle> con role="button"). */
const parteSvg = (page: Page, etiqueta: string): Locator => page.locator(`svg [aria-label="${etiqueta}"]`);

async function pestana(page: Page, nombre: string): Promise<void> {
  const tab = page.getByRole('tab', { name: new RegExp(nombre) });
  await tab.click();
  await expect(tab).toHaveAttribute('aria-selected', 'true');
}

/**
 * Clic donde lo daría un usuario: sobre el TRAZO de la parte y en un punto que sea suyo. El centro
 * de la caja no sirve: el nervio óptico no tiene relleno y su centro cae fuera del trazo, y los
 * rayos de luz pasan por encima del centro de la córnea.
 */
async function clicEnTrazo(page: Page, etiqueta: string): Promise<void> {
  const parte = parteSvg(page, etiqueta);
  await parte.scrollIntoViewIfNeeded();
  const punto = await parte.evaluate((el) => {
    const g = el as unknown as SVGGeometryElement;
    const svg = g.ownerSVGElement;
    const m = g.getScreenCTM();
    if (!svg || !m) return null;
    const pt = svg.createSVGPoint();
    const largo = g.getTotalLength();
    for (const f of [0.5, 0.3, 0.7, 0.2, 0.8, 0.1, 0.9]) {
      const q = g.getPointAtLength(largo * f);
      pt.x = q.x;
      pt.y = q.y;
      const c = pt.matrixTransform(m);
      if (document.elementFromPoint(c.x, c.y) === el) return { x: c.x, y: c.y };
    }
    return null;
  });
  expect(punto, `hay un punto del trazo de «${etiqueta}» que recibe el clic`).not.toBeNull();
  await page.mouse.click(punto!.x, punto!.y);
}

/** «8,75» → 8.75 · «36.000» → 36000 (formato español del texto de la página). */
const aNumero = (s: string): number => Number(s.replace(/\./g, '').replace(',', '.'));

/** La respuesta de una pregunta del FAQPage (JSON-LD del layout). */
async function respuestaFaq(page: Page, pregunta: RegExp): Promise<string> {
  const respuestas = await page.evaluate(() => {
    const salida: { q: string; a: string }[] = [];
    for (const s of Array.from(document.querySelectorAll('script[type="application/ld+json"]'))) {
      const j = JSON.parse(s.textContent ?? '{}') as { '@type'?: string; mainEntity?: { name: string; acceptedAnswer: { text: string } }[] };
      if (j['@type'] !== 'FAQPage') continue;
      for (const e of j.mainEntity ?? []) salida.push({ q: e.name, a: e.acceptedAnswer.text });
    }
    return salida;
  });
  const r = respuestas.find((x) => pregunta.test(x.q));
  expect(r, `el FAQPage tiene la pregunta ${pregunta}`).toBeTruthy();
  return r!.a;
}

/** Texto de la guía educativa (montada siempre en el DOM, oculta por CSS mientras está plegada). */
const textoGuia = (page: Page): Promise<string> =>
  page.locator('[data-guia-educativa]').evaluate((e) => (e.textContent ?? '').replace(/\s+/g, ' '));

test.beforeEach(async ({ page }) => {
  await page.goto(RUTA);
  // Ningún input que sirva de testigo de hidratación: se espera a la página entera.
  await esperarPaginaAsentada(page);
});

test.describe('CASO 1 — Anatomía: el diagrama abre la tarjeta de cada parte', () => {
  test('clic en la córnea abre «Córnea»; clic en el nervio óptico la cambia; un segundo clic en la tarjeta la cierra', async ({ page }) => {
    await clicEnTrazo(page, 'Córnea');
    await expect(tarjetaParte(page, 'Córnea')).toHaveAttribute('aria-expanded', 'true');
    await expect(tarjetaParte(page, 'Córnea')).toContainText('Ventana transparente');

    await clicEnTrazo(page, 'Nervio óptico');
    await expect(tarjetaParte(page, 'Nervio óptico')).toHaveAttribute('aria-expanded', 'true');
    await expect(tarjetaParte(page, 'Córnea')).toHaveAttribute('aria-expanded', 'false');
    await expect(tarjetaParte(page, 'Nervio óptico')).toContainText('~1,2 millones de fibras');

    await tarjetaParte(page, 'Nervio óptico').click();
    await expect(tarjetaParte(page, 'Nervio óptico')).toHaveAttribute('aria-expanded', 'false');
  });

  test('conos y bastones: 120.000.000 / 6.000.000 = 20, el «20:1» que da la app', async ({ page }) => {
    await pestana(page, 'Conos y bastones');
    const panel = page.locator('#panel-conos-bastones');
    await expect(panel.getByText('120.000.000', { exact: true })).toBeVisible();
    await expect(panel.getByText('6.000.000', { exact: true })).toBeVisible();
    expect(120_000_000 / 6_000_000).toBe(20);
    await expect(panel.getByText('20:1', { exact: true })).toBeVisible();
  });

  test('HALLAZGO (18/11/2026, ABIERTO) · «~8,75 Mbps» del nervio óptico y «36.000 bits/hora» de Datos se contradicen', async ({ page }) => {
    // ABIERTO: 8,75 Mbps × 3.600 s = 31.500.000.000 bits/hora; la pestaña Datos (cifra y curiosidad)
    // dice 36.000 bits/hora, 875.000 veces menos. Ninguna de las dos lleva fuente. Se exige que las
    // dos cifras estén dentro de un orden de magnitud (factor 10), como mínimo.
    test.fail();
    await tarjetaParte(page, 'Nervio óptico').click();
    const dato = await tarjetaParte(page, 'Nervio óptico').innerText();
    const mbps = aNumero(/~([\d.,]+)\s*Mbps/.exec(dato)?.[1] ?? 'NaN');
    expect(mbps).toBe(8.75);

    await pestana(page, 'Datos');
    const tarjeta = page.locator('#panel-datos').getByText('Bits/hora procesados por el ojo').locator('..');
    const bitsHora = aNumero(/([\d.]+)/.exec(await tarjeta.innerText())?.[1] ?? 'NaN');
    expect(bitsHora).toBe(36000);

    const cociente = bitsHora / (mbps * 1e6 * 3600);
    expect(cociente, 'bits/hora de Datos frente a los Mbps del nervio óptico').toBeGreaterThan(0.1);
    expect(cociente).toBeLessThan(10);
  });

  test('HALLAZGO (18/11/2026, ABIERTO) · «~576 megapíxeles» no caben en «130 millones de fotorreceptores»', async ({ page }) => {
    // ABIERTO: el «Dato clave» de Datos dice que la retina tiene «una resolución equivalente a ~576
    // megapíxeles». La tarjeta Retina dice que tiene 130 millones de fotorreceptores: 4,43 veces
    // menos. El nervio óptico saca ~1,2 millones de fibras: 480 veces menos. La misma frase admite
    // que fuera de la fóvea la resolución es baja.
    test.fail();
    await tarjetaParte(page, 'Retina').click();
    const retina = await tarjetaParte(page, 'Retina').innerText();
    const fotorreceptores = aNumero(/(\d+)\s*millones de fotorreceptores/.exec(retina)?.[1] ?? 'NaN') * 1e6;
    expect(fotorreceptores).toBe(130e6);

    await pestana(page, 'Datos');
    const clave = await page.locator('#panel-datos').getByText('Dato clave:').locator('..').innerText();
    const mp = /~?([\d.,]+)\s*megapíxeles/.exec(clave);
    const pixeles = mp ? aNumero(mp[1]) * 1e6 : 0;
    expect(pixeles, 'la resolución «equivalente» no puede superar el número de fotorreceptores').toBeLessThanOrEqual(fotorreceptores);
  });
});

test.describe('CASO 2 — Defectos: lo que dibuja cada diagrama y el defecto del cabo', () => {
  test.beforeEach(async ({ page }) => {
    await pestana(page, 'Defectos');
  });

  /** Borde posterior de la retina y x de los focos del diagrama abierto. */
  async function geometria(tarjeta: Locator): Promise<{ retinaMaxX: number; focos: number[] }> {
    return tarjeta.evaluate((el) => {
      const svg = el.querySelector('svg');
      const retina = svg?.querySelector('path') as SVGGraphicsElement | null;
      const caja = retina ? retina.getBBox() : { x: NaN, width: NaN };
      const focos = Array.from(svg?.querySelectorAll('circle') ?? []).map((c) => Number(c.getAttribute('cx')));
      return { retinaMaxX: caja.x + caja.width, focos };
    });
  }

  test('miopía enfoca delante de la retina (x 270 < 350) e hipermetropía detrás (370 > 350)', async ({ page }) => {
    const miopia = tarjetaDefecto(page, 'Miopía');
    await miopia.click();
    await expect(miopia).toHaveAttribute('aria-expanded', 'true');
    const gm = await geometria(miopia);
    expect(gm.retinaMaxX).toBeCloseTo(350, 0);
    expect(gm.focos).toEqual([270]);
    await expect(miopia).toContainText('Foco antes de retina');

    const hiper = tarjetaDefecto(page, 'Hipermetropía');
    await hiper.click();
    const gh = await geometria(hiper);
    expect(gh.focos).toEqual([370]);
    expect(gh.focos[0]).toBeGreaterThan(gh.retinaMaxX);
  });

  test('HALLAZGO (18/11/2026, ABIERTO) · presbicia: el foco cae sobre la retina y el rótulo dice «No enfoca de cerca»', async ({ page }) => {
    // ABIERTO: la retina del diagrama acaba en x = 350 (centro 260 + rx 90) y el foco de la presbicia
    // va en eyeCx + eyeRx + 10 = 350: los rayos convergen en la retina, como en un ojo que enfoca.
    // Si no enfoca de cerca, el foco del objeto cercano debe quedar detrás, como en la hipermetropía.
    test.fail();
    const presbicia = tarjetaDefecto(page, 'Presbicia');
    await presbicia.click();
    await expect(presbicia).toContainText('No enfoca de cerca');
    const g = await geometria(presbicia);
    expect(g.focos).toHaveLength(1);
    expect(g.focos[0] - g.retinaMaxX, 'foco detrás de la retina (en píxeles del diagrama)').toBeGreaterThan(5);
  });

  test('HALLAZGO (18/11/2026, ABIERTO, cabo C0385) · prevalencia del daltonismo: 0,4 % de mujeres y con su fuente (Birch, 2012)', async ({ page }) => {
    // ABIERTO: en cuatro sitios dice «8 % de los hombres y 0,5 % de las mujeres», sin fuente y con el
    // % pegado: la ficha («Afecta al 8% de los hombres y al 0,5% de las mujeres (gen ligado al
    // cromosoma X)»), la leyenda del diagrama («8% hombres / 0,5% mujeres (cromosoma X)»), la guía
    // («8% de hombres vs 0,5% de mujeres») y el FAQPage («alrededor del 8% de los hombres y el 0,5%
    // de las mujeres en poblaciones de origen europeo»). simulador-daltonismo, que cita a Birch
    // (2012), dice «cerca del 8 % de los hombres y el 0,4 % de las mujeres de ascendencia europea».
    test.fail();
    const daltonismo = tarjetaDefecto(page, 'Daltonismo');
    await daltonismo.click();
    await expect(daltonismo).toHaveAttribute('aria-expanded', 'true');
    const sitios: [string, string][] = [
      ['ficha y leyenda del diagrama', await daltonismo.innerText()],
      ['guía «Daltonismo y genética»', await textoGuia(page)],
      ['FAQPage', await respuestaFaq(page, /daltonismo/i)],
    ];
    for (const [donde, texto] of sitios) {
      expect.soft(texto, `${donde}: sin «0,5 %» de mujeres`).not.toMatch(/0,5[  ]?%\s*(de\s*)?(las\s*)?mujeres/);
      expect.soft(texto, `${donde}: 0,4 % de mujeres`).toMatch(/0,4[  ]%/);
      expect.soft(texto, `${donde}: cita la fuente`).toMatch(/Birch/);
    }
  });

  test('HALLAZGO (18/11/2026, ABIERTO) · el 8 % no es de la dicromatopsia: la forma más frecuente no carece de ningún cono', async ({ page }) => {
    // ABIERTO: el FAQPage dice «La forma más frecuente es la dicromatopsia rojo-verde, que afecta a
    // alrededor del 8% de los hombres». Con el desglose de simulador-daltonismo (Birch, 2012),
    // protanopia ~1 % + deuteranopia ~1 % = ~2 %, y la forma más frecuente es la deuteranomalía
    // (~5 %): es tricromacia anómala, con los tres conos. El diagrama de la ficha lleva el mismo
    // sesgo: «Daltonismo: falta 1 tipo de cono», con el cono L tachado.
    test.fail();
    const faq = await respuestaFaq(page, /daltonismo/i);
    expect.soft(faq).not.toMatch(/dicromatopsia rojo-verde, que afecta a alrededor del 8/);
    const daltonismo = tarjetaDefecto(page, 'Daltonismo');
    await daltonismo.click();
    expect.soft(await daltonismo.locator('svg text').first().textContent()).not.toBe('Daltonismo: falta 1 tipo de cono');
  });
});

test.describe('CASO 3 — Operativa con teclado', () => {
  test('las tarjetas de las partes se abren con Enter (alternativa al diagrama)', async ({ page }) => {
    await tarjetaParte(page, 'Cristalino').focus();
    await page.keyboard.press('Enter');
    await expect(tarjetaParte(page, 'Cristalino')).toHaveAttribute('aria-expanded', 'true');
    await page.keyboard.press('Space');
    await expect(tarjetaParte(page, 'Cristalino')).toHaveAttribute('aria-expanded', 'false');
  });

  test('HALLAZGO (18/11/2026, ABIERTO) · las partes del diagrama son botones enfocables que no responden a Enter ni a Espacio', async ({ page }) => {
    // ABIERTO: las diez partes (Humor vítreo, Retina, Fóvea, Punto ciego, Nervio óptico, Córnea,
    // Humor acuoso, Iris superior e inferior, Cristalino) llevan role="button" y tabIndex={0}, pero
    // solo onClick. Son diez paradas de tabulación antes de las tarjetas, y el lector anuncia
    // «botón» pero no pasa nada al pulsar.
    test.fail();
    const cornea = parteSvg(page, 'Córnea');
    await cornea.focus();
    await expect(cornea).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(tarjetaParte(page, 'Córnea')).toHaveAttribute('aria-expanded', 'true', { timeout: 2000 });
  });

  test('HALLAZGO (18/11/2026, ABIERTO) · tres de las cuatro pestañas apuntan con aria-controls a un panel que no existe', async ({ page }) => {
    // ABIERTO: solo se monta el panel activo; «Conos y bastones», «Defectos» y «Datos» apuntan a
    // panel-conos-bastones, panel-defectos y panel-datos, que no están en el DOM con Anatomía activa.
    test.fail();
    const rotos = await page.evaluate(() =>
      Array.from(document.querySelectorAll('[role="tab"]'))
        .map((t) => t.getAttribute('aria-controls') ?? '')
        .filter((id) => !document.getElementById(id)),
    );
    expect(rotos).toEqual([]);
  });
});

test.describe('Contenido (18/11/2026)', () => {
  test('HALLAZGO (18/11/2026, ABIERTO) · el aviso de salud solo está dentro de la guía, plegada', async ({ page }) => {
    // ABIERTO: data/applications.ts pone la app en la suite «salud», y page.tsx se declara
    // `// @disclaimer: exempt`, sin DisclaimerCard. La única advertencia, «no sustituye en ningún
    // caso la consulta con un profesional de la salud visual», está en <EducationalSection
    // defaultOpen={false}>. CLAUDE.md: nunca ocultar ahí una advertencia de responsabilidad.
    test.fail();
    await expect(page.getByText('no sustituye en ningún caso la consulta con un profesional', { exact: false })).toBeVisible({ timeout: 2000 });
  });

  test('HALLAZGO (18/11/2026, ABIERTO) · cifras populares sin fuente (neutralidad editorial, regla 1)', async ({ page }) => {
    // ABIERTO: «Más del 60% de la población mundial necesita corrección visual» (la OMS da «al menos
    // 2.200 millones de personas» con deficiencia visual de cerca o de lejos) y «La pupila se dilata
    // hasta un 45%». Ninguna lleva fuente ni año. La descripción del hallazgo trae la lista completa.
    test.fail();
    await pestana(page, 'Defectos');
    const intro = await page.locator('#panel-defectos p').first().innerText();
    expect.soft(intro, 'la cifra mundial cita su fuente').toMatch(/OMS|\(\d{4}\)/);
    await pestana(page, 'Datos');
    const pupila = await page.locator('#panel-datos').getByText(/La pupila se dilata/).innerText();
    expect.soft(pupila, 'la cifra de la pupila cita su fuente').toMatch(/\(\d{4}\)|según/);
  });

  test('HALLAZGO (18/11/2026, ABIERTO) · el % va pegado a la cifra (CLAUDE.md global §2)', async ({ page }) => {
    // ABIERTO: «~70%», «80%», «50%», «100%», «8%», «0,5%», «45%», «60%» en page.tsx y metadata.ts.
    // Desde el 25/09/2026 va separado con espacio duro: «70 %».
    test.fail();
    await pestana(page, 'Defectos');
    const intro = await page.locator('#panel-defectos p').first().innerText();
    expect.soft(intro).not.toMatch(/\d%/);
    expect.soft(await textoGuia(page)).not.toMatch(/\d%/);
  });

  test('HALLAZGO (18/11/2026, ABIERTO) · las cinco preguntas del FAQPage no están en la página', async ({ page }) => {
    // ABIERTO: el faqJsonLd trae 5 preguntas y la página no pinta ninguna FAQ. §1.ter pide que salgan
    // de PREGUNTAS_FRECUENTES, y que page.tsx la importe para pintarlas (cabo C0593).
    test.fail();
    await comprobarFaqPageUnico(page);
  });
});

test.describe('Móvil (Pixel 7)', () => {
  const pixel = devices['Pixel 7'];
  test.use({
    viewport: pixel.viewport,
    userAgent: pixel.userAgent,
    deviceScaleFactor: pixel.deviceScaleFactor,
    isMobile: pixel.isMobile,
    hasTouch: pixel.hasTouch,
  });

  test('con el dedo el cristalino abre su tarjeta, y ninguna pestaña desborda en horizontal', async ({ page }) => {
    const desborde = (): Promise<number> =>
      page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(await desborde()).toBeLessThanOrEqual(0);

    const cristalino = parteSvg(page, 'Cristalino');
    await cristalino.scrollIntoViewIfNeeded();
    const caja = await cristalino.boundingBox();
    expect(caja).not.toBeNull();
    await page.touchscreen.tap(caja!.x + caja!.width / 2, caja!.y + caja!.height / 2);
    await expect(tarjetaParte(page, 'Cristalino')).toHaveAttribute('aria-expanded', 'true');

    for (const t of ['Conos y bastones', 'Defectos', 'Datos']) {
      await page.getByRole('tab', { name: new RegExp(t) }).tap();
      await expect(page.getByRole('tab', { name: new RegExp(t) })).toHaveAttribute('aria-selected', 'true');
      if (t === 'Defectos') {
        await tarjetaDefecto(page, 'Daltonismo').tap();
        await expect(tarjetaDefecto(page, 'Daltonismo')).toHaveAttribute('aria-expanded', 'true');
      }
      expect(await desborde(), `pestaña ${t}`).toBeLessThanOrEqual(0);
    }
  });
});
