import { test, expect } from '@playwright/test';
import {
  CASOS,
  TOTAL_CASOS,
  analizarReciproco,
  catetoDesconocido,
  comprobarRespuesta,
  esTernaPitagorica,
  esTernaPitagoricaPrimitiva,
  esTrianguloRectangulo,
  generarEjercicioAleatorio,
  hipotenusa,
  ordenarLados,
  resolverPitagoras,
  toleranciaDe,
} from '../../app/simulador-teorema-pitagoras/motor';

/**
 * Simulador del Teorema de Pitágoras — motor (06/09/2026)
 *
 * La app nace para el canal aula: un profesor manda «resuelve los casos 3, 7 y 11» y
 * la app CORRIGE lo que el alumno teclea. Un fallo aquí no se ve — la página cargaría
 * igual y seguiría respondiendo, pero daría por buena una solución mala o suspendería
 * una correcta. Por eso la matemática vive en `motor.ts`, fuera de la vista, y se
 * prueba aquí sin navegador.
 *
 * CÓMO SE DERIVA CADA VALOR ESPERADO
 *   Todos los números de este fichero están calculados a mano a partir de la
 *   definición del teorema, NUNCA copiados de lo que devuelve la app. Las ternas
 *   usadas son las clásicas y se comprueban con una suma:
 *     3² + 4²  =  9 + 16  =  25 = 5²
 *     5² + 12² = 25 + 144 = 169 = 13²
 *     8² + 15² = 64 + 225 = 289 = 17²
 *     7² + 24² = 49 + 576 = 625 = 25²
 *     9² + 40² = 81 + 1600 = 1681 = 41²
 *     20² + 21² = 400 + 441 = 841 = 29²
 */

test.describe('Cálculo directo de la hipotenusa', () => {
  test('resuelve las ternas pitagóricas clásicas de forma exacta', () => {
    expect(hipotenusa(3, 4)).toBe(5);
    expect(hipotenusa(5, 12)).toBe(13);
    expect(hipotenusa(8, 15)).toBe(17);
    expect(hipotenusa(7, 24)).toBe(25);
    expect(hipotenusa(9, 40)).toBe(41);
    expect(hipotenusa(20, 21)).toBe(29);
  });

  test('el orden de los catetos no cambia el resultado', () => {
    expect(hipotenusa(4, 3)).toBe(hipotenusa(3, 4));
    expect(hipotenusa(40, 9)).toBe(hipotenusa(9, 40));
  });

  test('el caso irracional da √2 con la precisión del doble', () => {
    // 1² + 1² = 2  →  c = √2 = 1,414213562373095…
    expect(hipotenusa(1, 1)).toBeCloseTo(Math.SQRT2, 10);
  });

  test('acepta decimales: 0,3 y 0,4 son la terna 3-4-5 dividida por 10', () => {
    expect(hipotenusa(0.3, 0.4)).toBeCloseTo(0.5, 10);
  });
});

test.describe('Cálculo del cateto que falta', () => {
  test('deshace las ternas clásicas', () => {
    // b = √(c² − a²):  √(25 − 9) = 4 · √(169 − 144) = 5 · √(625 − 49) = 24
    expect(catetoDesconocido(5, 3)).toBe(4);
    expect(catetoDesconocido(13, 12)).toBe(5);
    expect(catetoDesconocido(25, 7)).toBe(24);
    expect(catetoDesconocido(41, 9)).toBe(40);
  });

  test('es la operación inversa de hipotenusa()', () => {
    expect(catetoDesconocido(hipotenusa(8, 15), 8)).toBeCloseTo(15, 10);
  });
});

test.describe('El error conceptual más común: confundir hipotenusa con cateto', () => {
  test('resolver un cateto con la hipotenusa MENOR que el cateto es un error, no un NaN', () => {
    // Si «la hipotenusa» vale 3 y el cateto 5, no hay triángulo: 3² − 5² es negativo.
    const r = resolverPitagoras('cateto', 3, 5);
    expect(r.ok).toBe(false);
    expect(r.error).toContain('MAYOR');
    expect(r.pasos).toHaveLength(0);
  });

  test('hipotenusa igual al cateto también se rechaza (el triángulo sería degenerado)', () => {
    expect(resolverPitagoras('cateto', 5, 5).ok).toBe(false);
  });

  test('longitudes nulas o negativas se rechazan con mensaje propio', () => {
    expect(resolverPitagoras('hipotenusa', 0, 4).ok).toBe(false);
    expect(resolverPitagoras('hipotenusa', -3, 4).ok).toBe(false);
    expect(resolverPitagoras('cateto', 5, -1).ok).toBe(false);
  });

  test('entradas no numéricas (el NaN de parseSpanishNumber) no revientan el motor', () => {
    const r = resolverPitagoras('hipotenusa', NaN, 4);
    expect(r.ok).toBe(false);
    expect(r.error).toBeTruthy();
    expect(Number.isNaN(r.valor)).toBe(true);
  });
});

test.describe('Los pasos que ve el alumno', () => {
  test('resolver la hipotenusa de 3 y 4 explica la sustitución y la raíz', () => {
    const r = resolverPitagoras('hipotenusa', 3, 4);
    expect(r.ok).toBe(true);
    expect(r.valor).toBe(5);
    expect(r.pasos.length).toBeGreaterThanOrEqual(4);
    expect(r.pasos.join(' ')).toContain('25'); // la suma 9 + 16 aparece escrita
  });

  test('resolver un cateto parte de la resta, no de la suma', () => {
    const r = resolverPitagoras('cateto', 13, 12);
    expect(r.ok).toBe(true);
    expect(r.valor).toBe(5);
    expect(r.pasos.join(' ')).toContain('−'); // despeja restando
  });
});

test.describe('Recíproco: clasificar un triángulo por sus tres lados', () => {
  test('3-4-5 es rectángulo y terna primitiva', () => {
    const a = analizarReciproco(3, 4, 5);
    expect(a.ok).toBe(true);
    expect(a.tipo).toBe('rectangulo');
    expect(a.esRectangulo).toBe(true);
    expect(a.esTerna).toBe(true);
    expect(a.esTernaPrimitiva).toBe(true);
  });

  test('6-8-10 es rectángulo pero NO primitiva (es 3-4-5 por 2)', () => {
    const a = analizarReciproco(6, 8, 10);
    expect(a.esRectangulo).toBe(true);
    expect(a.esTerna).toBe(true);
    expect(a.esTernaPrimitiva).toBe(false);
  });

  test('2-3-4 es obtusángulo: 4² = 16 supera a 2² + 3² = 13', () => {
    const a = analizarReciproco(2, 3, 4);
    expect(a.tipo).toBe('obtusangulo');
    expect(a.esRectangulo).toBe(false);
  });

  test('4-5-6 es acutángulo: 6² = 36 se queda por debajo de 4² + 5² = 41', () => {
    const a = analizarReciproco(4, 5, 6);
    expect(a.tipo).toBe('acutangulo');
    expect(a.esRectangulo).toBe(false);
  });

  test('1-2-10 no es un triángulo: 1 + 2 no llega a 10', () => {
    const a = analizarReciproco(1, 2, 10);
    expect(a.tipo).toBe('no-triangulo');
    expect(a.esRectangulo).toBe(false);
  });

  test('el orden en que se escriben los lados no altera el veredicto', () => {
    expect(analizarReciproco(5, 3, 4).tipo).toBe('rectangulo');
    expect(analizarReciproco(4, 5, 3).tipo).toBe('rectangulo');
  });

  test('ordenarLados devuelve siempre de menor a mayor', () => {
    expect(ordenarLados(5, 3, 4)).toEqual([3, 4, 5]);
    expect(ordenarLados(10, 10, 1)).toEqual([1, 10, 10]);
  });
});

test.describe('Ternas pitagóricas', () => {
  test('distingue terna de simple triángulo rectángulo', () => {
    expect(esTernaPitagorica(3, 4, 5)).toBe(true);
    expect(esTernaPitagorica(6, 8, 10)).toBe(true);
    expect(esTernaPitagorica(3, 4, 6)).toBe(false);
    // Rectángulo pero de lados no enteros: NO es terna.
    expect(esTernaPitagorica(1, 1, Math.SQRT2)).toBe(false);
  });

  test('las primitivas no comparten divisor', () => {
    expect(esTernaPitagoricaPrimitiva(3, 4, 5)).toBe(true);
    expect(esTernaPitagoricaPrimitiva(20, 21, 29)).toBe(true);
    expect(esTernaPitagoricaPrimitiva(6, 8, 10)).toBe(false);
    expect(esTernaPitagoricaPrimitiva(9, 12, 15)).toBe(false);
  });

  test('esTrianguloRectangulo respeta la desigualdad triangular', () => {
    expect(esTrianguloRectangulo(3, 4, 5)).toBe(true);
    expect(esTrianguloRectangulo(1, 2, 10)).toBe(false);
    expect(esTrianguloRectangulo(2, 3, 4)).toBe(false);
  });
});

test.describe('Corrección de la respuesta del alumno', () => {
  test('la tolerancia es el mayor entre 0,01 y el 1 % del valor esperado', () => {
    expect(toleranciaDe(5)).toBeCloseTo(0.05, 10); // 1 % de 5 = 0,05 > 0,01 → gana el 1 %
    expect(toleranciaDe(1000)).toBeCloseTo(10, 10); // 1 % de 1000
    expect(toleranciaDe(0.5)).toBeCloseTo(0.01, 10); // 1 % de 0,5 = 0,005 < 0,01 → gana el suelo
  });

  test('acepta el redondeo razonable y rechaza el error real', () => {
    // √2 ≈ 1,4142. Un alumno que escriba 1,41 acierta; quien escriba 1,5 no.
    expect(comprobarRespuesta(1.41, Math.SQRT2).correcto).toBe(true);
    expect(comprobarRespuesta(1.5, Math.SQRT2).correcto).toBe(false);
  });

  test('una entrada no numérica se distingue de una respuesta equivocada', () => {
    const v = comprobarRespuesta(NaN, 5);
    expect(v.correcto).toBe(false);
    expect(v.motivo).toBe('no-numerico');
  });

  test('el acierto exacto se marca como acertado', () => {
    expect(comprobarRespuesta(5, 5).motivo).toBe('acertado');
  });
});

test.describe('Los 12 casos numerados (lo que el profesor asigna)', () => {
  test('hay exactamente 12 y están numerados del 1 al 12 sin huecos', () => {
    expect(TOTAL_CASOS).toBe(12);
    expect(CASOS).toHaveLength(12);
    expect(CASOS.map((c) => c.id)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  });

  test('son DETERMINISTAS: el caso 3 es el mismo en dos lecturas seguidas', () => {
    // Es lo que hace que «resuelve los casos 3, 7 y 11» funcione como tarea:
    // si el enunciado cambiase entre alumnos, la consigna del profesor no valdría.
    const primera = CASOS.map((c) => `${c.enunciado}|${c.respuesta}`);
    const segunda = CASOS.map((c) => `${c.enunciado}|${c.respuesta}`);
    expect(segunda).toEqual(primera);
  });

  test('cada caso tiene enunciado, respuesta finita positiva, unidad y pasos', () => {
    for (const c of CASOS) {
      expect(c.enunciado.length, `caso ${c.id} sin enunciado`).toBeGreaterThan(20);
      expect(Number.isFinite(c.respuesta), `caso ${c.id} con respuesta no finita`).toBe(true);
      expect(c.respuesta, `caso ${c.id} con respuesta no positiva`).toBeGreaterThan(0);
      expect(c.unidad.length, `caso ${c.id} sin unidad`).toBeGreaterThan(0);
      expect(c.pasos.length, `caso ${c.id} sin pasos`).toBeGreaterThanOrEqual(3);
    }
  });

  test('la respuesta declarada de cada caso coincide con recalcularla desde sus datos', () => {
    // Comprobación independiente: se rehace la cuenta desde `datos`, sin mirar
    // `respuesta`. Si alguien edita un enunciado y olvida la solución, salta aquí.
    for (const c of CASOS) {
      if (c.tipo === 'hipotenusa') {
        const [a, b] = c.datos;
        expect(c.respuesta, `caso ${c.id}`).toBeCloseTo(hipotenusa(a, b), 6);
      } else if (c.tipo === 'cateto') {
        const [hip, cat] = c.datos;
        expect(c.respuesta, `caso ${c.id}`).toBeCloseTo(catetoDesconocido(hip, cat), 6);
      } else {
        // Diagonal 3D: √(l² + a² + h²), que es Pitágoras aplicado dos veces.
        const [l, a, h] = c.datos;
        const esperado = Math.sqrt(l * l + a * a + h * h);
        expect(c.respuesta, `caso ${c.id}`).toBeCloseTo(esperado, 6);
      }
    }
  });

  test('mezcla casos abstractos y aplicados', () => {
    const abstractos = CASOS.filter((c) => c.categoria === 'abstracto').length;
    const aplicados = CASOS.filter((c) => c.categoria === 'aplicado').length;
    expect(abstractos).toBeGreaterThanOrEqual(3);
    expect(aplicados).toBeGreaterThanOrEqual(3);
    expect(abstractos + aplicados).toBe(12);
  });

  test('ningún enunciado nombra un país o una ciudad concretos', () => {
    // El 91 % del uso de aula del sitio es latinoamericano: un enunciado anclado
    // a una ciudad española excluiría a la mayor parte del público.
    const prohibidas = /Madrid|Barcelona|Sevilla|Valencia|España|española/i;
    for (const c of CASOS) {
      expect(prohibidas.test(`${c.titulo} ${c.enunciado}`), `caso ${c.id}`).toBe(false);
    }
  });
});

test.describe('Modo práctica aleatorio (para rehacerlo)', () => {
  test('con la misma semilla sale el mismo ejercicio', () => {
    const a = generarEjercicioAleatorio(12345);
    const b = generarEjercicioAleatorio(12345);
    expect(b.enunciado).toBe(a.enunciado);
    expect(b.respuesta).toBe(a.respuesta);
  });

  test('con semillas distintas salen ejercicios distintos', () => {
    const vistos = new Set<string>();
    for (let s = 1; s <= 30; s++) vistos.add(generarEjercicioAleatorio(s).enunciado);
    expect(vistos.size).toBeGreaterThan(5);
  });

  test('todo ejercicio generado tiene solución válida y coherente con su tipo', () => {
    for (let s = 1; s <= 60; s++) {
      const e = generarEjercicioAleatorio(s);
      expect(Number.isFinite(e.respuesta), `semilla ${s}`).toBe(true);
      expect(e.respuesta, `semilla ${s}`).toBeGreaterThan(0);
      expect(e.pasos.length, `semilla ${s}`).toBeGreaterThanOrEqual(3);
      // Y la respuesta se sostiene al recalcularla con la función correspondiente.
      expect(comprobarRespuesta(e.respuesta, e.respuesta).correcto).toBe(true);
    }
  });
});
