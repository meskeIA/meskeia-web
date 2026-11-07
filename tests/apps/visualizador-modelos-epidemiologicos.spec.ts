import { test, expect } from '@playwright/test';
import type { Locator, Page } from '@playwright/test';
import { esperarHidratacion, sembrarValor, sembrarValorAcotado } from './_hidratacion';

/**
 * visualizador-modelos-epidemiologicos — Inspector, 04/11/2026 (primera inspección)
 *
 * Lo que promete: «Modelos Epidemiológicos — simulador interactivo de modelos SIR y SEIR».
 * Cuatro pestañas: Simulador SIR (β, γ, I₀ con N = 1.000 fijo, 200 días), Modelo SEIR (σ y
 * comparativa SIR frente a SEIR con I₀ = 5), Rₜ y Control (medidas que reducen β) y una tabla
 * de cinco enfermedades con un botón «Simular» que, según la propia página, «carga
 * automáticamente sus parámetros en el Simulador SIR».
 *
 * CÓMO CALCULA: Euler explícito con paso de 1 día (lo declara el `features` del JSON-LD), con
 * dos recortes: I < 0,5 → 0 y, en el SEIR, también E < 0,5 → 0.
 *
 * DE DÓNDE SALEN LOS ESPERADOS (calculados antes de abrir la app, scripts del Inspector
 * `.inspector-trabajo/epi-calculo.mjs`, `epi-rejilla.mjs` y `epi-calculo-flujos.mjs`):
 *   · R₀ = β/γ y umbral de inmunidad colectiva 1 − 1/R₀: exactos.
 *   · Pico del SIR continuo, fórmula cerrada con S₀ + I₀ = N:
 *         I_max = N − (N/R₀)·(1 + ln(R₀·S₀/N))
 *   · Tamaño final: ln(S∞/S₀) = −R₀·(N − S∞)/N (bisección), y RK4 con paso 0,001 día.
 *   · El MISMO esquema de la app (Euler, paso 1 día, mismos recortes) reproducido aparte.
 *
 *   caso                       R₀     pico cerrado/RK4   pico Euler 1 d   día RK4/Euler   afectados RK4/Euler
 *   β 0,30 γ 0,10 I₀ 5         3,00   302,1              314,2            30,2 / 32       94,1 % / 94,6 %
 *   β 0,50 γ 0,20 I₀ 10        2,50   237,5              253,5            16,5 / 18       89,4 % / 90,7 %
 *   β 0,80 γ 0,05 I₀ 20        16,00  765,5              811,1             9,0 / 10      100 %   / 100 %
 *   β 0,10 γ 0,50 I₀ 1         0,20   1 (no despega)     1                 0 / 0           0,1 % / 0,1 %
 *   β 0,15 γ 0,10 I₀ 5         1,50   66,4               67,3             80,2 / 82       58,5 % / 58,8 %
 *   β 0,26 γ 0,20 I₀ 5 (gripe) 1,30   32,8               33,4             51,6 / 53       43,4 % / 43,6 %
 *   SEIR β 0,30 γ 0,10 σ 0,20  3,00   197,5 (RK4)        203,1            58,1 / 60
 *   SEIR β 0,10 γ 0,05 σ 0,20  2,00   124,3 (RK4)        125,5 sin recorte, 5 con él   143,2 / 145
 *
 * Los casos de cálculo «normales» aceptan una BANDA que contiene a la vez el valor continuo y
 * el de Euler a 1 día: así siguen valiendo si se repara el hallazgo del paso de integración,
 * que vigila aparte su propio caso con la tolerancia estrecha (±3 personas, el 1 %).
 *
 * Cabos que esta inspección respondía:
 *   · C0484 (<label> de crearSlider sin control): NO se sostiene. Lo reparó c9b10256 (31/10):
 *     htmlFor/id con useId + símbolo; pulsar la etiqueta lleva el foco al deslizador.
 *   · C0485 (aria-label con el valor sin formato español, que tapa la etiqueta): CONFIRMADO.
 *   · C0511 (valor visible del deslizador con toFixed(2): «0.30», «5.00»): CONFIRMADO.
 *
 * REPARACIÓN del 04/11/2026 (/reparar, hallazgos 4029-4039): RK4 con 10 subpasos por día y sin
 * recortes, parámetros del SIR y del SEIR en el componente principal para que «Simular» de la
 * tabla los cargue (β acotada a 0,8, con aviso), umbral acotado a 0 %, deslizadores sin
 * aria-label y con el valor en formato español, formato español en resultados y textos, un solo
 * WebApplication, FAQ «aplanar la curva» corregida, «R₀ ≤ 1» y el mismo σ para la gripe. Los
 * casos que eran test.fail() pasan a REPARADO. Con RK4, los valores del SIR son los de la columna
 * «cerrado/RK4» de la tabla de arriba.
 *
 * CABO C0632 (Inspector, 07/11/2026, modo cabo): las letalidades de la tabla de enfermedades y la
 * σ de la gripe, cotejadas con la OMS y el ECDC (en la red de fuentes oficiales desde el
 * 04/11/2026). Las citas literales y sus URL van en cada caso del bloque final. Anclado:
 * sarampión «0,2 %» (dentro del 1-3 por 1.000 del ECDC). Hallazgos (test.fail): Ébola «brote
 * 2014» «50-90 %» (la OMS: 11.325 muertes en más de 28.600 casos, ≤ 39,6 %), COVID-19 «1-3 %»
 * (la OMS: IFR 0,5-1 %; CFR de < 0,1 % a > 25 % según el país), la columna «Mortalidad» para
 * cifras que la OMS llama «tasa de letalidad», y la gripe «σ ≈ 0,33 (≈ 3 días)» (OMS y ECDC:
 * incubación de 2 días de media, de 1 a 4).
 */

const URL_APP = '/visualizador-modelos-epidemiologicos/';
const DESLIZADORES = 'main input[type="range"]';

/**
 * «3.00», «3,00», «1.0», «67%», «67 %», «+28d», «−400» → número. El punto se lee como decimal
 * salvo en un grupo de millares de verdad («1.000»), para que el caso siga valiendo cuando la
 * app pase a formato español.
 */
function aNumero(texto: string): number {
  const limpio = texto.replace(/[\s %d+]/g, '').replace(/−/g, '-');
  if (limpio.includes(',')) return Number(limpio.replace(/\./g, '').replace(',', '.'));
  if (/^-?[1-9]\d{0,2}(\.\d{3})+$/.test(limpio)) return Number(limpio.replace(/\./g, ''));
  return Number(limpio);
}

function deslizador(page: Page, n: number): Locator {
  return page.locator(DESLIZADORES).nth(n);
}

/** La cifra grande de la tarjeta cuyo rótulo es exactamente `rotulo`. */
function metrica(page: Page, rotulo: string | RegExp): Locator {
  return page
    .locator('main [class*="metricaCard"]')
    .filter({ has: page.locator('[class*="metricaLabel"]').filter({ hasText: rotulo }) })
    .locator('[class*="metricaValor"]');
}

async function leer(loc: Locator): Promise<number> {
  return aNumero((await loc.textContent()) ?? '');
}

/** El día que va entre paréntesis en el rótulo «Pico SIR (día 32)». */
async function diaDelRotulo(page: Page, prefijo: string): Promise<number> {
  const rotulo = page
    .locator('main [class*="metricaLabel"]')
    .filter({ hasText: new RegExp(`^${prefijo} \\(día`) });
  const m = /día (\d+)/.exec((await rotulo.textContent()) ?? '');
  return m ? Number(m[1]) : NaN;
}

async function abrir(page: Page): Promise<void> {
  await page.goto(URL_APP);
  await esperarHidratacion(page, [DESLIZADORES]);
}

async function irAPestana(page: Page, nombre: RegExp): Promise<void> {
  await page.getByRole('navigation', { name: 'Secciones del visualizador' })
    .getByRole('button', { name: nombre }).click();
}

/** Fija β, γ e I₀ del Simulador SIR (los tres primeros deslizadores de la pestaña). */
async function fijarSIR(page: Page, beta: number, gamma: number, i0: number): Promise<void> {
  await sembrarValor(page, deslizador(page, 0), beta);
  await sembrarValor(page, deslizador(page, 1), gamma);
  await sembrarValor(page, deslizador(page, 2), i0);
}

const R0_SIR = 'Número reproductivo básico R₀';
const PICO_SIR = 'Pico de infectados simultáneos';
const DIA_SIR = 'Día del pico de infección';
const AFECTADOS_SIR = '% población afectada al final';

test.describe('Simulador SIR — casos resueltos a mano', () => {
  test.beforeEach(async ({ page }) => {
    await abrir(page);
  });

  test('normal · valores iniciales β 0,30 γ 0,10 I₀ 5: R₀ 3, umbral 67 %, pico ~302-314 el día 30-32', async ({ page }) => {
    // R₀ = 0,3/0,1 = 3 · umbral 1 − 1/3 = 66,7 % → 67 · pico cerrado 302,1 (Euler 1 d: 314,2)
    // día RK4 30,2 (Euler 32) · afectados al día 200: 94,1 % (Euler 94,6 % → 95).
    expect(await leer(metrica(page, R0_SIR))).toBeCloseTo(3, 2);
    await expect(page.locator('main [class*="r0Box"]')).toContainText('Epidemia');
    await expect(page.locator('main [class*="r0Box"]')).toContainText(/inmunidad colectiva es 67\s?%/);
    const pico = await leer(metrica(page, PICO_SIR));
    expect(pico).toBeGreaterThanOrEqual(301);
    expect(pico).toBeLessThanOrEqual(315);
    const dia = await leer(metrica(page, DIA_SIR));
    expect(dia).toBeGreaterThanOrEqual(30);
    expect(dia).toBeLessThanOrEqual(32);
    const afectados = await leer(metrica(page, AFECTADOS_SIR));
    expect(afectados).toBeGreaterThanOrEqual(94);
    expect(afectados).toBeLessThanOrEqual(95);
  });

  test('normal · β 0,50 γ 0,20 I₀ 10: R₀ 2,5, umbral 60 %, pico ~238-253', async ({ page }) => {
    await fijarSIR(page, 0.5, 0.2, 10);
    // R₀ = 2,5 · umbral 1 − 1/2,5 = 60 % · pico cerrado 237,5 (Euler 253,5) · día 16,5 (Euler 18)
    // · afectados 89,4 % (Euler 90,7 % → 91).
    expect(await leer(metrica(page, R0_SIR))).toBeCloseTo(2.5, 2);
    await expect(page.locator('main [class*="r0Box"]')).toContainText(/inmunidad colectiva es 60\s?%/);
    const pico = await leer(metrica(page, PICO_SIR));
    expect(pico).toBeGreaterThanOrEqual(236);
    expect(pico).toBeLessThanOrEqual(254);
    const dia = await leer(metrica(page, DIA_SIR));
    expect(dia).toBeGreaterThanOrEqual(16);
    expect(dia).toBeLessThanOrEqual(18);
    const afectados = await leer(metrica(page, AFECTADOS_SIR));
    expect(afectados).toBeGreaterThanOrEqual(89);
    expect(afectados).toBeLessThanOrEqual(91);
  });

  test('límite · β 0,10 γ 0,50 I₀ 1: R₀ 0,2 y la epidemia no despega', async ({ page }) => {
    await fijarSIR(page, 0.1, 0.5, 1);
    // R₀ = 0,1/0,5 = 0,2 < 1 → dI/dt < 0 desde el primer día: el pico es el propio I₀ = 1 en el
    // día 0 y al final queda afectado el 0,1 % (RK4 0,125 %, Euler 0,08 %) → 0.
    expect(await leer(metrica(page, R0_SIR))).toBeCloseTo(0.2, 2);
    await expect(page.locator('main [class*="r0Box"]')).toContainText('Extinción');
    expect(await leer(metrica(page, PICO_SIR))).toBeCloseTo(1, 1);
    expect(await leer(metrica(page, DIA_SIR))).toBe(0);
    expect(await leer(metrica(page, AFECTADOS_SIR))).toBe(0);
  });

  test('tramo más alto · β 0,80 γ 0,05 I₀ 20: R₀ 16, umbral 94 %, pico ~766-811', async ({ page }) => {
    await fijarSIR(page, 0.8, 0.05, 20);
    // R₀ = 16 · umbral 1 − 1/16 = 93,75 % → 94 · pico cerrado 765,5 (Euler 811,1) · día 9,0
    // (Euler 10) · afectados 100 %.
    expect(await leer(metrica(page, R0_SIR))).toBeCloseTo(16, 2);
    await expect(page.locator('main [class*="r0Box"]')).toContainText(/inmunidad colectiva es 94\s?%/);
    const pico = await leer(metrica(page, PICO_SIR));
    expect(pico).toBeGreaterThanOrEqual(764);
    expect(pico).toBeLessThanOrEqual(812);
    const dia = await leer(metrica(page, DIA_SIR));
    expect(dia).toBeGreaterThanOrEqual(9);
    expect(dia).toBeLessThanOrEqual(10);
    expect(await leer(metrica(page, AFECTADOS_SIR))).toBe(100);
  });

  test('rechazo · β 5, γ 0 e I₀ 0, −3 o 2,5 los recorta el deslizador a su rango y su paso', async ({ page }) => {
    // β máx 0,8 · γ mín 0,05 (γ = 0 daría R₀ infinito) · I₀ mín 1 · I₀ paso 1: 2,5 → 3
    // (HTML: empate al valor mayor). Con β 0,8 y γ 0,05, R₀ = 16 y umbral 93,75 % → 94.
    expect(await sembrarValorAcotado(page, deslizador(page, 0), 5)).toBe('0.8');
    expect(await sembrarValorAcotado(page, deslizador(page, 1), 0)).toBe('0.05');
    expect(await sembrarValorAcotado(page, deslizador(page, 2), 0)).toBe('1');
    expect(await sembrarValorAcotado(page, deslizador(page, 2), 2.5)).toBe('3');
    expect(await sembrarValorAcotado(page, deslizador(page, 2), -3)).toBe('1');
    expect(await leer(metrica(page, R0_SIR))).toBeCloseTo(16, 2);
    await expect(page.locator('main [class*="r0Box"]')).toContainText(/inmunidad colectiva es 94\s?%/);
    await expect(page.locator('main')).not.toContainText(/NaN|Infinity/);
  });

  test('reducir β cambia el total de afectados sin vacunar a nadie: 95 % → 58-59 %', async ({ page }) => {
    // Base del hallazgo de la FAQ «aplanar la curva». Tamaño final con γ 0,10: R₀ 3 → 94,1 %
    // (Euler 94,6) · R₀ 1,5 → 58,5 % (Euler 58,8). El área bajo I(t) es R∞/γ: también baja.
    const antes = await leer(metrica(page, AFECTADOS_SIR));
    await sembrarValor(page, deslizador(page, 0), 0.15);
    const despues = await leer(metrica(page, AFECTADOS_SIR));
    expect(antes).toBeGreaterThanOrEqual(94);
    expect(despues).toBeGreaterThanOrEqual(58);
    expect(despues).toBeLessThanOrEqual(59);
  });

  test('REPARADO (4032) · el pico es el del modelo SIR continuo que enseña la página (302 ± 3), no el de Euler a 1 día', async ({ page }) => {
    // REPARADO el 04/11/2026: RK4 a 0,1 día. Euler con paso de 1 día sobrestimaba el pico del SIR
    // continuo de las ecuaciones de la página. Fórmula cerrada con β 0,3, γ 0,1, S₀ 995, I₀ 5:
    // I_max = 1000 − (1000/3)·(1 + ln(2,985)) = 302,1. La app daba 314 (+4 %); en el rango de los
    // deslizadores llegaba al +11 % (β 0,8 γ 0,25: 362 frente a 325,6).
    const pico = await leer(metrica(page, PICO_SIR));
    expect(Math.abs(pico - 302.1)).toBeLessThanOrEqual(3);
    await fijarSIR(page, 0.8, 0.25, 5);
    // Peor caso del rango con Euler: con R₀ 3,2, S₀ 995: 1000 − (1000/3,2)·(1 + ln(3,184)) = 325,6
    expect(Math.abs((await leer(metrica(page, PICO_SIR))) - 325.6)).toBeLessThanOrEqual(3);
  });

  test('REPARADO (4038) · con R₀ = 1,00 no dice «R₀ < 1»', async ({ page }) => {
    // β 0,10 γ 0,10 → R₀ = 1 exacto. No hay epidemia (S < N ⇒ dI/dt < 0); el texto de la rama
    // «Extinción» afirmaba «R₀ < 1» con un R₀ = 1.00 encima. Ahora «R₀ ≤ 1». (γ ya vale 0,10.)
    await sembrarValor(page, deslizador(page, 0), 0.1);
    expect(await leer(metrica(page, R0_SIR))).toBeCloseTo(1, 2);
    await expect(page.locator('main [class*="r0Box"]')).not.toContainText('R₀ < 1');
    await expect(page.locator('main [class*="r0Box"]')).toContainText('R₀ ≤ 1');
  });
});

test.describe('Modelo SEIR', () => {
  test.beforeEach(async ({ page }) => {
    await abrir(page);
    await irAPestana(page, /Modelo SEIR/);
    await esperarHidratacion(page, [DESLIZADORES]);
  });

  test('normal · β 0,30 γ 0,10 σ 0,20: el pico SEIR es más bajo y llega ~28 días después', async ({ page }) => {
    // RK4: pico SIR 302,1 el día 30,2 · pico SEIR 197,5 el día 58,1 → retraso 27,9 d.
    // Euler 1 d: 314,2 (día 32) · 203,1 (día 60) → +28.
    expect(await leer(metrica(page, 'R₀ (ambos modelos)'))).toBeCloseTo(3, 2);
    const picoSEIR = await leer(metrica(page, /^Pico SEIR/));
    expect(picoSEIR).toBeGreaterThanOrEqual(196);
    expect(picoSEIR).toBeLessThanOrEqual(204);
    const diaSEIR = await diaDelRotulo(page, 'Pico SEIR');
    expect(diaSEIR).toBeGreaterThanOrEqual(58);
    expect(diaSEIR).toBeLessThanOrEqual(60);
    const retraso = await leer(metrica(page, 'Retraso del pico por incubación'));
    expect(retraso).toBeGreaterThanOrEqual(27);
    expect(retraso).toBeLessThanOrEqual(29);
  });

  test('REPARADO (4030) · β 0,10 γ 0,05 (R₀ 2): el SEIR también despega, y el retraso no sale negativo', async ({ page }) => {
    // REPARADO el 04/11/2026 (sin recortes, RK4). El recorte «E < 0,5 → 0» borraba los expuestos
    // del primer día (0,1·995·5/1000 = 0,4975 < 0,5) y de todos los siguientes: la epidemia SEIR
    // no arrancaba nunca aunque R₀ = 2, y la app pintaba «Pico SEIR (día 0) 5.0» y «+-104d».
    // Esperado (RK4): pico SEIR 124,3 el día 143,2; el SIR de al lado: 157,8 el día 104 →
    // retraso ≈ +39 días (el ≈ +41 del acta era el del Euler a 1 día sin el recorte).
    await sembrarValor(page, deslizador(page, 0), 0.1);
    await sembrarValor(page, deslizador(page, 1), 0.05);
    expect(await leer(metrica(page, 'R₀ (ambos modelos)'))).toBeCloseTo(2, 2);
    const picoSEIR = await leer(metrica(page, /^Pico SEIR/));
    expect(picoSEIR).toBeGreaterThanOrEqual(120);
    expect(picoSEIR).toBeLessThanOrEqual(130);
    await expect(metrica(page, 'Retraso del pico por incubación')).not.toContainText('-');
    expect(await leer(metrica(page, 'Retraso del pico por incubación'))).toBeGreaterThanOrEqual(30);
  });

  test('REPARADO (4039) · la gripe lleva el mismo σ en los dos textos de la pestaña', async ({ page }) => {
    // REPARADO el 04/11/2026: el recuadro «Compartimento E» decía «Gripe: σ ≈ 0.5 (≈ 2 días)» y
    // la nota de los deslizadores «Gripe: β=0.26, γ=0.2, σ=0.33» (el preset de la tabla). Ahora
    // los dos dicen 0,33 (≈ 3 días), el valor del preset que se simula. Desde el 07/11/2026 los
    // dos dicen 0,5 (≈ 2 días), el de la OMS y el ECDC (hallazgo 4187, más abajo).
    const texto = (await page.locator('main').textContent()) ?? '';
    const sigmas = [...texto.matchAll(/Gripe:[^\n]*?σ\s*[=≈]\s*(\d+[.,]\d+)/g)].map((m) => aNumero(m[1]));
    expect(sigmas.length).toBeGreaterThanOrEqual(2);
    expect(new Set(sigmas).size).toBe(1);
  });
});

test.describe('Rₜ y medidas de control', () => {
  test.beforeEach(async ({ page }) => {
    await abrir(page);
    await irAPestana(page, /Rₜ y Control/);
    await esperarHidratacion(page, ['#rt-beta', '#rt-gamma', '#rt-control']);
  });

  test('normal · control 50 % con β 0,30 γ 0,10: β efectiva 0,15, R₀ efectivo 1,5, umbral 33 %', async ({ page }) => {
    // β·(1 − 0,5) = 0,15 · 0,15/0,1 = 1,5 · 1 − 1/1,5 = 33,3 % → 33.
    await sembrarValor(page, '#rt-control', 50);
    const desc = (await page.locator('main [class*="sliderDesc"]').nth(2).textContent()) ?? '';
    const bEf = aNumero(/β efectiva = ([\d.,]+)/.exec(desc)?.[1] ?? 'NaN');
    const r0Ef = aNumero(/R₀ efectivo = ([\d.,]+)/.exec(desc)?.[1] ?? 'NaN');
    expect(bEf).toBeCloseTo(0.15, 3);
    expect(r0Ef).toBeCloseTo(1.5, 2);
    expect(await leer(metrica(page, 'Umbral inmunidad colectiva necesario'))).toBe(33);
  });

  test('REPARADO (4031) · con R₀ 0,2 y sin control el umbral de inmunidad es 0 %, no −400 %', async ({ page }) => {
    // REPARADO el 04/11/2026: con control = 0 la app calculaba (1 − 1/R₀)·100 sin acotar, y con
    // β 0,10 γ 0,50 (R₀ 0,2) pintaba «-400%». Con R₀ ≤ 1 no hace falta inmunidad alguna: 0 %.
    await sembrarValor(page, '#rt-beta', 0.1);
    await sembrarValor(page, '#rt-gamma', 0.5);
    await expect(metrica(page, 'Umbral inmunidad colectiva necesario')).not.toContainText('-');
    expect(await leer(metrica(page, 'Umbral inmunidad colectiva necesario'))).toBe(0);
  });
});

test.describe('Comparativa de enfermedades', () => {
  test('REPARADO (4029) · «Simular» gripe carga β 0,26 y γ 0,20 en el Simulador SIR (R₀ 1,3)', async ({ page }) => {
    // REPARADO el 04/11/2026. La página promete «Pulsa "Simular" en cualquier fila para cargar
    // automáticamente sus parámetros en el Simulador SIR» (y la FAQ, «parámetros
    // preconfigurados para cinco enfermedades»), pero handleSeleccionarEnfermedad ignoraba la
    // enfermedad y solo cambiaba de pestaña: el SIR se montaba con sus valores iniciales y daba
    // R₀ = 3.00 para la gripe. Esperado con β 0,26 γ 0,20 I₀ 5: R₀ 1,30, umbral 23 %, pico
    // 32,8 el día 51,6, afectados 43,4 %.
    await abrir(page);
    await irAPestana(page, /Enfermedades/);
    await page.getByRole('button', { name: /^Simular Gripe estacional/ }).click();
    await esperarHidratacion(page, [DESLIZADORES]);
    await expect(page.locator('main [role="status"]')).toContainText('Gripe estacional — cargada en el Simulador SIR');
    expect(await leer(metrica(page, R0_SIR))).toBeCloseTo(1.3, 2);
    await expect(page.locator('main [class*="r0Box"]')).toContainText(/inmunidad colectiva es 23\s?%/);
    const pico = await leer(metrica(page, PICO_SIR));
    expect(pico).toBeGreaterThanOrEqual(32);
    expect(pico).toBeLessThanOrEqual(34);
    const dia = await leer(metrica(page, DIA_SIR));
    expect(dia).toBeGreaterThanOrEqual(51);
    expect(dia).toBeLessThanOrEqual(53);
    expect(await leer(metrica(page, AFECTADOS_SIR))).toBe(43);
  });

  test('REPARADO (4029) · «Simular» sarampión recorta β a 0,8 (R₀ 8) y lo avisa; el SEIR recibe su σ', async ({ page }) => {
    // Sarampión β 1,5, γ 0,1, σ 0,25: β pasa del máximo del deslizador (0,8) → R₀ = 0,8/0,1 = 8.
    await abrir(page);
    await irAPestana(page, /Enfermedades/);
    await page.getByRole('button', { name: /^Simular Sarampión/ }).click();
    await esperarHidratacion(page, [DESLIZADORES]);
    expect(await leer(metrica(page, R0_SIR))).toBeCloseTo(8, 2);
    await expect(page.locator('main [role="status"]')).toContainText('se ha recortado a 0,8');
    await irAPestana(page, /Modelo SEIR/);
    await esperarHidratacion(page, [DESLIZADORES]);
    await expect(page.locator('main [class*="sliderValor"]').nth(2)).toHaveText('0,25');
  });
});

test.describe('Cabos C0484, C0485 y C0511 — deslizadores', () => {
  test.beforeEach(async ({ page }) => {
    await abrir(page);
  });

  test('C0484 (no se sostiene, reparado en c9b10256) · cada etiqueta de crearSlider rotula su deslizador', async ({ page }) => {
    // Pulsar el texto de la etiqueta lleva el foco al deslizador: htmlFor = id = useId + símbolo.
    for (let n = 0; n < 3; n++) {
      expect(await deslizador(page, n).evaluate((el) => (el as HTMLInputElement).labels?.length ?? 0)).toBe(1);
    }
    await page.locator('main label').first().click();
    await expect(deslizador(page, 0)).toBeFocused();
    await irAPestana(page, /Modelo SEIR/);
    await esperarHidratacion(page, [DESLIZADORES]);
    for (let n = 0; n < 3; n++) {
      expect(await deslizador(page, n).evaluate((el) => (el as HTMLInputElement).labels?.length ?? 0)).toBe(1);
    }
    await page.locator('main label').nth(2).click();
    await expect(deslizador(page, 2)).toBeFocused();
  });

  test('REPARADO (4033) · C0485 · el nombre accesible no lleva el valor en formato inglés y contiene la etiqueta visible', async ({ page }) => {
    // REPARADO el 04/11/2026: el aria-label tapaba la etiqueta: el lector anunciaba «Tasa de
    // transmisión: 0.3» (y otra vez «0.3» como valor). En Rₜ, «Beta tasa transmisión: 0.3» no
    // contenía la etiqueta visible «Tasa de transmisión» (WCAG 2.5.3), y «…de control: 50%» pegaba
    // el %. Ahora nombra la etiqueta, y aria-valuetext lleva el valor en formato español.
    await expect(deslizador(page, 0)).not.toHaveAccessibleName(/\d\.\d/);
    await expect(deslizador(page, 0)).toHaveAccessibleName(/β Tasa de transmisión/);
    await expect(deslizador(page, 0)).toHaveAttribute('aria-valuetext', '0,30');
    await irAPestana(page, /Rₜ y Control/);
    await esperarHidratacion(page, ['#rt-beta', '#rt-control']);
    await expect(page.locator('#rt-beta')).toHaveAccessibleName(/Tasa de transmisión/);
    await expect(page.locator('#rt-gamma')).toHaveAccessibleName(/Tasa de recuperación/);
    await expect(page.locator('#rt-beta')).not.toHaveAccessibleName(/\d\.\d/);
    await sembrarValor(page, '#rt-control', 50);
    await expect(page.locator('#rt-control')).not.toHaveAccessibleName(/\d%/);
    await expect(page.locator('label[for="rt-beta"] [class*="sliderValor"]')).toHaveText('0,30');
    await expect(page.locator('label[for="rt-gamma"] [class*="sliderValor"]')).toHaveText('0,10');
  });

  test('REPARADO (4034) · C0511 · el valor visible del deslizador va en formato español y sin decimales en I₀', async ({ page }) => {
    // REPARADO el 04/11/2026: valor.toFixed(2) pintaba «0.30», «0.10» y «5.00» (paso 1).
    const valores = page.locator('main [class*="sliderValor"]');
    await expect(valores.nth(0)).toHaveText('0,30');
    await expect(valores.nth(1)).toHaveText('0,10');
    await expect(valores.nth(2)).toHaveText('5');
  });
});

test.describe('Formato de los resultados y datos estructurados', () => {
  test('REPARADO (4035) · R₀, porcentajes y tabla en formato español', async ({ page }) => {
    // REPARADO el 04/11/2026: «R₀ = 3.00», «3.00», «95%», «inmunidad colectiva es 67%»,
    // pico «1.0» con R₀ < 1, «1/γ ≈ 10.0», «β efectiva = 0.300», tabla «R₀ 1.3». CLAUDE.md §2:
    // coma decimal y «67 %» con espacio duro.
    await abrir(page);
    await expect(metrica(page, R0_SIR)).toHaveText('3,00');
    await expect(metrica(page, AFECTADOS_SIR)).toHaveText(/^\d+ %$/);
    await expect(page.locator('main [class*="r0Box"]')).toContainText('67 %');
    await irAPestana(page, /Modelo SEIR/);
    await expect(metrica(page, 'Retraso del pico por incubación')).toHaveText('+28 d');
    await irAPestana(page, /Rₜ y Control/);
    await expect(page.locator('main [class*="sliderDesc"]').nth(1)).toHaveText('1/γ ≈ 10,0 días de infección');
    await irAPestana(page, /Enfermedades/);
    await expect(page.locator('main table tbody tr').first().locator('td').nth(1)).toHaveText('1,3');
    await expect(page.getByRole('button', { name: 'Simular Gripe estacional con R₀ 1,3' })).toHaveCount(1);
  });

  test('REPARADO (4037) · un solo WebApplication en el JSON-LD', async ({ page }) => {
    // REPARADO el 04/11/2026: layout.tsx ya inyecta jsonLd y faqJsonLd, y page.tsx volvía a
    // inyectar jsonLd: la página servía dos WebApplication idénticos.
    await page.goto(URL_APP);
    const tipos = await page.locator('script[type="application/ld+json"]').evaluateAll((ss) =>
      ss.map((s) => {
        try {
          return String((JSON.parse(s.textContent ?? '') as Record<string, unknown>)['@type']);
        } catch {
          return 'inválido';
        }
      }),
    );
    expect(tipos.filter((t) => t === 'FAQPage')).toHaveLength(1);
    expect(tipos.filter((t) => t === 'WebApplication')).toHaveLength(1);
  });

  test('REPARADO (4036) · la FAQ «aplanar la curva» no condiciona a la vacunación que el área cambie', async ({ page }) => {
    // REPARADO el 04/11/2026: la respuesta decía que el área total bajo la curva «cambia si la
    // proporción vacunada supera el umbral de inmunidad colectiva». En el SIR el área bajo
    // I(t) es R∞/γ y baja con β sin vacunar a nadie: el caso de arriba lo mide en la propia app
    // (95 % → 58-59 % al pasar β de 0,30 a 0,15).
    await page.goto(URL_APP);
    const respuesta = await page.locator('script[type="application/ld+json"]').evaluateAll((ss) => {
      for (const s of ss) {
        const j = JSON.parse(s.textContent ?? '{}') as {
          '@type'?: string;
          mainEntity?: { name: string; acceptedAnswer: { text: string } }[];
        };
        if (j['@type'] !== 'FAQPage') continue;
        const q = (j.mainEntity ?? []).find((e) => /aplanar la curva/i.test(e.name));
        if (q) return q.acceptedAnswer.text;
      }
      return '';
    });
    expect(respuesta).not.toBe('');
    expect(respuesta).not.toMatch(/cambia si la proporción vacunada/);
    expect(respuesta).toMatch(/sin necesidad de vacunar/);
  });
});

/** «50-90 %» → [50, 90] · «0,2 %» → [0,2, 0,2]. NaN si la celda no es un porcentaje. */
function rangoPorcentaje(texto: string): [number, number] {
  const m = /^\s*([\d.,]+)\s*(?:[-–]\s*([\d.,]+))?\s*%/.exec(texto);
  if (!m) return [NaN, NaN];
  const bajo = aNumero(m[1]);
  return [bajo, m[2] ? aNumero(m[2]) : bajo];
}

/** La celda de la columna `columna` (0 = Enfermedad) en la fila cuyo nombre contiene `nombre`. */
async function celdaEnfermedad(page: Page, nombre: string, columna: number): Promise<string> {
  const fila = page.locator('main table tbody tr').filter({ hasText: nombre });
  return ((await fila.locator('td').nth(columna).textContent()) ?? '').trim();
}

test.describe('Cabo C0632 — letalidades y σ de la gripe contra la OMS y el ECDC', () => {
  test.beforeEach(async ({ page }) => {
    await abrir(page);
  });

  test('anclado · sarampión «0,2 %» cae dentro del 1-3 por 1.000 del ECDC', async ({ page }) => {
    // ECDC, «Factsheet about measles» (https://www.ecdc.europa.eu/en/measles/facts, actualizada
    // el 28/11/2023): «Case fatality is 1–3 per 1000 cases and highest in those younger than five
    // years of age» → 0,1-0,3 %. La ficha de la OMS (https://www.who.int/news-room/fact-sheets/
    // detail/measles, 15/07/2026) no da letalidad: 95.000 muertes en 2024, sobre todo en países de
    // renta baja y en niños malnutridos.
    await irAPestana(page, /Enfermedades/);
    const [bajo, alto] = rangoPorcentaje(await celdaEnfermedad(page, 'Sarampión', 2));
    expect(bajo).toBeGreaterThanOrEqual(0.1);
    expect(alto).toBeLessThanOrEqual(0.3);
  });

  test('HALLAZGO 4184 (07/11/2026, REPARADO) · Ébola «brote 2014»: la letalidad de ese brote no llega al 50 %', async ({ page }) => {
    // OMS, «Ebola outbreak 2014-2016 - West Africa» (https://www.who.int/emergencies/situations/
    // ebola-outbreak-2014-2016-West-Africa): «More than 28 600 people had been infected and
    // 11 325 people had died» → 11.325 / 28.600 = 39,6 % como máximo. Y la ficha de la OMS
    // (https://www.who.int/news-room/fact-sheets/detail/ebola-disease, 24/04/2025): «The average
    // Ebola disease case fatality rate is around 50%. Case fatality rates have varied from 25–90%
    // in past outbreaks.» La fila «Ébola (brote 2014)» decía «50-90 %»: ni el brote de 2014
    // (≈ 40 %) ni el rango general (25-90 %) cabían en él. Ahora «40 %», con la media y el rango
    // general en la descripción.
    await irAPestana(page, /Enfermedades/);
    const [bajo, alto] = rangoPorcentaje(await celdaEnfermedad(page, 'Ébola', 2));
    expect(bajo).toBeLessThanOrEqual(40);
    expect(alto).toBeGreaterThanOrEqual(39);
  });

  test('HALLAZGO 4185 (07/11/2026, REPARADO) · COVID-19 «1-3 %» no era la IFR de la OMS ni un rango de CFR que sostenga', async ({ page }) => {
    // OMS, «Estimating mortality from COVID-19», resumen científico del 04/08/2020
    // (https://www.who.int/news-room/commentaries/detail/estimating-mortality-from-covid-19):
    // IFR «converging at approximately 0.5 - 1%» y CFR «from less than 0.1% to over 25%» según el
    // país. La IFR es la única cifra acotada. Decía «1-3 %», sin decir si era CFR o IFR; ahora
    // «0,5-1 % (IFR)», con la medida explicada bajo la tabla.
    await irAPestana(page, /Enfermedades/);
    const celda = await celdaEnfermedad(page, 'COVID-19', 2);
    const [bajo, alto] = rangoPorcentaje(celda);
    expect(bajo).toBeGreaterThanOrEqual(0.5);
    expect(alto).toBeLessThanOrEqual(1);
    expect(celda).toContain('IFR');
  });

  test('HALLAZGO 4186 (07/11/2026, REPARADO) · la columna decía «Mortalidad» y sus cifras son letalidades', async ({ page }) => {
    // OMS en español, ficha del Ébola (https://www.who.int/es/news-room/fact-sheets/detail/
    // ebola-disease, 24/04/2025): «La tasa media de letalidad ronda el 50 %. En brotes
    // anteriores, esta tasa ha oscilado entre el 25 % y el 90 %.» Es la proporción de casos que
    // mueren (la CFR del resumen de la OMS de 04/08/2020: «the proportion of individuals
    // diagnosed with a disease who die from that disease»). La mortalidad se mide sobre la
    // población, no sobre los casos. La cabecera era «Mortalidad» y la página no decía
    // «letalidad» en ningún sitio.
    await irAPestana(page, /Enfermedades/);
    await expect(page.locator('main table thead th').nth(2)).toHaveText(/Letalidad/);
    await expect(page.locator('main').getByText('tasa de letalidad')).toBeVisible();
  });

  test('HALLAZGO 4187 (07/11/2026, REPARADO) · la gripe incuba 2 días de media, no 3 (σ ≈ 0,5, no 0,33)', async ({ page }) => {
    // OMS, «Influenza (seasonal)» (https://www.who.int/news-room/fact-sheets/detail/
    // influenza-(seasonal), 28/02/2025): «the incubation period, is about 2 days, but ranges from
    // 1–4 days». ECDC, «Factsheet about seasonal influenza» (https://www.ecdc.europa.eu/en/
    // seasonal-influenza/facts/factsheet, 12/04/2022): «On average, the incubation period for
    // seasonal influenza is two days, but ranges from one to four days», y contagia «between one
    // day before symptom onset and five-to-seven days after onset» (el E del SEIR, que la página
    // define como «todavía no son contagiosas», dura menos aún). Con 1/σ = 2 días, σ = 0,5 (el
    // máximo del deslizador). Decía «Gripe: σ ≈ 0,33 (≈ 3 días)», y «Simular» gripe cargaba 0,33.
    // Hasta la reparación de 4039 (04/11/2026) el recuadro decía «σ ≈ 0.5 (≈ 2 días)».
    await irAPestana(page, /Modelo SEIR/);
    await esperarHidratacion(page, [DESLIZADORES]);
    const texto = (await page.locator('main').textContent()) ?? '';
    const dias = /Gripe:\s*σ\s*≈\s*[\d.,]+\s*\(≈\s*(\d+(?:[.,]\d+)?)\s*días\)/.exec(texto)?.[1];
    expect(dias, 'el recuadro «Compartimento E» da la incubación de la gripe').toBeDefined();
    expect(aNumero(dias ?? 'NaN')).toBeCloseTo(2, 1);
    await irAPestana(page, /Enfermedades/);
    await page.getByRole('button', { name: /^Simular Gripe estacional/ }).click();
    await irAPestana(page, /Modelo SEIR/);
    await esperarHidratacion(page, [DESLIZADORES]);
    const sigma = aNumero((await page.locator('main [class*="sliderValor"]').nth(2).textContent()) ?? '');
    expect(1 / sigma).toBeLessThanOrEqual(2.5);
  });
});
