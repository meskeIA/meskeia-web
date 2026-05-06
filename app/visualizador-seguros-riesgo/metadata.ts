import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Seguros y Riesgo | meskeIA',
  description: 'Visualiza cómo funcionan los seguros: tipos, cálculo de prima actuarial, pool de riesgo y mutualización. Aprende la matemática detrás de los seguros.',
  keywords: ['seguros', 'riesgo', 'prima de seguro', 'actuario', 'mutualización', 'seguro de vida', 'seguro de salud'],
  openGraph: {
    title: 'Seguros y Riesgo — meskeIA',
    description: 'Cómo funcionan los seguros: prima actuarial, pool de riesgo y tipos de cobertura.',
    url: 'https://meskeia.com/visualizador-seguros-riesgo/',
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
  name: 'Visualizador de Seguros y Riesgo',
  description: 'Herramienta educativa sobre seguros, prima actuarial y gestión del riesgo',
  url: 'https://meskeia.com/visualizador-seguros-riesgo/',
  applicationCategory: 'EducationalApplication',
  inLanguage: 'es',
  isAccessibleForFree: true,
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
};
