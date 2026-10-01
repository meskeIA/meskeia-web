/**
 * Tests unitarios del motor de frecuencia dominante (lib/calculadoras/frecuenciaDominante.ts)
 *
 * Ejecutar: npx playwright test --config playwright.calc.config.ts tests/frecuencia-dominante-motor.spec.ts
 *
 * Los espectros no se inventan: se fabrican como los fabrica el `AnalyserNode` —ventana de
 * Blackman, FFT de `fftSize` muestras, módulo normalizado por N y pasado a dB— a partir de una
 * señal cuya frecuencia se conoce de antemano. Así el test mide el motor con el mismo tipo de
 * dato que le llega en el navegador, y el valor esperado es la frecuencia con la que se generó
 * la señal, no una lectura de la app.
 *
 * Las frecuencias se eligen a MITAD de bin a propósito: 441,5 Hz con 48 kHz y 16.384 muestras
 * (2,93 Hz por bin) cae en el bin 150,7. Sin el afinado entre bins el motor diría 442,4 Hz, casi
 * un hercio de error; con él tiene que quedar a menos de 0,3 Hz. Es el caso que da sentido al
 * afinado, y el que falla si se retira.
 */

import { test, expect } from '@playwright/test';
import {
  picoDominante,
  prominencia,
  lecturaEstable,
  nivelMaximo,
  RANGO_DINAMICO_BLACKMAN_DB,
} from '../lib/calculadoras/frecuenciaDominante';

/** FFT radix-2 in situ (re, im), tamaño potencia de dos. */
function fft(re: Float64Array, im: Float64Array): void {
  const n = re.length;
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) {
      [re[i], re[j]] = [re[j], re[i]];
      [im[i], im[j]] = [im[j], im[i]];
    }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const ang = (-2 * Math.PI) / len;
    const wr = Math.cos(ang);
    const wi = Math.sin(ang);
    for (let i = 0; i < n; i += len) {
      let cr = 1;
      let ci = 0;
      for (let k = 0; k < len / 2; k++) {
        const ar = re[i + k + len / 2] * cr - im[i + k + len / 2] * ci;
        const ai = re[i + k + len / 2] * ci + im[i + k + len / 2] * cr;
        re[i + k + len / 2] = re[i + k] - ar;
        im[i + k + len / 2] = im[i + k] - ai;
        re[i + k] += ar;
        im[i + k] += ai;
        const t = cr * wr - ci * wi;
        ci = cr * wi + ci * wr;
        cr = t;
      }
    }
  }
}

/** Generador pseudoaleatorio con semilla: el ruido del test es el mismo en cada ejecución. */
function aleatorio(semilla: number): () => number {
  let s = semilla >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

interface Tono { f: number; a: number }

/** Espectro en dB tal como lo devuelve `getFloatFrequencyData` (sin suavizado entre tramas). */
function espectroDb(tonos: Tono[], sampleRate: number, fftSize: number, ruido = 0): Float32Array {
  const re = new Float64Array(fftSize);
  const im = new Float64Array(fftSize);
  const azar = aleatorio(7);
  for (let i = 0; i < fftSize; i++) {
    let x = 0;
    for (const t of tonos) x += t.a * Math.sin((2 * Math.PI * t.f * i) / sampleRate);
    if (ruido) x += ruido * (azar() * 2 - 1);
    // Ventana de Blackman con los coeficientes de la especificación de Web Audio (α = 0,16).
    const w = 0.42 - 0.5 * Math.cos((2 * Math.PI * i) / fftSize) + 0.08 * Math.cos((4 * Math.PI * i) / fftSize);
    re[i] = x * w;
  }
  fft(re, im);
  const salida = new Float32Array(fftSize / 2);
  for (let k = 0; k < fftSize / 2; k++) {
    const mod = Math.hypot(re[k], im[k]) / fftSize;
    salida[k] = mod > 0 ? 20 * Math.log10(mod) : -Infinity;
  }
  return salida;
}

/** El mismo espectro en bytes, como `getByteFrequencyData` con sus rangos por defecto (-100…-30 dB). */
function aBytes(db: Float32Array): Uint8Array {
  const b = new Uint8Array(db.length);
  for (let i = 0; i < db.length; i++) {
    const v = Number.isFinite(db[i]) ? (255 * (db[i] + 100)) / 70 : 0;
    b[i] = Math.max(0, Math.min(255, Math.floor(v)));
  }
  return b;
}

const SR = 48000;
const N = 16384;

test.describe('picoDominante — tonos puros', () => {
  test('441,5 Hz, a mitad de bin: el afinado lo deja a menos de 0,3 Hz', () => {
    const p = picoDominante(espectroDb([{ f: 441.5, a: 0.5 }], SR, N), SR, N);
    expect(p).not.toBeNull();
    expect(Math.abs(p!.frecuencia - 441.5)).toBeLessThan(0.3);
    // El bin sin afinar es el 151 (442,38 Hz): el error que corrige el afinado es de 0,88 Hz.
    expect(p!.bin).toBe(151);
  });

  test('1.000 Hz a 44,1 kHz con 8.192 muestras (el formato del analizador)', () => {
    const p = picoDominante(espectroDb([{ f: 1000, a: 0.5 }], 44100, 8192), 44100, 8192);
    expect(Math.abs(p!.frecuencia - 1000)).toBeLessThan(0.3);
  });

  test('graves: 52,7 Hz, a solo 18 bins del cero', () => {
    const p = picoDominante(espectroDb([{ f: 52.7, a: 0.5 }], SR, N), SR, N);
    expect(Math.abs(p!.frecuencia - 52.7)).toBeLessThan(0.3);
  });

  test('agudos: 15.001,4 Hz', () => {
    const p = picoDominante(espectroDb([{ f: 15001.4, a: 0.5 }], SR, N), SR, N);
    expect(Math.abs(p!.frecuencia - 15001.4)).toBeLessThan(0.3);
  });

  test('dos tonos: gana el más fuerte aunque el otro sea más agudo', () => {
    const p = picoDominante(espectroDb([{ f: 300, a: 0.5 }, { f: 2000, a: 0.15 }], SR, N), SR, N);
    expect(Math.abs(p!.frecuencia - 300)).toBeLessThan(0.3);
  });

  test('fuera del rango pedido no se busca: un tono de 23 kHz con fMax 20 kHz no gana', () => {
    // A 48 kHz se pueden representar hasta 24 kHz: se usa 23 kHz y fMax = 20 kHz.
    const p = picoDominante(espectroDb([{ f: 23000, a: 0.5 }, { f: 700, a: 0.05 }], SR, N), SR, N, 20, 20000);
    expect(Math.abs(p!.frecuencia - 700)).toBeLessThan(0.5);
  });
});

test.describe('picoDominante — bordes', () => {
  test('silencio absoluto (todo -Infinity): null, no un NaN', () => {
    const vacio = new Float32Array(N / 2).fill(-Infinity);
    expect(picoDominante(vacio, SR, N)).toBeNull();
  });

  // Dos barreras frenan aquí el NaN: la guarda de vecinos finitos y el |δ| ≤ 0,5, que un NaN
  // no cumple. Reinyectado el 29/09/2026: quitando solo la guarda, el caso sigue en verde por
  // la segunda. El test protege el RESULTADO (sin NaN), no una de las dos líneas.
  test('vecino en -Infinity: se da el centro del bin, sin NaN', () => {
    const e = new Float32Array(N / 2).fill(-Infinity);
    e[300] = -40;
    e[301] = -60;
    const p = picoDominante(e, SR, N);
    expect(p!.bin).toBe(300);
    expect(p!.frecuencia).toBeCloseTo((300 * SR) / N, 6);
  });

  test('formato en bytes (analizador de espectro): mismo tono, misma cifra', () => {
    const p = picoDominante(aBytes(espectroDb([{ f: 1000, a: 0.05 }], 44100, 8192)), 44100, 8192);
    // En bytes el afinado pierde algo de finura por la cuantización a 256 niveles.
    expect(Math.abs(p!.frecuencia - 1000)).toBeLessThan(1);
    expect(p!.nivel).toBeGreaterThan(20);
  });

  // Hasta el 01/10/2026 este caso se llamaba «sin afinado, en el primer bin del empate» y
  // exigía bin 200: consagraba el defecto del hallazgo 2567 (ver «mesetas» más abajo). Una
  // meseta simétrica tiene el tono en su CENTRO, no en su primer bin.
  test('bytes saturados (tres bins a 255, vecinos iguales): el centro de la meseta', () => {
    const e = new Uint8Array(4096);
    e[200] = 255;
    e[201] = 255;
    e[202] = 255;
    const p = picoDominante(e, 44100, 8192);
    // A mano: vecinos 199 y 203 iguales (0) → centro (200 + 202)/2 = 201 → 201 · 44100/8192.
    expect(p!.bin).toBe(201);
    expect(p!.frecuencia).toBeCloseTo((201 * 44100) / 8192, 6); // 1.082,058 Hz
    expect(p!.nivel).toBe(255);
  });
});

/*
 * Hallazgo 2567 (analizador-espectro, 01/10/2026). `getByteFrequencyData` recorta en
 * maxDecibels = −30 dB, y un tono por encima de unos −16 dBFS aplana su pico en 2-4 bytes a 255.
 * El motor se quedaba con el PRIMER bin de la meseta y la parábola, con un vecino igual, le
 * sumaba siempre medio bin: Mi2 (82,41 Hz) a −6 dBFS salía 79,1 Hz (13,5 bins × 5,859).
 *
 * Lo que se exige, resuelto a mano: el lóbulo es simétrico alrededor del tono, así que el tono
 * está en el centro de la meseta corrido hacia el vecino MÁS ALTO, Δ/2 bins, donde Δ es lo que
 * el vecino bajo está más lejos, interpolado en el flanco del alto:
 *     Δ = (alto − bajo) / (alto − siguiente del alto)
 * El estimador no conoce la escala de los bytes, así que tiene un error propio; se midió sobre
 * estos mismos espectros antes de escribir los tests (de −30 a 0 dBFS, el tono en cualquier
 * fracción de bin): 0,087 bins como máximo. Se exige 0,1 bins. El centro geométrico a secas
 * erraba hasta 0,49 bins, y el método anterior, hasta un bin.
 */
const BINS_MAX_MESETA = 0.1;

test.describe('picoDominante — mesetas de bytes saturados (hallazgo 2567)', () => {
  test('meseta asimétrica sintética: Δ/2 hacia el vecino alto', () => {
    // Bins 298…304 = 100, 200, 255, 255, 255, 150, 50. Vecino alto: el izquierdo (200), su
    // siguiente hacia fuera 100, el bajo 150 → Δ = (200 − 150)/(200 − 100) = 0,5 → centro
    // 301 − 0,25 = 300,75 bins → 300,75 × 48000/8192 = 1.762,207 Hz; bin entero 301.
    const e = new Uint8Array(4096);
    [100, 200, 255, 255, 255, 150, 50].forEach((v, k) => (e[298 + k] = v));
    const p = picoDominante(e, SR, 8192)!;
    expect(p.frecuencia).toBeCloseTo(1762.20703125, 6);
    expect(p.bin).toBe(301);
  });

  test('Mi2 (82,41 Hz) a −6 dBFS en bytes, 48 kHz y 8.192 muestras: ya no 79,1 Hz', () => {
    // 82,41 / 5,859375 = 14,065 bins. La meseta son los bytes 13, 14 y 15 (el caso del acta).
    const e = aBytes(espectroDb([{ f: 82.41, a: 0.5 }], SR, 8192));
    expect([e[13], e[14], e[15]]).toEqual([255, 255, 255]);
    const p = picoDominante(e, SR, 8192)!;
    expect(Math.abs(p.frecuencia - 82.41)).toBeLessThan(BINS_MAX_MESETA * (SR / 8192));
    // En cents: 12·log2(f/82,41)·100, a menos de 10 ¢ (E2 sigue siendo E2).
    expect(Math.abs(1200 * Math.log2(p.frecuencia / 82.41))).toBeLessThan(10);
  });

  test('La1 (55 Hz) y La2 (110 Hz) a −6 dBFS: a menos de 0,1 bins', () => {
    for (const f of [55, 110]) {
      const p = picoDominante(aBytes(espectroDb([{ f, a: 0.5 }], SR, 8192)), SR, 8192)!;
      expect(Math.abs(p.frecuencia - f), `${f} Hz`).toBeLessThan(BINS_MAX_MESETA * (SR / 8192));
    }
  });

  test('barrido: de −30 a 0 dBFS y el tono en cualquier fracción de bin, ninguna meseta pasa de 0,1 bins', () => {
    const hzPorBin = SR / 8192;
    let mesetas = 0;
    for (let dbfs = -30; dbfs <= 0; dbfs += 3) {
      for (const base of [14, 75, 1700]) {
        for (let fraccion = 0; fraccion < 1; fraccion += 0.05) {
          const bins = base + fraccion;
          const e = aBytes(espectroDb([{ f: bins * hzPorBin, a: 10 ** (dbfs / 20) }], SR, 8192));
          const p = picoDominante(e, SR, 8192)!;
          if (e[p.bin - 1] !== 255 && e[p.bin + 1] !== 255) continue; // no es meseta
          mesetas++;
          expect(Math.abs(p.frecuencia / hzPorBin - bins), `${dbfs} dBFS, bin ${bins.toFixed(2)}`).toBeLessThan(
            BINS_MAX_MESETA,
          );
        }
      }
    }
    // Que el barrido de verdad pase por mesetas: si no, no prueba nada.
    expect(mesetas).toBeGreaterThan(100);
  });

  test('en dB (el formato del generador) no hay meseta: el mismo Mi2 a −6 dBFS, a 0,3 Hz', () => {
    const p = picoDominante(espectroDb([{ f: 82.41, a: 0.5 }], SR, 8192), SR, 8192)!;
    expect(Math.abs(p.frecuencia - 82.41)).toBeLessThan(0.3);
  });
});

/*
 * Hallazgo 2568 (analizador-espectro, 01/10/2026), regresión de c3e3e8ca. El rango empezaba en
 * ceil(20/Δf): a 48 kHz con 8.192 muestras, el bin 4 (23,44 Hz). Un tono de 20,0 a 20,5 Hz tiene
 * la cima en el bin 3 (17,58 Hz), fuera, y el 4 es su flanco: sin lectura para un tono que está
 * dentro de los 20 Hz–20 kHz. Lo que decide ahora es la frecuencia AFINADA de cada cima.
 *
 * Resuelto a mano (Δf = 5,859375 Hz): 20,3 Hz = 3,465 bins → cima en el bin 3, afinada en 3,465
 * → 20,3 Hz, dentro → se lee. 25 Hz = 4,267 bins; fuerte, su meseta empieza en el bin 3.
 */
test.describe('picoDominante — el borde de 20 Hz (hallazgo 2568)', () => {
  test('20,3 Hz a 48 kHz con 8.192 muestras, en bytes a −26 dBFS: 20,3 Hz, no null', () => {
    const p = picoDominante(aBytes(espectroDb([{ f: 20.3, a: 0.05 }], SR, 8192)), SR, 8192);
    expect(p).not.toBeNull();
    expect(p!.bin).toBe(3);
    expect(Math.abs(p!.frecuencia - 20.3)).toBeLessThan(0.3);
  });

  test('20,1, 20,3 y 20,45 Hz en dB, con 8.192 muestras: los tres se leen', () => {
    for (const f of [20.1, 20.3, 20.45]) {
      const lectura = lecturaDelGenerador([{ f, a: 0.5 }], SR, 8192);
      expect(lectura, `${f} Hz`).not.toBeNull();
      expect(Math.abs(lectura! - f), `${f} Hz`).toBeLessThan(0.3);
    }
  });

  test('25 Hz FUERTE (−6 dBFS) en bytes: la meseta empieza en el bin 3 y aun así se lee', () => {
    const e = aBytes(espectroDb([{ f: 25, a: 0.5 }], SR, 8192));
    expect(e[3]).toBe(255);
    const p = picoDominante(e, SR, 8192)!;
    expect(Math.abs(p.frecuencia - 25)).toBeLessThan(BINS_MAX_MESETA * (SR / 8192));
  });

  test('lo de fuera sigue fuera: 19,8 Hz y 15 Hz con 8.192 muestras, sin lectura', () => {
    expect(lecturaDelGenerador([{ f: 19.8, a: 0.5 }], SR, 8192)).toBeNull();
    expect(lecturaDelGenerador([{ f: 15, a: 0.5 }], SR, 8192)).toBeNull();
  });

  test('una cima que afina fuera no tapa un tono de dentro: 18 Hz + 440 Hz y 19,8 Hz + 440 Hz → 440', () => {
    // Con 16.384 muestras, la cima de 18 Hz es el bin 6 (17,58 Hz) y la de 19,8 Hz el 7
    // (20,51 Hz); las dos afinan por debajo de 20 y se descartan, y la búsqueda sigue. Antes, la
    // de 19,8 Hz era «el pico del rango», afinaba fuera y el motor devolvía null: tapaba el 440.
    for (const grave of [18, 19.8]) {
      const f = lecturaDelGenerador([{ f: grave, a: 0.5 }, { f: 440, a: 0.02 }], SR);
      expect(f, `${grave} + 440 Hz`).not.toBeNull();
      expect(Math.abs(f! - 440), `${grave} + 440 Hz`).toBeLessThan(0.3);
    }
  });
});

/*
 * Hallazgo 2412 (generador-tonos, 29/09/2026). Con fMin = 20 Hz el motor empezaba en el bin
 * floor(20 / hzPorBin), que está por DEBAJO de 20 Hz (17,58 Hz a 48 kHz y 18,84 Hz a 44,1 kHz
 * con 16.384 muestras), y se quedaba con el bin más alto del rango aunque no fuera la cima de
 * nada. Un tono más grave que el rango dejaba ese primer bin en el flanco de su lóbulo: era «el
 * pico», el afinado se descartaba (vértice a más de medio bin) y la cifra salía siempre el centro
 * del bin, igual lectura tras lectura, o sea «estable».
 *
 * Resuelto a mano: 15 Hz y 12 Hz están fuera del rango de 20 a 20.000 Hz que la app se pide;
 * lo correcto es NO dar lectura o, si hay otro tono dentro del rango, la de ese tono.
 *
 * Los espectros llevan aquí un fondo de ruido del orden de un paso de 16 bits, como el del WAV
 * del test de la app: sin fondo, el espectro sintético solo tiene error numérico (−250 dB) y
 * cualquier rizo de ese error es un «máximo local». La lectura se juzga con la misma puerta que
 * el generador (`lecturaDelGenerador`): pico que sobresalga 20 dB de la mediana y que no quede
 * más de 58 dB por debajo de lo más fuerte del espectro entero (RANGO_DINAMICO_BLACKMAN_DB).
 *
 * Reinyectado el 29/09/2026 sobre copias del motor:
 *   · floor + el máximo a secas (el motor anterior): 15 Hz → 17,58 (48 kHz) y 18,84 (44,1 kHz);
 *     12 Hz → las mismas; 18 Hz → 18,01; 19,8 Hz → 19,78; bytes → 16,15; y 15 + 440 Hz → 17,58.
 *   · floor + máximo local de ±1 bin: 15 Hz → 75,05 y 82,85; 12 Hz → 22,67; bytes → 37,68. Los
 *     rizos de la cola pasan por máximos locales y sobresalen del fondo: por eso ±3 bins.
 *   · el motor de hoy: lo que queda son rizos a la altura del fondo, con 11-15 dB de prominencia,
 *     por debajo de los 20 del generador.
 */
const FONDO_16_BITS = 1 / 32768;
/** Lo mismo que exige page.tsx del generador (PROMINENCIA_MIN_DB). */
const PROMINENCIA_GENERADOR_DB = 20;

function lecturaDelGenerador(tonos: Tono[], sampleRate: number, fftSize = N): number | null {
  const e = espectroDb(tonos, sampleRate, fftSize, FONDO_16_BITS);
  const p = picoDominante(e, sampleRate, fftSize, 20, 20000);
  if (!p) return null;
  const sobresale = prominencia(e, p, sampleRate, fftSize, 20, 20000) >= PROMINENCIA_GENERADOR_DB;
  const separable = p.nivel >= nivelMaximo(e) - RANGO_DINAMICO_BLACKMAN_DB;
  return sobresale && separable ? p.frecuencia : null;
}

test.describe('picoDominante — sonidos por debajo del rango (hallazgo 2412)', () => {
  test('15 Hz a 48 kHz con 16.384 muestras: sin lectura, no el flanco en 17,6 Hz', () => {
    expect(lecturaDelGenerador([{ f: 15, a: 0.5 }], SR)).toBeNull();
  });

  test('15 Hz a 44,1 kHz con 16.384 muestras: sin lectura, no el flanco en 18,8 Hz', () => {
    expect(lecturaDelGenerador([{ f: 15, a: 0.5 }], 44100)).toBeNull();
  });

  test('12 Hz, a 48 y a 44,1 kHz: sin lectura (ni el flanco ni el rizo de la cola)', () => {
    expect(lecturaDelGenerador([{ f: 12, a: 0.5 }], SR)).toBeNull();
    expect(lecturaDelGenerador([{ f: 12, a: 0.5 }], 44100)).toBeNull();
  });

  test('15 Hz sin fondo de ruido: si el motor da algo, no está en el lóbulo del tono', () => {
    // Sin fondo, lo único que queda lejos del lóbulo es el error numérico (≈ −250 dB): puede
    // salir como pico, pero nunca uno de los bins del lóbulo del tono ni de su cola cercana.
    const p = picoDominante(espectroDb([{ f: 15, a: 0.5 }], SR, N), SR, N, 20, 20000);
    if (p) expect(p.nivel).toBeLessThan(-200);
  });

  test('15 Hz en bytes a 44,1 kHz con 8.192 muestras (el formato del analizador): sin pico', () => {
    // En bytes todo lo que está bajo −100 dB es 0: el motor no tiene nada que devolver.
    const e = aBytes(espectroDb([{ f: 15, a: 0.9 }], 44100, 8192));
    expect(picoDominante(e, 44100, 8192)).toBeNull();
  });

  test('18 Hz: su cima es el bin de 17,58 Hz, que ya no es del rango → sin lectura', () => {
    // 18 / 2,9297 = 6,14: la cima es el bin 6 (17,58 Hz). Con floor(20/2,9297) = 6 entraba.
    expect(lecturaDelGenerador([{ f: 18, a: 0.5 }], SR)).toBeNull();
  });

  test('19,8 Hz asoma en el bin de 20,5 Hz, pero afinado cae fuera del rango → sin lectura', () => {
    expect(lecturaDelGenerador([{ f: 19.8, a: 0.5 }], SR)).toBeNull();
  });

  test('21 Hz, ya dentro del rango, sí se lee', () => {
    const f = lecturaDelGenerador([{ f: 21, a: 0.5 }], SR);
    expect(f).not.toBeNull();
    expect(Math.abs(f! - 21)).toBeLessThan(0.3);
  });

  test('un grave fuerte fuera del rango no tapa un tono débil de dentro: 15 Hz + 440 Hz → 440', () => {
    const f = lecturaDelGenerador([{ f: 15, a: 0.5 }, { f: 440, a: 0.02 }], SR);
    expect(f).not.toBeNull();
    expect(Math.abs(f! - 440)).toBeLessThan(0.3);
  });

  test('15 Hz con un resto de distorsión de −134 dB en 468 Hz: el resto no es un tono', () => {
    // Lo que se midió en el navegador con el WAV de 15 Hz (ver `nivelMaximo`): el tono a −25,7 dB
    // y, lejos, componentes de −117 a −136 dB sobre un fondo de −175. Aquí, sin fondo de ruido
    // para que la mediana quede tan honda como allí. El motor SÍ ve el pico en 468 Hz (es la cima
    // de su lóbulo) y sobresale de la mediana: lo que lo descarta es el rango dinámico.
    const e = espectroDb([{ f: 15, a: 0.5 }, { f: 468, a: 0.5 * 10 ** (-108 / 20) }], SR, N);
    const p = picoDominante(e, SR, N, 20, 20000)!;
    expect(Math.abs(p.frecuencia - 468)).toBeLessThan(0.5);
    expect(prominencia(e, p, SR, N, 20, 20000)).toBeGreaterThan(PROMINENCIA_GENERADOR_DB);
    expect(p.nivel).toBeLessThan(nivelMaximo(e) - RANGO_DINAMICO_BLACKMAN_DB);
  });

  test('el rango dinámico no se come un tono débil de verdad: 440 Hz 50 dB bajo un grave de 15 Hz', () => {
    const f = lecturaDelGenerador([{ f: 15, a: 0.5 }, { f: 440, a: 0.5 * 10 ** (-50 / 20) }], SR);
    expect(f).not.toBeNull();
    expect(Math.abs(f! - 440)).toBeLessThan(0.5);
  });

  test('nivelMaximo mira el espectro entero, sin la continua', () => {
    const e = new Float32Array(16).fill(-Infinity);
    e[0] = 0;
    e[3] = -30;
    e[12] = -10;
    expect(nivelMaximo(e)).toBe(-10);
    expect(nivelMaximo(new Float32Array(8).fill(-Infinity))).toBe(-Infinity);
  });

  test('440 Hz sigue igual de fino, a 48 y a 44,1 kHz', () => {
    expect(Math.abs(lecturaDelGenerador([{ f: 440, a: 0.5 }], SR)! - 440)).toBeLessThan(0.3);
    expect(Math.abs(lecturaDelGenerador([{ f: 440, a: 0.5 }], 44100)! - 440)).toBeLessThan(0.3);
  });
});


test.describe('prominencia — ¿hay un tono o solo ruido?', () => {
  test('ruido blanco solo: el pico no se separa ni 15 dB de la mediana', () => {
    const e = espectroDb([], SR, N, 0.1);
    const p = picoDominante(e, SR, N)!;
    expect(prominencia(e, p, SR, N)).toBeLessThan(15);
  });

  test('tono sobre el mismo ruido: se separa más de 30 dB', () => {
    const e = espectroDb([{ f: 880, a: 0.05 }], SR, N, 0.1);
    const p = picoDominante(e, SR, N)!;
    expect(Math.abs(p.frecuencia - 880)).toBeLessThan(0.5);
    expect(prominencia(e, p, SR, N)).toBeGreaterThan(30);
  });
});

test.describe('lecturaEstable', () => {
  test('cinco lecturas a ±5 cents de 440: estable, en 440', () => {
    const f = lecturaEstable([440, 440.8, 439.3, 440.2, 440]);
    expect(f).not.toBeNull();
    expect(Math.abs(f! - 440)).toBeLessThan(0.3);
  });

  test('una lectura salta a la octava (armónico): no es estable', () => {
    expect(lecturaEstable([440, 880, 440, 440, 440])).toBeNull();
  });

  test('menos lecturas de las pedidas: aún no hay veredicto', () => {
    expect(lecturaEstable([440, 440, 440, 440])).toBeNull();
  });

  test('la tolerancia es relativa: 25 Hz de baile a 5 kHz sí es estable, a 100 Hz no', () => {
    expect(lecturaEstable([5000, 5025, 4990, 5010, 5000])).not.toBeNull();
    expect(lecturaEstable([100, 125, 99, 101, 100])).toBeNull();
  });
});
