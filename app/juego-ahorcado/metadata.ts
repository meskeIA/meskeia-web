import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Juego del Ahorcado en Español - Adivina la Palabra | meskeIA',
  description: 'Juega al clásico juego del ahorcado en español. 4 categorías: animales, países, profesiones y vocabulario. Sin registro, sin publicidad, 100% local.',
  keywords: 'ahorcado, juego ahorcado, adivinar palabra, juego letras, juego español, juego educativo, vocabulario',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Juego del Ahorcado en Español | meskeIA',
    description: 'Adivina la palabra letra a letra. 4 categorías temáticas, sin publicidad, sin registro.',
    url: 'https://meskeia.com/juego-ahorcado',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Juego del Ahorcado en Español | meskeIA',
    description: 'Adivina la palabra letra a letra. 4 categorías temáticas, sin publicidad.',
  },
  other: {
    'application-name': 'Juego del Ahorcado meskeIA',
  },
};
