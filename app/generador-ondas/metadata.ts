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
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Generador de Ondas y Visualizador de Audio | meskeIA',
    description: 'Genera ondas sonoras y visualiza audio. Aprende física del sonido de forma interactiva.',
  },
  other: {
    'application-name': 'Generador de Ondas meskeIA',
  },
};
