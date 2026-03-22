/**
 * Calculadora de Período de Carencia — lógica pura sin React ni DOM
 * Usada por: MCP server (calcular_periodo_carencia)
 *
 * Calcula el impacto económico de una carencia total o parcial en un préstamo
 * o hipoteca: cuánto aumenta el total pagado y el nuevo cuadro de amortización.
 *
 * Tipos:
 * - Carencia total: solo se pagan intereses, no se amortiza capital.
 * - Carencia parcial: se paga una cuota reducida (sin amortizar o amortizando menos).
 *
 * Encadenable con: calcular_hipoteca, calcular_prestamo
 */

// ─── Tipos públicos ────────────────────────────────────────────────────────────

export type TipoCarencia = 'total' | 'parcial';

export interface ParametrosPeriodoCarencia {
  /** Capital pendiente del préstamo/hipoteca (€) */
  capitalPendiente: number;
  /** Tipo de interés anual (%) */
  tasaAnual: number;
  /** Plazo restante del préstamo (meses) */
  plazoRestanteMeses: number;
  /** Duración del período de carencia (meses) */
  mesesCarencia: number;
  /** Tipo de carencia: "total" (solo intereses) o "parcial" (cuota reducida a acordar) */
  tipoCarencia?: TipoCarencia;
  /**
   * Cuota mensual durante la carencia parcial (€).
   * Solo aplica si tipoCarencia = 'parcial'.
   * Por defecto = solo los intereses mensuales.
   */
  cuotaCarenciaParcial?: number;
}

export interface ResultadoPeriodoCarencia {
  /** Capital pendiente (€) */
  capitalPendiente: number;
  /** Tipo de carencia */
  tipoCarencia: TipoCarencia;
  /** Meses de carencia */
  mesesCarencia: number;
  /** Cuota mensual durante la carencia (€) */
  cuotaDuranteCarencia: number;
  /** Total pagado durante la carencia (€) */
  totalPagadoCarencia: number;
  /** Intereses pagados durante la carencia (€) */
  interesesCarencia: number;
  /** Capital amortizado durante la carencia (€) */
  capitalAmortizadoCarencia: number;
  /** Capital pendiente al finalizar la carencia (€) */
  capitalTrasCarencia: number;
  /** Nueva cuota mensual tras la carencia (fórmula francesa) (€) */
  nuevaCuotaTrasCarencia: number;
  /** Plazo restante tras la carencia (meses) — igual al original si carencia total */
  plazoTrasCarencia: number;
  /** Cuota mensual sin carencia (hipotética) (€) */
  cuotaSinCarencia: number;
  /** Total pagado sin carencia (€) */
  totalSinCarencia: number;
  /** Total pagado con carencia (carencia + resto del préstamo) (€) */
  totalConCarencia: number;
  /** Sobrecoste de la carencia: dinero adicional pagado (€) */
  sobrecostCarencia: number;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function cuotaFrancesa(capital: number, tasaAnual: number, meses: number): number {
  if (capital <= 0 || meses <= 0) return 0;
  const r = tasaAnual / 100 / 12;
  if (r === 0) return capital / meses;
  return (capital * r * Math.pow(1 + r, meses)) / (Math.pow(1 + r, meses) - 1);
}

// ─── Función principal ─────────────────────────────────────────────────────────

export function calcularPeriodoCarencia(p: ParametrosPeriodoCarencia): ResultadoPeriodoCarencia {
  if (p.capitalPendiente <= 0) throw new Error('El capital pendiente debe ser mayor que cero.');
  if (p.tasaAnual < 0) throw new Error('La tasa anual no puede ser negativa.');
  if (p.plazoRestanteMeses < 1) throw new Error('El plazo restante debe ser al menos 1 mes.');
  if (p.mesesCarencia < 1) throw new Error('La carencia debe ser de al menos 1 mes.');
  if (p.mesesCarencia >= p.plazoRestanteMeses) {
    throw new Error('Los meses de carencia no pueden ser iguales o mayores al plazo restante.');
  }

  const r = (n: number) => Math.round(n * 100) / 100;
  const tipoCarencia = p.tipoCarencia ?? 'total';
  const rMensual = p.tasaAnual / 100 / 12;

  // Interés mensual sobre el capital pendiente
  const interesMensual = r(p.capitalPendiente * rMensual);

  // Cuota durante la carencia
  let cuotaDuranteCarencia: number;
  if (tipoCarencia === 'total') {
    cuotaDuranteCarencia = interesMensual; // solo intereses
  } else {
    cuotaDuranteCarencia = p.cuotaCarenciaParcial ?? interesMensual;
  }
  cuotaDuranteCarencia = r(cuotaDuranteCarencia);

  // Calcular capital pendiente tras la carencia (mes a mes)
  let capitalActual = p.capitalPendiente;
  let interesesCarencia = 0;
  let capitalAmortizadoCarencia = 0;

  for (let mes = 0; mes < p.mesesCarencia; mes++) {
    const interes = r(capitalActual * rMensual);
    interesesCarencia += interes;
    const amortizacion = Math.max(0, cuotaDuranteCarencia - interes);
    capitalAmortizadoCarencia += amortizacion;
    capitalActual = r(capitalActual - amortizacion);
  }

  interesesCarencia = r(interesesCarencia);
  capitalAmortizadoCarencia = r(capitalAmortizadoCarencia);
  const capitalTrasCarencia = r(capitalActual);
  const totalPagadoCarencia = r(cuotaDuranteCarencia * p.mesesCarencia);

  // Plazo restante tras la carencia (siempre el original menos los meses de carencia)
  const plazoTrasCarencia = p.plazoRestanteMeses - p.mesesCarencia;

  // Nueva cuota tras la carencia
  const nuevaCuotaTrasCarencia = r(cuotaFrancesa(capitalTrasCarencia, p.tasaAnual, plazoTrasCarencia));

  // Total pagado con carencia
  const totalResto = r(nuevaCuotaTrasCarencia * plazoTrasCarencia);
  const totalConCarencia = r(totalPagadoCarencia + totalResto);

  // Cuota y total sin carencia (hipotéticos)
  const cuotaSinCarencia = r(cuotaFrancesa(p.capitalPendiente, p.tasaAnual, p.plazoRestanteMeses));
  const totalSinCarencia = r(cuotaSinCarencia * p.plazoRestanteMeses);

  const sobrecostCarencia = r(totalConCarencia - totalSinCarencia);

  return {
    capitalPendiente: r(p.capitalPendiente),
    tipoCarencia,
    mesesCarencia: p.mesesCarencia,
    cuotaDuranteCarencia,
    totalPagadoCarencia,
    interesesCarencia,
    capitalAmortizadoCarencia,
    capitalTrasCarencia,
    nuevaCuotaTrasCarencia,
    plazoTrasCarencia,
    cuotaSinCarencia,
    totalSinCarencia,
    totalConCarencia,
    sobrecostCarencia,
  };
}
