/**
 * Motor del visualizador de computación cuántica — funciones puras, sin dependencias de React.
 *
 * Casos resueltos a mano (script aparte con matrices 2×2, no este código):
 *   · Regla de Born sobre la esfera de Bloch, estado cos(θ/2)|0⟩ + sin(θ/2)|1⟩:
 *       θ = 90° → P(0) = cos²45° = 0,5 · θ = 60° → cos²30° = 0,75 · θ = 180° → P(1) = 1
 *   · Tras medir, el estado ES |k⟩: P(k) = 1 y P(1−k) = 0, sea cual sea θ.
 *   · 2⁵⁰ = 1.125.899.906.842.624 ≈ 1,126·10¹⁵. En la escala larga del español
 *     (billón = 10¹², trillón = 10¹⁸) son «~1.126 billones», no «billones de billones» (10²⁴).
 *   · Barra en escala logarítmica: longitud ∝ log₂(estados) = número de qubits.
 *     1 estado → 0 · 2²⁰ → 20/50 = 40 % · 2⁵⁰ → 100 %.
 */

import { formatNumber } from '@/lib';

/** Qubits de la fila de referencia más larga de la comparativa. */
export const QUBITS_REFERENCIA = 50;

/** Probabilidades de medir |0⟩ y |1⟩ (en tanto por uno). */
export function probabilidades(
  thetaGrados: number,
  medicion: 0 | 1 | null,
): { p0: number; p1: number } {
  if (medicion !== null) {
    // Después de medir ya no hay superposición: el estado es |k⟩.
    return medicion === 0 ? { p0: 1, p1: 0 } : { p0: 0, p1: 1 };
  }
  const mitad = (thetaGrados * Math.PI) / 360;
  return { p0: Math.cos(mitad) ** 2, p1: Math.sin(mitad) ** 2 };
}

/** Número de estados de la base computacional con n qubits: 2ⁿ. */
export function numeroEstados(n: number): number {
  return 2 ** n;
}

/** 2ⁿ con todas sus cifras en formato español (2²⁰ → «1.048.576»; 2¹⁰ → «1024», sin punto). */
export function formatearEstados(n: number): string {
  return numeroEstados(n).toLocaleString('es-ES');
}

/**
 * Lectura aproximada de una cifra grande en la ESCALA LARGA española:
 * millón = 10⁶ · billón = 10¹² · trillón = 10¹⁸. Nunca «billones de billones».
 */
export function leerEnEscalaLarga(valor: number): string {
  if (valor >= 1e18) {
    const t = valor / 1e18;
    return `~${formatNumber(t, 0)} ${Math.round(t) === 1 ? 'trillón' : 'trillones'}`;
  }
  if (valor >= 1e12) {
    const b = valor / 1e12;
    return `~${formatNumber(b, 0)} ${Math.round(b) === 1 ? 'billón' : 'billones'}`;
  }
  if (valor >= 1e6) {
    const m = valor / 1e6;
    return `~${formatNumber(m, 0)} ${Math.round(m) === 1 ? 'millón' : 'millones'}`;
  }
  return formatNumber(valor, 0);
}

/**
 * Fracción (0-1) de la barra de la comparativa, en escala logarítmica: log₂(estados) / 50.
 * En escala lineal la barra de 20 qubits no llegaría a una milmillonésima de la de 50.
 */
export function fraccionBarra(estados: number): number {
  return Math.min(Math.log2(Math.max(estados, 1)) / QUBITS_REFERENCIA, 1);
}

/** «1 qubit» / «2 qubits»; «1 bit clásico» / «2 bits clásicos». */
export function etiquetaQubits(n: number): string {
  return `${n} ${n === 1 ? 'qubit' : 'qubits'}`;
}

export function etiquetaBits(n: number): string {
  return `${n} ${n === 1 ? 'bit clásico' : 'bits clásicos'}`;
}

// ─────────────────────────────────────────────
// Calendario de retirada de la criptografía vulnerable
// ─────────────────────────────────────────────

/**
 * Fuente: NIST IR 8547 (borrador inicial, 12/11/2024), «Transition to Post-Quantum Cryptography
 * Standards», tablas 2 y 4. Algoritmos de clave pública vulnerables a un ordenador cuántico:
 *   · 112 bits de seguridad (RSA-2048, ECC de 224 bits): «deprecated after 2030» (desaconsejados
 *     desde 2031) y «disallowed after 2035» (no admitidos desde 2036).
 *   · 128 bits o más (RSA-3072, ECC de 256 bits, EdDSA…): «disallowed after 2035».
 * Es una PROPUESTA en borrador para los sistemas del Gobierno federal de EE. UU., no una ley
 * universal; se presenta así en pantalla.
 */
export const NIST_IR_8547 = {
  documento: 'NIST IR 8547 (borrador del 12/11/2024)',
  desaconsejadoDesde: 2031,
  noAdmitidoDesde: 2036,
} as const;

export interface EstadoCalendario {
  admitidos: string[];
  desaconsejados: string[];
  noAdmitidos: string[];
}

const SEGURIDAD_112 = ['RSA-2048', 'ECC de 224 bits'];
const SEGURIDAD_128 = ['RSA-3072 o mayor', 'ECC de 256 bits o mayor', 'EdDSA'];

export function estadoCalendario(ano: number): EstadoCalendario {
  if (ano >= NIST_IR_8547.noAdmitidoDesde) {
    return { admitidos: [], desaconsejados: [], noAdmitidos: [...SEGURIDAD_112, ...SEGURIDAD_128] };
  }
  if (ano >= NIST_IR_8547.desaconsejadoDesde) {
    return { admitidos: [...SEGURIDAD_128], desaconsejados: [...SEGURIDAD_112], noAdmitidos: [] };
  }
  return { admitidos: [...SEGURIDAD_112, ...SEGURIDAD_128], desaconsejados: [], noAdmitidos: [] };
}

/**
 * Estándares post-cuánticos del NIST publicados como FIPS definitivos el 13/08/2024.
 * FALCON (futuro FIPS 206, FN-DSA) y HQC siguen en proceso de estandarización (NIST, CSRC).
 */
export const PQC_PUBLICADOS = [
  { nombre: 'ML-KEM (CRYSTALS-Kyber)', norma: 'FIPS 203' },
  { nombre: 'ML-DSA (CRYSTALS-Dilithium)', norma: 'FIPS 204' },
  { nombre: 'SLH-DSA (SPHINCS+)', norma: 'FIPS 205' },
] as const;

export const PQC_EN_PROCESO = ['FN-DSA (FALCON), futuro FIPS 206', 'HQC'] as const;
