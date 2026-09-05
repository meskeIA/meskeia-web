import { test, expect } from '@playwright/test';
import {
  simular,
  revisarAutomata,
  EPSILON,
  FONDO,
  type AutomataPila,
} from '../app/simulador-automata-pila/motor';

/**
 * Motor del autómata a pila — casos resueltos A MANO antes de escribir la vista.
 *
 * El autómata de referencia es el más clásico de todos: aⁿbⁿ, el lenguaje que demuestra
 * que los autómatas finitos no bastan. Se apila una A por cada «a» y se desapila una por
 * cada «b»; si al acabar solo queda el fondo, la cadena está equilibrada.
 *
 *   q0 --a, Z / AZ--> q0     (primera a: apila A sobre el fondo)
 *   q0 --a, A / AA--> q0     (siguientes a: apila otra A)
 *   q0 --ε, A / A---> q1     (cambio de fase, sin consumir entrada)
 *   q1 --b, A / ε----> q1     (cada b desapila una A)
 *   q1 --ε, Z / Z----> q2     (queda solo el fondo: aceptamos)
 *   q2 final
 *
 * La cadena vacía NO pertenece a este lenguaje tal y como está escrito el autómata:
 * para llegar a q1 hace falta una A en la cima, y sin ninguna «a» la cima es Z.
 */

const AN_BN: AutomataPila = {
  estados: [
    { id: 'q0', esInicial: true, esFinal: false },
    { id: 'q1', esInicial: false, esFinal: false },
    { id: 'q2', esInicial: false, esFinal: true },
  ],
  transiciones: [
    { id: 't1', desde: 'q0', entrada: 'a', cima: FONDO, hasta: 'q0', apila: `A${FONDO}` },
    { id: 't2', desde: 'q0', entrada: 'a', cima: 'A', hasta: 'q0', apila: 'AA' },
    { id: 't3', desde: 'q0', entrada: EPSILON, cima: 'A', hasta: 'q1', apila: 'A' },
    { id: 't4', desde: 'q1', entrada: 'b', cima: 'A', hasta: 'q1', apila: EPSILON },
    { id: 't5', desde: 'q1', entrada: EPSILON, cima: FONDO, hasta: 'q2', apila: FONDO },
  ],
};

test.describe('aⁿbⁿ — el lenguaje que un autómata finito no puede reconocer', () => {
  test('A MANO: «aabb» se acepta', () => {
    const r = simular(AN_BN, 'aabb', 'estado-final');
    expect(r.ok).toBe(true);
    expect(r.aceptada).toBe(true);
    expect(r.camino[r.camino.length - 1].estado).toBe('q2');
    expect(r.camino[r.camino.length - 1].resto).toBe('');
  });

  test('A MANO: «ab» se acepta (el caso mínimo, n = 1)', () => {
    expect(simular(AN_BN, 'ab', 'estado-final').aceptada).toBe(true);
  });

  test('A MANO: «aaabbb» se acepta', () => {
    expect(simular(AN_BN, 'aaabbb', 'estado-final').aceptada).toBe(true);
  });

  test('A MANO: «aab» NO se acepta — sobra una a, la pila no se vacía', () => {
    const r = simular(AN_BN, 'aab', 'estado-final');
    expect(r.aceptada).toBe(false);
    expect(r.truncada).toBe(false);
    expect(r.motivo).toContain('todos los caminos');
  });

  test('A MANO: «abb» NO se acepta — sobra una b y no hay A que desapilar', () => {
    expect(simular(AN_BN, 'abb', 'estado-final').aceptada).toBe(false);
  });

  test('A MANO: «ba» NO se acepta — el orden importa', () => {
    expect(simular(AN_BN, 'ba', 'estado-final').aceptada).toBe(false);
  });

  test('A MANO: la cadena vacía NO se acepta con ESTE autómata', () => {
    // Para pasar a q1 hace falta una A en la cima, y sin ninguna «a» la cima es Z
    expect(simular(AN_BN, '', 'estado-final').aceptada).toBe(false);
  });

  test('el camino aceptante consume la entrada entera y termina en un estado final', () => {
    const r = simular(AN_BN, 'aabb', 'estado-final');
    const ultimo = r.camino[r.camino.length - 1];
    expect(ultimo.resto).toBe('');
    expect(AN_BN.estados.find((e) => e.id === ultimo.estado)?.esFinal).toBe(true);
    // El primer paso es la configuración inicial, con la pila en el fondo
    expect(r.camino[0].pila).toBe(FONDO);
    expect(r.camino[0].resto).toBe('aabb');
  });

  test('la exploración en anchura devuelve el camino aceptante MÁS CORTO', () => {
    // «ab»: inicial + apilar A + ε a q1 + desapilar con b + ε a q2 = 5 configuraciones
    const r = simular(AN_BN, 'ab', 'estado-final');
    expect(r.camino).toHaveLength(5);
  });
});

test.describe('aceptación por PILA VACÍA en vez de por estado final', () => {
  /**
   * A MANO · el mismo lenguaje, pero desapilando también el fondo al terminar.
   *   q1 --ε, Z / ε--> q1   deja la pila completamente vacía
   * Con el criterio «pila vacía» no hace falta ningún estado final.
   */
  const POR_PILA: AutomataPila = {
    estados: [
      { id: 'q0', esInicial: true, esFinal: false },
      { id: 'q1', esInicial: false, esFinal: false },
    ],
    transiciones: [
      { id: 't1', desde: 'q0', entrada: 'a', cima: FONDO, hasta: 'q0', apila: `A${FONDO}` },
      { id: 't2', desde: 'q0', entrada: 'a', cima: 'A', hasta: 'q0', apila: 'AA' },
      { id: 't3', desde: 'q0', entrada: EPSILON, cima: 'A', hasta: 'q1', apila: 'A' },
      { id: 't4', desde: 'q1', entrada: 'b', cima: 'A', hasta: 'q1', apila: EPSILON },
      { id: 't5', desde: 'q1', entrada: EPSILON, cima: FONDO, hasta: 'q1', apila: EPSILON },
    ],
  };

  test('A MANO: «aabb» se acepta dejando la pila vacía', () => {
    const r = simular(POR_PILA, 'aabb', 'pila-vacia');
    expect(r.aceptada).toBe(true);
    expect(r.camino[r.camino.length - 1].pila).toBe('');
    expect(r.motivo).toContain('pila');
  });

  test('el MISMO autómata con criterio de estado final no acepta nada: no hay finales', () => {
    const r = simular(POR_PILA, 'aabb', 'estado-final');
    expect(r.ok).toBe(false);
    expect(r.error).toContain('final');
  });

  test('«aab» tampoco se acepta por pila vacía: queda una A dentro', () => {
    expect(simular(POR_PILA, 'aab', 'pila-vacia').aceptada).toBe(false);
  });
});

test.describe('no determinismo', () => {
  /**
   * A MANO · palíndromos pares sobre {a,b}: ww^R. Se apila la primera mitad y se
   * compara con la segunda, pero DÓNDE está la mitad no se sabe: el autómata tiene que
   * adivinarlo. Es el caso que obliga a explorar ramas y no a ejecutar una sola.
   */
  const PALINDROMOS: AutomataPila = {
    estados: [
      { id: 'p', esInicial: true, esFinal: false },
      { id: 'q', esInicial: false, esFinal: false },
      { id: 'f', esInicial: false, esFinal: true },
    ],
    transiciones: [
      { id: 'a1', desde: 'p', entrada: 'a', cima: EPSILON, hasta: 'p', apila: 'A' },
      { id: 'a2', desde: 'p', entrada: 'b', cima: EPSILON, hasta: 'p', apila: 'B' },
      // El salto a la segunda mitad, sin consumir nada: aquí está el no determinismo
      { id: 'a3', desde: 'p', entrada: EPSILON, cima: EPSILON, hasta: 'q', apila: '' },
      { id: 'a4', desde: 'q', entrada: 'a', cima: 'A', hasta: 'q', apila: EPSILON },
      { id: 'a5', desde: 'q', entrada: 'b', cima: 'B', hasta: 'q', apila: EPSILON },
      { id: 'a6', desde: 'q', entrada: EPSILON, cima: FONDO, hasta: 'f', apila: FONDO },
    ],
  };

  test('A MANO: «abba» es palíndromo y se acepta', () => {
    expect(simular(PALINDROMOS, 'abba', 'estado-final').aceptada).toBe(true);
  });

  test('A MANO: «abab» NO es palíndromo y ningún camino lo acepta', () => {
    const r = simular(PALINDROMOS, 'abab', 'estado-final');
    expect(r.aceptada).toBe(false);
    expect(r.truncada).toBe(false);
  });

  test('A MANO: «aa» y «bb» se aceptan; «ab» no', () => {
    expect(simular(PALINDROMOS, 'aa', 'estado-final').aceptada).toBe(true);
    expect(simular(PALINDROMOS, 'bb', 'estado-final').aceptada).toBe(true);
    expect(simular(PALINDROMOS, 'ab', 'estado-final').aceptada).toBe(false);
  });

  test('rechazar exige agotar TODOS los caminos, no que falle el primero', () => {
    const r = simular(PALINDROMOS, 'abab', 'estado-final');
    expect(r.visitadas).toBeGreaterThan(3);
    expect(r.motivo).toContain('todos');
  });
});

test.describe('robustez', () => {
  test('un ciclo de ε no cuelga: se trunca y se DICE que no es concluyente', () => {
    const bucle: AutomataPila = {
      estados: [
        { id: 'q0', esInicial: true, esFinal: false },
        { id: 'q1', esInicial: false, esFinal: true },
      ],
      transiciones: [
        // Apila sin consumir entrada, indefinidamente
        { id: 'b1', desde: 'q0', entrada: EPSILON, cima: EPSILON, hasta: 'q0', apila: 'A' },
        { id: 'b2', desde: 'q0', entrada: 'z', cima: EPSILON, hasta: 'q1', apila: '' },
      ],
    };
    const r = simular(bucle, 'x', 'estado-final');
    expect(r.ok).toBe(true);
    expect(r.aceptada).toBe(false);
    expect(r.truncada).toBe(true);
    expect(r.motivo).toContain('NO es concluyente');
  });

  test('RECHAZO: sin estado inicial no se simula', () => {
    const r = simular({ estados: [{ id: 'q', esInicial: false, esFinal: true }], transiciones: [] }, 'a', 'estado-final');
    expect(r.ok).toBe(false);
    expect(r.error).toContain('inicial');
  });

  test('revisarAutomata avisa de los problemas de forma antes de simular', () => {
    const roto: AutomataPila = {
      estados: [{ id: 'q0', esInicial: false, esFinal: false }],
      transiciones: [{ id: 'x', desde: 'q0', entrada: 'a', cima: FONDO, hasta: 'noExiste', apila: FONDO }],
    };
    const avisos = revisarAutomata(roto);
    expect(avisos.some((a) => a.includes('inicial'))).toBe(true);
    expect(avisos.some((a) => a.includes('no existe'))).toBe(true);
  });

  test('un autómata sano no genera ningún aviso', () => {
    expect(revisarAutomata(AN_BN)).toEqual([]);
  });
});
