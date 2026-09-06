/**
 * Motor del simulador de progresiones aritméticas y geométricas.
 *
 * Vive fuera de page.tsx a propósito. El build compila la vista sin mirar si la
 * aritmética está bien: una lista de términos con la razón mal aplicada se renderiza
 * igual de limpia que una correcta, y el error solo se ve leyendo los números en
 * pantalla. Aquí no hay React, ni DOM, ni estado: solo funciones puras con entradas y
 * salidas comprobables a mano (1+2+…+100 = 5050, 2·3⁷ = 4374, 5·(2¹⁰−1) = 5115), que es
 * como se verifican.
 *
 * CONVENIO DE ERRORES: ninguna función lanza. Las que devuelven un número devuelven NaN
 * cuando el dato no tiene sentido; las que devuelven un objeto traen `ok: false` y un
 * `error` redactado. Un throw durante el render tumba la página entera, y aquí el dato
 * lo teclea quien usa la app.
 *
 * Cuatro decisiones que no son evidentes leyendo el código:
 *
 * 1. `sumaGeometrica` trata r = 1 en una rama propia. No es una guarda defensiva: la
 *    fórmula habitual Sₙ = a₁·(rⁿ − 1)/(r − 1) divide entre r − 1, que con r = 1 es cero.
 *    Devolvería NaN o Infinity justo en el caso más fácil de todos —todos los términos
 *    iguales, suma n·a₁—, y es un error clásico de examen que conviene explicar, no tapar.
 *
 * 2. `sumaInfinitaGeometrica` devuelve NaN cuando |r| ≥ 1 en vez de un número enorme.
 *    Sumar infinitos términos que no tienden a cero no da «mucho»: no da nada, la serie
 *    diverge. Mostrar una cifra ahí enseñaría lo contrario de lo que hay que enseñar.
 *
 * 3. `identificarProgresion` rechaza la razón geométrica en cuanto hay un término nulo.
 *    No se puede dividir entre cero, y además una progresión geométrica no admite
 *    términos nulos: si uno lo fuera, la razón sería 0 y todos los siguientes también.
 *    La tolerancia del resto es RELATIVA a la escala de la sucesión, para que 0,1 · k y
 *    1.000.000 · k reciban el mismo veredicto pese a que su ruido de punto flotante no
 *    tiene el mismo tamaño.
 *
 * 4. Los 12 casos se CALCULAN a partir de sus datos, no se teclean. Un caso con la
 *    solución escrita a mano puede contradecir a la fórmula sin que nada se queje, y es
 *    exactamente el fallo que rompería la utilidad del modo Casos: un profesor manda
 *    «resuelve el 3, el 7 y el 11» y la corrección tiene que ser la misma para todos.
 */

import { formatNumber, parseSpanishNumber } from '@/lib';

// ============================================================
// TIPOS
// ============================================================

/** Las dos familias que reconoce la app, más el veredicto negativo. */
export type TipoProgresion = 'aritmetica' | 'geometrica' | 'ninguna';

/** Qué se está calculando. Cada valor tiene su fórmula y sus pasos redactados. */
export type TipoCalculo =
  | 'termino-aritmetico'
  | 'suma-aritmetica'
  | 'termino-geometrico'
  | 'suma-geometrica'
  | 'suma-infinita';

/** Resultado de un cálculo, con el razonamiento ya redactado. */
export interface SolucionProgresion {
  ok: boolean;
  valor: number;
  pasos: string[];
  error: string | null;
}

/** Lo que devuelve el modo Identificar. `d` y `r` solo existen si aplica. */
export interface ResultadoIdentificacion {
  ok: boolean;
  error: string | null;
  tipo: TipoProgresion;
  d?: number;
  r?: number;
  /** Las n − 1 diferencias aₖ₊₁ − aₖ, siempre calculadas. */
  diferencias: number[];
  /** Los n − 1 cocientes aₖ₊₁ / aₖ. Vacío si algún término es 0. */
  cocientes: number[];
  /** Los tres términos siguientes, solo si la sucesión quedó identificada. */
  siguientes: number[];
  /** Término general escrito, o cadena vacía si no es ninguna de las dos. */
  terminoGeneral: string;
  pasos: string[];
}

/** Resultado de partir por separadores lo que ha escrito quien usa la app. */
export interface ListaNumerica {
  ok: boolean;
  numeros: number[];
  separador: 'punto-y-coma' | 'coma' | 'espacio';
  error: string | null;
}

/** Un caso numerado del modo Casos, con su solución ya calculada. */
export interface CasoProgresion {
  id: number;
  titulo: string;
  enunciado: string;
  categoria: 'abstracto' | 'aplicado';
  /** Qué calcula el caso. `identificar` no usa a1/parametro/n, sino `sucesion`. */
  calculo: TipoCalculo | 'identificar';
  a1: number;
  /** La diferencia d en las aritméticas, la razón r en las geométricas. */
  parametro: number;
  n: number;
  /** Solo en los casos de tipo `identificar`. */
  sucesion: readonly number[];
  /** Qué se escribe en la casilla: «€», «butacas», «a₂₀»… Nunca vacío. */
  etiquetaRespuesta: string;
  respuesta: number;
  respuestaTexto: string;
  requiereRedondeo: boolean;
  pasos: string[];
  pista: string;
}

/** Ejercicio generado al vuelo, con la misma forma que un caso pero sin número fijo. */
export interface EjercicioAleatorio {
  semilla: number;
  enunciado: string;
  calculo: TipoCalculo;
  a1: number;
  parametro: number;
  n: number;
  etiquetaRespuesta: string;
  respuesta: number;
  respuestaTexto: string;
  requiereRedondeo: boolean;
  pasos: string[];
}

/** Veredicto de comprobar la respuesta que ha tecleado quien usa la app. */
export interface Comprobacion {
  correcto: boolean;
  motivo: 'acertado' | 'fallado' | 'no-numerico';
  diferencia: number;
  tolerancia: number;
}

// ============================================================
// LÍMITES
// ============================================================

/**
 * Tope del índice n. Con una razón mayor que 1, r^(n−1) desborda el double mucho antes
 * de llegar aquí y el motor devuelve NaN; el tope existe para que una aritmética no
 * genere una lista absurda y para que el mensaje de error sea explicable.
 */
export const N_MAXIMO = 500;

/** Cuántos términos se pintan en las listas y en la gráfica. */
export const TERMINOS_VISIBLES = 12;

/** Cuántos números como mucho admite el modo Identificar. */
export const MAX_NUMEROS_IDENTIFICAR = 30;

// ============================================================
// AUXILIARES DE FORMATO Y REDONDEO
// ============================================================

/** Redondea a `decimales` para no arrastrar el ruido binario del punto flotante. */
export function redondear(valor: number, decimales: number): number {
  if (!Number.isFinite(valor)) return NaN;
  const factor = 10 ** decimales;
  return Math.round(valor * factor) / factor;
}

/**
 * A partir de aquí un número se escribe en notación científica.
 *
 * Una geométrica de razón 3 en el término 500 vale del orden de 10²³⁸: es un número
 * perfectamente finito, así que ninguna guarda de `Number.isFinite` lo detiene, pero
 * escrito con todas sus cifras son 240 dígitos seguidos que rompen la maquetación y no
 * informan de nada. El orden de magnitud sí informa.
 */
const UMBRAL_CIENTIFICA = 1e15;

/**
 * Formatea con los decimales que el número necesita de verdad, hasta un máximo.
 * Así 137 se escribe «137» y no «137,0000», pero 1.628,8946 conserva su precisión.
 * Por encima de 10¹⁵ pasa a notación científica.
 */
export function formatearFlexible(valor: number, maxDecimales = 4): string {
  if (!Number.isFinite(valor)) return 'no definido';
  if (Math.abs(valor) >= UMBRAL_CIENTIFICA) {
    const exponente = Math.floor(Math.log10(Math.abs(valor)));
    const mantisa = valor / 10 ** exponente;
    return `${formatNumber(mantisa, 2)} · 10${superindice(exponente)}`;
  }
  for (let d = 0; d < maxDecimales; d++) {
    if (Math.abs(valor - redondear(valor, d)) < 1e-9) return formatNumber(valor, d);
  }
  return formatNumber(valor, maxDecimales);
}

const DIGITOS_SUPERINDICE = ['⁰', '¹', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹'];

/** Convierte 239 en «²³⁹», para escribir 10²³⁹ sin recurrir a la notación con acento. */
export function superindice(n: number): string {
  if (!Number.isFinite(n)) return '';
  const signo = n < 0 ? '⁻' : '';
  return (
    signo +
    String(Math.trunc(Math.abs(n)))
      .split('')
      .map((cifra) => DIGITOS_SUPERINDICE[Number(cifra)] ?? cifra)
      .join('')
  );
}

const DIGITOS_SUBINDICE = ['₀', '₁', '₂', '₃', '₄', '₅', '₆', '₇', '₈', '₉'];

/** Convierte 20 en «₂₀», para escribir a₂₀ y S₃₀ como se escriben en el cuaderno. */
export function subindice(n: number): string {
  if (!Number.isFinite(n)) return '';
  return String(Math.trunc(Math.abs(n)))
    .split('')
    .map((cifra) => DIGITOS_SUBINDICE[Number(cifra)] ?? cifra)
    .join('');
}

/** Envuelve entre paréntesis los negativos, para que «+ (−6)» no salga «+ −6». */
function conSigno(valor: number): string {
  const texto = formatearFlexible(valor);
  return valor < 0 ? `(${texto})` : texto;
}

// ============================================================
// PROGRESIÓN ARITMÉTICA
// ============================================================

/** ¿Es n un índice válido de término? Entero entre 1 y N_MAXIMO. */
function indiceValido(n: number): boolean {
  return Number.isInteger(n) && n >= 1 && n <= N_MAXIMO;
}

/**
 * Término n de una progresión aritmética: aₙ = a₁ + (n − 1)·d.
 * Devuelve NaN si algún dato no es un número o si n no es un índice válido.
 */
export function terminoAritmetico(a1: number, d: number, n: number): number {
  if (!Number.isFinite(a1) || !Number.isFinite(d) || !indiceValido(n)) return NaN;
  const valor = a1 + (n - 1) * d;
  return Number.isFinite(valor) ? valor : NaN;
}

/**
 * Suma de los n primeros términos de una aritmética: Sₙ = n·(a₁ + aₙ)/2.
 * Es la fórmula de Gauss: emparejando primero con último, todas las parejas suman igual.
 */
export function sumaAritmetica(a1: number, d: number, n: number): number {
  if (!Number.isFinite(a1) || !Number.isFinite(d) || !indiceValido(n)) return NaN;
  const an = a1 + (n - 1) * d;
  const valor = (n * (a1 + an)) / 2;
  return Number.isFinite(valor) ? valor : NaN;
}

/** Los `cantidad` primeros términos de una aritmética, para listarlos o dibujarlos. */
export function terminosAritmeticos(a1: number, d: number, cantidad: number): number[] {
  if (!Number.isFinite(a1) || !Number.isFinite(d)) return [];
  const total = Math.max(0, Math.min(Math.trunc(cantidad), N_MAXIMO));
  const salida: number[] = [];
  for (let n = 1; n <= total; n++) salida.push(a1 + (n - 1) * d);
  return salida;
}

/**
 * Término general escrito con los números puestos, en sus dos formas:
 * la de la definición, aₙ = a₁ + (n − 1)·d, y la simplificada, aₙ = d·n + (a₁ − d).
 */
export function terminoGeneralAritmetico(a1: number, d: number): { definicion: string; simplificado: string } {
  if (!Number.isFinite(a1) || !Number.isFinite(d)) {
    return { definicion: 'aₙ = a₁ + (n − 1)·d', simplificado: '' };
  }
  const independiente = a1 - d;
  const signo = independiente < 0 ? '−' : '+';
  const simplificado =
    independiente === 0
      ? `aₙ = ${formatearFlexible(d)}n`
      : `aₙ = ${formatearFlexible(d)}n ${signo} ${formatearFlexible(Math.abs(independiente))}`;
  return {
    definicion: `aₙ = ${formatearFlexible(a1)} + (n − 1)·${conSigno(d)}`,
    simplificado,
  };
}

// ============================================================
// PROGRESIÓN GEOMÉTRICA
// ============================================================

/**
 * Término n de una progresión geométrica: aₙ = a₁·r^(n−1).
 *
 * El exponente es n − 1 y no n: del término 1 al término n se multiplica por r solo
 * n − 1 veces. Devuelve NaN si el resultado desborda el double, porque «Infinity» en
 * pantalla no le dice nada a nadie. Con el tope de N_MAXIMO y las razones del deslizador
 * eso no llega a ocurrir (3⁴⁹⁹ es enorme pero finito); la guarda protege a quien llame a
 * esta función desde fuera con una razón mayor.
 */
export function terminoGeometrico(a1: number, r: number, n: number): number {
  if (!Number.isFinite(a1) || !Number.isFinite(r) || !indiceValido(n)) return NaN;
  const valor = a1 * Math.pow(r, n - 1);
  return Number.isFinite(valor) ? valor : NaN;
}

/**
 * Suma de los n primeros términos de una geométrica: Sₙ = a₁·(rⁿ − 1)/(r − 1).
 *
 * Con r = 1 esa fórmula divide entre cero, así que ese caso va aparte: si la razón es 1
 * todos los términos valen a₁ y la suma es n·a₁. Ver el punto 1 de la cabecera.
 */
export function sumaGeometrica(a1: number, r: number, n: number): number {
  if (!Number.isFinite(a1) || !Number.isFinite(r) || !indiceValido(n)) return NaN;
  if (razonEsUno(r)) return a1 * n;
  const potencia = Math.pow(r, n);
  if (!Number.isFinite(potencia)) return NaN;
  const valor = (a1 * (potencia - 1)) / (r - 1);
  return Number.isFinite(valor) ? valor : NaN;
}

/**
 * ¿La razón vale 1? Se compara con una holgura mínima porque un slider o un parseo
 * pueden dejar 0,9999999999999999 donde el usuario quería 1, y esa diferencia
 * invisible haría dividir entre 1e-16 y devolver una suma disparatada.
 */
export function razonEsUno(r: number): boolean {
  return Number.isFinite(r) && Math.abs(r - 1) < 1e-12;
}

/** ¿Converge la serie geométrica de razón r? Solo si |r| < 1. */
export function convergeSerieGeometrica(r: number): boolean {
  return Number.isFinite(r) && Math.abs(r) < 1;
}

/**
 * Suma de los INFINITOS términos de una geométrica: S = a₁/(1 − r).
 *
 * Solo está definida cuando |r| < 1. Con |r| ≥ 1 devuelve NaN: la serie diverge y no
 * hay ningún número que sea su suma (ver el punto 2 de la cabecera).
 */
export function sumaInfinitaGeometrica(a1: number, r: number): number {
  if (!Number.isFinite(a1) || !convergeSerieGeometrica(r)) return NaN;
  const valor = a1 / (1 - r);
  return Number.isFinite(valor) ? valor : NaN;
}

/** Los `cantidad` primeros términos de una geométrica. Corta si algún valor desborda. */
export function terminosGeometricos(a1: number, r: number, cantidad: number): number[] {
  if (!Number.isFinite(a1) || !Number.isFinite(r)) return [];
  const total = Math.max(0, Math.min(Math.trunc(cantidad), N_MAXIMO));
  const salida: number[] = [];
  for (let n = 1; n <= total; n++) {
    const valor = a1 * Math.pow(r, n - 1);
    if (!Number.isFinite(valor)) break;
    salida.push(valor);
  }
  return salida;
}

/** Término general de una geométrica con los números puestos: aₙ = 2·3^(n−1). */
export function terminoGeneralGeometrico(a1: number, r: number): string {
  if (!Number.isFinite(a1) || !Number.isFinite(r)) return 'aₙ = a₁·r^(n−1)';
  return `aₙ = ${formatearFlexible(a1)} · ${conSigno(r)}^(n−1)`;
}

// ============================================================
// RESOLUCIÓN CON PASOS ESCRITOS
// ============================================================

const VACIO: SolucionProgresion = { ok: false, valor: NaN, pasos: [], error: null };

function errorDeDatos(mensaje: string): SolucionProgresion {
  return { ...VACIO, error: mensaje };
}

/**
 * Resuelve uno de los cinco cálculos y devuelve TAMBIÉN el razonamiento, paso a paso.
 *
 * `parametro` es la diferencia d en las aritméticas y la razón r en las geométricas.
 * En `suma-infinita` el índice n no se usa.
 */
export function resolverProgresion(
  tipo: TipoCalculo,
  a1: number,
  parametro: number,
  n: number,
): SolucionProgresion {
  if (!Number.isFinite(a1) || !Number.isFinite(parametro)) {
    return errorDeDatos(
      'Escribe el primer término y la diferencia o razón como números (por ejemplo 4 y 7).',
    );
  }

  if (tipo === 'suma-infinita') {
    return resolverSumaInfinita(a1, parametro);
  }

  if (!indiceValido(n)) {
    return errorDeDatos(
      `El número de término tiene que ser un entero entre 1 y ${formatNumber(N_MAXIMO, 0)}. El término 0 no existe: la numeración empieza en a₁.`,
    );
  }

  switch (tipo) {
    case 'termino-aritmetico':
      return resolverTerminoAritmetico(a1, parametro, n);
    case 'suma-aritmetica':
      return resolverSumaAritmetica(a1, parametro, n);
    case 'termino-geometrico':
      return resolverTerminoGeometrico(a1, parametro, n);
    case 'suma-geometrica':
      return resolverSumaGeometrica(a1, parametro, n);
    default:
      return errorDeDatos('Tipo de cálculo desconocido.');
  }
}

function resolverTerminoAritmetico(a1: number, d: number, n: number): SolucionProgresion {
  const an = terminoAritmetico(a1, d, n);
  if (!Number.isFinite(an)) return errorDeDatos(MENSAJE_DESBORDE);
  const sub = subindice(n);
  return {
    ok: true,
    valor: an,
    error: null,
    pasos: [
      'El término general de una progresión aritmética es aₙ = a₁ + (n − 1)·d. El (n − 1) es la clave: para llegar al término n se dan n − 1 saltos, no n.',
      `Sustituimos a₁ = ${formatearFlexible(a1)}, d = ${formatearFlexible(d)} y n = ${formatNumber(n, 0)}: a${sub} = ${formatearFlexible(a1)} + (${formatNumber(n, 0)} − 1)·${conSigno(d)}`,
      `Resolvemos el paréntesis: a${sub} = ${formatearFlexible(a1)} + ${formatNumber(n - 1, 0)}·${conSigno(d)} = ${formatearFlexible(a1)} + ${conSigno((n - 1) * d)}`,
      `Resultado: a${sub} = ${formatearFlexible(an)}`,
    ],
  };
}

function resolverSumaAritmetica(a1: number, d: number, n: number): SolucionProgresion {
  const an = terminoAritmetico(a1, d, n);
  const suma = sumaAritmetica(a1, d, n);
  if (!Number.isFinite(an) || !Number.isFinite(suma)) return errorDeDatos(MENSAJE_DESBORDE);
  const sub = subindice(n);
  return {
    ok: true,
    valor: suma,
    error: null,
    pasos: [
      'La suma de los n primeros términos de una aritmética es Sₙ = n·(a₁ + aₙ)/2. Sale de emparejar el primero con el último, el segundo con el penúltimo y así: todas las parejas suman lo mismo.',
      `Antes hace falta el último término: a${sub} = ${formatearFlexible(a1)} + (${formatNumber(n, 0)} − 1)·${conSigno(d)} = ${formatearFlexible(an)}`,
      `Sustituimos en la fórmula: S${sub} = ${formatNumber(n, 0)}·(${formatearFlexible(a1)} + ${conSigno(an)})/2`,
      `Sumamos dentro del paréntesis: S${sub} = ${formatNumber(n, 0)}·${conSigno(a1 + an)}/2 = ${formatearFlexible(n * (a1 + an))}/2`,
      `Resultado: S${sub} = ${formatearFlexible(suma)}`,
    ],
  };
}

function resolverTerminoGeometrico(a1: number, r: number, n: number): SolucionProgresion {
  const an = terminoGeometrico(a1, r, n);
  if (!Number.isFinite(an)) return errorDeDatos(MENSAJE_DESBORDE);
  const sub = subindice(n);
  const potencia = Math.pow(r, n - 1);
  const pasos = [
    'El término general de una progresión geométrica es aₙ = a₁·r^(n−1). El exponente es n − 1, no n: del término 1 al término n se multiplica por la razón n − 1 veces.',
    `Sustituimos a₁ = ${formatearFlexible(a1)}, r = ${formatearFlexible(r)} y n = ${formatNumber(n, 0)}: a${sub} = ${formatearFlexible(a1)} · ${conSigno(r)}^${formatNumber(n - 1, 0)}`,
    `Calculamos la potencia: ${conSigno(r)}^${formatNumber(n - 1, 0)} = ${formatearFlexible(potencia)}`,
    `Multiplicamos: a${sub} = ${formatearFlexible(a1)} · ${formatearFlexible(potencia)} = ${formatearFlexible(an)}`,
  ];
  if (r < 0) {
    pasos.push(
      'Como la razón es negativa, el signo va alternando: los términos de posición impar conservan el signo de a₁ y los de posición par lo cambian.',
    );
  }
  return { ok: true, valor: an, error: null, pasos };
}

function resolverSumaGeometrica(a1: number, r: number, n: number): SolucionProgresion {
  const suma = sumaGeometrica(a1, r, n);
  if (!Number.isFinite(suma)) return errorDeDatos(MENSAJE_DESBORDE);
  const sub = subindice(n);

  if (razonEsUno(r)) {
    return {
      ok: true,
      valor: suma,
      error: null,
      pasos: [
        'Con razón 1 todos los términos valen lo mismo que a₁: la progresión ni crece ni decrece.',
        'La fórmula habitual Sₙ = a₁·(rⁿ − 1)/(r − 1) NO sirve aquí, porque su denominador r − 1 valdría 0 y no se puede dividir entre cero.',
        `Sumar n términos iguales es multiplicar: S${sub} = n·a₁ = ${formatNumber(n, 0)}·${formatearFlexible(a1)}`,
        `Resultado: S${sub} = ${formatearFlexible(suma)}`,
      ],
    };
  }

  const potencia = Math.pow(r, n);
  return {
    ok: true,
    valor: suma,
    error: null,
    pasos: [
      'La suma de los n primeros términos de una geométrica es Sₙ = a₁·(rⁿ − 1)/(r − 1), válida siempre que r ≠ 1.',
      `Sustituimos: S${sub} = ${formatearFlexible(a1)}·(${conSigno(r)}^${formatNumber(n, 0)} − 1)/(${conSigno(r)} − 1)`,
      `Calculamos la potencia: ${conSigno(r)}^${formatNumber(n, 0)} = ${formatearFlexible(potencia)}`,
      `Numerador: ${formatearFlexible(a1)}·(${formatearFlexible(potencia)} − 1) = ${formatearFlexible(a1 * (potencia - 1))}`,
      `Denominador: ${conSigno(r)} − 1 = ${formatearFlexible(r - 1)}`,
      `Resultado: S${sub} = ${formatearFlexible(suma)}`,
    ],
  };
}

function resolverSumaInfinita(a1: number, r: number): SolucionProgresion {
  if (!convergeSerieGeometrica(r)) {
    return {
      ok: false,
      valor: NaN,
      error:
        'La serie DIVERGE: con |r| ≥ 1 los términos no se hacen pequeños, así que sumar infinitos de ellos no da ningún número. La suma infinita solo existe cuando |r| < 1.',
      pasos: [
        `El valor absoluto de la razón es |${formatearFlexible(r)}| = ${formatearFlexible(Math.abs(r))}, que no es menor que 1.`,
        'Eso significa que cada término es igual o mayor en tamaño que el anterior, así que los términos NO tienden a cero.',
        'Al sumar infinitos términos que no tienden a cero, el total crece sin límite (o va saltando de signo sin acercarse a nada): la serie diverge y no tiene suma.',
      ],
    };
  }
  const suma = sumaInfinitaGeometrica(a1, r);
  if (!Number.isFinite(suma)) return errorDeDatos(MENSAJE_DESBORDE);
  return {
    ok: true,
    valor: suma,
    error: null,
    pasos: [
      `Como |r| = ${formatearFlexible(Math.abs(r))} es menor que 1, cada término es una fracción del anterior y los términos se van acercando a cero.`,
      'Al crecer n, rⁿ tiende a 0, así que Sₙ = a₁·(1 − rⁿ)/(1 − r) se acerca cada vez más a S = a₁/(1 − r).',
      `Sustituimos: S = ${formatearFlexible(a1)}/(1 − ${conSigno(r)}) = ${formatearFlexible(a1)}/${formatearFlexible(1 - r)}`,
      `Resultado: S = ${formatearFlexible(suma)}. Por muchos términos que se sumen nunca se pasa de ahí, solo se le acerca.`,
    ],
  };
}

const MENSAJE_DESBORDE =
  'El resultado es tan grande que se sale de lo que un ordenador puede representar. Baja el número de término o acerca la razón a 1.';

// ============================================================
// IDENTIFICAR UNA SUCESIÓN
// ============================================================

/** Holgura relativa con la que se comparan diferencias y cocientes. */
const TOLERANCIA_RELATIVA = 1e-9;

function todosIguales(valores: number[], escala: number): boolean {
  if (valores.length === 0) return false;
  const referencia = valores[0];
  return valores.every((v) => Math.abs(v - referencia) <= escala * TOLERANCIA_RELATIVA);
}

/**
 * Dice si una sucesión es aritmética, geométrica o ninguna de las dos, con el
 * razonamiento: qué diferencias y qué cocientes se han calculado.
 *
 * Acepta sin protestar sucesiones que no son ni una cosa ni otra (cuadrados, Fibonacci)
 * y lo dice, en vez de inventarse un patrón. Ver el punto 3 de la cabecera para la
 * protección frente a términos nulos.
 */
export function identificarProgresion(numeros: number[]): ResultadoIdentificacion {
  const base: ResultadoIdentificacion = {
    ok: false,
    error: null,
    tipo: 'ninguna',
    diferencias: [],
    cocientes: [],
    siguientes: [],
    terminoGeneral: '',
    pasos: [],
  };

  if (!Array.isArray(numeros) || numeros.some((v) => !Number.isFinite(v))) {
    return { ...base, error: 'Alguno de los valores no es un número. Revisa lo que has escrito.' };
  }
  if (numeros.length < 3) {
    return {
      ...base,
      error:
        'Escribe al menos TRES números. Con solo dos, cualquier pareja es a la vez aritmética y geométrica, así que no hay nada que decidir.',
    };
  }
  if (numeros.length > MAX_NUMEROS_IDENTIFICAR) {
    return {
      ...base,
      error: `Con ${formatNumber(MAX_NUMEROS_IDENTIFICAR, 0)} números basta y sobra para decidirlo. Quita algunos.`,
    };
  }

  const escala = Math.max(1, ...numeros.map((v) => Math.abs(v)));

  const diferencias: number[] = [];
  for (let i = 0; i < numeros.length - 1; i++) diferencias.push(numeros[i + 1] - numeros[i]);

  const hayCero = numeros.some((v) => v === 0);
  const cocientes: number[] = [];
  if (!hayCero) {
    for (let i = 0; i < numeros.length - 1; i++) cocientes.push(numeros[i + 1] / numeros[i]);
  }

  const esAritmetica = todosIguales(diferencias, escala);
  const escalaCociente = cocientes.length > 0 ? Math.max(1, Math.abs(cocientes[0])) : 1;
  const esGeometrica = cocientes.length > 0 && todosIguales(cocientes, escalaCociente);

  const listaDiferencias = diferencias.map((v) => formatearFlexible(v)).join(', ');
  const pasos: string[] = [
    `Sucesión analizada: ${numeros.map((v) => formatearFlexible(v)).join(', ')}`,
    `Diferencias entre términos consecutivos (aₖ₊₁ − aₖ): ${listaDiferencias}`,
  ];

  if (hayCero) {
    pasos.push(
      'No se calculan cocientes: uno de los términos es 0 y no se puede dividir entre cero. Además, una progresión geométrica no admite términos nulos, porque su razón sería 0 y a partir de ahí todos los términos lo serían.',
    );
  } else {
    pasos.push(
      `Cocientes entre términos consecutivos (aₖ₊₁ / aₖ): ${cocientes.map((v) => formatearFlexible(v)).join(', ')}`,
    );
  }

  // Una sucesión constante cumple las dos definiciones a la vez (d = 0 y r = 1). Se
  // resuelve a favor de la aritmética, que es la lectura habitual, y se dice en voz alta.
  if (esAritmetica) {
    const d = redondear(diferencias[0], 10);
    const general = terminoGeneralAritmetico(numeros[0], d);
    pasos.push(
      `Todas las diferencias valen lo mismo, ${formatearFlexible(d)}, así que la sucesión es ARITMÉTICA con d = ${formatearFlexible(d)}.`,
    );
    if (esGeometrica) {
      pasos.push(
        'Ojo: todos los términos son iguales, así que también cumple la definición de geométrica con razón 1. Es el único caso en que una sucesión es de los dos tipos a la vez.',
      );
    }
    pasos.push(`Término general: ${general.definicion}, que simplificado queda ${general.simplificado}.`);
    const ultimo = numeros[numeros.length - 1];
    return {
      ok: true,
      error: null,
      tipo: 'aritmetica',
      d,
      diferencias,
      cocientes,
      siguientes: [ultimo + d, ultimo + 2 * d, ultimo + 3 * d],
      terminoGeneral: general.definicion,
      pasos,
    };
  }

  if (esGeometrica) {
    const r = redondear(cocientes[0], 10);
    pasos.push(
      `Las diferencias no coinciden, pero todos los cocientes valen lo mismo, ${formatearFlexible(r)}, así que la sucesión es GEOMÉTRICA con r = ${formatearFlexible(r)}.`,
    );
    if (r < 0) {
      pasos.push('Como la razón es negativa, los términos van alternando de signo.');
    } else if (Math.abs(r) < 1) {
      pasos.push(
        'Como |r| < 1, los términos se hacen cada vez más pequeños y su suma infinita sí tiene un valor: S = a₁/(1 − r).',
      );
    }
    const general = terminoGeneralGeometrico(numeros[0], r);
    pasos.push(`Término general: ${general}.`);
    const ultimo = numeros[numeros.length - 1];
    return {
      ok: true,
      error: null,
      tipo: 'geometrica',
      r,
      diferencias,
      cocientes,
      siguientes: [ultimo * r, ultimo * r * r, ultimo * r * r * r],
      terminoGeneral: general,
      pasos,
    };
  }

  pasos.push(
    'Ni las diferencias ni los cocientes son constantes, así que esta sucesión NO es aritmética ni geométrica. Que crezca no basta: hace falta que crezca SIEMPRE de la misma manera.',
  );

  // Lo único que se puede añadir sin inventar nada: si las diferencias forman a su vez
  // una progresión aritmética, la sucesión es de segundo orden (los cuadrados lo son).
  if (diferencias.length >= 3) {
    const segundas: number[] = [];
    for (let i = 0; i < diferencias.length - 1; i++) segundas.push(diferencias[i + 1] - diferencias[i]);
    if (todosIguales(segundas, escala)) {
      pasos.push(
        `Sí se puede decir algo más: las diferencias de las diferencias valen todas ${formatearFlexible(redondear(segundas[0], 10))}, así que es una sucesión de segundo orden. Los cuadrados 1, 4, 9, 16 son el ejemplo clásico.`,
      );
    }
  }

  return { ...base, ok: true, diferencias, cocientes, pasos };
}

/** Intenta partir el texto con un separador concreto. Devuelve null si algo no cuadra. */
function intentarSeparador(
  texto: string,
  patron: RegExp,
  separador: ListaNumerica['separador'],
): ListaNumerica | null {
  const trozos = texto
    .split(patron)
    .map((p) => p.trim())
    .filter((p) => p !== '');
  if (trozos.length === 0) return null;

  const numeros: number[] = [];
  for (const trozo of trozos) {
    // Un espacio DENTRO de un trozo delata que el separador elegido no era el bueno.
    // Sin esta comprobación «1,5 3 4,5» partido por comas daría el trozo «5 3 4», y
    // `parseSpanishNumber` ignora los espacios: saldría 534 sin que nada avisara.
    if (/\s/.test(trozo)) return null;
    const valor = parseSpanishNumber(trozo);
    if (!Number.isFinite(valor)) return null;
    numeros.push(valor);
  }
  return { ok: true, numeros, separador, error: null };
}

/**
 * Parte por separadores lo que se ha escrito en el modo Identificar.
 *
 * En español la coma es TAMBIÉN el separador decimal, así que no hay un separador
 * correcto por decreto: se PRUEBAN por orden y gana el primero con el que todos los
 * trozos son números. Con «3, 7, 11, 15» gana la coma; con «1,5 3 4,5» la coma falla
 * —el trozo «5 3 4» tiene espacios dentro— y gana el espacio, dejando las comas como
 * decimales. El punto y coma y el salto de línea van primero porque son inequívocos.
 */
export function parsearListaNumeros(texto: string): ListaNumerica {
  const vacio: ListaNumerica = { ok: false, numeros: [], separador: 'coma', error: null };
  const limpio = (texto ?? '').trim();

  if (limpio === '') {
    return { ...vacio, error: 'Escribe una sucesión de números, por ejemplo 3, 7, 11, 15.' };
  }

  if (/[;\n]/.test(limpio)) {
    const explicito = intentarSeparador(limpio, /[;\n]+/, 'punto-y-coma');
    if (explicito) return explicito;
    return {
      ...vacio,
      separador: 'punto-y-coma',
      error:
        'Has separado con punto y coma, pero alguno de los trozos no es un número. Deja un solo número entre cada punto y coma: 1,5; 3; 4,5',
    };
  }

  const porComa = intentarSeparador(limpio, /,/, 'coma');
  if (porComa) return porComa;

  const porEspacio = intentarSeparador(limpio, /\s+/, 'espacio');
  if (porEspacio) return porEspacio;

  return {
    ...vacio,
    error:
      'No se ha reconocido la sucesión. Separa los números con comas (3, 7, 11, 15) o con espacios; si tus números llevan decimales escritos con coma, separa la lista con punto y coma: 1,5; 3; 4,5',
  };
}

// ============================================================
// COMPROBACIÓN DE RESPUESTAS
// ============================================================

/**
 * Tolerancia de corrección: la mayor entre ±0,01 y el 1 % del valor esperado.
 *
 * El mínimo absoluto evita castigar el redondeo en respuestas pequeñas (4,5 frente a
 * 4,49) y el porcentaje evita ser absurdamente estricto en respuestas grandes, donde
 * exigir el céntimo en 204.800 no mide si se entendió la progresión.
 */
export function toleranciaDe(valorEsperado: number): number {
  return Math.max(0.01, Math.abs(valorEsperado) * 0.01);
}

/** Compara la respuesta tecleada con la esperada. NaN cuenta como «no numérico». */
export function comprobarRespuesta(valorUsuario: number, valorEsperado: number): Comprobacion {
  const tolerancia = toleranciaDe(valorEsperado);
  if (!Number.isFinite(valorUsuario)) {
    return { correcto: false, motivo: 'no-numerico', diferencia: NaN, tolerancia };
  }
  const diferencia = Math.abs(valorUsuario - valorEsperado);
  return {
    correcto: diferencia <= tolerancia,
    motivo: diferencia <= tolerancia ? 'acertado' : 'fallado',
    diferencia,
    tolerancia,
  };
}

// ============================================================
// LOS 12 CASOS NUMERADOS
// ============================================================

/** Un cálculo auxiliar que se añade a los pasos para comparar dos progresiones. */
interface ComparacionCaso {
  etiqueta: string;
  calculo: TipoCalculo;
  a1: number;
  parametro: number;
  n: number;
}

/**
 * Definición de un caso: solo los DATOS. La respuesta y los pasos salen de las funciones
 * de arriba, nunca escritos a mano (ver punto 4 de la cabecera).
 */
interface DefinicionCaso {
  id: number;
  titulo: string;
  enunciado: string;
  categoria: 'abstracto' | 'aplicado';
  calculo: TipoCalculo | 'identificar';
  a1?: number;
  parametro?: number;
  n?: number;
  sucesion?: readonly number[];
  etiquetaRespuesta: string;
  decimalesRespuesta?: number;
  comparacion?: ComparacionCaso;
  pista: string;
}

const DEFINICIONES: readonly DefinicionCaso[] = [
  {
    id: 1,
    titulo: 'Término general de una aritmética',
    enunciado:
      'Una progresión aritmética empieza en 4 y cada término es 7 unidades mayor que el anterior. ¿Cuánto vale el término 20?',
    categoria: 'abstracto',
    calculo: 'termino-aritmetico',
    a1: 4,
    parametro: 7,
    n: 20,
    etiquetaRespuesta: 'a₂₀',
    pista: 'Del término 1 al 20 hay 19 saltos, no 20. Ese (n − 1) es el error más repetido.',
  },
  {
    id: 2,
    titulo: 'Suma de una aritmética',
    enunciado:
      'Suma los 30 primeros términos de la progresión aritmética que empieza en 3 y tiene diferencia 5.',
    categoria: 'abstracto',
    calculo: 'suma-aritmetica',
    a1: 3,
    parametro: 5,
    n: 30,
    etiquetaRespuesta: 'S₃₀',
    pista: 'Primero calcula a₃₀; después aplica Sₙ = n·(a₁ + aₙ)/2. Son dos pasos, no uno.',
  },
  {
    id: 3,
    titulo: 'La suma de Gauss',
    enunciado:
      'Suma todos los números enteros del 1 al 100. Es el problema con el que, según se cuenta, un niño llamado Carl Friedrich Gauss dejó sin trabajo a su maestro en pocos segundos.',
    categoria: 'abstracto',
    calculo: 'suma-aritmetica',
    a1: 1,
    parametro: 1,
    n: 100,
    etiquetaRespuesta: 'S₁₀₀',
    pista: 'Empareja 1 con 100, 2 con 99, 3 con 98… Todas las parejas suman 101, y hay 50 parejas.',
  },
  {
    id: 4,
    titulo: 'Una aritmética que baja',
    enunciado:
      'Una progresión aritmética empieza en 100 y su diferencia es −6. ¿Cuánto vale el término 15?',
    categoria: 'abstracto',
    calculo: 'termino-aritmetico',
    a1: 100,
    parametro: -6,
    n: 15,
    etiquetaRespuesta: 'a₁₅',
    pista: 'La diferencia negativa no cambia la fórmula: a₁ + (n − 1)·d con d = −6.',
  },
  {
    id: 5,
    titulo: 'Término general de una geométrica',
    enunciado:
      'Una progresión geométrica empieza en 2 y su razón es 3. ¿Cuánto vale el término 8?',
    categoria: 'abstracto',
    calculo: 'termino-geometrico',
    a1: 2,
    parametro: 3,
    n: 8,
    etiquetaRespuesta: 'a₈',
    pista: 'El exponente es 7, no 8: aₙ = a₁·r^(n−1).',
  },
  {
    id: 6,
    titulo: 'Suma de una geométrica',
    enunciado:
      'Suma los 10 primeros términos de la progresión geométrica que empieza en 5 y tiene razón 2.',
    categoria: 'abstracto',
    calculo: 'suma-geometrica',
    a1: 5,
    parametro: 2,
    n: 10,
    etiquetaRespuesta: 'S₁₀',
    pista: 'Sₙ = a₁·(rⁿ − 1)/(r − 1). Aquí el exponente SÍ es n, no n − 1.',
  },
  {
    id: 7,
    titulo: 'Identificar el tipo',
    enunciado:
      'Observa la sucesión 5, 15, 45, 135. ¿Es aritmética o geométrica? Escribe el número que la genera: su razón si es geométrica, su diferencia si es aritmética.',
    categoria: 'abstracto',
    calculo: 'identificar',
    sucesion: [5, 15, 45, 135],
    etiquetaRespuesta: 'razón o diferencia',
    pista: 'Calcula primero las restas entre términos seguidos; si no salen iguales, prueba con las divisiones.',
  },
  {
    id: 8,
    titulo: 'Un ahorro que crece cada año',
    enunciado:
      'Un ahorro de 1.000 € crece un 5 % cada año y no se toca. Tomando el saldo de hoy como primer término (a₁ = 1.000), el saldo al cabo de 10 años es el término 11. ¿Cuánto es? Redondea a 2 decimales.',
    categoria: 'aplicado',
    calculo: 'termino-geometrico',
    a1: 1000,
    parametro: 1.05,
    n: 11,
    etiquetaRespuesta: '€',
    decimalesRespuesta: 2,
    pista: 'Crecer un 5 % es multiplicar por 1,05, no sumar 5. La razón es 1,05.',
  },
  {
    id: 9,
    titulo: 'Un cultivo de bacterias',
    enunciado:
      'Un cultivo empieza con 50 bacterias y la población se duplica cada 20 minutos. Tomando esas 50 como primer término, ¿cuántas bacterias hay al cabo de 4 horas?',
    categoria: 'aplicado',
    calculo: 'termino-geometrico',
    a1: 50,
    parametro: 2,
    n: 13,
    etiquetaRespuesta: 'bacterias',
    pista: '4 horas son 240 minutos: 12 duplicaciones. Como el primer término es el instante inicial, el término que buscas es el 13.',
  },
  {
    id: 10,
    titulo: 'Las filas de un teatro',
    enunciado:
      'En un teatro, la primera fila tiene 18 butacas y cada fila siguiente tiene 2 butacas más que la anterior. Si hay 25 filas, ¿cuántas butacas hay en total?',
    categoria: 'aplicado',
    calculo: 'suma-aritmetica',
    a1: 18,
    parametro: 2,
    n: 25,
    etiquetaRespuesta: 'butacas',
    pista: 'Te piden el TOTAL, así que es una suma, no un término suelto. La última fila tiene 66 butacas.',
  },
  {
    id: 11,
    titulo: 'Los rebotes de una pelota',
    enunciado:
      'Una pelota se suelta desde 3 metros y en cada rebote sube el 60 % de la altura anterior, así que el primer rebote alcanza 1,8 m. Si rebotase infinitas veces, ¿cuánto sumarían todas las alturas de subida?',
    categoria: 'aplicado',
    calculo: 'suma-infinita',
    a1: 1.8,
    parametro: 0.6,
    n: 0,
    etiquetaRespuesta: 'm',
    pista: 'El primer término no es 3 sino 1,8: te piden las alturas de SUBIDA. Como |r| < 1, la suma infinita existe.',
  },
  {
    id: 12,
    titulo: 'Subida fija frente a subida porcentual',
    enunciado:
      'Un sueldo de 1.500 € al mes sube un 4 % cada año. Tomando el sueldo de hoy como primer término, ¿cuánto se cobra en el año 10? Redondea a 2 decimales. En la solución verás qué habría pasado con una subida fija de 60 € al año.',
    categoria: 'aplicado',
    calculo: 'termino-geometrico',
    a1: 1500,
    parametro: 1.04,
    n: 10,
    etiquetaRespuesta: '€',
    decimalesRespuesta: 2,
    comparacion: {
      etiqueta: 'El mismo sueldo con una subida FIJA de 60 € al año, en el año 10',
      calculo: 'termino-aritmetico',
      a1: 1500,
      parametro: 60,
      n: 10,
    },
    pista: 'Subir un 4 % es multiplicar por 1,04. Fíjate en que al principio la subida fija de 60 € era mayor que el 4 % de 1.500 €.',
  },
];

/** Construye la solución de un caso a partir de sus datos. Nada se teclea a mano. */
function construirCaso(def: DefinicionCaso): CasoProgresion {
  const a1 = def.a1 ?? 0;
  const parametro = def.parametro ?? 0;
  const n = def.n ?? 0;
  const sucesion = def.sucesion ?? [];

  let respuesta = NaN;
  let pasos: string[] = [];

  if (def.calculo === 'identificar') {
    const analisis = identificarProgresion([...sucesion]);
    respuesta = analisis.tipo === 'geometrica' ? (analisis.r ?? NaN) : (analisis.d ?? NaN);
    pasos = [...analisis.pasos];
  } else {
    const solucion = resolverProgresion(def.calculo, a1, parametro, n);
    respuesta = solucion.valor;
    pasos = [...solucion.pasos];
  }

  if (def.comparacion) {
    const comparada = resolverProgresion(
      def.comparacion.calculo,
      def.comparacion.a1,
      def.comparacion.parametro,
      def.comparacion.n,
    );
    if (comparada.ok) {
      const relacion =
        comparada.valor > respuesta
          ? 'más alto que el de este caso, así que la subida fija todavía va por delante'
          : comparada.valor < respuesta
            ? 'más bajo que el de este caso, así que la subida porcentual ya ha adelantado a la fija'
            : 'exactamente igual que el de este caso: es justo el año en que se cruzan';
      pasos.push(
        `${def.comparacion.etiqueta}: ${formatearFlexible(comparada.valor)}, ${relacion}. Una aritmética suma siempre la misma cantidad; una geométrica suma cada vez más, porque el porcentaje se aplica sobre una cifra mayor.`,
      );
    }
  }

  const respuestaTexto =
    def.decimalesRespuesta !== undefined
      ? formatNumber(respuesta, def.decimalesRespuesta)
      : formatearFlexible(respuesta);

  return {
    id: def.id,
    titulo: def.titulo,
    enunciado: def.enunciado,
    categoria: def.categoria,
    calculo: def.calculo,
    a1,
    parametro,
    n,
    sucesion,
    etiquetaRespuesta: def.etiquetaRespuesta,
    respuesta,
    respuestaTexto,
    requiereRedondeo: Math.abs(respuesta - redondear(respuesta, 2)) > 1e-9,
    pasos,
    pista: def.pista,
  };
}

/**
 * Los 12 casos numerados, FIJOS y deterministas: el caso 3 es el mismo para todo el
 * mundo y en cualquier visita. Es lo que permite mandar «resuelve el 3, el 7 y el 11».
 */
export const CASOS: readonly CasoProgresion[] = DEFINICIONES.map(construirCaso);

/** Cuántos casos hay. Se deriva del array para que nunca discrepe del contador de la UI. */
export const TOTAL_CASOS = CASOS.length;

// ============================================================
// MODO PRÁCTICA: EJERCICIOS ALEATORIOS
// ============================================================

/**
 * Generador pseudoaleatorio determinista (mulberry32). Con la misma semilla salen
 * exactamente los mismos números, así que un ejercicio se puede reproducir y verificar.
 */
function creadorAleatorio(semilla: number): () => number {
  let estado = semilla >>> 0;
  return () => {
    estado = (estado + 0x6d2b79f5) >>> 0;
    let t = estado;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function elegir<T>(lista: readonly T[], aleatorio: () => number): T {
  return lista[Math.floor(aleatorio() * lista.length)];
}

function entreEnteros(min: number, max: number, aleatorio: () => number): number {
  return min + Math.floor(aleatorio() * (max - min + 1));
}

/**
 * Parejas (a₁, r) elegidas para que la suma infinita salga limpia y no un 7,3846…
 * Cada una da S = a₁/(1 − r) con a lo sumo un decimal.
 */
const PARES_CONVERGENTES: readonly (readonly [number, number])[] = [
  [10, 0.5],
  [8, 0.5],
  [12, 0.25],
  [30, 0.25],
  [20, 0.2],
  [10, 0.75],
  [6, 0.5],
  [15, 0.4],
  [9, 0.4],
  [4, 0.75],
];

/** Razones enteras y sencillas, para que las potencias no se vuelvan ilegibles. */
const RAZONES_ENTERAS: readonly number[] = [2, 3, -2, 5, -3];

/**
 * Genera un ejercicio nuevo. Si se pasa `semilla`, el ejercicio es reproducible; si no,
 * se toma una semilla del reloj (por eso NUNCA debe llamarse durante el render: el
 * servidor y el navegador obtendrían ejercicios distintos).
 */
export function generarEjercicioAleatorio(semilla?: number): EjercicioAleatorio {
  const semillaReal =
    semilla !== undefined && Number.isFinite(semilla)
      ? Math.floor(Math.abs(semilla))
      : Math.floor(Date.now() % 2147483647);
  const aleatorio = creadorAleatorio(semillaReal);

  const familia = elegir(
    ['termino-aritmetico', 'suma-aritmetica', 'termino-geometrico', 'suma-geometrica', 'suma-infinita'] as const,
    aleatorio,
  );

  let a1 = 0;
  let parametro = 0;
  let n = 0;
  let enunciado = '';
  let etiquetaRespuesta = '';

  if (familia === 'termino-aritmetico') {
    a1 = entreEnteros(2, 20, aleatorio);
    parametro = entreEnteros(2, 9, aleatorio) * (aleatorio() < 0.3 ? -1 : 1);
    n = entreEnteros(8, 30, aleatorio);
    enunciado = `Una progresión aritmética empieza en ${formatearFlexible(a1)} y tiene diferencia ${formatearFlexible(parametro)}. ¿Cuánto vale el término ${formatNumber(n, 0)}?`;
    etiquetaRespuesta = `a${subindice(n)}`;
  } else if (familia === 'suma-aritmetica') {
    a1 = entreEnteros(1, 15, aleatorio);
    parametro = entreEnteros(2, 8, aleatorio);
    n = entreEnteros(6, 25, aleatorio);
    enunciado = `Suma los ${formatNumber(n, 0)} primeros términos de la progresión aritmética que empieza en ${formatearFlexible(a1)} y tiene diferencia ${formatearFlexible(parametro)}.`;
    etiquetaRespuesta = `S${subindice(n)}`;
  } else if (familia === 'termino-geometrico') {
    a1 = entreEnteros(1, 6, aleatorio);
    parametro = elegir(RAZONES_ENTERAS, aleatorio);
    n = entreEnteros(4, Math.abs(parametro) >= 5 ? 7 : 9, aleatorio);
    enunciado = `Una progresión geométrica empieza en ${formatearFlexible(a1)} y tiene razón ${formatearFlexible(parametro)}. ¿Cuánto vale el término ${formatNumber(n, 0)}?`;
    etiquetaRespuesta = `a${subindice(n)}`;
  } else if (familia === 'suma-geometrica') {
    a1 = entreEnteros(1, 8, aleatorio);
    parametro = elegir([2, 3, -2] as const, aleatorio);
    n = entreEnteros(5, Math.abs(parametro) === 3 ? 8 : 11, aleatorio);
    enunciado = `Suma los ${formatNumber(n, 0)} primeros términos de la progresión geométrica que empieza en ${formatearFlexible(a1)} y tiene razón ${formatearFlexible(parametro)}.`;
    etiquetaRespuesta = `S${subindice(n)}`;
  } else {
    const par = elegir(PARES_CONVERGENTES, aleatorio);
    a1 = par[0];
    parametro = par[1];
    n = 0;
    enunciado = `Una progresión geométrica empieza en ${formatearFlexible(a1)} y tiene razón ${formatearFlexible(parametro)}. Como |r| < 1, sumar sus infinitos términos sí da un número: ¿cuál?`;
    etiquetaRespuesta = 'S (suma infinita)';
  }

  const solucion = resolverProgresion(familia, a1, parametro, n);

  return {
    semilla: semillaReal,
    enunciado,
    calculo: familia,
    a1,
    parametro,
    n,
    etiquetaRespuesta,
    respuesta: solucion.valor,
    respuestaTexto: formatearFlexible(solucion.valor),
    requiereRedondeo: Math.abs(solucion.valor - redondear(solucion.valor, 2)) > 1e-9,
    pasos: solucion.pasos,
  };
}
