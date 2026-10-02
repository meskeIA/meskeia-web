// Medidor de frecuencia del generador de tonos — cuándo una lectura es ESTABLE (lógica pura)
//
// El detector de pico y la coincidencia de frecuencias son los de analizador-espectro
// (lib/calculadoras/frecuenciaDominante): aquí solo se añade lo que el medidor necesita para
// decir «tono sostenido» y retener la cifra, y que el analizador no necesita porque no retiene.

import { lecturaEstable } from '@/lib/calculadoras/frecuenciaDominante';

/** Una lectura del medidor: la frecuencia del pico y su nivel en dB, tal como los da la FFT. */
export interface LecturaMedidor {
  frecuencia: number;
  nivel: number;
}

/** Lecturas seguidas que tienen que coincidir: cinco, cada 100 ms. */
export const LECTURAS_ESTABLES = 5;

/**
 * Cuánto puede haber caído el nivel del pico en la ÚLTIMA lectura respecto del máximo de la
 * serie, en dB, para que la lectura cuente como sostenida (hallazgo 2615, 02/10/2026).
 *
 * Por qué hace falta. Cinco lecturas cada 100 ms no prueban que el sonido dure medio segundo: la
 * ventana de la FFT abarca 16.384 muestras (0,34 s a 48 kHz, 0,37 s a 44,1 kHz) y el suavizado del
 * AnalyserNode (0,5) guarda la mitad de cada lectura en la siguiente. Un clic de 10 ms con
 * resonancia —un toque en la mesa o en la pantalla del móvil— conserva el mismo pico mientras
 * cruza la ventana y mientras se apaga el suavizado, unas ocho lecturas, y se daba por «Lectura
 * estable» y sustituía la retenida de un tono de verdad. Lo que el clic NO puede imitar es el
 * NIVEL: cinco lecturas abarcan 0,4 s, más que la ventana, así que en la última el clic ya ha
 * salido de ella y el suavizado la deja en la mitad de la anterior (0,5 en magnitud lineal:
 * −6,02 dB), y la anterior no pasa del máximo. Un tono sostenido llena la ventana entera en
 * todas las lecturas y su nivel apenas se mueve.
 *
 * Por qué 4 dB. Por debajo de los 6,02 dB que cae, como mínimo, cualquier transitorio, con margen
 * para el ruido de fondo, que en ese bin sostiene un poco el nivel (con el pico 20 dB sobre el
 * fondo, la caída se queda en ~5,2 dB). Y por encima de lo que se mueve un sonido sostenido real.
 * Simulado con el AnalyserNode (ventana Blackman, suavizado 0,5) a 48 kHz y tres desfases de la
 * lectura: los clics de 1 kHz y 250 Hz con τ = 2 ms, el de 3 kHz con τ = 1 ms y golpes más largos
 * (τ = 20 y 50 ms) no dan ni una lectura estable; sin la guarda daban de 3 a 10. Un tono de 432 Hz
 * de 0,2 s tampoco; de 0,3 s, una; de 1 s, ocho de las nueve posibles (la novena es la cola, que
 * ya no se da por estable: antes seguía «estable» cerca de un segundo después de callar). Un
 * trémolo de ±2 dB a 4 Hz no pierde ninguna, y una nota que se apaga a 8,7 dB/s (τ = 1 s), como
 * una cuerda pulsada, tampoco.
 *
 * Así que, en la práctica, «estable» pide un sonido de unos 0,3 s como mínimo que no se esté
 * apagando deprisa, a la misma frecuencia (±20 cents) durante cinco lecturas.
 */
export const CAIDA_MAXIMA_ESTABLE_DB = 4;

/**
 * La frecuencia de una serie de lecturas si es la de un tono SOSTENIDO, o `null`.
 *
 * Dos condiciones: que las últimas `minimo` lecturas coincidan a ±`toleranciaCents` (la de
 * siempre, `lecturaEstable`, que separa un tono de una voz que habla), y que el nivel de la
 * última no haya caído más de `caidaMaximaDb` desde el máximo de esas lecturas (la que separa un
 * tono de un clic, ver `CAIDA_MAXIMA_ESTABLE_DB`). Que el nivel SUBA no descalifica: es lo que
 * hace un tono mientras llena la ventana al empezar, y no retrasa su primera lectura estable.
 */
export function lecturaSostenida(
  lecturas: readonly LecturaMedidor[],
  minimo = LECTURAS_ESTABLES,
  toleranciaCents = 20,
  caidaMaximaDb = CAIDA_MAXIMA_ESTABLE_DB,
): number | null {
  if (lecturas.length < minimo) return null;
  const ultimas = lecturas.slice(-minimo);
  const frecuencia = lecturaEstable(
    ultimas.map((l) => l.frecuencia),
    minimo,
    toleranciaCents,
  );
  if (frecuencia === null) return null;
  const niveles = ultimas.map((l) => l.nivel);
  if (!niveles.every(Number.isFinite)) return null;
  const caida = Math.max(...niveles) - niveles[niveles.length - 1];
  return caida <= caidaMaximaDb ? frecuencia : null;
}
