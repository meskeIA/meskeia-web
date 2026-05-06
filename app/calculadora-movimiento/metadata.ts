import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Calculadora de Movimiento - Cinemática MRU, MRUA, Caída Libre | meskeIA',
  description: 'Calculadora de cinemática con MRU, MRUA, caída libre y tiro parabólico. Calcula velocidad, aceleración, distancia y tiempo con fórmulas y ejemplos prácticos.',
  keywords: 'cinemática, física, MRU, MRUA, caída libre, tiro parabólico, velocidad, aceleración, distancia, tiempo, movimiento',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora de Movimiento - Cinemática | meskeIA',
    description: 'Resuelve problemas de física cinemática: MRU, MRUA, caída libre y tiro parabólico.',
    url: 'https://meskeia.com/calculadora-movimiento/',
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
    title: 'Calculadora de Movimiento - Cinemática | meskeIA',
    description: 'Resuelve problemas de física cinemática: MRU, MRUA, caída libre y tiro parabólico.',
    images: ['https://meskeia.com/og-image.png']
  },
};
