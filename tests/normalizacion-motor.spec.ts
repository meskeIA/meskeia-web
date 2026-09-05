import { test, expect } from '@playwright/test';
import {
  cierre,
  cierreExplicado,
  clavesCandidatas,
  analizar,
  parsearDependencias,
  parsearAtributos,
  MAX_ATRIBUTOS,
  type DependenciaFuncional,
} from '../app/normalizacion-bases-datos/motor';

/**
 * Motor de normalización — casos resueltos A MANO antes de escribir la vista.
 *
 * Es el motor más delicado del clúster: un cierre mal calculado produce una clave
 * candidata falsa, y con una clave falsa TODAS las formas normales salen mal sin que
 * nada lo delate en pantalla. El oráculo son los ejercicios trazados con lápiz.
 */

const df = (izq: string, der: string): DependenciaFuncional => ({
  izquierda: izq.split(','),
  derecha: der.split(','),
});

// ─────────────────────────────────────────────────────────────
// Cierre de atributos
// ─────────────────────────────────────────────────────────────

test.describe('cierre de atributos', () => {
  /**
   * A MANO · R(A,B,C,D,E) con A→B, B→C, CD→E
   *   {A}+ = A            (A→B) → AB
   *                       (B→C) → ABC
   *                       CD→E no aplica: falta D
   *   {A}+ = {A,B,C}
   */
  const DFS = [df('A', 'B'), df('B', 'C'), df('C,D', 'E')];

  test('A MANO: {A}+ = {A,B,C} y NO llega a E porque falta D', () => {
    const r = cierre(['A'], DFS).sort();
    expect(r).toEqual(['A', 'B', 'C']);
  });

  test('A MANO: {A,D}+ sí llega a todo, porque CD→E ya se puede aplicar', () => {
    expect(cierre(['A', 'D'], DFS).sort()).toEqual(['A', 'B', 'C', 'D', 'E']);
  });

  test('el cierre de un conjunto siempre se contiene a sí mismo', () => {
    expect(cierre(['E'], DFS)).toEqual(['E']);
  });

  test('las dependencias se aplican en cadena, no en una sola pasada', () => {
    // Orden inverso a propósito: si solo hiciera una pasada, {A}+ se quedaría en {A,B}
    const alReves = [df('C,D', 'E'), df('B', 'C'), df('A', 'B')];
    expect(cierre(['A'], alReves).sort()).toEqual(['A', 'B', 'C']);
  });

  test('el cierre explicado nombra qué dependencia añadió qué', () => {
    const { resultado, pasos } = cierreExplicado(['A'], DFS, ['A', 'B', 'C', 'D', 'E']);
    expect(resultado).toEqual(['A', 'B', 'C']);
    expect(pasos.map((p) => p.anadidos.join(''))).toEqual(['B', 'C']);
    expect(pasos[0].dependencia).toBe('A → B');
  });

  test('no distingue mayúsculas de minúsculas al comparar atributos', () => {
    expect(cierre(['a'], [df('A', 'B')]).length).toBe(2);
  });
});

// ─────────────────────────────────────────────────────────────
// Claves candidatas
// ─────────────────────────────────────────────────────────────

test.describe('claves candidatas', () => {
  /**
   * A MANO · R(A,B,C,D) con AB→C, C→D
   *   A y B no aparecen en ninguna parte derecha → están en TODA clave.
   *   {A,B}+ = ABC (por AB→C) → ABCD (por C→D). Determina todo.
   *   Única clave candidata: {A,B}
   */
  test('A MANO: con AB→C y C→D la única clave es {A,B}', () => {
    const claves = clavesCandidatas(['A', 'B', 'C', 'D'], [df('A,B', 'C'), df('C', 'D')]);
    expect(claves).toHaveLength(1);
    expect(claves[0]).toEqual(['A', 'B']);
  });

  /**
   * A MANO · dos claves candidatas. R(A,B,C) con A→B,C y B→A,C
   *   {A}+ = ABC · {B}+ = ABC · {C}+ = C
   *   Claves: {A} y {B}. Y {A,B} NO es candidata: no es mínima.
   */
  test('A MANO: dos claves candidatas y ninguna que las contenga', () => {
    const claves = clavesCandidatas(['A', 'B', 'C'], [df('A', 'B,C'), df('B', 'A,C')]);
    expect(claves.map((k) => k.join(''))).toEqual(['A', 'B']);
  });

  test('sin dependencias, la clave es el conjunto de TODOS los atributos', () => {
    const claves = clavesCandidatas(['A', 'B', 'C'], []);
    expect(claves).toHaveLength(1);
    expect(claves[0]).toEqual(['A', 'B', 'C']);
  });

  test('las claves salen en el orden en que se declararon los atributos', () => {
    const claves = clavesCandidatas(['Z', 'Y', 'X'], [df('Z,Y', 'X')]);
    expect(claves[0]).toEqual(['Z', 'Y']);
  });
});

// ─────────────────────────────────────────────────────────────
// Formas normales
// ─────────────────────────────────────────────────────────────

test.describe('análisis de formas normales', () => {
  /**
   * A MANO · el ejemplo clásico de dependencia PARCIAL (rompe 2FN).
   *   R(Pedido, Producto, Cantidad, NombreProducto)
   *   Clave: {Pedido, Producto}
   *   Producto → NombreProducto: NombreProducto depende de PARTE de la clave.
   *   → se queda en 1FN.
   */
  test('A MANO: dependencia parcial → 1FN', () => {
    const r = analizar(
      ['Pedido', 'Producto', 'Cantidad', 'NombreProducto'],
      [df('Pedido,Producto', 'Cantidad'), df('Producto', 'NombreProducto')],
    );
    expect(r.ok).toBe(true);
    expect(r.claves).toEqual([['Pedido', 'Producto']]);
    expect(r.formaNormal).toBe('1FN');
    expect(r.violaciones2FN).toHaveLength(1);
    expect(r.violaciones2FN[0].dependencia).toBe('Producto → NombreProducto');
  });

  /**
   * A MANO · el ejemplo clásico de dependencia TRANSITIVA (rompe 3FN, cumple 2FN).
   *   R(Empleado, Departamento, Ciudad)
   *   Empleado → Departamento · Departamento → Ciudad
   *   Clave: {Empleado}. Como es de UN solo atributo no puede haber parcialidad → 2FN sí.
   *   Ciudad depende de Departamento, que no es superclave → rompe 3FN.
   */
  test('A MANO: dependencia transitiva → 2FN pero no 3FN', () => {
    const r = analizar(
      ['Empleado', 'Departamento', 'Ciudad'],
      [df('Empleado', 'Departamento'), df('Departamento', 'Ciudad')],
    );
    expect(r.claves).toEqual([['Empleado']]);
    expect(r.violaciones2FN).toEqual([]);
    expect(r.formaNormal).toBe('2FN');
    expect(r.violaciones3FN).toHaveLength(1);
    expect(r.violaciones3FN[0].dependencia).toBe('Departamento → Ciudad');
  });

  /**
   * A MANO · el caso que separa 3FN de BCNF, que es el que más cuesta en clase.
   *   R(Estudiante, Asignatura, Profesor)
   *   {Estudiante,Asignatura} → Profesor   ·   Profesor → Asignatura
   *   Claves: {Estudiante,Asignatura} y {Estudiante,Profesor}.
   *   TODOS los atributos son primos → no hay ningún no primo que pueda violar 2FN ni 3FN.
   *   Pero Profesor→Asignatura tiene a la izquierda algo que NO es superclave → rompe BCNF.
   */
  test('A MANO: el caso 3FN-pero-no-BCNF, con todos los atributos primos', () => {
    const r = analizar(
      ['Estudiante', 'Asignatura', 'Profesor'],
      [df('Estudiante,Asignatura', 'Profesor'), df('Profesor', 'Asignatura')],
    );
    expect(r.claves.map((k) => k.join(','))).toEqual(['Estudiante,Asignatura', 'Estudiante,Profesor']);
    expect(r.primos).toEqual(['Estudiante', 'Asignatura', 'Profesor']);
    expect(r.violaciones2FN).toEqual([]);
    expect(r.violaciones3FN).toEqual([]);
    expect(r.violacionesBCNF).toHaveLength(1);
    expect(r.formaNormal).toBe('3FN');
  });

  test('A MANO: una relación ya en BCNF no acusa nada', () => {
    const r = analizar(['A', 'B', 'C'], [df('A', 'B,C')]);
    expect(r.formaNormal).toBe('BCNF');
    expect(r.violacionesBCNF).toEqual([]);
    expect(r.explicacion).toContain('BCNF');
  });

  test('sin dependencias, la relación está en BCNF: la clave lo es todo', () => {
    const r = analizar(['A', 'B'], []);
    expect(r.formaNormal).toBe('BCNF');
    expect(r.claves).toEqual([['A', 'B']]);
  });

  test('una dependencia TRIVIAL (A,B → A) no viola nada', () => {
    const r = analizar(['A', 'B'], [df('A,B', 'A')]);
    expect(r.violacionesBCNF).toEqual([]);
    expect(r.formaNormal).toBe('BCNF');
  });

  test('RECHAZO: una dependencia que usa un atributo inexistente se nombra', () => {
    const r = analizar(['A', 'B'], [df('A', 'Z')]);
    expect(r.ok).toBe(false);
    expect(r.error).toContain('Z');
  });

  test('RECHAZO: atributo repetido', () => {
    const r = analizar(['A', 'B', 'a'], []);
    expect(r.ok).toBe(false);
    expect(r.error).toContain('repetido');
  });

  test('RECHAZO: sin atributos no hay nada que analizar', () => {
    expect(analizar([], []).ok).toBe(false);
  });

  test('RECHAZO: por encima del tope de atributos se avisa en vez de colgarse', () => {
    const muchos = Array.from({ length: MAX_ATRIBUTOS + 1 }, (_, i) => `A${i}`);
    const r = analizar(muchos, []);
    expect(r.ok).toBe(false);
    expect(r.error).toContain(String(MAX_ATRIBUTOS));
  });
});

// ─────────────────────────────────────────────────────────────
// Lectura de lo que se escribe a mano
// ─────────────────────────────────────────────────────────────

test.describe('parseo de la entrada', () => {
  test('admite ->, → y --> como flecha', () => {
    const { dependencias } = parsearDependencias('A -> B\nC → D\nE --> F');
    expect(dependencias).toHaveLength(3);
    expect(dependencias[1]).toEqual({ izquierda: ['C'], derecha: ['D'] });
  });

  test('las líneas que no sabe leer se DEVUELVEN, no se tiran en silencio', () => {
    const { dependencias, descartadas } = parsearDependencias('A -> B\nesto no es nada\nC -> D');
    expect(dependencias).toHaveLength(2);
    expect(descartadas).toEqual(['esto no es nada']);
  });

  test('una flecha sin lado también se descarta', () => {
    const { descartadas } = parsearDependencias('-> B\nA ->');
    expect(descartadas).toHaveLength(2);
  });

  test('los espacios sobrantes no estorban', () => {
    const { dependencias } = parsearDependencias('  A , B   ->   C  ');
    expect(dependencias[0]).toEqual({ izquierda: ['A', 'B'], derecha: ['C'] });
  });

  test('los atributos se separan por coma, punto y coma o espacio', () => {
    expect(parsearAtributos('A, B; C  D')).toEqual(['A', 'B', 'C', 'D']);
    expect(parsearAtributos('   ')).toEqual([]);
  });
});
