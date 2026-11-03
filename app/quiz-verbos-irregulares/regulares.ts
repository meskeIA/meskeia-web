/**
 * Motor de la práctica de VERBOS REGULARES de quiz-verbos-irregulares (S0246): cómo se escribe el
 * pasado en -ed y cómo suena esa -ed.
 *
 * Sin React ni navegador: lo prueban los casos resueltos a mano de
 * `tests/verbos-regulares-motor.spec.ts` (en `npm run test:calc`).
 *
 * Por qué existe. La app recibe en Google búsquedas genéricas —«examen de verbos en inglés»,
 * «quiz de verbos en inglés», «test de verbos en inglés», unas 500 impresiones en 90 días— en
 * posición 6-7, frente a la 3 de las que dicen «irregulares». Y el quiz deja fuera a propósito los
 * regulares. Lo que un examen de secundaria pregunta de ellos es justo lo que aquí se corrige:
 * escribir bien el pasado (studied, stopped, travelled) y decir si la -ed suena /t/, /d/ o /ɪd/.
 *
 * Las dos cosas son reglas, no listas que memorizar:
 *  · la ORTOGRAFÍA depende de las letras finales y de si la última sílaba es tónica. La tonicidad
 *    no se deduce de la grafía (vísit / admít), así que cada verbo del banco la lleva escrita;
 *  · la PRONUNCIACIÓN depende del último SONIDO, no de la última letra: «laugh» acaba en /f/ y
 *    «close» (cerrar) en /z/. Por eso cada verbo lleva su sonido final tomado del diccionario, y la
 *    regla lo clasifica.
 *
 * Fuentes: Cambridge Dictionary y Oxford Learner's Dictionaries (transcripción de cada verbo y
 * formas travelled/traveled, cancelled/canceled); Cambridge Grammar, «Past simple: regular verbs»
 * (reglas de ortografía y de pronunciación del -ed).
 */
import { esFormaCorrecta } from './motor';

/** Cómo suena la -ed: /t/, /d/ o /ɪd/ (una sílaba más). */
export type Terminacion = 't' | 'd' | 'id';

export const TERMINACIONES: Terminacion[] = ['t', 'd', 'id'];

/** Cómo se escribe la terminación en el alfabeto fonético, para pintarla. */
export const IPA_TERMINACION: Record<Terminacion, string> = { t: '/t/', d: '/d/', id: '/ɪd/' };

/** Regla de ortografía que produce el pasado. */
export type ReglaOrtografia =
  | 'e'            // like → liked
  | 'consonante-y' // study → studied
  | 'vocal-y'      // play → played
  | 'duplica'      // stop → stopped, prefer → preferred
  | 'l-britanica'  // travel → travelled (UK) / traveled (US)
  | 'atona'        // visit → visited: CVC, pero la última sílaba no es tónica
  | 'wx'           // fix → fixed: la w y la x no se doblan nunca
  | 'general';     // work → worked

export interface VerboRegular {
  infinitivo: string;
  espanol: string;
  /** Último sonido del infinitivo, en AFI (el de los diccionarios). */
  sonidoFinal: string;
  /** ¿Es tónica la última sílaba? Los monosílabos, siempre. Solo decide en los CVC. */
  ultimaTonica: boolean;
}

const VOCALES = new Set(['a', 'e', 'i', 'o', 'u']);
const esVocal = (c: string | undefined) => c !== undefined && VOCALES.has(c);

/** Sonidos SORDOS (sin vibración de las cuerdas vocales) tras los que la -ed suena /t/. */
const SORDOS = new Set(['p', 'k', 'f', 'θ', 's', 'ʃ', 'tʃ']);

/**
 * Regla de ortografía de un verbo. Orden de las comprobaciones:
 *  1. termina en -e → solo -d;
 *  2. termina en y → depende de la letra anterior;
 *  3. consonante + vocal + consonante (una sola vocal escrita) → se dobla si la última sílaba es
 *     tónica; si es átona, solo el británico dobla la l; la w y la x no se doblan nunca;
 *  4. lo demás → -ed.
 */
export function reglaOrtografia(v: VerboRegular): ReglaOrtografia {
  const p = v.infinitivo;
  const ultima = p.at(-1);
  const penultima = p.at(-2);
  const antepenultima = p.at(-3);
  if (ultima === 'e') return 'e';
  if (ultima === 'y') return esVocal(penultima) ? 'vocal-y' : 'consonante-y';
  const cvc = ultima !== undefined && !esVocal(ultima) && esVocal(penultima) && !esVocal(antepenultima) && antepenultima !== undefined;
  if (cvc) {
    if (ultima === 'w' || ultima === 'x') return 'wx';
    if (v.ultimaTonica) return 'duplica';
    if (ultima === 'l') return 'l-britanica';
    return 'atona';
  }
  return 'general';
}

/**
 * Pasados que se dan por buenos. El primero es el que se enseña; con la l británica van los dos,
 * y el británico primero porque es la norma de los libros de texto de España.
 */
export function pasadosRegulares(v: VerboRegular): string[] {
  const p = v.infinitivo;
  switch (reglaOrtografia(v)) {
    case 'e': return [`${p}d`];
    case 'consonante-y': return [`${p.slice(0, -1)}ied`];
    case 'duplica': return [`${p}${p.at(-1)}ed`];
    case 'l-britanica': return [`${p}led`, `${p}ed`];
    case 'vocal-y':
    case 'atona':
    case 'wx':
    case 'general':
      return [`${p}ed`];
  }
}

/** Cómo suena la -ed según el último sonido del infinitivo. */
export function terminacionDe(v: VerboRegular): Terminacion {
  if (v.sonidoFinal === 't' || v.sonidoFinal === 'd') return 'id';
  return SORDOS.has(v.sonidoFinal) ? 't' : 'd';
}

/** ¿Está bien escrito el pasado? Admite mayúsculas, espacios y el punto final, como el modo escribir. */
export function pasadoRegularCorrecto(v: VerboRegular, escrito: string): boolean {
  return esFormaCorrecta(escrito, pasadosRegulares(v));
}

/** Explicación de la regla de ortografía, en una frase, con el verbo de la pregunta. */
export function explicarOrtografia(v: VerboRegular): string {
  const [pasado, variante] = pasadosRegulares(v);
  const p = v.infinitivo;
  switch (reglaOrtografia(v)) {
    case 'e':
      return `«${p}» termina en -e: solo se añade -d (${pasado}).`;
    case 'consonante-y':
      return `«${p}» termina en consonante + y: la y pasa a i y se añade -ed (${pasado}).`;
    case 'vocal-y':
      return `«${p}» termina en vocal + y: la y se queda y se añade -ed (${pasado}).`;
    case 'duplica':
      return `«${p}» termina en consonante + vocal + consonante y la última sílaba es tónica: se dobla la consonante final (${pasado}).`;
    case 'l-britanica':
      return `«${p}» termina en vocal + l en sílaba átona: el inglés británico dobla la l (${pasado}) y el americano no (${variante}). Valen las dos.`;
    case 'atona':
      return `«${p}» termina en consonante + vocal + consonante, pero la última sílaba es átona: no se dobla (${pasado}).`;
    case 'wx':
      return `«${p}» termina en ${p.at(-1)}, que no se dobla nunca: solo se añade -ed (${pasado}).`;
    case 'general':
      return `Regla general: se añade -ed (${pasado}).`;
  }
}

/** Explicación de la pronunciación, con el sonido final del verbo de la pregunta. */
export function explicarPronunciacion(v: VerboRegular): string {
  const sonido = `/${v.sonidoFinal}/`;
  switch (terminacionDe(v)) {
    case 'id':
      return `«${v.infinitivo}» termina en el sonido ${sonido}: tras /t/ o /d/ la -ed se pronuncia /ɪd/ y añade una sílaba.`;
    case 't':
      return `«${v.infinitivo}» termina en el sonido ${sonido}, que es sordo (las cuerdas vocales no vibran): la -ed suena /t/.`;
    case 'd':
      return `«${v.infinitivo}» termina en el sonido ${sonido}, que es sonoro (las cuerdas vocales vibran): la -ed suena /d/.`;
  }
}

/**
 * Banco de verbos regulares de uso escolar (A1-B1). Ninguno está en el banco de irregulares, y se
 * han dejado fuera los que tienen pasado irregular en alguna variedad (learn/learnt, burn/burnt,
 * dream/dreamt, spell/spelt) y «use», cuyo «used to» suena /juːst/ y contradice la regla.
 * Sonido final: transcripción de Cambridge y Oxford; en los acabados en -r se anota el británico
 * (/ə/, sin r), que es vocal y suena igual de sonoro que el americano con /r/.
 */
export const VERBOS_REGULARES: VerboRegular[] = [
  // ── La -ed suena /t/: sonido final sordo ──
  { infinitivo: 'work',     espanol: 'trabajar',                 sonidoFinal: 'k',  ultimaTonica: true },
  { infinitivo: 'walk',     espanol: 'caminar',                  sonidoFinal: 'k',  ultimaTonica: true },
  { infinitivo: 'look',     espanol: 'mirar',                    sonidoFinal: 'k',  ultimaTonica: true },
  { infinitivo: 'talk',     espanol: 'hablar, conversar',        sonidoFinal: 'k',  ultimaTonica: true },
  { infinitivo: 'cook',     espanol: 'cocinar',                  sonidoFinal: 'k',  ultimaTonica: true },
  { infinitivo: 'like',     espanol: 'gustar',                   sonidoFinal: 'k',  ultimaTonica: true },
  { infinitivo: 'ask',      espanol: 'preguntar, pedir',         sonidoFinal: 'k',  ultimaTonica: true },
  { infinitivo: 'help',     espanol: 'ayudar',                   sonidoFinal: 'p',  ultimaTonica: true },
  { infinitivo: 'hope',     espanol: 'esperar (tener esperanza)', sonidoFinal: 'p', ultimaTonica: true },
  { infinitivo: 'stop',     espanol: 'parar',                    sonidoFinal: 'p',  ultimaTonica: true },
  { infinitivo: 'drop',     espanol: 'dejar caer',               sonidoFinal: 'p',  ultimaTonica: true },
  { infinitivo: 'shop',     espanol: 'ir de compras',            sonidoFinal: 'p',  ultimaTonica: true },
  { infinitivo: 'jump',     espanol: 'saltar',                   sonidoFinal: 'p',  ultimaTonica: true },
  { infinitivo: 'laugh',    espanol: 'reír',                     sonidoFinal: 'f',  ultimaTonica: true },
  { infinitivo: 'cough',    espanol: 'toser',                    sonidoFinal: 'f',  ultimaTonica: true },
  { infinitivo: 'kiss',     espanol: 'besar',                    sonidoFinal: 's',  ultimaTonica: true },
  { infinitivo: 'miss',     espanol: 'echar de menos; perder (un tren)', sonidoFinal: 's', ultimaTonica: true },
  { infinitivo: 'dance',    espanol: 'bailar',                   sonidoFinal: 's',  ultimaTonica: true },
  { infinitivo: 'fix',      espanol: 'arreglar',                 sonidoFinal: 's',  ultimaTonica: true },
  { infinitivo: 'mix',      espanol: 'mezclar',                  sonidoFinal: 's',  ultimaTonica: true },
  { infinitivo: 'relax',    espanol: 'relajarse',                sonidoFinal: 's',  ultimaTonica: true },
  { infinitivo: 'wash',     espanol: 'lavar',                    sonidoFinal: 'ʃ',  ultimaTonica: true },
  { infinitivo: 'finish',   espanol: 'terminar',                 sonidoFinal: 'ʃ',  ultimaTonica: false },
  { infinitivo: 'push',     espanol: 'empujar',                  sonidoFinal: 'ʃ',  ultimaTonica: true },
  { infinitivo: 'brush',    espanol: 'cepillar',                 sonidoFinal: 'ʃ',  ultimaTonica: true },
  { infinitivo: 'watch',    espanol: 'ver (la tele), observar',  sonidoFinal: 'tʃ', ultimaTonica: true },
  { infinitivo: 'touch',    espanol: 'tocar',                    sonidoFinal: 'tʃ', ultimaTonica: true },
  // ── La -ed suena /ɪd/: sonido final /t/ o /d/ ──
  { infinitivo: 'want',     espanol: 'querer',                   sonidoFinal: 't',  ultimaTonica: true },
  { infinitivo: 'start',    espanol: 'empezar',                  sonidoFinal: 't',  ultimaTonica: true },
  { infinitivo: 'visit',    espanol: 'visitar',                  sonidoFinal: 't',  ultimaTonica: false },
  { infinitivo: 'wait',     espanol: 'esperar (aguardar)',       sonidoFinal: 't',  ultimaTonica: true },
  { infinitivo: 'hate',     espanol: 'odiar',                    sonidoFinal: 't',  ultimaTonica: true },
  { infinitivo: 'invite',   espanol: 'invitar',                  sonidoFinal: 't',  ultimaTonica: true },
  { infinitivo: 'admit',    espanol: 'admitir',                  sonidoFinal: 't',  ultimaTonica: true },
  { infinitivo: 'chat',     espanol: 'charlar',                  sonidoFinal: 't',  ultimaTonica: true },
  { infinitivo: 'count',    espanol: 'contar (números)',         sonidoFinal: 't',  ultimaTonica: true },
  { infinitivo: 'need',     espanol: 'necesitar',                sonidoFinal: 'd',  ultimaTonica: true },
  { infinitivo: 'decide',   espanol: 'decidir',                  sonidoFinal: 'd',  ultimaTonica: true },
  { infinitivo: 'end',      espanol: 'acabar',                   sonidoFinal: 'd',  ultimaTonica: true },
  { infinitivo: 'add',      espanol: 'añadir, sumar',            sonidoFinal: 'd',  ultimaTonica: true },
  // ── La -ed suena /d/: sonido final sonoro (vocal o consonante sonora) ──
  { infinitivo: 'play',     espanol: 'jugar; tocar (música)',    sonidoFinal: 'eɪ', ultimaTonica: true },
  { infinitivo: 'stay',     espanol: 'quedarse',                 sonidoFinal: 'eɪ', ultimaTonica: true },
  { infinitivo: 'enjoy',    espanol: 'disfrutar',                sonidoFinal: 'ɔɪ', ultimaTonica: true },
  { infinitivo: 'study',    espanol: 'estudiar',                 sonidoFinal: 'i',  ultimaTonica: false },
  { infinitivo: 'carry',    espanol: 'llevar, cargar',           sonidoFinal: 'i',  ultimaTonica: false },
  { infinitivo: 'worry',    espanol: 'preocuparse',              sonidoFinal: 'i',  ultimaTonica: false },
  { infinitivo: 'try',      espanol: 'intentar, probar',         sonidoFinal: 'aɪ', ultimaTonica: true },
  { infinitivo: 'cry',      espanol: 'llorar',                   sonidoFinal: 'aɪ', ultimaTonica: true },
  { infinitivo: 'die',      espanol: 'morir',                    sonidoFinal: 'aɪ', ultimaTonica: true },
  { infinitivo: 'agree',    espanol: 'estar de acuerdo',         sonidoFinal: 'iː', ultimaTonica: true },
  { infinitivo: 'open',     espanol: 'abrir',                    sonidoFinal: 'n',  ultimaTonica: false },
  { infinitivo: 'listen',   espanol: 'escuchar',                 sonidoFinal: 'n',  ultimaTonica: false },
  { infinitivo: 'happen',   espanol: 'ocurrir, pasar',           sonidoFinal: 'n',  ultimaTonica: false },
  { infinitivo: 'clean',    espanol: 'limpiar',                  sonidoFinal: 'n',  ultimaTonica: true },
  { infinitivo: 'plan',     espanol: 'planear',                  sonidoFinal: 'n',  ultimaTonica: true },
  { infinitivo: 'live',     espanol: 'vivir',                    sonidoFinal: 'v',  ultimaTonica: true },
  { infinitivo: 'love',     espanol: 'querer, encantar',         sonidoFinal: 'v',  ultimaTonica: true },
  { infinitivo: 'arrive',   espanol: 'llegar',                   sonidoFinal: 'v',  ultimaTonica: true },
  { infinitivo: 'move',     espanol: 'mover; mudarse',           sonidoFinal: 'v',  ultimaTonica: true },
  { infinitivo: 'close',    espanol: 'cerrar',                   sonidoFinal: 'z',  ultimaTonica: true },
  { infinitivo: 'answer',   espanol: 'responder',                sonidoFinal: 'ə',  ultimaTonica: false },
  { infinitivo: 'remember', espanol: 'recordar',                 sonidoFinal: 'ə',  ultimaTonica: false },
  { infinitivo: 'offer',    espanol: 'ofrecer',                  sonidoFinal: 'ə',  ultimaTonica: false },
  { infinitivo: 'prefer',   espanol: 'preferir',                 sonidoFinal: 'ɜː', ultimaTonica: true },
  { infinitivo: 'call',     espanol: 'llamar',                   sonidoFinal: 'l',  ultimaTonica: true },
  { infinitivo: 'smile',    espanol: 'sonreír',                  sonidoFinal: 'l',  ultimaTonica: true },
  { infinitivo: 'travel',   espanol: 'viajar',                   sonidoFinal: 'l',  ultimaTonica: false },
  { infinitivo: 'cancel',   espanol: 'cancelar',                 sonidoFinal: 'l',  ultimaTonica: false },
  { infinitivo: 'control',  espanol: 'controlar',                sonidoFinal: 'l',  ultimaTonica: true },
  { infinitivo: 'climb',    espanol: 'escalar, trepar',          sonidoFinal: 'm',  ultimaTonica: true },
  { infinitivo: 'change',   espanol: 'cambiar',                  sonidoFinal: 'dʒ', ultimaTonica: true },
  { infinitivo: 'rob',      espanol: 'robar (a alguien)',        sonidoFinal: 'b',  ultimaTonica: true },
  { infinitivo: 'beg',      espanol: 'suplicar',                 sonidoFinal: 'g',  ultimaTonica: true },
  { infinitivo: 'hug',      espanol: 'abrazar',                  sonidoFinal: 'g',  ultimaTonica: true },
];
