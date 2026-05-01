import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Historia de la Exploración | Cronología Interactiva | meskeIA',
  description:
    'Cronología interactiva de la historia de la exploración geográfica y espacial: desde los navegantes fenicios hasta las misiones a Marte. 14 períodos, 6 eras históricas.',
  keywords: [
    'historia exploración',
    'descubrimientos geográficos',
    'exploración espacial',
    'vikingos',
    'era descubrimientos',
    'NASA',
    'cronología',
  ],
  openGraph: {
    title: 'Historia de la Exploración | meskeIA',
    description:
      'Cronología de 2600 años de exploración humana: navegantes fenicios, vikingos, Colón, Magallanes, Armstrong, Voyager.',
    url: 'https://meskeia.com/visualizador-historia-exploracion/',
    type: 'website',
  },
};

export const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'LearningResource',
  name: 'Historia de la Exploración Geográfica y Espacial',
  description:
    'Cronología interactiva de la exploración humana con 14 períodos, desde los fenicios hasta la era espacial comercial.',
  provider: { '@type': 'Organization', name: 'meskeIA' },
};
