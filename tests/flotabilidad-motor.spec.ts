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
 */

import { test, expect } from '@playwright/test';
import {
  calcularFlotabilidad,
  veredictoPorDensidades,
  esPositivo,
  G,
  CM3_POR_M3,
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
