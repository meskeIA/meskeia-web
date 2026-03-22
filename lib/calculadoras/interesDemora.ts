/**
 * Calculadora de Intereses de Demora — lógica pura sin React ni DOM
 * Usada por: MCP server (calcular_interes_demora)
 *
 * Cubre tres tipos:
 *   - Comercial (Ley 3/2004): facturas entre empresas/autónomos
 *   - Legal (art. 1108 CC): deudas civiles sin pacto de interés
 *   - Tributario (LGT art. 26): liquidaciones con la AEAT
 *
 * Fuente: data/fiscal/intereses.ts
 */

import {
  TIPOS_DEMORA_COMERCIAL,
  INTERES_LEGAL_DINERO_2025,
  INTERES_DEMORA_TRIBUTARIO_2025,
  PLAZOS_RECLAMACION_COMERCIAL,
  getTipoDemoraComercialParaFecha,
  FISCAL_INTERESES_META,
} from '@/data/fiscal';

// ─── Tipos públicos ────────────────────────────────────────────────────────────

export type TipoInteres = 'comercial' | 'legal' | 'tributario';

export interface ParametrosInteresDemora {
  /** Importe de la deuda en euros */
  importeDeuda: number;
  /** Fecha de inicio del devengo (ISO 8601: 'YYYY-MM-DD') */
  fechaInicio: string;
  /** Fecha de fin del cálculo (ISO 8601: 'YYYY-MM-DD') */
  fechaFin: string;
  /**
   * Tipo de interés a aplicar:
   *   'comercial'  — Ley 3/2004, facturas entre empresas o con Administración
   *   'legal'      — art. 1108 CC, deudas civiles sin pacto expreso
   *   'tributario' — LGT art. 26, liquidaciones AEAT
   */
  tipoInteres: TipoInteres;
}

export interface PeriodoDesglose {
  /** Semestre o período descriptivo */
  periodo: string;
  /** Tipo aplicado en este período (%) */
  tipoAnual: number;
  /** Días de este período incluidos en el cálculo */
  dias: number;
  /** Intereses generados en este período */
  intereses: number;
}

export interface ResultadoInteresDemora {
  /** Importe de la deuda original */
  importeDeuda: number;
  /** Días totales del período */
  diasTotales: number;
  /** Tipo de interés aplicado (%) — si es único */
  tipoAnual: number;
  /** Total de intereses generados */
  totalIntereses: number;
  /** Importe deuda + intereses */
  importeTotal: number;
  /** Tipo de interés aplicado ('comercial' | 'legal' | 'tributario') */
  tipoInteres: TipoInteres;
  /** Descripción del tipo de interés y su base legal */
  descripcionTipo: string;
  /** Desglose por períodos (útil en comercial multi-semestre) */
  desglose: PeriodoDesglose[];
  /** Nota de advertencia legal */
  nota: string;
  /** Fuente y fecha de verificación de los datos */
  fuenteDatos: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseDate(iso: string): Date {
  const d = new Date(iso + 'T00:00:00Z');
  if (isNaN(d.getTime())) throw new Error(`Fecha inválida: "${iso}". Formato esperado: YYYY-MM-DD`);
  return d;
}

function diasEntre(inicio: Date, fin: Date): number {
  return Math.round((fin.getTime() - inicio.getTime()) / 86400000);
}

function interesesPorDias(importe: number, tipoAnual: number, dias: number): number {
  return importe * (tipoAnual / 100) * (dias / 365);
}

// ─── Función principal ─────────────────────────────────────────────────────────

export function calcularInteresDemora(p: ParametrosInteresDemora): ResultadoInteresDemora {
  if (p.importeDeuda <= 0) throw new Error('El importe de la deuda debe ser mayor que cero.');

  const inicio = parseDate(p.fechaInicio);
  const fin = parseDate(p.fechaFin);

  if (fin <= inicio) throw new Error('La fecha de fin debe ser posterior a la fecha de inicio.');

  const diasTotales = diasEntre(inicio, fin);
  const r = (n: number) => Math.round(n * 100) / 100;

  if (p.tipoInteres === 'legal') {
    const tipo = INTERES_LEGAL_DINERO_2025.tipo;
    const intereses = interesesPorDias(p.importeDeuda, tipo, diasTotales);
    return {
      importeDeuda:    r(p.importeDeuda),
      diasTotales,
      tipoAnual:       tipo,
      totalIntereses:  r(intereses),
      importeTotal:    r(p.importeDeuda + intereses),
      tipoInteres:     'legal',
      descripcionTipo: `Interés legal del dinero ${tipo}% (art. 1108 CC) — ${INTERES_LEGAL_DINERO_2025.base}`,
      desglose: [{
        periodo:  `${p.fechaInicio} → ${p.fechaFin}`,
        tipoAnual: tipo,
        dias:      diasTotales,
        intereses: r(intereses),
      }],
      nota:        INTERES_LEGAL_DINERO_2025.nota,
      fuenteDatos: `${FISCAL_INTERESES_META.fuente} — verificado ${FISCAL_INTERESES_META.verificado}`,
    };
  }

  if (p.tipoInteres === 'tributario') {
    const tipo = INTERES_DEMORA_TRIBUTARIO_2025.tipo;
    const intereses = interesesPorDias(p.importeDeuda, tipo, diasTotales);
    return {
      importeDeuda:    r(p.importeDeuda),
      diasTotales,
      tipoAnual:       tipo,
      totalIntereses:  r(intereses),
      importeTotal:    r(p.importeDeuda + intereses),
      tipoInteres:     'tributario',
      descripcionTipo: `Interés de demora tributario ${tipo}% (LGT art. 26) — ${INTERES_DEMORA_TRIBUTARIO_2025.base}`,
      desglose: [{
        periodo:  `${p.fechaInicio} → ${p.fechaFin}`,
        tipoAnual: tipo,
        dias:      diasTotales,
        intereses: r(intereses),
      }],
      nota:        INTERES_DEMORA_TRIBUTARIO_2025.nota,
      fuenteDatos: `${FISCAL_INTERESES_META.fuente} — verificado ${FISCAL_INTERESES_META.verificado}`,
    };
  }

  // ── Comercial (Ley 3/2004): puede abarcar varios semestres ────────────────
  const desglose: PeriodoDesglose[] = [];
  let totalIntereses = 0;
  let cursor = new Date(inicio);

  // Iteramos por semestres mientras cursor < fin
  while (cursor < fin) {
    const tramo = getTipoDemoraComercialParaFecha(cursor);
    const tramoFin = new Date(tramo.vigenciaHasta + 'T23:59:59Z');
    const corte = tramoFin < fin ? new Date(tramoFin.getTime() + 1) : fin;
    const dias = diasEntre(cursor, corte);
    const intereses = interesesPorDias(p.importeDeuda, tramo.tipoTotal, dias);

    desglose.push({
      periodo:  tramo.semestre,
      tipoAnual: tramo.tipoTotal,
      dias,
      intereses: r(intereses),
    });
    totalIntereses += intereses;
    cursor = corte;
  }

  // Tipo "representativo" = el del período de inicio
  const tipoRepresentativo = getTipoDemoraComercialParaFecha(inicio).tipoTotal;

  return {
    importeDeuda:    r(p.importeDeuda),
    diasTotales,
    tipoAnual:       tipoRepresentativo,
    totalIntereses:  r(totalIntereses),
    importeTotal:    r(p.importeDeuda + totalIntereses),
    tipoInteres:     'comercial',
    descripcionTipo: `Interés de demora comercial (Ley 3/2004) — tipo BCE + 8 pp. Plazo máximo de pago: ${PLAZOS_RECLAMACION_COMERCIAL.plazoFactura} días.`,
    desglose,
    nota:        FISCAL_INTERESES_META.nota,
    fuenteDatos: `${FISCAL_INTERESES_META.fuente} — verificado ${FISCAL_INTERESES_META.verificado}`,
  };
}

/** Devuelve los tipos de demora comercial más recientes (útil como referencia) */
export function obtenerTiposVigentes() {
  return {
    comercialActual: TIPOS_DEMORA_COMERCIAL[0],
    legal:           INTERES_LEGAL_DINERO_2025,
    tributario:      INTERES_DEMORA_TRIBUTARIO_2025,
    plazosComercial: PLAZOS_RECLAMACION_COMERCIAL,
  };
}
