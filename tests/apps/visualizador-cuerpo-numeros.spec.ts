import { test, expect, devices, type Locator, type Page } from '@playwright/test';
import { esperarPaginaAsentada } from './_hidratacion';
import { contrasteSobreFondoReal } from './_contraste';

/**
 * Inspector — visualizador-cuerpo-numeros (segmento INTERACTIVA, explicador sin entradas,
 * `@disclaimer: exempt`). Primera inspección: 09/11/2026.
 *
 * Qué promete la app
 * ──────────────────
 *   <h1>  «Tu Cuerpo en Números»
 *   sub.  «Las cifras más asombrosas de la máquina más perfecta del universo»
 *   Cuatro secciones (Estructura, Sistemas en acción, A nivel micro, Récords) con cifras fijas
 *   del cuerpo de un adulto y, al desplegar cada tarjeta, una COMPARACIÓN que es una cuenta
 *   hecha con esas cifras («si contaras 1 célula por segundo…», «ida y vuelta al Sol…»).
 *   La guía dice que «las cifras presentadas provienen de estudios científicos de referencia»
 *   y solo cita a Bianconi et al. (2013) para los 37,2 billones de células.
 *
 * FUENTE de los esperados: no hay entradas ni datos de data/fiscal. Lo que tiene verdad
 * comprobable es la ARITMÉTICA de cada comparación con las constantes de la propia app
 * (37,2 billones de células, 2 m de ADN por célula, 40.075 km de circunferencia terrestre,
 * 5.900 millones de km del Sol a Plutón, 100.000 latidos/día…). La única constante externa es
 * la unidad astronómica: 1 ua = 1,495 978 706 91 × 10¹¹ m (Real Decreto 2032/2009, de unidades
 * legales de medida, tabla 7; BOE-A-2010-927). Todo se resolvió a mano ANTES de abrir la app.
 *
 * CASOS (resueltos a mano)
 * ────────────────────────
 *   CASO 1 (normal) — comparaciones que cuadran con sus constantes:
 *       3,72·10¹³ células a 1/s ÷ 31.557.600 s/año (365,25 d) = 1,18 millones de años → «1,2»
 *       120 m/s × 3,6 = 432 km/h · 100.000 km ÷ 40.075 km = 2,50 vueltas
 *       19.000 km ÷ 40.075 km = 0,47 («casi la mitad») · 60.000 ÷ 24 = 2.500 por hora
 *       330.000 millones/día ÷ 86.400 s = 3,82 millones/s · composición 40+15+25+11+9 = 100
 *   CASO 2 (límite: la cifra más grande, el ADN total):
 *       2 m × 3,72·10¹³ = 7,44·10¹³ m = 74.400 millones de km (la guía dice 74.400; la tarjeta,
 *       «unos 74.000»: correcto). Ida y vuelta al Sol = 2 × 149.597.870,7 km = 299.195.741 km →
 *       74.400 / 299,2 = 248,7 veces. La tarjeta dice «600 veces» (HALLAZGO). 600 es la cuenta
 *       con la cifra antigua de 100 billones de células: 10¹⁴ × 1,8 m / 2 ua ≈ 610.
 *   CASO 3 (debe rechazarse: una afirmación que sus propias cifras refutan):
 *       la tarjeta titula «Sol a Plutón ×4» y debajo dice «Unos 74.000 millones de km. Plutón
 *       está a 5.900 millones de km del Sol»: 74.000 / 5.900 = 12,5 trayectos (6,3 de ida y
 *       vuelta), no 4 (HALLAZGO). Se repite en la tarjeta de Twitter y en el FAQPage.
 *
 * Los hallazgos van con test.fail(): cuando se reparen, el test «pasará» y Playwright lo
 * marcará como fallo inesperado; entonces se quita el test.fail() y se escribe REPARADO.
 */

const RUTA = '/visualizador-cuerpo-numeros/';

/** 1 ua en km (RD 2032/2009, tabla 7: 1,495 978 706 91 × 10¹¹ m). */
const UA_KM = 149_597_870.691;

/** El espacio duro (U+00A0) que la regla del % exige entre la cifra y el signo. */
const ESPACIO_DURO = String.fromCharCode(0xa0);

/** «74.000» → 74000 · «1,2» → 1.2 (formato español). */
function numeroEs(texto: string): number {
  return Number(texto.replace(/\./g, '').replace(',', '.'));
}

const normalizar = (t: string): string => t.replace(/\s+/g, ' ').trim();

async function seccion(page: Page, nombre: string): Promise<void> {
  const boton = page
    .getByRole('navigation', { name: 'Secciones del explicador' })
    .getByRole('button', { name: nombre });
  await boton.click();
  await expect(boton).toHaveAttribute('aria-pressed', 'true');
}

/** Tarjeta desplegable (micro o barra de Sistemas) por su título EXACTO. */
function desplegable(page: Page, titulo: string): Locator {
  return page.locator('button[aria-expanded]').filter({ has: page.getByText(titulo, { exact: true }) });
}

async function desplegar(page: Page, titulo: string): Promise<string> {
  const t = desplegable(page, titulo);
  await t.click();
  await expect(t).toHaveAttribute('aria-expanded', 'true');
  return normalizar((await t.textContent()) ?? '');
}

function tarjetaRecord(page: Page, titulo: string): Locator {
  return page.getByRole('heading', { level: 3, name: titulo, exact: true }).locator('xpath=..');
}

interface PreguntaLd {
  pregunta: string;
  respuesta: string;
}

async function faqLd(page: Page): Promise<PreguntaLd[]> {
  return page.evaluate(() => {
    const faq: { pregunta: string; respuesta: string }[] = [];
    for (const s of Array.from(document.querySelectorAll('script[type="application/ld+json"]'))) {
      const j = JSON.parse(s.textContent ?? '{}') as Record<string, unknown>;
      if (j['@type'] !== 'FAQPage') continue;
      for (const q of j.mainEntity as { name: string; acceptedAnswer: { text: string } }[]) {
        faq.push({ pregunta: q.name, respuesta: q.acceptedAnswer.text });
      }
    }
    return faq;
  });
}

/** Pregunta y respuesta de la FAQ VISIBLE (montada aunque la guía esté plegada). */
async function faqVisible(page: Page, patron: RegExp): Promise<PreguntaLd | null> {
  const r = await page.evaluate((fuente) => {
    const re = new RegExp(fuente);
    const h = Array.from(document.querySelectorAll('h3')).find((n) => re.test(n.textContent ?? ''));
    if (!h) return null;
    return { pregunta: (h.textContent ?? '').trim(), respuesta: h.nextElementSibling?.textContent ?? '' };
  }, patron.source);
  return r ? { pregunta: r.pregunta, respuesta: normalizar(r.respuesta) } : null;
}

test.describe('visualizador-cuerpo-numeros', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      try {
        window.localStorage.setItem('meskeia_transparency_banner_dismissed', 'true');
      } catch {
        /* sin almacenamiento */
      }
    });
    await page.goto(RUTA);
    await esperarPaginaAsentada(page);
  });

  test('CASO 1 (normal) · las comparaciones que cuadran: 1,2 millones de años, 432 km/h, 2,5 vueltas, 2.500 por hora', async ({
    page,
  }) => {
    // Estructura: 330.000 millones de células nuevas al día ÷ 86.400 s = 3,82 millones/s
    const celulas = page.getByRole('button', { name: /^Células:/ });
    await celulas.click();
    await expect(celulas).toHaveAttribute('aria-expanded', 'true');
    const porSegundo = (330_000e6 / 86_400) / 1e6;
    expect(Math.round(porSegundo * 10) / 10).toBe(3.8);
    await expect(celulas).toContainText('3,8 millones de células nuevas cada segundo');
    await expect(page.getByText(/330\.000 millones de células nuevas cada día/)).toHaveCount(1);
    // Volver a pulsar pliega la tarjeta
    await celulas.click();
    await expect(celulas).toHaveAttribute('aria-expanded', 'false');

    // Composición por peso: los cinco segmentos suman el 100 %
    const flex = await page
      .locator('[title*="%"]')
      .evaluateAll((els) => els.map((e) => Number(getComputedStyle(e).flexGrow)));
    expect(flex).toHaveLength(5);
    expect(flex.reduce((a, b) => a + b, 0)).toBe(100);

    // Sistemas: 19.000 / 40.075 = 0,474 → «casi la mitad»; 60.000 / 24 = 2.500 por hora
    await seccion(page, 'Sistemas en acción');
    expect(19_000 / 40_075).toBeGreaterThan(0.4);
    expect(19_000 / 40_075).toBeLessThan(0.5);
    expect(await desplegar(page, 'Distancia de la sangre')).toContain(
      'Casi la mitad de la circunferencia de la Tierra (40.075 km)',
    );
    expect(60_000 / 24).toBe(2_500);
    expect(await desplegar(page, 'Pensamientos')).toContain('Unos 2.500 por hora');

    // Micro: 3,72·10¹³ s ÷ 31.557.600 s/año = 1.178.794 años → «1,2 millones de años»
    await seccion(page, 'A nivel micro');
    const anios = 37.2e12 / (365.25 * 86_400) / 1e6;
    const textoCelulas = await desplegar(page, 'Células totales');
    const m = textoCelulas.match(/tardarías ([\d,]+) millones de años/);
    expect(m, 'la tarjeta da los años de contar a 1 célula/s').not.toBeNull();
    expect(numeroEs(m![1])).toBe(Math.round(anios * 10) / 10);

    // Récords: 120 m/s × 3,6 = 432 km/h · 100.000 km ÷ 40.075 km = 2,495 → «2,5 vueltas»
    await seccion(page, 'Récords');
    expect(120 * 3.6).toBe(432);
    await expect(tarjetaRecord(page, 'Velocidad nerviosa')).toContainText('120 m/s');
    await expect(tarjetaRecord(page, 'Velocidad nerviosa')).toContainText('432 km/h');
    expect(Math.round((100_000 / 40_075) * 10) / 10).toBe(2.5);
    await expect(tarjetaRecord(page, 'Vasos sanguíneos')).toContainText('100.000 km');
    await expect(tarjetaRecord(page, 'Vasos sanguíneos')).toContainText('2,5 vueltas a la Tierra');
  });

  test('CASO 2 (límite) · ADN total: 2 m × 37,2 billones = 74.400 millones de km', async ({ page }) => {
    const totalKm = (2 * 37.2e12) / 1000;
    expect(totalKm).toBe(74_400e6);
    const guia = await faqVisible(page, /ADN realmente llega/);
    expect(guia?.respuesta).toContain('74.400 millones de km');

    await seccion(page, 'A nivel micro');
    const texto = await desplegar(page, 'ADN total');
    const m = texto.match(/Unos ([\d.]+) millones de km/);
    expect(m, 'la tarjeta da el total en km').not.toBeNull();
    // «Unos 74.000» redondea 74.400: tolerancia del 2 %
    expect(Math.abs(numeroEs(m![1]) * 1e6 - totalKm) / totalKm).toBeLessThan(0.02);
  });

  test('HALLAZGO (09/11/2026, ABIERTO) [calculo/medio] · «2 × 37,2 billones = ida y vuelta al Sol... 600 veces»: son unas 249', async ({
    page,
  }) => {
    test.fail();
    await seccion(page, 'A nivel micro');
    // El total que la propia app declara (hoy «Unos 74.000 millones de km»)
    const total = (await desplegar(page, 'ADN total')).match(/Unos ([\d.]+) millones de km/);
    expect(total).not.toBeNull();
    const totalKm = numeroEs(total![1]) * 1e6;
    // 74.000 millones ÷ (2 × 149.597.870,7 km) = 247,3 (con 74.400: 248,7)
    const esperado = totalKm / (2 * UA_KM);
    const texto = await desplegar(page, 'ADN por célula');
    const m = texto.match(/(\d[\d.]*) veces/);
    expect(m, 'la tarjeta dice cuántas veces').not.toBeNull();
    // El defecto es de ×2,4: basta un 10 % de tolerancia
    expect(Math.abs(numeroEs(m![1]) - esperado) / esperado).toBeLessThan(0.1);
  });

  test('HALLAZGO (09/11/2026, ABIERTO) [calculo/medio] · CASO 3: «Sol a Plutón ×4» con 74.000 / 5.900 = 12,5 trayectos en su propio texto', async ({
    page,
  }) => {
    test.fail();
    await seccion(page, 'A nivel micro');
    const tarjeta = desplegable(page, 'ADN total');
    const texto = await desplegar(page, 'ADN total');
    const total = texto.match(/Unos ([\d.]+) millones de km/);
    const pluton = texto.match(/Plutón está a ([\d.]+) millones de km/);
    const factor = ((await tarjeta.locator('span').nth(1).textContent()) ?? '').match(/×\s*([\d,]+)/);
    expect(total).not.toBeNull();
    expect(pluton).not.toBeNull();
    expect(factor).not.toBeNull();
    const t = numeroEs(total![1]);
    const p = numeroEs(pluton![1]);
    const n = numeroEs(factor![1]);
    // El titular vale si casa con el total en trayectos de ida (t/p) o de ida y vuelta (t/2p).
    // Hoy: 74.000 / 5.900 = 12,54 y 6,27 frente a «×4» (4 × 5.900 = 23.600; 8 × 5.900 = 47.200).
    const errorIda = Math.abs(n * p - t) / t;
    const errorVuelta = Math.abs(2 * n * p - t) / t;
    expect(Math.min(errorIda, errorVuelta)).toBeLessThan(0.15);
  });

  test('HALLAZGO (09/11/2026, ABIERTO) [contenido/medio] · el ADN tiene una respuesta en la FAQ visible (74.400 millones de km) y otra en el FAQPage (50.000-170.000, «unas 4 veces»)', async ({
    page,
  }) => {
    test.fail();
    // Cualquier pregunta de la guía sobre el ADN (empiezan por «¿»), redactada como sea
    const visible = await faqVisible(page, /^¿.*ADN/);
    const ld = (await faqLd(page)).find((q) => /ADN/.test(q.pregunta));
    expect(visible).not.toBeNull();
    expect(ld).toBeDefined();
    // La reparación es UNA constante que importen las dos (check:faq-unica)
    expect(normalizar(ld!.pregunta)).toBe(visible!.pregunta);
    expect(normalizar(ld!.respuesta)).toBe(visible!.respuesta);
  });

  test('HALLAZGO (09/11/2026, ABIERTO) [contenido/bajo] · latidos «en una vida»: la página dice 2.500 millones y el FAQPage 3.000 millones', async ({
    page,
  }) => {
    test.fail();
    await seccion(page, 'Sistemas en acción');
    const pagina = (await desplegar(page, 'Latidos del corazón')).match(/([\d.]+) millones de latidos/);
    const ld = (await faqLd(page)).find((q) => /latidos/.test(q.pregunta));
    const enLd = ld?.respuesta.match(/aproximadamente ([\d.]+) millones/);
    expect(pagina).not.toBeNull();
    expect(enLd).not.toBeNull();
    // Con los 100.000 latidos/día de la app: 80 años × 365,25 × 100.000 = 2.922 millones;
    // 2.500 millones son 68,4 años. Las dos cifras tienen que ser la misma (5 %).
    const a = numeroEs(pagina![1]);
    const b = numeroEs(enLd![1]);
    expect(Math.abs(a - b) / b).toBeLessThan(0.05);
  });

  test('HALLAZGO (09/11/2026, ABIERTO) [contenido/medio] · «60.000 pensamientos/día, el 95 % repetitivos» como dato fisiológico, sin fuente', async ({
    page,
  }) => {
    test.fail();
    // Regla 1 de neutralidad editorial (CLAUDE.md §1.quinquies): cifra popular sin fuente, y la
    // guía afirma que «las cifras presentadas provienen de estudios científicos de referencia».
    await seccion(page, 'Sistemas en acción');
    await expect(desplegable(page, 'Pensamientos')).toHaveCount(0);
  });

  test('HALLAZGO (09/11/2026, ABIERTO) [contenido/medio] · las barras de «Sistemas» no van a escala: 25.000 respiraciones pintan el 75 % de los 100.000 latidos', async ({
    page,
  }) => {
    test.fail();
    await seccion(page, 'Sistemas en acción');
    const barras = await page.locator('button[aria-expanded]').evaluateAll((bs) =>
      bs
        .map((b) => {
          const fill = b.querySelector('[style*="width"]');
          if (!fill || !fill.parentElement) return null;
          const valor = b.querySelector('div > span:nth-child(3)')?.textContent ?? '';
          return {
            valor,
            fraccion: fill.getBoundingClientRect().width / fill.parentElement.getBoundingClientRect().width,
          };
        })
        .filter((x): x is { valor: string; fraccion: number } => x !== null),
    );
    // Sin barras no hay nada que medir (retirarlas es una reparación válida)
    if (barras.length === 0) return;
    const lat = barras.find((b) => /latidos\/día/.test(b.valor));
    const resp = barras.find((b) => /respiraciones\/día/.test(b.valor));
    const parp = barras.find((b) => /parpadeos\/día/.test(b.valor));
    expect(lat && resp && parp).toBeTruthy();
    // Misma magnitud (sucesos por día): 25.000 / 100.000 = 0,25 y 10.000 / 100.000 = 0,10.
    // Hoy pintan 0,75 y 0,60.
    expect(Math.abs(resp!.fraccion / lat!.fraccion - 0.25)).toBeLessThan(0.05);
    expect(Math.abs(parp!.fraccion / lat!.fraccion - 0.1)).toBeLessThan(0.05);
  });

  test('HALLAZGO 4339 (09/11/2026, REPARADO 10/11) [accesibilidad/medio] · cifras en claro por debajo del umbral: «206» a 1,40:1, «78» a 2,80:1, saliva 2,10:1', async ({
    page,
  }) => {
    // REPARADO: cada cifra lleva un tono de texto por tema (.tonoX del módulo) y el color del dato
    // se queda en el borde y la barra; la composición, la tinta de rellenoConTinta por segmento.
    // Estructura: 20,8 px / 800 = texto grande → 3:1
    const fallos: string[] = [];
    const numeros = page.locator('button[aria-label] > span:nth-child(2)');
    for (let i = 0; i < (await numeros.count()); i++) {
      const r = await contrasteSobreFondoReal(numeros.nth(i));
      if (r < 3) fallos.push(`${await numeros.nth(i).textContent()} ${r.toFixed(2)}`);
    }
    // Composición por peso: negro al 70 % sobre el color del segmento, 10,4 px → 4,5:1
    const etiquetas = page.locator('[title*="%"] span');
    await expect(numeros).toHaveCount(4);
    await expect(etiquetas).toHaveCount(5);
    for (let i = 0; i < (await etiquetas.count()); i++) {
      const r = await contrasteSobreFondoReal(etiquetas.nth(i));
      if (r < 4.5) fallos.push(`${await etiquetas.nth(i).textContent()} ${r.toFixed(2)}`);
    }
    // Sistemas: 15,2 px / 700 = texto normal → 4,5:1
    await seccion(page, 'Sistemas en acción');
    const valores = page.locator('button[aria-expanded] > div:first-child > span:nth-child(3)');
    for (let i = 0; i < (await valores.count()); i++) {
      const r = await contrasteSobreFondoReal(valores.nth(i));
      if (r < 4.5) fallos.push(`${await valores.nth(i).textContent()} ${r.toFixed(2)}`);
    }
    // Antes: 206 1,40 · 78 2,80 · «Músculos 40%» 3,97 · «Órg. 11%» 4,49 · latidos 3,82 ·
    // respiraciones 3,15 · saliva 2,10 · pensamientos 2,19
    // Que el localizador siga encontrando las seis cifras: sin ellas el test pasaría sin medir nada
    await expect(valores).toHaveCount(6);
    expect(fallos).toEqual([]);
  });

  test('HALLAZGO 4339 (09/11/2026, REPARADO 10/11) [accesibilidad/medio] · en oscuro, latidos 3,76:1, sangre 2,64:1 y parpadeos 3,07:1', async ({
    page,
  }) => {
    await page.addInitScript(() => window.localStorage.setItem('meskeia-theme', 'dark'));
    await page.goto(RUTA);
    await esperarPaginaAsentada(page);
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await seccion(page, 'Sistemas en acción');
    const fallos: string[] = [];
    const valores = page.locator('button[aria-expanded] > div:first-child > span:nth-child(3)');
    for (let i = 0; i < (await valores.count()); i++) {
      const r = await contrasteSobreFondoReal(valores.nth(i));
      if (r < 4.5) fallos.push(`${await valores.nth(i).textContent()} ${r.toFixed(2)}`);
    }
    expect(fallos).toEqual([]);
  });

  test('HALLAZGO (09/11/2026, ABIERTO) [contenido/bajo] · el % va pegado a la cifra («Músculos 40%») y las células salen como «37,2 B»', async ({
    page,
  }) => {
    test.fail();
    // Regla del 25/09/2026 (CLAUDE.md global §2): «40 %», con espacio duro U+00A0
    const etiquetas = await page.locator('[title*="%"] span').allTextContents();
    expect(etiquetas.length).toBe(5);
    for (const e of etiquetas) expect(e).toMatch(new RegExp(`\\d${ESPACIO_DURO}%$`));
    // «B» es la abreviatura inglesa de billion (10⁹): en español se lee mal
    await expect(page.getByRole('button', { name: /^Células:/ })).not.toContainText('37,2 B');
  });
});

test.describe('visualizador-cuerpo-numeros · móvil (Pixel 7)', () => {
  test.use({
    viewport: devices['Pixel 7'].viewport,
    userAgent: devices['Pixel 7'].userAgent,
    deviceScaleFactor: devices['Pixel 7'].deviceScaleFactor,
    isMobile: devices['Pixel 7'].isMobile,
    hasTouch: devices['Pixel 7'].hasTouch,
  });

  test('HALLAZGO (09/11/2026, ABIERTO) [operativa/medio] · en móvil la barra de composición corta «Huesos 15%», «Órg. 11%» y «Otros 9%» con puntos suspensivos', async ({
    page,
  }) => {
    test.fail();
    await page.goto(RUTA);
    await esperarPaginaAsentada(page);
    // El porcentaje solo está en la etiqueta y en un `title`, que en una pantalla táctil no sale
    const recortadas = await page
      .locator('[title*="%"] span')
      .evaluateAll((els) => els.filter((e) => e.scrollWidth > e.clientWidth).map((e) => e.textContent));
    // Hoy, a 412 px: «Huesos 15%» (46 px de segmento), «Órg. 11%» (34 px) y «Otros 9%» (28 px)
    expect(recortadas).toEqual([]);
  });
});
