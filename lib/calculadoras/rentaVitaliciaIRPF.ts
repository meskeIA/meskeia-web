/**
 * Calculadora de Renta Vitalicia e Inmediata — Tributación IRPF — lógica pura
 * Usada por: MCP server (calcular_renta_vitalicia_irpf)
 *
 * Calcula la tributación en IRPF de las rentas vitalicias y temporales
 * procedentes de operaciones de seguro de vida o capitales diferidos.
 *
 * Marco normativo:
 *   - LIRPF art. 25.3 — rendimientos del capital mobiliario por seguros de vida
 *   - LIRPF art. 7.v — exención de rentas vitalicias constituidas por mayores de 65 años
 *     con ganancias patrimoniales (hasta 240.000 € de capital transmitido)
 *
 * RENTA VITALICIA INMEDIATA (LIRPF art. 25.3.a):
 *   La parte de cada cobro que tributa como rendimiento del capital mobiliario
 *   depende de la edad del beneficiario en el momento de CONSTITUCIÓN de la renta:
 *
 *   Edad al constituir la renta → % tributable de cada pago:
 *   < 40 años   → 40%
 *   40-49 años  → 35%
 *   50-59 años  → 28%
 *   60-65 años  → 24%
 *   66-69 años  → 20%
 *   ≥ 70 años   → 8%
 *
 *   Este porcentaje es FIJO durante toda la vida de la renta (no cambia al cumplir años).
 *   El rendimiento tributa en la BASE DEL AHORRO (19-28%).
 *
 * RENTA TEMPORAL INMEDIATA (LIRPF art. 25.3.b):
 *   % tributable según duración de la renta temporal:
 *   ≤ 5 años         → 12%
 *   5-10 años (>5)   → 16%
 *   10-15 años (>10) → 20%
 *   > 15 años        → 25%
 *
 * EXENCIÓN para mayores 65 años (LIRPF art. 7.v):
 *   Las ganancias patrimoniales obtenidas por mayores de 65 años con la transmisión
 *   de cualquier bien ESTÁN EXENTAS si el importe obtenido (hasta 240.000 €) se destina
 *   a constituir una renta vitalicia asegurada en el plazo de 6 meses.
 *   - Si el capital invertido proviene de esta exención: los cobros posteriores
 *     también pueden estar exentos hasta el importe invertido bajo este régimen.
 *
 * RESCATE (capital diferido, LIRPF art. 25.3.a):
 *   Si se rescata el capital: tributación = rendimiento = valor de rescate - primas pagadas.
 *   El rendimiento tributa en la base del ahorro.
 *
 * Escala del ahorro 2025 (LIRPF art. 66):
 *   0-6.000 €:       19%
 *   6.000-50.000 €:  21%
 *   50.000-200.000 €: 23%
 *   200.000-300.000 €: 27%
 *   >300.000 €:       28%
 *
 * Fuente: LIRPF arts. 25.3, 7.v — vigente 2025
 * Verificado: 2025-01-15
 *
 * Encadenable con: calcular_irpf, calcular_plan_pensiones, calcular_seguro_vida
 */

// ─── Constantes ────────────────────────────────────────────────────────────

// Porcentajes tributables renta vitalicia (LIRPF art. 25.3.a.1ª)
const TRAMOS_VITALICIA: { edadMinima: number; pctTributable: number }[] = [
  { edadMinima: 70, pctTributable: 8 },
  { edadMinima: 66, pctTributable: 20 },
  { edadMinima: 60, pctTributable: 24 },
  { edadMinima: 50, pctTributable: 28 },
  { edadMinima: 40, pctTributable: 35 },
  { edadMinima: 0,  pctTributable: 40 },
];

// Porcentajes tributables renta temporal (LIRPF art. 25.3.b.1ª)
const TRAMOS_TEMPORAL: { aniosMaximo: number; pctTributable: number }[] = [
  { aniosMaximo: 5,  pctTributable: 12 },
  { aniosMaximo: 10, pctTributable: 16 },
  { aniosMaximo: 15, pctTributable: 20 },
  { aniosMaximo: 999, pctTributable: 25 },
];

// Escala ahorro 2025
const ESCALA_AHORRO_2025 = [
  { limite: 6000,   tipo: 19 },
  { limite: 50000,  tipo: 21 },
  { limite: 200000, tipo: 23 },
  { limite: 300000, tipo: 27 },
  { limite: Infinity, tipo: 28 },
];

const LIMITE_EXENCION_ART7V = 240000; // € capital máximo exento LIRPF art. 7.v

// ─── Tipos públicos ────────────────────────────────────────────────────────

export type TipoRentaVitalicia = 'vitalicia_inmediata' | 'temporal_inmediata' | 'rescate_capital';

export interface ParametrosRentaVitaliciaIRPF {
  /** Tipo de operación */
  tipoRenta: TipoRentaVitalicia;
  /** Cobro anual de la renta (€) — para vitalicia y temporal */
  cobroAnual?: number;
  /** Edad del beneficiario en el momento de constitución de la renta */
  edadConstitucion?: number;
  /**
   * Duración de la renta en años — solo para renta temporal.
   * Para vitalicia, no aplica (se usa la edad de constitución).
   */
  duracionAnios?: number;
  /** Valor de rescate (€) — solo para rescate de capital diferido */
  valorRescate?: number;
  /** Suma de primas pagadas (€) — solo para rescate de capital diferido */
  primasPagadas?: number;
  /**
   * ¿El capital proviene de la exención del art. 7.v (mayores de 65 años)?
   * Si es true y la edad es ≥65, se informa de la posible exención.
   */
  capitaldart7v?: boolean;
  /** Edad actual del contribuyente (para la exención art. 7.v) */
  edadActual?: number;
}

export interface ResultadoRentaVitaliciaIRPF {
  tipoRenta: TipoRentaVitalicia;
  /** Porcentaje tributable de cada cobro (%) */
  pctTributable: number;
  /** Cobro anual (€) */
  cobroAnual: number;
  /** **Rendimiento neto del capital mobiliario tributable (€/año)** */
  rendimientoTributable: number;
  /** Rendimiento exento (€/año) */
  rendimientoExento: number;
  /** Tipo medio del ahorro estimado (%) */
  tipoMedioAhorro: number;
  /** **Cuota IRPF estimada (base del ahorro) (€/año)** */
  cuotaIRPFAnual: number;
  /** ¿Puede beneficiarse de la exención del art. 7.v? */
  posibleExencionArt7v: boolean;
  /** Advertencias */
  advertencias: string[];
  /** Fuente normativa */
  fuenteDatos: string;
}

// ─── Funciones auxiliares ──────────────────────────────────────────────────

function calcularCuotaAhorro(base: number): number {
  let cuota = 0;
  let baseRestante = base;
  let limiteAnterior = 0;
  for (const tramo of ESCALA_AHORRO_2025) {
    const tramoBase = Math.min(baseRestante, tramo.limite - limiteAnterior);
    if (tramoBase <= 0) break;
    cuota += tramoBase * tramo.tipo / 100;
    baseRestante -= tramoBase;
    limiteAnterior = tramo.limite;
    if (baseRestante <= 0) break;
  }
  return Math.round(cuota * 100) / 100;
}

// ─── Función principal ─────────────────────────────────────────────────────

export function calcularRentaVitaliciaIRPF(
  p: ParametrosRentaVitaliciaIRPF
): ResultadoRentaVitaliciaIRPF {
  const r = (n: number) => Math.round(n * 100) / 100;
  const advertencias: string[] = [];

  let pctTributable = 0;
  let cobroAnual = 0;
  let rendimientoTributable = 0;
  let rendimientoExento = 0;

  if (p.tipoRenta === 'vitalicia_inmediata') {
    if (!p.edadConstitucion) throw new Error('Debe indicar la edad de constitución para renta vitalicia.');
    if (!p.cobroAnual) throw new Error('Debe indicar el cobro anual.');
    cobroAnual = p.cobroAnual;
    const tramo = TRAMOS_VITALICIA.find(t => p.edadConstitucion! >= t.edadMinima);
    pctTributable = tramo?.pctTributable ?? 40;
    rendimientoTributable = r(cobroAnual * pctTributable / 100);
    rendimientoExento = r(cobroAnual - rendimientoTributable);
    advertencias.push(`Porcentaje tributable del ${pctTributable}% fijo para toda la vida de la renta (edad de constitución: ${p.edadConstitucion} años). Este porcentaje NO cambia con los años.`);

  } else if (p.tipoRenta === 'temporal_inmediata') {
    if (!p.duracionAnios) throw new Error('Debe indicar la duración en años para renta temporal.');
    if (!p.cobroAnual) throw new Error('Debe indicar el cobro anual.');
    cobroAnual = p.cobroAnual;
    const tramo = TRAMOS_TEMPORAL.find(t => p.duracionAnios! <= t.aniosMaximo);
    pctTributable = tramo?.pctTributable ?? 25;
    rendimientoTributable = r(cobroAnual * pctTributable / 100);
    rendimientoExento = r(cobroAnual - rendimientoTributable);
    advertencias.push(`Renta temporal de ${p.duracionAnios} años → porcentaje tributable del ${pctTributable}%.`);

  } else {
    // Rescate capital diferido
    if (p.valorRescate === undefined) throw new Error('Debe indicar el valor de rescate.');
    if (p.primasPagadas === undefined) throw new Error('Debe indicar las primas pagadas.');
    cobroAnual = p.valorRescate;
    pctTributable = 100;
    rendimientoTributable = r(Math.max(0, p.valorRescate - p.primasPagadas));
    rendimientoExento = r(p.primasPagadas); // el capital aportado no tributa
    advertencias.push(`Rescate: rendimiento = valor rescate (${p.valorRescate.toLocaleString('es-ES')} €) - primas pagadas (${p.primasPagadas.toLocaleString('es-ES')} €) = ${rendimientoTributable.toLocaleString('es-ES')} €.`);
  }

  const cuotaIRPFAnual = calcularCuotaAhorro(rendimientoTributable);
  const tipoMedioAhorro = rendimientoTributable > 0 ? r(cuotaIRPFAnual / rendimientoTributable * 100) : 0;

  // Exención art. 7.v
  const posibleExencionArt7v = (p.edadActual ?? 0) >= 65 && (p.capitaldart7v ?? false);
  if (posibleExencionArt7v) {
    advertencias.push(`Exención art. 7.v LIRPF: si la renta se constituyó con ganancias patrimoniales obtenidas por la venta de bienes por un mayor de 65 años, y el capital invertido no supera ${LIMITE_EXENCION_ART7V.toLocaleString('es-ES')} €, la ganancia previa puede estar exenta. Verificar con asesor fiscal.`);
  }

  advertencias.push('Los rendimientos de capital mobiliario por seguros de vida tributan en la BASE DEL AHORRO (escala 19%-28%). No están sujetos a la escala general del IRPF.');
  advertencias.push('La entidad aseguradora practica una retención del 19% sobre los rendimientos sujetos al IRPF en el momento del cobro.');

  return {
    tipoRenta: p.tipoRenta,
    pctTributable,
    cobroAnual,
    rendimientoTributable,
    rendimientoExento,
    tipoMedioAhorro,
    cuotaIRPFAnual,
    posibleExencionArt7v,
    advertencias,
    fuenteDatos: 'LIRPF arts. 25.3, 7.v — vigente 2025',
  };
}
