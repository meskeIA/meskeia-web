/**
 * Tests unitarios del motor de simulador-mas-resorte
 *
 * Ejecutar: npx playwright test tests/mas-resorte-motor.spec.ts
 *
 * Oscilador amortiguado m·x″ + γ·x′ + k·x = 0, con x(0) = A y v(0) = 0 (las condiciones
 * que la propia app declara en el PASO 3 de su bloque educativo). Con β = γ/(2m):
 *
 *   m = 1 kg · k = 10 N/m · γ = 2 → β = 1 · ω₀ = √10 = 3,162278 · γ_c = 2√10 = 6,324555
 *     Subamortiguado (γ < γ_c). ω_d = √(10 − 1) = 3 rad/s EXACTO · T_d = 2π/3 = 2,094395 s
 *     La app publicaba 2π/√10 = 1,986918 s, un −5,13 %.
 *
 *   m = 1 kg · k = 1 N/m · γ = 2 → β = 1 = ω₀, o sea γ = γ_c = 2 exacto
 *     Crítico. x(t) = A·(1 + t)·e^(−t), que es SIEMPRE positiva: no cruza el equilibrio
 *     y no hay período que publicar.
 *       x(π/2) = 2,5707963 · e^(−1,5707963) = 0,534416 m
 *       x(π)   = 4,1415927 · e^(−3,1415927) = 0,178974 m
 *
 *   m = 0,1 kg · k = 1 N/m · γ = 2 → β = 10 · ω₀ = √10 · γ_c = 0,632456
 *     Sobreamortiguado (γ = 3,16·γ_c). r = √(100 − 10) = 9,486833. Tampoco oscila.
 *
 *   Energía: E(0) = ½·k·A² y monótona decreciente. Un oscilador amortiguado solo puede
 *   PERDER energía; el motor anterior arrancaba con v(0) = −βA y la duplicaba.
 */

import { test, expect } from '@playwright/test';
import {
  describirOscilador,
  calcularEstado,
  energiaInicial,
  marcasDeTiempo,
} from '../app/simulador-mas-resorte/motor';

test.describe('Hallazgo 966 (alto) — con amortiguamiento se oscila a ω_d, no a ω₀', () => {
  test('m = 1, k = 10, γ = 2: ω_d = 3 rad/s y T = 2,0944 s', () => {
    const o = describirOscilador(10, 1, 2);
    expect(o.regimen).toBe('subamortiguado');
    expect(o.omega0).toBeCloseTo(3.162278, 6);
    expect(o.beta).toBe(1);
    expect(o.gammaCritico).toBeCloseTo(6.324555, 6);
    expect(o.omegaD).toBeCloseTo(3, 10); // √(10 − 1) = 3 exacto
    expect(o.periodo).toBeCloseTo(2.094395, 6); // 2π/3
    // Lo que publicaba antes: 2π/√10 = 1,986918 s. Un 5,13 % de menos.
    expect(o.periodo).not.toBeCloseTo(1.986918, 3);
  });

  test('sin amortiguamiento, ω_d vuelve a ser ω₀', () => {
    const o = describirOscilador(10, 1, 0);
    // Hallazgo 2158: con γ = 0 la amplitud no decrece, así que no es «subamortiguado» (la FAQ
    // de la app lo define como «oscila con amplitud decreciente»): es el MAS libre. La menor
    // fricción del deslizador (0,1 N·s/m) ya lo es: β = 0,05 < ω₀ = √10.
    expect(o.regimen).toBe('libre');
    expect(describirOscilador(10, 1, 0.1).regimen).toBe('subamortiguado');
    expect(o.omegaD).toBeCloseTo(o.omega0, 12);
    expect(o.periodo).toBeCloseTo(1.986918, 6); // 2π/√10
  });

  test('los cruces por cero van al ritmo de ω_d', () => {
    // x(t) = 0 cuando cos(ω_d·t) + (β/ω_d)·sen(ω_d·t) = 0, o sea tan(ω_d·t) = −ω_d/β = −3.
    // ω_d·t = π − arctan(3) = 3,141593 − 1,249046 = 1,892547 → t = 0,630849 s.
    // El siguiente cruce, medio período después: 0,630849 + 1,047198 = 1,678047 s.
    const antes = calcularEstado(1, 10, 1, 2, 0.62);
    const despues = calcularEstado(1, 10, 1, 2, 0.64);
    expect(antes.x).toBeGreaterThan(0);
    expect(despues.x).toBeLessThan(0);
    // Y con la fórmula vieja (ω₀ en el coseno) el primer cruce caía en π/(2√10) = 0,4967 s,
    // o sea la masa ya llevaba rato del otro lado a los 0,62 s.
    expect(calcularEstado(1, 10, 1, 2, 1.67).x).toBeLessThan(0);
    expect(calcularEstado(1, 10, 1, 2, 1.69).x).toBeGreaterThan(0);
  });
});

test.describe('Hallazgo 967 (alto) — en crítico y sobreamortiguado no hay oscilación', () => {
  test('γ = γ_c exacto: régimen crítico, sin período que publicar', () => {
    const o = describirOscilador(1, 1, 2); // γ_c = 2√(1·1) = 2
    expect(o.regimen).toBe('critico');
    expect(o.omegaD).toBeNull();
    expect(o.periodo).toBeNull();
    expect(o.frecuencia).toBeNull();
  });

  test('en crítico, x(t) = A(1+t)e^(−t) y NUNCA cruza el equilibrio', () => {
    expect(calcularEstado(1, 1, 1, 2, Math.PI / 2).x).toBeCloseTo(0.534416, 6);
    expect(calcularEstado(1, 1, 1, 2, Math.PI).x).toBeCloseTo(0.178974, 6);
    // Antes bajaba hasta −0,067 m con el mínimo en t = 3π/4.
    for (let t = 0; t <= 20; t += 0.05) {
      expect(calcularEstado(1, 1, 1, 2, t).x).toBeGreaterThanOrEqual(0);
    }
  });

  test('sobreamortiguado: dos exponenciales reales, sin período ni cruces', () => {
    const o = describirOscilador(1, 0.1, 2); // β = 10, ω₀ = √10, γ_c = 0,632456
    expect(o.regimen).toBe('sobreamortiguado');
    expect(o.periodo).toBeNull();
    expect(o.gammaCritico).toBeCloseTo(0.632456, 6);
    for (let t = 0; t <= 20; t += 0.05) {
      expect(calcularEstado(1, 1, 0.1, 2, t).x).toBeGreaterThanOrEqual(0);
    }
  });

  test('el umbral está donde dice la teoría: γ_c = 2√(k·m)', () => {
    // k = 20, m = 1 → γ_c = 2√20 = 8,944272. Justo por debajo y justo por encima.
    expect(describirOscilador(20, 1, 8.94).regimen).toBe('subamortiguado');
    expect(describirOscilador(20, 1, 8.95).regimen).toBe('sobreamortiguado');
    expect(describirOscilador(20, 1, 2 * Math.sqrt(20)).regimen).toBe('critico');
  });
});

test.describe('Hallazgo 968 (alto) — la energía arranca en ½kA² y solo baja', () => {
  test('v(0) = 0 en los tres regímenes: nadie empuja la masa al soltarla', () => {
    expect(calcularEstado(1, 10, 1, 2, 0).v).toBeCloseTo(0, 12); // subamortiguado
    expect(calcularEstado(1, 1, 1, 2, 0).v).toBeCloseTo(0, 12); // crítico
    expect(calcularEstado(1, 1, 0.1, 2, 0).v).toBeCloseTo(0, 12); // sobreamortiguado
  });

  test('x(0) = A en los tres regímenes', () => {
    expect(calcularEstado(0.2, 10, 1, 2, 0).x).toBeCloseTo(0.2, 12);
    expect(calcularEstado(0.2, 1, 1, 2, 0).x).toBeCloseTo(0.2, 12);
    expect(calcularEstado(0.2, 1, 0.1, 2, 0).x).toBeCloseTo(0.2, 12);
  });

  test('E(0) = ½kA² exacta, y nunca se supera', () => {
    const techo = energiaInicial(1, 1); // ½·1·1² = 0,5 J
    expect(techo).toBe(0.5);
    expect(calcularEstado(1, 1, 1, 2, 0).Et).toBeCloseTo(0.5, 12);
    // Antes el segundo frame ya marcaba 1,000 J: ½kA² + ½m(βA)² = 0,5 + 0,5.
    for (let t = 0; t <= 15; t += 0.01) {
      expect(calcularEstado(1, 1, 1, 2, t).Et).toBeLessThanOrEqual(techo + 1e-12);
    }
  });

  test('la energía es monótona decreciente con amortiguamiento', () => {
    let anterior = Infinity;
    for (let t = 0; t <= 10; t += 0.01) {
      const E = calcularEstado(1, 10, 1, 2, t).Et;
      expect(E).toBeLessThanOrEqual(anterior + 1e-12);
      anterior = E;
    }
  });

  test('sin amortiguamiento la energía se conserva', () => {
    const techo = energiaInicial(0.2, 20); // ½·20·0,04 = 0,4 J
    for (let t = 0; t <= 5; t += 0.01) {
      expect(calcularEstado(0.2, 20, 1, 0, t).Et).toBeCloseTo(techo, 9);
    }
  });
});

test.describe('El oscilador libre sigue siendo el de libro', () => {
  test('γ = 0: x(t) = A·cos(ω₀·t) y T = 2π√(m/k)', () => {
    const o = describirOscilador(20, 1, 0);
    expect(o.periodo).toBeCloseTo((2 * Math.PI) / Math.sqrt(20), 9); // 1,404963 s
    // Un cuarto de período: la masa pasa por el equilibrio con velocidad máxima.
    const cuarto = calcularEstado(0.2, 20, 1, 0, o.periodo! / 4);
    expect(cuarto.x).toBeCloseTo(0, 9);
    expect(Math.abs(cuarto.v)).toBeCloseTo(0.2 * Math.sqrt(20), 6);
    // Medio período: vuelve a la amplitud, del otro lado.
    expect(calcularEstado(0.2, 20, 1, 0, o.periodo! / 2).x).toBeCloseTo(-0.2, 9);
    // Un período entero: donde empezó.
    expect(calcularEstado(0.2, 20, 1, 0, o.periodo!).x).toBeCloseTo(0.2, 9);
  });

  test('T no depende de la amplitud, como dice la FAQ de la app', () => {
    const a = describirOscilador(20, 1, 0).periodo;
    expect(calcularEstado(0.05, 20, 1, 0, a! / 2).x).toBeCloseTo(-0.05, 9);
    expect(calcularEstado(1, 20, 1, 0, a! / 2).x).toBeCloseTo(-1, 9);
  });
});

test.describe('Hallazgo 970 — la gráfica x(t) lleva eje de tiempo', () => {
  test('las marcas van en segundos enteros y caen dentro de la ventana', () => {
    // Una ventana corta: marca cada segundo.
    expect(marcasDeTiempo(0, 4.7)).toEqual([0, 1, 2, 3, 4]);
    // Ventana media: cada 2 s, empezando por el primer múltiplo dentro de la ventana.
    expect(marcasDeTiempo(3.2, 9.1)).toEqual([4, 6, 8]);
    // Ventana larga: cada 5 s, para no amontonar rótulos.
    expect(marcasDeTiempo(10, 27)).toEqual([10, 15, 20, 25]);
  });

  test('con la ventana vacía no se inventa ninguna marca', () => {
    expect(marcasDeTiempo(2.5, 2.5)).toEqual([]);
    expect(marcasDeTiempo(5, 4)).toEqual([]);
  });

  test('el período de la app se puede medir sobre ese eje', () => {
    // k = 10, m = 1 → T = 2π/√10 = 1,987 s. En una ventana de 5 s caben dos períodos
    // enteros y cinco marcas de un segundo: suficiente para medirlo con una regla.
    const o = describirOscilador(10, 1, 0);
    expect(o.periodo).toBeCloseTo(1.986918, 6);
    expect(marcasDeTiempo(0, 5).length).toBeGreaterThanOrEqual(5);
  });
});
