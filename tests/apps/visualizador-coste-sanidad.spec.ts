import { test, expect, devices, Page } from '@playwright/test';
import { esperarHidratacion, sembrarValor, sembrarValorAcotado, esperarPaginaAsentada } from './_hidratacion';

/**
 * Inspector — visualizador-coste-sanidad (segmento cálculo · riesgo 2)
 *
 * Primera inspección: 18/11/2026. La app promete en su <h1> «Lo que Cuesta Enfermarse» y en el
 * subtítulo «El coste real de la sanidad»; la metadata, «Sanidad pública vs privada explicada con
 * datos reales»; el JSON-LD, comparación entre países, coste de operaciones y «Cómo se financia la
 * sanidad española». Cuatro pestañas (Consulta, Operaciones, Urgencias, Sistema español) con cifras
 * escritas a mano en page.tsx; la única cuenta es el deslizador de la pestaña «Sistema español».
 *
 * DÓNDE VIVE EL CÁLCULO (app/visualizador-coste-sanidad/page.tsx, sin motor aparte)
 *   · Deslizador 50…200 (paso 1) = 5,0…20,0 % del PIB; etiqueta formatNumber(pos/10, 1).
 *   · costePerCapita = pos × 30 € («Aproximación simplificada», solo en un comentario): equivale a
 *     % del PIB × 30.000 € de PIB por habitante, supuesto que la pantalla no dice.
 *
 * LOS CASOS, RESUELTOS A MANO ANTES DE ABRIR EL NAVEGADOR (.inspector-trabajo/vcs-esperados.mjs)
 *   CASO 1 (normal) — arranque en 83: 8,3 % → 83 × 30 = 2.490 € («~2490,00 €/año»; con cuatro
 *     cifras enteras Intl no agrupa). La tabla de la misma pestaña da España 8,3 % y 2.500 €/hab:
 *     PIB por habitante implícito 2.500 / 0,083 = 30.120 €, coherente con el ×30. A 121: 12,1 % →
 *     3.630 €.
 *   CASO 2 (límite) — Inicio: 50 → 5,0 % → 1.500 €; Fin: 200 → 20,0 % → 6.000 €; las flechas no
 *     salen del rango.
 *   CASO 3 (rechazo) — el único valor libre es el deslizador: «300» se acota a 200 (6.000 €), «-10» a
 *     50 (1.500 €) y «abc» al valor por defecto de un range, (50 + 200) / 2 = 125 → 12,5 % → 3.750 €.
 *     Nunca NaN ni negativos.
 *
 * FUENTES OFICIALES CONSULTADAS (BOE, textos consolidados)
 *   · LGSS (RDL 8/2015, BOE-A-2015-11724), art. 109.2: la acción protectora no contributiva «se
 *     financiará mediante aportaciones del Estado al Presupuesto de la Seguridad Social», y la
 *     asistencia sanitaria transferida, por el sistema de financiación autonómica; art. 109.3.b: la
 *     asistencia sanitaria es de naturaleza NO contributiva, salvo accidente de trabajo y enfermedad
 *     profesional.
 *   · RDL 1/2015 (BOE-A-2015-8343), art. 102.5: activos 60/50/45/40 % según renta; pensionistas 10 %,
 *     salvo los de renta ≥ 100.000 €, que pagan el 60 %; art. 102.6: tope mensual de los pensionistas
 *     de renta ≥ 100.000 €, 61,75 €.
 *   · Ley 16/2003 (BOE-A-2003-10715), art. 8 ter: la cartera común suplementaria (farmacéutica,
 *     ortoprotésica, productos dietéticos y transporte sanitario no urgente) está «sujeta a aportación
 *     del usuario».
 *   Las cifras de gasto (por habitante, % del PIB, por acto) no se pudieron cotejar: el Ministerio de
 *   Sanidad, la OCDE y Eurostat están fuera de la red de fuentes de la tarea. Se juzgan por su
 *   coherencia interna (página frente a FAQPage) y por si dicen año y fuente.
 *
 * Los test con test.fail() son HALLAZGOS ABIERTOS (18/11/2026): describen lo que DEBERÍA pasar y
 * hoy no pasa. Al reparar cada uno se quita su test.fail() —comprobando antes que lo que afirma
 * sigue siendo lo correcto— y «ABIERTO» pasa a «REPARADO».
 */

test.use({ locale: 'es-ES', reducedMotion: 'reduce' });

const RUTA = '/visualizador-coste-sanidad/';
const SLIDER = '#gasto-sanitario-pib';

const etiqueta = (page: Page) => page.locator('[class*="_sliderValor"]');
const resultado = (page: Page) => page.locator('[class*="_sliderResultado"]');

/** «~2490,00 €/año» → 2490. Cifras ya escritas por la app en formato español. */
const aNumero = (t: string): number => Number(t.replace(/\./g, '').replace(',', '.'));

/** formatCurrency separa la cifra del «€» con un espacio duro (U+00A0): se compara con espacio normal. */
const espacios = (t: string): string => t.replace(/ /g, ' ');

async function estimado(page: Page): Promise<number> {
  const t = espacios((await resultado(page).textContent()) ?? '');
  const m = t.match(/~([\d.]+,\d{2}) €\/año/);
  if (!m) throw new Error(`Resultado sin cifra: «${t}»`);
  return aNumero(m[1]);
}

async function seccion(page: Page, nombre: string): Promise<void> {
  const boton = page.getByRole('navigation', { name: 'Secciones del explicador' }).getByRole('button', { name: nombre });
  await boton.click();
  await expect(boton).toHaveAttribute('aria-pressed', 'true');
}

interface FilaPais {
  pais: string;
  pib: string;
  perCapita: string;
}

async function tablaPaises(page: Page): Promise<FilaPais[]> {
  const filas = await page.locator('[class*="_comparacionFila"]').evaluateAll((fs) =>
    fs.map((f) => ({
      pais: f.querySelector('[class*="_comparacionPais"]')?.textContent ?? '',
      pib: f.querySelector('[class*="_comparacionPib"]')?.textContent ?? '',
      perCapita: f.querySelector('[class*="_comparacionPerCapita"]')?.textContent ?? '',
    })),
  );
  return filas.map((f) => ({ pais: espacios(f.pais), pib: espacios(f.pib), perCapita: espacios(f.perCapita) }));
}

interface NodoJsonLd {
  '@type'?: string;
  featureList?: string[];
  mainEntity?: { name: string; acceptedAnswer: { text: string } }[];
}

async function respuestaFaqPage(page: Page, pregunta: RegExp): Promise<string> {
  for (const b of await page.locator('script[type="application/ld+json"]').allTextContents()) {
    const d = JSON.parse(b) as NodoJsonLd & { '@graph'?: NodoJsonLd[] };
    for (const n of d['@graph'] ?? [d]) {
      if (n['@type'] !== 'FAQPage') continue;
      const q = (n.mainEntity ?? []).find((e) => pregunta.test(e.name));
      if (q) return q.acceptedAnswer.text;
    }
  }
  throw new Error(`El FAQPage no tiene la pregunta ${pregunta}`);
}

const textoGuia = async (page: Page): Promise<string> =>
  (await page.locator('[data-guia-educativa]').textContent()) ?? '';

test.beforeEach(async ({ page }) => {
  await page.goto(RUTA);
  // La pestaña de arranque no tiene ningún input que sirva de testigo de hidratación.
  await esperarPaginaAsentada(page);
});

test.describe('Deslizador «Gasto sanitario (% del PIB)»: coste per cápita = posición × 30 €', () => {
  test.beforeEach(async ({ page }) => {
    await seccion(page, 'Sistema español');
    await esperarHidratacion(page, [SLIDER]);
  });

  test('CASO 1 — arranque: 8,3 % → ~2490,00 €/año, coherente con la fila de España (2500,00 €/hab)', async ({ page }) => {
    await expect(page.locator(SLIDER)).toHaveValue('83');
    await expect(etiqueta(page)).toHaveText(/^8,3\s?%$/);
    await expect(resultado(page)).toHaveText('Coste per cápita estimado: ~2490,00 €/año'); // 83 × 30
    const espana = (await tablaPaises(page)).find((f) => f.pais === 'España');
    expect(espana).toEqual({ pais: 'España', pib: expect.stringMatching(/^8,3\s?%$/), perCapita: '2500,00 €/hab' });
    // 2.500 / 0,083 = 30.120 € de PIB por habitante frente a los 30.000 del ×30: menos de un 1 %.
    expect(Math.abs((await estimado(page)) - 2500) / 2500).toBeLessThan(0.01);
  });

  test('CASO 1 — 12,1 % → ~3630,00 €/año', async ({ page }) => {
    await sembrarValor(page, SLIDER, '121');
    await expect(etiqueta(page)).toHaveText(/^12,1\s?%$/);
    expect(await estimado(page)).toBe(3630); // 121 × 30
  });

  test('CASO 2 — Inicio: 5,0 % → ~1500,00 €/año, y ← no baja de ahí', async ({ page }) => {
    const slider = page.locator(SLIDER);
    await slider.focus();
    await page.keyboard.press('Home');
    await expect(etiqueta(page)).toHaveText(/^5,0\s?%$/);
    expect(await estimado(page)).toBe(1500); // 50 × 30
    await page.keyboard.press('ArrowLeft');
    await expect(slider).toHaveValue('50');
    expect(await estimado(page)).toBe(1500);
  });

  test('CASO 2 — Fin: 20,0 % → ~6000,00 €/año, y → no sube de ahí', async ({ page }) => {
    const slider = page.locator(SLIDER);
    await slider.focus();
    await page.keyboard.press('End');
    await expect(etiqueta(page)).toHaveText(/^20,0\s?%$/);
    expect(await estimado(page)).toBe(6000); // 200 × 30
    await page.keyboard.press('ArrowRight');
    await expect(slider).toHaveValue('200');
    expect(await estimado(page)).toBe(6000);
  });

  for (const [entrada, aceptado, pct, euros] of [
    ['300', '200', '20,0', 6000],
    ['-10', '50', '5,0', 1500],
    ['abc', '125', '12,5', 3750], // valor por defecto de un range: (50 + 200) / 2
  ] as const) {
    test(`CASO 3 — «${entrada}» se acota a ${aceptado} (${pct} % → ${euros} €), sin NaN ni negativos`, async ({ page }) => {
      expect(await sembrarValorAcotado(page, SLIDER, entrada)).toBe(aceptado);
      await expect(etiqueta(page)).toHaveText(new RegExp(`^${pct}\\s?%$`));
      expect(await estimado(page)).toBe(euros);
      await expect(page.locator('[class*="_sliderZona"]')).not.toContainText(/NaN|No definido|∞|-\d/);
    });
  }
});

test.describe('Cifras derivadas que la app sí cuadra', () => {
  test('prótesis de rodilla: 50.000 / 12.000 = 4,17 → «más de 4 veces»', async ({ page }) => {
    await seccion(page, 'Operaciones');
    const tarjeta = page.locator('[class*="_operacionCard"]').filter({ hasText: 'Prótesis rodilla' });
    await expect(tarjeta).toContainText('12.000,00 €');
    await expect(tarjeta).toContainText('50.000,00 €');
    await expect(page.locator('[class*="_insight"]')).toContainText('más de 4 veces');
  });

  test('las fuentes de financiación no dan porcentajes sin fuente y citan la LGSS', async ({ page }) => {
    // Hasta el 18/11/2026 este caso comprobaba que cinco porcentajes (38/32/20/7/3) sumaban 100,
    // pero ninguno tenía fuente y el primero contradecía la LGSS (hallazgo 5017): sumar 100 no los
    // hacía ciertos. Ahora las cuatro fuentes van sin porcentaje y con el artículo que las fija.
    await seccion(page, 'Sistema español');
    await expect(page.locator('[class*="_financiacionCard"]')).toHaveCount(4);
    await expect(page.locator('[class*="_financiacionPct"]')).toHaveCount(0);
    await expect(page.locator('[class*="_financiacionGrid"]')).toContainText('Real Decreto Legislativo 8/2015), artículo 109');
  });

  test('las cuatro pestañas se marcan con aria-pressed y cambian el encabezado', async ({ page }) => {
    for (const [nombre, sub] of [
      ['Operaciones', 'Lo que cuestan las cirugías más comunes'],
      ['Urgencias', 'El coste oculto de una visita a urgencias'],
      ['Sistema español', 'Cómo se financia nuestra sanidad pública'],
      ['Consulta médica', '¿Cuánto cuesta ir al médico de cabecera?'],
    ] as const) {
      await seccion(page, nombre);
      await expect(page.locator('[class*="_seccionSubtitulo"]')).toHaveText(sub);
      await expect(page.getByRole('button', { name: nombre, pressed: true })).toHaveCount(1);
    }
  });
});

test.describe('Hallazgos de cálculo (18/11/2026)', () => {
  test('HALLAZGO (18/11/2026, ABIERTO) · el deslizador a 17,8 % (EE.UU.) estima 5340 € y la tabla de al lado da 12.500 €/hab', async ({ page }) => {
    // ABIERTO: costePerCapita = pos × 30 aplica a cualquier % el PIB por habitante de España
    // (30.000 €) y la pantalla no lo dice. Con el % de cada país de la tabla: EE.UU. 17,8 → 5.340 €
    // (tabla 12.500), Alemania 12,7 → 3.810 (5.300), Francia 12,1 → 3.630 (4.400), Rumanía 6,3 →
    // 1.890 (1.100). Pasa a verde si el bloque dice que estima con el PIB por habitante de España o
    // si la estimación del 17,8 % queda a menos de un 10 % de la fila de EE.UU.
    test.fail();
    await seccion(page, 'Sistema español');
    await esperarHidratacion(page, [SLIDER]);
    await sembrarValor(page, SLIDER, '178');
    expect(await estimado(page)).toBe(5340);
    const eeuu = (await tablaPaises(page)).find((f) => f.pais === 'EE.UU.');
    expect(eeuu?.perCapita).toBe('12.500,00 €/hab');
    const zona = (await page.locator('[class*="_sliderZona"]').innerText()) ?? '';
    const declaraSupuesto = /PIB (por habitante|per cápita)/i.test(zona);
    const coherente = Math.abs((await estimado(page)) - 12500) / 12500 < 0.1;
    expect(declaraSupuesto || coherente).toBe(true);
  });
});

test.describe('Hallazgos de datos (18/11/2026)', () => {
  test('HALLAZGO (18/11/2026, REPARADO) · «¿De dónde sale el dinero?» da las cotizaciones sociales como primera fuente (38 %)', async ({ page }) => {
    // REPARADO: LGSS art. 109.3.b (BOE-A-2015-11724, consultado el 18/11/2026): la asistencia
    // sanitaria es de naturaleza NO contributiva «salvo que se deriven de accidentes de trabajo y
    // enfermedades profesionales» y, art. 109.2, se financia con aportaciones del Estado o el sistema
    // de financiación autonómica. El FAQPage decía lo mismo que la tarjeta: «impuestos generales del
    // Estado (IRPF, IVA, cotizaciones sociales)».
    await seccion(page, 'Sistema español');
    const tarjetas = await page.locator('[class*="_financiacionCard"]').evaluateAll((cs) =>
      cs.map((c) => ({
        fuente: c.querySelector('[class*="_financiacionFuente"]')?.textContent ?? '',
        pct: Number((c.querySelector('[class*="_financiacionPct"]')?.textContent ?? '').replace(/\D/g, '')),
      })),
    );
    const cotizaciones = tarjetas.find((t) => /cotizaciones/i.test(t.fuente));
    expect(cotizaciones?.pct ?? 0).toBeLessThan(10);
    // Las cotizaciones siguen como fuente, pero solo de la asistencia por contingencias profesionales
    expect(cotizaciones?.fuente).toBe('Cotizaciones sociales, solo en lo profesional');
    expect(tarjetas[0].fuente).toBe('Impuestos, vía la financiación autonómica');
    const faq = await respuestaFaqPage(page, /¿Cómo se financia la sanidad pública/);
    expect(faq).not.toMatch(/impuestos generales del Estado \([^)]*cotizaciones sociales/);
    expect(faq).toContain('no contributiva, salvo la asistencia por accidentes de trabajo y enfermedades profesionales');
  });

  test('HALLAZGO (18/11/2026, ABIERTO) · copago: «pensionistas entre el 0% y el 10% (con topes mensuales de 8-18 €)»', async ({ page }) => {
    // ABIERTO: RDL 1/2015 art. 102.5.a y d (BOE-A-2015-8343): el pensionista con renta ≥ 100.000 €
    // paga el 60 %, y su tope mensual (art. 102.6) es 61,75 €. La guía lo deja en 0-10 % y 8-18 €.
    test.fail();
    const guia = await textoGuia(page);
    expect(guia).toContain('El copago farmacéutico');
    expect(guia).not.toMatch(/topes mensuales de 8-18 €/);
    expect(guia).toMatch(/61,75/);
  });

  test('HALLAZGO (18/11/2026, ABIERTO) · el FAQPage dice que el copago farmacéutico es «la única aportación directa del usuario»', async ({ page }) => {
    // ABIERTO: Ley 16/2003 art. 8 ter (BOE-A-2003-10715): la prestación ortoprotésica, los productos
    // dietéticos y el transporte sanitario no urgente también están «sujetos a aportación del usuario».
    test.fail();
    const faq = await respuestaFaqPage(page, /¿Cómo se financia la sanidad pública/);
    expect(faq).not.toMatch(/única aportación directa/);
  });
});

test.describe('Hallazgos de contenido (18/11/2026)', () => {
  test('HALLAZGO (18/11/2026, ABIERTO) · gasto por habitante en España: 2500,00 € en la página, «~3.500 €» en el FAQPage', async ({ page }) => {
    // ABIERTO: la página dice «España gasta unos 2500,00 € al año por habitante» y la tabla 8,3 % del
    // PIB; el FAQPage, «~3.500 € de media en España» y un gasto público del «6-7 % del PIB, por
    // debajo de la media europea del 8 %» (la página pone a España en 8,3 %). Ninguna cifra dice año
    // ni fuente.
    test.fail();
    await seccion(page, 'Sistema español');
    await expect(page.locator('[class*="_contexto"]')).toContainText('2500,00 € al año por habitante');
    const faqEeuu = await respuestaFaqPage(page, /¿Cuánto cuesta enfermarse en Estados Unidos/);
    const m = faqEeuu.match(/~?([\d.]+) € de media en España/);
    expect(m, 'el FAQPage da un gasto por habitante para España').not.toBeNull();
    expect(Math.abs(aNumero(m![1]) - 2500) / 2500).toBeLessThan(0.1);
    const faqFin = await respuestaFaqPage(page, /¿Cómo se financia la sanidad pública/);
    const espana = (await tablaPaises(page)).find((f) => f.pais === 'España');
    const pibPagina = aNumero((espana?.pib ?? '').replace(/\s?%/, ''));
    expect(faqFin.includes('por debajo de la media europea del 8 %') && pibPagina > 8).toBe(false);
  });

  test('HALLAZGO (18/11/2026, ABIERTO) · la tabla de países y el gasto por habitante no dicen año ni fuente', async ({ page }) => {
    // ABIERTO: la única nota («aproximaciones basadas en datos públicos… OCDE, Ministerio de Sanidad,
    // Kaiser Family Foundation») va dentro de la guía, que nace plegada, y no da año.
    test.fail();
    await seccion(page, 'Sistema español');
    const visible = await page.locator('[class*="_seccionContent"]').innerText();
    expect(visible).toMatch(/\b20\d\d\b/);
    expect(visible).toMatch(/OCDE|Eurostat|Ministerio de Sanidad|OMS/);
  });

  test('HALLAZGO (18/11/2026, ABIERTO) · EE.UU.: 12.500,00 €/hab en la página y «12.500 dólares» en el FAQPage', async ({ page }) => {
    // ABIERTO: la misma cifra, en euros en la tabla y en dólares (OCDE 2022) en el FAQPage; otra
    // respuesta del FAQPage da «unos 12.000 dólares». EE.UU. va en $ en Consulta y Urgencias y en €
    // en Operaciones y en la tabla; «6 veces más barato» divide 250 $ entre 40 €.
    test.fail();
    await seccion(page, 'Sistema español');
    const eeuu = (await tablaPaises(page)).find((f) => f.pais === 'EE.UU.');
    const faq = await respuestaFaqPage(page, /¿Qué país tiene la sanidad más cara/);
    expect((eeuu?.perCapita ?? '').includes('12.500,00 €') && faq.includes('12.500 dólares')).toBe(false);
  });

  test('HALLAZGO (18/11/2026, ABIERTO) · «EE.UU. gasta casi el doble de su PIB… (17,8% vs 8,3%)»: es más del doble', async ({ page }) => {
    // ABIERTO: 17,8 / 8,3 = 2,14. «Casi el doble» es menos de 2.
    test.fail();
    await seccion(page, 'Sistema español');
    await expect(page.locator('[class*="_insight"]')).toContainText('17,8');
    await expect(page.locator('[class*="_insight"]')).not.toContainText('casi el doble', { timeout: 1000 });
  });

  test('HALLAZGO (18/11/2026, ABIERTO) · app de la suite salud (nivel 2) con «@disclaimer: exempt»: su única advertencia va en la guía plegada', async ({ page }) => {
    // ABIERTO: suites salud (nivel 2 ALTO, no colapsable) y cultura. La nota «los costes mostrados
    // son aproximaciones… varían según la comunidad autónoma» está dentro de <EducationalSection>,
    // que nace colapsada.
    test.fail();
    await expect(page.getByText('los costes mostrados son aproximaciones')).toBeHidden();
    const avisos = page.locator('[role="note"]').filter({ has: page.locator('h3') });
    await expect(avisos.first()).toBeVisible({ timeout: 1000 });
  });

  test('HALLAZGO (18/11/2026, ABIERTO) · formato: «%» pegado a la cifra y céntimos en cifras aproximadas', async ({ page }) => {
    // ABIERTO: «8,3%», «38%», «5% (bajo)», «17,8% vs 8,3%»… (CLAUDE.md global §2: «8,3 %» con espacio
    // duro); «unos 2500,00 €», «~2490,00 €/año», «~40,00 €»: una aproximación no lleva céntimos.
    test.fail();
    await seccion(page, 'Sistema español');
    const visible = espacios(await page.locator('[class*="_seccionContent"]').innerText());
    expect(visible.match(/.{0,15}\d%.{0,5}/g) ?? []).toEqual([]);
    expect(visible.match(/(~|unos )[\d.]+,00 €/g) ?? []).toEqual([]);
  });

  test('HALLAZGO (18/11/2026, ABIERTO) · neutralidad: juicios sin fuente («lo que otros países envidian», «uno de los más eficientes del mundo»)', async ({ page }) => {
    // ABIERTO: §1.quinquies. También «En España, ese problema no existe: urgencias siempre es
    // gratuito», «los hospitales cobran lo que quieren» y el 25 % de la Kaiser Family Foundation sin año.
    test.fail();
    await expect(page.locator('h1 + p')).not.toContainText('otros países envidian', { timeout: 1000 });
    await seccion(page, 'Sistema español');
    await expect(page.locator('[class*="_insight"]')).not.toContainText('uno de los más eficientes del mundo', { timeout: 1000 });
  });
});

test.describe('Hallazgos de accesibilidad (18/11/2026)', () => {
  test('HALLAZGO (18/11/2026, ABIERTO) · el deslizador anuncia «83», no «8,3 %»', async ({ page }) => {
    // ABIERTO: sin aria-valuetext el lector lee el valor crudo de la escala ×10 (83, 200…); el % va en
    // un aria-label que cambia con cada paso.
    test.fail();
    await seccion(page, 'Sistema español');
    await esperarHidratacion(page, [SLIDER]);
    await expect(page.locator(SLIDER)).toHaveAttribute('aria-valuetext', /8,3\s?%/, { timeout: 1000 });
  });

  test('HALLAZGO (18/11/2026, ABIERTO) · las banderas de «Lo que pagas según el país» se leen junto al nombre', async ({ page }) => {
    // ABIERTO: costesOcultos[].pais = '🇺🇸 EE.UU.' se pinta en un <span> sin aria-hidden: el lector
    // dice «bandera: Estados Unidos EE.UU.». check:a11y-jsx no ve un emoji dentro de un array de datos.
    test.fail();
    await seccion(page, 'Urgencias');
    const arbol = await page.locator('[class*="_costesGrid"]').ariaSnapshot();
    expect(arbol).toContain('EE.UU.');
    expect(arbol).not.toMatch(/[\u{1F1E6}-\u{1F1FF}]/u);
  });

  test('en oscuro la tarjeta del gráfico de operaciones es oscura (premisa del caso siguiente)', async ({ page }) => {
    await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
    await esperarPaginaAsentada(page);
    await seccion(page, 'Operaciones');
    const fondo = await page.locator('[class*="_chartContainer"]').evaluate((e) => getComputedStyle(e).backgroundColor);
    expect(fondo).toBe('rgb(42, 42, 42)');
  });

  test('HALLAZGO (18/11/2026, ABIERTO) · en oscuro los ejes y la leyenda del gráfico quedan a 2,50:1', async ({ page }) => {
    // ABIERTO: el gráfico no fija colores y Chart.js pinta el texto en su #666 por defecto; sobre la
    // tarjeta oscura (#2A2A2A) da 2,50:1, por debajo de 4,5:1 (texto de 12 px).
    test.fail();
    await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
    await esperarPaginaAsentada(page);
    await seccion(page, 'Operaciones');
    await esperarPaginaAsentada(page);
    const r = await page.locator('canvas').evaluate((c) => {
      const lum = (rgb: number[]): number => {
        const f = (v: number): number => {
          const s = v / 255;
          return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
        };
        return 0.2126 * f(rgb[0]) + 0.7152 * f(rgb[1]) + 0.0722 * f(rgb[2]);
      };
      const lienzo = c as HTMLCanvasElement;
      const g = lienzo.getContext('2d')!;
      const datos = g.getImageData(0, 0, Math.min(70, lienzo.width), lienzo.height).data;
      const cuenta = new Map<string, number>();
      for (let i = 0; i < datos.length; i += 4) {
        if (datos[i + 3] < 250) continue;
        const k = `${datos[i]},${datos[i + 1]},${datos[i + 2]}`;
        cuenta.set(k, (cuenta.get(k) ?? 0) + 1);
      }
      const texto = [...cuenta.entries()].sort((a, b) => b[1] - a[1])[0][0].split(',').map(Number);
      const contenedor = lienzo.closest('[class*="_chartContainer"]') as HTMLElement;
      const fondo = (getComputedStyle(contenedor).backgroundColor.match(/\d+/g) ?? []).map(Number);
      const [a, b] = [lum(texto), lum(fondo)].sort((x, y) => y - x);
      return (a + 0.05) / (b + 0.05);
    });
    expect(r).toBeGreaterThanOrEqual(4.5);
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

  test('con el dedo: las pestañas y el deslizador responden, sin desborde horizontal', async ({ page }) => {
    for (const nombre of ['Operaciones', 'Urgencias', 'Sistema español']) {
      const boton = page.getByRole('button', { name: nombre });
      await boton.tap();
      await expect(boton).toHaveAttribute('aria-pressed', 'true');
      const anchos = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
      expect(anchos.sw, nombre).toBeLessThanOrEqual(anchos.cw);
    }
    await esperarHidratacion(page, [SLIDER]);
    const slider = page.locator(SLIDER);
    await slider.scrollIntoViewIfNeeded();
    const caja = await slider.boundingBox();
    if (!caja) throw new Error('El deslizador no tiene caja');
    await page.touchscreen.tap(caja.x + caja.width - 2, caja.y + caja.height / 2);
    await expect(slider).toHaveValue('200');
    expect(await estimado(page)).toBe(6000);
  });
});
