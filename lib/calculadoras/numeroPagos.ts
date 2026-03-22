/**
 * Calculadora de Número de Pagos Restantes — lógica pura sin React ni DOM
 * Usada por: MCP server (calcular_numero_pagos)
 *
 * Dado el capital pendiente de un préstamo/hipoteca, la cuota mensual y el
 * tipo de interés, calcula cuántos pagos quedan para liquidar la deuda.
 *
 * También calcula el efecto de un pago extraordinario o un aumento de cuota:
 * cuántos meses se acorta el plazo y cuántos intereses se ahorran.
 *
 * Fórmula:
 * n = -log(1 - capital·r / cuota) / log(1+r)
 * donde r = tipo_anual / 12 / 100
 *
 * Si cuota ≤ interés del período → la deuda nunca se cancela (error).
 *
 * Encadenable con: calcular_hipoteca, calcular_prestamo, calcular_amortizacion_anticipada
 */

// ─── Tipos públicos ────────────────────────────────────────────────────────────

export interface ParametrosNumeroPagos {
  /** Capital pendiente actual (€) */
  capitalPendiente: number;
  /** Cuota mensual actual (€) */
  cuotaMensual: number;
  /** Tipo de interés anual (%). Para préstamos sin interés, usar 0. */
  tasaAnual: number;
  /**
   * Pago extraordinario adicional a realizar ahora (€). Por defecto 0.
   * Reduce el capital antes de calcular los pagos restantes.
   */
  pagoExtraordinario?: number;
  /**
   * Nueva cuota mensual si se aumenta la cuota (€). Por defecto = cuotaMensual.
   * Permite simular qué pasa si se paga más cada mes.
   */
  nuevaCuotaMensual?: number;
}

export interface ResultadoNumeroPagos {
  /** Capital pendiente inicial (€) */
  capitalPendiente: number;
  /** Cuota mensual actual (€) */
  cuotaMensual: number;
  /** Tipo de interés anual (%) */
  tasaAnual: number;
  /** Tasa mensual (%) */
  tasaMensual: number;

  // Escenario base (sin cambios)
  /** Número de pagos restantes (escenario base) */
  pagosRestantes: number;
  /** Meses restantes (igual a pagosRestantes) */
  mesesRestantes: number;
  /** Años y meses restantes en formato legible */
  plazoRestante: string;
  /** Total a pagar hasta el final (escenario base) (€) */
  totalAPagar: number;
  /** Total de intereses restantes (escenario base) (€) */
  interesesRestantes: number;
  /** Fecha estimada de liquidación (escenario base) */
  fechaLiquidacion: string;

  // Escenario con pago extraordinario (si se indicó)
  pagosConExtraordinario?: number;
  mesesAhorradosConExtraordinario?: number;
  interesesAhorradosConExtraordinario?: number;

  // Escenario con nueva cuota (si se indicó)
  pagosConNuevaCuota?: number;
  mesesAhorradosConNuevaCuota?: number;
  interesesAhorradosConNuevaCuota?: number;

  /** Interpretación */
  interpretacion: string;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function calcularPagos(capital: number, cuota: number, tasaAnual: number): number {
  if (capital <= 0) return 0;
  if (tasaAnual === 0) return Math.ceil(capital / cuota);
  const r = tasaAnual / 100 / 12;
  if (cuota <= capital * r) return Infinity; // deuda no se cancela
  return Math.ceil(-Math.log(1 - capital * r / cuota) / Math.log(1 + r));
}

function calcularIntereses(capital: number, cuota: number, tasaAnual: number, n: number): number {
  const r = (x: number) => Math.round(x * 100) / 100;
  return r(cuota * n - capital);
}

function formatearPlazo(meses: number): string {
  const anios = Math.floor(meses / 12);
  const mesesResto = meses % 12;
  if (anios === 0) return `${mesesResto} mes${mesesResto !== 1 ? 'es' : ''}`;
  if (mesesResto === 0) return `${anios} año${anios !== 1 ? 's' : ''}`;
  return `${anios} año${anios !== 1 ? 's' : ''} y ${mesesResto} mes${mesesResto !== 1 ? 'es' : ''}`;
}

function fechaLiquidacion(meses: number): string {
  const fecha = new Date();
  fecha.setMonth(fecha.getMonth() + meses);
  return fecha.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
}

// ─── Función principal ─────────────────────────────────────────────────────────

export function calcularNumeroPagos(p: ParametrosNumeroPagos): ResultadoNumeroPagos {
  if (p.capitalPendiente <= 0) throw new Error('El capital pendiente debe ser mayor que cero.');
  if (p.cuotaMensual <= 0) throw new Error('La cuota mensual debe ser mayor que cero.');
  if (p.tasaAnual < 0) throw new Error('La tasa anual no puede ser negativa.');

  const r = (n: number) => Math.round(n * 100) / 100;
  const tasaMensual = r(p.tasaAnual / 12);

  // Verificar viabilidad: cuota debe superar los intereses del primer período
  if (p.tasaAnual > 0) {
    const interesMensual = r(p.capitalPendiente * p.tasaAnual / 100 / 12);
    if (p.cuotaMensual <= interesMensual) {
      throw new Error(`La cuota mensual (${p.cuotaMensual} €) no supera los intereses del primer período (${interesMensual} €). La deuda nunca se cancelaría.`);
    }
  }

  // Escenario base
  const pagosBase = calcularPagos(p.capitalPendiente, p.cuotaMensual, p.tasaAnual);
  if (!isFinite(pagosBase)) throw new Error('Con la cuota indicada la deuda no puede cancelarse. Aumenta la cuota.');

  const totalBase = r(p.cuotaMensual * pagosBase);
  const interesesBase = calcularIntereses(p.capitalPendiente, p.cuotaMensual, p.tasaAnual, pagosBase);

  const resultado: ResultadoNumeroPagos = {
    capitalPendiente: r(p.capitalPendiente),
    cuotaMensual: r(p.cuotaMensual),
    tasaAnual: p.tasaAnual,
    tasaMensual,
    pagosRestantes: pagosBase,
    mesesRestantes: pagosBase,
    plazoRestante: formatearPlazo(pagosBase),
    totalAPagar: totalBase,
    interesesRestantes: interesesBase,
    fechaLiquidacion: fechaLiquidacion(pagosBase),
    interpretacion: '',
  };

  // Escenario con pago extraordinario
  if (p.pagoExtraordinario && p.pagoExtraordinario > 0) {
    const capitalTrasExtra = Math.max(0, r(p.capitalPendiente - p.pagoExtraordinario));
    if (capitalTrasExtra === 0) {
      resultado.pagosConExtraordinario = 0;
      resultado.mesesAhorradosConExtraordinario = pagosBase;
      resultado.interesesAhorradosConExtraordinario = interesesBase;
    } else {
      const pagosExtra = calcularPagos(capitalTrasExtra, p.cuotaMensual, p.tasaAnual);
      if (isFinite(pagosExtra)) {
        const interesesExtra = calcularIntereses(capitalTrasExtra, p.cuotaMensual, p.tasaAnual, pagosExtra);
        resultado.pagosConExtraordinario = pagosExtra;
        resultado.mesesAhorradosConExtraordinario = pagosBase - pagosExtra;
        resultado.interesesAhorradosConExtraordinario = r(interesesBase - interesesExtra);
      }
    }
  }

  // Escenario con nueva cuota
  if (p.nuevaCuotaMensual && p.nuevaCuotaMensual > p.cuotaMensual) {
    const pagosNueva = calcularPagos(p.capitalPendiente, p.nuevaCuotaMensual, p.tasaAnual);
    if (isFinite(pagosNueva)) {
      const interesesNueva = calcularIntereses(p.capitalPendiente, p.nuevaCuotaMensual, p.tasaAnual, pagosNueva);
      resultado.pagosConNuevaCuota = pagosNueva;
      resultado.mesesAhorradosConNuevaCuota = pagosBase - pagosNueva;
      resultado.interesesAhorradosConNuevaCuota = r(interesesBase - interesesNueva);
    }
  }

  // Interpretación
  const anios = Math.floor(pagosBase / 12);
  resultado.interpretacion = anios >= 10
    ? `Quedan ${formatearPlazo(pagosBase)} de deuda. Con intereses acumulados de ${interesesBase.toLocaleString('es-ES')} €, considera amortizar anticipadamente si dispones de liquidez.`
    : `Quedan ${formatearPlazo(pagosBase)} de deuda. Intereses restantes: ${interesesBase.toLocaleString('es-ES')} €.`;

  return resultado;
}
