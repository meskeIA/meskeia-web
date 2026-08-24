import { test, expect, Page } from '@playwright/test';

/**
 * Inspector — simulador-fotografia (segmento interactiva con motor de exposición)
 *
 * Primera inspección: 24/08/2026 (4 hallazgos). Segunda inspección: 24/08/2026, para
 * VERIFICAR las cuatro reparaciones y comprobar que ninguna rompió otra cosa.
 *
 * QUÉ PROMETE LA APP
 *   <h1> «📷 Simulador de Fotografía» · hero: «Aprende el triángulo de exposición moviendo ISO,
 *   apertura y velocidad. Ve el resultado en tiempo real con bokeh, ruido y motion blur».
 *   Metadata: «Modo libre y modo compensado». Texto del propio modo: «Al mover un parámetro,
 *   los otros se reajustan automáticamente para mantener la exposición correcta». El FAQPage
 *   del JSON-LD lo detalla: «si subes la velocidad de obturación para congelar movimiento, el
 *   simulador muestra cómo debe bajar el número f o subir el ISO para compensar la luz perdida».
 *
 * CONVENIO DE SIGNO (el de la app, y el que se usa aquí)
 *   ΔEV = log₂(ISO/ISO₀) + 2·log₂(N₀/N) + log₂(t/t₀)   respecto a la combinación de la escena.
 *   POSITIVO = más luz = SOBREexpuesto (convenio de fotómetro). Ojo: el EV clásico
 *   EV = log₂(N²/t) va justo al revés, y el pie de la caja de fórmula lo advierte.
 *   Un paso (stop) = ×2 luz = 1 EV, en los tres ejes. Compensar = que la suma se conserve.
 *
 * DÓNDE VIVE EL CÁLCULO
 *   app/simulador-fotografia/page.tsx  (no hay motor.ts; todo está en el componente)
 *     ISO_VALUES      = [100, 200, 400, 800, 1600, 3200, 6400]                  idx 0..6
 *     APERTURE_VALUES = [1,4 · 2 · 2,8 · 4 · 5,6 · 8 · 11 · 16 · 22]            idx 0..8
 *     SHUTTER_VALUES  = [1 · 1/2 · 1/4 · 1/8 · 1/15 · 1/30 · 1/60 · 1/125 ·
 *                        1/250 · 1/500 · 1/1000 · 1/2000 · 1/4000]              idx 0..12
 *     Escenas: Retrato ISO 800 · f/2,8 · 1/125 s   (ISO idx 3 · dia 2 · vel 7)
 *              Paisaje ISO 100 · f/11  · 1/250 s   (0 · 6 · 8)
 *              Deportes ISO 400 · f/4  · 1/1000 s  (2 · 3 · 10)
 *     Efectos: bokehBlur = 14·(1 - apIdx/8) · noiseOpacity = (isoIdx/6)·0,45
 *              motionBlur = min(4·stops más lento que la referencia, 30); la referencia es
 *              1/1000 s en Deportes (se arrastra el sujeto) y 1/125 s en las otras dos
 *              (tiembla la cámara), y ahí el barrido afecta a TODA la imagen.
 *
 * OJO AL PROBARLA A MANO: la escala de velocidades NO es exactamente logarítmica (de 1/8 a
 * 1/15 hay 0,906891 stops, no 1; de 1/60 a 1/125, 1,058894), así que contar muescas NO da el
 * número de stops. Todos los valores de abajo salen de la fórmula, no de contar posiciones.
 *
 * ── ESTADO DE LOS 4 HALLAZGOS DE LA PRIMERA INSPECCIÓN ────────────────────────────────────
 *  1 (alto, cálculo)  Modo compensado con el signo invertido en dos de los tres deslizadores.
 *                     REPARADO Y VERIFICADO: se barrieron los 87 puestos de los tres
 *                     deslizadores en las tres escenas y cada uno coincide con el cálculo a
 *                     mano. Ver CASO 1.
 *  2 (bajo, contenido) Motion blur solo dibujado en Deportes. REPARADO Y VERIFICADO: Retrato
 *                     y Paisaje a 1 s dan stdDeviation 27,863137. Ver CASO 3.
 *  3 (bajo, a11y)     Ningún botón con type="button". REPARADO Y VERIFICADO: 0 sin type.
 *  4 (medio, contenido) La fórmula impresa llevaba el signo contrario al medidor. REPARADA Y
 *                     VERIFICADA: ahora rotula ΔEV y coincide con lo que marca el indicador.
 *
 * ── HALLAZGOS ABIERTOS DE LA SEGUNDA INSPECCIÓN (sus tests son TESTIGOS: fallan hasta que se
 *    reparen; no tocar la app desde aquí) ───────────────────────────────────────────────────
 *  A (medio, operativa) Cuando la compensación topa con el extremo del parámetro compañero, el
 *                     modo compensado deja de mantener la exposición y NO lo dice. En Paisaje
 *                     basta UNA muesca (1/250 → 1/125 s) para irse a +1,0 EV con el ISO ya en
 *                     100. Además solo se mueve UN compañero (velocidad↔ISO), nunca el
 *                     diafragma, aunque le queden pasos: la propia app alcanza el estado bien
 *                     expuesto ISO 100 · f/16 · 1/125 s si el que se arrastra es el diafragma.
 *  B (bajo, contenido) En 6 estados de Deportes el ΔEV sale -4,44·10⁻¹⁶ por redondeo binario y
 *                     formatNumber devuelve «≈0», así que el medidor rotula «Exposición
 *                     correcta (≈0 EV)» donde el resto de la app siempre pone «(+0,0 EV)».
 * ─────────────────────────────────────────────────────────────────────────────────────────
 */

const RUTA = '/simulador-fotografia/';

/** Umbral con el que la propia app declara «Exposición correcta». */
const TOLERANCIA_OK = 0.3;

/**
 * Mueve un deslizador. Un <input type="range"> no acepta fill(), y arrastrar con el ratón no
 * da un índice exacto, así que se escribe con el setter nativo y se dispara el evento input
 * que React escucha. El navegador satura solo fuera de [min, max]: eso es justo lo que el
 * test de saturación quiere observar.
 */
async function mover(page: Page, id: string, valor: number): Promise<void> {
  await page.locator(`#${id}`).evaluate((el, v) => {
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')!.set!;
    setter.call(el, v);
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }, String(valor));
}

/** Texto del indicador de exposición, p. ej. «Exposición correcta (+0,0 EV)». */
function exposicion(page: Page) {
  return page.locator('[role="status"]');
}

/** Valor de una fila del bloque «Efectos en esta foto». */
function efecto(page: Page, etiqueta: string) {
  return page
    .locator('span')
    .filter({ hasText: new RegExp(`^${etiqueta}$`) })
    .first()
    .locator('xpath=following-sibling::span[1]');
}

/** Rótulo del deslizador: «ISO 800», «f/2,8», «1/125 s». */
function rotulo(page: Page, id: string) {
  return page.locator(`label[for="${id}"] span`);
}

/** stdDeviation del filtro de desenfoque de fondo, en unidades del viewBox. */
function desenfoqueFondo(page: Page): Promise<number> {
  return page
    .locator('#bokeh-blur feGaussianBlur')
    .evaluate((el) => parseFloat(el.getAttribute('stdDeviation')!));
}

/** Componente horizontal del barrido; el vertical es siempre 0 (motion blur direccional). */
function desenfoqueMovimiento(page: Page): Promise<number> {
  return page
    .locator('#motion-blur feGaussianBlur')
    .evaluate((el) => parseFloat(el.getAttribute('stdDeviation')!));
}

/**
 * Posición del marcador del medidor, en %. left = 50 + (clamp(ΔEV,-3,3)/3)·50, así que
 * permite leer el ΔEV con más resolución que el rótulo redondeado a una decimal:
 * ΔEV = (left - 50)·3/50. Satura en ±3 EV.
 */
async function evDelMarcador(page: Page): Promise<number> {
  const estilo = await page.locator('[class*="exposureMarker"]').getAttribute('style');
  const coincidencia = String(estilo).match(/left:\s*([-\d.]+)%/);
  return ((parseFloat(coincidencia![1]) - 50) * 3) / 50;
}

/** Devuelve los tres deslizadores a la combinación de referencia de la escena activa. */
async function volverAlPuntoDePartida(page: Page): Promise<void> {
  await page.getByRole('button', { name: /Volver a la combinación correcta/ }).click();
}

async function elegirEscena(page: Page, nombre: string): Promise<void> {
  await page.getByRole('tab', { name: new RegExp(nombre) }).click();
}

async function elegirModo(page: Page, nombre: 'libre' | 'compensado'): Promise<void> {
  const boton = page.getByRole('button', { name: `Modo ${nombre}` });
  await boton.click();
  await expect(boton).toHaveAttribute('aria-pressed', 'true');
}

test.beforeEach(async ({ page }) => {
  await page.goto(RUTA);
  await page.waitForSelector('#iso-slider');
});

/**
 * CASO 1 · NORMAL — el modo compensado conserva la exposición, en los DOS sentidos y en TODO
 * el recorrido. Es la promesa central de la app y el hallazgo alto de la primera inspección.
 *
 * Cuentas (Retrato: ISO 800 · f/2,8 · 1/125 s):
 *   · Diafragma → velocidad. f/2,8 → f/8 quita 2·log₂(2,8/8) = -3,029146 stops; el tiempo debe
 *     devolverlos, y de la escala solo 1/15 s se acerca: log₂((1/15)/(1/125)) = +3,058894.
 *     ΔEV = +0,029747 → «Exposición correcta». (Antes: 1/1000 s y -6,0 EV.)
 *   · ISO → velocidad. ISO 800 → 6400 son +3 stops exactos; el tiempo debe quitar 3:
 *     1/125 → 1/1000 s. ΔEV = 0,000000. (Antes: 1/15 s y +6,1 EV.)
 *   · Velocidad → ISO. 1/125 → 1/1000 s son -3 stops; el ISO debe subir 3: 800 → 6400.
 *     ΔEV = 0,000000.
 *   · f/2,8 → f/1,4 son 2·log₂(2,8/1,4) = +2 stops clavados → 1/125 → 1/500 s, ΔEV = 0,000000.
 */
test('CASO 1 · el modo compensado conserva la exposición en todo el recorrido (Retrato)', async ({
  page,
}) => {
  await expect(rotulo(page, 'iso-slider')).toHaveText('ISO 800');
  await expect(rotulo(page, 'ap-slider')).toHaveText('f/2,8');
  await expect(rotulo(page, 'sh-slider')).toHaveText('1/125 s');
  await expect(exposicion(page)).toHaveText('Exposición correcta (+0,0 EV)');

  await elegirModo(page, 'compensado');

  // (a) DIAFRAGMA → VELOCIDAD, los nueve puestos del recorrido. La columna de la derecha es el
  //     único tiempo de la escala que cabe en ±0,3 EV; los ΔEV son los de la fórmula de arriba.
  const diafragmas: [number, string, string, number][] = [
    [0, 'f/1,4', '1/500 s', 0.0], //  +2,000000 - 2,000000
    [1, 'f/2', '1/250 s', -0.029146], //  +0,970854 - 1,000000
    [2, 'f/2,8', '1/125 s', 0.0], //   0,000000
    [3, 'f/4', '1/60 s', 0.029747], //  -1,029146 + 1,058894
    [4, 'f/5,6', '1/30 s', 0.058894], //  -2,000000 + 2,058894
    [5, 'f/8', '1/15 s', 0.029747], //  -3,029146 + 3,058894
    [6, 'f/11', '1/8 s', 0.017774], //  -3,948010 + 3,965784
    [7, 'f/16', '1/4 s', -0.063362], //  -5,029146 + 4,965784
    [8, 'f/22', '1/2 s', 0.017774], //  -5,948010 + 5,965784
  ];
  for (const [idx, dia, velEsperada, ev] of diafragmas) {
    await volverAlPuntoDePartida(page);
    await mover(page, 'ap-slider', idx);
    await expect(rotulo(page, 'ap-slider')).toHaveText(dia);
    expect(await rotulo(page, 'sh-slider').textContent(), `compensar f/2,8 → ${dia}`).toBe(velEsperada);
    expect(await evDelMarcador(page), `ΔEV tras compensar ${dia}`).toBeCloseTo(ev, 3);
    expect(Math.abs(await evDelMarcador(page))).toBeLessThan(TOLERANCIA_OK);
    await expect(exposicion(page)).toContainText('Exposición correcta');
    // El ISO no se toca: el compañero de diafragma y de ISO es SIEMPRE la velocidad.
    await expect(rotulo(page, 'iso-slider')).toHaveText('ISO 800');
  }

  // (b) ISO → VELOCIDAD, el recorrido entero. Cada duplicación del ISO es +1 stop exacto, así
  //     que el tiempo baja un puesto de la escala «clásica» cada vez.
  const isos: [number, string, string][] = [
    [0, 'ISO 100', '1/15 s'], // -3 stops de ISO → el tiempo debe aportar +3 (1/15 s: +3,058894)
    [1, 'ISO 200', '1/30 s'], // -2 → +2 (1/30 s: +2,058894)
    [2, 'ISO 400', '1/60 s'], // -1 → +1 (1/60 s: +1,058894)
    [3, 'ISO 800', '1/125 s'], //  0
    [4, 'ISO 1600', '1/250 s'], // +1 → -1 exacto
    [5, 'ISO 3200', '1/500 s'], // +2 → -2 exacto
    [6, 'ISO 6400', '1/1000 s'], // +3 → -3 exacto
  ];
  for (const [idx, iso, velEsperada] of isos) {
    await volverAlPuntoDePartida(page);
    await mover(page, 'iso-slider', idx);
    await expect(rotulo(page, 'iso-slider')).toHaveText(iso);
    expect(await rotulo(page, 'sh-slider').textContent(), `compensar ISO 800 → ${iso}`).toBe(velEsperada);
    await expect(exposicion(page)).toContainText('Exposición correcta');
    expect(Math.abs(await evDelMarcador(page))).toBeLessThan(TOLERANCIA_OK);
  }

  // (c) EL SENTIDO CONTRARIO: velocidad → ISO. Solo el tramo con margen de ISO (100..6400);
  //     lo que pasa fuera de él es el CASO 2 y el testigo del hallazgo A.
  const velocidades: [number, string, string][] = [
    [4, '1/15 s', 'ISO 100'], // +3,058894 de tiempo → el ISO debe restar 3 (800 → 100)
    [5, '1/30 s', 'ISO 200'],
    [6, '1/60 s', 'ISO 400'],
    [7, '1/125 s', 'ISO 800'],
    [8, '1/250 s', 'ISO 1600'], // -1 de tiempo → +1 de ISO
    [9, '1/500 s', 'ISO 3200'],
    [10, '1/1000 s', 'ISO 6400'],
  ];
  for (const [idx, vel, isoEsperado] of velocidades) {
    await volverAlPuntoDePartida(page);
    await mover(page, 'sh-slider', idx);
    await expect(rotulo(page, 'sh-slider')).toHaveText(vel);
    expect(await rotulo(page, 'iso-slider').textContent(), `compensar 1/125 s → ${vel}`).toBe(isoEsperado);
    await expect(exposicion(page)).toContainText('Exposición correcta');
    expect(Math.abs(await evDelMarcador(page))).toBeLessThan(TOLERANCIA_OK);
    // El diafragma no se toca nunca en modo compensado.
    await expect(rotulo(page, 'ap-slider')).toHaveText('f/2,8');
  }
});

/**
 * CASO 2 · LÍMITE — el extremo del recorrido, con la compensación EN CASCADA (hallazgo 273).
 *
 * Deportes parte de ISO 400 · f/4 · 1/1000 s. Subir a ISO 6400 son log₂(6400/400) = +4 stops
 * de luz; para devolverlos el tiempo tendría que acortarse 4 stops, es decir 1/16000 s, que no
 * existe: la escala termina en 1/4000 s, que solo aporta -2. Hasta el 24/08/2026 ahí se
 * paraba, y el medidor marcaba +2,0 EV con un texto de modo que promete sin condiciones que
 * «los otros se reajustan automáticamente». Ahora los 2 stops que faltan los pone el
 * DIAFRAGMA: de f/4 a f/8 son exactamente -2, y la exposición se mantiene.
 *
 * El tope de verdad —cuando los DOS compañeros se agotan— se comprueba al final del test.
 */
test('CASO 2 · límite: en Deportes la velocidad topa y el diafragma termina la compensación', async ({
  page,
}) => {
  await elegirEscena(page, 'Deportes');
  await expect(rotulo(page, 'iso-slider')).toHaveText('ISO 400');
  await expect(rotulo(page, 'ap-slider')).toHaveText('f/4');
  await expect(rotulo(page, 'sh-slider')).toHaveText('1/1000 s');
  await expect(exposicion(page)).toHaveText('Exposición correcta (+0,0 EV)');

  await elegirModo(page, 'compensado');

  // ISO 1600 es el último que SÍ se puede compensar: +2 stops y el tiempo llega justo a 1/4000.
  await mover(page, 'iso-slider', 4);
  await expect(rotulo(page, 'sh-slider')).toHaveText('1/4000 s');
  await expect(exposicion(page)).toHaveText('Exposición correcta (+0,0 EV)');

  // Un paso más allá ya no hay tiempo que dar: la velocidad se queda en 1/4000 s y entra el
  // diafragma con los 2 stops que faltan. ISO 6400 (+4), 1/4000 s (-2) y f/8 (-2) suman 0.
  await volverAlPuntoDePartida(page);
  await mover(page, 'iso-slider', 6);
  await expect(rotulo(page, 'iso-slider')).toHaveText('ISO 6400');
  await expect(rotulo(page, 'sh-slider')).toHaveText('1/4000 s');
  await expect(rotulo(page, 'ap-slider')).toHaveText('f/8');
  await expect(exposicion(page)).toContainText('Exposición correcta');
  expect(await evDelMarcador(page)).toBeCloseTo(0, 5);

  /**
   * Y el tope DE VERDAD, con los dos compañeros agotados: desde Deportes, llevar la velocidad
   * a 1 s son log₂(1/(1/1000)) = +9,965784 stops de luz. El ISO solo puede bajar de 400 a 100
   * (-2) y el diafragma solo de f/4 a f/22 (-2·log₂(22/4) = -4,918863):
   *   ΔEV = 9,965784 - 2 - 4,918863 = +3,046921 → «+3,0 EV», y con aviso.
   */
  await volverAlPuntoDePartida(page);
  await mover(page, 'sh-slider', 0);
  await expect(rotulo(page, 'sh-slider')).toHaveText('1 s');
  await expect(rotulo(page, 'iso-slider')).toHaveText('ISO 100');
  await expect(rotulo(page, 'ap-slider')).toHaveText('f/22');
  // El marcador satura en ±3 EV (`clamp(deltaEV, -3, 3)`), así que aquí manda el rótulo
  await expect(exposicion(page)).toContainText('(+3,0 EV)');
  await expect(page.getByText('El modo compensado ha llegado al límite')).toBeVisible();

  // El tope NO deja memoria: al volver la velocidad a su sitio, la exposición se recupera
  await mover(page, 'sh-slider', 10);
  await expect(exposicion(page)).toContainText('Exposición correcta');
  await expect(page.getByText('El modo compensado ha llegado al límite')).toHaveCount(0);
});

/**
 * CASO 3 · LO QUE HAY QUE AVISAR — 1 s a pulso en Retrato (modo libre).
 *
 * Respecto a 1/125 s, un segundo entero es log₂(1/(1/125)) = log₂(125) = +6,965784 stops:
 *   ΔEV = +6,965784 → «Sobreexpuesto (zonas quemadas) (+7,0 EV)».
 * Y a 1 s a pulso la foto sale movida: el panel debe decirlo (Movimiento «Motion blur fuerte»,
 * Trípode «Imprescindible») Y la imagen debe enseñarlo, que es el hallazgo 2 de la primera
 * inspección: motionBlur = min(4·(log₂(1) - log₂(1/125)); 30) = min(27,863137; 30) = 27,863137.
 */
test('CASO 3 · aviso: 1 s a pulso avisa por texto Y lo dibuja (Retrato)', async ({ page }) => {
  await mover(page, 'sh-slider', 0);
  await expect(rotulo(page, 'sh-slider')).toHaveText('1 s');
  await expect(exposicion(page)).toHaveText('Sobreexpuesto (zonas quemadas) (+7,0 EV)');
  expect(await evDelMarcador(page)).toBeCloseTo(3, 5); // el marcador satura en +3 EV

  await expect(efecto(page, 'Movimiento')).toHaveText('Motion blur fuerte');
  await expect(efecto(page, 'Trípode')).toHaveText('Imprescindible');
  expect(
    await desenfoqueMovimiento(page),
    'el panel avisa de «Motion blur fuerte» y la imagen tiene que enseñarlo',
  ).toBeCloseTo(27.863137, 4);

  // La sobreexposición se ve: velo blanco al 85 % (min(0,85; 6,965784/4)).
  await expect(page.locator('svg rect[fill="#fff"]')).toHaveAttribute('opacity', '0.85');

  // Y en Paisaje igual: la referencia de trepidación es la misma 1/125 s.
  await elegirEscena(page, 'Paisaje');
  await mover(page, 'sh-slider', 0);
  await expect(efecto(page, 'Movimiento')).toHaveText('Motion blur fuerte');
  expect(await desenfoqueMovimiento(page)).toBeCloseTo(27.863137, 4);

  // Control del sentido contrario: a 1/4000 s no puede haber barrido.
  await mover(page, 'sh-slider', 12);
  await expect(efecto(page, 'Movimiento')).toHaveText('Congelado por completo');
  expect(await desenfoqueMovimiento(page)).toBe(0);
});

/**
 * HALLAZGO 273 (medio) · REPARADO el 24/08/2026. Paisaje parte de ISO 100 · f/11 · 1/250 s, y el ISO
 * mínimo de la escala es justo ese 100: en cuanto la velocidad baja UNA muesca (1/250 → 1/125,
 * +1,000000 stops de luz) no hay ISO por debajo con el que restarlos, así que el modo
 * compensado se va a +1,0 EV. La app no lo dice de ninguna forma, y el diafragma —que no toca
 * nunca— tenía margen de sobra: ella misma alcanza el estado bien expuesto ISO 100 · f/16 ·
 * 1/125 s cuando lo que se arrastra es el diafragma (2·log₂(11/16) = -1,081137 → ΔEV -0,081).
 *
 * El test acepta CUALQUIERA de las dos salidas honestas: compensar de verdad, o avisar de que
 * no puede. No prescribe cuál.
 */
test('REGRESIÓN 273 · si la compensación topa, el modo compensado avisa (Paisaje)', async ({
  page,
}) => {
  await elegirEscena(page, 'Paisaje');
  await elegirModo(page, 'compensado');

  // Prueba de que el estado bien expuesto a 1/125 s EXISTE y la app sabe llegar a él.
  await mover(page, 'ap-slider', 7);
  await expect(rotulo(page, 'ap-slider')).toHaveText('f/16');
  await expect(rotulo(page, 'sh-slider')).toHaveText('1/125 s');
  await expect(exposicion(page)).toContainText('Exposición correcta');

  // Y ahora la misma velocidad, alcanzada arrastrando el deslizador de velocidad.
  await volverAlPuntoDePartida(page);
  await mover(page, 'sh-slider', 7);
  await expect(rotulo(page, 'sh-slider')).toHaveText('1/125 s');
  await expect(rotulo(page, 'iso-slider')).toHaveText('ISO 100'); // ya estaba en el mínimo
  // El diafragma SÍ entra ahora, y es lo que devuelve la exposición a su sitio
  await expect(rotulo(page, 'ap-slider')).toHaveText('f/16');

  const ev = await evDelMarcador(page);
  const panel = (await page.locator('main').innerText()).split('Guía del Triángulo')[0];
  const avisa = /no (se )?pued|tope|al mínimo|al máximo|sin margen|fuera de rango|límite/i.test(panel);
  expect(
    Math.abs(ev) <= TOLERANCIA_OK || avisa,
    `el modo dice «los otros se reajustan para mantener la exposición correcta» y aquí sale ${ev.toFixed(6)} EV sin aviso`,
  ).toBe(true);
});

/**
 * HALLAZGO 274 (bajo) · REPARADO el 24/08/2026. En Deportes había 6 combinaciones cuyo ΔEV sale
 * -4,44·10⁻¹⁶ en coma flotante (0 en aritmética exacta); formatNumber devuelve «≈0» para
 * 0 < |x| < 0,0001, así que el medidor rotula «Exposición correcta (≈0 EV)» donde en todas las
 * demás pone «(+0,0 EV)». Una de las seis se alcanza con un solo gesto en modo compensado:
 * f/4 → f/8 quita 2·log₂(4/8) = -2 stops exactos y la velocidad va de 1/1000 a 1/250 s (+2).
 */
test('REGRESIÓN 274 · el medidor siempre rotula el EV con una decimal y su signo', async ({ page }) => {
  await elegirEscena(page, 'Deportes');
  await elegirModo(page, 'compensado');
  await mover(page, 'ap-slider', 5);
  await expect(rotulo(page, 'ap-slider')).toHaveText('f/8');
  await expect(rotulo(page, 'sh-slider')).toHaveText('1/250 s');
  expect(await evDelMarcador(page)).toBeCloseTo(0, 5);
  expect(
    await exposicion(page).textContent(),
    'el resto de la app rotula «(+0,0 EV)»; aquí se cuela el «≈0» de formatNumber',
  ).toMatch(/^Exposición correcta \([+-]\d+,\d EV\)$/);
});

/**
 * Reciprocidad y regla del cuadrado en MODO LIBRE — el motor sin compensación de por medio.
 * Se conserva de la primera inspección porque sigue siendo el control del cálculo base.
 */
test('reciprocidad y regla del cuadrado (Retrato, modo libre)', async ({ page }) => {
  // (a) RECIPROCIDAD: cerrar un paso de diafragma (f/2,8 → f/4) y doblar el tiempo
  //     (1/125 → 1/60) debe dejar la MISMA exposición. -1,029146 + 1,058894 = +0,029748 EV.
  await mover(page, 'ap-slider', 3);
  await mover(page, 'sh-slider', 6);
  await expect(rotulo(page, 'ap-slider')).toHaveText('f/4');
  await expect(rotulo(page, 'sh-slider')).toHaveText('1/60 s');
  await expect(exposicion(page)).toHaveText('Exposición correcta (+0,0 EV)');
  expect(Math.abs(await evDelMarcador(page))).toBeLessThan(TOLERANCIA_OK);

  // (b) Control: el mismo cierre SIN compensar cuesta exactamente ese paso de diafragma.
  //     2·log₂(2,8/4) = -1,029146 EV.
  await mover(page, 'sh-slider', 7);
  await expect(exposicion(page)).toHaveText('Ligeramente subexpuesto (-1,0 EV)');

  // (c) REGLA DEL CUADRADO. f/2,8 → f/1,4 es duplicar el diámetro relativo: el área (y la luz)
  //     se multiplica por 4 → +2 stops EXACTOS. Con el número f a secas saldría +1,0 EV.
  await mover(page, 'ap-slider', 0);
  await expect(rotulo(page, 'ap-slider')).toHaveText('f/1,4');
  await expect(exposicion(page)).toHaveText('Sobreexpuesto (zonas quemadas) (+2,0 EV)');
  expect(await evDelMarcador(page)).toBeCloseTo(2.0, 2);
  // A f/1,4 el fondo es lo más borroso posible: bokehBlur = 14·(1 - 0/8) = 14.
  expect(await desenfoqueFondo(page)).toBeCloseTo(14, 5);
  await expect(efecto(page, 'Profundidad de campo')).toHaveText('Muy reducida (fondo muy borroso)');

  // (d) ISO: duplicarlo es un paso completo de luz. 800 → 1600 = +1,000000 EV.
  await mover(page, 'ap-slider', 2);
  await mover(page, 'iso-slider', 4);
  await expect(rotulo(page, 'iso-slider')).toHaveText('ISO 1600');
  await expect(exposicion(page)).toHaveText('Ligeramente sobreexpuesto (+1,0 EV)');
  expect(await evDelMarcador(page)).toBeCloseTo(1.0, 2);
});

/** Saturación de los deslizadores y monotonía de la profundidad de campo (modo libre). */
test('límites de los deslizadores y profundidad de campo (Paisaje, modo libre)', async ({ page }) => {
  await elegirEscena(page, 'Paisaje');
  await expect(exposicion(page)).toHaveText('Exposición correcta (+0,0 EV)');

  // (a) Diafragma MÁS CERRADO del recorrido. f/11 → f/22 duplica el número f, luego divide
  //     la luz por 4: 2·log₂(11/22) = -2,000000 stops clavados.
  await mover(page, 'ap-slider', 8);
  await expect(rotulo(page, 'ap-slider')).toHaveText('f/22');
  await expect(exposicion(page)).toHaveText('Subexpuesto (foto oscura) (-2,0 EV)');
  expect(await evDelMarcador(page)).toBeCloseTo(-2.0, 2);
  expect(await desenfoqueFondo(page)).toBe(0);
  await expect(efecto(page, 'Profundidad de campo')).toHaveText('Muy amplia (todo nítido)');

  // (b) ISO MÁXIMO. log₂(6400/100) = +6 stops → ΔEV = 6 - 2 = +4,000000.
  await mover(page, 'iso-slider', 6);
  await expect(exposicion(page)).toHaveText('Sobreexpuesto (zonas quemadas) (+4,0 EV)');
  await expect(efecto(page, 'Ruido digital')).toHaveText('Alto (visible al ampliar)');
  await expect(page.locator('[class*="exposureMarker"]')).toHaveAttribute('style', /left:\s*100%/);

  // (c) Saturación del rango. Por arriba (99) → idx 6/8/12; por abajo (-5) → idx 0/0/0.
  for (const id of ['iso-slider', 'ap-slider', 'sh-slider']) await mover(page, id, 99);
  await expect(rotulo(page, 'iso-slider')).toHaveText('ISO 6400');
  await expect(rotulo(page, 'ap-slider')).toHaveText('f/22');
  await expect(rotulo(page, 'sh-slider')).toHaveText('1/4000 s');

  for (const id of ['iso-slider', 'ap-slider', 'sh-slider']) await mover(page, id, -5);
  await expect(rotulo(page, 'iso-slider')).toHaveText('ISO 100');
  await expect(rotulo(page, 'ap-slider')).toHaveText('f/1,4');
  await expect(rotulo(page, 'sh-slider')).toHaveText('1 s');
  // ISO 100 · f/1,4 · 1 s contra la referencia ISO 100 · f/11 · 1/250 s:
  //   0 + 2·log₂(11/1,4) + log₂(250) = 5,948010 + 7,965784 = +13,913794 EV.
  await expect(exposicion(page)).toHaveText('Sobreexpuesto (zonas quemadas) (+13,9 EV)');
  await expect(exposicion(page)).not.toContainText('NaN');
  await expect(exposicion(page)).not.toContainText('Infinity');

  // (d) Monotonía: al cerrar el diafragma el desenfoque de fondo debe DECRECER en todo el
  //     recorrido. Que creciera al cerrar sería el fallo de signo clásico.
  const desenfoques: number[] = [];
  for (let idx = 0; idx <= 8; idx++) {
    await mover(page, 'ap-slider', idx);
    desenfoques.push(await desenfoqueFondo(page));
  }
  expect(desenfoques[0]).toBeCloseTo(14, 5); // f/1,4
  expect(desenfoques[8]).toBe(0); // f/22
  for (let i = 1; i < desenfoques.length; i++) {
    expect(desenfoques[i]).toBeLessThan(desenfoques[i - 1]);
  }
});

/**
 * REPARADO 24/08/2026 (hallazgo 4). La caja imprimía EV = log₂(N²/t) + log₂(ISO/100), el EV
 * ABSOLUTO, con el que cerrar el diafragma SUBE el valor — justo al revés que el medidor que
 * tiene encima. El medidor no estaba mal: sigue el convenio de fotómetro (+ = sobreexpuesto).
 * Lo que no encajaba era la fórmula, que ahora describe la desviación respecto a la
 * combinación de partida y avisa del signo del EV clásico.
 */
test('la fórmula impresa describe la magnitud que el medidor muestra', async ({ page }) => {
  await expect(page.locator('[class*="formulaTex"]')).toHaveText(
    'ΔEV = log₂(ISO / ISO₀) + 2·log₂(N₀ / N) + log₂(t / t₀)',
  );
  const formula = (await page.locator('[class*="formulaTex"]').textContent()) ?? '';
  expect(formula, 'la fórmula impresa no puede llevar el signo contrario al medidor').not.toContain('N²');
  const pie = (await page.locator('[class*="formulaCaption"]').textContent()) ?? '';
  expect(pie).toContain('positivo = más luz = sobreexpuesto');

  // Y se comprueba con números: Paisaje f/11 → f/22 da 2·log₂(11/22) = -2 por la fórmula
  // impresa, y el medidor tiene que bajar exactamente esos 2 EV.
  await elegirEscena(page, 'Paisaje');
  const evAntes = await evDelMarcador(page); // ISO 100 · f/11 · 1/250 s → 0,0 EV
  await mover(page, 'ap-slider', 8);
  const evDespues = await evDelMarcador(page); // f/22 → -2,0 EV
  expect(evDespues - evAntes).toBeCloseTo(-2.0, 5);
});

/** Formato español (CLAUDE.md global §2) en rótulos y medidor. */
test('formato español en diafragmas y en el EV', async ({ page }) => {
  await expect(rotulo(page, 'ap-slider')).toHaveText('f/2,8');
  await mover(page, 'ap-slider', 0);
  await expect(rotulo(page, 'ap-slider')).toHaveText('f/1,4');
  await mover(page, 'ap-slider', 4);
  await expect(rotulo(page, 'ap-slider')).toHaveText('f/5,6');
  await expect(exposicion(page)).toHaveText(/\([+-]?[\d≈]+(,\d)? EV\)$/);
  await expect(exposicion(page)).not.toContainText('.');
});

test('accesibilidad de los controles', async ({ page }) => {
  // Los tres deslizadores están etiquetados y anuncian su valor legible.
  await expect(page.locator('#iso-slider')).toHaveAttribute('aria-valuetext', 'ISO 800');
  await expect(page.locator('#ap-slider')).toHaveAttribute('aria-valuetext', 'f/2,8');
  await expect(page.locator('#sh-slider')).toHaveAttribute('aria-valuetext', '1/125 s');

  // El indicador de exposición es una región viva: cambia sin recargar y debe anunciarse.
  await expect(page.locator('[role="status"]')).toHaveAttribute('aria-live', 'polite');

  // Pestañas de escena con aria-selected y botones de modo con aria-pressed.
  await expect(page.getByRole('tab', { name: /Retrato/ })).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByRole('button', { name: 'Modo libre' })).toHaveAttribute('aria-pressed', 'true');
});

/**
 * REPARADO 24/08/2026 (hallazgo 3). Los 6 botones de la app (3 pestañas de escena, 2 de modo y
 * «↺ Volver a la combinación correcta») salían sin atributo type. Regla de oro del CLAUDE.md
 * global §5, y una de las dos que el candado check:a11y-jsx rompe el build por incumplir.
 */
test('todos los botones de la app llevan type="button"', async ({ page }) => {
  const sinTipo = await page.evaluate(
    () => [...document.querySelectorAll('main button')].filter((b) => !b.getAttribute('type')).length,
  );
  expect(sinTipo, 'botones de la app sin type="button"').toBe(0);
});
