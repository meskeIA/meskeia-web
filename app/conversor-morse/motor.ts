/**
 * Motor del Conversor de Código Morse — funciones puras, sin React ni Web Audio.
 *
 * FUENTE: Recomendación UIT-R M.1677-1 (10/2009), «International Morse code», Anexo 1:
 *   §1.1.1 letras A–Z y una sola letra acentuada, la «accented e» = ..-..
 *   §1.1.2 cifras 0–9
 *   §1.1.3 signos: . , : ? ' - / ( ) " = + × @
 *   §2     raya = 3 puntos · entre los elementos de un carácter, 1 punto · entre caracteres, 3 ·
 *          entre palabras, 7
 *   §3.3   el % se transmite como 0/0, unido a la cifra que lo precede por un guion (2 % → 2-0/0)
 *
 * Lo que la UIT NO recoge se decide aquí, y la vista lo declara al usarlo (hallazgos 1982 y 1989):
 *   - Ñ → --.-- : variante convencional en español, no UIT. Se usa porque transcribirla como N
 *     cambia palabras («año» → «ano»); el receptor que solo conozca la UIT no la entenderá.
 *   - Á Í Ó Ú Ü → la vocal sin tilde: la UIT no tiene código para ellas y las variantes que
 *     circulan (Á .--.-, Ó ---., Ü ..--) vienen de otros idiomas; la costumbre telegráfica en
 *     español es transmitir sin tilde. La É sí tiene código UIT (..-..) y se usa.
 *   - ! & ; _ $ → extensiones habituales de radioaficionado, fuera de la UIT: se codifican y se avisa.
 *   - ¿ ¡ # y el resto → sin código: se omiten y se avisa de cuáles.
 */

/** Unidades de la temporización UIT (§2), en «puntos». */
export const UNIDADES = {
  punto: 1,
  raya: 3,
  entreElementos: 1,
  entreLetras: 3,
  entrePalabras: 7,
} as const;

/** Código Morse de la Recomendación UIT-R M.1677-1 (§1.1.1-1.1.3). */
export const MORSE_UIT: Readonly<Record<string, string>> = {
  A: '.-', B: '-...', C: '-.-.', D: '-..', E: '.', F: '..-.', G: '--.', H: '....', I: '..',
  J: '.---', K: '-.-', L: '.-..', M: '--', N: '-.', O: '---', P: '.--.', Q: '--.-', R: '.-.',
  S: '...', T: '-', U: '..-', V: '...-', W: '.--', X: '-..-', Y: '-.--', Z: '--..',
  'É': '..-..',
  '0': '-----', '1': '.----', '2': '..---', '3': '...--', '4': '....-',
  '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.',
  '.': '.-.-.-', ',': '--..--', ':': '---...', '?': '..--..', "'": '.----.', '-': '-....-',
  '/': '-..-.', '(': '-.--.', ')': '-.--.-', '"': '.-..-.', '=': '-...-', '+': '.-.-.',
  '@': '.--.-.',
};

/** Extensiones fuera de la UIT, de uso habitual en radioafición y en español. */
export const MORSE_EXTENSIONES: Readonly<Record<string, string>> = {
  'Ñ': '--.--',
  '!': '-.-.--', '&': '.-...', ';': '-.-.-.', '_': '..--.-', '$': '...-..-',
};

/** Caracteres que se transcriben a otro antes de codificar (y por qué: ver cabecera). */
const TRANSCRIPCION: Readonly<Record<string, string>> = {
  'Á': 'A', 'À': 'A', 'Í': 'I', 'Ì': 'I', 'Ó': 'O', 'Ò': 'O', 'Ú': 'U', 'Ù': 'U', 'Ü': 'U',
  'È': 'É',
  '×': 'X', // §1.1.3: el signo de multiplicar es la X
  '’': "'", '‘': "'", '“': '"', '”': '"', '«': '"', '»': '"',
};

const CODIGO_A_CARACTER: Readonly<Record<string, string>> = Object.fromEntries(
  Object.entries({ ...MORSE_UIT, ...MORSE_EXTENSIONES }).map(([c, m]) => [m, c]),
);

export interface ResultadoCodificacion {
  /** Palabras → letras → código de cada letra (solo «.» y «-»). */
  palabras: string[][];
  /** Texto de salida: letras separadas por un espacio y palabras por « / ». */
  morse: string;
  /** Caracteres que no tienen código y se han omitido (sin repetir, en orden de aparición). */
  omitidos: string[];
  /** Extensiones no UIT usadas (Ñ, !, &…). */
  extensiones: string[];
  /** Vocales con tilde transcritas sin ella. */
  transcritos: string[];
  /** true si el texto llevaba % (se transmite 0/0, §3.3). */
  porcentaje: boolean;
}

const anadirUnico = (lista: string[], c: string): void => {
  if (!lista.includes(c)) lista.push(c);
};

/**
 * Texto → Morse. Cualquier blanco (espacios, tabuladores, saltos de línea) separa palabras.
 *
 * Casos a mano:
 *   «SOS»        → «... --- ...»
 *   «Hola mundo» → «.... --- .-.. .- / -- ..- -. -.. ---»
 *   «CAFÉ»       → «-.-. .- ..-. ..-..»            (É UIT)
 *   «50%»        → «..... ----- -....- ----- -..-. -----»   (5 0 - 0 / 0, §3.3)
 *   «¿AÑO #1?»   → «.- --.-- --- / .---- ..--..», omitidos ¿ y #, extensión Ñ
 */
export function textoAMorse(texto: string): ResultadoCodificacion {
  const omitidos: string[] = [];
  const extensiones: string[] = [];
  const transcritos: string[] = [];
  let porcentaje = false;
  const palabras: string[][] = [];

  for (const palabra of texto.toUpperCase().split(/\s+/)) {
    if (!palabra) continue;
    const letras: string[] = [];
    const caracteres = Array.from(palabra);
    caracteres.forEach((original, i) => {
      if (original === '%' || original === '‰') {
        porcentaje = true;
        // §3.3: unido a la cifra anterior por un guion; «0/0» (o «0/00» para el tanto por mil).
        if (i > 0 && /[0-9]/.test(caracteres[i - 1])) letras.push(MORSE_UIT['-']);
        letras.push(MORSE_UIT['0'], MORSE_UIT['/'], MORSE_UIT['0']);
        if (original === '‰') letras.push(MORSE_UIT['0']);
        return;
      }
      let c = original;
      if (TRANSCRIPCION[c]) {
        if (/[ÁÀÍÌÓÒÚÙÜ]/.test(c)) anadirUnico(transcritos, c);
        c = TRANSCRIPCION[c];
      }
      const uit = MORSE_UIT[c];
      if (uit) {
        letras.push(uit);
        return;
      }
      const ext = MORSE_EXTENSIONES[c];
      if (ext) {
        letras.push(ext);
        anadirUnico(extensiones, c);
        return;
      }
      anadirUnico(omitidos, original);
    });
    if (letras.length) palabras.push(letras);
  }

  return {
    palabras,
    morse: palabras.map((p) => p.join(' ')).join(' / '),
    omitidos,
    extensiones,
    transcritos,
    porcentaje,
  };
}

export interface ResultadoDecodificacion {
  /** Palabras → letras → código de cada letra tal como se leyó (solo «.» y «-»). */
  palabras: string[][];
  /** Texto: los códigos que no existen se muestran como «�». */
  texto: string;
  /** Códigos formados por puntos y rayas que no corresponden a ningún carácter. */
  desconocidos: string[];
  /** Fragmentos con otros signos (ni punto ni raya): no se pueden leer ni reproducir. */
  invalidos: string[];
}

/** Marca de un código que no existe en el texto descodificado. */
export const MARCA_DESCONOCIDO = '�';

/**
 * Morse → texto. Separadores de palabra: « / », «|», un salto de línea o DOS o más espacios
 * seguidos (otra convención habitual). Se aceptan también «·», «•» y «∙» como punto, y «—», «–»,
 * «−» y «_» como raya, que es como aparece el Morse copiado de muchas páginas.
 *
 * Casos a mano:
 *   «... --- ...»             → «SOS»
 *   «... --- ...   ... --- ...» → «SOS SOS» (tres espacios = palabra nueva)
 *   «... ...... ...»          → «S�S», desconocidos ["......"]
 *   «..-..»                   → «É»
 */
export function morseATexto(morse: string): ResultadoDecodificacion {
  const normalizado = morse
    .replace(/[·•∙]/g, '.')
    .replace(/[—–−_]/g, '-');
  const desconocidos: string[] = [];
  const invalidos: string[] = [];
  const palabras: string[][] = [];
  const textoPalabras: string[] = [];

  for (const trozo of normalizado.trim().split(/\s*[/|]\s*|\s*\n\s*|\s{2,}/)) {
    if (!trozo) continue;
    const letras: string[] = [];
    let texto = '';
    for (const codigo of trozo.split(' ')) {
      if (!codigo) continue;
      if (!/^[.-]+$/.test(codigo)) {
        anadirUnico(invalidos, codigo);
        texto += MARCA_DESCONOCIDO;
        continue;
      }
      letras.push(codigo);
      const c = CODIGO_A_CARACTER[codigo];
      if (c) {
        texto += c;
      } else {
        anadirUnico(desconocidos, codigo);
        texto += MARCA_DESCONOCIDO;
      }
    }
    if (letras.length) palabras.push(letras);
    if (texto) textoPalabras.push(texto);
  }

  return { palabras, texto: textoPalabras.join(' '), desconocidos, invalidos };
}

export interface Tono {
  /** Inicio, en unidades desde el comienzo del mensaje. */
  inicio: number;
  /** Duración: 1 (punto) o 3 (raya). */
  duracion: number;
}

export interface PlanSonoro {
  tonos: Tono[];
  /** Fin del último tono, en unidades (no incluye el hueco de palabra final). */
  total: number;
}

/**
 * Temporización UIT (§2) de un mensaje ya codificado: cada hueco se cuenta UNA vez. El hueco de
 * letra (3) y el de palabra (7) SUSTITUYEN al de elemento (1), no se suman a él (hallazgo 1980:
 * sumándolos salían 4 y 14 unidades).
 *
 * Casos a mano (unidad = 1 punto):
 *   «SOS E» = [[..., ---, ...], [.]] → tonos
 *     S: 0-1, 2-3, 4-5 · (3) · O: 8-11, 12-15, 16-19 · (3) · S: 22-23, 24-25, 26-27 · (7) · E: 34-35
 *     total 35.
 *   «PARIS» = .--. .- .-. .. ... → 43 unidades; con el hueco de palabra que la sigue, 50: es la
 *     palabra de referencia de las «palabras por minuto».
 */
export function planificarTonos(palabras: string[][]): PlanSonoro {
  const tonos: Tono[] = [];
  let t = 0;
  let hayAnterior = false;
  palabras.forEach((letras, p) => {
    letras.forEach((codigo, l) => {
      Array.from(codigo).forEach((elemento, e) => {
        if (elemento !== '.' && elemento !== '-') return;
        if (hayAnterior) {
          if (e > 0) t += UNIDADES.entreElementos;
          else if (l > 0) t += UNIDADES.entreLetras;
          else if (p > 0) t += UNIDADES.entrePalabras;
        }
        const duracion = elemento === '.' ? UNIDADES.punto : UNIDADES.raya;
        tonos.push({ inicio: t, duracion });
        t += duracion;
        hayAnterior = true;
      });
    });
  });
  return { tonos, total: t };
}

/**
 * Duración de una unidad (un punto) en segundos para una velocidad en palabras por minuto, con
 * la palabra de referencia PARIS = 50 unidades. Caso a mano: 12 PPM → 60 / 600 = 0,1 s.
 */
export const segundosPorUnidad = (ppm: number): number => 60 / (50 * ppm);
