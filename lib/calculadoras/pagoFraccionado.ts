/**
 * Calculadora de Pago Fraccionado IRPF — lógica pura sin React ni DOM
 * Usada por: MCP server (calcular_pago_fraccionado)
 *
 * Calcula el pago fraccionado trimestral del IRPF para autónomos
 * en estimación directa simplificada (Modelo 130 AEAT).
 *
 * Fórmula: 20% × (ingresos - gastos - SS) - retenciones soportadas - pagos anteriores
 *
 * Fuente: LIRPF art. 99 + RD 439/2007 art. 110 — Modelo 130 AEAT
 */

// ─── Tipos públicos ────────────────────────────────────────────────────────────

export type Trimestre = 1 | 2 | 3 | 4;

export interface ParametrosPagoFraccionado {
  /** Trimestre a calcular (1, 2, 3 o 4) */
  trimestre: Trimestre;
  /** Ingresos acumulados desde el 1 de enero hasta el fin del trimestre (€) */
  ingresosAcumulados: number;
  /** Gastos deducibles acumulados desde el 1 de enero (sin incluir cuotas SS) (€) */
  gastosDeduciblesAcumulados: number;
  /** Cuotas SS (RETA) pagadas acumuladas desde el 1 de enero (€) */
  cuotasSSAcumuladas: number;
  /** Retenciones soportadas acumuladas (facturas emitidas con retención 7% o 15%) (€) */
  retencionesSoportadasAcumuladas?: number;
  /** Suma de pagos fraccionados de trimestres anteriores ya ingresados (€) */
  pagosFraccionadosAnteriores?: number;
  /**
   * ¿Actividad agrícola/ganadera/forestal/pesquera?
   * En ese caso el porcentaje es 2% en lugar del 20% (modelo 130 especial).
   * Por defecto false.
   */
  actividadAgricola?: boolean;
}

export interface ResultadoPagoFraccionado {
  /** Trimestre calculado */
  trimestre: Trimestre;
  /** Rendimiento neto acumulado (ingresos - gastos - SS) (€) */
  rendimientoNetoAcumulado: number;
  /** Base de cálculo (20% sobre rendimiento neto si positivo) */
  baseCalculo: number;
  /** Porcentaje aplicado (20% general o 2% agrícola) */
  porcentajeAplicado: number;
  /** Cuota previa (porcentaje × base) (€) */
  cuotaPrevia: number;
  /** Retenciones soportadas acumuladas (€) */
  retencionesSoportadas: number;
  /** Pagos fraccionados anteriores del año (€) */
  pagosFraccionadosAnteriores: number;
  /** Pago fraccionado a ingresar este trimestre (€). 0 si resulta negativo. */
  pagoAIngresar: number;
  /** ¿Resultado negativo (a compensar en trimestres siguientes)? */
  resultadoNegativo: boolean;
  /** Importe negativo a compensar en trimestres siguientes (€) */
  saldoACompensarSiguienteT: number;
  /** Fecha límite de presentación */
  fechaLimite: string;
}

// ─── Función principal ─────────────────────────────────────────────────────────

export function calcularPagoFraccionado(p: ParametrosPagoFraccionado): ResultadoPagoFraccionado {
  if (p.ingresosAcumulados < 0) throw new Error('Los ingresos acumulados no pueden ser negativos.');
  if (p.gastosDeduciblesAcumulados < 0) throw new Error('Los gastos deducibles no pueden ser negativos.');
  if (p.cuotasSSAcumuladas < 0) throw new Error('Las cuotas SS no pueden ser negativas.');
  if (![1, 2, 3, 4].includes(p.trimestre)) throw new Error('El trimestre debe ser 1, 2, 3 o 4.');

  const r = (n: number) => Math.round(n * 100) / 100;

  const retenciones = p.retencionesSoportadasAcumuladas ?? 0;
  const pagosAnteriores = p.pagosFraccionadosAnteriores ?? 0;
  const porcentaje = p.actividadAgricola ? 2 : 20;

  // Rendimiento neto acumulado
  const rendimientoNetoAcumulado = r(
    p.ingresosAcumulados - p.gastosDeduciblesAcumulados - p.cuotasSSAcumuladas
  );

  // Base de cálculo (solo si positivo)
  const baseCalculo = Math.max(0, rendimientoNetoAcumulado);

  // Cuota previa
  const cuotaPrevia = r(baseCalculo * (porcentaje / 100));

  // Pago a ingresar = cuotaPrevia - retenciones - pagosAnteriores
  const resultadoBruto = r(cuotaPrevia - retenciones - pagosAnteriores);

  const pagoAIngresar = Math.max(0, resultadoBruto);
  const resultadoNegativo = resultadoBruto < 0;
  const saldoACompensarSiguienteT = resultadoNegativo ? r(Math.abs(resultadoBruto)) : 0;

  // Fechas límite de presentación (plazos generales)
  const fechasLimite: Record<Trimestre, string> = {
    1: '30 de abril',
    2: '20 de julio',
    3: '20 de octubre',
    4: '30 de enero del año siguiente',
  };

  return {
    trimestre: p.trimestre,
    rendimientoNetoAcumulado,
    baseCalculo: r(baseCalculo),
    porcentajeAplicado: porcentaje,
    cuotaPrevia,
    retencionesSoportadas: r(retenciones),
    pagosFraccionadosAnteriores: r(pagosAnteriores),
    pagoAIngresar: r(pagoAIngresar),
    resultadoNegativo,
    saldoACompensarSiguienteT,
    fechaLimite: fechasLimite[p.trimestre],
  };
}
