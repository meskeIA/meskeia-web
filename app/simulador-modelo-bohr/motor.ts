/**
 * Motor del simulador del modelo atómico de Bohr: niveles del hidrógeno y su espectro.
 *
 * Funciones puras, sin React, para probarlas contra casos resueltos a mano y contra las líneas
 * medidas del hidrógeno (tests/modelo-bohr-motor.spec.ts) antes de pintar nada.
 *
 *   Niveles de energía     E_n = −E_ion / n²               (E_ion ≈ 13,6 eV)
 *   Radio de la órbita     r_n = n²·a₀                      (a₀ ≈ 0,0529 nm)
 *   Fotón de un salto      ΔE = E_ion·|1/n_f² − 1/n_i²|
 *   Ecuación de Rydberg    1/λ = R_H·|1/n_f² − 1/n_i²|      (R_H ≈ 1,097·10⁷ m⁻¹)
 *
 * Si el electrón BAJA de nivel (n_i > n_f) emite el fotón: línea de EMISIÓN. Si SUBE, tiene
 * que absorberlo: línea de ABSORCIÓN, con la misma λ. El nivel inferior del salto da nombre a
 * la serie: 1 Lyman, 2 Balmer, 3 Paschen, 4 Brackett, 5 Pfund, 6 Humphreys.
 *
 * Se admite n = ∞ (`Infinity`): es el electrón libre, con energía 0. Subir hasta ∞ es ionizar el
 * átomo, y la línea de ∞ a n es el LÍMITE de la serie de n (la λ más corta que tiene).
 *
 * ── Por qué R_H y no R∞ ──────────────────────────────────────────────────────
 * La constante de Rydberg de las tablas, R∞, supone un núcleo de masa infinita. El protón no lo
 * es: el electrón y el protón giran en torno a su centro de masas, y eso se corrige con la masa
 * reducida, R_H = R∞ / (1 + mₑ/mₚ). La diferencia es del 0,05 %, pero es justo la que separa
 * 656,11 nm (con R∞) de la línea Hα que se mide, 656,47 nm en el vacío. Los libros de texto
 * redondean a 1,097·10⁷ m⁻¹ y 13,6 eV: con esos valores los resultados coinciden con los de este
 * motor en las tres primeras cifras.
 *
 * Energía y longitud de onda salen de la MISMA constante (E_ion = h·c·R_H), para que el fotón
 * de un salto valga exactamente la diferencia de energía de los dos niveles que se muestran.
 *
 * Las constantes h, c y el factor eV ↔ J se importan del motor de `simulador-efecto-fotoelectrico`
 * (CODATA 2018), igual que la región del espectro: una sola definición del visible para las dos
 * apps de física cuántica.
 */

import {
  HC_EV_NM,
  VELOCIDAD_LUZ,
  CARGA_ELEMENTAL,
  regionEspectro,
  type RegionEspectro,
} from '../simulador-efecto-fotoelectrico/motor';

// ─── Constantes (CODATA 2018) ────────────────────────────────────────────────

/** Constante de Rydberg para núcleo infinito, R∞ (m⁻¹). CODATA 2018. */
export const R_INFINITO = 10_973_731.568_16;

/** Cociente de masas protón/electrón, mₚ/mₑ. CODATA 2018. */
export const MASA_PROTON_ENTRE_ELECTRON = 1836.152_673_43;

/** Radio de Bohr a₀ (m). CODATA 2018. */
export const RADIO_BOHR = 5.291_772_109_03e-11;

/** Constante de Rydberg del hidrógeno, con la masa reducida: R_H = R∞/(1 + mₑ/mₚ) ≈ 1,09678·10⁷ m⁻¹. */
export const R_HIDROGENO = R_INFINITO / (1 + 1 / MASA_PROTON_ENTRE_ELECTRON);

/** Energía de ionización del hidrógeno desde el fundamental: E_ion = h·c·R_H ≈ 13,598 eV. */
export const ENERGIA_IONIZACION_EV = HC_EV_NM * R_HIDROGENO * 1e-9;

/** El nivel más alto que la app deja elegir, además de ∞. */
export const NIVEL_MAXIMO = 7;

// ─── Validación ──────────────────────────────────────────────────────────────

/** Un nivel válido: entero de 1 en adelante, o ∞ (el electrón libre). */
export function esNivel(n: number): boolean {
  return n === Infinity || (Number.isInteger(n) && n >= 1);
}

/** 1/n², que vale 0 en n = ∞. */
function inversoCuadrado(n: number): number {
  return n === Infinity ? 0 : 1 / (n * n);
}

// ─── Niveles ─────────────────────────────────────────────────────────────────

/** Energía del nivel n en eV: −13,598/n². 0 en n = ∞. null si n no es un nivel. */
export function energiaNivel(n: number): number | null {
  if (!esNivel(n)) return null;
  // 0 explícito: −13,598 · 0 daría −0, que se pinta «−0,000»
  if (n === Infinity) return 0;
  return -ENERGIA_IONIZACION_EV * inversoCuadrado(n);
}

/** Radio de la órbita n en nm: n²·a₀. null si n no es un nivel finito (en ∞ no hay órbita). */
export function radioOrbitaNm(n: number): number | null {
  if (!esNivel(n) || n === Infinity) return null;
  return n * n * RADIO_BOHR * 1e9;
}

/** Energía para arrancar el electrón desde el nivel n (eV): E_ion/n². */
export function energiaIonizacionDesde(n: number): number | null {
  if (!esNivel(n) || n === Infinity) return null;
  return ENERGIA_IONIZACION_EV * inversoCuadrado(n);
}

// ─── Series ──────────────────────────────────────────────────────────────────

export type Serie = 'Lyman' | 'Balmer' | 'Paschen' | 'Brackett' | 'Pfund' | 'Humphreys';

const SERIES: Record<number, Serie> = {
  1: 'Lyman',
  2: 'Balmer',
  3: 'Paschen',
  4: 'Brackett',
  5: 'Pfund',
  6: 'Humphreys',
};

/** Serie a la que pertenece una línea, por su nivel INFERIOR. null si no tiene nombre (n ≥ 7). */
export function serieDeNivel(nInferior: number): Serie | null {
  return SERIES[nInferior] ?? null;
}

// ─── Transiciones ────────────────────────────────────────────────────────────

export type Sentido = 'emision' | 'absorcion';

export interface ResultadoTransicion {
  nInicial: number;
  nFinal: number;
  sentido: Sentido;
  /** El nivel de abajo del salto, que da nombre a la serie. */
  nInferior: number;
  nSuperior: number;
  serie: Serie | null;
  /** Energía del fotón (eV), siempre positiva: |E_final − E_inicial|. */
  energiaFotonEV: number;
  /** La misma en julios. */
  energiaFotonJ: number;
  /** Número de onda 1/λ (m⁻¹): R_H·(1/n_inf² − 1/n_sup²). */
  numeroOnda: number;
  /** Longitud de onda en el vacío (nm). */
  lambdaNm: number;
  /** Frecuencia (Hz): c/λ. */
  frecuencia: number;
  region: RegionEspectro;
  /** El salto llega a n = ∞ o sale de él: ionización (absorción) o captura (emisión). */
  esLimite: boolean;
}

/**
 * Salto del electrón de n_i a n_f. null si algún nivel no es válido, si son iguales (no hay
 * salto) o si los dos son ∞.
 */
export function calcularTransicion(nInicial: number, nFinal: number): ResultadoTransicion | null {
  if (!esNivel(nInicial) || !esNivel(nFinal) || nInicial === nFinal) return null;

  const nInferior = Math.min(nInicial, nFinal);
  const nSuperior = Math.max(nInicial, nFinal);
  const factor = inversoCuadrado(nInferior) - inversoCuadrado(nSuperior);
  const numeroOnda = R_HIDROGENO * factor;
  const lambdaNm = 1e9 / numeroOnda;
  const energiaFotonEV = ENERGIA_IONIZACION_EV * factor;

  return {
    nInicial,
    nFinal,
    sentido: nInicial > nFinal ? 'emision' : 'absorcion',
    nInferior,
    nSuperior,
    serie: serieDeNivel(nInferior),
    energiaFotonEV,
    energiaFotonJ: energiaFotonEV * CARGA_ELEMENTAL,
    numeroOnda,
    lambdaNm,
    frecuencia: VELOCIDAD_LUZ / (lambdaNm * 1e-9),
    region: regionEspectro(lambdaNm),
    esLimite: nSuperior === Infinity,
  };
}

export interface LineaSerie {
  nSuperior: number;
  lambdaNm: number;
  energiaFotonEV: number;
  region: RegionEspectro;
}

/**
 * Las primeras líneas de una serie, de la más larga a la más corta, y su límite (n = ∞) al
 * final. `cuantas` líneas además del límite.
 */
export function lineasDeSerie(nInferior: number, cuantas = 5): LineaSerie[] {
  if (!esNivel(nInferior) || nInferior === Infinity) return [];
  const superiores: number[] = [];
  for (let k = 1; k <= cuantas; k++) superiores.push(nInferior + k);
  superiores.push(Infinity);
  return superiores.map((nSuperior) => {
    const t = calcularTransicion(nSuperior, nInferior);
    // Nunca null: nSuperior > nInferior y los dos son niveles válidos
    return {
      nSuperior,
      lambdaNm: t ? t.lambdaNm : Number.NaN,
      energiaFotonEV: t ? t.energiaFotonEV : Number.NaN,
      region: t ? t.region : 'visible',
    };
  });
}
