/**
 * Modelo de la división celular: qué hay dibujado en cada fase y por qué.
 *
 * Vive aparte de la vista porque el defecto que motivó este fichero no se ve compilando ni
 * mirando la pantalla por encima: hay que CONTAR los cromosomas del dibujo, que es
 * exactamente lo que la guía de la app le pide hacer al alumno. Los hallazgos 375-381 del
 * Inspector (26/08/2026) salieron de ahí, y todos tenían la misma raíz.
 *
 * ── La raíz: un solo «estado de cromosomas» para tres divisiones distintas ───
 *
 * El dibujo se gobernaba con un `estadoCromosomasId` de 0 a 4 —difuso, condensado, en placa,
 * separando, en polos— compartido por mitosis, meiosis I y meiosis II. Pero «separando» no
 * significa lo mismo en las tres:
 *
 *   · Anafase de MITOSIS      → se separan CROMÁTIDAS HERMANAS. Cada polo recibe tantos
 *                               cromosomas como había en la placa: 4 y 4.
 *   · Anafase I de MEIOSIS    → se separan HOMÓLOGOS. Cada polo recibe la MITAD: 2 y 2.
 *   · Anafase II de MEIOSIS   → se separan CROMÁTIDAS HERMANAS otra vez. Cada polo recibe
 *                               tantos como había: 2 y 2.
 *
 * El código repartía siempre la mitad, que solo es correcto en la anafase I. Consecuencia:
 * la mitosis se dibujaba como una división REDUCCIONAL —la placa con 4 cromosomas y cada
 * polo con 2— justo debajo del rótulo «Resultado: 2 células (2n=4)», y las cuatro células
 * de la meiosis salían n=1 en vez de n=2. Un alumno que contase, aprendía lo contrario.
 *
 * Aquí cada fase declara CUÁNTOS cromosomas tiene, QUÉ se separa y si van apareados en
 * bivalentes. El dibujo deriva de esos datos y ya no puede contradecir al rótulo.
 */

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type Membrana = 'completa' | 'disolviendose' | 'ausente' | 'formandose';

/** Cómo se colocan los cromosomas dentro de la célula en esta fase. */
export type Disposicion =
  | 'difuso' // cromatina sin condensar (interfase y final de citocinesis)
  | 'condensado' // visibles, repartidos por el núcleo
  | 'placa' // alineados en el ecuador
  | 'separando' // migrando a los polos
  | 'polos'; // ya en los polos, con la envoltura formándose

/** Qué se separa en una anafase. Decide cuántos cromosomas recibe cada polo. */
export type Separacion = 'homologos' | 'hermanas';

export interface FaseConfig {
  id: string;
  nombre: string;
  descripcion: string;
  celulas: number;
  nucleos: number;
  membrana: Membrana;
  husillo: boolean;
  crossingOver: boolean;
  disposicion: Disposicion;
  /**
   * Cromosomas presentes en CADA célula dibujada antes de separarse. En la placa de la
   * mitosis son 4 (2n); en la de la meiosis II, 2 (n).
   */
  cromosomasPorCelula: number;
  /** Solo en las fases de disposición `separando`. */
  separacion?: Separacion;
  /** Los homólogos van apareados: solo en profase I y metafase I. */
  bivalentes?: boolean;
}

// ─── Cuántos cromosomas recibe cada polo ─────────────────────────────────────

/**
 * Al separarse HOMÓLOGOS, cada polo recibe la mitad de los cromosomas de la placa: es la
 * división reduccional, la que baja de 2n a n. Al separarse CROMÁTIDAS HERMANAS cada
 * cromosoma se parte en dos, así que cada polo recibe tantos cromosomas como había: el
 * recuento no baja, que es lo que distingue a la mitosis de la meiosis I.
 */
export function cromosomasPorPolo(fase: FaseConfig): number {
  // La telofase (`polos`) reparte lo mismo que la anafase que la precede: ya no migran, pero
  // siguen siendo dos juegos dentro de una célula que aún no se ha partido.
  if (fase.disposicion !== 'separando' && fase.disposicion !== 'polos') return 0;
  return fase.separacion === 'homologos' ? fase.cromosomasPorCelula / 2 : fase.cromosomasPorCelula;
}

/**
 * Índice del par de homólogos (0 o 1) al que pertenece el cromosoma i de una célula.
 *
 * En la meiosis II cada célula tiene UN cromosoma de cada par —eso es ser haploide—, así que
 * los dos se pintan de colores distintos. El código anterior usaba `floor(i/2)` también
 * ahí, con lo que los dos salían del mismo color: la célula haploide aparecía con dos copias
 * del mismo cromosoma, que es precisamente la no disyunción que la FAQ describe como error.
 */
export function parDelCromosoma(i: number, cromosomasPorCelula: number): number {
  // 4 cromosomas = 2 pares completos: 0,0,1,1 (los homólogos van seguidos).
  if (cromosomasPorCelula >= 4) return Math.floor(i / 2) % 2;
  // 2 cromosomas en una célula haploide: uno de cada par.
  return i % 2;
}

// ─── Fases de la mitosis ─────────────────────────────────────────────────────

export const FASES_MITOSIS: FaseConfig[] = [
  {
    id: 'interfase',
    nombre: 'Interfase',
    descripcion:
      'El ADN se duplica en el núcleo. Los cromosomas no son visibles como estructuras individuales: aparecen como cromatina difusa. La membrana nuclear está intacta. La célula crece y se prepara para dividirse.',
    celulas: 1,
    nucleos: 1,
    membrana: 'completa',
    husillo: false,
    crossingOver: false,
    disposicion: 'difuso',
    cromosomasPorCelula: 4,
  },
  {
    id: 'profase',
    nombre: 'Profase',
    descripcion:
      'Los cromosomas se condensan y se hacen visibles al microscopio. La membrana nuclear comienza a desintegrarse. El huso acromático empieza a formarse desde los centrosomas en los polos opuestos.',
    celulas: 1,
    nucleos: 1,
    membrana: 'disolviendose',
    husillo: true,
    crossingOver: false,
    disposicion: 'condensado',
    cromosomasPorCelula: 4,
  },
  {
    id: 'metafase',
    nombre: 'Metafase',
    descripcion:
      'Los cromosomas se alinean uno a uno en la placa ecuatorial, SIN aparearse con su homólogo: cada cromosoma es independiente. El huso los sujeta por el centrómero desde los dos polos. Es la diferencia visible con la metafase I de la meiosis, donde se alinean bivalentes.',
    celulas: 1,
    nucleos: 0,
    membrana: 'ausente',
    husillo: true,
    crossingOver: false,
    disposicion: 'placa',
    cromosomasPorCelula: 4,
  },
  {
    id: 'anafase',
    nombre: 'Anafase',
    descripcion:
      'Las cromátidas hermanas se separan y migran a polos opuestos. Cada polo recibe un conjunto completo de cromosomas (2n): el recuento NO baja, porque lo que se parte es cada cromosoma en sus dos cromátidas.',
    celulas: 1,
    nucleos: 0,
    membrana: 'ausente',
    husillo: true,
    crossingOver: false,
    disposicion: 'separando',
    cromosomasPorCelula: 4,
    separacion: 'hermanas',
  },
  {
    id: 'telofase',
    nombre: 'Telofase',
    descripcion:
      'Los cromosomas llegan a los polos y comienzan a descondensar. Se forman dos nuevas membranas nucleares, cada una alrededor de un conjunto COMPLETO de 2n=4 cromosomas. El huso acromático desaparece.',
    celulas: 1,
    nucleos: 2,
    membrana: 'formandose',
    husillo: false,
    crossingOver: false,
    disposicion: 'polos',
    cromosomasPorCelula: 4,
    separacion: 'hermanas',
  },
  {
    id: 'citocinesis',
    nombre: 'Citocinesis',
    descripcion:
      'El citoplasma se divide y da lugar a dos células hijas idénticas a la célula madre. Cada célula hija tiene 2n=4 cromosomas (diploide). En la mitosis se produce siempre este resultado: 2 células 2n.',
    celulas: 2,
    nucleos: 1,
    membrana: 'completa',
    husillo: false,
    crossingOver: false,
    disposicion: 'difuso',
    cromosomasPorCelula: 4,
  },
];

// ─── Fases de la meiosis ─────────────────────────────────────────────────────

export const FASES_MEIOSIS: FaseConfig[] = [
  {
    id: 'interfase',
    nombre: 'Interfase',
    descripcion:
      'La célula duplica su ADN antes de iniciar la meiosis. Los cromosomas no son visibles aún. La célula es diploide (2n=4 en nuestro modelo con 2 pares de homólogos).',
    celulas: 1,
    nucleos: 1,
    membrana: 'completa',
    husillo: false,
    crossingOver: false,
    disposicion: 'difuso',
    cromosomasPorCelula: 4,
  },
  {
    id: 'profase-i',
    nombre: 'Profase I',
    descripcion:
      'Los cromosomas homólogos —los del MISMO par, aquí los del mismo color— se aparean formando bivalentes (tétradas). Ocurre el crossing-over: intercambio de segmentos entre cromátidas no hermanas de esos homólogos. Este proceso genera variabilidad genética. La membrana nuclear se disuelve.',
    celulas: 1,
    nucleos: 1,
    membrana: 'disolviendose',
    husillo: true,
    crossingOver: true,
    disposicion: 'condensado',
    cromosomasPorCelula: 4,
    bivalentes: true,
  },
  {
    id: 'metafase-i',
    nombre: 'Metafase I',
    descripcion:
      'Los bivalentes (pares de homólogos unidos) se alinean en la placa ecuatorial. Cada bivalente es orientado por el huso de modo que los homólogos quedan en lados opuestos. Aquí se ven DOS bivalentes, no cuatro cromosomas sueltos: es lo que la distingue de la metafase mitótica.',
    celulas: 1,
    nucleos: 0,
    membrana: 'ausente',
    husillo: true,
    crossingOver: false,
    disposicion: 'placa',
    cromosomasPorCelula: 4,
    bivalentes: true,
  },
  {
    id: 'anafase-i',
    nombre: 'Anafase I',
    descripcion:
      'Los cromosomas homólogos se separan y migran a polos opuestos. IMPORTANTE: las cromátidas hermanas permanecen unidas. Solo se separan los homólogos, así que cada polo queda con n=2 (haploide, pero cada cromosoma con sus dos cromátidas). Es la división reduccional.',
    celulas: 1,
    nucleos: 0,
    membrana: 'ausente',
    husillo: true,
    crossingOver: false,
    disposicion: 'separando',
    cromosomasPorCelula: 4,
    separacion: 'homologos',
  },
  {
    id: 'telofase-i',
    nombre: 'Telofase I / Citocinesis I',
    descripcion:
      'Se forman dos células haploides (n=2). Cada célula tiene la mitad de cromosomas de la original —uno de cada par— pero cada cromosoma aún consta de dos cromátidas unidas. Las células resultantes son genéticamente distintas entre sí.',
    celulas: 2,
    nucleos: 1,
    membrana: 'completa',
    husillo: false,
    crossingOver: false,
    disposicion: 'condensado',
    cromosomasPorCelula: 2,
  },
  {
    id: 'profase-ii',
    nombre: 'Profase II',
    descripcion:
      'En cada célula hija, la envoltura nuclear que acababa de formarse se disuelve otra vez y se organiza un huso nuevo. NO hay duplicación de ADN entre la meiosis I y la II: los cromosomas siguen teniendo sus dos cromátidas. Tampoco hay apareamiento de homólogos, porque ya se separaron.',
    celulas: 2,
    nucleos: 1,
    membrana: 'disolviendose',
    husillo: true,
    crossingOver: false,
    disposicion: 'condensado',
    cromosomasPorCelula: 2,
  },
  {
    id: 'metafase-ii',
    nombre: 'Metafase II',
    descripcion:
      'En cada una de las dos células haploides, los cromosomas se alinean en la placa ecuatorial. Son uno de cada par —de ahí los dos colores distintos—, porque los homólogos ya se separaron en la meiosis I.',
    celulas: 2,
    nucleos: 0,
    membrana: 'ausente',
    husillo: true,
    crossingOver: false,
    disposicion: 'placa',
    cromosomasPorCelula: 2,
  },
  {
    id: 'anafase-ii',
    nombre: 'Anafase II',
    descripcion:
      'Las cromátidas hermanas se separan y migran a polos opuestos dentro de cada célula. Este paso es equivalente a la anafase de la mitosis, pero en células ya haploides: cada polo recibe n=2 cromosomas de una sola cromátida.',
    celulas: 2,
    nucleos: 0,
    membrana: 'ausente',
    husillo: true,
    crossingOver: false,
    disposicion: 'separando',
    cromosomasPorCelula: 2,
    separacion: 'hermanas',
  },
  {
    id: 'telofase-ii',
    nombre: 'Telofase II / Citocinesis II',
    descripcion:
      'Se forman cuatro células haploides (n=2) genéticamente distintas. Estas son las células que pueden convertirse en gametos (óvulos o espermatozoides) en organismos de reproducción sexual.',
    celulas: 4,
    nucleos: 1,
    membrana: 'completa',
    husillo: false,
    crossingOver: false,
    disposicion: 'difuso',
    cromosomasPorCelula: 2,
  },
];

// ─── Recuento final, para poder comprobarlo ──────────────────────────────────

/** Cromosomas totales del organismo modelo tras la fase: células × cromosomas por célula. */
export function recuentoTotal(fase: FaseConfig): number {
  if (fase.disposicion === 'separando' || fase.disposicion === 'polos') {
    // Durante la anafase la célula aún no se ha partido: los dos polos siguen dentro.
    return fase.celulas * cromosomasPorPolo(fase) * 2;
  }
  return fase.celulas * fase.cromosomasPorCelula;
}
