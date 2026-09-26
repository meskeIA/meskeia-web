import { test, expect, Page, Locator } from '@playwright/test';
import { esperarPaginaAsentada, esperarValorEnReact } from './_hidratacion';

/**
 * Inspector — etiqueta-dgt (segmento cálculo, riesgo 2)
 *
 * Primera inspección: 25/09/2026. La app promete en su <h1> «¿Qué etiqueta DGT tiene tu coche?»
 * y en la metadata «Descubre la etiqueta medioambiental DGT de tu vehículo (CERO, ECO, C, B o
 * sin etiqueta)». La etiqueta la decide la DGT, y la regla es pública.
 *
 * DÓNDE VIVE EL CÁLCULO
 *   app/etiqueta-dgt/page.tsx — `calcularEtiqueta` (l. 307-337), dentro del componente, sin motor
 *   aparte. Pide combustible y, SOLO para gasolina y diésel, el año; para el PHEV, si «supera» los
 *   40 km de autonomía. No pide mes, norma Euro ni categoría del vehículo.
 *
 * LA FUENTE (consultada el 25/09/2026, no la memoria)
 *   DGT, «Distintivo ambiental»
 *   https://www.dgt.es/nuestros-servicios/tu-vehiculo/tus-vehiculos/distintivo-ambiental/
 *     · CERO (AZUL): BEV, REEV, PHEV «con una autonomía de 40 km», pila de combustible.
 *     · ECO (verde y azul): PHEV < 40 km, HEV, gas (GNC, GNL) o GLP. «Deben cumplir los criterios
 *       de la etiqueta C».
 *     · C (VERDE): turismos y furgonetas ligeras de gasolina «matriculadas a partir de enero de
 *       2006 y diésel a partir de septiembre de 2015» (gasolina Euro 4/5/6, diésel Euro 6).
 *     · B (AMARILLA): gasolina «desde el 1 de enero de 2001 y diésel a partir de 2006».
 *   Las fechas son la aproximación de la norma Euro; manda la norma Euro que figura en el
 *   Registro de Vehículos (la sede de la DGT la da por matrícula).
 *
 * LOS CASOS, RESUELTOS A MANO ANTES DE ABRIR EL NAVEGADOR
 *   Normal   · gasolina 2010 → C (2010 ≥ enero 2006) · diésel 2010 → B (≥ 2006 y < sept. 2015)
 *   Frontera · gasolina 2000 → sin etiqueta, 2001 → B (B desde el 01/01/2001)
 *              gasolina 2005 → B, 2006 → C · diésel 2005 → sin etiqueta, 2006 → B
 *              diésel 2014 → B (la C del diésel empieza en septiembre de 2015)
 *              diésel 2015 → B o C según la norma Euro: con solo el año NO se puede afirmar C
 *              PHEV de 40 km exactos → CERO («autonomía de 40 km»)
 *   Rechazo  · gasolina 2027 (año futuro) → aviso, sin resultado
 *   Imposible· gas (GNC/GLP) → ECO, nunca CERO
 *
 * REPARADOS el 26/09/2026 (hallazgos 2034-2048): los quince casos ya sin test.fail.
 *   Cambios de forma que los casos recogen: el gas y el diésel de 2015 piden además año y mes;
 *   la autonomía del PHEV se pregunta como «40 km o más» (valores cuarentaOMas / menos).
 *
 * HALLAZGOS DE LA PRIMERA INSPECCIÓN
 *   CASO 10 alto   · gas natural / GLP sale CERO; la DGT le da ECO (y solo si cumple la C).
 *   CASO 11 medio  · los colores: pinta y describe la C «amarilla» y la B «verde»; son al revés.
 *   CASO 12 medio  · diésel 2015 sale C sin aviso; la C del diésel empieza en septiembre de 2015.
 *   CASO 13 medio  · un coche matriculado este año se rechaza («entre 1990 y 2025»).
 *   CASO 14 medio  · la FAQ (JSON-LD) dice «diésel desde 2014» C y «gasolina entre 2000 y 2005» B.
 *   CASO 15 medio  · el aviso de error, #dc2626 en línea, da 2,85:1 sobre el panel oscuro.
 *   CASO 16 medio  · la insignia «Libre acceso» da 2,88:1 en claro.
 *   CASO 17 bajo   · un gasolina de 1989 se rechaza en vez de salir «sin etiqueta».
 *   CASO 18 bajo   · la pregunta del PHEV («¿supera los 40 km?») deja fuera los 40 km exactos.
 *   CASO 19 bajo   · recomienda el «Plan MOVES III», que terminó en 2025 (hoy, Programa Auto+).
 *   CASO 20 bajo   · atribuye las ZBE a la «Ley de Residuos… (Real Decreto-ley 7/2022)».
 *   CASO 21 bajo   · «ECO» blanco sobre el degradado de marca da < 3:1 en oscuro.
 *   CASO 22 bajo   · el título del resultado dice «Etiqueta Sin etiqueta».
 *   CASO 23 bajo   · PHEV sin contestar la autonomía: el botón no hace nada ni dice nada.
 *   CASO 24 bajo   · el aviso de «consulta el portal oficial» solo está en la sección colapsada.
 */

const RUTA = '/etiqueta-dgt/';

type Combustible = 'bev' | 'phev' | 'hev' | 'gnc' | 'gasolina' | 'diesel';

const resultado = (page: Page): Locator =>
  page.locator('section[aria-label="Resultado de la etiqueta DGT"]');

const tituloResultado = (page: Page): Locator => resultado(page).locator('h2');

/**
 * El <select> no lleva rastreador de valor (React solo lo instala en input y textarea), así que
 * `esperarHidratacion` no sirve para el primer control de la app. El testigo equivalente es que
 * React haya colgado sus props del nodo: sin ellas, elegir una opción cambia el DOM y no el estado.
 */
async function abrir(page: Page): Promise<void> {
  await page.goto(RUTA);
  await page.waitForFunction(
    () => {
      const s = document.querySelector('#combustible');
      return Boolean(s) && Object.keys(s as Element).some((k) => k.startsWith('__reactProps$'));
    },
    null,
    { timeout: 20_000 },
  );
}

async function consultar(
  page: Page,
  combustible: Combustible,
  opciones: { anio?: number; mes?: number; autonomia?: 'cuarentaOMas' | 'menos' } = {},
): Promise<void> {
  await page.selectOption('#combustible', combustible);
  await esperarValorEnReact(page, '#combustible', combustible);
  if (opciones.anio !== undefined) {
    await page.fill('#anioMatriculacion', String(opciones.anio));
    await esperarValorEnReact(page, '#anioMatriculacion', String(opciones.anio));
  }
  if (opciones.mes !== undefined) {
    await page.selectOption('#mesMatriculacion', String(opciones.mes));
    await esperarValorEnReact(page, '#mesMatriculacion', String(opciones.mes));
  }
  if (opciones.autonomia !== undefined) {
    await page.selectOption('#autonomiaPhev', opciones.autonomia);
    await esperarValorEnReact(page, '#autonomiaPhev', opciones.autonomia);
  }
  await page.getByRole('button', { name: /Calcular etiqueta DGT/ }).click();
}

/**
 * Lee una medida hasta que deja de moverse: justo después de cambiar de tema el color computado
 * es un fotograma intermedio de la transición.
 */
async function esperarEstable<T>(leer: () => Promise<T>): Promise<T> {
  let anterior = await leer();
  for (let i = 0; i < 30; i++) {
    await new Promise((r) => setTimeout(r, 100));
    const actual = await leer();
    if (JSON.stringify(actual) === JSON.stringify(anterior)) return actual;
    anterior = actual;
  }
  return anterior;
}

/** Contraste WCAG del texto contra su fondo EFECTIVO (translúcidos compuestos sobre el opaco). */
async function contrasteEfectivo(el: Locator): Promise<number> {
  return el.evaluate((nodo) => {
    const rgba = (c: string): number[] => {
      const n = (c.match(/[\d.]+/g) ?? []).map(Number);
      return [n[0], n[1], n[2], n.length > 3 ? n[3] : 1];
    };
    const capas: number[][] = [];
    for (let e: Element | null = nodo; e; e = e.parentElement) {
      const c = rgba(getComputedStyle(e).backgroundColor);
      if (c[3] > 0) capas.push(c);
      if (c[3] >= 1) break;
    }
    let fondo = [255, 255, 255];
    for (const c of capas.reverse()) fondo = fondo.map((v, i) => v * (1 - c[3]) + c[i] * c[3]);
    const lum = ([r, g, b]: number[]): number => {
      const f = (v: number): number => {
        const s = v / 255;
        return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
      };
      return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
    };
    const a = lum(rgba(getComputedStyle(nodo).color));
    const b = lum(fondo);
    return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
  });
}

/**
 * Contraste del texto blanco en el CENTRO del círculo de la etiqueta, que lleva un degradado de
 * dos paradas: en el centro (t = 0,5) el color es la media de las dos.
 */
async function contrasteBlancoEnCentroDelDegradado(circulo: Locator): Promise<number> {
  return circulo.evaluate((nodo) => {
    const img = getComputedStyle(nodo).backgroundImage;
    const paradas = [...img.matchAll(/rgba?\(([^)]+)\)/g)].map((m) => m[1].split(/[ ,]+/).map(Number));
    if (paradas.length < 2) return 0;
    const centro = [0, 1, 2].map((i) => (paradas[0][i] + paradas[paradas.length - 1][i]) / 2);
    const f = (v: number): number => {
      const s = v / 255;
      return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
    };
    const l = 0.2126 * f(centro[0]) + 0.7152 * f(centro[1]) + 0.0722 * f(centro[2]);
    return 1.05 / (l + 0.05);
  });
}

async function pasarAOscuro(page: Page): Promise<void> {
  await esperarPaginaAsentada(page);
  await page.getByRole('button', { name: 'Cambiar a modo oscuro' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
}

test.describe('etiqueta-dgt — la etiqueta que da la DGT', () => {
  test.beforeEach(async ({ page }) => {
    await abrir(page);
  });

  // ───────────────────────── Casos que hoy se cumplen ─────────────────────────

  test('CASO 1 · gasolina de 2010 → C (DGT: gasolina matriculada a partir de enero de 2006)', async ({ page }) => {
    await consultar(page, 'gasolina', { anio: 2010 });
    await expect(tituloResultado(page)).toHaveText('Etiqueta C');
  });

  test('CASO 2 · diésel de 2010 → B (DGT: diésel a partir de 2006; la C, desde septiembre de 2015)', async ({ page }) => {
    await consultar(page, 'diesel', { anio: 2010 });
    await expect(tituloResultado(page)).toHaveText('Etiqueta B');
  });

  test('CASO 3 · frontera gasolina 2000/2001 → sin etiqueta / B (DGT: B desde el 01/01/2001)', async ({ page }) => {
    await consultar(page, 'gasolina', { anio: 2000 });
    await expect(tituloResultado(page)).toContainText('Sin etiqueta');
    await consultar(page, 'gasolina', { anio: 2001 });
    await expect(tituloResultado(page)).toHaveText('Etiqueta B');
  });

  test('CASO 4 · frontera gasolina 2005/2006 → B / C (DGT: C desde enero de 2006)', async ({ page }) => {
    await consultar(page, 'gasolina', { anio: 2005 });
    await expect(tituloResultado(page)).toHaveText('Etiqueta B');
    await consultar(page, 'gasolina', { anio: 2006 });
    await expect(tituloResultado(page)).toHaveText('Etiqueta C');
  });

  test('CASO 5 · frontera diésel 2005/2006 → sin etiqueta / B (DGT: B del diésel a partir de 2006)', async ({ page }) => {
    await consultar(page, 'diesel', { anio: 2005 });
    await expect(tituloResultado(page)).toContainText('Sin etiqueta');
    await consultar(page, 'diesel', { anio: 2006 });
    await expect(tituloResultado(page)).toHaveText('Etiqueta B');
  });

  test('CASO 6 · diésel de 2014 → B (DGT: la C del diésel empieza en septiembre de 2015)', async ({ page }) => {
    await consultar(page, 'diesel', { anio: 2014 });
    await expect(tituloResultado(page)).toHaveText('Etiqueta B');
  });

  test('CASO 7 · BEV → CERO, HEV → ECO, PHEV ≥ 40 km → CERO, PHEV < 40 km → ECO', async ({ page }) => {
    await consultar(page, 'bev');
    await expect(tituloResultado(page)).toHaveText('Etiqueta CERO');
    await consultar(page, 'hev');
    await expect(tituloResultado(page)).toHaveText('Etiqueta ECO');
    await consultar(page, 'phev', { autonomia: 'cuarentaOMas' });
    await expect(tituloResultado(page)).toHaveText('Etiqueta CERO');
    await consultar(page, 'phev', { autonomia: 'menos' });
    await expect(tituloResultado(page)).toHaveText('Etiqueta ECO');
  });

  test('CASO 8 · un año futuro (el que viene) se rechaza con aviso y sin resultado', async ({ page }) => {
    // Del reloj, no fijo: con 2027 escrito a mano el caso caducaba en 2027 (la forma del 2037).
    await consultar(page, 'gasolina', { anio: new Date().getFullYear() + 1 });
    await expect(page.locator('#errorAnio')).toBeVisible();
    await expect(resultado(page)).toHaveCount(0);
  });

  // ───────────────────────── Hallazgos abiertos ─────────────────────────

  /**
   * CASO 10 (alto, cálculo) — page.tsx:312 junta el gas con el eléctrico: `bev || gnc` → 'cero'.
   * La DGT da ECO a los «propulsados por gas natural y gas (GNC y GNL) o GLP» y exige además que
   * cumplan los criterios de la C. La descripción de la CERO (l. 254) y el bloque educativo
   * (l. 683) repiten el error; la FAQ de la propia app (metadata.ts:81) dice ECO.
   */
  test('CASO 10 · gas natural / GLP → ECO, no CERO; y sin la C por fecha, tampoco ECO', async ({ page }) => {
    // Reparado el 26/09/2026. La ECO del gas exige «cumplir los criterios de la etiqueta C» (DGT),
    // así que la app pide ahora el año también al gas: 2010 (≥ enero 2006) → ECO; 2003 → no llega
    // a la C, y por fecha su norma Euro de gasolina es la 3 → B, con el matiz a la vista.
    await consultar(page, 'gnc', { anio: 2010 });
    await expect(tituloResultado(page)).toHaveText('Etiqueta ECO', { timeout: 3000 });
    await consultar(page, 'gnc', { anio: 2003 });
    await expect(tituloResultado(page)).toHaveText('Etiqueta B');
    await expect(resultado(page)).toContainText('criterios de la etiqueta C');
  });

  /**
   * CASO 11 (medio, dato) — la DGT: CERO azul, C VERDE, B AMARILLA. La app describe la C como
   * «Etiqueta amarilla» (l. 274) y la pinta #d97706; la B como «Etiqueta verde» (l. 284) y la
   * pinta #65a30d; la CERO, verde #16a34a («verde oscuro» en l. 681). Justo las dos más comunes
   * cambiadas de color: quien busca su pegatina por el color lee la contraria.
   */
  test('CASO 11 · la C se describe verde y la B amarilla, como las pinta la DGT', async ({ page }) => {
    await consultar(page, 'gasolina', { anio: 2010 });
    // DEBERÍA: la descripción de la C dice «verde». Obtenido: «… Etiqueta amarilla.»
    await expect(resultado(page).locator('p').first()).toContainText('verde', { timeout: 3000 });
    await consultar(page, 'diesel', { anio: 2010 });
    await expect(resultado(page).locator('p').first()).toContainText('amarilla', { timeout: 3000 });
  });

  /**
   * CASO 12 (medio, cálculo) — la DGT da la C al diésel «a partir de septiembre de 2015»; un diésel
   * de enero a agosto de 2015 es, por fecha, B (Euro 5), salvo que su ficha diga Euro 6. La app
   * responde «Etiqueta C» a todo 2015 (l. 331) y afirma «diésel matriculado desde 2015 (Euro 6)»,
   * sin decir en ningún sitio que manda la norma Euro de la ficha ni que la DGT lo da por matrícula.
   */
  test('CASO 12 · un diésel de 2015 pide el mes: agosto → B (con el matiz Euro 6), septiembre → C', async ({ page }) => {
    // Reparado el 26/09/2026. El caso original esperaba un resultado con solo el año más un aviso;
    // la reparación elegida es preguntar el mes, que es lo que decide según la DGT («a partir de
    // septiembre de 2015»). Sin mes, no hay resultado sino un aviso que lo pide.
    await consultar(page, 'diesel', { anio: 2015 });
    await expect(resultado(page)).toHaveCount(0);
    await expect(page.locator('#errorMes')).toContainText('septiembre de 2015');
    await consultar(page, 'diesel', { anio: 2015, mes: 8 });
    await expect(tituloResultado(page)).toHaveText('Etiqueta B', { timeout: 3000 });
    // innerText: un matiz escondido en la sección educativa colapsada no cuenta como reparación.
    await expect(page.locator('main')).toContainText(/ficha técnica dice Euro 6/i, { useInnerText: true });
    await consultar(page, 'diesel', { anio: 2015, mes: 9 });
    await expect(tituloResultado(page)).toHaveText('Etiqueta C');
    await expect(resultado(page)).toContainText(/norma Euro/i, { useInnerText: true });
  });

  /**
   * CASO 13 (medio, operativa) — `anioActual = 2025` fijo (l. 440). Un gasolina matriculado este
   * año es C (a partir de enero de 2006), y la app responde «Introduce un año entre 1990 y 2025».
   * El año se toma del reloj para que el caso no caduque.
   */
  test('CASO 13 · un gasolina matriculado este año sale C, no se rechaza', async ({ page }) => {
    await consultar(page, 'gasolina', { anio: new Date().getFullYear() });
    // DEBERÍA: «Etiqueta C». Obtenido (2026): «Introduce un año entre 1990 y 2025».
    await expect(tituloResultado(page)).toHaveText('Etiqueta C', { timeout: 3000 });
  });

  /**
   * CASO 14 (medio, contenido) — la FAQ del JSON-LD (metadata.ts:81), la que leen los asistentes
   * de IA, dice «diésel desde 2014 llevan la etiqueta C» y «gasolina entre 2000 y 2005 … la B».
   * La DGT: diésel C desde septiembre de 2015; gasolina B desde el 01/01/2001. Y contradice a la
   * propia app, que da B al diésel de 2014 (CASO 6).
   */
  test('CASO 14 · la FAQ no fecha la C del diésel en 2014 ni la B de la gasolina en 2000', async ({ page }) => {
    const faq = await page
      .locator('script[type="application/ld+json"]')
      .evaluateAll((els) => els.map((e) => e.textContent ?? '').find((t) => t.includes('FAQPage')) ?? '');
    expect(faq).toContain('FAQPage');
    expect(faq).not.toMatch(/diésel desde 2014/);
    expect(faq).not.toMatch(/gasolina entre 2000 y 2005/);
  });

  /**
   * CASO 15 (medio, accesibilidad) — la forma del 1665: el aviso de error lleva el color en línea,
   * `style={{ color: '#dc2626' }}` (l. 561). En claro cumple (4,83:1 sobre #FFFFFF); en oscuro queda
   * sobre el panel --bg-card #2D2D2D a 2,85:1, en texto de 14 px, que exige 4,5:1.
   */
  test('CASO 15 · el aviso de año inválido se lee también en tema oscuro (4,5:1 o más)', async ({ page }) => {
    await consultar(page, 'gasolina', { anio: new Date().getFullYear() + 1 });
    const aviso = page.locator('#errorAnio');
    await expect(aviso).toBeVisible();
    // En claro: #dc2626 sobre #FFFFFF = 4,83:1
    expect(await esperarEstable(() => contrasteEfectivo(aviso)), 'aviso en claro').toBeGreaterThanOrEqual(4.5);
    await pasarAOscuro(page);
    // DEBERÍA: 4,5:1 también en oscuro. Obtenido: 2,85:1.
    expect(await esperarEstable(() => contrasteEfectivo(aviso)), 'aviso en oscuro').toBeGreaterThanOrEqual(4.5);
  });

  /**
   * CASO 16 (medio, accesibilidad) — las insignias de acceso (EtiquetaDgt.module.css:305-333) son
   * texto de 12,8 px en negrita: exigen 4,5:1. En claro, «Libre acceso» (#16a34a sobre su tinte
   * verde) da 2,88:1; «Prohibido» 4,01:1 y «Con restricciones» 4,42:1. En oscuro, «Prohibido» 4,39:1.
   */
  test('CASO 16 · la insignia «Libre acceso» alcanza 4,5:1 en claro', async ({ page }) => {
    await consultar(page, 'gasolina', { anio: 2010 });
    const libre = resultado(page).locator('[class*="zbeLibre"]').first();
    await expect(libre).toContainText('Libre acceso');
    await esperarPaginaAsentada(page);
    // DEBERÍA: ≥ 4,5:1. Obtenido: 2,88:1.
    expect(await esperarEstable(() => contrasteEfectivo(libre))).toBeGreaterThanOrEqual(4.5);
    // Y las otras dos del acta: «Con restricciones» (diésel 2010) y «Prohibido» (diésel 2000),
    // en claro y en oscuro.
    await consultar(page, 'diesel', { anio: 2010 });
    const restr = resultado(page).locator('[class*="zbeRestriccion"]').first();
    await expect(restr).toContainText('Con restricciones');
    expect(await esperarEstable(() => contrasteEfectivo(restr)), 'restricción en claro').toBeGreaterThanOrEqual(4.5);
    await consultar(page, 'diesel', { anio: 2000 });
    const prohibido = resultado(page).locator('[class*="zbeProhibido"]').first();
    await expect(prohibido).toContainText('Prohibido');
    expect(await esperarEstable(() => contrasteEfectivo(prohibido)), 'prohibido en claro').toBeGreaterThanOrEqual(4.5);
    await pasarAOscuro(page);
    expect(await esperarEstable(() => contrasteEfectivo(prohibido)), 'prohibido en oscuro').toBeGreaterThanOrEqual(4.5);
    // «Sin etiqueta» también tiene ciudades «Con restricciones» (Sevilla, Valladolid): se mide en oscuro.
    expect(await esperarEstable(() => contrasteEfectivo(restr)), 'restricción en oscuro').toBeGreaterThanOrEqual(4.5);
  });

  /**
   * CASO 17 (bajo, operativa) — el año mínimo es 1990 (l. 472): un gasolina de 1989 (o un clásico
   * de 1950) es, por la regla de la DGT, «sin etiqueta» (anterior al 01/01/2001), y la app no lo
   * clasifica: «Introduce un año entre 1990 y 2025».
   */
  test('CASO 17 · un gasolina de 1989 sale «sin etiqueta», no se rechaza', async ({ page }) => {
    await consultar(page, 'gasolina', { anio: 1989 });
    await expect(tituloResultado(page)).toContainText('Sin etiqueta', { timeout: 3000 });
  });

  /**
   * CASO 18 (bajo, contenido) — la DGT da la CERO al PHEV «con una autonomía de 40 km» (el bloque
   * educativo de la app dice «igual o superior a 40 km», l. 682). La pregunta es «¿La autonomía
   * eléctrica SUPERA los 40 km?» (l. 573) con «Sí, supera» / «No, inferior»: con 40 km exactos la
   * respuesta literal es «No» → ECO.
   */
  test('CASO 18 · la pregunta del PHEV incluye los 40 km exactos', async ({ page }) => {
    await page.selectOption('#combustible', 'phev');
    await esperarValorEnReact(page, '#combustible', 'phev');
    const pregunta = page.locator('label[for="autonomiaPhev"]');
    await expect(pregunta).toBeVisible();
    await expect(pregunta).toContainText(/o más|igual o superior|al menos|como mínimo|≥/i, { timeout: 3000 });
  });

  /**
   * CASO 19 (bajo, dato) — la recomendación para «sin etiqueta» (l. 298) remite al «Plan MOVES
   * III». El RD 609/2026, de 22 de julio (BOE-A-2026-16010, Programa Auto+), dice en su preámbulo
   * que MOVES «ha estado vigente entre los años 2019 y 2025».
   */
  test('CASO 19 · no remite al Plan MOVES III como ayuda vigente', async ({ page }) => {
    await consultar(page, 'gasolina', { anio: 2000 });
    await expect(tituloResultado(page)).toContainText('Sin etiqueta');
    await expect(resultado(page)).not.toContainText('MOVES III', { timeout: 3000 });
    // La ayuda vigente sale del módulo data/fiscal/ayudas-vehiculo.ts.
    await expect(resultado(page)).toContainText('Programa Auto+');
  });

  /**
   * CASO 20 (bajo, contenido) — el bloque educativo (l. 669-672) atribuye la obligación de las ZBE
   * a la «Ley de Residuos y Suelos Contaminados (Real Decreto-ley 7/2022)» y la extiende a «las
   * capitales de provincia». La obligación está en la Ley 7/2021, de 20 de mayo, de cambio
   * climático y transición energética, art. 14.3 (municipios de más de 50.000 habitantes y
   * territorios insulares, antes de 2023). La FAQ (metadata.ts:89) dice «Ley de Residuos de 2021».
   */
  test('CASO 20 · el bloque educativo no atribuye las ZBE a un «Real Decreto-ley 7/2022»', async ({ page }) => {
    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
    const bloque = page.getByText(/Las Zonas de Bajas Emisiones \(ZBE\) son áreas urbanas/);
    await expect(bloque).toBeVisible();
    await expect(bloque).not.toContainText('Real Decreto-ley 7/2022', { timeout: 3000 });
    await expect(bloque).toContainText('Ley 7/2021');
    await expect(bloque).not.toContainText('capitales de provincia');
  });

  /**
   * CASO 21 (bajo, accesibilidad) — «ECO» es blanco (40 px, 900) sobre un degradado de
   * var(--primary) a var(--secondary) (EtiquetaDgt.module.css:199-201). En oscuro esos tokens se
   * aclaran (#3FA5D1 → #5ABDB9) y en el centro del texto el contraste es 2,50:1 (2,38-2,62 en su
   * caja): texto grande, exige 3:1. En claro, 3,38:1 en el centro.
   */
  test('CASO 21 · «ECO» se lee sobre su círculo también en tema oscuro (3:1 o más)', async ({ page }) => {
    await consultar(page, 'hev');
    const circulo = page.locator('[aria-label="Etiqueta DGT: ECO"]');
    await expect(circulo).toBeVisible();
    await esperarPaginaAsentada(page);
    expect(await esperarEstable(() => contrasteBlancoEnCentroDelDegradado(circulo)), 'ECO en claro').toBeGreaterThanOrEqual(3);
    await pasarAOscuro(page);
    // DEBERÍA: ≥ 3:1. Obtenido: 2,50:1 en el centro.
    expect(await esperarEstable(() => contrasteBlancoEnCentroDelDegradado(circulo)), 'ECO en oscuro').toBeGreaterThanOrEqual(3);
  });

  /** CASO 22 (bajo, contenido) — l. 611-615: «Etiqueta» + «Sin etiqueta» = «Etiqueta Sin etiqueta». */
  test('CASO 22 · el título del resultado no dice «Etiqueta Sin etiqueta»', async ({ page }) => {
    await consultar(page, 'diesel', { anio: 2005 });
    await expect(tituloResultado(page)).toBeVisible();
    await expect(tituloResultado(page)).not.toHaveText(/Etiqueta\s+Sin etiqueta/, { timeout: 3000 });
    await expect(tituloResultado(page)).toHaveText('Sin etiqueta');
  });

  /**
   * CASO 23 (bajo, operativa) — con PHEV elegido y la autonomía sin contestar, «Consultar» sale
   * sin hacer nada (l. 478, `return` mudo); igual sin combustible (l. 465). Ningún aviso dice qué
   * falta. El único role="alert" de la página es el del DisclaimerCard.
   */
  test('CASO 23 · PHEV sin la autonomía contestada: el formulario dice qué falta', async ({ page }) => {
    await consultar(page, 'phev');
    await expect(resultado(page)).toHaveCount(0);
    await expect(page.locator('form [role="alert"]')).toBeVisible({ timeout: 3000 });
    await expect(page.locator('form [role="alert"]')).toContainText('40 km');
  });

  /**
   * CASO 24 (bajo, contenido) — el único aviso que dice lo que de verdad hay que comprobar («La
   * normativa ZBE está en evolución constante… Consulta siempre el portal oficial de tu municipio
   * … antes de circular por una ZBE», l. 717-723) vive dentro de <EducationalSection>, que nace
   * colapsada. Lo visible es un DisclaimerCard «financial» («Herramientas Financieras»,
   * «asesoramiento financiero, fiscal ni jurídico»), que no habla ni de la DGT ni de las ZBE.
   * innerText: lo oculto por la sección colapsada no cuenta.
   */
  test('CASO 24 · a la vista, sin desplegar nada, se remite a la fuente oficial', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Ver guía educativa' })).toBeVisible();
    await expect(page.locator('main')).toContainText(/portal oficial|sede electrónica|por matrícula/i, {
      timeout: 3000,
      useInnerText: true,
    });
  });
});

test.describe('etiqueta-dgt — móvil de 360 px', () => {
  test.use({
    viewport: { width: 360, height: 740 },
    userAgent:
      'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Mobile Safari/537.36',
    deviceScaleFactor: 2.625,
    isMobile: true,
    hasTouch: true,
  });

  test('CASO 9 · el resultado cabe a 360 px sin desplazamiento horizontal', async ({ page }) => {
    await abrir(page);
    await consultar(page, 'diesel', { anio: 2010 });
    await expect(tituloResultado(page)).toHaveText('Etiqueta B');
    const [ancho, visible] = await page.evaluate(() => [
      document.documentElement.scrollWidth,
      document.documentElement.clientWidth,
    ]);
    expect(ancho).toBeLessThanOrEqual(visible);
  });
});
