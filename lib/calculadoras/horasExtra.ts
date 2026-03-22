/**
 * Calculadora de Horas Extra — lógica pura sin React ni DOM
 * Usada por: MCP server (calcular_horas_extra)
 *
 * Calcula el coste y los límites legales de las horas extraordinarias según el ET.
 *
 * Marco legal (ET art. 35):
 * - Límite máximo: 80 horas extra/año (no computan las compensadas con descanso
 *   dentro de los 4 meses siguientes)
 * - Retribución mínima: no inferior al valor de la hora ordinaria
 * - Alternativa: compensación con descanso equivalente
 * - Cotización SS: las horas extra cotizan con tipos especiales (art. 110 LGSS)
 *
 * Tipos especiales de cotización para horas extra (2025):
 * - Horas extra estructurales (fuerza mayor): empresa 12% + trabajador 2%
 * - Horas extra no estructurales (resto): empresa 23,6% + trabajador 4,7%
 *
 * IRPF: las horas extra tributan como rendimiento del trabajo (sin reducción especial)
 *
 * Fuente: ET art. 35 + LGSS art. 110 + Ley PGE cotizaciones 2025
 * Verificado: 2025-01-15
 *
 * Encadenable con: calcular_sueldo_neto, calcular_coste_empleado, calcular_irpf
 */

// ─── Constantes ────────────────────────────────────────────────────────────────

const LIMITE_ANUAL_HORAS_EXTRA = 80;

// Tipos cotización SS horas extra 2025 (%)
const COTIZACION_SS_FUERZA_MAYOR_EMPRESA = 12.0;
const COTIZACION_SS_FUERZA_MAYOR_TRABAJADOR = 2.0;
const COTIZACION_SS_OTRAS_EMPRESA = 23.6;
const COTIZACION_SS_OTRAS_TRABAJADOR = 4.7;

// ─── Tipos públicos ────────────────────────────────────────────────────────────

export type TipoHorasExtra = 'estructural_fuerza_mayor' | 'no_estructural';
export type CompensacionHorasExtra = 'monetaria' | 'descanso';

export interface ParametrosHorasExtra {
  /** Salario bruto anual del trabajador (€) — para calcular valor hora ordinaria */
  salarioBrutoAnual: number;
  /** Horas ordinarias anuales según contrato */
  horasOrdinariasAnuales: number;
  /** Número de horas extra realizadas (o a realizar) en el año */
  horasExtraAnuales: number;
  /** Tipo de horas extra (afecta a la cotización SS) */
  tipoHorasExtra?: TipoHorasExtra;
  /**
   * Compensación pactada: monetaria (pago) o descanso.
   * Por defecto monetaria.
   */
  compensacion?: CompensacionHorasExtra;
  /**
   * Recargo salarial aplicado sobre el valor de la hora ordinaria (%).
   * Por defecto 0% (igual que hora ordinaria, mínimo legal).
   * Ej: 25 para un recargo del 25%.
   */
  recargoSalarialPct?: number;
}

export interface ResultadoHorasExtra {
  /** Horas extra realizadas */
  horasExtra: number;
  /** ¿Supera el límite de 80 horas/año? */
  superaLimiteAnual: boolean;
  /** Horas extra que exceden el límite (si aplica) */
  horasExcesoLimite: number;
  /** Valor de la hora ordinaria (€) */
  valorHoraOrdinaria: number;
  /** Valor de la hora extra (€) — con el recargo aplicado */
  valorHoraExtra: number;
  /** Recargo aplicado sobre hora ordinaria (%) */
  recargoAplicadoPct: number;
  /** Compensación elegida */
  compensacion: CompensacionHorasExtra;
  /** Importe total horas extra (€) — si compensación monetaria */
  importeTotalHorasExtra?: number;
  /** Horas de descanso equivalentes — si compensación por descanso */
  horasDescansoEquivalentes?: number;

  // Cotización SS
  /** Tipo de horas extra a efectos SS */
  tipoHorasExtra: TipoHorasExtra;
  /** Cotización SS empresa por horas extra (€) */
  cotizacionSSEmpresa: number;
  /** Cotización SS trabajador por horas extra (€) */
  cotizacionSSTrabajador: number;
  /** Coste total para la empresa (importe + cuota SS empresa) (€) */
  costeTotalEmpresa: number;
  /** Neto trabajador tras SS (antes de IRPF) (€) */
  netoTrabajadorAntesIRPF: number;

  // Interpretación
  /** Interpretación y recomendación */
  interpretacion: string;
  /** Advertencias */
  advertencias: string[];
  /** Fuente normativa */
  fuenteDatos: string;
}

// ─── Función principal ─────────────────────────────────────────────────────────

export function calcularHorasExtra(p: ParametrosHorasExtra): ResultadoHorasExtra {
  if (p.salarioBrutoAnual <= 0) throw new Error('El salario bruto anual debe ser mayor que cero.');
  if (p.horasOrdinariasAnuales <= 0) throw new Error('Las horas ordinarias anuales deben ser mayores que cero.');
  if (p.horasExtraAnuales < 0) throw new Error('Las horas extra no pueden ser negativas.');

  const r = (n: number) => Math.round(n * 100) / 100;

  const tipoHorasExtra = p.tipoHorasExtra ?? 'no_estructural';
  const compensacion = p.compensacion ?? 'monetaria';
  const recargoAplicadoPct = p.recargoSalarialPct ?? 0;

  const valorHoraOrdinaria = r(p.salarioBrutoAnual / p.horasOrdinariasAnuales);
  const valorHoraExtra = r(valorHoraOrdinaria * (1 + recargoAplicadoPct / 100));

  const superaLimiteAnual = p.horasExtraAnuales > LIMITE_ANUAL_HORAS_EXTRA;
  const horasExcesoLimite = Math.max(0, p.horasExtraAnuales - LIMITE_ANUAL_HORAS_EXTRA);

  // Horas computables (hasta el límite legal)
  const horasComputablesSS = p.horasExtraAnuales; // Cotizan todas, incluso si exceden (infracción)

  // Cotización SS específica para horas extra
  const pctEmpresa = tipoHorasExtra === 'estructural_fuerza_mayor'
    ? COTIZACION_SS_FUERZA_MAYOR_EMPRESA
    : COTIZACION_SS_OTRAS_EMPRESA;
  const pctTrabajador = tipoHorasExtra === 'estructural_fuerza_mayor'
    ? COTIZACION_SS_FUERZA_MAYOR_TRABAJADOR
    : COTIZACION_SS_OTRAS_TRABAJADOR;

  const importeBaseHorasExtra = r(valorHoraExtra * horasComputablesSS);
  const cotizacionSSEmpresa = r(importeBaseHorasExtra * pctEmpresa / 100);
  const cotizacionSSTrabajador = r(importeBaseHorasExtra * pctTrabajador / 100);
  const costeTotalEmpresa = r(importeBaseHorasExtra + cotizacionSSEmpresa);
  const netoTrabajadorAntesIRPF = r(importeBaseHorasExtra - cotizacionSSTrabajador);

  let importeTotalHorasExtra: number | undefined;
  let horasDescansoEquivalentes: number | undefined;

  if (compensacion === 'monetaria') {
    importeTotalHorasExtra = importeBaseHorasExtra;
  } else {
    // Compensación por descanso: mínimo 1h de descanso por hora extra trabajada (puede mejorar el convenio)
    horasDescansoEquivalentes = p.horasExtraAnuales; // 1:1 como mínimo legal; convenio puede ser 1:1.25 o más
  }

  let interpretacion: string;
  if (p.horasExtraAnuales === 0) {
    interpretacion = 'No se han realizado horas extra.';
  } else if (compensacion === 'monetaria') {
    interpretacion = `${p.horasExtraAnuales} horas extra a ${valorHoraExtra.toFixed(2).replace('.', ',')} €/h = ${importeBaseHorasExtra.toLocaleString('es-ES', { minimumFractionDigits: 2 })} € brutos. Coste empresa: ${costeTotalEmpresa.toLocaleString('es-ES', { minimumFractionDigits: 2 })} € (incluye SS empresa ${pctEmpresa}%).`;
  } else {
    interpretacion = `${p.horasExtraAnuales} horas extra se compensan con ${horasDescansoEquivalentes} horas de descanso. Aunque no hay pago monetario, cotizan a la SS y tributan en IRPF en el momento de la compensación.`;
  }

  const advertencias: string[] = [
    `El límite legal de horas extra es ${LIMITE_ANUAL_HORAS_EXTRA} horas/año. Superarlo constituye infracción grave (LISOS art. 7.5) con multas de 751 a 7.500 €.`,
    'Las horas extra no computan en el límite anual si se compensan con descanso dentro de los 4 meses siguientes al período en que se realizan.',
    `Las horas extra cotizan a tipos especiales: empresa ${pctEmpresa}% + trabajador ${pctTrabajador}% (tipo ${tipoHorasExtra === 'estructural_fuerza_mayor' ? 'fuerza mayor' : 'ordinario'}).`,
    'El convenio colectivo puede prohibir las horas extra, limitar su número, establecer un recargo mínimo superior o regular la compensación por descanso.',
  ];

  if (superaLimiteAnual) {
    advertencias.unshift(`⚠️ ALERTA: Se superan las ${LIMITE_ANUAL_HORAS_EXTRA} horas extra anuales permitidas en ${horasExcesoLimite} horas. Infracción grave.`);
  }

  return {
    horasExtra: p.horasExtraAnuales,
    superaLimiteAnual,
    horasExcesoLimite,
    valorHoraOrdinaria,
    valorHoraExtra,
    recargoAplicadoPct,
    compensacion,
    importeTotalHorasExtra,
    horasDescansoEquivalentes,
    tipoHorasExtra,
    cotizacionSSEmpresa,
    cotizacionSSTrabajador,
    costeTotalEmpresa,
    netoTrabajadorAntesIRPF,
    interpretacion,
    advertencias,
    fuenteDatos: 'ET art. 35 + LGSS art. 110 + Ley PGE 2025 — cotizaciones horas extra vigentes 2025',
  };
}
