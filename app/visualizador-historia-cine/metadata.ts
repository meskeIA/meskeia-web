import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Historia del Cine | meskeIA',
  description: 'Cronología interactiva del cine desde los hermanos Lumière hasta la IA generativa. 14 períodos con directores, películas icónicas y contexto histórico.',
  keywords: ['historia del cine', 'cine mudo', 'Nouvelle Vague', 'Hollywood', 'streaming', 'directores cine', 'películas Oscar'],
  openGraph: {
    title: 'Historia del Cine — Cronología Interactiva',
    description: 'De los hermanos Lumière al cine generado por IA — 14 períodos con directores, películas icónicas y contexto histórico.',
    type: 'website',
  },
};

export const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'LearningResource',
  name: 'Historia del Cine',
  description: 'Cronología interactiva del cine con 14 períodos históricos.',
  provider: { '@type': 'Organization', name: 'meskeIA' },
};
