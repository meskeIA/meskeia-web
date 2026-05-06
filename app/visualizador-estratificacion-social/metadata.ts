import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Estratificación Social | meskeIA',
  description: 'Visualiza modelos de clases sociales, coeficiente Gini, movilidad social intergeneracional y teorías de Marx, Weber y Bourdieu.',
  keywords: ['estratificación social', 'clases sociales', 'coeficiente Gini', 'movilidad social', 'desigualdad', 'sociología'],
  openGraph: {
    title: 'Estratificación Social — meskeIA',
    description: 'Clases sociales, desigualdad (Gini) y movilidad social intergeneracional visualizados.',
    url: 'https://meskeia.com/visualizador-estratificacion-social/',
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
};

export const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Visualizador de Estratificación Social',
  description: 'Herramienta educativa sobre clases sociales, desigualdad y movilidad social',
  url: 'https://meskeia.com/visualizador-estratificacion-social/',
  applicationCategory: 'EducationalApplication',
  inLanguage: 'es',
  isAccessibleForFree: true,
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
};
