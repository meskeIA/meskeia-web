import { test, expect, devices, type Page } from '@playwright/test';
import { esperarHidratacion } from './_hidratacion';

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
 *   - FAQ: «Se congela a la resolución de la cámara, no a la de la pantalla» y «pulsa
 *     "Detener", que apaga la cámara y reduce el consumo».
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
  await expect(page.locator('label', { hasText: /Brillo/ })).toHaveText('☀️ Brillo: 160%');
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

    // La promesa de la FAQ: «se congela a la resolución de la cámara, no a la de la pantalla».
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

    // ⚠️ HALLAZGO NUEVO — operativa (13/10/2026). El tope del recorrido de la imagen congelada
    // sale del ancho del visor (acotarDesplazamiento), pero solo se vuelve a aplicar al cambiar
    // el zoom o al congelar (useEffect [zoom, congelado]); girar el móvil cambia el ancho del
    // visor y nadie reacota. En horizontal (863 × 360) el visor mide 660 px y a 4x se puede
    // recorrer hasta 660 × 3 / 2 = 990 px; al volver a vertical el visor mide 392 y el tope es
    // 588, pero el translate se queda en −990: la imagen entera queda fuera del visor y se ve
    // NEGRO (medido: 89 % de píxeles negros, el resto son las insignias superpuestas). Se
    // arregla solo al tocar la imagen o cambiar el zoom, pero hasta entonces parece perdida.
    // Caso: congelar a 4x en horizontal, arrastrar al tope, girar a vertical → esperado que la
    //       imagen cubra el visor de lado a lado · obtenido: translate(−990px), visor en negro.
    test('HALLAZGO NUEVO (operativa) — al girar el móvil con la imagen congelada y recorrida, el visor se queda en negro', async ({
      page,
    }) => {
      test.fail(); // hallazgo abierto: el día que se repare, quitar esta línea
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

      // DEBERÍA: la imagen ampliada sigue cubriendo el visor de lado a lado (|x| ≤ 588).
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

  // ⚠️ HALLAZGO NUEVO — accesibilidad (13/10/2026). Los seis rótulos de «Usos comunes» llevan el
  // emoji pegado al texto sin <span aria-hidden="true"> (page.tsx: «<div …usoItem>📖 Leer letra
  // pequeña</div>» y los otros cinco), así que el lector de pantalla lee «libro abierto Leer letra
  // pequeña», «píldora Ver prospectos», «silla de ruedas Accesibilidad»… (CLAUDE.md §5, regla 3).
  // Caso: árbol AX de «Usos comunes» → esperado sin pictogramas · obtenido «📖 Leer letra pequeña
  //       💊 Ver prospectos 🏷️ Leer etiquetas 🔧 Trabajos de precisión 📱 Ver componentes ♿ Accesibilidad».
  test('HALLAZGO NUEVO (accesibilidad) — los emojis de «Usos comunes» no deben llegar al lector de pantalla', async ({
    page,
  }) => {
    test.fail(); // hallazgo abierto: el día que se repare, quitar esta línea
    await page.goto(RUTA);
    const usos = page.locator('[class*=usosGrid]');
    await expect(usos).toContainText('Leer letra pequeña'); // la sección está donde se busca
    // DEBERÍA: ni un pictograma en lo que expone el árbol de accesibilidad.
    expect(await usos.ariaSnapshot()).not.toMatch(/\p{Extended_Pictographic}/u);
  });

  // ⚠️ HALLAZGO NUEVO — accesibilidad (13/10/2026). Tres textos usan el color de marca LITERAL
  // en LupaDigital.module.css en vez de --primary-texto / --secondary-texto, y no llegan a 4,5:1
  // (WCAG 1.4.3; los tres son texto pequeño, 13-14 px): el preajuste de zoom ACTIVO
  // (.zoomPresetActivo, #2E86AB, 3,65:1 en claro y 3,01:1 en oscuro), los consejos de los
  // escenarios (.escenarioTip, #2E86AB, 3,74 / 2,94) y el dato de la FAQ (.faqTip, #48A9A6,
  // 2,60 / 4,09). Pesa más en una app que se vende para baja visión.
  // Caso: medir el contraste de los tres sobre su fondo compuesto, en los dos temas → esperado
  //       ≥ 4,5:1 · obtenido 3,65 / 3,74 / 2,60 en claro y 3,01 / 2,94 / 4,09 en oscuro.
  test('HALLAZGO NUEVO (accesibilidad) — el texto en color de marca debe llegar a 4,5:1 en los dos temas', async ({
    page,
  }) => {
    test.fail(); // hallazgo abierto: el día que se repare, quitar esta línea
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

  // ⚠️ HALLAZGO NUEVO — contenido (13/10/2026). La misma pregunta se responde dos veces con
  // textos distintos: la FAQ visible «¿Puedo dejar la imagen fija para leerla con calma?» y el
  // FAQPage de metadata.ts «¿Se puede dejar la imagen fija en vez de sostener el móvil?». No se
  // contradicen, pero cada una añade lo suyo (la visible, «haz una captura de pantalla»; la del
  // FAQPage, «a partir de 4× el temblor de la mano…»), y dos textos a mano acaban divergiendo.
  // Caso: comparar las dos respuestas → esperado una sola (UNA constante en metadata.ts que
  //       importen las dos bocas, como app/simulador-gastos-compraventa-garaje) · obtenido dos.
  test('HALLAZGO NUEVO (contenido) — la pregunta de la imagen fija debe tener UNA respuesta en la FAQ visible y en el FAQPage', async ({
    page,
  }) => {
    test.fail(); // hallazgo abierto: el día que se repare, quitar esta línea
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
