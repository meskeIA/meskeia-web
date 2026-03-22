/**
 * Calculadora de Descuento de Efectos Comerciales y Factoring — lógica pura
 * Usada por: MCP server (calcular_descuento_efectos)
 *
 * Calcula el coste real (TAE) del descuento de pagarés/letras de cambio
 * y del factoring, operaciones de financiación a corto plazo mediante
 * la cesión de derechos de cobro futuros a una entidad financiera.
 *
 * DESCUENTO DE EFECTOS COMERCIALES:
 *   El banco anticipa el nominal de un pagaré/letra menos:
 *   - Interés de descuento: calculado sobre el nominal y el plazo restante
 *   - Comisión de gestión / timbre (coste fijo por efecto)
 *   - Corretaje (si interviene fedatario)
 *
 *   Fórmula del importe descontado (descuento comercial):
 *   D = N × t × d / 360
 *   Donde:
 *     N = nominal del efecto (€)
 *     t = tipo de descuento anual (%)
 *     d = días hasta el vencimiento
 *     360 = base de cálculo bancaria (año comercial)
 *
 *   Importe recibido = N - D - Comisión
 *
 * FACTORING:
 *   Cesión de facturas (créditos comerciales) a un factor (banco/entidad).
 *   - Con recurso: si el deudor no paga, el cedente responde
 *   - Sin recurso: el factor asume el riesgo de impago (más caro)
 *   - Coste: comisión de gestión (% sobre nominal) + interés financiero (tipo × plazo)
 *
 * COSTE EFECTIVO (TAE):
 *   El coste real de la operación se calcula como la TIR del flujo de caja:
 *   - Hoy: recibe el importe neto
 *   - Al vencimiento: paga el nominal
 *
 *   TAE = (N / Neto)^(365/d) - 1
 *
 * TRATAMIENTO FISCAL (LIS art. 15 / LIRPF):
 *   Los intereses y comisiones son GASTO DEDUCIBLE para la empresa cedente:
 *   - En IS: gasto financiero deducible (con límites del art. 16 LIS si >30% EBITDA)
 *   - En IRPF: gasto deducible de actividades económicas
 *
 * Fuente: normativa bancaria + LIS art. 16 (gastos financieros) — vigente 2025
 * Verificado: 2025-01-15
 *
 * Encadenable con: calcular_impuesto_sociedades, calcular_coste_aplazado, calcular_interes_demora
 */

// ─── Constantes ────────────────────────────────────────────────────────────

const BASE_DIAS_BANCARIA = 360;  // año comercial (base de descuento)
const BASE_DIAS_TAE = 365;       // año natural (base TAE)

// ─── Tipos públicos ────────────────────────────────────────────────────────

export type TipoOperacionCesion = 'descuento_pagare' | 'descuento_letra' | 'factoring_con_recurso' | 'factoring_sin_recurso';

export interface ParametrosDescuentoEfectos {
  /** Tipo de operación */
  tipoOperacion: TipoOperacionCesion;
  /** Nominal del efecto o factura (€) — importe que pagará el deudor al vencimiento */
  nominal: number;
  /** Días hasta el vencimiento del efecto/factura */
  diasVencimiento: number;
  /** Tipo de descuento/interés anual aplicado por el banco (%) */
  tipoDescuentoAnual: number;
  /** Comisión de gestión/apertura (€ fijos por operación, o % del nominal) */
  comisionFija?: number;
  /** Comisión en porcentaje sobre el nominal (%) — alternativa a comisionFija */
  comisionPct?: number;
  /**
   * Gastos adicionales (corretaje, timbre, etc.) (€)
   * El timbre (IAJD) aplica solo a letras de cambio (según importe del efecto)
   */
  gastosAdicionales?: number;
  /** Tipo IS/IRPF de la empresa para cuantificar el ahorro fiscal (%) */
  tipoFiscalEmpresa?: number;
}

export interface ResultadoDescuentoEfectos {
  tipoOperacion: TipoOperacionCesion;
  /** Nominal del efecto (€) */
  nominal: number;
  /** Días al vencimiento */
  diasVencimiento: number;
  /** Tipo nominal de descuento anual (%) */
  tipoDescuentoAnual: number;
  /** Importe de intereses descontados (€) */
  importeIntereses: number;
  /** Comisión total (€) */
  comisionTotal: number;
  /** Gastos adicionales (€) */
  gastosAdicionales: number;
  /** Total costes de la operación (€) */
  totalCostes: number;
  /** **Importe neto recibido por la empresa (€)** */
  importeNetoCobrado: number;
  /** **TAE de la operación (%)** */
  tae: number;
  /** Coste financiero deducible en IS/IRPF (€) */
  costeDeducibleFiscal: number;
  /** Ahorro fiscal estimado (€) */
  ahorroFiscalEstimado: number;
  /** Coste neto tras ahorro fiscal (€) */
  costeNetoTrasFiscal: number;
  /** Advertencias */
  advertencias: string[];
  /** Fuente normativa */
  fuenteDatos: string;
}

// ─── Función principal ─────────────────────────────────────────────────────

export function calcularDescuentoEfectos(p: ParametrosDescuentoEfectos): ResultadoDescuentoEfectos {
  if (p.nominal <= 0) throw new Error('El nominal debe ser mayor que cero.');
  if (p.diasVencimiento <= 0) throw new Error('Los días al vencimiento deben ser mayores que cero.');
  if (p.tipoDescuentoAnual < 0) throw new Error('El tipo de descuento no puede ser negativo.');

  const r = (n: number) => Math.round(n * 100) / 100;
  const advertencias: string[] = [];

  // ── Cálculo del descuento ────────────────────────────────────────────────
  const importeIntereses = r(p.nominal * p.tipoDescuentoAnual / 100 * p.diasVencimiento / BASE_DIAS_BANCARIA);

  // Comisión
  let comisionTotal = 0;
  if (p.comisionFija !== undefined) {
    comisionTotal += p.comisionFija;
  }
  if (p.comisionPct !== undefined) {
    comisionTotal += p.nominal * p.comisionPct / 100;
  }
  comisionTotal = r(comisionTotal);

  const gastosAdicionales = r(p.gastosAdicionales ?? 0);
  const totalCostes = r(importeIntereses + comisionTotal + gastosAdicionales);
  const importeNetoCobrado = r(p.nominal - totalCostes);

  if (importeNetoCobrado <= 0) throw new Error('Los costes superan el nominal del efecto.');

  // ── TAE ───────────────────────────────────────────────────────────────────
  // TAE = (Nominal / Neto)^(365 / días) - 1
  const tae = r(((p.nominal / importeNetoCobrado) ** (BASE_DIAS_TAE / p.diasVencimiento) - 1) * 100);

  // ── Fiscalidad ────────────────────────────────────────────────────────────
  const tipoFiscal = p.tipoFiscalEmpresa ?? 25;
  const costeDeducibleFiscal = totalCostes;
  const ahorroFiscalEstimado = r(costeDeducibleFiscal * tipoFiscal / 100);
  const costeNetoTrasFiscal = r(totalCostes - ahorroFiscalEstimado);

  // ── Advertencias ──────────────────────────────────────────────────────────
  if (p.tipoOperacion === 'factoring_sin_recurso') {
    advertencias.push('Factoring sin recurso: el factor asume el riesgo de insolvencia del deudor. La empresa cedente queda liberada aunque el deudor no pague. El coste es mayor que en el factoring con recurso.');
  } else if (p.tipoOperacion === 'factoring_con_recurso') {
    advertencias.push('Factoring con recurso: si el deudor no paga al vencimiento, el factor recobra el anticipo de la empresa cedente. El cedente sigue siendo responsable del cobro final.');
  }
  if (p.tipoOperacion === 'descuento_letra') {
    advertencias.push('Letras de cambio: están sujetas al Impuesto de Actos Jurídicos Documentados (AJD — timbre) si se usa la forma de letra de cambio. El importe del timbre depende del nominal y está regulado en el TRLITP (art. 37 y Disposición adicional 3.ª).');
  }
  advertencias.push(`La base de cálculo del descuento es el año COMERCIAL de ${BASE_DIAS_BANCARIA} días, no el natural. Esto hace que la TAE real (${tae.toFixed(2)}%) sea superior al tipo nominal de descuento (${p.tipoDescuentoAnual.toFixed(2)}%).`);
  advertencias.push('Los intereses y comisiones son gasto financiero deducible en IS/IRPF. Para IS, los gastos financieros netos superiores al 30% del EBITDA o a 1 M€ tienen limitación en la deducción (LIS art. 16).');

  return {
    tipoOperacion: p.tipoOperacion,
    nominal: r(p.nominal),
    diasVencimiento: p.diasVencimiento,
    tipoDescuentoAnual: p.tipoDescuentoAnual,
    importeIntereses,
    comisionTotal,
    gastosAdicionales,
    totalCostes,
    importeNetoCobrado,
    tae,
    costeDeducibleFiscal,
    ahorroFiscalEstimado,
    costeNetoTrasFiscal,
    advertencias,
    fuenteDatos: 'Normativa bancaria + LIS art. 16 (gastos financieros) — vigente 2025',
  };
}
