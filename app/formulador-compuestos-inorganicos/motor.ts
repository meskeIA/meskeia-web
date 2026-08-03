/**
 * Motor de formulacion y nomenclatura inorganica.
 * Vive aparte de page.tsx para poder verificarse con casos de prueba sin arrastrar React.
 */

// ═══════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════

export type TipoElemento = 'metal' | 'nometal' | 'hidrogeno';

export interface Elemento {
  simbolo: string;
  /** Nombre del elemento tal como aparece en la nomenclatura sistemática y de stock */
  nombre: string;
  tipo: TipoElemento;
  /** Números de oxidación positivos habituales en secundaria */
  positivas: number[];
  /** Número de oxidación negativo (no metales) */
  negativa?: number;
  /** Nombre del anión monoatómico: cloruro, sulfuro, óxido */
  anion?: string;
  /** Adjetivo tradicional por número de oxidación: {2: 'ferroso', 3: 'férrico'} */
  tradicional?: Record<number, string>;
  /** Raíz del ácido hidrácido: clorhídrico, sulfhídrico */
  hidracido?: string;
}

export interface AnionOxo {
  /** Fórmula del anión sin carga: 'SO4' */
  formula: string;
  atomos: Record<string, number>;
  /** Carga negativa en valor absoluto */
  carga: number;
  /** Nombre del anión en la sal: 'sulfato' */
  nombre: string;
  /** Elemento central */
  central: string;
  /** Número de oxidación del elemento central */
  valencia: number;
  /** Fórmula del oxoácido correspondiente: 'H2SO4' */
  acido: string;
  /** Hidrógenos del oxoácido */
  hidrogenos: number;
  /** Nombre tradicional del ácido: 'ácido sulfúrico' */
  acidoTradicional: string;
  /** Nombre del anión en nomenclatura de stock: 'tetraoxosulfato(VI)' */
  anionStock: string;
}

export type Familia =
  | 'oxido-metalico'
  | 'oxido-nometalico'
  | 'peroxido'
  | 'hidruro-metalico'
  | 'hidruro-nometalico'
  | 'hidroxido'
  | 'oxoacido'
  | 'sal-binaria'
  | 'oxosal'
  | 'sustancia-simple';

export interface Oxidacion {
  simbolo: string;
  valor: number;
}

export interface Analisis {
  formula: string;
  formulaBonita: string;
  familia: Familia;
  familiaEtiqueta: string;
  sistematica: string | null;
  stock: string | null;
  tradicional: string | null;
  /** Matiz sobre la nomenclatura tradicional (en desuso, forma alternativa, etc.) */
  notaTradicional: string | null;
  oxidaciones: Oxidacion[];
  pasos: string[];
  avisos: string[];
}

export interface ErrorAnalisis {
  error: string;
  pista: string | null;
}

export type ResultadoAnalisis = { ok: true; analisis: Analisis } | { ok: false; fallo: ErrorAnalisis };

export interface Parseo {
  /** Composición total: {Fe: 2, O: 3} */
  comp: Record<string, number>;
  /** Símbolos en orden de aparición */
  orden: string[];
  /** Grupos que iban entre paréntesis, con su multiplicador */
  grupos: { formula: string; n: number }[];
  /** Fórmula normalizada sin espacios ni subíndices unicode */
  normalizada: string;
}

// ═══════════════════════════════════════════════════════════════════════
// DATOS DE REFERENCIA
// ═══════════════════════════════════════════════════════════════════════

export const ELEMENTOS: Elemento[] = [
  // ── Hidrógeno ──
  {
    simbolo: 'H', nombre: 'hidrógeno', tipo: 'hidrogeno', positivas: [1], negativa: -1,
    anion: 'hidruro', tradicional: { 1: 'hídrico' },
  },
  // ── Metales de una sola valencia ──
  { simbolo: 'Li', nombre: 'litio', tipo: 'metal', positivas: [1], tradicional: { 1: 'lítico' } },
  { simbolo: 'Na', nombre: 'sodio', tipo: 'metal', positivas: [1], tradicional: { 1: 'sódico' } },
  { simbolo: 'K', nombre: 'potasio', tipo: 'metal', positivas: [1], tradicional: { 1: 'potásico' } },
  { simbolo: 'Rb', nombre: 'rubidio', tipo: 'metal', positivas: [1], tradicional: { 1: 'rubídico' } },
  { simbolo: 'Cs', nombre: 'cesio', tipo: 'metal', positivas: [1], tradicional: { 1: 'césico' } },
  { simbolo: 'Ag', nombre: 'plata', tipo: 'metal', positivas: [1], tradicional: { 1: 'argéntico' } },
  { simbolo: 'Be', nombre: 'berilio', tipo: 'metal', positivas: [2], tradicional: { 2: 'berílico' } },
  { simbolo: 'Mg', nombre: 'magnesio', tipo: 'metal', positivas: [2], tradicional: { 2: 'magnésico' } },
  { simbolo: 'Ca', nombre: 'calcio', tipo: 'metal', positivas: [2], tradicional: { 2: 'cálcico' } },
  { simbolo: 'Sr', nombre: 'estroncio', tipo: 'metal', positivas: [2], tradicional: { 2: 'estróncico' } },
  { simbolo: 'Ba', nombre: 'bario', tipo: 'metal', positivas: [2], tradicional: { 2: 'bárico' } },
  { simbolo: 'Ra', nombre: 'radio', tipo: 'metal', positivas: [2], tradicional: { 2: 'rádico' } },
  { simbolo: 'Zn', nombre: 'cinc', tipo: 'metal', positivas: [2], tradicional: { 2: 'cíncico' } },
  { simbolo: 'Cd', nombre: 'cadmio', tipo: 'metal', positivas: [2], tradicional: { 2: 'cádmico' } },
  { simbolo: 'Al', nombre: 'aluminio', tipo: 'metal', positivas: [3], tradicional: { 3: 'alumínico' } },
  // ── Metales de varias valencias ──
  { simbolo: 'Cu', nombre: 'cobre', tipo: 'metal', positivas: [1, 2], tradicional: { 1: 'cuproso', 2: 'cúprico' } },
  { simbolo: 'Hg', nombre: 'mercurio', tipo: 'metal', positivas: [1, 2], tradicional: { 1: 'mercurioso', 2: 'mercúrico' } },
  { simbolo: 'Au', nombre: 'oro', tipo: 'metal', positivas: [1, 3], tradicional: { 1: 'auroso', 3: 'áurico' } },
  { simbolo: 'Fe', nombre: 'hierro', tipo: 'metal', positivas: [2, 3], tradicional: { 2: 'ferroso', 3: 'férrico' } },
  { simbolo: 'Co', nombre: 'cobalto', tipo: 'metal', positivas: [2, 3], tradicional: { 2: 'cobaltoso', 3: 'cobáltico' } },
  { simbolo: 'Ni', nombre: 'níquel', tipo: 'metal', positivas: [2, 3], tradicional: { 2: 'niqueloso', 3: 'niquélico' } },
  { simbolo: 'Cr', nombre: 'cromo', tipo: 'metal', positivas: [2, 3], tradicional: { 2: 'cromoso', 3: 'crómico' } },
  { simbolo: 'Mn', nombre: 'manganeso', tipo: 'metal', positivas: [2, 3], tradicional: { 2: 'manganoso', 3: 'mangánico' } },
  { simbolo: 'Sn', nombre: 'estaño', tipo: 'metal', positivas: [2, 4], tradicional: { 2: 'estannoso', 4: 'estánnico' } },
  { simbolo: 'Pb', nombre: 'plomo', tipo: 'metal', positivas: [2, 4], tradicional: { 2: 'plumboso', 4: 'plúmbico' } },
  { simbolo: 'Pt', nombre: 'platino', tipo: 'metal', positivas: [2, 4], tradicional: { 2: 'platinoso', 4: 'platínico' } },
  // ── No metales ──
  {
    simbolo: 'F', nombre: 'flúor', tipo: 'nometal', positivas: [], negativa: -1,
    anion: 'fluoruro', hidracido: 'fluorhídrico',
  },
  {
    simbolo: 'Cl', nombre: 'cloro', tipo: 'nometal', positivas: [1, 3, 5, 7], negativa: -1,
    anion: 'cloruro', hidracido: 'clorhídrico',
  },
  {
    simbolo: 'Br', nombre: 'bromo', tipo: 'nometal', positivas: [1, 3, 5, 7], negativa: -1,
    anion: 'bromuro', hidracido: 'bromhídrico',
  },
  {
    simbolo: 'I', nombre: 'yodo', tipo: 'nometal', positivas: [1, 3, 5, 7], negativa: -1,
    anion: 'yoduro', hidracido: 'yodhídrico',
  },
  { simbolo: 'O', nombre: 'oxígeno', tipo: 'nometal', positivas: [], negativa: -2, anion: 'óxido' },
  {
    simbolo: 'S', nombre: 'azufre', tipo: 'nometal', positivas: [2, 4, 6], negativa: -2,
    anion: 'sulfuro', hidracido: 'sulfhídrico',
  },
  {
    simbolo: 'Se', nombre: 'selenio', tipo: 'nometal', positivas: [4, 6], negativa: -2,
    anion: 'seleniuro', hidracido: 'selenhídrico',
  },
  {
    simbolo: 'Te', nombre: 'teluro', tipo: 'nometal', positivas: [4, 6], negativa: -2,
    anion: 'telururo', hidracido: 'telurhídrico',
  },
  { simbolo: 'N', nombre: 'nitrógeno', tipo: 'nometal', positivas: [1, 3, 5], negativa: -3, anion: 'nitruro' },
  { simbolo: 'P', nombre: 'fósforo', tipo: 'nometal', positivas: [1, 3, 5], negativa: -3, anion: 'fosfuro' },
  { simbolo: 'As', nombre: 'arsénico', tipo: 'nometal', positivas: [3, 5], negativa: -3, anion: 'arseniuro' },
  { simbolo: 'Sb', nombre: 'antimonio', tipo: 'nometal', positivas: [3, 5], negativa: -3, anion: 'antimoniuro' },
  { simbolo: 'C', nombre: 'carbono', tipo: 'nometal', positivas: [2, 4], negativa: -4, anion: 'carburo' },
  { simbolo: 'Si', nombre: 'silicio', tipo: 'nometal', positivas: [4], negativa: -4, anion: 'siliciuro' },
  { simbolo: 'B', nombre: 'boro', tipo: 'nometal', positivas: [3], negativa: -3, anion: 'boruro' },
];

export const MAPA_ELEMENTOS: Record<string, Elemento> = Object.fromEntries(
  ELEMENTOS.map((e) => [e.simbolo, e]),
);

/**
 * Aniones de oxoácidos y sus ácidos. Tabla curada a propósito en vez de generada por reglas:
 * las formas «orto» del fósforo, arsénico, antimonio, silicio y boro son convención escolar
 * y no salen de la regla general.
 */
export const ANIONES_OXO: AnionOxo[] = [
  // ── Cloro ──
  { formula: 'ClO', atomos: { Cl: 1, O: 1 }, carga: 1, nombre: 'hipoclorito', central: 'Cl', valencia: 1, acido: 'HClO', hidrogenos: 1, acidoTradicional: 'ácido hipocloroso', anionStock: 'oxoclorato(I)' },
  { formula: 'ClO2', atomos: { Cl: 1, O: 2 }, carga: 1, nombre: 'clorito', central: 'Cl', valencia: 3, acido: 'HClO2', hidrogenos: 1, acidoTradicional: 'ácido cloroso', anionStock: 'dioxoclorato(III)' },
  { formula: 'ClO3', atomos: { Cl: 1, O: 3 }, carga: 1, nombre: 'clorato', central: 'Cl', valencia: 5, acido: 'HClO3', hidrogenos: 1, acidoTradicional: 'ácido clórico', anionStock: 'trioxoclorato(V)' },
  { formula: 'ClO4', atomos: { Cl: 1, O: 4 }, carga: 1, nombre: 'perclorato', central: 'Cl', valencia: 7, acido: 'HClO4', hidrogenos: 1, acidoTradicional: 'ácido perclórico', anionStock: 'tetraoxoclorato(VII)' },
  // ── Bromo ──
  { formula: 'BrO', atomos: { Br: 1, O: 1 }, carga: 1, nombre: 'hipobromito', central: 'Br', valencia: 1, acido: 'HBrO', hidrogenos: 1, acidoTradicional: 'ácido hipobromoso', anionStock: 'oxobromato(I)' },
  { formula: 'BrO2', atomos: { Br: 1, O: 2 }, carga: 1, nombre: 'bromito', central: 'Br', valencia: 3, acido: 'HBrO2', hidrogenos: 1, acidoTradicional: 'ácido bromoso', anionStock: 'dioxobromato(III)' },
  { formula: 'BrO3', atomos: { Br: 1, O: 3 }, carga: 1, nombre: 'bromato', central: 'Br', valencia: 5, acido: 'HBrO3', hidrogenos: 1, acidoTradicional: 'ácido brómico', anionStock: 'trioxobromato(V)' },
  { formula: 'BrO4', atomos: { Br: 1, O: 4 }, carga: 1, nombre: 'perbromato', central: 'Br', valencia: 7, acido: 'HBrO4', hidrogenos: 1, acidoTradicional: 'ácido perbrómico', anionStock: 'tetraoxobromato(VII)' },
  // ── Yodo ──
  { formula: 'IO', atomos: { I: 1, O: 1 }, carga: 1, nombre: 'hipoyodito', central: 'I', valencia: 1, acido: 'HIO', hidrogenos: 1, acidoTradicional: 'ácido hipoyodoso', anionStock: 'oxoyodato(I)' },
  { formula: 'IO2', atomos: { I: 1, O: 2 }, carga: 1, nombre: 'yodito', central: 'I', valencia: 3, acido: 'HIO2', hidrogenos: 1, acidoTradicional: 'ácido yodoso', anionStock: 'dioxoyodato(III)' },
  { formula: 'IO3', atomos: { I: 1, O: 3 }, carga: 1, nombre: 'yodato', central: 'I', valencia: 5, acido: 'HIO3', hidrogenos: 1, acidoTradicional: 'ácido yódico', anionStock: 'trioxoyodato(V)' },
  { formula: 'IO4', atomos: { I: 1, O: 4 }, carga: 1, nombre: 'peryodato', central: 'I', valencia: 7, acido: 'HIO4', hidrogenos: 1, acidoTradicional: 'ácido peryódico', anionStock: 'tetraoxoyodato(VII)' },
  // ── Azufre, selenio, teluro ──
  { formula: 'SO2', atomos: { S: 1, O: 2 }, carga: 2, nombre: 'hiposulfito', central: 'S', valencia: 2, acido: 'H2SO2', hidrogenos: 2, acidoTradicional: 'ácido hiposulfuroso', anionStock: 'dioxosulfato(II)' },
  { formula: 'SO3', atomos: { S: 1, O: 3 }, carga: 2, nombre: 'sulfito', central: 'S', valencia: 4, acido: 'H2SO3', hidrogenos: 2, acidoTradicional: 'ácido sulfuroso', anionStock: 'trioxosulfato(IV)' },
  { formula: 'SO4', atomos: { S: 1, O: 4 }, carga: 2, nombre: 'sulfato', central: 'S', valencia: 6, acido: 'H2SO4', hidrogenos: 2, acidoTradicional: 'ácido sulfúrico', anionStock: 'tetraoxosulfato(VI)' },
  { formula: 'SeO3', atomos: { Se: 1, O: 3 }, carga: 2, nombre: 'selenito', central: 'Se', valencia: 4, acido: 'H2SeO3', hidrogenos: 2, acidoTradicional: 'ácido selenioso', anionStock: 'trioxoseleniato(IV)' },
  { formula: 'SeO4', atomos: { Se: 1, O: 4 }, carga: 2, nombre: 'seleniato', central: 'Se', valencia: 6, acido: 'H2SeO4', hidrogenos: 2, acidoTradicional: 'ácido selénico', anionStock: 'tetraoxoseleniato(VI)' },
  { formula: 'TeO3', atomos: { Te: 1, O: 3 }, carga: 2, nombre: 'telurito', central: 'Te', valencia: 4, acido: 'H2TeO3', hidrogenos: 2, acidoTradicional: 'ácido teluroso', anionStock: 'trioxotelurato(IV)' },
  { formula: 'TeO4', atomos: { Te: 1, O: 4 }, carga: 2, nombre: 'telurato', central: 'Te', valencia: 6, acido: 'H2TeO4', hidrogenos: 2, acidoTradicional: 'ácido telúrico', anionStock: 'tetraoxotelurato(VI)' },
  // ── Nitrógeno ──
  { formula: 'NO2', atomos: { N: 1, O: 2 }, carga: 1, nombre: 'nitrito', central: 'N', valencia: 3, acido: 'HNO2', hidrogenos: 1, acidoTradicional: 'ácido nitroso', anionStock: 'dioxonitrato(III)' },
  { formula: 'NO3', atomos: { N: 1, O: 3 }, carga: 1, nombre: 'nitrato', central: 'N', valencia: 5, acido: 'HNO3', hidrogenos: 1, acidoTradicional: 'ácido nítrico', anionStock: 'trioxonitrato(V)' },
  // ── Fósforo, arsénico, antimonio (formas orto) ──
  { formula: 'PO3', atomos: { P: 1, O: 3 }, carga: 3, nombre: 'fosfito', central: 'P', valencia: 3, acido: 'H3PO3', hidrogenos: 3, acidoTradicional: 'ácido fosforoso', anionStock: 'trioxofosfato(III)' },
  { formula: 'PO4', atomos: { P: 1, O: 4 }, carga: 3, nombre: 'fosfato', central: 'P', valencia: 5, acido: 'H3PO4', hidrogenos: 3, acidoTradicional: 'ácido fosfórico', anionStock: 'tetraoxofosfato(V)' },
  { formula: 'AsO3', atomos: { As: 1, O: 3 }, carga: 3, nombre: 'arsenito', central: 'As', valencia: 3, acido: 'H3AsO3', hidrogenos: 3, acidoTradicional: 'ácido arsenioso', anionStock: 'trioxoarseniato(III)' },
  { formula: 'AsO4', atomos: { As: 1, O: 4 }, carga: 3, nombre: 'arseniato', central: 'As', valencia: 5, acido: 'H3AsO4', hidrogenos: 3, acidoTradicional: 'ácido arsénico', anionStock: 'tetraoxoarseniato(V)' },
  { formula: 'SbO3', atomos: { Sb: 1, O: 3 }, carga: 3, nombre: 'antimonito', central: 'Sb', valencia: 3, acido: 'H3SbO3', hidrogenos: 3, acidoTradicional: 'ácido antimonioso', anionStock: 'trioxoantimoniato(III)' },
  { formula: 'SbO4', atomos: { Sb: 1, O: 4 }, carga: 3, nombre: 'antimoniato', central: 'Sb', valencia: 5, acido: 'H3SbO4', hidrogenos: 3, acidoTradicional: 'ácido antimónico', anionStock: 'tetraoxoantimoniato(V)' },
  // ── Carbono, silicio, boro ──
  { formula: 'CO3', atomos: { C: 1, O: 3 }, carga: 2, nombre: 'carbonato', central: 'C', valencia: 4, acido: 'H2CO3', hidrogenos: 2, acidoTradicional: 'ácido carbónico', anionStock: 'trioxocarbonato(IV)' },
  { formula: 'SiO4', atomos: { Si: 1, O: 4 }, carga: 4, nombre: 'silicato', central: 'Si', valencia: 4, acido: 'H4SiO4', hidrogenos: 4, acidoTradicional: 'ácido silícico', anionStock: 'tetraoxosilicato(IV)' },
  { formula: 'BO3', atomos: { B: 1, O: 3 }, carga: 3, nombre: 'borato', central: 'B', valencia: 3, acido: 'H3BO3', hidrogenos: 3, acidoTradicional: 'ácido bórico', anionStock: 'trioxoborato(III)' },
  // ── Cromo y manganeso ──
  { formula: 'CrO4', atomos: { Cr: 1, O: 4 }, carga: 2, nombre: 'cromato', central: 'Cr', valencia: 6, acido: 'H2CrO4', hidrogenos: 2, acidoTradicional: 'ácido crómico', anionStock: 'tetraoxocromato(VI)' },
  { formula: 'Cr2O7', atomos: { Cr: 2, O: 7 }, carga: 2, nombre: 'dicromato', central: 'Cr', valencia: 6, acido: 'H2Cr2O7', hidrogenos: 2, acidoTradicional: 'ácido dicrómico', anionStock: 'heptaoxodicromato(VI)' },
  { formula: 'MnO4', atomos: { Mn: 1, O: 4 }, carga: 2, nombre: 'manganato', central: 'Mn', valencia: 6, acido: 'H2MnO4', hidrogenos: 2, acidoTradicional: 'ácido mangánico', anionStock: 'tetraoxomanganato(VI)' },
  { formula: 'MnO4', atomos: { Mn: 1, O: 4 }, carga: 1, nombre: 'permanganato', central: 'Mn', valencia: 7, acido: 'HMnO4', hidrogenos: 1, acidoTradicional: 'ácido permangánico', anionStock: 'tetraoxomanganato(VII)' },
];

/** Hidruros de no metal con nombre propio consolidado */
export const HIDRUROS_ESPECIALES: Record<string, { comun: string; sistematica: string }> = {
  H2O: { comun: 'agua', sistematica: 'óxido de dihidrógeno' },
  NH3: { comun: 'amoniaco', sistematica: 'trihidruro de nitrógeno' },
  CH4: { comun: 'metano', sistematica: 'tetrahidruro de carbono' },
  SiH4: { comun: 'silano', sistematica: 'tetrahidruro de silicio' },
  PH3: { comun: 'fosfina (fosfano)', sistematica: 'trihidruro de fósforo' },
  AsH3: { comun: 'arsina (arsano)', sistematica: 'trihidruro de arsénico' },
  SbH3: { comun: 'estibina (estibano)', sistematica: 'trihidruro de antimonio' },
  BH3: { comun: 'borano', sistematica: 'trihidruro de boro' },
};

/** Elementos que forman peróxidos estables: hidrógeno, alcalinos y alcalinotérreos */
export const FORMAN_PEROXIDO = ['H', 'Li', 'Na', 'K', 'Rb', 'Cs', 'Be', 'Mg', 'Ca', 'Sr', 'Ba'];

export const PREFIJOS = ['', 'mono', 'di', 'tri', 'tetra', 'penta', 'hexa', 'hepta', 'octa', 'nona', 'deca'];
/** Los prefijos pierden la vocal final delante de «óxido»: tetra + óxido = tetróxido */
export const PREFIJOS_OXIDO = ['', 'mon', 'di', 'tri', 'tetr', 'pent', 'hex', 'hept', 'oct', 'non', 'dec'];
export const ROMANOS = ['0', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];
export const SUBINDICES = '₀₁₂₃₄₅₆₇₈₉';

// ═══════════════════════════════════════════════════════════════════════
// UTILIDADES
// ═══════════════════════════════════════════════════════════════════════

/** Convierte 'Fe2O3' o 'Ca(OH)2' en su versión con subíndices tipográficos */
export function embellecer(formula: string): string {
  return formula.replace(/\d+/g, (d) => d.split('').map((c) => SUBINDICES[Number(c)]).join(''));
}

export function romano(n: number): string {
  return ROMANOS[n] ?? String(n);
}

export function mcd(a: number, b: number): number {
  return b === 0 ? a : mcd(b, a % b);
}

export function normalizarTexto(t: string): string {
  return t
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function prefijo(n: number, sobreOxido: boolean): string {
  const tabla = sobreOxido ? PREFIJOS_OXIDO : PREFIJOS;
  return tabla[n] ?? `${n}-`;
}

/** Escribe un símbolo con su subíndice: ('O', 3) → 'O3' */
export function conIndice(simbolo: string, n: number): string {
  return n > 1 ? `${simbolo}${n}` : simbolo;
}

// ═══════════════════════════════════════════════════════════════════════
// PARSER DE FÓRMULAS
// ═══════════════════════════════════════════════════════════════════════

export function parsearFormula(entrada: string): { ok: true; parseo: Parseo } | { ok: false; fallo: ErrorAnalisis } {
  const f = entrada
    .replace(/\s+/g, '')
    .replace(/[₀-₉]/g, (d) => String(SUBINDICES.indexOf(d)))
    .replace(/[[{]/g, '(')
    .replace(/[\]}]/g, ')');

  if (!f) return { ok: false, fallo: { error: 'Escribe una fórmula para analizarla.', pista: null } };
  if (!/^[A-Za-z0-9()]+$/.test(f)) {
    return { ok: false, fallo: { error: 'La fórmula solo admite letras, números y paréntesis.', pista: 'Ejemplos válidos: Fe2O3, Ca(OH)2, Al2(SO4)3.' } };
  }

  const pilaComp: Record<string, number>[] = [{}];
  const pilaOrden: string[][] = [[]];
  const grupos: { formula: string; n: number }[] = [];
  let i = 0;

  while (i < f.length) {
    const c = f[i];

    if (c === '(') {
      pilaComp.push({});
      pilaOrden.push([]);
      i++;
      continue;
    }

    if (c === ')') {
      if (pilaComp.length === 1) {
        return { ok: false, fallo: { error: 'Hay un paréntesis que se cierra sin haberse abierto.', pista: null } };
      }
      i++;
      let num = '';
      while (i < f.length && /\d/.test(f[i])) {
        num += f[i];
        i++;
      }
      const mult = num ? parseInt(num, 10) : 1;
      if (mult === 0) return { ok: false, fallo: { error: 'Un subíndice no puede valer 0.', pista: null } };

      const comp = pilaComp.pop() as Record<string, number>;
      const orden = pilaOrden.pop() as string[];
      grupos.push({ formula: orden.map((s) => conIndice(s, comp[s])).join(''), n: mult });

      const destino = pilaComp[pilaComp.length - 1];
      const ordenDestino = pilaOrden[pilaOrden.length - 1];
      for (const s of orden) {
        if (!(s in destino)) ordenDestino.push(s);
        destino[s] = (destino[s] ?? 0) + comp[s] * mult;
      }
      continue;
    }

    const m = f.slice(i).match(/^([A-Z][a-z]?)(\d*)/);
    if (!m) {
      return {
        ok: false,
        fallo: {
          error: `No entiendo «${f.slice(i, i + 3)}».`,
          pista: 'Los símbolos llevan la primera letra en mayúscula y la segunda en minúscula: Fe, Na, Cl, Ca.',
        },
      };
    }
    const simbolo = m[1];
    const digitos = m[2];
    if (!MAPA_ELEMENTOS[simbolo]) {
      return {
        ok: false,
        fallo: {
          error: `El elemento «${simbolo}» no está en la tabla de esta herramienta.`,
          pista: `Se cubren ${ELEMENTOS.length} elementos: los habituales en formulación de secundaria. Revisa también las mayúsculas: «CO» es carbono con oxígeno y «Co» es cobalto.`,
        },
      };
    }
    const n = digitos ? parseInt(digitos, 10) : 1;
    if (n === 0) return { ok: false, fallo: { error: 'Un subíndice no puede valer 0.', pista: null } };

    const destino = pilaComp[pilaComp.length - 1];
    const ordenDestino = pilaOrden[pilaOrden.length - 1];
    if (!(simbolo in destino)) ordenDestino.push(simbolo);
    destino[simbolo] = (destino[simbolo] ?? 0) + n;
    i += m[0].length;
  }

  if (pilaComp.length > 1) {
    return { ok: false, fallo: { error: 'Falta cerrar un paréntesis.', pista: null } };
  }

  return {
    ok: true,
    parseo: { comp: pilaComp[0], orden: pilaOrden[0], grupos, normalizada: f },
  };
}

// ═══════════════════════════════════════════════════════════════════════
// MOTOR: FÓRMULA → NOMBRE
// ═══════════════════════════════════════════════════════════════════════

/** Adjetivo tradicional del catión según su número de oxidación */
export function adjetivoTradicional(el: Elemento, valencia: number): string | null {
  return el.tradicional?.[valencia] ?? null;
}

/** Busca en la tabla el anión oxo cuya composición y carga encajen con los átomos dados */
export function buscarAnionOxo(
  atomos: Record<string, number>,
  cargaTotalNecesaria: number,
): { anion: AnionOxo; k: number } | null {
  for (const anion of ANIONES_OXO) {
    const simbolos = Object.keys(anion.atomos);
    const simbolosDados = Object.keys(atomos);
    if (simbolos.length !== simbolosDados.length) continue;
    if (!simbolos.every((s) => s in atomos)) continue;

    const k = atomos[simbolos[0]] / anion.atomos[simbolos[0]];
    if (!Number.isInteger(k) || k < 1) continue;
    if (!simbolos.every((s) => atomos[s] === anion.atomos[s] * k)) continue;
    if (anion.carga * k !== cargaTotalNecesaria) continue;
    return { anion, k };
  }
  return null;
}

export function analizarFormula(entrada: string): ResultadoAnalisis {
  const parseado = parsearFormula(entrada);
  if (!parseado.ok) return { ok: false, fallo: parseado.fallo };

  const { comp, orden, normalizada } = parseado.parseo;
  const formulaBonita = embellecer(normalizada);
  const pasos: string[] = [];
  const avisos: string[] = [];

  // ── Sustancia simple ──
  if (orden.length === 1) {
    const el = MAPA_ELEMENTOS[orden[0]];
    const n = comp[orden[0]];
    return {
      ok: true,
      analisis: {
        formula: normalizada,
        formulaBonita,
        familia: 'sustancia-simple',
        familiaEtiqueta: 'Sustancia simple',
        sistematica: n > 1 ? `${prefijo(n, false)}${el.nombre}` : el.nombre,
        stock: el.nombre,
        tradicional: el.nombre,
        notaTradicional: null,
        oxidaciones: [{ simbolo: el.simbolo, valor: 0 }],
        pasos: [
          `Solo hay un elemento, así que no es un compuesto: es la sustancia simple ${el.nombre}.`,
          'En una sustancia simple todos los átomos tienen número de oxidación 0.',
        ],
        avisos: [],
      },
    };
  }

  const hayO = 'O' in comp;
  const hayH = 'H' in comp;
  const primero = MAPA_ELEMENTOS[orden[0]];

  // ── Hidróxidos: metal con tantos O como H ──
  if (hayO && hayH && orden.length === 3 && primero.tipo === 'metal' && comp.O === comp.H) {
    const metal = primero;
    const nMetal = comp[metal.simbolo];
    const nOH = comp.O;
    if (nOH % nMetal !== 0) {
      return { ok: false, fallo: { error: `En ${formulaBonita} los grupos OH no reparten un número entero de cargas sobre el metal.`, pista: 'Comprueba los subíndices: en un hidróxido hay tantos grupos OH como indica la valencia del metal.' } };
    }
    const valencia = nOH / nMetal;
    if (!metal.positivas.includes(valencia)) {
      avisos.push(`El ${metal.nombre} necesitaría actuar con valencia ${valencia}, y en esta tabla solo tiene ${metal.positivas.join(' y ')}. La fórmula probablemente esté mal ajustada.`);
    }
    const adj = adjetivoTradicional(metal, valencia);
    const varias = metal.positivas.length > 1;
    // El prefijo «mono» solo se escribe cuando hace falta desambiguar
    const prefOH = nOH === 1 && !varias ? '' : prefijo(nOH, false);

    pasos.push(`El grupo OH aparece ${nOH === 1 ? 'una vez' : `${nOH} veces`} y tiene carga 1−, así que es un hidróxido.`);
    pasos.push(`Para que el compuesto sea neutro, ${nMetal === 1 ? 'el átomo' : `cada uno de los ${nMetal} átomos`} de ${metal.nombre} aporta +${valencia}: ${nMetal}·(+${valencia}) + ${nOH}·(−1) = 0.`);
    pasos.push(`Sistemática: se cuentan los grupos OH → ${prefOH}hidróxido de ${metal.nombre}.`);
    pasos.push(varias
      ? `Stock: el ${metal.nombre} tiene varias valencias, así que hay que escribirla en romanos → hidróxido de ${metal.nombre}(${romano(valencia)}).`
      : `Stock: el ${metal.nombre} solo actúa con valencia ${valencia}, así que el paréntesis se omite.`);

    return {
      ok: true,
      analisis: {
        formula: normalizada,
        formulaBonita,
        familia: 'hidroxido',
        familiaEtiqueta: 'Hidróxido',
        sistematica: `${prefOH}hidróxido de ${metal.nombre}`,
        stock: varias ? `hidróxido de ${metal.nombre}(${romano(valencia)})` : `hidróxido de ${metal.nombre}`,
        tradicional: adj ? `hidróxido ${adj}` : `hidróxido de ${metal.nombre}`,
        notaTradicional: adj ? `También se admite «hidróxido de ${metal.nombre}${varias ? `(${romano(valencia)})` : ''}».` : null,
        oxidaciones: [
          { simbolo: metal.simbolo, valor: valencia },
          { simbolo: 'O', valor: -2 },
          { simbolo: 'H', valor: 1 },
        ],
        pasos,
        avisos,
      },
    };
  }

  // ── Binarios con oxígeno: óxidos y peróxidos ──
  if (hayO && orden.length === 2) {
    const otro = MAPA_ELEMENTOS[orden[0] === 'O' ? orden[1] : orden[0]];
    const nOtro = comp[otro.simbolo];
    const nO = comp.O;
    const valenciaAparente = (2 * nO) / nOtro;

    // Solo el hidrógeno, los alcalinos y los alcalinotérreos forman peróxidos estables.
    // Sin esta restricción, cualquier óxido con una valencia fuera de tabla (CrO₂) se
    // interpretaría como peróxido, que es peor que decir que la valencia no cuadra.
    const esPeroxido =
      FORMAN_PEROXIDO.includes(otro.simbolo) &&
      nO % nOtro === 0 &&
      !otro.positivas.includes(valenciaAparente) &&
      otro.positivas.includes(nO / nOtro);

    if (esPeroxido) {
      const valencia = nO / nOtro;
      const varias = otro.positivas.length > 1;
      pasos.push(`Si el oxígeno actuara con −2, el ${otro.nombre} tendría que llegar a +${valenciaAparente}, valencia que no tiene.`);
      pasos.push('La explicación es el grupo peróxido O₂²⁻, donde cada oxígeno actúa con −1 en lugar de −2.');
      pasos.push(`Con esa lectura, el ${otro.nombre} actúa con +${valencia}, que sí es una de sus valencias.`);
      return {
        ok: true,
        analisis: {
          formula: normalizada,
          formulaBonita,
          familia: 'peroxido',
          familiaEtiqueta: 'Peróxido',
          sistematica: `${prefijo(nO, true)}óxido de ${nOtro > 1 ? prefijo(nOtro, false) : ''}${otro.nombre}`,
          stock: varias ? `peróxido de ${otro.nombre}(${romano(valencia)})` : `peróxido de ${otro.nombre}`,
          tradicional: `peróxido de ${otro.nombre}`,
          notaTradicional: normalizada === 'H2O2'
            ? 'El peróxido de hidrógeno se conoce comercialmente como agua oxigenada.'
            : 'La sistemática con prefijos existe, pero para los peróxidos se prefiere el nombre con «peróxido», que deja claro el enlace O—O.',
          oxidaciones: [
            { simbolo: otro.simbolo, valor: valencia },
            { simbolo: 'O', valor: -1 },
          ],
          pasos,
          avisos,
        },
      };
    }

    if (!Number.isInteger(valenciaAparente)) {
      return { ok: false, fallo: { error: `En ${formulaBonita} los subíndices no cuadran: con el oxígeno actuando con −2, el ${otro.nombre} tendría un número de oxidación fraccionario.`, pista: 'Revisa los subíndices: en un óxido se cruzan la valencia del elemento y el 2 del oxígeno, y después se simplifica.' } };
    }
    if (!otro.positivas.includes(valenciaAparente)) {
      avisos.push(`El ${otro.nombre} tendría que actuar con valencia ${valenciaAparente}, y en la tabla básica solo tiene ${otro.positivas.join(', ')}. O los subíndices están mal, o esa valencia es de las que algunas editoriales añaden aparte (típico del cromo y del manganeso en sus óxidos ácidos).`);
    }

    const esMetal = otro.tipo === 'metal';
    const varias = otro.positivas.length > 1;
    const adj = adjetivoTradicional(otro, valenciaAparente);
    // El prefijo «mono» solo se escribe cuando hace falta desambiguar
    const necesitaMono = nO === 1 && nOtro === 1 && varias;
    const prefO = nO === 1 && !necesitaMono ? '' : prefijo(nO, true);

    pasos.push(`Hay dos elementos y uno es oxígeno, así que es un óxido${esMetal ? ' metálico (óxido básico)' : ' de no metal (óxido ácido)'}.`);
    pasos.push(`El oxígeno actúa con −2. Para que la suma dé cero: ${nOtro}·x + ${nO}·(−2) = 0 → x = +${valenciaAparente}.`);
    pasos.push(`Sistemática: se cuentan los átomos de cada lado → ${prefO}óxido de ${nOtro > 1 ? prefijo(nOtro, false) : ''}${otro.nombre}.`);

    let tradicional: string | null = null;
    let notaTradicional: string | null = null;
    if (esMetal) {
      tradicional = adj ? `óxido ${adj}` : `óxido de ${otro.nombre}`;
      if (adj) notaTradicional = `También se admite «óxido de ${otro.nombre}».`;
    } else {
      const acido = ANIONES_OXO.find((a) => a.central === otro.simbolo && a.valencia === valenciaAparente);
      if (acido) {
        tradicional = acido.acidoTradicional.replace('ácido', 'anhídrido');
        notaTradicional = 'El término «anhídrido» es tradicional: la IUPAC dejó de recomendarlo, aunque sigue siendo frecuente en clase.';
        pasos.push(`Tradicional: por ser óxido de no metal se llamaba anhídrido, con el mismo sufijo que su ácido (${acido.acidoTradicional}).`);
      }
    }

    return {
      ok: true,
      analisis: {
        formula: normalizada,
        formulaBonita,
        familia: esMetal ? 'oxido-metalico' : 'oxido-nometalico',
        familiaEtiqueta: esMetal ? 'Óxido metálico (óxido básico)' : 'Óxido de no metal (óxido ácido)',
        sistematica: `${prefO}óxido de ${nOtro > 1 ? prefijo(nOtro, false) : ''}${otro.nombre}`,
        stock: varias ? `óxido de ${otro.nombre}(${romano(valenciaAparente)})` : `óxido de ${otro.nombre}`,
        tradicional,
        notaTradicional,
        oxidaciones: [
          { simbolo: otro.simbolo, valor: valenciaAparente },
          { simbolo: 'O', valor: -2 },
        ],
        pasos,
        avisos,
      },
    };
  }

  // ── Oxoácidos: empiezan por H, llevan oxígeno y un tercer elemento ──
  if (hayH && hayO && orden.length === 3 && orden[0] === 'H') {
    const restoAtomos: Record<string, number> = {};
    for (const s of orden) if (s !== 'H') restoAtomos[s] = comp[s];
    const encontrado = buscarAnionOxo(restoAtomos, comp.H);
    if (encontrado && encontrado.k === 1) {
      const anion = encontrado.anion;
      const central = MAPA_ELEMENTOS[anion.central];
      pasos.push(`Empieza por hidrógeno y lleva oxígeno: es un oxoácido, el ácido del anión ${anion.nombre}.`);
      pasos.push(`El hidrógeno actúa con +1 y el oxígeno con −2. Despejando: ${comp.H}·(+1) + ${comp[anion.central]}·x + ${comp.O}·(−2) = 0 → el ${central.nombre} actúa con +${anion.valencia}.`);
      pasos.push(`Tradicional: el sufijo depende de esa valencia → ${anion.acidoTradicional}.`);
      pasos.push(`Al perder los hidrógenos da el anión ${anion.nombre}: el sufijo −oso pasa a −ito y el −ico pasa a −ato.`);
      return {
        ok: true,
        analisis: {
          formula: normalizada,
          formulaBonita,
          familia: 'oxoacido',
          familiaEtiqueta: 'Oxoácido',
          sistematica: null,
          stock: `${anion.anionStock} de ${comp.H > 1 ? prefijo(comp.H, false) : ''}hidrógeno`,
          tradicional: anion.acidoTradicional,
          notaTradicional: `Su anión es el ${anion.nombre} (${embellecer(anion.formula)}, carga ${anion.carga}−).`,
          oxidaciones: [
            { simbolo: 'H', valor: 1 },
            { simbolo: anion.central, valor: anion.valencia },
            { simbolo: 'O', valor: -2 },
          ],
          pasos,
          avisos,
        },
      };
    }
    return {
      ok: false,
      fallo: {
        error: `${formulaBonita} tiene forma de oxoácido, pero no aparece en la tabla de ácidos de esta herramienta.`,
        pista: 'Se cubren los oxoácidos habituales de secundaria. Prueba con H2SO4, HNO3, HClO3, H2CO3 o H3PO4.',
      },
    };
  }

  // ── Hidruros e hidrácidos: dos elementos, uno es hidrógeno ──
  if (hayH && orden.length === 2) {
    const otro = MAPA_ELEMENTOS[orden[0] === 'H' ? orden[1] : orden[0]];
    const especial = HIDRUROS_ESPECIALES[normalizada];

    if (otro.tipo === 'metal') {
      const nMetal = comp[otro.simbolo];
      const valencia = comp.H / nMetal;
      if (!Number.isInteger(valencia)) {
        return { ok: false, fallo: { error: `En ${formulaBonita} los subíndices no cuadran para un hidruro metálico.`, pista: 'En un hidruro hay tantos hidrógenos como indica la valencia del metal.' } };
      }
      if (!otro.positivas.includes(valencia)) {
        avisos.push(`El ${otro.nombre} necesitaría valencia ${valencia}, y en esta tabla solo tiene ${otro.positivas.join(' y ')}.`);
      }
      const varias = otro.positivas.length > 1;
      const adj = adjetivoTradicional(otro, valencia);
      pasos.push('Un metal combinado con hidrógeno: aquí el hidrógeno es el más electronegativo y actúa con −1.');
      pasos.push(`Por electroneutralidad, el ${otro.nombre} actúa con +${valencia}.`);
      return {
        ok: true,
        analisis: {
          formula: normalizada,
          formulaBonita,
          familia: 'hidruro-metalico',
          familiaEtiqueta: 'Hidruro metálico',
          sistematica: `${comp.H > 1 ? prefijo(comp.H, false) : ''}hidruro de ${nMetal > 1 ? prefijo(nMetal, false) : ''}${otro.nombre}`,
          stock: varias ? `hidruro de ${otro.nombre}(${romano(valencia)})` : `hidruro de ${otro.nombre}`,
          tradicional: adj ? `hidruro ${adj}` : `hidruro de ${otro.nombre}`,
          notaTradicional: null,
          oxidaciones: [
            { simbolo: otro.simbolo, valor: valencia },
            { simbolo: 'H', valor: -1 },
          ],
          pasos,
          avisos,
        },
      };
    }

    // No metal + hidrógeno
    const formaHidracido = Boolean(otro.hidracido) && comp[otro.simbolo] === 1 && comp.H === Math.abs(otro.negativa ?? 0);
    pasos.push('Un no metal combinado con hidrógeno: el hidrógeno actúa con +1.');
    if (formaHidracido) {
      pasos.push(`Disuelto en agua se comporta como ácido, y ahí recibe el nombre de ácido ${otro.hidracido}.`);
    }
    if (especial) {
      pasos.push(`Tiene además nombre propio consolidado: ${especial.comun}.`);
    }
    return {
      ok: true,
      analisis: {
        formula: normalizada,
        formulaBonita,
        familia: 'hidruro-nometalico',
        familiaEtiqueta: formaHidracido ? 'Hidruro de no metal (hidrácido en disolución)' : 'Hidruro de no metal',
        sistematica: especial
          ? especial.sistematica
          : `${comp.H > 1 ? prefijo(comp.H, false) : ''}hidruro de ${otro.nombre}`,
        stock: formaHidracido
          ? `${otro.anion} de hidrógeno`
          : especial
            ? especial.sistematica
            : `${otro.anion} de hidrógeno`,
        tradicional: formaHidracido ? `ácido ${otro.hidracido}` : especial ? especial.comun : null,
        notaTradicional: formaHidracido
          ? 'El nombre con «ácido» se reserva a la disolución acuosa; el gas puro se nombra como haluro o calcogenuro de hidrógeno.'
          : especial
            ? 'Nombre común aceptado por la IUPAC.'
            : null,
        oxidaciones: [
          { simbolo: 'H', valor: 1 },
          { simbolo: otro.simbolo, valor: otro.negativa ?? 0 },
        ],
        pasos,
        avisos,
      },
    };
  }

  // ── Sales binarias: metal + no metal ──
  if (orden.length === 2 && primero.tipo === 'metal') {
    const noMetal = MAPA_ELEMENTOS[orden[1]];
    if (noMetal.tipo !== 'nometal' || noMetal.negativa === undefined) {
      return { ok: false, fallo: { error: `No sé interpretar ${formulaBonita} como sal binaria.`, pista: 'Una sal binaria es un metal seguido de un no metal, como NaCl o CaF2.' } };
    }
    const nMetal = comp[primero.simbolo];
    const nNoMetal = comp[noMetal.simbolo];
    const cargaNeg = Math.abs(noMetal.negativa) * nNoMetal;
    if (cargaNeg % nMetal !== 0) {
      return { ok: false, fallo: { error: `En ${formulaBonita} las cargas no se compensan con números enteros.`, pista: 'Cruza la valencia del metal con la del no metal y simplifica si hace falta.' } };
    }
    const valencia = cargaNeg / nMetal;
    if (!primero.positivas.includes(valencia)) {
      avisos.push(`El ${primero.nombre} necesitaría valencia ${valencia}, y en esta tabla solo tiene ${primero.positivas.join(' y ')}. Revisa los subíndices.`);
    }
    const varias = primero.positivas.length > 1;
    const adj = adjetivoTradicional(primero, valencia);
    const necesitaMono = nNoMetal === 1 && nMetal === 1 && varias;
    const prefAnion = nNoMetal === 1 && !necesitaMono ? '' : prefijo(nNoMetal, false);

    pasos.push(`Metal más no metal, sin oxígeno: es una sal binaria. El ${noMetal.nombre} actúa con ${noMetal.negativa} y su anión se llama ${noMetal.anion}.`);
    pasos.push(`Electroneutralidad: ${nMetal}·x + ${nNoMetal}·(${noMetal.negativa}) = 0 → el ${primero.nombre} actúa con +${valencia}.`);
    pasos.push(varias
      ? `Como el ${primero.nombre} tiene varias valencias, la de stock la escribe en romanos y la tradicional la marca con el sufijo.`
      : `Como el ${primero.nombre} solo tiene una valencia, no hace falta indicarla.`);

    return {
      ok: true,
      analisis: {
        formula: normalizada,
        formulaBonita,
        familia: 'sal-binaria',
        familiaEtiqueta: 'Sal binaria (sal neutra)',
        sistematica: `${prefAnion}${noMetal.anion} de ${nMetal > 1 ? prefijo(nMetal, false) : ''}${primero.nombre}`,
        stock: varias
          ? `${noMetal.anion} de ${primero.nombre}(${romano(valencia)})`
          : `${noMetal.anion} de ${primero.nombre}`,
        tradicional: adj ? `${noMetal.anion} ${adj}` : `${noMetal.anion} de ${primero.nombre}`,
        notaTradicional: null,
        oxidaciones: [
          { simbolo: primero.simbolo, valor: valencia },
          { simbolo: noMetal.simbolo, valor: noMetal.negativa },
        ],
        pasos,
        avisos,
      },
    };
  }

  // ── Oxosales: metal + anión poliatómico con oxígeno ──
  if (hayO && orden.length >= 3 && primero.tipo === 'metal') {
    const metal = primero;
    const nMetal = comp[metal.simbolo];
    const restoAtomos: Record<string, number> = {};
    for (const s of orden) if (s !== metal.simbolo) restoAtomos[s] = comp[s];

    for (const valencia of metal.positivas) {
      const encontrado = buscarAnionOxo(restoAtomos, nMetal * valencia);
      if (!encontrado) continue;
      const anion = encontrado.anion;
      const k = encontrado.k;
      const central = MAPA_ELEMENTOS[anion.central];
      const varias = metal.positivas.length > 1;
      const adj = adjetivoTradicional(metal, valencia);
      const cargasTotales = k * anion.carga;

      pasos.push(`Un metal seguido de un grupo con oxígeno: es una oxosal. El grupo ${embellecer(anion.formula)} es el anión ${anion.nombre}, de carga ${anion.carga}−.`);
      pasos.push(`Hay ${k === 1 ? 'un anión' : `${k} aniones`} ${anion.nombre}, o sea ${cargasTotales} ${cargasTotales === 1 ? 'carga negativa' : 'cargas negativas'}. Repartidas entre ${nMetal === 1 ? 'el átomo' : `los ${nMetal} átomos`} de ${metal.nombre}: +${valencia} cada uno.`);
      pasos.push(`Ese anión viene del ${anion.acidoTradicional}, donde el ${central.nombre} actúa con +${anion.valencia}. El sufijo −ico del ácido se convierte en −ato en la sal (y el −oso, en −ito).`);

      return {
        ok: true,
        analisis: {
          formula: normalizada,
          formulaBonita,
          familia: 'oxosal',
          familiaEtiqueta: 'Oxosal (sal de oxoácido)',
          sistematica: k === 1 && !varias ? `${anion.anionStock} de ${nMetal > 1 ? prefijo(nMetal, false) : ''}${metal.nombre}` : null,
          stock: varias
            ? `${anion.nombre} de ${metal.nombre}(${romano(valencia)})`
            : `${anion.nombre} de ${metal.nombre}`,
          tradicional: adj ? `${anion.nombre} ${adj}` : `${anion.nombre} de ${metal.nombre}`,
          notaTradicional: `Procede del ${anion.acidoTradicional} (${embellecer(anion.acido)}).`,
          oxidaciones: [
            { simbolo: metal.simbolo, valor: valencia },
            { simbolo: anion.central, valor: anion.valencia },
            { simbolo: 'O', valor: -2 },
          ],
          pasos,
          avisos,
        },
      };
    }

    return {
      ok: false,
      fallo: {
        error: `Reconozco ${formulaBonita} como oxosal, pero el grupo con oxígeno no encaja con ningún anión de la tabla o no cuadran las cargas.`,
        pista: 'Comprueba los subíndices y que el anión sea uno de los habituales: sulfato, nitrato, carbonato, fosfato, clorato…',
      },
    };
  }

  return {
    ok: false,
    fallo: {
      error: `No consigo clasificar ${formulaBonita} en ninguna de las familias que cubre esta herramienta.`,
      pista: 'Se cubren óxidos, peróxidos, hidruros, hidrácidos, hidróxidos, oxoácidos, sales binarias y oxosales. Quedan fuera las sales ácidas, las dobles y los compuestos de coordinación.',
    },
  };
}

// ═══════════════════════════════════════════════════════════════════════
// MOTOR: NOMBRE → FÓRMULA
// ═══════════════════════════════════════════════════════════════════════

/** Cruza cargas y simplifica: (Al,3) + (SO4,2) → Al2(SO4)3 */
export function cruzarCargas(
  cation: string,
  valencia: number,
  anionFormula: string,
  cargaAnion: number,
  anionEsPoliatomico: boolean,
): string {
  const divisor = mcd(valencia, cargaAnion);
  const nCation = cargaAnion / divisor;
  const nAnion = valencia / divisor;
  const parteCation = conIndice(cation, nCation);
  let parteAnion: string;
  if (nAnion === 1) {
    parteAnion = anionFormula;
  } else if (anionEsPoliatomico) {
    parteAnion = `(${anionFormula})${nAnion}`;
  } else {
    parteAnion = `${anionFormula}${nAnion}`;
  }
  return `${parteCation}${parteAnion}`;
}

export interface MetalReconocido {
  el: Elemento;
  valencia: number | null;
}

export function buscarMetalPorNombre(txt: string): MetalReconocido | null {
  const t = normalizarTexto(txt);
  // Forma «hierro(III)»
  const conRomano = t.match(/^(.+?)\s*\(\s*([ivx]+)\s*\)$/);
  if (conRomano) {
    const base = conRomano[1].trim();
    const idx = ROMANOS.findIndex((r) => normalizarTexto(r) === conRomano[2]);
    const el = ELEMENTOS.find((e) => normalizarTexto(e.nombre) === base);
    if (el && idx > 0) return { el, valencia: idx };
    return null;
  }
  // Nombre limpio del elemento
  const directo = ELEMENTOS.find((e) => normalizarTexto(e.nombre) === t);
  if (directo) return { el: directo, valencia: directo.positivas.length === 1 ? directo.positivas[0] : null };
  // Adjetivo tradicional: férrico, sódico, cúprico…
  for (const el of ELEMENTOS) {
    if (!el.tradicional) continue;
    for (const clave of Object.keys(el.tradicional)) {
      if (normalizarTexto(el.tradicional[Number(clave)]) === t) return { el, valencia: Number(clave) };
    }
  }
  return null;
}

/** Reconoce el catión admitiendo prefijo multiplicador: «dihierro» → hierro, n = 2 */
export function metalDeTexto(txt: string): { metal: MetalReconocido; n: number } | null {
  const directo = buscarMetalPorNombre(txt);
  if (directo) return { metal: directo, n: 1 };
  const pref = quitarPrefijo(normalizarTexto(txt), false);
  if (pref.n > 1) {
    const conPrefijo = buscarMetalPorNombre(pref.resto);
    if (conPrefijo) return { metal: conPrefijo, n: pref.n };
  }
  return null;
}

/**
 * Quita el prefijo multiplicador inicial de una palabra y devuelve el número que representaba.
 * `explicito` distingue «monohidróxido» (prefijo escrito, n = 1) de «hidróxido» (sin prefijo),
 * que es justo lo que desambigua CuOH de Cu(OH)₂.
 */
export function quitarPrefijo(palabra: string, sobreOxido: boolean): { resto: string; n: number; explicito: boolean } {
  const tabla = sobreOxido ? PREFIJOS_OXIDO : PREFIJOS;
  for (let n = tabla.length - 1; n >= 1; n--) {
    const p = normalizarTexto(tabla[n]);
    if (p && palabra.startsWith(p) && palabra.length > p.length) {
      return { resto: palabra.slice(p.length), n, explicito: true };
    }
  }
  return { resto: palabra, n: 1, explicito: false };
}

export function nombreAFormula(entrada: string): { ok: true; formula: string } | { ok: false; fallo: ErrorAnalisis } {
  // Pega los paréntesis a la palabra —«hierro (III)» → «hierro(III)»— sin comerse el espacio
  // que va DESPUÉS del cierre, que es el que separa «trioxocarbonato(IV) de calcio».
  const t = normalizarTexto(entrada).replace(/\s+\(/g, '(').replace(/\(\s+/g, '(').replace(/\s+\)/g, ')');
  if (!t) return { ok: false, fallo: { error: 'Escribe un nombre para convertirlo en fórmula.', pista: null } };

  const noReconocido: ErrorAnalisis = {
    error: `No reconozco «${entrada.trim()}» como nombre de un compuesto inorgánico.`,
    pista: 'Prueba con formas como «óxido de hierro(III)», «trióxido de azufre», «sulfato férrico», «ácido nítrico» o «hidróxido de calcio».',
  };

  // ── Nombres propios ──
  for (const formula of Object.keys(HIDRUROS_ESPECIALES)) {
    const comun = normalizarTexto(HIDRUROS_ESPECIALES[formula].comun);
    if (t === comun || comun.replace(/\s*\(.*\)/, '') === t) return { ok: true, formula };
  }
  if (t === 'agua oxigenada' || t === 'peroxido de hidrogeno') return { ok: true, formula: 'H2O2' };

  // ── Ácidos ──
  if (t.startsWith('acido ')) {
    const resto = t.slice(6).trim();
    const hidracido = ELEMENTOS.find((e) => e.hidracido && normalizarTexto(e.hidracido) === resto);
    if (hidracido && hidracido.negativa !== undefined) {
      return { ok: true, formula: `${conIndice('H', Math.abs(hidracido.negativa))}${hidracido.simbolo}` };
    }
    const oxo = ANIONES_OXO.find((a) => normalizarTexto(a.acidoTradicional) === t);
    if (oxo) return { ok: true, formula: oxo.acido };
    return {
      ok: false,
      fallo: {
        error: `No tengo registrado el ácido «${resto}».`,
        pista: 'Los hidrácidos acaban en −hídrico (clorhídrico, sulfhídrico) y los oxoácidos en −oso o −ico (sulfuroso, nítrico).',
      },
    };
  }

  // ── Anhídridos ──
  if (t.startsWith('anhidrido ')) {
    const equivalente = `acido ${t.slice(10).trim()}`;
    const oxo = ANIONES_OXO.find((a) => normalizarTexto(a.acidoTradicional) === equivalente);
    if (oxo) return { ok: true, formula: cruzarCargas(oxo.central, oxo.valencia, 'O', 2, false) };
    return { ok: false, fallo: { error: `No tengo registrado el anhídrido «${t.slice(10)}».`, pista: 'Prueba con anhídrido sulfúrico, carbónico o nítrico.' } };
  }

  // ── Estructura «núcleo de complemento» o «núcleo adjetivo» ──
  // «óxido de hierro(III)» → núcleo «óxido», complemento «hierro(III)»
  // «óxido férrico»        → núcleo «óxido», complemento «férrico»
  const partes = t.split(' de ');
  const cabeza = partes[0].trim();
  const cola = partes.length > 1 ? partes.slice(1).join(' de ').trim() : null;
  const palabrasCabeza = cabeza.split(' ');
  const nucleo = palabrasCabeza[0];
  const complemento = cola ?? (palabrasCabeza.length > 1 ? palabrasCabeza.slice(1).join(' ') : null);

  const faltaValencia = (el: Elemento, ejemplo: string): ErrorAnalisis => ({
    error: `«${entrada.trim()}» no dice con qué valencia actúa el ${el.nombre}.`,
    pista: `El ${el.nombre} puede actuar con ${el.positivas.join(' o ')}. Indícalo en romanos: ${ejemplo}(${romano(el.positivas[0])}).`,
  });

  // Peróxidos
  if (nucleo === 'peroxido' && complemento) {
    const m = metalDeTexto(complemento);
    if (!m) return { ok: false, fallo: noReconocido };
    const valencia = m.metal.valencia ?? m.metal.el.positivas[0];
    const divisor = mcd(valencia, 2);
    return { ok: true, formula: `${conIndice(m.metal.el.simbolo, 2 / divisor)}O${2 * (valencia / divisor)}` };
  }

  // Hidróxidos
  const hidroxido = quitarPrefijo(nucleo, false);
  if (hidroxido.resto === 'hidroxido' && complemento) {
    const m = metalDeTexto(complemento);
    if (!m) return { ok: false, fallo: noReconocido };
    const valencia = m.metal.valencia ?? (hidroxido.explicito ? hidroxido.n : null);
    if (valencia === null) return { ok: false, fallo: faltaValencia(m.metal.el, `hidróxido de ${m.metal.el.nombre}`) };
    return { ok: true, formula: valencia > 1 ? `${m.metal.el.simbolo}(OH)${valencia}` : `${m.metal.el.simbolo}OH` };
  }

  // Óxidos (incluye prefijos: trióxido, dióxido…)
  const oxido = quitarPrefijo(nucleo, true);
  if (oxido.resto === 'oxido' && complemento) {
    const m = metalDeTexto(complemento);
    if (!m) return { ok: false, fallo: noReconocido };
    if (m.metal.valencia) return { ok: true, formula: cruzarCargas(m.metal.el.simbolo, m.metal.valencia, 'O', 2, false) };
    const valencia = (2 * oxido.n) / m.n;
    if (Number.isInteger(valencia) && m.metal.el.positivas.includes(valencia)) {
      return { ok: true, formula: `${conIndice(m.metal.el.simbolo, m.n)}${conIndice('O', oxido.n)}` };
    }
    return { ok: false, fallo: faltaValencia(m.metal.el, `óxido de ${m.metal.el.nombre}`) };
  }

  // Hidruros
  const hidruro = quitarPrefijo(nucleo, false);
  if (hidruro.resto === 'hidruro' && complemento) {
    const m = metalDeTexto(complemento);
    if (!m) return { ok: false, fallo: noReconocido };
    const el = m.metal.el;
    if (el.tipo === 'nometal' && el.negativa !== undefined) {
      return { ok: true, formula: `${conIndice('H', Math.abs(el.negativa))}${el.simbolo}` };
    }
    const valencia = m.metal.valencia ?? (hidruro.explicito ? hidruro.n : null);
    if (valencia === null) return { ok: false, fallo: faltaValencia(el, `hidruro de ${el.nombre}`) };
    return { ok: true, formula: `${el.simbolo}${conIndice('H', valencia)}` };
  }

  // Sales: anión (binario u oxo) + catión
  if (complemento) {
    const m = metalDeTexto(complemento);
    if (m) {
      const anionPref = quitarPrefijo(nucleo, false);
      // Anión monoatómico: cloruro, sulfuro, nitruro…
      const noMetal = ELEMENTOS.find(
        (e) => e.anion && (normalizarTexto(e.anion) === nucleo || normalizarTexto(e.anion) === anionPref.resto),
      );
      if (noMetal && noMetal.negativa !== undefined) {
        if (m.metal.valencia) {
          return { ok: true, formula: cruzarCargas(m.metal.el.simbolo, m.metal.valencia, noMetal.simbolo, Math.abs(noMetal.negativa), false) };
        }
        const valencia = (Math.abs(noMetal.negativa) * anionPref.n) / m.n;
        if (Number.isInteger(valencia) && m.metal.el.positivas.includes(valencia)) {
          return { ok: true, formula: `${conIndice(m.metal.el.simbolo, m.n)}${conIndice(noMetal.simbolo, anionPref.n)}` };
        }
        return { ok: false, fallo: faltaValencia(m.metal.el, `${nucleo} de ${m.metal.el.nombre}`) };
      }
      // Anión de oxoácido, tanto en su forma usual (sulfato) como en la de stock (tetraoxosulfato(VI))
      const anionOxo = ANIONES_OXO.find(
        (a) => normalizarTexto(a.nombre) === nucleo || normalizarTexto(a.anionStock) === nucleo,
      );
      if (anionOxo) {
        if (!m.metal.valencia) {
          return { ok: false, fallo: faltaValencia(m.metal.el, `${anionOxo.nombre} de ${m.metal.el.nombre}`) };
        }
        const poliatomico = Object.keys(anionOxo.atomos).length > 1 || anionOxo.atomos[anionOxo.central] > 1;
        return { ok: true, formula: cruzarCargas(m.metal.el.simbolo, m.metal.valencia, anionOxo.formula, anionOxo.carga, poliatomico) };
      }
    }
  }

  return { ok: false, fallo: noReconocido };
}

// ═══════════════════════════════════════════════════════════════════════
// GENERADOR DE EJERCICIOS
// ═══════════════════════════════════════════════════════════════════════

export type TipoEjercicio = 'nombrar' | 'formular';
export type NomenclaturaObjetivo = 'sistematica' | 'stock' | 'tradicional';

export interface Ejercicio {
  tipo: TipoEjercicio;
  nomenclatura: NomenclaturaObjetivo;
  formula: string;
  analisis: Analisis;
  /** Respuesta esperada */
  solucion: string;
}

export const ETIQUETA_NOMENCLATURA: Record<NomenclaturaObjetivo, string> = {
  sistematica: 'sistemática (con prefijos)',
  stock: 'de stock (con romanos)',
  tradicional: 'tradicional (con sufijos)',
};

export const METALES = ELEMENTOS.filter((e) => e.tipo === 'metal');
export const NO_METALES_SAL = ELEMENTOS.filter((e) => e.tipo === 'nometal' && e.negativa !== undefined && e.simbolo !== 'O');
export const ELEMENTOS_OXIDABLES = ELEMENTOS.filter((e) => e.positivas.length > 0 && e.simbolo !== 'O' && e.simbolo !== 'H');
export const FAMILIAS_EJERCICIO = ['oxido', 'oxido', 'hidroxido', 'sal-binaria', 'sal-binaria', 'oxosal', 'oxosal', 'oxoacido'];

export function elegir<T>(lista: T[]): T {
  return lista[Math.floor(Math.random() * lista.length)];
}

export function generarEjercicio(): Ejercicio | null {
  const familia = elegir(FAMILIAS_EJERCICIO);
  let formula: string;

  if (familia === 'oxido') {
    const el = elegir(ELEMENTOS_OXIDABLES);
    formula = cruzarCargas(el.simbolo, elegir(el.positivas), 'O', 2, false);
  } else if (familia === 'hidroxido') {
    const metal = elegir(METALES);
    const v = elegir(metal.positivas);
    formula = v > 1 ? `${metal.simbolo}(OH)${v}` : `${metal.simbolo}OH`;
  } else if (familia === 'sal-binaria') {
    const metal = elegir(METALES);
    const noMetal = elegir(NO_METALES_SAL);
    formula = cruzarCargas(metal.simbolo, elegir(metal.positivas), noMetal.simbolo, Math.abs(noMetal.negativa as number), false);
  } else if (familia === 'oxosal') {
    const metal = elegir(METALES);
    // Un metal no puede ser a la vez catión y elemento central del anión (nada de Cr2(CrO4)3)
    const anion = elegir(ANIONES_OXO.filter((a) => a.central !== metal.simbolo));
    const poli = Object.keys(anion.atomos).length > 1 || anion.atomos[anion.central] > 1;
    formula = cruzarCargas(metal.simbolo, elegir(metal.positivas), anion.formula, anion.carga, poli);
  } else {
    formula = elegir(ANIONES_OXO).acido;
  }

  const res = analizarFormula(formula);
  if (!res.ok || res.analisis.avisos.length > 0) return null;

  const disponibles = (['sistematica', 'stock', 'tradicional'] as NomenclaturaObjetivo[])
    .filter((n) => res.analisis[n]);
  if (!disponibles.length) return null;

  const nomenclatura = elegir(disponibles);
  const tipo: TipoEjercicio = Math.random() < 0.5 ? 'nombrar' : 'formular';
  return {
    tipo,
    nomenclatura,
    formula,
    analisis: res.analisis,
    solucion: res.analisis[nomenclatura] as string,
  };
}

/** Compara la respuesta admitiendo tildes ausentes y espacios de más */
export function respuestaCorrecta(dada: string, ejercicio: Ejercicio): boolean {
  if (ejercicio.tipo === 'formular') {
    const parseoDado = parsearFormula(dada);
    const parseoBueno = parsearFormula(ejercicio.formula);
    if (!parseoDado.ok || !parseoBueno.ok) return false;
    const a = parseoDado.parseo.comp;
    const b = parseoBueno.parseo.comp;
    const clavesA = Object.keys(a).sort();
    const clavesB = Object.keys(b).sort();
    return clavesA.length === clavesB.length && clavesA.every((k, i) => k === clavesB[i] && a[k] === b[k]);
  }
  const limpiar = (s: string) => normalizarTexto(s).replace(/\s+\(/g, '(').replace(/\(\s+/g, '(').replace(/\s+\)/g, ')');
  return limpiar(dada) === limpiar(ejercicio.solucion);
}

// ═══════════════════════════════════════════════════════════════════════
// EJEMPLOS
// ═══════════════════════════════════════════════════════════════════════

export const EJEMPLOS_FORMULA = [
  { formula: 'Fe2O3', etiqueta: 'Fe₂O₃ · óxido con metal de dos valencias' },
  { formula: 'SO3', etiqueta: 'SO₃ · óxido de no metal (anhídrido)' },
  { formula: 'Ca(OH)2', etiqueta: 'Ca(OH)₂ · hidróxido con paréntesis' },
  { formula: 'H2SO4', etiqueta: 'H₂SO₄ · oxoácido' },
  { formula: 'Al2(SO4)3', etiqueta: 'Al₂(SO₄)₃ · oxosal' },
  { formula: 'KMnO4', etiqueta: 'KMnO₄ · permanganato' },
  { formula: 'H2O2', etiqueta: 'H₂O₂ · peróxido' },
  { formula: 'CuCl', etiqueta: 'CuCl · sal binaria' },
];

export const EJEMPLOS_NOMBRE = [
  'óxido de hierro(III)',
  'trióxido de azufre',
  'hidróxido de calcio',
  'ácido nítrico',
  'sulfato férrico',
  'carbonato de sodio',
  'ácido clorhídrico',
  'nitrato de plata',
];
