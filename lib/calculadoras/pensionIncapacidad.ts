/**
 * Calculadora de Pensión de Incapacidad Permanente — lógica pura sin React ni DOM
 * Usada por: MCP server (calcular_pension_incapacidad)
 *
 * Calcula la cuantía de la pensión de incapacidad permanente conforme a la LGSS
 * arts. 195-200, según el grado declarado.
 *
 * Grados de incapacidad permanente (art. 194 LGSS):
 *   - Parcial (IP Parcial): Disminución ≥ 33% rendimiento habitual
 *     Prestación: indemnización a tanto alzado (24 mensualidades de base reguladora)
 *   - Total (IPT): Imposibilidad de realizar trabajo habitual
 *     Prestación: 55% de la base reguladora (+ 20% si tiene ≥ 55 años y dificultad reempleo)
 *   - Absoluta (IPA): Imposibilidad de cualquier trabajo
 *     Prestación: 100% de la base reguladora
 *   - Gran Invalidez (GI): IPA + necesita asistencia de tercera persona
 *     Prestación: 100% BR + complemento (45% IPREM + 30% última base cotización)
 *
 * Base reguladora (art. 197 LGSS — contingencias comunes):
 *   BR = Suma bases cotización últimos 8 años / 112
 *   (8 años × 12 meses + 4 pagas = 96 + 16 = 112)
 *   Para contingencias profesionales (AT/EP): bases de los últimos 12 meses / 12
 *
 * Pensión mínima 2025: varía según grado y situación familiar.
 * IPREM mensual 2025: 600 €/mes.
 *
 * Fuente: LGSS arts. 194-200 + RD pensiones mínimas 2025
 * Verificado: 2025-01-15
 *
 * Encadenable con: calcular_baja_medica, calcular_pension_publica, calcular_sueldo_neto
 */

// ─── Constantes 2025 ────────────────────────────────────────────────────────────

const IPREM_MENSUAL_2025 = 600;               // €/mes
const MESES_BR_COMUNES = 112;                 // 8 años × 12 meses + 4 pagas extra
const MESES_BR_PROFESIONALES = 12;

// Pensiones mínimas mensuales 2025 (14 pagas — RD pensiones mínimas)
const PENSION_MINIMA_IPT_CON_CONYUGE = 940.50;
const PENSION_MINIMA_IPT_SIN_CONYUGE_MAYOR55 = 860.00;
const PENSION_MINIMA_IPT_SIN_CONYUGE_MENOR55 = 730.00;
const PENSION_MINIMA_IPA_CON_CONYUGE = 1050.00;
const PENSION_MINIMA_IPA_SIN_CONYUGE = 850.00;
const PENSION_MINIMA_GI = 1575.00; // Aproximado (IPT + complemento tercera persona)

// Recargo IPT ≥ 55 años por dificultad de reempleo
const RECARGO_IPT_55_ANIOS = 20; // % adicional sobre BR

// Complemento GI
const PCT_COMPLEMENTO_GI_IPREM = 45;   // % del IPREM
const PCT_COMPLEMENTO_GI_BASE = 30;    // % de la última base de cotización

// ─── Tipos públicos ────────────────────────────────────────────────────────────

export type GradoIncapacidad = 'parcial' | 'total' | 'absoluta' | 'gran_invalidez';
export type OrigenContingencia = 'comun' | 'profesional'; // Enfermedad común/AT o EP

export interface ParametrosPensionIncapacidad {
  /** Grado de incapacidad permanente declarado */
  gradoIncapacidad: GradoIncapacidad;
  /** Origen de la contingencia */
  origenContingencia: OrigenContingencia;
  /**
   * Suma de bases de cotización del período de referencia (€):
   * - Contingencias comunes: últimos 8 años (112 mensualidades)
   * - Contingencias profesionales: últimos 12 meses
   * El servidor calculará la base reguladora dividiendo por el nº de meses.
   */
  sumaBasesCotizacion: number;
  /** Edad del beneficiario (años) — para recargo IPT ≥ 55 años */
  edad: number;
  /** ¿Tiene cónyuge a cargo? (afecta a la pensión mínima) */
  tieneConyuge?: boolean;
  /**
   * Última base de cotización mensual (€) — necesaria para el complemento de GI.
   * Si no se indica, se usará la base reguladora calculada.
   */
  ultimaBaseCotizacion?: number;
}

export interface ResultadoPensionIncapacidad {
  /** Grado de incapacidad */
  gradoIncapacidad: GradoIncapacidad;
  /** Origen de la contingencia */
  origenContingencia: OrigenContingencia;
  /** Base reguladora mensual (€) */
  baseReguladora: number;
  /** Porcentaje aplicado sobre la base reguladora (%) */
  porcentajeAplicado: number;
  /** ¿Se aplica recargo por edad ≥ 55 años en IPT? */
  recargo55Anios: boolean;
  /**
   * Cuantía bruta mensual calculada (antes de aplicar mínimos) (€).
   * Para IP Parcial: importe de la indemnización a tanto alzado (€ total).
   */
  cuantiaBrutaMensual: number;
  /**
   * Para IP Parcial: importe total de la indemnización (€).
   * Para otros grados: igual a cuantiaBrutaMensual.
   */
  indemnizacionTotalIPParcial?: number;
  /** Complemento de gran invalidez (€/mes) — solo GI */
  complementoGranInvalidez?: number;
  /** Cuantía bruta mensual total incluyendo complemento GI (€) */
  cuantiaBrutaTotalMensual: number;
  /** Pensión mínima garantizada (€/mes) */
  pensionMinimaGarantizada: number;
  /** **Cuantía mensual efectiva (máximo de calculada y mínima) (€)** */
  cuantiaEfectivaMensual: number;
  /** Cuantía anual estimada (14 pagas) (€) */
  cuantiaAnual14Pagas: number;
  /** Explicación del cálculo */
  explicacion: string;
  /** Advertencias */
  advertencias: string[];
  /** Fuente normativa */
  fuenteDatos: string;
}

// ─── Función principal ─────────────────────────────────────────────────────────

export function calcularPensionIncapacidad(p: ParametrosPensionIncapacidad): ResultadoPensionIncapacidad {
  if (p.sumaBasesCotizacion <= 0) throw new Error('La suma de bases de cotización debe ser mayor que cero.');
  if (p.edad < 16 || p.edad > 100) throw new Error('La edad debe estar entre 16 y 100 años.');

  const r = (n: number) => Math.round(n * 100) / 100;
  const tieneConyuge = p.tieneConyuge ?? false;

  // Base reguladora
  const mesesDivisor = p.origenContingencia === 'profesional' ? MESES_BR_PROFESIONALES : MESES_BR_COMUNES;
  const baseReguladora = r(p.sumaBasesCotizacion / mesesDivisor);

  const advertencias: string[] = [];

  if (p.gradoIncapacidad === 'parcial') {
    // IP Parcial: indemnización a tanto alzado = 24 mensualidades de BR
    const indemnizacionTotal = r(baseReguladora * 24);
    advertencias.push('La IP Parcial no genera pensión periódica, sino una indemnización a tanto alzado equivalente a 24 mensualidades de la base reguladora (art. 196.1 LGSS).');
    advertencias.push('La IP Parcial solo puede declararse para trabajadores por cuenta ajena, no para autónomos.');
    advertencias.push('El INSS puede revisar el grado de incapacidad transcurridos 2 años desde la resolución.');

    return {
      gradoIncapacidad: 'parcial',
      origenContingencia: p.origenContingencia,
      baseReguladora,
      porcentajeAplicado: 0,
      recargo55Anios: false,
      cuantiaBrutaMensual: 0,
      indemnizacionTotalIPParcial: indemnizacionTotal,
      cuantiaBrutaTotalMensual: 0,
      pensionMinimaGarantizada: 0,
      cuantiaEfectivaMensual: 0,
      cuantiaAnual14Pagas: 0,
      explicacion: `IP Parcial: indemnización única de ${indemnizacionTotal.toLocaleString('es-ES', { minimumFractionDigits: 2 })} € (24 × ${baseReguladora.toLocaleString('es-ES', { minimumFractionDigits: 2 })} € BR). No genera pensión mensual.`,
      advertencias,
      fuenteDatos: 'LGSS art. 196.1 — vigente 2025',
    };
  }

  let porcentajeAplicado: number;
  let recargo55Anios = false;
  let pensionMinimaGarantizada: number;
  let explicacion: string;

  switch (p.gradoIncapacidad) {
    case 'total':
      porcentajeAplicado = 55;
      if (p.edad >= 55) {
        porcentajeAplicado += RECARGO_IPT_55_ANIOS;
        recargo55Anios = true;
      }
      pensionMinimaGarantizada = tieneConyuge
        ? PENSION_MINIMA_IPT_CON_CONYUGE
        : (p.edad >= 55 ? PENSION_MINIMA_IPT_SIN_CONYUGE_MAYOR55 : PENSION_MINIMA_IPT_SIN_CONYUGE_MENOR55);
      explicacion = `IPT: ${p.edad >= 55 ? '55% + 20% recargo edad ≥ 55 = 75%' : '55%'} × ${baseReguladora.toLocaleString('es-ES', { minimumFractionDigits: 2 })} € BR`;
      break;

    case 'absoluta':
      porcentajeAplicado = 100;
      pensionMinimaGarantizada = tieneConyuge ? PENSION_MINIMA_IPA_CON_CONYUGE : PENSION_MINIMA_IPA_SIN_CONYUGE;
      explicacion = `IPA: 100% × ${baseReguladora.toLocaleString('es-ES', { minimumFractionDigits: 2 })} € BR`;
      break;

    case 'gran_invalidez':
      porcentajeAplicado = 100;
      pensionMinimaGarantizada = PENSION_MINIMA_GI;
      explicacion = `Gran Invalidez: 100% × ${baseReguladora.toLocaleString('es-ES', { minimumFractionDigits: 2 })} € BR + complemento tercera persona`;
      break;

    default:
      throw new Error(`Grado de incapacidad no reconocido: ${p.gradoIncapacidad}`);
  }

  const cuantiaBrutaMensual = r(baseReguladora * porcentajeAplicado / 100);

  let complementoGranInvalidez: number | undefined;
  let cuantiaBrutaTotalMensual = cuantiaBrutaMensual;

  if (p.gradoIncapacidad === 'gran_invalidez') {
    const ultimaBase = p.ultimaBaseCotizacion ?? baseReguladora;
    complementoGranInvalidez = r(
      (IPREM_MENSUAL_2025 * PCT_COMPLEMENTO_GI_IPREM / 100) +
      (ultimaBase * PCT_COMPLEMENTO_GI_BASE / 100)
    );
    cuantiaBrutaTotalMensual = r(cuantiaBrutaMensual + complementoGranInvalidez);
  }

  const cuantiaEfectivaMensual = Math.max(cuantiaBrutaTotalMensual, pensionMinimaGarantizada);
  const cuantiaAnual14Pagas = r(cuantiaEfectivaMensual * 14);

  advertencias.push('La base reguladora es orientativa. El INSS calcula la base con las cotizaciones reales de la TGSS. Consultar vida laboral.');
  advertencias.push('Las pensiones de IP Absoluta y Gran Invalidez están exentas de IRPF (LIRPF art. 7.f). La IPT tributa salvo que se derive de accidente de trabajo o enfermedad profesional.');
  advertencias.push('La pensión de incapacidad es compatible con el trabajo, con limitaciones según el grado. Consultar con el INSS antes de reincorporarse.');
  if (p.gradoIncapacidad === 'total') {
    advertencias.push('La IPT puede complementarse con la prestación por desempleo si no se ha agotado. Verificar con el SEPE.');
  }
  if (p.gradoIncapacidad === 'gran_invalidez') {
    advertencias.push(`Complemento de Gran Invalidez: ${PCT_COMPLEMENTO_GI_IPREM}% IPREM (${r(IPREM_MENSUAL_2025 * PCT_COMPLEMENTO_GI_IPREM / 100).toLocaleString('es-ES', { minimumFractionDigits: 2 })} €) + ${PCT_COMPLEMENTO_GI_BASE}% última base cotización (art. 139 LGSS).`);
  }

  return {
    gradoIncapacidad: p.gradoIncapacidad,
    origenContingencia: p.origenContingencia,
    baseReguladora,
    porcentajeAplicado,
    recargo55Anios,
    cuantiaBrutaMensual,
    cuantiaBrutaTotalMensual,
    complementoGranInvalidez,
    pensionMinimaGarantizada,
    cuantiaEfectivaMensual: r(cuantiaEfectivaMensual),
    cuantiaAnual14Pagas,
    explicacion,
    advertencias,
    fuenteDatos: 'LGSS arts. 194-200 + IPREM 2025 (600 €/mes) + pensiones mínimas 2025 — vigente 2025',
  };
}
