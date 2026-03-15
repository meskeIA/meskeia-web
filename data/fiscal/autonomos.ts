/**
 * Datos fiscales: Autónomos (RETA)
 *
 * ⚠️ HERRAMIENTA DE ORIENTACIÓN — No constituye asesoramiento fiscal.
 * Datos verificados a la fecha indicada. Pueden haber cambiado en 2026.
 * Verifica siempre en la fuente oficial antes de tomar decisiones.
 *
 * Fuente: Real Decreto-ley 13/2022 + Orden ISM/835/2023
 * Verificado: 2025-01-01
 * URL oficial: https://www.seg-social.es/wps/portal/wss/internet/Trabajadores/Afiliacion/10817
 */

export const FISCAL_AUTONOMOS_META = {
  fuente: 'Real Decreto-ley 13/2022, de 26 de julio + Orden ISM/835/2023',
  descripcion: 'Sistema de cotización por ingresos reales para autónomos',
  verificado: '2025-01-01',
  vigencia: '2025',
  urlOficial: 'https://www.seg-social.es/wps/portal/wss/internet/Trabajadores/Afiliacion/10817',
  nota: 'Datos 2025 basados en la tabla transitoria del RDL 13/2022. Verificar posibles ajustes para 2026 en la fuente oficial.',
};

// Tipo de cotización general RETA 2025
export const TIPO_COTIZACION_RETA = 0.313; // 31,30%

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
 * Tabla de tramos 2025 según RDL 13/2022
 * Rendimiento neto = Ingresos - Gastos deducibles - Cuota SS
 */
export const TRAMOS_RETA_2025: TramoCotizacion[] = [
  // TABLA REDUCIDA (rendimientos < SMI)
  { id: 1,  rendimientoMin: 0,       rendimientoMax: 670,     baseMinima: 653.59,  baseMaxima: 718.95,  cuotaMinima: 204.57, cuotaMaxima: 225.03 },
  { id: 2,  rendimientoMin: 670,     rendimientoMax: 900,     baseMinima: 718.95,  baseMaxima: 900,     cuotaMinima: 225.03, cuotaMaxima: 281.70 },
  { id: 3,  rendimientoMin: 900,     rendimientoMax: 1166.70, baseMinima: 872.55,  baseMaxima: 1166.70, cuotaMinima: 273.11, cuotaMaxima: 365.18 },
  // TABLA GENERAL (rendimientos >= SMI)
  { id: 4,  rendimientoMin: 1166.70, rendimientoMax: 1300,    baseMinima: 950.98,  baseMaxima: 1300,    cuotaMinima: 297.66, cuotaMaxima: 406.90 },
  { id: 5,  rendimientoMin: 1300,    rendimientoMax: 1500,    baseMinima: 960.78,  baseMaxima: 1500,    cuotaMinima: 300.72, cuotaMaxima: 469.50 },
  { id: 6,  rendimientoMin: 1500,    rendimientoMax: 1700,    baseMinima: 960.78,  baseMaxima: 1700,    cuotaMinima: 300.72, cuotaMaxima: 532.10 },
  { id: 7,  rendimientoMin: 1700,    rendimientoMax: 1850,    baseMinima: 1045.75, baseMaxima: 1850,    cuotaMinima: 327.32, cuotaMaxima: 579.05 },
  { id: 8,  rendimientoMin: 1850,    rendimientoMax: 2030,    baseMinima: 1062.09, baseMaxima: 2030,    cuotaMinima: 332.43, cuotaMaxima: 635.39 },
  { id: 9,  rendimientoMin: 2030,    rendimientoMax: 2330,    baseMinima: 1078.43, baseMaxima: 2330,    cuotaMinima: 337.55, cuotaMaxima: 729.29 },
  { id: 10, rendimientoMin: 2330,    rendimientoMax: 2760,    baseMinima: 1111.11, baseMaxima: 2760,    cuotaMinima: 347.78, cuotaMaxima: 863.88 },
  { id: 11, rendimientoMin: 2760,    rendimientoMax: 3190,    baseMinima: 1176.47, baseMaxima: 3190,    cuotaMinima: 368.23, cuotaMaxima: 998.47 },
  { id: 12, rendimientoMin: 3190,    rendimientoMax: 3620,    baseMinima: 1241.83, baseMaxima: 3620,    cuotaMinima: 388.69, cuotaMaxima: 1133.06 },
  { id: 13, rendimientoMin: 3620,    rendimientoMax: 4050,    baseMinima: 1307.19, baseMaxima: 4050,    cuotaMinima: 409.15, cuotaMaxima: 1267.65 },
  { id: 14, rendimientoMin: 4050,    rendimientoMax: 6000,    baseMinima: 1454.25, baseMaxima: 4720.50, cuotaMinima: 455.18, cuotaMaxima: 1477.52 },
  { id: 15, rendimientoMin: 6000,    rendimientoMax: null,    baseMinima: 1732.03, baseMaxima: 4720.50, cuotaMinima: 542.13, cuotaMaxima: 1477.52 },
];

// Bases de referencia
export const BASES_RETA_2025 = {
  minima: 653.59,
  maxima: 4720.50,
};

// Tarifa plana para nuevos autónomos
export const TARIFA_PLANA_2025 = {
  cuota: 80,        // € mensuales
  duracion: 12,     // meses
  urlInfo: 'https://www.seg-social.es/wps/portal/wss/internet/Trabajadores/Afiliacion/10817/32232',
};
