/**
 * Calculadora de Reducción por Arrendamiento de Vivienda en IRPF — lógica pura
 * Usada por: MCP server (calcular_reduccion_arrendamiento_irpf)
 *
 * Calcula el rendimiento neto reducido del capital inmobiliario en alquiler
 * de vivienda habitual, aplicando los nuevos porcentajes de reducción
 * introducidos por la Ley 12/2023 (Ley de Vivienda).
 *
 * PORCENTAJES DE REDUCCIÓN (LIRPF art. 23.2 — redacción Ley 12/2023):
 *   Aplican a contratos de arrendamiento de vivienda firmados desde 01/01/2024:
 *
 *   A) 90%: zona de mercado residencial tensionado + nuevo contrato +
 *           reducción del precio de renta ≥5% respecto al contrato anterior
 *           del mismo inmueble en los últimos 5 años.
 *
 *   B) 70%: dos supuestos alternativos:
 *      B1) Zona tensionada + nuevo contrato + arrendatario persona física
 *          de entre 18 y 35 años
 *      B2) Vivienda cuya última rehabilitación haya concluido en los
 *          2 años anteriores a la firma del contrato.
 *
 *   C) 60%: zona de mercado residencial tensionado (sin cumplir A ni B).
 *
 *   D) 50%: resto de casos (vivienda fuera de zona tensionada, contratos
 *           posteriores a 2023 que no cumplan los requisitos anteriores).
 *
 * RÉGIMEN TRANSITORIO: Contratos firmados ANTES del 01/01/2024 → reducción 60%
 *   (art. transitorio Ley 12/2023). Aplica también a renovaciones y prórrogas
 *   de contratos anteriores a 2024 que no sean nuevos contratos.
 *
 * GASTOS DEDUCIBLES (LIRPF art. 23.1):
 *   - Intereses y demás gastos de financiación del inmueble
 *   - IBI, tasa de basuras
 *   - Comunidad de propietarios (gastos necesarios)
 *   - Seguro del inmueble
 *   - Reparación y conservación (no mejoras)
 *   - Amortización del inmueble: 3% del mayor de (VC construcción, precio compra × parte
 *     construcción). Límite: importe íntegro percibido.
 *   - Servicios y suministros (si los paga el arrendador)
 *   - Gastos de administración, vigilancia, portería
 *   - Saldos de dudoso cobro (si han pasado +6 meses en mora)
 *
 * Fuente: LIRPF art. 23 (Ley 12/2023) + RIRPF arts. 13-15 — vigente 2025
 * Verificado: 2025-01-15
 *
 * Encadenable con: calcular_irpf, calcular_rentabilidad_alquiler, calcular_itp_ccaa
 */

// ─── Constantes ────────────────────────────────────────────────────────────

const PCT_REDUCCION_90 = 90;
const PCT_REDUCCION_70 = 70;
const PCT_REDUCCION_60 = 60;
const PCT_REDUCCION_50 = 50;
const PCT_AMORTIZACION_INMUEBLE = 3; // % sobre el valor de construcción

// ─── Tipos públicos ────────────────────────────────────────────────────────

export type SituacionArrendamiento =
  | 'contrato_pre2024'           // Contrato firmado antes del 01/01/2024 → 60%
  | 'zona_tensionada_90pct'      // Zona tensionada + reducción renta ≥5% → 90%
  | 'zona_tensionada_70pct_joven'// Zona tensionada + arrendatario 18-35 años → 70%
  | 'rehabilitacion_reciente'    // Última rehab. concluida en últimos 2 años → 70%
  | 'zona_tensionada_general'    // Zona tensionada sin requisitos adicionales → 60%
  | 'fuera_zona_tensionada';     // Resto → 50%

export interface GastosArrendamiento {
  /** Intereses hipoteca y gastos financiación (€/año) */
  intereses?: number;
  /** IBI + tasa de basuras (€/año) */
  ibi?: number;
  /** Cuota de comunidad de propietarios (€/año) */
  comunidadPropietarios?: number;
  /** Seguro del inmueble (€/año) */
  seguro?: number;
  /** Gastos de reparación y conservación (€/año) — no mejoras */
  reparacionConservacion?: number;
  /** Amortización del inmueble calculada (€/año) — si ya la conoces */
  amortizacion?: number;
  /**
   * Valor catastral de construcción (€) — para calcular amortización si no se indica.
   * Alternativa: indicar amortizacion directamente.
   */
  valorCatastralConstruccion?: number;
  /** Otros gastos necesarios (administración, suministros si los paga el arrendador) (€/año) */
  otrosGastos?: number;
}

export interface ParametrosReduccionArrendamientoIRPF {
  /** Situación del contrato de arrendamiento */
  situacionArrendamiento: SituacionArrendamiento;
  /** Ingresos íntegros (alquiler bruto anual recibido) (€) */
  ingresosIntegros: number;
  /** Gastos deducibles del arrendamiento */
  gastos?: GastosArrendamiento;
  /** Tipo marginal IRPF del arrendador (%) — para calcular el ahorro fiscal */
  tipoMarginalIRPF?: number;
}

export interface ResultadoReduccionArrendamientoIRPF {
  /** Situación del arrendamiento */
  situacionArrendamiento: SituacionArrendamiento;
  /** Ingresos íntegros (€) */
  ingresosIntegros: number;

  // Gastos
  /** Amortización aplicada (€) */
  amortizacionAplicada: number;
  /** Total gastos deducibles (€) */
  totalGastosDeducibles: number;

  // Rendimiento
  /** Rendimiento neto previo a reducción (€) */
  rendimientoNetoPrevio: number;
  /** ¿El rendimiento neto es positivo? (la reducción solo aplica si es positivo) */
  esPositivo: boolean;
  /** Porcentaje de reducción aplicado (%) */
  pctReduccion: number;
  /** **Reducción aplicada (€)** */
  reduccionAplicada: number;
  /** **Rendimiento neto reducido (€) — base tributable en IRPF** */
  rendimientoNetoReducido: number;

  // Fiscalidad
  /** Ahorro fiscal estimado respecto al rendimiento previo (€) */
  ahorroFiscalEstimado: number;

  /** Advertencias */
  advertencias: string[];
  /** Fuente normativa */
  fuenteDatos: string;
}

// ─── Función principal ─────────────────────────────────────────────────────

export function calcularReduccionArrendamientoIRPF(
  p: ParametrosReduccionArrendamientoIRPF
): ResultadoReduccionArrendamientoIRPF {
  if (p.ingresosIntegros < 0) throw new Error('Los ingresos íntegros no pueden ser negativos.');

  const r = (n: number) => Math.round(n * 100) / 100;
  const advertencias: string[] = [];
  const gastos = p.gastos ?? {};
  const tipoMarginal = p.tipoMarginalIRPF ?? 30;

  // ── Calcular amortización ─────────────────────────────────────────────────
  let amortizacion = gastos.amortizacion ?? 0;
  if (amortizacion === 0 && gastos.valorCatastralConstruccion) {
    amortizacion = r(gastos.valorCatastralConstruccion * PCT_AMORTIZACION_INMUEBLE / 100);
    // Límite: no puede superar los ingresos íntegros
    amortizacion = Math.min(amortizacion, p.ingresosIntegros);
  }

  // ── Total gastos deducibles ───────────────────────────────────────────────
  const totalGastos = r(
    (gastos.intereses ?? 0) +
    (gastos.ibi ?? 0) +
    (gastos.comunidadPropietarios ?? 0) +
    (gastos.seguro ?? 0) +
    (gastos.reparacionConservacion ?? 0) +
    amortizacion +
    (gastos.otrosGastos ?? 0)
  );

  // Límite: los intereses + gastos financiación no pueden superar los rendimientos íntegros
  if ((gastos.intereses ?? 0) > p.ingresosIntegros) {
    advertencias.push('Los intereses y gastos de financiación superan los ingresos íntegros. Se ha aplicado el límite: la deducción de intereses se limita al importe de los rendimientos íntegros del inmueble (LIRPF art. 23.1.a).');
  }

  // ── Rendimiento neto previo ───────────────────────────────────────────────
  const rendimientoNetoPrevio = r(p.ingresosIntegros - totalGastos);
  const esPositivo = rendimientoNetoPrevio > 0;

  // ── Porcentaje de reducción ───────────────────────────────────────────────
  let pctReduccion: number;
  switch (p.situacionArrendamiento) {
    case 'zona_tensionada_90pct':
      pctReduccion = PCT_REDUCCION_90;
      break;
    case 'zona_tensionada_70pct_joven':
    case 'rehabilitacion_reciente':
      pctReduccion = PCT_REDUCCION_70;
      break;
    case 'contrato_pre2024':
    case 'zona_tensionada_general':
      pctReduccion = PCT_REDUCCION_60;
      break;
    case 'fuera_zona_tensionada':
    default:
      pctReduccion = PCT_REDUCCION_50;
  }

  // La reducción solo aplica sobre rendimiento neto POSITIVO
  const reduccionAplicada = esPositivo ? r(rendimientoNetoPrevio * pctReduccion / 100) : 0;
  const rendimientoNetoReducido = r(rendimientoNetoPrevio - reduccionAplicada);

  const ahorroFiscalEstimado = esPositivo
    ? r(reduccionAplicada * tipoMarginal / 100)
    : 0;

  // ── Advertencias ──────────────────────────────────────────────────────────
  if (p.situacionArrendamiento === 'zona_tensionada_90pct') {
    advertencias.push('Reducción del 90%: requiere que la vivienda esté en zona de mercado residencial tensionado declarada + nuevo contrato + renta reducida ≥5% vs. contrato anterior del mismo inmueble en los últimos 5 años. Conserve documentación acreditativa.');
  }
  if (p.situacionArrendamiento === 'zona_tensionada_70pct_joven') {
    advertencias.push('Reducción del 70% por joven: el arrendatario debe tener entre 18 y 35 años en la fecha de firma del contrato, y la vivienda debe estar en zona tensionada declarada. El arrendador debe conservar copia del DNI/NIE del arrendatario que acredite la edad.');
  }
  if (p.situacionArrendamiento === 'rehabilitacion_reciente') {
    advertencias.push('Reducción del 70% por rehabilitación: las obras de rehabilitación deben haber concluido en los 2 años anteriores a la fecha del contrato de arrendamiento. Conserve facturas y certificado de fin de obra.');
  }
  advertencias.push('La reducción se aplica sobre el rendimiento neto POSITIVO. Si el rendimiento neto es negativo (gastos > ingresos), no se aplica reducción y la pérdida se compensa con otros rendimientos del capital inmobiliario del ejercicio o de los 4 siguientes.');
  advertencias.push('La reducción solo aplica al arrendamiento de VIVIENDA HABITUAL del arrendatario. No aplica a locales, oficinas, garajes, trasteros, viviendas turísticas ni arrendamientos de temporada (LIRPF art. 23.2).');
  if (!gastos.amortizacion && !gastos.valorCatastralConstruccion) {
    advertencias.push('No se ha calculado la amortización del inmueble. Es deducible el 3% del mayor entre el valor catastral de construcción y el precio de adquisición (parte construcción). Incluya este gasto para optimizar la tributación.');
  }

  return {
    situacionArrendamiento: p.situacionArrendamiento,
    ingresosIntegros: r(p.ingresosIntegros),
    amortizacionAplicada: amortizacion,
    totalGastosDeducibles: totalGastos,
    rendimientoNetoPrevio,
    esPositivo,
    pctReduccion,
    reduccionAplicada,
    rendimientoNetoReducido,
    ahorroFiscalEstimado,
    advertencias,
    fuenteDatos: 'LIRPF art. 23 (redacción Ley 12/2023) + RIRPF arts. 13-15 — vigente 2025',
  };
}
