/**
 * Preguntas frecuentes del estimador de costes de divorcio: UNA sola lista para la FAQ visible
 * (page.tsx) y para el FAQPage de metadata.ts, con las cifras sacadas del motor.
 *
 * Hasta el 03/10/2026 eran dos textos escritos a mano que contradecían al cálculo y entre sí
 * (notarial «2-4 semanas» frente a 1–2 meses; contencioso «entre 1 y 3 años» frente a 4–18
 * meses; procurador «250-800 €» por encima del arancel; «Registro Civil unos 50 €»): hallazgos
 * 2792, 2794, 2795, 2796, 2797, 2798 y 2799 del Inspector.
 */

import { ARANCEL_NOTARIAL_DIVORCIO, ARANCEL_PROCURA_FAMILIA, FISCAL_IPREM_META, PORCENTAJES_IVA } from '@/data/fiscal';
import { formatCurrency, formatNumber, formatPercentage } from '@/lib';
import {
  DURACIONES,
  HONORARIOS_ABOGADO_SUPUESTOS,
  calcular,
  umbralesJusticiaGratuita,
  type Entrada,
} from './motor';

export interface PreguntaFrecuente {
  pregunta: string;
  respuesta: string;
}

const eur = (n: number): string => formatCurrency(n);
const horquilla = (r: { min: number; max: number }): string => `${eur(r.min)} y ${eur(r.max)}`;
const meses = (r: { min: number; max: number }): string => `${r.min} y ${r.max} meses`;
const multiplo = (m: number): string => (m === 2 ? 'dos veces' : m === 3 ? 'tres veces' : `${formatNumber(m, 1)} veces`);

const base: Omit<Entrada, 'tipo'> = {
  hijos: false,
  complejidad: 'sin_bienes',
  valorBienes: 0,
  pensionMensual: 0,
  presupuestoAbogado: null,
};

/** Ejemplo de vivienda común liquidada ante notario (el caso del hallazgo 2795). */
const VIVIENDA_EJEMPLO = 150000;

const mutuo = calcular({ ...base, tipo: 'mutuo_acuerdo_judicial' });
const notarial = calcular({ ...base, tipo: 'mutuo_acuerdo_notarial' });
const notarialVivienda = calcular({
  ...base,
  tipo: 'mutuo_acuerdo_notarial',
  complejidad: 'bienes_simples',
  valorBienes: VIVIENDA_EJEMPLO,
});
const contencioso = calcular({ ...base, tipo: 'contencioso' });

const abogadoMutuo = HONORARIOS_ABOGADO_SUPUESTOS.mutuo_acuerdo_judicial.sin_bienes.sinHijos;
const abogadoContencioso = {
  min: HONORARIOS_ABOGADO_SUPUESTOS.contencioso.sin_bienes.sinHijos.min,
  max: HONORARIOS_ABOGADO_SUPUESTOS.contencioso.bienes_complejos.conHijos.max,
};
const iva = formatPercentage(PORCENTAJES_IVA.general / 100, 0);
const recargo = formatPercentage(ARANCEL_PROCURA_FAMILIA.recargoPorRepresentado, 0);
const gratuita = umbralesJusticiaGratuita();

export const PREGUNTAS_FRECUENTES: PreguntaFrecuente[] = [
  {
    pregunta: '¿Cuánto cuesta un divorcio en España?',
    respuesta:
      `Depende sobre todo de si es de mutuo acuerdo o contencioso. Sin hijos ni bienes, esta herramienta estima entre ${horquilla(mutuo.total)} ` +
      `un mutuo acuerdo ante el juzgado (un abogado y un procurador para los dos) y entre ${horquilla(notarial.total)} ante notario. ` +
      `En un contencioso cada cónyuge paga su abogado y su procurador: entre ${horquilla(contencioso.total)} por cónyuge sin hijos ni bienes, y más con ellos. ` +
      'La mayor parte es el abogado, cuyos honorarios son libres; el procurador y el notario tienen arancel oficial. Las personas físicas están exentas de tasas judiciales desde 2015.',
  },
  {
    pregunta: '¿Cuánto cobra un abogado por un divorcio?',
    respuesta:
      'No hay tarifa oficial: los honorarios de abogado son libres desde la Ley 25/2009, que prohibió a los Colegios establecer baremos orientativos, y se pactan con cada profesional (conviene pedir presupuesto por escrito, la hoja de encargo). ' +
      `Las horquillas de esta herramienta son un supuesto propio, no una muestra de precios: entre ${horquilla(abogadoMutuo)} en un mutuo acuerdo sin hijos ni bienes, y entre ${horquilla(abogadoContencioso)} por cónyuge en un contencioso, según hijos y patrimonio. ` +
      'Si ya tienes presupuesto, puedes ponerlo en la herramienta y sustituye a la horquilla.',
  },
  {
    pregunta: '¿Cuánto cobra el procurador en un divorcio?',
    respuesta:
      `El procurador tiene un arancel de máximos (Real Decreto 434/2024, art. 22): ${eur(ARANCEL_PROCURA_FAMILIA.mutuoAcuerdo)} en el divorcio de mutuo acuerdo, con un ${recargo} más por cada cónyuge si representa a los dos (art. 6.1), ` +
      `y ${eur(ARANCEL_PROCURA_FAMILIA.contencioso)} por procurador en el contencioso, más ${eur(ARANCEL_PROCURA_FAMILIA.medidasProvisionales)} si hay medidas provisionales. ` +
      'Se suman la escala del art. 2 sobre una anualidad si se fijan pensiones de alimentos o compensatoria, y un porcentaje de esa escala sobre el activo si se liquidan los bienes. ' +
      `Sin hijos ni bienes, el máximo con IVA (${iva}) es de ${eur(mutuo.procurador?.total ?? 0)} entre los dos en el mutuo acuerdo y de ${eur(contencioso.procurador?.total ?? 0)} por cónyuge en el contencioso.`,
  },
  {
    pregunta: '¿Cuánto cuesta un divorcio notarial?',
    respuesta:
      'Ante notario (Ley 15/2015) solo cabe el mutuo acuerdo sin hijos menores no emancipados ni hijos mayores con medidas judiciales de apoyo atribuidas a los progenitores (Código Civil, arts. 82.2 y 87). ' +
      `Se paga un abogado para los dos y el arancel notarial (Real Decreto 1426/1989): la escritura sin bienes es un documento sin cuantía de ${eur(ARANCEL_NOTARIAL_DIVORCIO.documentoSinCuantia)} más IVA, folios y copias; ` +
      `si se liquidan los gananciales, la escala del arancel se aplica a cada cónyuge por lo que se le adjudica (con una vivienda de ${eur(VIVIENDA_EJEMPLO)} a partes iguales, ${eur(notarialVivienda.notario?.total ?? 0)} con IVA). ` +
      'No hay procurador ni tasas, y la inscripción en el Registro Civil no cuesta nada: la comunica el notario (Ley 20/2011, art. 61).',
  },
  {
    pregunta: '¿Cuánto tarda un divorcio en España?',
    respuesta:
      `Como orientación, que depende mucho de cada notaría y juzgado: ante notario, entre ${meses(DURACIONES.notarial)}; de mutuo acuerdo ante el juzgado, entre ${meses(DURACIONES.mutuoAcuerdoJudicial)}; ` +
      `un contencioso, entre ${meses(DURACIONES.contenciosoSinHijos)} sin hijos y entre ${meses(DURACIONES.contenciosoConHijos)} con hijos, y más si hay recursos. ` +
      'Para pedirlo deben haber pasado tres meses desde la boda, salvo riesgo para el cónyuge o los hijos (Código Civil, art. 81).',
  },
  {
    pregunta: '¿Puedo pedir justicia gratuita para el divorcio?',
    respuesta:
      `Sí, si careces de patrimonio suficiente y tus ingresos brutos anuales no superan ${multiplo(gratuita[0].multiplo)} el IPREM (Ley 1/1996, art. 3.1): entre ${eur(gratuita[0].anual12)} y ${eur(gratuita[0].anual14)} en ${FISCAL_IPREM_META.vigencia}, según se compute el IPREM en 12 o en 14 pagas. ` +
      `El límite sube a ${multiplo(gratuita[1].multiplo)} el IPREM en unidades familiares de menos de cuatro miembros y a ${multiplo(gratuita[2].multiplo)} con cuatro o más o familia numerosa. ` +
      'En un divorcio contencioso hay intereses contrapuestos, así que se valoran solo tus ingresos, no los de la pareja (art. 3.3). Cubre abogado y procurador de oficio.',
  },
  {
    pregunta: '¿Puedo compartir abogado en un divorcio de mutuo acuerdo?',
    respuesta:
      'Sí. En el divorcio de mutuo acuerdo, judicial o notarial, un solo abogado puede asistir a los dos cónyuges, y en el judicial también un solo procurador. Esto reduce mucho el coste.',
  },
  {
    pregunta: '¿Qué es el convenio regulador?',
    respuesta:
      'Es el documento en el que los cónyuges acuerdan las medidas del divorcio: custodia de los hijos, pensión de alimentos, uso de la vivienda, liquidación de los bienes y pensión compensatoria si procede (Código Civil, art. 90). Es obligatorio en el divorcio de mutuo acuerdo.',
  },
];
