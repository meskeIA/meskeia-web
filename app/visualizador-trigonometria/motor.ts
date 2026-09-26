/**
 * Motor del visualizador de trigonometría. Funciones puras, sin React ni DOM: los casos
 * resueltos a mano viven en `tests/apps/visualizador-trigonometria.spec.ts`.
 *
 * ── De dónde sale (Inspector, 25/09/2026, hallazgo 1906) ──
 * π/2 no es representable en binario: `Math.cos(Math.PI / 2)` vale 6,1·10⁻¹⁷ y no 0, así que
 * `Math.tan(π/2)` es FINITO (16.331.239.353.195.370) y la tarjeta tan(θ) lo publicaba como
 * resultado en 90° y 270°. La vista solo trataba como indefinido lo que no era finito.
 *
 * Criterio (el mismo que `app/calculadora-trigonometria/motor.ts`, hallazgo 1778):
 *  1. Los ángulos CUADRANTALES (múltiplos de 90°) se reconocen en GRADOS, que el deslizador
 *     da exactos, y sus razones se devuelven exactas (0, ±1). La tangente en 90° y 270° es
 *     `null`: no está definida, no es «infinito».
 *  2. Fuera de los ejes se usa `Math.sin`/`Math.cos`, y el ruido de coma flotante por debajo
 *     de 1e-12 se absorbe hacia el múltiplo de ½ más cercano (0, ±½, ±1), que son los únicos
 *     valores notables racionales: sen 30° = 0,49999999999999994 → 0,5; tan 45° =
 *     0,9999999999999999 → 1. √2/2 y √3/2 son irracionales: no tienen valor exacto al que
 *     ajustarse, y su ruido (10⁻¹⁶) no llega a ningún decimal que se muestre.
 */

import { formatNumber } from '@/lib';

/** Por debajo de esto, la diferencia con un valor notable es ruido de coma flotante. */
const TOLERANCIA_RUIDO = 1e-12;

export interface Razones {
  sen: number;
  cos: number;
  /** `null` = no definida (cos θ = 0: 90°, 270° y equivalentes). */
  tan: number | null;
}

/** (cos, sen) exactos de los cuatro semiejes: 0°, 90°, 180°, 270°. */
const PUNTOS_EJE: ReadonlyArray<readonly [number, number]> = [
  [1, 0],
  [0, 1],
  [-1, 0],
  [0, -1],
];

/** Grados reducidos a [0, 360). */
export function normalizarGrados(grados: number): number {
  return ((grados % 360) + 360) % 360;
}

/** Si el ángulo cae sobre un eje: 0 = +X, 1 = +Y, 2 = −X, 3 = −Y. Si no, `null`. */
export function ejeDe(grados: number): 0 | 1 | 2 | 3 | null {
  if (!Number.isFinite(grados)) return null;
  const r = normalizarGrados(grados);
  const k = Math.round(r / 90);
  if (Math.abs(r - k * 90) >= 1e-9) return null;
  return (k % 4) as 0 | 1 | 2 | 3;
}

/**
 * Absorbe el ruido de coma flotante: si `x` está a menos de 1e-12 (relativo) de un múltiplo
 * de ½, devuelve ese múltiplo. Normaliza también el −0.
 */
export function limpiarRuido(x: number): number {
  if (!Number.isFinite(x)) return x;
  const notable = Math.round(x * 2) / 2;
  if (Math.abs(x - notable) < TOLERANCIA_RUIDO * Math.max(1, Math.abs(x))) return notable + 0;
  return x + 0;
}

/** sen, cos y tan de un ángulo en grados, exactos en los ejes y sin ruido en los notables. */
export function razones(grados: number): Razones {
  const eje = ejeDe(grados);
  if (eje !== null) {
    const [cos, sen] = PUNTOS_EJE[eje];
    return { sen, cos, tan: cos === 0 ? null : sen / cos + 0 };
  }
  const rad = (grados * Math.PI) / 180;
  const sen = limpiarRuido(Math.sin(rad));
  const cos = limpiarRuido(Math.cos(rad));
  return { sen, cos, tan: limpiarRuido(sen / cos) };
}

/**
 * Cifra en formato español con signo menos tipográfico (U+2212), sin ruido de coma
 * flotante. `null` → «no definida».
 */
export function formatear(x: number | null, decimales = 3): string {
  if (x === null || !Number.isFinite(x)) return 'no definida';
  const texto = formatNumber(limpiarRuido(x), decimales);
  return texto.replace(/^-/, '−');
}

/** Identidades del ángulo doble, calculadas por su lado derecho a partir de sen θ y cos θ. */
export interface AnguloDoble {
  /** sen(2θ) = 2·sen θ·cos θ */
  sen2: number;
  /** cos(2θ) = cos²θ − sen²θ */
  cos2: number;
}

export function anguloDoble(grados: number): AnguloDoble {
  const { sen, cos } = razones(grados);
  return {
    sen2: limpiarRuido(2 * sen * cos),
    cos2: limpiarRuido(cos * cos - sen * sen),
  };
}

/** Ángulo B fijo con el que se ilustran las fórmulas de suma y resta: 30°, notable y exacto. */
export const ANGULO_B = 30;

/** Suma y resta con A = θ y B = 30°, calculadas por su lado derecho (el desarrollo). */
export interface SumaResta {
  /** sen(A + B) = sen A·cos B + cos A·sen B */
  senSuma: number;
  /** cos(A − B) = cos A·cos B + sen A·sen B */
  cosResta: number;
}

export function sumaResta(gradosA: number, gradosB: number = ANGULO_B): SumaResta {
  const a = razones(gradosA);
  const b = razones(gradosB);
  return {
    senSuma: limpiarRuido(a.sen * b.cos + a.cos * b.sen),
    cosResta: limpiarRuido(a.cos * b.cos + a.sen * b.sen),
  };
}

/**
 * Fracción del eje X de la gráfica (0 = x 0, 1 = x 2π) donde va el marcador de θ. El eje
 * dibuja un periodo completo [0, 2π] y el deslizador va de 0° a 360°, así que 360° es el
 * extremo DERECHO: reducir módulo 2π lo mandaba a x = 0 mientras la altura se calculaba en
 * x = 2π (hallazgo 1909), y con ω no entero las dos no coinciden.
 */
export function fraccionEjeX(grados: number): number {
  return Math.min(1, Math.max(0, grados / 360));
}
