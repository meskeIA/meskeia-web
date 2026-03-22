/**
 * Calculadora de Estrategia de Deuda — lógica pura sin React ni DOM
 * Usada por: MCP server (calcular_estrategia_deuda)
 *
 * Compara los métodos Avalancha y Bola de Nieve para pagar múltiples deudas,
 * con soporte para pagos extra mensuales.
 *
 * Fuente: app/estimador-deuda — métodos estándar de gestión de deuda personal
 */

// ─── Tipos públicos ────────────────────────────────────────────────────────────

export interface DeudaInput {
  /** Nombre identificativo de la deuda (ej: "Tarjeta VISA", "Préstamo coche") */
  nombre: string;
  /** Saldo pendiente actual (€) */
  saldo: number;
  /** Tipo de interés anual (%) */
  tasaInteres: number;
  /** Pago mínimo mensual (€) */
  pagoMinimo: number;
}

export interface ResultadoDeuda {
  /** Nombre de la deuda */
  nombre: string;
  /** Saldo inicial (€) */
  saldoInicial: number;
  /** Intereses totales pagados hasta liquidarla (€) */
  interesesTotales: number;
  /** Meses hasta liquidar esta deuda */
  mesesParaPagar: number;
  /** Orden de liquidación (1 = primera en pagarse) */
  orden: number;
}

export interface ResultadoMetodo {
  /** Nombre del método */
  nombre: 'Avalancha' | 'Bola de Nieve' | 'Solo mínimos';
  /** Descripción del método */
  descripcion: string;
  /** Total intereses pagados (€) */
  totalIntereses: number;
  /** Meses hasta liquidar toda la deuda */
  mesesTotales: number;
  /** Detalle por deuda */
  deudas: ResultadoDeuda[];
  /** Ahorro en intereses vs pago solo con mínimos (€) */
  ahorroVsMinimo: number;
}

export interface ParametrosEstrategiaDeuda {
  /** Lista de deudas a analizar (mínimo 1, máximo 10) */
  deudas: DeudaInput[];
  /** Pago extra mensual adicional sobre los mínimos (€). Por defecto 0 */
  pagoExtraMensual?: number;
}

export interface ResultadoEstrategiaDeuda {
  /** Método Avalancha (paga primero la deuda con mayor interés) */
  avalancha: ResultadoMetodo;
  /** Método Bola de Nieve (paga primero la deuda con menor saldo) */
  bolaNieve: ResultadoMetodo;
  /** Solo pagos mínimos (sin pago extra) */
  soloMinimos: ResultadoMetodo;
  /** Método recomendado (menor carga de intereses) */
  metodoRecomendado: 'Avalancha' | 'Bola de Nieve';
  /** Diferencia de intereses entre métodos (€) */
  diferenciaEntreMetodos: number;
  /** Total de deuda actual (€) */
  totalDeuda: number;
  /** Pago mínimo total mensual (€) */
  pagoMinimoTotal: number;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

interface DeudaSimulacion {
  nombre: string;
  saldo: number;
  saldoActual: number;
  tasa: number;
  minimo: number;
  interesesPagados: number;
  meses: number;
}

function simularPago(
  deudasOrdenadas: DeudaInput[],
  pagoExtra: number,
): ResultadoDeuda[] {
  const resultados: ResultadoDeuda[] = [];
  const saldos: DeudaSimulacion[] = deudasOrdenadas.map(d => ({
    nombre: d.nombre,
    saldo: d.saldo,
    saldoActual: d.saldo,
    tasa: d.tasaInteres,
    minimo: d.pagoMinimo,
    interesesPagados: 0,
    meses: 0,
  }));

  let orden = 1;
  let mesesGlobales = 0;
  const maxMeses = 360; // 30 años máximo

  while (saldos.some(s => s.saldoActual > 0.01) && mesesGlobales < maxMeses) {
    mesesGlobales++;

    // Aplicar intereses mensuales
    for (const s of saldos) {
      if (s.saldoActual > 0) {
        const interesMensual = (s.saldoActual * (s.tasa / 100)) / 12;
        s.interesesPagados += interesMensual;
        s.saldoActual += interesMensual;
      }
    }

    // Pagar mínimos
    for (const s of saldos) {
      if (s.saldoActual > 0) {
        const pagoMin = Math.min(s.minimo, s.saldoActual);
        s.saldoActual -= pagoMin;
        s.meses = mesesGlobales;
      }
    }

    // Aplicar pago extra a la primera deuda con saldo (según orden)
    let pagoDisponible = pagoExtra;
    for (const s of saldos) {
      if (s.saldoActual > 0 && pagoDisponible > 0) {
        const pagoAplicado = Math.min(pagoDisponible, s.saldoActual);
        s.saldoActual -= pagoAplicado;
        pagoDisponible -= pagoAplicado;
        s.meses = mesesGlobales;
        break;
      }
    }

    // Registrar deudas liquidadas
    for (const s of saldos) {
      if (s.saldoActual <= 0.01 && !resultados.find(r => r.nombre === s.nombre)) {
        resultados.push({
          nombre: s.nombre,
          saldoInicial: s.saldo,
          interesesTotales: Math.round(s.interesesPagados * 100) / 100,
          mesesParaPagar: mesesGlobales,
          orden: orden++,
        });
      }
    }
  }

  return resultados;
}

// ─── Función principal ─────────────────────────────────────────────────────────

export function calcularEstrategiaDeuda(p: ParametrosEstrategiaDeuda): ResultadoEstrategiaDeuda {
  if (p.deudas.length === 0) throw new Error('Debe haber al menos una deuda.');
  if (p.deudas.length > 10) throw new Error('Máximo 10 deudas por cálculo.');
  for (const d of p.deudas) {
    if (d.saldo <= 0) throw new Error(`El saldo de "${d.nombre}" debe ser mayor que cero.`);
    if (d.pagoMinimo <= 0) throw new Error(`El pago mínimo de "${d.nombre}" debe ser mayor que cero.`);
    if (d.tasaInteres < 0) throw new Error(`La tasa de interés de "${d.nombre}" no puede ser negativa.`);
  }

  const r = (n: number) => Math.round(n * 100) / 100;
  const pagoExtra = p.pagoExtraMensual ?? 0;

  // Método Avalancha: mayor tasa primero
  const ordenAvalancha = [...p.deudas].sort((a, b) => b.tasaInteres - a.tasaInteres);
  const resultAvalancha = simularPago(ordenAvalancha, pagoExtra);

  // Método Bola de Nieve: menor saldo primero
  const ordenBolaNieve = [...p.deudas].sort((a, b) => a.saldo - b.saldo);
  const resultBolaNieve = simularPago(ordenBolaNieve, pagoExtra);

  // Solo mínimos (sin pago extra)
  const resultSoloMinimos = simularPago(p.deudas, 0);

  const totalInteresAvalancha = r(resultAvalancha.reduce((s, d) => s + d.interesesTotales, 0));
  const totalInteresBolaNieve = r(resultBolaNieve.reduce((s, d) => s + d.interesesTotales, 0));
  const totalInteresSoloMinimos = r(resultSoloMinimos.reduce((s, d) => s + d.interesesTotales, 0));

  const mesesAvalancha = resultAvalancha.length > 0 ? Math.max(...resultAvalancha.map(d => d.mesesParaPagar)) : 0;
  const mesesBolaNieve = resultBolaNieve.length > 0 ? Math.max(...resultBolaNieve.map(d => d.mesesParaPagar)) : 0;
  const mesesSoloMinimos = resultSoloMinimos.length > 0 ? Math.max(...resultSoloMinimos.map(d => d.mesesParaPagar)) : 0;

  const avalancha: ResultadoMetodo = {
    nombre: 'Avalancha',
    descripcion: 'Paga primero las deudas con mayor interés. Matemáticamente óptimo: menos intereses totales.',
    totalIntereses: totalInteresAvalancha,
    mesesTotales: mesesAvalancha,
    deudas: resultAvalancha,
    ahorroVsMinimo: r(totalInteresSoloMinimos - totalInteresAvalancha),
  };

  const bolaNieve: ResultadoMetodo = {
    nombre: 'Bola de Nieve',
    descripcion: 'Paga primero las deudas más pequeñas. Más victorias rápidas y mayor motivación psicológica.',
    totalIntereses: totalInteresBolaNieve,
    mesesTotales: mesesBolaNieve,
    deudas: resultBolaNieve,
    ahorroVsMinimo: r(totalInteresSoloMinimos - totalInteresBolaNieve),
  };

  const soloMinimos: ResultadoMetodo = {
    nombre: 'Solo mínimos',
    descripcion: 'Solo los pagos mínimos, sin aportación extra.',
    totalIntereses: totalInteresSoloMinimos,
    mesesTotales: mesesSoloMinimos,
    deudas: resultSoloMinimos,
    ahorroVsMinimo: 0,
  };

  const metodoRecomendado: 'Avalancha' | 'Bola de Nieve' =
    totalInteresAvalancha <= totalInteresBolaNieve ? 'Avalancha' : 'Bola de Nieve';

  return {
    avalancha,
    bolaNieve,
    soloMinimos,
    metodoRecomendado,
    diferenciaEntreMetodos: r(Math.abs(totalInteresAvalancha - totalInteresBolaNieve)),
    totalDeuda: r(p.deudas.reduce((s, d) => s + d.saldo, 0)),
    pagoMinimoTotal: r(p.deudas.reduce((s, d) => s + d.pagoMinimo, 0)),
  };
}
