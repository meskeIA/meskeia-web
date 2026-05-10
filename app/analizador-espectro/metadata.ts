import { Metadata } from 'next';

import { generateWebAppSchema } from '@/lib/schema-templates';
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
    url: 'https://meskeia.com/analizador-espectro/',
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
    title: 'Analizador de Espectro de Audio - meskeIA',
    description: 'Visualiza frecuencias de audio en tiempo real. Gratis y sin instalación.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Analizador de Espectro de Audio - Visualiza frecuencias en tiempo real",
  description: "Analizador de espectro FFT gratuito. Visualiza las frecuencias de audio en tiempo real con tu micrófono. Ideal para músicos, técnicos de sonido y curiosos.",
  url: 'https://meskeia.com/analizador-espectro/',
  category: 'UtilityApplication',
  features: [
      "Funciona 100% en el navegador, sin registro ni instalación",
      "Gratuito y sin publicidad",
      "En español"
  ],
});
