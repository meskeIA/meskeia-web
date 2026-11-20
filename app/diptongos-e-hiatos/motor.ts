/**
 * Diptongos, triptongos e hiatos — motor aparte y probado
 *
 * Vive fuera del componente porque el build compila la página sin comprobar si una regla
 * ortográfica está bien: eso solo lo ven los casos resueltos a mano de
 * `tests/apps/diptongos-e-hiatos.spec.ts`.
 *
 * El silabeo NO se reescribe: los encuentros y sus posiciones salen de `contador-silabas`
 * (`encuentrosConPosicion`, con su batería en `tests/silabeo.spec.ts`), igual que hacen
 * `palabras-agudas-llanas-esdrujulas` y `diccionario-rimas`. Aquí solo se les pone NOMBRE:
 * qué clase de diptongo o de hiato es cada uno y por qué.
 *
 * ── El convenio: la Ortografía de 2010, «a efectos ortográficos» ───────────────────────
 * Una cerrada átona junto a una abierta forma diptongo, aunque haya hablantes que la
 * pronuncien en dos sílabas (gui-on, pi-a-no, cru-el). La RAE lo fija así para que la tilde
 * no dependa de la pronunciación de cada uno, y la app lo sigue: separa «guion» en una sílaba.
 * Lo dice en la FAQ y en un aviso cuando la palabra es de las que la Ortografía cita.
 *
 * Normas aplicadas: Ortografía de la lengua española (RAE y ASALE, 2010), §§ 1.4 y 3.4.2.
 */

import { separarSilabas, encuentrosConPosicion } from '../contador-silabas/silabeo';

export type Familia = 'diptongo' | 'triptongo' | 'hiato';

export type TipoEncuentro =
  | 'diptongo-creciente'
  | 'diptongo-decreciente'
  | 'diptongo-homogeneo'
  | 'triptongo'
  | 'hiato-simple'
  | 'hiato-acentual';

export const TIPOS: readonly TipoEncuentro[] = [
  'diptongo-creciente',
  'diptongo-decreciente',
  'diptongo-homogeneo',
  'triptongo',
  'hiato-simple',
  'hiato-acentual',
];

export const FAMILIAS: readonly Familia[] = ['diptongo', 'triptongo', 'hiato'];

export const NOMBRE_TIPO: Record<TipoEncuentro, string> = {
  'diptongo-creciente': 'diptongo creciente',
  'diptongo-decreciente': 'diptongo decreciente',
  'diptongo-homogeneo': 'diptongo homogéneo',
  triptongo: 'triptongo',
  'hiato-simple': 'hiato simple',
  'hiato-acentual': 'hiato acentual',
};

export const NOMBRE_FAMILIA: Record<Familia, string> = {
  diptongo: 'diptongo',
  triptongo: 'triptongo',
  hiato: 'hiato',
};

export const FAMILIA_DE: Record<TipoEncuentro, Familia> = {
  'diptongo-creciente': 'diptongo',
  'diptongo-decreciente': 'diptongo',
  'diptongo-homogeneo': 'diptongo',
  triptongo: 'triptongo',
  'hiato-simple': 'hiato',
  'hiato-acentual': 'hiato',
};

export interface Encuentro {
  tipo: TipoEncuentro;
  familia: Familia;
  /** Las letras del encuentro tal como se escribieron, h incluida: «ahu», «ía», «uay» */
  texto: string;
  /** Posición en la palabra escrita: `escrita.slice(desde, hasta) === texto` */
  desde: number;
  hasta: number;
  /** Hay una h entre las vocales */
  conH: boolean;
  /** Por qué es lo que es, en una frase */
  regla: string;
}

export interface AnalisisPalabra {
  /** La palabra tal y como se escribió (sin espacios alrededor, en NFC) */
  escrita: string;
  silabas: string[];
  encuentros: Encuentro[];
  avisos: string[];
}

const ABIERTAS = 'aeoáéó';
const CERRADAS = 'iuyüíúï';
const CERRADAS_TONICAS = 'íú';

const esAbierta = (c: string) => c !== '' && ABIERTAS.includes(c);
const esCerrada = (c: string) => c !== '' && CERRADAS.includes(c);

/** Las vocales de un núcleo, sin la h: «ahu» → «au» */
const sinH = (s: string) => s.replace(/h/gi, '');

/** «la a», «la í»: la y semivocal se nombra como tal */
const nombreVocal = (c: string) => (c.toLowerCase() === 'y' ? 'la y (que suena i)' : `la «${c}»`);

/**
 * Las palabras que la Ortografía de 2010 (§ 3.4.2.1) cita como monosílabos a efectos
 * ortográficos, aunque muchos hablantes las digan en dos sílabas. Clave: sin tildes.
 */
const DIPTONGOS_ORTOGRAFICOS = new Set([
  'guion', 'guiones', 'truhan', 'ion', 'muon', 'pion', 'prion',
  'crie', 'crio', 'fie', 'fio', 'guie', 'guio', 'lie', 'lio', 'pie', 'pio', 'rio', 'hui', 'huis',
  'riais', 'criais', 'fiais', 'guiais', 'liais', 'piais',
]);

const QUITAR_TILDE: Record<string, string> = { á: 'a', é: 'e', í: 'i', ó: 'o', ú: 'u' };
const sinTildes = (s: string) => [...s].map((c) => QUITAR_TILDE[c] ?? c).join('');

function clasificar(clase: 'diptongo' | 'triptongo' | 'hiato', texto: string): { tipo: TipoEncuentro; regla: string } {
  const v = sinH(texto);
  const minus = v.toLowerCase();

  if (clase === 'triptongo') {
    return {
      tipo: 'triptongo',
      regla: `Triptongo: cerrada (${v[0]}) + abierta (${v[1]}) + cerrada (${v[2]}), las tres en la misma sílaba.`,
    };
  }

  if (clase === 'diptongo') {
    const [a, b] = [minus[0], minus[1]];
    if (esCerrada(a) && esAbierta(b)) {
      return {
        tipo: 'diptongo-creciente',
        regla: `Diptongo creciente: ${nombreVocal(v[0])}, cerrada, + ${nombreVocal(v[1])}, abierta, en la misma sílaba. La voz va de la vocal cerrada a la abierta.`,
      };
    }
    if (esAbierta(a) && esCerrada(b)) {
      return {
        tipo: 'diptongo-decreciente',
        regla: `Diptongo decreciente: ${nombreVocal(v[0])}, abierta, + ${nombreVocal(v[1])}, cerrada, en la misma sílaba. La voz va de la vocal abierta a la cerrada.`,
      };
    }
    const conTilde = CERRADAS_TONICAS.includes(a) || CERRADAS_TONICAS.includes(b);
    return {
      tipo: 'diptongo-homogeneo',
      regla:
        `Diptongo homogéneo: dos vocales cerradas distintas (${v[0]} + ${v[1]}) en la misma sílaba.` +
        (conTilde ? ' La tilde no las separa: entre dos cerradas distintas no hay hiato.' : ''),
    };
  }

  // Hiato: «a-í»
  const [x, y] = minus.split('-');
  const [vx, vy] = v.split('-');
  const tonicaCerrada = CERRADAS_TONICAS.includes(x) ? vx : CERRADAS_TONICAS.includes(y) ? vy : '';
  const abierta = esAbierta(x) ? vx : esAbierta(y) ? vy : '';
  if (tonicaCerrada && abierta) {
    return {
      tipo: 'hiato-acentual',
      regla: `Hiato acentual: ${nombreVocal(tonicaCerrada)}, cerrada y tónica, se separa de ${nombreVocal(abierta)}. Por eso lleva tilde siempre (ley del hiato), diga lo que diga la regla general.`,
    };
  }
  if (x === 'ï' || y === 'ï') {
    return {
      tipo: 'hiato-simple',
      regla: 'Hiato: la diéresis poética (ï) separa en dos sílabas unas vocales que normalmente irían juntas.',
    };
  }
  if (esAbierta(x) && esAbierta(y)) {
    return {
      tipo: 'hiato-simple',
      regla: `Hiato simple: dos vocales abiertas seguidas (${vx} + ${vy}) van siempre en sílabas distintas.`,
    };
  }
  return {
    tipo: 'hiato-simple',
    regla: `Hiato simple: dos vocales cerradas iguales (${vx} + ${vy}) van en sílabas distintas.`,
  };
}

const RE_UNA_PALABRA = /^\p{L}+$/u;
const VOCALES = 'aeiouáéíóúüïy';

/**
 * Analiza una palabra.
 *
 * @returns null si no es una palabra (vacío, números, varias palabras, sin vocales)
 */
export function analizarPalabra(palabra: string): AnalisisPalabra | null {
  const escrita = palabra.normalize('NFC').trim();
  if (!escrita || !RE_UNA_PALABRA.test(escrita)) return null;
  if (![...escrita.toLowerCase()].some((c) => VOCALES.includes(c))) return null;

  const silabas = separarSilabas(escrita);
  if (silabas.length === 0 || silabas.join('') !== escrita) return null;

  const encuentros: Encuentro[] = encuentrosConPosicion(escrita).map((e) => {
    const texto = escrita.slice(e.desde, e.hasta);
    const { tipo, regla } = clasificar(
      e.clase,
      e.clase === 'hiato' ? `${texto[0]}-${texto[texto.length - 1]}` : texto
    );
    return { tipo, familia: FAMILIA_DE[tipo], texto, desde: e.desde, hasta: e.hasta, conH: e.conH, regla };
  });

  const minus = escrita.toLowerCase();
  const avisos: string[] = [];

  if (encuentros.some((e) => e.conH)) {
    avisos.push('La h entre vocales no cuenta: no impide el diptongo (ahu-mar) ni el hiato (bú-ho).');
  }
  if (/[qg]u[eiéí]/.test(minus)) {
    avisos.push('En «que», «qui», «gue» y «gui» la u no suena: es parte de la consonante y no forma diptongo.');
  }
  if (minus.includes('ü')) {
    avisos.push('La diéresis (ü) indica que la u suena, así que forma diptongo con la vocal siguiente (pin-güi-no).');
  }
  if (encuentros.some((e) => e.familia !== 'hiato' && /y$/i.test(e.texto) && minus.endsWith(e.texto.toLowerCase()))) {
    avisos.push('La y al final de palabra suena como i y forma diptongo o triptongo con la vocal anterior (rey, hoy, buey).');
  }
  if (DIPTONGOS_ORTOGRAFICOS.has(sinTildes(minus))) {
    avisos.push(
      'A efectos ortográficos es un diptongo y la palabra tiene una sola sílaba (Ortografía de 2010), aunque haya quien la pronuncie en dos. Por eso se escribe sin tilde.'
    );
  }
  if (sinTildes(minus) === 'aun') {
    avisos.push('«aún» (= todavía) tiene hiato y dos sílabas, a-ún; «aun» (= incluso) tiene diptongo y una sola.');
  }

  return { escrita, silabas, encuentros, avisos };
}

// ─── Un texto entero ─────────────────────────────────────────────────────────────────

export interface PalabraDelTexto {
  /** Posición en el texto (para la key de React) */
  orden: number;
  analisis: AnalisisPalabra;
  /** Las familias que aparecen en la palabra, sin repetir y en orden fijo */
  familias: Familia[];
}

export interface AnalisisTexto {
  /** Solo las palabras con al menos un encuentro vocálico */
  palabras: PalabraDelTexto[];
  /** Cuántas palabras analizadas en total (con y sin encuentros) */
  totalPalabras: number;
  /** Palabras que contienen cada familia (una palabra puede contar en dos) */
  porFamilia: Record<Familia, number>;
  /** Encuentros de cada tipo, contando todos los de cada palabra */
  porTipo: Record<TipoEncuentro, number>;
  /** El texto tenía más palabras de las que se analizan */
  recortado: boolean;
}

export const MAX_PALABRAS_TEXTO = 400;

/** Busca diptongos, triptongos e hiatos en todas las palabras de un texto. */
export function analizarTexto(texto: string): AnalisisTexto {
  const porFamilia: Record<Familia, number> = { diptongo: 0, triptongo: 0, hiato: 0 };
  const porTipo = Object.fromEntries(TIPOS.map((t) => [t, 0])) as Record<TipoEncuentro, number>;
  const encontradas = texto.normalize('NFC').match(/\p{L}+/gu) ?? [];
  const recortado = encontradas.length > MAX_PALABRAS_TEXTO;
  const palabras: PalabraDelTexto[] = [];
  let totalPalabras = 0;

  encontradas.slice(0, MAX_PALABRAS_TEXTO).forEach((p, orden) => {
    const analisis = analizarPalabra(p);
    if (!analisis) return;
    totalPalabras += 1;
    if (analisis.encuentros.length === 0) return;
    const familias = FAMILIAS.filter((f) => analisis.encuentros.some((e) => e.familia === f));
    familias.forEach((f) => (porFamilia[f] += 1));
    analisis.encuentros.forEach((e) => (porTipo[e.tipo] += 1));
    palabras.push({ orden, analisis, familias });
  });

  return { palabras, totalPalabras, porFamilia, porTipo, recortado };
}
