import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Wordle en Español - Adivina la Palabra | meskeIA',
  description: 'Juega al Wordle en español. Adivina la palabra de 5 letras en 6 intentos. Nueva palabra cada día. Gratis y sin registro.',
  keywords: 'wordle, español, palabra, adivinar, juego, letras, diario, puzzle, vocabulario',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Wordle en Español - Adivina la Palabra | meskeIA',
    description: 'Adivina la palabra de 5 letras en 6 intentos.',
    url: 'https://meskeia.com/juego-wordle',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Wordle en Español - meskeIA',
    description: 'El juego de palabras más popular, en español.',
  },
};
