/**
 * Datos normativos: Sistema Especial para Empleados de Hogar
 *
 * ⚠️ HERRAMIENTA DE ORIENTACIÓN — No constituye asesoramiento laboral.
 * Datos verificados a la fecha indicada. Los tipos de cotización se fijan
 * cada año en la Orden de cotización a la Seguridad Social.
 *
 * Fuente: Orden PJC/297/2026, de 30 de marzo, art. 15 (BOE-A-2026-7296)
 *         + RD 1620/2011 (relación laboral especial del servicio del hogar familiar)
 *         + RDL 16/2022 (equiparación de derechos: desempleo y FOGASA desde 01/10/2022)
 * Verificado: 2026-09-21
 * URL oficial: https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-7296
 *
 * POR QUÉ NACE ESTE MÓDULO (21/09/2026, hallazgos 1115 y 1116 del Inspector)
 * ─────────────────────────────────────────────────────────────────────────
 * `residencia-vs-cuidado-en-casa` daba al «cuidador interno» un importe plano de
 * 1.300-1.700 €/mes para cualquier jornada de 9 a 24 horas diarias. El mínimo queda
 * POR DEBAJO del propio SMI en cómputo mensual antes de cualquier cotización, y la app
 * coronaba esa opción como «Más económica». No había en `data/fiscal/` ningún dato con
 * el que calcular lo que de verdad le cuesta un empleado de hogar a quien lo contrata,
 * así que el número se había escrito a mano y nada podía contradecirlo.
 *
 * QUÉ CUBRE Y QUÉ NO
 * ──────────────────
 * Cubre el tipo de CONTINGENCIAS COMUNES, que es el que más pesa y el único que el art.
 * 15 de la Orden fija de forma cerrada para este sistema especial. NO cubre el tipo de
 * accidentes de trabajo (tarifa de primas), el de desempleo ni el de FOGASA, ni las
 * reducciones y bonificaciones de la aportación empresarial, que dependen de la fecha de
 * alta y de la situación del empleador. Por eso lo que se calcula con esto es un SUELO,
 * no el coste final: quien lo use debe decirlo así en pantalla.
 */

// ─── Metadatos del módulo ────────────────────────────────────────────────────

export const FISCAL_EMPLEADOS_HOGAR_META = {
  fuente: 'Orden PJC/297/2026, art. 15 (Sistema Especial para Empleados de Hogar) + RD 1620/2011',
  verificado: '2026-09-21',
  vigencia: '2026',
  urlOficial: 'https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-7296',
  nota: 'Tipo de contingencias comunes de 2026. No incluye accidentes de trabajo, desempleo, FOGASA ni las reducciones de la aportación empresarial: el coste calculado con este módulo es un suelo, no el importe final.',
};

// ─── Cotización 2026 ─────────────────────────────────────────────────────────

export const COTIZACION_EMPLEADOS_HOGAR_2026 = {
  /** Tipo total de contingencias comunes (%) */
  contingenciasComunes: 28.30,
  /** Parte del tipo total que paga el EMPLEADOR (%) */
  contingenciasComunesEmpleador: 23.60,
  /** Parte del tipo total que se descuenta al EMPLEADO (%) */
  contingenciasComunesEmpleado: 4.70,
};

/**
 * Jornada ordinaria máxima en cómputo mensual: 40 horas semanales (art. 34.1 ET, que el
 * RD 1620/2011 no excepciona) × 52 semanas ÷ 12 meses = 173,33 h/mes.
 *
 * Sirve para lo que ninguna cifra plana podía decir: a partir de cuántas horas de
 * cuidado al día una sola persona ya no puede cubrirlas legalmente.
 */
export const HORAS_JORNADA_COMPLETA_MES = (40 * 52) / 12;

/**
 * Coste mensual MÍNIMO para el empleador de contratar `horasMes` horas de servicio del
 * hogar: el salario mínimo por hora del régimen externo más la cotización a su cargo.
 *
 * Devuelve un suelo legal, no un precio de mercado: en la práctica se paga por encima, y
 * además faltan AT/EP, desempleo y FOGASA (ver la cabecera del módulo).
 */
export function costeMinimoEmpleadorHogar(horasMes: number, smiHogarHora: number): number {
  const salario = horasMes * smiHogarHora;
  return salario * (1 + COTIZACION_EMPLEADOS_HOGAR_2026.contingenciasComunesEmpleador / 100);
}

/** Cuántas personas hacen falta para cubrir `horasMes` sin pasar de la jornada ordinaria. */
export function personasParaCubrir(horasMes: number): number {
  return Math.max(1, Math.ceil(horasMes / HORAS_JORNADA_COMPLETA_MES));
}
