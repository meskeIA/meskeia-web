import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Calculadora de Probabilidad Online - Combinatoria y Estadística | meskeIA',
  description: 'Calcula probabilidades, combinaciones, permutaciones y distribuciones estadísticas. Herramienta completa con simulaciones y teoría de probabilidad.',
  keywords: 'probabilidad, combinatoria, permutaciones, combinaciones, factorial, distribución binomial, estadística, azar',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora de Probabilidad | meskeIA',
    description: 'Calcula probabilidades, combinaciones y permutaciones. Incluye distribuciones estadísticas y simulaciones.',
    url: 'https://meskeia.com/calculadora-probabilidad/',
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
    title: 'Calculadora de Probabilidad | meskeIA',
    description: 'Herramienta completa de probabilidad y combinatoria online.',
    images: ['https://meskeia.com/og-image.png']
  },
};
