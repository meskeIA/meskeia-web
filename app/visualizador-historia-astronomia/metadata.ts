import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Historia de la Astronomía | meskeIA',
  description: 'Cronología interactiva de la astronomía desde Stonehenge hasta el Telescopio James Webb. 14 períodos con descubrimientos clave y contexto histórico.',
  keywords: ['historia de la astronomía', 'telescopio', 'Copérnico', 'Galileo', 'Big Bang', 'James Webb', 'agujero negro'],
  openGraph: {
    title: 'Historia de la Astronomía — Cronología Interactiva',
    description: 'De Stonehenge al James Webb — 14 períodos de astronomía con los descubrimientos que revelaron el cosmos.',
    type: 'website',
  },
};

export const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'LearningResource',
  name: 'Historia de la Astronomía',
  description: 'Cronología interactiva de la astronomía con 14 períodos históricos.',
  provider: { '@type': 'Organization', name: 'meskeIA' },
};
