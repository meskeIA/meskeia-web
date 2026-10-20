/**
 * Datos fiscales: estimación directa del IRPF (modalidad simplificada)
 *
 * ⚠️ HERRAMIENTA DE ORIENTACIÓN — No constituye asesoramiento fiscal.
 * Datos verificados a la fecha indicada. Pueden haber cambiado.
 * Verifica siempre en la fuente oficial antes de tomar decisiones.
 *
 * Fuente: art. 30, regla 2.ª, del Reglamento del IRPF (RD 439/2007) + art. 30.2.4.ª Ley 35/2006
 * Verificado: 2026-10-20
 * URL oficial: https://www.boe.es/buscar/act.php?id=BOE-A-2007-6820#a30
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
 *
 * ⚠️ 20/10/2026 — re-sellado contra el BOE consolidado (cabo C0294, OK del usuario con la
 *    cita a la vista). Regla 2.ª del art. 30 RIRPF, redacción del RD 633/2015: «El conjunto
 *    de las provisiones deducibles y los gastos de difícil justificación se cuantificará
 *    aplicando el porcentaje del 5 por ciento sobre el rendimiento neto, excluido este
 *    concepto, sin que la cuantía resultante pueda superar 2.000 euros anuales». La LIRPF
 *    (actualizada a 07/10/2026) no trae porcentaje transitorio general para 2026: la DA 56.ª
 *    (7 %) es solo de 2023, y la DA 64.ª (RDL 22/2026) da un 10 % en 2026 SOLO a las
 *    actividades desarrolladas en Ceuta, que no se modela.
 */

export const FISCAL_ESTIMACION_DIRECTA_META = {
  fuente: 'Reglamento del IRPF (RD 439/2007), art. 30, regla 2.ª — tope en el art. 30.2.4.ª LIRPF',
  verificado: '2026-10-20',
  vigencia: '2025-2026',
  urlOficial: 'https://www.boe.es/buscar/act.php?id=BOE-A-2007-6820#a30',
  nota: 'El 5 % se aplica sobre el rendimiento neto POSITIVO, excluido este mismo concepto, y el tope de 2.000 €/año es conjunto para todas las actividades del contribuyente. Incompatible con la reducción del art. 32.2.1º LIRPF (autónomo con un único cliente no vinculado). En 2026, las actividades desarrolladas en Ceuta aplican un 10 % (DA 64.ª LIRPF, RDL 22/2026), que aquí no se calcula.',
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
  norma: 'art. 30, regla 2.ª, RIRPF (RD 439/2007)',
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
