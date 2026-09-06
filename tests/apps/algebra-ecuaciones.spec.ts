import { test, expect } from '@playwright/test';
import {
  CASOS,
  TOTAL_CASOS,
  analizarPolinomio,
  comprobarRespuesta,
  dividirRuffini,
  fValor,
  frac,
  generarEjercicioAleatorio,
  resolverCaso,
  resolverCuadratica,
  resolverLineal,
  resolverSistema,
  toleranciaDe,
} from '../../app/algebra-ecuaciones/casos';

/**
 * Calculadora de Ecuaciones y Ruffini — modo Casos (06/09/2026)
 *
 * Los 12 casos numerados se añadieron para el canal aula: el profesor manda «resuelve
 * los casos 3, 7 y 11» y la app CORRIGE al alumno. Un error aquí no se ve: la página
 * cargaría igual y daría por buena una solución mala.
 *
 * VALORES ESPERADOS, DERIVADOS A MANO (ninguno copiado de la app)
 *   Caso 1  5x + 12 = 47        → 5x = 35 → x = 7
 *   Caso 2  4(x − 3) = 2x + 10  → 4x − 12 = 2x + 10 → 2x = 22 → x = 11
 *   Caso 3  x/2 + x/4 = 9       → 3x/4 = 9 → x = 12
 *   Caso 4  x² − 5x + 6 = 0     → (x−2)(x−3) → soluciones 2 y 3 → la mayor es 3
 *   Caso 5  x² − 6x + 9 = 0     → (x−3)² → solución doble 3, con Δ = 36 − 36 = 0
 *   Caso 6  x² + 2x + 5 = 0     → Δ = 4 − 20 = −16 (no hay solución real)
 *   Caso 7  ancho x, largo x+3, área 54 → x² + 3x − 54 = 0 → Δ = 9 + 216 = 225,
 *           √225 = 15 → x = (−3 + 15)/2 = 6
 *   Caso 8  3x + 2y = 31 ; 2x + 5y = 28 → det = 15 − 4 = 11
 *           det_x = 31·5 − 28·2 = 155 − 56 = 99 → x = 99/11 = 9
 *   Caso 9  2x + 3y = 7 ; 4x + 6y = 9 → det_x = 7·6 − 9·3 = 42 − 27 = 15
 *   Caso 10 x − 2y = 3 ; 3x − 6y = 9 → det = 1·(−6) − 3·(−2) = 0 (indeterminado)
 *   Caso 11 x³ − 4x² + x + 6, raíces −1, 2, 3 → la menor es −1
 *           comprobación: (−1)³ − 4(−1)² + (−1) + 6 = −1 − 4 − 1 + 6 = 0 ✓
 *   Caso 12 x³ + 3x² + 2x − 60 = 0 con x = 3 → 27 + 27 + 6 − 60 = 0 ✓
 */

test.describe('Ecuaciones lineales', () => {
  test('resuelve la forma directa a·x + b = c', () => {
    // 5x + 12 = 47 se escribe como a=5, b=12, c=0 (sin x a la derecha), d=47
    const r = resolverLineal({ tipo: 'lineal', a: 5, b: 12, c: 0, d: 47 });
    expect(r.ok).toBe(true);
    expect(r.valor).toBeCloseTo(7, 10);
  });

  test('resuelve con incógnita a los dos lados', () => {
    // 4x − 12 = 2x + 10  →  x = 11
    const r = resolverLineal({ tipo: 'lineal', a: 4, b: -12, c: 2, d: 10 });
    expect(r.ok).toBe(true);
    expect(r.valor).toBeCloseTo(11, 10);
  });

  test('una ecuación sin solución no devuelve un número plausible', () => {
    // 2x + 5 = 2x + 9 → 0 = 4, imposible
    const r = resolverLineal({ tipo: 'lineal', a: 2, b: 5, c: 2, d: 9 });
    expect(r.ok).toBe(false);
    expect(r.error).toBeTruthy();
  });

  test('el desarrollo se escribe, no solo el resultado', () => {
    const r = resolverLineal({ tipo: 'lineal', a: 5, b: 12, c: 0, d: 47 });
    expect(r.pasos.length).toBeGreaterThanOrEqual(2);
  });
});

test.describe('Ecuaciones cuadráticas: el discriminante manda', () => {
  test('con Δ > 0 hay dos soluciones y se distingue la mayor de la menor', () => {
    const mayor = resolverCuadratica({ tipo: 'cuadratica', a: 1, b: -5, c: 6, pide: 'mayor' });
    const menor = resolverCuadratica({ tipo: 'cuadratica', a: 1, b: -5, c: 6, pide: 'menor' });
    expect(mayor.valor).toBeCloseTo(3, 10);
    expect(menor.valor).toBeCloseTo(2, 10);
  });

  test('con Δ = 0 la solución es doble', () => {
    const r = resolverCuadratica({ tipo: 'cuadratica', a: 1, b: -6, c: 9, pide: 'doble' });
    expect(r.ok).toBe(true);
    expect(r.valor).toBeCloseTo(3, 10);
  });

  test('con Δ < 0 NO se inventa una raíz real: se devuelve el discriminante', () => {
    // Es el punto del caso 6: la respuesta pedida es Δ, no una x que no existe.
    const disc = resolverCuadratica({ tipo: 'cuadratica', a: 1, b: 2, c: 5, pide: 'discriminante' });
    expect(disc.ok).toBe(true);
    expect(disc.valor).toBeCloseTo(-16, 10);

    const raiz = resolverCuadratica({ tipo: 'cuadratica', a: 1, b: 2, c: 5, pide: 'mayor' });
    expect(raiz.ok).toBe(false);
  });

  test('el problema del terreno da la solución positiva', () => {
    // x² + 3x − 54 = 0 → x = 6 (la otra raíz, −9, no es una anchura)
    const r = resolverCuadratica({ tipo: 'cuadratica', a: 1, b: 3, c: -54, pide: 'mayor' });
    expect(r.valor).toBeCloseTo(6, 10);
  });

  test('con a = 0 no es una cuadrática y se rechaza', () => {
    expect(resolverCuadratica({ tipo: 'cuadratica', a: 0, b: 2, c: 5, pide: 'mayor' }).ok).toBe(false);
  });
});

test.describe('Sistemas 2x2 por Cramer', () => {
  test('compatible determinado: resuelve x e y', () => {
    const datos = { tipo: 'sistema' as const, a1: 3, b1: 2, c1: 31, a2: 2, b2: 5, c2: 28 };
    expect(resolverSistema({ ...datos, pide: 'x' }).valor).toBeCloseTo(9, 10);
    // 3·9 + 2y = 31 → 2y = 4 → y = 2
    expect(resolverSistema({ ...datos, pide: 'y' }).valor).toBeCloseTo(2, 10);
    expect(resolverSistema({ ...datos, pide: 'determinante' }).valor).toBeCloseTo(11, 10);
  });

  test('incompatible: determinante 0, y el det_x distinto de 0', () => {
    // 2x+3y=7 / 4x+6y=9 — rectas paralelas: no hay solución
    const datos = { tipo: 'sistema' as const, a1: 2, b1: 3, c1: 7, a2: 4, b2: 6, c2: 9 };
    expect(resolverSistema({ ...datos, pide: 'determinante' }).valor).toBeCloseTo(0, 10);
    expect(resolverSistema({ ...datos, pide: 'determinanteX' }).valor).toBeCloseTo(15, 10);
    // Y no debe devolver una x inventada
    expect(resolverSistema({ ...datos, pide: 'x' }).ok).toBe(false);
  });

  test('indeterminado: los tres determinantes se anulan', () => {
    // x−2y=3 / 3x−6y=9 — la misma recta escrita dos veces: infinitas soluciones
    const datos = { tipo: 'sistema' as const, a1: 1, b1: -2, c1: 3, a2: 3, b2: -6, c2: 9 };
    expect(resolverSistema({ ...datos, pide: 'determinante' }).valor).toBeCloseTo(0, 10);
    expect(resolverSistema({ ...datos, pide: 'determinanteX' }).valor).toBeCloseTo(0, 10);
    expect(resolverSistema({ ...datos, pide: 'x' }).ok).toBe(false);
  });
});

test.describe('Ruffini y factorización', () => {
  test('encuentra las tres raíces enteras de x³ − 4x² + x + 6', () => {
    const a = analizarPolinomio([1, -4, 1, 6]);
    expect(a.ok).toBe(true);
    const raices = [...a.raicesEnteras].sort((x, y) => x - y);
    expect(raices).toEqual([-1, 2, 3]);
  });

  test('la división por una raíz da resto cero y el cociente correcto', () => {
    // x³ − 4x² + x + 6 entre (x + 1) debe dar x² − 5x + 6 con resto 0.
    // dividirRuffini trabaja en fracciones exactas, no en decimales: por eso `frac`.
    // `resultado` lleva el cociente y, en último lugar, el resto.
    const paso = dividirRuffini([1, -4, 1, 6].map((n) => frac(n)), frac(-1));
    const fila = paso.resultado.map(fValor);
    expect(fila).toEqual([1, -5, 6, 0]); // cociente x² − 5x + 6, resto 0
  });

  test('dividir por algo que NO es raíz deja resto distinto de cero', () => {
    // x = 1 no anula x³ − 4x² + x + 6: 1 − 4 + 1 + 6 = 4
    const paso = dividirRuffini([1, -4, 1, 6].map((n) => frac(n)), frac(1));
    const fila = paso.resultado.map(fValor);
    expect(fila[fila.length - 1]).toBeCloseTo(4, 10);
  });

  test('el volumen de la caja tiene una única raíz entera', () => {
    // x³ + 3x² + 2x − 60 = 0 → x = 3 (27 + 27 + 6 − 60 = 0)
    const a = analizarPolinomio([1, 3, 2, -60]);
    expect(a.raicesEnteras).toContain(3);
    expect(a.raicesEnteras.length).toBe(1);
  });

  test('un polinomio sin raíces racionales no inventa ninguna', () => {
    // x³ − 2 no tiene raíz entera (∛2 es irracional)
    expect(analizarPolinomio([1, 0, 0, -2]).raicesEnteras).toHaveLength(0);
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

  test('la respuesta declarada coincide con recalcularla desde sus datos', () => {
    for (const c of CASOS) {
      const s = resolverCaso(c.datos);
      expect(s.ok, `caso ${c.id} devuelve error: ${s.error}`).toBe(true);
      expect(s.valor, `caso ${c.id}`).toBeCloseTo(c.respuesta, 6);
    }
  });

  test('las respuestas calculadas a mano en la cabecera coinciden', () => {
    const porId = new Map(CASOS.map((c) => [c.id, c]));
    expect(porId.get(1)?.respuesta).toBeCloseTo(7, 10);
    expect(porId.get(2)?.respuesta).toBeCloseTo(11, 10);
    expect(porId.get(3)?.respuesta).toBeCloseTo(12, 10);
    expect(porId.get(4)?.respuesta).toBeCloseTo(3, 10);
    expect(porId.get(5)?.respuesta).toBeCloseTo(3, 10);
    expect(porId.get(6)?.respuesta).toBeCloseTo(-16, 10);
    expect(porId.get(7)?.respuesta).toBeCloseTo(6, 10);
    expect(porId.get(8)?.respuesta).toBeCloseTo(9, 10);
    expect(porId.get(9)?.respuesta).toBeCloseTo(15, 10);
    expect(porId.get(10)?.respuesta).toBeCloseTo(0, 10);
    expect(porId.get(11)?.respuesta).toBeCloseTo(-1, 10);
    expect(porId.get(12)?.respuesta).toBeCloseTo(3, 10);
  });

  test('los casos con respuesta negativa existen y no se han evitado', () => {
    // Δ = −16 y la raíz −1: si el campo no admitiera el signo menos, serían
    // irresolubles. Están a propósito.
    const negativos = CASOS.filter((c) => c.respuesta < 0);
    expect(negativos.length).toBeGreaterThanOrEqual(2);
  });

  test('cada caso tiene enunciado, etiqueta de respuesta y desarrollo', () => {
    for (const c of CASOS) {
      expect(c.enunciado.length, `caso ${c.id} sin enunciado`).toBeGreaterThan(20);
      expect(Number.isFinite(c.respuesta), `caso ${c.id} sin respuesta`).toBe(true);
      expect(c.etiquetaRespuesta.length, `caso ${c.id} sin etiqueta`).toBeGreaterThan(0);
      expect(c.pasos.length, `caso ${c.id} sin pasos`).toBeGreaterThanOrEqual(2);
      expect(c.pista.length, `caso ${c.id} sin pista`).toBeGreaterThan(0);
    }
  });

  test('los cuatro tipos del temario están representados', () => {
    const tipos = new Set(CASOS.map((c) => c.tipo));
    expect(tipos.has('lineal')).toBe(true);
    expect(tipos.has('cuadratica')).toBe(true);
    expect(tipos.has('sistema')).toBe(true);
    expect(tipos.has('polinomio')).toBe(true);
  });

  test('ningún enunciado nombra un país, una ciudad ni una moneda nacional', () => {
    const prohibidas = /Madrid|Barcelona|Sevilla|Valencia|España|española|mexicano|argentino|pesos|euros/i;
    for (const c of CASOS) {
      expect(prohibidas.test(`${c.titulo} ${c.enunciado}`), `caso ${c.id}`).toBe(false);
    }
  });
});

test.describe('Corrección de la respuesta del alumno', () => {
  test('la tolerancia es el mayor entre 0,01 y el 1 %', () => {
    expect(toleranciaDe(7)).toBeCloseTo(0.07, 10);
    expect(toleranciaDe(0.5)).toBeCloseTo(0.01, 10);
  });

  test('acepta el valor exacto y rechaza el error', () => {
    expect(comprobarRespuesta(7, 7).correcto).toBe(true);
    expect(comprobarRespuesta(-16, -16).correcto).toBe(true);
    expect(comprobarRespuesta(16, -16).correcto).toBe(false); // olvidar el signo
  });

  test('dar la solución menor cuando se pide la mayor se marca como fallo', () => {
    expect(comprobarRespuesta(2, 3).correcto).toBe(false);
  });

  test('una entrada no numérica se distingue de una respuesta equivocada', () => {
    const v = comprobarRespuesta(NaN, 7);
    expect(v.correcto).toBe(false);
    expect(v.motivo).toBe('no-numerico');
  });
});

test.describe('Modo práctica aleatorio', () => {
  test('con la misma semilla sale el mismo ejercicio', () => {
    const a = generarEjercicioAleatorio(999);
    const b = generarEjercicioAleatorio(999);
    expect(b.enunciado).toBe(a.enunciado);
    expect(b.respuesta).toBe(a.respuesta);
  });

  test('con semillas distintas los enunciados varían', () => {
    const vistos = new Set<string>();
    for (let s = 1; s <= 40; s++) vistos.add(generarEjercicioAleatorio(s).enunciado);
    expect(vistos.size).toBeGreaterThan(8);
  });

  test('60 semillas dan siempre respuesta finita, recalculable y con desarrollo', () => {
    for (let s = 1; s <= 60; s++) {
      const e = generarEjercicioAleatorio(s);
      expect(Number.isFinite(e.respuesta), `semilla ${s}`).toBe(true);
      expect(e.pasos.length, `semilla ${s}`).toBeGreaterThanOrEqual(2);
      const s2 = resolverCaso(e.datos);
      expect(s2.ok, `semilla ${s}: ${s2.error}`).toBe(true);
      expect(s2.valor, `semilla ${s}`).toBeCloseTo(e.respuesta, 6);
    }
  });
});
