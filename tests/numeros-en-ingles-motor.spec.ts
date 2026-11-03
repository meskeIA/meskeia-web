import { test, expect } from '@playwright/test';
import {
  cardinal, cardinalesAdmitidos, ordinalAbreviado, ordinalPalabras, lecturasAnio, decimalPalabras,
  notacionInglesa, cifraEspanola, convertir, corregirTexto, corregirCifra, corregirAbreviado,
  EJERCICIOS, TOTAL_EJERCICIOS, ORDEN_CATEGORIAS, corregir, respuestaPrincipal, opcionesDe, palabrasAdmitidas,
  formasCorrectas, explicar, enunciadoDe, leerSeleccion, ejercicioPorNumero,
} from '../app/numeros-en-ingles/motor';

/**
 * Motor de numeros-en-ingles, con casos resueltos A MANO antes de escribir la vista.
 *
 * Los CANON escriben, cifra a cifra, cómo se dice y se escribe en inglés según Cambridge
 * Dictionary y Oxford Learner's Dictionaries («Numbers»): americano sin «and», británico con
 * «and», guion de 21 a 99, escala corta. No salen del motor: si el motor se equivoca, este
 * fichero no se equivoca con él.
 */

const CANON_CARDINAL: [number, string, string][] = [
  [0, 'zero', 'zero'],
  [7, 'seven', 'seven'],
  [12, 'twelve', 'twelve'],
  [13, 'thirteen', 'thirteen'],
  [15, 'fifteen', 'fifteen'],
  [18, 'eighteen', 'eighteen'],
  [21, 'twenty-one', 'twenty-one'],
  [40, 'forty', 'forty'],
  [50, 'fifty', 'fifty'],
  [99, 'ninety-nine', 'ninety-nine'],
  [100, 'one hundred', 'one hundred'],
  [105, 'one hundred five', 'one hundred and five'],
  [110, 'one hundred ten', 'one hundred and ten'],
  [999, 'nine hundred ninety-nine', 'nine hundred and ninety-nine'],
  [1000, 'one thousand', 'one thousand'],
  [1005, 'one thousand five', 'one thousand and five'],
  [1234, 'one thousand two hundred thirty-four', 'one thousand two hundred and thirty-four'],
  [12345, 'twelve thousand three hundred forty-five', 'twelve thousand three hundred and forty-five'],
  [250105, 'two hundred fifty thousand one hundred five', 'two hundred and fifty thousand one hundred and five'],
  [1000000, 'one million', 'one million'],
  [1000050, 'one million fifty', 'one million and fifty'],
  [1250000, 'one million two hundred fifty thousand', 'one million two hundred and fifty thousand'],
  [1000000000, 'one billion', 'one billion'],
  [3000000000, 'three billion', 'three billion'],
  [999999999999,
    'nine hundred ninety-nine billion nine hundred ninety-nine million nine hundred ninety-nine thousand nine hundred ninety-nine',
    'nine hundred and ninety-nine billion nine hundred and ninety-nine million nine hundred and ninety-nine thousand nine hundred and ninety-nine'],
];

const CANON_ABREVIADO: [number, string][] = [
  [1, '1st'], [2, '2nd'], [3, '3rd'], [4, '4th'], [10, '10th'], [11, '11th'], [12, '12th'], [13, '13th'],
  [21, '21st'], [22, '22nd'], [23, '23rd'], [31, '31st'], [101, '101st'], [102, '102nd'], [103, '103rd'],
  [111, '111th'], [112, '112th'], [113, '113th'], [1000, '1000th'],
];

const CANON_ORDINAL: [number, string, string][] = [
  [1, 'first', 'first'],
  [2, 'second', 'second'],
  [3, 'third', 'third'],
  [4, 'fourth', 'fourth'],
  [5, 'fifth', 'fifth'],
  [8, 'eighth', 'eighth'],
  [9, 'ninth', 'ninth'],
  [12, 'twelfth', 'twelfth'],
  [20, 'twentieth', 'twentieth'],
  [21, 'twenty-first', 'twenty-first'],
  [40, 'fortieth', 'fortieth'],
  [99, 'ninety-ninth', 'ninety-ninth'],
  [100, 'one hundredth', 'one hundredth'],
  [101, 'one hundred first', 'one hundred and first'],
  [1000, 'one thousandth', 'one thousandth'],
];

const CANON_ANIO: [number, string[] | null][] = [
  [1066, null],
  [1100, ['eleven hundred']],
  [1865, ['eighteen sixty-five']],
  [1900, ['nineteen hundred']],
  [1905, ['nineteen oh five']],
  [1999, ['nineteen ninety-nine']],
  [2000, ['two thousand']],
  [2005, ['two thousand five', 'two thousand and five']],
  [2010, ['twenty ten', 'two thousand ten', 'two thousand and ten']],
  [2024, ['twenty twenty-four', 'two thousand twenty-four', 'two thousand and twenty-four']],
  [2099, ['twenty ninety-nine', 'two thousand ninety-nine', 'two thousand and ninety-nine']],
  [2100, null],
];

/** Respuesta principal de cada ejercicio del banco, por su número: la que se pinta como opción. */
const CANON_BANCO: Record<number, string> = {
  1: 'thirteen', 2: 'thirty', 3: 'fifteen', 4: '50', 5: 'twelve', 6: 'forty', 7: 'twenty-one',
  8: 'ninety-nine', 9: 'one hundred five', 10: 'one thousand two hundred thirty-four', 11: '18', 12: '370',
  13: '2016',
  14: 'third', 15: 'fifth', 16: 'twelfth', 17: 'ninth', 18: 'twentieth', 19: 'twenty-first', 20: 'one hundredth',
  21: '22nd', 22: '11th', 23: '103rd', 24: '112th', 25: '31st',
  26: 'nineteen ninety-nine', 27: 'nineteen oh five', 28: 'nineteen hundred', 29: 'two thousand',
  30: 'two thousand eight', 31: 'twenty twenty-four', 32: '1865', 33: '1909', 34: 'eleven hundred',
  35: 'three point five', 36: 'zero point two five', 37: 'two point seven five', 38: '1,4', 39: '9,81',
  40: 'ten point five',
  41: 'one million', 42: 'one billion', 43: 'one million two hundred fifty thousand', 44: '3.000.000.000',
  45: 'forty-five thousand', 46: 'six hundred thousand', 47: '750.000',
};

test.describe('Cardinales', () => {
  for (const [n, us, uk] of CANON_CARDINAL) {
    test(`${n} → ${us} / ${uk}`, () => {
      expect(cardinal(n, 'us')).toBe(us);
      expect(cardinal(n, 'uk')).toBe(uk);
    });
  }

  test('«a» por «one» al empezar, y cada «and» británico por separado', () => {
    const f = cardinalesAdmitidos(105);
    expect(f).toEqual(expect.arrayContaining(['one hundred five', 'one hundred and five', 'a hundred five', 'a hundred and five']));
    expect(cardinalesAdmitidos(250105)).toEqual(expect.arrayContaining([
      'two hundred and fifty thousand one hundred five',
      'two hundred fifty thousand one hundred and five',
    ]));
    // «a» solo al empezar, nunca en medio
    expect(cardinalesAdmitidos(1100)).not.toContain('one thousand a hundred');
  });
});

test.describe('Ordinales', () => {
  for (const [n, abrev] of CANON_ABREVIADO) {
    test(`${n} → ${abrev}`, () => expect(ordinalAbreviado(n)).toBe(abrev));
  }
  for (const [n, us, uk] of CANON_ORDINAL) {
    test(`${n} → ${us} / ${uk}`, () => {
      expect(ordinalPalabras(n, 'us')).toBe(us);
      expect(ordinalPalabras(n, 'uk')).toBe(uk);
    });
  }
});

test.describe('Años', () => {
  for (const [n, lecturas] of CANON_ANIO) {
    test(`${n} → ${lecturas ? lecturas.join(' | ') : 'sin lectura de año'}`, () => {
      const l = lecturasAnio(n);
      expect(l === null ? null : l.map((x) => x.texto)).toEqual(lecturas);
    });
  }
});

test.describe('Decimales y notación', () => {
  test('3,5 · 0,25 · 3,50 · 105,5', () => {
    expect(decimalPalabras(3, '5', 'us')).toBe('three point five');
    expect(decimalPalabras(0, '25', 'us')).toBe('zero point two five');
    expect(decimalPalabras(0, '25', 'uk')).toBe('nought point two five');
    expect(decimalPalabras(3, '50', 'us')).toBe('three point five zero');
    expect(decimalPalabras(105, '5', 'uk')).toBe('one hundred and five point five');
  });

  test('notación inglesa: coma de millares, punto decimal', () => {
    expect(notacionInglesa('1234', '5')).toBe('1,234.5');
    expect(notacionInglesa('1000000', '')).toBe('1,000,000');
    expect(notacionInglesa('999', '')).toBe('999');
    expect(notacionInglesa('0', '25')).toBe('0.25');
  });

  test('cifra española: sin agrupar con cuatro cifras (RAE)', () => {
    expect(cifraEspanola('1234')).toBe('1234');
    expect(cifraEspanola('12345')).toBe('12.345');
    expect(cifraEspanola('3000000000')).toBe('3.000.000.000');
    expect(cifraEspanola('0', '25')).toBe('0,25');
  });
});

test.describe('Conversor', () => {
  test('1.234,5', () => {
    const r = convertir(1, '1234', '5');
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.conversion.us).toBe('one thousand two hundred thirty-four point five');
    expect(r.conversion.uk).toBe('one thousand two hundred and thirty-four point five');
    expect(r.conversion.notacion).toBe('1,234.5');
    expect(r.conversion.ordinal).toBeUndefined();
    expect(r.conversion.anio).toBeUndefined();
  });

  test('21: ordinal, sin año', () => {
    const r = convertir(1, '21', '');
    if (!r.ok) throw new Error(r.error);
    expect(r.conversion.ordinal).toEqual({ abreviado: '21st', us: 'twenty-first', uk: 'twenty-first' });
    expect(r.conversion.anio).toBeUndefined();
    expect(r.conversion.escalaCorta).toBe(false);
  });

  test('1999: lectura de año', () => {
    const r = convertir(1, '1999', '');
    if (!r.ok) throw new Error(r.error);
    expect(r.conversion.anio?.map((l) => l.texto)).toEqual(['nineteen ninety-nine']);
    expect(r.conversion.us).toBe('one thousand nine hundred ninety-nine');
  });

  test('mil millones: aviso de escala corta', () => {
    const r = convertir(1, '1000000000', '');
    if (!r.ok) throw new Error(r.error);
    expect(r.conversion.us).toBe('one billion');
    expect(r.conversion.escalaCorta).toBe(true);
    expect(r.conversion.notacion).toBe('1,000,000,000');
  });

  test('0,25: nought y zero en británico', () => {
    const r = convertir(1, '0', '25');
    if (!r.ok) throw new Error(r.error);
    expect(r.conversion.uk).toBe('nought point two five');
    expect(r.conversion.ukAlternativa).toBe('zero point two five');
    expect(r.conversion.ordinal).toBeUndefined();
  });

  test('cero, ceros a la izquierda y errores', () => {
    const cero = convertir(1, '0', '');
    if (!cero.ok) throw new Error(cero.error);
    expect(cero.conversion.us).toBe('zero');
    expect(cero.conversion.ordinal).toBeUndefined();
    const conCeros = convertir(1, '007', '');
    if (!conCeros.ok) throw new Error(conCeros.error);
    expect(conCeros.conversion.us).toBe('seven');
    expect(convertir(-1, '5', '').ok).toBe(false);
    expect(convertir(1, '1000000000000', '').ok).toBe(false);
    expect(convertir(1, '999999999999', '').ok).toBe(true);
    expect(convertir(1, '1', '1234567890').ok).toBe(false);
  });
});

test.describe('Corrector', () => {
  test('palabras: mayúsculas, punto final, espacios y comas', () => {
    expect(corregirTexto('  Twenty-One. ', ['twenty-one'])).toEqual({ ok: true, faltaGuion: [] });
    expect(corregirTexto('one thousand, two hundred and thirty-four', cardinalesAdmitidos(1234)).ok).toBe(true);
    expect(corregirTexto('A hundred and five', cardinalesAdmitidos(105)).ok).toBe(true);
    expect(corregirTexto('one hundred five', cardinalesAdmitidos(105)).ok).toBe(true);
  });

  test('sin guion: se da por buena y se recuerda', () => {
    expect(corregirTexto('twenty one', ['twenty-one'])).toEqual({ ok: true, faltaGuion: ['twenty-one'] });
    expect(corregirTexto('one thousand two hundred thirty four', cardinalesAdmitidos(1234)))
      .toEqual({ ok: true, faltaGuion: ['thirty-four'] });
  });

  test('errores típicos rechazados', () => {
    expect(corregirTexto('one hundreds five', cardinalesAdmitidos(105)).ok).toBe(false);
    expect(corregirTexto('fourty', cardinalesAdmitidos(40)).ok).toBe(false);
    expect(corregirTexto('twentyone', ['twenty-one']).ok).toBe(false);
    expect(corregirTexto('one thousand and two hundred thirty-four', cardinalesAdmitidos(1234)).ok).toBe(false);
    expect(corregirTexto('', ['zero']).ok).toBe(false);
  });

  test('cifras: formato español o cifras seguidas; la notación inglesa se reconoce y se rechaza', () => {
    const millon = { entera: '1250000', decimales: '' };
    expect(corregirCifra('1.250.000', millon)).toEqual({ ok: true, notacionInglesa: false });
    expect(corregirCifra('1250000', millon)).toEqual({ ok: true, notacionInglesa: false });
    expect(corregirCifra('1,250,000', millon)).toEqual({ ok: false, notacionInglesa: true });
    expect(corregirCifra('125000', millon)).toEqual({ ok: false, notacionInglesa: false });
    const tres = { entera: '3', decimales: '5' };
    expect(corregirCifra('3,5', tres).ok).toBe(true);
    expect(corregirCifra('3,50', tres).ok).toBe(true);
    expect(corregirCifra('3.5', tres)).toEqual({ ok: false, notacionInglesa: true });
    expect(corregirCifra('35', tres).ok).toBe(false);
    expect(corregirCifra('1234', { entera: '1234', decimales: '' }).ok).toBe(true);
    expect(corregirCifra('1.234', { entera: '1234', decimales: '' }).ok).toBe(true);
  });

  test('ordinal abreviado', () => {
    expect(corregirAbreviado('22ND.', 22)).toBe(true);
    expect(corregirAbreviado('22 nd', 22)).toBe(true);
    expect(corregirAbreviado('22th', 22)).toBe(false);
    expect(corregirAbreviado('11st', 11)).toBe(false);
  });

  test('años: las dos lecturas desde 2001; «oh», no «zero»', () => {
    const e2008 = EJERCICIOS.find((e) => e.tipo === 'anio' && e.entera === 2008);
    const e1905 = EJERCICIOS.find((e) => e.tipo === 'anio' && e.entera === 1905);
    if (!e2008 || !e1905) throw new Error('faltan 2008 o 1905 en el banco');
    expect(corregir(e2008, 'two thousand and eight').ok).toBe(true);
    expect(corregir(e2008, 'Two thousand eight').ok).toBe(true);
    expect(corregir(e2008, 'twenty eight').ok).toBe(false);
    expect(corregir(e1905, 'nineteen-oh-five').ok).toBe(true);
    expect(corregir(e1905, 'nineteen five').ok).toBe(false);
  });
});

test.describe('Banco de ejercicios', () => {
  test('números 1..N sin huecos ni repetidos, entre 40 y 50, en todas las categorías', () => {
    expect(EJERCICIOS.map((e) => e.numero)).toEqual(Array.from({ length: TOTAL_EJERCICIOS }, (_, i) => i + 1));
    expect(TOTAL_EJERCICIOS).toBeGreaterThanOrEqual(40);
    expect(TOTAL_EJERCICIOS).toBeLessThanOrEqual(50);
    for (const c of ORDEN_CATEGORIAS) expect(EJERCICIOS.filter((e) => e.categoria === c).length).toBeGreaterThanOrEqual(5);
    expect(ejercicioPorNumero(1)?.numero).toBe(1);
    expect(ejercicioPorNumero(TOTAL_EJERCICIOS + 1)).toBeUndefined();
  });

  test('cada respuesta principal coincide con el CANON escrito a mano', () => {
    expect(Object.keys(CANON_BANCO).length).toBe(TOTAL_EJERCICIOS);
    for (const e of EJERCICIOS) expect(respuestaPrincipal(e), `ejercicio ${e.numero}`).toBe(CANON_BANCO[e.numero]);
  });

  test('la respuesta y sus formas se aceptan; ningún distractor se acepta; cuatro opciones distintas', () => {
    for (const e of EJERCICIOS) {
      const donde = `ejercicio ${e.numero}`;
      expect(corregir(e, respuestaPrincipal(e)).ok, donde).toBe(true);
      for (const f of formasCorrectas(e)) expect(corregir(e, f.texto).ok, `${donde}: ${f.texto}`).toBe(true);
      for (const d of e.distractores) expect(corregir(e, d).ok, `${donde}: distractor ${d}`).toBe(false);
      expect(new Set(opcionesDe(e)).size, donde).toBe(4);
      if (e.leido) expect(palabrasAdmitidas(e), `${donde}: lo leído`).toContain(e.leido);
      expect(explicar(e).length, donde).toBeGreaterThan(20);
      expect(enunciadoDe(e).mostrado.length, donde).toBeGreaterThan(0);
    }
  });

  test('la regla del veredicto se aplica al caso', () => {
    const porEntera = (tipo: string, n: number) => {
      const e = EJERCICIOS.find((x) => x.tipo === tipo && x.entera === n);
      if (!e) throw new Error(`no está: ${tipo} ${n}`);
      return explicar(e);
    };
    expect(porEntera('cardinal', 13)).toContain('thir-');
    expect(porEntera('cardinal', 40)).toContain('sin u');
    expect(porEntera('cardinal', 21)).toContain('guion: twenty-one');
    expect(porEntera('cardinal', 105)).toContain('one hundred and five');
    expect(porEntera('cardinal', 1_000_000_000)).toContain('mil millones');
    expect(porEntera('ordinal', 12)).toContain('twelve → twelfth');
    expect(porEntera('ordinal-abreviado', 103)).toContain('103rd');
    expect(porEntera('ordinal-abreviado', 112)).toContain('11, 12 o 13');
    expect(porEntera('anio', 1905)).toContain('nineteen oh five');
    expect(porEntera('decimal', 0)).toContain('nought');
    expect(porEntera('decimal', 2)).toContain('no point seventy-five');
  });
});

test.describe('Selección por números', () => {
  test('lista, rango, mezcla, orden y repetidos', () => {
    expect(leerSeleccion('3, 7, 11')).toEqual({ ok: true, numeros: [3, 7, 11] });
    expect(leerSeleccion('5-9')).toEqual({ ok: true, numeros: [5, 6, 7, 8, 9] });
    expect(leerSeleccion('5 - 7')).toEqual({ ok: true, numeros: [5, 6, 7] });
    expect(leerSeleccion('1-3, 8')).toEqual({ ok: true, numeros: [1, 2, 3, 8] });
    expect(leerSeleccion('11 7 3')).toEqual({ ok: true, numeros: [11, 7, 3] });
    expect(leerSeleccion('7, 3, 7')).toEqual({ ok: true, numeros: [7, 3] });
    expect(leerSeleccion('9-7')).toEqual({ ok: true, numeros: [9, 8, 7] });
  });

  test('errores: vacío, texto, fuera del banco', () => {
    expect(leerSeleccion('').ok).toBe(false);
    expect(leerSeleccion('tres').ok).toBe(false);
    const fuera = leerSeleccion(`3, ${TOTAL_EJERCICIOS + 1}`);
    expect(fuera.ok).toBe(false);
    if (!fuera.ok) expect(fuera.error).toContain(`No existe el ejercicio ${TOTAL_EJERCICIOS + 1}`);
    expect(leerSeleccion('0').ok).toBe(false);
  });
});
