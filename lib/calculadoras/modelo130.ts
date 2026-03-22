/**
 * Calculadora de Modelo 130 — Pago Fraccionado IRPF Autónomos — lógica pura
 * Usada por: MCP server (calcular_modelo_130)
 *
 * Calcula el pago fraccionado trimestral del IRPF para autónomos en
 * estimación directa (normal o simplificada), conforme al art. 99 LIRPF
 * y art. 110 RIRPF.
 *
 * Fórmula (estimación directa):
 *   Cuota = 20% × (Rendimiento neto acumulado del ejercicio - Gastos deducibles)
 *         - Retenciones e ingresos a cuenta soportados
 *         - Pagos fraccionados anteriores del mismo ejercicio
 *
 * Si el resultado es positivo → se paga.
 * Si el resultado es ≤ 0 → no se paga (Hacienda no devuelve en el modelo 130).
 *
 * Mínimo de ingresos: Si más del 70% de los ingresos del período
 * provienen de personas/entidades obligadas a retener, el tipo se aplica
 * solo si no se alcanza ese umbral → modelo 130 NO obligatorio en ese caso.
 *
 * Modelo 131 (módulos): Si el autónomo tributa en estimación objetiva (módulos),
 * usa el Modelo 131 (2% cuota de módulos). Esta calculadora solo cubre el 130.
 *
 * Plazos de presentación:
 * - T1: 1-20 de abril
 * - T2: 1-20 de julio
 * - T3: 1-20 de octubre
 * - T4: 1-30 de enero del año siguiente
 *
 * Fuente: LIRPF art. 99 + RIRPF art. 110 — vigente 2025
 * Verificado: 2025-01-15
 *
 * Encadenable con: calcular_irpf, calcular_cuota_autonomo, calcular_modelo_303
 */

// ─── Constantes ────────────────────────────────────────────────────────────────

const PCT_PAGO_FRACCIONADO = 20; // % sobre rendimiento neto acumulado
const PCT_MINIMO_RETENCIONES_EXENCION = 70; // % de ingresos con retención → excluye obligación

// ─── Tipos públicos ────────────────────────────────────────────────────────────

export type TrimestreModelo130 = 'T1' | 'T2' | 'T3' | 'T4';

export interface ParametrosModelo130 {
  /** Trimestre al que corresponde el pago fraccionado */
  trimestre: TrimestreModelo130;
  /**
   * Ingresos (facturación) acumulados desde el 1 de enero hasta el fin del trimestre (€).
   * Es la base de cálculo del rendimiento neto acumulado.
   */
  ingresosAcumulados: number;
  /**
   * Gastos deducibles acumulados desde el 1 de enero hasta el fin del trimestre (€).
   * Incluye: compras, suministros, alquileres, SS autónomo, amortizaciones, etc.
   */
  gastosDeduciblesAcumulados: number;
  /**
   * Retenciones e ingresos a cuenta soportados acumulados (€).
   * Las retenciones que te han practicado tus clientes (19% en facturas profesionales).
   */
  retencionesAcumuladas: number;
  /**
   * Suma de los pagos fraccionados (Modelo 130) ya ingresados en trimestres anteriores del mismo año (€).
   */
  pagosFraccionadosAnteriores: number;
  /**
   * ¿Más del 70% de los ingresos provienen de clientes que te practican retención?
   * Si es true, no existe obligación de presentar el Modelo 130.
   */
  masDeL70PctConRetencion?: boolean;
  /**
   * Año del ejercicio (para mostrar el plazo de presentación).
   */
  anioEjercicio?: number;
}

export interface ResultadoModelo130 {
  /** Trimestre */
  trimestre: TrimestreModelo130;
  /** Ingresos acumulados (€) */
  ingresosAcumulados: number;
  /** Gastos deducibles acumulados (€) */
  gastosDeduciblesAcumulados: number;
  /** Rendimiento neto acumulado (€) = ingresos - gastos */
  rendimientoNetoAcumulado: number;
  /** Cuota bruta (20% del rendimiento neto) (€) */
  cuotaBruta: number;
  /** Retenciones acumuladas soportadas (€) */
  retencionesAcumuladas: number;
  /** Pagos fraccionados anteriores (€) */
  pagosFraccionadosAnteriores: number;
  /** **Cuota a ingresar en el modelo 130 (€)** */
  cuotaAIngresar: number;
  /** ¿Hay obligación de presentar el Modelo 130? */
  obligacionPresentar: boolean;
  /** Motivo de no obligación (si aplica) */
  motivoNoObligacion?: string;
  /** Plazo de presentación */
  plazoPresentacion: string;
  /** Rendimiento neto proyectado anual (estimación) (€) */
  rendimientoAnualEstimado: number;
  /** Cuota IRPF anual estimada (si se ingresara el 20% del total) (€) */
  cuotaAnualEstimada: number;
  /** Advertencias */
  advertencias: string[];
  /** Fuente normativa */
  fuenteDatos: string;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

const PLAZOS: Record<TrimestreModelo130, string> = {
  T1: '1–20 de abril',
  T2: '1–20 de julio',
  T3: '1–20 de octubre',
  T4: '1–30 de enero del año siguiente',
};

const MESES_ACUMULADOS: Record<TrimestreModelo130, number> = {
  T1: 3,
  T2: 6,
  T3: 9,
  T4: 12,
};

// ─── Función principal ─────────────────────────────────────────────────────────

export function calcularModelo130(p: ParametrosModelo130): ResultadoModelo130 {
  if (p.ingresosAcumulados < 0) throw new Error('Los ingresos acumulados no pueden ser negativos.');
  if (p.gastosDeduciblesAcumulados < 0) throw new Error('Los gastos deducibles no pueden ser negativos.');
  if (p.retencionesAcumuladas < 0) throw new Error('Las retenciones no pueden ser negativas.');
  if (p.pagosFraccionadosAnteriores < 0) throw new Error('Los pagos fraccionados anteriores no pueden ser negativos.');

  const r = (n: number) => Math.round(n * 100) / 100;

  const masDeL70PctConRetencion = p.masDeL70PctConRetencion ?? false;
  const obligacionPresentar = !masDeL70PctConRetencion;

  const rendimientoNetoAcumulado = r(p.ingresosAcumulados - p.gastosDeduciblesAcumulados);
  const cuotaBruta = rendimientoNetoAcumulado > 0
    ? r(rendimientoNetoAcumulado * PCT_PAGO_FRACCIONADO / 100)
    : 0;

  // Cuota a ingresar = cuota bruta - retenciones - pagos anteriores
  const cuotaCalculada = r(cuotaBruta - p.retencionesAcumuladas - p.pagosFraccionadosAnteriores);
  const cuotaAIngresar = Math.max(0, cuotaCalculada); // No puede ser negativo (no devuelve)

  // Proyección anual
  const meses = MESES_ACUMULADOS[p.trimestre];
  const rendimientoAnualEstimado = meses > 0 ? r(rendimientoNetoAcumulado / meses * 12) : 0;
  const cuotaAnualEstimada = rendimientoAnualEstimado > 0
    ? r(rendimientoAnualEstimado * PCT_PAGO_FRACCIONADO / 100)
    : 0;

  const plazoPresentacion = PLAZOS[p.trimestre] + (p.anioEjercicio
    ? (p.trimestre === 'T4' ? ` de ${p.anioEjercicio + 1}` : ` de ${p.anioEjercicio}`)
    : '');

  const advertencias: string[] = [
    `Plazo de presentación del ${p.trimestre}: ${plazoPresentacion}.`,
    'El Modelo 130 se presenta aunque la cuota sea 0 (salvo exención por más del 70% de ingresos con retención). Si no se presenta, Hacienda puede imponer sanción.',
    'Los rendimientos negativos acumulados (pérdidas) reducen la cuota a ingresar en trimestres posteriores del mismo año.',
    'Las cuotas de la Seguridad Social del autónomo son gasto deducible. Incluirlas en los gastos deducibles acumulados.',
  ];

  if (masDeL70PctConRetencion) {
    advertencias.push(`No existe obligación de presentar el Modelo 130 si más del ${PCT_MINIMO_RETENCIONES_EXENCION}% de los ingresos provienen de pagadores obligados a retener (profesionales con clientes empresas). Aunque conviene verificarlo con el asesor fiscal.`);
  }

  if (cuotaCalculada < 0) {
    advertencias.push(`El resultado del modelo es negativo (${cuotaCalculada.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €). Se consigna 0 como cuota a ingresar. El exceso NO se devuelve en el 130 — se compensará en la declaración anual de IRPF.`);
  }

  return {
    trimestre: p.trimestre,
    ingresosAcumulados: r(p.ingresosAcumulados),
    gastosDeduciblesAcumulados: r(p.gastosDeduciblesAcumulados),
    rendimientoNetoAcumulado,
    cuotaBruta,
    retencionesAcumuladas: r(p.retencionesAcumuladas),
    pagosFraccionadosAnteriores: r(p.pagosFraccionadosAnteriores),
    cuotaAIngresar,
    obligacionPresentar,
    motivoNoObligacion: masDeL70PctConRetencion
      ? `Más del ${PCT_MINIMO_RETENCIONES_EXENCION}% de los ingresos provienen de clientes que practican retención — no existe obligación de presentar el Modelo 130.`
      : undefined,
    plazoPresentacion,
    rendimientoAnualEstimado,
    cuotaAnualEstimada,
    advertencias,
    fuenteDatos: 'LIRPF art. 99 + RIRPF art. 110 — AEAT, vigente 2025',
  };
}
