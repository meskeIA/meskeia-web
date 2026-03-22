/**
 * Calculadora de Moratoria / Carencia Hipotecaria — lógica pura sin React ni DOM
 * Usada por: MCP server (calcular_moratoria_hipoteca)
 *
 * Calcula el impacto financiero de aplicar un período de carencia (moratoria)
 * en un préstamo hipotecario: qué se paga durante la carencia, cómo queda la
 * cuota posterior y el coste total adicional que genera.
 *
 * Tipos de carencia:
 *
 * A) CARENCIA TOTAL (de capital e intereses):
 *    - Durante el período de carencia no se paga nada (cuota = 0)
 *    - Los intereses devengados se capitalizan (se suman al capital pendiente)
 *    - Es la modalidad más beneficiosa a corto plazo pero más cara a largo
 *    - Prevista en algunos códigos de buenas prácticas bancarias
 *
 * B) CARENCIA PARCIAL (solo de capital):
 *    - Durante el período de carencia solo se pagan intereses (sin amortizar capital)
 *    - La cuota durante la carencia = capital pendiente × (TIN mensual)
 *    - El capital pendiente no crece pero tampoco se amortiza
 *    - Es la modalidad más habitual en renegociaciones hipotecarias
 *
 * Normativa aplicable:
 *   - Ley 5/2019 (LCCI) — Reguladora de los contratos de crédito inmobiliario
 *   - Código de Buenas Prácticas Bancarias (RD-ley 6/2012, actualizado RD-ley 19/2022)
 *   - Para deudores vulnerables: posible moratoria sin coste de novación
 *   - Hipotecas a tipo variable: posible conversión a fijo como alternativa
 *
 * Fuente: Ley 5/2019 + RD-ley 6/2012 + RD-ley 19/2022 — vigente 2025
 * Verificado: 2025-01-15
 *
 * Encadenable con: calcular_hipoteca, calcular_amortizacion_anticipada, calcular_penalizacion_hipoteca
 */

// ─── Tipos públicos ────────────────────────────────────────────────────────────

export type TipoCarenciaHipoteca = 'total' | 'parcial_solo_intereses';

export interface ParametrosMoratoriaHipoteca {
  /** Capital pendiente en el momento de aplicar la carencia (€) */
  capitalPendiente: number;
  /** Tipo de interés nominal anual (TIN) en % */
  tinAnual: number;
  /** Plazo restante de la hipoteca antes de la carencia (meses) */
  plazoRestanteMeses: number;
  /** Tipo de carencia a aplicar */
  tipoCarencia: TipoCarenciaHipoteca;
  /** Duración de la carencia (meses) */
  duracionCarenciaMeses: number;
}

export interface ResultadoMoratoriaHipoteca {
  /** Capital pendiente inicial (€) */
  capitalPendiente: number;
  /** TIN anual (%) */
  tinAnual: number;
  /** Plazo restante antes de carencia (meses) */
  plazoRestanteMeses: number;
  /** Tipo de carencia */
  tipoCarencia: TipoCarenciaHipoteca;
  /** Duración de la carencia (meses) */
  duracionCarenciaMeses: number;
  /** Cuota mensual original (sin carencia) (€) */
  cuotaOriginalMensual: number;
  /** Cuota durante el período de carencia (€) */
  cuotaDuranteCarencia: number;
  /** Intereses devengados durante la carencia (€) */
  interesesDuranteCarencia: number;
  /** Capital pendiente al terminar la carencia (€) */
  capitalTrasCasencia: number;
  /** Plazo restante tras la carencia (meses) */
  plazoTrasCasenciaMeses: number;
  /** Nueva cuota mensual tras la carencia (€) */
  nuevaCuotaTrasCasencia: number;
  /** Incremento de cuota respecto a la original (€) */
  incrementoCuotaMensual: number;
  /** Total pagado durante la carencia (€) */
  totalPagadoCarencia: number;
  /** Total pagado en la vida restante del préstamo sin carencia (€) */
  totalPagadoSinCarencia: number;
  /** Total pagado en la vida restante con carencia (€) */
  totalPagadoConCarencia: number;
  /** **Sobrecoste total de aplicar la carencia (€)** */
  sobrecosteTotalCarencia: number;
  /** Advertencias */
  advertencias: string[];
  /** Fuente normativa */
  fuenteDatos: string;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function calcularCuotaMensual(capital: number, tinAnual: number, plazoMeses: number): number {
  if (plazoMeses <= 0) return 0;
  const tiMensual = tinAnual / 100 / 12;
  if (tiMensual === 0) return capital / plazoMeses;
  return capital * tiMensual * Math.pow(1 + tiMensual, plazoMeses) / (Math.pow(1 + tiMensual, plazoMeses) - 1);
}

// ─── Función principal ─────────────────────────────────────────────────────────

export function calcularMoratoriaHipoteca(p: ParametrosMoratoriaHipoteca): ResultadoMoratoriaHipoteca {
  if (p.capitalPendiente <= 0) throw new Error('El capital pendiente debe ser mayor que cero.');
  if (p.tinAnual < 0) throw new Error('El TIN no puede ser negativo.');
  if (p.plazoRestanteMeses <= 0) throw new Error('El plazo restante debe ser mayor que cero.');
  if (p.duracionCarenciaMeses <= 0) throw new Error('La duración de la carencia debe ser mayor que cero.');
  if (p.duracionCarenciaMeses >= p.plazoRestanteMeses) throw new Error('La duración de la carencia no puede ser igual o superior al plazo restante.');

  const r = (n: number) => Math.round(n * 100) / 100;
  const tiMensual = p.tinAnual / 100 / 12;

  const cuotaOriginalMensual = r(calcularCuotaMensual(p.capitalPendiente, p.tinAnual, p.plazoRestanteMeses));

  let cuotaDuranteCarencia: number;
  let capitalTrasCasencia: number;
  let interesesDuranteCarencia: number;

  if (p.tipoCarencia === 'total') {
    // Carencia total: no se paga nada, los intereses se capitalizan
    cuotaDuranteCarencia = 0;
    // Capital crece con los intereses capitalizados
    capitalTrasCasencia = r(p.capitalPendiente * Math.pow(1 + tiMensual, p.duracionCarenciaMeses));
    interesesDuranteCarencia = r(capitalTrasCasencia - p.capitalPendiente);
  } else {
    // Carencia parcial (solo intereses): se pagan intereses, no se amortiza capital
    cuotaDuranteCarencia = r(p.capitalPendiente * tiMensual);
    capitalTrasCasencia = p.capitalPendiente; // El capital no varía
    interesesDuranteCarencia = r(cuotaDuranteCarencia * p.duracionCarenciaMeses);
  }

  const plazoTrasCasenciaMeses = p.plazoRestanteMeses - p.duracionCarenciaMeses;
  const nuevaCuotaTrasCasencia = r(calcularCuotaMensual(capitalTrasCasencia, p.tinAnual, plazoTrasCasenciaMeses));
  const incrementoCuotaMensual = r(nuevaCuotaTrasCasencia - cuotaOriginalMensual);

  const totalPagadoCarencia = r(cuotaDuranteCarencia * p.duracionCarenciaMeses);
  const totalPagadoSinCarencia = r(cuotaOriginalMensual * p.plazoRestanteMeses);
  const totalPagadoConCarencia = r(totalPagadoCarencia + nuevaCuotaTrasCasencia * plazoTrasCasenciaMeses);
  const sobrecosteTotalCarencia = r(totalPagadoConCarencia - totalPagadoSinCarencia);

  const advertencias: string[] = [
    'La carencia de capital no elimina la deuda, la difiere. Los intereses devengados durante la carencia siempre se pagan (o se capitalizan en carencia total).',
    `Carencia total vs parcial: la carencia total (sin pagar nada) es más cómoda a corto plazo pero genera un sobrecoste mayor porque los intereses se capitalizan y se devenga sobre un capital mayor.`,
    'Para aplicar una carencia, es necesario negociar con el banco y firmar una novación hipotecaria. Puede conllevar gastos de notaría y registro, y una comisión por novación (habitualmente 0,1-0,5% del capital).',
    'Los deudores en situación de vulnerabilidad económica pueden acogerse al Código de Buenas Prácticas bancarias (RD-ley 6/2012) que contempla carencias sin coste para el hipotecado.',
  ];

  if (incrementoCuotaMensual > 0) {
    advertencias.push(`Tras la carencia, la cuota sube de ${cuotaOriginalMensual.toLocaleString('es-ES', { minimumFractionDigits: 2 })} € a ${nuevaCuotaTrasCasencia.toLocaleString('es-ES', { minimumFractionDigits: 2 })} € (+${incrementoCuotaMensual.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €/mes). Asegúrate de poder asumir esta cuota mayor al terminar la carencia.`);
  }

  return {
    capitalPendiente: r(p.capitalPendiente),
    tinAnual: p.tinAnual,
    plazoRestanteMeses: p.plazoRestanteMeses,
    tipoCarencia: p.tipoCarencia,
    duracionCarenciaMeses: p.duracionCarenciaMeses,
    cuotaOriginalMensual,
    cuotaDuranteCarencia,
    interesesDuranteCarencia,
    capitalTrasCasencia,
    plazoTrasCasenciaMeses,
    nuevaCuotaTrasCasencia,
    incrementoCuotaMensual,
    totalPagadoCarencia,
    totalPagadoSinCarencia,
    totalPagadoConCarencia,
    sobrecosteTotalCarencia,
    advertencias,
    fuenteDatos: 'Ley 5/2019 (LCCI) + RD-ley 6/2012 + RD-ley 19/2022 — vigente 2025',
  };
}
