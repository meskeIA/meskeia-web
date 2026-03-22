/**
 * Calculadora de Plusvalías IRPF — lógica pura sin React ni DOM
 * Usada por: MCP server (calcular_plusvalias_irpf)
 *
 * Calcula el impacto fiscal de la venta de acciones, fondos u otros
 * activos patrimoniales según los tramos del ahorro IRPF 2025.
 *
 * Fuente: Ley 35/2006 IRPF arts. 33-39 + LPGE 2025
 */

import { FISCAL_IRPF_META } from '@/data/fiscal';

// ─── Tipos públicos ────────────────────────────────────────────────────────────

// Tramos base del ahorro 2025 (Ley 35/2006 art. 66 + LPGE 2025)
const TRAMOS_AHORRO_2025 = [
  { hasta: 6000,     tipo: 19 },
  { hasta: 50000,    tipo: 21 },
  { hasta: 200000,   tipo: 23 },
  { hasta: 300000,   tipo: 27 },
  { hasta: Infinity, tipo: 30 },
];

export type TipoActivo = 'acciones' | 'fondos' | 'inmueble' | 'otro';

export interface ParametrosPlusvaliasIRPF {
  /** Precio de compra del activo (€) */
  precioCompra: number;
  /** Gastos de compra (comisiones, notaría si inmueble, etc.) (€) */
  gastosCompra?: number;
  /** Precio de venta del activo (€) */
  precioVenta: number;
  /** Gastos de venta (comisiones, notaría, etc.) (€) */
  gastosVenta?: number;
  /** Fecha de compra (YYYY-MM-DD) */
  fechaCompra: string;
  /** Fecha de venta (YYYY-MM-DD) */
  fechaVenta: string;
  /** Tipo de activo */
  tipoActivo?: TipoActivo;
  /** Plusvalías/minusvalías previas del ejercicio a compensar (€) */
  saldoCompensacion?: number;
}

export interface TramoDetallePlusvalia {
  desde: number;
  hasta: number;
  tipo: number;
  cuota: number;
}

export interface ResultadoPlusvaliasIRPF {
  /** Ganancia/pérdida bruta antes de gastos */
  diferenciaPrecios: number;
  /** Precio de adquisición total (compra + gastos) */
  precioAdquisicion: number;
  /** Precio de transmisión total (venta - gastos) */
  precioTransmision: number;
  /** Ganancia/pérdida patrimonial neta */
  gananciaNeta: number;
  /** ¿Ganancia (true) o pérdida (false)? */
  esGanancia: boolean;
  /** ¿Largo plazo? (>12 meses) */
  esLargoPlazo: boolean;
  /** Días transcurridos */
  diasTranscurridos: number;
  /** Saldo a compensar aplicado */
  saldoCompensado: number;
  /** Base liquidable del ahorro (ganancia - compensación) */
  baseLiquidable: number;
  /** Cuota IRPF sobre la ganancia */
  cuotaIRPF: number;
  /** Tipo efectivo sobre la ganancia (%) */
  tipoEfectivo: number;
  /** Ganancia neta después de impuestos */
  gananciaNeta_DI: number;
  /** Rentabilidad neta de impuestos (%) */
  rentabilidadNetaImpuestos: number;
  /** Desglose por tramos */
  desglose: TramoDetallePlusvalia[];
  /** Fuente normativa */
  fuenteDatos: string;
}

// ─── Función principal ─────────────────────────────────────────────────────────

export function calcularPlusvaliasIRPF(p: ParametrosPlusvaliasIRPF): ResultadoPlusvaliasIRPF {
  if (p.precioCompra <= 0) throw new Error('El precio de compra debe ser mayor que cero.');
  if (p.precioVenta <= 0) throw new Error('El precio de venta debe ser mayor que cero.');

  const r = (n: number) => Math.round(n * 100) / 100;

  const gastosCompra = p.gastosCompra ?? 0;
  const gastosVenta = p.gastosVenta ?? 0;
  const saldoCompensacion = p.saldoCompensacion ?? 0;

  const precioAdquisicion = r(p.precioCompra + gastosCompra);
  const precioTransmision = r(p.precioVenta - gastosVenta);
  const gananciaNeta = r(precioTransmision - precioAdquisicion);
  const diferenciaPrecios = r(p.precioVenta - p.precioCompra);
  const esGanancia = gananciaNeta > 0;

  // Duración
  const fechaC = new Date(p.fechaCompra);
  const fechaV = new Date(p.fechaVenta);
  if (isNaN(fechaC.getTime()) || isNaN(fechaV.getTime())) throw new Error('Fechas no válidas. Usar formato YYYY-MM-DD.');
  if (fechaV <= fechaC) throw new Error('La fecha de venta debe ser posterior a la de compra.');
  const diasTranscurridos = Math.floor((fechaV.getTime() - fechaC.getTime()) / (1000 * 60 * 60 * 24));
  const esLargoPlazo = diasTranscurridos > 365;

  let cuotaIRPF = 0;
  let baseLiquidable = 0;
  const desglose: TramoDetallePlusvalia[] = [];

  if (esGanancia) {
    const saldoCompensado = Math.min(saldoCompensacion, gananciaNeta);
    baseLiquidable = r(gananciaNeta - saldoCompensado);

    // Las ganancias a largo plazo tributan en la base del ahorro
    // Las de corto plazo también van a la base del ahorro (art. 49 LIRPF)
    let baseAnterior = 0;
    for (const tramo of TRAMOS_AHORRO_2025) {
      if (baseLiquidable <= baseAnterior) break;
      const baseEnTramo = Math.min(baseLiquidable, tramo.hasta) - baseAnterior;
      const cuotaTramo = r(baseEnTramo * (tramo.tipo / 100));
      cuotaIRPF += cuotaTramo;
      desglose.push({
        desde: baseAnterior,
        hasta: Math.min(baseLiquidable, tramo.hasta),
        tipo: tramo.tipo,
        cuota: cuotaTramo,
      });
      baseAnterior = tramo.hasta;
    }
    cuotaIRPF = r(cuotaIRPF);
  }

  const saldoCompensado = esGanancia ? Math.min(saldoCompensacion, gananciaNeta) : 0;
  const tipoEfectivo = gananciaNeta > 0 ? r((cuotaIRPF / gananciaNeta) * 100) : 0;
  const gananciaNeta_DI = r(gananciaNeta - cuotaIRPF);
  const rentabilidadNetaImpuestos = precioAdquisicion > 0
    ? r((gananciaNeta_DI / precioAdquisicion) * 100)
    : 0;

  return {
    diferenciaPrecios,
    precioAdquisicion,
    precioTransmision,
    gananciaNeta,
    esGanancia,
    esLargoPlazo,
    diasTranscurridos,
    saldoCompensado,
    baseLiquidable,
    cuotaIRPF,
    tipoEfectivo,
    gananciaNeta_DI,
    rentabilidadNetaImpuestos,
    desglose,
    fuenteDatos: `${FISCAL_IRPF_META.fuente} — verificado ${FISCAL_IRPF_META.verificado}`,
  };
}
