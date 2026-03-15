/**
 * data/fiscal/donaciones.ts
 * Datos fiscales Impuesto de Sucesiones y Donaciones (ISD) — rama donaciones
 * Tarifa estatal (16 tramos) + tarifa Cataluña (general + reducida) + bonificaciones CCAA
 * Última revisión: 2025-01-01
 */

// ─── Metadatos ───────────────────────────────────────────────────────────────

export const FISCAL_DONACIONES_META = {
  fuente: 'Ley 29/1987 ISD (donaciones) + normativas autonómicas 2025',
  verificado: '2025-01-01',
  vigencia: '2025',
  urlOficial: 'https://sede.agenciatributaria.gob.es/Sede/impuestos-tasas/isd.html',
  nota: 'El impuesto está cedido a las CCAA. Plazo de autoliquidación: 1 mes desde la donación (Modelo 651).',
};

// ─── Tipos ───────────────────────────────────────────────────────────────────

export interface TramoTarifaID {
  hasta: number;
  cuota: number;
  tipo: number;
}

export interface BonificacionGrupoID {
  porcentaje?: number;
  exencion?: number;
  limite?: number | null;
  escalonado?: Array<{ hasta?: number; desde?: number; porcentaje: number }>;
  requiereEscritura?: boolean;
}

export interface BonificacionCCAA_ID {
  nombre: string;
  regimen: 'comun' | 'foral';
  bonificaciones: Record<string, BonificacionGrupoID>;
  notas: string;
  requiereEscritura?: boolean;
}

// ─── Tarifa estatal donaciones (16 tramos — diferente a sucesiones) ───────────

export const TARIFA_ESTATAL_ID: TramoTarifaID[] = [
  { hasta: 7993.46,    cuota: 0,          tipo: 7.65  },
  { hasta: 15980.91,   cuota: 611.50,     tipo: 8.50  },
  { hasta: 23968.36,   cuota: 1290.43,    tipo: 9.35  },
  { hasta: 31955.81,   cuota: 2037.26,    tipo: 10.20 },
  { hasta: 39943.26,   cuota: 2851.98,    tipo: 11.05 },
  { hasta: 47930.72,   cuota: 3734.59,    tipo: 11.90 },
  { hasta: 55918.17,   cuota: 4685.10,    tipo: 12.75 },
  { hasta: 63905.62,   cuota: 5703.50,    tipo: 13.60 },
  { hasta: 71893.07,   cuota: 6789.79,    tipo: 14.45 },
  { hasta: 79880.52,   cuota: 7943.98,    tipo: 15.30 },
  { hasta: 119757.67,  cuota: 9166.06,    tipo: 16.15 },
  { hasta: 159634.83,  cuota: 15606.22,   tipo: 18.70 },
  { hasta: 239389.13,  cuota: 23063.25,   tipo: 21.25 },
  { hasta: 398777.54,  cuota: 40011.04,   tipo: 25.50 },
  { hasta: 797555.08,  cuota: 80655.08,   tipo: 29.75 },
  { hasta: Infinity,   cuota: 199291.40,  tipo: 34.00 },
];

// ─── Tarifa Cataluña donaciones — general (5 tramos) ─────────────────────────

export const TARIFA_CATALUNA_ID_GENERAL: TramoTarifaID[] = [
  { hasta: 50000,     cuota: 0,       tipo: 7  },
  { hasta: 150000,    cuota: 3500,    tipo: 11 },
  { hasta: 400000,    cuota: 14500,   tipo: 17 },
  { hasta: 800000,    cuota: 57000,   tipo: 24 },
  { hasta: Infinity,  cuota: 153000,  tipo: 32 },
];

// ─── Tarifa Cataluña donaciones — reducida (Grupos I/II + escritura pública) ──

export const TARIFA_CATALUNA_ID_REDUCIDA: TramoTarifaID[] = [
  { hasta: 200000,    cuota: 0,      tipo: 5 },
  { hasta: 600000,    cuota: 10000,  tipo: 7 },
  { hasta: Infinity,  cuota: 38000,  tipo: 9 },
];

// ─── Coeficientes multiplicadores ────────────────────────────────────────────

export const COEFICIENTES_ID: Record<string, number[]> = {
  'I':   [1.0000, 1.0500, 1.1000, 1.2000],
  'II':  [1.0000, 1.0500, 1.1000, 1.2000],
  'III': [1.5882, 1.6676, 1.7471, 1.9059],
  'IV':  [2.0000, 2.1000, 2.2000, 2.4000],
};

// Cataluña: coeficientes propios
export const COEFICIENTES_CATALUNA_ID: Record<string, number[]> = {
  'I':   [1.0000, 1.1000, 1.1500, 1.2000],
  'II':  [1.0000, 1.1000, 1.1500, 1.2000],
  'III': [1.5882, 1.6676, 1.7471, 1.9059],
  'IV':  [2.0000, 2.1000, 2.2000, 2.4000],
};

// ─── Reducciones por parentesco — régimen común ───────────────────────────────

export const REDUCCIONES_PARENTESCO_ID: Record<string, number> = {
  'I-conyuge':      15956.87,
  'I-descendiente': 15956.87,
  'II':             15956.87,
  'II-ascendiente': 15956.87,
  'III':            7993.46,
  'IV':             0,
};

// ─── Reducciones por discapacidad ────────────────────────────────────────────

export const REDUCCION_DISCAPACIDAD_33_ID = 47859.59;  // Grado 33%–64%
export const REDUCCION_DISCAPACIDAD_65_ID = 150253.03; // Grado ≥65%

// ─── Bonificaciones autonómicas — donaciones (17 CCAA) ───────────────────────

export const BONIFICACIONES_CCAA_ID: Record<string, BonificacionCCAA_ID> = {

  'madrid': {
    nombre: 'Comunidad de Madrid',
    regimen: 'comun',
    bonificaciones: {
      'I-conyuge':      { porcentaje: 0.99 },
      'I-descendiente': { porcentaje: 0.99 },
      'II':             { porcentaje: 0.99 },
      'II-ascendiente': { porcentaje: 0.99 },
      'III':            { porcentaje: 0 },
      'IV':             { porcentaje: 0 },
    },
    notas: 'Bonificación 99% para Grupos I y II. Sin límite de importe.',
  },

  'andalucia': {
    nombre: 'Andalucía',
    regimen: 'comun',
    bonificaciones: {
      'I-conyuge':      { porcentaje: 0.99, exencion: 1000000 },
      'I-descendiente': { porcentaje: 0.99, exencion: 1000000 },
      'II':             { porcentaje: 0.99, exencion: 1000000 },
      'II-ascendiente': { porcentaje: 0.99, exencion: 1000000 },
      'III':            { porcentaje: 0 },
      'IV':             { porcentaje: 0 },
    },
    notas: 'Exención total si base liquidable < 1.000.000€ para Grupos I y II. Si supera, bonificación 99%.',
  },

  'galicia': {
    nombre: 'Galicia',
    regimen: 'comun',
    bonificaciones: {
      'I-conyuge':      { porcentaje: 0.99 },
      'I-descendiente': { porcentaje: 0.99 },
      'II':             { porcentaje: 0.99 },
      'II-ascendiente': { porcentaje: 0.99 },
      'III':            { porcentaje: 0 },
      'IV':             { porcentaje: 0 },
    },
    notas: 'Bonificación 99% para cónyuges, descendientes y ascendientes.',
  },

  'murcia': {
    nombre: 'Región de Murcia',
    regimen: 'comun',
    bonificaciones: {
      'I-conyuge':      { porcentaje: 0.99 },
      'I-descendiente': { porcentaje: 0.99 },
      'II':             { porcentaje: 0.99 },
      'II-ascendiente': { porcentaje: 0.99 },
      'III':            { porcentaje: 0.50 },
      'IV':             { porcentaje: 0 },
    },
    notas: 'Bonificación 99% Grupos I y II, 50% Grupo III.',
  },

  'valencia': {
    nombre: 'Comunitat Valenciana',
    regimen: 'comun',
    bonificaciones: {
      'I-conyuge':      { porcentaje: 0.75 },
      'I-descendiente': { porcentaje: 0.75 },
      'II':             { porcentaje: 0.75 },
      'II-ascendiente': { porcentaje: 0.75 },
      'III':            { porcentaje: 0 },
      'IV':             { porcentaje: 0 },
    },
    notas: 'Bonificación 75% para Grupos I y II en donaciones (menor que en sucesiones).',
  },

  'extremadura': {
    nombre: 'Extremadura',
    regimen: 'comun',
    bonificaciones: {
      'I-conyuge':      { porcentaje: 0.99 },
      'I-descendiente': { porcentaje: 0.99 },
      'II':             { porcentaje: 0.99 },
      'II-ascendiente': { porcentaje: 0.99 },
      'III':            { porcentaje: 0 },
      'IV':             { porcentaje: 0 },
    },
    notas: 'Bonificación 99% para Grupos I y II.',
  },

  'canarias': {
    nombre: 'Canarias',
    regimen: 'comun',
    bonificaciones: {
      'I-conyuge':      { porcentaje: 0.999 },
      'I-descendiente': { porcentaje: 0.999 },
      'II':             { porcentaje: 0.999 },
      'II-ascendiente': { porcentaje: 0.999 },
      'III':            { porcentaje: 0 },
      'IV':             { porcentaje: 0 },
    },
    notas: 'Bonificación 99,9% para Grupos I y II (prácticamente exención total).',
  },

  'castilla-leon': {
    nombre: 'Castilla y León',
    regimen: 'comun',
    bonificaciones: {
      'I-conyuge':      { porcentaje: 0.99 },
      'I-descendiente': { porcentaje: 0.99 },
      'II':             { porcentaje: 0.99 },
      'II-ascendiente': { porcentaje: 0.99 },
      'III':            { porcentaje: 0 },
      'IV':             { porcentaje: 0 },
    },
    notas: 'Bonificación 99% para Grupos I y II.',
  },

  'rioja': {
    nombre: 'La Rioja',
    regimen: 'comun',
    bonificaciones: {
      'I-conyuge':      { porcentaje: 0.99 },
      'I-descendiente': { porcentaje: 0.99 },
      'II':             { porcentaje: 0.99 },
      'II-ascendiente': { porcentaje: 0.99 },
      'III':            { porcentaje: 0.99 },
      'IV':             { porcentaje: 0 },
    },
    notas: 'Bonificación 99% para Grupos I, II y III.',
  },

  'castilla-mancha': {
    nombre: 'Castilla-La Mancha',
    regimen: 'comun',
    requiereEscritura: true,
    bonificaciones: {
      'I-conyuge':      { porcentaje: 0.95, requiereEscritura: true },
      'I-descendiente': { porcentaje: 0.95, requiereEscritura: true },
      'II':             { porcentaje: 0.95, requiereEscritura: true },
      'II-ascendiente': { porcentaje: 0.95, requiereEscritura: true },
      'III':            { porcentaje: 0 },
      'IV':             { porcentaje: 0 },
    },
    notas: 'Bonificación 95% para Grupos I y II. REQUIERE escritura pública para aplicarla.',
  },

  'cantabria': {
    nombre: 'Cantabria',
    regimen: 'comun',
    bonificaciones: {
      'I-conyuge':      { porcentaje: 0.99 },
      'I-descendiente': { porcentaje: 0.99 },
      'II':             { porcentaje: 0.99 },
      'II-ascendiente': { porcentaje: 0.99 },
      'III':            { porcentaje: 0 },
      'IV':             { porcentaje: 0 },
    },
    notas: 'Bonificación 99% para Grupos I y II.',
  },

  'aragon': {
    nombre: 'Aragón',
    regimen: 'comun',
    bonificaciones: {
      'I-conyuge':      { porcentaje: 0.65 },
      'I-descendiente': { porcentaje: 0.65 },
      'II':             { porcentaje: 0.65 },
      'II-ascendiente': { porcentaje: 0.65 },
      'III':            { porcentaje: 0 },
      'IV':             { porcentaje: 0 },
    },
    notas: 'Bonificación 65% para Grupos I y II en donaciones (más baja que en sucesiones).',
  },

  'baleares': {
    nombre: 'Islas Baleares',
    regimen: 'comun',
    bonificaciones: {
      'I-conyuge':      { porcentaje: 0.93 },
      'I-descendiente': { porcentaje: 0.93 },
      'II':             { porcentaje: 0.93 },
      'II-ascendiente': { porcentaje: 0.93 },
      'III':            { porcentaje: 0 },
      'IV':             { porcentaje: 0 },
    },
    notas: 'Bonificación 93% para Grupos I y II.',
  },

  'asturias': {
    nombre: 'Principado de Asturias',
    regimen: 'comun',
    bonificaciones: {
      'I-conyuge':      { porcentaje: 0.99 },
      'I-descendiente': { porcentaje: 0.99 },
      'II':             { porcentaje: 0.99 },
      'II-ascendiente': { porcentaje: 0.99 },
      'III':            { porcentaje: 0 },
      'IV':             { porcentaje: 0 },
    },
    notas: 'Bonificación 99% para Grupos I y II en donaciones (diferente a sucesiones donde no hay bonificación).',
  },

  'cataluna': {
    nombre: 'Cataluña',
    regimen: 'foral',
    bonificaciones: {
      'I-conyuge':      { porcentaje: 0 },
      'I-descendiente': { porcentaje: 0 },
      'II':             { porcentaje: 0 },
      'II-ascendiente': { porcentaje: 0 },
      'III':            { porcentaje: 0 },
      'IV':             { porcentaje: 0 },
    },
    notas: 'Tarifa propia con dos modalidades: tarifa reducida (5-9%) para Gr I/II con escritura pública, tarifa general (7-32%) para el resto. Consultar Agència Tributària de Catalunya.',
  },

  'pais-vasco': {
    nombre: 'País Vasco',
    regimen: 'foral',
    bonificaciones: {
      'I-conyuge':      { porcentaje: 0.99 },
      'I-descendiente': { porcentaje: 0.99 },
      'II':             { porcentaje: 0.99 },
      'II-ascendiente': { porcentaje: 0.99 },
      'III':            { porcentaje: 0 },
      'IV':             { porcentaje: 0 },
    },
    notas: '⚠️ Régimen foral. Esta estimación es MUY APROXIMADA. Las 3 Haciendas Forales (Álava, Bizkaia, Gipuzkoa) tienen normativas distintas. CONSULTA OBLIGATORIA.',
  },

  'navarra': {
    nombre: 'Navarra',
    regimen: 'foral',
    bonificaciones: {
      'I-conyuge':      { porcentaje: 0.98 },
      'I-descendiente': { porcentaje: 0.98 },
      'II':             { porcentaje: 0.98 },
      'II-ascendiente': { porcentaje: 0.98 },
      'III':            { porcentaje: 0 },
      'IV':             { porcentaje: 0 },
    },
    notas: '⚠️ Régimen foral (Ley Foral 16/1997). Estimación MUY APROXIMADA. Tarifas y reducciones propias. CONSULTA OBLIGATORIA con asesor fiscal navarro.',
  },
};
