/**
 * Datos normativos: Visa Nómada Digital / Autorización de Residencia para Teletrabajo Internacional
 *
 * ⚠️ HERRAMIENTA DE ORIENTACIÓN — No constituye asesoramiento jurídico ni migratorio.
 * Los requisitos pueden variar según la normativa vigente. Consulta siempre un abogado
 * especializado y las fuentes oficiales antes de iniciar ningún trámite.
 *
 * Fuente: Ley 28/2022 de Fomento del Ecosistema de Empresas Emergentes (Ley de Startups)
 *         + Real Decreto 1008/2023 (Reglamento de desarrollo)
 * Verificado: 2026-03-18
 * URL oficial: https://www.inclusion.gob.es/web/migraciones/nomadas-digitales
 */

export const NOMADA_DIGITAL_META = {
  fuente: 'Ley 28/2022 de Startups + RD 1008/2023',
  descripcion: 'Visa Nómada Digital y Autorización de Residencia para Teletrabajo Internacional',
  verificado: '2026-03-18',
  vigencia: '2025-2026',
  urlOficial: 'https://www.inclusion.gob.es/web/migraciones/nomadas-digitales',
  nota: 'SMI de referencia: RD 145/2024 (1.323 €/mes). Pendiente nuevo RD para 2026.',
};

// SMI mensual de referencia (RD 145/2024 — 14 pagas, 15.876 €/año)
export const SMI_MENSUAL_NOMADA = 1323; // €/mes

// Ingresos mínimos requeridos
export const MINIMO_INGRESOS_TITULAR_NOMADA = SMI_MENSUAL_NOMADA * 2; // 200% SMI = 2.646 €/mes
export const MINIMO_INGRESOS_DEPENDIENTE_NOMADA = Math.round(SMI_MENSUAL_NOMADA * 0.75); // 75% SMI = 992 €/mes

// Duración de las autorizaciones
export const DURACION_VISADO_MESES = 12; // Visado nómada: 1 año
export const DURACION_AUTORIZACION_INICIAL_MESES = 36; // Autorización residencia: 3 años
export const DURACION_RENOVACION_MESES = 24; // Renovación: 2 años adicionales

// Antigüedad mínima con el empleador (solo empleados por cuenta ajena)
export const ANTIGUEDAD_MINIMA_EMPLEADO_MESES = 3;

// Porcentaje máximo de clientes en España para mantener el perfil "extranjero"
export const MAX_CLIENTES_ESPANA_PORCENTAJE = 20; // máximo 20% en España (empleados)
