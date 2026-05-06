import { Metadata } from 'next';

const title = 'Orientador de Justicia Gratuita 2026 — ¿Tienes derecho a abogado gratis? | meskeIA';
const description = 'Comprueba si cumples los requisitos para acceder a justicia gratuita en España. Test según ingresos, IPREM 2026, situación familiar y prestaciones cubiertas.';

export const metadata: Metadata = {
  title,
  description,
  keywords: 'justicia gratuita españa requisitos, abogado gratis, abogado de oficio requisitos, IPREM justicia gratuita 2026, como pedir justicia gratuita, turno de oficio, asistencia juridica gratuita',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Orientador de Justicia Gratuita 2026 | meskeIA',
    description,
    url: 'https://meskeia.com/orientador-justicia-gratuita/',
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
    title: 'Orientador de Justicia Gratuita 2026 | meskeIA',
    description: 'Test: ¿tienes derecho a abogado y procurador de oficio en España?',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Orientador de Justicia Gratuita 2026',
  description,
  url: 'https://meskeia.com/orientador-justicia-gratuita/',
  applicationCategory: 'FinanceApplication',
  operatingSystem: 'All',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
  author: { '@type': 'Organization', name: 'meskeIA', url: 'https://meskeia.com' },
  inLanguage: 'es',
};
