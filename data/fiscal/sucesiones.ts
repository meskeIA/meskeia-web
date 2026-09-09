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
  /**
   * Escala MARGINAL sobre la base imponible (hoy solo Cataluña, art. 58 bis Ley 19/2010).
   *
   * No es lo mismo que `escalonado`, y confundirlas cuesta miles de euros: en `escalonado` la
   * base cae en un tramo y se lleva SU porcentaje entero; aquí cada tramo bonifica solo la
   * parte de base que le toca, y el porcentaje final es el medio ponderado del conjunto. Una
   * base de 250.000 € del Grupo II bonifica al 56,00 %, que no es ninguno de los porcentajes
   * de la tabla: sale de 100.000 al 60 % + 100.000 al 55 % + 50.000 al 50 %.
   */
  escalaPonderada?: TramoEscalaBonificacionIS[];
}

/** Un tramo de una escala marginal de bonificación: el marginal se aplica al resto de base. */
export interface TramoEscalaBonificacionIS {
  /** Límite superior del tramo de base imponible (€); `Infinity` en el último. */
  hasta: number;
  /** Porcentaje que bonifica la porción de base imponible comprendida en este tramo. */
  marginal: number;
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
  'II-descendiente': 15956.87,  // El art. 20.2.a LISD no distingue hijo de nieto: mismo importe
  'II-ascendiente': 15956.87,
  'III':            7993.46,
  'IV':             0,
};

/**
 * Cataluña: reducciones por parentesco propias (art. 2 Ley 19/2010).
 *
 * ⚠️ Cataluña SÍ desglosa el Grupo II, y el régimen común NO. Aquí es donde más caro sale
 * confundirlos, porque es la única comunidad sin bonificación general que aplane el error:
 * en las otras 16 el 99 % de bonificación deja la cuota en el entorno de 100 €, y aquí una
 * reducción mal elegida son miles de euros.
 *
 * Hasta el 08/09/2026 la clave 'II' valía 50.000 € —el importe del NIETO— y se la servía a
 * los hijos, que son la inmensa mayoría de quienes usan estas apps, mientras 'II-ascendiente'
 * daba 50.000 € donde la ley dice 30.000 €. Salió al contrastar con ChatGPT una herencia de
 * 250.000 € con vivienda de 180.000 €: nuestras herramientas decían 23.000 € y la Agència
 * Tributària de Catalunya, 0 €.
 */
export const REDUCCIONES_PARENTESCO_CATALUNA_IS: Record<string, number> = {
  'I-conyuge':      100000,  // Cónyuge o pareja estable
  'I-descendiente': 100000,  // Grupo I (<21), antes del incremento por año — ver constantes de abajo
  'II':             100000,  // Hijo o hija de 21 años o más
  'II-descendiente': 50000,  // Resto de descendientes ≥21 (nieto, bisnieto)
  'II-ascendiente':  30000,  // Ascendientes (padre, madre, abuelos)
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

// ─── Reducciones especiales de Cataluña (Ley 19/2010) ────────────────────────
//
// Mismas figuras que las estatales de arriba, con importes propios. Se listan aparte porque
// los dos regímenes conviven en el mismo cálculo y mezclar una constante con otra no da error
// de tipos: da una cifra plausible y equivocada.

/** Art. 2: por cada año de menos de 21 del causahabiente del Grupo I (sobre los 100.000 € base) */
export const REDUCCION_EDAD_MENOR_21_CATALUNA_IS = 12000;
/** Art. 2: tope de la reducción del Grupo I una vez sumado el incremento por edad */
export const REDUCCION_EDAD_MENOR_21_MAX_CATALUNA_IS = 196000;
/** Art. 17: límite de la reducción por vivienda habitual, por el valor CONJUNTO de la vivienda */
export const REDUCCION_VIVIENDA_MAX_CATALUNA_IS = 500000;
/** Art. 17: el límite individual resultante del prorrateo no puede bajar de esta cifra */
export const REDUCCION_VIVIENDA_MIN_INDIVIDUAL_CATALUNA_IS = 180000;
/** Art. 19: años que hay que mantener la vivienda para conservar la reducción */
export const REDUCCION_VIVIENDA_ANIOS_MANTENIMIENTO_CATALUNA_IS = 5;

// ─── Bonificación en cuota de Cataluña (art. 58 bis Ley 19/2010) ─────────────
//
// ⚠️ SON DOS ESCALAS DISTINTAS, no una. El Grupo I (descendientes menores de 21) bonifica
// del 99 % al 20 %, y el Grupo II del 60 % al 0 %: para una base de 250.000 € son 56,00 %
// frente a 97,50 %. Aplicarle al menor la escala del Grupo II le costaría casi la cuota
// entera, así que la distinción no es un detalle de precisión.
//
// El cónyuge y la pareja estable van aparte, con un 99 % fijo que no depende de la base.
//
// Las columnas «Bonificación (%)» que publica la Agència Tributària son el porcentaje MEDIO
// acumulado en cada límite; aquí se guardan solo los marginales, que son el dato primitivo,
// y las medias se recalculan. Las medias oficiales van anotadas en cada línea para poder
// comprobar la transcripción sin volver a la web: las once de cada tabla cuadran.

/** Grupo I catalán (descendientes menores de 21 años), excepto cónyuge o pareja estable. */
export const ESCALA_BONIF_CATALUNA_GRUPO_I_IS: TramoEscalaBonificacionIS[] = [
  { hasta: 100000,   marginal: 99 },  // media acumulada al llegar al límite: 99,00 %
  { hasta: 200000,   marginal: 97 },  // 98,00 %
  { hasta: 300000,   marginal: 95 },  // 97,00 %
  { hasta: 500000,   marginal: 90 },  // 94,20 %
  { hasta: 750000,   marginal: 80 },  // 89,47 %
  { hasta: 1000000,  marginal: 70 },  // 84,60 %
  { hasta: 1500000,  marginal: 60 },  // 76,40 %
  { hasta: 2000000,  marginal: 50 },  // 69,80 %
  { hasta: 2500000,  marginal: 40 },  // 63,84 %
  { hasta: 3000000,  marginal: 25 },  // 57,37 %
  { hasta: Infinity, marginal: 20 },
];

/** Grupo II catalán: hijos y demás descendientes de 21 años o más, y ascendientes. */
export const ESCALA_BONIF_CATALUNA_GRUPO_II_IS: TramoEscalaBonificacionIS[] = [
  { hasta: 100000,   marginal: 60 },  // media acumulada al llegar al límite: 60,00 %
  { hasta: 200000,   marginal: 55 },  // 57,50 %
  { hasta: 300000,   marginal: 50 },  // 55,00 %
  { hasta: 500000,   marginal: 45 },  // 51,00 %
  { hasta: 750000,   marginal: 40 },  // 47,33 %
  { hasta: 1000000,  marginal: 35 },  // 44,25 %
  { hasta: 1500000,  marginal: 30 },  // 39,50 %
  { hasta: 2000000,  marginal: 25 },  // 35,88 %
  { hasta: 2500000,  marginal: 20 },  // 32,70 %
  { hasta: 3000000,  marginal: 10 },  // 28,92 %
  { hasta: Infinity, marginal: 0  },
];

/** Cónyuge o pareja estable: 99 % de la cuota, sin escala (art. 58 bis.1). */
export const BONIF_CONYUGE_CATALUNA_IS = 0.99;

/**
 * Sello propio de la rama catalana. El de arriba (`FISCAL_SUCESIONES_META`) NO se mueve: sigue
 * cubriendo las otras 16 comunidades, y no se ha verificado ninguna de ellas en esta revisión.
 * Un sello que dijera «2026-09-08» para todo el módulo afirmaría un trabajo que no se ha hecho.
 */
export const FISCAL_SUCESIONES_CATALUNA_META = {
  fuente: 'Ley 19/2010, de 7 de junio (arts. 2, 17 y 19) — Agència Tributària de Catalunya',
  verificado: '2026-09-08',
  vigencia: '2026',
  urlOficial: 'https://atc.gencat.cat/es/tributs/isd/herencies/reduccions/',
  urlNorma: 'https://www.boe.es/buscar/act.php?id=BOE-A-2010-10829',
  nota: 'Verificados el desglose del Grupo II, la reducción por vivienda habitual y la bonificación en cuota del art. 58 bis (99 % al cónyuge y dos escalas ponderadas distintas para los Grupos I y II). NO se modelan las reducciones de empresa familiar, participaciones, fincas rústicas ni patrimonio cultural o natural: si la herencia incluye alguna de ellas, la cuota real puede ser bastante menor, y además esas reducciones dividen por dos los porcentajes de bonificación.',
};

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
    // ⚠️ Cataluña NO es territorio foral: los forales son País Vasco y Navarra. Aquí 'foral'
    // se usa como etiqueta interna de «se aparta del régimen común» (tarifa, reducciones y
    // coeficientes propios), que es lo que el motor necesita distinguir. No sirve para
    // rotularla ante el usuario, y por eso el selector del estimador dice «Normativa propia».
    regimen: 'foral',
    bonificaciones: {
      // Art. 58 bis.1: cónyuge y pareja estable, 99 % fijo con independencia de la base.
      'I-conyuge':      { porcentaje: BONIF_CONYUGE_CATALUNA_IS },
      // Art. 58 bis.2: el resto de los Grupos I y II, por escala ponderada — cada grupo la suya.
      'I-descendiente': { escalaPonderada: ESCALA_BONIF_CATALUNA_GRUPO_I_IS },
      'II':             { escalaPonderada: ESCALA_BONIF_CATALUNA_GRUPO_II_IS },
      'II-ascendiente': { escalaPonderada: ESCALA_BONIF_CATALUNA_GRUPO_II_IS },
      // Los Grupos III y IV quedan fuera del art. 58 bis: no tienen bonificación en cuota.
      'III':            { porcentaje: 0 },
      'IV':             { porcentaje: 0 },
    },
    notas: 'Tarifa propia (7%–32%) y reducciones propias de la Ley 19/2010: 100.000 € al cónyuge y al hijo, 50.000 € al resto de descendientes, 30.000 € a los ascendientes, y vivienda habitual al 95% con tope de 500.000 € sobre el valor conjunto. La bonificación del art. 58 bis es del 99% para el cónyuge y por escala ponderada para el resto de los Grupos I y II.',
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
