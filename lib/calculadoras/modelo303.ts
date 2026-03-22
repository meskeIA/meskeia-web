/**
 * Calculadora Modelo 303 — Autoliquidación Trimestral del IVA
 * Lógica pura sin React ni DOM
 * Usada por: MCP server (calcular_modelo_303)
 *
 * Calcula la cuota diferencial del IVA a ingresar o a compensar
 * correspondiente a un trimestre fiscal, conforme al Modelo 303 (AEAT).
 *
 * Liquidación:
 * IVA devengado (repercutido en facturas emitidas)
 * - IVA deducible (soportado en facturas recibidas)
 * = Cuota diferencial
 *   · Si positiva → a ingresar en Hacienda
 *   · Si negativa → a compensar (cuarto trimestre también puede solicitar devolución)
 *
 * Tipos de IVA en España 2025: general 21%, reducido 10%, superreducido 4%
 *
 * Fuente: Ley 37/1992 del IVA + Real Decreto 1624/1992 (Reglamento IVA)
 *
 * Encadenable con: calcular_iva, calcular_pago_fraccionado, calcular_cuota_autonomo
 */

// ─── Tipos públicos ────────────────────────────────────────────────────────────

export type Trimestre303 = 'T1' | 'T2' | 'T3' | 'T4';

export interface LineaIVA {
  /** Descripción del concepto (ej: "Servicios profesionales") */
  descripcion?: string;
  /** Base imponible (€) */
  baseImponible: number;
  /** Tipo de IVA (%). Por defecto 21. */
  tipoIVA?: number;
}

export interface ParametrosModelo303 {
  /** Trimestre de la liquidación */
  trimestre: Trimestre303;
  /** Año fiscal. Por defecto año actual. */
  anioFiscal?: number;

  // IVA repercutido (emitido)
  /** Líneas de IVA devengado (facturas emitidas). Si no se desglosa, usar basesTotales. */
  ivaDevengado?: LineaIVA[];
  /** Alternativa simple: base imponible total de facturas emitidas al 21% (€) */
  baseImponibleEmitidas21?: number;
  /** Alternativa simple: base imponible total de facturas emitidas al 10% (€) */
  baseImponibleEmitidas10?: number;
  /** Alternativa simple: base imponible total de facturas emitidas al 4% (€) */
  baseImponibleEmitidas4?: number;

  // IVA soportado (recibido)
  /** Líneas de IVA soportado deducible (facturas recibidas). */
  ivaSoportado?: LineaIVA[];
  /** Alternativa simple: base imponible total de facturas recibidas al 21% (€) */
  baseImponibleRecibidas21?: number;
  /** Alternativa simple: base imponible total de facturas recibidas al 10% (€) */
  baseImponibleRecibidas10?: number;
  /** Alternativa simple: base imponible total de facturas recibidas al 4% (€) */
  baseImponibleRecibidas4?: number;

  /** Resultado a compensar del trimestre anterior (€). Por defecto 0. */
  compensacionAnterior?: number;
  /** ¿Es el cuarto trimestre? (permite solicitar devolución en lugar de solo compensar) */
  esCuartoTrimestre?: boolean;
}

export interface ResultadoModelo303 {
  /** Trimestre */
  trimestre: Trimestre303;
  /** Año fiscal */
  anioFiscal: number;

  // IVA devengado
  /** Base imponible total facturas emitidas (€) */
  baseImponibleDevengada: number;
  /** IVA repercutido total (€) */
  ivaDevengadoTotal: number;

  // IVA deducible
  /** Base imponible total facturas recibidas (€) */
  baseImponibleDeducible: number;
  /** IVA soportado deducible total (€) */
  ivaSoportadoTotal: number;

  // Resultado
  /** Cuota diferencial antes de compensación (devengado - soportado) (€) */
  cuotaDiferencial: number;
  /** Compensación aplicada del período anterior (€) */
  compensacionAplicada: number;
  /** Resultado final de la liquidación (€) */
  resultadoFinal: number;
  /** ¿Sale a ingresar? */
  aIngresar: boolean;
  /** ¿Sale a compensar (negativo)? */
  aCompensar: boolean;
  /** ¿Puede solicitar devolución? (solo T4 con resultado negativo) */
  puedesolicitarDevolucion: boolean;
  /** Fecha límite de presentación */
  fechaLimite: string;
  /** Fuente normativa */
  fuenteDatos: string;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function calcularTotalLineas(lineas: LineaIVA[]): { base: number; cuota: number } {
  let base = 0;
  let cuota = 0;
  for (const l of lineas) {
    const tipo = l.tipoIVA ?? 21;
    base += l.baseImponible;
    cuota += l.baseImponible * (tipo / 100);
  }
  return { base: Math.round(base * 100) / 100, cuota: Math.round(cuota * 100) / 100 };
}

const FECHAS_LIMITE: Record<Trimestre303, string> = {
  T1: '30 de abril',
  T2: '20 de julio',
  T3: '20 de octubre',
  T4: '30 de enero del año siguiente',
};

// ─── Función principal ─────────────────────────────────────────────────────────

export function calcularModelo303(p: ParametrosModelo303): ResultadoModelo303 {
  const r = (n: number) => Math.round(n * 100) / 100;
  const anioFiscal = p.anioFiscal ?? new Date().getFullYear();

  // ── IVA devengado (repercutido)
  let baseDevengada = 0;
  let ivaDevengado = 0;

  if (p.ivaDevengado && p.ivaDevengado.length > 0) {
    const { base, cuota } = calcularTotalLineas(p.ivaDevengado);
    baseDevengada = base;
    ivaDevengado = cuota;
  } else {
    // Modo simple por tipo
    const base21 = p.baseImponibleEmitidas21 ?? 0;
    const base10 = p.baseImponibleEmitidas10 ?? 0;
    const base4  = p.baseImponibleEmitidas4  ?? 0;
    baseDevengada = r(base21 + base10 + base4);
    ivaDevengado = r(base21 * 0.21 + base10 * 0.10 + base4 * 0.04);
  }

  // ── IVA soportado (deducible)
  let baseSoportada = 0;
  let ivaSoportado = 0;

  if (p.ivaSoportado && p.ivaSoportado.length > 0) {
    const { base, cuota } = calcularTotalLineas(p.ivaSoportado);
    baseSoportada = base;
    ivaSoportado = cuota;
  } else {
    const base21 = p.baseImponibleRecibidas21 ?? 0;
    const base10 = p.baseImponibleRecibidas10 ?? 0;
    const base4  = p.baseImponibleRecibidas4  ?? 0;
    baseSoportada = r(base21 + base10 + base4);
    ivaSoportado = r(base21 * 0.21 + base10 * 0.10 + base4 * 0.04);
  }

  const cuotaDiferencial = r(ivaDevengado - ivaSoportado);
  const compensacionAnterior = p.compensacionAnterior ?? 0;
  const compensacionAplicada = compensacionAnterior > 0 && cuotaDiferencial > 0
    ? Math.min(compensacionAnterior, cuotaDiferencial)
    : 0;

  const resultadoFinal = r(cuotaDiferencial - compensacionAplicada);
  const aIngresar = resultadoFinal > 0;
  const aCompensar = resultadoFinal < 0;
  const esCuartoTrimestre = p.esCuartoTrimestre ?? (p.trimestre === 'T4');
  const puedesolicitarDevolucion = aCompensar && esCuartoTrimestre;

  return {
    trimestre: p.trimestre,
    anioFiscal,
    baseImponibleDevengada: r(baseDevengada),
    ivaDevengadoTotal: r(ivaDevengado),
    baseImponibleDeducible: r(baseSoportada),
    ivaSoportadoTotal: r(ivaSoportado),
    cuotaDiferencial,
    compensacionAplicada: r(compensacionAplicada),
    resultadoFinal,
    aIngresar,
    aCompensar,
    puedesolicitarDevolucion,
    fechaLimite: FECHAS_LIMITE[p.trimestre],
    fuenteDatos: 'Ley 37/1992 del IVA art. 92-114 + Modelo 303 AEAT — vigente 2025',
  };
}
