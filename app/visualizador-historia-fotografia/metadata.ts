import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Historia de la Fotografía | Cronología Interactiva | meskeIA',
  description: 'Cronología interactiva de la fotografía con 14 períodos desde el daguerrotipo (1826) hasta la IA generativa. De Niépce a Midjourney: 200 años de imagen fija.',
  keywords: ['historia fotografía', 'daguerrotipo', 'fotografía digital', 'Instagram', 'IA generativa imagen', 'Kodak', 'cronología'],
  openGraph: {
    title: 'Historia de la Fotografía | meskeIA',
    description: 'Del daguerrotipo a la IA generativa: 200 años de fotografía en una cronología interactiva.',
    url: 'https://meskeia.com/visualizador-historia-fotografia/',
    type: 'website',
  },
};

export const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'LearningResource',
  name: 'Historia de la Fotografía',
  description: 'Cronología interactiva de la fotografía con 14 períodos históricos, desde el daguerrotipo hasta la IA generativa.',
  provider: { '@type': 'Organization', name: 'meskeIA' },
};
