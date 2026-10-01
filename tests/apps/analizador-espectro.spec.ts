import { test, expect, devices, Page } from '@playwright/test';
import { esperarHidratacion, sembrarValor } from './_hidratacion';

/**
 * Analizador de Espectro — regresión de la VERDAD FÍSICA, no de la carga.
 *
 * QUÉ PROMETE
 *   · <h1>: «Analizador de Espectro». Subtítulo: «Visualiza las frecuencias de audio en
 *     tiempo real. Ideal para músicos, técnicos de sonido y curiosos del audio».
 *   · En pantalla, dos cifras: «Frecuencia dominante» en hercios y «Nota más cercana».
 *   · metadata.ts / JSON-LD declara «Análisis FFT en tiempo real con fftSize 8192 para alta
 *     resolución frecuencial», «Visualización en modo barras o modo línea sobre escala
 *     logarítmica 20 Hz–20 kHz», «Detección de frecuencia dominante y nota musical más
 *     cercana (temperamento igual)» y «Control de sensibilidad ajustable».
 *   · El bloque educativo la ofrece para «eliminar feedback en directo», «ecualizar una
 *     mezcla», «detectar ruidos no deseados (50 Hz en Europa)» y «física del sonido».
 *
 * DÓNDE VIVE EL CÁLCULO — hasta el 29/09/2026, dentro de `analyzeLoop` en
 * app/analizador-espectro/page.tsx. Desde ce2dfa44 el pico lo busca el motor COMPARTIDO con
 * generador-tonos, `picoDominante` de lib/calculadoras/frecuenciaDominante.ts, al que esta app
 * llama con sus valores por defecto (20 Hz–20 kHz) y con los BYTES de getByteFrequencyData;
 * el generador le pasa dB en coma flotante. La nota y los cents siguen en page.tsx. Ver la
 * re-inspección del 01/10/2026 al final del fichero.
 *
 * CÓMO SE PRUEBA — Chromium con dispositivo de medios falso NO basta: su tono es un beep
 * periódico y no se elige la frecuencia. Aquí se SUSTITUYE `getUserMedia` por un stream
 * generado con un OscillatorNode a una frecuencia exacta (ver `inyectarTono`), de modo que se
 * sabe de antemano en qué bin debe caer el pico. `playwright.config.ts` NO trae los
 * argumentos de medios falsos ni el permiso de micrófono, y por eso este fichero los declara
 * con `test.use()`: sin ellos, `getUserMedia` se queda esperando un diálogo que nadie va a
 * contestar. Se comprobó además que el audio ARRANCA de verdad (AudioContext en `running` y
 * `getByteFrequencyData` devolviendo un bin saturado a 255, no un array de ceros).
 *
 * LOS CASOS, RESUELTOS A MANO ANTES DE ABRIR EL NAVEGADOR
 *
 *   La cadena del cálculo, leída del código: `freqPerBin = sampleRate / fftSize`, que es lo
 *   CORRECTO (sampleRate/2 es Nyquist y se reparte entre fftSize/2 bins; aquí no hay el
 *   típico factor 2 de más). Con fftSize 8192 y 44.100 Hz salen 4.096 bins de 5,3833 Hz.
 *
 *   ── LO QUE HACÍA HASTA EL 18/09/2026 ──
 *   NO publicaba el bin del pico: agrupaba el espectro en 64 bandas logarítmicas
 *   `20 · 1000^(i/64)`, PROMEDIABA los bins de cada banda, se quedaba con la banda de media
 *   mayor y mostraba el CENTRO ARITMÉTICO de sus bordes. Cada banda mide 1000^(1/64) = 1,114
 *   → 1,87 semitonos de ancho, así que la cifra solo podía tomar 64 valores en toda la
 *   escala, y encima el promediado hacía desaparecer los agudos: la banda de 50 Hz tiene 3
 *   bins y la de 10 kHz, 201, así que un pico puro saturado a 255 promediaba 1,3 y no
 *   llegaba al umbral de 20. Por eso un tono de 10 kHz daba «-- Hz».
 *
 *   ── LO QUE HACE DESDE LA REPARACIÓN ──
 *   Recorre los bins reales entre 20 Hz y 20 kHz, se queda con el máximo y lo afina por
 *   interpolación parabólica con sus dos vecinos: δ = (y₋₁ − y₊₁) / (2·(y₋₁ − 2y₀ + y₊₁)).
 *   El umbral de señal se aplica al bin del pico, no a la media de su banda. Y las 64 barras
 *   del dibujo toman el MÁXIMO de su rango en vez de la media, para que un pico estrecho en
 *   agudos se vea donde está. La nota sale del temperamento igual —12·log2(f/440) + 69—, con
 *   su desviación en cents.
 *
 *   CASO NORMAL — tono puro de 440 Hz (La4): «440 Hz» ± un bin y medio, y «A4».
 *       Antes: «434 Hz», y nunca podía dar 440.
 *
 *   CASO LÍMITE — silencio y agudos.
 *       Silencio (oscilador con ganancia 0): todos los bins a 0, el pico no supera el umbral
 *       de 20 → «-- Hz». No inventa un pico donde no lo hay.
 *       Tono de 10.000 Hz: hoy se lee a ±7 Hz. Antes, «-- Hz».
 *
 *   CASO DE RECHAZO — permiso denegado y sin dispositivo.
 *       ✔ medido: `NotAllowedError` → «Permiso de micrófono denegado. Permite el acceso en la
 *       configuración del navegador.» en un `role="alert"`; `NotFoundError` → «No se encontró
 *       ningún micrófono. Conecta uno e intenta de nuevo.». El botón «Iniciar análisis» sigue
 *       disponible para reintentar y el canvas no pinta ningún espectro falso.
 *
 * LO QUE ESTÁ SANO (verificado en producción el 18/09/2026)
 *   · `freqPerBin` es correcto y el analizador se configura como promete: fftSize 8192,
 *     4.096 bins, smoothingTimeConstant 0,8, minDecibels/maxDecibels por defecto (−100/−30).
 *   · El silencio se reconoce como silencio y los dos errores de micrófono se explican bien.
 *   · La app NO presenta decibelios en ninguna parte, así que no hay dB SPL falsos: la
 *     palabra «decibel» no aparece en la página. Y el bloque educativo avisa por escrito de
 *     que el micrófono «tiene su propia respuesta en frecuencia no calibrada» y de que los
 *     resultados son «orientativos, no mediciones de laboratorio». Es exactamente el criterio
 *     del proyecto para una app de sensor.
 *   · El audio se detiene de verdad al pulsar «Detener» (tracks parados y AudioContext
 *     cerrado), y el efecto de desmontaje repite esa limpieza.
 *
 * LOS 8 HALLAZGOS, al final, ya como candados de regresión. Cada uno lleva escrito qué hacía
 * la app antes y con qué medida se demostró, para que el día que alguien cambie el motor sepa
 * contra qué está chocando.
 */

// El navegador necesita dispositivo de medios falso Y el permiso concedido: sin ellos
// `getUserMedia` abre un diálogo nativo que ningún test puede contestar y la app se queda en
// la pantalla de bienvenida. playwright.config.ts no los trae (sería innecesario para las
// otras ~1.100 apps), así que se declaran aquí.
test.use({
  launchOptions: {
    args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'],
  },
  permissions: ['microphone'],
});

/** El canvas es lo único que dibuja; la app no le pone role ni aria-label. */
const CANVAS = 'canvas';
/** «434 Hz» — la cifra grande de la izquierda. */
const frecuencia = (page: Page) => page.locator('[class*="freqValue"]');
/** «A4» — la cifra grande de la derecha. */
const nota = (page: Page) => page.locator('[class*="noteValue"]');
const botonIniciar = (page: Page) => page.getByRole('button', { name: /Iniciar análisis/ });
/**
 * El aviso de error de la app. Hay que acotarlo por clase: `[role="alert"]` a secas casa
 * también con el `__next-route-announcer__` que Next inyecta en todas las páginas, y el
 * modo estricto de Playwright rechaza el localizador ambiguo.
 */
const mensajeError = (page: Page) => page.locator('[class*="errorMessage"][role="alert"]');

/**
 * Sustituye el micrófono por un tono puro de frecuencia conocida, o por un fallo concreto.
 * Se instala ANTES del goto, porque la app captura `getUserMedia` al pulsar el botón.
 *
 * @param hz    Frecuencia del oscilador en hercios. 0 = silencio (ganancia a cero).
 * @param fallo Si se indica, `getUserMedia` rechaza con un error de ese `name`.
 */
async function inyectarTono(page: Page, hz: number, fallo: string | null = null) {
  await page.addInitScript(
    ({ hz: frecuenciaHz, fallo: nombreError }: { hz: number; fallo: string | null }) => {
      navigator.mediaDevices.getUserMedia = async (): Promise<MediaStream> => {
        if (nombreError) {
          const error = new Error('micrófono simulado');
          error.name = nombreError;
          throw error;
        }
        const contexto = new AudioContext();
        await contexto.resume();
        const oscilador = contexto.createOscillator();
        oscilador.type = 'sine';
        oscilador.frequency.value = frecuenciaHz || 440;
        const ganancia = contexto.createGain();
        ganancia.gain.value = frecuenciaHz === 0 ? 0 : 0.9;
        const destino = contexto.createMediaStreamDestination();
        oscilador.connect(ganancia);
        ganancia.connect(destino);
        oscilador.start();
        return destino.stream;
      };
    },
    { hz, fallo },
  );
}

/** Abre la app, espera la hidratación y arranca el análisis con el tono ya inyectado. */
async function arrancar(page: Page, hz: number) {
  await inyectarTono(page, hz);
  await page.goto('/analizador-espectro/');
  // Todo aquí arranca a clics, y un clic anterior a la hidratación se pierde igual que una
  // escritura: el deslizador de sensibilidad sirve de testigo de que React ya está montado.
  await esperarHidratacion(page, ['#sensitivity-slider']);
  await botonIniciar(page).click();
  await expect(frecuencia(page)).toBeVisible();
  // Dos segundos: con smoothingTimeConstant 0,8 el espectro necesita varios fotogramas para
  // estabilizarse, y la cifra se refresca en cada requestAnimationFrame.
  await page.waitForTimeout(2000);
}

/**
 * Cuenta los píxeles del canvas cuyo color está a distancia ≤ 3 por canal del indicado.
 * Es el único testigo posible de lo que la app dibuja: el canvas no expone nada más.
 */
async function contarPixeles(page: Page, rgb: [number, number, number]): Promise<number> {
  return page.evaluate(
    ({ color }) => {
      const lienzo = document.querySelector('canvas') as HTMLCanvasElement;
      const ctx = lienzo.getContext('2d', { willReadFrequently: true });
      if (!ctx) return -1;
      const datos = ctx.getImageData(0, 0, lienzo.width, lienzo.height).data;
      let total = 0;
      for (let i = 0; i < datos.length; i += 4) {
        if (
          Math.abs(datos[i] - color[0]) <= 3 &&
          Math.abs(datos[i + 1] - color[1]) <= 3 &&
          Math.abs(datos[i + 2] - color[2]) <= 3
        ) {
          total++;
        }
      }
      return total;
    },
    { color: rgb },
  );
}

/** El relleno bajo la curva del modo línea: rgba(46,134,171,0.2) sobre el fondo blanco. */
const RELLENO_LINEA: [number, number, number] = [213, 231, 238];
/** #2E86AB, el azul de marca con el que el código PIDE trazar la curva del modo línea. */
const AZUL_MARCA: [number, number, number] = [46, 134, 171];

/** La cifra de la izquierda, leída como número: «10.002 Hz» → 10002. */
async function hercios(page: Page): Promise<number> {
  const texto = ((await frecuencia(page).textContent()) ?? '').replace(/\s/g, '');
  return Number(texto.replace(' Hz', '').replace(/\./g, '').replace(',', '.').replace('Hz', ''));
}

/**
 * Un bin de la FFT a 44,1 kHz con fftSize 8192 mide 5,38 Hz, y la interpolación parabólica
 * afina dentro de él. Se toleran 9 Hz —bin y medio— y no menos: `getByteFrequencyData`
 * entrega enteros de 0 a 255, el suavizado de 0,8 arrastra los fotogramas anteriores y la
 * ventana de Blackman ensancha el pico, así que apretar más sería fijar ese ruido y no la
 * medida. Medido el 18/09/2026: el error real se queda en 7 Hz a 1 kHz y a 10 kHz, o sea
 * 0,7 % y 0,07 %. Antes de la reparación era del 2,9 % a 1 kHz y a 10 kHz no había cifra.
 *
 * Re-inspección del 01/10/2026: esos 7 Hz NO eran ruido de los bytes. `inyectarTono` suena con
 * ganancia 0,9 y satura varios bins seguidos a 255; el motor elige el PRIMERO de la meseta y le
 * suma medio bin, así que la cifra se va hacia abajo hasta un bin. Con un tono a −26 dBFS el
 * error baja a menos de 1 Hz (ver «Re-inspección» al final).
 *
 * Reparado el 01/10/2026 (hallazgo 2567): la cifra se mide ahora sobre getFloatFrequencyData,
 * los dB sin recortar, y la meseta desaparece. Con eso los 9 Hz ya no tapan nada: se aprieta a
 * 1 Hz, que es lo que da el afinado parabólico sobre la ventana de Blackman (su sesgo es de unas
 * centésimas de bin, 0,2 Hz) con margen para el suavizado. Con 9 Hz el sesgo de la meseta —hasta
 * un bin, 5,9 Hz— pasaba por estos tests sin que nadie lo viera.
 */
const TOLERANCIA_HZ = 1;

test.describe('Analizador de Espectro · lo que funciona', () => {
  test('un tono puro de 440 Hz se lee como 440 Hz y se etiqueta A4', async ({ page }) => {
    await arrancar(page, 440);
    expect(Math.abs((await hercios(page)) - 440)).toBeLessThanOrEqual(TOLERANCIA_HZ);
    await expect(nota(page)).toContainText('A4');
  });

  test('el silencio no inventa ningún pico', async ({ page }) => {
    // Oscilador con ganancia 0: los 4.096 bins valen 0, así que el pico no supera el umbral
    // de 20 del código y la app no arriesga una cifra.
    await arrancar(page, 0);
    await expect(frecuencia(page)).toHaveText('-- Hz');
    await expect(nota(page)).toHaveText('--');
  });

  test('un zumbido de red de 50 Hz cae donde debe', async ({ page }) => {
    // Es el caso que la propia app propone («zumbidos eléctricos, 50 Hz en Europa»).
    await arrancar(page, 50);
    expect(Math.abs((await hercios(page)) - 50)).toBeLessThanOrEqual(TOLERANCIA_HZ);
  });

  test('el permiso denegado se explica y deja reintentar', async ({ page }) => {
    await inyectarTono(page, 440, 'NotAllowedError');
    await page.goto('/analizador-espectro/');
    await esperarHidratacion(page, ['#sensitivity-slider']);
    await botonIniciar(page).click();
    await expect(mensajeError(page)).toContainText(
      'Permiso de micrófono denegado. Permite el acceso en la configuración del navegador.',
    );
    // No se queda colgada ni pinta un espectro falso: el botón sigue ahí para volver a probar
    // y la cifra de frecuencia dominante ni siquiera llega a existir.
    await expect(botonIniciar(page)).toBeVisible();
    await expect(frecuencia(page)).toHaveCount(0);
  });

  test('sin micrófono conectado lo dice con un mensaje útil', async ({ page }) => {
    await inyectarTono(page, 440, 'NotFoundError');
    await page.goto('/analizador-espectro/');
    await esperarHidratacion(page, ['#sensitivity-slider']);
    await botonIniciar(page).click();
    await expect(mensajeError(page)).toContainText(
      'No se encontró ningún micrófono. Conecta uno e intenta de nuevo.',
    );
    await expect(frecuencia(page)).toHaveCount(0);
  });

  test('el analizador se configura como promete el JSON-LD', async ({ page }) => {
    await arrancar(page, 440);
    // «Análisis FFT en tiempo real con fftSize 8192 para alta resolución frecuencial».
    // Se lee del propio AnalyserNode espiando la lectura que hace el bucle de dibujo.
    const parametros = await page.evaluate(() => {
      return new Promise<{ fftSize: number; bins: number; suavizado: number; picoNoNulo: boolean }>(
        (resolver) => {
          const original = AnalyserNode.prototype.getByteFrequencyData;
          AnalyserNode.prototype.getByteFrequencyData = function (
            this: AnalyserNode,
            arreglo: Parameters<typeof original>[0],
          ) {
            original.call(this, arreglo);
            AnalyserNode.prototype.getByteFrequencyData = original;
            let maximo = 0;
            for (let i = 0; i < arreglo.length; i++) if (arreglo[i] > maximo) maximo = arreglo[i];
            resolver({
              fftSize: this.fftSize,
              bins: this.frequencyBinCount,
              suavizado: this.smoothingTimeConstant,
              // Un canvas dibujándose sobre un array de ceros es el fallo que hay que cazar:
              // con el tono inyectado el pico satura, así que el audio corre de verdad.
              picoNoNulo: maximo > 0,
            });
          };
        },
      );
    });
    expect(parametros.fftSize).toBe(8192);
    expect(parametros.bins).toBe(4096); // frequencyBinCount = fftSize / 2
    expect(parametros.suavizado).toBeCloseTo(0.8, 5);
    expect(parametros.picoNoNulo).toBe(true);
  });
});

test.describe('Los 8 hallazgos del 18/09/2026, reparados el mismo día', () => {
  test('884 · un tono de 10 kHz se detecta, en vez de desaparecer', async ({ page }) => {
    // El bucle promediaba TODOS los bins de cada banda logarítmica, y el número de bins por
    // banda crece con la frecuencia: 3 en la de 50 Hz, 23 en la de 1 kHz, 201 en la de
    // 10 kHz. Un pico puro saturado a 255 daba una media de 255/201 = 1,3 y el código exigía
    // más de 20, así que por encima de 3-5 kHz la app decía «-- Hz» con el pico a la vista en
    // el espectro. Justo la zona que ofrece para cazar acoples y para la banda de presencia.
    await arrancar(page, 10000);
    expect(Math.abs((await hercios(page)) - 10000)).toBeLessThanOrEqual(TOLERANCIA_HZ);
  });

  test('884.bis · también a 5 kHz y a 15 kHz, que era donde estaba el corte', async ({ page }) => {
    // Medido entonces: 3.000 Hz daba «3029 Hz» y 5.000 Hz ya daba «-- Hz».
    await arrancar(page, 5000);
    expect(Math.abs((await hercios(page)) - 5000)).toBeLessThanOrEqual(TOLERANCIA_HZ);

    await arrancar(page, 15000);
    expect(Math.abs((await hercios(page)) - 15000)).toBeLessThanOrEqual(TOLERANCIA_HZ);
  });

  test('886 · la cifra usa la resolución que la app dice tener', async ({ page }) => {
    // Venía de una rejilla de 64 bandas de 1,87 semitonos de ancho, de las que se publicaba el
    // centro aritmético: solo podía tomar 64 valores en toda la escala, y se daba al hercio.
    // Un 1.000 Hz perfecto salía «1029 Hz» (+2,94 %) y un 440 Hz, «434 Hz», que además nunca
    // podía dar 440. El JSON-LD prometía «alta resolución frecuencial con fftSize 8192», y esa
    // resolución existía: se tiraba al promediar.
    await arrancar(page, 1000);
    expect(Math.abs((await hercios(page)) - 1000)).toBeLessThanOrEqual(TOLERANCIA_HZ);

    // Y la página dice de dónde sale la cifra, en vez de darla por medida al hercio sin más.
    await expect(page.locator('[class*="freqNota"]')).toContainText('5,4 Hz');
  });

  test('887 · la nota más cercana es la nota más cercana, con sus cents', async ({ page }) => {
    // MUSICAL_NOTES solo tenía LA y DO —16 entradas para ocho octavas, no las doce por
    // octava—, buscaba la mínima distancia LINEAL en hercios cuando la musical es logarítmica,
    // y aceptaba hasta un 10 % de desviación, que son ±1,6 semitonos. Con eso cualquier tono
    // recibía etiqueta y casi siempre la equivocada.
    //
    // 466,16 Hz es La♯4 exacto: 12·log2(466,16/440) + 69 = 70,0, es decir MIDI 70 = A#4.
    // La app devolvía «C5» (523,3 Hz), dos semitonos por encima.
    await arrancar(page, 466.16);
    await expect(nota(page)).toContainText('A#4');

    // 1.000 Hz cae entre notas: 12·log2(1000/440) + 69 = 83,21 → MIDI 83 = B5, +21 cents.
    // Antes salía «C6» (1.046,5 Hz). Los cents son lo que convierte la etiqueta en una
    // afinación utilizable en vez de en una aproximación muda.
    await arrancar(page, 1000);
    await expect(nota(page)).toContainText('B5');
    await expect(nota(page)).toContainText('¢');
  });

  test('887.bis · el panel de notas enseña las doce, no ocho veces LA', async ({ page }) => {
    // Imprimía los índices PARES de una lista que ya solo tenía LA y DO, así que en pantalla
    // quedaban ocho notas LA: cuando la app decía «C5», esa nota no estaba en la tabla.
    await page.goto('/analizador-espectro/');
    const panel = page.locator('[class*="notesPanel"]');
    await expect(panel).toContainText('A4');
    await expect(panel).toContainText('C#4');
    await expect(panel).toContainText('F4');
    await expect(panel).toContainText('440,0 Hz');
  });

  test('885 · los controles funcionan con el análisis en marcha', async ({ page }) => {
    // `analyzeLoop` era un useCallback con dependencias [viewMode, sensitivity, showPeaks]
    // que se auto-encadenaba con requestAnimationFrame, y nadie reenganchaba la cadena al
    // cambiar esas dependencias: el bucle seguía ejecutando para siempre el closure capturado
    // al pulsar «Iniciar». Cambiar de Barras a Línea no movía un solo píxel del canvas
    // mientras el aria-pressed sí pasaba a true: la interfaz mentía activamente.
    await arrancar(page, 440);
    await expect(page.getByRole('button', { name: /Barras/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(await contarPixeles(page, RELLENO_LINEA)).toBe(0);

    await page.getByRole('button', { name: /Línea/ }).click();
    await page.waitForTimeout(500);

    // El relleno bajo la curva solo existe en modo línea: si el bucle siguiera con el closure
    // viejo, aquí seguiría habiendo 0 píxeles de ese color.
    expect(await contarPixeles(page, RELLENO_LINEA)).toBeGreaterThan(0);
  });

  test('888 · el canvas se dibuja con los colores de marca, no en negro', async ({ page }) => {
    // El canvas NO resuelve `var(--primary)`: ignora el valor en silencio y conserva el
    // anterior. Medido: strokeStyle se quedaba en «#000000», así que la curva salía negra en
    // vez del azul meskeIA y la rejilla de referencia, negra sobre fondo oscuro, invisible.
    await arrancar(page, 440);
    await page.getByRole('button', { name: /Línea/ }).click();
    await page.waitForTimeout(500);

    expect(await contarPixeles(page, AZUL_MARCA)).toBeGreaterThan(0);
  });

  test('889 · la escala impresa coincide con el eje del gráfico', async ({ page }) => {
    // `.freqScale` era un flex con justify-content: space-between y cinco etiquetas, que las
    // repartía UNIFORMEMENTE, mientras el canvas dibuja 20 Hz–20 kHz en logaritmo. «10 kHz»
    // salía al 73,5 % del ancho en vez de al 90 %: quien leyera un pico con la regleta lo
    // situaba casi una octava por debajo de donde está.
    await page.goto('/analizador-espectro/');
    const posiciones = await page.evaluate(() => {
      const regleta = document.querySelector('[class*="freqScale"]') as HTMLElement;
      const ancho = regleta.getBoundingClientRect().width;
      const izquierda = regleta.getBoundingClientRect().left;
      return Array.from(regleta.querySelectorAll('span')).map((etiqueta) => {
        const caja = etiqueta.getBoundingClientRect();
        return {
          texto: etiqueta.textContent ?? '',
          centro: ((caja.left + caja.width / 2 - izquierda) / ancho) * 100,
        };
      });
    });

    // Las posiciones canónicas son log10(f/20)/3 · 100: 20 Hz → 0 %, 100 Hz → 23,3 %,
    // 1 kHz → 56,6 %, 10 kHz → 90,0 %, 20 kHz → 100 %. Se tolera medio ancho de etiqueta,
    // porque las de los extremos se acuestan sobre el borde para no salirse.
    const esperadas: Record<string, number> = {
      '100 Hz': 23.3,
      '1 kHz': 56.6,
      '10 kHz': 90.0,
    };
    for (const [texto, esperada] of Object.entries(esperadas)) {
      const medida = posiciones.find((p) => p.texto === texto);
      expect(medida, `falta la etiqueta ${texto}`).toBeDefined();
      expect(Math.abs((medida?.centro ?? 0) - esperada)).toBeLessThan(4);
    }
  });

  test('890 · la FAQ describe ESTE analizador y no otro', async ({ page }) => {
    // Decía «con un buffer de 2048 muestras a 48.000 Hz obtienes 1024 bins separados por
    // ~23 Hz». La aritmética de la frase era correcta pero no es esta app: fftSize 8192,
    // 4.096 bins de 5,4 Hz, agregados a 64 barras. La pregunta era justo «¿cuántas
    // barras/bins tiene el análisis?» y no daba el número de ninguno de los dos.
    await page.goto('/analizador-espectro/');
    await page.getByRole('button', { name: /Ver guía|guía educativa/i }).first().click();

    const respuesta = page
      .locator('[class*="faqItem"]')
      .filter({ hasText: '¿Cuántas barras/bins de frecuencia tiene el análisis?' });
    await expect(respuesta).toContainText('8.192');
    await expect(respuesta).toContainText('4.096');
    await expect(respuesta).toContainText('64 barras');
    await expect(respuesta).not.toContainText('1024 bins');
  });

  test('891 · los botones llevan type y el canvas tiene nombre accesible', async ({ page }) => {
    // Pasivo anterior al candado check:a11y-jsx (el fichero es de junio de 2026). Cuatro
    // botones sin type —un submit accidental dentro de un form—, ocho emojis pegados a texto
    // sin aria-hidden, un <label>Vista:</label> que no rotulaba nada porque los conmutadores
    // son botones, y el canvas, que es el 100 % de la salida visual, sin role ni aria-label.
    await page.goto('/analizador-espectro/');
    // Acotado al panel de la app A PROPÓSITO. Los que quedan sin `type` en la página son de
    // componentes GLOBALES —Sidebar, SidebarMobile, ThemeToggle y ErrorBoundary—, que
    // arrastran el mismo pasivo en las más de mil apps del catálogo: repararlos ahí es otro
    // lote, y además invalida la cola entera del Inspector por cambio de dependencia.
    const panel = page.locator('[class*="analyzerPanel"]');
    expect(await panel.locator('button:not([type])').count()).toBe(0);
    expect(await panel.locator('button').count()).toBeGreaterThanOrEqual(3);

    const lienzo = page.locator(CANVAS);
    await expect(lienzo).toHaveAttribute('role', 'img');
    await expect(lienzo).toHaveAttribute('aria-label', /espectro de frecuencias/i);

    // El grupo de vista se rotula con role="group" + aria-labelledby, que sí es lo que
    // corresponde a dos botones conmutadores.
    await expect(page.getByRole('group', { name: 'Vista:' })).toBeVisible();
  });
});

/* ══════════════════════════════════════════════════════════════════════════════════════════
 * RE-INSPECCIÓN DEL 01/10/2026 — ¿le ha roto algo el motor de generador-tonos?
 *
 * Entre la reparación del 18/09 y hoy, generador-tonos estrenó un medidor con micrófono y sacó
 * el algoritmo de esta app a lib/calculadoras/frecuenciaDominante.ts (ce2dfa44), y luego lo
 * cambió para su hallazgo 2412 (c3e3e8ca). Lo que cambió para ESTA app, leído en el diff:
 *   · La firma y los valores por defecto, no: `picoDominante(bytes, sampleRate, fftSize)`, con
 *     fMin = 20 y fMax = 20000. El umbral «> 20» sigue en page.tsx, sin prominencia ni lectura
 *     estable: eso son del generador, que trabaja en dB.
 *   · El primer bin del rango pasa de floor(20/Δf) = 3 a ceil(20/Δf) = 4 (17,58 → 23,44 Hz a
 *     48 kHz; 16,15 → 21,53 Hz a 44,1 kHz).
 *   · El pico tiene que ser la CIMA de su lóbulo (±3 bins, mirando el espectro entero), y si el
 *     vértice afinado cae fuera de [20, 20000] no hay pico.
 *
 * RESUELTO A MANO ANTES DE ABRIR EL NAVEGADOR (fftSize 8192; se fija el contexto a 48 kHz para
 * que la cuenta no dependa del dispositivo: medido hoy, el mismo Chromium arrancó una vez a
 * 44,1 kHz y otras a 48 kHz): Δf = 48000/8192 = 5,859375 Hz.
 *   · 440 Hz → bin 75,09 → «440 Hz», A4 = MIDI 69, 0 ¢. Medio bin son 2,93 Hz = 11,5 ¢, así
 *     que se exige ±1 Hz y ±4 ¢: más que eso es afinado perdido o sesgado.
 *   · 82,41 Hz (Mi2, la sexta cuerda de la guitarra) → 12·log2(82,41/440)+69 = 40,00 → E2, 0 ¢.
 *   · 21 Hz → bin 3,58: la cima cae en el bin 4, dentro del rango → 12·log2(21/440)+69 = 16,33
 *     → E0 +33 ¢.
 *   · 20,3 Hz → bin 3,47: la cima cae en el bin 3 (17,58 Hz), FUERA del rango nuevo, y el 4 es
 *     su flanco → el motor no devuelve pico. Pero 20,3 Hz está dentro de los 20 Hz–20 kHz que
 *     la app promete: 12·log2(20,3/440)+69 = 15,74 → E0 −26 ¢.
 *   · 25 Hz → G0: 12·log2(25/440)+69 = 19,35 → MIDI 19 = G0 +35 ¢.
 *
 * El nivel importa: getByteFrequencyData recorta en maxDecibels = −30 dB, y un seno de
 * amplitud A llega al bin del pico a unos −13,8 dB + 20·log10(A) (medido: 0,02 → byte 190 =
 * −47,8 dB). Por encima de unos −16 dBFS el pico se aplana en una MESETA de bytes a 255.
 * Medido con WAV por el micrófono falso a 48 kHz, antes de escribir estos tests:
 *     tono      a −34 dBFS (0,02)      a −6 dBFS (0,5)
 *     55 Hz     55 Hz · A1 +4 ¢        50 Hz · G1 +28 ¢     (bytes 8, 9, 10 a 255)
 *     82,41 Hz  82 Hz · E2 −1 ¢        79 Hz · D#2 +29 ¢    (bytes 13, 14, 15 a 255)
 *     110 Hz    110 Hz · A2 −1 ¢       108 Hz · A2 −25 ¢
 *     440 Hz    440 Hz · A4 +0 ¢       439 Hz · A4 −5 ¢ (y fotogramas de 433 Hz · −26 ¢)
 * El motor se queda con el PRIMER bin de la meseta (esCimaDeLobulo salta la meseta hacia la
 * derecha) y la parábola, con un vecino a 255, suma exactamente medio bin. Esto NO lo trajo el
 * motor nuevo: el código en línea del 18/09 también elegía el primero. Pero generador-tonos no
 * lo sufre, porque le pasa dB en coma flotante, que no se recortan.
 *
 * REPARADOS el 01/10/2026 los 8 (2567-2574). La cifra se mide ahora sobre getFloatFrequencyData
 * (dB sin recortar) y el motor da el centro de una meseta y decide el rango por la frecuencia
 * afinada de cada cima; los goldens están en tests/frecuencia-dominante-motor.spec.ts.
 * ══════════════════════════════════════════════════════════════════════════════════════════ */

type VentanaEspia = Window & {
  __contextosApp?: AudioContext[];
  __pistas?: MediaStreamTrack[];
  __maxByte?: number;
  __rellenos?: { color: string; alto: number; ancho: number; lienzoAncho: number; lienzoAlto: number }[];
};

/**
 * Espía lo que la APP crea: el contexto que llama a createMediaStreamSource (el del tono
 * inyectado no lo llama) y el byte más alto que lee el bucle de dibujo.
 */
async function espiarAudio(page: Page) {
  await page.addInitScript(() => {
    const w = window as VentanaEspia;
    w.__contextosApp = [];
    w.__maxByte = 0;
    const crearFuente = AudioContext.prototype.createMediaStreamSource;
    AudioContext.prototype.createMediaStreamSource = function (this: AudioContext, flujo: MediaStream) {
      w.__contextosApp?.push(this);
      return crearFuente.call(this, flujo);
    };
    const leerBytes = AnalyserNode.prototype.getByteFrequencyData;
    AnalyserNode.prototype.getByteFrequencyData = function (
      this: AnalyserNode,
      arreglo: Parameters<typeof leerBytes>[0],
    ) {
      leerBytes.call(this, arreglo);
      let maximo = 0;
      for (let i = 0; i < arreglo.length; i++) if (arreglo[i] > maximo) maximo = arreglo[i];
      w.__maxByte = maximo;
    };
  });
}

/**
 * Como `inyectarTono`, pero con el NIVEL del tono y la frecuencia de muestreo fijados: la
 * ganancia 0,9 de `inyectarTono` satura los bytes y mide la meseta, no el afinado.
 */
async function inyectarTonoNivel(page: Page, hz: number, ganancia: number, tasa = 48000) {
  await espiarAudio(page);
  await page.addInitScript(
    ({ hz: f, ganancia: g, tasa: sr }: { hz: number; ganancia: number; tasa: number }) => {
      const Original = window.AudioContext;
      class ContextoFijo extends Original {
        constructor(opciones?: AudioContextOptions) {
          super({ ...opciones, sampleRate: sr });
        }
      }
      window.AudioContext = ContextoFijo;
      navigator.mediaDevices.getUserMedia = async (): Promise<MediaStream> => {
        const contexto = new AudioContext();
        await contexto.resume();
        const oscilador = contexto.createOscillator();
        oscilador.type = 'sine';
        oscilador.frequency.value = f;
        const nivel = contexto.createGain();
        nivel.gain.value = g;
        const destino = contexto.createMediaStreamDestination();
        oscilador.connect(nivel);
        nivel.connect(destino);
        oscilador.start();
        return destino.stream;
      };
    },
    { hz, ganancia, tasa },
  );
}

async function arrancarNivel(page: Page, hz: number, ganancia: number, tasa = 48000) {
  await inyectarTonoNivel(page, hz, ganancia, tasa);
  await page.goto('/analizador-espectro/');
  await esperarHidratacion(page, ['#sensitivity-slider']);
  await botonIniciar(page).click();
  await expect(frecuencia(page)).toBeVisible();
  await page.waitForTimeout(2000);
  // El contexto de la app corre de verdad y a la tasa fijada; si no, las cuentas de arriba no valen.
  const contexto = await page.evaluate(() => {
    const c = (window as VentanaEspia).__contextosApp?.[0];
    return c ? { estado: c.state, tasa: c.sampleRate } : null;
  });
  expect(contexto).toEqual({ estado: 'running', tasa });
}

/** Los cents de la nota: «A4+0 ¢» → 0 · «E0−26 ¢» → −26 · sin cents → NaN. */
async function centsMostrados(page: Page): Promise<number> {
  const texto = (await nota(page).textContent()) ?? '';
  const m = texto.match(/([+−-])\s*(\d+)\s*¢/);
  if (!m) return Number.NaN;
  return (m[1] === '+' ? 1 : -1) * Number(m[2]);
}

/** −26 dBFS: muy por encima del umbral de 20 y lejos de saturar (byte de pico ≈ 210). */
const NIVEL_MODERADO = 0.05;
/** −6 dBFS: una cuerda o un silbido cerca del micrófono del móvil. */
const NIVEL_FUERTE = 0.5;

test.describe('Re-inspección 01/10/2026 · lo que el motor compartido NO ha roto', () => {
  test('440 Hz a −26 dBFS: «440 Hz», A4 y menos de 4 ¢', async ({ page }) => {
    await arrancarNivel(page, 440, NIVEL_MODERADO);
    expect(Math.abs((await hercios(page)) - 440)).toBeLessThanOrEqual(1);
    await expect(nota(page)).toContainText('A4');
    expect(Math.abs(await centsMostrados(page))).toBeLessThanOrEqual(4);
  });

  test('Mi2 (82,41 Hz) a −26 dBFS, sin saturar: «82 Hz», E2 a menos de 10 ¢', async ({ page }) => {
    // Testigo de que el sesgo del test de la meseta (abajo) depende del NIVEL y no del motor.
    await arrancarNivel(page, 82.41, NIVEL_MODERADO);
    expect(Math.abs((await hercios(page)) - 82.41)).toBeLessThanOrEqual(1);
    await expect(nota(page)).toContainText('E2');
    expect(Math.abs(await centsMostrados(page))).toBeLessThanOrEqual(10);
  });

  test('21 Hz a 48 kHz se lee: la cima cae en el bin 4, ya dentro del rango', async ({ page }) => {
    await arrancarNivel(page, 21, NIVEL_MODERADO);
    expect(Math.abs((await hercios(page)) - 21)).toBeLessThanOrEqual(1);
    await expect(nota(page)).toContainText('E0');
    expect(Math.abs((await centsMostrados(page)) - 33)).toBeLessThanOrEqual(6);
  });

  test('Iniciar → Detener dos veces: ninguna pista ni contexto queda vivo', async ({ page }) => {
    // Con el micrófono falso del navegador, sin tono inyectado.
    await espiarAudio(page);
    await page.addInitScript(() => {
      const w = window as VentanaEspia;
      w.__pistas = [];
      const original = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
      navigator.mediaDevices.getUserMedia = async (r?: MediaStreamConstraints) => {
        const flujo = await original(r);
        w.__pistas?.push(...flujo.getTracks());
        return flujo;
      };
    });
    await page.goto('/analizador-espectro/');
    await esperarHidratacion(page, ['#sensitivity-slider']);
    for (let vuelta = 0; vuelta < 2; vuelta++) {
      await botonIniciar(page).click();
      await expect(page.getByRole('button', { name: /Detener/ })).toBeVisible();
      await expect
        .poll(() => page.evaluate(() => (window as VentanaEspia).__contextosApp?.at(-1)?.state))
        .toBe('running');
      await page.getByRole('button', { name: /Detener/ }).click();
      await expect(botonIniciar(page)).toBeVisible();
    }
    const estado = await page.evaluate(() => {
      const w = window as VentanaEspia;
      return {
        contextos: (w.__contextosApp ?? []).map((c) => c.state),
        pistas: (w.__pistas ?? []).map((p) => p.readyState),
      };
    });
    expect(estado.contextos).toEqual(['closed', 'closed']);
    expect(estado.pistas).toEqual(['ended', 'ended']);
  });
});

test.describe('Re-inspección 01/10/2026 · hallazgos', () => {
  test(
    'REPARADO (01/10/2026), hallazgo 2567: con un tono fuerte la meseta de bytes saturados hundía la cifra — Mi2 a −6 dBFS salía «79 Hz · D#2»',
    async ({ page }) => {
      // Reparación: la app mide sobre getFloatFrequencyData (dB sin recortar) y deja los bytes
      // para el dibujo; el motor, además, ya da el centro de una meseta y no su primer bin.
      // El __maxByte = 255 de abajo prueba que el caso sigue SATURANDO los bytes.
      // Esperado (a mano, arriba): «82 Hz», E2, 0 ¢. Obtenido el 01/10/2026: «79 Hz», D#2 +29 ¢.
      // Los bytes 13, 14 y 15 valen 255; el motor elige el 13 y le suma medio bin: 13,5 ×
      // 5,859 = 79,1 Hz. Igual un La1 de 55 Hz → «50 Hz · G1 +28 ¢». Se tolera ±1 Hz y ±10 ¢,
      // que es lo que da el mismo tono sin saturar (test de arriba).
      await arrancarNivel(page, 82.41, NIVEL_FUERTE);
      expect(await page.evaluate(() => (window as VentanaEspia).__maxByte)).toBe(255);
      expect(Math.abs((await hercios(page)) - 82.41)).toBeLessThanOrEqual(1);
      await expect(nota(page)).toContainText('E2');
      expect(Math.abs(await centsMostrados(page))).toBeLessThanOrEqual(10);
    },
  );

  test(
    'REPARADO (01/10/2026), hallazgo 2568: un tono de 20,3 Hz, dentro del rango de 20 Hz–20 kHz, daba «-- Hz» a 48 kHz desde c3e3e8ca',
    async ({ page }) => {
      // Reparación: el motor decide si una cima es del rango por su frecuencia AFINADA, no por
      // el bin donde cae, así que la cima del bin 3 (17,58 Hz) que afina en 20,3 Hz cuenta.
      // Esperado: «20 Hz», E0 −26 ¢. Obtenido: «-- Hz» y «--». Su cima está en el bin 3
      // (17,58 Hz), que el rango nuevo —ceil(20/5,859) = 4— deja fuera, y el 4 es flanco. Con
      // el motor del 18/09 (floor, bin 3 dentro) los mismos bytes medidos (183, 216, 215)
      // daban 3,47 bins = 20,3 Hz. Zona muerta: 20,0–20,5 Hz a cualquier nivel.
      await arrancarNivel(page, 20.3, NIVEL_MODERADO);
      expect(Math.abs((await hercios(page)) - 20.3)).toBeLessThanOrEqual(1);
      await expect(nota(page)).toContainText('E0');
      expect(Math.abs((await centsMostrados(page)) + 26)).toBeLessThanOrEqual(6);
    },
  );

  test(
    'REPARADO (01/10/2026), hallazgo 2568: el mismo de arriba, agravado por la meseta — un tono FUERTE de 25 Hz daba «-- Hz»',
    async ({ page }) => {
      // Esperado: «25 Hz», G0 +35 ¢. Obtenido: «-- Hz». La meseta a 255 empieza en el bin 3,
      // fuera del rango, así que ningún bin del rango es cima de su lóbulo: con un tono fuerte
      // la zona muerta llega hasta ~26 Hz (bin 4,5) a 48 kHz.
      await arrancarNivel(page, 25, NIVEL_FUERTE);
      expect(Math.abs((await hercios(page)) - 25)).toBeLessThanOrEqual(1);
      await expect(nota(page)).toContainText('G0');
    },
  );

  test(
    'REPARADO (01/10/2026), hallazgo 2569: dos clics en «Iniciar» abrían dos micrófonos y «Detener» solo cerraba uno',
    async ({ page }) => {
      // Reparación: startAnalyzing no abre nada mientras otra apertura está en curso (ni si ya
      // hay una captura), con una guarda en un ref, que no espera a un render.
      // Esperado: tras «Detener», todas las pistas en 'ended' y todos los contextos en 'closed'.
      // Obtenido el 01/10/2026: una pista 'live' y un AudioContext 'running' —el micrófono sigue
      // abierto, con su indicador encendido, hasta cerrar la pestaña—. startAnalyzing no tiene
      // guarda de «ya se está abriendo»: el botón no cambia hasta que getUserMedia resuelve, y
      // ese hueco es justo el que el usuario pasa mirando el diálogo de permiso (aquí, 400 ms).
      await espiarAudio(page);
      await page.addInitScript(() => {
        const w = window as VentanaEspia;
        w.__pistas = [];
        const original = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
        navigator.mediaDevices.getUserMedia = async (r?: MediaStreamConstraints) => {
          await new Promise((resolver) => setTimeout(resolver, 400));
          const flujo = await original(r);
          w.__pistas?.push(...flujo.getTracks());
          return flujo;
        };
      });
      await page.goto('/analizador-espectro/');
      await esperarHidratacion(page, ['#sensitivity-slider']);
      await botonIniciar(page).click();
      await botonIniciar(page).click();
      await expect(page.getByRole('button', { name: /Detener/ })).toBeVisible();
      await page.waitForTimeout(1000);
      await page.getByRole('button', { name: /Detener/ }).click();
      await expect(botonIniciar(page)).toBeVisible();
      await page.waitForTimeout(500);
      const estado = await page.evaluate(() => {
        const w = window as VentanaEspia;
        return {
          contextos: (w.__contextosApp ?? []).map((c) => c.state),
          pistas: (w.__pistas ?? []).map((p) => p.readyState),
        };
      });
      expect(estado.pistas.length).toBeGreaterThan(0);
      // Y el segundo clic ni siquiera llegó a pedir el micrófono: una sola captura.
      expect(estado.pistas.length).toBe(1);
      expect(estado.pistas.filter((p) => p !== 'ended')).toEqual([]);
      expect(estado.contextos.filter((c) => c !== 'closed')).toEqual([]);
    },
  );

  test(
    'REPARADO (01/10/2026), hallazgo 2570: la región viva se re-anunciaba en cada fotograma, entera, con su párrafo',
    async ({ page }) => {
      // Reparación: la cifra visible ya no es región viva; el lector de pantalla oye una frase
      // corta («Frecuencia dominante: 440 hercios, nota A4, más 0 cents») en una región aparte,
      // actualizada como mucho cada 1,2 s y solo si cambia, sin el párrafo sobre la FFT.
      // `role="status" aria-live="polite" aria-atomic="true"` envuelve la cifra, la nota Y el
      // párrafo de 40 palabras sobre la FFT, y la cifra cambia en cada requestAnimationFrame.
      // Esperado: como mucho un anuncio por segundo (3 en 3 s). Obtenido con el pitido
      // periódico del micrófono falso: 36 cambios en 3 s, cada uno de 265 caracteres. Con un
      // tono estable no hay ninguno, pero una voz o un instrumento real cambian a cada paso.
      await page.goto('/analizador-espectro/');
      await esperarHidratacion(page, ['#sensitivity-slider']);
      await botonIniciar(page).click();
      await expect(frecuencia(page)).toBeVisible();
      await page.waitForTimeout(1500);
      const cambios = await page.evaluate(
        () =>
          new Promise<number>((resolver) => {
            const regiones = Array.from(
              document.querySelectorAll(
                '[class*="analyzerPanel"] [aria-live], [class*="analyzerPanel"] [role="status"]',
              ),
            );
            let n = 0;
            const ultimos = regiones.map((r) => r.textContent);
            const observador = new MutationObserver(() => {
              regiones.forEach((r, i) => {
                if (r.textContent !== ultimos[i]) {
                  n++;
                  ultimos[i] = r.textContent;
                }
              });
            });
            regiones.forEach((r) =>
              observador.observe(r, { subtree: true, childList: true, characterData: true }),
            );
            setTimeout(() => {
              observador.disconnect();
              resolver(n);
            }, 3000);
          }),
      );
      expect(cambios).toBeLessThanOrEqual(3);
      // Una sola región viva en el panel, corta y sin el párrafo de la FFT.
      const regiones = page.locator('[class*="analyzerPanel"] [aria-live], [class*="analyzerPanel"] [role="status"]');
      await expect(regiones).toHaveCount(1);
      await expect(regiones).not.toContainText('FFT');
      await expect(regiones).toContainText(/Frecuencia dominante|Sin frecuencia dominante/);
      expect(((await regiones.textContent()) ?? '').length).toBeLessThan(100);
    },
  );

  test(
    'REPARADO (01/10/2026), hallazgo 2571: en el tema claro los marcadores de pico eran blancos sobre fondo blanco',
    async ({ page }) => {
      // Reparación: el marcador se pinta con --text-primary, leído del tema como el resto de
      // colores del lienzo (#1A1A1A sobre #FFFFFF en claro, 17:1).
      // «Mostrar picos» viene marcado y el JSON-LD promete «marcadores de picos con decay
      // automático». El código los pinta con '#ffffff' fijo, y el fondo del lienzo es
      // --bg-card, que en el tema claro (el de por defecto) es #FFFFFF: contraste 1:1, no se ven.
      // En el oscuro (#2D2D2D) sí. Esperado: un color de marcador distinto del fondo.
      await inyectarTonoNivel(page, 1000, NIVEL_MODERADO);
      await page.addInitScript(() => {
        const w = window as VentanaEspia;
        w.__rellenos = [];
        const original = CanvasRenderingContext2D.prototype.fillRect;
        CanvasRenderingContext2D.prototype.fillRect = function (
          this: CanvasRenderingContext2D,
          x: number,
          y: number,
          ancho: number,
          alto: number,
        ) {
          if ((w.__rellenos?.length ?? 0) < 3000) {
            w.__rellenos?.push({
              color: typeof this.fillStyle === 'string' ? this.fillStyle : 'degradado',
              alto,
              ancho,
              lienzoAncho: this.canvas.width,
              lienzoAlto: this.canvas.height,
            });
          }
          return original.call(this, x, y, ancho, alto);
        };
      });
      await page.goto('/analizador-espectro/');
      await esperarHidratacion(page, ['#sensitivity-slider']);
      await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
      await botonIniciar(page).click();
      await expect(frecuencia(page)).toBeVisible();
      await page.waitForTimeout(1000);
      const { fondos, marcadores } = await page.evaluate(() => {
        const r = (window as VentanaEspia).__rellenos ?? [];
        return {
          fondos: [
            ...new Set(r.filter((x) => x.ancho === x.lienzoAncho && x.alto === x.lienzoAlto).map((x) => x.color)),
          ],
          marcadores: [...new Set(r.filter((x) => x.alto === 2 && x.color !== 'degradado').map((x) => x.color))],
        };
      });
      expect(fondos).toEqual(['#ffffff']);
      expect(marcadores.length).toBeGreaterThan(0);
      for (const color of marcadores) expect(color).not.toBe('#ffffff');
      // Contraste de cada marcador con el fondo, ≥ 3:1 (WCAG 1.4.11, elementos gráficos).
      const luminancia = (hex: string): number => {
        const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
        const lin = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
        return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
      };
      for (const color of marcadores) {
        expect(color).toMatch(/^#[0-9a-f]{6}$/);
        expect((luminancia(fondos[0]) + 0.05) / (luminancia(color) + 0.05)).toBeGreaterThanOrEqual(3);
      }
    },
  );

  test(
    'REPARADO (01/10/2026), hallazgo 2572: la FAQ visible decía que no hay indicador de cents, y la app los enseña',
    async ({ page }) => {
      // Desde el hallazgo 887 (18/09) la nota sale con sus cents («B5 +21 ¢»), pero la FAQ
      // «¿Puedo usar esto para afinar mi instrumento?» sigue diciendo que el analizador «no tiene
      // un indicador de "cents" de desviación como un afinador».
      await page.goto('/analizador-espectro/');
      await esperarHidratacion(page, ['#sensitivity-slider']);
      await page.getByRole('button', { name: /Ver guía|guía educativa/i }).first().click();
      const faq = page.locator('[class*="faqList"]');
      await expect(faq).toBeVisible();
      await expect(faq).not.toContainText('no tiene un indicador');
      const respuesta = faq.locator('li').filter({ hasText: '¿Puedo usar esto para afinar mi instrumento?' });
      await expect(respuesta).toContainText('cents');
    },
  );

  test(
    'REPARADO (01/10/2026), hallazgo 2573: con el micrófono ocupado por otra aplicación el aviso salía en inglés',
    async ({ page }) => {
      // Chrome rechaza con NotReadableError «Could not start audio source» cuando otra
      // aplicación retiene el micrófono (habitual en Windows con una videollamada abierta). La
      // app solo traduce NotAllowedError y NotFoundError; el resto cae en `Error: ${message}`.
      // Esperado: una explicación en español. Obtenido: «⚠️ Error: Could not start audio source».
      await page.addInitScript(() => {
        navigator.mediaDevices.getUserMedia = async (): Promise<MediaStream> => {
          throw new DOMException('Could not start audio source', 'NotReadableError');
        };
      });
      await page.goto('/analizador-espectro/');
      await esperarHidratacion(page, ['#sensitivity-slider']);
      await botonIniciar(page).click();
      await expect(mensajeError(page)).toBeVisible();
      await expect(mensajeError(page)).not.toContainText('Could not start audio source');
      await expect(mensajeError(page)).toContainText(/micrófono/i);
      await expect(mensajeError(page)).toContainText('en uso por otra aplicación');
      await expect(botonIniciar(page)).toBeVisible();
    },
  );
});

test.describe('Re-inspección 01/10/2026 · en un móvil (Pixel 7)', () => {
  // Enumerado y no `...devices['Pixel 7']`: este arrastra defaultBrowserType, que es de worker.
  const pixel7 = devices['Pixel 7'];
  test.use({
    viewport: pixel7.viewport,
    userAgent: pixel7.userAgent,
    deviceScaleFactor: pixel7.deviceScaleFactor,
    isMobile: pixel7.isMobile,
    hasTouch: pixel7.hasTouch,
  });

  test('con el micrófono falso del navegador arranca de verdad y se detiene con un toque', async ({ page }) => {
    await espiarAudio(page);
    await page.goto('/analizador-espectro/');
    await esperarHidratacion(page, ['#sensitivity-slider']);
    await botonIniciar(page).tap();
    await expect(frecuencia(page)).toBeVisible();
    // El pitido periódico del dispositivo falso da cifra mientras suena.
    await expect(frecuencia(page)).toHaveText(/^\s*\d[\d.]*\s*Hz\s*$/, { timeout: 5000 });
    const enMarcha = await page.evaluate(() => {
      const w = window as VentanaEspia;
      return { estado: w.__contextosApp?.[0]?.state, byte: w.__maxByte ?? 0 };
    });
    expect(enMarcha.estado).toBe('running');
    expect(enMarcha.byte).toBeGreaterThan(20);
    // Sin desbordamiento horizontal en 412 px.
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(412);

    await page.getByRole('button', { name: /Detener/ }).tap();
    await expect(botonIniciar(page)).toBeVisible();
    await expect
      .poll(() => page.evaluate(() => (window as VentanaEspia).__contextosApp?.[0]?.state))
      .toBe('closed');
  });

  test('un 440 Hz a −26 dBFS se lee igual que en escritorio', async ({ page }) => {
    await arrancarNivel(page, 440, NIVEL_MODERADO);
    expect(Math.abs((await hercios(page)) - 440)).toBeLessThanOrEqual(1);
    await expect(nota(page)).toContainText('A4');
  });

  test('REPARADO (01/10/2026), hallazgo 2574: en 412 px la regleta montaba «10 kHz» encima de «20 kHz»', async ({ page }) => {
    // Las etiquetas van en su posición logarítmica real (hallazgo 889), pero entre 10 y 20 kHz
    // solo hay el 10 % del ancho: 31 px en el móvil para dos rótulos de ~36 px. Medido el
    // 01/10/2026: «10 kHz» acaba en x = 349,6 y «20 kHz» empieza en x = 326,9 → «1020kHz».
    // En escritorio (1.280 px) no se tocan. Esperado: ninguna etiqueta pisa a otra.
    //
    // Reparación: en pantallas estrechas «20 kHz» baja a una segunda línea, en su mismo sitio
    // horizontal. Por eso el criterio ya no es «la izquierda de cada una después de la derecha
    // de la anterior», que exigía separación HORIZONTAL y obligaba a mover o encoger rótulos que
    // están donde deben: es que ninguna CAJA se cruce con otra.
    await page.goto('/analizador-espectro/');
    const cajas = await page.evaluate(() =>
      Array.from(document.querySelectorAll('[class*="freqTick"]')).map((e) => {
        const r = e.getBoundingClientRect();
        return { texto: e.textContent ?? '', izquierda: r.left, derecha: r.right, arriba: r.top, abajo: r.bottom };
      }),
    );
    expect(cajas.length).toBe(5);
    for (const c of cajas) expect(c.derecha - c.izquierda, `${c.texto} visible`).toBeGreaterThan(0);
    for (let i = 0; i < cajas.length; i++) {
      for (let j = i + 1; j < cajas.length; j++) {
        const a = cajas[i];
        const b = cajas[j];
        const seCruzan = a.izquierda < b.derecha && b.izquierda < a.derecha && a.arriba < b.abajo && b.arriba < a.abajo;
        expect(seCruzan, `${a.texto} pisa ${b.texto}`).toBe(false);
      }
    }
    // Y sigue cada una en su sitio: el centro de «10 kHz» al 90 % del ancho de la regleta.
    const regleta = await page.locator('[class*="freqScale"]').boundingBox();
    const diezK = cajas.find((c) => c.texto === '10 kHz')!;
    const centro = ((diezK.izquierda + diezK.derecha) / 2 - regleta!.x) / regleta!.width;
    expect(Math.abs(centro - 0.9)).toBeLessThan(0.04);
  });

  test('REPARADO (01/10/2026), hallazgo 2574: el lienzo se dibuja al alto con que se muestra, sin aplastar', async ({ page }) => {
    // Medido el 01/10/2026: dibujado a 314×300 y mostrado a 314×200 (CSS), así que los rótulos
    // internos salían a 2/3 de su altura. Esperado: el alto del dibujo es el alto mostrado.
    await page.goto('/analizador-espectro/');
    await esperarHidratacion(page, ['#sensitivity-slider']);
    const medidas = await page.evaluate(() => {
      const c = document.querySelector('canvas') as HTMLCanvasElement;
      return { ancho: c.width, alto: c.height, anchoCss: c.clientWidth, altoCss: c.clientHeight };
    });
    expect(medidas.altoCss).toBeGreaterThan(0);
    expect(medidas.alto).toBe(medidas.altoCss);
    expect(medidas.ancho).toBe(medidas.anchoCss);
  });
});
