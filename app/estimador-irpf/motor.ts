/**
 * Motor del estimador IRPF — sin React, para que la vista y los ejemplos del bloque educativo
 * salgan de la MISMA fórmula.
 *
 * ── Ejercicio ────────────────────────────────────────────────────────────────
 * Calcula el ejercicio 2025 (la declaración que se presenta en 2026). Todos los datos son de
 * ese ejercicio y salen de data/fiscal: escala general y mínimos (irpf.ts), escala del ahorro
 * (inmuebles.ts) y cotización del trabajador de 2025 (COTIZACIONES_SS_2025, BASES_SS_2025).
 * Hasta el 24/09/2026 la cotización era la de 2026 con el título «IRPF 2025» (hallazgo 1312).
 *
 * ── Las dos bases (arts. 45 a 50 y 56 LIRPF) ─────────────────────────────────
 * · Base GENERAL: rendimiento neto del trabajo reducido.
 * · Base del AHORRO: los rendimientos del capital mobiliario (dividendos e intereses, arts.
 *   25.1, 25.2 y 46), con su propia escala del art. 66. Hasta el 24/09/2026 se sumaban a la
 *   base general y tributaban al marginal (hallazgo 1310).
 *
 * ── El mínimo personal y familiar ────────────────────────────────────────────
 * No reduce la base: se grava a tipo cero (art. 63.1.2.º), con `calcularCuotaIntegraGeneral`.
 * Se aplica primero a la base liquidable general y el REMANENTE a la del ahorro (art. 56.2),
 * con el mismo método sobre la escala del ahorro.
 *
 * ── Reducción por tributación conjunta (art. 84.2, reglas 3.ª y 4.ª) ─────────
 * Esta sí reduce la base: primero la general, y el remanente la del ahorro, sin que ninguna
 * quede negativa (AEAT, Manual práctico Renta 2025, «Reducción por tributación conjunta»).
 */

import {
  MINIMOS_IRPF_2025,
  REDUCCION_TRIBUTACION_CONJUNTA_2025,
  REDUCCION_RENDIMIENTOS_TRABAJO_2025,
  COTIZACIONES_SS_2025,
  BASES_SS_2025,
  GASTOS_DEDUCIBLES_TRABAJO_2025,
  TRAMOS_GANANCIAS_PATRIMONIALES_2025,
  calcularReduccionRendimientosTrabajo,
  calcularDeduccionRentasBajas,
  calcularCuotaIntegraGeneral,
  cuotaEscalaGeneral,
  desglosarEscalaGeneral,
} from '@/data/fiscal';

/** Ejercicio que calcula el estimador. Todos los datos importados arriba son de este año. */
export const EJERCICIO = 2025;

export type SituacionFamiliar = 'soltero' | 'casado_un_ingreso' | 'casado_dos_ingresos' | 'familia_monoparental';

export interface DesgloseTramo {
  desde: number;
  hasta: number | null;
  tipo: number;
  baseAplicada: number;
  cuota: number;
}

export interface EntradaIRPF {
  /** Rendimientos íntegros del trabajo (nómina o pensión), €/año. */
  brutoTrabajo: number;
  /** Rendimientos del capital mobiliario (dividendos, intereses), €/año. */
  capitalMobiliario: number;
  retenciones: number;
  situacion: SituacionFamiliar;
  numHijos: number;
  hijosMenores3: number;
  /**
   * Trabajo por cuenta ajena con nómina: solo decide la cotización del trabajador y la
   * deducción por obtención de rendimientos del trabajo, que la AEAT limita a los
   * «derivados de la prestación efectiva de servicios» (una pensión no la tiene). Los
   * 2.000 € del art. 19.2.f y la reducción del art. 20 corresponden a CUALQUIER rendimiento
   * del trabajo, pensiones incluidas (hallazgo 1311).
   */
  conNomina: boolean;
  /** Mínimo del contribuyente (art. 57). Por defecto, el general; los ejemplos pasan el de ≥65. */
  minimoContribuyente?: number;
}

export interface ResultadoIRPF {
  brutoTrabajo: number;
  ssAnual: number;
  gastosDeducibles: number;
  rendimientoNetoTrabajo: number;
  reduccionTrabajo: number;
  /** La reducción del art. 20 se pierde por tener más de 6.500 € de otras rentas. */
  reduccionPerdidaPorOtrasRentas: boolean;
  baseImponibleGeneral: number;
  baseImponibleAhorro: number;
  reduccionConjunta: number;
  baseLiquidableGeneral: number;
  baseLiquidableAhorro: number;
  minimosPersonalesFamiliares: number;
  /** Parte del mínimo que no cabe en la base general y pasa a la del ahorro (art. 56.2). */
  minimoEnAhorro: number;
  cuotaEscalaGeneral: number;
  cuotaMinimoGeneral: number;
  cuotaIntegraGeneral: number;
  desgloseTramos: DesgloseTramo[];
  cuotaEscalaAhorro: number;
  cuotaMinimoAhorro: number;
  cuotaIntegraAhorro: number;
  desgloseAhorro: DesgloseTramo[];
  cuotaIntegra: number;
  deduccionRentasBajas: number;
  cuotaTrasDeducciones: number;
  retenciones: number;
  cuotaDiferencial: number;
  /** Cuota tras deducciones sobre la suma de las dos bases imponibles, en %. */
  tipoEfectivo: number;
}

/** Cotización del trabajador de 2025: contingencias comunes + desempleo + FP + MEI = 6,47 %. */
export function cotizacionTrabajadorAnual(brutoAnual: number): number {
  if (!(brutoAnual > 0)) return 0;
  const baseMensual = Math.max(BASES_SS_2025.minima, Math.min(brutoAnual / 12, BASES_SS_2025.maxima));
  const tipo = COTIZACIONES_SS_2025.contingenciasComunes + COTIZACIONES_SS_2025.desempleo
    + COTIZACIONES_SS_2025.formacionProfesional + COTIZACIONES_SS_2025.mef;
  return baseMensual * (tipo / 100) * 12;
}

/**
 * Mínimo personal y familiar (arts. 57 y 58). Con «casado/a (dos ingresos)» cada cónyuge
 * declara por separado y los dos tienen derecho al mínimo por los mismos hijos, así que se
 * prorratea por partes iguales (art. 61.1.ª LIRPF).
 */
export function calcularMinimos(
  situacion: SituacionFamiliar,
  numHijos: number,
  hijosMenores3: number,
  minimoContribuyente: number = MINIMOS_IRPF_2025.personal,
): number {
  let porHijos = 0;
  if (numHijos >= 1) porHijos += MINIMOS_IRPF_2025.hijo_1;
  if (numHijos >= 2) porHijos += MINIMOS_IRPF_2025.hijo_2;
  if (numHijos >= 3) porHijos += MINIMOS_IRPF_2025.hijo_3;
  if (numHijos >= 4) porHijos += MINIMOS_IRPF_2025.hijo_4_mas * (numHijos - 3);
  porHijos += Math.min(hijosMenores3, numHijos) * MINIMOS_IRPF_2025.hijo_menor_3;

  const prorrateo = situacion === 'casado_dos_ingresos' ? 0.5 : 1;
  return minimoContribuyente + porHijos * prorrateo;
}

/** Reducción por tributación conjunta (art. 84.2): 3.400 € biparental, 2.150 € monoparental. */
export function calcularReduccionTributacionConjunta(situacion: SituacionFamiliar, numHijos: number): number {
  if (situacion === 'casado_un_ingreso') return REDUCCION_TRIBUTACION_CONJUNTA_2025.biparental;
  if (situacion === 'familia_monoparental' && numHijos > 0) return REDUCCION_TRIBUTACION_CONJUNTA_2025.monoparental;
  return 0;
}

function aDesglose(base: number, escala?: { hasta: number; tipo: number }[]): DesgloseTramo[] {
  return desglosarEscalaGeneral(base, escala).tramos.map((t) => ({
    desde: t.desde,
    hasta: t.hasta,
    tipo: t.tipo,
    baseAplicada: t.base,
    cuota: t.cuota,
  }));
}

export function estimarIRPF(e: EntradaIRPF): ResultadoIRPF {
  const bruto = Math.max(0, e.brutoTrabajo);
  const capital = Math.max(0, e.capitalMobiliario);

  // Rendimiento neto del trabajo (arts. 19 y 20)
  const ssAnual = e.conNomina ? cotizacionTrabajadorAnual(bruto) : 0;
  const gastosDeducibles = bruto > 0
    ? Math.min(GASTOS_DEDUCIBLES_TRABAJO_2025.importeGeneral, Math.max(0, bruto - ssAnual))
    : 0;
  const rendimientoNetoTrabajo = Math.max(0, bruto - ssAnual - gastosDeducibles);

  // Art. 20.2: sin reducción si hay más de 6.500 € de rentas distintas de las del trabajo.
  const reduccionPerdidaPorOtrasRentas = capital > REDUCCION_RENDIMIENTOS_TRABAJO_2025.limiteOtrasRentas;
  const reduccionTrabajo = reduccionPerdidaPorOtrasRentas
    ? 0
    : Math.min(calcularReduccionRendimientosTrabajo(rendimientoNetoTrabajo), rendimientoNetoTrabajo);

  const baseImponibleGeneral = Math.max(0, rendimientoNetoTrabajo - reduccionTrabajo);
  const baseImponibleAhorro = capital;

  // Reducción por tributación conjunta: primero la base general, el remanente la del ahorro.
  const reduccionConjunta = calcularReduccionTributacionConjunta(e.situacion, e.numHijos);
  const reduccionConjuntaGeneral = Math.min(reduccionConjunta, baseImponibleGeneral);
  const baseLiquidableGeneral = baseImponibleGeneral - reduccionConjuntaGeneral;
  const baseLiquidableAhorro = Math.max(0, baseImponibleAhorro - (reduccionConjunta - reduccionConjuntaGeneral));

  // Mínimo: a tipo cero en la general; lo que no cabe en ella, en la del ahorro (art. 56.2).
  const minimosPersonalesFamiliares = calcularMinimos(e.situacion, e.numHijos, e.hijosMenores3, e.minimoContribuyente);
  const minimoEnAhorro = Math.max(0, minimosPersonalesFamiliares - baseLiquidableGeneral);

  const escalaGeneral = cuotaEscalaGeneral(baseLiquidableGeneral);
  const cuotaIntegraGeneral = calcularCuotaIntegraGeneral(baseLiquidableGeneral, minimosPersonalesFamiliares);

  const escalaAhorro = cuotaEscalaGeneral(baseLiquidableAhorro, TRAMOS_GANANCIAS_PATRIMONIALES_2025);
  const cuotaIntegraAhorro = calcularCuotaIntegraGeneral(baseLiquidableAhorro, minimoEnAhorro, TRAMOS_GANANCIAS_PATRIMONIALES_2025);

  const cuotaIntegra = cuotaIntegraGeneral + cuotaIntegraAhorro;

  // Deducción por obtención de rendimientos del trabajo: solo prestación efectiva de servicios.
  const deduccionRentasBajas = e.conNomina && bruto > 0
    ? calcularDeduccionRentasBajas(rendimientoNetoTrabajo, capital)
    : 0;
  const cuotaTrasDeducciones = Math.max(0, cuotaIntegra - deduccionRentasBajas);
  const retenciones = Math.max(0, e.retenciones);
  const baseTotal = baseImponibleGeneral + baseImponibleAhorro;

  return {
    brutoTrabajo: bruto,
    ssAnual,
    gastosDeducibles,
    rendimientoNetoTrabajo,
    reduccionTrabajo,
    reduccionPerdidaPorOtrasRentas,
    baseImponibleGeneral,
    baseImponibleAhorro,
    reduccionConjunta,
    baseLiquidableGeneral,
    baseLiquidableAhorro,
    minimosPersonalesFamiliares,
    minimoEnAhorro,
    cuotaEscalaGeneral: escalaGeneral,
    cuotaMinimoGeneral: escalaGeneral - cuotaIntegraGeneral,
    cuotaIntegraGeneral,
    desgloseTramos: aDesglose(baseLiquidableGeneral),
    cuotaEscalaAhorro: escalaAhorro,
    cuotaMinimoAhorro: escalaAhorro - cuotaIntegraAhorro,
    cuotaIntegraAhorro,
    desgloseAhorro: aDesglose(baseLiquidableAhorro, TRAMOS_GANANCIAS_PATRIMONIALES_2025),
    cuotaIntegra,
    deduccionRentasBajas,
    cuotaTrasDeducciones,
    retenciones,
    cuotaDiferencial: cuotaTrasDeducciones - retenciones,
    tipoEfectivo: baseTotal > 0 ? (cuotaTrasDeducciones / baseTotal) * 100 : 0,
  };
}
