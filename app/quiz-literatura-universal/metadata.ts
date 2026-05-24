import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Quiz de Literatura Universal — Pon a prueba tus conocimientos | meskeIA',
  description: 'Quiz de literatura con 50 preguntas en 3 niveles (básico, medio, avanzado): autores, obras, movimientos literarios y citas célebres. Con explicación tras cada respuesta.',
  keywords: 'quiz literatura, test literatura, preguntas literatura, autores literarios, obras literarias, movimientos literarios, trivia literatura, cultura general, bachillerato literatura',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Quiz de Literatura Universal | meskeIA',
    description: 'Pon a prueba tus conocimientos literarios: autores, obras, movimientos y citas en 3 niveles.',
    url: 'https://meskeia.com/quiz-literatura-universal',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Quiz de Literatura Universal | meskeIA',
    description: '50 preguntas de literatura universal en 3 niveles con explicaciones y puntuación.',
  },
  other: {
    'application-name': 'Quiz Literatura Universal meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Quiz de Literatura Universal',
  description: 'Quiz de literatura universal con 50 preguntas distribuidas en 3 niveles de dificultad. Categorías: autores, obras, movimientos literarios y citas célebres. Explicación educativa tras cada respuesta.',
  url: 'https://meskeia.com/quiz-literatura-universal/',
  category: 'EducationalApplication',
  features: [
    '50 preguntas de literatura universal curadas editorialmente',
    '3 niveles de dificultad: básico, medio y avanzado',
    '4 categorías: autores, obras, movimientos y citas',
    'Explicación educativa tras cada respuesta',
    'Selección aleatoria de 15 preguntas por partida',
    'Puntuación y evaluación final con feedback',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
  ],
});
