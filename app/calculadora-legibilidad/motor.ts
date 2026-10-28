/**
 * Motor de la Calculadora de Legibilidad — sin dependencias, para probarlo en Node.
 *
 * Casos resueltos a mano en tests/legibilidad-motor.spec.ts. Hasta el 21/10/2026 este cálculo
 * vivía dentro de page.tsx y solo daba cifras globales: la propia guía de la app mandaba
 * «buscar manualmente las frases de más de 30 palabras». Ahora además SEÑALA dónde está la
 * dificultad (S0218): qué frases pasan del umbral, cuánto subiría la puntuación al partir cada
 * una y qué palabras cargan más sílabas.
 *
 * ⚠️ El recuento de palabras, frases y sílabas es EXACTAMENTE el de antes del 21/10: el resaltado
 * no puede contar distinto que la puntuación, o una frase señalada no cuadraría con la cifra.
 */

/** Por encima de estas palabras la frase se señala (mismo umbral que la recomendación). */
export const PALABRAS_FRASE_LARGA = 25;
/** Largo máximo de cada trozo al proponer partir una frase: la frase ideal en web es de 15-20. */
export const PALABRAS_TROZO = 20;
/** Desde estas sílabas una palabra se resalta. Las de 3 son demasiado comunes para señalarlas. */
export const SILABAS_PALABRA_MUY_LARGA = 4;
/** Desde estas sílabas una palabra cuenta como «larga» en la métrica que ya mostraba la app. */
export const SILABAS_PALABRA_LARGA = 3;

const VOCALES = 'aeiouáéíóúü';
const DIPTONGOS = [
  'ai', 'au', 'ei', 'eu', 'oi', 'ou', 'ui', 'iu',
  'ia', 'ie', 'io', 'ua', 'ue', 'uo',
  'ái', 'áu', 'éi', 'éu', 'ói', 'óu',
  'iá', 'ié', 'ió', 'uá', 'ué', 'uó',
];

/**
 * Sílabas de una palabra en español: cada vocal abre una, salvo la segunda de un diptongo.
 *
 * La «u» de que, qui, gue y gui no suena y no es vocal (hallazgo 3594): «quiero», «aquí»,
 * «quien», «siguiente» o «química» sumaban una sílaba de más, y el resaltado de S0218 marcaba
 * como de 4 sílabas palabras de 3. Se retira antes de contar; la de «güe», «güi» (con diéresis)
 * sí suena y se queda.
 */
export function contarSilabas(palabra: string): number {
  const p = palabra.toLowerCase().trim().replace(/([qg])u([eiéí])/g, '$1$2');
  if (!p) return 0;
  let silabas = 0;
  let i = 0;
  while (i < p.length) {
    if (VOCALES.includes(p[i])) {
      silabas++;
      if (i + 1 < p.length && DIPTONGOS.includes(p.substring(i, i + 2))) i++;
    }
    i++;
  }
  return Math.max(silabas, 1);
}

/**
 * Escala INFLESZ (Barrio-Cantalejo y otros, An. Sist. Sanit. Navar. 2008;31(2):135-152):
 * cinco tramos sobre la puntuación Flesch-Szigriszt.
 */
export function gradoInflesz(ifsz: number): string {
  if (ifsz >= 80) return 'Muy fácil';
  if (ifsz >= 65) return 'Bastante fácil';
  if (ifsz >= 55) return 'Normal';
  if (ifsz >= 40) return 'Algo difícil';
  return 'Muy difícil';
}

/** IFSZ = 206,835 − 62,3 × (sílabas/palabras) − (palabras/frases), sin acotar. */
export function fleschSzigriszt(silabas: number, palabras: number, frases: number): number {
  if (palabras <= 0 || frases <= 0) return 0;
  return 206.835 - 62.3 * (silabas / palabras) - palabras / frases;
}

/** P = 206,84 − 60 × (sílabas/palabras) − 1,02 × (palabras/frases), sin acotar. */
export function fernandezHuerta(silabas: number, palabras: number, frases: number): number {
  if (palabras <= 0 || frases <= 0) return 0;
  return 206.84 - 60 * (silabas / palabras) - 1.02 * (palabras / frases);
}

/** Las dos escalas van de 0 a 100: fuera de ahí la cifra no se lee con ningún tramo. */
export function acotar(valor: number): number {
  return Math.max(0, Math.min(100, valor));
}

export interface FraseAnalizada {
  /** Posición en el texto original: [inicio, fin), con su puntuación final incluida. */
  inicio: number;
  fin: number;
  palabras: number;
  /** En cuántas frases de PALABRAS_TROZO palabras como mucho habría que partirla. */
  trozos: number;
  /** Puntos de Flesch-Szigriszt (acotado) que ganaría el texto entero al partirla así. */
  ganancia: number;
}

export interface PalabraMarcada {
  inicio: number;
  fin: number;
  silabas: number;
}

export interface Analisis {
  palabras: number;
  oraciones: number;
  silabas: number;
  promedioSilabasPalabra: number;
  promedioPalabrasOracion: number;
  /** Acotados a 0-100, como se muestran. */
  fleschSzigriszt: number;
  fernandezHuerta: number;
  dificultad: string;
  palabrasLargas: number;
  porcentajeLargas: number;
  /** Frases de más de PALABRAS_FRASE_LARGA palabras, de la que más gana a la que menos. */
  frasesLargas: FraseAnalizada[];
  /** Palabras de SILABAS_PALABRA_MUY_LARGA sílabas o más, en orden de aparición. */
  palabrasMuyLargas: PalabraMarcada[];
}

/**
 * Palabras como las cuenta la fórmula: lo que separan los espacios (incluye cifras), siempre que
 * lleve al menos una letra o una cifra. La raya de un inciso o de un diálogo (—), el guion suelto
 * o la viñeta de una lista no son palabras: cada uno sumaba una de 0 sílabas y subía la
 * puntuación (hallazgo 3593: «Casa perro — mesa gato — …» daba 11 palabras y «Muy fácil»).
 */
function contarPalabras(texto: string): number {
  return texto.trim().split(/\s+/).filter((p) => /[\p{L}\p{N}]/u.test(p)).length;
}

/**
 * Abreviaturas corrientes cuyo punto no cierra frase aunque detrás venga mayúscula («el Sr.
 * García», «la Dra. Pérez», «EE. UU.»). Una inicial sola («J. R. R. Tolkien») tampoco. «etc.» no
 * está: al final de una frase es lo normal.
 */
const ABREVIATURAS = new Set([
  'sr', 'sra', 'srta', 'sres', 'sras', 'dr', 'dra', 'dres', 'd', 'dña', 'ud', 'uds', 'vd', 'vds',
  'lic', 'ing', 'arq', 'prof', 'profa', 'pág', 'págs', 'núm', 'nº', 'art', 'arts', 'cap', 'fig',
  'vol', 'ee', 'uu', 'av', 'avda', 'tel', 'aprox', 'ej', 'vs', 'cf', 'pp', 'mr', 'mrs', 'st',
]);

/**
 * ¿Cierra frase el signo de la posición `i`? (hallazgo 3592). El recuento cortaba en CUALQUIER
 * punto: el de millar de «3.500» (el formato español que usa la propia app), el de una
 * abreviatura («Sr.», «EE. UU.») o el de una URL; y los puntos suspensivos tipográficos «…»
 * (U+2026, los de Word y los teclados del móvil) no cortaban, cuando «...» sí.
 *   · ! y ? cierran siempre.
 *   · . y … cierran si detrás viene el final del texto, o blancos y algo que no sea minúscula
 *     ni cifra (una minúscula sigue la misma frase: «… casa perro», «etc. y»), y nunca pegados
 *     a la palabra siguiente («3.500», «www.ejemplo.com»). El punto, además, no cierra tras una
 *     abreviatura de ABREVIATURAS ni tras una inicial sola.
 */
function cierraFrase(texto: string, i: number): boolean {
  const c = texto[i];
  if (c === '!' || c === '?') return true;
  if (c !== '.' && c !== '…') return false;
  let j = i + 1;
  while (j < texto.length && (texto[j] === '.' || texto[j] === '…')) j++;
  if (j < texto.length) {
    if (!/\s/.test(texto[j])) return /[«»"“”’')\]]/.test(texto[j]);
    while (j < texto.length && /\s/.test(texto[j])) j++;
    if (j < texto.length && /[\p{Ll}\p{N}]/u.test(texto[j])) return false;
  }
  if (c === '.' && (i === 0 || texto[i - 1] !== '.')) {
    const palabra = texto.slice(0, i).match(/[\p{L}º]+$/u)?.[0] ?? '';
    if (palabra && (palabra.length === 1 || ABREVIATURAS.has(palabra.toLowerCase()))) return false;
  }
  return true;
}

/** Frases del texto como [inicio, fin), con su puntuación de cierre incluida. */
function trocearFrases(texto: string): { inicio: number; fin: number }[] {
  const frases: { inicio: number; fin: number }[] = [];
  let desde = 0;
  const cerrar = (hasta: number) => {
    const trozo = texto.slice(desde, hasta);
    if (/[\p{L}\p{N}]/u.test(trozo)) {
      const inicio = desde + (trozo.length - trozo.trimStart().length);
      frases.push({ inicio, fin: desde + trozo.trimEnd().length });
    }
    desde = hasta;
  };
  for (let i = 0; i < texto.length; i++) {
    if (!cierraFrase(texto, i)) continue;
    // La puntuación de cierre seguida («?!», «...», «.»») pertenece a la frase
    let fin = i + 1;
    while (fin < texto.length && /[.!?…«»"“”’')\]]/.test(texto[fin])) fin++;
    cerrar(fin);
    i = fin - 1;
  }
  cerrar(texto.length);
  return frases;
}

/**
 * Analiza el texto entero. Devuelve null si no hay ni una palabra, o si no hay ni una letra:
 * con 0 sílabas la fórmula da más de 200, se acotaba a 100 y salía «Muy fácil» un texto como
 * «2024 2025 2026» que no tiene nada que leer (hallazgo 3596).
 */
export function analizarTexto(texto: string): Analisis | null {
  const palabras = contarPalabras(texto);
  if (palabras === 0 || !/\p{L}/u.test(texto)) return null;

  // Frases: lo que queda entre signos que de verdad cierran frase (cierraFrase, hallazgo 3592)
  const frases = trocearFrases(texto).map((f) => ({ ...f, palabras: contarPalabras(texto.slice(f.inicio, f.fin)) }));
  const oraciones = Math.max(frases.length, 1);

  // Palabras para las sílabas: tiradas de letras, como hacía obtenerPalabras()
  let silabas = 0;
  let palabrasLargas = 0;
  const palabrasMuyLargas: PalabraMarcada[] = [];
  for (const m of texto.matchAll(/[a-záéíóúüñ]+/gi)) {
    const s = contarSilabas(m[0]);
    silabas += s;
    if (s >= SILABAS_PALABRA_LARGA) palabrasLargas++;
    if (s >= SILABAS_PALABRA_MUY_LARGA) {
      const inicio = m.index ?? 0;
      palabrasMuyLargas.push({ inicio, fin: inicio + m[0].length, silabas: s });
    }
  }

  const ifsz = fleschSzigriszt(silabas, palabras, oraciones);
  const base = acotar(ifsz);

  const frasesLargas: FraseAnalizada[] = frases
    .filter((f) => f.palabras > PALABRAS_FRASE_LARGA)
    .map((f) => {
      const trozos = Math.ceil(f.palabras / PALABRAS_TROZO);
      const partida = acotar(fleschSzigriszt(silabas, palabras, oraciones + trozos - 1));
      return { ...f, trozos, ganancia: partida - base };
    })
    .sort((a, b) => b.ganancia - a.ganancia || a.inicio - b.inicio);

  return {
    palabras,
    oraciones,
    silabas,
    promedioSilabasPalabra: silabas / palabras,
    promedioPalabrasOracion: palabras / oraciones,
    fleschSzigriszt: base,
    fernandezHuerta: acotar(fernandezHuerta(silabas, palabras, oraciones)),
    dificultad: gradoInflesz(ifsz),
    palabrasLargas,
    porcentajeLargas: (palabrasLargas / palabras) * 100,
    frasesLargas,
    palabrasMuyLargas,
  };
}

export interface TramoMarcado {
  texto: string;
  enFraseLarga: boolean;
  palabraMuyLarga: boolean;
}

/**
 * Corta el texto en tramos para pintarlo resaltado: cada tramo sabe si cae dentro de una frase
 * larga y si es una palabra muy larga. Concatenar los tramos devuelve el texto original.
 */
export function marcarTexto(texto: string, analisis: Analisis): TramoMarcado[] {
  const cortes = new Set<number>([0, texto.length]);
  for (const f of analisis.frasesLargas) { cortes.add(f.inicio); cortes.add(f.fin); }
  for (const p of analisis.palabrasMuyLargas) { cortes.add(p.inicio); cortes.add(p.fin); }
  const orden = [...cortes].sort((a, b) => a - b);

  const tramos: TramoMarcado[] = [];
  for (let i = 0; i < orden.length - 1; i++) {
    const a = orden[i];
    const b = orden[i + 1];
    if (a === b) continue;
    const enFraseLarga = analisis.frasesLargas.some((f) => a >= f.inicio && b <= f.fin);
    const palabraMuyLarga = analisis.palabrasMuyLargas.some((p) => a >= p.inicio && b <= p.fin);
    const anterior = tramos[tramos.length - 1];
    if (anterior && anterior.enFraseLarga === enFraseLarga && anterior.palabraMuyLarga === palabraMuyLarga) {
      anterior.texto += texto.slice(a, b);
    } else {
      tramos.push({ texto: texto.slice(a, b), enFraseLarga, palabraMuyLarga });
    }
  }
  return tramos;
}
