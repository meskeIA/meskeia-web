/**
 * data/fiscal/pensiones-irpf.ts
 * Pensiones y planes de pensiones en el IRPF: el régimen transitorio del rescate de lo aportado
 * hasta 2006 (disposición transitoria 12.ª) y la exención de las pensiones de orfandad (art. 7.h).
 *
 * Nace el 29/10/2026 (cabo C0124). Hasta entonces el 40 % y el plazo de la DT 12.ª eran
 * constantes sin exportar de `lib/calculadoras/rescatePlanPensiones.ts`, y los 22 años del art.
 * 7.h, texto de estimador-irpf-pensionista. Ninguna estaba mal; faltaba el sello. (El otro
 * resto de C0124, el gravamen de loterías, ya tiene módulo propio: `premios-loterias.ts`.)
 *
 * Cotejado en sesión el 29/10/2026:
 *   · Ley 35/2006 (LIRPF, BOE-A-2006-20764), DT 12.ª, en la redacción de la Ley 26/2014
 *     (BOE-A-2014-12327), vigente desde el 01/01/2015, en la API de legislación consolidada:
 *     por la parte de las prestaciones que corresponda a aportaciones «realizadas hasta 31 de
 *     diciembre de 2006» se puede aplicar «la reducción prevista en el artículo 17 del texto
 *     refundido […] vigente a 31 de diciembre de 2006» (ap. 2), y solo «a las prestaciones
 *     percibidas en el ejercicio en el que acaezca la contingencia correspondiente, o en los dos
 *     ejercicios siguientes» (ap. 4). El mismo ap. 4 da plazos especiales a las contingencias de
 *     2011 a 2014 (hasta el octavo ejercicio siguiente) y de 2010 o antes (hasta el 31/12/2018):
 *     los dos están ya vencidos, así que hoy solo vive la regla general.
 *   · RDLeg 3/2004 (TRLIRPF, BOE-A-2004-4347), art. 17.2.b, en el texto publicado (la ley está
 *     derogada y la API no la consolida): «El 40 por ciento de reducción en el caso de las
 *     prestaciones […] que se perciban en forma de capital, siempre que hayan transcurrido más
 *     de dos años desde la primera aportación. El plazo de dos años no resultará exigible en el
 *     caso de prestaciones por invalidez». El 17.2.c la excluye para las cobradas en forma de renta.
 *     Sin texto consolidado no se ha podido cotejar que el apartado siguiera igual hasta el
 *     31/12/2006, que es la redacción a la que remite la DT 12.ª: si alguna vez hay que re-sellar
 *     este bloque a fondo, ese es el hueco.
 *   · LIRPF art. 7.h (última redacción, del RDL 29/2026, vigente desde el 08/10/2026, que no
 *     cambia esta letra): exentas «las pensiones y los haberes pasivos de orfandad y a favor de
 *     nietos y hermanos, menores de veintidós años o incapacitados para todo trabajo, percibidos
 *     de los regímenes públicos de la Seguridad Social y clases pasivas».
 */

// ─── Metadatos ───────────────────────────────────────────────────────────────

export const FISCAL_PENSIONES_IRPF_META = {
  fuente: 'Ley 35/2006 (LIRPF), disposición transitoria 12.ª y art. 7.h; RDLeg 3/2004 (TRLIRPF), art. 17.2.b, vigente a 31/12/2006',
  verificado: '2026-10-29',
  vigencia: '2026',
  urlOficial: 'https://www.boe.es/buscar/act.php?id=BOE-A-2006-20764#dtduodecima',
  nota: 'La reducción del 40 % solo vale para la parte del rescate que corresponda a aportaciones hechas hasta el 31/12/2006, cobrada en forma de capital y en el ejercicio de la contingencia o en los dos siguientes. Lo aportado desde 2007 tributa entero como rendimiento del trabajo.',
};

// ─── Rescate de planes de pensiones: régimen transitorio (DT 12.ª LIRPF) ──────

export const REGIMEN_TRANSITORIO_PLANES = {
  /** Último día de las aportaciones que conservan el régimen anterior (ISO) */
  fechaLimiteAportaciones: '2006-12-31',
  /** % de reducción sobre la parte cobrada en capital (art. 17.2.b TRLIRPF) */
  reduccionCapitalPct: 40,
  /** Años que deben haber pasado desde la primera aportación, salvo invalidez (art. 17.2.b TRLIRPF) */
  aniosDesdePrimeraAportacion: 2,
  /** Ejercicios siguientes al de la contingencia en los que aún se puede cobrar con la reducción (DT 12.ª.4) */
  ejerciciosSiguientesContingencia: 2,
  baseNormativa: 'Disposición transitoria 12.ª LIRPF y art. 17.2.b del TRLIRPF (RDLeg 3/2004) vigente a 31/12/2006',
} as const;

// ─── Pensiones de orfandad y a favor de familiares exentas (art. 7.h LIRPF) ───

export const PENSIONES_ORFANDAD_EXENTAS = {
  /** Exentas si el perceptor es menor de esta edad (o está incapacitado para todo trabajo) */
  menoresDe: 22,
  baseNormativa: 'Art. 7.h LIRPF',
} as const;
