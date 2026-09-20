/**
 * Tests unitarios del motor de calculadora-sistemas-numericos
 *
 * Ejecutar: npx playwright test tests/sistemas-numericos-motor.spec.ts
 *
 * Los valores esperados están resueltos a mano, no leídos de la app:
 *
 *   42 + 15 = 57            · 57 en hex es 39     · 240 OR 15 = 255 (1111 0000 | 0000 1111)
 *   NOT 0 en 32 bits        = 4 294 967 295       · en 16 bits = 65 535 · en 8 bits = 255
 *   1 << 8 en 8 bits        = 0                   · 128 >> 8 en 8 bits = 0
 *   1 << 3                  = 8                   · 3 − 10 en 8 bits = 249, que representa −7
 *   255 + 1 en 8 bits       = 0                   · 15 + 1 en 4 bits = 0
 *   25 decimal = 11001₂     = 31₈ = 19₁₆
 *
 * El hallazgo 933 era que CON 32 BITS todas las operaciones devolvían 0: la máscara
 * `(1 << 32) - 1` vale 0 porque el contador de desplazamiento de JavaScript va módulo 32.
 * El 934, que un desplazamiento igual al ancho devolvía el operando intacto, porque el
 * contador se reducía con `% bits`. Los dos están abajo con su caso.
 */

import { test, expect } from '@playwright/test';
import { operar, calcularOperacion, convertir, generarPasos } from '../app/calculadora-sistemas-numericos/motor';

/** Atajo: opera y falla el test si el motor rechaza, en vez de devolver undefined. */
function valor(a: number, b: number, op: Parameters<typeof operar>[2], bits: number): number {
  const r = operar(a, b, op, bits);
  if (!r.ok) throw new Error(`el motor rechazó ${a} ${op} ${b} en ${bits} bits: ${r.error}`);
  return r.resultado;
}

test.describe('Hallazgo 933 — los 32 bits no pueden devolver cero', () => {
  test('las ocho operaciones con ancho de 32 bits', () => {
    expect(valor(42, 15, 'add', 32)).toBe(57);
    expect(valor(42, 15, 'sub', 32)).toBe(27);
    expect(valor(240, 15, 'and', 32)).toBe(0); // 1111 0000 AND 0000 1111 — este cero SÍ es el correcto
    expect(valor(240, 15, 'or', 32)).toBe(255);
    expect(valor(240, 15, 'xor', 32)).toBe(255);
    expect(valor(0, 0, 'not', 32)).toBe(4294967295);
    expect(valor(1, 4, 'shl', 32)).toBe(16);
    expect(valor(256, 4, 'shr', 32)).toBe(16);
  });

  test('el registro de 32 bits desborda en 2³²', () => {
    expect(valor(4294967295, 1, 'add', 32)).toBe(0);
    expect(valor(4294967295, 0, 'not', 32)).toBe(0);
    expect(valor(1, 31, 'shl', 32)).toBe(2147483648); // el bit más alto NO se vuelve negativo
  });

  test('el ancho sigue mandando en 4, 8 y 16 bits', () => {
    expect(valor(15, 1, 'add', 4)).toBe(0);
    expect(valor(255, 1, 'add', 8)).toBe(0);
    expect(valor(0, 0, 'not', 4)).toBe(15);
    expect(valor(0, 0, 'not', 8)).toBe(255);
    expect(valor(0, 0, 'not', 16)).toBe(65535);
  });
});

test.describe('Hallazgo 934 — un desplazamiento del ancho vacía el registro', () => {
  test('desplazar tantos bits como tiene el registro deja cero', () => {
    expect(valor(1, 8, 'shl', 8)).toBe(0);
    expect(valor(128, 8, 'shr', 8)).toBe(0);
    expect(valor(1, 16, 'shl', 8)).toBe(0); // múltiplo del ancho: tampoco vuelve al principio
    expect(valor(255, 32, 'shr', 32)).toBe(0);
  });

  test('control: por debajo del ancho se desplaza lo que se pide', () => {
    expect(valor(1, 3, 'shl', 8)).toBe(8);
    expect(valor(128, 3, 'shr', 8)).toBe(16);
    expect(valor(1, 7, 'shl', 8)).toBe(128);
  });

  test('la explicación no escribe un contador que no se aplicó', () => {
    const r = operar(1, 8, 'shl', 8);
    if (!r.ok) throw new Error(r.error);
    expect(r.explicacion).toContain('00000001 << 8 = 00000000');
  });
});

test.describe('Hallazgo 939 — la resta dice lo que vale el complemento a dos', () => {
  test('3 − 10 en 8 bits es 249, y se dice que representa −7', () => {
    const r = operar(3, 10, 'sub', 8);
    if (!r.ok) throw new Error(r.error);
    expect(r.resultado).toBe(249);
    expect(r.explicacion).toContain('−7');
    expect(r.explicacion).toContain('11111001');
    expect(r.explicacion).not.toContain('3 − 10 = 249'); // era la igualdad falsa
  });

  test('una resta que no se va a negativo se escribe sin complemento', () => {
    const r = operar(10, 3, 'sub', 8);
    if (!r.ok) throw new Error(r.error);
    expect(r.resultado).toBe(7);
    expect(r.explicacion).toBe('10 − 3 = 7');
  });
});

test.describe('Hallazgo 937 — un operando inválido se rechaza con mensaje', () => {
  test('el 2 no es un dígito binario', () => {
    const r = calcularOperacion('1010', '2', 'add', 2, 8);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toContain('operando B');
  });

  test('control: con B válido calcula', () => {
    const r = calcularOperacion('1010', '1', 'add', 2, 8);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.resultado).toBe(11); // 1010₂ = 10, más 1
  });

  test('NOT no exige operando B', () => {
    const r = calcularOperacion('0', '', 'not', 10, 8);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.resultado).toBe(255);
  });

  test('un operando que no cabe en un entero seguro se rechaza', () => {
    const r = calcularOperacion('99999999999999999999', '1', 'add', 10, 32);
    expect(r.ok).toBe(false);
  });
});

test.describe('Hallazgo 935 — el paso a paso existe para la base decimal', () => {
  test('25 en decimal muestra las cinco divisiones sucesivas que promete el faqJsonLd', () => {
    const pasos = generarPasos('25', 10);
    const texto = pasos.join('\n');
    expect(texto).toContain('25 ÷ 2 = 12, resto = 1');
    expect(texto).toContain('12 ÷ 2 = 6, resto = 0');
    expect(texto).toContain('6 ÷ 2 = 3, resto = 0');
    expect(texto).toContain('3 ÷ 2 = 1, resto = 1');
    expect(texto).toContain('1 ÷ 2 = 0, resto = 1');
    expect(texto).toContain('11001');
  });

  test('octal y hexadecimal salen de agrupar los bits', () => {
    const texto = generarPasos('25', 10).join('\n');
    expect(texto).toContain('31 en octal'); // 011 001
    expect(texto).toContain('19 en hexadecimal'); // 0001 1001
  });

  test('desde binario se explica el valor posicional y no se divide', () => {
    const texto = generarPasos('11001', 2).join('\n');
    expect(texto).toContain('1 × 2^0 = 1 × 1 = 1');
    expect(texto).toContain('Suma total = 25');
    expect(texto).not.toContain('÷ 2');
  });

  test('el cero no entra en un bucle de divisiones', () => {
    const pasos = generarPasos('0', 10);
    expect(pasos.length).toBeLessThan(4);
    expect(pasos.join('\n')).toContain('0');
  });
});

test.describe('Hallazgo 936 — un valor rechazado no deja el resultado anterior', () => {
  test('convertir devuelve error, no un resultado parcial', () => {
    const r = convertir('99999999999999999999', 10);
    expect(r?.ok).toBe(false);
    if (r && !r.ok) expect(r.error).toBe('Número demasiado grande');
  });

  test('un dígito fuera de la base también', () => {
    const r = convertir('G', 16);
    expect(r?.ok).toBe(false);
  });

  test('control: 42 convierte a las cuatro bases', () => {
    const r = convertir('42', 10);
    expect(r?.ok).toBe(true);
    if (r?.ok) {
      expect(r.binario).toBe('101010');
      expect(r.octal).toBe('52');
      expect(r.hexadecimal).toBe('2A');
    }
  });

  test('el campo vacío no es un error: es que no hay nada escrito', () => {
    expect(convertir('', 10)).toBeNull();
  });
});
