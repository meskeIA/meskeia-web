/**
 * Motor de conversión y operaciones entre sistemas numéricos.
 *
 * Vive aparte de la vista porque el defecto que lo motivó no se veía leyendo el JSX: con
 * 32 bits la máscara se calculaba como `(1 << bits) - 1`, y el contador de desplazamiento
 * de JavaScript va módulo 32, así que `1 << 32` vale 1 y la máscara salía 0. Las ocho
 * operaciones devolvían cero enmascarando ambos operandos ANTES de operar (hallazgo 933).
 *
 * Aquí se trabaja con BigInt: los operadores bit a bit de BigInt usan complemento a dos de
 * precisión ilimitada, así que la máscara de N bits se escribe `(BigInt(1) << BigInt(N)) - BigInt(1)` sin
 * ninguna de las trampas del entero de 32 bits con signo. El resultado se devuelve como
 * `number` porque nunca supera 2³²−1.
 *
 * Casos resueltos a mano en tests/sistemas-numericos-motor.spec.ts.
 */

export type Base = 2 | 8 | 10 | 16;
export type Operacion = 'add' | 'sub' | 'and' | 'or' | 'xor' | 'not' | 'shl' | 'shr';

export const ANCHOS = [4, 8, 16, 32] as const;
export type Ancho = (typeof ANCHOS)[number];

export const NOMBRE_BASE: Record<Base, string> = {
  2: 'binario',
  8: 'octal',
  10: 'decimal',
  16: 'hexadecimal',
};

const DIGITOS_VALIDOS: Record<Base, RegExp> = {
  2: /^[01]+$/,
  8: /^[0-7]+$/,
  10: /^[0-9]+$/,
  16: /^[0-9A-Fa-f]+$/,
};

/** Un texto vacío no es inválido: es que todavía no hay nada escrito. */
export function esValidoParaBase(valor: string, base: Base): boolean {
  if (!valor || valor.trim() === '') return true;
  return DIGITOS_VALIDOS[base].test(valor.trim());
}

export function aDecimal(valor: string, base: Base): number {
  if (!valor || valor.trim() === '') return 0;
  return parseInt(valor.trim(), base);
}

export function desdeDecimal(decimal: number, base: Base): string {
  if (!Number.isFinite(decimal) || decimal < 0) return '0';
  return decimal.toString(base).toUpperCase();
}

/** Agrupa un binario de 4 en 4 desde la derecha, para leerlo de un vistazo. */
export function agruparBinario(binario: string): string {
  if (!binario) return '0';
  const rellenado = binario.padStart(Math.ceil(binario.length / 4) * 4, '0');
  return rellenado.match(/.{1,4}/g)?.join(' ') || '0';
}

// ─────────────────────────────── Conversión ───────────────────────────────

export type ResultadoConversion =
  | {
      ok: true;
      binario: string;
      octal: string;
      decimal: string;
      hexadecimal: string;
      pasos: string[];
    }
  | { ok: false; error: string };

/**
 * Pasos de conversión desde la base que el usuario ha elegido.
 *
 * Hasta el 20/09/2026 se invocaba siempre con base de destino 10, así que con la base
 * DECIMAL —la que viene seleccionada por defecto— el bloque de divisiones sucesivas era
 * código muerto y el desplegable mostraba una sola línea, pese a que la metadata, el
 * jsonLd y el faqJsonLd prometen justo ese proceso (hallazgo 935).
 *
 * Octal y hexadecimal no se obtienen repitiendo las divisiones sino agrupando los bits de
 * 3 en 3 y de 4 en 4, que es exacto porque 8 = 2³ y 16 = 2⁴, y es el método que se enseña.
 */
export function generarPasos(valor: string, baseOrigen: Base): string[] {
  const texto = (valor || '').trim().toUpperCase();
  if (!texto) return [];

  const decimal = aDecimal(texto, baseOrigen);
  if (!Number.isFinite(decimal)) return [];

  const pasos: string[] = [`Valor original en ${NOMBRE_BASE[baseOrigen]}: ${texto}`];
  let numeroPaso = 0;

  if (decimal === 0) {
    pasos.push('El cero se escribe igual en las cuatro bases: 0');
    return pasos;
  }

  // Desde una base distinta de la decimal, primero el valor posicional.
  if (baseOrigen !== 10) {
    pasos.push(`Paso ${++numeroPaso} — a decimal, sumando el valor posicional de cada dígito:`);
    const digitos = texto.split('').reverse();
    digitos.forEach((d, i) => {
      const valorDigito = parseInt(d, baseOrigen);
      const peso = Math.pow(baseOrigen, i);
      pasos.push(`  ${d} × ${baseOrigen}^${i} = ${valorDigito} × ${peso} = ${valorDigito * peso}`);
    });
    pasos.push(`  Suma total = ${decimal}`);
  }

  const binario = desdeDecimal(decimal, 2);

  // A binario, por divisiones sucesivas entre 2 (el proceso que promete el faqJsonLd).
  if (baseOrigen !== 2) {
    pasos.push(`Paso ${++numeroPaso} — a binario, dividiendo sucesivamente entre 2:`);
    let resto = decimal;
    while (resto > 0) {
      const cociente = Math.floor(resto / 2);
      pasos.push(`  ${resto} ÷ 2 = ${cociente}, resto = ${resto % 2}`);
      resto = cociente;
    }
    pasos.push(`  Leyendo los restos de abajo a arriba: ${binario}`);
  }

  // A octal y hexadecimal, agrupando bits.
  const grupos3 = binario.padStart(Math.ceil(binario.length / 3) * 3, '0').match(/.{3}/g) || [];
  const grupos4 = binario.padStart(Math.ceil(binario.length / 4) * 4, '0').match(/.{4}/g) || [];
  pasos.push(`Paso ${++numeroPaso} — a octal y hexadecimal, agrupando los bits desde la derecha:`);
  pasos.push(`  de 3 en 3: ${grupos3.join(' ')} → ${desdeDecimal(decimal, 8)} en octal`);
  pasos.push(`  de 4 en 4: ${grupos4.join(' ')} → ${desdeDecimal(decimal, 16)} en hexadecimal`);

  return pasos;
}

export function convertir(texto: string, base: Base): ResultadoConversion | null {
  const valor = (texto || '').trim();
  if (!valor) return null;

  if (!esValidoParaBase(valor, base)) {
    return { ok: false, error: `Valor inválido para base ${base}` };
  }

  const decimal = aDecimal(valor, base);
  if (!Number.isSafeInteger(decimal)) {
    return { ok: false, error: 'Número demasiado grande' };
  }

  return {
    ok: true,
    binario: desdeDecimal(decimal, 2),
    octal: desdeDecimal(decimal, 8),
    decimal: desdeDecimal(decimal, 10),
    hexadecimal: desdeDecimal(decimal, 16),
    pasos: generarPasos(valor, base),
  };
}

// ─────────────────────────────── Operaciones ───────────────────────────────

export type ResultadoOperacion =
  | { ok: true; resultado: number; explicacion: string }
  | { ok: false; error: string };

const mascaraDe = (bits: number) => (BigInt(1) << BigInt(bits)) - BigInt(1);

const enBinario = (valor: bigint, bits: number) => valor.toString(2).padStart(bits, '0');

/**
 * Opera sobre un registro de `bits` bits, con la semántica de un registro de verdad: lo
 * que se sale por un extremo se pierde.
 *
 * Un desplazamiento mayor o igual que el ancho vacía el registro. Hasta el 20/09/2026 el
 * contador se reducía con `% bits`, de modo que «<< 8» sobre 8 bits se convertía en «<< 0»
 * y devolvía el operando intacto (hallazgo 934), justo lo contrario de lo que enseña el
 * bloque educativo de la propia página.
 */
export function operar(a: number, b: number, op: Operacion, bits: number): ResultadoOperacion {
  if (!Number.isSafeInteger(a) || !Number.isSafeInteger(b) || a < 0 || b < 0) {
    return { ok: false, error: 'Los operandos deben ser enteros positivos' };
  }

  const mascara = mascaraDe(bits);
  const A = BigInt(a) & mascara;
  const B = BigInt(b) & mascara;

  let resultado: bigint;
  let explicacion: string;

  switch (op) {
    case 'add': {
      const suma = A + B;
      resultado = suma & mascara;
      explicacion =
        suma > mascara
          ? `${A} + ${B} = ${suma}, que no cabe en ${bits} bits: se conserva el resto módulo ${2 ** bits}, ${resultado}`
          : `${A} + ${B} = ${resultado}`;
      break;
    }
    case 'sub': {
      const resta = A - B;
      resultado = resta & mascara; // BigInt opera en complemento a dos de precisión ilimitada
      explicacion =
        resta < BigInt(0)
          ? `${A} − ${B} = −${-resta}. En ${bits} bits el negativo se guarda en complemento a dos: ${enBinario(resultado, bits)}, que leído sin signo es ${resultado}`
          : `${A} − ${B} = ${resultado}`;
      break;
    }
    case 'and':
      resultado = A & B;
      explicacion = `${enBinario(A, bits)} AND ${enBinario(B, bits)} = ${enBinario(resultado, bits)}`;
      break;
    case 'or':
      resultado = A | B;
      explicacion = `${enBinario(A, bits)} OR ${enBinario(B, bits)} = ${enBinario(resultado, bits)}`;
      break;
    case 'xor':
      resultado = A ^ B;
      explicacion = `${enBinario(A, bits)} XOR ${enBinario(B, bits)} = ${enBinario(resultado, bits)}`;
      break;
    case 'not':
      resultado = ~A & mascara;
      explicacion = `NOT ${enBinario(A, bits)} = ${enBinario(resultado, bits)}`;
      break;
    case 'shl': {
      // Acotar antes de desplazar: con un contador enorme el BigInt intermedio sería inmenso.
      resultado = b >= bits ? BigInt(0) : (A << B) & mascara;
      explicacion =
        b >= bits
          ? `${enBinario(A, bits)} << ${b} = ${enBinario(BigInt(0), bits)} (los ${bits} bits salen del registro)`
          : `${enBinario(A, bits)} << ${b} = ${enBinario(resultado, bits)}`;
      break;
    }
    case 'shr': {
      resultado = b >= bits ? BigInt(0) : A >> B;
      explicacion =
        b >= bits
          ? `${enBinario(A, bits)} >> ${b} = ${enBinario(BigInt(0), bits)} (los ${bits} bits salen del registro)`
          : `${enBinario(A, bits)} >> ${b} = ${enBinario(resultado, bits)}`;
      break;
    }
    default:
      return { ok: false, error: 'Operación desconocida' };
  }

  return { ok: true, resultado: Number(resultado), explicacion };
}

/**
 * Puerta única desde la vista: valida el texto de los dos operandos y opera.
 *
 * Antes, un operando inválido hacía `setOpResult(null)` sin mensaje: la tarjeta de
 * resultado desaparecía sin decir por qué, mientras el panel de conversión de la misma
 * página sí avisaba para el mismo error (hallazgo 937).
 */
export function calcularOperacion(
  textoA: string,
  textoB: string,
  op: Operacion,
  base: Base,
  bits: number
): ResultadoOperacion {
  const a = (textoA || '').trim();
  const b = (textoB || '').trim();

  if (!a) return { ok: false, error: 'Escribe el operando A' };
  if (!esValidoParaBase(a, base)) {
    return { ok: false, error: `El operando A no es válido en base ${base}` };
  }

  if (op !== 'not') {
    if (!b) return { ok: false, error: 'Escribe el operando B' };
    if (!esValidoParaBase(b, base)) {
      return { ok: false, error: `El operando B no es válido en base ${base}` };
    }
  }

  const valorA = aDecimal(a, base);
  const valorB = op === 'not' ? 0 : aDecimal(b, base);

  if (!Number.isSafeInteger(valorA) || !Number.isSafeInteger(valorB)) {
    return { ok: false, error: 'Número demasiado grande' };
  }

  return operar(valorA, valorB, op, bits);
}
