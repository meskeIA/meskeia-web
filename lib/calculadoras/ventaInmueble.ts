/**
 * Calculadora de Costes de Venta de Inmueble — lógica pura sin React ni DOM
 * Usada por: MCP server (calcular_venta_inmueble)
 *
 * Calcula todos los costes e impuestos que asume el VENDEDOR al vender un
 * inmueble en España: plusvalía municipal (IIVTNU), IRPF sobre la ganancia
 * patrimonial, comisión inmobiliaria y gestorías.
 *
 * Fuente: RDL 26/2021 (IIVTNU) + Ley 35/2006 IRPF arts. 33-39 + LPGE 2025
 */

import {
  COEFICIENTES_IIVTNU_2025,
  TRAMOS_GANANCIAS_PATRIMONIALES_2025,
  PLUSVALIA_MUNICIPAL_META,
  FISCAL_IRPF_META,
} from '@/data/fiscal';

// ─── Tipos públicos ────────────────────────────────────────────────────────────

export interface ParametrosVentaInmueble {
  /** Precio de venta del inmueble (€) */
  precioVenta: number;
  /** Precio de compra original del inmueble (€) */
  precioCompra: number;
  /** Gastos de compra en su día (notaría, registro, ITP/IVA, etc.) (€) — mejoran el coste de adquisición */
  gastosCompraOriginal?: number;
  /** Años de tenencia del inmueble */
  aniosTenencia: number;
  /** Valor catastral del suelo (aparece en el recibo del IBI) (€) */
  valorCatastralSuelo?: number;
  /** Tipo municipal de plusvalía aplicado por el ayuntamiento (%). Por defecto 25% (orientativo). */
  tipoMunicipalIIVTNU?: number;
  /** Comisión de la agencia inmobiliaria (%). Por defecto 3%. */
  comisionInmobiliaria?: number;
  /** Gastos de gestoría y otros en la venta (€). Por defecto 300€. */
  gastosGestoria?: number;
  /** ¿El vendedor es mayor de 65 años? */
  vendedorMayor65?: boolean;
  /** ¿Es la vivienda habitual del vendedor? (exención IRPF para mayores 65) */
  esViviendaHabitual?: boolean;
  /** ¿Reinvierte en vivienda habitual? (exención total o parcial del IRPF) */
  reinvierteTotalEnVivienda?: boolean;
}

export interface TramoIRPFVenta {
  desde: number;
  hasta: number;
  tipo: number;
  cuota: number;
}

export interface ResultadoVentaInmueble {
  /** Precio de venta */
  precioVenta: number;
  /** Valor de transmisión (venta - comisión - gestoría) */
  valorTransmision: number;
  /** Valor de adquisición (compra + gastos originales) */
  valorAdquisicion: number;
  /** Ganancia patrimonial neta */
  gananciaPatrimonial: number;
  /** ¿Hay ganancia (o pérdida)? */
  hayGanancia: boolean;
  // Plusvalía municipal (IIVTNU)
  /** ¿Se puede calcular la plusvalía municipal? */
  iivtnuCalculable: boolean;
  /** Plusvalía municipal estimada (€) */
  plusvaliaMunicipal: number;
  /** Método utilizado para la plusvalía: 'objetivo' o 'real' */
  metodoPlusvalia: string;
  // IRPF
  /** ¿Exento de IRPF? */
  exentoIRPF: boolean;
  /** Motivo exención IRPF */
  motivoExencion?: string;
  /** IRPF sobre la ganancia patrimonial (€) */
  irpfGanancia: number;
  /** Tipo efectivo IRPF sobre la ganancia (%) */
  tipoEfectivoIRPF: number;
  /** Desglose por tramos base del ahorro */
  desgloseIRPF: TramoIRPFVenta[];
  // Resumen
  /** Comisión inmobiliaria (€) */
  comisionInmobiliaria: number;
  /** Gastos gestoría (€) */
  gastosGestoria: number;
  /** Total gastos y tributos del vendedor */
  totalGastosVendedor: number;
  /** Neto recibido por el vendedor */
  netoVendedor: number;
  /** Rentabilidad neta de la inversión (%) */
  rentabilidadNeta: number;
  /** Fuente normativa */
  fuenteDatos: string;
}

// ─── Función principal ─────────────────────────────────────────────────────────

export function calcularVentaInmueble(p: ParametrosVentaInmueble): ResultadoVentaInmueble {
  if (p.precioVenta <= 0) throw new Error('El precio de venta debe ser mayor que cero.');
  if (p.precioCompra <= 0) throw new Error('El precio de compra debe ser mayor que cero.');
  if (p.aniosTenencia < 0) throw new Error('Los años de tenencia no pueden ser negativos.');

  const r = (n: number) => Math.round(n * 100) / 100;

  const gastosCompraOriginal = p.gastosCompraOriginal ?? 0;
  const tipoMunicipal = Math.min(p.tipoMunicipalIIVTNU ?? 25, 30); // máx legal 30%
  const comisionPct = (p.comisionInmobiliaria ?? 3) / 100;
  const gastoGestoria = p.gastosGestoria ?? 300;

  // Valores de transmisión y adquisición
  const comisionInmobiliaria = r(p.precioVenta * comisionPct);
  const valorTransmision = r(p.precioVenta - comisionInmobiliaria - gastoGestoria);
  const valorAdquisicion = r(p.precioCompra + gastosCompraOriginal);
  const gananciaPatrimonial = r(valorTransmision - valorAdquisicion);
  const hayGanancia = gananciaPatrimonial > 0;

  // ─── Plusvalía municipal (IIVTNU) ─────────────────────────────────────────

  let plusvaliaMunicipal = 0;
  let metodoPlusvalia = 'No calculable (falta valor catastral del suelo)';
  let iivtnuCalculable = false;

  const valorCatastralSuelo = p.valorCatastralSuelo ?? 0;

  if (valorCatastralSuelo > 0) {
    iivtnuCalculable = true;

    // Método objetivo: base = valor catastral suelo × coeficiente máximo
    const aniosClamped = Math.min(Math.floor(p.aniosTenencia), 20);
    const coefEntry = COEFICIENTES_IIVTNU_2025.find(c => c.anios === aniosClamped)
      ?? COEFICIENTES_IIVTNU_2025[COEFICIENTES_IIVTNU_2025.length - 1];
    const baseObjetivo = r(valorCatastralSuelo * coefEntry.coeficiente);
    const plusvaliaObjetivo = r(baseObjetivo * (tipoMunicipal / 100));

    // Método real: base = ganancia × (valor catastral suelo / valor catastral total)
    // Aproximamos: si no tenemos valor catastral total, usamos 60% del catastral suelo
    let plusvaliaReal = Infinity;
    if (hayGanancia && valorCatastralSuelo > 0) {
      const ratioSuelo = 0.6; // Aproximación: suelo ≈ 60% del catastral (orientativo)
      const baseReal = r(gananciaPatrimonial * ratioSuelo);
      plusvaliaReal = r(Math.max(0, baseReal) * (tipoMunicipal / 100));
    }

    // Se aplica el método más favorable (menor cuota)
    if (!hayGanancia) {
      // Sin ganancia: exento (RDL 26/2021)
      plusvaliaMunicipal = 0;
      metodoPlusvalia = 'Exento (sin incremento de valor)';
    } else if (plusvaliaReal < plusvaliaObjetivo) {
      plusvaliaMunicipal = plusvaliaReal;
      metodoPlusvalia = `Método real (más favorable): ${r(plusvaliaReal)} €`;
    } else {
      plusvaliaMunicipal = plusvaliaObjetivo;
      metodoPlusvalia = `Método objetivo: ${r(plusvaliaObjetivo)} €`;
    }
  }

  // ─── IRPF sobre ganancia patrimonial ─────────────────────────────────────

  let exentoIRPF = false;
  let motivoExencion: string | undefined;
  let irpfGanancia = 0;
  let tipoEfectivoIRPF = 0;
  const desgloseIRPF: TramoIRPFVenta[] = [];

  if (p.vendedorMayor65 && p.esViviendaHabitual) {
    exentoIRPF = true;
    motivoExencion = 'Exención por transmisión de vivienda habitual por mayor de 65 años (art. 33.4.b LIRPF)';
  } else if (p.reinvierteTotalEnVivienda) {
    exentoIRPF = true;
    motivoExencion = 'Exención por reinversión total en vivienda habitual (art. 38 LIRPF). Se debe reinvertir en los 2 años siguientes.';
  }

  if (!exentoIRPF && hayGanancia) {
    let base = gananciaPatrimonial;
    let baseAnterior = 0;
    for (const tramo of TRAMOS_GANANCIAS_PATRIMONIALES_2025) {
      if (base <= baseAnterior) break;
      const baseEnTramo = Math.min(base, tramo.hasta) - baseAnterior;
      if (baseEnTramo <= 0) { baseAnterior = tramo.hasta; continue; }
      const cuotaTramo = r(baseEnTramo * (tramo.tipo / 100));
      irpfGanancia += cuotaTramo;
      desgloseIRPF.push({
        desde: baseAnterior,
        hasta: Math.min(base, tramo.hasta),
        tipo: tramo.tipo,
        cuota: cuotaTramo,
      });
      baseAnterior = tramo.hasta;
    }
    irpfGanancia = r(irpfGanancia);
    tipoEfectivoIRPF = r((irpfGanancia / gananciaPatrimonial) * 100);
  }

  // ─── Totales ──────────────────────────────────────────────────────────────

  const totalGastosVendedor = r(comisionInmobiliaria + gastoGestoria + plusvaliaMunicipal + irpfGanancia);
  const netoVendedor = r(p.precioVenta - totalGastosVendedor);
  const rentabilidadNeta = valorAdquisicion > 0
    ? r(((netoVendedor - valorAdquisicion) / valorAdquisicion) * 100)
    : 0;

  return {
    precioVenta: r(p.precioVenta),
    valorTransmision,
    valorAdquisicion,
    gananciaPatrimonial,
    hayGanancia,
    iivtnuCalculable,
    plusvaliaMunicipal,
    metodoPlusvalia,
    exentoIRPF,
    motivoExencion,
    irpfGanancia,
    tipoEfectivoIRPF,
    desgloseIRPF,
    comisionInmobiliaria,
    gastosGestoria: gastoGestoria,
    totalGastosVendedor,
    netoVendedor,
    rentabilidadNeta,
    fuenteDatos: `${PLUSVALIA_MUNICIPAL_META.baseNormativa} | ${FISCAL_IRPF_META.fuente}`,
  };
}
