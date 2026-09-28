import { test, expect, Page } from '@playwright/test';
import { esperarHidratacion, leerValorEnReact, sembrarValorAcotado } from './_hidratacion';

/**
 * Inspector — simulador-movimiento-circular (segmento interactiva/física, riesgo 3, 816 usos)
 *
 * Primera inspección 21/08/2026 · RE-INSPECCIONES 30/08/2026, 22/09/2026 y 28/09/2026
 * (la del 28/09, con 1.675 usos en 30 días, al final del fichero).
 *
 * ⚠️ Desde el 15/09/2026 las cinco fórmulas del panel ya NO viven en page.tsx: están en
 * app/simulador-movimiento-circular/casos.ts, que page.tsx importa (ver «CASOS PARA CLASE»).
 * El bloque «DÓNDE VIVE EL CÁLCULO» de aquí abajo describe la versión de agosto.
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
 * HALLAZGOS 540-544, REPARADOS el 30/08/2026 (Inspector, ronda 8)
 * Estaban con `test.fail()`; ahora sujetan la reparación como regresión, al final del fichero.
 *   · 540: los tres <label> visibles ya llevan htmlFor y su input el id correspondiente.
 *   · 541: los tres sliders ya declaran aria-valuetext con la unidad completa.
 *   · 542: el useEffect que sincronizaba omegaRef/thetaRef ya no lleva `radio` en sus
 *     dependencias — solo se reinicia al cambiar ω₀ o el modo, nunca al cambiar el radio.
 *   · 543: en MCNU el canvas ya dibuja también el vector de aceleración tangencial (a_t, rojo).
 *   · 544: la tabla comparativa ya escribe «a_t», igual que la caja de fórmulas y el bullet.
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
 * Mueve un slider y comprueba que el ESTADO de React lo recogió. Un <input type="range"> no
 * acepta fill(), y arrastrar con el ratón no da un valor exacto, así que se escribe con el
 * setter nativo y se dispara el evento input que React escucha. El navegador satura solo si el
 * valor cae fuera de [min, max]: eso es justamente lo que el CASO 3 quiere observar, y por eso
 * el testigo es el valor que el control ACEPTA, no el pedido.
 */
async function mover(page: Page, indice: number, valor: number | string): Promise<void> {
  await sembrarValorAcotado(page, page.locator('input[type="range"]').nth(indice), valor);
}

/**
 * Mueve un slider ASEGURÁNDOSE de que el movimiento es real. El simulador arranca en r=2 m,
 * ω=1 rad/s y m=1 kg, así que un escenario que pida cualquiera de esos tres valores sembraría
 * un control que ya está donde se le pide: el estado de React ya coincide y la comprobación
 * pasaría aunque el evento se hubiera perdido y ese control estuviera sordo. Se detectó con
 * `SIEMBRA_ESTRICTA=1` (ver tests/apps/_hidratacion.ts); la solución es pasar antes por un
 * extremo del recorrido, y así el valor final queda comprobado en vez de supuesto.
 */
async function moverDeVerdad(page: Page, indice: number, valor: number | string): Promise<void> {
  const slider = page.locator('input[type="range"]').nth(indice);
  if ((await leerValorEnReact(page, slider)) === String(valor)) {
    const rango = await slider.evaluate((el: HTMLInputElement) => ({ min: el.min, max: el.max }));
    await mover(page, indice, String(valor) === rango.min ? rango.max : rango.min);
  }
  await mover(page, indice, valor);
}

async function configurar(
  page: Page,
  r: number | string,
  w: number | string,
  m: number | string,
): Promise<void> {
  await moverDeVerdad(page, RADIO, r);
  await moverDeVerdad(page, OMEGA, w);
  await moverDeVerdad(page, MASA, m);
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
  // El <h1> viaja en el HTML servido: está en pantalla antes de que la app responda a nada, y
  // el primer movimiento de slider se perdería (ver tests/apps/_hidratacion.ts).
  await esperarHidratacion(page, ['input[type="range"]']);
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
 * Reparados el 30/08/2026 (Inspector, ronda 8, hallazgos 540-542). Estaban con
 * `test.fail()`; ahora sujetan la reparación como regresión.
 * ═══════════════════════════════════════════════════════════════════════════════════════ */

test('542 — MCNU: mover solo el radio ya NO reinicia la aceleración', async ({ page }) => {
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

test('540 — los tres <label> visibles ya gobiernan su control', async ({ page }) => {
  // «Radio (r) 2,0 m», «Velocidad angular (ω) 2,0 rad/s» y «Masa (m) 1,0 kg» eran <label> sin
  // htmlFor y sin el <input> anidado dentro, así que `label.control` es null en los tres:
  // no etiquetan nada y pulsarlos no lleva el foco al slider. Los sliders se sostienen solo
  // sobre aria-label, que sí existe pero no lleva ni el valor ni la unidad.
  const huerfanas = await page.evaluate(
    () => Array.from(document.querySelectorAll('label')).filter((l) => !l.control).length,
  );
  expect(huerfanas, 'ningún <label> debería quedar sin control asociado').toBe(0);
});

test('541 — los sliders ya anuncian su valor con unidad', async ({ page }) => {
  // Sin aria-valuetext, un lector de pantalla leía el número crudo del range: «Masa de la
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

test('543 — en MCNU el canvas ya dibuja el vector de aceleración tangencial (a_t, rojo #DC2626)', async ({
  page,
}) => {
  await page.goto(RUTA);
  await configurar(page, 4, 1, 1);
  await page.getByRole('button', { name: /^MCNU/ }).click();
  await page.waitForTimeout(300); // deja arrancar el bucle rAF para que ω supere el umbral 0,01

  const buscarColorAt = () =>
    page.evaluate(() => {
      const c = document.querySelector('canvas')!;
      const d = c.getContext('2d')!.getImageData(0, 0, c.width, c.height).data;
      for (let i = 0; i < d.length; i += 4) {
        if (Math.abs(d[i] - 220) < 14 && Math.abs(d[i + 1] - 38) < 14 && Math.abs(d[i + 2] - 38) < 14) {
          return true;
        }
      }
      return false;
    });

  expect(await buscarColorAt(), 'en MCNU el canvas debería pintar el vector a_t').toBe(true);

  // En MCU la aceleración tangencial es nula: el vector no debe pintarse
  await page.getByRole('button', { name: /^MCU/ }).click();
  await page.waitForTimeout(300);
  expect(await buscarColorAt(), 'en MCU no hay a_t: el vector no debería pintarse').toBe(false);
});

test('544 — notación consistente: a_t en toda la app, nunca «at» sin subíndice', async ({ page }) => {
  await page.goto(RUTA);
  await page.getByRole('button', { name: 'Ver guía educativa' }).click();
  const cuerpo = (await page.locator('body').textContent()) ?? '';
  expect(cuerpo).toContain('a_t');
  expect(cuerpo).not.toMatch(/\(at\)|\bat\s*=/);
});

/* ═══════════════════════════════════════════════════════════════════════════════════════
 * CASOS PARA CLASE (14/09/2026) — la tarea asignable de esta app.
 *
 * Por qué existe: el detector de eventos-aula le cuenta a `simulador-movimiento-circular`
 * CINCO aulas, el 24 % de su tráfico de vida (347 de 1.464 visitas), tres de ellas en la
 * misma semana y todas latinoamericanas. Física era la disciplina que más aula recibe y la
 * única grande sin un solo caso asignable: matemáticas tenía siete apps, química dos y
 * biología una.
 *
 * DÓNDE VIVE EL CÁLCULO
 *   app/simulador-movimiento-circular/casos.ts   ← las cinco fórmulas Y los doce casos
 *   app/simulador-movimiento-circular/page.tsx   ← importa esas fórmulas: no tiene copia propia
 *
 * LAS DOCE RESPUESTAS, RESUELTAS A MANO ANTES DE ESCRIBIR EL MÓDULO
 * (convenio de la app: ω en rad/s · v = ω·r · a_c = ω²·r · F_c = m·a_c · T = 2π/ω · f = ω/2π)
 *
 *    1 · r=2, ω=3            → v   = 3·2 = 6 m/s
 *    2 · r=0,5, ω=4          → a_c = 4²·0,5 = 8 m/s²
 *    3 · r=1,5, ω=2, m=0,2   → a_c = 4·1,5 = 6 ; F_c = 0,2·6 = 1,2 N
 *    4 · ω=2                 → T   = 2π/2 = π = 3,1415926… → 3,14 s
 *    5 · T=4                 → ω   = 2π/4 = 1,5707963… → 1,57 rad/s
 *    6 · 6 vueltas / 60 s    → f   = 6/60 = 0,1 Hz
 *    7 · f=0,5, r=3          → ω = 2π·0,5 = π ; v = 3π = 9,4247779… → 9,42 m/s
 *    8 · v=6, r=3            → ω = 6/3 = 2 ; a_c = 4·3 = 12 m/s²
 *    9 · r=2, ω=2            → a_c = 4·2 = 8 m/s²  (con ω=1 eran 2: el cuadrado lo cuadruplica)
 *   10 · v=4, r=2, m=0,5     → ω = 2 ; a_c = 4·2 = 8 ; F_c = 0,5·8 = 4 N
 *   11 · 45 vueltas / 60 s   → f = 0,75 ; ω = 2π·0,75 = 4,7123889… → 4,71 rad/s
 *   12 · T=0,5, r=0,4        → ω = 2π/0,5 = 12,566370… ; v = 5,0265482… → 5,03 m/s
 *
 * Ninguno está copiado de lo que devuelve la app: si el módulo discrepa de esta tabla, manda
 * la tabla hasta demostrar lo contrario.
 * ═══════════════════════════════════════════════════════════════════════════════════════ */

import {
  CASOS,
  TOTAL_CASOS,
  resolverCaso,
  toleranciaDe,
  comprobarRespuesta,
  generarEjercicioAleatorio,
  omegaDe,
  velocidadLineal,
  aceleracionCentripeta,
  fuerzaCentripeta,
  periodoDe,
  frecuenciaDe,
} from '../../app/simulador-movimiento-circular/casos';

const A_MANO: Readonly<Record<number, number>> = {
  1: 6,
  2: 8,
  3: 1.2,
  4: 3.14,
  5: 1.57,
  6: 0.1,
  7: 9.42,
  8: 12,
  9: 8,
  10: 4,
  11: 4.71,
  12: 5.03,
};

test.describe('simulador-movimiento-circular · casos para clase', () => {
  test('1 · hay 12 casos con ids 1..12 sin huecos', async () => {
    expect(TOTAL_CASOS).toBe(12);
    expect(CASOS.map((c) => c.id)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  });

  test('2 · son deterministas: dos lecturas dan lo mismo', async () => {
    // Es lo único que hace que «resuelve los casos 3, 7 y 11» funcione como consigna.
    for (const caso of CASOS) {
      const a = resolverCaso(caso.datos);
      const b = resolverCaso(caso.datos);
      expect(a.ok, `caso ${caso.id}: ${a.error ?? ''}`).toBe(true);
      expect(b.valor).toBe(a.valor);
      expect(b.pasos).toEqual(a.pasos);
    }
  });

  test('3 · la respuesta declarada coincide con recalcularla desde `datos`', async () => {
    // Caza a quien edite un enunciado y olvide actualizar la solución.
    for (const caso of CASOS) {
      const recalculado = resolverCaso(caso.datos);
      expect(recalculado.ok, `caso ${caso.id}: ${recalculado.error ?? ''}`).toBe(true);
      expect(Math.round(recalculado.valor * 100) / 100, `caso ${caso.id}`).toBe(caso.respuesta);
    }
  });

  test('4 · cada caso tiene enunciado, etiqueta no vacía, respuesta finita y desarrollo', async () => {
    for (const caso of CASOS) {
      expect(caso.enunciado.length, `caso ${caso.id}`).toBeGreaterThan(40);
      expect(caso.etiquetaRespuesta.trim(), `caso ${caso.id}`).not.toBe('');
      expect(Number.isFinite(caso.respuesta), `caso ${caso.id}`).toBe(true);
      expect(caso.pasos.length, `caso ${caso.id}`).toBeGreaterThan(2);
      expect(caso.pista.trim(), `caso ${caso.id}`).not.toBe('');
      // La solución en pantalla lleva la unidad pegada al número, no media etiqueta suelta.
      expect(caso.respuestaTexto, `caso ${caso.id}`).toContain(
        caso.etiquetaRespuesta.slice(caso.etiquetaRespuesta.indexOf(' en ') + 4),
      );
    }
  });

  test('5 · ningún enunciado nombra un país, una ciudad ni una moneda', async () => {
    // Los nueve eventos de aula de física son latinoamericanos: CO, MX, NI, AR, GT y EC.
    const PROHIBIDO =
      /\b(España|Espana|México|Mexico|Colombia|Argentina|Perú|Peru|Chile|Uruguay|Madrid|Barcelona|Bogotá|Lima|euros?|dólares?|pesos?)\b/i;
    for (const caso of CASOS) {
      expect(PROHIBIDO.test(`${caso.titulo} ${caso.enunciado}`), `caso ${caso.id}`).toBe(false);
    }
  });

  test('6 · el generador aleatorio es reproducible, variado y usa la misma aritmética', async () => {
    const a = generarEjercicioAleatorio(12345);
    const b = generarEjercicioAleatorio(12345);
    expect(b.enunciado).toBe(a.enunciado);
    expect(b.respuesta).toBe(a.respuesta);

    // La respuesta sale del MISMO resolverCaso que los fijos, no de otra cuenta.
    expect(Math.round(resolverCaso(a.datos).valor * 100) / 100).toBe(a.respuesta);

    // Variedad: la primera versión de `simulador-genetica` era reproducible y aun así daba
    // SIEMPRE el mismo ejercicio. Reproducible no implica variado, y con una sola semilla
    // no se ve nada.
    const muestras = Array.from({ length: 40 }, (_, i) => generarEjercicioAleatorio(i + 1));
    expect(new Set(muestras.map((m) => m.respuesta)).size).toBeGreaterThanOrEqual(3);
    for (const m of muestras) {
      expect(Number.isFinite(m.respuesta)).toBe(true);
      expect(m.respuesta).toBeGreaterThan(0);
    }
  });

  test('7 · el convenio de la app queda fijado: ω en rad/s y a_c con ω al CUADRADO', async () => {
    // (a) Las doce respuestas, contra la tabla resuelta a mano de la cabecera.
    for (const caso of CASOS) {
      expect(caso.respuesta, `caso ${caso.id} · ${caso.titulo}`).toBe(A_MANO[caso.id]);
    }

    // (b) Las cinco fórmulas del panel, con números exactos.
    expect(velocidadLineal(3, 2)).toBe(6);
    expect(aceleracionCentripeta(4, 0.5)).toBe(8);
    expect(fuerzaCentripeta(0.2, 2, 1.5)).toBeCloseTo(1.2, 10);
    expect(periodoDe(2)).toBeCloseTo(Math.PI, 12);
    expect(frecuenciaDe(2 * Math.PI)).toBeCloseTo(1, 12);

    // (c) EL error clásico del tema: 45 vueltas por minuto NO son 45 rad/s, sino 4,71.
    const omegaTocadiscos = omegaDe({ via: 'vueltas', vueltas: 45, segundos: 60 }, 0.15);
    expect(omegaTocadiscos).toBeCloseTo(4.712389, 5);
    expect(omegaTocadiscos).not.toBeCloseTo(45, 0);

    // (d) a_c va con ω al CUADRADO: doblar ω la multiplica por cuatro, no por dos.
    expect(aceleracionCentripeta(1, 2)).toBe(2);
    expect(aceleracionCentripeta(2, 2)).toBe(8);

    // (e) Y el convenio sale de las MISMAS funciones que usa el panel de la app: v = ω·r
    // recuperado desde un caso que entra por velocidad lineal.
    expect(omegaDe({ via: 'velocidad', velocidad: 6 }, 3)).toBe(2);
  });

  test('8 · corregir no lanza nunca, ni con entradas que no son números', async () => {
    expect(comprobarRespuesta(6, 6).correcto).toBe(true);
    expect(comprobarRespuesta(6.05, 6).correcto).toBe(true); // dentro del 1 %
    expect(comprobarRespuesta(8, 6).correcto).toBe(false);
    expect(comprobarRespuesta(NaN, 6).correcto).toBe(false);
    expect(comprobarRespuesta(NaN, 6).motivo).toContain('número');

    // La tolerancia nunca baja de 0,01, para que el 0,1 del caso 6 no se corrija a ciegas.
    expect(toleranciaDe(0)).toBe(0.01);
    expect(toleranciaDe(0.1)).toBe(0.01);
    expect(toleranciaDe(100)).toBe(1);

    // ω = 0 no produce «∞» en pantalla: se rechaza con un error legible.
    const parado = resolverCaso({ radio: 2, entrada: { via: 'omega', omega: 0 }, magnitud: 'periodo' });
    expect(parado.ok).toBe(false);
    expect(Number.isNaN(parado.valor)).toBe(true);

    // Un radio imposible tampoco lanza.
    const sinRadio = resolverCaso({ radio: 0, entrada: { via: 'omega', omega: 3 }, magnitud: 'velocidad' });
    expect(sinRadio.ok).toBe(false);
    expect(sinRadio.error).toContain('radio');

    // Y pedir la fuerza sin dar la masa se responde, no se revienta.
    const sinMasa = resolverCaso({ radio: 2, entrada: { via: 'omega', omega: 3 }, magnitud: 'fuerza' });
    expect(sinMasa.ok).toBe(false);
    expect(sinMasa.error).toContain('masa');
  });
});

/* ───────────────────────────────────────────────────────────────────────────────────────
 * La sección en el NAVEGADOR. Lo de arriba prueba la física; esto prueba que la sección
 * existe, corrige de verdad y no rompe el simulador (PASO 4.bis de /nueva-app-meskeia).
 * ─────────────────────────────────────────────────────────────────────────────────────── */

test.describe('simulador-movimiento-circular · la sección de casos en el navegador', () => {
  const CAMPO = '#casos-respuesta';
  /** Acotado a la sección: la app puede tener otros avisos con role="alert". */
  const veredicto = (page: Page) => page.locator('[class*="casoVeredicto"]');

  test('corrige bien la respuesta correcta y la equivocada', async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, [CAMPO]);

    // Caso 1: r = 2 m, ω = 3 rad/s → v = 6 m/s.
    await page.fill(CAMPO, '6');
    await page.getByRole('button', { name: 'Comprobar' }).click();
    await expect(veredicto(page)).toContainText('Correcto');

    await page.fill(CAMPO, '4');
    await page.getByRole('button', { name: 'Comprobar' }).click();
    await expect(veredicto(page)).toContainText('No es correcto');
  });

  test('admite la coma decimal española y rechaza lo que no es un número', async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, [CAMPO]);

    // Caso 4: T = 2π/2 = 3,14 s. Con coma, que es como se escribe aquí.
    await page.getByRole('button', { name: 'Caso 4:' }).click();
    await page.fill(CAMPO, '3,14');
    await page.getByRole('button', { name: 'Comprobar' }).click();
    await expect(veredicto(page)).toContainText('Correcto');

    // Y nunca «NaN» en pantalla.
    await page.fill(CAMPO, 'tres coma catorce');
    await page.getByRole('button', { name: 'Comprobar' }).click();
    await expect(veredicto(page)).toContainText('Escribe un número');
    await expect(veredicto(page)).not.toContainText('NaN');
  });

  test('la solución se despliega con su unidad y el caso elegido se anuncia', async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, [CAMPO]);

    await page.getByRole('button', { name: 'Caso 11:' }).click();
    await expect(page.getByRole('button', { name: 'Caso 11:' })).toHaveAttribute('aria-pressed', 'true');

    const verSolucion = page.getByRole('button', { name: /Ver solución/ });
    await expect(verSolucion).toHaveAttribute('aria-expanded', 'false');
    await verSolucion.click();
    await expect(page.locator('[class*="casoSolucion"]')).toContainText('4,71 rad/s');
  });

  test('el simulador de arriba sigue funcionando con la sección añadida', async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, [CAMPO]);

    // Las seis tarjetas del panel usan ahora las funciones de casos.ts: con los valores por
    // defecto (r = 2 m, ω = 2 rad/s, m = 1 kg) v = 4 m/s y a_c = 8 m/s².
    const cuerpo = (await page.locator('body').textContent()) ?? '';
    expect(cuerpo).toContain('Casos para clase');
    await expect(page.locator('canvas')).toBeVisible();
  });
});

/* ═══════════════════════════════════════════════════════════════════════════════════════
 * RE-INSPECCIÓN 22/09/2026 — Inspector
 *
 * Lo que había ya estaba cubierto y sigue verde (497 tests de la tanda del 22/09). Lo NUEVO
 * desde la re-inspección del 30/08 es la tarea de aula del commit cbb02f3f (15/09/2026):
 *   app/simulador-movimiento-circular/casos.ts        ← los 12 casos y el corrector
 *   app/simulador-movimiento-circular/CasosAula.tsx   ← la vista, el modo «Practicar» y las ayudas
 * y por eso las tres comprobaciones de hoy apuntan ahí, además de a tres ternas de panel que
 * ninguna inspección anterior había pedido.
 *
 * LOS TRES CASOS NUEVOS, RESUELTOS A MANO ANTES DE ABRIR EL NAVEGADOR
 * (convenio fijado por la app: ω en rad/s · v = ω·r · a_c = ω²·r · F_c = m·a_c · T = 2π/ω · f = ω/2π)
 *
 *   CASO A (normal) — r = 3,5 m · ω = 6 rad/s · m = 4 kg
 *       v   = 6 · 3,5      = 21 m/s                        → «21,00»  m/s
 *       a_c = 36 · 3,5     = 126 m/s²                      → «126,00» m/s²
 *         (control cruzado con la otra fórmula: v²/r = 441/3,5 = 126 ✔)
 *       F_c = 4 · 126      = 504 N                         → «504,00» N
 *       T   = 2π/6         = 1,047197551 s                 → «1,05»   s
 *       f   = 6/(2π)       = 0,954929659 Hz                → «0,955»  Hz
 *         (control: T·f = 1,047198 · 0,954930 = 1,000000 ✔ son inversos)
 *
 *   CASO B (límite) — el TOPE de ω con los dos mínimos, terna que no se había probado:
 *       r = 0,5 m (mínimo) · ω = 10 rad/s (tope) · m = 0,1 kg (mínimo)
 *       v   = 10 · 0,5     = 5 m/s                         → «5,00»   m/s
 *       a_c = 100 · 0,5    = 50 m/s²                       → «50,00»  m/s²
 *       F_c = 0,1 · 50     = 5 N                           → «5,00»   N
 *       T   = 2π/10        = 0,628318531 s                 → «0,63»   s
 *       f   = 10/(2π)      = 1,591549431 Hz                → «1,592»  Hz
 *       Y el tope por TECLADO, que es la otra forma de mover un <input type="range"> y que
 *       ninguna prueba anterior usaba: con ω ya en 10, una flecha más no debe pasar de 10;
 *       una flecha atrás deja 9,9 y entonces v = 9,9 · 0,5 = 4,95 m/s.
 *
 *   CASO C (rechazo) — lo que el CORRECTOR de los casos de aula tiene que suspender, tecleado
 *       carácter a carácter (un fill() entrega el valor en un solo evento y no vería un campo
 *       que validase cada pulsación; es el defecto que apareció hoy en simulador-genetica):
 *       · Caso 2 (a_c = 4²·0,5 = 8 m/s², tolerancia 0,08):
 *           «2»   → olvidar el CUADRADO de ω (ω·r = 4·0,5 = 2): debe suspender
 *           «-8»  → un módulo de aceleración no es negativo: debe suspender
 *           «0»   → tampoco: debe suspender
 *           «8»   → correcto
 *       · Caso 6 (f = 6/60 = 0,1 Hz), donde la tolerancia mínima de 0,01 es el 10 % del valor
 *         y es el sitio donde una tolerancia relativa podría dejar pasar lo imposible:
 *           «0» y «-0,1» → deben suspender. (COMPROBADO: los suspende. Aquí no se reproduce
 *           el defecto que simulador-genetica tenía hoy en su corrector.)
 *
 * HALLAZGOS DE ESTA RE-INSPECCIÓN (1209-1212) — REPARADOS el 22/09/2026. Llevaban
 * test.fail(); ahora sujetan la reparación como regresión (re-verificados a mano el 28/09/2026).
 *   · 1209 (medio, operativa): la sección prometía «Puedes comprobar cada resultado moviendo
 *     los deslizadores del simulador de arriba» y había casos en los que eso SUSPENDÍA. El
 *     deslizador de ω tiene paso 0,1 y los casos 5 y 7 piden ω = π y ω = 2π/4, que no caen en
 *     la rejilla. Caso 7 (f = 0,5 Hz, r = 3 m → v = 9,42 m/s): con ω = 3,1 el panel imprime
 *     9,30 y el corrector lo rechaza (tolerancia 0,0942 < 0,12); con 3,2 imprime 9,60 y
 *     también. El caso 12 ni siquiera se puede montar: pide r = 0,4 m (mínimo 0,5) y
 *     ω = 12,57 rad/s (máximo 10). Se reparó la PROMESA, no el corrector.
 *   · 1210 (medio, operativa): en el modo «Practicar» el botón de pista seguía en pantalla,
 *     pasaba a aria-expanded="true" y se rotulaba «Ocultar pista» sin desplegar nada, porque
 *     el ejercicio generado no trae pista. Ahora el botón no se ofrece en ese modo.
 *   · 1211 (bajo, calculo): la tolerancia no era simétrica en su borde exacto. Con esperado 0,1
 *     y tolerancia 0,01, «0,11» se aceptaba y «0,09» se rechazaba con el mensaje «te has
 *     desviado 0,01» — justo la tolerancia. Era el ±1 ulp de la resta en binario (0,1−0,09 =
 *     0,010000000000000009 y 0,11−0,1 = 0,009999999999999995), y en el caso 2 dejaba fuera a
 *     «8,08» y «7,92». Ahora se compara con un margen de 1e-9.
 *   · 1212 (bajo, accesibilidad): volver a pulsar «Practicar» cambiaba el enunciado en
 *     silencio. Ahora el enunciado es aria-live="polite" (sin role="status").
 * ═══════════════════════════════════════════════════════════════════════════════════════ */

test.describe('re-inspección 22/09/2026', () => {
  const CAMPO_CASOS = '#casos-respuesta';
  /** Acotado a la sección de casos: la página tiene otros avisos con role="alert". */
  const veredictoCasos = (page: Page) => page.locator('[class*="casoVeredicto"]');

  /**
   * Responde TECLEANDO carácter a carácter y devuelve el veredicto. No usa fill(): un campo
   * que validara cada pulsación por separado rechazaría los dígitos intermedios y un fill(),
   * que entrega el valor en un solo evento, no lo vería.
   */
  async function responderTecleando(page: Page, texto: string): Promise<string> {
    const campo = page.locator(CAMPO_CASOS);
    await campo.click();
    await campo.press('Control+a');
    await campo.press('Delete');
    await campo.pressSequentially(texto, { delay: 20 });
    // El campo tiene que haberse quedado con lo tecleado, no con un resto del valor anterior.
    expect(await campo.inputValue(), 'el campo no admite lo que se teclea').toBe(texto);
    await page.getByRole('button', { name: 'Comprobar' }).click();
    await expect(veredictoCasos(page)).toBeVisible();
    return ((await veredictoCasos(page).textContent()) ?? '').trim();
  }

  test('CASO A (normal) — r = 3,5 m, ω = 6 rad/s, m = 4 kg', async ({ page }) => {
    await configurar(page, 3.5, 6, 4);

    await expect(page.getByText('3,5 m', { exact: true })).toBeVisible();
    await expect(page.getByText('6,0 rad/s', { exact: true })).toBeVisible();
    await expect(page.getByText('4,0 kg', { exact: true })).toBeVisible();

    await expect(magnitud(page, 'ω')).toHaveText('6,00');
    await expect(magnitud(page, 'v tangencial')).toHaveText('21,00'); // v = ω·r = 6 · 3,5
    await expect(magnitud(page, 'Aceleración centrípeta')).toHaveText('126,00'); // a_c = 36 · 3,5 (= v²/r = 441/3,5)
    await expect(magnitud(page, 'Fuerza centrípeta')).toHaveText('504,00'); // F_c = 4 · 126
    await expect(magnitud(page, 'Período \\(T\\)')).toHaveText('1,05'); // T = 2π/6 = 1,0471976
    await expect(magnitud(page, 'Frecuencia \\(f\\)')).toHaveText('0,955'); // f = 6/2π = 0,9549297 (= 1/T)
  });

  test('CASO B (límite) — tope de ω con radio y masa en su mínimo, y el tope por teclado', async ({
    page,
  }) => {
    await configurar(page, 0.5, 10, 0.1);
    expect(await valorSlider(page, RADIO)).toBe('0.5');
    expect(await valorSlider(page, OMEGA)).toBe('10');
    expect(await valorSlider(page, MASA)).toBe('0.1');

    await expect(magnitud(page, 'v tangencial')).toHaveText('5,00'); // v = 10 · 0,5
    await expect(magnitud(page, 'Aceleración centrípeta')).toHaveText('50,00'); // a_c = 100 · 0,5
    await expect(magnitud(page, 'Fuerza centrípeta')).toHaveText('5,00'); // F_c = 0,1 · 50
    await expect(magnitud(page, 'Período \\(T\\)')).toHaveText('0,63'); // T = 2π/10
    await expect(magnitud(page, 'Frecuencia \\(f\\)')).toHaveText('1,592'); // f = 10/2π

    // El mismo tope, alcanzado con el teclado: es la vía de quien no usa ratón.
    const deslizadorOmega = page.locator('input[type="range"]').nth(OMEGA);
    await deslizadorOmega.focus();
    await page.keyboard.press('ArrowRight');
    expect(await deslizadorOmega.inputValue(), 'el tope no puede rebasarse con el teclado').toBe('10');
    await page.keyboard.press('ArrowLeft');
    expect(await deslizadorOmega.inputValue()).toBe('9.9');
    await expect(magnitud(page, 'v tangencial')).toHaveText('4,95'); // v = 9,9 · 0,5
  });

  test('CASO C (rechazo) — el corrector de los casos suspende lo imposible, tecleado a mano', async ({
    page,
  }) => {
    await esperarHidratacion(page, [CAMPO_CASOS]);

    // Caso 2: a_c = ω²·r = 4² · 0,5 = 8 m/s². Tolerancia = 1 % = 0,08.
    await page.getByRole('button', { name: /^Caso 2:/ }).click();
    expect(await responderTecleando(page, '2')).toContain('No es correcto'); // olvidar el cuadrado
    expect(await responderTecleando(page, '-8')).toContain('No es correcto'); // módulo negativo
    expect(await responderTecleando(page, '0')).toContain('No es correcto');
    expect(await responderTecleando(page, '8')).toContain('¡Correcto!');

    // Caso 6: f = 6 vueltas/60 s = 0,1 Hz. Es el valor más pequeño de los doce, donde la
    // tolerancia mínima de 0,01 equivale al 10 %: si una tolerancia relativa fuera a dejar
    // pasar lo imposible, sería aquí.
    await page.getByRole('button', { name: /^Caso 6:/ }).click();
    expect(await responderTecleando(page, '0')).toContain('No es correcto');
    expect(await responderTecleando(page, '-0,1')).toContain('No es correcto');
    expect(await responderTecleando(page, '0,1')).toContain('¡Correcto!');

    // Y nunca un «NaN» en pantalla, ni con algo que no es un número.
    expect(await responderTecleando(page, 'cero coma uno')).toContain('Escribe un número');
    await expect(veredictoCasos(page)).not.toContainText('NaN');
  });

  test('práctica — los ejercicios aleatorios varían y se corrigen con la misma física', async ({
    page,
  }) => {
    await esperarHidratacion(page, [CAMPO_CASOS]);
    const enunciado = page.locator('[class*="casoEnunciado"]');
    const vistos = new Set<string>();

    for (let i = 0; i < 5; i++) {
      await page.getByRole('button', { name: /Practicar/ }).click();
      const texto = ((await enunciado.textContent()) ?? '').trim();
      vistos.add(texto);

      // Se resuelve el enunciado POR SEPARADO, con aritmética escrita aquí, no llamando al
      // módulo de la app: si la app se equivocara, llamarla se equivocaría igual.
      const giro = texto.match(/gira a ([\d,]+) rad\/s en una circunferencia de ([\d,]+) m de radio/);
      expect(giro, texto).not.toBeNull();
      const omega = Number(giro![1].replace(',', '.'));
      const radio = Number(giro![2].replace(',', '.'));
      const kg = texto.match(/Un objeto de ([\d,]+) kg/);
      const masa = kg ? Number(kg[1].replace(',', '.')) : NaN;

      const etiqueta = ((await page.locator('[class*="casoLabel"]').textContent()) ?? '').trim();
      const esperado = etiqueta.startsWith('v')
        ? omega * radio
        : etiqueta.startsWith('a_c')
          ? omega * omega * radio
          : masa * omega * omega * radio;
      expect(Number.isFinite(esperado), texto).toBe(true);

      const redondeado = (Math.round(esperado * 100) / 100).toString().replace('.', ',');
      expect(await responderTecleando(page, redondeado), texto).toContain('¡Correcto!');
    }

    // Reproducible no es variado: cinco tiradas seguidas no pueden dar siempre lo mismo.
    expect(vistos.size).toBeGreaterThan(1);
  });

  /* ── Los tres hallazgos del 22/09/2026, cada uno con su caso ──────────────────────── */

  test('1209 (regresión) — la sección no promete comprobar los casos con los deslizadores', async ({
    page,
  }) => {
    await esperarHidratacion(page, [CAMPO_CASOS]);

    /*
      ⚠️ 22/09/2026 — este testigo pedía que el corrector aceptara el 9,30 que el panel imprime
      al poner el deslizador en 3,1, y esa no puede ser la reparación: la respuesta del caso 7 es
      9,42 m/s (ω = 2π·0,5 = π, r = 3), así que darle por bueno un 9,30 es un 1,3 % de error
      aceptado en un ejercicio de física, es decir dejar de corregir. Y con el caso 12 ni eso
      valdría: pide r = 0,4 m y ω = 12,57 rad/s, los dos FUERA del dominio de los controles
      (0,5-5 y 0-10), así que la promesa no se puede cumplir ni afinando el paso.

      Lo que se repara es la PROMESA. Los deslizadores van de 0,1 en 0,1 y sirven para ver cómo
      responde el movimiento; los casos se resuelven con las fórmulas. Dicho así, el alumno ya
      no concluye que la app se contradice consigo misma.
    */
    const intro = page.locator('[class*="casosIntro"]');
    await expect(intro).not.toContainText('comprobar cada resultado moviendo los deslizadores');
    await expect(intro).toContainText('de 0,1 en 0,1');
    await expect(intro).toContainText('se corrigen contra el valor exacto');

    // Y el corrector sigue siendo exigente donde debe: la respuesta del caso 7 es 9,42, y el
    // 9,30 que sale del deslizador redondeado NO se da por bueno.
    await page.getByRole('button', { name: /^Caso 7:/ }).click();
    expect(await responderTecleando(page, '9,42')).toContain('¡Correcto!');
    expect(await responderTecleando(page, '9,30')).toContain('No es correcto');
  });

  test('1210 (regresión) — en modo «Practicar» no se ofrece un botón de pista sin pista', async ({
    page,
  }) => {
    await esperarHidratacion(page, [CAMPO_CASOS]);
    const pista = page.getByRole('button', { name: /pista/ });
    const cajaPista = page.locator('[class*="casoPista"]');

    // En un caso FIJO el botón cumple: se despliega y aparece la pista.
    await page.getByRole('button', { name: /^Caso 3:/ }).click();
    await pista.click();
    await expect(pista).toHaveAttribute('aria-expanded', 'true');
    await expect(cajaPista).toBeVisible();

    /*
      ⚠️ 22/09/2026 — el testigo pedía que en el modo aleatorio apareciera una pista, y se elige
      la otra salida que el acta dejaba abierta: no ofrecer el control. El ejercicio lo genera
      `generarEjercicioAleatorio`, cuyo tipo `Ejercicio` no tiene el campo, así que inventarle
      una pista sería escribir contenido nuevo en vez de cerrar el hueco. Un control de
      despliegue no se ofrece cuando no hay nada que desplegar, y eso es lo que arregla el
      anuncio falso del lector de pantalla.
    */
    await page.getByRole('button', { name: /Practicar/ }).click();
    await expect(page.getByRole('button', { name: /pista/ })).toHaveCount(0);
    await expect(cajaPista).toHaveCount(0);
    // La solución sí sigue estando, que es lo que el modo práctica ofrece de verdad.
    await expect(page.getByRole('button', { name: /solución/ })).toHaveCount(1);
  });

  test('1211 (regresión) — la tolerancia es simétrica en su borde exacto', async () => {
    // El caso 6 vale 0,1 Hz y su tolerancia es el mínimo de 0,01 (el 10 % del valor).
    expect(toleranciaDe(0.1)).toBe(0.01);

    /*
      ⚠️ 22/09/2026 (1211) — la comparación decidía por el ±1 ulp de la resta en binario:
      0,11 − 0,1 da 0,009999999999999995 (dentro) y 0,1 − 0,09 da 0,010000000000000009 (fuera),
      así que la misma desviación se aceptaba por arriba y se rechazaba por abajo, con un mensaje
      que cifraba la desviación igual que la tolerancia.
    */
    expect(comprobarRespuesta(0.11, 0.1).correcto, '+0,01').toBe(true);
    expect(comprobarRespuesta(0.09, 0.1).correcto, '−0,01, la misma desviación').toBe(true);

    // El otro caso del acta: a_c = 8 con tolerancia 0,08 (8,08 − 8 = 0,08000000000000007).
    expect(toleranciaDe(8)).toBeCloseTo(0.08, 10);
    expect(comprobarRespuesta(8.08, 8).correcto).toBe(true);
    expect(comprobarRespuesta(7.92, 8).correcto).toBe(true);

    // Y el margen NO relaja la tolerancia: lo que está de verdad fuera sigue fuera.
    expect(comprobarRespuesta(0.12, 0.1).correcto).toBe(false);
    expect(comprobarRespuesta(8.2, 8).correcto).toBe(false);
  });

  test('1212 (regresión) — generar otro ejercicio de práctica se anuncia', async ({ page }) => {
    await esperarHidratacion(page, [CAMPO_CASOS]);

    /*
      ⚠️ 22/09/2026 (1212) — estando ya en modo práctica, volver a pulsar «Practicar» generaba
      otro ejercicio y nada lo anunciaba: el botón lleva `aria-pressed`, que ya valía true y
      seguía valiendo true, y dentro de la sección no había ninguna región viva salvo el
      veredicto, que solo existe después de comprobar. Quien usa lector de pantalla no se
      enteraba de que el enunciado había cambiado.
    */
    await page.getByRole('button', { name: /Practicar/ }).click();
    const enunciado = page.locator('[class*="casoEnunciado"]');
    await expect(enunciado).toHaveAttribute('aria-live', 'polite');
    await expect(enunciado).toHaveAttribute('aria-atomic', 'true');
    /*
      Y NO `role="status"`, que fue la primera versión de esta reparación: un enunciado de
      ejercicio no es un mensaje de estado, y el role añade un landmark que compite con los que la
      app ya tenga. En `simulador-fotografia` rompió nueve tests de golpe —su medidor de exposición
      ES un `role="status"` y el localizador de su spec pasó a encontrar dos—, y lo cazó la suite
      entera, que es para lo que se corre. El anuncio lo hace `aria-live`.
    */
    await expect(enunciado).not.toHaveAttribute('role', 'status');

    // Y el enunciado cambia de verdad al volver a pulsar, que es lo que hay que anunciar.
    const vistos = new Set<string>();
    for (let i = 0; i < 6; i++) {
      vistos.add(((await enunciado.textContent()) ?? '').trim());
      await page.getByRole('button', { name: /Practicar/ }).click();
    }
    expect(vistos.size, 'seis tiradas no pueden dar siempre el mismo enunciado').toBeGreaterThan(1);
  });
});

/* ═══════════════════════════════════════════════════════════════════════════════════════
 * RE-INSPECCIÓN 28/09/2026 — Inspector (1.675 usos en 30 días)
 *
 * Lo que cambió desde el 22/09: la tolerancia del corrector (12829fc3), el enunciado con
 * aria-live sin role="status" (d0ff643d) y, el 27/09, el `@media (max-width: 768px)` que da
 * 80 px al hero para que el logo fijo no tape el título (586a4d61). Los 13 hallazgos de la
 * base (167-170, 540-544, 1209-1212) siguen reparados: el spec entero en verde y, a mano en
 * el navegador, 1209 (intro y caso 7: 9,42 ✔ · 9,30 ✘), 1210 (0 botones de pista en
 * práctica), 1211 (caso 6: 0,11 y 0,09 ✔ · 0,12 y 0,08 ✘; caso 2: 8,08 y 7,92 ✔) y 1212
 * (aria-live="polite", aria-atomic, sin role).
 *
 * LOS CASOS, RESUELTOS A MANO ANTES DE ABRIR EL NAVEGADOR
 * (convenio de la app: ω en rad/s · v = ω·r · a_c = ω²·r · F_c = m·a_c · T = 2π/ω · f = ω/2π)
 *
 *   CASO N1 (normal) — r = 1,6 m · ω = 7,5 rad/s · m = 0,8 kg (terna que nadie había pedido)
 *       v   = 7,5 · 1,6      = 12 m/s                  → «12,00»
 *       a_c = 56,25 · 1,6    = 90 m/s²                 → «90,00»  (v²/r = 144/1,6 = 90 ✔)
 *       F_c = 0,8 · 90       = 72 N                    → «72,00»
 *       T   = 2π/7,5         = 0,8377580 s             → «0,84»
 *       f   = 7,5/2π         = 1,1936621 Hz            → «1,194»  (T·f = 1 ✔)
 *   CASO N2 (normal, ω pequeña, donde el redondeo ya pesa) — r = 4,7 · ω = 0,3 · m = 3,3
 *       v   = 0,3 · 4,7      = 1,41 m/s                → «1,41»
 *       a_c = 0,09 · 4,7     = 0,423 m/s²              → «0,42»   (1,41²/4,7 = 1,9881/4,7 ✔)
 *       F_c = 3,3 · 0,423    = 1,3959 N                → «1,40»
 *       T   = 2π/0,3         = 20,943951 s             → «20,94»
 *       f   = 0,3/2π         = 0,0477465 Hz            → «0,048»
 *
 *   CASO L (límite) — MCUA desde el REPOSO con radio y masa en su máximo:
 *       r = 5 m · ω₀ = 0 rad/s · m = 5 kg, modo MCNU (α = 0,5 rad/s²)
 *       En MCU, con ω = 0: T = 2π/0 → «∞».
 *       En MCNU, ω(t) = ω₀ + α·t = 0,5·t; a los ~4 s: ω ≈ 2 rad/s → v = 10 m/s,
 *       a_c = 4 · 5 = 20 m/s², F_c = 5 · 20 = 100 N, T = 2π/2 = π = 3,14 s.
 *       (Medido: a los 4,04 s el panel daba 2,00 · 10,00 · 20,00 · 100,00 · 3,14 · 0,318.)
 *       a_t = α·r = 0,5 · 5 = 2,5 m/s², que no va en el panel pero sí en canvas y leyenda.
 *
 *   CASO R (rechazo) — el error clásico del tema en el caso 11 (45 vueltas por minuto):
 *       ω = 2π · 45/60 = 1,5π = 4,7123890 → respuesta 4,71; tolerancia = máx(0,01; 1 % de
 *       4,71) = 0,0471.
 *       «45»    → rpm tomadas por rad/s: suspende, «Te has desviado 40,29» (45 − 4,71)
 *       «270»   → 45 rpm en GRADOS por segundo (45·360/60): suspende
 *       «4,76» y «4,66» → desviados 0,05 > 0,0471 por los dos lados: suspenden los dos
 *       «4,712» → correcto · «4,71 rad/s» (con la unidad) → «Escribe un número»
 *
 *   CASOS DE AULA, resueltos a mano (no copiados de la app)
 *       caso 8  · v = 6, r = 3        → ω = 2 → a_c = 2²·3 = 12 m/s² (= v²/r = 36/3)
 *                 «2» (se queda en ω) y «36» (v² sin dividir) suspenden
 *       caso 10 · v = 4, r = 2, m = 0,5 → ω = 2 → a_c = 8 → F_c = 0,5·8 = 4 N
 *                 «8» (olvidar la masa) y «2» (F = m·v) suspenden
 *       caso 12 · T = 0,5, r = 0,4    → ω = 2π/0,5 = 12,566371 → v = 5,0265482 → 5,03 m/s
 *                 «0,8» (= r/T, olvidar el 2π) suspende
 *
 * HALLAZGOS 2380-2382 (inspector 28/09/2026), REPARADOS el mismo día — estaban con
 * test.fail() al final del bloque; ahora sujetan la reparación como regresión.
 *   · 2380: logo fijo sobre el <h1> entre 769 y ~1000 px (iPad vertical: 810-834 px). Lo
 *     reparó el coordinador en lote (a1d72a9c): los 80 px del hero llegan hasta 1023 px.
 *   · 2381: texto blanco sobre var(--primary) en los botones activos, «Comprobar» y los
 *     números de la guía → fondo var(--primary-boton), 5,47:1 en los dos temas. Al reparar
 *     salió otro del mismo sitio: con el ratón encima del modo activo el rótulo tomaba el
 *     color del fondo (1:1); ahora `.modeBtnActive:hover` lo mantiene en blanco.
 *   · 2382: colores de marca como TEXTO pequeño en claro (título del caso 2,68:1) →
 *     var(--primary-texto) / var(--secondary-texto).
 *
 * SOSPECHA, confirmada y REPARADA (28/09/2026): en MCNU, al llegar a 20 rad/s ω volvía a 0 y
 * no a la ω₀ del deslizador (con ω₀ = 10, a los 20,2 s el panel daba 0,10 rad/s y un segundo
 * después 0,57, mientras el deslizador seguía en «10,0 rad/s»). Desde la segunda vuelta del
 * ciclo ω = ω₀ + α·t, la ley que la propia tabla enseña, dejaba de describir lo que se veía.
 * ═══════════════════════════════════════════════════════════════════════════════════════ */

/** Letras del <h1> que quedan debajo de la barra fija de MeskeiaLogo (logo o botón de tema). */
async function letrasTapadasDelTitulo(page: Page): Promise<string> {
  return page.evaluate(() => {
    const barra = document.querySelector('[class*="headerBar"]');
    const cajas = Array.from(barra?.children ?? []).map((h) => h.getBoundingClientRect());
    const texto = document.querySelector('h1')!.firstChild as Text;
    let tapadas = '';
    for (let i = 0; i < texto.length; i++) {
      const rango = document.createRange();
      rango.setStart(texto, i);
      rango.setEnd(texto, i + 1);
      const l = rango.getBoundingClientRect();
      const bajoLaBarra = cajas.some(
        (c) =>
          Math.min(c.right, l.right) - Math.max(c.left, l.left) > 0 &&
          Math.min(c.bottom, l.bottom) - Math.max(c.top, l.top) > 0,
      );
      if (bajoLaBarra) tapadas += texto.data[i];
    }
    return tapadas;
  });
}

/** Contraste WCAG del texto de `selector` contra su fondo efectivo (capas con alfa mezcladas). */
async function contrasteDe(page: Page, selector: string): Promise<number> {
  return page.evaluate((sel) => {
    type Rgba = { r: number; g: number; b: number; a: number };
    const leer = (s: string): Rgba | null => {
      const m = s.match(/rgba?\(([^)]+)\)/);
      if (!m) return null;
      const p = m[1].split(',').map((x) => parseFloat(x));
      return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
    };
    const sobre = (fg: Rgba, bg: Rgba): Rgba => ({
      r: fg.r * fg.a + bg.r * (1 - fg.a),
      g: fg.g * fg.a + bg.g * (1 - fg.a),
      b: fg.b * fg.a + bg.b * (1 - fg.a),
      a: 1,
    });
    const lum = (c: Rgba) => {
      const f = (v: number) => {
        const x = v / 255;
        return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
      };
      return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
    };
    const el = document.querySelector(sel) as HTMLElement;
    const capas: Rgba[] = [];
    let n: HTMLElement | null = el;
    while (n) {
      const c = leer(getComputedStyle(n).backgroundColor);
      if (c && c.a > 0) capas.push(c);
      if (c && c.a === 1) break;
      n = n.parentElement;
    }
    let fondo: Rgba = { r: 255, g: 255, b: 255, a: 1 };
    for (let i = capas.length - 1; i >= 0; i--) fondo = sobre(capas[i], fondo);
    const texto = sobre(leer(getComputedStyle(el).color)!, fondo);
    const [a, b] = [lum(texto), lum(fondo)];
    return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
  }, selector);
}

test.describe('Inspector 28/09/2026 — re-inspección tras los casos de aula y el arreglo del logo', () => {
  const CAMPO = '#casos-respuesta';
  const veredictoCasos = (page: Page) => page.locator('[class*="casoVeredicto"]');

  /** Teclea la respuesta carácter a carácter, comprueba y devuelve el veredicto. */
  async function responder(page: Page, texto: string): Promise<string> {
    const campo = page.locator(CAMPO);
    await campo.click();
    await campo.press('Control+a');
    await campo.press('Delete');
    await campo.pressSequentially(texto, { delay: 15 });
    expect(await campo.inputValue()).toBe(texto);
    await page.getByRole('button', { name: 'Comprobar' }).click();
    await expect(veredictoCasos(page)).toBeVisible();
    return ((await veredictoCasos(page).textContent()) ?? '').trim();
  }

  test('CASO N1 y N2 (normal) — dos ternas nuevas, una con ω pequeña', async ({ page }) => {
    await configurar(page, 1.6, 7.5, 0.8);
    await expect(magnitud(page, 'ω')).toHaveText('7,50');
    await expect(magnitud(page, 'v tangencial')).toHaveText('12,00'); // 7,5 · 1,6
    await expect(magnitud(page, 'Aceleración centrípeta')).toHaveText('90,00'); // 7,5² · 1,6 = 144/1,6
    await expect(magnitud(page, 'Fuerza centrípeta')).toHaveText('72,00'); // 0,8 · 90
    await expect(magnitud(page, 'Período \\(T\\)')).toHaveText('0,84'); // 2π/7,5 = 0,837758
    await expect(magnitud(page, 'Frecuencia \\(f\\)')).toHaveText('1,194'); // 7,5/2π = 1,193662

    await configurar(page, 4.7, 0.3, 3.3);
    await expect(magnitud(page, 'ω')).toHaveText('0,30');
    await expect(magnitud(page, 'v tangencial')).toHaveText('1,41'); // 0,3 · 4,7
    await expect(magnitud(page, 'Aceleración centrípeta')).toHaveText('0,42'); // 0,09 · 4,7 = 0,423
    await expect(magnitud(page, 'Fuerza centrípeta')).toHaveText('1,40'); // 3,3 · 0,423 = 1,3959
    await expect(magnitud(page, 'Período \\(T\\)')).toHaveText('20,94'); // 2π/0,3 = 20,943951
    await expect(magnitud(page, 'Frecuencia \\(f\\)')).toHaveText('0,048'); // 0,3/2π = 0,0477465
  });

  test('CASO L (límite) — MCUA desde el reposo: ω₀ = 0, r = 5 m, m = 5 kg', async ({ page }) => {
    await configurar(page, 5, 0, 5);
    await expect(magnitud(page, 'Período \\(T\\)')).toHaveText('∞'); // MCU con ω = 0: 2π/0

    const inicio = Date.now();
    await page.getByRole('button', { name: /^MCNU/ }).click();
    await expect(page.getByRole('button', { name: /^MCNU/ })).toHaveAttribute('aria-pressed', 'true');
    await page.waitForTimeout(4000);
    const foto = await fotoPanel(page);
    const transcurrido = (Date.now() - inicio) / 1000;
    const w = foto['ω'];

    // ω = ω₀ + α·t = 0,5·t. No puede ir POR DELANTE del reloj (el bucle solo frena, con su
    // dt ≤ 50 ms), y se le deja un 25 % por detrás para el arranque y el refresco a ~10 Hz.
    expect(w, `ω = 0,5·t con t = ${transcurrido} s`).toBeLessThanOrEqual(0.5 * transcurrido + 0.05);
    expect(w, `ω = 0,5·t con t = ${transcurrido} s`).toBeGreaterThan(0.5 * transcurrido * 0.75);

    // Coherencia con la ω que enseña el propio panel (r = 5, m = 5), con la tolerancia que
    // sale de propagar el redondeo a 2 decimales de ω (±0,005) más el de la propia cifra.
    const r = 5;
    const m = 5;
    const dW = 0.005;
    expect(Math.abs(foto['v tangencial'] - w * r)).toBeLessThanOrEqual(r * dW + 0.01);
    expect(Math.abs(foto['Aceleración centrípeta'] - w * w * r)).toBeLessThanOrEqual(2 * w * r * dW + 0.01);
    expect(Math.abs(foto['Fuerza centrípeta'] - m * w * w * r)).toBeLessThanOrEqual(2 * m * w * r * dW + 0.01);
    expect(Math.abs(foto['Período (T)'] - (2 * Math.PI) / w)).toBeLessThanOrEqual(((2 * Math.PI) / (w * w)) * dW + 0.01);

    // Y lo que el MCNU añade: a_t en la leyenda y el aviso del ciclo con sus dos cifras.
    await expect(page.locator('[class*="legend"]').first()).toContainText('Vector aceleración tangencial (a_t)');
    const aviso = page.locator('[class*="avisoCiclo"]');
    await expect(aviso).toContainText('0,5 rad/s²');
    await expect(aviso).toContainText('20 rad/s');
    await expect(page.locator('body')).not.toContainText('NaN');
  });

  test('CASO R (rechazo) — caso 11: las rpm tomadas por rad/s se suspenden', async ({ page }) => {
    await esperarHidratacion(page, [CAMPO]);
    await page.getByRole('button', { name: /^Caso 11:/ }).click();
    // ω = 2π·45/60 = 4,712389 → 4,71; tolerancia 0,0471.
    expect(await responder(page, '45')).toContain('Te has desviado 40,29'); // 45 − 4,71
    expect(await responder(page, '270')).toContain('No es correcto'); // 45 rpm en grados/s
    expect(await responder(page, '4,76')).toContain('No es correcto'); // +0,05 > 0,0471
    expect(await responder(page, '4,66')).toContain('No es correcto'); // −0,05, igual de fuera
    expect(await responder(page, '4,71 rad/s')).toContain('Escribe un número');
    expect(await responder(page, '4,712')).toContain('¡Correcto!');
    expect(await responder(page, '4,71')).toContain('¡Correcto!');
  });

  test('casos de aula 8, 10 y 12 — la respuesta que la app da por buena, resuelta a mano', async ({ page }) => {
    await esperarHidratacion(page, [CAMPO]);

    await page.getByRole('button', { name: /^Caso 8:/ }).click();
    expect(await responder(page, '12')).toContain('¡Correcto!'); // ω = 6/3 = 2 → 2²·3
    expect(await responder(page, '2')).toContain('No es correcto'); // se queda en ω
    expect(await responder(page, '36')).toContain('No es correcto'); // v² sin dividir entre r

    await page.getByRole('button', { name: /^Caso 10:/ }).click();
    expect(await responder(page, '4')).toContain('¡Correcto!'); // ω = 2 → a_c = 8 → 0,5·8
    expect(await responder(page, '8')).toContain('No es correcto'); // olvidar la masa
    expect(await responder(page, '2')).toContain('No es correcto'); // F = m·v

    await page.getByRole('button', { name: /^Caso 12:/ }).click();
    expect(await responder(page, '5,03')).toContain('¡Correcto!'); // 2π/0,5 · 0,4 = 5,0265
    expect(await responder(page, '0,8')).toContain('No es correcto'); // r/T, sin el 2π
    await page.getByRole('button', { name: /Ver solución/ }).click();
    const solucion = page.locator('[class*="casoSolucion"]');
    await expect(solucion).toContainText('12,5664 rad/s');
    await expect(solucion).toContainText('Respuesta: 5,03 m/s');
  });

  test.describe('en móvil (390 px)', () => {
    test.use({
      viewport: { width: 390, height: 844 },
      userAgent:
        'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Mobile Safari/537.36',
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true,
    });

    test('sin desbordes, panel a dos columnas, título libre y el corrector funciona', async ({ page }) => {
      // El beforeEach del fichero fija 1280 px: se vuelve a 390 y se recarga.
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(RUTA);
      await esperarHidratacion(page, ['input[type="range"]', CAMPO]);

      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
      const columnas = await page
        .locator('[class*="valuesPanel"]')
        .evaluate((el) => getComputedStyle(el).gridTemplateColumns.split(' ').length);
      expect(columnas).toBe(2);
      expect(await letrasTapadasDelTitulo(page), 'el logo no debe tapar el título a 390 px').toBe('');

      expect(await responder(page, '6')).toContain('¡Correcto!'); // caso 1: 3 · 2
    });
  });

  test('el arreglo del 27/09 sigue puesto: a 390 y 768 px el logo no tapa el título', async ({ page }) => {
    for (const ancho of [390, 768, 1280]) {
      await page.setViewportSize({ width: ancho, height: 900 });
      await page.waitForTimeout(150);
      expect(await letrasTapadasDelTitulo(page), `${ancho} px`).toBe('');
    }
  });

  /* ── Hallazgos del 28/09/2026, REPARADOS el mismo día ────────────────────────────── */

  test('2380 (regresión) — a 800 y 834 px (iPad vertical) el logo fijo no tapa el título', async ({ page }) => {
    // REPARADO (28/09/2026, a1d72a9c, en lote por el coordinador): el arreglo del 27/09
    // (586a4d61) daba 80 px al hero solo con `@media (max-width: 768px)`, y MeskeiaLogo pasa a
    // su tamaño de escritorio a partir de 769 px (barra con 15 px de margen y píldora de 62 px
    // de alto: [20,15,203,77]). Por encima de 768 el hero volvía a su padding de 2,5rem (40 px)
    // y el <h1>, centrado, empezaba en x = 142 a 800 px y en x = 148 a 834 px, bajo el logo.
    // Caso: viewport 800 px → esperado «» tapado · obtenido entonces «Sim» (61×38 px de solape
    // con la línea del título); a 834 px → «Sim» (55×38 px). Ahora los 80 px llegan a 1023 px.
    // Bajo stemum.com la píldora «Stemum › Física» mide 212 px: eso no se puede medir en local
    // (no hay proxy de stemum), así que este test cubre solo meskeia.com.
    for (const ancho of [800, 834]) {
      await page.setViewportSize({ width: ancho, height: 900 });
      await page.waitForTimeout(150);
      expect(await letrasTapadasDelTitulo(page), `${ancho} px`).toBe('');
    }
  });

  test('2381 (regresión) — texto blanco sobre el azul de marca en los botones activos (≥ 4,5:1)', async ({ page }) => {
    // REPARADO (28/09/2026): .modeBtnActive, .casoBotonActivo, .casoComprobar, .stepNumber de
    // la guía y el :hover de «Ver pista»/«Ver solución» pintaban texto blanco sobre
    // var(--primary). Son 13,6-16 px con peso 400-700: texto pequeño, umbral 4,5:1. Caso: carga
    // en claro → obtenido 4,11:1 en los tres botones; en oscuro, donde --primary vale #3FA5D1,
    // 2,79:1 (también el «Practicar» activo). Ahora el fondo es var(--primary-boton), #26718F
    // en los dos temas: 5,47:1.
    //
    // Se mide cada estado en los DOS temas: el oscuro era el peor, y un arreglo que solo
    // tocara el claro dejaría «Comprobar» —el botón principal de la sección— a 2,79:1.
    const PUNTOS = [
      'button[class*="modeBtnActive"]',
      'button[class*="casoBotonActivo"]', // el caso 1, activo al cargar
      'button[class*="casoComprobar"]',
      'span[class*="stepNumber"]', // los círculos numerados de la guía
    ];
    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
    await expect(page.locator('span[class*="stepNumber"]').first()).toBeVisible();

    for (const tema of ['claro', 'oscuro'] as const) {
      if (tema === 'oscuro') {
        await page.getByRole('button', { name: 'Cambiar a modo oscuro' }).click();
        await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
      }
      await page.getByRole('button', { name: /^Caso 1:/ }).click();
      await page.mouse.move(0, 0);
      await page.waitForTimeout(500); // transiciones de color de 0,15-0,2 s
      for (const s of PUNTOS) expect(await contrasteDe(page, s), `${tema} · ${s}`).toBeGreaterThanOrEqual(4.5);

      // El :hover de «Ver pista» también pone blanco sobre la marca.
      await page.getByRole('button', { name: /Ver pista/ }).hover();
      await page.waitForTimeout(300);
      expect(await contrasteDe(page, 'button[class*="casoAyudaBoton"]'), `${tema} · «Ver pista» con el ratón encima`)
        .toBeGreaterThanOrEqual(4.5);

      // Visto al reparar: con el ratón encima del modo ACTIVO, `.modeBtn:hover` (dos clases)
      // le ganaba a `.modeBtnActive` (una) y pintaba el rótulo del color del fondo: 1:1 en
      // claro, el texto desaparecía. Ahora `.modeBtnActive:hover` mantiene el blanco.
      await page.locator('button[class*="modeBtnActive"]').hover();
      await page.waitForTimeout(300);
      expect(await contrasteDe(page, 'button[class*="modeBtnActive"]'), `${tema} · modo activo con el ratón encima`)
        .toBeGreaterThanOrEqual(4.5);

      // Y «Practicar» cuando está activo, que es el mismo .casoBotonActivo en otro botón.
      await page.getByRole('button', { name: /Practicar/ }).click();
      await expect(page.getByRole('button', { name: /Practicar/ })).toHaveAttribute('aria-pressed', 'true');
      await page.mouse.move(0, 0);
      await page.waitForTimeout(500);
      expect(await contrasteDe(page, 'button[class*="casoBotonActivo"]'), `${tema} · «Practicar» activo`)
        .toBeGreaterThanOrEqual(4.5);
    }
  });

  test('2382 (regresión) — los colores de marca como texto pequeño se leen (≥ 4,5:1) en los dos temas', async ({ page }) => {
    // REPARADO (28/09/2026): el módulo usaba --secondary y --primary como COLOR de texto
    // pequeño, en lugar de --secondary-texto / --primary-texto. Caso: carga en claro, caso 1 →
    // título del caso (.casoTitulo, #48A9A6 sobre #FAFAFA, 17,6 px/600) obtenido 2,68:1; valor
    // de cada deslizador («2,0 m», .sliderValue, 14 px/700) 3,93:1; «Ver pista» (.casoAyudaBoton,
    // 14,4 px/400) 3,93:1; en la guía, los h4 de escenarios y los <dt> de la FAQ, 4,11:1.
    // Ahora 4,94:1 el título (#327874) y 5,24-5,47:1 el resto (#26718F) en claro. En oscuro
    // los -texto valen lo mismo que la marca (#3FA5D1 / #5ABDB9), que ya cumplía: se mide igual
    // para que un -texto que se oscureciera allí no pase en silencio.
    const PUNTOS = [
      'h3[class*="casoTitulo"]',
      'span[class*="sliderValue"]',
      'button[class*="casoAyudaBoton"]',
      '[class*="scenarioCard"] h4',
      '[class*="faqItem"] dt',
    ];
    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
    await expect(page.locator('[class*="faqItem"] dt').first()).toBeVisible();
    await page.mouse.move(0, 0);

    for (const tema of ['claro', 'oscuro'] as const) {
      if (tema === 'oscuro') {
        await page.getByRole('button', { name: 'Cambiar a modo oscuro' }).click();
        await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
        await page.mouse.move(0, 0);
        await page.waitForTimeout(500);
      }
      for (const s of PUNTOS) expect(await contrasteDe(page, s), `${tema} · ${s}`).toBeGreaterThanOrEqual(4.5);
    }
  });

  test('sospecha reparada — en MCNU, al pasar de 20 rad/s, ω vuelve a la ω₀ del deslizador y no a 0', async ({
    page,
  }) => {
    // REPARADO (28/09/2026). Caso: ω₀ = 10 rad/s en el deslizador, MCNU → ω = 10 + 0,5·t, que
    // toca el techo de 20 rad/s a los 20 s. Obtenido entonces: a los 20,2 s el panel daba
    // 0,10 rad/s y un segundo después 0,57, con el deslizador en «10,0 rad/s»: el ciclo
    // volvía a arrancar desde el reposo y ω₀ ya no era la del control. Esperado: vuelve a
    // 10 rad/s, y a t = 21 s el panel da 10 + 0,5·1 = 10,5 rad/s.
    //
    // El reloj de la página (requestAnimationFrame incluido) se adelanta con page.clock:
    // esperar 21 s reales no mediría nada más. Entre llamadas el reloj también corre solo,
    // así que se deja holgura hacia ARRIBA (lo que tarda Playwright entre un paso y otro).
    await page.clock.install();
    await page.reload();
    await esperarHidratacion(page, ['input[type="range"]']);
    await mover(page, OMEGA, 10);
    await expect(page.locator('label[for="slider-omega"]')).toContainText('10,0 rad/s');

    await page.getByRole('button', { name: /^MCNU/ }).click();
    await expect(page.getByRole('button', { name: /^MCNU/ })).toHaveAttribute('aria-pressed', 'true');
    // El aviso dice desde dónde vuelve a empezar, con la cifra del deslizador.
    await expect(page.locator('[class*="avisoCiclo"]')).toContainText('vuelve a empezar desde la ω₀ del deslizador (10,0 rad/s)');

    const omegaDelPanel = async () => (await fotoPanel(page))['ω'];

    // t ≈ 18 s → ω ≈ 19 rad/s, aún por debajo del techo.
    await page.clock.runFor(18_000);
    await expect.poll(omegaDelPanel).toBeGreaterThan(18.5);
    expect(await omegaDelPanel()).toBeLessThan(20);

    // t ≈ 21 s → ha cruzado el techo a los 20 s y ha seguido acelerando 1 s desde ω₀.
    await page.clock.runFor(3_000);
    await expect.poll(omegaDelPanel).toBeLessThan(15); // el ciclo ha vuelto a empezar
    const w = await omegaDelPanel();
    expect(w, 'ω tras el reinicio: 10 + 0,5·1 = 10,5 (con 0 habría dado ~0,5)').toBeGreaterThanOrEqual(10);
    expect(w).toBeLessThan(12.5);
    // Y el deslizador, que no se ha tocado, sigue diciendo la misma ω₀ que ahora describe el panel.
    await expect(page.locator('label[for="slider-omega"]')).toContainText('10,0 rad/s');
  });
});
