import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Ciclo del Nitrógeno | meskeIA',
  description: 'Visualiza el ciclo del nitrógeno: fijación biológica (Rhizobium), industrial (Haber-Bosch), nitrificación, desnitrificación y el impacto humano en los ciclos biogeoquímicos.',
  keywords: ['ciclo del nitrógeno', 'fijación nitrógeno', 'Rhizobium', 'Haber-Bosch', 'nitrificación', 'biogeoquímica', 'biología'],
  openGraph: {
    title: 'Ciclo del Nitrógeno — meskeIA',
    description: 'Ciclo completo del nitrógeno: fijación, nitrificación, desnitrificación e impacto humano.',
    url: 'https://meskeia.com/visualizador-ciclo-nitrogeno/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    type: 'website',
  },
};

export const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Visualizador del Ciclo del Nitrógeno',
  description: 'Herramienta educativa sobre el ciclo biogeoquímico del nitrógeno',
  url: 'https://meskeia.com/visualizador-ciclo-nitrogeno/',
  applicationCategory: 'EducationalApplication',
  inLanguage: 'es',
  isAccessibleForFree: true,
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
};
