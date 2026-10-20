/**
 * Carteras de los cinco perfiles de inversor y su rentabilidad y volatilidad esperadas — lógica
 * pura sin React ni DOM.
 * Usada por: `app/estimador-cartera-inversion/`, que simula la cartera, y `app/test-perfil-inversor/`,
 * que pinta sus rasgos y su tabla comparativa.
 *
 * ⚠️ 20/10/2026 (hallazgo 3227, cabo C0158; decidido por el usuario): el test anunciaba para cada
 *    cartera una volatilidad tecleada sin fuente (5–8 … 20–25 %) y el estimador al que enlaza
 *    «Simular esta cartera» calculaba otra para la MISMA cartera (4,53 … 14,72 %). Ahora las dos
 *    páginas leen de aquí las carteras, las hipótesis de cada clase de activo y el cálculo.
 *
 * Las hipótesis (μ y σ de cada clase, correlaciones) son las del estimador desde su origen, sin
 * fuente externa: son supuestos del modelo, no datos medidos, y así se rotulan en las dos apps.
 */

export type PerfilInversor = 'conservador' | 'moderado' | 'equilibrado' | 'dinamico' | 'agresivo';

/** Reparto de la cartera en porcentaje (suma 100). */
export interface CarteraPerfil {
  /** Renta variable */
  rv: number;
  /** Renta fija */
  rf: number;
  /** Liquidez */
  liq: number;
  /** Alternativos */
  alt: number;
}

export type ClaseActivo = keyof CarteraPerfil;

/** Hipótesis anuales de cada clase de activo, en fracción: μ (rentabilidad media) y σ. */
export const PARAMETROS_CLASES: Record<ClaseActivo, { rentabilidadMedia: number; volatilidad: number }> = {
  rv: { rentabilidadMedia: 0.07, volatilidad: 0.16 },
  rf: { rentabilidadMedia: 0.03, volatilidad: 0.05 },
  liq: { rentabilidadMedia: 0.015, volatilidad: 0.005 },
  alt: { rentabilidadMedia: 0.05, volatilidad: 0.12 },
};

/** El orden de las filas y columnas de CORRELACIONES. */
const ORDEN: ClaseActivo[] = ['rv', 'rf', 'liq', 'alt'];

/**
 * Matriz de correlaciones simplificada: RV-RF 0,25 · RV-LIQ 0,10 · RV-ALT 0,40 · RF-LIQ 0,05 ·
 * RF-ALT 0,15 · LIQ-ALT 0,05.
 */
const CORRELACIONES = [
  [1.0, 0.25, 0.1, 0.4],
  [0.25, 1.0, 0.05, 0.15],
  [0.1, 0.05, 1.0, 0.05],
  [0.4, 0.15, 0.05, 1.0],
];

export const CARTERAS_PERFIL: Record<PerfilInversor, CarteraPerfil> = {
  conservador: { rv: 15, rf: 60, liq: 20, alt: 5 },
  moderado: { rv: 30, rf: 50, liq: 15, alt: 5 },
  equilibrado: { rv: 50, rf: 35, liq: 10, alt: 5 },
  dinamico: { rv: 70, rf: 20, liq: 5, alt: 5 },
  agresivo: { rv: 90, rf: 5, liq: 0, alt: 5 },
};

/**
 * Rentabilidad nominal ponderada y volatilidad de una cartera (Markowitz), en fracción anual:
 * σp² = Σ wi·wj·σi·σj·ρij.
 */
export function calcularParametrosCartera(cartera: CarteraPerfil): { rentabilidad: number; volatilidad: number } {
  const pesos = ORDEN.map((c) => cartera[c] / 100);
  const rentabilidad = ORDEN.reduce((suma, c, i) => suma + pesos[i] * PARAMETROS_CLASES[c].rentabilidadMedia, 0);
  let varianza = 0;
  for (let i = 0; i < ORDEN.length; i++) {
    for (let j = 0; j < ORDEN.length; j++) {
      varianza +=
        pesos[i] * pesos[j] * PARAMETROS_CLASES[ORDEN[i]].volatilidad * PARAMETROS_CLASES[ORDEN[j]].volatilidad * CORRELACIONES[i][j];
    }
  }
  return { rentabilidad, volatilidad: Math.sqrt(varianza) };
}
