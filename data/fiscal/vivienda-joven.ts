/**
 * data/fiscal/vivienda-joven.ts
 *
 * Ayudas a la emancipación de las personas jóvenes del Plan Estatal de Vivienda 2026-2030
 *
 * Real Decreto 326/2026, de 22 de abril (BOE-A-2026-8872, BOE núm. 99 de 23/04/2026).
 * Recoge las dos ayudas del Capítulo IV que consume el catálogo:
 *
 *   · Sección 3.ª (arts. 132-139) — ayuda al ALQUILER para la emancipación juvenil
 *   · Sección 4.ª (arts. 140-145) — ayuda a la COMPRA o autopromoción en municipios
 *     de 10.000 habitantes o menos
 *
 * ⚠️ SUSTITUYE al Bono Alquiler Joven del RD 42/2022 (Plan 2022-2025), y no es una
 * actualización de cifras: cambian los límites de renta y su estructura. Donde el RD
 * 42/2022 fijaba 600 €/mes ampliables a 900 € en zona tensionada, el RD 326/2026 fija
 * 1.000 € para vivienda y 600 € para habitación, con 500/250 en municipios pequeños y
 * sin la figura del «tope ampliado por zona tensionada» (art. 135: la CA puede subir el
 * máximo, pero solo con acuerdo previo del Ministerio). Confundir ambas convocatorias es
 * el error que este módulo existe para impedir — estaba en producción hasta el 23/08/2026.
 *
 * Verificado el 23/08/2026 artículo por artículo contra el texto del BOE (fuente de
 * nivel 1 del manifiesto). Cada constante lleva el artículo del que sale.
 *
 * ⚠️ El RD fija el MARCO. Cada comunidad autónoma concreta su convocatoria y puede
 * endurecer requisitos o elevar la renta máxima (art. 135). Ninguna app debe presentar
 * estas cifras como la resolución de un caso concreto.
 */

/*
 * Re-verificado el 28/09/2026 contra el texto consolidado del BOE (arts. 8, 132-139 y 140-145):
 * todas las cifras de los tres objetos coinciden, y se añaden a BONO_ALQUILER_JOVEN_2026 el
 * contrato (art. 133.1.a), las exclusiones del art. 133.2, el cambio de domicilio del art. 133.3
 * y las convocatorias permanentes del art. 138 (hallazgos 2388-2397 del Inspector).
 */
export const FISCAL_VIVIENDA_JOVEN_META = {
  fuente: 'Real Decreto 326/2026, de 22 de abril, por el que se regula el Plan Estatal de Vivienda 2026-2030 (BOE-A-2026-8872) — Capítulo IV, secciones 3.ª y 4.ª',
  verificado: '2026-09-28',
  vigencia: '2026-2030',
  urlOficial: 'https://www.boe.es/buscar/act.php?id=BOE-A-2026-8872',
  nota: 'Sustituye al Bono Alquiler Joven del RD 42/2022 (Plan 2022-2025). Las comunidades autónomas concretan cada convocatoria y pueden elevar la renta máxima con acuerdo previo del Ministerio (art. 135).',
};

/** Umbral de ingresos de la persona solicitante, en número de veces el IPREM anual. */
export const UMBRAL_IPREM_VIVIENDA_JOVEN = {
  /** Caso general (arts. 133.1.d y 141.1.a) */
  general: 5,
  /** Discapacidad reconocida ≥ 33 %, o ser hijo o hija de víctima de violencia de género */
  discapacidad33: 5.5,
  /** Discapacidad reconocida ≥ 65 % */
  discapacidad65: 6,
} as const;

/**
 * Sección 3.ª — Ayuda al alquiler para la emancipación de las personas jóvenes
 * (arts. 132 a 139 del RD 326/2026)
 */
export const BONO_ALQUILER_JOVEN_2026 = {
  /** Ayuda mensual máxima en euros, por tipo de alojamiento (art. 137) */
  ayudaMaximaMensual: {
    vivienda: 300,
    habitacion: 200,
  },
  /**
   * La ayuda nunca supera este porcentaje de la renta o precio mensual (art. 137).
   * Es un límite, no una cuantía: la ayuda efectiva es el MENOR de los dos.
   */
  limiteSobreRenta: 0.6,
  /**
   * Renta o precio mensual máximo del contrato para poder acceder (art. 133.1.e).
   * `municipioPequeno` son los municipios o núcleos de 10.000 habitantes o menos.
   */
  rentaMaximaMensual: {
    vivienda: 1000,
    habitacion: 600,
    municipioPequeno: {
      vivienda: 500,
      habitacion: 250,
    },
  },
  /** Edad de la persona beneficiaria (art. 133.1.b + «personas físicas mayores de edad») */
  edad: {
    minima: 18,
    /**
     * «Tener menos de treinta y cinco años, incluida la edad de treinta y cinco años, en el
     * momento de solicitar la ayuda»: la edad se mide al SOLICITAR, no durante el cobro.
     */
    maxima: 35,
    maximaInclusive: true,
  },
  /**
   * Contrato (art. 133.1.a). Hay que ser titular —o estar en condiciones de firmar— un contrato
   * de alquiler o de cesión de uso de vivienda o de habitación.
   *
   * ⚠️ Ninguna letra del art. 133 menciona la fianza, y el contrato NO es el art. 133.1.e, que es
   * solo el tope de renta (`rentaMaximaMensual`). La app lo atribuyó a la letra e) hasta el
   * 28/09/2026 (hallazgo 2390 del Inspector) y por eso exigía una fianza depositada que el RD no
   * pide; el depósito de la fianza o el registro del contrato los puede pedir la comunidad
   * autónoma como requisito adicional (art. 8.1), no el RD.
   */
  contrato: {
    /** La vivienda completa, «formalizado en los términos de la Ley 29/1994» (LAU) */
    viviendaEnTerminosLAU: true,
    /** «Si se trata de alquiler de habitación no es exigible que la formalización sea en los términos de la Ley 29/1994» */
    habitacionEnTerminosLAU: false,
    /** Quien aún no lo tiene firmado debe firmarlo en este plazo desde la notificación de la concesión */
    mesesParaFirmarTrasConcesion: 2,
  },
  /**
   * Situaciones en que «no podrá concederse la ayuda» (art. 133.2). Son exclusiones, no
   * preferencias: cualquiera de ellas impide la concesión.
   */
  exclusiones: {
    /**
     * a) Ser propietaria o usufructuaria de alguna vivienda en España, SALVO que se acredite
     * que no se puede disponer de ella por separación o divorcio, que no se puede habitar por
     * otra causa ajena a la voluntad, o que resulta inaccesible por una discapacidad con un
     * grado reconocido igual o superior a `discapacidadMinimaInaccesible`.
     */
    propiedad: {
      excepciones: ['separacion-divorcio', 'causa-ajena-a-la-voluntad', 'inaccesible-por-discapacidad'],
      discapacidadMinimaInaccesible: 33,
    },
    /** b) Parentesco con la persona arrendadora o cedente, por consanguinidad o afinidad, hasta este grado */
    parentescoArrendadorHastaGrado: 2,
    /**
     * c) Ser socio o partícipe de la persona física o jurídica arrendadora o cedente, salvo
     * cooperativas sin ánimo de lucro en régimen de cesión de uso.
     */
    socioArrendador: true,
  },
  /**
   * Cambio de domicilio dentro de la MISMA comunidad autónoma durante el cobro (art. 133.3).
   * Se conserva la ayuda si el nuevo contrato cumple todos los requisitos y se firma sin
   * interrupción temporal con el anterior; la cuantía se ajusta al nuevo alquiler y nunca sube.
   */
  cambioDomicilio: {
    diasParaComunicar: 15,
    exigeContinuidadEntreContratos: true,
    cuantiaPuedeSubir: false,
  },
  /** Plazo de la ayuda en meses (art. 134): dos años, prorrogables por otros dos como máximo */
  plazo: {
    inicialMeses: 24,
    /** La prórroga es «igual o inferior» y exige acuerdo de la comunidad autónoma */
    prorrogaMaximaMeses: 24,
    totalMaximoMeses: 48,
  },
  /** Incompatible con cualquier otra ayuda al pago del alquiler o la cesión (art. 136) */
  compatibleConOtrasAyudasAlquiler: false,
  /** Las comunidades autónomas convocan la ayuda de forma «continuada y permanente» (art. 138) */
  convocatoriaAbiertaPermanente: true,
} as const;

/**
 * Sección 4.ª — Ayuda a la compra o autopromoción en municipios de 10.000 habitantes
 * o menos para la emancipación de las personas jóvenes (arts. 140 a 145)
 */
export const AYUDA_COMPRA_JOVEN_RURAL_2026 = {
  /** Cuantía máxima por vivienda, en euros (art. 143) */
  ayudaMaxima: 15000,
  /** La ayuda nunca supera este porcentaje del coste de adquisición o construcción (art. 143) */
  limiteSobreCoste: 0.2,
  /** Máximo de personas físicas que pueden adquirir; el importe se reparte por cuota (art. 143) */
  maximoAdquirentes: 2,
  /** Definición de municipio o núcleo de pequeño tamaño (art. 140.3) */
  habitantesMaximoMunicipio: 10000,
  /**
   * Ampliable hasta 20.000 habitantes por acuerdo motivado de la comisión de seguimiento,
   * acreditando la evolución de población y actividad económica con cifras del INE (art. 140.4).
   */
  habitantesMaximoAmpliado: 20000,
  /** El contrato de adquisición debe ser posterior a esta fecha (art. 141.1.a) */
  fechaMinimaContrato: '2026-01-01',
  /** El precio máximo de la vivienda lo fija el anexo IV por comunidad autónoma (art. 141.1.d) */
  precioMaximoSegunAnexoIV: true,
} as const;
