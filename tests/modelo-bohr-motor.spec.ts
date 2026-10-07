/**
 * Tests unitarios del motor de simulador-modelo-bohr
 *
 * Ejecutar: npx playwright test --config playwright.calc.config.ts tests/modelo-bohr-motor.spec.ts
 *
 * Dos oráculos independientes del motor:
 *
 * 1 · LAS LÍNEAS MEDIDAS DEL HIDRÓGENO, en el VACÍO (NIST Atomic Spectra Database). El modelo de
 *     Bohr con masa reducida no ve la estructura fina, que abre cada línea unas centésimas de nm,
 *     así que se exige coincidencia a ±0,02 nm:
 *       Lyman α (2→1)    121,567 nm        Lyman β (3→1)  102,572 nm
 *       Hα (3→2)         656,46 nm  (656,28 en aire, la cifra que dan muchas tablas)
 *       Hβ (4→2)         486,27 nm  (486,13 en aire)
 *       Paschen α (4→3)  1875,6 nm
 *       Límite de Lyman  91,175 nm  ·  energía de ionización 13,598 eV
 *
 * 2 · CUENTAS A MANO con los valores redondos del libro de texto (13,6 eV, 1,097·10⁷ m⁻¹), que
 *     deben coincidir con el motor en las tres primeras cifras:
 *       E₂ = −13,6/4 = −3,40 eV · E₃ = −13,6/9 = −1,511 eV
 *       ΔE(3→2) = 13,6·(1/4 − 1/9) = 13,6·5/36 = 1,889 eV
 *       λ(3→2)  = 36/(5 · 1,097·10⁷) = 6,564·10⁻⁷ m = 656,4 nm
 *       Límite de Balmer = 4/1,097·10⁷ = 364,6 nm
 *       r₁ = a₀ = 0,0529 nm · r₂ = 4a₀ = 0,2117 nm · r₃ = 9a₀ = 0,4763 nm
 *       Ionizar desde n = 2: 13,6/4 = 3,40 eV
 */

import { test, expect } from '@playwright/test';
import {
  R_HIDROGENO,
  R_INFINITO,
  ENERGIA_IONIZACION_EV,
  energiaNivel,
  radioOrbitaNm,
  energiaIonizacionDesde,
  serieDeNivel,
  calcularTransicion,
  lineasDeSerie,
  esNivel,
} from '../app/simulador-modelo-bohr/motor';

/** |a − b| ≤ tolerancia, con mensaje legible si falla. */
function cerca(valor: number, esperado: number, tolerancia: number) {
  expect(Math.abs(valor - esperado), `${valor} frente a ${esperado}`).toBeLessThanOrEqual(tolerancia);
}

test.describe('Constantes', () => {
  test('R_H con masa reducida: 1,09678·10⁷ m⁻¹, un 0,05 % por debajo de R∞', () => {
    // A mano: 10.973.731,568 · (1 − 5,44321·10⁻⁴) = 10.973.731,568 − 5.973,23 = 10.967.758,3
    cerca(R_HIDROGENO, 10_967_758.3, 1);
    expect(R_HIDROGENO).toBeLessThan(R_INFINITO);
    cerca(1 - R_HIDROGENO / R_INFINITO, 0.000544, 0.000001);
  });

  test('energía de ionización 13,598 eV (NIST: 13,598434 eV)', () => {
    cerca(ENERGIA_IONIZACION_EV, 13.5984, 0.0002);
  });
});

test.describe('Niveles', () => {
  test('E₁ = −13,6 · E₂ = −3,40 · E₃ = −1,511 eV · E∞ = 0', () => {
    cerca(energiaNivel(1)!, -13.598, 0.001);
    cerca(energiaNivel(2)!, -3.3996, 0.001);
    cerca(energiaNivel(3)!, -1.5109, 0.001);
    expect(energiaNivel(Infinity)).toBe(0);
    expect(Object.is(energiaNivel(Infinity), -0)).toBe(false);
  });

  test('radios r₁ = 0,0529 · r₂ = 0,2117 · r₃ = 0,4763 nm (n²·a₀)', () => {
    cerca(radioOrbitaNm(1)!, 0.052918, 0.000001);
    cerca(radioOrbitaNm(2)!, 0.211671, 0.000001);
    cerca(radioOrbitaNm(3)!, 0.476259, 0.000001);
    expect(radioOrbitaNm(Infinity)).toBeNull();
  });

  test('ionizar desde n = 2 cuesta 3,40 eV, una cuarta parte que desde n = 1', () => {
    cerca(energiaIonizacionDesde(2)!, 3.3996, 0.001);
    cerca(energiaIonizacionDesde(1)! / energiaIonizacionDesde(2)!, 4, 1e-12);
  });

  test('niveles válidos: enteros desde 1 y ∞', () => {
    expect(esNivel(1)).toBe(true);
    expect(esNivel(7)).toBe(true);
    expect(esNivel(Infinity)).toBe(true);
    expect(esNivel(0)).toBe(false);
    expect(esNivel(-2)).toBe(false);
    expect(esNivel(2.5)).toBe(false);
    expect(esNivel(Number.NaN)).toBe(false);
    expect(energiaNivel(0)).toBeNull();
  });
});

test.describe('Líneas medidas del hidrógeno (NIST, vacío)', () => {
  test('Hα (3→2): 656,47 nm, roja, serie de Balmer, en emisión', () => {
    const t = calcularTransicion(3, 2)!;
    cerca(t.lambdaNm, 656.46, 0.02);
    expect(t.serie).toBe('Balmer');
    expect(t.sentido).toBe('emision');
    expect(t.region).toBe('visible');
    cerca(t.energiaFotonEV, 1.8887, 0.0005);
    cerca(t.frecuencia, 4.5668e14, 0.0002e14);
  });

  test('Hβ (4→2): 486,27 nm', () => {
    cerca(calcularTransicion(4, 2)!.lambdaNm, 486.27, 0.02);
  });

  test('Lyman α (2→1): 121,57 nm, ultravioleta', () => {
    const t = calcularTransicion(2, 1)!;
    cerca(t.lambdaNm, 121.567, 0.02);
    expect(t.serie).toBe('Lyman');
    expect(t.region).toBe('ultravioleta');
  });

  test('Lyman β (3→1): 102,57 nm', () => {
    cerca(calcularTransicion(3, 1)!.lambdaNm, 102.572, 0.02);
  });

  test('Paschen α (4→3): 1875,6 nm, infrarrojo', () => {
    const t = calcularTransicion(4, 3)!;
    cerca(t.lambdaNm, 1875.6, 0.2);
    expect(t.serie).toBe('Paschen');
    expect(t.region).toBe('infrarrojo');
  });

  test('límite de Lyman (∞→1): 91,18 nm = 1/R_H', () => {
    const t = calcularTransicion(Infinity, 1)!;
    cerca(t.lambdaNm, 91.175, 0.005);
    expect(t.esLimite).toBe(true);
    cerca(t.energiaFotonEV, ENERGIA_IONIZACION_EV, 1e-12);
  });
});

test.describe('Cuentas a mano con 13,6 eV y 1,097·10⁷ m⁻¹ (tres cifras)', () => {
  test('ΔE(3→2) = 1,889 eV y λ = 656,4 nm', () => {
    const t = calcularTransicion(3, 2)!;
    expect(Number(t.energiaFotonEV.toPrecision(3))).toBe(1.89);
    expect(Number(t.lambdaNm.toPrecision(3))).toBe(656);
  });

  test('límite de Balmer (∞→2): 364,6 nm', () => {
    cerca(calcularTransicion(Infinity, 2)!.lambdaNm, 364.6, 0.2);
  });

  test('el fotón vale lo que separa los dos niveles: ΔE = E_i − E_f', () => {
    for (const [i, f] of [[3, 2], [5, 1], [7, 4], [Infinity, 3]] as const) {
      const t = calcularTransicion(i, f)!;
      cerca(t.energiaFotonEV, energiaNivel(i)! - energiaNivel(f)!, 1e-12);
    }
  });

  test('λ·E = h·c = 1239,84 eV·nm en cualquier salto', () => {
    for (const [i, f] of [[2, 1], [3, 2], [6, 5]] as const) {
      const t = calcularTransicion(i, f)!;
      cerca(t.lambdaNm * t.energiaFotonEV, 1239.84198, 0.0001);
    }
  });
});

test.describe('Emisión y absorción', () => {
  test('subir de 1 a 3 absorbe el mismo fotón que se emite al bajar de 3 a 1', () => {
    const sube = calcularTransicion(1, 3)!;
    const baja = calcularTransicion(3, 1)!;
    expect(sube.sentido).toBe('absorcion');
    expect(baja.sentido).toBe('emision');
    cerca(sube.lambdaNm, baja.lambdaNm, 1e-9);
    cerca(sube.energiaFotonEV, 12.087, 0.001);
  });

  test('subir de 2 a ∞ es ionizar desde el nivel 2: 3,40 eV', () => {
    const t = calcularTransicion(2, Infinity)!;
    expect(t.sentido).toBe('absorcion');
    expect(t.esLimite).toBe(true);
    cerca(t.energiaFotonEV, energiaIonizacionDesde(2)!, 1e-12);
  });

  test('sin salto, o con niveles inválidos, no hay fotón', () => {
    expect(calcularTransicion(2, 2)).toBeNull();
    expect(calcularTransicion(Infinity, Infinity)).toBeNull();
    expect(calcularTransicion(0, 2)).toBeNull();
    expect(calcularTransicion(2.5, 1)).toBeNull();
  });
});

test.describe('Series', () => {
  test('nombre de la serie por el nivel inferior', () => {
    expect(serieDeNivel(1)).toBe('Lyman');
    expect(serieDeNivel(2)).toBe('Balmer');
    expect(serieDeNivel(3)).toBe('Paschen');
    expect(serieDeNivel(4)).toBe('Brackett');
    expect(serieDeNivel(5)).toBe('Pfund');
    expect(serieDeNivel(6)).toBe('Humphreys');
    expect(serieDeNivel(7)).toBeNull();
  });

  test('Balmer: las cuatro primeras líneas son visibles y el límite es ultravioleta', () => {
    const lineas = lineasDeSerie(2, 5);
    expect(lineas).toHaveLength(6);
    expect(lineas.slice(0, 4).map((l) => l.region)).toEqual(['visible', 'visible', 'visible', 'visible']);
    expect(lineas[5].nSuperior).toBe(Infinity);
    expect(lineas[5].region).toBe('ultravioleta');
  });

  test('cada serie va de la línea más larga a la más corta', () => {
    const lineas = lineasDeSerie(1, 5);
    for (let k = 1; k < lineas.length; k++) {
      expect(lineas[k].lambdaNm).toBeLessThan(lineas[k - 1].lambdaNm);
    }
  });

  test('toda la serie de Lyman es ultravioleta', () => {
    expect(lineasDeSerie(1).every((l) => l.region === 'ultravioleta')).toBe(true);
  });
});
