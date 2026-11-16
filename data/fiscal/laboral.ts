/**
 * data/fiscal/laboral.ts
 * Indemnización por despido (ET), su exención en el IRPF y la reducción de jornada por guarda
 * legal con su cómputo en la Seguridad Social.
 *
 * Lo consumen `lib/calculadoras/indemnizacionDespido.ts` (tools `calcular_indemnizacion_despido`
 * y `consulta_despido` del MCP de Delegum) y `lib/calculadoras/reduccionJornada.ts` (tool
 * `calcular_reduccion_jornada`). Es derecho laboral y de Seguridad Social, no tributario, pero
 * vive aquí por la regla de `data/fiscal` del CLAUDE.md raíz: todo dato normativo con fuente y
 * fecha de verificación, nunca escrito a mano en el motor.
 *
 * Creado el 16/11/2026 en la auditoría de los motores con consumidor (hito
 * `auditoria-motores-lib-calculadoras` de la Agenda). Cada cifra lleva la cita LITERAL del
 * artículo que la sostiene, copiada del texto consolidado que sirve la API de datos abiertos del
 * BOE (`/datosabiertos/api/legislacion-consolidada/id/<norma>/texto/bloque/<artículo>`, última
 * versión de cada bloque), leída en esa misma sesión:
 *   · ET (RDLeg 2/2015), BOE-A-2015-11430: arts. 37.6, 53.1 (versión de 03/04/2025), 56.1 y DT 11.ª.
 *   · LGSS (RDLeg 8/2015), BOE-A-2015-11724: art. 237.3 (redacción del RDL 2/2023, vigente desde
 *     el 18/03/2023).
 *   · LIRPF (Ley 35/2006), BOE-A-2006-20764: art. 7.e.
 *
 * Los dos motores escribían estas cifras a mano, con sello de 15/01/2025, y tres estaban mal:
 *   1. El despido improcedente con antigüedad anterior al 12/02/2012 se topaba SIEMPRE en 24
 *      mensualidades. La DT 11.ª.2 deja pasar del tope de 720 días cuando el tramo anterior a esa
 *      fecha ya da más, hasta 42 mensualidades: 30.000 €/año desde el 01/03/1990 salía en
 *      60.000 € y la ley da 81.191 €.
 *   2. El cómputo al 100 % de la cotización durante la reducción de jornada duraba «24 meses»:
 *      son TRES años desde el RDL 2/2023, y alcanzan también al cuidado del familiar (37.6,
 *      párrafo 2.º), que el motor dejaba sin protección.
 *   3. El texto fiscal del despido objetivo y colectivo eximía solo hasta 20 días por año; por
 *      causas ETOP la exención llega a los límites del improcedente (art. 7.e, párrafo 2.º).
 * Es tipo `fiscal` (nivel 3): el usuario dio el OK a las tres correcciones, con su cita a la
 * vista, el 16/11/2026. Ficha de vigilancia: §3.4 del manifiesto.
 */

// ─── Metadatos ───────────────────────────────────────────────────────────────

export const FISCAL_LABORAL_META = {
  fuente: 'Estatuto de los Trabajadores (RDLeg 2/2015, arts. 37.6, 53.1, 56.1 y DT 11.ª) + LGSS (RDLeg 8/2015, art. 237.3) + LIRPF (art. 7.e)',
  verificado: '2026-11-16',
  vigencia: '2026',
  urlOficial: 'https://www.boe.es/buscar/act.php?id=BOE-A-2015-11430',
  nota: 'Días por año de servicio, topes y preaviso del despido; exención de la indemnización en el IRPF; límites de la reducción de jornada por guarda legal y su cómputo al 100 % en la Seguridad Social.',
};

/** Artículo que sostiene un dato, con su texto literal. */
export interface CitaLaboral {
  norma: string;
  articulo: string;
  cita: string;
}

// ─── Despido ─────────────────────────────────────────────────────────────────

export const INDEMNIZACION_DESPIDO = {
  improcedente: {
    diasPorAnio: 33,
    maxMensualidades: 24,
    fuente: {
      norma: 'ET (BOE-A-2015-11430)',
      articulo: 'art. 56.1',
      cita: 'el abono de una indemnización equivalente a treinta y tres días de salario por año de servicio, prorrateándose por meses los periodos de tiempo inferiores a un año, hasta un máximo de veinticuatro mensualidades.',
    } satisfies CitaLaboral,
  },
  /** Contratos anteriores a la reforma de 2012: indemnización dual de la DT 11.ª.2. */
  dualPreReforma: {
    /** Primer día del régimen de 33 días: el tramo de 45 días es el tiempo ANTERIOR a esta fecha. */
    fechaReforma: '2012-02-12',
    diasPorAnioAntes: 45,
    diasPorAnioDespues: 33,
    /** Tope general del importe resultante, en días de salario. */
    topeDias: 720,
    /** Tope absoluto cuando el tramo anterior a 2012 ya supera los 720 días. */
    maxMensualidadesExcepcion: 42,
    fuente: {
      norma: 'ET (BOE-A-2015-11430)',
      articulo: 'DT 11.ª.2',
      cita: 'se calculará a razón de cuarenta y cinco días de salario por año de servicio por el tiempo de prestación de servicios anterior a dicha fecha, prorrateándose por meses los periodos de tiempo inferiores a un año, y a razón de treinta y tres días de salario por año de servicio por el tiempo de prestación de servicios posterior, prorrateándose igualmente por meses los periodos de tiempo inferiores a un año. El importe indemnizatorio resultante no podrá ser superior a setecientos veinte días de salario, salvo que del cálculo de la indemnización por el periodo anterior al 12 de febrero de 2012 resultase un número de días superior, en cuyo caso se aplicará este como importe indemnizatorio máximo, sin que dicho importe pueda ser superior a cuarenta y dos mensualidades, en ningún caso.',
    } satisfies CitaLaboral,
  },
  objetivo: {
    diasPorAnio: 20,
    maxMensualidades: 12,
    preavisoDias: 15,
    fuente: {
      norma: 'ET (BOE-A-2015-11430)',
      articulo: 'art. 53.1.b y c',
      cita: 'la indemnización de veinte días por año de servicio, prorrateándose por meses los periodos de tiempo inferiores a un año y con un máximo de doce mensualidades. […] Concesión de un plazo de preaviso de quince días, computado desde la entrega de la comunicación personal al trabajador hasta la extinción del contrato de trabajo.',
    } satisfies CitaLaboral,
  },
} as const;

/** Exención de la indemnización por despido en el IRPF. */
export const EXENCION_INDEMNIZACION_DESPIDO_IRPF = {
  /** Límite absoluto del importe exento, en €. */
  limite: 180000,
  /**
   * En el despido colectivo y en el objetivo del art. 52.c ET por causas económicas, técnicas,
   * organizativas, de producción o fuerza mayor, la exención llega a los límites del
   * IMPROCEDENTE, no a los 20 días del objetivo.
   */
  causasEtopHastaLimiteImprocedente: true,
  fuente: {
    norma: 'LIRPF (BOE-A-2006-20764)',
    articulo: 'art. 7.e',
    cita: 'en los supuestos de despidos colectivos realizados, o cuando se extinga el contrato en el supuesto de la letra c) del artículo 52 del mismo texto, siempre que, en ambos casos, se deban a causas económicas, técnicas, organizativas, de producción o por fuerza mayor, quedará exenta la parte de indemnización percibida que no supere los límites establecidos con carácter obligatorio en el mencionado Estatuto para el despido improcedente. […] El importe de la indemnización exenta a que se refiere esta letra tendrá como límite la cantidad de 180.000 euros.',
  } satisfies CitaLaboral,
} as const;

// ─── Reducción de jornada por guarda legal ───────────────────────────────────

export const REDUCCION_JORNADA_GUARDA = {
  /** Párrafos 1.º y 2.º del art. 37.6: menor de 12 años, discapacidad y familiar que no puede valerse. */
  ordinaria: {
    fraccionMinima: 1 / 8,
    fraccionMaxima: 1 / 2,
    fuente: {
      norma: 'ET (BOE-A-2015-11430)',
      articulo: 'art. 37.6, párrafo 1.º',
      cita: 'tendrá derecho a una reducción de la jornada de trabajo diaria, con la disminución proporcional del salario entre, al menos, un octavo y un máximo de la mitad de la duración de aquella.',
    } satisfies CitaLaboral,
  },
  /** Párrafo 3.º del art. 37.6: menor con cáncer u otra enfermedad grave. Sin máximo legal. */
  enfermedadGrave: {
    fraccionMinima: 1 / 2,
    fuente: {
      norma: 'ET (BOE-A-2015-11430)',
      articulo: 'art. 37.6, párrafo 3.º',
      cita: 'tendrá derecho a una reducción de la jornada de trabajo, con la disminución proporcional del salario de, al menos, la mitad de la duración de aquella, para el cuidado, durante la hospitalización o tratamiento continuado, del menor a su cargo afectado por cáncer u otra enfermedad grave',
    } satisfies CitaLaboral,
  },
} as const;

/**
 * Cómputo al 100 % de las cotizaciones durante la reducción de jornada (art. 237.3 LGSS).
 *
 * ⚠️ No es que se COTICE por la jornada completa: se cotiza por la reducida y la Seguridad Social
 * COMPUTA esas cotizaciones incrementadas hasta el 100 % para unas prestaciones concretas. La IT
 * no está entre ellas en los párrafos 1.º y 2.º del art. 37.6; sí en el 3.º (enfermedad grave).
 */
export const COMPUTO_COTIZACION_REDUCCION_JORNADA = {
  /** Años con cómputo al 100 % en los párrafos 1.º y 2.º del art. 37.6 ET. */
  aniosGuardaOrdinaria: 3,
  /** Prestaciones a las que alcanza en ese caso (las del apartado 1 del art. 237). */
  prestacionesGuardaOrdinaria: ['jubilación', 'incapacidad permanente', 'muerte y supervivencia', 'maternidad y paternidad'],
  /** En el párrafo 3.º del art. 37.6 (enfermedad grave) el cómputo dura TODO el periodo. */
  prestacionesEnfermedadGrave: ['jubilación', 'incapacidad permanente', 'muerte y supervivencia', 'nacimiento y cuidado de menor', 'riesgo durante el embarazo', 'riesgo durante la lactancia natural', 'incapacidad temporal'],
  fuente: {
    norma: 'LGSS (BOE-A-2015-11724), redacción del RDL 2/2023',
    articulo: 'art. 237.3',
    cita: 'Las cotizaciones realizadas durante los tres primeros años del período de reducción de jornada por cuidado de menor previsto en el primer párrafo del artículo 37.6 del texto refundido de la Ley del Estatuto de los Trabajadores, se computarán incrementadas hasta el 100 por cien de la cuantía que hubiera correspondido si se hubiera mantenido sin dicha reducción la jornada de trabajo, a efectos de las prestaciones señaladas en el apartado 1. Dicho incremento se referirá igualmente a los tres primeros años en los demás supuestos de reducción de jornada contemplados en el primer y segundo párrafo del mencionado artículo. Las cotizaciones realizadas durante los períodos en que se reduce la jornada en el último párrafo del apartado 4, así como en el tercer párrafo del apartado 6 del artículo 37 […] se computarán incrementadas hasta el 100 por cien […] a efectos de las prestaciones por jubilación, incapacidad permanente, muerte y supervivencia, nacimiento y cuidado de menor, riesgo durante el embarazo, riesgo durante la lactancia natural e incapacidad temporal.',
  } satisfies CitaLaboral,
} as const;
