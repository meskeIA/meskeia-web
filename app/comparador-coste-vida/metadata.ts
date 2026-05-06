import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Comparador de Coste de Vida entre Ciudades del Mundo | meskeIA',
  description: 'Compara el coste de vida entre más de 55 ciudades: alquiler, restaurantes, supermercado, transporte e internet. Datos de referencia 2024-2025.',
  keywords: [
    'coste de vida',
    'comparador ciudades',
    'vivir en el extranjero',
    'alquiler ciudad',
    'precio vida mundo',
    'nómada digital',
    'mudarse al extranjero',
    'cities cost of living',
    'presupuesto expatriado',
  ],
  openGraph: {
    title: 'Comparador de Coste de Vida | meskeIA',
    description: 'Alquiler, comida, transporte e internet en 55+ ciudades del mundo. Compara y decide dónde vivir.',
    url: 'https://meskeia.com/comparador-coste-vida',
    siteName: 'meskeIA',
    type: 'website',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
  alternates: {
    canonical: 'https://meskeia.com/comparador-coste-vida',
  },
};

export const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Comparador de Coste de Vida entre Ciudades',
  description: 'Compara el coste de vida entre más de 55 ciudades del mundo: alquiler, restaurantes, supermercado, transporte e internet.',
  url: 'https://meskeia.com/comparador-coste-vida',
  applicationCategory: 'UtilitiesApplication',
  operatingSystem: 'Any',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'EUR',
  },
  provider: {
    '@type': 'Organization',
    name: 'meskeIA',
    url: 'https://meskeia.com',
  },
};
