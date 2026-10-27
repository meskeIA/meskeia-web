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

/** Verso compuesto (alejandrino 7 + 7, dodecasílabo 6 + 6): dónde va el corte y qué mide cada mitad */
export interface Cesura {
  /** Índice de la última palabra del primer hemistiquio */
  despuesDe: number;
  primero: number;
  segundo: number;
  /** Ajuste por el acento final del PRIMER hemistiquio (el del segundo es `ajuste`) */
  ajustePrimero: number;
  acentuacionPrimero: Acentuacion;
}

export interface AnalisisVerso {
  texto: string;
  palabras: { palabra: string; silabas: string[] }[];
  silabasFoneticas: number;
  sinalefas: Sinalefa[];
  /** Índice de la palabra que NO se funde con la última por caer ahí el acento final (dialefa) */
  dialefaFinal: number | null;
  /** Solo en los versos compuestos */
  cesura: Cesura | null;
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

/**
 * Qué cuenta como palabra: una racha de LETRAS, las que sean.
 *
 * Era `/[a-záéíóúüñ]+/gi`, una lista cerrada en la que no estaba la «ï» —la diéresis poética
 * se escribe exactamente así: vïuda, crïado, sïempre— ni la ç, la à, la è o la ã de un
 * nombre propio o una grafía antigua. Cualquier palabra que las llevara se partía en DOS
 * palabras inventadas: «la vïuda del rey» daba cinco tarjetas —«la», «v» (una «sílaba» sin
 * ninguna vocal), «uda», «del», «rey»— y con ellas un recuento de palabras y una media
 * falsos. No era la limitación declarada de «una sílaba de diferencia», sino inventar
 * palabras (hallazgo 703, 10/09/2026). `\p{L}` no deja fuera ninguna letra.
 */
const RE_PALABRAS = /\p{L}+/gu;

export const contarSilabasTexto = (
  texto: string
): { palabra: string; silabas: string[]; total: number }[] => {
  // Extraer solo palabras (ignorar números y símbolos)
  const palabras = texto.match(RE_PALABRAS) || [];

  return palabras.map((palabra) => {
    const silabas = separarSilabas(palabra);
    return { palabra, silabas, total: silabas.length };
  });
};

// ─── Escansión ───────────────────────────────────────────────────────────────

const VOCALES_METRICA = 'aeiouáéíóúü';
const esVocalMetrica = (c: string): boolean => VOCALES_METRICA.includes(c.toLowerCase());

/**
 * ¿La palabra termina en sonido vocálico que pueda fundirse con la vocal siguiente?
 *
 * ── La «y» final de diptongo ante vocal es CONSONANTE (hallazgo 3565, 27/10/2026) ─────
 * La «y» de «hoy», «voy», «estoy», «soy», «muy» o «rey» cierra un diptongo; ante la vocal
 * de la palabra siguiente pasa a [j] y abre la sílaba de esa vocal: ho-yes, vo-yen-tran-do,
 * es-to-ya, so-yun (Navarro Tomás, Manual de pronunciación española; Quilis, Métrica
 * española). No queda contacto vocálico, así que no hay sinalefa ni se ahorra sílaba. Antes
 * se fundía como una vocal más y el soneto de Lope «Un soneto me manda hacer Violante»
 * salía con tres decasílabos (vv. 6, 9 y 12). Siguen fundiendo la conjunción «y» —que va
 * sola, sin vocal delante en la palabra— y la «y» de un anglicismo tras consonante
 * («ferry»), que es núcleo de sílaba.
 *
 * ── La h final es MUDA (hallazgo 702, 10/09/2026) ────────────────────────────
 * Miraba el último CARÁCTER y veía una «h», mientras su hermana `empiezaPorVocal` sí la
 * saltaba: la misma regla de la OLE 2010 —«la h no representa hoy ningún sonido en
 * español»— aplicada por un solo lado. El universo práctico son las interjecciones (oh,
 * ah, eh), donde el poeta deshace a menudo la fusión; pero la app declara detectar «toda
 * sinalefa posible» y marcar «con pausa» las deshacibles, así que no verla siquiera le
 * quita al usuario la decisión. «oh alma mía» daba 5 sílabas y 0 sinalefas mientras «la
 * hoja alta», en la misma pantalla, fundía dos veces.
 */
const terminaEnVocal = (palabra: string): boolean => {
  const p = palabra.toLowerCase();
  if (!p) return false;
  const sinHFinal = p.replace(/h+$/, '');
  if (!sinHFinal) return false; // una palabra que solo es «h» no tiene sonido vocálico
  const ultima = sinHFinal[sinHFinal.length - 1];
  if (ultima === 'y') {
    const anterior = sinHFinal[sinHFinal.length - 2];
    // Tras vocal (hoy, voy, rey) es la [j] de la sílaba siguiente: no funde.
    return anterior === undefined || !esVocalMetrica(anterior);
  }
  return esVocalMetrica(ultima);
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
 * La «y» final de «hoy», «rey» o «muy» es otro caso, y no funde nunca ante vocal: pasa a
 * consonante de la sílaba siguiente («hoy es lunes» → ho-yes-lu-nes, 4). Ver `terminaEnVocal`.
 */
const esConjuncionY = (palabra: string): boolean => palabra.toLowerCase() === 'y';

/**
 * ¿Entre estas dos palabras hay algo que el extractor tiró y que sí se pronuncia?
 *
 * El extractor de palabras es `/[a-záéíóúüñ]+/gi`, así que una cifra —o una letra que no esté
 * en esa clase— desaparece del cómputo. Eso por sí solo es una limitación asumida (y avisada
 * en el bloque de limitaciones de la app), pero además dejaba CONTIGUAS dos palabras que en el
 * verso no se tocan: en «Tengo 20 años y 3 hijos» la app no se limitaba a ignorar el «20»,
 * AFIRMABA en pantalla el lazo «Tengo ⌣ años», una fusión que nadie pronuncia porque en medio
 * se dice «veinte» (hallazgo 660, 07/09/2026).
 *
 * La sinalefa exige contacto REAL entre la vocal final y la inicial. Solo pueden separarlas
 * espacios y signos de puntuación; en cuanto entre medias queda una letra o un dígito que no
 * se ha analizado, no hay contacto que valga.
 */
const hayTokenDescartado = (entreMedias: string): boolean => /[\p{L}\p{N}]/u.test(entreMedias);

/**
 * Clasifica la acentuación de la última palabra del verso, que determina
 * el ajuste métrico final (aguda +1 · llana ±0 · esdrújula −1).
 */
export const acentuacionDe = (palabra: string, silabas: string[]): Acentuacion => {
  const p = palabra.toLowerCase();
  // Los monosílabos se computan como agudos
  if (silabas.length <= 1) return 'aguda';

  // Si lleva tilde, la tilde manda: buscamos en qué sílaba cae
  // Con la /i: desde el hallazgo 616 las sílabas conservan las mayúsculas del original, y
  // «CIÉ» de «MURCIÉLAGO» no casaba con la clase en minúsculas, así que la palabra pasaba
  // por no tildada y se computaba como llana.
  const indiceTilde = silabas.findIndex((s) => /[áéíóú]/i.test(s));
  if (indiceTilde !== -1) {
    const desdeElFinal = silabas.length - 1 - indiceTilde;
    if (desdeElFinal === 0) return 'aguda';
    if (desdeElFinal === 1) return 'llana';
    return 'esdrujula';
  }

  /**
   * ── La «y» final tras CONSONANTE suena vocal (hallazgo 2463, 30/09/2026) ──────────────
   * La regla ortográfica de la tilde trata la «y» final como consonante, y así rey, virrey,
   * jersey, estoy o Uruguay son agudas sin tilde. Pero esa «y» va siempre tras VOCAL: cierra
   * un diptongo o triptongo. Tras consonante no hay ninguna palabra patrimonial; solo
   * anglicismos crudos (ferry, whisky, rugby, party) cuya «y» se pronuncia [i] como núcleo
   * de sílaba, y la palabra acaba en vocal a efectos de acento: sus formas adaptadas por la
   * RAE —ferri, güisqui, rugbi— se escriben sin tilde, o sea que son LLANAS. Antes se daban
   * por agudas y el verso sumaba +1: «cruzamos el mar en ferry» medía 9 y «…en ferri», 8.
   * La «y» tras vocal (hockey, jersey) sigue la regla escrita: sin léxico no hay manera de
   * separarlas. diccionario-rimas lo tapaba solo en su lado (`esAnglicismoEnY`); aquí lo
   * arregla para las dos apps, que comparten esta función.
   */
  if (/[^aeiouáéíóúüy]y$/.test(p)) return 'llana';

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

const ajusteDe = (acentuacion: Acentuacion): number =>
  acentuacion === 'aguda' ? 1 : acentuacion === 'esdrujula' ? -1 : 0;

/** Índice (desde el principio) de la sílaba tónica de una palabra. */
const indiceTonica = (palabra: string, silabas: string[]): number => {
  const indiceTilde = silabas.findIndex((s) => /[áéíóú]/i.test(s));
  if (indiceTilde !== -1) return indiceTilde;
  const acentuacion = acentuacionDe(palabra, silabas);
  return Math.max(0, silabas.length - 1 - (acentuacion === 'aguda' ? 0 : 1));
};

interface PalabraLocalizada {
  palabra: string;
  inicio: number;
  fin: number;
}

interface Tramo {
  silabasFoneticas: number;
  sinalefas: Sinalefa[];
  dialefaFinal: number | null;
  acentuacion: Acentuacion;
  ajuste: number;
  silabasMetricas: number;
}

/**
 * Escande las palabras [desde, hasta) como un verso independiente: un verso simple entero o
 * un hemistiquio de un verso compuesto. Los índices de las sinalefas son los del verso entero.
 *
 * `cierraVerso` dice si la última palabra del tramo lleva el acento FINAL del verso.
 */
function escandirTramo(
  linea: string,
  encontradas: PalabraLocalizada[],
  palabras: { palabra: string; silabas: string[] }[],
  desde: number,
  hasta: number,
  cierraVerso: boolean,
): Tramo {
  let silabasFoneticas = 0;
  for (let i = desde; i < hasta; i++) silabasFoneticas += palabras[i].silabas.length;

  const ultima = palabras[hasta - 1];

  /**
   * ── No hay sinalefa sobre la vocal del ACENTO FINAL (hallazgo 3566, 27/10/2026) ──────
   * Si la última palabra del verso empieza por su vocal tónica («hecho», «oro», «alma»),
   * esa vocal lleva el acento rítmico final y la métrica pide dialefa: «contad si son
   * catorce, y está | hecho» (Lope) es endecasílabo y «en su silla de | oro» (Darío) cierra
   * un alejandrino (Quilis, Métrica española; Navarro Tomás). Antes se fundían y los dos
   * versos perdían una sílaba. Solo se aplica al final del verso: dentro de un primer
   * hemistiquio el poeta funde a menudo («mi juventud, veinte‿años», Machado).
   */
  const ultimaEmpiezaTonica: boolean =
    cierraVerso && hasta - desde >= 2 && indiceTonica(ultima.palabra, ultima.silabas) === 0;

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
  let dialefaFinal: number | null = null;
  let veniaFundida: boolean = false; // ¿la palabra i se fundió ya con la i−1?
  for (let i = desde; i < hasta - 1; i++) {
    const actual = encontradas[i];
    const siguiente = encontradas[i + 1];
    const entreMedias = linea.slice(actual.fin, siguiente.inicio);
    const hayContacto: boolean =
      !hayTokenDescartado(entreMedias) &&
      !(esConjuncionY(actual.palabra) && veniaFundida) &&
      terminaEnVocal(actual.palabra) &&
      empiezaPorVocal(siguiente.palabra);
    const sobreElAcentoFinal = ultimaEmpiezaTonica && i + 1 === hasta - 1;
    const funde = hayContacto && !sobreElAcentoFinal;
    if (funde) {
      sinalefas.push({
        indice: i,
        texto: `${actual.palabra.slice(-1)}_${siguiente.palabra[0]}`,
        conPausa: /[,;:.…!?—)]/.test(entreMedias),
      });
    } else if (hayContacto) {
      dialefaFinal = i;
    }
    veniaFundida = funde;
  }

  const acentuacion = acentuacionDe(ultima.palabra, ultima.silabas);
  const ajuste = ajusteDe(acentuacion);

  return {
    silabasFoneticas,
    sinalefas,
    dialefaFinal,
    acentuacion,
    ajuste,
    silabasMetricas: Math.max(0, silabasFoneticas - sinalefas.length + ajuste),
  };
}

/**
 * ── Los versos compuestos se miden por hemistiquios (hallazgo 3569, 27/10/2026) ──────────
 * El alejandrino (7 + 7) y el dodecasílabo (6 + 6) son dos versos en uno: cada hemistiquio
 * lleva su propio ajuste por acento final y en la cesura no hay sinalefa (Quilis, Métrica
 * española). Medidos de una pieza, «—ya conocéis mi torpe | aliño indumentario—» (Machado)
 * daba 13, por la fusión «torpe‿aliño», y «diríase un trémolo | de liras eolias» (Darío),
 * también 13, sin el −1 del primer hemistiquio esdrújulo: dos «tridecasílabos» que no existen.
 *
 * Sin léxico no se sabe dónde quiso el poeta la cesura, así que se busca: solo en los versos
 * cuya cuenta simple está en la franja en la que un compuesto puede caer (un alejandrino da
 * de 12 a 15 contado de una pieza; un dodecasílabo, 12 o 13), y solo se acepta un corte entre
 * palabras que deje dos mitades IGUALES de 7 o de 6. Si hay corte de los dos tipos, el verso
 * es ambiguo y se queda con la cuenta simple. Un endecasílabo (11 de una pieza) no se toca.
 */
const FRANJA_COMPUESTO: { mitad: number; simples: number[] }[] = [
  { mitad: 7, simples: [12, 13, 14, 15] },
  { mitad: 6, simples: [12, 13] },
];

function buscarCesura(
  linea: string,
  encontradas: PalabraLocalizada[],
  palabras: { palabra: string; silabas: string[] }[],
  simple: number,
): { corte: number; primero: Tramo; segundo: Tramo } | null {
  const candidatos: { mitad: number; corte: number; primero: Tramo; segundo: Tramo; pausa: boolean }[] = [];
  for (const { mitad, simples } of FRANJA_COMPUESTO) {
    if (!simples.includes(simple)) continue;
    for (let corte = 1; corte < palabras.length; corte++) {
      const primero = escandirTramo(linea, encontradas, palabras, 0, corte, false);
      if (primero.silabasMetricas !== mitad) continue;
      const segundo = escandirTramo(linea, encontradas, palabras, corte, palabras.length, true);
      if (segundo.silabasMetricas !== mitad) continue;
      const entreMedias = linea.slice(encontradas[corte - 1].fin, encontradas[corte].inicio);
      candidatos.push({ mitad, corte, primero, segundo, pausa: /[,;:.…!?—)]/.test(entreMedias) });
    }
  }
  if (candidatos.length === 0) return null;
  if (new Set(candidatos.map((c) => c.mitad)).size > 1) return null; // ambiguo: 7 + 7 y 6 + 6
  // Varios cortes posibles: el que coincide con una pausa escrita, y si no, el primero
  const elegido = candidatos.find((c) => c.pausa) ?? candidatos[0];
  return { corte: elegido.corte, primero: elegido.primero, segundo: elegido.segundo };
}

/**
 * Escansión de un verso: sílabas fonéticas − sinalefas + ajuste por acento final; en los
 * compuestos, la suma de los dos hemistiquios. Devuelve null si la línea no contiene palabras.
 */
export const analizarVerso = (linea: string): AnalisisVerso | null => {
  const encontradas: PalabraLocalizada[] = Array.from(linea.matchAll(RE_PALABRAS)).map((m) => ({
    palabra: m[0],
    inicio: m.index,
    fin: m.index + m[0].length,
  }));
  if (encontradas.length === 0) return null;

  const palabras = encontradas.map((e) => ({ palabra: e.palabra, silabas: separarSilabas(e.palabra) }));
  const silabasFoneticas = palabras.reduce((acc, p) => acc + p.silabas.length, 0);

  const simple = escandirTramo(linea, encontradas, palabras, 0, palabras.length, true);
  const compuesto = buscarCesura(linea, encontradas, palabras, simple.silabasMetricas);

  const base = {
    texto: linea.trim(),
    palabras,
    silabasFoneticas,
  };

  if (compuesto) {
    const { corte, primero, segundo } = compuesto;
    const silabasMetricas = primero.silabasMetricas + segundo.silabasMetricas;
    return {
      ...base,
      sinalefas: [...primero.sinalefas, ...segundo.sinalefas],
      dialefaFinal: segundo.dialefaFinal,
      cesura: {
        despuesDe: corte - 1,
        primero: primero.silabasMetricas,
        segundo: segundo.silabasMetricas,
        ajustePrimero: primero.ajuste,
        acentuacionPrimero: primero.acentuacion,
      },
      acentuacion: segundo.acentuacion,
      ajuste: segundo.ajuste,
      silabasMetricas,
      nombre: nombreDelVerso(silabasMetricas),
      arte: 'mayor',
    };
  }

  return {
    ...base,
    sinalefas: simple.sinalefas,
    dialefaFinal: simple.dialefaFinal,
    cesura: null,
    acentuacion: simple.acentuacion,
    ajuste: simple.ajuste,
    silabasMetricas: simple.silabasMetricas,
    nombre: nombreDelVerso(simple.silabasMetricas),
    arte: simple.silabasMetricas >= 9 ? 'mayor' : 'menor',
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
