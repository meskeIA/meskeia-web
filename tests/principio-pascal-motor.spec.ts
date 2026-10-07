/**
 * Tests unitarios del motor de simulador-principio-pascal
 *
 * Ejecutar: npx playwright test --config playwright.calc.config.ts tests/principio-pascal-motor.spec.ts
 *
 * g = 9,81 m/s² y P₀ = 1 atm = 101.325 Pa. Casos resueltos A MANO (oráculo: si el motor no los
 * da, el motor está mal):
 *
 *   PRESIÓN A UNA PROFUNDIDAD
 *   Agua dulce 1000 kg/m³ a 10 m
 *     ρgh   = 1000 · 9,81 · 10   = 98.100 Pa
 *     P_abs = 101.325 + 98.100   = 199.425 Pa = 199.425/101.325 = 1,968172 atm
 *   Agua de mar 1025 kg/m³ a 100 m
 *     ρgh   = 1025 · 9,81 · 100  = 1.005.525 Pa
 *     P_abs = 1.106.850 Pa       = 10,923760 atm
 *   Mercurio 13.534 kg/m³, columna de 0,76 m (el barómetro de Torricelli)
 *     ρgh   = 13.534 · 9,81 · 0,76 = 13.534 · 7,4556 = 100.904,0904 Pa ≈ 0,9958 atm
 *   En la superficie (h = 0): ρgh = 0 y P_abs = P₀
 *   Una atmósfera de agua dulce: h = 101.325/(1000 · 9,81) = 10,328746 m
 *
 *   PRENSA HIDRÁULICA
 *   F₁ = 100 N, d₁ = 2 cm, d₂ = 20 cm, x₁ = 10 cm
 *     A₂/A₁ = (20/2)² = 100 → F₂ = 10.000 N · m = 10.000/9,81 = 1019,368 kg
 *     x₂ = 10 cm/100 = 0,1 cm = 0,001 m · W₁ = 100 · 0,1 = 10 J = W₂ = 10.000 · 0,001
 *     P = 100/(π · 0,01²) = 318.309,886 Pa
 *   F₁ = 50 N, A₁ = 10 cm² = 0,001 m², A₂ = 500 cm² = 0,05 m², x₁ = 20 cm
 *     ventaja 50 · F₂ = 2500 N · P = 50.000 Pa · x₂ = 0,2/50 = 0,004 m
 *
 *   TUBO EN U
 *   Agua (fondo, 1000) y aceite (añadido, 920), h_aceite = 10 cm
 *     h_agua = 920 · 10/1000 = 9,2 cm · desnivel 0,8 cm · P = 920 · 9,81 · 0,1 = 902,52 Pa
 *   Mercurio (fondo, 13.534) y agua (añadida, 1000), h_agua = 13,534 cm
 *     h_mercurio = 1000 · 13,534/13.534 = 1 cm · desnivel 12,534 cm
 *
 *   Datos imposibles (densidad 0 o negativa, NaN, área 0, profundidad negativa) → null.
 */

import { test, expect } from '@playwright/test';
import {
  calcularPresion,
  profundidadUnaAtmosfera,
  areaCirculo,
  calcularPrensa,
  casoTuboU,
  calcularTuboU,
  G,
  P_ATM,
  CM2_POR_M2,
} from '../app/simulador-principio-pascal/motor';

test.describe('Constantes', () => {
  test('g = 9,81 m/s², 1 atm = 101.325 Pa y 1 m² = 10.000 cm²', () => {
    expect(G).toBe(9.81);
    expect(P_ATM).toBe(101325);
    expect(CM2_POR_M2).toBe(10000);
  });
});

test.describe('Presión a una profundidad', () => {
  test('agua dulce a 10 m: 98.100 Pa del agua y 1,968 atm absolutas', () => {
    const r = calcularPresion(1000, 10);
    expect(r).not.toBeNull();
    expect(r!.presionHidrostatica).toBeCloseTo(98100, 6);
    expect(r!.presionAbsoluta).toBeCloseTo(199425, 6);
    expect(r!.presionAbsolutaAtm).toBeCloseTo(1.968172, 6);
    expect(r!.presionHidrostaticaAtm).toBeCloseTo(0.968172, 6);
  });

  test('agua de mar a 100 m: 1.005.525 Pa del agua y 10,92 atm absolutas', () => {
    const r = calcularPresion(1025, 100);
    expect(r!.presionHidrostatica).toBeCloseTo(1005525, 4);
    expect(r!.presionAbsoluta).toBeCloseTo(1106850, 4);
    expect(r!.presionAbsolutaAtm).toBeCloseTo(10.92376, 5);
  });

  test('columna de mercurio de 76 cm: 100.904,09 Pa, casi una atmósfera', () => {
    const r = calcularPresion(13534, 0.76);
    expect(r!.presionHidrostatica).toBeCloseTo(100904.0904, 3);
    expect(r!.presionHidrostaticaAtm).toBeCloseTo(0.995846, 5);
  });

  test('en la superficie el líquido no añade nada: P_abs = P₀', () => {
    const r = calcularPresion(1000, 0);
    expect(r!.presionHidrostatica).toBe(0);
    expect(r!.presionAbsoluta).toBe(P_ATM);
    expect(r!.presionAbsolutaAtm).toBe(1);
  });

  test('P₀ distinta de 1 atm (un depósito cerrado a 2 bar) se suma tal cual', () => {
    const r = calcularPresion(1000, 10, 200000);
    expect(r!.presionAbsoluta).toBeCloseTo(298100, 6);
  });

  test('la presión crece en proporción a la profundidad', () => {
    const a = calcularPresion(1000, 5)!;
    const b = calcularPresion(1000, 15)!;
    expect(b.presionHidrostatica / a.presionHidrostatica).toBeCloseTo(3, 12);
  });

  test('una atmósfera de agua dulce son 10,33 m', () => {
    expect(profundidadUnaAtmosfera(1000)).toBeCloseTo(10.328746, 5);
    expect(profundidadUnaAtmosfera(0)).toBeNull();
  });

  test('datos imposibles → null', () => {
    expect(calcularPresion(0, 10)).toBeNull();
    expect(calcularPresion(-1000, 10)).toBeNull();
    expect(calcularPresion(Number.NaN, 10)).toBeNull();
    expect(calcularPresion(1000, -1)).toBeNull();
    expect(calcularPresion(1000, Number.POSITIVE_INFINITY)).toBeNull();
  });
});

test.describe('Prensa hidráulica', () => {
  test('área de un círculo de 2 cm de diámetro: π cm²', () => {
    expect(areaCirculo(2)).toBeCloseTo(Math.PI, 12);
    expect(areaCirculo(0)).toBeNull();
  });

  test('100 N sobre 2 cm de diámetro levantan 10.000 N en 20 cm de diámetro', () => {
    const a1 = areaCirculo(0.02)!;
    const a2 = areaCirculo(0.2)!;
    const r = calcularPrensa(100, a1, a2, 0.1);
    expect(r).not.toBeNull();
    expect(r!.ventaja).toBeCloseTo(100, 9);
    expect(r!.fuerzaSalida).toBeCloseTo(10000, 6);
    expect(r!.masaSostenida).toBeCloseTo(1019.368, 3);
    expect(r!.desplazamientoSalida).toBeCloseTo(0.001, 12);
    expect(r!.presion).toBeCloseTo(318309.886, 2);
  });

  test('el trabajo se conserva: F₁·x₁ = F₂·x₂ = 10 J', () => {
    const r = calcularPrensa(100, areaCirculo(0.02)!, areaCirculo(0.2)!, 0.1)!;
    expect(r.trabajoEntrada).toBeCloseTo(10, 9);
    expect(r.trabajoSalida).toBeCloseTo(10, 9);
  });

  test('con áreas dadas: 50 N, 10 cm² y 500 cm² → ×50, 2500 N y 50.000 Pa', () => {
    const r = calcularPrensa(50, 10 / CM2_POR_M2, 500 / CM2_POR_M2, 0.2)!;
    expect(r.ventaja).toBeCloseTo(50, 9);
    expect(r.fuerzaSalida).toBeCloseTo(2500, 6);
    expect(r.presion).toBeCloseTo(50000, 6);
    expect(r.desplazamientoSalida).toBeCloseTo(0.004, 12);
  });

  test('con el émbolo 2 menor que el 1 la fuerza se reduce y el recorrido crece', () => {
    const r = calcularPrensa(100, 0.02, 0.01, 0.05)!;
    expect(r.ventaja).toBeCloseTo(0.5, 12);
    expect(r.fuerzaSalida).toBeCloseTo(50, 9);
    expect(r.desplazamientoSalida).toBeCloseTo(0.1, 12);
  });

  test('sin desplazamiento no hay trabajo, pero sí fuerza', () => {
    const r = calcularPrensa(100, 0.01, 0.1, 0)!;
    expect(r.fuerzaSalida).toBeCloseTo(1000, 9);
    expect(r.trabajoEntrada).toBe(0);
    expect(r.desplazamientoSalida).toBe(0);
  });

  test('datos imposibles → null', () => {
    expect(calcularPrensa(0, 0.01, 0.1, 0.1)).toBeNull();
    expect(calcularPrensa(100, 0, 0.1, 0.1)).toBeNull();
    expect(calcularPrensa(100, 0.01, -0.1, 0.1)).toBeNull();
    expect(calcularPrensa(100, 0.01, 0.1, -0.1)).toBeNull();
    expect(calcularPrensa(Number.NaN, 0.01, 0.1, 0.1)).toBeNull();
  });
});

test.describe('Tubo en U con dos líquidos', () => {
  test('agua y aceite, 10 cm de aceite: 9,2 cm de agua y 0,8 cm de desnivel', () => {
    const r = calcularTuboU(1000, 920, 0.1);
    expect(r).not.toBeNull();
    expect(r!.alturaFondo).toBeCloseTo(0.092, 12);
    expect(r!.desnivel).toBeCloseTo(0.008, 12);
    expect(r!.presionSeparacion).toBeCloseTo(902.52, 6);
  });

  test('mercurio y agua, 13,534 cm de agua: 1 cm de mercurio', () => {
    const r = calcularTuboU(13534, 1000, 0.13534)!;
    expect(r.alturaFondo).toBeCloseTo(0.01, 12);
    expect(r.desnivel).toBeCloseTo(0.12534, 12);
  });

  test('las dos columnas ejercen la misma presión en la separación', () => {
    const r = calcularTuboU(1000, 789, 0.25)!;
    expect(1000 * G * r.alturaFondo).toBeCloseTo(r.presionSeparacion, 9);
  });

  test('qué caso es: equilibrio, mismo líquido o añadido más denso', () => {
    expect(casoTuboU(1000, 920)).toBe('equilibrio');
    expect(casoTuboU(1000, 1000)).toBe('mismo-liquido');
    expect(casoTuboU(1000, 13534)).toBe('anadido-mas-denso');
  });

  test('si el líquido añadido no es menos denso no hay equilibrio que calcular', () => {
    expect(calcularTuboU(1000, 1000, 0.1)).toBeNull();
    expect(calcularTuboU(1000, 13534, 0.1)).toBeNull();
  });

  test('datos imposibles → null', () => {
    expect(calcularTuboU(0, 920, 0.1)).toBeNull();
    expect(calcularTuboU(1000, 920, 0)).toBeNull();
    expect(calcularTuboU(1000, Number.NaN, 0.1)).toBeNull();
  });
});
