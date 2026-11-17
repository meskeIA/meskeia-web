/**
 * Palabras agudas, llanas (graves), esdrújulas y sobresdrújulas — motor aparte y probado
 *
 * Vive fuera del componente porque el build compila la página sin comprobar si una regla de
 * acentuación está bien: eso solo lo ven los casos resueltos a mano de
 * `tests/apps/palabras-agudas-llanas-esdrujulas.spec.ts`.
 *
 * El silabeo NO se reescribe: se importa de `contador-silabas` (`silabeo.ts`, con su propia
 * batería en `tests/silabeo.spec.ts`), igual que hace `diccionario-rimas` con `indiceTonica`.
 * Una sola implementación para las tres apps.
 *
 * ── La trampa de diseño que resuelve la sílaba ELEGIDA ───────────────────────────────────
 * Sin tilde, la sílaba tónica solo se puede deducir SUPONIENDO que la palabra está bien
 * escrita: «arbol» sale aguda (acaba en l) y «sin tilde», que es justo la conclusión
 * circular que no sirve a quien pregunta. Sin un diccionario no hay otra forma de saber cómo
 * suena. Por eso `analizarPalabra` acepta la sílaba que el usuario dice oír más fuerte
 * (`indiceElegido`) y, a partir de ella, dice el tipo y CÓMO SE ESCRIBE: «árbol». Es además
 * como se enseña en clase: primero se localiza la tónica de oído, después se aplica la regla.
 *
 * Lo que SÍ se detecta sin ayuda es la tilde que SOBRA («relój», «cása», «fué»): la tilde fija
 * la tónica y la regla dice si debía estar.
 *
 * Normas aplicadas: Ortografía de la lengua española (RAE y ASALE, 2010), §§ 3.4.1 y ss.
 */

import { separarSilabas } from '../contador-silabas/silabeo';
import { indiceTonica } from '../contador-silabas/metrica';

export type TipoAcento = 'aguda' | 'llana' | 'esdrujula' | 'sobresdrujula' | 'monosilaba';

/** 'depende': la tilde diacrítica (tú/tu, qué/que) la decide el sentido, no la sílaba. */
export type Tilde = 'si' | 'no' | 'depende';

export interface AnalisisPalabra {
  /** La palabra tal y como se escribió (sin espacios alrededor, en NFC) */
  escrita: string;
  silabas: string[];
  /** Índice (desde el principio) de la sílaba tónica que se usa para clasificar */
  indiceTonica: number;
  /** La que se deduce de la escritura: la de la tilde o, sin ella, la de la regla general */
  indiceDeducido: number;
  /** El usuario eligió otra sílaba distinta de la deducida */
  tonicaElegida: boolean;
  /** La tónica viene fijada (ley del hiato o adverbio en -mente) y no se puede cambiar */
  tonicaFija: boolean;
  tipo: TipoAcento;
  tilde: Tilde;
  /** Por qué lleva o no lleva tilde, en una frase */
  regla: string;
  /** La palabra escrita según la tónica: con la tilde en su vocal o sin ninguna */
  formaCorrecta: string;
  /** escrita === formaCorrecta */
  bienEscrita: boolean;
  /** La palabra lleva una tilde que la regla no pide (o en otra vocal) */
  tildeQueSobra: boolean;
  /** Se aplicó la ley del hiato (dí-a, ba-úl, ma-íz) */
  hiato: boolean;
  adverbioMente: boolean;
  avisos: string[];
}

export const NOMBRE_TIPO: Record<TipoAcento, string> = {
  aguda: 'aguda',
  llana: 'llana (grave)',
  esdrujula: 'esdrújula',
  sobresdrujula: 'sobresdrújula',
  monosilaba: 'monosílaba',
};

export const NOMBRE_TIPO_PLURAL: Record<TipoAcento, string> = {
  aguda: 'Agudas',
  llana: 'Llanas (graves)',
  esdrujula: 'Esdrújulas',
  sobresdrujula: 'Sobresdrújulas',
  monosilaba: 'Monosílabas',
};

/**
 * Posición de la tónica contada desde el final, como se enseña, con su artículo: va detrás de
 * «en» o de una coma («Tónica en la última sílaba», ««dí», una sílaba anterior a…»).
 */
export const POSICION_TIPO: Record<TipoAcento, string> = {
  aguda: 'la última sílaba',
  llana: 'la penúltima sílaba',
  esdrujula: 'la antepenúltima sílaba',
  sobresdrujula: 'una sílaba anterior a la antepenúltima',
  monosilaba: 'su única sílaba',
};

const VOCALES = 'aeiouáéíóúü';
const ABIERTAS = 'aeoáéó';
const QUITAR_TILDE: Record<string, string> = {
  á: 'a', é: 'e', í: 'i', ó: 'o', ú: 'u',
  Á: 'A', É: 'E', Í: 'I', Ó: 'O', Ú: 'U',
};
const PONER_TILDE: Record<string, string> = {
  a: 'á', e: 'é', i: 'í', o: 'ó', u: 'ú',
  A: 'Á', E: 'É', I: 'Í', O: 'Ó', U: 'Ú',
};

const esVocal = (c: string) => c !== '' && VOCALES.includes(c.toLowerCase());
const tieneTilde = (s: string) => /[áéíóú]/i.test(s);

/** La palabra sin ninguna tilde (la diéresis se queda: no es una tilde). Misma longitud. */
export function sinTildes(palabra: string): string {
  return [...palabra].map((c) => QUITAR_TILDE[c] ?? c).join('');
}

/**
 * Monosílabos con tilde diacrítica: la llevan o no según lo que signifiquen, así que la regla
 * de la sílaba no decide. Clave: la forma sin tilde. (OLE 2010, § 3.4.3.)
 */
const DIACRITICOS_MONOSILABOS: Record<string, string> = {
  tu: 'tú (pronombre: «tú vienes») / tu (posesivo: «tu casa»)',
  el: 'él (pronombre: «él vino») / el (artículo: «el perro»)',
  mi: 'mí (pronombre: «para mí») / mi (posesivo o nota musical: «mi casa»)',
  si: 'sí (afirmación o pronombre: «sí, quiero») / si (condicional o nota: «si vienes»)',
  te: 'té (la bebida) / te (pronombre: «te llamo»)',
  de: 'dé (del verbo dar: «que me dé») / de (preposición: «de madera»)',
  se: 'sé (de saber o ser: «no sé») / se (pronombre: «se fue»)',
  mas: 'más (cantidad: «quiero más») / mas (equivale a «pero», uso literario)',
  que: 'qué (interrogativo o exclamativo: «¿qué quieres?») / que (relativo o conjunción)',
  quien: 'quién (interrogativo o exclamativo) / quien (relativo: «quien lo sepa»)',
  cual: 'cuál (interrogativo) / cual (relativo: «el cual»)',
  cuan: 'cuán (exclamativo) / cuan (comparativo, uso literario)',
};

/** Interrogativos y exclamativos de más de una sílaba: la tilde la decide el sentido. */
const INTERROGATIVOS: Record<string, string> = {
  como: 'cómo', donde: 'dónde', cuando: 'cuándo', adonde: 'adónde',
  cuanto: 'cuánto', cuanta: 'cuánta', cuantos: 'cuántos', cuantas: 'cuántas',
  quienes: 'quiénes', cuales: 'cuáles',
};

/**
 * Palabras en -mente que NO son adverbios: el falso adverbio daría una regla absurda («conserva
 * la tilde del adjetivo "de"»). Con una sílaba antes de -mente ya no entran (mente, demente,
 * clemente); estas tienen dos.
 */
const NO_ADVERBIOS_MENTE = new Set(['vehemente', 'inclemente', 'simiente']);

/**
 * La última letra a efectos de la regla, y si va detrás de otra consonante. La «y» final cuenta
 * como consonante (rey, virrey, jersey: agudas sin tilde; póney, yóquey: llanas con ella).
 */
function terminacion(palabra: string): { letra: string; trasConsonante: boolean } {
  const p = sinTildes(palabra.toLowerCase());
  const letra = p[p.length - 1] ?? '';
  const anterior = p[p.length - 2] ?? '';
  return { letra, trasConsonante: anterior !== '' && !VOCALES.includes(anterior) };
}

/** ¿Acaba «en vocal, n o s» a efectos de la tilde? (-n y -s tras consonante, no: robots, bíceps) */
function acabaEnVocalNoS(palabra: string): boolean {
  const { letra, trasConsonante } = terminacion(palabra);
  if ('aeiou'.includes(letra) && letra !== '') return true;
  if (letra === 'n' || letra === 's') return !trasConsonante;
  return false;
}

/** Cómo se nombra la terminación en la regla: «en vocal», «en n», «en l», «en s tras consonante» */
function nombreTerminacion(palabra: string): string {
  const { letra, trasConsonante } = terminacion(palabra);
  if ('aeiou'.includes(letra) && letra !== '') return 'en vocal';
  if ((letra === 'n' || letra === 's') && trasConsonante) return `en «${letra}» detrás de otra consonante`;
  return `en «${letra}»`;
}

/**
 * Ley del hiato: la sílaba tónica lleva una í o ú con tilde y a su lado (saltando la h) hay
 * otra vocal en la sílaba vecina. Solo se puede ver con la tilde ESCRITA: sin ella «dia» es una
 * sola sílaba y no hay hiato que separar.
 */
function esHiatoTonico(silabas: string[], indice: number): boolean {
  const s = silabas[indice];
  if (!/[íú]/i.test(s)) return false;
  const pos = s.search(/[íú]/i);
  const anteriorEnLaSilaba = s.slice(0, pos).replace(/h/gi, '');
  const posteriorEnLaSilaba = s.slice(pos + 1).replace(/h/gi, '');
  // Pegada a otra vocal de su sílaba no está en hiato (sería diptongo, y ahí la í no estaría)
  if (esVocal(anteriorEnLaSilaba.slice(-1)) || esVocal(posteriorEnLaSilaba.charAt(0))) return false;
  const previa = (silabas[indice - 1] ?? '').replace(/h+$/i, '');
  const siguiente = (silabas[indice + 1] ?? '').replace(/^h+/i, '');
  const tocaPrevia = anteriorEnLaSilaba === '' && esVocal(previa.slice(-1));
  const tocaSiguiente = posteriorEnLaSilaba === '' && esVocal(siguiente.charAt(0));
  return tocaPrevia || tocaSiguiente;
}

/**
 * En qué letra de la sílaba va la tilde (índice dentro de la sílaba), sobre la sílaba SIN
 * tildes. La abierta si la hay (can-ción, des-pués); con dos cerradas, la segunda (cuí-da-te,
 * lin-güís-ti-ca); con una, esa. La u muda de qu/gu queda descartada por la misma regla
 * (a-quí: la u y la i, la segunda). La «y» nunca lleva tilde.
 */
function vocalDeLaTilde(silabaSinTilde: string): number {
  const letras = [...silabaSinTilde];
  const abierta = letras.findIndex((c) => ABIERTAS.includes(c.toLowerCase()));
  if (abierta !== -1) return abierta;
  const cerradas: number[] = [];
  letras.forEach((c, i) => {
    if ('iuü'.includes(c.toLowerCase())) cerradas.push(i);
  });
  if (cerradas.length === 0) return -1;
  // La ü suena pero la tilde va en la otra (pin-güi-no no lleva; lin-güís-ti-ca, en la í)
  const candidatas = cerradas.filter((i) => letras[i].toLowerCase() !== 'ü');
  if (candidatas.length === 0) return -1;
  return candidatas[candidatas.length - 1];
}

function tipoDe(numSilabas: number, indice: number): TipoAcento {
  if (numSilabas <= 1) return 'monosilaba';
  const desdeElFinal = numSilabas - 1 - indice;
  if (desdeElFinal === 0) return 'aguda';
  if (desdeElFinal === 1) return 'llana';
  if (desdeElFinal === 2) return 'esdrujula';
  return 'sobresdrujula';
}

/** La regla general (sin hiato ni diacrítica) para un tipo y una palabra. */
function reglaGeneral(tipo: TipoAcento, palabra: string): { tilde: boolean; regla: string } {
  const fin = nombreTerminacion(palabra);
  switch (tipo) {
    case 'monosilaba':
      return { tilde: false, regla: 'Los monosílabos no llevan tilde (salvo la diacrítica: tú/tu, él/el, sí/si…).' };
    case 'aguda': {
      const lleva = acabaEnVocalNoS(palabra);
      return {
        tilde: lleva,
        regla: lleva
          ? `Aguda terminada ${fin}: lleva tilde. Las agudas la llevan cuando acaban en vocal, n o s.`
          : `Aguda terminada ${fin}: no lleva tilde. Las agudas solo la llevan cuando acaban en vocal, n o s.`,
      };
    }
    case 'llana': {
      const lleva = !acabaEnVocalNoS(palabra);
      return {
        tilde: lleva,
        regla: lleva
          ? `Llana (grave) terminada ${fin}: lleva tilde. Las llanas la llevan cuando NO acaban en vocal, n o s.`
          : `Llana (grave) terminada ${fin}: no lleva tilde. Las llanas solo la llevan cuando NO acaban en vocal, n o s.`,
      };
    }
    case 'esdrujula':
      return { tilde: true, regla: 'Esdrújula: lleva tilde siempre, acabe como acabe.' };
    case 'sobresdrujula':
      return { tilde: true, regla: 'Sobresdrújula: lleva tilde siempre.' };
  }
}

/** Escribe la palabra con la tilde en la sílaba `indice` (o sin ninguna) conservando mayúsculas. */
function escribirCon(silabas: string[], indice: number, conTilde: boolean, vocalFijada?: number): string {
  return silabas
    .map((s, i) => {
      const base = sinTildes(s);
      if (!conTilde || i !== indice) return base;
      const pos = vocalFijada ?? vocalDeLaTilde(base);
      if (pos < 0) return base;
      const letras = [...base];
      letras[pos] = PONER_TILDE[letras[pos]] ?? letras[pos];
      return letras.join('');
    })
    .join('');
}

const RE_UNA_PALABRA = /^\p{L}+$/u;

/**
 * Analiza una palabra.
 *
 * @param palabra       lo que escribió el usuario (una sola palabra)
 * @param indiceElegido la sílaba que suena más fuerte, si el usuario la ha tocado. Sin ella,
 *                      la que se deduce de la escritura.
 * @returns null si no es una palabra (vacío, números, varias palabras, sin vocales)
 */
export function analizarPalabra(palabra: string, indiceElegido?: number): AnalisisPalabra | null {
  const escrita = palabra.normalize('NFC').trim();
  if (!escrita || !RE_UNA_PALABRA.test(escrita)) return null;
  if (![...escrita].some((c) => esVocal(c) || c.toLowerCase() === 'y')) return null;

  const silabas = separarSilabas(escrita);
  if (silabas.length === 0 || silabas.join('') !== escrita) return null;

  const n = silabas.length;
  const minus = escrita.toLowerCase();
  const avisos: string[] = [];

  // ── Adverbios en -mente: llanos por -men-, con la tilde del adjetivo ─────────────────
  const raiz = escrita.slice(0, -5);
  const esAdverbio =
    /mente$/i.test(escrita) &&
    !NO_ADVERBIOS_MENTE.has(sinTildes(minus)) &&
    separarSilabas(raiz).length >= 2;
  if (esAdverbio) {
    const adjetivo = analizarPalabra(raiz);
    if (adjetivo) {
      const mente = escrita.slice(-5);
      const formaCorrecta = adjetivo.formaCorrecta + mente;
      const tilde: Tilde = adjetivo.tilde === 'si' ? 'si' : 'no';
      return {
        escrita,
        silabas,
        indiceTonica: n - 2,
        indiceDeducido: n - 2,
        tonicaElegida: false,
        tonicaFija: true,
        tipo: 'llana',
        tilde,
        regla:
          `Adverbio en -mente: se pronuncia con dos acentos y conserva la tilde del adjetivo del que viene. ` +
          `En «${adjetivo.formaCorrecta}»: ${adjetivo.regla}`,
        formaCorrecta,
        bienEscrita: formaCorrecta === escrita,
        tildeQueSobra: tieneTilde(escrita) && !tieneTilde(formaCorrecta),
        hiato: false,
        adverbioMente: true,
        avisos: ['Se clasifica como llana por la sílaba «men», que es la que suena más fuerte al final.'],
      };
    }
  }

  const indiceDeducido = n === 1 ? 0 : Math.min(n - 1, Math.max(0, indiceTonica(escrita, silabas)));

  // La ley del hiato fija la tónica: con la tilde en otra sílaba, la i o la u dejaría de
  // hacer hiato y la palabra cambiaría de sílabas (dí-a → «dia», una sola).
  const hiatoEscrito = n > 1 && esHiatoTonico(silabas, indiceDeducido) && tieneTilde(silabas[indiceDeducido]);
  const puedeElegir = !hiatoEscrito && n > 1;
  const elegidoValido =
    puedeElegir && indiceElegido !== undefined && Number.isInteger(indiceElegido) && indiceElegido >= 0 && indiceElegido < n;
  const indice = elegidoValido ? (indiceElegido as number) : indiceDeducido;
  const tipo = tipoDe(n, indice);
  const hiato = hiatoEscrito && indice === indiceDeducido;

  let tilde: Tilde;
  let regla: string;
  let formaCorrecta: string;

  const base = sinTildes(minus);

  if (n === 1 && DIACRITICOS_MONOSILABOS[base]) {
    tilde = 'depende';
    regla = `Monosílabo con tilde diacrítica: ${DIACRITICOS_MONOSILABOS[base]}.`;
    formaCorrecta = escrita;
  } else if (INTERROGATIVOS[base]) {
    tilde = 'depende';
    regla =
      `Lleva tilde diacrítica si es interrogativa o exclamativa (¿${INTERROGATIVOS[base]}…?, ¡${INTERROGATIVOS[base]}…!); ` +
      `si no, se escribe ${base}.`;
    formaCorrecta = escrita;
  } else if (hiato) {
    tilde = 'si';
    const general = reglaGeneral(tipo, escrita);
    regla =
      'Ley del hiato: la i o la u tónica junto a otra vocal lleva tilde siempre' +
      (general.tilde ? '.' : `, aunque como ${NOMBRE_TIPO[tipo]} terminada ${nombreTerminacion(escrita)} no la llevaría.`);
    const s = silabas[indice];
    formaCorrecta = escribirCon(silabas, indice, true, s.search(/[íú]/i));
  } else {
    const general = reglaGeneral(tipo, escrita);
    tilde = general.tilde ? 'si' : 'no';
    regla = general.regla;
    formaCorrecta = escribirCon(silabas, indice, general.tilde);
  }

  // Una forma corregida que cambia de sílabas delataría una tilde mal colocada por el motor
  if (separarSilabas(formaCorrecta).length !== n) {
    avisos.push('Con la tilde en esa sílaba la palabra se dividiría de otra manera: compruébalo en voz alta.');
  }

  if (n === 1 && tieneTilde(escrita) && tilde === 'no') {
    avisos.push(
      'Los monosílabos con diptongo se escriben sin tilde desde la Ortografía de 2010 (guion, truhan, fie, rio, fue, dio), aunque haya quien los pronuncie en dos sílabas.'
    );
  }
  if (base === 'solo') {
    avisos.push('«solo» se escribe sin tilde; desde 2023 la RAE la admite como opcional si hay riesgo de ambigüedad.');
  }
  if (base === 'aun') {
    avisos.push('«aún» (= todavía) tiene dos sílabas, a-ún, y lleva tilde; «aun» (= incluso) tiene una y no.');
  }
  if (!puedeElegir && hiatoEscrito) {
    avisos.push('La tilde sobre la i o la u marca un hiato y fija la sílaba tónica.');
  }

  const bienEscrita = formaCorrecta === escrita;
  // Solo con la tónica que dice la propia tilde: si el usuario elige otra sílaba, lo que cambia
  // es la palabra que quiere escribir, no una tilde que sobre.
  const tildeQueSobra = tilde !== 'depende' && !elegidoValido && tieneTilde(escrita) && !bienEscrita;

  return {
    escrita,
    silabas,
    indiceTonica: indice,
    indiceDeducido,
    tonicaElegida: elegidoValido && indice !== indiceDeducido,
    tonicaFija: !puedeElegir,
    tipo,
    tilde,
    regla,
    formaCorrecta,
    bienEscrita,
    tildeQueSobra,
    hiato,
    adverbioMente: false,
    avisos,
  };
}

// ─── Un texto entero ─────────────────────────────────────────────────────────────────

export interface PalabraDelTexto {
  /** Posición en el texto (para la key de React) */
  orden: number;
  analisis: AnalisisPalabra;
}

export interface AnalisisTexto {
  palabras: PalabraDelTexto[];
  recuento: Record<TipoAcento, number>;
  /** Palabras con una tilde que la regla no pide */
  tildesQueSobran: number;
  /** El texto tenía más palabras de las que se analizan */
  recortado: boolean;
}

export const MAX_PALABRAS_TEXTO = 400;

/**
 * Clasifica todas las palabras de un texto por cómo están ESCRITAS. Detecta las tildes que
 * sobran; las que faltan, no, porque sin tilde no hay forma de saber cómo suena la palabra.
 */
export function analizarTexto(texto: string): AnalisisTexto {
  const recuento: Record<TipoAcento, number> = {
    aguda: 0, llana: 0, esdrujula: 0, sobresdrujula: 0, monosilaba: 0,
  };
  const encontradas = texto.normalize('NFC').match(/\p{L}+/gu) ?? [];
  const recortado = encontradas.length > MAX_PALABRAS_TEXTO;
  const palabras: PalabraDelTexto[] = [];
  let tildesQueSobran = 0;

  encontradas.slice(0, MAX_PALABRAS_TEXTO).forEach((p, orden) => {
    const analisis = analizarPalabra(p);
    if (!analisis) return;
    recuento[analisis.tipo] += 1;
    if (analisis.tildeQueSobra) tildesQueSobran += 1;
    palabras.push({ orden, analisis });
  });

  return { palabras, recuento, tildesQueSobran, recortado };
}

export const TIPOS: readonly TipoAcento[] = ['aguda', 'llana', 'esdrujula', 'sobresdrujula', 'monosilaba'];
