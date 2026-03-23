/**
 * Calculadora de Deduccion por Doble Imposicion Internacional en IS
 * Usada por: MCP server (calcular_deduccion_doble_imposicion_is)
 *
 * Calcula la deduccion aplicable en el Impuesto sobre Sociedades espanol
 * para evitar la doble imposicion juridica y economica internacional,
 * y la exencion de dividendos/plusvalias de fuente extranjera (IS arts. 21-22).
 *
 * Marco normativo:
 *   - LIS art. 21: exencion de dividendos y participacion en beneficios
 *   - LIS art. 22: exencion de rentas obtenidas mediante EP en el extranjero
 *   - LIS art. 31: deduccion impuesto extranjero (deduccion directa)
 *   - LIS art. 32: deduccion impuesto subyacente (deduccion indirecta)
 *   - CDIs: convenios de doble imposicion suscritos por Espana
 *   - OCDE Model Tax Convention: estandar de referencia
 *
 * EXENCION ART. 21 — DIVIDENDOS Y PLUSVALIAS DE FUENTE EXTRANJERA:
 *
 *   Requisitos para la exencion:
 *   1. Participacion >= 5% en la entidad extranjera, O valor de adquisicion > 20 M EUR
 *   2. Periodo de tenencia >= 1 ano (365 dias) — puede completarse tras el cobro
 *   3. La entidad participada:
 *      a) Ha sido gravada por un impuesto analogo al IS espanol
 *      b) El tipo nominal del pais de la filial >= 10% (regla anti-paraiso)
 *      c) NO esta en un pais de nula tributacion o paraiso fiscal
 *   4. EXCEPCION: si la renta procede de una entidad espanola que dedujo el gasto,
 *      la exencion puede no aplicar
 *
 *   LIMITACION ART. 21.1 (desde Ley 31/2022 — PGE 2023):
 *   - El 5% de los dividendos exentos se integra en la base imponible
 *     (gastos de gestion de la participacion — regla de la reversibilidad)
 *   - Para grupos consolidacion fiscal: puede aplicar eliminacion en lugar de 5%
 *
 * EXENCION ART. 22 — ESTABLECIMIENTOS PERMANENTES:
 *   - Rentas obtenidas por EP en el extranjero: exentas en IS espanol
 *   - Mismo requisito tipo nominal >= 10% en el pais del EP
 *   - Las perdidas del EP si se integraron antes: se descuentan de la exencion
 *
 * DEDUCCION DIRECTA ART. 31 — IMPUESTO EXTRANJERO PAGADO:
 *   Para dividendos/rentas que NO aplican exencion:
 *   - Se deduce el impuesto extranjero efectivamente pagado y satisfecho
 *   - Limite: cuota del IS espanol correspondiente a esas rentas
 *   - No genera exceso deducible (no se traslada)
 *
 * DEDUCCION INDIRECTA ART. 32 — IMPUESTO SUBYACENTE:
 *   Para dividendos de filiales extranjeras (con participacion >= 5%):
 *   - Deduccion del IS pagado por la filial extranjera proporcional al dividendo
 *   - Solo si no aplica la exencion art. 21
 *
 * Fuente: LIS arts. 21, 22, 31, 32 — vigente 2025
 * Verificado: 2025-01-15
 *
 * Encadenable con: calcular_impuesto_sociedades, calcular_retencion_dividendos, calcular_transparencia_fiscal_internacional
 */

// --- Constantes ---

const PCT_PARTICIPACION_MINIMA = 5;          // % participacion minima para exencion
const VALOR_ADQUISICION_ALTERNATIVO = 20_000_000; // EUR — alternativa al 5%
const MESES_TENENCIA_MINIMA = 12;            // Meses de tenencia minima (1 ano)
const TIPO_NOMINAL_MINIMO_PAIS = 10;         // % tipo minimo pais filial para exencion
const PCT_GESTION_PARTICIPACION = 5;         // % de la exencion que tributa (LIS 31/2022)

// --- Tipos publicos ---

export type TipoRentaExtranjera =
  | 'dividendo_filial'       // Dividendo de sociedad participada extranjera
  | 'plusvalia_transmision'  // Ganancia por transmision de participacion extranjera
  | 'renta_ep';              // Renta de establecimiento permanente extranjero

export type MetodoEliminacionDI =
  | 'exencion_art21'   // Exencion total (con 5% gastos gestion)
  | 'exencion_art22'   // Exencion EP
  | 'deduccion_art31'  // Deduccion impuesto extranjero pagado
  | 'deduccion_art32'  // Deduccion impuesto subyacente (indirecta)
  | 'sin_metodo';      // No aplica ningun metodo (no cumple requisitos)

export interface ParametrosDeduccionDobleImposicionIS {
  tipoRenta: TipoRentaExtranjera;
  /** Importe bruto de la renta extranjera (EUR) */
  importeRenta: number;
  /** Porcentaje de participacion en la entidad extranjera (%) */
  porcentajeParticipacion: number;
  /** Valor de adquisicion de la participacion (EUR) — alternativa al 5% */
  valorAdquisicion?: number;
  /** Meses de tenencia de la participacion */
  mesesTenencia: number;
  /** Tipo nominal IS en el pais de la filial/EP (%) */
  tipoNominalPaisExtranjero: number;
  /** El pais esta en lista de paraisos fiscales? */
  esParaisoFiscal?: boolean;
  /** Impuesto extranjero pagado/retenido en origen (EUR) — para deduccion directa */
  impuestoExtranjeroPagado?: number;
  /** IS pagado por la filial extranjera proporcional al dividendo (EUR) — para deduccion indirecta */
  impuestoSubyacente?: number;
  /** Tipo IS espanol del contribuyente (%) */
  tipoISEspanol?: number;
}

export interface ResultadoDeduccionDobleImposicionIS {
  tipoRenta: TipoRentaExtranjera;
  importeRenta: number;
  /** Metodo de eliminacion aplicable */
  metodoAplicable: MetodoEliminacionDI;
  /** Cumple todos los requisitos para la exencion art. 21/22? */
  cumpleRequisitosExencion: boolean;
  /** Motivos por los que no cumple (si aplica) */
  motivosNoExencion: string[];
  /** Importe exento (EUR) */
  importeExento: number;
  /** Importe gravado en IS espanol (5% gastos gestion, si exencion art. 21) */
  importeGravado5pct: number;
  /** Deduccion directa art. 31 (EUR) */
  deduccionDirecta: number;
  /** Deduccion indirecta art. 32 (EUR) */
  deduccionIndirecta: number;
  /** Total deduccion aplicable en cuota IS (EUR) */
  totalDeduccion: number;
  /** Cuota IS espanol sobre la renta (referencia sin deduccion) */
  cuotaISSinDeduccion: number;
  /** Cuota neta tras deduccion (EUR) */
  cuotaNetaTrasDeduccion: number;
  advertencias: string[];
  fuenteDatos: string;
}

// --- Funcion principal ---

export function calcularDeduccionDobleImposicionIS(
  p: ParametrosDeduccionDobleImposicionIS
): ResultadoDeduccionDobleImposicionIS {
  if (p.importeRenta <= 0) throw new Error('El importe de la renta debe ser mayor que cero.');
  if (p.porcentajeParticipacion < 0 || p.porcentajeParticipacion > 100) {
    throw new Error('El porcentaje de participacion debe estar entre 0 y 100.');
  }
  if (p.mesesTenencia < 0) throw new Error('Los meses de tenencia no pueden ser negativos.');

  const r = (n: number) => Math.round(n * 100) / 100;
  const advertencias: string[] = [];
  const motivosNoExencion: string[] = [];

  const tipoIS = p.tipoISEspanol ?? 25;
  const cumpleParticipacion = p.porcentajeParticipacion >= PCT_PARTICIPACION_MINIMA ||
    (p.valorAdquisicion !== undefined && p.valorAdquisicion >= VALOR_ADQUISICION_ALTERNATIVO);
  const cumpleTenencia = p.mesesTenencia >= MESES_TENENCIA_MINIMA;
  const cumpleTipoNominal = p.tipoNominalPaisExtranjero >= TIPO_NOMINAL_MINIMO_PAIS;
  const esParaiso = p.esParaisoFiscal ?? false;

  if (!cumpleParticipacion) {
    motivosNoExencion.push(
      'Participacion insuficiente: ' + p.porcentajeParticipacion + '% < ' +
      PCT_PARTICIPACION_MINIMA + '% (y valor adquisicion < ' +
      VALOR_ADQUISICION_ALTERNATIVO.toLocaleString('es-ES') + ' EUR).'
    );
  }
  if (!cumpleTenencia) {
    motivosNoExencion.push(
      'Tenencia insuficiente: ' + p.mesesTenencia + ' meses < ' + MESES_TENENCIA_MINIMA + ' meses.'
    );
  }
  if (!cumpleTipoNominal) {
    motivosNoExencion.push(
      'Tipo nominal del pais extranjero (' + p.tipoNominalPaisExtranjero + '%) < ' +
      TIPO_NOMINAL_MINIMO_PAIS + '%. No se considera tributacion analoga.'
    );
  }
  if (esParaiso) {
    motivosNoExencion.push('El pais esta catalogado como paraiso fiscal — exencion no aplicable.');
  }

  const cumpleRequisitosExencion = motivosNoExencion.length === 0;

  let metodoAplicable: MetodoEliminacionDI;
  let importeExento = 0;
  let importeGravado5pct = 0;
  let deduccionDirecta = 0;
  let deduccionIndirecta = 0;

  if (cumpleRequisitosExencion) {
    if (p.tipoRenta === 'renta_ep') {
      metodoAplicable = 'exencion_art22';
      importeExento = r(p.importeRenta);
      importeGravado5pct = 0; // Art. 22 no tiene el 5% de gastos de gestion
    } else {
      metodoAplicable = 'exencion_art21';
      // 5% de gastos de gestion tributa (LIS art. 21.10, desde Ley 31/2022)
      importeGravado5pct = r(p.importeRenta * PCT_GESTION_PARTICIPACION / 100);
      importeExento = r(p.importeRenta - importeGravado5pct);
    }
  } else {
    // No exencion — aplicar deduccion
    if (p.impuestoExtranjeroPagado && p.impuestoExtranjeroPagado > 0) {
      // Deduccion directa art. 31
      const cuotaCorrespondiente = r(p.importeRenta * tipoIS / 100);
      deduccionDirecta = r(Math.min(p.impuestoExtranjeroPagado, cuotaCorrespondiente));
      metodoAplicable = 'deduccion_art31';
    }
    if (p.impuestoSubyacente && p.impuestoSubyacente > 0 && cumpleParticipacion) {
      // Deduccion indirecta art. 32 (si hay participacion >= 5% aunque no cumpla otros requisitos)
      const cuotaCorrespondiente = r(p.importeRenta * tipoIS / 100);
      const limiteDeduccion = r(cuotaCorrespondiente - deduccionDirecta);
      deduccionIndirecta = r(Math.min(p.impuestoSubyacente, Math.max(0, limiteDeduccion)));
      if (metodoAplicable! === undefined || metodoAplicable === 'sin_metodo') {
        metodoAplicable = 'deduccion_art32';
      }
    }
    if (!metodoAplicable!) {
      metodoAplicable = 'sin_metodo';
    }
  }

  const totalDeduccion = r(deduccionDirecta + deduccionIndirecta);
  const baseGravable = r(importeGravado5pct + (cumpleRequisitosExencion ? 0 : p.importeRenta));
  const cuotaISSinDeduccion = r(baseGravable * tipoIS / 100);
  const cuotaNetaTrasDeduccion = r(Math.max(0, cuotaISSinDeduccion - totalDeduccion));

  // Advertencias
  if (cumpleRequisitosExencion && metodoAplicable === 'exencion_art21') {
    advertencias.push(
      'EXENCION ART. 21 LIS: los dividendos/plusvalias estan EXENTOS de IS. ' +
      'Sin embargo, el ' + PCT_GESTION_PARTICIPACION + '% (' +
      importeGravado5pct.toLocaleString('es-ES') + ' EUR) tributa como gastos ' +
      'de gestion de la participacion (Ley 31/2022). ' +
      'Para grupos en consolidacion fiscal puede eliminarse esta limitacion.'
    );
  }

  if (!cumpleTenencia && cumpleParticipacion) {
    advertencias.push(
      'TENENCIA INSUFICIENTE: si se completan los ' + MESES_TENENCIA_MINIMA + ' meses ' +
      'de tenencia (aunque sea tras la percepcion del dividendo o la transmision), ' +
      'la exencion puede recuperarse en ejercicios posteriores.'
    );
  }

  if (!cumpleTipoNominal && p.tipoNominalPaisExtranjero > 0) {
    advertencias.push(
      'TIPO NOMINAL INSUFICIENTE: el tipo del ' + p.tipoNominalPaisExtranjero + '% ' +
      'no alcanza el minimo del ' + TIPO_NOMINAL_MINIMO_PAIS + '% requerido. ' +
      'Algunos CDIs pueden prever un tratamiento diferente. Consultar el convenio ' +
      'aplicable con el pais de la filial.'
    );
  }

  if (metodoAplicable === 'sin_metodo') {
    advertencias.push(
      'SIN METODO APLICABLE: la renta tributa en IS sin posibilidad de deduccion, ' +
      'ya que no se cumplen los requisitos de la exencion ni hay impuesto extranjero ' +
      'pagado ni impuesto subyacente identificado.'
    );
  }

  advertencias.push(
    'CDI: si existe Convenio de Doble Imposicion con el pais de la filial, ' +
    'los tipos de retencion en origen y las reglas de atribucion de rentas ' +
    'pueden diferir de lo aqui calculado. Verificar el CDI aplicable.'
  );

  return {
    tipoRenta: p.tipoRenta,
    importeRenta: r(p.importeRenta),
    metodoAplicable,
    cumpleRequisitosExencion,
    motivosNoExencion,
    importeExento,
    importeGravado5pct,
    deduccionDirecta,
    deduccionIndirecta,
    totalDeduccion,
    cuotaISSinDeduccion,
    cuotaNetaTrasDeduccion,
    advertencias,
    fuenteDatos: 'LIS arts. 21, 22, 31, 32 — vigente 2025',
  };
}
