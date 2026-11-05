/**
 * Motor del buscador de emojis por intención (app/buscador-emojis).
 *
 * El usuario escribe lo que quiere DECIR («me alegro», «lo siento», «ánimo») y el motor devuelve
 * las intenciones del diccionario que mejor encajan. Es lo que no hacen el panel de Windows
 * (Win + .), piliapp ni emojiterra, que solo buscan por el nombre oficial del emoji: comprobado el
 * 05/11/2026, «me alegro» y «lo siento» no devuelven nada en ninguno de los tres.
 *
 * Sin React ni dependencias: recibe el diccionario como parámetro, así se prueba con casos
 * pequeños resueltos a mano (tests/buscador-emojis-motor.spec.ts, dentro de test:calc).
 *
 * Cómo puntúa:
 *  1. Normaliza: minúsculas, sin tildes ni signos, y las letras repetidas tres o más veces se
 *     quedan en una («graciaaas» → «gracias», «holaaa» → «hola»).
 *  2. Cada palabra se reduce a su raíz: las de 5 letras o más, a sus 5 primeras («alegro»,
 *     «alegría» y «alegre» comparten «alegr»); las cortas se comparan enteras («no», «vale»).
 *  3. Cada palabra de la consulta pesa por su rareza en el diccionario (log N/df): «estoy» sale en
 *     muchas intenciones y casi no discrimina; «pésame» sale en una y decide.
 *  4. Cobertura = peso de las palabras encontradas / peso de las palabras CONOCIDAS de la
 *     consulta. Las que el diccionario no conoce no cuentan: «me alegro muchísimo» encuentra «me
 *     alegro» aunque «muchísimo» no esté en ninguna frase.
 *  5. Bonificación por frase: coincidencia exacta con una frase (+3), la consulta entera dentro de
 *     una frase (+2) o una frase de 2+ palabras entera dentro de la consulta (+1).
 *  6. La última palabra, si la consulta no acaba en espacio, cuenta como prefijo mientras se
 *     escribe («agrad» ya encuentra «agradecer»).
 */

/** Un emoji (o una combinación corta, como 👉👈) con su nota de uso. */
export type EmojiConNota = readonly [emoji: string, nota: string];

export interface Intencion {
  id: string;
  grupo: string;
  titulo: string;
  /** Frases y sinónimos con los que alguien lo escribiría, incluidas variantes regionales. */
  frases: readonly string[];
  /** Emojis recomendados, de 3 a 6. */
  emojis: readonly EmojiConNota[];
  /** Emojis que parecen servir y pueden leerse al revés en ESTE contexto. */
  cuidado: readonly EmojiConNota[];
}

export interface AvisoEmoji {
  emoji: string;
  nombre: string;
  /** Las lecturas que tiene, escritas en neutro («hay quien lo lee como…»). */
  lecturas: string;
}

export interface ResultadoBusqueda {
  intencion: Intencion;
  puntuacion: number;
}

export interface IndiceIntenciones {
  entradas: readonly EntradaIndice[];
  /** Raíz → número de intenciones que la contienen. */
  df: ReadonlyMap<string, number>;
  /** Todas las raíces del diccionario, para el prefijo de la última palabra. */
  raices: readonly string[];
}

interface EntradaIndice {
  intencion: Intencion;
  frases: readonly string[];
  raices: ReadonlySet<string>;
}

/** Palabras que no distinguen una intención de otra. «no» y «sí» NO están: son intenciones. */
const VACIAS = new Set([
  'a', 'al', 'el', 'la', 'los', 'las', 'lo', 'le', 'les', 'un', 'una', 'unos', 'unas',
  'de', 'del', 'en', 'y', 'e', 'o', 'u', 'que', 'por', 'para', 'con', 'me', 'te', 'se', 'nos',
  'os', 'mi', 'mis', 'tu', 'tus', 'su', 'sus', 'es', 'muy', 'ya', 'pero', 'como', 'esto', 'eso',
]);

/** Minúsculas, sin tildes ni signos, letras triplicadas reducidas y espacios simples. */
export function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/([a-z])\1{2,}/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Raíz de comparación: 5 primeras letras, o la palabra entera si es más corta. */
export function raiz(palabra: string): string {
  return palabra.length >= 5 ? palabra.slice(0, 5) : palabra;
}

function palabrasSignificativas(textoNormalizado: string): string[] {
  const todas = textoNormalizado.split(' ').filter(Boolean);
  const utiles = todas.filter((p) => !VACIAS.has(p));
  // «me lo» o «que» a secas: si todo son palabras vacías, se usan tal cual.
  return utiles.length > 0 ? utiles : todas;
}

export function indexar(intenciones: readonly Intencion[]): IndiceIntenciones {
  const df = new Map<string, number>();
  const entradas: EntradaIndice[] = intenciones.map((intencion) => {
    const frases = [...intencion.frases, intencion.titulo].map(normalizar).filter(Boolean);
    const raices = new Set<string>();
    for (const frase of frases) {
      for (const p of palabrasSignificativas(frase)) raices.add(raiz(p));
    }
    for (const r of raices) df.set(r, (df.get(r) ?? 0) + 1);
    return { intencion, frases, raices };
  });
  return { entradas, df, raices: [...df.keys()] };
}

function contienePalabras(texto: string, fragmento: string): boolean {
  return ` ${texto} `.includes(` ${fragmento} `);
}

/**
 * Intenciones que encajan con lo que el usuario quiere decir, de mejor a peor.
 * Devuelve [] si la consulta está vacía o ninguna palabra conocida aparece.
 */
export function buscarIntenciones(
  consulta: string,
  indice: IndiceIntenciones,
  max = 8,
): ResultadoBusqueda[] {
  const q = normalizar(consulta);
  if (!q) return [];
  const palabras = palabrasSignificativas(q);
  const escribiendo = !/\s$/.test(consulta);
  const n = indice.entradas.length;

  // Cada palabra de la consulta: con qué raíces casa y cuánto pesa.
  const terminos = palabras
    .map((p, i) => {
      const r = raiz(p);
      const esUltima = i === palabras.length - 1;
      const casaCon = new Set<string>();
      if (indice.df.has(r)) casaCon.add(r);
      if (esUltima && escribiendo && p.length >= 3 && p.length < 5) {
        for (const otra of indice.raices) if (otra.startsWith(p)) casaCon.add(otra);
      }
      // df del término = intenciones que tienen alguna de sus raíces
      let df = 0;
      for (const e of indice.entradas) {
        for (const c of casaCon) {
          if (e.raices.has(c)) {
            df += 1;
            break;
          }
        }
      }
      return { casaCon, peso: df > 0 ? Math.log(n / df) + 1 : 0 };
    })
    .filter((t) => t.peso > 0);

  if (terminos.length === 0) return [];
  // «que» o «me» sueltos están dentro de cientos de frases: solo bonifica una consulta con algo
  // más que palabras vacías.
  const consultaConContenido = q.split(' ').some((p) => !VACIAS.has(p));
  const pesoTotal = terminos.reduce((s, t) => s + t.peso, 0);

  const resultados: (ResultadoBusqueda & { orden: number })[] = [];
  indice.entradas.forEach((e, orden) => {
    let pesoEncontrado = 0;
    for (const t of terminos) {
      for (const c of t.casaCon) {
        if (e.raices.has(c)) {
          pesoEncontrado += t.peso;
          break;
        }
      }
    }
    const cobertura = pesoEncontrado / pesoTotal;

    let bonus = 0;
    for (const f of e.frases) {
      if (f === q) bonus = Math.max(bonus, 3);
      else if (consultaConContenido && contienePalabras(f, q)) bonus = Math.max(bonus, 2);
      else if (f.includes(' ') && contienePalabras(q, f)) bonus = Math.max(bonus, 1);
    }

    if (cobertura >= 0.5 || bonus > 0) {
      resultados.push({ intencion: e.intencion, puntuacion: cobertura + bonus, orden });
    }
  });

  return resultados
    .sort((a, b) => b.puntuacion - a.puntuacion || a.orden - b.orden)
    .slice(0, max)
    .map(({ intencion, puntuacion }) => ({ intencion, puntuacion }));
}

/** Clave de comparación de un emoji: sin el selector de variación U+FE0F (❤️ = ❤). */
export function claveEmoji(emoji: string): string {
  return emoji.replace(/️/g, '');
}

const PICTOGRAMA = /\p{Extended_Pictographic}|\p{Regional_Indicator}/u;

/** Los emojis que contiene un texto, como grafemas completos (👍🏽 y 👨‍👩‍👧 cuentan como uno). */
export function extraerEmojis(texto: string): string[] {
  const trozos =
    typeof Intl !== 'undefined' && 'Segmenter' in Intl
      ? Array.from(new Intl.Segmenter('es', { granularity: 'grapheme' }).segment(texto), (s) => s.segment)
      : Array.from(texto);
  return trozos.filter((t) => PICTOGRAMA.test(t));
}

/** Qué dice el diccionario de un emoji pegado: dónde se recomienda y dónde se desaconseja. */
export function buscarPorEmoji(
  emoji: string,
  intenciones: readonly Intencion[],
  avisos: readonly AvisoEmoji[],
): { aviso: AvisoEmoji | null; recomendado: Intencion[]; desaconsejado: Intencion[] } {
  const clave = claveEmoji(emoji);
  const tiene = (lista: readonly EmojiConNota[]) => lista.some(([e]) => claveEmoji(e) === clave);
  return {
    aviso: avisos.find((a) => claveEmoji(a.emoji) === clave) ?? null,
    recomendado: intenciones.filter((i) => tiene(i.emojis)),
    desaconsejado: intenciones.filter((i) => tiene(i.cuidado)),
  };
}
