import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Historia de las Matemáticas | meskeIA',
  description: 'Cronología interactiva de las matemáticas desde Babilonia hasta la IA matemática. 14 períodos con teoremas clave, matemáticos y contexto histórico.',
  keywords: ['historia de las matemáticas', 'Euclides', 'Newton', 'Gödel', 'álgebra', 'cálculo', 'teorema de Fermat'],
  openGraph: {
    title: 'Historia de las Matemáticas — Cronología Interactiva',
    description: 'De las tablillas babilónicas a AlphaProof — 14 períodos de matemáticas con teoremas que cambiaron el mundo.',
    type: 'website',
  },
};

export const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'LearningResource',
  name: 'Historia de las Matemáticas',
  description: 'Cronología interactiva de las matemáticas con 14 períodos históricos.',
  provider: { '@type': 'Organization', name: 'meskeIA' },
};
