/**
 * Detección de la frecuencia fundamental para el afinador (método de McLeod, «MPM»).
 *
 * Sustituye al `autoCorrelate` que vivía en app/afinador-instrumentos/page.tsx, que tenía tres
 * defectos medidos por el Inspector el 07/11/2026 (hallazgos 4197, 4198 y 4200):
 *   1. Corregía el periodo con `bestOffset + 8 * shift`, una «interpolación» cuyo factor dependía
 *      de la amplitud: el La5 de la bandurria (880 Hz) bien afinado salía a −6 cents, y a −14 con
 *      la señal floja. Aquí se interpola con una parábola de verdad sobre el pico.
 *   2. Buscaba el periodo solo hasta la mitad de una ventana de 2.048 muestras: por debajo de
 *      46,9 Hz (a 48 kHz) no había periodo que encontrar y el Mi1 del bajo no se podía afinar.
 *      Aquí la ventana la decide `tamanoVentana` a partir de la tasa y de `FRECUENCIA_MINIMA`.
 *   3. Su listón de 0,9 se medía sobre la diferencia media absoluta, que crece con la amplitud: una
 *      señal floja lo pasaba siempre, fuera periódica o no, y el ruido grave de una sala inventaba
 *      notas. Aquí la función está NORMALIZADA (vale 1 en una señal periódica perfecta sea cual sea
 *      su volumen) y el listón es una claridad de verdad.
 *
 * Función de diferencia cuadrática normalizada (McLeod y Wyvill, «A smarter way to find pitch»,
 * ICMC 2005):  n(τ) = 2·r(τ) / m(τ),  r(τ) = Σ x[j]·x[j+τ],  m(τ) = Σ (x[j]² + x[j+τ]²),
 * con j de 0 a N−1−τ. La autocorrelación r se calcula con una FFT de 2N puntos (sin ella, una
 * ventana de 4.096 muestras costaría millones de productos por fotograma).
 *
 * Sin dependencias: lo prueban tests/afinacion-instrumentos-motor.spec.ts (npm run test:calc) con
 * tonos sintéticos de frecuencia conocida.
 */

/** La nota más grave que lista el afinador es el Si0 del bajo de 5 cuerdas (30,87 Hz); el La0
 *  del piano, 27,5 Hz. Por debajo de esto no se busca periodo. */
export const FRECUENCIA_MINIMA = 27;

/** Hasta 2.500 Hz: el registro agudo de la flauta (Do7 = 2.093 Hz) y las teclas altas del piano. */
export const FRECUENCIA_MAXIMA = 2500;

/** Por debajo de este valor eficaz se considera silencio (el mismo listón que tenía la app). */
export const RMS_MINIMO = 0.01;

/** Claridad mínima (altura del pico de la función normalizada, de 0 a 1) para dar una nota. Una
 *  nota sostenida pasa de 0,95 (diente de sierra incluido); el ruido marrón, filtrado con un paso
 *  bajo de un polo de 0,9 a 0,999, no pasó de 0,72 en 200 ventanas (medido el 07/11/2026). */
export const CLARIDAD_MINIMA = 0.9;

/** Entre los picos que superan este tanto del más alto, se queda con el primero (el de periodo más
 *  corto): así no se toma una octava por debajo, porque en una señal periódica los picos en 2P, 3P…
 *  son casi tan altos como el de P. */
const FRACCION_PICO = 0.9;

/**
 * Muestras de la ventana de análisis para una tasa: la potencia de 2 que guarda al menos dos
 * periodos y algo más de la nota más grave (4.096 a 44,1 y 48 kHz, 8.192 a 96 kHz). Es el
 * `fftSize` del AnalyserNode; el máximo que admite es 32.768.
 */
export function tamanoVentana(tasa: number): number {
  const necesarias = (2.2 * tasa) / FRECUENCIA_MINIMA;
  let n = 2048;
  while (n < necesarias && n < 32768) n *= 2;
  return n;
}

const cacheTrig = new Map<number, { cos: Float64Array; sin: Float64Array }>();

function trigonometricas(n: number): { cos: Float64Array; sin: Float64Array } {
  let t = cacheTrig.get(n);
  if (!t) {
    const cos = new Float64Array(n / 2);
    const sin = new Float64Array(n / 2);
    for (let i = 0; i < n / 2; i++) {
      cos[i] = Math.cos((2 * Math.PI * i) / n);
      sin[i] = Math.sin((2 * Math.PI * i) / n);
    }
    t = { cos, sin };
    cacheTrig.set(n, t);
  }
  return t;
}

/** FFT compleja radix-2 en el sitio; `inversa` usa la exponencial positiva y NO divide por n. */
function fft(re: Float64Array, im: Float64Array, inversa: boolean): void {
  const n = re.length;
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) {
      const tr = re[i]; re[i] = re[j]; re[j] = tr;
      const ti = im[i]; im[i] = im[j]; im[j] = ti;
    }
  }
  const { cos, sin } = trigonometricas(n);
  const signo = inversa ? 1 : -1;
  for (let largo = 2; largo <= n; largo <<= 1) {
    const mitad = largo >> 1;
    const paso = n / largo;
    for (let i = 0; i < n; i += largo) {
      for (let k = 0; k < mitad; k++) {
        const wr = cos[k * paso];
        const wi = signo * sin[k * paso];
        const a = i + k;
        const b = a + mitad;
        const xr = re[b] * wr - im[b] * wi;
        const xi = re[b] * wi + im[b] * wr;
        re[b] = re[a] - xr;
        im[b] = im[a] - xi;
        re[a] += xr;
        im[a] += xi;
      }
    }
  }
}

/**
 * Función de diferencia cuadrática normalizada de `x` para τ de 0 a `maxRetardo` − 1.
 * Exportada para los tests.
 */
export function funcionNormalizada(x: Float64Array, maxRetardo: number): Float64Array {
  const n = x.length;
  let tamFft = 1;
  while (tamFft < 2 * n) tamFft <<= 1;
  const re = new Float64Array(tamFft);
  const im = new Float64Array(tamFft);
  re.set(x);
  fft(re, im, false);
  for (let i = 0; i < tamFft; i++) {
    re[i] = re[i] * re[i] + im[i] * im[i];
    im[i] = 0;
  }
  fft(re, im, true);

  const salida = new Float64Array(maxRetardo);
  let m = 0;
  for (let i = 0; i < n; i++) m += 2 * x[i] * x[i];
  for (let tau = 0; tau < maxRetardo; tau++) {
    if (tau > 0) m -= x[tau - 1] * x[tau - 1] + x[n - tau] * x[n - tau];
    const r = re[tau] / tamFft;
    salida[tau] = m > 0 ? (2 * r) / m : 0;
  }
  return salida;
}

export interface TonoDetectado {
  /** Frecuencia fundamental en Hz */
  frecuencia: number;
  /** Altura del pico elegido (0-1): cuánto se parece la señal a una periódica */
  claridad: number;
}

/**
 * Frecuencia fundamental de `muestras` (tasa en Hz), o null si es silencio, no es periódica o se
 * sale de [FRECUENCIA_MINIMA, FRECUENCIA_MAXIMA].
 */
export function detectarTono(muestras: ArrayLike<number>, tasa: number): TonoDetectado | null {
  const n = muestras.length;
  if (n < 4) return null;

  let media = 0;
  let suma2 = 0;
  for (let i = 0; i < n; i++) {
    media += muestras[i];
    suma2 += muestras[i] * muestras[i];
  }
  if (Math.sqrt(suma2 / n) < RMS_MINIMO) return null;
  media /= n;
  const x = new Float64Array(n);
  for (let i = 0; i < n; i++) x[i] = muestras[i] - media;

  // Dos periodos dentro de la ventana como mínimo: más allá de n/2 la suma se queda corta
  const maxRetardo = Math.min(Math.ceil(tasa / FRECUENCIA_MINIMA) + 2, Math.floor(n / 2));
  const nsdf = funcionNormalizada(x, maxRetardo);

  // Picos clave: el máximo de cada tramo positivo, tras dejar atrás el lóbulo de τ = 0
  const picos: number[] = [];
  let pos = 1;
  while (pos < maxRetardo && nsdf[pos] > 0) pos++;
  while (pos < maxRetardo && nsdf[pos] <= 0) pos++;
  while (pos < maxRetardo) {
    let mejor = pos;
    while (pos < maxRetardo && nsdf[pos] > 0) {
      if (nsdf[pos] > nsdf[mejor]) mejor = pos;
      pos++;
    }
    // Si el borde corta el tramo, su máximo solo vale si ya ha empezado a bajar: un máximo en la
    // última muestra es una ladera, no un pico, y no se puede interpolar
    if (mejor < maxRetardo - 1) picos.push(mejor);
    while (pos < maxRetardo && nsdf[pos] <= 0) pos++;
  }
  if (picos.length === 0) return null;

  let alto = 0;
  for (const p of picos) alto = Math.max(alto, nsdf[p]);
  if (alto < CLARIDAD_MINIMA) return null;

  const elegido = picos.find((p) => nsdf[p] >= FRACCION_PICO * alto) ?? picos[0];

  // Interpolación parabólica sobre los tres puntos del pico
  const a = nsdf[elegido - 1];
  const b = nsdf[elegido];
  const c = nsdf[elegido + 1];
  const denominador = a - 2 * b + c;
  const desplazamiento = denominador !== 0 ? (0.5 * (a - c)) / denominador : 0;
  const periodo = elegido + desplazamiento;
  const claridad = b - 0.25 * (a - c) * desplazamiento;

  const frecuencia = tasa / periodo;
  if (!(frecuencia >= FRECUENCIA_MINIMA && frecuencia <= FRECUENCIA_MAXIMA)) return null;
  return { frecuencia, claridad };
}
