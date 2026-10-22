import { Metadata } from 'next';
import { generateWebAppSchema, type FAQItem } from '@/lib/schema-templates';
import {
  DEPOSITO_SUBASTA,
  PLAZO_PAGO_SUBASTA,
  UMBRALES_REMATE_JUDICIAL,
  AFECCION_COMUNIDAD_ANIOS_ANTERIORES,
} from '@/data/fiscal/subastas';
import { formatNumber } from '@/lib/formatters';

/** Porcentaje con el espacio duro de la RAE, para las respuestas que se escriben como texto. */
const pct = (n: number): string => `${formatNumber(n, 0)} %`;
const euros = (n: number): string => `${formatNumber(n, 0)} €`;

const J = DEPOSITO_SUBASTA.judicial;
const JA = DEPOSITO_SUBASTA.judicialAnterior;

export const metadata: Metadata = {
  title: 'Calculadora de Subastas del BOE: depósito, plazo y coste total - meskeIA',
  description:
    'Calcula el depósito para pujar en una subasta judicial, de Hacienda o de la Seguridad Social, el plazo para pagar el resto y el coste total con ITP sobre el valor de referencia.',
  keywords:
    'subastas boe, calculadora subastas boe, depósito subasta judicial, subasta judicial vivienda, subastas hacienda, subastas agencia tributaria, subastas seguridad social, itp subasta, comprar piso en subasta, portal de subastas',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: { canonical: 'https://meskeia.com/calculadora-subastas-boe/' },
  openGraph: {
    type: 'website',
    title: 'Calculadora de Subastas del BOE: depósito, plazo y coste total',
    description:
      'Depósito para pujar, plazo para pagar y coste total de comprar vivienda en subasta judicial, de Hacienda o de la Seguridad Social.',
    url: 'https://meskeia.com/calculadora-subastas-boe/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [
      {
        url: 'https://meskeia.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'meskeIA',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Calculadora de Subastas del BOE',
    description: 'Depósito, plazo de pago y coste total de comprar vivienda en subasta.',
    images: ['https://meskeia.com/og-image.png'],
  },
  other: {
    'application-name': 'Calculadora de Subastas del BOE meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Calculadora de Subastas del BOE',
  description:
    'Calcula el depósito para pujar, el resto que hay que pagar y su plazo, y el coste total de comprar una vivienda en subasta judicial, de la Agencia Tributaria o de la Seguridad Social, con el ITP sobre el valor de referencia del Catastro.',
  url: 'https://meskeia.com/calculadora-subastas-boe/',
  category: 'FinanceApplication',
  features: [
    `Depósito de la subasta judicial antes y después de la LO 1/2025 (${pct(JA.porcentaje)} y ${pct(J.porcentaje)}, mínimo de ${euros(J.minimo)})`,
    'Depósito y plazo de pago de las subastas de la Agencia Tributaria y de la Seguridad Social',
    'ITP sobre el valor de referencia del Catastro cuando la puja queda por debajo',
    'Aviso de lo que pasa con la puja según el porcentaje del valor de subasta',
    'Coste total que dice qué le falta si no conoces cargas, deudas de comunidad o IBI',
    'Funciona 100 % en el navegador, sin registro ni instalación',
  ],
});

export const PREGUNTAS_FRECUENTES: FAQItem[] = [
  {
    question: '¿Cuánto hay que depositar para pujar en una subasta del BOE?',
    answer: `Depende de quién subasta. En la subasta judicial, el ${pct(J.porcentaje)} del valor de subasta con un mínimo de ${euros(J.minimo)} si el procedimiento empezó desde el 3 de abril de 2025 (art. 669.1 LEC, reformado por la LO 1/2025), y el ${pct(JA.porcentaje)} si empezó antes. En la de la Agencia Tributaria, el ${pct(DEPOSITO_SUBASTA.aeat.porcentaje)} del tipo de subasta cuando el lote incluye un inmueble. En la de la Seguridad Social por embargo, el ${pct(DEPOSITO_SUBASTA.seguridadSocialSobre.porcentaje)} del tipo con la oferta en sobre cerrado, o el ${pct(DEPOSITO_SUBASTA.seguridadSocialEnElActo.porcentaje)} si se puja de viva voz en el acto.`,
  },
  {
    question: '¿Cuánto tiempo hay para pagar el resto si ganas la subasta?',
    answer: `En la subasta judicial, ${PLAZO_PAGO_SUBASTA.judicial.dias} días ${PLAZO_PAGO_SUBASTA.judicial.computo} desde la reforma de 2025, y ${PLAZO_PAGO_SUBASTA.judicialAnterior.dias} en los procedimientos anteriores. En la de la Agencia Tributaria, ${PLAZO_PAGO_SUBASTA.aeat.dias} días ${PLAZO_PAGO_SUBASTA.aeat.computo}. En la de la Seguridad Social, ${PLAZO_PAGO_SUBASTA.seguridadSocial.dias} días ${PLAZO_PAGO_SUBASTA.seguridadSocial.computo}. Si no pagas a tiempo, pierdes el depósito.`,
  },
  {
    question: '¿Sobre qué cantidad se paga el ITP de una vivienda comprada en subasta?',
    answer: 'Sobre el valor de referencia del Catastro si tu puja queda por debajo de él, y sobre la puja si la supera: es la regla del art. 10.2 de la ley del impuesto, que la Dirección General de Tributos aplica a las subastas (consulta V0453-22) y que confirmó el Tribunal Superior de Justicia de Galicia en 2026. Quien gana una vivienda muy por debajo de su valor paga el impuesto como si la hubiera comprado a ese valor de referencia. En el País Vasco y Navarra la base la fija su norma foral.',
  },
  {
    question: '¿Qué pasa si mi puja no llega al 70 % del valor de subasta?',
    answer: `En la subasta judicial, una puja de al menos el ${pct(UMBRALES_REMATE_JUDICIAL.aprobacionDirecta)} se aprueba al día siguiente del cierre. Por debajo, el deudor tiene ${UMBRALES_REMATE_JUDICIAL.diasMejora} días para presentar a otra persona que ofrezca al menos el ${pct(UMBRALES_REMATE_JUDICIAL.mejoraTercero)}; si no lo hace, se aprueba tu puja si llega al ${pct(UMBRALES_REMATE_JUDICIAL.remateMinimo)}, o al ${pct(UMBRALES_REMATE_JUDICIAL.remateMinimoSiCubreCredito)} si cubre todo lo que se le debe al acreedor (art. 670 LEC). Si es la vivienda habitual del deudor, no se aprueba por menos del ${pct(UMBRALES_REMATE_JUDICIAL.viviendaHabitual)}, o del ${pct(UMBRALES_REMATE_JUDICIAL.viviendaHabitualSiCubreDeuda)} si cubre la deuda.`,
  },
  {
    question: '¿Qué deudas de la vivienda asume quien la compra en subasta?',
    answer: `Las cargas anteriores a la que se ejecuta, que siguen sobre el inmueble (art. 670.5 LEC); las cuotas de comunidad impagadas del año de la compra y los ${AFECCION_COMUNIDAD_ANIOS_ANTERIORES} años anteriores, de las que responde la vivienda (art. 9 de la Ley de Propiedad Horizontal); y el IBI pendiente, al que la vivienda también queda afecta. La certificación de cargas del anuncio y la administración de la comunidad son las que dan esos importes.`,
  },
  {
    question: '¿Esta calculadora sirve para subastas notariales o de inmuebles de la Seguridad Social?',
    answer: 'No. Cubre las subastas judiciales, las de la Agencia Tributaria y las de la Seguridad Social por embargo a deudores. Las notariales y las de inmuebles propios de la Tesorería General de la Seguridad Social se rigen por el pliego de condiciones de cada subasta, que es el que fija el depósito y los plazos.',
  },
];

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: PREGUNTAS_FRECUENTES.map((f) => ({
    '@type': 'Question',
    name: f.question,
    acceptedAnswer: { '@type': 'Answer', text: f.answer },
  })),
};
