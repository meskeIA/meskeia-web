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
  calcularCuotaIntegraGeneral,
  MINIMOS_IRPF_2025,
  GASTOS_DEDUCIBLES_TRABAJO_2025,
  REDUCCION_RENDIMIENTOS_TRABAJO_2025,
  TRAMOS_GANANCIAS_PATRIMONIALES_2025,
  calcularReduccionRendimientosTrabajo,
  FISCAL_IRPF_META,
} from '@/data/fiscal';

// ─── Tipos públicos ────────────────────────────────────────────────────────────

// Tramos de la base del ahorro. Esta copia SÍ tenía el 30 % correcto, a diferencia de las
// otras nueve del catálogo —que se quedaron en el 28 % de 2024 y se drenaron el 09/09/2026—,
// pero se importa igualmente: una copia que hoy coincide es una copia que mañana diverge, y
// es exactamente así como las otras nueve llegaron a divergir sin que nadie lo viera.
const TRAMOS_AHORRO_2025 = TRAMOS_GANANCIAS_PATRIMONIALES_2025;

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
  return calcularReduccionRendimientosTrabajo(rnt);
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

  // Base liquidable general.
  //
  // ⚠️ CORREGIDO EL 09/09/2026. Hasta hoy esta línea era
  //     baseLiquidableGeneral = baseImponibleGeneral − minimoPersonalFamiliar
  // es decir, restaba el mínimo de la BASE. Eso lo valora al tipo MARGINAL del
  // contribuyente, y el art. 63.1.2º LIRPF establece justo lo contrario: la escala se
  // aplica a la base liquidable completa y la cuota resultante «se minorará en el importe
  // derivado de aplicar a la parte de la base liquidable general correspondiente al mínimo
  // personal y familiar esta misma escala» (AEAT, Manual práctico Renta 2025, «Gravamen
  // estatal»). El mínimo se valora así a los tipos de los PRIMEROS tramos, no al marginal.
  //
  // El método antiguo subestimaba la cuota, y cuanto más alta la renta más: con 50.000 € de
  // base y 5.550 € de mínimo daba 12.148,00 € donde corresponden 13.147,00 € — casi 1.000 €
  // menos. Lo destapó que dos tools del mismo MCP discreparan 255 €/año en el mismo caso.
  const baseLiquidableGeneral = baseImponibleGeneral;

  // Cuota integra general = escala(base liquidable) - escala(minimo personal y familiar).
  // Desde el 12/09/2026 esa resta la hace `calcularCuotaIntegraGeneral` y ya no se
  // reescribe aqui; `calcularCuotaTramos` se conserva solo para el DESGLOSE que se imprime,
  // que es el de la primera aplicacion de la escala (a la base entera).
  const { desglose: desgloseGeneral } = calcularCuotaTramos(
    baseLiquidableGeneral,
    TRAMOS_IRPF_2025,
  );
  const cuotaGeneral = calcularCuotaIntegraGeneral(baseLiquidableGeneral, minimoPersonalFamiliar);

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
