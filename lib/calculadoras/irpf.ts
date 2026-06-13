/**
 * Estimador IRPF — lógica pura sin React ni DOM
 * Usada por: MCP server (calcular_irpf)
 *
 * Calcula la cuota diferencial IRPF incluyendo rendimientos del trabajo,
 * capital mobiliario e inmobiliario, aplicando gastos deducibles,
 * reducción RNT, mínimos personales y familiares.
 *
 * Fuente: Ley 35/2006 IRPF + LPGE 2025
 */

import {
  TRAMOS_IRPF_2025,
  MINIMOS_IRPF_2025,
  GASTOS_DEDUCIBLES_TRABAJO_2025,
  REDUCCION_RENDIMIENTOS_TRABAJO_2025,
  FISCAL_IRPF_META,
} from '@/data/fiscal';

// ─── Tipos públicos ────────────────────────────────────────────────────────────

// Tramos base del ahorro 2025
const TRAMOS_AHORRO_2025 = [
  { hasta: 6000,    tipo: 19 },
  { hasta: 50000,   tipo: 21 },
  { hasta: 200000,  tipo: 23 },
  { hasta: 300000,  tipo: 27 },
  { hasta: Infinity, tipo: 30 },
];

export type SituacionFamiliarIRPF = 'soltero' | 'casado_sin_ingresos' | 'casado_con_ingresos';

export interface ParametrosIRPF {
  /** Rendimientos netos del trabajo (bruto - SS) */
  rendimientosTrabajo: number;
  /** Rendimientos capital mobiliario (dividendos, intereses...) */
  rendimientosCapitalMobiliario?: number;
  /** Rendimientos capital inmobiliario (alquiler...) */
  rendimientosCapitalInmobiliario?: number;
  /** Ganancias patrimoniales a largo plazo (>12 meses) */
  gananciasPLargo?: number;
  /** Ganancias patrimoniales a corto plazo (≤12 meses) */
  gananciasPCorto?: number;
  /** Retenciones ya practicadas (€) */
  retenciones?: number;
  /** Situación familiar */
  situacion?: SituacionFamiliarIRPF;
  /** Número de hijos */
  numHijos?: number;
  /** Hijos menores de 3 años */
  hijosMenores3?: number;
  /** ¿Tiene rendimientos del trabajo? (para aplicar gastos deducibles) */
  esTrabajador?: boolean;
}

export interface TramoDetalle {
  desde: number;
  hasta: number;
  tipo: number;
  cuota: number;
}

export interface ResultadoIRPF {
  /** Rendimientos netos del trabajo (tras gastos deducibles y reducción RNT) */
  rendimientosTrabajoNetos: number;
  /** Gastos deducibles trabajo */
  gastosDeducibles: number;
  /** Reducción RNT aplicada */
  reduccionRNT: number;
  /** Base imponible general */
  baseImponibleGeneral: number;
  /** Base imponible del ahorro */
  baseImponibleAhorro: number;
  /** Mínimo personal y familiar */
  minimoPersonalFamiliar: number;
  /** Base liquidable general */
  baseLiquidableGeneral: number;
  /** Cuota íntegra general */
  cuotaIntegraGeneral: number;
  /** Cuota íntegra ahorro */
  cuotaIntegralAhorro: number;
  /** Cuota íntegra total */
  cuotaIntegra: number;
  /** Retenciones practicadas */
  retenciones: number;
  /** Cuota diferencial (a pagar / devolver) */
  cuotaDiferencial: number;
  /** Tipo efectivo general (%) */
  tipoEfectivoGeneral: number;
  /** Desglose por tramos generales */
  desgloseGeneral: TramoDetalle[];
  /** Desglose por tramos ahorro */
  desgloseAhorro: TramoDetalle[];
  /** Fuente normativa */
  fuenteDatos: string;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

const r = (n: number) => Math.round(n * 100) / 100;

function calcularCuotaTramos(
  base: number,
  tramos: { hasta: number; tipo: number }[]
): { cuota: number; desglose: TramoDetalle[] } {
  let cuota = 0;
  let baseAnterior = 0;
  const desglose: TramoDetalle[] = [];
  for (const tramo of tramos) {
    if (base <= baseAnterior) break;
    const baseEnTramo = Math.min(base, tramo.hasta) - baseAnterior;
    const cuotaTramo = baseEnTramo * (tramo.tipo / 100);
    cuota += cuotaTramo;
    desglose.push({
      desde: baseAnterior,
      hasta: Math.min(base, tramo.hasta),
      tipo: tramo.tipo,
      cuota: r(cuotaTramo),
    });
    baseAnterior = tramo.hasta;
  }
  return { cuota, desglose };
}

function calcularReduccionRNT(rnt: number): number {
  const red = REDUCCION_RENDIMIENTOS_TRABAJO_2025;
  if (rnt <= red.limite1) return red.reduccion1;
  if (rnt >= red.limite2) return red.reduccion2;
  return red.reduccion1 - red.factorInterpolacion * (rnt - red.limite1);
}

function calcularMinimo(situacion: SituacionFamiliarIRPF, numHijos: number, hijosMenores3: number): number {
  let minimo = MINIMOS_IRPF_2025.personal;
  const ordenHijos = [MINIMOS_IRPF_2025.hijo_1, MINIMOS_IRPF_2025.hijo_2, MINIMOS_IRPF_2025.hijo_3];
  for (let i = 0; i < numHijos; i++) {
    minimo += i < 3 ? ordenHijos[i] : MINIMOS_IRPF_2025.hijo_4_mas;
  }
  minimo += hijosMenores3 * MINIMOS_IRPF_2025.hijo_menor_3;
  return minimo;
}

// ─── Función principal ─────────────────────────────────────────────────────────

export function calcularIRPF(p: ParametrosIRPF): ResultadoIRPF {
  if (p.rendimientosTrabajo < 0) throw new Error('Los rendimientos del trabajo no pueden ser negativos.');

  const situacion = p.situacion ?? 'soltero';
  const numHijos = p.numHijos ?? 0;
  const hijosMenores3 = p.hijosMenores3 ?? 0;
  const esTrabajador = p.esTrabajador !== false;

  // Rendimientos del trabajo netos
  const gastosDeducibles = esTrabajador ? GASTOS_DEDUCIBLES_TRABAJO_2025.importeGeneral : 0;
  const rendimientosTrabajoBrutos = p.rendimientosTrabajo;
  const rntBruto = Math.max(0, rendimientosTrabajoBrutos - gastosDeducibles);
  const reduccionRNT = r(esTrabajador ? calcularReduccionRNT(rntBruto) : 0);
  const rendimientosTrabajoNetos = r(Math.max(0, rntBruto - reduccionRNT));

  // Base imponible general
  const capInmob = p.rendimientosCapitalInmobiliario ?? 0;
  const gananciaCorto = p.gananciasPCorto ?? 0;
  const baseImponibleGeneral = r(rendimientosTrabajoNetos + capInmob + gananciaCorto);

  // Base imponible del ahorro
  const capMob = p.rendimientosCapitalMobiliario ?? 0;
  const gananciaLargo = p.gananciasPLargo ?? 0;
  const baseImponibleAhorro = r(Math.max(0, capMob + gananciaLargo));

  // Mínimo personal y familiar
  const minimoPersonalFamiliar = calcularMinimo(situacion, numHijos, hijosMenores3);

  // Base liquidable general (reduce mínimo sobre base general)
  const baseLiquidableGeneral = r(Math.max(0, baseImponibleGeneral - minimoPersonalFamiliar));

  // Cuota íntegra general
  const { cuota: cuotaGeneral, desglose: desgloseGeneral } = calcularCuotaTramos(
    baseLiquidableGeneral,
    TRAMOS_IRPF_2025,
  );

  // Cuota íntegra ahorro
  const { cuota: cuotaAhorro, desglose: desgloseAhorro } = calcularCuotaTramos(
    baseImponibleAhorro,
    TRAMOS_AHORRO_2025,
  );

  const cuotaIntegra = r(cuotaGeneral + cuotaAhorro);
  const retenciones = p.retenciones ?? 0;
  const cuotaDiferencial = r(cuotaIntegra - retenciones);

  const tipoEfectivoGeneral = baseImponibleGeneral > 0
    ? r((cuotaGeneral / baseImponibleGeneral) * 100)
    : 0;

  return {
    rendimientosTrabajoNetos,
    gastosDeducibles,
    reduccionRNT,
    baseImponibleGeneral,
    baseImponibleAhorro,
    minimoPersonalFamiliar,
    baseLiquidableGeneral,
    cuotaIntegraGeneral: r(cuotaGeneral),
    cuotaIntegralAhorro: r(cuotaAhorro),
    cuotaIntegra,
    retenciones,
    cuotaDiferencial,
    tipoEfectivoGeneral,
    desgloseGeneral,
    desgloseAhorro,
    fuenteDatos: `${FISCAL_IRPF_META.fuente} — verificado ${FISCAL_IRPF_META.verificado}`,
  };
}
