/**
 * Motor del simulador del teorema de Pitágoras.
 *
 * Vive fuera de page.tsx a propósito. El build compila la vista sin mirar si la
 * geometría está bien: un triángulo dibujado con la hipotenusa mal calculada compila
 * igual de limpio que uno correcto, y el error solo se ve leyendo el número en pantalla.
 * Aquí no hay React, ni DOM, ni estado: solo funciones puras con entradas y salidas
 * comprobables a mano (3-4-5, 5-12-13, 20-21-29, 8-15-17), que es como se verifican.
 *
 * Tres decisiones que no son evidentes leyendo el código:
 *
 * 1. `catetoDesconocido` devuelve NaN si la hipotenusa no es el lado MAYOR. No es una
 *    guarda defensiva: es el error conceptual más habitual del alumnado —restar al revés
 *    y obtener la raíz de un negativo—, y devolver NaN permite explicarlo en pantalla en
 *    vez de mostrar un resultado inventado.
 *
 * 2. La tolerancia de `esTrianguloRectangulo` es RELATIVA al cuadrado del lado mayor. Con
 *    una tolerancia absoluta, unos lados de 3, 4 y 5 metros y otros de 3.000, 4.000 y
 *    5.001 milímetros —el mismo triángulo medido en otra unidad— darían veredictos
 *    distintos, que es justo lo que un alumno no debe ver.
 *
 * 3. Los 12 casos se CALCULAN a partir de sus datos, no se teclean. Un caso con la
 *    solución escrita a mano puede contradecir a la fórmula sin que nada se queje, y es
 *    exactamente el fallo que rompería la utilidad del modo Casos: un profesor manda
 *    «resuelve el 3, el 7 y el 11» y la corrección tiene que ser la misma para todos.
 */

import { formatNumber } from '@/lib';

// ============================================================
// TIPOS
// ============================================================

/** Qué lado se busca al resolver un triángulo rectángulo. */
export type Incognita = 'hipotenusa' | 'cateto';

/** Clasificación de un triángulo por comparación de a² + b² con c². */
export type TipoTriangulo = 'rectangulo' | 'acutangulo' | 'obtusangulo' | 'no-triangulo';

/** Resultado de resolver un lado, con los pasos intermedios ya redactados. */
export interface SolucionPitagoras {
  ok: boolean;
  valor: number;
  pasos: string[];
  error: string | null;
}

/** Resultado del recíproco: dados tres lados, ¿es rectángulo? ¿es terna? */
export interface AnalisisReciproco {
  ok: boolean;
  error: string | null;
  ordenados: [number, number, number];
  tipo: TipoTriangulo;
  esRectangulo: boolean;
  esTerna: boolean;
  esTernaPrimitiva: boolean;
  pasos: string[];
}

/** Datos para dibujar el triángulo de un caso (los valores son longitudes reales). */
export interface FiguraCaso {
  base: number;
  altura: number;
  etiquetaBase: string;
  etiquetaAltura: string;
  etiquetaHipotenusa: string;
}

/** Tipo de cálculo que pide un caso numerado. */
export type TipoCaso = 'hipotenusa' | 'cateto' | 'diagonal3d';

/** Un caso numerado del modo Casos, con su solución ya calculada. */
export interface CasoPitagoras {
  id: number;
  titulo: string;
  enunciado: string;
  categoria: 'abstracto' | 'aplicado';
  tipo: TipoCaso;
  datos: readonly number[];
  unidad: string;
  respuesta: number;
  respuestaTexto: string;
  requiereRedondeo: boolean;
  pasos: string[];
  figura: FiguraCaso | null;
  pista: string;
}

/** Ejercicio generado al vuelo, con la misma forma que un caso pero sin número fijo. */
export interface EjercicioAleatorio {
  semilla: number;
  enunciado: string;
  tipo: Incognita;
  unidad: string;
  respuesta: number;
  respuestaTexto: string;
  requiereRedondeo: boolean;
  pasos: string[];
  figura: FiguraCaso;
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
 * Así 25 se escribe «25» y no «25,0000», pero 137,6817 conserva su precisión.
 */
export function formatearFlexible(valor: number, maxDecimales = 4): string {
  if (!Number.isFinite(valor)) return 'no definido';
  for (let d = 0; d < maxDecimales; d++) {
    if (Math.abs(valor - redondear(valor, d)) < 1e-9) return formatNumber(valor, d);
  }
  return formatNumber(valor, maxDecimales);
}

/** Ordena tres lados de menor a mayor. El mayor es el candidato a hipotenusa. */
export function ordenarLados(l1: number, l2: number, l3: number): [number, number, number] {
  const orden = [l1, l2, l3].sort((x, y) => x - y);
  return [orden[0], orden[1], orden[2]];
}

/** Máximo común divisor por Euclides, para detectar ternas primitivas. */
function mcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) {
    const resto = x % y;
    x = y;
    y = resto;
  }
  return x;
}

// ============================================================
// NÚCLEO: LOS DOS CÁLCULOS DEL TEOREMA
// ============================================================

/**
 * Hipotenusa a partir de los dos catetos: c = √(a² + b²).
 * Devuelve NaN si algún cateto no es un número positivo.
 */
export function hipotenusa(a: number, b: number): number {
  if (!Number.isFinite(a) || !Number.isFinite(b)) return NaN;
  if (a <= 0 || b <= 0) return NaN;
  return Math.sqrt(a * a + b * b);
}

/**
 * Cateto que falta a partir de la hipotenusa y el otro cateto: b = √(c² − a²).
 *
 * Devuelve NaN si la hipotenusa no es estrictamente mayor que el cateto: en un triángulo
 * rectángulo la hipotenusa es siempre el lado más largo, así que ese caso no es un fallo
 * de precisión sino un dato imposible, y merece decirse en vez de disimularse.
 */
export function catetoDesconocido(hip: number, cateto: number): number {
  if (!Number.isFinite(hip) || !Number.isFinite(cateto)) return NaN;
  if (hip <= 0 || cateto <= 0) return NaN;
  if (hip <= cateto) return NaN;
  return Math.sqrt(hip * hip - cateto * cateto);
}

/**
 * Recíproco: ¿estos tres lados forman un triángulo rectángulo?
 *
 * La tolerancia es relativa al cuadrado del lado mayor (0,5 % por defecto), para que el
 * veredicto no dependa de la unidad en la que estén medidos los lados.
 */
export function esTrianguloRectangulo(
  l1: number,
  l2: number,
  l3: number,
  toleranciaRelativa = 0.005,
): boolean {
  const lados = [l1, l2, l3];
  if (!lados.every((v) => Number.isFinite(v) && v > 0)) return false;
  const [a, b, c] = ordenarLados(l1, l2, l3);
  // Desigualdad triangular: sin ella, «1, 2, 10» pasaría por triángulo.
  if (a + b <= c) return false;
  const desviacion = Math.abs(a * a + b * b - c * c);
  return desviacion <= toleranciaRelativa * c * c;
}

/**
 * ¿Son los tres lados una terna pitagórica? Exige enteros positivos e igualdad EXACTA:
 * una terna es un hecho aritmético, no una aproximación, así que aquí no hay tolerancia.
 */
export function esTernaPitagorica(l1: number, l2: number, l3: number): boolean {
  const lados = [l1, l2, l3];
  if (!lados.every((v) => Number.isInteger(v) && v > 0)) return false;
  const [a, b, c] = ordenarLados(l1, l2, l3);
  return a * a + b * b === c * c;
}

/** Terna primitiva: es terna y sus tres lados no comparten ningún divisor común. */
export function esTernaPitagoricaPrimitiva(l1: number, l2: number, l3: number): boolean {
  if (!esTernaPitagorica(l1, l2, l3)) return false;
  return mcd(mcd(l1, l2), l3) === 1;
}

// ============================================================
// RESOLUCIÓN CON PASOS ESCRITOS
// ============================================================

/**
 * Resuelve el lado que falta y devuelve TAMBIÉN el razonamiento, paso a paso.
 *
 * Para `incognita = 'hipotenusa'`, dato1 y dato2 son los dos catetos.
 * Para `incognita = 'cateto'`, dato1 es la hipotenusa y dato2 el cateto conocido.
 */
export function resolverPitagoras(
  incognita: Incognita,
  dato1: number,
  dato2: number,
): SolucionPitagoras {
  const vacio: SolucionPitagoras = { ok: false, valor: NaN, pasos: [], error: null };

  if (!Number.isFinite(dato1) || !Number.isFinite(dato2)) {
    return { ...vacio, error: 'Escribe dos longitudes válidas (por ejemplo 3,5 y 12).' };
  }
  if (dato1 <= 0 || dato2 <= 0) {
    return { ...vacio, error: 'Las longitudes de los lados tienen que ser mayores que cero.' };
  }

  if (incognita === 'hipotenusa') {
    const a = dato1;
    const b = dato2;
    const c = hipotenusa(a, b);
    const pasos = [
      'Enunciado del teorema: en todo triángulo rectángulo, c² = a² + b² (c es la hipotenusa).',
      `Sustituimos los catetos: c² = ${formatearFlexible(a)}² + ${formatearFlexible(b)}²`,
      `Elevamos al cuadrado: c² = ${formatearFlexible(a * a)} + ${formatearFlexible(b * b)}`,
      `Sumamos: c² = ${formatearFlexible(a * a + b * b)}`,
      `Sacamos la raíz cuadrada: c = √${formatearFlexible(a * a + b * b)} = ${formatearFlexible(c)}`,
    ];
    return { ok: true, valor: c, pasos, error: null };
  }

  const c = dato1;
  const a = dato2;
  if (c <= a) {
    return {
      ...vacio,
      error:
        'La hipotenusa tiene que ser MAYOR que el cateto: es siempre el lado más largo del triángulo rectángulo. Revisa qué dato es cuál.',
    };
  }
  const b = catetoDesconocido(c, a);
  const pasos = [
    'Partimos del teorema: c² = a² + b². Si la incógnita es un cateto, despejamos: b² = c² − a².',
    `Sustituimos: b² = ${formatearFlexible(c)}² − ${formatearFlexible(a)}²`,
    `Elevamos al cuadrado: b² = ${formatearFlexible(c * c)} − ${formatearFlexible(a * a)}`,
    `Restamos: b² = ${formatearFlexible(c * c - a * a)}`,
    `Sacamos la raíz cuadrada: b = √${formatearFlexible(c * c - a * a)} = ${formatearFlexible(b)}`,
  ];
  return { ok: true, valor: b, pasos, error: null };
}

/**
 * Recíproco con explicación: clasifica el triángulo y dice si los lados son terna.
 *
 * Compara a² + b² con c² en vez de limitarse a un sí/no, porque el signo de esa
 * diferencia es información: menor significa que el ángulo mayor pasa de 90°.
 */
export function analizarReciproco(l1: number, l2: number, l3: number): AnalisisReciproco {
  const base: AnalisisReciproco = {
    ok: false,
    error: null,
    ordenados: [0, 0, 0],
    tipo: 'no-triangulo',
    esRectangulo: false,
    esTerna: false,
    esTernaPrimitiva: false,
    pasos: [],
  };

  const lados = [l1, l2, l3];
  if (!lados.every((v) => Number.isFinite(v))) {
    return { ...base, error: 'Escribe los tres lados como números (por ejemplo 6, 8 y 10).' };
  }
  if (!lados.every((v) => v > 0)) {
    return { ...base, error: 'Los tres lados tienen que ser mayores que cero.' };
  }

  const ordenados = ordenarLados(l1, l2, l3);
  const [a, b, c] = ordenados;
  const sumaCuadrados = a * a + b * b;
  const cuadradoMayor = c * c;

  if (a + b <= c) {
    return {
      ...base,
      ok: true,
      ordenados,
      tipo: 'no-triangulo',
      pasos: [
        `Ordenamos los lados de menor a mayor: ${formatearFlexible(a)}, ${formatearFlexible(b)}, ${formatearFlexible(c)}.`,
        `Antes de nada, la desigualdad triangular: ${formatearFlexible(a)} + ${formatearFlexible(b)} = ${formatearFlexible(a + b)}, que no supera a ${formatearFlexible(c)}.`,
        'Con estas tres longitudes no se puede cerrar ningún triángulo, así que la pregunta de si es rectángulo no llega a plantearse.',
      ],
    };
  }

  const rectangulo = esTrianguloRectangulo(l1, l2, l3);
  const terna = esTernaPitagorica(l1, l2, l3);
  const primitiva = esTernaPitagoricaPrimitiva(l1, l2, l3);
  const tipo: TipoTriangulo = rectangulo
    ? 'rectangulo'
    : sumaCuadrados > cuadradoMayor
      ? 'acutangulo'
      : 'obtusangulo';

  const pasos = [
    `Ordenamos los lados de menor a mayor: ${formatearFlexible(a)}, ${formatearFlexible(b)}, ${formatearFlexible(c)}. El mayor, ${formatearFlexible(c)}, es el único que puede ser hipotenusa.`,
    `Suma de los cuadrados de los dos menores: ${formatearFlexible(a)}² + ${formatearFlexible(b)}² = ${formatearFlexible(a * a)} + ${formatearFlexible(b * b)} = ${formatearFlexible(sumaCuadrados)}`,
    `Cuadrado del lado mayor: ${formatearFlexible(c)}² = ${formatearFlexible(cuadradoMayor)}`,
  ];

  if (rectangulo) {
    pasos.push(
      `Los dos valores coinciden, así que se cumple el recíproco del teorema: el triángulo ES rectángulo, con la hipotenusa de ${formatearFlexible(c)} y el ángulo recto entre los otros dos lados.`,
    );
  } else if (tipo === 'acutangulo') {
    pasos.push(
      `${formatearFlexible(sumaCuadrados)} es mayor que ${formatearFlexible(cuadradoMayor)}, así que el ángulo opuesto al lado mayor mide MENOS de 90°: el triángulo es acutángulo.`,
    );
  } else {
    pasos.push(
      `${formatearFlexible(sumaCuadrados)} es menor que ${formatearFlexible(cuadradoMayor)}, así que el ángulo opuesto al lado mayor mide MÁS de 90°: el triángulo es obtusángulo.`,
    );
  }

  if (terna) {
    pasos.push(
      primitiva
        ? 'Además los tres lados son enteros y cumplen la igualdad exacta: es una terna pitagórica primitiva (no se obtiene multiplicando otra terna más pequeña).'
        : 'Además los tres lados son enteros y cumplen la igualdad exacta: es una terna pitagórica, múltiplo de una terna más pequeña.',
    );
  }

  return {
    ok: true,
    error: null,
    ordenados,
    tipo,
    esRectangulo: rectangulo,
    esTerna: terna,
    esTernaPrimitiva: primitiva,
    pasos,
  };
}

// ============================================================
// COMPROBACIÓN DE RESPUESTAS
// ============================================================

/**
 * Tolerancia de corrección: la mayor entre ±0,01 y el 1 % del valor esperado.
 *
 * El mínimo absoluto evita castigar el redondeo en respuestas pequeñas (2,25 frente a
 * 2,2472) y el porcentaje evita ser absurdamente estricto en respuestas grandes.
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
 * Definición de un caso: solo los DATOS. La respuesta, los pasos y la figura salen de
 * las funciones de arriba, nunca escritos a mano (ver punto 3 de la cabecera).
 */
interface DefinicionCaso {
  id: number;
  titulo: string;
  enunciado: string;
  categoria: 'abstracto' | 'aplicado';
  tipo: TipoCaso;
  datos: readonly number[];
  unidad: string;
  pista: string;
}

const DEFINICIONES: readonly DefinicionCaso[] = [
  {
    id: 1,
    titulo: 'Los dos catetos',
    enunciado:
      'Un triángulo rectángulo tiene catetos de 6 cm y 8 cm. ¿Cuánto mide la hipotenusa?',
    categoria: 'abstracto',
    tipo: 'hipotenusa',
    datos: [6, 8],
    unidad: 'cm',
    pista: 'La hipotenusa es el lado que no toca el ángulo recto: aquí es la incógnita.',
  },
  {
    id: 2,
    titulo: 'Falta un cateto',
    enunciado:
      'La hipotenusa de un triángulo rectángulo mide 13 m y uno de sus catetos, 5 m. ¿Cuánto mide el otro cateto?',
    categoria: 'abstracto',
    tipo: 'cateto',
    datos: [13, 5],
    unidad: 'm',
    pista: 'Cuando la incógnita es un cateto, la operación central es una RESTA, no una suma.',
  },
  {
    id: 3,
    titulo: 'Diagonal de una pantalla',
    enunciado:
      'Una pantalla rectangular mide 120 cm de ancho y 67,5 cm de alto. Las tiendas anuncian el tamaño por la diagonal. ¿Cuánto mide esa diagonal?',
    categoria: 'aplicado',
    tipo: 'hipotenusa',
    datos: [120, 67.5],
    unidad: 'cm',
    pista: 'La diagonal de un rectángulo lo parte en dos triángulos rectángulos iguales.',
  },
  {
    id: 4,
    titulo: 'Escalera apoyada en la pared',
    enunciado:
      'Una escalera de 5 m se apoya en una pared vertical. Su base está a 1,4 m de la pared. ¿A qué altura llega el extremo superior?',
    categoria: 'aplicado',
    tipo: 'cateto',
    datos: [5, 1.4],
    unidad: 'm',
    pista: 'La escalera es la hipotenusa; el suelo y la pared son los catetos.',
  },
  {
    id: 5,
    titulo: 'Catetos con decimales',
    enunciado:
      'Un triángulo rectángulo tiene catetos de 2,5 cm y 6 cm. ¿Cuánto mide la hipotenusa?',
    categoria: 'abstracto',
    tipo: 'hipotenusa',
    datos: [2.5, 6],
    unidad: 'cm',
    pista: 'El teorema funciona igual con decimales: 2,5² es 6,25, no 5.',
  },
  {
    id: 6,
    titulo: 'Atajo en diagonal por un campo',
    enunciado:
      'Un campo rectangular mide 90 m por 120 m. En lugar de bordearlo, se cruza en diagonal de esquina a esquina. ¿Cuántos metros mide esa diagonal?',
    categoria: 'aplicado',
    tipo: 'hipotenusa',
    datos: [90, 120],
    unidad: 'm',
    pista: 'Bordear serían 90 + 120 = 210 m. Compara luego cuánto se ahorra cruzando.',
  },
  {
    id: 7,
    titulo: 'Altura de una cometa',
    enunciado:
      'Una cometa está sujeta con 45 m de hilo tenso. El punto del suelo justo debajo de la cometa está a 27 m de quien la sujeta. Si el hilo sale del suelo, ¿a qué altura vuela la cometa?',
    categoria: 'aplicado',
    tipo: 'cateto',
    datos: [45, 27],
    unidad: 'm',
    pista: 'El hilo tenso es la hipotenusa; la altura y la distancia en el suelo, los catetos.',
  },
  {
    id: 8,
    titulo: 'Despejar el cateto mayor',
    enunciado:
      'Un triángulo rectángulo tiene una hipotenusa de 41 cm y un cateto de 9 cm. ¿Cuánto mide el otro cateto?',
    categoria: 'abstracto',
    tipo: 'cateto',
    datos: [41, 9],
    unidad: 'cm',
    pista: 'El resultado es entero: 9, 40 y 41 forman una terna pitagórica.',
  },
  {
    id: 9,
    titulo: 'La varilla más larga que cabe en una caja',
    enunciado:
      'Una caja tiene 60 cm de largo, 25 cm de ancho y 20 cm de alto. ¿Cuánto mide la varilla recta más larga que cabe dentro, apoyada de esquina a esquina?',
    categoria: 'aplicado',
    tipo: 'diagonal3d',
    datos: [60, 25, 20],
    unidad: 'cm',
    pista: 'Es Pitágoras dos veces: primero la diagonal del fondo, después la diagonal del cuerpo.',
  },
  {
    id: 10,
    titulo: '¿Cabe la tabla por la puerta?',
    enunciado:
      'Una puerta mide 0,8 m de ancho y 2,1 m de alto. ¿Cuánto mide su diagonal? (Una tabla rígida de 2,2 m solo pasa si la diagonal es mayor.)',
    categoria: 'aplicado',
    tipo: 'hipotenusa',
    datos: [0.8, 2.1],
    unidad: 'm',
    pista: 'Inclinando la tabla, la medida máxima que pasa por el hueco es su diagonal.',
  },
  {
    id: 11,
    titulo: 'Una terna poco conocida',
    enunciado:
      'Un triángulo rectángulo tiene catetos de 20 y 21 unidades. Calcula la hipotenusa y comprueba que también sale un número entero.',
    categoria: 'abstracto',
    tipo: 'hipotenusa',
    datos: [20, 21],
    unidad: 'unidades',
    pista: 'Además de 3-4-5 y 5-12-13 hay infinitas ternas. Esta es una de las primitivas.',
  },
  {
    id: 12,
    titulo: 'Distancia en línea recta',
    enunciado:
      'Alguien recorre 1,2 km hacia el este y después 0,9 km hacia el norte. ¿A qué distancia en línea recta está del punto de partida?',
    categoria: 'aplicado',
    tipo: 'hipotenusa',
    datos: [1.2, 0.9],
    unidad: 'km',
    pista: 'Este y norte forman un ángulo recto: el recorrido dibuja un triángulo rectángulo.',
  },
];

/** Construye la solución de un caso a partir de sus datos. Nada se teclea a mano. */
function construirCaso(def: DefinicionCaso): CasoPitagoras {
  let respuesta = NaN;
  let pasos: string[] = [];
  let figura: FiguraCaso | null = null;

  if (def.tipo === 'hipotenusa') {
    const [a, b] = def.datos;
    const solucion = resolverPitagoras('hipotenusa', a, b);
    respuesta = solucion.valor;
    pasos = solucion.pasos;
    figura = {
      base: a,
      altura: b,
      etiquetaBase: `${formatearFlexible(a)} ${def.unidad}`,
      etiquetaAltura: `${formatearFlexible(b)} ${def.unidad}`,
      etiquetaHipotenusa: '?',
    };
  } else if (def.tipo === 'cateto') {
    const [hip, cat] = def.datos;
    const solucion = resolverPitagoras('cateto', hip, cat);
    respuesta = solucion.valor;
    pasos = solucion.pasos;
    figura = {
      base: cat,
      altura: solucion.valor,
      etiquetaBase: `${formatearFlexible(cat)} ${def.unidad}`,
      etiquetaAltura: '?',
      etiquetaHipotenusa: `${formatearFlexible(hip)} ${def.unidad}`,
    };
  } else {
    const [largo, ancho, alto] = def.datos;
    const diagonalBase = hipotenusa(largo, ancho);
    respuesta = hipotenusa(diagonalBase, alto);
    pasos = [
      'La diagonal de una caja se calcula aplicando el teorema DOS veces: primero en el rectángulo del fondo y después en el triángulo vertical que forman esa diagonal y la altura.',
      `Diagonal del fondo: d² = ${formatearFlexible(largo)}² + ${formatearFlexible(ancho)}² = ${formatearFlexible(largo * largo)} + ${formatearFlexible(ancho * ancho)} = ${formatearFlexible(largo * largo + ancho * ancho)}`,
      `d = √${formatearFlexible(largo * largo + ancho * ancho)} = ${formatearFlexible(diagonalBase)} ${def.unidad}`,
      `Ahora esa diagonal d y la altura son los catetos de un triángulo rectángulo vertical: D² = ${formatearFlexible(diagonalBase)}² + ${formatearFlexible(alto)}² = ${formatearFlexible(diagonalBase * diagonalBase)} + ${formatearFlexible(alto * alto)} = ${formatearFlexible(diagonalBase * diagonalBase + alto * alto)}`,
      `D = √${formatearFlexible(diagonalBase * diagonalBase + alto * alto)} = ${formatearFlexible(respuesta)} ${def.unidad}`,
      `Atajo equivalente: D = √(largo² + ancho² + alto²), que es la misma cuenta en una sola línea.`,
    ];
    figura = {
      base: diagonalBase,
      altura: alto,
      etiquetaBase: `d = ${formatearFlexible(diagonalBase)} ${def.unidad}`,
      etiquetaAltura: `${formatearFlexible(alto)} ${def.unidad}`,
      etiquetaHipotenusa: '?',
    };
  }

  return {
    id: def.id,
    titulo: def.titulo,
    enunciado: def.enunciado,
    categoria: def.categoria,
    tipo: def.tipo,
    datos: def.datos,
    unidad: def.unidad,
    respuesta,
    respuestaTexto: formatearFlexible(respuesta),
    requiereRedondeo: Math.abs(respuesta - redondear(respuesta, 2)) > 1e-9,
    pasos,
    figura,
    pista: def.pista,
  };
}

/**
 * Los 12 casos numerados, FIJOS y deterministas: el caso 3 es el mismo para todo el
 * mundo y en cualquier visita. Es lo que permite mandar «resuelve el 3, el 7 y el 11».
 */
export const CASOS: readonly CasoPitagoras[] = DEFINICIONES.map(construirCaso);

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

/** Ternas primitivas pequeñas, para que a veces salga un resultado entero y redondo. */
const TERNAS_BASE: readonly (readonly [number, number, number])[] = [
  [3, 4, 5],
  [5, 12, 13],
  [8, 15, 17],
  [7, 24, 25],
  [20, 21, 29],
  [9, 40, 41],
  [12, 35, 37],
];

const CONTEXTOS_HIPOTENUSA: readonly ((a: string, b: string, u: string) => string)[] = [
  (a, b, u) =>
    `Un triángulo rectángulo tiene catetos de ${a} ${u} y ${b} ${u}. ¿Cuánto mide la hipotenusa?`,
  (a, b, u) =>
    `Un rectángulo mide ${a} ${u} de base y ${b} ${u} de altura. ¿Cuánto mide su diagonal?`,
  (a, b, u) =>
    `Alguien camina ${a} ${u} hacia el este y luego ${b} ${u} hacia el norte. ¿A qué distancia en línea recta está del punto de partida?`,
  (a, b, u) =>
    `Un poste vertical de ${b} ${u} se sujeta con un cable tenso anclado en el suelo a ${a} ${u} de su base. ¿Cuánto cable hace falta?`,
];

const CONTEXTOS_CATETO: readonly ((c: string, a: string, u: string) => string)[] = [
  (c, a, u) =>
    `Un triángulo rectángulo tiene una hipotenusa de ${c} ${u} y un cateto de ${a} ${u}. ¿Cuánto mide el otro cateto?`,
  (c, a, u) =>
    `Una escalera de ${c} ${u} se apoya en una pared vertical con la base a ${a} ${u} de ella. ¿A qué altura llega?`,
  (c, a, u) =>
    `Una rampa recta de ${c} ${u} salva un desnivel apoyándose en un tramo horizontal de ${a} ${u}. ¿Qué altura salva?`,
];

const UNIDADES: readonly string[] = ['cm', 'm', 'km'];

/**
 * Genera un ejercicio nuevo. Si se pasa `semilla`, el ejercicio es reproducible;
 * si no, se toma una semilla del reloj (por eso NUNCA debe llamarse durante el render:
 * el servidor y el navegador obtendrían ejercicios distintos).
 */
export function generarEjercicioAleatorio(semilla?: number): EjercicioAleatorio {
  const semillaReal =
    semilla !== undefined && Number.isFinite(semilla)
      ? Math.floor(Math.abs(semilla))
      : Math.floor(Date.now() % 2147483647);
  const aleatorio = creadorAleatorio(semillaReal);

  const buscaCateto = aleatorio() < 0.45;
  const usarTerna = aleatorio() < 0.5;
  const unidad = UNIDADES[Math.floor(aleatorio() * UNIDADES.length)];

  let a: number;
  let b: number;

  if (usarTerna) {
    const terna = TERNAS_BASE[Math.floor(aleatorio() * TERNAS_BASE.length)];
    const factor = 1 + Math.floor(aleatorio() * 3);
    a = terna[0] * factor;
    b = terna[1] * factor;
  } else {
    a = redondear(2 + aleatorio() * 18, 1);
    b = redondear(2 + aleatorio() * 18, 1);
  }

  const c = hipotenusa(a, b);

  if (buscaCateto) {
    const plantilla = CONTEXTOS_CATETO[Math.floor(aleatorio() * CONTEXTOS_CATETO.length)];
    const hipRedondeada = redondear(c, 2);
    const solucion = resolverPitagoras('cateto', hipRedondeada, a);
    return {
      semilla: semillaReal,
      enunciado: plantilla(formatearFlexible(hipRedondeada), formatearFlexible(a), unidad),
      tipo: 'cateto',
      unidad,
      respuesta: solucion.valor,
      respuestaTexto: formatearFlexible(solucion.valor),
      requiereRedondeo: Math.abs(solucion.valor - redondear(solucion.valor, 2)) > 1e-9,
      pasos: solucion.pasos,
      figura: {
        base: a,
        altura: solucion.valor,
        etiquetaBase: `${formatearFlexible(a)} ${unidad}`,
        etiquetaAltura: '?',
        etiquetaHipotenusa: `${formatearFlexible(hipRedondeada)} ${unidad}`,
      },
    };
  }

  const plantilla = CONTEXTOS_HIPOTENUSA[Math.floor(aleatorio() * CONTEXTOS_HIPOTENUSA.length)];
  const solucion = resolverPitagoras('hipotenusa', a, b);
  return {
    semilla: semillaReal,
    enunciado: plantilla(formatearFlexible(a), formatearFlexible(b), unidad),
    tipo: 'hipotenusa',
    unidad,
    respuesta: solucion.valor,
    respuestaTexto: formatearFlexible(solucion.valor),
    requiereRedondeo: Math.abs(solucion.valor - redondear(solucion.valor, 2)) > 1e-9,
    pasos: solucion.pasos,
    figura: {
      base: a,
      altura: b,
      etiquetaBase: `${formatearFlexible(a)} ${unidad}`,
      etiquetaAltura: `${formatearFlexible(b)} ${unidad}`,
      etiquetaHipotenusa: '?',
    },
  };
}
