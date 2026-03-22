/**
 * Calculadora de TIR y VAN — lógica pura sin React ni DOM
 * Usada por: MCP server (calcular_tir_van)
 *
 * Calcula el Valor Actual Neto (VAN) y la Tasa Interna de Retorno (TIR)
 * para analizar la rentabilidad de una inversión.
 *
 * Métodos: Newton-Raphson (convergencia rápida) + bisección (fallback robusto).
 */

// ─── Tipos públicos ────────────────────────────────────────────────────────────

export interface ParametrosTIRVAN {
  /** Inversión inicial (€, valor positivo) */
  inversionInicial: number;
  /** Tasa de descuento para el VAN (%) */
  tasaDescuento: number;
  /** Flujos de caja anuales (€). Pueden ser positivos o negativos. */
  flujosCaja: number[];
}

export interface FlujoCajaDetalle {
  ano: number;
  flujo: number;
  flujoDescontado: number;
  acumulado: number;
}

export interface ResultadoTIRVAN {
  /** Valor Actual Neto (€) */
  van: number;
  /** Tasa Interna de Retorno (%) — null si no converge */
  tir: number | null;
  /** Si se encontró TIR */
  tirEncontrada: boolean;
  /** Período de recuperación descontado (años) — null si no se recupera */
  payback: number | null;
  /** Detalle año a año */
  flujosDescontados: FlujoCajaDetalle[];
  /** Suma total de flujos de caja sin descontar */
  totalRetornos: number;
  /** Rentabilidad total: (totalRetornos - inversionInicial) / inversionInicial × 100 */
  rentabilidadBruta: number;
  /** Interpretación del resultado */
  interpretacion: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function calcVAN(tasa: number, inversion: number, flujos: number[]): number {
  let van = -inversion;
  flujos.forEach((f, i) => {
    van += f / Math.pow(1 + tasa / 100, i + 1);
  });
  return van;
}

function calcTIR(inversion: number, flujos: number[]): number | null {
  let tir = 10;
  const MAX_ITER = 100;
  const TOL = 0.0001;

  // Newton-Raphson
  for (let i = 0; i < MAX_ITER; i++) {
    const van = calcVAN(tir, inversion, flujos);
    let derivada = 0;
    flujos.forEach((f, j) => {
      derivada -= (j + 1) * f / Math.pow(1 + tir / 100, j + 2) / 100;
    });
    if (Math.abs(derivada) < 1e-7) break;
    const nueva = tir - van / derivada;
    if (Math.abs(nueva - tir) < TOL) return nueva;
    tir = nueva;
    if (tir < -99 || tir > 1000) break;
  }

  // Bisección (fallback)
  let bajo = -50;
  let alto = 200;
  for (let i = 0; i < MAX_ITER; i++) {
    const medio = (bajo + alto) / 2;
    const vanMedio = calcVAN(medio, inversion, flujos);
    if (Math.abs(vanMedio) < TOL || (alto - bajo) / 2 < TOL) return medio;
    if (calcVAN(bajo, inversion, flujos) * vanMedio < 0) alto = medio;
    else bajo = medio;
  }

  return null;
}

// ─── Función principal ─────────────────────────────────────────────────────────

export function calcularTIRVAN(p: ParametrosTIRVAN): ResultadoTIRVAN {
  if (p.inversionInicial <= 0) throw new Error('La inversión inicial debe ser mayor que cero.');
  if (p.flujosCaja.length === 0) throw new Error('Debe proporcionar al menos un flujo de caja.');
  if (p.flujosCaja.length > 30) throw new Error('Máximo 30 períodos de flujos de caja.');
  if (p.tasaDescuento < 0 || p.tasaDescuento > 100) throw new Error('La tasa de descuento debe estar entre 0 y 100%.');

  const rd = (n: number) => Math.round(n * 100) / 100;

  const van = rd(calcVAN(p.tasaDescuento, p.inversionInicial, p.flujosCaja));
  const tirRaw = calcTIR(p.inversionInicial, p.flujosCaja);
  const tir = tirRaw !== null ? rd(tirRaw) : null;

  let acumulado = -p.inversionInicial;
  let payback: number | null = null;

  const flujosDescontados: FlujoCajaDetalle[] = p.flujosCaja.map((flujo, i) => {
    const flujoDescontado = flujo / Math.pow(1 + p.tasaDescuento / 100, i + 1);
    const acumAnterior = acumulado;
    acumulado += flujoDescontado;
    if (payback === null && acumulado >= 0) {
      payback = rd(i + (-acumAnterior / flujoDescontado));
    }
    return {
      ano: i + 1,
      flujo: rd(flujo),
      flujoDescontado: rd(flujoDescontado),
      acumulado: rd(acumulado),
    };
  });

  const totalRetornos = rd(p.flujosCaja.reduce((s, f) => s + f, 0));
  const rentabilidadBruta = rd((totalRetornos - p.inversionInicial) / p.inversionInicial * 100);

  let interpretacion: string;
  if (van > 0) {
    interpretacion = `La inversión crea valor: VAN positivo de ${van.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €. ${tir !== null ? `La TIR (${tir}%) supera la tasa de descuento (${p.tasaDescuento}%), lo que confirma su rentabilidad.` : ''}`;
  } else if (van === 0) {
    interpretacion = 'La inversión es indiferente: el VAN es exactamente cero. Los flujos de caja solo recuperan el coste del capital.';
  } else {
    interpretacion = `La inversión destruye valor: VAN negativo de ${van.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €. Los flujos de caja no cubren el coste del capital al ${p.tasaDescuento}%.`;
  }

  return {
    van,
    tir,
    tirEncontrada: tir !== null,
    payback,
    flujosDescontados,
    totalRetornos,
    rentabilidadBruta,
    interpretacion,
  };
}
