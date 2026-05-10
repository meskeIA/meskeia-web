import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Golden Hour - Calculadora de Luz Dorada y Hora Azul | meskeIA',
  description: 'Calcula las horas de luz dorada y hora azul para fotografía. Amanecer, atardecer, crepúsculos y posición del sol según tu ubicación y fecha.',
  keywords: 'golden hour, hora dorada, hora azul, blue hour, fotografia, amanecer, atardecer, crepusculo, luz natural, posicion sol, planificar fotos',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Golden Hour - Calculadora de Luz Dorada',
    description: 'Planifica tus sesiones de fotos con la mejor luz natural. Calcula golden hour y blue hour.',
    url: 'https://meskeia.com/golden-hour/',
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
    title: 'Golden Hour - meskeIA',
    description: 'Calcula las horas de luz perfecta para fotografía según tu ubicación.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Golden Hour meskeIA',
  },
};
