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
 * Los casos con test.fail() son hallazgos ABIERTOS de esta inspección: cuando se reparen,
 * Playwright marcará el «fallo esperado» como inesperado; entonces se quita el test.fail() y el
 * comentario pasa a REPARADO.
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

  test('ABIERTO · el pico es el del modelo SIR continuo que enseña la página (302 ± 3), no el de Euler a 1 día', async ({ page }) => {
    // Hallazgo de esta inspección: Euler con paso de 1 día sobrestima el pico del SIR continuo
    // de las ecuaciones de la página. Fórmula cerrada con β 0,3, γ 0,1, S₀ 995, I₀ 5:
    // I_max = 1000 − (1000/3)·(1 + ln(2,985)) = 302,1. La app da 314 (+4 %); en el rango de los
    // deslizadores llega al +11 % (β 0,8 γ 0,25: 362 frente a 325,6). Con paso 0,1 día el mismo
    // Euler da 303,1: la tolerancia de ±3 (1 %) la cumple cualquier integración razonable.
    test.fail();
    const pico = await leer(metrica(page, PICO_SIR));
    expect(Math.abs(pico - 302.1)).toBeLessThanOrEqual(3);
  });

  test('ABIERTO · con R₀ = 1,00 no dice «R₀ < 1»', async ({ page }) => {
    // β 0,10 γ 0,10 → R₀ = 1 exacto. No hay epidemia (S < N ⇒ dI/dt < 0), pero el texto de la
    // rama «Extinción» afirma «R₀ < 1» con un R₀ = 1.00 encima. (γ ya vale 0,10 al cargar.)
    await sembrarValor(page, deslizador(page, 0), 0.1);
    expect(await leer(metrica(page, R0_SIR))).toBeCloseTo(1, 2);
    test.fail();
    await expect(page.locator('main [class*="r0Box"]')).not.toContainText('R₀ < 1');
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

  test('ABIERTO · β 0,10 γ 0,05 (R₀ 2): el SEIR también despega, y el retraso no sale negativo', async ({ page }) => {
    // Hallazgo de esta inspección: el recorte «E < 0,5 → 0» borra los expuestos del primer día
    // (0,1·995·5/1000 = 0,4975 < 0,5) y de todos los siguientes: la epidemia SEIR no arranca
    // nunca aunque R₀ = 2, y la app pinta «Pico SEIR (día 0) 5.0» y «+-104d». Esperado (RK4):
    // pico SEIR 124,3 el día 143,2; el mismo Euler sin ese recorte, 125,5 el día 145. El SIR de
    // al lado: 157,8 el día 104 → retraso ≈ +41 días.
    await sembrarValor(page, deslizador(page, 0), 0.1);
    await sembrarValor(page, deslizador(page, 1), 0.05);
    expect(await leer(metrica(page, 'R₀ (ambos modelos)'))).toBeCloseTo(2, 2);
    test.fail();
    const picoSEIR = await leer(metrica(page, /^Pico SEIR/));
    expect(picoSEIR).toBeGreaterThanOrEqual(120);
    expect(picoSEIR).toBeLessThanOrEqual(130);
    await expect(metrica(page, 'Retraso del pico por incubación')).not.toContainText('-');
    expect(await leer(metrica(page, 'Retraso del pico por incubación'))).toBeGreaterThanOrEqual(30);
  });

  test('ABIERTO · la gripe lleva el mismo σ en los dos textos de la pestaña', async ({ page }) => {
    // Hallazgo de esta inspección: el recuadro «Compartimento E» dice «Gripe: σ ≈ 0.5 (≈ 2
    // días)» y la nota de los deslizadores «Gripe: β=0.26, γ=0.2, σ=0.33» (el preset de la
    // tabla): dos periodos de incubación distintos para la misma enfermedad.
    test.fail();
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

  test('ABIERTO · con R₀ 0,2 y sin control el umbral de inmunidad es 0 %, no −400 %', async ({ page }) => {
    // Hallazgo de esta inspección: con control = 0 la app calcula (1 − 1/R₀)·100 sin acotar,
    // y con β 0,10 γ 0,50 (R₀ 0,2) pinta «-400%». Con R₀ ≤ 1 no hace falta inmunidad alguna:
    // 0 %, que es lo que ya da la rama con control > 0 (Math.max(0, …)).
    await sembrarValor(page, '#rt-beta', 0.1);
    await sembrarValor(page, '#rt-gamma', 0.5);
    test.fail();
    expect(await leer(metrica(page, 'Umbral inmunidad colectiva necesario'))).toBe(0);
  });
});

test.describe('Comparativa de enfermedades', () => {
  test('ABIERTO · «Simular» gripe carga β 0,26 y γ 0,20 en el Simulador SIR (R₀ 1,3)', async ({ page }) => {
    // Hallazgo de esta inspección: la página promete «Pulsa "Simular" en cualquier fila para
    // cargar automáticamente sus parámetros en el Simulador SIR» (y la FAQ, «parámetros
    // preconfigurados para cinco enfermedades»), pero handleSeleccionarEnfermedad ignora la
    // enfermedad y solo cambia de pestaña: el SIR se monta con sus valores iniciales y da
    // R₀ = 3.00 para la gripe. Esperado con β 0,26 γ 0,20 I₀ 5: R₀ 1,30, umbral 23 %, pico
    // 32,8 (Euler 33,4) el día 51,6 (Euler 53), afectados 43,4 % (Euler 43,6 %).
    await abrir(page);
    await irAPestana(page, /Enfermedades/);
    await page.getByRole('button', { name: /^Simular Gripe estacional/ }).click();
    await esperarHidratacion(page, [DESLIZADORES]);
    test.fail();
    expect(await leer(metrica(page, R0_SIR))).toBeCloseTo(1.3, 2);
    await expect(page.locator('main [class*="r0Box"]')).toContainText(/inmunidad colectiva es 23\s?%/);
    const pico = await leer(metrica(page, PICO_SIR));
    expect(pico).toBeGreaterThanOrEqual(32);
    expect(pico).toBeLessThanOrEqual(34);
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

  test('ABIERTO · C0485 · el nombre accesible no lleva el valor en formato inglés y contiene la etiqueta visible', async ({ page }) => {
    // Hoy el aria-label tapa la etiqueta: el lector anuncia «Tasa de transmisión: 0.3» (y otra
    // vez «0.3» como valor del control). En Rₜ, «Beta tasa transmisión: 0.3» no contiene la
    // etiqueta visible «Tasa de transmisión» (WCAG 2.5.3), y «…de control: 50%» pega el %.
    // Los valores visibles de Rₜ salen de beta.toFixed(2) / gamma.toFixed(2): «0.30», «0.10».
    test.fail();
    await expect(deslizador(page, 0)).not.toHaveAccessibleName(/\d\.\d/);
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

  test('ABIERTO · C0511 · el valor visible del deslizador va en formato español y sin decimales en I₀', async ({ page }) => {
    // valor.toFixed(2) pinta «0.30», «0.10» y «5.00» (infectados iniciales, paso 1).
    test.fail();
    const valores = page.locator('main [class*="sliderValor"]');
    await expect(valores.nth(0)).toHaveText('0,30');
    await expect(valores.nth(1)).toHaveText('0,10');
    await expect(valores.nth(2)).toHaveText('5');
  });
});

test.describe('Formato de los resultados y datos estructurados', () => {
  test('ABIERTO · R₀, porcentajes y tabla en formato español', async ({ page }) => {
    // Hallazgo de esta inspección: «R₀ = 3.00», «3.00», «95%», «inmunidad colectiva es 67%»,
    // pico «1.0» con R₀ < 1, «1/γ ≈ 10.0», «β efectiva = 0.300», tabla «R₀ 1.3». CLAUDE.md §2:
    // coma decimal y «67 %» con espacio duro.
    await abrir(page);
    test.fail();
    await expect(metrica(page, R0_SIR)).toHaveText('3,00');
    await expect(metrica(page, AFECTADOS_SIR)).toHaveText(/^\d+ %$/);
    await expect(page.locator('main [class*="r0Box"]')).toContainText('67 %');
    await irAPestana(page, /Enfermedades/);
    await expect(page.locator('main table tbody tr').first().locator('td').nth(1)).toHaveText('1,3');
  });

  test('ABIERTO · un solo WebApplication en el JSON-LD', async ({ page }) => {
    // Hallazgo de esta inspección: layout.tsx ya inyecta jsonLd y faqJsonLd, y page.tsx vuelve a
    // inyectar jsonLd: la página sirve dos WebApplication idénticos.
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
    test.fail();
    expect(tipos.filter((t) => t === 'WebApplication')).toHaveLength(1);
  });

  test('ABIERTO · la FAQ «aplanar la curva» no condiciona a la vacunación que el área cambie', async ({ page }) => {
    // Hallazgo de esta inspección: la respuesta dice que el área total bajo la curva «cambia si
    // la proporción vacunada supera el umbral de inmunidad colectiva». En el SIR el área bajo
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
    test.fail();
    expect(respuesta).not.toMatch(/cambia si la proporción vacunada/);
  });
});
