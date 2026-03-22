/**
 * Calculadora de Deducción por Vivienda Habitual — lógica pura sin React ni DOM
 * Usada por: MCP server (calcular_deduccion_vivienda)
 *
 * Calcula dos tipos de deducciones relacionadas con la vivienda:
 *
 * A) DEDUCCIÓN POR INVERSIÓN EN VIVIENDA HABITUAL (régimen transitorio pre-2013)
 *    - Solo para adquisiciones/rehabilitaciones con contrato anterior al 01/01/2013
 *    - 15% de las cantidades satisfechas (hipoteca, seguros, etc.)
 *    - Base máxima: 9.040 €/año
 *    - Deducción máxima: 1.356 €/año
 *    - No hay límite de años (se mantiene mientras se pague la hipoteca)
 *
 * B) REDUCCIÓN POR ALQUILER DE VIVIENDA HABITUAL (arrendador)
 *    - 60% de reducción sobre el rendimiento neto de alquiler de vivienda habitual
 *    - Solo si el arrendatario la usa como vivienda habitual (art. 23.2 LIRPF)
 *    - No aplica a alquiler turístico, de temporada o de locales
 *
 * Fuente: LIRPF DT 18ª (régimen transitorio) + art. 23.2 LIRPF
 * Verificado: 2025-01-15
 *
 * Encadenable con: calcular_hipoteca, calcular_irpf, calcular_devolucion_irpf
 */

import { FISCAL_IRPF_META } from '@/data/fiscal';

// ─── Tipos públicos ────────────────────────────────────────────────────────────

export type ModoDeduccionVivienda = 'inversion_pre2013' | 'alquiler_habitual';

export interface ParametrosDeduccionVivienda {
  /** Modo de cálculo */
  modo: ModoDeduccionVivienda;

  // ── Modo inversion_pre2013
  /** Fecha de adquisición/firma del contrato (YYYY-MM-DD). Requerido en modo inversion_pre2013. */
  fechaAdquisicion?: string;
  /** Cantidades pagadas durante el año por amortización de hipoteca (capital + intereses) (€) */
  cantidadesPagadasHipoteca?: number;
  /** Primas de seguro de vida vinculado a la hipoteca pagadas en el año (€). Por defecto 0. */
  seguroVidaHipoteca?: number;
  /** Primas de seguro de hogar pagadas en el año (€). Por defecto 0. */
  seguroHogar?: number;
  /** Otras cantidades satisfechas por la vivienda habitual en el año (€). Por defecto 0. */
  otrosGastosVivienda?: number;
  /** ¿Declaración conjunta con cónyuge? (la base máxima aplica individualmente) */
  declaracionConjunta?: boolean;

  // ── Modo alquiler_habitual
  /** Rendimiento neto del alquiler (ingresos - gastos deducibles) (€). Requerido en modo alquiler_habitual. */
  rendimientoNetoAlquiler?: number;
}

export interface ResultadoDeduccionVivienda {
  /** Modo usado */
  modo: ModoDeduccionVivienda;

  // Campos para inversion_pre2013
  /** ¿La adquisición es anterior al 01/01/2013? */
  cumpleFechaRequisito?: boolean;
  /** Total cantidades satisfechas en el año (€) */
  totalCantidadesSatisfechas?: number;
  /** Base de deducción (mínimo entre total satisfecho y 9.040€) (€) */
  baseDeduccion?: number;
  /** Base máxima anual (€) */
  baseMaxima?: number;
  /** Porcentaje de deducción (%) */
  porcentajeDeduccion?: number;
  /** Deducción estatal (€) */
  deduccionEstatal?: number;
  /** Deducción autonómica adicional estimada (varía por CCAA) (€) */
  deduccionAutonomicaEstimada?: number;
  /** Deducción total (€) */
  deduccionTotal?: number;

  // Campos para alquiler_habitual
  /** Rendimiento neto antes de reducción (€) */
  rendimientoNetoAntes?: number;
  /** Porcentaje de reducción aplicable (%) */
  porcentajeReduccion?: number;
  /** Reducción aplicada (€) */
  reduccionAplicada?: number;
  /** Rendimiento neto tras reducción (€) */
  rendimientoNetoTrasReduccion?: number;
  /** Ahorro fiscal estimado (al tipo marginal 30% orientativo) (€) */
  ahorroFiscalEstimado?: number;

  /** Advertencias importantes */
  advertencias: string[];
  /** Fuente normativa */
  fuenteDatos: string;
}

// ─── Función principal ─────────────────────────────────────────────────────────

const BASE_MAXIMA_DEDUCCION = 9040;   // €/año
const PCT_DEDUCCION_ESTATAL = 0.15;   // 15%
const PCT_REDUCCION_ALQUILER = 0.60;  // 60% rendimiento neto

export function calcularDeduccionVivienda(p: ParametrosDeduccionVivienda): ResultadoDeduccionVivienda {
  const r = (n: number) => Math.round(n * 100) / 100;

  if (p.modo === 'inversion_pre2013') {
    if (!p.fechaAdquisicion) throw new Error('Se requiere la fecha de adquisición para el modo inversión pre-2013.');

    const fechaAdq = new Date(p.fechaAdquisicion);
    const fechaCorte = new Date('2013-01-01');
    const cumpleFechaRequisito = fechaAdq < fechaCorte;

    const cantidadesHipoteca = p.cantidadesPagadasHipoteca ?? 0;
    const seguroVida = p.seguroVidaHipoteca ?? 0;
    const seguroHogar = p.seguroHogar ?? 0;
    const otros = p.otrosGastosVivienda ?? 0;
    const totalCantidades = r(cantidadesHipoteca + seguroVida + seguroHogar + otros);

    const baseDeduccion = r(Math.min(totalCantidades, BASE_MAXIMA_DEDUCCION));
    const deduccionEstatal = r(cumpleFechaRequisito ? baseDeduccion * PCT_DEDUCCION_ESTATAL : 0);
    // Autonómica: muchas CCAA tienen un porcentaje adicional (2-5%). Usamos 2% como mínimo general.
    const deduccionAutonomicaEstimada = cumpleFechaRequisito ? r(baseDeduccion * 0.02) : 0;
    const deduccionTotal = r(deduccionEstatal + deduccionAutonomicaEstimada);

    const advertencias: string[] = [];
    if (!cumpleFechaRequisito) {
      advertencias.push('La fecha de adquisición es posterior al 31/12/2012. No se aplica el régimen transitorio. Esta deducción quedó suprimida para adquisiciones desde 2013 (Ley 16/2012).');
    } else {
      advertencias.push('Régimen transitorio: solo aplica si en 2012 ya se aplicó esta deducción o se habían satisfecho cantidades por la vivienda (DT 18ª LIRPF).');
    }
    advertencias.push('La deducción autonómica varía por CCAA (la mayoría 2-5%). Consulta las deducciones específicas de tu comunidad.');
    advertencias.push('Las cantidades pagadas por el banco directamente (seguros vinculados) también computan si son requisito del préstamo.');

    return {
      modo: 'inversion_pre2013',
      cumpleFechaRequisito,
      totalCantidadesSatisfechas: totalCantidades,
      baseDeduccion,
      baseMaxima: BASE_MAXIMA_DEDUCCION,
      porcentajeDeduccion: 15,
      deduccionEstatal,
      deduccionAutonomicaEstimada,
      deduccionTotal,
      advertencias,
      fuenteDatos: `LIRPF Disposición Transitoria 18ª (régimen transitorio vivienda) — ${FISCAL_IRPF_META.fuente} — verificado ${FISCAL_IRPF_META.verificado}`,
    };
  }

  // Modo alquiler_habitual
  if (p.rendimientoNetoAlquiler === undefined) {
    throw new Error('Se requiere el rendimiento neto del alquiler para el modo alquiler_habitual.');
  }

  const rendimientoNeto = p.rendimientoNetoAlquiler;
  const porcentajeReduccion = 60;
  const reduccionAplicada = r(Math.max(0, rendimientoNeto) * PCT_REDUCCION_ALQUILER);
  const rendimientoNetoTrasReduccion = r(Math.max(0, rendimientoNeto - reduccionAplicada));
  // Ahorro fiscal estimado al tipo marginal medio del 30%
  const ahorroFiscalEstimado = r(reduccionAplicada * 0.30);

  const advertencias: string[] = [
    'La reducción del 60% solo aplica cuando el arrendatario destina la vivienda a su residencia habitual. No aplica a alquiler turístico, vacacional o de temporada.',
    'Desde la Ley 12/2023 (Ley de Vivienda), la reducción del 60% es el mínimo general. Puede llegarse al 90% si se alquila en zona tensionada rebajando el precio más de un 5% sobre el contrato anterior.',
    'Si el rendimiento neto es negativo, la reducción no amplía la pérdida — solo aplica sobre rendimientos positivos.',
    'El ahorro fiscal estimado usa un tipo marginal del 30% orientativo. El ahorro real depende de tu IRPF total.',
  ];

  return {
    modo: 'alquiler_habitual',
    rendimientoNetoAntes: r(rendimientoNeto),
    porcentajeReduccion,
    reduccionAplicada,
    rendimientoNetoTrasReduccion,
    ahorroFiscalEstimado,
    advertencias,
    fuenteDatos: `LIRPF art. 23.2 (reducción alquiler vivienda habitual) + Ley 12/2023 (Ley de Vivienda) — verificado ${FISCAL_IRPF_META.verificado}`,
  };
}
