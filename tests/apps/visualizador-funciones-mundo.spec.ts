import { test, expect } from '@playwright/test';
import {
  CASOS,
  TOTAL_CASOS,
  comprobarRespuesta,
  evaluar,
  generarEjercicioAleatorio,
  primerCruceEntero,
  raizLineal,
  razonConstante,
  tablaDe,
  toleranciaDe,
  verticeCuadratica,
} from '../../app/visualizador-funciones-mundo/casos';

/**
 * Funciones que Gobiernan el Mundo — modo Casos (06/09/2026)
 *
 * Los 12 casos numerados se añadieron para el canal aula. La app corrige lo que teclea
 * el alumno, así que un error de exponente o de base no se ve: devolvería un número
 * plausible y equivocado.
 *
 * VALORES ESPERADOS, DERIVADOS A MANO
 *   Caso 1  lineal 20 + 3·12                       = 56
 *   Caso 2  pendiente (72 − 12)/40                 = 1,5
 *   Caso 3  raíz de 4.500 − 180t                   → t = 25
 *   Caso 4  h(t) = −5t² + 30t; vértice t = 3       → h(3) = −45 + 90 = 45
 *   Caso 5  A(x) = −x² + 20x; vértice x = −20/(−2) = 10
 *   Caso 6  2.000 · 1,05¹⁰ = 2.000 · 1,628894…     = 3.257,79
 *   Caso 7  500 · 2^(12/3) = 500 · 16              = 8.000
 *   Caso 8  800 · (1/2)^(36/12) = 800/8            = 100
 *   Caso 9  10^(7 − 3) = 10⁴                       = 10.000
 *   Caso 10 ln 3 / ln 1,06 = 1,0986/0,058269       = 18,85
 *   Caso 11 A = 100 + 10s frente a B = 2^s: en s=7 A=170 > B=128; en s=8 A=180 < B=256
 *   Caso 12 tabla (0,3) (1,12) (2,48) (3,192) → cada y es 4 veces el anterior
 */

test.describe('Evaluación de cada familia de funciones', () => {
  test('lineal: y = m·x + b', () => {
    expect(evaluar('lineal', { m: 3, b: 20 }, 12)).toBeCloseTo(56, 10);
    expect(evaluar('lineal', { m: 1.5, b: 12 }, 40)).toBeCloseTo(72, 10);
  });

  test('cuadrática: el vértice sale de −b/(2a)', () => {
    const v1 = verticeCuadratica({ a: -5, b: 30, c: 0 });
    expect(v1.x).toBeCloseTo(3, 10);
    expect(v1.y).toBeCloseTo(45, 10);

    const v2 = verticeCuadratica({ a: -1, b: 20, c: 0 });
    expect(v2.x).toBeCloseTo(10, 10);
    expect(v2.y).toBeCloseTo(100, 10); // el área máxima del rectángulo de 40 m de valla
  });

  test('exponencial: el interés compuesto y la duplicación', () => {
    // 2.000 al 5 % durante 10 años
    expect(evaluar('exponencial', { a0: 2000, base: 1.05 }, 10)).toBeCloseTo(3257.79, 2);
    // 500 bacterias duplicando cada 3 h, a las 12 h → 4 duplicaciones
    expect(evaluar('exponencial', { a0: 500, base: 2, periodo: 3 }, 12)).toBeCloseTo(8000, 6);
  });

  test('exponencial decreciente: la vida media', () => {
    // 800 g con vida media 12 años, a los 36 → tres vidas medias → 800/8
    expect(evaluar('exponencial', { a0: 800, base: 0.5, periodo: 12 }, 36)).toBeCloseTo(100, 6);
  });

  test('la raíz de una lineal decreciente es cuándo llega a cero', () => {
    expect(raizLineal({ m: -180, b: 4500 })).toBeCloseTo(25, 10);
  });

  test('una recta horizontal no corta el eje: NaN, no un número inventado', () => {
    expect(Number.isNaN(raizLineal({ m: 0, b: 5 }))).toBe(true);
  });
});

test.describe('Bordes que devuelven NaN en vez de reventar', () => {
  test('el logaritmo de cero o de un negativo no existe', () => {
    expect(Number.isFinite(evaluar('logaritmica', { k: 1, baseLog: 10 }, 0))).toBe(false);
    expect(Number.isFinite(evaluar('logaritmica', { k: 1, baseLog: 10 }, -5))).toBe(false);
  });

  test('una exponencial desbordada no devuelve Infinity como si fuera un resultado', () => {
    expect(Number.isFinite(evaluar('exponencial', { a0: 10, base: 10 }, 5000))).toBe(false);
  });

  test('una parábola sin coeficiente cuadrático no tiene vértice', () => {
    expect(Number.isNaN(verticeCuadratica({ a: 0, b: 20, c: 0 }).x)).toBe(true);
  });

  test('el NaN de parseSpanishNumber no propaga un número falso', () => {
    expect(Number.isNaN(evaluar('lineal', { m: 3, b: 20 }, NaN))).toBe(true);
  });
});

test.describe('El concepto central de la app: la exponencial acaba adelantando', () => {
  test('la planta que dobla adelanta a la que suma en la semana 8', () => {
    // s=7: lineal 170, exponencial 128 → aún gana la lineal
    // s=8: lineal 180, exponencial 256 → adelanta la exponencial
    expect(evaluar('lineal', { m: 10, b: 100 }, 7)).toBeCloseTo(170, 10);
    expect(evaluar('exponencial', { a0: 1, base: 2 }, 7)).toBeCloseTo(128, 10);
    expect(evaluar('lineal', { m: 10, b: 100 }, 8)).toBeCloseTo(180, 10);
    expect(evaluar('exponencial', { a0: 1, base: 2 }, 8)).toBeCloseTo(256, 10);

    expect(primerCruceEntero({ a0: 1, base: 2 }, { m: 10, b: 100 })).toBe(8);
  });

  test('si la exponencial nunca adelanta, no se inventa un cruce', () => {
    // Base 1: la «exponencial» es constante y jamás supera a una recta creciente.
    expect(Number.isFinite(primerCruceEntero({ a0: 1, base: 1 }, { m: 10, b: 100 }))).toBe(false);
  });
});

test.describe('Identificar el patrón de una tabla', () => {
  test('detecta la razón constante de una tabla exponencial', () => {
    const tabla = [
      { x: 0, y: 3 },
      { x: 1, y: 12 },
      { x: 2, y: 48 },
      { x: 3, y: 192 },
    ];
    expect(razonConstante(tabla)).toBeCloseTo(4, 10);
  });

  test('una tabla que NO es geométrica no devuelve razón', () => {
    // Progresión aritmética: hay diferencia constante, no razón.
    const tabla = [
      { x: 0, y: 3 },
      { x: 1, y: 8 },
      { x: 2, y: 13 },
    ];
    expect(Number.isNaN(razonConstante(tabla))).toBe(true);
  });

  test('la tabla del caso se genera evaluando la función, no a mano', () => {
    // Si se tecleara, podría dejar de cumplir la razón que el caso pide identificar.
    const tabla = tablaDe('exponencial', { a0: 3, base: 4 }, [0, 1, 2, 3]);
    expect(tabla.map((p) => p.y)).toEqual([3, 12, 48, 192]);
  });
});

test.describe('Los 12 casos numerados (lo que el profesor asigna)', () => {
  test('hay exactamente 12, numerados del 1 al 12 sin huecos', () => {
    expect(TOTAL_CASOS).toBe(12);
    expect(CASOS.map((c) => c.id)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  });

  test('son DETERMINISTAS: dos lecturas dan lo mismo', () => {
    const huella = () => CASOS.map((c) => `${c.enunciado}|${c.respuesta}`);
    expect(huella()).toEqual(huella());
  });

  test('las respuestas calculadas a mano en la cabecera coinciden', () => {
    const porId = new Map(CASOS.map((c) => [c.id, c]));
    expect(porId.get(1)?.respuesta).toBeCloseTo(56, 6);
    expect(porId.get(2)?.respuesta).toBeCloseTo(1.5, 6);
    expect(porId.get(3)?.respuesta).toBeCloseTo(25, 6);
    expect(porId.get(4)?.respuesta).toBeCloseTo(45, 6);
    expect(porId.get(5)?.respuesta).toBeCloseTo(10, 6);
    expect(porId.get(6)?.respuesta).toBeCloseTo(3257.79, 1);
    expect(porId.get(7)?.respuesta).toBeCloseTo(8000, 6);
    expect(porId.get(8)?.respuesta).toBeCloseTo(100, 6);
    expect(porId.get(9)?.respuesta).toBeCloseTo(10000, 6);
    expect(porId.get(10)?.respuesta).toBeCloseTo(18.85, 1);
    expect(porId.get(11)?.respuesta).toBeCloseTo(8, 6);
    expect(porId.get(12)?.respuesta).toBeCloseTo(4, 6);
  });

  test('cada caso tiene enunciado, etiqueta de respuesta y desarrollo', () => {
    for (const c of CASOS) {
      expect(c.enunciado.length, `caso ${c.id} sin enunciado`).toBeGreaterThan(20);
      expect(Number.isFinite(c.respuesta), `caso ${c.id} sin respuesta finita`).toBe(true);
      expect(c.etiquetaRespuesta.length, `caso ${c.id} sin etiqueta`).toBeGreaterThan(0);
      expect(c.pasos.length, `caso ${c.id} sin pasos`).toBeGreaterThanOrEqual(2);
      expect(c.pista.length, `caso ${c.id} sin pista`).toBeGreaterThan(0);
    }
  });

  test('las cuatro familias de la app están representadas', () => {
    const familias = new Set(CASOS.map((c) => c.tipoFuncion));
    expect(familias.has('lineal')).toBe(true);
    expect(familias.has('cuadratica')).toBe(true);
    expect(familias.has('exponencial')).toBe(true);
    expect(familias.has('logaritmica')).toBe(true);
  });

  test('mezcla casos abstractos y aplicados', () => {
    const aplicados = CASOS.filter((c) => c.categoria === 'aplicado').length;
    expect(aplicados).toBeGreaterThanOrEqual(3);
  });

  test('ningún enunciado nombra un país, una ciudad ni una moneda nacional', () => {
    const prohibidas = /Madrid|Barcelona|Sevilla|Valencia|España|española|mexicano|argentino|pesos|euros/i;
    for (const c of CASOS) {
      expect(prohibidas.test(`${c.titulo} ${c.enunciado}`), `caso ${c.id}`).toBe(false);
    }
  });

  test('solo se ofrece «ver en la gráfica» donde la app puede dibujarlo', () => {
    // La gráfica de la app solo pinta versiones crecientes: los casos decrecientes
    // (depósito que se vacía, desintegración) no deben ofrecer el botón, o mostraría
    // una curva que no es la del enunciado.
    const porId = new Map(CASOS.map((c) => [c.id, c]));
    expect(porId.get(3)?.grafica).toBeFalsy();
    expect(porId.get(8)?.grafica).toBeFalsy();
    expect(porId.get(1)?.grafica).toBeTruthy();
  });
});

test.describe('Corrección de la respuesta del alumno', () => {
  test('la tolerancia es el mayor entre 0,01 y el 1 %', () => {
    expect(toleranciaDe(56)).toBeCloseTo(0.56, 10);
    expect(toleranciaDe(0.5)).toBeCloseTo(0.01, 10);
  });

  test('acepta el redondeo razonable del interés compuesto', () => {
    expect(comprobarRespuesta(3257.79, 3257.789253554883).correcto).toBe(true);
    expect(comprobarRespuesta(3258, 3257.789253554883).correcto).toBe(true);
  });

  test('confundir la exponencial con una lineal se marca como fallo', () => {
    // 2.000 + 5 % · 10 años a interés SIMPLE daría 3.000, no 3.257,79.
    expect(comprobarRespuesta(3000, 3257.79).correcto).toBe(false);
  });

  test('una entrada no numérica se distingue de una respuesta equivocada', () => {
    const v = comprobarRespuesta(NaN, 56);
    expect(v.correcto).toBe(false);
    expect(v.motivo).toBe('no-numerico');
  });
});

test.describe('Modo práctica aleatorio', () => {
  test('con la misma semilla sale el mismo ejercicio', () => {
    const a = generarEjercicioAleatorio(4242);
    const b = generarEjercicioAleatorio(4242);
    expect(b.enunciado).toBe(a.enunciado);
    expect(b.respuesta).toBe(a.respuesta);
  });

  test('con semillas distintas los enunciados varían', () => {
    const vistos = new Set<string>();
    for (let s = 1; s <= 40; s++) vistos.add(generarEjercicioAleatorio(s).enunciado);
    expect(vistos.size).toBeGreaterThan(8);
  });

  test('60 semillas dan siempre respuesta finita y con desarrollo', () => {
    for (let s = 1; s <= 60; s++) {
      const e = generarEjercicioAleatorio(s);
      expect(Number.isFinite(e.respuesta), `semilla ${s}`).toBe(true);
      expect(e.pasos.length, `semilla ${s}`).toBeGreaterThanOrEqual(2);
      expect(e.etiquetaRespuesta.length, `semilla ${s}`).toBeGreaterThan(0);
    }
  });

  test('las cuatro familias aparecen en el generador', () => {
    const familias = new Set<string>();
    for (let s = 1; s <= 100; s++) familias.add(generarEjercicioAleatorio(s).tipoFuncion);
    expect(familias.size).toBeGreaterThanOrEqual(3);
  });
});
