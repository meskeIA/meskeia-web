/**
 * Subastas de inmuebles — depósito para pujar, plazo para pagar el resto y reglas de aprobación
 * del remate, en los tres regímenes que se anuncian en el Portal de Subastas del BOE y en el
 * tablón de la Seguridad Social: judicial (LEC), de la Agencia Tributaria (RGR) y de la
 * Tesorería General de la Seguridad Social por embargo (RGRSS).
 *
 * ⚠️ HERRAMIENTA DE ORIENTACIÓN — No constituye asesoramiento jurídico ni fiscal.
 *
 * FUERA, a propósito (decisión del usuario, 22/10/2026): la subasta NOTARIAL (venta extrajudicial)
 * y la de inmuebles PROPIOS de la Tesorería (patrimonio), porque cada una se rige por su pliego.
 *
 * Todo lo de aquí se leyó el 22/10/2026 en el texto consolidado del BOE (API de datos abiertos):
 *   · LEC (BOE-A-2000-323) arts. 647.1.3.º, 669.1, 670 y 671, en la redacción de la LO 1/2025
 *     (art. 22, en vigor el 03/04/2025) y en la anterior (Ley 19/2015).
 *   · LO 1/2025 (BOE-A-2025-76), disposición transitoria 9.ª.1: la reforma se aplica
 *     «exclusivamente a los procedimientos incoados con posterioridad a su entrada en vigor».
 *   · RGR, RD 939/2005 (BOE-A-2005-14803) arts. 101.f, 103 bis.1 (RD 117/2024) y 104.3.
 *   · RGRSS, RD 1415/2004 (BOE-A-2004-11836) arts. 117.e-g, 118.2 y 120.
 *   · TRLITPAJD (BOE-A-1993-25359) art. 10.2: la base es el valor de referencia si el precio no
 *     lo supera. La DGT lo aplica a las subastas (V0453-22) y lo confirmó el TSJ de Galicia (2026).
 *   · LPH (BOE-A-1960-10906) art. 9.1.e: el adquirente responde con el inmueble de las cuotas de
 *     comunidad de la parte vencida del año en curso y los tres años naturales anteriores.
 *
 * Verificado: 2026-10-22
 */

export const FISCAL_SUBASTAS_META = {
  fuente:
    'LEC arts. 669-671 (LO 1/2025) · RGR arts. 101 y 103 bis · RGRSS arts. 117, 118 y 120 · TRLITPAJD art. 10.2 · LPH art. 9.1.e',
  verificado: '2026-10-22',
  vigencia: '2026',
  urlOficial: 'https://www.boe.es/buscar/act.php?id=BOE-A-2000-323',
  nota: 'Subastas judiciales, de la Agencia Tributaria y de la Seguridad Social por embargo. No cubre las notariales ni las de inmuebles propios de la Tesorería.',
};

/** Fecha de entrada en vigor de la LO 1/2025: separa los dos regímenes de la subasta judicial. */
export const FECHA_REFORMA_SUBASTA_JUDICIAL = '2025-04-03';

export interface ReglaDepositoSubasta {
  /** Porcentaje sobre el valor (judicial) o el tipo (AEAT, Seguridad Social) de subasta */
  porcentaje: number;
  /** Importe mínimo del depósito, si la norma lo fija */
  minimo: number | null;
  norma: string;
}

export const DEPOSITO_SUBASTA = {
  /** Art. 669.1 LEC tras la LO 1/2025. El letrado de la Administración de Justicia puede
   * «elevar o reducir el porcentaje del depósito, considerando las circunstancias». */
  judicial: { porcentaje: 20, minimo: 1000, norma: 'art. 669.1 LEC (LO 1/2025)' },
  /** Art. 669.1 LEC en la redacción de la Ley 19/2015, para los procedimientos incoados antes. */
  judicialAnterior: { porcentaje: 5, minimo: null, norma: 'art. 669.1 LEC (redacción de la Ley 19/2015)' },
  /** Art. 103 bis.1.b RGR: lotes con al menos un inmueble (el 10 % es solo para muebles). */
  aeat: { porcentaje: 5, minimo: null, norma: 'art. 103 bis.1.b del Reglamento General de Recaudación' },
  /** Art. 118.2 RGRSS (y el anuncio, art. 117.e): depósito con la oferta en sobre cerrado «por
   * importe, en todo caso, del 25 por ciento del tipo establecido para la enajenación». */
  seguridadSocialSobre: { porcentaje: 25, minimo: null, norma: 'arts. 117.e y 118.2 del Reglamento General de Recaudación de la Seguridad Social' },
  /** Arts. 117.f y 120.2 RGRSS: quien puja de viva voz sin sobre previo deposita el 30 %. */
  seguridadSocialEnElActo: { porcentaje: 30, minimo: null, norma: 'arts. 117.f y 120.2 del Reglamento General de Recaudación de la Seguridad Social' },
} as const satisfies Record<string, ReglaDepositoSubasta>;

export interface PlazoPagoSubasta {
  dias: number;
  /** Cómo cuenta la norma los días, con sus palabras */
  computo: string;
  norma: string;
}

export const PLAZO_PAGO_SUBASTA = {
  /** Art. 670.1 LEC (LO 1/2025): «En el plazo de veinte días siguientes al cierre de la subasta». */
  judicial: { dias: 20, computo: 'siguientes al cierre de la subasta', norma: 'art. 670.1 LEC (LO 1/2025)' },
  /** Art. 670.1 LEC (Ley 19/2015): «En el plazo de cuarenta días», tras aprobar el remate. */
  judicialAnterior: { dias: 40, computo: 'desde la aprobación del remate', norma: 'art. 670.1 LEC (redacción de la Ley 19/2015)' },
  /** Art. 101.f RGR: «en los 15 días siguientes a que le sea notificada la adjudicación». */
  aeat: { dias: 15, computo: 'siguientes a la notificación de la adjudicación', norma: 'art. 101.f del Reglamento General de Recaudación' },
  /** Art. 117.g RGRSS: «dentro de los cinco días hábiles siguientes al de dicha adjudicación». */
  seguridadSocial: { dias: 5, computo: 'hábiles siguientes al de la adjudicación', norma: 'art. 117.g del Reglamento General de Recaudación de la Seguridad Social' },
} as const satisfies Record<string, PlazoPagoSubasta>;

/**
 * Porcentajes del valor de subasta que deciden qué pasa con la mejor puja en la subasta judicial
 * (arts. 670 y 671 LEC). Los de la redacción anterior solo se usan para explicar la diferencia.
 */
export const UMBRALES_REMATE_JUDICIAL = {
  /** ≥ 70 %: el remate se aprueba al día siguiente del cierre (art. 670.1). */
  aprobacionDirecta: 70,
  /** < 70 %: en 10 días el ejecutado puede presentar a alguien que ofrezca al menos el 60 %
   * (art. 670.3, LO 1/2025). Antes de la reforma debía superar el 70 %. */
  mejoraTercero: 60,
  mejoraTerceroAnterior: 70,
  /** Solo en la redacción anterior: sin mejora, el ejecutante podía pedir la adjudicación por el
   * 70 % o por lo que se le debiera, «siempre que esta cantidad sea superior al sesenta por ciento». */
  adjudicacionEjecutanteAnterior: 60,
  diasMejora: 10,
  /** Sin mejora, se aprueba si la puja llega al 50 %, o al 40 % si cubre todo el crédito del
   * ejecutante (art. 670.3, LO 1/2025). Antes: superar el 50 % o cubrir lo despachado. */
  remateMinimo: 50,
  remateMinimoSiCubreCredito: 40,
  /** Vivienda habitual del deudor: no por menos del 70 %, o del 60 % si cubre lo que se le debe
   * al ejecutante por todos los conceptos (art. 670.3, último párrafo). */
  viviendaHabitual: 70,
  viviendaHabitualSiCubreDeuda: 60,
} as const;

/** Puja mínima en la subasta de la Agencia Tributaria: el 10 % del tipo, salvo cargas iguales o
 * superiores al 25 % de la valoración (art. 104.3 RGR). */
export const PUJA_MINIMA_AEAT = { porcentaje: 10, salvoCargasDesde: 25 } as const;

/** Las posturas de viva voz en la subasta de la Seguridad Social han de ser iguales o superiores
 * al 75 % del tipo (arts. 117.f y 120.3 RGRSS). */
export const POSTURA_VERBAL_MINIMA_SS = 75;

/** Afección de la vivienda a las cuotas de comunidad impagadas (art. 9.1.e LPH): la parte vencida
 * del año de la adquisición y los tres años naturales anteriores. */
export const AFECCION_COMUNIDAD_ANIOS_ANTERIORES = 3;
