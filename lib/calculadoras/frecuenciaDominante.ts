/**
 * Frecuencia dominante de un espectro de la Web Audio API.
 *
 * Lo usan dos apps que leen el mismo micrófono para contestar la misma pregunta —«¿cuántos
 * hercios tiene este sonido?»—: `analizador-espectro`, que lo hacía primero, y `generador-tonos`,
 * que es adonde llega esa búsqueda («medidor de frecuencia hz online», S0170, 29/09/2026). El
 * algoritmo vivía escrito dentro del bucle de dibujo del analizador; al tener un segundo lector
 * se saca aquí, para que las dos apps no puedan dar cifras distintas del mismo tono.
 *
 * Sin dependencias y sin nada de presentación: recibe el array que devuelve el `AnalyserNode`
 * y devuelve números. Vale para los dos formatos del analizador:
 *   · `getByteFrequencyData` (0-255), el del analizador de espectro.
 *   · `getFloatFrequencyData` (dB, con -Infinity en los bins vacíos), el del generador.
 * El umbral de «hay señal» lo pone cada app, porque depende del formato.
 *
 * Casos resueltos a mano: tests/frecuencia-dominante-motor.spec.ts.
 */

export interface PicoEspectro {
  /** Frecuencia del pico, afinada entre bins (Hz). */
  frecuencia: number;
  /** Valor del bin del pico, en las unidades del array recibido. */
  nivel: number;
  /** Índice del bin del pico, sin afinar. */
  bin: number;
}

/**
 * Bins que caen DENTRO de [fMin, fMax]: el primero cuya frecuencia es ≥ fMin (ceil) y el último
 * cuya frecuencia es ≤ fMax (floor). Nunca el bin 0 (la continua) ni el último del array, que
 * se quedaría sin vecino por la derecha para afinar.
 *
 * Con floor por abajo, el primer bin del rango quedaba POR DEBAJO de fMin —17,58 Hz a 48 kHz y
 * 18,84 Hz a 44,1 kHz con 16.384 muestras, pidiendo 20 Hz— y era ahí donde se leía el flanco de
 * un sonido más grave que el rango (hallazgo 2412 de generador-tonos).
 */
function rangoDeBins(longitud: number, sampleRate: number, fftSize: number, fMin: number, fMax: number) {
  const hzPorBin = sampleRate / fftSize;
  return {
    hzPorBin,
    binMin: Math.max(1, Math.ceil(fMin / hzPorBin)),
    binMax: Math.min(longitud - 2, Math.floor(fMax / hzPorBin)),
  };
}

/** Un bin vacío (-Infinity en dB, o fuera del array) cuenta como lo más bajo posible. */
function valorBin(espectro: ArrayLike<number>, i: number): number {
  const v = i >= 0 && i < espectro.length ? espectro[i] : -Infinity;
  return Number.isFinite(v) ? v : -Infinity;
}

/**
 * Medio ancho del lóbulo principal de la ventana de Blackman, en bins: su primer cero cae a ±3
 * bins del centro. Un tono de verdad tiene su bin más alto como máximo de esos ±3; lo que quede
 * a esa distancia de algo más alto es el lóbulo de otro sonido, no un sonido.
 */
const SEMIANCHO_LOBULO_BINS = 3;

/**
 * ¿Es el bin `i` (de valor `v`) la cima de su propio lóbulo? Más alto que los
 * `SEMIANCHO_LOBULO_BINS` bins de su izquierda, no más bajo que los de su derecha, y lo primero
 * distinto por la derecha —saltando una meseta de bins iguales, como tres bytes saturados a 255—
 * es más bajo. Mira el espectro ENTERO, también fuera del rango pedido.
 */
function esCimaDeLobulo(espectro: ArrayLike<number>, i: number, v: number): boolean {
  for (let d = 1; d <= SEMIANCHO_LOBULO_BINS; d++) {
    if (!(v > valorBin(espectro, i - d))) return false;
    if (!(v >= valorBin(espectro, i + d))) return false;
  }
  let j = i + 1;
  while (j < espectro.length && valorBin(espectro, j) === v) j++;
  return valorBin(espectro, j) < v;
}

/**
 * Pico más alto del espectro entre `fMin` y `fMax`, afinado con una parábola sobre sus dos
 * vecinos.
 *
 * El pico se busca en los BINS reales y no en bandas agrupadas: promediando bandas
 * logarítmicas, un pico estrecho en agudos se diluye entre cientos de bins y la cifra solo
 * puede tomar tantos valores como bandas haya (hallazgos 884 y 886 del analizador).
 *
 * Solo cuenta la CIMA DE UN LÓBULO (`esCimaDeLobulo`), comparada con el espectro entero y no
 * solo con el rango: sin esa condición, un sonido más grave que `fMin` dejaba el primer bin del
 * rango en el FLANCO de su lóbulo —la ventana de Blackman del AnalyserNode lo abre ±3 bins—, ese
 * flanco era «el más alto del rango» y salía una cifra estable que no era la del sonido
 * (hallazgo 2412: 15 Hz leídos como 17,6 Hz). Basta un máximo local de ±1 bin para el flanco,
 * pero no para la cola: medido con 12 Hz a 48 kHz, la imagen de frecuencia negativa riza la cola
 * y deja un máximo local en 22,7 Hz, 68 dB bajo el tono pero muy por encima del fondo. Con ±3
 * bins ese rizo queda a la sombra del lóbulo del que sale. Lo que sobrevive lejos de todo lóbulo
 * es el propio fondo (ruido, o el error numérico en un espectro sintético), y eso lo descarta la
 * prominencia o el umbral de cada app.
 *
 * La parábola que pasa por (−1, y₋₁), (0, y₀), (1, y₊₁) tiene el vértice en
 * δ = (y₋₁ − y₊₁) / (2·(y₋₁ − 2y₀ + y₊₁)), y ese δ es la fracción de bin que hay que sumar. Si
 * sale fuera de ±0,5 bins, el pico no tiene forma de pico (dos bins iguales saturados, por
 * ejemplo) y se deja en el centro del bin. Si un vecino no es finito —silencio en el formato
 * en dB—, tampoco se afina: con -Infinity la parábola daría NaN.
 *
 * Devuelve `null` si en el rango no hay ningún máximo local, o si el pico afinado cae fuera de
 * [fMin, fMax] (un tono de 19,8 Hz asoma en el bin de 20,5 Hz, pero no es de este rango).
 */
export function picoDominante(
  espectro: ArrayLike<number>,
  sampleRate: number,
  fftSize: number,
  fMin = 20,
  fMax = 20000,
): PicoEspectro | null {
  const { hzPorBin, binMin, binMax } = rangoDeBins(espectro.length, sampleRate, fftSize, fMin, fMax);

  let bin = -1;
  let nivel = -Infinity;
  for (let i = binMin; i <= binMax; i++) {
    const v = valorBin(espectro, i);
    // Estricto: ante un empate gana el primero, que es como lo hacía el analizador.
    if (v === -Infinity || v <= nivel) continue;
    if (!esCimaDeLobulo(espectro, i, v)) continue;
    nivel = v;
    bin = i;
  }
  if (bin < 0) return null;

  let afinado = bin;
  const izq = espectro[bin - 1];
  const der = espectro[bin + 1];
  if (Number.isFinite(izq) && Number.isFinite(der)) {
    const denominador = izq - 2 * nivel + der;
    if (denominador !== 0) {
      const delta = (izq - der) / (2 * denominador);
      if (Math.abs(delta) <= 0.5) afinado = bin + delta;
    }
  }
  const frecuencia = afinado * hzPorBin;
  if (frecuencia < fMin || frecuencia > fMax) return null;
  return { frecuencia, nivel, bin };
}

/**
 * Cuánto sobresale el pico del resto del espectro, en las unidades del array: nivel del pico
 * menos la MEDIANA de los bins finitos del rango.
 *
 * Es la forma de decir «hay un tono» sin depender del volumen: un umbral absoluto en dB
 * cambia con la ganancia de cada micrófono, mientras que un silbido se separa 30-50 dB de su
 * propio fondo en cualquier móvil. La mediana, y no la media, porque la media la arrastra el
 * propio pico y sus armónicos.
 */
export function prominencia(
  espectro: ArrayLike<number>,
  pico: PicoEspectro,
  sampleRate: number,
  fftSize: number,
  fMin = 20,
  fMax = 20000,
): number {
  const { binMin, binMax } = rangoDeBins(espectro.length, sampleRate, fftSize, fMin, fMax);
  const valores: number[] = [];
  for (let i = binMin; i <= binMax; i++) {
    const v = espectro[i];
    if (Number.isFinite(v)) valores.push(v);
  }
  if (valores.length === 0) return 0;
  valores.sort((a, b) => a - b);
  const m = valores.length >> 1;
  const mediana = valores.length % 2 ? valores[m] : (valores[m - 1] + valores[m]) / 2;
  return pico.nivel - mediana;
}

/**
 * Rango dinámico de la ventana de Blackman que usa el `AnalyserNode` (α = 0,16): su lóbulo
 * lateral más alto queda 58 dB por debajo del principal (F. J. Harris, «On the use of windows
 * for harmonic analysis with the discrete Fourier transform», Proc. IEEE 66(1), 1978, tabla 1).
 * Lo que está más de 58 dB por debajo del sonido más fuerte del espectro no se puede separar de
 * la fuga de ese sonido ni de su distorsión: no es un tono que se pueda anunciar.
 */
export const RANGO_DINAMICO_BLACKMAN_DB = 58;

/**
 * Nivel del bin más alto del espectro ENTERO, fuera del rango pedido incluido (sin el bin 0, la
 * continua). Solo tiene sentido en el formato en dB. `-Infinity` si no hay ningún bin finito.
 *
 * Sirve para comparar el pico del rango con lo que de verdad domina la señal. Medido en el
 * navegador el 29/09/2026 con un tono puro de 15 Hz (hallazgo 2412): el tono llega a −25,7 dB y,
 * lejos de su lóbulo, quedan componentes de −117 a −136 dB (la distorsión del WAV de 16 bits y
 * del remuestreo) sobre un fondo de −175 dB. Sobresalen 40 dB de la mediana, así que la
 * prominencia sola los daba por tono: «468 Hz, lectura estable» para un sonido de 15 Hz.
 */
export function nivelMaximo(espectro: ArrayLike<number>): number {
  let maximo = -Infinity;
  for (let i = 1; i < espectro.length; i++) {
    const v = espectro[i];
    if (Number.isFinite(v) && v > maximo) maximo = v;
  }
  return maximo;
}

/**
 * Lectura ESTABLE de una serie de frecuencias: la mediana, si todas caen a menos de
 * `toleranciaCents` de ella; `null` si alguna se sale o no hay bastantes.
 *
 * Distingue un tono sostenido (un pitido, un diapasón, un silbido) de un sonido que cambia
 * (una voz hablando, ruido): en el segundo caso el pico salta de un armónico a otro entre
 * lecturas y ninguna cifra suelta significa nada. La tolerancia va en cents, que es una
 * distancia relativa: 20 cents son ±0,5 Hz a 40 Hz y ±58 Hz a 5 kHz, así que el mismo criterio
 * vale en toda la escala.
 */
export function lecturaEstable(
  frecuencias: number[],
  minimo = 5,
  toleranciaCents = 20,
): number | null {
  if (frecuencias.length < minimo) return null;
  if (!frecuencias.every((f) => Number.isFinite(f) && f > 0)) return null;
  const orden = [...frecuencias].sort((a, b) => a - b);
  const m = orden.length >> 1;
  const mediana = orden.length % 2 ? orden[m] : Math.sqrt(orden[m - 1] * orden[m]);
  const dentro = frecuencias.every((f) => Math.abs(1200 * Math.log2(f / mediana)) <= toleranciaCents);
  return dentro ? mediana : null;
}
