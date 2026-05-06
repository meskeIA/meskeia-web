import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Generador de Ondas y Visualizador de Audio - Señales Sonoras | meskeIA',
  description: 'Genera ondas sonoras (senoidal, cuadrada, triangular, diente de sierra), visualiza audio y aprende sobre frecuencias. Herramienta educativa interactiva para física y música.',
  keywords: 'generador ondas, onda senoidal, onda cuadrada, frecuencia sonido, visualizador audio, waveform, oscilador, Hz, hercios, fisica sonido, sintesis audio, educativo, aprender ondas',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Generador de Ondas y Visualizador de Audio | meskeIA',
    description: 'Genera ondas sonoras, visualiza audio y aprende sobre frecuencias. Herramienta educativa interactiva.',
    url: 'https://meskeia.com/generador-ondas',
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
    title: 'Generador de Ondas y Visualizador de Audio | meskeIA',
    description: 'Genera ondas sonoras y visualiza audio. Aprende física del sonido de forma interactiva.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Generador de Ondas meskeIA',
  },
};
