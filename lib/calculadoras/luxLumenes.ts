/**
 * Motor de la conversión lux ↔ candelas ↔ lúmenes de UNA fuente de luz (linterna, foco,
 * bombilla), para el bloque «De lux a lúmenes» del luxómetro. Lógica pura, sin React.
 * Casos resueltos a mano en `tests/lux-lumenes-motor.spec.ts`.
 *
 * ── Por qué existe (S0270, 12/11/2026) ────────────────────────────────────────
 * Al luxómetro le llegaban 14 consultas de lúmenes («medir lumens con celular», «medidor de
 * lúmenes»…) que la app no atendía. El móvil no mide lúmenes: el lumen es la luz TOTAL que
 * emite una fuente y una lectura en lux es la que cae en UN punto. Lo que sí se puede hacer, y
 * es lo que hace este motor, es pasar de una cosa a la otra con dos datos más —la distancia y
 * el ángulo del haz— y un modelo dicho en voz alta.
 *
 * ── El modelo ─────────────────────────────────────────────────────────────────
 *  · Intensidad en el eje (ley del inverso del cuadrado): I [cd] = E [lx] · d² [m²].
 *    Vale a una distancia de al menos unas cinco veces el tamaño de la fuente («distancia
 *    fotométrica»); más cerca, la fuente no se comporta como un punto.
 *  · Ángulo sólido de un cono de ángulo total θ: Ω [sr] = 2π · (1 − cos(θ/2)).
 *    θ = 180° da 2π (media esfera) y θ = 360° da 4π (todas las direcciones).
 *  · Flujo: Φ [lm] = I · Ω, SUPONIENDO que la intensidad es la misma en todo el haz y nula
 *    fuera. Un haz real se difumina en el borde y reparte luz fuera del ángulo nominal: en un
 *    haz estrecho con caída gaussiana el flujo real sale ~1/ln 2 ≈ 1,44 veces mayor. Por eso la
 *    vista lo presenta como aproximación y no como medida.
 *  · Alcance tipo ANSI/PLATO FL1 de una linterna: distancia a la que la iluminancia cae a
 *    0,25 lx (la luz de la luna llena) → d = √(I / 0,25) = 2·√I.
 *
 * ── Sentido inverso ───────────────────────────────────────────────────────────
 * De los lúmenes y el ángulo que da el fabricante a los lux a una distancia: I = Φ / Ω y
 * E = I / d². Mismo modelo, misma advertencia.
 */

/** Iluminancia a la que el estándar ANSI/PLATO FL1 define el alcance de una linterna. */
export const LUX_ALCANCE_FL1 = 0.25;

/** Ángulos de haz típicos que la vista ofrece como atajo. */
export const ANGULOS_TIPICOS: readonly { grados: number; etiqueta: string }[] = [
  { grados: 10, etiqueta: 'Linterna enfocada (10°)' },
  { grados: 25, etiqueta: 'Foco estrecho (25°)' },
  { grados: 36, etiqueta: 'Foco tipo GU10 (36°)' },
  { grados: 60, etiqueta: 'Downlight (60°)' },
  { grados: 120, etiqueta: 'Panel o tira LED (120°)' },
  { grados: 360, etiqueta: 'En todas direcciones (360°)' },
];

export type ResultadoFotometria =
  | { ok: true; candelas: number; lumenes: number; lux: number; anguloSolido: number; alcanceFl1: number }
  | { ok: false; error: string };

/** Ángulo sólido (sr) de un cono de ángulo TOTAL `grados`. NaN fuera de (0, 360]. */
export function anguloSolido(grados: number): number {
  if (!Number.isFinite(grados) || grados <= 0 || grados > 360) return Number.NaN;
  const mitad = (grados / 2) * (Math.PI / 180);
  return 2 * Math.PI * (1 - Math.cos(mitad));
}

/** Alcance tipo FL1 (m) de una fuente de `candelas` en el eje. */
export function alcanceFl1(candelas: number): number {
  return Math.sqrt(candelas / LUX_ALCANCE_FL1);
}

function validarComun(distancia: number, grados: number): string | null {
  if (!Number.isFinite(distancia) || distancia <= 0) return 'La distancia tiene que ser un número mayor que 0.';
  if (!Number.isFinite(grados) || grados <= 0 || grados > 360) {
    return 'El ángulo del haz tiene que estar entre más de 0° y 360°.';
  }
  return null;
}

/**
 * De una lectura en lux a la distancia `distancia` (m), en el eje del haz, a candelas y
 * lúmenes aproximados para un haz de ángulo total `grados`.
 */
export function desdeLux(lux: number, distancia: number, grados: number): ResultadoFotometria {
  if (!Number.isFinite(lux) || lux < 0) return { ok: false, error: 'Los lux tienen que ser un número igual o mayor que 0.' };
  const error = validarComun(distancia, grados);
  if (error) return { ok: false, error };
  const omega = anguloSolido(grados);
  const candelas = lux * distancia * distancia;
  return { ok: true, candelas, lumenes: candelas * omega, lux, anguloSolido: omega, alcanceFl1: alcanceFl1(candelas) };
}

/**
 * De los lúmenes de una fuente con haz de ángulo total `grados` a los lux que da en el eje
 * a la distancia `distancia` (m).
 */
export function desdeLumenes(lumenes: number, distancia: number, grados: number): ResultadoFotometria {
  if (!Number.isFinite(lumenes) || lumenes < 0) {
    return { ok: false, error: 'Los lúmenes tienen que ser un número igual o mayor que 0.' };
  }
  const error = validarComun(distancia, grados);
  if (error) return { ok: false, error };
  const omega = anguloSolido(grados);
  const candelas = lumenes / omega;
  return {
    ok: true,
    candelas,
    lumenes,
    lux: candelas / (distancia * distancia),
    anguloSolido: omega,
    alcanceFl1: alcanceFl1(candelas),
  };
}
