/**
 * data/fiscal/legitimas.ts
 * Fracciones de la legítima (herencia forzosa) y del derecho del cónyuge viudo en los siete
 * regímenes civiles que calcula `lib/calculadoras/legitimas.ts` (app `estimador-legitimas`, MCP
 * de Delegum y /api/chatgpt/legitimas).
 *
 * Es derecho civil, no tributario, pero vive aquí por la regla de `data/fiscal` del CLAUDE.md
 * raíz: todo dato normativo con fuente y fecha de verificación, nunca escrito a mano en el motor.
 *
 * Creado el 15/11/2026 (cabo C0763, hallazgo 4738). Cada cifra lleva la cita LITERAL del artículo
 * que la sostiene, copiada del texto consolidado que sirve la API de datos abiertos del BOE
 * (`/datosabiertos/api/legislacion-consolidada/id/<norma>/texto/bloque/<artículo>`, última versión
 * de cada bloque), leída en esa misma sesión:
 *   · Código Civil, BOE-A-1889-4763: arts. 807, 808 (versión de la Ley 8/2021), 809, 834 (Ley
 *     15/2015), 837 (Ley 15/2005) y 838.
 *   · Libro IV del Codi civil de Catalunya (Ley 10/2008), BOE-A-2008-13533: arts. 451-5 (Ley
 *     6/2015) y 452-1 (Ley 25/2010).
 *   · Código del Derecho Foral de Aragón (DLeg 1/2011), BOA-d-2011-90007: arts. 271, 283 y 486.
 *   · Ley 2/2006 de derecho civil de Galicia, BOE-A-2006-14563: arts. 238, 243 y 253.
 *   · Compilación de Baleares (DLeg 79/1990), BOIB-i-1990-90001: arts. 41, 42, 45 (Ley 7/2017),
 *     65 (Ley 7/2017) y 79.
 *   · Ley 5/2015 de Derecho Civil Vasco, BOE-A-2015-8273: arts. 47, 48, 49 y 52.
 *   · Compilación del Derecho Civil Foral de Navarra (Ley 1/1973), BOE-A-1973-330: leyes 253, 267
 *     y 268 (redacción de la Ley Foral 21/2019).
 *
 * Al crearlo NO se cambió ningún valor del motor: todas las fracciones que ya calculaba
 * coincidían con su artículo. Es tipo `fiscal` (nivel 3): cada valor espera el OK del usuario,
 * con su cita, antes de dar el módulo por verificado del todo (cabo de destino `usuario`).
 */

// ─── Metadatos ───────────────────────────────────────────────────────────────

export const FISCAL_LEGITIMAS_META = {
  fuente: 'Código Civil (arts. 807-838) + Libro IV CCCat + CDFA + Ley 2/2006 de Galicia + Compilación de Baleares + Ley 5/2015 vasca + Fuero Nuevo de Navarra',
  verificado: '2026-11-15',
  vigencia: '2026',
  urlOficial: 'https://www.boe.es/buscar/act.php?id=BOE-A-1889-4763',
  nota: 'Fracciones de la legítima de los descendientes y del derecho del cónyuge viudo, cotejadas con el texto consolidado de cada norma.',
};

// ─── Tipos ───────────────────────────────────────────────────────────────────

/** Artículo que sostiene un dato, con su texto literal. */
export interface ReferenciaNormativa {
  /** Norma y su identificador en el BOE (o en el diario autonómico que consolida el BOE). */
  norma: string;
  /** Artículo (o «ley», en el Fuero Nuevo) del que sale el dato. */
  articulo: string;
  /** Texto literal del artículo, o del fragmento que fija el dato. */
  cita: string;
}

/** Fracción del caudal hereditario: el motor la aplica como `(caudal × num) / den`. */
export interface FraccionNormativa extends ReferenciaNormativa {
  num: number;
  den: number;
}

// ─── Normas ──────────────────────────────────────────────────────────────────

const CC = 'Código Civil (BOE-A-1889-4763)';
const CCCAT = 'Libro IV del Codi civil de Catalunya, Ley 10/2008 (BOE-A-2008-13533)';
const CDFA = 'Código del Derecho Foral de Aragón, DLeg 1/2011 (BOA-d-2011-90007)';
const GALICIA = 'Ley 2/2006 de derecho civil de Galicia (BOE-A-2006-14563)';
const BALEARES = 'Compilación del Derecho Civil de las Islas Baleares, DLeg 79/1990 (BOIB-i-1990-90001)';
const PAIS_VASCO = 'Ley 5/2015 de Derecho Civil Vasco (BOE-A-2015-8273)';
const NAVARRA = 'Compilación del Derecho Civil Foral de Navarra, Ley 1/1973 (BOE-A-1973-330)';

// ─── Derecho Común (Código Civil) ────────────────────────────────────────────

const CITA_808 =
  'Constituyen la legítima de los hijos y descendientes las dos terceras partes del haber hereditario de los progenitores. ' +
  'Sin embargo, podrán estos disponer de una parte de las dos que forman la legítima, para aplicarla como mejora a sus hijos o descendientes. ' +
  'La tercera parte restante será de libre disposición.';

const CITA_809 =
  'Constituye la legítima de los padres o ascendientes la mitad del haber hereditario de los hijos y descendientes salvo el caso en que ' +
  'concurrieren con el cónyuge viudo del descendiente causante, en cuyo supuesto será de una tercera parte de la herencia.';

export const LEGITIMAS_COMUN = {
  /** Legítima de los descendientes: 2/3 del haber hereditario. */
  legitimaDescendientes: { norma: CC, articulo: 'art. 808', cita: CITA_808, num: 2, den: 3 },
  /** Legítima estricta: la parte de las dos que NO se aplica como mejora, 1/3 del haber. */
  legitimaEstricta: { norma: CC, articulo: 'art. 808', cita: CITA_808, num: 1, den: 3 },
  /** Legítima de los ascendientes sin cónyuge viudo: la mitad. */
  legitimaAscendientes: { norma: CC, articulo: 'art. 809', cita: CITA_809, num: 1, den: 2 },
  /** Legítima de los ascendientes que concurren con el cónyuge viudo: un tercio. */
  legitimaAscendientesConViudo: { norma: CC, articulo: 'art. 809', cita: CITA_809, num: 1, den: 3 },
  /** Viudo con descendientes: usufructo del tercio de mejora (lo que el motor calcula como `tercioMejora`). */
  usufructoViudoConDescendientes: {
    norma: CC,
    articulo: 'art. 834',
    cita: 'El cónyuge que al morir su consorte no se hallase separado de éste legalmente o de hecho, si concurre a la herencia con hijos o descendientes, tendrá derecho al usufructo del tercio destinado a mejora.',
  },
  /** Viudo con ascendientes y sin descendientes: usufructo de la mitad de la herencia. */
  usufructoViudoConAscendientes: {
    norma: CC,
    articulo: 'art. 837',
    cita: 'No existiendo descendientes, pero sí ascendientes, el cónyuge sobreviviente tendrá derecho al usufructo de la mitad de la herencia.',
    num: 1,
    den: 2,
  },
  /** Viudo sin descendientes ni ascendientes: usufructo de los dos tercios de la herencia. */
  usufructoViudoSinDescendientesNiAscendientes: {
    norma: CC,
    articulo: 'art. 838',
    cita: 'No existiendo descendientes ni ascendientes el cónyuge sobreviviente tendrá derecho al usufructo de los dos tercios de la herencia.',
    num: 2,
    den: 3,
  },
} as const satisfies Record<string, ReferenciaNormativa | FraccionNormativa>;

// ─── Cataluña ────────────────────────────────────────────────────────────────

export const LEGITIMAS_CATALUNA = {
  /** Legítima: la cuarta parte de la cantidad base (art. 451-5). */
  legitima: {
    norma: CCCAT,
    articulo: 'art. 451-5',
    cita: 'La cuantía de la legítima es la cuarta parte de la cantidad base que resulta de aplicar las siguientes reglas: […]',
    num: 1,
    den: 4,
  },
  /** Cuarta viudal: una cantidad según necesidad, con un MÁXIMO de 1/4 del activo hereditario líquido. */
  cuartaViudalMaxima: {
    norma: CCCAT,
    articulo: 'art. 452-1.1',
    cita:
      'El cónyuge viudo o el conviviente en pareja estable que, con los bienes propios, los que puedan corresponderle por razón de liquidación del ' +
      'régimen económico matrimonial y los que el causante le atribuya por causa de muerte o en consideración a esta, no tenga recursos económicos ' +
      'suficientes para satisfacer sus necesidades tiene derecho a obtener en la sucesión del cónyuge o conviviente premuerto la cantidad que sea ' +
      'precisa para atenderlas, hasta un máximo de la cuarta parte del activo hereditario líquido, calculado de acuerdo con lo establecido por el artículo 452-3.',
    num: 1,
    den: 4,
  },
} as const satisfies Record<string, FraccionNormativa>;

// ─── Aragón ──────────────────────────────────────────────────────────────────

export const LEGITIMAS_ARAGON = {
  /** Legítima colectiva: la mitad del caudal para los descendientes. */
  legitimaColectiva: {
    norma: CDFA,
    articulo: 'art. 486.1',
    cita: 'La mitad del caudal fijado conforme al artículo 489 debe recaer en descendientes, de cualquier grado, del causante, que son los únicos legitimarios.',
    num: 1,
    den: 2,
  },
  /** Usufructo de viudedad sobre TODOS los bienes del premuerto. */
  usufructoViudedad: {
    norma: CDFA,
    articulo: 'arts. 271.1 y 283.1',
    cita:
      'La celebración del matrimonio atribuye a cada cónyuge el usufructo de viudedad sobre todos los bienes del que primero fallezca (art. 271.1). ' +
      'El fallecimiento de un cónyuge atribuye al sobreviviente el derecho de usufructo de todos los bienes del premuerto […] (art. 283.1).',
    num: 1,
    den: 1,
  },
} as const satisfies Record<string, FraccionNormativa>;

// ─── Galicia ─────────────────────────────────────────────────────────────────

export const LEGITIMAS_GALICIA = {
  /** Legítima de los descendientes: la cuarta parte del haber hereditario líquido. */
  legitima: {
    norma: GALICIA,
    articulo: 'art. 243',
    cita: 'Constituye la legítima de los descendientes la cuarta parte del valor del haber hereditario líquido que, determinado conforme a las reglas de esta sección, se dividirá entre los hijos o sus linajes.',
    num: 1,
    den: 4,
  },
  /** Viudo con descendientes: usufructo vitalicio de una cuarta parte del haber. */
  usufructoViudoConDescendientes: {
    norma: GALICIA,
    articulo: 'art. 253',
    cita: 'Si concurriera con descendientes del causante, al cónyuge viudo le corresponde en concepto de legítima el usufructo vitalicio de una cuarta parte del haber hereditario fijado conforme a las reglas del artículo 245.',
    num: 1,
    den: 4,
  },
} as const satisfies Record<string, FraccionNormativa>;

// ─── Baleares ────────────────────────────────────────────────────────────────

const CITA_BALEARES_42 =
  'Constituye la legítima de los hijos, por naturaleza y adoptivos y, en representación de los premuertos, de sus descendientes de las clases ' +
  'indicadas, la tercera parte del haber hereditario si fueren cuatro o menos de cuatro, y la mitad si excedieren de este número.';

export const LEGITIMAS_BALEARES = {
  /** Número de hijos hasta el que la legítima es 1/3 (arts. 42 y 79: «cuatro o menos de cuatro»). */
  umbralHijos: {
    norma: BALEARES,
    articulo: 'arts. 42 y 79',
    cita: CITA_BALEARES_42,
    valor: 4,
  },
  /** Cuatro hijos o menos: la tercera parte del haber. */
  legitimaHastaUmbral: { norma: BALEARES, articulo: 'art. 42 (y 79 en Eivissa i Formentera)', cita: CITA_BALEARES_42, num: 1, den: 3 },
  /** Más de cuatro hijos: la mitad. */
  legitimaSobreUmbral: { norma: BALEARES, articulo: 'art. 42 (y 79 en Eivissa i Formentera)', cita: CITA_BALEARES_42, num: 1, den: 2 },
  /** Viudo con descendientes: usufructo de la mitad del haber (Mallorca y Menorca). */
  usufructoViudoConDescendientes: {
    norma: BALEARES,
    articulo: 'art. 45.3 (redacción de la Ley 7/2017)',
    cita: 'En concurrencia con descendientes, la legítima vidual será el usufructo de la mitad del haber hereditario; en concurrencia con padres, el usufructo de dos tercios, y, en los otros supuestos, el usufructo universal.',
    num: 1,
    den: 2,
  },
  /** Menorca sigue el libro I (Mallorca) salvo los arts. 54 a 63. */
  menorca: {
    norma: BALEARES,
    articulo: 'art. 65 (redacción de la Ley 7/2017)',
    cita: 'En la isla de Menorca rige lo dispuesto en el libro I de esta Compilación, a excepción de los artículos 54 a 63.',
  },
} as const;

// ─── País Vasco ──────────────────────────────────────────────────────────────

export const LEGITIMAS_PAIS_VASCO = {
  /** Legítima de los descendientes: un tercio del caudal. */
  legitima: {
    norma: PAIS_VASCO,
    articulo: 'art. 49',
    cita: 'La cuantía de la legítima de los hijos o descendientes es de un tercio del caudal hereditario.',
    num: 1,
    den: 3,
  },
  /** Viudo con descendientes: usufructo de la mitad de todos los bienes. */
  usufructoViudoConDescendientes: {
    norma: PAIS_VASCO,
    articulo: 'art. 52.1',
    cita: 'El cónyuge viudo o miembro superviviente de la pareja de hecho tendrá derecho al usufructo de la mitad de todos los bienes del causante si concurriere con descendientes.',
    num: 1,
    den: 2,
  },
} as const satisfies Record<string, FraccionNormativa>;

// ─── Navarra ─────────────────────────────────────────────────────────────────

export const LEGITIMAS_NAVARRA = {
  /** Legítima formal: sin contenido patrimonial exigible (0 del caudal). */
  legitimaFormal: {
    norma: NAVARRA,
    articulo: 'ley 267 (redacción de la Ley Foral 21/2019)',
    cita:
      'La legítima navarra, tradicionalmente consistente en la atribución de “cinco sueldos ‘febles’ o ‘carlines’ por bienes muebles y una robada ' +
      'de tierra en los montes comunes por inmuebles”, no tiene contenido patrimonial exigible ni atribuye la cualidad de heredero […]',
    num: 0,
    den: 1,
  },
  /** Usufructo de fidelidad: sobre todos los bienes y derechos del premuerto. */
  usufructoFidelidad: {
    norma: NAVARRA,
    articulo: 'ley 253 (redacción de la Ley Foral 21/2019)',
    cita: 'El cónyuge viudo tiene el usufructo sobre todos los bienes y derechos que al premuerto pertenecían en el momento del fallecimiento.',
    num: 1,
    den: 1,
  },
} as const satisfies Record<string, FraccionNormativa>;
