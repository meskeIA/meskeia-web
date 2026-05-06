import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Guía para Invertir - Primeros Pasos en Inversión | meskeIA',
  description: 'Guía para empezar a invertir: interés compuesto, perfil de riesgo, simulador de cartera, plusvalías y planificación. Herramientas gratuitas para principiantes.',
  keywords: 'invertir principiantes, interés compuesto, perfil inversor, cartera inversión, plusvalías, fondos indexados, ahorro inversión, simulador cartera',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Guía para Invertir - meskeIA',
    description: 'Primeros pasos en inversión: desde el ahorro hasta la cartera diversificada.',
    url: 'https://meskeia.com/guia/invertir/',
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
    title: 'Guía para Invertir',
    description: 'Calculadoras y simuladores gratuitos para empezar a invertir.',
    images: ['https://meskeia.com/og-image.png']
  },
};
