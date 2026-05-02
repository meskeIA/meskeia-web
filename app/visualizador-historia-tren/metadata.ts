import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Historia del Tren | De la Locomotora de Vapor al AVE | meskeIA',
  description: 'Cronología interactiva de 220 años de historia del ferrocarril: de Trevithick (1804) al AVE español, Shinkansen, TGV, Eurostar y los trenes de hidrógeno. 14 períodos con líneas icónicas, velocidades y contexto histórico en 6 eras.',
  keywords: ['historia tren ferrocarril cronología', 'AVE España alta velocidad', 'Shinkansen Japón bala', 'TGV Francia alta velocidad', 'Stephenson locomotora vapor', 'Orient Express historia', 'tren hidrógeno sostenible', 'RENFE historia España ferrocarril'],
  openGraph: {
    title: 'Historia del Tren | meskeIA',
    description: 'De Trevithick al AVE: 220 años de historia ferroviaria en 14 períodos interactivos.',
    url: 'https://meskeia.com/visualizador-historia-tren',
    siteName: 'meskeIA',
    locale: 'es_ES',
    type: 'website',
  },
};

export const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'LearningResource',
  name: 'Historia del Tren',
  description: 'Cronología interactiva del ferrocarril con 14 períodos históricos desde 1804 hasta hoy.',
  provider: { '@type': 'Organization', name: 'meskeIA' },
};
