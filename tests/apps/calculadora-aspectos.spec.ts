import { test, expect, Page } from '@playwright/test';

/**
 * Inspector — calculadora-aspectos (segmento cálculo, riesgo 4)
 *
 * Primera inspección: 23/08/2026. La app promete en su <h1> «📐 Calculadora de Aspectos» y en
 * su subtítulo «Redimensiona imágenes manteniendo proporciones perfectas». La metadata añade
 * «Calcula proporciones perfectas para redimensionar imágenes sin deformarlas» y presume de
 * «Ratio simplificado (ej: 16:9) y decimal mostrados simultáneamente». Hay, por tanto, verdad
 * comprobable y además exacta: es aritmética entera, sin normativa ni estimaciones.
 *
 * DÓNDE VIVE EL CÁLCULO
 *   app/calculadora-aspectos/page.tsx
 *     · gcd(a, b)                  ← Euclides recursivo
 *     · simplifyRatio(w, h)        ← w/mcd : h/mcd; si alguno supera 100 cae a `(w/h).toFixed(2):1`
 *     · currentRatio (useMemo)     ← { ratio: simplifyRatio(w,h), decimal: w/h }
 *                                    con w<=0 o h<=0 devuelve { '0:0', 0 } — la puerta de rechazo
 *     · calculateNewDimension()    ← ancho→alto: Math.round(n / ratio)
 *                                    alto→ancho: Math.round(n * ratio); con ratio<=0 retorna sin tocar nada
 *     · pixelCount (useMemo)       ← >=1e6 → `(px/1e6).toFixed(2) MP` · si no → `px.toLocaleString('es-ES') px`
 *
 * LOS TRES CASOS, RESUELTOS A MANO ANTES DE ABRIR EL NAVEGADOR
 *
 *   CASO 1 (normal) — 1920 × 1080, el caso canónico
 *       mcd(1920, 1080): 1920 mod 1080 = 840 · 1080 mod 840 = 240 · 840 mod 240 = 120 · 240 mod 120 = 0
 *         → mcd = 120 ; 1920/120 = 16 ; 1080/120 = 9 ; ambos ≤ 100 → ratio «16:9»
 *       decimal = 1920/1080 = 1,777777… → 3 decimales = 1,778
 *       Nuevo ancho 1600 → alto = 1600 × 1080/1920 = 900 EXACTO (sin redondeo)
 *         resolución = 1600 × 900 = 1.440.000 px ≥ 1e6 → 1,44 MP
 *       Nuevo ancho 800  → alto = 800 × 1080/1920 = 450
 *         resolución = 800 × 450 = 360.000 px < 1e6 → «360.000 px» (punto = MILLAR)
 *
 *   CASO 2 (límite) — 1920 × 1081, una relación que NO simplifica
 *       1081 = 23 × 47, y ninguno divide a 1920 = 2^7 × 3 × 5 → mcd = 1
 *       (comprobado por Euclides: 1920,1081 → 1081,839 → 839,242 → 242,113 → 113,16 → 16,1 → 1,0)
 *       Como 1920 > 100, simplifyRatio cae a la rama decimal:
 *         1920/1081 = 1,7761332099907… → 2 decimales = 1,78 → ratio «1,78:1»
 *         decimal a 3 decimales = 1,776
 *       Nuevo ALTO 500 (se prueba la otra dirección, la que multiplica):
 *         ancho = round(500 × 1920/1081) = round(960000/1081) = round(888,0666…) = 888
 *         resolución = 888 × 500 = 444.000 px < 1e6 → «444.000 px»
 *
 *   CASO 3 (rechazo) — el cero y el negativo
 *       Un lado 0 o negativo no define ningún rectángulo: no hay ratio que devolver.
 *       0 × 1080, 1920 × 0 y −1920 × 1080 → «0:0» y decimal 0,000.
 *       Y con el ratio inválido el campo de nuevas dimensiones debe quedarse mudo: teclear 800
 *       en «Nuevo Ancho» no puede producir NINGÚN alto. Lo que no debe salir nunca:
 *       «NaN», «Infinity», «-1920:1080» ni una división por cero disfrazada.
 *
 * HALLAZGOS CONOCIDOS (se documentan aquí como TESTIGO, NO se corrigen desde el test):
 *   1. FORMATO ESPAÑOL: las tres cifras decimales de la pantalla salen de un `toFixed()` crudo,
 *      con PUNTO decimal: «(1.778)», «1.78:1» y «1.44 MP». Y conviven con el separador de millar
 *      correcto («360.000 px», vía toLocaleString('es-ES')) en el MISMO hueco de pantalla, así que
 *      el punto significa dos cosas distintas a un segundo de diferencia.
 *   2. El preset «Facebook Cover» se anuncia como 2.7:1, pero 820/312 = 2,628 → la propia app
 *      muestra 2.63:1 al pulsarlo. La etiqueta se contradice con el resultado.
 *   3. Accesibilidad: tres <button> sin type="button" (intercambio, categorías, presets) y el
 *      emoji 🔒 junto a «Mantener proporción» sin <span aria-hidden="true">.
 *   Si algún día se arreglan, los bloques marcados TESTIGO fallarán y habrá que invertirlos.
 */

const RUTA = '/calculadora-aspectos/';

/** Escribe las dimensiones originales y espera al recálculo del useMemo. */
async function fijaOriginal(pagina: Page, ancho: string, alto: string) {
  await pagina.fill('#originalWidth', ancho);
  await pagina.fill('#originalHeight', alto);
  await expect(pagina.locator('[role="status"]').first()).toBeVisible();
}

/** Texto normalizado de la banda «Ratio actual: X (Y)». */
async function leeRatio(pagina: Page): Promise<string> {
  return (await pagina.locator('[role="status"]').first().innerText()).replace(/\s+/g, ' ').trim();
}

/** Texto normalizado de la banda «Resolución: …», que solo existe si hay nuevas dimensiones. */
async function leeResolucion(pagina: Page): Promise<string> {
  return (await pagina.locator('[role="status"]').nth(1).innerText()).replace(/\s+/g, ' ').trim();
}

test.beforeEach(async ({ page }) => {
  await page.goto(RUTA);
});

test('la app se presenta como calculadora de aspectos', async ({ page }) => {
  await expect(page.locator('h1')).toContainText('Calculadora de Aspectos');
  await expect(page).toHaveTitle(/Calculadora de Aspectos de Imagen/);
});

test('CASO 1 (normal): 1920×1080 da 16:9 y 1600 de ancho da 900 de alto', async ({ page }) => {
  // El valor por defecto de la app ya es 1920×1080; se reescribe para no depender de ello.
  await fijaOriginal(page, '1920', '1080');

  // mcd(1920,1080) = 120 → 16:9 (calculado a mano en la cabecera). 1920/1080 = 1,777… → 1,778.
  expect(await leeRatio(page)).toContain('16:9');
  // TESTIGO del hallazgo 1: debería ser «1,778» con coma decimal.
  expect(await leeRatio(page)).toContain('1.778');

  // 1600 × 1080/1920 = 900 exacto.
  await page.fill('#newWidth', '1600');
  await expect(page.locator('#newHeight')).toHaveValue('900');
  // 1600 × 900 = 1.440.000 px → 1,44 MP.
  // TESTIGO del hallazgo 1: debería ser «1,44 MP».
  expect(await leeResolucion(page)).toContain('1.44 MP');

  // 800 × 1080/1920 = 450 ; 800 × 450 = 360.000 px (por debajo del megapíxel, rama toLocaleString).
  await page.fill('#newWidth', '800');
  await expect(page.locator('#newHeight')).toHaveValue('450');
  expect(await leeResolucion(page)).toContain('360.000 px');

  // Y la dirección contraria, la que multiplica: 450 de alto → 450 × 1920/1080 = 800 de ancho.
  await page.fill('#newHeight', '450');
  await expect(page.locator('#newWidth')).toHaveValue('800');
});

test('CASO 2 (límite): 1920×1081 no simplifica y 500 de alto da 888 de ancho', async ({ page }) => {
  await fijaOriginal(page, '1920', '1081');

  const ratio = await leeRatio(page);
  // mcd(1920,1081) = 1 (1081 = 23×47, primo con 2^7×3×5), así que 1920 > 100 y cae a la rama
  // decimal: 1920/1081 = 1,77613… → «1.78:1», y el decimal a 3 cifras → «1.776».
  // TESTIGO del hallazgo 1: deberían ser «1,78:1» y «1,776» con coma decimal.
  expect(ratio).toContain('1.78:1');
  expect(ratio).toContain('1.776');
  // Lo que NO puede pasar: que se cuele la fracción sin simplificar.
  expect(ratio).not.toContain('1920:1081');

  // round(500 × 1920/1081) = round(960000/1081) = round(888,0666…) = 888.
  await page.fill('#newHeight', '500');
  await expect(page.locator('#newWidth')).toHaveValue('888');
  // 888 × 500 = 444.000 px.
  expect(await leeResolucion(page)).toContain('444.000 px');
});

test('CASO 3 (rechazo): cero y negativo no producen ratio ni nuevas dimensiones', async ({ page }) => {
  // Ancho 0: no hay rectángulo, luego no hay ratio. Esperado «0:0» y decimal 0.
  await fijaOriginal(page, '0', '1080');
  const conCero = await leeRatio(page);
  expect(conCero).toContain('0:0');
  expect(conCero).not.toMatch(/NaN|Infinity|undefined/);

  // Con el ratio inválido, teclear un ancho nuevo no debe generar ningún alto.
  await page.fill('#newWidth', '800');
  await expect(page.locator('#newHeight')).toHaveValue('');

  // Alto 0: mismo rechazo por el otro lado (aquí la división sería por cero).
  await fijaOriginal(page, '1920', '0');
  expect(await leeRatio(page)).toContain('0:0');
  expect(await leeRatio(page)).not.toMatch(/NaN|Infinity/);

  // Negativo: un ancho de −1920 px no existe.
  await fijaOriginal(page, '-1920', '1080');
  const conNegativo = await leeRatio(page);
  expect(conNegativo).toContain('0:0');
  expect(conNegativo).not.toContain('-1920');
});

test('los presets cargan las dimensiones que anuncian y el ratio se recalcula', async ({ page }) => {
  // Pinterest Pin: 1000×1500, mcd = 500 → 2:3 (y 1000/1500 = 0,666… → 0,667).
  await page.getByRole('button', { name: /Pinterest Pin/ }).click();
  await expect(page.locator('#originalWidth')).toHaveValue('1000');
  await expect(page.locator('#originalHeight')).toHaveValue('1500');
  expect(await leeRatio(page)).toContain('2:3');

  // Facebook Post: 1200×630, mcd = 30 → 40:21 (ambos ≤ 100, así que NO cae a la rama decimal).
  await page.getByRole('button', { name: /Facebook Post/ }).click();
  expect(await leeRatio(page)).toContain('40:21');

  // TESTIGO del hallazgo 2: el botón se anuncia «2.7:1» pero 820/312 = 2,628 → sale 2.63:1.
  await page.getByRole('button', { name: /Facebook Cover/ }).click();
  await expect(page.locator('#originalWidth')).toHaveValue('820');
  await expect(page.locator('#originalHeight')).toHaveValue('312');
  expect(await leeRatio(page)).toContain('2.63:1');
});

test('el botón de intercambio invierte el ratio (16:9 → 9:16)', async ({ page }) => {
  await fijaOriginal(page, '1920', '1080');
  expect(await leeRatio(page)).toContain('16:9');

  await page.getByRole('button', { name: 'Intercambiar ancho y alto' }).click();
  await expect(page.locator('#originalWidth')).toHaveValue('1080');
  await expect(page.locator('#originalHeight')).toHaveValue('1920');
  // 1080/1920 = 0,5625 → 3 decimales 0,563 ; mcd = 120 → 9:16.
  expect(await leeRatio(page)).toContain('9:16');
});
