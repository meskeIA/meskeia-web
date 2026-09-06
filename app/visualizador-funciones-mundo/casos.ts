/**
 * Motor de los casos numerados de «Funciones que Gobiernan el Mundo».
 *
 * Vive fuera de page.tsx a propósito. El build compila la vista sin mirar si la
 * aritmética está bien: una parábola con el vértice mal calculado o un interés compuesto
 * con el exponente cambiado se renderizan igual de limpios que los correctos, y el error
 * solo se ve leyendo el número en pantalla. Aquí no hay React, ni DOM, ni estado: solo
 * funciones puras con entradas y salidas comprobables a mano (3·12 + 20 = 56,
 * 500 · 2⁴ = 8.000, 10⁴ = 10.000, vértice de −5t² + 30t en t = 3 → 45), que es como se
 * verifican.
 *
 * CONVENIO DE ERRORES: ninguna función lanza. Las que devuelven un número devuelven NaN
 * cuando el dato no tiene sentido; las que devuelven un objeto traen `ok: false` y un
 * `error` redactado. Un throw durante el render tumba la página entera, y aquí el dato lo
 * teclea quien usa la app.
 *
 * Cuatro decisiones que no son evidentes leyendo el código:
 *
 * 1. `evaluar` devuelve NaN para el logaritmo de cero o de un número negativo. No es una
 *    guarda defensiva: es el error conceptual que aparece en cuanto alguien intenta
 *    empezar una escala logarítmica «desde el principio», y decirlo vale más que enseñar
 *    un −Infinity que nadie sabe interpretar. Por el mismo motivo comprueba
 *    `Number.isFinite` en la exponencial: 2^5000 no es «un número muy grande», es
 *    Infinity, y multiplicado por cualquier cosa contamina el resto de la cuenta.
 *
 * 2. La tolerancia de corrección es la MAYOR entre ±0,01 y el 1 % del valor esperado.
 *    Con una tolerancia solo absoluta, acertar 3.257,79 exigiría teclear cuatro decimales
 *    de un interés compuesto; con una tolerancia solo relativa, un resultado pequeño como
 *    1,5 se corregiría con una exigencia absurda. Los dos criterios juntos aceptan el
 *    redondeo razonable en toda la escala de respuestas de esta app.
 *
 * 3. Un caso NO guarda su respuesta: guarda sus PARÁMETROS, y la respuesta la calcula
 *    `resolverCaso` a partir de ellos. Un caso con la solución escrita a mano puede
 *    contradecir a la fórmula sin que nada se queje, y es exactamente el fallo que
 *    rompería la utilidad del modo Casos: un profesor manda «resuelve el 3, el 7 y el 11»
 *    y la corrección tiene que ser la misma para toda la clase. Por lo mismo, la tabla del
 *    caso 12 se GENERA evaluando la función: si los pares (x, y) se teclearan, podrían
 *    dejar de cumplir la razón que el propio caso pide identificar.
 *
 * 4. `generarEjercicioAleatorio` es determinista a partir de su semilla, y solo produce
 *    combinaciones cuyo resultado sale exacto. Un ejercicio de práctica con la respuesta
 *    en 18,857142857… no enseña nada sobre funciones: enseña sobre redondeo, que es otra
 *    asignatura.
 */

import { formatNumber } from '@/lib';

// ============================================================
// TIPOS
// ============================================================

/** Las cuatro familias de funciones que explica la app. */
export type TipoFuncion = 'lineal' | 'cuadratica' | 'exponencial' | 'logaritmica';

/** Qué se pide calcular en un caso. */
export type TipoCalculo =
  | 'evaluar'
  | 'pendiente'
  | 'raiz'
  | 'vertice-x'
  | 'vertice-y'
  | 'razon-logaritmica'
  | 'cruce'
  | 'identificar-razon';

/**
 * Coeficientes de una función, en su forma canónica según la familia:
 *
 * - lineal:       y = m·x + b
 * - cuadrática:   y = a·x² + b·x + c
 * - exponencial:  y = a0 · base^(x / periodo)
 * - logarítmica:  y = k · log_baseLog(x) + b
 *
 * Van todos opcionales y con valor por defecto en `evaluar` porque cada familia usa unos
 * pocos: obligar a rellenar los nueve llenaría cada caso de ceros que no significan nada.
 */
export interface ParametrosFuncion {
  /** Pendiente de la recta. */
  m?: number;
  /** Término independiente de la recta, coeficiente lineal de la parábola o desplazamiento del logaritmo. */
  b?: number;
  /** Coeficiente cuadrático. */
  a?: number;
  /** Término independiente de la parábola. */
  c?: number;
  /** Valor inicial de la exponencial. */
  a0?: number;
  /** Factor por el que se multiplica cada periodo. */
  base?: number;
  /** Duración de un periodo, en las mismas unidades que x. */
  periodo?: number;
  /** Factor de escala del logaritmo. */
  k?: number;
  /** Base del logaritmo. */
  baseLog?: number;
}

/** Un par (x, y) de una tabla de valores. */
export interface PuntoTabla {
  x: number;
  y: number;
}

/**
 * Cómo colocar la gráfica de la app para acompañar un caso.
 *
 * `parametro` es el valor del deslizador (1 a 10), no un coeficiente del caso: la gráfica
 * dibuja la versión más simple y creciente de cada familia, así que sirve para comparar la
 * FORMA del crecimiento, nunca para leer el resultado.
 */
export interface SugerenciaGrafica {
  funcion: TipoFuncion;
  parametro: number;
}

/** Resultado de resolver un caso, con el razonamiento ya redactado. */
export interface SolucionCaso {
  ok: boolean;
  valor: number;
  pasos: string[];
  error: string | null;
}

/** Un caso numerado, con su solución ya calculada a partir de los parámetros. */
export interface CasoFuncion {
  id: number;
  titulo: string;
  enunciado: string;
  categoria: 'abstracto' | 'aplicado';
  tipoFuncion: TipoFuncion;
  calculo: TipoCalculo;
  parametros: ParametrosFuncion;
  /** Segunda función, solo en el caso que enfrenta dos crecimientos. */
  parametrosSecundarios: ParametrosFuncion | null;
  /** Punto donde se evalúa la función, cuando el cálculo lo necesita. */
  x: number | null;
  /** La fórmula escrita, para enseñarla junto al enunciado. */
  expresion: string;
  /** Tabla de pares (x, y) generada desde los parámetros, solo en el caso de identificar. */
  tabla: readonly PuntoTabla[] | null;
  /** Unidad o naturaleza del número que se pide. Nunca vacía. */
  etiquetaRespuesta: string;
  respuesta: number;
  respuestaTexto: string;
  requiereRedondeo: boolean;
  pasos: string[];
  pista: string;
  grafica: SugerenciaGrafica | null;
}

/** Ejercicio generado al vuelo: la misma forma que un caso, pero sin número fijo. */
export interface EjercicioFuncion {
  semilla: number;
  enunciado: string;
  tipoFuncion: TipoFuncion;
  parametros: ParametrosFuncion;
  x: number | null;
  expresion: string;
  etiquetaRespuesta: string;
  respuesta: number;
  respuestaTexto: string;
  requiereRedondeo: boolean;
  pasos: string[];
  grafica: SugerenciaGrafica;
}

/** Veredicto de comprobar la respuesta que ha tecleado quien usa la app. */
export interface Comprobacion {
  correcto: boolean;
  motivo: 'acertado' | 'fallado' | 'no-numerico';
  diferencia: number;
  tolerancia: number;
}

// ============================================================
// AUXILIARES DE FORMATO Y REDONDEO
// ============================================================

/** Redondea a `decimales` para no arrastrar el ruido binario del punto flotante. */
export function redondear(valor: number, decimales: number): number {
  const factor = 10 ** decimales;
  return Math.round(valor * factor) / factor;
}

/**
 * Formatea con los decimales que el número necesita de verdad, hasta un máximo.
 * Así 56 se escribe «56» y no «56,0000», pero 3.257,7893 conserva su precisión.
 */
export function formatearFlexible(valor: number, maxDecimales = 4): string {
  if (!Number.isFinite(valor)) return 'no definido';
  for (let d = 0; d < maxDecimales; d++) {
    if (Math.abs(valor - redondear(valor, d)) < 1e-9) return formatNumber(valor, d);
  }
  return formatNumber(valor, maxDecimales);
}

/** Nombre legible de una familia, para redactar los pasos sin repetir condicionales. */
export function nombreFamilia(tipo: TipoFuncion): string {
  switch (tipo) {
    case 'lineal':
      return 'lineal';
    case 'cuadratica':
      return 'cuadrática';
    case 'exponencial':
      return 'exponencial';
    case 'logaritmica':
      return 'logarítmica';
  }
}

// ============================================================
// NÚCLEO: EVALUAR CADA FAMILIA
// ============================================================

/**
 * Valor de la función en el punto x. Devuelve NaN —nunca lanza, nunca ±Infinity— cuando
 * los datos no tienen sentido matemático: logaritmo de un número no positivo, base de
 * logaritmo inválida, periodo nulo o una potencia que se sale del rango representable.
 */
export function evaluar(tipo: TipoFuncion, p: ParametrosFuncion, x: number): number {
  if (!Number.isFinite(x)) return NaN;

  let valor = NaN;

  if (tipo === 'lineal') {
    const m = p.m ?? 1;
    const b = p.b ?? 0;
    if (!Number.isFinite(m) || !Number.isFinite(b)) return NaN;
    valor = m * x + b;
  } else if (tipo === 'cuadratica') {
    const a = p.a ?? 1;
    const b = p.b ?? 0;
    const c = p.c ?? 0;
    if (!Number.isFinite(a) || !Number.isFinite(b) || !Number.isFinite(c)) return NaN;
    valor = a * x * x + b * x + c;
  } else if (tipo === 'exponencial') {
    const a0 = p.a0 ?? 1;
    const base = p.base ?? 2;
    const periodo = p.periodo ?? 1;
    if (!Number.isFinite(a0) || !Number.isFinite(base) || !Number.isFinite(periodo)) return NaN;
    // Base no positiva: b^x deja de estar definida para exponentes no enteros.
    if (base <= 0) return NaN;
    if (periodo === 0) return NaN;
    valor = a0 * Math.pow(base, x / periodo);
  } else {
    const k = p.k ?? 1;
    const b = p.b ?? 0;
    const baseLog = p.baseLog ?? 10;
    if (!Number.isFinite(k) || !Number.isFinite(b) || !Number.isFinite(baseLog)) return NaN;
    // El logaritmo solo existe para x > 0, y su base tiene que ser positiva y distinta de 1.
    if (x <= 0) return NaN;
    if (baseLog <= 0 || baseLog === 1) return NaN;
    valor = k * (Math.log(x) / Math.log(baseLog)) + b;
  }

  return Number.isFinite(valor) ? valor : NaN;
}

/**
 * Pendiente media entre dos puntos: m = (y₂ − y₁) / (x₂ − x₁).
 * En una función lineal coincide con su m; en las demás es la pendiente de la cuerda.
 */
export function pendienteEntre(
  tipo: TipoFuncion,
  p: ParametrosFuncion,
  x1: number,
  x2: number,
): number {
  if (x1 === x2) return NaN;
  const y1 = evaluar(tipo, p, x1);
  const y2 = evaluar(tipo, p, x2);
  if (!Number.isFinite(y1) || !Number.isFinite(y2)) return NaN;
  return (y2 - y1) / (x2 - x1);
}

/** Punto donde una recta corta el eje x: y = 0 ⇒ x = −b / m. NaN si la recta es horizontal. */
export function raizLineal(p: ParametrosFuncion): number {
  const m = p.m ?? 1;
  const b = p.b ?? 0;
  if (!Number.isFinite(m) || !Number.isFinite(b) || m === 0) return NaN;
  return -b / m;
}

/** Vértice de una parábola: x = −b / (2a), y = f(x). NaN si a = 0 (entonces no hay parábola). */
export function verticeCuadratica(p: ParametrosFuncion): { x: number; y: number } {
  const a = p.a ?? 1;
  const b = p.b ?? 0;
  if (!Number.isFinite(a) || !Number.isFinite(b) || a === 0) return { x: NaN, y: NaN };
  const xv = -b / (2 * a);
  return { x: xv, y: evaluar('cuadratica', p, xv) };
}

/**
 * Primer valor ENTERO de x en el que la exponencial supera a la lineal.
 *
 * Se busca por pasos enteros y no despejando, porque la pregunta de clase es «¿en qué
 * semana adelanta?» y su respuesta es un número de semana, no el instante exacto del corte.
 * Devuelve NaN si no adelanta dentro del horizonte, para no inventar un momento que no hay.
 */
export function primerCruceEntero(
  expo: ParametrosFuncion,
  lineal: ParametrosFuncion,
  maxPasos = 1000,
): number {
  for (let t = 1; t <= maxPasos; t++) {
    const ye = evaluar('exponencial', expo, t);
    const yl = evaluar('lineal', lineal, t);
    if (!Number.isFinite(ye) || !Number.isFinite(yl)) return NaN;
    if (ye > yl) return t;
  }
  return NaN;
}

/** Tabla de pares (x, y) generada evaluando la función. Descarta los puntos no definidos. */
export function tablaDe(
  tipo: TipoFuncion,
  p: ParametrosFuncion,
  xs: readonly number[],
): PuntoTabla[] {
  return xs
    .map((x) => ({ x, y: evaluar(tipo, p, x) }))
    .filter((punto) => Number.isFinite(punto.y));
}

/**
 * Razón constante de una tabla: el cociente entre cada valor y el anterior, si todos
 * coinciden. NaN si hay algún término nulo (no se puede dividir) o si los cocientes
 * discrepan, porque entonces la función no es exponencial y la pregunta no tiene respuesta.
 */
export function razonConstante(tabla: readonly PuntoTabla[]): number {
  if (tabla.length < 2) return NaN;
  const primera = tabla[1].y / tabla[0].y;
  if (!Number.isFinite(primera)) return NaN;
  for (let i = 1; i < tabla.length - 1; i++) {
    if (tabla[i].y === 0) return NaN;
    const cociente = tabla[i + 1].y / tabla[i].y;
    if (!Number.isFinite(cociente)) return NaN;
    if (Math.abs(cociente - primera) > Math.abs(primera) * 1e-9 + 1e-12) return NaN;
  }
  return primera;
}

// ============================================================
// COMPROBACIÓN DE RESPUESTAS
// ============================================================

/**
 * Tolerancia de corrección: la mayor entre ±0,01 y el 1 % del valor esperado.
 * Ver el punto 2 de la cabecera: los dos criterios juntos cubren toda la escala.
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
// RESOLUCIÓN CON PASOS ESCRITOS
// ============================================================

/** Definición de un caso: solo los DATOS. La respuesta y los pasos salen de resolverCaso. */
export interface DefinicionCaso {
  id: number;
  titulo: string;
  enunciado: string;
  categoria: 'abstracto' | 'aplicado';
  tipoFuncion: TipoFuncion;
  calculo: TipoCalculo;
  parametros: ParametrosFuncion;
  parametrosSecundarios?: ParametrosFuncion;
  x?: number;
  /** Puntos en los que se genera la tabla del caso de identificar. */
  xsTabla?: readonly number[];
  expresion: string;
  etiquetaRespuesta: string;
  pista: string;
  grafica: SugerenciaGrafica | null;
}

/**
 * Atajo local: los pasos formatean decenas de números y escribir `formatearFlexible(...)`
 * en cada hueco de plantilla los volvería ilegibles.
 */
const f = formatearFlexible;

/**
 * Une sumandos saltandose los que valen cero y con el signo delante: «-45 + 90», nunca
 * «-45 + 90 + 0». Un «+ 0» arrastrado en cada paso hace dudar de si falta un dato.
 */
function sumaVisible(valores: readonly number[]): string {
  const utiles = valores.filter((v) => v !== 0);
  if (utiles.length === 0) return f(0);
  return utiles
    .map((v, i) => (i === 0 ? f(v) : v < 0 ? `- ${f(Math.abs(v))}` : `+ ${f(v)}`))
    .join(' ');
}

/** La parabola escrita en forma de polinomio, sin los terminos nulos. */
function polinomioCuadratico(a: number, b: number, c: number): string {
  const partes = [`${f(a)}·x²`];
  if (b !== 0) partes.push(b < 0 ? `- ${f(Math.abs(b))}·x` : `+ ${f(b)}·x`);
  if (c !== 0) partes.push(c < 0 ? `- ${f(Math.abs(c))}` : `+ ${f(c)}`);
  return partes.join(' ');
}

/** La misma parabola con un valor concreto ya sustituido en la x. */
function sustitucionCuadratica(a: number, b: number, c: number, x: number): string {
  const partes = [`${f(a)} · ${f(x)}²`];
  if (b !== 0) partes.push(b < 0 ? `- ${f(Math.abs(b))} · ${f(x)}` : `+ ${f(b)} · ${f(x)}`);
  if (c !== 0) partes.push(c < 0 ? `- ${f(Math.abs(c))}` : `+ ${f(c)}`);
  return partes.join(' ');
}

/** Pasos de evaluar una función en un punto, redactados según la familia. */
function pasosEvaluar(tipo: TipoFuncion, p: ParametrosFuncion, x: number, valor: number): string[] {
  if (tipo === 'lineal') {
    const m = p.m ?? 1;
    const b = p.b ?? 0;
    return [
      'La situación es LINEAL: una parte fija que no cambia más otra que crece siempre al mismo ritmo. Su forma es y = m·x + b.',
      `Aquí m = ${f(m)} (lo que suma cada unidad de x) y b = ${f(b)} (la parte fija, lo que vale y cuando x = 0).`,
      `Sustituimos x = ${f(x)}: y = ${f(m)} · ${f(x)} + ${f(b)}`,
      `Multiplicamos: y = ${f(m * x)} + ${f(b)}`,
      `Sumamos: y = ${f(valor)}`,
    ];
  }

  if (tipo === 'cuadratica') {
    const a = p.a ?? 1;
    const b = p.b ?? 0;
    const c = p.c ?? 0;
    return [
      'La situación es CUADRÁTICA: y = a·x² + b·x + c. Su gráfica es una parábola.',
      `Aquí a = ${f(a)}, b = ${f(b)} y c = ${f(c)}, así que la función es y = ${polinomioCuadratico(a, b, c)}.`,
      `Sustituimos x = ${f(x)}: y = ${sustitucionCuadratica(a, b, c, x)}`,
      `Elevamos al cuadrado y multiplicamos: y = ${sumaVisible([a * x * x, b * x, c])}`,
      `Sumamos: y = ${f(valor)}`,
    ];
  }

  if (tipo === 'exponencial') {
    const a0 = p.a0 ?? 1;
    const base = p.base ?? 2;
    const periodo = p.periodo ?? 1;
    const exponente = x / periodo;
    const factor = Math.pow(base, exponente);
    const pasos = [
      'La situación es EXPONENCIAL: cada periodo MULTIPLICA por un mismo factor, en vez de sumar una cantidad fija. Su forma es y = a₀ · b^(x/p).',
      `Aquí a₀ = ${f(a0)} (valor de partida), b = ${f(base)} (el factor de cada periodo) y p = ${f(periodo)} (lo que dura un periodo).`,
      `Sustituimos x = ${f(x)}: el exponente vale ${f(x)} / ${f(periodo)} = ${f(exponente)}, así que y = ${f(a0)} · ${f(base)}^${f(exponente)}`,
      `Calculamos la potencia: ${f(base)}^${f(exponente)} = ${f(factor)}`,
      `Multiplicamos por el valor de partida: y = ${f(a0)} · ${f(factor)} = ${f(valor)}`,
    ];
    if (base < 1) {
      pasos.push(
        `Como la base es menor que 1, la función DECRECE: cada periodo se queda en el ${f(base * 100)} % de lo que había. Eso es exactamente lo que significa una vida media.`,
      );
    }
    return pasos;
  }

  const k = p.k ?? 1;
  const b = p.b ?? 0;
  const baseLog = p.baseLog ?? 10;
  const logX = Math.log10(x);
  const logBase = Math.log10(baseLog);
  const pasos = [
    'Un LOGARITMO responde a la pregunta «¿a qué exponente hay que elevar la base para obtener este número?». Es la operación que despeja un exponente.',
    `Aquí la base es ${f(baseLog)} y el número es ${f(x)}, así que buscamos el exponente y tal que ${f(baseLog)}^y = ${f(x)}.`,
    `Se despeja con el cambio de base: y = log(${f(x)}) / log(${f(baseLog)}). Vale cualquier base de logaritmo mientras sea la misma arriba y abajo; aquí se usan logaritmos decimales.`,
    `log(${f(x)}) = ${f(logX)} y log(${f(baseLog)}) = ${f(logBase)}`,
    `Dividimos (con todos los decimales, no solo los que se muestran arriba): y = ${f(logX)} / ${f(logBase)} = ${f(logX / logBase)}`,
  ];
  if (k !== 1 || b !== 0) {
    pasos.push(
      `Y aplicamos la escala de la función, y = k · log + b, con k = ${f(k)} y b = ${f(b)}: y = ${f(valor)}`,
    );
  }
  return pasos;
}

/**
 * Resuelve un caso a partir de sus parámetros. Ninguna respuesta se teclea a mano:
 * ver el punto 3 de la cabecera.
 */
export function resolverCaso(def: DefinicionCaso): SolucionCaso {
  const p = def.parametros;
  const sinDatos: SolucionCaso = {
    ok: false,
    valor: NaN,
    pasos: [],
    error: 'Este caso no tiene los datos que necesita su cálculo.',
  };

  if (def.calculo === 'evaluar') {
    if (def.x === undefined) return sinDatos;
    const valor = evaluar(def.tipoFuncion, p, def.x);
    if (!Number.isFinite(valor)) {
      return { ...sinDatos, error: 'La función no está definida en ese punto.' };
    }
    return { ok: true, valor, pasos: pasosEvaluar(def.tipoFuncion, p, def.x, valor), error: null };
  }

  if (def.calculo === 'pendiente') {
    if (def.x === undefined) return sinDatos;
    const x1 = 0;
    const x2 = def.x;
    const y1 = evaluar(def.tipoFuncion, p, x1);
    const y2 = evaluar(def.tipoFuncion, p, x2);
    const m = pendienteEntre(def.tipoFuncion, p, x1, x2);
    if (!Number.isFinite(m)) return { ...sinDatos, error: 'No se puede calcular la pendiente.' };
    return {
      ok: true,
      valor: m,
      pasos: [
        'La PENDIENTE m es lo que sube y cada vez que x aumenta una unidad. Con dos puntos cualesquiera de la recta: m = (y₂ − y₁) / (x₂ − x₁).',
        `Primer punto, el de partida: x₁ = ${f(x1)}, y₁ = ${f(y1)}.`,
        `Segundo punto, el que da el enunciado: x₂ = ${f(x2)}, y₂ = ${f(y2)}.`,
        `Sustituimos: m = (${f(y2)} − ${f(y1)}) / (${f(x2)} − ${f(x1)}) = ${f(y2 - y1)} / ${f(x2 - x1)}`,
        `Dividimos: m = ${f(m)}`,
        'Que la pendiente sea la misma con cualquier pareja de puntos es justo lo que define a una función lineal.',
      ],
      error: null,
    };
  }

  if (def.calculo === 'raiz') {
    const valor = raizLineal(p);
    if (!Number.isFinite(valor)) {
      return { ...sinDatos, error: 'Esta recta no corta el eje: no hay solución.' };
    }
    const m = p.m ?? 1;
    const b = p.b ?? 0;
    return {
      ok: true,
      valor,
      pasos: [
        `La cantidad que queda es LINEAL: y = m·x + b, con b = ${f(b)} (lo que hay al empezar) y m = ${f(m)} (lo que cambia cada unidad de x).`,
        `Que llegue a cero significa y = 0. Planteamos la ecuación: ${f(m)}·x + ${f(b)} = 0`,
        `Pasamos el término independiente al otro lado: ${f(m)}·x = ${f(-b)}`,
        `Despejamos x = −b / m = ${f(-b)} / ${f(m)}`,
        `x = ${f(valor)}`,
      ],
      error: null,
    };
  }

  if (def.calculo === 'vertice-x' || def.calculo === 'vertice-y') {
    const vertice = verticeCuadratica(p);
    if (!Number.isFinite(vertice.x) || !Number.isFinite(vertice.y)) {
      return { ...sinDatos, error: 'Sin coeficiente cuadrático no hay parábola ni vértice.' };
    }
    const a = p.a ?? 1;
    const b = p.b ?? 0;
    const c = p.c ?? 0;
    const abreAbajo = a < 0;
    const pasos = [
      `La función es CUADRÁTICA: y = ${polinomioCuadratico(a, b, c)}. Su gráfica es una parábola y, como a ${abreAbajo ? 'es negativo, abre hacia ABAJO: tiene un MÁXIMO' : 'es positivo, abre hacia ARRIBA: tiene un MÍNIMO'}.`,
      'El vértice —el punto más alto o más bajo— está siempre en x = −b / (2·a). Esta fórmula no hay que deducirla cada vez: es la mitad exacta entre las dos raíces.',
      `Sustituimos: x = ${f(-b)} / (2 · ${f(a)}) = ${f(-b)} / ${f(2 * a)} = ${f(vertice.x)}`,
    ];
    if (def.calculo === 'vertice-y') {
      pasos.push(
        `Ese es el valor de x donde está el ${abreAbajo ? 'máximo' : 'mínimo'}. Para saber CUÁNTO vale ahí, se sustituye en la función: y = ${sustitucionCuadratica(a, b, c, vertice.x)}`,
        `Operamos: y = ${sumaVisible([a * vertice.x * vertice.x, b * vertice.x, c])} = ${f(vertice.y)}`,
      );
      return { ok: true, valor: vertice.y, pasos, error: null };
    }
    pasos.push(
      `Ese es el valor de x que se pedía: ${f(vertice.x)}. Sustituyéndolo en la función se obtiene además el valor máximo, ${f(vertice.y)}, que es la otra coordenada del vértice.`,
    );
    return { ok: true, valor: vertice.x, pasos, error: null };
  }

  if (def.calculo === 'razon-logaritmica') {
    if (def.x === undefined) return sinDatos;
    const baseLog = p.baseLog ?? 10;
    const valor = Math.pow(baseLog, def.x);
    if (!Number.isFinite(valor)) {
      return { ...sinDatos, error: 'La razón se sale del rango representable.' };
    }
    return {
      ok: true,
      valor,
      pasos: [
        `Una escala LOGARÍTMICA no suma: multiplica. Cada unidad de la escala equivale a multiplicar por ${f(baseLog)} la magnitud real que se está midiendo.`,
        `Aquí la diferencia es de ${f(def.x)} unidades de la escala, así que hay que multiplicar por ${f(baseLog)} esas ${f(def.x)} veces seguidas.`,
        `Eso es una potencia: razón = ${f(baseLog)}^${f(def.x)}`,
        `Calculamos: ${f(baseLog)}^${f(def.x)} = ${f(valor)}`,
        'Por eso las escalas logarítmicas comprimen tanto: unos pocos puntos de diferencia esconden multiplicaciones enormes.',
      ],
      error: null,
    };
  }

  if (def.calculo === 'cruce') {
    const secundarios = def.parametrosSecundarios;
    if (secundarios === undefined) return sinDatos;
    const cruce = primerCruceEntero(p, secundarios);
    if (!Number.isFinite(cruce)) {
      return { ...sinDatos, error: 'La exponencial no adelanta a la lineal en el horizonte previsto.' };
    }
    const antes = cruce - 1;
    const lejos = cruce + 4;
    return {
      ok: true,
      valor: cruce,
      pasos: [
        `La lineal es y = ${f(secundarios.m ?? 1)}·x + ${f(secundarios.b ?? 0)}: SUMA siempre la misma cantidad. La exponencial es y = ${f(p.a0 ?? 1)} · ${f(p.base ?? 2)}^(x/${f(p.periodo ?? 1)}): MULTIPLICA por el mismo factor.`,
        `Al principio la lineal va muy por delante. En x = 1: lineal = ${f(evaluar('lineal', secundarios, 1))} frente a exponencial = ${f(evaluar('exponencial', p, 1))}.`,
        `Se comprueban los valores enteros uno a uno. En x = ${f(antes)}: lineal = ${f(evaluar('lineal', secundarios, antes))} y exponencial = ${f(evaluar('exponencial', p, antes))}. La lineal todavía gana.`,
        `En x = ${f(cruce)}: lineal = ${f(evaluar('lineal', secundarios, cruce))} y exponencial = ${f(evaluar('exponencial', p, cruce))}. La exponencial ADELANTA por primera vez.`,
        `Y a partir de ahí la distancia se dispara: en x = ${f(lejos)} la lineal vale ${f(evaluar('lineal', secundarios, lejos))} y la exponencial ${f(evaluar('exponencial', p, lejos))}.`,
        'Esta es la idea central de toda la app: una exponencial siempre acaba superando a cualquier lineal, por muy pequeña que empiece. La única pregunta es CUÁNDO.',
      ],
      error: null,
    };
  }

  // identificar-razon
  const xs = def.xsTabla ?? [];
  const tabla = tablaDe(def.tipoFuncion, p, xs);
  const razon = razonConstante(tabla);
  if (!Number.isFinite(razon)) {
    return { ...sinDatos, error: 'Esta tabla no tiene una razón constante.' };
  }
  const diferencias = tabla
    .slice(1)
    .map((punto, i) => `${f(punto.y)} − ${f(tabla[i].y)} = ${f(punto.y - tabla[i].y)}`)
    .join('; ');
  const cocientes = tabla
    .slice(1)
    .map((punto, i) => `${f(punto.y)} / ${f(tabla[i].y)} = ${f(punto.y / tabla[i].y)}`)
    .join('; ');
  return {
    ok: true,
    valor: razon,
    pasos: [
      'Para identificar una función a partir de una tabla se miran dos cosas, y siempre en este orden.',
      `Primero, las DIFERENCIAS entre valores consecutivos: ${diferencias}. No son iguales, así que la función NO es lineal (en una lineal la diferencia sería siempre la misma).`,
      `Segundo, los COCIENTES: ${cocientes}. Todos valen lo mismo.`,
      `Cuando el cociente es constante, la función es EXPONENCIAL: cada paso multiplica por esa razón. Aquí la razón vale ${f(razon)}.`,
      `La función completa es y = ${f(evaluar(def.tipoFuncion, p, 0))} · ${f(razon)}^x, y con ella se puede predecir cualquier término que no esté en la tabla.`,
    ],
    error: null,
  };
}

// ============================================================
// LOS 12 CASOS NUMERADOS
// ============================================================

const DEFINICIONES: readonly DefinicionCaso[] = [
  {
    id: 1,
    titulo: 'Cuota fija más consumo',
    enunciado:
      'Un plan de datos cobra 20 unidades monetarias fijas al mes más 3 unidades por cada giga extra que se consuma. ¿Cuánto se paga en un mes en el que se consumen 12 gigas extra?',
    categoria: 'aplicado',
    tipoFuncion: 'lineal',
    calculo: 'evaluar',
    parametros: { m: 3, b: 20 },
    x: 12,
    expresion: 'C(x) = 3·x + 20',
    etiquetaRespuesta: 'unidades monetarias',
    pista: 'La cuota fija se paga aunque no se consuma nada: es el valor de la función cuando x = 0.',
    grafica: { funcion: 'lineal', parametro: 3 },
  },
  {
    id: 2,
    titulo: 'Averiguar el precio por unidad',
    enunciado:
      'Un recibo del agua parte de una cuota fija de 12 unidades monetarias y, con 40 metros cúbicos consumidos, asciende a 72 unidades monetarias. Si el coste por metro cúbico es constante, ¿cuánto cuesta cada metro cúbico?',
    categoria: 'abstracto',
    tipoFuncion: 'lineal',
    calculo: 'pendiente',
    parametros: { m: 1.5, b: 12 },
    x: 40,
    expresion: 'R(x) = m·x + 12',
    etiquetaRespuesta: 'unidades monetarias por metro cúbico',
    pista: 'La cuota fija no depende del consumo: réstala del total antes de repartir entre los metros cúbicos.',
    grafica: { funcion: 'lineal', parametro: 2 },
  },
  {
    id: 3,
    titulo: 'El depósito que se vacía',
    enunciado:
      'Un depósito contiene 4.500 litros y una fuga le hace perder 180 litros cada hora, siempre al mismo ritmo. ¿Cuántas horas tarda en quedarse vacío?',
    categoria: 'aplicado',
    tipoFuncion: 'lineal',
    calculo: 'raiz',
    parametros: { m: -180, b: 4500 },
    expresion: 'V(x) = −180·x + 4.500',
    etiquetaRespuesta: 'horas',
    pista: 'Vaciarse significa que la función vale cero. La pendiente es negativa porque la cantidad baja.',
    grafica: null,
  },
  {
    id: 4,
    titulo: 'La altura máxima del lanzamiento',
    enunciado:
      'Se lanza un objeto verticalmente hacia arriba desde el suelo a 30 metros por segundo. Su altura en metros a los t segundos es h(t) = −5·t² + 30·t. ¿Qué altura máxima alcanza?',
    categoria: 'aplicado',
    tipoFuncion: 'cuadratica',
    calculo: 'vertice-y',
    parametros: { a: -5, b: 30, c: 0 },
    expresion: 'h(t) = −5·t² + 30·t',
    etiquetaRespuesta: 'metros',
    pista: 'El punto más alto de una parábola es su vértice, y su abscisa sale de x = −b / (2·a).',
    grafica: { funcion: 'cuadratica', parametro: 5 },
  },
  {
    id: 5,
    titulo: 'El terreno más grande con la misma valla',
    enunciado:
      'Se dispone de 40 metros de valla para cerrar un terreno rectangular. Si un lado mide x metros, el otro mide 20 − x, y el área es A(x) = −x² + 20·x. ¿Cuánto debe medir x para que el área sea la mayor posible?',
    categoria: 'abstracto',
    tipoFuncion: 'cuadratica',
    calculo: 'vertice-x',
    parametros: { a: -1, b: 20, c: 0 },
    expresion: 'A(x) = −x² + 20·x',
    etiquetaRespuesta: 'metros (el lado x)',
    pista: 'Aquí no se pide el área, sino el lado que la hace máxima: la coordenada x del vértice.',
    grafica: { funcion: 'cuadratica', parametro: 3 },
  },
  {
    id: 6,
    titulo: 'Interés compuesto a diez años',
    enunciado:
      'Se depositan 2.000 unidades monetarias en un producto de ahorro que rinde un 5 % anual con interés compuesto: cada año el saldo se multiplica por 1,05. ¿Cuánto habrá al cabo de 10 años?',
    categoria: 'aplicado',
    tipoFuncion: 'exponencial',
    calculo: 'evaluar',
    parametros: { a0: 2000, base: 1.05, periodo: 1 },
    x: 10,
    expresion: 'S(x) = 2.000 · 1,05^x',
    etiquetaRespuesta: 'unidades monetarias',
    pista: 'No es 2.000 más el 5 % diez veces: cada año los intereses también generan intereses. Redondea a 2 decimales.',
    grafica: { funcion: 'exponencial', parametro: 1 },
  },
  {
    id: 7,
    titulo: 'Bacterias que se duplican',
    enunciado:
      'Un cultivo empieza con 500 bacterias y su número se duplica cada 3 horas. ¿Cuántas bacterias hay a las 12 horas?',
    categoria: 'aplicado',
    tipoFuncion: 'exponencial',
    calculo: 'evaluar',
    parametros: { a0: 500, base: 2, periodo: 3 },
    x: 12,
    expresion: 'N(x) = 500 · 2^(x/3)',
    etiquetaRespuesta: 'bacterias',
    pista: 'En 12 horas caben 12 / 3 = 4 duplicaciones. Duplicar cuatro veces es multiplicar por 2⁴, no por 8.',
    grafica: { funcion: 'exponencial', parametro: 10 },
  },
  {
    id: 8,
    titulo: 'Vida media de un isótopo',
    enunciado:
      'Una muestra de 800 gramos de un isótopo radiactivo tiene una vida media de 12 años: cada 12 años queda la mitad de lo que había. ¿Cuántos gramos quedan al cabo de 36 años?',
    categoria: 'aplicado',
    tipoFuncion: 'exponencial',
    calculo: 'evaluar',
    parametros: { a0: 800, base: 0.5, periodo: 12 },
    x: 36,
    expresion: 'M(x) = 800 · 0,5^(x/12)',
    etiquetaRespuesta: 'gramos',
    pista: 'Es una exponencial con base menor que 1: decrece. En 36 años caben 3 vidas medias, y cada una parte por dos.',
    grafica: null,
  },
  {
    id: 9,
    titulo: 'Cuatro unidades en una escala logarítmica',
    enunciado:
      'La magnitud de los sismos se mide en una escala logarítmica de base 10: cada unidad multiplica por 10 la amplitud registrada. Si un sismo es de magnitud 7,0 y otro de magnitud 3,0, ¿cuántas veces mayor es la amplitud del primero?',
    categoria: 'aplicado',
    tipoFuncion: 'logaritmica',
    calculo: 'razon-logaritmica',
    parametros: { baseLog: 10, k: 1, b: 0 },
    x: 4,
    expresion: 'razón = 10^(diferencia de magnitudes)',
    etiquetaRespuesta: 'veces (cuántas veces mayor)',
    pista: 'La diferencia entre las dos magnitudes son 4 unidades. En una escala logarítmica esa diferencia no se suma: se convierte en potencia.',
    grafica: { funcion: 'logaritmica', parametro: 10 },
  },
  {
    id: 10,
    titulo: 'Cuánto tarda un capital en triplicarse',
    enunciado:
      'Un capital crece un 6 % cada año con interés compuesto, de modo que cada año se multiplica por 1,06. ¿Cuántos años tarda en triplicarse?',
    categoria: 'aplicado',
    tipoFuncion: 'logaritmica',
    calculo: 'evaluar',
    parametros: { k: 1, baseLog: 1.06, b: 0 },
    x: 3,
    expresion: 't(M) = log(M) / log(1,06)',
    etiquetaRespuesta: 'años',
    pista: 'La incógnita está en el exponente (1,06^t = 3), y lo que despeja un exponente es el logaritmo. Redondea a 2 decimales.',
    grafica: { funcion: 'logaritmica', parametro: 4 },
  },
  {
    id: 11,
    titulo: 'La lineal contra la exponencial',
    enunciado:
      'Dos plantas empiezan a medirse la misma semana. La planta A mide 100 cm y crece 10 cm cada semana. La planta B mide 1 cm y duplica su altura cada semana. ¿En qué semana entera supera por primera vez la planta B a la planta A?',
    categoria: 'aplicado',
    tipoFuncion: 'exponencial',
    calculo: 'cruce',
    parametros: { a0: 1, base: 2, periodo: 1 },
    parametrosSecundarios: { m: 10, b: 100 },
    expresion: 'A(x) = 10·x + 100   ·   B(x) = 1 · 2^x',
    etiquetaRespuesta: 'número de semana',
    pista: 'Ve probando semanas enteras y compara las dos alturas. Durante muchas semanas la lineal gana con holgura: esa es la trampa.',
    grafica: { funcion: 'exponencial', parametro: 10 },
  },
  {
    id: 12,
    titulo: 'Identificar la función de una tabla',
    enunciado:
      'Esta tabla de pares (x, y) sigue una de las cuatro familias de funciones. Averigua cuál es y responde con la razón constante: el número por el que hay que multiplicar cada valor para obtener el siguiente.',
    categoria: 'abstracto',
    tipoFuncion: 'exponencial',
    calculo: 'identificar-razon',
    parametros: { a0: 3, base: 4, periodo: 1 },
    xsTabla: [0, 1, 2, 3],
    expresion: 'y = a₀ · b^x   (hay que averiguar b)',
    etiquetaRespuesta: 'la razón (número sin unidad)',
    pista: 'Prueba primero a restar valores consecutivos. Si las restas no coinciden, prueba a dividirlos.',
    grafica: { funcion: 'exponencial', parametro: 8 },
  },
];

/** Construye un caso completo desde su definición. Nada de esto se teclea a mano. */
function construirCaso(def: DefinicionCaso): CasoFuncion {
  const solucion = resolverCaso(def);
  const tabla = def.xsTabla ? tablaDe(def.tipoFuncion, def.parametros, def.xsTabla) : null;
  return {
    id: def.id,
    titulo: def.titulo,
    enunciado: def.enunciado,
    categoria: def.categoria,
    tipoFuncion: def.tipoFuncion,
    calculo: def.calculo,
    parametros: def.parametros,
    parametrosSecundarios: def.parametrosSecundarios ?? null,
    x: def.x ?? null,
    expresion: def.expresion,
    tabla,
    etiquetaRespuesta: def.etiquetaRespuesta,
    respuesta: solucion.valor,
    respuestaTexto: formatearFlexible(solucion.valor, 2),
    requiereRedondeo: Math.abs(solucion.valor - redondear(solucion.valor, 2)) > 1e-9,
    pasos: solucion.pasos,
    pista: def.pista,
    grafica: def.grafica,
  };
}

/**
 * Los 12 casos numerados, FIJOS y deterministas: el caso 3 es el mismo para todo el mundo
 * y en cualquier visita. Es lo que permite mandar «entra y resuelve el 3, el 7 y el 11».
 */
export const CASOS: readonly CasoFuncion[] = DEFINICIONES.map(construirCaso);

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

/** Elige un elemento de una lista con el generador dado. */
function elegir<T>(lista: readonly T[], aleatorio: () => number): T {
  return lista[Math.floor(aleatorio() * lista.length)];
}

/**
 * Genera un ejercicio nuevo de una de las cuatro familias. Si se pasa `semilla`, el
 * ejercicio es reproducible; si no, se toma una del reloj (por eso NUNCA debe llamarse
 * durante el render: el servidor y el navegador obtendrían ejercicios distintos).
 *
 * Todas las combinaciones están elegidas para que la respuesta salga exacta. Ver el punto
 * 4 de la cabecera.
 */
export function generarEjercicioAleatorio(semilla?: number): EjercicioFuncion {
  const semillaReal =
    semilla !== undefined && Number.isFinite(semilla)
      ? Math.floor(Math.abs(semilla))
      : Math.floor(Date.now() % 2147483647);
  const aleatorio = creadorAleatorio(semillaReal);

  const familia = elegir<TipoFuncion>(
    ['lineal', 'cuadratica', 'exponencial', 'logaritmica'],
    aleatorio,
  );

  if (familia === 'lineal') {
    const b = elegir([5, 8, 10, 12, 15, 20, 25, 30], aleatorio);
    const m = elegir([2, 3, 4, 5, 6, 7, 8, 9], aleatorio);
    const x = elegir([5, 6, 8, 10, 12, 15, 18, 20], aleatorio);
    const parametros: ParametrosFuncion = { m, b };
    const valor = evaluar('lineal', parametros, x);
    return {
      semilla: semillaReal,
      enunciado: `Un servicio cobra una cuota fija de ${formatearFlexible(b)} unidades monetarias al mes más ${formatearFlexible(m)} unidades por cada unidad consumida. ¿Cuánto se paga en un mes con ${formatearFlexible(x)} unidades consumidas?`,
      tipoFuncion: 'lineal',
      parametros,
      x,
      expresion: `C(x) = ${formatearFlexible(m)}·x + ${formatearFlexible(b)}`,
      etiquetaRespuesta: 'unidades monetarias',
      respuesta: valor,
      respuestaTexto: formatearFlexible(valor, 2),
      requiereRedondeo: Math.abs(valor - redondear(valor, 2)) > 1e-9,
      pasos: pasosEvaluar('lineal', parametros, x, valor),
      grafica: { funcion: 'lineal', parametro: Math.min(10, Math.max(1, Math.round(m))) },
    };
  }

  if (familia === 'cuadratica') {
    // v² / 20 es siempre exacto con estas velocidades: 5, 20, 45, 80, 125 metros.
    const v = elegir([10, 20, 30, 40, 50], aleatorio);
    const parametros: ParametrosFuncion = { a: -5, b: v, c: 0 };
    const vertice = verticeCuadratica(parametros);
    const definicion: DefinicionCaso = {
      id: 0,
      titulo: '',
      enunciado: '',
      categoria: 'aplicado',
      tipoFuncion: 'cuadratica',
      calculo: 'vertice-y',
      parametros,
      expresion: '',
      etiquetaRespuesta: '',
      pista: '',
      grafica: null,
    };
    const solucion = resolverCaso(definicion);
    return {
      semilla: semillaReal,
      enunciado: `Se lanza un objeto verticalmente hacia arriba desde el suelo a ${formatearFlexible(v)} metros por segundo. Su altura a los t segundos es h(t) = −5·t² + ${formatearFlexible(v)}·t. ¿Qué altura máxima alcanza?`,
      tipoFuncion: 'cuadratica',
      parametros,
      x: null,
      expresion: `h(t) = −5·t² + ${formatearFlexible(v)}·t`,
      etiquetaRespuesta: 'metros',
      respuesta: vertice.y,
      respuestaTexto: formatearFlexible(vertice.y, 2),
      requiereRedondeo: Math.abs(vertice.y - redondear(vertice.y, 2)) > 1e-9,
      pasos: solucion.pasos,
      grafica: { funcion: 'cuadratica', parametro: 5 },
    };
  }

  if (familia === 'exponencial') {
    const a0 = elegir([100, 200, 250, 400, 500, 1000], aleatorio);
    const periodo = elegir([2, 3, 4, 5], aleatorio);
    const duplicaciones = elegir([2, 3, 4, 5], aleatorio);
    const x = periodo * duplicaciones;
    const parametros: ParametrosFuncion = { a0, base: 2, periodo };
    const valor = evaluar('exponencial', parametros, x);
    return {
      semilla: semillaReal,
      enunciado: `Un cultivo empieza con ${formatearFlexible(a0)} bacterias y su número se duplica cada ${formatearFlexible(periodo)} horas. ¿Cuántas bacterias hay a las ${formatearFlexible(x)} horas?`,
      tipoFuncion: 'exponencial',
      parametros,
      x,
      expresion: `N(x) = ${formatearFlexible(a0)} · 2^(x/${formatearFlexible(periodo)})`,
      etiquetaRespuesta: 'bacterias',
      respuesta: valor,
      respuestaTexto: formatearFlexible(valor, 2),
      requiereRedondeo: Math.abs(valor - redondear(valor, 2)) > 1e-9,
      pasos: pasosEvaluar('exponencial', parametros, x, valor),
      grafica: { funcion: 'exponencial', parametro: 10 },
    };
  }

  const unidades = elegir([2, 3, 4, 5, 6], aleatorio);
  const parametros: ParametrosFuncion = { baseLog: 10, k: 1, b: 0 };
  const definicion: DefinicionCaso = {
    id: 0,
    titulo: '',
    enunciado: '',
    categoria: 'aplicado',
    tipoFuncion: 'logaritmica',
    calculo: 'razon-logaritmica',
    parametros,
    x: unidades,
    expresion: '',
    etiquetaRespuesta: '',
    pista: '',
    grafica: null,
  };
  const solucion = resolverCaso(definicion);
  return {
    semilla: semillaReal,
    enunciado: `Dos medidas se expresan en una escala logarítmica de base 10, en la que cada unidad multiplica por 10 la magnitud real. Si se diferencian en ${formatearFlexible(unidades)} unidades de esa escala, ¿cuántas veces mayor es la primera magnitud?`,
    tipoFuncion: 'logaritmica',
    parametros,
    x: unidades,
    expresion: 'razón = 10^(diferencia en la escala)',
    etiquetaRespuesta: 'veces (cuántas veces mayor)',
    respuesta: solucion.valor,
    respuestaTexto: formatearFlexible(solucion.valor, 2),
    requiereRedondeo: Math.abs(solucion.valor - redondear(solucion.valor, 2)) > 1e-9,
    pasos: solucion.pasos,
    grafica: { funcion: 'logaritmica', parametro: 8 },
  };
}
