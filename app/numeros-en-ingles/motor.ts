/**
 * Motor de numeros-en-ingles: cómo se escriben y se leen los números en inglés (cardinales,
 * ordinales, años y decimales), el banco de ejercicios numerados y el corrector.
 *
 * Sin React ni navegador ni `@/lib`: lo prueban los casos resueltos a mano de
 * `tests/numeros-en-ingles-motor.spec.ts` (en `npm run test:calc`). La vista solo pinta.
 *
 * Las reglas, tal como las dan Cambridge Dictionary («Numbers») y Oxford Learner's Dictionaries:
 *  · del 21 al 99, decena y unidad con guion: twenty-one;
 *  · hundred, thousand, million y billion no llevan -s detrás de un número (two hundred);
 *  · el británico pone «and» delante de las decenas y unidades (one hundred and five), el
 *    americano no (one hundred five). Las dos son correctas;
 *  · «a hundred» vale lo mismo que «one hundred» al empezar el número;
 *  · escala corta: billion = 10⁹ (mil millones), trillion = 10¹² (un billón español);
 *  · los años se leen por parejas (nineteen ninety-nine), con «hundred» si acaban en 00 y «oh»
 *    delante de 1-9; del 2000 al 2009 como el número; desde 2010, por parejas o como el número;
 *  · los decimales se leen con «point» y las cifras de detrás una a una (zero point two five);
 *    el cero de delante es «zero», y en británico también «nought».
 *
 * Lo que NO se admite, a propósito, porque no está claro en esas fuentes o no es lo que se
 * pregunta: «nineteen hundred and five» para 1905, «twenty oh five» para 2005, «one thousand
 * million» (el antiguo billón británico) y lecturas con fracciones («ten and a half»).
 */

export type Variante = 'us' | 'uk';

/** Tope del conversor: 999.999.999.999 (novecientos noventa y nueve mil millones). */
export const MAXIMO_CONVERSOR = 999_999_999_999;
/** Cifras decimales que el conversor lee una a una. */
export const MAX_DECIMALES = 9;

const UNIDADES = [
  'zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine',
  'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen',
  'eighteen', 'nineteen',
];
const DECENAS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
const ESCALAS: [number, string][] = [
  [1_000_000_000, 'billion'],
  [1_000_000, 'million'],
  [1_000, 'thousand'],
];

/** Marca de un «and» británico opcional dentro de las piezas de un cardinal. */
const AND = '§';

/** 0-99 en una palabra (con guion de 21 a 99). */
export function dosCifras(n: number): string {
  if (n < 20) return UNIDADES[n];
  const d = Math.floor(n / 10);
  const u = n % 10;
  return u === 0 ? DECENAS[d] : `${DECENAS[d]}-${UNIDADES[u]}`;
}

/** Piezas de un grupo de 1 a 999, con la marca del «and» británico entre centenas y resto. */
function piezasGrupo(n: number): string[] {
  const c = Math.floor(n / 100);
  const r = n % 100;
  const piezas: string[] = [];
  if (c > 0) piezas.push(UNIDADES[c], 'hundred');
  if (c > 0 && r > 0) piezas.push(AND);
  if (r > 0) piezas.push(dosCifras(r));
  return piezas;
}

/** Piezas de un entero, con las marcas de los «and» británicos. */
function piezasCardinal(n: number): string[] {
  if (n === 0) return ['zero'];
  const piezas: string[] = [];
  let resto = n;
  for (const [valor, nombre] of ESCALAS) {
    const g = Math.floor(resto / valor);
    if (g > 0) {
      piezas.push(...piezasGrupo(g), nombre);
      resto %= valor;
    }
  }
  if (resto > 0) {
    // Último grupo por debajo de 100 tras una escala: «one thousand and five» en británico
    if (piezas.length > 0 && resto < 100) piezas.push(AND);
    piezas.push(...piezasGrupo(resto));
  }
  return piezas;
}

function unir(piezas: string[], conAnd: boolean[]): string {
  let i = 0;
  const salida: string[] = [];
  for (const p of piezas) {
    if (p === AND) {
      if (conAnd[i]) salida.push('and');
      i++;
    } else {
      salida.push(p);
    }
  }
  return salida.join(' ');
}

/** Un entero en palabras: americano sin «and», británico con «and». */
export function cardinal(n: number, variante: Variante): string {
  if (!Number.isInteger(n) || n < 0) throw new Error(`no es un entero no negativo: ${n}`);
  const piezas = piezasCardinal(n);
  const total = piezas.filter((p) => p === AND).length;
  return unir(piezas, Array<boolean>(total).fill(variante === 'uk'));
}

/**
 * Todas las formas admitidas de un cardinal: cada «and» británico por separado (quien lo pone en
 * un sitio y no en otro también escribe un número correcto) y «a» en lugar del «one» inicial
 * delante de hundred, thousand, million o billion.
 */
export function cardinalesAdmitidos(n: number): string[] {
  const piezas = piezasCardinal(n);
  const total = piezas.filter((p) => p === AND).length;
  const formas = new Set<string>();
  for (let mascara = 0; mascara < 1 << total; mascara++) {
    const conAnd = Array.from({ length: total }, (_, k) => ((mascara >> k) & 1) === 1);
    const f = unir(piezas, conAnd);
    formas.add(f);
    formas.add(f.replace(/^one (hundred|thousand|million|billion)\b/, 'a $1'));
  }
  return [...formas];
}

// ── Ordinales ────────────────────────────────────────────────────────────

/** Sufijo del ordinal abreviado: manda la última cifra, salvo 11, 12 y 13, que van con -th. */
export function sufijoOrdinal(n: number): 'st' | 'nd' | 'rd' | 'th' {
  const dos = n % 100;
  if (dos >= 11 && dos <= 13) return 'th';
  switch (n % 10) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
}

/** 21 → «21st». */
export function ordinalAbreviado(n: number): string {
  return `${n}${sufijoOrdinal(n)}`;
}

const ORDINALES_IRREGULARES: Record<string, string> = {
  one: 'first', two: 'second', three: 'third', five: 'fifth', eight: 'eighth', nine: 'ninth', twelve: 'twelfth',
};

/** De una palabra cardinal a su ordinal: one → first, twenty → twentieth, four → fourth. */
function palabraOrdinal(palabra: string): string {
  if (ORDINALES_IRREGULARES[palabra]) return ORDINALES_IRREGULARES[palabra];
  if (palabra.endsWith('y')) return `${palabra.slice(0, -1)}ieth`;
  return `${palabra}th`;
}

/** Solo la ÚLTIMA palabra se hace ordinal (twenty-first, one hundred and first). */
function ordinalDeCardinal(texto: string): string {
  const espacio = texto.lastIndexOf(' ');
  const cabeza = texto.slice(0, espacio + 1);
  const ultima = texto.slice(espacio + 1);
  const guion = ultima.lastIndexOf('-');
  if (guion >= 0) return `${cabeza}${ultima.slice(0, guion + 1)}${palabraOrdinal(ultima.slice(guion + 1))}`;
  return `${cabeza}${palabraOrdinal(ultima)}`;
}

/** Ordinal en palabras de un entero positivo. */
export function ordinalPalabras(n: number, variante: Variante): string {
  if (!Number.isInteger(n) || n < 1) throw new Error(`el ordinal es de enteros positivos: ${n}`);
  return ordinalDeCardinal(cardinal(n, variante));
}

/**
 * Formas admitidas del ordinal en palabras. Las del cardinal, con la última palabra ordinal; y
 * para 100, 1.000, 1.000.000 y 1.000.000.000, también sin el «one» (the hundredth anniversary).
 */
export function ordinalesAdmitidos(n: number): string[] {
  const formas = new Set(cardinalesAdmitidos(n).map(ordinalDeCardinal));
  if ([100, 1_000, 1_000_000, 1_000_000_000].includes(n)) {
    formas.add(ordinalDeCardinal(cardinal(n, 'us')).replace(/^one /, ''));
  }
  return [...formas];
}

// ── Años ─────────────────────────────────────────────────────────────────

export const ANIO_MINIMO = 1100;
export const ANIO_MAXIMO = 2099;

export interface LecturaAnio {
  texto: string;
  /** Rótulo de la lectura. */
  etiqueta: string;
}

/**
 * Lecturas de un año de 1100 a 2099, la más habitual primero; `null` fuera de ese rango.
 * Solo las que dan Cambridge y Oxford: en parejas (nineteen ninety-nine), con «hundred»
 * (nineteen hundred) y con «oh» (nineteen oh five); del 2000 al 2009, como el número; desde
 * 2010, en parejas o como el número.
 */
export function lecturasAnio(n: number): LecturaAnio[] | null {
  if (!Number.isInteger(n) || n < ANIO_MINIMO || n > ANIO_MAXIMO) return null;
  const alto = Math.floor(n / 100);
  const bajo = n % 100;
  if (n < 2000) {
    if (bajo === 0) return [{ texto: `${dosCifras(alto)} hundred`, etiqueta: 'En parejas' }];
    if (bajo < 10) return [{ texto: `${dosCifras(alto)} oh ${UNIDADES[bajo]}`, etiqueta: 'En parejas' }];
    return [{ texto: `${dosCifras(alto)} ${dosCifras(bajo)}`, etiqueta: 'En parejas' }];
  }
  if (n === 2000) return [{ texto: 'two thousand', etiqueta: 'Como el número' }];
  const comoNumero: LecturaAnio[] = [
    { texto: cardinal(n, 'us'), etiqueta: 'Como el número (americano)' },
    { texto: cardinal(n, 'uk'), etiqueta: 'Como el número (británico)' },
  ];
  if (n < 2010) return comoNumero;
  return [{ texto: `twenty ${dosCifras(bajo)}`, etiqueta: 'En parejas' }, ...comoNumero];
}

// ── Decimales ────────────────────────────────────────────────────────────

/** Cifras tras el punto, una a una: «25» → «two five». */
function cifrasUnaAUna(decimales: string): string {
  return [...decimales].map((c) => UNIDADES[Number(c)]).join(' ');
}

/** Un decimal en palabras: 3,5 → «three point five»; en británico, 0,25 → «nought point two five». */
export function decimalPalabras(entera: number, decimales: string, variante: Variante): string {
  const ent = entera === 0 && variante === 'uk' ? 'nought' : cardinal(entera, variante);
  return `${ent} point ${cifrasUnaAUna(decimales)}`;
}

/** Formas admitidas de un decimal: cada forma del entero, y «nought» o «zero» si es cero. */
export function decimalesAdmitidos(entera: number, decimales: string): string[] {
  const enteras = entera === 0 ? ['zero', 'nought'] : cardinalesAdmitidos(entera);
  return enteras.map((e) => `${e} point ${cifrasUnaAUna(decimales)}`);
}

// ── Notación ─────────────────────────────────────────────────────────────

/** Agrupa una cadena de cifras de tres en tres con el separador dado. */
function agrupar(cifras: string, separador: string): string {
  return cifras.replace(/\B(?=(\d{3})+(?!\d))/g, separador);
}

/** Cómo se escribe la cifra en inglés: coma de millares y punto decimal (1,234.5). */
export function notacionInglesa(entera: string, decimales: string): string {
  const e = agrupar(entera, ',');
  return decimales ? `${e}.${decimales}` : e;
}

/**
 * La cifra en formato español, como la pinta `Intl` en es-ES: punto de millares desde las cinco
 * cifras (con cuatro no se agrupa, Ortografía de la RAE) y coma decimal.
 */
export function cifraEspanola(entera: string, decimales = ''): string {
  const e = entera.length > 4 ? agrupar(entera, '.') : entera;
  return decimales ? `${e},${decimales}` : e;
}

// ── Conversor ────────────────────────────────────────────────────────────

export interface Conversion {
  /** Lectura completa en americano y en británico (iguales si no hay «and» que poner). */
  us: string;
  uk: string;
  /** Otra lectura británica, cuando el decimal empieza por cero (zero point… además de nought). */
  ukAlternativa?: string;
  ordinal?: { abreviado: string; us: string; uk: string };
  anio?: LecturaAnio[];
  /** La cifra en formato español, con los decimales tal como se teclearon. */
  espanol: string;
  /** La cifra en notación inglesa (1,234.5). */
  notacion: string;
  /** Cifra de mil millones o más: billion ≠ billón. */
  escalaCorta: boolean;
  esDecimal: boolean;
}

export type ResultadoConversion = { ok: true; conversion: Conversion } | { ok: false; error: string };

const ERROR_GRANDE = 'La cifra es demasiado grande: el conversor llega hasta 999.999.999.999.';

/**
 * Convierte la cifra ya separada en sus partes. La vista la lee con `partesNumericas` de `@/lib`,
 * que conserva los decimales tal como se teclearon: 3,50 se lee «three point five zero».
 */
export function convertir(signo: number, enteraTexto: string, decimales: string): ResultadoConversion {
  if (signo < 0) return { ok: false, error: 'Escribe una cifra sin signo: el conversor va de 0 a 999.999.999.999.' };
  if (!/^\d*$/.test(enteraTexto) || !/^\d*$/.test(decimales) || (enteraTexto === '' && decimales === '')) {
    return { ok: false, error: 'No se reconoce esa cifra. Escribe solo números, con coma decimal (3,5) y, si quieres, punto de millares (1.250).' };
  }
  const limpia = enteraTexto.replace(/^0+(?=\d)/, '') || '0';
  if (limpia.length > 12) return { ok: false, error: ERROR_GRANDE };
  if (decimales.length > MAX_DECIMALES) {
    return { ok: false, error: `Escribe como mucho ${MAX_DECIMALES} cifras decimales.` };
  }
  const entera = Number(limpia);
  if (entera > MAXIMO_CONVERSOR) return { ok: false, error: ERROR_GRANDE };
  const esDecimal = decimales !== '';
  const conversion: Conversion = {
    us: esDecimal ? decimalPalabras(entera, decimales, 'us') : cardinal(entera, 'us'),
    uk: esDecimal ? decimalPalabras(entera, decimales, 'uk') : cardinal(entera, 'uk'),
    espanol: cifraEspanola(limpia, decimales),
    notacion: notacionInglesa(limpia, decimales),
    escalaCorta: entera >= 1_000_000_000,
    esDecimal,
  };
  if (esDecimal && entera === 0) conversion.ukAlternativa = `zero point ${cifrasUnaAUna(decimales)}`;
  if (!esDecimal && entera > 0) {
    conversion.ordinal = {
      abreviado: ordinalAbreviado(entera),
      us: ordinalPalabras(entera, 'us'),
      uk: ordinalPalabras(entera, 'uk'),
    };
  }
  if (!esDecimal) {
    const anio = lecturasAnio(entera);
    if (anio) conversion.anio = anio;
  }
  return { ok: true, conversion };
}

// ── Corrector ────────────────────────────────────────────────────────────

/**
 * Lo que un alumno escribe, en limpio: minúsculas, comas fuera, sin punto final, sin espacios de
 * más y con el guion pegado («Twenty - One.» → «twenty-one»).
 */
export function normalizarTexto(entrada: string): string {
  return entrada
    .toLowerCase()
    .replace(/[‐-―]/g, '-')
    .replace(/[,;]/g, ' ')
    .replace(/[.!?¡¿]+\s*$/g, '')
    .replace(/\s*-\s*/g, '-')
    .replace(/\s+/g, ' ')
    .trim();
}

const sinGuiones = (s: string) => s.replace(/-/g, ' ').replace(/\s+/g, ' ').trim();

export interface CorreccionTexto {
  ok: boolean;
  /** Palabras con guion que el alumno escribió sin él (se da por buena, pero se recuerda). */
  faltaGuion: string[];
}

/**
 * ¿Está bien escrita una forma en palabras? Compara sin guiones con cada forma admitida; si
 * coincide pero faltan los guiones de 21-99 (twenty one), se da por buena y se dice cuáles.
 */
export function corregirTexto(entrada: string, admitidas: string[]): CorreccionTexto {
  const escrito = normalizarTexto(entrada);
  if (escrito === '') return { ok: false, faltaGuion: [] };
  const plano = sinGuiones(escrito);
  const coincide = admitidas.find((a) => sinGuiones(a) === plano);
  if (!coincide) return { ok: false, faltaGuion: [] };
  const conGuion = coincide.split(' ').filter((p) => p.includes('-'));
  const palabrasEscritas = new Set(escrito.split(' '));
  return { ok: true, faltaGuion: conGuion.filter((p) => !palabrasEscritas.has(p)) };
}

export interface CifraLeida {
  entera: string;
  decimales: string;
}

/** Quita ceros sobrantes para comparar valores: 007 → 7, 1,40 → 1,4. */
function canonica(c: CifraLeida): string {
  const e = c.entera.replace(/^0+(?=\d)/, '') || '0';
  const d = c.decimales.replace(/0+$/, '');
  return d ? `${e},${d}` : e;
}

const RE_ES_AGRUPADA = /^(\d{1,3}(?:\.\d{3})+)(?:,(\d+))?$/;
const RE_ES_SEGUIDA = /^(\d+)(?:,(\d+))?$/;
const RE_EN_AGRUPADA = /^(\d{1,3}(?:,\d{3})+)(?:\.(\d+))?$/;
const RE_EN_DECIMAL = /^(\d+)\.(\d+)$/;

/** Lee una cifra en formato español (1.250.000 · 3,5) o con las cifras seguidas (1250000). */
export function leerCifraEspanola(entrada: string): CifraLeida | null {
  const s = entrada.replace(/[\s  ]/g, '').replace(/\.$/, '');
  const agrupada = s.match(RE_ES_AGRUPADA);
  if (agrupada) return { entera: agrupada[1].replace(/\./g, ''), decimales: agrupada[2] ?? '' };
  const seguida = s.match(RE_ES_SEGUIDA);
  if (seguida) return { entera: seguida[1], decimales: seguida[2] ?? '' };
  return null;
}

/** Lee una cifra en notación inglesa (1,250,000 · 3.5), para reconocer ese despiste. */
function leerCifraInglesa(entrada: string): CifraLeida | null {
  const s = entrada.replace(/[\s  ]/g, '');
  const agrupada = s.match(RE_EN_AGRUPADA);
  if (agrupada) return { entera: agrupada[1].replace(/,/g, ''), decimales: agrupada[2] ?? '' };
  const decimal = s.match(RE_EN_DECIMAL);
  if (decimal) return { entera: decimal[1], decimales: decimal[2] };
  return null;
}

export interface CorreccionCifra {
  ok: boolean;
  /** La escribió bien pero con la notación inglesa (coma de millares o punto decimal). */
  notacionInglesa: boolean;
}

export function corregirCifra(entrada: string, esperada: CifraLeida): CorreccionCifra {
  const objetivo = canonica(esperada);
  const es = leerCifraEspanola(entrada);
  if (es && canonica(es) === objetivo) return { ok: true, notacionInglesa: false };
  const en = leerCifraInglesa(entrada);
  return { ok: false, notacionInglesa: en !== null && canonica(en) === objetivo };
}

/** ¿Está bien el ordinal abreviado? Admite mayúsculas, espacios y el punto final («22 ND.»). */
export function corregirAbreviado(entrada: string, n: number): boolean {
  const s = entrada.toLowerCase().replace(/[\s ]/g, '').replace(/\.$/, '');
  return s === ordinalAbreviado(n);
}

// ── Banco de ejercicios ──────────────────────────────────────────────────

export type Categoria = 'cardinales' | 'ordinales' | 'anios' | 'decimales' | 'grandes';

export const CATEGORIAS: Record<Categoria, { nombre: string; desc: string }> = {
  cardinales: { nombre: 'Cardinales', desc: '13 o 30, fifteen o fifty' },
  ordinales: { nombre: 'Ordinales', desc: 'first, twelfth, 22nd' },
  anios: { nombre: 'Años', desc: 'nineteen oh five' },
  decimales: { nombre: 'Decimales', desc: 'three point five' },
  grandes: { nombre: 'Grandes cifras', desc: 'million, billion' },
};

export const ORDEN_CATEGORIAS: Categoria[] = ['cardinales', 'ordinales', 'anios', 'decimales', 'grandes'];

/**
 * Tipos de ejercicio:
 *  · `cardinal`: entero ↔ palabras;
 *  · `ordinal`: «3.º» → palabras (third);
 *  · `ordinal-abreviado`: «22.º» → 22nd;
 *  · `anio`: año ↔ su lectura;
 *  · `decimal`: decimal ↔ palabras.
 */
export type TipoEjercicio = 'cardinal' | 'ordinal' | 'ordinal-abreviado' | 'anio' | 'decimal';
/** `a-palabras`: se da la cifra y se escribe en inglés; `a-cifra`: se da el inglés y se escribe la cifra. */
export type Sentido = 'a-palabras' | 'a-cifra';

export interface Ejercicio {
  /** Número estable que se ve en pantalla («Ejercicio 12»): el que asigna un profesor. */
  numero: number;
  categoria: Categoria;
  tipo: TipoEjercicio;
  sentido: Sentido;
  /** Parte entera de la cifra. */
  entera: number;
  /** Cifras decimales, si las tiene. */
  decimales?: string;
  /** En `a-cifra`, qué se lee (si no, la forma americana). Tiene que ser una forma admitida. */
  leido?: string;
  /** Tres respuestas incorrectas para el modo de elegir, escritas a mano: errores típicos. */
  distractores: [string, string, string];
}

type SinNumero = Omit<Ejercicio, 'numero'>;

/**
 * ⚠️ El número de cada ejercicio es su POSICIÓN aquí: un profesor puede haber asignado «los
 * ejercicios 3, 7 y 11». Los nuevos van AL FINAL; reordenar o quitar cambia los números.
 */
const BANCO: SinNumero[] = [
  // ── Cardinales ──
  { categoria: 'cardinales', tipo: 'cardinal', sentido: 'a-palabras', entera: 13, distractores: ['thirty', 'threeteen', 'thirdteen'] },
  { categoria: 'cardinales', tipo: 'cardinal', sentido: 'a-palabras', entera: 30, distractores: ['thirteen', 'threety', 'thirdy'] },
  { categoria: 'cardinales', tipo: 'cardinal', sentido: 'a-palabras', entera: 15, distractores: ['fifty', 'fiveteen', 'fifteenth'] },
  { categoria: 'cardinales', tipo: 'cardinal', sentido: 'a-cifra', entera: 50, distractores: ['15', '5', '500'] },
  { categoria: 'cardinales', tipo: 'cardinal', sentido: 'a-palabras', entera: 12, distractores: ['twelf', 'twoteen', 'twenty'] },
  { categoria: 'cardinales', tipo: 'cardinal', sentido: 'a-palabras', entera: 40, distractores: ['fourty', 'fourteen', 'forteen'] },
  { categoria: 'cardinales', tipo: 'cardinal', sentido: 'a-palabras', entera: 21, distractores: ['one-twenty', 'twenty-first', 'twoty-one'] },
  { categoria: 'cardinales', tipo: 'cardinal', sentido: 'a-palabras', entera: 99, distractores: ['ninty-nine', 'nineteen-nine', 'nine-ninety'] },
  { categoria: 'cardinales', tipo: 'cardinal', sentido: 'a-palabras', entera: 105, distractores: ['one hundreds five', 'one hundred fifty', 'a hundred fifteen'] },
  { categoria: 'cardinales', tipo: 'cardinal', sentido: 'a-palabras', entera: 1234, distractores: ['one thousands two hundreds thirty-four', 'one thousand two hundred forty-three', 'one thousand two hundred thirty-fourth'] },
  { categoria: 'cardinales', tipo: 'cardinal', sentido: 'a-cifra', entera: 18, distractores: ['80', '8', '108'] },
  { categoria: 'cardinales', tipo: 'cardinal', sentido: 'a-cifra', entera: 370, leido: 'three hundred and seventy', distractores: ['317', '307', '3070'] },
  { categoria: 'cardinales', tipo: 'cardinal', sentido: 'a-cifra', entera: 2016, leido: 'two thousand and sixteen', distractores: ['2060', '2116', '216'] },

  // ── Ordinales ──
  { categoria: 'ordinales', tipo: 'ordinal', sentido: 'a-palabras', entera: 3, distractores: ['threeth', 'thirth', 'thirdth'] },
  { categoria: 'ordinales', tipo: 'ordinal', sentido: 'a-palabras', entera: 5, distractores: ['fiveth', 'fifht', 'fiftieth'] },
  { categoria: 'ordinales', tipo: 'ordinal', sentido: 'a-palabras', entera: 12, distractores: ['twelveth', 'twelvth', 'twentieth'] },
  { categoria: 'ordinales', tipo: 'ordinal', sentido: 'a-palabras', entera: 9, distractores: ['nineth', 'nineteenth', 'ninetieth'] },
  { categoria: 'ordinales', tipo: 'ordinal', sentido: 'a-palabras', entera: 20, distractores: ['twentyth', 'twelfth', 'twentith'] },
  { categoria: 'ordinales', tipo: 'ordinal', sentido: 'a-palabras', entera: 21, distractores: ['twentieth-first', 'twenty-oneth', 'twentieth-one'] },
  { categoria: 'ordinales', tipo: 'ordinal', sentido: 'a-palabras', entera: 100, distractores: ['one hundreth', 'one hundredst', 'one hundredeth'] },
  { categoria: 'ordinales', tipo: 'ordinal-abreviado', sentido: 'a-cifra', entera: 22, distractores: ['22th', '22rd', '22st'] },
  { categoria: 'ordinales', tipo: 'ordinal-abreviado', sentido: 'a-cifra', entera: 11, distractores: ['11st', '11nd', '11rd'] },
  { categoria: 'ordinales', tipo: 'ordinal-abreviado', sentido: 'a-cifra', entera: 103, distractores: ['103th', '103nd', '103st'] },
  { categoria: 'ordinales', tipo: 'ordinal-abreviado', sentido: 'a-cifra', entera: 112, distractores: ['112nd', '112st', '112rd'] },
  { categoria: 'ordinales', tipo: 'ordinal-abreviado', sentido: 'a-cifra', entera: 31, distractores: ['31th', '31nd', '31rd'] },

  // ── Años ──
  { categoria: 'anios', tipo: 'anio', sentido: 'a-palabras', entera: 1999, distractores: ['nineteen nine nine', 'nine ninety-nine', 'nineteen nineteen'] },
  { categoria: 'anios', tipo: 'anio', sentido: 'a-palabras', entera: 1905, distractores: ['nineteen five', 'nineteen fifty', 'ninety oh five'] },
  { categoria: 'anios', tipo: 'anio', sentido: 'a-palabras', entera: 1900, distractores: ['nineteen zero zero', 'nineteen hundreds', 'one nine hundred'] },
  { categoria: 'anios', tipo: 'anio', sentido: 'a-palabras', entera: 2000, distractores: ['twenty zero', 'two thousands', 'twenty oh oh'] },
  { categoria: 'anios', tipo: 'anio', sentido: 'a-palabras', entera: 2008, distractores: ['twenty eight', 'two thousands eight', 'two hundred and eight'] },
  { categoria: 'anios', tipo: 'anio', sentido: 'a-palabras', entera: 2024, distractores: ['twenty-two four', 'twenty twenty-fourth', 'two zero two four'] },
  { categoria: 'anios', tipo: 'anio', sentido: 'a-cifra', entera: 1865, distractores: ['8065', '1856', '1815'] },
  { categoria: 'anios', tipo: 'anio', sentido: 'a-cifra', entera: 1909, distractores: ['1990', '1919', '1900'] },
  { categoria: 'anios', tipo: 'anio', sentido: 'a-palabras', entera: 1100, distractores: ['eleven hundreds', 'eleventh hundred', 'one one hundred'] },

  // ── Decimales ──
  { categoria: 'decimales', tipo: 'decimal', sentido: 'a-palabras', entera: 3, decimales: '5', distractores: ['three comma five', 'three and five', 'three point fifth'] },
  { categoria: 'decimales', tipo: 'decimal', sentido: 'a-palabras', entera: 0, decimales: '25', distractores: ['zero point twenty-five', 'zero comma two five', 'zero point two fifth'] },
  { categoria: 'decimales', tipo: 'decimal', sentido: 'a-palabras', entera: 2, decimales: '75', distractores: ['two point seventy-five', 'two comma seventy-five', 'two and seventy-five'] },
  { categoria: 'decimales', tipo: 'decimal', sentido: 'a-cifra', entera: 1, decimales: '4', distractores: ['14', '1,04', '4,1'] },
  { categoria: 'decimales', tipo: 'decimal', sentido: 'a-cifra', entera: 9, decimales: '81', distractores: ['9,081', '98,1', '981'] },
  { categoria: 'decimales', tipo: 'decimal', sentido: 'a-palabras', entera: 10, decimales: '5', distractores: ['ten comma five', 'one zero point five', 'ten point fifth'] },

  // ── Grandes cifras ──
  { categoria: 'grandes', tipo: 'cardinal', sentido: 'a-palabras', entera: 1_000_000, distractores: ['one millions', 'one billion', 'one thousand million'] },
  { categoria: 'grandes', tipo: 'cardinal', sentido: 'a-palabras', entera: 1_000_000_000, distractores: ['one million', 'one trillion', 'one thousand billion'] },
  { categoria: 'grandes', tipo: 'cardinal', sentido: 'a-palabras', entera: 1_250_000, distractores: ['one million two hundreds fifty thousands', 'one billion two hundred fifty thousand', 'one million twenty-five thousand'] },
  { categoria: 'grandes', tipo: 'cardinal', sentido: 'a-cifra', entera: 3_000_000_000, distractores: ['3.000.000.000.000', '3.000.000', '300.000.000'] },
  { categoria: 'grandes', tipo: 'cardinal', sentido: 'a-palabras', entera: 45_000, distractores: ['forty-five thousands', 'fourty-five thousand', 'fifty-four thousand'] },
  { categoria: 'grandes', tipo: 'cardinal', sentido: 'a-palabras', entera: 600_000, distractores: ['six hundreds thousand', 'six hundred thousands', 'sixty thousand'] },
  { categoria: 'grandes', tipo: 'cardinal', sentido: 'a-cifra', entera: 750_000, leido: 'seven hundred and fifty thousand', distractores: ['7.500.000', '75.000', '700.050'] },
];

/** El banco numerado: el número es la posición, 1..N. */
export const EJERCICIOS: Ejercicio[] = BANCO.map((e, i) => ({ ...e, numero: i + 1 }));

export const TOTAL_EJERCICIOS = EJERCICIOS.length;

export function ejercicioPorNumero(numero: number): Ejercicio | undefined {
  return EJERCICIOS[numero - 1];
}

/** La cifra del ejercicio en formato español; los años, sin punto. */
export function cifraDe(e: Ejercicio): string {
  if (e.tipo === 'anio') return String(e.entera);
  return cifraEspanola(String(e.entera), e.decimales ?? '');
}

/** Formas admitidas en palabras de lo que se lee en el ejercicio. */
export function palabrasAdmitidas(e: Ejercicio): string[] {
  switch (e.tipo) {
    case 'cardinal': return cardinalesAdmitidos(e.entera);
    case 'ordinal': return ordinalesAdmitidos(e.entera);
    case 'anio': return (lecturasAnio(e.entera) ?? []).map((l) => l.texto);
    case 'decimal': return decimalesAdmitidos(e.entera, e.decimales ?? '');
    case 'ordinal-abreviado': return [ordinalAbreviado(e.entera)];
  }
}

/** La forma en palabras que se enseña primero (la americana, más corta, cuando hay dos). */
export function palabrasPrincipal(e: Ejercicio): string {
  switch (e.tipo) {
    case 'cardinal': return cardinal(e.entera, 'us');
    case 'ordinal': return ordinalPalabras(e.entera, 'us');
    case 'anio': return (lecturasAnio(e.entera) ?? [])[0]?.texto ?? '';
    case 'decimal': return decimalPalabras(e.entera, e.decimales ?? '', 'us');
    case 'ordinal-abreviado': return ordinalAbreviado(e.entera);
  }
}

export interface Enunciado {
  instruccion: string;
  /** Lo que se muestra grande. */
  mostrado: string;
  /** ¿Lo mostrado está en inglés? (para `lang="en"`) */
  enIngles: boolean;
  /** Matiz bajo lo mostrado. */
  nota: string;
}

export function enunciadoDe(e: Ejercicio): Enunciado {
  if (e.tipo === 'ordinal') {
    return { instruccion: 'Escribe en palabras, en inglés, este ordinal:', mostrado: `${e.entera}.º`, enIngles: false, nota: `El que va en el puesto ${e.entera}` };
  }
  if (e.tipo === 'ordinal-abreviado') {
    return { instruccion: 'Escribe este ordinal abreviado en inglés (cifra y dos letras):', mostrado: `${e.entera}.º`, enIngles: false, nota: 'Como se escribe en una fecha o una clasificación' };
  }
  if (e.sentido === 'a-palabras') {
    const instruccion = e.tipo === 'anio' ? '¿Cómo se lee este año en inglés? Escríbelo en palabras:' : 'Escribe en palabras, en inglés:';
    const nota = e.tipo === 'anio' ? 'Un año' : 'Cifra en formato español';
    return { instruccion, mostrado: cifraDe(e), enIngles: false, nota };
  }
  const instruccion = e.tipo === 'anio' ? 'Escribe en cifras el año que se lee:' : 'Escribe en cifras el número que se lee:';
  const nota = e.tipo === 'decimal' ? 'Respóndelo en formato español, con coma decimal' : 'Respóndelo en formato español o con las cifras seguidas';
  return { instruccion, mostrado: e.leido ?? palabrasPrincipal(e), enIngles: true, nota };
}

/** La respuesta correcta que se pinta como opción y como solución. */
export function respuestaPrincipal(e: Ejercicio): string {
  if (e.tipo === 'ordinal-abreviado') return ordinalAbreviado(e.entera);
  return e.sentido === 'a-palabras' ? palabrasPrincipal(e) : cifraDe(e);
}

export interface FormaCorrecta {
  texto: string;
  /** Rótulo cuando hay más de una forma ('' si solo hay una). */
  etiqueta: string;
  /** ¿Está en inglés? (las cifras, no) */
  enIngles: boolean;
}

/** Las formas correctas que el veredicto enseña, con su rótulo cuando hay más de una. */
export function formasCorrectas(e: Ejercicio): FormaCorrecta[] {
  if (e.tipo === 'ordinal-abreviado') return [{ texto: ordinalAbreviado(e.entera), etiqueta: '', enIngles: true }];
  if (e.sentido === 'a-cifra') return [{ texto: cifraDe(e), etiqueta: '', enIngles: false }];
  if (e.tipo === 'anio') {
    const l = lecturasAnio(e.entera) ?? [];
    return l.map((x) => ({ texto: x.texto, etiqueta: l.length > 1 ? x.etiqueta : '', enIngles: true }));
  }
  const us = palabrasPrincipal(e);
  const uk = e.tipo === 'cardinal' ? cardinal(e.entera, 'uk')
    : e.tipo === 'ordinal' ? ordinalPalabras(e.entera, 'uk')
    : decimalPalabras(e.entera, e.decimales ?? '', 'uk');
  if (us === uk) return [{ texto: us, etiqueta: '', enIngles: true }];
  return [
    { texto: us, etiqueta: 'Americano', enIngles: true },
    { texto: uk, etiqueta: 'Británico', enIngles: true },
  ];
}

/** Las cuatro opciones del modo de elegir, sin barajar: la buena primero. */
export function opcionesDe(e: Ejercicio): string[] {
  return [respuestaPrincipal(e), ...e.distractores];
}

export interface Correccion {
  ok: boolean;
  /** Palabras que llevan guion y se escribieron sin él (acierto, pero se recuerda la regla). */
  faltaGuion: string[];
  /** Cifra correcta escrita con la notación inglesa (se da por fallo y se explica). */
  notacionInglesa: boolean;
}

/** Corrige lo que el alumno escribe en un ejercicio. */
export function corregir(e: Ejercicio, entrada: string): Correccion {
  if (e.tipo === 'ordinal-abreviado') {
    return { ok: corregirAbreviado(entrada, e.entera), faltaGuion: [], notacionInglesa: false };
  }
  if (e.sentido === 'a-cifra') {
    const c = corregirCifra(entrada, { entera: String(e.entera), decimales: e.decimales ?? '' });
    return { ok: c.ok, faltaGuion: [], notacionInglesa: c.notacionInglesa };
  }
  const t = corregirTexto(entrada, palabrasAdmitidas(e));
  return { ok: t.ok, faltaGuion: t.faltaGuion, notacionInglesa: false };
}

// ── Explicaciones: la regla aplicada al caso ─────────────────────────────

function reglaDosCifras(r: number): string[] {
  const frases: string[] = [];
  if (r === 11 || r === 12) {
    frases.push('Eleven y twelve tienen nombre propio: no siguen el patrón -teen.');
  } else if (r >= 13 && r <= 19) {
    frases.push('Del 13 al 19 terminan en -teen y se acentúan al final (thir-TEEN); las decenas terminan en -ty y se acentúan al principio (THIR-ty).');
    if (r === 13) frases.push('La raíz es thir-, no three-.');
    if (r === 15) frases.push('La raíz es fif-, no five-: fifteen, como fifty.');
    if (r === 18) frases.push('Eighteen lleva una sola t.');
  } else if (r >= 20 && r % 10 === 0) {
    frases.push('Las decenas terminan en -ty y se acentúan al principio (THIR-ty), frente a las de -teen, acentuadas al final (thir-TEEN).');
    if (r === 30) frases.push('La raíz es thir-, no three-.');
    if (r === 40) frases.push('Forty se escribe sin u, aunque four y fourteen la llevan.');
    if (r === 50) frases.push('La raíz es fif-, no five-.');
    if (r === 80) frases.push('Eighty lleva una sola t.');
  } else if (r > 20) {
    frases.push(`Del 21 al 99, decena y unidad se unen con guion: ${dosCifras(r)}.`);
    if (Math.floor(r / 10) === 9) frases.push('Ninety conserva la e de nine.');
  }
  return frases;
}

export function explicarCardinal(n: number): string {
  const frases = reglaDosCifras(n % 100);
  if (n >= 100) {
    frases.push('Hundred, thousand, million y billion no llevan -s detrás de un número: two hundred, no two hundreds.');
    const us = cardinal(n, 'us');
    const uk = cardinal(n, 'uk');
    if (us !== uk) frases.push(`El británico pone and delante de las decenas y unidades (${uk}); el americano lo omite (${us}). Las dos son correctas.`);
    if (/^one (hundred|thousand|million|billion)/.test(us)) frases.push('Al empezar el número, one puede cambiarse por a: a hundred, a thousand, a million.');
  }
  if (n >= 1_000_000_000) {
    frases.push('Billion es mil millones (10⁹), no un billón español; un billón español (10¹²) es trillion.');
  } else if (n >= 1_000_000) {
    frases.push('Million es un millón; mil millones ya es billion, porque el inglés usa la escala corta.');
  }
  return frases.join(' ');
}

export function explicarOrdinal(n: number): string {
  const enPalabras = cardinal(n, 'us');
  const ultima = enPalabras.split(/[ -]/).at(-1) ?? '';
  const frases: string[] = [];
  if (ultima === 'one' || ultima === 'two' || ultima === 'three') {
    frases.push('First, second y third son irregulares.');
  } else if (ultima === 'five' || ultima === 'twelve') {
    frases.push(`Five y twelve cambian la -ve por -f antes de -th: ${ultima} → ${palabraOrdinal(ultima)}.`);
  } else if (ultima === 'eight') {
    frases.push('Eight solo añade -h: eighth, con una sola t.');
  } else if (ultima === 'nine') {
    frases.push('Nine pierde la e: ninth.');
  } else if (ultima.endsWith('y')) {
    frases.push(`Las decenas cambian la -y por -ieth: ${ultima} → ${palabraOrdinal(ultima)}.`);
  } else {
    frases.push(`Se añade -th: ${ultima} → ${palabraOrdinal(ultima)}.`);
  }
  if (enPalabras !== ultima) {
    frases.push(`Solo la última palabra se hace ordinal: ${ordinalPalabras(n, 'us')}.`);
  }
  return frases.join(' ');
}

export function explicarAbreviado(n: number): string {
  const dos = n % 100;
  const base = 'La abreviatura copia las dos últimas letras de la palabra: first → 1st, second → 2nd, third → 3rd y el resto -th.';
  if (dos >= 11 && dos <= 13) {
    return `${base} Las que acaban en 11, 12 o 13 van con -th (eleventh, twelfth, thirteenth): ${ordinalAbreviado(n)}.`;
  }
  return `${base} Manda la última cifra: ${n} es ${ordinalPalabras(n, 'us')}, así que ${ordinalAbreviado(n)}.`;
}

export function explicarAnio(n: number): string {
  const alto = Math.floor(n / 100);
  const bajo = n % 100;
  if (n === 2000) return 'El año 2000 se lee como el número: two thousand.';
  if (n > 2000 && n < 2010) {
    return `Del 2001 al 2009 se leen como el número: ${cardinal(n, 'uk')} (británico) o ${cardinal(n, 'us')} (americano).`;
  }
  if (n >= 2010) {
    return `Desde 2010 se oyen las dos lecturas: por parejas de cifras (twenty ${dosCifras(bajo)}) o como el número (${cardinal(n, 'uk')}).`;
  }
  const parejas = `Los años se leen en dos parejas de cifras (${alto} | ${String(bajo).padStart(2, '0')}).`;
  if (bajo === 0) return `${parejas} Si la segunda pareja es 00, se dice hundred: ${dosCifras(alto)} hundred.`;
  if (bajo < 10) return `${parejas} Si la segunda pareja va del 01 al 09, el cero se lee oh: ${dosCifras(alto)} oh ${UNIDADES[bajo]}.`;
  return `${parejas} Cada pareja se lee como un número: ${dosCifras(alto)} ${dosCifras(bajo)}.`;
}

export function explicarDecimal(entera: number, decimales: string): string {
  const comoNumero = decimales.length > 1 && !decimales.startsWith('0') ? `, no point ${cardinal(Number(decimales), 'us')}` : '';
  const frases = [
    `La coma decimal se lee point, y en inglés se escribe con punto: ${notacionInglesa(String(entera), decimales)}.`,
    `Las cifras de detrás se dicen una a una: point ${cifrasUnaAUna(decimales)}${comoNumero}.`,
  ];
  if (entera === 0) frases.push('El cero de delante es zero; en británico también nought.');
  return frases.join(' ');
}

/** La regla que explica la respuesta, aplicada al caso del ejercicio. */
export function explicar(e: Ejercicio): string {
  switch (e.tipo) {
    case 'cardinal': return explicarCardinal(e.entera);
    case 'ordinal': return explicarOrdinal(e.entera);
    case 'ordinal-abreviado': return explicarAbreviado(e.entera);
    case 'anio': return explicarAnio(e.entera);
    case 'decimal': return explicarDecimal(e.entera, e.decimales ?? '');
  }
}

// ── Selección por números ────────────────────────────────────────────────

export type Seleccion = { ok: true; numeros: number[] } | { ok: false; error: string };

const RE_RANGO = /^(\d+)-(\d+)$/;
const EJEMPLO_SELECCION = 'por ejemplo «3, 7, 11» o «5-9»';

/**
 * Lee «3, 7, 11», «5-9» o una mezcla («1-3, 8»), en el orden en que se escriben y sin repetir.
 * Error si algo no es un número o un rango, o si un número no está en el banco.
 */
export function leerSeleccion(texto: string, total: number = TOTAL_EJERCICIOS): Seleccion {
  // «5 - 9» con espacios: se pega el rango antes de trocear
  const piezas = texto
    .replace(/\s*[-–—]\s*/g, '-')
    .split(/[,;\s]+/)
    .map((t) => t.trim().replace(/\.$/, ''))
    .filter(Boolean);
  if (piezas.length === 0) return { ok: false, error: `Escribe los números de los ejercicios, ${EJEMPLO_SELECCION}.` };
  const numeros: number[] = [];
  const fuera: number[] = [];
  for (const p of piezas) {
    const rango = p.match(RE_RANGO);
    if (!rango && !/^\d+$/.test(p)) return { ok: false, error: `«${p}» no es un número de ejercicio: escribe, ${EJEMPLO_SELECCION}.` };
    const desde = rango ? Number(rango[1]) : Number(p);
    const hasta = rango ? Number(rango[2]) : Number(p);
    const bajo = Math.min(desde, hasta);
    const alto = Math.max(desde, hasta);
    if (alto - bajo > 1000) return { ok: false, error: `El rango «${p}» es demasiado largo: los ejercicios van del 1 al ${total}.` };
    const paso = desde <= hasta ? 1 : -1;
    for (let n = desde; paso > 0 ? n <= hasta : n >= hasta; n += paso) {
      if (n < 1 || n > total) {
        if (!fuera.includes(n)) fuera.push(n);
      } else if (!numeros.includes(n)) {
        numeros.push(n);
      }
    }
  }
  if (fuera.length > 0) {
    const lista = fuera.slice(0, 5).join(', ');
    const sujeto = fuera.length === 1 ? 'No existe el ejercicio' : 'No existen los ejercicios';
    return { ok: false, error: `${sujeto} ${lista}: los ejercicios van del 1 al ${total}.` };
  }
  return { ok: true, numeros };
}
