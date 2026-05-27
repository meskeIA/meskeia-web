import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

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
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Creador de Flashcards | meskeIA',
    description: 'Memoriza más rápido con tarjetas de estudio personalizadas.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Creador de Flashcards",
  description: "Crea y estudia flashcards personalizadas. Organiza tus tarjetas por mazos, categorías y colores. Exporta e importa en JSON y CSV. Modo estudio con flip animado.",
  url: "https://meskeia.com/creador-flashcards/",
  category: 'EducationalApplication',
  features: [],
});
