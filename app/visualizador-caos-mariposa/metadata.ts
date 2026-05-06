import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Caos y Efecto Mariposa: El Atractor de Lorenz | meskeIA',
  description:
    'Visualiza el atractor de Lorenz y el efecto mariposa: dos trayectorias casi idénticas que divergen completamente. Caos determinista, sensibilidad a condiciones iniciales y sistemas caóticos reales.',
  keywords: [
    'efecto mariposa caos',
    'atractor de Lorenz visualizador',
    'caos determinista',
    'sensibilidad condiciones iniciales',
    'exponente Lyapunov',
    'sistemas caóticos ejemplos',
    'bifurcación logística',
    'predicción meteorología límites',
  ],
  openGraph: {
    title: 'Caos y Efecto Mariposa: El Atractor de Lorenz',
    description:
      'Dos trayectorias separadas por 0.01 que acaban en lugares completamente distintos. El caos visualizado.',
    type: 'website',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
};
