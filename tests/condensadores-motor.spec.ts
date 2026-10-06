/**
 * Tests unitarios del motor de simulador-condensadores
 *
 * Ejecutar: npx playwright test --config playwright.calc.config.ts tests/condensadores-motor.spec.ts
 *
 * Constante: ε₀ = 8,8541878128·10⁻¹² F/m (CODATA 2018). Casos resueltos a mano:
 *
 *   Condensador de vacío, A = 100 cm² = 0,01 m², d = 1 mm = 0,001 m
 *     C = ε₀·A/d = 8,8541878128·10⁻¹² · 0,01 / 0,001 = 8,8541878128·10⁻¹¹ F  (88,54 pF)
 *   Con V = 12 V
 *     Q = C·V  = 12 · 8,8541878128·10⁻¹¹   = 1,06250254·10⁻⁹ C   (1,0625 nC)
 *     E = V/d  = 12 / 0,001                = 12.000 V/m
 *     U = ½CV² = 72 · 8,8541878128·10⁻¹¹   = 6,37501523·10⁻⁹ J   (6,375 nJ)
 *   Mismo condensador con papel (εr = 3,7, Serway y Jewett, tabla 26.1)
 *     C = 3,7 · 8,8541878128·10⁻¹¹ = 3,27604949·10⁻¹⁰ F (327,6 pF)
 *
 *   Introducir el papel en el de vacío cargado a 12 V
 *     Batería CONECTADA (V fija):    V = 12 V · Q = 3,7·1,0625025·10⁻⁹ · U = 3,7·6,375015·10⁻⁹
 *                                     E = 12.000 V/m (no cambia: V y d son los mismos)
 *     Batería DESCONECTADA (Q fija): Q = 1,0625025·10⁻⁹ · V = 12/3,7 = 3,243243 V
 *                                     E = 12.000/3,7 = 3.243,243 V/m · U = 6,375015·10⁻⁹/3,7
 *
 *   Circuito RC con R = 1 MΩ y C = 1 µF → τ = R·C = 10⁶ · 10⁻⁶ = 1 s, V = 12 V
 *     Carga a t = τ:     V_C = 12·(1 − e⁻¹) = 12 · 0,6321206 = 7,585447 V (63,2 %)
 *     Descarga a t = 2τ: V_C = 12·e⁻²      = 12 · 0,1353353 = 1,624023 V
 *     Corriente inicial V/R = 12 / 10⁶ = 12 µA; a t = τ, 12·e⁻¹ = 4,414553 µA
 *     A t = 5τ la carga llega al 1 − e⁻⁵ = 99,326 %: NUNCA al 100 % en un tiempo finito.
 *
 *   Datos imposibles (separación 0, área negativa, εr 0 o NaN, R 0) → null, sin cifras.
 */

import { test, expect } from '@playwright/test';
import {
  EPSILON_0,
  DIELECTRICOS,
  calcularCondensador,
  validarCondensador,
  introducirDielectrico,
  constanteTiempo,
  estadoRC,
  elegirPrefijo,
} from '../app/simulador-condensadores/motor';

/** Comparación relativa: las cifras van de 10⁻¹¹ a 10⁴ y toBeCloseTo es absoluto. */
function cercaRelativo(real: number, esperado: number, tolerancia = 1e-6): void {
  expect(Math.abs(real - esperado) / Math.abs(esperado)).toBeLessThan(tolerancia);
}

const VACIO_12V = { area: 0.01, separacion: 0.001, tension: 12, er: 1 };

test.describe('ε₀ y los dieléctricos de la tabla', () => {
  test('ε₀ es el valor CODATA 2018', () => {
    expect(EPSILON_0).toBe(8.8541878128e-12);
  });

  test('los presets son los de Serway y Jewett, tabla 26.1', () => {
    const er = Object.fromEntries(DIELECTRICOS.map((d) => [d.id, d.er]));
    expect(er).toEqual({ vacio: 1, aire: 1.00059, teflon: 2.1, papel: 3.7, pyrex: 5.6, agua: 80 });
  });
});

test.describe('Parte 1 — condensador de placas paralelas', () => {
  test('A = 100 cm², d = 1 mm, vacío: C = 88,54 pF', () => {
    const r = calcularCondensador(VACIO_12V);
    expect(r).not.toBeNull();
    cercaRelativo(r!.capacidad, 8.8541878128e-11, 1e-12);
  });

  test('con V = 12 V: Q = 1,0625 nC, E = 12.000 V/m, U = 6,375 nJ', () => {
    const r = calcularCondensador(VACIO_12V)!;
    expect(r.tension).toBe(12);
    cercaRelativo(r.carga, 1.0625025e-9);
    expect(r.campo).toBeCloseTo(12000, 9);
    cercaRelativo(r.energia, 6.375015e-9);
  });

  test('con papel (εr = 3,7): C = 327,6 pF', () => {
    const r = calcularCondensador({ ...VACIO_12V, er: 3.7 })!;
    cercaRelativo(r.capacidad, 3.276049e-10);
  });

  test('U = ½CV² = ½QV = Q²/(2C): las tres formas dan lo mismo', () => {
    const r = calcularCondensador({ ...VACIO_12V, er: 5.6 })!;
    cercaRelativo(r.energia, 0.5 * r.carga * r.tension, 1e-12);
    cercaRelativo(r.energia, (r.carga * r.carga) / (2 * r.capacidad), 1e-12);
  });

  test('con V = 0 es válido: C existe y Q, E, U son 0', () => {
    const r = calcularCondensador({ ...VACIO_12V, tension: 0 })!;
    cercaRelativo(r.capacidad, 8.8541878128e-11, 1e-12);
    expect(r.carga).toBe(0);
    expect(r.campo).toBe(0);
    expect(r.energia).toBe(0);
  });
});

test.describe('Dieléctrico con la batería conectada o desconectada', () => {
  const vacio = calcularCondensador(VACIO_12V)!;

  test('conectada: V se mantiene y Q, U, C se multiplican por εr', () => {
    const r = introducirDielectrico(vacio, 3.7, 'conectada')!;
    expect(r.tension).toBe(12);
    cercaRelativo(r.carga, 3.7 * 1.0625025e-9);
    cercaRelativo(r.energia, 3.7 * 6.375015e-9);
    cercaRelativo(r.capacidad, 3.276049e-10);
    expect(r.campo).toBeCloseTo(12000, 9);
  });

  test('desconectada: Q se mantiene y V, E, U se dividen por εr', () => {
    const r = introducirDielectrico(vacio, 3.7, 'desconectada')!;
    cercaRelativo(r.carga, 1.0625025e-9);
    expect(r.tension).toBeCloseTo(3.243243, 6);
    expect(r.campo).toBeCloseTo(3243.243, 3);
    cercaRelativo(r.energia, 6.375015e-9 / 3.7);
    cercaRelativo(r.capacidad, 3.276049e-10);
  });

  test('conectada coincide con calcular directamente con εr a la misma V', () => {
    const directo = calcularCondensador({ ...VACIO_12V, er: 3.7 })!;
    const r = introducirDielectrico(vacio, 3.7, 'conectada')!;
    cercaRelativo(r.carga, directo.carga, 1e-12);
    cercaRelativo(r.energia, directo.energia, 1e-12);
  });

  test('desconectada: Q = C·V se sigue cumpliendo con los valores nuevos', () => {
    const r = introducirDielectrico(vacio, 80, 'desconectada')!;
    cercaRelativo(r.capacidad * r.tension, r.carga, 1e-12);
  });

  test('εr 0, negativo o NaN → null', () => {
    expect(introducirDielectrico(vacio, 0, 'conectada')).toBeNull();
    expect(introducirDielectrico(vacio, -2, 'desconectada')).toBeNull();
    expect(introducirDielectrico(vacio, Number.NaN, 'conectada')).toBeNull();
  });
});

test.describe('Parte 2 — circuito RC', () => {
  test('R = 1 MΩ y C = 1 µF: τ = 1 s', () => {
    expect(constanteTiempo(1e6, 1e-6)).toBeCloseTo(1, 12);
  });

  test('carga a t = τ: V_C = 7,585447 V (63,2 %)', () => {
    const r = estadoRC('carga', 12, 1e6, 1e-6, 1)!;
    expect(r.tensionCondensador).toBeCloseTo(7.585447, 6);
    expect(r.fraccionCarga).toBeCloseTo(0.632121, 6);
    expect(r.corriente).toBeCloseTo(4.414553e-6, 12);
  });

  test('descarga a t = 2τ: V_C = 1,624023 V', () => {
    const r = estadoRC('descarga', 12, 1e6, 1e-6, 2)!;
    expect(r.tensionCondensador).toBeCloseTo(1.624023, 6);
    expect(r.fraccionCarga).toBeCloseTo(0.135335, 6);
  });

  test('corriente inicial V/R = 12 µA, en la carga y en la descarga', () => {
    expect(estadoRC('carga', 12, 1e6, 1e-6, 0)!.corriente).toBeCloseTo(12e-6, 15);
    expect(estadoRC('descarga', 12, 1e6, 1e-6, 0)!.corriente).toBeCloseTo(12e-6, 15);
    expect(estadoRC('carga', 12, 1e6, 1e-6, 3)!.corrienteInicial).toBeCloseTo(12e-6, 15);
  });

  test('extremos: en t = 0 la carga parte de 0 V y la descarga de V; a 5τ no llega al 100 %', () => {
    expect(estadoRC('carga', 12, 1e6, 1e-6, 0)!.tensionCondensador).toBe(0);
    expect(estadoRC('descarga', 12, 1e6, 1e-6, 0)!.tensionCondensador).toBe(12);
    const cinco = estadoRC('carga', 12, 1e6, 1e-6, 5)!;
    expect(cinco.fraccionCarga).toBeCloseTo(0.993262, 6);
    expect(cinco.fraccionCarga).toBeLessThan(1);
  });

  test('carga + descarga = V en todo instante (curvas simétricas)', () => {
    for (let t = 0; t <= 5; t += 0.25) {
      const c = estadoRC('carga', 12, 1e6, 1e-6, t)!.tensionCondensador;
      const d = estadoRC('descarga', 12, 1e6, 1e-6, t)!.tensionCondensador;
      expect(c + d).toBeCloseTo(12, 12);
    }
  });
});

test.describe('Datos imposibles → null, sin cifras inventadas', () => {
  test('separación 0', () => {
    expect(calcularCondensador({ ...VACIO_12V, separacion: 0 })).toBeNull();
    expect(validarCondensador({ ...VACIO_12V, separacion: 0 })).toEqual(['separacion']);
  });

  test('área negativa', () => {
    expect(calcularCondensador({ ...VACIO_12V, area: -0.01 })).toBeNull();
    expect(validarCondensador({ ...VACIO_12V, area: -0.01 })).toEqual(['area']);
  });

  test('εr 0 o NaN', () => {
    expect(calcularCondensador({ ...VACIO_12V, er: 0 })).toBeNull();
    expect(calcularCondensador({ ...VACIO_12V, er: Number.NaN })).toBeNull();
  });

  test('tensión negativa o vacía (NaN)', () => {
    expect(calcularCondensador({ ...VACIO_12V, tension: -1 })).toBeNull();
    expect(validarCondensador({ ...VACIO_12V, tension: Number.NaN })).toEqual(['tension']);
  });

  test('varios fallos a la vez se listan todos', () => {
    expect(validarCondensador({ area: 0, separacion: Number.NaN, tension: 5, er: 0 })).toEqual([
      'area',
      'separacion',
      'er',
    ]);
  });

  test('R 0, C 0 o t negativo en el RC', () => {
    expect(constanteTiempo(0, 1e-6)).toBeNull();
    expect(constanteTiempo(1e6, 0)).toBeNull();
    expect(estadoRC('carga', 12, 0, 1e-6, 1)).toBeNull();
    expect(estadoRC('carga', 12, 1e6, Number.NaN, 1)).toBeNull();
    expect(estadoRC('descarga', 12, 1e6, 1e-6, -1)).toBeNull();
    expect(estadoRC('carga', -12, 1e6, 1e-6, 1)).toBeNull();
  });
});

test.describe('Prefijos del SI para presentar las cifras', () => {
  test('88,54 pF, 327,6 pF, 1,0625 nC, 12 µA', () => {
    const c = elegirPrefijo(8.8541878128e-11);
    expect(c.simbolo).toBe('p');
    expect(8.8541878128e-11 / c.factor).toBeCloseTo(88.541878, 5);
    expect(elegirPrefijo(3.276049e-10).simbolo).toBe('p');
    expect(elegirPrefijo(1.0625025e-9).simbolo).toBe('n');
    const i = elegirPrefijo(12e-6);
    expect(i.simbolo).toBe('µ');
    expect(12e-6 / i.factor).toBeCloseTo(12, 9);
  });

  test('las potencias exactas de mil caen en su prefijo, no en el anterior', () => {
    expect(elegirPrefijo(1e-9).simbolo).toBe('n');
    expect(elegirPrefijo(1e-6).simbolo).toBe('µ');
    expect(elegirPrefijo(1).simbolo).toBe('');
    // 999,99 pF se imprimiría «1.000,0 pF»: salta a nF
    expect(elegirPrefijo(9.99999e-10).simbolo).toBe('n');
  });

  test('0 y no finitos van sin prefijo; los tiempos no pasan de segundos', () => {
    expect(elegirPrefijo(0)).toEqual({ factor: 1, simbolo: '' });
    expect(elegirPrefijo(Number.NaN)).toEqual({ factor: 1, simbolo: '' });
    expect(elegirPrefijo(7000, 0).simbolo).toBe('');
    expect(elegirPrefijo(7000).simbolo).toBe('k');
    expect(elegirPrefijo(8.85e-8, 0).simbolo).toBe('n');
  });
});
