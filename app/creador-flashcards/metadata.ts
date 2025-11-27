import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Creador de Flashcards - Memoriza con Tarjetas de Estudio | meskeIA',
  description: 'Crea y estudia flashcards personalizadas. Organiza tus tarjetas por mazos, categorías y colores. Exporta e importa en JSON y CSV. Modo estudio con flip animado.',
  keywords: 'flashcards, tarjetas de estudio, memorización, anki, mazos, repetición espaciada, estudio, aprendizaje',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Creador de Flashcards | meskeIA',
    description: 'Crea flashcards, organiza mazos y estudia con animaciones flip.',
    url: 'https://meskeia.com/creador-flashcards/',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Creador de Flashcards | meskeIA',
    description: 'Memoriza más rápido con tarjetas de estudio personalizadas.',
  },
};
