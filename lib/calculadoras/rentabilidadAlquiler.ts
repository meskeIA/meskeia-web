/**
 * Calculadora de Rentabilidad de Alquiler — lógica pura sin React ni DOM
 * Usada por: MCP server (calcular_rentabilidad_alquiler)
 *
 * Calcula la rentabilidad bruta, neta, cash flow mensual y período de
 * recuperación de una inversión inmobiliaria destinada al alquiler.
 *
 * Fuente: app/calculadora-rentabilidad-alquiler — metodología estándar
 */

// ─── Tipos públicos ────────────────────────────────────────────────────────────

export interface ParametrosRentabilidadAlquiler {
  /** Precio de compra del inmueble (€) */
  precioCompra: number;
  /** % gastos de compra sobre el precio (ITP/AJD, notaría, registro). Por defecto 10% */
  porcentajeGastosCompra?: number;
  /** Reforma e inversión inicial adicional (€). Por defecto 0 */
  reforma?: number;
  /** Alquiler mensual esperado (€) */
  alquilerMensual: number;
  /** Tasa de ocupación esperada (%). Por defecto 95% */
  tasaOcupacion?: number;
  /** IBI anual (€). Por defecto 0 */
  ibi?: number;
  /** Gastos de comunidad anuales (€). Por defecto 0 */
  comunidad?: number;
  /** Seguro de hogar anual (€). Por defecto 0 */
  seguro?: number;
  /** Mantenimiento y reparaciones anuales estimados (€). Por defecto 0 */
  mantenimiento?: number;
  /** ¿Tiene hipoteca el inmueble? */
  conHipoteca?: boolean;
  /** Capital hipotecario pendiente/inicial (€) */
  capitalHipoteca?: number;
  /** Tipo de interés anual de la hipoteca (%). Por defecto 3.5% */
  tasaHipoteca?: number;
  /** Plazo restante de la hipoteca (años). Por defecto 25 */
  aniosHipoteca?: number;
}

export interface ResultadoRentabilidadAlquiler {
  /** Inversión total (compra + gastos + reforma) (€) */
  inversionTotal: number;
  /** Gastos de compra (notaría, impuestos, registro) (€) */
  gastosCompra: number;
  /** Alquiler bruto anual sin ajuste por vacíos (€) */
  alquilerBrutoAnualSinVacios: number;
  /** Alquiler bruto anual ajustado por tasa de ocupación (€) */
  alquilerBrutoAnual: number;
  /** Cuota hipoteca mensual (€), 0 si no hay hipoteca */
  cuotaHipotecaMensual: number;
  /** Gastos totales anuales (IBI + comunidad + seguro + mantenimiento + hipoteca) (€) */
  gastosTotalesAnual: number;
  /** Ingresos netos anuales tras gastos (€) */
  ingresosNetosAnual: number;
  /** Rentabilidad bruta (%) — solo sobre alquiler, sin descontar gastos */
  rentabilidadBruta: number;
  /** Rentabilidad neta (%) — descontando todos los gastos */
  rentabilidadNeta: number;
  /** Cash flow mensual (€) — puede ser negativo */
  cashFlowMensual: number;
  /** Años para recuperar la inversión (payback). 9999 si el cash flow es negativo */
  paybackAnios: number;
  /** Valoración cualitativa: excelente ≥7%, aceptable ≥4%, baja ≥1%, perdidas <1% */
  valoracion: 'excelente' | 'aceptable' | 'baja' | 'perdidas';
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function calcularCuotaHipoteca(capital: number, tasaAnual: number, anios: number): number {
  if (capital <= 0 || anios <= 0) return 0;
  const r = tasaAnual / 100 / 12;
  const n = anios * 12;
  if (r === 0) return capital / n;
  return (capital * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

// ─── Función principal ─────────────────────────────────────────────────────────

export function calcularRentabilidadAlquiler(p: ParametrosRentabilidadAlquiler): ResultadoRentabilidadAlquiler {
  if (p.precioCompra <= 0) throw new Error('El precio de compra debe ser mayor que cero.');
  if (p.alquilerMensual <= 0) throw new Error('El alquiler mensual debe ser mayor que cero.');

  const r = (n: number) => Math.round(n * 100) / 100;

  const pctGastos = p.porcentajeGastosCompra ?? 10;
  const reforma = p.reforma ?? 0;
  const tasaOcupacion = Math.min(100, Math.max(0, p.tasaOcupacion ?? 95));
  const ibi = p.ibi ?? 0;
  const comunidad = p.comunidad ?? 0;
  const seguro = p.seguro ?? 0;
  const mantenimiento = p.mantenimiento ?? 0;

  // Inversión total
  const gastosCompra = r(p.precioCompra * (pctGastos / 100));
  const inversionTotal = r(p.precioCompra + gastosCompra + reforma);

  // Ingresos
  const alquilerBrutoAnualSinVacios = r(p.alquilerMensual * 12);
  const alquilerBrutoAnual = r(p.alquilerMensual * 12 * (tasaOcupacion / 100));

  // Hipoteca (fórmula francesa)
  let cuotaHipotecaMensual = 0;
  if (p.conHipoteca && p.capitalHipoteca && p.capitalHipoteca > 0) {
    cuotaHipotecaMensual = r(calcularCuotaHipoteca(
      p.capitalHipoteca,
      p.tasaHipoteca ?? 3.5,
      p.aniosHipoteca ?? 25,
    ));
  }
  const cuotaHipotecaAnual = r(cuotaHipotecaMensual * 12);

  // Gastos
  const gastosTotalesAnual = r(ibi + comunidad + seguro + mantenimiento + cuotaHipotecaAnual);
  const ingresosNetosAnual = r(alquilerBrutoAnual - gastosTotalesAnual);

  // Rentabilidades
  const rentabilidadBruta = inversionTotal > 0
    ? r((alquilerBrutoAnualSinVacios / inversionTotal) * 100)
    : 0;
  const rentabilidadNeta = inversionTotal > 0
    ? r((ingresosNetosAnual / inversionTotal) * 100)
    : 0;

  // Cash flow y payback
  const cashFlowMensual = r(ingresosNetosAnual / 12);
  const paybackAnios = ingresosNetosAnual > 0 ? r(inversionTotal / ingresosNetosAnual) : 9999;

  // Valoración (referencia: media mercado español 3-5%)
  let valoracion: 'excelente' | 'aceptable' | 'baja' | 'perdidas';
  if (rentabilidadNeta >= 7) valoracion = 'excelente';
  else if (rentabilidadNeta >= 4) valoracion = 'aceptable';
  else if (rentabilidadNeta >= 1) valoracion = 'baja';
  else valoracion = 'perdidas';

  return {
    inversionTotal,
    gastosCompra,
    alquilerBrutoAnualSinVacios,
    alquilerBrutoAnual,
    cuotaHipotecaMensual,
    gastosTotalesAnual,
    ingresosNetosAnual,
    rentabilidadBruta,
    rentabilidadNeta,
    cashFlowMensual,
    paybackAnios,
    valoracion,
  };
}
