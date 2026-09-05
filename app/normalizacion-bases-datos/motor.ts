/**
 * Motor de normalización relacional — aparte de la vista y sin dependencias de React.
 *
 * Calcula cierres de atributos, claves candidatas y en qué forma normal está una relación.
 * Es el motor más delicado de los tres del clúster: un cierre mal calculado da una clave
 * falsa, y con una clave falsa TODO lo demás sale mal sin que nada lo delate en pantalla.
 * Los casos están resueltos a mano en tests/normalizacion-motor.spec.ts.
 *
 * Convenios: los atributos son cadenas cortas («A», «Cliente»), sin distinguir mayúsculas
 * de minúsculas a la hora de compararlos, y una dependencia funcional es izquierda → derecha.
 */

export interface DependenciaFuncional {
  izquierda: string[];
  derecha: string[];
}

export type FormaNormal = '1FN' | '2FN' | '3FN' | 'BCNF';

export interface Violacion {
  /** Dependencia culpable, ya formateada: «A,B → C» */
  dependencia: string;
  motivo: string;
}

export interface AnalisisRelacion {
  ok: boolean;
  error?: string;
  atributos: string[];
  /** Todas las claves candidatas, cada una como lista de atributos ordenada */
  claves: string[][];
  /** Atributos que forman parte de alguna clave candidata */
  primos: string[];
  violaciones2FN: Violacion[];
  violaciones3FN: Violacion[];
  violacionesBCNF: Violacion[];
  /** La forma normal MÁS ALTA que cumple la relación */
  formaNormal: FormaNormal;
  /** Explicación de por qué se queda ahí y no sube más */
  explicacion: string;
}

/** Tope de atributos: las claves candidatas se buscan por subconjuntos, que es 2^n. */
export const MAX_ATRIBUTOS = 12;

const norm = (a: string) => a.trim();
const clave = (a: string) => a.trim().toLowerCase();

/** Compara conjuntos de atributos sin importar orden ni mayúsculas. */
function mismoConjunto(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const sa = new Set(a.map(clave));
  return b.every((x) => sa.has(clave(x)));
}

function contiene(conjunto: string[], sub: string[]): boolean {
  const s = new Set(conjunto.map(clave));
  return sub.every((x) => s.has(clave(x)));
}

function ordenar(atributos: string[], orden: string[]): string[] {
  const posicion = new Map(orden.map((a, i) => [clave(a), i]));
  return [...atributos].sort((x, y) => (posicion.get(clave(x)) ?? 99) - (posicion.get(clave(y)) ?? 99));
}

/**
 * Cierre de un conjunto de atributos: todo lo que se deduce de él con las dependencias.
 * Se aplica cada dependencia cuya izquierda ya esté dentro, hasta que no crezca más.
 */
export function cierre(atributos: string[], dependencias: DependenciaFuncional[]): string[] {
  const dentro = new Set(atributos.map(clave));
  const original = new Map<string, string>();
  for (const a of atributos) original.set(clave(a), norm(a));

  let crecio = true;
  while (crecio) {
    crecio = false;
    for (const df of dependencias) {
      if (df.izquierda.every((a) => dentro.has(clave(a)))) {
        for (const a of df.derecha) {
          if (!dentro.has(clave(a))) {
            dentro.add(clave(a));
            original.set(clave(a), norm(a));
            crecio = true;
          }
        }
      }
    }
  }
  return [...dentro].map((k) => original.get(k) as string);
}

/** Los pasos del cierre, para poder enseñarlos: qué dependencia añadió qué. */
export interface PasoCierre {
  dependencia: string;
  anadidos: string[];
  acumulado: string[];
}

export function cierreExplicado(
  atributos: string[],
  dependencias: DependenciaFuncional[],
  ordenAtributos: string[],
): { resultado: string[]; pasos: PasoCierre[] } {
  const dentro = new Set(atributos.map(clave));
  const original = new Map<string, string>();
  for (const a of atributos) original.set(clave(a), norm(a));
  const pasos: PasoCierre[] = [];

  let crecio = true;
  while (crecio) {
    crecio = false;
    for (const df of dependencias) {
      if (!df.izquierda.every((a) => dentro.has(clave(a)))) continue;
      const anadidos: string[] = [];
      for (const a of df.derecha) {
        if (!dentro.has(clave(a))) {
          dentro.add(clave(a));
          original.set(clave(a), norm(a));
          anadidos.push(norm(a));
        }
      }
      if (anadidos.length > 0) {
        crecio = true;
        pasos.push({
          dependencia: formatearDF(df),
          anadidos,
          acumulado: ordenar([...dentro].map((k) => original.get(k) as string), ordenAtributos),
        });
      }
    }
  }
  return { resultado: ordenar([...dentro].map((k) => original.get(k) as string), ordenAtributos), pasos };
}

export function formatearDF(df: DependenciaFuncional): string {
  return `${df.izquierda.join(',')} → ${df.derecha.join(',')}`;
}

/**
 * Claves candidatas: subconjuntos MÍNIMOS cuyo cierre da todos los atributos.
 *
 * Se poda antes de buscar: los atributos que no aparecen en ninguna parte derecha no
 * pueden deducirse de nada, así que están en TODAS las claves; y los que no aparecen en
 * ninguna izquierda no pueden aportar nada a una clave. Sin esa poda, una relación de 12
 * atributos serían 4.096 subconjuntos.
 */
export function clavesCandidatas(atributos: string[], dependencias: DependenciaFuncional[]): string[][] {
  const enDerecha = new Set(dependencias.flatMap((d) => d.derecha.map(clave)));
  const enIzquierda = new Set(dependencias.flatMap((d) => d.izquierda.map(clave)));

  const imprescindibles = atributos.filter((a) => !enDerecha.has(clave(a)));
  const inutiles = atributos.filter((a) => !enIzquierda.has(clave(a)) && enDerecha.has(clave(a)));
  const opcionales = atributos.filter(
    (a) => !imprescindibles.some((x) => clave(x) === clave(a)) && !inutiles.some((x) => clave(x) === clave(a)),
  );

  // Si lo imprescindible ya lo determina todo, es la única clave candidata
  if (imprescindibles.length > 0 && contiene(cierre(imprescindibles, dependencias), atributos)) {
    return [ordenar(imprescindibles, atributos)];
  }

  const encontradas: string[][] = [];
  const total = 1 << opcionales.length;
  // Por tamaño creciente, para que la minimalidad se compruebe contra claves ya halladas
  const combinaciones: string[][] = [];
  for (let mascara = 0; mascara < total; mascara++) {
    const subconjunto = opcionales.filter((_, i) => (mascara >> i) & 1);
    combinaciones.push([...imprescindibles, ...subconjunto]);
  }
  combinaciones.sort((a, b) => a.length - b.length);

  for (const candidata of combinaciones) {
    if (candidata.length === 0) continue;
    // Minimalidad: si ya hay una clave contenida en esta, esta no es mínima
    if (encontradas.some((k) => contiene(candidata, k))) continue;
    if (contiene(cierre(candidata, dependencias), atributos)) {
      encontradas.push(ordenar(candidata, atributos));
    }
  }
  return encontradas;
}

/**
 * Analiza en qué forma normal está la relación.
 *
 * Se asume 1FN de partida (valores atómicos): eso no se puede deducir de las dependencias,
 * es una propiedad del diseño de las columnas, y decir lo contrario sería inventarse un
 * dato que el motor no tiene.
 */
export function analizar(atributosCrudos: string[], dependencias: DependenciaFuncional[]): AnalisisRelacion {
  const atributos = atributosCrudos.map(norm).filter((a) => a.length > 0);
  const vacio: AnalisisRelacion = {
    ok: false,
    atributos,
    claves: [],
    primos: [],
    violaciones2FN: [],
    violaciones3FN: [],
    violacionesBCNF: [],
    formaNormal: '1FN',
    explicacion: '',
  };

  if (atributos.length === 0) return { ...vacio, error: 'No has indicado ningún atributo.' };
  if (atributos.length > MAX_ATRIBUTOS) {
    return { ...vacio, error: `Como mucho ${MAX_ATRIBUTOS} atributos: las claves se buscan por subconjuntos y crecen en 2ⁿ.` };
  }
  const repetido = atributos.find((a, i) => atributos.findIndex((b) => clave(b) === clave(a)) !== i);
  if (repetido) return { ...vacio, error: `El atributo «${repetido}» está repetido.` };

  const conocidos = new Set(atributos.map(clave));
  for (const df of dependencias) {
    for (const a of [...df.izquierda, ...df.derecha]) {
      if (!conocidos.has(clave(a))) {
        return { ...vacio, error: `La dependencia «${formatearDF(df)}» usa el atributo «${a}», que no está en la relación.` };
      }
    }
    if (df.izquierda.length === 0 || df.derecha.length === 0) {
      return { ...vacio, error: 'Hay una dependencia sin lado izquierdo o sin lado derecho.' };
    }
  }

  const claves = clavesCandidatas(atributos, dependencias);
  if (claves.length === 0) {
    return { ...vacio, error: 'No se ha encontrado ninguna clave candidata. Revisa las dependencias.' };
  }
  const primosSet = new Set(claves.flat().map(clave));
  const primos = atributos.filter((a) => primosSet.has(clave(a)));
  const esPrimo = (a: string) => primosSet.has(clave(a));

  const violaciones2FN: Violacion[] = [];
  const violaciones3FN: Violacion[] = [];
  const violacionesBCNF: Violacion[] = [];

  for (const df of dependencias) {
    // Una dependencia trivial (derecha contenida en izquierda) no viola nada
    const derechaUtil = df.derecha.filter((a) => !contiene(df.izquierda, [a]));
    if (derechaUtil.length === 0) continue;

    const izquierdaEsSuperclave = contiene(cierre(df.izquierda, dependencias), atributos);
    const noPrimosDerecha = derechaUtil.filter((a) => !esPrimo(a));

    // BCNF: TODA dependencia no trivial debe tener superclave a la izquierda
    if (!izquierdaEsSuperclave) {
      violacionesBCNF.push({
        dependencia: formatearDF(df),
        motivo: `«${df.izquierda.join(',')}» no es superclave: su cierre no llega a todos los atributos.`,
      });
    }

    if (noPrimosDerecha.length === 0) continue; // 2FN y 3FN solo hablan de atributos NO primos

    // 2FN: ningún atributo no primo puede depender de PARTE de una clave candidata
    const parcialDe = claves.find(
      (k) => contiene(k, df.izquierda) && !mismoConjunto(k, df.izquierda),
    );
    if (parcialDe) {
      violaciones2FN.push({
        dependencia: formatearDF(df),
        motivo: `«${df.izquierda.join(',')}» es parte de la clave «${parcialDe.join(',')}», y ${noPrimosDerecha.join(',')} no ${noPrimosDerecha.length > 1 ? 'son' : 'es'} primo${noPrimosDerecha.length > 1 ? 's' : ''}: dependencia parcial.`,
      });
      continue; // ya está capturada como parcial; en 3FN se cuentan las transitivas
    }

    // 3FN: un no primo no puede depender de algo que no sea superclave
    if (!izquierdaEsSuperclave) {
      violaciones3FN.push({
        dependencia: formatearDF(df),
        motivo: `«${df.izquierda.join(',')}» no es superclave y ${noPrimosDerecha.join(',')} no ${noPrimosDerecha.length > 1 ? 'son primos' : 'es primo'}: dependencia transitiva.`,
      });
    }
  }

  let formaNormal: FormaNormal;
  let explicacion: string;
  if (violaciones2FN.length > 0) {
    formaNormal = '1FN';
    explicacion = 'Se queda en 1FN: hay atributos no primos que dependen solo de una PARTE de una clave candidata.';
  } else if (violaciones3FN.length > 0) {
    formaNormal = '2FN';
    explicacion = 'Llega a 2FN pero no a 3FN: hay atributos no primos que dependen de otros no primos (dependencia transitiva).';
  } else if (violacionesBCNF.length > 0) {
    formaNormal = '3FN';
    explicacion =
      'Llega a 3FN pero no a BCNF: hay dependencias cuya parte izquierda no es superclave, aunque su parte derecha sí sea un atributo primo.';
  } else {
    formaNormal = 'BCNF';
    explicacion = 'Está en BCNF: toda dependencia no trivial tiene una superclave a la izquierda.';
  }

  return {
    ok: true,
    atributos,
    claves,
    primos,
    violaciones2FN,
    violaciones3FN,
    violacionesBCNF,
    formaNormal,
    explicacion,
  };
}

/**
 * Lee las dependencias escritas a mano, una por línea: «A,B -> C,D» o «A,B → C,D».
 * Devuelve también las líneas que no ha sabido leer, para poder decirlo en pantalla en
 * vez de descartarlas en silencio.
 */
export function parsearDependencias(texto: string): { dependencias: DependenciaFuncional[]; descartadas: string[] } {
  const dependencias: DependenciaFuncional[] = [];
  const descartadas: string[] = [];
  for (const linea of texto.split('\n')) {
    const limpia = linea.trim();
    if (limpia === '') continue;
    const partes = limpia.split(/->|→|-->/);
    if (partes.length !== 2) {
      descartadas.push(limpia);
      continue;
    }
    const izquierda = partes[0].split(',').map(norm).filter(Boolean);
    const derecha = partes[1].split(',').map(norm).filter(Boolean);
    if (izquierda.length === 0 || derecha.length === 0) {
      descartadas.push(limpia);
      continue;
    }
    dependencias.push({ izquierda, derecha });
  }
  return { dependencias, descartadas };
}

/** Lee la lista de atributos: «A, B, C» o «A B C». */
export function parsearAtributos(texto: string): string[] {
  return texto
    .split(/[,;\s]+/)
    .map(norm)
    .filter((a) => a.length > 0);
}
