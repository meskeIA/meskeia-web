import { test, expect, Page } from '@playwright/test';

/**
 * Inspector — simulador-fotografia (segmento interactiva/visual, riesgo 3, 393 usos)
 *
 * Primera inspección: 24/08/2026. El <h1> promete «📷 Simulador de Fotografía» y el subtítulo
 * «Aprende el triángulo de exposición moviendo ISO, apertura y velocidad. Ve el resultado en
 * tiempo real con bokeh, ruido y motion blur». La metadata añade «Modo libre y modo
 * compensado», y el FAQPage del JSON-LD lo detalla: «si subes la velocidad de obturación para
 * congelar movimiento, el simulador muestra cómo debe bajar el número f o subir el ISO para
 * compensar la luz perdida».
 *
 * Que la salida sea una escena dibujada NO la hace inauditable: el triángulo de exposición es
 * aritmética de pasos (stops), y la app publica su propio marcador numérico en EV. Aquí se
 * comprueban NÚMEROS contra pasos resueltos a mano, y los efectos (bokeh, ruido, motion blur,
 * overlay de exposición) leyendo los atributos del SVG, nunca la imagen a ojo.
 *
 * DÓNDE VIVE EL CÁLCULO
 *   app/simulador-fotografia/page.tsx  (no hay motor.ts; todo está en el componente)
 *     ISO_VALUES      = [100, 200, 400, 800, 1600, 3200, 6400]                  idx 0..6
 *     APERTURE_VALUES = [1,4 · 2 · 2,8 · 4 · 5,6 · 8 · 11 · 16 · 22]            idx 0..8
 *     SHUTTER_VALUES  = [1 · 1/2 · 1/4 · 1/8 · 1/15 · 1/30 · 1/60 · 1/125 ·
 *                        1/250 · 1/500 · 1/1000 · 1/2000 · 1/4000]              idx 0..12
 *     · isoStops(i)      =  log2(ISO[i]/100)      → +1 stop al duplicar el ISO
 *     · apertureStops(a) = -2·log2(f/1,4)         → luz ∝ 1/f²  (CUADRADO del número f)
 *     · shutterStops(s)  =  log2(t/1 s)           → +1 stop al duplicar el tiempo
 *     · ΔEV = (ISO - ISOref) + (dia - diaref) + (vel - velref) respecto a la escena elegida
 *   Efectos: bokehBlur = 14·(1 - apIdx/8) · noiseOpacity = (isoIdx/6)·0,45
 *            motionBlur = min(4·stops más lento que 1/1000, 30), SOLO en la escena Deportes
 *            overlayDark = |ΔEV|/4 si ΔEV<0 · overlayLight = ΔEV/4 si ΔEV>0 (tope 0,85)
 *   lib/formatters.ts → formatNumber(n, 1) con toLocaleString('es-ES')
 *
 * NOTA SOBRE LOS VALORES NOMINALES: la app usa la serie comercial redondeada (f/2,8 en vez de
 * f/2,8284…, 1/125 s en vez de 1/128 s), así que un salto de diafragma no vale exactamente
 * -1,000 stop sino -1,029 o -0,971 según el par. Es más honesto que idealizar: una cámara real
 * rotula esos mismos números. Consecuencia práctica: la reciprocidad perfecta deja un residuo
 * de +0,03 EV, muy por debajo del umbral de ±0,3 EV con que la propia app declara «exposición
 * correcta». Los saltos que SÍ son exactos son los que duplican el número f (f/1,4→f/2,8,
 * f/11→f/22 = -2,000 stops clavados), y son los que este fichero usa para la regla del cuadrado.
 *
 * ─────────────────────────────────────────────────────────────────────────────────────────
 * LOS CASOS, RESUELTOS A MANO ANTES DE ABRIR EL NAVEGADOR
 *
 *   CASO 1 (normal) — RECIPROCIDAD en la escena Retrato (ref: ISO 800 · f/2,8 · 1/125 s)
 *       (a) Cierro un paso de diafragma y doblo el tiempo — la exposición NO debe moverse:
 *             f/2,8 → f/4   = -2·log2(4/1,4) - (-2·log2(2,8/1,4)) = -3,029146 + 2 = -1,029146
 *             1/125 → 1/60  =  log2(1/60) - log2(1/125)           = -5,906891 + 6,965784
 *                                                                  = +1,058894
 *             ΔEV = -1,029146 + 1,058894 = +0,029748 → «Exposición correcta (+0,0 EV)»
 *       (b) Control: cerrar SIN compensar debe costar justo ese paso:
 *             f/2,8 → f/4 solo → ΔEV = -1,029146 → «Ligeramente subexpuesto (-1,0 EV)»
 *       (c) REGLA DEL CUADRADO — f/2,8 → f/1,4 duplica el diámetro relativo, luego CUADRUPLICA
 *           el área y la luz: -2·log2(1,4/1,4) - (-2) = +2 stops exactos.
 *             ΔEV = +2,000000 → «Sobreexpuesto (zonas quemadas) (+2,0 EV)»
 *           Si el motor usase el número f a secas en vez de f², saldría log2(2,8/1,4) = +1,0 EV.
 *           Este es EL caso que separa un motor correcto del error clásico.
 *       (d) ISO 800 → 1600 = log2(1600/100) - log2(800/100) = 4 - 3 = +1 stop
 *             ΔEV = +1,000000 → «Ligeramente sobreexpuesto (+1,0 EV)»
 *
 *   CASO 2 (límite) — extremos de los deslizadores, escena Paisaje (ref: ISO 100 · f/11 · 1/250 s)
 *       (a) f/11 → f/22, el diafragma MÁS CERRADO del recorrido. Duplicar el número f es
 *           exactamente -2 stops: -2·log2(22/11) = -2,000000.
 *             ΔEV = -2,0 → «Subexpuesto (foto oscura) (-2,0 EV)»
 *             bokehBlur = 14·(1 - 8/8) = 0 → fondo completamente nítido
 *             Profundidad de campo → «Muy amplia (todo nítido)»
 *       (b) + ISO 100 → 6400, el ISO MÁXIMO: log2(6400/100) = +6 stops.
 *             ΔEV = 6 - 2 = +4,000000 → «Sobreexpuesto (zonas quemadas) (+4,0 EV)»
 *             noiseOpacity = (6/6)·0,45 = 0,45 → Ruido digital «Alto (visible al ampliar)»
 *             overlayLight = min(0,85; 4/4) = 0,85 y el marcador satura en left: 100%
 *       (c) Saturación del <input type="range">: 99 → 6/8/12 (ISO 6400 · f/22 · 1/4000 s) y
 *           -5 → 0/0/0 (ISO 100 · f/1,4 · 1 s). Nunca NaN, nunca Infinity.
 *           En el tope inferior: ΔEV = (0-0) + (0 + 5,948010) + (0 + 7,965784) = +13,913794
 *             → «Sobreexpuesto (zonas quemadas) (+13,9 EV)»
 *       (d) Monotonía de la profundidad de campo: al cerrar el diafragma el desenfoque debe
 *           DECRECER en todo el recorrido (f/1,4 → 14 … f/22 → 0). Un desenfoque que creciera
 *           al cerrar sería el fallo de signo clásico.
 *
 *   CASO 3 (coherencia interna) — MODO COMPENSADO en Retrato. Es la promesa del modo, escrita
 *       en la propia app: «los otros se reajustan automáticamente para mantener la exposición
 *       correcta». Así que la comprobación no necesita fuente externa: la app se compara consigo
 *       misma. Sea cual sea el reajuste que elija, el marcador DEBE volver a ≈0 EV.
 *       (a) f/2,8 → f/8 = -5,029146 + 2 = -3,029146 stops de luz perdidos. Para devolverlos,
 *           el tiempo debe alargarse ~3 stops: 1/125 → 1/15 s (+3,058893) → ΔEV = +0,029747.
 *       (b) ISO 800 → 6400 = +3 stops de luz de más. Para quitarlos, el tiempo debe acortarse
 *           3 stops: 1/125 → 1/1000 s (-3,000000) → ΔEV = 0,000000.
 *       (c) 1/125 → 1/1000 s = -3 stops. Para devolverlos, el ISO debe subir 3 stops:
 *           800 → 6400 → ΔEV = 0,000000.
 *
 * ─────────────────────────────────────────────────────────────────────────────────────────
 * HALLAZGOS ABIERTOS QUE ESTE FICHERO SEÑALA (el Inspector no repara)
 *
 *   · MODO COMPENSADO INVERTIDO en dos de los tres deslizadores. setIso() y setAp() calculan
 *     bien cuántos stops hay que devolver (objStops) y luego los aplican al índice de
 *     velocidad con el signo cambiado:
 *         const newShIdx = clamp(Math.round(escena.shIdx + objStops), 0, 12);
 *     shutterStops DECRECE con el índice (idx 0 = 1 s, idx 12 = 1/4000 s), así que para
 *     aportar +objStops de luz el índice tiene que BAJAR, no subir: debería ser
 *     «escena.shIdx - objStops». Al sumar, la corrección no cancela el error: lo DUPLICA.
 *       f/2,8 → f/8 en compensado ⇒ la app pone 1/1000 s (debía poner 1/15 s) y el marcador
 *         cae a «Subexpuesto (foto oscura) (-6,0 EV)» en vez de quedarse en 0.
 *       ISO 800 → 6400 en compensado ⇒ la app pone 1/15 s (debía poner 1/1000 s) y sube a
 *         «Sobreexpuesto (zonas quemadas) (+6,1 EV)».
 *     El tercer deslizador, setSh(), SÍ es correcto, y por el mismo motivo: compensa con el
 *     ISO, cuyo isoStops CRECE con el índice, de modo que ahí el «+» es el signo que toca.
 *     REPARADO el 24/08/2026: la compensación se calcula en STOPS y luego se busca el índice
 *     más cercano a ese valor, así que ni el signo ni la escala irregular de velocidades
 *     (de 1/8 a 1/15 hay 0,91 stops, no 1) pueden volver a estropearla.
 *
 *   · La caja de fórmula rotula «EV = log₂(N² / t) + log₂(ISO / 100)» justo debajo de un
 *     medidor cuyo signo es el contrario para dos de las tres variables: con esa fórmula,
 *     cerrar el diafragma (N mayor) SUBE el EV, y el medidor de la app lo BAJA (f/11 → f/22
 *     marca «-2,0 EV»). Lo mismo con el tiempo. El medidor sigue el convenio de fotómetro
 *     (+ = sobreexpuesto), que es el correcto para lo que muestra; es la fórmula impresa la
 *     que no corresponde a lo que hay encima. Ver el testigo de la fórmula impresa.
 *
 *   · El motion blur solo se dibuja en la escena Deportes (escena.id !== 'deporte' → 0), pero
 *     el hero, la metadata y el OG prometen motion blur sin condición, y el panel de
 *     resultados SÍ rotula «Motion blur fuerte» / «Trepidación posible» en Retrato y Paisaje
 *     sin que la imagen cambie. Ver el testigo del barrido fuera de Deportes.
 *
 *   · Ninguno de los 6 botones de la app lleva type="button" (3 pestañas de escena, 2 de modo
 *     y «↺ Volver a la combinación correcta»). Regla de oro del CLAUDE.md global §5. Los
 *     role="tab" sí llevan aria-selected y los de modo sí llevan aria-pressed. Ver el
 *     testigo de los botones sin type="button".
 * ─────────────────────────────────────────────────────────────────────────────────────────
 */

const RUTA = '/simulador-fotografia/';

/**
 * Mueve un deslizador. Un <input type="range"> no acepta fill(), y arrastrar con el ratón no
 * da un índice exacto, así que se escribe con el setter nativo y se dispara el evento input
 * que React escucha. El navegador satura solo fuera de [min, max]: eso es justo lo que el
 * CASO 2 (c) quiere observar.
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
 * ΔEV = (left - 50)·3/50.
 */
async function evDelMarcador(page: Page): Promise<number> {
  const estilo = await page.locator('[class*="exposureMarker"]').getAttribute('style');
  const coincidencia = String(estilo).match(/left:\s*([\d.]+)%/);
  return ((parseFloat(coincidencia![1]) - 50) * 3) / 50;
}

/** Devuelve los tres deslizadores a la combinación de referencia de la escena activa. */
async function volverAlPuntoDePartida(page: Page): Promise<void> {
  await page.getByRole('button', { name: /Volver a la combinación correcta/ }).click();
}

test.beforeEach(async ({ page }) => {
  await page.goto(RUTA);
  await page.waitForSelector('#iso-slider');
});

test('CASO 1 · reciprocidad y regla del cuadrado (Retrato, modo libre)', async ({ page }) => {
  // Punto de partida de la escena Retrato: ISO 800 · f/2,8 · 1/125 s, declarada correcta.
  await expect(rotulo(page, 'iso-slider')).toHaveText('ISO 800');
  await expect(rotulo(page, 'ap-slider')).toHaveText('f/2,8');
  await expect(rotulo(page, 'sh-slider')).toHaveText('1/125 s');
  await expect(exposicion(page)).toHaveText('Exposición correcta (+0,0 EV)');

  // (a) RECIPROCIDAD: cerrar un paso de diafragma (f/2,8 → f/4) y doblar el tiempo
  //     (1/125 → 1/60) debe dejar la MISMA exposición. -1,029146 + 1,058894 = +0,029748 EV.
  await mover(page, 'ap-slider', 3);
  await mover(page, 'sh-slider', 6);
  await expect(rotulo(page, 'ap-slider')).toHaveText('f/4');
  await expect(rotulo(page, 'sh-slider')).toHaveText('1/60 s');
  await expect(exposicion(page)).toHaveText('Exposición correcta (+0,0 EV)');
  // El rótulo va redondeado a una decimal; el marcador da el residuo real, que debe caber en
  // el propio umbral de la app (±0,3 EV) y no dispararse por acumulación de redondeos.
  expect(Math.abs(await evDelMarcador(page))).toBeLessThan(0.3);

  // (b) Control: el mismo cierre SIN compensar cuesta exactamente ese paso de diafragma.
  //     -2·log2(4/1,4) + 2 = -1,029146 EV.
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

test('CASO 2 · límites de los deslizadores y profundidad de campo (Paisaje)', async ({ page }) => {
  await page.getByRole('tab', { name: /Paisaje/ }).click();
  await expect(rotulo(page, 'iso-slider')).toHaveText('ISO 100');
  await expect(rotulo(page, 'ap-slider')).toHaveText('f/11');
  await expect(rotulo(page, 'sh-slider')).toHaveText('1/250 s');
  await expect(exposicion(page)).toHaveText('Exposición correcta (+0,0 EV)');

  // (a) Diafragma MÁS CERRADO del recorrido. f/11 → f/22 duplica el número f, luego divide
  //     la luz por 4: -2·log2(22/11) = -2,000000 stops clavados.
  await mover(page, 'ap-slider', 8);
  await expect(rotulo(page, 'ap-slider')).toHaveText('f/22');
  await expect(exposicion(page)).toHaveText('Subexpuesto (foto oscura) (-2,0 EV)');
  expect(await evDelMarcador(page)).toBeCloseTo(-2.0, 2);
  // Cerrar el diafragma AUMENTA la profundidad de campo: en el tope, desenfoque nulo.
  expect(await desenfoqueFondo(page)).toBe(0);
  await expect(efecto(page, 'Profundidad de campo')).toHaveText('Muy amplia (todo nítido)');

  // (b) ISO MÁXIMO. log2(6400/100) = +6 stops → ΔEV = 6 - 2 = +4,000000.
  await mover(page, 'iso-slider', 6);
  await expect(rotulo(page, 'iso-slider')).toHaveText('ISO 6400');
  await expect(exposicion(page)).toHaveText('Sobreexpuesto (zonas quemadas) (+4,0 EV)');
  await expect(efecto(page, 'Ruido digital')).toHaveText('Alto (visible al ampliar)');
  // El marcador satura en el extremo derecho de la escala (-3…+3).
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
  //   0 + (0 + 5,948010) + (0 + 7,965784) = +13,913794 EV.
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

  // La fórmula impresa describe AHORA la magnitud que el medidor muestra (ΔEV respecto a la
  // combinación correcta de la escena). Se vuelve antes al punto de partida porque el marcador
  // satura en ±3 EV, y dos lecturas saturadas serían iguales aunque el ΔEV real no lo fuese.
  await volverAlPuntoDePartida(page);
  const evAntes = await evDelMarcador(page); // ISO 100 · f/11 · 1/250 s → 0,0 EV
  await mover(page, 'ap-slider', 8);
  const evDespues = await evDelMarcador(page); // f/22 → -2,0 EV
  await expect(page.locator('[class*="formulaTex"]')).toHaveText(
    'ΔEV = log₂(ISO / ISO₀) + 2·log₂(N₀ / N) + log₂(t / t₀)',
  );
  // El medidor sigue el convenio de fotómetro: cerrar el diafragma resta luz, luego BAJA.
  expect(evDespues).toBeLessThan(evAntes);
  expect(evDespues - evAntes).toBeCloseTo(-2.0, 2);
});

/**
 * REPARADO 24/08/2026 (hallazgo 222). La caja imprimía EV = log₂(N²/t) + log₂(ISO/100), el EV
 * ABSOLUTO, con el que cerrar el diafragma SUBE el valor — justo al revés que el medidor que
 * tiene encima. El medidor no estaba mal: sigue el convenio de fotómetro (+ = sobreexpuesto),
 * que es el correcto para lo que muestra. Lo que no encajaba era la fórmula, que ahora describe
 * la desviación respecto a la combinación de partida y avisa del signo del EV clásico.
 */
test('la fórmula impresa describe la magnitud que el medidor muestra', async ({ page }) => {
  const formula = (await page.locator('[class*="formulaTex"]').textContent()) ?? '';
  expect(formula, 'la fórmula impresa no puede llevar el signo contrario al medidor').not.toContain('N²');
  expect(formula).toContain('ΔEV');
  expect(formula).toContain('2·log₂(N₀ / N)'); // cerrar el diafragma RESTA, como en el medidor
  const pie = (await page.locator('[class*="formulaCaption"]').textContent()) ?? '';
  expect(pie).toContain('positivo = más luz = sobreexpuesto');
});

test('CASO 3 · coherencia interna: el modo compensado debe conservar la exposición', async ({ page }) => {
  await page.getByRole('button', { name: 'Modo compensado' }).click();
  await expect(page.getByRole('button', { name: 'Modo compensado' })).toHaveAttribute('aria-pressed', 'true');
  await expect(exposicion(page)).toHaveText('Exposición correcta (+0,0 EV)');

  // (c) Velocidad → ISO. 1/125 → 1/1000 s son -3 stops de luz; el ISO debe subir 3 stops
  //     (800 → 6400) para devolverlos. ΔEV = 0,000000. Esta rama SÍ funciona.
  await mover(page, 'sh-slider', 10);
  await expect(rotulo(page, 'sh-slider')).toHaveText('1/1000 s');
  await expect(rotulo(page, 'iso-slider')).toHaveText('ISO 6400');
  await expect(exposicion(page)).toHaveText('Exposición correcta (+0,0 EV)');

  // (a) Diafragma → velocidad. f/2,8 → f/8 son -3,029146 stops; el tiempo debe alargarse
  //     hasta 1/15 s (+3,058893) para devolverlos. ΔEV = +0,029747 → «Exposición correcta».
  //     REPARADO (hallazgo 221): la compensación se calcula en stops y se traduce a índice,
  //     en vez de sumar los stops al índice del deslizador con el signo cambiado.
  await volverAlPuntoDePartida(page);
  await mover(page, 'ap-slider', 5);
  await expect(rotulo(page, 'ap-slider')).toHaveText('f/8');
  await expect(rotulo(page, 'sh-slider')).toHaveText('1/15 s');
  await expect(exposicion(page)).toHaveText('Exposición correcta (+0,0 EV)');
  expect(Math.abs(await evDelMarcador(page))).toBeLessThan(0.3);

  // (b) ISO → velocidad. ISO 800 → 6400 son +3 stops; el tiempo debe acortarse 3 stops
  //     (1/125 → 1/1000 s) para quitarlos. ΔEV = 0,000000.
  await volverAlPuntoDePartida(page);
  await mover(page, 'iso-slider', 6);
  await expect(rotulo(page, 'iso-slider')).toHaveText('ISO 6400');
  await expect(rotulo(page, 'sh-slider')).toHaveText('1/1000 s');
  await expect(exposicion(page)).toHaveText('Exposición correcta (+0,0 EV)');
  expect(await evDelMarcador(page)).toBeCloseTo(0, 5);
});

/**
 * REPARADO 24/08/2026 (hallazgo 221, alto). El modo compensado —la promesa central de la app—
 * sumaba los stops al ÍNDICE del deslizador de velocidad, cuyo eje va al revés: la corrección
 * DUPLICABA el error en vez de cancelarlo y el simulador enseñaba lo contrario de lo que dice
 * enseñar. Con el ISO colaba porque su índice sí coincide con sus stops.
 */
test('en modo compensado, mover el diafragma conserva la exposición', async ({ page }) => {
  // f/2,8 → f/8 son -3,029146 stops; el tiempo debe alargarse hasta 1/15 s (+3,058893) para
  // devolverlos. Antes la app ponía 1/1000 s y se iba a -6,0 EV.
  await page.getByRole('button', { name: 'Modo compensado' }).click();
  await mover(page, 'ap-slider', 5);
  await expect(rotulo(page, 'ap-slider')).toHaveText('f/8');
  expect(await rotulo(page, 'sh-slider').textContent(), 'compensar f/2,8→f/8 pide 1/15 s').toBe(
    '1/15 s',
  );
  expect(
    await exposicion(page).textContent(),
    'el modo compensado promete mantener la exposición',
  ).toBe('Exposición correcta (+0,0 EV)');
  expect(Math.abs(await evDelMarcador(page)), 'el ΔEV tras compensar cabe en ±0,3 EV').toBeLessThan(
    0.3,
  );
});

test('en modo compensado, mover el ISO conserva la exposición', async ({ page }) => {
  // ISO 800 → 6400 son +3 stops de luz de más; el tiempo debe acortarse 3 stops (1/125 → 1/1000 s)
  // para quitarlos. Con el signo cambiado la app ponía 1/15 s y duplicaba el error.
  await page.getByRole('button', { name: 'Modo compensado' }).click();
  await mover(page, 'iso-slider', 6);
  await expect(rotulo(page, 'iso-slider')).toHaveText('ISO 6400');
  expect(
    await rotulo(page, 'sh-slider').textContent(),
    'compensar ISO 800→6400 pide 1/1000 s',
  ).toBe('1/1000 s');
  expect(
    await exposicion(page).textContent(),
    'el modo compensado promete mantener la exposición',
  ).toBe('Exposición correcta (+0,0 EV)');
  expect(Math.abs(await evDelMarcador(page)), 'el ΔEV tras compensar cabe en ±0,3 EV').toBeLessThan(
    0.3,
  );
});

test('Sonda · motion blur y formato español', async ({ page }) => {
  await page.getByRole('tab', { name: /Deportes/ }).click();
  await expect(rotulo(page, 'sh-slider')).toHaveText('1/1000 s');
  // A 1/1000 s (la referencia de la escena) no hay barrido: stopsLento = 0.
  expect(await desenfoqueMovimiento(page)).toBe(0);

  // Tiempo LARGO → el barrido debe crecer. 1/15 s está 6,058893 stops por debajo de 1/1000 s
  //   → motionBlur = min(4·6,058893; 30) = 24,235575.
  await mover(page, 'sh-slider', 4);
  await expect(rotulo(page, 'sh-slider')).toHaveText('1/15 s');
  expect(await desenfoqueMovimiento(page)).toBeCloseTo(24.235575, 4);
  await expect(efecto(page, 'Movimiento')).toHaveText('Trepidación posible');

  // Tiempo RÁPIDO → el barrido debe desaparecer. 1/4000 s es MÁS rápido que 1/1000 s.
  await mover(page, 'sh-slider', 12);
  await expect(rotulo(page, 'sh-slider')).toHaveText('1/4000 s');
  expect(await desenfoqueMovimiento(page)).toBe(0);
  await expect(efecto(page, 'Movimiento')).toHaveText('Congelado por completo');

  // REPARADO (hallazgo 223): fuera de Deportes también se dibuja, porque lo que tiembla es la
  // cámara. La referencia allí es 1/125 s (shIdx 7), el umbral con el que el propio panel pasa
  // a avisar de trepidación: 1 s está 6,965784 stops por debajo → min(4·6,965784; 30) = 27,863137.
  await page.getByRole('tab', { name: /Retrato/ }).click();
  await mover(page, 'sh-slider', 0);
  await expect(rotulo(page, 'sh-slider')).toHaveText('1 s');
  await expect(efecto(page, 'Movimiento')).toHaveText('Motion blur fuerte');
  expect(await desenfoqueMovimiento(page)).toBeCloseTo(27.863137, 4);

  // Formato español (CLAUDE.md global §2): coma decimal en diafragmas y en el EV.
  await volverAlPuntoDePartida(page);
  await expect(rotulo(page, 'ap-slider')).toHaveText('f/2,8');
  await mover(page, 'ap-slider', 0);
  await expect(rotulo(page, 'ap-slider')).toHaveText('f/1,4');
  await expect(exposicion(page)).toHaveText(/\([+-]?\d+,\d EV\)$/);
  await expect(exposicion(page)).not.toContainText('.');
});

test('Sonda · accesibilidad de los controles', async ({ page }) => {
  // Los tres deslizadores están etiquetados y anuncian su valor legible.
  await expect(page.locator('#iso-slider')).toHaveAttribute('aria-valuetext', 'ISO 800');
  await expect(page.locator('#ap-slider')).toHaveAttribute('aria-valuetext', 'f/2,8');
  await expect(page.locator('#sh-slider')).toHaveAttribute('aria-valuetext', '1/125 s');

  // El indicador de exposición es una región viva: cambia sin recargar y debe anunciarse.
  await expect(page.locator('[role="status"]')).toHaveAttribute('aria-live', 'polite');

  // Pestañas de escena con aria-selected y botones de modo con aria-pressed.
  await expect(page.getByRole('tab', { name: /Retrato/ })).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByRole('button', { name: 'Modo libre' })).toHaveAttribute('aria-pressed', 'true');

  // El recuento de botones sin type="button" vive en el test del final del fichero.
});

/**
 * REPARADO 24/08/2026 (hallazgo 223). El barrido solo se dibujaba en Deportes, así que en
 * Retrato con 1 s la app decía a la vez «Motion blur fuerte» y «Trípode: Imprescindible» sobre
 * una foto perfectamente nítida, mientras el hero y el JSON-LD lo prometían sin condición.
 */
test('fuera de Deportes el barrido se dibuja cuando el panel lo anuncia', async ({ page }) => {
  // Escena Retrato (la de partida) a 1 s: el panel rotula «Motion blur fuerte» y ahora la
  // imagen lo enseña.
  await mover(page, 'sh-slider', 0);
  await expect(rotulo(page, 'sh-slider')).toHaveText('1 s');
  await expect(efecto(page, 'Movimiento')).toHaveText('Motion blur fuerte');
  expect(
    await desenfoqueMovimiento(page),
    'el panel dice «Motion blur fuerte» y la imagen no lo dibuja',
  ).toBeGreaterThan(0);
});

/**
 * REPARADO 24/08/2026 (hallazgo 224). Los 6 botones (3 pestañas de escena, 2 de modo y
 * «↺ Volver a la combinación correcta») salían sin atributo type. Regla de oro del CLAUDE.md
 * global §5, y una de las dos que el candado check:a11y-jsx rompe el build por incumplir.
 */
test('todos los botones de la app llevan type="button"', async ({ page }) => {
  const sinTipo = await page.evaluate(
    () => [...document.querySelectorAll('main button')].filter((b) => !b.getAttribute('type')).length,
  );
  expect(sinTipo, 'botones de la app sin type="button"').toBe(0);
});
