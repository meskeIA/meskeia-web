import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Conjugador de Verbos Español - Todos los tiempos verbales | meskeIA',
  description: 'Conjugador completo de verbos en español. Todos los tiempos verbales: indicativo, subjuntivo, imperativo. Incluye verbos irregulares. Gratis y sin registro.',
  keywords: 'conjugador verbos, conjugación español, verbos irregulares, tiempos verbales, indicativo, subjuntivo, imperativo, gramática española',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Conjugador de Verbos Español | meskeIA',
    description: 'Conjuga cualquier verbo en español. Todos los tiempos, incluidos irregulares.',
    url: 'https://meskeia.com/conjugador-verbos',
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
    title: 'Conjugador de Verbos Español | meskeIA',
    description: 'Conjuga cualquier verbo en español con todos los tiempos verbales.',
    images: ['https://meskeia.com/og-image.png']
  },
};
