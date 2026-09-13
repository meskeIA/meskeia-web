/**
 * Datos fiscales: estimación directa del IRPF (modalidad simplificada)
 *
 * ⚠️ HERRAMIENTA DE ORIENTACIÓN — No constituye asesoramiento fiscal.
 * Datos verificados a la fecha indicada. Pueden haber cambiado.
 * Verifica siempre en la fuente oficial antes de tomar decisiones.
 *
 * Fuente: art. 30 del Reglamento del IRPF (RD 439/2007) + art. 30.2.4ª Ley 35/2006
 * Verificado: 2026-09-13
 * URL oficial: https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/irpf-2025/c07-rendimientos-actividades-economicas-estimacion-directa/fase-1-determinacion-rendimiento-neto/gastos-fiscalmente-deducibles/provisiones.html
 *
 * ⚠️ Nace el 13/09/2026 porque el repositorio se contradecía consigo mismo (hallazgo 811
 *    del Inspector): `lib/calculadoras/deduccionAutonomoIRPF.ts` aplicaba un 7 % al mismo
 *    concepto que `simulador-modulos-vs-directa`, `selectorRegimenFiscal.ts` y otras dos
 *    apps cifraban en el 5 %, citando todas el mismo artículo. El 7 % fue el porcentaje
 *    TRANSITORIO del ejercicio 2023 (DA 53ª LIRPF, redacción de la Ley 31/2022) y no se
 *    prorrogó: el Manual práctico de Renta 2025 de la AEAT dice literalmente que «en el
 *    período impositivo 2025 se mantiene la aplicación del porcentaje del 5 por 100».
 *    Sin constante en data/fiscal, ni el Vigía Normativo podía re-sellarlo ni nada
 *    avisaba de que una de las dos cifras era falsa.
 */

export const FISCAL_ESTIMACION_DIRECTA_META = {
  fuente: 'Reglamento del IRPF (RD 439/2007), art. 30 — Manual práctico de Renta 2025 (AEAT)',
  verificado: '2026-09-13',
  vigencia: '2025-2026',
  urlOficial:
    'https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/irpf-2025/c07-rendimientos-actividades-economicas-estimacion-directa/fase-1-determinacion-rendimiento-neto/gastos-fiscalmente-deducibles/provisiones.html',
  nota: 'El 5 % se aplica sobre el rendimiento neto POSITIVO, excluido este mismo concepto, y el tope de 2.000 €/año es conjunto para todas las actividades del contribuyente. Incompatible con la reducción del art. 32.2.1º LIRPF (autónomo con un único cliente no vinculado).',
};

/**
 * Conjunto de provisiones deducibles y gastos de difícil justificación de la modalidad
 * SIMPLIFICADA de estimación directa (art. 30.2.ª RIRPF).
 *
 * Solo aplica en estimación directa simplificada: ni en la normal ni en módulos.
 */
export const GASTOS_DIFICIL_JUSTIFICACION_EDS = {
  /** Porcentaje sobre el rendimiento neto positivo, excluido este concepto. */
  porcentaje: 5,
  /** Tope anual conjunto para todas las actividades del contribuyente, en €. */
  limiteAnual: 2000,
  norma: 'art. 30.2.ª RIRPF (RD 439/2007)',
};

/**
 * Importe neto de la cifra de negocios del año anterior por encima del cual la modalidad
 * simplificada deja de poder aplicarse (art. 28 RIRPF).
 */
export const LIMITE_CIFRA_NEGOCIO_EDS = 600000;

/**
 * Reducción del art. 30.2.ª RIRPF ya calculada y topada.
 *
 * @param rendimientoNetoPrevio Rendimiento neto antes de este concepto, en €.
 * @returns El importe deducible, 0 si el rendimiento no es positivo.
 */
export function reduccionGastosDificilJustificacion(rendimientoNetoPrevio: number): number {
  if (!(rendimientoNetoPrevio > 0)) return 0;
  return Math.min(
    (rendimientoNetoPrevio * GASTOS_DIFICIL_JUSTIFICACION_EDS.porcentaje) / 100,
    GASTOS_DIFICIL_JUSTIFICACION_EDS.limiteAnual
  );
}
