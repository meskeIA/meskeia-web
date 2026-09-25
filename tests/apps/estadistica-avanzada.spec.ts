import { test, expect, Page, Locator } from '@playwright/test';
import { esperarHidratacion, esperarValorEnReact } from './_hidratacion';

/**
 * estadistica-avanzada — inspección del 25/09/2026 (primera).
 *
 * Todos los valores esperados salen de un cálculo independiente con las fórmulas de libro
 * (t de Student y de Welch, Pearson, Spearman con RANGOS MEDIOS, mínimos cuadrados, χ² de
 * bondad de ajuste, IC t y Jarque-Bera con la curtosis de momentos) y rutinas numéricas
 * propias —beta y gamma incompletas por fracción continua, Numerical Recipes §6.1-6.4—, sin
 * jStat. Referencias de control cruzadas: t crítica(0,975; 11) = 2,2010 y t crítica(0,975; 3)
 * = 3,1824, las de cualquier tabla de la t. Se comparan como TEXTO porque la app imprime un
 * número fijo de decimales (4 para estadísticos, 6 para p) y el formato es determinista.
 *
 * Los tests con `test.fail()` vigilan hallazgos ABIERTOS: pasan en verde mientras el defecto
 * siga y avisarán cuando se repare, para quitar la marca.
 */

const RUTA = '/estadistica-avanzada/';

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

  test.fail('HALLAZGO ABIERTO · μ₀ se lee con un parser casero: «1.500» vale 1,5 y el veredicto se invierte', async ({ page }) => {
    // page.tsx:78 hace parseFloat(ttestMu.replace(',', '.')). Con la media muestral exactamente
    // en 1500, el contraste frente a μ₀ = 1.500 (mil quinientos) da t = 0 y p = 1.
    // Hoy la app lee 1,5 y publica t = 423,8398, p ≈ 0 y «Significativo».
    await unaMuestra(page, '1500 1510 1490 1505 1495', '1.500');
    await expect(valor(page, 'Estadístico t')).toHaveText('0,0000');
    await expect(valor(page, 'p-valor')).toHaveText('1,000000');
    await expect(valor(page, 'Interpretación (α = 0,05)')).toContainText('No significativo');
  });

  test.fail('HALLAZGO ABIERTO · dos grupos constantes y distintos no pueden salir «No significativo» con p no definido', async ({ page }) => {
    // 5 5 5 frente a 3 3 3: varianza 0 en los dos grupos, t = 2/0. La app imprime t = ∞,
    // gl y p «No definido» y aun así el veredicto «No significativo (p ≥ 0,05)».
    // Lo esperable es que diga que con varianza cero el test t no está definido, sin veredicto.
    await escribir(page, ['5 5 5', '3 3 3']);
    await expect(tarjeta(page, 'Estadístico t')).toBeVisible();
    await expect(panelResultados(page)).not.toContainText('No significativo');
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

  test.fail('HALLAZGO ABIERTO · Spearman no promedia los rangos de los empates: 0,9000 en vez de 0,7379', async ({ page }) => {
    // y = 2 4 5 4 5 tiene dos empates. Rangos medios: y → 1; 2,5; 4,5; 2,5; 4,5.
    // ρ = Pearson de los rangos = 7/√90 = 0,737865 → t = 1,8935, gl 3, p = 0,154619 (no significativo).
    // La app da rangos 1…n seguidos (page.tsx:186-193) → 0,9000 y p = 0,037386 «significativo».
    await pestana(page, 'Correlación');
    await page.locator('main select').selectOption('spearman');
    await escribir(page, ['1 2 3 4 5', '2 4 5 4 5']);
    await expect(valor(page, 'Tipo')).toHaveText('Spearman');
    await expect(valor(page, 'Coeficiente (r)')).toHaveText('0,7379');
    await expect(valor(page, 'p-valor')).toHaveText('0,154619');
  });

  test.fail('HALLAZGO ABIERTO · Spearman depende del ORDEN de los pares: los mismos datos al revés dan 0,5000', async ({ page }) => {
    // Los mismos cinco pares (1,2) (2,4) (3,5) (4,4) (5,5) escritos del último al primero.
    // ρ no depende del orden: 0,737865 → «0,7379». Hoy la app da 0,5000.
    await pestana(page, 'Correlación');
    await page.locator('main select').selectOption('spearman');
    await escribir(page, ['5 4 3 2 1', '5 4 5 4 2']);
    await expect(valor(page, 'Coeficiente (r)')).toHaveText('0,7379');
  });

  test.fail('HALLAZGO ABIERTO · con X constante r no existe y la app lo interpreta como «negativa casi perfecta»', async ({ page }) => {
    // x = 3 3 3 → Sxx = 0 → r = 0/0. La app imprime r «No definido» y, al lado,
    // «Correlación negativa casi perfecta» (interpretCorrelation con NaN cae al último caso).
    await pestana(page, 'Correlación');
    await escribir(page, ['3 3 3', '1 2 3']);
    await expect(valor(page, 'Coeficiente (r)')).toHaveText('No definido');
    await expect(panelResultados(page)).not.toContainText('casi perfecta');
  });

  test.fail('HALLAZGO ABIERTO · una correlación perfecta (r = 1) sale con p «No definido» en la tarjeta de no significativo', async ({ page }) => {
    // x = 1 2 3, y = 2 4 6 → r = 1, t = ∞ → p = P(|T| > ∞) = 0. Hoy: «No definido».
    await pestana(page, 'Correlación');
    await escribir(page, ['1 2 3', '2 4 6']);
    await expect(valor(page, 'Coeficiente (r)')).toHaveText('1,0000');
    await expect(valor(page, 'p-valor')).not.toHaveText('No definido');
  });

  // ── Regresión ────────────────────────────────────────────────────────────

  test('regresión de control: y = 2,2 + 0,6x, R² = 60 %, error estándar 0,8944, F = 4,5', async ({ page }) => {
    // b1 = 6/10 = 0,6; b0 = 4 − 0,6·3 = 2,2; SSres = 2,4 → se = √(2,4/3) = 0,894427;
    // t(b1) = 0,6/(0,894427/√10) = 2,1213 → p = 0,124027; F = t² = 4,5.
    await pestana(page, 'Regresión');
    await escribir(page, ['1 2 3 4 5', '2 4 5 4 5']);
    await expect(valor(page, 'Ecuación de regresión')).toHaveText('y = 2,2000 + 0,6000x');
    await expect(valor(page, 'R²')).toContainText('60,00');
    await expect(valor(page, 'Error estándar')).toHaveText('0,8944');
    await expect(valor(page, 'p-valor (pendiente)')).toHaveText('0,124027');
    await expect(valor(page, 'F-statistic')).toHaveText('4,5000');
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
  });

  test.fail('HALLAZGO ABIERTO · χ² con todas las esperadas en 2,5 publica p y «Significativo» sin avisar', async ({ page }) => {
    // Sospecha de SOSPECHAS.md (la forma del 1696 de simulador-genetica). 8 1 0 1 frente a la
    // uniforme: las cuatro esperadas valen 2,5 < 5, así que la aproximación χ² no vale (regla
    // de Cochran; la propia guía, page.tsx:1312, pide ≥ 5 en cada celda). La app da
    // χ² = 16,4000, p = 0,000939 y «Significativo» sin ningún aviso.
    await pestana(page, 'Chi-cuadrado');
    await escribir(page, ['8 1 0 1']);
    await expect(valor(page, 'Chi-cuadrado (χ²)')).toHaveText('16,4000');
    await expect(panelResultados(page)).toContainText(/(menor|menores|inferior|por debajo|al menos|mínim)[^.]{0,60}\b5\b/i);
  });

  test.fail('HALLAZGO ABIERTO · esperadas escritas como proporciones: ajuste perfecto publicado como χ² = 9801 «Significativo»', async ({ page }) => {
    // 50 30 20 frente a 0,5 0,3 0,2: son las mismas proporciones, χ² = 0 y p = 1 si se escalan
    // al total (100). La app no comprueba que las sumas coincidan y divide por 0,5, 0,3 y 0,2.
    await pestana(page, 'Chi-cuadrado');
    await escribir(page, ['50 30 20', '0,5 0,3 0,2']);
    await expect(panelResultados(page)).not.toContainText('9801');
    await expect(panelResultados(page)).not.toContainText('Significativo (p');
  });

  test.fail('HALLAZGO ABIERTO · la guía presenta el χ² como test de independencia y el módulo no lo tiene', async ({ page }) => {
    // La tabla comparativa de la guía dice «Chi-cuadrado · Asociación entre variables
    // categóricas · H₀: Variables independientes» y la FAQ del JSON-LD, que su uso más frecuente
    // es el test de independencia. El módulo solo hace bondad de ajuste: la tabla 2×2
    // [[10, 20], [30, 40]] escrita como «10 20 30 40» da χ² = 20, gl 3, p = 0,000170
    // «Significativo», cuando el de independencia da χ² = 0,7937, gl 1, p = 0,3730.
    await pestana(page, 'Chi-cuadrado');
    const ofreceIndependencia = (await page.locator('main').getByText(/independencia|contingencia/i).count()) > 0;
    // La guía (fuera de <main>) está siempre en el DOM, aunque nazca plegada.
    const filaChi = page.locator('table tr').filter({ hasText: 'Chi-cuadrado' }).filter({ hasText: 'independientes' });
    const prometeIndependencia = (await filaChi.count()) > 0;
    expect(ofreceIndependencia || !prometeIndependencia).toBe(true);
  });

  // ── Intervalo de confianza ───────────────────────────────────────────────

  test('IC 95 % del ejemplo con t de Student: [49,3902 , 53,1098]', async ({ page }) => {
    // n = 12, media 51,25, s (n − 1) = 2,927146, se = 0,844994, t(0,975; 11) = 2,200985.
    await pestana(page, 'Int. Confianza');
    await escribir(page, ['52 48 55 51 49 53 50 54 47 56 52 48']);
    await expect(valor(page, 'Intervalo de Confianza al 95% (t-Student)')).toHaveText('[49,3902 , 53,1098]');
    await expect(valor(page, 'Desviación estándar (s)')).toHaveText('2,9271');
    await expect(valor(page, 'Valor crítico t')).toHaveText('2,2010');
  });

  test('«1.500 1.600 1.700 1.800» se lee con punto de millar: media 1650 e IC [1444,5740 , 1855,4260]', async ({ page }) => {
    // s = 129,0994, se = 64,5497, t(0,975; 3) = 3,182446 → margen 205,4260.
    await pestana(page, 'Int. Confianza');
    await escribir(page, ['1.500 1.600 1.700 1.800']);
    await expect(page.getByText('4 valores leídos')).toBeVisible();
    await expect(valor(page, 'Media muestral (x̄)')).toHaveText('1650,0000');
    await expect(valor(page, 'Intervalo de Confianza al 95% (t-Student)')).toHaveText('[1444,5740 , 1855,4260]');
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

  test.fail('HALLAZGO ABIERTO · Jarque-Bera resta 3 dos veces a la curtosis: el ejemplo de la app se rechaza como no normal', async ({ page }) => {
    // jStat.kurtosis ya devuelve el EXCESO (m4/m2² − 3 = −0,647330) y page.tsx:369 le vuelve a
    // restar 3. Correcto: S = −0,288497, K − 3 = −0,647330 → JB = (20/6)·(S² + (K − 3)²/4)
    // = 0,6266 → p = e^(−JB/2) = 0,731019 → «No se rechaza normalidad».
    // Hoy: JB = 11,3633, p = 0,003408, «Se rechaza normalidad». Con cualquier muestra de
    // curtosis normal (exceso 0) y n ≥ 16 el rechazo es seguro: JB ≥ 0,375·n > 5,99.
    await pestana(page, 'Normalidad');
    await page.getByRole('button', { name: 'Cargar ejemplo' }).click();
    await expect(page.getByText('20 valores leídos')).toBeVisible();
    await expect(valor(page, 'Estadístico JB')).toHaveText('0,6266');
    await expect(valor(page, 'p-valor')).toHaveText('0,731019');
    await expect(valor(page, 'Test Jarque-Bera de Normalidad')).toContainText('No se rechaza normalidad');
  });

  test.fail('HALLAZGO ABIERTO · una muestra de colas pesadas (curtosis 5) se describe como «platicúrtica, colas ligeras»', async ({ page }) => {
    // 0 ×8, 1, −1: m2 = 0,2 y m4 = 0,2 → curtosis = 0,2/0,04 = 5 (> 3: leptocúrtica).
    // La app enseña «Curtosis 2,0000» (el exceso) y le aplica los umbrales de la curtosis
    // (< 2,5 → platicúrtica).
    await pestana(page, 'Normalidad');
    await escribir(page, ['0 0 0 0 0 0 0 0 1 -1']);
    await expect(tarjeta(page, 'Interpretación de forma')).toBeVisible();
    await expect(tarjeta(page, 'Interpretación de forma')).not.toContainText('platicúrtica');
  });

  // ── Formato ──────────────────────────────────────────────────────────────

  test.fail('HALLAZGO ABIERTO · el veredicto escribe α con punto decimal: «p < 0.05»', async ({ page }) => {
    // interpretPValue (page.tsx:15 y 17) interpola el número sin formatear.
    await escribir(page, ['23 25 28 22 26 24 27 25 29 24', '20 22 24 21 23 19 25 22 26 21']);
    await expect(valor(page, 'Interpretación (α = 0,05)')).toHaveText('Significativo (p < 0,05)');
  });

  test.fail('HALLAZGO ABIERTO · el porcentaje va pegado a la cifra: «60,00%» en vez de «60,00 %» con espacio duro', async ({ page }) => {
    await pestana(page, 'Correlación');
    await escribir(page, ['1 2 3 4 5', '2 4 5 4 5']);
    await expect(valor(page, 'R² (varianza explicada)')).toHaveText('60,00 %');
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

  test.fail('HALLAZGO ABIERTO · por debajo de 769 px las seis pestañas se quedan sin nombre accesible', async ({ page }) => {
    // .tabLabel { display: none } (module.css, @media max-width 768px) deja solo el emoji,
    // que lleva aria-hidden: seis botones mudos para un lector de pantalla.
    await expect(pestanas(page)).toHaveCount(6);
    await expect(page.getByRole('button', { name: 'Correlación' })).toHaveCount(1);
  });

  test.fail('HALLAZGO ABIERTO · con resultados de χ² los paneles miden 403 px y se recortan por la derecha', async ({ page }) => {
    // La tabla «Detalle por categoría» ensancha la pista de la rejilla; html recorta en x, así
    // que no hay scroll: el borde derecho de las tarjetas y de los textarea queda fuera.
    await pestanas(page).nth(3).click();
    await page.getByRole('button', { name: 'Cargar ejemplo' }).click();
    await expect(page.locator('main table')).toBeVisible();
    const derecha = await page
      .locator('main [class*="inputPanel"]')
      .evaluate((el) => Math.round(el.getBoundingClientRect().right));
    expect(derecha).toBeLessThanOrEqual(360);
  });
});
