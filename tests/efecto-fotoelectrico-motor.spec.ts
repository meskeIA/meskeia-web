/**
 * Tests unitarios del motor de simulador-efecto-fotoelectrico
 *
 * Ejecutar: npx playwright test --config playwright.calc.config.ts tests/efecto-fotoelectrico-motor.spec.ts
 *
 * Constantes CODATA 2018 (h, e y c exactas desde el SI de 2019):
 *   h = 6,62607015·10⁻³⁴ J·s · e = 1,602176634·10⁻¹⁹ C · c = 299.792.458 m/s
 *   mₑ = 9,1093837015·10⁻³¹ kg
 *
 * Casos resueltos A MANO (calculadora, sin pasar por el motor):
 *
 *   h·c/e = 6,62607015e−34 × 299.792.458 / 1,602176634e−19 = 1,2398419843e−6 eV·m
 *         = 1.239,8419843 eV·nm  (el «1.240 eV·nm» de los libros, redondeado)
 *
 *   λ = 400 nm (violeta):
 *     E = 1.239,8419843 / 400 = 3,0996050 eV  →  × e = 4,966115·10⁻¹⁹ J
 *     f = c/λ = 299.792.458 / 4·10⁻⁷ = 7,49481145·10¹⁴ Hz
 *
 *   Sodio, φ = 2,46 eV (Serway y Jewett, tabla 40.1), a 400 nm:
 *     E_c = 3,0996050 − 2,46 = 0,6396050 eV  →  V₀ = 0,639605 V (mismo número)
 *     v = √(2 · 0,6396050 · 1,602176634e−19 / 9,1093837015e−31)
 *       = √(2,249889e11) = 4,743311·10⁵ m/s
 *     λ₀ = 1.239,8419843 / 2,46 = 504,0008 nm (verde: el sodio emite con luz visible)
 *     f₀ = 2,46 · 1,602176634e−19 / 6,62607015e−34 = 5,948254·10¹⁴ Hz
 *
 *   Cobre, φ = 4,70 eV, a 400 nm:
 *     E = 3,0996 eV < 4,70 eV → NO hay emisión, y la corriente es 0 aunque la intensidad
 *     sea el 100 %. Es la observación que la física clásica no explicaba.
 *
 *   Cobre a 200 nm (ultravioleta):
 *     E = 1.239,8419843 / 200 = 6,1992099 eV → E_c = 6,1992099 − 4,70 = 1,4992099 eV
 *     λ₀ del cobre = 1.239,8419843 / 4,70 = 263,7962 nm
 *
 *   Justo en el umbral (λ = λ₀): E_c = 0 exacto. Se trata como SIN emisión neta (el electrón
 *   no sale con energía para llegar a ningún colector).
 *
 *   λ ≤ 0, NaN o φ ≤ 0 → null: no hay fotón ni metal con los que calcular.
 */

import { test, expect } from '@playwright/test';
import {
  HC_EV_NM,
  METALES,
  energiaFotonEV,
  frecuenciaDeLambda,
  frecuenciaUmbral,
  longitudUmbralNm,
  calcularFotoelectrico,
  corrienteRelativa,
  rectaEinstein,
  regionEspectro,
} from '../app/simulador-efecto-fotoelectrico/motor';

/** Comprueba un valor con una tolerancia RELATIVA (para magnitudes como 10¹⁴ o 10⁵). */
function cercaRelativo(valor: number | null | undefined, esperado: number, tolRel = 1e-6) {
  expect(valor).not.toBeNull();
  expect(Math.abs((valor as number) - esperado) / Math.abs(esperado)).toBeLessThan(tolRel);
}

test.describe('Constantes y fotón', () => {
  test('h·c = 1.239,8419843 eV·nm', () => {
    expect(HC_EV_NM).toBeCloseTo(1239.8419843, 6);
  });

  test('λ = 400 nm: E = 3,0996050 eV y f = 7,49481145·10¹⁴ Hz', () => {
    expect(energiaFotonEV(400)).toBeCloseTo(3.099605, 6);
    cercaRelativo(frecuenciaDeLambda(400), 7.49481145e14, 1e-9);
    const r = calcularFotoelectrico(400, 2.46);
    cercaRelativo(r?.energiaFotonJ, 4.966115e-19, 1e-6);
  });

  test('región del espectro con los límites 380 y 750 nm', () => {
    expect(regionEspectro(379)).toBe('ultravioleta');
    expect(regionEspectro(380)).toBe('visible');
    expect(regionEspectro(750)).toBe('visible');
    expect(regionEspectro(751)).toBe('infrarrojo');
  });
});

test.describe('Sodio (φ = 2,46 eV) a 400 nm: hay emisión', () => {
  test('E_c, V₀, v, λ₀ y f₀', () => {
    const r = calcularFotoelectrico(400, 2.46);
    expect(r).not.toBeNull();
    expect(r?.hayEmision).toBe(true);
    expect(r?.energiaCineticaEV).toBeCloseTo(0.639605, 6);
    expect(r?.potencialFrenado).toBeCloseTo(0.639605, 6);
    cercaRelativo(r?.velocidadMax, 4.743311e5, 1e-6);
    expect(r?.longitudUmbralNm).toBeCloseTo(504.0008, 4);
    cercaRelativo(r?.frecuenciaUmbral, 5.948254e14, 1e-6);
    // Las mismas cifras por las funciones elementales
    expect(longitudUmbralNm(2.46)).toBeCloseTo(504.0008, 4);
    cercaRelativo(frecuenciaUmbral(2.46), 5.948254e14, 1e-6);
  });

  test('la intensidad cambia la corriente, NO la energía', () => {
    expect(corrienteRelativa(400, 2.46, 30)).toBe(30);
    expect(corrienteRelativa(400, 2.46, 100)).toBe(100);
    expect(corrienteRelativa(400, 2.46, 0)).toBe(0);
    // calcularFotoelectrico ni siquiera recibe la intensidad: la energía es la misma
    // con cualquier intensidad, y eso es lo que se comprueba aquí por construcción.
    expect(calcularFotoelectrico(400, 2.46)?.energiaCineticaEV).toBeCloseTo(0.639605, 6);
  });
});

test.describe('Cobre (φ = 4,70 eV)', () => {
  test('a 400 nm NO hay emisión y la corriente es 0 con intensidad 100 %', () => {
    const r = calcularFotoelectrico(400, 4.7);
    expect(r?.hayEmision).toBe(false);
    expect(r?.energiaCineticaEV).toBe(0);
    expect(r?.velocidadMax).toBe(0);
    expect(r?.potencialFrenado).toBe(0);
    expect(r?.margenEV).toBeCloseTo(3.099605 - 4.7, 6);
    expect(corrienteRelativa(400, 4.7, 100)).toBe(0);
  });

  test('a 200 nm: E_c = 1,4992099 eV · λ₀ = 263,7962 nm', () => {
    const r = calcularFotoelectrico(200, 4.7);
    expect(r?.hayEmision).toBe(true);
    expect(r?.energiaCineticaEV).toBeCloseTo(1.4992099, 6);
    expect(r?.longitudUmbralNm).toBeCloseTo(263.7962, 4);
    expect(corrienteRelativa(200, 4.7, 100)).toBe(100);
  });
});

test.describe('Umbral y entradas no válidas', () => {
  test('justo en λ = λ₀ la energía cinética es 0: sin emisión neta', () => {
    for (const metal of METALES) {
      const lambda0 = longitudUmbralNm(metal.phi) as number;
      const r = calcularFotoelectrico(lambda0, metal.phi);
      expect(r?.hayEmision, metal.nombre).toBe(false);
      expect(r?.energiaCineticaEV, metal.nombre).toBe(0);
      expect(corrienteRelativa(lambda0, metal.phi, 100), metal.nombre).toBe(0);
    }
  });

  test('la recta de Einstein corta el eje f en f₀ y el eje E_c en −φ', () => {
    const f0 = frecuenciaUmbral(2.46) as number;
    expect(rectaEinstein(f0, 2.46)).toBeCloseTo(0, 9);
    expect(rectaEinstein(0, 2.46)).toBe(-2.46);
    // Pendiente h: entre f₀ y f₀ + 10¹⁴ Hz sube h·10¹⁴/e = 0,4135667 eV
    expect(rectaEinstein(f0 + 1e14, 2.46)).toBeCloseTo(0.4135667, 6);
  });

  test('λ ≤ 0, NaN o φ ≤ 0 → null', () => {
    expect(calcularFotoelectrico(0, 2.46)).toBeNull();
    expect(calcularFotoelectrico(-400, 2.46)).toBeNull();
    expect(calcularFotoelectrico(Number.NaN, 2.46)).toBeNull();
    expect(calcularFotoelectrico(400, 0)).toBeNull();
    expect(calcularFotoelectrico(400, -1)).toBeNull();
    expect(calcularFotoelectrico(400, Number.NaN)).toBeNull();
    expect(energiaFotonEV(0)).toBeNull();
    expect(frecuenciaDeLambda(Number.NaN)).toBeNull();
    expect(frecuenciaUmbral(0)).toBeNull();
    expect(longitudUmbralNm(-2)).toBeNull();
    expect(corrienteRelativa(400, 0, 50)).toBeNull();
    expect(corrienteRelativa(400, 2.46, Number.NaN)).toBeNull();
  });

  test('tabla 40.1: las ocho funciones de trabajo de Serway y Jewett', () => {
    expect(METALES.map((m) => [m.id, m.phi])).toEqual([
      ['sodio', 2.46],
      ['aluminio', 4.08],
      ['plomo', 4.14],
      ['zinc', 4.31],
      ['hierro', 4.5],
      ['cobre', 4.7],
      ['plata', 4.73],
      ['platino', 6.35],
    ]);
  });
});
