import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Movimientos Literarios — Cronología Interactiva | meskeIA',
  description: 'Explora 15 movimientos literarios desde la épica griega hasta el posmodernismo. Autores, obras icónicas y contexto histórico de la literatura occidental.',
  keywords: ['historia literatura', 'movimientos literarios', 'realismo', 'romanticismo literario', 'boom latinoamericano', 'vanguardias', 'cronología literatura'],
  openGraph: {
    title: 'Movimientos Literarios — Cronología Interactiva',
    description: 'De Homero a García Márquez: 15 movimientos con autores, obras icónicas y contexto histórico.',
    type: 'website',
    url: 'https://meskeia.com/visualizador-literatura-movimientos/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
  alternates: { canonical: 'https://meskeia.com/visualizador-literatura-movimientos/' },
};

export const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Visualizador de Movimientos Literarios',
  description: 'Herramienta educativa sobre historia de la literatura y movimientos literarios de la cultura occidental',
  url: 'https://meskeia.com/visualizador-literatura-movimientos/',
  applicationCategory: 'EducationalApplication',
  inLanguage: 'es',
  isAccessibleForFree: true,
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
};
