/**
 * Silabeo y escansión métrica en español
 *
 * Extraído del componente para poder verificarlo con poemas reales y para que
 * el motor de rima (`rima.ts`) trabaje sobre datos ya escandidos.
 */

export type Acentuacion = 'aguda' | 'llana' | 'esdrujula';

export interface Sinalefa {
  /** Índice de la palabra que abre la fusión (se une con la siguiente) */
  indice: number;
  /** Texto de la fusión, p. ej. «o_e» */
  texto: string;
  /** Hay un signo de puntuación entre ambas palabras: podría deshacerse (dialefa) */
  conPausa: boolean;
}

export interface AnalisisVerso {
  texto: string;
  palabras: { palabra: string; silabas: string[] }[];
  silabasFoneticas: number;
  sinalefas: Sinalefa[];
  acentuacion: Acentuacion;
  ajuste: number;
  silabasMetricas: number;
  nombre: string;
  arte: 'menor' | 'mayor';
}

// ─── Silabeo ─────────────────────────────────────────────────────────────────

export const separarSilabas = (palabra: string): string[] => {
  const vocales = 'aeiouáéíóúü';
  const vocalesFuertes = 'aeoáéó';
  const vocalesDebiles = 'iuíúü';
  const consonantes = 'bcdfghjklmnñpqrstvwxyz';

  palabra = palabra.toLowerCase().trim();
  if (!palabra) return [];

  const silabas: string[] = [];
  let silabaActual = '';

  const esVocal = (c: string) => vocales.includes(c);
  const esConsonante = (c: string) => consonantes.includes(c);
  const esVocalFuerte = (c: string) => vocalesFuertes.includes(c);
  const esVocalDebil = (c: string) => vocalesDebiles.includes(c);

  // Grupos consonánticos inseparables
  const gruposInseparables = ['bl', 'br', 'cl', 'cr', 'dr', 'fl', 'fr', 'gl', 'gr', 'pl', 'pr', 'tr', 'ch', 'll', 'rr'];

  for (let i = 0; i < palabra.length; i++) {
    const char = palabra[i];
    const siguiente = palabra[i + 1] || '';
    const siguiente2 = palabra[i + 2] || '';

    silabaActual += char;

    // Si es vocal, verificamos si debemos cortar
    if (esVocal(char)) {
      // Si la siguiente es consonante
      if (esConsonante(siguiente)) {
        // Ver si hay grupo consonántico
        const grupo = siguiente + siguiente2;
        const esGrupoInseparable = gruposInseparables.includes(grupo.toLowerCase());

        // Si hay dos consonantes seguidas
        if (esConsonante(siguiente2)) {
          if (esGrupoInseparable) {
            // El grupo va con la siguiente sílaba
            silabas.push(silabaActual);
            silabaActual = '';
          } else {
            // Primera consonante va con esta sílaba, segunda con la siguiente
            silabaActual += siguiente;
            silabas.push(silabaActual);
            silabaActual = '';
            i++; // Saltamos la consonante que ya añadimos
          }
        } else if (esVocal(siguiente2) || !siguiente2) {
          // Consonante simple entre vocales: va con la siguiente
          silabas.push(silabaActual);
          silabaActual = '';
        }
      }
      // Si la siguiente es vocal
      else if (esVocal(siguiente)) {
        // Verificar diptongos e hiatos
        const esDiptongo =
          (esVocalDebil(char) && esVocalFuerte(siguiente)) ||
          (esVocalFuerte(char) && esVocalDebil(siguiente)) ||
          (esVocalDebil(char) && esVocalDebil(siguiente));

        // Las vocales acentuadas en débiles rompen el diptongo (hiato)
        const tieneAcentoDebil = 'íú'.includes(char) || 'íú'.includes(siguiente);

        if (!esDiptongo || tieneAcentoDebil) {
          // Hiato: cortar aquí
          silabas.push(silabaActual);
          silabaActual = '';
        }
        // Si es diptongo, continúan juntas
      }
    }
  }

  // Añadir última sílaba si queda algo
  if (silabaActual) {
    silabas.push(silabaActual);
  }

  return silabas;
};

export const contarSilabasTexto = (
  texto: string
): { palabra: string; silabas: string[]; total: number }[] => {
  // Extraer solo palabras (ignorar números y símbolos)
  const palabras = texto.match(/[a-záéíóúüñ]+/gi) || [];

  return palabras.map((palabra) => {
    const silabas = separarSilabas(palabra);
    return { palabra, silabas, total: silabas.length };
  });
};

// ─── Escansión ───────────────────────────────────────────────────────────────

const VOCALES_METRICA = 'aeiouáéíóúü';
const esVocalMetrica = (c: string): boolean => VOCALES_METRICA.includes(c.toLowerCase());

/**
 * ¿La palabra termina en sonido vocálico?
 * La «y» final suena /i/ («hoy», «rey»), así que también permite sinalefa.
 */
const terminaEnVocal = (palabra: string): boolean => {
  const p = palabra.toLowerCase();
  if (!p) return false;
  const ultima = p[p.length - 1];
  return esVocalMetrica(ultima) || ultima === 'y';
};

/**
 * ¿La palabra empieza por sonido vocálico?
 * La «h» es muda («la hoja» → sinalefa), salvo cuando encabeza los diptongos
 * «hue-», «hui-», «hie-», que se pronuncian con sonido consonántico (/gwe/, /ye/)
 * y bloquean la fusión: «la huella» NO hace sinalefa.
 */
const empiezaPorVocal = (palabra: string): boolean => {
  const p = palabra.toLowerCase();
  if (!p) return false;
  if (esVocalMetrica(p[0])) return true;
  // «y» conjunción: funciona como vocal
  if (p === 'y') return true;
  if (p[0] === 'h') {
    if (p.startsWith('hue') || p.startsWith('hui') || p.startsWith('hie')) return false;
    return p.length > 1 && esVocalMetrica(p[1]);
  }
  return false;
};

/**
 * Clasifica la acentuación de la última palabra del verso, que determina
 * el ajuste métrico final (aguda +1 · llana ±0 · esdrújula −1).
 */
export const acentuacionDe = (palabra: string, silabas: string[]): Acentuacion => {
  const p = palabra.toLowerCase();
  // Los monosílabos se computan como agudos
  if (silabas.length <= 1) return 'aguda';

  // Si lleva tilde, la tilde manda: buscamos en qué sílaba cae
  const indiceTilde = silabas.findIndex((s) => /[áéíóú]/.test(s));
  if (indiceTilde !== -1) {
    const desdeElFinal = silabas.length - 1 - indiceTilde;
    if (desdeElFinal === 0) return 'aguda';
    if (desdeElFinal === 1) return 'llana';
    return 'esdrujula';
  }

  // Sin tilde: termina en vocal, «n» o «s» → llana; en cualquier otra letra → aguda
  const ultima = p[p.length - 1];
  if (esVocalMetrica(ultima) || ultima === 'n' || ultima === 's') return 'llana';
  return 'aguda';
};

const NOMBRES_VERSO: Record<number, string> = {
  2: 'bisílabo',
  3: 'trisílabo',
  4: 'tetrasílabo',
  5: 'pentasílabo',
  6: 'hexasílabo',
  7: 'heptasílabo',
  8: 'octosílabo',
  9: 'eneasílabo',
  10: 'decasílabo',
  11: 'endecasílabo',
  12: 'dodecasílabo',
  13: 'tridecasílabo',
  14: 'alejandrino',
  15: 'pentadecasílabo',
  16: 'hexadecasílabo',
  17: 'heptadecasílabo',
  18: 'octodecasílabo',
  19: 'eneadecasílabo',
  20: 'veinte sílabas',
};

export const nombreDelVerso = (silabas: number): string =>
  NOMBRES_VERSO[silabas] || `${silabas} sílabas`;

/**
 * Escansión de un verso: sílabas fonéticas − sinalefas + ajuste por acento final.
 * Devuelve null si la línea no contiene palabras.
 */
export const analizarVerso = (linea: string): AnalisisVerso | null => {
  const encontradas = Array.from(linea.matchAll(/[a-záéíóúüñ]+/gi)).map((m) => ({
    palabra: m[0],
    inicio: m.index,
    fin: m.index + m[0].length,
  }));
  if (encontradas.length === 0) return null;

  const palabras = encontradas.map((e) => ({ palabra: e.palabra, silabas: separarSilabas(e.palabra) }));
  const silabasFoneticas = palabras.reduce((acc, p) => acc + p.silabas.length, 0);

  // Sinalefas: vocal final de una palabra + vocal inicial de la siguiente.
  // No se encadenan: si una palabra ya se ha fundido con la anterior, no vuelve a
  // fundirse con la siguiente. La sinalefa triple existe pero es excepcional, y la
  // escansión tradicional no la aplica — «de rosa y azucena» es endecasílabo (una
  // sola fusión), no decasílabo (dos).
  const sinalefas: Sinalefa[] = [];
  for (let i = 0; i < encontradas.length - 1; i++) {
    const actual = encontradas[i];
    const siguiente = encontradas[i + 1];
    if (terminaEnVocal(actual.palabra) && empiezaPorVocal(siguiente.palabra)) {
      const entreMedias = linea.slice(actual.fin, siguiente.inicio);
      sinalefas.push({
        indice: i,
        texto: `${actual.palabra.slice(-1)}_${siguiente.palabra[0]}`,
        conPausa: /[,;:.…!?—)]/.test(entreMedias),
      });
      i++; // la palabra fundida no encadena con la siguiente
    }
  }

  const ultima = palabras[palabras.length - 1];
  const acentuacion = acentuacionDe(ultima.palabra, ultima.silabas);
  const ajuste = acentuacion === 'aguda' ? 1 : acentuacion === 'esdrujula' ? -1 : 0;

  const silabasMetricas = Math.max(0, silabasFoneticas - sinalefas.length + ajuste);

  return {
    texto: linea.trim(),
    palabras,
    silabasFoneticas,
    sinalefas,
    acentuacion,
    ajuste,
    silabasMetricas,
    nombre: nombreDelVerso(silabasMetricas),
    arte: silabasMetricas >= 9 ? 'mayor' : 'menor',
  };
};

/** Analiza cada línea no vacía del texto como un verso independiente */
export const analizarVersos = (texto: string): AnalisisVerso[] =>
  texto
    .split('\n')
    .map((linea) => analizarVerso(linea))
    .filter((v): v is AnalisisVerso => v !== null);

/**
 * Igual que `analizarVersos`, pero conservando dónde estaban las líneas en
 * blanco: cada grupo es una estrofa, y sin esa información no se puede
 * distinguir un soneto (4-4-3-3) de catorce versos seguidos.
 */
export const analizarPoema = (
  texto: string
): { versos: AnalisisVerso[]; bloques: number[][] } => {
  const versos: AnalisisVerso[] = [];
  const bloques: number[][] = [];
  let actual: number[] = [];

  for (const linea of texto.split('\n')) {
    const verso = analizarVerso(linea);
    if (verso === null) {
      if (actual.length) {
        bloques.push(actual);
        actual = [];
      }
      continue;
    }
    versos.push(verso);
    actual.push(versos.length - 1);
  }
  if (actual.length) bloques.push(actual);

  return { versos, bloques };
};
