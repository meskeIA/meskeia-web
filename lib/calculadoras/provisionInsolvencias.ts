/**
 * Calculadora de Provisión por Insolvencias (Créditos de Dudoso Cobro) — lógica pura
 * Usada por: MCP server (calcular_provision_insolvencias)
 *
 * Calcula la deducibilidad en el Impuesto sobre Sociedades de las provisiones
 * por deterioro de créditos incobrables (insolvencias) según el LIS art. 13.
 *
 * Marco normativo:
 *   - LIS art. 13 (Ley 27/2014, modificado): deterioro de créditos
 *   - RIS arts. 7-8 (RD 634/2015): desarrollo reglamentario
 *
 * CONDICIONES PARA LA DEDUCIBILIDAD (LIS art. 13.1):
 *   Las pérdidas por deterioro de créditos SON deducibles cuando:
 *   a) Han transcurrido 6 MESES desde el vencimiento de la obligación, O
 *   b) El deudor está declarado en CONCURSO DE ACREEDORES (auto judicial), O
 *   c) El deudor está PROCESADO por el delito de alzamiento de bienes, O
 *   d) Las obligaciones han sido RECLAMADAS JUDICIALMENTE o son objeto de
 *      litigio judicial o procedimiento arbitral de cuya resolución dependa
 *      el cobro.
 *
 * CRÉDITOS NO DEDUCIBLES (LIS art. 13.2):
 *   NO son deducibles las provisiones por:
 *   a) Créditos adeudados por personas o entidades VINCULADAS (salvo en concurso)
 *   b) Créditos garantizados por entidades de crédito, entidades de seguros,
 *      o con garantía real, aval o pacto de recompra
 *   c) Créditos adeudados por entes PÚBLICOS
 *   d) Créditos cuyo vencimiento no ha llegado (antes de los 6 meses)
 *
 * PYMES (LIS art. 13.1 párrafo 2.º — estimación global):
 *   Las entidades de reducida dimensión (ERD, cifra negocios <10 M€) pueden
 *   deducir una dotación global del 1% del saldo de deudores existentes al
 *   cierre del período, sobre el saldo de deudores que no hayan sido
 *   individualmente dotados ni excluidos.
 *
 * Fuente: LIS art. 13 + RIS arts. 7-8 — vigente 2025
 * Verificado: 2025-01-15
 *
 * Encadenable con: calcular_impuesto_sociedades, calcular_interes_demora
 */

// ─── Constantes ────────────────────────────────────────────────────────────

const MESES_PLAZO_DEDUCCION = 6;      // meses desde el vencimiento para deducir
const PCT_DOTACION_GLOBAL_PYME = 1;   // % estimación global PYME (ERD)
const UMBRAL_ERD = 10_000_000;        // € cifra negocios para ser ERD (empresa reducida dimensión)

// ─── Tipos públicos ────────────────────────────────────────────────────────

export type CausaDeducibilidadInsolvencia =
  | 'plazo_6_meses'         // ≥ 6 meses desde vencimiento
  | 'concurso_acreedores'   // Auto de concurso declarado
  | 'reclamacion_judicial'  // Deuda en litigio/arbitraje
  | 'alzamiento_bienes';    // Deudor procesado

export interface CreditoInsolvencia {
  /** Descripción del crédito (referencia cliente/factura) */
  descripcion?: string;
  /** Importe del crédito pendiente de cobro (€) */
  importe: number;
  /** Causa que permite la deducibilidad */
  causaDeducibilidad: CausaDeducibilidadInsolvencia;
  /**
   * ¿El crédito está excluido de deducción?
   * Marcar true si: vinculada, garantizado por banco/seguro, o ente público.
   */
  excluido?: boolean;
  /** Motivo de la exclusión (opcional, para el informe) */
  motivoExclusion?: string;
}

export interface ParametrosProvisionInsolvencias {
  /** Lista de créditos con dudoso cobro */
  creditos: CreditoInsolvencia[];
  /** Tipo IS de la empresa (%) — para calcular el ahorro fiscal */
  tipoIS?: number;
  /** ¿Es una empresa de reducida dimensión (ERD)? Cifra negocios < 10 M€ */
  esERD?: boolean;
  /**
   * Saldo total de deudores al cierre (€) — para la estimación global PYME.
   * Solo necesario si esERD = true.
   */
  saldoTotalDeudoresCierre?: number;
}

export interface DetalleCredito {
  descripcion: string;
  importe: number;
  causaDeducibilidad: CausaDeducibilidadInsolvencia;
  deducible: boolean;
  motivoExclusion?: string;
}

export interface ResultadoProvisionInsolvencias {
  /** Desglose de créditos */
  detalleCreditos: DetalleCredito[];
  /** Total importe analizado (€) */
  totalAnalizado: number;
  /** **Total provisión deducible en IS (€)** — dotación individual */
  totalDeducibleIndividual: number;
  /** Total excluido de deducción (€) */
  totalExcluido: number;
  /** ¿Es ERD? */
  esERD: boolean;
  /** Dotación global adicional por ERD (1% del saldo de deudores no dotados) (€) */
  dotacionGlobalERD: number;
  /** **Total deducible incluyendo dotación global ERD (€)** */
  totalDeducibleConGlobal: number;
  /** Ahorro fiscal IS (€) */
  ahorroFiscalIS: number;
  /** Advertencias */
  advertencias: string[];
  /** Fuente normativa */
  fuenteDatos: string;
}

// ─── Función principal ─────────────────────────────────────────────────────

export function calcularProvisionInsolvencias(
  p: ParametrosProvisionInsolvencias
): ResultadoProvisionInsolvencias {
  if (!p.creditos || p.creditos.length === 0) throw new Error('Debe indicar al menos un crédito.');

  const r = (n: number) => Math.round(n * 100) / 100;
  const advertencias: string[] = [];
  const tipoIS = p.tipoIS ?? 25;
  const esERD = p.esERD ?? false;

  // ── Análisis individual de créditos ───────────────────────────────────────
  const detalleCreditos: DetalleCredito[] = [];
  let totalDeducibleIndividual = 0;
  let totalExcluido = 0;

  for (const credito of p.creditos) {
    const descripcion = credito.descripcion ?? `Crédito ${credito.importe.toLocaleString('es-ES')} €`;
    const excluido = credito.excluido ?? false;

    detalleCreditos.push({
      descripcion,
      importe: credito.importe,
      causaDeducibilidad: credito.causaDeducibilidad,
      deducible: !excluido,
      motivoExclusion: credito.motivoExclusion,
    });

    if (!excluido) {
      totalDeducibleIndividual += credito.importe;
    } else {
      totalExcluido += credito.importe;
    }
  }
  totalDeducibleIndividual = r(totalDeducibleIndividual);
  totalExcluido = r(totalExcluido);
  const totalAnalizado = r(totalDeducibleIndividual + totalExcluido);

  // ── Dotación global ERD ───────────────────────────────────────────────────
  let dotacionGlobalERD = 0;
  if (esERD && p.saldoTotalDeudoresCierre) {
    // Base de la dotación global = saldo total de deudores MENOS los ya dotados individualmente
    const baseGlobal = r(Math.max(0, p.saldoTotalDeudoresCierre - totalDeducibleIndividual - totalExcluido));
    dotacionGlobalERD = r(baseGlobal * PCT_DOTACION_GLOBAL_PYME / 100);
  }

  const totalDeducibleConGlobal = r(totalDeducibleIndividual + dotacionGlobalERD);
  const ahorroFiscalIS = r(totalDeducibleConGlobal * tipoIS / 100);

  // ── Advertencias ──────────────────────────────────────────────────────────
  advertencias.push(`Plazo de 6 meses: los créditos son deducibles cuando han transcurrido ≥${MESES_PLAZO_DEDUCCION} meses desde el vencimiento de la obligación de pago (no desde la fecha de la factura). El día de cómputo es la fecha del vencimiento pactado en la factura o contrato.`);
  advertencias.push('Los créditos dotados individualmente son DEDUCIBLES en el ejercicio en que se cumplen los requisitos. Si posteriormente se cobra el crédito, el ingreso es imponible en ese ejercicio (reversión de la provisión).');
  advertencias.push('Créditos EXCLUIDOS de deducción (LIS art. 13.2): (1) adeudados por entidades vinculadas (excepto en concurso), (2) garantizados por banco o seguro de crédito, (3) adeudados por entes públicos, (4) no vencidos. Verifique que sus créditos no incurren en ninguna de estas exclusiones.');
  if (esERD) {
    advertencias.push(`Empresa de Reducida Dimensión (ERD, cifra negocios < ${UMBRAL_ERD.toLocaleString('es-ES')} €): puede aplicar adicionalmente la dotación global del ${PCT_DOTACION_GLOBAL_PYME}% sobre el saldo de deudores no dotados individualmente ni excluidos al cierre del período.`);
  }
  if (totalExcluido > 0) {
    advertencias.push(`Se han identificado ${r(totalExcluido).toLocaleString('es-ES')} € en créditos EXCLUIDOS de deducción. Verifique que la exclusión es correcta antes de incluir el importe en la base imponible.`);
  }

  return {
    detalleCreditos,
    totalAnalizado,
    totalDeducibleIndividual,
    totalExcluido,
    esERD,
    dotacionGlobalERD,
    totalDeducibleConGlobal,
    ahorroFiscalIS,
    advertencias,
    fuenteDatos: 'LIS art. 13 + RIS arts. 7-8 (RD 634/2015) — vigente 2025',
  };
}
