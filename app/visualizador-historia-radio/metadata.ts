import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Historia de la Radio | Cronología Interactiva de Marconi al Podcast con IA | meskeIA',
  description: 'Explora 130 años de historia de la radio: de Marconi y Hertz al podcast, Spotify y la radio con IA. KDKA, BBC, rock and roll, 23-F, Serial y NotebookLM en 14 períodos interactivos.',
  keywords: [
    'historia radio cronología Marconi BBC podcast',
    'radio comercial AM FM historia España',
    'Orson Welles guerra mundos radio',
    'Serial podcast true crime audio',
    'Joe Rogan Spotify podcast negocio',
  ],
  openGraph: {
    title: 'Historia de la Radio — Cronología Interactiva de Marconi al Podcast con IA',
    description: 'Explora 130 años de historia de la radio: de Marconi y Hertz al podcast, Spotify y la radio con IA. 14 períodos interactivos.',
    type: 'website',
  },
};

export const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'LearningResource',
  name: 'Historia de la Radio',
  description: 'Cronología interactiva de la radio con 14 períodos históricos: de Marconi al podcast con IA.',
  provider: { '@type': 'Organization', name: 'meskeIA' },
};
