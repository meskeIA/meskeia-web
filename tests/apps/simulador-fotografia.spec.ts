import { test, expect, Page, Locator } from '@playwright/test';
import { esperarHidratacion, sembrarValor, esperarValorEnReact } from './_hidratacion';
import { activarTema, prepararParaMedir } from '../contraste-text-muted-auxiliares';
import { parseSpanishNumber } from '../../lib/formatters';

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
 *   app/simulador-fotografia/casos.ts  (desde el 22/09/2026: escalas, stops y calcDeltaEV, que
 *   importan tanto el medidor de page.tsx como la corrección de los casos de aula)
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
 * ── HALLAZGOS DE LA SEGUNDA INSPECCIÓN — REPARADOS el 24/08/2026 (sus tests pasaron de
 *    testigos a regresiones: REGRESIÓN 273 y REGRESIÓN 274, más abajo) ───────────────────────
 *  A · 273 (medio, operativa) Cuando la compensación topaba con el extremo del compañero, el
 *                     modo compensado dejaba de mantener la exposición y NO lo decía. En
 *                     Paisaje bastaba UNA muesca (1/250 → 1/125 s) para irse a +1,0 EV con el
 *                     ISO ya en 100, y el diafragma no entraba nunca. REPARADO: compensación en
 *                     cascada y aviso de límite (su efecto secundario, en la TERCERA inspección).
 *  B · 274 (bajo, contenido) En 6 estados de Deportes el ΔEV salía -4,44·10⁻¹⁶ y el medidor
 *                     rotulaba «(≈0 EV)». REPARADO: el rótulo se redondea antes de formatear.
 *
 * La TERCERA inspección (29/09/2026, foco en la tarea de aula) está al final del fichero.
 * ─────────────────────────────────────────────────────────────────────────────────────────
 */

const RUTA = '/simulador-fotografia/';

/** Umbral con el que la propia app declara «Exposición correcta». */
const TOLERANCIA_OK = 0.3;

/**
 * Mueve un deslizador. Un <input type="range"> no acepta fill(), y arrastrar con el ratón no
 * da un índice exacto, así que se escribe con el setter nativo y se dispara el evento input
 * que React escucha; `sembrarValor` comprueba además que el estado de React lo recogió. El
 * navegador satura solo fuera de [min, max]: eso es justo lo que el test de saturación quiere
 * observar, y por eso ahí hay que decir en `esperado` el índice en que acaba el recorrido.
 */
async function mover(page: Page, id: string, valor: number, esperado = valor): Promise<void> {
  await sembrarValor(page, `#${id}`, valor, { esperado });
}

/**
 * Lleva un deslizador al índice pedido partiendo SIEMPRE de otro puesto. Hace falta porque los
 * tres barridos del CASO 1 recorren el rango ENTERO, y en el puesto que coincide con la
 * combinación de referencia `mover` no movería nada: el estado de React ya vale eso, así que el
 * test daría verde sin haber ejercitado la compensación ni una vez. Detectado con
 * `SIEMBRA_ESTRICTA=1` (ver tests/apps/_hidratacion.ts). En ese puesto la comprobación pasa a
 * ser más fuerte, no más débil: salir y volver tiene que devolver la combinación de partida.
 */
async function moverDesdeOtroPuesto(
  page: Page,
  id: string,
  idx: number,
  referencia: number,
): Promise<void> {
  if (idx === referencia) await mover(page, id, idx === 0 ? 1 : idx - 1);
  await mover(page, id, idx);
}

/** Los tres deslizadores, el testigo de que la app ya responde. */
const DESLIZADORES = ['#iso-slider', '#ap-slider', '#sh-slider'];

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
  // Que el deslizador EXISTA no basta: viaja en el HTML servido y está en pantalla antes de
  // que React lo haya montado, así que el primer movimiento se perdería (ver _hidratacion.ts).
  await esperarHidratacion(page, DESLIZADORES);
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
    await moverDesdeOtroPuesto(page, 'ap-slider', idx, 2); // Retrato parte de f/2,8 (idx 2)
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
    await moverDesdeOtroPuesto(page, 'iso-slider', idx, 3); // Retrato parte de ISO 800 (idx 3)
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
    await moverDesdeOtroPuesto(page, 'sh-slider', idx, 7); // Retrato parte de 1/125 s (idx 7)
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
  // Se baja antes al índice 1 A PROPÓSITO: ISO y diafragma vienen ya del tope por (a) y (b), y
  // pedir 99 desde el tope no movería nada —el navegador dejaría el valor donde está y React
  // descartaría el evento por duplicado—, así que la comprobación pasaría sin haber saturado
  // nada (ver tests/apps/_hidratacion.ts).
  const TOPE: Record<string, number> = { 'iso-slider': 6, 'ap-slider': 8, 'sh-slider': 12 };
  for (const id of Object.keys(TOPE)) await mover(page, id, 1);
  for (const id of Object.keys(TOPE)) await mover(page, id, 99, TOPE[id]);
  await expect(rotulo(page, 'iso-slider')).toHaveText('ISO 6400');
  await expect(rotulo(page, 'ap-slider')).toHaveText('f/22');
  await expect(rotulo(page, 'sh-slider')).toHaveText('1/4000 s');

  for (const id of Object.keys(TOPE)) await mover(page, id, -5, 0);
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
  // Partir del tope: el diafragma viene de idx 0 por la saturación de (c), y arrancar el
  // barrido en 0 no movería nada en la primera vuelta.
  await mover(page, 'ap-slider', 8);
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

/* ═══════════════════════════════════════════════════════════════════════════════════════
 * CASOS PARA CLASE — la tarea asignable (skill /casos-aula-meskeia), añadida el 22/09/2026
 *
 * Estas pruebas NO abren el navegador: importan `casos.ts` y lo ejercitan como el módulo puro
 * que es. Van detrás del acta del Inspector, que es el contrato de la app y no se toca.
 *
 * CÓMO SE DERIVA CADA VALOR ESPERADO (todos a mano desde la definición, ninguno copiado de
 * lo que devuelve la app; si el módulo discrepa de esta tabla, manda la tabla)
 *
 *   ΔEV = log₂(ISO/ISO₀) + 2·log₂(N₀/N) + log₂(t/t₀), POSITIVO = más luz = sobreexpuesto.
 *
 *    1 · f/4 → f/8            → −2·log₂(8/4) = −2·1        = −2 EV
 *    2 · ISO 200 → 1600       → log₂(1600/200) = log₂ 8     = +3 EV
 *    3 · 1/125 → 1/1000       → log₂(125/1000) = log₂(1/8)  = −3 EV
 *    4 · f/2,8 → f/1,4 = +2 EV; la velocidad debe dar −2 → 1/125 ÷ 4 = 1/500 s
 *    5 · f/11 → f/22 = −2·log₂ 2 = −2 EV; el ISO debe dar +2 → 100 × 4 = ISO 400
 *    6 · 1/1000 → 1/4000 = −2 EV; el diafragma debe dar +2 → f/4 ÷ 2 = f/2
 *    7 · ISO ×4 (+2) y f/2 → f/4 (−2·log₂ 2 = −2)          = 0 EV
 *    8 · ISO ×4 (+2) y f/2 → f/8 (−2·log₂ 4 = −4)          = −2 EV
 *    9 · f/8 → f/11  → −2·log₂(11/8)  = −2·0,4594316 = −0,9188632 → −0,92 EV
 *   10 · 1/60 → 1/125 → log₂(60/125)  = −1,0588937             → −1,06 EV
 *   11 · 1/1000 → 1/250 = +2 EV; el ISO debe dar −2 → 400 ÷ 4 = ISO 100
 *   12 · ISO 1600 → 400 = −2 EV; el diafragma debe dar +2 → f/5,6 ÷ 2 = f/2,8
 *
 * Los casos 9 y 10 son los que fijan el convenio de esta app: las escalas están ROTULADAS con
 * números comerciales redondeados (f/11 por 11,314; 1/125 por 1/128), así que un salto de
 * rótulo NO vale siempre un stop entero. Los otros diez se mueven dentro de familias exactas
 * justamente para que su respuesta no dependa de ese redondeo.
 * ═══════════════════════════════════════════════════════════════════════════════════════ */

import {
  CASOS,
  TOTAL_CASOS,
  resolverCaso,
  toleranciaDe,
  comprobarRespuesta,
  generarEjercicioAleatorio,
  textoRespuesta,
  isoStops,
  apertureStops,
  shutterStops,
  calcDeltaEV,
  ISO_VALUES,
  APERTURE_VALUES,
  SHUTTER_VALUES,
  SHUTTER_DENOMINADORES,
  FAMILIAS_APERTURA,
  FAMILIAS_VELOCIDAD,
  textoApertura,
  textoVelocidad,
} from '../../app/simulador-fotografia/casos';

const A_MANO: Readonly<Record<number, number>> = {
  1: -2, 2: 3, 3: -3, 4: 500, 5: 400, 6: 2, 7: 0, 8: -2, 9: -0.92, 10: -1.06, 11: 100, 12: 2.8,
};

test.describe('casos para clase · simulador-fotografia', () => {
  test('1 · hay doce casos con ids 1..12 sin huecos', async () => {
    expect(TOTAL_CASOS).toBe(12);
    expect(CASOS.map((c) => c.id)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  });

  test('2 · son deterministas: dos lecturas dan el mismo enunciado y la misma respuesta', async () => {
    for (const caso of CASOS) {
      const gemelo = CASOS.find((c) => c.id === caso.id)!;
      expect(gemelo.enunciado).toBe(caso.enunciado);
      expect(gemelo.respuesta).toBe(caso.respuesta);
    }
  });

  test('3 · la respuesta declarada coincide con recalcularla desde `datos`', async () => {
    for (const caso of CASOS) {
      const r = resolverCaso(caso.datos);
      expect(r.ok, `caso ${caso.id}: ${r.error ?? ''}`).toBe(true);
      const decimales = caso.datos.decimales ?? 2;
      const factor = 10 ** decimales;
      expect(Math.round(r.valor * factor) / factor, `caso ${caso.id}`).toBeCloseTo(caso.respuesta, 6);
    }
  });

  test('3.bis · cada respuesta coincide con la calculada A MANO en la cabecera', async () => {
    for (const caso of CASOS) {
      expect(caso.respuesta, `caso ${caso.id} · ${caso.titulo}`).toBeCloseTo(A_MANO[caso.id], 2);
    }
  });

  test('4 · cada caso tiene enunciado, etiqueta no vacía, respuesta finita y desarrollo', async () => {
    for (const caso of CASOS) {
      expect(caso.enunciado.length, `caso ${caso.id}`).toBeGreaterThan(40);
      expect(caso.etiquetaRespuesta.trim(), `caso ${caso.id}`).not.toBe('');
      expect(Number.isFinite(caso.respuesta), `caso ${caso.id}`).toBe(true);
      expect(caso.pasos.length, `caso ${caso.id}`).toBeGreaterThan(1);
      expect(caso.pista.trim(), `caso ${caso.id}`).not.toBe('');
      expect(caso.respuestaTexto, `caso ${caso.id}`).not.toBe('—');
    }
  });

  test('4.bis · los casos con respuesta no redonda avisan de que hay que redondear', async () => {
    // Si la respuesta no cae en un múltiplo de 0,25 EV, el enunciado TIENE que pedir el
    // redondeo: si no, el alumno no sabe con cuántos decimales se le va a corregir.
    for (const caso of CASOS.filter((c) => c.datos.pregunta === 'deltaEV')) {
      const redonda = Math.abs(caso.respuesta * 4 - Math.round(caso.respuesta * 4)) < 1e-9;
      if (!redonda) {
        expect(caso.requiereRedondeo, `caso ${caso.id}`).toBe(true);
        expect(caso.enunciado.toLowerCase(), `caso ${caso.id}`).toContain('redondea');
      }
    }
  });

  test('5 · ningún enunciado nombra un país, una ciudad ni una moneda', async () => {
    // El canal de aula es 90 % latinoamericano y España solo el 8,6 %: un enunciado anclado
    // a un lugar excluye a la mayor parte de quien lo va a leer.
    const PROHIBIDO =
      /\b(España|Espana|México|Mexico|Colombia|Argentina|Perú|Peru|Chile|Uruguay|Bolivia|Guatemala|Madrid|Barcelona|Bogotá|Lima|euros?|dólares?|pesos?)\b/i;
    for (const caso of CASOS) {
      expect(PROHIBIDO.test(`${caso.titulo} ${caso.enunciado}`), `caso ${caso.id}`).toBe(false);
    }
  });

  test('6 · el generador aleatorio es reproducible, variado y usa la misma aritmética', async () => {
    // Reproducible: misma semilla, mismo ejercicio.
    for (const semilla of [1, 7, 12345, 98765]) {
      const a = generarEjercicioAleatorio(semilla);
      const b = generarEjercicioAleatorio(semilla);
      expect(b.enunciado).toBe(a.enunciado);
      expect(b.respuesta).toBe(a.respuesta);
    }

    // Variado: un generador degenerado PASA la prueba de reproducibilidad (simulador-genetica,
    // 14/09/2026), así que hay que pedirle varias semillas a la vez y contar respuestas.
    const respuestas = new Set<string>();
    for (let s = 1; s <= 40; s++) respuestas.add(String(generarEjercicioAleatorio(s).respuesta));
    expect(respuestas.size, 'respuestas distintas en 40 semillas').toBeGreaterThanOrEqual(3);

    // Misma aritmética que los fijos: su respuesta se recalcula con el mismo `resolverCaso`.
    for (let s = 1; s <= 40; s++) {
      const ej = generarEjercicioAleatorio(s);
      const r = resolverCaso(ej.datos);
      expect(r.ok, `semilla ${s}: ${r.error ?? ''}`).toBe(true);
      const decimales = ej.datos.decimales ?? 2;
      const factor = 10 ** decimales;
      expect(Math.round(r.valor * factor) / factor, `semilla ${s}`).toBeCloseTo(ej.respuesta, 6);
      expect(Number.isFinite(ej.respuesta), `semilla ${s}`).toBe(true);
      expect(ej.etiquetaRespuesta.trim(), `semilla ${s}`).not.toBe('');
    }
  });

  /* ── 7 · el convenio de ESTA app, fijado para que nadie lo cambie sin querer ── */

  test('7 · el signo es el del fotómetro: positivo = MÁS luz', async () => {
    // Abrir el diafragma (número f menor) mete luz; cerrarlo la quita. Con el EV clásico
    // EV = log₂(N²/t) saldría justo al revés, y el pie de la app lo advierte.
    const abrir = resolverCaso({ iso0: 100, ap0: 8, den0: 250, ap1: 4, pregunta: 'deltaEV' });
    expect(abrir.valor).toBeCloseTo(2, 10);
    const cerrar = resolverCaso({ iso0: 100, ap0: 4, den0: 250, ap1: 8, pregunta: 'deltaEV' });
    expect(cerrar.valor).toBeCloseTo(-2, 10);

    // Subir el ISO mete luz; alargar la exposición también.
    const iso = resolverCaso({ iso0: 100, ap0: 4, den0: 250, iso1: 400, pregunta: 'deltaEV' });
    expect(iso.valor).toBeCloseTo(2, 10);
    const lenta = resolverCaso({ iso0: 100, ap0: 4, den0: 1000, den1: 250, pregunta: 'deltaEV' });
    expect(lenta.valor).toBeCloseTo(2, 10);
  });

  test('7.bis · la luz va con el CUADRADO del número f, no con el número f', async () => {
    // Es el error clásico del tema: duplicar f no divide la luz entre 2 sino entre 4.
    const r = resolverCaso({ iso0: 100, ap0: 2, den0: 250, ap1: 4, pregunta: 'deltaEV' });
    expect(r.valor).toBeCloseTo(-2, 10);
    expect(Math.abs(r.valor + 1)).toBeGreaterThan(0.5);
  });

  test('7.ter · las escalas son NOMINALES: f/11 y 1/125 no valen un stop entero', async () => {
    // Si alguien «arreglase» las escalas poniendo 11,314 y 1/128, estos dos casos cambiarían
    // y con ellos lo que la app enseña. Los valores son los que se rotulan en una cámara.
    const f11 = resolverCaso({ iso0: 200, ap0: 8, den0: 125, ap1: 11, pregunta: 'deltaEV' });
    expect(f11.valor).toBeCloseTo(-2 * Math.log2(11 / 8), 10);
    expect(f11.valor).toBeCloseTo(-0.9188632, 6);

    const v125 = resolverCaso({ iso0: 400, ap0: 5.6, den0: 60, den1: 125, pregunta: 'deltaEV' });
    expect(v125.valor).toBeCloseTo(Math.log2(60 / 125), 10);
    expect(v125.valor).toBeCloseTo(-1.0588937, 6);
  });

  test('7.quater · dentro de una familia exacta el salto SÍ vale un número entero de stops', async () => {
    // Es la razón por la que los diez casos restantes usan solo estas familias.
    for (const familia of FAMILIAS_APERTURA) {
      for (let i = 1; i < familia.length; i++) {
        const r = resolverCaso({
          iso0: 100, ap0: familia[i - 1], den0: 250, ap1: familia[i], pregunta: 'deltaEV',
        });
        expect(r.valor, `f/${familia[i - 1]} a f/${familia[i]}`).toBeCloseTo(-2, 9);
      }
    }
    for (const familia of FAMILIAS_VELOCIDAD) {
      for (let i = 1; i < familia.length; i++) {
        const r = resolverCaso({
          iso0: 100, ap0: 4, den0: familia[i - 1], den1: familia[i], pregunta: 'deltaEV',
        });
        expect(r.valor, `1/${familia[i - 1]} a 1/${familia[i]}`).toBeCloseTo(-1, 9);
      }
    }
  });

  test('7.quinquies · las dos listas de velocidad describen la MISMA escala', async () => {
    // `SHUTTER_DENOMINADORES` existe para que los casos hablen de enteros; si alguien tocara
    // una lista y no la otra, los enunciados dirían una velocidad y el motor calcularía otra.
    expect(SHUTTER_DENOMINADORES.length).toBe(SHUTTER_VALUES.length);
    SHUTTER_VALUES.forEach((v, i) => {
      expect(v, `puesto ${i}`).toBe(1 / SHUTTER_DENOMINADORES[i]);
    });
  });

  test('7.sexies · la vista y los casos calculan con LA MISMA función', async () => {
    // `page.tsx` importa estas cinco de `casos.ts`. La comprobación es que el ΔEV de un caso
    // coincide con el que el medidor de la app produciría para esa misma combinación.
    const ref = { isoIdx: 0, apIdx: 3, shIdx: 8 }; // ISO 100 · f/4 · 1/250
    const conCasos = resolverCaso({ iso0: 100, ap0: 4, den0: 250, ap1: 8, pregunta: 'deltaEV' }).valor;
    const conVista = calcDeltaEV(0, (APERTURE_VALUES as readonly number[]).indexOf(8), 8, ref);
    expect(conCasos).toBeCloseTo(conVista, 12);

    // Y las tres funciones de stops siguen valiendo lo que la app documenta.
    expect(isoStops((ISO_VALUES as readonly number[]).indexOf(400))).toBeCloseTo(2, 12);
    expect(apertureStops((APERTURE_VALUES as readonly number[]).indexOf(2.8))).toBeCloseTo(-2, 12);
    expect(shutterStops((SHUTTER_DENOMINADORES as readonly number[]).indexOf(4))).toBeCloseTo(-2, 12);
  });

  /* ── Corrección ── */

  test('la corrección tolera el redondeo pero no una respuesta equivocada', async () => {
    const caso9 = CASOS.find((c) => c.id === 9)!;
    expect(comprobarRespuesta(-0.92, caso9.respuesta).correcto).toBe(true);
    expect(comprobarRespuesta(-1, caso9.respuesta).correcto).toBe(false);
    expect(toleranciaDe(0)).toBe(0.01);
    expect(toleranciaDe(500)).toBe(5);
  });

  test('el signo invertido se corrige con un mensaje propio, no con un «te has desviado»', async () => {
    // Quien viene de la definición clásica EV = log₂(N²/t) invierte TODOS los signos, y
    // decirle solo «no es correcto» no le enseña dónde está el malentendido.
    const v = comprobarRespuesta(2, -2);
    expect(v.correcto).toBe(false);
    expect(v.motivo).toContain('signo');
  });

  test('una entrada que no es número se responde con un veredicto, no con NaN en pantalla', async () => {
    const v = comprobarRespuesta(NaN, -2);
    expect(v.correcto).toBe(false);
    expect(v.motivo).not.toContain('NaN');
    expect(textoRespuesta(NaN, 'deltaEV')).toBe('—');
  });

  test('un caso sin respuesta en la escala se rechaza en vez de dar el valor más parecido', async () => {
    // De f/8 a f/11 hay 0,92 EV: ningún ISO de la escala compensa eso, porque todos van de
    // stop en stop. La resolución tiene que fallar, no devolver ISO 200 como si valiera.
    const r = resolverCaso({ iso0: 100, ap0: 8, den0: 250, ap1: 11, pregunta: 'iso' });
    expect(r.ok).toBe(false);
    expect(r.error).toBeTruthy();
    expect(Number.isFinite(r.valor)).toBe(false);
  });

  test('el texto de la respuesta lleva siempre su unidad', async () => {
    expect(textoRespuesta(-2, 'deltaEV')).toBe('-2 EV');
    expect(textoRespuesta(400, 'iso')).toBe('ISO 400');
    expect(textoRespuesta(2.8, 'apertura')).toBe('f/2,8');
    expect(textoRespuesta(500, 'velocidad')).toBe('1/500 s');
    expect(textoRespuesta(1, 'velocidad')).toBe('1 s');
  });
});

/* ═══════════════════════════════════════════════════════════════════════════════════════
 * TERCERA INSPECCIÓN · 29/09/2026 — la tarea de aula EN EL NAVEGADOR
 *
 * Los tests de arriba ejercitan `casos.ts` como módulo puro. Estos lo ejercitan por donde
 * entra el alumno: el campo de texto, el botón «Comprobar» y el veredicto pintado. Cada
 * esperado está resuelto a mano ANTES de abrir la app (convenio de la app: + = más luz).
 *
 * TOLERANCIA de la corrección: máx(0,01; 1 % del esperado), más 1e-9 de ruido binario.
 *
 *   Caso 1 · f/4 → f/8:  −2·log₂(8/4) = −2 EV            → tolerancia 0,02
 *            «−1» (duplicar f = 1 paso, el error clásico) → desviación 1
 *            «2» → |2 + (−2)| = 0 → mensaje del SIGNO
 *   Caso 4 · f/2,8 → f/1,4 = 2·log₂(2) = +2 EV; la velocidad devuelve −2: 125·4 = 1/500 s
 *            tolerancia 5 · «512» (1/128·4, la serie «real») → desviación 12, se rechaza
 *   Caso 12 · ISO 1600 → 400 = −2 EV; el diafragma devuelve +2: 5,6/2 = f/2,8
 *   Caso 9 (BORDE) · −2·log₂(11/8) = −0,918863 → −0,92; tolerancia máx(0,01; 0,0092) = 0,01
 *            «−0,93» y «−0,91» → desviación 0,01 = tolerancia → correctos
 *            «−0,94» → 0,02 → rechazo · «−0,9» (lo que dan los deslizadores) → 0,02 → rechazo
 *   Caso 10 (BORDE) · log₂(60/125) = −1,058894 → −1,06; tolerancia 0,0106
 *            «−1,07» y «−1,05» → 0,01 → correctos · «−1» (contar muescas) → 0,06 → rechazo
 *   Rechazo · «abc» y «1/500» → no son números → mensaje propio, nunca «NaN»
 * ═══════════════════════════════════════════════════════════════════════════════════════ */

/** El veredicto de la tarea de aula; NO `getByRole('alert')`, que casa con el anunciador de Next. */
function veredictoAula(page: Page): Locator {
  return page.locator('[class*="casoVeredicto"][role="alert"]');
}

async function irACaso(page: Page, n: number): Promise<void> {
  await page.getByRole('button', { name: new RegExp(`^Caso ${n}:`) }).click();
  await expect(page.locator('h3[class*="casoTitulo"]')).toHaveText(new RegExp(`^Caso ${n} ·`));
}

/** Escribe la respuesta, espera a que React la tenga, pulsa «Comprobar» y devuelve el veredicto. */
async function responderAula(page: Page, texto: string): Promise<string> {
  const campo = page.locator('#casos-respuesta');
  await campo.fill(texto);
  await esperarValorEnReact(page, '#casos-respuesta', texto);
  await expect(veredictoAula(page)).toHaveCount(0); // escribir borra el veredicto anterior
  await page.getByRole('button', { name: 'Comprobar', exact: true }).click();
  await expect(veredictoAula(page)).toBeVisible();
  return ((await veredictoAula(page).textContent()) ?? '').trim();
}

/**
 * Contraste WCAG entre el texto y su fondo EFECTIVO (compone los fondos translúcidos de los
 * ancestros sobre el primero opaco). Mismo método que conversor-numeros-letras.
 */
async function contrasteEfectivo(el: Locator): Promise<number> {
  return el.evaluate((nodo) => {
    const rgba = (c: string) => {
      const n = (c.match(/[\d.]+/g) ?? []).map(Number);
      return [n[0], n[1], n[2], n.length > 3 ? n[3] : 1];
    };
    const capas: number[][] = [];
    for (let e: Element | null = nodo; e; e = e.parentElement) {
      const c = rgba(getComputedStyle(e).backgroundColor);
      if (c[3] > 0) capas.push(c);
      if (c[3] >= 1) break;
    }
    let fondo = [255, 255, 255];
    for (const c of capas.reverse()) fondo = fondo.map((v, i) => v * (1 - c[3]) + c[i] * c[3]);
    const lum = ([r, g, b]: number[]) => {
      const f = (v: number) => {
        const s = v / 255;
        return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
      };
      return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
    };
    const a = lum(rgba(getComputedStyle(nodo).color));
    const b = lum(fondo);
    return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
  });
}

test('AULA · CASO NORMAL: los casos 1, 4 y 12 se corrigen con la respuesta resuelta a mano', async ({
  page,
}) => {
  await irACaso(page, 1);
  expect(await responderAula(page, '-2')).toContain('¡Correcto!');
  expect(await responderAula(page, '-1')).toContain('Te has desviado 1 de la respuesta');
  expect(await responderAula(page, '2')).toContain('el signo va al revés');
  await page.getByRole('button', { name: /Ver solución/ }).click();
  await expect(page.locator('[class*="casoResultado"]')).toHaveText('Respuesta: -2 EV');

  await irACaso(page, 4);
  // Cambiar de caso limpia la respuesta y el veredicto anteriores
  await expect(page.locator('#casos-respuesta')).toHaveValue('');
  await expect(veredictoAula(page)).toHaveCount(0);
  expect(await responderAula(page, '500')).toContain('¡Correcto!');
  expect(await responderAula(page, '512')).toContain('Te has desviado 12 de la respuesta');
  await page.getByRole('button', { name: /Ver solución/ }).click();
  await expect(page.locator('[class*="casoResultado"]')).toHaveText('Respuesta: 1/500 s');

  await irACaso(page, 12);
  expect(await responderAula(page, '2,8')).toContain('¡Correcto!');
  expect(await responderAula(page, '5,6')).toContain('No es correcto');
});

test('AULA · CASO LÍMITE: el borde exacto de la tolerancia en los casos 9 y 10', async ({ page }) => {
  await irACaso(page, 9);
  expect(await responderAula(page, '-0,92')).toContain('¡Correcto!');
  // ±0,01 es justo la tolerancia: se acepta por los DOS lados (reparación del hallazgo 1211)
  expect(await responderAula(page, '-0,93')).toContain('¡Correcto!');
  expect(await responderAula(page, '-0,91')).toContain('¡Correcto!');
  expect(await responderAula(page, '-0,94')).toContain('Te has desviado 0,02 de la respuesta');
  // Contar el salto f/8 → f/11 como un paso entero es el error que el caso existe para enseñar
  expect(await responderAula(page, '-1')).toContain('Te has desviado 0,08 de la respuesta');

  await irACaso(page, 10);
  expect(await responderAula(page, '-1,06')).toContain('¡Correcto!');
  expect(await responderAula(page, '-1,07')).toContain('¡Correcto!');
  expect(await responderAula(page, '-1,05')).toContain('¡Correcto!');
  expect(await responderAula(page, '-1')).toContain('Te has desviado 0,06 de la respuesta');
});

test('AULA · CASO RECHAZO: lo que no es un número se responde con un mensaje, nunca con NaN', async ({
  page,
}) => {
  await irACaso(page, 1);
  const abc = await responderAula(page, 'abc');
  expect(abc).toContain('Escribe un número');
  expect(abc).not.toContain('NaN');
  await irACaso(page, 4);
  expect(await responderAula(page, '1/500')).toContain('Escribe un número');
  // Enter también comprueba (onKeyDown), como el botón
  await page.locator('#casos-respuesta').fill('500');
  await esperarValorEnReact(page, '#casos-respuesta', '500');
  await page.locator('#casos-respuesta').press('Enter');
  await expect(veredictoAula(page)).toContainText('¡Correcto!');
});

test('AULA · accesibilidad: el enunciado se anuncia sin crear un segundo role="status"', async ({
  page,
}) => {
  // d0ff643d: con role="status" en el enunciado el localizador del medidor encontraba DOS
  await expect(page.locator('[role="status"]')).toHaveCount(1);
  const enunciado = page.locator('p[class*="casoEnunciado"]');
  await expect(enunciado).toHaveAttribute('aria-live', 'polite');
  await irACaso(page, 7);
  await expect(enunciado).toContainText('Subes el ISO a 400');
  await expect(page.getByRole('button', { name: /^Caso 7:/ })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('button', { name: /^Caso 1:/ })).toHaveAttribute('aria-pressed', 'false');
  const sinTipo = await page.evaluate(
    () =>
      [...document.querySelectorAll('[class*="casosSection"] button')].filter(
        (b) => b.getAttribute('type') !== 'button',
      ).length,
  );
  expect(sinTipo).toBe(0);
});

/**
 * ABIERTO (medio, operativa) · el aviso «El modo compensado ha llegado al límite: … ni el ISO ni
 * el diafragma tienen ya recorrido» sale con la exposición CORRECTA y los compañeros con margen.
 *
 * Retrato (ISO 800 · f/2,8 · 1/125 s), modo compensado, diafragma a f/5,6:
 *   2·log₂(2,8/5,6) = −2 stops; la velocidad devuelve +2 → 1/30 s, que vale log₂(125/30) =
 *   +2,058894 porque 1/30 es el rótulo de 1/32. ΔEV = +0,058894 → «Exposición correcta (+0,1 EV)».
 *   El ISO sigue en 800 con 3 pasos a cada lado; el residuo es el redondeo de la escala, no un tope.
 * `compensacionTopada` dispara con |ΔEV| > TOLERANCIA_EV = 0,05, por debajo de los residuos
 * propios de la escala (0,052 · 0,059 · 0,063 · 0,081 · 0,140). Barrido de los 87 puestos de un
 * deslizador en las tres escenas: 25 rotulan «Exposición correcta» y a la vez el aviso. Uno es
 * el caso 5 de aula (Paisaje f/11 → f/22: ISO 100 · f/22 · 1/60 s, +0,059 EV).
 */
test('ABIERTO · el aviso de «límite» del modo compensado no sale con la exposición correcta', async ({
  page,
}) => {
  test.fail();
  await elegirModo(page, 'compensado');
  await mover(page, 'ap-slider', 4);
  await expect(rotulo(page, 'ap-slider')).toHaveText('f/5,6');
  await expect(rotulo(page, 'sh-slider')).toHaveText('1/30 s');
  await expect(rotulo(page, 'iso-slider')).toHaveText('ISO 800');
  expect(await evDelMarcador(page)).toBeCloseTo(0.058894, 3);
  await expect(exposicion(page)).toContainText('Exposición correcta (+0,1 EV)');
  await expect(
    page.getByText('El modo compensado ha llegado al límite'),
    'ISO 800 tiene recorrido y el medidor dice «Exposición correcta»: el aviso de tope es falso',
  ).toHaveCount(0);
});

/**
 * ABIERTO (medio, contenido) · la sección dice «Puedes comprobar cada resultado moviendo los
 * deslizadores del simulador de arriba», y en los casos 9 y 10 hacerlo SUSPENDE. Es la forma
 * del hallazgo 1209 (simulador-movimiento-circular), cuya reparación no llegó a esta copia.
 *   Paisaje (ISO 100 · f/11 · 1/250 s), modo libre: f/8 → +0,9 EV; f/11 → +0,0 EV. El
 *   medidor rotula con UNA decimal, así que el salto f/8 → f/11 se lee −0,9, y el caso 9 pide
 *   −0,92 con tolerancia 0,01: «−0,9» → desviación 0,02 → «No es correcto».
 * El test acepta las dos salidas honestas: que la promesa desaparezca o que se cumpla.
 */
test('ABIERTO · si la sección promete comprobar con los deslizadores, el caso 9 lo admite', async ({
  page,
}) => {
  test.fail();
  const intro = (await page.locator('p[class*="casosIntro"]').textContent()) ?? '';
  const promete = /comprobar cada resultado moviendo los deslizadores/i.test(intro);

  await elegirEscena(page, 'Paisaje');
  await mover(page, 'ap-slider', 5);
  await expect(exposicion(page)).toContainText('(+0,9 EV)');
  await mover(page, 'ap-slider', 6);
  await expect(exposicion(page)).toContainText('(+0,0 EV)');
  // Lo que el alumno lee en el medidor: 0,0 − 0,9 = −0,9
  await irACaso(page, 9);
  const veredicto = await responderAula(page, '-0,9');
  expect(
    !promete || veredicto.includes('¡Correcto!'),
    `la sección promete comprobar con los deslizadores y el −0,9 que dan se corrige: «${veredicto}»`,
  ).toBe(true);
});

/**
 * ABIERTO (bajo, cálculo) · el aviso del SIGNO decide por el ruido binario en el borde, la
 * forma del 1211 en la rama que su reparación no tocó (`Math.abs(usuario + esperado) <=
 * tolerancia`, sin el margen de 1e-9). Caso 9, tolerancia 0,01:
 *   «−0,93» → |−0,93 − (−0,92)| = 0,01 → ¡Correcto! (con margen)
 *   «0,92»  → |0,92 + (−0,92)| = 0 → «el signo va al revés»
 *   «0,93»  → |0,93 + (−0,92)| = 0,010000000000000009 > 0,01 → «Te has desviado 1,85»
 * La misma desviación que con el signo bueno se acepta, con el signo malo pierde la pista.
 */
test('ABIERTO · el mensaje del signo cubre el mismo borde que la respuesta correcta (caso 9)', async ({
  page,
}) => {
  test.fail();
  await irACaso(page, 9);
  expect(await responderAula(page, '0,92')).toContain('el signo va al revés');
  expect(await responderAula(page, '-0,93')).toContain('¡Correcto!');
  expect(await responderAula(page, '0,93')).toContain('el signo va al revés');
});

/**
 * ABIERTO (bajo, cálculo) · sospecha S1 (27/09/2026), en su forma de ESCALA DISCRETA. La
 * respuesta de ISO, velocidad y diafragma es un valor de la escala de la cámara, pero se corrige
 * con el 1 % relativo: en el caso 11 (ISO 100, tolerancia 1) pasan «101», «99» y «100,5»,
 * ninguno un ISO que exista; en el caso 4 (1/500, tolerancia 5) pasan de «495» a «505» y
 * «500,5»; en el 5 (ISO 400) «404» y «400,4». Aquí, a diferencia de simulador-arboles-bst-avl,
 * sí cuela el ENTERO VECINO. Esperado: solo el valor de la escala.
 */
test('ABIERTO · un ISO que no existe en la escala no se da por bueno (caso 11)', async ({ page }) => {
  test.fail();
  await irACaso(page, 11);
  expect(await responderAula(page, '100')).toContain('¡Correcto!');
  expect(await responderAula(page, '102')).toContain('No es correcto');
  expect(await responderAula(page, '101'), 'ISO 101 no está en la escala').not.toContain('¡Correcto!');
  expect(await responderAula(page, '100,5'), 'ISO 100,5 no está en la escala').not.toContain('¡Correcto!');
});

/**
 * ABIERTO (bajo, operativa) · el signo menos tipográfico (U+2212) se rechaza como «no es un
 * número». La etiqueta del propio campo lo escribe así («− menos luz»), CasosAula.tsx dice en su
 * comentario que parseSpanishNumber «admite −0,92», y el veredicto contesta «puedes usar … el
 * signo menos» a quien acaba de usarlo. Caso 1: «−2» (U+2212) → esperado ¡Correcto!, como «-2».
 */
test('ABIERTO · el signo menos que escribe la etiqueta se acepta al responder (caso 1)', async ({
  page,
}) => {
  test.fail();
  await irACaso(page, 1);
  await expect(page.locator('label[for="casos-respuesta"]')).toContainText('− menos luz');
  expect(await responderAula(page, '-2')).toContain('¡Correcto!');
  expect(await responderAula(page, '−2')).toContain('¡Correcto!');
});

/**
 * ABIERTO (bajo, contenido) · en el modo práctica la solución afirma «Comprobación: sumando los
 * tres ejes, ΔEV = 0,00» cuando la suma con los números de la cámara no es cero. El generador
 * elige los datos dentro de una familia exacta, pero la RESPUESTA puede caer fuera: en las
 * semillas 1-20.000, 1.451 de 7.720 compensaciones (18,8 %) dejan ±0,03 EV — lo mismo que los
 * casos 9 y 10 enseñan a calcular.
 *   Semilla 22 (Date.now() = 22): ISO 1600 · f/8 · 1/8 s, diafragma a f/2, ¿velocidad?
 *     2·log₂(8/2) = +4 · la app responde 1/125 s: log₂(8/125) = −3,965784 → suma +0,034216 = +0,03
 *     (y «128», que es 8·2⁴ aplicando «×2 en t = 1 paso», se corrige «Te has desviado 3»)
 * El test lee el ejercicio que salga con esa semilla y rehace la suma con la fórmula, así que
 * sirve igual si la reparación cambia el generador.
 */
test('ABIERTO · la comprobación de la solución de práctica cuadra con la suma de los tres ejes', async ({
  page,
}) => {
  test.fail();
  await page.clock.setFixedTime(new Date(22));
  await page.goto(RUTA);
  await esperarHidratacion(page, [...DESLIZADORES, '#casos-respuesta']);
  await page.getByRole('button', { name: /Practicar/ }).click();
  await expect(page.locator('h3[class*="casoTitulo"]')).toHaveText('Ejercicio de práctica');
  const enunciado = (await page.locator('p[class*="casoEnunciado"]').textContent()) ?? '';
  await page.getByRole('button', { name: /Ver solución/ }).click();
  const pasos = await page.locator('[class*="casoPasos"] li').allTextContents();
  const respuesta = ((await page.locator('[class*="casoResultado"] strong').textContent()) ?? '').trim();

  const apDe = (t: string) => APERTURE_VALUES.find((v) => textoApertura(v) === t)!;
  const denDe = (t: string) => SHUTTER_DENOMINADORES.find((d) => textoVelocidad(d) === t)!;
  const partida = pasos[0].match(/^Partida: ISO (\d+) · (f\/[\d,]+) · (.+ s)\.$/)!;
  const iso0 = Number(partida[1]);
  const ap0 = apDe(partida[2]);
  const den0 = denDe(partida[3]);
  let iso1 = Number(enunciado.match(/llevas el ISO a (\d+)/)?.[1] ?? iso0);
  let ap1 = apDe(enunciado.match(/pasas el diafragma a (f\/[\d,]+)/)?.[1] ?? partida[2]);
  let den1 = denDe(enunciado.match(/pasas la velocidad a (.+? s)[ ,.y]/)?.[1] ?? partida[3]);
  if (respuesta.startsWith('ISO ')) iso1 = Number(respuesta.slice(4));
  else if (respuesta.startsWith('f/')) ap1 = apDe(respuesta);
  else if (respuesta.endsWith(' s')) den1 = denDe(respuesta);
  // ΔEV con los números rotulados: ISO + 2·log₂(N₀/N) + log₂(t/t₀), t = 1/den
  const suma = Math.log2(iso1 / iso0) + 2 * Math.log2(ap0 / ap1) + Math.log2(den0 / den1);

  const comprobacion = pasos.find((p) => p.startsWith('Comprobación'));
  test.skip(!comprobacion, 'la semilla dio una pregunta de ΔEV, sin línea de comprobación');
  const cifra = comprobacion!.match(/ΔEV = ([+\-−]?\d+,\d+)/)![1].replace('−', '-');
  expect(
    parseSpanishNumber(cifra),
    `«${comprobacion}» · ${enunciado} · respuesta ${respuesta} · suma real ${suma.toFixed(6)}`,
  ).toBeCloseTo(suma, 2);
});

/**
 * ABIERTO (bajo, contenido) · la pista del caso 10 dice lo contrario de lo que pasa. La serie
 * real de velocidades es de potencias de dos: 1/60 es el rótulo de 1/64 (el propio casos.ts lo
 * dice de 1/15 = 1/16) y 1/125 el de 1/128, así que el paso REAL 1/64 → 1/128 vale
 * log₂(128/64) = 1,00 EV, MENOR que el −1,06 que dan los rótulos. «Justo al revés que en el
 * caso 9» (allí el rótulo encoge el paso: 0,92 < 1) es que aquí el rótulo lo EXAGERA. La pista
 * dice «el rótulo se queda corto y el paso real es mayor», y el enunciado solo corrige 1/125
 * (= 1/128), dejando 1/60 como si fuera exacto.
 */
test('ABIERTO · la pista del caso 10 no presenta el paso real como mayor que el de los rótulos', async ({
  page,
}) => {
  test.fail();
  await irACaso(page, 10);
  await page.getByRole('button', { name: /Ver pista/ }).click();
  const pista = (await page.locator('[class*="casoPista"]').textContent()) ?? '';
  expect(pista).toContain('log₂(60/125)');
  expect(Math.log2(128 / 64)).toBeLessThan(Math.abs(Math.log2(60 / 125))); // 1 < 1,058894
  expect(pista, 'el paso real (1/64 → 1/128) es 1,00 EV, menor que el 1,06 de los rótulos').not.toMatch(
    /paso real es mayor/,
  );
});

/**
 * ABIERTO (medio, accesibilidad) · sospecha del 28/09, MEDIDA en el navegador con el fondo
 * compuesto. El título de cada caso (h3, 17,6 px / 600: texto normal, exige 4,5:1) va en
 * var(--secondary) sobre el #FAFAFA de .casoCuerpo: 2,68:1 en claro (en oscuro, #5ABDB9 sobre
 * #111827, 7,95:1, bien). Existe --secondary-texto (5,15:1) para esto.
 */
test('ABIERTO · el título del caso llega a 4,5:1 en el tema claro', async ({ page }) => {
  test.fail();
  await prepararParaMedir(page);
  await activarTema(page, 'dark');
  expect(await contrasteEfectivo(page.locator('h3[class*="casoTitulo"]'))).toBeGreaterThanOrEqual(4.5);
  await activarTema(page, 'light');
  const claro = await contrasteEfectivo(page.locator('h3[class*="casoTitulo"]'));
  expect(claro, `título del caso en claro: ${claro.toFixed(2)}:1`).toBeGreaterThanOrEqual(4.5);
});

/**
 * ABIERTO (medio, accesibilidad) · texto blanco sobre var(--primary) en los botones de la tarea:
 * «Comprobar» (16 px / 600) y el botón del caso activo (15,2 px / 600). 4,11:1 en claro y 2,80:1
 * en oscuro (#3FA5D1). «Ver pista» y «Ver solución» ponen var(--primary) sobre #FAFAFA: 3,93:1 en
 * claro. Todo es texto normal (4,5:1). Existen --primary-boton (5,47:1 con blanco, igual en los
 * dos temas) y --primary-texto.
 */
test('ABIERTO · los botones de la tarea de aula llegan a 4,5:1 en los dos temas', async ({ page }) => {
  test.fail();
  await prepararParaMedir(page);
  const medidas: string[] = [];
  let peor = Infinity;
  for (const tema of ['light', 'dark'] as const) {
    await activarTema(page, tema);
    await page.mouse.move(0, 0);
    for (const [nombre, sel] of [
      ['Comprobar', 'button[class*="casoComprobar"]'],
      ['caso activo', 'button[class*="casoBotonActivo"]'],
      ['Ver pista', 'button[class*="casoAyudaBoton"]'],
    ] as const) {
      const r = await contrasteEfectivo(page.locator(sel).first());
      medidas.push(`${tema} · ${nombre}: ${r.toFixed(2)}:1`);
      peor = Math.min(peor, r);
    }
  }
  expect(peor, medidas.join(' · ')).toBeGreaterThanOrEqual(4.5);
});

test.describe('móvil · Pixel 7', () => {
  test.use({
    viewport: { width: 412, height: 839 },
    userAgent:
      'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36',
    deviceScaleFactor: 2.625,
    isMobile: true,
    hasTouch: true,
  });

  /**
   * Caso 5 (Paisaje): f/11 → f/22 = −2·log₂(22/11) = −2 EV; el ISO devuelve +2: 100·4 = ISO 400.
   * Caso 1 con un NEGATIVO tecleado: el inputmode es «text» a propósito (el teclado decimal de
   * iOS no tiene signo menos) y −2 tiene que entrar.
   */
  test('AULA en móvil: se resuelve a toques, sin scroll horizontal y con dianas de 44 px', async ({
    page,
  }) => {
    const anchos = await page.evaluate(() => ({
      scroll: document.documentElement.scrollWidth,
      cliente: document.documentElement.clientWidth,
    }));
    expect(anchos.scroll).toBeLessThanOrEqual(anchos.cliente);

    await page.getByRole('button', { name: /^Caso 5:/ }).tap();
    await expect(page.locator('h3[class*="casoTitulo"]')).toHaveText(/^Caso 5 ·/);
    const campo = page.locator('#casos-respuesta');
    await expect(campo).toHaveAttribute('inputmode', 'text');
    await campo.tap();
    await campo.fill('400');
    await esperarValorEnReact(page, '#casos-respuesta', '400');
    await page.getByRole('button', { name: 'Comprobar', exact: true }).tap();
    await expect(veredictoAula(page)).toContainText('¡Correcto!');

    await page.getByRole('button', { name: /^Caso 1:/ }).tap();
    await campo.tap();
    await page.keyboard.type('-2');
    await esperarValorEnReact(page, '#casos-respuesta', '-2');
    await page.getByRole('button', { name: 'Comprobar', exact: true }).tap();
    await expect(veredictoAula(page)).toContainText('¡Correcto!');

    const alturas = await page
      .locator('[class*="casosSection"] button')
      .evaluateAll((bs) => bs.map((b) => Math.round(b.getBoundingClientRect().height)));
    expect(Math.min(...alturas)).toBeGreaterThanOrEqual(44);
  });
});
