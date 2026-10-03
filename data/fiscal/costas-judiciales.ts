/**
 * Datos normativos: costas judiciales — España
 *
 * ⚠️ HERRAMIENTA DE ORIENTACIÓN — No constituye asesoramiento jurídico.
 *
 * Este módulo reúne SOLO lo que tiene respaldo normativo: el arancel de la Procura,
 * las tasas judiciales y los umbrales procesales de la LEC. Los honorarios de abogado
 * NO están aquí y no pueden estarlo: son libres desde la Ley 25/2009 (Ley Ómnibus), que
 * prohibió a los Colegios publicar baremos orientativos salvo a efectos de tasación de
 * costas. Cualquier escala de honorarios es una estimación de mercado, no un dato
 * normativo, y vive junto a la app que la usa, declarada como tal.
 *
 * Fuentes:
 *   - Real Decreto 434/2024, de 30 de abril, por el que se aprueba el arancel de derechos
 *     de los profesionales de la Procura (BOE-A-2024-8706). En vigor desde el 02/05/2024.
 *     DEROGA el Real Decreto 1373/2003, que es el que citaba media internet —y esta misma
 *     app hasta el 26/08/2026— como si siguiera vivo.
 *   - Ley 10/2012, de 20 de noviembre, de tasas en el ámbito de la Administración de
 *     Justicia (BOE-A-2012-14301), con la nulidad parcial de su art. 7 declarada por la
 *     STC 140/2016, de 21 de julio (BOE-A-2016-7905).
 *   - Ley 1/2000, de 7 de enero, de Enjuiciamiento Civil (BOE-A-2000-323), en la redacción
 *     dada por la Ley Orgánica 1/2025, de 2 de enero, con efectos desde el 03/04/2025.
 *   - Ley 29/1998, reguladora de la Jurisdicción Contencioso-administrativa
 *     (BOE-A-1998-16718), arts. 23 y 139.4: su propio tope de costas, que NO es el de la LEC.
 *   - Ley 36/2011, reguladora de la Jurisdicción Social (BOE-A-2011-15936), arts. 21, 97.3
 *     y 235: en la instancia social no hay condena en costas por vencimiento.
 *
 * Verificado: 2026-10-01 (textos consolidados del BOE leídos en sesión; el 26/08/2026 se
 * leyeron los mismos y el 01/10/2026 se cotejaron de nuevo, con la LJCA y la LRJS añadidas)
 * Vigencia: desde 2025-04-03 (última reforma de la LEC incorporada)
 *
 * ⚠️ ACTUALIZACIÓN NECESARIA:
 *   - El arancel de la Procura se revisa por real decreto; comprobar que el RD 434/2024
 *     sigue vigente y sin modificaciones de cuantías.
 *   - Las tasas judiciales llevan sin tocarse desde 2015, pero cualquier reforma de la
 *     Ley 10/2012 obliga a revisar TASAS_JUDICIALES por completo.
 *   - Los umbrales de la LEC los movió la LO 1/2025 y pueden volver a moverse.
 */

// ─── Metadatos ────────────────────────────────────────────────────────────────

export const COSTAS_JUDICIALES_META = {
  fuente: 'RD 434/2024 (arancel Procura) + Ley 10/2012 y STC 140/2016 (tasas) + LEC tras LO 1/2025 + LJCA y LRJS (costas)',
  verificado: '2026-10-01',
  vigencia: '2025-2026',
  urlOficial: 'https://www.boe.es/buscar/act.php?id=BOE-A-2024-8706',
  nota: 'El arancel de la Procura es de MÁXIMOS: el profesional puede cobrar menos, nunca más. Los honorarios de abogado son libres y no tienen arancel.',
};

// ─── Arancel de los profesionales de la Procura (RD 434/2024) ─────────────────

/**
 * Escala del art. 2 RD 434/2024 — procedimientos de cuantía determinada.
 *
 * Cada entrada es el importe MÁXIMO para las cuantías que no excedan de `hasta`.
 * Es una escala de escalón plano por voluntad del legislador (no progresiva por
 * tramos): la cuantía cae entera en un escalón y devenga ese importe, no la suma
 * de los anteriores.
 */
export const ARANCEL_PROCURA_ESCALA: ReadonlyArray<{ hasta: number; maximo: number }> = [
  { hasta: 60, maximo: 13.01 },
  { hasta: 120, maximo: 23.48 },
  { hasta: 180, maximo: 28.63 },
  { hasta: 240, maximo: 35.15 },
  { hasta: 300, maximo: 40.43 },
  { hasta: 360, maximo: 46.94 },
  { hasta: 420, maximo: 57.28 },
  { hasta: 480, maximo: 63.36 },
  { hasta: 540, maximo: 66.93 },
  { hasta: 600, maximo: 71.39 },
  { hasta: 1200, maximo: 89.25 },
  { hasta: 1800, maximo: 107.1 },
  { hasta: 2400, maximo: 120.49 },
  { hasta: 3000, maximo: 133.87 },
  { hasta: 3600, maximo: 151.71 },
  { hasta: 4200, maximo: 169.56 },
  { hasta: 4800, maximo: 187.42 },
  { hasta: 5400, maximo: 205.27 },
  { hasta: 6000, maximo: 223.11 },
  { hasta: 12000, maximo: 356.99 },
  { hasta: 24000, maximo: 535.5 },
  { hasta: 36000, maximo: 714.0 },
  { hasta: 48000, maximo: 892.5 },
  { hasta: 60000, maximo: 1026.36 },
  { hasta: 90000, maximo: 1115.63 },
  { hasta: 120000, maximo: 1204.88 },
  { hasta: 180000, maximo: 1294.12 },
  { hasta: 240000, maximo: 1383.37 },
  { hasta: 300000, maximo: 1472.62 },
  { hasta: 360000, maximo: 1561.87 },
  { hasta: 420000, maximo: 1651.12 },
  { hasta: 480000, maximo: 1829.61 },
  { hasta: 540000, maximo: 1927.8 },
  { hasta: 600000, maximo: 2079.53 },
];

export const ARANCEL_PROCURA = {
  /** Art. 2.2: por cada 6.000 € o fracción que exceda de 600.000 €. */
  excesoSobre: 600000,
  fraccionExceso: 6000,
  maximoPorFraccion: 15.17,
  /**
   * Art. 3: cuantía indeterminada, inestimable o sin concepto propio en el arancel. Es
   * SUPLETORIO («en aquellos que no tengan fijado expresamente un concepto especial»): el
   * contencioso tiene el suyo en el art. 69.2 (`contenciosoInestimable`).
   */
  cuantiaIndeterminada: 351.0,
  /**
   * Art. 69.2: recursos contencioso-administrativos de cuantía inestimable, según el órgano.
   * La cuantía determinada va por el art. 2 (art. 69.1), sin el 10 % del art. 18.d, que es
   * del juicio ordinario CIVIL.
   */
  contenciosoInestimable: {
    /** a) Juzgados de lo Contencioso-Administrativo. */
    juzgados: 351.11,
    /** b) Juzgados Centrales, Audiencia Nacional y Tribunales Superiores de Justicia. */
    juzgadosCentralesAudienciaNacionalTSJ: 451.41,
    /** c) Tribunal Supremo (cifra corregida en el BOE de 06/06/2024, BOE-A-2024-11486). */
    tribunalSupremo: 401.27,
  },
  /** Art. 1.4: tope global por profesional y asunto, sumadas todas sus instancias. */
  topeGlobalPorAsunto: 75000,
  /** Art. 18.d: en juicio ordinario se percibe un 10 % más de lo que dan los arts. 2 o 3. */
  recargoJuicioOrdinario: 0.1,
  /** Art. 24.1: el conjunto de la intervención en el proceso monitorio. */
  monitorio: 47.25,
  /** Art. 25.3: en el cambiario con oposición, un 10 % adicional sobre el art. 2. */
  recargoCambiarioConOposicion: 0.1,
} as const;

/**
 * Art. 22 RD 434/2024: procesos matrimoniales y de familia. Es concepto ESPECIAL, así que en
 * una separación o un divorcio no rige la cuantía indeterminada del art. 3 (351 €), que es
 * supletoria. Son MÁXIMOS, sin IVA: el precio ofertado no puede superarlos.
 *
 * A lo fijo se suman, si se piden, los derechos del art. 2 sobre una anualidad de alimentos o
 * pensión compensatoria (22.1.b y 22.3.b) y un porcentaje de la escala del art. 2 sobre el
 * activo liquidado (22.1.c y 22.3.c-d).
 *
 * Añadido el 03/10/2026, leído en el BOE consolidado (hallazgos 2792 y 2793 del Inspector:
 * estimador-costes-divorcio escribía a mano entre 250 y 800 € y citaba el art. 3).
 */
export const ARANCEL_PROCURA_FAMILIA = {
  /** 22.1.a: separación o divorcio de mutuo acuerdo o con consentimiento del otro cónyuge. */
  mutuoAcuerdo: 70.21,
  /** 22.2: solicitud o intervención en medidas provisionales, por cada procurador. */
  medidasProvisionales: 70.21,
  /** 22.3.a: separación, divorcio y nulidad contenciosos, por cada procurador. */
  contencioso: 100.31,
  /** 22.1.c: liquidación del régimen económico en el mutuo acuerdo, % de la escala del art. 2 sobre el activo. */
  liquidacionMutuoAcuerdo: 0.25,
  /** 22.3.c: disolución de gananciales en el contencioso, % de la escala del art. 2 sobre el activo. */
  disolucionGananciales: 0.25,
  /** 22.3.c: lo mismo cuando el activo no puede determinarse o es inestimable. */
  disolucionGanancialesInestimable: 50.15,
  /** 22.3.d: liquidación del régimen económico en el contencioso, % de la escala del art. 2 sobre el activo. */
  liquidacionContencioso: 0.5,
  /**
   * Art. 6.1: un procurador que representa a varios poderdantes con una misma dirección y sin
   * diferenciar su defensa devenga una sola cuenta más un 10 % como máximo POR CADA
   * representado. En un mutuo acuerdo con procurador común: × (1 + 2 × 0,10) = × 1,20.
   */
  recargoPorRepresentado: 0.1,
} as const;

// ─── Tasas judiciales (Ley 10/2012, con la nulidad de la STC 140/2016) ────────

/**
 * Cuotas fijas del art. 7.1 Ley 10/2012 que SIGUEN VIGENTES en primera instancia.
 *
 * El fallo de la STC 140/2016 declaró nulas (el texto consolidado las marca en negrilla):
 *   - en el orden CIVIL, solo las de apelación (800 €) y casación y extraordinario por
 *     infracción procesal (1.200 €); las de instancia de abajo siguen vigentes;
 *   - en el CONTENCIOSO, LAS CUATRO: abreviado (200 €), ordinario (350 €), apelación (800 €)
 *     y casación (1.200 €). También las de instancia: en el contencioso no queda tasa.
 *     Hasta el 01/10/2026 este módulo decía lo contrario («las de instancia no se tocaron»)
 *     y la app cobraba 350 € a las personas jurídicas (hallazgo 2550 del Inspector);
 *   - en el SOCIAL, las dos únicas que había: suplicación (500 €) y casación (750 €).
 * Y todo el apartado 2 (la cuota variable): ver `TASAS_JUDICIALES.cuotaVariable`.
 */
export const TASAS_JUDICIALES_CUOTA_FIJA = {
  civil: {
    verbal: 150,
    cambiario: 150,
    ordinario: 300,
    monitorio: 100,
    ejecucionExtrajudicial: 200,
    concursoNecesario: 200,
  },
  /** Sin tasa: la STC 140/2016 anuló sus cuatro cuotas, también las de instancia. */
  contencioso: {
    instancia: 0,
  },
  /**
   * Sin tasa: la Ley 10/2012 no gravaba la instancia social, y sus dos únicas cuotas
   * (suplicación y casación) las anuló la STC 140/2016.
   */
  social: {
    instancia: 0,
  },
} as const;

export const TASAS_JUDICIALES = {
  /**
   * La cuota VARIABLE del art. 7.2 fue declarada inconstitucional y NULA EN SU TOTALIDAD
   * por la STC 140/2016, con efectos desde el 15/08/2016. No existe: cualquier estimador
   * que la siga sumando está cobrando un tributo que no está en el ordenamiento.
   */
  cuotaVariable: null,
  cuotaVariableAnuladaPor: 'STC 140/2016, de 21 de julio (BOE 15/08/2016)',
  /** Art. 4.2.a: exención subjetiva plena, introducida por el RDL 1/2015. */
  personasFisicasExentas: true,
  personasFisicasExentasDesde: '2015-03-01',
  /**
   * Art. 4.1.c: exención OBJETIVA —alcanza también a las personas jurídicas— para la
   * petición inicial del monitorio y el verbal de reclamación de cantidad que no supere
   * los 2.000 €. Decae si la pretensión se funda en un título ejecutivo extrajudicial
   * del art. 517 LEC.
   */
  exencionObjetivaCuantiaHasta: 2000,
  /**
   * Art. 6.2: lo de cuantía indeterminada se valora en 18.000 € «a los solos efectos de
   * establecer la base imponible de esta tasa». No es la valoración del art. 394.3 LEC
   * (24.000 €) ni sirve para la exención del art. 4.1.c, que es del verbal «en reclamación
   * de cantidad»: un asunto indeterminado nunca cae en ella.
   */
  valorCuantiaIndeterminada: 18000,
} as const;

// ─── Umbrales procesales de la LEC ────────────────────────────────────────────

export const UMBRALES_LEC = {
  /**
   * Art. 250.2: cuantía máxima del juicio verbal. La LO 1/2025 la subió de 6.000 € a
   * 15.000 € con efectos del 03/04/2025 — el cambio que dejó caducados a casi todos los
   * estimadores de costas que circulan.
   */
  juicioVerbalHasta: 15000,
  juicioVerbalHastaDesde: '2025-04-03',
  /**
   * Arts. 23.2.1.º y 31.2.1.º: por debajo de esta cuantía no son preceptivos ni procurador
   * ni abogado en el verbal determinado por razón de la cuantía, ni en la petición inicial
   * del monitorio.
   */
  sinAbogadoNiProcuradorHasta: 2000,
  /**
   * Art. 394.3: el condenado en costas solo paga, de la parte correspondiente a abogados y
   * demás profesionales NO sujetos a arancel, hasta un tercio de la cuantía del proceso por
   * cada litigante que obtuvo el pronunciamiento. No se aplica si el tribunal declara la
   * temeridad del condenado.
   */
  limiteCostasFraccion: 1 / 3,
  /** Art. 394.3: a esos solos efectos, las pretensiones inestimables se valoran así. */
  valorPretensionInestimable: 24000,
  valorPretensionInestimableDesde: '2025-04-03',
} as const;

// ─── Costas en el contencioso-administrativo (LJCA) ───────────────────────────

export const COSTAS_LJCA = {
  /**
   * Art. 139.4: en primera o única instancia el condenado paga «una cantidad TOTAL que no
   * exceda de la tercera parte de la cuantía del proceso, por cada uno de los favorecidos».
   * A diferencia del art. 394.3 LEC, el tope abarca TODAS las costas, procurador incluido,
   * y no tiene la excepción por temeridad.
   */
  limiteCostasFraccion: 1 / 3,
  /** Art. 139.4: a esos solos efectos, la cuantía indeterminada se valora así. */
  valorCuantiaIndeterminada: 18000,
  /**
   * Art. 23.1: ante órganos UNIPERSONALES (Juzgados) el procurador es potestativo y el
   * abogado obligatorio; art. 23.2: ante los colegiados (Salas), los dos obligatorios.
   */
  procuradorPotestativoAnteJuzgados: true,
} as const;

// ─── Costas en el orden social (LRJS) ─────────────────────────────────────────

export const COSTAS_LRJS = {
  /**
   * Art. 97.3: en la instancia NO hay condena en costas por vencimiento. Solo por mala fe o
   * temeridad, o por no acudir sin causa a la conciliación o mediación, cabe una sanción
   * pecuniaria y, si el condenado es el EMPRESARIO, los honorarios del abogado o graduado
   * social contrario hasta este límite.
   */
  honorariosInstanciaEmpresarioHasta: 600,
  /** Art. 235.1: en los recursos sí rige el vencimiento, con estos techos de honorarios. */
  honorariosSuplicacionHasta: 1200,
  honorariosCasacionHasta: 1800,
} as const;
