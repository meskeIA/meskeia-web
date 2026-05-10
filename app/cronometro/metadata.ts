import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cronómetro y Temporizador Online | meskeIA',
  description: 'Cronómetro online con vueltas, temporizador de cuenta atrás y alarma. Herramienta gratuita para medir tiempo, entrenamientos, cocina y productividad.',
  keywords: 'cronometro online, temporizador, cuenta atras, stopwatch, timer, alarma, vueltas, laps, reloj, medidor tiempo',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Cronómetro y Temporizador Online',
    description: 'Mide el tiempo con precisión. Cronómetro con vueltas y temporizador con alarma.',
    url: 'https://meskeia.com/cronometro/',
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
    title: 'Cronómetro y Temporizador | meskeIA',
    description: 'Cronómetro con vueltas y temporizador de cuenta atrás',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Cronómetro meskeIA',
  },
};
