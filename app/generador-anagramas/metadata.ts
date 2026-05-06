import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Generador de Anagramas - Encuentra Palabras con tus Letras | meskeIA',
  description: 'Genera anagramas y encuentra todas las palabras posibles con tus letras. Ideal para Wordle, Scrabble, Apalabrados y crucigramas. Diccionario español incluido.',
  keywords: 'anagramas, generador, palabras, letras, wordle, scrabble, apalabrados, crucigramas, español, diccionario',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Generador de Anagramas en Español',
    description: 'Encuentra todas las palabras posibles con tus letras',
    url: 'https://meskeia.com/generador-anagramas/',
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
    title: 'Generador de Anagramas',
    description: 'Ideal para Wordle, Scrabble y crucigramas',
    images: ['https://meskeia.com/og-image.png']
  },
};
