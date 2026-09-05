import { test, expect } from '@playwright/test';
import {
  determinizar,
  minimizar,
  epsilonClausura,
  alfabetoDe,
  EPSILON,
  type AutomataMotor,
} from '../app/simulador-automatas-finitos/motor-conversiones';

/**
 * Motor de conversiones de autómatas — casos resueltos A MANO antes de escribir la vista.
 *
 * El oráculo no es el propio motor: son las tablas de subconjuntos y las particiones
 * hechas con lápiz, que es exactamente lo que hace quien estudia. Un AFD mal
 * determinizado se dibuja igual de bien en pantalla que uno correcto, y el build no
 * puede notar la diferencia: por eso estos casos existen.
 */

// ─────────────────────────────────────────────────────────────
// Constructores cómodos
// ─────────────────────────────────────────────────────────────

function af(
  estados: [id: string, inicial: boolean, final: boolean][],
  transiciones: [from: string, simbolo: string, to: string][],
): AutomataMotor {
  return {
    estados: estados.map(([id, esInicial, esFinal]) => ({ id, etiqueta: id, esInicial, esFinal })),
    transiciones: transiciones.map(([from, simbolo, to]) => ({ from, to, simbolo })),
  };
}

/** Nombre del conjunto tal y como lo escribe el motor. */
const conj = (...etiquetas: string[]) => `{${[...etiquetas].sort((a, b) => a.localeCompare(b, 'es')).join(',')}}`;

// ─────────────────────────────────────────────────────────────
// Determinización
// ─────────────────────────────────────────────────────────────

test.describe('determinizar — construcción de subconjuntos', () => {
  /**
   * A MANO · «cadenas sobre {a,b} que terminan en a».
   *
   *   AFND: q0 --a--> q0 · q0 --a--> q1 · q0 --b--> q0 ; q1 final
   *
   *   Tabla de subconjuntos partiendo de {q0}:
   *      {q0}      con a → {q0,q1}   (nuevo)      con b → {q0}
   *      {q0,q1}   con a → {q0,q1}                con b → {q0}
   *
   *   Dos estados. Final: {q0,q1}, porque contiene q1.
   */
  const TERMINA_EN_A = af(
    [['q0', true, false], ['q1', false, true]],
    [['q0', 'a', 'q0'], ['q0', 'a', 'q1'], ['q0', 'b', 'q0']],
  );

  test('A MANO: el AFND que acepta cadenas terminadas en «a» da exactamente dos estados', () => {
    const r = determinizar(TERMINA_EN_A);
    expect(r.ok).toBe(true);
    expect(r.alfabeto).toEqual(['a', 'b']);

    const nombres = r.automata.estados.map((e) => e.id).sort();
    expect(nombres).toEqual([conj('q0'), conj('q0', 'q1')].sort());

    const inicial = r.automata.estados.find((e) => e.esInicial);
    expect(inicial?.id).toBe(conj('q0'));

    // Final es el conjunto que contiene q1, y SOLO ese
    expect(r.automata.estados.filter((e) => e.esFinal).map((e) => e.id)).toEqual([conj('q0', 'q1')]);
  });

  test('A MANO: las cuatro transiciones del AFD coinciden con la tabla', () => {
    const r = determinizar(TERMINA_EN_A);
    const t = r.automata.transiciones.map((x) => `${x.from} -${x.simbolo}-> ${x.to}`).sort();
    expect(t).toEqual(
      [
        `${conj('q0')} -a-> ${conj('q0', 'q1')}`,
        `${conj('q0')} -b-> ${conj('q0')}`,
        `${conj('q0', 'q1')} -a-> ${conj('q0', 'q1')}`,
        `${conj('q0', 'q1')} -b-> ${conj('q0')}`,
      ].sort(),
    );
  });

  test('el conjunto se marca como «nuevo» la primera vez que aparece, y solo esa vez', () => {
    const r = determinizar(TERMINA_EN_A);
    const nuevas = r.filas.filter((f) => f.nuevo);
    // El único conjunto DESCUBIERTO durante la tabla es {q0,q1}: {q0} es el de partida
    expect(nuevas).toHaveLength(1);
    expect(nuevas[0].hasta).toBe(conj('q0', 'q1'));
  });

  /**
   * A MANO · con transiciones ε. AFND que acepta a*b:
   *
   *   q0 --ε--> q1 · q0 --a--> q0 · q1 --b--> q2 ; q2 final
   *
   *   Arranque = ε-clausura({q0}) = {q0,q1}
   *      {q0,q1}  con a → mover={q0}, clausura={q0,q1}   (el mismo)
   *               con b → mover={q2}, clausura={q2}      (nuevo, y final)
   *      {q2}     con a → ∅   ·  con b → ∅
   */
  const A_ESTRELLA_B = af(
    [['q0', true, false], ['q1', false, false], ['q2', false, true]],
    [['q0', EPSILON, 'q1'], ['q0', 'a', 'q0'], ['q1', 'b', 'q2']],
  );

  test('A MANO: la ε-clausura entra en el estado de arranque', () => {
    const r = determinizar(A_ESTRELLA_B);
    expect(r.ok).toBe(true);
    expect(r.automata.estados.find((e) => e.esInicial)?.id).toBe(conj('q0', 'q1'));
    // ε no es parte del alfabeto de entrada
    expect(r.alfabeto).toEqual(['a', 'b']);
  });

  test('A MANO: a*b da dos estados y el final es {q2}', () => {
    const r = determinizar(A_ESTRELLA_B);
    expect(r.automata.estados.map((e) => e.id).sort()).toEqual([conj('q0', 'q1'), conj('q2')].sort());
    expect(r.automata.estados.filter((e) => e.esFinal).map((e) => e.id)).toEqual([conj('q2')]);
  });

  test('las transiciones que mueren en el conjunto vacío se omiten y se avisa', () => {
    const r = determinizar(A_ESTRELLA_B);
    expect(r.omitidoVacio).toBe(true);
    // Desde {q2} no sale ninguna transición: ni con a ni con b
    expect(r.automata.transiciones.filter((t) => t.from === conj('q2'))).toHaveLength(0);
    expect(r.filas.filter((f) => f.desde === conj('q2') && f.hasta === null)).toHaveLength(2);
  });

  test('un AFD que ya es determinista sale con los mismos estados, uno por conjunto', () => {
    const yaAfd = af(
      [['s0', true, false], ['s1', false, true]],
      [['s0', 'a', 's1'], ['s1', 'a', 's0']],
    );
    const r = determinizar(yaAfd);
    expect(r.ok).toBe(true);
    expect(r.automata.estados).toHaveLength(2);
    expect(r.automata.estados.map((e) => e.id).sort()).toEqual([conj('s0'), conj('s1')].sort());
  });

  test('RECHAZO: sin estado inicial no se determiniza, y se dice por qué', () => {
    const sinInicial = af([['q0', false, true]], [['q0', 'a', 'q0']]);
    const r = determinizar(sinInicial);
    expect(r.ok).toBe(false);
    expect(r.error).toContain('inicial');
    expect(r.automata.estados).toHaveLength(0);
  });

  test('RECHAZO: sin transiciones con símbolo no hay nada que convertir', () => {
    const soloEpsilon = af([['q0', true, false], ['q1', false, true]], [['q0', EPSILON, 'q1']]);
    const r = determinizar(soloEpsilon);
    expect(r.ok).toBe(false);
    expect(r.error).toContain('transición');
  });
});

// ─────────────────────────────────────────────────────────────
// Minimización
// ─────────────────────────────────────────────────────────────

test.describe('minimizar — refinamiento de particiones', () => {
  /**
   * A MANO · dos estados finales equivalentes.
   *
   *   q0 --a--> q1 · q0 --b--> q2 ; q1 y q2 finales y absorbentes:
   *   q1 --a--> q1 · q1 --b--> q1 · q2 --a--> q2 · q2 --b--> q2
   *
   *   Partición 0: {q1,q2} (finales) | {q0}
   *   Ronda 1: q1 y q2 van los dos a la clase de los finales con a y con b → no se parten.
   *            q0 va a la clase de finales con los dos símbolos → clase de uno, no se parte.
   *   Resultado: 2 estados. q1 y q2 se fusionan.
   */
  const DOS_FINALES_IGUALES = af(
    [['q0', true, false], ['q1', false, true], ['q2', false, true]],
    [
      ['q0', 'a', 'q1'], ['q0', 'b', 'q2'],
      ['q1', 'a', 'q1'], ['q1', 'b', 'q1'],
      ['q2', 'a', 'q2'], ['q2', 'b', 'q2'],
    ],
  );

  test('A MANO: dos finales indistinguibles se fusionan en uno', () => {
    const r = minimizar(DOS_FINALES_IGUALES);
    expect(r.ok).toBe(true);
    expect(r.automata.estados).toHaveLength(2);
    expect(r.fusionados).toEqual([['q1', 'q2']]);
  });

  test('A MANO: el mínimo conserva inicial y final donde toca', () => {
    const r = minimizar(DOS_FINALES_IGUALES);
    const inicial = r.automata.estados.find((e) => e.esInicial);
    const final = r.automata.estados.find((e) => e.esFinal);
    expect(inicial?.id).toBe(conj('q0'));
    expect(final?.id).toBe(conj('q1', 'q2'));
    expect(inicial?.esFinal).toBe(false);
  });

  test('la partición inicial separa finales de no finales, y se registra', () => {
    const r = minimizar(DOS_FINALES_IGUALES);
    const ronda0 = r.rondas[0];
    expect(ronda0.numero).toBe(0);
    expect(ronda0.clases.map((c) => c.join(',')).sort()).toEqual(['q0', 'q1,q2']);
  });

  /**
   * A MANO · estados que NO son equivalentes, para comprobar que no fusiona de más.
   *
   *   Paridad de «a»: p0 (inicial, final) --a--> p1 · p1 --a--> p0
   *   Los dos son alcanzables y distinguibles (uno acepta, el otro no): quedan 2 estados
   *   y no hay ninguna fusión.
   */
  test('NO fusiona estados distinguibles: la paridad de «a» sigue necesitando dos', () => {
    const paridad = af(
      [['p0', true, true], ['p1', false, false]],
      [['p0', 'a', 'p1'], ['p1', 'a', 'p0']],
    );
    const r = minimizar(paridad);
    expect(r.ok).toBe(true);
    expect(r.automata.estados).toHaveLength(2);
    expect(r.fusionados).toEqual([]);
  });

  /**
   * A MANO · un estado inalcanzable. Añadimos z, al que no llega nadie.
   * Debe desaparecer ANTES de particionar y quedar nombrado aparte.
   */
  test('los estados inalcanzables se descartan y se nombran', () => {
    const conBasura = af(
      [['q0', true, true], ['q1', false, false], ['z', false, true]],
      [['q0', 'a', 'q1'], ['q1', 'a', 'q0'], ['z', 'a', 'z']],
    );
    const r = minimizar(conBasura);
    expect(r.ok).toBe(true);
    expect(r.inalcanzables).toEqual(['z']);
    expect(r.automata.estados.map((e) => e.id).join(' ')).not.toContain('z');
    expect(r.automata.estados).toHaveLength(2);
  });

  test('una transición ausente distingue: no es lo mismo no ir que ir a otro sitio', () => {
    // f1 y f2 son finales, pero f1 tiene salida con «a» y f2 no. No son equivalentes.
    const asimetrico = af(
      [['q0', true, false], ['f1', false, true], ['f2', false, true]],
      [['q0', 'a', 'f1'], ['q0', 'b', 'f2'], ['f1', 'a', 'f1']],
    );
    const r = minimizar(asimetrico);
    expect(r.ok).toBe(true);
    expect(r.fusionados).toEqual([]);
    expect(r.automata.estados).toHaveLength(3);
  });

  test('RECHAZO: un autómata con ε no se minimiza, se manda determinizar primero', () => {
    const conEpsilon = af(
      [['q0', true, false], ['q1', false, true]],
      [['q0', EPSILON, 'q1'], ['q0', 'a', 'q0']],
    );
    const r = minimizar(conEpsilon);
    expect(r.ok).toBe(false);
    expect(r.error).toContain('Determinízalo');
  });

  test('RECHAZO: dos transiciones con el mismo origen y símbolo es un AFND', () => {
    const nd = af(
      [['q0', true, false], ['q1', false, true]],
      [['q0', 'a', 'q0'], ['q0', 'a', 'q1']],
    );
    const r = minimizar(nd);
    expect(r.ok).toBe(false);
    expect(r.error).toContain('AFND');
  });

  test('RECHAZO: sin estado inicial no se minimiza', () => {
    const r = minimizar(af([['q0', false, true]], [['q0', 'a', 'q0']]));
    expect(r.ok).toBe(false);
    expect(r.error).toContain('inicial');
  });
});

// ─────────────────────────────────────────────────────────────
// Las dos juntas, que es como se usan en un examen
// ─────────────────────────────────────────────────────────────

test.describe('determinizar y luego minimizar', () => {
  test('el AFD determinizado se puede minimizar sin protestar', () => {
    const afnd = af(
      [['q0', true, false], ['q1', false, true]],
      [['q0', 'a', 'q0'], ['q0', 'a', 'q1'], ['q0', 'b', 'q0']],
    );
    const det = determinizar(afnd);
    expect(det.ok).toBe(true);

    const min = minimizar(det.automata);
    expect(min.ok).toBe(true);
    // Terminar en «a» necesita dos estados: ya era mínimo
    expect(min.automata.estados).toHaveLength(2);
    expect(min.fusionados).toEqual([]);
  });

  test('minimizar es idempotente: minimizar el mínimo no cambia nada', () => {
    const r1 = minimizar(
      af(
        [['q0', true, false], ['q1', false, true], ['q2', false, true]],
        [
          ['q0', 'a', 'q1'], ['q0', 'b', 'q2'],
          ['q1', 'a', 'q1'], ['q1', 'b', 'q1'],
          ['q2', 'a', 'q2'], ['q2', 'b', 'q2'],
        ],
      ),
    );
    const r2 = minimizar(r1.automata);
    expect(r2.ok).toBe(true);
    expect(r2.automata.estados).toHaveLength(r1.automata.estados.length);
    expect(r2.fusionados).toEqual([]);
  });
});

// ─────────────────────────────────────────────────────────────
// Auxiliares
// ─────────────────────────────────────────────────────────────

test.describe('auxiliares', () => {
  test('la ε-clausura incluye el estado de partida y es transitiva', () => {
    const ts = [
      { from: 'a', to: 'b', simbolo: EPSILON },
      { from: 'b', to: 'c', simbolo: EPSILON },
      { from: 'c', to: 'd', simbolo: 'x' },
    ];
    expect(epsilonClausura(['a'], ts).sort()).toEqual(['a', 'b', 'c']);
    expect(epsilonClausura(['d'], ts)).toEqual(['d']);
  });

  test('un ciclo de ε no cuelga el cálculo', () => {
    const ts = [
      { from: 'a', to: 'b', simbolo: EPSILON },
      { from: 'b', to: 'a', simbolo: EPSILON },
    ];
    expect(epsilonClausura(['a'], ts).sort()).toEqual(['a', 'b']);
  });

  test('el alfabeto excluye ε, no repite y sale ordenado', () => {
    expect(
      alfabetoDe([
        { from: 'a', to: 'b', simbolo: 'b' },
        { from: 'a', to: 'b', simbolo: 'a' },
        { from: 'a', to: 'b', simbolo: 'a' },
        { from: 'a', to: 'b', simbolo: EPSILON },
      ]),
    ).toEqual(['a', 'b']);
  });
});
