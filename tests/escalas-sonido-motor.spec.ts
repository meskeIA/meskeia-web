import { test, expect } from '@playwright/test';
import {
  frecuenciaMidi,
  secuenciaEscala,
  notasMidiEscala,
  gradoDeNota,
  segundosPorNota,
} from '../app/visualizador-escalas-musicales/sonido';

/**
 * Motor del sonido de visualizador-escalas-musicales (S0177) — casos resueltos A MANO antes
 * de escribir la vista.
 *
 * Oráculo de frecuencias, sin calculadora: el La de afinación es 440 Hz por definición, cada
 * octava dobla la frecuencia (La 3 = 220, La 5 = 880) y el Do central de un piano afinado a
 * 440 es el conocido 261,63 Hz (= 440 / 2^(9/12)).
 *
 * Oráculo de secuencias: Do mayor es Do-Re-Mi-Fa-Sol-La-Si-Do, con los semitonos 0 2 4 5 7 9 11
 * sobre el Do central (MIDI 60) → 60 62 64 65 67 69 71 y cierre en 72. La pentatónica menor de
 * La (raíz 9, intervalos 0 3 5 7 10) arranca en el La 440 (MIDI 69): 69 72 74 76 79 y cierre 81.
 */

const DECIMALES = 2;

test.describe('frecuencias en temperamento igual (La = 440 Hz)', () => {
  test('La 4 = 440, La 3 = 220, La 5 = 880', () => {
    expect(frecuenciaMidi(69)).toBe(440);
    expect(frecuenciaMidi(57)).toBeCloseTo(220, DECIMALES);
    expect(frecuenciaMidi(81)).toBeCloseTo(880, DECIMALES);
  });

  test('Do central = 261,63 Hz', () => {
    expect(frecuenciaMidi(60)).toBeCloseTo(261.63, DECIMALES);
  });
});

test.describe('la secuencia que suena', () => {
  const MAYOR = [0, 2, 4, 5, 7, 9, 11];
  const PENTA_MENOR = [0, 3, 5, 7, 10];

  test('Do mayor subiendo: 8 notas, de Do central a la octava', () => {
    expect(secuenciaEscala(0, MAYOR, 'subir')).toEqual([60, 62, 64, 65, 67, 69, 71, 72]);
  });

  test('Do mayor bajando: la misma al revés', () => {
    expect(secuenciaEscala(0, MAYOR, 'bajar')).toEqual([72, 71, 69, 67, 65, 64, 62, 60]);
  });

  test('subir y bajar: la nota de arriba suena UNA vez (15 notas, no 16)', () => {
    const s = secuenciaEscala(0, MAYOR, 'subir-bajar');
    expect(s).toEqual([60, 62, 64, 65, 67, 69, 71, 72, 71, 69, 67, 65, 64, 62, 60]);
    expect(s.filter(n => n === 72)).toHaveLength(1);
  });

  test('pentatónica menor de La: empieza en el La 440', () => {
    const s = secuenciaEscala(9, PENTA_MENOR, 'subir');
    expect(s).toEqual([69, 72, 74, 76, 79, 81]);
    expect(frecuenciaMidi(s[0])).toBe(440);
  });

  test('las notas de cada grado, sin la octava de cierre', () => {
    expect(notasMidiEscala(0, MAYOR)).toEqual([60, 62, 64, 65, 67, 69, 71]);
  });
});

test.describe('qué ficha se resalta mientras suena', () => {
  const MAYOR = [0, 2, 4, 5, 7, 9, 11];

  test('cada nota de Do mayor cae en su grado, y la octava vuelve a la tónica', () => {
    expect(secuenciaEscala(0, MAYOR, 'subir').map(m => gradoDeNota(m, 0, MAYOR))).toEqual([0, 1, 2, 3, 4, 5, 6, 0]);
  });

  test('La pentatónica menor: el Do (MIDI 72) es su III grado (índice 1)', () => {
    expect(gradoDeNota(72, 9, [0, 3, 5, 7, 10])).toBe(1);
  });

  test('una nota fuera de la escala no resalta nada', () => {
    expect(gradoDeNota(61, 0, MAYOR)).toBe(-1); // Do# no es de Do mayor
  });
});

test('tempo: a 60 notas por minuto, un segundo por nota; a 120, medio', () => {
  expect(segundosPorNota(60)).toBe(1);
  expect(segundosPorNota(120)).toBe(0.5);
});
