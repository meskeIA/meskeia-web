import { test, expect } from '@playwright/test';
import {
  aMixto,
  comparar,
  desarrolloDecimal,
  equivalentes,
  esIrreducible,
  evaluarExpresion,
  explicarSimplificacion,
  factorizar,
  leerFraccion,
  mcm,
  operar,
  potencia,
  simplificar,
  textoDecimal,
  textoFraccion,
  textoMixto,
  type Fraccion,
} from '../lib/calculadoras/fracciones';

/**
 * Motor de calculadora-fracciones — casos resueltos A MANO antes de escribir la vista (S0215,
 * 20/10/2026). El oráculo es la aritmética de cuaderno, no el motor:
 *
 *   2/3 + 1/4           m.c.m.(3, 4) = 12 → 8/12 + 3/12 = 11/12
 *   5/6 − 3/8           m.c.m.(6, 8) = 24 → 20/24 − 9/24 = 11/24
 *   4/9 × 3/8           12/72 → ÷12 → 1/6
 *   6/7 ÷ 3/14          6/7 × 14/3 = 84/21 = 4
 *   1/3 + 2/5 × 5/6     primero 2/5 × 5/6 = 10/30 = 1/3; después 1/3 + 1/3 = 2/3
 *                       (sumando antes saldría (1/3 + 2/5) × 5/6 = 11/15 × 5/6 = 11/18: el error típico)
 *   (3/4 − 1/2) ÷ 5/8   1/4 ÷ 5/8 = 8/20 = 2/5
 *   (2/3)^2 − 1/9       4/9 − 1/9 = 3/9 = 1/3
 *   −2^2                −(2²) = −4, convenio de la jerarquía (no (−2)² = 4)
 *   (−2/3)^−2           (−3/2)² = 9/4
 *   1/2 − (−1/3)        1/2 + 1/3 = 5/6
 *   0,25 + 1/3          1/4 + 1/3 = 3/12 + 4/12 = 7/12
 *   1/2/3               (1/2) ÷ 3 = 1/6 (la barra entre enteros es fracción; la siguiente, división)
 *   84/126              84 = 2²·3·7, 126 = 2·3²·7 → m.c.d. 42 → 2/3
 *   5/6 = 0,8(3) · 1/7 = 0,(142857) · 3/8 = 0,375 · −7/4 = −1 3/4
 */

function valor(expr: string): string {
  const r = evaluarExpresion(expr);
  return r.ok ? textoFraccion(r.valor) : `ERROR: ${r.error}`;
}

test.describe('evaluarExpresion — resultados a mano', () => {
  const CASOS: [string, string][] = [
    ['2/3 + 1/4', '11/12'],
    ['5/6 - 3/8', '11/24'],
    ['4/9 * 3/8', '1/6'],
    ['6/7 : 3/14', '4'],
    ['6/7 ÷ 3/14', '4'],
    ['1/3 + 2/5 × 5/6', '2/3'],
    ['(3/4 − 1/2) ÷ 5/8', '2/5'],
    ['(2/3)^2 - 1/9', '1/3'],
    ['(2/3)² - 1/9', '1/3'],
    ['-2^2', '−4'],
    ['(-2)^2', '4'],
    ['(-2/3)^-2', '9/4'],
    ['1/2 - (-1/3)', '5/6'],
    ['0,25 + 1/3', '7/12'],
    ['0.25 + 1/3', '7/12'],
    ['1/2/3', '1/6'],
    ['84/126', '2/3'],
    ['1 - 3/8 - 1/4', '3/8'],
    ['4 ÷ 2/3', '6'],
    ['1 - 2/5 - 1/3 × (1 - 2/5)', '2/5'],
    ['−(1/2 + 1/3) × 6', '−5'],
    ['1/6 - 3/4', '−7/12'],
    ['[1/2 + 1/4] x 4', '3'],
    ['(5/7)^0', '1'],
    ['3/4 - 3/4', '0'],
  ];
  for (const [expr, esperado] of CASOS) {
    test(`${expr} = ${esperado}`, () => {
      expect(valor(expr)).toBe(esperado);
    });
  }

  test('la jerarquía decide: 1/3 + 2/5 × 5/6 no es 11/18', () => {
    expect(valor('1/3 + 2/5 × 5/6')).not.toBe('11/18');
    expect(valor('(1/3 + 2/5) × 5/6')).toBe('11/18');
  });

  test('el resultado final es siempre irreducible y con el denominador positivo', () => {
    for (const expr of ['6/8', '-6/-8', '10/4 + 1/4', '2/-3', '100/1000']) {
      const r = evaluarExpresion(expr);
      expect(r.ok).toBe(true);
      if (r.ok) {
        expect(esIrreducible(r.valor)).toBe(true);
        expect(r.valor.den).toBeGreaterThan(0);
      }
    }
  });
});

test.describe('evaluarExpresion — paso a paso', () => {
  test('una operación por paso, en el orden del cuaderno, con la expresión que queda', () => {
    const r = evaluarExpresion('(3/4 − 1/2) ÷ 5/8');
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.inicial).toBe('(3/4 − 1/2) ÷ 5/8');
    expect(r.pasos.map((p) => p.expresion)).toEqual(['1/4 ÷ 5/8', '2/5']);
    expect(r.pasos[0].explicacion.join(' ')).toContain('m.c.m.(4, 2) = 4');
    expect(r.pasos[1].explicacion.join(' ')).toContain('1/4 × 8/5 = 8/20');
    expect(r.pasos[1].explicacion.join(' ')).toContain('dividiendo entre 4');
  });

  test('la multiplicación se resuelve antes que la suma que la precede', () => {
    const r = evaluarExpresion('1/3 + 2/5 × 5/6');
    expect(r.ok && r.pasos.map((p) => p.expresion)).toEqual(['1/3 + 1/3', '2/3']);
  });

  test('un negativo detrás de un signo se escribe entre paréntesis', () => {
    const r = evaluarExpresion('1/2 - (-1/3)');
    expect(r.ok && r.inicial).toBe('1/2 − (−1/3)');
  });

  test('los decimales se pasan a fracción en un primer paso propio', () => {
    const r = evaluarExpresion('0,25 + 1/3');
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.pasos[0].explicacion[0]).toContain('0,25 = 25/100 = 1/4');
    expect(r.pasos[0].expresion).toBe('1/4 + 1/3');
  });

  test('una fracción sola sin simplificar tiene un único paso: simplificarla', () => {
    const r = evaluarExpresion('84/126');
    expect(r.ok && r.pasos.length).toBe(1);
  });

  test('una fracción ya irreducible no tiene pasos', () => {
    const r = evaluarExpresion('5/7');
    expect(r.ok && r.pasos.length).toBe(0);
  });
});

test.describe('evaluarExpresion — rechazos con mensaje, sin lanzar', () => {
  const ERRORES: [string, RegExp][] = [
    ['', /Escribe una operación/],
    ['3/0', /denominador no puede ser 0/],
    ['1/(1/2 - 1/2)', /No se puede dividir entre cero/],
    ['2/3^2', /ambiguo/],
    ['1 1/2', /Falta un operador.*1 \+ 1\/2/],
    ['(1/2 + 1/3', /Falta cerrar un paréntesis/],
    ['1/2 + 1/3)', /Sobra un paréntesis/],
    ['1/2 +', /incompleta/],
    ['1/2 & 1/3', /No reconozco el símbolo «&»/],
    ['0^0', /0 elevado a 0/],
    ['0^-1', /exponente negativo/],
    ['2^1/2', /no hace raíces/],
    ['99999999999^9', /demasiadas cifras/],
    ['1/2'.repeat(80), /demasiado larga/],
  ];
  for (const [expr, motivo] of ERRORES) {
    test(`«${expr.slice(0, 30)}» → ${motivo}`, () => {
      const r = evaluarExpresion(expr);
      expect(r.ok).toBe(false);
      if (!r.ok) {
        expect(r.error).toMatch(motivo);
        expect(r.error).not.toMatch(/NaN|undefined|Infinity/);
      }
    });
  }
});

test.describe('primitivas', () => {
  test('operar suma por m.c.m. y no por producto de denominadores', () => {
    const r = operar({ num: 1, den: 6 }, '+', { num: 1, den: 4 });
    expect(r.ok && r.explicacion[0]).toContain('m.c.m.(6, 4) = 12');
    expect(r.ok && textoFraccion(r.valor)).toBe('5/12');
  });

  test('potencia con exponente negativo invierte la base', () => {
    const r = potencia({ num: 2, den: 5 }, -3);
    expect(r.ok && textoFraccion(r.valor)).toBe('125/8');
  });

  test('mcm y simplificar', () => {
    expect(mcm(6, 8)).toBe(24);
    expect(mcm(1, 7)).toBe(7);
    expect(simplificar({ num: -6, den: -8 })).toEqual({ num: 3, den: 4 });
    expect(simplificar({ num: 0, den: 9 })).toEqual({ num: 0, den: 1 });
  });

  test('factorizar y explicar la simplificación de 84/126', () => {
    expect(factorizar(84)).toEqual([[2, 2], [3, 1], [7, 1]]);
    expect(factorizar(126)).toEqual([[2, 1], [3, 2], [7, 1]]);
    const s = explicarSimplificacion({ num: 84, den: 126 });
    expect(s.mcd).toBe(42);
    expect(s.resultado).toEqual({ num: 2, den: 3 });
    expect(s.lineas.join(' ')).toContain('84 = 2² · 3 · 7 y 126 = 2 · 3² · 7');
  });

  test('una fracción ya irreducible lo dice en vez de dividir entre 1', () => {
    const s = explicarSimplificacion({ num: 7, den: 9 });
    expect(s.lineas.join(' ')).toContain('ya es irreducible');
  });

  test('desarrollo decimal exacto con período', () => {
    const d = (num: number, den: number) => textoDecimal(desarrolloDecimal({ num, den }));
    expect(d(5, 6)).toBe('0,8(3)');
    expect(d(1, 7)).toBe('0,(142857)');
    expect(d(3, 8)).toBe('0,375');
    expect(d(-1, 3)).toBe('−0,(3)');
    expect(d(22, 7)).toBe('3,(142857)');
    expect(d(4, 2)).toBe('2');
  });

  test('número mixto', () => {
    expect(textoMixto(aMixto({ num: 7, den: 4 }))).toBe('1 3/4');
    expect(textoMixto(aMixto({ num: -7, den: 4 }))).toBe('−1 3/4');
    expect(textoMixto(aMixto({ num: 8, den: 4 }))).toBe('2');
    expect(textoMixto(aMixto({ num: 3, den: 4 }))).toBe('3/4');
  });

  test('números con formato español: 4 cifras sin agrupar, 5 con punto', () => {
    expect(textoFraccion({ num: 1234, den: 12345 })).toBe('1234/12.345');
  });

  test('equivalentes amplían la irreducible', () => {
    expect(equivalentes({ num: 4, den: 6 }, 3).map(textoFraccion)).toEqual(['4/6', '6/9', '8/12']);
  });

  test('comparar por denominador común', () => {
    expect(comparar({ num: 2, den: 3 }, { num: 3, den: 4 }).signo).toBe(-1);
    expect(comparar({ num: 2, den: 3 }, { num: 8, den: 12 }).signo).toBe(0);
    expect(comparar({ num: -1, den: 2 }, { num: -2, den: 3 }).signo).toBe(1);
    expect(comparar({ num: 2, den: 3 }, { num: 3, den: 4 }).lineas.join(' ')).toContain('8 < 9');
  });

  test('leerFraccion distingue la forma escrita y no simplifica', () => {
    const forma = (t: string) => {
      const l = leerFraccion(t);
      return l.ok ? `${l.forma}:${l.valor.num}/${l.valor.den}` : 'no';
    };
    expect(forma('7/12')).toBe('fraccion:7/12');
    expect(forma('−7/12')).toBe('fraccion:-7/12');
    expect(forma('7/-12')).toBe('fraccion:-7/12');
    expect(forma('6/8')).toBe('fraccion:6/8');
    expect(forma('1 3/4')).toBe('mixto:7/4');
    expect(forma('-1 3/4')).toBe('mixto:-7/4');
    expect(forma('4')).toBe('entero:4/1');
    expect(forma('0,75')).toBe('decimal:75/100');
    expect(forma('3/0')).toBe('no');
    expect(forma('tres cuartos')).toBe('no');
    expect(forma('12abc')).toBe('no');
  });
});

test('ninguna entrada de una batería aleatoria hace lanzar al motor', () => {
  const simbolos = ['1', '2', '3', '/', '+', '-', '×', '÷', '(', ')', '^', ',', ' ', '0', '7'];
  let semilla = 12345;
  const rnd = () => {
    semilla = (semilla * 1103515245 + 12345) >>> 0;
    return semilla / 0x100000000;
  };
  for (let i = 0; i < 2000; i++) {
    const largo = 1 + Math.floor(rnd() * 14);
    let t = '';
    for (let j = 0; j < largo; j++) t += simbolos[Math.floor(rnd() * simbolos.length)];
    const r = evaluarExpresion(t);
    if (r.ok) {
      const f: Fraccion = r.valor;
      expect(Number.isSafeInteger(f.num) && Number.isSafeInteger(f.den) && f.den > 0).toBe(true);
    } else {
      expect(typeof r.error).toBe('string');
    }
  }
});
