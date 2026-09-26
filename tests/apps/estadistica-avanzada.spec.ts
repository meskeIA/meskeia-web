import { test, expect, Page, Locator } from '@playwright/test';
import { esperarHidratacion, esperarValorEnReact } from './_hidratacion';

/**
 * estadistica-avanzada — inspección del 25/09/2026 (primera); reparación del 26/09/2026.
 *
 * Todos los valores esperados salen de un cálculo independiente con las fórmulas de libro
 * (t de Student y de Welch, Pearson, Spearman con RANGOS MEDIOS, mínimos cuadrados, χ² de
 * bondad de ajuste y de independencia, IC t y Jarque-Bera con la curtosis de momentos) y
 * rutinas numéricas propias —beta y gamma incompletas por fracción continua, Numerical Recipes
 * §6.1-6.4—, sin jStat. Referencias de control cruzadas: t crítica(0,975; 11) = 2,2010 y
 * t crítica(0,975; 3) = 3,1824, las de cualquier tabla de la t. Se comparan como TEXTO porque
 * la app imprime un número fijo de decimales (4 para estadísticos, 6 para p) y el formato es
 * determinista.
 *
 * Los casos que eran `test.fail()` (hallazgos 2007-2023) se repararon el 26/09/2026: los
 * cálculos viven ahora en app/estadistica-avanzada/motor.ts, validado antes contra estos
 * mismos casos resueltos a mano.
 */

const RUTA = '/estadistica-avanzada/';
const NBSP = String.fromCharCode(160);

const escapar = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** La tarjeta de resultado cuyo rótulo es EXACTAMENTE `etiqueta`. */
const tarjeta = (page: Page, etiqueta: string): Locator =>
  page
    .locator('main [class*="resultCard"]')
    .filter({ has: page.locator('[class*="resultLabel"]', { hasText: new RegExp(`^${escapar(etiqueta)}$`) }) });

const valor = (page: Page, etiqueta: string): Locator =>
  tarjeta(page, etiqueta).locator('[class*="resultValue"]').first();

const panelResultados = (page: Page): Locator => page.locator('main [class*="resultsPanel"]');
const areas = (page: Page): Locator => page.locator('main textarea');

async function pestana(page: Page, nombre: string) {
  await page.getByRole('button', { name: nombre }).click();
  await expect(page.getByRole('button', { name: nombre })).toHaveAttribute('aria-pressed', 'true');
}

/** Escribe cada serie en su textarea y espera a que el estado de React la haya recogido. */
async function escribir(page: Page, series: string[]) {
  for (let i = 0; i < series.length; i++) {
    const area = areas(page).nth(i);
    await area.fill(series[i]);
    await esperarValorEnReact(page, area, series[i]);
  }
}

async function unaMuestra(page: Page, datos: string, mu: string) {
  await page.locator('main select').selectOption('onesample');
  const campoMu = page.locator('main input[type="text"]');
  await campoMu.fill(mu);
  await esperarValorEnReact(page, campoMu, mu);
  await escribir(page, [datos]);
}

test.describe('Escritorio', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(RUTA);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Estadística Avanzada');
    await esperarHidratacion(page, ['main textarea']);
  });

  // ── Test t ────────────────────────────────────────────────────────────────

  test('t de dos muestras independientes (ejemplo): Welch, t = 3,0305 con 18 gl y p = 0,007192', async ({ page }) => {
    // Medias 25,3 y 22,3; varianzas 4,9 y 4,9 → se = √(0,49 + 0,49) = 0,98995 → t = 3,0305.
    // Con varianzas y tamaños iguales, los gl de Welch coinciden con n1 + n2 − 2 = 18.
    await escribir(page, ['23 25 28 22 26 24 27 25 29 24', '20 22 24 21 23 19 25 22 26 21']);
    await expect(valor(page, 'Tipo de test')).toHaveText('Muestras independientes (Welch)');
    await expect(valor(page, 'Estadístico t')).toHaveText('3,0305');
    await expect(valor(page, 'Grados de libertad')).toHaveText('18,00');
    await expect(valor(page, 'p-valor')).toHaveText('0,007192');
  });

  test('con varianzas distintas usa Welch y lo declara: [1…5] frente a [10, 20] da gl = 1,04, no 5', async ({ page }) => {
    // Welch: v1/n1 = 2,5/5 = 0,5; v2/n2 = 50/2 = 25 → t = −12/√25,5 = −2,3764;
    // gl = 25,5² / (0,5²/4 + 25²/1) = 1,0403 → p = 0,245766.
    // (La t de varianzas iguales daría t = −4,1404 con 5 gl y p = 0,008994: veredicto opuesto.)
    await escribir(page, ['1 2 3 4 5', '10 20']);
    await expect(valor(page, 'Tipo de test')).toHaveText('Muestras independientes (Welch)');
    await expect(valor(page, 'Estadístico t')).toHaveText('-2,3764');
    await expect(valor(page, 'Grados de libertad')).toHaveText('1,04');
    await expect(valor(page, 'p-valor')).toHaveText('0,245766');
  });

  test('t de una muestra con coma decimal española: 5,1 4,9 5,3 5,0 5,2 frente a μ₀ = 5', async ({ page }) => {
    // Media 5,1; s (n − 1) = √(0,1/4) = 0,158114; se = 0,070711 → t = √2 = 1,4142, gl 4, p = 0,230200.
    await unaMuestra(page, '5,1 4,9 5,3 5,0 5,2', '5');
    await expect(page.getByText('5 valores leídos')).toBeVisible();
    await expect(valor(page, 'Estadístico t')).toHaveText('1,4142');
    await expect(valor(page, 'Grados de libertad')).toHaveText('4,00');
    await expect(valor(page, 'p-valor')).toHaveText('0,230200');
  });

  test('t de muestras pareadas: diferencias 1, 1, 2 → t = 4 con 2 gl y p = 0,057191', async ({ page }) => {
    // d̄ = 4/3; s_d = √(1/3) = 0,57735; se = 0,33333 → t = 4. Con 2 gl la cola es exacta:
    // F(4) = 1/2 + 4/(2·√18) = 0,97140 → p = 0,057191.
    await page.locator('main select').selectOption('paired');
    await escribir(page, ['10 12 14', '9 11 12']);
    await expect(valor(page, 'Tipo de test')).toHaveText('Muestras pareadas');
    await expect(valor(page, 'Estadístico t')).toHaveText('4,0000');
    await expect(valor(page, 'Grados de libertad')).toHaveText('2,00');
    await expect(valor(page, 'p-valor')).toHaveText('0,057191');
  });

  test('μ₀ «1.500» es mil quinientos (2009): media 1500 → t = 0, p = 1, no significativo', async ({ page }) => {
    // Antes un parser casero leía 1,5 y publicaba t = 423,8398, p ≈ 0 y «Significativo».
    await unaMuestra(page, '1500 1510 1490 1505 1495', '1.500');
    await expect(valor(page, 'Estadístico t')).toHaveText('0,0000');
    await expect(valor(page, 'p-valor')).toHaveText('1,000000');
    await expect(valor(page, 'Interpretación (α = 0,05)')).toContainText('No significativo');
  });

  test('μ₀ no numérico se dice y no se calcula con 0 en silencio (2009)', async ({ page }) => {
    // Antes «abc» valía 0 y salía t = 72,1249, «Significativo».
    await unaMuestra(page, '5,1 4,9 5,3 5,0 5,2', 'abc');
    await expect(page.getByRole('alert').filter({ hasText: 'no se ha reconocido como número' })).toBeVisible();
    await expect(tarjeta(page, 'Estadístico t')).toHaveCount(0);
    await expect(panelResultados(page)).not.toContainText('Significativo');
  });

  test('dos grupos constantes y distintos: t no definido, sin veredicto de «No significativo» (2010)', async ({ page }) => {
    // 5 5 5 frente a 3 3 3: varianza 0 en los dos grupos, t = 2/0 y gl de Welch = 0/0.
    // Antes: t ∞, gl y p «No definido» y aun así «No significativo (p ≥ 0,05)».
    await escribir(page, ['5 5 5', '3 3 3']);
    await expect(tarjeta(page, 'Estadístico t no definido')).toContainText('no hay variabilidad');
    await expect(panelResultados(page)).not.toContainText('No significativo');
    await expect(valor(page, 'Media Grupo 1')).toHaveText('5,0000');
  });

  test('una muestra constante (5 5 5 frente a μ₀ = 4): t no definido, sin veredicto (2010)', async ({ page }) => {
    await unaMuestra(page, '5 5 5', '4');
    await expect(tarjeta(page, 'Estadístico t no definido')).toBeVisible();
    await expect(panelResultados(page)).not.toContainText('significativo');
  });

  // ── Correlación ──────────────────────────────────────────────────────────

  test('Pearson de control: x = 1…5, y = 2 4 5 4 5 → r = 0,7746, R² = 60 %, t = 2,1213, p = 0,124027', async ({ page }) => {
    // Sxy = 6, Sxx = 10, Syy = 6 → r = 6/√60 = 0,774597; t = r·√(3/(1 − 0,6)) = 2,121320; gl 3.
    await pestana(page, 'Correlación');
    await escribir(page, ['1 2 3 4 5', '2 4 5 4 5']);
    await expect(valor(page, 'Coeficiente (r)')).toHaveText('0,7746');
    await expect(valor(page, 'R² (varianza explicada)')).toContainText('60,00');
    await expect(valor(page, 'Estadístico t')).toHaveText('2,1213');
    await expect(valor(page, 'p-valor')).toHaveText('0,124027');
  });

  test('Spearman promedia los rangos de los empates (2008): 0,7379, no 0,9000', async ({ page }) => {
    // y = 2 4 5 4 5 tiene dos empates. Rangos medios: y → 1; 2,5; 4,5; 2,5; 4,5.
    // ρ = Pearson de los rangos = 7/√90 = 0,737865 → t = 1,8935, gl 3, p = 0,154619 (no significativo).
    // (scipy.stats.spearmanr da el mismo ρ y el mismo p, con la misma aproximación t.)
    await pestana(page, 'Correlación');
    await page.locator('main select').selectOption('spearman');
    await escribir(page, ['1 2 3 4 5', '2 4 5 4 5']);
    await expect(valor(page, 'Tipo')).toHaveText('Spearman');
    await expect(valor(page, 'Coeficiente (r)')).toHaveText('0,7379');
    await expect(valor(page, 'Estadístico t')).toHaveText('1,8935');
    await expect(valor(page, 'p-valor')).toHaveText('0,154619');
  });

  test('Spearman no depende del ORDEN de los pares: los mismos datos al revés dan 0,7379 (2008)', async ({ page }) => {
    // Los mismos cinco pares (1,2) (2,4) (3,5) (4,4) (5,5) escritos del último al primero.
    await pestana(page, 'Correlación');
    await page.locator('main select').selectOption('spearman');
    await escribir(page, ['5 4 3 2 1', '5 4 5 4 2']);
    await expect(valor(page, 'Coeficiente (r)')).toHaveText('0,7379');
  });

  test('con X constante r no existe y se dice, sin interpretación (2011)', async ({ page }) => {
    // x = 3 3 3 → Sxx = 0 → r = 0/0. Antes: «Correlación negativa casi perfecta».
    await pestana(page, 'Correlación');
    await escribir(page, ['3 3 3', '1 2 3']);
    await expect(valor(page, 'Coeficiente (r)')).toHaveText('No definido');
    await expect(tarjeta(page, 'Correlación no definida')).toContainText('X es constante');
    await expect(panelResultados(page)).not.toContainText('casi perfecta');
    await expect(panelResultados(page)).not.toContainText('%');
  });

  test('una correlación perfecta (r = 1) tiene p = 0 y es significativa (2010)', async ({ page }) => {
    // x = 1 2 3, y = 2 4 6 → r = 1, t = ∞ → p = P(|T| > ∞) = 0. Antes: «No definido».
    await pestana(page, 'Correlación');
    await escribir(page, ['1 2 3', '2 4 6']);
    await expect(valor(page, 'Coeficiente (r)')).toHaveText('1,0000');
    await expect(valor(page, 'p-valor')).toHaveText('0,000000');
    await expect(valor(page, 'Estadístico t')).toHaveText('∞');
  });

  // ── Regresión ────────────────────────────────────────────────────────────

  test('regresión de control: y = 2,2 + 0,6x, R² = 60 %, error estándar 0,8944, F = 4,5', async ({ page }) => {
    // b1 = 6/10 = 0,6; b0 = 4 − 0,6·3 = 2,2; SSres = 2,4 → se = √(2,4/3) = 0,894427;
    // t(b1) = 0,6/(0,894427/√10) = 2,1213 → p = 0,124027; F = t² = 4,5.
    await pestana(page, 'Regresión');
    await escribir(page, ['1 2 3 4 5', '2 4 5 4 5']);
    await expect(valor(page, 'Ecuación de regresión')).toHaveText('y = 2,2000 + 0,6000x');
    await expect(valor(page, 'R²')).toHaveText(`60,00${NBSP}%`);
    await expect(valor(page, 'Error estándar')).toHaveText('0,8944');
    await expect(valor(page, 'p-valor (pendiente)')).toHaveText('0,124027');
    await expect(valor(page, 'Estadístico F')).toHaveText('4,5000');
  });

  test('ajuste perfecto con pendiente negativa: «y = 10,0000 − 2,0000x» y p = 0 (2010, 2021)', async ({ page }) => {
    // x = 1…4, y = 8 6 4 2: b1 = −10/5 = −2, b0 = 5 + 2·2,5 = 10; residuos 0 → t = −∞, p = 0.
    await pestana(page, 'Regresión');
    await escribir(page, ['1 2 3 4', '8 6 4 2']);
    await expect(valor(page, 'Ecuación de regresión')).toHaveText('y = 10,0000 − 2,0000x');
    await expect(valor(page, 'p-valor (pendiente)')).toHaveText('0,000000');
    await expect(valor(page, 'Estadístico F')).toHaveText('∞');
  });

  test('con X constante la recta no existe y se dice (2011)', async ({ page }) => {
    // Antes: «y = No definido + No definidox» y R² «No definido%».
    await pestana(page, 'Regresión');
    await escribir(page, ['3 3 3', '1 2 3']);
    await expect(tarjeta(page, 'Regresión no definida')).toContainText('X es constante');
    await expect(panelResultados(page)).not.toContainText('No definidox');
  });

  // ── Chi-cuadrado ─────────────────────────────────────────────────────────

  test('χ² de bondad de ajuste frente a la uniforme: 45 35 20 → χ² = 9,5 con 2 gl, p = 0,008652', async ({ page }) => {
    // Esperadas 100/3 cada una: (11,667² + 1,667² + 13,333²)/33,333 = 9,5. Con 2 gl la cola
    // es exacta, e^(−χ²/2) = e^(−4,75) = 0,008652.
    await pestana(page, 'Chi-cuadrado');
    await escribir(page, ['45 35 20']);
    await expect(valor(page, 'Chi-cuadrado (χ²)')).toHaveText('9,5000');
    await expect(valor(page, 'Grados de libertad')).toHaveText('2');
    await expect(valor(page, 'p-valor')).toHaveText('0,008652');
    await expect(panelResultados(page)).toContainText('distribución uniforme');
  });

  test('χ² con todas las esperadas en 2,5: el estadístico sí, el p y el veredicto no (2014)', async ({ page }) => {
    // 8 1 0 1 frente a la uniforme: las cuatro esperadas valen 2,5 < 5, así que la aproximación
    // χ² no vale (regla de Cochran). χ² = 41/2,5 = 16,4 es correcto; p = 0,000939 no es fiable.
    await pestana(page, 'Chi-cuadrado');
    await escribir(page, ['8 1 0 1']);
    await expect(valor(page, 'Chi-cuadrado (χ²)')).toHaveText('16,4000');
    await expect(panelResultados(page)).toContainText(/(menor|menores|inferior|por debajo|al menos|mínim)[^.]{0,60}\b5\b/i);
    await expect(tarjeta(page, 'p-valor')).toHaveCount(0);
    await expect(panelResultados(page)).not.toContainText('Significativo (p');
  });

  test('esperadas escritas como proporciones se escalan al total y se dice: χ² = 0, p = 1 (2013)', async ({ page }) => {
    // 50 30 20 frente a 0,5 0,3 0,2: las mismas proporciones. Antes: χ² = 9801 «Significativo».
    await pestana(page, 'Chi-cuadrado');
    await escribir(page, ['50 30 20', '0,5 0,3 0,2']);
    await expect(valor(page, 'Chi-cuadrado (χ²)')).toHaveText('0,0000');
    await expect(valor(page, 'p-valor')).toHaveText('1,000000');
    await expect(panelResultados(page)).toContainText('escalado al total observado');
  });

  test('esperadas de otra longitud o observadas negativas se rechazan en vez de callar (2013)', async ({ page }) => {
    // Antes: «45 35 20» frente a «50 30» se contrastaba contra la uniforme sin decirlo (χ² 9,5),
    // y «-5 10 25» daba χ² 45 «Significativo».
    await pestana(page, 'Chi-cuadrado');
    await escribir(page, ['45 35 20', '50 30']);
    await expect(tarjeta(page, 'No se puede calcular')).toContainText('2 esperadas para 3 observadas');
    await expect(tarjeta(page, 'Chi-cuadrado (χ²)')).toHaveCount(0);
    await escribir(page, ['-5 10 25', '']);
    await expect(tarjeta(page, 'No se puede calcular')).toContainText('negativas');
  });

  test('χ² de independencia en tabla 2×2 [[10, 20], [30, 40]]: χ² = 0,7937, gl 1, p = 0,372998 (2012)', async ({ page }) => {
    // Totales: filas 30 y 70, columnas 40 y 60, n = 100 → esperadas 12, 18, 28, 42.
    // χ² = 4/12 + 4/18 + 4/28 + 4/42 = 0,793651; con 1 gl p = erfc(√(χ²/2)) = 0,372998.
    // Con Yates: Σ(|O − E| − 0,5)²/E = 2,25·0,198413 = 0,446429, p = 0,504036 (lo que da R).
    // Antes la app solo tenía bondad de ajuste y «10 20 30 40» daba χ² 20, gl 3, «Significativo».
    await pestana(page, 'Chi-cuadrado');
    await page.getByRole('combobox', { name: 'Tipo de contraste' }).selectOption('independencia');
    await escribir(page, ['10 20\n30 40']);
    await expect(valor(page, 'Chi-cuadrado (χ²)')).toHaveText('0,7937');
    await expect(valor(page, 'Grados de libertad')).toHaveText('1');
    await expect(valor(page, 'p-valor')).toHaveText('0,372998');
    await expect(valor(page, 'Interpretación (α = 0,05)')).toHaveText('No significativo (p ≥ 0,05)');
    await expect(tarjeta(page, 'Con corrección de continuidad de Yates (tabla 2×2)')).toContainText('χ² = 0,4464 · p = 0,504036');
  });

  // ── Intervalo de confianza ───────────────────────────────────────────────

  test('IC 95 % del ejemplo con t de Student: [49,3902 , 53,1098]', async ({ page }) => {
    // n = 12, media 51,25, s (n − 1) = 2,927146, se = 0,844994, t(0,975; 11) = 2,200985.
    await pestana(page, 'Int. Confianza');
    await escribir(page, ['52 48 55 51 49 53 50 54 47 56 52 48']);
    await expect(valor(page, `Intervalo de Confianza al 95${NBSP}% (t-Student)`)).toHaveText('[49,3902 , 53,1098]');
    await expect(valor(page, 'Desviación estándar (s)')).toHaveText('2,9271');
    await expect(valor(page, 'Valor crítico t')).toHaveText('2,2010');
  });

  test('«1.500 1.600 1.700 1.800» se lee con punto de millar: media 1650 e IC [1444,5740 , 1855,4260]', async ({ page }) => {
    // s = 129,0994, se = 64,5497, t(0,975; 3) = 3,182446 → margen 205,4260.
    await pestana(page, 'Int. Confianza');
    await escribir(page, ['1.500 1.600 1.700 1.800']);
    await expect(page.getByText('4 valores leídos')).toBeVisible();
    await expect(valor(page, 'Media muestral (x̄)')).toHaveText('1650,0000');
    await expect(valor(page, `Intervalo de Confianza al 95${NBSP}% (t-Student)`)).toHaveText('[1444,5740 , 1855,4260]');
  });

  test('un trozo no numérico se descarta A LA VISTA y no entra en el cálculo', async ({ page }) => {
    // «5 7 abc 9» → tres valores, media 7; la app debe decir que «abc» no es un número.
    await pestana(page, 'Int. Confianza');
    await escribir(page, ['5 7 abc 9']);
    await expect(page.getByText('3 valores leídos')).toBeVisible();
    await expect(page.getByText('No se ha reconocido como número: «abc».')).toBeVisible();
    await expect(valor(page, 'Media muestral (x̄)')).toHaveText('7,0000');
  });

  // ── Normalidad ───────────────────────────────────────────────────────────

  test('Jarque-Bera con la curtosis de momentos (2007): el ejemplo de la app no se rechaza', async ({ page }) => {
    // S = m3/m2^1,5 = −0,288497, K = m4/m2² = 2,352670 (exceso −0,647330) →
    // JB = (20/6)·(S² + (K − 3)²/4) = 0,6266 → p = e^(−JB/2) = 0,731019.
    // Antes se restaba 3 dos veces: JB = 11,3633, p = 0,003408, «Se rechaza normalidad».
    await pestana(page, 'Normalidad');
    await page.getByRole('button', { name: 'Cargar ejemplo' }).click();
    await expect(page.getByText('20 valores leídos')).toBeVisible();
    await expect(valor(page, 'Estadístico JB')).toHaveText('0,6266');
    await expect(valor(page, 'p-valor')).toHaveText('0,731019');
    await expect(valor(page, 'Asimetría (0 en la normal)')).toHaveText('-0,2885');
    await expect(valor(page, 'Curtosis (3 en la normal)')).toHaveText('2,3527');
    await expect(valor(page, 'Test Jarque-Bera de Normalidad')).toContainText('No se rechaza normalidad (p ≥ 0,05)');
  });

  test('una muestra de colas pesadas (curtosis 5) se describe como leptocúrtica (2007)', async ({ page }) => {
    // 0 ×8, 1, −1: m2 = 0,2 y m4 = 0,2 → K = 0,2/0,04 = 5 (> 3: leptocúrtica).
    // Antes: «Curtosis 2,0000» (el exceso) leído con los umbrales de K → «platicúrtica».
    await pestana(page, 'Normalidad');
    await escribir(page, ['0 0 0 0 0 0 0 0 1 -1']);
    await expect(valor(page, 'Curtosis (3 en la normal)')).toHaveText('5,0000');
    await expect(tarjeta(page, 'Interpretación de forma')).toContainText('leptocúrtica');
    await expect(tarjeta(page, 'Interpretación de forma')).not.toContainText('platicúrtica');
  });

  test('todos los valores iguales: Jarque-Bera no definido, sin «Se rechaza normalidad» (2011)', async ({ page }) => {
    await pestana(page, 'Normalidad');
    await escribir(page, ['4 4 4 4']);
    await expect(tarjeta(page, 'Test Jarque-Bera no definido')).toContainText('Todos los valores son iguales');
    await expect(panelResultados(page)).not.toContainText('rechaza');
    await expect(panelResultados(page)).not.toContainText('simétrica');
  });

  // ── Formato ──────────────────────────────────────────────────────────────

  test('el veredicto escribe α con coma decimal: «p < 0,05» (2021)', async ({ page }) => {
    await escribir(page, ['23 25 28 22 26 24 27 25 29 24', '20 22 24 21 23 19 25 22 26 21']);
    await expect(valor(page, 'Interpretación (α = 0,05)')).toHaveText('Significativo (p < 0,05)');
  });

  test('el porcentaje va separado de la cifra con espacio duro: «60,00 %» (2021)', async ({ page }) => {
    await pestana(page, 'Correlación');
    await escribir(page, ['1 2 3 4 5', '2 4 5 4 5']);
    await expect(valor(page, 'R² (varianza explicada)')).toHaveText(`60,00${NBSP}%`);
  });

  // ── Accesibilidad y contenido ────────────────────────────────────────────

  test('los controles se llaman por su etiqueta (2017)', async ({ page }) => {
    await expect(page.getByRole('combobox', { name: 'Tipo de test' })).toHaveCount(1);
    await expect(page.getByRole('textbox', { name: 'Grupo 1' })).toHaveCount(1);
    await expect(page.getByRole('textbox', { name: 'Grupo 2' })).toHaveCount(1);
    await page.getByRole('combobox', { name: 'Tipo de test' }).selectOption('onesample');
    await expect(page.getByRole('textbox', { name: 'Valor de referencia (μ₀)' })).toHaveCount(1);
    await pestana(page, 'Int. Confianza');
    await expect(page.getByRole('combobox', { name: 'Nivel de confianza' })).toHaveCount(1);
  });

  test('texto blanco sobre --primary-boton en pestaña activa y tarjeta destacada, en claro y en oscuro (2015)', async ({ page }) => {
    // #26718F con blanco encima da 5,47:1. Antes: pestaña sobre #2E86AB (4,11:1; en oscuro
    // #3FA5D1, 2,80:1) y tarjeta con degradado al teal (2,57:1 en la etiqueta).
    await pestana(page, 'Correlación');
    await page.getByRole('button', { name: 'Cargar ejemplo' }).click();
    // toHaveCSS reintenta: la pestaña tiene `transition`, y leída al vuelo da un rgba intermedio.
    const activa = page.locator('nav button[aria-pressed="true"]');
    const destacada = page.locator('main [class*="highlight"]').first();
    for (const tema of ['light', 'dark']) {
      await page.evaluate((t) => document.documentElement.setAttribute('data-theme', t), tema);
      await expect(activa).toHaveCSS('background-color', 'rgb(38, 113, 143)');
      await expect(activa).toHaveCSS('color', 'rgb(255, 255, 255)');
      await expect(destacada).toHaveCSS('background-image', 'none');
      await expect(destacada).toHaveCSS('background-color', 'rgb(38, 113, 143)');
      await expect(destacada.locator('[class*="resultLabel"]')).toHaveCSS('color', 'rgb(255, 255, 255)');
    }
  });

  test('la ayuda de la tarjeta informativa del IC usa #666 sobre #E0F2FE (5,0:1) (2018)', async ({ page }) => {
    await pestana(page, 'Int. Confianza');
    await page.getByRole('button', { name: 'Cargar ejemplo' }).click();
    const ayuda = page.getByText('La distribución t es más conservadora');
    await expect(ayuda).toHaveCSS('color', 'rgb(102, 102, 102)');
  });

  test('la guía no equipara el p-valor con el error de tipo I y da bien el umbral de 5 sigma (2022)', async ({ page }) => {
    // Φ(−5) = 2,8665·10⁻⁷ (una cola) ≈ 1 entre 3,5 millones.
    const guia = page.locator('body');
    await expect(guia).not.toContainText('Es la frecuencia del error de tipo I');
    await expect(guia).toContainText('p ≈ 0,0000003');
    await expect(guia).not.toContainText('pré-registro');
    await expect(guia).not.toContainText('deviaciones');
  });

  test('la metadata no anuncia contrastes que la app no tiene (2023)', async ({ page }) => {
    const keywords = (await page.locator('meta[name="keywords"]').getAttribute('content')) ?? '';
    expect(keywords).not.toMatch(/shapiro|anova/i);
  });
});

test.describe('Móvil 360 px', () => {
  test.use({
    viewport: { width: 360, height: 780 },
    userAgent:
      'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36',
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });

  const pestanas = (page: Page) => page.locator('nav:has(button[aria-pressed]) button');

  test.beforeEach(async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, ['main textarea']);
  });

  test('por debajo de 769 px las seis pestañas conservan su nombre visible (2016)', async ({ page }) => {
    // Antes .tabLabel { display: none } dejaba solo el emoji, con aria-hidden: seis botones mudos.
    await expect(pestanas(page)).toHaveCount(6);
    await expect(page.getByRole('button', { name: 'Correlación' })).toHaveCount(1);
    await expect(page.getByRole('button', { name: 'Correlación' }).getByText('Correlación')).toBeVisible();
    const derecha = await pestanas(page).evaluateAll((bs) => Math.max(...bs.map((b) => b.getBoundingClientRect().right)));
    expect(derecha).toBeLessThanOrEqual(360);
  });

  test('con resultados de χ² los paneles caben en 360 px (2020)', async ({ page }) => {
    // La tabla «Detalle por categoría» ensanchaba la pista de la rejilla a 403 px.
    await pestanas(page).nth(3).click();
    await page.getByRole('button', { name: 'Cargar ejemplo' }).click();
    await expect(page.locator('main table')).toBeVisible();
    for (const selector of ['main [class*="inputPanel"]', 'main [class*="resultsPanel"]']) {
      const derecha = await page.locator(selector).evaluate((el) => Math.round(el.getBoundingClientRect().right));
      expect(derecha).toBeLessThanOrEqual(360);
    }
  });
});
