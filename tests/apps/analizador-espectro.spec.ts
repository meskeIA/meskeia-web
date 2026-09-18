import { test, expect, Page } from '@playwright/test';
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
 * DÓNDE VIVE EL CÁLCULO — no hay motor aparte: los 878 renglones de
 * app/analizador-espectro/page.tsx lo hacen todo dentro de `analyzeLoop`, un callback que se
 * auto-encadena con requestAnimationFrame.
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
 */
const TOLERANCIA_HZ = 9;

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
