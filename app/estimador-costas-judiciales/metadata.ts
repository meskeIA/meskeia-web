import { Metadata } from 'next';

const title = 'Estimador de Costas Judiciales 2026 — Cuánto cuesta un juicio en España | meskeIA';
const description = 'Estima el coste orientativo de un procedimiento judicial en España: honorarios de abogado, aranceles de procurador, tasas judiciales y peritos. Por tipo de procedimiento y cuantía.';

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
