/**
 * Calculadora de Complemento Empresarial durante IT — lógica pura sin React ni DOM
 * Usada por: MCP server (calcular_complemento_it_empresa)
 *
 * Calcula el complemento que paga la empresa durante una baja por incapacidad
 * temporal (IT) para cubrir la brecha entre la prestación de la Seguridad Social
 * y el salario real del trabajador.
 *
 * Marco normativo:
 *   - ET art. 45.1.c: La IT suspende el contrato (sin obligación de abonar salario)
 *   - LGSS arts. 169-176: prestación económica de IT por la SS
 *   - Convenio colectivo o acuerdo individual: puede obligar al complemento
 *
 * Cuantía de la prestación SS durante IT (contingencias comunes):
 *   - Del día 1 al 3: ninguna prestación (corre a cargo de la empresa si convenio)
 *   - Del día 4 al 15: 60% de la base reguladora (a cargo de la empresa)
 *   - Del día 16 al 20: 60% de la base reguladora (a cargo de la Mutua/INSS)
 *   - Del día 21 en adelante: 75% de la base reguladora (a cargo de la Mutua/INSS)
 *
 * Para AT/EP (accidente de trabajo / enfermedad profesional):
 *   - Desde el día 1 (siguiente al del accidente): 75% de la base reguladora
 *   - Los días 1-3: la empresa paga el 75% directamente (no es prestación SS)
 *
 * Base reguladora diaria IT (contingencias comunes):
 *   = (Base de cotización del mes anterior) / (nº de días en ese mes)
 *
 * El complemento empresarial = salario real diario - prestación SS diaria
 * Puede pactarse hasta el 100% del salario o más según convenio.
 *
 * Fuente: LGSS arts. 169-176 + ET art. 45 — vigente 2025
 * Verificado: 2025-01-15
 *
 * Encadenable con: calcular_baja_medica, calcular_sueldo_neto, calcular_coste_empleado
 */

// ─── Constantes ────────────────────────────────────────────────────────────────

// Porcentajes prestación SS contingencias comunes
const PCT_SS_DIA_4_15 = 60;    // Días 4-15 (a cargo empresa los días 4-15, pero paga la empresa, luego recupera)
const PCT_SS_DIA_16_20 = 60;   // Días 16-20 (a cargo Mutua/INSS)
const PCT_SS_DIA_21_MAS = 75;  // Día 21 en adelante

// Porcentaje prestación SS accidente trabajo
const PCT_SS_AT_DESDE_DIA1 = 75;

// ─── Tipos públicos ────────────────────────────────────────────────────────────

export type TipoContingenciaIT = 'enfermedad_comun' | 'accidente_trabajo';

export interface ParametrosComplementoIT {
  /** Tipo de contingencia de la baja */
  tipoContingencia: TipoContingenciaIT;
  /** Salario bruto mensual del trabajador (€) — para calcular el salario diario real */
  salarioBrutoMensual: number;
  /** Base de cotización mensual del mes anterior a la baja (€) — para calcular la prestación SS */
  baseCotizacionMensual: number;
  /** Número de días del mes de la base de cotización (para el divisor diario) */
  diasMesBaseCotizacion?: number;
  /** Duración total de la baja (días naturales) */
  duracionBajaDias: number;
  /**
   * Porcentaje al que la empresa complementa el salario durante la baja (%).
   * 100% = la empresa paga el 100% del salario neto.
   * 0% = sin complemento (el trabajador solo cobra la prestación SS).
   * Por convenio puede ser cualquier valor entre 0 y 100+%.
   */
  pctComplementoEmpresa: number;
  /**
   * ¿El convenio obliga a pagar complemento los 3 primeros días (espera)?
   * Por defecto false (sin complemento días 1-3 en contingencias comunes).
   */
  complementoDiasDespera?: boolean;
}

export interface DetallePeríodoIT {
  periodo: string;
  diasPeriodo: number;
  pctSS: number;
  prestacionSSdiaria: number;
  salarioDiarioReal: number;
  complementoEmpresaDiario: number;
  totalDiarioTrabajador: number;
}

export interface ResultadoComplementoIT {
  /** Tipo de contingencia */
  tipoContingencia: TipoContingenciaIT;
  /** Salario bruto mensual (€) */
  salarioBrutoMensual: number;
  /** Base reguladora diaria (€) */
  baseReguladoraDiaria: number;
  /** Salario diario real bruto (€) */
  salarioDiarioReal: number;
  /** Duración de la baja (días) */
  duracionBajaDias: number;
  /** Porcentaje de complemento empresarial (%) */
  pctComplementoEmpresa: number;
  /** Desglose por períodos */
  detallesPeriodos: DetallePeríodoIT[];
  /** Total prestación SS durante la baja (€) */
  totalPrestacionSS: number;
  /** **Total complemento empresa durante la baja (€)** */
  totalComplementoEmpresa: number;
  /** Total cobrado por el trabajador durante la baja (€) */
  totalCobradoTrabajador: number;
  /** Total que habría cobrado si hubiera trabajado (€) */
  totalSalarioSiTrabajara: number;
  /** Brecha económica total del trabajador (€) — diferencia con salario normal */
  brechaEconomicaTrabajador: number;
  /** Coste total para la empresa durante la baja (€) */
  costeTotalEmpresa: number;
  /** Advertencias */
  advertencias: string[];
  /** Fuente normativa */
  fuenteDatos: string;
}

// ─── Función principal ─────────────────────────────────────────────────────────

export function calcularComplementoIT(p: ParametrosComplementoIT): ResultadoComplementoIT {
  if (p.salarioBrutoMensual <= 0) throw new Error('El salario bruto mensual debe ser mayor que cero.');
  if (p.baseCotizacionMensual <= 0) throw new Error('La base de cotización mensual debe ser mayor que cero.');
  if (p.duracionBajaDias <= 0) throw new Error('La duración de la baja debe ser mayor que cero.');
  if (p.pctComplementoEmpresa < 0) throw new Error('El porcentaje de complemento no puede ser negativo.');

  const r = (n: number) => Math.round(n * 100) / 100;
  const advertencias: string[] = [];

  const diasMes = p.diasMesBaseCotizacion ?? 30;
  const baseReguladoraDiaria = r(p.baseCotizacionMensual / diasMes);
  const salarioDiarioReal = r(p.salarioBrutoMensual / 30);
  const complementaDespera = p.complementoDiasDespera ?? false;

  const detallesPeriodos: DetallePeríodoIT[] = [];
  let totalPrestacionSS = 0;
  let totalComplementoEmpresa = 0;

  if (p.tipoContingencia === 'enfermedad_comun') {
    // Días 1-3: días de espera (sin prestación SS)
    const diasEspera = Math.min(3, p.duracionBajaDias);
    if (diasEspera > 0) {
      const prestDiaria = 0;
      const complementoDiario = complementaDespera ? r(salarioDiarioReal * p.pctComplementoEmpresa / 100) : 0;
      detallesPeriodos.push({
        periodo: 'Días 1-3 (espera)',
        diasPeriodo: diasEspera,
        pctSS: 0,
        prestacionSSdiaria: prestDiaria,
        salarioDiarioReal,
        complementoEmpresaDiario: complementoDiario,
        totalDiarioTrabajador: r(prestDiaria + complementoDiario),
      });
      totalComplementoEmpresa += r(complementoDiario * diasEspera);
    }

    // Días 4-15: 60% BR (empresa abona y luego recupera de la mutua)
    if (p.duracionBajaDias >= 4) {
      const diasPeriodo = Math.min(12, p.duracionBajaDias - 3);
      const prestDiaria = r(baseReguladoraDiaria * PCT_SS_DIA_4_15 / 100);
      const complementoDiario = r(Math.max(0, salarioDiarioReal * p.pctComplementoEmpresa / 100 - prestDiaria));
      detallesPeriodos.push({
        periodo: 'Días 4-15 (60% BR, paga empresa, recupera de Mutua)',
        diasPeriodo,
        pctSS: PCT_SS_DIA_4_15,
        prestacionSSdiaria: prestDiaria,
        salarioDiarioReal,
        complementoEmpresaDiario: complementoDiario,
        totalDiarioTrabajador: r(prestDiaria + complementoDiario),
      });
      totalPrestacionSS += r(prestDiaria * diasPeriodo);
      totalComplementoEmpresa += r(complementoDiario * diasPeriodo);
    }

    // Días 16-20: 60% BR (paga Mutua/INSS)
    if (p.duracionBajaDias >= 16) {
      const diasPeriodo = Math.min(5, p.duracionBajaDias - 15);
      const prestDiaria = r(baseReguladoraDiaria * PCT_SS_DIA_16_20 / 100);
      const complementoDiario = r(Math.max(0, salarioDiarioReal * p.pctComplementoEmpresa / 100 - prestDiaria));
      detallesPeriodos.push({
        periodo: 'Días 16-20 (60% BR, paga Mutua/INSS)',
        diasPeriodo,
        pctSS: PCT_SS_DIA_16_20,
        prestacionSSdiaria: prestDiaria,
        salarioDiarioReal,
        complementoEmpresaDiario: complementoDiario,
        totalDiarioTrabajador: r(prestDiaria + complementoDiario),
      });
      totalPrestacionSS += r(prestDiaria * diasPeriodo);
      totalComplementoEmpresa += r(complementoDiario * diasPeriodo);
    }

    // Días 21+: 75% BR (paga Mutua/INSS)
    if (p.duracionBajaDias >= 21) {
      const diasPeriodo = p.duracionBajaDias - 20;
      const prestDiaria = r(baseReguladoraDiaria * PCT_SS_DIA_21_MAS / 100);
      const complementoDiario = r(Math.max(0, salarioDiarioReal * p.pctComplementoEmpresa / 100 - prestDiaria));
      detallesPeriodos.push({
        periodo: 'Día 21 en adelante (75% BR, paga Mutua/INSS)',
        diasPeriodo,
        pctSS: PCT_SS_DIA_21_MAS,
        prestacionSSdiaria: prestDiaria,
        salarioDiarioReal,
        complementoEmpresaDiario: complementoDiario,
        totalDiarioTrabajador: r(prestDiaria + complementoDiario),
      });
      totalPrestacionSS += r(prestDiaria * diasPeriodo);
      totalComplementoEmpresa += r(complementoDiario * diasPeriodo);
    }
  } else {
    // Accidente de trabajo: desde día 1, 75% BR
    const prestDiaria = r(baseReguladoraDiaria * PCT_SS_AT_DESDE_DIA1 / 100);
    const complementoDiario = r(Math.max(0, salarioDiarioReal * p.pctComplementoEmpresa / 100 - prestDiaria));
    detallesPeriodos.push({
      periodo: `Todo el período AT/EP (${p.duracionBajaDias} días, 75% BR desde día 1)`,
      diasPeriodo: p.duracionBajaDias,
      pctSS: PCT_SS_AT_DESDE_DIA1,
      prestacionSSdiaria: prestDiaria,
      salarioDiarioReal,
      complementoEmpresaDiario: complementoDiario,
      totalDiarioTrabajador: r(prestDiaria + complementoDiario),
    });
    totalPrestacionSS = r(prestDiaria * p.duracionBajaDias);
    totalComplementoEmpresa = r(complementoDiario * p.duracionBajaDias);
    advertencias.push('Accidente de trabajo: los días 1-3 la empresa abona el 75% BR directamente (sin período de espera). Desde el día 4 lo paga la Mutua/INSS y el empresario lo anticipa y cobra después.');
  }

  const totalCobradoTrabajador = r(totalPrestacionSS + totalComplementoEmpresa);
  const totalSalarioSiTrabajara = r(salarioDiarioReal * p.duracionBajaDias);
  const brechaEconomicaTrabajador = r(totalSalarioSiTrabajara - totalCobradoTrabajador);
  const costeTotalEmpresa = r(totalComplementoEmpresa); // La empresa recupera la prestación SS que adelanta

  advertencias.push('El complemento de IT es obligatorio solo si lo exige el convenio colectivo o un acuerdo individual. Sin convenio, la empresa puede abonar solo la prestación SS.');
  advertencias.push('La prestación SS tributa en IRPF como rendimiento del trabajo, sujeta a retención. El complemento empresarial también tributa y cotiza a la SS.');
  advertencias.push('La base reguladora diaria se calcula dividiendo la base de cotización del mes anterior entre el nº de días de ese mes. En la práctica, el INSS usa datos reales del sistema RED.');

  return {
    tipoContingencia: p.tipoContingencia,
    salarioBrutoMensual: r(p.salarioBrutoMensual),
    baseReguladoraDiaria,
    salarioDiarioReal,
    duracionBajaDias: p.duracionBajaDias,
    pctComplementoEmpresa: p.pctComplementoEmpresa,
    detallesPeriodos,
    totalPrestacionSS: r(totalPrestacionSS),
    totalComplementoEmpresa: r(totalComplementoEmpresa),
    totalCobradoTrabajador,
    totalSalarioSiTrabajara,
    brechaEconomicaTrabajador,
    costeTotalEmpresa,
    advertencias,
    fuenteDatos: 'LGSS arts. 169-176 + ET art. 45 — vigente 2025',
  };
}
