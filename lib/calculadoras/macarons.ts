// Macarons (método francés) — lógica pura
//
// La base del macaron es el "tant pour tant" (TPT): igual peso de harina de
// almendra y azúcar glas. A eso se suma un merengue de claras y azúcar granulado.
// Aquí se escala todo a partir del peso de harina de almendra, con la proporción
// del método francés. 1 clara ≈ 33 g. Verificado: 2026-06.

// Proporciones respecto a la harina de almendra (= 100%).
export const RATIO_GLAS = 1; // TPT 1:1
export const RATIO_CLARAS = 0.75;
export const RATIO_GRANULADO = 0.9;
export const GRAMOS_POR_CLARA = 33;

export interface ResultadoMacarons {
  almendra_g: number;
  glas_g: number;
  claras_g: number;
  granulado_g: number;
  unidadesAprox: number;
}

/**
 * @param almendra_g gramos de harina de almendra (base)
 */
export function calcularMacarons(almendra_g: number): ResultadoMacarons | null {
  if (!(almendra_g > 0)) return null;
  // Una hornada de ~100 g de almendra rinde ~30 conchas (15 macarons).
  return {
    almendra_g: Math.round(almendra_g),
    glas_g: Math.round(almendra_g * RATIO_GLAS),
    claras_g: Math.round(almendra_g * RATIO_CLARAS),
    granulado_g: Math.round(almendra_g * RATIO_GRANULADO),
    unidadesAprox: Math.round((almendra_g / 100) * 15),
  };
}

// Permite partir del número de claras disponibles.
export function almendraDesdeClaras(numClaras: number): number {
  return Math.round((numClaras * GRAMOS_POR_CLARA) / RATIO_CLARAS);
}
