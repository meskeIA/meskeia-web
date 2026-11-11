import { test, expect, devices, type Locator, type Page } from '@playwright/test';
import { sembrarValor } from './_hidratacion';

/**
 * prueba-camara — Prueba de Cámara Web y Micrófono (primera inspección, 11/11/2026)
 *
 * La prueba del micrófono que vive en esta misma página tiene su spec aparte:
 * tests/apps/prueba-camara-microfono.spec.ts. Este mide la CÁMARA.
 *
 * QUÉ PROMETE (leído el 11/11/2026)
 *   · <h1> «Prueba de Cámara Web y Micrófono»: «Verifica tu webcam y tu micrófono antes de
 *     videollamadas, en el ordenador (computadora) o en el móvil (celular). Toma fotos […]».
 *   · featureList del JSON-LD: «Imagen de la webcam en directo con la resolución real
 *     detectada», «Ajuste de brillo, contraste y modo espejo», «Fotos de prueba con cuenta
 *     atrás, descargables», «Selector de cámara y de entrada de audio».
 *   · Guía, paso 3: «Usa los controles de brillo y contraste para ajustar si es necesario. Toma
 *     una foto de prueba para revisar el resultado.» FAQ visible: la resolución detectada sale
 *     junto al vídeo («1280 × 720px» con la etiqueta HD).
 *   · page.tsx pide `width: { ideal: 1920 }, height: { ideal: 1080 }`, pinta la resolución con
 *     `track.getSettings()` y la etiqueta con el ANCHO: ≥ 1920 «Full HD», 1280-1919 «HD».
 *
 * LOS CASOS, RESUELTOS ANTES DE ABRIR EL NAVEGADOR
 *
 *   CASO 1 (escritorio, cámara falsa de Chromium). Lo esperado no es una cifra fija sino una
 *     igualdad: el rótulo «📐 W × Hpx» tiene que decir lo mismo que `getSettings()` de la pista
 *     viva y que `videoWidth × videoHeight` del <video>, con la etiqueta que toca por el ancho.
 *     Medido el 11/11/2026: con esos `ideal`, el dispositivo falso entrega 1920 × 1080 y la app
 *     dice «📐 1920 × 1080px» y «Full HD». Y al pulsar «Detener», TODAS las pistas que se abrieron
 *     tienen que quedar en `readyState === 'ended'` (la cámara se libera): pasa.
 *
 *   CASO 2 (escritorio, la foto). Cámara sustituida por un canvas de 640 × 480 con la mitad
 *     izquierda en gris 50 y la derecha en gris 200. Con `ctx.filter` en sRGB (comprobado aparte
 *     en Chromium: brightness(150 %) da 50→75 y 200→255; contrast(150 %), (v−127,5)·1,5+127,5,
 *     da 50→11 y 200→236):
 *       espejo activado, 100/100   → foto volteada: izquierda 200, derecha 50   (PASA)
 *       espejo desactivado          → izquierda 50, derecha 200                  (sale 200 / 50)
 *       espejo activado, brillo 150 → izquierda 255, derecha 75                  (sale 200 / 50)
 *       espejo activado, contr. 150 → izquierda 236, derecha 11                  (sale 200 / 50)
 *
 *   CASO 3 (móvil, Pixel 7). El vídeo arranca, la página no desborda, los controles caben y
 *     responden al toque (PASA). Con un flujo VERTICAL, el de un móvil sujeto en vertical
 *     (480 × 640), la vista previa tiene que enseñar el fotograma entero; la caja es 16:9 con
 *     `object-fit: cover`, así que la fracción visible de la altura sale (9/16)/(640/480) =
 *     0,4219: se ve el 42 % central.
 *
 *   CASO 4 (rechazo). Con el `name` y el `message` literales de Chrome —medidos el 11/11/2026
 *     con `--use-fake-ui-for-media-stream=deny` («NotAllowedError | Permission denied») y con
 *     `device-count=0` («NotFoundError | Requested device not found»)—: el permiso denegado de
 *     Chrome avisa en español (PASA). La app decide el aviso buscando texto en `err.message`, no
 *     mirando `err.name`, así que todo lo demás sale como «Error al acceder a la cámara: <mensaje
 *     del navegador en inglés>»: sin cámara, cámara ocupada (NotReadableError «Could not start
 *     video source») y el permiso denegado de Safari y Firefox, cuyo mensaje no lleva
 *     «Permission denied».
 *
 * CABO C0508 (el botón del espejo se llamaba solo «✓ Activado»): NO se confirma. Desde
 * 443763725 (30/10/2026) el <label htmlFor="espejo"> apunta al botón, y Chromium lo nombra
 * «Espejo:» con aria-pressed. Queda como candado de regresión.
 *
 * INSPECCIÓN DE CAMBIO (11/11/2026, tras 532a9704f y 15c76e745). Esperados escritos antes de
 * ejecutar; los bloques «CAMBIO …» de abajo son esos casos.
 *
 *   VISTA PREVIA. Cámara falsa de Chromium (1920 × 1080). La caja mide 100 % de ancho y toma
 *     `aspect-ratio: 1920 / 1080` del flujo, con `max-height: 70vh` y `object-fit: contain`:
 *       escritorio 1280 × 720  → ancho 1200 − 2·24 − 2·24 = 1104; alto min(1104·1080/1920 = 621,
 *                                0,7·720 = 504) = 504: manda el alto máximo y el fotograma se
 *                                pinta entero (896 × 504) con bandas. Medido: 1104 × 504.  PASA
 *       escritorio 1920 × 1080 → 1104 × 621, proporción de la caja = la del flujo, 1,778.   PASA
 *       Pixel 7 (412 × 839)    → 412 − 2·16 − 2·24 = 332; 332·1080/1920 = 186,75 < 587.    PASA
 *   FOTO CON LOS AJUSTES DE AHORA (cámara de mitades 50 | 200; filtros como en el CASO 2):
 *       espejo off + brillo 150          → izquierda 75, derecha 255                     PASA
 *       espejo on + contraste 50         → (v − 127,5)·0,5 + 127,5: 50→88,75, 200→163,75;
 *                                          volteada: izquierda ≈ 164, derecha ≈ 89 (sale 163/88) PASA
 *       «Foto 3s» y brillo a 50 DURANTE la cuenta (espejo on) → 50→25, 200→100; volteada:
 *                                          izquierda 100, derecha 25                      PASA
 *       «Foto 3s» dos veces seguidas     → una sola foto                                  PASA
 *       «Foto 3s», «Detener» e «Iniciar» → ninguna foto ni cuenta en pantalla             PASA
 *   CAMBIO DE CÁMARA (medido en un script con `device-count=2`, no cabe en este fichero sin
 *     otro worker): 1 apertura sin deviceId; elegir la otra → 2.ª con `exact`, 1 sola viva y con
 *     ese deviceId; volver → 3.ª; «Detener» → 0 vivas. PASA.
 *   PERMISO DENEGADO DE VERDAD (script con `--use-fake-ui-for-media-stream=deny`, sin sustituir
 *     getUserMedia): «NotAllowedError | Permission denied», el aviso en español en el role="alert"
 *     de la caja y «Iniciar Cámara» visible. PASA. Aquí se reproduce con ese name y message.
 *   DOBLE CLIC en «Iniciar Cámara» a ritmo humano (150 ms) con una cámara que tarda 400 ms en
 *     abrir (una webcam real tarda cientos de ms): esperado 1 pista viva y 0 tras «Detener».
 *     Sale 2 getUserMedia, 2 vivas y 1 VIVA tras «Detener», en escritorio y con doble toque en el
 *     Pixel 7 (4 de 4 rondas): la luz de la cámara sigue encendida. HALLAZGO ABIERTO.
 */

test.use({
  permissions: ['camera', 'microphone'],
  launchOptions: {
    // Sin estos dos argumentos Chromium no tiene cámara (NotFoundError) ni deja pasar el permiso
    args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'],
  },
});

test.beforeEach(() => {
  // Montar la cámara y compilar la ruta en frío se come los 30 s por defecto
  test.slow();
});

/** Lo que las sustituciones de getUserMedia dejan colgado de window para poder contarlo. */
interface Ventana {
  __aperturas: MediaStream[];
  __llamadas?: number;
}

const CONTENEDOR = '[class*="_videoContainer"]';
const AVISO = '[class*="_errorOverlay"]';
const PANEL = '[class*="_settingsPanel"]';
const RESOLUCION = '[class*="_resolutionInfo"]';
const FOTOS = '[class*="_photoCard"] img';
const CUENTA_ATRAS = '[class*="_countdownOverlay"]';

const iniciar = (page: Page): Locator => page.getByRole('button', { name: /Iniciar Cámara/ });
const detener = (page: Page): Locator => page.getByRole('button', { name: 'Detener', exact: true });
const foto = (page: Page): Locator => page.getByRole('button', { name: 'Foto', exact: true });
const engranaje = (page: Page): Locator => page.locator('button[class*="_btnIcon"]');

/** Espera a que React haya colgado su onClick del botón: un clic anterior se pierde. */
async function esperarBotonVivo(page: Page, boton: Locator): Promise<void> {
  const nodo = await boton.elementHandle({ timeout: 15000 });
  if (!nodo) throw new Error('El botón no llegó a existir en el DOM.');
  await page.waitForFunction(
    (el) => {
      const bruto = el as unknown as Record<string, unknown>;
      const clave = Object.keys(bruto).find((k) => k.startsWith('__reactProps$'));
      const props = clave ? (bruto[clave] as Record<string, unknown> | null) : null;
      return Boolean(props && typeof props.onClick === 'function');
    },
    nodo,
    { timeout: 15000 },
  );
}

/** Deja la cámara falsa de Chromium como está, pero apunta cada flujo que se abre. */
async function registrarAperturas(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const w = window as unknown as Ventana;
    w.__aperturas = [];
    const original = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
    navigator.mediaDevices.getUserMedia = async (c?: MediaStreamConstraints): Promise<MediaStream> => {
      const flujo = await original(c);
      w.__aperturas.push(flujo);
      return flujo;
    };
  });
}

/**
 * Como registrarAperturas, pero la cámara falsa tarda `ms` en abrir, como una webcam real
 * (cientos de ms): es la ventana en la que cabe el segundo clic de un doble clic.
 */
async function registrarAperturasLentas(page: Page, ms: number): Promise<void> {
  await page.addInitScript((retraso: number) => {
    const w = window as unknown as Ventana;
    w.__aperturas = [];
    w.__llamadas = 0;
    const original = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
    navigator.mediaDevices.getUserMedia = async (c?: MediaStreamConstraints): Promise<MediaStream> => {
      w.__llamadas = (w.__llamadas ?? 0) + 1;
      await new Promise((r) => window.setTimeout(r, retraso));
      const flujo = await original(c);
      w.__aperturas.push(flujo);
      return flujo;
    };
  }, ms);
}

/** Pistas que siguen vivas entre todas las que se abrieron. */
async function pistasVivas(page: Page): Promise<number> {
  return page.evaluate(
    () => (window as unknown as Ventana).__aperturas.flatMap((f) => f.getTracks()).filter((p) => p.readyState === 'live').length,
  );
}

/** Dos clics (o dos toques) en «Iniciar Cámara» separados 150 ms: un doble clic humano. */
async function dobleClicHumano(page: Page, tocar: boolean): Promise<void> {
  const boton = iniciar(page);
  await boton.scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  const caja = await boton.boundingBox();
  if (!caja) throw new Error('«Iniciar Cámara» no tiene caja en pantalla.');
  const x = caja.x + caja.width / 2;
  const y = caja.y + caja.height / 2;
  if (tocar) await page.touchscreen.tap(x, y);
  else await page.mouse.click(x, y);
  await page.waitForTimeout(150);
  if (tocar) await page.touchscreen.tap(x, y);
  else await page.mouse.click(x, y);
}

interface VistaPrevia {
  readyState: number;
  videoW: number;
  videoH: number;
  objectFit: string;
  aspectRatio: string;
  cajaW: number;
  cajaH: number;
  alto70vh: number;
}

/** La caja de la vista previa frente al flujo que pinta. */
async function medirVistaPrevia(page: Page): Promise<VistaPrevia> {
  return page.evaluate((sel) => {
    const v = document.querySelector('video') as HTMLVideoElement;
    const contenedor = document.querySelector(sel) as HTMLElement;
    const caja = contenedor.getBoundingClientRect();
    return {
      readyState: v.readyState,
      videoW: v.videoWidth,
      videoH: v.videoHeight,
      objectFit: getComputedStyle(v).objectFit,
      aspectRatio: contenedor.style.aspectRatio,
      cajaW: caja.width,
      cajaH: caja.height,
      alto70vh: window.innerHeight * 0.7,
    };
  }, CONTENEDOR);
}

/**
 * Lo que tiene que cumplir la vista previa tras 532a9704f: contain (el fotograma entero), la caja
 * con la proporción del flujo y, si esa proporción pide más alto que 70vh, el alto máximo.
 */
function comprobarVistaPrevia(m: VistaPrevia): void {
  expect(m.readyState).toBeGreaterThanOrEqual(2);
  expect(m.videoW).toBeGreaterThan(0);
  expect(m.objectFit).toBe('contain');
  expect(m.aspectRatio).toBe(`${m.videoW} / ${m.videoH}`);
  const altoEsperado = Math.min((m.cajaW * m.videoH) / m.videoW, m.alto70vh);
  expect(Math.abs(m.cajaH - altoEsperado), `caja ${m.cajaW} × ${m.cajaH}, alto esperado ${altoEsperado}`).toBeLessThanOrEqual(1);
}

/**
 * Sustituye la cámara por un canvas de ancho × alto con la mitad izquierda en gris 50 y la
 * derecha en gris 200: con eso se sabe si una foto está volteada y cuánto la aclaró un filtro.
 */
async function camaraDeMitades(page: Page, ancho: number, alto: number): Promise<void> {
  await page.addInitScript(
    ({ a, h }: { a: number; h: number }) => {
      const w = window as unknown as Ventana;
      w.__aperturas = [];
      navigator.mediaDevices.getUserMedia = async (): Promise<MediaStream> => {
        const lienzo = document.createElement('canvas');
        lienzo.width = a;
        lienzo.height = h;
        const ctx = lienzo.getContext('2d') as CanvasRenderingContext2D;
        const pintar = (): void => {
          ctx.fillStyle = 'rgb(50,50,50)';
          ctx.fillRect(0, 0, a / 2, h);
          ctx.fillStyle = 'rgb(200,200,200)';
          ctx.fillRect(a / 2, 0, a / 2, h);
        };
        pintar();
        // captureStream solo emite cuando se dibuja: repintar mantiene vivo el flujo
        window.setInterval(pintar, 50);
        const flujo = lienzo.captureStream(30);
        w.__aperturas.push(flujo);
        return flujo;
      };
    },
    { a: ancho, h: alto },
  );
}

/** Sustituye la cámara por un rechazo con el `name` y el `message` literales de un navegador. */
async function camaraQueFalla(page: Page, nombre: string, mensaje: string): Promise<void> {
  await page.addInitScript(
    ({ n, m }: { n: string; m: string }) => {
      navigator.mediaDevices.getUserMedia = (): Promise<MediaStream> => Promise.reject(new DOMException(m, n));
    },
    { n: nombre, m: mensaje },
  );
}

async function abrir(page: Page): Promise<void> {
  await page.goto('/prueba-camara/');
  await esperarBotonVivo(page, iniciar(page));
}

/** Abre la app, pulsa «Iniciar Cámara» y espera a que el vídeo tenga fotograma DE VERDAD. */
async function arrancar(page: Page, tocar = false): Promise<void> {
  await abrir(page);
  if (tocar) await iniciar(page).tap();
  else await iniciar(page).click();
  await expect(detener(page)).toBeVisible();
  await expect
    .poll(
      () =>
        page.locator('video').evaluate((el) => {
          const v = el as HTMLVideoElement;
          return v.readyState >= 2 && v.videoWidth > 0;
        }),
      { timeout: 15000 },
    )
    .toBe(true);
  // Hasta 532a9704f la app reabría la cámara al poco de arrancar (hallazgo 4430, reparado); la
  // espera se queda para medir con la vista ya asentada
  await page.waitForTimeout(1200);
}

/** Medias del canal verde en la franja central de cada mitad de la foto más reciente. */
async function analizarUltimaFoto(
  page: Page,
): Promise<{ ancho: number; alto: number; izquierda: number; derecha: number }> {
  return page.locator(FOTOS).first().evaluate(async (el) => {
    const img = el as HTMLImageElement;
    await img.decode().catch(() => undefined);
    const ancho = img.naturalWidth;
    const alto = img.naturalHeight;
    if (!ancho || !alto) return { ancho, alto, izquierda: -1, derecha: -1 };
    const lienzo = document.createElement('canvas');
    lienzo.width = ancho;
    lienzo.height = alto;
    const ctx = lienzo.getContext('2d') as CanvasRenderingContext2D;
    ctx.drawImage(img, 0, 0);
    const media = (x0: number, x1: number): number => {
      const d = ctx.getImageData(Math.floor(x0 * ancho), Math.floor(alto * 0.3), Math.floor((x1 - x0) * ancho), Math.floor(alto * 0.4)).data;
      let suma = 0;
      for (let i = 0; i < d.length; i += 4) suma += d[i + 1];
      return Math.round(suma / (d.length / 4));
    };
    return { ancho, alto, izquierda: media(0.05, 0.45), derecha: media(0.55, 0.95) };
  });
}

async function hacerFoto(page: Page, tocar = false): Promise<void> {
  const antes = await page.locator(FOTOS).count();
  if (tocar) await foto(page).tap();
  else await foto(page).click();
  await expect(page.locator(FOTOS)).toHaveCount(antes + 1);
}

async function abrirAjustes(page: Page, tocar = false): Promise<void> {
  if (tocar) await engranaje(page).tap();
  else await engranaje(page).click();
  await expect(page.locator(PANEL)).toBeVisible();
}

/** Respuestas del FAQPage del JSON-LD servido, por pregunta. */
async function faqJsonLd(page: Page): Promise<Record<string, string>> {
  const bloques = await page.locator('script[type="application/ld+json"]').allTextContents();
  for (const bloque of bloques) {
    const datos = JSON.parse(bloque) as {
      '@type'?: string;
      mainEntity?: { name: string; acceptedAnswer: { text: string } }[];
    };
    if (datos['@type'] === 'FAQPage' && datos.mainEntity) {
      return Object.fromEntries(datos.mainEntity.map((q) => [q.name, q.acceptedAnswer.text]));
    }
  }
  throw new Error('No hay FAQPage en el JSON-LD.');
}

/** Fracción de la altura del fotograma que se ve en la caja de la vista previa. */
async function fraccionVisibleDeLaAltura(page: Page): Promise<number> {
  return page.evaluate((sel) => {
    const v = document.querySelector('video') as HTMLVideoElement;
    const caja = (document.querySelector(sel) as HTMLElement).getBoundingClientRect();
    const ajuste = getComputedStyle(v).objectFit;
    if (ajuste !== 'cover') return 1;
    const escala = Math.max(caja.width / v.videoWidth, caja.height / v.videoHeight);
    return Math.min(1, caja.height / (v.videoHeight * escala));
  }, CONTENEDOR);
}

test.describe('Escritorio · el medio arranca de verdad y se libera', () => {
  test('CASO 1 · al cargar no se pide la cámara; con un clic el vídeo está vivo y el rótulo dice lo mismo que el MediaStreamTrack', async ({
    page,
  }) => {
    await registrarAperturas(page);
    await abrir(page);
    // El permiso se pide al pulsar «Iniciar Cámara», no al entrar (guía, paso 1)
    expect(await page.evaluate(() => (window as unknown as Ventana).__aperturas.length)).toBe(0);

    await iniciar(page).click();
    await expect(detener(page)).toBeVisible();
    await expect
      .poll(
        () =>
          page.locator('video').evaluate((el) => {
            const v = el as HTMLVideoElement;
            return v.readyState >= 2 && v.videoWidth > 0;
          }),
        { timeout: 15000 },
      )
      .toBe(true);
    await page.waitForTimeout(1200);

    const medido = await page.evaluate(() => {
      const v = document.querySelector('video') as HTMLVideoElement;
      const pista = (v.srcObject as MediaStream).getVideoTracks()[0];
      const ajustes = pista.getSettings();
      return { estado: pista.readyState, ancho: ajustes.width ?? 0, alto: ajustes.height ?? 0, videoW: v.videoWidth, videoH: v.videoHeight };
    });
    expect(medido.estado).toBe('live');
    expect(medido.ancho).toBeGreaterThan(0);
    // El <video> pinta lo mismo que dice la pista
    expect([medido.videoW, medido.videoH]).toEqual([medido.ancho, medido.alto]);

    // Lo que tiene que decir el rótulo, calculado con la regla de page.tsx
    const etiqueta = medido.ancho >= 1920 ? 'Full HD' : medido.ancho >= 1280 ? 'HD' : '';
    const rotulo = ((await page.locator(RESOLUCION).textContent()) ?? '').replace(/\s+/g, ' ').trim();
    expect(rotulo).toBe(`📐 ${medido.ancho} × ${medido.alto}px${etiqueta}`);
  });

  test('CASO 1 · «Detener» deja TODAS las pistas abiertas en ended y la vista vacía', async ({ page }) => {
    await registrarAperturas(page);
    await arrancar(page);
    await detener(page).click();
    await expect(iniciar(page)).toBeVisible();
    const tras = await page.evaluate(() => {
      const v = document.querySelector('video') as HTMLVideoElement;
      const pistas = (window as unknown as Ventana).__aperturas.flatMap((f) => f.getTracks());
      return { srcObject: v.srcObject === null, abiertas: pistas.length, vivas: pistas.filter((p) => p.readyState !== 'ended').length };
    });
    expect(tras.abiertas).toBeGreaterThan(0);
    expect(tras.vivas).toBe(0);
    expect(tras.srcObject).toBe(true);
    await expect(page.locator(RESOLUCION)).toHaveCount(0);
  });

  test('HALLAZGO 4430 (11/11/2026, REPARADO) · un solo clic en «Iniciar Cámara» abre la cámara una vez (1 getUserMedia)', async ({
    page,
  }) => {
    // REPARADO: la cámara elegida sale de la pista abierta (getSettings().deviceId) y el efecto no
    // reabre la que ya está abierta. Antes: tras el primer getUserMedia, getCameras() fija selectedCamera con el deviceId de la
    // PRIMERA cámara enumerada y el useEffect([selectedCamera]) llama otra vez a startCamera(), que
    // para la pista recién abierta y pide `deviceId: { exact }`. Medido: 2 aperturas, la primera
    // en ended. La luz de la cámara parpadea y, donde la predeterminada no sea la primera de la
    // lista, cambia de cámara sin que nadie lo pida (esto último no se ha podido reproducir).
    await registrarAperturas(page);
    await arrancar(page);
    await page.waitForTimeout(1500);
    expect(await page.evaluate(() => (window as unknown as Ventana).__aperturas.length)).toBe(1);
  });

  test('CAMBIO 532a9704f · a 1280 × 720 la vista previa no recorta: contain, proporción del flujo y el alto máximo de 70vh (1104 × 504)', async ({
    page,
  }) => {
    // Esperado en la cabecera (VISTA PREVIA): 1104·1080/1920 = 621 > 0,7·720 = 504, así que manda
    // el alto máximo y el fotograma 1920 × 1080 se pinta entero (896 × 504) con bandas.
    await registrarAperturas(page);
    await arrancar(page);
    const m = await medirVistaPrevia(page);
    comprobarVistaPrevia(m);
    expect([m.videoW, m.videoH]).toEqual([1920, 1080]);
    expect(Math.round(m.cajaH)).toBe(504);
  });

  test('HALLAZGO (11/11/2026, ABIERTO) · un doble clic en «Iniciar Cámara» con una cámara que tarda 400 ms deja una pista VIVA tras «Detener» (esperado 0)', async ({
    page,
  }) => {
    // ABIERTO: startCamera es async y el botón sigue siendo «Iniciar Cámara» hasta que
    // getUserMedia resuelve; las dos llamadas ven streamRef.current === null, la segunda pisa a la
    // primera en streamRef y nadie para la primera. Medido: 2 getUserMedia, 2 pistas vivas y 1 viva
    // tras «Detener» (4 de 4 rondas): la luz de la cámara sigue encendida y, donde el sistema da la
    // cámara a una sola app, Zoom o Teams la encuentran ocupada hasta cerrar la pestaña.
    test.fail();
    await registrarAperturasLentas(page, 400);
    await abrir(page);
    await dobleClicHumano(page, false);
    await expect(detener(page)).toBeVisible();
    await page.waitForTimeout(1500);
    await detener(page).click();
    await expect(iniciar(page)).toBeVisible();
    await page.waitForTimeout(800);
    expect(await pistasVivas(page)).toBe(0);
  });
});

test.describe('Escritorio 1920 × 1080 · la caja toma la proporción del flujo', () => {
  test.use({ viewport: { width: 1920, height: 1080 } });

  test('CAMBIO 532a9704f · sin alto máximo que mande, la caja es 1104 × 621, la proporción 1920 / 1080 del flujo', async ({ page }) => {
    await registrarAperturas(page);
    await arrancar(page);
    const m = await medirVistaPrevia(page);
    comprobarVistaPrevia(m);
    expect(m.cajaH).toBeLessThan(m.alto70vh);
    expect(m.cajaW / m.cajaH).toBeCloseTo(m.videoW / m.videoH, 2);
  });
});

test.describe('Escritorio · la foto de prueba', () => {
  test('CASO 2 · con los ajustes de inicio (espejo activado) la foto sale volteada como la vista previa', async ({ page }) => {
    await camaraDeMitades(page, 640, 480);
    await arrancar(page);
    await expect(page.locator(RESOLUCION)).toContainText('640 × 480px');
    await hacerFoto(page);
    const f = await analizarUltimaFoto(page);
    expect([f.ancho, f.alto]).toEqual([640, 480]);
    // Volteada: la mitad clara (200) queda a la izquierda
    expect(Math.abs(f.izquierda - 200)).toBeLessThanOrEqual(12);
    expect(Math.abs(f.derecha - 50)).toBeLessThanOrEqual(12);
  });

  test('HALLAZGO 4428 (11/11/2026, REPARADO) · con el espejo desactivado la foto sale sin voltear (izquierda 50, derecha 200)', async ({
    page,
  }) => {
    // REPARADO: takePhoto era useCallback(…, []) y llamaba al capturePhoto del PRIMER render, que se
    // quedó con isMirrored = true, brillo 100 y contraste 100. Ahora lee la captura más reciente.
    await camaraDeMitades(page, 640, 480);
    await arrancar(page);
    await abrirAjustes(page);
    await page.getByRole('button', { name: /^Espejo/ }).click();
    await expect(page.getByRole('button', { name: /^Espejo/ })).toHaveAttribute('aria-pressed', 'false');
    await hacerFoto(page);
    const f = await analizarUltimaFoto(page);
    expect(Math.abs(f.izquierda - 50), `izquierda ${f.izquierda}`).toBeLessThanOrEqual(12);
    expect(Math.abs(f.derecha - 200), `derecha ${f.derecha}`).toBeLessThanOrEqual(12);
  });

  test('HALLAZGO 4428 (11/11/2026, REPARADO) · el brillo y el contraste al 150 % llegan a la foto (255/75 y 236/11)', async ({
    page,
  }) => {
    // REPARADO: era el mismo cierre viejo de takePhoto. Daba 200/50 con brillo 150 y con contraste
    // 150, mientras la vista previa sí cambiaba (style.filter).
    await camaraDeMitades(page, 640, 480);
    await arrancar(page);
    await abrirAjustes(page);
    await sembrarValor(page, '#brillo', 150);
    await hacerFoto(page);
    const conBrillo = await analizarUltimaFoto(page);
    expect.soft(Math.abs(conBrillo.izquierda - 255), `brillo 150, izquierda ${conBrillo.izquierda}`).toBeLessThanOrEqual(12);
    expect.soft(Math.abs(conBrillo.derecha - 75), `brillo 150, derecha ${conBrillo.derecha}`).toBeLessThanOrEqual(12);

    await page.getByRole('button', { name: /Restablecer/ }).click();
    await sembrarValor(page, '#contraste', 150);
    await hacerFoto(page);
    const conContraste = await analizarUltimaFoto(page);
    expect.soft(Math.abs(conContraste.izquierda - 236), `contraste 150, izquierda ${conContraste.izquierda}`).toBeLessThanOrEqual(12);
    expect.soft(Math.abs(conContraste.derecha - 11), `contraste 150, derecha ${conContraste.derecha}`).toBeLessThanOrEqual(12);
  });

  test('HALLAZGO 4431 (11/11/2026, REPARADO) · «Foto 3s» y «Detener» antes de que acabe la cuenta no dejan foto vacía', async ({
    page,
  }) => {
    // REPARADO: al llegar a cero capturePhoto() dibujaba un <video> sin flujo (videoWidth 0): el
    // canvas de 0 × 0 daba «data:,». Ahora Detener cancela la cuenta y sin flujo no se captura.
    await camaraDeMitades(page, 640, 480);
    await arrancar(page);
    await page.getByRole('button', { name: /Foto 3s/ }).click();
    await page.waitForTimeout(500);
    await detener(page).click();
    await expect(page.locator(CUENTA_ATRAS)).toHaveCount(0, { timeout: 8000 });
    await page.waitForTimeout(500);
    const vacias = await page.locator(FOTOS).evaluateAll((imgs) =>
      imgs.filter((i) => (i as HTMLImageElement).naturalWidth === 0).length,
    );
    expect(vacias).toBe(0);
    await expect(page.locator(FOTOS)).toHaveCount(0);
  });

  test('CAMBIO 532a9704f · la foto lee los ajustes de AHORA: espejo desactivado + brillo 150 → 75/255', async ({ page }) => {
    // Sin voltear: 50·1,5 = 75 a la izquierda; 200·1,5 = 300, recortado a 255, a la derecha
    await camaraDeMitades(page, 640, 480);
    await arrancar(page);
    await abrirAjustes(page);
    await page.getByRole('button', { name: /^Espejo/ }).click();
    await expect(page.getByRole('button', { name: /^Espejo/ })).toHaveAttribute('aria-pressed', 'false');
    await sembrarValor(page, '#brillo', 150);
    await expect(page.locator('label[for="brillo"]')).toHaveText('Brillo: 150 %');
    await hacerFoto(page);
    const f = await analizarUltimaFoto(page);
    expect(Math.abs(f.izquierda - 75), `izquierda ${f.izquierda}`).toBeLessThanOrEqual(3);
    expect(Math.abs(f.derecha - 255), `derecha ${f.derecha}`).toBeLessThanOrEqual(3);
  });

  test('CAMBIO 532a9704f · la foto lee los ajustes de AHORA: espejo activado + contraste 50 → 164/89 volteada', async ({ page }) => {
    // (v − 127,5)·0,5 + 127,5: 50 → 88,75 y 200 → 163,75; volteada, la clara a la izquierda.
    // Medido 163/88 (Chromium trunca): tolerancia 3
    await camaraDeMitades(page, 640, 480);
    await arrancar(page);
    await abrirAjustes(page);
    await sembrarValor(page, '#contraste', 50);
    await expect(page.locator('label[for="contraste"]')).toHaveText('Contraste: 50 %');
    await hacerFoto(page);
    const f = await analizarUltimaFoto(page);
    expect(Math.abs(f.izquierda - 164), `izquierda ${f.izquierda}`).toBeLessThanOrEqual(3);
    expect(Math.abs(f.derecha - 89), `derecha ${f.derecha}`).toBeLessThanOrEqual(3);
  });

  test('CAMBIO 532a9704f · «Foto 3s» captura con el brillo que hay al llegar a cero (puesto a 50 durante la cuenta → 100/25)', async ({
    page,
  }) => {
    // La cuenta atrás lee capturaRef al terminar: brillo 50 → 50·0,5 = 25 y 200·0,5 = 100;
    // con el espejo de inicio, volteada: 100 a la izquierda y 25 a la derecha
    await camaraDeMitades(page, 640, 480);
    await arrancar(page);
    await abrirAjustes(page);
    await page.getByRole('button', { name: /Foto 3s/ }).click();
    await expect(page.locator(CUENTA_ATRAS)).toBeVisible();
    await sembrarValor(page, '#brillo', 50);
    await expect(page.locator(FOTOS)).toHaveCount(1, { timeout: 8000 });
    const f = await analizarUltimaFoto(page);
    expect(Math.abs(f.izquierda - 100), `izquierda ${f.izquierda}`).toBeLessThanOrEqual(3);
    expect(Math.abs(f.derecha - 25), `derecha ${f.derecha}`).toBeLessThanOrEqual(3);
  });

  test('CAMBIO 532a9704f · «Foto 3s» pulsado dos veces seguidas deja UNA foto (la segunda reinicia la cuenta)', async ({ page }) => {
    await camaraDeMitades(page, 640, 480);
    await arrancar(page);
    const conCuenta = page.getByRole('button', { name: /Foto 3s/ });
    await conCuenta.click();
    await page.waitForTimeout(300);
    await conCuenta.click();
    await expect(page.locator(FOTOS)).toHaveCount(1, { timeout: 8000 });
    await page.waitForTimeout(1500);
    await expect(page.locator(FOTOS)).toHaveCount(1);
  });

  test('CAMBIO 532a9704f · «Foto 3s», «Detener» e «Iniciar» antes de que acabe la cuenta: ninguna foto ni cuenta en pantalla', async ({
    page,
  }) => {
    await camaraDeMitades(page, 640, 480);
    await arrancar(page);
    await page.getByRole('button', { name: /Foto 3s/ }).click();
    await page.waitForTimeout(500);
    await detener(page).click();
    await page.waitForTimeout(500);
    await iniciar(page).click();
    await expect(detener(page)).toBeVisible();
    await page.waitForTimeout(4000);
    await expect(page.locator(FOTOS)).toHaveCount(0);
    await expect(page.locator(CUENTA_ATRAS)).toHaveCount(0);
  });
});

test.describe('Escritorio · rechazos', () => {
  test('CASO 4 · permiso denegado en Chrome (NotAllowedError «Permission denied») avisa en español y deja reintentar', async ({
    page,
  }) => {
    await camaraQueFalla(page, 'NotAllowedError', 'Permission denied');
    await abrir(page);
    await iniciar(page).click();
    await expect(page.locator(AVISO)).toContainText('Permiso denegado. Permite el acceso a la cámara en tu navegador.');
    await expect(iniciar(page)).toBeVisible();
    await expect(detener(page)).toHaveCount(0);
  });

  test('HALLAZGO 4429 (11/11/2026, REPARADO) · sin cámara (NotFoundError «Requested device not found») avisa en español', async ({
    page,
  }) => {
    // REPARADO: page.tsx buscaba 'NotFoundError' en err.message, y ningún navegador pone el nombre
    // en el mensaje. Daba «Error al acceder a la cámara: Requested device not found». Ahora, err.name.
    await camaraQueFalla(page, 'NotFoundError', 'Requested device not found');
    await abrir(page);
    await iniciar(page).click();
    await expect(page.locator(AVISO)).toContainText('No se encontró ninguna cámara');
  });

  test('HALLAZGO 4429 (11/11/2026, REPARADO) · cámara ocupada por otra app (NotReadableError) avisa en español y dice qué cerrar', async ({
    page,
  }) => {
    // REPARADO: la causa que la propia página da por la más habitual (Zoom o Teams abiertos) caía en
    // la rama genérica: «Error al acceder a la cámara: Could not start video source».
    await camaraQueFalla(page, 'NotReadableError', 'Could not start video source');
    await abrir(page);
    await iniciar(page).click();
    await expect(page.locator(AVISO)).toBeVisible();
    await expect(page.locator(AVISO)).not.toContainText('Could not start video source');
    await expect(page.locator(AVISO)).toContainText('Zoom');
  });

  test('HALLAZGO 4429 (11/11/2026, REPARADO) · permiso denegado en Safari (NotAllowedError con su mensaje) dice «Permiso denegado»', async ({
    page,
  }) => {
    // REPARADO: solo el mensaje de Chrome lleva «Permission denied». Daba «Error al acceder a la
    // cámara: The request is not allowed by the user agent or the platform in the current
    // context, possibly because the user denied permission.»
    await camaraQueFalla(
      page,
      'NotAllowedError',
      'The request is not allowed by the user agent or the platform in the current context, possibly because the user denied permission.',
    );
    await abrir(page);
    await iniciar(page).click();
    await expect(page.locator(AVISO)).toContainText('Permiso denegado');
  });

  test('HALLAZGO 4432 (11/11/2026, REPARADO) · el aviso de error de la cámara se anuncia (role="alert")', async ({
    page,
  }) => {
    // REPARADO: el panel del micrófono sí lo hacía (<p role="alert">); el de la cámara pintaba el
    // aviso en un <div> sin role ni aria-live dentro de la caja del vídeo.
    await camaraQueFalla(page, 'NotAllowedError', 'Permission denied');
    await abrir(page);
    await iniciar(page).click();
    await expect(page.locator(AVISO)).toBeVisible();
    const anunciado = await page.locator(AVISO).evaluate((el) => {
      for (let n: HTMLElement | null = el as HTMLElement; n; n = n.parentElement) {
        if (n.getAttribute('role') === 'alert' || n.hasAttribute('aria-live')) return true;
      }
      return false;
    });
    expect(anunciado).toBe(true);
  });

  test('CAMBIO 532a9704f · el permiso denegado sale en el role="alert" de la app, no en el anunciador de rutas de Next', async ({ page }) => {
    // name y message medidos hoy con el permiso denegado DE VERDAD (--use-fake-ui-for-media-stream=deny):
    // «NotAllowedError | Permission denied». getByRole('alert') casa también con el anunciador de
    // rutas de Next: se acota por el texto y por la caja del vídeo.
    await camaraQueFalla(page, 'NotAllowedError', 'Permission denied');
    await abrir(page);
    await iniciar(page).click();
    const aviso = page.getByRole('alert').filter({ hasText: 'Permiso denegado' });
    await expect(aviso).toHaveCount(1);
    await expect(aviso).toContainText('Permiso denegado. Permite el acceso a la cámara en tu navegador.');
    await expect(page.locator(`${CONTENEDOR} [role="alert"]`)).toHaveCount(1);
    await expect(iniciar(page)).toBeVisible();
  });

  test('HALLAZGO (11/11/2026, ABIERTO) · el role="alert" del aviso anuncia también el ❌ decorativo (esperado solo el texto)', async ({ page }) => {
    // ABIERTO: 532a9704f puso role="alert" en el <div> que contiene <span className={errorIcon}>❌</span>
    // sin aria-hidden (CLAUDE.md global §5: emoji junto a texto → aria-hidden). Medido con
    // ariaSnapshot: «- alert: - text: ❌ - paragraph: Permiso denegado. …»: el lector lo lee antes del aviso.
    test.fail();
    await camaraQueFalla(page, 'NotAllowedError', 'Permission denied');
    await abrir(page);
    await iniciar(page).click();
    const aviso = page.locator(`${CONTENEDOR} [role="alert"]`);
    await expect(aviso).toBeVisible();
    expect(await aviso.ariaSnapshot()).not.toContain('❌');
  });

  test('HALLAZGO (11/11/2026, ABIERTO) · la guía dice que con Zoom o Teams abiertos «recibirás un error de acceso denegado», y la app dice «ocupada»', async ({
    page,
  }) => {
    // ABIERTO: desde 532a9704f la cámara ocupada (NotReadableError) avisa «La cámara está ocupada o
    // bloqueada por el sistema. Cierra Zoom, Teams…», y «Permiso denegado» queda para el permiso. La
    // advertencia «4 errores habituales» sigue atando Zoom/Teams a «acceso denegado»: quien vea
    // «Permiso denegado» cerrará Zoom en vez de dar el permiso.
    test.fail();
    await camaraQueFalla(page, 'NotReadableError', 'Could not start video source');
    await abrir(page);
    await iniciar(page).click();
    await expect(page.locator(AVISO)).toContainText('La cámara está ocupada o bloqueada por el sistema');
    const advertencia = (await page.locator('li', { hasText: 'Tener otra app usando la cámara' }).textContent()) ?? '';
    expect(advertencia.length).toBeGreaterThan(0);
    expect(advertencia).not.toContain('error de acceso denegado');
  });
});

test.describe('Escritorio · ajustes y textos', () => {
  test('CABO C0508 · el conmutador del espejo se llama «Espejo:», expone su estado y voltea la vista previa', async ({ page }) => {
    await registrarAperturas(page);
    await arrancar(page);
    await abrirAjustes(page);
    const espejo = page.getByRole('button', { name: /^Espejo/ });
    await expect(espejo).toHaveCount(1);
    await expect(espejo).toHaveAttribute('aria-pressed', 'true');
    expect(await page.locator('video').evaluate((v) => getComputedStyle(v).transform)).toBe('matrix(-1, 0, 0, 1, 0, 0)');
    await espejo.click();
    await expect(espejo).toHaveAttribute('aria-pressed', 'false');
    expect(await page.locator('video').evaluate((v) => getComputedStyle(v).transform)).toBe('none');
  });

  test('HALLAZGO 4433 (11/11/2026, REPARADO) · el botón que abre los ajustes se llama «Ajustes de la cámara»', async ({ page }) => {
    // REPARADO: era <button aria-pressed aria-expanded>⚙️</button> sin aria-label. Detrás están el
    // selector de cámara, el espejo, el brillo y el contraste. Un desplegable va solo con aria-expanded.
    await registrarAperturas(page);
    await arrancar(page);
    const boton = page.getByRole('button', { name: /ajustes/i });
    await expect(boton).toHaveCount(1);
    await expect(boton).not.toHaveAttribute('aria-pressed', /.*/);
    await expect(boton).toHaveAttribute('aria-expanded', 'false');
  });

  test('HALLAZGO 4434 (11/11/2026, REPARADO) · los porcentajes del panel ya no van pegados («Brillo: 100%», esperado «100 %» con espacio duro)', async ({
    page,
  }) => {
    // REPARADO: «Brillo: {brightness}&nbsp;%», lo mismo Contraste y «100 % offline».
    await registrarAperturas(page);
    await arrancar(page);
    await abrirAjustes(page);
    await expect(page.locator('label[for="contraste"]')).toHaveText('Contraste: 100 %');
    await expect(page.getByText('Funciona 100 % offline')).toHaveCount(1);
    await expect(page.locator('label[for="brillo"]')).toHaveText('Brillo: 100 %');
  });

  test('HALLAZGO 4435 y 4436 (11/11/2026, REPARADO) · el FAQPage ya no dice que el permiso se pide «al acceder a la herramienta» ni da un 99 % sin fuente', async ({ page }) => {
    // REPARADO: el CASO 1 mide 0 aperturas al cargar y la guía visible (paso 1) dice que se pide
    // al pulsar «Iniciar Cámara»; la respuesta del JSON-LD dice ahora lo mismo. La de resoluciones
    // traía «el 99% de los casos profesionales», una cifra redonda sin fuente: ya no.
    await page.goto('/prueba-camara/');
    const faq = await faqJsonLd(page);
    const respuesta = faq['¿Cómo sé si mi cámara web funciona correctamente?'] ?? '';
    expect(respuesta.length).toBeGreaterThan(0);
    expect(respuesta).not.toContain('Al acceder a la herramienta, el navegador solicita permiso');
    expect(respuesta).toContain('Al pulsar «Iniciar Cámara», el navegador solicita permiso');
    const resolucion = faq['¿Qué resolución debería tener una webcam para videollamadas profesionales?'] ?? '';
    expect(resolucion.length).toBeGreaterThan(0);
    expect(resolucion).not.toMatch(/\d+\s?%/);
  });

  test('CAMBIO 532a9704f · el botón de ajustes se llama exactamente «Ajustes de la cámara» y su aria-expanded sigue al panel', async ({ page }) => {
    // Esperado: sin aria-pressed (es un desplegable); aria-expanded false → true (panel visible) → false
    await registrarAperturas(page);
    await arrancar(page);
    const boton = page.getByRole('button', { name: 'Ajustes de la cámara', exact: true });
    await expect(boton).toHaveCount(1);
    await expect(boton).not.toHaveAttribute('aria-pressed', /.*/);
    await expect(boton).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator(PANEL)).toHaveCount(0);
    await boton.click();
    await expect(boton).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator(PANEL)).toBeVisible();
    await boton.click();
    await expect(boton).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator(PANEL)).toHaveCount(0);
  });

  test('CAMBIO 15c76e745 · entre la cifra y el % va U+00A0, también al mover el deslizador (toHaveText no lo distingue: se miran los códigos)', async ({
    page,
  }) => {
    // toHaveText normaliza el espacio (\s incluye U+00A0): aquí se lee textContent tal cual
    await registrarAperturas(page);
    await arrancar(page);
    await abrirAjustes(page);
    const texto = async (sel: string): Promise<string> => (await page.locator(sel).first().textContent()) ?? '';
    expect(await texto('label[for="brillo"]')).toBe('Brillo: 100 %');
    expect(await texto('label[for="contraste"]')).toBe('Contraste: 100 %');
    await sembrarValor(page, '#brillo', 150);
    await expect(page.locator('label[for="brillo"]')).toHaveText('Brillo: 150 %');
    expect(await texto('label[for="brillo"]')).toBe('Brillo: 150 %');
    const offline = (await page.locator('li', { hasText: 'offline' }).first().textContent()) ?? '';
    expect(offline).toContain('Funciona 100 % offline');
  });
});

const { viewport, userAgent, deviceScaleFactor, isMobile, hasTouch } = devices['Pixel 7'];

test.describe('Móvil (Pixel 7)', () => {
  test.use({ viewport, userAgent, deviceScaleFactor, isMobile, hasTouch });

  test('CASO 3 · en el móvil el vídeo arranca, la página no desborda y los controles responden al toque', async ({ page }) => {
    await registrarAperturas(page);
    await arrancar(page, true);
    const medido = await page.evaluate(() => {
      const v = document.querySelector('video') as HTMLVideoElement;
      const ajustes = (v.srcObject as MediaStream).getVideoTracks()[0].getSettings();
      const botones = Array.from(document.querySelectorAll('[class*="_controls"]')[0].querySelectorAll('button')).map((b) => {
        const r = b.getBoundingClientRect();
        return { izquierda: r.left, derecha: r.right };
      });
      return {
        video: [v.videoWidth, v.videoHeight],
        ajustes: [ajustes.width ?? 0, ajustes.height ?? 0],
        anchoPagina: document.documentElement.scrollWidth,
        anchoVisible: document.documentElement.clientWidth,
        botones,
      };
    });
    expect(medido.video[0]).toBeGreaterThan(0);
    expect(medido.video).toEqual(medido.ajustes);
    expect(medido.anchoPagina).toBeLessThanOrEqual(medido.anchoVisible);
    expect(medido.botones).toHaveLength(4); // Detener, Foto, Foto 3s y ajustes
    for (const b of medido.botones) {
      expect(b.izquierda).toBeGreaterThanOrEqual(0);
      expect(b.derecha).toBeLessThanOrEqual(medido.anchoVisible);
    }

    await abrirAjustes(page, true);
    const espejo = page.getByRole('button', { name: /^Espejo/ });
    await espejo.tap();
    await expect(espejo).toHaveAttribute('aria-pressed', 'false');

    await hacerFoto(page, true);
    const ancho = await page.locator(FOTOS).first().evaluate((i) => (i as HTMLImageElement).naturalWidth);
    expect(ancho).toBe(medido.video[0]);

    await detener(page).tap();
    await expect(iniciar(page)).toBeVisible();
    const vivas = await page.evaluate(
      () => (window as unknown as Ventana).__aperturas.flatMap((f) => f.getTracks()).filter((p) => p.readyState !== 'ended').length,
    );
    expect(vivas).toBe(0);
  });

  test('HALLAZGO 4427 (11/11/2026, REPARADO) · con el móvil en vertical (flujo 480 × 640) la vista previa enseña el fotograma entero', async ({
    page,
  }) => {
    // REPARADO: object-fit contain y la caja con la proporción del flujo. Antes: la caja del vídeo es aspect-ratio 16/9 con object-fit: cover. Un móvil sujeto en
    // vertical entrega fotogramas verticales: con 480 × 640 se ve (9/16)/(4/3) = 42,2 % de la
    // altura; con 1080 × 1920, el 31,6 %. Una webcam 4:3 de escritorio pierde el 25 %. La foto,
    // en cambio, guarda el fotograma entero: lo que se encuadra no es lo que se ve.
    await camaraDeMitades(page, 480, 640);
    await arrancar(page, true);
    expect(await page.locator('video').evaluate((v) => (v as HTMLVideoElement).videoHeight)).toBe(640);
    const fraccion = await fraccionVisibleDeLaAltura(page);
    expect(fraccion, `fracción visible de la altura: ${fraccion.toFixed(4)}`).toBeGreaterThanOrEqual(0.99);
    // Y no por la puerta de atrás del medidor (que da 1 con cualquier ajuste que no sea cover):
    // el fotograma contenido cabe entero en la caja, que es más alta que ancha como el flujo.
    const caja = await page.locator(CONTENEDOR).evaluate((el) => el.getBoundingClientRect());
    expect(caja.height).toBeGreaterThan(caja.width);
  });

  test('CAMBIO 532a9704f · con la cámara falsa de Chromium el medio arranca y la caja tiene la proporción del flujo (332 × 186,75)', async ({
    page,
  }) => {
    // Esperado en la cabecera: 412 − 2·16 − 2·24 = 332 de ancho; 332·1080/1920 = 186,75 < 0,7·839
    await registrarAperturas(page);
    await arrancar(page, true);
    const m = await medirVistaPrevia(page);
    comprobarVistaPrevia(m);
    expect(m.cajaH).toBeLessThan(m.alto70vh);
    expect(m.cajaW / m.cajaH).toBeCloseTo(m.videoW / m.videoH, 2);
  });

  test('HALLAZGO (11/11/2026, ABIERTO) · un doble toque en «Iniciar Cámara» con una cámara que tarda 400 ms deja una pista VIVA tras «Detener» (esperado 0)', async ({
    page,
  }) => {
    // ABIERTO: el mismo de escritorio, con dos toques separados 150 ms. Medido: 2 getUserMedia y
    // 1 pista viva tras «Detener».
    test.fail();
    await registrarAperturasLentas(page, 400);
    await abrir(page);
    await dobleClicHumano(page, true);
    await expect(detener(page)).toBeVisible();
    await page.waitForTimeout(1500);
    await detener(page).tap();
    await expect(iniciar(page)).toBeVisible();
    await page.waitForTimeout(800);
    expect(await pistasVivas(page)).toBe(0);
  });
});
