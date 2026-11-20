import { test, expect, Page, Locator } from '@playwright/test';
import {
  esperarHidratacion,
  esperarPaginaAsentada,
  esperarValorEnReact,
  sembrarValor,
} from './_hidratacion';
import {
  CASOS,
  TOTAL_CASOS,
  comprobarRespuesta,
  generarEjercicioAleatorio,
  resolverCaso,
} from '../../app/simulador-efecto-fotoelectrico/casos';
import { MASA_ELECTRON, METALES } from '../../app/simulador-efecto-fotoelectrico/motor';

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
 *   CODATA 2022: h = 6,62607015e−34 J·s · e = 1,602176634e−19 C · c = 299.792.458 m/s ·
 *   mₑ = 9,1093837139e−31 kg  →  h·c/e = 1.239,8419843 eV·nm. (Hasta el 13/11/2026 la app usaba
 *   la mₑ de CODATA 2018, 9,1093837015e−31: 1,4·10⁻¹⁰ relativo, que no mueve ninguna cifra de
 *   abajo. Por eso el caso 7 mira el rótulo, que es lo único que cambia en pantalla.)
 *
 *   λ = 400 nm: E = 1.239,8419843/400 = 3,0996050 eV  → la vista, con 3 decimales: «3,100 eV»
 *               E en J = 3,0996050 × 1,602176634e−19 = 4,966115e−19 → «4,966 × 10⁻¹⁹ J»
 *               f = c/λ = 299.792.458/4e−7 = 7,49481145e14 Hz      → «7,495 × 10¹⁴ Hz»
 *
 *   Sodio (φ = 2,46 eV) a 400 nm:
 *     E_c = 3,0996050 − 2,46 = 0,6396050 eV                        → «0,640 eV»
 *     V₀ = E_c/e: el mismo número en voltios                        → «0,640 V»
 *     v = √(2 · 0,6396050 · 1,602176634e−19 / 9,1093837139e−31) = 4,743311e5 m/s
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
 *   7) el rótulo de las constantes dice CODATA 2022 y la mₑ de 2022, la misma que usa el motor
 *      (cabo C0726: el de 2018 seguía en pantalla).
 *
 * INSPECCIÓN DEL 19/11/2026 (Inspector, primera entera) — casos 8 a 14
 *   Esperados recalculados APARTE del motor (script del inspector, constantes del SI: h, c y e
 *   exactas del BIPM; mₑ = 9,109 383 7139·10⁻³¹ kg leída en physics.nist.gov/cgi-bin/cuu/Value?me,
 *   CODATA 2022), antes de abrir el navegador:
 *
 *   Zinc (φ = 4,31 eV) a 250 nm, el problema resuelto de la guía:
 *     E = 1.239,8419843/250 = 4,9593679 eV → «4,959 eV» · E en J = 7,945783·10⁻¹⁹ → «7,946 × 10⁻¹⁹ J»
 *     f = 299.792.458/2,5·10⁻⁷ = 1,1991698·10¹⁵ → «1,199 × 10¹⁵ Hz»
 *     f₀ = 4,31 · 1,602176634·10⁻¹⁹/6,62607015·10⁻³⁴ = 1,0421534·10¹⁵ → «1,042 × 10¹⁵ Hz»
 *     λ₀ = 1.239,8419843/4,31 = 287,66635 nm → «287,7 nm», ultravioleta
 *     E_c = 0,6493679 eV → «0,649 eV» · 1,040402·10⁻¹⁹ J → «1,040 × 10⁻¹⁹ J» · V₀ → «0,649 V»
 *     v = √(2 · 1,040402·10⁻¹⁹/9,1093837139·10⁻³¹) = 4,779375·10⁵ → «4,779 × 10⁵ m/s»
 *     (la guía, con constantes de 4 cifras: 4,96 eV, 0,65 eV, 4,78 × 10⁵ m/s, 287,7 nm y 1,04 × 10¹⁵ Hz)
 *
 *   Platino (φ = 6,35 eV) a 100 nm, el extremo del deslizador:
 *     E = 12,398420 eV → «12,398 eV» · 1,986446·10⁻¹⁸ J → «1,986 × 10⁻¹⁸ J» · f → «2,998 × 10¹⁵ Hz»
 *     f₀ = 1,535444·10¹⁵ → «1,535 × 10¹⁵ Hz» · E_c = 6,048420 eV → «6,048 eV» y «6,048 V»
 *     E_c en J = 9,690636·10⁻¹⁹ → «9,691 × 10⁻¹⁹ J» · v = 1,458635·10⁶ → «1,459 × 10⁶ m/s»
 *
 *   El umbral del sodio (λ₀ = 504,0008 nm):
 *     503 nm → E = 2,4648946 eV, E_c = 0,0048946 → «0,005 eV», «0,005 V», v = 4,149391·10⁴ → «4,149 × 10⁴ m/s»
 *     505 nm → E = 2,4551326 eV < 2,46: sin emisión, le faltan 0,0048674 → «0,005 eV», corriente 0 %
 *   El umbral EXACTO: «Otro φ» = 3,09960496083 eV a 400 nm (E = 3,09960496083 eV): E − φ ≈ 7·10⁻¹⁵,
 *     λ₀ = 400,0000 nm → «400,0 nm». E_c = 0: sin emisión neta, V₀ = 0, corriente 0, ningún electrón.
 *   Rechazo: φ = 0 o negativa no es una función de trabajo → ninguna tarjeta y el aviso.
 *
 *   El color de Bruton (color.ts), recalculado aparte: 445 nm → rgb(0, 40, 255), tono 231° ·
 *     590 nm → rgb(255, 223, 0), 52° · 620 nm → rgb(255, 119, 0), 28°. Controles en el centro de
 *     cada nombre: 400 → 283° (violeta) · 470 → 200° (azul) · 530 → 98° (verde) · 575 → 64°
 *     (amarillo) · 650 → 0° (rojo).
 *
 *   Los test con test.fail() son HALLAZGOS ABIERTOS: el día que se reparen, fallarán por pasar y
 *   habrá que quitarles el test.fail() (y cambiar ABIERTO por REPARADO). Cada uno afirma lo CORRECTO.
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

// ─────────────────────────────────────────────────────────────────────────────
test('Caso 7 — el rótulo de las constantes es el de CODATA 2022, igual que el motor (C0726)', async ({ page }) => {
  // mₑ de CODATA 2022 leída en physics.nist.gov/cgi-bin/cuu/Value?me: 9,109 383 7139(28)·10⁻³¹ kg.
  // El cambio desde la de 2018 no mueve ninguna tarjeta (ver la cabecera), así que lo único que
  // delata una constante vieja en pantalla es este rótulo.
  expect(MASA_ELECTRON).toBe(9.1093837139e-31);
  const rotulo = page.locator('p').filter({ hasText: /^Constantes CODATA/ });
  await expect(rotulo).toHaveCount(1);
  await expect(rotulo).toContainText('Constantes CODATA 2022');
  await expect(rotulo).toContainText('mₑ = 9,1093837139 × 10⁻³¹ kg');
  await expect(rotulo).not.toContainText('2018');
});

// ─────────────────────────────────────────────────────────────────────────────
test('Caso 8 — zinc a 250 nm, el problema resuelto de la guía: las nueve tarjetas', async ({ page }) => {
  await page.getByRole('button', { name: /^Zinc/ }).click();
  await sembrarValor(page, '#slider-lambda', 250);

  const tarjetaEnergia = page.locator('[class*="valueCard"]').filter({ hasText: 'Energía del fotón' });
  const tarjetaEc = page.locator('[class*="valueCard"]').filter({ hasText: 'Energía cinética máxima' });
  await expect(valorTarjeta(page, 'Energía del fotón')).toHaveText('4,959 eV');
  await expect(tarjetaEnergia.locator(':scope > span').nth(2)).toHaveText('7,946 × 10⁻¹⁹ J');
  await expect(valorTarjeta(page, 'Frecuencia f')).toHaveText('1,199 × 10¹⁵ Hz');
  await expect(valorTarjeta(page, 'Función de trabajo')).toHaveText('4,31 eV');
  await expect(valorTarjeta(page, 'Frecuencia umbral')).toHaveText('1,042 × 10¹⁵ Hz');
  await expect(valorTarjeta(page, 'Longitud de onda umbral')).toHaveText('287,7 nm');
  await expect(valorTarjeta(page, 'Energía cinética máxima')).toHaveText('0,649 eV');
  await expect(tarjetaEc.locator(':scope > span').nth(2)).toHaveText('1,040 × 10⁻¹⁹ J');
  await expect(valorTarjeta(page, 'Velocidad máxima')).toHaveText('4,779 × 10⁵ m/s');
  await expect(valorTarjeta(page, 'Potencial de frenado')).toHaveText('0,649 V');
  await expect(page.getByText(/a cada fotón le sobran 0,649 eV/)).toBeVisible();
});

// ─────────────────────────────────────────────────────────────────────────────
test('Caso 9 — platino a 100 nm, el extremo ultravioleta del deslizador', async ({ page }) => {
  await page.getByRole('button', { name: /^Platino/ }).click();
  await sembrarValor(page, '#slider-lambda', 100);

  const tarjetaEnergia = page.locator('[class*="valueCard"]').filter({ hasText: 'Energía del fotón' });
  const tarjetaEc = page.locator('[class*="valueCard"]').filter({ hasText: 'Energía cinética máxima' });
  await expect(valorTarjeta(page, 'Energía del fotón')).toHaveText('12,398 eV');
  await expect(tarjetaEnergia.locator(':scope > span').nth(2)).toHaveText('1,986 × 10⁻¹⁸ J');
  await expect(valorTarjeta(page, 'Frecuencia f')).toHaveText('2,998 × 10¹⁵ Hz');
  await expect(valorTarjeta(page, 'Frecuencia umbral')).toHaveText('1,535 × 10¹⁵ Hz');
  await expect(valorTarjeta(page, 'Longitud de onda umbral')).toHaveText('195,3 nm');
  await expect(valorTarjeta(page, 'Energía cinética máxima')).toHaveText('6,048 eV');
  await expect(tarjetaEc.locator(':scope > span').nth(2)).toHaveText('9,691 × 10⁻¹⁹ J');
  await expect(valorTarjeta(page, 'Velocidad máxima')).toHaveText('1,459 × 10⁶ m/s');
  await expect(valorTarjeta(page, 'Potencial de frenado')).toHaveText('6,048 V');
  await expect(electrones(page)).toHaveCount(6);
});

// ─────────────────────────────────────────────────────────────────────────────
test('Caso 10 — el umbral: sodio a 503 y 505 nm, y «Otro φ» justo en λ₀ = 400 nm', async ({ page }) => {
  // Un nanómetro por debajo de λ₀ = 504,0008 nm: emite, con 0,0049 eV.
  await sembrarValor(page, '#slider-lambda', 503);
  await expect(valorTarjeta(page, 'Energía cinética máxima')).toHaveText('0,005 eV');
  await expect(valorTarjeta(page, 'Potencial de frenado')).toHaveText('0,005 V');
  await expect(valorTarjeta(page, 'Velocidad máxima')).toHaveText('4,149 × 10⁴ m/s');
  await expect(valorTarjeta(page, 'Corriente relativa')).toHaveText(`60${NBSP}%`);

  // Uno por encima: ya no emite, y le faltan 0,0049 eV.
  await sembrarValor(page, '#slider-lambda', 505);
  await expect(page.getByText(/no se emiten electrones aunque aumentes la intensidad\. A cada fotón le faltan 0,005 eV/)).toBeVisible();
  await expect(valorTarjeta(page, 'Energía cinética máxima')).toHaveText('sin emisión');
  await expect(valorTarjeta(page, 'Corriente relativa')).toHaveText(`0${NBSP}%`);
  await expect(electrones(page)).toHaveCount(0);

  // Justo en el umbral: φ = h·c/(400 nm) con once cifras. E_c = 0 → sin emisión neta.
  await sembrarValor(page, '#slider-lambda', 400);
  await page.getByRole('button', { name: /^Otro φ/ }).click();
  const entradaPhi = page.getByLabel('Función de trabajo φ (eV)');
  await entradaPhi.fill('3,09960496083');
  await esperarValorEnReact(page, entradaPhi, '3,09960496083');
  await expect(valorTarjeta(page, 'Longitud de onda umbral')).toHaveText('400,0 nm');
  await expect(page.getByText(/^Justo en el umbral/)).toBeVisible();
  await expect(valorTarjeta(page, 'Energía cinética máxima')).toHaveText('sin emisión');
  await expect(valorTarjeta(page, 'Potencial de frenado')).toHaveText(/^0 V/);
  await expect(valorTarjeta(page, 'Corriente relativa')).toHaveText(`0${NBSP}%`);
  await expect(electrones(page)).toHaveCount(0);
  await expect(page.locator('svg text', { hasText: /^En el umbral: sin emisión neta$/ })).toBeVisible();
});

// ─────────────────────────────────────────────────────────────────────────────
test('Caso 11 — una función de trabajo de 0 o negativa se rechaza: ninguna tarjeta y el aviso', async ({ page }) => {
  await page.getByRole('button', { name: /^Otro φ/ }).click();
  const entradaPhi = page.getByLabel('Función de trabajo φ (eV)');
  const aviso = page.locator('[role="status"]').getByText('Escribe una función de trabajo mayor que 0 eV para calcular.');
  for (const valor of ['0', '-2']) {
    await entradaPhi.fill(valor);
    await esperarValorEnReact(page, entradaPhi, valor);
    await expect(aviso).toBeVisible();
    await expect(page.locator('[class*="valueCard"]')).toHaveCount(0);
    await expect(electrones(page)).toHaveCount(0);
    await expect(page.locator('svg text', { hasText: /^Corriente relativa: —$/ })).toBeVisible();
  }
});

/** Tono (0-360°) de un «rgb(r, g, b)». */
function tonoDe(rgb: string): number {
  const m = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (!m) return NaN;
  const [r, g, b] = [Number(m[1]) / 255, Number(m[2]) / 255, Number(m[3]) / 255];
  const max = Math.max(r, g, b);
  const d = max - Math.min(r, g, b);
  if (d === 0) return 0;
  const h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return (h * 60 + 360) % 360;
}

/** El nombre que corresponde a un tono, con bandas anchas y los controles lejos de sus bordes. */
function nombreDelTono(h: number): string {
  if (h >= 250 && h < 330) return 'violeta';
  if (h >= 170 && h < 250) return 'azul';
  if (h >= 80 && h < 170) return 'verde';
  if (h >= 48 && h < 80) return 'amarillo';
  if (h >= 15 && h < 48) return 'naranja';
  return 'rojo';
}

/** El color de la muestra (atributo style: globals anima el fondo 0,3 s) y el nombre rotulado. */
async function muestraDeColor(page: Page, lambda: number): Promise<{ rgb: string; nombre: string }> {
  await sembrarValor(page, '#slider-lambda', lambda);
  await expect(page.locator('label[for="slider-lambda"]')).toContainText(`${lambda} nm`);
  const muestra = page.locator('[class*="muestraColor"]');
  const estilo = (await muestra.getAttribute('style')) ?? '';
  const rotulo = (await muestra.locator('xpath=following-sibling::span[1]').innerText()).trim();
  return { rgb: estilo.replace(/^background:\s*/, '').replace(/;$/, ''), nombre: rotulo.split(' · ')[1] ?? '' };
}

// ─────────────────────────────────────────────────────────────────────────────
test('Caso 12 — en el centro de cada nombre, la muestra de color y el rótulo coinciden', async ({ page }) => {
  const controles: ReadonlyArray<readonly [number, string, string]> = [
    [400, 'rgb(131, 0, 181)', 'violeta'],
    [470, 'rgb(0, 169, 255)', 'azul'],
    [530, 'rgb(94, 255, 0)', 'verde'],
    [575, 'rgb(240, 255, 0)', 'amarillo'],
    [650, 'rgb(255, 0, 0)', 'rojo'],
  ];
  for (const [lambda, rgb, nombre] of controles) {
    const m = await muestraDeColor(page, lambda);
    expect(m.rgb, `${lambda} nm`).toBe(rgb);
    expect(m.nombre, `${lambda} nm`).toBe(nombre);
    expect(nombreDelTono(tonoDe(m.rgb)), `${lambda} nm: tono ${tonoDe(m.rgb)}°`).toBe(nombre);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
test.fail('HALLAZGO (19/11/2026, ABIERTO) · en tres fronteras la muestra dice un color y el rótulo otro', async ({ page }) => {
  // 445 nm: rgb(0, 40, 255), tono 231° (azul), rotulado «violeta» (pasa de 434 a 449 nm).
  // 590 nm: rgb(255, 223, 0), tono 52° (amarillo), rotulado «naranja» (de 590 a 597 nm).
  // 620 nm: rgb(255, 119, 0), tono 28° (naranja), rotulado «rojo» (de 620 a 633 nm).
  // color.ts pinta con Bruton (azul puro en 440, rojo puro desde 645) y nombra con otra tabla
  // (violeta < 450, rojo ≥ 620). La reparación mueve una de las dos; este caso mide que casen.
  for (const lambda of [445, 590, 620]) {
    const m = await muestraDeColor(page, lambda);
    expect(m.nombre, `${lambda} nm: ${m.rgb}, tono ${Math.round(tonoDe(m.rgb))}°`).toBe(nombreDelTono(tonoDe(m.rgb)));
  }
});

// ─────────────────────────────────────────────────────────────────────────────
test.fail('HALLAZGO (19/11/2026, ABIERTO) · la pregunta de la intensidad está en las dos FAQ con dos respuestas', async ({ page }) => {
  // FAQPage: «¿Por qué aumentar la intensidad de la luz no aumenta la energía de los electrones?»
  // FAQ visible: «¿Por qué más intensidad no da electrones más rápidos?». La misma pregunta, escrita
  // dos veces con respuestas distintas; la del FAQPage añade el caso por debajo del umbral. Una
  // sola constante para las dos (PREGUNTAS_FRECUENTES, §1.ter) deja este caso en verde.
  const delFaqPage = await page.evaluate(() => {
    for (const s of Array.from(document.querySelectorAll('script[type="application/ld+json"]'))) {
      const j = JSON.parse(s.textContent ?? '{}') as {
        '@type'?: string;
        mainEntity?: { name: string; acceptedAnswer: { text: string } }[];
      };
      if (j['@type'] === 'FAQPage' && j.mainEntity) {
        return j.mainEntity.map((q) => ({ p: q.name.trim(), r: q.acceptedAnswer.text.replace(/\s+/g, ' ').trim() }));
      }
    }
    return [];
  });
  const visibles = await page.evaluate(() =>
    Array.from(document.querySelectorAll('[class*="faqItem"]')).map((it) => ({
      p: (it.querySelector('strong')?.textContent ?? '').trim(),
      r: (it.querySelector('p')?.textContent ?? '').replace(/\s+/g, ' ').trim(),
    })),
  );
  expect(delFaqPage.length).toBeGreaterThan(0);
  expect(visibles.length).toBeGreaterThan(0);
  const a = delFaqPage.filter((q) => /intensidad/i.test(q.p));
  const b = visibles.filter((q) => /intensidad/i.test(q.p));
  if (a.length > 0 && b.length > 0) {
    expect(b[0].p).toBe(a[0].p);
    expect(b[0].r).toBe(a[0].r);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
test.fail('HALLAZGO (19/11/2026, ABIERTO) · h·c sale como «1239,84» y «1240» y también como «1.239,84» y «1.240»', async ({ page }) => {
  // CLAUDE.md global §2 (Ortografía de la RAE, 2010): con cuatro cifras enteras no se agrupa.
  // La caja de fórmulas (formatNumber) escribe «1239,84 eV·nm» y los casos «1240 eV·nm», pero la
  // guía paso a paso y el FAQPage escriben «1.239,84», los consejos y los errores típicos
  // «1.240 eV·nm» y la tarjeta de paneles solares «~1.100 nm».
  await expect(page.locator('[class*="formulaBox"]')).toContainText('h·c = 1239,84 eV·nm');
  const cuatroAgrupadas = /(?<![\d.,])\d\.\d{3}(?:,\d+)?(?![\d.])/g;
  // El texto de la app: <main> sin scripts ni las tarjetas de otras apps (RelatedApps).
  const texto = await page.evaluate(() => {
    const copia = document.querySelector('main')?.cloneNode(true) as HTMLElement | undefined;
    if (!copia) return '';
    copia.querySelectorAll('script, section[aria-label="Aplicaciones relacionadas"]').forEach((n) => n.remove());
    return copia.textContent ?? '';
  });
  const ld = await page.evaluate(() =>
    Array.from(document.querySelectorAll('script[type="application/ld+json"]'))
      .map((s) => s.textContent ?? '')
      .join(' '),
  );
  expect([...texto.matchAll(cuatroAgrupadas)].map((m) => m[0])).toEqual([]);
  expect([...ld.matchAll(cuatroAgrupadas)].map((m) => m[0])).toEqual([]);
});

// ─────────────────────────────────────────────────────────────────────────────
test('HALLAZGO 5276 (19/11/2026, REPARADO) · «Otro φ» por debajo de 0,5 se reescribe al salir como «0,5», con coma', async ({ page }) => {
  // REPARADO (20/11/2026, C0850): NumberInput acotaba al salir con `min.toString()` y el campo
  // pasaba de «0,2» a «0.5», en formato inglés. Ahora escribe el límite con coma decimal.
  await page.getByRole('button', { name: /^Otro φ/ }).click();
  const entradaPhi = page.getByLabel('Función de trabajo φ (eV)');
  await entradaPhi.fill('0,2');
  await esperarValorEnReact(page, entradaPhi, '0,2');
  await expect(valorTarjeta(page, 'Función de trabajo')).toHaveText('0,20 eV');
  await page.locator('#slider-intensidad').focus();
  await expect(valorTarjeta(page, 'Función de trabajo')).toHaveText('0,50 eV');
  await expect(entradaPhi).toHaveValue('0,5');
});

/* ═══════════════════════════════════════════════════════════════════════════════════════════
 * CASOS PARA CLASE (skill /casos-aula-meskeia, 06/10/2026) — `casos.ts` sin navegador
 *
 * El convenio que hay que vigilar son las CONSTANTES: la app usa CODATA 2022 (h·c = 1.239,84
 * eV·nm) y en clase se usa h·c = 1240 eV·nm, h = 6,63·10⁻³⁴ J·s, e = 1,60·10⁻¹⁹ C y
 * mₑ = 9,11·10⁻³¹ kg. Cada enunciado declara las suyas, y aquí cada caso se recalcula con las
 * DOS tandas, con fórmulas escritas en este test (no las de casos.ts ni las del motor): las dos
 * tienen que redondear a la clave.
 *    1 · E = 1240/310 = 4,00 eV (CODATA 3,9995)                  · λ/hc: 0,25
 *    2 · f₀ = 4,14·1,6·10⁻¹⁹/6,63·10⁻³⁴ = 0,9991·10¹⁵ → 1,00     · (CODATA 1,0010)
 *    3 · λ₀ = 1240/2,46 = 504,07 → 504 nm (CODATA 504,00)        · con hc = 1243,1: 505
 *    4 · E_c = 1240/248 − 4,08 = 0,92 eV                         · sumar φ: 9,08 · E del fotón: 5
 *    5 · E_c = (8,00 − 6,35)·1,6 = 2,64·10⁻¹⁹ J                  · en eV: 1,65
 *    6 · V₀ = 6,20 − 4,14 = 2,06 V                               · E del fotón: 6,20
 *    7 · E_c = 1,5 eV = 2,4·10⁻¹⁹ J; v = √(2·2,4·10⁻¹⁹/9,11·10⁻³¹) = 7,26·10⁵ m/s · sin el 2: 5,13
 *    8 · 400 nm: 3,10 eV < 4,31 → faltan 1,21 eV                 · E − φ con signo: −1,21
 *    9 · duplicar la intensidad no cambia E_c = 3,10 − 2,46 = 0,64 eV · duplicarla: 1,28
 *   10 · 650 nm: 1,91 < 2,20 no arranca; 400 nm: 3,10 − 2,20 = 0,90 · con la roja: −0,29
 *   11 · φ = 5,00 − 0,50 = 4,50 eV (el hierro)                   · E + V₀: 5,50
 *   12 · λ = 1240/(4,31 + 0,69) = 248 nm                         · sin φ: 1797
 * ═══════════════════════════════════════════════════════════════════════════════════════════ */

const A_MANO_AULA: Record<number, number> = {
  1: 4,
  2: 1,
  3: 504,
  4: 0.92,
  5: 2.64,
  6: 2.06,
  7: 7.26,
  8: 1.21,
  9: 0.64,
  10: 0.9,
  11: 4.5,
  12: 248,
};

interface Constantes {
  hc: number; // eV·nm
  h: number; // J·s
  e: number; // C
  me: number; // kg
}
const LIBRO: Constantes = { hc: 1240, h: 6.63e-34, e: 1.6e-19, me: 9.11e-31 };
const H_CODATA = 6.62607015e-34;
const E_CODATA = 1.602176634e-19;
const CODATA: Constantes = {
  hc: ((H_CODATA * 299_792_458) / E_CODATA) * 1e9,
  h: H_CODATA,
  e: E_CODATA,
  me: 9.1093837139e-31, // CODATA 2022 (NIST Value?me); hasta el 13/11/2026, la de 2018 (cabo C0726)
};

/** Cada caso, escrito desde la definición para unas constantes cualesquiera. */
const POR_CASO: Record<number, (k: Constantes) => number> = {
  1: (k) => k.hc / 310,
  2: (k) => (4.14 * k.e) / k.h / 1e15,
  3: (k) => k.hc / 2.46,
  4: (k) => k.hc / 248 - 4.08,
  5: (k) => ((k.hc / 155 - 6.35) * k.e) / 1e-19,
  6: (k) => k.hc / 200 - 4.14,
  7: (k) => Math.sqrt((2 * (k.hc / 200 - 4.7) * k.e) / k.me) / 1e5,
  8: (k) => 4.31 - k.hc / 400,
  9: (k) => k.hc / 400 - 2.46,
  10: (k) => k.hc / 400 - 2.2,
  11: (k) => k.hc / 248 - 0.5,
  12: (k) => k.hc / (4.31 + 0.69),
};

const redondeoAula = (v: number, d: number) => Math.round(v * 10 ** d) / 10 ** d;

function casoAula(id: number) {
  const caso = CASOS.find((c) => c.id === id);
  if (!caso) throw new Error(`No existe el caso ${id}`);
  return caso;
}

/** Cuántos decimales lleva el número que se ENSEÑA en la solución («0,92 eV» → 2). */
function decimalesMostradosAula(texto: string): number {
  const m = texto.match(/[-−]?\d[\d.]*(?:,(\d+))?/);
  return m?.[1]?.length ?? 0;
}

test.describe('simulador-efecto-fotoelectrico · casos para clase', () => {
  test('1 · hay 12 casos con ids 1..12 sin huecos', async () => {
    expect(TOTAL_CASOS).toBe(12);
    expect(CASOS.map((c) => c.id)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  });

  test('2 · son deterministas: dos lecturas dan lo mismo', async () => {
    for (const caso of CASOS) {
      const a = resolverCaso(caso.datos);
      const b = resolverCaso(caso.datos);
      expect(a.ok, `caso ${caso.id}: ${a.error ?? ''}`).toBe(true);
      expect(b.valor).toBe(a.valor);
      expect(b.pasos).toEqual(a.pasos);
    }
  });

  test('3 · la respuesta declarada coincide con recalcularla desde `datos`', async () => {
    for (const caso of CASOS) {
      const r = resolverCaso(caso.datos);
      expect(r.ok, `caso ${caso.id}: ${r.error ?? ''}`).toBe(true);
      expect(redondeoAula(r.valor, caso.datos.decimales ?? 2), `caso ${caso.id}`).toBe(caso.respuesta);
    }
  });

  test('4 · cada caso tiene enunciado, etiqueta, respuesta finita y desarrollo', async () => {
    for (const caso of CASOS) {
      expect(caso.enunciado.length, `caso ${caso.id}`).toBeGreaterThan(40);
      expect(caso.etiquetaRespuesta.trim(), `caso ${caso.id}`).not.toBe('');
      expect(Number.isFinite(caso.respuesta), `caso ${caso.id}`).toBe(true);
      expect(caso.pasos.length, `caso ${caso.id}`).toBeGreaterThanOrEqual(2);
      expect(caso.pista.trim(), `caso ${caso.id}`).not.toBe('');
    }
    expect(new Set(CASOS.map((c) => c.categoria))).toEqual(new Set(['abstracto', 'aplicado']));
  });

  test('5 · ningún enunciado nombra un país, una ciudad ni una moneda', async () => {
    const PROHIBIDO =
      /\b(España|Espana|México|Mexico|Colombia|Argentina|Perú|Peru|Chile|Uruguay|Ecuador|Madrid|Barcelona|Bogotá|Lima|euros?|dólares?|pesos (mexicanos|colombianos|chilenos|argentinos)|Bachillerato|selectividad)\b/i;
    const SIGLA_ESO = /\bESO\b/;
    for (const caso of CASOS) {
      const texto = `${caso.titulo} ${caso.enunciado}`;
      expect(PROHIBIDO.test(texto) || SIGLA_ESO.test(texto), `caso ${caso.id}`).toBe(false);
    }
  });

  test('5.bis · lo que el enunciado PIDE coincide con lo que la solución MUESTRA', async () => {
    for (const caso of CASOS) {
      const decimales = caso.datos.decimales ?? 2;
      expect(decimalesMostradosAula(caso.respuestaTexto), `caso ${caso.id}`).toBeLessThanOrEqual(decimales);
      const ultimo = caso.pasos[caso.pasos.length - 1];
      expect(ultimo, `caso ${caso.id}: el último paso enseña la cifra de la casilla`).toContain(caso.respuestaTexto);
      const exacto = Math.abs(resolverCaso(caso.datos).valor - caso.respuesta) < 1e-9;
      expect(caso.requiereRedondeo, `caso ${caso.id}`).toBe(!exacto);
      if (!exacto) {
        expect(caso.enunciado, `caso ${caso.id}: se redondea y el enunciado no lo pide`).toMatch(/redonde|decimal|unidades|décima/i);
      }
    }
  });

  test('6 · el generador aleatorio es reproducible, variado, usa la misma aritmética y el convenio', async () => {
    const a = generarEjercicioAleatorio(12345);
    const b = generarEjercicioAleatorio(12345);
    expect(b.enunciado).toBe(a.enunciado);
    expect(b.respuesta).toBe(a.respuesta);

    const muestras = Array.from({ length: 40 }, (_, i) => generarEjercicioAleatorio(i + 1));
    expect(new Set(muestras.map((m) => m.respuesta)).size).toBeGreaterThanOrEqual(3);
    expect(new Set(muestras.map((m) => m.datos.magnitud)).size).toBeGreaterThanOrEqual(3);
    for (const m of muestras) {
      expect(Number.isFinite(m.respuesta)).toBe(true);
      const d = m.datos.decimales ?? 2;
      expect(redondeoAula(resolverCaso(m.datos).valor, d)).toBe(m.respuesta);
      // Con h·c = 1240 (lo que declara el enunciado) sale la misma cifra redondeada.
      const phi = m.datos.metal ? METALES.find((x) => x.id === m.datos.metal)?.phi : m.datos.phi;
      expect(phi, m.enunciado).toBeDefined();
      const lambda = m.datos.lambda ?? NaN;
      const libro =
        m.datos.magnitud === 'energiaFoton'
          ? LIBRO.hc / lambda
          : m.datos.magnitud === 'longitudUmbral'
            ? LIBRO.hc / phi!
            : LIBRO.hc / lambda - phi!;
      expect(redondeoAula(libro, d), `${m.datos.magnitud}: ${m.enunciado}`).toBe(m.respuesta);
      expect(m.enunciado).toMatch(/1240 eV·nm/);
    }
  });

  test('7 · el convenio queda fijado: claves a mano y constantes de libro = CODATA tras redondear', async () => {
    // (a) Las doce respuestas, contra la tabla resuelta a mano de la cabecera de este bloque.
    for (const caso of CASOS) {
      expect(caso.respuesta, `caso ${caso.id} · ${caso.titulo}`).toBe(A_MANO_AULA[caso.id]);
    }

    // (b) Con las constantes de libro y con CODATA, la misma cifra redondeada; y el enunciado
    // declara las de libro que usa.
    for (const caso of CASOS) {
      const d = caso.datos.decimales ?? 2;
      const f = POR_CASO[caso.id];
      expect(redondeoAula(f(CODATA), d), `caso ${caso.id} con CODATA`).toBe(caso.respuesta);
      expect(redondeoAula(f(LIBRO), d), `caso ${caso.id} con constantes de libro`).toBe(caso.respuesta);
      if (caso.id === 2) {
        expect(caso.enunciado).toMatch(/h = 6,63 × 10⁻³⁴ J·s/);
      } else {
        expect(caso.enunciado, `caso ${caso.id}`).toMatch(/h·c = 1240 eV·nm/);
      }
    }

    // (c) El caso 10 es de verdad «solo una de las dos»: la roja no llega a φ con ninguna tanda.
    // Y es roja sin discusión: desde 625 nm lo es en cualquier tabla (la vista dice «rojo» desde
    // 620, que es justo su frontera con el naranja; el caso usaba 620 hasta la revisión).
    const roja = casoAula(10).datos.lambdaComparada ?? NaN;
    expect(roja).toBeGreaterThanOrEqual(625);
    expect(casoAula(10).enunciado).toContain(`luz roja de ${roja} nm`);
    expect(LIBRO.hc / roja).toBeLessThan(2.2);
    expect(CODATA.hc / roja).toBeLessThan(2.2);

    // (d) La intensidad no entra en E_c: el caso 9 sin duplicar da la misma cifra.
    const caso9 = casoAula(9);
    expect(resolverCaso({ ...caso9.datos, factorIntensidad: 1 }).valor).toBe(resolverCaso(caso9.datos).valor);

    // (e) La φ de un metal nombrado es la de la MISMA lista que los botones.
    for (const caso of CASOS) {
      if (!caso.datos.metal) continue;
      const metal = METALES.find((m) => m.id === caso.datos.metal);
      expect(metal, `caso ${caso.id}: metal ${caso.datos.metal}`).toBeDefined();
      const phi = new Intl.NumberFormat('es-ES', { minimumFractionDigits: 2 }).format(metal!.phi);
      expect(caso.enunciado, `caso ${caso.id}`).toContain(`φ = ${phi} eV`);
    }
  });

  test('8 · corregir no lanza nunca, ni con entradas que no son números', async () => {
    const r = comprobarRespuesta(NaN, 0.92, casoAula(4).datos);
    expect(r.correcto).toBe(false);
    expect(r.motivo).not.toMatch(/NaN/);
    const borde = r.tolerancia;
    expect(borde).toBeCloseTo(0.005, 12);
    expect(comprobarRespuesta(0.92 + borde, 0.92, casoAula(4).datos).correcto).toBe(true);
    expect(comprobarRespuesta(0.92 - borde, 0.92, casoAula(4).datos).correcto).toBe(true);
  });

  test('9 · el corrector separa el redondeo del error de concepto', async () => {
    const tabla: ReadonlyArray<readonly [number, number, boolean, string]> = [
      [1, 4, true, 'la clave'],
      [1, 3.9995, true, 'la cifra con CODATA'],
      [1, 4.01, false, 'h·c = 1243,1 en vez del 1240 que se declara'],
      [1, 0.25, false, 'λ/hc'],
      [2, 1, true, 'la clave'],
      [2, 1.001, true, 'la cifra del panel'],
      [2, 0.99, false, 'vecino'],
      [3, 504, true, 'la clave'],
      [3, 505, false, 'h·c = 1243,1'],
      [4, 0.92, true, 'la clave'],
      [4, 9.08, false, 'sumar φ'],
      [4, 5, false, 'la E del fotón como E_c'],
      [4, -0.92, false, 'φ − E'],
      [5, 2.64, true, 'la clave'],
      [5, 1.65, false, 'en eV'],
      [6, 2.06, true, 'la clave'],
      [6, 6.2, false, 'la E del fotón'],
      [7, 7.26, true, 'la clave'],
      [7, 7.259, true, 'con constantes de libro, sin redondear'],
      [7, 5.13, false, 'sin el 2'],
      [8, 1.21, true, 'la clave'],
      [8, -1.21, false, 'E − φ con signo'],
      [8, 3.1, false, 'la E del fotón'],
      [9, 0.64, true, 'la clave'],
      [9, 1.28, false, 'duplicar E_c con la intensidad'],
      [9, 0.32, false, 'la mitad'],
      [10, 0.9, true, 'la clave'],
      [10, -0.29, false, 'con la luz roja: 1240/650 − 2,20'],
      [10, 1.19, false, 'la diferencia de energías de las dos luces: 3,10 − 1,91'],
      [11, 4.5, true, 'la clave'],
      [11, 5.5, false, 'E + V₀'],
      [11, 0.5, false, 'el potencial de frenado'],
      [12, 248, true, 'la clave'],
      [12, 1797, false, 'sin φ'],
      [12, 343, false, 'restar φ'],
    ];
    const mal: string[] = [];
    for (const [id, r, entra, porque] of tabla) {
      const caso = casoAula(id);
      const v = comprobarRespuesta(r, caso.respuesta, caso.datos).correcto;
      if (v !== entra) mal.push(`caso ${id}: ${r} (${porque}) ${entra ? 'no entra' : 'entra'}`);
    }
    expect(mal).toEqual([]);
  });
});

/** Teclea una respuesta en el caso `id` y devuelve si el corrector la dio por buena. */
async function corregirAula(page: Page, id: number, respuesta: string): Promise<boolean> {
  await page.locator('#casos-aula').getByRole('button', { name: new RegExp(`^Caso ${id}:`) }).click();
  await expect(page.locator('#casos-titulo-caso')).toHaveText(new RegExp(`^Caso ${id} ·`));
  await page.locator('#casos-respuesta').fill(respuesta);
  await page.locator('#casos-comprobar').click();
  // Por su id y no por getByRole('alert'), que casa también con el anunciador de rutas de Next.
  const veredicto = page.locator('#casos-veredicto');
  await expect(veredicto).toBeVisible();
  return (await veredicto.innerText()).includes('¡Correcto!');
}

test.describe('simulador-efecto-fotoelectrico · la sección de casos en el navegador', () => {
  test.beforeEach(async ({ page }) => {
    await esperarHidratacion(page, ['#casos-respuesta']);
  });

  test('el caso 9 se corrige con la cifra de la solución', async ({ page }) => {
    expect(await corregirAula(page, 9, '0,64')).toBe(true);
  });

  test('la energía del fotón en el caso 4 se rechaza y la solución enseña 0,92 eV', async ({ page }) => {
    expect(await corregirAula(page, 4, '5,00')).toBe(false);
    const solucion = page.locator('#casos-aula').getByRole('button', { name: /Ver solución/ });
    await expect(solucion).toHaveAttribute('aria-expanded', 'false');
    await solucion.click();
    await expect(page.locator('#casos-resultado')).toContainText('0,92 eV');
  });

  test('el punto decimal de «7.262» y «247.968» se lee como decimal y «4.01» (h·c = 1243,1) se rechaza (19/11/2026)', async ({ page }) => {
    // Caso 7: v = 7,262 × 10⁵ m/s con CODATA, la clave 7,26 ± 0,005 → «7.262» es 7,262, no 7262.
    expect(await corregirAula(page, 7, '7.262')).toBe(true);
    // Caso 12: λ = 1.239,8419843/5,00 = 247,968 nm, la clave 248 ± 0,5 → «247.968» es 247,968.
    expect(await corregirAula(page, 12, '247.968')).toBe(true);
    expect(await corregirAula(page, 12, '249')).toBe(false);
    // Caso 1: 4,01 eV es la cuenta con h·c = 1243,1, que el enunciado descarta al fijar 1240.
    expect(await corregirAula(page, 1, '4.01')).toBe(false);
    expect(await corregirAula(page, 1, '3,999')).toBe(true);
    // Caso 8: lo que le falta al fotón es positivo; «−1,21» es E − φ con signo.
    expect(await corregirAula(page, 8, '-1,21')).toBe(false);
  });

  test('la sección no añade electrones, deslizadores ni tarjetas al acta', async ({ page }) => {
    const seccion = page.locator('#casos-aula');
    await expect(seccion.locator('svg, input[type="range"], [class*="valueCard"]')).toHaveCount(0);
  });
});
