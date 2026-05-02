import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Historia del Cómic | Cronología Interactiva de Töpffer al Cómic con IA | meskeIA',
  description: 'Explora 200 años de historia del cómic: de Töpffer a Superman, Tintín, Manga, Watchmen y el cómic digital. 14 períodos interactivos con novela gráfica, superhéroes y más.',
  keywords: ['historia del cómic', 'superhéroes', 'manga', 'novela gráfica', 'historia tebeos', 'golden age comics', 'bande dessinée', 'webcómic'],
  openGraph: {
    title: 'Historia del Cómic — Cronología Interactiva de Töpffer al Cómic con IA',
    description: 'Explora 200 años de historia del cómic: de Töpffer a Superman, Tintín, Manga, Watchmen y el cómic digital. 14 períodos interactivos.',
    type: 'website',
  },
};

export const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'LearningResource',
  name: 'Historia del Cómic',
  description: 'Cronología interactiva del cómic con 14 períodos históricos desde Töpffer hasta la inteligencia artificial.',
  provider: { '@type': 'Organization', name: 'meskeIA' },
};
