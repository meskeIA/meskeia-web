import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Buscador de Palabras por Patrón - Crucigramas y Juegos de Letras | meskeIA',
  description: 'Encuentra palabras del español a partir de un patrón con huecos: introduce "_A_A_O" y obtén CASADO, NARRADO, BAÑADO... Ideal para crucigramas, Scrabble, Wordle y aprender vocabulario.',
  keywords: 'buscador palabras patrón, crucigramas, palabras con huecos, autodefinidos, scrabble, wordle, palabras cruzadas, español, completar palabras',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Buscador de Palabras por Patrón en Español',
    description: 'Encuentra palabras del español con un patrón de huecos. Ej.: "_A_A_O" → CASADO, NARRADO. Más de 87.000 palabras del lemario.',
    url: 'https://meskeia.com/buscador-palabras-patron/',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Buscador de Palabras por Patrón en Español',
    description: 'Encuentra palabras con huecos, perfecto para crucigramas y Scrabble.',
  },
  other: {
    'application-name': 'Buscador de Palabras por Patrón meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Buscador de Palabras por Patrón',
  description: 'Encuentra palabras del español que coinciden con un patrón de letras y huecos. Útil para resolver crucigramas, autodefinidos, Scrabble, Wordle y completar palabras parciales. Más de 87.000 lemas indexados por longitud.',
  url: 'https://meskeia.com/buscador-palabras-patron/',
  category: 'UtilityApplication',
  features: [
    'Búsqueda por patrón con guiones bajos como comodines (ej. "_A_A_O")',
    'Filtro opcional de letras que deben aparecer en la palabra',
    'Filtro opcional de letras a excluir',
    'Resultados agrupados por longitud y ordenados alfabéticamente',
    'Más de 87.000 lemas del español validados (Lemario de Olea, dominio público)',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
  ],
});
