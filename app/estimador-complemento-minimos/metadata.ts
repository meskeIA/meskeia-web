import { Metadata } from 'next';

const title = 'Estimador de Complemento a Mínimos 2026 — Pensión mínima garantizada | meskeIA';
const description = 'Estima si tienes derecho al complemento a mínimos de la Seguridad Social. Pensiones mínimas 2026 por tipo (jubilación, viudedad, incapacidad), edad y situación familiar.';

export const metadata: Metadata = {
  title,
  description,
  keywords: 'complemento a minimos 2026, pension minima seguridad social, pension minima jubilacion, pension minima viudedad, complemento minimos requisitos, pension minima incapacidad permanente',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Estimador de Complemento a Mínimos 2026 | meskeIA',
    description,
    url: 'https://meskeia.com/estimador-complemento-minimos/',
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
    title: 'Estimador de Complemento a Mínimos 2026 | meskeIA',
    description: 'Pensiones mínimas 2026: calcula si tienes derecho al complemento a mínimos de la SS',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Estimador Complemento a Mínimos meskeIA',
  },
};

export const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Estimador de Complemento a Mínimos 2026',
  description,
  url: 'https://meskeia.com/estimador-complemento-minimos/',
  applicationCategory: 'FinanceApplication',
  operatingSystem: 'All',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
  author: { '@type': 'Organization', name: 'meskeIA', url: 'https://meskeia.com' },
  inLanguage: 'es',
};
