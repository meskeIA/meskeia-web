import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Historia de la Moda | meskeIA',
  description: 'Cronología interactiva de la moda desde la Edad Media hasta la moda sostenible y digital. 14 períodos con diseñadores, tendencias y contexto histórico.',
  keywords: ['historia de la moda', 'Alta Costura', 'Coco Chanel', 'fast fashion', 'moda sostenible', 'diseñadores moda', 'evolución vestido'],
  openGraph: {
    title: 'Historia de la Moda — Cronología Interactiva',
    description: 'De la corte borgoñona al metaverso — 14 períodos de moda con diseñadores, tendencias y las revoluciones que cambiaron el vestir.',
    type: 'website',
  },
};

export const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'LearningResource',
  name: 'Historia de la Moda',
  description: 'Cronología interactiva de la historia de la moda con 14 períodos.',
  provider: { '@type': 'Organization', name: 'meskeIA' },
};
