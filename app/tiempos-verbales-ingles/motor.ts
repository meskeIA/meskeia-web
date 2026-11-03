/**
 * Motor de tiempos-verbales-ingles: conjugación de siete tiempos del inglés, banco de ejercicios
 * numerados y corrector de lo que escribe un alumno.
 *
 * Sin React ni navegador: lo prueban los casos resueltos a mano de
 * `tests/tiempos-verbales-ingles-motor.spec.ts` (en `npm run test:calc`).
 *
 * Tiempos: present simple, present continuous, past simple, past continuous, present perfect,
 * future simple (will) y be going to. Formas: afirmativa, negativa e interrogativa.
 *
 * Reglas, tomadas de Cambridge Grammar («Present simple», «-ing forms», «Contractions») y de
 * Oxford Learner's Dictionaries (formas de cada verbo):
 *  · 3.ª persona del present simple: -s; -es tras s, sh, ch, x, z y o (goes, watches, fixes);
 *    consonante + y → -ies (studies); vocal + y → -s (plays); have → has; be → is.
 *  · -ing: la e muda se pierde (making), ie → y (lying), ee se queda (seeing); consonante + vocal
 *    + consonante con la última sílaba TÓNICA dobla la consonante (swimming, beginning); si es
 *    átona no (visiting), salvo la l, que el británico dobla y el americano no
 *    (travelling / traveling); w, x e y no se doblan nunca (fixing, playing).
 *  · Pasado: los irregulares salen del banco `@/data/verbos-irregulares`; los regulares, de la
 *    regla de ortografía de `pasadosRegulares` (práctica de regulares de quiz-verbos-irregulares).
 *  · Contracciones: I'm (nunca «amn't»: la negativa es «I'm not» o «I am not»), isn't, aren't,
 *    wasn't, weren't, don't, doesn't, didn't, haven't, hasn't, won't, 's, 're, 've, 'll.
 *
 * La tonicidad de la última sílaba no se deduce de la grafía (vísit / begín), así que cada verbo
 * del banco la lleva escrita.
 */
import { verbosIrregulares, type VerboIrregular } from '@/data/verbos-irregulares';
import { pasadosRegulares, explicarOrtografia, type VerboRegular } from '../quiz-verbos-irregulares/regulares';

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type Tiempo =
  | 'present-simple'
  | 'present-continuous'
  | 'past-simple'
  | 'past-continuous'
  | 'present-perfect'
  | 'future-will'
  | 'going-to';

export type Forma = 'afirmativa' | 'negativa' | 'interrogativa';

export type Sujeto = 'I' | 'you' | 'he' | 'she' | 'it' | 'we' | 'they';

export const TIEMPOS: Tiempo[] = [
  'present-simple', 'present-continuous', 'past-simple', 'past-continuous',
  'present-perfect', 'future-will', 'going-to',
];

export const NOMBRE_TIEMPO: Record<Tiempo, string> = {
  'present-simple': 'Present simple',
  'present-continuous': 'Present continuous',
  'past-simple': 'Past simple',
  'past-continuous': 'Past continuous',
  'present-perfect': 'Present perfect',
  'future-will': 'Future simple (will)',
  'going-to': 'Be going to',
};

export const FORMAS: Forma[] = ['afirmativa', 'negativa', 'interrogativa'];

export const SUJETOS: Sujeto[] = ['I', 'you', 'he', 'she', 'it', 'we', 'they'];

const TERCERA = new Set<Sujeto>(['he', 'she', 'it']);

export interface VerboTiempos {
  infinitivo: string;
  espanol: string;
  /** ¿Es tónica la última sílaba? Los monosílabos, siempre. Solo decide en los CVC. */
  ultimaTonica: boolean;
  /** Si es un verbo de estado, la nota que lo explica (no va en continuo). */
  estado?: string;
}

// ─── Banco de verbos ──────────────────────────────────────────────────────────

/**
 * Verbos frecuentes de uso escolar, irregulares y regulares. Los irregulares tienen que estar en
 * `@/data/verbos-irregulares` (de ahí salen el pasado y el participio); los regulares, no.
 */
export const VERBOS: VerboTiempos[] = [
  // Irregulares
  { infinitivo: 'be', espanol: 'ser, estar', ultimaTonica: true, estado: 'En continuo, be solo describe un comportamiento pasajero («You are being silly»); para decir cómo es o dónde está algo se usa el present simple.' },
  { infinitivo: 'have', espanol: 'tener; tomar', ultimaTonica: true, estado: 'Con el sentido de «tener, poseer», have no va en continuo («I have two sisters»); sí con acciones: «I am having breakfast».' },
  { infinitivo: 'do', espanol: 'hacer', ultimaTonica: true },
  { infinitivo: 'go', espanol: 'ir', ultimaTonica: true },
  { infinitivo: 'see', espanol: 'ver', ultimaTonica: true },
  { infinitivo: 'know', espanol: 'saber, conocer', ultimaTonica: true, estado: 'Know es un verbo de estado (conocimiento): no va en continuo. «I know», nunca «I am knowing».' },
  { infinitivo: 'make', espanol: 'hacer, fabricar', ultimaTonica: true },
  { infinitivo: 'get', espanol: 'conseguir, llegar', ultimaTonica: true },
  { infinitivo: 'begin', espanol: 'empezar', ultimaTonica: true },
  { infinitivo: 'swim', espanol: 'nadar', ultimaTonica: true },
  { infinitivo: 'sing', espanol: 'cantar', ultimaTonica: true },
  { infinitivo: 'sleep', espanol: 'dormir', ultimaTonica: true },
  { infinitivo: 'read', espanol: 'leer', ultimaTonica: true },
  { infinitivo: 'write', espanol: 'escribir', ultimaTonica: true },
  { infinitivo: 'eat', espanol: 'comer', ultimaTonica: true },
  { infinitivo: 'lose', espanol: 'perder', ultimaTonica: true },
  { infinitivo: 'win', espanol: 'ganar', ultimaTonica: true },
  { infinitivo: 'buy', espanol: 'comprar', ultimaTonica: true },
  { infinitivo: 'break', espanol: 'romper', ultimaTonica: true },
  { infinitivo: 'tell', espanol: 'contar, decir', ultimaTonica: true },
  { infinitivo: 'fall', espanol: 'caer', ultimaTonica: true },
  { infinitivo: 'come', espanol: 'venir', ultimaTonica: true },
  // Regulares
  { infinitivo: 'work', espanol: 'trabajar', ultimaTonica: true },
  { infinitivo: 'play', espanol: 'jugar; tocar (música)', ultimaTonica: true },
  { infinitivo: 'study', espanol: 'estudiar', ultimaTonica: false },
  { infinitivo: 'watch', espanol: 'ver (la tele), mirar', ultimaTonica: true },
  { infinitivo: 'fix', espanol: 'arreglar', ultimaTonica: true },
  { infinitivo: 'live', espanol: 'vivir', ultimaTonica: true },
  { infinitivo: 'visit', espanol: 'visitar', ultimaTonica: false },
  { infinitivo: 'travel', espanol: 'viajar', ultimaTonica: false },
  { infinitivo: 'stop', espanol: 'parar', ultimaTonica: true },
  { infinitivo: 'lie', espanol: 'mentir', ultimaTonica: true },
  { infinitivo: 'rain', espanol: 'llover', ultimaTonica: true },
  { infinitivo: 'boil', espanol: 'hervir', ultimaTonica: true },
  { infinitivo: 'open', espanol: 'abrir', ultimaTonica: false },
  { infinitivo: 'knock', espanol: 'llamar (a la puerta)', ultimaTonica: true },
  { infinitivo: 'wait', espanol: 'esperar', ultimaTonica: true },
  { infinitivo: 'move', espanol: 'mudarse; mover', ultimaTonica: true },
  { infinitivo: 'answer', espanol: 'responder, contestar', ultimaTonica: false },
  { infinitivo: 'paint', espanol: 'pintar', ultimaTonica: true },
  { infinitivo: 'close', espanol: 'cerrar', ultimaTonica: true },
  { infinitivo: 'help', espanol: 'ayudar', ultimaTonica: true },
  { infinitivo: 'like', espanol: 'gustar', ultimaTonica: true, estado: 'Like es un verbo de estado (gustos): no va en continuo. «I like it», nunca «I am liking it».' },
  { infinitivo: 'want', espanol: 'querer', ultimaTonica: true, estado: 'Want es un verbo de estado (deseos): no va en continuo aunque hables de ahora mismo.' },
  { infinitivo: 'need', espanol: 'necesitar', ultimaTonica: true, estado: 'Need es un verbo de estado: no va en continuo aunque hables de ahora mismo.' },
];

const POR_INFINITIVO = new Map(VERBOS.map((v) => [v.infinitivo, v]));

export function verboDe(infinitivo: string): VerboTiempos {
  const v = POR_INFINITIVO.get(infinitivo);
  if (!v) throw new Error(`El verbo «${infinitivo}» no está en el banco`);
  return v;
}

function irregularDe(v: VerboTiempos): VerboIrregular | undefined {
  return verbosIrregulares.find((x) => x.infinitive === v.infinitivo);
}

export function esIrregular(v: VerboTiempos): boolean {
  return irregularDe(v) !== undefined;
}

/** El verbo como lo entiende la regla de los regulares (el sonido final no interviene en la grafía). */
function comoRegular(v: VerboTiempos): VerboRegular {
  return { infinitivo: v.infinitivo, espanol: v.espanol, sonidoFinal: '', ultimaTonica: v.ultimaTonica };
}

// ─── Formas sueltas del verbo ─────────────────────────────────────────────────

const VOCALES = new Set(['a', 'e', 'i', 'o', 'u']);
const esVocal = (c: string | undefined) => c !== undefined && VOCALES.has(c);

/** Regla de ortografía de la 3.ª persona del singular. */
export type ReglaTercera = 'irregular' | 'es' | 'ies' | 's';

export function reglaTercera(v: VerboTiempos): ReglaTercera {
  const p = v.infinitivo;
  if (p === 'be' || p === 'have') return 'irregular';
  if (/(s|sh|ch|x|z|o)$/.test(p)) return 'es';
  if (p.endsWith('y') && !esVocal(p.at(-2))) return 'ies';
  return 's';
}

/** Present simple con he, she, it. */
export function terceraPersona(v: VerboTiempos): string {
  const p = v.infinitivo;
  switch (reglaTercera(v)) {
    case 'irregular': return p === 'be' ? 'is' : 'has';
    case 'es': return `${p}es`;
    case 'ies': return `${p.slice(0, -1)}ies`;
    case 's': return `${p}s`;
  }
}

/** Regla de ortografía de la forma en -ing. */
export type ReglaIng = 'be' | 'ie' | 'e-muda' | 'duplica' | 'l-britanica' | 'atona' | 'wxy' | 'general';

export function reglaIng(v: VerboTiempos): ReglaIng {
  const p = v.infinitivo;
  if (p === 'be') return 'be';
  if (p.endsWith('ie')) return 'ie';
  if (p.endsWith('e') && !/(ee|oe|ye)$/.test(p)) return 'e-muda';
  const ultima = p.at(-1);
  const cvc = ultima !== undefined && !esVocal(ultima) && esVocal(p.at(-2)) && p.length >= 3 && !esVocal(p.at(-3));
  if (cvc) {
    if (ultima === 'w' || ultima === 'x' || ultima === 'y') return 'wxy';
    if (v.ultimaTonica) return 'duplica';
    if (ultima === 'l') return 'l-britanica';
    return 'atona';
  }
  return 'general';
}

/** Formas en -ing admitidas: la primera es la británica cuando las dos valen. */
export function formasIng(v: VerboTiempos): string[] {
  const p = v.infinitivo;
  switch (reglaIng(v)) {
    case 'be': return ['being'];
    case 'ie': return [`${p.slice(0, -2)}ying`];
    case 'e-muda': return [`${p.slice(0, -1)}ing`];
    case 'duplica': return [`${p}${p.at(-1)}ing`];
    case 'l-britanica': return [`${p}ling`, `${p}ing`];
    case 'atona':
    case 'wxy':
    case 'general':
      return [`${p}ing`];
  }
}

/** Past simple (sin be, que depende de la persona). */
export function pasados(v: VerboTiempos): string[] {
  const irr = irregularDe(v);
  if (irr) return irr.pastSimple.split('/').map((f) => f.trim()).filter(Boolean);
  return pasadosRegulares(comoRegular(v));
}

/** Participios admitidos: el del banco y su variante (got / gotten). */
export function participios(v: VerboTiempos): string[] {
  const irr = irregularDe(v);
  if (irr) return irr.varianteParticipio ? [irr.pastParticiple, irr.varianteParticipio.forma] : [irr.pastParticiple];
  return pasadosRegulares(comoRegular(v));
}

// ─── Conjugación ──────────────────────────────────────────────────────────────

function presenteDeBe(s: Sujeto): string {
  if (s === 'I') return 'am';
  return TERCERA.has(s) ? 'is' : 'are';
}

function pasadoDeBe(s: Sujeto): string {
  return s === 'I' || TERCERA.has(s) ? 'was' : 'were';
}

/** Contracción del auxiliar pegada al sujeto (I'm, she's, they've, we'll). */
const CONTRAE_CON_SUJETO: Record<string, string> = {
  am: "'m", is: "'s", are: "'re", have: "'ve", has: "'s", will: "'ll",
};

/** Negativa contraída del auxiliar. «am» no tiene: «amn't» no existe en el inglés estándar. */
const NEGATIVA_CONTRAIDA: Record<string, string> = {
  is: "isn't", are: "aren't", was: "wasn't", were: "weren't",
  do: "don't", does: "doesn't", did: "didn't",
  have: "haven't", has: "hasn't", will: "won't",
};

/**
 * Auxiliares que admiten la otra contracción de la negativa, la del sujeto: I'm not, she's not,
 * they've not. Con will no: «I'll not» existe pero es raro, y en la duda se queda fuera.
 */
const NEGATIVA_CON_SUJETO = new Set(['am', 'is', 'are', 'have', 'has']);

interface Esqueleto {
  /** Primer auxiliar (am, is, does, did, have, will…), o null si no hay (present y past simple). */
  aux: string | null;
  /** Lo que va detrás del auxiliar: el verbo, sus variantes, o '' cuando be es el propio auxiliar. */
  restos: string[];
}

function esqueleto(v: VerboTiempos, tiempo: Tiempo, s: Sujeto, forma: Forma): Esqueleto {
  const tercera = TERCERA.has(s);
  const base = v.infinitivo;
  const esBe = base === 'be';
  switch (tiempo) {
    case 'present-simple':
      if (esBe) return { aux: presenteDeBe(s), restos: [''] };
      if (forma === 'afirmativa') return { aux: null, restos: [tercera ? terceraPersona(v) : base] };
      return { aux: tercera ? 'does' : 'do', restos: [base] };
    case 'present-continuous':
      return { aux: presenteDeBe(s), restos: formasIng(v) };
    case 'past-simple':
      if (esBe) return { aux: pasadoDeBe(s), restos: [''] };
      if (forma === 'afirmativa') return { aux: null, restos: pasados(v) };
      return { aux: 'did', restos: [base] };
    case 'past-continuous':
      return { aux: pasadoDeBe(s), restos: formasIng(v) };
    case 'present-perfect':
      return { aux: tercera ? 'has' : 'have', restos: participios(v) };
    case 'future-will':
      return { aux: 'will', restos: [base] };
    case 'going-to':
      return { aux: presenteDeBe(s), restos: [`going to ${base}`] };
  }
}

const unir = (...partes: (string | null | undefined)[]) =>
  partes.filter((p): p is string => typeof p === 'string' && p !== '').join(' ');

export interface OpcionesConjugar {
  /** Adverbio de frecuencia o tiempo que va tras el auxiliar (never, ever, always). */
  adverbio?: string;
  /** Sujeto escrito, si no es el pronombre («your sister»). Sin contracciones con el sujeto. */
  textoSujeto?: string;
}

/**
 * Todas las formas correctas, con el sujeto delante (o el auxiliar, en las preguntas). La
 * primera es la completa; detrás, las contraídas. Las preguntas van sin signo de interrogación.
 */
export function conjugar(
  infinitivo: string,
  tiempo: Tiempo,
  sujeto: Sujeto,
  forma: Forma,
  opciones: OpcionesConjugar = {},
): string[] {
  const v = verboDe(infinitivo);
  const { aux, restos } = esqueleto(v, tiempo, sujeto, forma);
  const s = opciones.textoSujeto ?? sujeto;
  const pronombre = opciones.textoSujeto === undefined;
  const adv = opciones.adverbio;
  const formas: string[] = [];
  for (const resto of restos) {
    if (forma === 'interrogativa') {
      formas.push(unir(aux, s, adv, resto));
    } else if (forma === 'afirmativa') {
      if (aux === null) {
        formas.push(unir(s, adv, resto));
      } else {
        formas.push(unir(s, aux, adv, resto));
        if (pronombre && CONTRAE_CON_SUJETO[aux]) formas.push(unir(s + CONTRAE_CON_SUJETO[aux], adv, resto));
      }
    } else if (aux !== null) {
      formas.push(unir(s, aux, 'not', adv, resto));
      if (NEGATIVA_CONTRAIDA[aux]) formas.push(unir(s, NEGATIVA_CONTRAIDA[aux], adv, resto));
      if (pronombre && NEGATIVA_CON_SUJETO.has(aux)) formas.push(unir(s + CONTRAE_CON_SUJETO[aux], 'not', adv, resto));
    }
  }
  return [...new Set(formas)];
}

// ─── Ejercicios ───────────────────────────────────────────────────────────────

export type Categoria = 'presente' | 'pasado' | 'perfecto' | 'futuro';

export const CATEGORIAS: Categoria[] = ['presente', 'pasado', 'perfecto', 'futuro'];

export const INFO_CATEGORIA: Record<Categoria, { nombre: string; tiempos: [Tiempo, Tiempo] }> = {
  presente: { nombre: 'Present simple o continuous', tiempos: ['present-simple', 'present-continuous'] },
  pasado: { nombre: 'Past simple o continuous', tiempos: ['past-simple', 'past-continuous'] },
  perfecto: { nombre: 'Past simple o present perfect', tiempos: ['past-simple', 'present-perfect'] },
  futuro: { nombre: 'Will o be going to', tiempos: ['future-will', 'going-to'] },
};

export interface Ejercicio {
  /** Número estable, el que se ve en pantalla y el que asigna un profesor. */
  numero: number;
  categoria: Categoria;
  /** Texto antes del hueco (en las afirmativas y negativas, con el sujeto). */
  antes: string;
  /** Texto después del hueco. */
  despues: string;
  verbo: string;
  tiempo: Tiempo;
  sujeto: Sujeto;
  forma: Forma;
  adverbio?: string;
  /** Sujeto de una pregunta cuando no es un pronombre («your sister»). */
  textoSujeto?: string;
  /** Lo que va en el hueco, escrito a mano. Una negativa, con la contracción. */
  respuesta: string;
  /** Por qué va este tiempo, aplicado a la frase. */
  regla: string;
  /** Tiempos que no se ofrecen como distractor porque, en algún uso, también se oyen. */
  sinDistractor?: Tiempo[];
}

/** Banco de ejercicios. El número es su posición: no se reordena ni se borra uno del medio. */
export const EJERCICIOS: Ejercicio[] = [
  // ── Present simple o present continuous ──
  { numero: 1, categoria: 'presente', antes: 'She', despues: 'her grandmother every Sunday.', verbo: 'visit', tiempo: 'present-simple', sujeto: 'she', forma: 'afirmativa', respuesta: 'visits',
    regla: '«Every Sunday» habla de una costumbre: present simple. Con she, el verbo lleva -s.' },
  { numero: 2, categoria: 'presente', antes: 'Look! It', despues: '.', verbo: 'rain', tiempo: 'present-continuous', sujeto: 'it', forma: 'afirmativa', respuesta: 'is raining',
    regla: '«Look!» señala algo que está pasando ahora mismo: present continuous.' },
  { numero: 3, categoria: 'presente', antes: 'Listen! Someone', despues: 'in the garden.', verbo: 'sing', tiempo: 'present-continuous', sujeto: 'he', forma: 'afirmativa', respuesta: 'is singing',
    regla: '«Listen!» indica que ocurre en este momento: present continuous. Someone concuerda como he o she: is.' },
  { numero: 4, categoria: 'presente', antes: 'Water', despues: 'at 100 degrees Celsius.', verbo: 'boil', tiempo: 'present-simple', sujeto: 'it', forma: 'afirmativa', respuesta: 'boils',
    regla: 'Es un hecho que siempre es verdad: present simple. Water equivale a it, así que el verbo lleva -s.' },
  { numero: 5, categoria: 'presente', antes: 'I', despues: 'coffee.', verbo: 'like', tiempo: 'present-simple', sujeto: 'I', forma: 'negativa', respuesta: "don't like",
    regla: 'Un gusto es un estado, y like es un verbo de estado: present simple. Con I, la negativa lleva don\'t.' },
  { numero: 6, categoria: 'presente', antes: 'My brother', despues: 'for an exam at the moment.', verbo: 'study', tiempo: 'present-continuous', sujeto: 'he', forma: 'afirmativa', respuesta: 'is studying',
    regla: '«At the moment» marca una acción en curso: present continuous. My brother equivale a he: is.' },
  { numero: 7, categoria: 'presente', antes: 'Diego usually', despues: 'to school by bus.', verbo: 'go', tiempo: 'present-simple', sujeto: 'he', forma: 'afirmativa', respuesta: 'goes',
    regla: '«Usually» marca una rutina: present simple. Diego equivale a he, y go, que termina en -o, toma -es.' },
  { numero: 8, categoria: 'presente', antes: '', despues: 'some tea?', verbo: 'want', tiempo: 'present-simple', sujeto: 'you', forma: 'interrogativa', respuesta: 'do you want',
    regla: 'Want es un verbo de estado: va en present simple aunque hables de este momento. Pregunta: do + you + verbo.' },
  { numero: 9, categoria: 'presente', antes: 'They', despues: 'football right now.', verbo: 'play', tiempo: 'present-continuous', sujeto: 'they', forma: 'afirmativa', respuesta: 'are playing',
    regla: '«Right now» marca una acción en curso: present continuous. Con they: are.' },
  { numero: 10, categoria: 'presente', antes: 'I', despues: 'the answer.', verbo: 'know', tiempo: 'present-simple', sujeto: 'I', forma: 'afirmativa', respuesta: 'know',
    regla: 'Know es un verbo de estado (conocimiento): present simple aunque hables de este momento. «I am knowing» es incorrecto.' },
  { numero: 11, categoria: 'presente', antes: 'How often', despues: '?', verbo: 'swim', tiempo: 'present-simple', sujeto: 'she', forma: 'interrogativa', textoSujeto: 'your sister', respuesta: 'does your sister swim',
    regla: '«How often» pregunta por una frecuencia, una costumbre: present simple. Your sister equivale a she: does.' },
  { numero: 12, categoria: 'presente', antes: 'Be quiet! The baby', despues: '.', verbo: 'sleep', tiempo: 'present-continuous', sujeto: 'it', forma: 'afirmativa', respuesta: 'is sleeping',
    regla: '«Be quiet!» muestra que ocurre ahora mismo: present continuous.' },
  { numero: 13, categoria: 'presente', antes: 'Valentina', despues: 'help with her homework right now.', verbo: 'need', tiempo: 'present-simple', sujeto: 'she', forma: 'afirmativa', respuesta: 'needs',
    regla: 'Need es un verbo de estado: va en present simple incluso con «right now». Valentina equivale a she: needs.' },
  { numero: 14, categoria: 'presente', antes: 'The shop', despues: "at 9 o'clock every morning.", verbo: 'open', tiempo: 'present-simple', sujeto: 'it', forma: 'afirmativa', respuesta: 'opens',
    regla: 'Un horario que se repite («every morning»): present simple. The shop equivale a it: opens.' },
  { numero: 15, categoria: 'presente', antes: 'What', despues: 'at the moment?', verbo: 'do', tiempo: 'present-continuous', sujeto: 'you', forma: 'interrogativa', respuesta: 'are you doing',
    regla: '«At the moment» pregunta por lo que está en curso: present continuous. Pregunta: are + you + verbo en -ing.' },
  { numero: 16, categoria: 'presente', antes: 'Ahmed', despues: 'two sisters and a brother.', verbo: 'have', tiempo: 'present-simple', sujeto: 'he', forma: 'afirmativa', respuesta: 'has',
    regla: 'Have con el sentido de tener (posesión) es de estado: present simple. Con he: has.' },

  // ── Past simple o past continuous ──
  { numero: 17, categoria: 'pasado', antes: 'I', despues: 'a book when the lights went out.', verbo: 'read', tiempo: 'past-continuous', sujeto: 'I', forma: 'afirmativa', respuesta: 'was reading',
    regla: 'Una acción larga en curso (leer) interrumpida por otra corta (went out): la larga va en past continuous.' },
  { numero: 18, categoria: 'pasado', antes: 'We were having dinner when someone', despues: 'at the door.', verbo: 'knock', tiempo: 'past-simple', sujeto: 'he', forma: 'afirmativa', respuesta: 'knocked',
    regla: 'La acción corta que interrumpe a la larga (we were having dinner) va en past simple.' },
  { numero: 19, categoria: 'pasado', antes: 'What', despues: "at 8 o'clock last night?", verbo: 'do', tiempo: 'past-continuous', sujeto: 'you', forma: 'interrogativa', respuesta: 'were you doing',
    regla: 'Una hora concreta del pasado («at 8 o\'clock last night») pregunta por lo que estaba en curso: past continuous.' },
  { numero: 20, categoria: 'pasado', antes: 'Mei', despues: 'her phone yesterday.', verbo: 'lose', tiempo: 'past-simple', sujeto: 'she', forma: 'afirmativa', respuesta: 'lost',
    regla: '«Yesterday» sitúa una acción terminada: past simple. Lose es irregular: lost.' },
  { numero: 21, categoria: 'pasado', antes: 'They', despues: 'tennis when it started to rain.', verbo: 'play', tiempo: 'past-continuous', sujeto: 'they', forma: 'afirmativa', respuesta: 'were playing',
    regla: 'El partido estaba en curso cuando empezó a llover (acción corta): past continuous. Con they: were.' },
  { numero: 22, categoria: 'pasado', antes: 'When I arrived, my friends', despues: 'for me.', verbo: 'wait', tiempo: 'past-continuous', sujeto: 'they', forma: 'afirmativa', respuesta: 'were waiting',
    regla: 'Cuando llegué, la espera ya estaba en curso: past continuous. My friends equivale a they: were.' },
  { numero: 23, categoria: 'pasado', antes: 'We', despues: 'to the party last Saturday.', verbo: 'go', tiempo: 'past-simple', sujeto: 'we', forma: 'negativa', respuesta: "didn't go",
    regla: '«Last Saturday» es un momento terminado: past simple. Negativa: didn\'t + verbo en forma base (nunca «didn\'t went»).' },
  { numero: 24, categoria: 'pasado', antes: '', despues: 'the match last night?', verbo: 'see', tiempo: 'past-simple', sujeto: 'you', forma: 'interrogativa', respuesta: 'did you see',
    regla: '«Last night» es un momento terminado: past simple. Pregunta: did + you + verbo en forma base.' },
  { numero: 25, categoria: 'pasado', antes: 'The children', despues: 'when their parents came home.', verbo: 'sleep', tiempo: 'past-continuous', sujeto: 'they', forma: 'afirmativa', respuesta: 'were sleeping',
    regla: 'El sueño estaba en curso cuando llegaron los padres: past continuous. The children equivale a they: were.' },
  { numero: 26, categoria: 'pasado', antes: 'Cervantes', despues: 'Don Quixote more than 400 years ago.', verbo: 'write', tiempo: 'past-simple', sujeto: 'he', forma: 'afirmativa', respuesta: 'wrote',
    regla: '«Ago» sitúa la acción en un pasado terminado: past simple. Write es irregular: wrote.' },
  { numero: 27, categoria: 'pasado', antes: 'Where', despues: 'yesterday afternoon?', verbo: 'be', tiempo: 'past-simple', sujeto: 'you', forma: 'interrogativa', respuesta: 'were you',
    regla: '«Yesterday afternoon»: past simple. Be no necesita did en la pregunta: were + you.' },
  { numero: 28, categoria: 'pasado', antes: 'At 3 a.m. Ana', despues: ': she was watching a film.', verbo: 'sleep', tiempo: 'past-continuous', sujeto: 'she', forma: 'negativa', respuesta: "wasn't sleeping",
    regla: 'Una hora concreta (at 3 a.m.) y lo que estaba en curso entonces: past continuous. Negativa: wasn\'t + verbo en -ing.' },

  // ── Past simple o present perfect ──
  { numero: 29, categoria: 'perfecto', antes: 'I', despues: 'to Lima.', verbo: 'be', tiempo: 'present-perfect', sujeto: 'I', forma: 'afirmativa', adverbio: 'never', respuesta: 'have never been',
    regla: '«Never» habla de toda tu vida hasta hoy, sin fecha: present perfect. Have + never + participio (been).' },
  { numero: 30, categoria: 'perfecto', antes: '', despues: 'sushi? — Yes, once, in Lima.', verbo: 'eat', tiempo: 'present-perfect', sujeto: 'you', forma: 'interrogativa', adverbio: 'ever', respuesta: 'have you ever eaten',
    regla: '«Ever» pregunta por la experiencia en algún momento de la vida: present perfect. En el inglés americano informal también se oye «Did you ever…?», pero en un examen se espera el present perfect.',
    sinDistractor: ['past-simple', 'present-simple'] },
  { numero: 31, categoria: 'perfecto', antes: 'I', despues: 'that film last week.', verbo: 'see', tiempo: 'past-simple', sujeto: 'I', forma: 'afirmativa', respuesta: 'saw',
    regla: '«Last week» es un momento terminado: past simple, nunca present perfect («I have seen it last week» es incorrecto).' },
  { numero: 32, categoria: 'perfecto', antes: 'They', despues: 'to Bogotá two years ago.', verbo: 'move', tiempo: 'past-simple', sujeto: 'they', forma: 'afirmativa', respuesta: 'moved',
    regla: '«Ago» pide past simple: la mudanza ocurrió en un momento terminado.' },
  { numero: 33, categoria: 'perfecto', antes: 'I', despues: 'Marta since we were children.', verbo: 'know', tiempo: 'present-perfect', sujeto: 'I', forma: 'afirmativa', respuesta: 'have known',
    regla: '«Since» + punto de inicio, y la situación sigue hoy: present perfect. Know es de estado, así que no va en continuo.' },
  { numero: 34, categoria: 'perfecto', antes: 'She', despues: 'her cousins since March.', verbo: 'see', tiempo: 'present-perfect', sujeto: 'she', forma: 'negativa', respuesta: "hasn't seen",
    regla: '«Since March» va desde un momento del pasado hasta hoy: present perfect. Con she: hasn\'t + participio.' },
  { numero: 35, categoria: 'perfecto', antes: 'We', despues: 'this car for ten years.', verbo: 'have', tiempo: 'present-perfect', sujeto: 'we', forma: 'afirmativa', respuesta: 'have had',
    regla: '«For ten years» y el coche sigue siendo nuestro: present perfect. Have + had (participio de have).' },
  { numero: 36, categoria: 'perfecto', antes: 'My grandparents', despues: 'married in 1975.', verbo: 'get', tiempo: 'past-simple', sujeto: 'they', forma: 'afirmativa', respuesta: 'got',
    regla: 'Un año concreto del pasado («in 1975»): past simple. Get es irregular: got.' },
  { numero: 37, categoria: 'perfecto', antes: 'How long', despues: 'your dog?', verbo: 'have', tiempo: 'present-perfect', sujeto: 'you', forma: 'interrogativa', respuesta: 'have you had',
    regla: '«How long» con una situación que dura hasta hoy: present perfect. Have + you + had.' },
  { numero: 38, categoria: 'perfecto', antes: 'Kofi', despues: 'three medals so far this season.', verbo: 'win', tiempo: 'present-perfect', sujeto: 'he', forma: 'afirmativa', respuesta: 'has won',
    regla: '«So far» (hasta ahora) y la temporada no ha terminado: present perfect. Con he: has + won.' },
  { numero: 39, categoria: 'perfecto', antes: 'When', despues: 'that jacket?', verbo: 'buy', tiempo: 'past-simple', sujeto: 'you', forma: 'interrogativa', respuesta: 'did you buy',
    regla: 'Una pregunta con «When» busca un momento concreto: past simple, no present perfect.' },
  { numero: 40, categoria: 'perfecto', antes: 'Tomás', despues: 'his arm twice in his life.', verbo: 'break', tiempo: 'present-perfect', sujeto: 'he', forma: 'afirmativa', respuesta: 'has broken',
    regla: 'La experiencia de toda su vida, sin fecha: present perfect. Break es irregular: broken.' },

  // ── Will o be going to ──
  { numero: 41, categoria: 'futuro', antes: 'Look at those black clouds! It', despues: '.', verbo: 'rain', tiempo: 'going-to', sujeto: 'it', forma: 'afirmativa', respuesta: 'is going to rain',
    regla: 'Una predicción basada en lo que ves ahora (las nubes): be going to.' },
  { numero: 42, categoria: 'futuro', antes: 'The phone is ringing. I', despues: 'it.', verbo: 'answer', tiempo: 'future-will', sujeto: 'I', forma: 'afirmativa', respuesta: 'will answer',
    regla: 'Una decisión tomada en el momento de hablar: will (o su contracción, I\'ll answer).' },
  { numero: 43, categoria: 'futuro', antes: 'I promise I', despues: 'anyone.', verbo: 'tell', tiempo: 'future-will', sujeto: 'I', forma: 'negativa', respuesta: "won't tell",
    regla: 'Una promesa: will. Negativa: won\'t (will not) + verbo en forma base.' },
  { numero: 44, categoria: 'futuro', antes: 'Sofía has bought some paint because she', despues: 'her bedroom.', verbo: 'paint', tiempo: 'going-to', sujeto: 'she', forma: 'afirmativa', respuesta: 'is going to paint',
    regla: 'Un plan decidido antes de hablar (ya ha comprado la pintura): be going to.' },
  { numero: 45, categoria: 'futuro', antes: 'Careful! You', despues: '!', verbo: 'fall', tiempo: 'going-to', sujeto: 'you', forma: 'afirmativa', respuesta: 'are going to fall',
    regla: 'Ves que va a pasar enseguida: be going to. Con you: are going to.' },
  { numero: 46, categoria: 'futuro', antes: "I'm cold. — Wait, I", despues: 'the window.', verbo: 'close', tiempo: 'future-will', sujeto: 'I', forma: 'afirmativa', respuesta: 'will close',
    regla: 'Te ofreces a hacer algo y lo decides en ese momento: will.' },
  { numero: 47, categoria: 'futuro', antes: 'Mateo decided it last year: he', despues: 'medicine.', verbo: 'study', tiempo: 'going-to', sujeto: 'he', forma: 'afirmativa', respuesta: 'is going to study',
    regla: 'Una intención decidida antes de hablar («decided it last year»): be going to.' },
  { numero: 48, categoria: 'futuro', antes: 'Those bags look heavy. I', despues: 'you.', verbo: 'help', tiempo: 'future-will', sujeto: 'I', forma: 'afirmativa', respuesta: 'will help',
    regla: 'Un ofrecimiento decidido en el momento: will.' },
  { numero: 49, categoria: 'futuro', antes: 'Kenji is driving too fast. He', despues: 'an accident.', verbo: 'have', tiempo: 'going-to', sujeto: 'he', forma: 'afirmativa', respuesta: 'is going to have',
    regla: 'Lo que ves ahora (conduce demasiado rápido) anuncia lo que va a pasar: be going to.' },
];

export const TOTAL_EJERCICIOS = EJERCICIOS.length;

export function ejercicioDe(numero: number): Ejercicio | undefined {
  return EJERCICIOS.find((e) => e.numero === numero);
}

export function ejerciciosDe(categorias: Categoria[]): Ejercicio[] {
  const set = new Set(categorias);
  return EJERCICIOS.filter((e) => set.has(e.categoria));
}

/** Lo que va entre paréntesis tras el hueco: «visit», «not / like», «you / ever / eat». */
export function pistaDe(ej: Ejercicio): string {
  const partes = [
    ej.forma === 'interrogativa' ? ej.textoSujeto ?? ej.sujeto : null,
    ej.forma === 'negativa' ? 'not' : null,
    ej.adverbio ?? null,
    ej.verbo,
  ];
  return partes.filter((p): p is string => p !== null).join(' / ');
}

const ES_PUNTUACION = /^[.,;:!?]/;

/** Mayúscula inicial cuando el hueco abre la frase. */
export function huecoMostrado(ej: Ejercicio, texto: string): string {
  return ej.antes === '' && texto ? texto[0].toUpperCase() + texto.slice(1) : texto;
}

/** El enunciado en tres trozos, con los espacios ya puestos: antes, pista y después. */
export function partesEnunciado(ej: Ejercicio): { antes: string; pista: string; despues: string } {
  return {
    antes: ej.antes ? `${ej.antes} ` : '',
    pista: ` (${pistaDe(ej)})`,
    despues: ES_PUNTUACION.test(ej.despues) ? ej.despues : ` ${ej.despues}`,
  };
}

/** El enunciado en una línea, con el hueco: «She ___ (visit) her grandmother every Sunday.» */
export function enunciadoTexto(ej: Ejercicio): string {
  const p = partesEnunciado(ej);
  return `${p.antes}___${p.pista}${p.despues}`;
}

/** La frase resuelta, con la respuesta en el hueco. */
export function fraseCompleta(ej: Ejercicio): string {
  const despues = ES_PUNTUACION.test(ej.despues) ? ej.despues : ` ${ej.despues}`;
  const antes = ej.antes ? `${ej.antes} ` : '';
  return `${antes}${huecoMostrado(ej, ej.respuesta)}${despues}`;
}

function conjugarEjercicio(ej: Ejercicio, tiempo: Tiempo): string[] {
  return conjugar(ej.verbo, tiempo, ej.sujeto, ej.forma, { adverbio: ej.adverbio, textoSujeto: ej.textoSujeto });
}

/**
 * Lo que puede ir en el hueco con un tiempo dado. En las afirmativas y negativas el sujeto está
 * fuera del hueco, así que se quita, y con él las formas que lo llevan pegado (I'm, she's): en
 * el hueco no puede ir un apóstrofo suelto. En las preguntas el hueco lleva auxiliar y sujeto.
 */
function huecoCon(ej: Ejercicio, tiempo: Tiempo): string[] {
  const formas = conjugarEjercicio(ej, tiempo);
  if (ej.forma === 'interrogativa') return formas;
  const prefijo = `${ej.textoSujeto ?? ej.sujeto} `;
  return formas.filter((f) => f.startsWith(prefijo)).map((f) => f.slice(prefijo.length));
}

/** Todo lo que se da por bueno en el hueco: la forma completa y sus contracciones. */
export function formasDelHueco(ej: Ejercicio): string[] {
  return huecoCon(ej, ej.tiempo);
}

// ─── Corrector ────────────────────────────────────────────────────────────────

/**
 * Lo que un alumno escribe, en limpio: minúsculas, apóstrofo tipográfico (’) o acento (´ `) como
 * apóstrofo recto, sin signos de puntuación y con un solo espacio entre palabras.
 */
export function normalizar(texto: string): string {
  return texto
    .normalize('NFC')
    .toLowerCase()
    .replace(/[’‘´`]/g, "'")
    .replace(/[.,;:!?¡¿]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** ¿El texto de antes del hueco termina en el pronombre del sujeto? («Look! It», «I promise I») */
function sujetoEnLaFrase(ej: Ejercicio): boolean {
  if (ej.forma === 'interrogativa' || ej.textoSujeto) return false;
  const palabras = normalizar(ej.antes).split(' ');
  return palabras.at(-1) === ej.sujeto.toLowerCase();
}

/**
 * ¿Es correcta la respuesta?
 *
 * Vale lo que va en el hueco, con o sin contracción. Si la frase lleva un pronombre justo antes
 * del hueco, también vale escribirlo otra vez con el verbo («she's working», «I'll answer») o
 * empezar por la contracción («'ll answer»): son formas correctas de la misma frase.
 */
export function esRespuestaCorrecta(ej: Ejercicio, entrada: string): boolean {
  const e = normalizar(entrada);
  if (!e) return false;
  if (formasDelHueco(ej).map(normalizar).includes(e)) return true;
  if (!sujetoEnLaFrase(ej)) return false;
  const completas = conjugarEjercicio(ej, ej.tiempo).map(normalizar);
  if (completas.includes(e)) return true;
  return e.startsWith("'") && completas.includes(normalizar(ej.sujeto) + e);
}

// ─── Opciones del modo elegir ─────────────────────────────────────────────────

/** La forma que se enseña de un tiempo: en las negativas, la contraída si existe. */
function formaPreferida(formas: string[], forma: Forma): string | undefined {
  if (forma === 'negativa') return formas.find((f) => f.includes("n't")) ?? formas[0];
  return formas[0];
}

/**
 * De qué tiempos salen los distractores de cada categoría, por orden: primero la pareja que se
 * practica; después, tiempos que en esa frase son claramente falsos. En el futuro no se ofrece
 * el present continuous antes que el simple: «I'm not telling anyone» se oye como promesa, y un
 * distractor que también se dice no enseña nada.
 */
const ORDEN_DISTRACTORES: Record<Categoria, Tiempo[]> = {
  presente: ['present-simple', 'present-continuous', 'past-simple', 'past-continuous', 'present-perfect', 'future-will', 'going-to'],
  pasado: ['past-simple', 'past-continuous', 'present-simple', 'present-continuous', 'present-perfect', 'future-will', 'going-to'],
  perfecto: ['past-simple', 'present-perfect', 'present-simple', 'future-will', 'present-continuous', 'past-continuous', 'going-to'],
  futuro: ['future-will', 'going-to', 'present-simple', 'past-simple', 'present-perfect', 'present-continuous', 'past-continuous'],
};

/**
 * Cuatro opciones: la respuesta y tres distractores, que son la misma frase en otros tiempos.
 * El primero, el otro tiempo de la pareja que se practica (simple frente a continuous…). Orden
 * fijo: la vista las baraja. La respuesta va la primera.
 */
export function opcionesDe(ej: Ejercicio): string[] {
  const orden = ORDEN_DISTRACTORES[ej.categoria];
  const excluidos = new Set<Tiempo>([ej.tiempo, ...(ej.sinDistractor ?? [])]);
  const opciones = [ej.respuesta];
  const vistas = new Set([normalizar(ej.respuesta)]);
  for (const t of orden) {
    if (opciones.length === 4) break;
    if (excluidos.has(t)) continue;
    const candidata = formaPreferida(huecoCon(ej, t), ej.forma);
    if (!candidata) continue;
    const n = normalizar(candidata);
    if (vistas.has(n) || esRespuestaCorrecta(ej, candidata)) continue;
    vistas.add(n);
    opciones.push(candidata);
  }
  return opciones;
}

// ─── Explicación de cómo se construye ─────────────────────────────────────────

function notaTercera(v: VerboTiempos): string {
  const p = v.infinitivo;
  const t = terceraPersona(v);
  switch (reglaTercera(v)) {
    case 'irregular': return `${p} es irregular con he, she, it: ${t}.`;
    case 'es': return `«${p}» termina en ${p.endsWith('sh') || p.endsWith('ch') ? p.slice(-2) : p.slice(-1)}: añade -es (${t}).`;
    case 'ies': return `«${p}» termina en consonante + y: la y pasa a -ies (${t}).`;
    case 's': return `Se añade -s: ${t}.`;
  }
}

/** Cómo se escribe la forma en -ing de un verbo, con su regla. */
export function notaIng(v: VerboTiempos): string {
  const [ing, variante] = formasIng(v);
  const p = v.infinitivo;
  switch (reglaIng(v)) {
    case 'be': return `Be en -ing: ${ing}.`;
    case 'ie': return `«${p}» termina en -ie: pasa a -y antes de -ing (${ing}).`;
    case 'e-muda': return `«${p}» pierde la e muda final: ${ing}.`;
    case 'duplica': return `«${p}» termina en consonante + vocal + consonante y la última sílaba es tónica: se dobla la ${p.at(-1)} (${ing}).`;
    case 'l-britanica': return `«${p}» termina en vocal + l en sílaba átona: el inglés británico dobla la l (${ing}) y el americano no (${variante}). Valen las dos.`;
    case 'atona': return `«${p}» termina en consonante + vocal + consonante, pero la última sílaba es átona: no se dobla (${ing}).`;
    case 'wxy': return `«${p}» termina en ${p.at(-1)}, que no se dobla nunca: ${ing}.`;
    case 'general': return `Se añade -ing: ${ing}.`;
  }
}

/** Pasado o participio de un verbo, con la explicación de si es irregular o de la regla del -ed. */
function notaPasado(v: VerboTiempos, cual: 'pasado' | 'participio'): string {
  if (irregularDe(v)) {
    const formas = cual === 'pasado' ? pasados(v) : participios(v);
    return `«${v.infinitivo}» es irregular: su ${cual === 'pasado' ? 'past simple' : 'participio'} es ${formas.join(' / ')}.`;
  }
  const regla = explicarOrtografia(comoRegular(v));
  return cual === 'pasado' ? `«${v.infinitivo}» es regular. ${regla}` : `«${v.infinitivo}» es regular: el participio es igual que el pasado. ${regla}`;
}

/** Cómo se construye la forma del ejercicio, aplicada a su verbo y su sujeto. */
export function explicarConstruccion(ej: Ejercicio): string {
  const v = verboDe(ej.verbo);
  const s = ej.textoSujeto ?? ej.sujeto;
  const tercera = TERCERA.has(ej.sujeto);
  const base = v.infinitivo;
  const esBe = base === 'be';
  switch (ej.tiempo) {
    case 'present-simple':
      if (esBe) return 'Be en present simple: am con I, is con he, she, it y are con you, we, they.';
      if (ej.forma === 'afirmativa') {
        return tercera
          ? `Present simple con he, she o it: el verbo cambia. ${notaTercera(v)}`
          : `Present simple con ${s}: el verbo va en su forma base (${base}), sin -s.`;
      }
      if (ej.forma === 'negativa') {
        const aux = tercera ? "doesn't" : "don't";
        return tercera
          ? `Negativa del present simple con he, she o it: doesn't (does not) + verbo en forma base. «${aux} ${base}», nunca «${aux} ${terceraPersona(v)}».`
          : `Negativa del present simple: ${aux} (do not) + verbo en forma base (${base}).`;
      }
      return tercera
        ? `Pregunta del present simple: does + sujeto + verbo en forma base. Con does el verbo ya no lleva -s: «does ${s} ${base}».`
        : `Pregunta del present simple: do + sujeto + verbo en forma base (${base}).`;
    case 'present-continuous':
      return `Present continuous: am, is o are (${presenteDeBe(ej.sujeto)} con ${s}) + verbo en -ing. ${notaIng(v)}`;
    case 'past-simple':
      if (esBe) return 'Be en past simple: was con I, he, she, it y were con you, we, they. Las preguntas y negativas no llevan did.';
      if (ej.forma === 'afirmativa') return notaPasado(v, 'pasado');
      if (ej.forma === 'negativa') return `Negativa del past simple: didn't (did not) + verbo en forma base. «didn't ${base}», nunca «didn't ${pasados(v)[0]}».`;
      return `Pregunta del past simple: did + sujeto + verbo en forma base (${base}), nunca «did ${s} ${pasados(v)[0]}».`;
    case 'past-continuous':
      return `Past continuous: was (I, he, she, it) o were (you, we, they) + verbo en -ing. ${notaIng(v)}`;
    case 'present-perfect':
      return `Present perfect: have (has con he, she, it) + participio. ${notaPasado(v, 'participio')}`;
    case 'future-will':
      return `Futuro con will: will + verbo en forma base (${base}), igual con todos los sujetos. Contracciones: 'll y won't (will not).`;
    case 'going-to':
      return `Be going to: am, is o are (${presenteDeBe(ej.sujeto)} con ${s}) + going to + verbo en forma base (${base}).`;
  }
}

// ─── Selección por número ─────────────────────────────────────────────────────

export type LecturaNumeros = { ok: true; numeros: number[] } | { ok: false; error: string };

const RANGO = /^(\d+)-(\d+)$/;

/**
 * Lee la lista de ejercicios que escribe un profesor o un alumno: «3, 7, 11», «5-9», «2 4 6»,
 * «1-3 y 10». Devuelve los números en el orden escrito, sin repetir, o un error que dice qué
 * trozo no se entiende o qué número no existe.
 */
export function leerNumeros(texto: string, total: number): LecturaNumeros {
  const limpio = texto
    .replace(/[–—]/g, '-')
    .replace(/\s*-\s*/g, '-')
    .trim();
  const trozos = limpio.split(/[\s,;]+/).filter((t) => t !== '' && t.toLowerCase() !== 'y');
  if (trozos.length === 0) return { ok: false, error: 'Escribe al menos un número de ejercicio, por ejemplo «3, 7, 11» o «5-9».' };
  const numeros: number[] = [];
  const fuera = (n: number) => n < 1 || n > total;
  for (const t of trozos) {
    const rango = t.match(RANGO);
    if (rango) {
      const a = Number(rango[1]);
      const b = Number(rango[2]);
      const [desde, hasta] = a <= b ? [a, b] : [b, a];
      if (fuera(desde) || fuera(hasta)) {
        return { ok: false, error: `El intervalo «${t}» se sale de la lista: hay ejercicios del 1 al ${total}.` };
      }
      for (let n = desde; n <= hasta; n++) numeros.push(n);
    } else if (/^\d+$/.test(t)) {
      const n = Number(t);
      if (fuera(n)) return { ok: false, error: `No existe el ejercicio ${n}: hay del 1 al ${total}.` };
      numeros.push(n);
    } else {
      return { ok: false, error: `«${t}» no es un número de ejercicio. Escribe números sueltos o intervalos: «3, 7, 11» o «5-9».` };
    }
  }
  return { ok: true, numeros: [...new Set(numeros)] };
}
