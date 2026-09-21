/**
 * Calculadora de Pensión Pública de Jubilación — lógica pura sin React ni DOM
 * Usada por: MCP server (calcular_pension_publica)
 *
 * Basado en la fórmula de la Seguridad Social (LGSS RDL 8/2015 + Ley 21/2021).
 * Resultado ORIENTATIVO — la SS calcula la pensión real a partir del historial
 * completo de cotización. Siempre consultar la vida laboral oficial.
 *
 * Fuente: data/fiscal/pensiones.ts
 */

import {
  TRAMOS_PORCENTAJE_PENSION_2025,
  BASE_REGULADORA,
  COTIZACION_MINIMA,
  LIMITES_PENSION_2025,
  getEdadJubilacion,
  getSistemaDualParams,
  FISCAL_PENSIONES_META,
} from '@/data/fiscal';

// ─── Tipos públicos ────────────────────────────────────────────────────────────

export interface ParametrosPensionPublica {
  /**
   * Base de cotización media mensual estimada (últimos 25 años).
   * Si no se conoce, usar el salario bruto mensual actual como aproximación.
   */
  baseCotizacionMensual: number;
  /** Años cotizados totales a la Seguridad Social */
  anosCotizados: number;
  /** Edad actual del trabajador (para informar sobre edad de jubilación) */
  edadActual?: number;
}

export interface ResultadoPensionPublica {
  /** Base reguladora de la fórmula aplicada (clásica o ampliada/dual) */
  baseReguladora: number;
  /** Base reguladora con la fórmula clásica (media de últimas 300 bases / 350) */
  baseReguladoraClasica: number;
  /** Base reguladora con el sistema dual/ampliado (DT 40.a LGSS, vigente desde 2026) */
  baseReguladoraDual: number;
  /** Porcentaje de pensión aplicado según años cotizados (0–100%) */
  porcentajePension: number;
  /** Pensión bruta estimada antes de aplicar límites (fórmula aplicada) */
  pensionBrutaSinLimites: number;
  /** Pensión bruta mensual real (aplicando mínimos y máximo SS, fórmula aplicada) */
  pensionBrutaMensual: number;
  /** Pensión bruta anual (× 14 pagas, fórmula aplicada) */
  pensionBrutaAnual: number;
  /** Pensión mensual con la fórmula clásica (25 años / 350), con límites aplicados */
  pensionClasicaMensual: number;
  /** Pensión mensual con el sistema dual/ampliado, con límites aplicados */
  pensionDualMensual: number;
  /** Fórmula que resulta más favorable y que aplicaría de oficio la SS */
  formulaAplicada: 'clasica' | 'dual';
  /** Años cotizados introducidos */
  anosCotizados: number;
  /**
   * La pensión calculada queda POR DEBAJO de la mínima de referencia. NO significa que
   * se eleve automáticamente: el complemento a mínimos exige no superar unos límites de
   * renta y su cuantía depende de la situación familiar (COMPLEMENTO_MINIMOS_LIMITES_2026).
   */
  aplicaMinimo: boolean;
  /** Indica si se aplica pensión máxima (base calculada superior al máximo) */
  aplicaMaximo: boolean;
  /** Pensión mínima de referencia 2026 (sin cónyuge a cargo), a título informativo */
  pensionMinimaRef: number;
  /** Pensión máxima SS 2026 */
  pensionMaxima: number;
  /** Edad ordinaria de jubilación estimada según cotización */
  edadJubilacionOrdinaria: string;
  /** Meses adicionales necesarios para alcanzar el 100% */
  mesesParaCien: number;
  /** Nota sobre limitaciones del cálculo */
  nota: string;
  /** Fuente y fecha de verificación */
  fuenteDatos: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Porcentaje de la base reguladora que corresponde a `mesesCotizados`, según la escala
 * de la DT 9.ª LGSS (TRAMOS_PORCENTAJE_PENSION_2025).
 *
 * Se exporta desde el 21/09/2026 (hallazgo 1093 del Inspector) porque
 * `simulador-jubilacion-publica` mantenía su propia copia y esa copia contaba un mes
 * corto en cada tramo: el mismo perfil obtenía aquí y allí porcentajes distintos.
 */
export function calcularPorcentajePension(mesesCotizados: number): number {
  if (mesesCotizados < COTIZACION_MINIMA.mesesMinimosAcceso) return 0;

  let porcentaje = 0;
  for (const tramo of TRAMOS_PORCENTAJE_PENSION_2025) {
    if (mesesCotizados <= tramo.mesesHasta) {
      porcentaje = tramo.porcentajeBase + (mesesCotizados - tramo.mesesDesde + 1) * tramo.incrementoPorMes;
      break;
    }
    // Si supera todos los tramos, el último tramo calcula hasta el tope
    porcentaje = tramo.porcentajeBase + (mesesCotizados - tramo.mesesDesde + 1) * tramo.incrementoPorMes;
  }

  return Math.min(100, Math.max(0, Math.round(porcentaje * 100) / 100));
}

// ─── Función principal ─────────────────────────────────────────────────────────

export function calcularPensionPublica(p: ParametrosPensionPublica): ResultadoPensionPublica {
  if (p.baseCotizacionMensual <= 0) {
    throw new Error('La base de cotización mensual debe ser mayor que cero.');
  }
  if (p.anosCotizados < 0 || p.anosCotizados > 50) {
    throw new Error('Los años cotizados deben estar entre 0 y 50.');
  }

  const r = (n: number) => Math.round(n * 100) / 100;
  const mesesCotizados = Math.round(p.anosCotizados * 12);

  // 1. Base reguladora clásica: promedio de las 300 últimas bases / 350
  //    Simplificación: BR = baseMensual × (300/350)
  const baseReguladoraClasica = r(p.baseCotizacionMensual * BASE_REGULADORA.factor);

  // 1b. Base reguladora con el sistema dual/ampliado (DT 40.a LGSS, vigente desde 2026).
  //     La SS calcula ambas fórmulas y aplica de oficio la más favorable.
  const dualParams = getSistemaDualParams(new Date().getFullYear());
  const baseReguladoraDual = r(p.baseCotizacionMensual * (dualParams.basesSeleccionadas / dualParams.divisor));

  // 2. Porcentaje por años cotizados (igual para ambas fórmulas)
  const porcentajePension = calcularPorcentajePension(mesesCotizados);

  // 3. Pensión bruta sin límites de cada fórmula
  const pensionClasicaSinLimites = r(baseReguladoraClasica * (porcentajePension / 100));
  const pensionDualSinLimites = r(baseReguladoraDual * (porcentajePension / 100));

  // 4. Aplicar mínimos y máximo a cada fórmula
  const pensionMinima = LIMITES_PENSION_2025.minimaSinConyuge; // referencia sin cónyuge a cargo
  const pensionMaxima = LIMITES_PENSION_2025.maximaMensual;

  // ⚠️ 2026-09-21 (hallazgo 1089 del Inspector): aquí se elevaba al mínimo CUALQUIER
  //    pensión menor, sin condición alguna. El complemento a mínimos no es automático —
  //    exige rentas por debajo de COMPLEMENTO_MINIMOS_LIMITES_2026 y tiene tres cuantías
  //    según la situación familiar, nada de lo cual se pregunta aquí—, así que elevar de
  //    oficio publicaba una pensión POR ENCIMA de su propia base reguladora. Solo se
  //    aplica el tope máximo, que ese sí es incondicional (art. 57 LGSS).
  const aplicarLimites = (bruta: number): number => Math.min(pensionMaxima, bruta);

  const pensionClasicaMensual = r(aplicarLimites(pensionClasicaSinLimites));
  const pensionDualMensual = r(aplicarLimites(pensionDualSinLimites));

  // 5. La SS aplica de oficio la fórmula más favorable
  const formulaAplicada: 'clasica' | 'dual' = pensionDualMensual > pensionClasicaMensual ? 'dual' : 'clasica';
  const baseReguladora = formulaAplicada === 'dual' ? baseReguladoraDual : baseReguladoraClasica;
  const pensionBrutaSinLimites = formulaAplicada === 'dual' ? pensionDualSinLimites : pensionClasicaSinLimites;
  const pensionBrutaMensual = formulaAplicada === 'dual' ? pensionDualMensual : pensionClasicaMensual;
  const aplicaMinimo = mesesCotizados >= COTIZACION_MINIMA.mesesMinimosAcceso && pensionBrutaSinLimites < pensionMinima;
  const aplicaMaximo = pensionBrutaSinLimites > pensionMaxima;

  // 6. Edad de jubilación ordinaria (tabla progresiva del año en curso)
  const edadJub = getEdadJubilacion(new Date().getFullYear());
  const cotizacionPara65 = edadJub.cotizacionPara65;
  const mesesParaJubilacion65 = cotizacionPara65.anios * 12 + cotizacionPara65.meses;
  const formatEdad = (e: { anios: number; meses: number }) =>
    e.meses > 0 ? `${e.anios} años y ${e.meses} meses` : `${e.anios} años`;
  const edadJubilacionOrdinaria = mesesCotizados >= mesesParaJubilacion65
    ? `65 años (tienes ≥ ${formatEdad(cotizacionPara65)} cotizados)`
    : `${formatEdad(edadJub.edadSinCotizacion)} (necesitas ≥ ${formatEdad(cotizacionPara65)} cotizados para jubilarte a los 65)`;

  // 7. Meses adicionales para alcanzar el 100%
  const mesesParaCien = Math.max(0, COTIZACION_MINIMA.mesesParaCien - mesesCotizados);

  return {
    baseReguladora,
    baseReguladoraClasica,
    baseReguladoraDual,
    porcentajePension,
    pensionBrutaSinLimites,
    pensionBrutaMensual,
    pensionBrutaAnual:    r(pensionBrutaMensual * 14),
    pensionClasicaMensual,
    pensionDualMensual,
    formulaAplicada,
    anosCotizados:        p.anosCotizados,
    aplicaMinimo,
    aplicaMaximo,
    pensionMinimaRef:     pensionMinima,
    pensionMaxima,
    edadJubilacionOrdinaria,
    mesesParaCien,
    nota: mesesCotizados < COTIZACION_MINIMA.mesesMinimosAcceso
      ? `⚠️ Con ${p.anosCotizados} años cotizados no se alcanza el mínimo de ${COTIZACION_MINIMA.anosMinimosAcceso} años para tener pensión contributiva. ${FISCAL_PENSIONES_META.nota}`
      : FISCAL_PENSIONES_META.nota,
    fuenteDatos: `${FISCAL_PENSIONES_META.fuente} — verificado ${FISCAL_PENSIONES_META.verificado}`,
  };
}
