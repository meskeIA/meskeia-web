/**
 * Calculadora de Costes de Venta de Inmueble — lógica pura sin React ni DOM
 * Usada por: MCP de Delegum
 *
 * Calcula todos los costes e impuestos que asume el VENDEDOR al vender un
 * inmueble en España: plusvalía municipal (IIVTNU), IRPF sobre la ganancia
 * patrimonial, comisión inmobiliaria y gestorías.
 *
 * Fuente: RDL 26/2021 (IIVTNU) + Ley 35/2006 IRPF arts. 33-39 + LPGE 2025
 */

import {
  PLUSVALIA_MUNICIPAL_META,
  FISCAL_IRPF_META,
  calcularGananciaInmueble,
  desglosarCuotaBaseAhorro,
  BONIFICACION_IIVTNU_CEUTA_MELILLA,
  DEDUCCION_IRPF_RENTAS_CEUTA_MELILLA,
} from '@/data/fiscal';
import {
  CIUDADES_CON_BONIFICACION,
  TERRITORIOS_IIVTNU_FORAL,
  TERRITORIOS_IRPF_FORAL,
  AVISO_IRPF_FORAL,
  motivoPlusvaliaForal,
  avisoIrpfForalResidente,
  calcularPlusvaliaMunicipal,
  type ComunidadAutonoma,
} from '@/data/itp-ccaa';
import { formatCurrency } from '@/lib/formatters';

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
  /**
   * Comunidad o ciudad donde está el inmueble (cabo C0193, aprobado por el usuario el
   * 15/10/2026). Con ella se aplica lo mismo que en las apps desde el 10/10/2026: en Ceuta y
   * Melilla, la bonificación del 50 % de la plusvalía (art. 159.2 TRLRHL) y la deducción del
   * 60 % del IRPF (art. 68.4 LIRPF); en el País Vasco y Navarra la plusvalía es foral y no se
   * liquida, y si es la vivienda habitual del vendedor tampoco se publica la cuota del IRPF,
   * que no es la de la escala estatal. Sin ella, el cálculo de siempre y un aviso de lo que no
   * se ha podido aplicar.
   */
  ccaa?: ComunidadAutonoma;
  /**
   * Las demás rentas del ahorro del mismo año, sin esta venta (€): intereses, dividendos, otras
   * ganancias. La escala del ahorro se aplica a la base entera, así que con ellas la venta
   * tributa desde el tramo en que la dejan (hallazgo 3368 en las apps; en la tool, cabo C0293,
   * 19/10/2026). Omitido = 0: la venta como única renta del ahorro, y la tool lo dice.
   */
  otrasRentasAhorro?: number;
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
  /**
   * Desglose por tramos de la base del ahorro de la parte que es esta venta: con otras rentas,
   * los tramos empiezan donde ellas la dejan. Suma la cuota antes de la deducción de Ceuta y Melilla.
   */
  desgloseIRPF: TramoIRPFVenta[];
  /** Otras rentas del ahorro con las que se ha calculado el IRPF (0 si no se dieron) */
  otrasRentasAhorro: number;
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
  /** País Vasco o Navarra: la plusvalía municipal es foral y no se ha calculado */
  plusvaliaForal: boolean;
  /**
   * La cuota del IRPF no se publica porque el vendedor reside en territorio foral (vende su
   * vivienda habitual allí): `irpfGanancia` vale 0 y no es una exención.
   */
  irpfForal: boolean;
  /** Deducción del 60 % del art. 68.4 LIRPF ya restada de `irpfGanancia` (0 fuera de Ceuta y Melilla) */
  deduccionIRPFCeutaMelilla: number;
  /** Lo que el territorio cambia o deja sin aplicar, para mostrarlo con el resultado */
  avisosTerritorio: string[];
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

  // En el País Vasco y Navarra la plusvalía es foral: no se liquida con el TRLRHL (hallazgo
  // 3071 de las apps; en Navarra la cuota salía 4,8 veces por debajo). Mejor sin cifra.
  const plusvaliaForal = p.ccaa !== undefined && TERRITORIOS_IIVTNU_FORAL.includes(p.ccaa);
  const enCeutaMelilla = p.ccaa !== undefined && CIUDADES_CON_BONIFICACION.includes(p.ccaa);

  if (plusvaliaForal && p.ccaa) {
    metodoPlusvalia = `No calculada: ${motivoPlusvaliaForal(p.ccaa)}`;
  } else if (valorCatastralSuelo > 0) {
    iivtnuCalculable = true;

    // Los dos métodos, del motor ÚNICO de la plusvalía (data/itp-ccaa.ts), el de la pestaña
    // Vendedor de estimador-compraventa-inmueble y del motor compraventa. Hasta el 27/10/2026
    // aquí había una copia propia; daba lo mismo en 8.160 casos medidos, pero una reparación
    // futura podía llegar a una y no a la otra (cabo C0471). Sin `ccaa`: la bonificación de
    // Ceuta y Melilla se aplica abajo, para rotular las cuotas antes y después de ella.
    //   - Objetivo (art. 107.4 TRLRHL): suelo × coeficiente; años completos, tope en 20 y
    //     prorrateo por meses bajo el año (hallazgos 1559 y 1560).
    //   - Real (art. 107.5): incremento repartido en la proporción catastral suelo/total. Sin
    //     el total, o con un suelo mayor que el total (los dos campos del recibo del IBI
    //     intercambiados, hallazgo 900), no se calcula, y se dice.
    const pm = calcularPlusvaliaMunicipal({
      valorCatastralSuelo,
      aniosPropiedad: p.aniosTenencia,
      precioCompra: p.precioCompra,
      precioVenta: p.precioVenta,
      valorCatastralTotal: valorCatastralTotal > 0 ? valorCatastralTotal : undefined,
      tipoMaximo: tipoMunicipal,
    });
    const plusvaliaObjetivo = r(pm.metodoObjetivo);
    const parCatastralImposible = pm.parCatastralImposible;
    const metodoRealDisponible = pm.metodoRealDisponible;
    const plusvaliaReal = metodoRealDisponible ? r(pm.metodoReal) : Infinity;

    if (pm.exento) {
      // Sin incremento de valor: no sujeta (RDL 26/2021)
      plusvaliaMunicipal = 0;
      metodoPlusvalia = 'No sujeta (sin incremento de valor)';
    } else if (plusvaliaReal < plusvaliaObjetivo) {
      plusvaliaMunicipal = plusvaliaReal;
      metodoPlusvalia = `Método real (más favorable): ${formatCurrency(plusvaliaReal)}`;
    } else {
      plusvaliaMunicipal = plusvaliaObjetivo;
      metodoPlusvalia = metodoRealDisponible
        ? `Método objetivo (más favorable): ${formatCurrency(plusvaliaObjetivo)}`
        : parCatastralImposible
          ? `Método objetivo: ${formatCurrency(plusvaliaObjetivo)} (el valor catastral del suelo no puede superar al total, que ya lo incluye: revisa los dos campos del recibo del IBI, porque con esos valores el método real no puede calcularse)`
          : `Método objetivo: ${formatCurrency(plusvaliaObjetivo)} (sin valor catastral total no puede compararse con el método real)`;
    }

    // Ceuta y Melilla: la cuota, bonificada al 50 % (art. 159.2 TRLRHL). Va sobre la cuota que
    // resulte, y como reduce los dos métodos en la misma proporción no cambia cuál es el menor.
    if (enCeutaMelilla && plusvaliaMunicipal > 0) {
      plusvaliaMunicipal = r(plusvaliaMunicipal * (1 - BONIFICACION_IIVTNU_CEUTA_MELILLA.porcentaje / 100));
      metodoPlusvalia += `, con la bonificación del ${BONIFICACION_IIVTNU_CEUTA_MELILLA.porcentaje} % de la cuota de Ceuta y Melilla (art. 159.2 TRLRHL): ${formatCurrency(plusvaliaMunicipal)}`;
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
    // Ceuta y Melilla: la deducción del 60 % del art. 68.4 LIRPF, resida donde resida el vendedor.
    inmuebleEnCeutaMelilla: enCeutaMelilla,
    otrasRentasAhorro: p.otrasRentasAhorro,
  });

  const valorTransmision = r(g.valorTransmision);
  const valorAdquisicion = r(g.valorAdquisicion);
  const gananciaPatrimonial = r(g.ganancia);
  const hayGanancia = !g.esPerdida && g.ganancia > 0;

  // Vende su vivienda habitual en el País Vasco o Navarra, así que reside allí: su IRPF es foral
  // y la cuota de la escala estatal no es la suya. No se publica (hallazgo 3072 de las apps).
  const avisoIrpfResidente = p.ccaa ? avisoIrpfForalResidente(p.ccaa, !!p.esViviendaHabitual) : null;
  // Tampoco la exención: la de la LIRPF no es la de su norma foral, que este cálculo no aplica.
  const irpfForal = avisoIrpfResidente !== null && hayGanancia;

  const exentoIRPF = !irpfForal && hayGanancia && g.cuotaIRPF === 0;
  const motivoExencion = irpfForal ? undefined : g.motivoExencion ?? undefined;
  const irpfGanancia = irpfForal ? 0 : r(g.cuotaIRPF);
  const tipoEfectivoIRPF = irpfForal ? 0 : r(g.tipoEfectivo);
  const deduccionIRPFCeutaMelilla = irpfForal ? 0 : r(g.deduccionCeutaMelilla);

  const avisosTerritorio: string[] = [];
  if (p.ccaa === undefined) {
    avisosTerritorio.push(
      'No se ha indicado dónde está el inmueble: no se aplican la bonificación del 50 % de la plusvalía ni la deducción del 60 % del IRPF de Ceuta y Melilla, y en el País Vasco y Navarra la plusvalía y el IRPF son forales y no los de este cálculo.',
    );
  } else {
    if (deduccionIRPFCeutaMelilla > 0) {
      avisosTerritorio.push(
        `IRPF con la deducción del ${DEDUCCION_IRPF_RENTAS_CEUTA_MELILLA.porcentaje} % por ganancias de inmuebles situados en Ceuta o Melilla (art. 68.4 LIRPF): ${formatCurrency(deduccionIRPFCeutaMelilla)} menos.`,
      );
    }
    if (irpfForal && avisoIrpfResidente) {
      avisosTerritorio.push(`IRPF no calculado: ${avisoIrpfResidente}.`);
    } else if (TERRITORIOS_IRPF_FORAL.includes(p.ccaa) && hayGanancia && g.cuotaIRPF > 0) {
      avisosTerritorio.push(AVISO_IRPF_FORAL);
    }
  }
  // La venta se apila sobre las otras rentas del ahorro: de cada tramo de la base entera solo
  // es suya la parte por encima de ellas. Sin otras rentas, el desglose de la ganancia sola.
  const otras = g.otrasRentasAhorro;
  const desgloseIRPF: TramoIRPFVenta[] = irpfForal ? [] : desglosarCuotaBaseAhorro(otras + g.baseImponible)
    .filter(t => t.hasta > otras)
    .map(t => {
      const desde = Math.max(t.desde, otras);
      return {
        desde,
        hasta: t.hasta,
        tipo: t.tipo,
        cuota: r((t.hasta - desde) * (t.tipo / 100)),
      };
    });

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
    otrasRentasAhorro: otras,
    comisionInmobiliaria,
    gastosGestoria: gastoGestoria,
    totalGastosVendedor,
    netoVendedor,
    rentabilidadNeta,
    plusvaliaForal,
    irpfForal,
    deduccionIRPFCeutaMelilla,
    avisosTerritorio,
    fuenteDatos: `${PLUSVALIA_MUNICIPAL_META.baseNormativa} | ${FISCAL_IRPF_META.fuente}`,
  };
}
