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
 * Pico más alto del espectro entre `fMin` y `fMax`, afinado con una parábola sobre sus dos
 * vecinos.
 *
 * El pico se busca en los BINS reales y no en bandas agrupadas: promediando bandas
 * logarítmicas, un pico estrecho en agudos se diluye entre cientos de bins y la cifra solo
 * puede tomar tantos valores como bandas haya (hallazgos 884 y 886 del analizador).
 *
 * La parábola que pasa por (−1, y₋₁), (0, y₀), (1, y₊₁) tiene el vértice en
 * δ = (y₋₁ − y₊₁) / (2·(y₋₁ − 2y₀ + y₊₁)), y ese δ es la fracción de bin que hay que sumar. Si
 * sale fuera de ±0,5 bins, el pico no tiene forma de pico (dos bins iguales saturados, por
 * ejemplo) y se deja en el centro del bin. Si un vecino no es finito —silencio en el formato
 * en dB—, tampoco se afina: con -Infinity la parábola daría NaN.
 *
 * Devuelve `null` si no hay ningún bin finito en el rango.
 */
export function picoDominante(
  espectro: ArrayLike<number>,
  sampleRate: number,
  fftSize: number,
  fMin = 20,
  fMax = 20000,
): PicoEspectro | null {
  const hzPorBin = sampleRate / fftSize;
  const binMin = Math.max(1, Math.floor(fMin / hzPorBin));
  const binMax = Math.min(espectro.length - 2, Math.floor(fMax / hzPorBin));

  let bin = -1;
  let nivel = -Infinity;
  for (let i = binMin; i <= binMax; i++) {
    const v = espectro[i];
    // Estricto: ante un empate gana el primero, que es como lo hacía el analizador.
    if (Number.isFinite(v) && v > nivel) {
      nivel = v;
      bin = i;
    }
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
  return { frecuencia: afinado * hzPorBin, nivel, bin };
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
  const hzPorBin = sampleRate / fftSize;
  const binMin = Math.max(1, Math.floor(fMin / hzPorBin));
  const binMax = Math.min(espectro.length - 2, Math.floor(fMax / hzPorBin));
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
