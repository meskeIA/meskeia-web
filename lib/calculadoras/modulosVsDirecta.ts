/**
 * Comparativa orientativa Estimación Directa Simplificada vs Estimación Objetiva
 * (módulos) para el IRPF de un autónomo.
 *
 * Réplica server-side de la lógica inline de app/simulador-modulos-vs-directa/page.tsx.
 * La fuente única de tramos y mínimo personal es data/fiscal/irpf.ts.
 *
 * Usada por: MCP server (comparar_modulos_vs_directa).
 * TODO: unificar — la app aún mantiene su propia versión inline del mismo cálculo.
 *
 * ⚠️ Los coeficientes de rendimiento por módulos son DIDÁCTICOS/orientativos, NO los
 * importes reales de la Orden HFP anual. Sirven para entender la lógica de decisión,
 * no como cálculo definitivo del régimen.
 */
import { MINIMOS_IRPF_2025, calcularCuotaIntegraGeneral } from '@/data/fiscal/irpf';

export type ActividadModulos = 'bar' | 'comercio_menor' | 'transporte' | 'peluqueria' | 'taxi';

export interface ParametrosModulosVsDirecta {
  ingresos: number;
  gastos: number;
  /** Cuota mensual de autónomo (RETA) en €. */
  retaMensual: number;
  actividad: ActividadModulos;
  personalAsalariado?: number;
  personalNoAsalariado?: number;
  superficie?: number;
  kwh?: number;
  mesas?: number;
  vehiculo?: number;
}

export interface ResultadoRegimenED {
  ingresos: number;
  gastos: number;
  rendimientoNetoPrevio: number;
  reduccion5pc: number;
  rendimientoNetoReducido: number;
  /** Mínimo personal del art. 57 LIRPF. NO se resta de la base: se grava a tipo cero. */
  minimosPersonales: number;
  /** Base liquidable general, CON el mínimo dentro (art. 63.1.2º). */
  baseLiquidable: number;
  irpf: number;
  cuotaReta: number;
  costeAnualTotal: number;
}

export interface ResultadoRegimenModulos {
  rendimientoNetoPrevio: number;
  reduccion5pc: number;
  reduccionEmpleo: number;
  rendimientoNetoReducido: number;
  /** Mínimo personal del art. 57 LIRPF. NO se resta de la base: se grava a tipo cero. */
  minimosPersonales: number;
  /** Base liquidable general, CON el mínimo dentro (art. 63.1.2º). */
  baseLiquidable: number;
  irpf: number;
  cuotaReta: number;
  costeAnualTotal: number;
  esApta: boolean;
}

export interface ResultadoModulosVsDirecta {
  estimacionDirecta: ResultadoRegimenED;
  modulos: ResultadoRegimenModulos;
  /** costeED − costeModulos (positivo = módulos más barato). */
  diferencia: number;
  ganaED: boolean;
  regimenRecomendado: string;
}

/** Mínimo personal orientativo (coincide con la constante de la app). */
const MINIMO_PERSONAL = MINIMOS_IRPF_2025.personal;

/**
 * Cuota íntegra de IRPF (art. 63.1.2º LIRPF).
 *
 * ⚠️ Hasta el 12/09/2026 este motor restaba el mínimo personal de la base y aplicaba la
 * escala al resto, que lo valora al tipo marginal: subestimaba la cuota hasta 1.443 €/año
 * (946,50 € con 40.000 € de rendimiento neto). El mínimo no reduce la base; se grava a tipo
 * cero aplicando la escala dos veces. La fórmula vive en `calcularCuotaIntegraGeneral`.
 */
function calcularIRPF(baseLiquidableGeneral: number): number {
  return calcularCuotaIntegraGeneral(baseLiquidableGeneral, MINIMO_PERSONAL);
}

/** Rendimiento neto por módulos con coeficientes didácticos por actividad. */
function calcularRendimientoModulos(p: ParametrosModulosVsDirecta): number {
  const asal = p.personalAsalariado ?? 0;
  const noAsal = p.personalNoAsalariado ?? 0;
  const sup = p.superficie ?? 0;
  const kwh = p.kwh ?? 0;
  const mesas = p.mesas ?? 0;
  const veh = p.vehiculo ?? 0;
  switch (p.actividad) {
    case 'bar':
      return 1500 * mesas + 800 * asal + 6 * sup + 0.05 * kwh;
    case 'comercio_menor':
      return 4500 * noAsal + 1000 * asal + 8 * sup;
    case 'transporte':
      return 12000 * veh;
    case 'peluqueria':
      return 5500 * asal + 2000 * noAsal + 7 * sup;
    case 'taxi':
      return 6800 * veh;
    default:
      return 0;
  }
}

function calcularED(ingresos: number, gastos: number, retaMensual: number): ResultadoRegimenED {
  const rendimientoNetoPrevio = Math.max(0, ingresos - gastos);
  const reduccion5pc = Math.min(rendimientoNetoPrevio * 0.05, 2000);
  const rendimientoNetoReducido = Math.max(0, rendimientoNetoPrevio - reduccion5pc);
  // El mínimo NO se resta aquí: la base liquidable general lo lleva dentro y calcularIRPF
  // lo grava a tipo cero por la vía del art. 63.1.2º.
  const baseLiquidable = rendimientoNetoReducido;
  const irpf = calcularIRPF(baseLiquidable);
  const cuotaReta = retaMensual * 12;
  return {
    ingresos,
    gastos,
    rendimientoNetoPrevio,
    reduccion5pc,
    rendimientoNetoReducido,
    minimosPersonales: MINIMO_PERSONAL,
    baseLiquidable,
    irpf,
    cuotaReta,
    costeAnualTotal: irpf + cuotaReta,
  };
}

function calcularModulos(p: ParametrosModulosVsDirecta): ResultadoRegimenModulos {
  const asal = p.personalAsalariado ?? 0;
  const noAsal = p.personalNoAsalariado ?? 0;
  const sup = p.superficie ?? 0;
  const esApta =
    (p.mesas ?? 0) > 0 ||
    sup > 0 ||
    (p.vehiculo ?? 0) > 0 ||
    asal > 0 ||
    (p.actividad !== 'transporte' && p.actividad !== 'taxi' && noAsal > 0 && sup > 0);

  const rendimientoNetoPrevio = calcularRendimientoModulos(p);
  const reduccion5pc = Math.min(rendimientoNetoPrevio * 0.05, 2000);
  const reduccionEmpleo = asal * 100;
  const rendimientoNetoReducido = Math.max(0, rendimientoNetoPrevio - reduccion5pc - reduccionEmpleo);
  // El mínimo NO se resta aquí: la base liquidable general lo lleva dentro y calcularIRPF
  // lo grava a tipo cero por la vía del art. 63.1.2º.
  const baseLiquidable = rendimientoNetoReducido;
  const irpf = calcularIRPF(baseLiquidable);
  const cuotaReta = p.retaMensual * 12;
  return {
    rendimientoNetoPrevio,
    reduccion5pc,
    reduccionEmpleo,
    rendimientoNetoReducido,
    minimosPersonales: MINIMO_PERSONAL,
    baseLiquidable,
    irpf,
    cuotaReta,
    costeAnualTotal: irpf + cuotaReta,
    esApta,
  };
}

export function compararModulosVsDirecta(
  p: ParametrosModulosVsDirecta
): ResultadoModulosVsDirecta {
  const estimacionDirecta = calcularED(p.ingresos, p.gastos, p.retaMensual);
  const modulos = calcularModulos(p);
  const diferencia = estimacionDirecta.costeAnualTotal - modulos.costeAnualTotal;
  const ganaED = estimacionDirecta.costeAnualTotal < modulos.costeAnualTotal;
  return {
    estimacionDirecta,
    modulos,
    diferencia,
    ganaED,
    regimenRecomendado: ganaED ? 'Estimación Directa Simplificada' : 'Estimación Objetiva (Módulos)',
  };
}
