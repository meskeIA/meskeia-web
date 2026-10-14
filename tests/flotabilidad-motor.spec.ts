/**
 * Tests unitarios del motor de simulador-flotabilidad
 *
 * Ejecutar: npx playwright test --config playwright.calc.config.ts tests/flotabilidad-motor.spec.ts
 *
 * Principio de Arquímedes con g = 9,81 m/s². Casos resueltos A MANO (oráculo: si el motor no
 * los da, el motor está mal):
 *
 *   Madera de pino 500 kg/m³ · V = 1.000 cm³ = 0,001 m³ · agua dulce 1.000 kg/m³
 *     P     = 500 · 0,001 · 9,81   = 4,905 N
 *     E_max = 1000 · 0,001 · 9,81  = 9,81 N
 *     ρc < ρl → FLOTA · f = 500/1000 = 0,5 (50 % sumergido) · empuje en equilibrio = P = 4,905 N
 *     Para hundirlo entero: E_max − P = 9,81 − 4,905 = 4,905 N
 *
 *   Hielo 917 kg/m³ en agua de mar 1.025 kg/m³
 *     FLOTA · f = 917/1025 = 0,894634… → 89,5 % sumergido y 10,5 % fuera
 *     (la «punta del iceberg»)
 *
 *   Hierro 7.870 kg/m³ · V = 100 cm³ = 0,0001 m³ · agua dulce
 *     P     = 7870 · 0,0001 · 9,81 = 7,72047 N
 *     E_max = 1000 · 0,0001 · 9,81 = 0,981 N
 *     ρc > ρl → SE HUNDE · peso aparente = 7,72047 − 0,981 = 6,73947 N
 *
 *   Hierro 7.870 en mercurio 13.534 kg/m³
 *     FLOTA · f = 7870/13534 = 0,581498…
 *
 *   1.000 en 1.000 → EQUILIBRIO INDIFERENTE (peso aparente 0)
 *
 *   Densidad 0, negativa o NaN, o volumen 0 → null: no hay cifra que publicar.
 *
 * Calculadora de la densidad, ρ = m/V:
 *
 *   Aluminio: m = 270 g = 0,27 kg · V = 100 cm³ = 0,0001 m³
 *     ρ = 0,27/0,0001 = 2.700 kg/m³ = 2,7 g/cm³
 *   Agua: ρ = 1.000 kg/m³ · V = 2 L = 0,002 m³
 *     m = 1000 · 0,002 = 2 kg
 *   Oro: ρ = 19,3 g/cm³ = 19.300 kg/m³ · m = 1 kg
 *     V = 1/19300 = 0,0000518135… m³ = 51,8135… cm³
 */

import { test, expect } from '@playwright/test';
import {
  calcularFlotabilidad,
  veredictoPorDensidades,
  esPositivo,
  G,
  CM3_POR_M3,
  resolverDensidad,
  UNIDADES_MASA,
  UNIDADES_VOLUMEN,
  UNIDADES_DENSIDAD,
} from '../app/simulador-flotabilidad/motor';

test.describe('Constantes', () => {
  test('g = 9,81 m/s² y 1 m³ = 1.000.000 cm³', () => {
    expect(G).toBe(9.81);
    expect(CM3_POR_M3).toBe(1_000_000);
  });
});

test.describe('Flota', () => {
  test('madera 500 en agua 1.000, V = 1.000 cm³: P = 4,905 N, E_max = 9,81 N, f = 0,5', () => {
    const r = calcularFlotabilidad(500, 1000, 1000);
    expect(r).not.toBeNull();
    expect(r!.volumen).toBeCloseTo(0.001, 12);
    expect(r!.masa).toBeCloseTo(0.5, 12);
    expect(r!.peso).toBeCloseTo(4.905, 10);
    expect(r!.empujeMaximo).toBeCloseTo(9.81, 10);
    expect(r!.veredicto).toBe('flota');
    expect(r!.fraccionSumergida).toBeCloseTo(0.5, 12);
    expect(r!.fraccionEmergida).toBeCloseTo(0.5, 12);
    // En el equilibrio el empuje vale lo que el peso, NO el empuje máximo
    expect(r!.empuje).toBeCloseTo(4.905, 10);
    expect(r!.fuerzaParaHundir).toBeCloseTo(4.905, 10);
    expect(r!.pesoAparente).toBeNull();
  });

  test('hielo 917 en agua de mar 1.025: f = 0,894634 (89,5 % dentro, 10,5 % fuera)', () => {
    const r = calcularFlotabilidad(917, 1000, 1025);
    expect(r!.veredicto).toBe('flota');
    expect(r!.fraccionSumergida).toBeCloseTo(0.894634, 6);
    expect(Math.round(r!.fraccionSumergida * 1000) / 10).toBe(89.5);
    expect(Math.round(r!.fraccionEmergida * 1000) / 10).toBe(10.5);
  });

  test('hierro 7.870 en mercurio 13.534: flota con f = 0,581498', () => {
    const r = calcularFlotabilidad(7870, 100, 13534);
    expect(r!.veredicto).toBe('flota');
    expect(r!.fraccionSumergida).toBeCloseTo(0.581498, 6);
  });

  test('la fracción sumergida no depende del volumen', () => {
    const pequeno = calcularFlotabilidad(917, 1, 1025);
    const grande = calcularFlotabilidad(917, 10000, 1025);
    expect(pequeno!.fraccionSumergida).toBeCloseTo(grande!.fraccionSumergida, 12);
  });
});

test.describe('Se hunde', () => {
  test('hierro 7.870, V = 100 cm³, en agua: P = 7,72047 N, E = 0,981 N, peso aparente 6,73947 N', () => {
    const r = calcularFlotabilidad(7870, 100, 1000);
    expect(r!.veredicto).toBe('se-hunde');
    expect(r!.peso).toBeCloseTo(7.72047, 10);
    expect(r!.empujeMaximo).toBeCloseTo(0.981, 10);
    expect(r!.empuje).toBeCloseTo(0.981, 10);
    expect(r!.pesoAparente).toBeCloseTo(6.73947, 10);
    expect(r!.fraccionSumergida).toBe(1);
    expect(r!.fraccionEmergida).toBe(0);
    expect(r!.fuerzaParaHundir).toBeNull();
  });
});

test.describe('Equilibrio indiferente', () => {
  test('1.000 en 1.000: ni flota ni se hunde, peso aparente 0', () => {
    const r = calcularFlotabilidad(1000, 500, 1000);
    expect(r!.veredicto).toBe('indiferente');
    expect(r!.pesoAparente).toBe(0);
    expect(r!.empuje).toBeCloseTo(r!.peso, 12);
    expect(r!.fraccionSumergida).toBe(1);
  });

  test('un redondeo de coma flotante no rompe la igualdad', () => {
    expect(veredictoPorDensidades(1000, 1000 + 1e-10)).toBe('indiferente');
    expect(veredictoPorDensidades(999, 1000)).toBe('flota');
    expect(veredictoPorDensidades(1001, 1000)).toBe('se-hunde');
  });
});

test.describe('Validación: sin datos válidos no hay cifras', () => {
  test('densidades 0, negativas o NaN → null', () => {
    expect(calcularFlotabilidad(0, 1000, 1000)).toBeNull();
    expect(calcularFlotabilidad(-500, 1000, 1000)).toBeNull();
    expect(calcularFlotabilidad(Number.NaN, 1000, 1000)).toBeNull();
    expect(calcularFlotabilidad(500, 1000, 0)).toBeNull();
    expect(calcularFlotabilidad(500, 1000, -1000)).toBeNull();
    expect(calcularFlotabilidad(500, 1000, Number.NaN)).toBeNull();
  });

  test('volumen 0, negativo, NaN o infinito → null', () => {
    expect(calcularFlotabilidad(500, 0, 1000)).toBeNull();
    expect(calcularFlotabilidad(500, -10, 1000)).toBeNull();
    expect(calcularFlotabilidad(500, Number.NaN, 1000)).toBeNull();
    expect(calcularFlotabilidad(500, Number.POSITIVE_INFINITY, 1000)).toBeNull();
  });

  test('esPositivo solo admite números finitos mayores que 0', () => {
    expect(esPositivo(1)).toBe(true);
    expect(esPositivo(0)).toBe(false);
    expect(esPositivo(-1)).toBe(false);
    expect(esPositivo(Number.NaN)).toBe(false);
    expect(esPositivo(Number.POSITIVE_INFINITY)).toBe(false);
  });
});

test.describe('Densidad ρ = m/V', () => {
  test('factores de unidades: 1 g = 0,001 kg, 1 cm³ = 10⁻⁶ m³, 1 L = 10⁻³ m³, 1 g/cm³ = 1000 kg/m³', () => {
    expect(UNIDADES_MASA.g).toBe(0.001);
    expect(UNIDADES_MASA.kg).toBe(1);
    expect(UNIDADES_VOLUMEN.cm3).toBe(1e-6);
    expect(UNIDADES_VOLUMEN.L).toBe(1e-3);
    expect(UNIDADES_VOLUMEN.m3).toBe(1);
    expect(UNIDADES_DENSIDAD['g/cm3']).toBe(1000);
    expect(UNIDADES_DENSIDAD['kg/m3']).toBe(1);
  });

  test('aluminio: 270 g en 100 cm³ → ρ = 2.700 kg/m³ (2,7 g/cm³)', () => {
    const r = resolverDensidad('densidad', {
      densidad: Number.NaN,
      masa: 270 * UNIDADES_MASA.g,
      volumen: 100 * UNIDADES_VOLUMEN.cm3,
    });
    expect(r).not.toBeNull();
    expect(r!.densidad).toBeCloseTo(2700, 9);
    expect(r!.densidad / UNIDADES_DENSIDAD['g/cm3']).toBeCloseTo(2.7, 12);
  });

  test('agua: 1.000 kg/m³ y 2 L → m = 2 kg', () => {
    const r = resolverDensidad('masa', { densidad: 1000, masa: Number.NaN, volumen: 2 * UNIDADES_VOLUMEN.L });
    expect(r).not.toBeNull();
    expect(r!.masa).toBeCloseTo(2, 12);
  });

  test('oro: 19,3 g/cm³ y 1 kg → V = 51,8135 cm³', () => {
    const r = resolverDensidad('volumen', {
      densidad: 19.3 * UNIDADES_DENSIDAD['g/cm3'],
      masa: 1,
      volumen: Number.NaN,
    });
    expect(r).not.toBeNull();
    expect(r!.volumen).toBeCloseTo(1 / 19300, 15);
    expect(r!.volumen / UNIDADES_VOLUMEN.cm3).toBeCloseTo(51.8135, 4);
  });

  test('el dato de la propia incógnita se ignora', () => {
    const r = resolverDensidad('densidad', { densidad: 999, masa: 0.27, volumen: 0.0001 });
    expect(r!.densidad).toBeCloseTo(2700, 9);
  });

  test('sin los dos datos positivos no hay cifra', () => {
    expect(resolverDensidad('densidad', { densidad: 1000, masa: 0, volumen: 1 })).toBeNull();
    expect(resolverDensidad('densidad', { densidad: 1000, masa: 1, volumen: Number.NaN })).toBeNull();
    expect(resolverDensidad('masa', { densidad: -1000, masa: 1, volumen: 1 })).toBeNull();
    expect(resolverDensidad('volumen', { densidad: 1000, masa: Number.POSITIVE_INFINITY, volumen: 1 })).toBeNull();
  });
});
