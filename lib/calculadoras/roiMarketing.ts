/**
 * Calculadora de ROI de Marketing — lógica pura sin React ni DOM
 * Usada por: MCP server (calcular_roi_marketing)
 *
 * Calcula el retorno de inversión por canal de marketing:
 * ROI, beneficio, CAC (coste por cliente), ROAS y ratio CLV/CAC.
 */

// ─── Tipos públicos ────────────────────────────────────────────────────────────

export type RecomendacionTipo = 'excelente' | 'bueno' | 'revisar' | 'pausar';

export interface CanalMarketing {
  /** Nombre del canal (ej: 'Google Ads', 'Email Marketing') */
  nombre: string;
  /** Inversión en el canal (€) */
  inversion: number;
  /** Número de clientes captados */
  clientes: number;
  /** Ingreso medio por cliente (€) */
  ingresoPorCliente: number;
}

export interface ResultadoCanal {
  nombre: string;
  inversion: number;
  clientes: number;
  ingresoPorCliente: number;
  /** Ingresos totales generados */
  ingresosTotales: number;
  /** Beneficio neto (ingresos - inversión) */
  beneficio: number;
  /** ROI en % */
  roi: number;
  /** Coste de Adquisición por Cliente */
  cac: number;
  /** ROAS (Return on Ad Spend) — multiplicador */
  roas: number;
  /** Ratio CLV/CAC (valor de vida del cliente / CAC) */
  clvCacRatio: number;
  /** Si el canal es rentable */
  esRentable: boolean;
  /** Recomendación de acción */
  recomendacion: string;
  /** Tipo de recomendación */
  tipoRecomendacion: RecomendacionTipo;
}

export interface ResultadoROIMarketing {
  /** Resultados por canal */
  canales: ResultadoCanal[];
  /** Inversión total */
  inversionTotal: number;
  /** Ingresos totales */
  ingresosTotal: number;
  /** Clientes totales */
  clientesTotal: number;
  /** Beneficio total */
  beneficioTotal: number;
  /** ROI total (%) */
  roiTotal: number;
  /** CAC medio ponderado */
  cacPromedio: number;
  /** Canal más rentable */
  mejorCanal: string | null;
  /** Canal menos rentable */
  peorCanal: string | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getRecomendacion(roi: number, clvCacRatio: number): { texto: string; tipo: RecomendacionTipo } {
  if (roi > 200 && clvCacRatio > 3) return { texto: 'Escalar inversión', tipo: 'excelente' };
  if (roi > 100) return { texto: 'Mantener y optimizar', tipo: 'bueno' };
  if (roi > 0) return { texto: 'Revisar segmentación', tipo: 'revisar' };
  return { texto: 'Considerar pausar', tipo: 'pausar' };
}

// ─── Función principal ─────────────────────────────────────────────────────────

export function calcularROIMarketing(
  canales: CanalMarketing[],
  valorVidaCliente?: number
): ResultadoROIMarketing {
  if (canales.length === 0) throw new Error('Debe proporcionar al menos un canal de marketing.');
  if (canales.length > 15) throw new Error('Máximo 15 canales por cálculo.');

  const r = (n: number) => Math.round(n * 100) / 100;
  const clv = valorVidaCliente ?? 0;

  const canalesResultado: ResultadoCanal[] = canales.map(canal => {
    if (canal.inversion < 0) throw new Error(`Inversión negativa en canal "${canal.nombre}".`);
    if (canal.clientes < 0) throw new Error(`Número de clientes negativo en canal "${canal.nombre}".`);
    if (canal.ingresoPorCliente < 0) throw new Error(`Ingreso por cliente negativo en canal "${canal.nombre}".`);

    const ingresosTotales = r(canal.clientes * canal.ingresoPorCliente);
    const beneficio = r(ingresosTotales - canal.inversion);
    const roi = canal.inversion > 0 ? r((beneficio / canal.inversion) * 100) : 0;
    const cac = canal.clientes > 0 ? r(canal.inversion / canal.clientes) : 0;
    const roas = canal.inversion > 0 ? r(ingresosTotales / canal.inversion) : 0;
    const clvCacRatio = cac > 0 && clv > 0 ? r(clv / cac) : 0;
    const { texto, tipo } = getRecomendacion(roi, clvCacRatio);

    return {
      nombre: canal.nombre,
      inversion: canal.inversion,
      clientes: canal.clientes,
      ingresoPorCliente: canal.ingresoPorCliente,
      ingresosTotales,
      beneficio,
      roi,
      cac,
      roas,
      clvCacRatio,
      esRentable: beneficio > 0,
      recomendacion: texto,
      tipoRecomendacion: tipo,
    };
  });

  const activos = canalesResultado.filter(c => c.inversion > 0);
  const inversionTotal = r(activos.reduce((s, c) => s + c.inversion, 0));
  const ingresosTotal = r(activos.reduce((s, c) => s + c.ingresosTotales, 0));
  const clientesTotal = activos.reduce((s, c) => s + c.clientes, 0);
  const beneficioTotal = r(ingresosTotal - inversionTotal);
  const roiTotal = inversionTotal > 0 ? r((beneficioTotal / inversionTotal) * 100) : 0;
  const cacPromedio = clientesTotal > 0 ? r(inversionTotal / clientesTotal) : 0;

  const ranking = [...activos].sort((a, b) => b.roi - a.roi);

  return {
    canales: canalesResultado,
    inversionTotal,
    ingresosTotal,
    clientesTotal,
    beneficioTotal,
    roiTotal,
    cacPromedio,
    mejorCanal: ranking[0]?.nombre ?? null,
    peorCanal: ranking[ranking.length - 1]?.nombre ?? null,
  };
}
