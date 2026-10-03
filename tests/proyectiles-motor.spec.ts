/**
 * Tests unitarios del motor de simulador-proyectiles
 *
 * Ejecutar: npx playwright test tests/proyectiles-motor.spec.ts
 *
 * Valores resueltos a mano con las fórmulas del tiro parabólico, no leídos de la app:
 *
 *   v₀ = 20 m/s · θ = 45° · h₀ = 0 · g = 9,81
 *     v0x = v0y = 20·cos45° = 14,1421 m/s
 *     T = 2·v0y/g = 28,2843/9,81 = 2,8832 s
 *     Alcance = v₀²·sen(2θ)/g = 400·1/9,81 = 40,7747 m
 *     h_máx = v0y²/(2g) = 200/19,62 = 10,1937 m
 *
 *   v₀ = 50 m/s · θ = 45° · h₀ = 0 · g = 9,81
 *     T = 2·35,3553/9,81 = 7,2080 s · Alcance = 2500/9,81 = 254,8420 m · h_máx = 63,7105 m
 *
 *   Tiro vertical (θ = 90°, v₀ = 20): alcance EXACTAMENTE 0 · T = 40/9,81 = 4,0775 s
 *     h_máx = 400/19,62 = 20,3874 m
 *
 *   Desde altura (h₀ = 20, v₀ = 20, θ = 45°)
 *     discriminante = v0y² + 2·g·h₀ = 200 + 392,4 = 592,4 → √ = 24,3392
 *     T = (14,1421 + 24,3392)/9,81 = 3,9226 s · Alcance = 14,1421·3,9226 = 55,4749 m
 *
 * El hallazgo 984 (crítico) era que vaciar el campo de gravedad colgaba la pestaña: con
 * g = 0, T = Infinity, pasos = Infinity y dtMuestreo = NaN, y el bucle no terminaba nunca.
 * El 985, que una gravedad negativa daba alcance y tiempo negativos sin ningún aviso.
 *
 * CON ROZAMIENTO (F = −k·|v|·v⃗) no hay fórmula cerrada. Los valores de abajo NO salen del motor:
 * salen de un RK4 de paso FIJO 10⁻⁵ s escrito aparte (impacto por interpolación lineal en el
 * último paso), cuyo resultado coincide con el de la inspección del 03/10/2026 (dt = 10⁻⁴ y
 * 10⁻⁵ s iguales en 5 decimales). Hasta esa fecha estos goldens eran la salida del Euler de la
 * app con dt = 0,01 s (31,26 · 17,33 m), que se apartaba hasta 20 cm (hallazgo 2754):
 *
 *   v₀ = 20, θ = 45°, g = 9,81 · k = 0      → R 40,77472 · H 10,19368 · T 2,88321 · v 20,00000
 *                                k = 0,01   → R 31,32293 · H  8,78272 · T 2,67329 · v 15,71766
 *                                k = 0,02   → R 25,83443 · H  7,80640 · T 2,51584
 *                                k = 0,05   → R 17,52553 · H  6,03505 · T 2,20178 · v 10,24719
 *                                             (vértice a 1,0009 s: sube en 1,00 s, baja en 1,20 s)
 *   v₀ = 100, θ = 45°, k = 0,05             → R 45,96040 · H 24,44121 · T 4,36236
 *   v₀ = 100, k = 0,05, θ = 27/30/35/40°    → R 50,88806 · 50,73746 · 49,84839 · 48,23635
 *   v₀ = 100, θ = 45°, g = 0,1, k = 0,001   → R 2571,14137 · T 333,40446 (paso 10⁻³ s)
 *
 * El hallazgo 2753 era que un vuelo de más de 200 s se cortaba y el punto en el aire se daba
 * como impacto: con k = 0, g = 0,5 y v₀ = 100 la verdad es la del tiro ideal, R = v₀²/g =
 * 20.000 m y T = 2·70,710678/0,5 = 282,842712 s.
 */

import { test, expect } from '@playwright/test';
import {
  calcularAnguloOptimo,
  calcularTrayectoria,
  validarParametros,
  nuevoId,
  RESISTENCIA_POR_DEFECTO,
  type ParametrosSimulacion,
} from '../app/simulador-proyectiles/motor';

const BASE: ParametrosSimulacion = {
  v0: 20,
  angulo: 45,
  altura: 0,
  gravedad: 9.81,
  resistencia: 0,
  conResistencia: false,
};

/** Calcula y falla el test si el motor rechaza, en vez de devolver undefined. */
function lanzar(p: Partial<ParametrosSimulacion> = {}) {
  const r = calcularTrayectoria({ ...BASE, ...p });
  if (!r.ok) throw new Error(`el motor rechazó el lanzamiento: ${r.error}`);
  return r.lanzamiento;
}

test.describe('El tiro ideal, contra las fórmulas de libro', () => {
  test('v₀ = 20 m/s a 45°: 40,77 m en 2,88 s, con 10,19 m de altura máxima', () => {
    const l = lanzar();
    expect(l.alcance).toBeCloseTo(40.7747, 3);
    expect(l.tiempoVuelo).toBeCloseTo(2.8832, 3);
    expect(l.alturaMax).toBeCloseTo(10.1937, 3);
    // Sin rozamiento, la velocidad de impacto iguala a la de salida.
    expect(l.vImpacto).toBeCloseTo(20, 2);
  });

  test('v₀ = 50 m/s a 45°: 254,84 m en 7,21 s', () => {
    const l = lanzar({ v0: 50 });
    expect(l.alcance).toBeCloseTo(254.842, 2);
    expect(l.tiempoVuelo).toBeCloseTo(7.208, 3);
    expect(l.alturaMax).toBeCloseTo(63.7105, 3);
  });

  test('desde 20 m de altura el vuelo dura más y llega más lejos', () => {
    const l = lanzar({ altura: 20 });
    expect(l.tiempoVuelo).toBeCloseTo(3.9226, 3);
    expect(l.alcance).toBeCloseTo(55.4749, 3);
  });

  test('30° y 60° dan el mismo alcance: sen(60°) = sen(120°)', () => {
    expect(lanzar({ angulo: 30 }).alcance).toBeCloseTo(lanzar({ angulo: 60 }).alcance, 6);
  });
});

test.describe('Hallazgo 989 — el tiro vertical tiene alcance CERO, no un infinitésimo', () => {
  test('θ = 90° da exactamente 0, no 1,2·10⁻¹⁵', () => {
    const l = lanzar({ angulo: 90 });
    expect(l.alcance).toBe(0); // exactamente cero, no «≈0»
    expect(l.tiempoVuelo).toBeCloseTo(4.0775, 3);
    expect(l.alturaMax).toBeCloseTo(20.3874, 3);
  });

  test('θ = 0° tampoco deja un infinitésimo en la vertical', () => {
    const l = lanzar({ angulo: 0, altura: 20 });
    // Sin componente vertical, cae desde 20 m: t = √(2h/g) = √(40/9,81) = 2,0194 s
    expect(l.tiempoVuelo).toBeCloseTo(2.0194, 3);
    expect(l.alturaMax).toBe(20);
  });
});

test.describe('Hallazgo 984 (crítico) — una gravedad no calculable se rechaza, no cuelga', () => {
  test('el campo vacío (g = NaN) se rechaza con mensaje', () => {
    const r = calcularTrayectoria({ ...BASE, gravedad: NaN });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toContain('gravedad');
  });

  test('g = 0 se rechaza: es el valor que producía el bucle infinito', () => {
    const r = calcularTrayectoria({ ...BASE, gravedad: 0 });
    expect(r.ok).toBe(false);
  });

  test('el cálculo termina, y rápido, con los parámetros extremos permitidos', () => {
    const inicio = Date.now();
    const l = lanzar({ v0: 200, angulo: 89, altura: 100, gravedad: 0.1 });
    expect(Date.now() - inicio).toBeLessThan(1000);
    // Y el muestreo está acotado: sin tope serían 4 millones de puntos.
    expect(l.trayectoria.length).toBeLessThanOrEqual(4001);
  });
});

test.describe('Hallazgo 985 (alto) — una gravedad negativa no produce cifras negativas', () => {
  test('g = −9,81 se rechaza en vez de devolver −40,77 m', () => {
    const r = calcularTrayectoria({ ...BASE, gravedad: -9.81 });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toContain('0,1 m/s²');
  });

  test('validarParametros nombra cada límite', () => {
    expect(validarParametros({ ...BASE, v0: 0 })).toContain('velocidad');
    expect(validarParametros({ ...BASE, angulo: 120 })).toContain('ángulo');
    expect(validarParametros({ ...BASE, altura: -5 })).toContain('altura');
    expect(validarParametros({ ...BASE, gravedad: 100 })).toContain('gravedad');
    expect(validarParametros(BASE)).toBeNull();
  });

  test('la Luna, Marte y Júpiter siguen siendo válidas', () => {
    expect(lanzar({ gravedad: 1.62 }).alcance).toBeCloseTo(400 / 1.62, 2);
    expect(lanzar({ gravedad: 3.71 }).alcance).toBeCloseTo(400 / 3.71, 2);
    expect(lanzar({ gravedad: 24.79 }).alcance).toBeCloseTo(400 / 24.79, 2);
  });
});

test.describe('Hallazgo 987 — con resistencia, el rozamiento se nota', () => {
  test('el k por defecto recorta el alcance a simple vista', () => {
    const ideal = lanzar().alcance; // 40,77 m
    const conRozamiento = lanzar({
      conResistencia: true,
      resistencia: RESISTENCIA_POR_DEFECTO,
    }).alcance;
    expect(conRozamiento).toBeLessThan(ideal * 0.9);
    // Era 31,26 (Euler, dt = 0,01 s): la verdad del modelo es 31,32293 (cabecera).
    expect(conRozamiento).toBeCloseTo(31.32293, 3);
  });

  test('a más k, menos alcance, y siempre por debajo del ideal', () => {
    const alcances = [0.01, 0.02, 0.05].map(
      (k) => lanzar({ conResistencia: true, resistencia: k }).alcance,
    );
    expect(alcances[0]).toBeGreaterThan(alcances[1]);
    expect(alcances[1]).toBeGreaterThan(alcances[2]);
    // Era 17,33 (Euler): la verdad del modelo es 17,52553 (cabecera).
    expect(alcances[2]).toBeCloseTo(17.52553, 3);
  });

  test('con rozamiento el proyectil llega más despacio de lo que salió', () => {
    const l = lanzar({ conResistencia: true, resistencia: RESISTENCIA_POR_DEFECTO });
    expect(l.vImpacto).toBeLessThan(20);
  });
});

test.describe('Hallazgo 2754 — con rozamiento, RK4 contra una referencia independiente', () => {
  const conK = (k: number, extra: Partial<ParametrosSimulacion> = {}) =>
    lanzar({ conResistencia: true, resistencia: k, ...extra });

  test('con k = 0 da EXACTAMENTE el tiro ideal: 40,77472 m · 10,19368 m · 20 m/s', () => {
    const l = conK(0);
    expect(l.alcance).toBeCloseTo(40.77472, 4);
    expect(l.alturaMax).toBeCloseTo(10.19368, 4);
    expect(l.tiempoVuelo).toBeCloseTo(2.88321, 4);
    expect(l.vImpacto).toBeCloseTo(20, 4);
  });

  test('k = 0,05: 17,52553 m · 6,03505 m · 2,20178 s · 10,24719 m/s', () => {
    const l = conK(0.05);
    expect(l.alcance).toBeCloseTo(17.52553, 4);
    expect(l.alturaMax).toBeCloseTo(6.03505, 4);
    expect(l.tiempoVuelo).toBeCloseTo(2.20178, 4);
    expect(l.vImpacto).toBeCloseTo(10.24719, 4);
  });

  test('k = 0,02: 25,83443 m en 2,51584 s', () => {
    const l = conK(0.02);
    expect(l.alcance).toBeCloseTo(25.83443, 4);
    expect(l.tiempoVuelo).toBeCloseTo(2.51584, 4);
  });

  test('v₀ = 100, k = 0,05: 45,96040 m (Euler daba 44,82)', () => {
    const l = conK(0.05, { v0: 100 });
    expect(l.alcance).toBeCloseTo(45.9604, 3);
    expect(l.alturaMax).toBeCloseTo(24.44121, 3);
    expect(l.tiempoVuelo).toBeCloseTo(4.36236, 3);
  });

  test('con rozamiento la bajada dura MÁS que la subida (hallazgo 2761)', () => {
    const l = conK(0.05);
    const vertice = l.trayectoria.reduce((m, p) => (p.y > m.y ? p : m), l.trayectoria[0]);
    // Subida 1,0009 s, bajada 2,20178 − 1,0009 = 1,2009 s
    expect(vertice.t).toBeCloseTo(1.0009, 3);
    expect(l.tiempoVuelo - vertice.t).toBeGreaterThan(vertice.t);
  });

  test('el último punto de la trayectoria está en el suelo y es el impacto publicado', () => {
    const l = conK(0.05, { v0: 100 });
    const ultimo = l.trayectoria[l.trayectoria.length - 1];
    expect(ultimo.y).toBe(0);
    expect(ultimo.x).toBe(l.alcance);
    expect(ultimo.t).toBe(l.tiempoVuelo);
    expect(l.trayectoria.length).toBeLessThanOrEqual(4001);
  });
});

test.describe('Hallazgo 2753 — un vuelo largo llega al suelo, no se corta a los 200 s', () => {
  test('g = 0,5, v₀ = 100, k = 0: 20.000 m en 282,842712 s, como sin rozamiento', () => {
    const l = lanzar({ v0: 100, gravedad: 0.5, conResistencia: true, resistencia: 0 });
    expect(l.tiempoVuelo).toBeCloseTo(282.842712, 4);
    expect(l.alcance).toBeCloseTo(20000, 2);
    expect(l.vImpacto).toBeCloseTo(100, 4);
  });

  test('g = 0,1, v₀ = 100, k = 0,001: 2571,14 m en 333,40 s (antes 2270,86 m en 200,01 s)', () => {
    const l = lanzar({ v0: 100, gravedad: 0.1, conResistencia: true, resistencia: 0.001 });
    expect(l.tiempoVuelo).toBeCloseTo(333.40446, 2);
    expect(l.alcance).toBeCloseTo(2571.14137, 2);
  });

  test('el peor caso de los límites (g = 0,1, v₀ = 200, 90°, h₀ = 100, k = 0) termina en el suelo y rápido', () => {
    // T = (200 + √(200² + 2·0,1·100))/0,1 = (200 + 200,049994)/0,1 = 4000,49994 s
    const inicio = Date.now();
    const l = lanzar({ v0: 200, angulo: 90, altura: 100, gravedad: 0.1, conResistencia: true, resistencia: 0 });
    expect(Date.now() - inicio).toBeLessThan(1000);
    expect(l.tiempoVuelo).toBeCloseTo(4000.49994, 3);
    expect(l.alcance).toBe(0);
  });

  test('y con el rozamiento máximo en esos extremos también', () => {
    const inicio = Date.now();
    const r = calcularTrayectoria({
      ...BASE, v0: 200, angulo: 89, altura: 100, gravedad: 0.1, conResistencia: true, resistencia: 0.05,
    });
    expect(Date.now() - inicio).toBeLessThan(1000);
    expect(r.ok).toBe(true);
    if (r.ok) {
      const ultimo = r.lanzamiento.trayectoria[r.lanzamiento.trayectoria.length - 1];
      expect(ultimo.y).toBe(0);
      // Cae a la velocidad límite √(g/k) = √2 = 1,41421 m/s
      expect(r.lanzamiento.vImpacto).toBeCloseTo(Math.SQRT2, 3);
    }
  });
});

test.describe('Hallazgo 2762 — el ángulo de máximo alcance de cada caso', () => {
  test('desde el suelo y sin rozamiento, 45°', () => {
    const o = calcularAnguloOptimo(BASE)!;
    expect(o.angulo).toBeCloseTo(45, 6);
    expect(o.alcance).toBeCloseTo(40.77472, 4);
    expect(o.metodo).toBe('analitico');
  });

  test('desde 30 m con 20 m/s: tan θ = v₀/√(v₀² + 2gh₀) → 32,46°, R = 64,102 m', () => {
    // θ = atan(20/√988,6) = atan(0,636094) = 32,4590° · R = (v₀/g)·√(v₀² + 2gh₀) = 2,038736·31,442010 = 64,1020 m
    const o = calcularAnguloOptimo({ ...BASE, altura: 30 })!;
    expect(o.angulo).toBeCloseTo(32.459, 2);
    expect(o.alcance).toBeCloseTo(64.102, 3);
  });

  test('con k = 0,05 y 100 m/s el óptimo baja a 27°, no a «35-40°»', () => {
    // Referencia: 50,88806 m a 27° frente a 50,73746 a 30°, 49,84839 a 35° y 48,23635 a 40°
    const o = calcularAnguloOptimo({ ...BASE, v0: 100, conResistencia: true, resistencia: 0.05 })!;
    expect(o.metodo).toBe('numerico');
    expect(o.angulo).toBeGreaterThan(26.5);
    expect(o.angulo).toBeLessThan(27.5);
    expect(o.alcance).toBeGreaterThanOrEqual(50.888);
    expect(o.alcance).toBeLessThan(50.9);
  });

  test('con parámetros no calculables no hay óptimo', () => {
    expect(calcularAnguloOptimo({ ...BASE, gravedad: 0 })).toBeNull();
  });
});

test.describe('Hallazgo 986 — cada lanzamiento guardado tiene identidad propia', () => {
  test('dos identificadores seguidos no coinciden', () => {
    const ids = new Set(Array.from({ length: 50 }, () => nuevoId()));
    expect(ids.size).toBe(50);
  });

  test('dos cálculos con los mismos parámetros dan ids distintos', () => {
    expect(lanzar().id).not.toBe(lanzar().id);
  });
});
