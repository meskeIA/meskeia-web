/**
 * Comparativa orientativa Estimación Directa Simplificada vs Estimación Objetiva
 * (módulos) para el IRPF de un autónomo.
 *
 * FUENTE ÚNICA del cálculo: lo consumen la app `app/simulador-modulos-vs-directa/` y la
 * tool `comparar_modulos_vs_directa` del MCP de Delegum. La fuente única de tramos,
 * mínimo personal, límites de exclusión y reducción del art. 30.2.ª RIRPF es `data/fiscal`.
 *
 * ⚠️ 13/09/2026 — hasta hoy este motor era una RÉPLICA de la lógica inline de la app, y
 * las dos copias envejecieron por su lado (hallazgos 808 y 809 del Inspector): la app
 * había aprendido el 31/08 a no recomendar módulos a quien no es apto y el 02/09 a aplicar
 * los límites de exclusión, y ninguna de las dos reparaciones llegó aquí. Por el MCP se
 * imprimía el aviso «probablemente NO sea elegible» y dos líneas más abajo se recomendaba
 * ese mismo régimen, incluso a quien supera los 250.000 € de ingresos. La app ya no
 * mantiene versión propia: importa de aquí.
 *
 * ⚠️ Los coeficientes de rendimiento por módulos son DIDÁCTICOS/orientativos, NO los
 * importes reales de la Orden HFP/HAC anual. Sirven para entender la lógica de decisión,
 * no como cálculo definitivo del régimen.
 */
import { MINIMOS_IRPF_2025, calcularCuotaIntegraGeneral, cuotaEscalaGeneral } from '@/data/fiscal/irpf';
import { LIMITES_EXCLUSION_MODULOS_2025 } from '@/data/fiscal/modulos-irpf';
import { reduccionGastosDificilJustificacion } from '@/data/fiscal/estimacion-directa';

export type ActividadModulos = 'bar' | 'comercio_menor' | 'transporte' | 'peluqueria' | 'taxi';

/** Por qué la actividad no puede acogerse a módulos con los datos introducidos. */
export type MotivoNoApta = 'sin_parametros' | 'supera_limites' | null;

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
  /** Escala aplicada a la base liquidable completa (primera aplicación). */
  cuotaEscala: number;
  /** Escala aplicada al mínimo, que es lo que se resta de la anterior. */
  cuotaMinimo: number;
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
  /** Escala aplicada a la base liquidable completa (primera aplicación). */
  cuotaEscala: number;
  /** Escala aplicada al mínimo, que es lo que se resta de la anterior. */
  cuotaMinimo: number;
  irpf: number;
  cuotaReta: number;
  costeAnualTotal: number;
  esApta: boolean;
  motivoNoApta: MotivoNoApta;
}

export interface ResultadoModulosVsDirecta {
  estimacionDirecta: ResultadoRegimenED;
  modulos: ResultadoRegimenModulos;
  /** costeED − costeModulos (positivo = módulos más barato). Solo comparable si esApta. */
  diferencia: number;
  /** true también cuando módulos NO es apta: ahí no hay comparación de importes que valga. */
  ganaED: boolean;
  regimenRecomendado: string;
}

/** Mínimo personal orientativo (sin familia). */
const MINIMO_PERSONAL = MINIMOS_IRPF_2025.personal;

/**
 * Cuota íntegra de IRPF (art. 63.1.2º LIRPF).
 *
 * ⚠️ Hasta el 12/09/2026 este motor restaba el mínimo personal de la base y aplicaba la
 * escala al resto, que lo valora al tipo marginal: subestimaba la cuota hasta 1.443 €/año
 * (946,50 € con 40.000 € de rendimiento neto). El mínimo no reduce la base; se grava a tipo
 * cero aplicando la escala dos veces. La fórmula vive en `calcularCuotaIntegraGeneral`.
 */
function calcularIRPF(baseLiquidableGeneral: number): {
  cuotaEscala: number;
  cuotaMinimo: number;
  irpf: number;
} {
  const base = Math.max(0, baseLiquidableGeneral);
  return {
    cuotaEscala: cuotaEscalaGeneral(base),
    cuotaMinimo: cuotaEscalaGeneral(Math.min(MINIMO_PERSONAL, base)),
    irpf: calcularCuotaIntegraGeneral(base, MINIMO_PERSONAL),
  };
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
  // Provisiones y gastos de difícil justificación (art. 30.2.ª RIRPF), sellado en data/fiscal.
  const reduccion5pc = reduccionGastosDificilJustificacion(rendimientoNetoPrevio);
  const rendimientoNetoReducido = Math.max(0, rendimientoNetoPrevio - reduccion5pc);
  // El mínimo NO se resta aquí: la base liquidable general lo lleva dentro y calcularIRPF
  // lo grava a tipo cero por la vía del art. 63.1.2º.
  const baseLiquidable = rendimientoNetoReducido;
  const { cuotaEscala, cuotaMinimo, irpf } = calcularIRPF(baseLiquidable);
  const cuotaReta = retaMensual * 12;
  return {
    ingresos,
    gastos,
    rendimientoNetoPrevio,
    reduccion5pc,
    rendimientoNetoReducido,
    minimosPersonales: MINIMO_PERSONAL,
    baseLiquidable,
    cuotaEscala,
    cuotaMinimo,
    irpf,
    cuotaReta,
    costeAnualTotal: irpf + cuotaReta,
  };
}

function calcularModulos(p: ParametrosModulosVsDirecta): ResultadoRegimenModulos {
  const asal = p.personalAsalariado ?? 0;
  const noAsal = p.personalNoAsalariado ?? 0;
  const sup = p.superficie ?? 0;

  // Profesionales puros NO pueden acogerse — caso didáctico: si no hay parámetros físicos
  // relevantes, la actividad no es apta.
  const tieneParametros =
    (p.mesas ?? 0) > 0 ||
    sup > 0 ||
    (p.vehiculo ?? 0) > 0 ||
    asal > 0 ||
    (p.actividad !== 'transporte' && p.actividad !== 'taxi' && noAsal > 0 && sup > 0);

  // Límites cuantitativos excluyentes (LIMITES_EXCLUSION_MODULOS_2025): superar ingresos o
  // compras de bienes y servicios (aquí, "gastos" como proxy) excluye del régimen aunque la
  // actividad física encaje. El umbral de facturación a empresas no se comprueba: ni la app
  // ni la tool del MCP recogen ese dato.
  const dentroDeLimites =
    p.ingresos <= LIMITES_EXCLUSION_MODULOS_2025.ingresosConjuntoActividades &&
    p.gastos <= LIMITES_EXCLUSION_MODULOS_2025.comprasBienesYServicios;

  const esApta = tieneParametros && dentroDeLimites;
  const motivoNoApta: MotivoNoApta = esApta ? null : !dentroDeLimites ? 'supera_limites' : 'sin_parametros';

  const rendimientoNetoPrevio = calcularRendimientoModulos(p);
  // La Orden anual de módulos fija la misma reducción general del 5 % sobre el rendimiento
  // neto de módulos, con el mismo tope.
  const reduccion5pc = reduccionGastosDificilJustificacion(rendimientoNetoPrevio);
  // Reducción incentivos al empleo (simplificado: 100 € por persona asalariada)
  const reduccionEmpleo = asal * 100;
  const rendimientoNetoReducido = Math.max(0, rendimientoNetoPrevio - reduccion5pc - reduccionEmpleo);
  // El mínimo NO se resta aquí: la base liquidable general lo lleva dentro y calcularIRPF
  // lo grava a tipo cero por la vía del art. 63.1.2º.
  const baseLiquidable = rendimientoNetoReducido;
  const { cuotaEscala, cuotaMinimo, irpf } = calcularIRPF(baseLiquidable);
  const cuotaReta = p.retaMensual * 12;
  return {
    rendimientoNetoPrevio,
    reduccion5pc,
    reduccionEmpleo,
    rendimientoNetoReducido,
    minimosPersonales: MINIMO_PERSONAL,
    baseLiquidable,
    cuotaEscala,
    cuotaMinimo,
    irpf,
    cuotaReta,
    costeAnualTotal: irpf + cuotaReta,
    esApta,
    motivoNoApta,
  };
}

export function compararModulosVsDirecta(
  p: ParametrosModulosVsDirecta
): ResultadoModulosVsDirecta {
  const estimacionDirecta = calcularED(p.ingresos, p.gastos, p.retaMensual);
  const modulos = calcularModulos(p);
  const diferencia = estimacionDirecta.costeAnualTotal - modulos.costeAnualTotal;
  // Si módulos no es apta, la única opción real es ED: no se compara por importe. Comparar
  // solo los costes recomendaba módulos a quien la propia respuesta declaraba no elegible.
  const ganaED = !modulos.esApta || estimacionDirecta.costeAnualTotal < modulos.costeAnualTotal;
  return {
    estimacionDirecta,
    modulos,
    diferencia,
    ganaED,
    regimenRecomendado: ganaED ? 'Estimación Directa Simplificada' : 'Estimación Objetiva (Módulos)',
  };
}
