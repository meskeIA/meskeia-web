import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'El Mapa de los Idiomas del Mundo - Familias Lingüísticas | meskeIA',
  description: 'Descubre las grandes familias lingüísticas, los idiomas más hablados, las lenguas en peligro de extinción y curiosidades fascinantes. Explicador visual interactivo.',
  keywords: 'idiomas mundo, familias lingüísticas, lenguas peligro extinción, hablantes, diversidad lingüística, idiomas más hablados, lenguas en peligro, indoeuropeo',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'El Mapa de los Idiomas del Mundo',
    description: 'Familias lingüísticas, los idiomas más hablados, lenguas en peligro y curiosidades. Explicador visual interactivo.',
    url: 'https://meskeia.com/visualizador-idiomas-mundo',
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
    title: 'El Mapa de los Idiomas del Mundo',
    description: 'Más de 7.000 idiomas en el mundo: familias, hablantes, lenguas en peligro y curiosidades fascinantes.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Idiomas del Mundo meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'El Mapa de los Idiomas del Mundo',
  description: 'Explicador visual interactivo sobre los idiomas del mundo: las grandes familias lingüísticas, los idiomas más hablados por hablantes nativos y totales, las lenguas en peligro de extinción y curiosidades fascinantes sobre la diversidad lingüística.',
  url: 'https://meskeia.com/visualizador-idiomas-mundo/',
  features: [
    'Familias lingüísticas con bloques proporcionales por hablantes',
    'Top 10 idiomas más hablados: nativos vs segunda lengua',
    'Embudo de lenguas en peligro de extinción',
    'Curiosidades lingüísticas: alfabetos, tonos, clics',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});
