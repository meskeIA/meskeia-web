import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pirámide de Población: España 1950-2100 | meskeIA',
  description: 'Visualiza cómo envejece España. Pirámide de población interactiva con datos del INE: desde 1950 hasta las proyecciones del año 2100. Tasa de dependencia y edad mediana.',
  keywords: ['pirámide de población', 'demografía España', 'envejecimiento población', 'INE', 'tasa de dependencia', 'proyecciones demográficas', 'edad mediana España'],
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    title: 'Pirámide de Población: España 1950-2100',
    description: 'Visualiza cómo envejece España con datos del INE y proyecciones hasta 2100.',
    type: 'website',
    url: 'https://meskeia.com/visualizador-piramide-poblacion',
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
    title: 'Pirámide de Población: España 1950-2100',
    description: 'Cómo envejece España: pirámide de población interactiva con datos del INE y proyecciones hasta 2100.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Pirámide de Población meskeIA' },
};
