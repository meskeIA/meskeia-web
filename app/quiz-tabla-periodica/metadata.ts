import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Quiz Tabla Periódica — Pon a prueba tu química | meskeIA',
  description:
    'Quiz interactivo sobre la tabla periódica: números atómicos, grupos, períodos, familias de elementos y propiedades. 40+ preguntas de química. ¿Cuánto sabes de los elementos?',
  keywords: [
    'quiz tabla periódica',
    'test química',
    'elementos químicos',
    'números atómicos',
    'grupos periódicos',
    'familias elementos',
    'halógenos',
    'gases nobles',
    'metales alcalinos',
    'quiz ciencias',
  ],
  openGraph: {
    title: 'Quiz Tabla Periódica | meskeIA',
    description:
      '40+ preguntas sobre elementos, grupos, propiedades y curiosidades de la tabla periódica. ¿Eres un experto en química?',
    url: 'https://meskeia.com/quiz-tabla-periodica/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    type: 'website',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
  alternates: {
    canonical: 'https://meskeia.com/quiz-tabla-periodica/',
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Quiz Tabla Periódica",
  description: "Quiz interactivo sobre la tabla periódica: números atómicos, grupos, períodos, familias de elementos y propiedades. 40+ preguntas de química. ¿Cuánto sabes de los elementos?",
  url: "https://meskeia.com/quiz-tabla-periodica/",
  category: 'EducationalApplication',
  features: [],
});
