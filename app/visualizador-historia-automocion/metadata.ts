import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Historia del Automóvil | De Benz al Coche Eléctrico Autónomo | meskeIA',
  description: 'Cronología interactiva de 140 años de historia del automóvil: del Benz Patent-Motorwagen (1885) al vehículo eléctrico autónomo. 13 períodos con innovaciones clave, modelos emblemáticos y contexto histórico en 6 eras.',
  keywords: [
    'historia automóvil cronología',
    'Benz Patent-Motorwagen 1885',
    'Ford Modelo T cadena montaje',
    'Tesla eléctrico autonomo',
    'crisis petróleo 1973 coches',
    'SEAT 600 España automóvil',
    'Toyota Prius híbrido',
    'coche eléctrico futuro',
    'historia automoción española',
    'industria automotriz evolución',
  ],
  openGraph: {
    title: 'Historia del Automóvil | meskeIA',
    description: 'De Benz (1885) al coche eléctrico autónomo: 140 años de automoción en 13 períodos interactivos.',
    url: 'https://meskeia.com/visualizador-historia-automocion',
    siteName: 'meskeIA',
    locale: 'es_ES',
    type: 'website',
  },
};

export const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'LearningResource',
  name: 'Historia del Automóvil',
  description: 'Cronología interactiva de la automoción con 13 períodos históricos desde 1885 hasta hoy.',
  provider: { '@type': 'Organization', name: 'meskeIA' },
};
