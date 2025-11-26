import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '2048 - Juego de Números | meskeIA',
  description: 'Juega al clásico 2048. Desliza y combina números para llegar a 2048. Guarda tu mejor puntuación. Gratis y sin registro.',
  keywords: '2048, juego, numeros, puzzle, estrategia, combinar, deslizar, online, gratis',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: '2048 - Juego de Números | meskeIA',
    description: 'Desliza y combina números para llegar a 2048.',
    url: 'https://meskeia.com/juego-2048',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: '2048 - meskeIA',
    description: 'El clásico juego de números.',
  },
};
