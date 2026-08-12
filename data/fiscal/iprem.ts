/**
 * IPREM (Indicador Público de Renta de Efectos Múltiples) 2026
 *
 * Referencia para el cálculo de topes de prestaciones (desempleo, subsidios,
 * becas, ayudas a la vivienda, etc.).
 *
 * El IPREM permanece congelado desde 2022 (no se actualiza desde la Ley de
 * Presupuestos 2023, prorrogados). El valor 2026 coincide con el de 2025.
 *
 * Fuente: Ley 31/2022 de PGE 2023 (prorrogados) — IPREM 2026 = IPREM 2025
 * Verificado: 2026-08-12 (las cuatro cifras confirmadas sin cambios)
 */

export const FISCAL_IPREM_META = {
  fuente: 'Ley 31/2022 de PGE 2023 (prorrogados) — IPREM congelado desde 2022',
  verificado: '2026-08-12',
  vigencia: '2026',
  urlOficial: 'https://www.boe.es/buscar/doc.php?id=BOE-A-2022-22685',
  nota: 'El IPREM 2026 no varía respecto a 2025 al mantenerse la prórroga presupuestaria.',
};

export const IPREM_2026 = {
  diario: 20,          // €/día (7.200€/año ÷ 360 días)
  mensual: 600,        // €/mes (12 pagas)
  anual12: 7200,       // €/año (12 pagas)
  anual14: 8400,       // €/año (con 14 pagas = referencia para cálculo de topes)
  // La SS usa año de 360 días (30 días × 12 meses) para el cálculo de topes:
  // 8.400 / 360 = 23,33 €/día. Verificado contra simulador SEPE 2026-06-09.
  diario14: 8400 / 360,
};
