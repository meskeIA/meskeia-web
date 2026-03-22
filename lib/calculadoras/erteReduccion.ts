/**
 * Calculadora de ERTE por Reducción de Jornada — lógica pura
 * Usada por: MCP server (calcular_erte_reduccion)
 *
 * Calcula el impacto económico en trabajador y empresa de un Expediente de
 * Regulación Temporal de Empleo (ERTE) en la modalidad de reducción de jornada.
 *
 * Marco normativo:
 *   - ET art. 47: suspensión y reducción de jornada por causas ETOP
 *   - RDL 30/2015 (MECIPRI) + Ley 32/2021 (MECAS — mecanismo de equidad
 *     intergeneracional) + RDL 6/2022 (ERTE energía)
 *   - LGSS arts. 267-270: prestación por desempleo parcial durante ERTE
 *
 * REDUCCIÓN DE JORNADA (ET art. 47.2):
 *   - Puede reducirse entre el 10% y el 70% de la jornada ordinaria.
 *   - El trabajador mantiene el empleo y cobra parte del salario.
 *   - El SEPE paga la prestación de desempleo PROPORCIONAL por las horas
 *     no trabajadas durante el tiempo que dure el ERTE.
 *
 * PRESTACIÓN DEL SEPE DURANTE EL ERTE:
 *   - 70% de la base reguladora durante los PRIMEROS 180 días de consumo de prestación.
 *   - 50% de la base reguladora a partir del día 181.
 *   - Base reguladora diaria = suma de bases de cotización por desempleo de los
 *     últimos 180 días / 180.
 *   - Solo por las horas reducidas (proporcional a la reducción).
 *   - Topes: máximos y mínimos de la prestación (relacionados con IPREM y nº hijos).
 *   - IMPORTANTE: Durante el ERTE el tiempo NO consume el contador de prestación
 *     de desempleo si el ERTE es por causas ETOP con autorización/comunicación.
 *
 * COTIZACIÓN SS DURANTE EL ERTE:
 *   - Empresa: cotiza por las horas efectivamente trabajadas.
 *   - SEPE: cotiza por las horas no trabajadas (toma a su cargo la cotización).
 *   - Si hay exoneración (MECAS): la empresa está exonerada de cotizar por las
 *     horas no trabajadas durante el período autorizado.
 *
 * Fuente: ET art. 47 + LGSS arts. 267-270 + Ley 32/2021 — vigente 2025
 * Verificado: 2025-01-15
 *
 * Encadenable con: calcular_pension_desempleo, calcular_coste_empleado, calcular_sueldo_neto
 */

// ─── Constantes ────────────────────────────────────────────────────────────

const PCT_PRESTACION_PRIMEROS_180_DIAS = 70;    // %
const PCT_PRESTACION_DESDE_DIA_181 = 50;        // %
const PCT_MIN_REDUCCION_JORNADA = 10;           // %
const PCT_MAX_REDUCCION_JORNADA = 70;           // %
const TIPO_SS_EMPRESA_TRABAJO = 23.6;           // % cuota empresa por contingencias comunes
const TIPO_SS_TRABAJADOR = 4.7;                 // % cuota trabajador

// ─── Tipos públicos ────────────────────────────────────────────────────────

export type MotivoERTE = 'etop_economico' | 'etop_tecnico_organizativo' | 'fuerza_mayor' | 'mecanismo_red';

export interface ParametrosERTEReduccion {
  /** Motivo del ERTE */
  motivoERTE: MotivoERTE;
  /** Salario bruto mensual del trabajador ANTES del ERTE (€) */
  salarioBrutoMensual: number;
  /** Base de cotización mensual por desempleo (€) — para calcular la prestación del SEPE */
  baseCotizacionDesempleo: number;
  /**
   * Porcentaje de reducción de jornada acordado (%).
   * Debe estar entre 10% y 70%.
   */
  pctReduccionJornada: number;
  /**
   * ¿Días del ERTE consumidos hasta ahora?
   * Importa para aplicar el 70% (primeros 180 días) o 50% (desde día 181).
   * Default: 0 (inicio del ERTE).
   */
  diasConsumidos?: number;
  /**
   * ¿Hay exoneración de cotizaciones SS para la empresa?
   * (Aplica en MECAS, ERTE sectorial o de fuerza mayor con autorización)
   */
  exoneracionCotizacionSS?: boolean;
}

export interface ResultadoERTEReduccion {
  /** Porcentaje de reducción de jornada (%) */
  pctReduccionJornada: number;
  /** Porcentaje de jornada mantenida (%) */
  pctJornadaMantenida: number;

  // Para el trabajador
  /** Salario por las horas trabajadas (%) */
  salarioHorasTrabajadasMensual: number;
  /** Base reguladora diaria para prestación SEPE (€) */
  baseReguladoraDiaria: number;
  /** Porcentaje de la prestación SEPE aplicable (%) */
  pctPrestacionSEPE: number;
  /** Prestación SEPE mensual por las horas no trabajadas (€) */
  prestacionSEPEMensual: number;
  /** **Ingreso total del trabajador durante el ERTE (€/mes)** */
  ingresoTotalTrabajadorMensual: number;
  /** Pérdida económica mensual del trabajador vs situación normal (€) */
  perdidaEconomicaMensual: number;

  // Para la empresa
  /** Coste salarial horas trabajadas (€/mes) */
  costeSalarialHorasTrabajadasMensual: number;
  /** Cuota SS empresa por horas trabajadas (€/mes) */
  cuotaSSEmpresaHorasTrabajadasMensual: number;
  /** Cuota SS empresa exonerada (€/mes) — 0 si no hay exoneración */
  cuotaSSEmpresaExoneradaMensual: number;
  /** **Coste total mensual para la empresa durante el ERTE (€)** */
  costeTotalEmpresaMensual: number;
  /** Ahorro mensual para la empresa vs coste normal (€) */
  ahorroEmpresaMensual: number;

  /** Advertencias */
  advertencias: string[];
  /** Fuente normativa */
  fuenteDatos: string;
}

// ─── Función principal ─────────────────────────────────────────────────────

export function calcularERTEReduccion(p: ParametrosERTEReduccion): ResultadoERTEReduccion {
  if (p.salarioBrutoMensual <= 0) throw new Error('El salario bruto mensual debe ser mayor que cero.');
  if (p.pctReduccionJornada < PCT_MIN_REDUCCION_JORNADA || p.pctReduccionJornada > PCT_MAX_REDUCCION_JORNADA) {
    throw new Error(`La reducción de jornada debe estar entre ${PCT_MIN_REDUCCION_JORNADA}% y ${PCT_MAX_REDUCCION_JORNADA}%.`);
  }

  const r = (n: number) => Math.round(n * 100) / 100;
  const advertencias: string[] = [];

  const pctJornadaMantenida = 100 - p.pctReduccionJornada;
  const diasConsumidos = p.diasConsumidos ?? 0;
  const exoneracion = p.exoneracionCotizacionSS ?? false;

  // ── Para el trabajador ────────────────────────────────────────────────────
  const salarioHorasTrabajadasMensual = r(p.salarioBrutoMensual * pctJornadaMantenida / 100);

  const baseReguladoraDiaria = r(p.baseCotizacionDesempleo / 30);
  const pctPrestacionSEPE = diasConsumidos < 180 ? PCT_PRESTACION_PRIMEROS_180_DIAS : PCT_PRESTACION_DESDE_DIA_181;
  const prestacionDiariaHorasNoTrabajadas = r(baseReguladoraDiaria * pctPrestacionSEPE / 100 * p.pctReduccionJornada / 100);
  const prestacionSEPEMensual = r(prestacionDiariaHorasNoTrabajadas * 30);

  const ingresoTotalTrabajadorMensual = r(salarioHorasTrabajadasMensual + prestacionSEPEMensual);
  const perdidaEconomicaMensual = r(p.salarioBrutoMensual - ingresoTotalTrabajadorMensual);

  // ── Para la empresa ───────────────────────────────────────────────────────
  const costeSalarialHorasTrabajadasMensual = salarioHorasTrabajadasMensual;
  const cuotaSSEmpresaHorasTrabajadasMensual = r(costeSalarialHorasTrabajadasMensual * TIPO_SS_EMPRESA_TRABAJO / 100);

  const cuotaSSEmpresaHorasNoTrabajadasMensual = r(
    p.salarioBrutoMensual * p.pctReduccionJornada / 100 * TIPO_SS_EMPRESA_TRABAJO / 100
  );
  const cuotaSSEmpresaExoneradaMensual = exoneracion ? cuotaSSEmpresaHorasNoTrabajadasMensual : 0;

  const costeTotalEmpresaMensual = r(
    costeSalarialHorasTrabajadasMensual +
    cuotaSSEmpresaHorasTrabajadasMensual +
    (exoneracion ? 0 : cuotaSSEmpresaHorasNoTrabajadasMensual)
  );

  const costeNormalEmpresaMensual = r(p.salarioBrutoMensual * (1 + TIPO_SS_EMPRESA_TRABAJO / 100));
  const ahorroEmpresaMensual = r(costeNormalEmpresaMensual - costeTotalEmpresaMensual);

  // ── Advertencias ──────────────────────────────────────────────────────────
  advertencias.push(`El trabajador en ERTE por reducción cobra: el salario proporcional a las horas trabajadas (pagado por la empresa) + la prestación del SEPE por las horas no trabajadas (${pctPrestacionSEPE}% de la base reguladora proporcional). La empresa NO abona el salario de las horas reducidas.`);
  advertencias.push('La prestación del SEPE durante el ERTE de reducción NO consume el contador de desempleo del trabajador (si el ERTE es por causas ETOP). El trabajador conserva íntegros sus derechos de prestación para el futuro.');
  if (!exoneracion) {
    advertencias.push('Sin exoneración de cotizaciones SS: la empresa sigue cotizando por las horas no trabajadas durante el ERTE. La exoneración requiere acuerdo en periodo de consultas + comunicación a la ITSS, o resolución de la autoridad laboral en caso de fuerza mayor.');
  } else {
    advertencias.push(`Con exoneración: la empresa está exonerada de pagar ${cuotaSSEmpresaExoneradaMensual.toLocaleString('es-ES', {minimumFractionDigits: 2})} €/mes en cotizaciones SS por las horas reducidas. El SEPE asume esa cotización.`);
  }
  if (p.motivoERTE === 'mecanismo_red') {
    advertencias.push('MECAS (Mecanismo RED Ley 32/2021): requiere activación previa por el Consejo de Ministros. En esta modalidad, la exoneración de cotizaciones puede ser del 60-80%. Las empresas que se acojan al MECAS deben mantener el empleo y realizar formación.');
  }

  return {
    pctReduccionJornada: p.pctReduccionJornada,
    pctJornadaMantenida,
    salarioHorasTrabajadasMensual,
    baseReguladoraDiaria,
    pctPrestacionSEPE,
    prestacionSEPEMensual,
    ingresoTotalTrabajadorMensual,
    perdidaEconomicaMensual,
    costeSalarialHorasTrabajadasMensual,
    cuotaSSEmpresaHorasTrabajadasMensual,
    cuotaSSEmpresaExoneradaMensual,
    costeTotalEmpresaMensual,
    ahorroEmpresaMensual,
    advertencias,
    fuenteDatos: 'ET art. 47 + LGSS arts. 267-270 + Ley 32/2021 (MECAS) — vigente 2025',
  };
}
