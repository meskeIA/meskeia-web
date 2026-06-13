/**
 * Calculadora de Subsidio por Incapacidad Temporal (Baja Médica) — lógica pura sin React ni DOM
 * Usada por: MCP server (calcular_baja_medica)
 *
 * Calcula el subsidio diario y mensual estimado durante una baja médica
 * para trabajadores por cuenta ajena (LGSS arts. 169-176).
 *
 * Contingencias:
 * - Enfermedad común / accidente no laboral: 60% BC días 4-20, 75% BC día 21+
 * - Accidente de trabajo / enfermedad profesional: 75% BC desde día 1
 *
 * Fuente: LGSS arts. 169-176 + Real Decreto 1430/2009 + bases de cotización 2026 (Orden PJC/297/2026)
 */

import { BASES_SS_2026 } from '@/data/fiscal';

// ─── Tipos públicos ────────────────────────────────────────────────────────────

export type TipoBaja = 'comun' | 'accidente_laboral';

export interface ParametrosBajaMedica {
  /** Salario bruto mensual (€). Se usa para calcular la base de cotización diaria. */
  salarioBrutoMensual: number;
  /** Tipo de baja: "comun" (enfermedad/accidente no laboral) o "accidente_laboral" */
  tipoBaja: TipoBaja;
  /** Número de días de baja a simular. Por defecto 30. */
  diasBaja?: number;
  /**
   * ¿La empresa paga los 3 primeros días de espera?
   * (Varía según convenio colectivo; por defecto false = INSS no cubre días 1-3)
   */
  empresaPagaDiasEspera?: boolean;
}

export interface ResultadoBajaMedica {
  /** Tipo de baja */
  tipoBaja: TipoBaja;
  /** Días de baja simulados */
  diasBaja: number;
  /** Base de cotización diaria (salario bruto mensual / 30) (€) */
  baseCotizacionDiaria: number;
  /** % aplicado en el período de baja (60% o 75%) */
  porcentajeFase1: number;
  /** % aplicado a partir del día 21 (solo contingencias comunes) */
  porcentajeFase2: number;
  /** Subsidio diario en fase 1 (€) */
  subsidioDiarioFase1: number;
  /** Subsidio diario en fase 2 (€) */
  subsidioDiarioFase2: number;
  /** Días sin cobrar (espera) */
  diasEspera: number;
  /** Total subsidio durante los días de baja (€) */
  totalSubsidio: number;
  /** Subsidio mensual equivalente (€) */
  subsidioMensualEquivalente: number;
  /** Salario neto estimado que se pierde respecto al salario habitual (€) */
  perdidaEstimada: number;
  /** Desglose por períodos */
  desglose: { periodo: string; dias: number; pct: number; importeDiario: number; total: number }[];
}

// ─── Función principal ─────────────────────────────────────────────────────────

export function calcularBajaMedica(p: ParametrosBajaMedica): ResultadoBajaMedica {
  if (p.salarioBrutoMensual <= 0) throw new Error('El salario bruto mensual debe ser mayor que cero.');
  const diasBaja = p.diasBaja ?? 30;
  if (diasBaja < 1 || diasBaja > 730) throw new Error('Los días de baja deben estar entre 1 y 730.');

  const r = (n: number) => Math.round(n * 100) / 100;
  const empresaPagaDiasEspera = p.empresaPagaDiasEspera ?? false;

  // Base de cotización diaria: salario bruto mensual / 30
  // Clamped entre mínimo y máximo SS
  const salerioMensual = p.salarioBrutoMensual;
  const baseMensualClamp = Math.min(Math.max(salerioMensual, BASES_SS_2026.minima), BASES_SS_2026.maxima);
  const baseCotizacionDiaria = r(baseMensualClamp / 30);

  const desglose: { periodo: string; dias: number; pct: number; importeDiario: number; total: number }[] = [];
  let totalSubsidio = 0;

  if (p.tipoBaja === 'accidente_laboral') {
    // Accidente laboral: 75% desde el día 1 (la empresa cubre el día del accidente)
    const pct = 75;
    const diario = r(baseCotizacionDiaria * (pct / 100));
    const total = r(diario * diasBaja);
    totalSubsidio = total;
    desglose.push({ periodo: `Día 1-${diasBaja} (accidente laboral)`, dias: diasBaja, pct, importeDiario: diario, total });

    return {
      tipoBaja: p.tipoBaja,
      diasBaja,
      baseCotizacionDiaria,
      porcentajeFase1: pct,
      porcentajeFase2: pct,
      subsidioDiarioFase1: diario,
      subsidioDiarioFase2: diario,
      diasEspera: 0,
      totalSubsidio: total,
      subsidioMensualEquivalente: r(diario * 30),
      perdidaEstimada: r(salerioMensual - r(diario * 30)),
      desglose,
    };
  }

  // Contingencia común: días 1-3 de espera (no cubre INSS salvo convenio)
  const diasEspera = empresaPagaDiasEspera ? 0 : Math.min(3, diasBaja);

  if (diasEspera > 0 && !empresaPagaDiasEspera) {
    desglose.push({ periodo: 'Días 1-3 (espera, sin subsidio INSS)', dias: diasEspera, pct: 0, importeDiario: 0, total: 0 });
  }

  // Días 4-20: 60% BC
  const diasFase1 = Math.max(0, Math.min(diasBaja, 20) - 3);
  if (diasFase1 > 0) {
    const diario = r(baseCotizacionDiaria * 0.60);
    const total = r(diario * diasFase1);
    totalSubsidio += total;
    desglose.push({ periodo: `Días 4-${Math.min(diasBaja, 20)} (60% BC)`, dias: diasFase1, pct: 60, importeDiario: diario, total });
  }

  // Días 21+: 75% BC
  const diasFase2 = Math.max(0, diasBaja - 20);
  if (diasFase2 > 0) {
    const diario = r(baseCotizacionDiaria * 0.75);
    const total = r(diario * diasFase2);
    totalSubsidio += total;
    desglose.push({ periodo: `Días 21-${diasBaja} (75% BC)`, dias: diasFase2, pct: 75, importeDiario: diario, total });
  }

  totalSubsidio = r(totalSubsidio);
  const subsidioMensualEquivalente = r((totalSubsidio / diasBaja) * 30);

  return {
    tipoBaja: p.tipoBaja,
    diasBaja,
    baseCotizacionDiaria,
    porcentajeFase1: 60,
    porcentajeFase2: 75,
    subsidioDiarioFase1: r(baseCotizacionDiaria * 0.60),
    subsidioDiarioFase2: r(baseCotizacionDiaria * 0.75),
    diasEspera,
    totalSubsidio,
    subsidioMensualEquivalente,
    perdidaEstimada: r(salerioMensual - subsidioMensualEquivalente),
    desglose,
  };
}
