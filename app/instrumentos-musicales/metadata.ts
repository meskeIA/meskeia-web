import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Instrumentos Musicales - Guía de 45 Instrumentos del Mundo | meskeIA',
  description: 'Explora 45 instrumentos musicales de todo el mundo: cuerda, viento, percusión, teclado y electrónicos. Origen, materiales, registro y curiosidades de cada instrumento.',
  keywords: 'instrumentos musicales, violín, guitarra, piano, batería, flauta, trompeta, percusión, cuerda, viento, orquesta, música, organología',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Instrumentos Musicales - Guía de 45 Instrumentos del Mundo',
    description: 'Explora 45 instrumentos musicales: cuerda, viento, percusión, teclado y electrónicos con origen, materiales y curiosidades.',
    url: 'https://meskeia.com/instrumentos-musicales/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Instrumentos Musicales - Guía Completa',
    description: 'Explora 45 instrumentos musicales de todo el mundo.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Instrumentos Musicales meskeIA',
  },
};
