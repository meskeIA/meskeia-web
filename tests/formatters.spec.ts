/**
 * Tests unitarios para lib/formatters.ts
 *
 * Verifica que todas las funciones de formato español funcionan correctamente.
 * Ejecutar con: npx playwright test tests/formatters.spec.ts
 */

import { test, expect } from '@playwright/test';

// Importamos las funciones directamente para testear
// Nota: Estos tests se ejecutan en Node, no en browser
import {
  formatNumber,
  formatCurrency,
  formatDate,
  formatDateTime,
  parseSpanishNumber,
  formatPercentage,
  formatCompactNumber,
  isValidNumber,
  formatDuration,
} from '../lib/formatters';

test.describe('formatNumber', () => {
  test('formatea números con coma decimal (formato español)', () => {
    // En Node.js, toLocaleString puede no incluir separador de miles
    // Lo importante es que use coma como decimal
    expect(formatNumber(1234.56, 2)).toContain(',');
    expect(formatNumber(1234.56, 2)).toMatch(/1\.?234,56/);
    expect(formatNumber(0.5, 2)).toBe('0,50');
  });

  test('respeta el número de decimales especificado', () => {
    const result0 = formatNumber(1234.5678, 0);
    expect(result0).toMatch(/1\.?235/); // Redondea correctamente
    const result4 = formatNumber(1234.5678, 4);
    expect(result4).toContain(',5678');
  });

  test('maneja NaN', () => {
    expect(formatNumber(NaN, 2)).toBe('No definido');
  });

  test('maneja Infinity', () => {
    expect(formatNumber(Infinity, 2)).toBe('∞');
    expect(formatNumber(-Infinity, 2)).toBe('-∞');
  });

  test('maneja números muy pequeños', () => {
    expect(formatNumber(0.00001, 2)).toBe('≈0');
  });

  test('maneja números negativos', () => {
    const result = formatNumber(-1234.56, 2);
    expect(result).toContain('-');
    expect(result).toContain(',56');
  });
});

test.describe('formatCurrency', () => {
  test('formatea moneda en euros', () => {
    const result = formatCurrency(1234.56);
    // Verifica coma decimal y símbolo euro
    expect(result).toContain(',56');
    expect(result).toContain('€');
  });

  test('maneja NaN', () => {
    expect(formatCurrency(NaN)).toBe('No definido');
  });

  test('maneja Infinity', () => {
    expect(formatCurrency(Infinity)).toBe('∞ €');
    expect(formatCurrency(-Infinity)).toBe('-∞ €');
  });
});

test.describe('formatDate', () => {
  test('formatea fecha en formato español DD/MM/YYYY', () => {
    const date = new Date(2025, 10, 25); // Mes es 0-indexed
    expect(formatDate(date)).toBe('25/11/2025');
  });
});

test.describe('formatDateTime', () => {
  test('formatea fecha y hora en formato español', () => {
    const date = new Date(2025, 10, 25, 14, 30);
    const result = formatDateTime(date);
    expect(result).toContain('25/11/2025');
    expect(result).toContain('14:30');
  });
});

test.describe('parseSpanishNumber', () => {
  test('parsea formato español (coma decimal)', () => {
    expect(parseSpanishNumber('1234,56')).toBe(1234.56);
    expect(parseSpanishNumber('0,5')).toBe(0.5);
  });

  test('parsea formato español completo (punto miles, coma decimal)', () => {
    expect(parseSpanishNumber('1.234,56')).toBe(1234.56);
    expect(parseSpanishNumber('1.000.000,00')).toBe(1000000);
  });

  test('parsea formato internacional (punto decimal)', () => {
    expect(parseSpanishNumber('1234.56')).toBe(1234.56);
  });

  test('maneja strings vacíos', () => {
    expect(parseSpanishNumber('')).toBeNaN();
    expect(parseSpanishNumber('   ')).toBeNaN();
  });

  test('elimina espacios', () => {
    expect(parseSpanishNumber('  1234,56  ')).toBe(1234.56);
  });

  /**
   * El punto de los millares SIN coma decimal — el caso que faltaba, y que costó caro.
   *
   * Hasta el 14/08/2026 estos tests no existían y `parseSpanishNumber` hacía un
   * `parseFloat` directo en esta rama, así que "200.000" devolvía 200 y "11.440"
   * devolvía 11,44. El comentario del propio fichero anunciaba una heurística que
   * nunca se había implementado.
   *
   * Lo encontró el Inspector en `estimador-compraventa-inmueble`: su botón «Estimar
   * por mí» escribía 11.440 en un campo y lo releía como 11,44, de modo que el botón
   * pensado para REBAJAR la ganancia del vendedor le subía el IRPF 2.618,77 €.
   * `parseSpanishNumber` lo usan 89 apps, 48 de ellas sobre campos de texto libre.
   *
   * Regla: tres dígitos tras el punto = separador de millares (formato español, que
   * es el obligatorio del proyecto). Cualquier otra cantidad de dígitos = decimal,
   * para no romper el formato internacional que ya se aceptaba.
   */
  test('el punto de millares sin coma decimal se interpreta como millares', () => {
    expect(parseSpanishNumber('200.000')).toBe(200000);
    expect(parseSpanishNumber('11.440')).toBe(11440);
    expect(parseSpanishNumber('1.234.567')).toBe(1234567);
    // Caso ambiguo, resuelto a favor del español: mil doscientos treinta y cuatro
    expect(parseSpanishNumber('1.234')).toBe(1234);
  });

  test('el punto decimal internacional sigue funcionando', () => {
    expect(parseSpanishNumber('1234.56')).toBe(1234.56);   // 2 dígitos → decimal
    expect(parseSpanishNumber('1.5')).toBe(1.5);           // 1 dígito  → decimal
    expect(parseSpanishNumber('0.75')).toBe(0.75);
    expect(parseSpanishNumber('3.1416')).toBe(3.1416);     // 4 dígitos → decimal
  });

  test('acepta signo y no rompe con entradas sueltas', () => {
    expect(parseSpanishNumber('-200.000')).toBe(-200000);
    expect(parseSpanishNumber('1234')).toBe(1234);
    expect(parseSpanishNumber('0')).toBe(0);
    expect(parseSpanishNumber('abc')).toBeNaN();
  });
});

test.describe('formatPercentage', () => {
  test('formatea porcentaje correctamente', () => {
    expect(formatPercentage(0.15, 2)).toBe('15,00%');
    expect(formatPercentage(1, 0)).toBe('100%');
    expect(formatPercentage(0.5, 1)).toBe('50,0%');
  });

  test('maneja NaN', () => {
    expect(formatPercentage(NaN, 2)).toBe('No definido');
  });

  test('maneja Infinity', () => {
    expect(formatPercentage(Infinity, 2)).toBe('∞%');
  });
});

test.describe('formatCompactNumber', () => {
  test('formatea miles con K', () => {
    expect(formatCompactNumber(1500)).toBe('1,5K');
    expect(formatCompactNumber(10000)).toBe('10K');
  });

  test('formatea millones con M', () => {
    expect(formatCompactNumber(1500000)).toBe('1,5M');
    expect(formatCompactNumber(10000000)).toBe('10M');
  });

  test('formatea billones con B', () => {
    expect(formatCompactNumber(1500000000)).toBe('1,5B');
  });

  test('no compacta números pequeños', () => {
    expect(formatCompactNumber(500)).toBe('500');
    expect(formatCompactNumber(999)).toBe('999');
  });

  test('maneja números negativos', () => {
    expect(formatCompactNumber(-1500)).toBe('-1,5K');
  });

  test('maneja NaN e Infinity', () => {
    expect(formatCompactNumber(NaN)).toBe('No definido');
    expect(formatCompactNumber(Infinity)).toBe('∞');
  });
});

test.describe('isValidNumber', () => {
  test('valida números correctos', () => {
    expect(isValidNumber('1234')).toBe(true);
    expect(isValidNumber('1234,56')).toBe(true);
    expect(isValidNumber('1.234,56')).toBe(true);
    expect(isValidNumber('-100')).toBe(true);
  });

  test('rechaza strings inválidos', () => {
    expect(isValidNumber('')).toBe(false);
    expect(isValidNumber('abc')).toBe(false);
    // Nota: parseFloat('12abc') retorna 12 en JS, comportamiento estándar
    // isValidNumber usa parseSpanishNumber que se basa en parseFloat
  });
});

test.describe('formatDuration', () => {
  test('formatea segundos', () => {
    expect(formatDuration(30)).toBe('30seg');
    expect(formatDuration(59)).toBe('59seg');
  });

  test('formatea minutos', () => {
    expect(formatDuration(60)).toBe('1min');
    expect(formatDuration(90)).toBe('1min');
    expect(formatDuration(120)).toBe('2min');
    expect(formatDuration(3599)).toBe('59min');
  });

  test('formatea horas', () => {
    expect(formatDuration(3600)).toBe('1h');
    expect(formatDuration(7200)).toBe('2h');
  });

  test('formatea horas y minutos', () => {
    expect(formatDuration(5400)).toBe('1h 30min');
    expect(formatDuration(9000)).toBe('2h 30min');
  });
});
