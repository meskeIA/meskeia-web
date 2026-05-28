import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Estimador del Impuesto de Donaciones 2025 | meskeIA',
  description: 'Estima el Impuesto de Donaciones en las 17 comunidades autónomas de España. Régimen común, Cataluña, País Vasco y Navarra. Orientación antes de hablar con tu asesor fiscal.',
  keywords: 'impuesto donaciones, ISD donaciones 2025, calculadora donaciones, donaciones CCAA España, estimador donaciones',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Estimador del Impuesto de Donaciones 2025 — meskeIA',
    description: 'Estima el impuesto que pagas al recibir una donación en cualquier CCAA de España.',
    url: 'https://meskeia.com/estimador-impuesto-donaciones/',
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
    title: 'Estimador del Impuesto de Donaciones 2025',
    description: 'Estima el ISD donaciones en las 17 comunidades autónomas. Orientación fiscal antes de acudir al asesor.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Estimador Impuesto de Donaciones",
  description: "Estima el Impuesto de Donaciones en las 17 comunidades autónomas de España. Régimen común, Cataluña, País Vasco y Navarra. Orientación antes de hablar con tu asesor fiscal.",
  url: "https://meskeia.com/estimador-impuesto-donaciones/",
  category: 'FinanceApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es el Impuesto de Donaciones y cuándo se paga?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El Impuesto de Donaciones (ISD, modalidad inter vivos) es un tributo que paga quien recibe una donación de dinero, inmuebles u otros bienes. Se devenga en el momento de la donación y el plazo de autoliquidación es de 30 días hábiles desde la escritura o el acto de entrega. Lo gestiona la comunidad autónoma del donatario (quien recibe), no el donante.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto se paga por recibir una donación de dinero de los padres?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Depende de la comunidad autónoma. Las diferencias son muy grandes: algunas regiones como Madrid, Galicia, Canarias o la Comunidad Valenciana tienen bonificaciones del 75-99% para donaciones entre padres e hijos, lo que puede reducir la cuota casi a cero. En cambio, comunidades con menor bonificación pueden exigir tipos efectivos del 5-15% o más. El parentesco y el valor de la donación también determinan la cuota final.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Es lo mismo el Impuesto de Donaciones que el Impuesto de Sucesiones?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No, aunque forman parte del mismo tributo (ISD). El Impuesto de Sucesiones grava las transmisiones por causa de muerte (herencias y legados), mientras que el Impuesto de Donaciones grava las transmisiones en vida (inter vivos). Usan tarifas similares pero la normativa autonómica puede establecer bonificaciones diferentes para cada modalidad.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo calcula el estimador el impuesto por comunidad autónoma?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El estimador aplica la tarifa estatal según el valor neto recibido, el grupo de parentesco y el patrimonio preexistente del donatario, y luego incorpora los coeficientes multiplicadores y las bonificaciones autonómicas vigentes para 2025. Cubre el régimen común, así como los regímenes forales de Cataluña, País Vasco y Navarra, que tienen normativa propia.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuándo no hay que pagar el Impuesto de Donaciones?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Hay situaciones en las que la cuota puede ser cero o mínima: cuando la comunidad autónoma aplica una bonificación del 99-100% para el grupo I y II de parentesco (hijos, cónyuge, padres), o cuando el importe donado está por debajo de las reducciones personales disponibles. Además, algunas CCAA eximen totalmente donaciones de empresa familiar o vivienda habitual. Consultar siempre con un asesor fiscal antes de formalizar la donación.',
      },
    },
  ],
};
