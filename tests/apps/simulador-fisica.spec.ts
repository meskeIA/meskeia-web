import { test, expect, Page } from '@playwright/test';
import { esperarHidratacion, sembrarValor, sembrarValorAcotado } from './_hidratacion';

/**
 * Inspector — simulador-fisica (segmento INTERACTIVA/MOTOR, RIESGO 3)
 * Inspeccionada el 21/09/2026 · REPARADA el mismo día (hallazgos 1109-1114).
 *
 * Qué promete la app
 * ──────────────────
 *   <h1>  «🔬 Simulador de Física»
 *   sub.  «Experimenta con física en tiempo real: caída libre, péndulos, proyectiles,
 *          ondas y resortes»
 *   meta. «Simulador interactivo de física con animaciones en tiempo real. Experimenta
 *          con caída libre, péndulo simple, tiro parabólico, ondas y movimiento
 *          armónico simple.»
 *   Y en el bloque educativo se compromete además con una fórmula por fenómeno:
 *   y = ½gt² · T = 2π√(L/g) · x = v₀cos(α)t · v = λf · T = 2π√(m/k), todas con
 *   g = 9,81 m/s² declarada TRES veces en pantalla (descripción, tabla y FAQ).
 *
 * Por qué estos casos van sobre el TIRO PARABÓLICO
 * ───────────────────────────────────────────────
 * Los otros cuatro simuladores solo publican cifras mientras la animación corre, así que
 * lo que se leería depende del reloj de pared y del número de fotogramas. El proyectil
 * publica los tres valores TEÓRICOS (altura máxima, alcance y tiempo de vuelo) en cuanto
 * se mueve un parámetro, sin pulsar ▶️: es la única lectura determinista de la app y la
 * que un alumno compara con su hoja de papel, que es justo el uso que la app propone
 * («Verifica cálculos de examen»).
 *
 * De dónde sale cada cifra esperada — g = 9,81 m/s², la que declara la app
 * ───────────────────────────────────────────────────────────────────────
 *   tiempo de vuelo  t = 2·v₀·sen θ / g          (altura inicial 0)
 *   alcance          R = v₀²·sen(2θ) / g
 *   altura máxima    H = v₀²·sen²θ / (2g)
 *
 *   CASO 1 (normal) — v₀ = 20 m/s · θ = 45° · h₀ = 0
 *       t = 2·20·0,70710678 / 9,81 = 28,2842712 / 9,81 = 2,88322 s  → «2,88 s»
 *       R = 400·sen 90° / 9,81     = 400 / 9,81      = 40,77472 m   → «40,8 m»
 *       H = 400·0,5 / 19,62        = 200 / 19,62     = 10,19368 m   → «10,2 m»
 *
 *   CASO 2 (límite) — se pide θ = 90° (tiro vertical) sobre un deslizador acotado a
 *       [5°, 85°]: el control DEBE recortar a 85° y la app recalcular en esa rama casi
 *       vertical, donde el alcance se desploma pese a mantener la misma velocidad.
 *       θ = 85° · v₀ = 20 m/s
 *       t = 2·20·0,99619470 / 9,81 = 39,8477878 / 9,81 = 4,06196 s  → «4,06 s»
 *       R = 400·sen 170° / 9,81    = 69,4592711 / 9,81 =  7,08046 m → «7,1 m»
 *       H = 400·0,99240388 / 19,62 = 396,96155 / 19,62 = 20,23249 m → «20,2 m»
 *
 *   CASO 3 (rechazo) — se pide v₀ = −20 m/s, que no tiene sentido físico en este
 *       modelo. El deslizador está acotado a [5, 100] m/s y debe recortar a 5 m/s sin
 *       dejar NaN, ni un alcance negativo, ni un tiempo de vuelo negativo.
 *       θ = 45° · v₀ = 5 m/s
 *       t = 2·5·0,70710678 / 9,81 = 7,0710678 / 9,81 = 0,72080 s    → «0,72 s»
 *       R = 25·sen 90° / 9,81     = 25 / 9,81        = 2,54842 m    → «2,5 m»
 *       H = 25·0,5 / 19,62        = 12,5 / 19,62     = 0,63711 m    → «0,6 m»
 *
 * Por qué cada tolerancia
 * ───────────────────────
 * La pantalla redondea el tiempo a 2 decimales y las distancias a 1, así que una lectura
 * correcta cae EXACTAMENTE en el valor escrito y el margen solo cubre ese redondeo:
 *   · tiempo de vuelo con precisión 2 (±0,005 s) — es el testigo de g. Con g = 9,8 en vez
 *     de 9,81 el caso 1 daría 2,886 → «2,89» y este `expect` lo vería; el alcance NO, que
 *     con 9,8 sale 40,82 y se redondea al mismo «40,8».
 *   · alcance y altura máxima con precisión 1 (±0,05 m) — el cuanto de la pantalla es 0,1,
 *     de modo que cualquier desviación real de una décima rompe el test.
 * El caso 2 aporta además el testigo de sen↔cos: a 85° el alcance es simétrico en el
 * intercambio (R = v₀cosθ · 2v₀senθ/g) y no lo detectaría, pero la altura máxima pasaría
 * de 20,2 m a 0,2 m.
 */

const RUTA = '/simulador-fisica/';

/** Los deslizadores del panel del Proyectil, en el orden en que los monta el componente. */
const VELOCIDAD_INICIAL = 0;
const ANGULO = 1;

const deslizador = (page: Page, indice: number) =>
  page.locator('input[type="range"]').nth(indice);

/** El valor de una tarjeta del marcador: «Alcance» → 40,8 (la unidad va en un span anidado). */
async function leerMarcador(page: Page, etiqueta: string): Promise<number> {
  const texto = await page.locator(`span:text-is("${etiqueta}") + span`).innerText();
  const cifra = texto.replace(/[^\d,-]/g, '').replace(',', '.');
  return Number(cifra);
}

/** El valor que el panel de parámetros enseña junto a su etiqueta: «20 m/s». */
const valorDeControl = (page: Page, etiqueta: string) =>
  page.locator(`label:has-text("${etiqueta}") span`);

async function abrirProyectil(page: Page): Promise<void> {
  await page.goto(RUTA);
  // Los deslizadores de la Caída Libre (el simulador por defecto) sirven de testigo de que
  // React ya ha montado: sin esto, el clic en la pestaña se perdería.
  await esperarHidratacion(page, ['input[type="range"]']);
  await page.getByRole('button', { name: /Proyectil/ }).click();
  await expect(page.getByRole('heading', { name: /Proyectil/, level: 2 })).toBeVisible();
}

test.describe('simulador-fisica · tiro parabólico', () => {
  test('caso normal: v₀ = 20 m/s a 45° da 40,8 m de alcance, 10,2 m de altura y 2,88 s de vuelo', async ({ page }) => {
    await abrirProyectil(page);

    // El ángulo ya vale 45° por defecto: sembrarlo no probaría nada, así que solo se mueve
    // la velocidad, que parte de 30 m/s.
    await sembrarValor(page, deslizador(page, VELOCIDAD_INICIAL), 20);
    await expect(valorDeControl(page, 'Velocidad inicial')).toHaveText('20 m/s');
    await expect(valorDeControl(page, 'Ángulo de lanzamiento')).toHaveText('45°');

    // R = v₀²·sen(2θ)/g = 400·sen 90°/9,81 = 40,77472 m
    expect(await leerMarcador(page, 'Alcance')).toBeCloseTo(40.8, 1);
    // H = v₀²·sen²θ/(2g) = 200/19,62 = 10,19368 m
    expect(await leerMarcador(page, 'Altura máx')).toBeCloseTo(10.2, 1);
    // t = 2·v₀·sen θ/g = 28,2842712/9,81 = 2,88322 s — el testigo de que g vale 9,81
    expect(await leerMarcador(page, 'T. vuelo')).toBeCloseTo(2.88, 2);
  });

  test('caso límite: pedir 90° lo recorta a los 85° del deslizador y el alcance se desploma a 7,1 m', async ({ page }) => {
    await abrirProyectil(page);

    await sembrarValor(page, deslizador(page, VELOCIDAD_INICIAL), 20);
    // El deslizador está acotado a [5°, 85°]: pedir el tiro vertical debe quedarse en 85°.
    const aceptado = await sembrarValorAcotado(page, deslizador(page, ANGULO), 90);
    expect(aceptado).toBe('85');
    await expect(valorDeControl(page, 'Ángulo de lanzamiento')).toHaveText('85°');

    // t = 2·20·sen 85°/9,81 = 39,8477878/9,81 = 4,06196 s
    expect(await leerMarcador(page, 'T. vuelo')).toBeCloseTo(4.06, 2);
    // R = 400·sen 170°/9,81 = 69,4592711/9,81 = 7,08046 m — con 20 m/s, casi nueve veces
    // menos alcance que a 45°, que es lo que la app enseña en su bloque educativo.
    expect(await leerMarcador(page, 'Alcance')).toBeCloseTo(7.1, 1);
    // H = 400·sen²85°/19,62 = 396,96155/19,62 = 20,23249 m — el testigo de sen↔cos: si la
    // app intercambiase las componentes, aquí saldrían 0,2 m en vez de 20,2 m.
    expect(await leerMarcador(page, 'Altura máx')).toBeCloseTo(20.2, 1);
  });

  test('caso a rechazar: una velocidad inicial negativa se recorta al mínimo de 5 m/s y no deja NaN', async ({ page }) => {
    await abrirProyectil(page);

    // −20 m/s no tiene sentido en este modelo; el deslizador está acotado a [5, 100] m/s.
    const aceptado = await sembrarValorAcotado(page, deslizador(page, VELOCIDAD_INICIAL), -20);
    expect(aceptado).toBe('5');
    await expect(valorDeControl(page, 'Velocidad inicial')).toHaveText('5 m/s');

    // Con 5 m/s a 45°: R = 25/9,81 = 2,54842 m · H = 12,5/19,62 = 0,63711 m
    // · t = 7,0710678/9,81 = 0,72080 s. Ninguno negativo ni NaN.
    const alcance = await leerMarcador(page, 'Alcance');
    expect(alcance).toBeCloseTo(2.5, 1);
    expect(alcance).toBeGreaterThan(0);
    expect(await leerMarcador(page, 'Altura máx')).toBeCloseTo(0.6, 1);
    expect(await leerMarcador(page, 'T. vuelo')).toBeCloseTo(0.72, 2);

    // Y nada de «NaN» en el marcador, que es donde asomaría un parseo roto.
    const marcador = await page.locator('span:text-is("Alcance")').locator('xpath=../..').innerText();
    expect(marcador).not.toContain('NaN');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Los hallazgos reparados el 21/09/2026
// ─────────────────────────────────────────────────────────────────────────────

test.describe('simulador-fisica · reparaciones del 21/09/2026', () => {
  test('hallazgo 1109 · en PAUSA, período y velocidad siguen a los deslizadores', async ({ page }) => {
    test.setTimeout(90_000);
    await page.goto(RUTA);
    await esperarHidratacion(page, ['input[type="range"]']);
    await page.getByRole('button', { name: /Ondas/ }).click();
    await expect(page.getByRole('heading', { name: /Ondas/, level: 2 })).toBeVisible();

    // La página nace PAUSADA, que es donde estaba el defecto: el período y la velocidad
    // vivían en estado y solo se reescribían al resetear o mientras la animación corría,
    // así que el marcador quedaba descuadrado consigo mismo —«Frecuencia 2,00 Hz» junto a
    // «Período 1,00 s»— mientras el canvas ya dibujaba la longitud de onda nueva.
    await sembrarValorAcotado(page, page.getByLabel('Frecuencia', { exact: true }), 2);
    await sembrarValorAcotado(page, page.getByLabel('Longitud de onda (λ)'), 400);

    // T = 1/f = 0,50 s  ·  v = λ·f = 400 × 2 = 800 px/s. Antes: 1,00 s y 200 px/s.
    expect(await leerMarcador(page, 'Período')).toBeCloseTo(0.5, 2);
    expect(await leerMarcador(page, 'Velocidad')).toBeCloseTo(800, 0);
    // Y la frecuencia que la tarjeta contigua enseña es la misma que manda en T = 1/f.
    expect(await leerMarcador(page, 'Frecuencia')).toBeCloseTo(2, 2);
  });

  test('hallazgo 1110 · al impactar, tiempo y velocidad se recortan como la posición', async ({ page }) => {
    test.setTimeout(120_000);
    await page.goto(RUTA);
    await esperarHidratacion(page, ['input[type="range"]']);
    // La Caída Libre es el simulador por defecto: altura y masa son los dos primeros.
    await sembrarValorAcotado(page, page.getByLabel('Altura inicial'), 20);
    await sembrarValorAcotado(page, page.getByLabel('Masa del objeto'), 1);

    // Energía ANTES de soltar: m·g·h = 1 × 9,81 × 20 = 196,2 → «196 J».
    const energiaInicial = await leerMarcador(page, 'Energía');
    expect(energiaInicial).toBeCloseTo(196, 0);

    await page.getByRole('button', { name: 'Iniciar simulación', exact: true }).click();

    // t = √(2h/g) = 2,0193 s → «2,02 s» · v = g·t = 19,809 → «19,81 m/s».
    // Antes se recortaba la POSICIÓN pero no el tiempo ni la velocidad del mismo
    // fotograma, así que salían 2,03 s y 19,95 m/s y la energía SUBÍA a 199 J en una
    // simulación que la tabla educativa marca «sin rozamiento → conserva energía».
    await expect
      .poll(async () => leerMarcador(page, 'Tiempo'), { timeout: 30_000 })
      .toBeCloseTo(2.02, 2);
    expect(await leerMarcador(page, 'Velocidad')).toBeCloseTo(19.81, 2);
    // La energía final no puede pasar de la inicial: es el testigo de la conservación.
    expect(await leerMarcador(page, 'Energía')).toBeLessThanOrEqual(energiaInicial);
  });

  test('hallazgos 1111-1113 · los deslizadores tienen nombre, las pestañas estado y los valores formato español', async ({ page }) => {
    test.setTimeout(90_000);
    await page.goto(RUTA);
    await esperarHidratacion(page, ['input[type="range"]']);

    // 1111 · el árbol de accesibilidad daba «slider "100"» y «slider "1"» a secas: con
    // lector de pantalla no había forma de saber qué se estaba cambiando.
    await expect(page.getByLabel('Altura inicial')).toHaveAttribute('type', 'range');
    await expect(page.getByLabel('Masa del objeto')).toHaveAttribute('type', 'range');
    for (const s of await page.locator('input[type="range"]').all()) {
      expect(await s.getAttribute('aria-label'), 'deslizador sin nombre accesible').toBeTruthy();
    }

    // 1112 · las cinco pestañas llevan el estado de la app y solo lo marcaban por color.
    const activa = page.getByRole('button', { name: /Caída Libre/ });
    await expect(activa).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('button', { name: /Péndulo/ })).toHaveAttribute('aria-pressed', 'false');

    // 1113 · formato español: la etiqueta imprimía el número crudo de JavaScript, con
    // PUNTO decimal, a dos centímetros de un marcador que ya escribía «100,0m».
    await sembrarValorAcotado(page, page.getByLabel('Masa del objeto'), 0.5);
    await expect(valorDeControl(page, 'Masa del objeto')).toHaveText('0,5 kg');
    await expect(page.locator('body')).not.toContainText('0.5 kg');
    await expect(page.locator('body')).not.toContainText('2.5m');
  });
});
