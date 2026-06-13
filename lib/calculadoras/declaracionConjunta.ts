/**
 * Comparador Declaración Conjunta vs Individual IRPF — lógica pura sin React ni DOM
 * Usada por: MCP server (calcular_declaracion_conjunta)
 *
 * Compara la cuota total del IRPF entre presentar la declaración de forma
 * individual (cada cónyuge por separado) o de forma conjunta (unidad familiar).
 *
 * La declaración conjunta aplica una reducción especial de 3.400€ (art. 84.2.1 LIRPF)
 * y acumula los rendimientos de ambos cónyuges en una sola liquidación.
 *
 * Fuente: Ley 35/2006 del IRPF art. 84 + LPGE 2025
 */

import {
  TRAMOS_IRPF_2025,
  MINIMOS_IRPF_2025,
  COTIZACIONES_SS_2026,
  BASES_SS_2026,
  GASTOS_DEDUCIBLES_TRABAJO_2025,
  REDUCCION_RENDIMIENTOS_TRABAJO_2025,
  FISCAL_IRPF_META,
} from '@/data/fiscal';

// ─── Constantes ────────────────────────────────────────────────────────────────

// Reducción especial por tributación conjunta matrimonial (art. 84.2.1 LIRPF)
const REDUCCION_CONJUNTA = 3400; // € — matrimonios con ambos cónyuges vivos

// ─── Tipos públicos ────────────────────────────────────────────────────────────

export interface DatosConyuge {
  /** Salario bruto anual (€). Incluir pensiones u otros rendimientos del trabajo. */
  salarioBruto: number;
  /** ¿Cotiza a la Seguridad Social? (falso si es pensionista o autónomo) */
  cotizaSS?: boolean;
  /** Otros rendimientos netos (capital mobiliario, alquiler, etc.) (€) */
  otrosRendimientos?: number;
  /** Retenciones ya practicadas (€) */
  retenciones?: number;
}

export interface ParametrosDeclaracionConjunta {
  /** Datos del cónyuge 1 (generalmente el de más ingresos) */
  conyuge1: DatosConyuge;
  /** Datos del cónyuge 2 */
  conyuge2: DatosConyuge;
  /** Número de hijos a cargo */
  numHijos?: number;
  /** Número de hijos menores de 3 años */
  hijosMenores3?: number;
}

export interface ResultadoModelo {
  /** Rendimientos brutos cónyuge 1 */
  bruto1: number;
  /** Rendimientos brutos cónyuge 2 */
  bruto2: number;
  /** Cuota SS cónyuge 1 */
  ss1: number;
  /** Cuota SS cónyuge 2 */
  ss2: number;
  /** Base imponible cónyuge 1 (tras SS y gastos deducibles) */
  baseImponible1: number;
  /** Base imponible cónyuge 2 */
  baseImponible2: number;
  /** Reducción por RNT cónyuge 1 */
  reduccionRNT1: number;
  /** Reducción por RNT cónyuge 2 */
  reduccionRNT2: number;
  /** Reducción especial conjunta (solo en conjunta) */
  reduccionConjunta: number;
  /** Mínimo personal y familiar */
  minimo: number;
  /** Base liquidable total */
  baseLiquidable: number;
  /** Cuota IRPF total */
  cuotaIRPF: number;
  /** Retenciones practicadas total */
  retenciones: number;
  /** Cuota diferencial (+ = a pagar, - = a devolver) */
  cuotaDiferencial: number;
  /** Tipo efectivo (%) sobre base imponible total */
  tipoEfectivo: number;
}

export interface ResultadoDeclaracionConjunta {
  /** Resultados en modalidad individual (suma de ambas declaraciones) */
  individual: ResultadoModelo;
  /** Resultados en modalidad conjunta */
  conjunta: ResultadoModelo;
  /** Diferencia de cuota: positivo = conjunta es más cara; negativo = conjunta ahorra */
  diferenciaCuota: number;
  /** ¿Conviene la declaración conjunta? */
  convieneConjunta: boolean;
  /** Ahorro/coste adicional de la conjunta (€) */
  ahorroCojunta: number;
  /** Fuente normativa */
  fuenteDatos: string;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function calcularCuotaSS(salarioBruto: number, cotizaSS: boolean): number {
  if (!cotizaSS) return 0;
  const salarioMensual = salarioBruto / 12;
  const baseSS = Math.min(Math.max(salarioMensual, BASES_SS_2026.minima), BASES_SS_2026.maxima);
  const tipoSS = (
    COTIZACIONES_SS_2026.contingenciasComunes +
    COTIZACIONES_SS_2026.desempleo +
    COTIZACIONES_SS_2026.formacionProfesional +
    COTIZACIONES_SS_2026.mef
  ) / 100;
  return Math.round(baseSS * tipoSS * 12 * 100) / 100;
}

function calcularReduccionRNT(rnt: number): number {
  const red = REDUCCION_RENDIMIENTOS_TRABAJO_2025;
  if (rnt <= red.limite1) return red.reduccion1;
  if (rnt >= red.limite2) return red.reduccion2;
  return red.reduccion1 - red.factorInterpolacion * (rnt - red.limite1);
}

function calcularCuotaIRPF(base: number): number {
  let cuota = 0;
  let baseAnterior = 0;
  for (const tramo of TRAMOS_IRPF_2025) {
    if (base <= baseAnterior) break;
    const baseEnTramo = Math.min(base, tramo.hasta) - baseAnterior;
    cuota += baseEnTramo * (tramo.tipo / 100);
    baseAnterior = tramo.hasta;
  }
  return Math.round(cuota * 100) / 100;
}

function calcularMinimo(numHijos: number, hijosMenores3: number): number {
  let minimo = MINIMOS_IRPF_2025.personal;
  const ordenHijos = [MINIMOS_IRPF_2025.hijo_1, MINIMOS_IRPF_2025.hijo_2, MINIMOS_IRPF_2025.hijo_3];
  for (let i = 0; i < numHijos; i++) {
    minimo += i < 3 ? ordenHijos[i] : MINIMOS_IRPF_2025.hijo_4_mas;
  }
  minimo += hijosMenores3 * MINIMOS_IRPF_2025.hijo_menor_3;
  return minimo;
}

// ─── Función principal ─────────────────────────────────────────────────────────

export function calcularDeclaracionConjunta(p: ParametrosDeclaracionConjunta): ResultadoDeclaracionConjunta {
  if (p.conyuge1.salarioBruto < 0 || p.conyuge2.salarioBruto < 0) {
    throw new Error('Los salarios brutos no pueden ser negativos.');
  }

  const r = (n: number) => Math.round(n * 100) / 100;

  const numHijos = p.numHijos ?? 0;
  const hijosMenores3 = p.hijosMenores3 ?? 0;

  // ─── Calcular bases de cada cónyuge ─────────────────────────────────────────

  const cotizaSS1 = p.conyuge1.cotizaSS !== false;
  const cotizaSS2 = p.conyuge2.cotizaSS !== false;

  const ss1 = calcularCuotaSS(p.conyuge1.salarioBruto, cotizaSS1);
  const ss2 = calcularCuotaSS(p.conyuge2.salarioBruto, cotizaSS2);

  // Base imponible = bruto - SS - gastos deducibles (2.000€ si trabaja)
  const gastosD1 = p.conyuge1.salarioBruto > 0 ? GASTOS_DEDUCIBLES_TRABAJO_2025.importeGeneral : 0;
  const gastosD2 = p.conyuge2.salarioBruto > 0 ? GASTOS_DEDUCIBLES_TRABAJO_2025.importeGeneral : 0;
  const otros1 = p.conyuge1.otrosRendimientos ?? 0;
  const otros2 = p.conyuge2.otrosRendimientos ?? 0;
  const ret1 = p.conyuge1.retenciones ?? 0;
  const ret2 = p.conyuge2.retenciones ?? 0;

  const rnt1 = Math.max(0, p.conyuge1.salarioBruto - ss1 - gastosD1);
  const rnt2 = Math.max(0, p.conyuge2.salarioBruto - ss2 - gastosD2);

  const reduccionRNT1 = r(p.conyuge1.salarioBruto > 0 ? calcularReduccionRNT(rnt1) : 0);
  const reduccionRNT2 = r(p.conyuge2.salarioBruto > 0 ? calcularReduccionRNT(rnt2) : 0);

  const baseImponible1 = r(Math.max(0, rnt1 - reduccionRNT1) + otros1);
  const baseImponible2 = r(Math.max(0, rnt2 - reduccionRNT2) + otros2);

  const minimoIndividual = calcularMinimo(numHijos, hijosMenores3); // En individual, cada cónyuge aplica su propio personal

  // ─── INDIVIDUAL ─────────────────────────────────────────────────────────────

  // Cónyuge 1 individual
  const baseLiq1 = Math.max(0, baseImponible1 - MINIMOS_IRPF_2025.personal - (numHijos > 0 ? minimoIndividual - MINIMOS_IRPF_2025.personal : 0));
  const cuotaInd1 = calcularCuotaIRPF(baseLiq1);

  // Cónyuge 2 individual (sin hijos — en individual los hijos se comparten pero
  // simplificamos asignándolos al cónyuge 1 que tiene más ingresos)
  const baseLiq2 = Math.max(0, baseImponible2 - MINIMOS_IRPF_2025.personal);
  const cuotaInd2 = calcularCuotaIRPF(baseLiq2);

  const cuotaIRPFIndividual = r(cuotaInd1 + cuotaInd2);
  const retencionesTotal = ret1 + ret2;
  const cuotaDiferencialIndividual = r(cuotaIRPFIndividual - retencionesTotal);
  const baseTotalIndividual = r(baseImponible1 + baseImponible2);

  const individual: ResultadoModelo = {
    bruto1: r(p.conyuge1.salarioBruto),
    bruto2: r(p.conyuge2.salarioBruto),
    ss1: r(ss1),
    ss2: r(ss2),
    baseImponible1,
    baseImponible2,
    reduccionRNT1,
    reduccionRNT2,
    reduccionConjunta: 0,
    minimo: r(MINIMOS_IRPF_2025.personal * 2 + (minimoIndividual - MINIMOS_IRPF_2025.personal)),
    baseLiquidable: r(baseLiq1 + baseLiq2),
    cuotaIRPF: cuotaIRPFIndividual,
    retenciones: r(retencionesTotal),
    cuotaDiferencial: cuotaDiferencialIndividual,
    tipoEfectivo: baseTotalIndividual > 0 ? r((cuotaIRPFIndividual / baseTotalIndividual) * 100) : 0,
  };

  // ─── CONJUNTA ────────────────────────────────────────────────────────────────

  // Base imponible conjunta = suma de ambos + reducción 3.400€
  const baseImponibleConjunta = r(baseImponible1 + baseImponible2);
  const minimoConjunto = calcularMinimo(numHijos, hijosMenores3) + MINIMOS_IRPF_2025.personal; // 1 personal solo (el otro se absorbe en la reducción conjunta)
  const baseLiquidableConjunta = Math.max(0, baseImponibleConjunta - REDUCCION_CONJUNTA - minimoConjunto);
  const cuotaIRPFConjunta = r(calcularCuotaIRPF(baseLiquidableConjunta));
  const cuotaDiferencialConjunta = r(cuotaIRPFConjunta - retencionesTotal);

  const conjunta: ResultadoModelo = {
    bruto1: r(p.conyuge1.salarioBruto),
    bruto2: r(p.conyuge2.salarioBruto),
    ss1: r(ss1),
    ss2: r(ss2),
    baseImponible1,
    baseImponible2,
    reduccionRNT1,
    reduccionRNT2,
    reduccionConjunta: REDUCCION_CONJUNTA,
    minimo: r(minimoConjunto),
    baseLiquidable: r(baseLiquidableConjunta),
    cuotaIRPF: cuotaIRPFConjunta,
    retenciones: r(retencionesTotal),
    cuotaDiferencial: cuotaDiferencialConjunta,
    tipoEfectivo: baseImponibleConjunta > 0 ? r((cuotaIRPFConjunta / baseImponibleConjunta) * 100) : 0,
  };

  const diferenciaCuota = r(cuotaIRPFConjunta - cuotaIRPFIndividual);
  const convieneConjunta = diferenciaCuota < 0;
  const ahorroCojunta = r(Math.abs(diferenciaCuota));

  return {
    individual,
    conjunta,
    diferenciaCuota,
    convieneConjunta,
    ahorroCojunta,
    fuenteDatos: `${FISCAL_IRPF_META.fuente} art. 84 — Reducción conjunta 3.400€/año — verificado ${FISCAL_IRPF_META.verificado}`,
  };
}
