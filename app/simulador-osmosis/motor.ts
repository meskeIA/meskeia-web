/**
 * Motor del simulador de ósmosis.
 *
 * Funciones puras, sin React ni dependencias de la vista, para probarlas contra casos resueltos
 * a mano (tests/osmosis-motor.spec.ts) antes de pintar nada. Dos problemas de la unidad de
 * transporte a través de membranas, los mismos que plantea un examen:
 *
 * 1 · DOS DISOLUCIONES SEPARADAS POR UNA MEMBRANA SEMIPERMEABLE
 *
 *   osmolaridad   = i·M                 (osmol/L) partículas disueltas por litro
 *   π             = i·M·R·T             (ecuación de van 't Hoff) presión osmótica
 *
 *   La membrana deja pasar el agua y no el soluto, así que el agua pasa en neto del lado de
 *   MENOS osmolaridad al de MÁS. La diferencia de presión osmótica Δπ es la que habría que
 *   aplicar al lado concentrado para frenar ese paso, y equivale a una columna de agua de
 *   altura h = Δπ/(ρ·g): la del osmómetro de Pfeffer, y el puente con la hidrostática
 *   (simulador-principio-pascal, de donde salen g y la atmósfera).
 *
 * 2 · UNA CÉLULA EN UN MEDIO (tonicidad)
 *
 *   El medio se compara con el interior de la célula:
 *     osm_medio < osm_interior  → hipotónico: entra agua
 *     osm_medio ≈ osm_interior  → isotónico: sin paso neto apreciable
 *     osm_medio > osm_interior  → hipertónico: sale agua
 *   La célula animal no tiene pared: en hipotónico se hincha y puede reventar (en el glóbulo
 *   rojo, hemólisis) y en hipertónico se arruga (crenación). La vegetal sí: en hipotónico la
 *   pared frena la entrada y la célula queda turgente, en isotónico queda flácida y en
 *   hipertónico la membrana se despega de la pared (plasmólisis).
 *
 * ── LOS CONVENIOS DE ESTA APP (fijados por escrito) ──────────────────────────
 *
 * · R = 8,314462618 J/(mol·K), exacta desde la redefinición del SI de 2019. En atm·L/(mol·K)
 *   sale R/101,325 = 0,0820574; muchos libros usan 0,082, un 0,07 % menos.
 * · i es el factor de van 't Hoff IDEAL: 1 para lo que no se disocia, 2 para NaCl y KCl, 3 para
 *   CaCl₂. El real es algo menor (el NaCl a 0,9 % ronda 1,86) porque los iones no se separan
 *   del todo; los problemas de clase usan el ideal, y la app también.
 * · «Isotónico» con una banda del 5 % alrededor del interior de la célula. Sin banda, el suero
 *   fisiológico (NaCl 0,9 % = 0,308 osmol/L ideal) saldría hipertónico frente a un glóbulo rojo
 *   de 0,30, y es justo el ejemplo de libro de disolución isotónica. Entre dos compartimentos,
 *   en cambio, no hay banda: cualquier diferencia mueve agua.
 * · % = masa/volumen (gramos de soluto por 100 mL de disolución), que es como se rotulan el
 *   suero y las disoluciones de laboratorio: M = (%·10)/masa molar.
 *
 * Validación: un dato que no sea un número válido devuelve null. La vista dice entonces qué
 * falta, en vez de publicar una cifra inventada.
 */

// La gravedad y la atmósfera, las mismas del simulador de presión hidrostática
import { G, P_ATM } from '../simulador-principio-pascal/motor';

export { G, P_ATM };

/** Constante de los gases en J/(mol·K). Exacta: producto de k_B y N_A, fijados en el SI 2019. */
export const R_SI = 8.314462618;

/** La misma constante en atm·L/(mol·K): 8,314462618 / 101,325. */
export const R_ATM_L = R_SI / (P_ATM / 1000);

/** 0 °C en kelvin. */
export const CERO_CELSIUS_K = 273.15;

/** 1 atm = 760 mmHg, por definición del torr. */
export const MMHG_POR_ATM = 760;

/** Densidad del agua para la columna del osmómetro (kg/m³), la de los problemas de clase. */
export const DENSIDAD_AGUA = 1000;

/** Banda relativa para llamar «isotónico» a un medio: ±5 % del interior de la célula. */
export const BANDA_ISOTONICA = 0.05;

// ─── Solutos ─────────────────────────────────────────────────────────────────

export interface Soluto {
  id: string;
  nombre: string;
  formula: string;
  /** Factor de van 't Hoff ideal: partículas por fórmula disuelta. */
  i: number;
  /** Masa molar en g/mol (pesos atómicos estándar IUPAC, redondeados a centésimas). */
  masaMolar: number;
}

export const SOLUTOS: readonly Soluto[] = [
  { id: 'glucosa', nombre: 'Glucosa', formula: 'C₆H₁₂O₆', i: 1, masaMolar: 180.16 },
  { id: 'sacarosa', nombre: 'Sacarosa', formula: 'C₁₂H₂₂O₁₁', i: 1, masaMolar: 342.3 },
  { id: 'urea', nombre: 'Urea', formula: 'CO(NH₂)₂', i: 1, masaMolar: 60.06 },
  { id: 'nacl', nombre: 'Cloruro de sodio', formula: 'NaCl', i: 2, masaMolar: 58.44 },
  { id: 'kcl', nombre: 'Cloruro de potasio', formula: 'KCl', i: 2, masaMolar: 74.55 },
  { id: 'cacl2', nombre: 'Cloruro de calcio', formula: 'CaCl₂', i: 3, masaMolar: 110.98 },
];

export function solutoPorId(id: string): Soluto | undefined {
  return SOLUTOS.find((s) => s.id === id);
}

/** Cómo viene dada la concentración: en mol/L o en % masa/volumen. */
export type Unidad = 'molar' | 'porcentaje';

/** Un número finito y no negativo (concentración: el 0 es agua pura y tiene sentido). */
export function esNoNegativo(valor: number): boolean {
  return Number.isFinite(valor) && valor >= 0;
}

/** Un número finito y estrictamente positivo. */
export function esPositivo(valor: number): boolean {
  return Number.isFinite(valor) && valor > 0;
}

/**
 * Molaridad (mol/L) a partir de la concentración tal como la da el enunciado.
 * En %, 1 % m/v son 10 g por litro: M = %·10 / masa molar.
 */
export function molaridadDesde(valor: number, unidad: Unidad, soluto: Soluto): number | null {
  if (!esNoNegativo(valor)) return null;
  return unidad === 'molar' ? valor : (valor * 10) / soluto.masaMolar;
}

/** Osmolaridad (osmol/L) = i·M. */
export function osmolaridad(molaridad: number, soluto: Soluto): number | null {
  if (!esNoNegativo(molaridad)) return null;
  return soluto.i * molaridad;
}

/** Temperatura en kelvin; null si queda en el cero absoluto o por debajo. */
export function aKelvin(celsius: number): number | null {
  if (!Number.isFinite(celsius)) return null;
  const k = celsius + CERO_CELSIUS_K;
  return k > 0 ? k : null;
}

export interface PresionOsmotica {
  atm: number;
  kPa: number;
  mmHg: number;
  /** En pascales: con la osmolaridad pasada a osmol/m³ y R en J/(mol·K). */
  pa: number;
}

/** π = osm·R·T a partir de la osmolaridad (osmol/L) y la temperatura (°C). */
export function presionOsmotica(osm: number, celsius: number): PresionOsmotica | null {
  const t = aKelvin(celsius);
  if (t === null || !esNoNegativo(osm)) return null;
  const atm = osm * R_ATM_L * t;
  return {
    atm,
    kPa: (atm * P_ATM) / 1000,
    mmHg: atm * MMHG_POR_ATM,
    pa: osm * 1000 * R_SI * t,
  };
}

// ─── 1 · Dos compartimentos ──────────────────────────────────────────────────

/** Hacia dónde pasa el agua en neto. */
export type Sentido = 'A_a_B' | 'B_a_A' | 'ninguno';

export interface ResultadoMembrana {
  osmA: number;
  osmB: number;
  piA: PresionOsmotica;
  piB: PresionOsmotica;
  /** Del lado diluido al concentrado; 'ninguno' si las osmolaridades son iguales. */
  sentido: Sentido;
  /** |osmA − osmB| en osmol/L. */
  diferenciaOsm: number;
  /** Diferencia de presión osmótica entre los dos lados. */
  deltaPi: PresionOsmotica;
  /** Columna de agua que equilibraría Δπ: h = Δπ / (ρ_agua · g), en metros. */
  alturaColumna: number;
}

/**
 * Compara los dos lados de la membrana. Las osmolaridades ya vienen calculadas (i·M de cada
 * lado), así que cada lado puede llevar un soluto distinto.
 */
export function compararCompartimentos(
  osmA: number,
  osmB: number,
  celsius: number,
): ResultadoMembrana | null {
  const piA = presionOsmotica(osmA, celsius);
  const piB = presionOsmotica(osmB, celsius);
  if (!piA || !piB) return null;
  const diferenciaOsm = Math.abs(osmA - osmB);
  const deltaPi = presionOsmotica(diferenciaOsm, celsius);
  if (!deltaPi) return null;
  // Iguales hasta el redondeo binario: 2 · 0,1 y 1 · 0,2 no dan exactamente lo mismo
  const iguales = diferenciaOsm <= 1e-12 * Math.max(1, osmA, osmB);
  const sentido: Sentido = iguales ? 'ninguno' : osmA > osmB ? 'B_a_A' : 'A_a_B';
  return {
    osmA,
    osmB,
    piA,
    piB,
    sentido,
    diferenciaOsm: iguales ? 0 : diferenciaOsm,
    deltaPi: iguales ? { atm: 0, kPa: 0, mmHg: 0, pa: 0 } : deltaPi,
    alturaColumna: iguales ? 0 : deltaPi.pa / (DENSIDAD_AGUA * G),
  };
}

// ─── 2 · Célula en un medio ──────────────────────────────────────────────────

export type TipoCelula = 'animal' | 'vegetal';
export type Tonicidad = 'hipotonico' | 'isotonico' | 'hipertonico';
export type MovimientoAgua = 'entra' | 'equilibrio' | 'sale';
export type EstadoCelula =
  | 'hinchada'
  | 'normal'
  | 'crenada'
  | 'turgente'
  | 'flacida'
  | 'plasmolizada';

export interface ResultadoCelula {
  tonicidad: Tonicidad;
  agua: MovimientoAgua;
  estado: EstadoCelula;
  /** (osm_medio − osm_interior) / osm_interior: negativo = medio más diluido. */
  diferenciaRelativa: number;
  /** Δπ entre el interior y el medio. */
  deltaPi: PresionOsmotica;
}

/** Tonicidad del medio respecto al interior, con la banda del ±5 % (borde incluido). */
export function clasificarMedio(osmInterior: number, osmMedio: number): Tonicidad | null {
  if (!esPositivo(osmInterior) || !esNoNegativo(osmMedio)) return null;
  const relativa = (osmMedio - osmInterior) / osmInterior;
  // Margen de redondeo: 0,315 frente a 0,30 da 0,05000000000000004 y es el borde exacto
  if (Math.abs(relativa) <= BANDA_ISOTONICA + 1e-12) return 'isotonico';
  return relativa < 0 ? 'hipotonico' : 'hipertonico';
}

const ESTADOS: Record<TipoCelula, Record<Tonicidad, EstadoCelula>> = {
  animal: { hipotonico: 'hinchada', isotonico: 'normal', hipertonico: 'crenada' },
  vegetal: { hipotonico: 'turgente', isotonico: 'flacida', hipertonico: 'plasmolizada' },
};

const AGUA: Record<Tonicidad, MovimientoAgua> = {
  hipotonico: 'entra',
  isotonico: 'equilibrio',
  hipertonico: 'sale',
};

export function celulaEnMedio(
  tipo: TipoCelula,
  osmInterior: number,
  osmMedio: number,
  celsius: number,
): ResultadoCelula | null {
  const tonicidad = clasificarMedio(osmInterior, osmMedio);
  const deltaPi = presionOsmotica(Math.abs(osmMedio - osmInterior), celsius);
  if (!tonicidad || !deltaPi) return null;
  return {
    tonicidad,
    agua: AGUA[tonicidad],
    estado: ESTADOS[tipo][tonicidad],
    diferenciaRelativa: (osmMedio - osmInterior) / osmInterior,
    deltaPi,
  };
}
