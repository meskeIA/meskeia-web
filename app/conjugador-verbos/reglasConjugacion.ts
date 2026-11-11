/**
 * Reglas de conjugación para lo que NO está en la tabla de irregulares (11/11/2026).
 *
 * Hasta esta fecha, todo verbo fuera de los 66 de `verbosIrregulares.ts` se conjugaba pegando
 * raíz y desinencia: «buscé», «cogo», «envio» (hallazgo 4418), «volo», «manteno», «componido»
 * (4419), y cualquier palabra en -ar/-er salía conjugada, «mujer» incluida (4422). Aquí viven las
 * cuatro capas que lo sustituyen, en el orden en que se aplican:
 *
 *   1. DERIVADOS por prefijo de un irregular de la tabla (mantener ← tener, prever ← ver): se
 *      toma la forma de la base y se le antepone el prefijo, poniendo la tilde que pide la
 *      aguda resultante (ten → mantén, vio → previó).
 *   2. PATRONES de irregularidad sistemática, que la gramática describe por grupos: diptongación
 *      (e→ie, o→ue), cierre vocálico de los de -ir (e→i, o→u), -zc- (agradecer), -uy- (-uir),
 *      -duje (-ducir) y la tilde del hiato (envío, actúo, reúno).
 *   3. ORTOGRAFÍA de los regulares: c→qu, g→gu, z→c y gu→gü ante e; c→z, g→j, gu→g y qu→c ante
 *      a/o; i átona entre vocales → y (leyó); i tónica tras vocal con tilde (leíste); la i que
 *      se funde tras ñ o ll (tiñó). Con esto un verbo regular sale bien sin estar en ninguna lista.
 *   4. Monosílabos de la Ortografía de 2010 sin tilde (crie, guio, fiais).
 *
 * Las listas de patrones recogen los verbos de uso corriente; un verbo raro que diptongue y no esté
 * en ellas saldría como regular. Por eso la app NO dice que conjuga «cualquier verbo» sin más: dice
 * con qué modelo ha conjugado cada uno (nota bajo la cabecera).
 */

import { verbosIrregulares, type ConjugacionCompleta } from './verbosIrregulares';

type Conjugacion = 'ar' | 'er' | 'ir';
type CambioRaiz = 'ie' | 'ue' | 'ie-i' | 'ue-u' | 'i' | 'i-ie';

// Desinencias regulares de los tiempos simples.
const DESINENCIAS: Record<Conjugacion, {
  presente: string[];
  indefinido: string[];
  imperfecto: string[];
  subjPresente: string[];
  subjImperfecto: string[];
  gerundio: string;
  participio: string;
}> = {
  ar: {
    presente: ['o', 'as', 'a', 'amos', 'áis', 'an'],
    indefinido: ['é', 'aste', 'ó', 'amos', 'asteis', 'aron'],
    imperfecto: ['aba', 'abas', 'aba', 'ábamos', 'abais', 'aban'],
    subjPresente: ['e', 'es', 'e', 'emos', 'éis', 'en'],
    subjImperfecto: ['ara', 'aras', 'ara', 'áramos', 'arais', 'aran'],
    gerundio: 'ando',
    participio: 'ado',
  },
  er: {
    presente: ['o', 'es', 'e', 'emos', 'éis', 'en'],
    indefinido: ['í', 'iste', 'ió', 'imos', 'isteis', 'ieron'],
    imperfecto: ['ía', 'ías', 'ía', 'íamos', 'íais', 'ían'],
    subjPresente: ['a', 'as', 'a', 'amos', 'áis', 'an'],
    subjImperfecto: ['iera', 'ieras', 'iera', 'iéramos', 'ierais', 'ieran'],
    gerundio: 'iendo',
    participio: 'ido',
  },
  ir: {
    presente: ['o', 'es', 'e', 'imos', 'ís', 'en'],
    indefinido: ['í', 'iste', 'ió', 'imos', 'isteis', 'ieron'],
    imperfecto: ['ía', 'ías', 'ía', 'íamos', 'íais', 'ían'],
    subjPresente: ['a', 'as', 'a', 'amos', 'áis', 'an'],
    subjImperfecto: ['iera', 'ieras', 'iera', 'iéramos', 'ierais', 'ieran'],
    gerundio: 'iendo',
    participio: 'ido',
  },
};
const FUTURO = ['é', 'ás', 'á', 'emos', 'éis', 'án'];
const CONDICIONAL = ['ía', 'ías', 'ía', 'íamos', 'íais', 'ían'];

// ───────────────────────────── Listas de patrones ─────────────────────────────

/** e→ie en las formas tónicas (pienso, piense). -ar y -er. */
const DIPTONGO_IE = new Set([
  'acertar', 'alentar', 'apretar', 'arrendar', 'atravesar', 'calentar', 'cegar', 'concertar',
  'confesar', 'desconcertar', 'despertar', 'desplegar', 'encerrar', 'enmendar', 'errar', 'fregar',
  'gobernar', 'helar', 'manifestar', 'merendar', 'negar', 'nevar', 'plegar', 'quebrar',
  'recomendar', 'regar', 'renegar', 'reventar', 'segar', 'sembrar', 'sentar', 'serrar', 'sosegar',
  'temblar', 'tentar', 'tropezar', 'repensar', 'desterrar', 'enterrar', 'aterrar', 'emparentar',
  'ascender', 'atender', 'condescender', 'contender', 'defender', 'desatender', 'descender',
  'encender', 'extender', 'heder', 'tender', 'trascender', 'verter', 'sobrentender', 'malentender',
]);

/** o→ue en las formas tónicas (vuelo, vuele). -ar y -er. */
const DIPTONGO_UE = new Set([
  'acordar', 'acostar', 'almorzar', 'apostar', 'aprobar', 'avergonzar', 'colar', 'colgar',
  'comprobar', 'consolar', 'costar', 'degollar', 'demostrar', 'descontar', 'desollar', 'esforzar',
  'forzar', 'poblar', 'recontar', 'reforzar', 'renovar', 'reprobar', 'resonar', 'rodar', 'rogar',
  'soltar', 'sonar', 'soñar', 'tostar', 'trocar', 'tronar', 'volar', 'volcar', 'reencontrar',
  'absolver', 'cocer', 'conmover', 'desenvolver', 'devolver', 'disolver', 'doler', 'envolver',
  'escocer', 'llover', 'morder', 'oler', 'promover', 'recocer', 'remover', 'resolver', 'retorcer',
  'revolver', 'soler', 'torcer', 'demoler', 'moler',
]);

/** -ir con e→ie en las tónicas y e→i en las átonas (siento, sintió, sintamos, sintiendo). */
const DIPTONGO_IE_I = new Set([
  'adherir', 'advertir', 'arrepentir', 'asentir', 'conferir', 'consentir', 'convertir', 'diferir',
  'digerir', 'disentir', 'divertir', 'herir', 'hervir', 'inferir', 'injerir', 'interferir',
  'invertir', 'mentir', 'desmentir', 'pervertir', 'presentir', 'referir', 'requerir', 'resentir',
  'revertir', 'subvertir', 'sugerir', 'transferir', 'controvertir',
]);

/** -ir con e→i (pido, pidió, pidamos, pidiendo). */
const CIERRE_I = new Set([
  'ceñir', 'colegir', 'competir', 'concebir', 'conseguir', 'corregir', 'derretir', 'despedir',
  'desteñir', 'desvestir', 'embestir', 'estreñir', 'expedir', 'gemir', 'impedir', 'investir',
  'medir', 'perseguir', 'proseguir', 'reelegir', 'regir', 'rendir', 'reñir', 'revestir', 'teñir',
  'vestir',
]);

/** i→ie en las tónicas (adquiero). */
const DIPTONGO_I_IE = new Set(['adquirir', 'inquirir']);

/** -iar con la i en hiato en las formas tónicas (envío). Los demás -iar diptongan (cambio). */
const HIATO_IAR = new Set([
  'aliar', 'amnistiar', 'ampliar', 'ansiar', 'ataviar', 'averiar', 'chirriar', 'confiar',
  'contrariar', 'criar', 'desafiar', 'descarriar', 'desconfiar', 'desviar', 'enfriar', 'enviar',
  'espiar', 'esquiar', 'estriar', 'expiar', 'extraviar', 'fiar', 'fotografiar', 'guiar',
  'hastiar', 'inventariar', 'liar', 'malcriar', 'piar', 'porfiar', 'resfriar', 'rociar',
  'telegrafiar', 'vaciar', 'variar', 'reenviar', 'autografiar', 'radiografiar', 'xerografiar',
]);

/** Raíz tónica con la tilde del hiato en verbos de raíz con dos vocales (reúno, prohíbo, aíslo). */
const RAIZ_HIATO: Record<string, string> = {
  reunir: 'reún', prohibir: 'prohíb', cohibir: 'cohíb', aislar: 'aísl', rehusar: 'rehús',
  aullar: 'aúll', maullar: 'maúll', ahumar: 'ahúm', ahijar: 'ahíj', enraizar: 'enraíz',
  aunar: 'aún', airar: 'aír',
};

/** Participios irregulares por sufijo: los heredan los derivados (resuelto, descrito, descubierto). */
const PARTICIPIO_POR_SUFIJO: Array<[string, string]> = [
  ['olver', 'uelto'],
  ['scribir', 'scrito'],
  ['cubrir', 'cubierto'],
  ['abrir', 'abierto'],
];

/** -cer con c→z ante a/o pero sin -zc- (mezo, cuezo). */
const SIN_ZC = new Set(['mecer', 'remecer', 'cocer', 'escocer', 'recocer']);

/**
 * Derivados por prefijo de un irregular de la tabla. Solo los de bases cuya irregularidad no
 * cubren los patrones (tener, poner, venir, hacer, decir, traer, caer, valer, salir, ver, oír,
 * reír): los demás derivados (consentir, aprobar, devolver…) salen por patrón.
 */
interface Derivado {
  base: string;
  prefijo: string;
  /** Imperativo de tú propio: «contradice», no «contradí». */
  imperativoTu?: string;
  /** Futuro y condicional regulares sobre el infinitivo (bendeciré). */
  futuroRegular?: boolean;
  participio?: string;
}

const DERIVADOS: Record<string, Derivado> = {};
function derivar(base: string, prefijos: string[], extra: Omit<Derivado, 'base' | 'prefijo'> = {}): void {
  for (const prefijo of prefijos) DERIVADOS[prefijo + base] = { base, prefijo, ...extra };
}
derivar('tener', ['abs', 'a', 'con', 'de', 'entre', 'man', 'ob', 're', 'sos']);
derivar('poner', ['ante', 'com', 'contra', 'de', 'descom', 'dis', 'ex', 'im', 'indis', 'inter', 'o', 'pos', 'pre', 'presu', 'pro', 're', 'recom', 'sobre', 'super', 'su', 'tras', 'trans', 'yuxta']);
derivar('venir', ['a', 'con', 'contra', 'de', 'inter', 'pre', 'pro', 'sobre', 'sub']);
derivar('hacer', ['des', 're', 'contra']);
derivar('traer', ['abs', 'a', 'con', 'de', 'dis', 'ex', 're', 'sus', 'retro']);
derivar('caer', ['de', 're']);
derivar('valer', ['equi', 'pre']);
derivar('salir', ['sobre']);
derivar('ver', ['entre', 'pre', 're']);
derivar('oír', ['des']);
derivar('reír', ['son']);
// Los derivados de decir hacen el imperativo en -dice (DPD, s. v. contradecir, predecir).
for (const prefijo of ['contra', 'des', 'pre']) {
  DERIVADOS[`${prefijo}decir`] = { base: 'decir', prefijo, imperativoTu: `${prefijo}dice` };
}
// Bendecir y maldecir, además, tienen futuro y participio regulares (bendeciré, bendecido).
for (const prefijo of ['ben', 'mal']) {
  DERIVADOS[`${prefijo}decir`] = {
    base: 'decir',
    prefijo,
    imperativoTu: `${prefijo}dice`,
    futuroRegular: true,
    participio: `${prefijo}decido`,
  };
}

/**
 * Palabras corrientes acabadas en -ar/-er/-ir que no son verbos. No es un diccionario: la app no
 * tiene uno, y una palabra inventada con vocal en la raíz se conjugaría igual. Atrapa las que un
 * usuario prueba de verdad («mujer», «ayer») para no presentarlas como verbos.
 */
const NO_VERBOS = new Set([
  'mujer', 'ayer', 'lugar', 'hogar', 'mar', 'bar', 'azar', 'collar', 'altar', 'pilar', 'familiar',
  'popular', 'similar', 'particular', 'escolar', 'vulgar', 'celular', 'nuclear', 'lunar', 'polar',
  'peculiar', 'pulgar', 'hangar', 'telar', 'manjar', 'ajuar', 'jaguar', 'billar', 'pinar',
  'palomar', 'olivar', 'lagar', 'radar', 'avatar', 'muscular', 'molecular', 'taller', 'alfiler',
  'menester', 'emir', 'visir', 'tapir', 'faquir', 'nadir', 'elixir', 'zafir', 'souvenir', 'par',
  'impar', 'ujier', 'sumiller',
]);

// ───────────────────────────── Ortografía y tildes ─────────────────────────────

const VOCALES = 'aeiouáéíóúü';
const FUERTES = 'aeoáéó';
const CON_TILDE: Record<string, string> = { a: 'á', e: 'é', i: 'í', o: 'ó', u: 'ú' };
const SIN_TILDE: Record<string, string> = { á: 'a', é: 'e', í: 'i', ó: 'o', ú: 'u' };

/**
 * Sílabas de una forma según la Ortografía de 2010: abierta + cerrada átona, o dos cerradas, es
 * diptongo; dos abiertas, o una cerrada con tilde, es hiato. Basta para decidir la tilde de una
 * forma verbal; no silabea palabras en general.
 */
export function contarSilabas(palabra: string): number {
  let n = 0;
  let anterior = '';
  for (const c of palabra) {
    if (!VOCALES.includes(c)) {
      anterior = '';
      continue;
    }
    if (!anterior) n++;
    else if ((FUERTES.includes(anterior) && FUERTES.includes(c)) || 'íú'.includes(anterior) || 'íú'.includes(c)) n++;
    anterior = c;
  }
  return n;
}

function tieneTilde(forma: string): boolean {
  return /[áéíóú]/.test(forma);
}

/** Pone la tilde en el núcleo de un monosílabo (ten → tén, vio → vió), para la aguda con prefijo. */
function acentuarNucleo(forma: string): string {
  const letras = [...forma];
  let fin = letras.length - 1;
  while (fin >= 0 && !VOCALES.includes(letras[fin])) fin--;
  let inicio = fin;
  while (inicio > 0 && VOCALES.includes(letras[inicio - 1])) inicio--;
  let objetivo = -1;
  for (let i = fin; i >= inicio; i--) {
    if (FUERTES.includes(letras[i])) {
      objetivo = i;
      break;
    }
  }
  if (objetivo < 0) objetivo = fin;
  const conTilde = CON_TILDE[letras[objetivo]];
  if (conTilde) letras[objetivo] = conTilde;
  return letras.join('');
}

/** Antepone un prefijo y pone la tilde que pide la aguda resultante: ten → mantén, vio → previó. */
function prefijar(prefijo: string, forma: string): string {
  if (forma === '-') return forma;
  if (forma.startsWith('no ')) return `no ${prefijar(prefijo, forma.slice(3))}`;
  const agudaNueva = !tieneTilde(forma) && contarSilabas(forma) === 1 && /[aeiouns]$/.test(forma);
  return prefijo + (agudaNueva ? acentuarNucleo(forma) : forma);
}

/** Un monosílabo no lleva tilde (crié → crie, guió → guio, fiáis → fiais). */
function sinTildeSiMonosilabo(forma: string): string {
  if (!tieneTilde(forma) || contarSilabas(forma) !== 1) return forma;
  return [...forma].map((c) => SIN_TILDE[c] ?? c).join('');
}

// ───────────────────────────── Cambios de raíz ─────────────────────────────

function sustituirUltima(raiz: string, vocal: string, por: (i: number) => string): string {
  const i = raiz.lastIndexOf(vocal);
  if (i < 0) return raiz;
  return raiz.slice(0, i) + por(i) + raiz.slice(i + 1);
}
/** e→ie; en inicial de palabra, ye (errar → yerro). */
const diptongarE = (r: string) => sustituirUltima(r, 'e', (i) => (i === 0 ? 'ye' : 'ie'));
/** o→ue; en inicial, hue (oler → huelo); tras g, güe (avergonzar → avergüenzo). */
const diptongarO = (r: string) => sustituirUltima(r, 'o', (i) => (i === 0 ? 'hue' : r[i - 1] === 'g' ? 'üe' : 'ue'));
const diptongarI = (r: string) => sustituirUltima(r, 'i', () => 'ie');
const cerrarE = (r: string) => sustituirUltima(r, 'e', () => 'i');
const cerrarO = (r: string) => sustituirUltima(r, 'o', () => 'u');

// ───────────────────────────── Modelo de un verbo ─────────────────────────────

interface Modelo {
  infinitivo: string;
  conj: Conjugacion;
  raiz: string;
  cambio: CambioRaiz | null;
  zc: boolean;
  ducir: boolean;
  uy: boolean;
  raizHiato: string | null;
  participio: string | null;
}

function terminacionDe(infinitivo: string): Conjugacion | null {
  if (infinitivo.endsWith('ar')) return 'ar';
  if (infinitivo.endsWith('er')) return 'er';
  if (infinitivo.endsWith('ir') || infinitivo.endsWith('ír')) return 'ir';
  return null;
}

function modeloDe(infinitivo: string): Modelo | null {
  const conj = terminacionDe(infinitivo);
  if (!conj) return null;
  const raiz = infinitivo.slice(0, -2);
  let cambio: CambioRaiz | null = null;
  if (DIPTONGO_IE.has(infinitivo)) cambio = 'ie';
  else if (DIPTONGO_UE.has(infinitivo)) cambio = 'ue';
  else if (DIPTONGO_IE_I.has(infinitivo)) cambio = 'ie-i';
  else if (CIERRE_I.has(infinitivo)) cambio = 'i';
  else if (DIPTONGO_I_IE.has(infinitivo)) cambio = 'i-ie';

  let raizHiato: string | null = RAIZ_HIATO[infinitivo] ?? null;
  if (!raizHiato && HIATO_IAR.has(infinitivo)) raizHiato = raiz.slice(0, -1) + 'í';
  // -uar en hiato salvo tras c o g (actúo, pero averiguo, adecuo).
  if (!raizHiato && /[^cg]uar$/.test(infinitivo)) raizHiato = raiz.slice(0, -1) + 'ú';

  const participio = PARTICIPIO_POR_SUFIJO.find(([suf]) => infinitivo.endsWith(suf));

  return {
    infinitivo,
    conj,
    raiz,
    cambio,
    zc: (/[aeo]cer$/.test(infinitivo) || /ucir$/.test(infinitivo)) && !SIN_ZC.has(infinitivo),
    ducir: infinitivo.endsWith('ducir'),
    uy: /[^gq]uir$/.test(infinitivo),
    raizHiato,
    participio: participio ? infinitivo.slice(0, -participio[0].length) + participio[1] : null,
  };
}

/** Raíz + desinencia con los ajustes ortográficos que conservan el sonido de la raíz. */
function unir(m: Modelo, raiz: string, desinencia: string): string {
  const inicial = desinencia[0] ?? '';
  const anteE = inicial === 'e' || inicial === 'é';
  const anteAO = 'aoáó'.includes(inicial) && inicial !== '';
  let r = raiz;
  if (m.conj === 'ar' && anteE) {
    if (m.infinitivo.endsWith('guar')) r = r.slice(0, -1) + 'ü';
    else if (m.infinitivo.endsWith('car')) r = r.slice(0, -1) + 'qu';
    else if (m.infinitivo.endsWith('gar')) r = r + 'u';
    else if (m.infinitivo.endsWith('zar')) r = r.slice(0, -1) + 'c';
  }
  if (m.conj !== 'ar' && anteAO) {
    if (m.zc && r.endsWith('c')) r = r.slice(0, -1) + 'zc';
    else if (/c(er|ir)$/.test(m.infinitivo) && r.endsWith('c')) r = r.slice(0, -1) + 'z';
    else if (/g(er|ir)$/.test(m.infinitivo) && r.endsWith('g')) r = r.slice(0, -1) + 'j';
    else if (m.infinitivo.endsWith('guir') && r.endsWith('gu')) r = r.slice(0, -1);
    else if (m.infinitivo.endsWith('quir') && r.endsWith('qu')) r = r.slice(0, -2) + 'c';
  }
  let d = desinencia;
  if (m.conj !== 'ar') {
    const ultima = r.slice(-1);
    const vocalQueSuena = 'aeo'.includes(ultima) || (ultima === 'u' && !/[gq]u$/.test(r));
    if (vocalQueSuena) {
      if (/^i[aeoó]/.test(d)) d = 'y' + d.slice(1); // leyó, construyendo
      else if (/^i/.test(d) && ultima !== 'u') d = 'í' + d.slice(1); // leíste, leído
    }
    if ((r.endsWith('ñ') || r.endsWith('ll')) && /^i[eó]/.test(d)) d = d.slice(1); // tiñó, bulló
  }
  return sinTildeSiMonosilabo(r + d);
}

function conjugarModelo(m: Modelo): ConjugacionCompleta {
  const D = DESINENCIAS[m.conj];
  const r = m.raiz;
  let tonica = r;
  let cerrada = r;
  let subjAtona = r;
  switch (m.cambio) {
    case 'ie': tonica = diptongarE(r); break;
    case 'ue': tonica = diptongarO(r); break;
    case 'ie-i': tonica = diptongarE(r); cerrada = subjAtona = cerrarE(r); break;
    case 'ue-u': tonica = diptongarO(r); cerrada = subjAtona = cerrarO(r); break;
    case 'i': tonica = cerrada = subjAtona = cerrarE(r); break;
    case 'i-ie': tonica = diptongarI(r); break;
  }
  if (m.raizHiato) tonica = m.raizHiato;
  if (m.uy) {
    tonica = r + 'y';
    subjAtona = r + 'y';
  }

  const presente = D.presente.map((d, i) => unir(m, [3, 4].includes(i) ? r : tonica, d));
  const subjPresente = D.subjPresente.map((d, i) => unir(m, [3, 4].includes(i) ? subjAtona : tonica, d));

  let indefinido: string[];
  let subjImperfecto: string[];
  if (m.ducir) {
    const raizDuje = r.slice(0, -1) + 'j';
    indefinido = ['e', 'iste', 'o', 'imos', 'isteis', 'eron'].map((d) => raizDuje + d);
    subjImperfecto = ['era', 'eras', 'era', 'éramos', 'erais', 'eran'].map((d) => raizDuje + d);
  } else {
    indefinido = D.indefinido.map((d, i) => unir(m, [2, 5].includes(i) ? cerrada : r, d));
    subjImperfecto = D.subjImperfecto.map((d) => unir(m, cerrada, d));
  }

  const baseFuturo = m.infinitivo.replace(/ír$/, 'ir');

  return {
    infinitivo: m.infinitivo,
    gerundio: unir(m, cerrada, D.gerundio),
    participio: m.participio ?? unir(m, r, D.participio),
    indicativo: {
      presente,
      preterito_imperfecto: D.imperfecto.map((d) => unir(m, r, d)),
      preterito_indefinido: indefinido,
      futuro: FUTURO.map((d) => baseFuturo + d),
      condicional: CONDICIONAL.map((d) => baseFuturo + d),
    },
    subjuntivo: {
      presente: subjPresente,
      preterito_imperfecto: subjImperfecto,
    },
    imperativo: {
      // El imperativo propio es el de tú (= 3.ª del presente) y vosotros (infinitivo - r + d);
      // usted, nosotros y ustedes, y todo el negativo, toman el presente de subjuntivo.
      afirmativo: ['-', presente[2], subjPresente[2], subjPresente[3], m.infinitivo.slice(0, -1) + 'd', subjPresente[5]],
      negativo: ['-', ...subjPresente.slice(1).map((f) => `no ${f}`)],
    },
  };
}

function conjugarDerivado(infinitivo: string, d: Derivado): ConjugacionCompleta {
  const base = verbosIrregulares[d.base];
  const p = (f: string) => prefijar(d.prefijo, f);
  const futuro = d.futuroRegular ? FUTURO.map((t) => infinitivo + t) : base.indicativo.futuro.map(p);
  const condicional = d.futuroRegular ? CONDICIONAL.map((t) => infinitivo + t) : base.indicativo.condicional.map(p);
  const afirmativo = base.imperativo.afirmativo.map(p);
  if (d.imperativoTu) afirmativo[1] = d.imperativoTu;
  return {
    infinitivo,
    gerundio: p(base.gerundio),
    participio: d.participio ?? p(base.participio),
    indicativo: {
      presente: base.indicativo.presente.map(p),
      preterito_imperfecto: base.indicativo.preterito_imperfecto.map(p),
      preterito_indefinido: base.indicativo.preterito_indefinido.map(p),
      futuro,
      condicional,
    },
    subjuntivo: {
      presente: base.subjuntivo.presente.map(p),
      preterito_imperfecto: base.subjuntivo.preterito_imperfecto.map(p),
    },
    imperativo: {
      afirmativo,
      negativo: base.imperativo.negativo.map(p),
    },
  };
}

// ───────────────────────────── API ─────────────────────────────

export type TipoVerbo = 'tabla' | 'derivado' | 'patron' | 'regular';

export interface VerboConjugado {
  conjugacion: ConjugacionCompleta;
  tipo: TipoVerbo;
  /** Irregular para la gramática: de la tabla, derivado de uno de ella o de un patrón irregular. */
  irregular: boolean;
  /** Con qué modelo se ha conjugado, en una frase («se conjuga como tener»). */
  modelo: string | null;
}

const NOMBRE_CONJ: Record<Conjugacion, string> = { ar: '1.ª', er: '2.ª', ir: '3.ª' };
const EJEMPLO_CONJ: Record<Conjugacion, string> = { ar: 'hablar', er: 'comer', ir: 'vivir' };

function describirModelo(m: Modelo): { irregular: boolean; texto: string } {
  const partes: string[] = [];
  let irregular = true;
  if (m.cambio === 'ie') partes.push('diptonga e→ie en las formas con acento en la raíz, como pensar');
  else if (m.cambio === 'ue') partes.push('diptonga o→ue en las formas con acento en la raíz, como contar');
  else if (m.cambio === 'ie-i') partes.push('diptonga e→ie y cierra e→i en otras formas, como sentir');
  else if (m.cambio === 'i') partes.push('cierra e→i, como pedir');
  else if (m.cambio === 'i-ie') partes.push('diptonga i→ie, como adquirir');
  if (m.ducir) partes.push('hace -zc- en presente y el indefinido en -duje, como conducir');
  else if (m.zc) partes.push('añade -zc- ante a y o, como conocer');
  if (m.uy) partes.push('añade -y- ante a, e y o, como construir');
  if (partes.length === 0) {
    irregular = false;
    partes.push(`regular de la ${NOMBRE_CONJ[m.conj]} conjugación, como ${EJEMPLO_CONJ[m.conj]}`);
  }
  if (m.raizHiato) partes.push('con tilde de hiato en las formas tónicas, como enviar o actuar');
  return { irregular, texto: partes.join('; ') };
}

/**
 * Por qué una entrada no se acepta como infinitivo, o `null` si se acepta. No es un diccionario:
 * rechaza lo que con seguridad no es un verbo español (sin vocal en la raíz, con tilde donde un
 * infinitivo no la lleva, palabras corrientes que no son verbos).
 */
export function motivoNoInfinitivo(verbo: string): string | null {
  // Los de la tabla valen siempre: «ir», «ver», «dar» o «ser» tienen la raíz sin vocal.
  if (verbo in verbosIrregulares) return null;
  if (!/^[a-zñáéíóúü]+$/.test(verbo) || !terminacionDe(verbo)) {
    return 'Por favor, introduce un verbo válido en infinitivo (terminado en -ar, -er o -ir)';
  }
  if (tieneTilde(verbo.slice(0, -2)) || (tieneTilde(verbo) && !verbo.endsWith('ír'))) {
    return `«${verbo}» no es un infinitivo: solo los acabados en -ír (oír, reír) llevan tilde.`;
  }
  if (![...verbo.slice(0, -2)].some((c) => VOCALES.includes(c))) {
    return `«${verbo}» no es un verbo del español: su raíz no tiene ninguna vocal.`;
  }
  if (NO_VERBOS.has(verbo)) {
    return `«${verbo}» no es un verbo, aunque acabe en -${terminacionDe(verbo)}.`;
  }
  return null;
}

/** Conjuga un infinitivo ya validado: tabla → derivado → patrón o regla. */
export function conjugarInfinitivo(verbo: string): VerboConjugado | null {
  const tabla = verbosIrregulares[verbo];
  if (tabla) return { conjugacion: tabla, tipo: 'tabla', irregular: true, modelo: null };
  const derivado = DERIVADOS[verbo];
  if (derivado) {
    return {
      conjugacion: conjugarDerivado(verbo, derivado),
      tipo: 'derivado',
      irregular: true,
      modelo: `se conjuga como «${derivado.base}»`,
    };
  }
  const m = modeloDe(verbo);
  if (!m) return null;
  const { irregular, texto } = describirModelo(m);
  return { conjugacion: conjugarModelo(m), tipo: irregular ? 'patron' : 'regular', irregular, modelo: texto };
}
