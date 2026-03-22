/**
 * Calculadora de Valor Presente / Valor Actual Neto — lógica pura sin React ni DOM
 * Usada por: MCP server (calcular_valor_presente)
 *
 * Calcula el valor presente (VA) de:
 * A) Un capital futuro único (descuento simple)
 * B) Una renta periódica (anualidad ordinaria o anticipada)
 * C) Una perpetuidad
 *
 * También calcula el valor futuro (VF) dado un valor presente.
 *
 * Encadenable con: calcular_tir_van, calcular_interes_compuesto, calcular_regla_72
 */

// ─── Tipos públicos ────────────────────────────────────────────────────────────

export type ModoValorPresente = 'capital_futuro' | 'renta' | 'perpetuidad';
export type TipoRenta = 'ordinaria' | 'anticipada';
export type Periodicidad = 'mensual' | 'trimestral' | 'semestral' | 'anual';

export interface ParametrosValorPresente {
  /** Modo de cálculo */
  modo: ModoValorPresente;
  /** Tasa de descuento / interés anual (%) */
  tasaAnual: number;
  /**
   * Para modo "capital_futuro": importe del capital futuro (€).
   * Para modo "renta": importe del pago periódico (€).
   * Para modo "perpetuidad": importe del pago periódico eterno (€).
   */
  importe: number;
  /** Número de períodos (años para "capital_futuro", períodos según periodicidad para "renta") */
  periodos?: number;
  /** Periodicidad de los pagos (solo para modo "renta"). Por defecto "anual". */
  periodicidad?: Periodicidad;
  /** Tipo de renta (solo para modo "renta"). Por defecto "ordinaria" (pagos al final del período). */
  tipoRenta?: TipoRenta;
  /** Capital presente conocido para calcular el valor futuro (modo inverso) (€) */
  valorPresenteConocido?: number;
}

export interface ResultadoValorPresente {
  /** Modo usado */
  modo: ModoValorPresente;
  /** Tasa anual (%) */
  tasaAnual: number;
  /** Tasa por período equivalente (%) */
  tasaPorPeriodo: number;
  /** Valor presente calculado (€) */
  valorPresente: number;
  /** Valor futuro (si se proporcionó valor presente conocido) (€) */
  valorFuturo?: number;
  /** Número de períodos */
  periodos?: number;
  /** Periodicidad */
  periodicidad?: Periodicidad;
  /** Total de pagos nominales (sin descontar) (€) */
  totalNominal?: number;
  /** Descuento total aplicado (€) */
  descuentoTotal?: number;
  /** Interpretación del resultado */
  interpretacion: string;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

const PERIODOS_POR_ANO: Record<Periodicidad, number> = {
  mensual: 12,
  trimestral: 4,
  semestral: 2,
  anual: 1,
};

// ─── Función principal ─────────────────────────────────────────────────────────

export function calcularValorPresente(p: ParametrosValorPresente): ResultadoValorPresente {
  if (p.tasaAnual < 0) throw new Error('La tasa anual no puede ser negativa.');
  if (p.importe <= 0) throw new Error('El importe debe ser mayor que cero.');

  const r = (n: number) => Math.round(n * 100) / 100;

  const periodicidad = p.periodicidad ?? 'anual';
  const nPerAno = PERIODOS_POR_ANO[periodicidad];

  // Tasa por período equivalente (capitalización compuesta)
  const tasaPorPeriodo = p.tasaAnual === 0 ? 0 : r(((Math.pow(1 + p.tasaAnual / 100, 1 / nPerAno) - 1) * 100));
  const rPeriodo = tasaPorPeriodo / 100;

  let valorPresente: number;
  let totalNominal: number | undefined;
  let interpretacion: string;

  switch (p.modo) {
    case 'capital_futuro': {
      const n = p.periodos ?? 1;
      if (n <= 0) throw new Error('El número de períodos debe ser mayor que cero.');
      // VA = VF / (1+r)^n  — donde r es tasa anual y n en años
      valorPresente = p.tasaAnual === 0
        ? p.importe
        : r(p.importe / Math.pow(1 + p.tasaAnual / 100, n));
      totalNominal = p.importe;
      interpretacion = `${r(p.importe).toLocaleString('es-ES')} € dentro de ${n} año${n !== 1 ? 's' : ''} equivalen hoy a ${valorPresente.toLocaleString('es-ES')} € (con tasa de descuento ${p.tasaAnual}%).`;
      break;
    }

    case 'renta': {
      const n = p.periodos ?? 12;
      if (n <= 0) throw new Error('El número de períodos debe ser mayor que cero.');
      const tipoRenta = p.tipoRenta ?? 'ordinaria';

      if (rPeriodo === 0) {
        valorPresente = r(p.importe * n);
      } else {
        // VA renta ordinaria: VA = C × (1 - (1+r)^-n) / r
        const vaOrdinaria = p.importe * (1 - Math.pow(1 + rPeriodo, -n)) / rPeriodo;
        // Renta anticipada: VA_anticipada = VA_ordinaria × (1+r)
        valorPresente = r(tipoRenta === 'anticipada' ? vaOrdinaria * (1 + rPeriodo) : vaOrdinaria);
      }

      totalNominal = r(p.importe * n);
      interpretacion = `Renta de ${p.importe.toLocaleString('es-ES')} €/${periodicidad} durante ${n} períodos. Valor presente: ${valorPresente.toLocaleString('es-ES')} €. Descuento total: ${r(totalNominal - valorPresente).toLocaleString('es-ES')} €.`;
      break;
    }

    case 'perpetuidad': {
      if (p.tasaAnual === 0) throw new Error('No se puede calcular una perpetuidad con tasa 0%.');
      // VA perpetuidad = C / r (tasa por período)
      if (rPeriodo === 0) throw new Error('La tasa por período no puede ser cero para una perpetuidad.');
      valorPresente = r(p.importe / rPeriodo);
      interpretacion = `Renta perpetua de ${p.importe.toLocaleString('es-ES')} €/${periodicidad} equivale hoy a ${valorPresente.toLocaleString('es-ES')} € (tasa ${p.tasaAnual}%).`;
      break;
    }

    default:
      throw new Error('Modo de cálculo no reconocido.');
  }

  const resultado: ResultadoValorPresente = {
    modo: p.modo,
    tasaAnual: p.tasaAnual,
    tasaPorPeriodo,
    valorPresente,
    periodos: p.periodos,
    periodicidad,
    totalNominal,
    descuentoTotal: totalNominal ? r(totalNominal - valorPresente) : undefined,
    interpretacion,
  };

  // Cálculo inverso: valor futuro dado VP conocido
  if (p.valorPresenteConocido && p.periodos) {
    resultado.valorFuturo = r(p.valorPresenteConocido * Math.pow(1 + p.tasaAnual / 100, p.periodos));
  }

  return resultado;
}
