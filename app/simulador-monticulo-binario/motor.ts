/**
 * Motor del montículo binario (heap) — aparte de la vista y sin dependencias de React.
 *
 * El build no puede ver si un sift-up está mal: un montículo mal construido se dibuja
 * igual de bien que uno correcto y engaña a quien lo usa para estudiar. Los casos están
 * resueltos a mano en tests/monticulo-motor.spec.ts ANTES de que la pantalla los muestre.
 *
 * Representación en arreglo, que es la que se pide en clase: para el índice i,
 *   padre        = ⌊(i−1)/2⌋
 *   hijo izquierdo = 2i+1
 *   hijo derecho   = 2i+2
 */

export type TipoMonticulo = 'max' | 'min';

/** Máximo de elementos: por encima, el árbol deja de caber en pantalla y de ser útil. */
export const MAX_ELEMENTOS = 31;

export interface PasoMonticulo {
  /** Estado del arreglo AL TERMINAR este paso */
  arreglo: number[];
  descripcion: string;
  /** Índices que se han comparado en este paso, si los hay */
  comparados: number[];
  /** Índices que se han intercambiado en este paso, si los hay */
  intercambiados: number[];
}

export interface ResultadoOperacion {
  ok: boolean;
  error?: string;
  arreglo: number[];
  pasos: PasoMonticulo[];
  /** Valor sacado de la raíz, solo en extraerRaiz */
  extraido?: number;
}

export const padreDe = (i: number): number => Math.floor((i - 1) / 2);
export const izquierdoDe = (i: number): number => 2 * i + 1;
export const derechoDe = (i: number): number => 2 * i + 2;

/** ¿«a» debe estar por encima de «b» en este tipo de montículo? */
function vaArriba(a: number, b: number, tipo: TipoMonticulo): boolean {
  return tipo === 'max' ? a > b : a < b;
}

function paso(
  arreglo: number[],
  descripcion: string,
  comparados: number[] = [],
  intercambiados: number[] = [],
): PasoMonticulo {
  return { arreglo: [...arreglo], descripcion, comparados, intercambiados };
}

const etq = (tipo: TipoMonticulo) => (tipo === 'max' ? 'mayor' : 'menor');

/**
 * Sube el elemento del índice `i` mientras sea prioritario frente a su padre.
 * Es lo que ocurre tras insertar por el final.
 */
function subir(arreglo: number[], i: number, tipo: TipoMonticulo, pasos: PasoMonticulo[]): void {
  let actual = i;
  while (actual > 0) {
    const padre = padreDe(actual);
    pasos.push(
      paso(arreglo, `Comparo ${arreglo[actual]} (índice ${actual}) con su padre ${arreglo[padre]} (índice ${padre}).`, [actual, padre]),
    );
    if (!vaArriba(arreglo[actual], arreglo[padre], tipo)) {
      pasos.push(paso(arreglo, `${arreglo[actual]} no es ${etq(tipo)} que su padre: se queda donde está.`, [actual, padre]));
      return;
    }
    [arreglo[actual], arreglo[padre]] = [arreglo[padre], arreglo[actual]];
    pasos.push(
      paso(arreglo, `${arreglo[padre]} es ${etq(tipo)} que ${arreglo[actual]}: intercambio y subo al índice ${padre}.`, [], [actual, padre]),
    );
    actual = padre;
  }
  pasos.push(paso(arreglo, 'He llegado a la raíz: no hay más padres con los que comparar.', [0]));
}

/**
 * Baja el elemento del índice `i` mientras alguno de sus hijos sea prioritario.
 * Es lo que ocurre tras extraer la raíz y tras cada paso de heapify.
 */
function bajar(arreglo: number[], i: number, tamano: number, tipo: TipoMonticulo, pasos: PasoMonticulo[]): void {
  let actual = i;
  for (;;) {
    const izq = izquierdoDe(actual);
    const der = derechoDe(actual);
    let elegido = actual;

    if (izq < tamano && vaArriba(arreglo[izq], arreglo[elegido], tipo)) elegido = izq;
    if (der < tamano && vaArriba(arreglo[der], arreglo[elegido], tipo)) elegido = der;

    const hijos = [izq, der].filter((h) => h < tamano);
    if (hijos.length === 0) {
      pasos.push(paso(arreglo, `El índice ${actual} es una hoja: no hay nada debajo.`, [actual]));
      return;
    }
    pasos.push(
      paso(
        arreglo,
        `Comparo ${arreglo[actual]} (índice ${actual}) con sus hijos: ${hijos.map((h) => `${arreglo[h]}`).join(' y ')}.`,
        [actual, ...hijos],
      ),
    );

    if (elegido === actual) {
      pasos.push(paso(arreglo, `Ningún hijo es ${etq(tipo)}: la propiedad de montículo ya se cumple aquí.`, [actual, ...hijos]));
      return;
    }

    [arreglo[actual], arreglo[elegido]] = [arreglo[elegido], arreglo[actual]];
    pasos.push(
      paso(arreglo, `${arreglo[actual]} es ${etq(tipo)}: intercambio y bajo al índice ${elegido}.`, [], [actual, elegido]),
    );
    actual = elegido;
  }
}

/** Inserta un valor por el final y lo sube hasta su sitio. */
export function insertar(arreglo: number[], valor: number, tipo: TipoMonticulo): ResultadoOperacion {
  if (!Number.isFinite(valor)) {
    return { ok: false, error: 'Ese valor no es un número.', arreglo: [...arreglo], pasos: [] };
  }
  if (arreglo.length >= MAX_ELEMENTOS) {
    return {
      ok: false,
      error: `El montículo ya tiene ${MAX_ELEMENTOS} elementos, que es el máximo que cabe en pantalla.`,
      arreglo: [...arreglo],
      pasos: [],
    };
  }
  const copia = [...arreglo, valor];
  const pasos: PasoMonticulo[] = [
    paso(copia, `Coloco ${valor} en la primera posición libre (índice ${copia.length - 1}) y lo hago subir.`, [copia.length - 1]),
  ];
  subir(copia, copia.length - 1, tipo, pasos);
  return { ok: true, arreglo: copia, pasos };
}

/** Saca la raíz, sube el último elemento a la raíz y lo hace bajar. */
export function extraerRaiz(arreglo: number[], tipo: TipoMonticulo): ResultadoOperacion {
  if (arreglo.length === 0) {
    return { ok: false, error: 'El montículo está vacío: no hay raíz que extraer.', arreglo: [], pasos: [] };
  }
  const copia = [...arreglo];
  const extraido = copia[0];
  const ultimo = copia.pop() as number;
  const pasos: PasoMonticulo[] = [];

  if (copia.length === 0) {
    pasos.push(paso(copia, `Extraigo la raíz ${extraido}. El montículo se queda vacío.`));
    return { ok: true, arreglo: copia, pasos, extraido };
  }

  copia[0] = ultimo;
  pasos.push(paso(copia, `Extraigo la raíz ${extraido} y muevo el último elemento (${ultimo}) a la raíz.`, [0]));
  bajar(copia, 0, copia.length, tipo, pasos);
  return { ok: true, arreglo: copia, pasos, extraido };
}

/**
 * Construye el montículo desde un arreglo cualquiera (heapify de Floyd).
 * Va del último nodo con hijos hacia la raíz, no al revés: así es O(n) y no O(n log n).
 */
export function construir(valores: number[], tipo: TipoMonticulo): ResultadoOperacion {
  if (valores.length > MAX_ELEMENTOS) {
    return {
      ok: false,
      error: `Como mucho ${MAX_ELEMENTOS} elementos: por encima el árbol no cabe en pantalla.`,
      arreglo: [],
      pasos: [],
    };
  }
  const copia = [...valores];
  const pasos: PasoMonticulo[] = [paso(copia, 'Punto de partida: el arreglo tal cual, sin ordenar.')];
  const primero = Math.floor(copia.length / 2) - 1;
  if (primero < 0) {
    pasos.push(paso(copia, 'Con menos de dos elementos no hay nada que reordenar.'));
    return { ok: true, arreglo: copia, pasos };
  }
  for (let i = primero; i >= 0; i--) {
    pasos.push(paso(copia, `Hundo el nodo del índice ${i} (valor ${copia[i]}).`, [i]));
    bajar(copia, i, copia.length, tipo, pasos);
  }
  return { ok: true, arreglo: copia, pasos };
}

export interface ResultadoHeapsort {
  ok: boolean;
  error?: string;
  /** Arreglo ordenado. Con montículo MAX queda ascendente; con MIN, descendente. */
  ordenado: number[];
  pasos: PasoMonticulo[];
}

/**
 * Heapsort: construir el montículo y luego sacar la raíz al final del arreglo, n−1 veces.
 * Con un montículo de máximos el resultado queda ASCENDENTE, que es lo que sorprende
 * a casi todo el mundo la primera vez.
 */
export function heapsort(valores: number[], tipo: TipoMonticulo): ResultadoHeapsort {
  const construccion = construir(valores, tipo);
  if (!construccion.ok) return { ok: false, error: construccion.error, ordenado: [], pasos: [] };

  const arreglo = [...construccion.arreglo];
  const pasos = [...construccion.pasos];
  pasos.push(paso(arreglo, 'Montículo construido. Ahora saco la raíz al final del arreglo, una y otra vez.'));

  for (let fin = arreglo.length - 1; fin > 0; fin--) {
    [arreglo[0], arreglo[fin]] = [arreglo[fin], arreglo[0]];
    pasos.push(
      paso(arreglo, `Llevo la raíz ${arreglo[fin]} a la posición ${fin}, que ya queda fija.`, [], [0, fin]),
    );
    bajar(arreglo, 0, fin, tipo, pasos);
  }
  return { ok: true, ordenado: arreglo, pasos };
}

export interface Comprobacion {
  esMonticulo: boolean;
  /** Índice del primer nodo que incumple la propiedad, o null si se cumple */
  indiceProblema: number | null;
  mensaje: string;
}

/** ¿Este arreglo cumple la propiedad de montículo? Y si no, ¿dónde se rompe? */
export function comprobar(arreglo: number[], tipo: TipoMonticulo): Comprobacion {
  for (let i = 0; i < arreglo.length; i++) {
    for (const hijo of [izquierdoDe(i), derechoDe(i)]) {
      if (hijo < arreglo.length && vaArriba(arreglo[hijo], arreglo[i], tipo)) {
        return {
          esMonticulo: false,
          indiceProblema: hijo,
          mensaje: `El índice ${hijo} (valor ${arreglo[hijo]}) es ${etq(tipo)} que su padre del índice ${i} (valor ${arreglo[i]}).`,
        };
      }
    }
  }
  return {
    esMonticulo: true,
    indiceProblema: null,
    mensaje:
      arreglo.length === 0
        ? 'El montículo está vacío, así que cumple la propiedad por definición.'
        : `Todo padre es ${etq(tipo)} o igual que sus hijos: es un montículo de ${tipo === 'max' ? 'máximos' : 'mínimos'} válido.`,
  };
}
