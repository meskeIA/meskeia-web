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
 *
 * Verificado: 2026-08-26 (textos consolidados del BOE leídos en sesión)
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
  fuente: 'RD 434/2024 (arancel Procura) + Ley 10/2012 y STC 140/2016 (tasas) + LEC tras LO 1/2025',
  verificado: '2026-08-26',
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
  /** Art. 3: cuantía indeterminada, inestimable o sin concepto propio en el arancel. */
  cuantiaIndeterminada: 351.0,
  /** Art. 1.4: tope global por profesional y asunto, sumadas todas sus instancias. */
  topeGlobalPorAsunto: 75000,
  /** Art. 18.d: en juicio ordinario se percibe un 10 % más de lo que dan los arts. 2 o 3. */
  recargoJuicioOrdinario: 0.1,
  /** Art. 24.1: el conjunto de la intervención en el proceso monitorio. */
  monitorio: 47.25,
  /** Art. 25.3: en el cambiario con oposición, un 10 % adicional sobre el art. 2. */
  recargoCambiarioConOposicion: 0.1,
} as const;

// ─── Tasas judiciales (Ley 10/2012, con la nulidad de la STC 140/2016) ────────

/**
 * Cuotas fijas del art. 7.1 Ley 10/2012 que SIGUEN VIGENTES en primera instancia.
 *
 * La STC 140/2016 anuló las de apelación (800 €) y casación (1.200 €) del orden civil
 * y las equivalentes del contencioso y el social; las de instancia no se tocaron.
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
  contencioso: {
    abreviado: 200,
    ordinario: 350,
  },
  /** El orden social no devenga tasa en instancia: solo suplicación y casación. */
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
