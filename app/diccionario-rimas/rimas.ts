/**
 * Motor de rima del español
 *
 * La rima NO es ortográfica sino fonética: «vaca» rima con «flaca» aunque una
 * lleve v y otra f, y «cabeza» rima con «pereza» pese a la z. Por eso el núcleo
 * de rima (todo lo que va desde la vocal tónica hasta el final) se normaliza a
 * fonemas antes de comparar.
 *
 * El silabeo y la clasificación aguda/llana/esdrújula se reutilizan de
 * `contador-silabas/metrica.ts`, ya validados contra versos clásicos.
 */

import { separarSilabas, acentuacionDe, type Acentuacion } from '../contador-silabas/metrica';

export type { Acentuacion };

const VOCALES = 'aeiouáéíóúü';
const FUERTES = 'aeoáéó';
const TILDADAS = 'áéíóú';

/** Quita la tilde diacrítica: no cambia el sonido, solo marca dónde está el acento. */
const sinTilde = (texto: string): string =>
  texto
    .replace(/á/g, 'a')
    .replace(/é/g, 'e')
    .replace(/í/g, 'i')
    .replace(/ó/g, 'o')
    .replace(/ú/g, 'u');

/**
 * Posición de la vocal tónica DENTRO de su sílaba.
 * En un diptongo manda la vocal fuerte («cuen-to» → la e, por eso «cuento»
 * rima con «viento»); si las dos son débiles, la segunda («ciu-dad» → la u).
 */
const indiceVocalNuclear = (silaba: string): number => {
  const letras = [...silaba];
  const conTilde = letras.findIndex((c) => TILDADAS.includes(c));
  if (conTilde !== -1) return conTilde;

  const vocales = letras.map((c, i) => ({ c, i })).filter((o) => VOCALES.includes(o.c));
  if (vocales.length === 0) return -1;
  if (vocales.length === 1) return vocales[0].i;

  const fuerte = vocales.find((o) => FUERTES.includes(o.c));
  return fuerte ? fuerte.i : vocales[vocales.length - 1].i;
};

export interface Escansion {
  palabra: string;
  silabas: string[];
  acentuacion: Acentuacion;
  /** Índice de la sílaba tónica dentro de `silabas` */
  indiceTonica: number;
  /** Texto desde la vocal tónica hasta el final: lo que tiene que coincidir */
  nucleo: string;
}

/** Descompone una palabra y localiza su núcleo de rima. */
export const escandirPalabra = (palabra: string): Escansion | null => {
  const limpia = palabra
    .toLowerCase()
    .trim()
    .replace(/[^a-záéíóúüñ]/g, '');
  if (!limpia) return null;

  const silabas = separarSilabas(limpia);
  if (silabas.length === 0) return null;

  const acentuacion = acentuacionDe(limpia, silabas);

  // La tilde escrita manda sobre cualquier regla
  const conTilde = silabas.findIndex((s) => TILDADAS.split('').some((t) => s.includes(t)));
  let indiceTonica: number;
  if (conTilde !== -1) indiceTonica = conTilde;
  else if (silabas.length === 1) indiceTonica = 0;
  else if (acentuacion === 'aguda') indiceTonica = silabas.length - 1;
  else if (acentuacion === 'llana') indiceTonica = silabas.length - 2;
  else indiceTonica = Math.max(0, silabas.length - 3);

  const silabaTonica = silabas[indiceTonica];
  const iv = indiceVocalNuclear(silabaTonica);
  const nucleo =
    silabaTonica.slice(iv < 0 ? 0 : iv) + silabas.slice(indiceTonica + 1).join('');

  return { palabra: limpia, silabas, acentuacion, indiceTonica, nucleo };
};

/**
 * Convierte el núcleo a fonemas.
 *
 * `seseo = true` iguala c/z a s, como se pronuncia en toda Latinoamérica,
 * Canarias y parte de Andalucía: entonces «taza» rima con «casa». Con
 * `seseo = false` (distinción) no riman. El yeísmo (ll = y) se aplica siempre
 * por ser hoy mayoritario en todo el ámbito hispánico.
 */
export const aFonemas = (nucleo: string, seseo: boolean): string => {
  let s = sinTilde(nucleo.toLowerCase());

  s = s.replace(/x/g, 'ks'); // antes de que la jota ocupe el símbolo /x/
  s = s.replace(/ch/g, 'C');
  s = s.replace(/ll/g, 'Y');
  s = s.replace(/rr/g, 'R');
  s = s.replace(/gü([ei])/g, 'gU$1'); // «güe» /gwe/ frente a «gue» /ge/
  s = s.replace(/qu([ei])/g, 'k$1');
  s = s.replace(/gu([ei])/g, 'g$1');
  s = s.replace(/h/g, ''); // muda (ya se salvó la «ch»)
  s = s.replace(/c([ei])/g, seseo ? 's$1' : 'Z$1');
  s = s.replace(/z/g, seseo ? 's' : 'Z');
  s = s.replace(/c/g, 'k');
  s = s.replace(/g([ei])/g, 'x$1');
  s = s.replace(/j/g, 'x');
  s = s.replace(/v/g, 'b');
  s = s.replace(/y/g, 'Y'); // yeísmo: «calló» y «cayó» riman
  s = s.replace(/w/g, 'u');
  s = s.replace(/ü/g, 'u');
  s = s.replace(/ñ/g, 'N');

  return s;
};

/**
 * Clave de rima asonante: solo las vocales, una por sílaba, desde la tónica.
 *
 * Dos reglas clásicas que un simple «extraer vocales» se salta:
 *  · en las esdrújulas la vocal intermedia no cuenta («pájaro» asuena con «campo»),
 *  · la i/u átona final equivale a e/o («débil» asuena con «verde»).
 */
export const claveAsonante = (esc: Escansion): string => {
  const desdeTonica = esc.silabas.slice(esc.indiceTonica);

  const vocales = desdeTonica
    .map((silaba, i) => {
      const idx = i === 0 ? indiceVocalNuclear(silaba) : indiceVocalNuclear(silaba);
      return idx < 0 ? '' : sinTilde(silaba[idx]);
    })
    .filter(Boolean);

  if (vocales.length === 0) return '';

  // Esdrújulas y sobresdrújulas: solo cuentan la tónica y la última
  const reducidas =
    vocales.length >= 3 ? [vocales[0], vocales[vocales.length - 1]] : vocales;

  // La débil átona final se abre: «débil» → e-e, «tribu» → i-o
  if (reducidas.length > 1) {
    const ultima = reducidas[reducidas.length - 1];
    if (ultima === 'i') reducidas[reducidas.length - 1] = 'e';
    if (ultima === 'u') reducidas[reducidas.length - 1] = 'o';
  }

  return reducidas.join('');
};

// ─── Índice del diccionario ──────────────────────────────────────────────────

export interface EntradaRima {
  palabra: string;
  silabas: number;
  acentuacion: Acentuacion;
  nucleo: string;
}

export interface IndiceRimas {
  entradas: EntradaRima[];
  /** clave fonética con distinción c/z ≠ s → posiciones en `entradas` */
  consonanteDistincion: Map<string, number[]>;
  /** clave fonética con seseo → posiciones en `entradas` */
  consonanteSeseo: Map<string, number[]>;
  asonante: Map<string, number[]>;
}

export const indiceVacio = (): IndiceRimas => ({
  entradas: [],
  consonanteDistincion: new Map(),
  consonanteSeseo: new Map(),
  asonante: new Map(),
});

const empujar = (mapa: Map<string, number[]>, clave: string, pos: number): void => {
  if (!clave) return;
  const lista = mapa.get(clave);
  if (lista) lista.push(pos);
  else mapa.set(clave, [pos]);
};

/** Indexa un bloque de palabras sobre un índice ya existente (permite trocear). */
export const indexarBloque = (indice: IndiceRimas, palabras: string[]): void => {
  for (const palabra of palabras) {
    const esc = escandirPalabra(palabra);
    if (!esc) continue;

    const pos = indice.entradas.length;
    indice.entradas.push({
      palabra: esc.palabra,
      silabas: esc.silabas.length,
      acentuacion: esc.acentuacion,
      nucleo: esc.nucleo,
    });

    empujar(indice.consonanteDistincion, aFonemas(esc.nucleo, false), pos);
    empujar(indice.consonanteSeseo, aFonemas(esc.nucleo, true), pos);
    empujar(indice.asonante, claveAsonante(esc), pos);
  }
};

// ─── Búsqueda ────────────────────────────────────────────────────────────────

export type TipoBusqueda = 'consonante' | 'asonante';

export interface FiltrosRima {
  /** Número de sílabas exigido; null = cualquiera */
  silabas: number | null;
  /** Acentuación exigida; null = cualquiera */
  acentuacion: Acentuacion | null;
}

/** Cuántas letras finales comparten dos palabras: mide lo rica que es la rima. */
export const longitudSufijoComun = (a: string, b: string): number => {
  let n = 0;
  while (n < a.length && n < b.length && a[a.length - 1 - n] === b[b.length - 1 - n]) n++;
  return n;
};

export interface ResultadoRimas {
  consulta: Escansion;
  /** Palabras encontradas, ya filtradas y ordenadas */
  palabras: EntradaRima[];
  /** Cuántas había antes de aplicar los filtros */
  totalSinFiltrar: number;
}

/**
 * Busca las palabras que riman con la consulta.
 *
 * En modo asonante se excluyen las que ya riman en consonante: son un caso
 * particular de la asonancia y aparecen en su propia pestaña, así que
 * repetirlas solo alarga la lista.
 */
export const buscarRimas = (
  indice: IndiceRimas,
  consulta: string,
  tipo: TipoBusqueda,
  seseo: boolean,
  filtros: FiltrosRima
): ResultadoRimas | null => {
  const esc = escandirPalabra(consulta);
  if (!esc) return null;

  const mapaConsonante = seseo ? indice.consonanteSeseo : indice.consonanteDistincion;
  const claveCons = aFonemas(esc.nucleo, seseo);

  let posiciones: number[];
  if (tipo === 'consonante') {
    posiciones = mapaConsonante.get(claveCons) ?? [];
  } else {
    const soloConsonante = new Set(mapaConsonante.get(claveCons) ?? []);
    posiciones = (indice.asonante.get(claveAsonante(esc)) ?? []).filter(
      (p) => !soloConsonante.has(p)
    );
  }

  const candidatas = posiciones
    .map((p) => indice.entradas[p])
    .filter((e) => e.palabra !== esc.palabra);

  const filtradas = candidatas.filter(
    (e) =>
      (filtros.silabas === null || e.silabas === filtros.silabas) &&
      (filtros.acentuacion === null || e.acentuacion === filtros.acentuacion)
  );

  // Sin lista de frecuencias, el alfabético dejaría arriba las rarezas del
  // diccionario («klystron» antes que «razón»). Se ordena por cuánto sonido
  // comparten: la rima rica —más letras finales en común— va primero, que es
  // además la que mejor suena. A igualdad, las palabras más cortas, y luego
  // alfabético para que el orden sea estable.
  const conAfinidad = filtradas.map((e) => {
    const afinidad = longitudSufijoComun(esc.palabra, e.palabra);
    return {
      entrada: e,
      afinidad,
      // «vida» / «movida» contienen la palabra entera: es rima de derivada, la
      // que la tradición considera pobre. Va detrás, no fuera. Solo se aplica
      // desde dos sílabas: «amar» acaba en «mar» por casualidad, no por familia.
      derivada: esc.silabas.length >= 2 && afinidad >= esc.palabra.length,
    };
  });

  conAfinidad.sort((a, b) => {
    if (a.derivada !== b.derivada) return a.derivada ? 1 : -1;
    if (a.afinidad !== b.afinidad) return b.afinidad - a.afinidad;
    if (a.entrada.silabas !== b.entrada.silabas) return a.entrada.silabas - b.entrada.silabas;
    return a.entrada.palabra.localeCompare(b.entrada.palabra, 'es');
  });

  return {
    consulta: esc,
    palabras: conAfinidad.map((c) => c.entrada),
    totalSinFiltrar: candidatas.length,
  };
};
