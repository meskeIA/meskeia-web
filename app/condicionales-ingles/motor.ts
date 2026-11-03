/**
 * Motor de condicionales-ingles: el banco de ejercicios numerados, el corrector y la regla que
 * explica cada respuesta.
 *
 * Sin React ni `@/lib`: lo prueban los casos escritos a mano de
 * `tests/condicionales-ingles-motor.spec.ts` (en `npm run test:calc`).
 *
 * Gramática: tipos 0, 1, 2 y 3 (zero, first, second y third conditional), con `unless` en
 * algunos casos de los tipos 0 y 1. Sin condicionales mixtos. Fuentes: Cambridge Grammar
 * («Conditionals»: if, unless; «If I were you») y Oxford Learner's Grammar.
 *
 * Decisiones que fija el banco (y no el corrector):
 *  · en los ejercicios de COMPLETAR, el tiempo de la otra cláusula decide el tipo. Por eso en el
 *    tipo 0 el hueco va siempre en la cláusula con if: con «If you heat ice, it ___ (melt)» valdrían
 *    «melts» y «will melt», y el ejercicio sería ambiguo;
 *  · cuando la principal lleva otro modal (can, could, might), el paréntesis lo da explícito;
 *  · en el tipo 2 con I, he, she o it valen «were» y «was», con nota: en un examen se prefiere «were»;
 *  · las opciones del modo elegir están escritas a mano y solo una es correcta: se quitaron las
 *    que también valdrían con otra lectura (p. ej. «passes» en el 8, que sería un tipo 0).
 */

export type TipoCondicional = 0 | 1 | 2 | 3;
export type Clase = 'completar' | 'tipo';
/** En qué cláusula está el hueco: la de if/unless (condición) o la principal (resultado). */
export type Hueco = 'condicion' | 'resultado';

export const TIPOS: TipoCondicional[] = [0, 1, 2, 3];
export const CLASES: Clase[] = ['completar', 'tipo'];

interface EjercicioBase {
  /** Número estable que se ve en pantalla: un profesor asigna «haz el 3, el 7 y el 11». */
  numero: number;
  tipo: TipoCondicional;
  /** Verbo de la cláusula con if/unless en la frase CORRECTA, tal como va escrito. */
  condicion: string;
  /** Verbo de la cláusula principal en la frase correcta, tal como va escrito. */
  resultado: string;
  /** Aclaración que acompaña al veredicto (were/was). */
  nota?: string;
}

export interface EjercicioCompletar extends EjercicioBase {
  clase: 'completar';
  /** Texto antes del hueco, con su espacio final. */
  antes: string;
  /** Texto después del paréntesis del verbo. */
  despues: string;
  /** Lo que va entre paréntesis: el verbo, con «not» o el modal cuando hacen falta. */
  verbo: string;
  hueco: Hueco;
  /** Respuestas que valen, escritas a mano. La primera es la que se enseña. */
  admitidas: string[];
  /** Cuatro opciones del modo elegir: una sola correcta. */
  opciones: string[];
}

export interface EjercicioTipo extends EjercicioBase {
  clase: 'tipo';
  frase: string;
}

export type Ejercicio = EjercicioCompletar | EjercicioTipo;

const NOTA_WERE =
  'Con I, he, she o it, en el tipo 2 valen «were» y «was». En los exámenes y en el registro formal se prefiere «were».';
const NOTA_IF_I_WERE_YOU =
  `${NOTA_WERE} «If I were you» es además la fórmula fija para dar un consejo.`;

// ─── Banco ────────────────────────────────────────────────────────────────────

export const BANCO: Ejercicio[] = [
  // Tipo 0 — completar (el hueco, siempre en la cláusula con if/unless)
  { numero: 1, clase: 'completar', tipo: 0, hueco: 'condicion', antes: 'If you ', verbo: 'heat', despues: ' ice, it melts.', admitidas: ['heat'], opciones: ['heat', 'will heat', 'heated', 'would heat'], condicion: 'heat', resultado: 'melts' },
  { numero: 2, clase: 'completar', tipo: 0, hueco: 'condicion', antes: 'If water ', verbo: 'reach', despues: ' 100 °C at sea level, it boils.', admitidas: ['reaches'], opciones: ['reaches', 'will reach', 'reached', 'would reach'], condicion: 'reaches', resultado: 'boils' },
  { numero: 3, clase: 'completar', tipo: 0, hueco: 'condicion', antes: 'If you ', verbo: 'mix', despues: ' red and white paint, you get pink.', admitidas: ['mix'], opciones: ['mix', 'will mix', 'mixed', 'would mix'], condicion: 'mix', resultado: 'get' },
  { numero: 4, clase: 'completar', tipo: 0, hueco: 'condicion', antes: 'Plants die if they ', verbo: 'not / get', despues: ' enough water.', admitidas: ["don't get", 'do not get'], opciones: ["don't get", "won't get", "didn't get", "doesn't get"], condicion: "don't get", resultado: 'die' },
  { numero: 5, clase: 'completar', tipo: 0, hueco: 'condicion', antes: 'If people ', verbo: 'be', despues: ' tired, they make more mistakes.', admitidas: ['are'], opciones: ['are', 'will be', 'were', 'is'], condicion: 'are', resultado: 'make' },
  { numero: 6, clase: 'completar', tipo: 0, hueco: 'condicion', antes: 'Unless you ', verbo: 'press', despues: ' save, the changes are lost.', admitidas: ['press'], opciones: ['press', "don't press", 'will press', 'pressed'], condicion: 'press', resultado: 'are lost' },

  // Tipo 1 — completar
  { numero: 7, clase: 'completar', tipo: 1, hueco: 'condicion', antes: 'If it ', verbo: 'rain', despues: ' tomorrow, we will stay at home.', admitidas: ['rains'], opciones: ['rains', 'will rain', 'rained', 'would rain'], condicion: 'rains', resultado: 'will stay' },
  { numero: 8, clase: 'completar', tipo: 1, hueco: 'resultado', antes: 'If Maria studies hard, she ', verbo: 'pass', despues: ' the exam.', admitidas: ['will pass', "'ll pass"], opciones: ['will pass', 'would pass', 'passed', 'would have passed'], condicion: 'studies', resultado: 'will pass' },
  { numero: 9, clase: 'completar', tipo: 1, hueco: 'condicion', antes: 'If you ', verbo: 'not / hurry', despues: ', you will miss the bus.', admitidas: ["don't hurry", 'do not hurry'], opciones: ["don't hurry", "won't hurry", "didn't hurry", "wouldn't hurry"], condicion: "don't hurry", resultado: 'will miss' },
  { numero: 10, clase: 'completar', tipo: 1, hueco: 'resultado', antes: 'If we leave now, we ', verbo: 'not / be', despues: ' late.', admitidas: ["won't be", 'will not be'], opciones: ["won't be", "wouldn't be", "weren't", "wouldn't have been"], condicion: 'leave', resultado: "won't be" },
  { numero: 11, clase: 'completar', tipo: 1, hueco: 'resultado', antes: 'I ', verbo: 'call', despues: ' you if I hear any news.', admitidas: ['will call', "'ll call"], opciones: ['will call', 'would call', 'called', 'would have called'], condicion: 'hear', resultado: 'will call' },
  { numero: 12, clase: 'completar', tipo: 1, hueco: 'condicion', antes: 'If Tom ', verbo: 'miss', despues: ' the train, he will take a taxi.', admitidas: ['misses'], opciones: ['misses', 'will miss', 'missed', 'miss'], condicion: 'misses', resultado: 'will take' },
  { numero: 13, clase: 'completar', tipo: 1, hueco: 'condicion', antes: 'Unless you ', verbo: 'study', despues: ", you won't pass the test.", admitidas: ['study'], opciones: ['study', "don't study", 'will study', 'studied'], condicion: 'study', resultado: "won't pass" },
  { numero: 14, clase: 'completar', tipo: 1, hueco: 'condicion', antes: "You won't get a table unless you ", verbo: 'book', despues: ' in advance.', admitidas: ['book'], opciones: ['book', "don't book", 'will book', 'booked'], condicion: 'book', resultado: "won't get" },
  { numero: 15, clase: 'completar', tipo: 1, hueco: 'resultado', antes: "If you don't take an umbrella, you ", verbo: 'might / get', despues: ' wet.', admitidas: ['might get'], opciones: ['might get', 'might got', 'will might get', 'might have got'], condicion: "don't take", resultado: 'might get' },
  { numero: 16, clase: 'completar', tipo: 1, hueco: 'condicion', antes: 'If she ', verbo: 'feel', despues: ' better tomorrow, she will come to the party.', admitidas: ['feels'], opciones: ['feels', 'will feel', 'felt', 'would feel'], condicion: 'feels', resultado: 'will come' },

  // Tipo 2 — completar
  { numero: 17, clase: 'completar', tipo: 2, hueco: 'condicion', antes: 'If I ', verbo: 'have', despues: ' more free time, I would learn to play the guitar.', admitidas: ['had'], opciones: ['had', 'have', 'would have', 'had had'], condicion: 'had', resultado: 'would learn' },
  { numero: 18, clase: 'completar', tipo: 2, hueco: 'resultado', antes: 'If I had more money, I ', verbo: 'buy', despues: ' a new bike.', admitidas: ['would buy', "'d buy"], opciones: ['would buy', 'will buy', 'bought', 'would have bought'], condicion: 'had', resultado: 'would buy' },
  { numero: 19, clase: 'completar', tipo: 2, hueco: 'condicion', antes: 'If she ', verbo: 'live', despues: ' closer, we would see each other more often.', admitidas: ['lived'], opciones: ['lived', 'lives', 'would live', 'had lived'], condicion: 'lived', resultado: 'would see' },
  { numero: 20, clase: 'completar', tipo: 2, hueco: 'condicion', antes: 'If I ', verbo: 'be', despues: ' you, I would talk to the teacher.', admitidas: ['were', 'was'], opciones: ['were', 'am', 'would be', 'had been'], condicion: 'were', resultado: 'would talk', nota: NOTA_IF_I_WERE_YOU },
  { numero: 21, clase: 'completar', tipo: 2, hueco: 'condicion', antes: 'If it ', verbo: 'be', despues: ' warmer, we would eat outside.', admitidas: ['were', 'was'], opciones: ['were', 'is', 'will be', 'had been'], condicion: 'were', resultado: 'would eat', nota: NOTA_WERE },
  { numero: 22, clase: 'completar', tipo: 2, hueco: 'resultado', antes: 'If you won the lottery, what ', verbo: 'you / do', despues: '?', admitidas: ['would you do'], opciones: ['would you do', 'will you do', 'did you do', 'would you have done'], condicion: 'won', resultado: 'would you do' },
  { numero: 23, clase: 'completar', tipo: 2, hueco: 'resultado', antes: 'We ', verbo: 'not / need', despues: ' a car if we lived in the city.', admitidas: ["wouldn't need", 'would not need'], opciones: ["wouldn't need", "won't need", "don't need", "wouldn't have needed"], condicion: 'lived', resultado: "wouldn't need" },
  { numero: 24, clase: 'completar', tipo: 2, hueco: 'condicion', antes: 'If they ', verbo: 'not / work', despues: ' so much, they would spend more time with their family.', admitidas: ["didn't work", 'did not work'], opciones: ["didn't work", "don't work", "wouldn't work", "hadn't worked"], condicion: "didn't work", resultado: 'would spend' },
  { numero: 25, clase: 'completar', tipo: 2, hueco: 'resultado', antes: 'If I knew the answer, I ', verbo: 'could / help', despues: ' you.', admitidas: ['could help'], opciones: ['could help', 'can help', 'could helped', 'could have helped'], condicion: 'knew', resultado: 'could help' },
  { numero: 26, clase: 'completar', tipo: 2, hueco: 'condicion', antes: 'If Ahmed ', verbo: 'speak', despues: ' Japanese, he would apply for the job in Tokyo.', admitidas: ['spoke'], opciones: ['spoke', 'speaks', 'would speak', 'had spoken'], condicion: 'spoke', resultado: 'would apply' },

  // Tipo 3 — completar
  { numero: 27, clase: 'completar', tipo: 3, hueco: 'condicion', antes: 'If I ', verbo: 'know', despues: ' about the party, I would have gone.', admitidas: ['had known', "'d known"], opciones: ['had known', 'would have known', 'knew', 'have known'], condicion: 'had known', resultado: 'would have gone' },
  { numero: 28, clase: 'completar', tipo: 3, hueco: 'resultado', antes: 'If we had left earlier, we ', verbo: 'not / miss', despues: ' the flight.', admitidas: ["wouldn't have missed", 'would not have missed'], opciones: ["wouldn't have missed", "wouldn't miss", "won't miss", "hadn't missed"], condicion: 'had left', resultado: "wouldn't have missed" },
  { numero: 29, clase: 'completar', tipo: 3, hueco: 'condicion', antes: 'If she ', verbo: 'study', despues: ' harder, she would have passed the exam.', admitidas: ['had studied', "'d studied"], opciones: ['had studied', 'studied', 'would have studied', 'has studied'], condicion: 'had studied', resultado: 'would have passed' },
  { numero: 30, clase: 'completar', tipo: 3, hueco: 'resultado', antes: 'If you had told me, I ', verbo: 'help', despues: ' you.', admitidas: ['would have helped', "'d have helped", "would've helped"], opciones: ['would have helped', 'would help', 'will help', 'had helped'], condicion: 'had told', resultado: 'would have helped' },
  { numero: 31, clase: 'completar', tipo: 3, hueco: 'resultado', antes: 'They ', verbo: 'arrive', despues: ' on time if they had taken the earlier train.', admitidas: ['would have arrived', "'d have arrived", "would've arrived"], opciones: ['would have arrived', 'would arrive', 'had arrived', 'will arrive'], condicion: 'had taken', resultado: 'would have arrived' },
  { numero: 32, clase: 'completar', tipo: 3, hueco: 'condicion', antes: 'If it ', verbo: 'not / rain', despues: ', we would have played the final.', admitidas: ["hadn't rained", 'had not rained'], opciones: ["hadn't rained", "didn't rain", "wouldn't have rained", "doesn't rain"], condicion: "hadn't rained", resultado: 'would have played' },
  { numero: 33, clase: 'completar', tipo: 3, hueco: 'resultado', antes: 'If Lucas had remembered his keys, he ', verbo: 'could / open', despues: ' the door.', admitidas: ['could have opened', "could've opened"], opciones: ['could have opened', 'could open', 'could opened', 'can have opened'], condicion: 'had remembered', resultado: 'could have opened' },
  { numero: 34, clase: 'completar', tipo: 3, hueco: 'condicion', antes: 'If you ', verbo: 'ask', despues: ' me, I would have said yes.', admitidas: ['had asked', "'d asked"], opciones: ['had asked', 'asked', 'would have asked', 'have asked'], condicion: 'had asked', resultado: 'would have said' },

  // ¿Qué tipo es?
  { numero: 35, clase: 'tipo', tipo: 0, frase: 'If you freeze water, it turns into ice.', condicion: 'freeze', resultado: 'turns' },
  { numero: 36, clase: 'tipo', tipo: 1, frase: 'If I see Ana, I will give her your message.', condicion: 'see', resultado: 'will give' },
  { numero: 37, clase: 'tipo', tipo: 2, frase: 'If I won a scholarship, I would study in Canada.', condicion: 'won', resultado: 'would study' },
  { numero: 38, clase: 'tipo', tipo: 3, frase: 'If they had invited me, I would have gone to the wedding.', condicion: 'had invited', resultado: 'would have gone' },
  { numero: 39, clase: 'tipo', tipo: 1, frase: 'Unless it rains, we will have the picnic in the park.', condicion: 'rains', resultado: 'will have' },
  { numero: 40, clase: 'tipo', tipo: 0, frase: 'If babies are hungry, they cry.', condicion: 'are', resultado: 'cry' },
  { numero: 41, clase: 'tipo', tipo: 2, frase: 'She would be happier if she had a job she liked.', condicion: 'had', resultado: 'would be' },
  { numero: 42, clase: 'tipo', tipo: 3, frase: "We would have won the match if our goalkeeper hadn't been injured.", condicion: "hadn't been injured", resultado: 'would have won' },
  { numero: 43, clase: 'tipo', tipo: 1, frase: "If you don't water the plants, they will die.", condicion: "don't water", resultado: 'will die' },
  { numero: 44, clase: 'tipo', tipo: 2, frase: 'If I were taller, I would play basketball.', condicion: 'were', resultado: 'would play' },
  { numero: 45, clase: 'tipo', tipo: 0, frase: 'If you press this button, the machine stops.', condicion: 'press', resultado: 'stops' },
  { numero: 46, clase: 'tipo', tipo: 3, frase: "If he had saved some money, he wouldn't have needed a loan.", condicion: 'had saved', resultado: "wouldn't have needed" },
  { numero: 47, clase: 'tipo', tipo: 1, frase: "You'll feel better if you get some sleep.", condicion: 'get', resultado: "'ll feel" },
];

export const TOTAL_EJERCICIOS = BANCO.length;

// ─── Reglas ───────────────────────────────────────────────────────────────────

export interface Regla {
  /** Nombre en inglés, como lo dan los libros. */
  nombre: string;
  /** Estructura completa, para la tabla. */
  estructura: string;
  /** Tiempo de la cláusula con if. */
  condicion: string;
  /** Tiempo de la cláusula principal. */
  resultado: string;
  uso: string;
  ejemplo: string;
}

export const REGLAS: Record<TipoCondicional, Regla> = {
  0: {
    nombre: 'Zero conditional',
    estructura: 'If + present simple, present simple',
    condicion: 'present simple',
    resultado: 'present simple',
    uso: 'Verdades generales y hechos que se cumplen siempre: if equivale casi a when.',
    ejemplo: 'If you heat ice, it melts.',
  },
  1: {
    nombre: 'First conditional',
    estructura: 'If + present simple, will + infinitivo',
    condicion: 'present simple',
    resultado: 'will + infinitivo',
    uso: 'Situaciones reales o probables en el futuro y sus consecuencias.',
    ejemplo: 'If it rains tomorrow, we will stay at home.',
  },
  2: {
    nombre: 'Second conditional',
    estructura: 'If + past simple, would + infinitivo',
    condicion: 'past simple',
    resultado: 'would + infinitivo',
    uso: 'Situaciones hipotéticas o poco probables en el presente o el futuro.',
    ejemplo: 'If I had more time, I would learn Japanese.',
  },
  3: {
    nombre: 'Third conditional',
    estructura: 'If + past perfect, would have + participio',
    condicion: 'past perfect (had + participio)',
    resultado: 'would have + participio',
    uso: 'Situaciones irreales del pasado: lo que no pasó y lo que habría pasado.',
    ejemplo: 'If I had known, I would have come.',
  },
};

/** Cómo se nombra cada tipo en pantalla: «tipo 1 (first conditional)». */
export function nombreTipo(tipo: TipoCondicional): string {
  return `tipo ${tipo} (${REGLAS[tipo].nombre.toLowerCase()})`;
}

export const REGLA_UNLESS =
  'Unless significa «if… not»: «Unless you study» = «If you don\'t study». Tras unless el verbo va en afirmativa y sigue las reglas del tipo.';

// ─── Normalizar y clasificar ──────────────────────────────────────────────────

/**
 * Lo que un alumno escribe, en una forma comparable: minúsculas, apóstrofo tipográfico (’) como
 * recto ('), sin signos de puntuación ni espacios de más.
 */
export function normalizar(texto: string): string {
  return texto
    .normalize('NFKC')
    .replace(/[‘’ʼ`´]/g, "'")
    .toLowerCase()
    .replace(/[.,;:!?¡¿"«»]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const RE_TERCER_TIPO = /^(would|could|might)(n't| not)? have \S+|^(would|could|might)'ve \S+|^'d have \S+/;
const RE_MODAL_PASADO = /^(would|could)(n't| not)?\b|^'d \S+/;
const RE_FUTURO = /^(will|won't|can|can't|may)\b|^'ll \S+/;
const RE_PASADO_PERFECTO = /^(had|hadn't|'d)( not)? \S+/;
const RE_FUTURO_O_CONDICIONAL = /(^|\s)(will|won't|would|wouldn't)\b|'ll\b/;

/** ¿Está en pasado la forma de la cláusula con if? Solo hace falta para desempatar «might». */
function pareceEnPasado(forma: string): boolean {
  return /^(didn't|did not|were|was|had|hadn't)\b/.test(forma) || /^\S+ed\b/.test(forma);
}

/**
 * Tipo de condicional que forman los verbos de las dos cláusulas, o null si la combinación no es
 * ninguno de los cuatro (por ejemplo, will o would en la cláusula con if, o un past perfect con
 * una principal que no es would have).
 *
 * Decide la principal: would have → 3 · would/could → 2 · will/can/may → 1 · might, según la
 * condición · un presente → 0. La condición confirma: el 3 exige past perfect, y el past
 * perfect solo va con el 3.
 */
export function tipoDe(condicion: string, resultado: string): TipoCondicional | null {
  const c = normalizar(condicion);
  const r = normalizar(resultado);
  if (!c || !r || RE_FUTURO_O_CONDICIONAL.test(c)) return null;
  const pasadoPerfecto = RE_PASADO_PERFECTO.test(c);
  if (RE_TERCER_TIPO.test(r)) return pasadoPerfecto ? 3 : null;
  if (pasadoPerfecto) return null;
  if (RE_MODAL_PASADO.test(r)) return 2;
  if (RE_FUTURO.test(r)) return 1;
  if (/^might\b/.test(r)) return pareceEnPasado(c) ? 2 : 1;
  return 0;
}

// ─── Corregir y explicar ──────────────────────────────────────────────────────

export interface Correccion {
  correcta: boolean;
  /** Qué ha fallado, cuando el error es uno de los típicos; null si no se reconoce. */
  aviso: string | null;
}

/** «if» o «unless», según la frase. */
export function conectorDe(ej: Ejercicio): 'if' | 'unless' {
  const texto = ej.clase === 'completar' ? `${ej.antes} ${ej.despues}` : ej.frase;
  return /\bunless\b/i.test(texto) ? 'unless' : 'if';
}

/** La frase completa y correcta, con la primera respuesta admitida en el hueco. */
export function fraseCompleta(ej: Ejercicio): string {
  return ej.clase === 'completar' ? `${ej.antes}${ej.admitidas[0]}${ej.despues}` : ej.frase;
}

/** Lee «2», «tipo 2», «type 2», «second» o «second conditional». */
function leerTipo(respuesta: string): TipoCondicional | null {
  const r = normalizar(respuesta).replace(/ conditional$/, '').replace(/^(tipo|type) /, '');
  const nombres: Record<string, TipoCondicional> = { '0': 0, '1': 1, '2': 2, '3': 3, zero: 0, first: 1, second: 2, third: 3 };
  return Object.prototype.hasOwnProperty.call(nombres, r) ? nombres[r] : null;
}

/** Diagnóstico de los errores típicos al completar. */
function diagnosticar(ej: EjercicioCompletar, r: string): string | null {
  if (r === '') return 'No has escrito nada en el hueco.';
  const unless = conectorDe(ej) === 'unless';
  const conector = unless ? 'unless' : 'if';
  if (/\b(will|would|could|can|might) (can|could|will|would|might)\b/.test(r)) {
    return 'Dos modales no van seguidos: «will can» o «will might» no existen. Detrás de un modal va el infinitivo.';
  }
  if (/^(will|would|could|can|might|won't|wouldn't|couldn't)( not)? \S+ed$/.test(r)) {
    return 'Detrás de un modal (will, would, could, might) va el infinitivo, sin -ed.';
  }
  if (ej.hueco === 'condicion') {
    if (unless && /^(don't|doesn't|didn't|do not|does not|did not)\b/.test(r)) {
      return 'Unless ya significa «if… not»: el verbo va en afirmativa. «Unless you study» = «If you don\'t study».';
    }
    if (/(^|\s)(will|won't)\b|'ll\b/.test(r)) {
      return `Después de ${conector} no se usa will, aunque la acción sea futura: el futuro ya lo marca la otra cláusula.`;
    }
    if (/(^|\s)(would|wouldn't)\b|'d have\b/.test(r)) {
      return ej.tipo === 3
        ? 'En la cláusula con if del tipo 3 va had + participio (past perfect), nunca would have.'
        : `Después de ${conector} no se usa would: would va en la otra cláusula.`;
    }
    return null;
  }
  // Hueco en la principal
  if (ej.tipo === 1 && /^(would|wouldn't|'d)\b/.test(r)) {
    return 'Con present simple tras if, la principal lleva will: would es del tipo 2.';
  }
  if (ej.tipo === 2 && /^(will|won't)\b|^'ll\b/.test(r)) {
    return 'Con past simple tras if, la principal lleva would: will es del tipo 1.';
  }
  if (ej.tipo === 2 && /^(would|could|might)(n't| not)?( you)? have \S+$/.test(r)) {
    return 'would have + participio es del tipo 3, para el pasado. Con past simple tras if va would + infinitivo.';
  }
  if (ej.tipo === 3 && /^(will|won't)\b|^'ll\b/.test(r)) {
    return 'Con past perfect tras if, la principal lleva would have + participio: will es del tipo 1.';
  }
  if (ej.tipo === 3 && /^(would|could|might|wouldn't|couldn't)( not)? \S+$/.test(r) && !/ have$/.test(r)) {
    return 'En el tipo 3 la principal lleva would have + participio: would + infinitivo es del tipo 2.';
  }
  return null;
}

/**
 * Corrige una respuesta. En los de completar, vale cualquiera de las admitidas una vez
 * normalizadas (mayúsculas, espacios, punto final, apóstrofo tipográfico). En los de «¿qué
 * tipo es?», la respuesta es el número del tipo («2», «tipo 2», «second»).
 */
export function corregir(ej: Ejercicio, respuesta: string): Correccion {
  if (ej.clase === 'tipo') {
    const elegido = leerTipo(respuesta);
    if (elegido === ej.tipo) return { correcta: true, aviso: null };
    if (elegido === null) return { correcta: false, aviso: 'Elige uno de los cuatro tipos: 0, 1, 2 o 3.' };
    const regla = REGLAS[elegido];
    return {
      correcta: false,
      aviso: `Para ser ${nombreTipo(elegido)} haría falta ${regla.condicion} en la cláusula con if y ${regla.resultado} en la principal.`,
    };
  }
  const r = normalizar(respuesta);
  const correcta = ej.admitidas.some((a) => normalizar(a) === r);
  return { correcta, aviso: correcta ? null : diagnosticar(ej, r) };
}

/** Cómo se llama el tiempo de la forma de la principal, con el modal que lleve. */
function describirResultado(tipo: TipoCondicional, forma: string): string {
  const modal = normalizar(forma).match(/^(can|could|might|may)\b/)?.[1];
  if (tipo === 0) return REGLAS[0].resultado;
  if (tipo === 3) return modal ? `${modal} have + participio` : REGLAS[3].resultado;
  if (modal) return `${modal} + infinitivo`;
  return REGLAS[tipo].resultado;
}

/**
 * La regla aplicada a ESE ejercicio: qué cláusula decide el tipo, qué tiempo pide y por qué.
 */
export function explicar(ej: Ejercicio): string {
  const regla = REGLAS[ej.tipo];
  const conector = conectorDe(ej);
  const nombre = nombreTipo(ej.tipo);
  const res = describirResultado(ej.tipo, ej.resultado);
  const extraUnless = conector === 'unless' ? ` ${REGLA_UNLESS}` : '';
  if (ej.clase === 'tipo') {
    return `«${ej.condicion}» (${regla.condicion}) en la cláusula con ${conector} y «${ej.resultado}» (${res}) en la principal: ${nombre}. ${regla.uso}${extraUnless}`;
  }
  const respuesta = ej.admitidas[0];
  if (ej.hueco === 'condicion') {
    const prohibido = ej.tipo === 3 ? 'would have' : ej.tipo === 2 ? 'would' : 'will';
    return `La principal lleva «${ej.resultado}» (${res}), así que es ${nombre}: en la cláusula con ${conector} va el ${regla.condicion}, «${respuesta}». Después de ${conector} no se usa ${prohibido}. ${regla.uso}${extraUnless}`;
  }
  return `La cláusula con ${conector} lleva «${ej.condicion}» (${regla.condicion}), así que es ${nombre}: en la principal va ${res}, «${respuesta}». ${regla.uso}${extraUnless}`;
}

// ─── Selección de ejercicios ──────────────────────────────────────────────────

export function porNumero(numero: number): Ejercicio | undefined {
  return BANCO.find((e) => e.numero === numero);
}

/** Ejercicios de los tipos y clases elegidos, en el orden del banco. */
export function filtrar(tipos: TipoCondicional[], clases: Clase[]): Ejercicio[] {
  return BANCO.filter((e) => tipos.includes(e.tipo) && clases.includes(e.clase));
}

export type SeleccionNumeros = { ok: true; numeros: number[] } | { ok: false; error: string };

/**
 * Lee «3, 7, 11», «5-9» o una mezcla («1-3, 8»), con comas, espacios o punto y coma. Devuelve los
 * números en el orden escrito, sin repetir, o el primer error que encuentre.
 */
export function parsearNumeros(texto: string, total: number = TOTAL_EJERCICIOS): SeleccionNumeros {
  const trozos = texto.replace(/[–—]/g, '-').replace(/\s*-\s*/g, '-').split(/[\s,;]+/).filter(Boolean);
  if (trozos.length === 0) {
    return { ok: false, error: 'Escribe al menos un número de ejercicio, por ejemplo «3, 7, 11» o «5-9».' };
  }
  const numeros: number[] = [];
  const fuera = (n: number) => `No hay ejercicio ${n}: los números van del 1 al ${total}.`;
  for (const trozo of trozos) {
    const rango = trozo.match(/^(\d+)-(\d+)$/);
    if (rango) {
      const desde = Number(rango[1]);
      const hasta = Number(rango[2]);
      if (desde > hasta) return { ok: false, error: `El intervalo «${trozo}» va al revés: escribe ${hasta}-${desde}.` };
      for (const n of [desde, hasta]) if (n < 1 || n > total) return { ok: false, error: fuera(n) };
      for (let n = desde; n <= hasta; n++) if (!numeros.includes(n)) numeros.push(n);
      continue;
    }
    if (!/^\d+$/.test(trozo)) return { ok: false, error: `«${trozo}» no es un número de ejercicio.` };
    const n = Number(trozo);
    if (n < 1 || n > total) return { ok: false, error: fuera(n) };
    if (!numeros.includes(n)) numeros.push(n);
  }
  return { ok: true, numeros };
}
