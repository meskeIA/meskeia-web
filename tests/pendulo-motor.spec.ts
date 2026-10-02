/**
 * Tests unitarios del motor de simulador-pendulo
 *
 * Ejecutar: npx playwright test tests/pendulo-motor.spec.ts
 *
 * El período exacto de un péndulo simple de amplitud θ₀ es
 *
 *     T = 4·√(L/g)·K(sen(θ₀/2))
 *
 * con K la integral elíptica completa de primera especie. Valores de K contrastados con
 * tablas (Abramowitz & Stegun, tabla 17.1):
 *
 *     K(0)       = π/2      = 1,5707963268   ← el límite de pequeños ángulos
 *     K(0,5)                = 1,685750       ← θ₀ = 60°, porque sen(30°) = 0,5
 *     K(sen 45°) = K(0,7071)= 1,854075       ← θ₀ = 90°
 *
 * Con L = 1,00 m y g = 9,81 m/s², T₀ = 2π√(1/9,81) = 2,006066 s:
 *
 *     θ₀ = 60° → T = 4·0,3192752·1,685750 = 2,152874 s   (+7,32 % sobre T₀)
 *     θ₀ = 90° → T = 4·0,3192752·1,854075 = 2,367841 s   (+18,03 %)
 *
 * El hallazgo 971 era que la app publicaba SIEMPRE T₀ = 2,006 s, incluso con la pestaña
 * «Modelo numérico (cualquier ángulo)» activa —que es la de por defecto— mientras animaba
 * el péndulo al ritmo real. El 973, que el aviso de grandes ángulos corregía con el primer
 * término de la serie de Bernoulli (1 + θ₀²/16) y se quedaba en +15,42 % donde tocan
 * +18,03 %.
 */

import { test, expect } from '@playwright/test';
import {
  integralElipticaK,
  periodoReal,
  calcularDerivados,
  pasoNumerico,
  periodoPrimeraOscilacion,
  thetaPequenosAngulos,
  validarGravedad,
} from '../app/simulador-pendulo/motor';

const L = 1.0;
const G = 9.81;
const grados = (d: number) => (d * Math.PI) / 180;

test.describe('La integral elíptica, contra las tablas', () => {
  test('K(0) es π/2: el límite de pequeños ángulos', () => {
    expect(integralElipticaK(0)).toBeCloseTo(Math.PI / 2, 12);
  });

  test('K(0,5) = 1,685750 y K(sen 45°) = 1,854075', () => {
    expect(integralElipticaK(0.5)).toBeCloseTo(1.68575, 6);
    expect(integralElipticaK(Math.sin(Math.PI / 4))).toBeCloseTo(1.854075, 6);
  });

  test('K crece con k y no se dispara en el borde', () => {
    expect(integralElipticaK(0.9)).toBeGreaterThan(integralElipticaK(0.5));
    expect(Number.isFinite(integralElipticaK(1))).toBe(true);
  });
});

test.describe('Hallazgo 971 (alto) — el período publicado depende del modelo elegido', () => {
  test('θ₀ = 90°, modelo numérico: 2,368 s, no 2,006 s', () => {
    const d = calcularDerivados(L, G, grados(90), 'numerico');
    expect(d.T0).toBeCloseTo(2.006067, 5);
    expect(d.Treal).toBeCloseTo(2.367841, 5);
    expect(d.T).toBeCloseTo(2.367841, 5); // el que se publica
    expect(d.f).toBeCloseTo(1 / 2.367841, 5);
    // Hallazgo 2640: ω = 2π·f = 2π/2,367841 = 2,653550, no ω₀ = √9,81 = 3,132092
    expect(d.omega).toBeCloseTo(2.65355, 4);
    expect(d.omega0).toBeCloseTo(3.132092, 5);
  });

  test('θ₀ = 90°, aproximación lineal: publica su 2,006 s, que es lo que promete', () => {
    const d = calcularDerivados(L, G, grados(90), 'pequeno');
    expect(d.T).toBeCloseTo(2.006067, 5);
  });

  test('θ₀ = 60° → 2,153 s por el modelo numérico', () => {
    expect(calcularDerivados(L, G, grados(60), 'numerico').T).toBeCloseTo(2.152874, 5);
  });

  test('con ángulos pequeños los dos modelos convergen', () => {
    const d = calcularDerivados(L, G, grados(5), 'numerico');
    expect(d.Treal).toBeCloseTo(d.T0, 2); // 2,00702 frente a 2,00607: menos de 1 ms
    expect(d.desviacion).toBeLessThan(0.001);
  });

  test('la longitud sigue mandando: T ∝ √L', () => {
    // Sin rozamiento T nunca es null (solo lo es en régimen crítico o sobreamortiguado).
    const corto = calcularDerivados(0.25, G, grados(5), 'numerico').T ?? NaN;
    const largo = calcularDerivados(1.0, G, grados(5), 'numerico').T ?? NaN;
    expect(largo / corto).toBeCloseTo(2, 3); // √(1/0,25) = 2
  });

  test('y la gravedad también: T ∝ 1/√g', () => {
    const tierra = calcularDerivados(L, 9.81, grados(5), 'numerico').T ?? NaN;
    const luna = calcularDerivados(L, 1.62, grados(5), 'numerico').T ?? NaN;
    expect(luna / tierra).toBeCloseTo(Math.sqrt(9.81 / 1.62), 3); // 2,4608
  });
});

test.describe('Hallazgo 973 — la desviación es la real, no el primer término de la serie', () => {
  test('θ₀ = 90° → +18,03 %, no el +15,42 % de 1 + θ₀²/16', () => {
    const d = calcularDerivados(L, G, grados(90), 'numerico');
    expect(d.desviacion * 100).toBeCloseTo(18.03, 1);
    // La serie truncada daba 1 + (π/2)²/16 = 1,15421, o sea +15,42 %.
    expect(d.desviacion * 100).not.toBeCloseTo(15.42, 1);
  });

  test('θ₀ = 60° → +7,32 %, no +6,85 %', () => {
    const d = calcularDerivados(L, G, grados(60), 'numerico');
    expect(d.desviacion * 100).toBeCloseTo(7.32, 1);
  });

  test('a 15°, el umbral del aviso, la desviación ya es medible pero pequeña', () => {
    expect(calcularDerivados(L, G, grados(15), 'numerico').desviacion * 100).toBeCloseTo(0.43, 1);
  });
});

test.describe('Hallazgo 975 y 976 — una gravedad imposible se rechaza con motivo', () => {
  test('g = 0 no se sustituye en silencio por 9,81', () => {
    const motivo = validarGravedad(0);
    expect(motivo).not.toBeNull();
    expect(motivo).toContain('no oscila');
  });

  test('g negativa tampoco', () => {
    expect(validarGravedad(-5)).toContain('negativa');
  });

  test('el campo vacío se dice, no se rellena', () => {
    expect(validarGravedad(NaN)).toContain('gravedad');
  });

  test('las cuatro gravedades de los presets son válidas', () => {
    for (const g of [9.81, 1.62, 3.71, 24.79]) {
      expect(validarGravedad(g)).toBeNull();
    }
  });
});

test.describe('El integrador que mueve la animación sigue siendo correcto', () => {
  /** E/m = g·L·(1 − cos θ) + ½·L²·ω² */
  const energiaPorMasa = (e: { theta: number; omega: number }, l: number, g: number) =>
    g * l * (1 - Math.cos(e.theta)) + 0.5 * l * l * e.omega * e.omega;

  test('sin amortiguamiento conserva la energía a lo largo de un período', () => {
    let estado = { theta: grados(20), omega: 0 };
    const inicial = energiaPorMasa(estado, L, G);
    for (let i = 0; i < 4000; i++) {
      estado = pasoNumerico(estado, L, G, 0, 0.0005);
    }
    expect(energiaPorMasa(estado, L, G)).toBeCloseTo(inicial, 6);
  });

  test('Hallazgo 2641 — con frames de 1/60 s la energía no oscila (Júpiter, L = 0,10 m, 90°)', () => {
    // El caso del acta: E₀/m = 24,79 × 0,10 × (1 − cos 90°) = 2,479 J/kg. Euler-Cromer con el
    // dt de un frame la hacía oscilar entre −10,66 % y +12,58 % (medido el 02/10/2026 con el
    // integrador antiguo); RK4 con sub-pasos de T₀/1000 la mantiene por debajo de 1e-8 en 60 s.
    const l = 0.1;
    const g = 24.79;
    let estado = { theta: grados(90), omega: 0 };
    const inicial = energiaPorMasa(estado, l, g);
    expect(inicial).toBeCloseTo(2.479, 6);
    let peor = 0;
    for (let i = 0; i < 60 * 60; i++) {
      estado = pasoNumerico(estado, l, g, 0, 1 / 60);
      peor = Math.max(peor, Math.abs(energiaPorMasa(estado, l, g) / inicial - 1));
    }
    expect(peor).toBeLessThan(1e-8);
  });

  test('con rozamiento la energía solo puede bajar: dE/dt = −γ·m·L²·θ′² ≤ 0', () => {
    let estado = { theta: grados(60), omega: 0 };
    let anterior = energiaPorMasa(estado, L, G);
    for (let i = 0; i < 600; i++) {
      estado = pasoNumerico(estado, L, G, 0.3, 1 / 60);
      const ahora = energiaPorMasa(estado, L, G);
      expect(ahora).toBeLessThanOrEqual(anterior + 1e-12);
      anterior = ahora;
    }
  });

  test('el período que integra coincide con el período real que se publica', () => {
    // Se cuentan los cruces por cero de θ con θ₀ = 90°: medio período entre dos cruces.
    let estado = { theta: grados(90), omega: 0 };
    const dt = 0.0002;
    let anterior = estado.theta;
    const cruces: number[] = [];
    for (let i = 1; i <= 40000 && cruces.length < 3; i++) {
      estado = pasoNumerico(estado, L, G, 0, dt);
      if (anterior > 0 && estado.theta <= 0) cruces.push(i * dt);
      if (anterior < 0 && estado.theta >= 0) cruces.push(i * dt);
      anterior = estado.theta;
    }
    const periodoIntegrado = (cruces[2] - cruces[0]) ;
    expect(periodoIntegrado).toBeCloseTo(periodoReal(L, G, grados(90)), 2); // 2,3678 s
  });

  test('con amortiguamiento la amplitud decae', () => {
    let estado = { theta: grados(45), omega: 0 };
    let maximo = 0;
    for (let i = 0; i < 20000; i++) {
      estado = pasoNumerico(estado, L, G, 0.5, 0.0005);
      if (i > 15000) maximo = Math.max(maximo, Math.abs(estado.theta));
    }
    expect(maximo).toBeLessThan(grados(45));
  });
});

/**
 * Hallazgo 2638 — el período publicado incluye el rozamiento.
 *
 * Ecuación lineal amortiguada: θ″ + γ·θ′ + ω₀²·θ = 0. Con ω₀² = g/L y γ < 2ω₀ oscila con
 * ω_d = √(ω₀² − γ²/4), y el tiempo entre dos máximos consecutivos es exactamente 2π/ω_d.
 *
 *   Luna (1,62) · L = 5 m · γ = 0,5:  ω₀² = 0,324 · γ²/4 = 0,0625 · ω_d = √0,2615 = 0,511371
 *   → T_d = 2π/0,511371 = 12,286948 s  (sin rozamiento, 2π/√0,324 = 11,038 s)
 *
 *   g = 0,3 · L = 5 · γ = 0,5:  ω₀ = √0,06 = 0,244949 < γ/2 = 0,25  → sobreamortiguado
 *   g = 0,25 · L = 4 · γ = 0,5: ω₀ = √0,0625 = 0,25 = γ/2            → crítico
 */
test.describe('Hallazgo 2638 — el período publicado incluye el rozamiento', () => {
  const LUNA = 1.62;

  test('pestaña lineal: T = 2π/√(ω₀² − γ²/4) = 12,286948 s', () => {
    const d = calcularDerivados(5, LUNA, grados(5), 'pequeno', 0.5);
    expect(d.regimen).toBe('subamortiguado');
    expect(d.zeta).toBeCloseTo(0.25 / 0.56921, 4); // γ/2ω₀ = 0,439205
    expect(d.T).toBeCloseTo(12.286948, 5);
    expect(d.omega).toBeCloseTo(0.511371, 5); // ω = 2π·f = ω_d
    expect(d.omega0).toBeCloseTo(0.56921, 5);
  });

  test('modelo numérico a amplitud mínima: tiende al lineal amortiguado', () => {
    // A 0,5° la corrección de amplitud es θ₀²/16 = 4,8e-6: por debajo del redondeo.
    expect(periodoPrimeraOscilacion(5, LUNA, grados(0.5), 0.5)).toBeCloseTo(12.286948, 3);
  });

  test('modelo numérico, el caso del acta (5°): entre el lineal amortiguado y su corrección de amplitud', () => {
    // La amplitud decae durante la oscilación, así que la corrección de amplitud real queda por
    // debajo de la de 5° completos: Treal(5°)/T₀ = 1 + 0,000476.
    const T = calcularDerivados(5, LUNA, grados(5), 'numerico', 0.5).T as number;
    expect(T).toBeGreaterThan(12.286948);
    expect(T).toBeLessThan(12.286948 * 1.000476);
    // Lo que se publica: «12,289 s». La app daba 11,044 s, el del péndulo sin rozamiento.
    expect(T).toBeCloseTo(12.289, 3);
  });

  test('sin rozamiento, el numérico sigue siendo el de la integral elíptica', () => {
    expect(calcularDerivados(L, G, grados(90), 'numerico', 0).T).toBeCloseTo(2.367842, 5);
    // y la primera oscilación integrada converge a él cuando γ → 0
    expect(periodoPrimeraOscilacion(L, G, grados(90), 1e-7)).toBeCloseTo(2.367841, 4);
  });

  test('a 90° con γ = 0,05 la primera oscilación dura menos que la de 90° sin rozamiento', () => {
    // La amplitud cae de 90° a ≈ 90°·e^(−0,05 × 2,37/2) = 84,8° en esa oscilación, y el período
    // del péndulo no lineal baja con la amplitud: tiene que quedar entre T(80°) y T(90°).
    const T = calcularDerivados(L, G, grados(90), 'numerico', 0.05).T as number;
    expect(T).toBeLessThan(periodoReal(L, G, grados(90))); // 2,367841
    expect(T).toBeGreaterThan(periodoReal(L, G, grados(80)));
    expect(T).toBeCloseTo(2.341127, 4); // lo que publica la app
  });

  test('sobreamortiguado (g = 0,3, L = 5, γ = 0,5): no hay período', () => {
    const num = calcularDerivados(5, 0.3, grados(10), 'numerico', 0.5);
    const lin = calcularDerivados(5, 0.3, grados(10), 'pequeno', 0.5);
    for (const d of [num, lin]) {
      expect(d.regimen).toBe('sobreamortiguado');
      expect(d.T).toBeNull();
      expect(d.f).toBeNull();
      expect(d.omega).toBeNull();
    }
    expect(num.omega0).toBeCloseTo(0.244949, 6);
  });

  test('crítico (g = 0,25, L = 4, γ = 0,5): no hay período', () => {
    const d = calcularDerivados(4, 0.25, grados(10), 'numerico', 0.5);
    expect(d.regimen).toBe('critico');
    expect(d.T).toBeNull();
  });
});

/**
 * Hallazgo 2639 — la solución cerrada de pequeños ángulos es la de la ecuación amortiguada,
 * soltada en reposo. Era θ₀·e^(−γt/2)·cos(ω₀t), con θ′(0) = −γθ₀/2 y oscilando con ω₀.
 */
test.describe('Hallazgo 2639 — la solución cerrada resuelve θ″ + γθ′ + ω₀²θ = 0', () => {
  const w0Luna5 = Math.sqrt(1.62 / 5); // 0,569210

  test('sale del reposo: θ(0) = θ₀ y θ′(0) = 0', () => {
    const e = thetaPequenosAngulos(grados(5), w0Luna5, 0.5, 0);
    expect(e.theta).toBeCloseTo(grados(5), 12);
    expect(e.omega).toBeCloseTo(0, 12);
  });

  test('primer paso por la vertical en t = (π/2 + atan(0,25/0,511371))/0,511371 = 3,9610 s', () => {
    // atan(0,488886) = 0,454713 → (1,570796 + 0,454713)/0,511371 = 3,960940 s
    const wd = Math.sqrt(1.62 / 5 - 0.0625); // 0,511371 sin redondear
    const t = (Math.PI / 2 + Math.atan(0.25 / wd)) / wd;
    expect(t).toBeCloseTo(3.96094, 4);
    expect(thetaPequenosAngulos(grados(5), w0Luna5, 0.5, t).theta).toBeCloseTo(0, 9);
    expect(thetaPequenosAngulos(grados(5), w0Luna5, 0.5, t - 0.01).theta).toBeGreaterThan(0);
    expect(thetaPequenosAngulos(grados(5), w0Luna5, 0.5, t + 0.01).theta).toBeLessThan(0);
  });

  test('satisface la ecuación (residuo por diferencias finitas)', () => {
    const h = 1e-4;
    for (const t of [0.7, 2.3, 5.1, 9.8]) {
      const th = (x: number) => thetaPequenosAngulos(grados(5), w0Luna5, 0.5, x).theta;
      const d1 = thetaPequenosAngulos(grados(5), w0Luna5, 0.5, t).omega;
      const d2 = (th(t + h) - 2 * th(t) + th(t - h)) / (h * h);
      expect(d2 + 0.5 * d1 + w0Luna5 * w0Luna5 * th(t)).toBeCloseTo(0, 6);
      // y θ′ es de verdad la derivada de θ
      expect((th(t + h) - th(t - h)) / (2 * h)).toBeCloseTo(d1, 8);
    }
  });

  test('sobreamortiguado (g = 0,3, L = 5, γ = 0,5): θ(10 s) = +3,0643°, sin cruzar la vertical', () => {
    // β = √(0,0625 − 0,06) = 0,05 · θ(10) = 10°·e^(−2,5)·[cosh 0,5 + 5·senh 0,5]
    //       = 10° × 0,082085 × (1,127626 + 2,605476) = 3,0643°
    const w0 = Math.sqrt(0.3 / 5);
    expect((thetaPequenosAngulos(grados(10), w0, 0.5, 10).theta * 180) / Math.PI).toBeCloseTo(
      3.0643,
      4,
    );
    for (let t = 0; t <= 60; t += 0.5) {
      expect(thetaPequenosAngulos(grados(10), w0, 0.5, t).theta).toBeGreaterThan(0);
    }
  });

  test('crítico (ω₀ = γ/2 = 0,25): θ(4 s) = θ₀·e^(−1)·(1 + 1) = 0,735759·θ₀', () => {
    expect(thetaPequenosAngulos(1, 0.25, 0.5, 4).theta).toBeCloseTo(0.735759, 6);
    expect(thetaPequenosAngulos(1, 0.25, 0.5, 0).omega).toBeCloseTo(0, 12);
  });

  test('sin rozamiento vuelve a ser θ₀·cos(ω₀t)', () => {
    const e = thetaPequenosAngulos(grados(10), 3.132092, 0, 1.3);
    expect(e.theta).toBeCloseTo(grados(10) * Math.cos(3.132092 * 1.3), 12);
  });
});
