/**
 * data/fiscal/sucesiones.ts
 * Datos fiscales Impuesto de Sucesiones y Donaciones (ISD) — rama sucesiones
 * Tarifa estatal + tarifa Cataluña + bonificaciones de las 17 CCAA
 * Última revisión: 2025-01-01
 *
 * ⚠️ 2026-08-12: incorporada la advertencia de la Ley 3/2026 de Madrid (empresa
 *    familiar). El sello de abajo NO se mueve a propósito: el barrido mensual no
 *    puede afirmar que las 17 comunidades están verificadas, y eso es lo que
 *    significa el sello de un módulo cedido. La inmersión por CCAA es de enero
 *    (skill /revision-fiscal-enero).
 */

// ─── Metadatos ───────────────────────────────────────────────────────────────

export const FISCAL_SUCESIONES_META = {
  fuente: 'Ley 29/1987 ISD + normativas autonómicas 2025',
  verificado: '2025-01-01',
  vigencia: '2025',
  urlOficial: 'https://sede.agenciatributaria.gob.es/Sede/impuestos-tasas/isd.html',
  nota: 'Impuesto cedido a las CCAA. Verificar bonificaciones en la Agencia Tributaria de cada comunidad.',
};

// ─── Tipos ───────────────────────────────────────────────────────────────────

export interface TramoTarifaIS {
  hasta: number;
  cuota: number;
  tipo: number;
}

export interface BonificacionGrupoIS {
  porcentaje?: number;
  exencion?: number;
  limite?: number | null;
  tope?: number;
  porcentajeMayor?: number;
  reduccionBase?: number;
  escalonado?: Array<{ hasta?: number; desde?: number; porcentaje: number }>;
}

export interface BonificacionCCAA_IS {
  nombre: string;
  regimen: 'comun' | 'foral';
  bonificaciones: Record<string, BonificacionGrupoIS>;
  notas: string;
}

// ─── Tarifa estatal sucesiones (7 tramos) ────────────────────────────────────

export const TARIFA_ESTATAL_IS: TramoTarifaIS[] = [
  { hasta: 7993.46,    cuota: 0,          tipo: 7.65  },
  { hasta: 31956.87,   cuota: 611.50,     tipo: 8.50  },
  { hasta: 79881.18,   cuota: 2648.88,    tipo: 9.35  },
  { hasta: 239389.13,  cuota: 7127.47,    tipo: 10.20 },
  { hasta: 398777.54,  cuota: 23409.28,   tipo: 15.30 },
  { hasta: 797555.08,  cuota: 47798.51,   tipo: 21.25 },
  { hasta: Infinity,   cuota: 132549.07,  tipo: 25.50 },
];

// ─── Tarifa Cataluña sucesiones (5 tramos propios) ───────────────────────────

export const TARIFA_CATALUNA_IS: TramoTarifaIS[] = [
  { hasta: 50000,     cuota: 0,       tipo: 7  },
  { hasta: 150000,    cuota: 3500,    tipo: 11 },
  { hasta: 400000,    cuota: 14500,   tipo: 17 },
  { hasta: 800000,    cuota: 57000,   tipo: 24 },
  { hasta: Infinity,  cuota: 153000,  tipo: 32 },
];

// ─── Coeficientes multiplicadores por grupo y patrimonio preexistente ─────────

export const COEFICIENTES_IS: Record<string, number[]> = {
  'I':   [1.0000, 1.0500, 1.1000, 1.2000],
  'II':  [1.0000, 1.0500, 1.1000, 1.2000],
  'III': [1.5882, 1.6676, 1.7471, 1.9059],
  'IV':  [2.0000, 2.1000, 2.2000, 2.4000],
};

// Cataluña: coeficientes propios (Gr I-II sin incremento por patrimonio)
export const COEFICIENTES_CATALUNA_IS: Record<string, number[]> = {
  'I':   [1.0000, 1.0000, 1.0000, 1.0000],
  'II':  [1.0000, 1.0000, 1.0000, 1.0000],
  'III': [1.5882, 1.5882, 1.5882, 1.5882],
  'IV':  [2.0000, 2.0000, 2.0000, 2.0000],
};

// ─── Reducciones estatales por parentesco ────────────────────────────────────

export const REDUCCIONES_PARENTESCO_IS: Record<string, number> = {
  'I-conyuge':      15956.87,
  'I-descendiente': 15956.87,
  'II':             15956.87,
  'II-ascendiente': 15956.87,
  'III':            7993.46,
  'IV':             0,
};

// Cataluña: reducciones por parentesco propias
export const REDUCCIONES_PARENTESCO_CATALUNA_IS: Record<string, number> = {
  'I-conyuge':      100000,
  'I-descendiente': 100000,
  'II':             50000,
  'II-ascendiente': 50000,
  'III':            8000,
  'IV':             0,
};

// ─── Reducciones especiales (régimen común) ──────────────────────────────────

export const REDUCCION_EDAD_MENOR_21_IS = 3990.72;       // Por cada año por debajo de 21
export const REDUCCION_EDAD_MENOR_21_MAX_IS = 47858.59;  // Tope máximo
export const REDUCCION_SEGURO_VIDA_MAX_IS = 9195.49;     // 100% cónyuge/desc/asc, con límite
export const REDUCCION_VIVIENDA_PORC_IS = 0.95;          // 95% del valor neto
export const REDUCCION_VIVIENDA_MAX_IS = 122606.47;      // Tope máximo reducción vivienda
export const REDUCCION_DISCAPACIDAD_33_IS = 47858.59;    // Grado 33%–64%
export const REDUCCION_DISCAPACIDAD_65_IS = 150253.03;   // Grado ≥65%
export const PORC_AJUAR_DOMESTICO_IS = 0.03;             // 3% de la masa hereditaria

// ─── Bonificaciones autonómicas (17 CCAA) ────────────────────────────────────

export const BONIFICACIONES_CCAA_IS: Record<string, BonificacionCCAA_IS> = {

  'madrid': {
    nombre: 'Comunidad de Madrid',
    regimen: 'comun',
    bonificaciones: {
      'I-conyuge':      { porcentaje: 0.99 },
      'I-descendiente': { porcentaje: 0.99 },
      'II':             { porcentaje: 0.99 },
      'II-ascendiente': { porcentaje: 0.99 },
      'III':            { porcentaje: 0.50 },
      'IV':             { porcentaje: 0 },
    },
    notas: 'Bonificación 99% para Grupos I y II. Grupo III: 50%. ⚠️ La Ley 3/2026, de 30 de junio, de Apoyo a la Empresa Familiar (BOE-A-2026-16019) añadió una reducción del 99% EN BASE por transmisión de empresa individual, negocio profesional o participaciones, extendida a los Grupos I, II y III y a colaterales de cuarto grado, con requisitos de permanencia (5 años) y participación (5% individual o 20% del grupo familiar). Esta estimación NO la aplica: solo modela la bonificación en cuota por parentesco. Si la herencia incluye una empresa familiar, el resultado real puede ser bastante menor.',
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
    notas: 'Exención total si base liquidable < 1.000.000€. Si supera, bonificación 99%.',
  },

  'galicia': {
    nombre: 'Galicia',
    regimen: 'comun',
    bonificaciones: {
      'I-conyuge':      { porcentaje: 0.99, exencion: 1000000 },
      'I-descendiente': { porcentaje: 0.99, exencion: 1000000 },
      'II':             { porcentaje: 0.99, exencion: 1000000 },
      'II-ascendiente': { porcentaje: 0.99, exencion: 1000000 },
      'III':            { porcentaje: 0 },
      'IV':             { porcentaje: 0 },
    },
    notas: 'Exención total si base liquidable < 1.000.000€. Si supera, bonificación 99%.',
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
      'I-conyuge':      { porcentaje: 0.99 },
      'I-descendiente': { porcentaje: 0.99 },
      'II':             { porcentaje: 0.99 },
      'II-ascendiente': { porcentaje: 0.99 },
      'III':            { porcentaje: 0 },
      'IV':             { porcentaje: 0 },
    },
    notas: 'Bonificación 99% para Grupos I y II.',
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
      'III':            { porcentaje: 0.999 },
      'IV':             { porcentaje: 0 },
    },
    notas: 'Bonificación 99,9% para Grupos I, II y III. La más favorable del régimen común.',
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
      'I-conyuge':      { porcentaje: 0.99, tope: 500000, porcentajeMayor: 0.98 },
      'I-descendiente': { porcentaje: 0.99, tope: 500000, porcentajeMayor: 0.98 },
      'II':             { porcentaje: 0.99, tope: 500000, porcentajeMayor: 0.98 },
      'II-ascendiente': { porcentaje: 0.99, tope: 500000, porcentajeMayor: 0.98 },
      'III':            { porcentaje: 0 },
      'IV':             { porcentaje: 0 },
    },
    notas: 'Bonificación 99% hasta 500.000€, 98% si supera ese importe.',
  },

  'castilla-mancha': {
    nombre: 'Castilla-La Mancha',
    regimen: 'comun',
    bonificaciones: {
      'I-conyuge':      { escalonado: [{ hasta: 175000, porcentaje: 1.00 }, { hasta: 225000, porcentaje: 0.95 }, { hasta: 275000, porcentaje: 0.90 }, { hasta: 300000, porcentaje: 0.85 }, { desde: 300000, porcentaje: 0.80 }] },
      'I-descendiente': { escalonado: [{ hasta: 175000, porcentaje: 1.00 }, { hasta: 225000, porcentaje: 0.95 }, { hasta: 275000, porcentaje: 0.90 }, { hasta: 300000, porcentaje: 0.85 }, { desde: 300000, porcentaje: 0.80 }] },
      'II':             { escalonado: [{ hasta: 175000, porcentaje: 1.00 }, { hasta: 225000, porcentaje: 0.95 }, { hasta: 275000, porcentaje: 0.90 }, { hasta: 300000, porcentaje: 0.85 }, { desde: 300000, porcentaje: 0.80 }] },
      'II-ascendiente': { escalonado: [{ hasta: 175000, porcentaje: 1.00 }, { hasta: 225000, porcentaje: 0.95 }, { hasta: 275000, porcentaje: 0.90 }, { hasta: 300000, porcentaje: 0.85 }, { desde: 300000, porcentaje: 0.80 }] },
      'III':            { porcentaje: 0 },
      'IV':             { porcentaje: 0 },
    },
    notas: 'Bonificación escalonada: 100% hasta 175.000€, decrece hasta 80% si supera 300.000€.',
  },

  'cantabria': {
    nombre: 'Cantabria',
    regimen: 'comun',
    bonificaciones: {
      'I-conyuge':      { escalonado: [{ hasta: 100000, porcentaje: 1.00 }, { desde: 100000, porcentaje: 0.99 }] },
      'I-descendiente': { escalonado: [{ hasta: 100000, porcentaje: 1.00 }, { desde: 100000, porcentaje: 0.99 }] },
      'II':             { escalonado: [{ hasta: 100000, porcentaje: 1.00 }, { desde: 100000, porcentaje: 0.99 }] },
      'II-ascendiente': { escalonado: [{ hasta: 100000, porcentaje: 1.00 }, { desde: 100000, porcentaje: 0.99 }] },
      'III':            { porcentaje: 0 },
      'IV':             { porcentaje: 0 },
    },
    notas: 'Exención total hasta 100.000€, bonificación 99% si supera.',
  },

  'aragon': {
    nombre: 'Aragón',
    regimen: 'comun',
    bonificaciones: {
      'I-conyuge':      { porcentaje: 1.00, limite: 3000000 },
      'I-descendiente': { porcentaje: 1.00, limite: 3000000 },
      'II':             { porcentaje: 1.00, limite: 3000000 },
      'II-ascendiente': { porcentaje: 1.00, limite: 3000000 },
      'III':            { porcentaje: 0 },
      'IV':             { porcentaje: 0 },
    },
    notas: 'Exención total hasta 3.000.000€ para Grupos I y II.',
  },

  'baleares': {
    nombre: 'Islas Baleares',
    regimen: 'comun',
    bonificaciones: {
      'I-conyuge':      { porcentaje: 0.99 },
      'I-descendiente': { porcentaje: 0.99 },
      'II':             { porcentaje: 0.95 },
      'II-ascendiente': { porcentaje: 0.95 },
      'III':            { porcentaje: 0 },
      'IV':             { porcentaje: 0 },
    },
    notas: 'Bonificación 99% Grupo I, 95% Grupo II.',
  },

  'asturias': {
    nombre: 'Principado de Asturias',
    regimen: 'comun',
    bonificaciones: {
      'I-conyuge':      { porcentaje: 0, reduccionBase: 300000 },
      'I-descendiente': { porcentaje: 0, reduccionBase: 300000 },
      'II':             { porcentaje: 0, reduccionBase: 300000 },
      'II-ascendiente': { porcentaje: 0, reduccionBase: 300000 },
      'III':            { porcentaje: 0, reduccionBase: 50000 },
      'IV':             { porcentaje: 0, reduccionBase: 0 },
    },
    notas: 'Sin bonificación autonómica. Reducción adicional de 300.000€ en base para Grupos I y II. Tributación más alta del régimen común.',
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
    notas: 'Tarifa propia (hasta 32%), reducciones propias. Más compleja que el régimen común. Consultar Agència Tributària de Catalunya.',
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
    notas: '⚠️ Régimen foral. Esta estimación es MUY APROXIMADA. Las 3 Haciendas Forales (Álava, Bizkaia, Gipuzkoa) tienen normativas distintas entre sí. CONSULTA OBLIGATORIA.',
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
    notas: '⚠️ Régimen foral (Ley Foral 16/1997). Esta estimación es MUY APROXIMADA. Tarifas y reducciones propias de Navarra. CONSULTA OBLIGATORIA con asesor fiscal navarro.',
  },
};
