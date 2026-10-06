/**
 * Motor del simulador de condensadores: placas planas y paralelas, dieléctrico y circuito RC.
 *
 * Vive aparte y sin dependencias para poder probarlo con casos resueltos a mano
 * (tests/condensadores-motor.spec.ts). Todo en unidades del SI: m², m, V, F, C, J, Ω, s.
 *
 * Parte 1 — condensador ideal de placas paralelas (sin efectos de borde):
 *   C = ε₀·εr·A/d     Q = C·V     E = V/d     U = ½·C·V²
 *
 * Introducir un dieléctrico de constante εr en un condensador que estaba en vacío:
 *   batería CONECTADA     → V constante: C, Q y U se multiplican por εr; E no cambia.
 *   batería DESCONECTADA  → Q constante: C se multiplica por εr; V, E y U se dividen por εr.
 *
 * Parte 2 — circuito RC con τ = R·C:
 *   carga     V_C(t) = V·(1 − e^(−t/τ))
 *   descarga  V_C(t) = V·e^(−t/τ)
 *   corriente |I(t)| = (V/R)·e^(−t/τ) en los dos casos (en la descarga circula al revés).
 *
 * Validación: área, separación, εr, R y C deben ser > 0 y V ≥ 0. Si no, null: la vista dice
 * qué falta y no imprime ninguna cifra inventada.
 */

/**
 * Permitividad del vacío ε₀ en F/m.
 * Fuente: CODATA 2018 (NIST, «Fundamental Physical Constants»), 8,8541878128(13)·10⁻¹² F/m.
 */
export const EPSILON_0 = 8.8541878128e-12;

export interface Dielectrico {
  id: string;
  nombre: string;
  /** Constante dieléctrica relativa εr (adimensional). */
  er: number;
}

/**
 * Valores típicos a temperatura ambiente. Fuente: Serway y Jewett, «Física para ciencias e
 * ingeniería», tabla 26.1 (constantes dieléctricas aproximadas). Son valores de muestra:
 * varían con la pureza, la humedad, la temperatura y la frecuencia.
 *
 * La rigidez dieléctrica se retiró el 06/10/2026: las cifras se escribieron de memoria y las
 * tablas consultadas dan valores muy distintos (dependen del espesor y del ensayo). Sin una
 * fuente comprobada, no se publica una cifra.
 */
export const DIELECTRICOS: readonly Dielectrico[] = [
  { id: 'vacio', nombre: 'Vacío', er: 1 },
  { id: 'aire', nombre: 'Aire (seco)', er: 1.00059 },
  { id: 'teflon', nombre: 'Teflón', er: 2.1 },
  { id: 'papel', nombre: 'Papel', er: 3.7 },
  { id: 'pyrex', nombre: 'Vidrio Pyrex', er: 5.6 },
  { id: 'agua', nombre: 'Agua', er: 80 },
];

// ─── Parte 1: el condensador ────────────────────────────────────────────────

export interface DatosCondensador {
  /** Área de cada placa, m². */
  area: number;
  /** Separación entre placas, m. */
  separacion: number;
  /** Tensión entre placas, V. */
  tension: number;
  /** Constante dieléctrica relativa del material entre placas. */
  er: number;
}

export interface EstadoCondensador {
  /** Capacidad C, F. */
  capacidad: number;
  /** Tensión V, V. */
  tension: number;
  /** Carga Q de la placa positiva, C. */
  carga: number;
  /** Campo eléctrico E entre las placas, V/m. */
  campo: number;
  /** Energía almacenada U, J. */
  energia: number;
}

export type CampoCondensador = 'area' | 'separacion' | 'tension' | 'er';

const esPositivo = (x: number): boolean => Number.isFinite(x) && x > 0;
const esNoNegativo = (x: number): boolean => Number.isFinite(x) && x >= 0;

/** Qué datos impiden calcular (vacío si todo está bien). La vista lo traduce a un mensaje. */
export function validarCondensador(d: DatosCondensador): CampoCondensador[] {
  const fallos: CampoCondensador[] = [];
  if (!esPositivo(d.area)) fallos.push('area');
  if (!esPositivo(d.separacion)) fallos.push('separacion');
  if (!esNoNegativo(d.tension)) fallos.push('tension');
  if (!esPositivo(d.er)) fallos.push('er');
  return fallos;
}

/** C, Q, E y U del condensador de placas paralelas, o null si falta algún dato válido. */
export function calcularCondensador(d: DatosCondensador): EstadoCondensador | null {
  if (validarCondensador(d).length > 0) return null;
  const capacidad = (EPSILON_0 * d.er * d.area) / d.separacion;
  return {
    capacidad,
    tension: d.tension,
    carga: capacidad * d.tension,
    campo: d.tension / d.separacion,
    energia: 0.5 * capacidad * d.tension * d.tension,
  };
}

export type ModoBateria = 'conectada' | 'desconectada';

/**
 * Qué pasa al llenar de dieléctrico un condensador que estaba en vacío.
 *
 * Recibe el estado SIN dieléctrico (el que da `calcularCondensador` con εr = 1) y devuelve el
 * estado final. Es la pregunta clásica de examen: lo que se conserva depende de si la batería
 * sigue conectada (V fija) o se desconectó antes (Q fija, porque la carga no tiene a dónde ir).
 */
export function introducirDielectrico(
  sinDielectrico: EstadoCondensador,
  er: number,
  modo: ModoBateria,
): EstadoCondensador | null {
  const s = sinDielectrico;
  if (!esPositivo(er) || !esPositivo(s.capacidad) || !esNoNegativo(s.tension)) return null;
  if (!esNoNegativo(s.carga) || !esNoNegativo(s.campo) || !esNoNegativo(s.energia)) return null;

  if (modo === 'conectada') {
    // La batería mantiene V: entra carga desde la batería hasta Q' = εr·Q.
    return {
      capacidad: s.capacidad * er,
      tension: s.tension,
      carga: s.carga * er,
      campo: s.campo,
      energia: s.energia * er,
    };
  }
  // Aislado: Q no cambia; el dieléctrico polarizado reduce el campo neto y con él la tensión.
  return {
    capacidad: s.capacidad * er,
    tension: s.tension / er,
    carga: s.carga,
    campo: s.campo / er,
    energia: s.energia / er,
  };
}

// ─── Parte 2: carga y descarga RC ───────────────────────────────────────────

export type ModoRC = 'carga' | 'descarga';

export interface EstadoRC {
  /** Constante de tiempo τ = R·C, s. */
  tau: number;
  /** Tensión en el condensador V_C(t), V. */
  tensionCondensador: number;
  /** Intensidad |I(t)| = (V/R)·e^(−t/τ), A. */
  corriente: number;
  /** Corriente en t = 0: V/R, A. */
  corrienteInicial: number;
  /** Fracción de la carga máxima Q/Q_max = V_C/V, entre 0 y 1. */
  fraccionCarga: number;
}

/** τ = R·C, o null si R o C no son positivos. */
export function constanteTiempo(resistencia: number, capacidad: number): number | null {
  if (!esPositivo(resistencia) || !esPositivo(capacidad)) return null;
  return resistencia * capacidad;
}

/**
 * Estado del circuito RC en el instante t (s). En la carga el condensador parte descargado y se
 * conecta a la fuente V; en la descarga parte cargado a V y se cierra sobre la resistencia.
 */
export function estadoRC(
  modo: ModoRC,
  tension: number,
  resistencia: number,
  capacidad: number,
  t: number,
): EstadoRC | null {
  const tau = constanteTiempo(resistencia, capacidad);
  if (tau === null || !esNoNegativo(tension) || !esNoNegativo(t)) return null;

  const decaimiento = Math.exp(-t / tau);
  const fraccionCarga = modo === 'carga' ? 1 - decaimiento : decaimiento;
  const corrienteInicial = tension / resistencia;

  return {
    tau,
    tensionCondensador: tension * fraccionCarga,
    corriente: corrienteInicial * decaimiento,
    corrienteInicial,
    fraccionCarga,
  };
}

// ─── Prefijos del SI para presentar las cifras ──────────────────────────────

export interface Prefijo {
  /** Potencia de diez por la que hay que DIVIDIR el valor. */
  factor: number;
  simbolo: string;
}

const SIMBOLOS: Record<number, string> = {
  [-15]: 'f',
  [-12]: 'p',
  [-9]: 'n',
  [-6]: 'µ',
  [-3]: 'm',
  0: '',
  3: 'k',
  6: 'M',
};

/**
 * El prefijo del SI que deja la cifra entre 1 y 999 (88,54 pF y no 8,854·10⁻¹¹ F).
 *
 * `expMax` limita el prefijo más grande: para tiempos se pasa 0, porque «7 ks» no lo usa nadie.
 * El valor se redondea a 4 cifras significativas ANTES de elegir, para que un 999,99 que se
 * imprimiría «1.000,0 pF» salte a «1,000 nF».
 */
export function elegirPrefijo(valor: number, expMax: number = 6): Prefijo {
  const abs = Math.abs(valor);
  if (!Number.isFinite(abs) || abs === 0) return { factor: 1, simbolo: '' };

  const redondeado = Number(abs.toPrecision(4));
  let exp = Math.floor(Math.log10(redondeado) / 3) * 3;
  // log10 en coma flotante puede quedarse a un pelo del entero: se corrige mirando la cifra.
  if (redondeado / 10 ** exp >= 1000) exp += 3;
  if (redondeado / 10 ** exp < 1) exp -= 3;
  exp = Math.min(Math.max(exp, -15), Math.min(expMax, 6));

  return { factor: 10 ** exp, simbolo: SIMBOLOS[exp] };
}
