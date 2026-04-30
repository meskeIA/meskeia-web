import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Movimientos Artísticos | meskeIA',
  description: 'Explora 15 movimientos artísticos: Románico, Gótico, Renacimiento, Barroco, Impresionismo, Cubismo, Surrealismo, Pop Art y más. Cronología, artistas y contexto histórico.',
  keywords: ['movimientos artísticos', 'historia del arte', 'impresionismo', 'cubismo', 'renacimiento', 'surrealismo', 'arte moderno'],
  openGraph: {
    title: 'Movimientos Artísticos — meskeIA',
    description: 'Cronología visual de los grandes movimientos artísticos: del Románico al Arte Digital.',
    url: 'https://meskeia.com/visualizador-arte-movimientos/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    type: 'website',
  },
};

export const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Visualizador de Movimientos Artísticos',
  description: 'Herramienta educativa sobre historia del arte y movimientos artísticos',
  url: 'https://meskeia.com/visualizador-arte-movimientos/',
  applicationCategory: 'EducationalApplication',
  inLanguage: 'es',
  isAccessibleForFree: true,
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
};
