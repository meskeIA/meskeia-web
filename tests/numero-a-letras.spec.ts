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
  separarMarcaMoneda,
  nombrarMonedas,
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

/**
 * La preposición «de» tras millón/millones — hallazgo 232 del Inspector (24/08/2026).
 *
 * DPD, s. v. «millón»: si millón(es) no va seguido de otro numeral, el sustantivo cuantificado
 * se introduce con «de». Faltaba, y se alcanzaba pulsando el ejemplo «1.000.000» que la propia
 * app ofrece: la línea preparada para copiar decía «Págese por este pagaré la cantidad de un
 * millón euros».
 */
test.describe('cantidadALetras — la preposición «de» tras millones', () => {
  test('los múltiplos exactos de millón la llevan', () => {
    expect(cantidadALetras(1_000_000, { moneda: EUR }).texto).toBe('un millón de euros');
    expect(cantidadALetras(2_000_000, { moneda: EUR }).texto).toBe('dos millones de euros');
    expect(cantidadALetras(1_000_000_000, { moneda: EUR }).texto).toBe('mil millones de euros');
    expect(cantidadALetras(25_000_000, { moneda: EUR }).texto).toBe(
      'veinticinco millones de euros',
    );
  });

  test('con otro numeral detrás, NO la lleva', () => {
    expect(cantidadALetras(1_234_567, { moneda: EUR }).texto).toBe(
      'un millón doscientos treinta y cuatro mil quinientos sesenta y siete euros',
    );
    expect(cantidadALetras(2_000_500, { moneda: EUR }).texto).toBe(
      'dos millones quinientos euros',
    );
    // «mil millones quinientos mil» termina en «mil», no en «millones»
    expect(cantidadALetras(1_000_500_000, { moneda: EUR }).texto).toBe(
      'mil millones quinientos mil euros',
    );
  });

  test('vale igual para las monedas femeninas y con céntimos detrás', () => {
    expect(cantidadALetras(1_000_000, { moneda: GBP }).texto).toBe('un millón de libras');
    expect(cantidadALetras(1_000_000.5, { moneda: EUR }).texto).toBe(
      'un millón de euros con cincuenta céntimos',
    );
  });

  test('un número suelto no cuantifica nada, así que no lleva «de»', () => {
    expect(numeroALetras(1_000_000)).toBe('un millón');
  });
});

/**
 * El tope y el cero final — hallazgos 235 y 236.
 *
 * El tope se comparaba contra el valor CON decimales, así que el máximo que la propia ayuda
 * anuncia se rechazaba. Y los decimales del número suelto salían de `String(valor)`, donde el
 * cero final que el usuario escribió ya no existe.
 */
test.describe('límites con decimales y cifras tal como se teclearon', () => {
  test('el tope admitido incluye sus dos decimales', () => {
    expect(() => cantidadALetras(LIMITE_NUMERO_A_LETRAS + 0.99, { moneda: EUR })).not.toThrow();
    expect(cantidadALetras(LIMITE_NUMERO_A_LETRAS + 0.99, { moneda: EUR }).fraccion).toBe(99);
    // Un euro por encima sí se rechaza
    expect(() => cantidadALetras(LIMITE_NUMERO_A_LETRAS + 1, { moneda: EUR })).toThrow();
  });

  test('los decimales tecleados conservan el cero final', () => {
    expect(numeroALetras(0.5, 'masculino', '50')).toBe('cero coma cinco cero');
    expect(numeroALetras(1.2, 'masculino', '20')).toBe('uno coma dos cero');
    expect(numeroALetras(3847.5, 'masculino', '50')).toBe(
      'tres mil ochocientos cuarenta y siete coma cinco cero',
    );
  });

  test('sin cifras tecleadas se comporta como antes', () => {
    expect(numeroALetras(3.45)).toBe('tres coma cuatro cinco');
    expect(numeroALetras(0.5)).toBe('cero coma cinco');
    // Y lo que no son cifras se ignora, no se cuela en la lectura
    expect(numeroALetras(0.5, 'masculino', 'abc')).toBe('cero coma cinco');
  });
});

/**
 * El género de cada moneda — hallazgo 1537 del Inspector (24/09/2026), ALTO.
 *
 * El lempira estaba declarado femenino y la app escribía en el cheque «una lempira» y
 * «doscientas lempiras». DLE, s. v. «lempira»: «1. m. Unidad monetaria de Honduras.»
 * (https://dle.rae.es/lempira, consultado el 24/09/2026). Las centenas concuerdan siempre con
 * el sustantivo (DPD, s. v. «uno» §2.3), así que el género decide «doscientos» o «doscientas».
 *
 * La tabla fija el género de TODAS las monedas del selector tal como lo da el DLE en su
 * acepción de unidad monetaria (consultado el 24/09/2026): solo «libra» es femenino. «Córdoba»
 * acaba en -a como «lempira» y también es masculino (https://dle.rae.es/córdoba).
 */
test.describe('MONEDAS — el género de cada una, según el DLE', () => {
  const generoSegunDLE: Record<string, 'masculino' | 'femenino'> = {
    EUR: 'masculino', MXN: 'masculino', ARS: 'masculino', COP: 'masculino', CLP: 'masculino',
    USD: 'masculino', PEN: 'masculino', BOB: 'masculino', GTQ: 'masculino', CRC: 'masculino',
    HNL: 'masculino', NIO: 'masculino', PYG: 'masculino', UYU: 'masculino', DOP: 'masculino',
    VES: 'masculino', GBP: 'femenino',
  };

  test('cada moneda del selector lleva el género del DLE', () => {
    expect(Object.fromEntries(MONEDAS.map((m) => [m.codigo, m.genero]))).toEqual(generoSegunDLE);
  });

  test('el lempira es masculino: un lempira, veintiún y doscientos lempiras', () => {
    const HNL = MONEDAS.find((m) => m.codigo === 'HNL')!;
    expect(cantidadALetras(1, { moneda: HNL }).texto).toBe('un lempira');
    expect(cantidadALetras(21, { moneda: HNL }).texto).toBe('veintiún lempiras');
    expect(cantidadALetras(200, { moneda: HNL }).texto).toBe('doscientos lempiras');
    expect(cantidadALetras(201, { moneda: HNL }).texto).toBe('doscientos un lempiras');
    expect(cantidadALetras(21_000, { moneda: HNL }).texto).toBe('veintiún mil lempiras');
  });

  test('el córdoba, que también acaba en -a, es masculino', () => {
    const NIO = MONEDAS.find((m) => m.codigo === 'NIO')!;
    expect(cantidadALetras(1, { moneda: NIO }).texto).toBe('un córdoba');
    expect(cantidadALetras(200, { moneda: NIO }).texto).toBe('doscientos córdobas');
  });
});

/**
 * La moneda escrita junto a la cifra — hallazgos 1540 y 1542 (24/09/2026).
 *
 * «£1.500» salía en euros sin aviso (el símbolo se tiraba) y «S/ 1,500.00» se rechazaba aunque
 * el sol está en el selector. Los símbolos son los de CLDR 48 para cada moneda en su país (ver
 * la cabecera de `separarMarcaMoneda`); aquí se fija que se separan de la cifra y a qué
 * monedas apuntan, incluidas las dos ambigüedades decididas: «$» y «Bs».
 */
test.describe('separarMarcaMoneda — símbolo, código o nombre junto a la cifra', () => {
  const PESOS_Y_DOLAR = ['MXN', 'ARS', 'COP', 'CLP', 'USD', 'UYU', 'DOP'];
  const casos: Array<[string, string, string[] | null]> = [
    // entrada          cifra        códigos
    ['£1.500', '1.500', ['GBP']],
    ['$1,500.00', '1,500.00', PESOS_Y_DOLAR],
    ['S/ 1,500.00', '1,500.00', ['PEN']],
    ['S/. 1,500.00', '1,500.00', ['PEN']],
    ['Q1,500.00', '1,500.00', ['GTQ']],
    ['RD$1,500.00', '1,500.00', ['DOP']],
    ['L 1,500.00', '1,500.00', ['HNL']],
    ['C$1,500', '1,500', ['NIO']],
    ['₡1500', '1500', ['CRC']],
    ['US$1,500', '1,500', ['USD']],
    ['Gs. 1.500', '1.500', ['PYG']],
    ['₲1500', '1500', ['PYG']],
    ['Bs 1.500,00', '1.500,00', ['BOB', 'VES']],
    ['Bs.S 1.500,00', '1.500,00', ['VES']],
    ['1.500 EUR', '1.500', ['EUR']],
    ['usd 1500', '1500', ['USD']],
    ['1500 pesos', '1500', ['MXN', 'ARS', 'COP', 'CLP', 'UYU', 'DOP']],
    ['1500 dolares', '1500', ['USD']],
    ['1500 SOL', '1500', ['PEN']], // «SOL» es el nombre, no una «L» de lempira
    ['$1,500.00 M.N.', '1,500.00', PESOS_Y_DOLAR],
    ['3.847,50 €', '3.847,50', ['EUR']],
    ['-$1,500', '-1,500', PESOS_Y_DOLAR], // el signo pasa a la cifra
    ['$1500 €', '1500', []], // se contradicen: ninguna moneda
    // Sin marca, la cifra es la entrada TAL CUAL: lo que ya se leía se sigue leyendo igual
    ['1500', '1500', null],
    ['12abc', '12abc', null],
    ['1e3', '1e3', null],
    ['Lempira 5', 'Lempira 5', null], // una «L» con más letras es una palabra, no un símbolo
  ];

  for (const [entrada, cifra, codigos] of casos) {
    test(`«${entrada}» → «${cifra}» ${codigos ? codigos.join('/') || '(contradicción)' : '(sin marca)'}`, () => {
      const lectura = separarMarcaMoneda(entrada);
      expect(lectura.cifra).toBe(cifra);
      expect(lectura.marca?.codigos ?? null).toEqual(codigos);
    });
  }

  test('«M.N.» solo no señala moneda, pero no estorba a la cifra', () => {
    expect(separarMarcaMoneda('1,500.00 M.N.')).toMatchObject({ cifra: '1,500.00', marca: null });
  });

  test('guarda lo de delante y lo de detrás para reescribir el campo sin perder la marca', () => {
    expect(separarMarcaMoneda('S/ 830,400')).toMatchObject({ antes: 'S/ ', despues: '' });
    expect(separarMarcaMoneda('830,400 pesos')).toMatchObject({ antes: '', despues: ' pesos' });
  });

  test('nombrarMonedas agrupa los pesos y usa el artículo del género', () => {
    expect(nombrarMonedas(PESOS_Y_DOLAR, 'o')).toBe('el peso o el dólar');
    expect(nombrarMonedas(['BOB', 'VES'], 'o')).toBe('el boliviano o el bolívar');
    expect(nombrarMonedas(['GBP'])).toBe('la libra');
    expect(nombrarMonedas(['HNL'])).toBe('el lempira');
  });
});
