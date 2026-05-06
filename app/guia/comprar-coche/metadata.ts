import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Guía para Comprar un Coche en España - Comparador, Financiación y Costes | meskeIA',
  description: 'Guía completa para comprar coche: compara contado vs financiación vs renting, calcula el consumo real, simula el préstamo y elige el seguro adecuado. Herramientas gratuitas.',
  keywords: 'comprar coche españa, comparador vehiculos, financiación coche, renting leasing, consumo combustible, simulador préstamo coche, seguro coche, coste real vehículo',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Guía para Comprar un Coche en España - meskeIA',
    description: 'Todas las herramientas para tomar la mejor decisión al comprar tu próximo coche.',
    url: 'https://meskeia.com/guia/comprar-coche/',
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
    title: 'Guía para Comprar un Coche en España',
    description: 'Comparador de formas de compra, simulador de préstamo y calculadora de consumo gratuitos.',
    images: ['https://meskeia.com/og-image.png']
  },
};
