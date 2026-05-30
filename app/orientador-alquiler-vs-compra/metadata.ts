import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Orientador Alquiler vs Compra - ¿Qué me conviene más? | meskeIA',
  description: 'Compara alquilar vs comprar vivienda en España. Análisis a 10, 20 y 30 años con hipoteca, IBI, comunidad, seguros y coste de oportunidad de la entrada.',
  keywords: 'alquiler vs compra, comprar piso, alquilar, hipoteca, vivienda, inversion, coste oportunidad, ibi, comunidad',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Orientador Alquiler vs Compra - meskeIA',
    description: '¿Alquilar o comprar? Compara opciones con todos los gastos incluidos',
    url: 'https://meskeia.com/orientador-alquiler-vs-compra/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Orientador Alquiler vs Compra - meskeIA',
    description: '¿Alquilar o comprar vivienda? Descúbrelo con números reales',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Orientador Alquiler vs Compra",
  description: "Compara alquilar vs comprar vivienda en España. Análisis a 10, 20 y 30 años con hipoteca, IBI, comunidad, seguros y coste de oportunidad de la entrada.",
  url: "https://meskeia.com/orientador-alquiler-vs-compra/",
  category: 'FinanceApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es mejor, alquilar o comprar una vivienda?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Depende de tu situación financiera, horizonte temporal y mercado local. En general, comprar suele ser más rentable a largo plazo (más de 15-20 años) si dispones de ahorros para la entrada y los gastos de compra, mientras que alquilar ofrece mayor flexibilidad y menor riesgo a corto plazo. El coste de oportunidad del capital inmovilizado en la entrada es un factor clave que muchas comparativas ignoran.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto dinero necesito ahorrado para comprar un piso?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Como mínimo necesitas entre un 30% y un 35% del precio del inmueble. Los bancos financian habitualmente hasta el 80%, lo que significa que debes aportar el 20% restante más los gastos de compra (notaría, registro, impuestos, gestoría), que suman entre un 10% y un 13% del precio según la comunidad autónoma.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué gastos tiene comprar un piso que no se ven en el precio?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Además del precio de compra, hay que sumar: ITP (6-10% en segunda mano) o IVA + AJD (10-11,5% en obra nueva), notaría, registro, gestoría y tasación. Una vez propietario, se añaden IBI, cuotas de comunidad, seguro de hogar y seguro de vida vinculado a la hipoteca. Estos gastos recurrentes pueden superar los 150-200 €/mes en muchas ciudades.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto tiempo tengo que quedarse en la vivienda comprada para que salga rentable frente al alquiler?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El punto de equilibrio suele situarse entre 7 y 15 años dependiendo de la ciudad, el precio de compra y el alquiler equivalente. En mercados con alta relación precio/alquiler (como Madrid o Barcelona) el umbral es más largo. Este orientador calcula el punto exacto para tus cifras concretas a 10, 20 y 30 años.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el coste de oportunidad de la entrada y por qué importa en la comparativa?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El coste de oportunidad es el rendimiento que podrías obtener invirtiendo el dinero de la entrada (y gastos de compra) en lugar de inmovilizarlo en la vivienda. Si la entrada es de 60.000 € y ese dinero podría crecer al 5% anual en un fondo indexado, en 20 años representaría unos 159.000 €. Ignorar este factor lleva a sobrevalorar la rentabilidad de comprar.',
      },
    },
  ],
};
