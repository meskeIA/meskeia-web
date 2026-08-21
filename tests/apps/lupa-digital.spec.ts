import { test, expect, devices, type Page } from '@playwright/test';

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
 * Los HALLAZGOS ABIERTOS van al final, marcados con `test.fail()`: afirman lo que la app
 * debería hacer y hoy fallan a propósito. El día que se reparen se pondrán en ROJO
 * («expected to fail, but passed») y habrá que quitarles la marca, quedando como regresión.
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
// HALLAZGOS ABIERTOS (Inspector, 20/08/2026)
// ═══════════════════════════════════════════════════════════════════════════

// ⚠️ HALLAZGO ABIERTO — accesibilidad. Los tres <input type="range"> de la app (zoom, brillo
// y contraste) no tienen id, ni aria-label, ni aria-labelledby, y el <label> que acompaña a
// brillo y contraste es un hermano suelto sin htmlFor (page.tsx: «<label>☀️ Brillo: {brillo}%
// </label>» seguido del input); el de zoom ni siquiera tiene <label>, solo un <h3>. El árbol
// de accesibilidad de Chromium devuelve name:"" para los tres, así que un lector de pantalla
// anuncia «control deslizante, 100» sin decir de cuál se trata — y hay dos idénticos seguidos.
// Pesa más de lo normal porque esta app se vende como herramienta de accesibilidad para baja
// visión («Filtros de accesibilidad», keywords «accesibilidad, baja visión»).
// Caso: cargar /lupa-digital/ y leer el nombre accesible del 2º deslizador
//       → esperado «Brillo: 100%» · obtenido "" (vacío).
test('REGRESIÓN (accesibilidad) — los tres deslizadores deben tener nombre accesible', async ({ page }) => {
  await page.goto(RUTA);
  await expect(page.getByRole('slider').nth(0)).toHaveAccessibleName(/Zoom/i);
  await expect(page.getByRole('slider').nth(1)).toHaveAccessibleName(/Brillo/i);
  await expect(page.getByRole('slider').nth(2)).toHaveAccessibleName(/Contraste/i);
});

// ⚠️ HALLAZGO ABIERTO — contenido/formato. El único zoom con decimal se pinta con punto en
// los tres sitios de la interfaz (el preajuste «1.5x», el título «Zoom: 1.5x» y el indicador
// del visor «1.5x»), porque salen de interpolar el number directamente. La propia tabla del
// bloque educativo de la app escribe «1,5x» con coma, así que la app se contradice a sí misma
// dentro de la misma página, y el formato español es obligatorio en el proyecto.
// Caso: pulsar el preajuste de 1,5x → esperado «Zoom: 1,5x» · obtenido «Zoom: 1.5x».
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

// ⚠️ HALLAZGO ABIERTO — operativa. Con la lupa apagada, el visor (un 4:3 que ocupa el ancho
// entero) muestra «Pulsa para activar la lupa», pero ese placeholder es un <div role="status">
// sin onClick, sin botón dentro y con cursor:auto: pulsar ahí —lo que invita a hacer el
// texto, y el blanco más grande de la pantalla en un móvil— no hace absolutamente nada. El
// botón que sí activa está debajo. La invariante admite las dos reparaciones posibles (hacer
// pulsable el visor o cambiar el texto por «Pulsa el botón…»), y por eso se comprueba así.
// Caso: pulsar sobre el texto «Pulsa para activar la lupa» → esperado que la lupa se active
//       (o que el visor no invite a pulsarlo) · obtenido: el placeholder sigue ahí y el
//       <video> sigue con display:none.
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
