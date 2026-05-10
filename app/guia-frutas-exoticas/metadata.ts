import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Guía de Frutas Exóticas del Mundo | meskeIA',
  description:
    'Guía de 40 frutas exóticas: durian, mangostán, rambután, pitaya, lichi, baobab, yuzu y más. Origen, temporada, sabor y forma de consumo.',
  keywords: [
    'frutas exoticas',
    'frutas tropicales',
    'durian mangostan rambutan',
    'pitaya dragon fruit',
    'lichi maracuya guayaba',
    'frutas raras',
  ],
  openGraph: {
    title: 'Guía de Frutas Exóticas del Mundo | meskeIA',
    description:
      'Descubre 40 frutas tropicales y raras del mundo: origen, temporada, beneficios, formas de consumo y curiosidades.',
    type: 'website',
    url: 'https://meskeia.com/guia-frutas-exoticas/',
    locale: 'es_ES',
    siteName: 'meskeIA',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Guía de Frutas Exóticas del Mundo | meskeIA',
    description:
      'Descubre 40 frutas tropicales y raras del mundo: origen, temporada, beneficios y curiosidades.',
    images: ['https://meskeia.com/og-image.png']
  },
  alternates: {
    canonical: 'https://meskeia.com/guia-frutas-exoticas',
  },
};
