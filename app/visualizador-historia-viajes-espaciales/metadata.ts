import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Historia de los Viajes Espaciales | De Gagarin a Starship | meskeIA',
  description:
    'Cronología interactiva de la exploración espacial: de Tsiolkovski y Goddard (1903) a Gagarin, Apollo 11, la ISS, SpaceX y Artemis. 14 períodos con misiones, protagonistas y el futuro del New Space.',
  keywords: [
    'historia viajes espaciales cronología',
    'Gagarin primer humano espacio Vostok',
    'Apollo 11 Luna Neil Armstrong 1969',
    'SpaceX Falcon 9 reutilizable Starship',
    'ISS estación espacial internacional',
    'Artemis NASA Luna 2024 2025',
    'Sputnik carrera espacial Guerra Fría',
    'turismo espacial Blue Origin Virgin Galactic',
  ],
  openGraph: {
    title: 'Historia de los Viajes Espaciales | meskeIA',
    description:
      'De Tsiolkovski y Gagarin al Starship y Artemis: cronología de 120 años de exploración espacial.',
    url: 'https://meskeia.com/visualizador-historia-viajes-espaciales',
    siteName: 'meskeIA',
    locale: 'es_ES',
    type: 'website',
  },
};

export const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'LearningResource',
  name: 'Historia de los Viajes Espaciales',
  description:
    'Cronología interactiva de la exploración espacial con 14 períodos históricos, desde los pioneros de la teoría hasta el New Space.',
  provider: { '@type': 'Organization', name: 'meskeIA' },
};
