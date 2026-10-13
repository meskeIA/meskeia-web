import { test, expect } from '@playwright/test';
import {
  ciede2000,
  srgbALab,
  compararColores,
  nivelDiferencia,
  VISIONES_COMPARADAS,
} from '@/lib/calculadoras/diferenciaColor';
import { MATRICES_CVD, srgbALineal, linealASrgb } from '@/lib/calculadoras/daltonismo';

/**
 * Motor de diferencia de color — sRGB → CIELAB → ΔE00 (semilla S0202, 13/10/2026)
 *
 * Los valores esperados NO salen del propio motor: los ΔE00 son los pares publicados por
 * Sharma, Wu y Dalal (2005), tabla de datos de prueba, con 4 decimales; los Lab de referencia
 * son los de sRGB D65 que tabula cualquier conversor (blanco = 100/0/0, rojo puro ≈
 * 53,24/80,09/67,20).
 */

// ═══════════════════════════════════════════════════════════════════════════
// CIEDE2000 contra los pares de Sharma et al. (2005)
// ═══════════════════════════════════════════════════════════════════════════
const PARES_SHARMA: { n: number; l1: [number, number, number]; l2: [number, number, number]; de: number }[] = [
  { n: 1, l1: [50, 2.6772, -79.7751], l2: [50, 0, -82.7485], de: 2.0425 },
  { n: 2, l1: [50, 3.1571, -77.2803], l2: [50, 0, -82.7485], de: 2.8615 },
  { n: 3, l1: [50, 2.8361, -74.02], l2: [50, 0, -82.7485], de: 3.4412 },
  { n: 4, l1: [50, -1.3802, -84.2814], l2: [50, 0, -82.7485], de: 1.0 },
  { n: 7, l1: [50, 0, 0], l2: [50, -1, 2], de: 2.3669 },
  { n: 8, l1: [50, -1, 2], l2: [50, 0, 0], de: 2.3669 },
  // 9-12: los dos tonos quedan a lados opuestos de 0°/180°. Es donde fallan las
  // implementaciones que promedian el tono sin mirar la diferencia angular.
  { n: 9, l1: [50, 2.49, -0.001], l2: [50, -2.49, 0.0009], de: 7.1792 },
  { n: 10, l1: [50, 2.49, -0.001], l2: [50, -2.49, 0.001], de: 7.1792 },
  { n: 11, l1: [50, 2.49, -0.001], l2: [50, -2.49, 0.0011], de: 7.2195 },
  { n: 12, l1: [50, 2.49, -0.001], l2: [50, -2.49, 0.0012], de: 7.2195 },
  { n: 17, l1: [50, 2.5, 0], l2: [73, 25, -18], de: 27.1492 },
  { n: 18, l1: [50, 2.5, 0], l2: [61, -5, 29], de: 22.8977 },
  { n: 19, l1: [50, 2.5, 0], l2: [56, -27, -3], de: 31.903 },
  { n: 20, l1: [50, 2.5, 0], l2: [58, 24, 15], de: 19.4535 },
  { n: 25, l1: [60.2574, -34.0099, 36.2677], l2: [60.4626, -34.1751, 39.4387], de: 1.2644 },
];

test.describe('ΔE00 — pares de prueba de Sharma, Wu y Dalal (2005)', () => {
  for (const p of PARES_SHARMA) {
    test(`par ${p.n} → ${p.de}`, () => {
      const [L1, a1, b1] = p.l1;
      const [L2, a2, b2] = p.l2;
      expect(ciede2000({ L: L1, a: a1, b: b1 }, { L: L2, a: a2, b: b2 })).toBeCloseTo(p.de, 4);
    });
  }

  test('es simétrico y vale 0 entre un color y sí mismo', () => {
    const x = { L: 41, a: 12.5, b: -30 };
    const y = { L: 63, a: -8, b: 4 };
    expect(ciede2000(x, x)).toBe(0);
    expect(ciede2000(x, y)).toBeCloseTo(ciede2000(y, x), 10);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// sRGB → CIELAB (D65)
// ═══════════════════════════════════════════════════════════════════════════
test.describe('sRGB → CIELAB', () => {
  test('blanco, negro, gris medio y rojo puro', () => {
    const blanco = srgbALab([255, 255, 255]);
    expect(blanco.L).toBeCloseTo(100, 2);
    expect(Math.abs(blanco.a)).toBeLessThan(0.01);
    expect(Math.abs(blanco.b)).toBeLessThan(0.01);

    expect(srgbALab([0, 0, 0])).toEqual({ L: 0, a: 0, b: 0 });

    // El gris sRGB 119 es el de L* ≈ 50: la mitad perceptual, no la mitad de 255.
    expect(srgbALab([119, 119, 119]).L).toBeCloseTo(50, 0);

    const rojo = srgbALab([255, 0, 0]);
    expect(rojo.L).toBeCloseTo(53.24, 1);
    expect(rojo.a).toBeCloseTo(80.09, 1);
    expect(rojo.b).toBeCloseTo(67.2, 1);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Comparación por visión
// ═══════════════════════════════════════════════════════════════════════════
test.describe('compararColores', () => {
  test('la fila de visión típica es exactamente el ΔE00 de los dos colores sin simular', () => {
    const a = [30, 60, 140] as const;
    const b = [40, 50, 120] as const;
    const filas = compararColores(a, b);
    expect(filas.map((f) => f.tipo)).toEqual(VISIONES_COMPARADAS.map((v) => v.tipo));
    expect(filas[0].tipo).toBe('normal');
    expect(filas[0].deltaE).toBeCloseTo(ciede2000(srgbALab(a), srgbALab(b)), 10);
    expect(filas[0].a).toEqual([30, 60, 140]);
  });

  test('un color contra sí mismo: diferencia 0 en todas las visiones', () => {
    for (const fila of compararColores([200, 120, 40], [200, 120, 40])) {
      expect(fila.deltaE).toBe(0);
      expect(fila.nivel).toBe('iguales');
    }
  });

  /**
   * Un par de CONFUSIÓN de verdad, construido sin el motor: la matriz de deuteranopía de
   * Machado es (casi) singular, así que dos colores que difieren solo en la dirección de su
   * núcleo salen iguales tras la simulación. El núcleo es el producto vectorial de dos filas.
   * Partiendo de un gris, ese desplazamiento da un par que una visión típica distingue de
   * sobra y una deuteranopía no.
   */
  test('un par construido sobre el núcleo de la deuteranopía: distinto en visión típica, indistinguible con deuteranopía', () => {
    const m = MATRICES_CVD.deuteranopia;
    const n = [
      m[0][1] * m[1][2] - m[0][2] * m[1][1],
      m[0][2] * m[1][0] - m[0][0] * m[1][2],
      m[0][0] * m[1][1] - m[0][1] * m[1][0],
    ];
    const norma = Math.max(...n.map(Math.abs));
    const base = srgbALineal(128);
    const t = 0.12 / norma; // desplazamiento que deja los tres canales dentro de [0, 1]
    const a = n.map((x) => linealASrgb(base + t * x)) as [number, number, number];
    const b = n.map((x) => linealASrgb(base - t * x)) as [number, number, number];

    const filas = compararColores(a, b);
    const tipica = filas.find((f) => f.tipo === 'normal')!;
    const deutan = filas.find((f) => f.tipo === 'deuteranopia')!;
    expect(tipica.nivel).toBe('distintos');
    expect(deutan.deltaE).toBeLessThan(UMBRAL_IGUALES);
  });
});

const UMBRAL_IGUALES = 1;

test('nivelDiferencia: los cuatro tramos y sus fronteras', () => {
  expect(nivelDiferencia(0)).toBe('iguales');
  expect(nivelDiferencia(0.99)).toBe('iguales');
  expect(nivelDiferencia(1)).toBe('casi-iguales');
  expect(nivelDiferencia(2.49)).toBe('casi-iguales');
  expect(nivelDiferencia(2.5)).toBe('parecidos');
  expect(nivelDiferencia(5.99)).toBe('parecidos');
  expect(nivelDiferencia(6)).toBe('distintos');
  expect(nivelDiferencia(40)).toBe('distintos');
});
