import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Historia de la Física | meskeIA',
  description: 'Cronología interactiva de la física desde los griegos hasta la teoría de cuerdas. 14 períodos con científicos, experimentos clave y contexto histórico.',
  keywords: ['historia de la física', 'física cuántica', 'mecánica clásica', 'Einstein', 'Newton', 'física de partículas'],
  openGraph: {
    title: 'Historia de la Física — Cronología Interactiva',
    description: 'De Tales de Mileto a las ondas gravitacionales — 14 períodos de física con experimentos clave y contexto histórico.',
    type: 'website',
    url: 'https://meskeia.com/visualizador-historia-fisica/',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  alternates: { canonical: 'https://meskeia.com/visualizador-historia-fisica/' },
};

export const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'LearningResource',
  name: 'Historia de la Física',
  description: 'Cronología interactiva de la física con 14 períodos históricos.',
  provider: { '@type': 'Organization', name: 'meskeIA' },
};
