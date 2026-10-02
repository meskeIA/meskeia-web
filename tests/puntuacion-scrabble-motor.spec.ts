import { test, expect } from '@playwright/test';
import {
  puntuarPalabra,
  digrafosNecesarios,
  fichasConDigrafos,
  VALORES_FICHA,
} from '../lib/calculadoras/puntuacionScrabble';

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
 *   CARRO  = C(3) + A(1) + RR(8) + O(1)                = 13   (ficha RR)
 *   CHICO  = CH(5) + I(1) + C(3) + O(1)                = 10   (ficha CH)
 *   LLAVE  = LL(8) + A(1) + V(4) + E(1)                = 14   (ficha LL)
 *   CHAPA  = CH(5) + A(1) + P(3) + A(1)                = 10   (ficha CH)
 *
 * Los cuatro últimos son el caso que define el alcance de este motor desde el hallazgo 2602
 * (02/10/2026): CH, LL y RR son UNA ficha. Hasta entonces se puntuaban letra a letra (CARRO 7,
 * CHICO 12, LLAVE 8, CHAPA 12) con el argumento de que un atril tecleado no dice si tiene la
 * ficha RR o dos R; pero el art. 11 del reglamento FISE prohíbe formar el dígrafo con dos
 * fichas sueltas, así que aquellas cifras no eran el valor de ninguna jugada legal. (El
 * comentario antiguo daba «con ficha RR serían 14» para CARRO: son 13.)
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

  test('los dígrafos son una sola ficha (art. 11 FISE), no dos letras sueltas', () => {
    expect(puntuarPalabra('carro')).toBe(13); // letra a letra eran 7
    expect(puntuarPalabra('chico')).toBe(10); // letra a letra eran 12
    expect(puntuarPalabra('llave')).toBe(14); // letra a letra eran 8
    expect(puntuarPalabra('chapa')).toBe(10); // letra a letra eran 12
    // Sin dígrafo, la R doble no existe: CORAR son cinco fichas simples
    expect(puntuarPalabra('corar')).toBe(7);
  });

  test('el corte en fichas sigue las posiciones de letra', () => {
    expect(fichasConDigrafos('carro')).toEqual([
      { ficha: 'C', posiciones: [0] },
      { ficha: 'A', posiciones: [1] },
      { ficha: 'RR', posiciones: [2, 3] },
      { ficha: 'O', posiciones: [4] },
    ]);
    // Con tilde y Ñ: una posición por letra, como la forma normalizada del generador
    expect(fichasConDigrafos('ñoño').map((f) => f.ficha)).toEqual(['Ñ', 'O', 'Ñ', 'O']);
    expect(fichasConDigrafos('chillón').map((f) => f.ficha)).toEqual(['CH', 'I', 'LL', 'O', 'N']);
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

  test('una blanca sobre cualquier letra de un dígrafo es la ficha entera y vale 0', () => {
    // «car?o»: la blanca hace de RR → C3 + A1 + 0 + O1 = 5 (la R suelta se queda en el atril)
    expect(puntuarPalabra('carro', [3])).toBe(5);
    expect(puntuarPalabra('carro', [2])).toBe(5);
    // Dos posiciones del MISMO dígrafo no restan dos veces
    expect(puntuarPalabra('carro', [2, 3])).toBe(5);
    // CHAPA con la blanca en la H: CH a 0 → A1 + P3 + A1 = 5
    expect(puntuarPalabra('chapa', [1])).toBe(5);
  });
});

test.describe('digrafosNecesarios', () => {
  test('dice qué ficha de dígrafo hace falta para jugar la palabra', () => {
    expect(digrafosNecesarios('carro')).toEqual(['RR']);
    expect(digrafosNecesarios('chillón')).toEqual(['CH', 'LL']);
    expect(digrafosNecesarios('corar')).toEqual([]);
    expect(digrafosNecesarios('casa')).toEqual([]);
  });

  test('una blanca sobre el dígrafo lo cubre y ya no hace falta la ficha', () => {
    expect(digrafosNecesarios('carro', [3])).toEqual([]);
    expect(digrafosNecesarios('chillón', [0])).toEqual(['LL']);
    // Una blanca en otra letra no cubre el dígrafo
    expect(digrafosNecesarios('carro', [0])).toEqual(['RR']);
  });

  test('un dígrafo repetido se nombra una vez', () => {
    expect(digrafosNecesarios('chicharra')).toEqual(['CH', 'RR']);
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
