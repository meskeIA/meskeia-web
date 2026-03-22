/**
 * Calculadora de Ganancias y Pérdidas Patrimoniales en Criptomonedas — lógica pura
 * Usada por: MCP server (calcular_ganancia_criptomonedas)
 *
 * Calcula la ganancia o pérdida patrimonial derivada de la transmisión de
 * criptomonedas a efectos del IRPF, aplicando las reglas específicas del
 * tratamiento fiscal de los activos digitales en España.
 *
 * Marco normativo:
 *   - LIRPF art. 37.1.v (introducido por Ley 11/2021): transmisión de moneda virtual
 *   - LIRPF arts. 33-37: ganancias y pérdidas patrimoniales
 *   - LIRPF art. 14.2.j: imputación temporal (cuando se devengan)
 *   - Consultas DGT V1748-21, V0999-18, V1604-18
 *   - Ley 11/2021 (lucha contra el fraude fiscal): obligaciones de información cripto
 *
 * REGLAS ESPECÍFICAS CRIPTO (LIRPF art. 37.1.v):
 *   1. Identificación de activos: FIFO (First In, First Out) obligatorio.
 *      Los primeros adquiridos son los primeros vendidos.
 *   2. Valor de adquisición: precio de compra + gastos y comisiones de adquisición.
 *   3. Valor de transmisión: precio de venta – gastos y comisiones de venta.
 *   4. Ganancia/pérdida = Valor transmisión – Valor adquisición (ambos en €).
 *   5. Si se recibe cripto como pago: valor de mercado en la fecha del cobro.
 *   6. Permuta entre criptomonedas: también tributa (valor de mercado en la fecha).
 *   7. Mining / staking / airdrops: rendimiento del capital mobiliario o de actividades
 *      económicas (no ganancia patrimonial) — NO calculado aquí.
 *
 * ESCALA DEL AHORRO 2025 (donde tributan las G/P patrimoniales):
 *   - Hasta 6.000 €: 19%
 *   - De 6.000 € a 50.000 €: 21%
 *   - De 50.000 € a 200.000 €: 23%
 *   - De 200.000 € a 300.000 €: 27%
 *   - Más de 300.000 €: 28%
 *
 * COMPENSACIÓN DE PÉRDIDAS:
 *   Las pérdidas de criptomonedas compensan ganancias patrimoniales de la base del ahorro.
 *   El saldo negativo puede compensarse con el 25% del saldo positivo de rendimientos
 *   del capital mobiliario (intereses, dividendos) del mismo período.
 *   Si queda saldo negativo, compensar en los 4 ejercicios siguientes.
 *
 * Fuente: LIRPF art. 37.1.v + Consultas DGT — vigente 2025
 * Verificado: 2025-01-15
 *
 * Encadenable con: calcular_irpf, calcular_plusvalias_irpf, calcular_declaracion_conjunta
 */

// ─── Constantes ────────────────────────────────────────────────────────────

// Escala del ahorro 2025 (ganancias patrimoniales)
const TRAMOS_AHORRO_2025: { hasta: number; tipo: number }[] = [
  { hasta: 6_000,   tipo: 19 },
  { hasta: 50_000,  tipo: 21 },
  { hasta: 200_000, tipo: 23 },
  { hasta: 300_000, tipo: 27 },
  { hasta: Infinity, tipo: 28 },
];

const PCT_COMPENSACION_RCM = 25; // % del saldo positivo RCM que puede compensar pérdidas

// ─── Tipos públicos ────────────────────────────────────────────────────────

export type TipoOperacionCripto =
  | 'venta'           // Venta de cripto a fiat (€, $...)
  | 'permuta'         // Cambio de una cripto por otra (BTC→ETH)
  | 'pago'            // Pago de bien/servicio con cripto
  | 'donacion';       // Donación de cripto (tributación especial)

export interface OperacionCripto {
  /** Descripción de la operación */
  descripcion?: string;
  /** Tipo de operación */
  tipoOperacion: TipoOperacionCripto;
  /** Número de unidades transmitidas */
  unidades: number;
  /** Precio/valor de adquisición por unidad en € (FIFO — el más antiguo) */
  precioAdquisicionUnitario: number;
  /** Gastos de adquisición totales (comisiones de compra) en € */
  gastosAdquisicion?: number;
  /** Precio/valor de transmisión por unidad en € (precio de venta o valor de mercado en permutas) */
  precioTransmisionUnitario: number;
  /** Gastos de transmisión totales (comisiones de venta) en € */
  gastosTransmision?: number;
}

export interface ParametrosGananciaCriptomonedas {
  /** Lista de operaciones de criptomonedas del período */
  operaciones: OperacionCripto[];
  /** Saldo positivo de rendimientos de capital mobiliario del período (€) — para calcular compensación */
  saldoPositivoRCM?: number;
  /** Tipo marginal IRPF del contribuyente (%) — solo informativo */
  tipoMarginalIRPF?: number;
}

export interface DetalleOperacionCripto {
  descripcion: string;
  tipoOperacion: TipoOperacionCripto;
  unidades: number;
  valorAdquisicion: number;
  valorTransmision: number;
  gananciaPerdida: number;
}

export interface ResultadoGananciaCriptomonedas {
  /** Desglose de cada operación */
  detalleOperaciones: DetalleOperacionCripto[];
  /** Total ganancias brutas del período (€) */
  totalGanancias: number;
  /** Total pérdidas brutas del período (€) — valor positivo */
  totalPerdidas: number;
  /** **Saldo neto de G/P patrimoniales (€)** — positivo=ganancia, negativo=pérdida */
  saldoNeto: number;
  /** Cuota tributaria estimada si saldo positivo (€) */
  cuotaTributaria: number;
  /** Si hay pérdidas: importe máximo compensable con RCM este período (€) */
  compensacionRCMPosible: number;
  /** Pérdida pendiente de compensar en ejercicios futuros (€) */
  perdidaPendienteCompensacion: number;
  /** Advertencias */
  advertencias: string[];
  /** Fuente normativa */
  fuenteDatos: string;
}

// ─── Función auxiliar: cuota escala del ahorro ────────────────────────────

function calcularCuotaAhorro(base: number): number {
  if (base <= 0) return 0;
  let cuota = 0;
  let baseRestante = base;
  let tramoAnterior = 0;

  for (const tramo of TRAMOS_AHORRO_2025) {
    const baseTramo = Math.min(baseRestante, tramo.hasta - tramoAnterior);
    cuota += baseTramo * tramo.tipo / 100;
    baseRestante -= baseTramo;
    tramoAnterior = tramo.hasta;
    if (baseRestante <= 0) break;
  }
  return cuota;
}

// ─── Función principal ─────────────────────────────────────────────────────

export function calcularGananciaCriptomonedas(
  p: ParametrosGananciaCriptomonedas
): ResultadoGananciaCriptomonedas {
  if (!p.operaciones || p.operaciones.length === 0) {
    throw new Error('Debe indicar al menos una operación.');
  }

  const r = (n: number) => Math.round(n * 100) / 100;
  const advertencias: string[] = [];

  const detalleOperaciones: DetalleOperacionCripto[] = [];
  let totalGanancias = 0;
  let totalPerdidas = 0;

  for (const op of p.operaciones) {
    const gastosAdq = op.gastosAdquisicion ?? 0;
    const gastosTransm = op.gastosTransmision ?? 0;

    const valorAdquisicion = r(op.unidades * op.precioAdquisicionUnitario + gastosAdq);
    const valorTransmision = r(op.unidades * op.precioTransmisionUnitario - gastosTransm);
    const gananciaPerdida = r(valorTransmision - valorAdquisicion);

    const descripcion = op.descripcion ?? `${op.tipoOperacion} ${op.unidades} unidades`;

    detalleOperaciones.push({
      descripcion,
      tipoOperacion: op.tipoOperacion,
      unidades: op.unidades,
      valorAdquisicion,
      valorTransmision,
      gananciaPerdida,
    });

    if (gananciaPerdida > 0) {
      totalGanancias += gananciaPerdida;
    } else {
      totalPerdidas += Math.abs(gananciaPerdida);
    }

    if (op.tipoOperacion === 'permuta') {
      advertencias.push(`Permuta: el intercambio de criptomonedas (incluido BTC→ETH u otras) es un hecho imponible en IRPF. El valor de transmisión es el valor de mercado en euros de la cripto recibida en la fecha de la operación.`);
    }
    if (op.tipoOperacion === 'donacion') {
      advertencias.push(`Donación de criptomonedas: el donante tributa por la diferencia entre el valor de mercado en la fecha de la donación y el valor de adquisición. El donatario adquiere al valor de mercado del momento de la donación (art. 36 LIRPF).`);
    }
  }

  totalGanancias = r(totalGanancias);
  totalPerdidas = r(totalPerdidas);
  const saldoNeto = r(totalGanancias - totalPerdidas);

  // Cuota tributaria si saldo positivo
  const cuotaTributaria = saldoNeto > 0 ? r(calcularCuotaAhorro(saldoNeto)) : 0;

  // Compensación si pérdidas
  const saldoPositivoRCM = p.saldoPositivoRCM ?? 0;
  const compensacionRCMPosible = saldoNeto < 0
    ? r(Math.min(Math.abs(saldoNeto), saldoPositivoRCM * PCT_COMPENSACION_RCM / 100))
    : 0;
  const perdidaPendienteCompensacion = saldoNeto < 0
    ? r(Math.abs(saldoNeto) - compensacionRCMPosible)
    : 0;

  // Advertencias generales
  advertencias.push('Regla FIFO obligatoria (LIRPF art. 37.1.v): los primeros tokens adquiridos son los primeros que se consideran transmitidos. Lleve un registro cronológico de todas las compras con precio y fecha para calcular correctamente el valor de adquisición.');
  advertencias.push('Las comisiones de compra aumentan el valor de adquisición (reducen la ganancia) y las comisiones de venta reducen el valor de transmisión. Conserve todos los justificantes de transacción (exchanges, wallets).');
  if (saldoNeto < 0) {
    advertencias.push(`Pérdida patrimonial: puede compensar hasta el ${PCT_COMPENSACION_RCM}% del saldo positivo de rendimientos del capital mobiliario (intereses, dividendos) del mismo período. El exceso compensa ganancias patrimoniales de los 4 ejercicios siguientes.`);
  }
  advertencias.push('Mining, staking y airdrops NO son ganancias patrimoniales: tributan como rendimientos del capital mobiliario (staking) o de actividades económicas (mining profesional). Esta calculadora solo cubre transmisiones.');
  advertencias.push('Obligación de información: Modelo 721 (desde 2023) para saldos en exchanges extranjeros >50.000€. Modelo 172/173 para exchanges nacionales. La AEAT cruza información con exchanges que operan en España.');

  return {
    detalleOperaciones,
    totalGanancias,
    totalPerdidas,
    saldoNeto,
    cuotaTributaria,
    compensacionRCMPosible,
    perdidaPendienteCompensacion,
    advertencias,
    fuenteDatos: 'LIRPF art. 37.1.v (Ley 11/2021) + Consultas DGT V1748-21 — vigente 2025',
  };
}
