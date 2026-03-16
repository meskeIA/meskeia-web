/**
 * Datos Seguridad Social: Pensión pública de jubilación
 *
 * ⚠️ HERRAMIENTA DE ORIENTACIÓN — No constituye asesoramiento previsional.
 * Datos verificados a la fecha indicada. El sistema de pensiones puede
 * cambiar con cada reforma legislativa. Verifica siempre en la SS.
 *
 * Fuente: LGSS (RDL 8/2015) + Ley 21/2021 (reforma pensiones) + LPGE 2025
 * Verificado: 2025-01-15
 * URL oficial SS: https://www.seg-social.es/wps/portal/wss/internet/Pensionistas
 * Simulador oficial: https://portal.seg-social.gob.es/wps/portal/importass/importass/Categorias/vidaLaboral-y-pensiones/simuladorPensionJubilacion
 */

export const FISCAL_PENSIONES_META = {
  fuente: 'LGSS (RDL 8/2015) + Ley 21/2021 de Reforma de Pensiones + LPGE 2025',
  verificado: '2025-01-15',
  vigencia: '2025',
  urlOficial: 'https://www.seg-social.es/wps/portal/wss/internet/Pensionistas',
  nota: 'Las cifras son orientativas. La SS calcula la pensión real a partir de tu historial completo de cotización. Consulta tu vida laboral en la Sede Electrónica de la SS.',
};

// ─── Edad de jubilación ordinaria 2025 ───────────────────────────────────────

export const EDAD_JUBILACION_2025 = {
  // Con menos de 37 años y 3 meses cotizados
  edadOrdinariaMesesShort: 66 * 12 + 6, // 66 años y 6 meses
  // Con 37 años y 3 meses o más cotizados
  edadOrdinariaMesesLong: 65 * 12,       // 65 años
  // Años cotizados que dan acceso a jubilación a los 65
  mesesCotizadosParaJubilacion65: 37 * 12 + 3, // 447 meses
};

// ─── Años mínimos de cotización ───────────────────────────────────────────────

export const COTIZACION_MINIMA = {
  anosMinimosAcceso: 15,       // Años mínimos para tener pensión
  mesesMinimosAcceso: 180,
  anosParaCien: 36.75,         // Años para alcanzar el 100% en 2025 (transitorio)
  mesesParaCien: 441,          // 36 años y 9 meses (transitorio 2025)
};

// ─── Porcentaje de pensión según años cotizados ────────────────────────────

/**
 * Sistema de tramos para calcular el % de pensión (Ley 21/2021, transitorio 2025)
 * - Primeros 15 años (180 meses): 50%
 * - Meses 181 a 276 (hasta ~23 años): +0.21% por mes adicional
 * - Meses 277 en adelante (hasta cap): +0.19% por mes adicional
 * - Máximo: 100%
 */
export interface TramosPorcentajePension {
  mesesDesde: number;
  mesesHasta: number;
  porcentajeBase: number;       // % acumulado al inicio del tramo
  incrementoPorMes: number;     // % adicional por cada mes extra
}

export const TRAMOS_PORCENTAJE_PENSION_2025: TramosPorcentajePension[] = [
  { mesesDesde: 180, mesesHasta: 180,  porcentajeBase: 50,    incrementoPorMes: 0 },
  { mesesDesde: 181, mesesHasta: 276,  porcentajeBase: 50,    incrementoPorMes: 0.21 },
  { mesesDesde: 277, mesesHasta: 9999, porcentajeBase: 70.16, incrementoPorMes: 0.19 },
];

// ─── Límites de pensión 2025 (euros/mes, 14 pagas) ───────────────────────────

export const LIMITES_PENSION_2025 = {
  maximaMensual:   3267.60,  // Pensión máxima mensual 2025
  maximaAnual:     45746.40, // Pensión máxima anual (× 14 pagas)
  minimaConConyuge:  967.40, // Mínima ≥65 con cónyuge a cargo
  minimaSinConyuge:  784.20, // Mínima ≥65 sin cónyuge
  minimaSolo:        784.20,
};

// ─── Base Reguladora ──────────────────────────────────────────────────────────

/**
 * La base reguladora (BR) es el promedio de las 300 últimas bases de cotización
 * dividido entre 350 (para compensar lagunas de cotización).
 * BR = Σ(últimas 300 bases mensuales) / 350
 *
 * Simplificación orientativa: BR ≈ base_media_mensual × (300 / 350)
 * Factor: 300/350 ≈ 0.8571
 */
export const BASE_REGULADORA = {
  mesesConsiderados: 300,  // Últimos 25 años
  divisor: 350,            // Incluye compensación de lagunas
  factor: 300 / 350,       // ≈ 0.8571
};

// ─── Jubilación anticipada: coeficientes reductores 2025 ─────────────────────

/**
 * Coeficientes reductores por trimestre de anticipación respecto a edad ordinaria.
 * Distintos según sea voluntaria (a iniciativa del trabajador) o involuntaria
 * (despido colectivo, ERTE, cierre empresa u otras causas ajenas).
 *
 * Fuente: Ley 21/2021 + LGSS art. 207 y 208
 */

export interface CoeficienteReductor {
  trimestreDesde: number;  // Trimestre inicial del tramo (inclusive)
  trimestreHasta: number;  // Trimestre final del tramo (inclusive)
  reduccionPorTrimestre: number; // % de reducción por cada trimestre de antelación
}

// Jubilación INVOLUNTARIA (causa no imputable al trabajador)
// Requisito: ≥ 33 años cotizados, hasta 4 años antes de la edad ordinaria
export const COEFICIENTES_ANTICIPADA_INVOLUNTARIA_2025: CoeficienteReductor[] = [
  { trimestreDesde: 1,  trimestreHasta: 4,  reduccionPorTrimestre: 1.56 },
  { trimestreDesde: 5,  trimestreHasta: 8,  reduccionPorTrimestre: 1.44 },
  { trimestreDesde: 9,  trimestreHasta: 12, reduccionPorTrimestre: 1.32 },
  { trimestreDesde: 13, trimestreHasta: 16, reduccionPorTrimestre: 1.20 },
];

export const REQUISITOS_ANTICIPADA_INVOLUNTARIA = {
  anosMinimoCotizados: 33,
  maxMesesAnticipacion: 48, // hasta 4 años antes
};

// Jubilación VOLUNTARIA (a iniciativa del propio trabajador)
// Requisito: ≥ 35 años cotizados, hasta 2 años antes de la edad ordinaria
export const COEFICIENTES_ANTICIPADA_VOLUNTARIA_2025: CoeficienteReductor[] = [
  { trimestreDesde: 1, trimestreHasta: 4, reduccionPorTrimestre: 2.04 },
  { trimestreDesde: 5, trimestreHasta: 8, reduccionPorTrimestre: 1.92 },
];

export const REQUISITOS_ANTICIPADA_VOLUNTARIA = {
  anosMinimoCotizados: 35,
  maxMesesAnticipacion: 24, // hasta 2 años antes
};

// ─── Plan de Pensiones: límites fiscales 2025 ────────────────────────────────

export const FISCAL_PLAN_PENSIONES_META = {
  fuente: 'Ley 35/2006 IRPF art. 51 + LPGE 2025',
  verificado: '2025-01-15',
  vigencia: '2025',
  urlOficial: 'https://sede.agenciatributaria.gob.es',
  nota: 'Límites orientativos 2025. Consulta con tu entidad gestora o asesor fiscal.',
};

export const LIMITES_PLAN_PENSIONES_2025 = {
  limiteIndividualAnual:    1500,  // €/año (solo aportación del trabajador)
  limiteEmpresaAnual:       8500,  // €/año adicional si incluye contribución empresarial
  limiteTotalAnual:        10000,  // €/año suma individual + empresa
  limiteDiscapacidadAnual: 24250,  // Para personas con discapacidad ≥ 33%
};

// ─── Jubilación Parcial: requisitos 2025 ─────────────────────────────────────

export const JUBILACION_PARCIAL_META = {
  fuente: 'LGSS (RDL 8/2015) arts. 215 y 216 + Ley 21/2021',
  verificado: '2025-01-15',
  vigencia: '2025',
  urlOficial: 'https://www.seg-social.es/wps/portal/wss/internet/Pensionistas/Jubilacion',
  nota: 'Requisitos orientativos del régimen general. Existen supuestos especiales por convenio colectivo o sector. Verifica siempre en la SS.',
};

export const REQUISITOS_JUBILACION_PARCIAL = {
  edadMinima:              60,     // Años cumplidos (régimen general con contrato de relevo)
  anosCotizadosMinimos:    33,     // Años cotizados mínimos (con contrato de relevo)
  reduccionJornadaMin:     25,     // % mínimo de reducción de jornada
  reduccionJornadaMax:     75,     // % máximo de reducción (normal; 85% casos especiales)
  exigeContratoRelevo:     true,   // El empleador debe contratar un relevista simultáneamente
};
