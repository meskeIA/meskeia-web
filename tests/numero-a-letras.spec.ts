/**
 * Tests del motor de números y cantidades en letras (lib/numeroALetras.ts)
 *
 * Lógica pura en Node, sin navegador. Ejecutar con: npm run test:calc
 *
 * Las reglas que se fijan aquí son las que un build nunca detectaría por su
 * cuenta: una concordancia mal resuelta compila igual de bien que una correcta.
 */

import { test, expect } from '@playwright/test';
import {
  enteroALetras,
  cantidadALetras,
  numeroALetras,
  MONEDAS,
  LIMITE_NUMERO_A_LETRAS,
} from '../lib/numeroALetras';

const EUR = MONEDAS.find((m) => m.codigo === 'EUR')!;
const GBP = MONEDAS.find((m) => m.codigo === 'GBP')!;

test.describe('enteroALetras — forma plena (el número leído suelto)', () => {
  const casos: Array<[number, string]> = [
    [0, 'cero'],
    [15, 'quince'],
    [16, 'dieciséis'],
    [21, 'veintiuno'],
    [22, 'veintidós'],
    [31, 'treinta y uno'],
    [100, 'cien'],
    [101, 'ciento uno'],
    [200, 'doscientos'],
    [500, 'quinientos'],
    [700, 'setecientos'],
    [999, 'novecientos noventa y nueve'],
  ];

  for (const [numero, esperado] of casos) {
    test(`${numero} → ${esperado}`, () => {
      expect(enteroALetras(numero)).toBe(esperado);
    });
  }
});

test.describe('enteroALetras — miles, millones y escala larga', () => {
  test('mil no lleva numeral delante cuando vale uno', () => {
    expect(enteroALetras(1000)).toBe('mil');
    expect(enteroALetras(1001)).toBe('mil uno');
    expect(enteroALetras(2000)).toBe('dos mil');
  });

  test('el numeral que precede a mil va apocopado', () => {
    expect(enteroALetras(21000)).toBe('veintiún mil');
    expect(enteroALetras(101000)).toBe('ciento un mil');
  });

  test('cien mil se mantiene sin -to', () => {
    expect(enteroALetras(100000)).toBe('cien mil');
  });

  test('millón en singular y plural', () => {
    expect(enteroALetras(1000000)).toBe('un millón');
    expect(enteroALetras(2000000)).toBe('dos millones');
    expect(enteroALetras(1500000)).toBe('un millón quinientos mil');
  });

  test('10⁹ es mil millones, no un billón (escala larga)', () => {
    expect(enteroALetras(1_000_000_000)).toBe('mil millones');
    expect(enteroALetras(2_500_000_000)).toBe('dos mil quinientos millones');
  });
});

test.describe('enteroALetras — concordancia y apócope', () => {
  test('femenino: una, veintiuna, doscientas', () => {
    expect(enteroALetras(1, { genero: 'femenino' })).toBe('una');
    expect(enteroALetras(21, { genero: 'femenino' })).toBe('veintiuna');
    expect(enteroALetras(31, { genero: 'femenino' })).toBe('treinta y una');
    expect(enteroALetras(200, { genero: 'femenino' })).toBe('doscientas');
    expect(enteroALetras(201, { genero: 'femenino' })).toBe('doscientas una');
  });

  test('apócope ante sustantivo: un, veintiún, treinta y un', () => {
    expect(enteroALetras(1, { apocope: true })).toBe('un');
    expect(enteroALetras(21, { apocope: true })).toBe('veintiún');
    expect(enteroALetras(31, { apocope: true })).toBe('treinta y un');
    expect(enteroALetras(201, { apocope: true })).toBe('doscientos un');
  });
});

test.describe('cantidadALetras — importes', () => {
  test('caso de referencia: 3.847,50 €', () => {
    expect(cantidadALetras(3847.5, { moneda: EUR }).texto).toBe(
      'tres mil ochocientos cuarenta y siete euros con cincuenta céntimos',
    );
  });

  test('singular y plural de la moneda y de la fracción', () => {
    expect(cantidadALetras(1, { moneda: EUR }).texto).toBe('un euro');
    expect(cantidadALetras(1.01, { moneda: EUR }).texto).toBe('un euro con un céntimo');
  });

  test('el numeral concuerda con la moneda, no con el número', () => {
    expect(cantidadALetras(21, { moneda: EUR }).texto).toBe('veintiún euros');
    expect(cantidadALetras(21, { moneda: GBP }).texto).toBe('veintiuna libras');
    expect(cantidadALetras(201, { moneda: GBP }).texto).toBe('doscientas una libras');
  });

  test('cero euros con céntimos', () => {
    expect(cantidadALetras(0.05, { moneda: EUR }).texto).toBe('cero euros con cinco céntimos');
  });

  test('redondea a dos decimales como una factura', () => {
    expect(cantidadALetras(3.456, { moneda: EUR }).texto).toBe('tres euros con cuarenta y seis céntimos');
  });

  test('negativos', () => {
    expect(cantidadALetras(-50, { moneda: EUR }).texto).toBe('menos cincuenta euros');
  });
});

test.describe('cantidadALetras — estilos de salida', () => {
  test('fracción numérica al estilo de los cheques', () => {
    expect(cantidadALetras(3847.5, { moneda: EUR, estiloFraccion: 'fraccion' }).texto).toBe(
      'tres mil ochocientos cuarenta y siete euros con 50/100',
    );
  });

  test('la fracción numérica se escribe aunque no haya decimales', () => {
    expect(cantidadALetras(120, { moneda: EUR, estiloFraccion: 'fraccion' }).texto).toBe(
      'ciento veinte euros con 00/100',
    );
  });

  test('omitir decimales', () => {
    expect(cantidadALetras(3847.5, { moneda: EUR, estiloFraccion: 'omitir' }).texto).toBe(
      'tres mil ochocientos cuarenta y siete euros',
    );
  });

  test('mayúsculas conservan la tilde', () => {
    expect(cantidadALetras(21, { moneda: EUR, mayusculas: true }).texto).toBe('VEINTIÚN EUROS');
  });
});

test.describe('numeroALetras — número suelto', () => {
  test('los decimales se leen cifra a cifra', () => {
    expect(numeroALetras(3.45)).toBe('tres coma cuatro cinco');
    expect(numeroALetras(0.5)).toBe('cero coma cinco');
  });

  test('sin decimales se comporta como el entero', () => {
    expect(numeroALetras(1000)).toBe('mil');
  });
});

test.describe('Límites', () => {
  test('rechaza por encima del límite exacto de JavaScript', () => {
    expect(() => enteroALetras(LIMITE_NUMERO_A_LETRAS + 1)).toThrow();
    expect(() => cantidadALetras(1e13, { moneda: EUR })).toThrow();
  });

  test('admite el límite justo', () => {
    // 999.999.999.999 = 999.999 millones + 999.999
    expect(enteroALetras(LIMITE_NUMERO_A_LETRAS)).toBe(
      'novecientos noventa y nueve mil novecientos noventa y nueve millones ' +
        'novecientos noventa y nueve mil novecientos noventa y nueve',
    );
  });
});
