import { test, expect } from '@playwright/test';
import {
  cifraSinUnidad,
  formatearHM,
  formatearHMS,
  operarTiempo,
  parsearTiempo,
} from '../lib/calculadoras/horas';

/**
 * Motor de calculadora-horas — casos resueltos A MANO antes de tocar la vista (S0224, 24/10/2026).
 * El oráculo es la aritmética del reloj, no el motor:
 *
 *   «45 min»               45 minutos
 *   «1 h 20»               60 + 20 = 80
 *   «hora y media»         60 + 30 = 90
 *   «2 horas y cuarto»     120 + 15 = 135
 *   «tres cuartos de hora» 45
 *   «90 min»               90 (solos, los minutos pueden pasar de 59)
 *   «1 h 75»               error, como «1:75»
 *   «45»                   45 HORAS = 2.700 minutos: sin unidad, una cifra sola sigue siendo horas
 *
 *   7:45 × 5               465 × 5 = 2.325 min = 38:45
 *   15 min entre 4         900 s ÷ 4 = 225 s = 3 min 45 s → 0:03:45
 *   10 min entre 4         600 s ÷ 4 = 150 s = 0:02:30
 *   1:00 entre 7           3.600 ÷ 7 = 514,28… s → 514 s = 8 min 34 s → 0:08:34
 *   0:45 × 1,5             2.700 × 1,5 = 4.050 s = 1 h 7 min 30 s → 1:07:30
 */

test.describe('parsearTiempo — lo que ya leía no cambia', () => {
  const CASOS: [string, number][] = [
    ['7:45', 465],
    ['7h45', 465],
    ['7,75', 465],
    ['7.75', 465],
    ['7', 420],
    ['2h', 120],
    ['0:30', 30],
    ['1:20:30', 81], // 80,5 minutos redondeados al minuto, como antes
    ['-1:15', -75],
    ['45', 2700],
  ];
  for (const [texto, minutos] of CASOS) {
    test(`«${texto}» → ${minutos} min`, () => {
      expect(parsearTiempo(texto)).toBe(minutos);
    });
  }
});

test.describe('parsearTiempo — minutos y horas con unidad', () => {
  const CASOS: [string, number][] = [
    ['45 min', 45],
    ['45min', 45],
    ['45 mins', 45],
    ['45m', 45],
    ['45 minutos', 45],
    ['1 minuto', 1],
    ['90 min', 90],
    ['2 horas', 120],
    ['1 hora', 60],
    ['1 h 20', 80],
    ['1 h 20 min', 80],
    ['1h20m', 80],
    ['1 hora y 20 minutos', 80],
    ['1,5 h', 90],
    ['1.5 horas', 90],
    ['-45 min', -45],
    ['−45 min', -45],
    ['+30 min', 30],
    ['  45   MIN  ', 45],
  ];
  for (const [texto, minutos] of CASOS) {
    test(`«${texto}» → ${minutos} min`, () => {
      expect(parsearTiempo(texto)).toBe(minutos);
    });
  }
});

test.describe('parsearTiempo — con palabras', () => {
  const CASOS: [string, number][] = [
    ['media hora', 30],
    ['cuarto de hora', 15],
    ['un cuarto de hora', 15],
    ['tres cuartos de hora', 45],
    ['una hora', 60],
    ['hora y media', 90],
    ['una hora y media', 90],
    ['1 hora y media', 90],
    ['2 horas y media', 150],
    ['2 horas y cuarto', 135],
  ];
  for (const [texto, minutos] of CASOS) {
    test(`«${texto}» → ${minutos} min`, () => {
      expect(parsearTiempo(texto)).toBe(minutos);
    });
  }
});

test.describe('parsearTiempo — lo que no se entiende', () => {
  const MALOS = ['', '   ', 'abc', '45 kg', '7:60', '1:75', '1 h 75', '1 h 60 min', '1,5 h 20', '7 45', 'min', 'h', 'media', '-'];
  for (const texto of MALOS) {
    test(`«${texto}» → null`, () => {
      expect(parsearTiempo(texto)).toBeNull();
    });
  }
});

test('cifraSinUnidad: solo las cifras enteras sin unidad', () => {
  expect(cifraSinUnidad('45')).toBe(45);
  expect(cifraSinUnidad(' -8 ')).toBe(8);
  expect(cifraSinUnidad('45 min')).toBeNull();
  expect(cifraSinUnidad('7:45')).toBeNull();
  expect(cifraSinUnidad('7,5')).toBeNull();
  expect(cifraSinUnidad('')).toBeNull();
});

test('formatearHM y formatearHMS', () => {
  expect(formatearHM(465)).toBe('7:45');
  expect(formatearHM(-75)).toBe('−1:15');
  expect(formatearHM(0)).toBe('0:00');
  expect(formatearHMS(2325 * 60)).toBe('38:45');
  expect(formatearHMS(225)).toBe('0:03:45');
  expect(formatearHMS(4050)).toBe('1:07:30');
  expect(formatearHMS(-150)).toBe('−0:02:30');
});

test.describe('operarTiempo — multiplicar y repartir', () => {
  test('7:45 × 5 = 38:45', () => {
    expect(formatearHMS(operarTiempo(465, 'por', 5)!)).toBe('38:45');
  });
  test('15 min entre 4 = 0:03:45', () => {
    expect(formatearHMS(operarTiempo(15, 'entre', 4)!)).toBe('0:03:45');
  });
  test('10 min entre 4 = 0:02:30', () => {
    expect(formatearHMS(operarTiempo(10, 'entre', 4)!)).toBe('0:02:30');
  });
  test('1:00 entre 7 = 0:08:34', () => {
    expect(formatearHMS(operarTiempo(60, 'entre', 7)!)).toBe('0:08:34');
  });
  test('0:45 × 1,5 = 1:07:30', () => {
    expect(formatearHMS(operarTiempo(45, 'por', 1.5)!)).toBe('1:07:30');
  });
  test('2:00 entre 3 = 0:40', () => {
    expect(formatearHMS(operarTiempo(120, 'entre', 3)!)).toBe('0:40');
  });
  test('un total negativo conserva el signo', () => {
    expect(formatearHMS(operarTiempo(-30, 'por', 2)!)).toBe('−1:00');
  });
  test('factores que no valen', () => {
    expect(operarTiempo(60, 'entre', 0)).toBeNull();
    expect(operarTiempo(60, 'por', -2)).toBeNull();
    expect(operarTiempo(60, 'por', Number.NaN)).toBeNull();
    expect(operarTiempo(60, 'por', 0)).toBe(0);
  });
});
