import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Visualizador de Energía Nuclear | Fisión, Fusión y Comparativa | meskeIA',
  description: 'Explora la fisión nuclear (reacción en cadena, reactores PWR/BWR), la fusión (tokamak, ITER) y la comparativa de CO₂ y densidad energética con otras fuentes.',
  keywords: ['energia nuclear', 'fision', 'fusion', 'reactor nuclear', 'ITER', 'tokamak', 'uranio', 'neutrones', 'CO2 nuclear'],
  openGraph: {
    title: 'Visualizador de Energía Nuclear | meskeIA',
    description: 'Fisión vs fusión, reacción en cadena, tipos de reactor y comparativa con renovables.',
    url: 'https://meskeia.com/visualizador-energia-nuclear/',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
};
