/**
 * Calculadora de Jubilación Anticipada — lógica pura sin React ni DOM
 * Usada por: MCP server (calcular_jubilacion_anticipada)
 *
 * Calcula el coeficiente reductor de la pensión por jubilación anticipada
 * según la LGSS (arts. 207-208) y el RDL 2/2023. El coeficiente por trimestre
 * depende de los años cotizados (a más años cotizados, menor penalización).
 *
 * Dos modalidades:
 * - Voluntaria: hasta 2 años antes, necesita ≥ 35 años cotizados
 * - Involuntaria: hasta 4 años antes, necesita ≥ 33 años cotizados (despido, ERTE...)
 */

import {
  COEFICIENTES_ANTICIPADA_INVOLUNTARIA_2025,
  COEFICIENTES_ANTICIPADA_VOLUNTARIA_2025,
  REQUISITOS_ANTICIPADA_INVOLUNTARIA,
  REQUISITOS_ANTICIPADA_VOLUNTARIA,
  EDAD_JUBILACION_2025,
  FISCAL_PENSIONES_META,
  getCoeficienteAnticipada,
} from '@/data/fiscal';

// ─── Tipos públicos ────────────────────────────────────────────────────────────

export type TipoJubilacionAnticipada = 'voluntaria' | 'involuntaria';

export interface ParametrosJubilacionAnticipada {
  /** Años cotizados a la Seguridad Social */
  anosCotizados: number;
  /** Meses de anticipación respecto a la edad ordinaria de jubilación */
  mesesAnticipacion: number;
  /** Modalidad: voluntaria (a iniciativa propia) o involuntaria (despido, ERTE...) */
  tipo: TipoJubilacionAnticipada;
  /** Pensión ordinaria estimada (€/mes) que percibirías a la edad ordinaria */
  pensionOrdinaria: number;
}

export interface ResultadoJubilacionAnticipada {
  /** Si la jubilación anticipada es posible con los datos indicados */
  posible: boolean;
  /** Motivo por el que no es posible (si posible = false) */
  motivoImpedimento: string;
  /** Si cumple los años mínimos de cotización */
  cumpleCotizacion: boolean;
  /** Años mínimos de cotización requeridos */
  anosMinimosRequeridos: number;
  /** Trimestres de anticipación (cada trimestre tiene su coeficiente) */
  trimestreAnticipacion: number;
  /** Reducción total aplicada sobre la pensión (%) */
  reduccionTotal: number;
  /** Pensión resultante tras la reducción (€/mes) */
  pensionConReduccion: number;
  /** Pérdida mensual respecto a la pensión ordinaria (€/mes) */
  perdidaMensual: number;
  /** Pérdida anual (14 pagas) */
  perdidaAnual: number;
  /** Máximo de meses de anticipación permitidos */
  maxMesesPermitidos: number;
  /** Edad ordinaria de jubilación según años cotizados */
  edadOrdinaria: string;
  /** Desglose de coeficientes por trimestre */
  desglosePorTrimestre: Array<{ trimestre: number; reduccion: number }>;
  /** Fuente normativa */
  fuenteDatos: string;
}

// ─── Función principal ─────────────────────────────────────────────────────────

export function calcularJubilacionAnticipada(p: ParametrosJubilacionAnticipada): ResultadoJubilacionAnticipada {
  if (p.anosCotizados < 0 || p.anosCotizados > 50) throw new Error('Los años cotizados deben estar entre 0 y 50.');
  if (p.mesesAnticipacion <= 0 || p.mesesAnticipacion > 48) throw new Error('Los meses de anticipación deben estar entre 1 y 48.');
  if (p.pensionOrdinaria <= 0) throw new Error('La pensión ordinaria debe ser mayor que cero.');

  const r = (n: number) => Math.round(n * 100) / 100;

  const requisitos = p.tipo === 'voluntaria'
    ? REQUISITOS_ANTICIPADA_VOLUNTARIA
    : REQUISITOS_ANTICIPADA_INVOLUNTARIA;

  const coeficientes = p.tipo === 'voluntaria'
    ? COEFICIENTES_ANTICIPADA_VOLUNTARIA_2025
    : COEFICIENTES_ANTICIPADA_INVOLUNTARIA_2025;

  const cumpleCotizacion = p.anosCotizados >= requisitos.anosMinimoCotizados;
  const superaMaximo = p.mesesAnticipacion > requisitos.maxMesesAnticipacion;

  // Edad ordinaria según cotización
  const tieneDerechoA65 = p.anosCotizados * 12 >= EDAD_JUBILACION_2025.mesesCotizadosParaJubilacion65;
  const edadOrdinaria = tieneDerechoA65 ? '65 años' : '66 años y 6 meses';

  let motivoImpedimento = '';
  if (!cumpleCotizacion) {
    motivoImpedimento = `Se necesitan ${requisitos.anosMinimoCotizados} años cotizados para la modalidad ${p.tipo}. Tienes ${p.anosCotizados} años.`;
  } else if (superaMaximo) {
    motivoImpedimento = `La jubilación ${p.tipo} permite un máximo de ${requisitos.maxMesesAnticipacion / 12} años de anticipación (${requisitos.maxMesesAnticipacion} meses). Estás solicitando ${p.mesesAnticipacion} meses.`;
  }

  const posible = cumpleCotizacion && !superaMaximo;
  const mesesReales = Math.min(p.mesesAnticipacion, requisitos.maxMesesAnticipacion);
  const trimestreAnticipacion = Math.ceil(mesesReales / 3);

  // El coeficiente reductor por trimestre depende de los años cotizados (RDL 2/2023)
  // y se aplica de forma plana a todos los trimestres anticipados.
  const desglosePorTrimestre: Array<{ trimestre: number; reduccion: number }> = [];
  let reduccionTotal = 0;

  if (posible) {
    const coeficientePorTrimestre = getCoeficienteAnticipada(p.anosCotizados, coeficientes);
    for (let t = 1; t <= trimestreAnticipacion; t++) {
      desglosePorTrimestre.push({ trimestre: t, reduccion: coeficientePorTrimestre });
    }
    reduccionTotal = coeficientePorTrimestre * trimestreAnticipacion;
  }

  reduccionTotal = r(reduccionTotal);
  const pensionConReduccion = r(p.pensionOrdinaria * (1 - reduccionTotal / 100));
  const perdidaMensual = r(p.pensionOrdinaria - pensionConReduccion);
  const perdidaAnual = r(perdidaMensual * 14);

  return {
    posible,
    motivoImpedimento,
    cumpleCotizacion,
    anosMinimosRequeridos: requisitos.anosMinimoCotizados,
    trimestreAnticipacion,
    reduccionTotal,
    pensionConReduccion,
    perdidaMensual,
    perdidaAnual,
    maxMesesPermitidos: requisitos.maxMesesAnticipacion,
    edadOrdinaria,
    desglosePorTrimestre,
    fuenteDatos: `${FISCAL_PENSIONES_META.fuente} — verificado ${FISCAL_PENSIONES_META.verificado}`,
  };
}
