import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Historia del Clima | Cronología Interactiva de la Glaciación al Cambio Climático | meskeIA',
  description: 'Explora 17.000 años de historia climática: de la última glaciación al cambio climático actual. Óptimos medievales, Pequeña Edad de Hielo y emergencia climática en 14 períodos.',
  keywords: ['historia clima', 'cambio climático', 'glaciaciones', 'pequeña edad de hielo', 'calentamiento global', 'paleoclimatología'],
  openGraph: {
    title: 'Historia del Clima — Cronología Interactiva de la Glaciación al Cambio Climático',
    description: 'De la última glaciación a la emergencia climática — 14 períodos con científicos, hitos y contexto histórico.',
    type: 'website',
    url: 'https://meskeia.com/visualizador-historia-clima/',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  alternates: { canonical: 'https://meskeia.com/visualizador-historia-clima/' },
};

export const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'LearningResource',
  name: 'Historia del Clima',
  description: 'Cronología interactiva de la historia del clima con 14 períodos históricos desde -15000 hasta 2050.',
  provider: { '@type': 'Organization', name: 'meskeIA' },
};
