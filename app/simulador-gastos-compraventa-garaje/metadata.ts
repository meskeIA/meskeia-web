import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';
import {
  RANGO_ITP_OTROS,
  RANGO_AJD_VIVIENDA,
  RANGO_AJD_OTROS,
  tipoGeneralITP,
  CASOS_ESCRITURAR,
  preguntaEscriturar,
  respuestaEscriturar,
} from '@/data/itp-ccaa';
import { IVA_INMUEBLES_2025, PLUSVALIA_MUNICIPAL_META } from '@/data/fiscal';
import { formatNumber } from '@/lib/formatters';

/**
 * Respuesta a «¿Qué ITP paga un garaje de segunda mano?», en UN solo sitio.
 *
 * La importan las tres bocas que la publican: el FAQPage de `generateFAQSchema`, el
 * `faqJsonLd` de abajo y la FAQ VISIBLE de `page.tsx`. Vive aquí porque el hallazgo 624 del
 * Inspector (07/09/2026) salió justamente de que no viviera en ninguna parte: la reparación
 * del 578 (02/09) condicionó el tipo reducido a la vivienda habitual en el JSON-LD y dejó en
 * `page.tsx` la redacción vieja, que se lo prometía al comprador de un garaje suelto. La
 * página se contradecía tres veces —con su propio JSON-LD, con la FAQ visible nº 5 dos
 * párrafos más abajo y con el motor, que llama a `elegirTipoITP` con
 * `viviendaHabitual: false`— y presupuestar de menos es el error caro: en el ejemplo de
 * Andalucía que la propia app publica, el reducido haría creer 630,00 € donde se liquidan
 * 1.260,00 €. Con una sola constante ya no pueden volver a divergir.
 */
/**
 * ⚠️ 24/09/2026 (hallazgo 1582): la respuesta decía «al mismo tipo que los inmuebles
 * residenciales, del 4 % (País Vasco)…», y en el País Vasco el 4 % es solo de la vivienda y de
 * hasta dos garajes transmitidos CON ella; el garaje comprado por separado paga el 7 % (NF 1/2011
 * de Bizkaia, art. 13; NF 18/1987 de Gipuzkoa, art. 11.1). El rango es ahora el de lo que no es
 * vivienda, y los dos tipos vascos se leen del motor.
 */
const ITP_PV_VIVIENDA = formatNumber(tipoGeneralITP('pais-vasco', 'vivienda', 0), 0);
const ITP_PV_OTROS = formatNumber(tipoGeneralITP('pais-vasco', 'otro', 0), 0);

export const RESPUESTA_ITP_GARAJE_SEGUNDA_MANO = `Un garaje comprado por separado tributa por el Impuesto de Transmisiones Patrimoniales (ITP) al tipo general de su comunidad autónoma, que va del ${formatNumber(RANGO_ITP_OTROS.min, 0)}% al ${formatNumber(RANGO_ITP_OTROS.max, 0)}% (tramo más alto de las escalas progresivas de Baleares y Cataluña). En casi todas es el mismo tipo que el de la vivienda; en el País Vasco, no: la vivienda y hasta dos garajes transmitidos con ella pagan el ${ITP_PV_VIVIENDA}%, y el garaje suelto el ${ITP_PV_OTROS}%. Los tipos reducidos para jóvenes, familias numerosas o personas con discapacidad casi siempre exigen que el inmueble sea la vivienda habitual, condición que un garaje suelto no cumple: solo la cumple el garaje adquirido con la vivienda, en el mismo acto.`;

/**
 * Las CUATRO que quedaron fuera del mecanismo del hallazgo 774 y que el 1200 cierra.
 *
 * Seguían escritas dos veces a mano —aquí abajo en `faqJsonLd` y otra vez en la FAQ visible
 * de `page.tsx`— y tres ya habían divergido. La peor era «¿Garaje nuevo o de segunda mano?»:
 * la reparación del hallazgo 670 añadió a la visible «por eso el simulador no calcula ahí el
 * impuesto de la primera transmisión» y no llegó al FAQPage, que es justo el canal que citan
 * los asistentes de IA y justo la frase que avisa de que la app se abstiene en Canarias,
 * Ceuta y Melilla. Es la reparación que el 1158 hizo en trastero y que no se propagó aquí.
 *
 * Van en texto PLANO y sin `<strong>`: el énfasis tipográfico se pierde, pero una sola
 * constante para las dos bocas es lo único que impide que vuelvan a divergir.
 */
export const RESPUESTA_GARAJE_SIN_VIVIENDA = 'Sí. En España no existe ninguna restricción legal que obligue al comprador de un garaje a ser propietario de una vivienda. Cualquier persona puede adquirir una plaza de parking de forma independiente. La única excepción son los garajes vinculados a una promoción específica donde el promotor exige comprarlo junto con la vivienda del mismo edificio.';

export const RESPUESTA_GARAJE_NUEVO_O_SEGUNDA_MANO = `Un garaje de primera transmisión (nuevo, del promotor) paga IVA más AJD: del ${formatNumber(RANGO_AJD_OTROS.min, 1)}% al ${formatNumber(RANGO_AJD_OTROS.max, 1)}% según la comunidad si se compra de forma independiente, y del ${formatNumber(RANGO_AJD_VIVIENDA.min, 0)}% al ${formatNumber(RANGO_AJD_VIVIENDA.max, 1)}% si va vinculado a la vivienda (el País Vasco exime la primera transmisión de la vivienda y de sus garajes, pero no la del garaje independiente). El IVA es del ${formatNumber(IVA_INMUEBLES_2025.anejoVinculado, 0)}% si el garaje va vinculado a la vivienda (máximo 2 plazas, mismo edificio y promotor) y del ${formatNumber(IVA_INMUEBLES_2025.garaje, 0)}% si se adquiere de forma independiente o en un edificio de uso no residencial. En Canarias, Ceuta y Melilla no rige el IVA sino el IGIC o el IPSI, con sus propios tipos: por eso el simulador no calcula ahí el impuesto de la primera transmisión. Un garaje de segunda mano paga ITP al tipo general de la comunidad autónoma. No pueden coexistir ITP e IVA en la misma operación.`;

export const RESPUESTA_PLUSVALIA_GARAJE = `Sí. El vendedor debe pagar el Impuesto sobre el Incremento del Valor de los Terrenos de Naturaleza Urbana (plusvalía municipal) al ayuntamiento donde esté ubicado el garaje. Desde 2021, puede elegir entre el método objetivo y el real, pagando el más favorable. Si vende por menos de lo que compró no hay exención sino un supuesto de no sujeción (art. 104.5 TRLRHL, redacción del RDL 26/2021): el impuesto no llega a devengarse, pero hay que declararlo y acreditar la pérdida con las escrituras de compra y venta. Esta calculadora aplica un tipo del ${formatNumber(PLUSVALIA_MUNICIPAL_META.tipoOrientativo, 0)}% como referencia orientativa habitual; cada ayuntamiento fija su propio tipo, con un máximo legal del ${formatNumber(PLUSVALIA_MUNICIPAL_META.tipoMaximoLegal, 0)}%.`;

export const RESPUESTA_TIPOS_REDUCIDOS_GARAJE = 'Casi todos exigen que el inmueble sea la vivienda habitual del comprador, además del requisito personal (edad, familia numerosa, discapacidad). Un garaje suelto nunca es vivienda habitual, así que el tipo reducido NO aplica aunque el comprador cumpla el resto de condiciones: solo tributa como vivienda habitual cuando se adquiere vinculado a ella, en el mismo acto y edificio. Conviene consultar la normativa específica de tu comunidad, ya que los requisitos varían.';

export const metadata: Metadata = {
  title: 'Simulador Gastos Compraventa Garaje - Calcular ITP y Costes | meskeIA',
  description: 'Calcula los gastos de compra y venta de un garaje o plaza de parking en España. ITP por comunidad autónoma, notaría, registro y plusvalía municipal. Gratis y sin registro.',
  keywords: 'simulador gastos compra venta garaje, gastos compraventa garaje, ITP garaje, comprar garaje impuestos, plaza parking gastos, calculadora garaje españa, escriturar garaje, cuanto cuesta escriturar',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/simulador-gastos-compraventa-garaje/',
  },
  openGraph: {
    type: 'website',
    title: 'Simulador Gastos Compraventa Garaje | meskeIA',
    description: 'Calcula cuánto pagarás en impuestos y gastos al comprar o vender un garaje en España.',
    url: 'https://meskeia.com/simulador-gastos-compraventa-garaje/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{ url: 'https://meskeia.com/og-image.png', width: 1200, height: 630, alt: 'meskeIA' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Simulador Gastos Compraventa Garaje | meskeIA',
    description: 'ITP, notaría, registro y plusvalía en la compraventa de garaje. Calcula gratis.',
    images: ['https://meskeia.com/og-image.png'],
  },
};

const webAppSchema = generateWebAppSchema({
  name: 'Simulador Gastos Compraventa Garaje',
  description: 'Calculadora de gastos de compra y venta de garaje o plaza de parking en España. Incluye ITP por comunidad autónoma, notaría, registro de la propiedad, plusvalía municipal y IRPF del vendedor.',
  url: 'https://meskeia.com/simulador-gastos-compraventa-garaje/',
  category: 'FinanceApplication',
  features: [
    'ITP por comunidad autónoma para garaje comprado por separado',
    `IVA ${IVA_INMUEBLES_2025.anejoVinculado}% (vinculado a vivienda) o ${IVA_INMUEBLES_2025.garaje}% (independiente) en garaje de obra nueva`,
    'Gastos de notaría y registro de la propiedad',
    'Plusvalía municipal del vendedor',
    'IRPF sobre ganancia patrimonial',
    'Preconfigurado para garaje/plaza de parking',
    'Gratuito, sin registro, en español',
  ],
  keywords: ['gastos garaje', 'ITP garaje', 'compraventa garaje', 'plaza parking impuestos', 'España'],
});


/**
 * UN solo FAQPage por URL.
 *
 * ⚠️ 15/09/2026 (hallazgo 846) — la página servía DOS: este jsonLd combinaba el WebApplication
 * con un FAQPage de cinco preguntas y el layout inyectaba además el faqJsonLd de abajo, que
 * las repite todas y añade una sexta. Tres de aquellas cinco respuestas estaban escritas dos
 * veces A MANO en este mismo fichero —solo las que centralizó el hallazgo 774 viajaban en
 * constante— y una ya había divergido («algunas CCAA» frente a «algunas comunidades
 * autónomas»). Las hermanas local-comercial y nave-industrial sirven uno solo, y es el canal
 * que citan los asistentes de IA sin el disclaimer al lado.
 */
export const jsonLd = webAppSchema;

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: preguntaEscriturar(CASOS_ESCRITURAR.garaje.inmueble),
      acceptedAnswer: {
        '@type': 'Answer',
        text: respuestaEscriturar(CASOS_ESCRITURAR.garaje),
      },
    },
    {
      '@type': 'Question',
      name: '¿Se puede comprar un garaje sin ser propietario de una vivienda?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: RESPUESTA_GARAJE_SIN_VIVIENDA,
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué ITP paga un garaje de segunda mano?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: RESPUESTA_ITP_GARAJE_SEGUNDA_MANO,
      },
    },
    {
      '@type': 'Question',
      name: '¿Garaje nuevo o de segunda mano: qué impuesto se paga?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: RESPUESTA_GARAJE_NUEVO_O_SEGUNDA_MANO,
      },
    },
    {
      '@type': 'Question',
      name: '¿El vendedor de un garaje paga plusvalía municipal?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: RESPUESTA_PLUSVALIA_GARAJE,
      },
    },
    {
      '@type': 'Question',
      name: '¿Existen tipos reducidos de ITP para garajes?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: RESPUESTA_TIPOS_REDUCIDOS_GARAJE,
      },
    },
  ],
};
