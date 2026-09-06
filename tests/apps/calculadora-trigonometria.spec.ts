import { test, expect } from '@playwright/test';
import {
  CASOS,
  TOTAL_CASOS,
  anguloDesdeCatetos,
  anguloDesdeOpuestoEHipotenusa,
  catetoAdyacente,
  catetoOpuesto,
  comprobarRespuesta,
  coseno,
  generarEjercicioAleatorio,
  gradosARadianes,
  radianesAGrados,
  resolverCaso,
  seno,
  tangente,
  toleranciaDe,
} from '../../app/calculadora-trigonometria/casos';

/**
 * Calculadora de Trigonometría — modo Casos (06/09/2026)
 *
 * Los 12 casos numerados se añadieron para el canal aula: un profesor manda «resuelve
 * los casos 3, 7 y 11» y la app CORRIGE lo que el alumno teclea. Un error aquí no se
 * ve —la página cargaría igual— pero daría por buena una respuesta mala.
 *
 * EL RIESGO PROPIO DE ESTA APP: `Math.sin` espera RADIANES y los enunciados de
 * secundaria van en GRADOS. Un olvido en la conversión no revienta nada: devuelve
 * números plausibles y equivocados. Por eso lo primero que se comprueba son los
 * ángulos notables, que se saben de memoria:
 *     sen 30° = 0,5 exacto   ·   cos 60° = 0,5   ·   tan 45° = 1   ·   sen 45° = √2/2
 *
 * El resto de valores esperados están calculados a mano con la definición:
 *     caso 5:  20 · cos 55°        = 11,4715 cm
 *     caso 8:  50 · tan 32°        = 31,2435 m   (altura del edificio)
 *     caso 9:  0,9 / sen 6°        =  8,6101 m   (longitud de la rampa)
 *     caso 10:  4 · sen 65°        =  3,6252 m   (altura de la escalera)
 *     caso 11: 40 · tan 58°        = 64,0134 m   (ancho del río)
 *     caso 12: arctan(2,8 / 6)     = 25,0169°    (inclinación del tejado)
 */

test.describe('Conversión de unidades angulares (el fallo silencioso)', () => {
  test('grados y radianes se convierten en los dos sentidos', () => {
    expect(gradosARadianes(180)).toBeCloseTo(Math.PI, 12);
    expect(gradosARadianes(90)).toBeCloseTo(Math.PI / 2, 12);
    expect(radianesAGrados(Math.PI)).toBeCloseTo(180, 12);
    expect(radianesAGrados(gradosARadianes(37))).toBeCloseTo(37, 12);
  });

  test('las razones se calculan en GRADOS, no en radianes', () => {
    // Si alguien pasara los grados directos a Math.sin, sen(30) daría −0,988.
    expect(seno(30)).toBeCloseTo(0.5, 12);
    expect(coseno(60)).toBeCloseTo(0.5, 12);
    expect(tangente(45)).toBeCloseTo(1, 12);
    expect(seno(45)).toBeCloseTo(Math.SQRT2 / 2, 12);
    expect(coseno(0)).toBeCloseTo(1, 12);
    expect(seno(90)).toBeCloseTo(1, 12);
  });

  test('la tangente de 90° no existe y se devuelve como NaN, no como 1,6·10¹⁶', () => {
    // Math.tan(Math.PI/2) da 16331239353195370 por el redondeo del doble: un número
    // enorme pero finito, que se pintaría como si fuera un resultado válido.
    expect(Number.isNaN(tangente(90))).toBe(true);
    expect(Number.isNaN(tangente(270))).toBe(true);
    expect(Number.isFinite(tangente(89))).toBe(true);
  });
});

test.describe('Resolver el triángulo rectángulo', () => {
  test('cateto opuesto = hipotenusa · sen(ángulo)', () => {
    expect(catetoOpuesto(10, 30)).toBeCloseTo(5, 10); // el medio conocido
    expect(catetoOpuesto(4, 65)).toBeCloseTo(3.6252, 4);
  });

  test('cateto adyacente = hipotenusa · cos(ángulo)', () => {
    expect(catetoAdyacente(20, 55)).toBeCloseTo(11.4715, 4);
    expect(catetoAdyacente(10, 60)).toBeCloseTo(5, 10);
  });

  test('el ángulo desde dos catetos es la arcotangente', () => {
    expect(anguloDesdeCatetos(5, 12)).toBeCloseTo(22.6199, 4);
    expect(anguloDesdeCatetos(2.8, 6)).toBeCloseTo(25.0169, 4);
    expect(anguloDesdeCatetos(1, 1)).toBeCloseTo(45, 10); // catetos iguales → 45°
  });

  test('el ángulo desde cateto e hipotenusa es el arcoseno', () => {
    expect(anguloDesdeOpuestoEHipotenusa(8, 17)).toBeCloseTo(28.0725, 4);
    expect(anguloDesdeOpuestoEHipotenusa(5, 10)).toBeCloseTo(30, 10); // sen⁻¹(0,5)
  });

  test('un cateto no puede ser mayor que la hipotenusa: NaN, no un ángulo inventado', () => {
    expect(Number.isNaN(anguloDesdeOpuestoEHipotenusa(20, 10))).toBe(true);
  });

  test('las razones y sus inversas se deshacen entre sí', () => {
    const opuesto = catetoOpuesto(13, 37);
    expect(anguloDesdeOpuestoEHipotenusa(opuesto, 13)).toBeCloseTo(37, 8);
  });
});

test.describe('Rechazos: lo que no debe calcular', () => {
  test('un ángulo no agudo no vale para un triángulo rectángulo', () => {
    const r = resolverCaso('cateto-opuesto', [10, 120]);
    expect(r.ok).toBe(false);
    expect(r.error).toBeTruthy();
  });

  test('longitudes nulas o negativas se rechazan', () => {
    expect(resolverCaso('cateto-opuesto', [0, 30]).ok).toBe(false);
    expect(resolverCaso('cateto-opuesto', [-5, 30]).ok).toBe(false);
  });

  test('el NaN de parseSpanishNumber no revienta el motor', () => {
    const r = resolverCaso('cateto-opuesto', [NaN, 30]);
    expect(r.ok).toBe(false);
    expect(r.pasos).toHaveLength(0);
  });

  test('faltar datos se rechaza en vez de calcular con undefined', () => {
    expect(resolverCaso('cateto-opuesto', []).ok).toBe(false);
  });
});

test.describe('Los 12 casos numerados (lo que el profesor asigna)', () => {
  test('hay exactamente 12, numerados del 1 al 12 sin huecos', () => {
    expect(TOTAL_CASOS).toBe(12);
    expect(CASOS.map((c) => c.id)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  });

  test('son DETERMINISTAS: dos lecturas dan lo mismo', () => {
    // Es lo que permite que «resuelve los casos 3, 7 y 11» funcione como tarea.
    const huella = () => CASOS.map((c) => `${c.enunciado}|${c.respuesta}`);
    expect(huella()).toEqual(huella());
  });

  test('la respuesta declarada coincide con recalcularla desde tipo y datos', () => {
    // Se rehace la cuenta sin mirar `respuesta`: si alguien edita un enunciado y
    // olvida la solución, salta aquí.
    for (const c of CASOS) {
      const s = resolverCaso(c.tipo, c.datos);
      expect(s.ok, `caso ${c.id} devuelve error: ${s.error}`).toBe(true);
      expect(s.valor, `caso ${c.id}`).toBeCloseTo(c.respuesta, 6);
    }
  });

  test('los tres primeros son los notables que se saben de memoria', () => {
    // Sirven de control del alumno y también de la app: si la conversión angular
    // se rompiera, estos tres serían lo primero en delatarlo.
    expect(CASOS[0].respuesta).toBeCloseTo(0.5, 10); // sen 30°
    expect(CASOS[1].respuesta).toBeCloseTo(0.5, 10); // cos 60°
    expect(CASOS[2].respuesta).toBeCloseTo(1, 10); // tan 45°
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

  test('mezcla casos abstractos y aplicados', () => {
    const abstractos = CASOS.filter((c) => c.categoria === 'abstracto').length;
    const aplicados = CASOS.filter((c) => c.categoria === 'aplicado').length;
    expect(abstractos).toBeGreaterThanOrEqual(3);
    expect(aplicados).toBeGreaterThanOrEqual(3);
    expect(abstractos + aplicados).toBe(12);
  });

  test('ningún enunciado nombra un país o una ciudad concretos', () => {
    // España es el 8,6 % de las visitas de aula del sitio.
    const prohibidas = /Madrid|Barcelona|Sevilla|Valencia|España|española|mexicano|argentino/i;
    for (const c of CASOS) {
      expect(prohibidas.test(`${c.titulo} ${c.enunciado}`), `caso ${c.id}`).toBe(false);
    }
  });

  test('los aplicados resuelven las situaciones clásicas del temario', () => {
    // Comprobación independiente de los cuatro que se calculan a mano en la cabecera.
    const porId = new Map(CASOS.map((c) => [c.id, c]));
    expect(porId.get(8)?.respuesta).toBeCloseTo(31.2435, 3); // 50 · tan 32°
    expect(porId.get(9)?.respuesta).toBeCloseTo(8.6101, 3); // 0,9 / sen 6°
    expect(porId.get(10)?.respuesta).toBeCloseTo(3.6252, 3); // 4 · sen 65°
    expect(porId.get(11)?.respuesta).toBeCloseTo(64.0134, 3); // 40 · tan 58°
    expect(porId.get(12)?.respuesta).toBeCloseTo(25.0169, 3); // arctan(2,8/6)
  });
});

test.describe('Corrección de la respuesta del alumno', () => {
  test('la tolerancia es el mayor entre 0,01 y el 1 %', () => {
    expect(toleranciaDe(0.5)).toBeCloseTo(0.01, 10); // 1 % de 0,5 = 0,005 → gana el suelo
    expect(toleranciaDe(100)).toBeCloseTo(1, 10);
  });

  test('acepta el redondeo razonable y rechaza el error real', () => {
    expect(comprobarRespuesta(0.5, 0.5).correcto).toBe(true);
    expect(comprobarRespuesta(31.24, 31.2435).correcto).toBe(true);
    expect(comprobarRespuesta(25, 31.2435).correcto).toBe(false);
  });

  test('el error de trabajar en radianes se detecta como fallo', () => {
    // sen(30) en radianes da −0,988: si un alumno (o la app) lo hiciera mal, suspende.
    expect(comprobarRespuesta(Math.sin(30), 0.5).correcto).toBe(false);
  });

  test('una entrada no numérica se distingue de una respuesta equivocada', () => {
    const v = comprobarRespuesta(NaN, 0.5);
    expect(v.correcto).toBe(false);
    expect(v.motivo).toBe('no-numerico');
  });
});

test.describe('Modo práctica aleatorio', () => {
  test('con la misma semilla sale el mismo ejercicio', () => {
    const a = generarEjercicioAleatorio(321);
    const b = generarEjercicioAleatorio(321);
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
      expect(e.pasos.length, `semilla ${s}`).toBeGreaterThanOrEqual(3);
      const s2 = resolverCaso(e.tipo, e.datos);
      expect(s2.ok, `semilla ${s}: ${s2.error}`).toBe(true);
      expect(s2.valor, `semilla ${s}`).toBeCloseTo(e.respuesta, 6);
    }
  });
});
