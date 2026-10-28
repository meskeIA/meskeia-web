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
  limite?: number | null;
  escalonado?: Array<{ hasta?: number; desde?: number; porcentaje: number }>;
  /**
   * Escala MARGINAL sobre la base liquidable: cada tramo bonifica solo la parte de base que le
   * toca, y el porcentaje que se aplica a la cuota es el medio ponderado (la misma forma que
   * `escalaPonderada` de la rama de sucesiones, Cataluña). No confundir con `escalonado`, donde
   * la base entera se lleva el porcentaje de su tramo.
   */
  escalaPonderada?: TramoEscalaBonificacionID[];
  /** La misma escala con los límites que rigen si el donatario tiene discapacidad (≥ 33 %) */
  escalaPonderadaDiscapacidad?: TramoEscalaBonificacionID[];
  requiereEscritura?: boolean;
}

/** Un tramo de una escala marginal de bonificación: el marginal se aplica a la parte de base del tramo. */
export interface TramoEscalaBonificacionID {
  /** Límite superior del tramo de base liquidable (€); `Infinity` en el último. */
  hasta: number;
  /** Fracción (0,99 = 99 %) que bonifica la porción de base comprendida en este tramo. */
  marginal: number;
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
  /**
   * La bonificación exige documento público solo si la base imponible SUPERA este importe
   * (Extremadura: 10.000 €, art. 30.1 DLeg 1/2018; Andalucía: 5.000 €, art. 40.2.a Ley 5/2021).
   * Por debajo, no lo exige.
   */
  escrituraSiBaseSupera?: number;
  /** Artículo del requisito de documento público, si no es el de la bonificación */
  normaEscritura?: string;
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
 * ⚠️ Este módulo NO tiene reducciones por parentesco ni por discapacidad: las del art. 20.2.a
 * LISD la ley las reserva a las adquisiciones «mortis causa». En una donación, si la comunidad no
 * ha regulado una reducción propia, «la base liquidable coincidirá, en todo caso, con la
 * imponible» (art. 20.5 LISD, BOE-A-1987-28141, cotejado el 25/09/2026).
 *
 * Hasta el 25/09/2026 el estimador de donaciones y `lib/calculadoras/donaciones.ts` (MCP de
 * Delegum y GPT) las restaban de la base (hallazgo 1862), y hasta el 12/10/2026
 * `app/api/datos/[slug]/route.ts` las publicaba bajo la ficha de donaciones (cabo C0026). Ya
 * no las lee nadie, así que se retiraron REDUCCIONES_PARENTESCO_ID y REDUCCION_DISCAPACIDAD_*_ID:
 * las cifras viven, para lo que sí son, en el módulo de sucesiones.
 */

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

/** Extremadura, art. 30.1 DLeg 1/2018: 99 % hasta 300.000 €, 50 % hasta 600.000 €, nada después. */
export const ESCALA_EXTREMADURA_ID: TramoEscalaBonificacionID[] = [
  { hasta: 300000, marginal: 0.99 },
  { hasta: 600000, marginal: 0.5 },
  { hasta: Infinity, marginal: 0 },
];

/** La misma, con la consideración legal de persona con discapacidad: 450.000 y 750.000 €. */
export const ESCALA_EXTREMADURA_ID_DISCAPACIDAD: TramoEscalaBonificacionID[] = [
  { hasta: 450000, marginal: 0.99 },
  { hasta: 750000, marginal: 0.5 },
  { hasta: Infinity, marginal: 0 },
];

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

  // Art. 40.1 de la Ley 5/2021 de Tributos Cedidos de Andalucía (BOE-A-2021-17915, redacción
  // vigente desde el 01/01/2026, leída en el BOE el 27/10/2026): «Los contribuyentes incluidos
  // en los Grupos I y II […] aplicarán una bonificación del 99% en la cuota tributaria derivada
  // de adquisiciones inter vivos». La ley NO tiene exención por importe en donaciones: la que
  // había aquí (base < 1.000.000 €, cuota 0) no está en ningún artículo de su capítulo del ISD,
  // y el 1.000.000 € del art. 28 es una reducción en base de SUCESIONES. Hallazgo 2828.
  // Art. 40.2.a: la bonificación exige documento público «cuando la base imponible del impuesto
  // sea superior a 5.000 euros» (modelado desde el 28/10/2026, decisión del usuario). No se
  // modelan: el cómputo de las donaciones del mismo donante en los tres años anteriores ni los
  // requisitos del metálico (art. 40.2.b: plazo de un mes y origen de los fondos).
  // Una sola comunidad: el sello del módulo NO se mueve.
  'andalucia': {
    nombre: 'Andalucía',
    regimen: 'comun',
    normaBonificacion: 'art. 40.1 Ley 5/2021',
    escrituraSiBaseSupera: 5000,
    normaEscritura: 'art. 40.2.a Ley 5/2021',
    bonificaciones: {
      'I-conyuge':      { porcentaje: 0.99 },
      'I-descendiente': { porcentaje: 0.99 },
      'II':             { porcentaje: 0.99 },
      'II-ascendiente': { porcentaje: 0.99 },
      'III':            { porcentaje: 0 },
      'IV':             { porcentaje: 0 },
    },
    notas: 'Tarifa propia (del 7 % al 26 %, art. 37) y coeficientes propios (1,0 para los Grupos I y II, 1,5 para el III y 1,9 para el IV, art. 38). Grupos I y II: bonificación del 99 % de la cuota, sin límite de importe. Si la base imponible supera 5.000 €, la donación debe constar en documento público, y sin él no hay bonificación. Las donaciones del mismo donante en los tres años anteriores cuentan para ese umbral, y en metálico hay que justificar en el documento el origen de los fondos: esta estimación no lo aplica.',
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
    // Hasta el 11/10/2026 decía 75 %, superado desde el 01/06/2025. Cotejado ese día en el BOE:
    // art. 12 bis de la Ley 13/1997 valenciana consolidado (BOE-A-1998-8202, versiones del
    // 01/06/2025 en adelante) y su redacción por la Ley 5/2026, art. 22 (BOE-A-2026-19331). El
    // 99 % alcanza a cónyuge, padres, hijos, nietos y abuelos (12 bis.1.b). El 25 % de los
    // colaterales CONSANGUÍNEOS de 2.º y 3.er grado (12 bis.2.b) no se modela: excluye a los
    // afines del mismo Grupo III y el módulo no los distingue; es trabajo de la revisión de enero.
    // Una sola comunidad: el sello del módulo NO se mueve.
    bonificaciones: {
      'I-conyuge':      { porcentaje: 0.99 },
      'I-descendiente': { porcentaje: 0.99 },
      'II':             { porcentaje: 0.99 },
      'II-ascendiente': { porcentaje: 0.99 },
      'III':            { porcentaje: 0 },
      'IV':             { porcentaje: 0 },
    },
    notas: 'Bonificación 99 % para cónyuge, padres, hijos, nietos y abuelos, si la donación consta en documento público (o se eleva a él en plazo) y, en metálico, con justificación del origen de los fondos. Hermanos, sobrinos y tíos tienen un 25 % que esta estimación no aplica.',
  },

  // Cotejado el 22/10/2026 en el BOE consolidado (BOE-A-2018-8159, DLeg 1/2018 de Extremadura,
  // art. 30, texto actualizado el 04/08/2026), cabo C0146. Art. 30.1: 99 % de la cuota para los
  // Grupos I y II «si la base liquidable es inferior o igual a 300.000 euros», 50 % «para la
  // parte de base liquidable que supere los 300.000 euros con el límite de 600.000 euros»; con
  // la consideración legal de persona con discapacidad, 450.000 y 750.000 €. Documento público
  // obligatorio «cuando la base imponible sea superior a 10.000 euros». Hasta esta fecha el
  // módulo aplicaba el 99 % a toda la cuota sin límite, aunque el límite está en la ley desde
  // el 17/05/2022. La parte de base por encima de 600.000 € no bonifica. No se modelan: la
  // acumulación de donaciones sucesivas (art. 30.2) ni los requisitos del metálico (art. 30.4).
  // Una sola comunidad: el sello del módulo NO se mueve.
  'extremadura': {
    nombre: 'Extremadura',
    regimen: 'comun',
    normaBonificacion: 'art. 30.1 DLeg 1/2018',
    escrituraSiBaseSupera: 10000,
    bonificaciones: {
      'I-conyuge':      { escalaPonderada: ESCALA_EXTREMADURA_ID, escalaPonderadaDiscapacidad: ESCALA_EXTREMADURA_ID_DISCAPACIDAD },
      'I-descendiente': { escalaPonderada: ESCALA_EXTREMADURA_ID, escalaPonderadaDiscapacidad: ESCALA_EXTREMADURA_ID_DISCAPACIDAD },
      'II':             { escalaPonderada: ESCALA_EXTREMADURA_ID, escalaPonderadaDiscapacidad: ESCALA_EXTREMADURA_ID_DISCAPACIDAD },
      'II-ascendiente': { escalaPonderada: ESCALA_EXTREMADURA_ID, escalaPonderadaDiscapacidad: ESCALA_EXTREMADURA_ID_DISCAPACIDAD },
      'III':            { porcentaje: 0 },
      'IV':             { porcentaje: 0 },
    },
    notas: 'Grupos I y II: bonificación del 99 % de la cuota por la parte de base liquidable hasta 300.000 € y del 50 % por la parte entre 300.000 y 600.000 € (450.000 y 750.000 € con discapacidad); lo que pasa de ese límite no se bonifica. Si la base imponible supera 10.000 €, exige documento público. Las donaciones al mismo donatario en los tres años anteriores se acumulan para fijar el porcentaje, y en metálico hay requisitos de pago y de justificación del origen: esta estimación no los aplica.',
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
