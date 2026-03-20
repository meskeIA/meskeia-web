/**
 * Simulador de interés compuesto — lógica pura sin React ni DOM
 * Usada por: asistente conversacional, MCP server
 */

export type FrecuenciaCapitalizacion = 'anual' | 'semestral' | 'trimestral' | 'mensual';

export interface ParametrosInteresCompuesto {
  capitalInicial: number;
  tasaAnual: number;          // porcentaje, ej: 7 para 7%
  anos: number;
  aportacionPeriodica?: number;       // aportación adicional periódica (por defecto 0)
  frecuenciaCapitalizacion?: FrecuenciaCapitalizacion; // por defecto 'anual'
}

export interface ResultadoInteresCompuesto {
  capitalFinal: number;
  totalAportado: number;    // capital inicial + todas las aportaciones
  totalIntereses: number;
  rentabilidadPct: number;  // intereses / totalAportado * 100
}

const PERIODOS_POR_ANO: Record<FrecuenciaCapitalizacion, number> = {
  anual: 1,
  semestral: 2,
  trimestral: 4,
  mensual: 12,
};

export function calcularInteresCompuesto(p: ParametrosInteresCompuesto): ResultadoInteresCompuesto {
  if (p.capitalInicial < 0) throw new Error('El capital inicial no puede ser negativo.');
  if (p.tasaAnual < 0 || p.tasaAnual > 100) throw new Error('La tasa anual debe estar entre 0 y 100.');
  if (p.anos <= 0 || p.anos > 100) throw new Error('El número de años debe estar entre 1 y 100.');

  const tasa = p.tasaAnual / 100;
  const aportacion = p.aportacionPeriodica ?? 0;
  const frecuencia = p.frecuenciaCapitalizacion ?? 'anual';
  const n = PERIODOS_POR_ANO[frecuencia];
  const tasaPeriodo = tasa / n;

  // Aportaciones distribuidas por período de capitalización
  const aportacionAnual = aportacion * 12; // asumimos aportación mensual
  const aportacionPorPeriodo = aportacionAnual / n;

  let capitalActual = p.capitalInicial;
  let totalAportaciones = p.capitalInicial;

  for (let ano = 1; ano <= p.anos; ano++) {
    for (let periodo = 0; periodo < n; periodo++) {
      capitalActual *= (1 + tasaPeriodo);
      if (aportacion > 0) {
        capitalActual += aportacionPorPeriodo;
      }
    }
    totalAportaciones += aportacionAnual;
  }

  const totalIntereses = capitalActual - totalAportaciones;
  const rentabilidadPct = totalAportaciones > 0
    ? (totalIntereses / totalAportaciones) * 100
    : 0;

  return {
    capitalFinal: Math.round(capitalActual * 100) / 100,
    totalAportado: Math.round(totalAportaciones * 100) / 100,
    totalIntereses: Math.round(totalIntereses * 100) / 100,
    rentabilidadPct: Math.round(rentabilidadPct * 10) / 10,
  };
}
