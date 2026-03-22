/**
 * Calculadora de Prestación por Cese de Actividad (Paro de Autónomos)
 * Lógica pura sin React ni DOM
 * Usada por: MCP server (calcular_cese_actividad_autonomo)
 *
 * Calcula la prestación por cese de actividad (LGSS arts. 327-339),
 * el equivalente al desempleo para trabajadores autónomos.
 *
 * Requisitos básicos (art. 330 LGSS):
 * - Estar afiliado y en alta en RETA o SETA
 * - Tener cubierto el período mínimo de cotización por cese (12 meses continuados)
 * - No haber cumplido la edad de jubilación ordinaria
 * - Suscribir el compromiso de actividad
 * - Situación legal de cese (causas: económicas, técnicas, productivas u organizativas,
 *   fuerza mayor, pérdida de licencia, violencia de género...)
 *
 * Duración (art. 338 LGSS): 2 meses por cada año cotizado, máximo 24 meses.
 * Cuantía: 70% de la base reguladora (media últimas 12 bases de cotización).
 *
 * Fuente: LGSS art. 327-339 — Real Decreto Legislativo 8/2015
 * Verificado: 2025-01-15
 *
 * Encadenable con: calcular_cuota_autonomo, calcular_pension_desempleo, calcular_baja_medica
 */

import { FISCAL_AUTONOMOS_META } from '@/data/fiscal';

// ─── Constantes ────────────────────────────────────────────────────────────────

const PCT_PRESTACION = 0.70;        // 70% de la base reguladora
const MESES_POR_ANO_COTIZADO = 2;   // 2 meses de prestación por año cotizado
const MAX_MESES_PRESTACION = 24;    // máximo 24 meses
const MIN_MESES_COTIZACION = 12;    // mínimo 12 meses cotizados para acceder

// ─── Tipos públicos ────────────────────────────────────────────────────────────

export type CausaCese =
  | 'economica_tecnica'      // causas económicas, técnicas, productivas u organizativas
  | 'fuerza_mayor'           // fuerza mayor
  | 'perdida_licencia'       // pérdida de licencia administrativa
  | 'violencia_genero'       // violencia de género
  | 'divorcio_separacion'    // divorcio/separación en autónomo colaborador
  | 'deudas_insolvencia';    // declaración de concurso de acreedores con imposibilidad de continuar

export interface ParametrosCeseActividad {
  /** Meses cotizados continuados por cese de actividad inmediatamente antes del cese */
  mesesCotizados: number;
  /** Base de cotización mensual media de los últimos 12 meses (€) */
  baseCotizacionMedia: number;
  /** Causa del cese. Afecta a la elegibilidad y duración en casos especiales. */
  causaCese?: CausaCese;
  /** Edad del autónomo. Si ha cumplido la edad de jubilación ordinaria (67 años), no accede. */
  edad?: number;
  /** ¿Tiene trabajadores a cargo? (el cese colectivo da acceso incluso sin 12 meses) */
  tieneEmpleados?: boolean;
}

export interface ResultadoCeseActividad {
  /** ¿Cumple los requisitos de acceso? */
  tieneAcceso: boolean;
  /** Razón de denegación (si no tiene acceso) */
  razonDenegacion?: string;
  /** Meses cotizados */
  mesesCotizados: number;
  /** Base reguladora mensual (media últimas 12 bases) (€) */
  baseReguladora: number;
  /** Cuantía mensual bruta de la prestación (€) */
  cuantiaMensualBruta: number;
  /** Retención IRPF estimada (la prestación tributa como rendimiento del trabajo) */
  retencionIRPFEstimada: number;
  /** Cuantía mensual neta estimada (€) */
  cuantiaMensualNeta: number;
  /** Duración de la prestación (meses) */
  duracionMeses: number;
  /** Total bruto de la prestación (€) */
  totalBrutoPrestacion: number;
  /** Tabla de duración según meses cotizados */
  tablaDuracion: { mesesCotizados: string; duracion: string }[];
  /** ¿Sigue cotizando durante la prestación? */
  sigueCotizandoSS: boolean;
  /** Advertencias importantes */
  advertencias: string[];
  /** Fuente normativa */
  fuenteDatos: string;
}

// ─── Función principal ─────────────────────────────────────────────────────────

export function calcularCeseActividadAutonomo(p: ParametrosCeseActividad): ResultadoCeseActividad {
  if (p.mesesCotizados < 0) throw new Error('Los meses cotizados no pueden ser negativos.');
  if (p.baseCotizacionMedia <= 0) throw new Error('La base de cotización media debe ser mayor que cero.');

  const r = (n: number) => Math.round(n * 100) / 100;

  const edad = p.edad ?? 45;
  const advertencias: string[] = [];

  // Verificar requisitos
  let tieneAcceso = true;
  let razonDenegacion: string | undefined;

  if (edad >= 67) {
    tieneAcceso = false;
    razonDenegacion = 'Ha alcanzado la edad ordinaria de jubilación (67 años). No puede acceder a la prestación por cese de actividad.';
  } else if (p.mesesCotizados < MIN_MESES_COTIZACION) {
    tieneAcceso = false;
    razonDenegacion = `No cumple el período mínimo de cotización: se necesitan ${MIN_MESES_COTIZACION} meses cotizados y tiene ${p.mesesCotizados}. Faltan ${MIN_MESES_COTIZACION - p.mesesCotizados} meses.`;
  }

  // Cálculo de duración (2 meses por cada año, máx 24)
  const anosCompletosConvertibles = Math.floor(p.mesesCotizados / 12);
  const duracionMeses = Math.min(
    anosCompletosConvertibles * MESES_POR_ANO_COTIZADO,
    MAX_MESES_PRESTACION
  );

  // Cuantías
  const baseReguladora = r(p.baseCotizacionMedia);
  const cuantiaMensualBruta = r(baseReguladora * PCT_PRESTACION);

  // Retención IRPF estimada (15% para rentas entre 12.000-20.000€ anuales aprox)
  const cuantiaAnual = cuantiaMensualBruta * 12;
  let retencionPct = 0;
  if (cuantiaAnual > 20000) retencionPct = 15;
  else if (cuantiaAnual > 12000) retencionPct = 10;
  else if (cuantiaAnual > 7000) retencionPct = 7;
  const retencionIRPFEstimada = r(cuantiaMensualBruta * retencionPct / 100);
  const cuantiaMensualNeta = r(cuantiaMensualBruta - retencionIRPFEstimada);

  const totalBrutoPrestacion = r(cuantiaMensualBruta * duracionMeses);

  // Advertencias
  if (p.causaCese === 'economica_tecnica') {
    advertencias.push('Para causas económicas, técnicas o productivas se requiere que la Seguridad Social reconozca la situación legal de cese. Puede requerir documentación acreditativa.');
  }
  advertencias.push('La prestación tributa como rendimiento del trabajo en el IRPF. La retención indicada es orientativa.');
  advertencias.push('Durante el cobro de la prestación, la cotización a la SS se suspende (salvo cese parcial). Al reemprender, puede solicitarse el reingreso en RETA.');
  if (p.tieneEmpleados) {
    advertencias.push('Si tiene empleados a cargo, el cese de la actividad puede estar condicionado a la extinción de los contratos de trabajo o al traspaso de la empresa.');
  }

  // Tabla orientativa
  const tablaDuracion = [
    { mesesCotizados: '12-17 meses', duracion: '2 meses' },
    { mesesCotizados: '18-23 meses', duracion: '4 meses' },
    { mesesCotizados: '24-35 meses', duracion: '6 meses' },
    { mesesCotizados: '36-47 meses', duracion: '8 meses' },
    { mesesCotizados: '48-59 meses', duracion: '10 meses' },
    { mesesCotizados: '60-71 meses', duracion: '12 meses' },
    { mesesCotizados: '72-83 meses', duracion: '14 meses' },
    { mesesCotizados: '84-95 meses', duracion: '16 meses' },
    { mesesCotizados: '96-107 meses', duracion: '18 meses' },
    { mesesCotizados: '108-119 meses', duracion: '20 meses' },
    { mesesCotizados: '120-131 meses', duracion: '22 meses' },
    { mesesCotizados: '≥ 132 meses (11 años)', duracion: '24 meses (máximo)' },
  ];

  return {
    tieneAcceso,
    razonDenegacion,
    mesesCotizados: p.mesesCotizados,
    baseReguladora,
    cuantiaMensualBruta,
    retencionIRPFEstimada,
    cuantiaMensualNeta,
    duracionMeses: tieneAcceso ? duracionMeses : 0,
    totalBrutoPrestacion: tieneAcceso ? totalBrutoPrestacion : 0,
    tablaDuracion,
    sigueCotizandoSS: false,
    advertencias,
    fuenteDatos: `LGSS art. 327-339 (RDL 8/2015) + ${FISCAL_AUTONOMOS_META.fuente} — verificado ${FISCAL_AUTONOMOS_META.verificado}`,
  };
}
