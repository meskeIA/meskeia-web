import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Urbanismo y Planificación Urbana | meskeIA',
  description: 'Explora modelos urbanos (Burgess, Hoyt, Harris-Ullman), densidad de ciudades del mundo, movilidad sostenible e indicadores de ciudad sostenible.',
  keywords: ['urbanismo', 'planificación urbana', 'densidad urbana', 'movilidad sostenible', 'ciudad sostenible', 'modelos urbanos'],
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    title: 'Urbanismo y Planificación Urbana — meskeIA',
    description: 'Modelos de ciudad, densidad urbana, movilidad y sostenibilidad en una herramienta visual.',
    url: 'https://meskeia.com/visualizador-urbanismo/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    type: 'website',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Urbanismo y Planificación Urbana',
    description: 'Modelos urbanos, densidad de ciudades del mundo, movilidad y sostenibilidad. Herramienta visual educativa.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Visualizador de Urbanismo',
  description: 'Herramienta educativa sobre urbanismo, modelos urbanos y planificación de ciudades',
  url: 'https://meskeia.com/visualizador-urbanismo/',
  applicationCategory: 'EducationalApplication',
  inLanguage: 'es',
  isAccessibleForFree: true,
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
};
