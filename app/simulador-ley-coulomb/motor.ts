/**
 * Motor físico de `simulador-ley-coulomb` — la fuerza entre dos cargas puntuales, sin React ni
 * DOM.
 *
 * Vive aparte de `page.tsx` porque lo usan DOS consumidores que no pueden divergir: la
 * calculadora de la página y la corrección de los «Casos para clase» (`casos.ts`). Si cada uno
 * calculase con su copia, la app podría suspender una cifra que ella misma acaba de enseñar
 * ([[feedback_motor_calculo_aparte_y_probado]]).
 *
 * ── LA CONSTANTE SE COMPARTE CON simulador-campo-electrico ──────────────────────────
 *
 * k NO se declara aquí: se importa del motor de `simulador-campo-electrico`, la app hermana a la
 * que esta enlaza y que enlaza de vuelta. Las dos se leen juntas (una pasa a la otra para ver el
 * campo de las mismas cargas), así que no pueden dar dos fuerzas distintas para el mismo par:
 * el spec lo comprueba calculando con `fuerzaSobreCarga` de aquel motor (F = q₀·E) y con
 * `fuerzaCoulomb` de este.
 *
 * ── CONVENIO (fijado por escrito) ───────────────────────────────────────────────────
 *
 * · Todo en el Sistema Internacional dentro del motor: culombios, metros y newtons. Los prefijos
 *   (µC, cm, mN…) se convierten en la vista con las tablas `UNIDADES_*` de abajo.
 * · k = 8,99·10⁹ N·m²/C² (el de la hermana). Muchos libros usan 9·10⁹: un 0,11 % de diferencia.
 * · En un medio, F = k·q₁·q₂ / (εr·r²), con εr ≥ 1 (el vacío es 1 y ningún medio material baja
 *   de ahí). Vale para cargas puntuales dentro de un dieléctrico homogéneo e infinito, que es la
 *   forma escolar de la ley.
 * · La fuerza con signo es la componente sobre q₂ en la dirección que va DE q₁ A q₂: positiva si
 *   se repelen (q₂ es empujada lejos de q₁) y negativa si se atraen. Por la tercera ley de
 *   Newton, sobre q₁ actúa la misma con el sentido contrario.
 *
 * Nada lanza: un `throw` dentro de un render tumba la app entera. Los datos imposibles devuelven
 * `{ ok: false, error }` o NaN.
 */

import { K_COULOMB } from '../simulador-campo-electrico/motor';

export { K_COULOMB };

/** Carga elemental en culombios: valor exacto del SI desde 2019. */
export const CARGA_ELEMENTAL = 1.602176634e-19;

/** Aceleración de la gravedad con la que se traduce una fuerza a «el peso de…». */
export const G_PESO = 9.8;

/* ─────────────────────────── Unidades ─────────────────────────── */

export type UnidadCarga = 'C' | 'mC' | 'uC' | 'nC' | 'e';
export type UnidadDistancia = 'm' | 'cm' | 'mm' | 'nm' | 'pm';
export type UnidadFuerza = 'kN' | 'N' | 'mN' | 'uN' | 'nN';

export interface Unidad {
  /** Cuántas unidades del SI vale una de estas. */
  factor: number;
  /** Cómo se escribe junto a la cifra. */
  simbolo: string;
  /** Nombre para el desplegable, con el símbolo DELANTE: en un móvil el desplegable corta el final. */
  nombre: string;
}

export const UNIDADES_CARGA: Record<UnidadCarga, Unidad> = {
  C: { factor: 1, simbolo: 'C', nombre: 'C · culombios' },
  mC: { factor: 1e-3, simbolo: 'mC', nombre: 'mC · milicoulombios' },
  uC: { factor: 1e-6, simbolo: 'µC', nombre: 'µC · microcoulombios' },
  nC: { factor: 1e-9, simbolo: 'nC', nombre: 'nC · nanocoulombios' },
  e: { factor: CARGA_ELEMENTAL, simbolo: 'e', nombre: 'e · cargas elementales' },
};

export const UNIDADES_DISTANCIA: Record<UnidadDistancia, Unidad> = {
  m: { factor: 1, simbolo: 'm', nombre: 'm · metros' },
  cm: { factor: 1e-2, simbolo: 'cm', nombre: 'cm · centímetros' },
  mm: { factor: 1e-3, simbolo: 'mm', nombre: 'mm · milímetros' },
  nm: { factor: 1e-9, simbolo: 'nm', nombre: 'nm · nanómetros' },
  pm: { factor: 1e-12, simbolo: 'pm', nombre: 'pm · picómetros' },
};

export const UNIDADES_FUERZA: Record<UnidadFuerza, Unidad> = {
  kN: { factor: 1e3, simbolo: 'kN', nombre: 'kN · kilonewtons' },
  N: { factor: 1, simbolo: 'N', nombre: 'N · newtons' },
  mN: { factor: 1e-3, simbolo: 'mN', nombre: 'mN · milinewtons' },
  uN: { factor: 1e-6, simbolo: 'µN', nombre: 'µN · micronewtons' },
  nN: { factor: 1e-9, simbolo: 'nN', nombre: 'nN · nanonewtons' },
};

/* ─────────────────────────── Medios ─────────────────────────── */

export interface Medio {
  id: string;
  nombre: string;
  /** Permitividad relativa εr (adimensional). */
  epsR: number;
  /** De dónde sale la cifra y cuánto varía: es un valor típico, no una constante. */
  nota: string;
}

/**
 * Valores típicos a temperatura ambiente. La permitividad de un material real depende de su
 * composición, de la temperatura y de la frecuencia: la nota de cada medio dice cuánto se mueve.
 */
export const MEDIOS: readonly Medio[] = [
  { id: 'vacio', nombre: 'Vacío', epsR: 1, nota: 'Es la referencia: εr = 1 por definición.' },
  { id: 'aire', nombre: 'Aire', epsR: 1.0006, nota: 'Aire seco a nivel del mar: la fuerza es casi la del vacío (un 0,06 % menor).' },
  { id: 'aceite', nombre: 'Aceite mineral', epsR: 2.2, nota: 'Aceite aislante de transformador: entre 2,1 y 2,5 según el aceite.' },
  { id: 'vidrio', nombre: 'Vidrio', epsR: 5, nota: 'Valor orientativo: según el tipo de vidrio va de 4 a 10.' },
  { id: 'etanol', nombre: 'Etanol', epsR: 24.5, nota: 'Etanol puro a 25 °C.' },
  { id: 'agua', nombre: 'Agua', epsR: 80, nota: 'Agua pura a unos 20 °C (80,1). Por eso la sal se disuelve: el agua debilita 80 veces la atracción entre sus iones.' },
];

/* ─────────────────────────── La ley de Coulomb ─────────────────────────── */

export type TipoInteraccion = 'repulsion' | 'atraccion' | 'nula';

export interface ResultadoCoulomb {
  ok: boolean;
  /** Componente con signo sobre q₂, en la dirección de q₁ a q₂ (N): + repulsión, − atracción. */
  fuerza: number;
  /** Módulo |F| en newtons. */
  modulo: number;
  tipo: TipoInteraccion;
  error?: string;
}

/** ¿Es un medio admisible? εr finito y no menor que el del vacío. */
function medioValido(epsR: number): boolean {
  return Number.isFinite(epsR) && epsR >= 1;
}

/** Mensaje común para la permitividad imposible. */
const ERROR_MEDIO = 'La permitividad relativa εr no puede ser menor que 1, que es la del vacío.';

function fallo(error: string): ResultadoCoulomb {
  return { ok: false, fuerza: NaN, modulo: NaN, tipo: 'nula', error };
}

/**
 * Fuerza entre dos cargas puntuales `q1` y `q2` (C, con signo) separadas `r` metros en un medio
 * de permitividad relativa `epsR`: F = k·q₁·q₂ / (εr·r²).
 */
export function fuerzaCoulomb(q1: number, q2: number, r: number, epsR = 1): ResultadoCoulomb {
  if (!Number.isFinite(q1) || !Number.isFinite(q2)) return fallo('Escribe las dos cargas como números.');
  if (!Number.isFinite(r) || r <= 0) return fallo('La distancia entre las cargas tiene que ser mayor que cero.');
  if (!medioValido(epsR)) return fallo(ERROR_MEDIO);
  const fuerza = (K_COULOMB * q1 * q2) / (epsR * r * r);
  if (!Number.isFinite(fuerza)) return fallo('La fuerza sale demasiado grande para calcularla: revisa las unidades.');
  const tipo: TipoInteraccion = fuerza > 0 ? 'repulsion' : fuerza < 0 ? 'atraccion' : 'nula';
  return { ok: true, fuerza: fuerza + 0, modulo: Math.abs(fuerza), tipo };
}

/**
 * Distancia (m) a la que dos cargas se ejercen una fuerza de módulo `F` (N):
 * r = √(k·|q₁·q₂| / (εr·F)). NaN si no hay respuesta (F ≤ 0 o alguna carga nula).
 */
export function distanciaParaFuerza(q1: number, q2: number, F: number, epsR = 1): number {
  if (!Number.isFinite(F) || F <= 0 || !medioValido(epsR)) return NaN;
  const producto = Math.abs(q1 * q2);
  if (!Number.isFinite(producto) || producto === 0) return NaN;
  const r = Math.sqrt((K_COULOMB * producto) / (epsR * F));
  return Number.isFinite(r) && r > 0 ? r : NaN;
}

/**
 * Módulo de la carga (C) que, a `r` metros de `qConocida`, sufre una fuerza de módulo `F` (N):
 * |q| = F·εr·r² / (k·|q_conocida|). El SIGNO no lo fija la fuerza sino si se atraen o se repelen:
 * lo decide quien llama. NaN si no hay respuesta.
 */
export function cargaParaFuerza(qConocida: number, F: number, r: number, epsR = 1): number {
  if (!Number.isFinite(F) || F <= 0 || !Number.isFinite(r) || r <= 0 || !medioValido(epsR)) return NaN;
  const conocida = Math.abs(qConocida);
  if (!Number.isFinite(conocida) || conocida === 0) return NaN;
  const q = (F * epsR * r * r) / (K_COULOMB * conocida);
  return Number.isFinite(q) && q > 0 ? q : NaN;
}

/** Módulo de dos cargas IGUALES (C) que a `r` metros se ejercen una fuerza `F` (N): |q| = r·√(F·εr / k). */
export function cargaIgualParaFuerza(F: number, r: number, epsR = 1): number {
  if (!Number.isFinite(F) || F <= 0 || !Number.isFinite(r) || r <= 0 || !medioValido(epsR)) return NaN;
  const q = r * Math.sqrt((F * epsR) / K_COULOMB);
  return Number.isFinite(q) && q > 0 ? q : NaN;
}

/**
 * Por cuánto queda multiplicada la fuerza si q₁ se multiplica por `a`, q₂ por `b` y la distancia
 * por `c`: F'/F = |a·b| / c². Es la proporcionalidad de la ley sin constantes, la que piden los
 * problemas de «¿qué pasa si…?». NaN si c no es positiva.
 */
export function factorDeFuerza(a: number, b: number, c: number): number {
  if (![a, b, c].every(Number.isFinite) || c <= 0) return NaN;
  return Math.abs(a * b) / (c * c);
}

/**
 * Por cuánto hay que multiplicar la distancia para que la fuerza NO cambie cuando q₁ se multiplica
 * por `a` y q₂ por `b`: c = √|a·b|. NaN si alguna se anula (la fuerza desaparece a cualquier r).
 */
export function factorDeDistanciaParaIgualFuerza(a: number, b: number): number {
  if (![a, b].every(Number.isFinite)) return NaN;
  const p = Math.abs(a * b);
  return p > 0 ? Math.sqrt(p) : NaN;
}

/** Masa (kg) cuyo peso, con g = 9,8 m/s², iguala una fuerza de `F` newtons. */
export function masaConElMismoPeso(F: number, g = G_PESO): number {
  return Number.isFinite(F) && g > 0 ? Math.abs(F) / g : NaN;
}

/** Lo que vale `valor` (en la unidad) pasado al SI. */
export function aSI(valor: number, unidad: Unidad): number {
  return valor * unidad.factor;
}

/** Lo que vale `valorSI` expresado en la unidad. */
export function desdeSI(valorSI: number, unidad: Unidad): number {
  return valorSI / unidad.factor;
}
