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
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué temas cubre el quiz de literatura universal?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El quiz incluye cuatro categorías: autores (quién escribió qué), obras (identificar títulos, personajes y argumentos), movimientos literarios (Romanticismo, Realismo, Modernismo, Vanguardias, etc.) y citas célebres. Abarca literatura occidental desde la Antigüedad griega hasta el siglo XX, con especial atención a los autores más estudiados en educación secundaria y universitaria.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuántas preguntas tiene el quiz y cuánto tiempo lleva completarlo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El banco de preguntas cuenta con 50 preguntas en total, pero cada partida selecciona aleatoriamente 15 de ellas. El quiz se puede completar en unos 10-15 minutos. Al finalizar recibes tu puntuación y una evaluación cualitativa de tu nivel.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para quién está pensado este quiz de literatura?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Es útil para estudiantes de secundaria y bachillerato que preparan exámenes de lengua y literatura, para universitarios de humanidades y filología, y para cualquier persona interesada en cultura general literaria. Los tres niveles de dificultad permiten que tanto principiantes como lectores avanzados encuentren un reto adecuado.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre los niveles básico, medio y avanzado?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El nivel básico se centra en obras y autores muy conocidos (Cervantes, Shakespeare, García Márquez) con preguntas directas. El nivel medio introduce movimientos literarios, contexto histórico y obras menos populares. El nivel avanzado requiere conocer detalles técnicos, citas precisas, obras secundarias de autores consagrados y conexiones entre corrientes literarias.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Hay explicación después de cada respuesta o solo la puntuación final?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Tras seleccionar tu respuesta en cada pregunta aparece inmediatamente una explicación educativa que contextualiza la respuesta correcta, ya sea que hayas acertado o fallado. Esto convierte el quiz en una herramienta de aprendizaje activo, no solo de evaluación.',
      },
    },
  ],
};
