import { test, expect, devices, type Page } from '@playwright/test';
import { esperarHidratacion, sembrarValor } from './_hidratacion';
import { contrasteSobreFondoReal } from './_contraste';

/**
 * Lupa Digital — test de regresión (Inspector, 20/08/2026)
 *
 * 1.455 usos reales, segmento «interactiva»: no hay ningún número que comprobar a mano,
 * así que lo que se audita es la OPERATIVA — que la app haga de verdad lo que promete.
 *
 * QUÉ PROMETE (de donde salen los valores esperados de este fichero):
 *   - <h1> «Lupa Digital Online» + subtítulo «Convierte tu móvil o celular en una lupa:
 *     amplía texto y objetos con la cámara».
 *   - metadata.ts → jsonLd.features: ampliación 1×–5×, congelar la imagen «para leerla sin
 *     sostener el teléfono, recorriéndola con el dedo o el teclado», filtros de
 *     accesibilidad, ajuste independiente de brillo y contraste, «Restablecer todos los
 *     ajustes de un toque» y «procesado 100 % local en el navegador, sin envío de imágenes».
 *   - FAQ: «La captura se hace a la resolución de la cámara y no a la de la pantalla»
 *     (RESPUESTA_IMAGEN_FIJA de metadata.ts desde el 19/10/2026; antes, «Se congela a la resolución
 *     de la cámara, no a la de la pantalla») y «pulsa "Detener", que apaga la cámara y reduce el
 *     consumo».
 *
 * CÓMO SE PRUEBA UNA APP DE CÁMARA: Chromium arranca con `--use-fake-device-for-media-stream`
 * (vídeo sintético) y `--use-fake-ui-for-media-stream` (concede el permiso sin diálogo).
 * Que el elemento <video> exista NO prueba nada: en los tres casos se comprueba que el medio
 * arranca de verdad (`readyState >= 2`, `videoWidth > 0` y `paused === false`).
 *
 * Los hallazgos de la inspección del 20/08/2026 (72, 73 y 74) se repararon el 21/08/2026 y sus
 * tests quedan al final como regresión normal. Los hallazgos NUEVOS de la re-inspección del
 * 13/10/2026 van en su propio bloque, marcados con `test.fail()`: afirman lo que la app debería
 * hacer y hoy fallan a propósito. El día que se reparen se pondrán en ROJO («expected to fail,
 * but passed») y habrá que quitarles la marca, quedando como regresión.
 *
 * La re-inspección del 14/10/2026 (zoom pedido a la cámara, e9435294) va al final, con una cámara
 * simulada que expone zoom por cámara y recuerda el que ha aplicado: se mide el aumento que se VE.
 * La del 15/10/2026 (tras f3e9c635) añade, también al final, el reparto con rangos raros, la imagen
 * congelada con la cámara haciendo todo el zoom y tres hallazgos (3315, 3316 y 3317) que se
 * repararon ese mismo día (3b52f497, 00153144 y 70cee569). La del 16/10/2026 comprueba que esas tres
 * reparaciones se sostienen con casos nuevos. La del 22/10/2026, la última del fichero, comprueba las
 * reparaciones de 3273, 3274, 3276 y 3327 con casos que las anteriores no miraban (el eje vertical al
 * girar, la rama sin cifra de la nota, el contraste con su valor exacto) y mide el cabo C0260.
 */

test.use({
  launchOptions: {
    args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream'],
  },
  permissions: ['camera'],
});

const RUTA = '/lupa-digital/';

/** Estado real del medio. Se lee del elemento, no del DOM que lo envuelve. */
function estadoDelVideo(page: Page) {
  return page.evaluate(() => {
    const v = document.querySelector('video');
    if (!v) return null;
    return { readyState: v.readyState, ancho: v.videoWidth, alto: v.videoHeight, pausado: v.paused };
  });
}

/**
 * La cámara simulada tarda unas décimas en entregar el primer fotograma. Hasta que
 * `readyState >= 2` (HAVE_CURRENT_DATA) y `videoWidth > 0`, congelar copiaría un lienzo vacío.
 */
async function esperarCamaraEnMarcha(page: Page) {
  await expect
    .poll(
      () =>
        page.evaluate(() => {
          const v = document.querySelector('video');
          return !!v && v.readyState >= 2 && v.videoWidth > 0 && !v.paused;
        }),
      { timeout: 15000, message: 'la cámara no llegó a entregar imagen' },
    )
    .toBe(true);
}

/** El visor es el contenedor del <video> y del <canvas>: de su ancho sale el tope de recorrido. */
function anchoDelVisor(page: Page) {
  return page.evaluate(() => document.querySelector('canvas')?.parentElement?.clientWidth ?? 0);
}

// ═══════════════════════════════════════════════════════════════════════════
// CASO 1 (escritorio) — la cámara arranca de verdad y los controles actúan sobre ella
// ═══════════════════════════════════════════════════════════════════════════
test('CASO 1 — zoom, filtro, brillo y «Restablecer» modifican la imagen en vivo, no solo el botón', async ({
  page,
}) => {
  await page.goto(RUTA);

  const video = page.locator('video');
  await expect(video).toBeHidden(); // sin activar, el visor enseña el placeholder
  await page.getByRole('button', { name: /Activar lupa/i }).click();
  await esperarCamaraEnMarcha(page);

  // El medio está reproduciendo. La app pide `width: { ideal: 1920 }` en sus constraints
  // (page.tsx), así que el dispositivo simulado entrega 1920×1080; se comprueba el suelo
  // para no atar el test a la resolución exacta del Chromium instalado.
  const arranque = await estadoDelVideo(page);
  expect(arranque?.pausado).toBe(false);
  expect(arranque?.readyState).toBeGreaterThanOrEqual(2);
  expect(arranque?.ancho).toBeGreaterThanOrEqual(640);

  // Zoom: el preajuste 3x tiene que llegar al transform del vídeo, no quedarse en el botón.
  await page.getByRole('button', { name: '3x', exact: true }).click();
  await expect(video).toHaveAttribute('style', /transform: scale\(3\)/);
  await expect(page.locator('h3', { hasText: /^Zoom/ })).toHaveText('Zoom: 3x');
  await expect(page.locator('[class*=zoomIndicador]')).toHaveText('3x');

  // Filtros: `getFiltroStyle()` apila siempre brightness+contrast base y luego el del filtro,
  // de modo que «Alto contraste» añade un contrast(200%) DETRÁS del contrast(100%) base.
  await page.getByRole('button', { name: /Alto contraste/i }).click();
  await expect(page.getByRole('button', { name: /Alto contraste/i })).toHaveAttribute('aria-pressed', 'true');
  await expect(video).toHaveAttribute('style', /filter: brightness\(100%\) contrast\(100%\) contrast\(200%\)/);

  // Brillo: el paso 5 de la guía recomienda «sube el brillo al 140–160 %».
  // Los tres <input type="range"> van en orden: zoom, brillo, contraste.
  await page.getByRole('slider').nth(1).fill('160');
  // Con espacio duro antes del % desde el 15/10/2026 (3317): «160%» consagraba la grafía pegada.
  await expect(page.locator('label', { hasText: /Brillo/ })).toHaveText('☀️ Brillo: 160 %');
  await expect(video).toHaveAttribute('style', /filter: brightness\(160%\) contrast\(100%\) contrast\(200%\)/);

  // Contraste, que la ficha promete como ajuste INDEPENDIENTE del brillo.
  await page.getByRole('slider').nth(2).fill('75');
  await expect(video).toHaveAttribute('style', /filter: brightness\(160%\) contrast\(75%\) contrast\(200%\)/);

  // «Restablecer todos los ajustes de un toque» (jsonLd.features): devuelve brillo, contraste
  // y filtro al origen. El zoom NO entra: el botón vive dentro de «Ajustes de imagen» y el
  // zoom es otra sección, así que 3x tiene que seguir puesto.
  await page.getByRole('button', { name: /Restablecer ajustes/i }).click();
  await expect(video).toHaveAttribute('style', /filter: brightness\(100%\) contrast\(100%\);/);
  await expect(page.getByRole('button', { name: /Normal/i })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('button', { name: '3x', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('h3', { hasText: /^Zoom/ })).toHaveText('Zoom: 3x');
});

// ═══════════════════════════════════════════════════════════════════════════
// CASO 2 (Pixel 7) — congelar, recorrer con el dedo y reanudar
// ═══════════════════════════════════════════════════════════════════════════
test.describe('en móvil (Pixel 7)', () => {
  // Se enumeran las opciones en vez de esparcir `...devices['Pixel 7']` porque el device
  // trae `defaultBrowserType`, y Playwright no lo admite dentro de un describe («forces a
  // new worker»). Lo que importa aquí es el viewport de 412×839 y, sobre todo, hasTouch.
  const PIXEL_7 = devices['Pixel 7'];
  test.use({
    viewport: PIXEL_7.viewport,
    userAgent: PIXEL_7.userAgent,
    deviceScaleFactor: PIXEL_7.deviceScaleFactor,
    isMobile: PIXEL_7.isMobile,
    hasTouch: PIXEL_7.hasTouch,
  });

  /**
   * Arrastre con el dedo de verdad (touch nativo por CDP, no eventos sintéticos).
   * El toque se sitúa por coordenadas de PANTALLA, así que el visor tiene que estar a la
   * vista: si la página quedó desplazada, el dedo cae fuera y no ocurre nada.
   */
  async function arrastrarConElDedo(page: Page, dx: number) {
    await page.evaluate(() =>
      document.querySelector('canvas')?.parentElement?.scrollIntoView({ block: 'center' }),
    );
    const centro = await page.evaluate(() => {
      const r = document.querySelector('canvas')?.parentElement?.getBoundingClientRect();
      return { x: Math.round((r?.x ?? 0) + (r?.width ?? 0) / 2), y: Math.round((r?.y ?? 0) + (r?.height ?? 0) / 2) };
    });
    const cdp = await page.context().newCDPSession(page);
    const dedo = (x: number) => [{ x, y: centro.y, radiusX: 5, radiusY: 5, force: 1, id: 1 }];
    const pasos = 8;
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: dedo(centro.x) });
    for (let i = 1; i <= pasos; i++) {
      await cdp.send('Input.dispatchTouchEvent', {
        type: 'touchMove',
        touchPoints: dedo(Math.round(centro.x + (dx * i) / pasos)),
      });
    }
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await cdp.detach();
  }

  test('CASO 2 — congelar deja la imagen fija a la resolución del sensor, se recorre con el dedo y «Reanudar» vuelve al directo', async ({
    page,
  }) => {
    await page.goto(RUTA);
    expect(page.viewportSize()).toEqual({ width: 412, height: 839 }); // devices['Pixel 7']

    await page.getByRole('button', { name: /Activar lupa/i }).click();
    await esperarCamaraEnMarcha(page);

    const video = page.locator('video');
    const lienzo = page.locator('canvas');
    await page.getByRole('button', { name: '4x', exact: true }).click();
    await page.getByRole('button', { name: /Congelar/i }).click();

    // El vídeo se aparta y se PAUSA (deja de consumir batería), y el lienzo ocupa su sitio.
    await expect(lienzo).toBeVisible();
    await expect(video).toBeHidden();
    await expect(page.getByText('Congelada')).toBeVisible();
    await expect(page.getByRole('button', { name: /Reanudar/i })).toHaveAttribute('aria-pressed', 'true');
    expect((await estadoDelVideo(page))?.pausado).toBe(true);

    // La promesa de la FAQ: «la captura se hace a la resolución de la cámara y no a la de la pantalla».
    // El visor del Pixel 7 mide 392 px (412 de viewport − 10 de padding a cada lado); el
    // fotograma copiado tiene que conservar el ancho del sensor, muy por encima de eso.
    const medidas = await page.evaluate(() => {
      const c = document.querySelector('canvas');
      const v = document.querySelector('video');
      return { lienzo: c?.width ?? 0, sensor: v?.videoWidth ?? 0, visor: c?.parentElement?.clientWidth ?? 0 };
    });
    expect(medidas.visor).toBe(392);
    expect(medidas.lienzo).toBe(medidas.sensor);
    expect(medidas.lienzo).toBeGreaterThan(medidas.visor * 2);

    // Recorrer la imagen quieta con el dedo: 80 px a la izquierda son 80 px de translate.
    await arrastrarConElDedo(page, -80);
    await expect(lienzo).toHaveAttribute('style', /translate\(-80px, 0px\) scale\(4\)/);

    // Y el recorrido está acotado: a 4× la imagen sobresale (4 − 1) / 2 del visor por cada
    // lado, o sea 392 × 3 / 2 = 588 px. Más allá solo habría fondo negro.
    expect(await anchoDelVisor(page)).toBe(392);
    await arrastrarConElDedo(page, -3000);
    await expect(lienzo).toHaveAttribute('style', /translate\(-588px, 0px\) scale\(4\)/);

    // «Reanudar» devuelve el directo: el vídeo vuelve a verse Y a reproducirse (un pause()
    // previo deja el elemento marcado como pausado y el atributo autoPlay ya no lo arranca).
    await page.getByRole('button', { name: /Reanudar/i }).click();
    await expect(video).toBeVisible();
    await expect(lienzo).toBeHidden();
    await expect.poll(async () => (await estadoDelVideo(page))?.pausado).toBe(false);

    // Nada de la app desborda a lo ancho en un móvil de 412 px.
    const ancho = await page.evaluate(() => ({
      documento: document.documentElement.scrollWidth,
      pantalla: window.innerWidth,
    }));
    expect(ancho.documento).toBe(ancho.pantalla);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// CASO 3 (escritorio) — la cámara se apaga de verdad y la imagen no sale del navegador
// ═══════════════════════════════════════════════════════════════════════════
test('CASO 3 — «Detener» termina los tracks de la cámara y ninguna imagen viaja a la red', async ({
  page,
}) => {
  // La promesa es doble: «procesado 100 % local en el navegador, sin envío de imágenes»
  // (jsonLd.features) y «pulsa "Detener", que apaga la cámara y reduce el consumo» (FAQ).
  const peticiones: { url: string; metodo: string; bytes: number }[] = [];
  page.on('request', (r) => {
    const cuerpo = r.postData();
    peticiones.push({ url: r.url(), metodo: r.method(), bytes: cuerpo ? Buffer.byteLength(cuerpo) : 0 });
  });

  // Se retiene el MediaStream que la app pide, para poder mirarle el estado a los tracks:
  // detenerCamara() los para, pero no deja rastro en el DOM.
  await page.addInitScript(() => {
    const original = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
    navigator.mediaDevices.getUserMedia = async (c?: MediaStreamConstraints) => {
      const s = await original(c);
      const w = window as unknown as { __tomas: MediaStream[] };
      w.__tomas = (w.__tomas ?? []).concat([s]);
      return s;
    };
  });

  await page.goto(RUTA);
  await page.getByRole('button', { name: /Activar lupa/i }).click();
  await esperarCamaraEnMarcha(page);

  const estadoTracks = () =>
    page.evaluate(() => {
      const w = window as unknown as { __tomas?: MediaStream[] };
      return (w.__tomas ?? []).flatMap((s) => s.getTracks().map((t) => t.readyState));
    });

  expect(await estadoTracks()).toEqual(['live']);

  // Dos segundos de lupa encendida: tiempo de sobra para que la imagen «viajase» si viajara.
  await page.waitForTimeout(2000);

  await page.getByRole('button', { name: /Detener/i }).click();
  await expect(page.getByText('Pulsa para activar la lupa')).toBeVisible();
  await expect(page.locator('video')).toBeHidden();

  // Apagar la cámara es que el track quede 'ended'. Si siguiera 'live', el piloto del móvil
  // se quedaría encendido y el consumo con él, justo lo contrario de lo que dice la FAQ.
  expect(await estadoTracks()).toEqual(['ended']);

  // Ni una sola petición fuera del propio origen, y ninguna con carga: un fotograma de
  // 640×480 en JPEG pesa decenas de KB, así que el listón de 2 KB deja pasar telemetría
  // pequeña pero no una imagen.
  const origen = new URL(page.url()).origin;
  expect(peticiones.filter((p) => !p.url.startsWith(origen))).toEqual([]);
  expect(peticiones.filter((p) => p.bytes > 2048)).toEqual([]);
  expect(peticiones.length).toBeGreaterThan(0); // el listener estaba puesto de verdad
});

// ═══════════════════════════════════════════════════════════════════════════
// CASO 4 — el zoom se pide primero a la CÁMARA y solo el resto se amplía en pantalla
// (semilla S0201, 13/10/2026)
// ═══════════════════════════════════════════════════════════════════════════
/**
 * La cámara simulada de Chromium no expone `zoom`, así que se le pone una que amplía de 1x a
 * 3x en pasos de 0,1, como la de un Android con Chrome, y se anota cada zoom que la app le
 * pide. Con `falla: true`, applyConstraints rechaza el zoom, como cuando el usuario no
 * concede el permiso de controlarlo.
 */
async function simularCamaraConZoom(page: Page, falla = false) {
  await page.addInitScript((rechazar: boolean) => {
    const w = window as unknown as { __zoomPedido: number[] };
    w.__zoomPedido = [];
    const proto = MediaStreamTrack.prototype;
    const capacidadesOriginal = proto.getCapabilities;
    const aplicarOriginal = proto.applyConstraints;
    proto.getCapabilities = function (this: MediaStreamTrack) {
      const c = capacidadesOriginal.call(this);
      return this.kind === 'video' ? { ...c, zoom: { min: 1, max: 3, step: 0.1 } } : c;
    };
    proto.applyConstraints = function (this: MediaStreamTrack, c?: MediaTrackConstraints) {
      const zoom = (c?.advanced?.[0] as { zoom?: number } | undefined)?.zoom;
      if (typeof zoom !== 'number') return aplicarOriginal.call(this, c);
      if (rechazar) return Promise.reject(new DOMException('Sin permiso de zoom', 'NotAllowedError'));
      w.__zoomPedido.push(zoom);
      return Promise.resolve();
    };
  }, falla);
}

const zoomPedido = (page: Page) =>
  page.evaluate(() => (window as unknown as { __zoomPedido: number[] }).__zoomPedido);

test('CASO 4 — con una cámara que amplía hasta 3x, la lupa le pide el zoom a ella y amplía en pantalla solo el resto', async ({
  page,
}) => {
  await simularCamaraConZoom(page);
  await page.goto(RUTA);
  await page.getByRole('button', { name: /Activar lupa/i }).click();
  await esperarCamaraEnMarcha(page);

  const video = page.locator('video');
  const lienzo = page.locator('canvas');
  const nota = page.locator('[class*=zoomNota]');

  // 2x por defecto: entero dentro del rango de la cámara, la pantalla no amplía nada.
  await expect.poll(async () => (await zoomPedido(page)).at(-1)).toBe(2);
  await expect(video).toHaveAttribute('style', /transform: scale\(1\)/);
  await expect(nota).toHaveText(/Los 2x los hace la propia cámara/);

  // 5x: la cámara llega a 3 y faltan 5 / 3 = 1,667 en pantalla. El indicador sigue diciendo 5x.
  await page.getByRole('button', { name: '5x', exact: true }).click();
  await expect.poll(async () => (await zoomPedido(page)).at(-1)).toBe(3);
  await expect(video).toHaveAttribute('style', /transform: scale\(1\.667\)/);
  await expect(nota).toHaveText('La cámara hace 3x y el resto (1,7x) se amplía en pantalla.');
  await expect(page.locator('[class*=zoomIndicador]')).toHaveText('5x');

  // Congelada a 5x, la imagen ya trae dentro los 3x de la cámara: en pantalla va 1,667.
  await page.getByRole('button', { name: /Congelar/i }).click();
  await expect(lienzo).toHaveAttribute('style', /scale\(1\.667\)/);
  const pedidosAlCongelar = (await zoomPedido(page)).length;

  // Con la imagen quieta, bajar el zoom solo cambia la pantalla: a la cámara no se le pide
  // nada (no hay nada que capturar). A 3x la imagen se ve tal cual se tomó, sin recorrido.
  await page.getByRole('button', { name: '3x', exact: true }).click();
  await expect(lienzo).toHaveAttribute('style', /translate\(0px, 0px\) scale\(1\)/);
  await page.getByRole('button', { name: '2x', exact: true }).click();
  await expect(lienzo).toHaveAttribute('style', /scale\(0\.667\)/);
  expect((await zoomPedido(page)).length).toBe(pedidosAlCongelar);
  await expect(nota).toBeHidden();

  // Al reanudar, la cámara vuelve a recibir el zoom actual.
  await page.getByRole('button', { name: /Reanudar/i }).click();
  await expect.poll(async () => (await zoomPedido(page)).at(-1)).toBe(2);
  await expect(video).toHaveAttribute('style', /transform: scale\(1\)/);
});

test('CASO 5 — si la cámara rechaza el zoom, todo vuelve a ampliarse en pantalla y la nota desaparece', async ({
  page,
}) => {
  await simularCamaraConZoom(page, true);
  await page.goto(RUTA);
  await page.getByRole('button', { name: /Activar lupa/i }).click();
  await esperarCamaraEnMarcha(page);

  await page.getByRole('button', { name: '3x', exact: true }).click();
  await expect(page.locator('video')).toHaveAttribute('style', /transform: scale\(3\)/);
  await expect(page.locator('[class*=zoomNota]')).toHaveCount(0);
});

/**
 * REGRESIÓN heredada de la inspección anterior (lote mecánico del Inspector, 18/08/2026).
 * Estos tres hallazgos ya están reparados: se conservan tal cual porque cubren rincones que
 * los CASOS 1-3 no tocan (la segunda cámara, la linterna y la tabla del bloque educativo).
 */
test.describe('lupa-digital — lote mecánico 18/08/2026', () => {
  test('hallazgo 32 — «Cambiar cámara» pide el facingMode NUEVO ya en la primera pulsación', async ({ page }) => {
    // iniciarCamara leía camaraActual del closure de la render previa, así que la
    // segunda llamada a getUserMedia repetía 'environment' y el botón no hacía nada.
    await page.addInitScript(() => {
      (window as unknown as { __facings: (string | null)[] }).__facings = [];
      const orig = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
      navigator.mediaDevices.getUserMedia = (c?: MediaStreamConstraints) => {
        const video = c?.video as MediaTrackConstraints | undefined;
        (window as unknown as { __facings: (string | null)[] }).__facings.push(
          (video?.facingMode as string) ?? null,
        );
        return orig(c);
      };
    });
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Activar lupa/i }).first().click();
    await expect(page.getByRole('button', { name: /Cambiar cámara/i }).first()).toBeVisible();
    await page.getByRole('button', { name: /Cambiar cámara/i }).first().click();

    await expect
      .poll(async () => page.evaluate(() => (window as unknown as { __facings: (string | null)[] }).__facings))
      .toEqual(['environment', 'user']);
  });

  test('hallazgo 9 — la linterna avisa cuando la cámara no expone la capacidad torch', async ({ page }) => {
    // Antes salía por el if sin tocar el estado: el usuario pulsaba y no ocurría nada.
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Activar lupa/i }).first().click();
    await page.getByRole('button', { name: /Activar linterna/i }).first().click();
    await expect(page.getByText(/no tiene linterna/i)).toBeVisible();
  });

  test('hallazgo 7 — la tabla de niveles solo describe zooms alcanzables (el tope es 5x)', async ({ page }) => {
    await page.goto(RUTA);
    const tabla = page.locator('table').first();
    await expect(tabla).toContainText('4x–5x');
    await expect(tabla).not.toContainText('8x');
    await expect(tabla).not.toContainText('16x');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// HALLAZGOS 72, 73 y 74 (Inspector, 20/08/2026) — REPARADOS el 21/08/2026
// ═══════════════════════════════════════════════════════════════════════════

// ✓ HALLAZGO 72 REPARADO (21/08/2026) — accesibilidad. Los tres <input type="range"> de la app
// (zoom, brillo y contraste) no tenían id, ni aria-label, ni aria-labelledby, y el <label> que
// acompañaba a brillo y contraste era un hermano suelto sin htmlFor (page.tsx: «<label>☀️ Brillo:
// {brillo}%</label>» seguido del input); el de zoom ni siquiera tenía <label>, solo un <h3>. El
// árbol de accesibilidad de Chromium devolvía name:"" para los tres, así que un lector de pantalla
// anunciaba «control deslizante, 100» sin decir de cuál se trataba — y había dos idénticos seguidos.
// Pesa más de lo normal porque esta app se vende como herramienta de accesibilidad para baja
// visión («Filtros de accesibilidad», keywords «accesibilidad, baja visión»).
// Caso: cargar /lupa-digital/ y leer el nombre accesible del 2º deslizador
//       → esperado «Brillo: 100%» · obtenido entonces "" (vacío). Hoy, regresión.
test('REGRESIÓN (accesibilidad) — los tres deslizadores deben tener nombre accesible', async ({ page }) => {
  await page.goto(RUTA);
  await expect(page.getByRole('slider').nth(0)).toHaveAccessibleName(/Zoom/i);
  await expect(page.getByRole('slider').nth(1)).toHaveAccessibleName(/Brillo/i);
  await expect(page.getByRole('slider').nth(2)).toHaveAccessibleName(/Contraste/i);
});

// ✓ HALLAZGO 73 REPARADO (21/08/2026) — contenido/formato. El único zoom con decimal se pintaba
// con punto en los tres sitios de la interfaz (el preajuste «1.5x», el título «Zoom: 1.5x» y el
// indicador del visor «1.5x»), porque salían de interpolar el number directamente. La propia
// tabla del bloque educativo escribe «1,5x» con coma, así que la app se contradecía a sí misma
// dentro de la misma página, y el formato español es obligatorio en el proyecto.
// Caso: pulsar el preajuste de 1,5x → esperado «Zoom: 1,5x» · obtenido entonces «Zoom: 1.5x».
test('REGRESIÓN (contenido) — el zoom decimal se escribe con coma, igual que en su tabla educativa', async ({
  page,
}) => {
  await page.goto(RUTA);
  // El preajuste se localiza admitiendo las dos grafías, para que el test siga pulsando el
  // botón correcto una vez reparado; lo que se exige es cómo se ESCRIBE el número.
  const preajuste = page.getByRole('button', { name: /^1[.,]5x$/ });
  await preajuste.click();
  await expect(preajuste).toHaveText('1,5x');
  await expect(page.locator('h3', { hasText: /^Zoom/ })).toHaveText('Zoom: 1,5x');

  // El tercer sitio —el indicador flotante sobre el visor— solo existe con la lupa
  // encendida, así que hay que arrancarla para comprobarlo.
  await page.getByRole('button', { name: /Activar lupa/ }).click();
  await expect(page.locator('[class*=zoomIndicador]')).toHaveText('1,5x');
});

// ✓ HALLAZGO 74 REPARADO (21/08/2026) — operativa. Con la lupa apagada, el visor (un 4:3 que
// ocupa el ancho entero) mostraba «Pulsa para activar la lupa», pero ese placeholder era un
// <div role="status"> sin onClick, sin botón dentro y con cursor:auto: pulsar ahí —lo que invita
// a hacer el texto, y el blanco más grande de la pantalla en un móvil— no hacía nada. Se reparó
// convirtiendo el placeholder en un <button>. La invariante admite las dos reparaciones posibles
// (hacer pulsable el visor o cambiar el texto por «Pulsa el botón…»), y por eso se comprueba así.
// Caso: pulsar sobre el texto «Pulsa para activar la lupa» → esperado que la lupa se active
//       (o que el visor no invite a pulsarlo) · obtenido entonces: el placeholder seguía ahí y
//       el <video> seguía con display:none.
test('REGRESIÓN (operativa) — si el visor dice «Pulsa», pulsarlo tiene que activar la lupa', async ({
  page,
}) => {
  await page.goto(RUTA);
  const invitacion = page.getByText('Pulsa para activar la lupa');
  if ((await invitacion.count()) === 0) return; // reparado cambiando el texto: nada que exigir
  await invitacion.click();
  await expect(page.locator('video')).toBeVisible();
});

// El hallazgo 8 (equipo sin cámara) vive en `lupa-digital-sin-camara.spec.ts`: exige
// arrancar Chromium sin dispositivo simulado, y `launchOptions` solo admite el nivel
// superior de un spec.

// ═══════════════════════════════════════════════════════════════════════════
// RE-INSPECCIÓN (Inspector, 13/10/2026)
// ═══════════════════════════════════════════════════════════════════════════

/** Visor y lienzo, en coordenadas de pantalla. */
function cajas(page: Page) {
  return page.evaluate(() => {
    const lienzo = document.querySelector('canvas') as HTMLCanvasElement;
    const c = lienzo.getBoundingClientRect();
    const v = (lienzo.parentElement as HTMLElement).getBoundingClientRect();
    return { lienzo: { izq: c.left, der: c.right }, visor: { x: v.x, y: v.y, ancho: v.width, alto: v.height } };
  });
}

/**
 * Gesto con el dedo de verdad (touch nativo por CDP): parte de un punto del visor
 * (`fx`, `fy` en fracción de su caja, o `fy > 1` para empezar por debajo) y se desplaza
 * `dx`, `dy` px. Centra antes el visor en la ventana para que el dedo caiga donde se dice, y
 * devuelve cuánto se desplazó la página DURANTE el gesto (medido después de centrar: el
 * propio centrado mueve la página y no cuenta).
 */
async function deslizarDesdeElVisor(page: Page, dx: number, dy: number, fx = 0.5, fy = 0.5): Promise<number> {
  await page.evaluate(() => document.querySelector('canvas')?.parentElement?.scrollIntoView({ block: 'center' }));
  await page.waitForTimeout(300);
  const antes = await page.evaluate(() => window.scrollY);
  const { visor } = await cajas(page);
  const x0 = Math.round(visor.x + visor.ancho * fx);
  const y0 = Math.round(visor.y + visor.alto * fy);
  const cdp = await page.context().newCDPSession(page);
  const dedo = (x: number, y: number) => [{ x, y, radiusX: 6, radiusY: 6, force: 1, id: 1 }];
  const pasos = 12;
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: dedo(x0, y0) });
  for (let i = 1; i <= pasos; i++) {
    await cdp.send('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: dedo(Math.round(x0 + (dx * i) / pasos), Math.round(y0 + (dy * i) / pasos)),
    });
    await page.waitForTimeout(16);
  }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await cdp.detach();
  await page.waitForTimeout(400);
  return (await page.evaluate(() => window.scrollY)) - antes;
}

/**
 * Contraste WCAG del color del texto contra su fondo COMPUESTO real (las capas rgba de los
 * antepasados, sobre blanco). Se mide en el navegador, no leyendo el CSS con regex.
 */
function contrasteDe(page: Page, selector: string): Promise<{ ratio: number; luzFondo: number }> {
  return page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (!el) return { ratio: -1, luzFondo: -1 };
    type Rgba = { r: number; g: number; b: number; a: number };
    const parse = (s: string): Rgba | null => {
      const m = s.match(/rgba?\(([^)]+)\)/);
      if (!m) return null;
      const p = m[1].split(/[ ,/]+/).filter(Boolean).map(Number);
      return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
    };
    const sobre = (t: Rgba, f: Rgba): Rgba => ({
      r: t.r * t.a + f.r * (1 - t.a), g: t.g * t.a + f.g * (1 - t.a), b: t.b * t.a + f.b * (1 - t.a), a: 1,
    });
    const capas: Rgba[] = [];
    for (let e: Element | null = el; e; e = e.parentElement) {
      const c = parse(getComputedStyle(e).backgroundColor);
      if (c && c.a > 0) {
        capas.push(c);
        if (c.a >= 1) break;
      }
    }
    let fondo: Rgba = { r: 255, g: 255, b: 255, a: 1 };
    for (let i = capas.length - 1; i >= 0; i--) fondo = sobre(capas[i], fondo);
    const color = parse(getComputedStyle(el).color) as Rgba;
    const texto = color.a < 1 ? sobre(color, fondo) : color;
    const lum = ({ r, g, b }: Rgba) => {
      const f = (c: number) => ((c /= 255) <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
      return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
    };
    const [a, b] = [lum(texto), lum(fondo)];
    return {
      ratio: Math.round(((Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)) * 100) / 100,
      luzFondo: b,
    };
  }, selector);
}

test.describe('re-inspección 13/10/2026', () => {
  test.describe('en móvil (Pixel 7)', () => {
    // Opciones enumeradas: `...devices['Pixel 7']` arrastra `defaultBrowserType` y fuerza un
    // worker nuevo, que Playwright no admite dentro de un describe.
    const P7 = devices['Pixel 7'];
    test.use({
      viewport: P7.viewport,
      userAgent: P7.userAgent,
      deviceScaleFactor: P7.deviceScaleFactor,
      isMobile: P7.isMobile,
      hasTouch: P7.hasTouch,
    });

    test('CASO 1 — la cámara arranca de verdad y el zoom ×N enseña N veces menos campo (se mide la caja del vídeo, no el rótulo)', async ({
      page,
    }) => {
      await page.goto(RUTA);
      await esperarHidratacion(page, ['#control-zoom']);
      await page.getByRole('button', { name: /Activar lupa/i }).click();
      await esperarCamaraEnMarcha(page);
      const arranque = await estadoDelVideo(page);
      expect(arranque?.readyState).toBeGreaterThanOrEqual(2);
      expect(arranque?.ancho).toBeGreaterThan(0);
      expect(arranque?.pausado).toBe(false);

      // Visor del Pixel 7: 412 px de viewport − 2 × 10 de padding (≤ 600 px) = 392, en 4:3 → 294
      // de alto. El vídeo se amplía con transform: scale(N), así que a zoom N su caja mide
      // 392·N × 294·N y por la ventana del visor cabe 1/N del campo en cada eje.
      expect(await cajas(page)).toMatchObject({ visor: { ancho: 392, alto: 294 } });
      const anchoDelVideo = () =>
        page.locator('video').evaluate((v) => {
          const r = v.getBoundingClientRect();
          return `${Math.round(r.width)}×${Math.round(r.height)}`;
        });
      const ESPERADO: [string, string][] = [
        ['1x', '392×294'],
        ['1,5x', '588×441'],
        ['2x', '784×588'],
        ['3x', '1176×882'],
        ['4x', '1568×1176'],
        ['5x', '1960×1470'],
      ];
      for (const [preajuste, caja] of ESPERADO) {
        await page.getByRole('button', { name: preajuste, exact: true }).click();
        await expect.poll(anchoDelVideo, { message: `zoom ${preajuste}` }).toBe(caja);
      }

      // Los topes del control (min 1, max 5, paso 0,5 en page.tsx): a 5x «+» queda inactivo y
      // «−» baja medio punto (4,5x → 392 × 4,5 = 1764); a 1x es «−» el que queda inactivo.
      await expect(page.getByRole('button', { name: '+', exact: true })).toBeDisabled();
      await page.getByRole('button', { name: '−', exact: true }).click();
      await expect.poll(anchoDelVideo).toBe('1764×1323');
      await expect(page.locator('h3', { hasText: /^Zoom/ })).toHaveText('Zoom: 4,5x');
      await page.getByRole('button', { name: '1x', exact: true }).click();
      await expect(page.getByRole('button', { name: '−', exact: true })).toBeDisabled();
    });

    test('CASO 2 — «Congelar» deja la imagen QUIETA, las flechas la recorren dentro de su tope y «Reanudar» vuelve al directo', async ({
      page,
    }) => {
      await page.goto(RUTA);
      await esperarHidratacion(page, ['#control-zoom']);
      await page.getByRole('button', { name: /Activar lupa/i }).click();
      await esperarCamaraEnMarcha(page);
      await page.getByRole('button', { name: '2x', exact: true }).click();

      // En directo, la cámara simulada se mueve: dos capturas del visor separadas no coinciden.
      // Es el testigo de que la comparación de abajo puede detectar movimiento.
      const visor = page.locator('canvas').locator('..');
      await visor.scrollIntoViewIfNeeded();
      const vivo1 = await visor.screenshot();
      await page.waitForTimeout(800);
      const vivo2 = await visor.screenshot();
      expect(vivo1.equals(vivo2)).toBe(false);

      // Congelada: 1,5 s después la imagen es la misma, píxel a píxel.
      await page.getByRole('button', { name: /Congelar/i }).click();
      const lienzo = page.locator('canvas');
      await expect(lienzo).toBeVisible();
      await page.waitForTimeout(300);
      const quieta1 = await visor.screenshot();
      await page.waitForTimeout(1500);
      const quieta2 = await visor.screenshot();
      expect(quieta1.equals(quieta2)).toBe(true);
      // Mientras está congelada no se ofrece cambiar de cámara (el botón solo vive en directo).
      await expect(page.getByRole('button', { name: /Cambiar cámara/i })).toHaveCount(0);

      // Teclado (FAQ: «se recorre arrastrándola con el dedo o con las flechas del teclado»):
      // paso 20 px, 60 con Mayúsculas (moverConTeclado). A 2x el tope es 392 × (2 − 1) / 2 = 196.
      await lienzo.focus();
      await page.keyboard.press('ArrowLeft');
      await expect(lienzo).toHaveAttribute('style', /translate\(20px, 0px\) scale\(2\)/);
      await page.keyboard.press('Shift+ArrowRight');
      await expect(lienzo).toHaveAttribute('style', /translate\(-40px, 0px\) scale\(2\)/);
      for (let i = 0; i < 4; i++) await page.keyboard.press('Shift+ArrowRight');
      await expect(lienzo).toHaveAttribute('style', /translate\(-196px, 0px\) scale\(2\)/);
      await page.keyboard.press('ArrowUp');
      await expect(lienzo).toHaveAttribute('style', /translate\(-196px, 20px\) scale\(2\)/);

      await page.getByRole('button', { name: /Reanudar/i }).click();
      await expect(page.locator('video')).toBeVisible();
      await expect.poll(async () => (await estadoDelVideo(page))?.pausado).toBe(false);
    });

    // ✓ HALLAZGO 3273 REPARADO (19/10/2026) — un ResizeObserver reacota al cambiar el visor.
    // Lo que había — operativa (13/10/2026). El tope del recorrido de la imagen congelada
    // sale del ancho del visor (acotarDesplazamiento), pero solo se volvía a aplicar al cambiar
    // el zoom o al congelar (useEffect [zoom, congelado]); girar el móvil cambia el ancho del
    // visor y nadie reacotaba. En horizontal (863 × 360) el visor mide 660 px y a 4x se puede
    // recorrer hasta 660 × 3 / 2 = 990 px; al volver a vertical el visor mide 392 y el tope es
    // 588, pero el translate se queda en −990: la imagen entera queda fuera del visor y se ve
    // NEGRO (medido: 89 % de píxeles negros, el resto son las insignias superpuestas). Se
    // arregla solo al tocar la imagen o cambiar el zoom, pero hasta entonces parece perdida.
    // Caso: congelar a 4x en horizontal, arrastrar al tope, girar a vertical → esperado que la
    //       imagen cubra el visor de lado a lado · obtenido: translate(−990px), visor en negro.
    test('3273 — al girar el móvil con la imagen congelada y recorrida, la imagen sigue cubriendo el visor', async ({
      page,
    }) => {
      await page.goto(RUTA);
      await esperarHidratacion(page, ['#control-zoom']);
      await page.getByRole('button', { name: /Activar lupa/i }).click();
      await esperarCamaraEnMarcha(page);
      await page.getByRole('button', { name: '4x', exact: true }).click();
      await page.getByRole('button', { name: /Congelar/i }).click();
      const lienzo = page.locator('canvas');
      await expect(lienzo).toBeVisible();

      // Horizontal: devices['Pixel 7 landscape'] es 863 × 360. Por encima de 600 px el padding
      // es de 20 px y el contenedor tiene max-width 700 → visor de 660 px.
      await page.setViewportSize({ width: 863, height: 360 });
      await expect.poll(async () => (await cajas(page)).visor.ancho).toBe(660);
      await deslizarDesdeElVisor(page, -3000, 0);
      await expect(lienzo).toHaveAttribute('style', /translate\(-990px, 0px\) scale\(4\)/);

      // De vuelta a vertical: visor de 392 px.
      await page.setViewportSize({ width: 412, height: 839 });
      await expect.poll(async () => (await cajas(page)).visor.ancho).toBe(392);

      // La imagen ampliada sigue cubriendo el visor de lado a lado (|x| ≤ 588).
      await expect(lienzo).toHaveAttribute('style', /translate\(-588px, 0px\) scale\(4\)/);
      const { lienzo: l, visor: v } = await cajas(page);
      expect({ cubreIzquierda: l.izq <= v.x + 0.5, cubreDerecha: l.der >= v.x + v.ancho - 0.5 }).toEqual({
        cubreIzquierda: true,
        cubreDerecha: true,
      });
    });

    test('CASO 3 — permiso denegado o cámara ocupada: el visor lo dice (no se queda en negro), no aparecen controles de una cámara que no hay y, al conceder, arranca', async ({
      page,
    }) => {
      // La denegación se simula con el mismo error que da el navegador (NotAllowedError):
      // este fichero arranca Chromium con --use-fake-ui-for-media-stream, que concede siempre.
      // En la inspección se comprobó también con --use-fake-ui-for-media-stream=deny (denegación
      // real del navegador): el mismo aviso, palabra por palabra.
      await page.addInitScript(() => {
        const w = window as unknown as { __falloCamara: string | null };
        w.__falloCamara = 'NotAllowedError';
        const original = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
        navigator.mediaDevices.getUserMedia = (c?: MediaStreamConstraints) =>
          w.__falloCamara ? Promise.reject(new DOMException('simulado', w.__falloCamara)) : original(c);
      });
      await page.goto(RUTA);
      await esperarHidratacion(page, ['#control-zoom']);
      const activar = page.getByRole('button', { name: /Activar lupa/i });
      // Acotado al visor: getByRole('alert') casaría también con el anunciador de rutas de Next.
      const aviso = page.locator('[class*=lupaPlaceholder] [role="alert"]');

      await activar.click();
      // Textos de AVISOS_CAMARA en page.tsx: cada motivo con su consejo.
      await expect(aviso).toContainText('Permiso de cámara denegado');
      await expect(aviso).toContainText('Activa la cámara en la configuración del navegador');
      await expect(page.locator('video')).toBeHidden();
      expect((await estadoDelVideo(page))?.readyState).toBe(0);
      await expect(page.getByRole('button', { name: /Congelar|Cambiar cámara|linterna/i })).toHaveCount(0);
      await expect(activar).toHaveAttribute('aria-pressed', 'false');

      // Cámara ocupada por otra aplicación: otro motivo, otro consejo.
      await page.evaluate(() => {
        (window as unknown as { __falloCamara: string | null }).__falloCamara = 'NotReadableError';
      });
      await activar.click();
      await expect(aviso).toContainText('No se ha podido abrir la cámara');
      await expect(aviso).toContainText('Puede que otra aplicación la esté usando');

      // Resuelto el problema, el mismo botón arranca la cámara y el aviso desaparece.
      await page.evaluate(() => {
        (window as unknown as { __falloCamara: string | null }).__falloCamara = null;
      });
      await activar.click();
      await esperarCamaraEnMarcha(page);
      await expect(aviso).toHaveCount(0);
    });
  });

  test.describe('a 360 px con el dedo (cabo C0067)', () => {
    // C0067: «deslizar desde el lienzo no desplaza la página». El lienzo de la imagen congelada
    // lleva touch-action: none. Medido el 13/10/2026: el visor deja 10 px libres por lado (padding
    // del contenedor), pero ocupa 255 de 780 px de alto y deja ~260 px por encima y por debajo
    // desde donde el gesto desplaza; y sobre la imagen congelada el gesto vertical hace lo que la
    // app promete (recorrerla). Descartado como hallazgo; esto fija las condiciones medidas.
    test.use({
      viewport: { width: 360, height: 780 },
      userAgent: devices['Pixel 7'].userAgent,
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true,
    });

    test('C0067 — en directo el gesto vertical sobre el vídeo desplaza la página; congelada, recorre la imagen y no la página; bajo el visor, desplaza', async ({
      page,
    }) => {
      await page.goto(RUTA);
      await esperarHidratacion(page, ['#control-zoom']);
      await page.getByRole('button', { name: /Activar lupa/i }).click();
      await esperarCamaraEnMarcha(page);

      // 360 − 2 × 10 de padding = 340 px de visor; 4:3 → 255 de alto.
      expect(await cajas(page)).toMatchObject({ visor: { x: 10, ancho: 340, alto: 255 } });

      // En directo el vídeo no lleva touch-action: none → un gesto de 150 px hacia arriba
      // desde el visor desplaza la página (medido: 135 px).
      expect(await deslizarDesdeElVisor(page, 0, -150, 0.5, 0.8)).toBeGreaterThan(100);

      // Congelada a 2x: el mismo gesto no desplaza la página y recorre la imagen hasta su tope
      // vertical, 255 × (2 − 1) / 2 = 127,5 px.
      await page.getByRole('button', { name: /Congelar/i }).click();
      await expect(page.locator('canvas')).toBeVisible();
      expect(await deslizarDesdeElVisor(page, 0, -150, 0.5, 0.8)).toBe(0);
      await expect(page.locator('canvas')).toHaveAttribute('style', /translate\(0px, -127\.5px\) scale\(2\)/);

      // Empezando por debajo del visor (sobre «Detener»), el gesto vuelve a desplazar la página.
      expect(await deslizarDesdeElVisor(page, 0, -150, 0.5, 1.2)).toBeGreaterThan(100);
    });
  });

  // ✓ HALLAZGO 3275 REPARADO (de paso, en e9435294, 13/10/2026) — accesibilidad. Los seis rótulos
  // de «Usos comunes» llevaban el emoji pegado al texto sin <span aria-hidden="true"> (page.tsx:
  // «<div …usoItem>📖 Leer letra pequeña</div>» y los otros cinco), y el lector de pantalla leía
  // «libro abierto Leer letra pequeña», «silla de ruedas Accesibilidad»… (CLAUDE.md §5, regla 3).
  // La re-inspección del 13/10 se hizo sobre el código ANTERIOR a e9435294; ese mismo commit los
  // envolvió («De paso: 10 emojis decorativos…»), y por eso este test, aún con test.fail(), dio
  // «expected to fail, but passed» en la tanda /reparar del 13/10 (cabo C0241). Re-inspección del
  // 14/10/2026: el testigo SÍ mide lo que afirma —el selector casa con una sola rejilla, «Usos
  // comunes» vive fuera de la guía plegable y el árbol es el mismo con la guía plegada o
  // desplegada— y, si se quita el aria-hidden, el snapshot vuelve a traer los seis pictogramas.
  // Por eso queda como regresión y se le añade esa prueba de sensibilidad al final.
  test('REGRESIÓN (accesibilidad) — los emojis de «Usos comunes» no llegan al lector de pantalla (hallazgo 3275)', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, ['#control-zoom']);
    const usos = page.locator('[class*=usosGrid]');
    await expect(usos).toHaveCount(1);
    await expect(usos).toContainText('Leer letra pequeña'); // la sección está donde se busca
    // Ni un pictograma en lo que expone el árbol de accesibilidad: solo los seis rótulos.
    expect(await usos.ariaSnapshot()).toBe(
      '- text: Leer letra pequeña Ver prospectos Leer etiquetas Trabajos de precisión Ver componentes Accesibilidad',
    );
    // Igual con la guía educativa desplegada (la rejilla está fuera de ella, pero se comprueba).
    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
    expect(await usos.ariaSnapshot()).not.toMatch(/\p{Extended_Pictographic}/u);

    // Sensibilidad del testigo: se reinyecta el defecto (emoji sin aria-hidden) y la misma
    // lectura tiene que verlo. Si esto dejara de cumplirse, el test de arriba no probaría nada.
    await page.evaluate(() => {
      document
        .querySelectorAll('[class*=usosGrid] span[aria-hidden="true"]')
        .forEach((s) => s.removeAttribute('aria-hidden'));
    });
    expect(await usos.ariaSnapshot()).toMatch(/📖 Leer letra pequeña/u);
  });

  // ✓ HALLAZGO 3274 REPARADO (19/10/2026) — accesibilidad. Tres textos usaban el color de marca
  // LITERAL en LupaDigital.module.css en vez de --primary-texto / --secondary-texto, y no llegaban
  // a 4,5:1 (WCAG 1.4.3; los tres son texto pequeño, 13-14 px): el preajuste de zoom ACTIVO
  // (.zoomPresetActivo, #2E86AB, 3,65:1 en claro y 3,01:1 en oscuro), los consejos de los
  // escenarios (.escenarioTip, #2E86AB, 3,74 / 2,94) y el dato de la FAQ (.faqTip, #48A9A6,
  // 2,60 / 4,09). La tanda 2 de C0070 (4488bd1d) los pasó a los tokens -texto, pero en oscuro el
  // tinte de fondo los dejaba en 4,42 y 4,33: la reparación bajó ese tinte del 10-12 % al 5 %.
  test('3274 — el texto en color de marca llega a 4,5:1 en los dos temas', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, ['#control-zoom']);
    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
    const SELECTORES = ['[class*=zoomPresetActivo]', '[class*=escenarioTip]', '[class*=faqTip]'];
    const bajoMinimo: string[] = [];
    for (const tema of ['claro', 'oscuro']) {
      if (tema === 'oscuro') {
        // Con el botón de la propia página: sembrar data-theme a mano puede medir otro estado.
        await page.getByRole('button', { name: 'Cambiar a modo oscuro' }).click();
        await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
      }
      for (const sel of SELECTORES) {
        // Los fondos cambian de tema con transición: se espera a que el fondo compuesto sea el
        // del tema (luminancia relativa > 0,7 en claro, < 0,06 en oscuro; la tarjeta oscura
        // #2D2D2D da 0,026) y a que dos lecturas seguidas den la misma cifra.
        let previo = -1;
        let ratio = -1;
        await expect
          .poll(
            async () => {
              const medida = await contrasteDe(page, sel);
              const enTema = tema === 'claro' ? medida.luzFondo > 0.7 : medida.luzFondo >= 0 && medida.luzFondo < 0.06;
              const quieto = medida.ratio === previo;
              previo = ratio = medida.ratio;
              return enTema && quieto;
            },
            { intervals: [150], message: `${sel} existe y su fondo es el del tema ${tema}` },
          )
          .toBe(true);
        if (ratio < 4.5) bajoMinimo.push(`${tema} ${sel} ${ratio}:1`);
      }
    }
    // DEBERÍA: ninguno por debajo de 4,5:1.
    expect(bajoMinimo).toEqual([]);
  });

  // ✓ HALLAZGO 3276 REPARADO (19/10/2026): PREGUNTA_IMAGEN_FIJA y RESPUESTA_IMAGEN_FIJA en
  // metadata.ts, que leen las dos bocas. Lo que había — contenido (13/10/2026). La misma pregunta
  // se respondía dos veces con textos distintos: la FAQ visible «¿Puedo dejar la imagen fija para leerla con calma?» y el
  // FAQPage de metadata.ts «¿Se puede dejar la imagen fija en vez de sostener el móvil?». No se
  // contradicen, pero cada una añade lo suyo (la visible, «haz una captura de pantalla»; la del
  // FAQPage, «a partir de 4× el temblor de la mano…»), y dos textos a mano acaban divergiendo.
  // Caso: comparar las dos respuestas → esperado una sola (UNA constante en metadata.ts que
  //       importen las dos bocas, como app/simulador-gastos-compraventa-garaje) · obtenido dos.
  test('3276 — la pregunta de la imagen fija tiene UNA respuesta en la FAQ visible y en el FAQPage', async ({
    page,
  }) => {
    await page.goto(RUTA);
    const preguntas = await page.evaluate(() => {
      for (const s of Array.from(document.querySelectorAll('script[type="application/ld+json"]'))) {
        const datos = JSON.parse(s.textContent || '{}');
        if (datos['@type'] === 'FAQPage')
          return datos.mainEntity as { name: string; acceptedAnswer: { text: string } }[];
      }
      return [];
    });
    const enFaqPage = preguntas.find((p) => /imagen fija/i.test(p.name));
    expect(enFaqPage, 'el FAQPage tiene la pregunta de la imagen fija').toBeTruthy();
    const visible = page.locator('details', { has: page.locator('summary', { hasText: /imagen fija/i }) });
    await expect(visible).toHaveCount(1); // y la FAQ visible también
    const textoVisible = ((await visible.textContent()) ?? '').replace(/\s+/g, ' ');
    // DEBERÍA: la respuesta del FAQPage es la que se ve, palabra por palabra.
    expect(textoVisible).toContain(enFaqPage?.acceptedAnswer.text ?? '∅');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// RE-INSPECCIÓN (Inspector, 14/10/2026) — el zoom pedido a la CÁMARA (e9435294)
// ═══════════════════════════════════════════════════════════════════════════
/**
 * La promesa: el zoom que marca la app es el aumento TOTAL que se ve, repartido entre lo que
 * amplía la propia cámara (applyConstraints) y lo que falta en pantalla (transform: scale). Todos
 * los valores esperados salen de repartirZoom() en app/lupa-digital/zoom.ts, calculados a mano:
 *   cámara = min(max(zoom, max(1, mín)), máx), redondeada HACIA ABAJO a su paso;
 *   pantalla = zoom / cámara, a milésimas.
 *
 * La cámara simulada de Chromium no expone zoom: esta lleva una capacidad POR CÁMARA (trasera y
 * frontal, según el facingMode que pide la app) y recuerda en cada pista el zoom que de verdad
 * ha aplicado, que es lo que devuelve su getSettings(). Así se mide lo que VE el usuario —zoom
 * aplicado por la cámara × escala pintada del vídeo— y no lo que la app cree haber pedido. La
 * configuración vive en window.__cfgCamara y se lee en cada getUserMedia, de modo que un mismo
 * test puede probar varias cámaras con «Detener» y «Activar lupa».
 */
interface RangoZoomSimulado {
  min: number;
  max: number;
  step: number;
}
interface CamaraSimulada {
  /** Capacidad de zoom de cada cámara; null = no expone zoom (todo va a la pantalla). */
  trasera: RangoZoomSimulado | null;
  frontal: RangoZoomSimulado | null;
  /** La cámara rechaza todo zoom por encima de este valor, aunque lo anuncie en su máximo. */
  rechazarPorEncima?: number;
  /**
   * Zoom con el que ABRE la pista (su getSettings() antes de que la app pida nada). Sin él, sin
   * ampliar: max(1, mín). Lo añadió el Inspector del 22/10/2026 para medir el cabo C0260 (una
   * cámara que abre en gran angular, 0,5).
   */
  abreEn?: number;
}
interface PistaSimulada {
  t: MediaStreamTrack;
  facing: string | null;
  zoom: number | null;
}
type VentanaConCamara = Window & {
  __cfgCamara: CamaraSimulada;
  __pistas: PistaSimulada[];
  __zoomPedidoPista: { pista: number; zoom: number }[];
};

async function simularCamaraPorPista(page: Page, cfg: CamaraSimulada) {
  await page.addInitScript((inicial: CamaraSimulada) => {
    const w = window as unknown as VentanaConCamara;
    w.__cfgCamara = inicial;
    w.__pistas = [];
    w.__zoomPedidoPista = [];
    const rangoDe = (p: PistaSimulada) => (p.facing === 'user' ? w.__cfgCamara.frontal : w.__cfgCamara.trasera);
    const rangos = new WeakMap<MediaStreamTrack, RangoZoomSimulado | null>();
    const buscar = (t: MediaStreamTrack) => w.__pistas.find((p) => p.t === t);

    const gum = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
    navigator.mediaDevices.getUserMedia = async (c?: MediaStreamConstraints) => {
      const s = await gum(c);
      const v = (c && typeof c.video === 'object' ? c.video : {}) as MediaTrackConstraints;
      const facing = typeof v.facingMode === 'string' ? v.facingMode : null;
      for (const t of s.getVideoTracks()) {
        const pista: PistaSimulada = { t, facing, zoom: null };
        const rango = rangoDe(pista);
        rangos.set(t, rango);
        // Una cámara recién abierta empieza sin ampliar (o en su mínimo, si este pasa de 1), salvo
        // que la configuración diga en qué zoom abre (abreEn, cabo C0260).
        pista.zoom = rango ? (w.__cfgCamara.abreEn ?? Math.max(1, rango.min)) : null;
        w.__pistas.push(pista);
      }
      return s;
    };

    const proto = MediaStreamTrack.prototype;
    const capacidades0 = proto.getCapabilities;
    const ajustes0 = proto.getSettings;
    const aplicar0 = proto.applyConstraints;
    proto.getCapabilities = function (this: MediaStreamTrack) {
      const r = capacidades0.call(this);
      const rango = rangos.get(this);
      return (rango ? { ...r, zoom: { ...rango } } : r) as MediaTrackCapabilities;
    };
    proto.getSettings = function (this: MediaStreamTrack) {
      const r = ajustes0.call(this);
      const p = buscar(this);
      return (rangos.get(this) && p ? { ...r, zoom: p.zoom } : r) as MediaTrackSettings;
    };
    proto.applyConstraints = function (this: MediaStreamTrack, c?: MediaTrackConstraints) {
      const zoom = (c?.advanced?.[0] as { zoom?: number } | undefined)?.zoom;
      if (typeof zoom !== 'number') return aplicar0.call(this, c);
      const p = buscar(this);
      w.__zoomPedidoPista.push({ pista: p ? w.__pistas.indexOf(p) : -1, zoom });
      const tope = w.__cfgCamara.rechazarPorEncima;
      if (tope !== undefined && zoom > tope) {
        return Promise.reject(new DOMException('Zoom rechazado (simulado)', 'NotReadableError'));
      }
      if (p) p.zoom = zoom;
      return Promise.resolve();
    };
  }, cfg);
}

/** Cambia la cámara simulada para el PRÓXIMO getUserMedia (tras «Detener»). */
function cambiarCamaraSimulada(page: Page, cfg: CamaraSimulada) {
  return page.evaluate((c) => {
    (window as unknown as VentanaConCamara).__cfgCamara = c;
  }, cfg);
}

/**
 * Lo que se ve: el zoom que la cámara VIVA tiene aplicado (1 si no expone zoom) × la escala con
 * que se pinta el vídeo. Se lee la escala computada, que es la que se ve tras la transición.
 */
function aumentoPintado(page: Page) {
  return page.evaluate(() => {
    const w = window as unknown as VentanaConCamara;
    const viva = [...w.__pistas].reverse().find((p) => p.t.readyState === 'live');
    const v = document.querySelector('video') as HTMLVideoElement;
    const m = getComputedStyle(v).transform;
    const pantalla = m === 'none' ? 1 : Number(m.match(/matrix\(([^,]+)/)?.[1]);
    const camara = viva?.zoom ?? 1;
    return {
      facing: viva?.facing ?? null,
      camara,
      pantalla: Math.round(pantalla * 1000) / 1000,
      total: Math.round(camara * pantalla * 1000) / 1000,
    };
  });
}

const zoomPedidoPorPista = (page: Page) =>
  page.evaluate(() => (window as unknown as VentanaConCamara).__zoomPedidoPista);

test.describe('re-inspección 14/10/2026 — zoom de la cámara', () => {
  test.describe('en móvil (Pixel 7)', () => {
    const P7 = devices['Pixel 7'];
    test.use({
      viewport: P7.viewport,
      userAgent: P7.userAgent,
      deviceScaleFactor: P7.deviceScaleFactor,
      isMobile: P7.isMobile,
      hasTouch: P7.hasTouch,
    });

    test('CASO 6 — trasera con zoom 1-2× y frontal sin él: 4× son 2× de cámara por 2× en pantalla, la imagen congelada lo conserva y cada cámara recibe su reparto', async ({
      page,
    }) => {
      await simularCamaraPorPista(page, { trasera: { min: 1, max: 2, step: 0.1 }, frontal: null });
      await page.goto(RUTA);
      await esperarHidratacion(page, ['#control-zoom']);
      await page.getByRole('button', { name: /Activar lupa/i }).click();
      await esperarCamaraEnMarcha(page);
      const video = page.locator('video');
      const lienzo = page.locator('canvas');
      const nota = page.locator('[class*=zoomNota]');
      const indicador = page.locator('[class*=zoomIndicador]');

      // 2x por defecto: cámara min(2, 2) = 2 (20 pasos de 0,1); pantalla 2 / 2 = 1.
      await expect.poll(() => aumentoPintado(page)).toEqual({ facing: 'environment', camara: 2, pantalla: 1, total: 2 });
      await expect(nota).toHaveText(/^Los 2x los hace la propia cámara/);

      // 4x: la cámara ya está en su tope (2) y no se le pide nada nuevo; en pantalla 4 / 2 = 2.
      // Visor del Pixel 7: 392 × 294 → el vídeo a scale(2) mide 784 × 588.
      await page.getByRole('button', { name: '4x', exact: true }).click();
      await expect.poll(() => aumentoPintado(page)).toEqual({ facing: 'environment', camara: 2, pantalla: 2, total: 4 });
      await expect(video).toHaveAttribute('style', /transform: scale\(2\)/);
      await expect(indicador).toHaveText('4x');
      await expect(nota).toHaveText('La cámara hace 2x y el resto (2x) se amplía en pantalla.');
      expect(await zoomPedidoPorPista(page)).toEqual([{ pista: 0, zoom: 2 }]);

      // Congelar a 4x: la imagen ya trae los 2x de la cámara y se copia a la resolución del
      // sensor; en pantalla 4 / 2 = 2, y el tope del recorrido es 392 × (2 − 1) / 2 = 196 px
      // (con todo el zoom en pantalla habría sido 392 × 3 / 2 = 588).
      await page.getByRole('button', { name: /Congelar/i }).click();
      await expect(lienzo).toHaveAttribute('style', /translate\(0px, 0px\) scale\(2\)/);
      const anchos = await page.evaluate(() => ({
        lienzo: (document.querySelector('canvas') as HTMLCanvasElement).width,
        sensor: (document.querySelector('video') as HTMLVideoElement).videoWidth,
      }));
      expect(anchos.lienzo).toBe(anchos.sensor);
      await deslizarDesdeElVisor(page, -3000, 0);
      await expect(lienzo).toHaveAttribute('style', /translate\(-196px, 0px\) scale\(2\)/);

      // Congelada, 5x: solo cambia la pantalla (5 / 2 = 2,5) y a la cámara no se le pide nada.
      await page.getByRole('button', { name: '5x', exact: true }).click();
      await expect(lienzo).toHaveAttribute('style', /scale\(2\.5\)/);
      expect(await zoomPedidoPorPista(page)).toHaveLength(1);

      // Reanudar: se vuelve a pedir su parte a la cámara (2) y la pantalla pone 2,5.
      await page.getByRole('button', { name: /Reanudar/i }).click();
      await expect.poll(() => aumentoPintado(page)).toEqual({ facing: 'environment', camara: 2, pantalla: 2.5, total: 5 });
      await expect(nota).toHaveText('La cámara hace 2x y el resto (2,5x) se amplía en pantalla.');

      // Frontal, sin zoom: todo a la pantalla (scale(5)), la nota desaparece y a esa pista no
      // se le pide ningún zoom.
      await page.getByRole('button', { name: /Cambiar cámara/i }).click();
      await expect.poll(() => aumentoPintado(page)).toEqual({ facing: 'user', camara: 1, pantalla: 5, total: 5 });
      await expect(nota).toHaveCount(0);
      expect((await zoomPedidoPorPista(page)).filter((p) => p.pista === 1)).toEqual([]);

      // De vuelta a la trasera: pista NUEVA (la 2), que recibe su 2 desde cero.
      await page.getByRole('button', { name: /Cambiar cámara/i }).click();
      await expect.poll(() => aumentoPintado(page)).toEqual({ facing: 'environment', camara: 2, pantalla: 2.5, total: 5 });
      expect((await zoomPedidoPorPista(page)).at(-1)).toEqual({ pista: 2, zoom: 2 });
    });
  });

  test('CASO 7 — límites del reparto: una cámara de 1-10× hace sola el tope de la app; con paso 0,2 y máximo 2,5 hace 2,4× y la pantalla 1,25×; un mínimo de 0,5 no aleja', async ({
    page,
  }) => {
    await simularCamaraPorPista(page, { trasera: { min: 1, max: 10, step: 0.1 }, frontal: null });
    await page.goto(RUTA);
    await esperarHidratacion(page, ['#control-zoom']);
    const activar = page.getByRole('button', { name: /Activar lupa/i });
    const nota = page.locator('[class*=zoomNota]');
    await activar.click();
    await esperarCamaraEnMarcha(page);

    // {1..10, paso 0,1}: el tope de la app (5x) lo hace entero la cámara; «+» queda inactivo.
    await page.getByRole('button', { name: '5x', exact: true }).click();
    await expect.poll(() => aumentoPintado(page)).toMatchObject({ camara: 5, pantalla: 1, total: 5 });
    await expect(nota).toHaveText(/^Los 5x los hace la propia cámara/);
    await expect(page.getByRole('button', { name: '+', exact: true })).toBeDisabled();
    // «−» baja a 4,5: 4,5 / 0,1 = 44,999… → el 1e-9 de zoom.ts lo deja en 45 pasos = 4,5 (no 4,4).
    await page.getByRole('button', { name: '−', exact: true }).click();
    await expect.poll(() => aumentoPintado(page)).toMatchObject({ camara: 4.5, pantalla: 1, total: 4.5 });
    await expect(page.locator('[class*=zoomIndicador]')).toHaveText('4,5x');

    // {1..2,5, paso 0,2} pidiendo 3x: min(3, 2,5) = 2,5 → 12,5 pasos → 12 hacia abajo = 2,4;
    // pantalla 3 / 2,4 = 1,25; total 2,4 × 1,25 = 3. La nota redondea a un decimal (1,3).
    await page.getByRole('button', { name: /Detener/i }).click();
    await cambiarCamaraSimulada(page, { trasera: { min: 1, max: 2.5, step: 0.2 }, frontal: null });
    await page.getByRole('button', { name: '3x', exact: true }).click();
    await activar.click();
    await expect.poll(() => aumentoPintado(page)).toMatchObject({ camara: 2.4, pantalla: 1.25, total: 3 });
    await expect(nota).toHaveText('La cámara hace 2,4x y el resto (1,3x) se amplía en pantalla.');

    // {0,5..8} a 1x: nunca por debajo de 1 (un gran angular alejaría en vez de ampliar).
    await page.getByRole('button', { name: /Detener/i }).click();
    await cambiarCamaraSimulada(page, { trasera: { min: 0.5, max: 8, step: 0.1 }, frontal: null });
    await page.getByRole('button', { name: '1x', exact: true }).click();
    await activar.click();
    await expect.poll(() => aumentoPintado(page)).toMatchObject({ camara: 1, pantalla: 1, total: 1 });
    await expect(nota).toHaveText(/^Esta cámara puede ampliar por sí misma hasta 5x/);
  });

  // REPARADO 3290 (14/10/2026): leerRangoZoom descarta un rango con mínimo por encima de 1 y todo
  // el zoom va a la pantalla. Antes: leerRangoZoom
  // (zoom.ts) aceptaba una capacidad de zoom cuyo MÍNIMO pasa de 1 y la trataba como aumentos: con
  // {min 100, max 500, paso 1} repartirZoom(2) da cámara max(2, 100) = 100 y pantalla 2 / 100 =
  // 0,02. Un mínimo por encima de 1 no cabe en un aumento (1 = sin ampliar): es lo que anuncia una
  // cámara que expresa el zoom en sus propias unidades. El vídeo queda en 13 × 10 px dentro de un
  // visor de 660 × 495 (casi todo negro) y la nota dice «Los 100x los hace la propia cámara» con
  // el indicador en 2x. Con {min 2, max 6} pasa lo mismo a escala: a 1x, scale(0,5) y «Los 2x…».
  // Caso: cámara {100..500, paso 1}, activar (2x) → esperado vídeo que cubre el visor y nota sin
  //       «100x» · obtenido scale(0.02), caja 13 × 10 px, «Los 100x los hace la propia cámara…».
  test('REPARADO 3290 (operativa) — una cámara cuyo zoom mínimo pasa de 1 no debe encoger el vídeo a un punto ni anunciar «100x»', async ({
    page,
  }) => {
    await simularCamaraPorPista(page, { trasera: { min: 100, max: 500, step: 1 }, frontal: null });
    await page.goto(RUTA);
    await esperarHidratacion(page, ['#control-zoom']);
    await page.getByRole('button', { name: /Activar lupa/i }).click();
    await esperarCamaraEnMarcha(page);
    await expect(page.locator('[class*=zoomIndicador]')).toHaveText('2x');
    // DEBERÍA: el vídeo cubre el visor (escala en pantalla ≥ 1)…
    await expect
      .poll(() =>
        page.evaluate(() => {
          const v = (document.querySelector('video') as HTMLVideoElement).getBoundingClientRect();
          const visor = (document.querySelector('canvas')?.parentElement as HTMLElement).getBoundingClientRect();
          return v.width >= visor.width - 0.5 && v.height >= visor.height - 0.5;
        }),
      )
      .toBe(true);
    // …y ninguna nota atribuye a la cámara un aumento de 100x.
    expect((await page.locator('[class*=zoomNota]').allTextContents()).join(' ')).not.toContain('100x');
  });

  // REPARADO 3291 (14/10/2026): al rechazarse, el catch devuelve la cámara a 1 (y, si no vuelve,
  // reparte con el zoom en que se quedó, leído de getSettings). Antes: si applyConstraints
  // rechaza el zoom DESPUÉS de haber aceptado otro, el catch de page.tsx pasa a «todo en pantalla»
  // (setRangoZoomCamara(null)) sin devolver la cámara a 1 ni leer su getSettings(): la cámara se
  // queda en el zoom anterior y el aumento real se multiplica. Es la «cámara que lo anuncia y luego
  // lo rechaza» que el propio comentario del catch prevé.
  // Caso: cámara {1..3, paso 0,1} que rechaza por encima de 2,5; 2x (aceptado, cámara 2) → 3x
  //       (pide 3, rechazado) → esperado aumento total 3 · obtenido cámara 2 × scale(3) = 6, sin
  //       nota (la FAQ dice que sin esa línea «todo el zoom se hace en pantalla»); a 5x, 10.
  test('REPARADO 3291 (operativa) — si la cámara rechaza el zoom tras haber aceptado otro, el aumento que se ve no debe multiplicarse', async ({
    page,
  }) => {
    await simularCamaraPorPista(page, { trasera: { min: 1, max: 3, step: 0.1 }, frontal: null, rechazarPorEncima: 2.5 });
    await page.goto(RUTA);
    await esperarHidratacion(page, ['#control-zoom']);
    await page.getByRole('button', { name: /Activar lupa/i }).click();
    await esperarCamaraEnMarcha(page);
    await expect.poll(() => aumentoPintado(page)).toMatchObject({ camara: 2, pantalla: 1, total: 2 });

    await page.getByRole('button', { name: '3x', exact: true }).click();
    // Pide 3 (rechazado) y devuelve la cámara a 1.
    await expect.poll(async () => (await zoomPedidoPorPista(page)).map((p) => p.zoom)).toEqual([2, 3, 1]);
    await expect(page.locator('[class*=zoomNota]')).toHaveCount(0); // la app ya cayó a «todo en pantalla»
    await expect(page.locator('[class*=zoomIndicador]')).toHaveText('3x');
    // Lo que se ve es lo que marca el indicador: cámara 1 × pantalla 3.
    await expect.poll(() => aumentoPintado(page)).toMatchObject({ camara: 1, pantalla: 3, total: 3 });
    // Y a 5x, 5 (antes, 2 × 5 = 10).
    await page.getByRole('button', { name: '5x', exact: true }).click();
    await expect.poll(() => aumentoPintado(page)).toMatchObject({ camara: 1, pantalla: 5, total: 5 });
  });

  test.describe('a 360 px con el dedo (cabo C0067, con zoom de cámara)', () => {
    test.use({
      viewport: { width: 360, height: 780 },
      userAgent: devices['Pixel 7'].userAgent,
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true,
    });

    test('C0067 — con la cámara haciendo el zoom, el gesto vertical sobre el vídeo en directo sigue desplazando la página', async ({
      page,
    }) => {
      await simularCamaraPorPista(page, { trasera: { min: 1, max: 3, step: 0.1 }, frontal: null });
      await page.goto(RUTA);
      await esperarHidratacion(page, ['#control-zoom']);
      await page.getByRole('button', { name: /Activar lupa/i }).click();
      await esperarCamaraEnMarcha(page);
      // 360 − 2 × 10 de padding = 340 px de visor; 4:3 → 255.
      expect(await cajas(page)).toMatchObject({ visor: { x: 10, ancho: 340, alto: 255 } });

      // 2x: todo en la cámara (pantalla 1). El gesto de 150 px hacia arriba desplaza la página.
      await expect.poll(() => aumentoPintado(page)).toMatchObject({ camara: 2, pantalla: 1 });
      expect(await deslizarDesdeElVisor(page, 0, -150, 0.5, 0.8)).toBeGreaterThan(100);

      // 4x: cámara 3 y pantalla 4 / 3 = 1,333. Con el vídeo ampliado en pantalla, igual.
      await page.getByRole('button', { name: '4x', exact: true }).click();
      await expect.poll(() => aumentoPintado(page)).toMatchObject({ camara: 3, pantalla: 1.333 });
      expect(await deslizarDesdeElVisor(page, 0, -150, 0.5, 0.8)).toBeGreaterThan(100);
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// RE-INSPECCIÓN (Inspector, 14/10/2026, tarde) — tras bcba03bb (hallazgos 3290 y 3291)
// ═══════════════════════════════════════════════════════════════════════════
/**
 * Lo que no cubrían las inspecciones anteriores: la pantalla retenida (wake lock) y «Detener»
 * con la imagen congelada y el zoom de cámara activo (CASO 8, en móvil); la cámara que acepta un
 * zoom y después no vuelve a 1, que es la rama NUEVA de bcba03bb («se reparte con el zoom en que
 * se ha quedado», CASO 9); y la cámara que rechaza ya el PRIMER zoom (CASO 10). Mismo simulador de
 * cámara por pista que el bloque anterior; los valores esperados salen de repartirZoom()
 * (app/lupa-digital/zoom.ts) y del catch del efecto de page.tsx, calculados a mano.
 */
type VentanaConWakeLock = Window & { __wake: { tipo: string; liberado: boolean }[] };

/** Wake lock simulado: anota cada petición y cada liberación (Chromium headless no lo concede). */
async function simularWakeLock(page: Page) {
  await page.addInitScript(() => {
    const w = window as unknown as VentanaConWakeLock;
    w.__wake = [];
    Object.defineProperty(navigator, 'wakeLock', {
      configurable: true,
      value: {
        request: async (tipo: string) => {
          const n = w.__wake.push({ tipo, liberado: false }) - 1;
          return {
            type: tipo,
            released: false,
            release: async () => {
              w.__wake[n].liberado = true;
            },
          };
        },
      },
    });
  });
}

const wakeLocks = (page: Page) => page.evaluate(() => (window as unknown as VentanaConWakeLock).__wake);

test.describe('re-inspección 14/10/2026 (tarde)', () => {
  test.describe('en móvil (Pixel 7)', () => {
    // Opciones enumeradas: `...devices['Pixel 7']` arrastra `defaultBrowserType` y fuerza un
    // worker nuevo, que Playwright no admite dentro de un describe.
    const P7 = devices['Pixel 7'];
    test.use({
      viewport: P7.viewport,
      userAgent: P7.userAgent,
      deviceScaleFactor: P7.deviceScaleFactor,
      isMobile: P7.isMobile,
      hasTouch: P7.hasTouch,
    });

    test('CASO 8 — la pantalla se retiene mientras la lupa está encendida (también congelada); «Detener» desde la imagen congelada apaga y libera todo, y al volver a activar la pista nueva recibe su zoom', async ({
      page,
    }) => {
      await simularCamaraPorPista(page, { trasera: { min: 1, max: 3, step: 0.1 }, frontal: null });
      await simularWakeLock(page);
      await page.goto(RUTA);
      await esperarHidratacion(page, ['#control-zoom']);
      expect(await wakeLocks(page)).toEqual([]); // sin lupa no se retiene nada

      await page.getByRole('button', { name: /Activar lupa/i }).click();
      await esperarCamaraEnMarcha(page);
      await expect.poll(() => wakeLocks(page)).toEqual([{ tipo: 'screen', liberado: false }]);

      // 4x con una cámara de 1-3x en pasos de 0,1: cámara min(4, 3) = 3 (30 pasos); pantalla
      // 4 / 3 = 1,333 (repartirZoom redondea a milésimas).
      await page.getByRole('button', { name: '4x', exact: true }).click();
      await expect.poll(() => aumentoPintado(page)).toMatchObject({ camara: 3, pantalla: 1.333 });

      // Congelada a 4x: la imagen ya trae los 3x de la cámara → en pantalla 4 / 3 = 1,333. La
      // pantalla sigue retenida: es justo cuando se suelta el móvil.
      await page.getByRole('button', { name: /Congelar/i }).click();
      const lienzo = page.locator('canvas');
      await expect(lienzo).toHaveAttribute('style', /scale\(1\.333\)/);
      expect(await wakeLocks(page)).toEqual([{ tipo: 'screen', liberado: false }]);

      // «Detener» desde la imagen congelada (detenerCamara): pista terminada, pantalla liberada,
      // sin lienzo ni controles de una cámara apagada, y el visor vuelve a invitar a activar.
      await page.getByRole('button', { name: /Detener/i }).click();
      await expect(page.getByText('Pulsa para activar la lupa')).toBeVisible();
      await expect(lienzo).toBeHidden();
      await expect(page.locator('video')).toBeHidden();
      await expect(page.getByRole('button', { name: /Congelar|Reanudar|Cambiar cámara/i })).toHaveCount(0);
      expect(await wakeLocks(page)).toEqual([{ tipo: 'screen', liberado: true }]);
      expect(
        await page.evaluate(() => (window as unknown as VentanaConCamara).__pistas.map((p) => p.t.readyState)),
      ).toEqual(['ended']);

      // Activar otra vez: pista NUEVA (la 1) que recibe su 3 desde cero; el vídeo, que se pausó al
      // congelar, vuelve a reproducirse (esperarCamaraEnMarcha exige paused === false) y el 4x se
      // mantiene: 3 × 1,333. Se vuelve a retener la pantalla.
      await page.getByRole('button', { name: /Activar lupa/i }).click();
      await esperarCamaraEnMarcha(page);
      await expect.poll(async () => (await zoomPedidoPorPista(page)).at(-1)).toEqual({ pista: 1, zoom: 3 });
      await expect.poll(() => aumentoPintado(page)).toMatchObject({ camara: 3, pantalla: 1.333 });
      await expect(page.locator('[class*=zoomIndicador]')).toHaveText('4x');
      await expect(page.locator('[class*=zoomNota]')).toHaveText(
        'La cámara hace 3x y el resto (1,3x) se amplía en pantalla.',
      );
      await expect(lienzo).toBeHidden();
      await expect.poll(() => wakeLocks(page)).toEqual([
        { tipo: 'screen', liberado: true },
        { tipo: 'screen', liberado: false },
      ]);
    });
  });

  test('CASO 9 — una cámara que acepta 2x y después no se mueve (ni para volver a 1): se reparte con los 2x en que se quedó, lo que se ve es lo que marca el indicador y no entra en bucle', async ({
    page,
  }) => {
    const camaras = { trasera: { min: 1, max: 3, step: 0.1 }, frontal: { min: 1, max: 3, step: 0.1 } };
    await simularCamaraPorPista(page, camaras);
    await page.goto(RUTA);
    await esperarHidratacion(page, ['#control-zoom']);
    await page.getByRole('button', { name: /Activar lupa/i }).click();
    await esperarCamaraEnMarcha(page);
    const nota = page.locator('[class*=zoomNota]');
    await expect.poll(() => aumentoPintado(page)).toMatchObject({ camara: 2, pantalla: 1, total: 2 });

    // Desde aquí la cámara rechaza cualquier zoom (rechazarPorEncima: 0), también el 1.
    await cambiarCamaraSimulada(page, { ...camaras, rechazarPorEncima: 0 });

    // 3x: pide 3 (rechazado), intenta volver a 1 (rechazado) y getSettings dice 2 → rango {2..2}:
    // cámara 2 y pantalla 3 / 2 = 1,5. El efecto se repite una vez con el rango nuevo (2 y 1,
    // rechazados) y, como el rango fijado ya no cambia, se para: [2, 3, 1, 2, 1] y ni uno más.
    await page.getByRole('button', { name: '3x', exact: true }).click();
    await expect.poll(async () => (await zoomPedidoPorPista(page)).map((p) => p.zoom)).toEqual([2, 3, 1, 2, 1]);
    await expect.poll(() => aumentoPintado(page)).toMatchObject({ camara: 2, pantalla: 1.5, total: 3 });
    await expect(page.locator('[class*=zoomIndicador]')).toHaveText('3x');
    await expect(nota).toHaveText('La cámara hace 2x y el resto (1,5x) se amplía en pantalla.');
    await page.waitForTimeout(500);
    expect(await zoomPedidoPorPista(page)).toHaveLength(5); // sin bucle

    // 5x: 2 × 2,5. La parte de la cámara no cambia, así que no se le pide nada.
    await page.getByRole('button', { name: '5x', exact: true }).click();
    await expect.poll(() => aumentoPintado(page)).toMatchObject({ camara: 2, pantalla: 2.5, total: 5 });
    await expect(nota).toHaveText('La cámara hace 2x y el resto (2,5x) se amplía en pantalla.');
    expect(await zoomPedidoPorPista(page)).toHaveLength(5);

    // Congelada a 5x: la imagen trae los 2x de la cámara → en pantalla 5 / 2 = 2,5.
    await page.getByRole('button', { name: /Congelar/i }).click();
    await expect(page.locator('canvas')).toHaveAttribute('style', /scale\(2\.5\)/);
    // Reanudar: se le vuelve a pedir su 2 (rechazado → 1, rechazado) y queda igual: 7 y se para.
    await page.getByRole('button', { name: /Reanudar/i }).click();
    await expect.poll(async () => (await zoomPedidoPorPista(page)).length).toBe(7);
    await expect.poll(() => aumentoPintado(page)).toMatchObject({ camara: 2, pantalla: 2.5, total: 5 });
    await page.waitForTimeout(500);
    expect(await zoomPedidoPorPista(page)).toHaveLength(7);

    // Frontal (pista 1, recién abierta sin ampliar, que también lo rechaza todo): pide min(5, 3) = 3
    // → rechazado → 1 → rechazado; getSettings dice 1 → sin rango: todo en pantalla y sin nota.
    await page.getByRole('button', { name: /Cambiar cámara/i }).click();
    await expect.poll(() => aumentoPintado(page)).toEqual({ facing: 'user', camara: 1, pantalla: 5, total: 5 });
    expect((await zoomPedidoPorPista(page)).filter((p) => p.pista === 1).map((p) => p.zoom)).toEqual([3, 1]);
    await expect(nota).toHaveCount(0);
  });

  test('CASO 10 — si la cámara rechaza ya el PRIMER zoom, todo va a la pantalla y la nota no aparece; al volver a activar se le pide otra vez', async ({
    page,
  }) => {
    await simularCamaraPorPista(page, {
      trasera: { min: 1, max: 3, step: 0.1 },
      frontal: null,
      rechazarPorEncima: 1.5,
    });
    await page.goto(RUTA);
    await esperarHidratacion(page, ['#control-zoom']);
    const activar = page.getByRole('button', { name: /Activar lupa/i });
    const nota = page.locator('[class*=zoomNota]');
    await activar.click();
    await esperarCamaraEnMarcha(page);

    // 2x por defecto: pide 2 (rechazado), vuelve a 1 (aceptado), getSettings dice 1 → sin rango.
    // Todo en pantalla: cámara 1 × scale(2). Sin nota, que es como la FAQ dice que se reconoce
    // («si no aparece esa línea, todo el zoom se hace en pantalla»).
    await expect.poll(async () => (await zoomPedidoPorPista(page)).map((p) => p.zoom)).toEqual([2, 1]);
    await expect.poll(() => aumentoPintado(page)).toMatchObject({ camara: 1, pantalla: 2, total: 2 });
    await expect(nota).toHaveCount(0);

    // 1,5x: sin rango no se le pide nada más a la cámara; pantalla 1,5.
    await page.getByRole('button', { name: '1,5x', exact: true }).click();
    await expect.poll(() => aumentoPintado(page)).toMatchObject({ camara: 1, pantalla: 1.5, total: 1.5 });
    expect(await zoomPedidoPorPista(page)).toHaveLength(2);
    // Congelada: la cámara estaba en 1 → en pantalla 1,5 / 1 = 1,5.
    await page.getByRole('button', { name: /Congelar/i }).click();
    await expect(page.locator('canvas')).toHaveAttribute('style', /scale\(1\.5\)/);

    // Detener y activar: pista nueva (la 1), rango leído otra vez {1..3}; a 1,5x pide 1,5, que esta
    // cámara sí acepta (no pasa de 1,5) → la cámara hace los 1,5x y la pantalla nada.
    await page.getByRole('button', { name: /Detener/i }).click();
    await activar.click();
    await esperarCamaraEnMarcha(page);
    await expect.poll(async () => (await zoomPedidoPorPista(page)).at(-1)).toEqual({ pista: 1, zoom: 1.5 });
    await expect.poll(() => aumentoPintado(page)).toMatchObject({ camara: 1.5, pantalla: 1, total: 1.5 });
    await expect(nota).toHaveText(/^Los 1,5x los hace la propia cámara/);
  });

  // ✓ HALLAZGO 3304 REPARADO (f3e9c635, 15/10/2026) — operativa (14/10/2026, tarde). La rama nueva
  // de bcba03bb (reparación de 3291): si la cámara no vuelve a 1, el rango se fija en el zoom en que
  // se quedó ({2..2}). Con el usuario por DEBAJO de ese zoom, repartirZoom daba pantalla < 1 (a 1x,
  // 1 / 2 = 0,5: el vídeo a la mitad del visor, con borde negro) y la nota caía en la rama
  // «pantalla < 1,05»: «Los 2x los hace la propia cámara…» con el indicador en 1x. Era el mismo
  // síntoma que la ficha de 3290 describía para un mínimo de 2, reintroducido por otra vía.
  // Caso: cámara {1..3} que acepta 2x y luego lo rechaza todo; 3x y después 1x → esperado: la nota
  //       no atribuye a la cámara más aumento del que marca el indicador · obtenido entonces «Los 2x
  //       los hace la propia cámara, sobre la imagen completa del sensor…» con el indicador en «1x».
  // Reparado con una frase propia para la pantalla por debajo de 0,95, que dice dónde se ha quedado
  // la cámara y que la imagen se reduce. La re-inspección del 15/10/2026 confirmó que se sostiene;
  // la franja de 0,95 a 1 quedó fuera (hallazgo 3315 de esa re-inspección, REPARADO en 3b52f497).
  test('REPARADO 3304 (operativa) — con la cámara clavada en 2x, a 1x la nota no debe decir que «Los 2x los hace la propia cámara»', async ({
    page,
  }) => {
    const camaras = { trasera: { min: 1, max: 3, step: 0.1 }, frontal: null };
    await simularCamaraPorPista(page, camaras);
    await page.goto(RUTA);
    await esperarHidratacion(page, ['#control-zoom']);
    await page.getByRole('button', { name: /Activar lupa/i }).click();
    await esperarCamaraEnMarcha(page);
    await expect.poll(() => aumentoPintado(page)).toMatchObject({ camara: 2, pantalla: 1 });
    await cambiarCamaraSimulada(page, { ...camaras, rechazarPorEncima: 0 });
    await page.getByRole('button', { name: '3x', exact: true }).click();
    await expect.poll(() => aumentoPintado(page)).toMatchObject({ camara: 2, pantalla: 1.5, total: 3 });

    // 1x: cámara 2 (no baja) y pantalla 1 / 2 = 0,5. Lo que se ve es 1x, como marca el indicador.
    await page.getByRole('button', { name: '1x', exact: true }).click();
    await expect.poll(() => aumentoPintado(page)).toMatchObject({ camara: 2, pantalla: 0.5, total: 1 });
    await expect(page.locator('[class*=zoomIndicador]')).toHaveText('1x');
    // La nota no contradice al indicador: dice dónde se ha quedado la cámara y que se reduce.
    const nota = page.locator('[class*=zoomNota]');
    await expect(nota).not.toHaveText(/^Los 2x los hace la propia cámara/);
    await expect(nota).toHaveText(
      'La cámara se ha quedado en 2x y no deja bajar de ahí: para ver 1x, la imagen se reduce en pantalla y queda un borde negro alrededor.',
    );
    // 1,5x: cámara 2 y pantalla 0,75, la misma situación
    await page.getByRole('button', { name: '1,5x', exact: true }).click();
    await expect.poll(() => aumentoPintado(page)).toMatchObject({ camara: 2, pantalla: 0.75, total: 1.5 });
    await expect(nota).toHaveText(/^La cámara se ha quedado en 2x y no deja bajar de ahí: para ver 1,5x/);
    // 2x vuelve a ser todo de la cámara
    await page.getByRole('button', { name: '2x', exact: true }).click();
    await expect(nota).toHaveText(/^Los 2x los hace la propia cámara/);
  });

  // ✓ HALLAZGO 3306 REPARADO (f3e9c635, 15/10/2026), vecino del 3290 — operativa (14/10/2026,
  // tarde). bcba03bb descartaba un rango con mínimo por encima de 1 (zoom.ts: «Un mínimo por
  // encima de 1 no cabe en un aumento»), pero no uno que empieza en 0, que tampoco cabe (0 no es un
  // aumento: la app nunca pide menos de 1) y es la otra forma de dar el zoom en unidades propias
  // (0-10, por ejemplo). Se trataba como aumentos: a 2x pedía zoom 2 a la cámara, no ampliaba nada
  // en pantalla y la nota decía «Los 2x los hace la propia cámara»; a 1x pedía 1.
  // Caso: cámara {0..10, paso 1}, activar (2x) → esperado, como con 100-500: nada pedido a la
  //       cámara, vídeo a scale(2) y sin nota · obtenido entonces applyConstraints({zoom: 2}),
  //       scale(1) y «Los 2x los hace la propia cámara…».
  // Reparado: leerRangoZoom descarta también un mínimo ≤ 0; el 0,5 sigue valiendo. Re-inspección del
  // 15/10/2026: se sostiene (también a 1x y 5x, CASO 12).
  test('REPARADO 3306 (operativa, vecino del 3290) — una cámara que da el zoom en unidades propias desde 0 (0-10) tampoco debe tratarse como aumentos', async ({
    page,
  }) => {
    await simularCamaraPorPista(page, { trasera: { min: 0, max: 10, step: 1 }, frontal: null });
    await page.goto(RUTA);
    await esperarHidratacion(page, ['#control-zoom']);
    await page.getByRole('button', { name: /Activar lupa/i }).click();
    await esperarCamaraEnMarcha(page);
    await expect(page.locator('[class*=zoomIndicador]')).toHaveText('2x');
    await page.waitForTimeout(500);
    // DEBERÍA: rango descartado → todo en pantalla.
    expect(await zoomPedidoPorPista(page)).toEqual([]);
    await expect(page.locator('video')).toHaveAttribute('style', /transform: scale\(2\)/);
    await expect(page.locator('[class*=zoomNota]')).toHaveCount(0);
  });

  // ✓ HALLAZGO 3305 REPARADO (f3e9c635, 15/10/2026) — accesibilidad (14/10/2026, tarde). Dos botones
  // de ESTADO pintaban texto blanco sobre un color escrito a mano en LupaDigital.module.css, sin
  // variante oscura: «⏹️ Detener» (.btnPrincipal.activo, #EF4444; 19,2 px con peso 600, que no es
  // negrita para WCAG/axe —700—, así que exige 4,5:1) daba 3,76:1, y «🔦 Linterna ON»
  // (.linternaActiva, #F59E0B; 16 px) 2,15:1. Fuera del 3274 (texto EN color de marca) y de la
  // campaña C0070 (blanco sobre la marca): rojo y ámbar.
  // Caso: activar, encender la linterna (cámara con torch simulada) y medir en los dos temas →
  //       esperado ≥ 4,5:1 · obtenido entonces 3,76:1 y 2,15:1 en claro y en oscuro.
  // Reparado: «Detener» sobre #B91C1C y «Linterna ON» con texto #1F2937 sobre el mismo ámbar. Medido
  // en la re-inspección del 15/10/2026 sobre el fondo compuesto, en Pixel 7: 6,47:1 y 6,83:1, iguales
  // en claro y en oscuro. El mismo #EF4444 seguía como TEXTO en «Restablecer ajustes» al tocarlo
  // (hallazgo 3316 de esa re-inspección, REPARADO en 00153144).
  test('REPARADO 3305 (accesibilidad) — «Detener» y «Linterna ON» deben llegar a 4,5:1 en los dos temas', async ({
    page,
  }) => {
    // La cámara simulada de Chromium no tiene linterna: esta dice tenerla y acepta encenderla.
    await page.addInitScript(() => {
      const proto = MediaStreamTrack.prototype;
      const capacidades0 = proto.getCapabilities;
      const aplicar0 = proto.applyConstraints;
      proto.getCapabilities = function (this: MediaStreamTrack) {
        const r = capacidades0.call(this);
        return (this.kind === 'video' ? { ...r, torch: true } : r) as MediaTrackCapabilities;
      };
      proto.applyConstraints = function (this: MediaStreamTrack, c?: MediaTrackConstraints) {
        const extra = c?.advanced?.[0] as { torch?: boolean } | undefined;
        if (extra && 'torch' in extra) return Promise.resolve();
        return aplicar0.call(this, c);
      };
    });
    await page.goto(RUTA);
    await esperarHidratacion(page, ['#control-zoom']);
    await page.getByRole('button', { name: /Activar lupa/i }).click();
    await esperarCamaraEnMarcha(page);
    await page.getByRole('button', { name: /Activar linterna/i }).click();
    await expect(page.getByRole('button', { name: /Linterna ON/i })).toHaveAttribute('aria-pressed', 'true');

    const SELECTORES = ['[class*=btnPrincipal]', '[class*=linternaActiva]'];
    const bajoMinimo: string[] = [];
    for (const tema of ['claro', 'oscuro']) {
      if (tema === 'oscuro') {
        await page.getByRole('button', { name: 'Cambiar a modo oscuro' }).click();
        await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
      }
      for (const sel of SELECTORES) {
        // Los botones cambian de color con transición: se espera a dos lecturas iguales.
        let previo = -1;
        let ratio = -1;
        await expect
          .poll(
            async () => {
              const medida = await contrasteDe(page, sel);
              const quieto = medida.ratio > 0 && medida.ratio === previo;
              previo = ratio = medida.ratio;
              return quieto;
            },
            { intervals: [150], message: `${sel} existe y su color está quieto (${tema})` },
          )
          .toBe(true);
        if (ratio < 4.5) bajoMinimo.push(`${tema} ${sel} ${ratio}:1`);
      }
    }
    // DEBERÍA: ninguno por debajo de 4,5:1.
    expect(bajoMinimo).toEqual([]);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// RE-INSPECCIÓN (Inspector, 15/10/2026) — tras f3e9c635 (hallazgos 3304, 3305 y 3306)
// ═══════════════════════════════════════════════════════════════════════════
/**
 * Mismo simulador de cámara por pista que los bloques del 14/10. Los valores esperados salen de
 * repartirZoom() y leerRangoZoom() (app/lupa-digital/zoom.ts), calculados a mano antes de ejecutar:
 *   leerRangoZoom: null si máx ≤ max(1, mín), si mín > 1 (3290) o si mín ≤ 0 (3306);
 *   cámara = min(max(zoom, max(1, mín)), máx), redondeada HACIA ABAJO a su paso (con 1e-9);
 *   pantalla = zoom / cámara, a milésimas. Imagen congelada: escala = zoom / cámara al congelar,
 *   y su recorrido máximo, ancho del visor × (escala − 1) / 2.
 */
test.describe('re-inspección 15/10/2026', () => {
  test.describe('en móvil (Pixel 7)', () => {
    // Opciones enumeradas: `...devices['Pixel 7']` arrastra `defaultBrowserType` y fuerza un
    // worker nuevo, que Playwright no admite dentro de un describe.
    const P7 = devices['Pixel 7'];
    test.use({
      viewport: P7.viewport,
      userAgent: P7.userAgent,
      deviceScaleFactor: P7.deviceScaleFactor,
      isMobile: P7.isMobile,
      hasTouch: P7.hasTouch,
    });

    test('CASO 11 — cámara de 1-10× a 4x: la cámara hace los 4x y el vídeo cubre el visor justo; congelada no se recorre (escala 1) y a 5x se recorre 49 px; al reanudar la cámara hace los 5x', async ({
      page,
    }) => {
      await simularCamaraPorPista(page, { trasera: { min: 1, max: 10, step: 0.1 }, frontal: null });
      await page.goto(RUTA);
      await esperarHidratacion(page, ['#control-zoom']);
      await page.getByRole('button', { name: /Activar lupa/i }).click();
      await esperarCamaraEnMarcha(page);
      const video = page.locator('video');
      const lienzo = page.locator('canvas');
      const nota = page.locator('[class*=zoomNota]');

      // 4x: cámara min(max(4, 1), 10) = 4 (40 pasos de 0,1); pantalla 4 / 4 = 1. El vídeo mide lo
      // mismo que el visor del Pixel 7 (412 − 2 × 10 de padding = 392, en 4:3 → 294).
      await page.getByRole('button', { name: '4x', exact: true }).click();
      await expect.poll(() => aumentoPintado(page)).toEqual({ facing: 'environment', camara: 4, pantalla: 1, total: 4 });
      expect(await cajas(page)).toMatchObject({ visor: { ancho: 392, alto: 294 } });
      await expect
        .poll(() => video.evaluate((v) => `${Math.round(v.getBoundingClientRect().width)}×${Math.round(v.getBoundingClientRect().height)}`))
        .toBe('392×294');
      await expect(nota).toHaveText(
        'Los 4x los hace la propia cámara, sobre la imagen completa del sensor: se pierde menos nitidez que ampliando en pantalla.',
      );

      // Congelada a 4x con los 4x hechos por la cámara: escala 4 / 4 = 1 y recorrido 392 × 0 / 2 = 0.
      await page.getByRole('button', { name: /Congelar/i }).click();
      await expect(lienzo).toHaveAttribute('style', /translate\(0px, 0px\) scale\(1\)/);
      await deslizarDesdeElVisor(page, -3000, 0);
      await expect(lienzo).toHaveAttribute('style', /translate\(0px, 0px\) scale\(1\)/);

      // Congelada, 5x: escala 5 / 4 = 1,25 y a la cámara no se le pide nada (siguen [2, 4]);
      // recorrido 392 × 0,25 / 2 = 49 px.
      await page.getByRole('button', { name: '5x', exact: true }).click();
      await expect(lienzo).toHaveAttribute('style', /translate\(0px, 0px\) scale\(1\.25\)/);
      expect((await zoomPedidoPorPista(page)).map((p) => p.zoom)).toEqual([2, 4]);
      await deslizarDesdeElVisor(page, -3000, 0);
      await expect(lienzo).toHaveAttribute('style', /translate\(-49px, 0px\) scale\(1\.25\)/);

      // Reanudar: se pide 5 a la cámara y la pantalla vuelve a 1.
      await page.getByRole('button', { name: /Reanudar/i }).click();
      await esperarCamaraEnMarcha(page);
      await expect.poll(() => aumentoPintado(page)).toEqual({ facing: 'environment', camara: 5, pantalla: 1, total: 5 });
      expect((await zoomPedidoPorPista(page)).map((p) => p.zoom)).toEqual([2, 4, 5]);
      await expect(nota).toHaveText(/^Los 5x los hace la propia cámara/);
    });

    // ✓ HALLAZGO 3316 REPARADO (00153144, 15/10/2026) — accesibilidad. La reparación del 3305
    // cambió el #EF4444 del fondo de «Detener», pero el mismo rojo seguía como COLOR DE TEXTO en
    // `.btnReset:hover` (LupaDigital.module.css), sin variante oscura. En un móvil el :hover se
    // queda pegado tras el toque, así que después de pulsar «Restablecer ajustes» su rótulo
    // (15,2 px, peso 600: texto normal, exige 4,5:1) quedaba en rojo hasta tocar otra cosa.
    // Caso: Pixel 7, tocar «Restablecer ajustes» y medir sobre el fondo compuesto, en claro y en
    //       oscuro → esperado ≥ 4,5:1 · obtenido entonces 3,76:1 (sobre #FFFFFF) y 3,66:1 (#2D2D2D).
    // REPARADO el 15/10/2026: #B91C1C en claro y #FCA5A5 en oscuro. La re-inspección del 16/10/2026
    // lo midió con su valor exacto (6,47:1 y 7,26:1, CASO 15).
    test('REPARADO 3316 — tras tocar «Restablecer ajustes» su rótulo en rojo llega a 4,5:1 en los dos temas', async ({
      page,
    }) => {
      await page.goto(RUTA);
      await esperarHidratacion(page, ['#control-zoom']);
      const boton = page.locator('[class*=btnReset]');
      const bajoMinimo: string[] = [];
      for (const tema of ['claro', 'oscuro']) {
        if (tema === 'oscuro') {
          await page.getByRole('button', { name: 'Cambiar a modo oscuro' }).click();
          await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
        }
        // En el móvil real el toque deja el botón en :hover (lo que pinta el rojo). La emulación
        // táctil de Chromium no lo garantiza tras tap() (1 de cada 3 aislado, cabo C0263), así que
        // se pone el puntero encima: el color medido es el mismo, el de la regla .btnReset:hover.
        await boton.hover();
        await expect.poll(() => boton.evaluate((b) => b.matches(':hover'))).toBe(true);
        let previo = -1;
        let ratio = -1;
        await expect
          .poll(
            async () => {
              const medida = await contrasteDe(page, '[class*=btnReset]');
              const enTema = tema === 'claro' ? medida.luzFondo > 0.7 : medida.luzFondo >= 0 && medida.luzFondo < 0.06;
              const quieto = medida.ratio > 0 && medida.ratio === previo;
              previo = ratio = medida.ratio;
              return enTema && quieto;
            },
            { intervals: [150], message: `«Restablecer ajustes» tocado, con el fondo del tema ${tema}` },
          )
          .toBe(true);
        if (ratio < 4.5) bajoMinimo.push(`${tema} ${ratio}:1`);
      }
      // DEBERÍA: ninguno por debajo de 4,5:1.
      expect(bajoMinimo).toEqual([]);
    });
  });

  test('CASO 12 — rangos raros: mín 0 y mín > 1 no se tratan como aumentos; mín 1 con paso 1 a 1,5x deja la cámara en 1; máx < pedido y paso 0,3 redondean hacia abajo; sin paso, la cámara hace el zoom exacto', async ({
    page,
  }) => {
    await simularCamaraPorPista(page, { trasera: { min: 0, max: 10, step: 1 }, frontal: null });
    await page.goto(RUTA);
    await esperarHidratacion(page, ['#control-zoom']);
    const activar = page.getByRole('button', { name: /Activar lupa/i });
    const detener = page.getByRole('button', { name: /Detener/i });
    const video = page.locator('video');
    const nota = page.locator('[class*=zoomNota]');
    const pedidosDe = async (pista: number) =>
      (await zoomPedidoPorPista(page)).filter((p) => p.pista === pista).map((p) => p.zoom);

    // Pista 0 · {0..10, paso 1}, 2x: mín ≤ 0 → sin rango (3306). Nada a la cámara, scale(2), sin nota.
    await activar.click();
    await esperarCamaraEnMarcha(page);
    await expect(video).toHaveAttribute('style', /transform: scale\(2\)/);
    await page.getByRole('button', { name: '5x', exact: true }).click();
    await expect(video).toHaveAttribute('style', /transform: scale\(5\)/);
    expect(await pedidosDe(0)).toEqual([]);
    await expect(nota).toHaveCount(0);

    // Pista 1 · {1..10, paso 1}, 1,5x: cámara min(1,5; 10) = 1,5 → 1 paso de 1 = 1; pantalla 1,5.
    // Como la cámara queda en 1, la nota ofrece su zoom «al subir».
    await detener.click();
    await cambiarCamaraSimulada(page, { trasera: { min: 1, max: 10, step: 1 }, frontal: null });
    await page.getByRole('button', { name: '1,5x', exact: true }).click();
    await activar.click();
    await esperarCamaraEnMarcha(page);
    await expect.poll(() => aumentoPintado(page)).toMatchObject({ camara: 1, pantalla: 1.5, total: 1.5 });
    expect(await pedidosDe(1)).toEqual([1]);
    await expect(nota).toHaveText(/^Esta cámara puede ampliar por sí misma hasta 5x/);

    // Pista 2 · {2..6, paso 0,1}, 1x: mín > 1 → sin rango (3290). Nada a la cámara, scale(1), sin nota.
    await detener.click();
    await cambiarCamaraSimulada(page, { trasera: { min: 2, max: 6, step: 0.1 }, frontal: null });
    await page.getByRole('button', { name: '1x', exact: true }).click();
    await activar.click();
    await esperarCamaraEnMarcha(page);
    await expect(video).toHaveAttribute('style', /transform: scale\(1\)/);
    expect(await pedidosDe(2)).toEqual([]);
    await expect(nota).toHaveCount(0);

    // Pista 3 · {1..2,5, paso 0,2}, 5x: cámara min(5; 2,5) = 2,5 → 12,5 pasos → 12 = 2,4;
    // pantalla 5 / 2,4 = 2,083 (la nota lo redondea a 2,1).
    await detener.click();
    await cambiarCamaraSimulada(page, { trasera: { min: 1, max: 2.5, step: 0.2 }, frontal: null });
    await page.getByRole('button', { name: '5x', exact: true }).click();
    await activar.click();
    await esperarCamaraEnMarcha(page);
    await expect.poll(() => aumentoPintado(page)).toMatchObject({ camara: 2.4, pantalla: 2.083 });
    await expect(nota).toHaveText('La cámara hace 2,4x y el resto (2,1x) se amplía en pantalla.');

    // Pista 4 · {1..10, paso 0,3}: 2x → 2 / 0,3 = 6,67 → 6 pasos = 1,8; pantalla 2 / 1,8 = 1,111.
    // 4x → 13,33 → 13 pasos = 3,9; pantalla 4 / 3,9 = 1,026 (por debajo de 1,05: nota de «la cámara»).
    await detener.click();
    await cambiarCamaraSimulada(page, { trasera: { min: 1, max: 10, step: 0.3 }, frontal: null });
    await page.getByRole('button', { name: '2x', exact: true }).click();
    await activar.click();
    await esperarCamaraEnMarcha(page);
    await expect.poll(() => aumentoPintado(page)).toMatchObject({ camara: 1.8, pantalla: 1.111 });
    await expect(nota).toHaveText('La cámara hace 1,8x y el resto (1,1x) se amplía en pantalla.');
    await page.getByRole('button', { name: '4x', exact: true }).click();
    await expect.poll(() => aumentoPintado(page)).toMatchObject({ camara: 3.9, pantalla: 1.026 });
    await expect(nota).toHaveText(/^Los 3,9x los hace la propia cámara/);
    expect(await pedidosDe(4)).toEqual([1.8, 3.9]);

    // Pista 5 · {1..10} sin paso (0 = sin redondeo), 1,5x: la cámara hace 1,5 exacto y la pantalla 1.
    await detener.click();
    await cambiarCamaraSimulada(page, { trasera: { min: 1, max: 10, step: 0 }, frontal: null });
    await page.getByRole('button', { name: '1,5x', exact: true }).click();
    await activar.click();
    await esperarCamaraEnMarcha(page);
    await expect.poll(() => aumentoPintado(page)).toMatchObject({ camara: 1.5, pantalla: 1, total: 1.5 });
    await expect(nota).toHaveText(/^Los 1,5x los hace la propia cámara/);
  });

  // ✓ HALLAZGO 3315 REPARADO (3b52f497, 15/10/2026) — operativa, vecino del 3304 que su
  // reparación (f3e9c635) no cubrió. La frase nueva («La cámara se ha quedado en Nx y no deja bajar
  // de ahí…») solo salía con la pantalla por debajo de 0,95; entre 0,95 y 1 la nota seguía cayendo
  // en la rama «pantalla < 1,05» y decía «Los 2,1x los hace la propia cámara…» con el indicador en
  // 2x, y el vídeo se reducía (scale(0,952): 628 × 471 en un visor de 660 × 495, 16 px de borde
  // negro por lado). Pasaba con la cámara clavada en cualquier zoom entre z y z / 0,95 por encima
  // del elegido: medido también con 3,1 a 3x (0,968) y 4,2 a 4x (0,952).
  // Caso: cámara {1..2,1, paso 0,1}; 3x (cámara 2,1 aceptado, pantalla 1,429); desde ahí lo rechaza
  //       todo, también el 1; 2x → esperado: la frase del 3304, «La cámara se ha quedado en 2,1x y
  //       no deja bajar de ahí: para ver 2x, la imagen se reduce…» · obtenido entonces «Los 2,1x los
  //       hace la propia cámara, sobre la imagen completa del sensor…» con el indicador en «2x».
  // REPARADO el 15/10/2026: la frase del 3304 sale con cualquier reducción en pantalla (< 1). La
  // re-inspección del 16/10/2026 lo confirma también con 3,1 a 3x y 4,2 a 4x (CASOS 13 y 14).
  test('REPARADO 3315 — con la cámara clavada en 2,1x, a 2x la nota no debe decir «Los 2,1x los hace la propia cámara»', async ({
    page,
  }) => {
    const camaras = { trasera: { min: 1, max: 2.1, step: 0.1 }, frontal: null };
    await simularCamaraPorPista(page, camaras);
    await page.goto(RUTA);
    await esperarHidratacion(page, ['#control-zoom']);
    await page.getByRole('button', { name: /Activar lupa/i }).click();
    await esperarCamaraEnMarcha(page);
    const nota = page.locator('[class*=zoomNota]');
    await expect.poll(() => aumentoPintado(page)).toMatchObject({ camara: 2, pantalla: 1 });

    // 3x: cámara min(3; 2,1) = 2,1 (21 pasos de 0,1), pantalla 3 / 2,1 = 1,429.
    await page.getByRole('button', { name: '3x', exact: true }).click();
    await expect.poll(() => aumentoPintado(page)).toMatchObject({ camara: 2.1, pantalla: 1.429 });
    await expect(nota).toHaveText('La cámara hace 2,1x y el resto (1,4x) se amplía en pantalla.');

    // Desde aquí la cámara lo rechaza todo. 2x: pide 2 (rechazado), 1 (rechazado), getSettings dice
    // 2,1 → rango {2,1..2,1}: cámara 2,1 y pantalla 2 / 2,1 = 0,952; el efecto se repite una vez
    // (2,1 y 1, rechazados) y se para. Lo que se ve es 2,1 × 0,952 = 2, como marca el indicador.
    await cambiarCamaraSimulada(page, { ...camaras, rechazarPorEncima: 0 });
    await page.getByRole('button', { name: '2x', exact: true }).click();
    await expect.poll(async () => (await zoomPedidoPorPista(page)).map((p) => p.zoom)).toEqual([2, 2.1, 2, 1, 2.1, 1]);
    await expect.poll(() => aumentoPintado(page)).toMatchObject({ camara: 2.1, pantalla: 0.952 });
    await expect(page.locator('[class*=zoomIndicador]')).toHaveText('2x');

    // DEBERÍA: la nota no atribuye a la cámara más aumento del que marca el indicador (criterio del
    // 3304) y, como la imagen se reduce, lo dice con la frase que la reparación escribió para eso.
    await expect(nota).not.toHaveText(/^Los 2,1x los hace la propia cámara/);
    await expect(nota).toHaveText(
      'La cámara se ha quedado en 2,1x y no deja bajar de ahí: para ver 2x, la imagen se reduce en pantalla y queda un borde negro alrededor.',
    );
  });

  // ✓ HALLAZGO 3317 REPARADO (70cee569, 15/10/2026) — contenido. Los rótulos de los deslizadores
  // pegaban el porcentaje al número («☀️ Brillo: 100%», «◐ Contraste: 100%»: page.tsx pintaba
  // `{formatNumber(brillo, 0)}%`), mientras la guía de la misma página lo separaba («brillo al
  // 130 %», «140–160 %»), aunque con un espacio normal (U+0020). La regla del 25/09/2026 (CLAUDE.md
  // global §2) es separarlo con espacio duro U+00A0, que es lo que pone formatPercentage de @/lib.
  // Al repararlo, el CASO 1 (que esperaba «☀️ Brillo: 160%») pasó a la grafía nueva.
  // Caso: cargar la página, desplegar la guía y leer el separador de los cuatro porcentajes →
  //       esperado U+00A0 en los cuatro · obtenido entonces pegado, pegado, U+0020, U+0020.
  // REPARADO el 15/10/2026: formatPercentage en los rótulos y &nbsp; en la guía y el jsonLd (el
  // jsonLd lo comprueba el CASO 17 de la re-inspección del 16/10/2026).
  test('REPARADO 3317 — el porcentaje de brillo y contraste va separado del número con espacio duro, como pide el formato español', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, ['#control-zoom']);
    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
    const separadores = await page.evaluate(() =>
      ['label[for=control-brillo]', 'label[for=control-contraste]', '[class*=escenarioTip]', '[class*=stepGuide]'].flatMap(
        (sel) =>
          [...(document.querySelector(sel)?.textContent ?? '').matchAll(/\d(\s?)%/g)].map((m) =>
            m[1] === ' ' ? 'U+00A0' : m[1] === '' ? 'pegado' : `U+${m[1].codePointAt(0)?.toString(16).toUpperCase().padStart(4, '0')}`,
          ),
      ),
    );
    // Brillo, contraste, «130 %» (primer consejo de la guía) y «140–160 %» (paso 5).
    expect(separadores).toHaveLength(4);
    // DEBERÍA: los cuatro con espacio duro.
    expect(separadores).toEqual(['U+00A0', 'U+00A0', 'U+00A0', 'U+00A0']);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// INSPECTOR 16/10/2026 — re-inspección tras 3b52f497 (3315), 00153144 (3316) y 70cee569 (3317)
// ═══════════════════════════════════════════════════════════════════════════
/**
 * Mismo simulador de cámara por pista que los bloques del 14 y 15/10. Valores esperados calculados
 * a mano ANTES de ejecutar:
 *   · reparto (zoom.ts): cámara = min(max(zoom, max(1, mín)), máx), redondeada HACIA ABAJO a su paso
 *     (con 1e-9); pantalla = zoom / cámara, a milésimas. leerRangoZoom da null si máx ≤ max(1, mín).
 *   · cámara que lo rechaza todo, también el 1 (catch del efecto de page.tsx): el rango se fija en el
 *     zoom que da getSettings() y se reparte con él.
 *   · nota (page.tsx): cámara ≤ 1 → «Esta cámara puede ampliar…»; pantalla < 1 → «La cámara se ha
 *     quedado en Nx…» (3315: antes < 0,95); pantalla < 1,05 → «Los Nx los hace…»; si no, «La cámara
 *     hace Nx y el resto (Mx)…». Las cifras van con formatearZoom: un decimal, y ninguno si el valor
 *     está a menos de 0,05 del entero.
 *   · contraste WCAG 2.x: (L1 + 0,05) / (L2 + 0,05), con la luminancia relativa de cada hexadecimal.
 */
test.describe('Inspector 16/10/2026 — re-inspección tras 3b52f497, 00153144 y 70cee569', () => {
  test.describe('en móvil (Pixel 7)', () => {
    // Opciones enumeradas: `...devices['Pixel 7']` arrastra `defaultBrowserType` y fuerza un
    // worker nuevo, que Playwright no admite dentro de un describe.
    const P7 = devices['Pixel 7'];
    test.use({
      viewport: P7.viewport,
      userAgent: P7.userAgent,
      deviceScaleFactor: P7.deviceScaleFactor,
      isMobile: P7.isMobile,
      hasTouch: P7.hasTouch,
    });

    test('CASO 13 — cámara de 1-3,1× clavada en 3,1: a 3x la nota dice que se ha quedado en 3,1x y que la imagen se reduce, lo que se ve son 3 aumentos, congelada no se recorre y al reanudar vuelve la misma nota', async ({
      page,
    }) => {
      const camaras = { trasera: { min: 1, max: 3.1, step: 0.1 }, frontal: null };
      await simularCamaraPorPista(page, camaras);
      await page.goto(RUTA);
      await esperarHidratacion(page, ['#control-zoom']);
      await page.getByRole('button', { name: /Activar lupa/i }).click();
      await esperarCamaraEnMarcha(page);
      // El medio arranca DE VERDAD, no basta con que exista el <video>.
      const arranque = await estadoDelVideo(page);
      expect(arranque?.readyState).toBeGreaterThanOrEqual(2);
      expect(arranque?.ancho).toBeGreaterThan(0);
      // Visor del Pixel 7: 412 − 2 × 10 de padding = 392, en 4:3 → 294.
      expect(await cajas(page)).toMatchObject({ visor: { ancho: 392, alto: 294 } });
      const nota = page.locator('[class*=zoomNota]');
      const video = page.locator('video');
      const lienzo = page.locator('canvas');
      const cajaDelVideo = () =>
        video.evaluate((v) => {
          const r = v.getBoundingClientRect();
          return `${Math.round(r.width)}×${Math.round(r.height)}`;
        });

      // 2x por defecto: cámara min(2; 3,1) = 2 (20 pasos de 0,1), pantalla 1.
      await expect.poll(() => aumentoPintado(page)).toMatchObject({ camara: 2, pantalla: 1 });
      // 4x: cámara min(4; 3,1) = 3,1 (31 pasos), pantalla 4 / 3,1 = 1,2903 → 1,29.
      await page.getByRole('button', { name: '4x', exact: true }).click();
      await expect.poll(() => aumentoPintado(page)).toMatchObject({ camara: 3.1, pantalla: 1.29 });
      await expect(nota).toHaveText('La cámara hace 3,1x y el resto (1,3x) se amplía en pantalla.');

      // Desde aquí la cámara lo rechaza todo, también el 1. 3x: pide 3 (rechazado), 1 (rechazado) y
      // getSettings dice 3,1 → rango {3,1..3,1}; el efecto pide una vez más 3,1 y 1 y se para.
      await cambiarCamaraSimulada(page, { ...camaras, rechazarPorEncima: 0 });
      await page.getByRole('button', { name: '3x', exact: true }).click();
      await expect.poll(async () => (await zoomPedidoPorPista(page)).map((p) => p.zoom)).toEqual([2, 3.1, 3, 1, 3.1, 1]);
      // pantalla 3 / 3,1 = 0,96774 → 0,968 (dentro de la franja 0,95-1 del 3315). Lo que se ve:
      // 3,1 × 0,968 = 3,0008, es decir 3, lo que marca el indicador. Precisión 2: un aumento que se
      // multiplicara (9,3) o sin compensar (3,1) se sale de ±0,005 de sobra.
      await expect.poll(() => aumentoPintado(page)).toMatchObject({ camara: 3.1, pantalla: 0.968 });
      expect((await aumentoPintado(page)).total).toBeCloseTo(3, 2);
      await expect(page.locator('[class*=zoomIndicador]')).toHaveText('3x');
      // Vídeo reducido con borde negro: 392 × 0,968 = 379,5 → 379 y 294 × 0,968 = 284,6 → 285.
      await expect.poll(cajaDelVideo).toBe('379×285');
      await expect(nota).toHaveText(
        'La cámara se ha quedado en 3,1x y no deja bajar de ahí: para ver 3x, la imagen se reduce en pantalla y queda un borde negro alrededor.',
      );

      // Congelada a 3x: la imagen trae los 3,1x de la cámara → escala 3 / 3,1 = 0,968 y recorrido
      // max(0; 392 × (0,968 − 1) / 2) = 0. Sin nota: con la imagen quieta no se le pide nada a la cámara.
      await page.getByRole('button', { name: /Congelar/i }).click();
      await expect(lienzo).toHaveAttribute('style', /translate\(0px, 0px\) scale\(0\.968\)/);
      await expect(nota).toHaveCount(0);
      await deslizarDesdeElVisor(page, -3000, 0);
      await expect(lienzo).toHaveAttribute('style', /translate\(0px, 0px\) scale\(0\.968\)/);

      // Reanudar: se le vuelve a pedir su 3,1 (rechazado → 1, rechazado) y queda igual: 8 pedidos.
      await page.getByRole('button', { name: /Reanudar/i }).click();
      await esperarCamaraEnMarcha(page);
      await expect.poll(async () => (await zoomPedidoPorPista(page)).length).toBe(8);
      await expect.poll(() => aumentoPintado(page)).toMatchObject({ camara: 3.1, pantalla: 0.968 });
      await expect(nota).toHaveText(/^La cámara se ha quedado en 3,1x y no deja bajar de ahí: para ver 3x, la imagen se reduce/);
    });

    test('CASO 15 — «Restablecer ajustes» tocado: su rótulo da 6,47:1 en claro (#B91C1C sobre #FFFFFF) y 7,26:1 en oscuro (#FCA5A5 sobre #2D2D2D), calculados desde los hexadecimales', async ({
      page,
    }) => {
      // A mano (WCAG 2.x, luminancia relativa de cada canal y L = 0,2126 R + 0,7152 G + 0,0722 B):
      //   #B91C1C → R 185 → 0,4851 · G y B 28 → 0,01162 → L = 0,1031 + 0,7874 × 0,01162 = 0,1123;
      //     sobre blanco (L = 1): 1,05 / 0,1623 = 6,47.
      //   #FCA5A5 → R 252 → 0,9734 · G y B 165 → 0,3763 → L = 0,2070 + 0,7874 × 0,3763 = 0,5032;
      //     #2D2D2D → 45 → 0,02624; 0,5532 / 0,07624 = 7,26.
      // El botón es transparente: su fondo es el de la tarjeta (.section, var(--bg-card)).
      // toBeCloseTo(x, 1) = ±0,05, de sobra para distinguir el #EF4444 de antes (3,76 y 3,66).
      await page.goto(RUTA);
      await esperarHidratacion(page, ['#control-zoom']);
      const boton = page.locator('[class*=btnReset]');
      const ESPERADO = {
        claro: { color: 'rgb(185, 28, 28)', ratio: 6.47 },
        oscuro: { color: 'rgb(252, 165, 165)', ratio: 7.26 },
      };
      for (const tema of ['claro', 'oscuro'] as const) {
        if (tema === 'oscuro') {
          // Con el botón de la propia página: sembrar data-theme a mano puede medir otro estado.
          await page.getByRole('button', { name: 'Cambiar a modo oscuro' }).click();
          await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
        }
        // En el móvil real el toque deja el :hover pegado; la emulación táctil no lo garantiza tras
        // tap() (cabo C0263), así que se pone el puntero encima: la regla medida es la misma.
        await boton.hover();
        await expect.poll(() => boton.evaluate((b) => b.matches(':hover'))).toBe(true);
        // El color cambia con transición (0,2 s): se espera al final.
        await expect.poll(() => boton.evaluate((b) => getComputedStyle(b).color)).toBe(ESPERADO[tema].color);
        await expect.poll(() => contrasteSobreFondoReal(boton), { message: `contraste en ${tema}` }).toBeCloseTo(
          ESPERADO[tema].ratio,
          1,
        );
      }
    });
  });

  test('CASO 14 — cámara de 1-4,2× clavada en 4,2: a 4x y a 1x la nota dice que la imagen se reduce (0,952 y 0,238 en pantalla) y a 5x vuelve «La cámara hace 4,2x y el resto (1,2x)» sin pedirle nada nuevo', async ({
    page,
  }) => {
    const camaras = { trasera: { min: 1, max: 4.2, step: 0.1 }, frontal: null };
    await simularCamaraPorPista(page, camaras);
    await page.goto(RUTA);
    await esperarHidratacion(page, ['#control-zoom']);
    await page.getByRole('button', { name: /Activar lupa/i }).click();
    await esperarCamaraEnMarcha(page);
    const nota = page.locator('[class*=zoomNota]');
    const pedidos = async () => (await zoomPedidoPorPista(page)).map((p) => p.zoom);

    // 5x: cámara min(5; 4,2) = 4,2 (42 pasos de 0,1); pantalla 5 / 4,2 = 1,1905 → 1,19.
    await page.getByRole('button', { name: '5x', exact: true }).click();
    await expect.poll(() => aumentoPintado(page)).toMatchObject({ camara: 4.2, pantalla: 1.19 });
    await expect(nota).toHaveText('La cámara hace 4,2x y el resto (1,2x) se amplía en pantalla.');

    // Desde aquí lo rechaza todo. 4x: pide 4 → rechazado → 1 → rechazado → getSettings 4,2 → rango
    // {4,2..4,2}; el efecto pide 4,2 y 1 una vez más y se para.
    await cambiarCamaraSimulada(page, { ...camaras, rechazarPorEncima: 0 });
    await page.getByRole('button', { name: '4x', exact: true }).click();
    await expect.poll(pedidos).toEqual([2, 4.2, 4, 1, 4.2, 1]);
    // pantalla 4 / 4,2 = 0,95238 → 0,952: la franja que el 3315 dejaba en «Los 4,2x los hace…».
    await expect.poll(() => aumentoPintado(page)).toMatchObject({ camara: 4.2, pantalla: 0.952 });
    await expect(page.locator('[class*=zoomIndicador]')).toHaveText('4x');
    await expect(nota).toHaveText(
      'La cámara se ha quedado en 4,2x y no deja bajar de ahí: para ver 4x, la imagen se reduce en pantalla y queda un borde negro alrededor.',
    );

    // 1x: pantalla 1 / 4,2 = 0,238; lo que se ve, 4,2 × 0,238 = 0,9996 ≈ 1.
    await page.getByRole('button', { name: '1x', exact: true }).click();
    await expect.poll(() => aumentoPintado(page)).toMatchObject({ camara: 4.2, pantalla: 0.238 });
    expect((await aumentoPintado(page)).total).toBeCloseTo(1, 2);
    await expect(nota).toHaveText(/^La cámara se ha quedado en 4,2x y no deja bajar de ahí: para ver 1x, la imagen se reduce/);

    // 5x: la parte de la cámara sigue siendo 4,2, así que no se le pide nada; pantalla 1,19 otra vez.
    await page.getByRole('button', { name: '5x', exact: true }).click();
    await expect.poll(() => aumentoPintado(page)).toMatchObject({ camara: 4.2, pantalla: 1.19 });
    await expect(nota).toHaveText('La cámara hace 4,2x y el resto (1,2x) se amplía en pantalla.');
    expect(await pedidos()).toHaveLength(6);
  });

  test('CASO 16 — una cámara que anuncia zoom pero no amplía (0,5-1× o 1-1×) no recibe ningún pedido: todo el zoom va a la pantalla y no sale la nota', async ({
    page,
  }) => {
    // leerRangoZoom: {0,5..1} → máx 1 ≤ max(1; 0,5) = 1 → null; {1..1} → 1 ≤ 1 → null.
    await simularCamaraPorPista(page, { trasera: { min: 0.5, max: 1, step: 0.1 }, frontal: null });
    await page.goto(RUTA);
    await esperarHidratacion(page, ['#control-zoom']);
    const activar = page.getByRole('button', { name: /Activar lupa/i });
    const video = page.locator('video');
    const nota = page.locator('[class*=zoomNota]');
    await activar.click();
    await esperarCamaraEnMarcha(page);

    // 2x y 3x: todo en pantalla, scale(2) y scale(3).
    await expect(video).toHaveAttribute('style', /transform: scale\(2\)/);
    await page.getByRole('button', { name: '3x', exact: true }).click();
    await expect(video).toHaveAttribute('style', /transform: scale\(3\)/);
    await page.waitForTimeout(500); // margen para un applyConstraints que no debe llegar
    expect(await zoomPedidoPorPista(page)).toEqual([]);
    await expect(nota).toHaveCount(0);

    // {1..1} a 5x: igual, scale(5), ni pedidos ni nota.
    await page.getByRole('button', { name: /Detener/i }).click();
    await cambiarCamaraSimulada(page, { trasera: { min: 1, max: 1, step: 0.1 }, frontal: null });
    await page.getByRole('button', { name: '5x', exact: true }).click();
    await activar.click();
    await esperarCamaraEnMarcha(page);
    await expect(video).toHaveAttribute('style', /transform: scale\(5\)/);
    await page.waitForTimeout(500);
    expect(await zoomPedidoPorPista(page)).toEqual([]);
    await expect(nota).toHaveCount(0);
  });

  test('CASO 17 — la característica «Procesado 100 % local» del JSON-LD también lleva espacio duro antes del % (3317)', async ({
    page,
  }) => {
    // metadata.ts → jsonLd.features → featureList del WebApplication, que no se ve en pantalla.
    await page.goto(RUTA);
    const caracteristicas = await page.evaluate(() => {
      for (const s of Array.from(document.querySelectorAll('script[type="application/ld+json"]'))) {
        const datos = JSON.parse(s.textContent || '{}');
        if (datos['@type'] === 'WebApplication') return datos.featureList as string[];
      }
      return [];
    });
    expect(caracteristicas).toContain('Procesado 100 % local en el navegador, sin envío de imágenes');
    // Ningún % pegado ni con espacio normal en las características.
    expect(caracteristicas.filter((c) => /\d( ?)%/.test(c))).toEqual([]);
  });

  // ✓ HALLAZGO 3327 REPARADO (6ec61bc2, 18/10/2026) — operativa (16/10/2026), vecino del 3315 que su
  // reparación (3b52f497) no cubrió. La frase del 3304 salía ya con cualquier reducción en pantalla
  // (< 1), pero las dos cifras que daba iban por formatearZoom, que quita el decimal cuando el valor
  // está a menos de 0,05 del entero. Con la cámara clavada un poco por encima del zoom elegido (2,03
  // a 2x: pantalla 2 / 2,03 = 0,985), la nota decía «La cámara se ha quedado en 2x y no deja bajar
  // de ahí: para ver 2x, la imagen se reduce en pantalla…»: la misma cifra a los dos lados, y aun así
  // se reducía. Exigía una cámara cuyo zoom quedara a menos de 0,05 por encima del pedido (paso de
  // 0,01 o sin paso); con el paso de 0,1 del caso del 3315 no se daba.
  // Caso: cámara {1..2,03, paso 0,01}; 3x (cámara 2,03 aceptado, pantalla 1,478); desde ahí lo
  //       rechaza todo, también el 1; 2x → esperado: la nota no da a la cámara la misma cifra que al
  //       zoom pedido cuando dice que la imagen se reduce · obtenido entonces «La cámara se ha quedado
  //       en 2x y no deja bajar de ahí: para ver 2x, la imagen se reduce en pantalla y queda un borde
  //       negro alrededor.» con el vídeo a scale(0,985).
  // La re-inspección del 22/10/2026 comprueba también la rama sin cifra (CASO 20).
  test('REPARADO 3327 (operativa, vecino del 3315) — con la cámara clavada en 2,03x, a 2x la nota no dice que se ha quedado en 2x y que para ver 2x la imagen se reduce', async ({
    page,
  }) => {
    // REPARADO (hallazgo 3327, 18/10/2026): formatearZoomFrente da a la cámara los decimales que la
    // distinguen del zoom pedido («2,03x»), o la frase va sin cifra si ni con dos se distinguen.
    const camaras = { trasera: { min: 1, max: 2.03, step: 0.01 }, frontal: null };
    await simularCamaraPorPista(page, camaras);
    await page.goto(RUTA);
    await esperarHidratacion(page, ['#control-zoom']);
    await page.getByRole('button', { name: /Activar lupa/i }).click();
    await esperarCamaraEnMarcha(page);
    const nota = page.locator('[class*=zoomNota]');

    // 3x: cámara min(3; 2,03) = 2,03 (203 pasos de 0,01), pantalla 3 / 2,03 = 1,4778 → 1,478.
    await page.getByRole('button', { name: '3x', exact: true }).click();
    await expect.poll(() => aumentoPintado(page)).toMatchObject({ camara: 2.03, pantalla: 1.478 });

    // Desde aquí lo rechaza todo. 2x: rango fijado en {2,03}; pantalla 2 / 2,03 = 0,98522 → 0,985.
    await cambiarCamaraSimulada(page, { ...camaras, rechazarPorEncima: 0 });
    await page.getByRole('button', { name: '2x', exact: true }).click();
    await expect.poll(async () => (await zoomPedidoPorPista(page)).map((p) => p.zoom)).toEqual([2, 2.03, 2, 1, 2.03, 1]);
    await expect.poll(() => aumentoPintado(page)).toMatchObject({ camara: 2.03, pantalla: 0.985 });
    await expect(page.locator('[class*=zoomIndicador]')).toHaveText('2x');
    await expect(nota).toBeVisible();

    // DEBERÍA: si la nota dice dónde se ha quedado la cámara y que la imagen se reduce, la cifra de
    // la cámara no puede ser la misma que la del zoom pedido (admite cualquier redacción que no
    // repita la cifra, o una que no use esa frase).
    const texto = (await nota.textContent()) ?? '';
    const cifras = texto.match(/quedado en ([\d,]+)x[\s\S]*?ver ([\d,]+)x/);
    if (cifras) expect(cifras[1]).not.toBe(cifras[2]);
    // Lo que dice ahora: la cámara con sus dos decimales.
    expect(texto).toContain('La cámara se ha quedado en 2,03x y no deja bajar de ahí: para ver 2x');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// INSPECTOR 22/10/2026 — re-inspección tras 6ec61bc2 (3327), ae8759c4 (3274) y 4196701d (3273 y
// 3276), y medida del cabo C0260
// ═══════════════════════════════════════════════════════════════════════════
/**
 * Mismo simulador de cámara por pista que los bloques del 14 al 16/10, con `abreEn` para el C0260.
 * Valores esperados calculados a mano ANTES de ejecutar:
 *   · reparto (zoom.ts): cámara = min(max(zoom, max(1, mín)), máx), redondeada HACIA ABAJO a su paso;
 *     pantalla = zoom / cámara, a milésimas. Imagen congelada: escala = zoom / cámara al congelar.
 *   · recorrido de la imagen congelada (acotarDesplazamiento y el ResizeObserver del 3273): ancho del
 *     visor × (escala − 1) / 2 en x y alto × (escala − 1) / 2 en y. Visor del Pixel 7: 412 − 2 × 10
 *     = 392 × 294 (4:3); en horizontal (863 × 360): 700 − 2 × 20 = 660 × 495.
 *   · nota con la cámara clavada por encima del zoom (3327, formatearZoomFrente): la cifra de la
 *     cámara con los decimales que la distingan del zoom pedido, hasta dos; si ni con dos se
 *     distingue, la frase sin cifra («un poco por encima de»).
 *   · contraste WCAG 2.x sobre el fondo compuesto (tinte rgba sobre la tarjeta).
 */
test.describe('Inspector 22/10/2026 — re-inspección tras 6ec61bc2, ae8759c4 y 4196701d', () => {
  test.describe('en móvil (Pixel 7)', () => {
    // Opciones enumeradas: `...devices['Pixel 7']` arrastra `defaultBrowserType` y fuerza un
    // worker nuevo, que Playwright no admite dentro de un describe.
    const P7 = devices['Pixel 7'];
    test.use({
      viewport: P7.viewport,
      userAgent: P7.userAgent,
      deviceScaleFactor: P7.deviceScaleFactor,
      isMobile: P7.isMobile,
      hasTouch: P7.hasTouch,
    });

    test('CASO 18 — deslizador a 3,5x con una cámara de 1-3×: la cámara hace 3x y la pantalla 1,167; congelada, el sepia, el brillo y el contraste llegan a la imagen quieta, las flechas la recorren hasta su tope y «Restablecer» no toca el zoom', async ({
      page,
    }) => {
      await simularCamaraPorPista(page, { trasera: { min: 1, max: 3, step: 0.1 }, frontal: null });
      await page.goto(RUTA);
      await esperarHidratacion(page, ['#control-zoom', '#control-brillo', '#control-contraste']);
      await page.getByRole('button', { name: /Activar lupa/i }).click();
      await esperarCamaraEnMarcha(page);
      // El medio arranca DE VERDAD, no basta con que exista el <video>.
      const arranque = await estadoDelVideo(page);
      expect(arranque?.readyState).toBeGreaterThanOrEqual(2);
      expect(arranque?.ancho).toBeGreaterThan(0);
      const lienzo = page.locator('canvas');
      const nota = page.locator('[class*=zoomNota]');

      // 2x por defecto: cámara 2 (20 pasos de 0,1), pantalla 1.
      await expect.poll(() => aumentoPintado(page)).toEqual({ facing: 'environment', camara: 2, pantalla: 1, total: 2 });

      // 3,5x con el deslizador (no hay preajuste de 3,5): cámara min(3,5; 3) = 3 (30 pasos), pantalla
      // 3,5 / 3 = 1,1667 → 1,167; lo que se ve, 3 × 1,167 = 3,501. La nota redondea 1,167 a «1,2».
      await sembrarValor(page, '#control-zoom', 3.5);
      await expect
        .poll(() => aumentoPintado(page))
        .toEqual({ facing: 'environment', camara: 3, pantalla: 1.167, total: 3.501 });
      await expect(page.locator('#titulo-zoom')).toHaveText('Zoom: 3,5x');
      await expect(page.locator('[class*=zoomIndicador]')).toHaveText('3,5x');
      await expect(page.locator('[class*=zoomPresets] button[aria-pressed="true"]')).toHaveCount(0);
      await expect(nota).toHaveText('La cámara hace 3x y el resto (1,2x) se amplía en pantalla.');

      // Congelada: la imagen trae los 3x de la cámara → escala 3,5 / 3 = 1,167.
      await page.getByRole('button', { name: /Congelar/i }).click();
      await expect(lienzo).toHaveAttribute('style', /translate\(0px, 0px\) scale\(1\.167\)/);

      // RESPUESTA_IMAGEN_FIJA (la respuesta única de 3276): «Sobre la imagen quieta siguen funcionando
      // el zoom, los filtros de contraste y el brillo». Sepia, brillo 140 y contraste 80 llegan al
      // filtro del LIENZO, en el orden de getFiltroStyle (brillo, contraste, filtro).
      await page.getByRole('button', { name: /Sepia/i }).click();
      await sembrarValor(page, '#control-brillo', 140);
      await sembrarValor(page, '#control-contraste', 80);
      await expect(lienzo).toHaveAttribute('style', /filter: brightness\(140%\) contrast\(80%\) sepia\(100%\)/);
      // Rótulos con espacio duro (U+00A0) antes del %, como manda el formato español (3317).
      await expect(page.locator('label[for=control-brillo]')).toHaveText('☀️ Brillo: 140 %');
      await expect(page.locator('label[for=control-contraste]')).toHaveText('◐ Contraste: 80 %');

      // Flechas: 20 px por pulsación, acotado a 392 × (1,167 − 1) / 2 = 32,732 en x y a
      // 294 × 0,167 / 2 = 24,549 en y. La segunda pulsación (40) choca con el tope en los dos ejes.
      await lienzo.focus();
      for (const tecla of ['ArrowLeft', 'ArrowLeft', 'ArrowUp', 'ArrowUp']) await page.keyboard.press(tecla);
      await expect(lienzo).toHaveAttribute('style', /translate\(32\.732\d*px, 24\.549\d*px\) scale\(1\.167\)/);

      // «Restablecer ajustes»: brillo, contraste y filtro al origen; ni el zoom ni el recorrido cambian.
      await page.getByRole('button', { name: /Restablecer ajustes/i }).click();
      await expect(lienzo).toHaveAttribute(
        'style',
        /translate\(32\.732\d*px, 24\.549\d*px\) scale\(1\.167\); filter: brightness\(100%\) contrast\(100%\);/,
      );
      await expect(page.getByRole('button', { name: /Normal/i })).toHaveAttribute('aria-pressed', 'true');
      await expect(page.locator('#titulo-zoom')).toHaveText('Zoom: 3,5x');

      // Reanudar: se le vuelve a pedir su 3 a la cámara ([2, 3, 3]) y la nota vuelve.
      await page.getByRole('button', { name: /Reanudar/i }).click();
      await esperarCamaraEnMarcha(page);
      await expect.poll(async () => (await zoomPedidoPorPista(page)).map((p) => p.zoom)).toEqual([2, 3, 3]);
      await expect.poll(() => aumentoPintado(page)).toMatchObject({ camara: 3, pantalla: 1.167 });
      await expect(nota).toHaveText('La cámara hace 3x y el resto (1,2x) se amplía en pantalla.');
    });

    test('CASO 19 (3273) — girar con la imagen congelada recorrida en DIAGONAL y con zoom de cámara (2x de cámara, 2,5 en pantalla): en vertical se reacota en los dos ejes y sigue cubriendo el visor; al volver a horizontal no se mueve', async ({
      page,
    }) => {
      await simularCamaraPorPista(page, { trasera: { min: 1, max: 2, step: 0.1 }, frontal: null });
      await page.goto(RUTA);
      await esperarHidratacion(page, ['#control-zoom']);
      await page.getByRole('button', { name: /Activar lupa/i }).click();
      await esperarCamaraEnMarcha(page);
      const lienzo = page.locator('canvas');

      // 5x: cámara min(5; 2) = 2, pantalla 2,5. Congelada: escala 5 / 2 = 2,5 (no 5: el test del 3273
      // solo miraba todo el zoom en pantalla y el eje x).
      await page.getByRole('button', { name: '5x', exact: true }).click();
      await expect.poll(() => aumentoPintado(page)).toMatchObject({ camara: 2, pantalla: 2.5, total: 5 });
      await page.getByRole('button', { name: /Congelar/i }).click();
      await expect(lienzo).toHaveAttribute('style', /translate\(0px, 0px\) scale\(2\.5\)/);

      // Horizontal (Pixel 7 landscape, 863 × 360): visor 660 × 495; topes 660 × 1,5 / 2 = 495 y
      // 495 × 1,5 / 2 = 371,25. El dedo va en diagonal hasta los dos topes.
      await page.setViewportSize({ width: 863, height: 360 });
      await expect.poll(async () => (await cajas(page)).visor.ancho).toBe(660);
      await deslizarDesdeElVisor(page, -3000, -3000);
      await expect(lienzo).toHaveAttribute('style', /translate\(-495px, -371\.25px\) scale\(2\.5\)/);

      // Vertical: visor 392 × 294; topes 392 × 1,5 / 2 = 294 y 294 × 1,5 / 2 = 220,5.
      await page.setViewportSize({ width: 412, height: 839 });
      await expect.poll(async () => (await cajas(page)).visor.ancho).toBe(392);
      await expect(lienzo).toHaveAttribute('style', /translate\(-294px, -220\.5px\) scale\(2\.5\)/);
      // Con los topes, la imagen (392 × 2,5 = 980 de ancho y 294 × 2,5 = 735 de alto) llega justo al
      // borde derecho e inferior del visor: lo cubre entero, sin franja negra en ningún lado.
      const cubre = await page.evaluate(() => {
        const c = (document.querySelector('canvas') as HTMLCanvasElement).getBoundingClientRect();
        const v = ((document.querySelector('canvas') as HTMLCanvasElement).parentElement as HTMLElement).getBoundingClientRect();
        return {
          izquierda: c.left <= v.left + 0.5,
          derecha: c.right >= v.right - 0.5,
          arriba: c.top <= v.top + 0.5,
          abajo: c.bottom >= v.bottom - 0.5,
        };
      });
      expect(cubre).toEqual({ izquierda: true, derecha: true, arriba: true, abajo: true });

      // Otra vez horizontal: el visor crece y el desplazamiento cabe en los topes nuevos, así que el
      // ResizeObserver no lo toca.
      await page.setViewportSize({ width: 863, height: 360 });
      await expect.poll(async () => (await cajas(page)).visor.ancho).toBe(660);
      await page.waitForTimeout(300); // margen para un ResizeObserver que no debe mover nada
      await expect(lienzo).toHaveAttribute('style', /translate\(-294px, -220\.5px\) scale\(2\.5\)/);

      // Congelada, 2x: escala 2 / 2 = 1, sin recorrido.
      await page.getByRole('button', { name: '2x', exact: true }).click();
      await expect(lienzo).toHaveAttribute('style', /translate\(0px, 0px\) scale\(1\)/);
    });

    test('CASO 20 (3327) — cámara sin paso de 1-2,004× clavada en 2,004: a 2x ni con dos decimales se distingue de 2, así que la nota dice que se ha quedado «un poco por encima de 2x» (la rama sin cifra)', async ({
      page,
    }) => {
      const camaras = { trasera: { min: 1, max: 2.004, step: 0 }, frontal: null };
      await simularCamaraPorPista(page, camaras);
      await page.goto(RUTA);
      await esperarHidratacion(page, ['#control-zoom']);
      await page.getByRole('button', { name: /Activar lupa/i }).click();
      await esperarCamaraEnMarcha(page);
      const nota = page.locator('[class*=zoomNota]');

      // 3x: cámara min(3; 2,004) = 2,004 (sin paso no se redondea); pantalla 3 / 2,004 = 1,497.
      // formatearZoom(2,004) = «2» y formatearZoom(1,497) = «1,5».
      await page.getByRole('button', { name: '3x', exact: true }).click();
      await expect.poll(() => aumentoPintado(page)).toMatchObject({ camara: 2.004, pantalla: 1.497 });
      await expect(nota).toHaveText('La cámara hace 2x y el resto (1,5x) se amplía en pantalla.');

      // Desde aquí lo rechaza todo, también el 1. 2x: pide 2 → rechazado → 1 → rechazado →
      // getSettings 2,004 → rango {2,004}; el efecto pide 2,004 y 1 una vez más y se para.
      // Pantalla 2 / 2,004 = 0,998; lo que se ve, 2,004 × 0,998 = 2,000.
      await cambiarCamaraSimulada(page, { ...camaras, rechazarPorEncima: 0 });
      await page.getByRole('button', { name: '2x', exact: true }).click();
      await expect
        .poll(async () => (await zoomPedidoPorPista(page)).map((p) => p.zoom))
        .toEqual([2, 2.004, 2, 1, 2.004, 1]);
      await expect.poll(() => aumentoPintado(page)).toMatchObject({ camara: 2.004, pantalla: 0.998 });
      expect((await aumentoPintado(page)).total).toBeCloseTo(2, 2);
      await expect(page.locator('[class*=zoomIndicador]')).toHaveText('2x');
      // formatearZoomFrente(2,004; 2): 2 → 2,0 → 2,00, las tres iguales a «2» → sin cifra.
      await expect(nota).toHaveText(
        'La cámara se ha quedado un poco por encima de 2x y no deja bajar de ahí: la imagen se reduce en pantalla y queda un borde negro alrededor.',
      );
      // El vídeo, reducido: 392 × 0,998 = 391,2 → 391 y 294 × 0,998 = 293,4 → 293.
      await expect
        .poll(() =>
          page.locator('video').evaluate((v) => {
            const r = v.getBoundingClientRect();
            return `${Math.round(r.width)}×${Math.round(r.height)}`;
          }),
        )
        .toBe('391×293');
      await page.waitForTimeout(500);
      expect(await zoomPedidoPorPista(page)).toHaveLength(6); // sin bucle
    });

    /**
     * Cabo C0260 (inspector del 15/10/2026): «una cámara que ABRE por debajo de 1 (zoom 0,5 en
     * getSettings) y rechaza todo applyConstraints». Medido el 22/10/2026 con este simulador
     * (abreEn 0,5, rango {0,5..8, paso 0,1}, rechazarPorEncima 0): a 2x la app pide 2 y 1, los dos
     * rechazados; getSettings dice 0,5 y el catch del efecto solo fija el rango si el zoom pasa de 1
     * (page.tsx), así que cae a «todo en pantalla»: scale(2) sobre una cámara en 0,5 = 1 aumento visto
     * con el indicador en 2x y sin nota; a 5x, 2,5; a 1x, 0,5; congelada a 2x, scale(2) sobre la
     * imagen tomada a 0,5. El cabo SIGUE ABIERTO —no se conoce un navegador que abra la pista por
     * debajo de 1 y además rechace el 1—, y por eso esa combinación no se fija aquí ni como esperado
     * ni con test.fail(). Lo que sí se fija: con la misma cámara que COOPERA, la app acierta.
     */
    test('CASO 22 (cabo C0260) — una cámara que ABRE en gran angular (0,5) y acepta el zoom no se queda alejada: a 2x la cámara hace 2 y a 1x vuelve a 1; si rechaza el 3 pero acepta el 1, todo va a la pantalla y se ven los 3 aumentos', async ({
      page,
    }) => {
      const gran = { min: 0.5, max: 8, step: 0.1 };
      await simularCamaraPorPista(page, { trasera: gran, frontal: null, abreEn: 0.5 });
      await page.goto(RUTA);
      await esperarHidratacion(page, ['#control-zoom']);
      await page.getByRole('button', { name: /Activar lupa/i }).click();
      await esperarCamaraEnMarcha(page);
      const nota = page.locator('[class*=zoomNota]');

      // 2x: leerRangoZoom acepta {0,5..8} (un mínimo de 0,5 es un aumento); cámara min(max(2; 1); 8)
      // = 2 (20 pasos), pantalla 1. La cámara sale de 0,5 a 2.
      await expect.poll(() => aumentoPintado(page)).toEqual({ facing: 'environment', camara: 2, pantalla: 1, total: 2 });
      await expect(nota).toHaveText(/^Los 2x los hace la propia cámara/);

      // 1x: cámara max(1; max(1; 0,5)) = 1 → se le pide 1 (nunca 0,5): sin ampliar, no alejada.
      await page.getByRole('button', { name: '1x', exact: true }).click();
      await expect.poll(() => aumentoPintado(page)).toEqual({ facing: 'environment', camara: 1, pantalla: 1, total: 1 });
      expect((await zoomPedidoPorPista(page)).map((p) => p.zoom)).toEqual([2, 1]);
      // min(8; 5) = 5: la nota ofrece el tope de la app, no el de la cámara.
      await expect(nota).toHaveText(/^Esta cámara puede ampliar por sí misma hasta 5x/);

      // Pista nueva (la 1) que abre en 0,5, rechaza lo que pase de 1,5 y acepta el 1. A 3x: pide 3 →
      // rechazado → pide 1 → aceptado → getSettings 1 → sin rango: todo en pantalla y sin nota.
      // Lo que se ve, 1 × 3 = 3, lo que marca el indicador.
      await page.getByRole('button', { name: /Detener/i }).click();
      await cambiarCamaraSimulada(page, { trasera: gran, frontal: null, abreEn: 0.5, rechazarPorEncima: 1.5 });
      await page.getByRole('button', { name: '3x', exact: true }).click();
      await page.getByRole('button', { name: /Activar lupa/i }).click();
      await esperarCamaraEnMarcha(page);
      await expect
        .poll(async () => (await zoomPedidoPorPista(page)).filter((p) => p.pista === 1).map((p) => p.zoom))
        .toEqual([3, 1]);
      await expect.poll(() => aumentoPintado(page)).toEqual({ facing: 'environment', camara: 1, pantalla: 3, total: 3 });
      await expect(page.locator('[class*=zoomIndicador]')).toHaveText('3x');
      await expect(nota).toHaveCount(0);
    });
  });

  test('CASO 21 (3274) — con su valor exacto: el preajuste activo, los consejos de escenario y el dato de la FAQ dan 4,85 · 4,97 · 4,79:1 en claro y 4,68 · 4,68 · 5,13:1 en oscuro', async ({
    page,
  }) => {
    // A mano (WCAG 2.x; L = 0,2126 R + 0,7152 G + 0,0722 B con cada canal linealizado), sobre la
    // tarjeta (--bg-card: #FFFFFF en claro, #2D2D2D en oscuro) con el tinte de cada regla encima:
    //   claro
    //     preajuste: #26718F (L 0,1421) sobre el tinte 0,10 → (234,1; 242,9; 246,6), L 0,8824 → 4,85
    //     escenario: #26718F sobre el tinte 0,08 → (238,28; 245,32; 248,28), L 0,9052 → 4,97
    //     dato FAQ:  #327874 (L 0,1537) sobre rgba(72,169,166,0,08) → (240,36; 248,12; 247,88), L 0,9257 → 4,79
    //   oscuro
    //     preajuste y escenario: #3FA5D1 (L 0,3257) sobre el tinte 0,05 → (45,05; 49,45; 51,3), L 0,0304 → 4,68
    //     dato FAQ:  #5ABDB9 (L 0,4207) sobre rgba(72,169,166,0,12) → (48,24; 59,88; 59,52), L 0,0417 → 5,13
    // Antes de ae8759c4, el preajuste y el escenario daban 4,42 y 4,33 en oscuro (tintes del 10 y 12 %):
    // toBeCloseTo(x, 1) = ±0,05 los distingue de sobra.
    // ⚠️ El dato de la FAQ vive dentro de un <details> cerrado, y ahí la transición global de
    // background-color (globals.css, 0,3 s) no avanza: getComputedStyle se queda con el tinte del tema
    // anterior (medido: 0,08 en oscuro y 5,47:1). Por eso se abre la pregunta antes de medir.
    await page.goto(RUTA);
    await esperarHidratacion(page, ['#control-zoom']);
    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
    await page.locator('summary', { hasText: '¿La lupa digital tiene la misma calidad que una lupa física?' }).click();

    /** Espera al color y al fondo finales del elemento y a dos lecturas iguales del contraste. */
    const medir = async (selector: string, color: string, fondo: string) => {
      const el = page.locator(selector).first();
      await expect
        .poll(() => el.evaluate((e) => `${getComputedStyle(e).color} | ${getComputedStyle(e).backgroundColor}`))
        .toBe(`${color} | ${fondo}`);
      let previo = -1;
      let ratio = -1;
      await expect
        .poll(
          async () => {
            ratio = Math.round((await contrasteSobreFondoReal(el)) * 1000) / 1000;
            const quieto = ratio === previo;
            previo = ratio;
            return quieto;
          },
          { intervals: [150], message: `${selector} con el contraste quieto` },
        )
        .toBe(true);
      return ratio;
    };

    expect(await medir('[class*=zoomPresetActivo]', 'rgb(38, 113, 143)', 'rgba(46, 134, 171, 0.1)')).toBeCloseTo(4.85, 1);
    expect(await medir('[class*=escenarioTip]', 'rgb(38, 113, 143)', 'rgba(46, 134, 171, 0.08)')).toBeCloseTo(4.97, 1);
    expect(await medir('[class*=faqTip]', 'rgb(50, 120, 116)', 'rgba(72, 169, 166, 0.08)')).toBeCloseTo(4.79, 1);

    // Con el botón de la propia página: sembrar data-theme a mano puede medir otro estado.
    await page.getByRole('button', { name: 'Cambiar a modo oscuro' }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    expect(await medir('[class*=zoomPresetActivo]', 'rgb(63, 165, 209)', 'rgba(46, 134, 171, 0.05)')).toBeCloseTo(4.68, 1);
    expect(await medir('[class*=escenarioTip]', 'rgb(63, 165, 209)', 'rgba(46, 134, 171, 0.05)')).toBeCloseTo(4.68, 1);
    expect(await medir('[class*=faqTip]', 'rgb(90, 189, 185)', 'rgba(72, 169, 166, 0.12)')).toBeCloseTo(5.13, 1);
  });

  // ⚠️ ABIERTO: hallazgo nuevo (Inspector 22/10/2026) — contenido. El dato de la FAQ visible
  // («¿La lupa digital tiene la misma calidad que una lupa física?») dice: «Debajo del control de
  // zoom verás cuánto hace la cámara y cuánto la pantalla; si no aparece esa línea, todo el zoom se
  // hace en pantalla». Con la imagen congelada la línea se oculta SIEMPRE (page.tsx la pinta solo con
  // `activo && !congelado && rangoZoomCamara`), también cuando la cámara hizo parte del zoom y la
  // imagen quieta lo trae dentro: con una cámara de 1-3× a 5x la imagen se toma con 3x de cámara y en
  // pantalla solo va 5 / 3 = 1,667, pero sin la línea la FAQ lleva a leer que los 5x son de pantalla
  // (y que la cámara no tiene zoom). Lo mismo con la cámara clavada por encima del zoom: congelada,
  // el borde negro se queda sin la frase que lo explica.
  // Caso: cámara {1..3, paso 0,1}, 5x, «Congelar» → esperado: o la línea sigue diciendo cuánto hizo la
  //       cámara, o la FAQ limita su lectura a la imagen en directo · obtenido: sin línea, la FAQ tal
  //       cual y el lienzo a scale(1,667).
  test('HALLAZGO NUEVO (contenido) — con la imagen congelada, la FAQ no debe dar a entender que todo el zoom es de pantalla cuando la cámara hizo 3 de los 5 aumentos', async ({
    page,
  }) => {
    test.fail(); // ABIERTO: hallazgo nuevo del 22/10/2026; el día que se repare, quitar esta línea
    await simularCamaraPorPista(page, { trasera: { min: 1, max: 3, step: 0.1 }, frontal: null });
    await page.goto(RUTA);
    await esperarHidratacion(page, ['#control-zoom']);
    await page.getByRole('button', { name: /Activar lupa/i }).click();
    await esperarCamaraEnMarcha(page);
    const nota = page.locator('[class*=zoomNota]');

    // 5x en directo: cámara min(5; 3) = 3, pantalla 5 / 3 = 1,667 (3 × 1,667 = 5,001), y la línea lo dice.
    await page.getByRole('button', { name: '5x', exact: true }).click();
    await expect.poll(() => aumentoPintado(page)).toMatchObject({ camara: 3, pantalla: 1.667, total: 5.001 });
    await expect(nota).toHaveText('La cámara hace 3x y el resto (1,7x) se amplía en pantalla.');

    // Congelada: la imagen trae los 3x de la cámara; en pantalla solo 1,667 (no los 5).
    await page.getByRole('button', { name: /Congelar/i }).click();
    await expect(page.locator('canvas')).toHaveAttribute('style', /scale\(1\.667\)/);

    // DEBERÍA: o la línea sigue a la vista, o la FAQ no afirma sin matiz que su ausencia significa
    // «todo en pantalla» (admite cualquier reparación: una línea para la imagen quieta, o limitar la
    // frase a la imagen en directo).
    const lineaVisible = await nota.isVisible();
    const dato = ((await page.locator('[class*=faqTip]').first().textContent()) ?? '').replace(/\s+/g, ' ');
    const faqSinMatiz =
      /si no aparece esa línea,? todo el zoom se hace en pantalla/i.test(dato) && !/congel|en directo|en vivo/i.test(dato);
    expect(lineaVisible || !faqSinMatiz, `línea visible: ${lineaVisible} · FAQ: «${dato}»`).toBe(true);
  });
});
