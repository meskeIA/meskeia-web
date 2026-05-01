import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Historia de la Química | meskeIA',
  description: 'Cronología interactiva de la química desde la alquimia hasta la química computacional. 14 períodos con descubrimientos clave y contexto histórico.',
  keywords: ['historia de la química', 'tabla periódica', 'Lavoisier', 'Mendeléiev', 'química orgánica', 'alquimia'],
  openGraph: {
    title: 'Historia de la Química — Cronología Interactiva',
    description: 'De la alquimia árabe al ADN y AlphaFold — 14 períodos de química con descubrimientos clave.',
    type: 'website',
    url: 'https://meskeia.com/visualizador-historia-quimica/',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  alternates: { canonical: 'https://meskeia.com/visualizador-historia-quimica/' },
};

export const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'LearningResource',
  name: 'Historia de la Química',
  description: 'Cronología interactiva de la química con 14 períodos históricos.',
  provider: { '@type': 'Organization', name: 'meskeIA' },
};
