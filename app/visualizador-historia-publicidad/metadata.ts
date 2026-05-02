import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Historia de la Publicidad | Cronología desde Gutenberg | meskeIA',
  description: 'Cronología visual de la historia de la publicidad: desde los primeros carteles impresos hasta la IA generativa. 14 períodos, datos históricos y análisis del impacto cultural y económico.',
  keywords: ['historia publicidad', 'cronología publicidad', 'evolución anuncios', 'mad men historia', 'publicidad digital', 'marketing histórico', 'Bernays propaganda', 'IA publicidad'],
  openGraph: {
    title: 'Historia de la Publicidad | meskeIA',
    description: 'Cronología visual de la publicidad: desde Gutenberg hasta la IA generativa.',
    url: 'https://meskeia.com/visualizador-historia-publicidad',
    siteName: 'meskeIA',
    locale: 'es_ES',
    type: 'website',
  },
  alternates: { canonical: 'https://meskeia.com/visualizador-historia-publicidad/' },
};

export const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Historia de la Publicidad — Cronología Interactiva',
  description: 'Herramienta educativa sobre la historia y evolución de la publicidad desde Gutenberg hasta la IA generativa.',
  url: 'https://meskeia.com/visualizador-historia-publicidad/',
  applicationCategory: 'EducationalApplication',
  inLanguage: 'es',
  isAccessibleForFree: true,
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
};
