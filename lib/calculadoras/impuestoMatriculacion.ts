/**
 * Calculadora del Impuesto de Matriculación (IEDMT) — lógica pura sin React ni DOM
 * Usada por: MCP server (calcular_impuesto_matriculacion)
 *
 * Calcula el Impuesto Especial sobre Determinados Medios de Transporte (IEDMT)
 * conforme a la Ley 38/1992 de Impuestos Especiales (art. 65-74).
 *
 * El impuesto grava la primera matriculación de vehículos en España.
 * Los tipos dependen de las emisiones de CO₂ (medición WLTP desde 2021).
 *
 * TIPOS 2025 (Art. 70 Ley 38/1992 tras reforma por Ley 7/2022):
 * Turismo y vehículos hasta 9 plazas:
 *   - 0 - 120 g/km CO₂: 0% (exento)
 *   - 121 - 160 g/km CO₂: 4,75%
 *   - 161 - 200 g/km CO₂: 9,75%
 *   - Más de 200 g/km CO₂: 14,75%
 *
 * Vehículos eléctricos puros (BEV) y pila combustible: EXENTOS (0 emisiones)
 * Motos: tipos reducidos (0% hasta 120 g/km, 4,75% 121-160, 9,75% >161)
 *
 * Base imponible: valor de mercado del vehículo (precio factura sin matriculación)
 * El IVA NO forma parte de la base imponible.
 *
 * Encadenable con: calcular_leasing, calcular_prestamo, calcular_kilometraje
 */

// ─── Constantes ────────────────────────────────────────────────────────────────

export const TRAMOS_CO2_TURISMOS_2025 = [
  { hasta: 120,     tipo: 0,     descripcion: 'Exento (0-120 g/km CO₂ WLTP)' },
  { hasta: 160,     tipo: 4.75,  descripcion: 'Tipo reducido (121-160 g/km CO₂ WLTP)' },
  { hasta: 200,     tipo: 9.75,  descripcion: 'Tipo intermedio (161-200 g/km CO₂ WLTP)' },
  { hasta: Infinity, tipo: 14.75, descripcion: 'Tipo general (>200 g/km CO₂ WLTP)' },
];

// ─── Tipos públicos ────────────────────────────────────────────────────────────

export type TipoVehiculoIEDMT = 'turismo' | 'moto' | 'furgoneta' | 'electrico' | 'hibrido_enchufable';

export interface ParametrosImpuestoMatriculacion {
  /** Precio del vehículo sin IVA (base imponible del IEDMT) (€) */
  precioSinIVA: number;
  /** Tipo de vehículo. Por defecto 'turismo'. */
  tipoVehiculo?: TipoVehiculoIEDMT;
  /** Emisiones de CO₂ en ciclo WLTP (g/km). Para eléctricos usar 0. */
  emisionesCO2: number;
  /** ¿Comprador es persona física? (para calcular IVA del vehículo también). Por defecto true. */
  compradorePersonaFisica?: boolean;
  /** Tipo de IVA del vehículo (%). Por defecto 21. */
  tipoIVA?: number;
}

export interface ResultadoImpuestoMatriculacion {
  /** Tipo de vehículo */
  tipoVehiculo: TipoVehiculoIEDMT;
  /** Emisiones CO₂ (g/km) */
  emisionesCO2: number;
  /** Precio sin IVA (base imponible IEDMT) (€) */
  precioSinIVA: number;
  /** Tipo IEDMT aplicable (%) */
  tipoIEDMT: number;
  /** Cuota IEDMT (€) */
  cuotaIEDMT: number;
  /** ¿Está exento? */
  exento: boolean;
  /** Tramo CO₂ aplicado */
  tramoAplicado: string;
  /** IVA del vehículo (€) */
  cuotaIVA: number;
  /** Tipo de IVA (%) */
  tipoIVA: number;
  /** Coste total de adquisición (precio + IVA + IEDMT) (€) */
  costeTotalAdquisicion: number;
  /** Desglose del coste total */
  desglose: {
    precioSinIVA: number;
    iva: number;
    iedmt: number;
    total: number;
  };
  /** Consejo sobre la franja de emisiones */
  consejo: string;
  /** Fuente normativa */
  fuenteDatos: string;
}

// ─── Función principal ─────────────────────────────────────────────────────────

export function calcularImpuestoMatriculacion(p: ParametrosImpuestoMatriculacion): ResultadoImpuestoMatriculacion {
  if (p.precioSinIVA <= 0) throw new Error('El precio del vehículo debe ser mayor que cero.');
  if (p.emisionesCO2 < 0) throw new Error('Las emisiones de CO₂ no pueden ser negativas.');

  const r = (n: number) => Math.round(n * 100) / 100;

  const tipoVehiculo = p.tipoVehiculo ?? 'turismo';
  const tipoIVA = p.tipoIVA ?? 21;

  let tipoIEDMT: number;
  let tramoAplicado: string;
  let exento: boolean;

  // Vehículo eléctrico o híbrido enchufable con 0 emisiones → exento
  if (tipoVehiculo === 'electrico' || p.emisionesCO2 === 0) {
    tipoIEDMT = 0;
    tramoAplicado = 'Exento — vehículo eléctrico o 0 g/km CO₂';
    exento = true;
  } else if (tipoVehiculo === 'hibrido_enchufable') {
    // Híbrido enchufable: emisiones en ciclo WLTP suelen ser bajas (< 50 g/km)
    // Se aplican los tramos generales sobre las emisiones declaradas
    const tramo = TRAMOS_CO2_TURISMOS_2025.find(t => p.emisionesCO2 <= t.hasta)!;
    tipoIEDMT = tramo.tipo;
    tramoAplicado = tramo.descripcion;
    exento = tipoIEDMT === 0;
  } else {
    // Turismo, moto, furgoneta: tramos generales
    const tramo = TRAMOS_CO2_TURISMOS_2025.find(t => p.emisionesCO2 <= t.hasta)!;
    tipoIEDMT = tramo.tipo;
    tramoAplicado = tramo.descripcion;
    exento = tipoIEDMT === 0;
  }

  const cuotaIEDMT = r(p.precioSinIVA * tipoIEDMT / 100);
  const cuotaIVA = r(p.precioSinIVA * tipoIVA / 100);
  const costeTotalAdquisicion = r(p.precioSinIVA + cuotaIVA + cuotaIEDMT);

  // Consejo sobre franja
  let consejo: string;
  if (exento) {
    consejo = 'Vehículo exento de matriculación. Ahorro respecto al tramo 121-160 g/km: ' + r(p.precioSinIVA * 0.0475).toLocaleString('es-ES') + ' €.';
  } else if (p.emisionesCO2 <= 160) {
    const ahorroVsMaximo = r(p.precioSinIVA * (14.75 - tipoIEDMT) / 100);
    consejo = `Tramo favorable. Comparado con el máximo (14,75%), el ahorro es ${ahorroVsMaximo.toLocaleString('es-ES')} €.`;
  } else if (p.emisionesCO2 <= 200) {
    consejo = 'Tramo intermedio. Un vehículo con ≤160 g/km ahorraría ' + r(p.precioSinIVA * (9.75 - 4.75) / 100).toLocaleString('es-ES') + ' € en matriculación.';
  } else {
    consejo = 'Tramo máximo (>200 g/km). Valorar alternativas con menores emisiones para reducir la carga fiscal de matriculación.';
  }

  return {
    tipoVehiculo,
    emisionesCO2: p.emisionesCO2,
    precioSinIVA: r(p.precioSinIVA),
    tipoIEDMT,
    cuotaIEDMT,
    exento,
    tramoAplicado,
    cuotaIVA,
    tipoIVA,
    costeTotalAdquisicion,
    desglose: {
      precioSinIVA: r(p.precioSinIVA),
      iva: cuotaIVA,
      iedmt: cuotaIEDMT,
      total: costeTotalAdquisicion,
    },
    consejo,
    fuenteDatos: 'Ley 38/1992 de Impuestos Especiales art. 65-74 + reforma Ley 7/2022 — tramos CO₂ WLTP vigentes 2025',
  };
}
