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

// El silabeador vive en su propio módulo, con tests unitarios que resuelven a mano cada regla
// (tests/silabeo.spec.ts). Se sacó de aquí el 24/08/2026 al reescribirlo: cuatro de los ocho
// hallazgos del Inspector eran suyos, y el build no puede ver una regla ortográfica mal.
import { separarSilabas, encuentrosVocalicos } from './silabeo';
export { separarSilabas, encuentrosVocalicos };
export type { EncuentrosVocalicos } from './silabeo';

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
 * «hue-», «hui-», «hie-», «huy-», que se pronuncian con sonido consonántico
 * ([w], [j]) y bloquean la fusión: «la huella» NO hace sinalefa.
 *
 * «huy-» se añadió el 24/08/2026 (hallazgo 258): es el mismo sonido de «hui-» y faltaba,
 * así que «huye», «huyó», «huyen», «huyeron» y «huyendo» fusionaban lo que no se fusiona.
 * Se veía en el segundo verso de la Lira que la propia app trae como ejemplo, «la del que
 * huye del mundanal ruido», que salía decasílabo dentro de una estrofa que exige 11B.
 */
const INICIOS_H_CONSONANTICA = ['hue', 'hui', 'hie', 'huy'];

const empiezaPorVocal = (palabra: string): boolean => {
  const p = palabra.toLowerCase();
  if (!p) return false;
  if (esVocalMetrica(p[0])) return true;
  // «y» conjunción: funciona como vocal («rosa y» sí funde)
  if (p === 'y') return true;
  if (p[0] === 'h') {
    if (INICIOS_H_CONSONANTICA.some((ini) => p.startsWith(ini))) return false;
    return p.length > 1 && esVocalMetrica(p[1]);
  }
  return false;
};

/**
 * La conjunción «y» funde por UN lado, nunca por los dos.
 *
 * Es una semivocal [i̯]: puede cerrar diptongo con la vocal anterior («rosa y» → [saj]) o
 * abrirlo como semiconsonante [j] ante la siguiente («y escriba» → [jes-kri-ba]), pero no
 * ambas cosas a la vez. Entre dos vocales, a-i-a no da una sílaba sino dos: «de rosa y
 * azucena» se lee [de-ro-sa-ja-θu-θe-na] y ahorra UNA sílaba, no dos — por eso el soneto
 * XXIII de Garcilaso, que la propia app propone como banco de pruebas, es endecasílabo.
 *
 * Los dos versos de Quevedo y del romance que lo fijan, con la cuenta hecha a mano:
 *   «érase una nariz sayón y escriba» → 13 fonéticas, funde se_u y y_e (la «y» no tiene
 *      vocal a la izquierda, «sayón» acaba en n) = 11 · endecasílabo
 *   «y están los campos en flor»      → 8 fonéticas, funde y_e (la «y» abre el verso) y la
 *      aguda suma 1 = 8 · octosílabo
 * Frente a «En tanto que de rosa y azucena» → 12 fonéticas, funde sa_y y AHÍ SE PARA = 11.
 *
 * No afecta a la «y» final de «hoy», «rey» o «muy», que es semivocal plena y funde como
 * cualquier vocal («hoy es lunes»).
 */
const esConjuncionY = (palabra: string): boolean => palabra.toLowerCase() === 'y';

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

  /**
   * Sinalefas: vocal final de una palabra + vocal inicial de la siguiente.
   *
   * Cada contacto entre vocales de palabras contiguas ahorra UNA sílaba, y se cuentan
   * todos. Un grupo de N vocales en contacto tiene N−1 contactos y se pronuncia en una
   * sola sílaba, o sea que ahorra N−1: la cuenta sale sola sin tratar aparte la sinalefa
   * triple.
   *
   * ── Por qué se cuentan todos (24/08/2026, hallazgos 257 y 260) ──────────────────
   * Antes había un `i++` que saltaba la palabra siguiente ENTERA para no encadenar, y eso
   * perdía dos cosas distintas:
   *   · la sinalefa triple, que sí existe (Quilis, Métrica española): «Érase un hombre a
   *     una nariz pegado» tiene tres contactos (se_un, bre_a, a_u) y es endecasílabo;
   *     con el salto salían 12 y la app rotulaba dodecasílabo el primer verso del soneto
   *     que ella misma ofrece como ejemplo, dentro de una ficha que dice «catorce
   *     endecasílabos».
   *   · dos sinalefas INDEPENDIENTES separadas por una palabra bisílaba, donde las vocales
   *     ni siquiera son la misma: «érase una alquitara» funde se_u por un lado y na_al por
   *     otro, y la segunda se perdía.
   * Lo que sostenía el «de rosa y azucena» del comentario anterior no era el salto general,
   * sino que la conjunción «y» no funde dos veces (ver `esConjuncionY`): esa es la única
   * palabra que sigue sin encadenar, y por una razón fonética, no por regla de conteo.
   */
  const sinalefas: Sinalefa[] = [];
  let veniaFundida: boolean = false; // ¿la palabra i se fundió ya con la i−1?
  for (let i = 0; i < encontradas.length - 1; i++) {
    const actual = encontradas[i];
    const siguiente = encontradas[i + 1];
    const funde: boolean =
      !(esConjuncionY(actual.palabra) && veniaFundida) &&
      terminaEnVocal(actual.palabra) &&
      empiezaPorVocal(siguiente.palabra);
    if (funde) {
      const entreMedias = linea.slice(actual.fin, siguiente.inicio);
      sinalefas.push({
        indice: i,
        texto: `${actual.palabra.slice(-1)}_${siguiente.palabra[0]}`,
        conPausa: /[,;:.…!?—)]/.test(entreMedias),
      });
    }
    veniaFundida = funde;
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
