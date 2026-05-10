import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Diapasón Digital Online - La 440Hz Gratis | meskeIA',
  description: 'Diapasón digital gratuito con tono de referencia La 440Hz. Ideal para afinar instrumentos, coros y orquestas. Incluye otras frecuencias de afinación.',
  keywords: 'diapasón digital, diapasón online, La 440Hz, afinación, tono de referencia, afinar instrumentos, A4 440Hz, tuning fork',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Diapasón Digital Online - La 440Hz',
    description: 'Diapasón digital gratuito con tono de referencia La 440Hz para afinar instrumentos.',
    url: 'https://meskeia.com/diapason/',
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
    title: 'Diapasón Digital Online - La 440Hz',
    description: 'Diapasón digital gratuito con tono de referencia La 440Hz para afinar instrumentos.',
    images: ['https://meskeia.com/og-image.png']
  },
};
