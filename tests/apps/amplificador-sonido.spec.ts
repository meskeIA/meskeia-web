import { test, expect, devices, type Page } from '@playwright/test';
import { esperarHidratacion, sembrarValor } from './_hidratacion';

/**
 * amplificador-sonido · inspector 14/11/2026 (primera inspección, segmento interactiva sin número).
 *
 * QUÉ PROMETE (h1 «Amplificador de Sonido en Vivo», metadata y bloque educativo): capta el sonido
 * con el micrófono, lo sube de volumen «hasta ×12» con un deslizador y realza la banda de la voz
 * (~1.000–3.000 Hz), con reducción de ruido opcional y un medidor que «avisa en rojo si el nivel es
 * alto». Al pulsar «Detener» el micrófono se libera. Avisa de acople (efecto Larsen) y de riesgo
 * auditivo en un DisclaimerCard no colapsable.
 *
 * LA CADENA (page.tsx): micrófono → GainNode → BiquadFilter «peaking» → compresor → analizador →
 * salida. De ahí salen, resueltos a mano ANTES de ejecutar la app:
 *   · ganancia = (deslizador / 100) × GAIN_MAX, con GAIN_MAX = 12 y el deslizador de 0 a 100.
 *     Por defecto 50 → ×6 → 20·log10(6) = 15,563 dB · máximo 100 → ×12 → 20·log10(12) = 21,584 dB ·
 *     mínimo 0 → ×0 → silencio (la salida es cero exacto).
 *   · realce de voz (activo por defecto): peaking a 1.800 Hz, Q 0,9, +9 dB; apagado → 0 dB.
 *     Con Q 0,9 el ancho es 2/ln2·asinh(1/(2·0,9)) = 1,53 octavas: 1.057–3.064 Hz, lo que dice
 *     el bloque educativo («~1.000–3.000 Hz»).
 *   · captura «cruda»: echoCancellation, noiseSuppression y autoGainControl a false.
 *
 * EL MEDIO ARRANCA DE VERDAD: con el micrófono simulado de Chromium (un pitido periódico casi a
 * fondo de escala) se comprueba la pista en 'live', el AudioContext en 'running', el valor del
 * GainNode y que la salida no es silencio; al detener, la pista en 'ended' y el contexto en
 * 'closed'. Un espía en addInitScript guarda los flujos, contextos y nodos que crea la página.
 *
 * PERMISO DENEGADO: lanzado sin --use-fake-ui-for-media-stream y con permissions [] (también con
 * grantPermissions([]) y con --deny-permission-prompts), el Chromium sin interfaz de Playwright
 * rechaza con NotSupportedError «Not supported», no con el NotAllowedError que da Chrome cuando
 * el usuario pulsa «Bloquear» (medido el 14/11/2026). Por eso el caso de rechazo emula ese
 * NotAllowedError: es lo que la app recibe en un navegador de verdad.
 *
 * El doble clic en «Iniciar amplificación» lo vigila el testigo de familia
 * tests/familias/apertura-medio-doble-clic.spec.ts.
 */

test.use({
  launchOptions: {
    args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'],
  },
  permissions: ['microphone'],
});

interface EspiaAudio {
  flujos: MediaStream[];
  restricciones: MediaStreamConstraints[];
  contextos: AudioContext[];
  ganancias: GainNode[];
  filtros: BiquadFilterNode[];
  analizadores: AnalyserNode[];
}

type VentanaEspia = Window & { __espia?: EspiaAudio };

/**
 * Guarda lo que crea la página: flujos de getUserMedia (y con qué restricciones), AudioContext,
 * GainNode, BiquadFilterNode y AnalyserNode. Con `contextoSuspendido`, cada AudioContext nace
 * suspendido y su resume() resuelve sin arrancarlo (la emulación del testigo
 * tests/familias/entrada-microfono.spec.ts, caso «resume no arranca»).
 */
async function espiar(page: Page, contextoSuspendido = false): Promise<void> {
  await page.addInitScript((suspendido: boolean) => {
    const espia: EspiaAudio = {
      flujos: [],
      restricciones: [],
      contextos: [],
      ganancias: [],
      filtros: [],
      analizadores: [],
    };
    (window as VentanaEspia).__espia = espia;
    const dispositivos = navigator.mediaDevices;
    if (dispositivos && dispositivos.getUserMedia) {
      const abrir = dispositivos.getUserMedia.bind(dispositivos);
      dispositivos.getUserMedia = async (c?: MediaStreamConstraints) => {
        espia.restricciones.push(JSON.parse(JSON.stringify(c ?? {})) as MediaStreamConstraints);
        const flujo = await abrir(c);
        espia.flujos.push(flujo);
        return flujo;
      };
    }
    const Original = window.AudioContext;
    class ContextoEspiado extends Original {
      constructor(opciones?: AudioContextOptions) {
        super(opciones);
        if (suspendido) void this.suspend();
        espia.contextos.push(this);
      }
    }
    window.AudioContext = ContextoEspiado;
    if (suspendido) {
      Original.prototype.resume = function () {
        return Promise.resolve();
      };
    }
    const proto = BaseAudioContext.prototype;
    const crearGanancia = proto.createGain;
    proto.createGain = function (this: BaseAudioContext) {
      const nodo = crearGanancia.call(this);
      espia.ganancias.push(nodo);
      return nodo;
    };
    const crearFiltro = proto.createBiquadFilter;
    proto.createBiquadFilter = function (this: BaseAudioContext) {
      const nodo = crearFiltro.call(this);
      espia.filtros.push(nodo);
      return nodo;
    };
    const crearAnalizador = proto.createAnalyser;
    proto.createAnalyser = function (this: BaseAudioContext) {
      const nodo = crearAnalizador.call(this);
      espia.analizadores.push(nodo);
      return nodo;
    };
  }, contextoSuspendido);
}

/** Foto del audio de la página: estado de cada pista y contexto, y los nodos de la última cadena. */
async function lectura(page: Page) {
  return page.evaluate(() => {
    const e = (window as VentanaEspia).__espia as EspiaAudio;
    const filtro = e.filtros.length ? e.filtros[e.filtros.length - 1] : null;
    const ganancia = e.ganancias.length ? e.ganancias[e.ganancias.length - 1] : null;
    const pistaViva = e.flujos
      .flatMap((f) => f.getAudioTracks())
      .filter((t) => t.readyState === 'live')
      .pop();
    return {
      pistas: e.flujos.map((f) => f.getAudioTracks().map((t) => t.readyState).join(',')),
      contextos: e.contextos.map((c) => c.state as string),
      ganancia: ganancia ? ganancia.gain.value : null,
      filtro: filtro
        ? {
            tipo: filtro.type as string,
            frecuencia: filtro.frequency.value,
            q: filtro.Q.value,
            ganancia: filtro.gain.value,
          }
        : null,
      restricciones: e.restricciones,
      supresionRuido: pistaViva ? (pistaViva.getSettings().noiseSuppression ?? null) : null,
    };
  });
}

/** RMS máximo de la salida ya amplificada (el analizador de la app) durante `ms` milisegundos. */
async function rmsMaximoSalida(page: Page, ms: number): Promise<number> {
  return page.evaluate(
    (duracion) =>
      new Promise<number>((resolver) => {
        const e = (window as VentanaEspia).__espia as EspiaAudio;
        const analizador = e.analizadores[e.analizadores.length - 1];
        const datos = new Uint8Array(analizador.fftSize);
        let maximo = 0;
        const inicio = performance.now();
        const paso = () => {
          analizador.getByteTimeDomainData(datos);
          let suma = 0;
          for (let i = 0; i < datos.length; i++) {
            const x = (datos[i] - 128) / 128;
            suma += x * x;
          }
          maximo = Math.max(maximo, Math.sqrt(suma / datos.length));
          if (performance.now() - inicio < duracion) requestAnimationFrame(paso);
          else resolver(maximo);
        };
        paso();
      }),
    ms,
  );
}

const dB = (ganancia: number) => 20 * Math.log10(ganancia);
const valorGanancia = (page: Page) => page.locator('label[for="ganancia"] span');
const estado = (page: Page) => page.getByRole('status');
const avisoApp = (page: Page) => page.locator('main').getByRole('alert');

async function abrir(page: Page): Promise<void> {
  await page.goto('/amplificador-sonido/');
  await esperarHidratacion(page, ['#ganancia']);
}

test('CASO 1 (normal) · con permiso arranca a ×6 = +15,56 dB con realce de voz, suena, y «Detener» suelta el micrófono', async ({
  page,
}) => {
  await espiar(page);
  await abrir(page);
  // Deslizador por defecto en 50 → 0,5 × 12 = ×6
  await expect(valorGanancia(page)).toHaveText('6,0×');
  await expect(estado(page)).toHaveText('Detenido');

  await page.getByRole('button', { name: /Iniciar amplificación/ }).click();
  await expect(page.getByRole('button', { name: /Detener/ })).toBeVisible();

  await expect.poll(async () => (await lectura(page)).contextos).toEqual(['running']);
  const l = await lectura(page);
  expect(l.pistas, 'una sola pista de micrófono, en directo').toEqual(['live']);
  expect(l.restricciones).toEqual([
    { audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } },
  ]);
  // GainNode: 6 → 20·log10(6) = 15,563 dB
  expect(l.ganancia).toBeCloseTo(6, 3);
  expect(dB(l.ganancia as number)).toBeCloseTo(15.56, 1);
  // Realce de voz: peaking 1.800 Hz, Q 0,9, +9 dB (activo por defecto)
  expect(l.filtro?.tipo).toBe('peaking');
  expect(l.filtro?.frecuencia).toBe(1800);
  expect(l.filtro?.q).toBeCloseTo(0.9, 3);
  expect(l.filtro?.ganancia).toBe(9);
  await expect(page.getByRole('button', { name: /Realce de voz/ })).toHaveAttribute('aria-pressed', 'true');
  await expect(estado(page)).toHaveText(/Amplificando sonido en directo|Nivel alto/);

  // La salida no es silencio: el pitido simulado va y viene, basta con que llegue
  await expect.poll(() => rmsMaximoSalida(page, 600), { timeout: 10000 }).toBeGreaterThan(0.01);

  await page.getByRole('button', { name: /Detener/ }).click();
  await expect(page.getByRole('button', { name: /Iniciar amplificación/ })).toBeVisible();
  await expect.poll(async () => (await lectura(page)).pistas).toEqual(['ended']);
  await expect.poll(async () => (await lectura(page)).contextos).toEqual(['closed']);
  await expect(estado(page)).toHaveText('Detenido');
});

test('CASO 2 (límite) · ×12 = +21,58 dB, ×0 = silencio, realce apagado en vivo, y parar y volver a arrancar con «Reducir ruido» ya puesto', async ({
  page,
}) => {
  await espiar(page);
  await abrir(page);
  await page.getByRole('button', { name: /Iniciar amplificación/ }).click();
  await expect.poll(async () => (await lectura(page)).contextos).toEqual(['running']);

  // Máximo: 100 → 1 × 12 = ×12 → 20·log10(12) = 21,584 dB
  await sembrarValor(page, '#ganancia', 100);
  await expect(valorGanancia(page)).toHaveText('12,0×');
  await expect.poll(async () => (await lectura(page)).ganancia).toBeCloseTo(12, 3);
  expect(dB((await lectura(page)).ganancia as number)).toBeCloseTo(21.58, 1);

  // Mínimo: 0 → ×0 → la salida es cero exacto
  await sembrarValor(page, '#ganancia', 0);
  await expect(valorGanancia(page)).toHaveText('0,0×');
  await expect.poll(async () => (await lectura(page)).ganancia).toBe(0);
  await expect.poll(() => rmsMaximoSalida(page, 600), { timeout: 8000 }).toBe(0);

  // Vuelta a 25 → 0,25 × 12 = ×3
  await sembrarValor(page, '#ganancia', 25);
  await expect(valorGanancia(page)).toHaveText('3,0×');
  await expect.poll(async () => (await lectura(page)).ganancia).toBeCloseTo(3, 3);

  // Realce de voz apagado en vivo → el peaking pasa a 0 dB
  await page.getByRole('button', { name: /Realce de voz/ }).click();
  await expect(page.getByRole('button', { name: /Realce de voz/ })).toHaveAttribute('aria-pressed', 'false');
  await expect.poll(async () => (await lectura(page)).filtro?.ganancia).toBe(0);

  // Parar, activar «Reducir ruido» con la amplificación parada y volver a arrancar
  await page.getByRole('button', { name: /Detener/ }).click();
  await expect.poll(async () => (await lectura(page)).pistas).toEqual(['ended']);
  await page.getByRole('button', { name: /Reducir ruido/ }).click();
  await expect(page.getByRole('button', { name: /Reducir ruido/ })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: /Iniciar amplificación/ }).click();
  await expect.poll(async () => (await lectura(page)).contextos).toEqual(['closed', 'running']);
  const l = await lectura(page);
  expect(l.pistas, 'la primera pista sigue cerrada y solo la nueva está viva').toEqual(['ended', 'live']);
  // La nueva cadena respeta lo elegido: ×3 y realce apagado; la captura pide y obtiene supresión
  expect(l.ganancia).toBeCloseTo(3, 3);
  expect(l.filtro?.ganancia).toBe(0);
  expect(l.restricciones[1]).toEqual({
    audio: { echoCancellation: false, noiseSuppression: true, autoGainControl: false },
  });
  expect(l.supresionRuido).toBe(true);

  await page.getByRole('button', { name: /Detener/ }).click();
  await expect.poll(async () => (await lectura(page)).pistas).toEqual(['ended', 'ended']);
  await expect.poll(async () => (await lectura(page)).contextos).toEqual(['closed', 'closed']);
});

test('CASO 4 (rechazo) · permiso denegado (NotAllowedError, el de Chrome al pulsar «Bloquear»): lo dice y no se queda a medias', async ({
  page,
}) => {
  await page.addInitScript(() => {
    MediaDevices.prototype.getUserMedia = () =>
      Promise.reject(new DOMException('Permission denied', 'NotAllowedError'));
  });
  await abrir(page);
  await page.getByRole('button', { name: /Iniciar amplificación/ }).click();
  await expect(avisoApp(page)).toHaveText(
    '⚠️ Permiso de micrófono denegado. Permite el acceso al micrófono en tu navegador para usar el amplificador.',
  );
  await expect(estado(page)).toHaveText('Detenido');
  await expect(page.getByRole('button', { name: /Iniciar amplificación/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /Detener/ })).toHaveCount(0);
});

test.describe('en móvil (Pixel 7)', () => {
  const pixel = devices['Pixel 7'];
  test.use({
    viewport: pixel.viewport,
    userAgent: pixel.userAgent,
    deviceScaleFactor: pixel.deviceScaleFactor,
    isMobile: pixel.isMobile,
    hasTouch: pixel.hasTouch,
  });

  test('CASO 3 (móvil) · arranca con un toque, el deslizador al extremo da ×12 y «Detener» suelta el micrófono', async ({
    page,
  }) => {
    await espiar(page);
    await abrir(page);
    // Sin desbordamiento horizontal en 412 px
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(412);

    await page.getByRole('button', { name: /Iniciar amplificación/ }).tap();
    await expect(page.getByRole('button', { name: /Detener/ })).toBeVisible();
    await expect.poll(async () => (await lectura(page)).contextos).toEqual(['running']);
    expect((await lectura(page)).pistas).toEqual(['live']);
    expect((await lectura(page)).ganancia).toBeCloseTo(6, 3);

    // Toque en el extremo derecho del deslizador → 100 → ×12
    const deslizador = page.locator('#ganancia');
    await deslizador.scrollIntoViewIfNeeded();
    const caja = await deslizador.boundingBox();
    expect(caja).not.toBeNull();
    if (!caja) return;
    await page.touchscreen.tap(caja.x + caja.width - 2, caja.y + caja.height / 2);
    await expect(valorGanancia(page)).toHaveText('12,0×');
    await expect.poll(async () => (await lectura(page)).ganancia).toBeCloseTo(12, 3);

    await page.getByRole('button', { name: /Detener/ }).tap();
    await expect(page.getByRole('button', { name: /Iniciar amplificación/ })).toBeVisible();
    await expect.poll(async () => (await lectura(page)).pistas).toEqual(['ended']);
    await expect.poll(async () => (await lectura(page)).contextos).toEqual(['closed']);
  });

  test('HALLAZGO (14/11/2026, ABIERTO) · si el navegador no arranca el AudioContext, la app dice «Amplificando» sin sonido y sin aviso', async ({
    page,
  }) => {
    // Emulación del testigo tests/familias/entrada-microfono.spec.ts («resume no arranca»): el
    // contexto nace suspendido y resume() resuelve sin arrancarlo (Safari de iOS, o el contexto
    // 'interrupted' tras una llamada). La app hace `await ctx.resume()` y no mira el estado:
    // hoy, pista 'live', contexto 'suspended', «Amplificando sonido en directo» y ningún aviso.
    // La receta de la familia es mantenerAudioEnMarcha (lib/useEntradaAudio.ts), que avisa
    // «El navegador no ha arrancado el audio…»; el testigo no lista esta app.
    test.fail();
    await espiar(page, true);
    await abrir(page);
    await page.getByRole('button', { name: /Iniciar amplificación/ }).tap();
    await expect.poll(async () => (await lectura(page)).pistas).toEqual(['live']);
    expect((await lectura(page)).contextos).toEqual(['suspended']);
    await expect(avisoApp(page)).toHaveText(/no ha arrancado el audio/, { timeout: 4000 });
  });
});

test('HALLAZGO (14/11/2026, ABIERTO) · «Reducir ruido» pulsado con la amplificación en marcha no reduce nada en Chromium', async ({
  page,
}) => {
  // La app llama a track.applyConstraints({ noiseSuppression: true }): resuelve, getConstraints()
  // lo refleja, pero getSettings().noiseSuppression sigue en false hasta que se detiene y se vuelve
  // a iniciar (el CASO 2 comprueba que al reabrir sí se aplica). El botón queda aria-pressed=true
  // y la app no dice que haga falta reiniciar. La guía (paso 5, después de iniciar en el paso 2)
  // y el caso «Restaurante» mandan activarlo con la amplificación en marcha.
  test.fail();
  await espiar(page);
  await abrir(page);
  await page.getByRole('button', { name: /Iniciar amplificación/ }).click();
  await expect.poll(async () => (await lectura(page)).contextos).toEqual(['running']);
  expect((await lectura(page)).supresionRuido).toBe(false);
  await page.getByRole('button', { name: /Reducir ruido/ }).click();
  await expect(page.getByRole('button', { name: /Reducir ruido/ })).toHaveAttribute('aria-pressed', 'true');
  // La pista viva (la de ahora o la de un micrófono reabierto) debe llevar la supresión puesta
  await expect.poll(async () => (await lectura(page)).supresionRuido, { timeout: 3000 }).toBe(true);
});

test('HALLAZGO (14/11/2026, ABIERTO) · fuera de «permiso denegado» y «sin micrófono», el aviso es el mensaje técnico del navegador en inglés', async ({
  page,
}) => {
  // Hoy: micrófono ocupado por otra app o una llamada (NotReadableError) → «No se pudo iniciar el
  // audio: Could not start audio source»; navegador sin navigator.mediaDevices (contexto no
  // seguro, navegador antiguo) → «No se pudo iniciar el audio: Cannot read properties of
  // undefined (reading 'getUserMedia')».
  test.fail();
  await page.addInitScript(() => {
    MediaDevices.prototype.getUserMedia = () =>
      Promise.reject(new DOMException('Could not start audio source', 'NotReadableError'));
  });
  await abrir(page);
  await page.getByRole('button', { name: /Iniciar amplificación/ }).click();
  await expect(avisoApp(page)).toBeVisible();
  await expect(avisoApp(page)).not.toHaveText(/Could not start|Cannot read|undefined/);

  await page.addInitScript(() => {
    Object.defineProperty(Navigator.prototype, 'mediaDevices', { get: () => undefined, configurable: true });
  });
  await abrir(page);
  await page.getByRole('button', { name: /Iniciar amplificación/ }).click();
  await expect(avisoApp(page)).toBeVisible();
  await expect(avisoApp(page)).not.toHaveText(/Could not start|Cannot read|undefined/);
});

test('HALLAZGO (14/11/2026, ABIERTO) · la región viva role="status" alterna «Nivel alto» y «Amplificando» al ritmo del sonido', async ({
  page,
}) => {
  // Con el pitido simulado y la ganancia por defecto (×6), el texto de la región aria-live
  // cambió 18 veces en 5 s (medido el 14/11/2026): un lector de pantalla lo anunciaría sin parar
  // encima del sonido amplificado. Esperado: como mucho un cambio por segundo (4 en 4 s).
  test.fail();
  await espiar(page);
  await abrir(page);
  await page.getByRole('button', { name: /Iniciar amplificación/ }).click();
  await expect.poll(async () => (await lectura(page)).contextos).toEqual(['running']);
  const cambios = await page.evaluate(
    () =>
      new Promise<number>((resolver) => {
        const region = document.querySelector('[role="status"]') as HTMLElement;
        let n = 0;
        const observador = new MutationObserver(() => {
          n += 1;
        });
        observador.observe(region, { childList: true, subtree: true, characterData: true });
        setTimeout(() => {
          observador.disconnect();
          resolver(n);
        }, 4000);
      }),
  );
  expect(cambios).toBeLessThanOrEqual(4);
});

test('HALLAZGO (14/11/2026, ABIERTO) · la FAQ visible dice que «amplifica por igual todo el sonido», con el realce de voz de +9 dB activo por defecto', async ({
  page,
}) => {
  // «¿Sustituye a un audífono?» (visible) y «¿Sustituye a un audífono o aparato auditivo?»
  // (faqJsonLd) son la misma pregunta con dos respuestas; igual «¿Necesito auriculares de
  // verdad?» frente a «¿Necesito auriculares para usarlo?». Solo la visible afirma que la
  // herramienta amplifica por igual todo el sonido, y el peaking de 1.800 Hz (+9 dB) y el
  // compresor dicen lo contrario.
  test.fail();
  await abrir(page);
  await expect(page.getByText('amplifica por igual todo el sonido')).toHaveCount(0);
});
