import { test, expect } from '@playwright/test';
import {
  CASOS,
  TOTAL_CASOS,
  aCentimetros,
  alturaPorSombra,
  angulosDeTriangulo,
  aplicarSemejanza,
  areaHeron,
  comprobarRespuesta,
  cuartoProporcional,
  efectoSobreAreaYPerimetro,
  esTrianguloValido,
  generarEjercicioAleatorio,
  medidaEnPlano,
  medidaReal,
  perimetro,
  resolverCaso,
} from '../../app/simulador-teorema-tales/motor';

/**
 * Simulador del Teorema de Tales y la semejanza — motor (06/09/2026)
 *
 * Igual que su hermana de Pitágoras, esta app corrige lo que teclea el alumno, así que
 * un error de signo o una razón invertida no se ven: la página cargaría igual y daría
 * por buena una respuesta mala. Por eso la matemática vive en `motor.ts` y se prueba
 * aquí, sin navegador.
 *
 * CÓMO SE DERIVA CADA VALOR ESPERADO
 *   Todos los números están calculados a mano desde la definición, nunca copiados de la
 *   app. Las dos comprobaciones que más importan, porque son los errores clásicos:
 *
 *   · Cuarto proporcional — de a/b = a′/b′ se despeja b′ = b · a′ / a.
 *     Con a=2, b=3, a′=4:  b′ = 3 · 4 / 2 = 6.  Invertir la razón daría 1,5, que
 *     «también parece plausible»: por eso se prueba el valor exacto y no solo el orden.
 *
 *   · Efecto de la razón k — los lados y el perímetro se multiplican por k, pero el
 *     área por k². Con k=2 el área NO se duplica: se cuadruplica (factor 4).
 */

test.describe('Teorema de Tales: el cuarto proporcional', () => {
  test('despeja b′ = b · a′ / a, no la razón invertida', () => {
    expect(cuartoProporcional(2, 3, 4)).toBeCloseTo(6, 10);
    expect(cuartoProporcional(3, 6, 5)).toBeCloseTo(10, 10);
    expect(cuartoProporcional(4, 10, 6)).toBeCloseTo(15, 10);
  });

  test('mantiene la proporción: a/b debe ser igual a a′/b′', () => {
    const [a, b, aPrima] = [2.5, 7, 4];
    const bPrima = cuartoProporcional(a, b, aPrima);
    expect(a / b).toBeCloseTo(aPrima / bPrima, 10);
  });

  test('la división por cero da NaN, no Infinity ni una excepción', () => {
    // Convenio del motor: NaN, nunca throw — un throw en el render tumba la app.
    expect(Number.isNaN(cuartoProporcional(0, 3, 4))).toBe(true);
    expect(Number.isNaN(cuartoProporcional(NaN, 3, 4))).toBe(true);
  });

  test('rechaza longitudes negativas', () => {
    expect(Number.isNaN(cuartoProporcional(-2, 3, 4))).toBe(true);
  });
});

test.describe('Semejanza: el error del área', () => {
  test('con k = 2 los lados se duplican pero el área se CUADRUPLICA', () => {
    const e = efectoSobreAreaYPerimetro(2);
    expect(e.factorLados).toBe(2);
    expect(e.factorPerimetro).toBe(2);
    expect(e.factorArea).toBe(4); // k², no k — es el error clásico de temario
  });

  test('con k = 3 el área se multiplica por 9', () => {
    expect(efectoSobreAreaYPerimetro(3).factorArea).toBe(9);
  });

  test('reducir a la mitad divide el área por cuatro', () => {
    expect(efectoSobreAreaYPerimetro(0.5).factorArea).toBeCloseTo(0.25, 10);
  });

  test('una razón nula o negativa no es una semejanza', () => {
    expect(Number.isNaN(efectoSobreAreaYPerimetro(0).factorArea)).toBe(true);
    expect(Number.isNaN(efectoSobreAreaYPerimetro(-1).factorArea)).toBe(true);
  });

  test('aplicarSemejanza multiplica cada lado por k', () => {
    expect(aplicarSemejanza([3, 4, 5], 2)).toEqual([6, 8, 10]);
    expect(perimetro([3, 4, 5])).toBe(12);
    expect(perimetro(aplicarSemejanza([3, 4, 5], 2))).toBe(24); // el perímetro sí va por k
  });

  test('los ángulos NO cambian al aplicar la semejanza', () => {
    // Es la definición misma de semejanza y lo que la separa de una deformación.
    const original = angulosDeTriangulo(3, 4, 5);
    const ampliado = angulosDeTriangulo(6, 8, 10);
    for (let i = 0; i < 3; i++) expect(ampliado[i]).toBeCloseTo(original[i], 8);
  });

  test('el triángulo 3-4-5 tiene ángulos 36,87° / 53,13° / 90°', () => {
    const [a1, a2, a3] = angulosDeTriangulo(3, 4, 5);
    expect(a1).toBeCloseTo(36.87, 1);
    expect(a2).toBeCloseTo(53.13, 1);
    expect(a3).toBeCloseTo(90, 6);
  });

  test('el área de Herón del 3-4-5 es 6', () => {
    // Triángulo rectángulo: base · altura / 2 = 3 · 4 / 2 = 6.
    expect(areaHeron(3, 4, 5)).toBeCloseTo(6, 10);
  });

  test('tres longitudes que no cierran un triángulo se detectan', () => {
    expect(esTrianguloValido(3, 4, 5)).toBe(true);
    expect(esTrianguloValido(1, 2, 10)).toBe(false);
    expect(esTrianguloValido(1, 1, 2)).toBe(false); // degenerado: los tres alineados
  });
});

test.describe('Altura por sombras (el método de Tales)', () => {
  test('una vara de 2 m con 3 m de sombra mide un objeto de 15 m de sombra en 10 m', () => {
    // altura = alturaVara · sombraObjeto / sombraVara = 2 · 15 / 3 = 10
    expect(alturaPorSombra(2, 3, 15)).toBeCloseTo(10, 10);
  });

  test('si la sombra del objeto es igual a la de la vara, las alturas coinciden', () => {
    expect(alturaPorSombra(1.8, 4, 4)).toBeCloseTo(1.8, 10);
  });

  test('duplicar la sombra del objeto duplica la altura calculada', () => {
    expect(alturaPorSombra(2, 3, 30)).toBeCloseTo(alturaPorSombra(2, 3, 15) * 2, 10);
  });

  test('sombra de la vara nula da NaN', () => {
    expect(Number.isNaN(alturaPorSombra(2, 0, 15))).toBe(true);
  });
});

test.describe('Escalas de planos y mapas', () => {
  test('5 cm en un plano 1:200 son 1.000 cm reales', () => {
    expect(medidaReal(5, 200)).toBeCloseTo(1000, 10);
  });

  test('la vuelta deshace la ida', () => {
    expect(medidaEnPlano(medidaReal(7.5, 50), 50)).toBeCloseTo(7.5, 10);
  });

  test('una escala 1:25000 encoge 25.000 veces', () => {
    expect(medidaEnPlano(25000, 25000)).toBeCloseTo(1, 10);
  });

  test('las conversiones de unidad son las del sistema métrico', () => {
    expect(aCentimetros(1, 'm')).toBeCloseTo(100, 10);
    expect(aCentimetros(1, 'km')).toBeCloseTo(100000, 10);
    expect(aCentimetros(1, 'mm')).toBeCloseTo(0.1, 10);
    expect(aCentimetros(1, 'cm')).toBeCloseTo(1, 10);
  });

  test('escala nula o negativa da NaN', () => {
    expect(Number.isNaN(medidaReal(5, 0))).toBe(true);
  });
});

test.describe('Los 12 casos numerados (lo que el profesor asigna)', () => {
  test('hay exactamente 12, numerados del 1 al 12 sin huecos', () => {
    expect(TOTAL_CASOS).toBe(12);
    expect(CASOS.map((c) => c.id)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  });

  test('son DETERMINISTAS: dos lecturas dan el mismo enunciado y la misma solución', () => {
    // Es lo que permite que «resuelve los casos 3, 7 y 11» funcione como tarea de clase.
    const huella = () => CASOS.map((c) => `${c.enunciado}|${c.solucion}`);
    expect(huella()).toEqual(huella());
  });

  test('la solución de cada caso coincide con recalcularla desde sus datos', () => {
    // Comprobación independiente: se vuelve a resolver desde `datos` sin mirar
    // `solucion`. Si alguien edita un enunciado y olvida la solución, salta aquí.
    for (const c of CASOS) {
      const recalculado = resolverCaso(c.datos, c.unidad);
      expect(recalculado.error, `caso ${c.id} devuelve error`).toBeNull();
      expect(recalculado.valor, `caso ${c.id}`).toBeCloseTo(c.solucion, 6);
    }
  });

  test('cada caso tiene enunciado, unidad, solución positiva y desarrollo', () => {
    for (const c of CASOS) {
      expect(c.enunciado.length, `caso ${c.id} sin enunciado`).toBeGreaterThan(20);
      expect(Number.isFinite(c.solucion), `caso ${c.id} sin solución finita`).toBe(true);
      expect(c.solucion, `caso ${c.id} con solución no positiva`).toBeGreaterThan(0);
      expect(c.unidad.length, `caso ${c.id} sin unidad`).toBeGreaterThan(0);
      expect(c.pasos.length, `caso ${c.id} sin pasos`).toBeGreaterThanOrEqual(3);
    }
  });

  test('los cuatro tipos del temario están representados', () => {
    const tipos = new Set(CASOS.map((c) => c.tipo));
    expect(tipos.has('tales')).toBe(true);
    expect(tipos.has('semejanza')).toBe(true);
    expect(tipos.has('sombras')).toBe(true);
    expect(tipos.has('escalas')).toBe(true);
  });

  test('ningún enunciado nombra un país o una ciudad concretos', () => {
    // El 91 % del uso de aula del sitio es latinoamericano: un enunciado anclado a
    // una ciudad española excluiría a la mayor parte del público al que va dirigido.
    const prohibidas = /Madrid|Barcelona|Sevilla|Valencia|España|española/i;
    for (const c of CASOS) {
      expect(prohibidas.test(`${c.titulo} ${c.enunciado}`), `caso ${c.id}`).toBe(false);
    }
  });
});

test.describe('Corrección de la respuesta del alumno', () => {
  test('el acierto exacto y el redondeo razonable se dan por correctos', () => {
    expect(comprobarRespuesta(10, 10).motivo).toBe('correcta');
    expect(comprobarRespuesta(10.05, 10).motivo).toBe('correcta'); // margen = 1 % de 10
  });

  test('un fallo pequeño se marca «cerca», no «incorrecta»', () => {
    // Distinguirlos importa: un redondeo intermedio no es lo mismo que invertir la razón.
    expect(comprobarRespuesta(10.3, 10).motivo).toBe('cerca');
  });

  test('un planteamiento equivocado se marca incorrecta', () => {
    expect(comprobarRespuesta(15, 10).motivo).toBe('incorrecta');
    // La razón invertida del cuarto proporcional (1,5 en vez de 6) debe suspender.
    expect(comprobarRespuesta(1.5, 6).motivo).toBe('incorrecta');
  });

  test('una entrada no numérica se distingue de una respuesta equivocada', () => {
    const v = comprobarRespuesta(NaN, 10);
    expect(v.correcta).toBe(false);
    expect(v.motivo).toBe('sin-numero');
    expect(Number.isNaN(v.desviacion)).toBe(true);
  });
});

test.describe('Modo práctica aleatorio (para rehacerlo)', () => {
  test('con la misma semilla sale el mismo ejercicio', () => {
    const a = generarEjercicioAleatorio(2026);
    const b = generarEjercicioAleatorio(2026);
    expect(b.caso.enunciado).toBe(a.caso.enunciado);
    expect(b.caso.solucion).toBe(a.caso.solucion);
  });

  test('con semillas distintas los enunciados varían', () => {
    const vistos = new Set<string>();
    for (let s = 1; s <= 40; s++) vistos.add(generarEjercicioAleatorio(s).caso.enunciado);
    expect(vistos.size).toBeGreaterThan(8);
  });

  test('100 semillas seguidas dan siempre una solución válida', () => {
    for (let s = 1; s <= 100; s++) {
      const e = generarEjercicioAleatorio(s);
      expect(Number.isFinite(e.caso.solucion), `semilla ${s}`).toBe(true);
      expect(e.caso.solucion, `semilla ${s}`).toBeGreaterThan(0);
      expect(e.caso.pasos.length, `semilla ${s}`).toBeGreaterThanOrEqual(3);
    }
  });

  test('el ejercicio generado usa la MISMA aritmética que los casos fijos', () => {
    // Si aleatorios y fijos divergieran, un alumno podría entrenar con una regla
    // y ser corregido con otra.
    for (let s = 1; s <= 25; s++) {
      const e = generarEjercicioAleatorio(s);
      const recalculado = resolverCaso(e.caso.datos, e.caso.unidad);
      expect(recalculado.valor, `semilla ${s}`).toBeCloseTo(e.caso.solucion, 6);
    }
  });
});
