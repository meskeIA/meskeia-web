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
  pasoEulerNumerico,
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
    const corto = calcularDerivados(0.25, G, grados(5), 'numerico').T;
    const largo = calcularDerivados(1.0, G, grados(5), 'numerico').T;
    expect(largo / corto).toBeCloseTo(2, 3); // √(1/0,25) = 2
  });

  test('y la gravedad también: T ∝ 1/√g', () => {
    const tierra = calcularDerivados(L, 9.81, grados(5), 'numerico').T;
    const luna = calcularDerivados(L, 1.62, grados(5), 'numerico').T;
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
  test('sin amortiguamiento conserva la energía a lo largo de un período', () => {
    // E/m = g·L·(1 − cos θ) + ½·L²·ω². Con θ₀ = 20° y dt pequeño, Euler-Cromer la mantiene.
    const energia = (e: { theta: number; omega: number }) =>
      G * L * (1 - Math.cos(e.theta)) + 0.5 * L * L * e.omega * e.omega;

    let estado = { theta: grados(20), omega: 0 };
    const inicial = energia(estado);
    for (let i = 0; i < 4000; i++) {
      estado = pasoEulerNumerico(estado, L, G, 0, 0.0005);
    }
    expect(energia(estado)).toBeCloseTo(inicial, 3);
  });

  test('el período que integra coincide con el período real que se publica', () => {
    // Se cuentan los cruces por cero de θ con θ₀ = 90°: medio período entre dos cruces.
    let estado = { theta: grados(90), omega: 0 };
    const dt = 0.0002;
    let anterior = estado.theta;
    const cruces: number[] = [];
    for (let i = 1; i <= 40000 && cruces.length < 3; i++) {
      estado = pasoEulerNumerico(estado, L, G, 0, dt);
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
      estado = pasoEulerNumerico(estado, L, G, 0.5, 0.0005);
      if (i > 15000) maximo = Math.max(maximo, Math.abs(estado.theta));
    }
    expect(maximo).toBeLessThan(grados(45));
  });
});
