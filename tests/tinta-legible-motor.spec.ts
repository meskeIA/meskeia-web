import { test, expect } from '@playwright/test';
import { contraste, luminancia, rgbDeHex, tintaSobre, TINTA_CLARA, TINTA_OSCURA } from '../lib/tintaLegible';

/**
 * lib/tintaLegible.ts (cabo C0297, 06/11/2026). Casos a mano con la fórmula WCAG 2.x:
 *   · blanco sobre negro: (1 + 0,05) / (0 + 0,05) = 21.
 *   · #2E86AB: R 46 → 0,0273, G 134 → 0,2384, B 171 → 0,4072;
 *     L = 0,2126·0,0273 + 0,7152·0,2384 + 0,0722·0,4072 = 0,2057.
 *     Con blanco, 1,05 / 0,2557 = 4,11; con #1A1A1A (L 0,0103), 0,2557 / 0,0603 = 4,24.
 *   · #7FB3D3 (el TN de simulador-teorema-bayes): blanco 2,26 → la tinta es la oscura.
 *   · #A82E68 (el FN): blanco ≈ 6,4, oscura ≈ 2,7 → blanca.
 */
test.describe('tintaLegible', () => {
  test('lee hexadecimales de 3 y 6 cifras y rechaza lo demás', () => {
    expect(rgbDeHex('#2E86AB')).toEqual([46, 134, 171]);
    expect(rgbDeHex('fff')).toEqual([255, 255, 255]);
    expect(rgbDeHex('rgb(1,2,3)')).toBeNull();
    expect(Number.isNaN(luminancia('azul'))).toBe(true);
  });

  test('el contraste coincide con el cálculo a mano', () => {
    expect(contraste('#FFFFFF', '#000000')).toBeCloseTo(21, 5);
    expect(luminancia('#2E86AB')).toBeCloseTo(0.2057, 3);
    expect(contraste(TINTA_CLARA, '#2E86AB')).toBeCloseTo(4.11, 2);
    expect(contraste(TINTA_OSCURA, '#2E86AB')).toBeCloseTo(4.24, 2);
    // El orden de los argumentos no importa
    expect(contraste('#2E86AB', '#FFFFFF')).toBeCloseTo(contraste('#FFFFFF', '#2E86AB'), 10);
  });

  test('elige la tinta que más contrasta, y con la marca ninguna llega a 4,5', () => {
    expect(tintaSobre('#7FB3D3')).toBe(TINTA_OSCURA);
    expect(contraste(tintaSobre('#7FB3D3'), '#7FB3D3')).toBeGreaterThanOrEqual(4.5);
    expect(tintaSobre('#A82E68')).toBe(TINTA_CLARA);
    expect(tintaSobre('#48A9A6')).toBe(TINTA_OSCURA);
    expect(tintaSobre('#E07A1F')).toBe(TINTA_OSCURA);
    expect(tintaSobre('#26718F')).toBe(TINTA_CLARA);
    expect(contraste(tintaSobre('#26718F'), '#26718F')).toBeGreaterThanOrEqual(4.5);
    // El azul de marca es un tono medio: hay que oscurecer el relleno, no basta la tinta
    expect(contraste(tintaSobre('#2E86AB'), '#2E86AB')).toBeLessThan(4.5);
  });
});
