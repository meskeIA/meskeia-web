import { test, expect, devices, type Locator, type Page } from '@playwright/test';
import { esperarHidratacion, esperarValorEnReact } from './_hidratacion';

/**
 * luxometro — Luxómetro / Fotómetro
 *
 * QUÉ PROMETE (leído el 18/09/2026 en producción)
 *   · <h1> «Luxómetro / Fotómetro» y subtítulo «Mide la intensidad de luz en lux con tu móvil
 *     (celular) usando el sensor del dispositivo. Ideal para fotógrafos: obtén recomendaciones
 *     de exposición según la iluminación.»
 *   · metadata.ts: «Mide la intensidad de luz en lux con tu móvil o celular usando el sensor
 *     del dispositivo.»
 *   · FAQPage del JSON-LD: «El navegador accede a la cámara y analiza el brillo medio de los
 *     fotogramas para convertirlo en una estimación en lux. La precisión es orientativa […]
 *     pero resulta suficiente para detectar cambios significativos de iluminación» y «el margen
 *     de error puede ser del 20-40% respecto a un luxómetro profesional calibrado».
 *   · Bloque educativo, «⚠️ Limitaciones del sensor del navegador»: «El sensor de luz ambiente
 *     del dispositivo no está calibrado para uso profesional. Los valores son orientativos.»
 *   · DisclaimerCard variant="technical" severity="low" collapsible: «Esta herramienta tiene
 *     carácter orientativo…». Suite `tecnicas` → nivel 4 INFORMATIVO en DISCLAIMER-POLICY, así
 *     que la severidad declarada SÍ es la que toca; el problema no es el disclaimer.
 *
 * TODAS esas cautelas hablan del «sensor de luz ambiente». Ninguna habla de la CÁMARA, que es
 * el único método que llega a ejecutarse: `AmbientLightSensor` está detrás de un flag en
 * Chrome y no existe en Safari ni en Firefox, así que `startMeasurement()` cae siempre al
 * `startCameraMethod()` y la insignia dice «📷 Cámara» (verificado, CASO 1).
 *
 * DÓNDE VIVE EL CÁLCULO — no hay motor aparte. `calculateLuxFromCamera()` en
 * app/luxometro/page.tsx pinta el fotograma en un canvas de 64×48, promedia la luma BT.709 de
 * los 3.072 píxeles normalizada a 0-1 y hace:
 *
 *     estimatedLux = round( avgLuminance ** 2.2 * 100000 * calibrationFactor )
 *
 * El 100000 no sale de ninguna parte: el propio comentario del código dice «Esta es una
 * aproximación - los valores reales dependen de la cámara». La cifra es una función PURA del
 * brillo de los píxeles, que es justo lo que la exposición automática de cualquier cámara
 * normaliza hacia el gris medio sea cual sea la iluminancia real de la escena. De ahí el
 * HALLAZGO 1.
 *
 * LOS CASOS, RESUELTOS A MANO ANTES DE ABRIR EL NAVEGADOR
 *
 *   Con un flujo de color uniforme (r=g=b=v) la luma BT.709 vale (0,2126+0,7152+0,0722)·v/255
 *   = v/255 exactamente, así que avgLuminance = v/255 y la cifra sale cerrada:
 *
 *     v=0    → L=0            → 0^2,2      · 100000 = 0        → «0» · Noche sin luna
 *     v=128  → L=0,501960784  → 0,2195194  · 100000 = 21.952   → «21.952» · Sombra exterior
 *     v=192  → L=0,752941176  → 0,5356447  · 100000 = 53.564   → «53.564» · Luz solar directa
 *     v=255  → L=1            → 1          · 100000 = 100.000  → «100.000» · Sol intenso
 *
 *   Los rótulos salen de LUX_REFERENCES: [0,1) Noche sin luna, [10000,25000) Sombra exterior,
 *   [50000,100000) Luz solar directa, [100000,150000) Sol intenso.
 *
 *   CASO 1 (normal, en móvil) — cámara concedida con el dispositivo falso de Chromium.
 *       El medio tiene que arrancar DE VERDAD: readyState ≥ 2 y videoWidth > 0. Un <video> en
 *       el DOM con readyState 0 sería el fallo a cazar, porque `calculateLuxFromCamera()`
 *       exige readyState === 4 y, si no lo tiene, RETORNA SIN VOLVER A PROGRAMAR el
 *       requestAnimationFrame: el bucle moriría sin decir nada y la app se quedaría en «---»
 *       con el botón «Detener» puesto. No se ha conseguido reproducir (readyState llegó a 4 en
 *       6 de 6 intentos, incluso con la CPU estrangulada ×20 y con un flujo de un solo
 *       fotograma), así que queda como fragilidad anotada, no como hallazgo.
 *
 *   CASO 2 (límite) — detener la medición. La cámara SÍ se libera (srcObject a null, las
 *       pistas paradas). Lo que no se limpia es la cifra: ver HALLAZGO 2.
 *
 *   CASO 3 (rechazo) — permiso denegado y navegador sin cámara. Chrome lanza, medido el
 *       18/09/2026, `NotAllowedError | Permission denied` y `NotFoundError | Requested device
 *       not found`. La app degrada con aviso y sin pantalla de error, pero el segundo mensaje
 *       sale en inglés: ver HALLAZGO 3.
 *
 * LO QUE ESTÁ SANO (verificado en producción el 18/09/2026): el medio arranca y el bucle de
 * medición corre (readyState 4, videoWidth 640, la cifra se refresca); la aritmética es
 * FIEL al código —las cuatro luminancias de arriba dan el valor exacto al lux—; el formato
 * español del número es correcto (21.952, no 21,952); la escala de referencia asigna bien el
 * rótulo; «Detener» libera la cámara de verdad; ni el permiso denegado ni la ausencia de
 * cámara tumban la app a la pantalla de error; y el vídeo no se envía a ningún sitio (todo el
 * proceso es un drawImage local, como promete el bloque de privacidad).
 *
 * HALLAZGOS ABIERTOS — al final, con `test.fail()`. Afirman lo que DEBERÍA pasar, así que hoy
 * fallan a propósito; cuando se reparen se les quita el `test.fail()` y quedan como candado de
 * regresión. Están en el acta del Inspector.
 */

/**
 * ⚠️ Los argumentos de cámara falsa NO están en playwright.config.ts, y sin ellos Chromium no
 * tiene ningún dispositivo de vídeo: `getUserMedia` rechazaría con NotFoundError y los tres
 * casos medirían la pantalla de error en vez de la app. `--use-fake-device-for-media-stream`
 * inventa una cámara que emite un patrón animado y `--use-fake-ui-for-media-stream` evita el
 * diálogo de permiso del navegador (que es de chrome, no de la página, y Playwright no puede
 * pulsar). `permissions: ['camera']` es lo que concede el permiso del lado del contexto.
 *
 * Y el viewport es el de un Pixel 7 porque un luxómetro se usa en el móvil: es donde hay
 * cámara trasera y donde el `facingMode: 'environment'` del código significa algo.
 */
test.use({
  ...devices['Pixel 7'],
  permissions: ['camera'],
  launchOptions: {
    args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'],
  },
});

declare global {
  interface Window {
    /** Repinta el flujo de cámara falso con otro color. La instala `camaraDeLuminancia()`. */
    __pintarCamara?: (color: string) => void;
  }
}

const VALOR = '[class*="luxValue"]';
const REFERENCIA = '[class*="refLabel"]';
const INSIGNIA = '[class*="methodBadge"]';
const AVISO = '[class*="errorMessage"]';
const CALIBRACION = 'input[type="number"]';

/** Texto de un nodo, con el espacio duro de Intl normalizado. */
async function texto(loc: Locator): Promise<string> {
  return ((await loc.textContent()) ?? '').replace(/ /g, ' ').trim();
}

/**
 * Esperar a que React haya montado los manejadores antes de pulsar nada.
 *
 * No sirve `esperarHidratacion()` de `_hidratacion.ts` en la carga: sondea el rastreador de
 * valor que React instala en cada INPUT, y esta app no tiene NI UNO en el DOM hasta que se
 * abre el panel de calibración —que exige la medición ya en marcha—. Comprobado el 18/09/2026
 * en producción: `document.querySelectorAll('input, textarea')` devuelve [] al cargar.
 *
 * El testigo equivalente para un botón es el objeto de props que React le cuelga al montarlo:
 * sin `onClick` ahí no hay manejador enganchado y el clic se pierde, que es exactamente la
 * carrera que documenta `_hidratacion.ts`. Y en esta app TODO se activa a clics, así que sin
 * esta espera el primer «Iniciar Medición» puede irse al vacío y el test mediría una app que
 * nunca encendió la cámara. (Donde sí hay input —la calibración— se usa el helper canónico.)
 */
async function esperarBotonVivo(page: Page, boton: Locator): Promise<void> {
  const nodo = await boton.elementHandle({ timeout: 15000 });
  if (!nodo) throw new Error('El botón no llegó a existir en el DOM.');
  try {
    await page.waitForFunction(
      (el) => {
        const bruto = el as unknown as Record<string, unknown>;
        const clave = Object.keys(bruto).find((k) => k.startsWith('__reactProps$'));
        if (!clave) return false;
        const props = bruto[clave] as Record<string, unknown> | null;
        return Boolean(props && typeof props.onClick === 'function');
      },
      nodo,
      { timeout: 15000 },
    );
  } catch {
    throw new Error(
      'El botón sigue sin manejador de React tras 15 s: pulsarlo ahora perdería el clic y la ' +
        'app no llegaría a pedir la cámara.',
    );
  }
}

/**
 * Sustituye la cámara por un canvas de color uniforme, para poder comprobar la conversión a
 * lux con una luminancia EXACTA en vez de con el patrón animado de Chromium (que cambia entre
 * versiones y da un número distinto en cada fotograma).
 */
async function camaraDeLuminancia(page: Page, colorInicial: string): Promise<void> {
  await page.addInitScript((color: string) => {
    let ctx: CanvasRenderingContext2D | null = null;
    let actual = color;
    const pintar = (): void => {
      if (!ctx) return;
      ctx.fillStyle = actual;
      ctx.fillRect(0, 0, 640, 480);
    };
    window.__pintarCamara = (nuevo: string): void => {
      actual = nuevo;
      pintar();
    };
    navigator.mediaDevices.getUserMedia = async (): Promise<MediaStream> => {
      const lienzo = document.createElement('canvas');
      lienzo.width = 640;
      lienzo.height = 480;
      ctx = lienzo.getContext('2d');
      pintar();
      // captureStream solo emite fotograma cuando se dibuja: repintar mantiene vivo el flujo.
      window.setInterval(pintar, 50);
      return lienzo.captureStream(30);
    };
  }, colorInicial);
}

/**
 * Sustituye la cámara por un rechazo con el `name` y el `message` LITERALES que lanza Chrome.
 * Medidos el 18/09/2026 ejecutando getUserMedia en Chromium 1) sin dispositivo de vídeo y
 * 2) con el permiso denegado. Se inyectan en vez de quitar los flags del navegador porque
 * `launchOptions` es de todo el fichero y no se puede cambiar por test.
 */
async function camaraQueFalla(page: Page, nombre: string, mensaje: string): Promise<void> {
  await page.addInitScript(
    ({ nombre: n, mensaje: m }: { nombre: string; mensaje: string }) => {
      navigator.mediaDevices.getUserMedia = (): Promise<MediaStream> =>
        Promise.reject(new DOMException(m, n));
    },
    { nombre, mensaje },
  );
}

const iniciar = (page: Page): Locator => page.getByRole('button', { name: 'Iniciar Medición' });
const detener = (page: Page): Locator => page.getByRole('button', { name: 'Detener' });

/** Abre la app, espera a que responda a los clics y arranca la medición. */
async function abrirYMedir(page: Page): Promise<void> {
  await page.goto('/luxometro/');
  await esperarBotonVivo(page, iniciar(page));
  await iniciar(page).click();
  await expect(detener(page)).toBeVisible();
}

test.beforeEach(async () => {
  // Montar una cámara y compilar la ruta en el servidor de desarrollo se come los 30 s por
  // defecto en un arranque en frío.
  test.slow();
});

test.describe('El medio arranca de verdad', () => {
  test('CASO 1 · con la cámara concedida el vídeo está vivo y la cifra se refresca', async ({
    page,
  }) => {
    await abrirYMedir(page);

    // Lo que hay que cazar: un <video> presente con readyState 0 es una app muerta que parece
    // encendida. readyState ≥ 2 es HAVE_CURRENT_DATA: hay fotograma que dibujar en el canvas.
    await page.waitForFunction(
      () => {
        const v = document.querySelector('video');
        return Boolean(v && v.readyState >= 2 && v.videoWidth > 0 && !v.paused);
      },
      undefined,
      { timeout: 15000 },
    );

    // El único método que llega a ejecutarse es la cámara: AmbientLightSensor está tras un flag.
    await expect(page.locator(INSIGNIA)).toContainText('Cámara');
    await expect(page.locator(AVISO)).toHaveCount(0);

    // Y sale una cifra, no el «---» de reposo.
    await expect(page.locator(VALOR)).not.toHaveText('---');
    expect(await texto(page.locator(VALOR))).toMatch(/^\d{1,3}(\.\d{3})*$/);

    // El patrón del dispositivo falso está animado, así que la lectura tiene que MOVERSE: si
    // se quedara clavada, el bucle de requestAnimationFrame se habría muerto tras la primera
    // vuelta y la app estaría enseñando una foto fija.
    const lecturas = new Set<string>();
    for (let i = 0; i < 8; i++) {
      lecturas.add(await texto(page.locator(VALOR)));
      await page.waitForTimeout(300);
    }
    expect(lecturas.size).toBeGreaterThan(1);
  });
});

test.describe('La conversión de píxeles a lux es fiel al código', () => {
  // Los cuatro valores salen de round((v/255)^2,2 · 100000), resuelto a mano en la cabecera.
  // No prueban que la cifra sea FÍSICAMENTE cierta —no lo es, HALLAZGO 1—: prueban que la app
  // hace exactamente lo que su fórmula dice, que es lo que este test tiene que fijar.
  test('CASO 1.bis · gris medio (128) → 21.952 lux · Sombra exterior', async ({ page }) => {
    await camaraDeLuminancia(page, 'rgb(128,128,128)');
    await abrirYMedir(page);
    await expect(page.locator(VALOR)).toHaveText('21.952');
    await expect(page.locator(REFERENCIA)).toHaveText('Sombra exterior');
    // Y de ahí salen las recomendaciones fotográficas, que es donde la cifra se vuelve consejo.
    await expect(page.locator('[class*="recValue"]').first()).toHaveText('100');
  });

  test('CASO 1.bis · negro (0) → 0 lux · Noche sin luna', async ({ page }) => {
    await camaraDeLuminancia(page, 'rgb(0,0,0)');
    await abrirYMedir(page);
    await expect(page.locator(VALOR)).toHaveText('0');
    await expect(page.locator(REFERENCIA)).toHaveText('Noche sin luna');
  });

  test('CASO 1.bis · blanco (255) → 100.000 lux · Sol intenso', async ({ page }) => {
    await camaraDeLuminancia(page, 'rgb(255,255,255)');
    await abrirYMedir(page);
    await expect(page.locator(VALOR)).toHaveText('100.000');
    await expect(page.locator(REFERENCIA)).toHaveText('Sol intenso');
  });

  test('CASO 1.ter · la lectura sigue al brillo del fotograma, no a la escena', async ({
    page,
  }) => {
    // El mismo flujo, sin tocar nada más que el color: de 192 a 128 la cifra tiene que caer de
    // 53.564 a 21.952. Es la demostración de que lo que mide es el píxel.
    await camaraDeLuminancia(page, 'rgb(192,192,192)');
    await abrirYMedir(page);
    await expect(page.locator(VALOR)).toHaveText('53.564');
    await expect(page.locator(REFERENCIA)).toHaveText('Luz solar directa');

    await page.evaluate(() => window.__pintarCamara?.('rgb(128,128,128)'));
    await expect(page.locator(VALOR)).toHaveText('21.952');
    await expect(page.locator(REFERENCIA)).toHaveText('Sombra exterior');
  });
});

test.describe('CASO 2 · detener la medición', () => {
  test('la cámara se libera de verdad', async ({ page }) => {
    await camaraDeLuminancia(page, 'rgb(192,192,192)');
    await abrirYMedir(page);
    await expect(page.locator(VALOR)).toHaveText('53.564');

    await detener(page).click();
    await expect(iniciar(page)).toBeVisible();

    // Lo importante de parar: que el flujo se suelte. Si quedara vivo, el piloto de la cámara
    // del móvil seguiría encendido con la app «parada».
    await page.waitForFunction(
      () => {
        const v = document.querySelector('video');
        return Boolean(v && v.srcObject === null);
      },
      undefined,
      { timeout: 10000 },
    );
    // Y la insignia de método desaparece.
    await expect(page.locator(INSIGNIA)).toHaveCount(0);
  });
});

test.describe('CASO 3 · la app degrada, no se cae', () => {
  test('permiso denegado: aviso en castellano y la app sigue en pie', async ({ page }) => {
    await camaraQueFalla(page, 'NotAllowedError', 'Permission denied');
    await page.goto('/luxometro/');
    await esperarBotonVivo(page, iniciar(page));
    await iniciar(page).click();

    await expect(page.locator(AVISO)).toContainText(
      'Permiso denegado. Permite el acceso a la cámara para medir la luz.',
    );
    // Ni pantalla de error, ni cifra vieja, ni el botón «Detener» de una medición que no existe.
    await expect(page.locator(VALOR)).toHaveText('---');
    await expect(iniciar(page)).toBeVisible();
    await expect(detener(page)).toHaveCount(0);
    await expect(page.locator('h1')).toHaveText('Luxómetro / Fotómetro');
  });

  test('sin cámara disponible: avisa y no se queda colgada', async ({ page }) => {
    await camaraQueFalla(page, 'NotFoundError', 'Requested device not found');
    await page.goto('/luxometro/');
    await esperarBotonVivo(page, iniciar(page));
    await iniciar(page).click();

    // Que avisa, avisa (el texto concreto es el HALLAZGO 3).
    await expect(page.locator(AVISO)).toBeVisible();
    await expect(page.locator(VALOR)).toHaveText('---');
    await expect(iniciar(page)).toBeVisible();
    await expect(page.locator('h1')).toHaveText('Luxómetro / Fotómetro');
  });
});

test.describe('HALLAZGOS ABIERTOS (18/09/2026)', () => {
  // Los seis usan test.fail(): afirman lo que DEBERÍA pasar y hoy no pasa.

  test.fail(
    'HALLAZGO 1 · la cifra en lux debe decir, junto a ella, que no es una medida de iluminancia',
    async ({ page }) => {
      // Un gris medio uniforme es EXACTAMENTE donde la exposición automática deja cualquier
      // escena, esté la habitación a 50 lux o la calle a 80.000. La app lo convierte en
      // «21.952 lux · Sombra exterior» y en «ISO 100 · f/8-f/16 · 1/1000-1/4000 · usa la regla
      // sunny 16» — un consejo 8-9 pasos por debajo de lo que pide una habitación en penumbra.
      // Toda la cautela de la página habla del «sensor de luz ambiente», que nunca se usa, y
      // vive colapsada en el bloque educativo. Junto a la cifra no hay nada.
      await camaraDeLuminancia(page, 'rgb(128,128,128)');
      await abrirYMedir(page);
      await expect(page.locator(VALOR)).toHaveText('21.952');

      const panel = page.locator('[class*="meterPanel"]');
      await expect(panel).toContainText(/exposici[óo]n autom[áa]tica|no es una medida|estimaci[óo]n relativa/i);
    },
  );

  test.fail('HALLAZGO 2 · al detener, la cifra no puede quedarse como si midiera', async ({
    page,
  }) => {
    // Tras «Detener» la cámara se suelta pero el panel sigue enseñando 53.564 lux, el rótulo
    // «Luz solar directa» y las tres tarjetas de ISO/apertura/velocidad, indefinidamente y sin
    // ninguna marca de que la medición terminó. Medido: seguía ahí 5 s después.
    await camaraDeLuminancia(page, 'rgb(192,192,192)');
    await abrirYMedir(page);
    await expect(page.locator(VALOR)).toHaveText('53.564');

    await detener(page).click();
    await expect(iniciar(page)).toBeVisible();
    await page.waitForTimeout(1000);

    await expect(page.locator(VALOR)).toHaveText('---');
    await expect(page.locator('[class*="photoPanel"]')).toHaveCount(0);
  });

  test.fail('HALLAZGO 3 · «sin cámara» debe avisar en castellano', async ({ page }) => {
    // El código ramifica con `errorMessage.includes('NotFound')`, pero eso es el `name` de la
    // excepción, no su `message`: Chrome pone «Requested device not found». La rama está
    // muerta y el usuario recibe el texto del navegador en inglés.
    await camaraQueFalla(page, 'NotFoundError', 'Requested device not found');
    await page.goto('/luxometro/');
    await esperarBotonVivo(page, iniciar(page));
    await iniciar(page).click();

    await expect(page.locator(AVISO)).toContainText('No se encontró ninguna cámara.');
  });

  test.fail('HALLAZGO 4 · calibrar tiene que cambiar la cifra, no solo poner la insignia', async ({
    page,
  }) => {
    // `calculateLuxFromCamera` es un useCallback con dependencia [calibrationFactor] y se
    // reprograma a sí mismo con requestAnimationFrame: el bucle en marcha sigue llamando al
    // cierre viejo para siempre. Calibrar pinta «Calibrado» y no toca la lectura hasta que se
    // para y se vuelve a arrancar. Medido: 21.952 antes, 21.952 después, 500 tras reiniciar.
    await camaraDeLuminancia(page, 'rgb(128,128,128)');
    await abrirYMedir(page);
    await expect(page.locator(VALOR)).toHaveText('21.952');

    await page.getByTitle('Calibrar').click();
    // El panel de calibración monta el único input de la app: aquí sí vale el helper canónico,
    // y `esperarValorEnReact` prueba que el fill() llegó al estado y no solo al DOM.
    await esperarHidratacion(page, [CALIBRACION]);
    await page.locator(CALIBRACION).fill('500');
    await esperarValorEnReact(page, CALIBRACION, '500');
    await page.getByRole('button', { name: 'Calibrar', exact: true }).click();

    await expect(page.locator(INSIGNIA)).toContainText('Calibrado');
    await expect(page.locator(VALOR)).toHaveText('500');
  });

  test.fail('HALLAZGO 5 · la guía describe un método que la app no usa', async ({ page }) => {
    // El paso 2 dice «El sensor suele estar en el frontal del dispositivo (junto a la cámara
    // frontal). Orienta la pantalla hacia la fuente de luz que quieres medir». El código pide
    // `facingMode: 'environment'`, la cámara TRASERA: siguiendo la guía se apunta justo al
    // lado contrario de lo que se quiere medir.
    await page.goto('/luxometro/');
    const paso2 = page.locator('[class*="stepContent"]').filter({ hasText: 'Coloca el dispositivo' });
    await expect(paso2).not.toContainText('Orienta la pantalla hacia la fuente de luz');
  });

  test.fail('HALLAZGO 6 · el aviso de error tiene que anunciarse a un lector de pantalla', async ({
    page,
  }) => {
    // El aviso aparece en un <div> sin role ni aria-live (CLAUDE.md global §5 pide
    // role="alert" aria-live="polite"). Quien no ve la pantalla pulsa «Iniciar Medición» y no
    // se entera de que la cámara falló: no hay cifra, no hay sonido, no hay anuncio.
    await camaraQueFalla(page, 'NotAllowedError', 'Permission denied');
    await page.goto('/luxometro/');
    await esperarBotonVivo(page, iniciar(page));
    await iniciar(page).click();

    await expect(page.locator(AVISO)).toBeVisible();
    await expect(page.locator(AVISO)).toHaveAttribute('role', 'alert');
  });
});
