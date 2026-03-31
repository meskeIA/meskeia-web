import { Metadata } from 'next';

const title = 'Estimador de Costes de Divorcio 2026 — Cuánto cuesta divorciarse en España | meskeIA';
const description = 'Estima el coste orientativo de un divorcio en España según el tipo (mutuo acuerdo o contencioso): abogado, procurador, notario, registro y tasas. Con o sin hijos, bienes comunes.';

export const metadata: Metadata = {
  title,
  description,
  keywords: 'cuanto cuesta divorciarse españa, coste divorcio mutuo acuerdo, precio divorcio contencioso, abogado divorcio precio, divorcio notarial coste, gastos divorcio 2026',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Estimador de Costes de Divorcio 2026 | meskeIA',
    description,
    url: 'https://meskeia.com/estimador-costes-divorcio/',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Estimador de Costes de Divorcio 2026 | meskeIA',
    description: 'Calcula cuánto cuesta divorciarse en España: mutuo acuerdo vs contencioso',
  },
};

export const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Estimador de Costes de Divorcio 2026',
  description,
  url: 'https://meskeia.com/estimador-costes-divorcio/',
  applicationCategory: 'FinanceApplication',
  operatingSystem: 'All',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
  author: { '@type': 'Organization', name: 'meskeIA', url: 'https://meskeia.com' },
  inLanguage: 'es',
};
