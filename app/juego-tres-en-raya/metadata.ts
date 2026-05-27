import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Tres en Raya - Juego Clásico Online | meskeIA',
  description: 'Juega al clásico Tres en Raya (Tic Tac Toe) online contra la computadora. Elige entre 3 niveles de dificultad: fácil, medio y difícil. Gratis y sin registro.',
  keywords: 'tres en raya, tic tac toe, juego, clasico, online, gratis, computadora, estrategia',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Tres en Raya - Juego Clásico | meskeIA',
    description: 'Juega al clásico Tres en Raya contra la computadora.',
    url: 'https://meskeia.com/juego-tres-en-raya/',
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
    title: 'Tres en Raya - meskeIA',
    description: 'Juego clásico contra la computadora.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Juego Tres en Raya",
  description: "Juega al clásico Tres en Raya (Tic Tac Toe) online contra la computadora. Elige entre 3 niveles de dificultad: fácil, medio y difícil. Gratis y sin registro.",
  url: "https://meskeia.com/juego-tres-en-raya/",
  category: 'UtilityApplication',
  features: [],
});
