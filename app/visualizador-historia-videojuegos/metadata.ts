import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Historia de los Videojuegos | meskeIA',
  description: 'Cronología interactiva de los videojuegos desde Pong hasta la IA generativa. 14 períodos con estudios, juegos icónicos y contexto cultural.',
  keywords: ['historia videojuegos', 'Pong', 'Nintendo', 'PlayStation', 'esports', 'gaming móvil', 'Minecraft', 'Fortnite'],
  openGraph: {
    title: 'Historia de los Videojuegos — Cronología Interactiva',
    description: 'De Pong al metaverso — 14 períodos de videojuegos con los juegos, estudios y tecnologías que cambiaron el entretenimiento.',
    type: 'website',
  },
};

export const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'LearningResource',
  name: 'Historia de los Videojuegos',
  description: 'Cronología interactiva de los videojuegos con 14 períodos históricos.',
  provider: { '@type': 'Organization', name: 'meskeIA' },
};
