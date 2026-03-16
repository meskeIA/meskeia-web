/**
 * Datos fiscales: Intereses de Demora
 *
 * ⚠️ HERRAMIENTA DE ORIENTACIÓN — No constituye asesoramiento jurídico.
 * Datos verificados a la fecha indicada. Actualizar cuando el BCE modifique
 * su tipo de referencia o cuando se aprueben nuevos Presupuestos Generales.
 *
 * Fuentes:
 *   - Interés comercial: Ley 3/2004, de 29 de diciembre (morosidad comercial)
 *   - Interés legal:     Ley de Presupuestos Generales del Estado (art. correspondiente)
 *   - Tipos BCE:         https://www.ecb.europa.eu/stats/policy_and_exchange_rates
 *   - BOE publicación:   https://www.boe.es
 *
 * Verificado: 2026-03-16
 * Vigencia: 2026 (H1 y H2 con tipos BCE vigentes)
 *
 * ⚠️ ACTUALIZACIÓN NECESARIA:
 *   - Los tipos comerciales se publican cada 6 meses en el BOE (enero y julio).
 *   - El interés legal se fija cada año en la Ley de Presupuestos.
 *   - Si España no aprueba PGE, se prorroga el del ejercicio anterior.
 */

export const FISCAL_INTERESES_META = {
  fuente: 'Ley 3/2004 (morosidad) + Ley de Presupuestos (interés legal)',
  verificado: '2026-03-16',
  vigencia: '2026',
  urlOficialLey3: 'https://www.boe.es/buscar/act.php?id=BOE-A-2004-21830',
  urlOficialBCE: 'https://www.ecb.europa.eu/stats/policy_and_exchange_rates',
  nota: 'Los tipos comerciales se actualizan semestralmente. Verifica siempre el BOE antes de usar estas cifras en una reclamación real.',
};

// ─── Interés Legal del Dinero (art. 1108 Código Civil) ────────────────────────
// Fijado anualmente por la Ley de Presupuestos Generales del Estado.
// Sin PGE aprobado, se prorroga el del ejercicio anterior.

export const INTERES_LEGAL_DINERO_2025 = {
  tipo: 3.25,            // % anual
  vigencia: '2026',
  base: 'Prórroga PGE 2023 (no aprobados PGE 2024/2025/2026)',
  nota: 'Aplicable a deudas civiles y mercantiles sin pacto expreso (art. 1108 CC). Verificar si hay PGE aprobado para el año en curso.',
};

// ─── Interés de Demora Comercial (Ley 3/2004) ─────────────────────────────────
// = Tipo de referencia BCE + 8 puntos porcentuales
// Se publica dos veces al año en el BOE (en torno a enero y julio).

export interface TipoDemoraComercial {
  semestre: string;       // 'H1 2025', 'H2 2024', etc.
  tipoBCE: number;        // % — Tipo de referencia BCE
  incremento: number;     // % — Incremento fijo (8 pp por Ley 3/2004)
  tipoTotal: number;      // % — tipoBCE + incremento
  vigenciaDesde: string;  // ISO date
  vigenciaHasta: string;  // ISO date
}

/**
 * Tipos de demora comercial publicados por el BCE + BOE
 *
 * ⚠️ Para añadir un nuevo semestre: añadir al principio del array
 * y actualizar 'vigenciaHasta' del semestre anterior si es necesario.
 */
export const TIPOS_DEMORA_COMERCIAL: TipoDemoraComercial[] = [
  {
    semestre: 'H1 2026',
    tipoBCE: 2.15,
    incremento: 8,
    tipoTotal: 10.15,
    vigenciaDesde: '2026-01-01',
    vigenciaHasta: '2026-06-30',
  },
  {
    semestre: 'H2 2025',
    tipoBCE: 2.15,
    incremento: 8,
    tipoTotal: 10.15,
    vigenciaDesde: '2025-07-01',
    vigenciaHasta: '2025-12-31',
  },
  {
    semestre: 'H1 2025',
    tipoBCE: 3.15,
    incremento: 8,
    tipoTotal: 11.15,
    vigenciaDesde: '2025-01-01',
    vigenciaHasta: '2025-06-30',
  },
  {
    semestre: 'H2 2024',
    tipoBCE: 3.65,
    incremento: 8,
    tipoTotal: 11.65,
    vigenciaDesde: '2024-07-01',
    vigenciaHasta: '2024-12-31',
  },
  {
    semestre: 'H1 2024',
    tipoBCE: 4.50,
    incremento: 8,
    tipoTotal: 12.50,
    vigenciaDesde: '2024-01-01',
    vigenciaHasta: '2024-06-30',
  },
  {
    semestre: 'H2 2023',
    tipoBCE: 4.00,
    incremento: 8,
    tipoTotal: 12.00,
    vigenciaDesde: '2023-07-01',
    vigenciaHasta: '2023-12-31',
  },
  {
    semestre: 'H1 2023',
    tipoBCE: 2.50,
    incremento: 8,
    tipoTotal: 10.50,
    vigenciaDesde: '2023-01-01',
    vigenciaHasta: '2023-06-30',
  },
];

/**
 * Obtiene el tipo de demora comercial vigente para una fecha dada.
 * Si la fecha es posterior a todos los registros, usa el más reciente.
 */
export function getTipoDemoraComercialParaFecha(fecha: Date): TipoDemoraComercial {
  const fechaStr = fecha.toISOString().substring(0, 10);
  const encontrado = TIPOS_DEMORA_COMERCIAL.find(
    t => fechaStr >= t.vigenciaDesde && fechaStr <= t.vigenciaHasta
  );
  return encontrado ?? TIPOS_DEMORA_COMERCIAL[0]; // El más reciente si no hay coincidencia
}

// ─── Plazos legales de reclamación (Ley 3/2004) ───────────────────────────────

export const PLAZOS_RECLAMACION_COMERCIAL = {
  prescripcionDeuda: 3,     // años — Plazo general de prescripción de créditos (art. 1967 CC)
  plazoFactura: 30,         // días — Plazo máximo de pago en operaciones comerciales (art. 4 Ley 3/2004)
  plazoAdmPublicas: 30,     // días — Plazo máximo para Administraciones Públicas
  nota: 'El devengo de intereses es automático desde el día siguiente al vencimiento, sin necesidad de aviso al deudor.',
};

// ─── Interés de demora tributario (AEAT) ──────────────────────────────────────
// Distinto del interés de demora comercial. Solo relevante frente a Hacienda.

export const INTERES_DEMORA_TRIBUTARIO_2025 = {
  tipo: 4.0625,    // % anual — LGT art. 26 (interés legal + 25%)
  base: '3.25% (interés legal) + 25% = 4.0625%',
  nota: 'Aplicable en liquidaciones de AEAT, aplazamientos y fraccionamientos. NO es el interés para reclamar facturas impagadas.',
};
