import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Generador de Anagramas Online Gratis - Buscador de Palabras con Letras',
  description: 'Genera anagramas en español: introduce tus letras y encuentra todas las palabras posibles. Ideal para Scrabble, Apalabrados, Wordle y crucigramas. Sin registro, gratis.',
  keywords: 'anagramas, generador, palabras, letras, wordle, scrabble, apalabrados, crucigramas, español, diccionario',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/generador-anagramas/',
  },
  openGraph: {
    type: 'website',
    title: 'Generador de Anagramas Online Gratis - Buscador de Palabras',
    description: 'Introduce tus letras y encuentra todas las palabras posibles. Ideal para Scrabble, Apalabrados, Wordle y crucigramas.',
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
    title: 'Generador de Anagramas Online Gratis',
    description: 'Encuentra todas las palabras posibles con tus letras. Scrabble, Apalabrados, Wordle, crucigramas.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Generador de Anagramas',
  description: 'Generador de anagramas en español. Encuentra todas las palabras válidas que se pueden formar con un conjunto de letras. Útil para Wordle, Scrabble, Apalabrados y crucigramas.',
  url: 'https://meskeia.com/generador-anagramas/',
  category: 'UtilityApplication',
  features: [
    'Genera anagramas a partir de letras introducidas',
    'Diccionario español integrado',
    'Filtros por longitud de palabra',
    'Útil para juegos de palabras (Wordle, Scrabble, Apalabrados)',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'En español',
  ],
  keywords: ['anagramas', 'palabras', 'Wordle', 'Scrabble', 'crucigramas', 'juegos palabras'],
});
