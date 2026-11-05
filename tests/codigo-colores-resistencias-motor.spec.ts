/**
 * Tests del motor del código de colores de resistencias (lib/calculadoras/codigoColoresResistencias.ts)
 *
 * Ejecutar: npx playwright test --config playwright.calc.config.ts tests/codigo-colores-resistencias-motor.spec.ts
 *
 * Casos resueltos a mano (cifras · multiplicador · tolerancia):
 *
 *   4 bandas  marrón-negro-rojo-dorado        10 × 10²  = 1.000 Ω ±5 %  → 950 a 1.050 Ω
 *   4 bandas  amarillo-violeta-rojo-dorado    47 × 10²  = 4.700 Ω ±5 %  → 4.465 a 4.935 Ω
 *   4 bandas  amarillo-violeta-dorado-dorado  47 × 0,1  = 4,7 Ω
 *   3 bandas  rojo-rojo-naranja               22 × 10³  = 22 kΩ, ±20 % implícito → 17,6 a 26,4 kΩ
 *   3 bandas  rojo-rojo-plateado              22 × 0,01 = 0,22 Ω
 *   5 bandas  marrón-negro-negro-marrón-marrón 100 × 10 = 1.000 Ω ±1 %
 *             leída al revés, marrón-marrón-negro-negro-marrón: 110 × 1 = 110 Ω ±1 %
 *   6 bandas  naranja-naranja-negro-marrón-marrón-rojo 330 × 10 = 3.300 Ω ±1 %, 50 ppm/K
 *
 *   Al revés: 4.700 Ω → amarillo-violeta-rojo · 4,7 Ω → amarillo-violeta-dorado ·
 *   0,22 Ω → rojo-rojo-plateado · 1.234 Ω con 2 cifras → 12 × 10² = 1.200 (no exacto),
 *   con 3 → 123 × 10 = 1.230 (no exacto) · 9.960 Ω con 2 cifras redondea a «100» × 10²,
 *   que se escribe 10 × 10³ = 10 kΩ (marrón-negro-naranja).
 *
 *   Normalizados (distancia logarítmica): 5.000 Ω en E12 → 4,7 kΩ (ln 5000/4700 = 0,062 frente
 *   a ln 5600/5000 = 0,113), un 6 % por debajo · 9,8 Ω en E12 → 10 Ω (década siguiente), no 8,2.
 */

import { test, expect } from '@playwright/test';
import {
  COLORES,
  SERIES,
  codificar,
  conUnidad,
  decodificar,
  decodificarAlReves,
  leerValor,
  rangoCodificable,
  seriesQueLoContienen,
  valorNormalizadoMasCercano,
} from '../lib/calculadoras/codigoColoresResistencias';

test.describe('Tabla de colores', () => {
  test('las cifras van del negro (0) al blanco (9), en orden', () => {
    const cifras = COLORES.filter((c) => c.cifra !== null).map((c) => [c.clave, c.cifra]);
    expect(cifras).toEqual([
      ['negro', 0], ['marron', 1], ['rojo', 2], ['naranja', 3], ['amarillo', 4],
      ['verde', 5], ['azul', 6], ['violeta', 7], ['gris', 8], ['blanco', 9],
    ]);
  });

  test('dorado y plateado multiplican por 0,1 y 0,01 y no son cifras', () => {
    const dorado = COLORES.find((c) => c.clave === 'dorado')!;
    const plateado = COLORES.find((c) => c.clave === 'plateado')!;
    expect([dorado.cifra, dorado.exponente, dorado.tolerancia]).toEqual([null, -1, 5]);
    expect([plateado.cifra, plateado.exponente, plateado.tolerancia]).toEqual([null, -2, 10]);
  });
});

test.describe('Decodificar', () => {
  test('4 bandas: marrón-negro-rojo-dorado = 1 kΩ ±5 %', () => {
    const r = decodificar(4, ['marron', 'negro', 'rojo', 'dorado'])!;
    expect(r.ohmios).toBe(1000);
    expect(r.tolerancia).toBe(5);
    expect([r.minimo, r.maximo]).toEqual([950, 1050]);
    expect(r.coefTemperatura).toBeNull();
  });

  test('4 bandas: amarillo-violeta-rojo-dorado = 4,7 kΩ, de 4.465 a 4.935 Ω', () => {
    const r = decodificar(4, ['amarillo', 'violeta', 'rojo', 'dorado'])!;
    expect(r.ohmios).toBe(4700);
    expect([r.minimo, r.maximo]).toEqual([4465, 4935]);
  });

  test('multiplicador dorado: amarillo-violeta-dorado = 4,7 Ω sin error de coma flotante', () => {
    expect(decodificar(4, ['amarillo', 'violeta', 'dorado', 'dorado'])!.ohmios).toBe(4.7);
  });

  test('3 bandas: rojo-rojo-naranja = 22 kΩ con el ±20 % implícito', () => {
    const r = decodificar(3, ['rojo', 'rojo', 'naranja'])!;
    expect(r.ohmios).toBe(22000);
    expect(r.tolerancia).toBe(20);
    expect(r.toleranciaImplicita).toBe(true);
    expect([r.minimo, r.maximo]).toEqual([17600, 26400]);
  });

  test('3 bandas con plateado: rojo-rojo-plateado = 0,22 Ω', () => {
    expect(decodificar(3, ['rojo', 'rojo', 'plateado'])!.ohmios).toBe(0.22);
  });

  test('5 bandas: marrón-negro-negro-marrón-marrón = 1 kΩ ±1 %', () => {
    const r = decodificar(5, ['marron', 'negro', 'negro', 'marron', 'marron'])!;
    expect(r.ohmios).toBe(1000);
    expect(r.tolerancia).toBe(1);
  });

  test('6 bandas: naranja-naranja-negro-marrón-marrón-rojo = 3,3 kΩ ±1 % y 50 ppm/K', () => {
    const r = decodificar(6, ['naranja', 'naranja', 'negro', 'marron', 'marron', 'rojo'])!;
    expect(r.ohmios).toBe(3300);
    expect(r.tolerancia).toBe(1);
    expect(r.coefTemperatura).toBe(50);
  });

  test('un color fuera de su sitio no da valor: dorado como cifra, naranja como tolerancia', () => {
    expect(decodificar(4, ['dorado', 'negro', 'rojo', 'dorado'])).toBeNull();
    expect(decodificar(4, ['marron', 'negro', 'rojo', 'naranja'])).toBeNull();
    expect(decodificar(4, ['marron', 'negro', 'rojo'])).toBeNull();
  });

  test('avisa de la primera cifra negra', () => {
    expect(decodificar(4, ['negro', 'marron', 'rojo', 'dorado'])!.empiezaPorNegro).toBe(true);
    expect(decodificar(4, ['marron', 'negro', 'rojo', 'dorado'])!.empiezaPorNegro).toBe(false);
  });
});

test.describe('Leer al revés', () => {
  test('con el dorado a la derecha, al revés no es una resistencia posible', () => {
    expect(decodificarAlReves(4, ['marron', 'negro', 'rojo', 'dorado'])).toBeNull();
  });

  test('5 bandas ambiguas: 1 kΩ en un sentido y 110 Ω en el otro', () => {
    const r = decodificarAlReves(5, ['marron', 'negro', 'negro', 'marron', 'marron'])!;
    expect(r.ohmios).toBe(110);
    expect(r.tolerancia).toBe(1);
  });

  test('con 3 bandas no se propone lectura inversa', () => {
    expect(decodificarAlReves(3, ['rojo', 'rojo', 'naranja'])).toBeNull();
  });
});

test.describe('Series normalizadas', () => {
  test('E96 coincide con round(10^(i/96)·100) en sus 96 valores', () => {
    const formula = [...Array(96)].map((_, i) => Math.round(10 ** (i / 96) * 100));
    expect(SERIES.E96).toEqual(formula);
  });

  test('E24 lleva los ocho valores históricos que la fórmula no da', () => {
    for (const m of [270, 300, 330, 360, 390, 430, 470, 820]) expect(SERIES.E24).toContain(m);
    expect(SERIES.E24).toHaveLength(24);
  });

  test('E12 y E6 son los de siempre', () => {
    expect(SERIES.E12).toEqual([100, 120, 150, 180, 220, 270, 330, 390, 470, 560, 680, 820]);
    expect(SERIES.E6).toEqual([100, 150, 220, 330, 470, 680]);
    expect(SERIES.E48).toHaveLength(48);
  });

  test('4,7 kΩ está en E6, E12 y E24, pero no en E48 ni E96', () => {
    expect(seriesQueLoContienen(4700)).toEqual(['E6', 'E12', 'E24']);
  });

  test('1 kΩ está en todas · 4,99 kΩ solo en E96 · 1.234 Ω en ninguna', () => {
    expect(seriesQueLoContienen(1000)).toEqual(['E6', 'E12', 'E24', 'E48', 'E96']);
    expect(seriesQueLoContienen(4990)).toEqual(['E96']);
    expect(seriesQueLoContienen(1234)).toEqual([]);
  });

  test('valores con decimales: 0,22 Ω y 4,7 Ω', () => {
    expect(seriesQueLoContienen(0.22)).toEqual(['E6', 'E12', 'E24']);
    expect(seriesQueLoContienen(4.7)).toEqual(['E6', 'E12', 'E24']);
  });

  test('5.000 Ω en E12 → 4,7 kΩ, un 6 % por debajo', () => {
    const r = valorNormalizadoMasCercano(5000, 'E12')!;
    expect(r.ohmios).toBe(4700);
    expect(r.diferencia).toBe(-6);
  });

  test('9,8 Ω en E12 → 10 Ω de la década siguiente, no 8,2 Ω', () => {
    expect(valorNormalizadoMasCercano(9.8, 'E12')!.ohmios).toBe(10);
  });

  test('un valor de la serie se devuelve a sí mismo', () => {
    expect(valorNormalizadoMasCercano(150, 'E12')!).toEqual({ serie: 'E12', ohmios: 150, diferencia: 0 });
    expect(valorNormalizadoMasCercano(4990, 'E96')!.ohmios).toBe(4990);
  });
});

test.describe('Codificar (del valor a los colores)', () => {
  test('4.700 Ω con 4 bandas: amarillo-violeta-rojo-dorado, exacto', () => {
    expect(codificar(4700, 4, 'dorado')).toEqual({
      claves: ['amarillo', 'violeta', 'rojo', 'dorado'],
      ohmiosCodificados: 4700,
      exacto: true,
    });
  });

  test('4,7 Ω y 0,22 Ω usan dorado y plateado como multiplicador', () => {
    expect(codificar(4.7, 4, 'dorado')!.claves).toEqual(['amarillo', 'violeta', 'dorado', 'dorado']);
    expect(codificar(0.22, 4, 'plateado')!.claves).toEqual(['rojo', 'rojo', 'plateado', 'plateado']);
  });

  test('10 Ω, 1 Ω y 1 kΩ en potencias exactas de 10', () => {
    expect(codificar(10, 4, 'dorado')!.claves.slice(0, 3)).toEqual(['marron', 'negro', 'negro']);
    expect(codificar(1, 4, 'dorado')!.claves.slice(0, 3)).toEqual(['marron', 'negro', 'dorado']);
    expect(codificar(1000, 5, 'marron')!.claves).toEqual(['marron', 'negro', 'negro', 'marron', 'marron']);
  });

  test('1.234 Ω no cabe: 1.200 con 2 cifras y 1.230 con 3, y lo dice', () => {
    const c4 = codificar(1234, 4, 'dorado')!;
    expect([c4.ohmiosCodificados, c4.exacto]).toEqual([1200, false]);
    const c5 = codificar(1234, 5, 'marron')!;
    expect([c5.ohmiosCodificados, c5.exacto]).toEqual([1230, false]);
  });

  test('9.960 Ω con 2 cifras sube de década: 10 kΩ, marrón-negro-naranja', () => {
    const c = codificar(9960, 4, 'dorado')!;
    expect(c.claves.slice(0, 3)).toEqual(['marron', 'negro', 'naranja']);
    expect(c.ohmiosCodificados).toBe(10000);
  });

  test('6 bandas añade el coeficiente de temperatura elegido', () => {
    expect(codificar(3300, 6, 'marron', 'rojo')!.claves).toEqual(['naranja', 'naranja', 'negro', 'marron', 'marron', 'rojo']);
  });

  test('fuera de rango o con una tolerancia que no existe: null', () => {
    expect(rangoCodificable(4)).toEqual({ minimo: 0.1, maximo: 99e9 });
    expect(codificar(0.05, 4, 'dorado')).toBeNull();
    expect(codificar(1e11, 4, 'dorado')).toBeNull();
    expect(codificar(470, 4, 'naranja')).toBeNull();
    expect(codificar(0, 4, 'dorado')).toBeNull();
  });

  test('ida y vuelta: codificar y decodificar devuelven el mismo valor', () => {
    for (const v of [0.1, 0.47, 1, 4.7, 10, 68, 150, 330, 4700, 56000, 1e6, 2.2e6, 10e6]) {
      const c = codificar(v, 4, 'dorado')!;
      expect(decodificar(4, c.claves)!.ohmios).toBe(v);
    }
  });
});

test.describe('Leer el valor escrito', () => {
  test('formatos habituales', () => {
    expect(leerValor('470')).toBe(470);
    expect(leerValor('4,7k')).toBe(4700);
    expect(leerValor('4.7k')).toBe(4700);
    expect(leerValor('4,7 kΩ')).toBe(4700);
    expect(leerValor('1,5 kohm')).toBe(1500);
    expect(leerValor('1.500')).toBe(1500);
    expect(leerValor('2,2M')).toBe(2.2e6);
    expect(leerValor('1m')).toBe(1e6);
    expect(leerValor('0,47')).toBe(0.47);
  });

  test('notación de esquema: 4k7, 2M2, 4R7, R47', () => {
    expect(leerValor('4k7')).toBe(4700);
    expect(leerValor('2M2')).toBe(2.2e6);
    expect(leerValor('4R7')).toBe(4.7);
    expect(leerValor('R47')).toBe(0.47);
  });

  test('lo que no es un valor: null', () => {
    for (const t of ['', 'abc', '-5', '0', '12abc', 'k']) expect(leerValor(t)).toBeNull();
  });
});

test.describe('Unidad y decimales', () => {
  test('elige la unidad y los decimales justos', () => {
    expect(conUnidad(4700)).toEqual({ valor: 4.7, unidad: 'kΩ', decimales: 1 });
    expect(conUnidad(1000)).toEqual({ valor: 1, unidad: 'kΩ', decimales: 0 });
    expect(conUnidad(4465)).toEqual({ valor: 4.465, unidad: 'kΩ', decimales: 3 });
    expect(conUnidad(0.22)).toEqual({ valor: 0.22, unidad: 'Ω', decimales: 2 });
    expect(conUnidad(2.2e6)).toEqual({ valor: 2.2, unidad: 'MΩ', decimales: 1 });
    expect(conUnidad(99e9)).toEqual({ valor: 99, unidad: 'GΩ', decimales: 0 });
  });
});
