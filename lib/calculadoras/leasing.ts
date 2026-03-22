/**
 * Calculadora de Leasing vs Compra de Vehículo — lógica pura sin React ni DOM
 * Usada por: MCP server (calcular_leasing)
 *
 * Compara el coste total de adquirir un vehículo mediante:
 * A) Leasing financiero (arrendamiento con opción de compra)
 * B) Renting operativo (cuota fija todo incluido)
 * C) Compra al contado o con préstamo
 *
 * Incluye impacto fiscal para autónomos y empresas (deducción IS/IRPF e IVA).
 *
 * Encadenable con: calcular_kilometraje, comparar_autonomo_vs_sl, calcular_prestamo
 */

// ─── Tipos públicos ────────────────────────────────────────────────────────────

export type TipoFiscal = 'particular' | 'autonomo' | 'empresa';

export interface ParametrosLeasing {
  /** Precio del vehículo (€) */
  precioVehiculo: number;
  /** Duración del contrato en meses (leasing/renting). Por defecto 48. */
  mesesContrato?: number;
  /** Cuota mensual del leasing financiero (€). Incluye opción de compra mensualizada. */
  cuotaLeasingMensual?: number;
  /** Valor residual al final del leasing (€). Por defecto 15% del precio. */
  valorResidual?: number;
  /** Cuota mensual del renting (€). Todo incluido: seguro, mantenimiento, etc. */
  cuotaRentingMensual?: number;
  /** Entrada o pago inicial del préstamo/compra (€). Por defecto 0. */
  entradaCompra?: number;
  /** Tipo de interés del préstamo de compra (%). Por defecto 6%. */
  tasaPrestamoCompra?: number;
  /** Tipo fiscal del usuario (afecta a deducciones de IVA e IS/IRPF) */
  tipoFiscal?: TipoFiscal;
  /**
   * Tipo del Impuesto de Sociedades o tipo marginal IRPF del autónomo (%).
   * Para calcular el ahorro fiscal en IS/IRPF. Por defecto 25% (IS general).
   */
  tipoImpuesto?: number;
  /** ¿El vehículo se usa exclusivamente para la actividad? (afecta al IVA deducible) */
  usoExclusivoActividad?: boolean;
}

export interface ResultadoModalidad {
  /** Nombre de la modalidad */
  nombre: string;
  /** Cuota mensual (€) */
  cuotaMensual: number;
  /** Total pagado durante el contrato (€) */
  totalPagado: number;
  /** Valor residual/final del vehículo al término (€) */
  valorFinalVehiculo: number;
  /** Coste total real (total pagado - valor final) (€) */
  costeTotal: number;
  /** Ahorro fiscal total (IVA + IS/IRPF) para autónomos/empresas (€) */
  ahorroFiscal: number;
  /** Coste neto tras ahorro fiscal (€) */
  costeNeto: number;
  /** ¿Incluye mantenimiento/seguro? */
  incluyeServicios: boolean;
  /** Disponible según los datos introducidos */
  disponible: boolean;
  /** Razón por la que no está disponible (si aplica) */
  razonNoDisponible?: string;
}

export interface ResultadoLeasing {
  /** Precio del vehículo (€) */
  precioVehiculo: number;
  /** Duración del contrato (meses) */
  mesesContrato: number;
  /** Tipo fiscal */
  tipoFiscal: TipoFiscal;
  /** Resultados por modalidad */
  leasing: ResultadoModalidad;
  renting: ResultadoModalidad;
  compra: ResultadoModalidad;
  /** Modalidad más económica (coste neto) */
  modalidadMasEconomica: string;
  /** Diferencia entre la más cara y la más barata (€) */
  diferenciaCosteMasBarata: number;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function cuotaFrancesa(capital: number, tasaAnual: number, meses: number): number {
  if (capital <= 0 || meses <= 0) return 0;
  const r = tasaAnual / 100 / 12;
  if (r === 0) return capital / meses;
  return (capital * r * Math.pow(1 + r, meses)) / (Math.pow(1 + r, meses) - 1);
}

function calcularAhorroFiscal(
  totalBase: number,
  tipoFiscal: TipoFiscal,
  tipoImpuesto: number,
  usoExclusivo: boolean,
): number {
  if (tipoFiscal === 'particular') return 0;
  const pctIVA = usoExclusivo ? 1.0 : 0.5;
  const baseConIVA = totalBase;
  const base = baseConIVA / 1.21; // Aproximación IVA 21%
  const iva = baseConIVA - base;
  const ivaDeducible = iva * pctIVA;
  const deduccionImpuesto = base * (tipoImpuesto / 100) * (usoExclusivo ? 1 : 0.5);
  return Math.round((ivaDeducible + deduccionImpuesto) * 100) / 100;
}

// ─── Función principal ─────────────────────────────────────────────────────────

export function calcularLeasing(p: ParametrosLeasing): ResultadoLeasing {
  if (p.precioVehiculo <= 0) throw new Error('El precio del vehículo debe ser mayor que cero.');

  const r = (n: number) => Math.round(n * 100) / 100;

  const mesesContrato = p.mesesContrato ?? 48;
  const tipoFiscal = p.tipoFiscal ?? 'particular';
  const tipoImpuesto = p.tipoImpuesto ?? 25;
  const usoExclusivo = p.usoExclusivoActividad ?? false;
  const valorResidual = p.valorResidual ?? r(p.precioVehiculo * 0.15);

  // ─── LEASING ─────────────────────────────────────────────────────────────
  let leasingResult: ResultadoModalidad;
  if (p.cuotaLeasingMensual) {
    const totalPagado = r(p.cuotaLeasingMensual * mesesContrato + valorResidual);
    const costeTotal = r(totalPagado - p.precioVehiculo * 0.15); // depreciación estimada
    const ahorroFiscal = calcularAhorroFiscal(p.cuotaLeasingMensual * mesesContrato, tipoFiscal, tipoImpuesto, usoExclusivo);
    leasingResult = {
      nombre: 'Leasing financiero',
      cuotaMensual: r(p.cuotaLeasingMensual),
      totalPagado,
      valorFinalVehiculo: r(p.precioVehiculo * 0.15), // valor residual = valor de mercado aprox.
      costeTotal,
      ahorroFiscal,
      costeNeto: r(costeTotal - ahorroFiscal),
      incluyeServicios: false,
      disponible: true,
    };
  } else {
    leasingResult = {
      nombre: 'Leasing financiero',
      cuotaMensual: 0,
      totalPagado: 0,
      valorFinalVehiculo: 0,
      costeTotal: 0,
      ahorroFiscal: 0,
      costeNeto: 0,
      incluyeServicios: false,
      disponible: false,
      razonNoDisponible: 'No se ha proporcionado la cuota mensual del leasing.',
    };
  }

  // ─── RENTING ─────────────────────────────────────────────────────────────
  let rentingResult: ResultadoModalidad;
  if (p.cuotaRentingMensual) {
    const totalPagado = r(p.cuotaRentingMensual * mesesContrato);
    const costeTotal = totalPagado; // al terminar el renting no se tiene el vehículo
    const ahorroFiscal = calcularAhorroFiscal(totalPagado, tipoFiscal, tipoImpuesto, usoExclusivo);
    rentingResult = {
      nombre: 'Renting operativo',
      cuotaMensual: r(p.cuotaRentingMensual),
      totalPagado,
      valorFinalVehiculo: 0,
      costeTotal,
      ahorroFiscal,
      costeNeto: r(costeTotal - ahorroFiscal),
      incluyeServicios: true,
      disponible: true,
    };
  } else {
    rentingResult = {
      nombre: 'Renting operativo',
      cuotaMensual: 0,
      totalPagado: 0,
      valorFinalVehiculo: 0,
      costeTotal: 0,
      ahorroFiscal: 0,
      costeNeto: 0,
      incluyeServicios: true,
      disponible: false,
      razonNoDisponible: 'No se ha proporcionado la cuota mensual del renting.',
    };
  }

  // ─── COMPRA (contado o préstamo) ──────────────────────────────────────────
  const entrada = p.entradaCompra ?? 0;
  const tasaPrestamo = p.tasaPrestamoCompra ?? 6;
  const capitalPrestamo = p.precioVehiculo - entrada;
  const cuotaPrestamo = capitalPrestamo > 0
    ? r(cuotaFrancesa(capitalPrestamo, tasaPrestamo, mesesContrato))
    : 0;
  const totalPrestamo = r(entrada + cuotaPrestamo * mesesContrato);
  const valorMercadoFin = r(p.precioVehiculo * 0.4); // estimación: 40% tras 4 años
  const costeTotalCompra = r(totalPrestamo - valorMercadoFin);
  const ahorroFiscalCompra = calcularAhorroFiscal(
    cuotaPrestamo * mesesContrato * 0.3, // solo intereses son deducibles (aprox 30% cuota)
    tipoFiscal, tipoImpuesto, usoExclusivo
  );

  const compraResult: ResultadoModalidad = {
    nombre: capitalPrestamo > 0 ? 'Compra con préstamo' : 'Compra al contado',
    cuotaMensual: cuotaPrestamo,
    totalPagado: totalPrestamo,
    valorFinalVehiculo: valorMercadoFin,
    costeTotal: costeTotalCompra,
    ahorroFiscal: ahorroFiscalCompra,
    costeNeto: r(costeTotalCompra - ahorroFiscalCompra),
    incluyeServicios: false,
    disponible: true,
  };

  // ─── Comparativa ─────────────────────────────────────────────────────────
  const modalidades = [leasingResult, rentingResult, compraResult].filter(m => m.disponible);
  const costesNetos = modalidades.map(m => m.costeNeto);
  const minCoste = Math.min(...costesNetos);
  const maxCoste = Math.max(...costesNetos);
  const modalidadMasEconomica = modalidades.find(m => m.costeNeto === minCoste)?.nombre ?? 'Compra';

  return {
    precioVehiculo: r(p.precioVehiculo),
    mesesContrato,
    tipoFiscal,
    leasing: leasingResult,
    renting: rentingResult,
    compra: compraResult,
    modalidadMasEconomica,
    diferenciaCosteMasBarata: r(maxCoste - minCoste),
  };
}
