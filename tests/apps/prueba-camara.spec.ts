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
  // La app reabre la cámara una vez al poco de arrancar (ver el hallazgo de las dos aperturas):
  // se deja asentar antes de medir
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

  test('HALLAZGO (11/11/2026, ABIERTO) · un solo clic en «Iniciar Cámara» abre la cámara dos veces (esperado 1 getUserMedia)', async ({
    page,
  }) => {
    // ABIERTO: tras el primer getUserMedia, getCameras() fija selectedCamera con el deviceId de la
    // PRIMERA cámara enumerada y el useEffect([selectedCamera]) llama otra vez a startCamera(), que
    // para la pista recién abierta y pide `deviceId: { exact }`. Medido: 2 aperturas, la primera
    // en ended. La luz de la cámara parpadea y, donde la predeterminada no sea la primera de la
    // lista, cambia de cámara sin que nadie lo pida (esto último no se ha podido reproducir).
    test.fail();
    await registrarAperturas(page);
    await arrancar(page);
    await page.waitForTimeout(1500);
    expect(await page.evaluate(() => (window as unknown as Ventana).__aperturas.length)).toBe(1);
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

  test('HALLAZGO (11/11/2026, ABIERTO) · con el espejo desactivado la foto sigue saliendo volteada (esperado izquierda 50, derecha 200)', async ({
    page,
  }) => {
    // ABIERTO: takePhoto es useCallback(…, []) y llama al capturePhoto del PRIMER render, que se
    // quedó con isMirrored = true, brillo 100 y contraste 100. La vista previa sí se desvoltea.
    test.fail();
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

  test('HALLAZGO (11/11/2026, ABIERTO) · el brillo y el contraste al 150 % no llegan a la foto (esperado 255/75 y 236/11)', async ({
    page,
  }) => {
    // ABIERTO: el mismo cierre viejo de takePhoto. Medido: con brillo 150 la foto da 200/50, y con
    // contraste 150 también 200/50, mientras la vista previa sí cambia (style.filter).
    test.fail();
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

  test('HALLAZGO (11/11/2026, ABIERTO) · «Foto 3s» y «Detener» antes de que acabe la cuenta dejan una foto vacía en la galería', async ({
    page,
  }) => {
    // ABIERTO: al llegar a cero capturePhoto() dibuja un <video> sin flujo (videoWidth 0): el
    // canvas de 0 × 0 da «data:,» y la galería añade una tarjeta rota con su botón «Descargar».
    test.fail();
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

  test('HALLAZGO (11/11/2026, ABIERTO) · sin cámara (NotFoundError «Requested device not found») sale el mensaje del navegador en inglés', async ({
    page,
  }) => {
    // ABIERTO: page.tsx busca 'NotFoundError' en err.message, y ningún navegador pone el nombre
    // en el mensaje. Medido: «Error al acceder a la cámara: Requested device not found».
    test.fail();
    await camaraQueFalla(page, 'NotFoundError', 'Requested device not found');
    await abrir(page);
    await iniciar(page).click();
    await expect(page.locator(AVISO)).toContainText('No se encontró ninguna cámara');
  });

  test('HALLAZGO (11/11/2026, ABIERTO) · cámara ocupada por otra app (NotReadableError «Could not start video source») sale en inglés', async ({
    page,
  }) => {
    // ABIERTO: la causa que la propia página da por la más habitual (Zoom o Teams abiertos) cae en
    // la rama genérica. Medido: «Error al acceder a la cámara: Could not start video source».
    test.fail();
    await camaraQueFalla(page, 'NotReadableError', 'Could not start video source');
    await abrir(page);
    await iniciar(page).click();
    await expect(page.locator(AVISO)).toBeVisible();
    await expect(page.locator(AVISO)).not.toContainText('Could not start video source');
  });

  test('HALLAZGO (11/11/2026, ABIERTO) · permiso denegado en Safari (NotAllowedError con su mensaje) no dice «Permiso denegado»', async ({
    page,
  }) => {
    // ABIERTO: solo el mensaje de Chrome lleva «Permission denied». Medido: «Error al acceder a la
    // cámara: The request is not allowed by the user agent or the platform in the current
    // context, possibly because the user denied permission.»
    test.fail();
    await camaraQueFalla(
      page,
      'NotAllowedError',
      'The request is not allowed by the user agent or the platform in the current context, possibly because the user denied permission.',
    );
    await abrir(page);
    await iniciar(page).click();
    await expect(page.locator(AVISO)).toContainText('Permiso denegado');
  });

  test('HALLAZGO (11/11/2026, ABIERTO) · el aviso de error de la cámara no se anuncia (sin role="alert" ni aria-live)', async ({
    page,
  }) => {
    // ABIERTO: el panel del micrófono sí lo hace (<p role="alert">); el de la cámara pinta el
    // aviso en un <div> dentro de la caja del vídeo y el foco se queda en «Iniciar Cámara».
    test.fail();
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

  test('HALLAZGO (11/11/2026, ABIERTO) · el botón que abre los ajustes se llama solo «⚙️»', async ({ page }) => {
    // ABIERTO: <button aria-pressed aria-expanded>⚙️</button> sin aria-label. Detrás están el
    // selector de cámara, el espejo, el brillo y el contraste. Además lleva aria-pressed Y
    // aria-expanded: un desplegable va solo con aria-expanded.
    test.fail();
    await registrarAperturas(page);
    await arrancar(page);
    await expect(page.getByRole('button', { name: /ajustes/i })).toHaveCount(1);
  });

  test('HALLAZGO (11/11/2026, ABIERTO) · los porcentajes del panel van pegados («Brillo: 100%», esperado «100 %» con espacio duro)', async ({
    page,
  }) => {
    test.fail();
    await registrarAperturas(page);
    await arrancar(page);
    await abrirAjustes(page);
    await expect(page.locator('label[for="brillo"]')).toHaveText('Brillo: 100 %');
  });

  test('HALLAZGO (11/11/2026, ABIERTO) · el FAQPage dice que el permiso se pide «al acceder a la herramienta»', async ({ page }) => {
    // ABIERTO: el CASO 1 mide 0 aperturas al cargar; la guía visible (paso 1) dice bien que se
    // pide al pulsar «Iniciar Cámara». La respuesta del JSON-LD también trae «el 99% de los casos
    // profesionales», una cifra redonda sin fuente.
    test.fail();
    await page.goto('/prueba-camara/');
    const faq = await faqJsonLd(page);
    const respuesta = faq['¿Cómo sé si mi cámara web funciona correctamente?'] ?? '';
    expect(respuesta.length).toBeGreaterThan(0);
    expect(respuesta).not.toContain('Al acceder a la herramienta, el navegador solicita permiso');
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

  test('HALLAZGO (11/11/2026, ABIERTO) · con el móvil en vertical (flujo 480 × 640) la vista previa enseña solo el 42 % de la altura', async ({
    page,
  }) => {
    // ABIERTO: la caja del vídeo es aspect-ratio 16/9 con object-fit: cover. Un móvil sujeto en
    // vertical entrega fotogramas verticales: con 480 × 640 se ve (9/16)/(4/3) = 42,2 % de la
    // altura; con 1080 × 1920, el 31,6 %. Una webcam 4:3 de escritorio pierde el 25 %. La foto,
    // en cambio, guarda el fotograma entero: lo que se encuadra no es lo que se ve.
    test.fail();
    await camaraDeMitades(page, 480, 640);
    await arrancar(page, true);
    expect(await page.locator('video').evaluate((v) => (v as HTMLVideoElement).videoHeight)).toBe(640);
    const fraccion = await fraccionVisibleDeLaAltura(page);
    expect(fraccion, `fracción visible de la altura: ${fraccion.toFixed(4)}`).toBeGreaterThanOrEqual(0.99);
  });
});
