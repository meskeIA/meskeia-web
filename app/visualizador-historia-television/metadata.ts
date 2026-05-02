import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Historia de la Televisión | Cronología Interactiva de Baird al Streaming con IA | meskeIA',
  description: 'Explora 100 años de historia de la televisión: de Baird y Farnsworth a Netflix, Breaking Bad, La Casa de Papel y la IA generativa. 14 períodos con TVE, TV privada, TDT y streaming.',
  keywords: [
    'historia televisión cronología Baird Netflix visualizador',
    'TVE historia España franquismo televisión',
    'Netflix House of Cards streaming binge-watching',
    'Breaking Bad Game of Thrones series oro',
    'Disney Plus guerra plataformas streaming',
  ],
  openGraph: {
    title: 'Historia de la Televisión — Cronología Interactiva de Baird al Streaming',
    description: 'De Baird y Farnsworth a Netflix, Breaking Bad y la IA generativa — 14 períodos con TVE, TV privada, TDT y streaming.',
    type: 'website',
  },
};

export const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'LearningResource',
  name: 'Historia de la Televisión',
  description: 'Cronología interactiva de la televisión con 14 períodos históricos desde 1926 hasta la actualidad.',
  provider: { '@type': 'Organization', name: 'meskeIA' },
};
