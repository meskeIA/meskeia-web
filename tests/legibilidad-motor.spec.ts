import { test, expect } from '@playwright/test';
import {
  analizarTexto,
  marcarTexto,
  contarSilabas,
} from '../app/calculadora-legibilidad/motor';

/**
 * Motor de la Calculadora de Legibilidad — casos resueltos A MANO antes de escribir la vista
 * (S0218, 21/10/2026: señalar en el texto lo que baja la puntuación).
 *
 * Todas las palabras de relleno tienen DOS sílabas sin diptongo (casa, perro, mesa, gato,
 * libro, verde, lado, mano, pelo, rojo), así que sílabas = 2 × palabras salvo donde se dice.
 * «maravilla» tiene CUATRO (ma-ra-vi-lla): vocales a, a, i, a, sin diptongo.
 *
 *   IFSZ = 206,835 − 62,3 × (sílabas/palabras) − palabras/frases
 *   Partir una frase de n palabras en trozos de 20 como mucho añade ⌈n/20⌉ − 1 frases al
 *   texto, sin cambiar palabras ni sílabas.
 */

const DIEZ = 'casa perro mesa gato libro verde lado mano pelo rojo';
const palabras = (n: number) => {
  const base = DIEZ.split(' ');
  return Array.from({ length: n }, (_, i) => base[i % 10]).join(' ');
};
const frase = (n: number) => {
  const p = palabras(n);
  return p.charAt(0).toUpperCase() + p.slice(1) + '.';
};

test('sílabas: maravilla = 4, casa = 2', () => {
  expect(contarSilabas('maravilla')).toBe(4);
  expect(contarSilabas('casa')).toBe(2);
});

test('CASO A — una frase de 30 palabras y otra corta con «maravilla»', () => {
  // P = 35 · F = 2 · S = 30×2 + 4×2 + 4 = 72
  //   IFSZ = 206,835 − 62,3 × 72/35 − 35/2 = 206,835 − 128,16 − 17,5 = 61,175 → Normal
  //   Fernández Huerta = 206,84 − 60 × 2,0571… − 1,02 × 17,5 = 206,84 − 123,4286 − 17,85 = 65,5614
  //   Partir la de 30 en 2: F = 3 → 206,835 − 128,16 − 11,6667 = 67,0083 → ganancia 5,8333
  const larga = frase(30);
  const texto = `${larga} Casa perro mesa gato maravilla.`;
  const a = analizarTexto(texto)!;
  expect(a.palabras).toBe(35);
  expect(a.oraciones).toBe(2);
  expect(a.silabas).toBe(72);
  expect(a.fleschSzigriszt).toBeCloseTo(61.175, 6);
  expect(a.fernandezHuerta).toBeCloseTo(65.561429, 5);
  expect(a.dificultad).toBe('Normal');
  expect(a.palabrasLargas).toBe(1);

  expect(a.frasesLargas).toHaveLength(1);
  const f = a.frasesLargas[0];
  expect(f.palabras).toBe(30);
  expect(f.trozos).toBe(2);
  expect(f.ganancia).toBeCloseTo(5.833333, 5);
  // La frase va de su primera letra a su punto, incluido
  expect(texto.slice(f.inicio, f.fin)).toBe(larga);

  expect(a.palabrasMuyLargas).toHaveLength(1);
  const m = a.palabrasMuyLargas[0];
  expect(texto.slice(m.inicio, m.fin)).toBe('maravilla');
  expect(m.silabas).toBe(4);
});

test('CASO B — una frase de 41 palabras se parte en 3', () => {
  // P = 41 · F = 1 · S = 82 → IFSZ = 206,835 − 124,6 − 41 = 41,235
  // En 3 trozos: F = 3 → 206,835 − 124,6 − 13,6667 = 68,5683 → ganancia 27,3333
  const a = analizarTexto(frase(41))!;
  expect(a.fleschSzigriszt).toBeCloseTo(41.235, 6);
  expect(a.dificultad).toBe('Algo difícil');
  expect(a.frasesLargas[0].trozos).toBe(3);
  expect(a.frasesLargas[0].ganancia).toBeCloseTo(27.333333, 5);
});

test('CASO C (límite) — la ganancia se mide sobre la puntuación ACOTADA a 0', () => {
  // 120 palabras sin punto = 1 frase: IFSZ = 206,835 − 124,6 − 120 = −37,765 → se muestra 0
  // En 6 trozos: F = 6 → 206,835 − 124,6 − 20 = 62,235 → ganancia 62,235 (desde 0, no desde −37,8)
  const a = analizarTexto(palabras(120))!;
  expect(a.fleschSzigriszt).toBe(0);
  expect(a.dificultad).toBe('Muy difícil');
  expect(a.frasesLargas[0].trozos).toBe(6);
  expect(a.frasesLargas[0].ganancia).toBeCloseTo(62.235, 6);
});

test('CASO D — dos frases largas se ordenan por lo que ganan, no por dónde están', () => {
  // P = 26 + 45 = 71 · F = 2 · S = 142 → IFSZ = 206,835 − 124,6 − 35,5 = 46,735
  //   partir la de 26 (en 2): F = 3 → 71/3 = 23,6667 → 58,5683 → gana 11,8333
  //   partir la de 45 (en 3): F = 4 → 71/4 = 17,75   → 64,485  → gana 17,75
  const texto = `${frase(26)} ${frase(45)}`;
  const a = analizarTexto(texto)!;
  expect(a.fleschSzigriszt).toBeCloseTo(46.735, 6);
  expect(a.frasesLargas.map((f) => f.palabras)).toEqual([45, 26]);
  expect(a.frasesLargas[0].ganancia).toBeCloseTo(17.75, 6);
  expect(a.frasesLargas[1].ganancia).toBeCloseTo(11.833333, 5);
});

test('CASO E — una frase de exactamente 25 palabras NO se señala', () => {
  const a = analizarTexto(frase(25))!;
  expect(a.frasesLargas).toHaveLength(0);
});

test('marcarTexto — los tramos reconstruyen el texto y marcan lo que toca', () => {
  const larga = frase(30);
  const texto = `${larga}\n\nCasa perro mesa gato maravilla.`;
  const a = analizarTexto(texto)!;
  const tramos = marcarTexto(texto, a);
  expect(tramos.map((t) => t.texto).join('')).toBe(texto);
  expect(tramos.find((t) => t.enFraseLarga)?.texto).toBe(larga);
  const mara = tramos.find((t) => t.palabraMuyLarga)!;
  expect(mara.texto).toBe('maravilla');
  expect(mara.enFraseLarga).toBe(false);
});

test('texto vacío o sin palabras → null', () => {
  expect(analizarTexto('')).toBeNull();
  expect(analizarTexto('   \n ')).toBeNull();
});
