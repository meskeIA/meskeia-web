/**
 * Calculadora de Despido Objetivo (ET arts. 52-53) — lógica pura
 * Usada por: MCP server (calcular_despido_objetivo)
 *
 * Calcula la indemnización y el finiquito en el despido por causas objetivas,
 * diferenciándolo del despido disciplinario y del improcedente.
 *
 * Marco normativo:
 *   - ET arts. 52-53: causas y procedimiento del despido objetivo
 *   - ET art. 53.5: si el despido es declarado improcedente, indemnización de 33 días
 *   - ET arts. 26, 56: definición de salario + despido improcedente
 *
 * CAUSAS DE DESPIDO OBJETIVO (ET art. 52):
 *   a) Ineptitud sobrevenida del trabajador
 *   b) Falta de adaptación a modificaciones técnicas del puesto
 *   c) Causas económicas, técnicas, organizativas o productivas
 *      (cuando afecte a menos trabajadores que los umbrales del ERE)
 *   d) Absentismo (faltas justificadas o injustificadas que alcancen ciertos umbrales)
 *   e) Insuficiencia de consignación para contratos de interinidad en sector público
 *
 * INDEMNIZACIÓN (ET art. 53.1.b):
 *   - 20 días de salario por año trabajado, prorrateándose por meses los períodos
 *     inferiores a un año.
 *   - Máximo: 12 mensualidades.
 *
 * PREAVISO (ET art. 53.1.c):
 *   - 15 días de preaviso (o salario sustitutivo si no se da preaviso).
 *   - Si el empresario incumple el preaviso: el despido sigue siendo válido pero
 *     debe abonarse el salario correspondiente a esos días.
 *
 * SI EL DESPIDO ES DECLARADO IMPROCEDENTE (ET art. 53.5):
 *   - El trabajador tiene derecho a la indemnización de despido improcedente:
 *     33 días/año, máximo 24 mensualidades (para contratos desde 12/02/2012)
 *     o 45 días/año si el contrato se firmó antes del 12/02/2012 (período anterior
 *     a la reforma laboral de 2012).
 *   - La diferencia entre los 20 y los 33/45 días es la que se paga adicionalmente.
 *
 * BASE DEL SALARIO DIARIO:
 *   = Salario bruto anual / 365 días
 *   (incluye prorrateo de pagas extraordinarias)
 *
 * Fuente: ET arts. 52-53, 56 — vigente 2025
 * Verificado: 2025-01-15
 *
 * Encadenable con: calcular_finiquito, calcular_sueldo_neto, calcular_pension_desempleo
 */

// ─── Constantes ────────────────────────────────────────────────────────────

const DIAS_INDEMNIZACION_OBJETIVO = 20;        // días/año (procedente)
const DIAS_INDEMNIZACION_IMPROCEDENTE = 33;    // días/año contratos desde 12/02/2012
const DIAS_INDEMNIZACION_IMPROCEDENTE_PRE2012 = 45; // días/año contratos antes de 12/02/2012
const MESES_MAX_OBJETIVO = 12;                 // mensualidades máximas
const MESES_MAX_IMPROCEDENTE = 24;             // mensualidades máximas
const DIAS_PREAVISO = 15;                      // días de preaviso legal

// ─── Tipos públicos ────────────────────────────────────────────────────────

export type CausaDespidoObjetivo =
  | 'causas_economicas_tecnicas'
  | 'ineptitud_sobrevenida'
  | 'falta_adaptacion'
  | 'absentismo'
  | 'otras';

export interface ParametrosDespidoObjetivo {
  /** Causa del despido objetivo */
  causaDespido: CausaDespidoObjetivo;
  /** Salario bruto anual del trabajador (€) — incluyendo pagas extras prorrateadas */
  salarioBrutoAnual: number;
  /** Antigüedad en años y meses: años completos */
  aniosAntiguedad: number;
  /** Antigüedad en años y meses: meses adicionales (0-11) */
  mesesAntiguedadAdicionales?: number;
  /**
   * Fecha de inicio del contrato (para determinar si aplica la transición
   * de 45 → 33 días/año para el período pre/post 12/02/2012).
   * Format: 'YYYY-MM-DD' o 'YYYY-MM'
   */
  fechaInicioContrato?: string;
  /** ¿El empresario ha dado el preaviso de 15 días? */
  preAvisoDado?: boolean;
  /** ¿Ha sido declarado improcedente por el juzgado? */
  declaradoImprocedente?: boolean;
}

export interface ResultadoDespidoObjetivo {
  causaDespido: CausaDespidoObjetivo;
  /** Salario diario (€) */
  salarioDiario: number;
  /** Salario mensual (€) */
  salarioMensual: number;
  /** Antigüedad total en años (con meses prorrateados) */
  antiguedadAnios: number;

  // Despido procedente (20 días/año)
  /** Días de indemnización (procedente) */
  diasIndemnizacionProcedente: number;
  /** Máximo en días (12 mensualidades) */
  maxDiasProcedente: number;
  /** Días aplicados (el menor de los dos) */
  diasAplicadosProcedente: number;
  /** **Indemnización por despido objetivo (€)** */
  indemnizacionObjetivo: number;

  // Preaviso
  /** ¿Preaviso dado? */
  preAvisoDado: boolean;
  /** Salario días preaviso (€) — a pagar si no se dio preaviso */
  salarioPreavisoNoDado: number;

  // Si declarado improcedente
  /** ¿Declarado improcedente? */
  declaradoImprocedente: boolean;
  /** Indemnización si se declara improcedente (33 días/año) (€) */
  indemnizacionImprocedente: number;
  /** Diferencia adicional a pagar si improcedente (€) */
  diferenciaImprocedente: number;

  /** Advertencias */
  advertencias: string[];
  /** Fuente normativa */
  fuenteDatos: string;
}

// ─── Función principal ─────────────────────────────────────────────────────

export function calcularDespidoObjetivo(p: ParametrosDespidoObjetivo): ResultadoDespidoObjetivo {
  if (p.salarioBrutoAnual <= 0) throw new Error('El salario bruto anual debe ser mayor que cero.');
  if (p.aniosAntiguedad < 0) throw new Error('Los años de antigüedad no pueden ser negativos.');

  const r = (n: number) => Math.round(n * 100) / 100;
  const advertencias: string[] = [];

  const salarioDiario = r(p.salarioBrutoAnual / 365);
  const salarioMensual = r(p.salarioBrutoAnual / 12);
  const mesesAdicionales = p.mesesAntiguedadAdicionales ?? 0;
  const antiguedadAnios = r(p.aniosAntiguedad + mesesAdicionales / 12);

  // ── Indemnización procedente (20 días/año, máx 12 mensualidades) ──────────
  const diasIndemnizacionProcedente = r(antiguedadAnios * DIAS_INDEMNIZACION_OBJETIVO);
  const maxDiasProcedente = r(MESES_MAX_OBJETIVO * 30.44); // 12 meses en días
  const diasAplicadosProcedente = Math.min(diasIndemnizacionProcedente, maxDiasProcedente);
  const indemnizacionObjetivo = r(diasAplicadosProcedente * salarioDiario);

  // ── Preaviso ──────────────────────────────────────────────────────────────
  const preAvisoDado = p.preAvisoDado ?? true;
  const salarioPreavisoNoDado = preAvisoDado ? 0 : r(DIAS_PREAVISO * salarioDiario);

  // ── Si declarado improcedente ─────────────────────────────────────────────
  const declaradoImprocedente = p.declaradoImprocedente ?? false;

  // Determinar si hay período pre-2012 (contratos antes del 12/02/2012)
  const fechaReforma = new Date('2012-02-12');
  const fechaInicio = p.fechaInicioContrato ? new Date(p.fechaInicioContrato) : null;
  const hayPeriodoPre2012 = fechaInicio !== null && fechaInicio < fechaReforma;

  if (hayPeriodoPre2012) {
    advertencias.push('Contrato con período ANTERIOR al 12/02/2012: la indemnización por despido improcedente se calcula a 45 días/año para el período anterior y 33 días/año para el posterior (con topes propios de cada tramo). Esta calculadora aplica 33 días/año al total para simplificar — calcular el tramo dual con asesor laboral.');
  }

  const diasImprocedente = r(antiguedadAnios * DIAS_INDEMNIZACION_IMPROCEDENTE);
  const maxDiasImprocedente = r(MESES_MAX_IMPROCEDENTE * 30.44);
  const diasAplicadosImprocedente = Math.min(diasImprocedente, maxDiasImprocedente);
  const indemnizacionImprocedente = r(diasAplicadosImprocedente * salarioDiario);
  const diferenciaImprocedente = r(Math.max(0, indemnizacionImprocedente - indemnizacionObjetivo));

  // ── Advertencias ──────────────────────────────────────────────────────────
  advertencias.push('PROCEDIMIENTO OBLIGATORIO (ET art. 53): el empresario debe entregar SIMULTÁNEAMENTE con la carta de despido: (1) copia de la carta al representante de los trabajadores, (2) la indemnización de 20 días/año, (3) preaviso de 15 días. El incumplimiento de cualquier requisito formal puede dar lugar a la declaración de improcedencia.');
  advertencias.push('El trabajador puede impugnar el despido ante el SMAC y posteriormente en el Juzgado de lo Social. Si se declara improcedente, el empresario deberá abonar 33 días/año (máx. 24 mensualidades) menos la indemnización ya pagada.');
  if (p.causaDespido === 'absentismo') {
    advertencias.push('Despido por absentismo (ET art. 52.d): requiere que las faltas alcancen: 20% de la jornada en 2 meses consecutivos, o 25% en 4 meses discontinuos en el período de 12 meses anteriores. Las faltas por huelga legal, accidente de trabajo, maternidad/paternidad, enfermedades crónicas o bajas de más de 20 días continuos NO computan.');
  }
  if (p.causaDespido === 'causas_economicas_tecnicas') {
    advertencias.push('Causas económicas, técnicas, organizativas o productivas: si el número de trabajadores afectados alcanza los umbrales del ET art. 51 (ERE colectivo), debe seguirse el procedimiento de despido colectivo, no el objetivo individual.');
  }

  return {
    causaDespido: p.causaDespido,
    salarioDiario,
    salarioMensual,
    antiguedadAnios,
    diasIndemnizacionProcedente,
    maxDiasProcedente: r(maxDiasProcedente),
    diasAplicadosProcedente: r(diasAplicadosProcedente),
    indemnizacionObjetivo,
    preAvisoDado,
    salarioPreavisoNoDado,
    declaradoImprocedente,
    indemnizacionImprocedente,
    diferenciaImprocedente,
    advertencias,
    fuenteDatos: 'ET arts. 52-53, 56 — vigente 2025',
  };
}
