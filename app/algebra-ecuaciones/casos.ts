/**
 * Motor de los casos numerados de la calculadora de ecuaciones.
 *
 * Vive FUERA de page.tsx a propósito. El build compila la vista sin comprobar si el
 * álgebra está bien: una ecuación resuelta al revés compila exactamente igual de limpio
 * que una bien resuelta, y el error solo se ve leyendo el número en pantalla. Aquí no
 * hay React, ni DOM, ni estado: solo funciones puras con entradas y salidas que se
 * verifican a mano (5x + 12 = 47 → x = 7; x² − 5x + 6 = 0 → 3 y 2; det de 2x+3y=7 con
 * 4x+6y=9 → 0), y por eso se prueban aparte, sin navegador.
 *
 * Cuatro decisiones que no son evidentes leyendo el código:
 *
 * 1. Los 12 casos se CALCULAN a partir de sus `datos`, nunca se teclea la solución. Un
 *    caso con la respuesta escrita a mano puede contradecir a la fórmula sin que nada se
 *    queje, y es justo el fallo que rompería la utilidad del modo: un profesor manda
 *    «resuelve el 3, el 7 y el 11» y la corrección tiene que ser la misma para todos.
 *
 * 2. Cada enunciado pide UN número inequívoco. Una cuadrática tiene dos soluciones, así
 *    que preguntar «¿cuánto vale x?» dejaría la casilla ambigua y suspendería a quien
 *    escribe la otra raíz, que también es correcta. De ahí `etiquetaRespuesta`: «la
 *    solución mayor», «el discriminante», «la raíz entera menor».
 *
 * 3. En la cuadrática sin soluciones reales lo que se pide es el DISCRIMINANTE, no una x
 *    que no existe. Es el único número comprobable de ese caso, y además es exactamente
 *    lo que hay que calcular para saber que no hay solución.
 *
 * 4. La aritmética de fracciones y la división sintética (`frac`, `dividirRuffini`,
 *    `polinomioATexto`…) estaban en page.tsx y se han MOVIDO aquí, de modo que la app y
 *    los casos usan una sola implementación. Si se duplicasen, un arreglo en Ruffini
 *    podría corregir la calculadora y dejar los casos mintiendo.
 */

import { formatNumber } from '@/lib';

// ============================================================
// ARITMÉTICA RACIONAL EXACTA (compartida con la calculadora)
// ============================================================

/**
 * Fracción en forma reducida. Se trabaja con fracciones (no con coma flotante) para que
 * la división sintética dé restos exactamente 0 y no «0,0000000001».
 */
export interface Fraccion {
  n: number; // numerador
  d: number; // denominador, siempre > 0
}

export const mcdEnteros = (a: number, b: number): number => {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x;
};

export const frac = (n: number, d: number = 1): Fraccion => {
  if (d === 0) return { n: 0, d: 1 };
  let num = n;
  let den = d;
  if (den < 0) {
    num = -num;
    den = -den;
  }
  const g = mcdEnteros(num, den) || 1;
  return { n: num / g, d: den / g };
};

export const fSuma = (a: Fraccion, b: Fraccion): Fraccion => frac(a.n * b.d + b.n * a.d, a.d * b.d);
export const fProducto = (a: Fraccion, b: Fraccion): Fraccion => frac(a.n * b.n, a.d * b.d);
export const fEsCero = (a: Fraccion): boolean => a.n === 0;
export const fValor = (a: Fraccion): number => a.n / a.d;
export const fTexto = (a: Fraccion): string => (a.d === 1 ? String(a.n) : `${a.n}/${a.d}`);

/** Divisores positivos de un entero (para el teorema de la raíz racional). */
export const divisores = (num: number): number[] => {
  const valor = Math.abs(num);
  const salida: number[] = [];
  for (let i = 1; i <= valor; i++) {
    if (valor % i === 0) salida.push(i);
  }
  return salida;
};

/** Un paso de división sintética (la tabla clásica de tres filas). */
export interface PasoRuffini {
  raiz: Fraccion;
  coeficientes: Fraccion[]; // fila superior
  arrastre: Fraccion[]; // fila central (bajo cada columna salvo la primera)
  resultado: Fraccion[]; // fila inferior: cociente + resto final
}

/** Divide P(x) entre (x − raiz) por Ruffini y devuelve el paso completo. */
export const dividirRuffini = (coeficientes: Fraccion[], raiz: Fraccion): PasoRuffini => {
  const resultado: Fraccion[] = [coeficientes[0]];
  const arrastre: Fraccion[] = [];
  for (let i = 1; i < coeficientes.length; i++) {
    const sube = fProducto(resultado[i - 1], raiz);
    arrastre.push(sube);
    resultado.push(fSuma(coeficientes[i], sube));
  }
  return { raiz, coeficientes, arrastre, resultado };
};

/** Escribe un polinomio a partir de sus coeficientes (grado descendente). */
export const polinomioATexto = (coeficientes: Fraccion[]): string => {
  const grado = coeficientes.length - 1;
  const partes: string[] = [];
  coeficientes.forEach((c, i) => {
    if (fEsCero(c)) return;
    const exponente = grado - i;
    const signo = c.n < 0 ? '−' : partes.length ? '+' : '';
    const abs = frac(Math.abs(c.n), c.d);
    const coefTexto = fTexto(abs) === '1' && exponente > 0 ? '' : fTexto(abs);
    const variable =
      exponente === 0
        ? ''
        : exponente === 1
          ? 'x'
          : `x${exponente === 2 ? '²' : exponente === 3 ? '³' : exponente === 4 ? '⁴' : '⁵'}`;
    partes.push(`${signo} ${coefTexto}${variable}`.trim());
  });
  return partes.length ? partes.join(' ') : '0';
};

// ============================================================
// FORMATO
// ============================================================

/** Redondea a `decimales` para no arrastrar el ruido binario del punto flotante. */
export function redondear(valor: number, decimales: number): number {
  const factor = 10 ** decimales;
  return Math.round(valor * factor) / factor;
}

/**
 * Formatea con los decimales que el número necesita de verdad, hasta un máximo.
 * Así 7 se escribe «7» y no «7,0000», pero 2,3333 conserva su precisión.
 *
 * El guion del negativo se sustituye por el signo menos matemático (U+2212), que es el
 * que ya usan `polinomioATexto` y los pasos. Sin esa normalización la misma tarjeta
 * enseñaría «Δ = 4 − 20 = −16» en el razonamiento y «Correcto: -16» en el veredicto,
 * con dos rayas distintas y de distinto largo.
 */
export function formatearFlexible(valor: number, maxDecimales = 4): string {
  if (!Number.isFinite(valor)) return 'no definido';
  for (let d = 0; d < maxDecimales; d++) {
    if (Math.abs(valor - redondear(valor, d)) < 1e-9) {
      return formatNumber(valor, d).replace('-', '−');
    }
  }
  return formatNumber(valor, maxDecimales).replace('-', '−');
}

/** «+ 3» o «− 3»: el signo separado, como se escribe una ecuación en la pizarra. */
function conSigno(valor: number): string {
  return `${valor < 0 ? '−' : '+'} ${formatearFlexible(Math.abs(valor))}`;
}

/** Coeficiente delante de una incógnita: 1 → «», −1 → «−», 4 → «4». */
function coefTexto(valor: number): string {
  if (valor === 1) return '';
  if (valor === -1) return '−';
  return formatearFlexible(valor).replace('-', '−');
}

/** Un lado de una ecuación lineal: «4x − 12», «2x», «47». */
function ladoLineal(coefX: number, constante: number): string {
  if (coefX === 0) return formatearFlexible(constante).replace('-', '−');
  const termino = `${coefTexto(coefX)}x`;
  return constante === 0 ? termino : `${termino} ${conSigno(constante)}`;
}

/** Texto de la ecuación lineal completa, con sus dos lados. */
export function ecuacionLinealTexto(datos: DatosLineal): string {
  return `${ladoLineal(datos.a, datos.b)} = ${ladoLineal(datos.c, datos.d)}`;
}

/** Texto de la cuadrática, omitiendo los términos nulos: «x² − 5x + 6 = 0». */
export function ecuacionCuadraticaTexto(a: number, b: number, c: number): string {
  let texto = `${coefTexto(a)}x²`;
  if (b !== 0) texto += ` ${conSigno(b)}x`;
  if (c !== 0) texto += ` ${conSigno(c)}`;
  return `${texto} = 0`;
}

/** Una fila del sistema: «3x + 2y = 31». */
export function ecuacionSistemaTexto(a: number, b: number, c: number): string {
  const parteX = `${coefTexto(a)}x`;
  const parteY = b === 0 ? '' : ` ${conSigno(b)}y`;
  return `${parteX}${parteY} = ${formatearFlexible(c).replace('-', '−')}`;
}

// ============================================================
// TIPOS DE LOS CASOS
// ============================================================

/** Qué clase de ecuación plantea un caso. */
export type TipoCaso = 'lineal' | 'cuadratica' | 'sistema' | 'polinomio';

/** Cálculo desnudo o situación de la vida real. */
export type CategoriaCaso = 'abstracto' | 'aplicado';

/**
 * Lineal ya reducida a la forma `a·x + b = c·x + d`.
 *
 * La calculadora usa la forma más corta `a·x + b = c`, que es este mismo convenio con
 * `c = 0` en el coeficiente de la derecha. Se generaliza porque los casos con paréntesis
 * o con denominadores dejan x a los dos lados tras expandir, y el enunciado enseña la
 * forma original mientras `datos` guarda la reducida.
 */
export interface DatosLineal {
  tipo: 'lineal';
  a: number;
  b: number;
  c: number;
  d: number;
}

/** Qué número exacto pide una cuadrática. Nunca «x» a secas: tendría dos respuestas. */
export type PideCuadratica = 'mayor' | 'menor' | 'doble' | 'discriminante';

/** Cuadrática en forma general `a·x² + b·x + c = 0`, igual que la calculadora. */
export interface DatosCuadratica {
  tipo: 'cuadratica';
  a: number;
  b: number;
  c: number;
  pide: PideCuadratica;
}

/** Qué número pide un sistema. Los determinantes valen también cuando no hay solución. */
export type PideSistema = 'x' | 'y' | 'determinante' | 'determinanteX' | 'determinanteY';

/** Sistema 2x2 `a₁x + b₁y = c₁` / `a₂x + b₂y = c₂`, con el convenio de Cramer de la app. */
export interface DatosSistema {
  tipo: 'sistema';
  a1: number;
  b1: number;
  c1: number;
  a2: number;
  b2: number;
  c2: number;
  pide: PideSistema;
}

/** Qué raíz pide una factorización por Ruffini. Siempre una sola, y entera. */
export type PidePolinomio = 'raizMayor' | 'raizMenor';

/** Polinomio con los coeficientes en grado descendente, como los pide la calculadora. */
export interface DatosPolinomio {
  tipo: 'polinomio';
  coeficientes: readonly number[];
  pide: PidePolinomio;
}

/**
 * Unión discriminada declarada A MANO con literales. Si se dejara a la inferencia, `tipo`
 * se ensancharía a `string` y dejaría de estrechar nada: cualquier rama podría leer los
 * campos de las otras sin error, y el fallo saldría en pantalla como «undefined».
 */
export type DatosCaso = DatosLineal | DatosCuadratica | DatosSistema | DatosPolinomio;

/** Resultado de resolver unos datos: el número pedido y el razonamiento ya redactado. */
export interface SolucionCaso {
  ok: boolean;
  valor: number;
  valorTexto: string;
  pasos: string[];
  error: string | null;
}

/** Un caso numerado, con su solución ya calculada desde `datos`. */
export interface CasoAlgebra {
  id: number;
  titulo: string;
  enunciado: string;
  categoria: CategoriaCaso;
  tipo: TipoCaso;
  datos: DatosCaso;
  /** Qué se escribe exactamente en la casilla. Nunca vacía: es lo que evita la ambigüedad. */
  etiquetaRespuesta: string;
  respuesta: number;
  respuestaTexto: string;
  pasos: string[];
  pista: string;
}

/** Ejercicio generado al vuelo: misma forma que un caso, pero sin número fijo. */
export interface EjercicioAleatorio {
  semilla: number;
  enunciado: string;
  tipo: TipoCaso;
  datos: DatosCaso;
  etiquetaRespuesta: string;
  respuesta: number;
  respuestaTexto: string;
  pasos: string[];
  pista: string;
}

/** Veredicto de comprobar la respuesta que ha tecleado quien usa la app. */
export interface Comprobacion {
  correcto: boolean;
  motivo: 'acertado' | 'fallado' | 'no-numerico';
  diferencia: number;
  tolerancia: number;
}

// ============================================================
// RESOLUTORES PUROS
// ============================================================

const SIN_SOLUCION: SolucionCaso = {
  ok: false,
  valor: NaN,
  valorTexto: 'no definido',
  pasos: [],
  error: null,
};

/**
 * Lineal `a·x + b = c·x + d`. Se agrupan las x a la izquierda y los números a la derecha:
 * `(a − c)·x = d − b`. Si `a − c` es cero no hay ecuación de primer grado que resolver.
 */
export function resolverLineal(datos: DatosLineal): SolucionCaso {
  const { a, b, c, d } = datos;
  if (![a, b, c, d].every((v) => Number.isFinite(v))) {
    return { ...SIN_SOLUCION, error: 'Los coeficientes tienen que ser números.' };
  }
  const coefTotal = a - c;
  const constanteTotal = d - b;
  if (coefTotal === 0) {
    return {
      ...SIN_SOLUCION,
      error:
        constanteTotal === 0
          ? 'La x desaparece y queda 0 = 0: la igualdad se cumple para cualquier valor (identidad).'
          : 'La x desaparece y queda una igualdad falsa: la ecuación no tiene solución.',
    };
  }
  const x = constanteTotal / coefTotal;
  const pasos = [
    `Ecuación reducida: ${ecuacionLinealTexto(datos)}`,
    'Paso 1: llevar los términos con x a un lado y los números al otro (al cambiar de lado, cambian de signo).',
    `(${formatearFlexible(a).replace('-', '−')} − ${formatearFlexible(c).replace('-', '−')})x = ${formatearFlexible(d).replace('-', '−')} − ${formatearFlexible(b).replace('-', '−')}`,
    `${formatearFlexible(coefTotal).replace('-', '−')}x = ${formatearFlexible(constanteTotal).replace('-', '−')}`,
    `Paso 2: dividir los dos lados entre ${formatearFlexible(coefTotal).replace('-', '−')}.`,
    `x = ${formatearFlexible(constanteTotal).replace('-', '−')} / ${formatearFlexible(coefTotal).replace('-', '−')} = ${formatearFlexible(x).replace('-', '−')}`,
  ];
  return { ok: true, valor: x, valorTexto: formatearFlexible(x), pasos, error: null };
}

/**
 * Cuadrática `a·x² + b·x + c = 0` por la fórmula general, con el mismo convenio de
 * discriminante que usa la calculadora: Δ = b² − 4ac.
 */
export function resolverCuadratica(datos: DatosCuadratica): SolucionCaso {
  const { a, b, c, pide } = datos;
  if (![a, b, c].every((v) => Number.isFinite(v))) {
    return { ...SIN_SOLUCION, error: 'Los coeficientes tienen que ser números.' };
  }
  if (a === 0) {
    return {
      ...SIN_SOLUCION,
      error: 'Si a vale 0 la ecuación no es de segundo grado: no hay término en x².',
    };
  }

  const disc = b * b - 4 * a * c;
  const pasos = [
    `Ecuación: ${ecuacionCuadraticaTexto(a, b, c)}`,
    'Fórmula general: x = (−b ± √(b² − 4ac)) / (2a).',
    `Paso 1: el discriminante Δ = b² − 4ac = (${formatearFlexible(b).replace('-', '−')})² − 4 · (${formatearFlexible(a).replace('-', '−')}) · (${formatearFlexible(c).replace('-', '−')})`,
    `Δ = ${formatearFlexible(b * b)} − ${formatearFlexible(4 * a * c).replace('-', '−')} = ${formatearFlexible(disc).replace('-', '−')}`,
  ];

  if (pide === 'discriminante') {
    pasos.push(
      disc < 0
        ? 'Como Δ es negativo, la raíz cuadrada no existe en los números reales: la ecuación NO tiene soluciones reales. El número que se pide es el propio discriminante.'
        : 'El número que se pide es el propio discriminante.',
    );
    return {
      ok: true,
      valor: disc,
      valorTexto: formatearFlexible(disc),
      pasos,
      error: null,
    };
  }

  if (disc < 0) {
    return {
      ...SIN_SOLUCION,
      pasos,
      error: 'Δ es negativo: no hay soluciones reales, así que no se puede pedir un valor de x.',
    };
  }

  if (disc === 0) {
    const x = -b / (2 * a);
    pasos.push(
      'Como Δ = 0, la raíz cuadrada vale 0 y las dos soluciones coinciden: hay una única solución doble.',
      `x = −b / (2a) = ${formatearFlexible(-b).replace('-', '−')} / ${formatearFlexible(2 * a).replace('-', '−')} = ${formatearFlexible(x).replace('-', '−')}`,
    );
    // Con Δ = 0 las tres peticiones que quedan ('doble', 'mayor' y 'menor') apuntan al
    // mismo número: solo hay una solución y es a la vez la mayor y la menor.
    return { ok: true, valor: x, valorTexto: formatearFlexible(x), pasos, error: null };
  }

  const raiz = Math.sqrt(disc);
  const x1 = (-b + raiz) / (2 * a);
  const x2 = (-b - raiz) / (2 * a);
  const mayor = Math.max(x1, x2);
  const menor = Math.min(x1, x2);
  pasos.push(
    `Como Δ > 0 hay dos soluciones distintas. √Δ = √${formatearFlexible(disc)} = ${formatearFlexible(raiz)}`,
    `x₁ = (${formatearFlexible(-b).replace('-', '−')} + ${formatearFlexible(raiz)}) / ${formatearFlexible(2 * a).replace('-', '−')} = ${formatearFlexible(x1).replace('-', '−')}`,
    `x₂ = (${formatearFlexible(-b).replace('-', '−')} − ${formatearFlexible(raiz)}) / ${formatearFlexible(2 * a).replace('-', '−')} = ${formatearFlexible(x2).replace('-', '−')}`,
    `Ordenadas: la menor es ${formatearFlexible(menor).replace('-', '−')} y la mayor ${formatearFlexible(mayor).replace('-', '−')}.`,
  );

  if (pide === 'doble') {
    return {
      ...SIN_SOLUCION,
      pasos,
      error: 'Esta ecuación no tiene solución doble: Δ no vale 0.',
    };
  }

  const valor = pide === 'menor' ? menor : mayor;
  return { ok: true, valor, valorTexto: formatearFlexible(valor), pasos, error: null };
}

/**
 * Sistema 2x2 por la regla de Cramer, con los mismos determinantes que la calculadora:
 * det = a₁b₂ − a₂b₁, det_x = c₁b₂ − c₂b₁, det_y = a₁c₂ − a₂c₁.
 *
 * Cuando det = 0 el sistema no tiene solución única, y ahí el número que se puede pedir
 * es un determinante: det_x ≠ 0 significa incompatible (rectas paralelas) y det_x = 0,
 * indeterminado (la misma recta escrita dos veces).
 */
export function resolverSistema(datos: DatosSistema): SolucionCaso {
  const { a1, b1, c1, a2, b2, c2, pide } = datos;
  if (![a1, b1, c1, a2, b2, c2].every((v) => Number.isFinite(v))) {
    return { ...SIN_SOLUCION, error: 'Los coeficientes tienen que ser números.' };
  }

  const det = a1 * b2 - a2 * b1;
  const detX = c1 * b2 - c2 * b1;
  const detY = a1 * c2 - a2 * c1;

  const pasos = [
    'Sistema:',
    `   ${ecuacionSistemaTexto(a1, b1, c1)}`,
    `   ${ecuacionSistemaTexto(a2, b2, c2)}`,
    `Determinante principal: det = a₁b₂ − a₂b₁ = (${formatearFlexible(a1).replace('-', '−')})(${formatearFlexible(b2).replace('-', '−')}) − (${formatearFlexible(a2).replace('-', '−')})(${formatearFlexible(b1).replace('-', '−')}) = ${formatearFlexible(det).replace('-', '−')}`,
  ];

  if (pide === 'determinante') {
    pasos.push(
      det === 0
        ? 'Como det = 0, el sistema NO tiene solución única: o no tiene ninguna (incompatible) o tiene infinitas (indeterminado).'
        : 'Como det ≠ 0, el sistema tiene una única solución.',
    );
    return { ok: true, valor: det, valorTexto: formatearFlexible(det), pasos, error: null };
  }

  if (pide === 'determinanteX') {
    pasos.push(
      `Determinante de x: det_x = c₁b₂ − c₂b₁ = (${formatearFlexible(c1).replace('-', '−')})(${formatearFlexible(b2).replace('-', '−')}) − (${formatearFlexible(c2).replace('-', '−')})(${formatearFlexible(b1).replace('-', '−')}) = ${formatearFlexible(detX).replace('-', '−')}`,
      det === 0
        ? detX === 0
          ? 'Con det = 0 y det_x = 0 el sistema es compatible indeterminado: las dos ecuaciones son la misma recta y hay infinitas soluciones.'
          : 'Con det = 0 y det_x ≠ 0 el sistema es incompatible: las rectas son paralelas y no se cortan nunca.'
        : 'Con det ≠ 0, x se obtiene dividiendo det_x entre det.',
    );
    return { ok: true, valor: detX, valorTexto: formatearFlexible(detX), pasos, error: null };
  }

  if (pide === 'determinanteY') {
    pasos.push(
      `Determinante de y: det_y = a₁c₂ − a₂c₁ = (${formatearFlexible(a1).replace('-', '−')})(${formatearFlexible(c2).replace('-', '−')}) − (${formatearFlexible(a2).replace('-', '−')})(${formatearFlexible(c1).replace('-', '−')}) = ${formatearFlexible(detY).replace('-', '−')}`,
    );
    return { ok: true, valor: detY, valorTexto: formatearFlexible(detY), pasos, error: null };
  }

  if (det === 0) {
    return {
      ...SIN_SOLUCION,
      pasos,
      error:
        'Con det = 0 el sistema no tiene una solución única, así que no se puede pedir el valor de x ni el de y.',
    };
  }

  const x = detX / det;
  const y = detY / det;
  pasos.push(
    `det_x = c₁b₂ − c₂b₁ = ${formatearFlexible(detX).replace('-', '−')}  →  x = det_x / det = ${formatearFlexible(detX).replace('-', '−')} / ${formatearFlexible(det).replace('-', '−')} = ${formatearFlexible(x).replace('-', '−')}`,
    `det_y = a₁c₂ − a₂c₁ = ${formatearFlexible(detY).replace('-', '−')}  →  y = det_y / det = ${formatearFlexible(detY).replace('-', '−')} / ${formatearFlexible(det).replace('-', '−')} = ${formatearFlexible(y).replace('-', '−')}`,
    `Comprobación en la primera ecuación: ${formatearFlexible(a1).replace('-', '−')}·${formatearFlexible(x).replace('-', '−')} ${conSigno(b1)}·${formatearFlexible(y).replace('-', '−')} = ${formatearFlexible(a1 * x + b1 * y).replace('-', '−')}`,
  );
  const valor = pide === 'y' ? y : x;
  return { ok: true, valor, valorTexto: formatearFlexible(valor), pasos, error: null };
}

/** Lo que se saca de factorizar un polinomio por Ruffini. */
export interface AnalisisPolinomio {
  ok: boolean;
  error: string | null;
  polinomio: string;
  candidatos: string[];
  raices: Fraccion[];
  raicesEnteras: number[];
  pasos: PasoRuffini[];
  cocienteFinal: string;
  factorizacion: string;
}

const ANALISIS_VACIO: AnalisisPolinomio = {
  ok: false,
  error: null,
  polinomio: '',
  candidatos: [],
  raices: [],
  raicesEnteras: [],
  pasos: [],
  cocienteFinal: '',
  factorizacion: '',
};

/**
 * Factoriza un polinomio de coeficientes enteros buscando raíces racionales ±p/q y
 * dividiendo por Ruffini. Mismo algoritmo que la pestaña «Grado 3+» de la calculadora.
 */
export function analizarPolinomio(coeficientes: readonly number[]): AnalisisPolinomio {
  if (coeficientes.length < 2) {
    return { ...ANALISIS_VACIO, error: 'Hacen falta al menos dos coeficientes.' };
  }
  if (!coeficientes.every((n) => Number.isFinite(n) && Number.isInteger(n))) {
    return {
      ...ANALISIS_VACIO,
      error:
        'Ruffini busca raíces racionales, y para eso los coeficientes deben ser enteros. Multiplica la ecuación por 10, 100… hasta eliminar los decimales: las soluciones no cambian.',
    };
  }
  if (coeficientes[0] === 0) {
    return {
      ...ANALISIS_VACIO,
      error: 'El coeficiente principal no puede ser cero: el polinomio tendría un grado menor.',
    };
  }

  let actuales: Fraccion[] = coeficientes.map((n) => frac(n));
  const polinomio = polinomioATexto(actuales);
  const pasos: PasoRuffini[] = [];
  const raices: Fraccion[] = [];

  // Si el término independiente es 0, x = 0 es raíz y hay que agotarla antes: el teorema
  // de la raíz racional exige término independiente distinto de cero.
  while (actuales.length > 1 && fEsCero(actuales[actuales.length - 1])) {
    const paso = dividirRuffini(actuales, frac(0));
    pasos.push(paso);
    raices.push(frac(0));
    actuales = paso.resultado.slice(0, -1);
  }

  const independiente = actuales[actuales.length - 1];
  const principal = actuales[0];
  const candidatos: Fraccion[] = [];
  const vistos = new Set<string>();

  if (!fEsCero(independiente)) {
    for (const p of divisores(independiente.n)) {
      for (const q of divisores(principal.n)) {
        for (const signo of [1, -1]) {
          const candidato = frac(signo * p, q);
          const clave = fTexto(candidato);
          if (!vistos.has(clave)) {
            vistos.add(clave);
            candidatos.push(candidato);
          }
        }
      }
    }
  }
  candidatos.sort((a, b) => Math.abs(fValor(a)) - Math.abs(fValor(b)) || fValor(a) - fValor(b));

  let progreso = true;
  while (actuales.length - 1 >= 1 && progreso) {
    progreso = false;
    for (const candidato of candidatos) {
      const paso = dividirRuffini(actuales, candidato);
      const resto = paso.resultado[paso.resultado.length - 1];
      if (fEsCero(resto)) {
        pasos.push(paso);
        raices.push(candidato);
        actuales = paso.resultado.slice(0, -1);
        progreso = true;
        break;
      }
    }
  }

  // Factorización agrupando las raíces repetidas como potencias
  const conteo = new Map<string, number>();
  for (const r of raices) {
    const texto = fEsCero(r) ? 'x' : `(x ${r.n < 0 ? '+' : '−'} ${fTexto(frac(Math.abs(r.n), r.d))})`;
    conteo.set(texto, (conteo.get(texto) ?? 0) + 1);
  }
  const exponentes = ['', '', '²', '³', '⁴', '⁵'];
  const factores: string[] = [];
  for (const [texto, veces] of conteo) {
    factores.push(veces > 1 ? `${texto}${exponentes[veces] ?? `^${veces}`}` : texto);
  }
  const cocienteFinal = polinomioATexto(actuales);
  if (actuales.length - 1 >= 1) {
    factores.push(`(${cocienteFinal})`);
  } else if (!factores.length) {
    factores.push(cocienteFinal);
  } else if (fTexto(actuales[0]) !== '1') {
    factores.unshift(fTexto(actuales[0]));
  }

  const raicesEnteras = Array.from(
    new Set(raices.filter((r) => r.d === 1).map((r) => r.n)),
  ).sort((x, y) => x - y);

  return {
    ok: true,
    error: null,
    polinomio,
    candidatos: candidatos.map(fTexto),
    raices,
    raicesEnteras,
    pasos,
    cocienteFinal,
    factorizacion: factores.join(' · ') || polinomio,
  };
}

/** Resuelve un caso de polinomio: factoriza y devuelve la raíz entera que se pide. */
export function resolverPolinomio(datos: DatosPolinomio): SolucionCaso {
  const analisis = analizarPolinomio(datos.coeficientes);
  if (!analisis.ok) {
    return { ...SIN_SOLUCION, error: analisis.error };
  }
  if (analisis.raicesEnteras.length === 0) {
    return {
      ...SIN_SOLUCION,
      error: 'Este polinomio no tiene ninguna raíz entera, así que no se puede pedir una.',
    };
  }

  const valor =
    datos.pide === 'raizMenor'
      ? analisis.raicesEnteras[0]
      : analisis.raicesEnteras[analisis.raicesEnteras.length - 1];

  const pasos = [
    `Polinomio: P(x) = ${analisis.polinomio}`,
    `Teorema de la raíz racional: los candidatos son los divisores del término independiente partidos por los del coeficiente principal, con los dos signos: ${analisis.candidatos.slice(0, 16).join(', ')}${analisis.candidatos.length > 16 ? ` … (${analisis.candidatos.length} en total)` : ''}.`,
    'Se prueban de menor a mayor valor absoluto: el que deja resto 0 en la división sintética es raíz, y (x − raíz) es factor.',
  ];
  analisis.pasos.forEach((paso, indice) => {
    pasos.push(
      `Ruffini ${indice + 1}: dividimos ${polinomioATexto(paso.coeficientes)} entre (x ${paso.raiz.n < 0 ? '+' : '−'} ${fTexto(frac(Math.abs(paso.raiz.n), paso.raiz.d))}) → cociente ${polinomioATexto(paso.resultado.slice(0, -1))}, resto ${fTexto(paso.resultado[paso.resultado.length - 1])}.`,
    );
  });
  pasos.push(
    `Raíces racionales encontradas: ${analisis.raices.map(fTexto).join(', ')}.`,
    `Factorización: P(x) = ${analisis.factorizacion}`,
    `Raíces enteras ordenadas: ${analisis.raicesEnteras.map((r) => formatearFlexible(r).replace('-', '−')).join(', ')}. La ${datos.pide === 'raizMenor' ? 'menor' : 'mayor'} es ${formatearFlexible(valor).replace('-', '−')}.`,
  );

  return { ok: true, valor, valorTexto: formatearFlexible(valor), pasos, error: null };
}

/**
 * Punto de entrada único: resuelve unos datos sean del tipo que sean. Es lo que permite
 * recalcular cualquier caso sin mirar su campo `respuesta`.
 */
export function resolverCaso(datos: DatosCaso): SolucionCaso {
  if (datos.tipo === 'lineal') return resolverLineal(datos);
  if (datos.tipo === 'cuadratica') return resolverCuadratica(datos);
  if (datos.tipo === 'sistema') return resolverSistema(datos);
  return resolverPolinomio(datos);
}

// ============================================================
// CORRECCIÓN DE LA RESPUESTA
// ============================================================

/**
 * Tolerancia de corrección: la mayor entre ±0,01 y el 1 % del valor esperado.
 *
 * El suelo absoluto evita castigar el redondeo en respuestas pequeñas (y hace que el 0
 * siga siendo corregible) y el porcentaje evita ser absurdamente estricto en las grandes.
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

/**
 * Definición de un caso: solo los DATOS y el texto. La respuesta y los pasos salen de los
 * resolutores de arriba, nunca escritos a mano (ver punto 1 de la cabecera).
 *
 * `pasosPrevios` recoge lo que ocurre ANTES de la forma reducida —quitar paréntesis,
 * eliminar denominadores, plantear la ecuación de un enunciado—, que es trabajo de
 * traducción y no de cálculo, y por eso no lo puede generar el resolutor.
 */
interface DefinicionCaso {
  id: number;
  titulo: string;
  enunciado: string;
  categoria: CategoriaCaso;
  datos: DatosCaso;
  etiquetaRespuesta: string;
  pista: string;
  pasosPrevios?: string[];
}

const DEFINICIONES: readonly DefinicionCaso[] = [
  // ---------------------------------------------------------- Lineales (1-3)
  {
    id: 1,
    titulo: 'Lineal directa',
    enunciado: 'Resuelve la ecuación 5x + 12 = 47.',
    categoria: 'abstracto',
    datos: { tipo: 'lineal', a: 5, b: 12, c: 0, d: 47 },
    etiquetaRespuesta: 'el valor de x',
    pista: 'Primero quita el 12 restando a los dos lados; después divide entre 5.',
  },
  {
    id: 2,
    titulo: 'Con paréntesis',
    enunciado: 'Resuelve la ecuación 4(x − 3) = 2x + 10.',
    categoria: 'abstracto',
    datos: { tipo: 'lineal', a: 4, b: -12, c: 2, d: 10 },
    etiquetaRespuesta: 'el valor de x',
    pista:
      'El 4 multiplica a TODO lo que hay dentro del paréntesis, también al −3: 4(x − 3) = 4x − 12.',
    pasosPrevios: [
      'Paso 0: quitar el paréntesis multiplicando el 4 por cada término de dentro.',
      '4(x − 3) = 4x − 12, así que la ecuación queda 4x − 12 = 2x + 10.',
    ],
  },
  {
    id: 3,
    titulo: 'Fracciones de un número',
    enunciado:
      'La mitad de un número más su cuarta parte suman 9. ¿Cuál es ese número? (Plantea x/2 + x/4 = 9.)',
    categoria: 'aplicado',
    datos: { tipo: 'lineal', a: 3, b: 0, c: 0, d: 36 },
    etiquetaRespuesta: 'el número (el valor de x)',
    pista:
      'Multiplica TODA la ecuación por el mínimo común múltiplo de los denominadores (aquí 4) y los denominadores desaparecen.',
    pasosPrevios: [
      'Paso 0: la ecuación de partida es x/2 + x/4 = 9.',
      'Multiplicamos los dos lados por 4, que es el mínimo común múltiplo de 2 y 4: 2x + x = 36.',
      'Sumamos los términos semejantes: 3x = 36.',
    ],
  },

  // ---------------------------------------------------------- Cuadráticas (4-7)
  {
    id: 4,
    titulo: 'Dos soluciones',
    enunciado: 'Resuelve x² − 5x + 6 = 0 y escribe la SOLUCIÓN MAYOR de las dos.',
    categoria: 'abstracto',
    datos: { tipo: 'cuadratica', a: 1, b: -5, c: 6, pide: 'mayor' },
    etiquetaRespuesta: 'la solución mayor',
    pista:
      'Δ = 25 − 24 = 1, así que la raíz cuadrada sale exacta y las dos soluciones son enteras.',
  },
  {
    id: 5,
    titulo: 'Solución doble',
    enunciado:
      'Resuelve x² − 6x + 9 = 0. El discriminante vale 0, así que solo hay una solución (doble): escríbela.',
    categoria: 'abstracto',
    datos: { tipo: 'cuadratica', a: 1, b: -6, c: 9, pide: 'doble' },
    etiquetaRespuesta: 'la solución doble',
    pista:
      'Cuando Δ = 0 la fórmula se reduce a x = −b / (2a): el ± deja de importar porque se suma y se resta cero.',
  },
  {
    id: 6,
    titulo: 'Sin soluciones reales',
    enunciado:
      'La ecuación x² + 2x + 5 = 0 no tiene soluciones reales. Demuéstralo: calcula su discriminante Δ y escribe su valor (será negativo).',
    categoria: 'abstracto',
    datos: { tipo: 'cuadratica', a: 1, b: 2, c: 5, pide: 'discriminante' },
    etiquetaRespuesta: 'el valor del discriminante Δ (con su signo)',
    pista:
      'Δ = b² − 4ac. Aquí no se pide una x, porque no existe ninguna real: se pide el número que lo prueba.',
  },
  {
    id: 7,
    titulo: 'Área de un terreno',
    enunciado:
      'Un terreno rectangular mide 3 metros más de largo que de ancho y su área es de 54 m². ¿Cuánto mide el ancho? (Plantea x(x + 3) = 54.)',
    categoria: 'aplicado',
    datos: { tipo: 'cuadratica', a: 1, b: 3, c: -54, pide: 'mayor' },
    etiquetaRespuesta: 'el ancho en metros (la solución positiva)',
    pista:
      'La ecuación da dos soluciones, pero una es negativa y un ancho no puede serlo: quédate con la positiva, que es la mayor.',
    pasosPrevios: [
      'Paso 0: si el ancho es x, el largo es x + 3 y el área es x(x + 3) = 54.',
      'Desarrollamos y pasamos todo a un lado: x² + 3x − 54 = 0.',
    ],
  },

  // ---------------------------------------------------------- Sistemas 2x2 (8-10)
  {
    id: 8,
    titulo: 'Compra de dos artículos',
    enunciado:
      'En una papelería, 3 cuadernos y 2 bolígrafos cuestan 31 unidades monetarias; 2 cuadernos y 5 bolígrafos cuestan 28. ¿Cuánto cuesta UN cuaderno?',
    categoria: 'aplicado',
    datos: { tipo: 'sistema', a1: 3, b1: 2, c1: 31, a2: 2, b2: 5, c2: 28, pide: 'x' },
    etiquetaRespuesta: 'el precio de un cuaderno (el valor de x)',
    pista:
      'Llama x al precio del cuaderno e y al del bolígrafo. Cada frase del enunciado es una ecuación.',
    pasosPrevios: [
      'Paso 0: x es el precio de un cuaderno e y el de un bolígrafo.',
      '«3 cuadernos y 2 bolígrafos cuestan 31» → 3x + 2y = 31.',
      '«2 cuadernos y 5 bolígrafos cuestan 28» → 2x + 5y = 28.',
    ],
  },
  {
    id: 9,
    titulo: 'Sistema incompatible',
    enunciado:
      'El sistema 2x + 3y = 7 / 4x + 6y = 9 tiene determinante principal 0, así que no hay solución única. Para saber si es incompatible o indeterminado se calcula det_x = c₁b₂ − c₂b₁. ¿Cuánto vale det_x?',
    categoria: 'abstracto',
    datos: { tipo: 'sistema', a1: 2, b1: 3, c1: 7, a2: 4, b2: 6, c2: 9, pide: 'determinanteX' },
    etiquetaRespuesta: 'el valor de det_x',
    pista:
      'La segunda ecuación tiene los coeficientes de la primera multiplicados por 2, pero el término independiente no: son rectas paralelas.',
  },
  {
    id: 10,
    titulo: 'Sistema indeterminado',
    enunciado:
      'En el sistema x − 2y = 3 / 3x − 6y = 9 la segunda ecuación es la primera multiplicada por 3. Calcula el determinante principal det = a₁b₂ − a₂b₁ y escribe su valor.',
    categoria: 'abstracto',
    datos: { tipo: 'sistema', a1: 1, b1: -2, c1: 3, a2: 3, b2: -6, c2: 9, pide: 'determinante' },
    etiquetaRespuesta: 'el valor del determinante principal det',
    pista:
      'Cuidado con los signos: b₁ y b₂ son negativos, y el producto de dos negativos es positivo.',
  },

  // ---------------------------------------------------------- Ruffini (11-12)
  {
    id: 11,
    titulo: 'Ruffini con tres raíces',
    enunciado:
      'Factoriza x³ − 4x² + x + 6 con la regla de Ruffini. Tiene tres raíces enteras: escribe la MENOR de las tres.',
    categoria: 'abstracto',
    datos: { tipo: 'polinomio', coeficientes: [1, -4, 1, 6], pide: 'raizMenor' },
    etiquetaRespuesta: 'la raíz entera menor (con su signo)',
    pista:
      'Los candidatos son los divisores de 6: ±1, ±2, ±3 y ±6. Prueba con los negativos, porque el término independiente es positivo y el polinomio cambia de signo.',
  },
  {
    id: 12,
    titulo: 'Volumen de una caja',
    enunciado:
      'Una caja tiene tres aristas consecutivas que miden x, x + 1 y x + 2 centímetros, y su volumen es de 60 cm³. Al desarrollar queda x³ + 3x² + 2x − 60 = 0. Halla con Ruffini la única raíz entera: es la arista más corta.',
    categoria: 'aplicado',
    datos: { tipo: 'polinomio', coeficientes: [1, 3, 2, -60], pide: 'raizMayor' },
    etiquetaRespuesta: 'la arista más corta en cm (la única raíz entera)',
    pista:
      'Busca entre los divisores de 60 y empieza por los pequeños: una arista tiene que ser positiva y el volumen es solo 60.',
    pasosPrevios: [
      'Paso 0: el volumen es el producto de las tres aristas: x(x + 1)(x + 2) = 60.',
      'Desarrollamos: x³ + 3x² + 2x = 60, es decir x³ + 3x² + 2x − 60 = 0.',
    ],
  },
];

/** Construye un caso resolviendo sus datos. Nada se teclea a mano. */
function construirCaso(def: DefinicionCaso): CasoAlgebra {
  const solucion = resolverCaso(def.datos);
  return {
    id: def.id,
    titulo: def.titulo,
    enunciado: def.enunciado,
    categoria: def.categoria,
    tipo: def.datos.tipo,
    datos: def.datos,
    etiquetaRespuesta: def.etiquetaRespuesta,
    respuesta: solucion.valor,
    respuestaTexto: solucion.valorTexto,
    pasos: [...(def.pasosPrevios ?? []), ...solucion.pasos],
    pista: def.pista,
  };
}

/**
 * Los 12 casos numerados, FIJOS y deterministas: el caso 3 es el mismo para todo el mundo
 * y en cualquier visita. Es lo que permite mandar «resuelve el 3, el 7 y el 11».
 */
export const CASOS: readonly CasoAlgebra[] = DEFINICIONES.map(construirCaso);

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

/** Entero uniforme en [min, max], ambos incluidos. */
function enteroEn(aleatorio: () => number, min: number, max: number): number {
  return min + Math.floor(aleatorio() * (max - min + 1));
}

/** Entero de [min, max] saltándose el 0, para no generar ejercicios triviales. */
function enteroNoNulo(aleatorio: () => number, min: number, max: number): number {
  let valor = 0;
  let intentos = 0;
  do {
    valor = enteroEn(aleatorio, min, max);
    intentos++;
  } while (valor === 0 && intentos < 12);
  return valor === 0 ? max : valor;
}

/**
 * Genera un ejercicio nuevo. Con `semilla` es reproducible; sin ella se toma una del
 * reloj (por eso NUNCA debe llamarse durante el render: el servidor y el navegador
 * obtendrían ejercicios distintos y React avisaría de una hidratación inconsistente).
 *
 * Los valores se eligen PARA QUE LA SOLUCIÓN SALGA LIMPIA: primero se decide la solución
 * entera y después se construyen los coeficientes a partir de ella. Sorteando los
 * coeficientes al azar saldrían soluciones como 17/23, imposibles de teclear bien.
 */
export function generarEjercicioAleatorio(semilla?: number): EjercicioAleatorio {
  const semillaReal =
    semilla !== undefined && Number.isFinite(semilla)
      ? Math.floor(Math.abs(semilla))
      : Math.floor(Date.now() % 2147483647);
  const aleatorio = creadorAleatorio(semillaReal);
  const sorteo = aleatorio();

  // --- Lineal: se fija x y se construyen los dos lados alrededor
  if (sorteo < 0.4) {
    const x = enteroNoNulo(aleatorio, -9, 12);
    const a = enteroEn(aleatorio, 2, 9);
    const c = enteroEn(aleatorio, 0, a - 1);
    const b = enteroEn(aleatorio, -9, 9);
    const d = a * x + b - c * x;
    const datos: DatosLineal = { tipo: 'lineal', a, b, c, d };
    const solucion = resolverLineal(datos);
    return {
      semilla: semillaReal,
      enunciado: `Resuelve la ecuación ${ecuacionLinealTexto(datos)} y escribe el valor de x.`,
      tipo: 'lineal',
      datos,
      etiquetaRespuesta: 'el valor de x',
      respuesta: solucion.valor,
      respuestaTexto: solucion.valorTexto,
      pasos: solucion.pasos,
      pista: 'Agrupa las x a un lado y los números al otro; después divide.',
    };
  }

  // --- Cuadrática: se fijan las dos raíces y se reconstruye (x − r₁)(x − r₂)
  if (sorteo < 0.75) {
    const r1 = enteroEn(aleatorio, -8, 8);
    let r2 = enteroEn(aleatorio, -8, 8);
    if (r2 === r1) r2 = r1 + 1;
    const b = -(r1 + r2);
    const c = r1 * r2;
    const datos: DatosCuadratica = { tipo: 'cuadratica', a: 1, b, c, pide: 'mayor' };
    const solucion = resolverCuadratica(datos);
    return {
      semilla: semillaReal,
      enunciado: `Resuelve ${ecuacionCuadraticaTexto(1, b, c)} y escribe la SOLUCIÓN MAYOR de las dos.`,
      tipo: 'cuadratica',
      datos,
      etiquetaRespuesta: 'la solución mayor',
      respuesta: solucion.valor,
      respuestaTexto: solucion.valorTexto,
      pasos: solucion.pasos,
      pista: 'Calcula primero Δ = b² − 4ac; si sale un cuadrado perfecto, las raíces son enteras.',
    };
  }

  // --- Sistema: se fijan x e y y se calculan los términos independientes
  const solucionX = enteroNoNulo(aleatorio, -6, 6);
  const solucionY = enteroNoNulo(aleatorio, -6, 6);
  let a1 = enteroNoNulo(aleatorio, -5, 5);
  let b1 = enteroNoNulo(aleatorio, -5, 5);
  let a2 = enteroNoNulo(aleatorio, -5, 5);
  let b2 = enteroNoNulo(aleatorio, -5, 5);
  if (a1 * b2 - a2 * b1 === 0) {
    // Filas proporcionales: el sistema no tendría solución única. Se rompe la proporción.
    b2 = b2 + 1 === 0 ? b2 + 2 : b2 + 1;
    if (a1 * b2 - a2 * b1 === 0) {
      a1 = 1;
      b1 = 1;
      a2 = 1;
      b2 = -1;
    }
  }
  const datos: DatosSistema = {
    tipo: 'sistema',
    a1,
    b1,
    c1: a1 * solucionX + b1 * solucionY,
    a2,
    b2,
    c2: a2 * solucionX + b2 * solucionY,
    pide: 'x',
  };
  const solucion = resolverSistema(datos);
  return {
    semilla: semillaReal,
    enunciado: `Resuelve el sistema ${ecuacionSistemaTexto(datos.a1, datos.b1, datos.c1)} / ${ecuacionSistemaTexto(datos.a2, datos.b2, datos.c2)} y escribe el valor de x.`,
    tipo: 'sistema',
    datos,
    etiquetaRespuesta: 'el valor de x',
    respuesta: solucion.valor,
    respuestaTexto: solucion.valorTexto,
    pasos: solucion.pasos,
    pista: 'Con la regla de Cramer: det = a₁b₂ − a₂b₁ y x = det_x / det.',
  };
}
