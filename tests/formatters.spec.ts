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
  formatTipoNominal,
  formatCurrency,
  formatDate,
  formatDateTime,
  parseSpanishNumber,
  parseSpanishNumberOr,
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

  // El caso de arriba tiene día y mes de dos cifras, así que pasaba igual con la versión
  // que suprimía los ceros a la izquierda. Estos son los que la distinguen: la fecha de
  // verificación del complemento por brecha de género salía «13/5/2026» en el sello de
  // <DataReference> de una app de riesgo 1 (hallazgo 282 del Inspector).
  test('rellena con cero el mes de una cifra', () => {
    expect(formatDate(new Date(2026, 4, 13))).toBe('13/05/2026');
  });

  test('rellena con cero el día de una cifra', () => {
    expect(formatDate(new Date(2026, 0, 1))).toBe('01/01/2026');
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

  /**
   * El formato internacional — la promesa que la documentación hacía y el código no.
   *
   * El CLAUDE.md decía, en su regla Latam-friendly, que esta función «ya admite 1,234.56
   * y 1.234,56». No era cierto: con punto Y coma resolvía siempre a favor del español, de
   * modo que 1,234.56 salía 1,23456. Lo encontró el Inspector en `conversor-numeros-letras`
   * (tanda 6, 21/08/2026), cuya ayuda repetía la misma promesa sobre un campo que rellena
   * cheques y pagarés: 3,847.50 € se escribía en letras como «tres euros con ochenta y
   * cinco céntimos». Con LATAM en el 59,6 % de las impresiones, y México y Perú separando
   * el millar con coma, el defecto no era de una app sino del catálogo.
   *
   * Regla: cuando aparecen LOS DOS separadores, el último es el decimal. Es cierto en los
   * dos convenios y no toca nada de lo que ya funcionaba en español.
   */
  test('con los dos separadores, el ÚLTIMO es el decimal', () => {
    // Formato internacional (millar con coma) — lo que se reparó
    expect(parseSpanishNumber('1,234.56')).toBe(1234.56);
    expect(parseSpanishNumber('3,847.50')).toBe(3847.5);
    expect(parseSpanishNumber('1,234,567.89')).toBe(1234567.89);
    // Formato español — sigue exactamente igual
    expect(parseSpanishNumber('1.234,56')).toBe(1234.56);
    expect(parseSpanishNumber('1.234.567,89')).toBe(1234567.89);
  });

  test('la coma sola sigue siendo decimal español, aunque agrupe de tres en tres', () => {
    // Ambigüedad irreducible con un solo separador: gana el español, que es el formato
    // obligatorio del proyecto. Es la misma regla que ya se aplicaba al punto ("1.234").
    expect(parseSpanishNumber('1,234')).toBe(1.234);
    // Con DOS comas ya no hay ambigüedad: solo puede ser el millar internacional
    expect(parseSpanishNumber('1,234,567')).toBe(1234567);
  });

  /**
   * `parseFloat` acepta prefijos numéricos y notación científica, así que «12abc» valía 12,
   * «1e3» valía 1000 y «1.2.3» valía 1,2: importes plausibles pero equivocados, sin nada
   * que los delatara. NaN es lo que las apps ya saben tratar («No definido»), y
   * `parseSpanishNumberOr` sigue devolviendo su valor por defecto.
   */
  test('rechaza lo que no es un número en vez de inventarse uno', () => {
    expect(parseSpanishNumber('12abc')).toBeNaN();
    expect(parseSpanishNumber('1e3')).toBeNaN();
    expect(parseSpanishNumber('Infinity')).toBeNaN();
    expect(parseSpanishNumber('1.2.3')).toBeNaN();      // los puntos no agrupan millares
    expect(parseSpanishNumber('2,5,3')).toBeNaN();      // las comas tampoco
    expect(parseSpanishNumber('12.34,5')).toBeNaN();    // la parte entera no agrupa de tres
    expect(parseSpanishNumber('1.234,56,7')).toBeNaN(); // dos decimales no es un número
  });

  test('tolera lo que `Intl` y los usuarios pegan alrededor de la cifra', () => {
    // Releer lo que escribió formatCurrency (el símbolo va tras un NBSP)
    expect(parseSpanishNumber(formatCurrency(1234.56))).toBe(1234.56);
    expect(parseSpanishNumber('1.234,56 €')).toBe(1234.56);
    expect(parseSpanishNumber('1 234,56')).toBe(1234.56);   // millar con espacio (SI)
    expect(parseSpanishNumber('50%')).toBe(50);
    expect(parseSpanishNumber('+1.234,56')).toBe(1234.56);
  });
});

/**
 * El NaN de un campo vacío no lo delata ninguna comparación: `NaN <= 0` es false y
 * `Math.max(0, NaN)` sigue siendo NaN, así que se propaga en silencio hasta que un bloque
 * entero de resultados sale «No definido». Para los campos que el formulario anuncia como
 * opcionales, vacío tiene que valer 0.
 */
test.describe('parseSpanishNumberOr', () => {
  test('un campo vacío vale 0, no NaN', () => {
    expect(parseSpanishNumberOr('')).toBe(0);
    expect(parseSpanishNumberOr('   ')).toBe(0);
    expect(parseSpanishNumberOr('abc')).toBe(0);
  });

  test('respeta el valor por defecto que se le pase', () => {
    expect(parseSpanishNumberOr('', 3)).toBe(3);
    expect(parseSpanishNumberOr('abc', -1)).toBe(-1);
  });

  test('con un número válido se comporta igual que parseSpanishNumber', () => {
    expect(parseSpanishNumberOr('1.234,56')).toBe(1234.56);
    expect(parseSpanishNumberOr('200.000')).toBe(200000);
    expect(parseSpanishNumberOr('0')).toBe(0);
  });
});

test.describe('formatTipoNominal', () => {
  // De dónde sale: hallazgos 331 y 333 del Inspector (25/08/2026). Las siete apps del
  // clúster de compraventa formateaban los tipos impositivos cada una a su manera —cero,
  // uno o dos decimales, y el panel de CCAA con el número crudo de JavaScript—, así que el
  // 7,75 % de Murcia (Ley 3/2025) se anunciaba como «ITP (8%)» al lado de un importe que
  // era el 7,75 %, y como «7.75%» tres centímetros más allá.

  test('un tipo entero va sin decimales', () => {
    expect(formatTipoNominal(6)).toBe('6');
    expect(formatTipoNominal(10)).toBe('10');
    expect(formatTipoNominal(21)).toBe('21');
  });

  test('un tipo con un decimal conserva ese decimal, y con coma', () => {
    expect(formatTipoNominal(6.5)).toBe('6,5');
    expect(formatTipoNominal(1.5)).toBe('1,5');
  });

  test('un tipo con dos decimales los conserva los dos', () => {
    expect(formatTipoNominal(7.75)).toBe('7,75');
    expect(formatTipoNominal(0.75)).toBe('0,75');
  });

  test('nunca imprime el punto decimal anglosajón', () => {
    for (const tipo of [4, 6.5, 7.75, 10, 11.125, 13]) {
      expect(formatTipoNominal(tipo)).not.toContain('.');
    }
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
    // Desde el 24/08/2026 parseSpanishNumber ya no acepta prefijos numéricos ni
    // notación científica, así que isValidNumber tampoco los da por buenos
    expect(isValidNumber('12abc')).toBe(false);
    expect(isValidNumber('1e3')).toBe(false);
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
