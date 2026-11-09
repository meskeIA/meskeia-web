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
 * los 3.072 píxeles normalizada a 0-1 y hacía:
 *
 *     estimatedLux = round( avgLuminance ** 2.2 * 100000 * calibrationFactor )
 *
 * El 100000 no salía de ninguna parte: el propio comentario del código decía «Esta es una
 * aproximación - los valores reales dependen de la cámara». La cifra es una función PURA del
 * brillo de los píxeles, que es justo lo que la exposición automática de cualquier cámara
 * normaliza hacia el gris medio sea cual sea la iluminancia real de la escena. De ahí el
 * hallazgo 908, y de ahí la reparación.
 *
 * ── LO QUE PUBLICA DESDE EL 18/09/2026 ──
 *
 * La misma expresión se guarda ahora como SEÑAL cruda, sin unidad, y la pantalla decide qué
 * enseñar con ella:
 *     · sin calibrar → nivel relativo = round( (señal/100000)^(1/2,2) · 100 ), que es el brillo
 *       medio del fotograma en tanto por ciento, y NADA en lux;
 *     · calibrado    → lux = round( señal × factor ), con factor = referencia / señal medida.
 * Y con los lux se apagan o encienden las tres cosas que derivaban de ellos: el rótulo de
 * escena, la escala de referencia y las recomendaciones de exposición.
 *
 * LOS CASOS, RESUELTOS A MANO ANTES DE ABRIR EL NAVEGADOR
 *
 *   Con un flujo de color uniforme (r=g=b=v) la luma BT.709 vale (0,2126+0,7152+0,0722)·v/255
 *   = v/255 exactamente, así que avgLuminance = v/255 y las dos cifras salen cerradas:
 *
 *     v=0    → señal 0        → nivel 0    · lux calibrado a 500: 0
 *     v=128  → señal 21.952   → nivel 50   · lux calibrado a 500: 500 (es la referencia)
 *     v=192  → señal 53.564   → nivel 75   · lux con ese mismo factor: 53.564/21.952·500 = 1220
 *     v=255  → señal 100.000  → nivel 100
 *
 *   Los rótulos salen de LUX_REFERENCES y solo aparecen calibrados: [200,500) Interior normal,
 *   [500,1000) Oficina bien iluminada, [1000,5000) Día muy nublado.
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
 *       pistas paradas). Lo que no se limpiaba ni se marcaba era la cifra: ver el 910.
 *
 *   CASO 3 (rechazo) — permiso denegado y navegador sin cámara. Chrome lanza, medido el
 *       18/09/2026, `NotAllowedError | Permission denied` y `NotFoundError | Requested device
 *       not found`. La app degrada con aviso y sin pantalla de error, pero el segundo mensaje
 *       salía en inglés: ver el 914.
 *
 * LO QUE ESTÁ SANO (verificado en producción el 18/09/2026): el medio arranca y el bucle de
 * medición corre (readyState 4, videoWidth 640, la cifra se refresca); la aritmética es
 * FIEL al código —las cuatro luminancias de arriba dan el valor exacto al lux—; el formato
 * español del número es correcto (21.952, no 21,952); la escala de referencia asigna bien el
 * rótulo; «Detener» libera la cámara de verdad; ni el permiso denegado ni la ausencia de
 * cámara tumban la app a la pantalla de error; y el vídeo no se envía a ningún sitio (todo el
 * proceso es un drawImage local, como promete el bloque de privacidad).
 *
 * LOS 7 HALLAZGOS, al final, ya como candados de regresión. Dos se repararon de otra forma que
 * la que proponía el acta, y el razonamiento está escrito en cada uno: el 910 marca la lectura
 * como caducada en vez de borrarla, y el 908 no añade un aviso junto a la cifra sino que RETIRA
 * la cifra —un aviso debajo de un número utilizable no es una salvaguarda, es una nota al pie.
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
const CALIBRACION = '#lux-referencia';
const UNIDAD = '[class*="luxUnit"]';

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

test.describe('Sin calibrar: nivel relativo, y ninguna cifra en lux', () => {
  // Desde la reparación del 18/09/2026 el bucle guarda la SEÑAL cruda —la misma de antes,
  // round((v/255)^2,2 · 100000)— y la pantalla publica su raíz 2,2 llevada a 0-100, que es el
  // brillo medio del fotograma en tanto por ciento. La cifra en lux solo aparece calibrada.
  // Estos casos no prueban que el nivel sea físicamente nada: prueban que la app hace lo que
  // su fórmula dice y que NO rotula como iluminancia lo que no lo es.
  test('CASO 1.bis · gris medio (128) → nivel 50, sin lux ni rótulo de escena', async ({ page }) => {
    await camaraDeLuminancia(page, 'rgb(128,128,128)');
    await abrirYMedir(page);

    // señal = round(0,50196^2,2 · 100000) = 21.952 → nivel = round(0,21952^(1/2,2) · 100) = 50
    await expect(page.locator(VALOR)).toHaveText('50');
    await expect(page.locator(UNIDAD)).toContainText('nivel relativo');
    // Lo que antes salía aquí: «21.952 lux · Sombra exterior» y un consejo de sunny 16, para
    // una escena que es exactamente donde la exposición automática deja CUALQUIER habitación.
    await expect(page.locator(VALOR)).not.toHaveText('21.952');
    await expect(page.locator(REFERENCIA)).toHaveCount(0);
    await expect(page.locator('[class*="photoPanel"]')).toHaveCount(0);
  });

  test('CASO 1.bis · negro (0) → nivel 0 · blanco (255) → nivel 100', async ({ page }) => {
    await camaraDeLuminancia(page, 'rgb(0,0,0)');
    await abrirYMedir(page);
    await expect(page.locator(VALOR)).toHaveText('0');

    await page.evaluate(() => window.__pintarCamara?.('rgb(255,255,255)'));
    await expect(page.locator(VALOR)).toHaveText('100');
  });

  test('CASO 1.ter · la lectura sigue al brillo del fotograma, no a la escena', async ({
    page,
  }) => {
    // El mismo flujo, sin tocar nada más que el color: de 192 a 128 el nivel cae de 75 a 50.
    // Es la demostración de que lo que mide es el píxel — y la razón de que no pueda llamarse
    // lux mientras la cámara siga compensando la exposición por su cuenta.
    await camaraDeLuminancia(page, 'rgb(192,192,192)');
    await abrirYMedir(page);
    await expect(page.locator(VALOR)).toHaveText('75');

    await page.evaluate(() => window.__pintarCamara?.('rgb(128,128,128)'));
    await expect(page.locator(VALOR)).toHaveText('50');
  });
});

test.describe('CASO 2 · detener la medición', () => {
  test('la cámara se libera de verdad', async ({ page }) => {
    await camaraDeLuminancia(page, 'rgb(192,192,192)');
    await abrirYMedir(page);
    await expect(page.locator(VALOR)).toHaveText('75');

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

test.describe('Los 7 hallazgos del 18/09/2026, reparados el mismo día', () => {
  test('908 · la cifra que se publica sin calibrar no se presenta como una medida', async ({
    page,
  }) => {
    // Un gris medio uniforme es EXACTAMENTE donde la exposición automática deja cualquier
    // escena, esté la habitación a 50 lux o la calle a 80.000. La app lo convertía en
    // «21.952 lux · Sombra exterior» y en «ISO 100 · f/8-f/16 · usa la regla sunny 16», un
    // consejo 8-9 pasos por debajo de lo que pide una habitación en penumbra. Toda la cautela
    // de la página hablaba del «sensor de luz ambiente», que nunca llega a usarse, y vivía
    // colapsada en el bloque educativo; junto a la cifra no había nada.
    //
    // La reparación aplica la regla del catálogo: un aviso debajo de una cifra utilizable no
    // es una salvaguarda, es una nota al pie de un número falso. O se calcula, o no se da.
    await camaraDeLuminancia(page, 'rgb(128,128,128)');
    await abrirYMedir(page);

    await expect(page.locator(VALOR)).toHaveText('50');
    await expect(page.locator(UNIDAD)).not.toContainText(/^lux$/);
    // Y el aviso vive JUNTO al medidor, no colapsado, nombrando la causa real.
    const panel = page.locator('[class*="meterPanel"]');
    await expect(panel).toContainText(/exposici[óo]n/i);
    await expect(panel).toContainText(/no una medida en lux/i);
  });

  test('909 · calibrar cambia la cifra del bucle en marcha, no solo la insignia', async ({
    page,
  }) => {
    // `calculateLuxFromCamera` era un useCallback con dependencia [calibrationFactor] que se
    // reprogramaba con requestAnimationFrame: el bucle vivo seguía llamando al cierre viejo
    // para siempre, así que calibrar pintaba «Calibrado» y no tocaba la lectura hasta parar y
    // volver a arrancar. Medido entonces: 21.952 antes, 21.952 después, 500 tras reiniciar.
    // Ahora el bucle no lee el factor —guarda la señal cruda— y la calibración se aplica al
    // pintar, de modo que el cierre obsoleto ya no puede quedarse con un valor viejo.
    await camaraDeLuminancia(page, 'rgb(128,128,128)');
    await abrirYMedir(page);
    await expect(page.locator(VALOR)).toHaveText('50');

    await page.getByTitle('Calibrar').click();
    // El panel de calibración monta el único input de la app: aquí sí vale el helper canónico,
    // y `esperarValorEnReact` prueba que el fill() llegó al estado y no solo al DOM.
    await esperarHidratacion(page, [CALIBRACION]);
    await page.locator(CALIBRACION).fill('500');
    await esperarValorEnReact(page, CALIBRACION, '500');
    await page.getByRole('button', { name: 'Calibrar', exact: true }).click();

    await expect(page.locator(INSIGNIA)).toContainText('Calibrado');
    await expect(page.locator(VALOR)).toHaveText('500');
    await expect(page.locator(UNIDAD)).toHaveText('lux');

    // Y la escala queda anclada: al subir el brillo del fotograma, el lux escala con la señal.
    // 53.564 / 21.952 × 500 = 1.220 lux. Si el bucle volviera a ignorar el factor, aquí
    // saldría otra vez un número sin calibrar.
    await page.evaluate(() => window.__pintarCamara?.('rgb(192,192,192)'));
    // Ojo: es-ES no agrupa los millares hasta las cinco cifras, así que son «1220» y no «1.220».
    await expect(page.locator(VALOR)).toHaveText('1220');
  });

  test('909.bis · calibrado aparecen el rótulo de escena y las recomendaciones', async ({
    page,
  }) => {
    // Los dos salen de los lux, así que sin calibrar no se muestran. Con la escala anclada a
    // 500 lux, la referencia es «Interior normal» (200-500) y no «Sombra exterior».
    await camaraDeLuminancia(page, 'rgb(128,128,128)');
    await abrirYMedir(page);
    await expect(page.locator('[class*="photoPanel"]')).toHaveCount(0);

    await page.getByTitle('Calibrar').click();
    await esperarHidratacion(page, [CALIBRACION]);
    await page.locator(CALIBRACION).fill('300');
    await esperarValorEnReact(page, CALIBRACION, '300');
    await page.getByRole('button', { name: 'Calibrar', exact: true }).click();

    await expect(page.locator(VALOR)).toHaveText('300');
    await expect(page.locator(REFERENCIA)).toHaveText('Interior normal');
    await expect(page.locator('[class*="photoPanel"]')).toBeVisible();
  });

  test('909.ter · quitar la calibración devuelve el nivel relativo, no un lux a factor 1', async ({
    page,
  }) => {
    await camaraDeLuminancia(page, 'rgb(128,128,128)');
    await abrirYMedir(page);
    await page.getByTitle('Calibrar').click();
    await esperarHidratacion(page, [CALIBRACION]);
    await page.locator(CALIBRACION).fill('500');
    await esperarValorEnReact(page, CALIBRACION, '500');
    await page.getByRole('button', { name: 'Calibrar', exact: true }).click();
    await expect(page.locator(VALOR)).toHaveText('500');

    await page.getByTitle('Calibrar').click();
    await page.getByRole('button', { name: /Quitar la calibración/ }).click();

    await expect(page.locator(VALOR)).toHaveText('50');
    await expect(page.locator(UNIDAD)).toContainText('nivel relativo');
  });

  test('910 · al detener, la lectura se marca como caducada', async ({ page }) => {
    // Tras «Detener» la cámara se soltaba pero el panel seguía enseñando la cifra, el rótulo y
    // las tarjetas de exposición indefinidamente y sin ninguna marca de que aquello había
    // terminado; medido, seguía ahí 5 s después. El acta admitía dos salidas —limpiar o marcar
    // la lectura— y se eligió marcarla: quien acaba de medir suele querer anotar el valor, y
    // borrarlo al parar obliga a volver a encender la cámara para leer lo que ya había leído.
    await camaraDeLuminancia(page, 'rgb(192,192,192)');
    await abrirYMedir(page);
    await expect(page.locator(VALOR)).toHaveText('75');

    await detener(page).click();
    await expect(iniciar(page)).toBeVisible();
    await page.waitForTimeout(1000);

    await expect(page.locator('[class*="avisoMedidor"]')).toContainText('Medición detenida');
  });

  test('911 · los umbrales normativos salen de data/ y llevan su fuente', async ({ page }) => {
    // Estaban escritos a mano en el JSX, sin edición ni fecha, y uno mal atribuido: la app daba
    // 100 lx como mínimo del RD 486/1997 para «zonas de paso», cuando el RD fija 25 lx de uso
    // ocasional y 50 lx de uso habitual para vías de circulación. Y ponía 300 lx en salas de
    // reunión, que en la UNE-EN 12464-1 son 500.
    await page.goto('/luxometro/');

    // El DataReference, que es lo que hace comprobable la cifra, y va tras el disclaimer.
    const referencia = page.locator('[class*="dataReference"]');
    await expect(referencia).toContainText('486/1997');

    await page.getByRole('button', { name: /Ver guía|guía educativa/i }).first().click();
    const tablas = page.locator('[class*="comparativaTable"]');
    const rd = tablas.filter({ hasText: 'Vías de circulación de uso habitual' });
    await expect(rd).toContainText('25 lx');
    await expect(rd).toContainText('50 lx');

    const une = tablas.filter({ hasText: 'Salas de reuniones' });
    await expect(une).toContainText('500 lx');
  });

  test('912 · la guía describe el método que la app ejecuta de verdad', async ({ page }) => {
    // El paso 2 decía «El sensor suele estar en el frontal del dispositivo. Orienta la pantalla
    // hacia la fuente de luz que quieres medir», mientras el código pide facingMode
    // 'environment', la cámara TRASERA: siguiendo la guía se apunta justo al lado contrario.
    await page.goto('/luxometro/');
    await page.getByRole('button', { name: /Ver guía|guía educativa/i }).first().click();

    const paso2 = page.locator('[class*="stepContent"]').filter({ hasText: 'Apunta la cámara trasera' });
    await expect(paso2).toBeVisible();
    await expect(paso2).toContainText('no la pantalla');

    const guia = page.locator('[class*="stepGuide"]');
    await expect(guia).not.toContainText('Orienta la pantalla hacia la fuente de luz');
  });

  test('913 · el aviso de error se anuncia a un lector de pantalla', async ({ page }) => {
    // El aviso aparecía en un <div> sin role ni aria-live (CLAUDE.md global §5 pide
    // role="alert" aria-live="polite"). Quien no ve la pantalla pulsa «Iniciar Medición» y no
    // se entera de que la cámara falló: no hay cifra, no hay sonido, no hay anuncio.
    await camaraQueFalla(page, 'NotAllowedError', 'Permission denied');
    await page.goto('/luxometro/');
    await esperarBotonVivo(page, iniciar(page));
    await iniciar(page).click();

    await expect(page.locator(AVISO)).toBeVisible();
    await expect(page.locator(AVISO)).toHaveAttribute('role', 'alert');
    // Y la cifra vive en una región viva, para que el cambio de lectura llegue a anunciarse.
    await expect(page.locator('[class*="luxDisplay"]')).toHaveAttribute('aria-live', 'polite');
  });

  test('914 · «sin cámara» avisa en castellano, no con el texto crudo del navegador', async ({
    page,
  }) => {
    // El código ramificaba con `errorMessage.includes('NotFound')`, pero eso es el `name` de la
    // excepción, no su `message`: Chrome pone «Requested device not found». La rama estaba
    // muerta y el usuario recibía el inglés del navegador dentro de una app en castellano.
    await camaraQueFalla(page, 'NotFoundError', 'Requested device not found');
    await page.goto('/luxometro/');
    await esperarBotonVivo(page, iniciar(page));
    await iniciar(page).click();

    await expect(page.locator(AVISO)).toContainText('No se encontró ninguna cámara');
    await expect(page.locator(AVISO)).not.toContainText('Requested device not found');
  });

  test('914.bis · la cámara ocupada por otra app también se dice en castellano', async ({
    page,
  }) => {
    // Misma familia: NotReadableError es el caso corriente de tener la cámara abierta en otra
    // pestaña o en la app de cámara del móvil, y caía igualmente al texto en inglés.
    await camaraQueFalla(page, 'NotReadableError', 'Could not start video source');
    await page.goto('/luxometro/');
    await esperarBotonVivo(page, iniciar(page));
    await iniciar(page).click();

    await expect(page.locator(AVISO)).toContainText('ocupada por otra aplicación');
  });
});

/**
 * ── INSPECCIÓN DE CAMBIO DEL 09/11/2026 ──
 *
 * Diff `885242c3..HEAD -- app/luxometro/`: la reparación del 18/09/2026 (señal cruda, nivel
 * relativo, calibración en «lux por unidad de señal», `data/iluminacion-normativa.ts`), los
 * tokens de contraste de C0070 y C0014, el `<span>` de C0312 en la escala y `<RelatedApps />`
 * sin prop. Esperados calculados ANTES de abrir la app:
 *
 *   gris 128 → señal round((128/255)^2,2 · 100000) = 21.952 → nivel 50
 *   gris 192 → señal 53.564 → nivel 75 · gris 255 → señal 100.000 → nivel 100 · gris 0 → 0
 *   calibrar «1.500» con gris 128 → factor 1500/21.952 → round(21.952 · factor) = 1500 lux
 *   calibrar «320,4» con gris 128 → 320,4 → round = 320 lux («Interior normal», 200-500)
 *   RD 486/1997, Anexo IV, cotejado en boe.es (BOE-A-1997-8669) el 09/11/2026: 100 · 200 ·
 *   500 · 1.000 lx por exigencia de la tarea; 50 · 100 lx en áreas o locales de uso ocasional
 *   o habitual; 25 · 50 lx en vías de circulación de uso ocasional o habitual.
 *
 * Lo SANO del cambio: la calibración lee el formato español y se aplica al bucle en marcha; el
 * nivel relativo y la cifra calibrada siguen la fórmula; la tabla del RD coincide con el BOE; la
 * escala de entornos se pinta igual que antes del `<span>` de C0312.
 */
test.describe('Cambio del 18/09 al 09/11/2026: lo que está sano', () => {
  test('CASO 4 · la calibración lee el formato español: «1.500» son 1500 lux y «320,4» son 320', async ({
    page,
  }) => {
    // Con gris 128 la señal es 21.952, así que lux = round(21.952 × referencia / 21.952), que es
    // la referencia redondeada. Si el punto se leyera como decimal, «1.500» daría 2 lux; si la
    // coma se descartara, «320,4» daría 3204.
    await camaraDeLuminancia(page, 'rgb(128,128,128)');
    await abrirYMedir(page);
    await expect(page.locator(VALOR)).toHaveText('50');

    await page.getByTitle('Calibrar').click();
    await esperarHidratacion(page, [CALIBRACION]);
    await page.locator(CALIBRACION).fill('1.500');
    await esperarValorEnReact(page, CALIBRACION, '1.500');
    await page.getByRole('button', { name: 'Calibrar', exact: true }).click();
    // es-ES no agrupa los millares con cuatro cifras: «1500», no «1.500»
    await expect(page.locator(VALOR)).toHaveText('1500');
    await expect(page.locator(UNIDAD)).toHaveText('lux');
    // [1000, 5000) en LUX_REFERENCES
    await expect(page.locator(REFERENCIA)).toHaveText('Día muy nublado');

    // Recalibrar no acumula error: el factor se calcula sobre la señal, no sobre la cifra anterior
    await page.getByTitle('Calibrar').click();
    await page.locator(CALIBRACION).fill('320,4');
    await esperarValorEnReact(page, CALIBRACION, '320,4');
    await page.getByRole('button', { name: 'Calibrar', exact: true }).click();
    await expect(page.locator(VALOR)).toHaveText('320');
    await expect(page.locator(REFERENCIA)).toHaveText('Interior normal');
  });

  test('CASO 5 · la tabla del RD 486/1997 coincide con el Anexo IV del BOE, fila a fila', async ({
    page,
  }) => {
    // Esperado: BOE-A-1997-8669, Anexo IV, apartado 3 (cotejado en boe.es el 09/11/2026).
    const esperado: Array<[string, string]> = [
      ['Tareas con bajas exigencias visuales', '100 lx'],
      ['Tareas con exigencias visuales moderadas', '200 lx'],
      ['Tareas con exigencias visuales altas', '500 lx'],
      // es-ES no agrupa cuatro cifras: «1000 lx»
      ['Tareas con exigencias visuales muy altas', '1000 lx'],
      ['Áreas o locales de uso ocasional', '50 lx'],
      ['Áreas o locales de uso habitual', '100 lx'],
      ['Vías de circulación de uso ocasional', '25 lx'],
      ['Vías de circulación de uso habitual', '50 lx'],
    ];
    await page.goto('/luxometro/');
    await page.getByRole('button', { name: /Ver guía|guía educativa/i }).first().click();
    const tabla = page
      .locator('[class*="comparativaTable"]')
      .filter({ hasText: 'Vías de circulación de uso habitual' });
    await expect(tabla).toBeVisible();
    const filas = await tabla.locator('tbody tr').evaluateAll((trs) =>
      trs.map((tr) => [
        (tr.querySelector('td strong')?.textContent ?? '').trim(),
        (tr.querySelectorAll('td')[1]?.textContent ?? '').replace(/ /g, ' ').trim(),
      ]),
    );
    expect(filas).toEqual(esperado);
    // Y la regla de duplicar, que es del mismo anexo, va en el pie de la tabla
    await expect(tabla.locator('caption')).toContainText('se duplican');
  });

  test('CASO 6 · la escala de entornos se pinta igual tras envolver el texto en <span> (C0312)', async ({
    page,
  }) => {
    // LUX_REFERENCES: la primera va de 0 a 1 («<1 lux») y la octava de 5000 a 10000, que con
    // es-ES sale «5000 - 10.000 lux» (cuatro cifras sin agrupar, cinco con punto).
    await page.goto('/luxometro/');
    const rangos = page.locator('[class*="refCardRange"]');
    await expect(rangos).toHaveCount(12);
    expect(await texto(rangos.nth(0))).toBe('<1 lux');
    expect(await texto(rangos.nth(1))).toBe('1 - 10 lux');
    expect(await texto(rangos.nth(7))).toBe('5000 - 10.000 lux');
    expect(await texto(rangos.nth(11))).toBe('100.000 - 150.000 lux');
  });
});

/**
 * Un `AmbientLightSensor` de mentira. Ningún navegador de uso común lo expone sin flag, pero el
 * código lo intenta PRIMERO, y lo que hace al fallar o al detenerse es parte del diff (el
 * `setCalibracion(prev => prev ?? 1)` y el `setLecturaCaducada`). `falla: true` imita el
 * escritorio con el flag de Chrome activado y sin sensor: `start()` va bien y luego llega un
 * evento «error» (NotReadableError). Sin `falla`, emite lecturas de 320 y 640 lx cada 400 ms y
 * cuenta las llamadas a `stop()` en `window.__paradasSensor`.
 */
async function sensorDeLuz(page: Page, falla: boolean): Promise<void> {
  await page.addInitScript((romper: boolean) => {
    const w = window as unknown as Record<string, unknown>;
    w.__paradasSensor = 0;
    class SensorFalso extends EventTarget {
      illuminance: number | null = null;
      private n = 0;
      private reloj: number | undefined;
      start(): void {
        if (romper) {
          window.setTimeout(() => this.dispatchEvent(new Event('error')), 30);
          return;
        }
        this.reloj = window.setInterval(() => {
          this.n += 1;
          this.illuminance = this.n % 2 ? 320 : 640;
          this.dispatchEvent(new Event('reading'));
        }, 400);
      }
      stop(): void {
        window.clearInterval(this.reloj);
        w.__paradasSensor = (w.__paradasSensor as number) + 1;
      }
    }
    w.AmbientLightSensor = SensorFalso;
  }, falla);
}

test.describe('Hallazgos de la inspección de cambio del 09/11/2026', () => {
  test('HALLAZGO (09/11/2026, ABIERTO) · si el sensor de luz falla y cae a la cámara, vuelve la cifra en lux sin calibrar y con la insignia «Calibrado»', async ({
    page,
  }) => {
    // `tryAmbientLightSensor` pone `setCalibracion(prev => prev ?? 1)` en cuanto el constructor
    // no lanza, y cuando el sensor emite «error» llama a `startCameraMethod()` sin devolver la
    // calibración a null. La cámara publica entonces su señal cruda × 1 como lux: con gris 128
    // salía «21.952 lux · Sombra exterior», «Calibrado», «Calibrado para esta escena» y las
    // recomendaciones de sunny 16 — el hallazgo 908 entero, por la puerta del sensor.
    // Esperado (contrato de la reparación del 18/09): nivel 50 «/ 100 (nivel relativo)».
    test.fail();
    await camaraDeLuminancia(page, 'rgb(128,128,128)');
    await sensorDeLuz(page, true);
    await abrirYMedir(page);
    await expect(page.locator(INSIGNIA)).toContainText('Cámara', { timeout: 10000 });
    await expect(page.locator(VALOR)).toHaveText('50', { timeout: 5000 });
    await expect(page.locator(UNIDAD)).toContainText('nivel relativo');
    await expect(page.locator(INSIGNIA)).not.toContainText('Calibrado');
  });

  test('HALLAZGO (09/11/2026, ABIERTO) · «Detener» no para el sensor de luz: la lectura sigue cambiando y «Medición detenida» se borra', async ({
    page,
  }) => {
    // El sensor se crea en una variable local y `stopMeasurement` nunca llama a `stop()`: tras
    // «Detener» las lecturas siguen llegando, cada una pone `lecturaCaducada` a false y la cifra
    // alterna 320/640 con el botón «Iniciar Medición» en pantalla. Medido: 0 llamadas a stop();
    // al volver a iniciar hay dos sensores vivos.
    test.fail();
    await sensorDeLuz(page, false);
    await abrirYMedir(page);
    await expect(page.locator(INSIGNIA)).toContainText('Sensor de luz');
    await expect(page.locator(UNIDAD)).toHaveText('lux');

    await detener(page).click();
    await expect(iniciar(page)).toBeVisible();
    const congelada = await texto(page.locator(VALOR));
    await page.waitForTimeout(1500);
    expect(await page.evaluate(() => (window as unknown as { __paradasSensor: number }).__paradasSensor)).toBe(1);
    await expect(page.locator('[class*="avisoMedidor"]')).toContainText('Medición detenida');
    expect(await texto(page.locator(VALOR))).toBe(congelada);
  });

  test('HALLAZGO (09/11/2026, ABIERTO) · el «Historial (últimos 60 segundos)» guarda 60 fotogramas, alrededor de 1 s', async ({
    page,
  }) => {
    // `setHistory(prev => [...prev.slice(-59), señal])` se ejecuta en cada requestAnimationFrame
    // (61 por segundo, medido): las 60 barras se llenan en ~1 s. Con gris 192 (nivel 75) durante
    // 3 s y luego gris 128 (nivel 50), cinco segundos después una ventana de 60 s tiene que
    // seguir viendo el 75. Medido el 09/11/2026: «Mín: 50 · Máx: 50 · Media: 50».
    test.fail();
    await camaraDeLuminancia(page, 'rgb(192,192,192)');
    await abrirYMedir(page);
    await expect(page.locator(VALOR)).toHaveText('75');
    await page.getByRole('button', { name: 'Ver el historial de lecturas' }).click();
    await expect(page.locator('[class*="historyPanel"] h3')).toContainText('últimos 60 segundos');
    await page.waitForTimeout(3000);

    await page.evaluate(() => window.__pintarCamara?.('rgb(128,128,128)'));
    await expect(page.locator(VALOR)).toHaveText('50');
    await page.waitForTimeout(5000);
    const estadisticas = page.locator('[class*="historyStats"]');
    await expect(estadisticas).toContainText('Mín: 50');
    await expect(estadisticas).toContainText('Máx: 75');
  });

  test('HALLAZGO (09/11/2026, ABIERTO) · en nivel relativo el historial usa la escala de los lux: la media sale de la señal y las barras se quedan en el 38,7 %', async ({
    page,
  }) => {
    // `enUnidad()` convierte la MEDIA de las señales, no media los niveles: con 2/3 de muestras
    // a 100 y 1/3 a 0, la media de lo pintado es 67 y la app da round((2/3)^(1/2,2)·100) = 83.
    // Y la altura de cada barra pasa el nivel 0-100 por `getMeterPercentage`, la escala
    // logarítmica de 0 a 150.000 lux: un nivel 100 llena log10(101)/log10(150001) = 38,72 % de
    // la barra mientras el medidor de la misma lectura va al 100 %.
    test.fail();
    await camaraDeLuminancia(page, 'rgb(255,255,255)');
    await abrirYMedir(page);
    await expect(page.locator(VALOR)).toHaveText('100');
    await page.getByRole('button', { name: 'Ver el historial de lecturas' }).click();
    await page.waitForTimeout(1500);

    const medidas = await page.evaluate(() => ({
      barra: (document.querySelector('[class*="historyBar"]') as HTMLElement | null)?.style.height ?? '',
      medidor: (document.querySelector('[class*="meterFill"]') as HTMLElement | null)?.style.width ?? '',
    }));
    expect(medidas.medidor).toBe('100%');
    expect(parseFloat(medidas.barra)).toBeCloseTo(100, 0);

    // La media, fotografiada en el mismo fotograma que las barras: k muestras a 100 de n.
    await page.evaluate(() => window.__pintarCamara?.('rgb(0,0,0)'));
    const mezcla = await page.evaluate(
      () =>
        new Promise<{ n: number; k100: number; media: number }>((resolver, rechazar) => {
          const limite = window.setTimeout(() => rechazar(new Error('sin mezcla de 100 y 0 en 5 s')), 5000);
          const mirar = (): void => {
            const niveles = Array.from(document.querySelectorAll('[class*="historyBar"]')).map((b) =>
              parseInt(b.getAttribute('title') ?? '', 10),
            );
            const k100 = niveles.filter((x) => x === 100).length;
            const k0 = niveles.filter((x) => x === 0).length;
            const stats = document.querySelector('[class*="historyStats"]')?.textContent ?? '';
            const media = /Media:\s*(\d+)/.exec(stats);
            if (k100 >= 20 && k0 >= 20 && media) {
              window.clearTimeout(limite);
              resolver({ n: niveles.length, k100, media: Number(media[1]) });
            } else {
              requestAnimationFrame(mirar);
            }
          };
          mirar();
        }),
    );
    expect(mezcla.media).toBe(Math.round((100 * mezcla.k100) / mezcla.n));
  });

  test('HALLAZGO (09/11/2026, ABIERTO) · una referencia que no se puede leer («500 lx», 0, negativa) se rechaza sin decir nada', async ({
    page,
  }) => {
    // `calibrate()` exige un número finito > 0 y una señal > 0, y si no los tiene RETORNA: no
    // hay mensaje, ni aria-invalid, ni foco; el panel sigue abierto con lo escrito. «500 lx» es
    // lo que escribe quien lee la etiqueta «Valor real en lux». Medido el 09/11/2026 con «500 lx»,
    // «500 lux», «abc», «0», «-5» y con el objetivo tapado (señal 0): ningún aviso.
    // Esperado: un aviso de la app (role="alert" dentro del medidor, no el anunciador de Next).
    test.fail();
    await camaraDeLuminancia(page, 'rgb(128,128,128)');
    await abrirYMedir(page);
    await expect(page.locator(VALOR)).toHaveText('50');
    await page.getByTitle('Calibrar').click();
    await esperarHidratacion(page, [CALIBRACION]);
    await page.locator(CALIBRACION).fill('500 lx');
    await esperarValorEnReact(page, CALIBRACION, '500 lx');
    await page.getByRole('button', { name: 'Calibrar', exact: true }).click();

    await expect(page.locator(VALOR)).toHaveText('50');
    await expect(page.locator('[class*="meterPanel"] [role="alert"]')).toBeVisible({ timeout: 3000 });
  });

  test('HALLAZGO (09/11/2026, ABIERTO) · la FAQ visible responde a «¿es preciso frente a uno profesional?» con el sensor de luz ambiente, y el FAQPage con la cámara', async ({
    page,
  }) => {
    // Es la misma pregunta con dos redacciones. El FAQPage (reescrito el 18/09) explica que la
    // cámara compensa la exposición y que sin calibrar no hay lux; la FAQ visible, que no se
    // tocó, sigue hablando de «sensores de luz ambiente […] útiles para estimaciones
    // orientativas». Esperado: una sola respuesta, la misma en los dos sitios.
    test.fail();
    await page.goto('/luxometro/');
    const respuestaLd = await page.evaluate(() => {
      for (const s of Array.from(document.querySelectorAll('script[type="application/ld+json"]'))) {
        const datos = JSON.parse(s.textContent ?? '{}') as {
          '@type'?: string;
          mainEntity?: Array<{ name: string; acceptedAnswer: { text: string } }>;
        };
        if (datos['@type'] === 'FAQPage') {
          return datos.mainEntity?.find((q) => q.name.includes('profesional'))?.acceptedAnswer.text ?? '';
        }
      }
      return '';
    });
    expect(respuestaLd).toContain('reajusta la exposición');

    await page.getByRole('button', { name: /Ver guía|guía educativa/i }).first().click();
    const visible = page.locator('[class*="faqItem"]').filter({ hasText: 'comparado con uno profesional' });
    await expect(visible).toHaveCount(1);
    await expect(visible).toContainText(respuestaLd);
  });

  test('HALLAZGO (09/11/2026, ABIERTO) · la FAQ «¿Por qué mi sensor no funciona?» contradice el aviso nuevo sobre Firefox y Chrome', async ({
    page,
  }) => {
    // El aviso del bloque educativo (reescrito el 18/09) dice que AmbientLightSensor «está tras
    // un flag en Chrome y no existe en Safari ni en Firefox»; la FAQ de la misma página sigue
    // diciendo «Firefox la soporta con configuración especial; Chrome la soporta en Android con
    // sensor hardware presente».
    test.fail();
    await page.goto('/luxometro/');
    await page.getByRole('button', { name: /Ver guía|guía educativa/i }).first().click();
    await expect(page.locator('[class*="warningBox"]')).toContainText('no existe en Safari ni en Firefox');
    const faq = page.locator('[class*="faqItem"]').filter({ hasText: '¿Por qué mi sensor no funciona' });
    await expect(faq).toHaveCount(1);
    await expect(faq).not.toContainText('Firefox la soporta');
  });

  test('HALLAZGO (09/11/2026, ABIERTO) · las tarjetas sociales siguen prometiendo que «mide» la luz', async ({
    page,
  }) => {
    // La reparación bajó `description` y el `jsonLd` a «Estima la luz […] nivel relativo, y lux
    // si lo calibras», pero dejó og:description «Mide la luz ambiente con tu móvil o celular» y
    // twitter:description «Mide la intensidad de luz con tu móvil o celular».
    test.fail();
    await page.goto('/luxometro/');
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /^Estima la luz/);
    await expect(page.locator('meta[property="og:description"]')).not.toHaveAttribute('content', /^Mide/);
    await expect(page.locator('meta[name="twitter:description"]')).not.toHaveAttribute('content', /^Mide/);
  });
});
