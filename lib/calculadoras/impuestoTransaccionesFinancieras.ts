/**
 * Calculadora del Impuesto sobre Transacciones Financieras (ITF — Tasa Tobin)
 * Usada por: MCP server (calcular_impuesto_transacciones_financieras)
 *
 * Calcula el ITF aplicable a las adquisiciones onerosas de acciones espanolas
 * cotizadas en mercados organizados cuando la capitalizacion bursatil supera
 * los 1.000 millones de euros.
 *
 * Marco normativo:
 *   - Ley 5/2020, de 15 de octubre: Impuesto sobre Transacciones Financieras
 *   - Orden HAC/75/2021: forma y plazo de declaracion (Modelo 232-ITF)
 *
 * HECHO IMPONIBLE (Ley 5/2020 art. 2):
 *   Adquisicion onerosa de acciones de sociedades espanolas cuya:
 *   - Capitalizacion bursatil a 1 de diciembre del ano anterior > 1.000 M EUR
 *   - Las acciones esten admitidas a negociacion en un mercado regulado espanol
 *     o de la UE (y la empresa sea espanola)
 *
 * TIPO IMPOSITIVO:
 *   - 0,2% sobre el valor de la adquisicion (precio de compra)
 *
 * OPERACIONES EXENTAS (Ley 5/2020 art. 3):
 *   - Operaciones del mercado primario (OPV, ampliaciones de capital)
 *   - Operaciones de reestructuracion empresarial (fusiones, escisiones)
 *   - Operaciones de creacion de mercado (market making)
 *   - Operaciones intragrupo (participacion directa >= 100%)
 *   - Derivados financieros sobre acciones (solo aplica al subyacente si hay entrega)
 *   - ETF y fondos de inversion indexados (tributa el subyacente, no el fondo)
 *
 * SUJETO PASIVO:
 *   - El intermediario financiero (broker) que ejecuta la operacion
 *   - Si no hay intermediario en Espana, el adquirente directo
 *   - En la practica, el coste lo repercute el broker al inversor
 *
 * DECLARACION:
 *   - Modelo 232-ITF: mensual (dentro del mes siguiente al de la operacion)
 *   - Lo presenta el intermediario financiero (broker), no el inversor
 *
 * Fuente: Ley 5/2020 (ITF) + Orden HAC/75/2021 — vigente 2025
 * Verificado: 2025-01-15
 *
 * Encadenable con: calcular_plusvalias_irpf, calcular_tir_van, calcular_ganancia_criptomonedas
 */

// --- Constantes ---

const TIPO_ITF = 0.2;                          // %
const UMBRAL_CAPITALIZACION = 1_000_000_000;   // 1.000 millones EUR

// --- Tipos publicos ---

export type TipoOperacionITF =
  | 'compra_acciones'          // Compra ordinaria de acciones cotizadas
  | 'operacion_primaria'       // OPV, ampliacion capital — EXENTA
  | 'reestructuracion'         // Fusion, escision — EXENTA
  | 'intragrupo'               // Participacion 100% — EXENTA
  | 'market_making';           // Creacion de mercado — EXENTA

export interface LineaOperacionITF {
  descripcion?: string;
  tipoOperacion: TipoOperacionITF;
  /** Numero de acciones adquiridas */
  numAcciones: number;
  /** Precio por accion (EUR) */
  precioPorAccion: number;
  /**
   * La sociedad emisora tiene capitalizacion bursatil > 1.000 M EUR
   * a 1 de diciembre del ano anterior?
   */
  superaUmbralCapitalizacion: boolean;
}

export interface ParametrosImpuestoTransaccionesFinancieras {
  operaciones: LineaOperacionITF[];
}

export interface DetalleOperacionITF {
  descripcion: string;
  tipoOperacion: TipoOperacionITF;
  valorOperacion: number;
  sujetaITF: boolean;
  motivoExencion?: string;
  cuotaITF: number;
}

export interface ResultadoImpuestoTransaccionesFinancieras {
  detalleOperaciones: DetalleOperacionITF[];
  /** Total valor de operaciones analizadas (EUR) */
  totalValorOperaciones: number;
  /** Total valor de operaciones sujetas al ITF (EUR) */
  totalValorSujeto: number;
  /** Total valor de operaciones exentas (EUR) */
  totalValorExento: number;
  /** Cuota total ITF (EUR) */
  cuotaTotalITF: number;
  /** Tipo efectivo sobre el total de operaciones (%) */
  tipoEfectivoTotal: number;
  advertencias: string[];
  fuenteDatos: string;
}

// --- Funcion principal ---

export function calcularImpuestoTransaccionesFinancieras(
  p: ParametrosImpuestoTransaccionesFinancieras
): ResultadoImpuestoTransaccionesFinancieras {
  if (!p.operaciones || p.operaciones.length === 0) {
    throw new Error('Debe indicar al menos una operacion.');
  }

  const r = (n: number) => Math.round(n * 100) / 100;
  const advertencias: string[] = [];
  const detalleOperaciones: DetalleOperacionITF[] = [];

  let totalValorSujeto = 0;
  let totalValorExento = 0;
  let cuotaTotalITF = 0;

  for (const op of p.operaciones) {
    const valorOperacion = r(op.numAcciones * op.precioPorAccion);
    const descripcion = op.descripcion ?? (op.numAcciones + ' acciones a ' + op.precioPorAccion.toFixed(4) + ' EUR');

    let sujetaITF = false;
    let motivoExencion: string | undefined;
    let cuotaITF = 0;

    if (op.tipoOperacion !== 'compra_acciones') {
      sujetaITF = false;
      motivoExencion = op.tipoOperacion === 'operacion_primaria' ? 'Mercado primario (OPV/ampliacion capital) — exenta art. 3.1.a'
        : op.tipoOperacion === 'reestructuracion' ? 'Reestructuracion empresarial — exenta art. 3.1.b'
        : op.tipoOperacion === 'intragrupo' ? 'Operacion intragrupo (participacion 100%) — exenta art. 3.1.e'
        : 'Market making — exenta art. 3.1.d';
      totalValorExento += valorOperacion;
    } else if (!op.superaUmbralCapitalizacion) {
      sujetaITF = false;
      motivoExencion = 'Capitalizacion bursatil <= ' + UMBRAL_CAPITALIZACION.toLocaleString('es-ES') + ' EUR — no sujeta';
      totalValorExento += valorOperacion;
    } else {
      sujetaITF = true;
      cuotaITF = r(valorOperacion * TIPO_ITF / 100);
      totalValorSujeto += valorOperacion;
      cuotaTotalITF += cuotaITF;
    }

    detalleOperaciones.push({ descripcion, tipoOperacion: op.tipoOperacion, valorOperacion, sujetaITF, motivoExencion, cuotaITF });
  }

  totalValorSujeto = r(totalValorSujeto);
  totalValorExento = r(totalValorExento);
  cuotaTotalITF = r(cuotaTotalITF);
  const totalValorOperaciones = r(totalValorSujeto + totalValorExento);
  const tipoEfectivoTotal = totalValorOperaciones > 0 ? r(cuotaTotalITF / totalValorOperaciones * 100) : 0;

  advertencias.push(
    'Tipo ITF: ' + TIPO_ITF + '% sobre el valor de la adquisicion de acciones espanolas con ' +
    'capitalizacion > ' + (UMBRAL_CAPITALIZACION / 1_000_000).toLocaleString('es-ES') + ' M EUR. ' +
    'La lista de sociedades afectadas la publica la AEAT cada 1 de diciembre para el ano siguiente.'
  );
  advertencias.push(
    'Sujeto pasivo: el intermediario financiero (broker) presenta el Modelo 232-ITF y lo repercute ' +
    'al inversor. El ITF NO es deducible como gasto en IRPF (no es un gasto de transmision). ' +
    'Si incrementa el coste de adquisicion de las acciones, reduce la ganancia patrimonial futura.'
  );
  advertencias.push(
    'No aplica a: ETF, fondos de inversion, derivados, bonos, deuda publica, divisas ni ' +
    'compras de acciones de empresas con sede fuera de Espana.'
  );

  return {
    detalleOperaciones,
    totalValorOperaciones,
    totalValorSujeto,
    totalValorExento,
    cuotaTotalITF,
    tipoEfectivoTotal,
    advertencias,
    fuenteDatos: 'Ley 5/2020 (ITF) + Orden HAC/75/2021 — vigente 2025',
  };
}
