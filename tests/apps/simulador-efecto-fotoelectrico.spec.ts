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
import { METALES } from '../../app/simulador-efecto-fotoelectrico/motor';

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

/* ═══════════════════════════════════════════════════════════════════════════════════════════
 * CASOS PARA CLASE (skill /casos-aula-meskeia, 06/10/2026) — `casos.ts` sin navegador
 *
 * El convenio que hay que vigilar son las CONSTANTES: la app usa CODATA 2018 (h·c = 1.239,84
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
 *   10 · 620 nm: 2,00 < 2,20 no arranca; 400 nm: 3,10 − 2,20 = 0,90 · con la roja: −0,20
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
  me: 9.1093837015e-31,
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
    expect(LIBRO.hc / 620).toBeLessThan(2.2);
    expect(CODATA.hc / 620).toBeLessThan(2.2);

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
      [10, -0.2, false, 'con la luz roja'],
      [10, 1.1, false, 'la diferencia de energías de las dos luces'],
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

  test('la sección no añade electrones, deslizadores ni tarjetas al acta', async ({ page }) => {
    const seccion = page.locator('#casos-aula');
    await expect(seccion.locator('svg, input[type="range"], [class*="valueCard"]')).toHaveCount(0);
  });
});
