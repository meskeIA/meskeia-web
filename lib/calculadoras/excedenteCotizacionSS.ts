/**
 * Calculadora de Devolución por Exceso de Cotización SS (Pluriactividad) — lógica pura
 * Usada por: MCP server (calcular_excedente_cotizacion_ss)
 *
 * Calcula el derecho a devolución de cuotas de Seguridad Social cuando un
 * trabajador cotiza simultáneamente en el Régimen General (RGSS) y en el
 * Régimen Especial de Trabajadores Autónomos (RETA), superando la base máxima
 * de cotización anual.
 *
 * Pluriactividad (LGSS art. 313):
 *   Los trabajadores en pluriactividad (RGSS + RETA simultáneamente) pueden
 *   solicitar la devolución del exceso de cotizaciones SS si la suma de sus
 *   cotizaciones en ambos regímenes supera el 53,26% de la base máxima de
 *   cotización del ejercicio multiplicada por 12.
 *
 * Base máxima de cotización 2025: 4.909,50 €/mes (58.914 €/año)
 * Límite total de cotizaciones (53,26% × base máxima anual):
 *   53,26% × 58.914 = 31.380,39 €/año (contingencias comunes)
 *
 * Procedimiento:
 *   1. Solicitar devolución a la TGSS antes del 30 de abril del año siguiente
 *   2. TGSS calcula el exceso y devuelve el 50% del exceso cotizado
 *      (no se devuelve el 100% para no desvirtuar la cobertura)
 *   3. La devolución es de las cuotas de contingencias comunes únicamente
 *
 * Bonificación por pluriactividad con inicio simultaneo (para nuevos autónomos):
 *   Si el alta en RETA es simultánea al alta en el RGSS:
 *   - Opción A: reducción 50% cuota RETA los primeros 18 meses + 25% meses 19-24
 *   - Opción B: aplicar tarifa plana y al terminar, si hay exceso, solicitar devolución
 *   Esta calculadora cubre la devolución del exceso (no la bonificación inicial).
 *
 * Fuente: LGSS art. 313 + DA 3ª Ley 27/2011 — vigente 2025
 * Verificado: 2025-01-15
 *
 * Encadenable con: calcular_cuota_autonomo, calcular_sueldo_neto, calcular_modelo_130
 */

// ─── Constantes 2025 ────────────────────────────────────────────────────────────

const BASE_MAXIMA_MENSUAL_2025 = 4909.50;    // €/mes
const BASE_MAXIMA_ANUAL_2025 = BASE_MAXIMA_MENSUAL_2025 * 12; // €/año = 58.914 €
const PCT_LIMITE_COTIZACIONES = 53.26;        // % sobre base máxima anual
const LIMITE_TOTAL_COTIZACIONES_ANUALES = BASE_MAXIMA_ANUAL_2025 * PCT_LIMITE_COTIZACIONES / 100;
const PCT_DEVOLUCION_EXCESO = 50;            // % del exceso que se devuelve

// Tipos de cotización por contingencias comunes (trabajador)
const PCT_CONTINGENCIAS_COMUNES_RGSS = 4.70;  // % RGSS (parte trabajador)
const PCT_CONTINGENCIAS_COMUNES_RETA = 28.30; // % RETA (cuota íntegra del autónomo, incluye AT/EP)

// ─── Tipos públicos ────────────────────────────────────────────────────────────

export interface CotizacionesMesRGSS {
  /** Mes (1-12) */
  mes: number;
  /** Base de cotización por contingencias comunes en RGSS ese mes (€) */
  baseCotizacionCC: number;
  /** Cuota cotizada por contingencias comunes en RGSS ese mes (€) */
  cuotaCCRGSS?: number;
}

export interface ParametrosExcedenteCotizacionSS {
  /**
   * Bases de cotización mensuales en el RGSS durante el año.
   * Si se indica solo la anual, se distribuye uniformemente.
   */
  basesCotizacionRGSS?: CotizacionesMesRGSS[];
  /** Base de cotización anual total en RGSS (€) — alternativa a bases mensuales */
  baseCotizacionAnualRGSS?: number;
  /** Cuotas de contingencias comunes pagadas en RGSS durante el año (€) */
  cuotasCCAnualesRGSS?: number;
  /** Cuotas de contingencias comunes pagadas en RETA durante el año (€) */
  cuotasCCAnualesRETA: number;
  /** Meses cotizados en RETA durante el año */
  mesesCotizadosRETA?: number;
}

export interface ResultadoExcedenteCotizacionSS {
  /** Base máxima anual de cotización 2025 (€) */
  baseMaximaAnual: number;
  /** Límite de cotizaciones anuales (53,26% × base máxima) (€) */
  limiteAnualCotizaciones: number;
  /** Cuotas CC pagadas en RGSS durante el año (€) */
  cuotasCCRGSSAnuales: number;
  /** Cuotas CC pagadas en RETA durante el año (€) */
  cuotasCCRETAAnuales: number;
  /** Total cuotas cotizadas en ambos regímenes (€) */
  totalCuotasCotizadas: number;
  /** ¿Hay exceso sobre el límite? */
  hayExceso: boolean;
  /** Importe del exceso cotizado (€) */
  excesoCotizado: number;
  /** **Importe a devolver (50% del exceso) (€)** */
  importeADevolver: number;
  /** Plazo de solicitud de devolución */
  plazoDeSolicitud: string;
  /** Advertencias */
  advertencias: string[];
  /** Fuente normativa */
  fuenteDatos: string;
}

// ─── Función principal ─────────────────────────────────────────────────────────

export function calcularExcedenteCotizacionSS(p: ParametrosExcedenteCotizacionSS): ResultadoExcedenteCotizacionSS {
  if (p.cuotasCCAnualesRETA < 0) throw new Error('Las cuotas RETA no pueden ser negativas.');

  const r = (n: number) => Math.round(n * 100) / 100;
  const advertencias: string[] = [];

  // Calcular cuotas CC en RGSS
  let cuotasCCRGSS: number;
  if (p.cuotasCCAnualesRGSS !== undefined) {
    cuotasCCRGSS = r(p.cuotasCCAnualesRGSS);
  } else if (p.baseCotizacionAnualRGSS !== undefined) {
    cuotasCCRGSS = r(p.baseCotizacionAnualRGSS * PCT_CONTINGENCIAS_COMUNES_RGSS / 100);
  } else if (p.basesCotizacionRGSS && p.basesCotizacionRGSS.length > 0) {
    cuotasCCRGSS = r(p.basesCotizacionRGSS.reduce((s, m) => {
      return s + (m.cuotaCCRGSS ?? m.baseCotizacionCC * PCT_CONTINGENCIAS_COMUNES_RGSS / 100);
    }, 0));
  } else {
    throw new Error('Debe indicar las cuotas o bases de cotización del RGSS.');
  }

  const totalCuotasCotizadas = r(cuotasCCRGSS + p.cuotasCCAnualesRETA);
  const hayExceso = totalCuotasCotizadas > LIMITE_TOTAL_COTIZACIONES_ANUALES;
  const excesoCotizado = hayExceso ? r(totalCuotasCotizadas - LIMITE_TOTAL_COTIZACIONES_ANUALES) : 0;
  const importeADevolver = hayExceso ? r(excesoCotizado * PCT_DEVOLUCION_EXCESO / 100) : 0;

  advertencias.push('La devolución por exceso de cotizaciones en pluriactividad (LGSS art. 313) debe solicitarse a la TGSS antes del 30 de abril del año siguiente al ejercicio. Sin solicitud, se pierde el derecho.');
  advertencias.push(`Se devuelve el ${PCT_DEVOLUCION_EXCESO}% del exceso, no el 100%. El importe retenido se destina a mantener la cobertura de prestaciones en ambos regímenes.`);
  advertencias.push('La devolución solo aplica a cuotas de contingencias comunes. Las cuotas por AT/EP, cese de actividad, formación y otras contingencias del RETA NO se incluyen en el cálculo del exceso.');
  advertencias.push('Nuevos autónomos en pluriactividad: pueden optar por la reducción del 50% de la cuota RETA en los primeros 18 meses (y 25% los meses 19-24) como alternativa a la devolución posterior. Evaluar cuál opción es más beneficiosa según nivel de ingresos.');

  if (!hayExceso) {
    advertencias.push(`Las cuotas totales (${totalCuotasCotizadas.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €) no superan el límite (${r(LIMITE_TOTAL_COTIZACIONES_ANUALES).toLocaleString('es-ES', { minimumFractionDigits: 2 })} €). No hay exceso a devolver.`);
  }

  return {
    baseMaximaAnual: r(BASE_MAXIMA_ANUAL_2025),
    limiteAnualCotizaciones: r(LIMITE_TOTAL_COTIZACIONES_ANUALES),
    cuotasCCRGSSAnuales: cuotasCCRGSS,
    cuotasCCRETAAnuales: r(p.cuotasCCAnualesRETA),
    totalCuotasCotizadas,
    hayExceso,
    excesoCotizado,
    importeADevolver,
    plazoDeSolicitud: 'Antes del 30 de abril del año siguiente al ejercicio (ante la TGSS)',
    advertencias,
    fuenteDatos: 'LGSS art. 313 + DA 3ª Ley 27/2011 — base máxima 2025: 4.909,50 €/mes',
  };
}
