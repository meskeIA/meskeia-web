import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Estilos Arquitectónicos — Cronología Interactiva | meskeIA',
  description: 'Explora 16 estilos arquitectónicos desde la Grecia clásica hasta la arquitectura sostenible. Edificios icónicos, arquitectos y contexto histórico de la arquitectura occidental.',
  keywords: ['historia arquitectura', 'estilos arquitectónicos', 'gótico', 'barroco arquitectura', 'bauhaus', 'modernismo arquitectura', 'cronología arquitectura'],
  openGraph: {
    title: 'Estilos Arquitectónicos — Cronología Interactiva',
    description: 'Del Partenón a la Sagrada Família: 16 estilos con edificios icónicos, arquitectos y contexto histórico.',
    type: 'website',
    url: 'https://meskeia.com/visualizador-arquitectura-estilos/',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  alternates: { canonical: 'https://meskeia.com/visualizador-arquitectura-estilos/' },
};

export const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Visualizador de Estilos Arquitectónicos',
  description: 'Herramienta educativa sobre historia de la arquitectura y estilos arquitectónicos occidentales',
  url: 'https://meskeia.com/visualizador-arquitectura-estilos/',
  applicationCategory: 'EducationalApplication',
  inLanguage: 'es',
  isAccessibleForFree: true,
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
};
