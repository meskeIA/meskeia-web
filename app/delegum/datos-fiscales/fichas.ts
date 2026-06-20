/**
 * Fuente única de las fichas de Datos Fiscales de Delegum.
 *
 * Centraliza el registro (slug, icono, título, descripción, fecha de verificación
 * desde el META correspondiente) y el mapa de fichas relacionadas. Lo consumen:
 *  - el índice `datos-fiscales/page.tsx` (rejilla de tarjetas)
 *  - el componente `FichasRelacionadas.tsx` (enlazado interno en cada ficha)
 *
 * Mantener aquí cualquier ficha nueva en lugar de duplicar títulos.
 */
import {
  FISCAL_IRPF_META,
  FISCAL_IVA_META,
  FISCAL_SMI_META,
  FISCAL_AUTONOMOS_META,
  FISCAL_INMUEBLES_META,
  FISCAL_INTERESES_META,
  FISCAL_SUCESIONES_META,
  FISCAL_DONACIONES_META,
  FISCAL_PATRIMONIO_META,
  FISCAL_AMORTIZACION_META,
  FISCAL_SOCIEDADES_META,
  FISCAL_IPREM_META,
  FISCAL_PENSIONES_META,
  FISCAL_MATERNIDAD_META,
  PLUSVALIA_MUNICIPAL_META,
  FISCAL_DEPENDENCIA_META,
  FISCAL_CALENDARIO_META,
} from '@/data/fiscal';

export interface Ficha {
  slug: string;
  icon: string;
  titulo: string;
  desc: string;
  verificado: string;
  /** Slugs de fichas del mismo clúster temático (enlazado interno). */
  relacionadas: string[];
}

export const FICHAS: Ficha[] = [
  {
    slug: 'irpf-tramos-minimos',
    icon: '🧾',
    titulo: 'Tramos y mínimos del IRPF',
    desc: 'Escala general por tramos, escala del ahorro y mínimos personales y familiares del IRPF 2025.',
    verificado: FISCAL_IRPF_META.verificado,
    relacionadas: ['iva-tipos', 'cuota-autonomos-reta', 'smi-salario-minimo'],
  },
  {
    slug: 'iva-tipos',
    icon: '🛒',
    titulo: 'Tipos de IVA en España',
    desc: 'General (21%), reducido (10%) y superreducido (4%) con ejemplos, exenciones y recargo de equivalencia.',
    verificado: FISCAL_IVA_META.verificado,
    relacionadas: ['irpf-tramos-minimos', 'cuota-autonomos-reta', 'impuesto-sociedades', 'calendario-fiscal'],
  },
  {
    slug: 'smi-salario-minimo',
    icon: '💶',
    titulo: 'Salario Mínimo Interprofesional (SMI)',
    desc: 'Cuantías del SMI 2026 (mensual, anual, diario y por hora) y comparativa con 2025.',
    verificado: FISCAL_SMI_META.verificado,
    relacionadas: ['iprem', 'irpf-tramos-minimos', 'cuota-autonomos-reta'],
  },
  {
    slug: 'cuota-autonomos-reta',
    icon: '💼',
    titulo: 'Cuota de autónomos (RETA)',
    desc: 'Tabla de cotización por ingresos reales 2026: tramos, base mínima y cuota mensual, más tarifa plana.',
    verificado: FISCAL_AUTONOMOS_META.verificado,
    relacionadas: ['impuesto-sociedades', 'irpf-tramos-minimos', 'iva-tipos', 'calendario-fiscal'],
  },
  {
    slug: 'itp-ccaa',
    icon: '🏠',
    titulo: 'Tipos de ITP por comunidad autónoma',
    desc: 'Impuesto de Transmisiones Patrimoniales en la compra de vivienda usada, con tipos generales y reducidos por CCAA.',
    verificado: FISCAL_INMUEBLES_META.verificado,
    relacionadas: ['plusvalia-municipal', 'sucesiones-isd', 'impuesto-patrimonio'],
  },
  {
    slug: 'interes-legal-demora',
    icon: '⚖️',
    titulo: 'Interés legal del dinero y de demora',
    desc: 'Interés legal, interés de demora comercial por semestre (Ley 3/2004) e interés de demora tributario.',
    verificado: FISCAL_INTERESES_META.verificado,
    relacionadas: ['irpf-tramos-minimos', 'iva-tipos', 'cuota-autonomos-reta'],
  },
  {
    slug: 'sucesiones-isd',
    icon: '🏛️',
    titulo: 'Impuesto de Sucesiones por comunidad autónoma',
    desc: 'Bonificaciones del ISD por CCAA, grupos de parentesco, tarifa estatal por tramos y reducciones aplicables.',
    verificado: FISCAL_SUCESIONES_META.verificado,
    relacionadas: ['donaciones-isd', 'impuesto-patrimonio', 'plusvalia-municipal'],
  },
  {
    slug: 'donaciones-isd',
    icon: '🎁',
    titulo: 'Impuesto de Donaciones por comunidad autónoma',
    desc: 'Bonificaciones del ISD en donaciones por CCAA, grupos de parentesco, tarifa estatal y requisito de escritura.',
    verificado: FISCAL_DONACIONES_META.verificado,
    relacionadas: ['sucesiones-isd', 'impuesto-patrimonio', 'plusvalia-municipal'],
  },
  {
    slug: 'impuesto-patrimonio',
    icon: '💎',
    titulo: 'Impuesto sobre el Patrimonio',
    desc: 'Mínimo exento, escala estatal, bonificaciones autonómicas y umbral del Impuesto de Grandes Fortunas (ITSGF).',
    verificado: FISCAL_PATRIMONIO_META.verificado,
    relacionadas: ['sucesiones-isd', 'donaciones-isd', 'itp-ccaa'],
  },
  {
    slug: 'amortizacion-inmovilizado',
    icon: '🏭',
    titulo: 'Coeficientes de amortización del inmovilizado',
    desc: 'Coeficientes de amortización lineal por tipo de activo (art. 12.1 LIS), período máximo y métodos degresivos.',
    verificado: FISCAL_AMORTIZACION_META.verificado,
    relacionadas: ['impuesto-sociedades', 'cuota-autonomos-reta', 'iva-tipos'],
  },
  {
    slug: 'impuesto-sociedades',
    icon: '🏢',
    titulo: 'Tipos del Impuesto de Sociedades',
    desc: 'Tipo general, nueva creación, escala de microempresas (Ley 7/2024), cooperativas y obligaciones (modelos 200 y 202).',
    verificado: FISCAL_SOCIEDADES_META.verificado,
    relacionadas: ['cuota-autonomos-reta', 'amortizacion-inmovilizado', 'iva-tipos', 'calendario-fiscal'],
  },
  {
    slug: 'iprem',
    icon: '📊',
    titulo: 'IPREM',
    desc: 'Cuantías del IPREM (diaria, mensual y anual con 12 y 14 pagas), usos en ayudas y diferencia con el SMI.',
    verificado: FISCAL_IPREM_META.verificado,
    relacionadas: ['smi-salario-minimo', 'prestaciones-dependencia', 'permiso-prestacion-nacimiento'],
  },
  {
    slug: 'pensiones-jubilacion',
    icon: '👴',
    titulo: 'Pensión de jubilación',
    desc: 'Edad de jubilación, años mínimos de cotización, porcentaje por años cotizados y pensión máxima y mínima 2026.',
    verificado: FISCAL_PENSIONES_META.verificado,
    relacionadas: ['smi-salario-minimo', 'iprem', 'irpf-tramos-minimos'],
  },
  {
    slug: 'permiso-prestacion-nacimiento',
    icon: '👶',
    titulo: 'Permiso y prestación por nacimiento',
    desc: 'Semanas de permiso (19/32, RDL 9/2025), prestación del 100%, requisitos de cotización y deducción por maternidad.',
    verificado: FISCAL_MATERNIDAD_META.verificado,
    relacionadas: ['prestaciones-dependencia', 'pensiones-jubilacion', 'iprem'],
  },
  {
    slug: 'plusvalia-municipal',
    icon: '🏘️',
    titulo: 'Plusvalía municipal (IIVTNU)',
    desc: 'Coeficientes por años de tenencia, quién la paga, tipo máximo legal y métodos de cálculo objetivo y real.',
    verificado: PLUSVALIA_MUNICIPAL_META.verificado,
    relacionadas: ['itp-ccaa', 'sucesiones-isd', 'impuesto-patrimonio'],
  },
  {
    slug: 'prestaciones-dependencia',
    icon: '♿',
    titulo: 'Prestaciones por dependencia (SAAD)',
    desc: 'Grados de dependencia, cuantías de prestaciones SAAD por grado, cotización del cuidador y deducciones IRPF.',
    verificado: FISCAL_DEPENDENCIA_META.verificado,
    relacionadas: ['iprem', 'permiso-prestacion-nacimiento', 'pensiones-jubilacion'],
  },
  {
    slug: 'calendario-fiscal',
    icon: '📅',
    titulo: 'Calendario fiscal',
    desc: 'Plazos recurrentes de los modelos trimestrales y anuales (303, 130, 111, 200…), la Renta y el Impuesto de Sociedades.',
    verificado: FISCAL_CALENDARIO_META.verificado,
    relacionadas: ['iva-tipos', 'cuota-autonomos-reta', 'impuesto-sociedades'],
  },
];

const POR_SLUG: Record<string, Ficha> = Object.fromEntries(FICHAS.map((f) => [f.slug, f]));

/** Devuelve la ficha de un slug, o undefined si no existe. */
export function getFicha(slug: string): Ficha | undefined {
  return POR_SLUG[slug];
}

/** Devuelve las fichas relacionadas (resueltas) de un slug dado. */
export function getRelacionadas(slug: string): Ficha[] {
  const ficha = POR_SLUG[slug];
  if (!ficha) return [];
  return ficha.relacionadas
    .map((s) => POR_SLUG[s])
    .filter((f): f is Ficha => f !== undefined);
}
