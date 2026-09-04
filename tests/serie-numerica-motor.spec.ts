import { test, expect } from '@playwright/test';
import { parsearSerieNumerica, describirLectura } from '../lib/parsearSerieNumerica';

/**
 * Lectura de series numéricas — casos resueltos a mano ANTES de tocar las apps.
 *
 * El oráculo de cada caso es lo que una persona entendería al leer ese texto. Los seis
 * primeros son los que hoy salen mal en el catálogo, medidos el 04/09/2026 replicando los
 * dos parseos existentes:
 *
 *   entrada        estadistica-avanzada     calculadora-estadistica     lo correcto
 *   23, 25, 28  →  23 · 25 · 28             23 · 25 · 28                3 valores
 *   23,25,28    →  23,25 (un dato)          23 · 25 · 28                3 valores
 *   1,5 2,3 4,7 →  1,5 · 2,3 · 4,7          1·5·2·3·4·7                 3 valores
 *   15.5 18.2   →  15,5 · 18,2              15,5 · 18,2                 2 valores
 *   1,5⏎2,3     →  1,5 · 2,3                1·5·2·3                     2 valores
 *   23;25;28    →  23 · 25 · 28             23 · 25 · 28                3 valores
 *
 * Los dos casos del medio son los que importan: una app duplicaba los datos y la otra los
 * fundía en uno, y las dos presentaban el resultado con toda naturalidad.
 */

const valores = (texto: string, modo?: 'auto' | 'decimal' | 'separador') =>
  parsearSerieNumerica(texto, modo).valores;

test.describe('Los seis casos que hoy salen mal en el catálogo', () => {
  test('A MANO: comas con espacio son separadores — «23, 25, 28» son tres valores', () => {
    expect(valores('23, 25, 28')).toEqual([23, 25, 28]);
  });

  test('A MANO: comas pegadas con espacios de por medio son decimales — «1,5 2,3 4,7» son tres', () => {
    expect(valores('1,5 2,3 4,7')).toEqual([1.5, 2.3, 4.7]);
  });

  test('A MANO: una columna pegada de Excel en español se lee entera', () => {
    expect(valores('1,5\n2,3\n4,7')).toEqual([1.5, 2.3, 4.7]);
    expect(valores('15,5\t18,2\t20,1')).toEqual([15.5, 18.2, 20.1]); // tabuladores
  });

  test('A MANO: el punto decimal sigue funcionando', () => {
    expect(valores('15.5 18.2 20.1')).toEqual([15.5, 18.2, 20.1]);
    expect(valores('12.99, 15.50, 9.99')).toEqual([12.99, 15.5, 9.99]);
  });

  test('A MANO: el punto y coma separa, esté donde esté', () => {
    expect(valores('23;25;28')).toEqual([23, 25, 28]);
    expect(valores('1,5;2,3;4,7')).toEqual([1.5, 2.3, 4.7]);
  });

  test('A MANO: «23,25,28» son tres valores, y ahí NO hay ambigüedad que resolver', () => {
    // Es el caso que estadistica-avanzada leía como un solo dato (23,25). Parecía el más
    // dudoso de todos, pero la otra lectura no produce ningún número: «23,25,28» con la coma
    // como decimal es un número con tres partes decimales, o sea nada. Al no haber dos
    // lecturas válidas, no hay nada que preguntarle al usuario.
    const s = parsearSerieNumerica('23,25,28');
    expect(s.valores).toEqual([23, 25, 28]);
    expect(s.papelComa).toBe('separador');
    expect(s.ambigua).toBe(false);
    expect(s.alternativa).toBeNull();
  });

  test('A MANO: la ambigüedad de verdad es «23,25» — dos lecturas y las dos válidas', () => {
    const s = parsearSerieNumerica('23,25');
    expect(s.valores).toEqual([23.25]);        // veintitrés con veinticinco
    expect(s.ambigua).toBe(true);
    expect(s.alternativa?.valores).toEqual([23, 25]); // o dos valores sueltos
  });
});

test.describe('El papel de la coma se deduce del contexto', () => {
  test('con separadores duros la coma es decimal, y eso no rompe las listas con espacios', () => {
    // La misma regla debe dar bien los dos casos: si no, no sirve
    expect(parsearSerieNumerica('1,5 2,3').papelComa).toBe('decimal');
    expect(valores('1,5 2,3')).toEqual([1.5, 2.3]);
    expect(parsearSerieNumerica('23, 25, 28').papelComa).toBe('decimal');
    expect(valores('23, 25, 28')).toEqual([23, 25, 28]);
  });

  test('una sola coma y nada más es un decimal, no dos enteros', () => {
    const s = parsearSerieNumerica('1,5');
    expect(s.valores).toEqual([1.5]);
    expect(s.papelComa).toBe('decimal');
    expect(s.ambigua).toBe(true); // «1 y 5» también se entendería
    expect(s.alternativa?.valores).toEqual([1, 5]);
  });

  test('sin comas no hay nada que decidir', () => {
    const s = parsearSerieNumerica('5 7 8 6 9');
    expect(s.valores).toEqual([5, 7, 8, 6, 9]);
    expect(s.papelComa).toBe('sin-comas');
    expect(s.ambigua).toBe(false);
    expect(s.alternativa).toBeNull();
  });

  test('con un espacio de por medio ya NO es ambiguo: la lectura decimal es la única razonable', () => {
    expect(parsearSerieNumerica('1,5 2,3').ambigua).toBe(false);
    expect(parsearSerieNumerica('1,5\n2,3').ambigua).toBe(false);
  });
});

test.describe('El usuario puede imponer la lectura', () => {
  test('forzar separador parte por las comas aunque estén pegadas', () => {
    expect(valores('1,5 2,3', 'separador')).toEqual([1, 5, 2, 3]);
  });

  test('forzar decimal respeta las comas pegadas', () => {
    expect(valores('23,25', 'decimal')).toEqual([23.25]);
    // Y si la lectura impuesta no produce números, no se inventa ninguno
    expect(valores('23,25,28', 'decimal')).toEqual([]);
  });

  test('al imponer una lectura ya no se marca como ambigua: la duda la resolvió el usuario', () => {
    expect(parsearSerieNumerica('23,25,28', 'separador').ambigua).toBe(false);
    expect(parsearSerieNumerica('23,25,28', 'decimal').ambigua).toBe(false);
  });
});

test.describe('Casos límite y basura', () => {
  test('lo que no es un número se descarta y se puede nombrar', () => {
    const s = parsearSerieNumerica('12 abc 15 ?? 18');
    expect(s.valores).toEqual([12, 15, 18]);
    expect(s.descartados).toEqual(['abc', '??']);
  });

  test('el texto vacío no revienta ni inventa valores', () => {
    for (const vacio of ['', '   ', '\n\n', ',', ';;']) {
      expect(parsearSerieNumerica(vacio).valores).toEqual([]);
    }
  });

  test('espacios de sobra, saltos dobles y comas colgantes no estorban', () => {
    expect(valores('  5,  7,   8,  ')).toEqual([5, 7, 8]);
    expect(valores('5\n\n7\n\n8')).toEqual([5, 7, 8]);
  });

  test('negativos y ceros se conservan', () => {
    expect(valores('-3 0 4,5')).toEqual([-3, 0, 4.5]);
    expect(valores('-3, 0, 4')).toEqual([-3, 0, 4]);
  });

  test('el millar con punto sigue siendo millar', () => {
    expect(valores('1.234 5.678')).toEqual([1234, 5678]);
    expect(valores('1.234,56 2.000')).toEqual([1234.56, 2000]);
  });

  test('un valor suelto se lee igual que dentro de una serie', () => {
    expect(valores('42')).toEqual([42]);
    expect(valores('3.14159')).toEqual([3.14159]);
  });
});

test.describe('describirLectura — lo que se le enseña al usuario', () => {
  test('dice cuántos valores y con qué criterio', () => {
    expect(describirLectura(parsearSerieNumerica('1,5 2,3'))).toBe('2 valores, leyendo la coma como decimal.');
    expect(describirLectura(parsearSerieNumerica('23,25,28'))).toBe('3 valores, leyendo la coma como separador.');
    expect(describirLectura(parsearSerieNumerica('5 7 8'))).toBe('3 valores.');
  });

  test('el singular está bien escrito y el vacío se dice sin rodeos', () => {
    expect(describirLectura(parsearSerieNumerica('42'))).toBe('1 valor.');
    expect(describirLectura(parsearSerieNumerica('abc'))).toBe('No se ha reconocido ningún número.');
  });
});

test.describe('Invariantes que deben cumplirse siempre', () => {
  const entradas = [
    '23, 25, 28', '23,25,28', '1,5 2,3 4,7', '15.5 18.2', '1,5\n2,3', '23;25;28',
    '5 7 8 6 9', '1,5', '23,25', '42', '-3 0 4,5', '1.234,56 2.000', '  5,  7,   8,  ',
  ];

  test('ningún valor devuelto es NaN ni infinito', () => {
    for (const e of entradas) {
      for (const v of parsearSerieNumerica(e).valores) {
        expect(Number.isFinite(v), `«${e}» produjo ${v}`).toBe(true);
      }
    }
  });

  test('la alternativa, cuando existe, es distinta de la elegida', () => {
    for (const e of entradas) {
      const s = parsearSerieNumerica(e);
      if (s.alternativa) {
        expect(s.alternativa.valores, `«${e}»`).not.toEqual(s.valores);
      }
    }
  });

  test('lo marcado como ambiguo tiene SIEMPRE una alternativa que ofrecer', () => {
    for (const e of entradas) {
      const s = parsearSerieNumerica(e);
      if (s.ambigua) expect(s.alternativa, `«${e}» se marcó ambigua sin alternativa`).not.toBeNull();
    }
  });

  test('imponer el papel que ya se había deducido da exactamente lo mismo', () => {
    for (const e of entradas) {
      const auto = parsearSerieNumerica(e);
      if (auto.papelComa === 'sin-comas') continue;
      expect(parsearSerieNumerica(e, auto.papelComa).valores, `«${e}»`).toEqual(auto.valores);
    }
  });
});

test.describe('Casos de calculadora-electricidad (resistencias en ohmios)', () => {
  test('A MANO: los valores por defecto y los decimales conviven', () => {
    // Partiendo solo por comas, «10,5, 22» daba tres resistencias: 10, 5 y 22
    expect(valores('10, 20, 30')).toEqual([10, 20, 30]);
    expect(valores('10,5, 22')).toEqual([10.5, 22]);
    expect(valores('10.5, 22')).toEqual([10.5, 22]);
    expect(valores('4,7 10 22')).toEqual([4.7, 10, 22]);
    expect(valores('10,20,30')).toEqual([10, 20, 30]);
  });
});
