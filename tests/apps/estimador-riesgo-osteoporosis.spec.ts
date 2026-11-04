import { test, expect, devices, type Page } from '@playwright/test';
import { esperarHidratacion } from './_hidratacion';

/**
 * estimador-riesgo-osteoporosis — regresión del 18/09/2026
 *
 * Este fichero NO nace de una inspección de esta app: nace de grepear en sus hermanas el
 * hallazgo 895, que el Inspector encontró en `test-fragilidad`. Allí, pulsar «Evaluar» sin
 * responder nada devolvía «Robusto — Sin fragilidad detectada»; aquí devolvía «🟢 Riesgo bajo
 * · No acumulas factores de riesgo significativos». El defecto es el mismo y tiene la misma
 * causa: con una sola casilla por factor, «no me aplica ninguno» y «todavía no he contestado»
 * son el mismo estado, y el veredicto tranquilizador sale igual.
 *
 * La reparación es distinta porque la app es distinta: en FRAIL los ítems son 5 y se
 * convirtieron en radios Sí/No; aquí son 12 y obligar a marcar doce «No» sería peor remedio
 * que la enfermedad, así que el primer clic sin nada marcado pide confirmación y el segundo
 * emite. Lo que se fija aquí es exactamente esa diferencia entre el silencio y la respuesta.
 *
 * ── Inspección del 04/11/2026 (primera, riesgo 1: salud) ─────────────────────────────────
 * La app suma puntos propios por factor y corta en tres niveles. Ni los pesos ni los cortes se
 * enseñan en la página ni citan fuente (FRAX y el One-Minute Test de la IOF no puntúan así);
 * los esperados de abajo salen de la regla que la app aplica en `PREGUNTAS` y `calcularRiesgo`
 * de su page.tsx, resueltos a mano ANTES de abrir el navegador:
 *   pesos  65+ 2 · 75+ 2 · fractura por fragilidad 4 · padres con fractura 2 · <57 kg 2 ·
 *          menopausia <45 2 · corticoides >3 meses 3 · artritis 2 · tabaco 1 · alcohol 1 ·
 *          sedentarismo 1 · dieta pobre en calcio 1   (suma de los 12 = 23)
 *   cortes ≤ 3 «Riesgo bajo» · 4-7 «Riesgo moderado» · ≥ 8 «Riesgo alto»
 * Los casos «HALLAZGO … ABIERTO» llevan test.fail(): afirman lo que la app DEBERÍA hacer según
 * su propio texto, y hoy no hace.
 */

const RUTA = '/estimador-riesgo-osteoporosis/';

// El nombre accesible sale hoy del aria-label («Evaluar riesgo de osteoporosis») y no del texto
// visible («Evaluar mi riesgo»): el regex vale con los dos, para que el hallazgo del nombre se
// pueda reparar sin romper los casos que solo necesitan pulsar el botón.
const botonEvaluar = (page: Page) =>
  page.getByRole('button', { name: /^Evaluar (mi riesgo|riesgo de osteoporosis)/ });
const veredicto = (page: Page) => page.locator('[role="status"]');
const avisoSinFactores = (page: Page) => page.locator('[class*="avisoSinFactores"]');
const filaFactores = (page: Page) => page.locator('[class*="puntuacionRow"]');

/** Comienzo del nombre accesible de cada casilla (sale de su <span> por aria-labelledby). */
const FACTOR = {
  edad65: 'Tengo 65 años o más',
  edad75: 'Tengo 75 años o más',
  fractura: 'He sufrido una fractura de hueso tras un golpe leve',
  padres: 'Alguno de mis padres tuvo fractura de cadera',
  peso: 'Peso menos de 57 kg',
  menopausia: 'Tuve la menopausia antes de los 45 años',
  corticoides: 'He tomado pastillas de cortisona',
  artritis: 'Tengo artritis reumatoide',
  tabaco: 'Fumo actualmente',
  alcohol: 'Bebo más de 2 bebidas alcohólicas',
  sedentarismo: 'Hago menos de 30 minutos de actividad física',
  calcio: 'Mi dieta habitualmente es baja en lácteos',
} as const;
type Factor = keyof typeof FACTOR;

async function abrir(page: Page) {
  await page.goto(RUTA);
  await esperarHidratacion(page, ['input[type="checkbox"]']);
}

const casilla = (page: Page, f: Factor) => page.getByRole('checkbox', { name: FACTOR[f] });

/** Marca los factores, pulsa «Evaluar mi riesgo» y devuelve el texto del veredicto. */
async function evaluar(page: Page, factores: readonly Factor[]): Promise<string> {
  await abrir(page);
  for (const f of factores) await casilla(page, f).check();
  await botonEvaluar(page).click();
  await expect(veredicto(page)).toBeVisible();
  return (await veredicto(page).innerText()).replace(/\s+/g, ' ');
}

test('sin marcar nada, el primer clic pide confirmación en vez de tranquilizar', async ({
  page,
}) => {
  await abrir(page);
  await botonEvaluar(page).click();

  await expect(veredicto(page)).toHaveCount(0);
  await expect(avisoSinFactores(page)).toContainText('No has marcado ningún factor de riesgo');
  await expect(avisoSinFactores(page)).toHaveAttribute('role', 'alert');
  // Y lo que NO puede haber salido es el veredicto de riesgo bajo.
  await expect(page.getByText('No acumulas factores de riesgo significativos')).toHaveCount(0);
});

test('confirmando, sí se emite el resultado de riesgo bajo', async ({ page }) => {
  await abrir(page);
  await botonEvaluar(page).click();
  await expect(avisoSinFactores(page)).toBeVisible();

  // El segundo clic es la respuesta explícita «ninguno me aplica»: ahí el veredicto sí
  // corresponde a algo que el usuario ha dicho.
  await botonEvaluar(page).click();
  await expect(veredicto(page)).toContainText('Riesgo bajo');
  await expect(avisoSinFactores(page)).toHaveCount(0);
});

test('cabo C0452: la casilla de la menopausia se llama con su «(solo mujeres)», una sola vez, y conmuta una vez con el texto o con la casilla', async ({
  page,
}) => {
  await abrir(page);
  const casillaMenopausia = page.getByRole('checkbox', {
    name: /^Tuve la menopausia antes de los 45 años.*sustitutiva \(solo mujeres\)$/,
  });
  await expect(casillaMenopausia).toHaveCount(1);
  // El texto llevaba «(solo mujeres)» escrito y además el <em> lo repetía
  const fila = page.locator('[class*="preguntaItem"]').filter({ has: casillaMenopausia });
  expect(((await fila.textContent()) ?? '').match(/solo mujeres/g)).toHaveLength(1);

  await fila.locator('[class*="preguntaTexto"]').click();
  await expect(casillaMenopausia).toBeChecked();
  await casillaMenopausia.click();
  await expect(casillaMenopausia).not.toBeChecked();
});

test('con un factor marcado el veredicto sale a la primera, sin confirmación', async ({ page }) => {
  await abrir(page);
  await page.locator('input[type="checkbox"]').first().check();

  await botonEvaluar(page).click();

  await expect(avisoSinFactores(page)).toHaveCount(0);
  await expect(veredicto(page)).toBeVisible();
});

test.describe('inspección del 04/11/2026 · la suma de puntos y sus cortes', () => {
  test('CASO 1 (normal) · 65+, fractura por fragilidad y fumadora: 2 + 4 + 1 = 7 → «Riesgo moderado», 3 de 12', async ({
    page,
  }) => {
    const texto = await evaluar(page, ['edad65', 'fractura', 'tabaco']);
    expect(texto).toContain('Riesgo moderado');
    await expect(filaFactores(page)).toContainText('3 de 12');
  });

  test('CASO 2 (umbral) · 3 puntos es «bajo», 4 es «moderado», 7 es «moderado» y 8 es «alto»', async ({
    page,
  }) => {
    // corticoides 3 → ≤ 3
    expect(await evaluar(page, ['corticoides'])).toContain('Riesgo bajo');
    // corticoides 3 + tabaco 1 = 4 → 4-7
    expect(await evaluar(page, ['corticoides', 'tabaco'])).toContain('Riesgo moderado');
    // 65+ 2 + fractura 4 + tabaco 1 = 7 → 4-7 ; + calcio 1 = 8 → ≥ 8
    expect(await evaluar(page, ['edad65', 'fractura', 'tabaco', 'calcio'])).toContain('Riesgo alto');
    await expect(filaFactores(page)).toContainText('4 de 12');
  });

  test('CASO 2 (extremo) · los 12 factores: 23 puntos → «Riesgo alto», 12 de 12', async ({ page }) => {
    const texto = await evaluar(page, Object.keys(FACTOR) as Factor[]);
    expect(texto).toContain('Riesgo alto');
    await expect(filaFactores(page)).toContainText('12 de 12');
    // Y el nivel alto es el único que manda pedir la densitometría
    await expect(page.getByText('Solicita a tu médico una densitometría ósea (DEXA)')).toBeVisible();
  });

  test('HALLAZGO (04/11/2026, ABIERTO) · da «Riesgo bajo · No acumulas factores significativos» a perfiles que la propia página califica de riesgo alto', async ({
    page,
  }) => {
    // La tabla comparativa de la página dice «Corticoides crónicos — Alto», «Edad >65 años —
    // Alto — Cribado DEXA periódico» y «Antecedentes familiares fractura — Alto»; el escenario
    // de corticoterapia, «>3 meses → indicación de densitometría»; la FAQ, que la DEXA está
    // indicada en «personas con corticoides crónicos». Con esos factores SOLOS la app suma 3, 2
    // y 2 puntos, todos ≤ 3, y contesta «🟢 Riesgo bajo · No acumulas factores de riesgo
    // significativos… Repite este test cada 2-3 años».
    test.fail();
    for (const f of ['corticoides', 'edad65', 'padres'] as const) {
      const texto = await evaluar(page, [f]);
      expect(texto, `solo «${FACTOR[f]}»`).not.toContain('No acumulas factores de riesgo significativos');
    }
  });

  test('HALLAZGO (04/11/2026, ABIERTO) · el escenario «Mujer posmenopáusica de 55 años» dice «Riesgo alto» y la app le da otro nivel', async ({
    page,
  }) => {
    // «Menopausia precoz a los 48, madre con fractura de cadera. Riesgo alto.» La casilla de
    // menopausia pide «antes de los 45», así que a los 48 no cuenta: solo los padres, 2 puntos
    // → «Riesgo bajo». Aun contándola, 2 + 2 = 4 → «Riesgo moderado». Nunca «alto».
    test.fail();
    await abrir(page);
    const escenario = page.locator('[class*="escenarioCard"]').filter({ hasText: 'Mujer posmenopáusica de 55 años' });
    const nivelEscenario = ((await escenario.textContent()) ?? '').match(/Riesgo (alto|moderado|bajo)/i)?.[0] ?? '(ninguno)';
    const texto = await evaluar(page, ['padres']);
    expect(texto.toLowerCase()).toContain(nivelEscenario.toLowerCase());
  });

  test('HALLAZGO (04/11/2026, ABIERTO) · marcar solo «75 años o más» puntúa como si no se tuviera 65', async ({
    page,
  }) => {
    // Quien tiene 75 tiene 65: por la regla de la app, 2 + 2 = 4 → «Riesgo moderado», lo mismo
    // que marcando las dos. Con solo la de 75 suma 2 → «Riesgo bajo · No acumulas…». El texto
    // «(marca además la anterior si procede)» deja en el usuario algo que siempre procede.
    test.fail();
    const conLasDos = await evaluar(page, ['edad65', 'edad75']);
    expect(conLasDos).toContain('Riesgo moderado');
    const soloLa75 = await evaluar(page, ['edad75']);
    expect(soloLa75).toBe(conLasDos);
  });
});

test.describe('inspección del 04/11/2026 · aviso, nombre del botón y metadatos', () => {
  test('HALLAZGO (04/11/2026, ABIERTO) · el aviso «No has marcado ningún factor» sigue en pantalla después de marcar uno', async ({
    page,
  }) => {
    await abrir(page);
    await botonEvaluar(page).click();
    await expect(avisoSinFactores(page)).toBeVisible();
    await casilla(page, 'edad65').check();
    await expect(page.locator('[class*="contadorRespuestas"]')).toHaveText('1 factor marcado');
    test.fail();
    await expect(avisoSinFactores(page)).toHaveCount(0, { timeout: 2000 });
  });

  test('HALLAZGO (04/11/2026, ABIERTO) · el botón no se llama como se lee: «Evaluar mi riesgo» frente a «Evaluar riesgo de osteoporosis» (WCAG 2.5.3)', async ({
    page,
  }) => {
    await abrir(page);
    test.fail();
    await expect(page.getByRole('button', { name: 'Evaluar mi riesgo' })).toHaveCount(1, { timeout: 2000 });
  });

  test('HALLAZGO (04/11/2026, ABIERTO) · la tarjeta de Twitter promete un «Test validado» y los pesos y cortes no tienen fuente', async ({
    page,
  }) => {
    await abrir(page);
    test.fail();
    await expect(page.locator('meta[name="twitter:description"]')).not.toHaveAttribute('content', /validado/i, {
      timeout: 2000,
    });
  });

  test('HALLAZGO (04/11/2026, ABIERTO) · el WebApplication va sin características y como FinanceApplication', async ({
    page,
  }) => {
    await abrir(page);
    const app = await page.evaluate(() => {
      for (const s of Array.from(document.querySelectorAll('script[type="application/ld+json"]'))) {
        const o = JSON.parse(s.textContent ?? '{}') as Record<string, unknown>;
        if (o['@type'] === 'WebApplication') return o;
      }
      return null;
    });
    expect(app).not.toBeNull();
    test.fail();
    expect((app?.featureList as unknown[] | undefined)?.length ?? 0).toBeGreaterThanOrEqual(4);
    expect(app?.applicationCategory).toBe('HealthApplication');
  });
});

test.describe('inspección del 04/11/2026 · móvil (Pixel 7)', () => {
  const { viewport, userAgent, deviceScaleFactor, isMobile, hasTouch } = devices['Pixel 7'];
  test.use({ viewport, userAgent, deviceScaleFactor, isMobile, hasTouch });

  test('CASO 3 (móvil) · tocando el TEXTO de cada pregunta: 2 + 4 + 1 = 7 → «Riesgo moderado», sin desborde', async ({
    page,
  }) => {
    await abrir(page);
    for (const f of ['edad65', 'fractura', 'tabaco'] as const) {
      await page.locator('[class*="preguntaTexto"]').filter({ hasText: FACTOR[f] }).tap();
      await expect(casilla(page, f)).toBeChecked();
    }
    await botonEvaluar(page).tap();
    await expect(veredicto(page)).toContainText('Riesgo moderado');
    await expect(filaFactores(page)).toContainText('3 de 12');
    const desborde = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(desborde).toBeLessThanOrEqual(0);
  });
});
