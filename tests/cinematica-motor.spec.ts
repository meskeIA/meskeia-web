import { test, expect } from '@playwright/test';
import {
  G,
  posicion,
  velocidad,
  instanteParada,
  distanciaRecorrida,
  resolverRectilineo,
  muestrear,
  rangoPosicion,
  marcasEje,
  resolverParabolico,
} from '../app/calculadora-movimiento/motor';

/**
 * Motor de calculadora-movimiento (S0179) — casos resueltos A MANO antes de la vista.
 *
 * El caso que motivó separar el motor es el de «frena, se para y vuelve»: la app imprimía
 * el desplazamiento con la etiqueta «Distancia». Cada caso lleva su cuenta en el comentario.
 */

test.describe('MRU (a = 0)', () => {
  test('v = 10 m/s durante 5 s → 50 m, sin parada', () => {
    const r = resolverRectilineo({ v0: 10, a: 0 }, 5);
    expect(r.desplazamiento).toBe(50);
    expect(r.distancia).toBe(50);
    expect(r.velocidadFinal).toBe(10);
    expect(r.tParada).toBeNull();
  });

  test('v = −4 m/s durante 3 s → desplazamiento −12 m, distancia 12 m', () => {
    const r = resolverRectilineo({ v0: -4, a: 0 }, 3);
    expect(r.desplazamiento).toBe(-12);
    expect(r.distancia).toBe(12);
  });
});

test.describe('MRUA', () => {
  test('parte del reposo, a = 3 m/s², t = 8 s → 96 m y 24 m/s (ejemplo de examen de la página)', () => {
    // d = ½·3·64 = 96 · v = 3·8 = 24
    const r = resolverRectilineo({ v0: 0, a: 3 }, 8);
    expect(r.desplazamiento).toBe(96);
    expect(r.distancia).toBe(96);
    expect(r.velocidadFinal).toBe(24);
    expect(r.tParada).toBeNull();
  });

  test('frena de 30 m/s a −5 m/s² y se para JUSTO en t = 6 s → 90 m, sin vuelta', () => {
    // tp = 30/5 = 6 = t · x = 180 − 90 = 90
    const r = resolverRectilineo({ v0: 30, a: -5 }, 6);
    expect(r.desplazamiento).toBe(90);
    expect(r.distancia).toBe(90);
    expect(r.velocidadFinal).toBe(0);
    expect(r.tParada).toBeNull();
  });

  test('frena de 20 m/s a −5 m/s², se para en t = 4 s y vuelve: a los 6 s, desplazamiento 30 m y distancia 50 m', () => {
    // tp = 20/5 = 4 · x(4) = 80 − 40 = 40 · x(6) = 120 − 90 = 30
    // distancia = 40 (ida) + 10 (vuelta) = 50 · v(6) = 20 − 30 = −10
    const r = resolverRectilineo({ v0: 20, a: -5 }, 6);
    expect(r.desplazamiento).toBe(30);
    expect(r.distancia).toBe(50);
    expect(r.velocidadFinal).toBe(-10);
    expect(r.tParada).toBe(4);
    expect(r.xParada).toBe(40);
  });

  test('acelera en el mismo sentido que v₀ → no hay parada', () => {
    expect(instanteParada({ v0: 5, a: 2 })).toBeNull();
    expect(instanteParada({ v0: -5, a: -2 })).toBeNull();
  });

  test('parte del reposo con a ≠ 0 → no hay parada (no «se para» en t = 0)', () => {
    expect(instanteParada({ v0: 0, a: -3 })).toBeNull();
  });

  test('v₀ = −6 m/s, a = +2 m/s², t = 5 s → para en 3 s a −9 m, acaba en −5 m, recorre 13 m', () => {
    // tp = 6/2 = 3 · x(3) = −18 + 9 = −9 · x(5) = −30 + 25 = −5
    // distancia = 9 + 4 = 13 · v(5) = −6 + 10 = 4
    const r = resolverRectilineo({ v0: -6, a: 2 }, 5);
    expect(r.tParada).toBe(3);
    expect(r.xParada).toBe(-9);
    expect(r.desplazamiento).toBe(-5);
    expect(r.distancia).toBe(13);
    expect(r.velocidadFinal).toBe(4);
  });
});

test.describe('Caída libre (eje positivo hacia abajo, a = g)', () => {
  test('se suelta (v₀ = 0) y cae 2 s → 19,62 m y 19,62 m/s', () => {
    // h = ½·9,81·4 = 19,62 · v = 9,81·2 = 19,62
    const r = resolverRectilineo({ v0: 0, a: G }, 2);
    expect(r.desplazamiento).toBeCloseTo(19.62, 10);
    expect(r.velocidadFinal).toBeCloseTo(19.62, 10);
  });

  test('lanzado hacia arriba a 10 m/s, a los 3 s: sube 5,097 m, acaba 14,145 m por debajo, recorre 24,339 m', () => {
    // tp = 10/9,81 = 1,01937 · subida = v₀²/(2g) = 100/19,62 = 5,09684
    // x(3) = −30 + ½·9,81·9 = −30 + 44,145 = 14,145
    // distancia = 5,09684 (subida) + 5,09684 + 14,145 (bajada) = 24,33868
    const r = resolverRectilineo({ v0: -10, a: G }, 3);
    expect(r.tParada).toBeCloseTo(1.01937, 4);
    expect(r.xParada).toBeCloseTo(-5.09684, 4);
    expect(r.desplazamiento).toBeCloseTo(14.145, 10);
    expect(r.distancia).toBeCloseTo(24.33868, 4);
  });
});

test.describe('Funciones sueltas', () => {
  test('posición y velocidad coinciden con las fórmulas en un instante intermedio', () => {
    // x(2,5) = 3·2,5 + ½·(−2)·6,25 = 7,5 − 6,25 = 1,25 · v(2,5) = 3 − 5 = −2
    expect(posicion({ v0: 3, a: -2 }, 2.5)).toBeCloseTo(1.25, 12);
    expect(velocidad({ v0: 3, a: -2 }, 2.5)).toBeCloseTo(-2, 12);
  });

  test('distancia recorrida antes de la parada = |desplazamiento|', () => {
    expect(distanciaRecorrida({ v0: 20, a: -5 }, 3)).toBe(Math.abs(posicion({ v0: 20, a: -5 }, 3)));
  });
});

test.describe('Muestreo para las gráficas', () => {
  test('sin parada: n + 1 muestras de 0 a T', () => {
    const m = muestrear({ v0: 0, a: 2 }, 10, 10);
    expect(m).toHaveLength(11);
    expect(m[0]).toEqual({ t: 0, x: 0, v: 0 });
    expect(m[10]).toEqual({ t: 10, x: 100, v: 20 });
  });

  test('con parada dentro: añade la muestra exacta del vértice, en orden', () => {
    // v₀ = 20, a = −5, T = 6, n = 4 → t = 0; 1,5; 3; 4,5; 6 + la parada en 4
    const m = muestrear({ v0: 20, a: -5 }, 6, 4);
    expect(m).toHaveLength(6);
    expect(m.map(s => s.t)).toEqual([0, 1.5, 3, 4, 4.5, 6]);
    expect(m[3]).toEqual({ t: 4, x: 40, v: 0 });
    expect(Math.max(...m.map(s => s.x))).toBe(40);
  });

  test('T no válido → sin muestras', () => {
    expect(muestrear({ v0: 1, a: 0 }, 0)).toEqual([]);
    expect(muestrear({ v0: 1, a: 0 }, NaN)).toEqual([]);
  });

  test('rango de la pista incluye el punto de vuelta y el origen', () => {
    expect(rangoPosicion({ v0: 20, a: -5 }, 6)).toEqual([0, 40]);
    expect(rangoPosicion({ v0: -6, a: 2 }, 5)).toEqual([-9, 0]);
    // Retrocede por detrás del origen: v₀ = 4, a = −2, T = 6 → para en 2 s a 4 m, x(6) = 24 − 36 = −12
    expect(rangoPosicion({ v0: 4, a: -2 }, 6)).toEqual([-12, 4]);
  });
});

test.describe('Marcas de los ejes', () => {
  test('0 a 96 → paso 25, de 0 a 100', () => {
    // bruto = 96/4 = 24 → potencia 10 → 25 es el primero ≥ 24
    expect(marcasEje(0, 96)).toEqual({ min: 0, max: 100, marcas: [0, 25, 50, 75, 100] });
  });

  test('−10 a 20 → paso 10, incluye el cero', () => {
    // bruto = 30/4 = 7,5 → 10
    expect(marcasEje(-10, 20)).toEqual({ min: -10, max: 20, marcas: [-10, 0, 10, 20] });
  });

  test('recta horizontal (a = 3 constante) → abre un margen alrededor', () => {
    const e = marcasEje(3, 3);
    expect(e.min).toBeLessThan(3);
    expect(e.max).toBeGreaterThan(3);
    expect(e.marcas).toContain(3);
  });

  test('todo cero (a = 0) → margen de ±1 y sin «−0»', () => {
    const e = marcasEje(0, 0);
    expect(e.marcas).toContain(0);
    expect(e.marcas.some(m => Object.is(m, -0))).toBe(false);
    expect(e.min).toBeLessThan(0);
    expect(e.max).toBeGreaterThan(0);
  });

  test('decimales sin arrastre de coma flotante', () => {
    const e = marcasEje(0, 0.3);
    // bruto = 0,075 → potencia 0,01 → 0,1 es el primero ≥ 0,075
    expect(e.marcas).toEqual([0, 0.1, 0.2, 0.3]);
  });
});

test.describe('Tiro parabólico', () => {
  test('20 m/s a 45° → alcance 400/9,81 = 40,77 m, altura 10,19 m, vuelo 2,883 s', () => {
    // vy = vx = 20·√2/2 = 14,1421 · T = 2·14,1421/9,81 = 2,88321
    // H = 200/19,62 = 10,19368 · R = v₀²·sen(90°)/g = 400/9,81 = 40,77472
    const r = resolverParabolico(20, 45);
    expect(r.alcance).toBeCloseTo(40.77472, 4);
    expect(r.alturaMaxima).toBeCloseTo(10.19368, 4);
    expect(r.tiempoVuelo).toBeCloseTo(2.88321, 4);
  });

  test('30° y 60° dan el mismo alcance (lo dice la FAQ de la página)', () => {
    expect(resolverParabolico(15, 30).alcance).toBeCloseTo(resolverParabolico(15, 60).alcance, 10);
  });
});
