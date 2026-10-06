import { test, expect, Page, Locator } from '@playwright/test';
import {
  esperarHidratacion,
  esperarPaginaAsentada,
  esperarValorEnReact,
  sembrarValor,
} from './_hidratacion';

/**
 * Simulador del Efecto Fotoeléctrico — PASO 4.bis de /nueva-app-meskeia (06/10/2026)
 *
 * QUÉ PROMETE LA APP
 *   El <h1> dice «Simulador del Efecto Fotoeléctrico» y el subtítulo «mira cuándo salen
 *   electrones y con qué energía, según la ecuación de Einstein E_c,máx = h·f − φ». Tres
 *   controles: deslizador de λ (100-800 nm), deslizador de intensidad (0-100 %) y nueve
 *   botones de metal con aria-pressed (los ocho de Serway y Jewett, tabla 40.1, más «Otro φ»).
 *   Nueve tarjetas de resultado dentro de un role="status": E del fotón, f, φ, f₀, λ₀,
 *   E_c,máx, v máx, V₀ y corriente relativa. Un dibujo SVG de la placa con un electrón por
 *   cada 10 % de intensidad (redondeado, y al menos uno si hay emisión) que vuelan hacia el
 *   colector, y que con prefers-reduced-motion se quedan QUIETOS repartidos por el camino.
 *   Estado inicial: λ = 400 nm, sodio, intensidad 60 %.
 *
 * LA VERDAD FÍSICA, CALCULADA A MANO ANTES DE ABRIR EL NAVEGADOR
 *   CODATA 2018: h = 6,62607015e−34 J·s · e = 1,602176634e−19 C · c = 299.792.458 m/s ·
 *   mₑ = 9,1093837015e−31 kg  →  h·c/e = 1.239,8419843 eV·nm.
 *
 *   λ = 400 nm: E = 1.239,8419843/400 = 3,0996050 eV  → la vista, con 3 decimales: «3,100 eV»
 *               E en J = 3,0996050 × 1,602176634e−19 = 4,966115e−19 → «4,966 × 10⁻¹⁹ J»
 *               f = c/λ = 299.792.458/4e−7 = 7,49481145e14 Hz      → «7,495 × 10¹⁴ Hz»
 *
 *   Sodio (φ = 2,46 eV) a 400 nm:
 *     E_c = 3,0996050 − 2,46 = 0,6396050 eV                        → «0,640 eV»
 *     V₀ = E_c/e: el mismo número en voltios                        → «0,640 V»
 *     v = √(2 · 0,6396050 · 1,602176634e−19 / 9,1093837015e−31) = 4,743311e5 m/s
 *                                                                   → «4,743 × 10⁵ m/s»
 *     λ₀ = 1.239,8419843/2,46 = 504,0008 nm                         → «504,0 nm»
 *     f₀ = 2,46 · 1,602176634e−19 / 6,62607015e−34 = 5,948254e14 Hz → «5,948 × 10¹⁴ Hz»
 *
 *   Sodio a 250 nm (para que el caso 1 MUEVA el deslizador antes de volver a 400):
 *     E = 1.239,8419843/250 = 4,9593679 eV → «4,959 eV» · E_c = 2,4993679 eV → «2,499 eV»
 *
 *   Cobre (φ = 4,70 eV) a 400 nm: 3,0996 < 4,70 → SIN emisión. Le faltan
 *     4,70 − 3,0996050 = 1,6003950 eV → «1,600 eV». Corriente 0 aunque la intensidad sea 100 %.
 *     λ₀ del cobre = 1.239,8419843/4,70 = 263,7962 nm → «263,8 nm».
 *
 *   Platino (φ = 6,35 eV): λ₀ = 1.239,8419843/6,35 = 195,2507 nm → «195,3 nm».
 *   «Otro φ» = 2 eV: λ₀ = 619,9210 nm → «619,9 nm» · a 400 nm E_c = 1,0996050 → «1,100 eV».
 *
 *   La intensidad NO entra en ninguna de esas fórmulas: con intensidad 0 la E_c que publica la
 *   tarjeta es la misma (0,640 eV con sodio a 400 nm), pero no sale ningún electrón y la
 *   corriente es «0 %». Electrones dibujados: round(intensidad/10) → 60 % = 6, 100 % = 10, 0 % = 0.
 *
 *   Dibujo estático (prefers-reduced-motion): el electrón i de n queda trasladado
 *   --dx · (i + 0,5)/n en horizontal, con --dx = X_COLECTOR − X_EMISOR − 14 = 410 − 84 − 14 =
 *   312 unidades. Con n = 6: 26, 78, 130, 182, 234 y 286.
 *
 * LOS SEIS CASOS
 *   1) sodio a 400 nm: las nueve tarjetas con su redondeo.
 *   2) cobre a 400 nm con intensidad 100 %: sin emisión, mensaje de que la intensidad no lo
 *      arregla, corriente 0 y ningún electrón.
 *   3) intensidad 0 con sodio a 400 nm: la E_c no cambia; los electrones y la corriente, sí.
 *   4) prefers-reduced-motion: ninguna animación en marcha y electrones repartidos quietos.
 *   5) presets de metal con aria-pressed, más «Otro φ».
 *   6) RelatedApps pinta 4 tarjetas.
 */

const SLIDERS = ['#slider-lambda', '#slider-intensidad'] as const;
const NBSP = ' ';

/** El valor (segundo span) de la tarjeta de resultado cuya etiqueta contiene `etiqueta`. */
function valorTarjeta(page: Page, etiqueta: string): Locator {
  return page
    .locator('[class*="valueCard"]')
    .filter({ hasText: etiqueta })
    .locator(':scope > span')
    .nth(1);
}

function electrones(page: Page): Locator {
  return page.locator('svg circle[class*="electron"]');
}

test.beforeEach(async ({ page }) => {
  await page.goto('/simulador-efecto-fotoelectrico/');
  await esperarPaginaAsentada(page);
  await esperarHidratacion(page, SLIDERS);
});

// ─────────────────────────────────────────────────────────────────────────────
test('Caso 1 — sodio a 400 nm: E, f, E_c, v, V₀, λ₀ y f₀ con el redondeo de la vista', async ({ page }) => {
  // Pasa antes por 250 nm: sembrar 400 de entrada sería un no-op (es el valor inicial).
  await sembrarValor(page, '#slider-lambda', 250);
  await expect(valorTarjeta(page, 'Energía del fotón')).toHaveText('4,959 eV');
  await expect(valorTarjeta(page, 'Energía cinética máxima')).toHaveText('2,499 eV');

  await sembrarValor(page, '#slider-lambda', 400);
  await expect(valorTarjeta(page, 'Energía del fotón')).toHaveText('3,100 eV');
  await expect(
    page.locator('[class*="valueCard"]').filter({ hasText: 'Energía del fotón' }).locator(':scope > span').nth(2),
  ).toHaveText('4,966 × 10⁻¹⁹ J');
  await expect(valorTarjeta(page, 'Frecuencia f')).toHaveText('7,495 × 10¹⁴ Hz');
  await expect(valorTarjeta(page, 'Función de trabajo')).toHaveText('2,46 eV');
  await expect(valorTarjeta(page, 'Energía cinética máxima')).toHaveText('0,640 eV');
  await expect(valorTarjeta(page, 'Velocidad máxima')).toHaveText('4,743 × 10⁵ m/s');
  await expect(valorTarjeta(page, 'Potencial de frenado')).toHaveText('0,640 V');
  await expect(valorTarjeta(page, 'Longitud de onda umbral')).toHaveText('504,0 nm');
  await expect(valorTarjeta(page, 'Frecuencia umbral')).toHaveText('5,948 × 10¹⁴ Hz');
  await expect(valorTarjeta(page, 'Corriente relativa')).toHaveText(`60${NBSP}%`);
  await expect(page.getByText(/Se emiten electrones/)).toBeVisible();
  await expect(electrones(page)).toHaveCount(6);
});

// ─────────────────────────────────────────────────────────────────────────────
test('Caso 2 — cobre a 400 nm: sin emisión aunque la intensidad sea 100 %', async ({ page }) => {
  await page.getByRole('button', { name: /^Cobre/ }).click();
  await sembrarValor(page, '#slider-intensidad', 100);

  await expect(
    page.getByText(/no se emiten electrones aunque aumentes la intensidad\. A cada fotón le faltan 1,600 eV/),
  ).toBeVisible();
  await expect(valorTarjeta(page, 'Función de trabajo')).toHaveText('4,70 eV');
  await expect(valorTarjeta(page, 'Longitud de onda umbral')).toHaveText('263,8 nm');
  await expect(valorTarjeta(page, 'Energía cinética máxima')).toHaveText('sin emisión');
  await expect(valorTarjeta(page, 'Velocidad máxima')).toHaveText('sin emisión');
  await expect(valorTarjeta(page, 'Potencial de frenado')).toHaveText(/^0 V/);
  await expect(valorTarjeta(page, 'Corriente relativa')).toHaveText(`0${NBSP}%`);
  await expect(electrones(page)).toHaveCount(0);
  await expect(page.locator('svg text', { hasText: /^Sin emisión: E fotón/ })).toBeVisible();

  // Y la energía del fotón sigue siendo la de 400 nm: el metal no la cambia.
  await expect(valorTarjeta(page, 'Energía del fotón')).toHaveText('3,100 eV');
});

// ─────────────────────────────────────────────────────────────────────────────
test('Caso 3 — intensidad 0 con sodio a 400 nm: la energía no cambia, la corriente sí', async ({ page }) => {
  // Partida: 60 % → 6 electrones y E_c = 0,640 eV
  await expect(valorTarjeta(page, 'Energía cinética máxima')).toHaveText('0,640 eV');
  await expect(electrones(page)).toHaveCount(6);

  await sembrarValor(page, '#slider-intensidad', 100);
  await expect(valorTarjeta(page, 'Energía cinética máxima')).toHaveText('0,640 eV');
  await expect(valorTarjeta(page, 'Corriente relativa')).toHaveText(`100${NBSP}%`);
  await expect(electrones(page)).toHaveCount(10);

  await sembrarValor(page, '#slider-intensidad', 0);
  await expect(valorTarjeta(page, 'Energía cinética máxima')).toHaveText('0,640 eV');
  await expect(valorTarjeta(page, 'Potencial de frenado')).toHaveText('0,640 V');
  await expect(valorTarjeta(page, 'Corriente relativa')).toHaveText(`0${NBSP}%`);
  await expect(electrones(page)).toHaveCount(0);
  await expect(page.getByText(/Con intensidad 0 no llega ningún fotón/)).toBeVisible();
});

// ─────────────────────────────────────────────────────────────────────────────
test('Caso 4 — prefers-reduced-motion: nada animado y electrones quietos repartidos', async ({ page }) => {
  // Sin la preferencia, los electrones y los rayos SÍ se animan (si no, el caso no probaría nada)
  await expect(electrones(page)).toHaveCount(6);
  const animadosAntes = await page.evaluate(
    () =>
      Array.from(document.querySelectorAll('svg circle[class*="electron"], svg line[class*="rayo"]')).filter(
        (el) => el.getAnimations().length > 0,
      ).length,
  );
  expect(animadosAntes).toBeGreaterThan(0);

  await page.emulateMedia({ reducedMotion: 'reduce' });

  await expect
    .poll(() =>
      page.evaluate(
        () =>
          Array.from(document.querySelectorAll('svg circle[class*="electron"], svg line[class*="rayo"]')).filter(
            (el) => el.getAnimations().length > 0 || getComputedStyle(el).animationName !== 'none',
          ).length,
      ),
    )
    .toBe(0);

  // Quietos en (i + 0,5)/6 de un recorrido de 312: 26, 78, 130, 182, 234, 286
  const desplazamientos = await page.evaluate(() =>
    Array.from(document.querySelectorAll('svg circle[class*="electron"]')).map(
      (el) => new DOMMatrixReadOnly(getComputedStyle(el).transform).m41,
    ),
  );
  const esperados = [26, 78, 130, 182, 234, 286];
  expect(desplazamientos).toHaveLength(esperados.length);
  desplazamientos.forEach((dx, i) => expect(dx).toBeCloseTo(esperados[i], 0));

  // La rapidez la sigue contando la flecha «v máx»
  await expect(page.locator('svg text', { hasText: /^v máx$/ })).toBeVisible();
});

// ─────────────────────────────────────────────────────────────────────────────
test('Caso 5 — presets de metal con aria-pressed, y «Otro φ»', async ({ page }) => {
  const botones = page.locator('fieldset button[aria-pressed]');
  await expect(botones).toHaveCount(9);
  await expect(page.locator('fieldset button[aria-pressed="true"]')).toHaveCount(1);
  await expect(page.getByRole('button', { name: /^Sodio/ })).toHaveAttribute('aria-pressed', 'true');

  await page.getByRole('button', { name: /^Platino/ }).click();
  await expect(page.getByRole('button', { name: /^Platino/ })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('button', { name: /^Sodio/ })).toHaveAttribute('aria-pressed', 'false');
  await expect(page.locator('fieldset button[aria-pressed="true"]')).toHaveCount(1);
  await expect(valorTarjeta(page, 'Función de trabajo')).toHaveText('6,35 eV');
  await expect(valorTarjeta(page, 'Longitud de onda umbral')).toHaveText('195,3 nm');
  await expect(valorTarjeta(page, 'Energía cinética máxima')).toHaveText('sin emisión');

  await page.getByRole('button', { name: /^Otro φ/ }).click();
  await expect(page.getByRole('button', { name: /^Otro φ/ })).toHaveAttribute('aria-pressed', 'true');
  const entradaPhi = page.getByLabel('Función de trabajo φ (eV)');
  await entradaPhi.fill('2');
  await esperarValorEnReact(page, entradaPhi, '2');
  await expect(valorTarjeta(page, 'Función de trabajo')).toHaveText('2,00 eV');
  await expect(valorTarjeta(page, 'Longitud de onda umbral')).toHaveText('619,9 nm');
  await expect(valorTarjeta(page, 'Energía cinética máxima')).toHaveText('1,100 eV');
});

// ─────────────────────────────────────────────────────────────────────────────
test('Caso 6 — RelatedApps pinta 4 tarjetas, con el espectro entre ellas', async ({ page }) => {
  const relacionadas = page.locator('section[aria-label="Aplicaciones relacionadas"] a');
  await expect(relacionadas).toHaveCount(4);
  await expect(
    page.locator('section[aria-label="Aplicaciones relacionadas"] a[href*="visualizador-espectro-electromagnetico"]'),
  ).toHaveCount(1);
});
