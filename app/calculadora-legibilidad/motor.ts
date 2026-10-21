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

/** Sílabas de una palabra en español: cada vocal abre una, salvo la segunda de un diptongo. */
export function contarSilabas(palabra: string): number {
  const p = palabra.toLowerCase().trim();
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

/** Palabras como las cuenta la fórmula: lo que separan los espacios (incluye cifras). */
function contarPalabras(texto: string): number {
  return texto.trim().split(/\s+/).filter((p) => p.length > 0).length;
}

/** Analiza el texto entero. Devuelve null si no hay ni una palabra. */
export function analizarTexto(texto: string): Analisis | null {
  const palabras = contarPalabras(texto);
  if (palabras === 0) return null;

  // Frases: lo que queda entre signos de cierre (. ! ?), igual que el recuento de siempre
  const frases: { inicio: number; fin: number; palabras: number }[] = [];
  for (const m of texto.matchAll(/[^.!?]+/g)) {
    const trozo = m[0];
    if (trozo.trim().length === 0) continue;
    const inicio = (m.index ?? 0) + (trozo.length - trozo.trimStart().length);
    let fin = (m.index ?? 0) + trozo.trimEnd().length;
    // La puntuación de cierre pertenece a la frase (solo si va pegada al final)
    if (fin === (m.index ?? 0) + trozo.length) {
      while (fin < texto.length && /[.!?]/.test(texto[fin])) fin++;
    }
    frases.push({ inicio, fin, palabras: contarPalabras(trozo) });
  }
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
