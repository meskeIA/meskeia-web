import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Metrónomo Online - Tempo Preciso para Músicos | meskeIA',
  description: 'Metrónomo online gratuito con tempo ajustable (40-220 BPM), tap tempo, múltiples compases y visualización del pulso. Ideal para práctica musical.',
  keywords: 'metronomo, metronomo online, tempo, bpm, musica, practica musical, compas, tap tempo, ritmo, musicos',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Metrónomo Online - Tempo Preciso para Músicos',
    description: 'Metrónomo online gratuito con tempo ajustable, tap tempo y múltiples compases.',
    url: 'https://meskeia.com/metronomo/',
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
    title: 'Metrónomo Online - Tempo Preciso para Músicos',
    description: 'Metrónomo online gratuito con tempo ajustable, tap tempo y múltiples compases.',
    images: ['https://meskeia.com/og-image.png']
  },
};
