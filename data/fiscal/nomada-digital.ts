/**
 * Datos normativos: Visa Nómada Digital / Autorización de Residencia para Teletrabajo Internacional
 *
 * ⚠️ HERRAMIENTA DE ORIENTACIÓN — No constituye asesoramiento jurídico ni migratorio.
 * Los requisitos pueden variar según la normativa vigente. Consulta siempre un abogado
 * especializado y las fuentes oficiales antes de iniciar ningún trámite.
 *
 * Fuente: Ley 28/2022 de Fomento del Ecosistema de Empresas Emergentes (Ley de Startups)
 *         + Real Decreto 1008/2023 (Reglamento de desarrollo)
 * Verificado: 2026-06-11
 * URL oficial: https://www.inclusion.gob.es/web/migraciones/nomadas-digitales
 */

import { SMI_2026 } from './smi';

export const NOMADA_DIGITAL_META = {
  fuente: 'Ley 28/2022 de Startups + RD 1008/2023',
  descripcion: 'Visa Nómada Digital y Autorización de Residencia para Teletrabajo Internacional',
  verificado: '2026-06-11',
  vigencia: '2026',
  urlOficial: 'https://www.inclusion.gob.es/web/migraciones/nomadas-digitales',
  nota: 'SMI de referencia: RD 126/2026 (1.221 €/mes, 14 pagas) — ver data/fiscal/smi.ts',
};

// SMI mensual de referencia (RD 126/2026 — 14 pagas, 17.094 €/año)
export const SMI_MENSUAL_NOMADA = SMI_2026.mensual14; // 1.221 €/mes

// Ingresos mínimos requeridos
export const MINIMO_INGRESOS_TITULAR_NOMADA = SMI_MENSUAL_NOMADA * 2; // 200% SMI = 2.442 €/mes
export const MINIMO_INGRESOS_DEPENDIENTE_NOMADA = Math.round(SMI_MENSUAL_NOMADA * 0.75); // 75% SMI = 916 €/mes

// Duración de las autorizaciones
export const DURACION_VISADO_MESES = 12; // Visado nómada: 1 año
export const DURACION_AUTORIZACION_INICIAL_MESES = 36; // Autorización residencia: 3 años
export const DURACION_RENOVACION_MESES = 24; // Renovación: 2 años adicionales

// Antigüedad mínima con el empleador (solo empleados por cuenta ajena)
export const ANTIGUEDAD_MINIMA_EMPLEADO_MESES = 3;

// Porcentaje máximo de clientes en España para mantener el perfil "extranjero"
export const MAX_CLIENTES_ESPANA_PORCENTAJE = 20; // máximo 20% en España (empleados)
