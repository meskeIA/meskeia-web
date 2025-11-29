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
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Generador de Anagramas',
    description: 'Ideal para Wordle, Scrabble y crucigramas',
  },
};
