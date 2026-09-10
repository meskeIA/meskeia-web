import { Metadata } from 'next';
import { generateWebAppSchema, generateFAQSchema, combineSchemas } from '@/lib/schema-templates';
import { RANGO_ITP, RANGO_AJD } from '@/data/itp-ccaa';
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
export const RESPUESTA_ITP_GARAJE_SEGUNDA_MANO = `El garaje tributa por el Impuesto de Transmisiones Patrimoniales (ITP) al mismo tipo que los inmuebles residenciales de su comunidad autónoma, que va del ${formatNumber(RANGO_ITP.min, 0)}% (País Vasco) al ${formatNumber(RANGO_ITP.max, 0)}% (tramo más alto de las escalas progresivas de Baleares y Cataluña). El garaje se considera inmueble residencial, pero los tipos reducidos para jóvenes, familias numerosas o personas con discapacidad casi siempre exigen que el inmueble sea la vivienda habitual, condición que un garaje suelto no cumple: solo la cumple el garaje adquirido con la vivienda, en el mismo acto.`;

export const metadata: Metadata = {
  title: 'Simulador Gastos Compraventa Garaje - Calcular ITP y Costes | meskeIA',
  description: 'Calcula los gastos de compra y venta de un garaje o plaza de parking en España. ITP por comunidad autónoma, notaría, registro y plusvalía municipal. Gratis y sin registro.',
  keywords: 'simulador gastos compra venta garaje, gastos compraventa garaje, ITP garaje, comprar garaje impuestos, plaza parking gastos, calculadora garaje españa',
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
    'ITP por comunidad autónoma para garaje (tipo residencial)',
    `IVA ${IVA_INMUEBLES_2025.anejoVinculado}% (vinculado a vivienda) o ${IVA_INMUEBLES_2025.garaje}% (independiente) en garaje de obra nueva`,
    'Gastos de notaría y registro de la propiedad',
    'Plusvalía municipal del vendedor',
    'IRPF sobre ganancia patrimonial',
    'Preconfigurado para garaje/plaza de parking',
    'Gratuito, sin registro, en español',
  ],
  keywords: ['gastos garaje', 'ITP garaje', 'compraventa garaje', 'plaza parking impuestos', 'España'],
});

const faqSchema = generateFAQSchema({
  url: 'https://meskeia.com/simulador-gastos-compraventa-garaje/',
  mainEntity: [
    {
      question: '¿Se puede comprar un garaje sin ser propietario de una vivienda?',
      answer: 'Sí. En España no existe ninguna restricción legal que obligue al comprador de un garaje a ser propietario de una vivienda. Cualquier persona puede adquirir una plaza de parking de forma independiente. La única excepción son los garajes vinculados a una promoción específica donde el promotor exige comprarlo junto con la vivienda del mismo edificio.',
    },
    {
      question: '¿Qué ITP paga un garaje de segunda mano?',
      answer: RESPUESTA_ITP_GARAJE_SEGUNDA_MANO,
    },
    {
      question: '¿Garaje nuevo o de segunda mano: qué impuesto se paga?',
      answer: `Un garaje de primera transmisión (nuevo, del promotor) paga IVA más AJD (del ${formatNumber(RANGO_AJD.min, 0)}% al ${formatNumber(RANGO_AJD.max, 1)}% según la comunidad: el País Vasco no lo cobra, por su régimen foral). El IVA es del ${IVA_INMUEBLES_2025.anejoVinculado}% si el garaje va vinculado a la vivienda (máximo 2 plazas, mismo edificio y promotor) y del ${IVA_INMUEBLES_2025.garaje}% si se adquiere de forma independiente o en un edificio de uso no residencial. En Canarias, Ceuta y Melilla no rige el IVA sino el IGIC o el IPSI, con sus propios tipos. Un garaje de segunda mano paga ITP al tipo general de la comunidad autónoma. No pueden coexistir ITP e IVA en la misma operación.`,
    },
    {
      question: '¿El vendedor de un garaje paga plusvalía municipal?',
      // El tipo que la calculadora APLICA (el orientativo del 25 %) se publicó en la FAQ
      // visible al reparar el hallazgo 516 y no llegó a ninguno de los dos FAQPage: uno
      // nombraba solo el 30 %, el máximo legal, así que un asistente de IA respondía con el
      // tipo que la app NO usa, un 20 % por encima (hallazgo 671).
      answer: `Sí. El vendedor debe pagar el Impuesto sobre el Incremento del Valor de los Terrenos de Naturaleza Urbana (plusvalía municipal) al ayuntamiento donde esté ubicado el garaje. Desde 2021, puede elegir entre el método objetivo y el real, pagando el más favorable. Si vende por menos de lo que compró, puede quedar exento acreditando la pérdida. Esta calculadora aplica un tipo del ${PLUSVALIA_MUNICIPAL_META.tipoOrientativo}% como referencia orientativa habitual; cada ayuntamiento fija el suyo, con un máximo legal del ${PLUSVALIA_MUNICIPAL_META.tipoMaximoLegal}%.`,
    },
    {
      question: '¿Existen tipos reducidos de ITP para garajes?',
      answer: 'Casi todos exigen que el inmueble sea la vivienda habitual del comprador, además del requisito personal (edad, familia numerosa, discapacidad). Un garaje suelto nunca es vivienda habitual, así que el tipo reducido NO aplica aunque el comprador cumpla el resto de condiciones: solo tributa como vivienda habitual cuando se adquiere vinculado a ella, en el mismo acto y edificio. Conviene consultar la normativa específica de tu comunidad, ya que los requisitos varían.',
    },
  ],
});

export const jsonLd = combineSchemas(webAppSchema, faqSchema);

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Se puede comprar un garaje sin ser propietario de una vivienda?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí. En España no existe ninguna restricción legal que obligue al comprador de un garaje a ser propietario de una vivienda. Cualquier persona puede adquirir una plaza de parking de forma independiente. La única excepción son los garajes vinculados a una promoción específica donde el promotor exige comprarlo junto con la vivienda del mismo edificio.',
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
        text: `Un garaje de primera transmisión (nuevo, del promotor) paga IVA más AJD (del ${formatNumber(RANGO_AJD.min, 0)}% al ${formatNumber(RANGO_AJD.max, 1)}% según la comunidad: el País Vasco no lo cobra, por su régimen foral). El IVA es del ${IVA_INMUEBLES_2025.anejoVinculado}% si el garaje va vinculado a la vivienda (máximo 2 plazas, mismo edificio y promotor) y del ${IVA_INMUEBLES_2025.garaje}% si se adquiere de forma independiente o en un edificio de uso no residencial. En Canarias, Ceuta y Melilla no rige el IVA sino el IGIC o el IPSI, con sus propios tipos. Un garaje de segunda mano paga ITP al tipo general de la comunidad autónoma. No pueden coexistir ITP e IVA en la misma operación.`,
      },
    },
    {
      '@type': 'Question',
      name: '¿El vendedor de un garaje paga plusvalía municipal?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: `Sí. El vendedor debe pagar el Impuesto sobre el Incremento del Valor de los Terrenos de Naturaleza Urbana (plusvalía municipal) al ayuntamiento donde esté ubicado el garaje. Desde 2021, puede elegir entre el método objetivo y el real, pagando el más favorable. Si vende por menos de lo que compró, puede quedar exento acreditando la pérdida. Esta calculadora aplica un tipo del ${PLUSVALIA_MUNICIPAL_META.tipoOrientativo}% como referencia orientativa habitual; el tipo lo fija cada ayuntamiento hasta el máximo legal del ${PLUSVALIA_MUNICIPAL_META.tipoMaximoLegal}%.`,
      },
    },
    {
      '@type': 'Question',
      name: '¿Existen tipos reducidos de ITP para garajes?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Casi todos exigen que el inmueble sea la vivienda habitual del comprador, además del requisito personal (edad, familia numerosa, discapacidad). Un garaje suelto nunca es vivienda habitual, así que el tipo reducido NO aplica aunque el comprador cumpla el resto de condiciones: solo tributa como vivienda habitual cuando se adquiere vinculado a ella, en el mismo acto y edificio. Conviene consultar la normativa específica de tu comunidad, ya que los requisitos varían.',
      },
    },
  ],
};
