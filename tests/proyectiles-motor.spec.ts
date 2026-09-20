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
 */

import { test, expect } from '@playwright/test';
import {
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
    expect(conRozamiento).toBeCloseTo(31.26, 1);
  });

  test('a más k, menos alcance, y siempre por debajo del ideal', () => {
    const alcances = [0.01, 0.02, 0.05].map(
      (k) => lanzar({ conResistencia: true, resistencia: k }).alcance,
    );
    expect(alcances[0]).toBeGreaterThan(alcances[1]);
    expect(alcances[1]).toBeGreaterThan(alcances[2]);
    expect(alcances[2]).toBeCloseTo(17.33, 1);
  });

  test('con rozamiento el proyectil llega más despacio de lo que salió', () => {
    const l = lanzar({ conResistencia: true, resistencia: RESISTENCIA_POR_DEFECTO });
    expect(l.vImpacto).toBeLessThan(20);
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
