/**
 * data/fiscal/donaciones.ts
 * Datos fiscales Impuesto de Sucesiones y Donaciones (ISD) — rama donaciones
 * Tarifa estatal (16 tramos, art. 21.2 LISD, común con sucesiones) + tarifa Cataluña
 * (general + reducida) + bonificaciones CCAA
 * Última revisión: 2025-01-01
 *
 * ⚠️ 2026-08-12: incorporada la advertencia de la Ley 3/2026 de Madrid (empresa
 *    familiar). El sello de abajo NO se mueve a propósito: el barrido mensual no
 *    puede afirmar que las 17 comunidades están verificadas, y eso es lo que
 *    significa el sello de un módulo cedido. La inmersión por CCAA es de enero
 *    (skill /revision-fiscal-enero).
 *
 * ⚠️ 2026-09-25 (Inspector, hallazgos 1862, 1863 y 1869): cotejado contra el BOE consolidado
 *    lo que aquí se corrigió, y solo eso —las otras 16 comunidades siguen sin cotejar—:
 *    · Castilla-La Mancha, Ley 8/2013 (BOE-A-2014-1368), art. 17 bis en la redacción de la
 *      Ley 3/2016 (vigente desde el 01/06/2016): la bonificación inter vivos de los Grupos I y
 *      II es ESCALONADA por base liquidable (95 / 90 / 85 %), no un 95 % plano, y hay otra del
 *      95 % para donatarios con discapacidad ≥ 65 % (art. 17 bis.2), que se aplica después.
 *      Las dos exigen escritura pública (art. 18.3.a).
 *    · Cataluña es de RÉGIMEN COMÚN (Ley 22/2009): forales solo son el País Vasco y Navarra.
 *    · Las reducciones por parentesco y discapacidad del art. 20.2.a LISD son de las
 *      adquisiciones MORTIS CAUSA: en una donación, sin reducción autonómica propia, «la base
 *      liquidable coincidirá, en todo caso, con la imponible» (art. 20.5 LISD). Ver más abajo.
 *    El sello `verificado` sigue sin moverse, por la misma razón del párrafo anterior.
 */

import { TARIFA_ESTATAL_ISD } from './sucesiones';

// ─── Metadatos ───────────────────────────────────────────────────────────────

export const FISCAL_DONACIONES_META = {
  fuente: 'Ley 29/1987 ISD (donaciones) + normativas autonómicas 2025',
  verificado: '2025-01-01',
  vigencia: '2025',
  urlOficial: 'https://sede.agenciatributaria.gob.es/Sede/impuestos-tasas/isd.html',
  nota: 'El impuesto está cedido a las CCAA. Plazo general de autoliquidación: 30 días hábiles desde el día siguiente a la donación (art. 67.1.b RISD), salvo que la comunidad fije uno propio (Modelo 651).',
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

/**
 * Bonificación en cuota por discapacidad del DONATARIO, para cualquier grupo de parentesco.
 * Se aplica DESPUÉS de la bonificación por parentesco, sobre lo que esta deja (así lo dice,
 * por ejemplo, el art. 17 bis.2 de la Ley 8/2013 de Castilla-La Mancha).
 */
export interface BonificacionDiscapacidadID {
  /** Grado mínimo de discapacidad, en % (65 = «igual o superior al 65 por ciento») */
  gradoMinimo: number;
  /** Fracción de la cuota que bonifica (0,95 = 95 %) */
  porcentaje: number;
  /** Artículo que la establece, para el desglose */
  norma: string;
}

export interface BonificacionCCAA_ID {
  nombre: string;
  regimen: 'comun' | 'foral';
  bonificaciones: Record<string, BonificacionGrupoID>;
  notas: string;
  requiereEscritura?: boolean;
  /** Artículo de la bonificación por parentesco, si está cotejado (se imprime en el desglose) */
  normaBonificacion?: string;
  /** Solo en las comunidades donde está cotejada; las demás no la modelan */
  bonificacionDiscapacidad?: BonificacionDiscapacidadID;
}

// ─── Tarifa estatal del ISD (art. 21.2 LISD — 16 tramos) ─────────────────────

/**
 * La MISMA escala que liquida una herencia. El art. 21 LISD no distingue entre adquisiciones
 * mortis causa e inter vivos: una sola tarifa para todo el impuesto, y lo que separa a las
 * dos modalidades son las reducciones del art. 20.
 *
 * Vive en `./sucesiones` y aquí solo se le pone el nombre de esta rama. Hasta el 11/09/2026
 * estaba transcrita a mano en los dos módulos bajo el rótulo «diferente a sucesiones», y esa
 * afirmación —falsa— es la que dejó pasar que la copia de la rama de sucesiones tuviera siete
 * tramos y se quedara en el 25,50 % (hallazgo 735 del Inspector). Dos copias de un dato
 * normativo existen exactamente para poder divergir.
 */
export const TARIFA_ESTATAL_ID: TramoTarifaID[] = TARIFA_ESTATAL_ISD;

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

// ─── Reducciones del art. 20.2.a LISD — NO se aplican a las donaciones ────────
/**
 * ⚠️ Estas cifras son las reducciones por parentesco y por discapacidad del art. 20.2.a LISD,
 * que la ley reserva a las adquisiciones «mortis causa». En una donación, si la comunidad no
 * ha regulado una reducción propia, «la base liquidable coincidirá, en todo caso, con la
 * imponible» (art. 20.5 LISD, BOE-A-1987-28141, cotejado el 25/09/2026).
 *
 * Hasta el 25/09/2026 el estimador de donaciones y `lib/calculadoras/donaciones.ts` (MCP de
 * Delegum y GPT) las restaban de la base (hallazgo 1862). Ya NO las usa ningún motor; se
 * conservan porque `app/api/datos/[slug]/route.ts` las publica bajo la ficha de donaciones,
 * y retirar un export compartido rompe a quien lo importa. Esa ficha debería dejar de
 * publicarlas como si fueran de donaciones.
 */
export const REDUCCIONES_PARENTESCO_ID: Record<string, number> = {
  'I-conyuge':      15956.87,
  'I-descendiente': 15956.87,
  'II':             15956.87,
  'II-ascendiente': 15956.87,
  'III':            7993.46,
  'IV':             0,
};

// ─── Reducciones por discapacidad ────────────────────────────────────────────

// 47.858,59 € (art. 20.2.a LISD). Hasta el 25/09/2026 decía 47.859,59: un euro de más.
export const REDUCCION_DISCAPACIDAD_33_ID = 47858.59;  // Grado 33 %–64 % (solo mortis causa)
export const REDUCCION_DISCAPACIDAD_65_ID = 150253.03; // Grado ≥ 65 % (solo mortis causa)

// ─── Plazos (cotejados en el BOE consolidado el 25/09/2026) ───────────────────

/** Plazo general de autoliquidación de una donación (art. 67.1.b RISD, BOE-A-1991-27678). */
export const PLAZO_AUTOLIQUIDACION_DONACIONES = {
  diasHabiles: 30,
  norma: 'art. 67.1.b RISD',
} as const;

/**
 * Acumulación de donaciones del mismo donante al mismo donatario: TRES años (art. 30.1 LISD,
 * redacción de la Ley 11/2021, BOE-A-2021-11473). Los CUATRO años son los de la acumulación
 * de las donaciones a la sucesión del donante (art. 30.2).
 */
export const ACUMULACION_DONACIONES_ANIOS = 3;
export const ACUMULACION_DONACIONES_A_SUCESION_ANIOS = 4;

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
    notas: 'Bonificación 99 % para Grupos I y II. Sin límite de importe. ⚠️ La Ley 3/2026, de 30 de junio, de Apoyo a la Empresa Familiar (BOE-A-2026-16019) añadió una reducción del 99 % EN BASE por donación de empresa individual, negocio profesional o participaciones, extendida a los Grupos I, II y III y a colaterales de cuarto grado, con requisitos de permanencia (5 años), participación (5 % individual o 20 % del grupo familiar) y formalización en escritura. Esta estimación NO la aplica: solo modela la bonificación en cuota por parentesco.',
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
    notas: 'Exención total si base liquidable < 1.000.000€ para Grupos I y II. Si supera, bonificación 99 %.',
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
    notas: 'Bonificación 99 % para cónyuges, descendientes y ascendientes.',
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
    notas: 'Bonificación 99 % Grupos I y II, 50 % Grupo III.',
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
    notas: 'Bonificación 75 % para Grupos I y II en donaciones (menor que en sucesiones).',
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
    notas: 'Bonificación 99 % para Grupos I y II.',
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
    notas: 'Bonificación 99,9 % para Grupos I y II (prácticamente exención total).',
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
    notas: 'Bonificación 99 % para Grupos I y II.',
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
    notas: 'Bonificación 99 % para Grupos I, II y III.',
  },

  'castilla-mancha': {
    nombre: 'Castilla-La Mancha',
    regimen: 'comun',
    requiereEscritura: true,
    normaBonificacion: 'art. 17 bis.1 Ley 8/2013',
    // Art. 17 bis.1: «inferior a 120.000» → 95 %; «igual o superior a 120.000 e inferior a
    // 240.000» → 90 %; «igual o superior a 240.000» → 85 %. `hasta` es EXCLUSIVO.
    bonificaciones: {
      'I-conyuge':      { escalonado: [{ hasta: 120000, porcentaje: 0.95 }, { desde: 120000, hasta: 240000, porcentaje: 0.90 }, { desde: 240000, porcentaje: 0.85 }], requiereEscritura: true },
      'I-descendiente': { escalonado: [{ hasta: 120000, porcentaje: 0.95 }, { desde: 120000, hasta: 240000, porcentaje: 0.90 }, { desde: 240000, porcentaje: 0.85 }], requiereEscritura: true },
      'II':             { escalonado: [{ hasta: 120000, porcentaje: 0.95 }, { desde: 120000, hasta: 240000, porcentaje: 0.90 }, { desde: 240000, porcentaje: 0.85 }], requiereEscritura: true },
      'II-ascendiente': { escalonado: [{ hasta: 120000, porcentaje: 0.95 }, { desde: 120000, hasta: 240000, porcentaje: 0.90 }, { desde: 240000, porcentaje: 0.85 }], requiereEscritura: true },
      'III':            { porcentaje: 0 },
      'IV':             { porcentaje: 0 },
    },
    bonificacionDiscapacidad: { gradoMinimo: 65, porcentaje: 0.95, norma: 'art. 17 bis.2 Ley 8/2013' },
    notas: 'Bonificación en cuota para los Grupos I y II según la base liquidable: 95 % por debajo de 120.000 €, 90 % de 120.000 € a 240.000 € y 85 % desde 240.000 € (art. 17 bis.1 Ley 8/2013). Donatarios con discapacidad igual o superior al 65 %, de cualquier grupo: otra bonificación del 95 %, que se aplica después (art. 17 bis.2). Las dos exigen escritura pública en la que conste el origen de los bienes y, si no son dinero, mantenerlos 5 años (art. 18.3).',
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
    notas: 'Bonificación 99 % para Grupos I y II.',
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
    notas: 'Bonificación 65 % para Grupos I y II en donaciones (más baja que en sucesiones).',
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
    notas: 'Bonificación 93 % para Grupos I y II.',
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
    notas: 'Bonificación 99 % para Grupos I y II en donaciones (diferente a sucesiones donde no hay bonificación).',
  },

  'cataluna': {
    nombre: 'Cataluña',
    // Régimen COMÚN: el impuesto le está cedido por la Ley 22/2009 como al resto. Hasta el
    // 25/09/2026 figuraba como 'foral' (hallazgo 1869); forales solo son País Vasco y Navarra.
    regimen: 'comun',
    bonificaciones: {
      'I-conyuge':      { porcentaje: 0 },
      'I-descendiente': { porcentaje: 0 },
      'II':             { porcentaje: 0 },
      'II-ascendiente': { porcentaje: 0 },
      'III':            { porcentaje: 0 },
      'IV':             { porcentaje: 0 },
    },
    notas: 'Tarifa propia con dos modalidades: tarifa reducida (del 5 % al 9 %) para los Grupos I y II con escritura pública, y tarifa general (del 7 % al 32 %) para el resto. Consultar Agència Tributària de Catalunya.',
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
