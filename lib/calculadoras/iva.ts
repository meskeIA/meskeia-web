/**
 * Calculadora de IVA español — lógica pura sin React ni DOM
 * Usada por: MCP server (calcular_iva)
 *
 * Tipos vigentes España 2025:
 *   21% — general (mayoría de bienes y servicios)
 *   10% — reducido (alimentación no básica, hostelería, transporte, cultura...)
 *    4% — superreducido (alimentos básicos, medicamentos, libros, prensa...)
 *    0% — exento (algunos servicios financieros, educativos, sanitarios...)
 */

// ─── Tipos públicos ────────────────────────────────────────────────────────────

export type TipoIVA = 21 | 10 | 4 | 0;
export type ModoIVA = 'anadir' | 'quitar';

export interface ParametrosIVA {
  /** Importe base sobre el que operar */
  importe: number;
  /** Tipo de IVA aplicable: 21, 10, 4 o 0 */
  tipoIVA: TipoIVA;
  /**
   * 'anadir' → el importe es sin IVA, calcular cuánto es con IVA
   * 'quitar' → el importe ya incluye IVA, extraer la base y el IVA
   */
  modo: ModoIVA;
}

export interface ResultadoIVA {
  /** Importe sin IVA (base imponible) */
  baseImponible: number;
  /** Tipo de IVA aplicado (%) */
  tipoIVA: number;
  /** Cuota de IVA en euros */
  cuotaIVA: number;
  /** Importe total con IVA */
  totalConIVA: number;
  /** Descripción del tipo aplicado */
  descripcionTipo: string;
}

// ─── Datos normativos ─────────────────────────────────────────────────────────

const DESCRIPCION_TIPO: Record<TipoIVA, string> = {
  21: 'IVA general (21%) — aplicable a la mayoría de bienes y servicios',
  10: 'IVA reducido (10%) — alimentación no básica, hostelería, transporte, espectáculos',
   4: 'IVA superreducido (4%) — alimentos básicos, medicamentos, libros, prensa',
   0: 'IVA 0% / exento — servicios financieros, educativos y sanitarios específicos',
};

// ─── Función principal ─────────────────────────────────────────────────────────

export function calcularIVA(p: ParametrosIVA): ResultadoIVA {
  if (p.importe <= 0) throw new Error('El importe debe ser mayor que cero.');
  if (![0, 4, 10, 21].includes(p.tipoIVA)) {
    throw new Error(`Tipo de IVA no válido: ${p.tipoIVA}. Valores válidos: 0, 4, 10, 21`);
  }

  const factor = p.tipoIVA / 100;
  let baseImponible: number;
  let cuotaIVA: number;
  let totalConIVA: number;

  if (p.modo === 'anadir') {
    // El importe es la base — añadir IVA encima
    baseImponible = p.importe;
    cuotaIVA = baseImponible * factor;
    totalConIVA = baseImponible + cuotaIVA;
  } else {
    // El importe ya incluye IVA — extraer la base
    totalConIVA = p.importe;
    baseImponible = totalConIVA / (1 + factor);
    cuotaIVA = totalConIVA - baseImponible;
  }

  const r = (n: number) => Math.round(n * 100) / 100;

  return {
    baseImponible:    r(baseImponible),
    tipoIVA:          p.tipoIVA,
    cuotaIVA:         r(cuotaIVA),
    totalConIVA:      r(totalConIVA),
    descripcionTipo:  DESCRIPCION_TIPO[p.tipoIVA],
  };
}
