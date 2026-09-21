// ═══════════════════════════════════════════════════════════════════════
// DATOS DE LA TABLA DE VALENCIAS
//
// Los elementos, sus estados de oxidación y los iones poliatómicos vivían dentro de
// page.tsx. Se trasladaron aquí —sin cambiar ni un valor ni un campo— para que la ficha
// de búsqueda de aula (casos.ts) lea SUS respuestas de la MISMA tabla que ve el alumno.
// Una lista paralela escrita a mano divergiría en silencio y la app acabaría suspendiendo
// una respuesta que ella misma muestra en pantalla.
//
// Módulo de datos puro: sin React, sin DOM, sin efectos.
// ═══════════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════

export type CategoriaId =
  | 'hidrogeno'
  | 'alcalinos'
  | 'alcalinoterreos'
  | 'terreos'
  | 'carbonoideos'
  | 'nitrogenoideos'
  | 'anfigenos'
  | 'halogenos'
  | 'gases-nobles'
  | 'transicion';

export interface EstadoOxidacion {
  /** Número de oxidación con signo */
  valor: number;
  /** true = estado habitual en los ejercicios; false = poco frecuente */
  frecuente: boolean;
  /** Marca el estado con el que el elemento actúa más a menudo */
  masComun?: boolean;
  /** Fórmula de un compuesto real donde actúa con ese estado */
  ejemplo: string;
  /** Nombre del compuesto del ejemplo */
  nombreEjemplo: string;
}

export interface Elemento {
  simbolo: string;
  nombre: string;
  z: number;
  categoria: CategoriaId;
  grupo: string;
  /** Valencias (capacidad de combinación, sin signo) */
  valencias: string;
  estados: EstadoOxidacion[];
  /** Términos alternativos para el buscador (nombres tradicionales, variantes) */
  sinonimos: string[];
  /** Raíces de la nomenclatura tradicional por número de oxidación */
  tradicional?: Record<number, string>;
  /** Aclaración específica del elemento */
  nota?: string;
}

export interface IonPoliatomico {
  nombre: string;
  formula: string;
  carga: string;
  central: string;
  uso: string;
}
// ═══════════════════════════════════════════════════════════════════════
// DATOS: NÚMEROS DE OXIDACIÓN
// Cada entrada está revisada elemento a elemento. Se han omitido de forma
// deliberada los estados exóticos o de laboratorio (p. ej. Ag(II), Ag(III),
// Fe(VI), Cu(III)) para no inducir a error en un contexto escolar.
// ═══════════════════════════════════════════════════════════════════════

export const ELEMENTOS: Elemento[] = [
  // ── Hidrógeno ──────────────────────────────────────────────────────
  {
    simbolo: 'H',
    nombre: 'Hidrógeno',
    z: 1,
    categoria: 'hidrogeno',
    grupo: 'Grupo 1 (caso aparte)',
    valencias: '1',
    sinonimos: ['hidrogeno', 'hidruro', 'protio'],
    nota: 'El hidrógeno actúa con +1 frente a los no metales (H₂O, HCl) y con −1 solo en los hidruros metálicos (NaH, CaH₂), donde el metal es menos electronegativo que él.',
    estados: [
      { valor: 1, frecuente: true, masComun: true, ejemplo: 'H₂O', nombreEjemplo: 'agua' },
      { valor: -1, frecuente: false, ejemplo: 'NaH', nombreEjemplo: 'hidruro de sodio' },
    ],
  },

  // ── Grupo 1: metales alcalinos ─────────────────────────────────────
  {
    simbolo: 'Li', nombre: 'Litio', z: 3, categoria: 'alcalinos', grupo: 'Grupo 1', valencias: '1',
    sinonimos: ['litio', 'litico'], tradicional: { 1: 'lítico' },
    estados: [{ valor: 1, frecuente: true, masComun: true, ejemplo: 'Li₂O', nombreEjemplo: 'óxido de litio' }],
  },
  {
    simbolo: 'Na', nombre: 'Sodio', z: 11, categoria: 'alcalinos', grupo: 'Grupo 1', valencias: '1',
    sinonimos: ['sodio', 'sodico', 'natrio', 'sal comun'], tradicional: { 1: 'sódico' },
    estados: [{ valor: 1, frecuente: true, masComun: true, ejemplo: 'NaCl', nombreEjemplo: 'cloruro de sodio (sal común)' }],
  },
  {
    simbolo: 'K', nombre: 'Potasio', z: 19, categoria: 'alcalinos', grupo: 'Grupo 1', valencias: '1',
    sinonimos: ['potasio', 'potasico', 'kalio'], tradicional: { 1: 'potásico' },
    estados: [{ valor: 1, frecuente: true, masComun: true, ejemplo: 'K₂O', nombreEjemplo: 'óxido de potasio' }],
  },
  {
    simbolo: 'Rb', nombre: 'Rubidio', z: 37, categoria: 'alcalinos', grupo: 'Grupo 1', valencias: '1',
    sinonimos: ['rubidio'],
    estados: [{ valor: 1, frecuente: true, masComun: true, ejemplo: 'RbCl', nombreEjemplo: 'cloruro de rubidio' }],
  },
  {
    simbolo: 'Cs', nombre: 'Cesio', z: 55, categoria: 'alcalinos', grupo: 'Grupo 1', valencias: '1',
    sinonimos: ['cesio', 'caesio'],
    estados: [{ valor: 1, frecuente: true, masComun: true, ejemplo: 'CsF', nombreEjemplo: 'fluoruro de cesio' }],
  },

  // ── Grupo 2: metales alcalinotérreos ───────────────────────────────
  {
    simbolo: 'Be', nombre: 'Berilio', z: 4, categoria: 'alcalinoterreos', grupo: 'Grupo 2', valencias: '2',
    sinonimos: ['berilio', 'berilico'], tradicional: { 2: 'berílico' },
    estados: [{ valor: 2, frecuente: true, masComun: true, ejemplo: 'BeO', nombreEjemplo: 'óxido de berilio' }],
  },
  {
    simbolo: 'Mg', nombre: 'Magnesio', z: 12, categoria: 'alcalinoterreos', grupo: 'Grupo 2', valencias: '2',
    sinonimos: ['magnesio', 'magnesico'], tradicional: { 2: 'magnésico' },
    estados: [{ valor: 2, frecuente: true, masComun: true, ejemplo: 'MgCl₂', nombreEjemplo: 'cloruro de magnesio' }],
  },
  {
    simbolo: 'Ca', nombre: 'Calcio', z: 20, categoria: 'alcalinoterreos', grupo: 'Grupo 2', valencias: '2',
    sinonimos: ['calcio', 'calcico', 'cal'], tradicional: { 2: 'cálcico' },
    estados: [{ valor: 2, frecuente: true, masComun: true, ejemplo: 'CaCO₃', nombreEjemplo: 'carbonato de calcio (caliza)' }],
  },
  {
    simbolo: 'Sr', nombre: 'Estroncio', z: 38, categoria: 'alcalinoterreos', grupo: 'Grupo 2', valencias: '2',
    sinonimos: ['estroncio', 'estroncico'], tradicional: { 2: 'estróncico' },
    estados: [{ valor: 2, frecuente: true, masComun: true, ejemplo: 'SrSO₄', nombreEjemplo: 'sulfato de estroncio' }],
  },
  {
    simbolo: 'Ba', nombre: 'Bario', z: 56, categoria: 'alcalinoterreos', grupo: 'Grupo 2', valencias: '2',
    sinonimos: ['bario', 'barico'], tradicional: { 2: 'bárico' },
    estados: [{ valor: 2, frecuente: true, masComun: true, ejemplo: 'BaSO₄', nombreEjemplo: 'sulfato de bario' }],
  },

  // ── Grupo 13: térreos ──────────────────────────────────────────────
  {
    simbolo: 'B', nombre: 'Boro', z: 5, categoria: 'terreos', grupo: 'Grupo 13', valencias: '3',
    sinonimos: ['boro', 'borico', 'borato'], tradicional: { 3: 'bórico' },
    nota: 'El estado −3 solo aparece en boruros metálicos, donde el metal es claramente menos electronegativo que el boro.',
    estados: [
      { valor: 3, frecuente: true, masComun: true, ejemplo: 'B₂O₃', nombreEjemplo: 'óxido de boro' },
      { valor: -3, frecuente: false, ejemplo: 'Mg₃B₂', nombreEjemplo: 'boruro de magnesio' },
    ],
  },
  {
    simbolo: 'Al', nombre: 'Aluminio', z: 13, categoria: 'terreos', grupo: 'Grupo 13', valencias: '3',
    sinonimos: ['aluminio', 'aluminico', 'alumina'], tradicional: { 3: 'alumínico' },
    estados: [{ valor: 3, frecuente: true, masComun: true, ejemplo: 'Al₂O₃', nombreEjemplo: 'óxido de aluminio (alúmina)' }],
  },
  {
    simbolo: 'Ga', nombre: 'Galio', z: 31, categoria: 'terreos', grupo: 'Grupo 13', valencias: '3, 1',
    sinonimos: ['galio', 'galico'], tradicional: { 1: 'galioso', 3: 'gálico' },
    estados: [
      { valor: 3, frecuente: true, masComun: true, ejemplo: 'Ga₂O₃', nombreEjemplo: 'óxido de galio(III)' },
      { valor: 1, frecuente: false, ejemplo: 'Ga₂O', nombreEjemplo: 'óxido de galio(I)' },
    ],
  },
  {
    simbolo: 'In', nombre: 'Indio', z: 49, categoria: 'terreos', grupo: 'Grupo 13', valencias: '3, 1',
    sinonimos: ['indio'], tradicional: { 1: 'indioso', 3: 'índico' },
    estados: [
      { valor: 3, frecuente: true, masComun: true, ejemplo: 'In₂O₃', nombreEjemplo: 'óxido de indio(III)' },
      { valor: 1, frecuente: false, ejemplo: 'InCl', nombreEjemplo: 'cloruro de indio(I)' },
    ],
  },
  {
    simbolo: 'Tl', nombre: 'Talio', z: 81, categoria: 'terreos', grupo: 'Grupo 13', valencias: '1, 3',
    sinonimos: ['talio', 'taloso', 'talico'], tradicional: { 1: 'taloso', 3: 'tálico' },
    nota: 'En el talio el estado +1 es el más estable (efecto del par inerte), al contrario que en el resto del grupo 13.',
    estados: [
      { valor: 1, frecuente: true, masComun: true, ejemplo: 'Tl₂O', nombreEjemplo: 'óxido de talio(I)' },
      { valor: 3, frecuente: true, ejemplo: 'Tl₂O₃', nombreEjemplo: 'óxido de talio(III)' },
    ],
  },

  // ── Grupo 14: carbonoideos ─────────────────────────────────────────
  {
    simbolo: 'C', nombre: 'Carbono', z: 6, categoria: 'carbonoideos', grupo: 'Grupo 14', valencias: '4, 2',
    sinonimos: ['carbono', 'carbonico', 'carbonoso', 'carburo'], tradicional: { 2: 'carbonoso', 4: 'carbónico' },
    nota: 'En química orgánica el carbono toma valores intermedios (−3 en el CH₃ del etano, −1, 0, +1…). Aquí se recogen los estados de la formulación inorgánica.',
    estados: [
      { valor: 4, frecuente: true, masComun: true, ejemplo: 'CO₂', nombreEjemplo: 'dióxido de carbono' },
      { valor: 2, frecuente: true, ejemplo: 'CO', nombreEjemplo: 'monóxido de carbono' },
      { valor: -4, frecuente: true, ejemplo: 'CH₄', nombreEjemplo: 'metano' },
    ],
  },
  {
    simbolo: 'Si', nombre: 'Silicio', z: 14, categoria: 'carbonoideos', grupo: 'Grupo 14', valencias: '4',
    sinonimos: ['silicio', 'silice', 'silicico', 'siliciuro'], tradicional: { 4: 'silícico' },
    estados: [
      { valor: 4, frecuente: true, masComun: true, ejemplo: 'SiO₂', nombreEjemplo: 'dióxido de silicio (cuarzo)' },
      { valor: -4, frecuente: false, ejemplo: 'Mg₂Si', nombreEjemplo: 'siliciuro de magnesio' },
    ],
  },
  {
    simbolo: 'Ge', nombre: 'Germanio', z: 32, categoria: 'carbonoideos', grupo: 'Grupo 14', valencias: '4, 2',
    sinonimos: ['germanio', 'germanico', 'germanoso'], tradicional: { 2: 'germanoso', 4: 'germánico' },
    estados: [
      { valor: 4, frecuente: true, masComun: true, ejemplo: 'GeO₂', nombreEjemplo: 'óxido de germanio(IV)' },
      { valor: 2, frecuente: true, ejemplo: 'GeO', nombreEjemplo: 'óxido de germanio(II)' },
    ],
  },
  {
    simbolo: 'Sn', nombre: 'Estaño', z: 50, categoria: 'carbonoideos', grupo: 'Grupo 14', valencias: '2, 4',
    sinonimos: ['estano', 'estanio', 'estannoso', 'estannico', 'lata'], tradicional: { 2: 'estannoso', 4: 'estánnico' },
    estados: [
      { valor: 4, frecuente: true, masComun: true, ejemplo: 'SnO₂', nombreEjemplo: 'óxido de estaño(IV)' },
      { valor: 2, frecuente: true, ejemplo: 'SnCl₂', nombreEjemplo: 'cloruro de estaño(II)' },
    ],
  },
  {
    simbolo: 'Pb', nombre: 'Plomo', z: 82, categoria: 'carbonoideos', grupo: 'Grupo 14', valencias: '2, 4',
    sinonimos: ['plomo', 'plumboso', 'plumbico'], tradicional: { 2: 'plumboso', 4: 'plúmbico' },
    nota: 'En el plomo el estado +2 es más estable que el +4, al revés que en el estaño.',
    estados: [
      { valor: 2, frecuente: true, masComun: true, ejemplo: 'PbO', nombreEjemplo: 'óxido de plomo(II)' },
      { valor: 4, frecuente: true, ejemplo: 'PbO₂', nombreEjemplo: 'óxido de plomo(IV)' },
    ],
  },

  // ── Grupo 15: nitrogenoideos ───────────────────────────────────────
  {
    simbolo: 'N', nombre: 'Nitrógeno', z: 7, categoria: 'nitrogenoideos', grupo: 'Grupo 15', valencias: '3, 5 (1, 2, 4)',
    sinonimos: ['nitrogeno', 'nitrico', 'nitroso', 'nitrato', 'nitrito', 'azoe'], tradicional: { 3: 'nitroso', 5: 'nítrico' },
    nota: 'El nitrógeno recorre todos los estados de −3 a +5. En formulación escolar se usan sobre todo −3, +3 y +5; +1, +2 y +4 aparecen en los óxidos de nitrógeno.',
    estados: [
      { valor: 5, frecuente: true, masComun: true, ejemplo: 'HNO₃', nombreEjemplo: 'ácido nítrico' },
      { valor: 4, frecuente: false, ejemplo: 'NO₂', nombreEjemplo: 'dióxido de nitrógeno' },
      { valor: 3, frecuente: true, ejemplo: 'HNO₂', nombreEjemplo: 'ácido nitroso' },
      { valor: 2, frecuente: false, ejemplo: 'NO', nombreEjemplo: 'monóxido de nitrógeno' },
      { valor: 1, frecuente: false, ejemplo: 'N₂O', nombreEjemplo: 'óxido de dinitrógeno' },
      { valor: -3, frecuente: true, ejemplo: 'NH₃', nombreEjemplo: 'amoniaco' },
    ],
  },
  {
    simbolo: 'P', nombre: 'Fósforo', z: 15, categoria: 'nitrogenoideos', grupo: 'Grupo 15', valencias: '3, 5',
    sinonimos: ['fosforo', 'fosforico', 'fosforoso', 'fosfato', 'fosfuro'], tradicional: { 3: 'fosforoso', 5: 'fosfórico' },
    estados: [
      { valor: 5, frecuente: true, masComun: true, ejemplo: 'H₃PO₄', nombreEjemplo: 'ácido fosfórico' },
      { valor: 3, frecuente: true, ejemplo: 'P₂O₃', nombreEjemplo: 'óxido de fósforo(III)' },
      { valor: -3, frecuente: true, ejemplo: 'PH₃', nombreEjemplo: 'fosfano (fosfina)' },
    ],
  },
  {
    simbolo: 'As', nombre: 'Arsénico', z: 33, categoria: 'nitrogenoideos', grupo: 'Grupo 15', valencias: '3, 5',
    sinonimos: ['arsenico', 'arsenioso', 'arseniuro', 'arseniato'], tradicional: { 3: 'arsenioso', 5: 'arsénico' },
    estados: [
      { valor: 5, frecuente: true, masComun: true, ejemplo: 'H₃AsO₄', nombreEjemplo: 'ácido arsénico' },
      { valor: 3, frecuente: true, ejemplo: 'As₂O₃', nombreEjemplo: 'óxido de arsénico(III)' },
      { valor: -3, frecuente: false, ejemplo: 'GaAs', nombreEjemplo: 'arseniuro de galio' },
    ],
  },
  {
    simbolo: 'Sb', nombre: 'Antimonio', z: 51, categoria: 'nitrogenoideos', grupo: 'Grupo 15', valencias: '3, 5',
    sinonimos: ['antimonio', 'antimonioso', 'antimonico', 'estibio'], tradicional: { 3: 'antimonioso', 5: 'antimónico' },
    estados: [
      { valor: 3, frecuente: true, masComun: true, ejemplo: 'Sb₂O₃', nombreEjemplo: 'óxido de antimonio(III)' },
      { valor: 5, frecuente: true, ejemplo: 'Sb₂O₅', nombreEjemplo: 'óxido de antimonio(V)' },
      { valor: -3, frecuente: false, ejemplo: 'InSb', nombreEjemplo: 'antimoniuro de indio' },
    ],
  },
  {
    simbolo: 'Bi', nombre: 'Bismuto', z: 83, categoria: 'nitrogenoideos', grupo: 'Grupo 15', valencias: '3, 5',
    sinonimos: ['bismuto', 'bismutoso', 'bismutico'], tradicional: { 3: 'bismutoso', 5: 'bismútico' },
    estados: [
      { valor: 3, frecuente: true, masComun: true, ejemplo: 'Bi₂O₃', nombreEjemplo: 'óxido de bismuto(III)' },
      { valor: 5, frecuente: false, ejemplo: 'NaBiO₃', nombreEjemplo: 'bismutato de sodio' },
    ],
  },

  // ── Grupo 16: anfígenos ────────────────────────────────────────────
  {
    simbolo: 'O', nombre: 'Oxígeno', z: 8, categoria: 'anfigenos', grupo: 'Grupo 16', valencias: '2',
    sinonimos: ['oxigeno', 'oxido', 'peroxido'],
    nota: 'El oxígeno vale −2 casi siempre. Excepciones: −1 en los peróxidos (H₂O₂, Na₂O₂), −½ en los superóxidos (KO₂) y positivo solo frente al flúor, el único elemento más electronegativo que él (OF₂, con +2).',
    estados: [
      { valor: -2, frecuente: true, masComun: true, ejemplo: 'H₂O', nombreEjemplo: 'agua' },
      { valor: -1, frecuente: true, ejemplo: 'H₂O₂', nombreEjemplo: 'peróxido de hidrógeno (agua oxigenada)' },
      { valor: 2, frecuente: false, ejemplo: 'OF₂', nombreEjemplo: 'difluoruro de oxígeno' },
    ],
  },
  {
    simbolo: 'S', nombre: 'Azufre', z: 16, categoria: 'anfigenos', grupo: 'Grupo 16', valencias: '2, 4, 6',
    sinonimos: ['azufre', 'sulfurico', 'sulfuroso', 'sulfato', 'sulfito', 'sulfuro'], tradicional: { 4: 'sulfuroso', 6: 'sulfúrico' },
    estados: [
      { valor: 6, frecuente: true, masComun: true, ejemplo: 'H₂SO₄', nombreEjemplo: 'ácido sulfúrico' },
      { valor: 4, frecuente: true, ejemplo: 'SO₂', nombreEjemplo: 'dióxido de azufre' },
      { valor: -2, frecuente: true, ejemplo: 'H₂S', nombreEjemplo: 'sulfuro de hidrógeno' },
    ],
  },
  {
    simbolo: 'Se', nombre: 'Selenio', z: 34, categoria: 'anfigenos', grupo: 'Grupo 16', valencias: '2, 4, 6',
    sinonimos: ['selenio', 'selenioso', 'selenico', 'seleniuro'], tradicional: { 4: 'selenioso', 6: 'selénico' },
    estados: [
      { valor: 4, frecuente: true, masComun: true, ejemplo: 'SeO₂', nombreEjemplo: 'óxido de selenio(IV)' },
      { valor: 6, frecuente: true, ejemplo: 'H₂SeO₄', nombreEjemplo: 'ácido selénico' },
      { valor: -2, frecuente: true, ejemplo: 'H₂Se', nombreEjemplo: 'seleniuro de hidrógeno' },
    ],
  },
  {
    simbolo: 'Te', nombre: 'Teluro', z: 52, categoria: 'anfigenos', grupo: 'Grupo 16', valencias: '2, 4, 6',
    sinonimos: ['teluro', 'telurio', 'teluroso', 'telurico', 'telururo'], tradicional: { 4: 'teluroso', 6: 'telúrico' },
    estados: [
      { valor: 4, frecuente: true, masComun: true, ejemplo: 'TeO₂', nombreEjemplo: 'óxido de teluro(IV)' },
      { valor: 6, frecuente: true, ejemplo: 'TeO₃', nombreEjemplo: 'óxido de teluro(VI)' },
      { valor: -2, frecuente: true, ejemplo: 'H₂Te', nombreEjemplo: 'telururo de hidrógeno' },
    ],
  },

  // ── Grupo 17: halógenos ────────────────────────────────────────────
  {
    simbolo: 'F', nombre: 'Flúor', z: 9, categoria: 'halogenos', grupo: 'Grupo 17', valencias: '1',
    sinonimos: ['fluor', 'fluoruro', 'fluorhidrico'],
    nota: 'El flúor es el elemento más electronegativo de la tabla: nunca actúa con número de oxidación positivo. Su único estado en compuestos es −1.',
    estados: [{ valor: -1, frecuente: true, masComun: true, ejemplo: 'HF', nombreEjemplo: 'fluoruro de hidrógeno' }],
  },
  {
    simbolo: 'Cl', nombre: 'Cloro', z: 17, categoria: 'halogenos', grupo: 'Grupo 17', valencias: '1, 3, 5, 7',
    sinonimos: ['cloro', 'cloruro', 'hipocloroso', 'cloroso', 'clorico', 'perclorico', 'clorato', 'lejia'],
    tradicional: { 1: 'hipocloroso', 3: 'cloroso', 5: 'clórico', 7: 'perclórico' },
    estados: [
      { valor: -1, frecuente: true, masComun: true, ejemplo: 'NaCl', nombreEjemplo: 'cloruro de sodio' },
      { valor: 1, frecuente: true, ejemplo: 'HClO', nombreEjemplo: 'ácido hipocloroso' },
      { valor: 3, frecuente: true, ejemplo: 'HClO₂', nombreEjemplo: 'ácido cloroso' },
      { valor: 5, frecuente: true, ejemplo: 'HClO₃', nombreEjemplo: 'ácido clórico' },
      { valor: 7, frecuente: true, ejemplo: 'HClO₄', nombreEjemplo: 'ácido perclórico' },
    ],
  },
  {
    simbolo: 'Br', nombre: 'Bromo', z: 35, categoria: 'halogenos', grupo: 'Grupo 17', valencias: '1, 3, 5, 7',
    sinonimos: ['bromo', 'bromuro', 'bromico', 'bromato'],
    tradicional: { 1: 'hipobromoso', 3: 'bromoso', 5: 'brómico', 7: 'perbrómico' },
    estados: [
      { valor: -1, frecuente: true, masComun: true, ejemplo: 'KBr', nombreEjemplo: 'bromuro de potasio' },
      { valor: 1, frecuente: true, ejemplo: 'HBrO', nombreEjemplo: 'ácido hipobromoso' },
      { valor: 3, frecuente: false, ejemplo: 'HBrO₂', nombreEjemplo: 'ácido bromoso' },
      { valor: 5, frecuente: true, ejemplo: 'HBrO₃', nombreEjemplo: 'ácido brómico' },
      { valor: 7, frecuente: false, ejemplo: 'HBrO₄', nombreEjemplo: 'ácido perbrómico' },
    ],
  },
  {
    simbolo: 'I', nombre: 'Yodo', z: 53, categoria: 'halogenos', grupo: 'Grupo 17', valencias: '1, 3, 5, 7',
    sinonimos: ['yodo', 'iodo', 'yoduro', 'ioduro', 'yodico', 'yodato'],
    tradicional: { 1: 'hipoyodoso', 3: 'yodoso', 5: 'yódico', 7: 'peryódico' },
    estados: [
      { valor: -1, frecuente: true, masComun: true, ejemplo: 'KI', nombreEjemplo: 'yoduro de potasio' },
      { valor: 1, frecuente: true, ejemplo: 'HIO', nombreEjemplo: 'ácido hipoyodoso' },
      { valor: 3, frecuente: false, ejemplo: 'HIO₂', nombreEjemplo: 'ácido yodoso' },
      { valor: 5, frecuente: true, ejemplo: 'HIO₃', nombreEjemplo: 'ácido yódico' },
      { valor: 7, frecuente: true, ejemplo: 'HIO₄', nombreEjemplo: 'ácido peryódico' },
    ],
  },

  // ── Grupo 18: gases nobles ─────────────────────────────────────────
  {
    simbolo: 'He', nombre: 'Helio', z: 2, categoria: 'gases-nobles', grupo: 'Grupo 18', valencias: '0',
    sinonimos: ['helio'],
    nota: 'No se conoce ningún compuesto químico estable del helio: su número de oxidación es siempre 0.',
    estados: [{ valor: 0, frecuente: true, masComun: true, ejemplo: 'He', nombreEjemplo: 'helio (elemento libre)' }],
  },
  {
    simbolo: 'Ne', nombre: 'Neón', z: 10, categoria: 'gases-nobles', grupo: 'Grupo 18', valencias: '0',
    sinonimos: ['neon'],
    nota: 'No se conocen compuestos estables del neón: número de oxidación 0.',
    estados: [{ valor: 0, frecuente: true, masComun: true, ejemplo: 'Ne', nombreEjemplo: 'neón (elemento libre)' }],
  },
  {
    simbolo: 'Ar', nombre: 'Argón', z: 18, categoria: 'gases-nobles', grupo: 'Grupo 18', valencias: '0',
    sinonimos: ['argon'],
    nota: 'No forma compuestos estables en condiciones ordinarias: número de oxidación 0.',
    estados: [{ valor: 0, frecuente: true, masComun: true, ejemplo: 'Ar', nombreEjemplo: 'argón (elemento libre)' }],
  },
  {
    simbolo: 'Kr', nombre: 'Kriptón', z: 36, categoria: 'gases-nobles', grupo: 'Grupo 18', valencias: '0, 2',
    sinonimos: ['kripton', 'cripton'],
    estados: [
      { valor: 0, frecuente: true, masComun: true, ejemplo: 'Kr', nombreEjemplo: 'kriptón (elemento libre)' },
      { valor: 2, frecuente: false, ejemplo: 'KrF₂', nombreEjemplo: 'difluoruro de kriptón' },
    ],
  },
  {
    simbolo: 'Xe', nombre: 'Xenón', z: 54, categoria: 'gases-nobles', grupo: 'Grupo 18', valencias: '0, 2, 4, 6, 8',
    sinonimos: ['xenon'],
    nota: 'El xenón es el gas noble con más química conocida, pero solo frente a los dos elementos más electronegativos: flúor y oxígeno.',
    estados: [
      { valor: 0, frecuente: true, masComun: true, ejemplo: 'Xe', nombreEjemplo: 'xenón (elemento libre)' },
      { valor: 2, frecuente: false, ejemplo: 'XeF₂', nombreEjemplo: 'difluoruro de xenón' },
      { valor: 4, frecuente: false, ejemplo: 'XeF₄', nombreEjemplo: 'tetrafluoruro de xenón' },
      { valor: 6, frecuente: false, ejemplo: 'XeO₃', nombreEjemplo: 'trióxido de xenón' },
      { valor: 8, frecuente: false, ejemplo: 'XeO₄', nombreEjemplo: 'tetraóxido de xenón' },
    ],
  },

  // ── Metales de transición ──────────────────────────────────────────
  {
    simbolo: 'Cr', nombre: 'Cromo', z: 24, categoria: 'transicion', grupo: 'Grupo 6', valencias: '2, 3, 6',
    sinonimos: ['cromo', 'cromoso', 'cromico', 'cromato', 'dicromato'], tradicional: { 2: 'cromoso', 3: 'crómico' },
    nota: 'El estado +3 es el más estable. El +6 solo aparece en oxoaniones (cromato CrO₄²⁻ y dicromato Cr₂O₇²⁻), que son oxidantes fuertes.',
    estados: [
      { valor: 3, frecuente: true, masComun: true, ejemplo: 'Cr₂O₃', nombreEjemplo: 'óxido de cromo(III)' },
      { valor: 6, frecuente: true, ejemplo: 'K₂Cr₂O₇', nombreEjemplo: 'dicromato de potasio' },
      { valor: 2, frecuente: false, ejemplo: 'CrO', nombreEjemplo: 'óxido de cromo(II)' },
    ],
  },
  {
    simbolo: 'Mn', nombre: 'Manganeso', z: 25, categoria: 'transicion', grupo: 'Grupo 7', valencias: '2, 3, 4, 6, 7',
    sinonimos: ['manganeso', 'manganoso', 'manganico', 'permanganato', 'manganato'], tradicional: { 2: 'manganoso', 3: 'mangánico' },
    nota: 'Es el elemento con más estados de uso escolar. Los que hay que reconocer sí o sí: +2 (sales de manganeso), +4 (MnO₂ de las pilas) y +7 (permanganato, KMnO₄, morado intenso).',
    estados: [
      { valor: 2, frecuente: true, masComun: true, ejemplo: 'MnCl₂', nombreEjemplo: 'cloruro de manganeso(II)' },
      { valor: 4, frecuente: true, ejemplo: 'MnO₂', nombreEjemplo: 'dióxido de manganeso' },
      { valor: 7, frecuente: true, ejemplo: 'KMnO₄', nombreEjemplo: 'permanganato de potasio' },
      { valor: 3, frecuente: false, ejemplo: 'Mn₂O₃', nombreEjemplo: 'óxido de manganeso(III)' },
      { valor: 6, frecuente: false, ejemplo: 'K₂MnO₄', nombreEjemplo: 'manganato de potasio' },
    ],
  },
  {
    simbolo: 'Fe', nombre: 'Hierro', z: 26, categoria: 'transicion', grupo: 'Grupo 8', valencias: '2, 3',
    sinonimos: ['hierro', 'fierro', 'ferroso', 'ferrico', 'ferro'], tradicional: { 2: 'ferroso', 3: 'férrico' },
    estados: [
      { valor: 3, frecuente: true, masComun: true, ejemplo: 'Fe₂O₃', nombreEjemplo: 'óxido de hierro(III) (herrumbre)' },
      { valor: 2, frecuente: true, ejemplo: 'FeCl₂', nombreEjemplo: 'cloruro de hierro(II)' },
    ],
  },
  {
    simbolo: 'Co', nombre: 'Cobalto', z: 27, categoria: 'transicion', grupo: 'Grupo 9', valencias: '2, 3',
    sinonimos: ['cobalto', 'cobaltoso', 'cobaltico'], tradicional: { 2: 'cobaltoso', 3: 'cobáltico' },
    estados: [
      { valor: 2, frecuente: true, masComun: true, ejemplo: 'CoCl₂', nombreEjemplo: 'cloruro de cobalto(II)' },
      { valor: 3, frecuente: true, ejemplo: 'Co₂O₃', nombreEjemplo: 'óxido de cobalto(III)' },
    ],
  },
  {
    simbolo: 'Ni', nombre: 'Níquel', z: 28, categoria: 'transicion', grupo: 'Grupo 10', valencias: '2, 3',
    sinonimos: ['niquel', 'niqueloso', 'niquelico'], tradicional: { 2: 'niqueloso', 3: 'niquélico' },
    estados: [
      { valor: 2, frecuente: true, masComun: true, ejemplo: 'NiSO₄', nombreEjemplo: 'sulfato de níquel(II)' },
      { valor: 3, frecuente: false, ejemplo: 'Ni₂O₃', nombreEjemplo: 'óxido de níquel(III)' },
    ],
  },
  {
    simbolo: 'Cu', nombre: 'Cobre', z: 29, categoria: 'transicion', grupo: 'Grupo 11', valencias: '1, 2',
    sinonimos: ['cobre', 'cuproso', 'cuprico'], tradicional: { 1: 'cuproso', 2: 'cúprico' },
    estados: [
      { valor: 2, frecuente: true, masComun: true, ejemplo: 'CuSO₄', nombreEjemplo: 'sulfato de cobre(II) (azul)' },
      { valor: 1, frecuente: true, ejemplo: 'Cu₂O', nombreEjemplo: 'óxido de cobre(I)' },
    ],
  },
  {
    simbolo: 'Zn', nombre: 'Zinc', z: 30, categoria: 'transicion', grupo: 'Grupo 12', valencias: '2',
    sinonimos: ['zinc', 'cinc', 'cincico'], tradicional: { 2: 'cíncico' },
    nota: 'A pesar de estar en el bloque d, el zinc actúa siempre con +2: su subcapa d está llena y no participa.',
    estados: [{ valor: 2, frecuente: true, masComun: true, ejemplo: 'ZnO', nombreEjemplo: 'óxido de zinc' }],
  },
  {
    simbolo: 'Ag', nombre: 'Plata', z: 47, categoria: 'transicion', grupo: 'Grupo 11', valencias: '1',
    sinonimos: ['plata', 'argentico', 'argento'], tradicional: { 1: 'argéntico' },
    nota: 'En la práctica escolar la plata actúa siempre con +1. Existen compuestos de Ag(II) y Ag(III), pero son de laboratorio especializado.',
    estados: [{ valor: 1, frecuente: true, masComun: true, ejemplo: 'AgNO₃', nombreEjemplo: 'nitrato de plata' }],
  },
  {
    simbolo: 'Cd', nombre: 'Cadmio', z: 48, categoria: 'transicion', grupo: 'Grupo 12', valencias: '2',
    sinonimos: ['cadmio', 'cadmico'], tradicional: { 2: 'cádmico' },
    estados: [{ valor: 2, frecuente: true, masComun: true, ejemplo: 'CdS', nombreEjemplo: 'sulfuro de cadmio' }],
  },
  {
    simbolo: 'Pt', nombre: 'Platino', z: 78, categoria: 'transicion', grupo: 'Grupo 10', valencias: '2, 4',
    sinonimos: ['platino', 'platinoso', 'platinico'], tradicional: { 2: 'platinoso', 4: 'platínico' },
    estados: [
      { valor: 4, frecuente: true, masComun: true, ejemplo: 'PtO₂', nombreEjemplo: 'óxido de platino(IV)' },
      { valor: 2, frecuente: true, ejemplo: 'PtCl₂', nombreEjemplo: 'cloruro de platino(II)' },
    ],
  },
  {
    simbolo: 'Au', nombre: 'Oro', z: 79, categoria: 'transicion', grupo: 'Grupo 11', valencias: '1, 3',
    sinonimos: ['oro', 'auroso', 'aurico', 'aurum'], tradicional: { 1: 'auroso', 3: 'áurico' },
    estados: [
      { valor: 3, frecuente: true, masComun: true, ejemplo: 'AuCl₃', nombreEjemplo: 'cloruro de oro(III)' },
      { valor: 1, frecuente: true, ejemplo: 'AuCl', nombreEjemplo: 'cloruro de oro(I)' },
    ],
  },
  {
    simbolo: 'Hg', nombre: 'Mercurio', z: 80, categoria: 'transicion', grupo: 'Grupo 12', valencias: '1, 2',
    sinonimos: ['mercurio', 'mercurioso', 'mercurico', 'azogue'], tradicional: { 1: 'mercurioso', 2: 'mercúrico' },
    nota: 'En el estado +1 el mercurio aparece siempre como ion diatómico Hg₂²⁺; por eso el cloruro de mercurio(I) se escribe Hg₂Cl₂ y no HgCl.',
    estados: [
      { valor: 2, frecuente: true, masComun: true, ejemplo: 'HgO', nombreEjemplo: 'óxido de mercurio(II)' },
      { valor: 1, frecuente: true, ejemplo: 'Hg₂Cl₂', nombreEjemplo: 'cloruro de mercurio(I)' },
    ],
  },
];
// ═══════════════════════════════════════════════════════════════════════
// DATOS: IONES POLIATÓMICOS
// ═══════════════════════════════════════════════════════════════════════

export const IONES: IonPoliatomico[] = [
  { nombre: 'Amonio', formula: 'NH₄⁺', carga: '+1', central: 'N: −3', uso: 'Único catión poliatómico frecuente. Cloruro de amonio, NH₄Cl.' },
  { nombre: 'Hidróxido', formula: 'OH⁻', carga: '−1', central: 'O: −2 · H: +1', uso: 'Base de todos los hidróxidos: NaOH, Ca(OH)₂.' },
  { nombre: 'Nitrato', formula: 'NO₃⁻', carga: '−1', central: 'N: +5', uso: 'Fertilizantes y explosivos. KNO₃, AgNO₃.' },
  { nombre: 'Nitrito', formula: 'NO₂⁻', carga: '−1', central: 'N: +3', uso: 'Conservante de embutidos. NaNO₂.' },
  { nombre: 'Sulfato', formula: 'SO₄²⁻', carga: '−2', central: 'S: +6', uso: 'El oxoanión más habitual. CuSO₄, CaSO₄ (yeso).' },
  { nombre: 'Sulfito', formula: 'SO₃²⁻', carga: '−2', central: 'S: +4', uso: 'Antioxidante en vinos. Na₂SO₃.' },
  { nombre: 'Hidrogenosulfato (bisulfato)', formula: 'HSO₄⁻', carga: '−1', central: 'S: +6', uso: 'Sulfato que conserva un hidrógeno ácido. NaHSO₄.' },
  { nombre: 'Carbonato', formula: 'CO₃²⁻', carga: '−2', central: 'C: +4', uso: 'Caliza, mármol y conchas. CaCO₃.' },
  { nombre: 'Hidrogenocarbonato (bicarbonato)', formula: 'HCO₃⁻', carga: '−1', central: 'C: +4', uso: 'Bicarbonato de sodio, NaHCO₃.' },
  { nombre: 'Fosfato', formula: 'PO₄³⁻', carga: '−3', central: 'P: +5', uso: 'Huesos, ADN y detergentes. Ca₃(PO₄)₂.' },
  { nombre: 'Fosfito', formula: 'PO₃³⁻', carga: '−3', central: 'P: +3', uso: 'Fungicidas agrícolas. K₃PO₃.' },
  { nombre: 'Hipoclorito', formula: 'ClO⁻', carga: '−1', central: 'Cl: +1', uso: 'Principio activo de la lejía. NaClO.' },
  { nombre: 'Clorito', formula: 'ClO₂⁻', carga: '−1', central: 'Cl: +3', uso: 'Blanqueante industrial. NaClO₂.' },
  { nombre: 'Clorato', formula: 'ClO₃⁻', carga: '−1', central: 'Cl: +5', uso: 'Herbicidas y pirotecnia. KClO₃.' },
  { nombre: 'Perclorato', formula: 'ClO₄⁻', carga: '−1', central: 'Cl: +7', uso: 'Propulsante de cohetes. NH₄ClO₄.' },
  { nombre: 'Permanganato', formula: 'MnO₄⁻', carga: '−1', central: 'Mn: +7', uso: 'Oxidante fuerte de color violeta. KMnO₄.' },
  { nombre: 'Manganato', formula: 'MnO₄²⁻', carga: '−2', central: 'Mn: +6', uso: 'Intermedio verde en medio básico. K₂MnO₄.' },
  { nombre: 'Cromato', formula: 'CrO₄²⁻', carga: '−2', central: 'Cr: +6', uso: 'Amarillo; vira a dicromato en medio ácido. K₂CrO₄.' },
  { nombre: 'Dicromato', formula: 'Cr₂O₇²⁻', carga: '−2', central: 'Cr: +6', uso: 'Naranja; oxidante clásico de laboratorio. K₂Cr₂O₇.' },
  { nombre: 'Peróxido', formula: 'O₂²⁻', carga: '−2', central: 'O: −1', uso: 'Cada oxígeno vale −1, no −2. Na₂O₂, H₂O₂.' },
  { nombre: 'Cianuro', formula: 'CN⁻', carga: '−1', central: 'C: +2 · N: −3', uso: 'Muy tóxico; usado en minería del oro. KCN.' },
  { nombre: 'Tiosulfato', formula: 'S₂O₃²⁻', carga: '−2', central: 'S: +2 (valor medio)', uso: 'Fijador fotográfico y antídoto. Na₂S₂O₃.' },
  { nombre: 'Acetato', formula: 'CH₃COO⁻', carga: '−1', central: 'C: −3 y +3', uso: 'Anión del vinagre. CH₃COONa.' },
  { nombre: 'Oxalato', formula: 'C₂O₄²⁻', carga: '−2', central: 'C: +3', uso: 'Presente en espinacas; forma cálculos renales. CaC₂O₄.' },
  { nombre: 'Silicato', formula: 'SiO₄⁴⁻', carga: '−4', central: 'Si: +4', uso: 'Unidad básica de la corteza terrestre. Mg₂SiO₄.' },
  { nombre: 'Borato', formula: 'BO₃³⁻', carga: '−3', central: 'B: +3', uso: 'Bórax y vidrios resistentes. Na₃BO₃.' },
];
