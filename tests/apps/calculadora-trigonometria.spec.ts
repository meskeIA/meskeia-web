import { test, expect } from '@playwright/test';
import type { Locator, Page } from '@playwright/test';
import {
  esperarHidratacion,
  esperarPaginaAsentada,
  esperarValorEnReact,
} from './_hidratacion';
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
  conUnidad,
} from '../../app/calculadora-trigonometria/casos';
import {
  anguloDesde,
  fraccionDePi,
  identidades,
  leerAngulo,
  razones,
  resolverTriangulo,
  textoRadianesDeNotable,
  ubicacion,
  type Angulo,
  type DatosTriangulo,
} from '../../app/calculadora-trigonometria/motor';

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

/* ══════════════════════════════════════════════════════════════════════════════════════════
 * motor.ts — Ronda 15 de reparación (25/09/2026). Las cuatro calculadoras de la vista ya no
 * hacen cuentas en page.tsx: salen de aquí. Esperados resueltos a mano ANTES de ejecutar:
 *   · Cuadrantales: sen 90° = 1, cos 90° = 0 EXACTOS; tan y sec de 90° y 270° no existen
 *     (cos = 0); csc y cot de 0°, 180° y 360° no existen (sen = 0); cot 90° = 0/1 = 0.
 *   · π/2 tecleado en radianes = 90° exactos; 3π/2 = 270°; 1,5708 rad NO es π/2.
 *   · Cuadrante: 3 rad = 171,89° → II · 4 rad = 229,18° → III · 5,5 rad = 315,13° → IV ·
 *     los ejes (0°, 90°, 180°, 270°, 360°) → ninguno.
 *   · Triángulo: c = 10, α = 30° → a = 10·sen 30° = 5, b = 10·cos 30° = 8,660254 ·
 *     b = 4, c = 5 → a = √(25 − 16) = 3, A = arccos(4/5) = 36,869898° ·
 *     b = 4, α = 30° → a = 4·tan 30° = 2,309401, c = 4/cos 30° = 4,618802 ·
 *     a = 1, b = 2, c = 10 → √5 = 2,2361 ≠ 10: incompatible.
 * ══════════════════════════════════════════════════════════════════════════════════════════ */

const grados = (g: number): Angulo => anguloDesde(g, 'grados');
const leido = (texto: string, unidad: 'grados' | 'radianes'): Angulo => {
  const l = leerAngulo(texto, unidad);
  if (l.estado !== 'ok') throw new Error(`«${texto}» no se leyó: ${l.estado}`);
  return l.angulo;
};

test.describe('motor.ts — ángulos cuadrantales y lectura de π', () => {
  test('las razones de los cuadrantales son exactas o no definidas', () => {
    const r90 = razones(grados(90));
    expect([r90.seno, r90.coseno, r90.tangente, r90.secante, r90.cosecante, r90.cotangente])
      .toEqual([1, 0, null, null, 1, 0]);
    const r180 = razones(grados(180));
    expect([r180.seno, r180.coseno, r180.tangente, r180.secante, r180.cosecante, r180.cotangente])
      .toEqual([0, -1, 0, -1, null, null]);
    const r270 = razones(grados(270));
    expect([r270.seno, r270.coseno, r270.tangente, r270.secante]).toEqual([-1, 0, null, null]);
    const r360 = razones(grados(360));
    expect([r360.seno, r360.coseno, r360.cosecante, r360.cotangente]).toEqual([0, 1, null, null]);
    expect(razones(grados(-90)).seno).toBe(-1);
    expect(Object.is(razones(grados(180)).tangente, -0)).toBe(false); // sin «-0,00000000»
  });

  test('fuera de los ejes sigue siendo Math.sin / Math.cos', () => {
    const r = razones(grados(30));
    expect(r.seno).toBeCloseTo(0.5, 12);
    expect(r.tangente).toBeCloseTo(Math.sqrt(3) / 3, 12);
    expect(razones(anguloDesde(3, 'radianes')).seno).toBeCloseTo(Math.sin(3), 14);
  });

  test('en radianes se leen múltiplos de π, y exactos', () => {
    expect(leido('π/2', 'radianes').grados).toBe(90);
    expect(leido('3π/2', 'radianes').grados).toBe(270);
    expect(leido('-π', 'radianes').grados).toBe(-180);
    expect(leido('2pi', 'radianes').grados).toBe(360);
    expect(leido('0,5π', 'radianes').grados).toBe(90);
    expect(leido('π / 4', 'radianes').grados).toBe(45);
    expect(razones(leido('π/2', 'radianes')).tangente).toBeNull();
    expect(leerAngulo('π/0', 'radianes').estado).toBe('invalido');
    expect(leerAngulo('π', 'grados').estado).toBe('invalido'); // «π°» no es un ángulo en grados
    expect(leerAngulo('  ', 'grados').estado).toBe('vacio');
    // 1,5708 rad NO es π/2: su tangente existe y es negativa (está pasado el eje).
    expect(razones(leido('1,5708', 'radianes')).tangente).toBeLessThan(-272000);
  });

  test('los botones notables en radianes escriben el múltiplo exacto de π', () => {
    expect([0, 30, 45, 60, 90, 180, 270, 360].map(textoRadianesDeNotable)).toEqual([
      '0', 'π/6', 'π/4', 'π/3', 'π/2', 'π', '3π/2', '2π',
    ]);
  });

  test('cuadrante calculado en grados; los ejes no están en ninguno', () => {
    expect(ubicacion(anguloDesde(3, 'radianes')).rotulo).toBe('II');
    expect(ubicacion(anguloDesde(4, 'radianes')).rotulo).toBe('III');
    expect(ubicacion(anguloDesde(5.5, 'radianes')).rotulo).toBe('IV');
    expect(ubicacion(grados(-30)).rotulo).toBe('IV');
    expect(ubicacion(grados(135)).rotulo).toBe('II');
    for (const g of [0, 90, 180, 270, 360, -90, 720]) {
      expect(ubicacion(grados(g)).cuadrante, `${g}°`).toBeNull();
    }
    expect(ubicacion(grados(90)).detalle).toContain('semieje Y positivo');
  });

  test('fracción de π sin «1π» ni «0,0000π»', () => {
    const f = (q: number): string => fraccionDePi(q, (x) => String(Math.round(x * 1e4) / 1e4));
    expect(f(1)).toBe('π');
    expect(f(0.5)).toBe('π/2');
    expect(f(-1)).toBe('-π');
    expect(f(0)).toBe('0');
    expect(f(0.75)).toBe('3π/4');
    expect(f(2)).toBe('2π');
    expect(f(1.5708 / Math.PI)).toBe('≈ π/2');
    expect(f(1 / Math.PI)).toBe('0.3183π');
  });

  test('identidades: cos(30° + 60°) es 0 exacto y cos(A − B) se calcula', () => {
    const v = identidades(grados(30), grados(60));
    expect(v.suma?.cosSuma).toBe(0);
    expect(v.suma?.sinSuma).toBe(1);
    expect(v.suma?.cosResta).toBeCloseTo(Math.sqrt(3) / 2, 12);
    expect(v.suma?.sinResta).toBeCloseTo(-0.5, 12);
    expect(identidades(grados(30), null).suma).toBeNull();
  });
});

test.describe('motor.ts — triángulo rectángulo con cualquier pareja de datos', () => {
  const vacio: DatosTriangulo = { a: null, b: null, c: null, alfa: null };
  const ok = (datos: Partial<DatosTriangulo>) => {
    const r = resolverTriangulo({ ...vacio, ...datos });
    if (r.estado !== 'ok') throw new Error(`esperaba triángulo: ${JSON.stringify(r)}`);
    return r;
  };

  test('las seis parejas resuelven', () => {
    expect(ok({ a: 3, b: 4 }).triangulo.c).toBeCloseTo(5, 12);
    expect(ok({ a: 3, c: 5 }).triangulo.b).toBeCloseTo(4, 12);
    const bc = ok({ b: 4, c: 5 }).triangulo;
    expect(bc.a).toBeCloseTo(3, 12);
    expect(bc.anguloA).toBeCloseTo(36.869898, 5);
    expect(ok({ a: 5, alfa: 30 }).triangulo.c).toBeCloseTo(10, 12);
    const balfa = ok({ b: 4, alfa: 30 }).triangulo;
    expect(balfa.a).toBeCloseTo(2.309401, 6);
    expect(balfa.c).toBeCloseTo(4.618802, 6);
    const calfa = ok({ c: 10, alfa: 30 }).triangulo;
    expect(calfa.a).toBeCloseTo(5, 12);
    expect(calfa.b).toBeCloseTo(8.660254, 6);
    expect(calfa.anguloB).toBeCloseTo(60, 12);
  });

  test('un dato imposible se explica, no se trata como un dato que falta', () => {
    const r = resolverTriangulo({ ...vacio, a: 5, c: 3 });
    expect(r.estado).toBe('error');
    expect(r.estado === 'error' ? r.mensaje : '').toContain('MAYOR');
    expect(resolverTriangulo({ ...vacio, a: 3, alfa: 0 }).estado).toBe('error');
    expect(resolverTriangulo({ ...vacio, a: 3, alfa: 90 }).estado).toBe('error');
    expect(resolverTriangulo({ ...vacio, a: -3, b: 4 }).estado).toBe('error');
    expect(resolverTriangulo({ ...vacio, a: NaN, b: 4 }).estado).toBe('error');
    expect(resolverTriangulo({ ...vacio, a: 3 }).estado).toBe('faltan');
  });

  test('datos de más: incompatibles se avisan, compatibles se aceptan con nota', () => {
    const r = resolverTriangulo({ a: 1, b: 2, c: 10, alfa: null });
    expect(r.estado === 'error' ? r.mensaje : '').toContain('la hipotenusa c sería 2,2361, no 10');
    const r2 = resolverTriangulo({ a: 3, b: 4, c: null, alfa: 60 });
    expect(r2.estado === 'error' ? r2.mensaje : '').toContain('el ángulo α sería 36,8699°, no 60°');
    expect(ok({ a: 3, b: 4, c: 5 }).nota).toContain('datos de más');
    // Tecleado con redondeo (√5 = 2,2361 → 2,24): dentro del 0,5 %, se acepta.
    expect(ok({ a: 1, b: 2, c: 2.24 }).triangulo.c).toBeCloseTo(Math.sqrt(5), 12);
  });
});

test.describe('casos.ts — grafía de la unidad', () => {
  test('el símbolo de grado va pegado; las demás unidades, con espacio', () => {
    expect(conUnidad('28,0725', '°')).toBe('28,0725°');
    expect(conUnidad('8,6101', 'm')).toBe('8,6101 m');
    expect(conUnidad('0,5', 'sin unidad')).toBe('0,5');
  });
});

/* ══════════════════════════════════════════════════════════════════════════════════════════
 * Inspección del 25/09/2026 (Opus 5.5) — PRIMERA inspección, contra el build de producción
 * local (puerto 3050). Los tests de arriba prueban `casos.ts` sin navegador; los de aquí
 * prueban lo que la PÁGINA publica, que es otra cosa: las cuatro calculadoras de la vista
 * (Funciones, Triángulo, Conversiones, Identidades) hacen sus propias cuentas en page.tsx y
 * NO usan las funciones protegidas de casos.ts (salvo la conversión grados ⇄ radianes).
 *
 * QUÉ PROMETE
 *   <h1> «Calculadora de Trigonometría»; subtítulo «Funciones trigonométricas, resolución de
 *   triángulos, conversiones e identidades». La metadata añade «Resultados con 8 decimales»,
 *   los ángulos notables 0°…360° como acceso directo, y —solo en el JSON-LD— funciones
 *   inversas y el teorema del seno y del coseno (ver el hallazgo de la promesa, al final).
 *
 * LOS CASOS, RESUELTOS A MANO ANTES DE ABRIR EL NAVEGADOR
 *
 *   NORMAL — θ = 30°: sen = 1/2 = 0,5 · cos = √3/2 = 0,866025404 · tan = √3/3 = 0,577350269
 *     csc = 2 · sec = 2/√3 = 1,154700538 · cot = √3 = 1,732050808 · π/6 = 0,523598776 rad
 *     A 8 decimales: 0,50000000 · 0,86602540 · 0,57735027 · 2,00000000 · 1,15470054 ·
 *     1,73205081 · y 0,523599 a 6. Cuadrante I. θ = −30° → cuadrante IV.
 *   NORMAL — triángulo rectángulo de catetos 3 y 4: c = √(9 + 16) = 5 · A = arctan(3/4) =
 *     36,8699° · B = 90 − 36,8699 = 53,1301° (A + B + 90 = 180) · área 3·4/2 = 6 · perímetro 12.
 *   NORMAL — 3 rad (= 3·180/π = 171,887°): sen 3 = 0,14112001 · cos 3 = −0,98999250 ·
 *     tan 3 = −0,14254654 · cuadrante II (90° < 171,9° < 180°).
 *   LÍMITE — ángulos cuadrantales: sen 180° = 0 y cos 90° = 0 EXACTOS; tan 90° y tan 270°
 *     no existen (cos = 0), ni csc/cot en 180° y 360° (sen = 0). La tabla de la propia app los
 *     escribe «∞». Y un ángulo sobre un eje (90°, 180°, 270°, 360°) no está en NINGÚN
 *     cuadrante: es cuadrantal.
 *   LÍMITE — hipotenusa 10 y ángulo 30° (el caso 4 de la propia app): a = 10·sen 30° = 5 ·
 *     b = 10·cos 30° = 8,6603 · B = 60°. Cateto b = 4 e hipotenusa 5: a = √(25 − 16) = 3.
 *     Cateto b = 4 y α = 30°: a = 4·tan 30° = 2,3094 · c = 4/cos 30° = 4,6188.
 *   LÍMITE — conversiones: 180° = π rad = 200 gon · 1 rad = 57,295780° = 63,661977 gon ·
 *     100 gon = 90° = π/2.
 *   LÍMITE — identidades con A = 30°, B = 60°: sen 2A = sen 60° = 0,86602540 · cos 2A = 0,5 ·
 *     sen 15° = 0,25881905 · cos 15° = 0,96592583 · sen(A+B) = 1 · sen(A−B) = −0,5 ·
 *     cos(A−B) = cos(−30°) = 0,86602540.
 *   RECHAZO — catetos 1 y 2 con hipotenusa 10: √(1 + 4) = 2,2361 ≠ 10, no hay triángulo
 *     rectángulo con esos tres lados. Cateto 5 con hipotenusa 3: la hipotenusa es siempre el
 *     lado mayor. En los casos para clase, «doce» no es un número.
 *
 * RESULTADO: las razones de ángulos no cuadrantales, el triángulo desde dos catetos, las
 * conversiones, las identidades y el corrector de los 12 casos salen exactos cifra a cifra.
 * Fallan los bordes: los cuadrantales publican el ruido del coma flotante como resultado
 * (tan 90° = 16.331.239.353.195.370), el cuadrante se calcula en grados aunque la entrada
 * esté en radianes, y la mitad de las parejas de datos del triángulo no calculan nada. Los
 * hallazgos abiertos van con `test()`: afirman lo que DEBERÍA pasar y hoy fallan a
 * propósito. Cuando se reparen, se les quita la marca y quedan como candado.
 * ══════════════════════════════════════════════════════════════════════════════════════════ */

test.describe('Inspección 25/09/2026', () => {
  const RUTA = '/calculadora-trigonometria/';

  /** El panel de resultados (hay más de un `role="status"` posible en la página). */
  const panelResultados = (page: Page): Locator =>
    page
      .locator('[role="status"]')
      .filter({ has: page.getByRole('heading', { level: 2, name: 'Resultados', exact: true }) });

  /** El valor que publica una ResultCard, localizada por su título. */
  const valorDe = (page: Page, titulo: string): Locator =>
    panelResultados(page)
      .getByRole('heading', { level: 3, name: titulo, exact: true })
      .locator('xpath=../following-sibling::div[1]/p');

  /** Escribe en un NumberInput como un usuario y espera a que el ESTADO de React lo recoja. */
  async function escribir(page: Page, etiqueta: string, valor: string): Promise<void> {
    const campo = page.getByLabel(etiqueta, { exact: true });
    await campo.fill(valor);
    await esperarValorEnReact(page, campo, valor);
  }

  async function abrir(page: Page): Promise<void> {
    await page.goto(RUTA);
    await esperarHidratacion(page, ['input[aria-label="Ángulo (grados)"]']);
  }

  async function modo(page: Page, nombre: string): Promise<void> {
    const boton = page.getByRole('button', { name: nombre, exact: true });
    await boton.click();
    await expect(boton).toHaveAttribute('aria-pressed', 'true');
  }

  /** Relación de contraste WCAG del texto de un elemento contra su fondo REAL compuesto. */
  async function contrasteDe(elemento: Locator): Promise<number> {
    return elemento.evaluate((el) => {
      const aRgba = (c: string): number[] => {
        const m = c.match(/rgba?\(([^)]+)\)/);
        if (!m) return [255, 255, 255, 1];
        const v = m[1].split(/[ ,/]+/).filter(Boolean).map(Number);
        return [v[0], v[1], v[2], v.length > 3 ? v[3] : 1];
      };
      const mezclar = (arriba: number[], abajo: number[]): number[] => [
        arriba[0] * arriba[3] + abajo[0] * (1 - arriba[3]),
        arriba[1] * arriba[3] + abajo[1] * (1 - arriba[3]),
        arriba[2] * arriba[3] + abajo[2] * (1 - arriba[3]),
        1,
      ];
      const capas: number[][] = [];
      for (let n: Element | null = el; n; n = n.parentElement) {
        const c = aRgba(getComputedStyle(n).backgroundColor);
        if (c[3] > 0) {
          capas.push(c);
          if (c[3] >= 1) break;
        }
      }
      let fondo = [255, 255, 255, 1];
      for (let i = capas.length - 1; i >= 0; i--) fondo = mezclar(capas[i], fondo);
      const texto = mezclar(aRgba(getComputedStyle(el).color), fondo);
      const lum = (c: number[]): number => {
        const f = (x: number): number => {
          const s = x / 255;
          return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
        };
        return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]);
      };
      const l1 = lum(texto);
      const l2 = lum(fondo);
      return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    });
  }

  // ─────────────────────────────────────────────────────── lo que está bien (candado)

  test('Funciones, 30°: las seis razones a 8 decimales y el ángulo en radianes', async ({ page }) => {
    await abrir(page);
    await escribir(page, 'Ángulo (grados)', '30');
    // Valores de la cabecera de este bloque: √3/2, √3/3, 2/√3 y √3 redondeados a 8 decimales.
    await expect(valorDe(page, 'sin(θ)')).toHaveText('0,50000000');
    await expect(valorDe(page, 'cos(θ)')).toHaveText('0,86602540');
    await expect(valorDe(page, 'tan(θ)')).toHaveText('0,57735027');
    await expect(valorDe(page, 'csc(θ)')).toHaveText('2,00000000');
    await expect(valorDe(page, 'sec(θ)')).toHaveText('1,15470054');
    await expect(valorDe(page, 'cot(θ)')).toHaveText('1,73205081');
    await expect(valorDe(page, 'En radianes')).toHaveText('0,523599'); // π/6
  });

  test('Funciones, −30°: signos del cuarto cuadrante', async ({ page }) => {
    await abrir(page);
    await escribir(page, 'Ángulo (grados)', '-30');
    await expect(valorDe(page, 'sin(θ)')).toHaveText('-0,50000000');
    await expect(valorDe(page, 'cos(θ)')).toHaveText('0,86602540');
    await expect(valorDe(page, 'tan(θ)')).toHaveText('-0,57735027');
    // −30° ≡ 330°: cuadrante IV. Se admite «4…» o «IV» para no atar este candado a la
    // notación, que es otro hallazgo (ver abajo).
    await expect(valorDe(page, 'Cuadrante')).toHaveText(/^(4|IV)\b/);
  });

  test('Funciones en radianes, 3 rad: razones correctas', async ({ page }) => {
    await abrir(page);
    await modo(page, 'Radianes');
    await escribir(page, 'Ángulo (radianes)', '3');
    await expect(valorDe(page, 'sin(θ)')).toHaveText('0,14112001'); // sen 3
    await expect(valorDe(page, 'cos(θ)')).toHaveText('-0,98999250'); // cos 3
    await expect(valorDe(page, 'tan(θ)')).toHaveText('-0,14254654'); // tan 3
  });

  test('Triángulo desde dos catetos 3 y 4: 5, 36,8699° y 53,1301°', async ({ page }) => {
    await abrir(page);
    await modo(page, 'Triángulo');
    await escribir(page, 'Cateto a (opuesto)', '3');
    await escribir(page, 'Cateto b (adyacente)', '4');
    await expect(valorDe(page, 'Hipotenusa c')).toHaveText('5,0000'); // √(9+16)
    await expect(valorDe(page, 'Ángulo A')).toHaveText('36,8699°'); // arctan(3/4)
    await expect(valorDe(page, 'Ángulo B')).toHaveText('53,1301°'); // 90 − 36,8699
    await expect(valorDe(page, 'Área')).toHaveText('6,0000u²');
    await expect(valorDe(page, 'Perímetro')).toHaveText('12,0000u');
  });

  test('Triángulo desde cateto a y ángulo α (5 y 30°): b = 8,6603, c = 10', async ({ page }) => {
    await abrir(page);
    await modo(page, 'Triángulo');
    await escribir(page, 'Cateto a (opuesto)', '5');
    await escribir(page, 'Ángulo α (grados)', '30');
    await expect(valorDe(page, 'Cateto b')).toHaveText('8,6603'); // 5 / tan 30°
    await expect(valorDe(page, 'Hipotenusa c')).toHaveText('10,0000'); // 5 / sen 30°
    await expect(valorDe(page, 'Ángulo B')).toHaveText('60,0000°');
  });

  test('Conversiones: 180° = π rad = 200 gon; 1 rad = 57,295780°; 100 gon = 90°', async ({ page }) => {
    await abrir(page);
    await modo(page, 'Conversiones');
    await escribir(page, 'Valor a convertir', '180');
    await expect(valorDe(page, 'Radianes')).toHaveText('3,141593');
    await expect(valorDe(page, 'Gradianes')).toHaveText('200,000000gon');
    await modo(page, 'Radianes');
    await escribir(page, 'Valor a convertir', '1');
    await expect(valorDe(page, 'Grados')).toHaveText('57,295780°'); // 180/π
    await expect(valorDe(page, 'Gradianes')).toHaveText('63,661977gon'); // 200/π
    await modo(page, 'Gradianes');
    await escribir(page, 'Valor a convertir', '100');
    await expect(valorDe(page, 'Grados')).toHaveText('90,000000°');
    await expect(valorDe(page, 'Radianes')).toHaveText('1,570796'); // π/2
  });

  test('Identidades con A = 30° y B = 60°', async ({ page }) => {
    await abrir(page);
    await modo(page, 'Identidades');
    await escribir(page, 'Ángulo A (grados)', '30');
    await escribir(page, 'Ángulo B (grados) - opcional', '60');
    await expect(valorDe(page, 'sin²θ + cos²θ')).toHaveText('1,00000000');
    await expect(valorDe(page, 'sin(2θ)')).toHaveText('0,86602540'); // sen 60°
    await expect(valorDe(page, 'cos(2θ)')).toHaveText('0,50000000'); // cos 60°
    await expect(valorDe(page, 'sin(θ/2)')).toHaveText('0,25881905'); // sen 15°
    await expect(valorDe(page, 'cos(θ/2)')).toHaveText('0,96592583'); // cos 15°
    await expect(valorDe(page, 'sin(A+B)')).toHaveText('1,00000000'); // sen 90°
    await expect(valorDe(page, 'sin(A-B)')).toHaveText('-0,50000000'); // sen(−30°)
  });

  test('Casos para clase: acepta la cifra que imprime y rechaza la mala', async ({ page }) => {
    await abrir(page);
    const caso = (n: number): Locator =>
      page.locator('article').filter({ has: page.locator(`#respuesta-caso-${n}`) });

    // Caso 1: sen 30° = 0,5. El coseno de 30° (0,866) es el error típico de razón.
    await caso(1).locator('#respuesta-caso-1').fill('0,5');
    await esperarValorEnReact(page, '#respuesta-caso-1', '0,5');
    await caso(1).getByRole('button', { name: 'Comprobar' }).click();
    await expect(caso(1).getByRole('alert')).toContainText('Correcto: 0,5.');
    await caso(1).locator('#respuesta-caso-1').fill('0,866');
    await esperarValorEnReact(page, '#respuesta-caso-1', '0,866');
    await caso(1).getByRole('button', { name: 'Comprobar' }).click();
    await expect(caso(1).getByRole('alert')).toContainText('Todavía no');

    // Caso 7: arcsen(8/17) = 28,0725°. Se acepta redondeado a 2 decimales; el complementario
    // 61,93° (arccos del mismo cociente) es el fallo típico y se rechaza.
    await caso(7).locator('#respuesta-caso-7').fill('28,07');
    await esperarValorEnReact(page, '#respuesta-caso-7', '28,07');
    await caso(7).getByRole('button', { name: 'Comprobar' }).click();
    await expect(caso(7).getByRole('alert')).toContainText('Correcto');
    await caso(7).locator('#respuesta-caso-7').fill('61,93');
    await esperarValorEnReact(page, '#respuesta-caso-7', '61,93');
    await caso(7).getByRole('button', { name: 'Comprobar' }).click();
    await expect(caso(7).getByRole('alert')).toContainText('Todavía no');

    // Caso 9: 0,9 / sen 6° = 8,6101 m.
    await caso(9).locator('#respuesta-caso-9').fill('8,61');
    await esperarValorEnReact(page, '#respuesta-caso-9', '8,61');
    await caso(9).getByRole('button', { name: 'Comprobar' }).click();
    await expect(caso(9).getByRole('alert')).toContainText('Correcto: 8,6101 m.');

    // Texto: se distingue de una respuesta equivocada.
    await caso(12).locator('#respuesta-caso-12').fill('doce');
    await esperarValorEnReact(page, '#respuesta-caso-12', 'doce');
    await caso(12).getByRole('button', { name: 'Comprobar' }).click();
    await expect(caso(12).getByRole('alert')).toContainText('Eso no es un número');

    await expect(page.getByText(/Has resuelto/)).toContainText('Has resuelto 1 de 12');
  });

  test('Práctica aleatoria: acepta la cifra de su propia solución y rechaza 0', async ({ page }) => {
    await abrir(page);
    await page.getByRole('button', { name: 'Ejercicio aleatorio' }).click();
    const verSolucion = page.locator('button[aria-controls="solucion-aleatoria"]');
    await verSolucion.click();
    const resultado = (await page.locator('#solucion-aleatoria strong').innerText()).trim();
    const cifra = resultado.split(' ')[0]; // «12,3456 m» → «12,3456»
    const comprobar = verSolucion.locator('xpath=preceding-sibling::button[1]');
    const veredicto = page
      .locator('#solucion-aleatoria')
      .locator('xpath=preceding-sibling::p[@role="alert"]');

    await page.locator('#respuesta-aleatoria').fill(cifra);
    await esperarValorEnReact(page, '#respuesta-aleatoria', cifra);
    await comprobar.click();
    await expect(veredicto).toContainText('Correcto');

    // Lados de 3 a 28 y ángulos de 15° a 75°: ninguna respuesta vale menos de 0,77.
    await page.locator('#respuesta-aleatoria').fill('0');
    await esperarValorEnReact(page, '#respuesta-aleatoria', '0');
    await comprobar.click();
    await expect(veredicto).toContainText('Todavía no');
  });

  test.describe('Móvil 375 px', () => {
    test.use({
      viewport: { width: 375, height: 812 },
      userAgent:
        'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
    });

    test('sin scroll horizontal, ni con los avisos de «No definida» de 90°', async ({ page }) => {
      await abrir(page);
      await page.getByRole('button', { name: '90°', exact: true }).click();
      await expect(valorDe(page, 'sin(θ)')).toHaveText('1,00000000');
      const anchos = await page.evaluate(() => ({
        pagina: document.documentElement.scrollWidth,
        vista: document.documentElement.clientWidth,
      }));
      expect(anchos.pagina).toBeLessThanOrEqual(anchos.vista);
    });
  });

  // ──────────────────────────────────────── HALLAZGOS ABIERTOS (fallan hoy a propósito)

  // Hallazgo: page.tsx calcula tan como Math.tan si Math.cos(θ) !== 0, y Math.cos(π/2) vale
  // 6,1·10⁻¹⁷, no 0. El ruido del coma flotante se publica como resultado. casos.ts ya tiene
  // la versión buena (`tangente`, que corta en 90° + k·180° comparando en grados) y la vista
  // no la usa.
  test('90°: tan y sec no existen (la tabla de la app dice ∞), no 16 billones', async ({ page }) => {
    await abrir(page);
    await page.getByRole('button', { name: '90°', exact: true }).click();
    await expect(valorDe(page, 'sin(θ)')).toHaveText('1,00000000');
    // Antes (1778): «16.331.239.353.195.370,00000000» en tan y en sec.
    await expect(valorDe(page, 'tan(θ)')).toHaveText(/^(∞|no definid|no existe)/i);
    await expect(valorDe(page, 'sec(θ)')).toHaveText(/^(∞|no definid|no existe)/i);
  });

  test('180°: csc y cot no existen (sen 180° = 0), no ±8,2·10¹⁵', async ({ page }) => {
    await abrir(page);
    await page.getByRole('button', { name: '180°', exact: true }).click();
    await expect(valorDe(page, 'cos(θ)')).toHaveText('-1,00000000');
    // Hoy: csc «8.165.619.676.597.685,00000000» y cot «-8.165.619.676.597.685,00000000».
    await expect(valorDe(page, 'csc(θ)')).toHaveText(/^(∞|no definid|no existe)/i);
    await expect(valorDe(page, 'cot(θ)')).toHaveText(/^(∞|no definid|no existe)/i);
  });

  test('270°: tan y sec no existen (cos 270° = 0), no ±5,4·10¹⁵', async ({ page }) => {
    await abrir(page);
    await page.getByRole('button', { name: '270°', exact: true }).click();
    await expect(valorDe(page, 'sin(θ)')).toHaveText('-1,00000000');
    // Hoy: tan «5.443.746.451.065.123,00000000» y sec «-5.443.746.451.065.123,00000000».
    await expect(valorDe(page, 'tan(θ)')).toHaveText(/^(∞|no definid|no existe)/i);
    await expect(valorDe(page, 'sec(θ)')).toHaveText(/^(∞|no definid|no existe)/i);
  });

  test('360°: csc y cot no existen (sen 360° = 0), no −4,1·10¹⁵', async ({ page }) => {
    await abrir(page);
    await page.getByRole('button', { name: '360°', exact: true }).click();
    await expect(valorDe(page, 'cos(θ)')).toHaveText('1,00000000');
    // Hoy: csc y cot «-4.082.809.838.298.842,50000000».
    await expect(valorDe(page, 'csc(θ)')).toHaveText(/^(∞|no definid|no existe)/i);
    await expect(valorDe(page, 'cot(θ)')).toHaveText(/^(∞|no definid|no existe)/i);
  });

  // Hallazgo: formatNumber escribe «≈0» para |x| < 0,0001, así que el ruido 1,2·10⁻¹⁶ de
  // sen 180° sale como un cero APROXIMADO. Es un cero exacto, el mismo que la app imprime
  // «0,00000000» para sen 0° y que su tabla de notables escribe «0» para cos 90°.
  test('sen 180° y cos 90° son 0 exactos, no «≈0»', async ({ page }) => {
    await abrir(page);
    await escribir(page, 'Ángulo (grados)', '180');
    await expect(valorDe(page, 'sin(θ)')).toHaveText('0,00000000'); // hoy «≈0»
    await escribir(page, 'Ángulo (grados)', '90');
    await expect(valorDe(page, 'cos(θ)')).toHaveText('0,00000000'); // hoy «≈0»
  });

  // Hallazgo: en modo radianes los botones de ángulos notables escriben el ángulo redondeado a
  // 4 decimales (90° → «1,5708»), que ya no es π/2: tan(1,5708) = −272.241,8. El botón dice
  // «90°» y la tangente sale NEGATIVA y finita.
  test('Radianes, botón «90°»: tan no existe, no −272.241,8', async ({ page }) => {
    await abrir(page);
    await modo(page, 'Radianes');
    await page.getByRole('button', { name: '90°', exact: true }).click();
    // Reparado (1779): el botón escribe el múltiplo EXACTO de π, no 1,5708 redondeado.
    await expect(page.getByLabel('Ángulo (radianes)', { exact: true })).toHaveValue('π/2');
    // Antes: «-272.241,80840928». Con 180° salía csc «-136.120,90420647»; con 270°, tan «-90.747,26946832».
    await expect(valorDe(page, 'tan(θ)')).toHaveText(/^(∞|no definid|no existe)/i);
    await expect(valorDe(page, 'sin(θ)')).toHaveText('1,00000000');
    await expect(valorDe(page, 'cos(θ)')).toHaveText('0,00000000');
    await page.getByRole('button', { name: '180°', exact: true }).click();
    await expect(page.getByLabel('Ángulo (radianes)', { exact: true })).toHaveValue('π');
    await expect(valorDe(page, 'csc(θ)')).toHaveText(/^no definid/i);
    await page.getByRole('button', { name: '270°', exact: true }).click();
    await expect(page.getByLabel('Ángulo (radianes)', { exact: true })).toHaveValue('3π/2');
    await expect(valorDe(page, 'tan(θ)')).toHaveText(/^no definid/i);
  });

  // Hallazgo: page.tsx:80 normaliza `ang`, que en modo radianes ES el número en radianes, como
  // si fueran grados: 3 rad (171,9°) cae en «1°» (primer cuadrante). Todo ángulo en radianes
  // menor de 90 —es decir, cualquiera que se escriba— sale en el cuadrante I.
  test('Radianes, 3 rad (171,9°): cuadrante II, no I', async ({ page }) => {
    await abrir(page);
    await modo(page, 'Radianes');
    await escribir(page, 'Ángulo (radianes)', '3');
    await expect(valorDe(page, 'sin(θ)')).toHaveText('0,14112001');
    await expect(valorDe(page, 'Cuadrante')).toHaveText(/^(2|II)\b/); // hoy «1°»
    await escribir(page, 'Ángulo (radianes)', '4'); // 229,18°
    await expect(valorDe(page, 'Cuadrante')).toHaveText('III');
    await escribir(page, 'Ángulo (radianes)', '5,5'); // 315,13°
    await expect(valorDe(page, 'Cuadrante')).toHaveText('IV');
  });

  // Hallazgo (sospecha 2, confirmada): page.tsx:79-83 asigna los ejes a un cuadrante (90° → I,
  // 180° → II, 270° → III, 360° → I). Un ángulo sobre un eje es CUADRANTAL: no está en
  // ninguno, y es justo donde cambian los signos que el bloque educativo enseña por cuadrantes.
  test('90°, 180°, 270° y 360° no están en ningún cuadrante', async ({ page }) => {
    await abrir(page);
    for (const angulo of ['90', '180', '270', '360']) {
      await escribir(page, 'Ángulo (grados)', angulo);
      // Hoy: «1°», «2°», «3°» y «1°».
      await expect(valorDe(page, 'Cuadrante'), `${angulo}°`).toHaveText(/eje|cuadrantal|ninguno/i);
    }
  });

  // Hallazgo (sospecha 2, confirmada): el cuadrante se rotula con el SÍMBOLO DE GRADO
  // (U+00B0): «2°» se lee «dos grados». El ordinal sería «2.º» (º, U+00BA, con punto), y el
  // bloque educativo de la propia página los numera I, II, III y IV.
  test('135°: el cuadrante se rotula II (o 2.º), no «2°»', async ({ page }) => {
    await abrir(page);
    await escribir(page, 'Ángulo (grados)', '135');
    await expect(valorDe(page, 'sin(θ)')).toHaveText('0,70710678');
    await expect(valorDe(page, 'Cuadrante')).not.toContainText('°'); // hoy «2°»
  });

  // Hallazgo: de las seis parejas de dos datos (el panel dice «Introduce al menos 2 valores»),
  // solo tres calculan: a+b, a+c y a+α. Hipotenusa + ángulo —el caso 4 de la propia página—,
  // cateto b + hipotenusa y cateto b + ángulo dejan «Ingresa los valores para calcular».
  test('Triángulo: hipotenusa 10 y α = 30° dan a = 5 y b = 8,6603', async ({ page }) => {
    await abrir(page);
    await modo(page, 'Triángulo');
    await escribir(page, 'Hipotenusa c', '10');
    await escribir(page, 'Ángulo α (grados)', '30');
    await expect(valorDe(page, 'Cateto a')).toHaveText('5,0000'); // 10 · sen 30°
    await expect(valorDe(page, 'Cateto b')).toHaveText('8,6603'); // 10 · cos 30°
  });

  test('Triángulo: cateto b = 4 e hipotenusa 5 dan a = 3', async ({ page }) => {
    await abrir(page);
    await modo(page, 'Triángulo');
    await escribir(page, 'Cateto b (adyacente)', '4');
    await escribir(page, 'Hipotenusa c', '5');
    await expect(valorDe(page, 'Cateto a')).toHaveText('3,0000'); // √(25 − 16)
    await expect(valorDe(page, 'Ángulo A')).toHaveText('36,8699°'); // arcsen(3/5)
  });

  test('Triángulo: cateto b = 4 y α = 30° dan a = 2,3094 y c = 4,6188', async ({ page }) => {
    await abrir(page);
    await modo(page, 'Triángulo');
    await escribir(page, 'Cateto b (adyacente)', '4');
    await escribir(page, 'Ángulo α (grados)', '30');
    await expect(valorDe(page, 'Cateto a')).toHaveText('2,3094'); // 4 · tan 30°
    await expect(valorDe(page, 'Hipotenusa c')).toHaveText('4,6188'); // 4 / cos 30°
  });

  // Hallazgo: con los tres lados, el caso «dos catetos» gana y la hipotenusa tecleada se
  // DESCARTA sin aviso: 1, 2 y 10 publican un triángulo de hipotenusa 2,2361. Igual con
  // a = 3, b = 4, α = 60°: publica A = 36,8699° y el 60° desaparece.
  // Reparado (1784). El test original afirmaba «el panel no contiene 2,2361», que era un
  // proxy de «no publica un triángulo con otra hipotenusa»; el aviso de incompatibilidad CITA
  // ese 2,2361 para explicar el choque, así que se afirma lo que importa: hay aviso y no hay
  // tarjeta de resultado.
  test('Triángulo 1, 2, 10: no publica una hipotenusa distinta de la tecleada', async ({ page }) => {
    await abrir(page);
    await modo(page, 'Triángulo');
    await escribir(page, 'Cateto a (opuesto)', '1');
    await escribir(page, 'Cateto b (adyacente)', '2');
    await escribir(page, 'Hipotenusa c', '10');
    await expect(panelResultados(page)).toContainText('no son compatibles');
    await expect(panelResultados(page)).toContainText('la hipotenusa c sería 2,2361, no 10');
    await expect(
      panelResultados(page).getByRole('heading', { level: 3, name: 'Hipotenusa c', exact: true }),
    ).toHaveCount(0);
  });

  test('Triángulo 3, 4 y α = 60°: avisa de que el ángulo no cuadra (sería 36,8699°)', async ({ page }) => {
    await abrir(page);
    await modo(page, 'Triángulo');
    await escribir(page, 'Cateto a (opuesto)', '3');
    await escribir(page, 'Cateto b (adyacente)', '4');
    await escribir(page, 'Ángulo α (grados)', '60');
    await expect(panelResultados(page)).toContainText('el ángulo α sería 36,8699°, no 60°');
    await expect(
      panelResultados(page).getByRole('heading', { level: 3, name: 'Ángulo A', exact: true }),
    ).toHaveCount(0);
  });

  test('Triángulo 3, 4 y 5: datos de más pero compatibles, resuelve y lo dice', async ({ page }) => {
    await abrir(page);
    await modo(page, 'Triángulo');
    await escribir(page, 'Cateto a (opuesto)', '3');
    await escribir(page, 'Cateto b (adyacente)', '4');
    await escribir(page, 'Hipotenusa c', '5');
    await expect(valorDe(page, 'Ángulo A')).toHaveText('36,8699°');
    await expect(panelResultados(page)).toContainText('Hay datos de más');
  });

  // Hallazgo: un dato imposible se trata como un dato que FALTA. Cateto 5 con hipotenusa 3 (o
  // α = 0°, o α = 90°) deja «Ingresa los valores para calcular», aunque los dos valores estén
  // escritos. casos.ts tiene ya el texto (ERROR_HIPOTENUSA_MENOR) y la vista no lo usa.
  test('Triángulo: cateto 5 con hipotenusa 3 explica que la hipotenusa es el lado mayor', async ({ page }) => {
    await abrir(page);
    await modo(page, 'Triángulo');
    await escribir(page, 'Cateto a (opuesto)', '5');
    await escribir(page, 'Hipotenusa c', '3');
    await expect(panelResultados(page)).toContainText(/hipotenusa/i);
    await expect(panelResultados(page)).not.toContainText('Ingresa los valores para calcular');
    // α = 0° y α = 90° tampoco son «datos que faltan».
    await escribir(page, 'Hipotenusa c', '');
    await escribir(page, 'Ángulo α (grados)', '0');
    await expect(panelResultados(page)).toContainText('entre 0° y 90°');
    await escribir(page, 'Ángulo α (grados)', '90');
    await expect(panelResultados(page)).toContainText('entre 0° y 90°');
  });

  // Hallazgo: la fracción de π se escribe «1π» y «1π/2», y 0° sale «0,0000π».
  test('Conversiones: 180° es «π», 90° es «π/2» y 0° es «0»', async ({ page }) => {
    await abrir(page);
    await modo(page, 'Conversiones');
    await escribir(page, 'Valor a convertir', '180');
    await expect(valorDe(page, 'Fracción de π')).toHaveText('π'); // hoy «1π»
    await escribir(page, 'Valor a convertir', '90');
    await expect(valorDe(page, 'Fracción de π')).toHaveText('π/2'); // hoy «1π/2»
    await escribir(page, 'Valor a convertir', '0');
    await expect(valorDe(page, 'Fracción de π')).toHaveText('0'); // hoy «0,0000π»
    await escribir(page, 'Valor a convertir', '-180');
    await expect(valorDe(page, 'Fracción de π')).toHaveText('-π');
    await escribir(page, 'Valor a convertir', '135');
    await expect(valorDe(page, 'Fracción de π')).toHaveText('3π/4');
    // En radianes se puede escribir el múltiplo de π, y 1,5708 no se hace pasar por π/2 exacto.
    await modo(page, 'Radianes');
    await escribir(page, 'Valor a convertir', '3π/2');
    await expect(valorDe(page, 'Grados')).toHaveText('270,000000°');
    await escribir(page, 'Valor a convertir', '1,5708');
    await expect(valorDe(page, 'Fracción de π')).toHaveText('≈ π/2');
  });

  // Hallazgo: page.tsx calcula cosResta (cos(A−B)) y nunca lo pinta; el panel de suma y resta
  // enseña tres de las cuatro fórmulas que el bloque educativo escribe (cos(A±B)).
  test('Identidades: aparece cos(A−B) = 0,86602540 con A = 30° y B = 60°', async ({ page }) => {
    await abrir(page);
    await modo(page, 'Identidades');
    await escribir(page, 'Ángulo A (grados)', '30');
    await escribir(page, 'Ángulo B (grados) - opcional', '60');
    await expect(valorDe(page, 'sin(A-B)')).toHaveText('-0,50000000');
    await expect(valorDe(page, 'cos(A-B)')).toHaveText('0,86602540'); // cos(−30°); hoy no existe
    // 1786: cos(30° + 60°) = cos 90° = 0 EXACTO, no «≈0».
    await expect(valorDe(page, 'cos(A+B)')).toHaveText('0,00000000');
  });

  // Hallazgo (sospecha 1, confirmada en pantalla): conUnidad (casos.ts:155) separa con un
  // espacio el símbolo de grado de ángulo: «28,0725 °». La Ortografía de la RAE (2010) y el SI
  // lo escriben pegado a la cifra («28,0725°»), a diferencia de «°C». Los pasos de la misma
  // solución ya lo escriben pegado («θ = 28,0725°»): dos grafías en la misma caja.
  test('Caso 7: el veredicto y la solución escriben «28,0725°», pegado', async ({ page }) => {
    await abrir(page);
    const caso7 = page.locator('article').filter({ has: page.locator('#respuesta-caso-7') });
    await caso7.locator('#respuesta-caso-7').fill('28,07');
    await esperarValorEnReact(page, '#respuesta-caso-7', '28,07');
    await caso7.getByRole('button', { name: 'Comprobar' }).click();
    await expect(caso7.getByRole('alert')).toContainText('Correcto: 28,0725°.'); // hoy «28,0725 °.»
    await caso7.getByRole('button', { name: 'Ver solución' }).click();
    await expect(caso7.locator('#solucion-caso-7 strong')).toHaveText('28,0725°'); // hoy «28,0725 °»
  });

  // Hallazgo: el ejemplo del arquitecto dice «rampa accesible (máx 8°)» y calcula 6·tan 8° ≈
  // 0,84 m. El CTE DB SUA 4.3.1 limita las rampas de itinerario accesible al 10 % (< 3 m), 8 %
  // (< 6 m) y 6 % en el resto: por CIENTO, no grados. 8° son un 14,05 %, fuera de toda rampa
  // accesible; con 6 m el tope es 6 % → 0,36 m.
  test('Bloque educativo: la rampa accesible no se limita a «8°»', async ({ page }) => {
    await abrir(page);
    const texto = (await page.locator('body').textContent()) ?? '';
    expect(texto).not.toContain('rampa accesible (máx 8°)');
    // CTE DB SUA 1, 4.3.1 (texto consolidado en codigotecnico.org): itinerario accesible,
    // 10 % si el tramo mide < 3 m, 8 % si < 6 m, 6 % en el resto; en proyección horizontal.
    expect(texto).toContain('CTE DB SUA 1, apdo. 4.3.1');
    expect(texto).toContain('6 × 0,06 = 0,36 m');
    expect(texto).toContain('arctan(0,06) ≈ 3,43°'); // atan(0,06) = 3,4336°
  });

  // Hallazgo: el FAQPage del JSON-LD (lo que leen los buscadores y las IAs) promete
  // arcoseno/arcocoseno/arcotangente y resolver triángulos con el teorema del seno y del
  // coseno «con al menos tres datos». La interfaz no tiene ningún campo para una razón que
  // invertir ni para un triángulo que no sea rectángulo.
  // Reparado (1791) corrigiendo la PROMESA, no ampliando la app: el JSON-LD ya no dice que
  // incluya funciones inversas ni que resuelva con el teorema del seno y del coseno, y dice
  // expresamente que los oblicuángulos no se calculan. Si algún día la interfaz gana esos
  // campos, la promesa se puede volver a escribir; las dos ramas de abajo lo comprueban.
  test('La promesa del JSON-LD se cumple en la interfaz', async ({ page }) => {
    await abrir(page);
    const jsonLd = (
      await page.locator('script[type="application/ld+json"]').allTextContents()
    ).join(' ');
    expect(jsonLd).toContain('FAQPage');
    const prometeInversas = /incluye las funciones inversas|arcoseno, arcocoseno y arcotangente para obtener/i.test(jsonLd);
    const prometeOblicuangulos = /aplica el teorema del seno|triángulos rectángulos con teorema/i.test(jsonLd);
    if (prometeInversas) {
      await expect(page.getByLabel(/arcsen|arcoseno|valor de la razón/i)).not.toHaveCount(0);
    }
    if (prometeOblicuangulos) {
      await expect(
        page.getByRole('button', { name: /oblicu|cualquier triángulo/i }),
      ).not.toHaveCount(0);
    }
    expect(prometeInversas || prometeOblicuangulos).toBe(false);
  });

  // Hallazgo: seis <h2> del bloque educativo llevan el emoji sin aria-hidden, así que el lector
  // de pantalla lo lee dentro del título. Lo delata
  // `node scripts/check-a11y-jsx.mjs app/calculadora-trigonometria/page.tsx` (L945…L1393).
  test('Bloque educativo: los títulos se anuncian sin el emoji', async ({ page }) => {
    await abrir(page);
    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
    // Testigo de que la guía está abierta y el título es visible: sin «exact» sí lo encuentra.
    await expect(
      page.getByRole('heading', { level: 2, name: /Las 6 Funciones Trigonométricas/ }),
    ).toHaveCount(1);
    // Hoy su nombre accesible es «📊 Las 6 Funciones Trigonométricas».
    await expect(
      page.getByRole('heading', { level: 2, name: 'Las 6 Funciones Trigonométricas', exact: true }),
    ).toHaveCount(1);
    await expect(
      page.getByRole('heading', { level: 2, name: 'Mejores Prácticas', exact: true }),
    ).toHaveCount(1);
  });

  // Hallazgo: contraste por debajo de 4,5:1 en texto pequeño. En claro, la etiqueta «Cálculo
  // directo / Situación real» de cada caso (--primary sobre su 12 %) da 3,28:1; en oscuro, el
  // botón activo «Grados (°)» (--primary sobre --bg-card) da 3,50:1. «Comprobar» (blanco sobre
  // --primary) da 4,11:1 en los dos temas.
  test('Contraste en claro: la etiqueta de los casos llega a 4,5:1', async ({ page }) => {
    await page.addInitScript(() => {
      try {
        localStorage.setItem('meskeia-theme', 'light');
      } catch {
        /* sin almacenamiento: el tema por defecto ya es claro */
      }
    });
    await abrir(page);
    await esperarPaginaAsentada(page);
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    const etiqueta = page.locator('article').first().getByText('Cálculo directo', { exact: true });
    expect(await contrasteDe(etiqueta)).toBeGreaterThanOrEqual(4.5); // hoy 3,28
  });

  test('Contraste en oscuro: el botón activo «Grados (°)» llega a 4,5:1', async ({ page }) => {
    await page.addInitScript(() => {
      try {
        localStorage.setItem('meskeia-theme', 'dark');
      } catch {
        /* sin almacenamiento no hay tema oscuro que medir */
      }
    });
    await abrir(page);
    await esperarPaginaAsentada(page);
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    const boton = page.getByRole('button', { name: 'Grados (°)', exact: true });
    await expect(boton).toHaveAttribute('aria-pressed', 'true');
    expect(await contrasteDe(boton)).toBeGreaterThanOrEqual(4.5); // hoy 3,50
  });

  // 1793, el resto de la ficha: todos los textos pequeños de marca que el acta midió por
  // debajo de 4,5:1, en los DOS temas. Se reparó con los tokens de globals.css
  // (--primary-texto para texto, --primary-boton para fondo con texto blanco).
  for (const tema of ['light', 'dark'] as const) {
    test(`Contraste en ${tema === 'light' ? 'claro' : 'oscuro'}: todos los textos de marca de los casos y del selector llegan a 4,5:1`, async ({ page }) => {
      await page.addInitScript((t) => {
        try {
          localStorage.setItem('meskeia-theme', t);
        } catch {
          /* sin almacenamiento el tema no se puede fijar */
        }
      }, tema);
      await abrir(page);
      await esperarPaginaAsentada(page);
      await expect(page.locator('html')).toHaveAttribute('data-theme', tema);
      const tarjeta = page.locator('article').first();
      const medidos: Array<[string, Locator]> = [
        ['etiqueta «Cálculo directo»', tarjeta.getByText('Cálculo directo', { exact: true })],
        ['número del caso', tarjeta.locator('span').first()],
        ['«Comprobar»', tarjeta.getByRole('button', { name: 'Comprobar' })],
        ['«Ver solución»', tarjeta.getByRole('button', { name: 'Ver solución' })],
        ['«Empezar de nuevo»', page.getByRole('button', { name: 'Empezar de nuevo' })],
        ['número de «Has resuelto»', page.getByText(/Has resuelto/).locator('strong')],
        ['«Ejercicio aleatorio»', page.getByRole('button', { name: 'Ejercicio aleatorio' })],
        ['«Grados (°)» activo', page.getByRole('button', { name: 'Grados (°)', exact: true })],
      ];
      for (const [nombre, elemento] of medidos) {
        expect(await contrasteDe(elemento), `${nombre} en ${tema}`).toBeGreaterThanOrEqual(4.5);
      }
    });
  }
});
