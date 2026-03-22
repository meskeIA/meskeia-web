/**
 * Calculadora de Amortización Anticipada de Hipoteca — lógica pura sin React ni DOM
 * Usada por: MCP server (calcular_amortizacion_anticipada)
 *
 * Compara las dos opciones tras amortizar capital:
 *   1. Reducir cuota (misma duración, cuota menor)
 *   2. Reducir plazo (misma cuota, terminar antes)
 *
 * Usa el sistema de amortización francés (cuota constante).
 */

// ─── Tipos públicos ────────────────────────────────────────────────────────────

export interface ParametrosAmortizacion {
  /** Capital original del préstamo (€) */
  capitalInicial: number;
  /** Plazo original en años */
  plazoAnios: number;
  /** TIN anual (%) */
  tin: number;
  /** Importe a amortizar anticipadamente (€) */
  importeAmortizacion: number;
  /**
   * Meses transcurridos desde el inicio hasta el momento de la amortización.
   * Alternativa a fechaInicio + fechaAmortizacion.
   */
  mesesTranscurridos?: number;
  /** Fecha de inicio del préstamo (YYYY-MM-DD). Se usa si mesesTranscurridos no se proporciona. */
  fechaInicio?: string;
  /** Fecha de la amortización anticipada (YYYY-MM-DD) */
  fechaAmortizacion?: string;
}

export interface ResultadoAmortizacion {
  /** Capital inicial */
  capitalInicial: number;
  /** Saldo pendiente antes de amortizar */
  saldoAntes: number;
  /** Saldo pendiente después de amortizar */
  saldoDespues: number;
  /** Cuota original (€/mes) */
  cuotaOriginal: number;
  /** Meses restantes antes de amortizar */
  plazoRestanteMeses: number;
  /** Meses transcurridos hasta la amortización */
  mesesTranscurridos: number;

  // Opción 1: Reducir cuota
  /** Nueva cuota mensual (misma duración) */
  nuevaCuota: number;
  /** Reducción de cuota respecto a la original */
  reduccionCuota: number;
  /** Ahorro en intereses con opción reducir cuota */
  ahorroInteresesCuota: number;

  // Opción 2: Reducir plazo
  /** Nuevo plazo en meses (misma cuota) */
  nuevoPlazoMeses: number;
  /** Reducción de meses respecto al plazo restante */
  reduccionMeses: number;
  /** Ahorro en intereses con opción reducir plazo */
  ahorroInteresesPlazo: number;

  /** Total intereses que quedarían sin amortizar */
  totalInteresesSinAmortizar: number;

  /** Recomendación entre las dos opciones */
  recomendacion: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function cuotaMensual(capital: number, rMes: number, n: number): number {
  if (n <= 0) return 0;
  if (rMes === 0) return capital / n;
  return capital * rMes * Math.pow(1 + rMes, n) / (Math.pow(1 + rMes, n) - 1);
}

function saldoPendiente(capitalInicial: number, rMes: number, cuota: number, mesesTransc: number): number {
  if (rMes === 0) return Math.max(0, capitalInicial - cuota * mesesTransc);
  const factor = Math.pow(1 + rMes, mesesTransc);
  return capitalInicial * factor - cuota * (factor - 1) / rMes;
}

function mesesParaSaldar(saldo: number, rMes: number, cuota: number): number {
  if (rMes === 0) return Math.ceil(saldo / cuota);
  if (cuota <= saldo * rMes) return Infinity;
  return Math.ceil(Math.log(cuota / (cuota - saldo * rMes)) / Math.log(1 + rMes));
}

function totalIntereses(capital: number, rMes: number, n: number): number {
  const c = cuotaMensual(capital, rMes, n);
  return c * n - capital;
}

// ─── Función principal ─────────────────────────────────────────────────────────

export function calcularAmortizacionAnticipada(p: ParametrosAmortizacion): ResultadoAmortizacion {
  if (p.capitalInicial <= 0) throw new Error('El capital inicial debe ser mayor que cero.');
  if (p.plazoAnios <= 0 || p.plazoAnios > 40) throw new Error('El plazo debe estar entre 1 y 40 años.');
  if (p.tin < 0 || p.tin > 30) throw new Error('El TIN debe estar entre 0 y 30%.');
  if (p.importeAmortizacion <= 0) throw new Error('El importe a amortizar debe ser mayor que cero.');

  const r = (n: number) => Math.round(n * 100) / 100;
  const rMes = p.tin / 100 / 12;
  const plazoTotalMeses = p.plazoAnios * 12;
  const cuotaOrig = cuotaMensual(p.capitalInicial, rMes, plazoTotalMeses);

  // Calcular meses transcurridos
  let mesesTransc: number;
  if (p.mesesTranscurridos !== undefined) {
    mesesTransc = Math.max(0, Math.floor(p.mesesTranscurridos));
  } else if (p.fechaInicio && p.fechaAmortizacion) {
    const inicio = new Date(p.fechaInicio);
    const amort = new Date(p.fechaAmortizacion);
    mesesTransc = Math.max(0, (amort.getFullYear() - inicio.getFullYear()) * 12 + (amort.getMonth() - inicio.getMonth()));
  } else {
    throw new Error('Proporciona mesesTranscurridos o fechaInicio + fechaAmortizacion.');
  }

  if (mesesTransc >= plazoTotalMeses) throw new Error('Los meses transcurridos superan el plazo total del préstamo.');

  const saldoAntes = r(Math.max(0, saldoPendiente(p.capitalInicial, rMes, cuotaOrig, mesesTransc)));
  if (p.importeAmortizacion >= saldoAntes) throw new Error('El importe a amortizar no puede ser mayor o igual al saldo pendiente.');

  const saldoDespues = r(saldoAntes - p.importeAmortizacion);
  const plazoRestante = plazoTotalMeses - mesesTransc;

  // Opción 1: Reducir cuota (mismo plazo restante)
  const nuevaCuota = r(cuotaMensual(saldoDespues, rMes, plazoRestante));
  const reduccionCuota = r(cuotaOrig - nuevaCuota);
  const interesesSinAmort = r(totalIntereses(saldoAntes, rMes, plazoRestante));
  const interesesConNuevaCuota = r(nuevaCuota * plazoRestante - saldoDespues);
  const ahorroInteresesCuota = r(interesesSinAmort - interesesConNuevaCuota);

  // Opción 2: Reducir plazo (misma cuota)
  const nuevoPlazoMeses = mesesParaSaldar(saldoDespues, rMes, cuotaOrig);
  const reduccionMeses = plazoRestante - nuevoPlazoMeses;
  const interesesConMismaCuota = r(cuotaOrig * nuevoPlazoMeses - saldoDespues);
  const ahorroInteresesPlazo = r(interesesSinAmort - interesesConMismaCuota);

  const recomendacion = ahorroInteresesPlazo >= ahorroInteresesCuota
    ? `Reducir plazo ahorra ${r(ahorroInteresesPlazo - ahorroInteresesCuota).toLocaleString('es-ES')} € más en intereses y terminas ${reduccionMeses} meses antes.`
    : `Reducir cuota ahorra ${r(ahorroInteresesCuota - ahorroInteresesPlazo).toLocaleString('es-ES')} € más y reduce tu cuota mensual en ${reduccionCuota.toLocaleString('es-ES')} €.`;

  return {
    capitalInicial: p.capitalInicial,
    saldoAntes,
    saldoDespues,
    cuotaOriginal: r(cuotaOrig),
    plazoRestanteMeses: plazoRestante,
    mesesTranscurridos: mesesTransc,
    nuevaCuota,
    reduccionCuota,
    ahorroInteresesCuota,
    nuevoPlazoMeses,
    reduccionMeses,
    ahorroInteresesPlazo,
    totalInteresesSinAmortizar: interesesSinAmort,
    recomendacion,
  };
}
