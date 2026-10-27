// Diferencia perceptual entre dos colores — lógica pura
//
// sRGB → CIELAB (iluminante D65, observador 2°) → ΔE00 (CIEDE2000).
//
// Fórmula: Sharma, G., Wu, W. & Dalal, E. N. (2005), «The CIEDE2000 color-difference
// formula: implementation notes, supplementary test data, and mathematical observations»,
// Color Research & Application 30(1), 21-30. Sus 34 pares de prueba son la referencia para
// validar una implementación: varios de ellos (9-12) existen solo para cazar el error
// habitual en el promedio del tono cuando los dos ángulos quedan a lados opuestos de 0°.
//
// ── Por qué existe (semilla S0202, 13/10/2026) ──────────────────────────────────────────
// `identificador-color-camara` NOMBRA cada color, pero dos nombres («azul marino» frente a
// «azul oscuro») no responden a la pregunta de quien tiene daltonismo ante dos calcetines o
// dos cables: ¿son el mismo color? Para eso hace falta una distancia, y la redmean con la que
// la app buscaba entonces los nombres servía para ordenar candidatos, no para decir cuánto se
// parecen dos colores. ΔE00 es la medida estándar de la CIE para eso. Desde cd5aa836 (el mismo
// 13/10/2026) también los nombres se eligen con ΔE00 (`nombreDeColor`, data/colores-nombrados.ts),
// con este mismo motor (cabo C0489).
//
// Se mide además cómo verían los dos colores varias deficiencias de la visión del color, con
// el modelo de Machado (`daltonismo.ts`): se simula cada color y se mide la distancia entre
// las dos simulaciones. Es una aproximación —ΔE00 se calibró con observadores de visión
// típica—, pero es la forma habitual de estimar si un par se confunde.

import { simularColor, srgbALineal, type TipoCVD } from './daltonismo';

export type RGB3 = readonly [number, number, number];

export interface Lab {
  L: number;
  a: number;
  b: number;
}

/** Blanco de referencia D65 (observador 2°), con Y normalizado a 1. */
const BLANCO_D65 = { X: 0.95047, Y: 1, Z: 1.08883 } as const;

/** Matriz sRGB lineal → XYZ (D65) de IEC 61966-2-1. */
const SRGB_A_XYZ = [
  [0.4124564, 0.3575761, 0.1804375],
  [0.2126729, 0.7151522, 0.072175],
  [0.0193339, 0.119192, 0.9503041],
] as const;

const EPSILON = 216 / 24389; // (6/29)³
const KAPPA = 24389 / 27; // (29/3)³

function f(t: number): number {
  return t > EPSILON ? Math.cbrt(t) : (KAPPA * t + 16) / 116;
}

/** Un color sRGB de 0-255 a CIELAB (D65). */
export function srgbALab(rgb: RGB3): Lab {
  const [r, g, b] = [srgbALineal(rgb[0]), srgbALineal(rgb[1]), srgbALineal(rgb[2])];
  const m = SRGB_A_XYZ;
  const X = m[0][0] * r + m[0][1] * g + m[0][2] * b;
  const Y = m[1][0] * r + m[1][1] * g + m[1][2] * b;
  const Z = m[2][0] * r + m[2][1] * g + m[2][2] * b;
  const fx = f(X / BLANCO_D65.X);
  const fy = f(Y / BLANCO_D65.Y);
  const fz = f(Z / BLANCO_D65.Z);
  return { L: 116 * fy - 16, a: 500 * (fx - fy), b: 200 * (fy - fz) };
}

const GRADOS = 180 / Math.PI;
const RAD = Math.PI / 180;

/** Tono en grados [0, 360); 0 para un color sin croma (a' = b = 0). */
function tono(b: number, aPrima: number): number {
  if (aPrima === 0 && b === 0) return 0;
  const h = Math.atan2(b, aPrima) * GRADOS;
  return h < 0 ? h + 360 : h;
}

/** ΔE00 entre dos colores CIELAB, con kL = kC = kH = 1 (condiciones de referencia). */
export function ciede2000(c1: Lab, c2: Lab): number {
  const C1 = Math.hypot(c1.a, c1.b);
  const C2 = Math.hypot(c2.a, c2.b);
  const Cmedia7 = Math.pow((C1 + C2) / 2, 7);
  const G = 0.5 * (1 - Math.sqrt(Cmedia7 / (Cmedia7 + Math.pow(25, 7))));

  const a1p = (1 + G) * c1.a;
  const a2p = (1 + G) * c2.a;
  const C1p = Math.hypot(a1p, c1.b);
  const C2p = Math.hypot(a2p, c2.b);
  const h1p = tono(c1.b, a1p);
  const h2p = tono(c2.b, a2p);

  const dLp = c2.L - c1.L;
  const dCp = C2p - C1p;
  let dhp = 0;
  if (C1p * C2p !== 0) {
    dhp = h2p - h1p;
    if (dhp > 180) dhp -= 360;
    else if (dhp < -180) dhp += 360;
  }
  const dHp = 2 * Math.sqrt(C1p * C2p) * Math.sin((dhp / 2) * RAD);

  const Lpm = (c1.L + c2.L) / 2;
  const Cpm = (C1p + C2p) / 2;
  let hpm: number;
  if (C1p * C2p === 0) hpm = h1p + h2p;
  else if (Math.abs(h1p - h2p) <= 180) hpm = (h1p + h2p) / 2;
  else if (h1p + h2p < 360) hpm = (h1p + h2p + 360) / 2;
  else hpm = (h1p + h2p - 360) / 2;

  const T =
    1 -
    0.17 * Math.cos((hpm - 30) * RAD) +
    0.24 * Math.cos(2 * hpm * RAD) +
    0.32 * Math.cos((3 * hpm + 6) * RAD) -
    0.2 * Math.cos((4 * hpm - 63) * RAD);
  const dTheta = 30 * Math.exp(-Math.pow((hpm - 275) / 25, 2));
  const Cpm7 = Math.pow(Cpm, 7);
  const RC = 2 * Math.sqrt(Cpm7 / (Cpm7 + Math.pow(25, 7)));
  const SL = 1 + (0.015 * Math.pow(Lpm - 50, 2)) / Math.sqrt(20 + Math.pow(Lpm - 50, 2));
  const SC = 1 + 0.045 * Cpm;
  const SH = 1 + 0.015 * Cpm * T;
  const RT = -Math.sin(2 * dTheta * RAD) * RC;

  const l = dLp / SL;
  const c = dCp / SC;
  const h = dHp / SH;
  return Math.sqrt(l * l + c * c + h * h + RT * c * h);
}

export type NivelDiferencia = 'iguales' | 'casi-iguales' | 'parecidos' | 'distintos';

/**
 * Umbrales ORIENTATIVOS. ΔE00 ≈ 1 se toma por convención como la diferencia mínima que un
 * observador entrenado aprecia comparando dos muestras juntas; por encima de ~6 la diferencia
 * se ve a simple vista. No hay una frontera oficial entre los tramos intermedios, y aquí
 * además la medida sale de una cámara, no de un colorímetro.
 */
export const UMBRALES_DELTA_E = { iguales: 1, casiIguales: 2.5, parecidos: 6 } as const;

export function nivelDiferencia(deltaE: number): NivelDiferencia {
  if (deltaE < UMBRALES_DELTA_E.iguales) return 'iguales';
  if (deltaE < UMBRALES_DELTA_E.casiIguales) return 'casi-iguales';
  if (deltaE < UMBRALES_DELTA_E.parecidos) return 'parecidos';
  return 'distintos';
}

/** Las visiones que se comparan, de la más común a la más rara. */
export const VISIONES_COMPARADAS: readonly { tipo: TipoCVD; nombre: string }[] = [
  { tipo: 'normal', nombre: 'Visión típica' },
  { tipo: 'deuteranomaly', nombre: 'Deuteranomalía' },
  { tipo: 'protanomaly', nombre: 'Protanomalía' },
  { tipo: 'deuteranopia', nombre: 'Deuteranopía' },
  { tipo: 'protanopia', nombre: 'Protanopía' },
  { tipo: 'tritanopia', nombre: 'Tritanopía' },
];

export interface ComparacionVision {
  tipo: TipoCVD;
  nombre: string;
  a: [number, number, number];
  b: [number, number, number];
  deltaE: number;
  nivel: NivelDiferencia;
}

/** Decimales con los que se ENSEÑA el ΔE00, y con los que por tanto se decide el tramo. */
export const DECIMALES_DELTA_E = 1;

/**
 * Compara dos colores sRGB tal como los vería cada visión de `VISIONES_COMPARADAS`.
 *
 * ── El tramo se decide con la cifra que se enseña (hallazgo 3583, 27/10/2026) ──────────
 * Se decidía con el ΔE00 sin redondear y se escribía con un decimal, así que 0,9712 salía
 * «No se distinguen (… 1,0)» y 1,0192 «Casi iguales (… 1,0)»: la misma cifra con dos
 * veredictos, contra la nota de la app («por debajo de 1 no se aprecia»). La diferencia
 * entre las dos lecturas es menor que lo que mide una cámara, así que manda la visible.
 */
export function compararColores(a: RGB3, b: RGB3): ComparacionVision[] {
  const factor = 10 ** DECIMALES_DELTA_E;
  return VISIONES_COMPARADAS.map(({ tipo, nombre }) => {
    const sa = simularColor(a, tipo);
    const sb = simularColor(b, tipo);
    const deltaE = ciede2000(srgbALab(sa), srgbALab(sb));
    const mostrado = Math.round(deltaE * factor) / factor;
    return { tipo, nombre, a: sa, b: sb, deltaE, nivel: nivelDiferencia(mostrado) };
  });
}
