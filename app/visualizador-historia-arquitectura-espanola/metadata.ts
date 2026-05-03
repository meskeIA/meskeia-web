import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Historia de la Arquitectura Española | Del Románico al Guggenheim | meskeIA',
  description: 'Cronología interactiva de 1.000 años de arquitectura española: del románico y las catedrales góticas a Gaudí, el Escorial, el Guggenheim de Bilbao y la arquitectura paramétrica. 13 períodos con obras emblemáticas, estilos y el impacto de la arquitectura en la identidad española.',
  keywords: [
    'historia arquitectura española cronología',
    'Gaudí Sagrada Familia Modernismo catalán',
    'El Escorial Juan de Herrera Herrerismo',
    'Guggenheim Bilbao Frank Gehry starchitecture',
    'catedral gótica Burgos León Santiago Compostela',
    'mudéjar arte islámico cristiano España medieval',
    'arquitectura barroca churrigueresco España',
    'Rafael Moneo arquitectura española contemporánea',
  ],
  openGraph: {
    title: 'Historia de la Arquitectura Española | meskeIA',
    description: 'Del Románico al Guggenheim: 1.000 años de arquitectura española en 13 períodos interactivos.',
    url: 'https://meskeia.com/visualizador-historia-arquitectura-espanola',
    siteName: 'meskeIA',
    locale: 'es_ES',
    type: 'website',
  },
};

export const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'LearningResource',
  name: 'Historia de la Arquitectura Española',
  description: 'Cronología interactiva de 1.000 años de arquitectura española desde el románico hasta hoy.',
  provider: { '@type': 'Organization', name: 'meskeIA' },
};
