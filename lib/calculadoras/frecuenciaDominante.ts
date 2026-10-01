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
 * sale fuera de ±0,5 bins, el pico no tiene forma de pico y se deja en el centro del bin. Si un
 * vecino no es finito —silencio en el formato en dB—, tampoco se afina: con -Infinity la
 * parábola daría NaN. Una cima de VARIOS bins iguales (una meseta) no se afina con la parábola,
 * sino con `centroDeMeseta`.
 *
 * Lo que decide si un pico es «de este rango» es su frecuencia AFINADA, no el bin donde cae: un
 * tono de 20,3 Hz a 48 kHz con 8.192 muestras tiene la cima en el bin 3 (17,58 Hz) y afinado da
 * 20,3 Hz, que sí es del rango; un tono de 19,8 Hz asoma en el bin de 20,5 Hz con 16.384
 * muestras, pero afinado da 19,8 y no lo es. Por eso se recorren TODOS los bins hasta el último
 * cuya cima pueda afinar por debajo de fMax, y cada cima se afina antes de compararla: la que
 * cae fuera de [fMin, fMax] no cuenta, y la búsqueda sigue con las demás (un grave fuerte de
 * fuera no tapa un tono débil de dentro). Antes se buscaba solo entre los bins que caían dentro
 * —desde ceil(fMin/Δf)— y quedaba una zona muerta de 20,0 a 20,5 Hz a 48 kHz, que con un tono
 * fuerte, cuya meseta empieza en el bin 3, llegaba a unos 26 Hz (hallazgo 2568 del analizador).
 *
 * Devuelve `null` si ninguna cima afina dentro de [fMin, fMax].
 */
export function picoDominante(
  espectro: ArrayLike<number>,
  sampleRate: number,
  fftSize: number,
  fMin = 20,
  fMax = 20000,
): PicoEspectro | null {
  const hzPorBin = sampleRate / fftSize;
  // Una cima afinada queda, como mucho, medio bin por debajo de su primer bin (la parábola
  // suma ±0,5 y el centro de una meseta no baja de ahí): más allá de este bin, ninguna cima
  // puede afinar dentro del rango.
  const binTope = Math.min(espectro.length - 2, Math.floor(fMax / hzPorBin + 0.5));

  let mejor: PicoEspectro | null = null;
  for (let i = 1; i <= binTope; i++) {
    const v = valorBin(espectro, i);
    // Estricto: ante un empate gana el primero, que es como lo hacía el analizador.
    if (v === -Infinity || (mejor && v <= mejor.nivel)) continue;
    if (!esCimaDeLobulo(espectro, i, v)) continue;
    const { posicion, bin } = afinarCima(espectro, i, v);
    const frecuencia = posicion * hzPorBin;
    if (frecuencia < fMin || frecuencia > fMax) continue;
    mejor = { frecuencia, nivel: v, bin };
  }
  return mejor;
}

/**
 * Posición afinada (en bins, con decimales) de la cima que empieza en el bin `i`, y el bin
 * entero más cercano a ella.
 */
function afinarCima(espectro: ArrayLike<number>, i: number, v: number): { posicion: number; bin: number } {
  let fin = i;
  while (fin + 1 < espectro.length && valorBin(espectro, fin + 1) === v) fin++;
  if (fin > i) {
    const posicion = centroDeMeseta(espectro, i, fin);
    return { posicion, bin: Math.min(fin, Math.max(i, Math.round(posicion))) };
  }
  let posicion = i;
  const izq = espectro[i - 1];
  const der = espectro[i + 1];
  if (Number.isFinite(izq) && Number.isFinite(der)) {
    const denominador = izq - 2 * v + der;
    if (denominador !== 0) {
      const delta = (izq - der) / (2 * denominador);
      if (Math.abs(delta) <= 0.5) posicion = i + delta;
    }
  }
  return { posicion, bin: i };
}

/**
 * Centro de una cima plana: los bins `a` a `b` valen todos `v` (el techo).
 *
 * Pasa con los BYTES de `getByteFrequencyData`, que recortan en `maxDecibels` (−30 dB por
 * defecto): un tono por encima de unos −16 dBFS aplana su pico en 2-4 bins a 255. Afinar el
 * primero de ellos con la parábola, que con un vecino igual da siempre +0,5, dejaba la cifra
 * entre medio bin y un bin por debajo: Mi2 (82,41 Hz) a −6 dBFS salía «79 Hz · D#2 +29 ¢» a
 * 48 kHz (hallazgo 2567 del analizador). En los dB en coma flotante del generador no hay techo,
 * y dos bins exactamente iguales no se dan.
 *
 * El lóbulo de la ventana es SIMÉTRICO alrededor del tono, y recortarlo no le quita la
 * simetría. Los dos vecinos de la meseta, a−1 y b+1, caen en flancos opuestos a distancias dI
 * y dD del tono que suman D = b − a + 2 bins, y como los dos están fuera del techo, ninguno
 * queda a un bin más que el otro. El vecino MÁS ALTO es el más cercano; su flanco se conoce
 * en dos puntos (él y el siguiente hacia fuera), y el vecino bajo del otro flanco, por la
 * simetría, cae en ese mismo tramo de curva: interpolando su valor entre esos dos puntos sale
 * cuánto más lejos está, Δ = dLejos − dCerca, en fracción de bin. Con dCerca + dLejos = D, el
 * tono queda a Δ/2 del centro geométrico de la meseta, hacia el vecino alto.
 *
 * Solo usa cocientes de diferencias, así que vale igual en bytes que en dB, sin conocer la
 * escala. Medido sobre espectros fabricados como los del AnalyserNode (tests/frecuencia-
 * dominante-motor), a 48 kHz con 8.192 muestras, de −30 a 0 dBFS y con el tono en cualquier
 * fracción de bin: error máximo de 0,09 bins (0,5 Hz), frente a 0,49 del centro geométrico a
 * secas y hasta un bin entero del método anterior. Lo que no puede arreglar es un pico
 * recortado de UN solo bin, que no se distingue de un pico sin recortar: por eso el analizador
 * mide sobre los dB y deja los bytes para el dibujo.
 *
 * Si falta un punto o no es finito, se da el centro geométrico. Nunca sale de [a − 0,5, b + 0,5].
 */
function centroDeMeseta(espectro: ArrayLike<number>, a: number, b: number): number {
  const centro = (a + b) / 2;
  const izquierdo = valorBin(espectro, a - 1);
  const derecho = valorBin(espectro, b + 1);
  if (izquierdo === derecho) return centro;
  const cercaEsIzquierdo = izquierdo > derecho;
  const cerca = cercaEsIzquierdo ? izquierdo : derecho;
  const siguiente = cercaEsIzquierdo ? valorBin(espectro, a - 2) : valorBin(espectro, b + 2);
  const lejos = cercaEsIzquierdo ? derecho : izquierdo;
  if (!Number.isFinite(cerca) || !Number.isFinite(siguiente) || !Number.isFinite(lejos)) return centro;
  if (!(cerca > siguiente)) return centro;
  const delta = Math.min(1, Math.max(0, (cerca - lejos) / (cerca - siguiente)));
  return cercaEsIzquierdo ? centro - delta / 2 : centro + delta / 2;
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
