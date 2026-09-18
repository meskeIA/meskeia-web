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
 *   Pero la app NO publica el bin del pico: agrupa el espectro en 64 bandas logarítmicas
 *   `20 · 1000^(i/64)`, promedia los bins de cada banda, se queda con la banda de media
 *   mayor y muestra el CENTRO ARITMÉTICO de sus bordes. Cada banda mide 1000^(1/64) = 1,114
 *   → 1,87 semitonos de ancho, así que la cifra solo puede tomar 64 valores.
 *
 *   CASO NORMAL — tono puro de 440 Hz (La4).
 *       Pico real: bin round(440 · 8192 / 44100) = 82 (a 48.000 Hz sería el 75).
 *       Banda: floor(log(440/20)/log(1000) · 64) = floor(28,64) = 28 → [410,71 – 457,51] Hz.
 *       Centro aritmético = 434,11 → la app escribe «434 Hz», nunca «440 Hz» (−1,34 %).
 *       Nota: |434,11 − 440| / 440 = 1,34 % ≤ 10 % → «A4». ✔ medido: «434 Hz» / «A4».
 *
 *   CASO LÍMITE — silencio y agudos.
 *       Silencio (oscilador con ganancia 0): todos los bins a 0, maxValue ≤ 20 → «-- Hz».
 *       ✔ medido: «-- Hz» / «--». No inventa un pico donde no lo hay.
 *       Tono de 10.000 Hz: banda 57 = [9.395 – 10.466] Hz = bins 1745..1945, o sea 201 bins
 *       promediados. Un pico puro saturado a 255 da una media de 255/201 = 1,3, muy por
 *       debajo del umbral `maxValue > 20` del código → NO se detecta. ✘ HALLAZGO 1.
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
 * HALLAZGOS ABIERTOS — al final, con `test.fail()`. Afirman lo que DEBERÍA pasar, así que hoy
 * fallan a propósito; cuando se reparen saldrán en rojo («expected to fail, but passed») y
 * habrá que quitarles la marca, no reescribir el valor esperado. Están en el acta del
 * Inspector.
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

test.describe('Analizador de Espectro · lo que funciona', () => {
  test('un tono puro de 440 Hz se sitúa en la banda de La4', async ({ page }) => {
    // 440 Hz → bin 82 de 4.096 (44.100 / 8192 = 5,3833 Hz por bin) → banda log 28,
    // que va de 410,71 a 457,51 Hz y cuyo centro aritmético es 434,11 Hz.
    await arrancar(page, 440);
    await expect(frecuencia(page)).toHaveText('434 Hz');
    // |434,11 − 440| / 440 = 1,34 %, dentro del 10 % de tolerancia del código.
    await expect(nota(page)).toHaveText('A4');
  });

  test('el silencio no inventa ningún pico', async ({ page }) => {
    // Oscilador con ganancia 0: los 4.096 bins valen 0, así que maxValue (0) no supera el
    // umbral de 20 del código y la app no arriesga una cifra.
    await arrancar(page, 0);
    await expect(frecuencia(page)).toHaveText('-- Hz');
    await expect(nota(page)).toHaveText('--');
  });

  test('un zumbido de red de 50 Hz cae donde debe', async ({ page }) => {
    // Es el caso que la propia app propone («zumbidos eléctricos, 50 Hz en Europa»).
    // 50 Hz → banda 8 = [47,43 – 52,83] Hz, centro 50,13 → «50 Hz». Error del 0,26 %: en los
    // graves la banda logarítmica es estrecha y la cifra sale fina.
    await arrancar(page, 50);
    await expect(frecuencia(page)).toHaveText('50 Hz');
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

test.describe('Analizador de Espectro · hallazgos abiertos', () => {
  // Los seis usan test.fail(): afirman lo que DEBERÍA pasar y hoy no pasa. El día que se
  // reparen saldrán en rojo («expected to fail, but passed») y habrá que quitarles la marca,
  // no reescribir el valor esperado.

  test.fail('HALLAZGO 1 · un tono de 10 kHz debe detectarse, no desaparecer', async ({ page }) => {
    // El bucle promedia TODOS los bins de cada banda logarítmica, y el número de bins por
    // banda crece con la frecuencia: 3 bins en la banda de 50 Hz, 10 en la de 440 Hz, 23 en
    // la de 1 kHz, 106 en la de 5 kHz, 201 en la de 10 kHz y 308 en la de 15 kHz. Un pico
    // puro saturado a 255 da una media de 255/201 = 1,3 en la banda de 10 kHz, y el código
    // exige `maxValue > 20`. Resultado: por encima de unos 3-5 kHz la frecuencia dominante
    // deja de existir aunque el pico esté saturado en el espectro.
    //   medido en producción: 3.000 Hz → «3029 Hz» · 5.000 Hz → «-- Hz» ·
    //                        10.000 Hz → «-- Hz» · 15.000 Hz → «-- Hz».
    // Justo la zona que la app ofrece para «eliminar feedback en directo» (el acople es un
    // pico estrecho de 1 a 5 kHz) y para la banda de «presencia» de 4 a 6 kHz.
    // Y el mismo promediado sesga la comparación hacia los graves siempre, porque una banda
    // de 3 bins compite contra otra de 300 con la misma regla.
    await arrancar(page, 10000);
    await expect(frecuencia(page)).not.toHaveText('-- Hz');
  });

  test.fail('HALLAZGO 2 · la cifra debe usar la resolución que la app dice tener', async ({ page }) => {
    // fftSize 8192 da 5,38 Hz de resolución —y el JSON-LD lo vende como «alta resolución
    // frecuencial»—, pero la cifra mostrada es el centro de una de las 64 bandas de 1,87
    // semitonos, así que solo puede tomar 64 valores en toda la escala. Un 440 Hz perfecto
    // sale «434 Hz» y un 1 kHz de laboratorio sale «1029 Hz» (+2,94 %). El error llega al
    // 5,7 % —casi un semitono— para un tono situado en el borde inferior de su banda.
    // Publicar el centro de la banda con precisión de hercio es dar por medido lo que no se
    // ha medido: o se interpola el pico dentro del bin, o no se da la cifra al hercio.
    await arrancar(page, 1000);
    await expect(frecuencia(page)).toHaveText('1000 Hz');
  });

  test.fail('HALLAZGO 3 · la nota más cercana debe ser la nota más cercana', async ({ page }) => {
    // `MUSICAL_NOTES` solo contiene las notas LA y DO (16 entradas para ocho octavas), no las
    // doce del temperamento igual que declara el JSON-LD («nota musical más cercana
    // (temperamento igual)»). Encima busca la mínima distancia LINEAL en hercios —cuando la
    // distancia musical es logarítmica— y acepta hasta un 10 % de desviación, que son ±1,6
    // semitonos. Con eso, cualquier tono recibe una etiqueta y casi siempre la equivocada:
    //   466,16 Hz (La#4/Si♭4) → la app dice «C5» (523,3 Hz), dos semitonos más arriba;
    //   1.000 Hz              → la app dice «C6» (1.046,5 Hz);
    //   50 Hz, el zumbido de red del propio ejemplo de la app → dice «A1» (55 Hz).
    // Un La sostenido presentado como Do es peor que no decir nada, y la app ya sabe decir
    // «--» cuando no está segura.
    await arrancar(page, 466.16);
    await expect(nota(page)).not.toHaveText('C5');
  });

  test.fail('HALLAZGO 4 · los controles deben funcionar con el análisis en marcha', async ({ page }) => {
    // `analyzeLoop` es un useCallback que depende de [viewMode, sensitivity, showPeaks] y que
    // se auto-encadena con `requestAnimationFrame(analyzeLoop)`. Nada reengancha la cadena
    // cuando esas dependencias cambian, así que el bucle sigue ejecutando para siempre el
    // closure capturado al pulsar «Iniciar». Los tres controles quedan muertos justo mientras
    // se usan; solo surten efecto si se eligen ANTES de arrancar, o tras Detener + Iniciar.
    // Medido: al pulsar «Línea» con el análisis corriendo, aria-pressed pasa a true y el
    // canvas no cambia UN SOLO PÍXEL; al subir la sensibilidad de 1x a 2x, el estado de React
    // vale «2» y el aria-label dice «Sensibilidad: 2,0x», y el canvas tampoco cambia.
    await arrancar(page, 440);
    await page.getByRole('button', { name: /Línea/ }).click();
    await expect(page.getByRole('button', { name: /Línea/ })).toHaveAttribute('aria-pressed', 'true');
    await page.waitForTimeout(1200);
    // En modo línea de verdad el relleno bajo la curva deja miles de píxeles (4.488 medidos con
    // un tono puro de 440 Hz); en modo barras no hay ninguno.
    expect(await contarPixeles(page, RELLENO_LINEA)).toBeGreaterThan(200);

    // Y la sensibilidad, con el mismo bucle sordo.
    const antes = await contarPixeles(page, RELLENO_LINEA);
    await sembrarValor(page, '#sensitivity-slider', '2');
    await page.waitForTimeout(1200);
    expect(await contarPixeles(page, RELLENO_LINEA)).not.toBe(antes);
  });

  test.fail('HALLAZGO 5 · el canvas debe dibujarse con los colores de marca', async ({ page }) => {
    // El código pide `ctx.strokeStyle = 'var(--primary)'`, `'var(--border)'` y
    // `ctx.fillStyle = 'var(--text-muted)'`. El contexto 2D no resuelve variables CSS: ignora
    // el valor en silencio y conserva el anterior. Medido asignando y releyendo:
    //   strokeStyle 'var(--primary)' → queda «#000000»   (la curva sale negra)
    //   strokeStyle 'var(--border)'  → queda «#000000»   (la rejilla sale negra)
    //   fillStyle   'var(--text-muted)' → queda «rgba(46, 134, 171, 0.2)» o el gradiente de
    //                                     la última barra, según el modo.
    // Consecuencias: la curva del modo línea no es azul meskeIA sino negra (0 píxeles de
    // #2E86AB frente a 167 negros); las etiquetas «100Hz», «1kHz» y «10kHz» del canvas se
    // pintan con un relleno casi transparente y son ilegibles; y en modo oscuro la rejilla
    // negra sobre fondo oscuro desaparece del todo.
    await inyectarTono(page, 440);
    await page.goto('/analizador-espectro/');
    await esperarHidratacion(page, ['#sensitivity-slider']);
    // El modo se elige ANTES de arrancar porque después ya no se puede (HALLAZGO 4).
    await page.getByRole('button', { name: /Línea/ }).click();
    await botonIniciar(page).click();
    await page.waitForTimeout(2000);
    expect(await contarPixeles(page, AZUL_MARCA)).toBeGreaterThan(0);
  });

  test.fail('HALLAZGO 6 · la escala impresa debe coincidir con el eje del gráfico', async ({ page }) => {
    // El canvas reparte 20 Hz–20 kHz en logaritmo: 1 kHz cae en log10(1000/20)/3 = 56,63 %
    // del ancho y 10 kHz en 89,97 %. La regleta de debajo es un flex con
    // `justify-content: space-between` y cinco etiquetas, que las reparte UNIFORMEMENTE.
    // Medido sobre el canvas real de 1.086 px: «1 kHz» impreso al 49,75 % (desfase −6,88
    // puntos) y «10 kHz» al 73,52 % frente al 89,97 % donde el gráfico lo dibuja: 16,45
    // puntos, unos 179 px. Quien lea un pico usando la regleta lo situará casi una octava por
    // debajo de donde está.
    await page.goto('/analizador-espectro/');
    await esperarHidratacion(page, ['#sensitivity-slider']);
    const posicion = await page.evaluate((selector) => {
      const lienzo = document.querySelector(selector) as HTMLCanvasElement;
      const caja = lienzo.getBoundingClientRect();
      const etiqueta = [...document.querySelectorAll('span')].find(
        (s) => s.textContent?.trim() === '10 kHz',
      );
      if (!etiqueta) return -1;
      const r = etiqueta.getBoundingClientRect();
      return ((r.left + r.width / 2 - caja.left) / caja.width) * 100;
    }, CANVAS);
    // 89,97 % es donde el canvas traza su línea discontinua de 10 kHz; 1 punto de tolerancia.
    expect(posicion).toBeGreaterThan(88.97);
  });
});
