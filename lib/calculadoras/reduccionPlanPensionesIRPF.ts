/**
 * Calculadora de Reduccion por Aportaciones a Planes de Pensiones en IRPF
 * Usada por: MCP server (calcular_reduccion_plan_pensiones_irpf)
 *
 * Calcula la reduccion de la base imponible general del IRPF por aportaciones
 * a sistemas de prevision social (planes de pensiones, PPA, PIAS, mutualidades).
 *
 * Marco normativo:
 *   - LIRPF art. 51: reducciones por aportaciones a sistemas de prevision social
 *   - LIRPF art. 52: limite maximo de reduccion
 *   - RDL 13/2022 y Ley 12/2022 (PGE 2023): nuevos limites desde 01/01/2022
 *   - DGT consultas vinculantes: criterios de aplicacion
 *
 * LIMITES DE APORTACION Y REDUCCION (desde 2022):
 *
 *   LIMITE INDIVIDUAL (art. 51 — contribuyente por cuenta propia o ajena):
 *   - Planes de pensiones individuales (PP) / PPA / PIAS propios:
 *     MAXIMO: 1.500 EUR/ano (reduccion limite en base general)
 *     (Antes de 2022 era 2.000 EUR; bajó con la reforma)
 *
 *   LIMITE EMPRESA (art. 51 — contribuciones del empleador):
 *   - Planes de empresa / EPSVs / planes de prevision de empresa:
 *     MAXIMO ADICIONAL: 8.500 EUR/ano de contribuciones de la empresa
 *     => El empleado puede aumentar hasta 8.500 EUR si su empresa aporta al menos 1 EUR
 *     => Con solo aportaciones propias: maximo 1.500 EUR
 *     => Con empresa + propias: hasta 10.000 EUR (1.500 propio + 8.500 empresa)
 *
 *   NOTA IMPORTANTE para autonomos:
 *   Los autonomos pueden aportar al Plan de Pensiones de Empleo Simplificado (PPES)
 *   hasta 4.250 EUR adicionales a los 1.500 EUR propios = 5.750 EUR maximos desde 2023.
 *
 *   LIMITE PORCENTUAL: El total reducible no puede superar el 30% de la suma
 *   de los rendimientos netos del trabajo y de actividades economicas del ejercicio.
 *
 *   EXCESO: Si la aportacion supera el limite, el exceso se puede trasladar a los
 *   5 ejercicios siguientes (siempre que no supere el limite de esos anos).
 *
 * APORTACIONES A FAVOR DEL CONYUGE:
 *   - Si el conyuge no obtiene rendimientos del trabajo/actividades o son < 8.000 EUR:
 *   - Reduccion adicional de hasta 1.000 EUR/ano
 *
 * Fuente: LIRPF arts. 51-52 (Ley 12/2022) — vigente 2025
 * Verificado: 2025-01-15
 *
 * Encadenable con: calcular_irpf, calcular_rescate_plan_pensiones, calcular_autonomos_cuota_ss
 */

// --- Constantes ---

const LIMITE_INDIVIDUAL_2025 = 1_500;          // EUR/ano (aportaciones propias PP individual/PPA/PIAS)
const LIMITE_EMPRESA_2025 = 8_500;             // EUR/ano (contribuciones empresa a plan de empresa)
const LIMITE_AUTONOMOS_PPES = 4_250;           // EUR/ano adicionales para autonomos (PPES)
const LIMITE_CONYUGE = 1_000;                  // EUR/ano (conyuge sin rendimientos o < 8.000 EUR)
const PCT_LIMITE_RENDIMIENTOS = 30;            // % sobre rendimientos neto trabajo + actividades
const UMBRAL_RENDIMIENTOS_CONYUGE = 8_000;     // EUR (conyuge debe tener rendimientos < esto)
const ANOS_TRASLADO_EXCESO = 5;               // Anos para trasladar el exceso no deducido

// --- Tipos publicos ---

export type PerfilContribuyentePP =
  | 'trabajador_cuenta_ajena'   // Empleado — puede tener contribucion empresa
  | 'autonomo_reta'             // Autonomo RETA — puede aportar a PPES
  | 'trabajador_sin_empresa';   // Empleado sin plan empresa

export interface ParametrosReduccionPlanPensionesIRPF {
  perfil: PerfilContribuyentePP;
  /** Aportaciones propias del contribuyente (PP individual, PPA, PIAS) (EUR/ano) */
  aportacionesPropiasAnuales: number;
  /** Contribuciones de la empresa al plan de empresa/EPSP (EUR/ano) */
  contribucionEmpresaAnual?: number;
  /**
   * Para autonomos: aportaciones al Plan de Pension de Empleo Simplificado (PPES)
   * Limite adicional: 4.250 EUR/ano (ademas de los 1.500 EUR propios)
   */
  aportacionesPPESAutonomo?: number;
  /** Aportaciones a favor del conyuge (EUR/ano) — si conyuge obtiene < 8.000 EUR */
  aportacionesConyuge?: number;
  /**
   * Rendimientos netos del trabajo + actividades economicas del ejercicio (EUR)
   * Para calcular el limite del 30%
   */
  rendimientosNetosEjercicio: number;
  /**
   * Exceso de aportaciones no deducido en ejercicios anteriores (EUR)
   * Pendiente de trasladar (hasta 5 anos)
   */
  excesoAnterioresPendiente?: number;
}

export interface ResultadoReduccionPlanPensionesIRPF {
  perfil: PerfilContribuyentePP;
  /** Aportaciones propias realizadas (EUR) */
  aportacionesPropias: number;
  /** Contribucion empresa (EUR) */
  contribucionEmpresa: number;
  /** Aportaciones PPES autonomo (EUR) */
  aportacionesPPES: number;
  /** Aportaciones a favor del conyuge (EUR) */
  aportacionesConyuge: number;
  /** Total aportaciones al sistema (EUR) */
  totalAportaciones: number;
  /** Limite individual legal (EUR) */
  limiteIndividualLegal: number;
  /** Limite empresa legal (EUR) */
  limiteEmpresaLegal: number;
  /** Limite por rendimientos (30% de rendimientos netos) (EUR) */
  limitePorRendimientos: number;
  /** Reduccion efectiva por aportaciones propias + empresa (EUR) */
  reduccionPrincipalEfectiva: number;
  /** Reduccion efectiva por aportaciones al conyuge (EUR) */
  reduccionConyugeEfectiva: number;
  /** Total reduccion base imponible general (EUR) */
  totalReduccion: number;
  /** Exceso de aportaciones no deducible este ano (trasladar 5 anos) */
  excesoNoDeducible: number;
  /** Ahorro fiscal estimado al tipo marginal del 45% (EUR) */
  ahorroFiscalEstimado45: number;
  advertencias: string[];
  fuenteDatos: string;
}

// --- Funcion principal ---

export function calcularReduccionPlanPensionesIRPF(
  p: ParametrosReduccionPlanPensionesIRPF
): ResultadoReduccionPlanPensionesIRPF {
  if (p.aportacionesPropiasAnuales < 0) throw new Error('Las aportaciones no pueden ser negativas.');
  if (p.rendimientosNetosEjercicio < 0) throw new Error('Los rendimientos netos no pueden ser negativos.');

  const r = (n: number) => Math.round(n * 100) / 100;
  const advertencias: string[] = [];

  const aportacionesPropias = r(p.aportacionesPropiasAnuales);
  const contribucionEmpresa = r(p.contribucionEmpresaAnual ?? 0);
  const aportacionesPPES = r(p.aportacionesPPESAutonomo ?? 0);
  const aportConyuge = r(p.aportacionesConyuge ?? 0);

  // Calcular limites
  const limiteIndividualLegal = LIMITE_INDIVIDUAL_2025;
  const limiteEmpresaLegal = contribucionEmpresa > 0 ? LIMITE_EMPRESA_2025 : 0;
  const limitePorRendimientos = r(p.rendimientosNetosEjercicio * PCT_LIMITE_RENDIMIENTOS / 100);

  // Reduccion por aportaciones propias
  const limitePropio = Math.min(limiteIndividualLegal, limitePorRendimientos);
  const reduccionPropias = Math.min(aportacionesPropias, limitePropio);

  // Reduccion por empresa (si hay contribucion empresa)
  let reduccionEmpresa = 0;
  if (contribucionEmpresa > 0) {
    reduccionEmpresa = Math.min(contribucionEmpresa, LIMITE_EMPRESA_2025);
  }

  // Reduccion PPES autonomos
  let reduccionPPES = 0;
  if (p.perfil === 'autonomo_reta' && aportacionesPPES > 0) {
    reduccionPPES = Math.min(aportacionesPPES, LIMITE_AUTONOMOS_PPES);
  }

  // Limit global: min(total aportaciones, limite por rendimientos)
  const reduccionPrincipalBruta = r(reduccionPropias + reduccionEmpresa + reduccionPPES);
  const reduccionPrincipalEfectiva = r(Math.min(reduccionPrincipalBruta, limitePorRendimientos));
  const excesoNoDeducible = r(Math.max(0, reduccionPrincipalBruta - reduccionPrincipalEfectiva));

  // Reduccion conyuge (independiente del limite 30%)
  const reduccionConyugeEfectiva = r(Math.min(aportConyuge, LIMITE_CONYUGE));

  const totalReduccion = r(reduccionPrincipalEfectiva + reduccionConyugeEfectiva);
  const totalAportaciones = r(aportacionesPropias + contribucionEmpresa + aportacionesPPES + aportConyuge);
  const ahorroFiscalEstimado45 = r(totalReduccion * 0.45);

  // Advertencias
  if (aportacionesPropias > limiteIndividualLegal) {
    advertencias.push(
      'EXCESO APORTACIONES PROPIAS: las aportaciones al plan individual (' +
      aportacionesPropias.toLocaleString('es-ES') + ' EUR) superan el limite de ' +
      LIMITE_INDIVIDUAL_2025.toLocaleString('es-ES') + ' EUR. ' +
      'El exceso no reduce la base imponible pero puede trasladarse a los ' +
      ANOS_TRASLADO_EXCESO + ' ejercicios siguientes (art. 52.2 LIRPF).'
    );
  }
  if (aportacionesPropias > 0 && contribucionEmpresa === 0 && p.perfil === 'trabajador_cuenta_ajena') {
    advertencias.push(
      'OPORTUNIDAD: si su empresa tiene plan de empresa, puede solicitar contribuciones ' +
      'empresariales de hasta ' + LIMITE_EMPRESA_2025.toLocaleString('es-ES') + ' EUR adicionales ' +
      '(limite 2025). Esto aumentaria su reduccion total a ' +
      (LIMITE_INDIVIDUAL_2025 + LIMITE_EMPRESA_2025).toLocaleString('es-ES') + ' EUR.'
    );
  }
  if (p.perfil === 'autonomo_reta' && aportacionesPPES === 0) {
    advertencias.push(
      'AUTONOMOS — PPES: los autonomos pueden aportar hasta ' + LIMITE_AUTONOMOS_PPES.toLocaleString('es-ES') +
      ' EUR adicionales al Plan de Pension de Empleo Simplificado (PPES) para autonomos. ' +
      'Esto eleva el limite total a ' + (LIMITE_INDIVIDUAL_2025 + LIMITE_AUTONOMOS_PPES).toLocaleString('es-ES') +
      ' EUR/ano (desde 2023).'
    );
  }
  if (excesoNoDeducible > 0) {
    advertencias.push(
      'Exceso no deducible por limite del 30% de rendimientos: ' +
      excesoNoDeducible.toLocaleString('es-ES') + ' EUR. ' +
      'Puede deducirse en los proximos ' + ANOS_TRASLADO_EXCESO + ' anos si en esos ejercicios ' +
      'el limite de rendimientos lo permite.'
    );
  }
  advertencias.push(
    'RESCATE: cuando se rescate el plan de pensiones, el importe tributa como rendimiento del ' +
    'trabajo (RDT) en la base general (escala progresiva). Los herederos tambien tributan ' +
    'como RDT (no como herencia).'
  );

  return {
    perfil: p.perfil,
    aportacionesPropias,
    contribucionEmpresa,
    aportacionesPPES,
    aportacionesConyuge: aportConyuge,
    totalAportaciones,
    limiteIndividualLegal,
    limiteEmpresaLegal,
    limitePorRendimientos,
    reduccionPrincipalEfectiva,
    reduccionConyugeEfectiva,
    totalReduccion,
    excesoNoDeducible,
    ahorroFiscalEstimado45,
    advertencias,
    fuenteDatos: 'LIRPF arts. 51-52 (Ley 12/2022) — vigente 2025',
  };
}
