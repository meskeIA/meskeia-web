import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Temporizador Visual - Reloj de cuenta atrás con colores | meskeIA',
  description: 'Temporizador visual con círculo de colores para personas con autismo, discapacidad cognitiva o necesidades especiales. Botones grandes, sonido al terminar y presets de 1 a 30 minutos.',
  keywords: 'temporizador visual, temporizador autismo, reloj cuenta atrás, timer visual, temporizador colores, discapacidad cognitiva, temporizador necesidades especiales, timer grande',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Temporizador Visual | meskeIA',
    description: 'Temporizador con círculo de colores y botones grandes. Perfecto para personas con autismo, TDAH o dificultades cognitivas.',
    url: 'https://meskeia.com/temporizador-visual/',
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
    title: 'Temporizador Visual | meskeIA',
    description: 'Cuenta atrás con colores y botones grandes. Ideal para personas con autismo o dificultades cognitivas.',
    images: ['https://meskeia.com/og-image.png']
  },
};
