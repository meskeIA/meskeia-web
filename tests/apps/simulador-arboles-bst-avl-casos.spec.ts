import { test, expect } from '@playwright/test';
import {
  CASOS,
  TOTAL_CASOS,
  resolverCaso,
  recorridosDe,
  toleranciaDe,
  comprobarRespuesta,
  generarEjercicioAleatorio,
  textoRespuesta,
} from '../../app/simulador-arboles-bst-avl/casos';
import { altura, contarNodos, insertarAVLConLog, insertarBST } from '../../app/simulador-arboles-bst-avl/motor';

/**
 * Casos para clase — `simulador-arboles-bst-avl` (tipo A: casos numerados).
 *
 * ⚠️ Este fichero NO sustituye a `tests/apps/simulador-arboles-bst-avl.spec.ts`, que es el acta
 * del Inspector del 25/08/2026 y sigue siendo el contrato de la vista. Vive aparte porque
 * prueba otra cosa: aquel abre el navegador, y este importa el módulo y lo ejecuta sin DOM.
 *
 * ─────────────────────────────────────────────────────────────────────────────────────────
 * DÓNDE VIVE EL CÁLCULO — app/simulador-arboles-bst-avl/motor.ts
 *
 * Hasta hoy la lógica del árbol vivía dentro de `page.tsx`, así que los casos no podían
 * reutilizarla sin copiarla — y una copia habría permitido que la app suspendiese una respuesta
 * que ella misma produce. Se movió al motor (corte y pega, sin reescribir) y ahora `page.tsx` y
 * `casos.ts` importan LA MISMA implementación. Este fichero lo comprueba ejecutando el motor
 * directamente en las dos últimas pruebas.
 *
 * CONVENIOS DE ESTA APP, que son los que pueden hacer fallar un caso bien resuelto:
 *   · altura contada en NODOS: una hoja mide 1 y el árbol vacío 0 (no en aristas).
 *   · factor de balance = altura(izquierda) − altura(derecha).
 *   · un valor DUPLICADO no se inserta (`return nodo`).
 *   · al borrar un nodo con dos hijos se sube el SUCESOR inorden (mínimo del subárbol derecho).
 *   · una rotación DOBLE (LR o RL) cuenta como UNA, porque el motor registra una sola entrada
 *     en su log. El caso 12 lo dice expresamente en el enunciado; si no, sería ambiguo.
 *
 * ─────────────────────────────────────────────────────────────────────────────────────────
 * LAS 12 RESPUESTAS, RESUELTAS A MANO ANTES DE EJECUTAR NADA
 *
 *   1  BST 10,20,30,40,50,60,70 → altura = 7
 *      Cada valor es mayor que el anterior: el árbol degenera en una lista de 7 niveles.
 *   2  AVL, MISMA secuencia → altura = 3
 *      Cuatro RR encadenadas terminan en 40(20(10,30), 60(50,70)): 7 nodos en 3 niveles.
 *      Es la pareja estrella del tema: misma entrada, 7 frente a 3.
 *   3  AVL 5,10,15,20,25,30,35,40 → rotaciones = 4
 *      Se rompe el equilibrio al insertar 15 (RR en 5), 25 (RR en 15), 30 (RR en 10) y
 *      35 (RR en 25). Al insertar 40 los tres factores siguen en {−1,0,+1}.
 *   4  AVL 50,30,70,20,40,60,80 → rotaciones = 0
 *      Se inserta por niveles: la raíz, los dos intermedios y las cuatro puntas.
 *   5  AVL 10,20,30,40,50 → valor de la raíz = 20
 *      La primera RR (en 10, al insertar 30) sube el 20; la segunda (en 30, al insertar 50)
 *      actúa por debajo y no toca la raíz.
 *   6  BST 50,30,70,20,40,60,80,10,45 → hojas = 4
 *      50(30(20(10,·),40(·,45)), 70(60,80)) — sin hijos quedan 10, 45, 60 y 80.
 *   7  BST 72,45,90,33,60,81,95,50 → posición de 72 en inorden = 5
 *      El inorden de un BST sale ordenado: 33,45,50,60,[72],81,90,95.
 *   8  AVL 40,20,60,20,10,30 → 3.er valor del inorden = 30
 *      El segundo 20 se rechaza por duplicado: quedan 5 nodos, inorden 10,20,[30],40,60.
 *   9  AVL 50,30,70,20,40,60,80 y se eliminan 30, 20 y 40 → altura = 3
 *      Al borrar 30 (dos hijos) sube su sucesor inorden, el 40. Tras borrar 20 y 40 queda
 *      fb(50) = −2 con fb(70) = 0, que es rotación simple ⇒ 70(50(·,60), 80).
 *  10  BST 50,30,70,20,40,60,80, se elimina el 50 → raíz = 60
 *      Dos hijos ⇒ sucesor inorden = mínimo del subárbol derecho {60,70,80} = 60.
 *      NO el hijo derecho, que sería 70: es justo el error que este caso persigue.
 *  11  BST 40,20,60,10,30,50,5,3 → factor de balance de la raíz = 2
 *      Rama izquierda 20→10→5→3 mide 4 nodos de alto; la derecha 60→50 mide 2. 4 − 2 = 2.
 *  12  AVL 50,20,60,10,30,25,55 → rotaciones = 2
 *      Las dos son DOBLES: LR en 50 al insertar 25 y RL en 50 al insertar 55.
 */

/** Las doce respuestas derivadas arriba. No están copiadas de lo que devuelve el módulo. */
const A_MANO: Record<number, number> = {
  1: 7,
  2: 3,
  3: 4,
  4: 0,
  5: 20,
  6: 4,
  7: 5,
  8: 30,
  9: 3,
  10: 60,
  11: 2,
  12: 2,
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
    // Y el motor MUTA los nodos que recibe: si un caso compartiera raíz con otro, la segunda
    // resolución daría otro número. Resolver dos veces seguidas lo comprueba.
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
      // La respuesta nunca sale como número suelto: «4» se lee mal sin su unidad.
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
    // ejercicio con todas las semillas y aun así pasa la prueba de reproducibilidad (caso real
    // de `simulador-genetica`, 14/09/2026). Por eso hay que pedir varias semillas a la vez.
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
});

test.describe('casos.ts — los convenios de esta app (invariante 7)', () => {
  test('7a · la altura se cuenta en NODOS: hoja = 1, vacío = 0', () => {
    expect(altura(null)).toBe(0);
    const hoja = insertarBST(null, 10);
    expect(altura(hoja)).toBe(1);
    // Una cadena de 3 en BST mide 3; el mismo contenido balanceado mediría 2.
    let bst = null as Parameters<typeof altura>[0];
    for (const v of [10, 20, 30]) bst = insertarBST(bst, v);
    expect(altura(bst)).toBe(3);
  });

  test('7b · el AVL rebalancea donde el BST degenera (la pareja de casos 1 y 2)', () => {
    const SECUENCIA = [10, 20, 30, 40, 50, 60, 70];
    let bst = null as Parameters<typeof altura>[0];
    for (const v of SECUENCIA) bst = insertarBST(bst, v);
    expect(altura(bst)).toBe(7);

    let avl = null as Parameters<typeof altura>[0];
    const log: string[] = [];
    for (const v of SECUENCIA) avl = insertarAVLConLog(avl, v, log);
    expect(altura(avl)).toBe(3);
    expect(contarNodos(avl)).toBe(7);
    // Cuatro rotaciones, todas RR: es lo que explica el salto de 7 a 3.
    expect(log).toHaveLength(4);
    expect(log.every((l) => l.includes('RR'))).toBe(true);
  });

  test('7c · un valor duplicado NO se inserta', () => {
    const r = recorridosDe({ modo: 'avl', inserciones: [40, 20, 60, 20, 10, 30], pregunta: 'nodos' });
    expect(r.inorden).toEqual([10, 20, 30, 40, 60]);
    expect(r.inorden).toHaveLength(5);
  });

  test('7d · al borrar con dos hijos sube el SUCESOR inorden, no el hijo derecho', () => {
    // El error clásico daría 70. El motor sube el mínimo del subárbol derecho, que es 60.
    const r = resolverCaso({
      modo: 'bst',
      inserciones: [50, 30, 70, 20, 40, 60, 80],
      eliminaciones: [50],
      pregunta: 'valorRaiz',
    });
    expect(r.ok).toBe(true);
    expect(r.valor).toBe(60);
    expect(r.valor).not.toBe(70);
  });

  test('7e · el inorden de un BST sale ordenado', () => {
    const r = recorridosDe({ modo: 'bst', inserciones: [72, 45, 90, 33, 60, 81, 95, 50], pregunta: 'nodos' });
    expect(r.inorden).toEqual([...r.inorden].sort((a, b) => a - b));
    expect(r.inorden).toEqual([33, 45, 50, 60, 72, 81, 90, 95]);
  });

  test('7f · una rotación doble cuenta como UNA', () => {
    // Convenio del log del motor, y el enunciado del caso 12 lo dice para que no sea ambiguo.
    let avl = null as Parameters<typeof altura>[0];
    const log: string[] = [];
    for (const v of [50, 20, 60, 10, 30, 25, 55]) avl = insertarAVLConLog(avl, v, log);
    expect(log).toHaveLength(2);
    expect(log.some((l) => l.includes('LR'))).toBe(true);
    expect(log.some((l) => l.includes('RL'))).toBe(true);
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
    const fallo = comprobarRespuesta(999, CASOS[0].respuesta);
    expect(fallo.correcto).toBe(false);

    const noNumero = comprobarRespuesta(NaN, CASOS[0].respuesta);
    expect(noNumero.correcto).toBe(false);
    expect(noNumero.motivo).not.toContain('NaN');
    expect(noNumero.motivo.trim().length).toBeGreaterThan(0);
  });

  test('resolverCaso nunca lanza, ni con datos imposibles', () => {
    const malos = [
      { modo: 'avl' as const, inserciones: [], pregunta: 'altura' as const },
      { modo: 'bst' as const, inserciones: [10], eliminaciones: [10], pregunta: 'valorRaiz' as const },
      { modo: 'bst' as const, inserciones: [10, 20], pregunta: 'kesimoInorden' as const, k: 99 },
      { modo: 'bst' as const, inserciones: [10, 20], pregunta: 'posicionInorden' as const, valor: 777 },
      { modo: 'avl' as const, inserciones: [Number.NaN, 3], pregunta: 'altura' as const },
    ];
    for (const datos of malos) {
      let r: ReturnType<typeof resolverCaso> | null = null;
      expect(() => {
        r = resolverCaso(datos);
      }).not.toThrow();
      expect((r as unknown as { ok: boolean }).ok, JSON.stringify(datos)).toBe(false);
    }
  });

  test('la respuesta se presenta con su unidad, nunca como número suelto', () => {
    // Un «4» sin unidad se lee mal cuando la app mezcla alturas, rotaciones y valores de nodo
    // (hallazgo 830 de `simulador-genetica`: «Respuesta: 25 de semillas verdes» por un 25 %).
    for (const caso of CASOS) {
      const texto = textoRespuesta(caso.respuesta, caso.etiquetaRespuesta);
      // Lleva el número...
      expect(texto, `caso ${caso.id}`).toContain(String(caso.respuesta));
      // ...y algo más que lo identifica: una unidad («7 nodos», «4 rotaciones») o la etiqueta
      // entera detrás de un guion («20 — valor del nodo raíz»).
      expect(texto.trim().length, `caso ${caso.id}`).toBeGreaterThan(String(caso.respuesta).length + 2);
    }
  });
});
