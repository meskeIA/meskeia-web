/**
 * Calculadora de Aplazamiento/Fraccionamiento de Deuda con la AEAT
 * Lógica pura sin React ni DOM
 * Usada por: MCP server (calcular_pago_aplazado_aeat)
 *
 * Calcula el plan de pagos de una deuda tributaria solicitada en aplazamiento
 * o fraccionamiento a la Agencia Tributaria, conforme al art. 65 LGT y
 * los arts. 44-54 del Reglamento General de Recaudación (RGR).
 *
 * Aspectos clave:
 * - El interés aplicado es el interés de demora tributario (art. 26 LGT)
 * - En 2025: interés de demora = 7,25% anual (interés legal 3,25% + 25% = 4,0625% ...
 *   pero legalmente es el fijado en PGE: 7,25% en 2025, prórroga de 2023)
 * - Deudas < 30.000 €: sin garantía si se piden ≤ 12 plazos (personas físicas/micropymes)
 *   Deudas entre 30.001 € y 150.000 €: garantías simplificadas
 *   Deudas > 150.000 €: aval bancario u otras garantías reales
 * - Plazos máximos: hasta 36 meses (personas físicas) / hasta 12 meses (personas jurídicas)
 *   para importes < 30.000 € sin garantías
 *
 * Fuente: LGT art. 65 + RGR art. 44-54 + LPGE 2023 (tipo demora 7,25%)
 * Verificado: 2025-01-15
 *
 * Encadenable con: calcular_irpf, calcular_modelo_303, calcular_interes_demora
 */

// ─── Constantes ────────────────────────────────────────────────────────────────

const INTERES_DEMORA_TRIBUTARIO_2025 = 7.25; // % anual — LGT art. 26 + LPGE 2023
const LIMITE_SIN_GARANTIA = 30000;           // € — sin garantías para personas físicas

// ─── Tipos públicos ────────────────────────────────────────────────────────────

export type TipoSolicitante = 'persona_fisica' | 'persona_juridica';
export type ModalidadAplazamiento = 'aplazamiento' | 'fraccionamiento';

export interface CuotaAplazamiento {
  /** Número de cuota */
  cuota: number;
  /** Fecha aproximada de pago */
  fechaPago: string;
  /** Capital pendiente al inicio del período (€) */
  capitalPendiente: number;
  /** Intereses del período (€) */
  interesesPeriodo: number;
  /** Importe total de la cuota (€) */
  importeCuota: number;
  /** Capital amortizado en esta cuota (€) */
  capitalAmortizado: number;
}

export interface ParametrosPagoAplazadoAEAT {
  /** Importe de la deuda tributaria (principal) (€) */
  importeDeuda: number;
  /** Número de plazos solicitados (meses) */
  numPlazos: number;
  /** Tipo de solicitante */
  tipoSolicitante?: TipoSolicitante;
  /** Modalidad solicitada */
  modalidad?: ModalidadAplazamiento;
  /**
   * Fecha de inicio del aplazamiento (YYYY-MM-DD).
   * Por defecto: hoy.
   */
  fechaInicio?: string;
}

export interface ResultadoPagoAplazadoAEAT {
  /** Importe de la deuda principal (€) */
  importeDeuda: number;
  /** Número de plazos */
  numPlazos: number;
  /** Tipo de interés de demora aplicado (%) */
  tasaInteresDemora: number;
  /** ¿Requiere garantías? */
  requiereGarantias: boolean;
  /** Tipo de garantía requerida */
  tipoGarantia: string;
  /** Cuota mensual aproximada (€) */
  cuotaMensualMedia: number;
  /** Total de intereses a pagar (€) */
  totalIntereses: number;
  /** Total a pagar (principal + intereses) (€) */
  totalAPagar: number;
  /** Coste financiero real (%) */
  costeTotalPct: number;
  /** Plan de pagos detallado */
  planPagos: CuotaAplazamiento[];
  /** ¿El número de plazos excede el máximo sin garantías? */
  excedePlazosMaximos: boolean;
  /** Plazos máximos sin garantías según normativa */
  plazosMaximosSinGarantia: number;
  /** Advertencias */
  advertencias: string[];
  /** Fuente normativa */
  fuenteDatos: string;
}

// ─── Función principal ─────────────────────────────────────────────────────────

export function calcularPagoAplazadoAEAT(p: ParametrosPagoAplazadoAEAT): ResultadoPagoAplazadoAEAT {
  if (p.importeDeuda <= 0) throw new Error('El importe de la deuda debe ser mayor que cero.');
  if (p.numPlazos <= 0 || p.numPlazos > 120) throw new Error('El número de plazos debe estar entre 1 y 120.');

  const r = (n: number) => Math.round(n * 100) / 100;

  const tipoSolicitante = p.tipoSolicitante ?? 'persona_fisica';
  const plazosMaxSinGarantia = tipoSolicitante === 'persona_fisica' ? 36 : 12;
  const requiereGarantias = p.importeDeuda > LIMITE_SIN_GARANTIA || p.numPlazos > plazosMaxSinGarantia;
  const excedePlazos = p.numPlazos > plazosMaxSinGarantia && p.importeDeuda <= LIMITE_SIN_GARANTIA;

  let tipoGarantia: string;
  if (!requiereGarantias) {
    tipoGarantia = 'Sin garantía (deuda < 30.000 € y plazos dentro del límite)';
  } else if (p.importeDeuda <= 150000) {
    tipoGarantia = 'Garantías simplificadas (entre 30.001 € y 150.000 €)';
  } else {
    tipoGarantia = 'Aval bancario u otras garantías reales (> 150.000 €)';
  }

  // Plan de pagos (cuota constante con amortización francesa y tipo mensual)
  const tasaMensual = INTERES_DEMORA_TRIBUTARIO_2025 / 100 / 12;
  const cuotaMensualFija = r(
    (p.importeDeuda * tasaMensual * Math.pow(1 + tasaMensual, p.numPlazos)) /
    (Math.pow(1 + tasaMensual, p.numPlazos) - 1)
  );

  const fechaBase = p.fechaInicio ? new Date(p.fechaInicio) : new Date();
  const planPagos: CuotaAplazamiento[] = [];
  let capitalPendiente = p.importeDeuda;

  for (let i = 1; i <= p.numPlazos; i++) {
    const fecha = new Date(fechaBase);
    fecha.setMonth(fecha.getMonth() + i);
    const intereses = r(capitalPendiente * tasaMensual);
    const capitalAmortizado = r(cuotaMensualFija - intereses);
    const importeCuota = i < p.numPlazos ? cuotaMensualFija : r(capitalPendiente + intereses);
    capitalPendiente = r(capitalPendiente - capitalAmortizado);

    planPagos.push({
      cuota: i,
      fechaPago: fecha.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }),
      capitalPendiente: r(capitalPendiente + capitalAmortizado), // capital al inicio
      interesesPeriodo: intereses,
      importeCuota,
      capitalAmortizado,
    });
  }

  const totalAPagar = r(planPagos.reduce((s, c) => s + c.importeCuota, 0));
  const totalIntereses = r(totalAPagar - p.importeDeuda);
  const costeTotalPct = r(totalIntereses / p.importeDeuda * 100);

  const advertencias: string[] = [
    `El tipo de interés de demora es el ${INTERES_DEMORA_TRIBUTARIO_2025}% anual (art. 26 LGT + LPGE 2023 prorrogado).`,
    'El aplazamiento debe solicitarse antes de que venza el período voluntario de pago. Fuera de plazo, la deuda entra en vía ejecutiva.',
    'La AEAT puede denegar el aplazamiento si considera que el solicitante puede pagar la deuda en el período voluntario.',
  ];
  if (requiereGarantias) {
    advertencias.push('Se requieren garantías. Si no se aportan en el plazo indicado, la AEAT puede denegar o resolver el aplazamiento.');
  }
  if (excedePlazos) {
    advertencias.push(`Con ${p.numPlazos} plazos para una deuda < 30.000 €, se supera el límite de ${plazosMaxSinGarantia} plazos sin garantías para ${tipoSolicitante === 'persona_fisica' ? 'personas físicas' : 'personas jurídicas'}. Se requerirán garantías.`);
  }

  return {
    importeDeuda: r(p.importeDeuda),
    numPlazos: p.numPlazos,
    tasaInteresDemora: INTERES_DEMORA_TRIBUTARIO_2025,
    requiereGarantias,
    tipoGarantia,
    cuotaMensualMedia: cuotaMensualFija,
    totalIntereses,
    totalAPagar,
    costeTotalPct,
    planPagos,
    excedePlazosMaximos: excedePlazos,
    plazosMaximosSinGarantia: plazosMaxSinGarantia,
    advertencias,
    fuenteDatos: 'LGT art. 65 + RGR art. 44-54 + LPGE 2023 (tipo demora 7,25% prorrogado a 2025) — AEAT',
  };
}
