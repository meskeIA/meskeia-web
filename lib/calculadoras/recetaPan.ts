// Receta de pan casero — lógica pura
//
// El camino INVERSO al del porcentaje del panadero (`cocina.ts`, sección 1): allí se parte de
// una fórmula que ya tienes y se normaliza; aquí se parte de lo único que el panadero
// doméstico sabe seguro —cuánta harina va a pesar— y se DEDUCE la fórmula a partir de tres
// decisiones: qué pan quiere, con qué harina y con qué fermento.
//
// Convenios que NO son libres, porque ya los fija el catálogo y dos apps del mismo sitio no
// pueden contradecirse:
//
//   · La dosis de fermento se ancla en la HARINA PREFERMENTADA, no en los gramos de masa
//     madre. Es el fix del hallazgo 288 sobre `calcularSustitucionMasaMadre`: si se fija la
//     masa madre en gramos, cambiar su hidratación cambia en silencio la harina
//     prefermentada —lo que de verdad gobierna la fermentación— y dos panaderos con el mismo
//     pan y fermentos de distinta hidratación obtienen fermentaciones distintas.
//   · La equivalencia de DOSIS levadura seca ↔ masa madre al 100 % es 1:20, la misma que usa
//     `calcularSustitucionMasaMadre`. Lo que NO se hereda es el tiempo: a igual dosis, la masa
//     madre tarda más (menos células de levadura por gramo y competencia con las bacterias
//     lácticas), y por eso sus ritmos son otros y no incluyen el pan en dos horas.
//
// Fuentes de las horquillas de hidratación: las mismas tablas que el catálogo ya publica en
// /calculadora-porcentaje-panadero/ y /guia-harinas/. Verificado: 2026-09.

import { formatNumber } from '@/lib/formatters';

// ─── 1. Tipos de pan ──────────────────────────────────────────────────────────

export type IdTipoPan = 'molde' | 'barra' | 'hogaza' | 'chapata' | 'focaccia' | 'bollos' | 'dulce';

export interface TipoPan {
  id: IdTipoPan;
  nombre: string;
  /** Los nombres con los que se conoce el mismo pan en España y en Latinoamérica. */
  alias: string;
  emoji: string;
  descripcion: string;
  /** Líquido total sobre harina (%). Incluye el agua de la leche y del huevo, no solo el agua. */
  hidratacion: number;
  sal: number;
  /** Grasa: aceite en los panes salados, mantequilla o manteca en los enriquecidos. */
  grasa: number;
  grasaNombre: string;
  azucar: number;
  leche: number;
  huevo: number;
  /** Peso orientativo de una pieza, para sugerir en cuántas sale la masa. */
  pesoPieza: number;
  /** Lo que hay que saber ANTES de meter las manos, no después. */
  consejo: string;
}

export const TIPOS_PAN: TipoPan[] = [
  {
    id: 'molde',
    nombre: 'Pan de molde',
    alias: 'pan de caja · pan lactal · pan de sándwich',
    emoji: '🍞',
    descripcion: 'Miga fina y apretada, corteza blanda. Se hornea en molde rectangular.',
    hidratacion: 62, sal: 2, grasa: 5, grasaNombre: 'Mantequilla o manteca', azucar: 5, leche: 20, huevo: 0,
    pesoPieza: 900,
    consejo: 'La grasa y el azúcar van después de que la masa ya tenga gluten formado: si entran al principio, cuesta mucho más desarrollarla.',
  },
  {
    id: 'barra',
    nombre: 'Barra o baguette',
    alias: 'pan francés · flauta · bolillo · telera',
    emoji: '🥖',
    descripcion: 'Corteza crujiente y miga semiabierta. Solo harina, agua, sal y fermento.',
    hidratacion: 66, sal: 2, grasa: 0, grasaNombre: 'Aceite de oliva', azucar: 0, leche: 0, huevo: 0,
    pesoPieza: 300,
    consejo: 'Necesita vapor en los primeros minutos de horno: una bandeja con agua hirviendo abajo, o tapar con una olla.',
  },
  {
    id: 'hogaza',
    nombre: 'Hogaza rústica',
    alias: 'pan de campo · pan de pueblo · pan casero',
    emoji: '🍞',
    descripcion: 'Pieza redonda grande, corteza gruesa y miga alveolada. El pan de toda la vida.',
    hidratacion: 72, sal: 2, grasa: 0, grasaNombre: 'Aceite de oliva', azucar: 0, leche: 0, huevo: 0,
    pesoPieza: 900,
    consejo: 'A esta hidratación la masa se pega: se trabaja con plegados cada 30 minutos en lugar de amasando sobre la mesa.',
  },
  {
    id: 'chapata',
    nombre: 'Chapata',
    alias: 'ciabatta · pan de cristal',
    emoji: '🥯',
    descripcion: 'Muy hidratada, miga de alveolos grandes e irregulares y corteza fina.',
    hidratacion: 78, sal: 2.2, grasa: 0, grasaNombre: 'Aceite de oliva', azucar: 0, leche: 0, huevo: 0,
    pesoPieza: 400,
    consejo: 'No se amasa ni se bolea: se pliega en el bol y se corta directamente sobre la tabla enharinada para no desgasarla.',
  },
  {
    id: 'focaccia',
    nombre: 'Focaccia',
    alias: 'fugazza · pan plano al horno',
    emoji: '🫓',
    descripcion: 'Pan plano en bandeja, esponjoso, con aceite abundante y sal gorda por encima.',
    hidratacion: 80, sal: 2, grasa: 6, grasaNombre: 'Aceite de oliva', azucar: 0, leche: 0, huevo: 0,
    pesoPieza: 800,
    consejo: 'Se extiende en la bandeja con los dedos untados en aceite, sin rodillo, y se deja reposar antes de hornear.',
  },
  {
    id: 'bollos',
    nombre: 'Bollos y panecillos',
    alias: 'pan de hamburguesa · pan de leche · pan de Viena',
    emoji: '🥐',
    descripcion: 'Piezas pequeñas de miga blanda y corteza dorada y fina. Masa ligeramente enriquecida.',
    hidratacion: 58, sal: 1.8, grasa: 8, grasaNombre: 'Mantequilla o manteca', azucar: 8, leche: 25, huevo: 10,
    pesoPieza: 80,
    consejo: 'Se pincelan con huevo batido o leche antes de hornear: es lo que les da el brillo y el color.',
  },
  {
    id: 'dulce',
    nombre: 'Pan dulce enriquecido',
    alias: 'brioche · roscón · pan de muerto · trenza',
    emoji: '🥮',
    descripcion: 'Masa con mucha mantequilla, huevo y azúcar. Miga sedosa que se deshilacha.',
    hidratacion: 55, sal: 1.6, grasa: 20, grasaNombre: 'Mantequilla o manteca', azucar: 15, leche: 15, huevo: 25,
    pesoPieza: 600,
    consejo: 'Pide harina de fuerza y frío: la mantequilla se incorpora poco a poco con la masa fría, y conviene un reposo en nevera antes de formar.',
  },
];

export const TIPO_PAN_POR_ID: Record<IdTipoPan, TipoPan> = TIPOS_PAN.reduce(
  (acc, t) => { acc[t.id] = t; return acc; },
  {} as Record<IdTipoPan, TipoPan>,
);

// ─── 2. Harinas ───────────────────────────────────────────────────────────────

export type IdHarina =
  | 'panificable' | 'fuerza' | 'integral' | 'espelta' | 'espelta_integral' | 'centeno' | 'semola';

export interface HarinaPan {
  id: IdHarina;
  nombre: string;
  alias: string;
  /**
   * Cuánto se corrige la hidratación del tipo de pan si TODA la harina fuera esta (puntos
   * porcentuales). Se aplica en proporción a la mezcla: media espelta corrige la mitad.
   */
  deltaHidratacion: number;
  /** Por encima de esta proporción, la masa deja de comportarse como el tipo de pan elegido. */
  maxRecomendado: number;
  aviso: string;
  nota: string;
}

export const HARINAS_PAN: HarinaPan[] = [
  {
    id: 'panificable',
    nombre: 'Trigo panificable',
    alias: 'todo uso · 0000 · W 160-250',
    deltaHidratacion: 0, maxRecomendado: 100,
    aviso: '',
    nota: 'La harina de pan de cada día. Es la referencia sobre la que se calculan las demás.',
  },
  {
    id: 'fuerza',
    nombre: 'Trigo de fuerza',
    alias: '000 · manitoba · gran fuerza · W 250+',
    deltaHidratacion: 2, maxRecomendado: 100,
    aviso: '',
    nota: 'Más proteína, así que admite algo más de agua y aguanta masas largas y enriquecidas.',
  },
  {
    id: 'integral',
    nombre: 'Integral de trigo',
    alias: 'harina integral · whole wheat',
    deltaHidratacion: 6, maxRecomendado: 80,
    aviso: 'Por encima del 80 % de integral el pan sale denso: el salvado corta las hebras de gluten mientras la masa sube.',
    nota: 'El salvado absorbe mucha agua, y además tarda: conviene un reposo de 30 minutos antes de añadir la sal.',
  },
  {
    id: 'espelta',
    nombre: 'Espelta blanca',
    alias: 'escanda · farro · spelt',
    deltaHidratacion: -4, maxRecomendado: 70,
    aviso: 'Por encima del 70 % de espelta el gluten aguanta mal: amasa poco, vigila la fermentación y no esperes tanto volumen.',
    nota: 'Absorbe menos agua que el trigo y su gluten es más frágil: se pasa de fermentación antes de lo que uno cree.',
  },
  {
    id: 'espelta_integral',
    nombre: 'Espelta integral',
    alias: 'espelta completa',
    deltaHidratacion: 2, maxRecomendado: 60,
    aviso: 'Por encima del 60 % junta los dos problemas: el salvado que corta el gluten y el gluten frágil de la espelta.',
    nota: 'Suma el salvado de la integral al gluten delicado de la espelta. Mézclala con panificable o de fuerza.',
  },
  {
    id: 'centeno',
    nombre: 'Centeno',
    alias: 'harina de centeno · rye',
    deltaHidratacion: 8, maxRecomendado: 40,
    aviso: 'Por encima del 40 % de centeno la masa se vuelve pegajosa y sube poco: es un pan denso, y ahí la masa madre no es opcional.',
    nota: 'Casi no forma gluten y sus pentosanas retienen muchísima agua: masa pegajosa que no se amasa, se mezcla.',
  },
  {
    id: 'semola',
    nombre: 'Sémola de trigo duro',
    alias: 'semolina rimacinata · harina de trigo duro',
    deltaHidratacion: -2, maxRecomendado: 50,
    aviso: 'Por encima del 50 % la miga se cierra y el pan pesa más. En pan se usa mezclada, no sola.',
    nota: 'Da color amarillo y sabor, y una miga más cerrada. Clásica del pan del sur de Italia.',
  },
];

export const HARINA_POR_ID: Record<IdHarina, HarinaPan> = HARINAS_PAN.reduce(
  (acc, h) => { acc[h.id] = h; return acc; },
  {} as Record<IdHarina, HarinaPan>,
);

// ─── 3. Fermento ──────────────────────────────────────────────────────────────

export type TipoFermento = 'seca' | 'fresca' | 'masa_madre';
export type RitmoFermentacion = 'rapido' | 'normal' | 'lento' | 'nevera';

export interface Ritmo {
  id: RitmoFermentacion;
  nombre: string;
  /**
   * Harina prefermentada sobre la harina total (%). Es el ancla: de aquí salen tanto los
   * gramos de masa madre como —por la equivalencia 1:20 al 100 %— los de levadura.
   */
  harinaPrefermentada: number;
  tiempo: string;
  /** Con masa madre los mismos gramos tardan más; por eso el texto del tiempo se separa. */
  tiempoMasaMadre: string;
  /** El pan en dos horas no existe con masa madre, y decirlo es parte del cálculo. */
  admiteMasaMadre: boolean;
}

/** Temperatura a la que están medidos los tiempos. «Ambiente» no es un número. */
export const TEMP_REFERENCIA_C = 24;

export const RITMOS: Ritmo[] = [
  {
    id: 'rapido', nombre: 'Lo antes posible', harinaPrefermentada: 12,
    tiempo: '2-3 h de primera fermentación + 1 h de formado',
    tiempoMasaMadre: '', admiteMasaMadre: false,
  },
  {
    id: 'normal', nombre: 'Esta tarde', harinaPrefermentada: 7,
    tiempo: '4-6 h de primera fermentación + 1 h de formado',
    tiempoMasaMadre: '5-7 h de primera fermentación + 1-2 h de formado',
    admiteMasaMadre: true,
  },
  {
    id: 'lento', nombre: 'Todo el día', harinaPrefermentada: 3.5,
    tiempo: '8-12 h de primera fermentación',
    tiempoMasaMadre: '8-12 h de primera fermentación + 1-2 h de formado',
    admiteMasaMadre: true,
  },
  {
    id: 'nevera', nombre: 'De un día para otro (nevera)', harinaPrefermentada: 2,
    tiempo: '1 h a temperatura ambiente + 12-24 h en la nevera',
    tiempoMasaMadre: '3-4 h a temperatura ambiente + 12-18 h en la nevera',
    admiteMasaMadre: true,
  },
];

export const RITMO_POR_ID: Record<RitmoFermentacion, Ritmo> = RITMOS.reduce(
  (acc, r) => { acc[r.id] = r; return acc; },
  {} as Record<RitmoFermentacion, Ritmo>,
);

/**
 * Gramos de levadura por cada gramo de harina prefermentada equivalente.
 *
 * Sale de invertir la equivalencia de `calcularSustitucionMasaMadre`: 1 g de levadura seca
 * ≈ 20 g de masa madre al 100 %, y esos 20 g son 10 g de harina + 10 g de agua. O sea, 1 g de
 * levadura seca por cada 10 g de harina prefermentada. La fresca, por tres.
 */
const LEVADURA_POR_HARINA_PREFERMENTADA = { seca: 1 / 10, fresca: 3 / 10 } as const;

// ─── 4. Ingredientes adicionales ──────────────────────────────────────────────

/**
 * Las tres familias, que NO son un capricho de clasificación: cada una se comporta distinto
 * en la fórmula, y esa es toda la razón por la que un ingrediente extra puede calcularse en
 * vez de quedarse en un campo de adorno.
 *
 *   · `seco`    — se suma al peso y no toca nada más.
 *   · `remojo`  — pide agua propia ANTES de entrar, y esa agua no es hidratación de la masa:
 *                 si no se remoja, la roba de la masa y el pan sale seco.
 *   · `liquido` — trae agua, azúcar o grasa dentro, y eso sí cambia la fórmula.
 */
export type FamiliaExtra = 'seco' | 'remojo' | 'liquido';

export interface IngredienteExtra {
  id: string;
  nombre: string;
  familia: FamiliaExtra;
  emoji: string;
  /** Punto de partida razonable, en % sobre la harina total. El usuario manda. */
  sugerido: number;
  /** Agua que el ingrediente trae dentro (fracción de su peso). */
  aguaPct: number;
  /** Azúcar que aporta (fracción de su peso): cuenta para el aviso de fermentación lenta. */
  azucarPct: number;
  /** Grasa que aporta (fracción de su peso). */
  grasaPct: number;
  /** Para la familia `remojo`: gramos de agua por gramo de ingrediente. */
  ratioRemojo: number;
  nota: string;
}

export const EXTRAS: IngredienteExtra[] = [
  // Sólidos que no alteran la fórmula
  { id: 'nueces', nombre: 'Nueces, almendras o avellanas', familia: 'seco', emoji: '🌰', sugerido: 15, aguaPct: 0, azucarPct: 0, grasaPct: 0, ratioRemojo: 0,
    nota: 'Tostadas y troceadas. Entran al final del amasado para no rasgar el gluten.' },
  { id: 'aceitunas', nombre: 'Aceitunas', familia: 'seco', emoji: '🫒', sugerido: 15, aguaPct: 0, azucarPct: 0, grasaPct: 0, ratioRemojo: 0,
    nota: 'Escúrrelas y sécalas bien: el líquido de conserva desajusta la hidratación y sala el pan.' },
  { id: 'queso', nombre: 'Queso en dados', familia: 'seco', emoji: '🧀', sugerido: 15, aguaPct: 0, azucarPct: 0, grasaPct: 0, ratioRemojo: 0,
    nota: 'Mejor un queso curado, que suelta menos agua en el horno.' },
  { id: 'chocolate', nombre: 'Chocolate en trozos', familia: 'seco', emoji: '🍫', sugerido: 20, aguaPct: 0, azucarPct: 0, grasaPct: 0, ratioRemojo: 0,
    nota: 'Se añade al final y con la masa fría, o se funde con el calor del amasado.' },

  // Sólidos que piden su propia agua
  { id: 'semillas', nombre: 'Semillas (girasol, lino, sésamo, calabaza)', familia: 'remojo', emoji: '🌻', sugerido: 10, aguaPct: 0, azucarPct: 0, grasaPct: 0, ratioRemojo: 1,
    nota: 'En remojo al menos 30 minutos. Sin remojar le roban el agua a la masa y el pan sale seco y se endurece antes.' },
  { id: 'avena', nombre: 'Copos de avena', familia: 'remojo', emoji: '🥣', sugerido: 10, aguaPct: 0, azucarPct: 0, grasaPct: 0, ratioRemojo: 1,
    nota: 'Remojados absorben sin secar la masa, y dan una miga más tierna.' },
  { id: 'pasas', nombre: 'Pasas, orejones o arándanos', familia: 'remojo', emoji: '🍇', sugerido: 15, aguaPct: 0, azucarPct: 0, grasaPct: 0, ratioRemojo: 0.5,
    nota: 'Remojadas y bien escurridas. Secas chupan agua de la miga y quedan duras.' },

  // Los que sí cambian la fórmula
  { id: 'miel', nombre: 'Miel', familia: 'liquido', emoji: '🍯', sugerido: 5, aguaPct: 0.18, azucarPct: 0.82, grasaPct: 0, ratioRemojo: 0,
    nota: 'Casi una quinta parte de la miel es agua, y el resto es azúcar: alimenta la levadura al principio y la frena si hay mucha.' },
  { id: 'azucar', nombre: 'Azúcar', familia: 'liquido', emoji: '🍬', sugerido: 5, aguaPct: 0, azucarPct: 1, grasaPct: 0, ratioRemojo: 0,
    nota: 'Hasta un 10 % acelera la fermentación; por encima la frena, porque le quita agua a la levadura.' },
  { id: 'aceite', nombre: 'Aceite de oliva', familia: 'liquido', emoji: '🫗', sugerido: 4, aguaPct: 0, azucarPct: 0, grasaPct: 1, ratioRemojo: 0,
    nota: 'Ablanda la miga y alarga la conservación. No cuenta como hidratación: la grasa no moja la harina, la engrasa.' },
  { id: 'mantequilla', nombre: 'Mantequilla o manteca', familia: 'liquido', emoji: '🧈', sugerido: 5, aguaPct: 0.16, azucarPct: 0, grasaPct: 0.82, ratioRemojo: 0,
    nota: 'Se añade cuando la masa ya tiene gluten formado, en trozos pequeños y fría.' },
  { id: 'leche', nombre: 'Leche', familia: 'liquido', emoji: '🥛', sugerido: 20, aguaPct: 0.87, azucarPct: 0.05, grasaPct: 0.035, ratioRemojo: 0,
    nota: 'Casi toda es agua: sustituye agua de la fórmula, no se suma a ella. Da corteza más dorada y miga más tierna.' },
  { id: 'huevo', nombre: 'Huevo', familia: 'liquido', emoji: '🥚', sugerido: 10, aguaPct: 0.75, azucarPct: 0, grasaPct: 0.1, ratioRemojo: 0,
    nota: 'Tres cuartas partes son agua. Un huevo M sin cáscara pesa unos 50 g.' },
  { id: 'yogur', nombre: 'Yogur', familia: 'liquido', emoji: '🥛', sugerido: 15, aguaPct: 0.85, azucarPct: 0.04, grasaPct: 0.035, ratioRemojo: 0,
    nota: 'Aporta agua y acidez, que refuerza el gluten y ayuda a que el pan aguante más tierno.' },
  { id: 'calabaza', nombre: 'Puré de calabaza o boniato', familia: 'liquido', emoji: '🎃', sugerido: 20, aguaPct: 0.8, azucarPct: 0.06, grasaPct: 0, ratioRemojo: 0,
    nota: 'Cuatro quintas partes son agua: si no se descuenta, la masa se vuelve incontrolable.' },
];

export const EXTRA_POR_ID: Record<string, IngredienteExtra> = EXTRAS.reduce<Record<string, IngredienteExtra>>(
  (acc, e) => { acc[e.id] = e; return acc; },
  {},
);

// ─── 5. Entrada y salida ──────────────────────────────────────────────────────

export interface ExtraElegido {
  id: string;
  /** % sobre la harina total. Lo decide el usuario; el sugerido es solo el punto de partida. */
  porcentaje: number;
}

export interface EntradaRecetaPan {
  /** Gramos de harina que el usuario va a PESAR (sin contar la que lleve dentro el fermento). */
  harinaPesada_g: number;
  tipoPan: IdTipoPan;
  harinaPrincipal: IdHarina;
  /** Qué parte del total es la harina principal (%). El resto es trigo panificable. */
  proporcionPrincipal: number;
  fermento: TipoFermento;
  ritmo: RitmoFermentacion;
  /** Hidratación de la masa madre (%), solo si el fermento lo es. */
  hidratacionMasaMadre: number;
  extras: ExtraElegido[];
}

export interface FilaIngrediente {
  nombre: string;
  gramos: number;
  /** Sobre la harina total de la fórmula (%). */
  porcentaje: number;
  nota?: string;
}

export interface ResultadoRecetaPan {
  /** Lo que el usuario pesa de harina, que es lo que pidió. */
  harinaPesada_g: number;
  /** La de la fórmula: la pesada más la que va dentro del fermento. Es la base de los %. */
  harinaTotal_g: number;
  harinas: FilaIngrediente[];
  ingredientes: FilaIngrediente[];
  extras: FilaIngrediente[];
  /** Agua del remojo de semillas y pasas. Va aparte porque NO es hidratación de la masa. */
  aguaRemojo_g: number;
  fermento: {
    tipo: TipoFermento;
    nombre: string;
    gramos: number;
    harinaPrefermentada_g: number;
    harinaEnFermento_g: number;
    aguaEnFermento_g: number;
  };
  pesoMasa_g: number;
  piezas: { cantidad: number; peso_g: number };
  hidratacion_pct: number;
  /** La que sale tras corregir por el tipo de harina, antes de descontar leche y huevo. */
  hidratacionBase_pct: number;
  tiempo: string;
  avisos: string[];
  consejo: string;
}

// ─── 6. El cálculo ────────────────────────────────────────────────────────────

const redondear = (n: number, decimales = 0): number => {
  const f = 10 ** decimales;
  return Math.round(n * f) / f;
};

/** Gramos con un decimal si la cifra es pequeña; enteros a partir de 10 g. */
const gramos = (n: number): number => (n < 10 ? redondear(n, 1) : redondear(n, 0));

/**
 * Deduce la receta completa a partir de la harina que se va a pesar y de las tres decisiones
 * del panadero. Devuelve `null` si la entrada no es utilizable.
 */
export function calcularRecetaPan(entrada: EntradaRecetaPan): ResultadoRecetaPan | null {
  const { harinaPesada_g, tipoPan, harinaPrincipal, fermento } = entrada;
  if (!(harinaPesada_g > 0) || !Number.isFinite(harinaPesada_g)) return null;

  const pan = TIPO_PAN_POR_ID[tipoPan];
  const harina = HARINA_POR_ID[harinaPrincipal];
  if (!pan || !harina) return null;

  const proporcion = Math.min(100, Math.max(0, entrada.proporcionPrincipal));
  const ritmoPedido = RITMO_POR_ID[entrada.ritmo] ?? RITMO_POR_ID.normal;
  const esMasaMadre = fermento === 'masa_madre';

  const avisos: string[] = [];

  // Con masa madre no hay pan en dos horas: se cae al ritmo inmediatamente más lento y se dice.
  let ritmo = ritmoPedido;
  if (esMasaMadre && !ritmo.admiteMasaMadre) {
    ritmo = RITMO_POR_ID.normal;
    avisos.push(
      'Con masa madre no se hace pan en dos o tres horas: el fermento necesita su tiempo aunque se aumente la dosis. La receta se ha calculado con el ritmo siguiente.',
    );
  }

  // ── Harina total de la fórmula ──
  //
  // El usuario dice cuánta harina PESA. La masa madre mete harina de más, así que la harina
  // total de la fórmula es mayor, y es sobre ella sobre la que van todos los porcentajes.
  // Con  harinaPref = p · harinaTotal  y  harinaPesada = harinaTotal − harinaPref:
  //     harinaTotal = harinaPesada / (1 − p)
  const p = ritmo.harinaPrefermentada / 100;
  const harinaTotal = esMasaMadre ? harinaPesada_g / (1 - p) : harinaPesada_g;
  const harinaPrefermentada = esMasaMadre ? harinaTotal * p : harinaTotal * p;

  // ── Hidratación ──
  const deltaHarina = (harina.deltaHidratacion * proporcion) / 100;
  const hidratacionBase = pan.hidratacion + deltaHarina;

  // ── Reparto de las harinas a pesar ──
  // La harina que aporta el fermento se descuenta siempre de la panificable: nadie refresca
  // su masa madre con la harina especial del pan que va a hacer ese día.
  const harinaPrincipal_g = (harinaTotal * proporcion) / 100;
  const harinaComplemento_g = harinaTotal - harinaPrincipal_g;
  const harinaEnFermento_g = esMasaMadre ? harinaPrefermentada : 0;

  const harinas: FilaIngrediente[] = [];
  if (proporcion >= 100) {
    harinas.push({
      nombre: harina.nombre,
      gramos: gramos(harinaPrincipal_g - harinaEnFermento_g),
      porcentaje: redondear(((harinaPrincipal_g - harinaEnFermento_g) / harinaTotal) * 100, 1),
      nota: harina.nota,
    });
  } else {
    if (harinaPrincipal_g > 0) {
      harinas.push({
        nombre: harina.nombre,
        gramos: gramos(harinaPrincipal_g),
        porcentaje: redondear((harinaPrincipal_g / harinaTotal) * 100, 1),
        nota: harina.nota,
      });
    }
    const complementoAPesar = harinaComplemento_g - harinaEnFermento_g;
    if (complementoAPesar > 0) {
      harinas.push({
        nombre: 'Trigo panificable',
        gramos: gramos(complementoAPesar),
        porcentaje: redondear((complementoAPesar / harinaTotal) * 100, 1),
        nota: 'El resto de la mezcla, que es lo que sostiene la estructura del pan.',
      });
    }
  }

  // ── Extras: su aporte de agua, azúcar y grasa entra ANTES de repartir el agua ──
  const extrasElegidos = entrada.extras
    .map((e) => ({ def: EXTRA_POR_ID[e.id], pct: e.porcentaje }))
    .filter((e): e is { def: IngredienteExtra; pct: number } => Boolean(e.def) && e.pct > 0);

  let aguaDeExtras = 0;
  let azucarDeExtras = 0;
  let grasaDeExtras = 0;
  let aguaRemojo = 0;
  let solidosPct = 0;

  const extras: FilaIngrediente[] = extrasElegidos.map(({ def, pct }) => {
    const g = (harinaTotal * pct) / 100;
    aguaDeExtras += g * def.aguaPct;
    azucarDeExtras += g * def.azucarPct;
    grasaDeExtras += g * def.grasaPct;
    if (def.familia === 'remojo') {
      aguaRemojo += g * def.ratioRemojo;
      solidosPct += pct;
    }
    if (def.familia === 'seco') solidosPct += pct;
    return { nombre: def.nombre, gramos: gramos(g), porcentaje: redondear(pct, 1), nota: def.nota };
  });

  // ── Líquidos de la propia receta (leche y huevo del tipo de pan) ──
  const leche_g = (harinaTotal * pan.leche) / 100;
  const huevo_g = (harinaTotal * pan.huevo) / 100;
  const defLeche = EXTRA_POR_ID.leche;
  const defHuevo = EXTRA_POR_ID.huevo;
  const aguaDeLeche = leche_g * defLeche.aguaPct;
  const aguaDeHuevo = huevo_g * defHuevo.aguaPct;

  // ── El agua, que es lo que queda de la hidratación tras descontar lo que ya moja ──
  const aguaObjetivo = (harinaTotal * hidratacionBase) / 100;
  const aguaEnFermento_g = esMasaMadre
    ? harinaPrefermentada * (entrada.hidratacionMasaMadre / 100)
    : 0;
  let agua_g = aguaObjetivo - aguaDeLeche - aguaDeHuevo - aguaDeExtras - aguaEnFermento_g;

  if (agua_g < 0) {
    avisos.push(
      'Los ingredientes líquidos que has añadido ya aportan más agua de la que este pan admite. La receta va sin agua añadida, y la masa quedará más húmeda de lo previsto: baja la cantidad de leche, huevo o purés.',
    );
    agua_g = 0;
  }

  // ── Sal, grasa, azúcar y fermento ──
  const sal_g = (harinaTotal * pan.sal) / 100;
  const grasa_g = (harinaTotal * pan.grasa) / 100;
  const azucar_g = (harinaTotal * pan.azucar) / 100;

  let fermento_g: number;
  let nombreFermento: string;
  if (esMasaMadre) {
    // Los gramos salen de la harina prefermentada, NO al revés: es lo que mantiene igual la
    // fermentación cuando cambia la hidratación del fermento (hallazgo 288 de la app hermana).
    fermento_g = harinaPrefermentada + aguaEnFermento_g;
    nombreFermento = `Masa madre activa (al ${formatNumber(entrada.hidratacionMasaMadre, 0)} % de hidratación)`;
  } else if (fermento === 'fresca') {
    fermento_g = harinaPrefermentada * LEVADURA_POR_HARINA_PREFERMENTADA.fresca;
    nombreFermento = 'Levadura fresca de panadería';
  } else {
    fermento_g = harinaPrefermentada * LEVADURA_POR_HARINA_PREFERMENTADA.seca;
    nombreFermento = 'Levadura seca de panadería';
  }

  // ── La lista de la compra ──
  const ingredientes: FilaIngrediente[] = [];
  if (agua_g > 0) {
    ingredientes.push({
      nombre: 'Agua',
      gramos: gramos(agua_g),
      porcentaje: redondear((agua_g / harinaTotal) * 100, 1),
      nota: 'Tibia si tienes prisa, fría si la masa va a estar mucho rato fuera.',
    });
  }
  if (leche_g > 0) {
    ingredientes.push({
      nombre: 'Leche', gramos: gramos(leche_g), porcentaje: redondear(pan.leche, 1),
      nota: 'Su agua ya está descontada del agua de arriba: si la quitas, añade esa cantidad de agua.',
    });
  }
  if (huevo_g > 0) {
    ingredientes.push({
      nombre: 'Huevo', gramos: gramos(huevo_g), porcentaje: redondear(pan.huevo, 1),
      nota: `Unos ${formatNumber(Math.max(1, Math.round(huevo_g / 50)), 0)} huevos M, sin cáscara.`,
    });
  }
  if (!esMasaMadre) {
    ingredientes.push({
      nombre: nombreFermento, gramos: gramos(fermento_g),
      porcentaje: redondear((fermento_g / harinaTotal) * 100, 2),
      nota: fermento === 'fresca'
        ? 'Desmenuzada en el agua. Si solo tienes seca, usa la tercera parte.'
        : 'Se mezcla directamente con la harina. Si solo tienes fresca, usa el triple.',
    });
  } else {
    ingredientes.push({
      nombre: nombreFermento, gramos: gramos(fermento_g),
      porcentaje: redondear((fermento_g / harinaTotal) * 100, 1),
      nota: `Recién refrescada y en su punto más alto. Lleva dentro ${formatNumber(gramos(harinaEnFermento_g), 0)} g de harina y ${formatNumber(gramos(aguaEnFermento_g), 0)} g de agua, ya descontados de arriba.`,
    });
  }
  ingredientes.push({
    nombre: 'Sal', gramos: gramos(sal_g), porcentaje: redondear(pan.sal, 1),
    nota: 'Nunca en contacto directo con la levadura: se añade con la harina o al final del amasado.',
  });
  if (grasa_g > 0) {
    ingredientes.push({
      nombre: pan.grasaNombre, gramos: gramos(grasa_g), porcentaje: redondear(pan.grasa, 1),
      nota: 'Después de que la masa tenga gluten formado, no al principio.',
    });
  }
  if (azucar_g > 0) {
    ingredientes.push({
      nombre: 'Azúcar', gramos: gramos(azucar_g), porcentaje: redondear(pan.azucar, 1),
      nota: 'Da color a la corteza además de alimentar a la levadura.',
    });
  }

  // ── Peso de la masa y en cuántas piezas sale ──
  const pesoExtras = extrasElegidos.reduce((s, { pct }) => s + (harinaTotal * pct) / 100, 0);
  const pesoMasa =
    harinaTotal + agua_g + leche_g + huevo_g + fermento_g * (esMasaMadre ? 0 : 1) +
    sal_g + grasa_g + azucar_g + pesoExtras + (esMasaMadre ? aguaEnFermento_g : 0);
  const cantidadPiezas = Math.max(1, Math.round(pesoMasa / pan.pesoPieza));

  // ── Avisos ──
  if (proporcion > harina.maxRecomendado && harina.aviso) avisos.push(harina.aviso);

  const azucarTotalPct = pan.azucar + (azucarDeExtras / harinaTotal) * 100;
  if (azucarTotalPct > 20) {
    avisos.push(
      `El azúcar de la receta llega al ${formatNumber(redondear(azucarTotalPct, 1), 1)} % de la harina. Por encima del 20 % la levadura trabaja con dificultad: cuenta con que la fermentación se alargue bastante más de lo indicado.`,
    );
  } else if (azucarTotalPct > 10) {
    avisos.push(
      `El azúcar de la receta llega al ${formatNumber(redondear(azucarTotalPct, 1), 1)} % de la harina. A partir del 10 % la fermentación empieza a frenarse: dale algo más de tiempo.`,
    );
  }

  const grasaTotalPct = pan.grasa + (grasaDeExtras / harinaTotal) * 100;
  if (grasaTotalPct > 10) {
    avisos.push(
      `Con un ${formatNumber(redondear(grasaTotalPct, 1), 1)} % de grasa, incorpórala en dos o tres veces y con la masa ya desarrollada, o el gluten no llegará a formarse.`,
    );
  }

  if (solidosPct > 30) {
    avisos.push(
      `Las inclusiones sólidas suman un ${formatNumber(redondear(solidosPct, 1), 1)} % de la harina. Por encima del 30 % cortan la miga: añádelas al final, con la masa ya formada, y no esperes un pan muy alveolado.`,
    );
  }

  if (aguaRemojo > 0) {
    avisos.push(
      `Las semillas o la fruta seca se remojan aparte con ${formatNumber(gramos(aguaRemojo), 0)} g de agua, que NO son parte de la masa. Escúrrelas bien antes de incorporarlas.`,
    );
  }

  if (hidratacionBase >= 75) {
    avisos.push(
      `Al ${formatNumber(redondear(hidratacionBase, 0), 0)} % de hidratación la masa se pega y no se amasa sobre la mesa: trabájala con plegados en el bol cada 30 minutos.`,
    );
  }

  if (esMasaMadre && (harinaPrincipal === 'centeno' || proporcion >= 60) && harina.id === 'centeno') {
    avisos.push('Con tanto centeno la masa madre no es opcional: es lo único que da acidez suficiente para que la miga no se apelmace.');
  }

  const hidratacionFinal = ((agua_g + aguaDeLeche + aguaDeHuevo + aguaDeExtras + aguaEnFermento_g) / harinaTotal) * 100;

  return {
    harinaPesada_g: gramos(harinaPesada_g),
    harinaTotal_g: gramos(harinaTotal),
    harinas,
    ingredientes,
    extras,
    aguaRemojo_g: gramos(aguaRemojo),
    fermento: {
      tipo: fermento,
      nombre: nombreFermento,
      gramos: gramos(fermento_g),
      harinaPrefermentada_g: gramos(harinaPrefermentada),
      harinaEnFermento_g: gramos(harinaEnFermento_g),
      aguaEnFermento_g: gramos(aguaEnFermento_g),
    },
    pesoMasa_g: gramos(pesoMasa),
    piezas: { cantidad: cantidadPiezas, peso_g: gramos(pesoMasa / cantidadPiezas) },
    hidratacion_pct: redondear(hidratacionFinal, 1),
    hidratacionBase_pct: redondear(hidratacionBase, 1),
    tiempo: esMasaMadre && ritmo.tiempoMasaMadre ? ritmo.tiempoMasaMadre : ritmo.tiempo,
    avisos,
    consejo: pan.consejo,
  };
}
