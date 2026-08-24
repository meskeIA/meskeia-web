/**
 * Motores de panadería: DDT (temperatura del agua) y tiempo de fermentación.
 *
 * Ejecutar con: npm run test:calc  (lógica pura en Node, sin navegador ni servidor)
 *
 * Por qué existe: hasta el 24/08/2026 ninguno de los dos motores tenía test, y ese día
 * `calculadora-porcentaje-panadero` —83 usos/30 d, la app que sostiene Coquinum junto a
 * `calculadora-masa-madre`— los absorbió como pasos 2 y 3 de la misma sesión de amasado.
 * Un motor que pasa de una página con 4 visitas al mes a otra con 83 merece su candado:
 * el build no puede ver que una fórmula térmica esté mal, solo que compile.
 *
 * Los valores esperados están calculados a mano a partir de las fórmulas, que son públicas
 * y elementales:
 *   · DDT (3 factores):  T_agua = DDT × 3 − T_ambiente − T_harina − T_fricción
 *   · DDT (4 factores):  T_agua = DDT × 4 − T_ambiente − T_harina − T_fricción − T_prefermento
 *   · Fermentación (Q10 = 2): tiempo = tiempo_receta × 2^((T_receta − T_real) / 10)
 */

import { test, expect } from '@playwright/test';
import { calcularDDT } from '../lib/calculadoras/cocina';
import {
  ajustarFermentacion,
  formatearTiempo,
} from '../lib/calculadoras/fermentacionTemperatura';

test.describe('DDT — temperatura del agua de amasado', () => {
  test('A MANO: 24 °C de objetivo, cocina y harina a 22 °C, sin amasadora → agua a 28 °C', () => {
    // 24 × 3 − 22 − 22 − 0 = 28   (son los valores por defecto del bloque de la app)
    const r = calcularDDT(24, 22, 22, 'manual');
    expect(r.temperatura_agua_c).toBe(28);
    expect(r.advertencia).toBeNull();
  });

  test('FRICCIÓN: la amasadora de pie resta sus 8 °C al agua', () => {
    // 24 × 3 − 22 − 22 − 8 = 20
    expect(calcularDDT(24, 22, 22, 'kitchen_aid').temperatura_agua_c).toBe(20);
    // 24 × 3 − 22 − 22 − 12 = 16
    expect(calcularDDT(24, 22, 22, 'thermomix').temperatura_agua_c).toBe(16);
  });

  test('CUATRO FACTORES: con prefermento la fórmula multiplica por 4 y resta su temperatura', () => {
    // 24 × 4 − 20 − 20 − 0 − 20 = 36
    expect(calcularDDT(24, 20, 20, 'manual', 20).temperatura_agua_c).toBe(36);
  });

  test('MONOTONÍA: cuanto más caliente la cocina, más fría tiene que ir el agua', () => {
    const fria = calcularDDT(24, 16, 16, 'manual').temperatura_agua_c;
    const templada = calcularDDT(24, 22, 22, 'manual').temperatura_agua_c;
    const calurosa = calcularDDT(24, 30, 30, 'manual').temperatura_agua_c;
    expect(fria).toBeGreaterThan(templada);
    expect(templada).toBeGreaterThan(calurosa);
  });

  test('AVISO: por encima de 40 °C el agua empieza a dañar la levadura y hay que decirlo', () => {
    // 30 × 3 − 15 − 15 − 0 = 60
    const r = calcularDDT(30, 15, 15, 'manual');
    expect(r.temperatura_agua_c).toBe(60);
    expect(r.advertencia).not.toBeNull();
  });

  test('CONVERSIÓN: los grados Fahrenheit son los mismos grados, no otro cálculo', () => {
    const r = calcularDDT(24, 22, 22, 'manual');
    expect(r.temperatura_agua_f).toBeCloseTo(r.temperatura_agua_c * 9 / 5 + 32, 1);
  });
});

test.describe('Fermentación — el mismo pan a otra temperatura', () => {
  test('A MANO: +10 °C sobre la receta reduce el tiempo a la mitad', () => {
    const r = ajustarFermentacion(4, 24, 34);
    expect(r?.tiempoHoras).toBe(2);
    expect(r?.masRapido).toBe(true);
  });

  test('A MANO: −10 °C sobre la receta lo duplica', () => {
    const r = ajustarFermentacion(4, 24, 14);
    expect(r?.tiempoHoras).toBe(8);
    expect(r?.masRapido).toBe(false);
  });

  test('NEUTRO: a la temperatura de la receta, el tiempo es el de la receta', () => {
    const r = ajustarFermentacion(3, 24, 24);
    expect(r?.tiempoHoras).toBe(3);
    expect(r?.factor).toBe(1);
    expect(r?.masRapido).toBe(false);
  });

  test('A MANO: los valores por defecto del bloque (2 h de 24 °C a 22 °C) dan 2 h 18 min', () => {
    // factor = 2^(2/10) = 1,1487 → 2 × 1,1487 = 2,3 h
    const r = ajustarFermentacion(2, 24, 22);
    expect(r?.tiempoHoras).toBe(2.3);
    expect(formatearTiempo(r!.tiempoHoras)).toBe('2 h 18 min');
  });

  test('SIN TIEMPO NO HAY ESTIMACIÓN: un tiempo de receta no positivo devuelve null', () => {
    expect(ajustarFermentacion(0, 24, 22)).toBeNull();
    expect(ajustarFermentacion(-1, 24, 22)).toBeNull();
  });

  test('FORMATO: horas y minutos en español, sin decimales sueltos', () => {
    expect(formatearTiempo(1)).toBe('1 h');
    expect(formatearTiempo(0.5)).toBe('30 min');
    expect(formatearTiempo(0)).toBe('—');
  });
});
