import { test, expect, devices, type Page } from '@playwright/test';

/**
 * Sonómetro — test de regresión (Inspector, 24/08/2026)
 *
 * 521 usos reales, segmento «interactiva sin número»: es un SENSOR de micrófono, así que
 * no hay una casilla donde teclear un dato y comprobar el resultado a mano. Lo que se
 * audita es la OPERATIVA —que el medio arranque de verdad, que falle avisando y que la
 * app sirva en un móvil— y, con una señal de nivel conocido inyectada como micrófono,
 * también lo que la app promete medir.
 *
 * QUÉ PROMETE (de donde salen los valores esperados de este fichero):
 *   - <h1> «Sonómetro» + subtítulo «mide el nivel de ruido en decibelios (dB) con tu
 *     micrófono. Ideal para documentar ruido, verificar ambientes de trabajo o medir
 *     contaminación acústica».
 *   - metadata.ts → jsonLd.features: «Medición del nivel sonoro en tiempo real con el
 *     micrófono del dispositivo», «LAeq (nivel continuo equivalente) calculado como
 *     promedio energético de la sesión», «Valores mínimo, máximo y duración acumulada»,
 *     «Calibración manual ajustable (60-120 dB) que se recuerda en el navegador».
 *   - Tabla de referencia de la propia app: «Muy silencioso 0-30 dB», «Silencioso 30-50 dB».
 *   - Bloque educativo: pide comparar la lectura con 30-35 dB de límite interior nocturno,
 *     con «menos de 30 dB» para el cuarto de un bebé (OMS) y con 85 dB(A) laborales, y
 *     avisa de que «confundir dB con dB(A)» es un error frecuente.
 *
 * CÓMO SE PRUEBA UNA APP DE MICRÓFONO: Chromium arranca con
 * `--use-fake-device-for-media-stream` (audio sintético) y `--use-fake-ui-for-media-stream`
 * (concede el permiso sin diálogo). Que exista el botón NO prueba nada: en los tres casos
 * se comprueba que el medio arranca de verdad — `AudioContext.state === 'running'`, la
 * pista del stream en `readyState === 'live'` y las cifras avanzando entre dos lecturas
 * separadas en el tiempo.
 *
 * CÓMO SE MIDE UN NIVEL CONOCIDO (hallazgos 1 y 2): en vez del micrófono se le entrega a la
 * app un stream sintético (oscilador → ganancia → MediaStreamDestination). Con una senoide
 * de amplitud A, el valor que la app DEBE mostrar sale de su propia fórmula
 * (page.tsx, calculateDb): 20·log10(rms) + calibración, con rms = A/√2 y calibración 90 por
 * defecto. Método validado con el control de 61,0 dB del primer hallazgo.
 *
 * Los HALLAZGOS ABIERTOS van al final, marcados con `test.fail()`: afirman lo que la app
 * debería hacer y hoy fallan a propósito, así que Playwright los cuenta como «esperado que
 * falle» y la suite queda verde. El día que se reparen saldrán como «expected to fail but
 * passed» — ese es el aviso de que toca quitarles el `test.fail()` y dejarlos de regresión.
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

/** Nivel que la app debe mostrar para una senoide de amplitud A: 20·log10(A/√2) + 90. */
const nivelEsperado = (amplitud: number): number =>
  20 * Math.log10(amplitud / Math.SQRT2) + CALIBRACION;

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

/**
 * Sustituye el micrófono por una senoide de frecuencia y amplitud conocidas. El
 * AudioContext se reanuda dentro del propio getUserMedia, que la app llama desde el clic:
 * así hereda el gesto del usuario y no arranca suspendido (daría silencio).
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

// ---------------------------------------------------------------------------
// CASO 1 — NORMAL: el medidor arranca y produce lecturas que avanzan
// ---------------------------------------------------------------------------
test('CASO 1 (normal) — el medidor arranca de verdad, mide y suelta el micrófono al detener', async ({
  page,
}) => {
  await instrumentar(page);
  await page.goto(RUTA);

  // Antes de pulsar nada. Los tres literales salen de page.tsx: la lectura es '--' mientras
  // isActive es false, la etiqueta de nivel es 'Esperando...' y el aviso de permiso solo
  // aparece con permissionState === 'prompt'.
  await expect(page.locator('h1')).toHaveText('Sonómetro');
  await expect(lecturaTexto(page)).toHaveText('--');
  await expect(page.locator('[class*="levelLabel"]')).toHaveText('Esperando...');
  await expect(page.locator('[class*="infoMessage"]')).toContainText(
    'Se solicitará permiso para acceder al micrófono',
  );
  expect(await estadoDelMedio(page)).toEqual({ contextos: [], pistas: [] });

  await page.getByRole('button', { name: /Iniciar medición/i }).click();
  await esperarMedicionEnMarcha(page);

  // El panel de estadísticas solo se pinta con isActive: sus tres rótulos son los de page.tsx.
  const estadisticas = page.locator('[class*="statsPanel"]');
  await expect(estadisticas).toBeVisible();
  await expect(estadisticas).toContainText('Mínimo (dB)');
  await expect(estadisticas).toContainText('Máximo (dB)');
  await expect(estadisticas).toContainText('LAeq (dB)');

  // La lectura ha dejado de ser '--' y va en formato español (coma decimal, un decimal:
  // formatNumber(currentDb, 1)).
  await expect(lecturaTexto(page)).toHaveText(/^\d{1,3},\d$/);
  await expect(page.locator('[class*="levelLabel"]')).not.toHaveText('Esperando...');

  // Que VARÍA: el instante puede repetirse (el silencio da 0,0 dos veces seguidas), pero la
  // duración acumulada y el LAeq integran y tienen que avanzar entre dos lecturas separadas.
  const notaInicial = await page.locator('[class*="laeqNota"]').innerText();
  await page.waitForTimeout(2500);
  await expect
    .poll(() => page.locator('[class*="laeqNota"]').innerText(), {
      timeout: 5000,
      message: 'la duración acumulada no avanzó: el bucle de medición no está corriendo',
    })
    .not.toBe(notaInicial);

  // Detener tiene que apagar el micrófono de verdad (pista 'ended' y contexto 'closed'):
  // en un móvil es lo que evita que siga consumiendo y que quede el indicador de grabación.
  await page.getByRole('button', { name: /Detener/i }).click();
  await expect
    .poll(async () => (await estadoDelMedio(page)).pistas.every((p) => p.estado === 'ended'), {
      timeout: 5000,
      message: 'la pista del micrófono siguió viva tras pulsar Detener',
    })
    .toBe(true);
  expect((await estadoDelMedio(page)).contextos).toEqual(['closed']);
  await expect(lecturaTexto(page)).toHaveText('--');
});

// ---------------------------------------------------------------------------
// CASO 2 — LÍMITE: permiso denegado
// ---------------------------------------------------------------------------
test('CASO 2 (límite) — con el permiso denegado avisa con un mensaje claro y no se rompe', async ({
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

  // Literal de page.tsx, rama err.name === 'NotAllowedError'.
  await expect(page.locator('[class*="errorMessage"]')).toContainText(
    'Permiso de micrófono denegado. Permite el acceso en la configuración del navegador.',
  );

  // No se rompe: sigue habiendo por dónde reintentar, no se abre ningún medio y la
  // interfaz no se queda a medias (nada de estadísticas de una sesión que no existe).
  await expect(page.getByRole('button', { name: /Iniciar medición/i })).toBeVisible();
  await expect(page.locator('[class*="statsPanel"]')).toHaveCount(0);
  await expect(lecturaTexto(page)).toHaveText('--');
  expect(await estadoDelMedio(page)).toEqual({ contextos: [], pistas: [] });
  expect(erroresDeJs, 'una excepción sin capturar dejaría la app muerta').toEqual([]);
});

// ---------------------------------------------------------------------------
// CASO 3 — MÓVIL (Pixel 7): es el dispositivo con el que se mide ruido de verdad
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

  test('en un Pixel 7 se puede iniciar de un toque, mide, y nada desborda a lo ancho', async ({
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
    await expect(page.locator('[class*="statsPanel"]')).toBeVisible();
    await expect(lecturaTexto(page)).toHaveText(/^\d{1,3},\d$/);

    // Y sigue sin desbordar con el panel de estadísticas ya desplegado.
    const anchosMidiendo = await page.evaluate(() => ({
      documento: document.documentElement.scrollWidth,
      ventana: window.innerWidth,
    }));
    expect(anchosMidiendo.documento).toBeLessThanOrEqual(anchosMidiendo.ventana + 1);
  });
});

// ===========================================================================
// HALLAZGOS ABIERTOS (Inspector 24/08/2026) — fallan a propósito
// ===========================================================================

// ⚠️ HALLAZGO 1 — cálculo. La app lee el audio con `getByteTimeDomainData`, que devuelve
// 8 bits: por debajo de unos 50 dB la lectura deja de seguir a la señal y se planta en un
// suelo de ~44,9 dB. Medido con senoides de nivel conocido: 61,0 dB teóricos → 61,1 ✅,
// 40,97 → 44,9, 33,01 → 44,9, 20,97 → 44,9, 6,99 → 44,8. Leyendo la MISMA señal del MISMO
// analizador con `getFloatTimeDomainData` salen 40,97 / 33,03 / 20,93 / 6,93: el suelo es
// de la resolución elegida, no del micrófono ni del navegador. Consecuencia: las dos franjas
// bajas de la tabla de la propia app («Muy silencioso 0-30 dB» y «Silencioso 30-50 dB») son
// inalcanzables, y son justo las que el bloque educativo manda comparar con el límite
// interior nocturno (30-35 dB) y con los «menos de 30 dB» que la OMS recomienda para el
// cuarto de un bebé. El consejo de calibración («una habitación en silencio nocturno suele
// estar entre 25 y 35 dB: si tus lecturas se salen mucho, mueve el desplazamiento») lleva
// además a bajar el offset ~15 dB y estropear el extremo alto, que hoy sí es correcto.
// Caso: senoide de 1 kHz y amplitud 0,002 → esperado 33,0 dB · obtenido 44,8 dB.
test('HALLAZGO 1 — por debajo de 50 dB la lectura debe seguir a la señal, no plantarse en 44,9', async ({
  page,
}) => {
  // Testigo del suelo de ~44,9 dB. Cuando se repare, este test pasará y Playwright avisará.
  test.fail();
  const AMPLITUD = 0.002;
  await micrófonoSintético(page, 1000, AMPLITUD);
  await page.goto(RUTA);
  await page.getByRole('button', { name: /Iniciar medición/i }).click();
  await expect(lecturaTexto(page)).not.toHaveText('--');
  await page.waitForTimeout(1500);

  const esperado = nivelEsperado(AMPLITUD); // 33,01 dB
  expect(esperado).toBeCloseTo(33.01, 1);
  expect(await lecturaNumero(page)).toBeCloseTo(esperado, 0);
});

// ⚠️ HALLAZGO 2 — contenido. La estadística principal se rotula «LAeq (dB)» y el bloque
// educativo remite a límites expresados en dB(A) (85 dB(A) laborales, 45 dB(A) nocturnos),
// pero el motor no aplica ninguna ponderación en frecuencia: es un RMS de banda ancha. La
// «A» de LAeq ES la ponderación A, así que la app comete el error del que ella misma avisa
// en su caja de errores frecuentes («Confundir dB con dB(A)»). Con ponderación A, 100 Hz
// pesa 19,1 dB menos que 1 kHz (IEC 61672); aquí pesan lo mismo. Reparación: o se aplica el
// filtro A, o el rótulo pasa a «Leq (dB, sin ponderar)» y el texto deja de invitar a
// comparar la cifra con límites en dB(A).
// Caso: dos senoides de la misma amplitud, 1 kHz y 100 Hz → esperado 61,0 y ~41,9 dB ·
//       obtenido 61,1 y 61,0 (0,1 dB de diferencia).
test('HALLAZGO 2 — si la app dice LAeq, 100 Hz tiene que pesar ~19 dB menos que 1 kHz', async ({
  browser,
}) => {
  // Testigo de la falta de ponderación A. Cuando se repare, este test pasará y Playwright avisará.
  test.fail();
  const AMPLITUD = 0.05;
  const mide = async (frecuencia: number): Promise<number> => {
    const contexto = await browser.newContext({ permissions: ['microphone'] });
    const pagina = await contexto.newPage();
    await micrófonoSintético(pagina, frecuencia, AMPLITUD);
    await pagina.goto(RUTA);
    await pagina.getByRole('button', { name: /Iniciar medición/i }).click();
    await expect(lecturaTexto(pagina)).not.toHaveText('--');
    await pagina.waitForTimeout(1500);
    const valor = await lecturaNumero(pagina);
    await contexto.close();
    return valor;
  };

  // Control del método: a 1 kHz la app clava su propia fórmula (60,97 dB teóricos).
  const a1000 = await mide(1000);
  expect(a1000).toBeCloseTo(nivelEsperado(AMPLITUD), 0);

  // Ponderación A a 100 Hz según IEC 61672: −19,1 dB. Se admite 1 dB de holgura.
  const a100 = await mide(100);
  expect(a100).toBeLessThanOrEqual(a1000 - 18);
});

// ⚠️ HALLAZGO 3 — operativa. Si algo falla DESPUÉS de que el usuario conceda el micrófono,
// el bloque `catch` de startMeasuring solo pinta el error: nunca llama a stopMeasuring, así
// que el stream se queda abierto. La app dice que no está midiendo mientras el indicador de
// grabación del sistema sigue encendido, y en una herramienta cuyo argumento es «el audio no
// se graba ni se envía a ningún servidor» eso es lo peor que puede quedarse a medias. El
// disparador realista es un navegador sin `AudioContext` sin prefijo (Safari iOS antiguo,
// donde solo existe `webkitAudioContext`, que la app tampoco contempla).
// Caso: el constructor de AudioContext lanza tras conceder el permiso → esperado pista
//       'ended' (micrófono liberado) · obtenido 'live'.
test('HALLAZGO 3 — si falla tras conceder el permiso, el micrófono tiene que quedar cerrado', async ({
  page,
}) => {
  // Testigo del micrófono que queda abierto tras el error. Cuando se repare, este test pasará y Playwright avisará.
  test.fail();
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

// ⚠️ HALLAZGO 4 — operativa. Cuando el navegador no expone `navigator.mediaDevices` (visita
// por HTTP sin cifrar, WebView antiguo de una app), la llamada revienta con un TypeError que
// la rama `else` del catch interpola tal cual: al usuario le sale un mensaje del motor de
// JavaScript. Los dos fallos previstos (permiso denegado, sin micrófono) sí tienen texto
// propio; este, que es el tercero previsible, no.
// Caso: navigator.mediaDevices indefinido → esperado un aviso que hable del navegador ·
//       obtenido «Error: Cannot read properties of undefined (reading 'getUserMedia')».
test('HALLAZGO 4 — sin soporte del navegador el aviso debe ser legible, no un TypeError', async ({
  page,
}) => {
  // Testigo del TypeError crudo que se le enseña al usuario. Cuando se repare, este test pasará y Playwright avisará.
  test.fail();
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'mediaDevices', { value: undefined, configurable: true });
  });
  await page.goto(RUTA);
  await page.getByRole('button', { name: /Iniciar medición/i }).click();

  const aviso = page.locator('[class*="errorMessage"]');
  await expect(aviso).toBeVisible();
  await expect(aviso).not.toContainText('Cannot read properties');
  await expect(aviso).toContainText(/navegador/i);
});

// ⚠️ HALLAZGO 5 — accesibilidad. El aviso de error es la ÚNICA señal de que no se está
// midiendo (el botón no cambia, el foco no se mueve, la lectura sigue en '--'), y se pinta
// en un <div> sin `role="alert"` ni `aria-live`. Con lector de pantalla, pulsar «Iniciar
// medición» y que te denieguen el permiso no anuncia absolutamente nada. Regla del
// CLAUDE.md global §5. (El mismo fichero arrastra 9 incumplimientos de emoji sin
// `aria-hidden` que `npm run check:a11y-jsx` ya lista; son pasivo anterior al candado y no
// se duplican aquí.)
// Caso: permiso denegado → esperado el aviso anunciado (role="alert" o aria-live) ·
//       obtenido un <div> mudo.
test('HALLAZGO 5 — el aviso de error tiene que anunciarse a la ayuda técnica', async ({ page }) => {
  // Testigo del aviso sin role="alert" ni aria-live. Cuando se repare, este test pasará y Playwright avisará.
  test.fail();
  await page.addInitScript(() => {
    navigator.mediaDevices.getUserMedia = () =>
      Promise.reject(new DOMException('Permission denied', 'NotAllowedError'));
  });
  await page.goto(RUTA);
  await page.getByRole('button', { name: /Iniciar medición/i }).click();

  const aviso = page.locator('[class*="errorMessage"]');
  await expect(aviso).toBeVisible();
  const seAnuncia = await aviso.evaluate(
    (el) => el.getAttribute('role') === 'alert' || el.hasAttribute('aria-live'),
  );
  expect(seAnuncia).toBe(true);
});

// ⚠️ HALLAZGO 6 — operativa. El panel de estadísticas está condicionado a `isActive`, así
// que pulsar «Detener» borra de la pantalla el mínimo, el máximo, el LAeq y la duración: se
// pierde el resumen de la sesión justo al terminarla. La app pide medir «al menos 5 minutos
// seguidos» y comparar el resultado con la ordenanza, y su guía resuelve el problema
// pidiendo la captura de pantalla «mientras está midiendo» — es decir, el usuario tiene que
// saber que si detiene primero, pierde el dato.
// Caso: medir y pulsar Detener → esperado que siga leyéndose el LAeq de la sesión ·
//       obtenido: el panel entero desaparece.
test('HALLAZGO 6 — al detener, el resumen de la sesión debe seguir a la vista', async ({ page }) => {
  // Testigo del resumen que desaparece al detener. Cuando se repare, este test pasará y Playwright avisará.
  test.fail();
  await instrumentar(page);
  await page.goto(RUTA);
  await page.getByRole('button', { name: /Iniciar medición/i }).click();
  await esperarMedicionEnMarcha(page);
  await expect(page.locator('[class*="statsPanel"]')).toContainText('LAeq (dB)');

  await page.getByRole('button', { name: /Detener/i }).click();
  await expect(page.locator('[class*="statsPanel"]')).toContainText('LAeq (dB)');
});
