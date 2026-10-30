import { test, expect } from '@playwright/test';
import { esperarHidratacion, esperarValorEnReact } from './_hidratacion';
import {
  anguloEntreTangentes,
  centroRadical,
  construirEjeRadical,
  construirPPC,
  construirPPR,
  construirPotencia,
  construirTangentesComunes,
  construirTangentesDesdePunto,
  distancia,
  distanciaEjeRadical,
  longitudTangente,
  potencia,
  posicionRelativa,
  restar,
  productoEscalar,
  tangentesComunes,
  tramoTangenteExterior,
  tramoTangenteInterior,
  type Circunferencia,
  type Punto,
  type Trazo,
} from '../../app/simulador-tangencias-potencia/motor';
import {
  CASOS,
  TEXTO_MOTIVO,
  TOTAL_CASOS,
  cifra,
  comprobarRespuesta,
  generarEjercicioAleatorio,
  resolverCaso,
} from '../../app/simulador-tangencias-potencia/casos';

/**
 * Simulador de potencia y tangencias (Dibujo Técnico) — motor y casos de aula (30/10/2026).
 *
 * La app dibuja construcciones y corrige lo que teclea el alumno. Una tangente que no toca o
 * un eje radical desplazado se pintarían igual de bien y el build no lo vería: por eso la
 * geometría vive en `motor.ts` y se prueba aquí, sin navegador.
 *
 * CÓMO SE DERIVA CADA VALOR ESPERADO (a mano, desde la definición; nunca copiado de la app)
 *   · Potencia d² − r²: d = 10, r = 6 → 100 − 36 = 64. d = 3, r = 5 → 9 − 25 = −16.
 *   · Tangente √(d² − r²) con ternas pitagóricas: (13, 5) → 12; (17, 8) → 15.
 *   · Desde P(13, 0) a la circunferencia O(0, 0), r = 5, los puntos de contacto son
 *     (r²/d, ± r·t/d) = (25/13, ± 60/13), porque el triángulo OTP es rectángulo en T.
 *   · Ángulo entre tangentes 2·arcsen(r/d): r/d = 1/2 → 60°; r/d = √2/2 → 90°.
 *   · Eje radical x = (d² + r₁² − r₂²)/2d: (10, 4, 2) → 112/20 = 5,6; comprobación
 *     5,6² − 16 = 15,36 = 4,4² − 4.
 *   · Tramos de tangente común: exterior √(26² − 10²) = 24; interior √(25² − 20²) = 15.
 *   · PPR: MT = √(MA·MB): (2, 8) → 4.
 *   Las construcciones (PPR, PPC, eje, tangentes) se comprueban por sus PROPIEDADES: la
 *   solución pasa por los puntos, dista de la recta lo que su radio, la tangente es
 *   perpendicular al radio… Es la prueba que no depende de cómo se haya calculado.
 */

const O: Punto = { x: 0, y: 0 };
const PREC = 6;

function circ(x: number, y: number, radio: number): Circunferencia {
  return { centro: { x, y }, radio };
}

/** Distancia de un punto a la recta que pasa por a y b. */
function distanciaARecta(p: Punto, a: Punto, b: Punto): number {
  const d = restar(b, a);
  return Math.abs(d.x * (p.y - a.y) - d.y * (p.x - a.x)) / Math.hypot(d.x, d.y);
}

/** Lado (signo) de p respecto de la recta ab. */
function lado(p: Punto, a: Punto, b: Punto): number {
  const d = restar(b, a);
  return Math.sign(d.x * (p.y - a.y) - d.y * (p.x - a.x));
}

function todosLosTrazos(pasos: { trazos: Trazo[] }[]): Trazo[] {
  return pasos.flatMap((p) => p.trazos);
}

// ============================================
// MOTOR — magnitudes
// ============================================

test.describe('Potencia de un punto', () => {
  test('fuera es positiva, dentro negativa y sobre la circunferencia cero', () => {
    expect(potencia({ x: 10, y: 0 }, circ(0, 0, 6))).toBeCloseTo(64, PREC);
    expect(potencia({ x: 3, y: 0 }, circ(0, 0, 5))).toBeCloseTo(-16, PREC);
    expect(potencia({ x: 0, y: 5 }, circ(0, 0, 5))).toBeCloseTo(0, PREC);
  });

  test('PA · PB con signo no depende de la secante: siempre es la potencia', () => {
    const c = circ(0, 0, 5);
    for (const p of [{ x: 13, y: 0 }, { x: 2, y: 1 }]) {
      const esperada = potencia(p, c);
      // Las cuatro direcciones cortan a la circunferencia desde los dos puntos.
      for (const q of [{ x: 0, y: 0 }, { x: 1, y: 3 }, { x: -4, y: -2 }, { x: 3, y: -2 }]) {
        const k = construirPotencia(c, p, q);
        const producto = k.medidas.find((m) => m.etiqueta.startsWith('PA · PB'));
        expect(producto, `secante por ${q.x},${q.y}`).toBeDefined();
        expect(producto!.valor).toBeCloseTo(esperada, PREC);
      }
    }
  });

  test('desde un punto exterior, la tangente al cuadrado es la potencia', () => {
    expect(longitudTangente(13, 5)).toBeCloseTo(12, PREC);
    expect(longitudTangente(17, 8)).toBeCloseTo(15, PREC);
    expect(Number.isNaN(longitudTangente(3, 5))).toBe(true);
  });

  test('ángulo entre las dos tangentes', () => {
    expect(anguloEntreTangentes(10, 5)).toBeCloseTo(60, PREC);
    expect(anguloEntreTangentes(Math.SQRT2, 1)).toBeCloseTo(90, PREC);
    expect(Number.isNaN(anguloEntreTangentes(4, 5))).toBe(true);
  });
});

test.describe('Rectas tangentes desde un punto (arco capaz de 90°)', () => {
  test('los puntos de contacto son (25/13, ±60/13) y la tangente es perpendicular al radio', () => {
    const c = circ(0, 0, 5);
    const P = { x: 13, y: 0 };
    const k = construirTangentesDesdePunto(c, P);
    expect(k.soluciones).toBe(2);
    const contactos = todosLosTrazos(k.pasos).filter((t) => t.tipo === 'punto' && t.etiqueta?.startsWith('T')) as Extract<Trazo, { tipo: 'punto' }>[];
    expect(contactos).toHaveLength(2);
    const ys = contactos.map((t) => t.p.y).sort((a, b) => a - b);
    expect(ys[0]).toBeCloseTo(-60 / 13, PREC);
    expect(ys[1]).toBeCloseTo(60 / 13, PREC);
    for (const { p: T } of contactos) {
      expect(T.x).toBeCloseTo(25 / 13, PREC);
      expect(productoEscalar(restar(T, O), restar(T, P))).toBeCloseTo(0, PREC);
      expect(distancia(T, P)).toBeCloseTo(12, PREC);
    }
  });

  test('un punto interior no tiene tangentes y uno de la circunferencia tiene una', () => {
    expect(construirTangentesDesdePunto(circ(0, 0, 5), { x: 1, y: 1 }).soluciones).toBe(0);
    expect(construirTangentesDesdePunto(circ(0, 0, 5), { x: 1, y: 1 }).aviso).not.toBeNull();
    expect(construirTangentesDesdePunto(circ(0, 0, 5), { x: 3, y: 4 }).soluciones).toBe(1);
  });
});

test.describe('Eje radical y centro radical', () => {
  test('la distancia al eje se despeja igualando potencias', () => {
    expect(distanciaEjeRadical(10, 4, 2)).toBeCloseTo(5.6, PREC);
    expect(5.6 ** 2 - 16).toBeCloseTo(4.4 ** 2 - 4, PREC);
  });

  test('en las cinco posiciones, todo punto del eje construido tiene la misma potencia', () => {
    const parejas: [Circunferencia, Circunferencia][] = [
      [circ(0, 0, 3), circ(10, 0, 2)], // exteriores
      [circ(0, 0, 4), circ(5, 0, 3)], // secantes
      [circ(0, 0, 3), circ(5, 0, 2)], // tangentes exteriores
      [circ(0, 0, 6), circ(1, 1, 2)], // interiores
      [circ(0, 0, 5), circ(2, 0, 3)], // tangentes interiores
      [circ(2, 3, 2.5), circ(9, -4, 4)], // exteriores en diagonal
    ];
    for (const [c1, c2] of parejas) {
      const k = construirEjeRadical(c1, c2, null);
      const eje = todosLosTrazos(k.pasos).find((t) => t.tipo === 'recta' && t.etiqueta === 'eje');
      expect(eje, posicionRelativa(c1, c2)).toBeDefined();
      if (eje?.tipo !== 'recta') continue;
      for (const s of [-7, 0, 3.5, 12]) {
        const p = { x: eje.p.x + eje.dir.x * s, y: eje.p.y + eje.dir.y * s };
        expect(potencia(p, c1), `${posicionRelativa(c1, c2)} s=${s}`).toBeCloseTo(potencia(p, c2), 5);
      }
      // El punto R de la circunferencia auxiliar también está en el eje.
      const R = todosLosTrazos(k.pasos).find((t) => t.tipo === 'punto' && t.etiqueta === 'R');
      if (R?.tipo === 'punto') expect(potencia(R.p, c1)).toBeCloseTo(potencia(R.p, c2), 5);
    }
  });

  test('las concéntricas no tienen eje', () => {
    const k = construirEjeRadical(circ(0, 0, 2), circ(0, 0, 5), null);
    expect(k.aviso).not.toBeNull();
    expect(k.pasos).toHaveLength(0);
  });

  test('el centro radical tiene la misma potencia respecto de las tres', () => {
    const c1 = circ(0, 0, 3);
    const c2 = circ(10, 1, 2);
    const c3 = circ(4, 9, 2.5);
    const CR = centroRadical(c1, c2, c3);
    expect(CR).not.toBeNull();
    expect(potencia(CR!, c1)).toBeCloseTo(potencia(CR!, c2), 5);
    expect(potencia(CR!, c1)).toBeCloseTo(potencia(CR!, c3), 5);
  });

  test('con los tres centros alineados no hay centro radical y se avisa', () => {
    expect(centroRadical(circ(0, 0, 1), circ(5, 0, 1), circ(10, 0, 2))).toBeNull();
    expect(construirEjeRadical(circ(0, 0, 1), circ(5, 0, 1), circ(10, 0, 2)).aviso).not.toBeNull();
  });
});

test.describe('Tangentes comunes a dos circunferencias', () => {
  test('los tramos salen de la diferencia (exterior) y la suma (interior) de radios', () => {
    expect(tramoTangenteExterior(26, 15, 5)).toBeCloseTo(24, PREC);
    expect(tramoTangenteInterior(25, 12, 8)).toBeCloseTo(15, PREC);
    expect(Number.isNaN(tramoTangenteInterior(5, 4, 3))).toBe(true);
  });

  test('cada tangente toca a las dos: dista de cada centro lo que su radio', () => {
    const casos: [Circunferencia, Circunferencia][] = [
      [circ(0, 0, 15), circ(26, 0, 5)],
      [circ(3, 2, 4), circ(14, 7, 2)],
      [circ(10, 5, 2), circ(0, 0, 4)], // la mayor en segundo lugar
      [circ(0, 0, 3), circ(8, 0, 3)], // radios iguales
    ];
    for (const [c1, c2] of casos) {
      for (const familia of ['exteriores', 'interiores'] as const) {
        const grande = c1.radio >= c2.radio ? c1 : c2;
        const chica = grande === c1 ? c2 : c1;
        for (const t of tangentesComunes(grande, chica, familia)) {
          expect(distancia(t.t1, grande.centro)).toBeCloseTo(grande.radio, PREC);
          expect(distancia(t.t2, chica.centro)).toBeCloseTo(chica.radio, PREC);
          expect(distanciaARecta(grande.centro, t.t1, t.t2)).toBeCloseTo(grande.radio, PREC);
          expect(distanciaARecta(chica.centro, t.t1, t.t2)).toBeCloseTo(chica.radio, PREC);
          const mismoLado = lado(grande.centro, t.t1, t.t2) === lado(chica.centro, t.t1, t.t2);
          expect(mismoLado, familia).toBe(familia === 'exteriores');
        }
      }
    }
  });

  test('el número de tangentes depende de la posición relativa', () => {
    const contar = (c1: Circunferencia, c2: Circunferencia) =>
      construirTangentesComunes(c1, c2, 'exteriores').soluciones + construirTangentesComunes(c1, c2, 'interiores').soluciones;
    expect(contar(circ(0, 0, 3), circ(10, 0, 2))).toBe(4); // exteriores
    expect(contar(circ(0, 0, 3), circ(5, 0, 2))).toBe(3); // tangentes exteriores
    expect(contar(circ(0, 0, 4), circ(5, 0, 3))).toBe(2); // secantes
    expect(contar(circ(0, 0, 5), circ(2, 0, 3))).toBe(1); // tangentes interiores
    expect(contar(circ(0, 0, 6), circ(1, 0, 2))).toBe(0); // una dentro de otra
  });

  test('el tramo construido mide lo que da la fórmula', () => {
    const [t] = tangentesComunes(circ(0, 0, 15), circ(26, 0, 5), 'exteriores');
    expect(distancia(t.t1, t.t2)).toBeCloseTo(24, PREC);
    const [s] = tangentesComunes(circ(0, 0, 12), circ(25, 0, 8), 'interiores');
    expect(distancia(s.t1, s.t2)).toBeCloseTo(15, PREC);
  });
});

test.describe('Circunferencias tangentes por potencia (Apolonio)', () => {
  test('PPR: dos soluciones que pasan por A y B y distan de r lo que su radio', () => {
    const A = { x: 10, y: 5 };
    const B = { x: 13, y: 9 };
    const L1 = { x: 1, y: 13 };
    const L2 = { x: 23, y: 13 };
    const k = construirPPR(A, B, L1, L2);
    expect(k.soluciones).toBe(2);
    for (const s of k.circunferencias) {
      expect(distancia(s.centro, A)).toBeCloseTo(s.radio, PREC);
      expect(distancia(s.centro, B)).toBeCloseTo(s.radio, PREC);
      expect(distanciaARecta(s.centro, L1, L2)).toBeCloseTo(s.radio, PREC);
    }
  });

  test('PPR: MT es la media proporcional de MA y MB', () => {
    // A y B en la vertical x = 0, r el eje horizontal y = 0: M = (0, 0), MA = 2, MB = 8 → MT = 4.
    const k = construirPPR({ x: 0, y: -2 }, { x: 0, y: -8 }, { x: -10, y: 0 }, { x: 10, y: 0 });
    const mt = k.medidas.find((m) => m.etiqueta.startsWith('MT'));
    expect(mt?.valor).toBeCloseTo(4, PREC);
    const xs = k.circunferencias.map((s) => s.tangencia.x).sort((a, b) => a - b);
    expect(xs[0]).toBeCloseTo(-4, PREC);
    expect(xs[1]).toBeCloseTo(4, PREC);
  });

  test('PPR: los casos particulares y el imposible', () => {
    const L1 = { x: -10, y: 0 };
    const L2 = { x: 10, y: 0 };
    // AB paralela a r: una solución, tangente en el pie de la mediatriz.
    const paralela = construirPPR({ x: -2, y: -4 }, { x: 2, y: -4 }, L1, L2);
    expect(paralela.soluciones).toBe(1);
    expect(paralela.circunferencias[0].tangencia.x).toBeCloseTo(0, PREC);
    expect(distanciaARecta(paralela.circunferencias[0].centro, L1, L2)).toBeCloseTo(paralela.circunferencias[0].radio, PREC);
    // Un punto sobre r: una solución, tangente justo ahí.
    const sobre = construirPPR({ x: 3, y: 0 }, { x: 1, y: -4 }, L1, L2);
    expect(sobre.soluciones).toBe(1);
    expect(distancia(sobre.circunferencias[0].centro, { x: 1, y: -4 })).toBeCloseTo(sobre.circunferencias[0].radio, PREC);
    // A cada lado de r: ninguna.
    const cruzados = construirPPR({ x: 0, y: -3 }, { x: 1, y: 3 }, L1, L2);
    expect(cruzados.soluciones).toBe(0);
    expect(cruzados.aviso).not.toBeNull();
  });

  test('PPC: las soluciones pasan por A y B y son tangentes a la dada', () => {
    const configuraciones: [Punto, Punto, Circunferencia][] = [
      [{ x: 5, y: 4 }, { x: 8, y: 7 }, circ(15, 9, 3)], // los dos fuera
      [{ x: 1, y: 2 }, { x: -3, y: 1 }, circ(0, 0, 10)], // los dos dentro
      [{ x: -2, y: 5 }, { x: 2, y: 5 }, circ(0, 0, 2)], // simétrico: la mediatriz pasa por O
      [{ x: 2, y: 12 }, { x: 6, y: 13 }, circ(10, 6, 2.5)],
    ];
    for (const [A, B, c] of configuraciones) {
      const k = construirPPC(A, B, c);
      expect(k.soluciones, `A(${A.x},${A.y})`).toBe(2);
      for (const s of k.circunferencias) {
        expect(distancia(s.centro, A)).toBeCloseTo(s.radio, 5);
        expect(distancia(s.centro, B)).toBeCloseTo(s.radio, 5);
        const dc = distancia(s.centro, c.centro);
        const tangente = Math.min(Math.abs(dc - (s.radio + c.radio)), Math.abs(dc - Math.abs(s.radio - c.radio)));
        expect(tangente, `A(${A.x},${A.y})`).toBeLessThan(1e-5);
      }
    }
  });

  test('PPC: un punto dentro y otro fuera no tiene solución', () => {
    const k = construirPPC({ x: 0, y: 1 }, { x: 9, y: 0 }, circ(0, 0, 4));
    expect(k.soluciones).toBe(0);
    expect(k.aviso).not.toBeNull();
  });

  test('barrido: en una rejilla de posiciones, toda solución que sale cumple sus condiciones', () => {
    // La vista mueve los puntos de 0,5 en 0,5: esto recorre posiciones reales de la pantalla.
    const L1 = { x: 1, y: 13 };
    const L2 = { x: 23, y: 13 };
    const c = circ(15, 9, 3);
    let comprobadas = 0;
    for (let ax = 1; ax <= 23; ax += 2.5) {
      for (let ay = 1; ay <= 14; ay += 2.5) {
        const A = { x: ax, y: ay };
        const B = { x: 9, y: 6.5 };
        for (const s of construirPPR(A, B, L1, L2).circunferencias) {
          expect(distancia(s.centro, A)).toBeCloseTo(s.radio, 5);
          expect(distanciaARecta(s.centro, L1, L2)).toBeCloseTo(s.radio, 5);
          comprobadas++;
        }
        for (const s of construirPPC(A, B, c).circunferencias) {
          expect(distancia(s.centro, A)).toBeCloseTo(s.radio, 5);
          expect(distancia(s.centro, B)).toBeCloseTo(s.radio, 5);
          const dc = distancia(s.centro, c.centro);
          expect(Math.min(Math.abs(dc - (s.radio + c.radio)), Math.abs(dc - Math.abs(s.radio - c.radio)))).toBeLessThan(1e-5);
          comprobadas++;
        }
      }
    }
    expect(comprobadas).toBeGreaterThan(60);
  });
});

// ============================================
// CASOS DE AULA — las invariantes de /casos-aula-meskeia
// ============================================

test.describe('Los 12 casos numerados (lo que el profesor asigna)', () => {
  test('1 · hay exactamente 12, numerados del 1 al 12 sin huecos', () => {
    expect(TOTAL_CASOS).toBe(12);
    expect(CASOS.map((c) => c.id)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  });

  test('2 · son DETERMINISTAS', () => {
    const huella = () => CASOS.map((c) => `${c.enunciado}|${c.respuesta}`);
    expect(huella()).toEqual(huella());
  });

  test('3 · la respuesta coincide con recalcularla desde sus datos', () => {
    for (const c of CASOS) {
      const r = resolverCaso(c.datos, c.unidad);
      expect(r.error, `caso ${c.id}`).toBeNull();
      expect(r.valor, `caso ${c.id}`).toBeCloseTo(c.respuesta, 9);
    }
  });

  test('3.bis · las respuestas son las resueltas a mano', () => {
    const aMano = [64, -16, 12, 15, 6, 12, 60, 5.6, 3.2, 24, 15, 4];
    CASOS.forEach((c, i) => expect(c.respuesta, `caso ${c.id}`).toBeCloseTo(aMano[i], 9));
  });

  test('4 · cada caso tiene enunciado, etiqueta, respuesta finita y desarrollo', () => {
    for (const c of CASOS) {
      expect(c.enunciado.length, `caso ${c.id}`).toBeGreaterThan(40);
      expect(c.etiquetaRespuesta.length, `caso ${c.id}`).toBeGreaterThan(0);
      expect(Number.isFinite(c.respuesta), `caso ${c.id}`).toBe(true);
      expect(c.pasos.length, `caso ${c.id}`).toBeGreaterThanOrEqual(3);
      expect(c.pista.length, `caso ${c.id}`).toBeGreaterThan(5);
      for (const p of c.pasos) expect(p, `caso ${c.id}`).not.toMatch(/\bNaN\b|undefined/);
    }
  });

  test('4.bis · hay abstractos y aplicados, y están los tres bloques del tema', () => {
    const categorias = new Set(CASOS.map((c) => c.categoria));
    expect(categorias).toEqual(new Set(['abstracto', 'aplicado']));
    const tipos = new Set(CASOS.map((c) => c.datos.tipo));
    for (const t of ['potencia', 'tangente', 'eje-radical', 'comun-exterior', 'comun-interior', 'ppr']) expect(tipos.has(t as never), t).toBe(true);
  });

  test('5 · ningún enunciado nombra un país, una ciudad ni una moneda', () => {
    const prohibidas = /Madrid|Barcelona|Sevilla|Valencia|España|español|México|Bogotá|Lima|Buenos Aires|euros?\b|dólar|pesos (mexicanos|colombianos|argentinos|chilenos)/i;
    for (const c of CASOS) expect(prohibidas.test(`${c.titulo} ${c.enunciado}`), `caso ${c.id}`).toBe(false);
  });

  test('5.bis · la respuesta sale con dos decimales como mucho (no hay que redondear)', () => {
    for (const c of CASOS) expect(Math.round(c.respuesta * 100) / 100, `caso ${c.id}`).toBeCloseTo(c.respuesta, 9);
  });

  test('7 · el convenio: potencia con signo y eje medido desde la primera circunferencia', () => {
    expect(CASOS[1].respuesta).toBe(-16); // interior → negativa
    expect(CASOS[7].respuesta).toBeCloseTo(5.6, 9); // desde la de 4 cm, no 4,4
    expect(cifra(5.6)).toBe('5,6');
    expect(cifra(64)).toBe('64');
  });
});

test.describe('Corrección de la respuesta del alumno', () => {
  test('el acierto y el redondeo razonable valen', () => {
    expect(comprobarRespuesta(12, CASOS[2]).estado).toBe('acierto');
    expect(comprobarRespuesta(12.05, CASOS[2]).estado).toBe('acierto');
    expect(comprobarRespuesta(-16, CASOS[1]).estado).toBe('acierto');
  });

  test('los errores típicos del tema tienen nombre propio', () => {
    expect(comprobarRespuesta(144, CASOS[2]).motivo).toBe('sin-raiz'); // dio la potencia
    expect(comprobarRespuesta(16, CASOS[1]).motivo).toBe('signo');
    expect(comprobarRespuesta(4.4, CASOS[7]).motivo).toBe('desde-el-otro-centro');
    expect(comprobarRespuesta(Math.sqrt(26 ** 2 - 20 ** 2), CASOS[9]).motivo).toBe('formula-cambiada');
    expect(comprobarRespuesta(Math.sqrt(25 ** 2 - 4 ** 2), CASOS[10]).motivo).toBe('formula-cambiada');
    for (const texto of Object.values(TEXTO_MOTIVO)) expect(texto.length).toBeGreaterThan(10);
  });

  test('una longitud negativa es imposible y una entrada vacía no es un fallo', () => {
    const v = comprobarRespuesta(-12, CASOS[2]);
    expect(v.estado).toBe('imposible');
    expect(v.motivo).toBe('negativa');
    expect(comprobarRespuesta(NaN, CASOS[2]).estado).toBe('no-numerico');
  });

  test('un planteamiento equivocado es un fallo sin motivo inventado', () => {
    const v = comprobarRespuesta(18, CASOS[2]);
    expect(v.estado).toBe('fallo');
    expect(v.motivo).toBeNull();
  });
});

test.describe('6 · Modo práctica aleatorio', () => {
  test('la misma semilla da el mismo ejercicio', () => {
    const a = generarEjercicioAleatorio(2026);
    const b = generarEjercicioAleatorio(2026);
    expect(b.caso.enunciado).toBe(a.caso.enunciado);
    expect(b.caso.respuesta).toBe(a.caso.respuesta);
  });

  test('es VARIADO: en 40 semillas salen muchas respuestas y varios tipos', () => {
    const respuestas = new Set<number>();
    const tipos = new Set<string>();
    for (let s = 1; s <= 40; s++) {
      const e = generarEjercicioAleatorio(s);
      respuestas.add(e.caso.respuesta);
      tipos.add(e.caso.datos.tipo);
    }
    expect(respuestas.size).toBeGreaterThanOrEqual(10);
    expect(tipos.size).toBeGreaterThanOrEqual(5);
  });

  test('usa la MISMA aritmética que los fijos y sale limpio en 200 semillas', () => {
    for (let s = 1; s <= 200; s++) {
      const e = generarEjercicioAleatorio(s);
      const r = resolverCaso(e.caso.datos, e.caso.unidad);
      expect(r.ok, `semilla ${s}`).toBe(true);
      expect(r.valor, `semilla ${s}`).toBeCloseTo(e.caso.respuesta, 9);
      expect(Math.round(e.caso.respuesta * 100) / 100, `semilla ${s}`).toBeCloseTo(e.caso.respuesta, 9);
      expect(e.caso.enunciado, `semilla ${s}`).not.toMatch(/\bNaN\b|undefined/);
      expect(comprobarRespuesta(e.caso.respuesta, e.caso).estado, `semilla ${s}`).toBe('acierto');
    }
  });
});

// ============================================
// EN EL NAVEGADOR — transiciones de estado (PASO 4.bis de /nueva-app-meskeia)
// La app tiene pestañas, una construcción que avanza paso a paso y datos que se mueven con el
// teclado: lo que se comprueba aquí son esas transiciones, no la geometría (ya probada arriba).
// Datos iniciales de la pestaña Potencia: O(8; 7,5), r = 4, P(17; 4) →
//   d² = 9² + 3,5² = 93,25 → potencia 93,25 − 16 = 77,25 cm².
//   Con P una casilla (0,5 cm) a la izquierda, P(16,5; 4): d² = 72,25 + 12,25 = 84,5 → 68,50 cm².
// ============================================

test.describe('En el navegador', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/simulador-tangencias-potencia/');
    await esperarHidratacion(page, ['#radio-potR']);
  });

  const medida = (page: import('@playwright/test').Page, etiqueta: string) =>
    page.locator('dl').locator('div', { has: page.locator('dt', { hasText: etiqueta }) }).locator('dd');

  test('arranca en Potencia con la construcción completa y la potencia de los datos iniciales', async ({ page }) => {
    await expect(page.getByRole('tab', { name: 'Potencia' })).toHaveAttribute('aria-selected', 'true');
    await expect(medida(page, 'Potencia d² − r²')).toHaveText('77,25 cm²');
    await expect(page.getByText(/^Paso 4 de 4$/)).toBeVisible();
  });

  test('las flechas mueven el punto P y la potencia se recalcula', async ({ page }) => {
    await page.getByRole('button', { name: /^Punto P,/ }).focus();
    await page.keyboard.press('ArrowLeft');
    await expect(medida(page, 'Potencia d² − r²')).toHaveText('68,50 cm²');
  });

  test('los pasos avanzan, retroceden y vuelven a la construcción completa', async ({ page }) => {
    await page.getByRole('button', { name: 'Empezar desde el paso 1' }).click();
    await expect(page.getByText(/^Paso 1 de 4$/)).toBeVisible();
    await page.getByRole('button', { name: /Siguiente/ }).click();
    await expect(page.getByText(/^Paso 2 de 4$/)).toBeVisible();
    await page.getByRole('button', { name: /Anterior/ }).click();
    await expect(page.getByText(/^Paso 1 de 4$/)).toBeVisible();
    await page.getByRole('button', { name: 'Ver la construcción completa' }).click();
    await expect(page.getByText(/^Paso 4 de 4$/)).toBeVisible();
  });

  test('cambiar de pestaña cambia la construcción y sus medidas', async ({ page }) => {
    await page.getByRole('tab', { name: 'Tangentes desde un punto' }).click();
    // P(19; 5), O(8; 7,5), r = 4: d² = 121 + 6,25 = 127,25 → PT = √111,25 = 10,55 cm.
    await expect(medida(page, 'Tangente PT')).toHaveText('10,55 cm');
    await expect(medida(page, 'Soluciones')).toHaveText('2');
    await page.getByRole('tab', { name: 'Tangentes comunes' }).click();
    await page.getByRole('button', { name: /Interiores/ }).click();
    await expect(page.getByRole('button', { name: /Interiores/ })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('heading', { name: 'Las tangentes interiores' }).or(page.getByText('Las tangentes interiores'))).toBeVisible();
  });

  test('un caso se corrige, nombra el error típico y cuenta los resueltos', async ({ page }) => {
    await page.getByRole('tab', { name: 'Casos para clase' }).click();
    const campo = page.locator('#respuesta-3');
    await campo.fill('144');
    await esperarValorEnReact(page, '#respuesta-3', '144');
    const tarjeta = page.locator('article', { has: campo });
    await tarjeta.getByRole('button', { name: 'Comprobar' }).click();
    await expect(tarjeta.getByRole('alert')).toContainText('Has dado el cuadrado');
    await campo.fill('12');
    await esperarValorEnReact(page, '#respuesta-3', '12');
    await tarjeta.getByRole('button', { name: 'Comprobar' }).click();
    await expect(tarjeta.getByRole('alert')).toContainText('¡Correcto!');
    await expect(page.getByText('Has resuelto 1 de 12')).toBeVisible();
  });
});
