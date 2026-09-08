import { test, expect } from '@playwright/test';
import { puntuarPalabra, VALORES_FICHA } from '../lib/calculadoras/puntuacionScrabble';

/**
 * Puntuación de palabras — casos sumados A MANO antes de escribir la vista.
 *
 * El oráculo no es el propio motor: es la tabla oficial de la edición española
 * de 100 fichas, sumada ficha a ficha.
 *
 *   CASA   = C(3) + A(1) + S(1) + A(1)                 =  6
 *   ZAPATO = Z(10) + A(1) + P(3) + A(1) + T(1) + O(1)  = 17
 *   QUESO  = Q(5) + U(1) + E(1) + S(1) + O(1)          =  9
 *   NIÑO   = N(1) + I(1) + Ñ(8) + O(1)                 = 11
 *   CARRO  = C(3) + A(1) + R(1) + R(1) + O(1)          =  7   (dos R, NO la ficha RR)
 *   CHICO  = C(3) + H(4) + I(1) + C(3) + O(1)          = 12   (C+H, NO la ficha CH)
 *   LLAVE  = L(1) + L(1) + A(1) + V(4) + E(1)          =  8   (dos L, NO la ficha LL)
 *
 * Los tres últimos son el caso que define el alcance de este motor: puntúa letra
 * a letra porque un atril tecleado con letras sueltas no puede decir que tiene la
 * ficha RR en vez de dos R. Puntuarlas como dígrafo contaría fichas que el jugador
 * no ha declarado tener.
 */

test.describe('puntuarPalabra — suma de fichas', () => {
  test('palabras corrientes, sumadas a mano', () => {
    expect(puntuarPalabra('casa')).toBe(6);
    expect(puntuarPalabra('zapato')).toBe(17);
    expect(puntuarPalabra('queso')).toBe(9);
  });

  test('la Ñ tiene ficha propia y vale 8, no es una N de 1', () => {
    expect(puntuarPalabra('niño')).toBe(11);
    // El fallo que evita: NFD descompone la Ñ y un filtro de diacríticos la
    // dejaría en N, puntuando 4 en vez de 11.
    expect(puntuarPalabra('niño')).not.toBe(4);
  });

  test('las tildes no cambian la ficha: Á es la ficha A', () => {
    expect(puntuarPalabra('camión')).toBe(puntuarPalabra('camion'));
    expect(puntuarPalabra('camion')).toBe(10); // C3+A1+M3+I1+O1+N1
  });

  test('los dígrafos se puntúan letra a letra, no como ficha única', () => {
    expect(puntuarPalabra('carro')).toBe(7); // con ficha RR serían 14
    expect(puntuarPalabra('chico')).toBe(12); // con ficha CH serían 10
    expect(puntuarPalabra('llave')).toBe(8); // con ficha LL serían 14
  });

  test('la caja de la palabra es indiferente', () => {
    expect(puntuarPalabra('CASA')).toBe(6);
    expect(puntuarPalabra('CaSa')).toBe(6);
  });
});

test.describe('puntuarPalabra — fichas blancas', () => {
  test('la posición cubierta por un comodín no suma', () => {
    // CASA con la Z... no: CASA con el comodín en la C (posición 0) pierde sus 3 puntos
    expect(puntuarPalabra('casa', [0])).toBe(3);
    // ZAPATO con comodín en la Z (posición 0) pierde los 10 puntos de la ficha cara
    expect(puntuarPalabra('zapato', [0])).toBe(7);
  });

  test('dos comodines restan sus dos fichas', () => {
    // QUESO sin Q(5) ni O(1) = U1+E1+S1 = 3
    expect(puntuarPalabra('queso', [0, 4])).toBe(3);
  });

  test('sin comodines es el mismo resultado que omitir el argumento', () => {
    expect(puntuarPalabra('casa', [])).toBe(puntuarPalabra('casa'));
  });

  test('una posición fuera de la palabra no altera la suma', () => {
    expect(puntuarPalabra('casa', [99])).toBe(6);
  });
});

test.describe('tabla de valores', () => {
  test('las fichas caras son las que dice la edición española', () => {
    expect(VALORES_FICHA.Z).toBe(10);
    expect(VALORES_FICHA.J).toBe(8);
    expect(VALORES_FICHA['Ñ']).toBe(8);
    expect(VALORES_FICHA.X).toBe(8);
    expect(VALORES_FICHA.Q).toBe(5);
  });

  test('K y W no tienen ficha en la edición española', () => {
    expect(VALORES_FICHA.K).toBeUndefined();
    expect(VALORES_FICHA.W).toBeUndefined();
    // Y una palabra que las contenga no las suma como si valieran algo
    expect(puntuarPalabra('kiwi')).toBe(2); // solo I(1) + I(1)
  });
});
