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
 *     Prestación: 100% BR + complemento (45% base mínima de cotización + 30% última
 *     base de cotización, con un mínimo del 45% de la pensión sin complemento)
 *
 * Base reguladora (art. 197 LGSS — contingencias comunes):
 *   BR = Suma bases cotización últimos 8 años / 112
 *   (8 años × 12 meses + 4 pagas = 96 + 16 = 112)
 *   Para contingencias profesionales (AT/EP): bases de los últimos 12 meses / 12
 *
 * Pensión mínima 2026: varía según grado, tramo de edad y situación familiar
 * (ver `PENSIONES_MINIMAS_2026` en `data/fiscal/pensiones.ts`, revalorizadas +2,8%).
 * Complemento de Gran Invalidez (art. 196.4 LGSS): 45% de la base mínima de
 * cotización vigente (BASES_SS_2025.minima) + 30% de la última base de cotización
 * del trabajador, con un mínimo del 45% de la pensión sin complemento.
 *
 * Fuente: LGSS arts. 194-200 + pensiones mínimas 2026 (data/fiscal/pensiones.ts)
 * Verificado: 2026-06-13
 *
 * Encadenable con: calcular_baja_medica, calcular_pension_publica, calcular_sueldo_neto
 */

import { BASES_SS_2025, PENSIONES_MINIMAS_2026 } from '@/data/fiscal';

// ─── Constantes ─────────────────────────────────────────────────────────────────

const MESES_BR_COMUNES = 112;                 // 8 años × 12 meses + 4 pagas extra
const MESES_BR_PROFESIONALES = 12;

// Recargo IPT ≥ 55 años por dificultad de reempleo
const RECARGO_IPT_55_ANIOS = 20; // % adicional sobre BR

// Complemento GI (art. 196.4 LGSS)
const PCT_COMPLEMENTO_GI_BASE_MINIMA = 45; // % de la base mínima de cotización vigente
const PCT_COMPLEMENTO_GI_BASE = 30;        // % de la última base de cotización
const PCT_COMPLEMENTO_GI_MINIMO = 45;      // % mínimo sobre la pensión sin complemento

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

/** Busca el importe de pensión mínima 2026 (con/sin cónyuge a cargo) para un subtipo de incapacidad. */
function pensionMinimaIncapacidad(subtipo: string, tieneConyuge: boolean): number {
  const entrada = PENSIONES_MINIMAS_2026.find(e => e.tipo === 'incapacidad' && e.subtipo === subtipo);
  if (!entrada) throw new Error(`No se encontró la pensión mínima 2026 para incapacidad/${subtipo}.`);
  return tieneConyuge ? entrada.conConyuge : entrada.unipersonal;
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
      fuenteDatos: 'LGSS art. 196.1 — vigente 2026',
    };
  }

  let porcentajeAplicado: number;
  let recargo55Anios = false;
  let pensionMinimaGarantizada: number;
  let explicacion: string;

  switch (p.gradoIncapacidad) {
    case 'total': {
      porcentajeAplicado = 55;
      if (p.edad >= 55) {
        porcentajeAplicado += RECARGO_IPT_55_ANIOS;
        recargo55Anios = true;
      }
      // La pensión mínima de IPT depende del tramo de edad (≥65, 60-64, <60), no del recargo a partir de 55 años.
      const subtipoIPT = p.edad >= 65 ? 'total_65_o_mas' : (p.edad >= 60 ? 'total_60_64' : 'total_menos_60');
      pensionMinimaGarantizada = pensionMinimaIncapacidad(subtipoIPT, tieneConyuge);
      explicacion = `IPT: ${p.edad >= 55 ? '55% + 20% recargo edad ≥ 55 = 75%' : '55%'} × ${baseReguladora.toLocaleString('es-ES', { minimumFractionDigits: 2 })} € BR`;
      break;
    }

    case 'absoluta':
      porcentajeAplicado = 100;
      pensionMinimaGarantizada = pensionMinimaIncapacidad('absoluta', tieneConyuge);
      explicacion = `IPA: 100% × ${baseReguladora.toLocaleString('es-ES', { minimumFractionDigits: 2 })} € BR`;
      break;

    case 'gran_invalidez':
      porcentajeAplicado = 100;
      pensionMinimaGarantizada = pensionMinimaIncapacidad('gran_invalidez', tieneConyuge);
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
    const complementoCalculado = r(
      (BASES_SS_2025.minima * PCT_COMPLEMENTO_GI_BASE_MINIMA / 100) +
      (ultimaBase * PCT_COMPLEMENTO_GI_BASE / 100)
    );
    const complementoMinimo = r(cuantiaBrutaMensual * PCT_COMPLEMENTO_GI_MINIMO / 100);
    complementoGranInvalidez = Math.max(complementoCalculado, complementoMinimo);
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
    advertencias.push(`Complemento de Gran Invalidez: ${PCT_COMPLEMENTO_GI_BASE_MINIMA}% de la base mínima de cotización 2025 (${BASES_SS_2025.minima.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €) + ${PCT_COMPLEMENTO_GI_BASE}% última base de cotización, con un mínimo del ${PCT_COMPLEMENTO_GI_MINIMO}% de la pensión sin complemento (art. 196.4 LGSS).`);
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
    fuenteDatos: 'LGSS arts. 194-200 + base mínima de cotización 2025 (1.381,20 €/mes, Orden PJC/178/2025, pendiente de actualizar a Orden 2026) + pensiones mínimas 2026 (+2,8% revalorización) — vigente 2026',
  };
}
