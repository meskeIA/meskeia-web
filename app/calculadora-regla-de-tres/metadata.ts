import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Calculadora Regla de Tres - Simple, Inversa y Compuesta | meskeIA',
  description: 'Calculadora online de regla de tres simple directa, inversa y compuesta. Resuelve proporciones con explicaciones paso a paso y ejemplos prácticos. Gratis y sin registro.',
  keywords: 'regla de tres, regla de tres simple, regla de tres inversa, regla de tres compuesta, proporciones, calculadora proporciones, matematicas, proporcion directa, proporcion inversa',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora Regla de Tres - Simple, Inversa y Compuesta',
    description: 'Resuelve proporciones con regla de tres simple, inversa y compuesta. Explicaciones paso a paso y ejemplos prácticos.',
    url: 'https://meskeia.com/calculadora-regla-de-tres',
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
    title: 'Calculadora Regla de Tres | meskeIA',
    description: 'Resuelve proporciones con regla de tres simple, inversa y compuesta',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Calculadora Regla de Tres meskeIA',
  },
};
