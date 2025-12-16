import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Analizador de Espectro de Audio - Visualiza frecuencias en tiempo real | meskeIA',
  description: 'Analizador de espectro FFT gratuito. Visualiza las frecuencias de audio en tiempo real con tu micrófono. Ideal para músicos, técnicos de sonido y curiosos.',
  keywords: 'analizador espectro, FFT, frecuencias audio, espectrograma, visualizador audio, analizador frecuencias, audio spectrum analyzer, técnico sonido',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Analizador de Espectro de Audio - meskeIA',
    description: 'Visualiza las frecuencias de audio en tiempo real con tu micrófono. Herramienta gratuita para músicos y técnicos.',
    url: 'https://meskeia.com/analizador-espectro',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Analizador de Espectro de Audio - meskeIA',
    description: 'Visualiza frecuencias de audio en tiempo real. Gratis y sin instalación.',
  },
};
