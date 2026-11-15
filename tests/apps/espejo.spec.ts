import { test, expect, devices, type Locator, type Page } from '@playwright/test';
import { sembrarValor, esperarPaginaAsentada } from './_hidratacion';

/**
 * espejo — Espejo Digital (primera inspección, 15/11/2026)
 *
 * QUÉ PROMETE (leído el 15/11/2026)
 *   · <h1> «Espejo Digital»: «Tu espejo de bolsillo en el móvil (celular) u ordenador (computadora)».
 *   · metadata: «usa la cámara frontal de tu dispositivo».
 *   · Página: imagen espejada por defecto con un conmutador a «Normal» (FAQ visible), zoom y brillo
 *     (guía, pasos 3 y 4), pantalla completa (tarjeta «Móvil»), y que no se captura, guarda ni
 *     envía ninguna imagen (FAQ visible «¿Guarda alguna imagen o vídeo?»).
 *   · page.tsx: getUserMedia({ video: { facingMode: 'user', width: { ideal: 1920 }, height: { ideal: 1080 } } }),
 *     transform `scaleX(-1) scale(zoom)` y filter `brightness(brillo %)` sobre el <video>.
 *
 * LOS CASOS, CON LO ESPERADO ESCRITO ANTES DE ABRIR EL NAVEGADOR
 *
 *   CASO A (escritorio, cámara falsa de Chromium). Al cargar, 0 llamadas a getUserMedia. «Activar
 *     espejo» → vídeo vivo (readyState >= 2, videoWidth > 0) y espejado: transform computado
 *     matrix(-1, 0, 0, 1, 0, 0). Conmutador → matrix(1, 0, 0, 1, 0, 0). Zoom 1,5 con espejo →
 *     matrix(-1.5, 0, 0, 1.5, 0, 0). Brillo 120 → brightness(1.2). «Restablecer» → 1 / 100 /
 *     espejado. «Pantalla completa» → el contenedor es document.fullscreenElement. «Apagar» → 0
 *     pistas vivas; salir de la página sin recargar, también. Ninguna petición con cuerpo, ni
 *     RTCPeerConnection ni MediaRecorder, con el espejo activo. TODO PASA (medido: 1920 × 1080).
 *
 *   CASO B (Pixel 7). El mismo flujo por toque: vídeo vivo dentro de los 412 px, sin desborde
 *     horizontal (PASA). Controles táctiles de al menos 24 px: los botones sí; los deslizadores de
 *     brillo y zoom miden 340 × 8 px (HALLAZGO). El recuadro negro dice «Pulsa para activar el
 *     espejo» y lleva cursor: pointer: tocarlo debería abrir la cámara. Medido: 0 llamadas, y
 *     «Activar espejo» empieza en y = 1038 con la pantalla en 839 (HALLAZGO).
 *
 *   CASO C (rechazos, name y message literales de Chrome; el del permiso denegado, medido también
 *     con --use-fake-ui-for-media-stream=deny: «NotAllowedError | Permission denied»). Esperado:
 *     aviso comprensible en un role="alert" y el botón se puede volver a pulsar (2 llamadas). El
 *     aviso sale y el botón reintenta (PASA), pero sin role="alert" ni aria-live (HALLAZGO). Sin
 *     cámara (NotFoundError) y con la cámara ocupada (NotReadableError) dice igualmente «Permiso
 *     de cámara denegado · Activa la cámara en la configuración del navegador» (HALLAZGO).
 *
 *   FAMILIA: tests/familias/apertura-medio-doble-clic.spec.ts, fila `espejo` — PASA (15/11/2026).
 */

test.use({
  permissions: ['camera'],
  launchOptions: {
    // Sin estos dos argumentos Chromium no tiene cámara (NotFoundError) ni deja pasar el permiso
    args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'],
  },
});

test.beforeEach(() => {
  // Montar la cámara y compilar la ruta en frío se come los 30 s por defecto
  test.slow();
});

interface Ventana {
  __aperturas: MediaStream[];
  __llamadas: number;
  __restricciones: MediaStreamConstraints | undefined;
  __conexiones: number;
  __grabadoras: number;
}

const activar = (page: Page): Locator => page.getByRole('button', { name: /Activar espejo/ });
const apagar = (page: Page): Locator => page.getByRole('button', { name: /Apagar/ });
const conmutador = (page: Page): Locator => page.locator('button[aria-pressed]');
const RECUADRO = 'Pulsa para activar el espejo';
const AVISO_DENEGADO = 'Permiso de cámara denegado';

/** Deja la cámara falsa como está, pero cuenta las llamadas y apunta cada flujo. */
async function registrarAperturas(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const w = window as unknown as Ventana;
    w.__aperturas = [];
    w.__llamadas = 0;
    w.__conexiones = 0;
    w.__grabadoras = 0;
    const original = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
    navigator.mediaDevices.getUserMedia = async (c?: MediaStreamConstraints): Promise<MediaStream> => {
      w.__llamadas += 1;
      w.__restricciones = c;
      const flujo = await original(c);
      w.__aperturas.push(flujo);
      return flujo;
    };
    // Lo que haría falta para que la imagen saliera del navegador: se cuenta si alguien lo crea
    const Conexion = window.RTCPeerConnection;
    if (Conexion) {
      window.RTCPeerConnection = function (this: unknown, ...a: ConstructorParameters<typeof RTCPeerConnection>) {
        w.__conexiones += 1;
        return new Conexion(...a);
      } as unknown as typeof RTCPeerConnection;
    }
    const Grabadora = window.MediaRecorder;
    if (Grabadora) {
      window.MediaRecorder = function (this: unknown, ...a: ConstructorParameters<typeof MediaRecorder>) {
        w.__grabadoras += 1;
        return new Grabadora(...a);
      } as unknown as typeof MediaRecorder;
    }
  });
}

/** Sustituye la cámara por un rechazo con el `name` y el `message` literales de Chrome. */
async function camaraQueFalla(page: Page, nombre: string, mensaje: string): Promise<void> {
  await page.addInitScript(
    ({ n, m }: { n: string; m: string }) => {
      const w = window as unknown as Ventana;
      w.__llamadas = 0;
      navigator.mediaDevices.getUserMedia = (): Promise<MediaStream> => {
        w.__llamadas += 1;
        return Promise.reject(new DOMException(m, n));
      };
    },
    { n: nombre, m: mensaje },
  );
}

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

async function abrir(page: Page): Promise<void> {
  await page.goto('/espejo/');
  await esperarBotonVivo(page, activar(page));
}

/** Abre la app, pulsa «Activar espejo» y espera a que el vídeo tenga fotograma DE VERDAD. */
async function arrancar(page: Page, tocar = false): Promise<void> {
  await abrir(page);
  if (tocar) await activar(page).tap();
  else await activar(page).click();
  await expect(apagar(page)).toBeVisible();
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
  // La transición CSS del transform dura 0,2 s
  await page.waitForTimeout(400);
}

async function transformDelVideo(page: Page): Promise<string> {
  return page.locator('video').evaluate((v) => getComputedStyle(v).transform);
}

async function pistasVivas(page: Page): Promise<number> {
  return page.evaluate(
    () => (window as unknown as Ventana).__aperturas.flatMap((f) => f.getTracks()).filter((p) => p.readyState === 'live').length,
  );
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

/** La FAQ visible (plegada dentro de la guía, pero en el DOM): pregunta → respuesta. */
async function faqVisible(page: Page): Promise<Record<string, string>> {
  return page.evaluate(() => {
    const salida: Record<string, string> = {};
    for (const d of Array.from(document.querySelectorAll('details'))) {
      const resumen = d.querySelector('summary');
      if (!resumen) continue;
      salida[(resumen.textContent ?? '').trim()] = Array.from(d.querySelectorAll('p'))
        .map((p) => (p.textContent ?? '').replace(/\s+/g, ' ').trim())
        .join(' ');
    }
    return salida;
  });
}

const normalizar = (t: string): string => t.replace(/\s+/g, ' ').trim();

test.describe('Escritorio · el medio arranca de verdad, se ajusta y se libera', () => {
  test('CASO A · al cargar no se pide la cámara; con un clic el vídeo está vivo, es la frontal y sale espejado', async ({ page }) => {
    await registrarAperturas(page);
    await abrir(page);
    // El permiso se pide al pulsar «Activar espejo», no al entrar (guía, paso 1)
    expect(await page.evaluate(() => (window as unknown as Ventana).__llamadas)).toBe(0);
    await activar(page).click();
    await expect(apagar(page)).toBeVisible();
    await expect
      .poll(() => page.locator('video').evaluate((el) => (el as HTMLVideoElement).readyState >= 2 && (el as HTMLVideoElement).videoWidth > 0), {
        timeout: 15000,
      })
      .toBe(true);
    await page.waitForTimeout(400);
    const medido = await page.evaluate(() => {
      const v = document.querySelector('video') as HTMLVideoElement;
      const w = window as unknown as Ventana;
      const video = w.__restricciones?.video as MediaTrackConstraints | undefined;
      return {
        llamadas: w.__llamadas,
        pista: (v.srcObject as MediaStream).getVideoTracks()[0].readyState,
        enPausa: v.paused,
        facingMode: video?.facingMode,
      };
    });
    expect(medido).toEqual({ llamadas: 1, pista: 'live', enPausa: false, facingMode: 'user' });
    // scaleX(-1) scale(1): el espejo por defecto que promete la FAQ visible
    expect(await transformDelVideo(page)).toBe('matrix(-1, 0, 0, 1, 0, 0)');
    await expect(conmutador(page)).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByText(RECUADRO)).toHaveCount(0);
  });

  test('CASO A · el conmutador quita el espejo; zoom 1,5 y brillo 120 llegan a la imagen; «Restablecer» vuelve a 1 / 100 / espejado', async ({
    page,
  }) => {
    await registrarAperturas(page);
    await arrancar(page);
    await conmutador(page).click();
    await expect(conmutador(page)).toHaveAttribute('aria-pressed', 'false');
    await page.waitForTimeout(400);
    expect(await transformDelVideo(page)).toBe('matrix(1, 0, 0, 1, 0, 0)');
    await conmutador(page).click();
    await expect(conmutador(page)).toHaveAttribute('aria-pressed', 'true');

    // scaleX(-1) scale(1,5) = matrix(-1,5, 0, 0, 1,5, 0, 0)
    await sembrarValor(page, '#zoom', 1.5);
    await page.waitForTimeout(400);
    expect(await transformDelVideo(page)).toBe('matrix(-1.5, 0, 0, 1.5, 0, 0)');
    // brightness(120 %) = 1,2
    await sembrarValor(page, '#brillo', 120);
    await page.waitForTimeout(400);
    expect(await page.locator('video').evaluate((v) => getComputedStyle(v).filter)).toBe('brightness(1.2)');

    await page.getByRole('button', { name: /Restablecer/ }).click();
    await page.waitForTimeout(400);
    expect(await transformDelVideo(page)).toBe('matrix(-1, 0, 0, 1, 0, 0)');
    expect(await page.locator('video').evaluate((v) => getComputedStyle(v).filter)).toBe('brightness(1)');
    await expect(page.locator('#zoom')).toHaveValue('1');
    await expect(page.locator('#brillo')).toHaveValue('100');
  });

  test('CASO A · «Pantalla completa» pone el espejo a pantalla completa y «Salir» la cierra', async ({ page }) => {
    await registrarAperturas(page);
    await arrancar(page);
    await page.getByRole('button', { name: /Pantalla completa/ }).click();
    await expect.poll(() => page.evaluate(() => document.fullscreenElement?.contains(document.querySelector('video')) ?? false)).toBe(true);
    const salir = page.getByRole('button', { name: /Salir/ });
    await expect(salir).toBeVisible();
    await salir.click();
    await expect.poll(() => page.evaluate(() => document.fullscreenElement === null)).toBe(true);
    await expect(salir).toHaveCount(0);
  });

  test('CASO A · «Apagar» deja 0 pistas vivas y vuelve el recuadro; salir a otra app sin recargar también suelta la cámara', async ({
    page,
  }) => {
    await registrarAperturas(page);
    await arrancar(page);
    expect(await pistasVivas(page)).toBe(1);
    await apagar(page).click();
    await expect(activar(page)).toBeVisible();
    await page.waitForTimeout(500);
    expect(await pistasVivas(page)).toBe(0);
    await expect(page.getByText(RECUADRO)).toBeVisible();

    // Otra vez encendido y fuera de la página por un enlace interno (navegación de cliente)
    await activar(page).click();
    await expect(apagar(page)).toBeVisible();
    await expect.poll(() => pistasVivas(page)).toBe(1);
    await page.evaluate(() => {
      (window as unknown as { __marca: string }).__marca = 'misma-ventana';
    });
    // Una tarjeta de «Relacionadas»: enlace interno que Next resuelve sin recargar
    const enlace = page.locator('a[href*="#from=related-espejo"]').first();
    await enlace.click();
    await page.waitForURL((u) => !u.pathname.startsWith('/espejo'), { timeout: 15000 });
    await page.waitForTimeout(800);
    // Si la navegación hubiera recargado, el recuento se habría perdido y esto no mediría nada
    expect(await page.evaluate(() => (window as unknown as { __marca?: string }).__marca)).toBe('misma-ventana');
    expect(await pistasVivas(page)).toBe(0);
  });

  test('PRIVACIDAD · con el espejo activo no sale ninguna petición con cuerpo ni se crea RTCPeerConnection o MediaRecorder', async ({ page }) => {
    // FAQ visible: «no captura, almacena ni envía ninguna imagen o vídeo»; FAQPage: «sin enviarse a
    // ningún servidor». En page.tsx no hay fetch, canvas, MediaRecorder ni conexión: se vigila aquí.
    await registrarAperturas(page);
    await arrancar(page);
    const enviados: string[] = [];
    page.on('request', (r) => {
      const cuerpo = r.postDataBuffer();
      if (cuerpo && cuerpo.length > 0) enviados.push(`${r.method()} ${r.url()} (${cuerpo.length} B)`);
    });
    await sembrarValor(page, '#zoom', 1.3);
    await page.waitForTimeout(3000);
    expect(enviados).toEqual([]);
    expect(await page.evaluate(() => [(window as unknown as Ventana).__conexiones, (window as unknown as Ventana).__grabadoras])).toEqual([0, 0]);
  });

  test('HALLAZGO 4751 (REPARADO 15/11/2026) · si la pista termina sola (permiso revocado, cámara desconectada) la app vuelve a «Activar espejo» y avisa', async ({
    page,
    context,
  }) => {
    // Medido: con el espejo activo, context.clearPermissions() dispara «ended» en la pista; la app
    // no escuchaba ese evento y se quedaba con «⏹️ Apagar», el vídeo muerto y ningún aviso.
    await registrarAperturas(page);
    await arrancar(page);
    await context.clearPermissions();
    await expect.poll(() => pistasVivas(page)).toBe(0);
    await expect
      .poll(
        async () =>
          (await activar(page).count()) > 0 || (await page.getByRole('alert').filter({ hasText: /cámara/i }).count()) > 0,
        { timeout: 5000 },
      )
      .toBe(true);
    await expect(page.getByRole('alert').filter({ hasText: 'La cámara se ha desconectado' })).toHaveCount(1);
    await expect(activar(page)).toBeVisible();
  });

  test('HALLAZGO 4754 (REPARADO 15/11/2026) · formato: «Zoom: 1,5x» y «Brillo: 120 %» con espacio duro', async ({
    page,
  }) => {
    // CLAUDE.md global §2: coma decimal y el % separado por U+00A0. Antes la etiqueta pintaba
    // `{zoom}x` (1.5) y `{brillo}%`.
    await registrarAperturas(page);
    await arrancar(page);
    await sembrarValor(page, '#zoom', 1.5);
    await sembrarValor(page, '#brillo', 120);
    const zoom = (await page.locator('label[for="zoom"]').textContent()) ?? '';
    const brillo = (await page.locator('label[for="brillo"]').textContent()) ?? '';
    expect(zoom).toMatch(/Zoom: 1,5\s?[x×]/);
    expect(brillo).toContain('Brillo: 120 %');
  });

  test('HALLAZGO 4755 (REPARADO 15/11/2026) · el conmutador conserva su nombre al cambiar de estado y «Salir» se lee sin el ✕', async ({
    page,
  }) => {
    // Un botón con aria-pressed no debe cambiar su etiqueta: se leía «Normal, no presionado»,
    // que suena a «el modo normal está desactivado» justo cuando está activo. Y el ✕ de «Salir»
    // iba sin aria-hidden (CLAUDE.md global §5).
    await registrarAperturas(page);
    await arrancar(page);
    const antes = normalizar((await conmutador(page).textContent()) ?? '');
    await conmutador(page).click();
    await expect(conmutador(page)).toHaveAttribute('aria-pressed', 'false');
    const despues = normalizar((await conmutador(page).textContent()) ?? '');
    expect(despues).toBe(antes);
    await expect(conmutador(page)).toHaveAccessibleName('Espejado');
    await page.getByRole('button', { name: /Pantalla completa/ }).click();
    const salir = page.getByRole('button', { name: /Salir/ });
    await expect(salir).toBeVisible();
    expect(await salir.ariaSnapshot()).not.toContain('✕');
  });
});

test.describe('Escritorio · rechazos', () => {
  test('CASO C · permiso denegado (NotAllowedError «Permission denied»): sale el aviso y el botón vuelve a pedir la cámara', async ({ page }) => {
    await camaraQueFalla(page, 'NotAllowedError', 'Permission denied');
    await abrir(page);
    await activar(page).click();
    await expect(page.getByText(AVISO_DENEGADO)).toBeVisible();
    await expect(page.getByText('Activa la cámara en la configuración del navegador')).toBeVisible();
    await expect(apagar(page)).toHaveCount(0);
    await expect(activar(page)).toBeEnabled();
    await activar(page).click();
    await expect.poll(() => page.evaluate(() => (window as unknown as Ventana).__llamadas)).toBe(2);
  });

  test('HALLAZGO 4747 (REPARADO 15/11/2026) · el aviso de permiso denegado se anuncia en un role="alert"', async ({ page }) => {
    // getByRole('alert') casa también con el anunciador de rutas de Next: se acota por el texto
    await camaraQueFalla(page, 'NotAllowedError', 'Permission denied');
    await abrir(page);
    await activar(page).click();
    await expect(page.getByText(AVISO_DENEGADO)).toBeVisible();
    await expect(page.getByRole('alert').filter({ hasText: AVISO_DENEGADO })).toHaveCount(1);
  });

  test('HALLAZGO 4746 (REPARADO 15/11/2026) · sin cámara (NotFoundError) avisa de que no hay cámara, no de un permiso denegado', async ({
    page,
  }) => {
    // El catch de iniciarCamara ponía permisoCamara = 'denied' con cualquier error. Quien no tiene
    // webcam, o la tiene abierta en la videollamada (uso que la propia página propone), iba a la
    // configuración del navegador y allí el permiso ya estaba concedido. Ahora decide error.name.
    await camaraQueFalla(page, 'NotFoundError', 'Requested device not found');
    await abrir(page);
    await activar(page).click();
    await page.waitForTimeout(800);
    const sinCamara = normalizar(await page.locator('body').innerText());
    expect(sinCamara).not.toContain(AVISO_DENEGADO);
    expect(sinCamara).toMatch(/no se (ha )?encontr|ninguna cámara|no hay (ninguna )?cámara/i);
    await expect(page.getByRole('alert').filter({ hasText: 'No se ha encontrado ninguna cámara' })).toHaveCount(1);
  });

  test('HALLAZGO 4746 (REPARADO 15/11/2026, el mismo) · con la cámara ocupada por otra app (NotReadableError «Could not start video source»)', async ({
    page,
  }) => {
    await camaraQueFalla(page, 'NotReadableError', 'Could not start video source');
    await abrir(page);
    await activar(page).click();
    await page.waitForTimeout(800);
    const ocupada = normalizar(await page.locator('body').innerText());
    expect(ocupada).not.toContain(AVISO_DENEGADO);
    expect(ocupada).toMatch(/ocupada|en uso|otra (app|aplicación)/i);
  });
});

test.describe('Textos y datos estructurados', () => {
  test('HALLAZGO 4752 (REPARADO 15/11/2026) · features del JSON-LD con 4-8 características (CLAUDE.md §1.ter)', async ({ page }) => {
    await page.goto('/espejo/');
    const lista = await page.evaluate(() => {
      for (const s of Array.from(document.querySelectorAll('script[type="application/ld+json"]'))) {
        const j = JSON.parse(s.textContent ?? '{}') as { '@type'?: string; featureList?: string[] };
        if (j['@type'] === 'WebApplication') return j.featureList ?? [];
      }
      return null;
    });
    expect(lista).not.toBeNull();
    expect((lista ?? []).length).toBeGreaterThanOrEqual(4);
    expect((lista ?? []).length).toBeLessThanOrEqual(8);
    expect(lista).toContain('Zoom de la imagen de 1x a 2x');
  });

  test('HALLAZGO 4749 (REPARADO 15/11/2026) · el FAQPage cita el zoom de la app (1x a 2x), no el pellizco ni el del navegador', async ({
    page,
  }) => {
    await page.goto('/espejo/');
    const faq = await faqJsonLd(page);
    const zoom = faq['¿Puedo ampliar o ajustar el zoom de la imagen?'] ?? '';
    // La página sí lo dice (guía, paso 3: «Usa el control de zoom»), y el deslizador #zoom va de 1 a 2
    expect(zoom.length).toBeGreaterThan(0);
    expect(zoom).not.toMatch(/pellizco|pinch|depende de las capacidades del navegador/i);
    expect(zoom).toContain('de 1x a 2x');
  });

  test('HALLAZGO 4750 (REPARADO 15/11/2026) · el FAQPage ya no dice que es «especialmente útil» donde no hay cámara', async ({
    page,
  }) => {
    // Sin cámara la app no muestra imagen
    await page.goto('/espejo/');
    const faq = await faqJsonLd(page);
    const situaciones = faq['¿Para qué situaciones es útil un espejo digital?'] ?? '';
    expect(situaciones.length).toBeGreaterThan(0);
    expect(situaciones).not.toContain('donde no hay cámara orientada hacia el usuario');
    expect(situaciones).toContain('Necesita una cámara que te mire');
  });

  test('HALLAZGO 4753 (REPARADO 15/11/2026) · la pregunta de si se guarda la imagen es UNA, la misma en el FAQPage y en la FAQ visible', async ({
    page,
  }) => {
    // Estaba escrita dos veces con dos respuestas; ahora las dos FAQ leen PREGUNTA_PRIVACIDAD.
    await page.goto('/espejo/');
    const ld = await faqJsonLd(page);
    const visible = await faqVisible(page);
    const enLd = Object.keys(ld).filter((q) => /guarda/i.test(q));
    const enVisible = Object.keys(visible).filter((q) => /guarda/i.test(q));
    expect(enLd).toHaveLength(1);
    expect(enVisible).toEqual(enLd);
    expect(normalizar(visible[enVisible[0]] ?? '')).toContain(normalizar(ld[enLd[0]] ?? ''));
  });

  test('HALLAZGO 4757 (REPARADO 15/11/2026) · la página ya no dice que con la trasera «la imagen no se invierte»: la app pide siempre la frontal', async ({
    page,
  }) => {
    // page.tsx aplica scaleX(-1) sin mirar qué cámara llegó (no lee facingMode) y no tiene
    // selector de cámara: la respuesta a «¿Puedo usarlo con la cámara trasera?» es «no, la app
    // pide siempre la frontal», no una advertencia sobre la inversión.
    await page.goto('/espejo/');
    const texto = normalizar((await page.locator('body').textContent()) ?? '');
    expect(texto).not.toContain('no se invierte automáticamente');
    const visible = await faqVisible(page);
    expect(visible['¿Puedo usarlo con la cámara trasera?']).toContain('La app pide siempre la cámara frontal');
  });
});

const { viewport, userAgent, deviceScaleFactor, isMobile, hasTouch } = devices['Pixel 7'];

test.describe('Móvil (Pixel 7)', () => {
  test.use({ viewport, userAgent, deviceScaleFactor, isMobile, hasTouch });

  test('CASO B · por toque el vídeo arranca, cabe en los 412 px sin desborde, los botones miden al menos 24 px y «Apagar» suelta la cámara', async ({
    page,
  }) => {
    await registrarAperturas(page);
    await arrancar(page, true);
    await esperarPaginaAsentada(page);
    const medido = await page.evaluate(() => {
      const v = document.querySelector('video') as HTMLVideoElement;
      const r = v.getBoundingClientRect();
      const botones = Array.from(document.querySelectorAll('main button, body button'))
        .filter((b) => /Apagar|Espejado|Pantalla completa|Restablecer/.test(b.textContent ?? ''))
        .map((b) => {
          const c = b.getBoundingClientRect();
          return { w: c.width, h: c.height, izq: c.left, der: c.right };
        });
      return {
        videoW: v.videoWidth,
        caja: { izq: r.left, der: r.right, alto: r.height },
        anchoPagina: document.documentElement.scrollWidth,
        anchoVisible: document.documentElement.clientWidth,
        botones,
      };
    });
    expect(medido.videoW).toBeGreaterThan(0);
    expect(medido.anchoPagina).toBeLessThanOrEqual(medido.anchoVisible);
    expect(medido.caja.izq).toBeGreaterThanOrEqual(0);
    expect(medido.caja.der).toBeLessThanOrEqual(medido.anchoVisible);
    expect(medido.caja.alto).toBeGreaterThan(0);
    expect(medido.botones).toHaveLength(4);
    for (const b of medido.botones) {
      expect(b.w).toBeGreaterThanOrEqual(24);
      expect(b.h).toBeGreaterThanOrEqual(24);
      expect(b.der).toBeLessThanOrEqual(medido.anchoVisible);
    }
    await conmutador(page).tap();
    await expect(conmutador(page)).toHaveAttribute('aria-pressed', 'false');
    await apagar(page).tap();
    await expect(activar(page)).toBeVisible();
    await page.waitForTimeout(500);
    expect(await pistasVivas(page)).toBe(0);
  });

  test('HALLAZGO 4748 (REPARADO 15/11/2026) · tocar el recuadro «Pulsa para activar el espejo» abre la cámara', async ({
    page,
  }) => {
    // El recuadro (392 × 697 px, cursor: pointer) llenaba la pantalla sin onClick: 0 llamadas a
    // getUserMedia tras tocarlo, con el botón en y = 1038 e innerHeight 839. Ahora es un botón.
    await registrarAperturas(page);
    await abrir(page);
    await esperarPaginaAsentada(page);
    const botonEnPantalla = await activar(page).evaluate((b) => b.getBoundingClientRect().bottom <= window.innerHeight);
    await page.getByText(RECUADRO).tap();
    await page.waitForTimeout(1200);
    const llamadas = await page.evaluate(() => (window as unknown as Ventana).__llamadas);
    expect(llamadas > 0 || botonEnPantalla, `llamadas tras tocar el recuadro: ${llamadas}; botón en la primera pantalla: ${botonEnPantalla}`).toBe(
      true,
    );
    expect(llamadas).toBe(1);
    await expect(apagar(page)).toBeVisible();
  });

  test('HALLAZGO 4756 (REPARADO 15/11/2026) · los deslizadores de brillo y zoom miden al menos 24 px de alto', async ({
    page,
  }) => {
    await registrarAperturas(page);
    await arrancar(page, true);
    for (const id of ['#brillo', '#zoom']) {
      const caja = await page.locator(id).boundingBox();
      expect(caja, `${id} en pantalla`).not.toBeNull();
      expect(caja?.height ?? 0, `${id}: alto de la caja táctil`).toBeGreaterThanOrEqual(24);
    }
  });
});
