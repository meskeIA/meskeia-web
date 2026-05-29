import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Calculadora de Huella de Carbono Personal - meskeIA',
  description: 'Calcula tu huella de carbono anual. Analiza el impacto de tu transporte, hogar, alimentación y consumo. Compara con la media española y obtén consejos para reducirla.',
  keywords: 'huella de carbono, calculadora CO2, emisiones personales, sostenibilidad, cambio climático, medio ambiente, huella ecológica, carbono personal',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora de Huella de Carbono Personal - meskeIA',
    description: 'Calcula tu huella de carbono anual y descubre cómo reducir tu impacto ambiental.',
    url: 'https://meskeia.com/calculadora-huella-carbono/',
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
    title: 'Calculadora de Huella de Carbono Personal',
    description: 'Calcula tu huella de carbono anual y descubre cómo reducir tu impacto ambiental.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Calculadora Huella de Carbono meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Calculadora Huella de Carbono",
  description: "Calcula tu huella de carbono anual. Analiza el impacto de tu transporte, hogar, alimentación y consumo. Compara con la media española y obtén consejos para reducirla.",
  url: "https://meskeia.com/calculadora-huella-carbono/",
  category: 'FinanceApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es la huella de carbono y cómo se mide?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La huella de carbono es la cantidad total de gases de efecto invernadero (GEI) emitidos directa o indirectamente por una persona, actividad u organización, expresada en toneladas de CO₂ equivalente (tCO₂eq) al año. Se calcula sumando las emisiones de transporte, hogar, alimentación y consumo de bienes y servicios.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la huella de carbono media de una persona en España?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Según datos del Ministerio para la Transición Ecológica, la huella de carbono media en España es de aproximadamente 5 a 7 toneladas de CO₂ equivalente por persona al año. La media global es de unas 4,7 tCO₂eq. Para limitar el calentamiento a 1,5 °C, los expertos sugieren reducirla a menos de 2 tCO₂eq per cápita para 2050.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué actividad cotidiana genera más emisiones de CO₂?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El transporte (especialmente el coche privado y los vuelos) y la calefacción del hogar con combustibles fósiles son los mayores emisores individuales. Un vuelo de ida y vuelta Madrid-Nueva York genera unas 1,5 tCO₂eq por persona. La alimentación, en particular el consumo de carne roja, también tiene un peso significativo: 1 kg de ternera genera unos 27 kg de CO₂eq.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo puedo reducir mi huella de carbono de forma efectiva?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los cambios de mayor impacto son: reducir o eliminar los vuelos, adoptar una dieta con menos carne roja, usar transporte público o bicicleta en lugar del coche, contratar electricidad de origen renovable y mejorar el aislamiento del hogar. Reducir el consumo de productos nuevos (ropa, electrónica) y optar por segunda mano también contribuye significativamente.',
      },
    },
    {
      '@type': 'Question',
      name: '¿La compensación de carbono es suficiente para neutralizar las emisiones?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La compensación (compra de créditos de carbono para financiar proyectos de reducción de emisiones) puede ser un complemento, pero no sustituye a la reducción directa. La eficacia y permanencia de los proyectos de compensación varía mucho; organismos como la Agencia Europea de Medio Ambiente recomiendan priorizar siempre la reducción en origen y usar la compensación solo para las emisiones que aún no sea posible eliminar.',
      },
    },
  ],
};
