/**
 * Calculadora de Tarifa Freelance/Autónomo — lógica pura sin React ni DOM
 * Usada por: MCP server (calcular_tarifa_freelance)
 *
 * Calcula la tarifa hora/día/semana ideal para un autónomo español
 * teniendo en cuenta ingresos netos deseados, gastos deducibles,
 * días laborables reales, IRPF, IVA y margen de beneficio.
 */

// ─── Tipos públicos ────────────────────────────────────────────────────────────

export interface GastoMensual {
  concepto: string;
  importe: number;
}

export interface ParametrosTarifaFreelance {
  /** Ingreso neto mensual deseado (€) */
  ingresoNetoMensual: number;
  /** Horas de trabajo a la semana (por defecto 40) */
  horasSemanales?: number;
  /** Días de vacaciones al año (por defecto 22) */
  diasVacaciones?: number;
  /** Días festivos al año (por defecto 14) */
  diasFestivos?: number;
  /** Días de baja/enfermedad previstos al año (por defecto 5) */
  diasEnfermedad?: number;
  /** Porcentaje de ocupación real: no todos los días facturables se facturan (%, por defecto 70) */
  porcentajeOcupacion?: number;
  /** Tipo de IRPF estimado (%, por defecto 21) */
  tipoIRPF?: number;
  /** Tipo de IVA a aplicar en facturas (%, por defecto 21) */
  tipoIVA?: number;
  /** Margen de beneficio sobre costes (%, por defecto 15) */
  margenBeneficio?: number;
  /** Gastos fijos mensuales deducibles (cuota autónomo, seguros, software, oficina...) */
  gastosFijos?: GastoMensual[];
  /** Gastos variables mensuales deducibles (formación, materiales, viajes...) */
  gastosVariables?: GastoMensual[];
}

export interface ResultadoTarifaFreelance {
  // Días y horas trabajables
  /** Días laborables al año (excluye fines de semana, vacaciones, festivos, bajas) */
  diasLaborablesAno: number;
  /** Días realmente facturables al año (aplicando % ocupación) */
  diasFacturablesAno: number;
  /** Días facturables al mes */
  diasFacturablesMes: number;
  /** Horas facturables al año */
  horasFacturablesAno: number;
  /** Horas facturables al mes */
  horasFacturablesMes: number;

  // Costes mensuales
  /** Total gastos fijos mensuales */
  totalGastosFijos: number;
  /** Total gastos variables mensuales */
  totalGastosVariables: number;
  /** Total gastos mensuales */
  totalGastosMensuales: number;

  // Facturación necesaria
  /** Ingreso bruto mensual necesario (antes IRPF, con margen) */
  facturacionMensualNecesaria: number;

  // Tarifas sin IVA (lo que cobra el freelance)
  /** Tarifa por hora (€, sin IVA) */
  tarifaHora: number;
  /** Tarifa por día (€, sin IVA) */
  tarifaDia: number;
  /** Tarifa por semana (€, sin IVA) */
  tarifaSemana: number;

  // Tarifas con IVA (lo que paga el cliente)
  /** Tarifa por hora (€, con IVA) */
  tarifaHoraConIVA: number;
  /** Tarifa por día (€, con IVA) */
  tarifaDiaConIVA: number;
  /** Tarifa por semana (€, con IVA) */
  tarifaSemanaConIVA: number;

  // Anuales
  /** Facturación anual estimada */
  facturacionAnual: number;
  /** Gastos anuales totales */
  gastosAnuales: number;
  /** IRPF anual estimado */
  irpfAnual: number;
  /** Beneficio neto anual estimado */
  beneficioNetoAnual: number;
}

// ─── Función principal ─────────────────────────────────────────────────────────

export function calcularTarifaFreelance(p: ParametrosTarifaFreelance): ResultadoTarifaFreelance {
  if (p.ingresoNetoMensual <= 0) throw new Error('El ingreso neto mensual deseado debe ser mayor que cero.');

  const r = (n: number) => Math.round(n * 100) / 100;

  const horas = p.horasSemanales ?? 40;
  const vacaciones = p.diasVacaciones ?? 22;
  const festivos = p.diasFestivos ?? 14;
  const enfermedad = p.diasEnfermedad ?? 5;
  const ocupacion = (p.porcentajeOcupacion ?? 70) / 100;
  const irpf = (p.tipoIRPF ?? 21) / 100;
  const iva = (p.tipoIVA ?? 21) / 100;
  const margen = (p.margenBeneficio ?? 15) / 100;

  const totalGastosFijos = (p.gastosFijos ?? []).reduce((s, g) => s + g.importe, 0);
  const totalGastosVariables = (p.gastosVariables ?? []).reduce((s, g) => s + g.importe, 0);
  const totalGastosMensuales = r(totalGastosFijos + totalGastosVariables);

  // Días laborables reales: 365 - 104 fines de semana - vacaciones - festivos - bajas
  const diasLaborablesAno = Math.max(0, 365 - 104 - vacaciones - festivos - enfermedad);
  const diasFacturablesAno = r(diasLaborablesAno * ocupacion);
  const diasFacturablesMes = r(diasFacturablesAno / 12);

  const horasDia = horas / 5; // días por semana
  const horasFacturablesAno = r(diasFacturablesAno * horasDia);
  const horasFacturablesMes = r(horasFacturablesAno / 12);

  // Ingreso bruto necesario: (neto deseado + gastos) / (1 - IRPF) × (1 + margen)
  const baseMensual = p.ingresoNetoMensual + totalGastosMensuales;
  const brutoAntesIRPF = baseMensual / (1 - irpf);
  const facturacionMensualNecesaria = r(brutoAntesIRPF * (1 + margen));

  // Tarifas sin IVA
  const tarifaHora = diasFacturablesMes > 0 && horasFacturablesMes > 0 ? r(facturacionMensualNecesaria / horasFacturablesMes) : 0;
  const tarifaDia = diasFacturablesMes > 0 ? r(facturacionMensualNecesaria / diasFacturablesMes) : 0;
  const tarifaSemana = r(tarifaDia * 5);

  // Tarifas con IVA
  const tarifaHoraConIVA = r(tarifaHora * (1 + iva));
  const tarifaDiaConIVA = r(tarifaDia * (1 + iva));
  const tarifaSemanaConIVA = r(tarifaSemana * (1 + iva));

  // Anuales
  const facturacionAnual = r(facturacionMensualNecesaria * 12);
  const gastosAnuales = r(totalGastosMensuales * 12);
  const rendimientoNeto = facturacionAnual - gastosAnuales;
  const irpfAnual = r(rendimientoNeto * irpf);
  const beneficioNetoAnual = r(rendimientoNeto - irpfAnual);

  return {
    diasLaborablesAno,
    diasFacturablesAno,
    diasFacturablesMes,
    horasFacturablesAno,
    horasFacturablesMes,
    totalGastosFijos: r(totalGastosFijos),
    totalGastosVariables: r(totalGastosVariables),
    totalGastosMensuales,
    facturacionMensualNecesaria,
    tarifaHora,
    tarifaDia,
    tarifaSemana,
    tarifaHoraConIVA,
    tarifaDiaConIVA,
    tarifaSemanaConIVA,
    facturacionAnual,
    gastosAnuales,
    irpfAnual,
    beneficioNetoAnual,
  };
}
