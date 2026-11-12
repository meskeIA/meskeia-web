/**
 * Tests del motor lux ↔ candelas ↔ lúmenes (lib/calculadoras/luxLumenes.ts), del luxómetro.
 *
 * Ejecutar: npx playwright test --config playwright.calc.config.ts tests/lux-lumenes-motor.spec.ts
 *
 * Casos resueltos a mano (I = E·d² · Ω = 2π(1 − cos θ/2) · Φ = I·Ω · alcance = 2·√I):
 *
 *   100 lx a 2 m, 360°   → I = 100 · 4 = 400 cd · Ω = 4π = 12,566 sr · Φ = 5.026,5 lm · alcance 40 m
 *   1.000 lx a 1 m, 10°  → I = 1.000 cd · cos 5° = 0,996195 → Ω = 2π · 0,0038053 = 0,023910 sr
 *                          · Φ = 23,91 lm · alcance = 2 · 31,623 = 63,25 m
 *   100 lx a 2 m, 60°    → I = 400 cd · cos 30° = 0,866025 → Ω = 2π · 0,133975 = 0,841787 sr
 *                          · Φ = 336,71 lm
 *   180°                 → Ω = 2π(1 − cos 90°) = 2π = 6,2832 sr (media esfera)
 *   800 lm, 120°, 2 m    → Ω = 2π(1 − cos 60°) = π · I = 800/π = 254,65 cd · E = 254,65/4 = 63,66 lx
 *   0 lx                 → todo a 0 (es una lectura válida: oscuridad)
 */

import { test, expect } from '@playwright/test';
import { ANGULOS_TIPICOS, alcanceFl1, anguloSolido, desdeLumenes, desdeLux } from '../lib/calculadoras/luxLumenes';

function ok(r: ReturnType<typeof desdeLux>) {
  if (!r.ok) throw new Error(`se esperaba un resultado y salió el error «${r.error}»`);
  return r;
}

test.describe('Ángulo sólido', () => {
  test('360° es la esfera entera, 180° la media', () => {
    expect(anguloSolido(360)).toBeCloseTo(4 * Math.PI, 10);
    expect(anguloSolido(180)).toBeCloseTo(2 * Math.PI, 10);
  });
  test('120° es π (cos 60° = 1/2)', () => {
    expect(anguloSolido(120)).toBeCloseTo(Math.PI, 10);
  });
  test('10° y 60°, a mano', () => {
    expect(anguloSolido(10)).toBeCloseTo(0.02391, 5);
    expect(anguloSolido(60)).toBeCloseTo(0.841787, 5);
  });
  test('fuera de (0, 360] no hay cono', () => {
    expect(anguloSolido(0)).toBeNaN();
    expect(anguloSolido(-10)).toBeNaN();
    expect(anguloSolido(361)).toBeNaN();
    expect(anguloSolido(Number.NaN)).toBeNaN();
  });
});

test.describe('De lux a candelas y lúmenes', () => {
  test('100 lx a 2 m en todas direcciones', () => {
    const r = ok(desdeLux(100, 2, 360));
    expect(r.candelas).toBeCloseTo(400, 10);
    expect(r.lumenes).toBeCloseTo(5026.548, 2);
    expect(r.alcanceFl1).toBeCloseTo(40, 10);
  });
  test('linterna: 1.000 lx a 1 m con haz de 10°', () => {
    const r = ok(desdeLux(1000, 1, 10));
    expect(r.candelas).toBeCloseTo(1000, 10);
    expect(r.lumenes).toBeCloseTo(23.91, 2);
    expect(r.alcanceFl1).toBeCloseTo(63.246, 2);
  });
  test('downlight: 100 lx a 2 m con haz de 60°', () => {
    const r = ok(desdeLux(100, 2, 60));
    expect(r.lumenes).toBeCloseTo(336.71, 1);
  });
  test('la intensidad no depende del ángulo; el flujo sí', () => {
    const estrecho = ok(desdeLux(100, 2, 10));
    const ancho = ok(desdeLux(100, 2, 120));
    expect(estrecho.candelas).toBe(ancho.candelas);
    expect(ancho.lumenes).toBeGreaterThan(estrecho.lumenes);
  });
  test('0 lx es una lectura válida y da 0', () => {
    const r = ok(desdeLux(0, 1, 60));
    expect(r.candelas).toBe(0);
    expect(r.lumenes).toBe(0);
    expect(r.alcanceFl1).toBe(0);
  });
});

test.describe('De lúmenes a lux', () => {
  test('800 lm con haz de 120° a 2 m', () => {
    const r = ok(desdeLumenes(800, 2, 120));
    expect(r.candelas).toBeCloseTo(254.648, 2);
    expect(r.lux).toBeCloseTo(63.662, 2);
  });
  test('ida y vuelta: lux → lúmenes → lux devuelve la lectura', () => {
    for (const { grados } of ANGULOS_TIPICOS) {
      const ida = ok(desdeLux(250, 3, grados));
      const vuelta = ok(desdeLumenes(ida.lumenes, 3, grados));
      expect(vuelta.lux).toBeCloseTo(250, 8);
    }
  });
  test('duplicar la distancia divide los lux entre 4', () => {
    const cerca = ok(desdeLumenes(1000, 1, 36));
    const lejos = ok(desdeLumenes(1000, 2, 36));
    expect(cerca.lux / lejos.lux).toBeCloseTo(4, 10);
  });
});

test.describe('Entradas que no valen', () => {
  test('distancia cero o negativa', () => {
    expect(desdeLux(100, 0, 60).ok).toBe(false);
    expect(desdeLumenes(100, -1, 60).ok).toBe(false);
  });
  test('ángulo fuera de rango', () => {
    expect(desdeLux(100, 1, 0).ok).toBe(false);
    expect(desdeLux(100, 1, 400).ok).toBe(false);
  });
  test('lux o lúmenes negativos o NaN (lo que devuelve parseSpanishNumber con texto)', () => {
    expect(desdeLux(-5, 1, 60).ok).toBe(false);
    expect(desdeLux(Number.NaN, 1, 60).ok).toBe(false);
    expect(desdeLumenes(Number.NaN, 1, 60).ok).toBe(false);
  });
  test('alcance de 0 cd es 0', () => {
    expect(alcanceFl1(0)).toBe(0);
  });
});
