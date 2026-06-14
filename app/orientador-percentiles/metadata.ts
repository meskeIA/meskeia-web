import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Orientador Percentiles Infantiles - Peso y Talla OMS | meskeIA',
  description: 'Calcula el percentil de peso y talla de tu bebé o niño según las tablas de crecimiento de la OMS. Compara con niños de su misma edad y sexo.',
  keywords: 'calculadora percentiles, percentil peso bebé, percentil talla niño, tablas OMS, crecimiento infantil, curvas crecimiento',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Orientador Percentiles Infantiles - meskeIA',
    description: 'Calcula el percentil de peso y talla de tu hijo según tablas OMS',
    url: 'https://meskeia.com/orientador-percentiles/',
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
    title: 'Orientador Percentiles Infantiles - meskeIA',
    description: 'Calcula el percentil de peso y talla de tu hijo según tablas OMS',
    images: ['https://meskeia.com/og-image.png']
  },
  alternates: { canonical: 'https://meskeia.com/orientador-percentiles/' },
};

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es un percentil de crecimiento?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un percentil indica en qué posición se encuentra un niño respecto a 100 niños de su misma edad y sexo. El percentil 50 es la mediana: la mitad de los niños pesan o miden más, y la otra mitad menos. El percentil 25 de peso significa que el niño pesa más que el 25% de sus iguales y menos que el 75% restante.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué percentil de peso y talla se considera normal?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Se considera rango normal entre el percentil 3 y el percentil 97. Cualquier valor dentro de ese rango es estadísticamente normal. Un niño en percentil 10 de talla está dentro de la normalidad: simplemente es más bajo que la mayoría, pero no por ello tiene un problema de crecimiento.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué tablas de crecimiento usa este orientador?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El orientador utiliza las tablas de crecimiento de la Organización Mundial de la Salud (OMS), el estándar internacional para evaluar el desarrollo de niños de 0 a 5 años. Para niños mayores se usan referencias pediátricas complementarias basadas en estudios de población.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuándo debo preocuparme por el percentil de mi hijo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Consulta al pediatra si el percentil está por debajo del 3 o por encima del 97, si hay un descenso brusco de percentil entre dos revisiones consecutivas (por ejemplo, pasar del 50 al 15 en pocos meses), o si el crecimiento no sigue una curva constante. Este orientador es informativo y no sustituye la valoración médica.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Se puede calcular el percentil de adultos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Este orientador está diseñado para niños de 0 a 60 meses (5 años) usando las tablas de crecimiento de la OMS. Para niños mayores y adultos existen referencias pediátricas y el IMC (Índice de Masa Corporal), que relaciona peso y altura sin comparar con una población de referencia.',
      },
    },
  ],
};

export const jsonLd = generateWebAppSchema({
  name: 'Orientador de Percentiles Infantiles',
  description: 'Calcula el percentil de peso y talla de tu bebé o niño según las tablas de crecimiento de la OMS. Compara con niños de su misma edad y sexo e interpreta el resultado.',
  url: 'https://meskeia.com/orientador-percentiles/',
  category: 'EducationalApplication',
  features: [
    'Cálculo de percentil de peso según edad y sexo',
    'Cálculo de percentil de talla según edad y sexo',
    'Basado en tablas de crecimiento OMS',
    'Interpretación del resultado con rango de normalidad',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'En español',
  ],
  keywords: ['percentil', 'crecimiento infantil', 'peso bebé', 'talla niño', 'tablas OMS', 'pediatría'],
});
