import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Visualizador del Ayuno Intermitente — Fases Metabólicas | meskeIA',
  description: 'Explora cómo cambia tu metabolismo hora a hora durante el ayuno: glucógeno, gluconeogénesis, cetosis y autofagia. Información fisiológica educativa.',
  keywords: ['ayuno intermitente', 'metabolismo', 'cetosis', 'autofagia', 'gluconeogénesis', 'glucógeno', 'fisiología', '16:8', 'fasting'],
  openGraph: {
    title: 'Visualizador del Ayuno Intermitente — Fases Metabólicas',
    description: 'Qué ocurre en tu cuerpo durante el ayuno: glucógeno, gluconeogénesis, cetosis y autofagia explicados paso a paso.',
    type: 'website',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
};

export const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'EducationalContent',
  name: 'Visualizador del Ayuno Intermitente',
  description: 'Explicación fisiológica de las fases metabólicas durante el ayuno intermitente.',
  educationalLevel: 'general',
  inLanguage: 'es',
  publisher: {
    '@type': 'Organization',
    name: 'meskeIA',
    url: 'https://meskeia.com',
  },
};
