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
  PLUSVALIA_MUNICIPAL_META,
  FISCAL_IRPF_META,
  calcularGananciaInmueble,
  desglosarCuotaBaseAhorro,
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
  /** Valor catastral TOTAL, suelo + construcción (€). Sin él no se calcula el método real del IIVTNU */
  valorCatastralTotal?: number;
  /** Inversiones y mejoras con factura (€) — suman al valor de adquisición */
  mejoras?: number;
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
  /** Importe concreto que se reinvierte (€). Si se omite, se asume reinversión total */
  importeReinversion?: number;
  /** Principal de la hipoteca pendiente al transmitir (€) — art. 41.1 RIRPF */
  hipotecaPendiente?: number;
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

  const comisionInmobiliaria = r(p.precioVenta * comisionPct);

  // ─── Plusvalía municipal (IIVTNU) ─────────────────────────────────────────
  // Se calcula ANTES que la ganancia: es un tributo inherente a la transmisión
  // satisfecho por el vendedor y, como tal, minora el valor de transmisión
  // (art. 35.2 LIRPF). Calcularla después obligaba a dejarla fuera de la ganancia.

  let plusvaliaMunicipal = 0;
  let metodoPlusvalia = 'No calculable (falta valor catastral del suelo)';
  let iivtnuCalculable = false;

  const valorCatastralSuelo = p.valorCatastralSuelo ?? 0;
  const valorCatastralTotal = p.valorCatastralTotal ?? 0;
  const incrementoBruto = p.precioVenta - p.precioCompra;

  if (valorCatastralSuelo > 0) {
    iivtnuCalculable = true;

    // Método objetivo (art. 107.4 TRLHL): valor catastral del suelo × coeficiente
    const aniosClamped = Math.min(Math.floor(p.aniosTenencia), 20);
    const coefEntry = COEFICIENTES_IIVTNU_2025.find(c => c.anios === aniosClamped)
      ?? COEFICIENTES_IIVTNU_2025[COEFICIENTES_IIVTNU_2025.length - 1];
    const baseObjetivo = r(valorCatastralSuelo * coefEntry.coeficiente);
    const plusvaliaObjetivo = r(baseObjetivo * (tipoMunicipal / 100));

    // Método real (art. 107.5 TRLHL): incremento BRUTO de la operación repartido en la
    // proporción CATASTRAL suelo/total. Sin el valor catastral total no es calculable:
    // antes se usaba un 60 % fijo inventado, que daba un resultado sin respaldo normativo.
    const metodoRealDisponible = valorCatastralTotal > 0;
    const plusvaliaReal = metodoRealDisponible
      ? r(Math.max(0, incrementoBruto * Math.min(1, valorCatastralSuelo / valorCatastralTotal)) * (tipoMunicipal / 100))
      : Infinity;

    if (incrementoBruto <= 0) {
      // Sin incremento de valor: no sujeta (RDL 26/2021)
      plusvaliaMunicipal = 0;
      metodoPlusvalia = 'No sujeta (sin incremento de valor)';
    } else if (plusvaliaReal < plusvaliaObjetivo) {
      plusvaliaMunicipal = plusvaliaReal;
      metodoPlusvalia = `Método real (más favorable): ${r(plusvaliaReal)} €`;
    } else {
      plusvaliaMunicipal = plusvaliaObjetivo;
      metodoPlusvalia = metodoRealDisponible
        ? `Método objetivo (más favorable): ${r(plusvaliaObjetivo)} €`
        : `Método objetivo: ${r(plusvaliaObjetivo)} € (sin valor catastral total no puede compararse con el método real)`;
    }
  }

  // ─── Ganancia patrimonial e IRPF ──────────────────────────────────────────
  // Motor único compartido con las apps web (data/fiscal/ganancia-inmueble.ts):
  // así la tool MCP y la web no pueden dar cifras distintas para el mismo caso.

  const g = calcularGananciaInmueble({
    precioVenta: p.precioVenta,
    precioCompra: p.precioCompra,
    gastosAdquisicion: gastosCompraOriginal,
    mejoras: p.mejoras,
    gastosTransmision: comisionInmobiliaria + gastoGestoria,
    plusvaliaMunicipal,
    exentoPorEdad: !!(p.vendedorMayor65 && p.esViviendaHabitual),
    reinversion: p.reinvierteTotalEnVivienda
      ? {
          // Si solo se marca la casilla sin importe, se asume reinversión total
          importeReinvertido: p.importeReinversion ?? Number.MAX_SAFE_INTEGER,
          principalPendiente: p.hipotecaPendiente,
        }
      : undefined,
  });

  const valorTransmision = r(g.valorTransmision);
  const valorAdquisicion = r(g.valorAdquisicion);
  const gananciaPatrimonial = r(g.ganancia);
  const hayGanancia = !g.esPerdida && g.ganancia > 0;

  const exentoIRPF = hayGanancia && g.cuotaIRPF === 0;
  const motivoExencion = g.motivoExencion ?? undefined;
  const irpfGanancia = r(g.cuotaIRPF);
  const tipoEfectivoIRPF = r(g.tipoEfectivo);
  const desgloseIRPF: TramoIRPFVenta[] = desglosarCuotaBaseAhorro(g.baseImponible).map(t => ({
    desde: t.desde,
    hasta: t.hasta,
    tipo: t.tipo,
    cuota: r(t.cuota),
  }));

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
