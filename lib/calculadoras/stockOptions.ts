/**
 * Calculadora de Fiscalidad de Stock Options y RSUs — lógica pura sin React ni DOM
 * Usada por: MCP server (calcular_stock_options)
 *
 * Calcula el impacto fiscal en IRPF de las principales retribuciones en acciones:
 *
 * A) STOCK OPTIONS (opciones sobre acciones)
 *    - Momento de concesión: no hay tributación
 *    - Momento de ejercicio: la diferencia (valor mercado - precio ejercicio) es
 *      rendimiento del TRABAJO (escala general IRPF)
 *    - Exención art. 42.3 LIRPF: hasta 12.000 €/año si se cumplen requisitos
 *      (oferta general para empleados de la empresa, acciones mantenidas ≥3 años)
 *    - Reducción 30% si el período de generación > 2 años y no se obtienen de
 *      forma periódica o recurrente (rendimientos irregulares)
 *    - Momento de venta: ganancia patrimonial (tarifa del ahorro)
 *
 * B) RSUs (Restricted Stock Units / acciones restringidas)
 *    - En el vesting (consolidación): valor de mercado de las acciones = rendimiento TRABAJO
 *    - No hay precio de ejercicio (se reciben gratis)
 *    - Misma exención y reducción que stock options si se cumplen requisitos
 *    - Momento de venta: ganancia patrimonial del ahorro (base = valor en vesting)
 *
 * Fuente: LIRPF art. 17, 42.3, 46; RIRPF art. 43 — vigente 2025
 * Encadenable con: calcular_irpf, calcular_devolucion_irpf, calcular_plusvalias_irpf
 */

import { TRAMOS_IRPF_2025, FISCAL_IRPF_META } from '@/data/fiscal';

// ─── Tipos públicos ────────────────────────────────────────────────────────────

export type TipoRetribucionAcciones = 'stock_options' | 'rsus';

export interface ParametrosStockOptions {
  /** Tipo de retribución */
  tipo: TipoRetribucionAcciones;
  /** Número de acciones/opciones ejercidas o consolidadas */
  numAcciones: number;
  /** Valor de mercado de la acción en el momento de ejercicio/vesting (€) */
  valorMercadoEjercicio: number;
  /**
   * Precio de ejercicio (strike price) para stock options (€).
   * Para RSUs usar 0 (se reciben gratis).
   */
  precioEjercicio?: number;
  /** Rendimientos del trabajo anuales del contribuyente aparte de las acciones (€) */
  rendimientosTrabajo: number;
  /**
   * ¿Cumple los requisitos de la exención art. 42.3 LIRPF?
   * (oferta general a todos los empleados, mantener ≥3 años, no > 10% del capital)
   * Por defecto false (conservador).
   */
  cumpleExencionArt42?: boolean;
  /**
   * ¿El período de generación de las opciones supera 2 años y no son rendimientos recurrentes?
   * (habilita la reducción del 30% sobre el exceso de la exención)
   * Por defecto false.
   */
  periodoGeneracionMayor2Anios?: boolean;
  /** Valor de venta de la acción (€). Para calcular la plusvalía posterior. Por defecto 0. */
  valorVenta?: number;
  /** ¿Han transcurrido más de 1 año entre el ejercicio/vesting y la venta? */
  masDeUnAnoHastaVenta?: boolean;
}

export interface ResultadoStockOptions {
  /** Tipo de retribución */
  tipo: TipoRetribucionAcciones;
  /** Número de acciones */
  numAcciones: number;
  /** Valor de mercado por acción en ejercicio/vesting (€) */
  valorMercadoEjercicio: number;
  /** Precio de ejercicio (€). 0 para RSUs. */
  precioEjercicio: number;

  // Tributación en el ejercicio/vesting (rendimiento del trabajo)
  /** Ganancia bruta en el ejercicio/vesting (valor mercado - precio ejercicio) × acciones (€) */
  gananciaBrutaEjercicio: number;
  /** Exención aplicada (art. 42.3 LIRPF) (€) */
  exencionAplicada: number;
  /** Base sujeta a IRPF antes de reducción (€) */
  baseSujeta: number;
  /** Reducción 30% por rendimiento irregular (€). Solo si periodoGeneracion > 2 años. */
  reduccionIrregular: number;
  /** Base liquidable por rendimiento de trabajo (€) */
  baseLiquidable: number;
  /** IRPF estimado sobre el rendimiento del trabajo por las acciones (€) */
  irpfEjercicio: number;
  /** Tipo efectivo sobre la ganancia bruta (%) */
  tipoEfectivoEjercicio: number;
  /** Neto tras IRPF en el ejercicio/vesting (€) */
  netoEjercicio: number;

  // Tributación en la venta posterior (ganancia patrimonial del ahorro)
  /** ¿Se ha proporcionado precio de venta? */
  hayVentaPosterior: boolean;
  /** Base de adquisición para la plusvalía = valor mercado en ejercicio/vesting (€) */
  baseAdquisicion?: number;
  /** Precio de venta (€) */
  precioVenta?: number;
  /** Plusvalía/minusvalía en la venta (€) */
  plusvaliaVenta?: number;
  /** IRPF por plusvalía (tarifa del ahorro) (€) */
  irpfVenta?: number;

  // Totales
  /** IRPF total (ejercicio + venta) (€) */
  irpfTotal: number;
  /** Neto total recibido (€) */
  netoTotal: number;

  /** Advertencias importantes */
  advertencias: string[];
  /** Fuente normativa */
  fuenteDatos: string;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function aplicarTarifaGeneral(base: number): number {
  if (base <= 0) return 0;
  let cuota = 0;
  let anterior = 0;
  for (const tramo of TRAMOS_IRPF_2025) {
    if (base <= anterior) break;
    const baseTramo = Math.min(base, tramo.hasta) - anterior;
    cuota += baseTramo * (tramo.tipo / 100);
    anterior = tramo.hasta;
  }
  return cuota;
}

function aplicarTarifaAhorro(base: number): number {
  if (base <= 0) return 0;
  const tramos = [
    { hasta: 6000,     tipo: 0.19 },
    { hasta: 50000,    tipo: 0.21 },
    { hasta: 200000,   tipo: 0.23 },
    { hasta: 300000,   tipo: 0.27 },
    { hasta: Infinity, tipo: 0.28 },
  ];
  let cuota = 0;
  let anterior = 0;
  for (const t of tramos) {
    if (base <= anterior) break;
    cuota += (Math.min(base, t.hasta) - anterior) * t.tipo;
    anterior = t.hasta;
  }
  return cuota;
}

// ─── Función principal ─────────────────────────────────────────────────────────

const EXENCION_MAX_ART42 = 12000; // €/año — LIRPF art. 42.3

export function calcularStockOptions(p: ParametrosStockOptions): ResultadoStockOptions {
  if (p.numAcciones <= 0) throw new Error('El número de acciones debe ser mayor que cero.');
  if (p.valorMercadoEjercicio <= 0) throw new Error('El valor de mercado debe ser mayor que cero.');
  if (p.rendimientosTrabajo < 0) throw new Error('Los rendimientos del trabajo no pueden ser negativos.');

  const r = (n: number) => Math.round(n * 100) / 100;

  const precioEjercicio = p.precioEjercicio ?? 0;
  const gananciaBruta = r(p.numAcciones * (p.valorMercadoEjercicio - precioEjercicio));

  if (gananciaBruta < 0) {
    throw new Error('El valor de mercado es inferior al precio de ejercicio. Las opciones están "out of the money" — no tiene sentido ejercerlas ahora.');
  }

  // Exención art. 42.3 LIRPF
  const exencion = p.cumpleExencionArt42 ? Math.min(gananciaBruta, EXENCION_MAX_ART42) : 0;
  const baseSujeta = r(gananciaBruta - exencion);

  // Reducción 30% por rendimiento irregular (art. 18.2 LIRPF)
  const reduccion = p.periodoGeneracionMayor2Anios && baseSujeta > 0
    ? r(baseSujeta * 0.30)
    : 0;
  const baseLiquidable = r(baseSujeta - reduccion);

  // IRPF: se suma a los rendimientos del trabajo existentes
  const cuotaSinAcciones = aplicarTarifaGeneral(p.rendimientosTrabajo);
  const cuotaConAcciones = aplicarTarifaGeneral(p.rendimientosTrabajo + baseLiquidable);
  const irpfEjercicio = r(cuotaConAcciones - cuotaSinAcciones);

  const tipoEfectivoEjercicio = gananciaBruta > 0 ? r(irpfEjercicio / gananciaBruta * 100) : 0;
  const netoEjercicio = r(gananciaBruta - irpfEjercicio);

  // Venta posterior
  let hayVentaPosterior = false;
  let plusvaliaVenta: number | undefined;
  let irpfVenta: number | undefined;
  let precioVentaFinal: number | undefined;
  let baseAdquisicion: number | undefined;

  if (p.valorVenta && p.valorVenta > 0) {
    hayVentaPosterior = true;
    // Base de adquisición = valor de mercado en el ejercicio/vesting
    baseAdquisicion = r(p.numAcciones * p.valorMercadoEjercicio);
    precioVentaFinal = r(p.numAcciones * p.valorVenta);
    plusvaliaVenta = r(precioVentaFinal - baseAdquisicion);
    // Solo tributa en la tarifa del ahorro si han pasado más de 1 año (o si es negativo, compensa)
    irpfVenta = plusvaliaVenta > 0 ? r(aplicarTarifaAhorro(plusvaliaVenta)) : 0;
  }

  const irpfTotal = r(irpfEjercicio + (irpfVenta ?? 0));
  const netoVenta = hayVentaPosterior ? r((precioVentaFinal ?? 0) - (irpfVenta ?? 0) - r(p.numAcciones * p.valorMercadoEjercicio)) : 0;
  const netoTotal = r(netoEjercicio + (hayVentaPosterior ? netoVenta : 0));

  const advertencias: string[] = [
    '⚠️ El rendimiento del trabajo por acciones se suma al resto de rentas del trabajo y puede provocar un salto de tramo de IRPF importante. Planifica la retención con tu empresa.',
    'La exención de 12.000 € del art. 42.3 LIRPF requiere que la oferta sea general para todos los empleados, que no se transmitan las acciones en 3 años y que no se supere el 10% del capital.',
    'La reducción del 30% por rendimientos irregulares tiene un límite de 300.000 € de base reducida y no aplica si se han obtenido rendimientos similares en los últimos 5 años.',
    'La base de adquisición para calcular la plusvalía en la venta es el valor de mercado en el momento del ejercicio/vesting, no el precio de ejercicio.',
  ];
  if (p.tipo === 'rsus') {
    advertencias.push('En las RSUs no hay precio de ejercicio — el valor de mercado íntegro en el vesting es rendimiento del trabajo, salvo exención aplicable.');
  }
  if (!p.cumpleExencionArt42) {
    advertencias.push('No se ha marcado el cumplimiento de la exención art. 42.3. Si tu empresa ofrece las opciones a todos los empleados, consulta con asesor fiscal si puedes aplicarla (hasta 12.000 €/año exentos).');
  }

  return {
    tipo: p.tipo,
    numAcciones: p.numAcciones,
    valorMercadoEjercicio: r(p.valorMercadoEjercicio),
    precioEjercicio: r(precioEjercicio),
    gananciaBrutaEjercicio: gananciaBruta,
    exencionAplicada: r(exencion),
    baseSujeta,
    reduccionIrregular: reduccion,
    baseLiquidable,
    irpfEjercicio,
    tipoEfectivoEjercicio,
    netoEjercicio,
    hayVentaPosterior,
    baseAdquisicion,
    precioVenta: precioVentaFinal,
    plusvaliaVenta,
    irpfVenta,
    irpfTotal,
    netoTotal,
    advertencias,
    fuenteDatos: `${FISCAL_IRPF_META.fuente} art. 17, 42.3, 18.2 — verificado ${FISCAL_IRPF_META.verificado}`,
  };
}
