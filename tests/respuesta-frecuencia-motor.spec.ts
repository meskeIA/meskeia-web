import { test, expect } from '@playwright/test';
import {
  TERCIOS_DE_OCTAVA,
  MARGEN_RUIDO_DB,
  frecuenciasDeMedida,
  resolucionFft,
  indiceBin,
  nivelPico,
  restarRuido,
  mediana,
  normalizarCurva,
  compararCurvas,
  resumirCurva,
  saltoMedioEntreVecinos,
  pareceRuido,
  SALTO_MAXIMO_PLAUSIBLE_DB,
  evaluarMicrofono,
  type PuntoMedida,
} from '../app/generador-tonos/motor-respuesta';

/**
 * Medida de respuesta en frecuencia — casos resueltos A MANO antes de escribir la vista.
 *
 * El oráculo no es el propio motor. Los bins salen de f·N/fs con lápiz; las restas de ruido,
 * de pasar los decibelios a energía y volver; la retícula, de la serie nominal ISO 266.
 *
 * Lo que estos casos protegen de verdad es la honestidad de la gráfica: un punto que no
 * despega del ruido tiene que salir como HUECO, no como 0 dB. Las dos cosas se dibujan
 * parecido y significan lo contrario —«aquí no llega señal» frente a «aquí la respuesta es
 * plana»—, así que un motor que las confunda produce una curva perfecta sobre un altavoz
 * roto y en pantalla no se distingue de uno correcto.
 */

test.describe('frecuenciasDeMedida — retícula de tercios de octava', () => {
  test('el rango de un altavoz corriente da los 26 tercios de 50 Hz a 16 kHz', () => {
    const f = frecuenciasDeMedida(50, 16000);
    expect(f).toEqual([
      50, 63, 80, 100, 125, 160, 200, 250, 315, 400, 500, 630, 800, 1000,
      1250, 1600, 2000, 2500, 3150, 4000, 5000, 6300, 8000, 10000, 12500, 16000,
    ]);
    expect(f).toHaveLength(26);
  });

  test('incluye los extremos y acepta el rango del revés', () => {
    expect(frecuenciasDeMedida(1000, 2000)).toEqual([1000, 1250, 1600, 2000]);
    expect(frecuenciasDeMedida(2000, 1000)).toEqual([1000, 1250, 1600, 2000]);
  });

  test('la retícula completa es la serie ISO 266 de 20 Hz a 20 kHz', () => {
    expect(frecuenciasDeMedida(20, 20000)).toHaveLength(TERCIOS_DE_OCTAVA.length);
    expect(TERCIOS_DE_OCTAVA).toHaveLength(31);
  });
});

test.describe('indiceBin — dónde cae cada frecuencia en la FFT', () => {
  test('resolución y bins calculados a mano', () => {
    // 48.000 / 16.384 = 2,9296875 Hz por bin
    expect(resolucionFft(48000, 16384)).toBeCloseTo(2.9296875, 7);

    // 1.000 / 2,9296875 = 341,33  → bin 341
    expect(indiceBin(1000, 48000, 16384)).toBe(341);
    // 440 / 2,9296875 = 150,19  → bin 150
    expect(indiceBin(440, 48000, 16384)).toBe(150);
    // Con otra tarjeta: 44.100 / 8.192 = 5,3833 Hz ; 1.000 / 5,3833 = 185,76 → bin 186
    expect(indiceBin(1000, 44100, 8192)).toBe(186);
  });
});

test.describe('nivelPico — tolerar que el tono no caiga en el bin exacto', () => {
  /** Espectro de 8.192 bins (fftSize 16.384) a -100 dB, con un pico donde se diga. */
  const espectroCon = (bin: number, db: number) => {
    const e = new Array<number>(8192).fill(-100);
    e[bin] = db;
    return e;
  };

  test('encuentra el pico desplazado unos hercios por la deriva de reloj', () => {
    // Ventana para 1.000 Hz: centro 341, ancho max(2, round(0,03·1000/2,9296875)) = 10 → 331..351
    expect(nivelPico(espectroCon(344, -20), 1000, 48000, 16384)).toBe(-20);
    expect(nivelPico(espectroCon(331, -20), 1000, 48000, 16384)).toBe(-20);
    expect(nivelPico(espectroCon(351, -20), 1000, 48000, 16384)).toBe(-20);
  });

  test('no se trae un pico ajeno de fuera de la ventana', () => {
    // El bin 355 (≈1.040 Hz) queda fuera: se lee el fondo, no ese pico
    expect(nivelPico(espectroCon(355, -20), 1000, 48000, 16384)).toBe(-100);
  });

  test('en los graves la ventana no se queda en cero bins', () => {
    // Para 50 Hz: 0,03·50 = 1,5 Hz, menos de un bin. El suelo de 2 bins la mantiene viva.
    // centro = round(50/2,9296875) = 17 → ventana 15..19
    expect(nivelPico(espectroCon(19, -30), 50, 48000, 16384)).toBe(-30);
    expect(nivelPico(espectroCon(14, -30), 50, 48000, 16384)).toBe(-100);
  });

  test('un espectro con -Infinity (bins vacíos) no rompe la lectura', () => {
    const e = new Array<number>(8192).fill(-Infinity);
    e[341] = -45;
    expect(nivelPico(e, 1000, 48000, 16384)).toBe(-45);
  });
});

test.describe('restarRuido — resta energética, y hueco cuando no despega', () => {
  test('señal 20 dB por encima del ruido: la corrección es mínima', () => {
    // 10·log10(10^6 − 10^4) = 10·log10(990.000) = 59,9564
    expect(restarRuido(60, 40)).toBeCloseTo(59.9564, 3);
  });

  test('justo en el margen de 6 dB todavía se acepta, y corrige de verdad', () => {
    // 10·log10(10^5 − 10^4,4) = 10·log10(74.881,14) = 48,7434
    expect(restarRuido(50, 44)).toBeCloseTo(48.7434, 3);
    expect(MARGEN_RUIDO_DB).toBe(6);
  });

  test('por debajo del margen NO se devuelve un número: se devuelve hueco', () => {
    expect(restarRuido(45, 43)).toBeNull();
    expect(restarRuido(45, 45)).toBeNull();
    expect(restarRuido(40, 50)).toBeNull();
  });

  test('sin señal no hay punto; sin ruido medido, la señal pasa tal cual', () => {
    expect(restarRuido(-Infinity, 30)).toBeNull();
    expect(restarRuido(55, -Infinity)).toBe(55);
  });
});

test.describe('normalizarCurva — decibelios relativos por la mediana', () => {
  test('la mediana se lleva al 0 dB', () => {
    expect(mediana([1, 2, 3])).toBe(2);
    expect(mediana([1, 2, 3, 4])).toBe(2.5);

    const curva: PuntoMedida[] = [
      { frecuencia: 100, db: 10 },
      { frecuencia: 1000, db: 20 },
      { frecuencia: 10000, db: 30 },
    ];
    expect(normalizarCurva(curva)).toEqual([
      { frecuencia: 100, db: -10 },
      { frecuencia: 1000, db: 0 },
      { frecuencia: 10000, db: 10 },
    ]);
  });

  test('los huecos NO se rellenan al normalizar', () => {
    const curva: PuntoMedida[] = [
      { frecuencia: 100, db: 10 },
      { frecuencia: 1000, db: null },
      { frecuencia: 10000, db: 30 },
    ];
    expect(normalizarCurva(curva)).toEqual([
      { frecuencia: 100, db: -10 },
      { frecuencia: 1000, db: null },
      { frecuencia: 10000, db: 10 },
    ]);
  });

  test('una curva entera sin medidas no inventa un cero', () => {
    const curva: PuntoMedida[] = [
      { frecuencia: 100, db: null },
      { frecuencia: 1000, db: null },
    ];
    expect(normalizarCurva(curva)).toEqual(curva);
  });

  test('un pico aislado en 1 kHz no desplaza la curva entera', () => {
    // Es la razón de normalizar por mediana y no por el valor a 1 kHz: con referencia en
    // 1 kHz, este +40 hundiría los otros cuatro puntos y fingiría un altavoz sin agudos.
    const curva: PuntoMedida[] = [
      { frecuencia: 250, db: 0 },
      { frecuencia: 500, db: 0 },
      { frecuencia: 1000, db: 40 },
      { frecuencia: 2000, db: 0 },
      { frecuencia: 4000, db: 0 },
    ];
    const n = normalizarCurva(curva);
    expect(n.map((p) => p.db)).toEqual([0, 0, 40, 0, 0]);
  });
});

test.describe('compararCurvas — la diferencia solo donde hay las dos medidas', () => {
  test('B menos A, punto a punto', () => {
    const a: PuntoMedida[] = [{ frecuencia: 100, db: -5 }, { frecuencia: 200, db: 0 }];
    const b: PuntoMedida[] = [{ frecuencia: 100, db: -2 }, { frecuencia: 200, db: 3 }];
    expect(compararCurvas(a, b)).toEqual([
      { frecuencia: 100, db: 3 },
      { frecuencia: 200, db: 3 },
    ]);
  });

  test('si a una de las dos le falta el punto, la diferencia es hueco y no un salto falso', () => {
    const a: PuntoMedida[] = [{ frecuencia: 100, db: null }, { frecuencia: 200, db: 0 }];
    const b: PuntoMedida[] = [{ frecuencia: 100, db: -2 }, { frecuencia: 200, db: null }];
    expect(compararCurvas(a, b)).toEqual([
      { frecuencia: 100, db: null },
      { frecuencia: 200, db: null },
    ]);
  });

  test('una frecuencia que solo está en B no se compara contra nada', () => {
    const a: PuntoMedida[] = [{ frecuencia: 100, db: -5 }];
    const b: PuntoMedida[] = [{ frecuencia: 100, db: -5 }, { frecuencia: 8000, db: 2 }];
    expect(compararCurvas(a, b)).toEqual([
      { frecuencia: 100, db: 0 },
      { frecuencia: 8000, db: null },
    ]);
  });
});

test.describe('resumirCurva — pico, valle y desviación', () => {
  test('el recorrido de una curva medida', () => {
    const curva: PuntoMedida[] = [
      { frecuencia: 100, db: -6 },
      { frecuencia: 1000, db: 0 },
      { frecuencia: 5000, db: 4 },
      { frecuencia: 16000, db: null },
    ];
    expect(resumirCurva(curva)).toEqual({
      medidos: 3,
      desviacion: 10,
      frecuenciaPico: 5000,
      frecuenciaValle: 100,
    });
  });

  test('sin ningún punto medido no se resume nada', () => {
    expect(resumirCurva([{ frecuencia: 100, db: null }])).toEqual({
      medidos: 0,
      desviacion: null,
      frecuenciaPico: null,
      frecuenciaValle: null,
    });
  });
});

test.describe('pareceRuido — distinguir una respuesta de un zigzag', () => {
  const curva = (dbs: (number | null)[]): PuntoMedida[] =>
    dbs.map((db, i) => ({ frecuencia: TERCIOS_DE_OCTAVA[i + 5], db }));

  test('una respuesta real varía poco entre bandas contiguas', () => {
    // Saltos: 2, 3, 4, 3, 2 → media 2,8 dB. Es una curva, con su relieve, pero continua.
    const c = curva([0, 2, -1, 3, 0, -2]);
    expect(saltoMedioEntreVecinos(c)).toBeCloseTo(2.8, 5);
    expect(pareceRuido(c)).toBe(false);
  });

  test('el zigzag del micrófono sin señal se caza', () => {
    // Saltos: 30, 55, 53, 58, 30 → media 45,2 dB. Ningún altavoz hace esto.
    const c = curva([0, 30, -25, 28, -30, 0]);
    expect(saltoMedioEntreVecinos(c)).toBeCloseTo(45.2, 5);
    expect(pareceRuido(c)).toBe(true);
    expect(SALTO_MAXIMO_PLAUSIBLE_DB).toBe(12);
  });

  test('un altavoz malo, con un pico y un valle marcados, NO se descarta por serlo', () => {
    // Saltos: 8, 10, 9, 11, 8 → media 9,2 dB. Feo, pero físicamente posible: pasa el filtro.
    const c = curva([0, 8, -2, 7, -4, 4]);
    expect(saltoMedioEntreVecinos(c)).toBeCloseTo(9.2, 5);
    expect(pareceRuido(c)).toBe(false);
  });

  test('los huecos no cuentan como saltos: se salta la pareja entera', () => {
    // Solo hay dos parejas completas (0→1 y 3→4): saltos 1 y 1 → media 1
    const c = curva([0, 1, null, 5, 6, null]);
    expect(saltoMedioEntreVecinos(c)).toBeCloseTo(1, 5);
  });

  test('con muy pocos puntos no se juzga: un veredicto sobre 3 datos sería inventado', () => {
    expect(pareceRuido(curva([0, 40, -40]))).toBe(false);
    expect(saltoMedioEntreVecinos(curva([null, null]))).toBeNull();
  });
});

test.describe('evaluarMicrofono — la comprobación que decide si la medida vale', () => {
  test('con los tres procesados apagados se puede medir', () => {
    expect(evaluarMicrofono({
      echoCancellation: false,
      noiseSuppression: false,
      autoGainControl: false,
    })).toEqual({ sirve: true, procesadosActivos: [] });
  });

  test('la cancelación de eco sola ya invalida la medida', () => {
    // Es literalmente lo que hace: borrar el sonido del propio altavoz, que aquí es la señal.
    expect(evaluarMicrofono({ echoCancellation: true })).toEqual({
      sirve: false,
      procesadosActivos: ['cancelación de eco'],
    });
  });

  test('el control automático de ganancia también, porque aplana la curva solo', () => {
    expect(evaluarMicrofono({ autoGainControl: true })).toEqual({
      sirve: false,
      procesadosActivos: ['control automático de ganancia'],
    });
  });

  test('se nombran todos los que sigan activos', () => {
    expect(evaluarMicrofono({
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
    })).toEqual({
      sirve: false,
      procesadosActivos: ['cancelación de eco', 'control automático de ganancia', 'supresión de ruido'],
    });
  });

  test('un navegador que no informa de sus ajustes no se da por bueno a la fuerza', () => {
    // getSettings() puede devolver el objeto vacío: sin dato, no hay procesado declarado
    // activo, así que se deja medir — pero el aviso de la app sigue diciendo qué mirar.
    expect(evaluarMicrofono({})).toEqual({ sirve: true, procesadosActivos: [] });
  });
});
