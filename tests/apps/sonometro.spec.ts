import { test, expect, devices, type Browser, type Page } from '@playwright/test';

/**
 * Sonómetro — test de regresión (Inspector; 1.ª pasada 24/08/2026, 2.ª pasada 24/08/2026)
 *
 * Segmento «interactiva sin número»: es un SENSOR de micrófono, así que no hay una casilla
 * donde teclear un dato y comprobar el resultado a mano. Se audita la OPERATIVA —que el
 * medio arranque de verdad, que falle avisando, que suelte el micrófono y que sirva en un
 * móvil— y, sustituyendo el micrófono por una señal de nivel conocido, también lo que la
 * app promete medir.
 *
 * QUÉ PROMETE (de aquí salen los valores esperados de este fichero):
 *   - <h1> «Sonómetro» + subtítulo: «mide el nivel de ruido en decibelios ponderados A
 *     —dB(A), los de la normativa— con tu micrófono».
 *   - Rótulo de la lectura grande: «dB(A)». Estadísticas: «Mínimo (dB(A))», «Máximo (dB(A))»,
 *     «LAeq (dB(A))».
 *   - metadata.ts → jsonLd.features: «Medición del nivel sonoro en tiempo real con el
 *     micrófono del dispositivo», «LAeq … promedio energético de la sesión», «Valores mínimo,
 *     máximo y duración acumulada de la medición», «Calibración manual ajustable (60-120 dB)
 *     que se recuerda en el navegador», «Procesamiento local: el audio no se graba ni se
 *     envía a ningún servidor».
 *   - Tabla de referencia de la propia app: «Muy silencioso 0-30», «Silencioso 30-50»,
 *     «Moderado 50-60», «Algo ruidoso 60-70», «Ruidoso 70-85», «Muy ruidoso 85-100»,
 *     «Peligroso 100-130».
 *   - Bloque educativo: manda comparar la lectura con los 30-35 dB del límite interior
 *     nocturno, con los «menos de 30 dB» de la OMS para el cuarto de un bebé y con los
 *     85 dB(A) laborales, y avisa de que «confundir dB con dB(A)» es un error frecuente.
 *
 * CÓMO SE PRUEBA UNA APP DE MICRÓFONO: Chromium arranca con
 * `--use-fake-device-for-media-stream` (audio sintético) y `--use-fake-ui-for-media-stream`
 * (concede el permiso sin diálogo). Que exista el botón NO prueba nada: en los tres casos se
 * comprueba que el medio arranca de verdad — `AudioContext.state === 'running'`, la pista del
 * stream en `readyState === 'live'` y las cifras avanzando entre dos lecturas separadas.
 *
 * CÓMO SE MIDE UN NIVEL CONOCIDO: en vez del micrófono se le entrega a la app un stream
 * sintético (oscilador → ganancia → MediaStreamDestination). Con una senoide de amplitud A el
 * valor que la app DEBE mostrar sale de su propia fórmula (page.tsx, `calculateDb`):
 * 20·log₁₀(A/√2) + calibración, con la calibración por defecto de 90 dB; y a eso se le suma la
 * ponderación A de la frecuencia elegida (IEC 61672-1), que por definición vale 0 dB a 1 kHz.
 *
 * ESTADO DE LOS 7 HALLAZGOS DE LA 1.ª PASADA — los 7 verificados REPARADOS el 24/08/2026:
 *   1 (suelo de 44,9 dB por leer 8 bits) → CASO 1: 61,0 / 33,0 / 13,0 dB(A) clavados.
 *   2 (rotulaba dB(A) sin ponderar)      → CASO 2: la A de la IEC 61672 con 0,2 dB de error.
 *   3 (TypeError en crudo sin mediaDevices) → REGRESIÓN A.
 *   4 (Detener borraba el resumen)       → CASO 3.
 *   5 (9 emojis sin aria-hidden)         → `node scripts/check-a11y-jsx.mjs app/sonometro/page.tsx`
 *                                          da 0 incumplimientos obligatorios; no se duplica aquí.
 *   6 (el micrófono seguía abierto tras fallar) → REGRESIÓN B.
 *   7 (aviso de error mudo)              → REGRESIÓN C.
 *
 * HALLAZGOS ABIERTOS de la 2.ª pasada: al final, marcados con `test.fail()`. Afirman lo que
 * DEBERÍA pasar y hoy fallan a propósito; el día que se reparen se les quita el `test.fail()`
 * y se quedan como regresión.
 */

test.use({
  launchOptions: {
    args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream'],
  },
  permissions: ['microphone'],
});

const RUTA = '/sonometro/';

/** Calibración por defecto de la app (CALIBRACION_DEFECTO en page.tsx). */
const CALIBRACION = 90;

/** Ponderación A en dB a una frecuencia (IEC 61672-1). Vale 0 dB a 1 kHz por definición. */
function ponderacionA(f: number): number {
  const f2 = f * f;
  const numerador = 12194 ** 2 * f2 * f2;
  const denominador =
    (f2 + 20.6 ** 2) * Math.sqrt((f2 + 107.7 ** 2) * (f2 + 737.9 ** 2)) * (f2 + 12194 ** 2);
  return 20 * Math.log10(numerador / denominador) + 2.0;
}

/** Lo que la app debe mostrar para una senoide de amplitud A a la frecuencia f. */
const nivelEsperado = (amplitud: number, frecuencia: number): number =>
  20 * Math.log10(amplitud / Math.SQRT2) + CALIBRACION + ponderacionA(frecuencia);

interface SondaSonometro {
  ctxs: AudioContext[];
  streams: MediaStream[];
}

declare global {
  interface Window {
    __son?: SondaSonometro;
  }
}

/**
 * Sustituye el micrófono por una senoide de frecuencia y amplitud conocidas.
 *
 * ⚠️ Se añade SIEMPRE ANTES de `instrumentar`: así captura el `AudioContext` original y su
 * propio contexto no se cuela en la sonda (si no, el contexto del oscilador quedaría contado
 * como si fuera de la app y nunca se cerraría). El contexto se reanuda dentro del propio
 * getUserMedia, que la app llama desde el clic, para heredar el gesto del usuario: arrancado
 * fuera de él quedaría suspendido y entregaría silencio.
 */
async function micrófonoSintético(page: Page, frecuencia: number, amplitud: number): Promise<void> {
  await page.addInitScript(
    ([hz, amp]) => {
      const OriginalAudioContext = window.AudioContext;
      let ctx: AudioContext | null = null;
      let destino: MediaStreamAudioDestinationNode | null = null;
      navigator.mediaDevices.getUserMedia = async () => {
        if (!ctx) {
          ctx = new OriginalAudioContext();
          const oscilador = ctx.createOscillator();
          oscilador.type = 'sine';
          oscilador.frequency.value = hz;
          const ganancia = ctx.createGain();
          ganancia.gain.value = amp;
          destino = ctx.createMediaStreamDestination();
          oscilador.connect(ganancia).connect(destino);
          oscilador.start();
        }
        await ctx.resume();
        return (destino as MediaStreamAudioDestinationNode).stream;
      };
    },
    [frecuencia, amplitud],
  );
}

/**
 * Deja una sonda sobre AudioContext y getUserMedia ANTES de que cargue la app, para poder
 * mirar el medio real y no el DOM que lo envuelve.
 */
async function instrumentar(page: Page): Promise<void> {
  await page.addInitScript(() => {
    window.__son = { ctxs: [], streams: [] };
    const OriginalAudioContext = window.AudioContext;
    const parche = function (...args: ConstructorParameters<typeof AudioContext>) {
      const ctx = new OriginalAudioContext(...args);
      window.__son?.ctxs.push(ctx);
      return ctx;
    };
    window.AudioContext = parche as unknown as typeof AudioContext;

    const md = navigator.mediaDevices;
    const getUserMediaOriginal = md.getUserMedia.bind(md);
    md.getUserMedia = async (restricciones?: MediaStreamConstraints) => {
      const stream = await getUserMediaOriginal(restricciones);
      window.__son?.streams.push(stream);
      return stream;
    };
  });
}

/** Estado REAL del medio: contextos de audio abiertos y pistas del micrófono. */
function estadoDelMedio(page: Page) {
  return page.evaluate(() => ({
    contextos: (window.__son?.ctxs ?? []).map((c) => c.state),
    pistas: (window.__son?.streams ?? []).flatMap((s) =>
      s.getTracks().map((t) => ({ tipo: t.kind, estado: t.readyState })),
    ),
  }));
}

/** Lectura digital grande, tal cual se ve (formato español: coma decimal). */
const lecturaTexto = (page: Page) => page.locator('[class*="dbValue"]');

/** La misma lectura como número, para poder compararla con un valor calculado. */
async function lecturaNumero(page: Page): Promise<number> {
  const texto = (await lecturaTexto(page).innerText()).trim();
  return Number(texto.replace(/\./g, '').replace(',', '.'));
}

/** Las tres tarjetas de estadísticas, en el orden del DOM: mínimo, máximo, LAeq. */
async function estadisticas(page: Page): Promise<{ min: string; max: string; laeq: string; duracion: string }> {
  const [min, max, laeq] = (await page.locator('[class*="statValue"]').allInnerTexts()).map((t) =>
    t.trim(),
  );
  const nota = (await page.locator('[class*="laeqNota"]').innerText()).replace(/\s+/g, ' ');
  return { min, max, laeq, duracion: nota.match(/de los últimos (.+?)\./)?.[1] ?? '(?)' };
}

/** El micrófono simulado tarda unas décimas: hasta que el contexto corre no hay medición. */
async function esperarMedicionEnMarcha(page: Page): Promise<void> {
  await expect
    .poll(
      async () => {
        const medio = await estadoDelMedio(page);
        return (
          medio.contextos.includes('running') &&
          medio.pistas.some((p) => p.tipo === 'audio' && p.estado === 'live')
        );
      },
      { timeout: 15000, message: 'el micrófono no llegó a entregar audio' },
    )
    .toBe(true);
}

/** Mide una senoide en una pestaña limpia y devuelve lo que muestra la app. */
async function medirTono(
  browser: Browser,
  frecuencia: number,
  amplitud: number,
): Promise<{ db: number; etiqueta: string }> {
  const contexto = await browser.newContext({ permissions: ['microphone'] });
  const pagina = await contexto.newPage();
  await micrófonoSintético(pagina, frecuencia, amplitud);
  await pagina.goto(RUTA);
  await pagina.getByRole('button', { name: /Iniciar medición/i }).click();
  await expect(lecturaTexto(pagina)).not.toHaveText('--');
  await pagina.waitForTimeout(1500); // que se asiente: el nivel es constante, no hace falta más
  const db = await lecturaNumero(pagina);
  const etiqueta = (await pagina.locator('[class*="levelLabel"]').textContent())?.trim() ?? '';
  await contexto.close();
  return { db, etiqueta };
}

// ---------------------------------------------------------------------------
// CASO 1 (normal) — mide un nivel conocido en las tres franjas y suelta el micrófono
// ---------------------------------------------------------------------------
// Ataca el hallazgo 1 de la 1.ª pasada: la app leía el audio con `getByteTimeDomainData`
// (8 bits) y por debajo de ~50 dB dejaba de seguir a la señal, plantándose en un suelo de
// 44,9 dB. Con ese suelo las dos franjas bajas de la tabla de la propia app —«Muy silencioso
// 0-30» y «Silencioso 30-50»— eran INALCANZABLES, y son justo las que su bloque educativo
// manda comparar con el límite interior nocturno (30-35 dB) y con los «menos de 30 dB» que la
// OMS recomienda para el cuarto de un bebé.
test('CASO 1 (normal) — arranca de verdad, clava el nivel en las tres franjas y libera el micrófono', async ({
  page,
  browser,
}) => {
  // 1 kHz y amplitud 0,002. Valor esperado calculado a mano con la fórmula de la propia app:
  // 20·log₁₀(0,002/√2) + 90 = 33,01 dB, y la ponderación A a 1 kHz es 0 dB por definición.
  const AMPLITUD = 0.002;
  const ESPERADO = 33.01;
  expect(nivelEsperado(AMPLITUD, 1000)).toBeCloseTo(ESPERADO, 2);

  await micrófonoSintético(page, 1000, AMPLITUD);
  await instrumentar(page);

  // Vigilancia de red: nada debe salir hacia otro servidor mientras el micrófono está
  // abierto, ni irse en el cuerpo de ninguna petición (un segundo de audio ya pasa de 1 KB).
  const peticiones: string[] = [];
  page.on('request', (r) => {
    const cuerpo = r.postData() ?? '';
    const ajena = !['localhost', '127.0.0.1'].includes(new URL(r.url()).hostname);
    if (ajena || cuerpo.length > 1024) {
      peticiones.push(`${r.method()} ${r.url()} (${cuerpo.length} B)`);
    }
  });

  await page.goto(RUTA);

  // Antes de pulsar nada. Los tres literales salen de page.tsx: la lectura es '--' mientras
  // isActive es false, la etiqueta de nivel es 'Esperando...' y el aviso de permiso solo
  // aparece con permissionState === 'prompt'.
  await expect(page.locator('h1')).toHaveText('Sonómetro');
  await expect(lecturaTexto(page)).toHaveText('--');
  await expect(page.locator('[class*="dbUnit"]')).toHaveText('dB(A)');
  await expect(page.locator('[class*="levelLabel"]')).toHaveText('Esperando...');
  await expect(page.locator('[class*="infoMessage"]')).toContainText(
    'Se solicitará permiso para acceder al micrófono',
  );
  expect(await estadoDelMedio(page)).toEqual({ contextos: [], pistas: [] });

  await page.getByRole('button', { name: /Iniciar medición/i }).click();
  await esperarMedicionEnMarcha(page);
  await page.waitForTimeout(1500);

  // 33,0 dB(A): la app entra en la franja «Silencioso 30-50» de su propia tabla, que con el
  // suelo de 44,9 dB no podía alcanzar jamás.
  expect(await lecturaNumero(page)).toBeCloseTo(ESPERADO, 0);
  await expect(page.locator('[class*="levelLabel"]')).toHaveText('Silencioso');
  await expect(page.locator('[class*="referenceRow"][class*="activeRow"]')).toContainText(
    '30-50 dB',
  );

  // Los tres rótulos llevan la (A) porque desde la reparación el motor pondera de verdad.
  const estadisticasPanel = page.locator('[class*="statsPanel"]');
  await expect(estadisticasPanel).toContainText('Mínimo (dB(A))');
  await expect(estadisticasPanel).toContainText('Máximo (dB(A))');
  await expect(estadisticasPanel).toContainText('LAeq (dB(A))');

  // Que la sesión AVANZA: la duración acumulada y el LAeq integran y tienen que moverse.
  const notaInicial = await page.locator('[class*="laeqNota"]').innerText();
  await page.waitForTimeout(2000);
  await expect
    .poll(() => page.locator('[class*="laeqNota"]').innerText(), {
      timeout: 5000,
      message: 'la duración acumulada no avanzó: el bucle de medición no está corriendo',
    })
    .not.toBe(notaInicial);

  // Promesa de metadata.ts: «el audio no se graba ni se envía a ningún servidor». Nada sale
  // del origen de la página mientras mide, y ninguna petición lleva un cuerpo que pudiera
  // contener audio.
  expect(peticiones, 'algo salió a la red mientras el micrófono estaba abierto').toEqual([]);

  // Detener tiene que apagar el micrófono de verdad (pista 'ended' y contexto 'closed'): en un
  // móvil es lo que evita que siga consumiendo y que quede encendido el indicador de grabación.
  await page.getByRole('button', { name: /Detener/i }).click();
  await expect
    .poll(async () => (await estadoDelMedio(page)).pistas.every((p) => p.estado === 'ended'), {
      timeout: 5000,
      message: 'la pista del micrófono siguió viva tras pulsar Detener',
    })
    .toBe(true);
  expect((await estadoDelMedio(page)).contextos).toEqual(['closed']);
  await expect(lecturaTexto(page)).toHaveText('--');

  // Y las otras dos franjas del extremo bajo y medio, en pestañas limpias:
  //   amplitud 0,05   → 20·log₁₀(0,05/√2)   + 90 = 60,97 dB → «Algo ruidoso» (60-70)
  //   amplitud 0,0002 → 20·log₁₀(0,0002/√2) + 90 = 13,01 dB → «Muy silencioso» (0-30)
  const alto = await medirTono(browser, 1000, 0.05);
  expect(alto.db).toBeCloseTo(60.97, 0);
  expect(alto.etiqueta).toBe('Algo ruidoso');

  const bajo = await medirTono(browser, 1000, 0.0002);
  expect(bajo.db).toBeCloseTo(13.01, 0);
  expect(bajo.etiqueta).toBe('Muy silencioso');
});

// ---------------------------------------------------------------------------
// CASO 2 (límite) — la «A» de dB(A) tiene que ser la ponderación A de verdad
// ---------------------------------------------------------------------------
// Ataca el hallazgo 2 de la 1.ª pasada: la app rotulaba «LAeq» y remitía a límites en dB(A)
// (85 dB(A) laborales, 45 dB(A) nocturnos) mientras el motor era un RMS de banda ancha sin
// ponderar — el error del que ella misma avisa en su caja de errores frecuentes («Confundir
// dB con dB(A)»). Antes, dos senoides de la misma amplitud a 1 kHz y a 100 Hz salían iguales
// (61,1 y 61,0). Se prueban las dos direcciones de la curva: 100 Hz, donde la A resta mucho,
// y 4 kHz, donde SUMA — un simple filtro de graves pasaría lo primero y fallaría lo segundo.
test('CASO 2 (límite) — 100 Hz pesa 19 dB menos y 4 kHz casi 1 dB más que 1 kHz', async ({
  browser,
}) => {
  const AMPLITUD = 0.05;

  // Valores calculados a mano con la fórmula de la IEC 61672-1 (la misma que implementa
  // page.tsx en `ponderacionA`), sobre el nivel sin ponderar de 60,97 dB:
  //   A(100 Hz)  = −19,15 dB → 41,82 dB(A)
  //   A(1000 Hz) =   0,00 dB → 60,97 dB(A)
  //   A(4000 Hz) =  +0,96 dB → 61,93 dB(A)
  expect(ponderacionA(100)).toBeCloseTo(-19.15, 1);
  expect(ponderacionA(4000)).toBeCloseTo(0.96, 1);

  const a1000 = await medirTono(browser, 1000, AMPLITUD);
  expect(a1000.db).toBeCloseTo(60.97, 0);

  const a100 = await medirTono(browser, 100, AMPLITUD);
  expect(a100.db).toBeCloseTo(41.82, 0);
  // 42 dB(A) cae en «Silencioso 30-50»: un zumbido de 100 Hz que sin ponderar se anunciaba
  // como «Algo ruidoso» al mismo nivel que la voz.
  expect(a100.etiqueta).toBe('Silencioso');

  // A 4 kHz la ponderación A SUMA. Que la lectura SUBA respecto de 1 kHz es lo que distingue
  // una ponderación A real de un simple recorte de graves.
  const a4000 = await medirTono(browser, 4000, AMPLITUD);
  expect(a4000.db).toBeCloseTo(61.93, 0);
  expect(a4000.db - a1000.db, 'a 4 kHz la ponderación A suma, no resta').toBeGreaterThan(0.3);
});

// ---------------------------------------------------------------------------
// CASO 3 (móvil, Pixel 7) — es el aparato con el que se mide ruido de verdad
// ---------------------------------------------------------------------------
// Se copian solo las propiedades del dispositivo: `defaultBrowserType` obligaría a un worker
// nuevo y Playwright no lo admite dentro de un describe (el navegador ya lo fija
// playwright.config.ts, que solo tiene el proyecto chromium).
const PIXEL_7 = {
  viewport: devices['Pixel 7'].viewport,
  userAgent: devices['Pixel 7'].userAgent,
  deviceScaleFactor: devices['Pixel 7'].deviceScaleFactor,
  isMobile: devices['Pixel 7'].isMobile,
  hasTouch: devices['Pixel 7'].hasTouch,
};

test.describe('CASO 3 (móvil)', () => {
  test.use(PIXEL_7);

  // Ataca el hallazgo 4 de la 1.ª pasada: el panel de estadísticas colgaba de `isActive`, así
  // que pulsar «Detener» borraba el mínimo, el máximo, el LAeq y la duración justo al terminar
  // la sesión. La app pide medir «al menos 5 minutos seguidos» y comparar con la ordenanza, y
  // su guía sorteaba el problema pidiendo la captura de pantalla «mientras está midiendo».
  test('en un Pixel 7 mide de un toque, y al detener el resumen se congela a la vista', async ({
    page,
  }) => {
    await instrumentar(page);
    await page.goto(RUTA);

    // Objetivo táctil: mínimo 44 px de alto (WCAG 2.5.5 / criterio del proyecto).
    const boton = page.getByRole('button', { name: /Iniciar medición/i });
    const caja = await boton.boundingBox();
    expect(caja, 'el botón de iniciar no es visible en móvil').not.toBeNull();
    expect(caja!.height).toBeGreaterThanOrEqual(44);

    // Sin desbordamiento horizontal: la aguja y la escala son anchas y es donde se rompería.
    const anchos = await page.evaluate(() => ({
      documento: document.documentElement.scrollWidth,
      ventana: window.innerWidth,
    }));
    expect(anchos.documento).toBeLessThanOrEqual(anchos.ventana + 1);

    await boton.tap();
    await esperarMedicionEnMarcha(page);
    await page.waitForTimeout(2500);
    await expect(lecturaTexto(page)).toHaveText(/^\d{1,3},\d$/);

    const midiendo = await estadisticas(page);
    expect(midiendo.duracion, 'la duración no arrancó').not.toBe('0 s');

    // Y sigue sin desbordar con el panel de estadísticas ya desplegado.
    const anchosMidiendo = await page.evaluate(() => ({
      documento: document.documentElement.scrollWidth,
      ventana: window.innerWidth,
    }));
    expect(anchosMidiendo.documento).toBeLessThanOrEqual(anchosMidiendo.ventana + 1);

    // Detener: el resumen SIGUE, y congelado (dos lecturas separadas 1,5 s son idénticas).
    await page.getByRole('button', { name: /Detener/i }).tap();
    await page.waitForTimeout(300);
    const trasDetener = await estadisticas(page);
    await page.waitForTimeout(1500);
    const trasDetenerOtraVez = await estadisticas(page);

    await expect(page.locator('[class*="statsPanel"]')).toContainText('LAeq (dB(A))');
    expect(trasDetener.max).not.toBe('--');
    expect(trasDetener.duracion).not.toBe('0 s');
    expect(trasDetenerOtraVez, 'el resumen tiene que quedarse quieto tras detener').toEqual(
      trasDetener,
    );
    await expect(lecturaTexto(page)).toHaveText('--'); // la lectura EN VIVO sí se apaga

    // Y el micrófono queda cerrado de verdad.
    await expect
      .poll(async () => (await estadoDelMedio(page)).pistas.every((p) => p.estado === 'ended'), {
        timeout: 5000,
        message: 'la pista del micrófono siguió viva tras pulsar Detener',
      })
      .toBe(true);

    // Volver a empezar arranca una sesión NUEVA, no continúa la anterior.
    await page.getByRole('button', { name: /Iniciar medición/i }).tap();
    await esperarMedicionEnMarcha(page);
    await page.waitForTimeout(800);
    const segunda = await estadisticas(page);
    expect(segunda.duracion, 'la segunda sesión arrastró la duración de la primera').not.toBe(
      trasDetener.duracion,
    );
  });
});

// ===========================================================================
// REGRESIÓN — hallazgos de la 1.ª pasada (24/08/2026), reparados el mismo día
// ===========================================================================

// REGRESIÓN A (hallazgo 3) — cuando el navegador no expone `navigator.mediaDevices` (visita
// por HTTP sin cifrar, WebView antiguo), la llamada revienta con un TypeError que la rama
// `else` del catch interpolaba tal cual: al usuario le salía un mensaje del motor de
// JavaScript. Los otros dos fallos previstos (permiso denegado, sin micrófono) sí tenían
// texto propio; este, que es el tercero previsible, no.
// Caso: navigator.mediaDevices indefinido → esperado un aviso que hable del navegador ·
//       obtenido «Error: Cannot read properties of undefined (reading 'getUserMedia')».
test('REGRESIÓN A — sin soporte del navegador el aviso es legible, no un TypeError', async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'mediaDevices', { value: undefined, configurable: true });
  });
  await page.goto(RUTA);
  await page.getByRole('button', { name: /Iniciar medición/i }).click();

  const aviso = page.locator('[class*="errorMessage"]');
  await expect(aviso).toBeVisible();
  await expect(aviso).not.toContainText('Cannot read properties');
  await expect(aviso).toContainText(
    'Este navegador no permite acceder al micrófono desde la página.',
  );
});

// REGRESIÓN B (hallazgo 6) — si algo falla DESPUÉS de que el usuario conceda el micrófono, el
// `catch` de startMeasuring solo pintaba el error y nunca llamaba a stopMeasuring: el stream
// se quedaba abierto. La app decía que no estaba midiendo mientras el indicador de grabación
// del sistema seguía encendido, y su argumento de venta es que «el audio no se graba ni se
// envía a ningún servidor». Disparador realista: un navegador sin `AudioContext` sin prefijo
// (Safari iOS antiguo, donde solo existe `webkitAudioContext`, que la app tampoco contempla).
// Caso: el constructor de AudioContext lanza tras conceder el permiso → esperado pista
//       'ended' (micrófono liberado) · obtenido 'live'.
test('REGRESIÓN B — si falla tras conceder el permiso, el micrófono queda cerrado', async ({
  page,
}) => {
  await instrumentar(page);
  await page.addInitScript(() => {
    window.AudioContext = function () {
      throw new Error('AudioContext no disponible');
    } as unknown as typeof AudioContext;
  });
  await page.goto(RUTA);
  await page.getByRole('button', { name: /Iniciar medición/i }).click();

  await expect(page.locator('[class*="errorMessage"]')).toBeVisible();
  await expect
    .poll(async () => (await estadoDelMedio(page)).pistas.map((p) => p.estado), {
      timeout: 5000,
      message: 'el micrófono se quedó abierto después de que la app diera el error',
    })
    .toEqual(['ended']);
});

// REGRESIÓN C (hallazgo 7) — el aviso de error es la ÚNICA señal de que no se está midiendo
// (el botón no cambia, el foco no se mueve, la lectura sigue en '--') y se pintaba en un <div>
// sin `role="alert"` ni `aria-live`: con lector de pantalla, que te denieguen el micrófono no
// anunciaba absolutamente nada. Regla del CLAUDE.md global §5.
// Caso: permiso denegado → esperado el aviso anunciado (role="alert" o aria-live) ·
//       obtenido un <div> mudo.
test('REGRESIÓN C — el permiso denegado se anuncia a la ayuda técnica y no rompe nada', async ({
  page,
}) => {
  const erroresDeJs: string[] = [];
  page.on('pageerror', (e) => erroresDeJs.push(e.message));

  await instrumentar(page);
  // El navegador real rechaza con NotAllowedError cuando el usuario deniega el micrófono.
  await page.addInitScript(() => {
    navigator.mediaDevices.getUserMedia = () =>
      Promise.reject(new DOMException('Permission denied', 'NotAllowedError'));
  });
  await page.goto(RUTA);
  await page.getByRole('button', { name: /Iniciar medición/i }).click();

  const aviso = page.locator('[class*="errorMessage"]');
  await expect(aviso).toContainText(
    'Permiso de micrófono denegado. Permite el acceso en la configuración del navegador.',
  );
  const seAnuncia = await aviso.evaluate(
    (el) => el.getAttribute('role') === 'alert' || el.hasAttribute('aria-live'),
  );
  expect(seAnuncia, 'el aviso tiene que anunciarse solo').toBe(true);

  // No se rompe: sigue habiendo por dónde reintentar, no se abre ningún medio y no se pintan
  // estadísticas de una sesión que no existe.
  await expect(page.getByRole('button', { name: /Iniciar medición/i })).toBeVisible();
  await expect(page.locator('[class*="statsPanel"]')).toHaveCount(0);
  expect(await estadoDelMedio(page)).toEqual({ contextos: [], pistas: [] });
  expect(erroresDeJs, 'una excepción sin capturar dejaría la app muerta').toEqual([]);
});

// ===========================================================================
// HALLAZGOS ABIERTOS — 2.ª pasada del Inspector, 24/08/2026
// ===========================================================================

// ⚠️ HALLAZGO 8 — cálculo. El «Mínimo» de la sesión marca 0,0 dB(A) SIEMPRE, en toda medición
// y en cualquier dispositivo. `startMeasuring` llama a `measureLoop()` de forma síncrona justo
// después de conectar el analizador, cuando su búfer todavía está a cero: las tres primeras
// vueltas del bucle leen −50 dB (el suelo de `Math.max(rms, 1e-7)`), que el recorte
// `Math.max(0, …)` deja en 0, y `setMinDb(prev => Math.min(prev, 0))` clava el mínimo en 0
// para el resto de la sesión. Es una de las tres estadísticas que la app enseña y una de las
// prestaciones que anuncia su metadata («Valores mínimo, máximo y duración acumulada»); con un
// tono perfectamente constante debería coincidir con el máximo. La prueba de que el culpable
// son los primeros fotogramas y no la señal: pulsando «Resetear» un segundo después —misma
// app, misma señal, mismo micrófono— el mínimo pasa a 61,0.
// Caso: tono constante de 1 kHz y amplitud 0,05 (61,0 dB(A) estables durante 12 s) →
//       esperado mínimo ≈ 61,0 · obtenido 0,0 (máximo 61,0; tras «Resetear», 61,0).
test.fail('HALLAZGO 8 — con una señal constante el mínimo de sesión debe valer lo que la señal', async ({
  page,
}) => {
  await micrófonoSintético(page, 1000, 0.05);
  await page.goto(RUTA);
  await page.getByRole('button', { name: /Iniciar medición/i }).click();
  await expect(lecturaTexto(page)).not.toHaveText('--');
  await page.waitForTimeout(2500);

  const { min, max } = await estadisticas(page);
  expect(max).toBe('61,0'); // control: el máximo sí sale bien (20·log₁₀(0,05/√2)+90 = 60,97)
  expect(min, 'el mínimo se queda clavado en 0,0 por los fotogramas previos al audio').toBe('61,0');
});

// ⚠️ HALLAZGO 9 — operativa. La aguja y la barra de colores del medidor usan dos escalas
// DISTINTAS y solo coinciden en el centro. La aguja gira linealmente en dB
// (`(currentDb / 130) * 180 - 90`, page.tsx), así que la posición horizontal de su punta va
// con el SENO del ángulo; las bandas de color, en cambio, se reparten con anchuras lineales en
// dB (`width: ((max - min) / 130) * 100%`). Resultado: en los extremos la aguja señala una
// banda que no es la que la propia app declara. Las marcas numéricas 0/30/50/70/85/100/130
// añaden una tercera escala, repartida a distancias IGUALES (`justify-content: space-between`),
// desalineada con los bordes de color hasta 25 px. No es una regresión de la reparación, pero
// la reparación es la que lo hace visible: hasta el 24/08 la lectura nunca bajaba de 44,9 dB y
// la aguja no llegaba a la zona donde más se desvía.
// Caso: calibración 60 y senoide de 1 kHz amplitud 0,002 → lectura 3,0 dB(A), etiqueta «Muy
//       silencioso» y fila «0-30 dB» resaltada en la tabla · esperado que la punta de la aguja
//       caiga sobre la banda 0-30 (x ∈ [464, 545] px) · obtenida en x = 552 px, sobre la banda
//       verde «Silencioso 30-50». En el otro extremo, 111,0 dB(A) («Peligroso 100-130») pone
//       la punta en x = 723, dentro de «Muy ruidoso 85-100».
test.fail('HALLAZGO 9 — la aguja debe apuntar a la banda de color que la app declara', async ({
  page,
}) => {
  // Calibración 60 (mínimo del deslizador) guardada como si el usuario ya la hubiera ajustado.
  await page.addInitScript(() => window.localStorage.setItem('sonometro-calibracion', '60'));
  await micrófonoSintético(page, 1000, 0.002);
  await page.goto(RUTA);
  await page.getByRole('button', { name: /Iniciar medición/i }).click();
  await expect(lecturaTexto(page)).not.toHaveText('--');
  await page.waitForTimeout(1500);

  // 20·log₁₀(0,002/√2) + 60 = 3,01 dB(A) → primera franja de la tabla de la app.
  expect(await lecturaNumero(page)).toBeCloseTo(3.01, 0);
  await expect(page.locator('[class*="levelLabel"]')).toHaveText('Muy silencioso');

  const geometria = await page.evaluate(() => {
    const aguja = document.querySelector('[class*="needle"]') as HTMLElement;
    const matriz = new DOMMatrix(getComputedStyle(aguja).transform);
    const angulo = Math.atan2(matriz.b, matriz.a); // radianes
    const padre = (aguja.offsetParent as HTMLElement).getBoundingClientRect();
    // transform-origin: bottom center (Sonometro.module.css)
    const pivoteX = padre.left + aguja.offsetLeft + aguja.offsetWidth / 2;
    const puntaX = pivoteX + aguja.offsetHeight * Math.sin(angulo);
    const primeraBanda = document.querySelector('[class*="scaleSegment"]')!.getBoundingClientRect();
    return { puntaX, izq: primeraBanda.left, der: primeraBanda.right };
  });

  expect(
    geometria.puntaX,
    `la punta cae en x=${geometria.puntaX.toFixed(1)}, fuera de la banda 0-30 dB ` +
      `[${geometria.izq.toFixed(1)}, ${geometria.der.toFixed(1)}]`,
  ).toBeLessThanOrEqual(geometria.der);
});
