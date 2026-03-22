/**
 * Simulador de Devolución / Pago IRPF — lógica pura sin React ni DOM
 * Usada por: MCP server (calcular_devolucion_irpf)
 *
 * Estima si la declaración de la renta saldrá a devolver o a pagar,
 * comparando las retenciones practicadas durante el año con la cuota
 * íntegra calculada sobre la base imponible del contribuyente.
 *
 * Incluye: rendimientos del trabajo, actividades económicas, capital
 * mobiliario e inmobiliario, y ganancias patrimoniales.
 *
 * Fuente: LIRPF art. 63-89 + RIRPF — Declaración Renta 2025 (año fiscal 2024)
 *
 * Encadenable con: calcular_irpf, calcular_sueldo_neto, calcular_declaracion_conjunta
 */

import {
  TRAMOS_IRPF_2025,
  MINIMOS_IRPF_2025,
  FISCAL_IRPF_META,
} from '@/data/fiscal';

// ─── Tipos públicos ────────────────────────────────────────────────────────────

export interface ParametrosDevolucionIRPF {
  // ── Rendimientos del trabajo
  /** Rendimientos brutos del trabajo (salario + pagas, antes de retenciones) (€) */
  rendimientosTrabajoAnuales: number;
  /** Retenciones del trabajo practicadas por la empresa (€). Si no conoce, usar 0. */
  retencionesTrabajoAnuales?: number;

  // ── Rendimientos de actividades económicas (autónomos)
  /** Rendimientos netos de actividades económicas (€). Por defecto 0. */
  rendimientosActividadesEconomicas?: number;
  /** Retenciones soportadas en actividades económicas (€). Por defecto 0. */
  retencionesActividadesEconomicas?: number;
  /** Pagos fraccionados abonados (Modelo 130) (€). Por defecto 0. */
  pagosFraccionados?: number;

  // ── Rendimientos del capital mobiliario (intereses, dividendos)
  /** Rendimientos brutos del capital mobiliario (€). Por defecto 0. */
  rendimientosCapitalMobiliario?: number;
  /** Retenciones capital mobiliario (19-28%) (€). Por defecto 0. */
  retencionesCapitalMobiliario?: number;

  // ── Rendimientos del capital inmobiliario (alquiler)
  /** Rendimientos netos del capital inmobiliario (€). Por defecto 0. */
  rendimientosCapitalInmobiliario?: number;
  /** Retenciones capital inmobiliario (€). Por defecto 0. */
  retencionesCapitalInmobiliario?: number;

  // ── Ganancias y pérdidas patrimoniales
  /** Ganancias patrimoniales netas (venta acciones, fondos, inmuebles) (€). Por defecto 0. */
  gananciasPatrimoniales?: number;
  /** Retenciones ganancias patrimoniales (€). Por defecto 0. */
  retencionesGananciasPat?: number;

  // ── Mínimos personales y familiares
  /** Edad del contribuyente (afecta al mínimo personal) */
  edad?: number;
  /** Número de hijos menores de 25 años a cargo */
  numHijos?: number;
  /** ¿Algún hijo menor de 3 años? */
  hijosMenures3?: boolean;
  /** Número de ascendientes mayores de 65 años a cargo */
  ascendientes65?: number;
  /** ¿Discapacidad del contribuyente? (ninguna / 33-65% / >65%) */
  discapacidad?: 'ninguna' | 'moderada' | 'severa';

  /** Deducción por maternidad/paternidad (€). Por defecto 0. */
  deduccionMaternidad?: number;
  /** Deducciones autonómicas (€). Por defecto 0. */
  deduccionesAutonimicas?: number;
}

export interface ResultadoDevolucionIRPF {
  // ── Bases imponibles
  /** Base imponible general (trabajo + actividades + capital inmobiliario) (€) */
  baseImponibleGeneral: number;
  /** Base imponible del ahorro (capital mobiliario + ganancias patrimoniales) (€) */
  baseImponibleAhorro: number;
  /** Base imponible total (€) */
  baseImponibleTotal: number;

  // ── Mínimos y base liquidable
  /** Mínimo personal y familiar aplicable (€) */
  minimoPersonalFamiliar: number;
  /** Base liquidable general (después de reducir mínimo) (€) */
  baseLiquidableGeneral: number;

  // ── Cuota
  /** Cuota íntegra general (tramos tarifa general) (€) */
  cuotaIntegraGeneral: number;
  /** Cuota íntegra del ahorro (tramos tarifa ahorro) (€) */
  cuotaIntegraAhorro: number;
  /** Cuota íntegra total antes de deducciones (€) */
  cuotaIntegra: number;
  /** Cuota líquida tras deducciones personales y autonómicas (€) */
  cuotaLiquida: number;

  // ── Retenciones y pagos
  /** Total retenciones e ingresos a cuenta (€) */
  totalRetenciones: number;
  /** Resultado de la declaración (€). Negativo = Hacienda devuelve; Positivo = a pagar */
  resultadoDeclaracion: number;
  /** ¿Sale a devolver? */
  aDevolver: boolean;
  /** ¿Sale a pagar? */
  aPagar: boolean;
  /** Importe a devolver (€). 0 si sale a pagar. */
  importeADevolver: number;
  /** Importe a pagar (€). 0 si sale a devolver. */
  importeAPagar: number;

  /** Tipo efectivo IRPF (%) */
  tipoEfectivo: number;
  /** Advertencia importante */
  advertencia: string;
  /** Fuente normativa */
  fuenteDatos: string;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function calcularCuotaTarifahGeneral(base: number): number {
  if (base <= 0) return 0;
  let cuota = 0;
  let anterior = 0;
  for (const tramo of TRAMOS_IRPF_2025) {
    if (base <= anterior) break;
    const baseTramo = Math.min(base, tramo.hasta) - anterior;
    cuota += baseTramo * (tramo.tipo / 100);
    anterior = tramo.hasta;
  }
  return cuota;
}

// Tramos tarifa del ahorro 2025
const TRAMOS_AHORRO_2025 = [
  { hasta: 6000,     tipo: 19 },
  { hasta: 50000,    tipo: 21 },
  { hasta: 200000,   tipo: 23 },
  { hasta: 300000,   tipo: 27 },
  { hasta: Infinity, tipo: 28 },
];

function calcularCuotaTarifaAhorro(base: number): number {
  if (base <= 0) return 0;
  let cuota = 0;
  let anterior = 0;
  for (const tramo of TRAMOS_AHORRO_2025) {
    if (base <= anterior) break;
    const baseTramo = Math.min(base, tramo.hasta) - anterior;
    cuota += baseTramo * (tramo.tipo / 100);
    anterior = tramo.hasta;
  }
  return cuota;
}

function calcularMinimoPersonalFamiliar(p: ParametrosDevolucionIRPF): number {
  const edad = p.edad ?? 40;
  let minimo = edad >= 75
    ? MINIMOS_IRPF_2025.personal_75
    : edad >= 65
      ? MINIMOS_IRPF_2025.personal_65
      : MINIMOS_IRPF_2025.personal;

  // Hijos
  const hijos = p.numHijos ?? 0;
  if (hijos >= 1) minimo += MINIMOS_IRPF_2025.hijo_1;
  if (hijos >= 2) minimo += MINIMOS_IRPF_2025.hijo_2;
  if (hijos >= 3) minimo += MINIMOS_IRPF_2025.hijo_3;
  if (hijos >= 4) minimo += MINIMOS_IRPF_2025.hijo_4_mas;
  if (p.hijosMenures3) minimo += MINIMOS_IRPF_2025.hijo_menor_3;

  // Ascendientes
  minimo += (p.ascendientes65 ?? 0) * MINIMOS_IRPF_2025.ascendiente_65;

  // Discapacidad
  if (p.discapacidad === 'moderada') minimo += MINIMOS_IRPF_2025.discapacidad_33_65;
  if (p.discapacidad === 'severa') minimo += MINIMOS_IRPF_2025.discapacidad_65_mas;

  return minimo;
}

// ─── Función principal ─────────────────────────────────────────────────────────

export function calcularDevolucionIRPF(p: ParametrosDevolucionIRPF): ResultadoDevolucionIRPF {
  if (p.rendimientosTrabajoAnuales < 0) throw new Error('Los rendimientos del trabajo no pueden ser negativos.');

  const r = (n: number) => Math.round(n * 100) / 100;

  // ── Reducción por rendimientos del trabajo (art. 20 LIRPF)
  const rdt = p.rendimientosTrabajoAnuales;
  let reduccionTrabajo = 0;
  if (rdt <= 14047.5) reduccionTrabajo = 7302;
  else if (rdt <= 19747.5) reduccionTrabajo = 7302 - 1.75 * (rdt - 14047.5);
  else reduccionTrabajo = 2364;

  const actEco = p.rendimientosActividadesEconomicas ?? 0;
  const capInmob = p.rendimientosCapitalInmobiliario ?? 0;
  const capMob = p.rendimientosCapitalMobiliario ?? 0;
  const ganPat = p.gananciasPatrimoniales ?? 0;

  // ── Bases imponibles
  const baseImponibleGeneral = r(Math.max(0, rdt - reduccionTrabajo) + actEco + capInmob);
  const baseImponibleAhorro = r(capMob + ganPat);
  const baseImponibleTotal = r(baseImponibleGeneral + baseImponibleAhorro);

  // ── Mínimos
  const minimoPersonalFamiliar = r(calcularMinimoPersonalFamiliar(p));

  // ── Base liquidable general (no puede ser < 0)
  const baseLiquidableGeneral = r(Math.max(0, baseImponibleGeneral));

  // ── Cuota íntegra
  const cuotaBaseGeneral = calcularCuotaTarifahGeneral(baseLiquidableGeneral);
  const cuotaMinimoGeneral = calcularCuotaTarifahGeneral(Math.min(minimoPersonalFamiliar, baseLiquidableGeneral));
  const cuotaIntegraGeneral = r(Math.max(0, cuotaBaseGeneral - cuotaMinimoGeneral));

  const cuotaIntegraAhorro = r(calcularCuotaTarifaAhorro(baseImponibleAhorro));
  const cuotaIntegra = r(cuotaIntegraGeneral + cuotaIntegraAhorro);

  // ── Deducciones
  const deduccionMaternidad = p.deduccionMaternidad ?? 0;
  const deduccionesAut = p.deduccionesAutonimicas ?? 0;
  const cuotaLiquida = r(Math.max(0, cuotaIntegra - deduccionMaternidad - deduccionesAut));

  // ── Retenciones totales
  const totalRetenciones = r(
    (p.retencionesTrabajoAnuales ?? 0) +
    (p.retencionesActividadesEconomicas ?? 0) +
    (p.pagosFraccionados ?? 0) +
    (p.retencionesCapitalMobiliario ?? 0) +
    (p.retencionesCapitalInmobiliario ?? 0) +
    (p.retencionesGananciasPat ?? 0)
  );

  // ── Resultado (+ paga, - devuelve)
  const resultadoDeclaracion = r(cuotaLiquida - totalRetenciones);
  const aDevolver = resultadoDeclaracion < 0;
  const aPagar = resultadoDeclaracion > 0;

  const tipoEfectivo = baseImponibleTotal > 0
    ? r(cuotaLiquida / baseImponibleTotal * 100)
    : 0;

  return {
    baseImponibleGeneral,
    baseImponibleAhorro,
    baseImponibleTotal,
    minimoPersonalFamiliar,
    baseLiquidableGeneral,
    cuotaIntegraGeneral,
    cuotaIntegraAhorro,
    cuotaIntegra,
    cuotaLiquida,
    totalRetenciones,
    resultadoDeclaracion,
    aDevolver,
    aPagar,
    importeADevolver: aDevolver ? r(Math.abs(resultadoDeclaracion)) : 0,
    importeAPagar: aPagar ? r(resultadoDeclaracion) : 0,
    tipoEfectivo,
    advertencia: 'Simulación orientativa basada en tramos estatales + autonómicos medios. El resultado exacto depende de la CCAA de residencia, deducciones autonómicas y circunstancias personales. Usa la herramienta oficial de la AEAT (Renta WEB) para calcular tu declaración real.',
    fuenteDatos: `${FISCAL_IRPF_META.fuente} — verificado ${FISCAL_IRPF_META.verificado}`,
  };
}
