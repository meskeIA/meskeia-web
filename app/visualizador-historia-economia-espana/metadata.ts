import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Historia Económica de España | Cronología Interactiva | meskeIA',
  description: 'Cronología interactiva de la historia económica de España con 14 períodos desde la economía medieval (711) hasta los fondos Next Generation EU. Del Imperio colonial a la integración europea.',
  keywords: ['historia económica España', 'economía española', 'Plan Estabilización 1959', 'desarrollismo', 'burbuja inmobiliaria', 'Next Generation EU', 'cronología'],
  openGraph: {
    title: 'Historia Económica de España | meskeIA',
    description: 'De la plata de América a los fondos europeos: 13 siglos de economía española en una cronología interactiva.',
    url: 'https://meskeia.com/visualizador-historia-economia-espana/',
    type: 'website',
  },
};

export const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'LearningResource',
  name: 'Historia Económica de España',
  description: 'Cronología interactiva de la historia económica de España con 14 períodos históricos.',
  provider: { '@type': 'Organization', name: 'meskeIA' },
};
