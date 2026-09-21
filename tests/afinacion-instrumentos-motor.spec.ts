/**
 * Tests unitarios del motor de afinador-instrumentos
 *
 * Ejecutar: npx playwright test tests/afinacion-instrumentos-motor.spec.ts
 *
 * Los valores esperados están resueltos a mano con la tabla de frecuencias temperadas
 * (A4 = 440 Hz) y las transposiciones estándar, no leídos de la app:
 *
 *   La4 = 440,00 Hz  ·  La5 = 880,00  ·  La3 = 220,00  ·  Do4 = 261,63  ·  Mi2 = 82,41
 *   Sol#3 = 207,65 (6ª de la bandurria)  ·  Sol#2 = 103,83 (6ª del laúd, una octava menos)
 *   Con La4 = 442 Hz, el Mi2 de la guitarra sube a 82,78 Hz
 *
 *   Transposición (real = escrita + semitonos):
 *     trompeta y clarinete en si bemol −2  →  leen Do4 (48) y suena La#3 (46)
 *     saxo alto en mi bemol −9            →  lee Sol4 (55) y suena La#3 (46)
 *     saxo tenor en si bemol −14          →  lee Do5 (60) y suena La#3 (46)
 *
 * La razón de que esto tenga motor propio y test: la transposición se equivoca en silencio.
 * Un signo al revés da una nota igual de plausible en pantalla (Re4 en vez de Do4) y nadie
 * lo nota sin un instrumento delante.
 */

import { test, expect } from '@playwright/test';
import {
  AFINACIONES,
  AFINACION_POR_ID,
  frecuenciaDeNota,
  notaMasCercana,
  notaEscritaDesdeReal,
  notaRealDesdeEscrita,
  nombreNota,
  aSemitonoAbsoluto,
} from '../lib/calculadoras/afinacionInstrumentos';

/** Frecuencia de la cuerda `i` (0 = primera) de un instrumento, con el La4 indicado. */
function frecuenciaCuerda(id: string, i: number, a4 = 440): number {
  const cuerdas = AFINACION_POR_ID[id].cuerdas;
  if (!cuerdas) throw new Error(`${id} no es un instrumento de cuerda`);
  return frecuenciaDeNota(cuerdas[i].nota, cuerdas[i].octava, a4);
}

test.describe('Frecuencias temperadas', () => {
  test('el La de referencia y sus octavas', () => {
    expect(frecuenciaDeNota(9, 4)).toBeCloseTo(440.0, 2);
    expect(frecuenciaDeNota(9, 5)).toBeCloseTo(880.0, 2);
    expect(frecuenciaDeNota(9, 3)).toBeCloseTo(220.0, 2);
    expect(frecuenciaDeNota(0, 4)).toBeCloseTo(261.63, 2);
  });

  test('la referencia de orquesta desplaza toda la tabla, que era el fallo de las cuerdas fijas', () => {
    expect(frecuenciaCuerda('guitarra', 5, 440)).toBeCloseTo(82.41, 2); // Mi2
    expect(frecuenciaCuerda('guitarra', 5, 442)).toBeCloseTo(82.78, 2);
    expect(frecuenciaCuerda('guitarra', 5, 442)).toBeGreaterThan(frecuenciaCuerda('guitarra', 5, 440));
  });
});

test.describe('Afinaciones de cuerda verificadas', () => {
  test('guitarra estándar de la 1ª a la 6ª', () => {
    const esperadas = [329.63, 246.94, 196.0, 146.83, 110.0, 82.41];
    esperadas.forEach((hz, i) => expect(frecuenciaCuerda('guitarra', i)).toBeCloseTo(hz, 2));
  });

  test('bandurria: seis órdenes por cuartas desde Sol#3', () => {
    expect(AFINACION_POR_ID.bandurria.cuerdas?.map(nombreNota)).toEqual(['La5', 'Mi5', 'Si4', 'Fa#4', 'Do#4', 'Sol#3']);
    expect(frecuenciaCuerda('bandurria', 0)).toBeCloseTo(880.0, 2);
    expect(frecuenciaCuerda('bandurria', 5)).toBeCloseTo(207.65, 2);
  });

  test('el laúd español suena exactamente una octava por debajo de la bandurria', () => {
    const bandurria = AFINACION_POR_ID.bandurria.cuerdas ?? [];
    const laud = AFINACION_POR_ID.laud.cuerdas ?? [];
    expect(laud).toHaveLength(bandurria.length);
    bandurria.forEach((cuerda, i) => {
      expect(aSemitonoAbsoluto(cuerda) - aSemitonoAbsoluto(laud[i])).toBe(12);
    });
    expect(frecuenciaCuerda('laud', 5)).toBeCloseTo(103.83, 2);
  });

  test('la vihuela mexicana es reentrante: la 3ª es la más aguda', () => {
    expect(AFINACION_POR_ID['vihuela-mexicana'].cuerdas?.map(nombreNota)).toEqual(['Mi4', 'Si3', 'Sol4', 'Re4', 'La3']);
    const frecuencias = [0, 1, 2, 3, 4].map((i) => frecuenciaCuerda('vihuela-mexicana', i));
    expect(Math.max(...frecuencias)).toBeCloseTo(frecuencias[2], 2); // Sol4 = 392,00 Hz
  });
});

test.describe('Transposición: lo que suena frente a lo que se lee', () => {
  test('la trompeta en si bemol lee un Do y hace sonar un si bemol', () => {
    const real = notaRealDesdeEscrita({ nota: 0, octava: 4 }, -2);
    expect(nombreNota(real)).toBe('La#3'); // Si bemol 3 = 233,08 Hz
    expect(frecuenciaDeNota(real.nota, real.octava)).toBeCloseTo(233.08, 2);
  });

  test('el afinador oye si bemol y le contesta a cada instrumento con SU nota', () => {
    const sibemol3 = { nota: 10, octava: 3 };
    expect(nombreNota(notaEscritaDesdeReal(sibemol3, -2))).toBe('Do4'); // trompeta, clarinete
    expect(nombreNota(notaEscritaDesdeReal(sibemol3, -9))).toBe('Sol4'); // saxo alto
    expect(nombreNota(notaEscritaDesdeReal(sibemol3, -14))).toBe('Do5'); // saxo tenor
    expect(nombreNota(notaEscritaDesdeReal(sibemol3, 0))).toBe('La#3'); // flauta: no transpone
  });

  test('ida y vuelta: traducir dos veces devuelve la nota de partida', () => {
    for (const transposicion of [-14, -9, -7, -2, 0]) {
      for (let semitono = 24; semitono < 84; semitono++) {
        const real = { nota: ((semitono % 12) + 12) % 12, octava: Math.floor(semitono / 12) };
        const vuelta = notaRealDesdeEscrita(notaEscritaDesdeReal(real, transposicion), transposicion);
        expect(nombreNota(vuelta)).toBe(nombreNota(real));
      }
    }
  });

  test('el signo de la transposición: un transpositor suena SIEMPRE más grave de lo que lee', () => {
    for (const a of AFINACIONES) {
      if (a.transposicion === 0) continue;
      const escrita = { nota: 0, octava: 4 };
      const real = notaRealDesdeEscrita(escrita, a.transposicion);
      expect(aSemitonoAbsoluto(real)).toBeLessThan(aSemitonoAbsoluto(escrita));
    }
  });

  test('la diferencia entre saxo alto y tenor son cinco semitonos', () => {
    expect(AFINACION_POR_ID['saxo-tenor'].transposicion - AFINACION_POR_ID['saxo-alto'].transposicion).toBe(-5);
  });
});

test.describe('Detección de la nota a partir de la frecuencia', () => {
  test('frecuencias exactas dan cero cents', () => {
    expect(notaMasCercana(440).cents).toBe(0);
    expect(nombreNota(notaMasCercana(440))).toBe('La4');
    expect(nombreNota(notaMasCercana(82.41))).toBe('Mi2');
    expect(nombreNota(notaMasCercana(233.08))).toBe('La#3');
  });

  test('una cuerda floja da cents negativos y una tensa, positivos', () => {
    expect(notaMasCercana(437).cents).toBeLessThan(0);
    expect(notaMasCercana(443).cents).toBeGreaterThan(0);
    expect(notaMasCercana(440 * Math.pow(2, 25 / 1200)).cents).toBe(25);
  });

  test('con La4 = 442 la misma frecuencia se juzga más baja', () => {
    expect(notaMasCercana(440, 442).cents).toBeLessThan(0);
    expect(notaMasCercana(442, 442).cents).toBe(0);
  });

  test('cada cuerda de cada instrumento se reconoce a sí misma', () => {
    for (const afinacion of AFINACIONES) {
      for (const cuerda of afinacion.cuerdas ?? []) {
        const hz = frecuenciaDeNota(cuerda.nota, cuerda.octava);
        expect(nombreNota(notaMasCercana(hz)), `${afinacion.nombre} · ${nombreNota(cuerda)}`).toBe(nombreNota(cuerda));
      }
    }
  });
});

test.describe('Catálogo de afinaciones', () => {
  test('los identificadores no se repiten y todas declaran familia y transposición', () => {
    const ids = AFINACIONES.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const a of AFINACIONES) {
      expect(['cuerda', 'viento', 'tecla']).toContain(a.familia);
      expect(Number.isInteger(a.transposicion)).toBe(true);
    }
  });

  test('cada instrumento trae cuerdas o referencias, nunca la pantalla vacía', () => {
    for (const a of AFINACIONES) {
      const tiene = (a.cuerdas?.length ?? 0) + (a.referencias?.length ?? 0);
      expect(tiene, a.nombre).toBeGreaterThan(0);
      if (a.familia === 'cuerda') expect(a.cuerdas?.length ?? 0, a.nombre).toBeGreaterThan(0);
      else expect(a.referencias?.length ?? 0, a.nombre).toBeGreaterThan(0);
    }
  });
});
