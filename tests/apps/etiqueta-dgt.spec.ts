import { test, expect, Page, Locator } from '@playwright/test';
import { esperarPaginaAsentada, esperarValorEnReact } from './_hidratacion';

/**
 * Inspector — etiqueta-dgt (segmento fiscal, riesgo 1)
 *
 * Primera inspección: 25/09/2026 (15 hallazgos, 2034-2048, REPARADOS el 26/09/2026).
 * Re-inspección: 04/10/2026, tras el DataReference de a9c21aaf y los lotes del hero 586a4d61,
 * 3de36a1f y a1d72a9c.
 *
 * La app promete en su <h1> «¿Qué etiqueta DGT tiene tu coche?» y, en el subtítulo, «si puedes
 * circular por las Zonas de Bajas Emisiones». La etiqueta la decide la DGT, y la regla es pública.
 *
 * DÓNDE VIVE EL CÁLCULO
 *   app/etiqueta-dgt/motor.ts — `clasificar` y `FECHAS_DGT`, sin React. Pide combustible; el año
 *   para gasolina, diésel y gas; el mes solo para el diésel de 2015; y para el PHEV, si la autonomía
 *   es «de 40 km o más». El HEV pide el año como el gas (CASO 34); el BEV no pide nada más.
 *   Los datos de acceso por ciudad (CIUDADES_ZBE) y la mención de la ayuda Auto+ están en page.tsx;
 *   la ayuda sale de data/fiscal/ayudas-vehiculo.ts (AYUDA_AUTO_PLUS_2026, FISCAL_AYUDAS_VEHICULO_META).
 *
 * LAS FUENTES (leídas en sesión, no de memoria)
 *   · DGT, «Distintivo ambiental» (consultada el 25/09 y el 04/10/2026)
 *     https://www.dgt.es/nuestros-servicios/tu-vehiculo/tus-vehiculos/distintivo-ambiental/
 *       CERO (azul): BEV, REEV, PHEV «con una autonomía de 40 km», pila de combustible.
 *       ECO: PHEV < 40 km, HEV, gas (GNC, GNL) o GLP. «Deben cumplir los criterios de la etiqueta C».
 *       C (verde): gasolina «a partir de enero de 2006» y diésel «a partir de septiembre de 2015».
 *       B (amarilla): gasolina «desde el 1 de enero de 2001» y diésel «a partir de 2006».
 *       Adquisición: «coste de 5 €», en Correos, gestores, talleres y otras entidades listadas.
 *   · Orden PCI/810/2018 (BOE-A-2018-10856), RGV anexo II, apartado E (04/10/2026):
 *       0 emisiones: PHEV «con una autonomía mínima de 40 kilómetros (ciclo NEDC)».
 *       ECO (M1 y N1): PHEV < 40 km, HEV, gas natural, GNC o GLP. «En todo caso, deberán cumplir
 *       los criterios de la clasificación C». C: gasolina Euro 4/5/6 o diésel Euro 6. B: gasolina
 *       Euro 3 o diésel Euro 4/5. Colores: 0 azul, ECO verde y azul, C verde, B amarillo.
 *   · Ayuntamiento de Madrid, madrid.es, «Madrid Zona de Bajas Emisiones (ZBE)» (actualizada el
 *     07/04/2026) y «ZBEDEP Distrito Centro. Información general» (04/10/2026):
 *       Madrid ZBE = «todas las vías públicas urbanas del municipio»; desde el 01/01/2025 prohíbe
 *       la clasificación A (régimen transitorio desde el 07/04/2026 para ciertas A domiciliadas).
 *       ZBEDEP Distrito Centro: A prohibida; «B» y «C» «tienen prohibido acceder … únicamente para
 *       atravesarla, si bien podrán hacerlo para estacionar en un aparcamiento»; ECO y CERO, acceso.
 *       Infracción grave del art. 76.z3 LTSV: 200 € (100 € con pronto pago).
 *   · AMB, www.zbe.barcelona, «La ZBE» (04/10/2026): la prohibición de la ZBE Rondas afecta a los
 *     vehículos «que no les corresponda distintivo ambiental de la DGT», de lunes a viernes de 7 a 20 h.
 *
 * LOS CASOS, RESUELTOS A MANO ANTES DE ABRIR EL NAVEGADOR
 *   Normal   · gasolina 2010 → C · diésel 2010 → B · diésel 2016 → C (posterior a sept. 2015)
 *   Frontera · gasolina 2000/2001 → sin etiqueta / B · 2005/2006 → B / C
 *              diésel 2005/2006 → sin etiqueta / B · diésel 2015: agosto → B, septiembre → C
 *              PHEV de 40 km exactos → CERO (BOE: «autonomía mínima de 40 kilómetros»)
 *              gas 2005/2006 → B con el matiz / ECO (la ECO exige la C: gasolina desde enero de 2006)
 *   Rechazo  · año futuro, 1899, 20155, −2010 y 2010,5 → aviso, sin resultado; 1900 → sin etiqueta
 *   ZBE      · C en Madrid: no puede atravesar Distrito Centro, solo entrar a un aparcamiento
 *              B en Barcelona: libre acceso (la prohibición es para los que no tienen distintivo)
 *
 * HALLAZGOS DE LA PRIMERA INSPECCIÓN (25/09/2026), TODOS REPARADOS EL 26/09/2026
 *   CASO 10 alto   · el gas natural / GLP salía CERO; la DGT le da ECO (y solo si cumple la C).
 *   CASO 11 medio  · los colores: pintaba y describía la C «amarilla» y la B «verde».
 *   CASO 12 medio  · el diésel de 2015 salía C sin aviso.
 *   CASO 13 medio  · un coche matriculado este año se rechazaba («entre 1990 y 2025»).
 *   CASO 14 medio  · la FAQ (JSON-LD) decía «diésel desde 2014» C y «gasolina entre 2000 y 2005» B.
 *   CASO 15 medio  · el aviso de error, #dc2626 en línea, daba 2,85:1 sobre el panel oscuro.
 *   CASO 16 medio  · la insignia «Libre acceso» daba 2,88:1 en claro.
 *   CASO 17 bajo   · un gasolina de 1989 se rechazaba en vez de salir «sin etiqueta».
 *   CASO 18 bajo   · la pregunta del PHEV («¿supera los 40 km?») dejaba fuera los 40 km exactos.
 *   CASO 19 bajo   · recomendaba el «Plan MOVES III», que terminó en 2025 (hoy, Programa Auto+).
 *   CASO 20 bajo   · atribuía las ZBE a la «Ley de Residuos… (Real Decreto-ley 7/2022)».
 *   CASO 21 bajo   · «ECO» blanco sobre el degradado de marca daba < 3:1 en oscuro.
 *   CASO 22 bajo   · el título del resultado decía «Etiqueta Sin etiqueta».
 *   CASO 23 bajo   · PHEV sin contestar la autonomía: el botón no hacía nada ni decía nada.
 *   CASO 24 bajo   · el aviso de «consulta el portal oficial» solo estaba en la sección colapsada.
 *
 * HALLAZGOS DE LA RE-INSPECCIÓN (04/10/2026), REPARADOS el mismo día (2842-2848; eran test.fail)
 *   CASO 30 alto   · Madrid: a la C le dice «Acceso libre en condiciones normales» (no puede
 *                    atravesar Distrito Centro); a la B, «autorización especial» en una «ZBE 30».
 *   CASO 31 medio  · Barcelona: la B sale «Con restricciones» de lunes a viernes; es libre.
 *   CASO 32 medio  · la FAQ: A en «Madrid Central y Madrid 360» «durante los días laborables».
 *   CASO 33 bajo   · la FAQ: el distintivo «se solicita en las Jefaturas … pagar una tasa».
 *   CASO 34 bajo   · el HEV sale ECO sin pedir el año; la ECO exige cumplir la C, como al gas.
 *   CASO 35 bajo   · el botón se ve «Consultar mi etiqueta DGT» y se llama «Calcular etiqueta…».
 *   CASO 36 bajo   · el JSON-LD dice FinanceApplication y features vacías; el meta, Utility.
 */

const RUTA = '/etiqueta-dgt/';

type Combustible = 'bev' | 'phev' | 'hev' | 'gnc' | 'gasolina' | 'diesel';

const resultado = (page: Page): Locator =>
  page.locator('section[aria-label="Resultado de la etiqueta DGT"]');

const tituloResultado = (page: Page): Locator => resultado(page).locator('h2');

/** La tarjeta de una ciudad en el bloque de ZBE del resultado. */
const tarjetaCiudad = (page: Page, ciudad: string): Locator =>
  resultado(page)
    .locator('[class*="zbeCard"]')
    .filter({ has: page.locator('[class*="zbeNombreCiudad"]', { hasText: new RegExp(`^${ciudad}$`) }) });

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
  opciones: { anio?: number | string; mes?: number; autonomia?: 'cuarentaOMas' | 'menos' } = {},
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
  // Por su tipo y no por su nombre: el nombre accesible es justo lo que discute el CASO 35.
  await page.locator('form button[type="submit"]').click();
}

/** El FAQPage del JSON-LD, como texto. */
async function faqJsonLd(page: Page): Promise<string> {
  return page
    .locator('script[type="application/ld+json"]')
    .evaluateAll((els) => els.map((e) => e.textContent ?? '').find((t) => t.includes('FAQPage')) ?? '');
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

/** ¿Cuántas cajas de texto del <h1> pisa la barra fija del logo? (la medida de la Ronda) */
async function letrasBajoLaBarra(page: Page): Promise<{ barra: boolean; tapadas: number }> {
  return page.evaluate(() => {
    const barra = Array.from(document.querySelectorAll('body *')).find((e) => {
      const cs = getComputedStyle(e);
      const r = e.getBoundingClientRect();
      return (
        cs.position === 'fixed' &&
        r.top <= 1 &&
        r.height < 120 &&
        r.width > 300 &&
        e.querySelector('a[href="/"]') !== null
      );
    });
    const h1 = document.querySelector('h1');
    if (!barra || !h1) return { barra: false, tapadas: -1 };
    const rango = document.createRange();
    rango.selectNodeContents(h1);
    const letras = Array.from(rango.getClientRects()).filter((c) => c.width > 0);
    const piezas = Array.from(barra.children)
      .map((c) => c.getBoundingClientRect())
      .filter((c) => c.width > 0);
    const tapadas = letras.filter((c) =>
      piezas.some(
        (p) => !(p.right <= c.left || p.left >= c.right || p.bottom <= c.top || p.top >= c.bottom),
      ),
    ).length;
    return { barra: true, tapadas };
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

  // ───────────────────────── Casos de la primera inspección que ya se cumplían ─────────────────────────

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

  test('CASO 7 · BEV → CERO, HEV de 2018 → ECO, PHEV ≥ 40 km → CERO, PHEV < 40 km → ECO', async ({ page }) => {
    await consultar(page, 'bev');
    await expect(tituloResultado(page)).toHaveText('Etiqueta CERO');
    await consultar(page, 'hev', { anio: 2018 });
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

  // ───────────────────────── Hallazgos de la primera inspección: REPARADOS el 26/09/2026 ─────────────────────────

  /**
   * CASO 10 (alto, cálculo) — REPARADO el 26/09/2026. page.tsx juntaba el gas con el eléctrico
   * (`bev || gnc` → 'cero'). La DGT da ECO a los «propulsados por gas natural y gas (GNC y GNL) o
   * GLP» y exige además que cumplan los criterios de la C.
   */
  test('CASO 10 · gas natural / GLP → ECO, no CERO; y sin la C por fecha, tampoco ECO', async ({ page }) => {
    // La app pide ahora el año también al gas: 2010 (≥ enero 2006) → ECO; 2003 → no llega a la C,
    // y por fecha su norma Euro de gasolina es la 3 → B, con el matiz a la vista.
    await consultar(page, 'gnc', { anio: 2010 });
    await expect(tituloResultado(page)).toHaveText('Etiqueta ECO', { timeout: 3000 });
    await consultar(page, 'gnc', { anio: 2003 });
    await expect(tituloResultado(page)).toHaveText('Etiqueta B');
    await expect(resultado(page)).toContainText('criterios de la etiqueta C');
  });

  /**
   * CASO 11 (medio, dato) — REPARADO el 26/09/2026. La DGT: CERO azul, C VERDE, B AMARILLA. La app
   * describía la C como «Etiqueta amarilla» y la B como «Etiqueta verde», y las pintaba así.
   */
  test('CASO 11 · la C se describe verde y la B amarilla, como las pinta la DGT', async ({ page }) => {
    await consultar(page, 'gasolina', { anio: 2010 });
    // Antes de la reparación, la descripción de la C terminaba en «… Etiqueta amarilla.»
    await expect(resultado(page).locator('p').first()).toContainText('verde', { timeout: 3000 });
    await consultar(page, 'diesel', { anio: 2010 });
    await expect(resultado(page).locator('p').first()).toContainText('amarilla', { timeout: 3000 });
  });

  /**
   * CASO 12 (medio, cálculo) — REPARADO el 26/09/2026. La DGT da la C al diésel «a partir de
   * septiembre de 2015»; la app respondía «Etiqueta C» a todo 2015, sin matiz ni remisión.
   */
  test('CASO 12 · un diésel de 2015 pide el mes: agosto → B (con el matiz Euro 6), septiembre → C', async ({ page }) => {
    // La reparación elegida es preguntar el mes, que es lo que decide según la DGT («a partir de
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
   * CASO 13 (medio, operativa) — REPARADO el 26/09/2026. `anioActual = 2025` estaba fijo y un
   * gasolina matriculado en 2026 se rechazaba. El año se toma del reloj para que no caduque.
   */
  test('CASO 13 · un gasolina matriculado este año sale C, no se rechaza', async ({ page }) => {
    await consultar(page, 'gasolina', { anio: new Date().getFullYear() });
    // Antes de la reparación (2026): «Introduce un año entre 1990 y 2025».
    await expect(tituloResultado(page)).toHaveText('Etiqueta C', { timeout: 3000 });
  });

  /**
   * CASO 14 (medio, contenido) — REPARADO el 26/09/2026. La FAQ del JSON-LD decía «diésel desde
   * 2014 llevan la etiqueta C» y «gasolina entre 2000 y 2005 … la B».
   */
  test('CASO 14 · la FAQ no fecha la C del diésel en 2014 ni la B de la gasolina en 2000', async ({ page }) => {
    const faq = await faqJsonLd(page);
    expect(faq).toContain('FAQPage');
    expect(faq).not.toMatch(/diésel desde 2014/);
    expect(faq).not.toMatch(/gasolina entre 2000 y 2005/);
  });

  /**
   * CASO 15 (medio, accesibilidad) — REPARADO el 26/09/2026. El aviso de error llevaba
   * `style={{ color: '#dc2626' }}` en línea y daba 2,85:1 sobre el panel oscuro (#2D2D2D).
   */
  test('CASO 15 · el aviso de año inválido se lee también en tema oscuro (4,5:1 o más)', async ({ page }) => {
    await consultar(page, 'gasolina', { anio: new Date().getFullYear() + 1 });
    const aviso = page.locator('#errorAnio');
    await expect(aviso).toBeVisible();
    expect(await esperarEstable(() => contrasteEfectivo(aviso)), 'aviso en claro').toBeGreaterThanOrEqual(4.5);
    await pasarAOscuro(page);
    // Antes de la reparación: 2,85:1.
    expect(await esperarEstable(() => contrasteEfectivo(aviso)), 'aviso en oscuro').toBeGreaterThanOrEqual(4.5);
  });

  /**
   * CASO 16 (medio, accesibilidad) — REPARADO el 26/09/2026. Las insignias de acceso (texto de
   * 12,8 px en negrita, exigen 4,5:1) daban en claro 2,88:1 «Libre acceso», 4,01:1 «Prohibido» y
   * 4,42:1 «Con restricciones»; en oscuro, «Prohibido» 4,39:1.
   */
  test('CASO 16 · la insignia «Libre acceso» alcanza 4,5:1 en claro', async ({ page }) => {
    await consultar(page, 'gasolina', { anio: 2010 });
    const libre = resultado(page).locator('[class*="zbeLibre"]').first();
    await expect(libre).toContainText('Libre acceso');
    await esperarPaginaAsentada(page);
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
   * CASO 17 (bajo, operativa) — REPARADO el 26/09/2026. El año mínimo era 1990 y un gasolina de
   * 1989 se rechazaba; por la regla de la DGT es «sin etiqueta» (anterior al 01/01/2001).
   */
  test('CASO 17 · un gasolina de 1989 sale «sin etiqueta», no se rechaza', async ({ page }) => {
    await consultar(page, 'gasolina', { anio: 1989 });
    await expect(tituloResultado(page)).toContainText('Sin etiqueta', { timeout: 3000 });
  });

  /**
   * CASO 18 (bajo, contenido) — REPARADO el 26/09/2026. La pregunta era «¿La autonomía eléctrica
   * SUPERA los 40 km?»; con 40 km exactos la respuesta literal era «No» → ECO. El BOE da la CERO
   * al PHEV «con una autonomía mínima de 40 kilómetros».
   */
  test('CASO 18 · la pregunta del PHEV incluye los 40 km exactos', async ({ page }) => {
    await page.selectOption('#combustible', 'phev');
    await esperarValorEnReact(page, '#combustible', 'phev');
    const pregunta = page.locator('label[for="autonomiaPhev"]');
    await expect(pregunta).toBeVisible();
    await expect(pregunta).toContainText(/o más|igual o superior|al menos|como mínimo|≥/i, { timeout: 3000 });
  });

  /**
   * CASO 19 (bajo, dato) — REPARADO el 26/09/2026. La recomendación para «sin etiqueta» remitía al
   * «Plan MOVES III», que según el RD 609/2026 «ha estado vigente entre los años 2019 y 2025».
   */
  test('CASO 19 · no remite al Plan MOVES III como ayuda vigente', async ({ page }) => {
    await consultar(page, 'gasolina', { anio: 2000 });
    await expect(tituloResultado(page)).toContainText('Sin etiqueta');
    await expect(resultado(page)).not.toContainText('MOVES III', { timeout: 3000 });
    // La ayuda vigente sale del módulo data/fiscal/ayudas-vehiculo.ts (ver CASO 28).
    await expect(resultado(page)).toContainText('Programa Auto+');
  });

  /**
   * CASO 20 (bajo, contenido) — REPARADO el 26/09/2026. El bloque educativo atribuía la obligación
   * de las ZBE a la «Ley de Residuos y Suelos Contaminados (Real Decreto-ley 7/2022)». Está en la
   * Ley 7/2021, art. 14.3 (BOE-A-2021-8447).
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
   * CASO 21 (bajo, accesibilidad) — REPARADO el 26/09/2026. «ECO» blanco sobre el degradado de
   * var(--primary) a var(--secondary) daba 2,50:1 en el centro en oscuro (texto grande: 3:1).
   */
  test('CASO 21 · «ECO» se lee sobre su círculo también en tema oscuro (3:1 o más)', async ({ page }) => {
    await consultar(page, 'hev', { anio: 2018 });
    const circulo = page.locator('[aria-label="Etiqueta DGT: ECO"]');
    await expect(circulo).toBeVisible();
    await esperarPaginaAsentada(page);
    expect(await esperarEstable(() => contrasteBlancoEnCentroDelDegradado(circulo)), 'ECO en claro').toBeGreaterThanOrEqual(3);
    await pasarAOscuro(page);
    // Antes de la reparación: 2,50:1 en el centro.
    expect(await esperarEstable(() => contrasteBlancoEnCentroDelDegradado(circulo)), 'ECO en oscuro').toBeGreaterThanOrEqual(3);
  });

  /** CASO 22 (bajo, contenido) — REPARADO el 26/09/2026: el h2 decía «Etiqueta Sin etiqueta». */
  test('CASO 22 · el título del resultado no dice «Etiqueta Sin etiqueta»', async ({ page }) => {
    await consultar(page, 'diesel', { anio: 2005 });
    await expect(tituloResultado(page)).toBeVisible();
    await expect(tituloResultado(page)).not.toHaveText(/Etiqueta\s+Sin etiqueta/, { timeout: 3000 });
    await expect(tituloResultado(page)).toHaveText('Sin etiqueta');
  });

  /**
   * CASO 23 (bajo, operativa) — REPARADO el 26/09/2026. Con PHEV elegido y la autonomía sin
   * contestar, «Consultar» salía sin hacer nada (`return` mudo) y ningún aviso decía qué faltaba.
   */
  test('CASO 23 · PHEV sin la autonomía contestada: el formulario dice qué falta', async ({ page }) => {
    await consultar(page, 'phev');
    await expect(resultado(page)).toHaveCount(0);
    await expect(page.locator('form [role="alert"]')).toBeVisible({ timeout: 3000 });
    await expect(page.locator('form [role="alert"]')).toContainText('40 km');
  });

  /**
   * CASO 24 (bajo, contenido) — REPARADO el 26/09/2026. El único aviso de «consulta el portal
   * oficial» vivía dentro de <EducationalSection>, que nace colapsada, y lo visible era un
   * disclaimer «financial» que no hablaba de la DGT ni de las ZBE. innerText: lo oculto no cuenta.
   */
  test('CASO 24 · a la vista, sin desplegar nada, se remite a la fuente oficial', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Ver guía educativa' })).toBeVisible();
    await expect(page.locator('main')).toContainText(/portal oficial|sede electrónica|por matrícula/i, {
      timeout: 3000,
      useInnerText: true,
    });
  });

  // ───────────────────────── Re-inspección del 04/10/2026: casos que se cumplen ─────────────────────────

  test('CASO 25 · diésel de 2016 → C (DGT: diésel a partir de septiembre de 2015), con la nota de la norma Euro', async ({ page }) => {
    await consultar(page, 'diesel', { anio: 2016 });
    await expect(tituloResultado(page)).toHaveText('Etiqueta C');
    // Combustión: el resultado es por fecha y lo dice, con remisión a la consulta por matrícula.
    await expect(resultado(page)).toContainText('Manda la norma Euro de tu ficha técnica');
  });

  test('CASO 26 · gas en la frontera de la C: 2005 → B con el matiz, 2006 → ECO', async ({ page }) => {
    // BOE (Orden PCI/810/2018): la ECO del gas «en todo caso» exige la C; por fecha, la C de la
    // gasolina empieza en enero de 2006 (DGT). 2005 queda en la B de la gasolina (desde 2001).
    await consultar(page, 'gnc', { anio: 2005 });
    await expect(tituloResultado(page)).toHaveText('Etiqueta B');
    await expect(resultado(page)).toContainText('solo lleva la ECO si cumple también los criterios de la etiqueta C');
    await consultar(page, 'gnc', { anio: 2006 });
    await expect(tituloResultado(page)).toHaveText('Etiqueta ECO');
  });

  test('CASO 27 · años imposibles se rechazan con aviso; 1900 sale «sin etiqueta»', async ({ page }) => {
    const tope = new Date().getFullYear();
    // El aviso literal de page.tsx, con el suelo ANIO_MINIMO = 1900 y el techo del reloj.
    const aviso = `Introduce un año de cuatro cifras entre 1900 y ${tope}.`;
    for (const anio of ['1899', '20155', '-2010', '2010.5']) {
      await consultar(page, 'gasolina', { anio });
      await expect(page.locator('#errorAnio'), `año ${anio}`).toHaveText(aviso);
      await expect(resultado(page), `año ${anio}`).toHaveCount(0);
    }
    // 1900: anterior al 01/01/2001 → sin distintivo (categoría A).
    await consultar(page, 'gasolina', { anio: 1900 });
    await expect(tituloResultado(page)).toHaveText('Sin etiqueta');
  });

  test('CASO 28 · la ayuda Auto+ y el sello salen de data/fiscal/ayudas-vehiculo.ts', async ({ page }) => {
    // AYUDA_AUTO_PLUS_2026: nombre 'Programa Auto+', matriculadosDesde '2026-01-01' (→ 01/01/2026).
    // FISCAL_AYUDAS_VEHICULO_META: fuente 'Real Decreto 609/2026, de 22 de julio (Programa Auto+),
    // Anexo II' (la recomendación corta en « ("), verificado '2026-09-26', urlOficial del BOE.
    await consultar(page, 'gasolina', { anio: 1995 });
    await expect(tituloResultado(page)).toHaveText('Sin etiqueta');
    await expect(resultado(page)).toContainText(
      'la ayuda estatal vigente es el Programa Auto+ (Real Decreto 609/2026, de 22 de julio), para vehículos matriculados desde el 01/01/2026.',
    );
    const sello = page.locator('[aria-label="Datos de referencia normativos"]');
    await expect(sello).toContainText(
      'Programa Auto+ de ayudas a la compra de vehículos electrificados — Real Decreto 609/2026, de 22 de julio (Programa Auto+), Anexo II',
    );
    await expect(sello).toContainText('26/09/2026');
    await expect(sello.getByRole('link')).toHaveAttribute('href', 'https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-16010');
  });

  // ───────────────────────── Re-inspección del 04/10/2026: hallazgos REPARADOS ─────────────────────────

  /**
   * CASO 30 (alto, dato) — madrid.es, «ZBEDEP Distrito Centro. Información general»: los vehículos
   * «B» y «C» «tienen prohibido acceder … únicamente para atravesarla, si bien podrán hacerlo para
   * estacionar en un aparcamiento» adherido. Y «Madrid ZBE» es todo el municipio, donde solo se
   * prohíbe la A: no existe ninguna «ZBE 30» ni una «autorización especial» para la B.
   * La app, a la C en Madrid: «Acceso libre en condiciones normales…». A la B: «Solo residentes con
   * permiso en ZBE Distrito Centro. En ZBE 30 pueden circular con autorización especial…».
   */
  test('CASO 30 · Madrid: la C no tiene «acceso libre» a Distrito Centro y la B no necesita «autorización especial»', async ({ page }) => {
    await consultar(page, 'gasolina', { anio: 2010 });
    await expect(tituloResultado(page)).toHaveText('Etiqueta C');
    const madridC = tarjetaCiudad(page, 'Madrid').locator('[class*="zbeDetalle"]');
    await expect(madridC).toBeVisible();
    // DEBERÍA: decir que la C solo entra en Distrito Centro para estacionar en un aparcamiento.
    // Obtenido: «Acceso libre en condiciones normales. En episodios de alta contaminación…».
    await expect(madridC).toContainText(/aparcamiento/i, { timeout: 3000 });
    await expect(madridC).not.toContainText('Acceso libre en condiciones normales');
    await consultar(page, 'diesel', { anio: 2010 });
    await expect(tituloResultado(page)).toHaveText('Etiqueta B');
    const madridB = tarjetaCiudad(page, 'Madrid').locator('[class*="zbeDetalle"]');
    await expect(madridB).not.toContainText(/ZBE 30|autorización especial/);
  });

  /**
   * CASO 31 (medio, dato) — AMB, www.zbe.barcelona: la prohibición de la ZBE Rondas afecta a los
   * vehículos «que no les corresponda distintivo ambiental de la DGT», de lunes a viernes de 7 a 20 h.
   * Un B lo tiene. La app le pone «Con restricciones» y «Circulación restringida en la ZBE Rondes en
   * días laborables de 7:00 a 20:00. Solo permitido fines de semana y festivos», y la recomendación
   * de la B dice «En Madrid y Barcelona, la etiqueta B ya tiene restricciones».
   */
  test('CASO 31 · Barcelona: un diésel de 2010 (B) tiene libre acceso a la ZBE Rondas', async ({ page }) => {
    await consultar(page, 'diesel', { anio: 2010 });
    await expect(tituloResultado(page)).toHaveText('Etiqueta B');
    const barcelona = tarjetaCiudad(page, 'Barcelona');
    await expect(barcelona).toBeVisible();
    // DEBERÍA: «Libre acceso». Obtenido: «Con restricciones».
    await expect(barcelona.locator('[class*="zbeStatus"]')).toContainText('Libre acceso', { timeout: 3000 });
    await expect(resultado(page)).not.toContainText('En Madrid y Barcelona, la etiqueta B ya tiene restricciones');
  });

  /**
   * CASO 32 (medio, contenido) — la FAQ del JSON-LD (la que leen los asistentes de IA) pregunta
   * «¿Puedo circular por Madrid Central sin etiqueta DGT?» y responde que los sin etiqueta «tienen
   * restringido el acceso a Madrid Central y Madrid 360 durante los días laborables». madrid.es:
   * «Madrid ZBE» abarca «todas las vías públicas urbanas del municipio» y prohíbe la A «de manera
   * permanente» desde el 01/01/2025; la zona del centro es la «ZBEDEP Distrito Centro» (Ordenanza
   * 10/2021) y «Madrid 360» es la Estrategia de Sostenibilidad Ambiental, no una zona.
   */
  test('CASO 32 · la FAQ no limita la prohibición de Madrid a los «días laborables» de «Madrid Central»', async ({ page }) => {
    const faq = await faqJsonLd(page);
    expect(faq).toContain('FAQPage');
    // DEBERÍA: Madrid ZBE (todo el municipio, todos los días) y ZBEDEP Distrito Centro.
    // Obtenido: «… restringido el acceso a Madrid Central y Madrid 360 durante los días laborables».
    expect(faq).not.toMatch(/durante los días laborables/);
    expect(faq).not.toMatch(/Madrid Central/);
  });

  /**
   * CASO 33 (bajo, contenido) — la FAQ «¿Cómo se obtiene la etiqueta…?» dice que «se solicita en
   * las Jefaturas Provinciales de Tráfico, en puntos de expedición autorizados o a través de la
   * sede electrónica de la DGT» y que hay que «pagar una tasa». La DGT («Cómo y dónde adquirir el
   * distintivo ambiental»): «tiene un coste de 5 €», que «puede verse incrementado con gastos de
   * envío», y se adquiere en Oficinas de Correos, gestores, talleres y las demás entidades que lista;
   * ni las Jefaturas ni la sede electrónica están entre ellas (la sede sirve para CONSULTARLO).
   */
  test('CASO 33 · la FAQ no manda a las Jefaturas a «pagar una tasa» por el distintivo', async ({ page }) => {
    const faq = await faqJsonLd(page);
    expect(faq).toContain('FAQPage');
    expect(faq).not.toMatch(/Jefaturas Provinciales de Tráfico/);
    expect(faq).not.toMatch(/pagar una tasa/);
  });

  /**
   * CASO 34 (bajo, cálculo) — BOE (Orden PCI/810/2018): la ECO de los M1 y N1 (PHEV < 40 km, HEV,
   * gas) «en todo caso» exige «cumplir los criterios de la clasificación C»; la DGT: «Deben cumplir
   * los criterios de la etiqueta C». La app lo aplica al gas (le pide el año, CASO 26) y lo escribe
   * en la descripción de la ECO, pero al HEV no le pide nada y le da la ECO siempre: un HEV de
   * gasolina de 2004 no llega por fecha a la C (enero de 2006) y sale «Etiqueta ECO» sin matiz.
   * La reparación natural es la del gas; si se elige otra, este caso se adapta a ella.
   */
  test('CASO 34 · el híbrido no enchufable pide el año, como el gas, para comprobar la C', async ({ page }) => {
    await page.selectOption('#combustible', 'hev');
    await esperarValorEnReact(page, '#combustible', 'hev');
    // DEBERÍA: aparecer el año de matriculación. Obtenido: ningún campo más; «Consultar» → ECO.
    await expect(page.locator('#anioMatriculacion')).toBeVisible({ timeout: 3000 });
    // Un HEV de gasolina de 2004 no llega por fecha a la C: no se afirma la ECO, y se dice por qué.
    await consultar(page, 'hev', { anio: 2004 });
    await expect(tituloResultado(page)).toHaveText('Etiqueta B');
    await expect(resultado(page)).toContainText('Un híbrido no enchufable solo lleva la ECO si cumple también los criterios de la etiqueta C');
    await consultar(page, 'hev', { anio: 2012 });
    await expect(tituloResultado(page)).toHaveText('Etiqueta ECO');
  });

  /**
   * CASO 35 (bajo, accesibilidad) — WCAG 2.5.3 (Etiqueta en el nombre, nivel A): el botón se ve
   * «Consultar mi etiqueta DGT» y su aria-label es «Calcular etiqueta DGT de mi vehículo», que no
   * contiene el texto visible. Quien lo dicta por voz («pulsa Consultar mi etiqueta») no lo alcanza.
   */
  test('CASO 35 · el botón se puede nombrar por lo que se lee: «Consultar mi etiqueta DGT»', async ({ page }) => {
    await expect(page.locator('form button[type="submit"]')).toHaveText('Consultar mi etiqueta DGT');
    await expect(page.getByRole('button', { name: /Consultar mi etiqueta DGT/ })).toHaveCount(1, { timeout: 3000 });
  });

  /**
   * CASO 36 (bajo, contenido) — la página emite dos descripciones WebApplication que se contradicen:
   * el JSON-LD (`jsonLd` de metadata.ts) dice `applicationCategory: 'FinanceApplication'` con
   * `featureList` vacío, y el meta `schema:WebApplication` de la MISMA página dice
   * 'UtilityApplication' con siete características. La app no es financiera: consulta un distintivo.
   * CLAUDE.md §1.ter pide 4-8 features reales en el JSON-LD.
   */
  test('CASO 36 · el JSON-LD WebApplication no se declara financiero ni sale sin características', async ({ page }) => {
    const { jsonLd, meta } = await page.evaluate(() => {
      const ld = [...document.querySelectorAll('script[type="application/ld+json"]')]
        .map((s) => JSON.parse(s.textContent ?? '{}') as Record<string, unknown>)
        .find((o) => o['@type'] === 'WebApplication' && String(o.url ?? '').includes('etiqueta-dgt'));
      const m = document.querySelector('meta[name="schema:WebApplication"]')?.getAttribute('content');
      return { jsonLd: ld ?? null, meta: m ? (JSON.parse(m) as Record<string, unknown>) : null };
    });
    expect(jsonLd, 'JSON-LD WebApplication').not.toBeNull();
    expect(meta, 'meta schema:WebApplication').not.toBeNull();
    // DEBERÍA: la misma categoría que el meta (UtilityApplication). Obtenido: FinanceApplication.
    expect(jsonLd?.applicationCategory).toBe(meta?.applicationCategory);
    expect(Array.isArray(jsonLd?.featureList) ? (jsonLd?.featureList as unknown[]).length : 0).toBeGreaterThanOrEqual(4);
  });
});

// Lotes del hero 586a4d61, 3de36a1f y a1d72a9c: 80 px arriba hasta 1023 px y 100 px de 769 a
// 1439 px. Medido el 04/10/2026: a 800, 1024 y 1280 px, letras del h1 desde y = 97 px y piezas
// de la barra del logo hasta y = 77 px.
for (const ancho of [800, 1024, 1280]) {
  test.describe(`etiqueta-dgt — título libre del logo a ${ancho} px`, () => {
    test.use({ viewport: { width: ancho, height: 800 } });

    test(`CASO 29 · ninguna letra del h1 queda bajo la barra del logo (${ancho} px)`, async ({ page }) => {
      await abrir(page);
      await esperarPaginaAsentada(page);
      expect(await letrasBajoLaBarra(page)).toEqual({ barra: true, tapadas: 0 });
    });
  });
}

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

  test('CASO 29 · ninguna letra del h1 queda bajo la barra del logo (360 px)', async ({ page }) => {
    // Medido el 04/10/2026: letras desde y = 78 px, barra hasta y = 52 px.
    await abrir(page);
    await esperarPaginaAsentada(page);
    expect(await letrasBajoLaBarra(page)).toEqual({ barra: true, tapadas: 0 });
  });
});
