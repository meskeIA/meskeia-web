import { test, expect, Page } from '@playwright/test';

/**
 * Inspector — simulador-movimiento-circular (segmento interactiva/física, riesgo 3, 557 usos)
 *
 * Primera inspección: 21/08/2026. El <h1> promete «Simulador de Movimiento Circular» y el
 * subtítulo «Observa en tiempo real cómo se mueve una partícula en trayectoria circular.
 * Ajusta radio, velocidad angular y masa para ver los vectores de velocidad tangencial y
 * aceleración centrípeta». La metadata añade «Cálculo de v, a_c, F_c, T y frecuencia en
 * tiempo real» y un modo MCNU. Hay, por tanto, verdad física comprobable: el build no ve la
 * física mal, así que aquí se comprueban NÚMEROS contra fórmulas resueltas a mano y también
 * la GEOMETRÍA de la animación leyendo los píxeles del canvas.
 *
 * DÓNDE VIVE EL CÁLCULO
 *   app/simulador-movimiento-circular/page.tsx  (no hay motor.ts; todo está en el componente)
 *     · v    = omegaVal * radio                     → v = ω·r
 *     · ac   = omegaVal * omegaVal * radio          → a_c = ω²·r  (equivale a v²/r)
 *     · fc   = masa * ac                            → F_c = m·a_c = m·ω²·r
 *     · T    = omegaVal > 0 ? 2π/omegaVal : Infinity
 *     · freq = omegaVal > 0 ? omegaVal/(2π) : 0     → f = ω/2π = 1/T
 *     · bucle rAF: thetaRef += omegaRef · dt, con dt = min(Δt, 0,05 s)
 *       y en MCNU omegaRef += ALPHA_MCNU · dt con ALPHA_MCNU = 0,5 rad/s²
 *   lib/formatters.ts → formatNumber(n, d) con toLocaleString('es-ES')
 *
 * NOTA DE FORMATO: es-ES (CLDR minimumGroupingDigits = 2) NO agrupa los números de cuatro
 * cifras, así que 2500 se escribe «2500,00» y no «2.500,00». Es la convención española
 * correcta, no un fallo del formateador. Toda la app pasa por formatNumber: no hay ni un
 * toFixed() crudo en page.tsx (verificado por grep), y los rótulos de los sliders salen con
 * coma decimal («2,0 m», «0,5», «0,1 kg»).
 *
 * ─────────────────────────────────────────────────────────────────────────────────────────
 * LOS CASOS, RESUELTOS A MANO ANTES DE ABRIR EL NAVEGADOR
 *
 *   CASO 1 (normal) — r = 2 m · ω = 3 rad/s · m = 1 kg, todos redondos a propósito
 *       v   = ω·r    = 3 · 2         = 6 m/s                       → «6,00»   m/s
 *       a_c = ω²·r   = 9 · 2         = 18 m/s²                     → «18,00»  m/s²
 *         (control cruzado con la otra fórmula: v²/r = 36/2 = 18 ✔ coinciden)
 *       F_c = m·a_c  = 1 · 18        = 18 N                        → «18,00»  N
 *       T   = 2π/ω   = 6,283185307/3 = 2,0943951 s                 → «2,09»   s
 *       f   = ω/(2π) = 3/6,283185307 = 0,4774648 Hz                → «0,477»  Hz
 *         (control: T·f = 2,0943951 · 0,4774648 = 1,000000 ✔ son inversos)
 *
 *   CASO 1.bis (normal, segunda terna) — r = 4 m · ω = 5 rad/s · m = 3 kg
 *       v   = 5 · 4   = 20 m/s                                     → «20,00»  m/s
 *       a_c = 25 · 4  = 100 m/s²   (v²/r = 400/4 = 100 ✔)          → «100,00» m/s²
 *       F_c = 3 · 100 = 300 N                                      → «300,00» N
 *       T   = 2π/5    = 1,2566371 s                                → «1,26»   s
 *       f   = 5/(2π)  = 0,7957747 Hz                               → «0,796»  Hz
 *
 *   CASO 2 (límite) — los dos extremos de los tres sliders
 *       (a) mínimos: r = 0,5 m · ω = 0 rad/s · m = 0,1 kg
 *           v = 0 · 0,5 = 0 · a_c = 0² · 0,5 = 0 · F_c = 0,1 · 0 = 0
 *           T = 2π/0 → no está definido: el período de algo que no gira es infinito.
 *             La app debe escribir «∞», nunca «Infinity» ni «NaN».
 *           f = 0 Hz (cero vueltas por segundo) → «0,000»
 *           Nótese que a_c se calcula como ω²·r y NO como v²/r, así que ni siquiera con el
 *           radio en su mínimo hay división por cero; y el slider no deja bajar de 0,5 m.
 *       (b) máximos: r = 5 m · ω = 10 rad/s · m = 5 kg
 *           v   = 10 · 5  = 50 m/s                                 → «50,00»   m/s
 *           a_c = 100 · 5 = 500 m/s²                               → «500,00»  m/s²
 *           F_c = 5 · 500 = 2500 N                                 → «2500,00» N (sin punto de millar, ver nota)
 *           T   = 2π/10   = 0,6283185 s                            → «0,63»    s
 *           f   = 10/(2π) = 1,5915494 Hz                           → «1,592»   Hz
 *
 *   CASO 3 (rechazo) — magnitudes sin sentido físico: r = −3 m, ω = −5 rad/s, m = −2 kg
 *       Un radio o una masa negativos no existen, y una ω negativa aquí solo sería un
 *       cambio de sentido que el modelo no contempla. Los tres controles son <input
 *       type="range"> con min/max declarados, de modo que el propio navegador satura al
 *       mínimo (0,5 · 0 · 0,1) y nunca llega un número negativo al cálculo. Lo mismo por
 *       arriba con 999 (satura a 5 · 10 · 5) y con texto («abc» revierte al punto medio del
 *       recorrido). En ningún caso debe aparecer NaN, Infinity ni «No definido» en pantalla.
 *
 *   CASO 4 (la animación, que es la mitad de la promesa) — se leen los píxeles del canvas
 *       · la partícula es #2E86AB; el vector v, #48A9A6; el vector a_c, #E07A1F.
 *       · la ω real, medida desenrollando el ángulo de la partícula, debe coincidir con la ω
 *         del panel (MCU). Con r = 3 m y ω = 1,5 rad/s: v ⊥ r (90°) y a_c antiparalela a r
 *         (180°), que es literalmente lo que el bloque educativo afirma.
 *       · el radio dibujado debe ser proporcional a r (radioPx = r/5 · maxPx).
 *
 * ─────────────────────────────────────────────────────────────────────────────────────────
 * HALLAZGOS ABIERTOS QUE ESTE FICHERO **NO** BLOQUEA (el Inspector no repara)
 *   · MCNU: el panel numérico NO se mueve. La animación sí acelera correctamente
 *     (θ(t) = ω₀·t + ½·α·t² con α = 0,5 rad/s²; medido por mínimos cuadrados: α = 0,510),
 *     pero ω, v, a_c, F_c, T y f siguen mostrando los valores derivados de la ω del slider.
 *     Con ω₀ = 2 rad/s, a los 5 s la partícula gira ya a ~4,5 rad/s (a_c real ≈ 40,5 m/s²) y
 *     el panel sigue rotulando «ω = 2,00 rad/s» y «a_c = 8,00 m/s²». Contradice a la propia
 *     tabla de la app, que dice «Aceleración centrípeta: varía porque ω varía».
 *     Ver los expect.soft del CASO 5.
 *   · Los dos botones MCU/MCNU no llevan type="button" (regla de oro del CLAUDE.md).
 *     Sí llevan aria-pressed correcto. Ver el expect.soft del test de accesibilidad.
 *   · Notación: la app rotula la aceleración centrípeta «aₒ» (a subíndice o) en panel,
 *     canvas, fórmula y tabla, mientras su propia metadata y su FAQPage usan «a_c».
 *   · El bullet «hay además aceleración tangencial αt = α · r» escribe αt donde toca a_t
 *     (la tabla de la misma página sí pone «at = α · r»). αt se lee como α·t, que es una
 *     velocidad angular, no una aceleración.
 * ─────────────────────────────────────────────────────────────────────────────────────────
 */

declare global {
  interface Window {
    __sonda: () => {
      centro: { x: number; y: number };
      particula: { x: number; y: number; n: number } | null;
      velocidad: { x: number; y: number; n: number } | null;
      centripeta: { x: number; y: number; n: number } | null;
    };
  }
}

const RUTA = '/simulador-movimiento-circular/';

/** Los tres sliders, en el orden en que están en la página. */
const RADIO = 0;
const OMEGA = 1;
const MASA = 2;

/**
 * Valor numérico de una tarjeta del panel: se busca el <span> cuyo texto es EXACTAMENTE el
 * nombre de la magnitud y se toma su hermano inmediato. El anclaje ^…$ evita colisionar con
 * la leyenda, que también dice «aceleración centrípeta» pero dentro de una frase más larga.
 */
function magnitud(page: Page, nombre: string) {
  return page
    .locator('span')
    .filter({ hasText: new RegExp(`^${nombre}$`) })
    .first()
    .locator('xpath=following-sibling::span[1]');
}

/** Unidad de una tarjeta del panel (el segundo hermano). */
function unidad(page: Page, nombre: string) {
  return page
    .locator('span')
    .filter({ hasText: new RegExp(`^${nombre}$`) })
    .first()
    .locator('xpath=following-sibling::span[2]');
}

/**
 * Mueve un slider. Un <input type="range"> no acepta fill(), y arrastrar con el ratón no da
 * un valor exacto, así que se escribe con el setter nativo y se dispara el evento input que
 * React escucha. El navegador satura solo si el valor cae fuera de [min, max]: eso es
 * justamente lo que el CASO 3 quiere observar.
 */
async function mover(page: Page, indice: number, valor: number | string): Promise<void> {
  await page
    .locator('input[type="range"]')
    .nth(indice)
    .evaluate((el, v) => {
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')!.set!;
      setter.call(el, v);
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    }, String(valor));
}

async function configurar(
  page: Page,
  r: number | string,
  w: number | string,
  m: number | string,
): Promise<void> {
  await mover(page, RADIO, r);
  await mover(page, OMEGA, w);
  await mover(page, MASA, m);
}

/** Valor real que ha quedado en un slider tras la saturación del navegador. */
function valorSlider(page: Page, indice: number): Promise<string> {
  return page.locator('input[type="range"]').nth(indice).inputValue();
}

/**
 * Instrumentación del canvas: localiza por color el centroide de la partícula y de cada uno
 * de los dos vectores, y devuelve además el centro geométrico del lienzo. Es la única forma
 * de comprobar la física de una animación pintada a mano en un <canvas>.
 */
const SONDA_CANVAS = `
window.__sonda = () => {
  const c = document.querySelector('canvas');
  const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
  const colores = { particula: [46, 134, 171], velocidad: [72, 169, 166], centripeta: [224, 122, 31] };
  const salida = { centro: { x: c.width / 2, y: c.height / 2 } };
  for (const clave in colores) {
    const R = colores[clave][0], G = colores[clave][1], B = colores[clave][2];
    let sx = 0, sy = 0, n = 0;
    for (let y = 0; y < c.height; y++) {
      for (let x = 0; x < c.width; x++) {
        const i = (y * c.width + x) * 4;
        if (Math.abs(d[i] - R) < 14 && Math.abs(d[i + 1] - G) < 14 && Math.abs(d[i + 2] - B) < 14) {
          sx += x; sy += y; n++;
        }
      }
    }
    salida[clave] = n ? { x: sx / n, y: sy / n, n: n } : null;
  }
  return salida;
};`;

/** Ángulo entre dos vectores, en grados. */
function anguloEntre(ux: number, uy: number, wx: number, wy: number): number {
  return (Math.acos((ux * wx + uy * wy) / (Math.hypot(ux, uy) * Math.hypot(wx, wy))) * 180) / Math.PI;
}

/** Ángulo de la partícula en el instante actual, con el reloj de la página. */
async function muestraAngulo(page: Page): Promise<{ theta: number; t: number }> {
  return page.evaluate(() => {
    const s = window.__sonda();
    const p = s.particula!;
    return { theta: Math.atan2(-(p.y - s.centro.y), p.x - s.centro.x), t: performance.now() };
  });
}

/** Desenrolla una serie de ángulos y devuelve el barrido acumulado en cada instante. */
function desenrollar(serie: { theta: number; t: number }[]): { t: number; th: number }[] {
  let acumulado = 0;
  const puntos: { t: number; th: number }[] = [];
  for (let k = 1; k < serie.length; k++) {
    let d = serie[k].theta - serie[k - 1].theta;
    while (d > Math.PI) d -= 2 * Math.PI;
    while (d < -Math.PI) d += 2 * Math.PI;
    acumulado += d;
    puntos.push({ t: (serie[k].t - serie[0].t) / 1000, th: acumulado });
  }
  return puntos;
}

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(RUTA);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Simulador de Movimiento Circular');
});

test('la app promete lo que este fichero verifica', async ({ page }) => {
  await expect(page.getByText(/Observa en tiempo real cómo se mueve una partícula/)).toBeVisible();
  await expect(page.getByRole('button', { name: /^MCU — Movimiento Circular Uniforme$/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /^MCNU — No Uniforme \(α = 0,5 rad\/s²\)$/ })).toBeVisible();

  // Las seis magnitudes del panel, que son las que la metadata anuncia calcular.
  for (const nombre of [
    'ω',
    'v tangencial',
    'Aceleración centrípeta',
    'Fuerza centrípeta',
    'Período \\(T\\)',
    'Frecuencia \\(f\\)',
  ]) {
    await expect(magnitud(page, nombre)).toBeVisible();
  }

  // Y la caja de fórmulas del bloque educativo, que son las que se aplican a mano más abajo.
  // Va dentro de <EducationalSection>, que arranca colapsada: hay que desplegarla primero.
  // Se acota al recuadro entero porque «v = ω · r» reaparece suelto en un truco posterior.
  await page.getByRole('button', { name: 'Ver guía educativa' }).click();
  await expect(
    page.getByText(/^MCU:\s*v = ω · r\s*\|\s*aₒ = ω² · r = v²\/r\s*\|\s*T = 2π\/ω$/),
  ).toBeVisible();
});

test('CASO 1 (normal) — r = 2 m, ω = 3 rad/s, m = 1 kg', async ({ page }) => {
  await configurar(page, 2, 3, 1);

  // Los rótulos de los sliders, con coma decimal y unidad (formato español obligatorio).
  await expect(page.getByText('2,0 m', { exact: true })).toBeVisible();
  await expect(page.getByText('3,0 rad/s', { exact: true })).toBeVisible();
  await expect(page.getByText('1,0 kg', { exact: true })).toBeVisible();

  await expect(magnitud(page, 'ω')).toHaveText('3,00'); // la propia entrada
  await expect(magnitud(page, 'v tangencial')).toHaveText('6,00'); // v = ω·r = 3 · 2
  await expect(magnitud(page, 'Aceleración centrípeta')).toHaveText('18,00'); // a_c = ω²·r = 9 · 2 (= v²/r = 36/2)
  await expect(magnitud(page, 'Fuerza centrípeta')).toHaveText('18,00'); // F_c = m·a_c = 1 · 18
  await expect(magnitud(page, 'Período \\(T\\)')).toHaveText('2,09'); // T = 2π/ω = 6,283185/3 = 2,0943951
  await expect(magnitud(page, 'Frecuencia \\(f\\)')).toHaveText('0,477'); // f = ω/2π = 3/6,283185 = 0,4774648

  // Las UNIDADES, que es donde estas apps se equivocan: rad/s no es rpm, y f va en Hz.
  await expect(unidad(page, 'ω')).toHaveText('rad/s');
  await expect(unidad(page, 'v tangencial')).toHaveText('m/s');
  await expect(unidad(page, 'Aceleración centrípeta')).toHaveText('m/s²');
  await expect(unidad(page, 'Fuerza centrípeta')).toHaveText('N');
  await expect(unidad(page, 'Período \\(T\\)')).toHaveText('s');
  await expect(unidad(page, 'Frecuencia \\(f\\)')).toHaveText('Hz');
});

test('CASO 1.bis (normal) — r = 4 m, ω = 5 rad/s, m = 3 kg, y la masa solo entra en F_c', async ({ page }) => {
  await configurar(page, 4, 5, 3);

  await expect(magnitud(page, 'v tangencial')).toHaveText('20,00'); // v = 5 · 4
  await expect(magnitud(page, 'Aceleración centrípeta')).toHaveText('100,00'); // a_c = 25 · 4 (= 400/4)
  await expect(magnitud(page, 'Fuerza centrípeta')).toHaveText('300,00'); // F_c = 3 · 100
  await expect(magnitud(page, 'Período \\(T\\)')).toHaveText('1,26'); // T = 2π/5 = 1,2566371
  await expect(magnitud(page, 'Frecuencia \\(f\\)')).toHaveText('0,796'); // f = 5/2π = 0,7957747

  // La masa NO debe tocar la cinemática: al subirla a 5 kg solo cambia F_c = 5 · 100 = 500 N.
  await mover(page, MASA, 5);
  await expect(magnitud(page, 'Fuerza centrípeta')).toHaveText('500,00');
  await expect(magnitud(page, 'v tangencial')).toHaveText('20,00');
  await expect(magnitud(page, 'Aceleración centrípeta')).toHaveText('100,00');
  await expect(magnitud(page, 'Período \\(T\\)')).toHaveText('1,26');

  // Y a_c debe crecer con el CUADRADO de ω: 5 → 10 rad/s multiplica a_c por 4 (100 → 400),
  // mientras v, que es lineal en ω, solo se dobla (20 → 40). Es el «aₒ crece con ω²» de la app.
  await mover(page, OMEGA, 10); // a_c = 10² · 4 = 400 m/s²
  await expect(magnitud(page, 'Aceleración centrípeta')).toHaveText('400,00');
  await expect(magnitud(page, 'v tangencial')).toHaveText('40,00'); // v = 10 · 4
});

test('CASO 2a (límite) — con ω = 0 el período es infinito y no puede salir NaN', async ({ page }) => {
  await configurar(page, 0.5, 0, 0.1);

  expect(await valorSlider(page, RADIO)).toBe('0.5');
  expect(await valorSlider(page, OMEGA)).toBe('0');
  expect(await valorSlider(page, MASA)).toBe('0.1');

  await expect(magnitud(page, 'ω')).toHaveText('0,00');
  await expect(magnitud(page, 'v tangencial')).toHaveText('0,00'); // v = 0 · 0,5
  await expect(magnitud(page, 'Aceleración centrípeta')).toHaveText('0,00'); // a_c = 0² · 0,5
  await expect(magnitud(page, 'Fuerza centrípeta')).toHaveText('0,00'); // F_c = 0,1 · 0
  await expect(magnitud(page, 'Período \\(T\\)')).toHaveText('∞'); // T = 2π/0: una vuelta que nunca acaba
  await expect(magnitud(page, 'Frecuencia \\(f\\)')).toHaveText('0,000'); // f = 0 vueltas por segundo

  // El símbolo tiene que ser el matemático, no el volcado del motor de JavaScript.
  await expect(page.locator('body')).not.toContainText('Infinity');
  await expect(page.locator('body')).not.toContainText('NaN');
});

test('CASO 2b (límite) — el tope de los tres sliders, con el millar a la española', async ({ page }) => {
  await configurar(page, 5, 10, 5);

  await expect(magnitud(page, 'v tangencial')).toHaveText('50,00'); // v = 10 · 5
  await expect(magnitud(page, 'Aceleración centrípeta')).toHaveText('500,00'); // a_c = 100 · 5
  // F_c = 5 · 500 = 2500 N. En es-ES los números de cuatro cifras NO llevan punto de millar.
  await expect(magnitud(page, 'Fuerza centrípeta')).toHaveText('2500,00');
  await expect(magnitud(page, 'Período \\(T\\)')).toHaveText('0,63'); // T = 2π/10 = 0,6283185
  await expect(magnitud(page, 'Frecuencia \\(f\\)')).toHaveText('1,592'); // f = 10/2π = 1,5915494

  // Coma decimal en todo el panel: ni un solo número con punto decimal a la americana.
  for (const nombre of ['v tangencial', 'Aceleración centrípeta', 'Fuerza centrípeta', 'Frecuencia \\(f\\)']) {
    await expect(magnitud(page, nombre)).toHaveText(/^\d+(\.\d{3})*,\d+$/);
  }
});

test('CASO 3 (rechazo) — radio, ω y masa negativos no llegan nunca al cálculo', async ({ page }) => {
  // Los tres controles declaran su dominio físico, y el navegador satura por abajo.
  await expect(page.locator('input[type="range"]').nth(RADIO)).toHaveAttribute('min', '0.5');
  await expect(page.locator('input[type="range"]').nth(OMEGA)).toHaveAttribute('min', '0');
  await expect(page.locator('input[type="range"]').nth(MASA)).toHaveAttribute('min', '0.1');

  await configurar(page, -3, -5, -2);
  expect(await valorSlider(page, RADIO)).toBe('0.5'); // −3 m no es un radio
  expect(await valorSlider(page, OMEGA)).toBe('0');
  expect(await valorSlider(page, MASA)).toBe('0.1'); // −2 kg no es una masa
  await expect(magnitud(page, 'Fuerza centrípeta')).toHaveText('0,00');
  await expect(magnitud(page, 'v tangencial')).toHaveText('0,00');

  // Por arriba, saturación al máximo declarado.
  await configurar(page, 999, 999, 999);
  expect(await valorSlider(page, RADIO)).toBe('5');
  expect(await valorSlider(page, OMEGA)).toBe('10');
  expect(await valorSlider(page, MASA)).toBe('5');
  await expect(magnitud(page, 'Aceleración centrípeta')).toHaveText('500,00'); // a_c = 10² · 5

  // Y con texto, el <input type="range"> revierte al centro del recorrido en vez de
  // entregar NaN a parseFloat: el panel sigue mostrando números reales.
  await configurar(page, 'abc', 'abc', 'abc');
  expect(await valorSlider(page, OMEGA)).toBe('5'); // punto medio de [0, 10]
  await expect(magnitud(page, 'ω')).toHaveText('5,00');
  await expect(page.locator('body')).not.toContainText('NaN');
  await expect(page.locator('body')).not.toContainText('No definido');
});

test('CASO 4 (animación) — la partícula gira a la ω del panel y los vectores apuntan a donde deben', async ({
  page,
}) => {
  await page.addScriptTag({ content: SONDA_CANVAS });
  await configurar(page, 3, 1.5, 1); // v = 1,5 · 3 = 4,5 m/s · a_c = 1,5² · 3 = 6,75 m/s²
  await expect(magnitud(page, 'v tangencial')).toHaveText('4,50');
  await expect(magnitud(page, 'Aceleración centrípeta')).toHaveText('6,75');
  await page.waitForTimeout(400);

  // (1) ω REAL de la animación, desenrollando el ángulo de la partícula.
  const serie: { theta: number; t: number }[] = [];
  for (let k = 0; k < 12; k++) {
    serie.push(await muestraAngulo(page));
    await page.waitForTimeout(120);
  }
  const puntos = desenrollar(serie);
  const omegaMedida = puntos[puntos.length - 1].th / puntos[puntos.length - 1].t;
  // Debe girar a 1,5 rad/s. El margen cubre el clamp dt = min(Δt, 0,05 s) del bucle rAF, que
  // solo puede ralentizar la simulación bajo carga, nunca acelerarla. Y el signo positivo es
  // la convención antihoraria que el propio código declara.
  expect(omegaMedida, 'la animación debe girar a la ω que rotula el panel').toBeGreaterThan(1.3);
  expect(omegaMedida, 'la animación debe girar a la ω que rotula el panel').toBeLessThan(1.65);

  // (2) GEOMETRÍA: v perpendicular al radio y a_c antiparalela al radio, en varias posiciones.
  for (let k = 0; k < 4; k++) {
    await page.waitForTimeout(330);
    const s = await page.evaluate(() => window.__sonda());
    expect(s.particula, 'la partícula debe estar pintada en el canvas').not.toBeNull();
    expect(s.velocidad, 'el vector v debe estar pintado').not.toBeNull();
    expect(s.centripeta, 'el vector a_c debe estar pintado').not.toBeNull();
    const rx = s.particula!.x - s.centro.x;
    const ry = s.particula!.y - s.centro.y;
    const angV = anguloEntre(rx, ry, s.velocidad!.x - s.particula!.x, s.velocidad!.y - s.particula!.y);
    const angA = anguloEntre(rx, ry, s.centripeta!.x - s.particula!.x, s.centripeta!.y - s.particula!.y);
    expect(angV, 'v tangencial debe ser perpendicular al radio (90°)').toBeGreaterThan(83);
    expect(angV, 'v tangencial debe ser perpendicular al radio (90°)').toBeLessThan(97);
    expect(angA, 'a_c debe apuntar al centro, es decir 180° respecto al radio').toBeGreaterThan(170);
  }

  // (3) el radio dibujado es proporcional a r (radioPx = r/5 · maxPx): al doblar r, dobla.
  await mover(page, OMEGA, 0); // parar el giro para medir sin arrastre
  await mover(page, RADIO, 2);
  await page.waitForTimeout(350);
  const r2 = await page.evaluate(() => {
    const s = window.__sonda();
    return Math.hypot(s.particula!.x - s.centro.x, s.particula!.y - s.centro.y);
  });
  await mover(page, RADIO, 4);
  await page.waitForTimeout(350);
  const r4 = await page.evaluate(() => {
    const s = window.__sonda();
    return Math.hypot(s.particula!.x - s.centro.x, s.particula!.y - s.centro.y);
  });
  expect(r4 / r2, 'doblar el radio físico debe doblar el radio dibujado').toBeGreaterThan(1.9);
  expect(r4 / r2, 'doblar el radio físico debe doblar el radio dibujado').toBeLessThan(2.1);
});

test('CASO 5 (MCNU) — la animación acelera con α = 0,5 rad/s², pero el panel se queda quieto', async ({
  page,
}) => {
  await page.addScriptTag({ content: SONDA_CANVAS });
  await configurar(page, 2, 1, 1); // ω₀ = 1 rad/s, r = 2 m
  await page.getByRole('button', { name: /^MCNU/ }).click();
  await expect(page.getByRole('button', { name: /^MCNU/ })).toHaveAttribute('aria-pressed', 'true');

  // θ(t) = ω₀·t + ½·α·t². Se ajusta esa parábola al ángulo desenrollado y se lee α.
  const serie: { theta: number; t: number }[] = [];
  for (let k = 0; k < 24; k++) {
    serie.push(await muestraAngulo(page));
    await page.waitForTimeout(150);
  }
  const puntos = desenrollar(serie);
  // Mínimos cuadrados de th = a·t + b·t² (sin término independiente, porque θ(0) = 0).
  // Entonces ω₀ = a y α = 2b, que es la lectura directa de la cinemática del MCUA.
  let S11 = 0;
  let S12 = 0;
  let S22 = 0;
  let Sy1 = 0;
  let Sy2 = 0;
  for (const p of puntos) {
    S11 += p.t ** 2;
    S12 += p.t ** 3;
    S22 += p.t ** 4;
    Sy1 += p.t * p.th;
    Sy2 += p.t ** 2 * p.th;
  }
  const det = S11 * S22 - S12 * S12;
  const omegaCero = (Sy1 * S22 - Sy2 * S12) / det;
  const alfa = (2 * (S11 * Sy2 - S12 * Sy1)) / det;
  expect(omegaCero, 'debe arrancar en la ω del slider (1 rad/s)').toBeGreaterThan(0.75);
  expect(omegaCero, 'debe arrancar en la ω del slider (1 rad/s)').toBeLessThan(1.25);
  expect(alfa, 'α declarada en el propio botón: 0,5 rad/s²').toBeGreaterThan(0.38);
  expect(alfa, 'α declarada en el propio botón: 0,5 rad/s²').toBeLessThan(0.62);

  // HALLAZGO documentado: tras ~3,5 s girando en MCNU la ω real ronda ya ω₀ + α·t = 1 + 0,5·3,5
  // = 2,75 rad/s (a_c ≈ 2,75² · 2 = 15,1 m/s²), pero el panel sigue clavado en la ω del slider.
  // La tabla de la propia app dice «Aceleración centrípeta: varía porque ω varía».
  // Si algún día el panel se engancha a omegaRef, son estos expect.soft los que avisan.
  await expect
    .soft(magnitud(page, 'ω'), 'MCNU: el panel congela ω en el valor del slider mientras la partícula acelera')
    .toHaveText('1,00');
  await expect
    .soft(
      magnitud(page, 'Aceleración centrípeta'),
      'MCNU: a_c congelada en ω₀²·r = 1 · 2 = 2 m/s² pese a que ω ya no vale 1 rad/s',
    )
    .toHaveText('2,00');
  await expect
    .soft(
      magnitud(page, 'Período \\(T\\)'),
      'MCNU: T congelado en 2π/ω₀ = 6,28 s aunque cada vuelta dura ya bastante menos',
    )
    .toHaveText('6,28');

  // Volver a MCU debe dejar panel y animación otra vez de acuerdo.
  await page.getByRole('button', { name: /^MCU/ }).click();
  await expect(page.getByRole('button', { name: /^MCU/ })).toHaveAttribute('aria-pressed', 'true');
  await expect(magnitud(page, 'ω')).toHaveText('1,00');
  await expect(magnitud(page, 'v tangencial')).toHaveText('2,00'); // v = 1 · 2
});

test('accesibilidad — etiquetas de los controles y estado de los botones de modo', async ({ page }) => {
  await expect(page.getByRole('slider', { name: 'Radio de la circunferencia' })).toBeVisible();
  await expect(page.getByRole('slider', { name: 'Velocidad angular' })).toBeVisible();
  await expect(page.getByRole('slider', { name: 'Masa de la partícula' })).toBeVisible();
  await expect(page.locator('canvas')).toHaveAttribute(
    'aria-label',
    'Animación del movimiento circular con vectores de velocidad y aceleración',
  );

  // Los botones de modo sí declaran su estado (aria-pressed), que es lo que exige la regla.
  await expect(page.getByRole('button', { name: /^MCU/ })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('button', { name: /^MCNU/ })).toHaveAttribute('aria-pressed', 'false');

  // HALLAZGO documentado: a los dos les falta type="button" (regla de oro del CLAUDE.md).
  // Cuando se añada, estos expect.soft avisarán de que el hallazgo está cerrado.
  await expect
    .soft(page.getByRole('button', { name: /^MCU/ }), 'todo <button> lleva type="button"')
    .not.toHaveAttribute('type', 'button');
  await expect
    .soft(page.getByRole('button', { name: /^MCNU/ }), 'todo <button> lleva type="button"')
    .not.toHaveAttribute('type', 'button');
});
