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
