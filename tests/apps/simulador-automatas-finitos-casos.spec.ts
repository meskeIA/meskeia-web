import { test, expect } from '@playwright/test';
import {
  CASOS,
  TOTAL_CASOS,
  resolverCaso,
  toleranciaDe,
  comprobarRespuesta,
  generarEjercicioAleatorio,
  textoRespuesta,
} from '../../app/simulador-automatas-finitos/casos';
import {
  determinizar,
  minimizar,
  epsilonClausura,
  validarRapido,
  EPSILON,
} from '../../app/simulador-automatas-finitos/motor-conversiones';

/**
 * Casos para clase — `simulador-automatas-finitos` (tipo A: casos numerados).
 *
 * ⚠️ Este fichero NO sustituye a `tests/apps/simulador-automatas-finitos.spec.ts`, que es el
 * acta del Inspector del 31/08/2026 y sigue siendo el contrato de la vista. Vive aparte porque
 * prueba otra cosa: aquel abre el navegador, y este importa los módulos y los ejecuta sin DOM.
 *
 * ─────────────────────────────────────────────────────────────────────────────────────────
 * DÓNDE VIVE EL CÁLCULO — app/simulador-automatas-finitos/motor-conversiones.ts
 *
 * `casos.ts` NO implementa teoría de autómatas: importa `determinizar`, `minimizar`,
 * `epsilonClausura` y `validarRapido` del motor, que es el mismo que usa la pantalla. Con este
 * cambio se saldaron además dos duplicaciones que ya existían en la app: `epsilonClausura`
 * estaba escrita dos veces (motor y vista) y la simulación de cadenas vivía solo en la vista.
 * Ahora hay UNA implementación de cada cosa, y por eso la app no puede suspender una respuesta
 * que ella misma acaba de imprimir.
 *
 * CONVENIOS DE ESTA APP, que son los que pueden hacer fallar un caso bien resuelto. Los dos son
 * legítimos pero NO universales, así que los enunciados los dicen expresamente:
 *   · la determinización NO añade estado sumidero: una transición que muere en el conjunto
 *     vacío deja el hueco en blanco, como en la mayoría de manuales al resolver la tabla a
 *     mano. Un texto que sí lo añada contaría un estado más en los casos 7 y 8.
 *   · un AFD puede ser PARCIAL: si no hay transición definida para el símbolo leído, la cadena
 *     se rechaza (caso 3), en vez de considerarse un error del autómata.
 *   · la ε-clausura sigue las flechas ε hacia DELANTE. Una ε que entra en el estado no cuenta,
 *     que es exactamente lo que discrimina el caso 5.
 *
 * ─────────────────────────────────────────────────────────────────────────────────────────
 * LAS 12 RESPUESTAS, RESUELTAS A MANO ANTES DE EJECUTAR NADA
 *
 *   1  AFD «número PAR de ceros», de 1, 00, 010, 0110, 101, 0001 → 4 aceptadas
 *      Ceros: 0, 2, 2, 2, 1, 3. Las cuatro primeras son pares; 101 y 0001 acaban en q1.
 *   2  AFD «termina en ab», de ab, aab, ba, abab, abb, b, aba → 3 aceptadas
 *      Terminan en «ab»: ab, aab y abab. Las otras cuatro no.
 *   3  AFD PARCIAL de identificadores (empiezan por letra), de L, Ld, dL, LdL, dd, LLd → 4
 *      Aceptadas L, Ld, LdL y LLd. dL y dd mueren en q0 por falta de transición con «d».
 *   4  AFD «al menos un dígito», longitud de la aceptada más corta de LL, LLL, LLd, dLL, LdLL → 3
 *      LL y LLL se rechazan por no llevar dígito. De las tres aceptadas, LLd y dLL miden 3.
 *   5  ε-clausura de q0 con ε: q0→q1, q1→q2, q2→q4 y q3→q0 → 4 estados
 *      {q0, q1, q2, q4}. q3 NO entra: su ε apunta hacia q0, no al revés.
 *   6  ε-clausura de q0 en la construcción de Thompson de «a|b» → 3 estados
 *      {q0, q1, q3}: las dos ramas de la alternativa. Para llegar a q2 o q4 hay que leer antes
 *      una a o una b, y la clausura no lee símbolos.
 *   7  Determinizar el AFND «contiene 01» → 4 estados
 *      {q0} -0→ {q0,q1} · {q0,q1} -1→ {q0,q2} · {q0,q2} -0→ {q0,q1,q2}. Ninguna fila descubre
 *      un quinto conjunto. Sin sumidero.
 *   8  Determinizar el AFND-ε de «a*b*c*» → 3 estados
 *      Arranque εclos(q0) = {q0,q1,q2}; con b → {q1,q2}; con c → {q2}. Las transiciones al
 *      vacío se dejan en blanco.
 *   9  Minimizar el AFD de 4 estados que solo mira la paridad de los ceros → 2 estados
 *      La partición inicial finales/no finales ya es estable: q0 ≡ q2 y q1 ≡ q3.
 *  10  Estados inalcanzables de una máquina de 5 estados con código muerto → 3
 *      Desde q0 solo se llega a q0 y q1. q2, q3 y q4 no reciben nada del bloque vivo: que q4
 *      tenga una salida hacia q0 no lo hace alcanzable.
 *  11  Estados que se FUSIONAN al minimizar un AFD de 5 con duplicados → 4
 *      Clases {q2}, {q0,q3}, {q1,q4}: dos clases de dos miembros = 4 estados. La clase con un
 *      solo miembro no cuenta como fusión.
 *  12  AFD «múltiplos de 3 en binario», de 11, 101, 110, 1001, 1010, 1111, 10 → 4 aceptadas
 *      Valores 3, 5, 6, 9, 10, 15 y 2: múltiplos de 3 son 3, 6, 9 y 15.
 */

/** Las doce respuestas derivadas arriba. No están copiadas de lo que devuelve el módulo. */
const A_MANO: Record<number, number> = {
  1: 4,
  2: 3,
  3: 4,
  4: 3,
  5: 4,
  6: 3,
  7: 4,
  8: 3,
  9: 2,
  10: 3,
  11: 4,
  12: 4,
};

test.describe('casos.ts — estructura (invariantes 1 a 5)', () => {
  test('1 · hay exactamente 12 casos con ids 1..12 sin huecos', () => {
    expect(TOTAL_CASOS).toBe(12);
    expect(CASOS.map((c) => c.id)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  });

  test('2 · son deterministas: dos lecturas dan el mismo enunciado y la misma respuesta', () => {
    const primera = CASOS.map((c) => `${c.id}|${c.enunciado}|${c.respuesta}`);
    const segunda = CASOS.map((c) => `${c.id}|${c.enunciado}|${c.respuesta}`);
    expect(segunda).toEqual(primera);
    for (const caso of CASOS) {
      expect(resolverCaso(caso.datos).valor, `caso ${caso.id}`).toBe(resolverCaso(caso.datos).valor);
    }
  });

  test('3 · la respuesta declarada coincide con recalcularla desde `datos`', () => {
    for (const caso of CASOS) {
      const r = resolverCaso(caso.datos);
      expect(r.ok, `el caso ${caso.id} no se resuelve: ${r.error ?? ''}`).toBe(true);
      expect(r.valor, `caso ${caso.id}`).toBe(caso.respuesta);
    }
  });

  test('4 · cada caso tiene enunciado, etiqueta no vacía, respuesta finita y desarrollo', () => {
    for (const caso of CASOS) {
      expect(caso.titulo.trim().length, `caso ${caso.id}`).toBeGreaterThan(0);
      expect(caso.enunciado.trim().length, `caso ${caso.id}`).toBeGreaterThan(20);
      expect(caso.etiquetaRespuesta.trim().length, `caso ${caso.id}`).toBeGreaterThan(0);
      expect(caso.pista.trim().length, `caso ${caso.id}`).toBeGreaterThan(0);
      expect(Number.isFinite(caso.respuesta), `caso ${caso.id}`).toBe(true);
      expect(caso.pasos.length, `caso ${caso.id}`).toBeGreaterThan(1);
      expect(caso.respuestaTexto.trim().length, `caso ${caso.id}`).toBeGreaterThan(0);
    }
  });

  test('5 · ningún enunciado nombra un país, una ciudad ni una moneda', () => {
    const PROHIBIDO =
      /\b(España|español|española|Madrid|Barcelona|México|Colombia|Bogotá|Perú|Lima|Argentina|Buenos Aires|Chile|euro|euros|peso|pesos|dólar|dólares|€|\$)\b/i;
    for (const caso of CASOS) {
      expect(PROHIBIDO.test(caso.titulo), `título ${caso.id}`).toBe(false);
      expect(PROHIBIDO.test(caso.enunciado), `enunciado ${caso.id}`).toBe(false);
      expect(PROHIBIDO.test(caso.pista), `pista ${caso.id}`).toBe(false);
    }
  });
});

test.describe('casos.ts — el generador de práctica (invariante 6)', () => {
  test('6a · es reproducible por semilla', () => {
    for (const s of [1, 7, 12345, 99999]) {
      const a = generarEjercicioAleatorio(s);
      const b = generarEjercicioAleatorio(s);
      expect(b.enunciado).toBe(a.enunciado);
      expect(b.respuesta).toBe(a.respuesta);
    }
  });

  test('6b · es VARIADO: ≥3 respuestas distintas en 40 semillas', () => {
    // Reproducible NO es variado: un xorshift32 sembrado con enteros pequeños devuelve el mismo
    // ejercicio con todas las semillas y aun así pasa la prueba de reproducibilidad.
    const respuestas = new Set<number>();
    const enunciados = new Set<string>();
    for (let s = 1; s <= 40; s++) {
      const e = generarEjercicioAleatorio(s);
      respuestas.add(e.respuesta);
      enunciados.add(e.enunciado);
    }
    expect(respuestas.size).toBeGreaterThanOrEqual(3);
    expect(enunciados.size).toBeGreaterThanOrEqual(3);
  });

  test('6c · usa la MISMA aritmética que los casos fijos', () => {
    for (let s = 1; s <= 60; s++) {
      const e = generarEjercicioAleatorio(s);
      const r = resolverCaso(e.datos);
      expect(r.ok, `semilla ${s}: ${r.error ?? ''}`).toBe(true);
      expect(r.valor, `semilla ${s}`).toBe(e.respuesta);
    }
  });

  test('6d · ningún ejercicio se resuelve sin recorrer el autómata', () => {
    // Una tirada que diera 0 cadenas aceptadas se acierta contestando «0» sin hacer nada.
    for (let s = 1; s <= 60; s++) {
      expect(generarEjercicioAleatorio(s).respuesta, `semilla ${s}`).toBeGreaterThan(0);
    }
  });
});

test.describe('motor — los convenios de esta app (invariante 7)', () => {
  test('7a · la ε-clausura sigue las flechas hacia DELANTE (caso 5)', () => {
    // Es la trampa del tema: una ε que ENTRA en q0 no mete su origen en la clausura de q0.
    const transiciones = [
      { from: 'q0', to: 'q1', simbolo: EPSILON },
      { from: 'q1', to: 'q2', simbolo: EPSILON },
      { from: 'q2', to: 'q4', simbolo: EPSILON },
      { from: 'q3', to: 'q0', simbolo: EPSILON },
    ];
    const clausura = epsilonClausura(['q0'], transiciones);
    expect([...clausura].sort()).toEqual(['q0', 'q1', 'q2', 'q4']);
    expect(clausura).not.toContain('q3');
    // Y desde q3 sí se llega a todo lo demás, que es la comprobación simétrica.
    expect([...epsilonClausura(['q3'], transiciones)].sort()).toEqual(['q0', 'q1', 'q2', 'q3', 'q4']);
  });

  test('7b · la determinización NO añade estado sumidero (casos 7 y 8)', () => {
    // El AFND de «a*b*c*»: con sumidero saldrían 4 estados en lugar de 3.
    const automata = {
      estados: [
        { id: 'q0', etiqueta: 'q0', esInicial: true, esFinal: false },
        { id: 'q1', etiqueta: 'q1', esInicial: false, esFinal: false },
        { id: 'q2', etiqueta: 'q2', esInicial: false, esFinal: true },
      ],
      transiciones: [
        { from: 'q0', to: 'q0', simbolo: 'a' },
        { from: 'q1', to: 'q1', simbolo: 'b' },
        { from: 'q2', to: 'q2', simbolo: 'c' },
        { from: 'q0', to: 'q1', simbolo: EPSILON },
        { from: 'q1', to: 'q2', simbolo: EPSILON },
      ],
    };
    const r = determinizar(automata);
    expect(r.ok).toBe(true);
    expect(r.automata.estados).toHaveLength(3);
    // Alguna transición murió en el vacío y se omitió: esa es la prueba de que no hay sumidero.
    expect(r.omitidoVacio).toBe(true);
  });

  test('7c · un AFD PARCIAL rechaza la cadena cuando no hay transición (caso 3)', () => {
    // Identificadores: empiezan por letra. Desde q0 no hay transición con «d».
    const estados = [
      { id: 'q0', etiqueta: 'q0', esInicial: true, esFinal: false },
      { id: 'q1', etiqueta: 'q1', esInicial: false, esFinal: true },
    ];
    const transiciones = [
      { from: 'q0', to: 'q1', simbolo: 'L' },
      { from: 'q1', to: 'q1', simbolo: 'L' },
      { from: 'q1', to: 'q1', simbolo: 'd' },
    ];
    // `validarRapido` devuelve el veredicto como texto, no un booleano: distingue «rechazada»
    // de «sin-transicion», y esa distinción es justo el convenio que este caso enseña.
    expect(validarRapido('L', 'dfa', estados, transiciones)).toBe('aceptada');
    expect(validarRapido('LdL', 'dfa', estados, transiciones)).toBe('aceptada');
    // «dL» y «dd» mueren en q0 por falta de transición: no es un error del autómata, la cadena
    // simplemente no se acepta, y así las cuenta el caso 3.
    expect(validarRapido('dL', 'dfa', estados, transiciones)).not.toBe('aceptada');
    expect(validarRapido('dd', 'dfa', estados, transiciones)).not.toBe('aceptada');
  });

  test('7d · minimizar fusiona los estados equivalentes (casos 9 y 11)', () => {
    // AFD de 4 estados que solo mira la paridad de los ceros: q0≡q2 y q1≡q3.
    const automata = {
      estados: [
        { id: 'q0', etiqueta: 'q0', esInicial: true, esFinal: true },
        { id: 'q1', etiqueta: 'q1', esInicial: false, esFinal: false },
        { id: 'q2', etiqueta: 'q2', esInicial: false, esFinal: true },
        { id: 'q3', etiqueta: 'q3', esInicial: false, esFinal: false },
      ],
      transiciones: [
        { from: 'q0', to: 'q1', simbolo: '0' },
        { from: 'q1', to: 'q2', simbolo: '0' },
        { from: 'q2', to: 'q3', simbolo: '0' },
        { from: 'q3', to: 'q0', simbolo: '0' },
        { from: 'q0', to: 'q0', simbolo: '1' },
        { from: 'q1', to: 'q1', simbolo: '1' },
        { from: 'q2', to: 'q2', simbolo: '1' },
        { from: 'q3', to: 'q3', simbolo: '1' },
      ],
    };
    const r = minimizar(automata);
    expect(r.ok).toBe(true);
    expect(r.automata.estados).toHaveLength(2);
    expect(r.fusionados).toHaveLength(2);
    expect(r.fusionados.every((g) => g.length === 2)).toBe(true);
  });

  test('7e · minimizar se niega ante un AFND, en vez de dar un resultado falso', () => {
    const conEpsilon = {
      estados: [
        { id: 'q0', etiqueta: 'q0', esInicial: true, esFinal: false },
        { id: 'q1', etiqueta: 'q1', esInicial: false, esFinal: true },
      ],
      transiciones: [{ from: 'q0', to: 'q1', simbolo: EPSILON }],
    };
    const r = minimizar(conEpsilon);
    expect(r.ok).toBe(false);
    expect(r.error ?? '').toContain('ε');
  });
});

test.describe('casos.ts — las 12 respuestas y la corrección', () => {
  test('cada caso da exactamente el valor resuelto a mano en la cabecera', () => {
    for (const caso of CASOS) {
      expect(caso.respuesta, `caso ${caso.id} (${caso.titulo})`).toBe(A_MANO[caso.id]);
    }
  });

  test('la tolerancia es el mayor entre 0,01 y el 1 % del valor', () => {
    expect(toleranciaDe(0)).toBeCloseTo(0.01, 10);
    expect(toleranciaDe(0.5)).toBeCloseTo(0.01, 10);
    expect(toleranciaDe(100)).toBeCloseTo(1, 10);
  });

  test('corrige bien, y una entrada que no es número no imprime «NaN»', () => {
    for (const caso of CASOS) {
      expect(comprobarRespuesta(caso.respuesta, caso.respuesta).correcto, `caso ${caso.id}`).toBe(true);
    }
    expect(comprobarRespuesta(999, CASOS[0].respuesta).correcto).toBe(false);

    const noNumero = comprobarRespuesta(NaN, CASOS[0].respuesta);
    expect(noNumero.correcto).toBe(false);
    expect(noNumero.motivo).not.toContain('NaN');
    expect(noNumero.motivo.trim().length).toBeGreaterThan(0);
  });

  test('resolverCaso nunca lanza, ni con un autómata imposible', () => {
    const sinEstados = { estados: [], transiciones: [] };
    const sinInicial = {
      estados: [{ id: 'q0', etiqueta: 'q0', esInicial: false, esFinal: true }],
      transiciones: [{ from: 'q0', to: 'q0', simbolo: 'a' }],
    };
    for (const automata of [sinEstados, sinInicial]) {
      let r: ReturnType<typeof resolverCaso> | null = null;
      expect(() => {
        r = resolverCaso({ tipo: 'dfa', automata, tarea: { tipo: 'estados-afd' } });
      }).not.toThrow();
      expect((r as unknown as { ok: boolean }).ok).toBe(false);
    }
  });

  test('la respuesta se presenta con su unidad, nunca como número suelto', () => {
    // «4» a secas no distingue 4 estados de 4 cadenas aceptadas, que es justo lo que esta app
    // mezcla (hallazgo 830 de `simulador-genetica`).
    for (const caso of CASOS) {
      const texto = textoRespuesta(caso.respuesta, caso.etiquetaRespuesta);
      expect(texto, `caso ${caso.id}`).toContain(String(caso.respuesta));
      expect(texto.trim().length, `caso ${caso.id}`).toBeGreaterThan(String(caso.respuesta).length + 2);
    }
  });
});
