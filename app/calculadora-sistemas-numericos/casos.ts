/**
 * Casos para clase — la tarea asignable de `calculadora-sistemas-numericos`.
 *
 * Vive fuera de `page.tsx` porque el build compila la vista sin comprobar si la aritmética
 * está bien ([[feedback_motor_calculo_aparte_y_probado]]). Aquí no hay React ni DOM, solo
 * funciones puras, y nada lanza excepciones: lo que falla devuelve `{ ok: false, error }`.
 *
 * ── LA ARITMÉTICA ES LA DE LA APP ─────────────────────────────────────────────
 *
 * Ninguna conversión ni operación se reescribe aquí: todo sale de `./motor.ts`, el mismo
 * módulo con el que pintan sus resultados los paneles de conversión y de operaciones
 * (`aDecimal`, `desdeDecimal`, `esValidoParaBase`, `operar`, `generarPasos`, `agruparBinario`).
 * El motor NO se toca: tiene su propio test de casos a mano (`tests/sistemas-numericos-motor.spec.ts`).
 * Si la corrección y la calculadora contaran distinto, la app suspendería una respuesta que
 * ella misma imprime.
 *
 * Lo único propio de este fichero es PRESENTACIÓN: rellenar con ceros a la izquierda
 * (`padStart`), partir en grupos, alinear las columnas de la suma y leer los datos del
 * enunciado (el par del verde de un color, los nueve caracteres de unos permisos, el código de
 * una letra). Ninguna de esas operaciones decide una respuesta.
 *
 * ── FORMA DE LA RESPUESTA (variante propia de esta app) ─────────────────────
 *
 * La respuesta no es un número decimal sino un NUMERAL escrito en una base. Cada caso declara
 * su `baseRespuesta`, y guarda dos cosas:
 *   · `respuesta`: el VALOR (un `number`), que es lo que se compara;
 *   · `respuestaCanonica`: su escritura, exactamente `desdeDecimal(respuesta, baseRespuesta)`,
 *     sin ceros a la izquierda y con las letras del hexadecimal en mayúsculas.
 *
 * `comprobarRespuesta(texto, esperado)` corrige EXACTO, sin tolerancia:
 *   1. quita espacios y guiones bajos (se admite el binario agrupado «1010 1100»);
 *   2. quita un subíndice final («₂», «₁₆», «(2)», «(16)») si es el de la base pedida, y rechaza
 *      con motivo propio el de OTRA base;
 *   3. quita un prefijo `0x`/`0b`/`0o` (o `#` en hexadecimal) solo si casa con la base pedida:
 *      `0b` en hexadecimal NO es prefijo, son los dígitos 0 y B;
 *   4. valida con `esValidoParaBase` y convierte con `aDecimal`;
 *   5. compara el NÚMERO. Así los ceros a la izquierda y las minúsculas del hexadecimal valen, y
 *      un número escrito en otra base se rechaza con un motivo que se entiende («En binario solo
 *      valen los dígitos 0 y 1»), nunca con «NaN».
 *
 * ⚠️ NO usar `parseSpanishNumber` para la respuesta, aunque el resto del catálogo lo use y el
 * candado `check:parser` lo recomiende: aquí no se lee un número decimal en formato español,
 * se lee un numeral en base b. `parseSpanishNumber('1.010')` daría mil diez, y
 * `parseSpanishNumber('1010')` en un caso de binario daría mil diez en vez de diez. La lectura
 * es `aDecimal` del motor, la misma que usa la calculadora, y solo tras validar los dígitos.
 *
 * ── LOS CONVENIOS, POR ESCRITO ───────────────────────────────────────────────
 *
 *   · Solo enteros no negativos: nada de complemento a dos ni de fracciones (el motor rechaza
 *     el signo y la coma, y así lo promete la app).
 *   · Las operaciones van sobre un registro de 8 bits, como en el panel: lo que se sale por la
 *     izquierda se pierde. Los datos de los casos están elegidos para que no se salga nada.
 *   · Cuando se pide un binario «de 8 bits», se acepta también sin los ceros de la izquierda
 *     (se compara el número), y el enunciado lo dice.
 *
 * ⚠️ Ningún texto de esta sección repite los rótulos de los paneles («Binario (Base 2)»,
 * «Calcular», «Copiar el valor en…»): el acta del Inspector
 * (`tests/apps/calculadora-sistemas-numericos.spec.ts`) localiza esos controles por nombre.
 */

import {
  NOMBRE_BASE,
  aDecimal,
  agruparBinario,
  desdeDecimal,
  esValidoParaBase,
  generarPasos,
  operar,
  type Base,
  type Operacion,
} from './motor';

/* ─────────────────────────── Datos de un caso ─────────────────────────── */

export type Pregunta =
  /** Pasar `valor`, escrito en `baseOrigen`, a `baseRespuesta`. */
  | 'conversion'
  /** Operar `a` y `b` (escritos en `baseOperandos`) sobre un registro de `bits` bits. */
  | 'operacion'
  /** Leer en decimal un canal de un color web #RRGGBB. */
  | 'color'
  /** Pasar unos permisos «rwxr-x---» a su número octal. */
  | 'permisos'
  /** El código ASCII de una letra mayúscula. */
  | 'ascii';

/** Las operaciones del panel que entran en el temario de 13-16 años. */
export type OperacionCaso = Extract<Operacion, 'add' | 'and' | 'or' | 'shl'>;

export type Canal = 'rojo' | 'verde' | 'azul';

export interface DatosCaso {
  pregunta: Pregunta;
  /** Sistema en el que se escribe la respuesta. */
  baseRespuesta: Base;
  /** `conversion`: el número tal como lo da el enunciado, y su base. */
  valor?: string;
  baseOrigen?: Base;
  /** `operacion`: los dos operandos, la base en que se escriben, la operación y el ancho. */
  a?: string;
  b?: string;
  baseOperandos?: Base;
  op?: OperacionCaso;
  bits?: number;
  /** `color`: los seis dígitos hexadecimales, sin «#», y el canal por el que se pregunta. */
  color?: string;
  canal?: Canal;
  /** `permisos`: nueve caracteres, «r», «w», «x» o «-». */
  permisos?: string;
  /** `ascii`: una letra mayúscula de la A a la Z. */
  letra?: string;
  /** Si se pide un binario con este número de bits: la solución lo enseña relleno. */
  anchoBinario?: number;
}

/* ─────────────────────────── Utilidades de presentación ─────────────────────────── */

const SUBINDICE: Record<Base, string> = { 2: '₂', 8: '₈', 10: '₁₀', 16: '₁₆' };

/** Rótulo de los botones de base de los dos paneles. */
const BOTON_BASE: Record<Base, string> = { 2: 'BIN', 8: 'OCT', 10: 'DEC', 16: 'HEX' };

/** Rótulo de la tarjeta de cada base en el panel de conversión. */
const TARJETA_BASE: Record<Base, string> = {
  2: 'Binario (Base 2)',
  8: 'Octal (Base 8)',
  10: 'Decimal (Base 10)',
  16: 'Hexadecimal (Base 16)',
};

/** Símbolo y nombre con que el panel de operaciones rotula cada botón. */
const BOTON_OPERACION: Record<OperacionCaso, string> = {
  add: '+ Suma',
  and: '& AND',
  or: '| OR',
  shl: '<< Shift Left',
};

/** «45₁₀», «D7₁₆». */
export function conSubindice(numeral: string, base: Base): string {
  return `${numeral}${SUBINDICE[base]}`;
}

/** El binario de `valor` relleno hasta `ancho` bits (sin recortar si ya es más largo). */
function binarioDeAncho(valor: number, ancho: number): string {
  return desdeDecimal(valor, 2).padStart(ancho, '0');
}

/** Lo que imprime la tarjeta de una base en el panel de conversión: el binario, agrupado. */
function cifraTarjeta(valor: number, base: Base): string {
  const canonica = desdeDecimal(valor, base);
  return base === 2 ? agruparBinario(canonica) : canonica;
}

function esBase(n: unknown): n is Base {
  return n === 2 || n === 8 || n === 10 || n === 16;
}

/**
 * «D7 en hexadecimal (215 en decimal)», «101111 en binario (con 8 bits, 0010 1111)»,
 * «128 en decimal». Es la cadena que cierra el paso a paso y la que se muestra como respuesta.
 */
export function textoRespuesta(valor: number, base: Base, anchoBinario?: number): string {
  if (!Number.isFinite(valor) || valor < 0) return '—';
  const canonica = desdeDecimal(valor, base);
  const partes = [`${canonica} en ${NOMBRE_BASE[base]}`];
  const extras: string[] = [];
  if (base === 2 && anchoBinario && canonica.length < anchoBinario) {
    extras.push(`con ${anchoBinario} bits, ${agruparBinario(binarioDeAncho(valor, anchoBinario))}`);
  }
  if (base !== 10) extras.push(`${desdeDecimal(valor, 10)} en decimal`);
  if (extras.length > 0) partes.push(`(${extras.join('; ')})`);
  return partes.join(' ');
}

/* ─────────────────────────── Paso a paso ─────────────────────────── */

/**
 * El paso a paso de una conversión, con los bloques de `generarPasos` —el mismo texto que
 * enseña el desplegable del panel— que responden a ESTA pregunta.
 *
 * `generarPasos` explica siempre las tres conversiones a la vez (a decimal, a binario y a
 * octal/hexadecimal). Aquí se escogen sus bloques por el título («a decimal», «a binario»,
 * «a octal y hexadecimal») y, dentro del último, la línea de la base pedida. Si el motor
 * cambiara esos títulos y no se reconociera ninguno, se devuelve su salida COMPLETA: sobra
 * texto, pero no falta el desarrollo.
 *
 * De octal o hexadecimal a binario, el método que se enseña es dígito a dígito (cada dígito
 * hexadecimal son 4 bits, cada octal 3), no dividir entre 2: ese paso se escribe aquí, con
 * las cifras del motor.
 */
export function pasosConversion(valor: string, origen: Base, destino: Base): string[] {
  const texto = (valor || '').trim().toUpperCase();
  const todos = generarPasos(texto, origen);
  if (todos.length === 0) return [];
  const decimal = aDecimal(texto, origen);
  if (decimal === 0 || origen === destino) return todos;

  // Bloques: cabecera «Paso N — …» seguida de sus líneas sangradas.
  const bloques: { cabecera: string; lineas: string[] }[] = [];
  for (const linea of todos.slice(1)) {
    if (/^Paso \d+/.test(linea)) bloques.push({ cabecera: linea, lineas: [] });
    else if (bloques.length > 0) bloques[bloques.length - 1].lineas.push(linea);
  }
  const bloque = (clave: string) => bloques.find((b) => b.cabecera.includes(clave));
  const aDecimalB = bloque('a decimal');
  const aBinarioB = bloque('a binario');
  const agrupandoB = bloque('agrupando');

  const elegidos: { cabecera: string; lineas: string[] }[] = [];
  const digitoADigito = (): { cabecera: string; lineas: string[] } => {
    const ancho = origen === 16 ? 4 : 3;
    const lineas = texto
      .split('')
      .map((d) => `  ${d} → ${binarioDeAncho(aDecimal(d, origen), ancho)}`);
    const unidos = texto
      .split('')
      .map((d) => binarioDeAncho(aDecimal(d, origen), ancho))
      .join(' ');
    lineas.push(`  Juntando los grupos: ${unidos} → ${desdeDecimal(decimal, 2)} sin los ceros de la izquierda`);
    return {
      cabecera: `a binario, dígito a dígito: cada dígito ${NOMBRE_BASE[origen]} son ${ancho} bits:`,
      lineas,
    };
  };

  if (destino === 10) {
    if (aDecimalB) elegidos.push(aDecimalB);
  } else if (destino === 2) {
    if (origen === 10 && aBinarioB) elegidos.push(aBinarioB);
    if (origen === 8 || origen === 16) elegidos.push(digitoADigito());
  } else {
    // A octal o a hexadecimal: primero hace falta el binario.
    if (origen === 10 && aBinarioB) elegidos.push(aBinarioB);
    if (origen === 8 || origen === 16) elegidos.push(digitoADigito());
    if (agrupandoB) {
      const marca = destino === 8 ? 'en octal' : 'en hexadecimal';
      elegidos.push({
        cabecera: agrupandoB.cabecera.replace('a octal y hexadecimal', `a ${NOMBRE_BASE[destino]}`),
        lineas: agrupandoB.lineas.filter((l) => l.includes(marca)),
      });
    }
  }

  const utiles = elegidos.filter((b) => b.lineas.length > 0);
  if (utiles.length === 0) return todos;

  const pasos = [todos[0]];
  utiles.forEach((b, i) => {
    const titulo = b.cabecera.replace(/^Paso \d+ — /, '');
    pasos.push(`Paso ${i + 1} — ${titulo}`);
    pasos.push(...b.lineas);
  });
  return pasos;
}

/** Filas alineadas de una suma binaria en columna, con la fila de acarreos encima. */
function pasosSumaEnColumna(a: number, b: number, bits: number): string[] {
  const ancho = bits + 1;
  // Suma con un bit más de ancho, para ver el acarreo que saldría del registro.
  const suma = operar(a, b, 'add', ancho);
  const x = operar(a, b, 'xor', ancho);
  if (!suma.ok || !x.ok) return [];
  // El bit i de (suma XOR a XOR b) es el acarreo que ENTRA en la columna i.
  const c = operar(suma.resultado, x.resultado, 'xor', ancho);
  if (!c.ok) return [];

  const acarreos = binarioDeAncho(c.resultado, ancho).replace(/0/g, ' ');
  const filaSuma = binarioDeAncho(suma.resultado, ancho).replace(/^0/, ' ');
  const rotulo = (s: string) => `  ${s.padEnd(10, ' ')}`;
  return [
    'Suma en columna, de derecha a izquierda (0 + 1 = 1 · 1 + 1 = 10: se escribe 0 y se lleva 1 · 1 + 1 + 1 = 11: se escribe 1 y se lleva 1):',
    `${rotulo('acarreos')}${acarreos}`,
    `${rotulo('')} ${binarioDeAncho(a, bits)}`,
    `${rotulo('+')} ${binarioDeAncho(b, bits)}`,
    `${rotulo('=')}${filaSuma}`,
  ];
}

/* ─────────────────────────── Resolución ─────────────────────────── */

export interface Resolucion {
  ok: boolean;
  /** El valor de la respuesta (un entero no negativo). */
  valor: number;
  pasos: string[];
  error?: string;
}

function fallo(error: string, pasos: string[] = []): Resolucion {
  return { ok: false, valor: NaN, pasos, error };
}

/** Un operando del enunciado, leído con el motor tras validar sus dígitos. */
function leer(texto: string | undefined, base: Base | undefined): number {
  if (!texto || !esBase(base) || !esValidoParaBase(texto, base)) return NaN;
  const n = aDecimal(texto, base);
  return Number.isSafeInteger(n) && n >= 0 ? n : NaN;
}

const CANALES: Record<Canal, number> = { rojo: 0, verde: 2, azul: 4 };

/**
 * Recalcula la respuesta desde los datos, sin mirar el campo `respuesta` del caso. Nunca
 * lanza: un `throw` dentro de un render de React tumbaría la app entera.
 */
export function resolverCaso(datos: DatosCaso): Resolucion {
  const destino = datos.baseRespuesta;
  if (!esBase(destino)) return fallo('Falta la base de la respuesta.');

  let valor: number;
  const pasos: string[] = [];

  switch (datos.pregunta) {
    case 'conversion': {
      const origen = datos.baseOrigen;
      if (!esBase(origen)) return fallo('Falta la base del número.');
      valor = leer(datos.valor, origen);
      if (!Number.isFinite(valor)) return fallo(`El número no es válido en ${NOMBRE_BASE[origen]}.`);
      pasos.push(...pasosConversion(datos.valor ?? '', origen, destino));
      break;
    }

    case 'operacion': {
      const base = datos.baseOperandos;
      const op = datos.op;
      const bits = datos.bits ?? 8;
      if (!esBase(base)) return fallo('Falta la base de los operandos.');
      if (!op) return fallo('Falta la operación.');
      const a = leer(datos.a, base);
      const b = leer(datos.b, base);
      if (!Number.isFinite(a) || !Number.isFinite(b)) return fallo('Los operandos no son válidos.');
      const r = operar(a, b, op, bits);
      if (!r.ok) return fallo(r.error);
      valor = r.resultado;

      if (base !== 2) {
        pasos.push(
          `Primero, los operandos en binario de ${bits} bits: ${datos.a} → ${agruparBinario(binarioDeAncho(a, bits))} · ${datos.b} → ${agruparBinario(binarioDeAncho(b, bits))}.`,
        );
      }
      if (op === 'add') {
        pasos.push(...pasosSumaEnColumna(a, b, bits));
        pasos.push(`Comprobación en decimal: ${r.explicacion}.`);
      } else if (op === 'and') {
        pasos.push('AND bit a bit: en cada columna sale 1 solo si los DOS bits son 1.');
        pasos.push(`  ${r.explicacion}`);
      } else if (op === 'or') {
        pasos.push('OR bit a bit: en cada columna sale 1 si AL MENOS UNO de los dos bits es 1.');
        pasos.push(`  ${r.explicacion}`);
      } else {
        pasos.push(
          `Desplazar ${b} ${b === 1 ? 'posición' : 'posiciones'} a la izquierda: cada bit se mueve hacia la izquierda y entran ceros por la derecha.`,
        );
        pasos.push(`  ${r.explicacion}`);
        pasos.push(
          `Mientras no se salga ningún 1 del registro, desplazar ${b === 1 ? 'una posición multiplica por 2' : `${b} posiciones multiplica por 2^${b}`}: ${a} pasa a ${valor}.`,
        );
      }
      if (destino !== 2) {
        // El resultado está en binario: a la base pedida, con el paso a paso del motor.
        const conversion = pasosConversion(desdeDecimal(valor, 2), 2, destino);
        pasos.push(...conversion.slice(1));
      }
      break;
    }

    case 'color': {
      const color = (datos.color ?? '').toUpperCase();
      const canal = datos.canal;
      if (color.length !== 6 || !esValidoParaBase(color, 16)) return fallo('El color no es un #RRGGBB válido.');
      if (!canal || !(canal in CANALES)) return fallo('Falta el canal del color.');
      const par = color.slice(CANALES[canal], CANALES[canal] + 2);
      valor = leer(par, 16);
      if (!Number.isFinite(valor)) return fallo('El color no es válido.');
      pasos.push(
        `Un color #RRGGBB son tres pares de dígitos hexadecimales: rojo (${color.slice(0, 2)}), verde (${color.slice(2, 4)}) y azul (${color.slice(4, 6)}). Cada par va de 00 a FF, es decir, de 0 a 255.`,
      );
      pasos.push(`El ${canal} de #${color} es el par ${par}.`);
      pasos.push(...pasosConversion(par, 16, destino).slice(1));
      break;
    }

    case 'permisos': {
      const p = datos.permisos ?? '';
      const patron = 'rwxrwxrwx';
      if (p.length !== 9 || !p.split('').every((ch, i) => ch === '-' || ch === patron[i])) {
        return fallo('Los permisos deben ser nueve caracteres como «rwxr-x---».');
      }
      const bitsTexto = p
        .split('')
        .map((ch) => (ch === '-' ? '0' : '1'))
        .join('');
      valor = leer(bitsTexto, 2);
      if (!Number.isFinite(valor)) return fallo('Los permisos no son válidos.');
      const quien = ['propietario', 'grupo', 'otros'];
      pasos.push('Cada letra presente es un 1 y cada guion un 0. Se parten en tres grupos de 3 bits: propietario, grupo y otros.');
      for (let g = 0; g < 3; g++) {
        const trozo = p.slice(g * 3, g * 3 + 3);
        const grupo = bitsTexto.slice(g * 3, g * 3 + 3);
        const cifra = desdeDecimal(aDecimal(grupo, 2), 8);
        pasos.push(`  ${quien[g].padEnd(12, ' ')} ${trozo} → ${grupo} → ${cifra}`);
      }
      pasos.push(
        `Juntando las tres cifras octales: ${desdeDecimal(valor, 8)}. Es lo mismo que agrupar de 3 en 3 el binario ${bitsTexto} (${desdeDecimal(valor, 10)} en decimal).`,
      );
      if (destino !== 8) pasos.push(...pasosConversion(bitsTexto, 2, destino).slice(1));
      break;
    }

    case 'ascii': {
      const letra = datos.letra ?? '';
      if (!/^[A-Z]$/.test(letra)) return fallo('La letra debe ser una mayúscula de la A a la Z.');
      valor = letra.charCodeAt(0);
      const posicion = valor - 'A'.charCodeAt(0);
      pasos.push(
        `En ASCII las mayúsculas van seguidas: A = 65, B = 66, C = 67… La ${letra} está ${posicion} ${posicion === 1 ? 'puesto' : 'puestos'} después de la A, así que su código es 65 + ${posicion} = ${valor}.`,
      );
      if (destino !== 10) pasos.push(...pasosConversion(desdeDecimal(valor, 10), 10, destino).slice(1));
      break;
    }

    default:
      return fallo('Pregunta desconocida.');
  }

  if (!Number.isSafeInteger(valor) || valor < 0) return fallo('El resultado no es un entero válido.', pasos);

  pasos.push(`Resultado: ${textoRespuesta(valor, destino, datos.anchoBinario)}.`);
  return { ok: true, valor, pasos };
}

/* ─────────────────────────── Cómo verlo en la calculadora ─────────────────────────── */

/**
 * Qué teclear en los paneles de la app para ver la cifra, con la cifra TAL COMO LA IMPRIME el
 * panel (el binario de las tarjetas va agrupado de 4 en 4 con `agruparBinario`; el de la
 * tarjeta de resultado de las operaciones, relleno hasta el ancho). Se genera desde los datos,
 * así que no puede desincronizarse de la respuesta. `null` si el panel no la enseña (el de
 * operaciones no tiene fila en octal).
 */
export function comoComprobarDe(datos: DatosCaso): string | null {
  const r = resolverCaso(datos);
  if (!r.ok) return null;
  const destino = datos.baseRespuesta;
  const enPanel = (numero: string, origen: Base, extra = '') =>
    `En «Conversión de Bases», pulsa ${BOTON_BASE[origen]}, escribe ${numero}${extra} y lee la tarjeta «${TARJETA_BASE[destino]}»: sale ${cifraTarjeta(r.valor, destino)}.`;

  switch (datos.pregunta) {
    case 'conversion':
      if (!esBase(datos.baseOrigen)) return null;
      return enPanel((datos.valor ?? '').toUpperCase(), datos.baseOrigen);
    case 'color': {
      const color = (datos.color ?? '').toUpperCase();
      const inicio = datos.canal ? CANALES[datos.canal] : 0;
      return enPanel(color.slice(inicio, inicio + 2), 16, ' (solo el par del canal)');
    }
    case 'permisos': {
      const bitsTexto = (datos.permisos ?? '')
        .split('')
        .map((ch) => (ch === '-' ? '0' : '1'))
        .join('');
      return enPanel(bitsTexto, 2, ' (un 1 por letra y un 0 por guion)');
    }
    case 'ascii':
      return enPanel(desdeDecimal(r.valor, 10), 10, ' (el código de la letra)');
    case 'operacion': {
      if (destino !== 2 && destino !== 10 && destino !== 16) return null;
      if (!esBase(datos.baseOperandos) || !datos.op) return null;
      const bits = datos.bits ?? 8;
      const fila = destino === 2 ? 'Binario' : destino === 10 ? 'Decimal' : 'Hexadecimal';
      const cifra =
        destino === 2 ? agruparBinario(binarioDeAncho(r.valor, bits)) : desdeDecimal(r.valor, destino);
      return `En «Operaciones Binarias», pulsa ${BOTON_BASE[datos.baseOperandos]} y ${bits} bits, elige «${BOTON_OPERACION[datos.op]}», escribe ${datos.a} como operando A y ${datos.b} como operando B y pulsa el botón de calcular: la fila ${fila} sale ${cifra}.`;
    }
    default:
      return null;
  }
}

/* ─────────────────────────── Corrección ─────────────────────────── */

export interface RespuestaEsperada {
  /** El valor correcto. */
  respuesta: number;
  /** La base en la que hay que escribirlo. */
  baseRespuesta: Base;
}

export interface Veredicto {
  correcto: boolean;
  motivo: string;
  /** El valor leído de lo que escribió el alumno, o NaN si no se pudo leer. */
  valorLeido: number;
}

const DIGITOS_DE: Record<Base, string> = {
  2: 'En binario solo valen los dígitos 0 y 1.',
  8: 'En octal solo valen los dígitos del 0 al 7.',
  10: 'En decimal solo valen los dígitos del 0 al 9, sin puntos ni comas.',
  16: 'En hexadecimal solo valen los dígitos del 0 al 9 y las letras de la A a la F.',
};

/** Subíndices y sufijos «(b)» reconocidos, con la base que marcan. Los más largos primero. */
const SUFIJOS: ReadonlyArray<{ sufijo: string; base: Base }> = [
  { sufijo: '₁₆', base: 16 },
  { sufijo: '₁₀', base: 10 },
  { sufijo: '(16)', base: 16 },
  { sufijo: '(10)', base: 10 },
  { sufijo: '₂', base: 2 },
  { sufijo: '₈', base: 8 },
  { sufijo: '(2)', base: 2 },
  { sufijo: '(8)', base: 8 },
];

const BASES_TODAS: readonly Base[] = [2, 8, 10, 16];

const PREFIJOS: ReadonlyArray<{ prefijo: string; base: Base }> = [
  { prefijo: '0X', base: 16 },
  { prefijo: '#', base: 16 },
  { prefijo: '0B', base: 2 },
  { prefijo: '0O', base: 8 },
];

/**
 * Deja el texto del alumno en solo dígitos: sin espacios ni guiones bajos, en mayúsculas y
 * sin el subíndice o el prefijo de la base pedida. Devuelve también la marca de OTRA base, si
 * la había, para poder decir por qué se rechaza.
 */
export function normalizarNumeral(texto: string, base: Base): { digitos: string; otraBase: Base | null } {
  let t = (texto ?? '').replace(/[\s_]+/g, '').toUpperCase();
  let otraBase: Base | null = null;

  for (const { sufijo, base: b } of SUFIJOS) {
    if (t.length > sufijo.length && t.endsWith(sufijo)) {
      if (b === base) t = t.slice(0, -sufijo.length);
      else otraBase = b;
      break;
    }
  }

  if (otraBase === null) {
    for (const { prefijo, base: b } of PREFIJOS) {
      if (t.length > prefijo.length && t.startsWith(prefijo)) {
        if (b === base) {
          t = t.slice(prefijo.length);
          break;
        }
        // «0B1» en hexadecimal son los dígitos 0, B y 1, no un prefijo: solo se señala la otra
        // base si lo que queda NO es un numeral válido de la base pedida.
        if (!esValidoParaBase(t, base)) {
          otraBase = b;
          break;
        }
      }
    }
  }

  return { digitos: t, otraBase };
}

/** El primer carácter que no es un dígito de `base`, para nombrarlo en el motivo. */
function primerIntruso(digitos: string, base: Base): string {
  for (const ch of digitos) {
    if (!esValidoParaBase(ch, base)) return ch;
  }
  return '';
}

/** Entero en formato español («47.529.918.737»), para los mensajes. */
const ENTERO_ES = new Intl.NumberFormat('es-ES', { maximumFractionDigits: 0 });

/**
 * Si `digitos` es la respuesta correcta escrita en otra base, esa base; si no, null. Tiene en
 * cuenta el «0b» que en hexadecimal no se quita como prefijo («0B11010111» son dígitos
 * hexadecimales válidos, pero quien lo escribe está dando el binario).
 */
function enOtraBase(digitos: string, base: Base, respuesta: number): Base | null {
  for (const otra of BASES_TODAS) {
    if (otra === base) continue;
    const candidatos = [digitos];
    for (const { prefijo, base: b } of PREFIJOS) {
      if (b === otra && digitos.startsWith(prefijo) && digitos.length > prefijo.length) {
        candidatos.push(digitos.slice(prefijo.length));
      }
    }
    for (const t of candidatos) {
      if (esValidoParaBase(t, otra) && aDecimal(t, otra) === respuesta) return otra;
    }
  }
  return null;
}

/**
 * Corrige la respuesta del alumno, EXACTA: se compara el número, no la escritura. Nunca lanza.
 *
 * Acepta ceros a la izquierda, minúsculas, espacios y guiones bajos entre los dígitos, y el
 * prefijo o el subíndice de la base pedida. Rechaza con un motivo propio el texto vacío, los
 * dígitos que no son de la base y las marcas de otra base.
 */
export function comprobarRespuesta(texto: string, esperado: RespuestaEsperada): Veredicto {
  const base = esperado.baseRespuesta;
  const nombre = esBase(base) ? NOMBRE_BASE[base] : 'la base pedida';
  if (!esBase(base) || !Number.isFinite(esperado.respuesta)) {
    return { correcto: false, motivo: 'Este caso no tiene respuesta que comparar.', valorLeido: NaN };
  }

  const { digitos, otraBase } = normalizarNumeral(texto, base);

  if (digitos === '') {
    return { correcto: false, motivo: `Escribe tu respuesta en ${nombre}.`, valorLeido: NaN };
  }

  if (otraBase !== null) {
    return {
      correcto: false,
      motivo: `Has marcado el número como ${NOMBRE_BASE[otraBase]}, pero la respuesta se pide en ${nombre}.`,
      valorLeido: NaN,
    };
  }

  // ¿Es la respuesta correcta escrita en OTRA base? Pasa mucho: dar el decimal cuando se pide
  // binario («145» en vez de «10010001»), que se rechazaría por sus dígitos, o dar el decimal
  // cuando se pide hexadecimal («215» en vez de «D7»), cuyos dígitos también son hexadecimales
  // válidos y se leerían como otro número. Se mira antes que el motivo de los dígitos.
  const otra = enOtraBase(digitos, base, esperado.respuesta);

  if (!esValidoParaBase(digitos, base)) {
    if (otra !== null) {
      return { correcto: false, motivo: `Ese es el resultado escrito en ${NOMBRE_BASE[otra]}, pero se pide en ${nombre}.`, valorLeido: NaN };
    }
    const intruso = primerIntruso(digitos, base);
    const detalle = intruso ? ` «${intruso}» no lo es.` : '';
    return { correcto: false, motivo: `${DIGITOS_DE[base]}${detalle}`, valorLeido: NaN };
  }

  const leido = aDecimal(digitos, base);
  if (!Number.isSafeInteger(leido)) {
    return { correcto: false, motivo: 'Ese número es demasiado grande: revisa cuántos dígitos has escrito.', valorLeido: NaN };
  }

  if (leido === esperado.respuesta) {
    return { correcto: true, motivo: '¡Correcto!', valorLeido: leido };
  }

  if (otra !== null) {
    return {
      correcto: false,
      motivo: `Ese es el resultado escrito en ${NOMBRE_BASE[otra]}, pero se pide en ${nombre}.`,
      valorLeido: leido,
    };
  }

  // Cuánto vale lo escrito, para que el alumno vea el desvío. En decimal no aporta nada.
  const cuanto =
    base === 10 ? '' : ` ${conSubindice(digitos.replace(/^0+(?=.)/, ''), base)} vale ${ENTERO_ES.format(leido)} en decimal.`;
  return {
    correcto: false,
    motivo: `No es correcto.${cuanto} Revisa el procedimiento.`,
    valorLeido: leido,
  };
}

/* ─────────────────────────── Los doce casos ─────────────────────────── */

export interface Caso {
  id: number;
  titulo: string;
  enunciado: string;
  categoria: 'abstracto' | 'aplicado';
  datos: DatosCaso;
  /** Rótulo de la casilla: dice en qué sistema se responde. Nunca vacío. */
  etiquetaRespuesta: string;
  /** El VALOR correcto, calculado por el motor desde `datos`. */
  respuesta: number;
  /** Su escritura en la base pedida: `desdeDecimal(respuesta, baseRespuesta)`. */
  respuestaCanonica: string;
  baseRespuesta: Base;
  /** «D7 en hexadecimal (215 en decimal)»: la misma cadena que cierra el paso a paso. */
  respuestaTexto: string;
  pasos: string[];
  pista: string;
  /** Qué teclear en la calculadora para ver la cifra. Generado desde los datos. */
  comoComprobar?: string;
}

/** «Respuesta en binario». */
export function etiquetaDe(base: Base): string {
  return `Respuesta en ${NOMBRE_BASE[base]}`;
}

/**
 * Los datos de cada caso. La respuesta NO se escribe aquí: la calcula `resolverCaso` con el
 * motor de la app, de modo que editar un enunciado sin tocar la solución es imposible.
 *
 * Sin ciudades, países ni monedas: los aplicados son de informática, que es igual en todas
 * partes (colores web, redes, permisos de archivos, ASCII, registros).
 */
const DEFINICIONES: ReadonlyArray<Pick<Caso, 'id' | 'titulo' | 'enunciado' | 'categoria' | 'datos' | 'pista'>> = [
  {
    id: 1,
    titulo: 'Divisiones sucesivas entre 2',
    enunciado:
      'Convierte el número decimal 45 a binario usando divisiones sucesivas entre 2. Escribe el resultado en binario.',
    categoria: 'abstracto',
    datos: { pregunta: 'conversion', valor: '45', baseOrigen: 10, baseRespuesta: 2 },
    pista:
      'Divide 45 entre 2 una y otra vez y apunta cada resto. El binario son los restos leídos de abajo arriba: el último resto es el primer dígito.',
  },
  {
    id: 2,
    titulo: 'Los pesos de cada bit',
    enunciado: '¿Qué número representa el binario 10110110? Escribe el resultado en decimal.',
    categoria: 'abstracto',
    datos: { pregunta: 'conversion', valor: '10110110', baseOrigen: 2, baseRespuesta: 10 },
    pista:
      'De derecha a izquierda, los pesos son 1, 2, 4, 8, 16, 32, 64 y 128. Suma solo los pesos de las posiciones donde hay un 1.',
  },
  {
    id: 3,
    titulo: 'Grupos de cuatro bits',
    enunciado:
      'Convierte el binario 11010111 a hexadecimal agrupando los bits de 4 en 4. Escribe el resultado en hexadecimal.',
    categoria: 'abstracto',
    datos: { pregunta: 'conversion', valor: '11010111', baseOrigen: 2, baseRespuesta: 16 },
    pista:
      'Parte el número en grupos de 4 bits empezando por la derecha y traduce cada grupo a un dígito: 1010 = A, 1011 = B, 1100 = C, 1101 = D, 1110 = E, 1111 = F.',
  },
  {
    id: 4,
    titulo: 'Grupos de tres bits',
    enunciado:
      'Convierte el binario 101110 a octal agrupando los bits de 3 en 3. Escribe el resultado en octal.',
    categoria: 'abstracto',
    datos: { pregunta: 'conversion', valor: '101110', baseOrigen: 2, baseRespuesta: 8 },
    pista: 'Grupos de 3 bits desde la derecha; cada grupo es un dígito del 0 al 7 (pesos 4, 2 y 1).',
  },
  {
    id: 5,
    titulo: 'Letras que son cifras',
    enunciado: '¿Cuánto vale el número hexadecimal B4? Escribe el resultado en decimal.',
    categoria: 'abstracto',
    datos: { pregunta: 'conversion', valor: 'B4', baseOrigen: 16, baseRespuesta: 10 },
    pista: 'B vale 11. El dígito de la izquierda pesa 16 y el de la derecha 1.',
  },
  {
    id: 6,
    titulo: 'Cada dígito, cuatro bits',
    enunciado:
      'Convierte el hexadecimal 2F a binario de 8 bits. Escribe el resultado en binario (se acepta también sin los ceros de la izquierda).',
    categoria: 'abstracto',
    datos: { pregunta: 'conversion', valor: '2F', baseOrigen: 16, baseRespuesta: 2, anchoBinario: 8 },
    pista:
      'Convierte cada dígito hexadecimal por separado en un grupo de exactamente 4 bits (pesos 8, 4, 2 y 1) y junta los grupos. Recuerda que F vale 15.',
  },
  {
    id: 7,
    titulo: 'Sumar llevando',
    enunciado:
      'Suma en binario 01011011 + 00110110, llevando los acarreos columna a columna. Escribe el resultado en binario.',
    categoria: 'abstracto',
    datos: { pregunta: 'operacion', a: '01011011', b: '00110110', baseOperandos: 2, op: 'add', bits: 8, baseRespuesta: 2 },
    pista:
      'Suma de derecha a izquierda. 1 + 1 = 10: escribes 0 y te llevas 1. Con 1 + 1 + 1 escribes 1 y te llevas 1. Puedes comprobarlo pasando los dos números a decimal.',
  },
  {
    id: 8,
    titulo: 'El verde de un color web',
    enunciado:
      'En una página web, un color naranja se escribe #FF8000. ¿Cuánto verde tiene, en una escala de 0 a 255? Escribe el resultado en decimal.',
    categoria: 'aplicado',
    datos: { pregunta: 'color', color: 'FF8000', canal: 'verde', baseRespuesta: 10 },
    pista:
      'El código #RRGGBB se lee por parejas: rojo, verde y azul. El verde son los dos dígitos del centro, y 80 en hexadecimal no es ochenta.',
  },
  {
    id: 9,
    titulo: 'La máscara de red',
    enunciado:
      'Para saber a qué red pertenece un equipo, se hace la operación AND bit a bit entre su dirección IPv4 y la máscara de red. En el último número, la dirección tiene 200 y la máscara 240. ¿Qué número queda? Escribe el resultado en decimal.',
    categoria: 'aplicado',
    datos: { pregunta: 'operacion', a: '200', b: '240', baseOperandos: 10, op: 'and', bits: 8, baseRespuesta: 10 },
    pista:
      'Escribe los dos números en binario de 8 bits, uno encima del otro. AND da 1 solo en las columnas donde los dos tienen un 1; después vuelve a decimal.',
  },
  {
    id: 10,
    titulo: 'Permisos de un archivo',
    enunciado:
      'En un sistema tipo Unix, un archivo tiene los permisos rwxr-x--- (propietario: leer, escribir y ejecutar; grupo: leer y ejecutar; otros: nada). ¿Qué número de tres cifras se usa para darle esos permisos? Escribe el resultado en octal.',
    categoria: 'aplicado',
    datos: { pregunta: 'permisos', permisos: 'rwxr-x---', baseRespuesta: 8 },
    pista:
      'Cada letra presente es un 1 y cada guion un 0. Parte los 9 bits en tres grupos de 3 (propietario, grupo, otros) y pasa cada grupo a una cifra: r vale 4, w vale 2 y x vale 1.',
  },
  {
    id: 11,
    titulo: 'El código de una letra',
    enunciado:
      'En el código ASCII la letra A mayúscula es el 65, y las demás mayúsculas van seguidas en orden alfabético (B = 66, C = 67…). ¿Cuál es el código de la letra K? Escribe el resultado en hexadecimal.',
    categoria: 'aplicado',
    datos: { pregunta: 'ascii', letra: 'K', baseRespuesta: 16 },
    pista:
      'Cuenta cuántas letras hay de la A a la K para saber su código en decimal, y luego pásalo a hexadecimal (a binario y en grupos de 4, o dividiendo entre 16).',
  },
  {
    id: 12,
    titulo: 'Desplazar para duplicar',
    enunciado:
      'Un programa guarda la puntuación 53 en un registro de 8 bits y desplaza sus bits una posición a la izquierda (53 << 1). ¿Qué número queda en el registro? Escribe el resultado en decimal.',
    categoria: 'aplicado',
    datos: { pregunta: 'operacion', a: '53', b: '1', baseOperandos: 10, op: 'shl', bits: 8, baseRespuesta: 10 },
    pista:
      'Escribe 53 en binario de 8 bits, mueve todos los bits un lugar a la izquierda metiendo un 0 por la derecha y vuelve a decimal. ¿Qué operación aritmética ha hecho el desplazamiento?',
  },
];

/** Los doce casos, con su respuesta CALCULADA por el motor y no escrita a mano. */
export const CASOS: readonly Caso[] = DEFINICIONES.map((def) => {
  const r = resolverCaso(def.datos);
  const base = def.datos.baseRespuesta;
  const valor = r.ok ? r.valor : NaN;
  const como = comoComprobarDe(def.datos);
  return {
    ...def,
    etiquetaRespuesta: etiquetaDe(base),
    respuesta: valor,
    respuestaCanonica: r.ok ? desdeDecimal(valor, base) : '',
    baseRespuesta: base,
    respuestaTexto: textoRespuesta(valor, base, def.datos.anchoBinario),
    pasos: r.pasos,
    ...(como ? { comoComprobar: como } : {}),
  };
});

export const TOTAL_CASOS = CASOS.length;

/* ─────────────────────────── Modo práctica (aleatorio) ─────────────────────────── */

/**
 * Generador reproducible: la misma semilla da siempre el mismo ejercicio.
 *
 * ⚠️ La semilla se MEZCLA antes de usarse (splitmix32). Sembrando xorshift32 directamente con
 * enteros pequeños, los primeros valores salen diminutos y parecidos, y `Math.floor(rnd()*n)`
 * devuelve el índice 0 una y otra vez: el «aleatorio» acaba dando SIEMPRE el mismo ejercicio
 * y aun así pasa la prueba de reproducibilidad, porque reproducible no es variado.
 */
function aleatorioCon(semilla: number): () => number {
  let estado = (semilla >>> 0) || 1;
  return () => {
    estado = (estado + 0x9e3779b9) >>> 0;
    let z = estado;
    z = Math.imul(z ^ (z >>> 16), 0x21f0aaad) >>> 0;
    z = Math.imul(z ^ (z >>> 15), 0x735a2d97) >>> 0;
    z = (z ^ (z >>> 15)) >>> 0;
    return z / 0x100000000;
  };
}

export interface Ejercicio {
  semilla: number;
  enunciado: string;
  datos: DatosCaso;
  respuesta: number;
  respuestaCanonica: string;
  baseRespuesta: Base;
  respuestaTexto: string;
  etiquetaRespuesta: string;
  pasos: string[];
  comoComprobar?: string;
}

function elegir<T>(lista: readonly T[], rnd: () => number): T {
  return lista[Math.min(lista.length - 1, Math.floor(rnd() * lista.length))];
}

/** Entero entre `min` y `max`, ambos incluidos. */
function entre(min: number, max: number, rnd: () => number): number {
  return min + Math.min(max - min, Math.floor(rnd() * (max - min + 1)));
}

/** Seis de cada diez, conversiones; el resto, suma, AND y desplazamiento. */
const TIPOS_PRACTICA = [
  'conversion',
  'conversion',
  'conversion',
  'conversion',
  'conversion',
  'conversion',
  'suma',
  'suma',
  'and',
  'desplazamiento',
] as const;

/**
 * Ejercicio aleatorio: conversiones entre las cuatro bases (números del 5 al 255), sumas
 * binarias, AND y desplazamientos en 8 bits. Usa EL MISMO `resolverCaso` que los doce fijos, y
 * por tanto el mismo motor que los paneles: si divergieran, el alumno entrenaría con una regla
 * y sería corregido con otra.
 */
export function generarEjercicioAleatorio(semilla = Date.now()): Ejercicio {
  const rnd = aleatorioCon(semilla);
  const tipo = elegir(TIPOS_PRACTICA, rnd);

  let datos: DatosCaso;
  let enunciado: string;

  if (tipo === 'conversion') {
    const origen = elegir(BASES_TODAS, rnd);
    const destino = elegir(
      BASES_TODAS.filter((b) => b !== origen),
      rnd,
    );
    const n = entre(5, 255, rnd);
    const valor = desdeDecimal(n, origen);
    datos = { pregunta: 'conversion', valor, baseOrigen: origen, baseRespuesta: destino };
    enunciado = `Convierte ${conSubindice(valor, origen)} (en ${NOMBRE_BASE[origen]}) a ${NOMBRE_BASE[destino]}. Escribe el resultado en ${NOMBRE_BASE[destino]}.`;
  } else if (tipo === 'suma') {
    // La suma cabe en 8 bits: el ejercicio es sumar llevando, no el desbordamiento.
    const a = entre(5, 250, rnd);
    const b = entre(5, 255 - a, rnd);
    const A = binarioDeAncho(a, 8);
    const B = binarioDeAncho(b, 8);
    datos = { pregunta: 'operacion', a: A, b: B, baseOperandos: 2, op: 'add', bits: 8, baseRespuesta: 2, anchoBinario: 8 };
    enunciado = `Suma en binario ${A} + ${B}, llevando los acarreos. Escribe el resultado en binario.`;
  } else if (tipo === 'and') {
    const a = entre(5, 255, rnd);
    const b = entre(5, 255, rnd);
    const A = binarioDeAncho(a, 8);
    const B = binarioDeAncho(b, 8);
    datos = { pregunta: 'operacion', a: A, b: B, baseOperandos: 2, op: 'and', bits: 8, baseRespuesta: 2, anchoBinario: 8 };
    enunciado = `Calcula ${A} AND ${B}, bit a bit en 8 bits. Escribe el resultado en binario (se acepta también sin los ceros de la izquierda).`;
  } else {
    // Sin que se salga ningún 1 del registro: el valor cabe en 7 bits.
    const a = entre(5, 127, rnd);
    datos = { pregunta: 'operacion', a: String(a), b: '1', baseOperandos: 10, op: 'shl', bits: 8, baseRespuesta: 10 };
    enunciado = `En un registro de 8 bits está el número ${a}. Desplaza sus bits una posición a la izquierda (${a} << 1). ¿Qué número queda? Escribe el resultado en decimal.`;
  }

  const r = resolverCaso(datos);
  const base = datos.baseRespuesta;
  const respuesta = r.ok ? r.valor : NaN;
  const como = comoComprobarDe(datos);
  return {
    semilla,
    enunciado,
    datos,
    respuesta,
    respuestaCanonica: r.ok ? desdeDecimal(respuesta, base) : '',
    baseRespuesta: base,
    respuestaTexto: textoRespuesta(respuesta, base, datos.anchoBinario),
    etiquetaRespuesta: etiquetaDe(base),
    pasos: r.pasos,
    ...(como ? { comoComprobar: como } : {}),
  };
}
