/**
 * Motor del modo «Escribir las formas» y de la lista de repaso de quiz-verbos-irregulares (S0181).
 *
 * Sin React ni navegador: lo prueban los casos resueltos a mano de
 * `tests/verbos-irregulares-motor.spec.ts` (en `npm run test:calc`).
 *
 * Por qué existe. Lo que se busca para llegar aquí es «examen / test de verbos irregulares», y un
 * examen pide ESCRIBIR las tres columnas; el quiz solo dejaba elegir el Past Simple entre cuatro
 * opciones. Y el plan de estudio de la propia app mandaba «identificar los verbos que has fallado
 * y crear un mini-quiz» a mano, que es justo lo que una app puede llevar sola.
 */
import type { VerboIrregular } from '@/data/verbos-irregulares';

export type ModoRespuesta = 'elegir' | 'escribir';

/**
 * Pasados que el banco no lleva y que también son correctos cuando se escriben.
 *
 * Solo `wake`: Cambridge Dictionary da «past tense woke or US also waked», y el banco ya admite
 * «waked» como participio americano. Es la misma variante en la otra columna. Quedan fuera a
 * propósito «shined» (shine), que solo vale con el sentido de sacar brillo y el quiz enseña
 * «brillar», y «forbad» (forbid), que hoy está en desuso: los dos están anotados en el CANON
 * del spec de la app.
 */
const PASADOS_ADMITIDOS_EXTRA: Record<string, string[]> = {
  wake: ['waked'],
};

/** Palabras de enlace que se aceptan entre dos formas («got or gotten», «was y were»). */
const ENLACES = new Set(['or', 'o', 'y', 'and']);

/**
 * Pasados que se dan por buenos al escribir.
 *
 * Para `be` valen «was», «were» o las dos: en el modo elegir se pregunta solo «was» porque la
 * barra de «was / were» delataba la opción (hallazgo 316), pero escribiendo no hay forma que
 * delate nada, y en un examen se pide la pareja.
 */
export function pasadosAdmitidos(verbo: VerboIrregular): string[] {
  const base = verbo.pastSimple.split('/').map((f) => f.trim()).filter(Boolean);
  return [...base, ...(PASADOS_ADMITIDOS_EXTRA[verbo.infinitive] ?? [])];
}

/** Participios que se dan por buenos al escribir: el del banco y su variante, si la tiene. */
export function participiosAdmitidos(verbo: VerboIrregular): string[] {
  return verbo.varianteParticipio
    ? [verbo.pastParticiple, verbo.varianteParticipio.forma]
    : [verbo.pastParticiple];
}

/**
 * Trocea lo escrito en las formas que contiene.
 *
 * Admite lo que un alumno escribe de verdad: mayúsculas, espacios de más, el punto final, dos
 * formas separadas por barra, coma, guion o «or» («got/gotten», «was, were»), y el paréntesis de
 * las tablas de clase, «got(ten)», que significa «got» y «gotten».
 */
export function formasEscritas(entrada: string): string[] {
  const limpia = entrada
    .toLowerCase()
    .replace(/([a-z]+)\(([a-z]+)\)/g, (_, raiz: string, cola: string) => `${raiz} ${raiz}${cola}`)
    .replace(/[.!¡¿?]+/g, ' ');
  return limpia
    .split(/[\s/,;|\-]+/)
    .filter((t) => t !== '' && !ENLACES.has(t));
}

/**
 * ¿Es correcta una forma escrita?
 *
 * Correcta si escribe AL MENOS una forma y TODAS las que escribe son admitidas. Así «got/gotten»
 * vale, pero «went gone» en la casilla del pasado no: el participio no es un pasado, y dar por
 * buena la casilla porque una de las dos palabras acierta sería premiar escribirlo todo.
 */
export function esFormaCorrecta(entrada: string, admitidas: string[]): boolean {
  const formas = formasEscritas(entrada);
  const validas = new Set(admitidas.map((a) => a.toLowerCase()));
  return formas.length > 0 && formas.every((f) => validas.has(f));
}

export interface Correccion {
  pasadoOk: boolean;
  participioOk: boolean;
}

/** Corrige las dos casillas. La pregunta solo cuenta como acierto si las dos están bien. */
export function corregir(verbo: VerboIrregular, pasado: string, participio: string): Correccion {
  return {
    pasadoOk: esFormaCorrecta(pasado, pasadosAdmitidos(verbo)),
    participioOk: esFormaCorrecta(participio, participiosAdmitidos(verbo)),
  };
}

// ─── Lista de repaso ──────────────────────────────────────────────────────────

/** Aciertos SEGUIDOS que hacen falta para que un verbo fallado salga de la lista. */
export const ACIERTOS_PARA_SALIR = 2;

export interface FichaRepaso {
  /** Veces que se ha fallado desde que entró en la lista. */
  fallos: number;
  /** Aciertos seguidos desde el último fallo. */
  racha: number;
}

/** Verbos pendientes por infinitivo. */
export type ListaRepaso = Record<string, FichaRepaso>;

/**
 * Una lista por modo: un acierto eligiendo el pasado no demuestra saberse el participio, así que
 * no puede sacar de la lista un verbo que se falló escribiendo las dos formas.
 */
export type RegistroRepaso = Record<ModoRespuesta, ListaRepaso>;

export const REGISTRO_VACIO: RegistroRepaso = { elegir: {}, escribir: {} };

/** Apunta una respuesta. Devuelve una lista NUEVA: la de entrada no se toca. */
export function anotarRespuesta(lista: ListaRepaso, infinitivo: string, acierto: boolean): ListaRepaso {
  const ficha = lista[infinitivo];
  if (!acierto) {
    return { ...lista, [infinitivo]: { fallos: (ficha?.fallos ?? 0) + 1, racha: 0 } };
  }
  if (!ficha) return lista;
  const racha = ficha.racha + 1;
  if (racha >= ACIERTOS_PARA_SALIR) {
    const resto = { ...lista };
    delete resto[infinitivo];
    return resto;
  }
  return { ...lista, [infinitivo]: { ...ficha, racha } };
}

/**
 * Verbos pendientes, primero los más fallados y, a igualdad, los que llevan menos racha.
 * El desempate final es el orden del banco, para que el resultado no dependa del orden en que
 * el navegador devuelva las claves.
 */
export function verbosPendientes(lista: ListaRepaso, banco: VerboIrregular[]): VerboIrregular[] {
  const orden = new Map(banco.map((v, i) => [v.infinitive, i]));
  return banco
    .filter((v) => lista[v.infinitive])
    .sort((a, b) => {
      const fa = lista[a.infinitive];
      const fb = lista[b.infinitive];
      return fb.fallos - fa.fallos || fa.racha - fb.racha || orden.get(a.infinitive)! - orden.get(b.infinitive)!;
    });
}

/** Lo que haya en `localStorage` es dato de fuera: se lee ficha a ficha y lo raro se descarta. */
function leerLista(crudo: unknown, validos: Set<string>): ListaRepaso {
  const lista: ListaRepaso = {};
  if (!crudo || typeof crudo !== 'object' || Array.isArray(crudo)) return lista;
  for (const [inf, ficha] of Object.entries(crudo as Record<string, unknown>)) {
    if (!validos.has(inf) || !ficha || typeof ficha !== 'object') continue;
    const { fallos, racha } = ficha as Record<string, unknown>;
    if (!Number.isInteger(fallos) || (fallos as number) < 1) continue;
    if (!Number.isInteger(racha) || (racha as number) < 0 || (racha as number) >= ACIERTOS_PARA_SALIR) continue;
    lista[inf] = { fallos: fallos as number, racha: racha as number };
  }
  return lista;
}

/**
 * Reconstruye el registro guardado. Un JSON roto, de otra versión o con verbos que ya no están
 * en el banco no rompe la app: lo que no se entiende se queda fuera y el resto se conserva.
 */
export function leerRegistro(crudo: string | null, infinitivosValidos: Iterable<string>): RegistroRepaso {
  if (!crudo) return { elegir: {}, escribir: {} };
  let datos: unknown;
  try {
    datos = JSON.parse(crudo);
  } catch {
    return { elegir: {}, escribir: {} };
  }
  const validos = new Set(infinitivosValidos);
  const obj = datos && typeof datos === 'object' ? (datos as Record<string, unknown>) : {};
  return { elegir: leerLista(obj.elegir, validos), escribir: leerLista(obj.escribir, validos) };
}
