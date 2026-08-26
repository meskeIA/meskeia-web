import { Metadata } from 'next';

const title = 'Estimador de Costas Judiciales 2026 — Cuánto cuesta un juicio en España | meskeIA';
const description = 'Estima el coste orientativo de un procedimiento judicial en España: honorarios de abogado, aranceles de procurador, tasas judiciales, peritos e IVA. Con el límite del tercio del art. 394.3 LEC y el arancel vigente de la Procura.';

export const metadata: Metadata = {
  title,
  description,
  keywords: 'costas judiciales españa, cuanto cuesta un juicio, honorarios abogado juicio, aranceles procurador, tasas judiciales, coste procedimiento judicial, costas procesales',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Estimador de Costas Judiciales 2026 | meskeIA',
    description,
    url: 'https://meskeia.com/estimador-costas-judiciales/',
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
    title: 'Estimador de Costas Judiciales 2026 | meskeIA',
    description: 'Calcula cuánto puede costar un juicio en España: abogado, procurador, tasas y peritos',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Estimador de Costas Judiciales 2026',
  description,
  url: 'https://meskeia.com/estimador-costas-judiciales/',
  applicationCategory: 'FinanceApplication',
  operatingSystem: 'All',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
  author: { '@type': 'Organization', name: 'meskeIA', url: 'https://meskeia.com' },
  inLanguage: 'es',
};

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuánto cuesta un juicio en España en 2026?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Varía según el tipo de procedimiento y la cuantía reclamada. Un juicio verbal sencillo puede rondar los 600-1.500 € de abogado, más el arancel del procurador y el 21 % de IVA sobre ambos; un juicio ordinario complejo supera con facilidad los 5.000-10.000 €. Los conceptos son cuatro: honorarios de abogado (libres), aranceles de procurador (arancel de máximos del RD 434/2024), tasas judiciales (solo personas jurídicas) y, en su caso, el informe pericial. El IVA no es opcional: grava los tres primeros servicios profesionales al tipo general.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Hasta cuánto puedo tener que pagar si me condenan en costas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El artículo 394.3 de la Ley de Enjuiciamiento Civil limita lo que el condenado en costas paga de la parte contraria, en concepto de abogado y demás profesionales no sujetos a arancel, a un tercio de la cuantía del proceso por cada litigante que haya obtenido esa condena. En un pleito de 2.000 € el tope son 666,67 €. El límite decae si el tribunal declara la temeridad del condenado, y los aranceles del procurador quedan fuera de él por estar sujetos a arancel. Si la pretensión es inestimable, a estos solos efectos se valora en 24.000 €.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuándo es obligatorio el procurador en un juicio?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El procurador es preceptivo en la mayoría de procedimientos civiles. No lo es en los juicios verbales determinados por razón de la cuantía cuando ésta no supere los 2.000 €, ni en la petición inicial del monitorio (art. 23.2 LEC), ni en el orden social. Sus derechos se rigen por el arancel del Real Decreto 434/2024, en vigor desde el 2 de mayo de 2024, que derogó el antiguo RD 1373/2003: es un arancel de máximos, con un tope global de 75.000 € por profesional y asunto, y en juicio ordinario se incrementa un 10 %.',
      },
    },
    {
      '@type': 'Question',
      name: '¿El juicio verbal sigue siendo hasta 6.000 euros?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. Desde el 3 de abril de 2025 el juicio verbal cubre las demandas cuya cuantía no exceda de 15.000 €, no de 6.000 €: lo elevó la Ley Orgánica 1/2025 al reformar el artículo 250.2 LEC. Por encima de esa cifra el procedimiento es el juicio ordinario, con un arancel de procurador más alto y tasa judicial de 300 € para las personas jurídicas frente a los 150 € del verbal. Muchos estimadores en línea siguen aplicando el umbral antiguo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto se paga de tasa judicial?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las personas físicas están exentas en todos los órdenes desde marzo de 2015, con independencia de la cuantía. Las personas jurídicas pagan una cuota fija según el procedimiento: 150 € en verbal y cambiario, 300 € en ordinario, 100 € en monitorio y 350 € en el contencioso ordinario. La cuota proporcional a la cuantía del artículo 7.2 de la Ley 10/2012 fue declarada inconstitucional y nula por la sentencia 140/2016 del Tribunal Constitucional, así que ya no se devenga. El monitorio y el verbal de reclamación de cantidad hasta 2.000 € están además exentos por su objeto.',
      },
    },
  ],
};
