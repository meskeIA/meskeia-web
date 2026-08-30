import { test, expect, Page } from '@playwright/test';

/**
 * Inspector — simulador-movimiento-circular (segmento interactiva/física, riesgo 3, 816 usos)
 *
 * Primera inspección 21/08/2026 · RE-INSPECCIÓN 30/08/2026.
 *
 * El <h1> promete «Simulador de Movimiento Circular» y el subtítulo «Observa en tiempo real
 * cómo se mueve una partícula en trayectoria circular. Ajusta radio, velocidad angular y masa
 * para ver los vectores de velocidad tangencial y aceleración centrípeta». La metadata añade
 * «Cálculo de v, a_c, F_c, T y frecuencia en tiempo real» y un modo MCNU. Hay, por tanto,
 * verdad física comprobable: el build no ve la física mal, así que aquí se comprueban NÚMEROS
 * contra fórmulas resueltas a mano y también la GEOMETRÍA de la animación leyendo los píxeles
 * del canvas.
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
 * toFixed() crudo en page.tsx, y los rótulos de los sliders salen con coma decimal.
 *
 * ─────────────────────────────────────────────────────────────────────────────────────────
 * LOS TRES CASOS DE LA RE-INSPECCIÓN, RESUELTOS A MANO ANTES DE ABRIR EL NAVEGADOR
 * (ternas nuevas: si el cálculo se hubiese roto solo para valores no probados en agosto,
 *  repetir las mismas cifras de entonces no lo vería)
 *
 *   CASO 1 (normal) — r = 2,5 m · ω = 4 rad/s · m = 2 kg
 *       T   = 2π/ω   = 6,283185307/4  = 1,570796327 s            → «1,57»   s
 *       v   = ω·r    = 4 · 2,5        = 10 m/s                   → «10,00»  m/s
 *       a_c = ω²·r   = 16 · 2,5       = 40 m/s²                  → «40,00»  m/s²
 *         (control cruzado con la otra fórmula: v²/r = 100/2,5 = 40 ✔ coinciden)
 *       F_c = m·a_c  = 2 · 40         = 80 N                     → «80,00»  N
 *       f   = ω/(2π) = 4/6,283185307  = 0,636619772 Hz           → «0,637»  Hz
 *         (control: f = 1/T = 1/1,570796 = 0,63662 ✔ son inversos)
 *
 *   CASO 2 (límite) — los dos extremos, incluido MÁS ALLÁ del rango del control
 *       (a) mínimos: r = 0,5 m · ω = 0 rad/s · m = 0,1 kg
 *           v = 0 · 0,5 = 0 · a_c = 0² · 0,5 = 0 · F_c = 0,1 · 0 = 0
 *           T = 2π/0 → no está definido: el período de algo que no gira es infinito.
 *             La app debe escribir «∞», nunca «Infinity» ni «NaN».
 *           f = 0 Hz (cero vueltas por segundo) → «0,000»
 *           Nótese que a_c se calcula como ω²·r y NO como v²/r, así que ni siquiera con el
 *           radio en su mínimo hay división por cero; y el slider no deja bajar de 0,5 m.
 *       (b) más allá del tope: se piden 50 / 50 / 50, fuera de rango en los tres controles,
 *           y el navegador satura en r = 5 m · ω = 10 rad/s · m = 5 kg
 *           v   = 10 · 5  = 50 m/s                               → «50,00»   m/s
 *           a_c = 100 · 5 = 500 m/s²                             → «500,00»  m/s²
 *           F_c = 5 · 500 = 2500 N                               → «2500,00» N (sin punto de millar, ver nota)
 *           T   = 2π/10   = 0,628318531 s                        → «0,63»    s
 *           f   = 10/(2π) = 1,591549431 Hz                       → «1,592»   Hz
 *
 *   CASO 3 (rechazo) — magnitudes sin sentido físico: r = −3 m, ω = −5 rad/s, m = −2 kg
 *       Un radio o una masa negativos no existen, y una ω negativa aquí solo sería un
 *       cambio de sentido que el modelo no contempla. Los tres controles son <input
 *       type="range"> con min/max declarados, de modo que el propio navegador satura al
 *       mínimo (0,5 · 0 · 0,1) y nunca llega un número negativo al cálculo:
 *           v = 0 · 0,5 = 0 · a_c = 0 · F_c = 0 · T = ∞ · f = 0
 *       Y con texto («abc») el <input type="range"> revierte al punto medio del recorrido
 *       ajustado al step: r = 2,8 m (medio de [0,5; 5] = 2,75 → step 0,1), ω = 5 rad/s,
 *       m = 2,6 kg (medio de [0,1; 5] = 2,55 → step 0,1). Con esa terna:
 *           v   = 5 · 2,8    = 14 m/s                            → «14,00»  m/s
 *           a_c = 25 · 2,8   = 70 m/s²                           → «70,00»  m/s²
 *           F_c = 2,6 · 70   = 182 N                             → «182,00» N
 *       En ningún caso debe aparecer NaN, Infinity ni «No definido» en pantalla.
 *
 *   CASO 4 (la animación, que es la mitad de la promesa) — se leen los píxeles del canvas
 *       · la partícula es #2E86AB; el vector v, #48A9A6; el vector a_c, #E07A1F.
 *       · la ω real, medida desenrollando el ángulo de la partícula, debe coincidir con la ω
 *         del panel (MCU). Con r = 3 m y ω = 2,5 rad/s: v ⊥ r (90°) y a_c antiparalela a r
 *         (180°), que es literalmente lo que el bloque educativo afirma.
 *       · el radio dibujado debe ser proporcional a r (radioPx = r/5 · maxPx).
 *
 *   CASO 5 (MCNU) — θ(t) = ω₀·t + ½·α·t² con α = 0,5 rad/s², y el panel debe SEGUIR a la
 *       animación (fue el hallazgo 167, reparado el 23/08/2026).
 *
 * ─────────────────────────────────────────────────────────────────────────────────────────
 * RESULTADO DE LA RE-INSPECCIÓN DEL 30/08/2026
 *   El cálculo está SANO. Las seis magnitudes coinciden dígito a dígito con las tres ternas
 *   resueltas a mano, las unidades son las correctas, la ω medida en el canvas dio 2,500
 *   rad/s frente a los 2,50 rotulados, y las reparaciones de agosto siguen puestas
 *   (type="button" en los dos botones de modo, panel enganchado a la ω animada en MCNU,
 *   notación «a_c»/«a_t» en vez de «aₒ»/«αt»).
 *
 * HALLAZGOS ABIERTOS QUE ESTE FICHERO **NO** BLOQUEA (el Inspector no repara)
 * Los tres primeros están al final del fichero como tests con `test.fail()`: afirman lo que
 * debería pasar y hoy fallan a propósito, así que la suite queda VERDE y se pondrá en rojo
 * el día que se reparen.
 *   · Los tres <label> visibles («Radio (r) 2,5 m», «Velocidad angular (ω) 4,0 rad/s»,
 *     «Masa (m) 2,0 kg») NO están asociados a ningún control: ni htmlFor, ni el <input>
 *     anidado dentro, de modo que `label.control` es null en los tres. Además, pulsar el
 *     rótulo no lleva el foco al slider.
 *   · Tampoco hay aria-valuetext: los sliders se apoyan solo en aria-label, que no lleva
 *     unidad ni valor, así que un lector de pantalla dice «Masa de la partícula, 2,5» sin el
 *     «kg», justo en una app cuyo propio recuadro de errores frecuentes advierte de que
 *     equivocar la unidad invalida el resultado.
 *   · MCNU: mover SOLO el slider de radio reinicia la aceleración. Medido: tras 5 s el panel
 *     iba por ω = 3,47 rad/s y al pasar el radio de 2 a 4 m volvió a 1,12 rad/s (ω₀ = 1).
 *     Sale del useEffect [omega, radio, modo], que rearma omegaRef y pone theta a 0. Nada
 *     lo anuncia, y es precisamente el experimento que propone el bullet «Aumentar el radio
 *     a igual ω aumenta tanto v como a_c». En MCU es inocuo, porque ω no evoluciona.
 *   · MCNU no dibuja la aceleración tangencial. Con α = 0,5 rad/s² y r = 4 m vale
 *     a_t = α·r = 2 m/s², y la tabla de la propia app dice «Aceleración tangencial: at =
 *     α · r ≠ 0», pero en el lienzo solo hay v y a_c. Un alumno puede leer la flecha naranja
 *     como la aceleración total, que es el error que la tabla intenta evitar.
 *   · Notación desigual dentro de la misma página: la caja de fórmulas y el bullet escriben
 *     «a_c» y «a_t», mientras la tabla comparativa escribe «at» (tres veces) sin marca de
 *     subíndice.
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

/**
 * Lee el panel entero de UNA foto. En MCNU se re-renderiza cada ~100 ms y leer tarjeta a
 * tarjeta deja los locators despegados a mitad de camino.
 */
async function fotoPanel(page: Page): Promise<Record<string, number>> {
  return page.evaluate(() => {
    const panel = document.querySelector('[class*="valuesPanel"]')!;
    const salida: Record<string, number> = {};
    for (const tarjeta of Array.from(panel.children)) {
      const spans = tarjeta.querySelectorAll('span');
      salida[spans[0].textContent!.trim()] = Number(
        spans[1].textContent!.trim().replace(/\./g, '').replace(',', '.'),
      );
    }
    return salida;
  });
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
    page.getByText(/^MCU:\s*v = ω · r\s*\|\s*a_c = ω² · r = v²\/r\s*\|\s*T = 2π\/ω$/),
  ).toBeVisible();
});

test('CASO 1 (normal) — r = 2,5 m, ω = 4 rad/s, m = 2 kg', async ({ page }) => {
  await configurar(page, 2.5, 4, 2);

  // Los rótulos de los sliders, con coma decimal y unidad (formato español obligatorio).
  await expect(page.getByText('2,5 m', { exact: true })).toBeVisible();
  await expect(page.getByText('4,0 rad/s', { exact: true })).toBeVisible();
  await expect(page.getByText('2,0 kg', { exact: true })).toBeVisible();

  await expect(magnitud(page, 'ω')).toHaveText('4,00'); // la propia entrada
  await expect(magnitud(page, 'v tangencial')).toHaveText('10,00'); // v = ω·r = 4 · 2,5
  await expect(magnitud(page, 'Aceleración centrípeta')).toHaveText('40,00'); // a_c = ω²·r = 16 · 2,5 (= v²/r = 100/2,5)
  await expect(magnitud(page, 'Fuerza centrípeta')).toHaveText('80,00'); // F_c = m·a_c = 2 · 40
  await expect(magnitud(page, 'Período \\(T\\)')).toHaveText('1,57'); // T = 2π/ω = 6,283185/4 = 1,5707963
  await expect(magnitud(page, 'Frecuencia \\(f\\)')).toHaveText('0,637'); // f = ω/2π = 4/6,283185 = 0,6366198 (= 1/T)

  // Las UNIDADES, que es donde estas apps se equivocan: rad/s no es rpm, y f va en Hz.
  await expect(unidad(page, 'ω')).toHaveText('rad/s');
  await expect(unidad(page, 'v tangencial')).toHaveText('m/s');
  await expect(unidad(page, 'Aceleración centrípeta')).toHaveText('m/s²');
  await expect(unidad(page, 'Fuerza centrípeta')).toHaveText('N');
  await expect(unidad(page, 'Período \\(T\\)')).toHaveText('s');
  await expect(unidad(page, 'Frecuencia \\(f\\)')).toHaveText('Hz');

  // La masa NO debe tocar la cinemática: al subirla a 5 kg solo cambia F_c = 5 · 40 = 200 N.
  await mover(page, MASA, 5);
  await expect(magnitud(page, 'Fuerza centrípeta')).toHaveText('200,00');
  await expect(magnitud(page, 'v tangencial')).toHaveText('10,00');
  await expect(magnitud(page, 'Aceleración centrípeta')).toHaveText('40,00');
  await expect(magnitud(page, 'Período \\(T\\)')).toHaveText('1,57');

  // Y a_c debe crecer con el CUADRADO de ω: 4 → 8 rad/s multiplica a_c por 4 (40 → 160),
  // mientras v, que es lineal en ω, solo se dobla (10 → 20). Es el «a_c crece con ω²» de la app.
  await mover(page, OMEGA, 8); // a_c = 8² · 2,5 = 160 m/s²
  await expect(magnitud(page, 'Aceleración centrípeta')).toHaveText('160,00');
  await expect(magnitud(page, 'v tangencial')).toHaveText('20,00'); // v = 8 · 2,5

  // Y con una terna NO redonda, donde un error de fórmula ya no se disimula:
  // r = 1,3 m · ω = 3,7 rad/s → v = 4,81 m/s · a_c = 3,7² · 1,3 = 17,797 (= 4,81²/1,3 ✔)
  await configurar(page, 1.3, 3.7, 1);
  await expect(magnitud(page, 'v tangencial')).toHaveText('4,81');
  await expect(magnitud(page, 'Aceleración centrípeta')).toHaveText('17,80'); // 17,797 redondeado a 2 decimales
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

test('CASO 2b (límite) — más allá del tope: 50/50/50 satura en 5/10/5', async ({ page }) => {
  // Se piden valores FUERA del rango declarado en los tres controles a la vez.
  await configurar(page, 50, 50, 50);

  expect(await valorSlider(page, RADIO)).toBe('5');
  expect(await valorSlider(page, OMEGA)).toBe('10');
  expect(await valorSlider(page, MASA)).toBe('5');

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
  expect(await valorSlider(page, OMEGA)).toBe('0'); // −5 rad/s sería un giro que el modelo no contempla
  expect(await valorSlider(page, MASA)).toBe('0.1'); // −2 kg no es una masa
  await expect(magnitud(page, 'v tangencial')).toHaveText('0,00');
  await expect(magnitud(page, 'Aceleración centrípeta')).toHaveText('0,00');
  await expect(magnitud(page, 'Fuerza centrípeta')).toHaveText('0,00');
  await expect(magnitud(page, 'Período \\(T\\)')).toHaveText('∞');

  // Y con texto, el <input type="range"> revierte al punto medio del recorrido ajustado al
  // step, en vez de entregar NaN a parseFloat: r = 2,8 m (medio de [0,5; 5] = 2,75 → 2,8),
  // ω = 5 rad/s (medio de [0; 10]) y m = 2,6 kg (medio de [0,1; 5] = 2,55 → 2,6).
  await configurar(page, 'abc', 'abc', 'abc');
  expect(await valorSlider(page, RADIO)).toBe('2.8');
  expect(await valorSlider(page, OMEGA)).toBe('5');
  expect(await valorSlider(page, MASA)).toBe('2.6');
  await expect(magnitud(page, 'ω')).toHaveText('5,00');
  await expect(magnitud(page, 'v tangencial')).toHaveText('14,00'); // v = 5 · 2,8
  await expect(magnitud(page, 'Aceleración centrípeta')).toHaveText('70,00'); // a_c = 25 · 2,8
  await expect(magnitud(page, 'Fuerza centrípeta')).toHaveText('182,00'); // F_c = 2,6 · 70
  await expect(page.locator('body')).not.toContainText('NaN');
  await expect(page.locator('body')).not.toContainText('No definido');
});

test('CASO 4 (animación) — la partícula gira a la ω del panel y los vectores apuntan a donde deben', async ({
  page,
}) => {
  await page.addScriptTag({ content: SONDA_CANVAS });
  await configurar(page, 3, 2.5, 1); // v = 2,5 · 3 = 7,5 m/s · a_c = 2,5² · 3 = 18,75 m/s²
  await expect(magnitud(page, 'v tangencial')).toHaveText('7,50');
  await expect(magnitud(page, 'Aceleración centrípeta')).toHaveText('18,75');
  await page.waitForTimeout(400);

  // (1) ω REAL de la animación, desenrollando el ángulo de la partícula.
  const serie: { theta: number; t: number }[] = [];
  for (let k = 0; k < 12; k++) {
    serie.push(await muestraAngulo(page));
    await page.waitForTimeout(120);
  }
  const puntos = desenrollar(serie);
  const omegaMedida = puntos[puntos.length - 1].th / puntos[puntos.length - 1].t;
  // Debe girar a 2,5 rad/s (medido el 30/08/2026: 2,500). El margen cubre el clamp
  // dt = min(Δt, 0,05 s) del bucle rAF, que solo puede ralentizar la simulación bajo carga,
  // nunca acelerarla. Y el signo positivo es la convención antihoraria que el código declara.
  expect(omegaMedida, 'la animación debe girar a la ω que rotula el panel').toBeGreaterThan(2.2);
  expect(omegaMedida, 'la animación debe girar a la ω que rotula el panel').toBeLessThan(2.7);

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

test('CASO 5 (MCNU) — la animación acelera con α = 0,5 rad/s² y el panel la sigue', async ({
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

  // REPARADO el 23/08/2026 (hallazgo 167). El panel se derivaba de `omega` —el estado del
  // slider— y no de `omegaRef`, que es lo que de verdad gira, así que en MCNU las seis
  // tarjetas salían congeladas en ω₀ mientras la bola aceleraba en pantalla.
  //
  // No se fijan cifras exactas porque dependen del instante de lectura. Lo que se comprueba
  // es más fuerte: que ω ha CRECIDO desde el 1,00 del slider, y que las demás magnitudes
  // siguen siendo coherentes con la ω que el propio panel enseña.
  const foto = await fotoPanel(page);
  const omegaPanel = foto['ω'];
  expect(omegaPanel, 'MCNU: el panel sigue a la animación, no al slider').toBeGreaterThan(1.5);

  // Con r = 2 m:  a_c = ω²·r  ·  v = ω·r  ·  T = 2π/ω
  //
  // La tolerancia sale de PROPAGAR el redondeo, no de un número fijo. El panel publica ω con
  // dos decimales, así que arrastra hasta ±0,005 rad/s; en a_c = ω²·r ese error se amplifica
  // por 2·ω·r, que con ω ≈ 3 rad/s ya vale 0,06 — por encima del ±0,05 de `toBeCloseTo(…, 1)`.
  // Con la tolerancia fija, el test fallaba o no según el instante en que se tomase la foto.
  const dOmega = 0.005;
  const r = 2;
  expect(
    Math.abs(foto['Aceleración centrípeta'] - omegaPanel ** 2 * r),
    'a_c = ω²·r con la ω que enseña el propio panel',
  ).toBeLessThanOrEqual(2 * omegaPanel * r * dOmega + 0.01);
  expect(
    Math.abs(foto['v tangencial'] - omegaPanel * r),
    'v = ω·r con la ω que enseña el propio panel',
  ).toBeLessThanOrEqual(r * dOmega + 0.01);
  expect(
    Math.abs(foto['Período (T)'] - (2 * Math.PI) / omegaPanel),
    'T = 2π/ω con la ω que enseña el propio panel',
  ).toBeLessThanOrEqual(((2 * Math.PI) / omegaPanel ** 2) * dOmega + 0.01);

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

  // Regla de oro del CLAUDE.md: todo <button> lleva type="button". Reparado el 23/08/2026.
  await expect(page.getByRole('button', { name: /^MCU/ })).toHaveAttribute('type', 'button');
  await expect(page.getByRole('button', { name: /^MCNU/ })).toHaveAttribute('type', 'button');
});

/* ═══════════════════════════════════════════════════════════════════════════════════════
 * HALLAZGOS ABIERTOS DEL 30/08/2026
 *
 * Los tres tests de aquí abajo afirman lo que DEBERÍA pasar y hoy fallan a propósito, con
 * `test.fail()`. El día que se reparen pasarán a ROJO («expected to fail, but passed») y
 * habrá que quitarles la marca, no reescribir el valor esperado. El Inspector no repara.
 * ═══════════════════════════════════════════════════════════════════════════════════════ */

test('HALLAZGO ABIERTO — MCNU: mover solo el radio reinicia la aceleración', async ({ page }) => {
  test.fail();
  // Medido el 30/08/2026: con ω₀ = 1 rad/s y r = 2 m, tras 5 s el panel iba por ω = 3,47
  // rad/s; al pasar el radio de 2 a 4 m volvió a 1,12 rad/s. Sale del
  // useEffect [omega, radio, modo] de page.tsx, que rearma omegaRef y pone theta a 0.
  // Nada lo anuncia en pantalla, y es justo el experimento que propone el bullet del bloque
  // educativo: «Aumentar el radio a igual ω aumenta tanto v como a_c» — con ω rearmada, la
  // comparación que el alumno intenta hacer no es a igual ω. En MCU es inocuo, porque ahí ω
  // no evoluciona.
  await configurar(page, 2, 1, 1);
  await page.getByRole('button', { name: /^MCNU/ }).click();
  await page.waitForTimeout(5000);
  const antes = (await fotoPanel(page))['ω'];
  expect(antes, 'tras 5 s a α = 0,5 rad/s² debe haber acelerado desde ω₀ = 1').toBeGreaterThan(2.5);

  await mover(page, RADIO, 4); // se toca SOLO el radio: ni ω, ni el modo
  await page.waitForTimeout(250);
  const despues = (await fotoPanel(page))['ω'];
  expect(
    despues,
    'cambiar solo el radio no debería devolver ω a ω₀ (= 1 rad/s) sin avisar',
  ).toBeGreaterThan(antes - 0.5);
});

test('HALLAZGO ABIERTO — los tres <label> visibles no gobiernan ningún control', async ({ page }) => {
  test.fail();
  // «Radio (r) 2,0 m», «Velocidad angular (ω) 2,0 rad/s» y «Masa (m) 1,0 kg» son <label> sin
  // htmlFor y sin el <input> anidado dentro, así que `label.control` es null en los tres:
  // no etiquetan nada y pulsarlos no lleva el foco al slider. Los sliders se sostienen solo
  // sobre aria-label, que sí existe pero no lleva ni el valor ni la unidad.
  const huerfanas = await page.evaluate(
    () => Array.from(document.querySelectorAll('label')).filter((l) => !l.control).length,
  );
  expect(huerfanas, 'ningún <label> debería quedar sin control asociado').toBe(0);
});

test('HALLAZGO ABIERTO — los sliders no anuncian su valor con unidad', async ({ page }) => {
  test.fail();
  // Sin aria-valuetext, un lector de pantalla lee el número crudo del range: «Masa de la
  // partícula, 2,5» sin el «kg», «Velocidad angular, 4» sin el «rad/s». La unidad solo está
  // en el <label> huérfano de al lado, que no se anuncia. Es una pérdida real en una app
  // cuyo propio recuadro de errores frecuentes avisa de que «la fórmula a_c = ω² · r requiere
  // ω en rad/s: si introduces rpm directamente el resultado es incorrecto».
  const sinValueText = await page.evaluate(
    () =>
      Array.from(document.querySelectorAll('input[type="range"]')).filter(
        (r) => !r.getAttribute('aria-valuetext'),
      ).length,
  );
  expect(sinValueText, 'los tres sliders deberían declarar aria-valuetext con la unidad').toBe(0);
});
