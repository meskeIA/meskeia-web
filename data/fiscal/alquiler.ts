/**
 * data/fiscal/alquiler.ts
 *
 * Índices de actualización de alquiler en España
 *
 * IRAV: Índice de Referencia de Actualización de Vivienda
 * - Fuente: INE — https://www.ine.es/jaxiT3/Tabla.htm?t=25171
 * - Publicado trimestralmente por el INE
 * - Aplica a contratos firmados desde el 26 de mayo de 2023 (Ley 12/2023, BOE 25/05/2023)
 *
 * IPC Interanual: Índice de Precios al Consumo (variación interanual)
 * - Fuente: INE — https://www.ine.es/jaxiT3/Tabla.htm?t=22350
 * - Publicado mensualmente
 * - Aplica a contratos firmados ANTES del 26 de mayo de 2023
 *
 * Versión: 1.0.0
 * Última verificación: 2026-04-01
 * ⚠️ Verificar valores con el INE antes de aplicar en un contrato real.
 */

export const ALQUILER_META = {
  fuente: 'INE — Índice de Referencia de Actualización de Vivienda (IRAV) + IPC Interanual · Ley 12/2023 de Vivienda',
  verificado: '2026-04-01',
  vigencia: '2026',
  urlOficial: 'https://www.ine.es/jaxiT3/Tabla.htm?t=25171',
  nota: 'El IRAV se publica trimestralmente. Contratos anteriores al 26/05/2023 usan IPC interanual. Verificar índice vigente en el INE.',
};

/** Fecha de entrada en vigor del IRAV (Ley 12/2023 de Vivienda) */
export const FECHA_CORTE_LEY_VIVIENDA = '2023-05-26';

/**
 * IRAV por trimestre (clave: 'YYYY-Q#')
 * Valor = porcentaje máximo de actualización de renta (sin signo %)
 *
 * Contratos firmados desde el 26/05/2023.
 * Se aplica el IRAV del trimestre en que cae el aniversario del contrato.
 */
export const IRAV_POR_TRIMESTRE: Record<string, number> = {
  '2023-Q4': 2.0,  // oct-dic 2023
  '2024-Q1': 3.0,  // ene-mar 2024
  '2024-Q2': 3.3,  // abr-jun 2024
  '2024-Q3': 2.5,  // jul-sep 2024
  '2024-Q4': 1.9,  // oct-dic 2024
  '2025-Q1': 2.08, // ene-mar 2025 (media mensual INE: 2.19, 2.08, 1.98)
  '2025-Q2': 2.06, // abr-jun 2025 (media mensual INE: 2.09, 1.99, 2.10)
  '2025-Q3': 2.19, // jul-sep 2025 (media mensual INE: 2.15, 2.19, 2.22)
  '2025-Q4': 2.29, // oct-dic 2025 (media mensual INE: 2.25, 2.29, 2.32)
  '2026-Q1': 2.15, // ene-feb 2026 (media INE: 2.14, 2.16 — mar pendiente ~14 abr)
};

/**
 * IPC interanual por mes (clave: 'YYYY-MM')
 * Valor = variación porcentual respecto al mismo mes del año anterior
 *
 * Contratos firmados ANTES del 26/05/2023.
 * Se aplica el IPC del mes anterior al aniversario del contrato.
 */
export const IPC_INTERANUAL_POR_MES: Record<string, number> = {
  // 2023
  '2023-01': 5.9,
  '2023-02': 6.0,
  '2023-03': 3.3,
  '2023-04': 4.1,
  '2023-05': 3.2,
  '2023-06': 1.9,
  '2023-07': 2.3,
  '2023-08': 2.6,
  '2023-09': 3.5,
  '2023-10': 3.5,
  '2023-11': 3.2,
  '2023-12': 3.1,
  // 2024
  '2024-01': 3.4,
  '2024-02': 2.8,
  '2024-03': 3.2,
  '2024-04': 3.3,
  '2024-05': 3.6,
  '2024-06': 3.4,
  '2024-07': 2.9,
  '2024-08': 2.4,
  '2024-09': 1.5,
  '2024-10': 1.8,
  '2024-11': 2.4,
  '2024-12': 2.8,
  // 2025
  '2025-01': 2.9,
  '2025-02': 3.0,
  '2025-03': 2.3,
  '2025-04': 2.2,
  '2025-05': 2.0,
  '2025-06': 1.8,
  '2025-07': 1.8,
  '2025-08': 1.6,
  '2025-09': 1.5,
  '2025-10': 1.6,
  '2025-11': 1.8,
  '2025-12': 2.0,
  // 2026
  '2026-01': 2.9,
  '2026-02': 2.8,
};

/** Devuelve la clave del trimestre IRAV para un mes dado (1-12) */
export function mesATrimestreIRAV(anio: number, mes: number): string {
  const trimestre = Math.ceil(mes / 3);
  return `${anio}-Q${trimestre}`;
}

/** Devuelve la clave de mes anterior (para IPC de contratos viejos) */
export function mesAnteriorClave(anio: number, mes: number): string {
  if (mes === 1) {
    return `${anio - 1}-12`;
  }
  const mesAnterior = mes - 1;
  return `${anio}-${String(mesAnterior).padStart(2, '0')}`;
}
