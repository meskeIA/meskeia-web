/**
 * Calculadora de Coste Real de un Empleado — lógica pura sin React ni DOM
 * Usada por: MCP server (calcular_coste_empleado)
 *
 * Calcula el coste total para el empleador: salario bruto + cuotas
 * de Seguridad Social a cargo de la empresa (contingencias comunes,
 * desempleo, FP, FOGASA y accidentes de trabajo).
 *
 * Fuente: Orden PJC/51/2025 de cotización SS + Estatuto de los Trabajadores
 */

// ─── Constantes SS empresa 2025 ────────────────────────────────────────────────

// Tipos de cotización a cargo de la empresa (porción patronal)
const SS_EMPRESA_2025 = {
  contingenciasComunes:   23.60,  // %
  desempleoIndefinido:     5.50,  // % — contratos indefinidos
  desempleoTemporal:       6.70,  // % — contratos temporales (<6 meses: 8.30%)
  formacionProfesional:    0.60,  // %
  fogasa:                  0.20,  // %
  accidentesTrabajo: {
    oficina:               1.50,  // % — media orientativa actividades de oficina
    comercio:              1.80,  // % — media orientativa comercio/hostelería
    construccion:          6.70,  // % — construcción (la más alta)
    industrial:            2.80,  // % — industria media
  },
  fuenteDatos: 'Orden PJC/51/2025 de cotización a la Seguridad Social. Tipos vigentes 2025.',
};

// Bases de cotización 2025 (mensuales) — Orden PJC/178/2025, vigentes desde el 01-ene-2025
const BASES_SS_2025 = {
  minima: 1381.20,
  maxima: 4909.50,
};

// ─── Tipos públicos ────────────────────────────────────────────────────────────

export type TipoContrato = 'indefinido' | 'temporal';
export type SectorActividad = 'oficina' | 'comercio' | 'industrial' | 'construccion';

export interface ParametrosCosteEmpleado {
  /** Salario bruto anual del empleado (€) */
  salarioBrutoAnual: number;
  /** Tipo de contrato */
  tipoContrato?: TipoContrato;
  /** Sector de actividad (para tipo AT/EP) */
  sector?: SectorActividad;
  /** Beneficios extra anuales (seguro médico, tickets restaurante, etc.) (€) */
  beneficiosExtra?: number;
  /** Número de pagas del empleado (12 o 14) */
  pagas?: 12 | 14;
}

export interface ResultadoCosteEmpleado {
  /** Salario bruto anual */
  salarioBrutoAnual: number;
  /** Salario bruto mensual */
  salarioBrutoMensual: number;
  /** Base de cotización mensual (clampada entre mín y máx) */
  baseCotizacion: number;
  /** Desglose cuotas empresa anuales */
  cuotas: {
    contingenciasComunes: number;
    desempleo: number;
    formacionProfesional: number;
    fogasa: number;
    accidentesTrabajo: number;
    total: number;
  };
  /** Tipos aplicados */
  tipos: {
    contingenciasComunes: number;
    desempleo: number;
    formacionProfesional: number;
    fogasa: number;
    accidentesTrabajo: number;
    totalSS: number;
  };
  /** Beneficios extra anuales */
  beneficiosExtra: number;
  /** Coste total anual para la empresa */
  costeTotalAnual: number;
  /** Coste total mensual */
  costeTotalMensual: number;
  /** Ratio coste/salario bruto (%) */
  sobrecoste: number;
  /** Fuente normativa */
  fuenteDatos: string;
}

// ─── Función principal ─────────────────────────────────────────────────────────

export function calcularCosteEmpleado(p: ParametrosCosteEmpleado): ResultadoCosteEmpleado {
  if (p.salarioBrutoAnual <= 0) throw new Error('El salario bruto anual debe ser mayor que cero.');

  const r = (n: number) => Math.round(n * 100) / 100;

  const tipoContrato = p.tipoContrato ?? 'indefinido';
  const sector = p.sector ?? 'oficina';
  const beneficiosExtra = p.beneficiosExtra ?? 0;
  const pagas = p.pagas ?? 14;

  const salarioBrutoMensual = r(p.salarioBrutoAnual / 12);

  // Base de cotización (clampada)
  const baseCotizacion = Math.min(
    Math.max(salarioBrutoMensual, BASES_SS_2025.minima),
    BASES_SS_2025.maxima
  );

  // Tipos aplicados
  const tipoDesempleo = tipoContrato === 'indefinido'
    ? SS_EMPRESA_2025.desempleoIndefinido
    : SS_EMPRESA_2025.desempleoTemporal;
  const tipoAT = SS_EMPRESA_2025.accidentesTrabajo[sector];
  const tipoTotalSS = (
    SS_EMPRESA_2025.contingenciasComunes +
    tipoDesempleo +
    SS_EMPRESA_2025.formacionProfesional +
    SS_EMPRESA_2025.fogasa +
    tipoAT
  );

  // Cuotas mensuales → × 12 para anual
  const ccMensual = baseCotizacion * (SS_EMPRESA_2025.contingenciasComunes / 100);
  const desempleoMensual = baseCotizacion * (tipoDesempleo / 100);
  const fpMensual = baseCotizacion * (SS_EMPRESA_2025.formacionProfesional / 100);
  const fogasaMensual = baseCotizacion * (SS_EMPRESA_2025.fogasa / 100);
  const atMensual = baseCotizacion * (tipoAT / 100);

  const cuotas = {
    contingenciasComunes: r(ccMensual * 12),
    desempleo: r(desempleoMensual * 12),
    formacionProfesional: r(fpMensual * 12),
    fogasa: r(fogasaMensual * 12),
    accidentesTrabajo: r(atMensual * 12),
    total: r((ccMensual + desempleoMensual + fpMensual + fogasaMensual + atMensual) * 12),
  };

  const costeTotalAnual = r(p.salarioBrutoAnual + cuotas.total + beneficiosExtra);
  const costeTotalMensual = r(costeTotalAnual / 12);
  const sobrecoste = r(((costeTotalAnual - p.salarioBrutoAnual) / p.salarioBrutoAnual) * 100);

  return {
    salarioBrutoAnual: r(p.salarioBrutoAnual),
    salarioBrutoMensual,
    baseCotizacion: r(baseCotizacion),
    cuotas,
    tipos: {
      contingenciasComunes: SS_EMPRESA_2025.contingenciasComunes,
      desempleo: tipoDesempleo,
      formacionProfesional: SS_EMPRESA_2025.formacionProfesional,
      fogasa: SS_EMPRESA_2025.fogasa,
      accidentesTrabajo: tipoAT,
      totalSS: r(tipoTotalSS),
    },
    beneficiosExtra,
    costeTotalAnual,
    costeTotalMensual,
    sobrecoste,
    fuenteDatos: SS_EMPRESA_2025.fuenteDatos,
  };
}
