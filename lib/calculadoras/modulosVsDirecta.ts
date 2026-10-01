/**
 * Coste anual (IRPF + cuota RETA) de un autónomo en Estimación Directa Simplificada y, si el
 * usuario aporta su rendimiento neto de módulos, en Estimación Objetiva (módulos).
 *
 * FUENTE ÚNICA del cálculo: lo consumen la app `app/simulador-modulos-vs-directa/` y la
 * tool `comparar_modulos_vs_directa` del MCP de Delegum. La fuente única de tramos,
 * mínimo personal, límites de exclusión y de las dos reducciones del 5 % es `data/fiscal`.
 *
 * ⚠️ 01/10/2026 — este motor YA NO CALCULA el rendimiento de módulos ni RECOMIENDA régimen
 * (hallazgo 2545 del Inspector; decisión del usuario del mismo día).
 *   Hasta hoy estimaba el rendimiento con cinco fórmulas «didácticas» inventadas por actividad
 *   (bar = 1.500 × mesas + 800 × asalariados + 6 × m² + 0,05 × kWh, taxi = 6.800 × vehículo…)
 *   y un «incentivo al empleo» de 100 € por asalariado, y con esa cifra la app y el MCP decían
 *   «te conviene más X» y «pagas X € más con módulos». La Orden real (ORDEN_MODULOS_VIGENTE)
 *   usa otros signos y otras cuantías: el epígrafe 673.2 (otros cafés y bares) tiene, por
 *   ejemplo, «personal no asalariado» a 11.413,08 €/persona, personal asalariado, potencia en
 *   kW, mesas, longitud de barra y máquinas tipo «A» y «B», y nada de m² ni kWh (Anexo II). Un aviso de «orientativo» bajo una cifra falsa
 *   no la arregla: o la cifra se calcula de verdad, o no hay cifra. Modelar la Orden entera
 *   (signos, minoraciones e índices correctores por epígrafe) no compensa para lo que la app
 *   tiene que dar, así que el rendimiento neto de módulos lo APORTA EL USUARIO (de su gestoría
 *   o de aplicar la Orden a su actividad) y el motor solo hace lo que sí puede respaldar:
 *   la reducción general, la cuota de IRPF y la cuota RETA.
 *   La comparación devuelve la diferencia de costes como DATO. No hay `regimenRecomendado`
 *   ni `ganaED`: un año de costes no decide un régimen que, si se renuncia, ata tres años.
 *
 * Historia que sigue valiendo:
 *  · 13/09/2026 (hallazgos 808 y 809) — el motor era una réplica de la lógica inline de la
 *    app y las dos copias envejecieron por su lado. Desde entonces la app importa de aquí.
 *  · 12/09/2026 — el mínimo personal NO se resta de la base: se grava a tipo cero con
 *    `calcularCuotaIntegraGeneral` (art. 63.1.2.º LIRPF).
 *  · 29/09/2026 (hallazgo 2444) — en directa, la cuota RETA del titular es gasto deducible.
 *  · 29/09/2026 (hallazgo 2445) — la reducción de módulos es el 5 % SIN tope de la DA 1.ª de
 *    la Orden anual, sobre el rendimiento neto de módulos; no la de la directa simplificada.
 */
import { MINIMOS_IRPF_2025, calcularCuotaIntegraGeneral, cuotaEscalaGeneral } from '@/data/fiscal/irpf';
import { LIMITES_EXCLUSION_MODULOS_2025, reduccionGeneralModulos } from '@/data/fiscal/modulos-irpf';
import { reduccionGastosDificilJustificacion } from '@/data/fiscal/estimacion-directa';

/**
 * Por qué no hay columna de módulos:
 *  · 'supera_limites' — ingresos o compras por encima de LIMITES_EXCLUSION_MODULOS_2025.
 *  · 'sin_dato' — el usuario no ha aportado su rendimiento neto de módulos.
 */
export type MotivoSinModulos = 'sin_dato' | 'supera_limites';

export interface ParametrosModulosVsDirecta {
  ingresos: number;
  /** Gastos deducibles; también hacen de aproximación a las compras para el límite de exclusión. */
  gastos: number;
  /** Cuota mensual de autónomo (RETA) en €. */
  retaMensual: number;
  /**
   * Rendimiento neto de módulos ANUAL que el usuario obtiene de su gestoría o de aplicar la
   * Orden de módulos vigente a su actividad: signos × módulos, menos las minoraciones por
   * incentivos al empleo y a la inversión, con los índices correctores aplicados, y ANTES de
   * la reducción general. Sin él, solo se calcula la directa.
   */
  rendimientoNetoModulos?: number;
}

export interface ResultadoRegimenED {
  ingresos: number;
  gastos: number;
  /** Cuota RETA anual del titular, que en directa es gasto deducible (y además se paga). */
  cuotaRetaDeducida: number;
  /** Ingresos − gastos − cuota RETA (mínimo 0). */
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
  /** El dato que aporta el usuario, tal cual. */
  rendimientoNetoModulos: number;
  /** Reducción general del 5 % SIN tope sobre el rendimiento neto de módulos (DA 1.ª). */
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
  /** Cuota RETA anual: en módulos NO reduce el rendimiento, solo se suma al coste. */
  cuotaReta: number;
  costeAnualTotal: number;
}

export interface ResultadoModulosVsDirecta {
  estimacionDirecta: ResultadoRegimenED;
  /** null cuando no hay dato o los límites de exclusión lo impiden (ver `motivoSinModulos`). */
  modulos: ResultadoRegimenModulos | null;
  motivoSinModulos: MotivoSinModulos | null;
  /**
   * costeED − costeMódulos (positivo = el coste en directa es mayor). null sin columna de
   * módulos. Es un DATO de un año, no un veredicto sobre qué régimen elegir.
   */
  diferencia: number | null;
}

/** Mínimo personal orientativo (sin familia). */
const MINIMO_PERSONAL = MINIMOS_IRPF_2025.personal;

/**
 * Cuota íntegra de IRPF (art. 63.1.2º LIRPF): el mínimo forma parte de la base y se grava a
 * tipo cero aplicando la escala dos veces. La fórmula vive en `calcularCuotaIntegraGeneral`.
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

function calcularED(ingresos: number, gastos: number, retaMensual: number): ResultadoRegimenED {
  const cuotaReta = retaMensual * 12;
  // Las cotizaciones del titular al RETA son gasto deducible en directa (Manual práctico de
  // Renta de la AEAT, cap. 7, «Gastos de personal»): hallazgo 2444.
  const rendimientoNetoPrevio = Math.max(0, ingresos - gastos - cuotaReta);
  // Provisiones y gastos de difícil justificación (art. 30.2.ª RIRPF), sellado en data/fiscal.
  const reduccion5pc = reduccionGastosDificilJustificacion(rendimientoNetoPrevio);
  const rendimientoNetoReducido = Math.max(0, rendimientoNetoPrevio - reduccion5pc);
  const baseLiquidable = rendimientoNetoReducido;
  const { cuotaEscala, cuotaMinimo, irpf } = calcularIRPF(baseLiquidable);
  return {
    ingresos,
    gastos,
    cuotaRetaDeducida: cuotaReta,
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

function calcularModulos(rendimientoNetoModulos: number, retaMensual: number): ResultadoRegimenModulos {
  // Reducción general del 5 % de la DA 1.ª de la Orden anual, SIN tope en euros (hallazgo 2445).
  const reduccion5pc = reduccionGeneralModulos(rendimientoNetoModulos);
  const rendimientoNetoReducido = Math.max(0, rendimientoNetoModulos - reduccion5pc);
  const baseLiquidable = rendimientoNetoReducido;
  const { cuotaEscala, cuotaMinimo, irpf } = calcularIRPF(baseLiquidable);
  const cuotaReta = retaMensual * 12;
  return {
    rendimientoNetoModulos,
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

/**
 * Límites cuantitativos de exclusión (LIMITES_EXCLUSION_MODULOS_2025): superar los ingresos o
 * las compras de bienes y servicios (aquí, los gastos como aproximación) excluye del régimen.
 * El umbral de facturación a empresas no se comprueba: ni la app ni la tool recogen ese dato.
 */
export function superaLimitesModulos(ingresos: number, gastos: number): boolean {
  return (
    ingresos > LIMITES_EXCLUSION_MODULOS_2025.ingresosConjuntoActividades ||
    gastos > LIMITES_EXCLUSION_MODULOS_2025.comprasBienesYServicios
  );
}

/**
 * @throws RangeError si `rendimientoNetoModulos` viene pero no es un número finito ≥ 0: un
 *   dato inválido no se convierte en una cifra. Ausente (undefined) = sin dato.
 */
export function compararModulosVsDirecta(
  p: ParametrosModulosVsDirecta
): ResultadoModulosVsDirecta {
  const dato = p.rendimientoNetoModulos;
  if (dato !== undefined && !(Number.isFinite(dato) && dato >= 0)) {
    throw new RangeError('El rendimiento neto de módulos debe ser un importe igual o mayor que 0.');
  }

  const estimacionDirecta = calcularED(p.ingresos, p.gastos, p.retaMensual);

  // Los límites van primero: por encima de ellos no hay régimen de módulos que calcular,
  // aunque el usuario haya tecleado un rendimiento.
  const motivoSinModulos: MotivoSinModulos | null = superaLimitesModulos(p.ingresos, p.gastos)
    ? 'supera_limites'
    : dato === undefined
    ? 'sin_dato'
    : null;

  const modulos =
    motivoSinModulos === null && dato !== undefined ? calcularModulos(dato, p.retaMensual) : null;

  return {
    estimacionDirecta,
    modulos,
    motivoSinModulos,
    diferencia: modulos ? estimacionDirecta.costeAnualTotal - modulos.costeAnualTotal : null,
  };
}
