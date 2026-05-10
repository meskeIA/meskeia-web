import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Toma de Decisiones: Sistemas 1 y 2 | meskeIA',
  description: 'Cómo decide realmente el cerebro humano: Sistemas 1 y 2 de Kahneman, fatiga decisional, heurísticos, arquitectura de elección y nudges. Por qué tomamos peores decisiones al final del día y cómo diseñar el entorno para decidir mejor.',
  keywords: ['sistemas 1 2 Kahneman', 'fatiga decisional', 'heurísticos cognitivos', 'arquitectura de elección nudge', 'cómo decidir mejor', 'pensamiento rápido lento', 'sesgos toma de decisiones', 'nudge Thaler Sunstein'],
  openGraph: {
    title: 'Toma de Decisiones: Sistemas 1 y 2 | meskeIA',
    description: 'Por qué tomamos peores decisiones al final del día — y cómo diseñar el entorno para evitarlo.',
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
  '@type': 'WebApplication',
  name: 'Toma de Decisiones: Sistemas 1 y 2',
  description: 'Visualizador interactivo del proceso de toma de decisiones humano: fatiga decisional, heurísticos cognitivos, arquitectura de elección y nudges.',
  url: 'https://meskeia.com/visualizador-toma-decisiones/',
  applicationCategory: 'EducationalApplication',
  inLanguage: 'es',
  author: {
    '@type': 'Organization',
    name: 'meskeIA',
    url: 'https://meskeia.com',
  },
};
