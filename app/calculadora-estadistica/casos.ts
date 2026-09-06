/**
 * Motor de los casos numerados de la Calculadora de Estadística Descriptiva.
 *
 * Vive fuera de `page.tsx` a propósito. El build compila la vista sin mirar si la
 * estadística está bien: una mediana calculada con el convenio equivocado compila igual
 * de limpio que la correcta, y el error solo se ve leyendo el número en pantalla. Aquí no
 * hay React, ni DOM, ni estado: solo funciones puras con entradas y salidas comprobables
 * a mano, que es como se verifican.
 *
 * EL CONVENIO DE CÁLCULO (lo que de verdad importa en esta app)
 * ─────────────────────────────────────────────────────────────
 * En estadística descriptiva hay medidas con VARIOS convenios que dan números distintos.
 * Si los casos usaran uno y la calculadora otro, la app corregiría como mal una respuesta
 * que ella misma produce. Por eso `calcularEstadisticas` es la MISMA función que pinta el
 * panel de resultados —se movió aquí desde `page.tsx` el 06/09/2026 para que no puedan
 * divergir— y los casos se resuelven llamándola.
 *
 * Los tres convenios que fija esta app:
 *
 * 1. DESVIACIÓN TÍPICA. La app muestra las DOS y las llama por su nombre:
 *      · «Desviación típica (σ)» = POBLACIONAL, divide entre n.
 *      · «Cuasidesviación típica (s)» = MUESTRAL, divide entre n−1 (corrección de Bessel).
 *    Los casos que piden «desviación típica» piden la POBLACIONAL (÷n) y lo dicen en el
 *    enunciado; hay además un caso que pide la muestral sobre el MISMO conjunto, para que
 *    la diferencia se vea en dos números y no en una explicación.
 *
 * 2. MEDIANA. Con n impar, el valor central. Con n PAR, el promedio de los dos centrales
 *    —que es donde se falla—, así que hay un caso de cada.
 *
 * 3. CUARTILES. La app usa el método de POSICIÓN sobre los datos ordenados: Q1 es el valor
 *    que ocupa el índice ⌊n × 0,25⌋ y Q3 el del índice ⌊n × 0,75⌋ (contando desde 0), es
 *    decir las posiciones ⌊n/4⌋+1 y ⌊3n/4⌋+1 contando desde 1. No interpola.
 *    Los dos casos de cuartiles usan n = 11 y datos elegidos para que los métodos
 *    habituales COINCIDAN: con n no múltiplo de 4 el método de posición y el de «redondear
 *    hacia arriba» dan lo mismo, y además los dos valores vecinos del cuartil son iguales,
 *    así que el método por interpolación (el de las hojas de cálculo) también devuelve ese
 *    número. Un alumno no puede acertar el método y fallar el caso.
 *
 * OTRAS DOS DECISIONES QUE NO SE VEN LEYENDO EL CÓDIGO
 * ────────────────────────────────────────────────────
 * · Los 12 casos se CALCULAN a partir de sus datos, nunca se teclea la solución. Un caso
 *   con la respuesta escrita a mano puede contradecir a la calculadora sin que nada se
 *   queje, y es justo el fallo que rompería el modo: un profesor manda «resuelve el 3, el
 *   7 y el 11» y la corrección tiene que ser la misma para toda la clase.
 *
 * · Todos los conjuntos son de números ENTEROS. No es estética: el texto que el botón
 *   «Cargar estos datos» deja en la calculadora se lee igual tanto si la coma se
 *   interpreta como decimal como si se interpreta como separador de lista, así que la
 *   serie cargada NUNCA puede leerse de dos maneras distintas. Los decimales aparecen en
 *   las RESPUESTAS (una mediana de n par, una cuasidesviación), que es donde enseñan algo.
 */

import { formatNumber } from '@/lib';

// ============================================================
// TIPOS
// ============================================================

/** Qué medida pide un caso. Cada valor tiene su rama en `resolverCaso`. */
export type MedidaEstadistica =
  | 'media'
  | 'mediana'
  | 'moda'
  | 'moda-menor'
  | 'rango'
  | 'desviacion'
  | 'cuasidesviacion'
  | 'q1'
  | 'q3'
  | 'iqr'
  | 'diferencia-media-mediana';

/** Todas las medidas descriptivas de una serie. Es lo que pinta el panel de resultados. */
export interface EstadisticasSerie {
  n: number;
  suma: number;
  media: number;
  mediana: number;
  modas: number[];
  maxFrec: number;
  varianzaMuestral: number;
  varianzaPoblacional: number;
  desviacionMuestral: number;
  desviacionPoblacional: number;
  minimo: number;
  maximo: number;
  rango: number;
  q1: number;
  q3: number;
  iqr: number;
  coefVariacion: number;
  errorEstandar: number;
  sumaCuadrados: number;
  desviacionMedia: number;
}

/** Un caso numerado, con su solución ya calculada por el motor. */
export interface CasoEstadistica {
  id: number;
  titulo: string;
  enunciado: string;
  categoria: 'abstracto' | 'aplicado';
  medida: MedidaEstadistica;
  /** El conjunto del que sale la respuesta. */
  datos: readonly number[];
  /** El mismo conjunto listo para pegar en la calculadora. */
  textoDatos: string;
  /** Cómo se llama ese conjunto en el enunciado («El grupo B», «Las 11 medidas»…). */
  etiquetaDatos: string;
  /** Segundo conjunto, solo en los casos que comparan dos. `null` en el resto. */
  datosComparacion: readonly number[] | null;
  textoDatosComparacion: string | null;
  etiquetaComparacion: string | null;
  /** Qué se escribe en el campo. Nunca vacío: es la etiqueta accesible del input. */
  etiquetaRespuesta: string;
  unidad: string;
  respuesta: number;
  respuestaTexto: string;
  /** La respuesta no es exacta con 2 decimales, así que el enunciado pide redondear. */
  requiereRedondeo: boolean;
  pasos: string[];
  pista: string;
}

/** Ejercicio generado al vuelo: misma forma que un caso, pero sin número fijo. */
export interface EjercicioEstadistica {
  semilla: number;
  enunciado: string;
  medida: MedidaEstadistica;
  datos: readonly number[];
  textoDatos: string;
  etiquetaRespuesta: string;
  unidad: string;
  respuesta: number;
  respuestaTexto: string;
  requiereRedondeo: boolean;
  pasos: string[];
}

/** Veredicto de comprobar la respuesta tecleada. */
export interface Comprobacion {
  correcto: boolean;
  motivo: 'acertado' | 'fallado' | 'no-numerico';
  diferencia: number;
  tolerancia: number;
}

// ============================================================
// AUXILIARES DE FORMATO
// ============================================================

/** Redondea a `decimales` para no arrastrar el ruido binario del punto flotante. */
export function redondear(valor: number, decimales: number): number {
  const factor = 10 ** decimales;
  return Math.round(valor * factor) / factor;
}

/**
 * Formatea con los decimales que el número necesita de verdad, hasta un máximo.
 * Así 7 se escribe «7» y no «7,0000», pero 2,1381 conserva su precisión.
 */
export function formatearFlexible(valor: number, maxDecimales = 4): string {
  if (!Number.isFinite(valor)) return 'no definido';
  for (let d = 0; d < maxDecimales; d++) {
    if (Math.abs(valor - redondear(valor, d)) < 1e-9) return formatNumber(valor, d);
  }
  return formatNumber(valor, maxDecimales);
}

/** Serie escrita como la escribiría una persona: «4, 6, 7, 8, 10». */
export function textoDeSerie(datos: readonly number[]): string {
  return datos.map((v) => formatearFlexible(v)).join(', ');
}

// ============================================================
// EL CÁLCULO (la misma función que alimenta el panel de resultados)
// ============================================================

/**
 * Todas las medidas descriptivas de una serie, o `null` si no hay datos.
 *
 * Ordena por su cuenta: así da igual si quien llama ya venía con la serie ordenada (el
 * panel de resultados) o con los datos en el orden del enunciado (los casos).
 */
export function calcularEstadisticas(entrada: readonly number[]): EstadisticasSerie | null {
  const valores = [...entrada].sort((a, b) => a - b);
  if (valores.length === 0) return null;

  const n = valores.length;
  const suma = valores.reduce((a, b) => a + b, 0);
  const media = suma / n;

  // Mediana — con n par, el promedio de los DOS centrales
  const mediana = n % 2 === 0
    ? (valores[n / 2 - 1] + valores[n / 2]) / 2
    : valores[Math.floor(n / 2)];

  // Moda — solo cuenta como moda un valor que se repite (frecuencia > 1)
  const frecuencias: Record<number, number> = {};
  valores.forEach(v => { frecuencias[v] = (frecuencias[v] || 0) + 1; });
  const maxFrec = Math.max(...Object.values(frecuencias));
  const modas = Object.entries(frecuencias)
    .filter(([, f]) => f === maxFrec && f > 1)
    .map(([v]) => parseFloat(v)); // parser-ok: la clave la escribe este mismo objeto, no el usuario

  // Varianza y Desviación Estándar (muestral)
  const varianzaMuestral = valores.reduce((acc, v) => acc + Math.pow(v - media, 2), 0) / (n - 1);
  const desviacionMuestral = Math.sqrt(varianzaMuestral);

  // Varianza y Desviación Estándar (poblacional)
  const varianzaPoblacional = valores.reduce((acc, v) => acc + Math.pow(v - media, 2), 0) / n;
  const desviacionPoblacional = Math.sqrt(varianzaPoblacional);

  // Rango
  const minimo = valores[0];
  const maximo = valores[n - 1];
  const rango = maximo - minimo;

  // Cuartiles — método de POSICIÓN, sin interpolar (ver cabecera)
  const q1Index = Math.floor(n * 0.25);
  const q3Index = Math.floor(n * 0.75);
  const q1 = valores[q1Index];
  const q3 = valores[q3Index];
  const iqr = q3 - q1;

  // Coeficiente de variación
  const coefVariacion = (desviacionMuestral / media) * 100;

  // Error estándar
  const errorEstandar = desviacionMuestral / Math.sqrt(n);

  // Suma de cuadrados
  const sumaCuadrados = valores.reduce((acc, v) => acc + Math.pow(v - media, 2), 0);

  // Desviación media (desviación absoluta media respecto a la media)
  const desviacionMedia = valores.reduce((acc, v) => acc + Math.abs(v - media), 0) / n;

  return {
    n,
    suma,
    media,
    mediana,
    modas,
    maxFrec,
    varianzaMuestral,
    varianzaPoblacional,
    desviacionMuestral,
    desviacionPoblacional,
    minimo,
    maximo,
    rango,
    q1,
    q3,
    iqr,
    coefVariacion,
    errorEstandar,
    sumaCuadrados,
    desviacionMedia
  };
}

/**
 * Resuelve la medida que pide un caso. Nunca lanza: devuelve NaN cuando la pregunta no
 * tiene respuesta única (una moda pedida sobre un conjunto sin valores repetidos, o «la
 * menor de las dos modas» sobre un conjunto unimodal).
 */
export function resolverCaso(medida: MedidaEstadistica, datos: readonly number[]): number {
  const est = calcularEstadisticas(datos);
  if (est === null) return NaN;

  switch (medida) {
    case 'media':
      return est.media;
    case 'mediana':
      return est.mediana;
    case 'moda':
      return est.modas.length === 1 ? est.modas[0] : NaN;
    case 'moda-menor':
      return est.modas.length >= 2 ? Math.min(...est.modas) : NaN;
    case 'rango':
      return est.rango;
    case 'desviacion':
      return est.desviacionPoblacional;
    case 'cuasidesviacion':
      return est.desviacionMuestral;
    case 'q1':
      return est.q1;
    case 'q3':
      return est.q3;
    case 'iqr':
      return est.iqr;
    case 'diferencia-media-mediana':
      return est.media - est.mediana;
  }
}

// ============================================================
// CORRECCIÓN
// ============================================================

/**
 * Tolerancia de corrección: la mayor entre ±0,01 y el 1 % del valor esperado.
 *
 * El mínimo absoluto evita castigar el redondeo en respuestas pequeñas (2,14 frente a
 * 2,1381) y el porcentaje evita ser absurdamente estricto en respuestas grandes.
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
// LOS PASOS DE LA SOLUCIÓN
// ============================================================

/** Los datos ordenados, escritos como se leen. */
function pasoOrdenar(datos: readonly number[]): string {
  const ordenados = [...datos].sort((a, b) => a - b);
  return `Ordena los ${datos.length} valores de menor a mayor: ${textoDeSerie(ordenados)}`;
}

/** Tabla de frecuencias en una línea: «7 → 3 veces · 9 → 3 veces …». */
function pasoFrecuencias(datos: readonly number[]): string {
  const ordenados = [...datos].sort((a, b) => a - b);
  const vistos: number[] = [];
  const trozos: string[] = [];
  for (const v of ordenados) {
    if (vistos.includes(v)) continue;
    vistos.push(v);
    const veces = ordenados.filter((x) => x === v).length;
    trozos.push(`${formatearFlexible(v)} aparece ${veces} ${veces === 1 ? 'vez' : 'veces'}`);
  }
  return `Cuenta cuántas veces aparece cada valor: ${trozos.join(' · ')}`;
}

/** Los pasos de una desviación típica, con el divisor que corresponda al convenio. */
function pasosDesviacion(datos: readonly number[], est: EstadisticasSerie, poblacional: boolean): string[] {
  const ordenados = [...datos].sort((a, b) => a - b);
  const cuadrados = ordenados
    .map((v) => `(${formatearFlexible(v)} − ${formatearFlexible(est.media)})² = ${formatearFlexible(Math.pow(v - est.media, 2))}`)
    .join(' · ');
  const divisor = poblacional ? est.n : est.n - 1;
  const varianza = poblacional ? est.varianzaPoblacional : est.varianzaMuestral;
  const desviacion = poblacional ? est.desviacionPoblacional : est.desviacionMuestral;
  return [
    `Calcula la media: ${formatearFlexible(est.suma)} ÷ ${est.n} = ${formatearFlexible(est.media)}`,
    `Resta la media a cada dato y eleva al cuadrado: ${cuadrados}`,
    `Suma esos cuadrados: ${formatearFlexible(est.sumaCuadrados)}`,
    poblacional
      ? `Divide entre n = ${divisor} (varianza poblacional): ${formatearFlexible(varianza)}`
      : `Divide entre n − 1 = ${divisor} (cuasivarianza, corrección de Bessel): ${formatearFlexible(varianza)}`,
    `Raíz cuadrada: ${poblacional ? 'σ' : 's'} = √${formatearFlexible(varianza)} = ${formatearFlexible(desviacion)}`,
  ];
}

/** Los pasos de un cuartil, con la posición explicada como la calcula la app. */
function pasosCuartil(datos: readonly number[], est: EstadisticasSerie, tercero: boolean): string[] {
  const ordenados = [...datos].sort((a, b) => a - b);
  const proporcion = tercero ? 0.75 : 0.25;
  const indice = Math.floor(est.n * proporcion);
  const posicion = indice + 1;
  const valor = tercero ? est.q3 : est.q1;
  return [
    pasoOrdenar(datos),
    `Posición del cuartil: parte entera de ${est.n} × ${formatearFlexible(proporcion)} = ${indice}, así que se toma el valor que ocupa el lugar ${posicion} contando desde el principio.`,
    `El valor del lugar ${posicion} es ${formatearFlexible(valor)}, así que ${tercero ? 'Q3' : 'Q1'} = ${formatearFlexible(valor)}.`,
    `Comprobación: el valor de al lado (lugar ${tercero ? posicion - 1 : posicion + 1}) es ${formatearFlexible(ordenados[tercero ? posicion - 2 : posicion])}, el mismo número, así que cualquier método de cuartiles da este resultado.`,
  ];
}

/** Genera los pasos que corresponden a la medida pedida. */
function construirPasos(medida: MedidaEstadistica, datos: readonly number[], est: EstadisticasSerie): string[] {
  const ordenados = [...datos].sort((a, b) => a - b);

  switch (medida) {
    case 'media':
      return [
        `Suma los ${est.n} valores: ${ordenados.map((v) => formatearFlexible(v)).join(' + ')} = ${formatearFlexible(est.suma)}`,
        `Divide entre el número de datos: ${formatearFlexible(est.suma)} ÷ ${est.n} = ${formatearFlexible(est.media)}`,
      ];

    case 'mediana':
      return est.n % 2 === 0
        ? [
            pasoOrdenar(datos),
            `Hay ${est.n} datos, un número PAR: no hay un único valor central, sino dos, los que ocupan los lugares ${est.n / 2} y ${est.n / 2 + 1}: ${formatearFlexible(ordenados[est.n / 2 - 1])} y ${formatearFlexible(ordenados[est.n / 2])}.`,
            `La mediana es el promedio de esos dos: (${formatearFlexible(ordenados[est.n / 2 - 1])} + ${formatearFlexible(ordenados[est.n / 2])}) ÷ 2 = ${formatearFlexible(est.mediana)}`,
          ]
        : [
            pasoOrdenar(datos),
            `Hay ${est.n} datos, un número IMPAR: la mediana es el valor que queda justo en el centro, el del lugar ${(est.n + 1) / 2}.`,
            `Ese valor es ${formatearFlexible(est.mediana)}, así que la mediana es ${formatearFlexible(est.mediana)}.`,
          ];

    case 'moda':
      return [
        pasoFrecuencias(datos),
        `El valor más repetido es ${formatearFlexible(est.modas[0])}, con ${est.maxFrec} apariciones: esa es la moda.`,
      ];

    case 'moda-menor':
      return [
        pasoFrecuencias(datos),
        `Hay DOS valores que se repiten el mismo número de veces (${est.maxFrec}): ${est.modas.map((m) => formatearFlexible(m)).join(' y ')}. El conjunto es bimodal, así que tiene dos modas.`,
        `La menor de las dos es ${formatearFlexible(Math.min(...est.modas))}.`,
      ];

    case 'rango':
      return [
        pasoOrdenar(datos),
        `El mayor es ${formatearFlexible(est.maximo)} y el menor ${formatearFlexible(est.minimo)}.`,
        `Rango = máximo − mínimo = ${formatearFlexible(est.maximo)} − ${formatearFlexible(est.minimo)} = ${formatearFlexible(est.rango)}`,
      ];

    case 'desviacion':
      return pasosDesviacion(datos, est, true);

    case 'cuasidesviacion':
      return pasosDesviacion(datos, est, false);

    case 'q1':
      return pasosCuartil(datos, est, false);

    case 'q3':
      return pasosCuartil(datos, est, true);

    case 'iqr':
      return [
        pasoOrdenar(datos),
        `Q1 = ${formatearFlexible(est.q1)} y Q3 = ${formatearFlexible(est.q3)}.`,
        `Recorrido intercuartílico = Q3 − Q1 = ${formatearFlexible(est.q3)} − ${formatearFlexible(est.q1)} = ${formatearFlexible(est.iqr)}`,
      ];

    case 'diferencia-media-mediana':
      return [
        `Media: suma los ${est.n} valores (${formatearFlexible(est.suma)}) y divide entre ${est.n}: ${formatearFlexible(est.media)}`,
        pasoOrdenar(datos),
        `Mediana: con ${est.n} datos (impar), el valor central es ${formatearFlexible(est.mediana)}.`,
        `Diferencia = media − mediana = ${formatearFlexible(est.media)} − ${formatearFlexible(est.mediana)} = ${formatearFlexible(est.media - est.mediana)}`,
        `Ese hueco lo abre un solo dato: el valor atípico ${formatearFlexible(est.maximo)} tira de la media hacia arriba, mientras que la mediana ni se entera porque solo mira quién está en el centro.`,
      ];
  }
}

// ============================================================
// LOS 12 CASOS NUMERADOS
// ============================================================

/**
 * Definición de un caso: solo los DATOS y el texto. La respuesta y los pasos salen de las
 * funciones de arriba, nunca escritos a mano (ver cabecera).
 */
interface DefinicionCaso {
  id: number;
  titulo: string;
  enunciado: string;
  categoria: 'abstracto' | 'aplicado';
  medida: MedidaEstadistica;
  datos: readonly number[];
  etiquetaDatos: string;
  datosComparacion?: readonly number[];
  etiquetaComparacion?: string;
  etiquetaRespuesta: string;
  unidad: string;
  /** Pasos que se añaden ANTES de los que genera el motor (comparaciones, contexto). */
  pasosPrevios?: readonly string[];
  pista: string;
}

const DEFINICIONES: readonly DefinicionCaso[] = [
  {
    id: 1,
    titulo: 'La media de un grupo pequeño',
    enunciado:
      'Cinco estudiantes obtienen estas puntuaciones sobre 10 en una prueba: 4, 6, 7, 8 y 10. ¿Cuál es la media?',
    categoria: 'abstracto',
    medida: 'media',
    datos: [4, 6, 7, 8, 10],
    etiquetaDatos: 'Puntuaciones (sobre 10)',
    etiquetaRespuesta: 'Media, en puntos',
    unidad: 'puntos',
    pista: 'La media son dos operaciones seguidas: primero sumar TODOS los valores, después dividir entre cuántos son.',
  },
  {
    id: 2,
    titulo: 'Mediana con un número impar de datos',
    enunciado:
      'Siete personas tardan estos minutos en llegar a clase: 12, 15, 9, 20, 14, 11 y 18. ¿Cuál es la mediana?',
    categoria: 'abstracto',
    medida: 'mediana',
    datos: [12, 15, 9, 20, 14, 11, 18],
    etiquetaDatos: 'Minutos de trayecto',
    etiquetaRespuesta: 'Mediana, en minutos',
    unidad: 'minutos',
    pista: 'Antes de buscar el centro hay que ORDENAR. La mediana no es el valor que está en medio de la lista escrita, sino de la lista ordenada.',
  },
  {
    id: 3,
    titulo: 'Mediana con un número par de datos',
    enunciado:
      'Seis mediciones de humedad relativa dan estos porcentajes: 13, 8, 21, 16, 10 y 19. ¿Cuál es la mediana?',
    categoria: 'abstracto',
    medida: 'mediana',
    datos: [13, 8, 21, 16, 10, 19],
    etiquetaDatos: 'Mediciones (%)',
    etiquetaRespuesta: 'Mediana, en %',
    unidad: '%',
    pista: 'Con un número PAR de datos no hay un valor central: hay dos. La mediana es el promedio de esos dos, y puede no coincidir con ningún dato de la lista.',
  },
  {
    id: 4,
    titulo: 'La moda de un conjunto',
    enunciado:
      'Ocho estudiantes dicen cuántos libros han leído este curso: 3, 5, 4, 5, 2, 5, 6 y 4. ¿Cuál es la moda?',
    categoria: 'aplicado',
    medida: 'moda',
    datos: [3, 5, 4, 5, 2, 5, 6, 4],
    etiquetaDatos: 'Libros leídos',
    etiquetaRespuesta: 'Moda, en libros',
    unidad: 'libros',
    pista: 'La moda no es el valor más grande ni el del medio: es el que MÁS SE REPITE. Conviene contar las apariciones de cada valor antes de responder.',
  },
  {
    id: 5,
    titulo: 'Un conjunto con dos modas',
    enunciado:
      'Nueve jugadoras anotan estos puntos en un partido: 7, 9, 7, 12, 9, 15, 7, 9 y 11. Este conjunto tiene DOS modas. ¿Cuál es la MENOR de las dos?',
    categoria: 'abstracto',
    medida: 'moda-menor',
    datos: [7, 9, 7, 12, 9, 15, 7, 9, 11],
    etiquetaDatos: 'Puntos anotados',
    etiquetaRespuesta: 'La menor de las dos modas, en puntos',
    unidad: 'puntos',
    pista: 'Cuando dos valores empatan en número de apariciones, el conjunto es bimodal y las dos son moda. Aquí se pide solo la más pequeña.',
  },
  {
    id: 6,
    titulo: 'El rango de una serie',
    enunciado:
      'Durante seis días se anotan estas temperaturas máximas en grados Celsius: 18, 21, 16, 23, 20 y 15. ¿Cuál es el rango?',
    categoria: 'aplicado',
    medida: 'rango',
    datos: [18, 21, 16, 23, 20, 15],
    etiquetaDatos: 'Temperaturas máximas (°C)',
    etiquetaRespuesta: 'Rango, en °C',
    unidad: '°C',
    pista: 'El rango mide la AMPLITUD, no el centro: es una resta entre el valor más alto y el más bajo.',
  },
  {
    id: 7,
    titulo: 'Desviación típica poblacional (÷ n)',
    enunciado:
      'Un jugador anota estos puntos en ocho partidos: 2, 4, 4, 4, 5, 5, 7 y 9. Calcula la desviación típica POBLACIONAL (σ), la que divide entre n.',
    categoria: 'abstracto',
    medida: 'desviacion',
    datos: [2, 4, 4, 4, 5, 5, 7, 9],
    etiquetaDatos: 'Puntos por partido',
    etiquetaRespuesta: 'Desviación típica poblacional σ, en puntos',
    unidad: 'puntos',
    pista: 'Cuatro pasos: media, restar la media a cada dato y elevar al cuadrado, sumar esos cuadrados y dividir entre n, y por último la raíz cuadrada.',
  },
  {
    id: 8,
    titulo: 'Los MISMOS datos, dividiendo entre n − 1',
    enunciado:
      'Con el mismo conjunto del caso 7 (2, 4, 4, 4, 5, 5, 7 y 9), calcula ahora la cuasidesviación típica MUESTRAL (s), la que divide entre n − 1. Redondea a 2 decimales.',
    categoria: 'abstracto',
    medida: 'cuasidesviacion',
    datos: [2, 4, 4, 4, 5, 5, 7, 9],
    etiquetaDatos: 'Puntos por partido (los mismos del caso 7)',
    etiquetaRespuesta: 'Cuasidesviación típica muestral s, en puntos',
    unidad: 'puntos',
    pasosPrevios: [
      'Todo es igual que en el caso 7 hasta la suma de cuadrados. Lo único que cambia es el divisor: n − 1 en vez de n.',
    ],
    pista: 'Se divide entre 7, no entre 8. Al dividir entre un número más pequeño el resultado sale MAYOR que el del caso 7: compara los dos números y quédate con esa idea.',
  },
  {
    id: 9,
    titulo: 'El primer cuartil (Q1)',
    enunciado:
      'Once estudiantes indican cuántos libros han leído en un año: 4, 6, 7, 7, 8, 9, 10, 12, 12, 14 y 15. ¿Cuál es el primer cuartil (Q1)?',
    categoria: 'aplicado',
    medida: 'q1',
    datos: [4, 6, 7, 7, 8, 9, 10, 12, 12, 14, 15],
    etiquetaDatos: 'Libros leídos por 11 estudiantes',
    etiquetaRespuesta: 'Primer cuartil Q1, en libros',
    unidad: 'libros',
    pista: 'Q1 deja por debajo la cuarta parte de los datos. Con 11 datos, la posición sale de 11 × 0,25 = 2,75: se toma el valor del lugar 3 de la lista ordenada.',
  },
  {
    id: 10,
    titulo: 'El tercer cuartil (Q3)',
    enunciado:
      'Estas son las temperaturas máximas en grados Celsius de once días: 26, 30, 22, 34, 25, 38, 28, 31, 34, 20 y 40. ¿Cuál es el tercer cuartil (Q3)?',
    categoria: 'aplicado',
    medida: 'q3',
    datos: [26, 30, 22, 34, 25, 38, 28, 31, 34, 20, 40],
    etiquetaDatos: 'Temperaturas máximas (°C)',
    etiquetaRespuesta: 'Tercer cuartil Q3, en °C',
    unidad: '°C',
    pista: 'Q3 deja por debajo tres cuartas partes de los datos. Con 11 datos, 11 × 0,75 = 8,25: se toma el valor del lugar 9 de la lista ordenada.',
  },
  {
    id: 11,
    titulo: 'Un valor atípico dispara la media',
    enunciado:
      'Nueve personas tardan estos minutos en el mismo trayecto: 10, 11, 12, 12, 13, 14, 15, 16 y 59 (esta última se quedó atrapada en una avería). Calcula la media, calcula la mediana y responde con la DIFERENCIA media − mediana.',
    categoria: 'aplicado',
    medida: 'diferencia-media-mediana',
    datos: [10, 11, 12, 12, 13, 14, 15, 16, 59],
    etiquetaDatos: 'Minutos de trayecto',
    etiquetaRespuesta: 'Diferencia media − mediana, en minutos',
    unidad: 'minutos',
    pista: 'Calcula las dos medidas por separado y réstalas. Fíjate en cuál de las dos se parece a lo que tarda la mayoría: esa es la que conviene dar cuando hay valores atípicos.',
  },
  {
    id: 12,
    titulo: 'Misma media, distinta dispersión',
    enunciado:
      'Dos grupos hacen la misma prueba sobre 40 puntos. Grupo A: 17, 19, 20, 21 y 23. Grupo B: 11, 17, 20, 23 y 29. Los dos tienen la misma media. Calcula la desviación típica POBLACIONAL (σ) del grupo MÁS DISPERSO.',
    categoria: 'aplicado',
    medida: 'desviacion',
    datos: [11, 17, 20, 23, 29],
    etiquetaDatos: 'Grupo B (puntos)',
    datosComparacion: [17, 19, 20, 21, 23],
    etiquetaComparacion: 'Grupo A (puntos)',
    etiquetaRespuesta: 'Desviación típica σ del grupo más disperso, en puntos',
    unidad: 'puntos',
    pasosPrevios: [
      'Los dos grupos tienen media 20: (17 + 19 + 20 + 21 + 23) ÷ 5 = 20 y (11 + 17 + 20 + 23 + 29) ÷ 5 = 20. La media sola no distingue un grupo del otro.',
      'El grupo A va de 17 a 23 (rango 6) y el grupo B de 11 a 29 (rango 18): el más disperso es el B, así que la desviación que se pide es la suya.',
    ],
    pista: 'Primero decide QUÉ grupo es el más disperso mirando cuánto se alejan sus valores de la media común; después calcula solo la desviación de ese grupo.',
  },
];

/** Convierte una definición en un caso resuelto. La respuesta la calcula el motor. */
function construirCaso(def: DefinicionCaso): CasoEstadistica {
  const est = calcularEstadisticas(def.datos);
  const respuesta = resolverCaso(def.medida, def.datos);
  const pasos = est === null ? [] : [...(def.pasosPrevios ?? []), ...construirPasos(def.medida, def.datos, est)];

  return {
    id: def.id,
    titulo: def.titulo,
    enunciado: def.enunciado,
    categoria: def.categoria,
    medida: def.medida,
    datos: def.datos,
    textoDatos: textoDeSerie(def.datos),
    etiquetaDatos: def.etiquetaDatos,
    datosComparacion: def.datosComparacion ?? null,
    textoDatosComparacion: def.datosComparacion ? textoDeSerie(def.datosComparacion) : null,
    etiquetaComparacion: def.etiquetaComparacion ?? null,
    etiquetaRespuesta: def.etiquetaRespuesta,
    unidad: def.unidad,
    respuesta,
    respuestaTexto: formatearFlexible(respuesta),
    requiereRedondeo: Math.abs(respuesta - redondear(respuesta, 2)) > 1e-9,
    pasos,
    pista: def.pista,
  };
}

/**
 * Los 12 casos numerados, FIJOS y deterministas: el caso 3 es el mismo para todo el mundo
 * y en cualquier visita. Es lo que permite mandar «resuelve el 3, el 7 y el 11».
 */
export const CASOS: readonly CasoEstadistica[] = DEFINICIONES.map(construirCaso);

/** Cuántos casos hay. Se deriva del array para que nunca discrepe del contador de la UI. */
export const TOTAL_CASOS = CASOS.length;

// ============================================================
// PRÁCTICA: EJERCICIOS ALEATORIOS
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

/**
 * Contextos universales para los ejercicios generados: sin ciudades, sin países y sin
 * moneda, porque la mitad de quien entra aquí no vive en el mismo sitio que quien escribe.
 */
interface ContextoAleatorio {
  nombre: string;
  unidad: string;
  minimo: number;
  maximo: number;
}

const CONTEXTOS: readonly ContextoAleatorio[] = [
  { nombre: 'puntuaciones sobre 10 de un grupo', unidad: 'puntos', minimo: 1, maximo: 10 },
  { nombre: 'temperaturas máximas de varios días, en grados Celsius', unidad: '°C', minimo: 8, maximo: 34 },
  { nombre: 'minutos que tardan varias personas en un trayecto', unidad: 'minutos', minimo: 5, maximo: 45 },
  { nombre: 'libros leídos en un año por varios estudiantes', unidad: 'libros', minimo: 0, maximo: 20 },
  { nombre: 'segundos de más que tardan varios corredores respecto al primero', unidad: 'segundos', minimo: 1, maximo: 60 },
];

/**
 * Medidas que puede pedir un ejercicio aleatorio.
 *
 * Los CUARTILES quedan fuera a propósito: su resultado depende del método, y con datos
 * inventados no se puede garantizar que el de esta app coincida con el que enseña cada
 * libro de texto. En los 12 casos fijos sí se puede, porque los datos están elegidos para
 * que todos los métodos den lo mismo (ver cabecera), y ahí es donde se practican.
 */
const MEDIDAS_ALEATORIAS: readonly MedidaEstadistica[] = ['media', 'mediana', 'rango', 'desviacion'];

const PREGUNTA: Record<string, string> = {
  media: '¿Cuál es la media?',
  mediana: '¿Cuál es la mediana?',
  rango: '¿Cuál es el rango?',
  desviacion: '¿Cuál es la desviación típica POBLACIONAL (σ), la que divide entre n?',
};

const ETIQUETA: Record<string, string> = {
  media: 'Media',
  mediana: 'Mediana',
  rango: 'Rango',
  desviacion: 'Desviación típica poblacional σ',
};

/**
 * Genera un ejercicio nuevo. Si se pasa `semilla`, el ejercicio es reproducible; si no, se
 * toma una del reloj (por eso NUNCA debe llamarse durante el render: el servidor y el
 * navegador obtendrían ejercicios distintos y la hidratación fallaría).
 */
export function generarEjercicioAleatorio(semilla?: number): EjercicioEstadistica {
  const semillaReal =
    semilla !== undefined && Number.isFinite(semilla)
      ? Math.floor(Math.abs(semilla))
      : Math.floor(Date.now() % 2147483647);
  const aleatorio = creadorAleatorio(semillaReal);

  const contexto = CONTEXTOS[Math.floor(aleatorio() * CONTEXTOS.length)];
  const medida = MEDIDAS_ALEATORIAS[Math.floor(aleatorio() * MEDIDAS_ALEATORIAS.length)];
  const n = 5 + Math.floor(aleatorio() * 5); // entre 5 y 9 datos

  const datos: number[] = [];
  for (let i = 0; i < n; i++) {
    datos.push(contexto.minimo + Math.floor(aleatorio() * (contexto.maximo - contexto.minimo + 1)));
  }

  const est = calcularEstadisticas(datos);
  const respuesta = resolverCaso(medida, datos);
  const pasos = est === null ? [] : construirPasos(medida, datos, est);

  return {
    semilla: semillaReal,
    enunciado: `Estos son ${n} datos de ${contexto.nombre}: ${textoDeSerie(datos)}. ${PREGUNTA[medida]}`,
    medida,
    datos,
    textoDatos: textoDeSerie(datos),
    etiquetaRespuesta: `${ETIQUETA[medida]}, en ${contexto.unidad}`,
    unidad: contexto.unidad,
    respuesta,
    respuestaTexto: formatearFlexible(respuesta),
    requiereRedondeo: Math.abs(respuesta - redondear(respuesta, 2)) > 1e-9,
    pasos,
  };
}
