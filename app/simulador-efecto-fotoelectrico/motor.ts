/**
 * Motor del efecto fotoeléctrico (ecuación de Einstein, 1905).
 *
 *   E_fotón = h·f = h·c/λ
 *   E_c,máx = h·f − φ          si h·f > φ; si no, NO se emite ningún electrón
 *   f₀ = φ/h                   frecuencia umbral
 *   λ₀ = h·c/φ                 longitud de onda umbral
 *   v_máx = √(2·E_c,máx/mₑ)    velocidad máxima de los fotoelectrones (no relativista)
 *   V₀ = E_c,máx/e             potencial de frenado: en voltios, el MISMO número que E_c en eV
 *
 * La intensidad de la luz NO aparece en ninguna de esas fórmulas: solo cambia el NÚMERO de
 * fotones por segundo y, por tanto, el número de electrones (la corriente). Es justo lo que la
 * física clásica no podía explicar y lo que Einstein propuso en 1905; el motor lo refleja en
 * `corrienteRelativa`, que es la única función que recibe la intensidad.
 *
 * El cálculo de la velocidad es clásico: con E_c ≤ ~12 eV (el máximo que da este simulador,
 * λ = 100 nm) frente a los 511 keV de la energía en reposo del electrón, la corrección
 * relativista es del orden de 10⁻⁵ y no se ve en ninguna cifra publicada.
 *
 * Funciones puras y sin dependencias. Casos resueltos a mano en
 * tests/efecto-fotoelectrico-motor.spec.ts.
 */

// ─── Constantes físicas (CODATA 2018) ────────────────────────────────────────
// h, e y c son EXACTAS desde la redefinición del SI de 2019 (CODATA 2018 las recoge así).
// mₑ es medida: valor recomendado CODATA 2018, incertidumbre relativa 3,0·10⁻¹⁰.

/** Constante de Planck h (J·s). Exacta. CODATA 2018. */
export const H_PLANCK = 6.62607015e-34;
/** Carga elemental e (C). Exacta. CODATA 2018. También el factor J ↔ eV. */
export const CARGA_ELEMENTAL = 1.602176634e-19;
/** Velocidad de la luz en el vacío c (m/s). Exacta. CODATA 2018. */
export const VELOCIDAD_LUZ = 299_792_458;
/** Masa del electrón mₑ (kg). CODATA 2018. */
export const MASA_ELECTRON = 9.1093837015e-31;

/** h·c expresado en eV·nm: 1.239,8419843… Permite E (eV) = HC_EV_NM / λ (nm). */
export const HC_EV_NM = ((H_PLANCK * VELOCIDAD_LUZ) / CARGA_ELEMENTAL) * 1e9;

/**
 * Por debajo de esta energía cinética (eV) se considera que el fotón está JUSTO en el umbral.
 *
 * En λ = λ₀ la teoría da E_c = 0 exacto: el electrón se arranca, pero sale sin energía y no
 * llega a ningún colector; no hay emisión NETA ni corriente. En coma flotante, h·c/λ₀ − φ
 * puede dar ±10⁻¹⁶ en lugar de 0, así que sin esta banda el umbral exacto caería a un lado u
 * otro según el redondeo. 10⁻⁹ eV queda muy por debajo de cualquier cifra que se publica.
 */
const TOLERANCIA_UMBRAL_EV = 1e-9;

// ─── Metales de referencia ───────────────────────────────────────────────────

export interface Metal {
  id: string;
  nombre: string;
  simbolo: string;
  /** Función de trabajo φ (eV). */
  phi: number;
}

/**
 * Funciones de trabajo de metales seleccionados. Fuente: Serway, R. A. y Jewett, J. W.,
 * «Física para ciencias e ingeniería», tabla 40.1. Son valores típicos: la función de trabajo
 * real depende del estado de la superficie (limpieza, oxidación, cara cristalina), y otras
 * tablas dan cifras que difieren unas décimas de eV.
 */
export const METALES: readonly Metal[] = [
  { id: 'sodio', nombre: 'Sodio', simbolo: 'Na', phi: 2.46 },
  { id: 'aluminio', nombre: 'Aluminio', simbolo: 'Al', phi: 4.08 },
  { id: 'plomo', nombre: 'Plomo', simbolo: 'Pb', phi: 4.14 },
  { id: 'zinc', nombre: 'Zinc', simbolo: 'Zn', phi: 4.31 },
  { id: 'hierro', nombre: 'Hierro', simbolo: 'Fe', phi: 4.5 },
  { id: 'cobre', nombre: 'Cobre', simbolo: 'Cu', phi: 4.7 },
  { id: 'plata', nombre: 'Plata', simbolo: 'Ag', phi: 4.73 },
  { id: 'platino', nombre: 'Platino', simbolo: 'Pt', phi: 6.35 },
];

// ─── Región del espectro ─────────────────────────────────────────────────────

export type RegionEspectro = 'ultravioleta' | 'visible' | 'infrarrojo';

/** Límites del visible que usa la app (nm). Varían ±10 nm según la fuente y el observador. */
export const VISIBLE_MIN_NM = 380;
export const VISIBLE_MAX_NM = 750;

export function regionEspectro(lambdaNm: number): RegionEspectro {
  if (lambdaNm < VISIBLE_MIN_NM) return 'ultravioleta';
  if (lambdaNm > VISIBLE_MAX_NM) return 'infrarrojo';
  return 'visible';
}

// ─── Validación ──────────────────────────────────────────────────────────────

function positivoFinito(x: number): boolean {
  return Number.isFinite(x) && x > 0;
}

// ─── Funciones elementales ───────────────────────────────────────────────────

/** Energía del fotón en eV: E = h·c/λ. null si λ no es positiva y finita. */
export function energiaFotonEV(lambdaNm: number): number | null {
  if (!positivoFinito(lambdaNm)) return null;
  return HC_EV_NM / lambdaNm;
}

/** Frecuencia de la luz (Hz): f = c/λ. null si λ no es positiva y finita. */
export function frecuenciaDeLambda(lambdaNm: number): number | null {
  if (!positivoFinito(lambdaNm)) return null;
  return VELOCIDAD_LUZ / (lambdaNm * 1e-9);
}

/** Frecuencia umbral (Hz): f₀ = φ/h, con φ pasada de eV a J. null si φ ≤ 0. */
export function frecuenciaUmbral(phiEV: number): number | null {
  if (!positivoFinito(phiEV)) return null;
  return (phiEV * CARGA_ELEMENTAL) / H_PLANCK;
}

/** Longitud de onda umbral (nm): λ₀ = h·c/φ. null si φ ≤ 0. */
export function longitudUmbralNm(phiEV: number): number | null {
  if (!positivoFinito(phiEV)) return null;
  return HC_EV_NM / phiEV;
}

/**
 * Energía cinética máxima (eV) en función de la FRECUENCIA, sin recortar: E_c = h·f/e − φ.
 * Es la recta de la gráfica E_c–f (pendiente h, corte con el eje f en f₀ y con el eje E_c en
 * −φ). Por debajo de f₀ da valores negativos, que la gráfica dibuja en discontinuo: no son
 * electrones con energía negativa, sino la prolongación de la recta hasta el eje.
 */
export function rectaEinstein(frecuenciaHz: number, phiEV: number): number {
  return (H_PLANCK * frecuenciaHz) / CARGA_ELEMENTAL - phiEV;
}

// ─── Cálculo completo ────────────────────────────────────────────────────────

export interface ResultadoFotoelectrico {
  lambdaNm: number;
  region: RegionEspectro;
  /** Energía del fotón (eV). */
  energiaFotonEV: number;
  /** Energía del fotón (J). */
  energiaFotonJ: number;
  /** Frecuencia de la luz incidente (Hz). */
  frecuencia: number;
  phiEV: number;
  /** f₀ = φ/h (Hz). */
  frecuenciaUmbral: number;
  /** λ₀ = h·c/φ (nm). */
  longitudUmbralNm: number;
  /**
   * ¿Hay emisión neta? Solo si E_fotón > φ. Justo en el umbral (E = φ) la energía cinética es
   * cero: se trata como SIN emisión neta, porque el electrón no sale con energía para llegar
   * a ningún sitio y la corriente es nula.
   */
  hayEmision: boolean;
  /** E_c,máx (eV). 0 si no hay emisión. */
  energiaCineticaEV: number;
  /** E_c,máx (J). 0 si no hay emisión. */
  energiaCineticaJ: number;
  /** v_máx (m/s). 0 si no hay emisión. */
  velocidadMax: number;
  /** V₀ (V). 0 si no hay emisión. */
  potencialFrenado: number;
  /** E_fotón − φ (eV) con signo: cuánto le sobra (o le falta, si es negativo) al fotón. */
  margenEV: number;
}

/**
 * Todo el efecto fotoeléctrico para una luz de longitud de onda λ (nm) sobre un metal de
 * función de trabajo φ (eV). null si λ o φ no son positivas y finitas.
 */
export function calcularFotoelectrico(lambdaNm: number, phiEV: number): ResultadoFotoelectrico | null {
  const E = energiaFotonEV(lambdaNm);
  const f = frecuenciaDeLambda(lambdaNm);
  const f0 = frecuenciaUmbral(phiEV);
  const lambda0 = longitudUmbralNm(phiEV);
  if (E === null || f === null || f0 === null || lambda0 === null) return null;

  const margenEV = E - phiEV;
  // En el umbral exacto (y en su banda de redondeo) no hay emisión neta: ver TOLERANCIA_UMBRAL_EV.
  const hayEmision = margenEV > TOLERANCIA_UMBRAL_EV;
  const energiaCineticaEV = hayEmision ? margenEV : 0;
  const energiaCineticaJ = energiaCineticaEV * CARGA_ELEMENTAL;
  const velocidadMax = hayEmision ? Math.sqrt((2 * energiaCineticaJ) / MASA_ELECTRON) : 0;

  return {
    lambdaNm,
    region: regionEspectro(lambdaNm),
    energiaFotonEV: E,
    energiaFotonJ: E * CARGA_ELEMENTAL,
    frecuencia: f,
    phiEV,
    frecuenciaUmbral: f0,
    longitudUmbralNm: lambda0,
    hayEmision,
    energiaCineticaEV,
    energiaCineticaJ,
    velocidadMax,
    // V₀ = E_c/e: con E_c en julios da voltios, y el número coincide con E_c en eV.
    potencialFrenado: energiaCineticaJ / CARGA_ELEMENTAL,
    margenEV,
  };
}

/**
 * Corriente fotoeléctrica relativa (0–100), proporcional a la intensidad (0–100 %).
 *
 * Es la ÚNICA magnitud que depende de la intensidad: más luz = más fotones = más electrones,
 * todos con la misma energía máxima. Si el fotón no supera la función de trabajo, la corriente
 * es 0 por mucha intensidad que haya. null si λ o φ no son válidas o la intensidad no es finita.
 */
export function corrienteRelativa(lambdaNm: number, phiEV: number, intensidad: number): number | null {
  if (!Number.isFinite(intensidad)) return null;
  const r = calcularFotoelectrico(lambdaNm, phiEV);
  if (r === null) return null;
  if (!r.hayEmision) return 0;
  return Math.min(100, Math.max(0, intensidad));
}
