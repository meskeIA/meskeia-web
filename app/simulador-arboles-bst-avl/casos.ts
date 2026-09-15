/**
 * Casos para clase — la tarea asignable de `simulador-arboles-bst-avl`.
 *
 * Vive fuera de `page.tsx` porque el build compila la vista sin comprobar si el árbol está
 * bien: un SVG con círculos unidos por líneas pasa cualquier compilación aunque la rotación
 * esté al revés ([[feedback_motor_calculo_aparte_y_probado]]). Aquí no hay React ni DOM,
 * solo funciones puras.
 *
 * ── UNA SOLA IMPLEMENTACIÓN ───────────────────────────────────────────────────
 *
 * Ni una línea de lógica de árboles se escribe en este fichero: todo se importa de
 * `./motor.ts`, que es EXACTAMENTE el módulo con el que la app dibuja su panel. Si los casos
 * corrigieran con un convenio y la app calculara con otro, la app suspendería una respuesta
 * que ella misma acaba de imprimir en pantalla, que es el peor fallo posible en algo que
 * corrige a un alumno.
 *
 * Los convenios (altura en NODOS, factor de balance izq − der, sucesor inorden al borrar,
 * duplicado que no se inserta) están documentados en la cabecera de `./motor.ts`.
 *
 * ⚠️ Las funciones del motor MUTAN el nodo que reciben. Por eso `construirArbol` arranca
 * SIEMPRE de `null` y reconstruye el árbol entero en cada llamada: si dos casos compartieran
 * una raíz, el segundo heredaría las inserciones del primero y dejaría de ser determinista.
 */

import {
  altura,
  bfs,
  contarHojas,
  contarNodos,
  eliminarAVLConLog,
  eliminarBST,
  factorBalance,
  inorden,
  insertarAVLConLog,
  insertarBST,
  postorden,
  preorden,
  type NodoArbol,
} from './motor';

/* ─────────────────────────── Datos de un caso ─────────────────────────── */

/** BST sin rebalanceo, o AVL con las cuatro rotaciones. Es el selector del panel. */
export type Modo = 'bst' | 'avl';

/**
 * Qué número pide el enunciado. Cada uno se lee del árbol YA construido, con las funciones
 * del motor: nunca con una cuenta paralela hecha aquí.
 */
export type Pregunta =
  | 'altura'
  | 'rotaciones'
  | 'factorRaiz'
  | 'valorRaiz'
  | 'hojas'
  | 'nodos'
  | 'posicionInorden'
  | 'kesimoInorden';

export interface DatosCaso {
  modo: Modo;
  /** Valores que se insertan, EN ESTE ORDEN. El orden es el tema de la app. */
  inserciones: number[];
  /** Valores que se eliminan después, en este orden. Opcional. */
  eliminaciones?: number[];
  pregunta: Pregunta;
  /** Valor buscado dentro del recorrido inorden (solo para `posicionInorden`). */
  valor?: number;
  /** Posición pedida del recorrido inorden, contando desde 1 (solo para `kesimoInorden`). */
  k?: number;
}

/* ─────────────────────────── Construcción del árbol ─────────────────────────── */

/** Formatea un número en español. Aquí todo son enteros, pero la regla es la regla. */
function numero(n: number, decimales = 0): string {
  if (!Number.isFinite(n)) return '—';
  return n.toLocaleString('es-ES', { maximumFractionDigits: decimales });
}

/** Una lista de valores tal como se lee en el enunciado: «10, 20, 30». */
export function listaDeValores(valores: readonly number[]): string {
  return valores.map((v) => numero(v)).join(', ');
}

/** «1 nodo» / «7 nodos». La traza la lee un alumno, así que la concordancia importa. */
function plural(n: number, singular: string, plural_: string): string {
  return `${numero(n)} ${n === 1 ? singular : plural_}`;
}

interface Construccion {
  raiz: NodoArbol | null;
  /** El registro de rotaciones que devuelve el propio motor, en orden de ejecución. */
  rotaciones: string[];
  /** La traza que ve el alumno: una línea por operación. */
  traza: string[];
}

/**
 * Ejecuta las inserciones y los borrados sobre un árbol NUEVO y devuelve el resultado.
 *
 * El duplicado no se detecta con una búsqueda escrita aquí, sino contando nodos antes y
 * después: si el recuento no sube, el motor ha rechazado el valor. Así no hay una segunda
 * definición de «este valor ya estaba» que pueda discrepar de la del motor.
 */
function construirArbol(datos: DatosCaso): Construccion {
  let raiz: NodoArbol | null = null;
  const rotaciones: string[] = [];
  const traza: string[] = [];

  traza.push(
    datos.modo === 'avl'
      ? 'Modo AVL: tras cada inserción se comprueba el factor de balance y, si se sale de {−1, 0, +1}, se rota.'
      : 'Modo BST: el árbol NUNCA rebalancea. Cada valor se cuelga donde cae y ahí se queda.',
  );

  for (const v of datos.inserciones) {
    const nodosAntes = contarNodos(raiz);
    const rotacionesAntes = rotaciones.length;

    raiz = datos.modo === 'bst' ? insertarBST(raiz, v) : insertarAVLConLog(raiz, v, rotaciones);

    if (contarNodos(raiz) === nodosAntes) {
      traza.push(`Inserto ${numero(v)}: ya estaba en el árbol, así que NO se inserta. El árbol no cambia.`);
      continue;
    }

    const nuevas = rotaciones.slice(rotacionesAntes);
    const estado = `raíz ${numero(raiz.valor)}, altura ${numero(altura(raiz))} y ${plural(contarNodos(raiz), 'nodo', 'nodos')}`;
    const sinRotar = datos.modo === 'bst' ? 'el nodo se queda donde cae' : 'no hace falta rotar';
    traza.push(
      nuevas.length === 0
        ? `Inserto ${numero(v)}: ${sinRotar}. Queda ${estado}.`
        : `Inserto ${numero(v)}: ${nuevas.join(' y después ')}. Queda ${estado}.`,
    );
  }

  const eliminaciones = datos.eliminaciones ?? [];
  if (eliminaciones.length > 0) {
    traza.push(
      'Al borrar un nodo con DOS hijos sube su sucesor inorden, es decir el mínimo del subárbol derecho.',
    );
  }

  for (const v of eliminaciones) {
    const rotacionesAntes = rotaciones.length;
    raiz = datos.modo === 'bst' ? eliminarBST(raiz, v) : eliminarAVLConLog(raiz, v, rotaciones);

    const nuevas = rotaciones.slice(rotacionesAntes);
    const estado = raiz
      ? `raíz ${numero(raiz.valor)}, altura ${numero(altura(raiz))} y ${plural(contarNodos(raiz), 'nodo', 'nodos')}`
      : 'el árbol vacío';
    traza.push(
      nuevas.length === 0
        ? `Elimino ${numero(v)}: no hace falta rotar. Queda ${estado}.`
        : `Elimino ${numero(v)}: ${nuevas.join(' y después ')}. Queda ${estado}.`,
    );
  }

  return { raiz, rotaciones, traza };
}

/* ─────────────────────────── Resolución ─────────────────────────── */

export interface Resolucion {
  ok: boolean;
  valor: number;
  pasos: string[];
  error?: string;
}

/**
 * Recalcula la respuesta EJECUTANDO el motor, sin mirar el campo `respuesta` del caso.
 *
 * Nunca lanza: un `throw` dentro de un render de React tumbaría la app entera, mientras que
 * un `{ ok: false }` se pinta como un aviso.
 */
export function resolverCaso(datos: DatosCaso): Resolucion {
  if (!Array.isArray(datos.inserciones) || datos.inserciones.length === 0) {
    return { ok: false, valor: NaN, pasos: [], error: 'El caso no declara ninguna inserción.' };
  }
  if (datos.inserciones.some((v) => !Number.isFinite(v))) {
    return { ok: false, valor: NaN, pasos: [], error: 'Hay un valor que no es un número.' };
  }

  const { raiz, rotaciones, traza } = construirArbol(datos);
  const pasos = [...traza];

  if (!raiz) {
    return { ok: false, valor: NaN, pasos, error: 'El árbol ha quedado vacío: no hay nada que medir.' };
  }

  let valor: number;
  switch (datos.pregunta) {
    case 'altura':
      valor = altura(raiz);
      pasos.push(
        `La altura se cuenta en NODOS: una hoja mide 1. El árbol final mide ${numero(valor)}.`,
      );
      break;
    case 'rotaciones':
      valor = rotaciones.length;
      pasos.push(
        valor === 0
          ? 'No se ha ejecutado ninguna rotación: el factor de balance nunca se salió de {−1, 0, +1}.'
          : `Rotaciones ejecutadas en total: ${numero(valor)}. Una rotación doble (LR o RL) cuenta como UNA.`,
      );
      break;
    case 'factorRaiz':
      valor = factorBalance(raiz);
      pasos.push(
        `Factor de balance de la raíz ${numero(raiz.valor)} = altura(izquierdo) − altura(derecho) = ${numero(altura(raiz.izq))} − ${numero(altura(raiz.der))} = ${numero(valor)}.`,
      );
      break;
    case 'valorRaiz':
      valor = raiz.valor;
      pasos.push(`El valor que queda arriba del todo es ${numero(valor)}.`);
      break;
    case 'hojas':
      valor = contarHojas(raiz);
      pasos.push(
        `Una hoja es un nodo SIN hijos. En el árbol final hay ${numero(valor)} de ${numero(contarNodos(raiz))} nodos.`,
      );
      break;
    case 'nodos':
      valor = contarNodos(raiz);
      pasos.push(`El árbol final tiene ${numero(valor)} nodos.`);
      break;
    case 'posicionInorden': {
      const recorrido = inorden(raiz, []);
      const buscado = datos.valor;
      if (!Number.isFinite(buscado)) {
        return { ok: false, valor: NaN, pasos, error: 'El caso no dice qué valor hay que localizar.' };
      }
      const indice = recorrido.indexOf(buscado as number);
      if (indice === -1) {
        return { ok: false, valor: NaN, pasos, error: 'Ese valor no está en el árbol final.' };
      }
      valor = indice + 1;
      pasos.push(`El recorrido inorden sale ordenado de menor a mayor: ${listaDeValores(recorrido)}.`);
      pasos.push(`${numero(buscado as number)} ocupa la posición ${numero(valor)} contando desde 1.`);
      break;
    }
    case 'kesimoInorden': {
      const recorrido = inorden(raiz, []);
      const k = datos.k;
      if (!Number.isFinite(k) || (k as number) < 1 || (k as number) > recorrido.length) {
        return {
          ok: false,
          valor: NaN,
          pasos,
          error: `La posición pedida está fuera del árbol, que tiene ${numero(recorrido.length)} nodos.`,
        };
      }
      valor = recorrido[(k as number) - 1];
      pasos.push(`El recorrido inorden sale ordenado de menor a mayor: ${listaDeValores(recorrido)}.`);
      pasos.push(`La posición ${numero(k as number)} la ocupa el ${numero(valor)}.`);
      break;
    }
    default:
      return { ok: false, valor: NaN, pasos, error: 'Pregunta desconocida.' };
  }

  if (!Number.isFinite(valor)) {
    return { ok: false, valor: NaN, pasos, error: 'El resultado no es un número finito.' };
  }

  return { ok: true, valor, pasos };
}

/**
 * Los cuatro recorridos del árbol final. Los usa la solución desplegable cuando el caso va
 * de recorridos, y no calcula nada por su cuenta: llama al motor.
 */
export function recorridosDe(datos: DatosCaso): {
  inorden: number[];
  preorden: number[];
  postorden: number[];
  niveles: number[];
} {
  const { raiz } = construirArbol(datos);
  return {
    inorden: inorden(raiz, []),
    preorden: preorden(raiz, []),
    postorden: postorden(raiz, []),
    niveles: bfs(raiz),
  };
}

/* ─────────────────────────── Corrección ─────────────────────────── */

/** El MAYOR entre 0,01 y el 1 % del valor: así un 0 o un 1 no se corrigen a ciegas. */
export function toleranciaDe(valor: number): number {
  return Math.max(0.01, Math.abs(valor) * 0.01);
}

export interface Veredicto {
  correcto: boolean;
  motivo: string;
  diferencia: number;
  tolerancia: number;
}

/**
 * Corrige la respuesta del alumno. Nunca lanza: una entrada que no es un número se responde
 * con un veredicto, no con una excepción que tumbaría el render.
 */
export function comprobarRespuesta(usuario: number, esperado: number): Veredicto {
  const tolerancia = toleranciaDe(esperado);

  if (!Number.isFinite(usuario)) {
    return {
      correcto: false,
      motivo: 'Escribe un número (aquí todas las respuestas son enteras).',
      diferencia: NaN,
      tolerancia,
    };
  }

  const diferencia = Math.abs(usuario - esperado);
  if (diferencia <= tolerancia) {
    return { correcto: true, motivo: '¡Correcto!', diferencia, tolerancia };
  }

  return {
    correcto: false,
    motivo: `No es correcto. Te has desviado ${numero(diferencia, 2)} de la respuesta.`,
    diferencia,
    tolerancia,
  };
}

/* ─────────────────────────── Los doce casos ─────────────────────────── */

export interface Caso {
  id: number;
  titulo: string;
  enunciado: string;
  categoria: 'abstracto' | 'aplicado';
  datos: DatosCaso;
  etiquetaRespuesta: string;
  respuesta: number;
  respuestaTexto: string;
  pasos: string[];
  pista: string;
}

/**
 * Los datos de cada caso. La respuesta NO se escribe aquí: la calcula `resolverCaso` más
 * abajo ejecutando el motor, de modo que editar un enunciado sin tocar la solución es
 * imposible.
 *
 * Sin países, ciudades ni monedas: el 91 % de este canal es de fuera de España y un
 * enunciado anclado excluye a la mayor parte del público que lo va a leer. Y sin marcas: lo
 * que se enseña es la estructura de datos, no un producto.
 */
const DEFINICIONES: ReadonlyArray<Omit<Caso, 'respuesta' | 'respuestaTexto' | 'pasos'>> = [
  {
    id: 1,
    titulo: 'La secuencia ordenada degenera el BST',
    enunciado:
      'Partiendo de un árbol VACÍO y en modo BST (sin rebalanceo), se insertan por este orden: 10, 20, 30, 40, 50, 60, 70. ¿Cuál es la altura final del árbol? La altura se cuenta en nodos: una hoja mide 1.',
    categoria: 'abstracto',
    datos: { modo: 'bst', inserciones: [10, 20, 30, 40, 50, 60, 70], pregunta: 'altura' },
    etiquetaRespuesta: 'altura en nodos',
    pista: 'Cada valor es mayor que todos los anteriores, así que siempre baja por la derecha. Dibuja el resultado: no parece un árbol.',
  },
  {
    id: 2,
    titulo: 'La misma secuencia, ahora en AVL',
    enunciado:
      'Se repite el caso anterior con la MISMA secuencia —10, 20, 30, 40, 50, 60, 70— pero en modo AVL, que rebalancea. ¿Cuál es ahora la altura final del árbol, en nodos?',
    categoria: 'abstracto',
    datos: { modo: 'avl', inserciones: [10, 20, 30, 40, 50, 60, 70], pregunta: 'altura' },
    etiquetaRespuesta: 'altura en nodos',
    pista: 'Un AVL con 7 nodos no puede medir más de 3. Compara tu resultado con el del caso 1: esa diferencia es exactamente lo que aporta el rebalanceo.',
  },
  {
    id: 3,
    titulo: 'Cuántas rotaciones cuesta un índice ordenado',
    enunciado:
      'El índice de una tabla de una base de datos se construye insertando sus claves en un AVL. Llegan ya ordenadas: 5, 10, 15, 20, 25, 30, 35, 40. ¿Cuántas rotaciones ejecuta el árbol en total?',
    categoria: 'aplicado',
    datos: { modo: 'avl', inserciones: [5, 10, 15, 20, 25, 30, 35, 40], pregunta: 'rotaciones' },
    etiquetaRespuesta: 'número de rotaciones',
    pista: 'Insertar en orden creciente solo puede provocar rotaciones RR. Cuenta en qué inserciones se rompe el equilibrio; las dos primeras nunca lo rompen.',
  },
  {
    id: 4,
    titulo: 'Una secuencia que no necesita rotar',
    enunciado:
      'En modo AVL se insertan por este orden: 50, 30, 70, 20, 40, 60, 80. ¿Cuántas rotaciones ejecuta el árbol en total?',
    categoria: 'abstracto',
    datos: { modo: 'avl', inserciones: [50, 30, 70, 20, 40, 60, 80], pregunta: 'rotaciones' },
    etiquetaRespuesta: 'número de rotaciones',
    pista: 'Fíjate en el orden: primero la raíz, luego los dos de en medio, luego las cuatro puntas. El árbol nace ya equilibrado, así que la respuesta puede ser 0.',
  },
  {
    id: 5,
    titulo: 'Quién acaba mandando en la raíz',
    enunciado:
      'En modo AVL se insertan por este orden: 10, 20, 30, 40, 50. ¿Qué valor queda en la raíz del árbol final?',
    categoria: 'abstracto',
    datos: { modo: 'avl', inserciones: [10, 20, 30, 40, 50], pregunta: 'valorRaiz' },
    etiquetaRespuesta: 'valor del nodo raíz',
    pista: 'La raíz no es el primero que se insertó: la primera rotación se lo lleva por delante. Ve paso a paso y anota la raíz tras cada inserción.',
  },
  {
    id: 6,
    titulo: 'Cuántas hojas cuelgan del final',
    enunciado:
      'Las entradas de un diccionario ordenado se guardan en un BST (sin rebalanceo) insertando por este orden: 50, 30, 70, 20, 40, 60, 80, 10, 45. ¿Cuántos nodos hoja tiene el árbol final? Una hoja es un nodo sin ningún hijo.',
    categoria: 'aplicado',
    datos: { modo: 'bst', inserciones: [50, 30, 70, 20, 40, 60, 80, 10, 45], pregunta: 'hojas' },
    etiquetaRespuesta: 'número de nodos hoja',
    pista: 'Dibuja el árbol y tacha todos los nodos que tengan al menos un hijo. Ojo con el 20 y el 40: los dos reciben un hijo al final.',
  },
  {
    id: 7,
    titulo: 'El recorrido inorden sale ordenado',
    enunciado:
      'Las puntuaciones de una ronda de un torneo se insertan en un BST por este orden: 72, 45, 90, 33, 60, 81, 95, 50. Al recorrer el árbol en inorden, ¿en qué posición aparece el 72? Cuenta la primera posición como 1.',
    categoria: 'aplicado',
    datos: {
      modo: 'bst',
      inserciones: [72, 45, 90, 33, 60, 81, 95, 50],
      pregunta: 'posicionInorden',
      valor: 72,
    },
    etiquetaRespuesta: 'posición inorden (contando desde 1)',
    pista: 'No hace falta dibujar el árbol: el recorrido inorden de un BST sale siempre de menor a mayor. Ordena la lista y cuenta.',
  },
  {
    id: 8,
    titulo: 'El duplicado que no entra',
    enunciado:
      'En modo AVL se insertan por este orden: 40, 20, 60, 20, 10, 30. Fíjate en que el 20 aparece dos veces, y un valor repetido NO se inserta. ¿Qué valor ocupa la 3.ª posición del recorrido inorden?',
    categoria: 'abstracto',
    datos: { modo: 'avl', inserciones: [40, 20, 60, 20, 10, 30], pregunta: 'kesimoInorden', k: 3 },
    etiquetaRespuesta: 'valor del nodo',
    pista: 'El árbol final tiene 5 nodos, no 6: el segundo 20 se rechaza. El inorden sale ordenado, así que basta con ordenar los valores DISTINTOS.',
  },
  {
    id: 9,
    titulo: 'El borrado también desequilibra',
    enunciado:
      'En modo AVL se insertan 50, 30, 70, 20, 40, 60, 80 y después se eliminan, por este orden, el 30, el 20 y el 40. ¿Cuál es la altura del árbol final, en nodos?',
    categoria: 'abstracto',
    datos: {
      modo: 'avl',
      inserciones: [50, 30, 70, 20, 40, 60, 80],
      eliminaciones: [30, 20, 40],
      pregunta: 'altura',
    },
    etiquetaRespuesta: 'altura en nodos',
    pista: 'Al borrar el 30, que tiene dos hijos, sube su sucesor inorden. El último borrado deja la raíz con un lado vacío y obliga a rotar: ahí está la gracia del caso.',
  },
  {
    id: 10,
    titulo: 'Quién sustituye al nodo borrado',
    enunciado:
      'Los identificadores de una cola de tareas se guardan en un BST insertando por este orden: 50, 30, 70, 20, 40, 60, 80. Después se elimina el 50, que es la raíz y tiene dos hijos. ¿Qué valor ocupa la raíz tras el borrado?',
    categoria: 'aplicado',
    datos: {
      modo: 'bst',
      inserciones: [50, 30, 70, 20, 40, 60, 80],
      eliminaciones: [50],
      pregunta: 'valorRaiz',
    },
    etiquetaRespuesta: 'valor del nodo raíz',
    pista: 'Cuando el nodo borrado tiene dos hijos sube su SUCESOR inorden: el valor más pequeño de todo su subárbol derecho. No es el hijo derecho sin más.',
  },
  {
    id: 11,
    titulo: 'El factor de balance de la raíz',
    enunciado:
      'En modo BST (sin rebalanceo) se insertan por este orden: 40, 20, 60, 10, 30, 50, 5, 3. ¿Cuál es el factor de balance de la raíz, definido como la altura del subárbol izquierdo menos la del derecho?',
    categoria: 'abstracto',
    datos: { modo: 'bst', inserciones: [40, 20, 60, 10, 30, 50, 5, 3], pregunta: 'factorRaiz' },
    etiquetaRespuesta: 'factor de balance (sin unidad)',
    pista: 'Mide por separado los dos lados de la raíz, contando en nodos. Un valor fuera de {−1, 0, +1} es justo lo que un AVL no toleraría.',
  },
  {
    id: 12,
    titulo: 'Las rotaciones dobles del zig-zag',
    enunciado:
      'Un índice se carga en un AVL con las claves en este orden: 50, 20, 60, 10, 30, 25, 55. ¿Cuántas rotaciones ejecuta el árbol en total? Una rotación doble (LR o RL) cuenta como una sola.',
    categoria: 'aplicado',
    datos: {
      modo: 'avl',
      inserciones: [50, 20, 60, 10, 30, 25, 55],
      pregunta: 'rotaciones',
    },
    etiquetaRespuesta: 'número de rotaciones',
    pista: 'Las dos claves que rompen el equilibrio entran en ZIG-ZAG: la 25 baja a la izquierda y luego a la derecha, y la 55 a la derecha y luego a la izquierda. Ninguna de las dos se arregla con una rotación simple.',
  },
];

/**
 * La unidad sola, a partir de una etiqueta del tipo «altura en nodos» → «nodos». Cuando la
 * etiqueta no lleva unidad devuelve cadena vacía, y `textoRespuesta` imprime solo el número.
 */
export function unidadDe(etiqueta: string): string {
  // «altura en nodos» → «nodos»
  const corte = etiqueta.indexOf(' en ');
  if (corte !== -1) return etiqueta.slice(corte + 4);
  // «número de rotaciones» → «rotaciones». Sin esta segunda forma, nueve de los doce casos
  // imprimían la respuesta como un número suelto, y en una app que mezcla alturas, rotaciones,
  // factores de balance y valores de nodo, un «4» a secas no dice cuál de las cuatro cosas es.
  const deNumero = etiqueta.match(/^n[úu]mero de (.+)$/i);
  if (deNumero) return deNumero[1];
  return '';
}

/** Formatea el resultado con su unidad si la tiene: «3 nodos», «4». */
export function textoRespuesta(valor: number, etiqueta: string): string {
  if (!Number.isFinite(valor)) return '—';
  const unidad = unidadDe(etiqueta);
  if (unidad) return `${numero(valor)} ${unidad}`;
  // Sin unidad natural (un valor de nodo, un factor de balance), la etiqueta acompaña al
  // número: es preferible repetirla a dejar una cifra sola que se puede leer como otra cosa
  // (hallazgo 830 de `simulador-genetica`: «Respuesta: 25 de semillas verdes» por un 25 %).
  return `${numero(valor)} — ${etiqueta}`;
}

/** Los doce casos, con su respuesta CALCULADA por el motor y no escrita a mano. */
export const CASOS: readonly Caso[] = DEFINICIONES.map((def) => {
  const r = resolverCaso(def.datos);
  const valor = r.ok ? r.valor : NaN;
  return {
    ...def,
    respuesta: valor,
    respuestaTexto: textoRespuesta(valor, def.etiquetaRespuesta),
    pasos: r.ok ? r.pasos : [...r.pasos, r.error ?? 'No se ha podido resolver el caso.'],
  };
});

export const TOTAL_CASOS = CASOS.length;

/* ─────────────────────────── Modo práctica (aleatorio) ─────────────────────────── */

/**
 * Generador reproducible: la misma semilla da siempre el mismo ejercicio.
 *
 * ⚠️ La semilla se MEZCLA antes de usarse (splitmix32). Sembrando xorshift32 directamente
 * con 1, 2, 3… los primeros valores salen diminutos y muy parecidos, así que
 * `Math.floor(rnd() * n)` devuelve el índice 0 para todas las semillas pequeñas y el
 * «aleatorio» acaba dando SIEMPRE el mismo ejercicio. Pasó en `simulador-genetica` el
 * 14/09/2026 y pasó la prueba de reproducibilidad, porque reproducible no es variado.
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
  enunciado: string;
  datos: DatosCaso;
  respuesta: number;
  etiquetaRespuesta: string;
  pasos: string[];
}

/** Valores de dos cifras, todos distintos: así ninguna inserción se rechaza por duplicada. */
const POZO = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95] as const;

const PREGUNTAS_ALEATORIAS = ['altura', 'rotaciones', 'hojas'] as const;

const TEXTO_PREGUNTA: Record<
  (typeof PREGUNTAS_ALEATORIAS)[number],
  { texto: string; etiqueta: string }
> = {
  altura: { texto: '¿Cuál es la altura final del árbol, contada en nodos?', etiqueta: 'altura en nodos' },
  rotaciones: { texto: '¿Cuántas rotaciones ejecuta el árbol en total?', etiqueta: 'número de rotaciones' },
  hojas: { texto: '¿Cuántos nodos hoja tiene el árbol final?', etiqueta: 'número de nodos hoja' },
};

/**
 * Ejercicio aleatorio de inserción en árbol. Usa EL MISMO `resolverCaso` que los doce fijos:
 * si divergieran, el alumno entrenaría con una regla y sería corregido con otra.
 */
export function generarEjercicioAleatorio(semilla = Date.now()): Ejercicio {
  const rnd = aleatorioCon(semilla);

  // Baraja de Fisher-Yates sobre una copia del pozo: siete valores distintos y en desorden.
  const baraja = [...POZO];
  for (let i = baraja.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    const t = baraja[i];
    baraja[i] = baraja[j];
    baraja[j] = t;
  }
  const inserciones = baraja.slice(0, 7);

  const pregunta = PREGUNTAS_ALEATORIAS[Math.floor(rnd() * PREGUNTAS_ALEATORIAS.length)] ?? 'altura';
  // Preguntar por rotaciones en modo BST no tiene sentido: un BST nunca rota, así que la
  // respuesta sería 0 siempre y el ejercicio no enseñaría nada.
  const modo: Modo = pregunta === 'rotaciones' ? 'avl' : rnd() < 0.5 ? 'bst' : 'avl';

  const datos: DatosCaso = { modo, inserciones, pregunta };
  const r = resolverCaso(datos);
  const nombreModo = modo === 'avl' ? 'AVL (con rebalanceo)' : 'BST (sin rebalanceo)';

  return {
    enunciado: `Partiendo de un árbol vacío en modo ${nombreModo}, se insertan por este orden: ${listaDeValores(inserciones)}. ${TEXTO_PREGUNTA[pregunta].texto}`,
    datos,
    respuesta: r.ok ? r.valor : NaN,
    etiquetaRespuesta: TEXTO_PREGUNTA[pregunta].etiqueta,
    pasos: r.ok ? r.pasos : [...r.pasos, r.error ?? 'No se ha podido resolver el ejercicio.'],
  };
}
