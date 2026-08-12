/**
 * Datos fiscales: Autónomos (RETA)
 *
 * ⚠️ HERRAMIENTA DE ORIENTACIÓN — No constituye asesoramiento fiscal.
 * Datos verificados a la fecha indicada. Pueden haber cambiado.
 * Verifica siempre en la fuente oficial antes de tomar decisiones.
 *
 * Fuente: Real Decreto-ley 13/2022 + Orden PJC/297/2026, de 30 de marzo (art. 18)
 * Verificado: 2026-08-12 (tabla de tramos contrastada contra el texto del BOE)
 * URL oficial: https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-7296
 *
 * ⚠️ 2026-08-12: hasta hoy la tabla se había verificado contra la GUÍA WEB de
 *    Importass, no contra la norma. Al contrastarla con el art. 18 de la Orden
 *    apareció una diferencia: la base máxima del tramo 1 de la tabla reducida
 *    es 718,94 €, no 718,95 € (que es la base MÍNIMA del tramo 2). Un céntimo,
 *    sin efecto en la cuota redondeada, pero el resto de la tabla —catorce
 *    filas— coincide exactamente, así que la única cifra que discrepaba era
 *    precisamente la que no venía de la fuente primaria.
 */

export const FISCAL_AUTONOMOS_META = {
  fuente: 'Real Decreto-ley 13/2022 + Orden PJC/297/2026 (cotización 2026, art. 18)',
  descripcion: 'Sistema de cotización por ingresos reales para autónomos',
  verificado: '2026-08-12',
  vigencia: '2026',
  urlOficial: 'https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-7296',
  nota: 'Tipo 31,50%: CC 28,30% + AT/EP 1,30% + MEI 0,90% (los tres fijados en el art. 18.2 de la Orden PJC/297/2026) + Cese 0,90% + FP 0,10% (LGSS, no los repite la Orden anual). La guía web de Importass sigue mostrando "31,40%" en su encabezado, texto heredado de 2025: manda la Orden.',
};

// Tipo de cotización general RETA 2026
// Desglose: CC 28,30% + AT/EP 1,30% + Cese 0,90% + FP 0,10% + MEI 0,90% = 31,50%
// Fuente: desglose de componentes publicado en importass.seg-social.es (2026-06-09)
export const TIPO_COTIZACION_RETA = 0.315; // 31,50%

// Tramo de cotización por ingresos reales
export interface TramoCotizacion {
  id: number;
  rendimientoMin: number;
  rendimientoMax: number | null; // null = sin límite superior
  baseMinima: number;
  baseMaxima: number;
  cuotaMinima: number;
  cuotaMaxima: number;
}

/**
 * Tabla de tramos 2026 (importass.seg-social.es, verificada 2026-06-09)
 * Rendimiento neto = Ingresos - Gastos deducibles - Cuota SS
 * cuotaMinima/cuotaMaxima = baseMinima/Maxima × 31,50% (informativo)
 */
export const TRAMOS_RETA_2025: TramoCotizacion[] = [
  // TABLA REDUCIDA (rendimientos < SMI anual)
  { id: 1,  rendimientoMin: 0,       rendimientoMax: 670,     baseMinima: 653.59,  baseMaxima: 718.94,  cuotaMinima: 205.88, cuotaMaxima: 226.47 },
  { id: 2,  rendimientoMin: 670,     rendimientoMax: 900,     baseMinima: 718.95,  baseMaxima: 900,     cuotaMinima: 226.47, cuotaMaxima: 283.50 },
  { id: 3,  rendimientoMin: 900,     rendimientoMax: 1166.70, baseMinima: 849.67,  baseMaxima: 1166.70, cuotaMinima: 267.65, cuotaMaxima: 367.51 },
  // TABLA GENERAL (rendimientos >= SMI anual)
  { id: 4,  rendimientoMin: 1166.70, rendimientoMax: 1300,    baseMinima: 950.98,  baseMaxima: 1300,    cuotaMinima: 299.56, cuotaMaxima: 409.50 },
  { id: 5,  rendimientoMin: 1300,    rendimientoMax: 1500,    baseMinima: 960.78,  baseMaxima: 1500,    cuotaMinima: 302.65, cuotaMaxima: 472.50 },
  { id: 6,  rendimientoMin: 1500,    rendimientoMax: 1700,    baseMinima: 960.78,  baseMaxima: 1700,    cuotaMinima: 302.65, cuotaMaxima: 535.50 },
  { id: 7,  rendimientoMin: 1700,    rendimientoMax: 1850,    baseMinima: 1143.79, baseMaxima: 1850,    cuotaMinima: 360.29, cuotaMaxima: 582.75 },
  { id: 8,  rendimientoMin: 1850,    rendimientoMax: 2030,    baseMinima: 1209.15, baseMaxima: 2030,    cuotaMinima: 380.88, cuotaMaxima: 639.45 },
  { id: 9,  rendimientoMin: 2030,    rendimientoMax: 2330,    baseMinima: 1274.51, baseMaxima: 2330,    cuotaMinima: 401.47, cuotaMaxima: 733.95 },
  { id: 10, rendimientoMin: 2330,    rendimientoMax: 2760,    baseMinima: 1356.21, baseMaxima: 2760,    cuotaMinima: 427.21, cuotaMaxima: 869.40 },
  { id: 11, rendimientoMin: 2760,    rendimientoMax: 3190,    baseMinima: 1437.91, baseMaxima: 3190,    cuotaMinima: 452.94, cuotaMaxima: 1004.85 },
  { id: 12, rendimientoMin: 3190,    rendimientoMax: 3620,    baseMinima: 1519.61, baseMaxima: 3620,    cuotaMinima: 478.68, cuotaMaxima: 1140.30 },
  { id: 13, rendimientoMin: 3620,    rendimientoMax: 4050,    baseMinima: 1601.31, baseMaxima: 4050,    cuotaMinima: 504.41, cuotaMaxima: 1275.75 },
  { id: 14, rendimientoMin: 4050,    rendimientoMax: 6000,    baseMinima: 1732.03, baseMaxima: 5101.20, cuotaMinima: 545.59, cuotaMaxima: 1606.88 },
  { id: 15, rendimientoMin: 6000,    rendimientoMax: null,    baseMinima: 1928.10, baseMaxima: 5101.20, cuotaMinima: 607.35, cuotaMaxima: 1606.88 },
];

// Bases de referencia 2026
export const BASES_RETA_2025 = {
  minima: 653.59,
  maxima: 5101.20,
};

// Tarifa plana para nuevos autónomos
export const TARIFA_PLANA_2025 = {
  cuota: 80,        // € mensuales
  duracion: 12,     // meses
  urlInfo: 'https://www.seg-social.es/wps/portal/wss/internet/Trabajadores/Afiliacion/10817/32232',
};
