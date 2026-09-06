import { test, expect } from '@playwright/test';
import {
  CASOS,
  TOTAL_CASOS,
  comprobarRespuesta,
  convergeSerieGeometrica,
  generarEjercicioAleatorio,
  identificarProgresion,
  parsearListaNumeros,
  razonEsUno,
  resolverProgresion,
  sumaAritmetica,
  sumaGeometrica,
  sumaInfinitaGeometrica,
  terminoAritmetico,
  terminoGeometrico,
  terminosAritmeticos,
  terminosGeometricos,
} from '../../app/simulador-progresiones/motor';

/**
 * Simulador de Progresiones — motor (06/09/2026)
 *
 * Tercera app de la serie de matemáticas de secundaria para el canal aula, y como sus
 * hermanas corrige lo que teclea el alumno: un error aquí no se ve, la página cargaría
 * igual y daría por buena una respuesta mala. Por eso la aritmética vive en `motor.ts`.
 *
 * CÓMO SE DERIVA CADA VALOR ESPERADO
 *   Calculado a mano desde la definición, nunca copiado de la app:
 *
 *   Aritmética a₁=3, d=4  →  3, 7, 11, 15, 19…
 *     aₙ = a₁ + (n−1)·d   →  a₅  = 3 + 4·4  = 19  ·  a₅₀ = 3 + 49·4 = 199
 *     Sₙ = n·(a₁ + aₙ)/2  →  S₅  = 5·(3+19)/2 = 55  (y en efecto 3+7+11+15+19 = 55)
 *
 *   Geométrica a₁=2, r=3  →  2, 6, 18, 54, 162…
 *     aₙ = a₁·r^(n−1)     →  a₄ = 2·27 = 54
 *     Sₙ = a₁(rⁿ−1)/(r−1) →  S₄ = 2·(81−1)/2 = 80  (y 2+6+18+54 = 80)
 *
 *   Suma de Gauss: 1..100 con d=1  →  100·(1+100)/2 = 5.050
 */

test.describe('Progresiones aritméticas', () => {
  test('el término general aplica (n−1), no n', () => {
    // El fallo clásico: usar n en vez de n−1 daría 23 en vez de 19 para a₅.
    expect(terminoAritmetico(3, 4, 1)).toBe(3);
    expect(terminoAritmetico(3, 4, 2)).toBe(7);
    expect(terminoAritmetico(3, 4, 5)).toBe(19);
    expect(terminoAritmetico(3, 4, 50)).toBe(199);
  });

  test('admite diferencia negativa (progresión decreciente)', () => {
    expect(terminoAritmetico(20, -3, 5)).toBe(8); // 20 − 12
    expect(terminoAritmetico(20, -3, 8)).toBe(-1); // pasa de largo por el cero
  });

  test('la suma coincide con sumar los términos uno a uno', () => {
    expect(sumaAritmetica(3, 4, 5)).toBe(55);
    const unoAUno = terminosAritmeticos(3, 4, 5).reduce((s, x) => s + x, 0);
    expect(sumaAritmetica(3, 4, 5)).toBeCloseTo(unoAUno, 10);
  });

  test('resuelve la suma de Gauss de 1 a 100', () => {
    expect(sumaAritmetica(1, 1, 100)).toBe(5050);
  });

  test('con d = 0 la progresión es constante y la suma es n·a₁', () => {
    expect(terminoAritmetico(7, 0, 99)).toBe(7);
    expect(sumaAritmetica(7, 0, 10)).toBe(70);
  });
});

test.describe('Progresiones geométricas', () => {
  test('el término general aplica el exponente (n−1)', () => {
    expect(terminoGeometrico(2, 3, 1)).toBe(2);
    expect(terminoGeometrico(2, 3, 4)).toBe(54);
    expect(terminoGeometrico(2, 3, 5)).toBe(162);
  });

  test('la suma coincide con sumar los términos uno a uno', () => {
    expect(sumaGeometrica(2, 3, 4)).toBeCloseTo(80, 10);
    const unoAUno = terminosGeometricos(2, 3, 4).reduce((s, x) => s + x, 0);
    expect(sumaGeometrica(2, 3, 4)).toBeCloseTo(unoAUno, 10);
  });

  test('con r = 1 la fórmula general dividiría por cero: la suma debe ser n·a₁', () => {
    // Es la rama que rompe a₁(rⁿ−1)/(r−1). Si alguien la borra, salta aquí.
    expect(razonEsUno(1)).toBe(true);
    expect(sumaGeometrica(5, 1, 4)).toBeCloseTo(20, 10);
    expect(Number.isFinite(sumaGeometrica(5, 1, 4))).toBe(true);
  });

  test('razonEsUno tolera el ruido del deslizador', () => {
    // Un input range con step 0,1 puede entregar 0,9999999999999999.
    expect(razonEsUno(0.9999999999999999)).toBe(true);
    expect(razonEsUno(0.9)).toBe(false);
    expect(razonEsUno(1.1)).toBe(false);
  });

  test('una razón negativa alterna el signo de los términos', () => {
    expect(terminoGeometrico(1, -2, 1)).toBe(1);
    expect(terminoGeometrico(1, -2, 2)).toBe(-2);
    expect(terminoGeometrico(1, -2, 3)).toBe(4);
    expect(terminoGeometrico(1, -2, 4)).toBe(-8);
  });

  test('con 0 < r < 1 los términos decrecen', () => {
    expect(terminoGeometrico(100, 0.5, 4)).toBeCloseTo(12.5, 10);
  });
});

test.describe('Suma infinita: solo converge si |r| < 1', () => {
  test('converge y vale a₁/(1−r)', () => {
    expect(sumaInfinitaGeometrica(1, 0.5)).toBeCloseTo(2, 10);
    expect(sumaInfinitaGeometrica(3, 0.5)).toBeCloseTo(6, 10);
    expect(sumaInfinitaGeometrica(1, 0.25)).toBeCloseTo(4 / 3, 10);
  });

  test('una razón negativa con |r| < 1 también converge', () => {
    expect(convergeSerieGeometrica(-0.5)).toBe(true);
    expect(sumaInfinitaGeometrica(1, -0.5)).toBeCloseTo(2 / 3, 10);
  });

  test('con |r| ≥ 1 diverge y NO devuelve un número plausible', () => {
    // Sumar infinitos términos crecientes es el error de temario que hay que frenar.
    expect(convergeSerieGeometrica(1)).toBe(false);
    expect(convergeSerieGeometrica(2)).toBe(false);
    expect(convergeSerieGeometrica(-1)).toBe(false);
    expect(Number.isFinite(sumaInfinitaGeometrica(1, 2))).toBe(false);
  });

  test('la suma parcial se acerca a la infinita al crecer n', () => {
    const infinita = sumaInfinitaGeometrica(1, 0.5); // 2
    expect(sumaGeometrica(1, 0.5, 30)).toBeCloseTo(infinita, 6);
    expect(sumaGeometrica(1, 0.5, 5)).toBeLessThan(infinita);
  });
});

test.describe('Identificar una sucesión (el modo más asignable)', () => {
  test('reconoce una aritmética y su diferencia', () => {
    const r = identificarProgresion([3, 7, 11, 15]);
    expect(r.tipo).toBe('aritmetica');
    expect(r.d).toBeCloseTo(4, 10);
  });

  test('reconoce una geométrica y su razón', () => {
    const r = identificarProgresion([2, 6, 18, 54]);
    expect(r.tipo).toBe('geometrica');
    expect(r.r).toBeCloseTo(3, 10);
  });

  test('NO inventa un patrón donde no lo hay: los cuadrados no son progresión', () => {
    expect(identificarProgresion([1, 4, 9, 16, 25]).tipo).toBe('ninguna');
  });

  test('NO inventa un patrón: Fibonacci tampoco lo es', () => {
    expect(identificarProgresion([1, 1, 2, 3, 5, 8]).tipo).toBe('ninguna');
  });

  test('una sucesión constante es aritmética con d = 0', () => {
    const r = identificarProgresion([5, 5, 5, 5]);
    expect(r.tipo).toBe('aritmetica');
    expect(r.d).toBeCloseTo(0, 10);
  });

  test('una sucesión decreciente con diferencia fija sigue siendo aritmética', () => {
    const r = identificarProgresion([20, 17, 14, 11]);
    expect(r.tipo).toBe('aritmetica');
    expect(r.d).toBeCloseTo(-3, 10);
  });

  test('tolera el ruido del punto flotante en los decimales', () => {
    // 0,1 + 0,2 ≠ 0,3 en binario: sin tolerancia esto daría «ninguna».
    const r = identificarProgresion([0.1, 0.2, 0.30000000000000004, 0.4]);
    expect(r.tipo).toBe('aritmetica');
  });

  test('un cero en la sucesión no puede dar razón geométrica', () => {
    const r = identificarProgresion([0, 3, 6, 9]);
    expect(r.tipo).toBe('aritmetica'); // sí es aritmética con d = 3
    expect(r.r).toBeUndefined();
  });

  test('con menos de tres términos no se puede afirmar el patrón', () => {
    expect(identificarProgresion([3, 7]).ok).toBe(false);
  });
});

test.describe('Parseo de la lista que teclea el alumno', () => {
  test('acepta la coma como separador de lista', () => {
    const r = parsearListaNumeros('3, 7, 11, 15');
    expect(r.ok).toBe(true);
    expect(r.numeros).toEqual([3, 7, 11, 15]);
  });

  test('acepta el punto y coma', () => {
    expect(parsearListaNumeros('3; 7; 11').numeros).toEqual([3, 7, 11]);
  });

  test('con decimales en coma española, el separador de lista es el espacio', () => {
    // La trampa: partiendo por comas, «1,5 3 4,5» daría el trozo «5 3 4» → 534.
    const r = parsearListaNumeros('1,5 3 4,5');
    expect(r.ok).toBe(true);
    expect(r.numeros).toEqual([1.5, 3, 4.5]);
  });

  test('un texto no numérico se rechaza con error, no con NaN silencioso', () => {
    const r = parsearListaNumeros('hola, adiós');
    expect(r.ok).toBe(false);
    expect(r.error).toBeTruthy();
  });

  test('la lista vacía se rechaza', () => {
    expect(parsearListaNumeros('   ').ok).toBe(false);
  });
});

test.describe('Los 12 casos numerados (lo que el profesor asigna)', () => {
  test('hay exactamente 12, numerados del 1 al 12 sin huecos', () => {
    expect(TOTAL_CASOS).toBe(12);
    expect(CASOS.map((c) => c.id)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  });

  test('son DETERMINISTAS: dos lecturas dan el mismo enunciado y la misma respuesta', () => {
    const huella = () => CASOS.map((c) => `${c.enunciado}|${c.respuesta}`);
    expect(huella()).toEqual(huella());
  });

  test('la respuesta declarada coincide con recalcularla desde los datos del caso', () => {
    // Se rehace la cuenta desde `calculo`/`a1`/`parametro`/`n` sin mirar `respuesta`.
    // Si alguien edita un enunciado y olvida la solución, salta aquí.
    for (const c of CASOS) {
      if (c.calculo === 'identificar') {
        const ident = identificarProgresion([...c.sucesion]);
        expect(ident.ok, `caso ${c.id} no identificable`).toBe(true);
        const valor = ident.tipo === 'geometrica' ? ident.r : ident.d;
        expect(valor, `caso ${c.id}`).toBeCloseTo(c.respuesta, 6);
      } else {
        const s = resolverProgresion(c.calculo, c.a1, c.parametro, c.n);
        expect(s.ok, `caso ${c.id} devuelve error: ${s.error}`).toBe(true);
        expect(s.valor, `caso ${c.id}`).toBeCloseTo(c.respuesta, 6);
      }
    }
  });

  test('cada caso tiene enunciado, etiqueta de respuesta y desarrollo', () => {
    for (const c of CASOS) {
      expect(c.enunciado.length, `caso ${c.id} sin enunciado`).toBeGreaterThan(20);
      expect(Number.isFinite(c.respuesta), `caso ${c.id} sin respuesta finita`).toBe(true);
      expect(c.etiquetaRespuesta.length, `caso ${c.id} sin etiqueta`).toBeGreaterThan(0);
      expect(c.pasos.length, `caso ${c.id} sin pasos`).toBeGreaterThanOrEqual(3);
      expect(c.pista.length, `caso ${c.id} sin pista`).toBeGreaterThan(0);
    }
  });

  test('los dos tipos de progresión y el modo identificar están representados', () => {
    const calculos = new Set(CASOS.map((c) => c.calculo));
    expect([...calculos].some((c) => String(c).includes('aritmetic'))).toBe(true);
    expect([...calculos].some((c) => String(c).includes('geometric'))).toBe(true);
    expect(calculos.has('identificar')).toBe(true);
  });

  test('mezcla casos abstractos y aplicados', () => {
    const abstractos = CASOS.filter((c) => c.categoria === 'abstracto').length;
    const aplicados = CASOS.filter((c) => c.categoria === 'aplicado').length;
    expect(abstractos).toBeGreaterThanOrEqual(3);
    expect(aplicados).toBeGreaterThanOrEqual(3);
    expect(abstractos + aplicados).toBe(12);
  });

  test('ningún enunciado nombra un país o una ciudad concretos', () => {
    // España es el 8,6 % de las visitas de aula del sitio: un enunciado anclado a
    // Madrid excluiría a la mayor parte del público al que va dirigida la app.
    const prohibidas = /Madrid|Barcelona|Sevilla|Valencia|España|española|mexicano|argentino/i;
    for (const c of CASOS) {
      expect(prohibidas.test(`${c.titulo} ${c.enunciado}`), `caso ${c.id}`).toBe(false);
    }
  });
});

test.describe('Modo práctica aleatorio (para rehacerlo)', () => {
  test('con la misma semilla sale el mismo ejercicio', () => {
    const a = generarEjercicioAleatorio(777);
    const b = generarEjercicioAleatorio(777);
    expect(b.enunciado).toBe(a.enunciado);
    expect(b.respuesta).toBe(a.respuesta);
  });

  test('con semillas distintas los enunciados varían', () => {
    const vistos = new Set<string>();
    for (let s = 1; s <= 40; s++) vistos.add(generarEjercicioAleatorio(s).enunciado);
    expect(vistos.size).toBeGreaterThan(8);
  });

  test('100 semillas dan siempre una respuesta finita y con desarrollo', () => {
    for (let s = 1; s <= 100; s++) {
      const e = generarEjercicioAleatorio(s);
      expect(Number.isFinite(e.respuesta), `semilla ${s}`).toBe(true);
      expect(e.pasos.length, `semilla ${s}`).toBeGreaterThanOrEqual(3);
      expect(e.etiquetaRespuesta.length, `semilla ${s}`).toBeGreaterThan(0);
    }
  });

  test('el ejercicio generado usa la MISMA aritmética que los casos fijos', () => {
    // Si aleatorios y fijos divergieran, el alumno entrenaría con una regla y
    // sería corregido con otra.
    for (let s = 1; s <= 40; s++) {
      const e = generarEjercicioAleatorio(s);
      const s2 = resolverProgresion(e.calculo, e.a1, e.parametro, e.n);
      expect(s2.ok, `semilla ${s}: ${s2.error}`).toBe(true);
      expect(s2.valor, `semilla ${s}`).toBeCloseTo(e.respuesta, 6);
    }
  });
});

test.describe('Corrección de la respuesta del alumno', () => {
  test('acepta el redondeo razonable y rechaza el error real', () => {
    expect(comprobarRespuesta(5050, 5050).correcto).toBe(true);
    expect(comprobarRespuesta(199, 199).correcto).toBe(true);
    // El fallo clásico de usar n en vez de n−1: 23 frente a 19. Debe suspender.
    expect(comprobarRespuesta(23, 19).correcto).toBe(false);
  });

  test('una entrada no numérica se distingue de una respuesta equivocada', () => {
    const v = comprobarRespuesta(NaN, 19);
    expect(v.correcto).toBe(false);
    expect(v.motivo).toBe('no-numerico');
  });
});
