/**
 * Buscador de las tablas de consulta de Stemum (material de apoyo, `app/tabla-*`).
 *
 * Por qué existe (cabo C0607, 06/11/2026): la receta del buscador nació en tabla-derivadas
 * (C0591) y se copió en tabla-integrales (hallazgos 3937 y 3938); tabla-limites-notables seguía
 * con la forma vieja (hallazgos 3984 y 3985). Con tres copias que divergían (los superíndices de
 * una no eran los de otra), la receta vive aquí y cada tabla aporta solo su texto.
 *
 * La forma vieja comparaba la consulta ENTERA como una subcadena seguida, así que:
 *   · una fórmula escrita como en la tabla («sen x», «1^∞», «1 − cos x») o dos palabras en
 *     otro orden daban 0 resultados;
 *   · «tan» casaba dentro de «constante», «sin» dentro de «asíntota» y «coseno» dentro de
 *     «arcoseno».
 * Ahora cada palabra de la consulta tiene que EMPEZAR una palabra de la entrada (una letra o
 * cifra sola tiene que SER esa palabra), y lo que casa entero o como fórmula seguida sube arriba.
 *
 * ⚠️ Pensado para tablas de matemáticas y física, donde la unidad de búsqueda es la palabra. En
 * una tabla de fórmulas químicas («Cl» dentro de «NaCl») el inicio de palabra puede no ser lo
 * que busca el usuario: medir antes de llevarlo allí.
 */
import { isValidElement } from 'react';
import type { ReactNode } from 'react';

/** Lo que se guarda de cada entrada para buscar en ella. */
export interface IndiceBusqueda {
  palabras: string[];
  compacto: string;
}

const SUPERINDICES: Record<string, string> = {
  '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8',
  '⁹': '9', 'ⁿ': 'n', '⁻': '-', '⁺': '+', 'ˣ': 'x',
};

const SUBINDICES: Record<string, string> = {
  '₀': '0', '₁': '1', '₂': '2', '₃': '3', '₄': '4', '₅': '5', '₆': '6', '₇': '7', '₈': '8',
  '₉': '9', 'ₙ': 'n',
};

/** Apóstrofos y primas: «L’Hôpital», «L'Hôpital», «f′(x)». */
const APOSTROFOS = /[’'′‘]/g;

/** Sin acentos ni mayúsculas. */
export function normalizarBusqueda(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

/**
 * Texto normalizado para buscar: sin acentos, superíndices como ^n, subíndices como cifras,
 * √ como «raiz», ∞ como «infinito» y el signo menos tipográfico como guion.
 */
export function prepararBusqueda(texto: string): string {
  return normalizarBusqueda(texto)
    .replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹ⁿ⁻⁺ˣ]+/g, (m) => `^${[...m].map((c) => SUPERINDICES[c]).join('')}`)
    .replace(/[₀₁₂₃₄₅₆₇₈₉ₙ]/g, (c) => SUBINDICES[c])
    .replace(/√/g, ' raiz ')
    .replace(/∞/g, ' infinito ')
    .replace(/[−–]/g, '-');
}

function trocear(texto: string): string[] {
  return texto.split(/[^a-z0-9]+/).filter(Boolean);
}

/** Las palabras de una CONSULTA: el apóstrofo une («L’Hôpital» → «lhopital»). */
export function palabrasDe(texto: string): string[] {
  return trocear(prepararBusqueda(texto).replace(APOSTROFOS, ''));
}

/** La consulta o la entrada como fórmula seguida, sin espacios ni signos de producto. */
export function compactar(texto: string): string {
  return prepararBusqueda(texto).replace(APOSTROFOS, '').replace(/[\s·*∫]+/g, '');
}

/**
 * El índice de una entrada. Con apóstrofo guarda las dos lecturas: «L’Hôpital» casa con
 * «lhopital» y con «hopital».
 */
export function indexar(texto: string): IndiceBusqueda {
  const preparado = prepararBusqueda(texto);
  const unidas = trocear(preparado.replace(APOSTROFOS, ''));
  const separadas = trocear(preparado);
  return { palabras: [...new Set([...unidas, ...separadas])], compacto: compactar(texto) };
}

/**
 * Texto plano de una fórmula pintada en JSX: los exponentes (`<sup>`) como ^n, los subíndices
 * como cifras seguidas y la fracción de la tabla (su componente `Frac`, con props `n` y `d`)
 * como n/d.
 */
export function textoFormula(nodo: ReactNode, fraccion?: unknown): string {
  if (nodo === null || nodo === undefined || typeof nodo === 'boolean') return '';
  if (typeof nodo === 'string' || typeof nodo === 'number') return String(nodo);
  if (Array.isArray(nodo)) return nodo.map((n) => textoFormula(n, fraccion)).join('');
  if (isValidElement(nodo)) {
    const props = nodo.props as { children?: ReactNode; n?: ReactNode; d?: ReactNode };
    if (fraccion !== undefined && nodo.type === fraccion) {
      return `${textoFormula(props.n, fraccion)}/${textoFormula(props.d, fraccion)}`;
    }
    const dentro = textoFormula(props.children, fraccion);
    return nodo.type === 'sup' ? `^${dentro}` : dentro;
  }
  return '';
}

/** ¿La palabra `q` de la consulta casa con la palabra `p` de la entrada? */
export function casa(q: string, p: string): boolean {
  return q.length === 1 ? p === q : p.startsWith(q);
}

/**
 * Las entradas que casan con la consulta, las mejores primero (fórmula seguida: 2 puntos;
 * todas las palabras enteras: 1). Sin palabras en la consulta, todas en su orden.
 */
export function buscarEnTabla<T>(
  entradas: readonly T[],
  consulta: string,
  indiceDe: (entrada: T) => IndiceBusqueda,
): T[] {
  const consultaPalabras = palabrasDe(consulta);
  if (consultaPalabras.length === 0) return [...entradas];
  const consultaCompacta = compactar(consulta);
  return entradas
    .map((entrada) => {
      const indice = indiceDe(entrada);
      const encaja = consultaPalabras.every((q) => indice.palabras.some((p) => casa(q, p)));
      const exacta = consultaPalabras.every((q) => indice.palabras.includes(q));
      const puntos = (indice.compacto.includes(consultaCompacta) ? 2 : 0) + (exacta ? 1 : 0);
      return { entrada, encaja, puntos };
    })
    .filter((r) => r.encaja)
    .sort((a, b) => b.puntos - a.puntos)
    .map((r) => r.entrada);
}
