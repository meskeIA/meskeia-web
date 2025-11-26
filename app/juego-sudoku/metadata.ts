import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sudoku - Juego de Lógica y Números | meskeIA',
  description: 'Juega Sudoku online gratis. 3 niveles de dificultad, validación automática, pistas y guardado de progreso. Entrena tu mente con este clásico puzzle.',
  keywords: 'sudoku, juego, puzzle, números, lógica, gratis, online, niveles, dificultad, pistas',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Sudoku - Juego de Lógica y Números | meskeIA',
    description: 'Sudoku online con 3 niveles de dificultad. Entrena tu mente.',
    url: 'https://meskeia.com/juego-sudoku',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sudoku - meskeIA',
    description: 'El clásico puzzle de números, gratis y online.',
  },
};
