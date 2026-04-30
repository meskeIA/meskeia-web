import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Estructuras de Mercado | meskeIA',
  description: 'Visualiza competencia perfecta, monopolio, oligopolio y competencia monopolística. Curvas de oferta y demanda, pérdida de bienestar y dilema del prisionero.',
  keywords: ['estructuras de mercado', 'monopolio', 'oligopolio', 'competencia perfecta', 'economía', 'microeconomía'],
  openGraph: {
    title: 'Estructuras de Mercado — meskeIA',
    description: 'Competencia perfecta, monopolio, oligopolio y su impacto en precios y bienestar.',
    url: 'https://meskeia.com/visualizador-estructuras-mercado/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    type: 'website',
  },
};

export const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Visualizador de Estructuras de Mercado',
  description: 'Herramienta educativa interactiva sobre estructuras de mercado en microeconomía',
  url: 'https://meskeia.com/visualizador-estructuras-mercado/',
  applicationCategory: 'EducationalApplication',
  inLanguage: 'es',
  isAccessibleForFree: true,
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
};
