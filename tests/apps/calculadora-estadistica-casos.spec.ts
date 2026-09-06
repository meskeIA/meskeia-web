import { test, expect } from '@playwright/test';
import {
  CASOS,
  TOTAL_CASOS,
  calcularEstadisticas,
  comprobarRespuesta,
  generarEjercicioAleatorio,
  resolverCaso,
  toleranciaDe,
} from '../../app/calculadora-estadistica/casos';

/**
 * Calculadora Estadística — modo Casos (06/09/2026)
 *
 * Los 12 casos numerados se añadieron para el canal aula: el profesor manda «resuelve
 * los casos 3, 7 y 11» y la app CORRIGE al alumno.
 *
 * EL RIESGO PROPIO DE ESTA APP ES EL CONVENIO, no la aritmética. En estadística hay
 * varias definiciones legítimas que dan números distintos:
 *   · desviación típica POBLACIONAL (÷ n) frente a la muestral o cuasidesviación (÷ n−1)
 *   · mediana con n par: promedio de los dos centrales
 *   · cuartiles: método de posición, interpolado, exclusivo… no coinciden entre sí
 * Si los casos usaran un convenio y la calculadora otro, la app suspendería una
 * respuesta que ella misma produce. Por eso `casos.ts` NO reimplementa nada: contiene
 * la función que antes vivía en `page.tsx` y que ahora usan los dos.
 *
 * VALORES ESPERADOS, CALCULADOS A MANO
 *   Caso 7 — σ poblacional de 2, 4, 4, 4, 5, 5, 7, 9 (el ejemplo canónico):
 *     media = 40/8 = 5 · desviaciones −3,−1,−1,−1,0,0,2,4
 *     cuadrados 9+1+1+1+0+0+4+16 = 32 · 32/8 = 4 · √4 = 2
 *   Caso 8 — misma serie, cuasidesviación: √(32/7) = √4,5714… = 2,1381…
 *   Caso 11 — 10,11,12,12,13,14,15,16,59: suma 162 → media 18; mediana (9 datos) = 13
 *     diferencia = 5, que es de lo que trata el caso: el atípico mueve la media y no la mediana
 *   Caso 12 — A: 17,19,20,21,23 → σ = √(20/5) = 2 ·  B: 11,17,20,23,29 → σ = √(180/5) = 6
 */

test.describe('El convenio de la app, fijado para que nadie lo cambie sin querer', () => {
  const SERIE = [2, 4, 4, 4, 5, 5, 7, 9];

  test('la desviación poblacional divide entre n', () => {
    const e = calcularEstadisticas(SERIE);
    expect(e).not.toBeNull();
    expect(e!.media).toBeCloseTo(5, 10);
    expect(e!.desviacionPoblacional).toBeCloseTo(2, 10); // √(32/8)
    expect(e!.varianzaPoblacional).toBeCloseTo(4, 10);
  });

  test('la cuasidesviación divide entre n−1 y NO es la misma', () => {
    const e = calcularEstadisticas(SERIE)!;
    expect(e.desviacionMuestral).toBeCloseTo(2.13809, 4); // √(32/7)
    expect(e.desviacionMuestral).toBeGreaterThan(e.desviacionPoblacional);
  });

  test('la mediana con n impar es el valor central', () => {
    expect(calcularEstadisticas([9, 11, 12, 14, 15, 18, 20])!.mediana).toBeCloseTo(14, 10);
  });

  test('la mediana con n par es el promedio de los dos centrales', () => {
    // 8, 10, 13, 16, 19, 21 → (13 + 16)/2 = 14,5
    expect(calcularEstadisticas([13, 8, 21, 16, 10, 19])!.mediana).toBeCloseTo(14.5, 10);
  });

  test('los datos no hace falta darlos ordenados', () => {
    const desordenada = calcularEstadisticas([20, 15, 18, 11, 14, 9, 12])!;
    const ordenada = calcularEstadisticas([9, 11, 12, 14, 15, 18, 20])!;
    expect(desordenada.mediana).toBeCloseTo(ordenada.mediana, 10);
    expect(desordenada.desviacionPoblacional).toBeCloseTo(ordenada.desviacionPoblacional, 10);
  });

  test('una serie vacía devuelve null en vez de NaN por todas partes', () => {
    expect(calcularEstadisticas([])).toBeNull();
  });
});

test.describe('Los cuartiles de los casos no dependen del método elegido', () => {
  // El método de la app (posición sin interpolar) no coincide en general con el
  // interpolado de las hojas de cálculo. Los datos de los casos 9 y 10 están
  // elegidos para que los tres métodos coincidan: así un alumno no puede acertar
  // el método y fallar el caso. Esta prueba lo fija.
  const interpolado = (datos: number[], p: number) => {
    const v = [...datos].sort((a, b) => a - b);
    const pos = (v.length - 1) * p;
    const bajo = Math.floor(pos);
    const alto = Math.ceil(pos);
    return v[bajo] + (v[alto] - v[bajo]) * (pos - bajo);
  };

  test('Q1 del caso 9 vale 7 por el método de la app y por el interpolado', () => {
    const datos = [4, 6, 7, 7, 8, 9, 10, 12, 12, 14, 15];
    expect(calcularEstadisticas(datos)!.q1).toBeCloseTo(7, 10);
    expect(interpolado(datos, 0.25)).toBeCloseTo(7, 10);
  });

  test('Q3 del caso 10 vale 34 por los dos métodos', () => {
    const datos = [26, 30, 22, 34, 25, 38, 28, 31, 34, 20, 40];
    expect(calcularEstadisticas(datos)!.q3).toBeCloseTo(34, 10);
    expect(interpolado(datos, 0.75)).toBeCloseTo(34, 10);
  });

  test('el modo aleatorio NO genera cuartiles, porque ahí no se puede garantizar', () => {
    for (let s = 1; s <= 60; s++) {
      const e = generarEjercicioAleatorio(s);
      expect(['q1', 'q3', 'iqr'], `semilla ${s} pide un cuartil`).not.toContain(e.medida);
    }
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

  test('la respuesta declarada coincide con recalcularla desde medida y datos', () => {
    for (const c of CASOS) {
      const valor = resolverCaso(c.medida, c.datos);
      expect(Number.isFinite(valor), `caso ${c.id} no recalculable`).toBe(true);
      expect(valor, `caso ${c.id}`).toBeCloseTo(c.respuesta, 6);
    }
  });

  test('las respuestas calculadas a mano en la cabecera coinciden', () => {
    const porId = new Map(CASOS.map((c) => [c.id, c]));
    expect(porId.get(1)?.respuesta).toBeCloseTo(7, 10); // media 35/5
    expect(porId.get(2)?.respuesta).toBeCloseTo(14, 10); // mediana n impar
    expect(porId.get(3)?.respuesta).toBeCloseTo(14.5, 10); // mediana n par
    expect(porId.get(6)?.respuesta).toBeCloseTo(8, 10); // rango 23 − 15
    expect(porId.get(7)?.respuesta).toBeCloseTo(2, 10); // σ poblacional
    expect(porId.get(8)?.respuesta).toBeCloseTo(2.13809, 4); // s muestral
    expect(porId.get(11)?.respuesta).toBeCloseTo(5, 10); // media 18 − mediana 13
    expect(porId.get(12)?.respuesta).toBeCloseTo(6, 10); // σ del conjunto disperso
  });

  test('los casos 7 y 8 usan la MISMA serie y dan números distintos', () => {
    // Es el sentido pedagógico del par: ÷n frente a ÷(n−1) sobre los mismos datos.
    const porId = new Map(CASOS.map((c) => [c.id, c]));
    expect(porId.get(7)!.datos).toEqual(porId.get(8)!.datos);
    expect(porId.get(7)!.respuesta).not.toBeCloseTo(porId.get(8)!.respuesta, 3);
  });

  test('el caso bimodal pide algo inequívoco', () => {
    // 7,9,7,12,9,15,7,9,11 tiene DOS modas (7 y 9, tres veces cada una): preguntar
    // «la moda» a secas no tendría respuesta única, y por eso pide la menor.
    const caso5 = CASOS.find((c) => c.id === 5)!;
    const e = calcularEstadisticas(caso5.datos as number[])!;
    expect(e.modas.length).toBe(2);
    expect(caso5.respuesta).toBeCloseTo(Math.min(...e.modas), 10);
  });

  test('cada caso tiene enunciado, datos, etiqueta y desarrollo', () => {
    for (const c of CASOS) {
      expect(c.enunciado.length, `caso ${c.id} sin enunciado`).toBeGreaterThan(20);
      expect(c.datos.length, `caso ${c.id} sin datos`).toBeGreaterThan(2);
      expect(Number.isFinite(c.respuesta), `caso ${c.id} sin respuesta`).toBe(true);
      expect(c.etiquetaRespuesta.length, `caso ${c.id} sin etiqueta`).toBeGreaterThan(0);
      expect(c.pasos.length, `caso ${c.id} sin pasos`).toBeGreaterThanOrEqual(2);
    }
  });

  test('todos los datos son enteros, para que la coma no se lea de dos maneras', () => {
    // El botón «cargar en la calculadora» escribe la serie en el textarea. Con
    // decimales en coma española, «1,5 3» podría leerse como uno o como dos números.
    for (const c of CASOS) {
      for (const d of c.datos) {
        expect(Number.isInteger(d), `caso ${c.id} tiene el decimal ${d}`).toBe(true);
      }
    }
  });

  test('ningún enunciado nombra un país o una ciudad concretos', () => {
    const prohibidas = /Madrid|Barcelona|Sevilla|Valencia|España|española|mexicano|argentino/i;
    for (const c of CASOS) {
      expect(prohibidas.test(`${c.titulo} ${c.enunciado}`), `caso ${c.id}`).toBe(false);
    }
  });
});

test.describe('Corrección de la respuesta del alumno', () => {
  test('la tolerancia es el mayor entre 0,01 y el 1 %', () => {
    expect(toleranciaDe(2)).toBeCloseTo(0.02, 10);
    expect(toleranciaDe(0.5)).toBeCloseTo(0.01, 10);
  });

  test('confundir σ con s se marca como fallo', () => {
    // 2 frente a 2,138: la diferencia supera el 1 % y debe suspender, que es
    // justo lo que el par de casos 7 y 8 quiere enseñar.
    expect(comprobarRespuesta(2.138, 2).correcto).toBe(false);
    expect(comprobarRespuesta(2, 2.13809).correcto).toBe(false);
  });

  test('acepta el redondeo a dos decimales cuando el caso lo pide', () => {
    expect(comprobarRespuesta(2.14, 2.13809).correcto).toBe(true);
  });

  test('una entrada no numérica se distingue de una respuesta equivocada', () => {
    const v = comprobarRespuesta(NaN, 7);
    expect(v.correcto).toBe(false);
    expect(v.motivo).toBe('no-numerico');
  });
});

test.describe('Modo práctica aleatorio', () => {
  test('con la misma semilla sale el mismo ejercicio', () => {
    const a = generarEjercicioAleatorio(555);
    const b = generarEjercicioAleatorio(555);
    expect(b.enunciado).toBe(a.enunciado);
    expect(b.respuesta).toBe(a.respuesta);
  });

  test('con semillas distintas los enunciados varían', () => {
    const vistos = new Set<string>();
    for (let s = 1; s <= 40; s++) vistos.add(generarEjercicioAleatorio(s).enunciado);
    expect(vistos.size).toBeGreaterThan(8);
  });

  test('60 semillas dan siempre respuesta finita y recalculable con la misma función', () => {
    for (let s = 1; s <= 60; s++) {
      const e = generarEjercicioAleatorio(s);
      expect(Number.isFinite(e.respuesta), `semilla ${s}`).toBe(true);
      expect(e.pasos.length, `semilla ${s}`).toBeGreaterThanOrEqual(2);
      expect(resolverCaso(e.medida, e.datos), `semilla ${s}`).toBeCloseTo(e.respuesta, 6);
    }
  });
});
