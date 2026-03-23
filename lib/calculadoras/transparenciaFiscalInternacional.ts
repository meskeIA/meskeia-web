/**
 * Calculadora de Transparencia Fiscal Internacional (TFI)
 * Usada por: MCP server (calcular_transparencia_fiscal_internacional)
 *
 * Calcula la imputacion de rentas de entidades extranjeras controladas (CFC)
 * a los socios espanoles en el Impuesto sobre Sociedades, conforme al
 * regimen de Transparencia Fiscal Internacional de la LIS.
 *
 * Marco normativo:
 *   - LIS art. 100: Transparencia Fiscal Internacional
 *   - LIS art. 100.1: presupuestos de aplicacion
 *   - LIS art. 100.2: rentas imputables
 *   - LIS art. 100.3 y 100.11: excepciones y regimenes de baja tributacion
 *   - Directiva ATAD (2016/1164): anti-abuso; transpuesta en LIS
 *
 * PRESUPUESTOS DE APLICACION (LIS art. 100.1):
 *   La sociedad espanola (contribuyente IS) debe:
 *   1. Participar >= 25% en capital, fondos propios, beneficios o derechos de voto
 *      de la entidad no residente (ENR) — directa o indirectamente
 *   2. La ENR tributa a un tipo nominal < 75% del tipo IS espanol
 *      (< 75% de 25% = < 18,75%)
 *   Si se cumplen ambos: OBLIGACION de imputar las rentas TFI.
 *
 * RENTAS IMPUTABLES (LIS art. 100.2):
 *   Solo se imputan rentas "pasivas" o de baja sustancia economica:
 *   a) Rentas inmobiliarias (arrendamientos de inmuebles)
 *   b) Rentas de participaciones (dividendos, participacion en beneficios)
 *   c) Servicios financieros intragrupo (prestamos a empresas vinculadas)
 *   d) Rentas de seguros (primas cedidas al grupo)
 *   e) Rentas de propiedad intelectual (royalties, licencias)
 *   f) Rentas de instrumentos financieros derivados
 *   g) Rentas de actividades de comercio de bienes con empresas vinculadas
 *
 * EXCEPCIONES (no imputable):
 *   - La ENR tiene sustancia economica real (medios, empleados)
 *   - La renta es < 15% de los ingresos totales de la ENR (umbral de minimis)
 *   - La ENR esta en la UE/EEE con motivos economicos validos
 *   - La ENR ya pago impuestos >= 75% del IS espanol
 *
 * CALCULO:
 *   Base IS espanol += (Renta imputable ENR * % participacion)
 *   Deduccion: impuesto pagado en el extranjero por la ENR (evita doble imposicion)
 *
 * Fuente: LIS art. 100 + Directiva ATAD — vigente 2025
 * Verificado: 2025-01-15
 *
 * Encadenable con: calcular_impuesto_sociedades, calcular_deduccion_idi
 */

// --- Constantes ---

const TIPO_IS_ESPANOL = 25;               // % tipo general IS
const UMBRAL_BAJA_TRIBUTACION = 0.75;     // < 75% del IS espanol
const UMBRAL_MINIMIS_PCT = 15;            // % rentas pasivas / ingresos totales — excepcion de minimis

// --- Tipos publicos ---

export type TipoRentaTFI =
  | 'inmobiliaria'               // Arrendamiento de inmuebles
  | 'dividendos_participaciones' // Dividendos, participacion en beneficios
  | 'servicios_financieros'      // Prestamos a empresas del grupo
  | 'seguros'                    // Primas de seguros cedidas al grupo
  | 'propiedad_intelectual'      // Royalties, licencias, IP
  | 'derivados_financieros'      // Instrumentos derivados
  | 'comercio_vinculadas';       // Compraventa bienes a empresas vinculadas

export interface LineaRentaTFI {
  tipo: TipoRentaTFI;
  descripcion?: string;
  /** Importe de la renta obtenida por la ENR (moneda origen, EUR equiv.) */
  importeRenta: number;
}

export interface ParametrosTransparenciaFiscalInternacional {
  /** Nombre o identificacion de la Entidad No Residente */
  nombreENR?: string;
  /** Pais de residencia de la ENR */
  paisENR?: string;
  /** Porcentaje de participacion directa + indirecta en la ENR (%) */
  porcentajeParticipacion: number;
  /** Tipo nominal del impuesto sobre beneficios en el pais de la ENR (%) */
  tipoNominalPaisENR: number;
  /** Total de ingresos de la ENR en el ejercicio (EUR equiv.) */
  ingresosTodesENR: number;
  /** Rentas imputables TFI de la ENR (solo pasivas listadas en art. 100.2) */
  rentasImputables: LineaRentaTFI[];
  /**
   * Impuesto efectivamente pagado por la ENR en el extranjero
   * sobre las rentas imputadas (EUR) — para calculo de deduccion
   */
  impuestoPagadoExtranjero?: number;
  /**
   * La ENR tiene sustancia economica real?
   * (medios materiales y humanos propios, no puro holding pasivo)
   */
  tieneSubstanciaEconomica?: boolean;
  /**
   * La ENR esta en la UE/EEE con motivos economicos validos?
   */
  enUEconMotivosValidos?: boolean;
}

export interface DetalleRentaTFI {
  tipo: TipoRentaTFI;
  descripcion: string;
  importeRenta: number;
  /** Importe imputable al socio espanol (renta x % participacion) */
  importeImputable: number;
}

export interface ResultadoTransparenciaFiscalInternacional {
  /** Los presupuestos TFI se cumplen? */
  aplicaTFI: boolean;
  motivoNoAplicacion?: string;
  porcentajeParticipacion: number;
  tipoNominalPaisENR: number;
  /** Umbral de baja tributacion (< este tipo → aplica TFI) */
  umbralbajaTributacion: number;
  /** Total rentas pasivas de la ENR (EUR) */
  totalRentasPasivas: number;
  /** Porcentaje que representan las rentas pasivas sobre los ingresos totales (%) */
  pctRentasPasivas: number;
  /** Aplica la excepcion de minimis (< 15%)? */
  aplicaMinimis: boolean;
  detalleRentas: DetalleRentaTFI[];
  /** Total renta imputable al socio espanol (EUR) */
  totalRentaImputable: number;
  /** Cuota IS adicional estimada sobre la renta imputada (EUR) */
  cuotaISAdicional: number;
  /** Deduccion por doble imposicion internacional (EUR) */
  deduccionDobleImposicion: number;
  /** Cuota IS neta a pagar adicional (EUR) */
  cuotaISNeta: number;
  advertencias: string[];
  fuenteDatos: string;
}

// --- Funcion principal ---

export function calcularTransparenciaFiscalInternacional(
  p: ParametrosTransparenciaFiscalInternacional
): ResultadoTransparenciaFiscalInternacional {
  if (p.porcentajeParticipacion <= 0 || p.porcentajeParticipacion > 100) {
    throw new Error('El porcentaje de participacion debe estar entre 0,01% y 100%.');
  }
  if (p.ingresosTodesENR < 0) throw new Error('Los ingresos totales de la ENR no pueden ser negativos.');

  const r = (n: number) => Math.round(n * 100) / 100;
  const advertencias: string[] = [];

  const umbralbajaTributacion = r(TIPO_IS_ESPANOL * UMBRAL_BAJA_TRIBUTACION);
  const cumpleParticipacion = p.porcentajeParticipacion >= 25;
  const cumpleBajaTributacion = p.tipoNominalPaisENR < umbralbajaTributacion;

  // Calcular rentas pasivas totales
  const totalRentasPasivas = r(p.rentasImputables.reduce((s, x) => s + x.importeRenta, 0));
  const pctRentasPasivas = p.ingresosTodesENR > 0
    ? r(totalRentasPasivas / p.ingresosTodesENR * 100)
    : 0;
  const aplicaMinimis = pctRentasPasivas < UMBRAL_MINIMIS_PCT;

  // Verificar si aplica TFI
  let aplicaTFI = true;
  let motivoNoAplicacion: string | undefined;

  if (!cumpleParticipacion) {
    aplicaTFI = false;
    motivoNoAplicacion = 'Participacion inferior al 25% (' + p.porcentajeParticipacion + '%). ' +
      'El regimen TFI requiere >= 25% de participacion directa o indirecta.';
  } else if (!cumpleBajaTributacion) {
    aplicaTFI = false;
    motivoNoAplicacion = 'El tipo nominal del pais de la ENR (' + p.tipoNominalPaisENR + '%) no es ' +
      'inferior al umbral de baja tributacion (' + umbralbajaTributacion + '% = 75% de ' + TIPO_IS_ESPANOL + '%).';
  } else if (p.enUEconMotivosValidos) {
    aplicaTFI = false;
    motivoNoAplicacion = 'La ENR esta en la UE/EEE con motivos economicos validos. ' +
      'Excepcion prevista en LIS art. 100.9 (no aplica TFI a entidades UE con actividad real).';
  } else if (p.tieneSubstanciaEconomica && aplicaMinimis) {
    aplicaTFI = false;
    motivoNoAplicacion = 'La ENR tiene sustancia economica real y las rentas pasivas representan ' +
      'menos del ' + UMBRAL_MINIMIS_PCT + '% de sus ingresos (' + pctRentasPasivas + '%).';
  } else if (aplicaMinimis) {
    aplicaTFI = false;
    motivoNoAplicacion = 'Las rentas pasivas (' + pctRentasPasivas + '% de los ingresos totales) ' +
      'no superan el umbral de minimis del ' + UMBRAL_MINIMIS_PCT + '%.';
  }

  // Detalle rentas
  const detalleRentas: DetalleRentaTFI[] = p.rentasImputables.map(x => ({
    tipo: x.tipo,
    descripcion: x.descripcion ?? x.tipo.replace(/_/g, ' '),
    importeRenta: r(x.importeRenta),
    importeImputable: aplicaTFI ? r(x.importeRenta * p.porcentajeParticipacion / 100) : 0,
  }));

  if (!aplicaTFI) {
    return {
      aplicaTFI: false,
      motivoNoAplicacion,
      porcentajeParticipacion: p.porcentajeParticipacion,
      tipoNominalPaisENR: p.tipoNominalPaisENR,
      umbralbajaTributacion,
      totalRentasPasivas,
      pctRentasPasivas,
      aplicaMinimis,
      detalleRentas,
      totalRentaImputable: 0,
      cuotaISAdicional: 0,
      deduccionDobleImposicion: 0,
      cuotaISNeta: 0,
      advertencias,
      fuenteDatos: 'LIS art. 100 + Directiva ATAD — vigente 2025',
    };
  }

  const totalRentaImputable = r(totalRentasPasivas * p.porcentajeParticipacion / 100);
  const cuotaISAdicional = r(totalRentaImputable * TIPO_IS_ESPANOL / 100);
  const impuestoPagadoExt = r(p.impuestoPagadoExtranjero ?? 0);
  const deduccionDobleImposicion = r(Math.min(
    cuotaISAdicional,
    impuestoPagadoExt * p.porcentajeParticipacion / 100
  ));
  const cuotaISNeta = r(Math.max(0, cuotaISAdicional - deduccionDobleImposicion));

  advertencias.push(
    'TRANSPARENCIA FISCAL INTERNACIONAL (LIS art. 100): el contribuyente espanol debe ' +
    'integrar en su base imponible del IS la renta imputable de ' +
    totalRentaImputable.toLocaleString('es-ES') + ' EUR.'
  );
  advertencias.push(
    'La imputacion se realiza en el periodo impositivo en que la ENR cierra su ejercicio. ' +
    'Debe declararse en el modelo 200 del IS (casillas especificas de TFI).'
  );
  if (impuestoPagadoExt > 0) {
    advertencias.push(
      'Deduccion doble imposicion: el impuesto pagado por la ENR en el extranjero ' +
      '(proporcional a la participacion) es deducible de la cuota IS espanola, ' +
      'hasta el limite de la cuota que corresponderia a esas rentas en Espana.'
    );
  }
  advertencias.push(
    'Consulta a asesor fiscal especializado en fiscalidad internacional. ' +
    'El regimen TFI presenta complejidades significativas (CDI aplicables, ' +
    'precios de transferencia, sustancia economica, directiva ATAD).'
  );

  return {
    aplicaTFI: true,
    porcentajeParticipacion: p.porcentajeParticipacion,
    tipoNominalPaisENR: p.tipoNominalPaisENR,
    umbralbajaTributacion,
    totalRentasPasivas,
    pctRentasPasivas,
    aplicaMinimis,
    detalleRentas,
    totalRentaImputable,
    cuotaISAdicional,
    deduccionDobleImposicion,
    cuotaISNeta,
    advertencias,
    fuenteDatos: 'LIS art. 100 + Directiva ATAD — vigente 2025',
  };
}
