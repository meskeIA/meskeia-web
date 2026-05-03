import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Historia del Teléfono | De Bell al 5G y la IA | meskeIA',
  description: 'Cronología interactiva de 150 años de historia del teléfono: de Alexander Graham Bell (1876) al 5G, smartphones e IA conversacional. 13 períodos con innovaciones clave, dispositivos icónicos y contexto histórico en 6 grandes eras.',
  keywords: ['historia teléfono cronología', 'Alexander Graham Bell invención teléfono', 'iPhone smartphone revolución', 'Nokia GSM SMS historia', 'Motorola DynaTAC móvil primera generación', '5G historia telecomunicaciones', 'IA conversacional teléfono', 'historia telecomunicaciones España'],
  openGraph: {
    title: 'Historia del Teléfono | meskeIA',
    description: 'De Bell al 5G e IA: 150 años de comunicación telefónica en 13 períodos interactivos.',
    url: 'https://meskeia.com/visualizador-historia-telefono',
    siteName: 'meskeIA',
    locale: 'es_ES',
    type: 'website',
  },
};

export const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'LearningResource',
  name: 'Historia del Teléfono',
  description: 'Cronología interactiva de la historia del teléfono con 13 períodos históricos desde 1876 hasta hoy.',
  provider: { '@type': 'Organization', name: 'meskeIA' },
};
